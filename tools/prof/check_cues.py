#!/usr/bin/env python3
"""Lists every word-cue used in an episode with the narration word it resolves to (and when), so mistakes show up before rendering.
    python3 tools/prof/check_cues.py p002-liking-gap
Needs the voice manifest (python3 tools/tts/voice.py <id>).  Cue grammar: word | word#2 | seconds | word+0.3 | start | shot.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
eid = sys.argv[1]
ep = json.load(open(ROOT / "episodes" / f"{eid}.json"))
man = {s["id"]: s for s in json.load(open(ROOT / "public" / "voice" / eid / "manifest.json"))["scenes"]}
norm = lambda s: re.sub(r"[^a-z0-9%]", "", s.lower())
CUE_KEYS = {"at", "out", "hitAt", "gapAt", "leftAt", "rightAt"}
bad = 0


def cues(o, path=""):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in CUE_KEYS and isinstance(v, (str, int, float)):
                yield path + k, v
            elif k in ("screens", "bar", "look", "dot", "tilt", "items", "bumps", "keys", "pupil") and isinstance(v, list):
                for it in v:
                    if isinstance(it, dict) and "at" in it:
                        yield path + k + ".at", it["at"]
                    if isinstance(it, dict):
                        yield from cues(it, path)
            elif k in ("buzz", "pulse", "punch", "shake") and isinstance(v, list):
                for c in v:
                    yield path + k, c
            else:
                yield from cues(v, path)
    elif isinstance(o, list):
        for it in o:
            yield from cues(it, path)


for sc in ep["scenes"]:
    words = man[sc["id"]]["words"]
    seen = []
    for key, c in cues(sc["visual"]):
        if c in (None, "", "shot", "start") or isinstance(c, (int, float)):
            continue
        m = re.match(r"^(.+?)([+-]\d*\.?\d+)$", c)
        word, off = (m.group(1), m.group(2)) if m else (c, "")
        if word in ("start", "shot"):
            continue
        w, _, nth = word.partition("#")
        hits = [x for x in words if norm(x["t"]).startswith(norm(w))]
        n = int(nth) if nth else 1
        if len(hits) < n:
            print(f"  !! {sc['id']}: cue '{c}' ({key}) matches nothing")
            bad += 1
            continue
        h = hits[n - 1]
        if (c, key) not in seen:
            seen.append((c, key))
            amb = f"  (also: {', '.join(x['t'] + '@%.2f' % x['s'] for x in hits[:3] if x is not h)})" if len(hits) > 1 and not nth else ""
            print(f"  {sc['id']:10s} {c:16s} -> '{h['t']}' @ {h['s']:.2f}s{amb}")
print("cue problems:", bad)
