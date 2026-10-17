#!/usr/bin/env python3
"""p005: Why You Treat Future You Like a Stranger  (Pronin et al. 2008; Ersner-Hershfield et al. 2009; Hershfield et al. 2011).

Cautious by design: all three are small lab studies, the drink amounts come from secondary descriptions of Pronin's
own review, and the brain-scan correlation is fragile. The script says "researchers suggest" and shows "small study" tags.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403

CUPS3 = [
    {"label": "RIGHT NOW", "sub": "≈ 2 TABLESPOONS", "level": 0.125, "at": "start"},
    {"label": "FUTURE YOU", "sub": "≈ ½ CUP", "level": 0.5, "at": "later"},
    {"label": "A STRANGER", "sub": "≈ ½ CUP", "level": 0.5, "at": "stranger"},
]

scenes = [
    scene(
        "hook",
        "Present you says: 'I'll do it tomorrow.' Tomorrow you says: 'Who agreed to *this*?'",
        [
            shot(
                "paper",
                [
                    L("slab", color="accent", round=True, w=0.9, x=0.5, y=0.35, border=10, enter="pop", depth=0.6, delay=-0.3),
                    img("face-smile", 0.5, 0.36, 0.5, enter="pop", delay=-0.3),
                    L("bubble", text="I'll do it tomorrow.", x=0.5, y=0.1, size=54, at="Present", enter="pop", loop="float", sfx="pop"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    img("face-annoyed", 0.5, 0.38, 0.5, enter="pop"),
                    L("bubble", text="Who agreed to this?", x=0.5, y=0.1, size=54, at="Who", enter="pop", loop="float", sfx="pop"),
                    chip("TOMORROW, 8:00 AM", 0.5, 0.58, size=40, bg="accent", color="ink", at="Tomorrow#2", enter="up", sfx="blip"),
                ],
                at="Tomorrow#2",
                enter="flash",
                cam={"z": [1.0, 1.08], "punch": ["Who"]},
            ),
        ],
    ),
    scene(
        "name",
        "Psychologists have a name for the gap. *Future self-continuity*: how connected you feel to the person you'll become.",
        [
            shot(
                "accent",
                [
                    chip("A NAME FOR THE GAP", 0.5, 0.075, size=40, bg="ink", color="paper", at="start", enter="down"),
                    text("?", 0.5, 0.4, 460, color="ink", rot=8, at="start", enter="pop", delay=-0.2),
                    text("FUTURE\nSELF-CONTINUITY", 0.5, 0.2, 150, color="ink", stroke="paper", strokeW=8, at="Future", enter="slam", sfx="hit"),
                    img("body-front", 0.22, 0.46, 0.17, enter="left", delay=-0.2),
                    img("body-34", 0.78, 0.46, 0.17, enter="right", delay=-0.2),
                    L("scribble", shape="arrow", x=0.5, y=0.45, w=0.24, h=0.06, color="paper", strokeW=14, at="become", dur=12, curve=0.0),
                    chip("YOU NOW", 0.22, 0.62, size=30, bg="ink", color="paper", at="start", enter="up"),
                    chip("YOU LATER", 0.78, 0.62, size=30, bg="ink", color="paper", at="start", enter="up"),
                ],
                cam={"z": [1.0, 1.05]},
            )
        ],
    ),
    scene(
        "experiment",
        "In one experiment, students decided how much of a *disgusting* drink they'd swallow for science. A murky mix of soy sauce, ketchup, and water.",
        [
            shot(
                "paper-grid",
                [
                    chip("A LAB EXPERIMENT", 0.5, 0.075, size=40, bg="ink", color="paper", at="experiment", enter="down", sfx="blip"),
                    img("face-calm", 0.3, 0.3, 0.42, enter="pop", rot=-5, delay=-0.2),
                    img("face-shock", 0.3, 0.3, 0.42, at="disgusting", enter="pop", rot=-5),
                    L("cups", x=0.74, y=0.26, w=0.36, items=[{"label": "", "level": 0.8, "at": "decided"}], enter="none", id="c1"),
                    cite("Pronin et al. · 2008", "experiment"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "accent",
                [
                    chip("SOY SAUCE", 0.5, 0.12, size=44, bg="ink", color="paper", at="soy", enter="down", sfx="blip"),
                    chip("KETCHUP", 0.5, 0.2, size=44, bg="white", color="ink", at="ketchup", enter="down", sfx="blip"),
                    chip("WATER", 0.5, 0.28, size=44, bg="ink", color="paper", at="water", enter="down", sfx="blip"),
                    L("cups", x=0.5, y=0.43, w=0.3, items=[{"label": "YUCK", "level": 0.85, "at": "murky"}], enter="none", id="c2"),
                ],
                at="murky",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "numbers",
        "Drinking right now? Roughly two tablespoons. But for a session later? Roughly half a *cup*.",
        [
            shot(
                "paper",
                [
                    chip("ROUGH NUMBERS", 0.5, 0.075, size=36, bg="soft", color="ink", at="start", enter="down"),
                    L("cups", x=0.5, y=0.34, w=0.9, items=CUPS3[:2], enter="none", at="start"),
                ],
                cam={"z": [1.0, 1.06], "punch": ["cup"]},
            )
        ],
    ),
    scene(
        "stranger",
        "And when asked about a *stranger*? About the same: half a cup.",
        [
            shot(
                "accent",
                [
                    chip("ROUGH NUMBERS", 0.5, 0.075, size=36, bg="ink", color="paper", at="start", enter="down"),
                    L("cups", x=0.5, y=0.33, w=0.94, items=[{**CUPS3[0], "at": "start"}, {**CUPS3[1], "at": "start+0.1"}, {**CUPS3[2], "at": "stranger"}], enter="none", at="start"),
                    chip("FUTURE YOU ≈ A STRANGER", 0.5, 0.6, size=40, bg="ink", color="paper", at="same", enter="up", sfx="hit"),
                ],
                cam={"z": [1.0, 1.06]},
            )
        ],
    ),
    scene(
        "why",
        "One idea from the researchers: right now, you feel the yuck. Later, it's just an *idea*.",
        [
            shot(
                "paper",
                [
                    img("face-shock", 0.28, 0.34, 0.42, enter="left"),
                    chip("RIGHT NOW: FEELS REAL", 0.28, 0.54, size=26, bg="ink", color="paper", at="right", enter="up", sfx="blip"),
                    img("face-calm", 0.74, 0.34, 0.36, at="Later", enter="right"),
                    chip("LATER: JUST AN IDEA", 0.74, 0.54, size=26, bg="accent", color="ink", at="Later", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            )
        ],
    ),
    scene(
        "brain",
        "A small brain-scan study of eighteen students hints at it too. A region linked to thinking about yourself was *less* active when they pictured themselves ten years later.",
        [
            shot(
                "ink-grid",
                [
                    chip("SMALL STUDY", 0.5, 0.075, size=40, bg="accent", color="ink", at="small", enter="down", sfx="blip"),
                    L("counter", to=18, size=380, color="paper", x=0.5, y=0.2, at="eighteen", dur=20, enter="none", stroke="ink", shadow="accent"),
                    chip("STUDENTS IN A BRAIN SCANNER", 0.5, 0.36, size=34, bg="paper", color="ink", at="students", enter="up"),
                    img("brain", 0.5, 0.5, 0.3, at="brain-scan", enter="pop"),
                    cite("Ersner-Hershfield et al. · 2009", "small"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    chip("ILLUSTRATION, NOT REAL DATA", 0.5, 0.075, size=28, bg="soft", color="ink", at="start", enter="down"),
                    chip("A \"THIS IS ME\" REGION", 0.5, 0.135, size=34, bg="paper", color="ink", at="region", enter="down"),
                    L("bars", x=0.46, y=0.34, w=0.7, h=0.38, items=[{"label": "ME NOW", "value": 0.75, "color": "accent", "at": "region"}, {"label": "ME IN 10 YEARS", "value": 0.45, "color": "paper", "at": "less"}], gap=[0, 1], gapAt="less", labelColor="paper", enter="none", at="start"),
                ],
                at="region",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "mirror",
        "In another study, people who saw an *aged* version of their own face said they'd set aside more money for retirement.",
        [
            shot(
                "paper-grid",
                [
                    img("face-calm", 0.3, 0.3, 0.42, enter="left"),
                    img("face-calm", 0.74, 0.3, 0.42, at="aged", enter="pop", rot=5, filter="grayscale(1) brightness(1.18) contrast(0.8) blur(0.4px)"),
                    chip("YOU TODAY", 0.3, 0.12, size=28, bg="white", color="ink", at="start", enter="down"),
                    chip("YOU AT 70 (EDITED PHOTO)", 0.74, 0.12, size=28, bg="accent", color="ink", at="aged", enter="down"),
                    chip("AN AGED VERSION OF YOU", 0.5, 0.5, size=36, bg="ink", color="paper", at="aged", enter="up", sfx="blip"),
                    cite("Hershfield et al. · 2011", "study"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "accent",
                [
                    chip("ILLUSTRATION, NOT REAL DATA", 0.5, 0.075, size=28, bg="ink", color="paper", at="start", enter="down"),
                    chip("MONEY FOR RETIREMENT", 0.5, 0.135, size=34, bg="white", color="ink", at="start", enter="down"),
                    L("bars", x=0.46, y=0.34, w=0.7, h=0.36, items=[{"label": "NO PHOTO", "value": 0.5, "color": "white", "at": "set"}, {"label": "AGED PHOTO", "value": 0.7, "color": "ink", "at": "more"}], enter="none", at="start"),
                ],
                at="set",
                enter="wipe-l",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "tip",
        "So make future you *real*. Picture them tomorrow morning, tired, opening this task. Then do them a favor.",
        [
            shot(
                "paper",
                [
                    L("slab", color="accent", round=True, w=0.9, x=0.5, y=0.33, border=10, enter="pop", depth=0.6),
                    img("face-tired", 0.5, 0.34, 0.5, enter="pop"),
                    chip("TOMORROW, 8:00 AM", 0.5, 0.075, size=40, bg="ink", color="paper", at="tomorrow", enter="down", sfx="blip"),
                ],
                cam={"z": [1.0, 1.07]},
            ),
            shot(
                "accent",
                [
                    img("body-gesture", 0.4, 0.38, 0.3, enter="left"),
                    L("heart", x=0.72, y=0.28, w=0.22, at="favor", enter="pop", pulse=["favor"], rot=10),
                    text("do them\na favor", 0.5, 0.58, 120, font="hand", color="ink", upper=False, at="Then", enter="pop", rot=-3),
                ],
                at="Then",
                enter="wipe-r",
                cam={"z": [1.0, 1.07]},
            ),
        ],
    ),
    scene(
        "close",
        "Future you isn't a stranger. They're you, just a little *later*.",
        [
            shot(
                "accent",
                [
                    img("body-front", 0.26, 0.37, 0.22, enter="left"),
                    L("scribble", shape="arrow", x=0.5, y=0.38, w=0.2, h=0.06, color="ink", strokeW=14, at="They're", dur=12, curve=0.0),
                    img("body-34", 0.74, 0.37, 0.22, at="later", enter="right"),
                    text("you, later", 0.5, 0.585, 120, font="hand", color="ink", upper=False, at="later", enter="pop", rot=-3),
                ],
                cam={"z": [1.0, 1.06]},
            )
        ],
        tone="prof-soft",
    ),
    OUTRO,
]

build(
    "p005-future-self",
    "Why You Treat Future You Like a Stranger",
    "gymnopedie-no-1.mp3",
    [
        "Pronin, E., Olivola, C. Y., & Kennedy, K. A. (2008). Doing unto future selves as you would do unto others: Psychological distance and decision making. Personality and Social Psychology Bulletin, 34(2), 224-236. https://doi.org/10.1177/0146167207310023",
        "Ersner-Hershfield, H., Wimmer, G. E., & Knutson, B. (2009). Saving for the future self: Neural measures of future self-continuity predict temporal discounting. Social Cognitive and Affective Neuroscience, 4(1), 85-92. https://doi.org/10.1093/scan/nsn042",
        "Hershfield, H. E., Goldstein, D. G., Sharpe, W. F., Fox, J., Yeykelis, L., Carstensen, L. L., & Bailenson, J. N. (2011). Increasing saving behavior through age-progressed renderings of the future self. Journal of Marketing Research, 48(SPL), S23-S37.",
        "Pronin, E. (2008). How we see ourselves and how we see others. Science, 320(5880), 1177-1180 (describes the drink experiment).",
    ],
    scenes,
)
