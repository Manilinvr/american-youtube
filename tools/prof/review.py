#!/usr/bin/env python3
"""Renders stills every N frames of an episode and builds contact sheets of 24 (out/review-<id>-<k>.png).
    python3 tools/prof/review.py p002-liking-gap [step=30] [scale=0.3]
"""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
eid = sys.argv[1]
step = int(sys.argv[2]) if len(sys.argv) > 2 else 30
scale = sys.argv[3] if len(sys.argv) > 3 else "0.3"
out = subprocess.run([sys.executable, str(ROOT / "tools/prof/timeline.py"), eid], capture_output=True, text=True).stdout
total = int(out.strip().splitlines()[-1].split()[1])
frames = list(range(0, total - 3, step))
subprocess.run(["node", "tools/stills.mjs", eid, *map(str, frames), f"--scale={scale}", "--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"], cwd=ROOT, capture_output=True)
for k in range(0, len(frames), 24):
    chunk = frames[k : k + 24]
    subprocess.run([sys.executable, str(ROOT / "tools/prof/sheet.py"), eid, *map(str, chunk), "--cols=8", "--w=250"], cwd=ROOT, capture_output=True)
    (ROOT / "out" / f"review-{eid}-{k // 24}.png").write_bytes((ROOT / "out" / f"sheet-{eid}.png").read_bytes())
    print(f"out/review-{eid}-{k // 24}.png  frames {chunk[0]}-{chunk[-1]}")
