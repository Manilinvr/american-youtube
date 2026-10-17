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


# ---- hook templates (vary the first seconds from video to video) ------------------------------------------------
def hook_number(num, unit, caption, at="start"):
    """Opens on a big counted number: hook_number(71, 'STUDIES', 'WHAT THEY FOUND')."""
    return shot("ink", [
        L("counter", to=num, size=520, color="paper", x=0.5, y=0.2, at=at, dur=24, enter="none", stroke="ink", shadow="accent", delay=-0.3),
        chip(unit, 0.5, 0.4, size=50, bg="accent", color="ink", at=at, enter="up", sfx="blip"),
        tag(caption),
    ], cam={"z": [1.0, 1.08]})


def hook_quote(text, by=None, at="start"):
    """Opens on a pull quote card over a ticker band."""
    return shot("accent", [
        L("ticker", text=text.split("\n")[0], x=0.5, y=0.1, size=60, bg="ink", color="accent", tilt=-5, speed=10, enter="none", at=at, delay=-0.3),
        L("quote", text=text, by=by, x=0.5, y=0.33, w=0.88, size=84, at=at, enter="pop", delay=-0.3),
    ], cam={"z": [1.0, 1.08]})


def hook_versus(left, right, winner=None, at="start"):
    """Opens on two sides: hook_versus({'title':'YOU','text':'THINK'}, {'title':'SCIENCE','text':'SAYS'})."""
    return shot("paper-grid", [
        L("versus", left=left, right=right, winner=winner, winAt="start+1.5", x=0.5, y=0.3, w=0.92, size=52, enter="none", at=at, delay=-0.3),
    ], cam={"z": [1.0, 1.08]})


def hook_countdown(n=3, caption="", at="start"):
    """Opens on a 3-2-1 countdown."""
    return shot("accent", [
        L("countdown", **{"from": n}, x=0.5, y=0.28, size=560, at=at, enter="none", delay=-0.2, step=0.6),
        tag(caption, bg="ink"),
    ], cam={"z": [1.0, 1.1]})
