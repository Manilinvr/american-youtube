#!/usr/bin/env python3
"""Contact sheet of rendered stills.   python3 tools/prof/sheet.py p001-phantom-vibration 8 28 50 [--cols=6] [--w=360]"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
args = [a for a in sys.argv[1:] if not a.startswith("--")]
opt = {a[2:].split("=")[0]: a.split("=")[1] for a in sys.argv[1:] if a.startswith("--") and "=" in a}
eid, frames = args[0], [int(f) for f in args[1:]]
cols, w = int(opt.get("cols", 6)), int(opt.get("w", 360))
ims = []
for f in frames:
    im = Image.open(ROOT / "out" / "stills" / eid / f"f{f:05d}.png").convert("RGB")
    h = round(im.height * w / im.width)
    ims.append((f, im.resize((w, h), Image.LANCZOS)))
h = ims[0][1].height
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * (h + 20)), (30, 30, 30))
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(ims):
    x, y = (i % cols) * w, (i // cols) * (h + 20)
    sheet.paste(im, (x, y + 20))
    d.text((x + 6, y + 4), f"frame {f}  ({f/30:.2f}s)", fill=(255, 255, 255))
out = ROOT / "out" / f"sheet-{eid}.png"
sheet.save(out)
print(out, sheet.size)
