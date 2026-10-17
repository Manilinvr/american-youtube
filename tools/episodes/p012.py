#!/usr/bin/env python3
"""p012: Is Willpower Really a Battery?  (reasoning format).

Baumeister et al. 1998 (radishes vs chocolates) -> Hagger et al. 2016 (23 labs, N=2141, d=0.04) -> Vohs et al. 2021 (36 labs, N=3531, d=0.06).
Cautious: the 2021 'fatigue' hint is exploratory; the video says 'a hint', not 'a finding'.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403


def tag(label, **kw):
    return chip(label, 0.5, 0.075, size=34, bg=kw.pop("bg", "ink"), color=kw.pop("color", "paper"), at="start", enter="down", **kw)


scenes = [
    scene(
        "hook",
        "Everyone says willpower is like a battery. You use it up during the day, and by evening, you're empty. It feels *true*. So why can't scientists find the battery?",
        [
            shot(
                "accent",
                [
                    L("battery", x=0.5, y=0.24, w=0.8, label="WILLPOWER", level=[{"at": "start", "v": 1.0}, {"at": "evening", "v": 0.12}], glide=60, enter="pop", delay=-0.3),
                    img("kbust-mug", 0.5, 0.45, 0.4, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "soft",
                [
                    L("battery", x=0.5, y=0.2, w=0.8, label="EMPTY", level=[{"at": "start", "v": 0.1}], enter="none", at="start"),
                    img("face-tired", 0.5, 0.46, 0.36, enter="pop", delay=-0.2, rot=-4),
                    L("burst", text="EVENING", x=0.8, y=0.5, w=0.3, at="empty", enter="slam", rot=8, seed=3, sfx="hit"),
                ],
                at="evening",
                enter="slide-l",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    text("FEELS\nTRUE", 0.5, 0.22, 270, color="accent", stroke="ink", shadow="paper", at="true", enter="slam", sfx="hit"),
                    img("face-tired", 0.5, 0.5, 0.34, at="true+0.2", enter="pop", rot=-4),
                ],
                at="true",
                enter="punch",
                cam={"z": [1.0, 1.07], "punch": ["true"]},
            ),
            shot(
                "paper-grid",
                [
                    L("battery", x=0.5, y=0.2, w=0.8, label="???", level=[{"at": "start", "v": 0.0}], enter="none", at="start"),
                    text("WHERE IS\nTHE BATTERY?", 0.5, 0.42, 150, color="ink", mark="accent", at="find", enter="slam", sfx="hit"),
                    L("scribble", shape="circle", x=0.5, y=0.2, w=0.9, h=0.16, color="accent", strokeW=16, at="find", dur=12),
                ],
                at="So",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "origin",
        "The idea comes from a famous experiment in 1998. People sat in front of fresh chocolates. Some were allowed to eat them. Others had to eat *radishes* instead, and resist the chocolate.",
        [
            shot(
                "paper",
                [
                    tag("1998: THE FAMOUS EXPERIMENT"),
                    cite("Baumeister et al. · 1998", "start"),
                    img("kbust-pen", 0.5, 0.38, 0.5, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    tag("FRESH CHOCOLATES"),
                    img("kbust-mug", 0.5, 0.34, 0.46, enter="pop", delay=-0.2),
                    text("DON'T EAT\nTHEM", 0.5, 0.58, 90, color="ink", at="resist", enter="slam", sfx="hit"),
                ],
                at="People",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "paper-grid",
                [
                    tag("GROUP A: CHOCOLATE"),
                    L("slab", color="graphite", round=True, w=0.34, x=0.3, y=0.3, border=10, enter="pop", at="allowed"),
                    text("YUM", 0.3, 0.3, 120, color="paper", at="allowed", enter="slam"),
                    chip("GROUP B: RADISHES", 0.7, 0.2, size=36, bg="accent", color="ink", at="Others", enter="right", sfx="blip"),
                    L("slab", color="accent", round=True, w=0.34, x=0.7, y=0.36, border=10, enter="pop", at="radishes"),
                    text("BLEH", 0.7, 0.36, 120, color="ink", at="radishes", enter="slam"),
                ],
                at="Some",
                enter="slide-l",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "result1",
        "Then everyone got a puzzle that, secretly, couldn't be solved. The radish group gave up sooner. Their willpower, it seemed, was *used up*.",
        [
            shot(
                "ink-grid",
                [
                    tag("THE TWIST: AN IMPOSSIBLE PUZZLE", bg="accent", color="ink"),
                    text("UNSOLVABLE", 0.5, 0.2, 170, color="paper", at="secretly", enter="slam", sfx="hit"),
                    img("face-skeptic", 0.5, 0.5, 0.34, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "accent",
                [
                    chip("ILLUSTRATION, NOT REAL DATA", 0.5, 0.075, size=28, bg="ink", color="paper", at="start", enter="down"),
                    L("bars", x=0.46, y=0.3, w=0.7, h=0.4, items=[{"label": "CHOCOLATE", "value": 0.8, "color": "paper", "at": "start"}, {"label": "RADISHES", "value": 0.4, "color": "ink", "at": "radish"}], enter="none", at="start"),
                    chip("TIME BEFORE GIVING UP", 0.5, 0.58, size=32, bg="white", color="ink", at="gave", enter="up"),
                ],
                at="radish",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "spread",
        "The idea spread everywhere. Hundreds of experiments seemed to agree. A 2010 review of almost two hundred tests found a medium-sized effect.",
        [
            shot(
                "paper-grid",
                [
                    tag("THE IDEA SPREADS"),
                    L("dots", x=0.5, y=0.3, w=0.88, total=150, cols=15, hit=150, hitAt="start+0.3", at="start", delay=-0.4, step=0.05, hitStep=0.04, enter="none", id="d150"),
                    text("≈ 200 TESTS", 0.5, 0.55, 140, color="ink", mark="accent", at="almost", enter="slam", sfx="hit"),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    tag("A 2010 REVIEW", bg="ink"),
                    text("MEDIUM\nEFFECT", 0.5, 0.25, 250, color="ink", stroke="paper", strokeW=10, at="medium", enter="slam", sfx="hit"),
                    img("face-surprised", 0.5, 0.56, 0.3, at="medium+0.2", enter="pop", rot=-4),
                ],
                at="A",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["medium"]},
            ),
        ],
    ),
    scene(
        "doubt",
        "But here's where I get suspicious. A result that big should be easy to repeat. So labs tried. In 2016, *twenty-three* labs ran the same test, with over two thousand people. The effect? Almost zero.",
        [
            shot(
                "accent",
                [
                    tag("MY FIRST DOUBT", bg="ink"),
                    img("kbust-pocket", 0.5, 0.4, 0.46, enter="pop", delay=-0.2),
                    L("scribble", shape="underline", x=0.5, y=0.14, w=0.7, h=0.04, color="paper", strokeW=14, at="suspicious", dur=10),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    text("EASY TO\nREPEAT?", 0.5, 0.25, 220, color="paper", at="easy", enter="slam", sfx="hit"),
                    img("face-skeptic", 0.5, 0.56, 0.3, at="easy+0.2", enter="pop", rot=-4),
                ],
                at="easy",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["easy"]},
            ),
            shot(
                "paper",
                [
                    tag("A BIG, CAREFUL REPEAT · 2016"),
                    cite("Hagger et al. · 2016", "start"),
                    L("counter", to=23, size=420, color="ink", x=0.5, y=0.22, at="twenty", dur=18, enter="none", stroke="paper", shadow="accent", sfx="hit"),
                    chip("LABS", 0.5, 0.42, size=40, bg="ink", color="paper", at="labs", enter="up", sfx="blip"),
                ],
                at="In",
                enter="wipe-r",
                cam={"z": [1.0, 1.06], "punch": ["twenty"]},
            ),
            shot(
                "accent",
                [
                    tag("AND THE PEOPLE", bg="ink"),
                    L("counter", to=2141, size=330, color="ink", x=0.5, y=0.25, at="over", dur=24, enter="none", stroke="paper", shadow="paper", sfx="hit"),
                    L("dots", x=0.5, y=0.48, w=0.7, total=60, cols=12, hit=0, at="over", step=0.2, enter="none", id="d60"),
                ],
                at="over",
                enter="slide-u",
                cam={"z": [1.0, 1.06], "punch": ["over"]},
            ),
            shot(
                "ink",
                [
                    text("≈ 0", 0.5, 0.24, 520, color="accent", stroke="ink", shadow="paper", at="Almost", enter="slam", sfx="hit"),
                    chip("THE EFFECT", 0.5, 0.45, size=44, bg="paper", color="ink", at="Almost+0.3", enter="up"),
                ],
                at="effect",
                enter="flash",
                cam={"z": [1.0, 1.08], "punch": ["Almost"]},
            ),
        ],
    ),
    scene(
        "again",
        "Maybe that particular test was just a bad one. Fair point. So in 2021, *thirty-six* labs tried again, with thirty-five hundred people and a new design. Again: a tiny effect, close to zero.",
        [
            shot(
                "paper-grid",
                [
                    tag("MAYBE THE TEST WAS BAD?"),
                    img("face-thinking", 0.5, 0.4, 0.4, enter="pop", delay=-0.2),
                    chip("FAIR POINT", 0.5, 0.64, size=40, bg="accent", color="ink", at="Fair", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "accent",
                [
                    img("kbust-pen", 0.5, 0.36, 0.5, enter="pop", delay=-0.2),
                    chip("A NEW DESIGN", 0.5, 0.075, size=40, bg="ink", color="paper", at="start", enter="down"),
                ],
                at="Fair",
                enter="wipe-l",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink-grid",
                [
                    tag("TRY AGAIN · 2021", bg="accent", color="ink"),
                    cite("Vohs et al. · 2021", "start"),
                    L("counter", to=36, size=420, color="paper", x=0.5, y=0.22, at="thirty-six", dur=20, enter="none", stroke="ink", shadow="accent", sfx="hit"),
                    chip("LABS · 3,531 PEOPLE", 0.5, 0.42, size=40, bg="paper", color="ink", at="thirty-five", enter="up", sfx="blip"),
                ],
                at="thirty-six",
                enter="wipe-l",
                cam={"z": [1.0, 1.06], "punch": ["thirty-six"]},
            ),
            shot(
                "accent",
                [
                    text("≈ 0\nAGAIN", 0.5, 0.27, 300, color="ink", stroke="paper", strokeW=10, enter="slam", sfx="hit"),
                ],
                at="Again#2",
                enter="flash",
                cam={"z": [1.0, 1.07], "punch": ["Again#2"]},
            ),
            shot(
                "ink",
                [
                    text("CLOSE TO\nZERO", 0.5, 0.26, 230, color="accent", stroke="ink", shadow="paper", enter="slam", sfx="hit"),
                    img("kbust-calm", 0.5, 0.56, 0.3, at="close+0.2", enter="pop"),
                ],
                at="close",
                enter="punch",
                cam={"z": [1.0, 1.07], "punch": ["close"]},
            ),
        ],
    ),
    scene(
        "think1",
        "So let's think. There are two possibilities. One: the battery exists, but we keep measuring it badly. Two: there's no battery.",
        [
            shot(
                "paper",
                [
                    tag("LET'S THINK"),
                    img("kbust-pen2", 0.5, 0.38, 0.5, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "paper-grid",
                [
                    L("card", kind="neutral", title="POSSIBILITY 1", text="THE BATTERY EXISTS.\nWE MEASURE IT BADLY.", x=0.5, y=0.22, w=0.86, size=50, at="One", enter="left", sfx="blip"),
                    L("card", kind="neutral", title="POSSIBILITY 2", text="THERE IS\nNO BATTERY.", x=0.5, y=0.45, w=0.86, size=50, at="Two#2", enter="right", sfx="blip"),
                ],
                at="One",
                enter="slide-u",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "think2",
        "Notice a detail. In the big 2021 study, the only *hint* of an effect showed up in people who already felt tired. That isn't a battery draining. That's just... tiredness.",
        [
            shot(
                "ink-grid",
                [
                    tag("A DETAIL WORTH NOTICING", bg="accent", color="ink"),
                    img("face-tired", 0.5, 0.36, 0.44, enter="pop", delay=-0.2),
                    chip("ONLY A HINT", 0.5, 0.62, size=44, bg="paper", color="ink", at="hint", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "paper-grid",
                [
                    tag("THE BIG 2021 STUDY"),
                    cite("Vohs et al. · 2021", "start"),
                    L("dots", x=0.5, y=0.3, w=0.8, total=100, cols=20, hit=0, at="start", delay=-0.4, step=0.1, enter="none", id="d100b"),
                    text("ONLY A HINT", 0.5, 0.5, 130, color="ink", mark="accent", at="hint", enter="slam", sfx="hit"),
                ],
                at="big",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "paper",
                [
                    tag("IN THE 2021 STUDY"),
                    L("slab", color="soft", round=True, w=0.8, x=0.5, y=0.3, border=10, enter="pop", at="already"),
                    img("face-tired", 0.5, 0.3, 0.44, at="already", enter="pop", rot=4),
                    chip("ALREADY TIRED", 0.5, 0.56, size=40, bg="accent", color="ink", at="already", enter="up", sfx="blip"),
                ],
                at="already",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "accent",
                [
                    L("battery", x=0.5, y=0.2, w=0.7, label="TIRED?", level=[{"at": "start", "v": 0.3}], enter="none", at="start"),
                    L("scribble", shape="cross", x=0.5, y=0.2, w=0.7, h=0.16, color="ink", strokeW=18, at="isn't", dur=10, outline=False),
                    text("JUST\nTIREDNESS", 0.5, 0.42, 160, color="ink", stroke="paper", strokeW=8, at="tiredness", enter="slam", sfx="hit"),
                ],
                at="isn't",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["tiredness"]},
            ),
        ],
    ),
    scene(
        "verdict",
        "So here's my verdict. Willpower is *not* a fuel tank that runs dry. But you're not a machine either. When you're tired, bored, or stressed, self-control gets harder.",
        [
            shot(
                "paper",
                [
                    L("stamp", text="VERDICT", sub="NOT A FUEL TANK", x=0.5, y=0.22, size=170, at="verdict", enter="slam", sfx="hit"),
                    img("kbust-calm", 0.5, 0.5, 0.36, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.06], "punch": ["verdict"]},
            ),
            shot(
                "accent",
                [
                    img("kbust-calm", 0.5, 0.36, 0.44, enter="pop", delay=-0.2),
                    tag("BUT YOU'RE NOT A MACHINE", bg="ink"),
                    chip("TIRED", 0.2, 0.6, size=56, bg="white", color="ink", at="tired", enter="left", sfx="blip"),
                    chip("BORED", 0.78, 0.66, size=56, bg="ink", color="paper", at="bored", enter="right", sfx="blip"),
                    chip("STRESSED", 0.36, 0.4, size=56, bg="white", color="ink", at="stressed", enter="left", sfx="blip"),
                    text("HARDER", 0.5, 0.56, 110, color="ink", at="harder", enter="slam"),
                ],
                at="But",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "advice",
        "So don't plan around saving up willpower. Plan around *rest*, and make good choices easier when you're tired. Pack the gym bag the night before. Hide the cookies. Take real breaks.",
        [
            shot(
                "accent",
                [
                    tag("WHAT TO DO (MY ADVICE, NOT A FINDING)"),
                    chip("1  REST FIRST", 0.5, 0.2, size=46, bg="white", color="ink", at="rest", enter="left", sfx="blip"),
                    chip("2  MAKE IT EASY", 0.5, 0.3, size=46, bg="ink", color="paper", at="easier", enter="right", sfx="blip"),
                    img("kbust-pen", 0.5, 0.42, 0.34, enter="pop", at="rest"),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "paper-grid",
                [
                    tag("3  PACK THE GYM BAG"),
                    img("kfull-bag", 0.3, 0.38, 0.28, enter="left"),
                    chip("THE NIGHT BEFORE", 0.7, 0.2, size=36, bg="accent", color="ink", at="night", enter="right", sfx="blip"),
                ],
                at="Pack",
                enter="slide-l",
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    tag("4  HIDE THE COOKIES"),
                    L("slab", color="ink", round=True, w=0.5, x=0.5, y=0.3, enter="pop"),
                    text("OUT OF\nSIGHT", 0.5, 0.3, 120, color="accent", at="Hide", enter="slam", sfx="hit"),
                ],
                at="Hide",
                enter="flash",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    tag("5  TAKE REAL BREAKS", bg="accent", color="ink"),
                    L("clock", x=0.5, y=0.3, w=0.44, time=[{"at": "start", "v": 600}, {"at": "Take", "v": 615}], glide=30, enter="pop"),
                ],
                at="Take",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "close",
        "Your willpower isn't running out. It's just... tired. And that's something you can *fix*.",
        [
            shot(
                "accent",
                [
                    img("kbust-calm", 0.5, 0.34, 0.54, enter="pop", loop="breathe"),
                ],
                cam={"z": [1.0, 1.07]},
            ),
            shot(
                "paper",
                [
                    L("slab", color="accent", round=True, w=0.86, x=0.5, y=0.32, border=10, enter="pop", depth=0.6),
                    img("kbust-pen", 0.5, 0.34, 0.5, enter="pop"),
                    text("rest, then try", 0.5, 0.58, 140, font="hand", color="ink", upper=False, enter="pop", rot=-3),
                ],
                at="that's",
                enter="iris",
                irisAt=[0.5, 0.34],
                cam={"z": [1.0, 1.08]},
            ),
        ],
        tone="prof-soft",
    ),
    OUTRO,
]

build(
    "p012-willpower-battery",
    "Is Willpower Really a Battery?",
    "thinking-music.mp3",
    [
        "Baumeister, R. F., Bratslavsky, E., Muraven, M., & Tice, D. M. (1998). Ego depletion: Is the active self a limited resource? Journal of Personality and Social Psychology, 74(5), 1252-1265.",
        "Hagger, M. S., et al. (2016). A multilab preregistered replication of the ego-depletion effect. Perspectives on Psychological Science, 11(4), 546-573. https://doi.org/10.1177/1745691616652873",
        "Vohs, K. D., et al. (2021). A multisite preregistered paradigmatic test of the ego-depletion effect. Psychological Science, 32(10), 1566-1581. https://doi.org/10.1177/0956797621989733",
    ],
    scenes,
)
