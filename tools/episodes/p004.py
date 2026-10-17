#!/usr/bin/env python3
"""p004: Why One Bad Comment Beats Ten Compliments  (Baumeister et al. 2001; Ito et al. 1998)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403

SCALE = lambda **kw: L("scale", x=0.5, y=0.3, w=0.9, **kw)

scenes = [
    scene(
        "hook",
        "Ten people loved your work. One person didn't. Guess which one you're still thinking about at *midnight*.",
        [
            shot(
                "paper-grid",
                [
                    L("dots", x=0.5, y=0.2, w=0.92, total=11, cols=11, hit=10, hitAt="Ten", at="start", delay=-0.5, step=0.4, hitStep=2, enter="none", id="d11"),
                    chip("TEN PEOPLE LOVED YOUR WORK", 0.5, 0.075, size=34, bg="ink", color="paper", at="start", enter="down"),
                    chip("10 LOVED IT", 0.34, 0.33, size=44, bg="accent", color="ink", at="loved", enter="up", sfx="blip"),
                    chip("1 DIDN'T", 0.72, 0.4, size=44, bg="ink", color="paper", at="didn't", enter="up", sfx="blip"),
                    L("scribble", shape="circle", x=0.88, y=0.2, w=0.14, h=0.08, color="accent", strokeW=14, at="didn't", dur=10),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "ink",
                [
                    text("12:00 AM", 0.5, 0.22, 240, color="accent", stroke="ink", shadow="paper", at="midnight", enter="slam", sfx="hit"),
                    img("face-tired", 0.5, 0.45, 0.46, at="Guess", enter="pop"),
                ],
                at="Guess",
                enter="iris",
                irisAt=[0.5, 0.4],
                cam={"z": [1.0, 1.08], "punch": ["midnight"]},
            ),
        ],
    ),
    scene(
        "proverb",
        "As an old Russian proverb says: a spoonful of tar spoils a barrel of *honey*.",
        [
            shot(
                "accent",
                [
                    text("A BARREL\nOF HONEY", 0.5, 0.25, 220, color="ink", stroke="paper", strokeW=8, enter="none", delay=-0.3),
                    L("slab", color="ink", round=True, w=0.2, x=0.5, y=0.43, at="tar", enter="drop", sfx="hit"),
                    text("a spoonful of tar", 0.5, 0.58, 110, font="hand", color="ink", upper=False, at="spoonful", enter="pop", rot=-3),
                    chip("OLD RUSSIAN PROVERB", 0.5, 0.075, size=38, bg="ink", color="paper", at="proverb", enter="down", sfx="blip"),
                ],
                cam={"z": [1.0, 1.07], "shake": ["tar"]},
            )
        ],
    ),
    scene(
        "name",
        "Psychologists call it the *negativity bias*. Bad things tend to weigh more than good things.",
        [
            shot(
                "ink",
                [
                    text("NEGATIVITY\nBIAS", 0.5, 0.26, 230, color="paper", at="negativity", enter="slam", sfx="hit"),
                    L("scribble", shape="underline", x=0.5, y=0.43, w=0.8, h=0.05, color="accent", strokeW=16, at="bias", dur=10, outline=False),
                ],
                cam={"z": [1.0, 1.06], "punch": ["negativity"]},
            ),
            shot(
                "paper-grid",
                [
                    SCALE(count=6, leftAt="good", rightAt="Bad", tilt=[{"at": "start", "v": 0}, {"at": "weigh", "v": 1}], enter="up", at="start", id="s1"),
                    chip("BAD", 0.74, 0.58, size=40, bg="ink", color="paper", at="Bad", enter="up", sfx="blip"),
                    chip("GOOD", 0.27, 0.58, size=40, bg="accent", color="ink", at="good", enter="up"),
                ],
                at="Bad",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "review",
        "A famous 2001 review looked across everyday life, relationships, and learning. Bad events had more impact than good ones.",
        [
            shot(
                "paper-grid",
                [
                    chip("A FAMOUS 2001 REVIEW", 0.5, 0.075, size=40, bg="ink", color="paper", at="famous", enter="down", sfx="blip"),
                    chip("EVERYDAY LIFE", 0.3, 0.2, size=46, bg="white", color="ink", at="everyday", enter="left", sfx="blip"),
                    chip("RELATIONSHIPS", 0.7, 0.32, size=46, bg="accent", color="ink", at="relationships", enter="right", sfx="blip"),
                    chip("LEARNING", 0.38, 0.44, size=46, bg="white", color="ink", at="learning", enter="left", sfx="blip"),
                    cite("Baumeister et al. · 2001", "famous"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "accent",
                [
                    text("BAD", 0.5, 0.2, 380, color="ink", stroke="paper", strokeW=10, at="Bad", enter="slam", sfx="hit"),
                    text(">", 0.5, 0.37, 300, color="paper", stroke="ink", strokeW=12, at="more", enter="pop"),
                    text("GOOD", 0.5, 0.52, 260, color="paper", stroke="ink", strokeW=10, at="good", enter="up"),
                ],
                at="Bad",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["Bad"]},
            ),
        ],
    ),
    scene(
        "impressions",
        "Bad impressions form faster, and they're harder to *change*.",
        [
            shot(
                "ink-grid",
                [
                    chip("ILLUSTRATION, NOT REAL DATA", 0.5, 0.075, size=28, bg="soft", color="ink", at="start", enter="down"),
                    chip("TIME TO FORM AN IMPRESSION", 0.5, 0.135, size=34, bg="paper", color="ink", at="start", enter="down"),
                    L("bars", x=0.46, y=0.33, w=0.7, h=0.38, items=[{"label": "BAD", "value": 0.28, "color": "paper", "at": "faster"}, {"label": "GOOD", "value": 0.72, "color": "accent", "at": "faster+0.2"}], labelColor="paper", enter="none", at="start"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "accent",
                [
                    img("face-angry", 0.5, 0.34, 0.5, enter="pop"),
                    chip("HARDER TO CHANGE", 0.5, 0.58, size=46, bg="ink", color="paper", at="harder", enter="up", sfx="blip"),
                ],
                at="harder",
                enter="wipe-l",
                cam={"z": [1.0, 1.07]},
            ),
        ],
    ),
    scene(
        "brain",
        "You can even see it in the brain. In one experiment, people looked at pictures while electrodes recorded their brain waves.",
        [
            shot(
                "paper",
                [
                    L("pulse", x=0.5, y=0.3, w=1.0, enter="none", color="ink"),
                    img("brain", 0.5, 0.3, 0.52, enter="pop", loop="breathe", delay=-0.2),
                    chip("YOU CAN SEE IT IN THE BRAIN", 0.5, 0.075, size=36, bg="accent", color="ink", at="brain", enter="down", sfx="blip"),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "ink",
                [
                    L("wave", x=0.5, y=0.26, w=0.86, h=0.14, enter="none", at="electrodes"),
                    chip("BRAIN WAVES (EEG)", 0.5, 0.42, size=42, bg="accent", color="ink", at="waves", enter="up", sfx="blip"),
                    cite("Ito et al. · 1998", "pictures"),
                ],
                at="pictures",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "brain2",
        "Negative pictures produced a *bigger* response than positive ones, even when both were equally intense.",
        [
            shot(
                "ink-grid",
                [
                    chip("ILLUSTRATION, NOT REAL DATA", 0.5, 0.075, size=28, bg="soft", color="ink", at="start", enter="down"),
                    chip("BRAIN RESPONSE", 0.5, 0.135, size=34, bg="paper", color="ink", at="start", enter="down"),
                    L("bars", x=0.46, y=0.33, w=0.7, h=0.38, items=[{"label": "POSITIVE", "value": 0.45, "color": "paper", "at": "Negative#1"}, {"label": "NEGATIVE", "value": 0.78, "color": "accent", "at": "produced"}], gap=[0, 1], gapAt="bigger", labelColor="paper", enter="none", at="start"),
                    L("burst", text="BIGGER!", x=0.8, y=0.47, w=0.3, at="bigger", enter="slam", rot=8, seed=5, sfx="hit"),
                    chip("EQUALLY INTENSE PICTURES", 0.5, 0.585, size=32, bg="white", color="ink", at="equally", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06], "punch": ["bigger"]},
            )
        ],
    ),
    scene(
        "why",
        "One common explanation: for our ancestors, missing a *threat* cost more than missing a good thing.",
        [
            shot(
                "paper-grid",
                [
                    chip("ONE COMMON EXPLANATION", 0.5, 0.075, size=38, bg="ink", color="paper", at="explanation", enter="down", sfx="blip"),
                    L("scale", x=0.5, y=0.3, w=0.9, count=1, leftAt="start", rightAt="threat", tilt=[{"at": "start", "v": 0}, {"at": "cost", "v": 1}], enter="up", at="start"),
                    chip("MISSED A SNACK", 0.26, 0.56, size=30, bg="white", color="ink", at="start", enter="up"),
                    chip("MISSED A THREAT", 0.74, 0.56, size=30, bg="ink", color="paper", at="threat", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            )
        ],
    ),
    scene(
        "tip",
        "So when one comment stings, give the good ones equal airtime. Read them again. *Slowly*.",
        [
            shot(
                "accent",
                [
                    chip("TRY THIS", 0.5, 0.075, size=46, bg="ink", color="paper", at="So", enter="down", sfx="blip"),
                    L("phone", x=0.5, y=0.33, w=0.34, enter="up", screens=[{"at": "start", "s": "lock"}], rot=-3),
                    chip("GREAT WORK!", 0.2, 0.2, size=36, bg="white", color="ink", at="good", enter="left", rot=-6, sfx="pop"),
                    chip("LOVED THIS", 0.82, 0.3, size=36, bg="white", color="ink", at="equal", enter="right", rot=5, sfx="pop"),
                    chip("SO HELPFUL", 0.22, 0.43, size=36, bg="white", color="ink", at="airtime", enter="left", rot=4, sfx="pop"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    text("SLOWLY", 0.5, 0.26, 280, color="accent", stroke="ink", shadow="paper", at="Slowly", enter="slam", sfx="hit"),
                    img("face-smile", 0.5, 0.5, 0.34, at="Slowly+0.1", enter="pop", rot=3),
                ],
                at="Read",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "close",
        "Your brain isn't being dramatic. It's being careful. But you still get to choose what you *keep*.",
        [
            shot(
                "paper-grid",
                [
                    L("scale", x=0.5, y=0.3, w=0.9, count=10, leftAt="start+0.2", rightAt="start", tilt=[{"at": "start", "v": 0.8}, {"at": "choose", "v": -0.8}], enter="none", at="start"),
                    chip("YOUR CHOICE", 0.5, 0.58, size=44, bg="accent", color="ink", at="choose", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            )
        ],
        tone="prof-soft",
    ),
    OUTRO,
]

build(
    "p004-negativity-bias",
    "Why One Bad Comment Beats Ten Compliments",
    "thinking-music.mp3",
    [
        "Baumeister, R. F., Bratslavsky, E., Finkenauer, C., & Vohs, K. D. (2001). Bad is stronger than good. Review of General Psychology, 5(4), 323-370. https://doi.org/10.1037/1089-2680.5.4.323",
        "Ito, T. A., Larsen, J. T., Smith, N. K., & Cacioppo, J. T. (1998). Negative information weighs more heavily on the brain: The negativity bias in evaluative categorizations. Journal of Personality and Social Psychology, 75(4), 887-900. https://doi.org/10.1037/0022-3514.75.4.887",
    ],
    scenes,
)
