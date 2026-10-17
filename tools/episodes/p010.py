#!/usr/bin/env python3
"""p010: Why You Stay Up Late When You're Exhausted  (Kroese et al. 2014, Frontiers in Psychology).

Cautious by design: one small 2014 survey (N = 177); the internet name 'revenge bedtime procrastination' is newer and less studied.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403

CITE = "Kroese et al. · 2014"

scenes = [
    scene(
        "hook",
        "You're exhausted. You *know* you should sleep. And you scroll anyway.",
        [
            shot(
                "ink",
                [
                    L("clock", x=0.5, y=0.32, w=0.56, time=[{"at": "start", "v": 660}, {"at": "scroll", "v": 780}], glide=70, digital=True, enter="pop", delay=-0.3),
                    chip("TIME TO SLEEP", 0.5, 0.075, size=44, bg="accent", color="ink", at="start", enter="down"),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "paper",
                [
                    L("slab", color="accent", round=True, w=0.9, x=0.5, y=0.34, border=10, enter="pop", depth=0.6),
                    img("klying", 0.5, 0.36, 0.64, enter="up"),
                ],
                at="And",
                enter="wipe-r",
                cam={"z": [1.0, 1.07]},
            ),
        ],
    ),
    scene(
        "name",
        "Researchers call it *bedtime procrastination*. Going to bed later than you planned, when nothing is stopping you.",
        [
            shot(
                "accent",
                [
                    text("BEDTIME\nPROCRASTINATION", 0.5, 0.24, 130, color="ink", stroke="paper", strokeW=8, at="bedtime", enter="slam", sfx="hit"),
                    cite(CITE, "bedtime"),
                ],
                cam={"z": [1.0, 1.06], "punch": ["bedtime"]},
            ),
            shot(
                "paper-grid",
                [
                    chip("PLANNED: 11:00 PM", 0.5, 0.1, size=44, bg="ink", color="paper", at="planned", enter="down", sfx="blip"),
                    chip("ACTUAL: 1:00 AM", 0.5, 0.2, size=44, bg="accent", color="ink", at="later", enter="up", sfx="blip"),
                    chip("NOTHING STOPPING YOU", 0.5, 0.34, size=40, bg="white", color="ink", at="nothing", enter="up", sfx="blip"),
                    img("kbust-pocket", 0.5, 0.56, 0.28, at="nothing", enter="pop"),
                ],
                at="Going",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "why",
        "Why? During the day, your time belongs to other people. At night, it's finally *yours*.",
        [
            shot(
                "paper",
                [
                    chip("DAYTIME", 0.3, 0.075, size=44, bg="ink", color="paper", at="day", enter="left", sfx="blip"),
                    chip("BELONGS TO OTHERS", 0.5, 0.17, size=42, bg="white", color="ink", at="belongs", enter="up", sfx="blip"),
                    img("kbust-pocket2", 0.5, 0.45, 0.4, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    L("pulse", x=0.5, y=0.3, w=1.0, enter="none", color="paper"),
                    text("YOURS", 0.5, 0.28, 330, color="accent", stroke="ink", shadow="paper", at="yours", enter="slam", sfx="hit"),
                    chip("NIGHT TIME", 0.5, 0.075, size=44, bg="paper", color="ink", at="night", enter="down", sfx="blip"),
                ],
                at="night",
                enter="flash",
                cam={"z": [1.0, 1.07], "punch": ["yours"]},
            ),
        ],
    ),
    scene(
        "bank",
        "It's like borrowing from a bank. You borrow hours from your sleep, to pay yourself some free time. And tomorrow, you pay it back with *interest*.",
        [
            shot(
                "accent",
                [
                    chip("A COMPARISON, NOT SCIENCE", 0.5, 0.075, size=30, bg="ink", color="paper", at="start", enter="down"),
                    L("battery", x=0.5, y=0.2, w=0.72, label="SLEEP", level=[{"at": "start", "v": 1.0}, {"at": "borrow#2", "v": 0.35}], enter="pop"),
                    chip("BORROW HOURS OF SLEEP", 0.5, 0.36, size=38, bg="white", color="ink", at="borrowing", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "paper-grid",
                [
                    chip("BUY: FREE TIME", 0.5, 0.1, size=44, bg="accent", color="ink", at="free", enter="down", sfx="blip"),
                    text("+ INTEREST", 0.5, 0.3, 190, color="ink", mark="accent", at="interest", enter="slam", sfx="hit"),
                    img("face-tired", 0.5, 0.55, 0.3, at="tomorrow", enter="pop", rot=4),
                ],
                at="pay",
                enter="wipe-l",
                cam={"z": [1.0, 1.06], "punch": ["interest"]},
            ),
        ],
    ),
    scene(
        "study",
        "In a 2014 survey of [177|one hundred seventy seven] adults, people with weaker self-control reported more bedtime procrastination.",
        [
            shot(
                "ink-grid",
                [
                    chip("A 2014 SURVEY", 0.5, 0.075, size=42, bg="accent", color="ink", at="survey", enter="down", sfx="blip"),
                    L("counter", to=177, size=420, color="paper", x=0.5, y=0.22, at="177", dur=24, enter="none", stroke="ink", shadow="accent", sfx="hit"),
                    chip("ADULTS", 0.5, 0.4, size=44, bg="paper", color="ink", at="adults", enter="up"),
                    cite(CITE, "survey"),
                ],
                cam={"z": [1.0, 1.06], "punch": ["177"]},
            ),
            shot(
                "paper-grid",
                [
                    chip("WEAKER SELF-CONTROL", 0.3, 0.12, size=40, bg="ink", color="paper", at="weaker", enter="left", sfx="blip"),
                    L("scribble", shape="arrow", x=0.5, y=0.22, w=0.16, h=0.07, color="accent", strokeW=14, at="reported", dur=10, curve=0.0),
                    chip("MORE LATE NIGHTS", 0.68, 0.3, size=40, bg="accent", color="ink", at="more", enter="right", sfx="blip"),
                    img("kbust-pocket", 0.5, 0.5, 0.38, enter="pop", delay=-0.2),
                ],
                at="people",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "sleep",
        "And they also reported getting too little *sleep*, even after the researchers took other factors into account.",
        [
            shot(
                "accent",
                [
                    L("battery", x=0.5, y=0.2, w=0.74, label="SLEEP", level=[{"at": "start", "v": 0.8}, {"at": "little", "v": 0.3}], enter="pop", delay=-0.2),
                    chip("TOO LITTLE SLEEP", 0.5, 0.38, size=44, bg="ink", color="paper", at="little", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            )
        ],
    ),
    scene(
        "caveat",
        "It's one small survey. The online name, revenge bedtime procrastination, is newer and less studied. So take it as a *clue*.",
        [
            shot(
                "paper-grid",
                [
                    chip("ONE SMALL SURVEY", 0.5, 0.1, size=44, bg="ink", color="paper", at="small", enter="down", sfx="blip"),
                    img("kbust-pen", 0.5, 0.52, 0.36, enter="pop", delay=-0.2),
                    text("A CLUE", 0.5, 0.2, 240, color="ink", mark="accent", at="clue", enter="slam", sfx="hit"),
                    chip("THE 'REVENGE' NAME IS NEWER", 0.5, 0.36, size=34, bg="white", color="ink", at="online", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.05]},
            )
        ],
    ),
    scene(
        "tip",
        "A simple idea: give yourself free time *earlier*. Fifteen minutes that are just yours, before the evening ends. Then set an alarm for bed.",
        [
            shot(
                "accent",
                [
                    chip("A SIMPLE IDEA", 0.5, 0.075, size=44, bg="ink", color="paper", at="simple", enter="down", sfx="blip"),
                    L("clock", x=0.5, y=0.3, w=0.46, time=[{"at": "start", "v": 480}, {"at": "Fifteen", "v": 495}], glide=40, enter="pop"),
                    chip("15 MIN, JUST YOURS", 0.5, 0.52, size=40, bg="white", color="ink", at="yours#2", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    L("phone", x=0.5, y=0.3, w=0.34, enter="up", screens=[{"at": "start", "s": "lock"}, {"at": "alarm", "s": "buzzing"}], buzz=["alarm"], time="10:30", day="Bedtime", id="ph10"),
                    L("burst", text="BED!", x=0.8, y=0.14, w=0.28, at="alarm", enter="slam", rot=8, seed=3, sfx="buzz", sfxVolume=0.3),
                ],
                at="Then",
                enter="wipe-r",
                cam={"z": [1.0, 1.07], "shake": ["alarm"]},
            ),
        ],
    ),
    scene(
        "close",
        "Staying up isn't laziness. It's a person trying to get a little time back. You can find it *earlier*.",
        [
            shot(
                "accent",
                [
                    img("kbust-mug", 0.5, 0.34, 0.54, enter="pop", loop="breathe"),
                    text("your time", 0.5, 0.58, 160, font="hand", color="ink", upper=False, at="time", enter="pop", rot=-3),
                ],
                cam={"z": [1.0, 1.07]},
            )
        ],
        tone="prof-soft",
    ),
    OUTRO,
]

build(
    "p010-bedtime-procrastination",
    "Why You Stay Up Late When You're Exhausted",
    "easy-lemon.mp3",
    [
        "Kroese, F. M., De Ridder, D. T. D., Evers, C., & Adriaanse, M. A. (2014). Bedtime procrastination: Introducing a new area of procrastination. Frontiers in Psychology, 5, 611. https://doi.org/10.3389/fpsyg.2014.00611",
    ],
    scenes,
)
