#!/usr/bin/env python3
"""Flags shots longer than N seconds (default 3.2) so no picture stays static: python3 tools/prof/cadence.py <id> [max_secs]"""
import json, math, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FPS = 30
eid = sys.argv[1]
mx = float(sys.argv[2]) if len(sys.argv) > 2 else 3.2
ep = json.load(open(ROOT / "episodes" / f"{eid}.json"))
man = {s["id"]: s for s in json.load(open(ROOT / "public" / "voice" / eid / "manifest.json"))["scenes"]}
tones = json.load(open(ROOT / "config" / "tones.json"))
norm = lambda s: re.sub(r"[^a-z0-9%]", "", s.lower())
def cue(sc, c):
    words = man[sc["id"]]["words"]
    if isinstance(c, (int, float)): return c
    m = re.match(r"^(.+?)([+-]\d*\.?\d+)$", c); word, off = (m.group(1), float(m.group(2))) if m else (c, 0)
    w, _, nth = word.partition("#"); hits = [x for x in words if norm(x["t"]).startswith(norm(w))]
    n = int(nth) if nth else 1
    return hits[n - 1]["s"] + off if len(hits) >= n else None
bad = 0
for i, sc in enumerate(ep["scenes"]):
    dur = man[sc["id"]]["duration"] + 0.12 + tones[sc.get("tone", ep["tone"])]["pause"]
    starts = [0.0]
    for sh in sc["visual"]["shots"][1:]:
        c = cue(sc, sh.get("at")) if sh.get("at") is not None else None
        starts.append(max(c if c is not None else starts[-1] + 1, starts[-1] + 0.17))
    ends = starts[1:] + [dur]
    for k, (a, b) in enumerate(zip(starts, ends)):
        if b - a > mx:
            bad += 1
            print(f"  {sc['id']:12s} shot {k+1}: {b-a:4.1f}s long (at {a:4.1f}s of {dur:4.1f}s)")
print("long shots:", bad)
