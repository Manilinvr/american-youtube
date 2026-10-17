#!/usr/bin/env python3
"""p018: same story as p017 (can't tickle yourself) in the CORAL theme with the new toolkit: versus, timeline, quote, ticker, countdown,
blinds / spin / split / zoom-out entrances. A 'before / after' demo of the variety upgrade."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403

scenes = [
    scene(
        "hook",
        "You can tickle anyone. Except *yourself*. Why?",
        [
            hook_quote("YOU CAN'T\nTICKLE\nYOURSELF.", by="EVERY HUMAN"),
            shot(
                "ink",
                [
                    L("ticker", text="EXCEPT YOURSELF", x=0.5, y=0.3, size=120, bg="accent", color="ink", tilt=-6, speed=14, enter="none"),
                    img("face-skeptic", 0.5, 0.52, 0.34, enter="pop", at="Except", rot=-4),
                ],
                at="Except",
                enter="blinds",
                cam={"z": [1.0, 1.08], "shake": ["Except"]},
            ),
            shot(
                "accent",
                [
                    L("countdown", **{"from": 3}, x=0.5, y=0.3, size=560, at="Why", enter="none", step=0.3, end=1),
                ],
                at="Why",
                enter="spin",
                cam={"z": [1.0, 1.1]},
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
                    L("versus", left={"title": "YOU", "text": "MOVE"}, right={"title": "YOUR BRAIN", "text": "PREDICTS"}, winner="right", winAt="predicts", x=0.5, y=0.27, w=0.94, size=50, enter="none", delay=-0.3),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "ink",
                [
                    L("battery", x=0.5, y=0.22, w=0.8, label="TOUCH VOLUME", level=[{"at": "start", "v": 1.0}, {"at": "down", "v": 0.15}], glide=22, enter="pop"),
                    chip("TURNED DOWN", 0.5, 0.4, size=44, bg="accent", color="ink", at="volume", enter="up", sfx="blip"),
                ],
                at="turns",
                enter="split",
                cam={"z": [1.0, 1.08]},
            ),
        ],
    ),
    scene(
        "robot",
        "Scientists tested it with a robot arm. Same touch. But when *you* made it, it felt less ticklish.",
        [
            shot(
                "accent",
                [
                    tag("THE TEST: A ROBOT ARM"),
                    cite("Blakemore et al. · 1998", "start"),
                    L("ticker", text="ROBOT ARM TEST", x=0.5, y=0.3, size=90, bg="ink", color="accent", tilt=-3, speed=12, enter="none"),
                    img("kfull-point", 0.5, 0.52, 0.24, enter="up", delay=-0.2),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "paper",
                [
                    big("SAME\nTOUCH", size=270, y=0.27, at="Same", color="ink", mark="accent"),
                    img("face-calm", 0.5, 0.6, 0.28, at="Same+0.2", enter="pop", rot=4),
                ],
                at="Same",
                enter="zoom-out",
                cam={"z": [1.0, 1.09], "punch": ["Same"]},
            ),
            shot(
                "paper-grid",
                [
                    chip("ILLUSTRATION, NOT REAL DATA", 0.5, 0.075, size=26, bg="soft", color="ink", at="start", enter="down"),
                    L("versus", left={"title": "BY A ROBOT", "text": "MORE\nTICKLISH"}, right={"title": "BY YOU", "text": "LESS\nTICKLISH"}, winner="right", winAt="less", x=0.5, y=0.27, w=0.94, size=48, enter="none", at="start"),
                ],
                at="But",
                enter="blinds",
                cam={"z": [1.0, 1.07]},
            ),
        ],
    ),
    scene(
        "delay",
        "Add a delay of just a fifth of a second... and the tickle *comes back*.",
        [
            shot(
                "ink-grid",
                [
                    L("timeline", x=0.5, y=0.24, w=0.92, labelColor="paper", events=[{"at": "delay", "x": 0.14, "label": "0 MS", "sub": "NOT TICKLISH"}, {"at": "fifth", "x": 0.86, "label": "200 MS", "sub": "TICKLISH AGAIN"}], enter="none", delay=-0.2),
                    chip("ILLUSTRATION OF THE TREND", 0.5, 0.075, size=26, bg="soft", color="ink", at="start", enter="down"),
                    L("counter", to=200, suffix=" ms", size=170, color="paper", x=0.5, y=0.5, at="delay", dur=22, enter="none", stroke="ink", shadow="accent", sfx="hit"),
                ],
                cam={"z": [1.0, 1.08], "punch": ["fifth"]},
            ),
            shot(
                "accent",
                [
                    L("ticker", text="THE TICKLE COMES BACK", x=0.5, y=0.28, size=110, bg="ink", color="accent", tilt=-5, speed=15, enter="none", sfx="hit"),
                    L("burst", text="HEE\nHEE!", x=0.78, y=0.5, w=0.3, at="back", enter="slam", rot=8, seed=3, fill="paper", sfx="pop"),
                ],
                at="tickle",
                enter="spin",
                cam={"z": [1.0, 1.08], "shake": ["back"]},
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

ep = build(
    "p018-tickle-coral",
    "Why You Can't Tickle Yourself (coral theme demo)",
    "dreamer.mp3",
    ["Blakemore, S.-J., Wolpert, D. M., & Frith, C. D. (1998). Central cancellation of self-produced tickle sensation. Nature Neuroscience, 1(7), 635-640."],
    scenes,
)
import json
f = ROOT / "episodes" / "p018-tickle-coral.json"
d = json.loads(f.read_text()); d["theme"] = "coral"; f.write_text(json.dumps(d, indent="\t", ensure_ascii=False) + "\n")
