#!/usr/bin/env python3
"""p002: They Liked You More Than You Think  (the liking gap, Boothby et al. 2018)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403

CITE = "Boothby et al. · 2018"

scenes = [
    scene(
        "hook",
        "You had a great conversation. Then, on the walk home, your brain starts the *review*.",
        [
            shot(
                "soft",
                [
                    L("panel", src="panel-lecture", x=0.5, y=0.3, w=0.88, enter="up", delay=-0.3, zoom=[1.02, 1.14], focus=[0.55, 0.5]),
                    chip("GREAT CHAT", 0.5, 0.08, size=44, bg="accent", color="ink", at="great", enter="down", sfx="blip"),
                    L("heart", x=0.82, y=0.5, w=0.16, at="conversation", enter="pop", rot=10, pulse=["conversation"]),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                {"photo": "bg-city", "blur": 8, "bright": 0.7, "dim": 0.2},
                [
                    img("body-walk", 0.5, 0.4, 0.34, enter="left", loop="bob"),
                    chip("WALKING HOME", 0.5, 0.09, size=42, bg="ink", color="paper", at="home", enter="down", sfx="blip"),
                ],
                at="walk",
                enter="slide-l",
                cam={"z": [1.0, 1.1]},
            ),
            shot(
                "ink",
                [
                    img("face-thinking", 0.5, 0.4, 0.52, enter="pop"),
                    text("REVIEW", 0.5, 0.13, 210, color="accent", stroke="ink", shadow="paper", at="review", enter="slam", sfx="hit"),
                ],
                at="brain",
                enter="iris",
                irisAt=[0.5, 0.4],
                cam={"z": [1.0, 1.08], "punch": ["review"]},
            ),
        ],
    ),
    scene(
        "replay",
        "Did I talk too much? Was that joke weird? They probably think I'm *boring*.",
        [
            shot(
                "ink-grid",
                [
                    L("bubble", text="Did I talk too much?", x=0.4, y=0.13, size=52, at="Did", enter="pop", rot=-2, sfx="pop"),
                    L("bubble", text="Was that joke weird?", x=0.62, y=0.27, size=52, at="Was", enter="pop", rot=2, sfx="pop"),
                    L("bubble", text="They think I'm boring.", x=0.45, y=0.41, size=52, at="They", enter="pop", rot=-1.5, sfx="pop"),
                    img("face-tired", 0.5, 0.58, 0.3, at="boring", enter="pop", rot=4),
                ],
                cam={"z": [1.0, 1.08], "punch": ["Was", "They"]},
            )
        ],
    ),
    scene(
        "study",
        "Psychologists tested this. Strangers chatted, then each person rated how much they liked their partner, and guessed how much their partner liked *them*.",
        [
            shot(
                "accent",
                [
                    chip("THE TEST", 0.5, 0.08, size=46, bg="ink", color="paper", at="tested", enter="down", sfx="blip"),
                    img("face-calm", 0.28, 0.36, 0.4, enter="left"),
                    img("face-smile", 0.72, 0.36, 0.38, at="Strangers", enter="right"),
                    chip("TWO STRANGERS", 0.5, 0.58, size=42, bg="paper", color="ink", at="Strangers", enter="up"),
                ],
                cam={"z": [1.0, 1.07]},
            ),
            shot(
                "paper-grid",
                [
                    img("face-thinking", 0.28, 0.27, 0.36, enter="left"),
                    img("face-smile", 0.74, 0.27, 0.34, enter="right"),
                    L("scribble", shape="arrow", x=0.5, y=0.27, w=0.2, h=0.08, color="accent", strokeW=16, at="rated", dur=12, curve=0.0),
                    chip("HOW MUCH I LIKED THEM", 0.5, 0.5, size=40, bg="ink", color="paper", at="rated", enter="up", sfx="blip"),
                    chip("HOW MUCH THEY LIKED ME?", 0.5, 0.58, size=40, bg="accent", color="ink", at="guessed", enter="up", sfx="blip"),
                    cite(CITE, "start"),
                ],
                at="then",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "result",
        "The result? On average, people guessed *too low*. Their partner liked them more than they thought.",
        [
            shot(
                "ink",
                [
                    chip("ILLUSTRATION, NOT REAL DATA", 0.5, 0.075, size=28, bg="soft", color="ink", enter="down", at="start"),
                    L("bars", x=0.46, y=0.33, w=0.7, h=0.4, items=[{"label": "YOU GUESS", "value": 0.42, "color": "paper", "at": "average"}, {"label": "THEY FELT", "value": 0.74, "color": "accent", "at": "too"}], gap=[0, 1], gapAt="Their", labelColor="paper", enter="none", at="start"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    chip("ILLUSTRATION, NOT REAL DATA", 0.5, 0.075, size=28, bg="soft", color="ink", enter="none", at="start"),
                    L("bars", x=0.46, y=0.33, w=0.7, h=0.4, items=[{"label": "YOU GUESS", "value": 0.42, "color": "paper", "at": "average"}, {"label": "THEY FELT", "value": 0.74, "color": "accent", "at": "too"}], gap=[0, 1], gapAt="Their", labelColor="paper", enter="none", at="start"),
                    L("burst", text="THE\nGAP", x=0.78, y=0.56, w=0.3, at="more", enter="slam", rot=8, seed=3, sfx="hit"),
                ],
                at="Their",
                enter="punch",
                cam={"z": [1.05, 1.12]},
            ),
        ],
    ),
    scene(
        "name",
        "Researchers call it *the liking gap*.",
        [
            shot(
                "accent",
                [
                    text("THE LIKING\nGAP", 0.5, 0.28, 250, color="ink", stroke="paper", strokeW=10, at="liking", enter="slam", sfx="hit"),
                    img("face-smile", 0.5, 0.52, 0.36, at="gap", enter="pop", rot=-4),
                    cite("Boothby et al. · Psychological Science · 2018", "gap", y=0.64),
                ],
                cam={"z": [1.0, 1.06], "punch": ["liking"]},
            )
        ],
    ),
    scene(
        "dorm",
        "It showed up in short chats, in long chats, and even among first-year students living in the same dorm.",
        [
            shot(
                "paper-grid",
                [
                    chip("WHERE IT SHOWED UP", 0.5, 0.075, size=40, bg="accent", color="ink", at="start", enter="down"),
                    img("face-smile", 0.2, 0.46, 0.3, enter="left", delay=-0.2),
                    img("face-calm", 0.8, 0.5, 0.28, enter="right", delay=-0.2),
                    chip("SHORT CHATS", 0.34, 0.2, size=46, bg="ink", color="paper", at="short", enter="left", sfx="blip"),
                    chip("LONG CHATS", 0.66, 0.31, size=46, bg="accent", color="ink", at="long", enter="right", sfx="blip"),
                    L("scribble", shape="underline", x=0.5, y=0.38, w=0.7, h=0.05, color="accent", strokeW=16, at="even", dur=10),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "soft",
                [
                    L("panel", src="bg-livingroom", x=0.5, y=0.3, w=0.86, enter="up", zoom=[1.02, 1.12]),
                    chip("FIRST-YEAR STUDENTS, SAME DORM", 0.5, 0.58, size=36, bg="ink", color="paper", at="first", enter="up", sfx="blip"),
                    img("face-joy", 0.82, 0.14, 0.24, at="students", enter="pop", rot=8),
                ],
                at="first",
                enter="slide-u",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "months",
        "And the gap lasted for *months*, while they got to know each other.",
        [
            shot(
                "ink",
                [
                    chip("LASTED FOR MONTHS", 0.5, 0.1, size=46, bg="accent", color="ink", at="lasted", enter="down", sfx="blip"),
                    L("months", x=0.5, y=0.3, w=0.92, at="gap", enter="none", labelColor="paper"),
                    chip("WHAT THEY FELT", 0.3, 0.5, size=30, bg="accent", color="ink", at="months", enter="up"),
                    chip("WHAT THEY THOUGHT", 0.7, 0.5, size=30, bg="paper", color="ink", at="months+0.2", enter="up"),
                ],
                cam={"z": [1.0, 1.06]},
            )
        ],
    ),
    scene(
        "why",
        "Researchers suggest one reason: while you're busy worrying how *you're* coming across, you miss their friendly signals.",
        [
            shot(
                "paper",
                [
                    img("face-thinking", 0.36, 0.38, 0.5, enter="left"),
                    L("bubble", text="How am I doing?", x=0.7, y=0.13, size=52, at="busy", enter="pop", loop="float", sfx="pop"),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "accent",
                [
                    L("pulse", x=0.5, y=0.36, w=1.1, enter="none", color="ink"),
                    img("face-smile", 0.5, 0.36, 0.5, enter="pop"),
                    chip("THEIR FRIENDLY SIGNALS", 0.5, 0.1, size=40, bg="ink", color="paper", at="friendly", enter="down", sfx="blip"),
                    L("scribble", shape="cross", x=0.5, y=0.36, w=0.62, h=0.3, color="ink", strokeW=20, at="miss", dur=10, outline=False),
                ],
                at="you#3",
                enter="wipe-r",
                cam={"z": [1.0, 1.08]},
            ),
        ],
    ),
    scene(
        "tip",
        "So when the review starts, remind yourself: they probably liked you *more* than you think.",
        [
            shot(
                "paper",
                [
                    L("slab", color="accent", round=True, w=0.84, x=0.5, y=0.3, border=10, enter="pop", depth=0.6),
                    img("body-gesture", 0.5, 0.32, 0.3, enter="up", loop="breathe"),
                    chip("TRY THIS", 0.5, 0.075, size=46, bg="ink", color="paper", at="remind", enter="down", sfx="blip"),
                    text("they liked you\nmore than you think", 0.5, 0.575, 84, font="hand", color="ink", upper=False, at="they", enter="pop", rot=-2),
                ],
                cam={"z": [1.0, 1.07]},
            )
        ],
    ),
    scene(
        "close",
        "You're probably your own harshest critic. So go a little *easier* on yourself.",
        [
            shot(
                "accent",
                [
                    img("face-smile", 0.5, 0.34, 0.6, enter="pop", loop="breathe"),
                    L("heart", x=0.8, y=0.15, w=0.18, at="easier", enter="pop", pulse=["easier"], rot=12),
                    text("go easy", 0.5, 0.58, 190, font="hand", color="ink", upper=False, at="easier", enter="pop", rot=-3),
                ],
                cam={"z": [1.0, 1.08]},
            )
        ],
        tone="prof-soft",
    ),
    OUTRO,
]

build(
    "p002-liking-gap",
    "They Liked You More Than You Think",
    "dreamer.mp3",
    [
        "Boothby, E. J., Cooney, G., Sandstrom, G. M., & Clark, M. S. (2018). The liking gap in conversations: Do people like us more than we think? Psychological Science, 29(11), 1742-1756. https://doi.org/10.1177/0956797618783714"
    ],
    scenes,
)
