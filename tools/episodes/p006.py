#!/usr/bin/env python3
"""p006: Why 'Maybe' Feels Worse Than Bad News  (de Berker et al. 2016, Nature Communications).

Cautious by design: one lab study (45 people, mild electric shocks), so the script says it is a lab game and not a text message.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403

CITE = "de Berker et al. · 2016"

scenes = [
    scene(
        "hook",
        "You sent the text. It says 'read.' No reply. And your brain starts writing every possible *ending*.",
        [
            shot(
                "paper",
                [
                    L("slab", color="accent", round=True, w=0.92, x=0.5, y=0.34, border=10, enter="pop", depth=0.6, delay=-0.3),
                    L("phone", x=0.5, y=0.35, w=0.4, enter="pop", delay=-0.3, screens=[{"at": -0.4, "s": "read"}], rot=-3, loop="float"),
                ],
                cam={"z": [1.0, 1.1], "y": [0.5, 0.4]},
            ),
            shot(
                "ink-grid",
                [
                    img("face-thinking", 0.5, 0.42, 0.46, enter="pop"),
                    L("bubble", text="They're mad.", x=0.3, y=0.11, size=46, at="brain", enter="pop", rot=-3, sfx="pop"),
                    L("bubble", text="Busy?", x=0.74, y=0.2, size=46, at="starts", enter="pop", rot=3, sfx="pop"),
                    L("bubble", text="Dead battery?", x=0.34, y=0.27, size=46, at="writing", enter="pop", rot=-2, sfx="pop"),
                    L("bubble", text="Ghosted.", x=0.76, y=0.34, size=46, at="possible", enter="pop", rot=4, sfx="pop"),
                ],
                at="brain",
                enter="wipe-r",
                cam={"z": [1.0, 1.08]},
            ),
        ],
    ),
    scene(
        "game",
        "Scientists wanted to measure that feeling. So they turned it into a *game*.",
        [
            shot(
                "accent",
                [
                    L("panel", src="panel-laptop", x=0.5, y=0.3, w=0.78, enter="up", rot=-2, zoom=[1.02, 1.14], focus=[0.5, 0.55]),
                    chip("A LAB EXPERIMENT", 0.5, 0.075, size=42, bg="ink", color="paper", at="Scientists", enter="down", sfx="blip"),
                    text("GAME", 0.5, 0.57, 220, color="ink", stroke="paper", strokeW=10, at="game", enter="slam", sfx="hit"),
                ],
                cam={"z": [1.0, 1.06]},
            )
        ],
    ),
    scene(
        "rules",
        "You turn over rocks. Under some, there might be a snake. If there is, you get a mild electric *shock*.",
        [
            shot(
                "paper-grid",
                [
                    chip("TURN OVER A ROCK", 0.5, 0.085, size=44, bg="ink", color="paper", at="rocks", enter="down", sfx="blip"),
                    L("rocks", x=0.5, y=0.3, w=0.9, items=[{"at": "snake", "snake": True}, {"at": "shock", "snake": True, "shock": True}, {}], enter="none", at="turn"),
                ],
                cam={"z": [1.0, 1.06], "shake": ["shock"]},
            ),
            shot(
                "ink",
                [
                    chip("A MILD ELECTRIC SHOCK", 0.5, 0.085, size=44, bg="accent", color="ink", at="mild", enter="down", sfx="blip"),
                    L("rocks", x=0.5, y=0.3, w=0.9, items=[{"at": "snake", "snake": True}, {"at": "shock", "snake": True, "shock": True}, {}], enter="none", at="turn"),
                    cite(CITE, "mild"),
                ],
                at="If",
                enter="flash",
                cam={"z": [1.0, 1.08], "shake": ["shock"]},
            ),
        ],
    ),
    scene(
        "odds",
        "The researchers changed the odds. Sometimes a snake was impossible. Sometimes certain. Sometimes a coin flip.",
        [
            shot(
                "paper",
                [
                    chip("THEY CHANGED THE ODDS", 0.5, 0.075, size=40, bg="ink", color="paper", at="start", enter="down"),
                    L("rocks", x=0.5, y=0.2, w=0.9, items=[{}, {}, {}], enter="none", at="start", delay=-0.3),
                    text("0%", 0.5, 0.33, 280, color="ink", at="impossible", enter="slam", sfx="hit"),
                    chip("IMPOSSIBLE", 0.5, 0.46, size=34, bg="white", color="ink", at="impossible", enter="up"),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    text("100%", 0.5, 0.2, 280, color="ink", stroke="paper", strokeW=8, at="certain", enter="slam", sfx="hit"),
                    chip("CERTAIN", 0.5, 0.33, size=34, bg="ink", color="paper", at="certain", enter="up"),
                ],
                at="Sometimes#2",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "ink",
                [
                    text("50%", 0.5, 0.2, 280, color="accent", stroke="ink", shadow="paper", at="coin", enter="slam", sfx="hit"),
                    chip("A COIN FLIP", 0.5, 0.33, size=34, bg="paper", color="ink", at="coin", enter="up"),
                ],
                at="Sometimes#3",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "result",
        "The most stressful moments weren't when a shock was *certain*. They were when it was [50/50|fifty-fifty].",
        [
            shot(
                "ink-grid",
                [
                    chip("STRESS (ILLUSTRATIVE SHAPE)", 0.5, 0.075, size=30, bg="soft", color="ink", at="start", enter="down"),
                    L("curve", x=0.5, y=0.3, w=0.9, h=0.32, dot=[{"at": "start", "v": 0.02}, {"at": "certain", "v": 1.0}, {"at": "50/50", "v": 0.5}], enter="up", at="start"),
                    L("burst", text="PEAK\nSTRESS", x=0.78, y=0.55, w=0.3, at="50/50", enter="slam", rot=8, seed=3, sfx="hit"),
                ],
                cam={"z": [1.0, 1.06], "punch": ["50/50"]},
            )
        ],
    ),
    scene(
        "body",
        "And it wasn't just a feeling. Their pupils widened, and their palms sweated, as the uncertainty rose.",
        [
            shot(
                "paper",
                [
                    chip("45 PEOPLE", 0.5, 0.075, size=40, bg="accent", color="ink", at="start", enter="down"),
                    L("eyes", x=0.5, y=0.28, w=0.8, look=[{"at": "start", "x": 0, "y": 0}], pupil=[{"at": "start", "v": 0.8}, {"at": "pupils", "v": 1.5}], enter="pop", id="pup"),
                    chip("PUPILS WIDENED", 0.5, 0.48, size=40, bg="ink", color="paper", at="pupils", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.07], "keys": [{"at": "pupils", "z": 1.18, "x": 0.5, "y": 0.28, "secs": 0.8}]},
            ),
            shot(
                "accent",
                [
                    img("face-shock", 0.5, 0.34, 0.5, enter="pop"),
                    chip("SWEATIER PALMS", 0.5, 0.58, size=42, bg="ink", color="paper", at="palms", enter="up", sfx="blip"),
                    cite(CITE, "palms"),
                ],
                at="palms",
                enter="slide-l",
                cam={"z": [1.0, 1.08]},
            ),
        ],
    ),
    scene(
        "quote",
        "One of the researchers said it's much worse not knowing whether a shock is coming than knowing for sure.",
        [
            shot(
                "ink",
                [
                    text("NOT KNOWING", 0.5, 0.18, 190, color="accent", stroke="ink", shadow="paper", at="not", enter="slam", sfx="hit"),
                    text(">", 0.5, 0.31, 200, color="paper", at="worse", enter="pop"),
                    text("KNOWING\nFOR SURE", 0.5, 0.45, 160, color="paper", at="knowing", enter="up"),
                    chip("A RESEARCHER'S TAKE", 0.5, 0.075, size=34, bg="paper", color="ink", at="researchers", enter="down", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06], "punch": ["worse"]},
            )
        ],
    ),
    scene(
        "caveat",
        "It was a lab game with electric shocks, not a text message. But it hints at why waiting feels so *awful*.",
        [
            shot(
                "paper-grid",
                [
                    chip("A LAB GAME", 0.3, 0.12, size=44, bg="ink", color="paper", at="lab", enter="left", sfx="blip"),
                    chip("NOT A TEXT MESSAGE", 0.66, 0.24, size=44, bg="white", color="ink", at="not", enter="right", sfx="blip"),
                    L("phone", x=0.5, y=0.45, w=0.26, at="But", enter="up", screens=[{"at": "start", "s": "read"}], rot=-4),
                    img("face-tired", 0.82, 0.5, 0.26, at="awful", enter="pop", rot=8),
                ],
                cam={"z": [1.0, 1.06]},
            )
        ],
    ),
    scene(
        "tip",
        "So shrink the maybe. Ask the question. Pick a time to check back. And decide what you'll do *either way*.",
        [
            shot(
                "accent",
                [
                    chip("SHRINK THE MAYBE", 0.5, 0.075, size=46, bg="ink", color="paper", at="shrink", enter="down", sfx="blip"),
                    chip("1  ASK THE QUESTION", 0.5, 0.2, size=44, bg="white", color="ink", at="Ask", enter="left", sfx="blip"),
                    L("scribble", shape="check", x=0.9, y=0.2, w=0.1, h=0.06, color="ink", strokeW=14, at="Pick", dur=8, outline=False),
                    chip("2  PICK A TIME TO CHECK", 0.5, 0.31, size=44, bg="white", color="ink", at="Pick", enter="right", sfx="blip"),
                    L("scribble", shape="check", x=0.9, y=0.31, w=0.1, h=0.06, color="ink", strokeW=14, at="decide", dur=8, outline=False),
                    chip("3  PLAN FOR BOTH OUTCOMES", 0.5, 0.42, size=44, bg="white", color="ink", at="decide", enter="left", sfx="blip"),
                    L("scribble", shape="check", x=0.9, y=0.42, w=0.1, h=0.06, color="ink", strokeW=14, at="either", dur=8, outline=False),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    text("EITHER\nWAY", 0.5, 0.26, 250, color="accent", stroke="ink", shadow="paper", at="either", enter="slam", sfx="hit"),
                    img("face-calm", 0.5, 0.52, 0.34, at="way", enter="pop", rot=-3),
                ],
                at="either",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["either"]},
            ),
        ],
    ),
    scene(
        "close",
        "Bad news is something you can deal with. 'Maybe' is a door your brain keeps *open*.",
        [
            shot(
                {"photo": "bg-window", "blur": 6, "bright": 0.75, "dim": 0.15},
                [
                    text("MAYBE", 0.5, 0.2, 320, color="paper", stroke="ink", shadow="ink", at="Maybe", enter="slam", sfx="hit"),
                    img("face-calm", 0.5, 0.48, 0.4, at="door", enter="pop"),
                    L("scribble", shape="underline", x=0.5, y=0.3, w=0.74, h=0.05, color="accent", strokeW=18, at="open", dur=12, outline=True),
                ],
                cam={"z": [1.0, 1.08]},
            )
        ],
        tone="prof-soft",
    ),
    OUTRO,
]

build(
    "p006-uncertainty",
    "Why 'Maybe' Feels Worse Than Bad News",
    "dreamer.mp3",
    [
        "de Berker, A. O., Rutledge, R. B., Mathys, C., Marshall, L., Cross, G. F., Dolan, R. J., & Bestmann, S. (2016). Computations of uncertainty mediate acute stress responses in humans. Nature Communications, 7, 10996. https://doi.org/10.1038/ncomms10996"
    ],
    scenes,
)
