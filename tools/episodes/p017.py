#!/usr/bin/env python3
"""p017: 20-second showcase Short: Why You Can't Tickle Yourself (Blakemore, Wolpert & Frith 1998, Nature Neuroscience 1, 635-640).
Self-produced touch rated less 'tickly' than the same touch from a robot; tickliness rose as a delay grew from 0 to 200 ms."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403

scenes = [
    scene(
        "hook",
        "You can tickle anyone. Except *yourself*. Why?",
        [
            shot(
                "accent",
                [
                    L("slab", color="paper", round=True, w=1.0, x=0.5, y=0.36, border=10, enter="pop", depth=0.6, delay=-0.3),
                    img("kfull-point2", 0.5, 0.38, 0.34, enter="pop", delay=-0.3, loop="bob"),
                    L("burst", text="HEE\nHEE!", x=0.8, y=0.12, w=0.3, at="tickle", enter="slam", rot=8, seed=3, fill="paper", sfx="pop"),
                ],
                cam={"z": [1.0, 1.1], "punch": ["tickle"]},
            ),
            shot(
                "ink",
                [
                    big("EXCEPT\nYOURSELF", size=190, y=0.24, color="accent", at="Except"),
                    img("face-skeptic", 0.5, 0.56, 0.34, at="Except+0.2", enter="pop", rot=-4),
                ],
                at="Except",
                enter="flash",
                cam={"z": [1.0, 1.08], "shake": ["Except"]},
            ),
            shot(
                "accent",
                [
                    text("?", 0.5, 0.3, 700, color="ink", stroke="paper", strokeW=22, enter="pop", sfx="hit"),
                ],
                at="Why",
                enter="slam" if False else "punch",
                cam={"z": [1.0, 1.1], "punch": ["Why"]},
            ),
        ],
    ),
    scene(
        "predict",
        "Your brain *predicts* your own touch... and turns the volume down.",
        [
            shot(
                "paper-grid",
                [
                    L("pulse", x=0.5, y=0.3, w=1.1, enter="none", color="ink"),
                    img("brain", 0.5, 0.3, 0.46, enter="pop", loop="breathe", delay=-0.2),
                    tag("YOUR BRAIN PREDICTS"),
                ],
                cam={"z": [1.0, 1.1]},
            ),
            shot(
                "ink",
                [
                    L("battery", x=0.5, y=0.22, w=0.8, label="TOUCH VOLUME", level=[{"at": "start", "v": 1.0}, {"at": "down", "v": 0.15}], glide=22, enter="pop"),
                    chip("TURNED DOWN", 0.5, 0.4, size=44, bg="accent", color="ink", at="volume", enter="up", sfx="blip"),
                ],
                at="turns",
                enter="wipe-r",
                cam={"z": [1.0, 1.08]},
            ),
        ],
    ),
    scene(
        "robot",
        "Scientists tested it with a robot arm. Same touch. But when *you* made it, it felt less ticklish.",
        [
            shot(
                "ink-grid",
                [
                    tag("THE TEST: A ROBOT ARM", bg="accent", color="ink"),
                    cite("Blakemore et al. · 1998", "start"),
                    L("slab", color="paper", w=0.3, h=0.18, x=0.28, y=0.3, radius=24, border=8, enter="left", delay=-0.2),
                    text("ROBOT", 0.28, 0.3, 70, color="ink", at="robot", enter="pop"),
                    text("= SAME TOUCH =", 0.5, 0.5, 70, color="paper", at="Same", enter="slam", sfx="hit"),
                    img("face-calm", 0.74, 0.3, 0.26, enter="right", delay=-0.2),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "paper",
                [
                    text("SAME\nTOUCH", 0.5, 0.26, 260, color="ink", mark="accent", at="Same", enter="slam", sfx="hit"),
                    img("kfull-point", 0.5, 0.58, 0.2, at="Same+0.2", enter="up"),
                ],
                at="Same",
                enter="flash",
                cam={"z": [1.0, 1.09], "punch": ["Same"]},
            ),
            shot(
                "accent",
                [
                    L("bars", x=0.46, y=0.3, w=0.7, h=0.38, items=[{"label": "BY ROBOT", "value": 0.85, "color": "ink", "at": "start"}, {"label": "BY YOU", "value": 0.35, "color": "paper", "at": "you"}], gap=[0, 1], gapAt="less", enter="none", at="start"),
                    chip("ILLUSTRATION, NOT REAL DATA", 0.5, 0.075, size=26, bg="ink", color="paper", at="start", enter="down"),
                    chip("HOW TICKLISH", 0.5, 0.58, size=34, bg="white", color="ink", at="start", enter="up"),
                    img("face-smile", 0.86, 0.12, 0.2, at="less+0.2", enter="pop", rot=6),
                ],
                at="But",
                enter="slide-l",
                cam={"z": [1.0, 1.08]},
            ),
        ],
    ),
    scene(
        "delay",
        "Add a delay of just a fifth of a second... and the tickle *comes back*.",
        [
            shot(
                "paper",
                [
                    chip("YOU MOVE", 0.28, 0.16, size=46, bg="ink", color="paper", at="start", enter="left", delay=-0.2),
                    L("scribble", shape="arrow", x=0.5, y=0.16, w=0.2, h=0.07, color="accent", strokeW=16, at="delay", dur=12, curve=0.0),
                    chip("TOUCH", 0.76, 0.16, size=46, bg="accent", color="ink", at="delay", enter="right", sfx="blip"),
                    img("kfull-point", 0.5, 0.36, 0.24, enter="up", delay=-0.2),
                    L("counter", to=200, suffix=" ms", size=190, color="ink", x=0.5, y=0.5, at="delay", dur=22, enter="none", stroke="paper", shadow="accent", sfx="hit"),
                ],
                cam={"z": [1.0, 1.1], "punch": ["fifth"]},
            ),
            shot(
                "ink-grid",
                [
                    L("chart", x=0.5, y=0.28, w=0.9, h=0.34, xlabel="DELAY", ylabel="TICKLISH", series=[{"pts": [[0.05, 0.1], [0.95, 0.9]], "color": "accent", "at": "tickle", "dur": 20, "label": "BACK!"}], enter="up", at="start"),
                    chip("ILLUSTRATION OF THE TREND", 0.5, 0.075, size=26, bg="soft", color="ink", at="start", enter="down"),
                ],
                at="and",
                enter="wipe-l",
                cam={"z": [1.0, 1.06], "shake": ["back"]},
            ),
        ],
    ),
    scene(
        "close",
        "Your brain isn't ignoring you. It's just *not surprised*.",
        [
            shot(
                "ink",
                [
                    big("NOT\nIGNORING\nYOU", size=170, y=0.26, color="paper", at="start"),
                    img("face-smile", 0.5, 0.58, 0.28, enter="pop", at="start+0.2", rot=4),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "paper",
                [
                    L("stamp", text="NOT SURPRISED", sub="PERFECTLY PREDICTED", x=0.5, y=0.26, size=110, at="surprised", enter="slam", sfx="hit"),
                    img("kbust-calm", 0.5, 0.54, 0.36, enter="pop", delay=-0.2),
                ],
                at="just",
                enter="iris",
                irisAt=[0.5, 0.3],
                cam={"z": [1.0, 1.08], "punch": ["surprised"]},
            ),
        ],
        tone="prof-soft",
    ),
]

build(
    "p017-tickle-showcase",
    "Why You Can't Tickle Yourself",
    "easy-lemon.mp3",
    [
        "Blakemore, S.-J., Wolpert, D. M., & Frith, C. D. (1998). Central cancellation of self-produced tickle sensation. Nature Neuroscience, 1(7), 635-640. https://doi.org/10.1038/2870",
    ],
    scenes,
)
