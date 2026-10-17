#!/usr/bin/env python3
"""p003: Can You Really Feel Someone Staring at You?  (Mareschal, Calder & Clifford 2013; Colwell et al. 2000)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403

scenes = [
    scene(
        "hook",
        "You're on the train. And suddenly, you just *know*: someone is staring at you.",
        [
            shot(
                {"photo": "bg-window", "blur": 7, "bright": 0.7, "dim": 0.15},
                [
                    img("body-back", 0.5, 0.4, 0.3, enter="pop", loop="breathe", delay=-0.3),
                    chip("ON THE TRAIN", 0.5, 0.085, size=42, bg="ink", color="paper", at="train", enter="down", sfx="blip"),
                    text("?", 0.8, 0.2, 380, color="accent", stroke="ink", strokeW=16, rot=10, at="suddenly", enter="pop", sfx="blip"),
                ],
                cam={"z": [1.0, 1.12], "y": [0.5, 0.42]},
            ),
            shot(
                "ink",
                [
                    L("eyes", x=0.5, y=0.3, w=0.84, look=[{"at": "start", "x": 0, "y": 0.1}], enter="pop"),
                    L("gaze", x=0.5, y=0.5, w=0.9, rays=11, color="accent", rot=180, enter="none", at="someone"),
                    text("STARING", 0.5, 0.5, 190, color="accent", stroke="ink", shadow="paper", at="staring", enter="slam", sfx="hit"),
                ],
                at="someone",
                enter="punch",
                cam={"z": [1.0, 1.1], "shake": ["staring"]},
            ),
        ],
    ),
    scene(
        "turn",
        "You turn around... and they *are*! So, is it a sixth sense?",
        [
            shot(
                "soft",
                [
                    img("body-back", 0.5, 0.4, 0.3, enter="none", out="around"),
                    img("face-shock", 0.5, 0.38, 0.5, at="around", enter="pop"),
                    L("burst", text="THEY\nARE!", x=0.8, y=0.15, w=0.3, at="are", enter="slam", rot=8, seed=4, sfx="hit"),
                ],
                cam={"z": [1.0, 1.08], "punch": ["are"]},
            ),
            shot(
                "accent",
                [
                    text("6TH\nSENSE?", 0.5, 0.3, 280, color="ink", stroke="paper", strokeW=10, at="sixth", enter="slam", sfx="hit"),
                    img("face-skeptic", 0.5, 0.55, 0.34, at="sense", enter="pop", rot=-5),
                ],
                at="sixth",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["sixth"]},
            ),
        ],
    ),
    scene(
        "study",
        "Scientists have tested it for over a hundred years. Careful tests have found no reliable sixth sense.",
        [
            shot(
                "paper",
                [
                    L("gaze", x=0.5, y=0.3, w=0.8, rays=11, color="ink", rot=180, enter="none"),
                    chip("SCIENTISTS HAVE TESTED IT", 0.5, 0.075, size=36, bg="accent", color="ink", enter="down", at="start"),
                    img("body-back", 0.5, 0.47, 0.25, enter="up", delay=-0.2),
                    L("eyes", x=0.5, y=0.17, w=0.4, look=[{"at": "start", "x": 0, "y": 0.3}], enter="down", at="start", id="st0"),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "paper-grid",
                [
                    text("100+", 0.5, 0.2, 400, color="ink", mark="accent", at="hundred", enter="slam", sfx="hit"),
                    chip("YEARS OF TESTS", 0.5, 0.38, size=46, bg="ink", color="paper", at="years", enter="up", sfx="blip"),
                    chip("1898 · 1913 · 2000", 0.5, 0.46, size=36, bg="white", color="ink", at="years", enter="up"),
                ],
                at="hundred",
                enter="punch",
                cam={"z": [1.0, 1.07], "punch": ["hundred"]},
            ),
            shot(
                "ink",
                [
                    text("SIXTH SENSE", 0.5, 0.26, 200, color="paper", at="Careful", enter="slam", sfx="hit"),
                    L("scribble", shape="strike", x=0.5, y=0.27, w=0.88, h=0.06, color="accent", strokeW=26, at="reliable", dur=9, outline=False),
                    chip("NO RELIABLE EVIDENCE", 0.5, 0.42, size=40, bg="accent", color="ink", at="reliable", enter="up", sfx="blip"),
                    cite("Colwell et al. · 2000 (review)", "Careful"),
                ],
                at="Careful",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "clue",
        "So why does it feel so real? Here's a clue from a 2013 study. People judged where a face was looking, when its eyes were fuzzy and hard to read.",
        [
            shot(
                "paper",
                [
                    img("face-thinking", 0.5, 0.36, 0.56, enter="pop", delay=-0.2),
                    text("?", 0.84, 0.16, 300, color="accent", stroke="ink", strokeW=14, rot=10, at="real", enter="pop"),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "ink",
                [
                    chip("2013 LAB STUDY", 0.5, 0.075, size=42, bg="accent", color="ink", at="2013", enter="down", sfx="blip"),
                    L("eyes", x=0.5, y=0.3, w=0.8, look=[{"at": "start", "x": 0.3, "y": 0}], enter="none", at="start", id="clue"),
                    chip("WHERE IS IT LOOKING?", 0.5, 0.52, size=40, bg="paper", color="ink", at="judged", enter="up", sfx="blip"),
                    cite("Mareschal et al. · Current Biology · 2013", "2013"),
                ],
                at="Here's",
                enter="slide-l",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    chip("2013 LAB STUDY", 0.5, 0.075, size=42, bg="accent", color="ink", enter="none", at="2013"),
                    L("eyes", x=0.5, y=0.3, w=0.8, look=[{"at": "start", "x": 0.3, "y": 0}], blur=7, jitter=0.9, enter="none", at="start", id="clue2"),
                    chip("FUZZY, HARD TO READ", 0.5, 0.52, size=40, bg="paper", color="ink", at="fuzzy", enter="up", sfx="blip"),
                    cite("Mareschal et al. · Current Biology · 2013", "2013") | {"enter": "none"},
                ],
                at="when",
                enter="cut",
                cam={"z": [1.0, 1.1]},
            ),
        ],
    ),
    scene(
        "result",
        "When the eyes were hard to read, people tended to see the gaze as aimed *at them*.",
        [
            shot(
                "ink-grid",
                [
                    L("eyes", x=0.5, y=0.24, w=0.76, look=[{"at": "start", "x": 0.3, "y": 0}, {"at": "aimed", "x": 0, "y": 0.15}], blur=6, jitter=0.9, enter="none", id="res"),
                    L("gaze", x=0.5, y=0.38, w=0.7, rays=9, color="accent", rot=180, at="aimed", enter="none"),
                    img("face-surprised", 0.5, 0.56, 0.36, at="aimed", enter="pop", rot=3),
                    L("burst", text="AT ME!", x=0.76, y=0.5, w=0.28, at="them", enter="slam", rot=8, seed=2, sfx="hit"),
                ],
                cam={"z": [1.0, 1.08], "punch": ["them"]},
            )
        ],
    ),
    scene(
        "prior",
        "The researchers call it an expectation: when we're unsure, the brain assumes someone is looking *at us*.",
        [
            shot(
                "accent",
                [
                    L("pulse", x=0.5, y=0.32, w=1.0, enter="none", color="ink"),
                    img("brain", 0.5, 0.32, 0.5, enter="pop", loop="breathe"),
                    chip("EXPECTATION", 0.5, 0.075, size=46, bg="ink", color="paper", at="expectation", enter="down", sfx="blip"),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "ink",
                [
                    L("eyes", x=0.5, y=0.2, w=0.7, look=[{"at": "start", "x": 0, "y": 0.2}], enter="none", id="pr"),
                    L("gaze", x=0.5, y=0.38, w=0.9, rays=11, color="accent", rot=180, enter="none"),
                    text("AT ME", 0.5, 0.52, 260, color="accent", stroke="ink", shadow="paper", at="assumes", enter="slam", sfx="hit"),
                ],
                at="assumes",
                enter="flash",
                cam={"z": [1.0, 1.08], "punch": ["assumes"]},
            ),
        ],
    ),
    scene(
        "why",
        "Why? One idea: it's a *safer* bet. Wrongly assuming a stare costs little. Missing a real one might cost more.",
        [
            shot(
                "paper-grid",
                [
                    chip("A SAFER BET", 0.5, 0.075, size=46, bg="accent", color="ink", at="safer", enter="down", sfx="blip"),
                    L("scale", x=0.5, y=0.3, w=0.9, count=1, leftAt="Wrongly", rightAt="Missing", tilt=[{"at": "start", "v": 0}, {"at": "Missing", "v": 0.9}], enter="up"),
                    chip("IMAGINED STARE", 0.26, 0.55, size=32, bg="white", color="ink", at="Wrongly", enter="up"),
                    chip("MISSED STARE", 0.74, 0.55, size=32, bg="ink", color="paper", at="Missing", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            )
        ],
    ),
    scene(
        "about",
        "And a direct gaze often means something is *about to happen*: a conversation, or a threat.",
        [
            shot(
                "ink",
                [
                    L("eyes", x=0.5, y=0.22, w=0.7, look=[{"at": "start", "x": 0, "y": 0}], enter="pop", id="abt"),
                    chip("A CONVERSATION", 0.3, 0.42, size=40, bg="paper", color="ink", at="conversation", enter="left", sfx="blip"),
                    chip("OR A THREAT", 0.68, 0.5, size=40, bg="accent", color="ink", at="threat", enter="right", sfx="blip"),
                    L("burst", text="!", x=0.85, y=0.12, w=0.2, at="happen", enter="slam", rot=10, seed=6, sfx="hit"),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "accent",
                [
                    img("face-shock", 0.5, 0.34, 0.5, enter="pop"),
                    chip("OR A THREAT", 0.5, 0.58, size=46, bg="ink", color="paper", at="threat", enter="up", sfx="blip"),
                ],
                at="threat",
                enter="slide-u",
                cam={"z": [1.0, 1.08]},
            ),
        ],
    ),
    scene(
        "tip",
        "So the next time you feel watched, remember: your brain is *guessing*. And it guesses, 'me.'",
        [
            shot(
                "paper",
                [
                    L("slab", color="accent", round=True, w=0.9, x=0.5, y=0.33, border=10, enter="pop", depth=0.6),
                    img("face-skeptic", 0.5, 0.34, 0.5, enter="pop"),
                    text("JUST A GUESS", 0.5, 0.58, 150, color="ink", mark="accent", at="guessing", enter="slam", sfx="hit"),
                ],
                cam={"z": [1.0, 1.07]},
            )
        ],
    ),
    scene(
        "close",
        "No sixth sense. Just a careful brain, keeping an *eye* out for you.",
        [
            shot(
                "accent",
                [
                    L("eyes", x=0.5, y=0.26, w=0.7, look=[{"at": "start", "x": -0.3, "y": 0}, {"at": "careful", "x": 0.3, "y": 0}, {"at": "eye", "x": 0, "y": 0.1}], enter="pop", id="cl"),
                ],
                cam={"z": [1.0, 1.07]},
            ),
            shot(
                "paper",
                [
                    L("slab", color="accent", round=True, w=0.86, x=0.5, y=0.32, border=10, enter="pop", depth=0.6),
                    img("face-smile", 0.5, 0.33, 0.5, enter="pop"),
                    L("heart", x=0.8, y=0.14, w=0.16, at="you", enter="pop", pulse=["you"], rot=12),
                ],
                at="keeping",
                enter="iris",
                irisAt=[0.5, 0.33],
                cam={"z": [1.0, 1.08]},
            ),
        ],
        tone="prof-soft",
    ),
    OUTRO,
]

build(
    "p003-being-stared-at",
    "Can You Really Feel Someone Staring at You?",
    "easy-lemon.mp3",
    [
        "Mareschal, I., Calder, A. J., & Clifford, C. W. G. (2013). Humans have an expectation that gaze is directed toward them. Current Biology, 23(8), 717-721. https://doi.org/10.1016/j.cub.2013.03.030",
        "Colwell, J., Schroder, S., & Sladen, D. (2000). The ability to detect unseen staring: A literature review and empirical tests. British Journal of Psychology, 91(1), 71-85.",
        "Titchener, E. B. (1898). The 'feeling of being stared at'. Science, 8(208), 895-897.",
    ],
    scenes,
)
