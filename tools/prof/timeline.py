#!/usr/bin/env python3
"""Prints where each scene of an episode starts (seconds / frames), mirroring src/timing.ts for 'cut' scenes.
    python3 tools/prof/timeline.py p001-phantom-vibration
"""
import json, math, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FPS = 30
eid = sys.argv[1]
ep = json.load(open(ROOT / "episodes" / f"{eid}.json"))
tones = json.load(open(ROOT / "config" / "tones.json"))
man = {s["id"]: s for s in json.load(open(ROOT / "public" / "voice" / eid / "manifest.json"))["scenes"]}
t = 0
n = len(ep["scenes"])
for i, sc in enumerate(ep["scenes"]):
    last = i == n - 1
    lead = 0 if i == 0 else round(0.12 * FPS)
    tone = tones[sc.get("tone", ep["tone"])]
    out_room = (30 / FPS if last else 0) + 0.15
    hold = max(sc.get("hold", 0.5 if last else tone["pause"]), out_room)
    dur = math.ceil(max(1.2, lead / FPS + man[sc["id"]]["duration"] + hold) * FPS)
    print(f"{sc['id']:10s} start {t:5d}f ({t / FPS:6.2f}s)  len {dur:4d}f ({dur / FPS:5.2f}s)  lead {lead}")
    t += dur
print(f"TOTAL {t} frames = {t / FPS:.1f}s")
