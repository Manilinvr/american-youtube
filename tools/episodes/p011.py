#!/usr/bin/env python3
"""p011: Why Unfinished Tasks Won't Leave Your Head  (Masicampo & Baumeister 2011, JPSP).

Cautious by design: student lab experiments; the old 'Zeigarnik effect' is conditional, so the video leans on the plan-making finding.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403

CITE = "Masicampo & Baumeister · 2011"
TABS = [
    {"label": "Email", "at": "start+0.05"},
    {"label": "Taxes", "at": "start+0.45"},
    {"label": "Call mom", "at": "start+0.85"},
    {"label": "Gym", "at": "start+1.25"},
    {"label": "Report", "at": "start+1.65"},
    {"label": "Dentist", "at": "start+2.05"},
]

scenes = [
    scene(
        "hook",
        "It's night. You're tired. And your brain replays everything you *haven't* done yet.",
        [
            shot(
                "ink",
                [
                    img("kbust-calm", 0.5, 0.34, 0.5, enter="pop", delay=-0.3),
                    chip("11:48 PM", 0.5, 0.075, size=44, bg="accent", color="ink", at="start", enter="down"),
                    L("bubble", text="Email?", x=0.2, y=0.15, size=44, at="night", enter="pop", rot=-4, sfx="pop"),
                    L("bubble", text="Taxes!", x=0.8, y=0.22, size=44, at="tired", enter="pop", rot=4, sfx="pop"),
                    L("bubble", text="Gym...", x=0.22, y=0.5, size=44, at="brain", enter="pop", rot=-3, sfx="pop"),
                    L("bubble", text="Call mom", x=0.78, y=0.52, size=44, at="replays", enter="pop", rot=3, sfx="pop"),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "accent",
                [
                    text("NOT DONE\nYET", 0.5, 0.26, 250, color="ink", stroke="paper", strokeW=10, at="haven't", enter="slam", sfx="hit"),
                    img("face-tired", 0.5, 0.55, 0.3, at="haven't+0.2", enter="pop", rot=4),
                ],
                at="everything",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["haven't"]},
            ),
        ],
    ),
    scene(
        "tabs",
        "Think of your brain as a browser. Every unfinished thing is *another open tab*.",
        [
            shot(
                "paper-grid",
                [
                    chip("A COMPARISON, NOT SCIENCE", 0.5, 0.075, size=30, bg="ink", color="paper", at="start", enter="down"),
                    L("tabs", x=0.5, y=0.27, w=0.9, h=0.3, tabs=TABS, enter="up", delay=-0.2, barLabel="BRAIN MEMORY"),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    text("OPEN\nTABS", 0.5, 0.26, 280, color="ink", stroke="paper", strokeW=10, at="another", enter="slam", sfx="hit"),
                    img("face-shock", 0.5, 0.56, 0.28, at="another+0.2", enter="pop", rot=-4),
                ],
                at="another",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["another"]},
            ),
        ],
    ),
    scene(
        "slow",
        "And the more tabs you keep open, the slower everything runs. Even a calm evening.",
        [
            shot(
                "paper-grid",
                [
                    L("tabs", x=0.5, y=0.27, w=0.9, h=0.3, tabs=[{**tb, "at": f"start+{0.02 * i}"} for i, tb in enumerate(TABS)], enter="none", at="start", barLabel="BRAIN MEMORY"),
                    chip("EVERYTHING RUNS SLOWER", 0.5, 0.52, size=38, bg="ink", color="paper", at="slower", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            )
        ],
    ),
    scene(
        "study",
        "Psychologists tested this with students. They gave them an unfinished goal. Then they checked their focus on something *unrelated*.",
        [
            shot(
                "ink-grid",
                [
                    chip("A LAB EXPERIMENT", 0.5, 0.075, size=42, bg="accent", color="ink", at="tested", enter="down", sfx="blip"),
                    img("kbust-pen", 0.5, 0.36, 0.5, enter="pop"),
                    cite(CITE, "tested"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "paper",
                [
                    chip("1. AN UNFINISHED GOAL", 0.5, 0.1, size=40, bg="ink", color="paper", at="unfinished", enter="down", sfx="blip"),
                    chip("2. A TOTALLY DIFFERENT TASK", 0.5, 0.2, size=40, bg="white", color="ink", at="focus", enter="up", sfx="blip"),
                    img("face-thinking", 0.5, 0.45, 0.32, at="focus", enter="pop"),
                ],
                at="unfinished",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "result",
        "The unfinished goal kept popping into their heads. And they did *worse* on a simple puzzle.",
        [
            shot(
                "accent",
                [
                    L("bubble", text="Did I finish that?", x=0.5, y=0.13, size=50, at="popping", enter="pop", loop="float", sfx="pop"),
                    img("face-tired", 0.5, 0.4, 0.44, enter="pop"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    text("WORSE", 0.5, 0.2, 300, color="accent", stroke="ink", shadow="paper", at="worse", enter="slam", sfx="hit"),
                    chip("ON A SIMPLE PUZZLE", 0.5, 0.4, size=44, bg="paper", color="ink", at="puzzle", enter="up", sfx="blip"),
                ],
                at="worse",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["worse"]},
            ),
        ],
    ),
    scene(
        "plan",
        "Here's the twist. When students wrote a *specific plan*, saying what they'd do, when, and where, the problem went away.",
        [
            shot(
                "paper-grid",
                [
                    chip("THE TWIST", 0.5, 0.075, size=44, bg="ink", color="paper", at="twist", enter="down", sfx="blip"),
                    text("A PLAN", 0.5, 0.22, 290, color="ink", mark="accent", at="plan", enter="slam", sfx="hit"),
                ],
                cam={"z": [1.0, 1.06], "punch": ["plan"]},
            ),
            shot(
                "accent",
                [
                    chip("WHAT", 0.2, 0.15, size=56, bg="ink", color="paper", at="what", enter="up", sfx="blip"),
                    chip("WHEN", 0.5, 0.15, size=56, bg="white", color="ink", at="when#2", enter="up", sfx="blip"),
                    chip("WHERE", 0.8, 0.15, size=56, bg="ink", color="paper", at="where", enter="up", sfx="blip"),
                    img("kfull-point", 0.5, 0.48, 0.22, at="what", enter="up"),
                ],
                at="saying",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "paper",
                [
                    L("tabs", x=0.5, y=0.27, w=0.9, h=0.3, tabs=[{**tb, "at": "start", "done": "start+0.3"} for tb in TABS], enter="none", at="start", barLabel="BRAIN MEMORY"),
                    chip("ILLUSTRATION: TABS ARE NOW PARKED", 0.5, 0.52, size=30, bg="soft", color="ink", at="start", enter="up"),
                ],
                at="problem",
                enter="iris",
                irisAt=[0.5, 0.3],
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "key",
        "They didn't have to *finish* anything. Just deciding when and where was enough.",
        [
            shot(
                "ink",
                [
                    text("NO NEED TO\nFINISH", 0.5, 0.25, 190, color="paper", at="finish", enter="slam", sfx="hit"),
                    chip("JUST DECIDE WHEN + WHERE", 0.5, 0.48, size=38, bg="accent", color="ink", at="Just", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06], "punch": ["finish"]},
            )
        ],
    ),
    scene(
        "caveat",
        "These were small lab experiments with students. But the trick costs you two minutes and a piece of paper.",
        [
            shot(
                "paper-grid",
                [
                    chip("SMALL LAB EXPERIMENTS", 0.5, 0.08, size=40, bg="ink", color="paper", at="small", enter="down", sfx="blip"),
                    img("kbust-big-book", 0.3, 0.38, 0.4, enter="left"),
                    text("2 MIN", 0.74, 0.33, 170, color="ink", mark="accent", at="two", enter="slam", sfx="hit"),
                    chip("+ A PIECE OF PAPER", 0.7, 0.45, size=32, bg="white", color="ink", at="paper", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            )
        ],
    ),
    scene(
        "tip",
        "Tonight, write down each open thing. Next to it, write one step, and *when* you'll do it.",
        [
            shot(
                "accent",
                [
                    chip("TRY THIS TONIGHT", 0.5, 0.075, size=44, bg="ink", color="paper", at="Tonight", enter="down", sfx="blip"),
                    chip("☐ EMAIL → TUES, 9 AM", 0.5, 0.17, size=46, bg="white", color="ink", at="write", enter="left", sfx="blip"),
                    chip("☐ TAXES → SAT, DESK", 0.5, 0.27, size=46, bg="white", color="ink", at="each", enter="right", sfx="blip"),
                    chip("☐ GYM → WED, 6 PM", 0.5, 0.37, size=46, bg="white", color="ink", at="one", enter="left", sfx="blip"),
                    L("scribble", shape="check", x=0.9, y=0.37, w=0.1, h=0.05, color="ink", strokeW=14, at="when", dur=9, outline=False),
                    img("kbust-pen", 0.5, 0.55, 0.3, enter="pop", at="each"),
                ],
                cam={"z": [1.0, 1.06]},
            )
        ],
    ),
    scene(
        "close",
        "You don't have to finish everything tonight. You just have to give each thing a *place*.",
        [
            shot(
                "accent",
                [
                    img("kbust-pen", 0.5, 0.34, 0.54, enter="pop", loop="breathe"),
                    text("a place for each", 0.5, 0.58, 130, font="hand", color="ink", upper=False, at="place", enter="pop", rot=-3),
                ],
                cam={"z": [1.0, 1.07]},
            )
        ],
        tone="prof-soft",
    ),
    OUTRO,
]

build(
    "p011-open-tabs",
    "Why Unfinished Tasks Won't Leave Your Head",
    "dreamer.mp3",
    [
        "Masicampo, E. J., & Baumeister, R. F. (2011). Consider it done! Plan making can eliminate the cognitive effects of unfulfilled goals. Journal of Personality and Social Psychology, 101(4), 667-683. https://doi.org/10.1037/a0024192",
    ],
    scenes,
)
