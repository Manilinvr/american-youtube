#!/usr/bin/env python3
"""p014: Are Incompetent People Really Blind to It?  (Dunning-Kruger; Kruger & Dunning 1999; Gignac & Zajenkowski 2020; Dunkel et al. 2023).

Reasoning format. The famous claim is partly a statistical artifact; a small real effect may remain. The script says exactly that.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403

scenes = [
    scene(
        "hook",
        "You've seen the meme. 'The less you know, the more confident you are.' And you can think of someone who fits *perfectly*. It's called the Dunning-Kruger effect. But there's a problem. If it were that simple, why do scientists keep arguing about it?",
        [
            shot(
                "accent",
                [
                    img("kbust-pocket2", 0.5, 0.36, 0.52, enter="pop", delay=-0.3),
                    L("bubble", text="I know everything.", x=0.5, y=0.1, size=50, at="start", enter="pop", loop="float", delay=-0.2),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            slam_shot("ink", "THE LESS\nYOU KNOW...", size=200, at="less", color="accent"),
            shot(
                "paper-grid",
                [
                    tag("THE MEME"),
                    L("bars", x=0.46, y=0.28, w=0.7, h=0.36, items=[{"label": "KNOWLEDGE", "value": 0.2, "color": "paper", "at": "start"}, {"label": "CONFIDENCE", "value": 0.95, "color": "accent", "at": "confident"}], enter="none", at="start"),
                    chip("THE MEME, NOT DATA", 0.5, 0.56, size=30, bg="white", color="ink", at="confident", enter="up"),
                ],
                at="And",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
            slam_shot("accent", "WHY ARE\nSCIENTISTS\nARGUING?", size=170, at="arguing", face="face-skeptic"),
        ],
    ),
    scene(
        "origin",
        "Let's start with the original. In 1999, David Dunning and Justin Kruger tested students on humor, grammar, and logic. Then they asked everyone: how do you think you did?",
        [
            shot(
                "paper",
                [
                    tag("1999: THE ORIGINAL STUDY"),
                    cite("Kruger & Dunning · 1999", "start"),
                    img("kbust-pen", 0.5, 0.38, 0.5, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "ink-grid",
                [
                    tag("THREE TESTS", bg="accent", color="ink"),
                    chip("HUMOR", 0.3, 0.2, size=56, bg="paper", color="ink", at="humor", enter="left", sfx="blip"),
                    chip("GRAMMAR", 0.7, 0.3, size=56, bg="accent", color="ink", at="grammar", enter="right", sfx="blip"),
                    chip("LOGIC", 0.32, 0.4, size=56, bg="paper", color="ink", at="logic", enter="left", sfx="blip"),
                ],
                at="tested",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    big("HOW DID\nYOU DO?", size=230, y=0.26, at="how"),
                    img("face-thinking", 0.5, 0.58, 0.3, at="how+0.2", enter="pop", rot=-4),
                ],
                at="Then",
                enter="flash",
                cam={"z": [1.0, 1.07], "punch": ["how"]},
            ),
        ],
    ),
    scene(
        "finding",
        "Here's what they found. The people who scored in the bottom quarter were actually around the twelfth percentile. But they guessed they were around the *sixty-second*. Way above average. While they were near the bottom.",
        [
            shot(
                "paper-grid",
                [
                    tag("THE BOTTOM QUARTER"),
                    L("counter", to=12, suffix="th", size=420, color="ink", x=0.5, y=0.22, at="twelfth", dur=18, enter="none", stroke="paper", shadow="accent", sfx="hit"),
                    chip("THEIR REAL RANK (PERCENTILE)", 0.5, 0.42, size=34, bg="ink", color="paper", at="twelfth", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06], "punch": ["twelfth"]},
            ),
            shot(
                "accent",
                [
                    tag("BUT THEY GUESSED...", bg="ink"),
                    L("counter", to=62, suffix="nd", size=420, color="ink", x=0.5, y=0.22, at="sixty-second", dur=18, enter="none", stroke="paper", shadow="paper", sfx="hit"),
                    chip("THEIR GUESSED RANK", 0.5, 0.42, size=34, bg="white", color="ink", at="sixty-second", enter="up", sfx="blip"),
                ],
                at="guessed",
                enter="wipe-r",
                cam={"z": [1.0, 1.06], "punch": ["sixty-second"]},
            ),
            shot(
                "ink-grid",
                [
                    L("chart", x=0.5, y=0.28, w=0.9, h=0.34, xlabel="REAL RANK", ylabel="GUESSED RANK", series=[{"pts": [[0.05, 0.62], [0.95, 0.75]], "color": "accent", "at": "Way", "label": "WHAT THEY GUESSED"}, {"pts": [[0.05, 0.1], [0.95, 0.95]], "color": "paper", "at": "Way", "dash": True, "label": "PERFECT GUESS"}], enter="up", at="start"),
                    chip("ILLUSTRATION OF THE IDEA, NOT REAL DATA", 0.5, 0.075, size=26, bg="soft", color="ink", at="start", enter="down"),
                ],
                at="Way",
                enter="slide-u",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "story",
        "That's a great story. The people who lack a skill also lack the ability to *see* that they lack it. It's catchy, it feels true, and it went viral. But a good thinker asks: is that the only way to get this picture?",
        [
            shot(
                "paper",
                [
                    tag("A GREAT STORY"),
                    img("kbust-calm", 0.5, 0.38, 0.5, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    L("card", kind="neutral", title="THE STORY", text="NO SKILL =\nNO WAY TO SEE\nYOU HAVE NO SKILL", x=0.5, y=0.25, w=0.9, size=46, at="lack", enter="up", sfx="blip"),
                    chip("CATCHY · TRUE-FEELING · VIRAL", 0.5, 0.52, size=32, bg="ink", color="paper", at="catchy", enter="up", sfx="blip"),
                ],
                at="The",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
            slam_shot("ink", "THE ONLY\nWAY?", size=230, at="only", color="accent", face="face-skeptic"),
        ],
    ),
    scene(
        "dartboard",
        "Try this thought experiment. Imagine everyone is *bad* at guessing their own rank. Just noisy, random guesses. And add one more thing: most people like to think they're above average. Now look at the bottom quarter. Where can their guesses go? They can't guess *lower* than the bottom. They can only be too high.",
        [
            shot(
                "paper-grid",
                [
                    tag("A THOUGHT EXPERIMENT"),
                    img("face-thinking", 0.5, 0.38, 0.46, enter="pop", delay=-0.2),
                    chip("EVERYONE GUESSES BADLY", 0.5, 0.62, size=38, bg="accent", color="ink", at="bad", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "accent",
                [
                    tag("ADD ONE MORE THING", bg="ink"),
                    big("MOST OF US\nFEEL ABOVE\nAVERAGE", size=150, y=0.25, at="above"),
                    img("face-smile", 0.5, 0.58, 0.28, at="above+0.2", enter="pop", rot=4),
                ],
                at="And",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["above"]},
            ),
            shot(
                "ink-grid",
                [
                    tag("NOW LOOK AT THE BOTTOM", bg="accent", color="ink"),
                    L("slab", color="paper", w=0.84, h=0.07, x=0.5, y=0.3, radius=16, border=8, enter="up"),
                    text("FLOOR", 0.5, 0.3, 70, color="ink", at="bottom", enter="pop"),
                    L("scribble", shape="arrow", x=0.5, y=0.2, w=0.14, h=0.09, color="accent", strokeW=14, at="go", dur=10, rot=-90, curve=0.0),
                    chip("YOUR GUESS CAN'T GO DOWN", 0.5, 0.42, size=36, bg="paper", color="ink", at="lower", enter="up", sfx="blip"),
                ],
                at="Now",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
            slam_shot("accent", "ONLY\nTOO HIGH", size=240, at="only", face="face-shock"),
        ],
    ),
    scene(
        "mirror",
        "And the top quarter? The mirror image. Their guesses can only go *down*, so they look a bit modest. So you get the famous picture even if nobody is blind to anything. Just noise, plus a ceiling and a floor.",
        [
            shot(
                "paper",
                [
                    tag("THE TOP QUARTER"),
                    L("slab", color="soft", w=0.84, h=0.07, x=0.5, y=0.3, radius=16, border=8, enter="up"),
                    text("CEILING", 0.5, 0.3, 70, color="ink", at="top", enter="pop"),
                    chip("THEIR GUESS CAN ONLY GO DOWN", 0.5, 0.44, size=34, bg="accent", color="ink", at="down", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "ink",
                [
                    L("pairs", x=0.5, y=0.2, w=0.86, h=0.36, legendA="REAL RANK", legendB="GUESSED RANK", labelColor="paper", groups=[{"label": "BOTTOM", "a": 0.12, "b": 0.5, "at": "famous"}, {"label": "LOWER", "a": 0.37, "b": 0.55, "at": "famous+0.2"}, {"label": "UPPER", "a": 0.62, "b": 0.6, "at": "famous+0.4"}, {"label": "TOP", "a": 0.88, "b": 0.7, "at": "famous+0.6"}], enter="none", at="start"),
                    chip("ILLUSTRATION OF THE IDEA, NOT REAL DATA", 0.5, 0.075, size=26, bg="soft", color="ink", at="start", enter="down"),
                ],
                at="So",
                enter="wipe-l",
                cam={"z": [1.0, 1.05]},
            ),
            slam_shot("accent", "NOISE +\nA FLOOR", size=240, at="noise", face="face-calm"),
        ],
    ),
    scene(
        "science",
        "That's not just my idea. In 2020, researchers re-analyzed the data with better statistics, and concluded the effect is *mostly* a statistical artifact. Then others replied: not so fast. A small real effect might remain.",
        [
            shot(
                "paper-grid",
                [
                    tag("2020: A RE-ANALYSIS"),
                    cite("Gignac & Zajenkowski · 2020", "start"),
                    img("kbust-pen2", 0.5, 0.38, 0.5, enter="pop", delay=-0.2),
                    chip("BETTER STATISTICS", 0.5, 0.64, size=38, bg="ink", color="paper", at="statistics", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    big("MOSTLY AN\nARTIFACT", size=190, y=0.26, at="mostly"),
                    img("face-surprised", 0.5, 0.58, 0.3, at="mostly+0.2", enter="pop", rot=4),
                ],
                at="concluded",
                enter="flash",
                cam={"z": [1.0, 1.07], "punch": ["mostly"]},
            ),
            shot(
                "ink-grid",
                [
                    tag("LATER: A REPLY", bg="accent", color="ink"),
                    cite("Dunkel et al. · 2023", "start"),
                    chip("NOT SO FAST", 0.5, 0.2, size=60, bg="paper", color="ink", at="not", enter="pop", sfx="blip"),
                    big("A SMALL\nREAL EFFECT?", size=150, y=0.4, color="paper", at="small"),
                ],
                at="Then",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "verdict",
        "So here's my verdict. Overconfidence is real, and everyone has it, not only 'dumb' people. The dramatic version, that the unskilled are *blind* to their own gaps, is probably exaggerated. At best, it's a small effect, and it's tangled up with plain statistics.",
        [
            shot(
                "paper",
                [
                    L("stamp", text="VERDICT", sub="REAL, BUT EXAGGERATED", x=0.5, y=0.22, size=150, at="verdict", enter="slam", sfx="hit"),
                    img("kbust-calm", 0.5, 0.5, 0.36, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.06], "punch": ["verdict"]},
            ),
            shot(
                "accent",
                [
                    L("card", kind="for", title="STILL TRUE", text="EVERYONE IS\nOVERCONFIDENT\nSOMETIMES.", x=0.5, y=0.22, w=0.9, size=46, at="real", enter="left", sfx="blip"),
                    L("card", kind="against", title="PROBABLY EXAGGERATED", text="THE UNSKILLED\nARE BLIND TO\nTHEIR GAPS.", x=0.5, y=0.46, w=0.9, size=46, at="exaggerated", enter="right", sfx="blip"),
                ],
                at="Overconfidence",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "advice",
        "And this is useful. Don't use the label on other people. It's a lazy insult. Use it on yourself, gently. Before a big decision, ask: how would I know I'm wrong? Check your guess against something real, a test, a number, or a friend who will tell you the truth.",
        [
            shot(
                "accent",
                [
                    tag("WHAT TO DO (MY ADVICE, NOT A FINDING)"),
                    L("scribble", shape="cross", x=0.5, y=0.26, w=0.6, h=0.2, color="ink", strokeW=20, at="label", dur=10, outline=False),
                    chip("DON'T USE IT AS AN INSULT", 0.5, 0.2, size=40, bg="white", color="ink", at="Don't", enter="down", sfx="blip"),
                    img("face-skeptic", 0.5, 0.5, 0.3, enter="pop", at="Don't"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "paper-grid",
                [
                    tag("ASK YOURSELF"),
                    L("bubble", text="How would I know I'm wrong?", x=0.5, y=0.2, size=48, at="How", enter="pop", sfx="pop"),
                    img("kbust-pen", 0.5, 0.5, 0.4, enter="pop", delay=-0.2),
                ],
                at="Before",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    tag("CHECK YOUR GUESS", bg="accent", color="ink"),
                    chip("A TEST", 0.3, 0.2, size=56, bg="paper", color="ink", at="test", enter="left", sfx="blip"),
                    chip("A NUMBER", 0.7, 0.3, size=56, bg="accent", color="ink", at="number", enter="right", sfx="blip"),
                    chip("A HONEST FRIEND", 0.4, 0.4, size=56, bg="paper", color="ink", at="friend", enter="left", sfx="blip"),
                ],
                at="Check",
                enter="slide-u",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "close",
        "So the real lesson isn't 'other people are overconfident.' It's this: *all* of us are guessing, and guessing badly. The wise move isn't to feel certain. It's to check.",
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
                    text("don't be sure. check.", 0.5, 0.58, 120, font="hand", color="ink", upper=False, enter="pop", rot=-3),
                ],
                at="wise",
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
    "p014-dunning-kruger",
    "Are Incompetent People Really Blind to It?",
    "easy-lemon.mp3",
    [
        "Kruger, J., & Dunning, D. (1999). Unskilled and unaware of it: How difficulties in recognizing one's own incompetence lead to inflated self-assessments. Journal of Personality and Social Psychology, 77(6), 1121-1134.",
        "Gignac, G. E., & Zajenkowski, M. (2020). The Dunning-Kruger effect is (mostly) a statistical artefact: Valid approaches to testing the hypothesis with individual differences data. Intelligence, 80, 101449.",
        "Dunkel, C. S., Nedelec, J., & van der Linden, D. (2023). Reevaluating the Dunning-Kruger effect: A response to and replication of Gignac and Zajenkowski (2020). Intelligence, 96, 101717.",
    ],
    scenes,
)
