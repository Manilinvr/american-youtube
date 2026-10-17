#!/usr/bin/env python3
"""p007: Is Short-Video 'Brain Rot' Real?  (Nguyen et al. 2025 meta-analysis, Psychological Bulletin)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403

CITE = "Nguyen et al. · Psychological Bulletin · 2025"
FOOD = {"photo": "bg-livingroom", "blur": 8, "bright": 0.72, "dim": 0.2}

scenes = [
    scene(
        "hook",
        "You sit down to watch a movie. Ten minutes in, you're on your *phone*.",
        [
            shot(
                "soft",
                [
                    L("slab", color="accent", round=True, w=0.92, x=0.5, y=0.35, border=10, enter="pop", depth=0.6, delay=-0.3),
                    img("kbust-mug", 0.5, 0.37, 0.5, enter="pop", delay=-0.3),
                    chip("MOVIE NIGHT", 0.5, 0.08, size=44, bg="ink", color="paper", at="start", enter="down"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    text("10 MIN", 0.5, 0.2, 300, color="accent", stroke="ink", shadow="paper", at="Ten", enter="slam", sfx="hit"),
                    img("face-skeptic", 0.5, 0.48, 0.42, at="Ten+0.15", enter="pop", rot=-4),
                ],
                at="Ten",
                enter="punch",
                cam={"z": [1.0, 1.08], "punch": ["Ten"]},
            ),
            shot(
                "accent",
                [
                    L("waves", x=0.5, y=0.33, w=1.0, at="phone", dur=60, strokeW=14, enter="none"),
                    L("phone", x=0.5, y=0.33, w=0.4, enter="up", screens=[{"at": "start", "s": "feed"}], rot=-3, id="ph7"),
                    L("burst", text="SCROLL", x=0.8, y=0.12, w=0.3, at="phone", enter="slam", rot=8, seed=2, fill="paper", sfx="pop"),
                ],
                at="phone",
                enter="wipe-r",
                cam={"z": [1.0, 1.08]},
            ),
        ],
    ),
    scene(
        "name",
        "People call it brain rot. It's not a medical term, but scientists are *studying* it.",
        [
            shot(
                "ink",
                [
                    text("BRAIN\nROT", 0.5, 0.25, 280, color="paper", at="brain", enter="slam", sfx="hit"),
                    chip("NOT A MEDICAL TERM", 0.5, 0.5, size=42, bg="accent", color="ink", at="medical", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06], "punch": ["brain"]},
            ),
            shot(
                "paper-grid",
                [
                    img("kbust-pen", 0.5, 0.36, 0.5, enter="up"),
                    chip("SCIENTISTS ARE STUDYING IT", 0.5, 0.08, size=38, bg="ink", color="paper", at="scientists", enter="down", sfx="blip"),
                ],
                at="scientists",
                enter="wipe-r",
                cam={"z": [1.0, 1.07]},
            ),
        ],
    ),
    scene(
        "food",
        "Think of short videos as *fast food*. Quick, tasty, always there. And after a while, slower things... start to taste bland.",
        [
            shot(
                "accent",
                [
                    chip("A COMPARISON, NOT SCIENCE", 0.5, 0.075, size=32, bg="ink", color="paper", at="start", enter="down"),
                    text("FAST\nFOOD", 0.5, 0.27, 300, color="ink", stroke="paper", strokeW=10, at="fast", enter="slam", sfx="hit"),
                    L("phone", x=0.82, y=0.5, w=0.2, at="videos", enter="pop", screens=[{"at": "start", "s": "feed"}], rot=8, id="ph7b"),
                ],
                cam={"z": [1.0, 1.06], "punch": ["fast"]},
            ),
            shot(
                "paper",
                [
                    chip("QUICK", 0.28, 0.1, size=50, bg="ink", color="paper", at="Quick", enter="left", sfx="blip"),
                    chip("TASTY", 0.7, 0.2, size=50, bg="accent", color="ink", at="tasty", enter="right", sfx="blip"),
                    chip("ALWAYS THERE", 0.36, 0.3, size=50, bg="white", color="ink", at="always", enter="left", sfx="blip"),
                    img("kbust-calm", 0.5, 0.52, 0.34, at="always", enter="pop"),
                ],
                at="Quick",
                enter="slide-l",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "soft",
                [
                    img("kbust-big-book", 0.5, 0.33, 0.52, enter="up"),
                    chip("A BOOK", 0.28, 0.08, size=44, bg="ink", color="paper", at="slower", enter="down"),
                    chip("A SLOW MOVIE", 0.72, 0.58, size=40, bg="white", color="ink", at="things", enter="up"),
                    text("bland?", 0.78, 0.16, 150, font="hand", color="ink", upper=False, at="bland", enter="pop", rot=8),
                ],
                at="slower",
                enter="wipe-l",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "study",
        "In 2025, researchers combined [71|seventy one] studies, with almost [100,000|one hundred thousand] people.",
        [
            shot(
                "ink",
                [
                    chip("A BIG REVIEW", 0.5, 0.075, size=42, bg="accent", color="ink", at="researchers", enter="down", sfx="blip"),
                    L("counter", to=71, size=460, color="paper", x=0.5, y=0.25, at="71", dur=22, enter="none", stroke="ink", shadow="accent", sfx="hit"),
                    chip("STUDIES COMBINED", 0.5, 0.45, size=44, bg="paper", color="ink", at="71+0.3", enter="up"),
                    cite(CITE, "researchers"),
                ],
                cam={"z": [1.0, 1.06], "punch": ["71"]},
            ),
            shot(
                "paper-grid",
                [
                    L("dots", x=0.5, y=0.2, w=0.82, total=84, cols=14, hit=0, at="almost", delay=-0.2, step=0.15, enter="none", id="d84"),
                    text("≈ 100,000", 0.5, 0.45, 190, color="ink", mark="accent", at="almost", enter="slam", sfx="hit"),
                    chip("PEOPLE", 0.5, 0.55, size=44, bg="ink", color="paper", at="people", enter="up"),
                ],
                at="almost",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "result",
        "The more people watched short videos, the weaker their attention and self-control tended to be.",
        [
            shot(
                "ink-grid",
                [
                    chip("ILLUSTRATION, NOT REAL DATA", 0.5, 0.075, size=28, bg="soft", color="ink", at="start", enter="down"),
                    L("battery", x=0.5, y=0.22, w=0.76, label="ATTENTION", level=[{"at": "start", "v": 1.0}, {"at": "weaker", "v": 0.35}], enter="pop"),
                    chip("MORE VIDEOS", 0.5, 0.4, size=42, bg="accent", color="ink", at="more", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink-grid",
                [
                    chip("ILLUSTRATION, NOT REAL DATA", 0.5, 0.075, size=28, bg="soft", color="ink", enter="none", at="start"),
                    L("battery", x=0.5, y=0.22, w=0.76, label="ATTENTION", level=[{"at": "start", "v": 0.35}], enter="none", at="start"),
                    L("battery", x=0.5, y=0.4, w=0.76, label="SELF-CONTROL", level=[{"at": "start", "v": 1.0}, {"at": "tended", "v": 0.4}], enter="pop"),
                ],
                at="self-control",
                enter="slide-u",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "mood",
        "Heavier use also went along with more stress and anxiety.",
        [
            shot(
                "accent",
                [
                    img("face-tired", 0.5, 0.33, 0.5, enter="pop", delay=-0.2),
                    chip("MORE STRESS", 0.3, 0.6, size=42, bg="ink", color="paper", at="stress", enter="left", sfx="blip"),
                    chip("MORE ANXIETY", 0.7, 0.54, size=42, bg="white", color="ink", at="anxiety", enter="right", sfx="blip"),
                ],
                cam={"z": [1.0, 1.07]},
            )
        ],
    ),
    scene(
        "caveat",
        "But here's the catch. This is a *link*, not proof. Maybe short videos wear down focus. Or maybe people who struggle to focus scroll more. Or both.",
        [
            shot(
                "paper",
                [
                    text("A LINK", 0.5, 0.15, 260, color="ink", mark="accent", at="link", enter="slam", sfx="hit"),
                    text("NOT PROOF", 0.5, 0.3, 200, color="graphite", at="proof", enter="up"),
                    L("scribble", shape="strike", x=0.5, y=0.3, w=0.76, h=0.05, color="accent", strokeW=20, at="proof+0.3", dur=9, outline=False),
                ],
                cam={"z": [1.0, 1.05], "punch": ["link"]},
            ),
            shot(
                "paper-grid",
                [
                    chip("MAYBE...", 0.5, 0.075, size=40, bg="ink", color="paper", at="Maybe", enter="down"),
                    img("face-thinking", 0.5, 0.5, 0.3, enter="pop", at="Maybe"),
                    chip("VIDEOS", 0.26, 0.25, size=38, bg="accent", color="ink", at="videos", enter="left", sfx="blip"),
                    L("scribble", shape="arrow", x=0.5, y=0.25, w=0.2, h=0.07, color="ink", strokeW=14, at="wear", dur=10, curve=0.0, outline=False),
                    chip("LESS FOCUS", 0.74, 0.25, size=38, bg="white", color="ink", at="focus", enter="right", sfx="blip"),
                ],
                at="Maybe",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "paper-grid",
                [
                    chip("OR MAYBE...", 0.5, 0.075, size=40, bg="ink", color="paper", at="start", enter="down"),
                    chip("LESS FOCUS", 0.26, 0.25, size=38, bg="white", color="ink", at="struggle", enter="left", sfx="blip"),
                    L("scribble", shape="arrow", x=0.5, y=0.25, w=0.2, h=0.07, color="ink", strokeW=14, at="scroll", dur=10, curve=0.0, outline=False),
                    chip("MORE VIDEOS", 0.74, 0.25, size=38, bg="accent", color="ink", at="scroll", enter="right", sfx="blip"),
                ],
                at="maybe#2",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    text("OR\nBOTH?", 0.5, 0.26, 300, color="ink", stroke="paper", strokeW=10, at="both", enter="slam", sfx="hit"),
                    img("face-thinking", 0.5, 0.55, 0.3, at="both+0.2", enter="pop", rot=-4),
                ],
                at="both",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["both"]},
            ),
        ],
    ),
    scene(
        "tip",
        "So here's a simple trick. Put the phone in another room for the first twenty minutes of your movie, or your work.",
        [
            shot(
                "accent",
                [
                    chip("A SIMPLE TRICK", 0.5, 0.075, size=44, bg="ink", color="paper", at="simple", enter="down", sfx="blip"),
                    L("phone", x=0.3, y=0.33, w=0.26, enter="left", screens=[{"at": "start", "s": "lock"}], rot=-6, id="ph7c"),
                    L("scribble", shape="arrow", x=0.55, y=0.33, w=0.2, h=0.08, color="ink", strokeW=14, at="another", dur=12, curve=0.0, outline=False),
                    chip("OTHER ROOM", 0.78, 0.33, size=38, bg="white", color="ink", at="room", enter="right", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    text("20 MIN", 0.5, 0.2, 300, color="accent", stroke="ink", shadow="paper", at="twenty", enter="slam", sfx="hit"),
                    img("kfull-point", 0.5, 0.5, 0.3, at="twenty", enter="up"),
                ],
                at="twenty",
                enter="flash",
                cam={"z": [1.0, 1.07], "punch": ["twenty"]},
            ),
        ],
    ),
    scene(
        "close",
        "Your attention isn't broken. It's a habit. And habits can *change*.",
        [
            shot(
                "accent",
                [
                    img("kbust-calm", 0.5, 0.34, 0.56, enter="pop", loop="breathe"),
                    text("a habit", 0.5, 0.58, 170, font="hand", color="ink", upper=False, at="habit", enter="pop", rot=-3),
                ],
                cam={"z": [1.0, 1.07]},
            ),
        ],
        tone="prof-soft",
    ),
    OUTRO,
]

build(
    "p007-brain-rot",
    "Is Short-Video 'Brain Rot' Real?",
    "thinking-music.mp3",
    [
        "Nguyen, T. T., et al. (2025). Feeds, feelings, and focus: A systematic review and meta-analysis examining the cognitive and mental health correlates of short-form video use. Psychological Bulletin, 151(9), 1125-1146. https://doi.org/10.1037/bul0000498",
    ],
    scenes,
)
