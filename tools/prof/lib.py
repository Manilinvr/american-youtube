"""Shared helpers for Professor-style episode scripts (tools/episodes/pNNN.py).

    from prof.lib import *        # (run scripts with: python3 tools/episodes/p002.py)

Coordinates are fractions of the 1080x1920 frame; captions sit at y 0.66-0.76, source tags at y 0.80.
See docs/professor-style.md for every layer and option.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))


def L(type, **kw):
    return {"type": type, **kw}


def img(src, x, y, w, **kw):
    return L("img", src=src, x=x, y=y, w=w, **kw)


def text(t, x, y, size, **kw):
    return L("text", text=t, x=x, y=y, size=size, **kw)


def chip(t, x, y, **kw):
    return L("chip", text=t, x=x, y=y, **kw)


def cite(t, at, y=0.835, **kw):
    return chip(t, 0.07, y, kind="cite", size=32, align="left", at=at, enter="left", sfx="blip", sfxVolume=0.2, **kw)


def shot(bg, layers, at=None, enter=None, cam=None, **kw):
    s = {"bg": bg, "layers": layers, **kw}
    if at is not None:
        s["at"] = at
    if enter:
        s["enter"] = enter
    if cam:
        s["cam"] = cam
    return s


def scene(id, say, shots, tone=None, enter=None):
    d = {"id": id, "say": say, "transition": "cut", "visual": {"type": "prof", "shots": shots}}
    if tone:
        d["tone"] = tone
    if enter:
        d["visual"]["enter"] = enter
    return d


OUTRO = scene(
    "outro",
    "I'm the Professor. See you in the next lesson.",
    [
        shot(
            "paper",
            [
                L("panel", src="panel-board", x=0.5, y=0.265, w=0.86, enter="up", zoom=[1.02, 1.12], focus=[0.62, 0.5]),
                text("THE PROFESSOR", 0.5, 0.55, 170, color="ink", mark="accent", at="Professor", enter="slam", sfx="hit"),
                chip("EVERYDAY PSYCHOLOGY", 0.5, 0.61, size=34, bg="ink", color="paper", at="See", enter="up"),
            ],
            cam={"z": [1.0, 1.04]},
        )
    ],
)


def build(eid, title, music, sources, scenes, tone="prof"):
    """Writes episodes/<eid>.json (keeps nothing from an older file: the script is the single source)."""
    ep = {"id": eid, "format": "short", "style": "prof", "title": title, "tone": tone, "music": music, "sources": sources, "scenes": scenes}
    out = ROOT / "episodes" / f"{eid}.json"
    out.write_text(json.dumps(ep, indent="\t", ensure_ascii=False) + "\n")
    print(f"{eid}: {len(scenes)} scenes, {sum(len(s['visual']['shots']) for s in scenes)} shots")


# ---- helpers for the "reasoning" format (p012+) -----------------------------------------------------------------
def tag(label, bg="ink", color="paper", at="start", **kw):
    """Small label at the top of a shot."""
    return chip(label, 0.5, 0.075, size=34, bg=bg, color=color, at=at, enter="down", **kw)


def big(t, size=250, y=0.27, at=None, color="ink", **kw):
    """Big slammed headline (use \\n for two lines)."""
    d = dict(color=color, enter="slam", sfx="hit")
    d.update(kw)
    if at is not None:
        d["at"] = at
    return text(t, 0.5, y, size, **d)


def face_shot(bg, src, label=None, at=None, enter=None, w=0.46, y=0.38, extra=None, cam=None, **kw):
    """A shot with the professor (a cut-out) and an optional label chip."""
    layers = [img(src, 0.5, y, w, enter="pop", delay=-0.2)]
    if label:
        layers.append(tag(label, **kw))
    layers += extra or []
    return shot(bg, layers, at=at, enter=enter, cam=cam or {"z": [1.0, 1.06]})


def slam_shot(bg, t, size=250, at=None, enter="punch", sub=None, face=None, color="ink", **kw):
    """Headline slam with an optional sub-chip and a reaction face under it."""
    layers = [big(t, size=size, color=color, **({"at": at} if at is not None else {}))]
    if sub:
        layers.append(chip(sub, 0.5, 0.46, size=40, bg="paper" if bg.startswith("ink") else "ink", color="ink" if bg.startswith("ink") else "paper", at=at or "start", enter="up", sfx="blip"))
    if face:
        layers.append(img(face, 0.5, 0.58, 0.3, at=at or "start", enter="pop", rot=-4))
    return shot(bg, layers, at=at, enter=enter, cam={"z": [1.0, 1.07], **({"punch": [at]} if at else {})})
