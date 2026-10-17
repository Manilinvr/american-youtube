#!/usr/bin/env python3
"""Cuts the professor's poses, faces, props and background panels out of the two character sheets
(assets/prof-source/sheet-a.webp, sheet-b.webp) into transparent PNGs in public/prof/.

    python3 tools/prof/assets.py            # build all
    python3 tools/prof/assets.py --preview  # also write out/prof-preview.png (contact sheet)

Cut-outs: crop -> 4x Lanczos -> sharpen + line contrast -> flood-fill the paper from the border
(white eyes and shoe soles inside the outline stay opaque) -> soft anti-aliased edge.
Panels ("rect") keep their background and only get rounded corners.
All boxes are in the pixel coordinates of the 1536x1024 sheets.
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets" / "prof-source"
OUT = ROOT / "public" / "prof"
SHEETS = {"a": Image.open(SRC / "sheet-a.webp").convert("RGB"), "b": Image.open(SRC / "sheet-b.webp").convert("RGB")}
S = 4  # upscale

# name: (sheet, (x0, y0, x1, y1), mode)   mode: cut = remove paper, rect = keep panel
ITEMS: dict[str, tuple[str, tuple[int, int, int, int], str]] = {
    # --- faces, sheet A (small, used for reaction inserts)
    "face-calm": ("a", (208, 30, 284, 124), "cut"),
    "face-smile": ("a", (292, 30, 368, 124), "cut"),
    "face-serious": ("a", (374, 30, 450, 124), "cut"),
    "face-surprised": ("a", (455, 30, 531, 124), "cut"),
    "face-thinking": ("a", (537, 30, 613, 124), "cut"),
    "face-annoyed": ("a", (622, 30, 700, 124), "cut"),
    "face-laugh": ("a", (208, 148, 284, 240), "cut"),
    "face-tired": ("a", (292, 148, 368, 240), "cut"),
    "face-angry": ("a", (374, 148, 450, 240), "cut"),
    "face-shock": ("a", (455, 148, 531, 240), "cut"),
    "face-joy": ("a", (540, 148, 618, 240), "cut"),
    "face-skeptic": ("a", (625, 148, 703, 240), "cut"),
    # --- full-body, sheet A
    "body-front": ("a", (46, 292, 160, 642), "cut"),
    "body-side": ("a", (170, 292, 252, 642), "cut"),
    "body-back": ("a", (268, 292, 372, 642), "cut"),
    "body-34": ("a", (398, 292, 488, 642), "cut"),
    "body-coffee": ("a", (672, 300, 758, 522), "cut"),
    "body-walk": ("a", (786, 300, 902, 522), "cut"),
    "body-point": ("a", (908, 300, 1022, 522), "cut"),
    "body-book": ("a", (1052, 300, 1140, 522), "cut"),
        "body-gesture": ("a", (1080, 540, 1182, 733), "cut"),
    "body-pockets": ("a", (980, 540, 1068, 733), "cut"),
    # --- props, sheet A
    "prop-laptop": ("a", (974, 784, 1062, 860), "cut"),
    "prop-mug": ("a", (1074, 780, 1132, 834), "cut"),
    "prop-books": ("a", (1138, 778, 1202, 830), "cut"),
    "prop-notebook": ("a", (1064, 836, 1150, 888), "cut"),
    "prop-pen": ("a", (1150, 828, 1198, 878), "cut"),
    "prop-backpack": ("a", (976, 866, 1060, 968), "cut"),
    "prop-cap": ("a", (1064, 898, 1134, 954), "cut"),
    "prop-headphones": ("a", (1132, 886, 1208, 974), "cut"),
    "brain": ("a", (104, 140, 172, 202), "cut"),
    # --- panels, sheet B (inset to drop the black frame)
    "panel-board": ("b", (14, 16, 421, 364), "rect"),
    "panel-thinking": ("b", (281, 656, 496, 858), "rect"),
    "panel-armchair": ("b", (14, 379, 293, 644), "rect"),
    "panel-laptop": ("b", (741, 377, 968, 644), "rect"),
    "panel-sofa": ("b", (991, 390, 1234, 626), "rect"),
    "panel-street": ("b", (14, 656, 266, 858), "rect"),
    "panel-window": ("b", (847, 656, 1101, 858), "rect"),
    "panel-lecture": ("b", (512, 656, 836, 858), "rect"),
    "panel-walk": ("b", (591, 377, 731, 644), "rect"),
    # backgrounds, sheet A (bottom right)
    "bg-classroom": ("a", (1242, 788, 1358, 866), "rect"),
    "bg-city": ("a", (1381, 788, 1510, 864), "rect"),
    "bg-livingroom": ("a", (1242, 878, 1358, 972), "rect"),
    "bg-window": ("a", (1381, 878, 1510, 972), "rect"),
}

# painted over the Russian chalk title on panel-board so the English title can be set there
REPAINT = {"panel-board": [((36, 52, 232, 140), "chalk")]}


def sharpen(img: Image.Image) -> Image.Image:
    img = img.filter(ImageFilter.UnsharpMask(radius=2.2, percent=170, threshold=2))
    # line contrast: deepen darks, lift paper (keeps greys of the fills)
    arr = np.asarray(img).astype(np.float32) / 255
    arr = np.clip((arr - 0.06) / 0.88, 0, 1)
    arr = arr * arr * (3 - 2 * arr) * 0.55 + arr * 0.45
    return Image.fromarray((arr * 255).astype(np.uint8))


def paper_mask(rgb: Image.Image) -> Image.Image:
    """255 where the pixel is paper-like AND connected to the crop border (own flood fill)."""
    arr = np.asarray(rgb).astype(int)
    light = (arr.min(axis=2) > 196) & ((arr.max(axis=2) - arr.min(axis=2)) < 34)
    h, w = light.shape
    flat = light.ravel()
    seen = bytearray(h * w)
    stack = []
    for x in range(w):
        for y in (0, h - 1):
            stack.append(y * w + x)
    for y in range(h):
        for x in (0, w - 1):
            stack.append(y * w + x)
    stack = [i for i in stack if flat[i]]
    for i in stack:
        seen[i] = 1
    while stack:
        i = stack.pop()
        y, x = divmod(i, w)
        for j, ok in ((i - 1, x > 0), (i + 1, x < w - 1), (i - w, y > 0), (i + w, y < h - 1)):
            if ok and flat[j] and not seen[j]:
                seen[j] = 1
                stack.append(j)
    return Image.fromarray((np.frombuffer(bytes(seen), dtype=np.uint8).reshape(h, w) * 255).astype(np.uint8))


def cut(img: Image.Image) -> Image.Image:
    big = img.resize((img.width * S, img.height * S), Image.LANCZOS)
    big = sharpen(big.convert("L")).convert("RGB") if False else Image.merge("RGB", [sharpen(c) for c in big.split()])
    bg = paper_mask(big)
    fg = ImageChops.invert(bg)
    fg = fg.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.1))
    fg = fg.point(lambda v: max(0, min(255, int((v - 90) * 255 / 110))))
    out = big.convert("RGBA")
    out.putalpha(fg)
    bbox = fg.point(lambda v: 255 if v > 40 else 0).getbbox()
    return out.crop(bbox) if bbox else out


def sticker(img: Image.Image, grow: int = 13) -> Image.Image:
    """Paper-white outline around the cut-out (like a die-cut sticker), baked into the PNG."""
    a = img.getchannel("A")
    pad = grow * 3
    canvas = Image.new("L", (img.width + pad * 2, img.height + pad * 2), 0)
    canvas.paste(a, (pad, pad))
    halo = canvas.filter(ImageFilter.GaussianBlur(grow)).point(lambda v: 255 if v > 14 else 0).filter(ImageFilter.GaussianBlur(1.2))
    out = Image.new("RGBA", canvas.size, (251, 250, 246, 0))
    out.putalpha(halo)
    base = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    base.paste(img, (pad, pad))
    out.alpha_composite(base)
    return out


def rect(img: Image.Image) -> Image.Image:
    big = img.resize((img.width * S, img.height * S), Image.LANCZOS)
    big = Image.merge("RGB", [sharpen(c) for c in big.split()]).convert("RGBA")
    m = Image.new("L", big.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, big.width - 1, big.height - 1), radius=14 * S // 2, fill=255)
    big.putalpha(m)
    return big


def repaint(img: Image.Image, boxes) -> Image.Image:
    img = img.copy()
    d = ImageDraw.Draw(img)
    for (x0, y0, x1, y1), _ in boxes:
        d.rectangle((x0, y0, x1, y1), fill=(52, 52, 51))
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    made: list[tuple[str, Image.Image]] = []
    for name, (sheet, box, mode) in ITEMS.items():
        base = SHEETS[sheet]
        if name in REPAINT:
            base = repaint(base, [((x0 - 0, y0 - 0, x1, y1), k) for (x0, y0, x1, y1), k in REPAINT[name]])
        crop = base.crop(box)
        out = cut(crop) if mode == "cut" else rect(crop)
        out.save(OUT / f"{name}.png", optimize=True)
        if mode == "cut":
            sticker(out).save(OUT / f"{name}-s.png", optimize=True)
        made.append((name, out))
    print(f"wrote {len(made)} images to {OUT}")
    if "--preview" in sys.argv:
        cell = 260
        cols = 8
        rows = (len(made) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * cell, rows * (cell + 18)), (120, 150, 190))
        d = ImageDraw.Draw(sheet)
        for i, (name, im) in enumerate(made):
            t = im.copy()
            t.thumbnail((cell - 10, cell - 10))
            x, y = (i % cols) * cell, (i // cols) * (cell + 18)
            sheet.paste(t, (x + 5, y + 5), t)
            d.text((x + 5, y + cell), name, fill=(255, 255, 255))
        (ROOT / "out").mkdir(exist_ok=True)
        sheet.save(ROOT / "out" / "prof-preview.png")


if __name__ == "__main__":
    main()
