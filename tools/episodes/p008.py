#!/usr/bin/env python3
"""p008: Why You Can't Stop Doomscrolling  (Shabahang et al. 2024, Computers in Human Behavior Reports)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403

CITE = "Shabahang et al. · 2024"
NIGHT = {"photo": "bg-window", "blur": 7, "bright": 0.55, "dim": 0.3}

scenes = [
    scene(
        "hook",
        "It's two in the morning. The news is terrible. And you keep *scrolling*.",
        [
            shot(
                "ink",
                [
                    L("clock", x=0.5, y=0.32, w=0.56, time=[{"at": "start", "v": 840}], digital=True, enter="pop", delay=-0.3),
                    chip("2:00 AM", 0.5, 0.075, size=44, bg="accent", color="ink", at="start", enter="down"),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "paper-grid",
                [
                    L("slab", color="accent", w=1.4, h=0.34, x=0.5, y=0.33, rot=-6, depth=0.5, enter="none", at="news"),
                    L("phone", x=0.5, y=0.35, w=0.42, at="news", enter="up", screens=[{"at": "start", "s": "news"}], loop="float", rot=-3, id="ph8"),
                    chip("BAD NEWS", 0.5, 0.075, size=44, bg="ink", color="paper", at="terrible", enter="down", sfx="blip"),
                ],
                at="news",
                enter="wipe-r",
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "ink",
                [
                    L("phone", x=0.5, y=0.35, w=0.42, enter="none", screens=[{"at": "start", "s": "news"}], id="ph8b", feedSpeed=14),
                    L("burst", text="ONE MORE", x=0.82, y=0.14, w=0.34, at="scrolling", enter="slam", rot=8, seed=4, sfx="hit"),
                ],
                at="scrolling",
                enter="punch",
                cam={"z": [1.0, 1.08], "punch": ["scrolling"]},
            ),
        ],
    ),
    scene(
        "name",
        "It even has a name: *doomscrolling*. Endlessly scrolling through bad news.",
        [
            shot(
                "accent",
                [
                    text("DOOM-\nSCROLLING", 0.5, 0.25, 230, color="ink", stroke="paper", strokeW=10, at="doomscrolling", enter="slam", sfx="hit"),
                    chip("ENDLESS BAD NEWS", 0.5, 0.52, size=44, bg="ink", color="paper", at="Endlessly", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06], "punch": ["doomscrolling"]},
            )
        ],
    ),
    scene(
        "why",
        "Why is it so hard to stop? Think of a car crash on the highway. You don't want to look, but you *can't help* it.",
        [
            shot(
                "paper",
                [
                    img("kbust-pocket", 0.5, 0.36, 0.5, enter="pop", delay=-0.2),
                    chip("WHY IS IT SO HARD TO STOP?", 0.5, 0.075, size=34, bg="ink", color="paper", at="hard", enter="down", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                {"photo": "bg-city", "blur": 6, "bright": 0.7, "dim": 0.15},
                [
                    chip("A COMPARISON, NOT SCIENCE", 0.5, 0.075, size=30, bg="soft", color="ink", at="start", enter="down"),
                    img("face-surprised", 0.5, 0.35, 0.5, enter="pop"),
                    text("DON'T LOOK", 0.5, 0.58, 110, color="paper", stroke="ink", at="want", enter="up"),
                ],
                at="car",
                enter="slide-l",
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "accent",
                [
                    text("CAN'T\nHELP IT", 0.5, 0.27, 240, color="ink", stroke="paper", strokeW=8, at="can't", enter="slam", sfx="hit"),
                    img("face-shock", 0.5, 0.56, 0.3, at="can't+0.2", enter="pop", rot=5),
                ],
                at="can't",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["can't"]},
            ),
        ],
    ),
    scene(
        "study",
        "Researchers surveyed about [800|eight hundred] college students, in Iran and in the United States.",
        [
            shot(
                "ink-grid",
                [
                    chip("A SURVEY", 0.5, 0.075, size=44, bg="accent", color="ink", at="surveyed", enter="down", sfx="blip"),
                    L("counter", to=800, size=420, color="paper", x=0.5, y=0.22, at="800", dur=26, enter="none", stroke="ink", shadow="accent", sfx="hit"),
                    chip("COLLEGE STUDENTS", 0.5, 0.4, size=44, bg="paper", color="ink", at="college", enter="up"),
                    cite(CITE, "surveyed"),
                ],
                cam={"z": [1.0, 1.06], "punch": ["800"]},
            ),
            shot(
                "paper-grid",
                [
                    chip("IRAN + THE UNITED STATES", 0.5, 0.1, size=40, bg="ink", color="paper", at="Iran", enter="down", sfx="blip"),
                    L("dots", x=0.5, y=0.3, w=0.7, total=40, cols=10, hit=0, at="Iran", step=0.2, enter="none", id="d40"),
                    text("2 COUNTRIES", 0.5, 0.5, 130, color="ink", mark="accent", at="United", enter="slam"),
                ],
                at="Iran",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "result",
        "Those who doomscrolled more also reported more *existential anxiety*. That's worry about big questions: life, death, and what it all means.",
        [
            shot(
                "accent",
                [
                    chip("MORE DOOMSCROLLING", 0.3, 0.1, size=38, bg="ink", color="paper", at="more", enter="left", sfx="blip"),
                    L("scribble", shape="arrow", x=0.5, y=0.2, w=0.16, h=0.07, color="ink", strokeW=14, at="existential", dur=10, curve=0.0, outline=False),
                    chip("MORE BIG-QUESTION WORRY", 0.5, 0.3, size=40, bg="white", color="ink", at="existential", enter="up", sfx="blip"),
                    img("kbust-calm", 0.5, 0.52, 0.42, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    text("EXISTENTIAL\nANXIETY", 0.5, 0.2, 170, color="paper", at="That's", enter="slam", sfx="hit"),
                    chip("LIFE", 0.2, 0.42, size=44, bg="accent", color="ink", at="life", enter="up", sfx="blip"),
                    chip("DEATH", 0.5, 0.48, size=44, bg="paper", color="ink", at="death", enter="up", sfx="blip"),
                    chip("MEANING", 0.78, 0.42, size=44, bg="accent", color="ink", at="means", enter="up", sfx="blip"),
                ],
                at="That's",
                enter="wipe-r",
                cam={"z": [1.0, 1.06], "punch": ["That's"]},
            ),
        ],
    ),
    scene(
        "idea",
        "One idea: a nonstop stream of bad news can make the world look scarier than it really is.",
        [
            shot(
                "paper",
                [
                    chip("ONE IDEA", 0.5, 0.075, size=42, bg="ink", color="paper", at="idea", enter="down", sfx="blip"),
                    L("slab", color="soft", round=True, w=0.7, x=0.5, y=0.33, border=10, enter="pop", depth=0.6),
                    img("kbust-calm", 0.5, 0.34, 0.4, enter="pop"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    L("pulse", x=0.5, y=0.3, w=1.1, enter="none", color="paper"),
                    L("slab", color="paper", round=True, w=0.45, x=0.5, y=0.3, enter="pop"),
                    text("SCARIER", 0.5, 0.3, 120, color="ink", at="scarier", enter="slam", sfx="hit"),
                    chip("THAN IT REALLY IS", 0.5, 0.5, size=44, bg="accent", color="ink", at="than", enter="up", sfx="blip"),
                ],
                at="look",
                enter="iris",
                irisAt=[0.5, 0.3],
                cam={"z": [1.0, 1.08]},
            ),
        ],
    ),
    scene(
        "caveat",
        "Still, it was a survey. It shows a link, not a cause. Anxious people might scroll more, too.",
        [
            shot(
                "paper-grid",
                [
                    img("kbust-pocket", 0.5, 0.58, 0.36, enter="pop", delay=-0.2),
                    chip("A SURVEY", 0.3, 0.1, size=46, bg="ink", color="paper", at="start", enter="left", sfx="blip"),
                    text("A LINK", 0.5, 0.24, 210, color="ink", mark="accent", at="link", enter="slam", sfx="hit"),
                    text("NOT A CAUSE", 0.5, 0.4, 130, color="graphite", at="cause", enter="up"),
                ],
                cam={"z": [1.0, 1.05], "punch": ["link"]},
            ),
            shot(
                "accent",
                [
                    img("face-tired", 0.5, 0.33, 0.46, enter="pop"),
                    chip("ANXIOUS PEOPLE MAY SCROLL MORE", 0.5, 0.56, size=34, bg="ink", color="paper", at="Anxious", enter="up", sfx="blip"),
                ],
                at="Anxious",
                enter="slide-u",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "tip",
        "A simple idea: pick a time to check the news, and a time to *stop*. Then put the phone down.",
        [
            shot(
                "accent",
                [
                    chip("A SIMPLE IDEA", 0.5, 0.075, size=44, bg="ink", color="paper", at="simple", enter="down", sfx="blip"),
                    L("clock", x=0.5, y=0.3, w=0.46, time=[{"at": "start", "v": 480}, {"at": "stop", "v": 495}], digital=True, glide=30, enter="pop"),
                    chip("CHECK THE NEWS", 0.28, 0.52, size=36, bg="white", color="ink", at="check", enter="left", sfx="blip"),
                    chip("THEN STOP", 0.74, 0.58, size=36, bg="ink", color="paper", at="stop", enter="right", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "paper",
                [
                    img("kfull-point", 0.5, 0.36, 0.26, enter="up"),
                    L("phone", x=0.78, y=0.4, w=0.18, enter="right", screens=[{"at": "start", "s": "off"}], rot=10, id="ph8c"),
                    text("phone down", 0.5, 0.6, 120, font="hand", color="ink", upper=False, at="down", enter="pop", rot=-3),
                ],
                at="Then",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "close",
        "Staying informed is fine. Staying *stuck* isn't. You can look at the news... and then look away.",
        [
            shot(
                "accent",
                [
                    img("kbust-pen", 0.5, 0.34, 0.54, enter="pop", loop="breathe"),
                    text("look away", 0.5, 0.58, 160, font="hand", color="ink", upper=False, at="away", enter="pop", rot=-3),
                ],
                cam={"z": [1.0, 1.07]},
            )
        ],
        tone="prof-soft",
    ),
    OUTRO,
]

build(
    "p008-doomscrolling",
    "Why You Can't Stop Doomscrolling",
    "dreamer.mp3",
    [
        "Shabahang, R., et al. (2024). Doomscrolling evokes existential anxiety and fosters pessimism about humanity? Computers in Human Behavior Reports, 15, 100438. https://doi.org/10.1016/j.chbr.2024.100438",
    ],
    scenes,
)
