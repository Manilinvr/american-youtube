#!/usr/bin/env python3
"""Cuts poses/faces from the Kling character sheets (assets/prof-source/kling-sheet-N.webp) into public/prof/k-*.png (+ k-*-s.png sticker).

    python3 tools/prof/assets2.py [--preview]

Boxes are pixel coordinates on the 2000x1507 sheets. Avoid the "KlingAI" watermark (bottom right of every sheet).
Names starting with "kbust" fade out at the bottom so a cropped torso does not end in a hard line.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).parent))
import assets as A  # noqa: E402

ROOT = A.ROOT
SRC = ROOT / "assets" / "prof-source"
S = 2  # sheets are already 2000 px wide, upscale less than the 1536 px ones

ITEMS = {
    # full body, white background (sheet 9)
    "kfull-walk": (9, (0, 745, 175, 1098)),
    "kfull-point": (9, (205, 745, 410, 1098)),
    "kfull-cross": (9, (440, 745, 610, 1098)),
    "kfull-stand": (9, (655, 745, 870, 1098)),
    "kfull-point2": (9, (1085, 745, 1295, 1098)),
    "kfull-pocket": (9, (1325, 745, 1545, 1098)),
    "kfull-walk2": (9, (1785, 745, 1995, 1098)),
    "kfull-point3": (9, (0, 35, 150, 408)),
    "kfull-offer": (9, (900, 55, 1125, 408)),
    "kfull-bag": (9, (1345, 55, 1565, 408)),
    # heads / busts
    "kbust-mug": (8, (20, 40, 375, 485)),
    "kbust-pen": (8, (1215, 40, 1580, 485)),
    "kbust-calm": (8, (1610, 40, 1985, 485)),
    "kbust-pen2": (6, (0, 40, 265, 378)),
    "kbust-pocket": (6, (600, 50, 800, 378)),
    "kbust-pocket2": (6, (1110, 40, 1350, 378)),
    "kbust-big-pen": (7, (545, 45, 840, 520)),
    "kbust-big-finger": (7, (1265, 45, 1560, 430)),
    "kbust-big-book": (7, (1600, 20, 1990, 520)),
    # sitting / lying
    "klying": (8, (20, 1200, 520, 1470)),
}


def bust_fade(im: Image.Image) -> Image.Image:
    a = np.asarray(im.getchannel("A")).astype(np.float32)
    h = a.shape[0]
    ramp = np.ones(h, dtype=np.float32)
    n = int(h * 0.12)
    ramp[-n:] = np.linspace(1, 0, n)
    out = im.copy()
    out.putalpha(Image.fromarray((a * ramp[:, None]).astype(np.uint8)))
    return out


def main() -> None:
    sheets = {}
    made = []
    for name, (n, box) in ITEMS.items():
        if n not in sheets:
            sheets[n] = Image.open(SRC / f"kling-sheet-{n}.webp").convert("RGB")
        crop = sheets[n].crop(box)
        A.S = S
        out = A.cut(crop)
        if name.startswith("kbust"):
            out = bust_fade(out)
        out.save(A.OUT / f"{name}.png", optimize=True)
        A.sticker(out, grow=9).save(A.OUT / f"{name}-s.png", optimize=True)
        made.append((name, out))
    print("wrote", len(made))
    if "--preview" in sys.argv:
        cell, cols = 250, 8
        rows = (len(made) + cols - 1) // cols
        sh = Image.new("RGB", (cols * cell, rows * (cell + 16)), (110, 140, 190))
        d = ImageDraw.Draw(sh)
        for i, (nm, im) in enumerate(made):
            t = im.copy()
            t.thumbnail((cell - 8, cell - 8))
            x, y = (i % cols) * cell, (i // cols) * (cell + 16)
            sh.paste(t, (x + 4, y + 4), t)
            d.text((x + 4, y + cell), nm, fill=(255, 255, 255))
        (ROOT / "out" / "kprev.png").parent.mkdir(exist_ok=True)
        sh.save(ROOT / "out" / "kprev.png")


if __name__ == "__main__":
    main()
