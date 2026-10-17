#!/usr/bin/env python3
"""Builds episodes/p001-phantom-vibration.json: narration + shot-by-shot motion design.

    python3 tools/episodes/p001.py

Coordinates are fractions of the 1080x1920 frame (x, y = centre of the layer; w = width / frame width).
Captions occupy y 0.66-0.76, so pictures live above 0.64 and source tags sit around y 0.80.
Cues ("buzzes", "68%", "there's#1", "phone+0.2") are words of the narration; layers that appear in
several shots carry the same explicit `at`, so they keep their state across the cut.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "episodes" / "p001-phantom-vibration.json"


def L(type, **kw):
    return {"type": type, **kw}


def img(src, x, y, w, **kw):
    return L("img", src=src, x=x, y=y, w=w, **kw)


def text(t, x, y, size, **kw):
    return L("text", text=t, x=x, y=y, size=size, **kw)


def chip(t, x, y, **kw):
    return L("chip", text=t, x=x, y=y, **kw)


def cite(t, at, y=0.8):
    return chip(t, 0.07, y, kind="cite", size=34, align="left", at=at, enter="left", sfx="blip", sfxVolume=0.2)


def shot(bg, layers, at=None, enter=None, cam=None, **kw):
    s = {"bg": bg, "layers": layers, **kw}
    if at is not None:
        s["at"] = at
    if enter:
        s["enter"] = enter
    if cam:
        s["cam"] = cam
    return s


scenes = {}

# --------------------------------------------------------------------------- hook
scenes["hook"] = [
    shot(
        "paper",
        [
            L("slab", color="accent", round=True, w=0.98, x=0.5, y=0.37, border=10, enter="pop", depth=0.6, delay=-0.3),
            L("bigword", text="BZZT", size=760, x=0.5, y=0.2, opacity=0.1, depth=0.4, drift=-0.6, enter="none"),
            img("body-pockets", 0.5, 0.375, 0.42, enter="pop", loop="breathe", buzz=["buzzes"], delay=-0.35),
            L("waves", x=0.5, y=0.44, w=0.92, at="buzzes", dur=44, strokeW=16, enter="none"),
            L("burst", text="BZZT!", x=0.79, y=0.17, w=0.36, at="buzzes", enter="slam", sfx="buzz", sfxVolume=0.4, seed=3),
        ],
        cam={"z": [1.0, 1.1], "y": [0.5, 0.45], "punch": ["buzzes"], "shake": ["buzzes"]},
    ),
    shot(
        "paper-grid",
        [
            L("slab", color="accent", w=1.4, h=0.34, x=0.5, y=0.33, rot=-6, depth=0.5, enter="none", at="grab"),
            L("phone", x=0.5, y=0.35, w=0.44, at="grab", enter="up", loop="float", screens=[{"at": "phone", "s": "lock"}, {"at": "And", "s": "empty"}], rot=-3),
            chip("PHONE CHECK", 0.5, 0.075, size=40, bg="ink", color="paper", at="grab", enter="down"),
        ],
        at="grab",
        enter="wipe-r",
        cam={"z": [1.0, 1.1], "keys": [{"at": "And", "z": 1.55, "x": 0.5, "y": 0.28, "secs": 0.9}]},
    ),
    shot(
        "ink",
        [
            text("NOTHING.", 0.5, 0.26, 270, color="accent", stroke="ink", strokeW=14, shadow="paper", enter="slam", sfx="hit"),
            img("face-skeptic", 0.5, 0.47, 0.5, at="nothing+0.2", enter="pop", rot=-3),
            L("scribble", shape="underline", x=0.5, y=0.355, w=0.72, h=0.05, color="paper", strokeW=12, at="nothing+0.3", outline=False),
        ],
        at="nothing",
        enter="punch",
        cam={"z": [1.0, 1.08], "shake": ["nothing"]},
    ),
]

# --------------------------------------------------------------------------- name
scenes["name"] = [
    shot(
        "accent",
        [
            img("body-point", 0.4, 0.37, 0.4, flip=True, enter="left", loop="breathe", sfx="whoosh"),
            text("?", 0.78, 0.22, 480, color="ink", rot=10, at="name", enter="pop"),
            L("burst", text="NEW\nWORD", x=0.82, y=0.5, w=0.3, at="called", enter="pop", rot=8, fill="paper", seed=7),
        ],
        cam={"z": [1.0, 1.08]},
    ),
    shot(
        "ink",
        [
            chip("TERM", 0.5, 0.1, size=42, bg="accent", color="ink", at="phantom", enter="down"),
            text("PHANTOM", 0.5, 0.24, 250, color="paper", at="phantom", enter="slam", sfx="hit"),
            text("VIBRATION", 0.5, 0.375, 214, color="accent", at="vibration", enter="slam", sfx="hit"),
            text("a buzz that never happened", 0.5, 0.5, 74, font="hand", color="soft", upper=False, at="vibration+0.25", enter="fade"),
            L("scribble", shape="underline", x=0.5, y=0.45, w=0.8, h=0.05, color="accent", strokeW=14, at="vibration+0.1", outline=False),
        ],
        at="phantom",
        enter="wipe-r",
        cam={"z": [1.05, 1.0]},
    ),
]

# --------------------------------------------------------------------------- stat1
_dots = L("dots", x=0.5, y=0.29, w=0.7, total=169, cols=13, hit=115, hitAt="68%", at="survey", step=0.2, hitStep=0.17, enter="none", id="d1")
_count68 = L("counter", to=68, suffix="%", x=0.5, y=0.575, size=250, color="ink", at="68%", dur=22, enter="slam", shadow="accent", sfx="hit", stroke="paper")
_label1 = chip("SURVEY: 169 HOSPITAL STAFF", 0.5, 0.062, size=38, bg="ink", color="paper", at="start", enter="down", out="had")
scenes["stat1"] = [
    shot(
        "paper-grid",
        [_label1, _dots, _count68, cite("Rothberg et al. · BMJ · 2010", "staff")],
        cam={"z": [1.0, 1.05], "punch": ["68%"]},
    ),
    shot(
        "paper-grid",
        [
            _label1,
            _dots,
            _count68,
            img("face-surprised", 0.78, 0.5, 0.28, at="had", enter="pop", rot=8),
            cite("Rothberg et al. · BMJ · 2010", "staff") | {"enter": "none"},
        ],
        at="had",
        enter="punch",
        cam={"z": [1.12, 1.2], "x": [0.5, 0.55], "y": [0.5, 0.5]},
    ),
]

# --------------------------------------------------------------------------- stat2
scenes["stat2"] = [
    shot(
        "ink",
        [
            L("counter", to=290, size=400, color="paper", x=0.5, y=0.17, at="start+0.25", dur=34, enter="none", stroke="ink", shadow="accent"),
            chip("COLLEGE STUDENTS", 0.5, 0.3, size=44, bg="accent", color="ink", at="college", enter="pop", sfx="blip"),
            L("panel", src="panel-lecture", x=0.5, y=0.47, w=0.8, at="college+0.1", enter="up", border=8, shadow=16, zoom=[1.02, 1.16], focus=[0.6, 0.5]),
            cite("Drouin et al. · 2012", "students"),
        ],
        cam={"z": [1.0, 1.06]},
    ),
    shot(
        "accent",
        [
            L("ring", x=0.5, y=0.3, w=0.66, value=89, at="89%", dur=26, enter="pop", track="paper"),
            L("counter", to=89, suffix="%", x=0.5, y=0.3, size=250, color="ink", at="89%", dur=26, enter="none", suffixScale=0.5),
            chip("HAD FELT ONE", 0.5, 0.53, size=44, bg="ink", color="paper", at="89%+0.5", enter="up", sfx="blip"),
            img("face-joy", 0.86, 0.12, 0.26, at="89%+0.35", enter="pop", rot=10),
        ],
        at="89%",
        enter="wipe-r",
        cam={"z": [1.0, 1.06], "punch": ["89%"]},
    ),
    shot(
        "paper-grid",
        [
            chip("TWO WEEKS", 0.5, 0.08, size=44, bg="ink", color="paper", at="About", enter="down"),
            L("calendar", x=0.5, y=0.27, w=0.86, days=14, hitDay=4, hitAt="once", at="About", enter="none"),
            text("≈ 1 BUZZ", 0.5, 0.5, 170, color="ink", mark="accent", at="every", enter="slam", sfx="hit"),
            text("PER 2 WEEKS", 0.5, 0.585, 100, color="graphite", at="weeks", enter="up"),
            L("waves", x=0.623, y=0.2355, w=0.28, at="once", dur=40, strokeW=9, enter="none"),
        ],
        at="About",
        enter="slide-u",
        cam={"z": [1.0, 1.06], "shake": ["once"]},
    ),
]

# --------------------------------------------------------------------------- twist
scenes["twist"] = [
    shot(
        "paper",
        [
            L("slab", color="soft", round=True, w=0.8, x=0.45, y=0.34, enter="pop", depth=0.6),
            L("phone", x=0.45, y=0.34, w=0.38, enter="up", rot=-5, loop="float", screens=[{"at": "shot", "s": "lock"}], buzz=["broken"]),
            text("?", 0.8, 0.2, 560, color="accent", stroke="ink", strokeW=18, rot=12, at="broken", enter="pop", sfx="blip"),
        ],
        cam={"z": [1.0, 1.08], "shake": ["broken"]},
    ),
    shot(
        "soft",
        [
            img("body-front", 0.5, 0.37, 0.27, enter="up"),
            L("scribble", shape="circle", x=0.5, y=0.5, w=0.36, h=0.22, color="accent", strokeW=18, at="leg", dur=12),
            chip("YOUR LEG?", 0.5, 0.1, size=46, bg="ink", color="paper", at="leg", enter="pop", sfx="blip"),
        ],
        at="Is#2",
        enter="slide-l",
        cam={"z": [1.0, 1.0], "keys": [{"at": "leg", "z": 1.35, "x": 0.5, "y": 0.52, "secs": 0.7}]},
    ),
    shot(
        "ink",
        [
            text("NEITHER.", 0.5, 0.27, 250, color="paper", stroke="ink", shadow="accent", at="Neither", enter="slam", sfx="hit"),
            L("scribble", shape="cross", x=0.5, y=0.27, w=0.78, h=0.2, color="accent", strokeW=20, at="Neither+0.2", dur=10, outline=False),
            img("face-calm", 0.5, 0.5, 0.42, at="Neither+0.2", enter="pop"),
        ],
        at="Neither",
        enter="flash",
        cam={"z": [1.0, 1.06], "punch": ["Neither"]},
    ),
    shot(
        "accent",
        [
            L("pulse", x=0.5, y=0.33, w=1.1, enter="none", color="ink"),
            img("brain", 0.5, 0.33, 0.6, enter="pop", loop="breathe", sfx="hit"),
            text("a guess", 0.5, 0.575, 190, font="hand", color="ink", upper=False, at="making", enter="pop", rot=-4),
            L("scribble", shape="underline", x=0.5, y=0.62, w=0.55, h=0.04, color="paper", strokeW=14, at="guess", outline=True),
        ],
        at="brain",
        enter="iris",
        irisAt=[0.5, 0.33],
        cam={"z": [1.0, 1.1]},
    ),
]

# --------------------------------------------------------------------------- signals
_graph1 = L("graph", id="g1", x=0.5, y=0.36, w=0.9, h=0.3, amp=0.16, speed=6, at=2.38, enter="up", bar=[{"at": 2.38, "v": 0.84}], barLabel="WHAT YOU NOTICE", bumps=[{"at": "seam", "h": 0.4}, {"at": "twitching", "h": 0.46}, {"at": "shift", "h": 0.38}], cross=False)
scenes["signals"] = [
    shot(
        "paper-grid",
        [
            L("pulse", x=0.5, y=0.38, w=1.15, enter="none", color="ink"),
            img("body-front", 0.5, 0.38, 0.28, enter="up", loop="breathe"),
            chip("TINY SIGNALS", 0.5, 0.075, size=44, bg="accent", color="ink", at="tiny", enter="pop", sfx="blip"),
        ],
        cam={"z": [1.0, 1.06], "y": [0.5, 0.5], "keys": [{"at": "tiny", "z": 1.32, "x": 0.5, "y": 0.28, "secs": 0.8}]},
    ),
    shot(
        "ink-grid",
        [
            _graph1,
            chip("A SEAM", 0.2, 0.135, size=38, bg="accent", color="ink", at="seam", enter="down", sfx="blip"),
            chip("A TWITCH", 0.5, 0.135, size=38, bg="accent", color="ink", at="twitching", enter="down", sfx="blip"),
            chip("FABRIC", 0.8, 0.135, size=38, bg="accent", color="ink", at="fabric", enter="down", sfx="blip"),
            img("face-calm", 0.85, 0.575, 0.2, at="seam", enter="pop", rot=6),
        ],
        at=2.38,
        enter="wipe-r",
        cam={"z": [1.0, 1.04]},
    ),
    shot(
        "ink-grid",
        [
            _graph1,
            text("IGNORED", 0.5, 0.56, 210, depth=0.2, color="accent", stroke="ink", strokeW=16, shadow="paper", at="ignores", enter="slam", rot=-6, sfx="hit"),
            chip("MOST OF THE TIME", 0.5, 0.15, size=40, bg="paper", color="ink", at="Most", enter="down", sfx="blip"),
        ],
        at="Most",
        enter="punch",
        cam={"z": [1.1, 1.18], "x": [0.7, 0.78], "y": [0.45, 0.45]},
    ),
]

# --------------------------------------------------------------------------- bar
_graph2 = L("graph", id="g2", x=0.5, y=0.34, w=0.9, h=0.34, amp=0.4, speed=6, seed=8, at="your#2", enter="up", bar=[{"at": "your#2", "v": 0.82}, {"at": "lowers", "v": 0.2}], barLabel="THE BAR", bumps=[])
scenes["bar"] = [
    shot(
        "paper",
        [
            img("face-thinking", 0.32, 0.4, 0.5, enter="left"),
            L("phone", x=0.76, y=0.37, w=0.3, enter="right", rot=6, loop="float", screens=[{"at": "shot", "s": "lock"}, {"at": "message", "s": "typing"}]),
            chip("WAITING FOR A MESSAGE", 0.5, 0.085, size=40, bg="ink", color="paper", at="expecting", enter="down", sfx="blip"),
        ],
        cam={"z": [1.0, 1.08]},
    ),
    shot(
        "ink-grid",
        [
            _graph2,
            L("scribble", shape="arrow", x=0.82, y=0.19, w=0.12, h=0.1, color="accent", strokeW=14, at="lowers", dur=10, rot=90, curve=0.0),
            chip("BAR DOWN", 0.5, 0.12, size=40, bg="accent", color="ink", at="lowers", enter="down", sfx="rise"),
        ],
        at="your#2",
        enter="wipe-l",
        cam={"z": [1.0, 1.08]},
    ),
    shot(
        "accent",
        [
            text("SIGNAL\nDETECTION", 0.5, 0.3, 250, color="ink", stroke="paper", strokeW=10, at="signal", enter="slam", sfx="hit"),
            chip("HOW RESEARCHERS DESCRIBE IT", 0.5, 0.52, size=36, bg="ink", color="paper", at="problem", enter="up"),
            cite("Kruger & Djerf · 2016", "problem"),
        ],
        at="signal",
        enter="flash",
        cam={"z": [1.0, 1.06], "punch": ["signal"]},
    ),
    shot(
        "ink-grid",
        [
            _graph2 | {"cross": True},
            chip("JUST A TWITCH", 0.3, 0.13, size=40, bg="paper", color="ink", at="twitch", enter="down", sfx="blip"),
            L("phone", x=0.84, y=0.13, w=0.14, at="buzz", enter="pop", screens=[{"at": "buzz", "s": "buzzing"}], buzz=["buzz"], rot=10),
            L("burst", text="BUZZ?", x=0.5, y=0.6, w=0.34, at="buzz", enter="slam", sfx="buzz", sfxVolume=0.35, seed=9),
        ],
        at="Lower#2",
        enter="wipe-r",
        cam={"z": [1.15, 1.3], "x": [0.65, 0.7], "y": [0.5, 0.48]},
    ),
]

# --------------------------------------------------------------------------- who
scenes["who"] = [
    shot(
        "ink",
        [
            L("counter", to=411, size=400, color="paper", x=0.5, y=0.17, at="start+0.3", dur=38, enter="none", stroke="ink", shadow="accent"),
            chip("STUDENTS", 0.5, 0.3, size=44, bg="accent", color="ink", at="students", enter="pop", sfx="blip"),
            L("panel", src="panel-laptop", x=0.5, y=0.47, w=0.62, at="students+0.1", enter="up", rot=2, border=8, shadow=16, zoom=[1.02, 1.12], focus=[0.5, 0.55]),
            cite("Kruger & Djerf · 2016", "411"),
        ],
        cam={"z": [1.0, 1.06]},
    ),
    shot(
        "paper",
        [
            img("face-thinking", 0.3, 0.3, 0.44, enter="left"),
            L("bubble", x=0.68, y=0.16, size=62, at="anxious", enter="pop", loop="float"),
            L("heart", x=0.74, y=0.38, w=0.24, at="close", enter="pop", pulse=["relationships"]),
            chip("MORE ANXIOUS", 0.5, 0.5, size=50, bg="accent", color="ink", at="anxious", enter="up", sfx="blip"),
            chip("IN CLOSE RELATIONSHIPS", 0.5, 0.58, size=40, bg="ink", color="paper", at="relationships", enter="up", sfx="blip"),
        ],
        at="people",
        enter="slide-l",
        cam={"z": [1.0, 1.06]},
    ),
    shot(
        "accent",
        [
            L("waves", x=0.5, y=0.33, w=1.05, at="phantom", dur=140, strokeW=18, enter="none"),
            L("phone", x=0.5, y=0.33, w=0.36, enter="up", screens=[{"at": "shot", "s": "lock"}, {"at": "phantom", "s": "buzzing"}], buzz=["phantom", "rings", "buzzes"]),
            L("burst", text="RING!", x=0.18, y=0.17, w=0.3, at="rings", enter="slam", rot=-10, fill="paper", seed=2, sfx="ding", sfxVolume=0.25),
            L("burst", text="BZZT!", x=0.83, y=0.5, w=0.3, at="buzzes", enter="slam", rot=8, seed=5, sfx="buzz", sfxVolume=0.35),
            chip("PHANTOM RINGS + BUZZES", 0.5, 0.08, size=38, bg="ink", color="paper", at="phantom", enter="down"),
        ],
        at="reported",
        enter="wipe-r",
        cam={"z": [1.0, 1.08], "shake": ["rings", "buzzes"]},
    ),
    shot(
        "ink-grid",
        [
            L("phone", x=0.26, y=0.37, w=0.3, enter="left", rot=-6, loop="float", screens=[{"at": "shot", "s": "lock"}]),
            img("face-thinking", 0.74, 0.4, 0.46, enter="right"),
            chip("EXPECTING A CALL", 0.5, 0.1, size=42, bg="accent", color="ink", at="waiting", enter="down", sfx="blip"),
            L("burst", text="MORE\nBUZZES", x=0.5, y=0.59, w=0.4, at="call", enter="slam", sfx="hit", seed=4),
        ],
        at="Especially",
        enter="punch",
        cam={"z": [1.0, 1.08], "punch": ["call"]},
    ),
]

# --------------------------------------------------------------------------- relief
scenes["relief"] = [
    shot(
        "accent",
        [
            chip("GOOD NEWS", 0.5, 0.075, size=46, bg="ink", color="paper", at="good", enter="pop", sfx="blip"),
            L("panel", src="panel-armchair", x=0.5, y=0.34, w=0.86, enter="up", rot=-1.5, zoom=[1.02, 1.14], focus=[0.4, 0.5]),
            chip("BARELY BOTHERED", 0.5, 0.6, size=46, bg="ink", color="paper", at="barely", enter="up", sfx="blip"),
            cite("Deb · 2015 · review", "Most", y=0.8),
        ],
        cam={"z": [1.0, 1.05]},
    ),
    shot(
        "paper",
        [
            img("body-front", 0.3, 0.38, 0.25, enter="up"),
            L("scribble", shape="arrow", x=0.52, y=0.3, w=0.2, h=0.12, color="accent", strokeW=16, at="somewhere", dur=12),
            img("prop-backpack", 0.74, 0.38, 0.3, at="somewhere", enter="right", loop="bob", sfx="pop"),
            chip("MOVE THE PHONE", 0.5, 0.1, size=44, bg="ink", color="paper", at="carrying", enter="down", sfx="blip"),
        ],
        at="Some",
        enter="slide-l",
        cam={"z": [1.0, 1.06]},
    ),
    shot(
        "ink",
        [
            chip("BEFORE", 0.22, 0.09, size=36, bg="paper", color="ink", at="shot", enter="down"),
            L("wave", x=0.5, y=0.2, w=0.82, pulses=False, enter="none", at="shot"),
            chip("AFTER", 0.2, 0.37, size=36, bg="accent", color="ink", at="changing", enter="down", sfx="blip"),
            L("wave", x=0.5, y=0.48, w=0.82, pulses=True, at="changing+0.1", enter="none", color="paper"),
            text("different pattern", 0.5, 0.585, 90, font="hand", color="accent", upper=False, at="vibration", enter="pop", rot=-2),
        ],
        at="changing",
        enter="wipe-r",
        cam={"z": [1.0, 1.05]},
    ),
]

# --------------------------------------------------------------------------- close
scenes["close"] = [
    shot(
        {"photo": "bg-city", "blur": 8, "bright": 0.7, "dim": 0.2},
        [
            img("body-walk", 0.5, 0.4, 0.34, enter="left", loop="bob", buzz=["buzzes"]),
            L("waves", x=0.5, y=0.45, w=0.95, at="buzzes", dur=44, strokeW=14, color="paper", enter="none"),
            L("burst", text="BZZT", x=0.74, y=0.15, w=0.3, at="buzzes", enter="slam", seed=3, sfx="buzz", sfxVolume=0.3),
        ],
        cam={"z": [1.0, 1.1]},
    ),
    shot(
        {"photo": "bg-city", "blur": 8, "bright": 0.7, "dim": 0.2},
        [
            img("face-shock", 0.46, 0.38, 0.58, enter="pop"),
            text("?", 0.82, 0.2, 380, color="accent", stroke="ink", strokeW=16, rot=10, at="there", enter="pop", sfx="blip"),
        ],
        at="nothing's",
        enter="punch",
        cam={"z": [1.0, 1.08]},
    ),
    shot(
        "ink",
        [
            text("NOT A\nGLITCH.", 0.5, 0.3, 270, color="paper", at="not#2", enter="slam", sfx="hit"),
            L("scribble", shape="strike", x=0.5, y=0.39, w=0.78, h=0.06, color="accent", strokeW=24, at="glitch", dur=9, outline=False),
        ],
        at="that's",
        enter="flash",
        cam={"z": [1.0, 1.06], "punch": ["not#2"]},
    ),
    shot(
        "accent",
        [
            L("pulse", x=0.28, y=0.34, w=0.8, enter="none", color="ink"),
            img("brain", 0.28, 0.34, 0.44, enter="pop", loop="breathe"),
            L("scribble", shape="arrow", x=0.5, y=0.33, w=0.14, h=0.1, color="paper", strokeW=14, at="listening", dur=12),
            L("heart", x=0.72, y=0.34, w=0.26, at="people", enter="pop", pulse=["matter"], sfx="pop"),
            text("listening", 0.5, 0.56, 170, font="hand", color="ink", upper=False, at="listening", enter="pop", rot=-3),
        ],
        at="that's#2",
        enter="iris",
        irisAt=[0.3, 0.34],
        cam={"z": [1.0, 1.1]},
    ),
]

# --------------------------------------------------------------------------- outro
scenes["outro"] = [
    shot(
        "paper",
        [
            L("panel", src="panel-board", x=0.5, y=0.265, w=0.86, enter="up", zoom=[1.02, 1.12], focus=[0.62, 0.5]),
            text("THE PROFESSOR", 0.5, 0.55, 170, color="ink", mark="accent", at="Professor", enter="slam", sfx="hit"),
            chip("EVERYDAY PSYCHOLOGY", 0.5, 0.61, size=34, bg="ink", color="paper", at="See", enter="up"),
        ],
        cam={"z": [1.0, 1.04]},
    ),
]

ep = json.loads(OUT.read_text())
for sc in ep["scenes"]:
    sc["visual"] = {"type": "prof", "shots": scenes[sc["id"]]}
OUT.write_text(json.dumps(ep, indent="\t", ensure_ascii=False) + "\n")
print("scenes:", len(ep["scenes"]), "shots:", sum(len(s) for s in scenes.values()))
