"""Shared page layout for textbook-style Shorts (10 panels on one plate) and a JSON writer."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

# x, y, w, h of the ten panel slots (page is 1080 wide)
SLOTS = [
    (44, 176, 992, 500),
    (44, 698, 480, 400), (546, 698, 490, 400),
    (44, 1120, 310, 330), (376, 1120, 330, 330), (728, 1120, 308, 330),
    (44, 1472, 590, 380), (656, 1472, 380, 380),
    (44, 1874, 480, 320), (546, 1874, 490, 320),
]
PAGE_H = 2350


def panels(defs):
    """defs: list of (id, art, tone, fig, props, figPos) in slot order."""
    out = []
    for slot, d in zip(SLOTS, defs):
        pid, art, tone, fig = d[:4]
        props = d[4] if len(d) > 4 else None
        fig_pos = d[5] if len(d) > 5 else None
        p = {"id": pid, "x": slot[0], "y": slot[1], "w": slot[2], "h": slot[3], "tone": tone, "art": art}
        if fig:
            p["fig"] = fig
        if fig_pos:
            p["figPos"] = fig_pos
        if props:
            p["props"] = props
        out.append(p)
    return out


def scene(sid, say, camera, events=None, tone=None, hold=None, sfx=None, transition="cut"):
    s = {"id": sid, "say": say, "transition": transition}
    if tone:
        s["tone"] = tone
    if hold is not None:
        s["hold"] = hold
    v = {"type": "page", "camera": camera}
    if events:
        v["events"] = events
    if sfx:
        v["sfx"] = sfx
    s["visual"] = v
    return s


def write(ep):
    path = ROOT / "episodes" / f"{ep['id']}.json"
    path.write_text(json.dumps(ep, indent=2, ensure_ascii=False) + "\n")
    print("wrote", path.relative_to(ROOT))
