#!/usr/bin/env python3
"""p016: Does Positive Thinking Actually Work?  (Wood, Perunovic & Lee 2009; Oettingen & Mayer 2002).

Reasoning format. Claims limited to what the abstracts state; the 'why' (feeling as if you already arrived) is the authors' proposal, said as such.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403

scenes = [
    scene(
        "hook",
        "Stand in front of the mirror and say, 'I'm confident. I'm lovable. I can do this.' The advice is everywhere: think positive and good things happen. It sounds so *reasonable*. But does it actually work? Or is it possible that, for some of us, it backfires?",
        [
            shot(
                "accent",
                [
                    img("kbust-calm", 0.5, 0.36, 0.52, enter="pop", delay=-0.3),
                    L("bubble", text="I'm confident!", x=0.5, y=0.1, size=52, at="start", enter="pop", loop="float", delay=-0.2),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            slam_shot("ink", "THINK\nPOSITIVE", size=250, at="positive", color="accent"),
            shot(
                "paper-grid",
                [
                    tag("THE ADVICE"),
                    chip("SAY IT", 0.3, 0.2, size=56, bg="ink", color="paper", at="say", enter="left", sfx="blip"),
                    L("scribble", shape="arrow", x=0.5, y=0.2, w=0.14, h=0.07, color="accent", strokeW=14, at="think", dur=10, curve=0.0),
                    chip("BELIEVE IT", 0.74, 0.2, size=56, bg="accent", color="ink", at="think", enter="right", sfx="blip"),
                    img("kbust-pen", 0.5, 0.5, 0.36, enter="pop", at="reasonable"),
                ],
                at="The",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
            slam_shot("accent", "OR DOES IT\nBACKFIRE?", size=190, at="backfires", face="face-skeptic"),
        ],
    ),
    scene(
        "test1",
        "Let's test the first half of that advice, positive self-talk. In 2009, psychologists asked people to repeat the sentence, 'I'm a lovable person.' Some had high self-esteem, some had low. Then they checked how everyone felt.",
        [
            shot(
                "paper",
                [
                    tag("2009: THE SELF-TALK TEST"),
                    cite("Wood, Perunovic & Lee · 2009", "start"),
                    img("kbust-pen", 0.5, 0.38, 0.5, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    tag("REPEAT THIS SENTENCE", bg="ink"),
                    L("card", kind="for", title="SAY IT", text="\"I'M A LOVABLE\nPERSON.\"", x=0.5, y=0.24, w=0.9, size=56, at="sentence", enter="up", sfx="blip"),
                ],
                at="asked",
                enter="slide-u",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "paper-grid",
                [
                    tag("TWO KINDS OF PEOPLE"),
                    chip("HIGH SELF-ESTEEM", 0.3, 0.2, size=44, bg="accent", color="ink", at="high", enter="left", sfx="blip"),
                    chip("LOW SELF-ESTEEM", 0.7, 0.3, size=44, bg="ink", color="paper", at="low", enter="right", sfx="blip"),
                    img("face-calm", 0.5, 0.56, 0.3, enter="pop", at="high"),
                ],
                at="Some",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "result1",
        "So who felt better? People with high self-esteem got a modest boost. That's the good news. But the people with *low* self-esteem, the very people the advice is meant for, actually felt worse than those who didn't repeat it.",
        [
            shot(
                "accent",
                [
                    tag("HIGH SELF-ESTEEM", bg="ink"),
                    big("A SMALL\nBOOST", size=230, y=0.25, at="modest"),
                    img("face-smile", 0.5, 0.58, 0.3, at="modest+0.2", enter="pop", rot=4),
                ],
                cam={"z": [1.0, 1.06], "punch": ["modest"]},
            ),
            shot(
                "ink",
                [
                    tag("LOW SELF-ESTEEM", bg="accent", color="ink"),
                    big("FELT\nWORSE", size=270, y=0.26, color="accent", at="worse"),
                    img("face-tired", 0.5, 0.58, 0.3, at="worse+0.2", enter="pop", rot=-4),
                ],
                at="But",
                enter="flash",
                cam={"z": [1.0, 1.07], "punch": ["worse"]},
            ),
            shot(
                "ink-grid",
                [
                    chip("ILLUSTRATION, NOT REAL DATA", 0.5, 0.075, size=28, bg="soft", color="ink", at="start", enter="down"),
                    L("pairs", x=0.5, y=0.17, w=0.86, h=0.36, legendA="DIDN'T REPEAT", legendB="REPEATED IT", labelColor="paper", groups=[{"label": "HIGH SELF-ESTEEM", "a": 0.45, "b": 0.6, "at": "start"}, {"label": "LOW SELF-ESTEEM", "a": 0.45, "b": 0.3, "at": "start+0.3"}], enter="none", at="start"),
                    chip("HOW THEY FELT AFTERWARD", 0.5, 0.58, size=32, bg="white", color="ink", at="start", enter="up"),
                ],
                at="actually",
                enter="wipe-l",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "think1",
        "Let's think about why that could happen. If you don't believe a sentence, what does your mind do when you say it out loud? It argues back. 'Lovable? Me? Remember last week?' The positive sentence becomes an *invitation* for every negative thought you've got.",
        [
            shot(
                "paper",
                [
                    tag("WHY WOULD IT BACKFIRE?"),
                    img("face-thinking", 0.5, 0.38, 0.44, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    L("bubble", text="I'm lovable.", x=0.3, y=0.12, size=50, at="say", enter="pop", sfx="pop"),
                    L("bubble", text="Lovable? Me?", x=0.7, y=0.24, size=50, at="argues", enter="pop", sfx="pop", rot=3),
                    L("bubble", text="Remember last week?", x=0.4, y=0.36, size=44, at="Remember", enter="pop", sfx="pop", rot=-3),
                    img("face-tired", 0.5, 0.58, 0.28, enter="pop", at="argues", rot=4),
                ],
                at="If",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            slam_shot("ink", "AN INVITATION\nTO ARGUE", size=150, at="invitation", color="accent"),
        ],
    ),
    scene(
        "second",
        "So the problem might be the *distance* between the sentence and what you actually believe. Now the second half of the advice: positive visions of the future. Picture the dream job, the perfect result. Does *that* help?",
        [
            shot(
                "paper-grid",
                [
                    tag("THE GAP BETWEEN SENTENCE AND BELIEF"),
                    chip("WHAT YOU SAY", 0.3, 0.2, size=44, bg="accent", color="ink", at="sentence", enter="left", sfx="blip"),
                    L("scribble", shape="arrow", x=0.5, y=0.3, w=0.28, h=0.07, color="ink", strokeW=14, at="distance", dur=12, curve=0.0, outline=False),
                    chip("WHAT YOU BELIEVE", 0.7, 0.4, size=44, bg="ink", color="paper", at="believe", enter="right", sfx="blip"),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    tag("THE SECOND HALF: POSITIVE VISIONS", bg="ink"),
                    big("PICTURE\nTHE DREAM", size=190, y=0.26, at="Picture"),
                    img("face-smile", 0.5, 0.58, 0.3, at="Picture+0.2", enter="pop", rot=4),
                ],
                at="Now",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["Picture"]},
            ),
        ],
    ),
    scene(
        "test2",
        "A psychologist named Gabriele Oettingen studied this. In 2002, her team followed four different groups of people: graduates looking for a job, students with a crush, students facing an exam, and patients having a hip replacement. They measured two things: how positively people *expected* things to go, and how positively they *fantasized* about it.",
        [
            shot(
                "paper",
                [
                    tag("2002: OETTINGEN & MAYER"),
                    cite("Oettingen & Mayer · 2002", "start"),
                    img("kbust-pen2", 0.5, 0.38, 0.5, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "ink-grid",
                [
                    tag("FOUR GROUPS OF PEOPLE", bg="accent", color="ink"),
                    chip("JOB SEEKERS", 0.3, 0.18, size=44, bg="paper", color="ink", at="job", enter="left", sfx="blip"),
                    chip("A CRUSH", 0.7, 0.27, size=44, bg="accent", color="ink", at="crush", enter="right", sfx="blip"),
                    chip("AN EXAM", 0.32, 0.36, size=44, bg="paper", color="ink", at="exam", enter="left", sfx="blip"),
                    chip("A HIP REPLACEMENT", 0.62, 0.45, size=40, bg="accent", color="ink", at="hip", enter="right", sfx="blip"),
                ],
                at="followed",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    tag("TWO DIFFERENT THINGS", bg="ink"),
                    L("card", kind="neutral", title="EXPECTING", text="\"I THINK THIS\nWILL GO WELL.\"", x=0.5, y=0.2, w=0.9, size=44, at="expected", enter="left", sfx="blip"),
                    L("card", kind="neutral", title="FANTASIZING", text="\"I'M DAYDREAMING\nABOUT IT GOING\nPERFECTLY.\"", x=0.5, y=0.44, w=0.9, size=44, at="fantasized", enter="right", sfx="blip"),
                ],
                at="They",
                enter="slide-u",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "result2",
        "And here's the surprise. People who *expected* success tended to put in more effort, and do better. But the people who fantasized the most about success tended to put in *less* effort, and do worse.",
        [
            shot(
                "paper-grid",
                [
                    tag("EXPECTING", bg="accent", color="ink"),
                    big("MORE EFFORT\nBETTER RESULTS", size=130, y=0.25, at="expected"),
                    img("kfull-point", 0.5, 0.58, 0.2, at="expected+0.2", enter="up"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    tag("FANTASIZING", bg="accent", color="ink"),
                    big("LESS EFFORT\nWORSE RESULTS", size=130, y=0.25, color="accent", at="less"),
                    img("face-surprised", 0.5, 0.58, 0.3, at="less+0.2", enter="pop", rot=4),
                ],
                at="But",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["less"]},
            ),
            shot(
                "ink-grid",
                [
                    chip("ILLUSTRATION, NOT REAL DATA", 0.5, 0.075, size=28, bg="soft", color="ink", at="start", enter="down"),
                    L("pairs", x=0.5, y=0.17, w=0.86, h=0.36, legendA="EFFORT", legendB="RESULTS", labelColor="paper", groups=[{"label": "EXPECTED SUCCESS", "a": 0.7, "b": 0.7, "at": "start"}, {"label": "FANTASIZED A LOT", "a": 0.32, "b": 0.32, "at": "start+0.3"}], enter="none", at="start"),
                ],
                at="surprise",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "think2",
        "Why? The researchers' proposal is interesting. When you vividly picture success, part of your mind may feel as if you've *already arrived*. And if you've already arrived, why spend the energy? It's a proposal, not a proven mechanism. But it fits.",
        [
            shot(
                "paper",
                [
                    tag("THE AUTHORS' PROPOSAL"),
                    img("kbust-pen", 0.5, 0.38, 0.5, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    big("ALREADY\nARRIVED?", size=210, y=0.26, at="already"),
                    img("kbust-mug", 0.5, 0.58, 0.3, at="already+0.2", enter="pop"),
                ],
                at="When",
                enter="flash",
                cam={"z": [1.0, 1.07], "punch": ["already"]},
            ),
            shot(
                "paper-grid",
                [
                    L("battery", x=0.5, y=0.2, w=0.76, label="ENERGY", level=[{"at": "start", "v": 1.0}, {"at": "spend", "v": 0.3}], glide=40, enter="pop"),
                    chip("A PROPOSAL, NOT PROVEN", 0.5, 0.4, size=36, bg="ink", color="paper", at="proposal", enter="up", sfx="blip"),
                ],
                at="And",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "verdict",
        "So here's my verdict. Positive thinking isn't useless, but it's not magic, and the kind matters. Believing you *can* do it, based on real reasons, helps. Repeating sentences you don't believe can backfire. And pure daydreaming, without a plan, may quietly drain your drive.",
        [
            shot(
                "paper",
                [
                    L("stamp", text="VERDICT", sub="DEPENDS ON THE KIND", x=0.5, y=0.22, size=150, at="verdict", enter="slam", sfx="hit"),
                    img("kbust-calm", 0.5, 0.5, 0.36, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.06], "punch": ["verdict"]},
            ),
            shot(
                "accent",
                [
                    L("card", kind="for", title="HELPS", text="BELIEVING YOU CAN,\nFOR REAL REASONS.", x=0.5, y=0.2, w=0.9, size=44, at="Believing", enter="left", sfx="blip"),
                    L("card", kind="against", title="CAN BACKFIRE", text="SENTENCES YOU\nDON'T BELIEVE.", x=0.5, y=0.42, w=0.9, size=44, at="Repeating", enter="right", sfx="blip"),
                ],
                at="Believing",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "ink",
                [
                    L("card", kind="against", title="MAY DRAIN YOUR DRIVE", text="DAYDREAMING\nWITHOUT A PLAN.", x=0.5, y=0.26, w=0.9, size=46, at="daydreaming", enter="up", sfx="blip"),
                ],
                at="pure",
                enter="slide-u",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "advice",
        "So what should you do instead? Three suggestions, mine, not study results. One: pick sentences you can actually believe, like 'I'm learning,' instead of 'I'm perfect.' Two: after you picture the goal, also picture what might get in the way. Three: turn it into a small plan. When, where, and what exactly.",
        [
            shot(
                "accent",
                [
                    tag("WHAT TO DO (MY ADVICE)"),
                    L("card", kind="for", title="1  BELIEVABLE WORDS", text="\"I'M LEARNING\"\nNOT \"I'M PERFECT\"", x=0.5, y=0.24, w=0.9, size=44, at="One", enter="left", sfx="blip"),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "paper-grid",
                [
                    tag("2  PICTURE THE OBSTACLE TOO"),
                    img("kbust-pocket", 0.5, 0.36, 0.5, enter="pop", delay=-0.2),
                    chip("WHAT MIGHT GET IN THE WAY?", 0.5, 0.62, size=34, bg="accent", color="ink", at="way", enter="up", sfx="blip"),
                ],
                at="Two",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "ink",
                [
                    tag("3  A SMALL PLAN", bg="accent", color="ink"),
                    chip("WHAT", 0.2, 0.2, size=56, bg="paper", color="ink", at="exactly", enter="up", sfx="blip"),
                    chip("WHEN", 0.5, 0.2, size=56, bg="accent", color="ink", at="When", enter="up", sfx="blip"),
                    chip("WHERE", 0.8, 0.2, size=56, bg="paper", color="ink", at="where", enter="up", sfx="blip"),
                    img("kfull-point", 0.5, 0.5, 0.22, enter="up", at="Three"),
                ],
                at="Three",
                enter="slide-u",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "close",
        "Hope is good. Just don't let it do the job of *work*. Believe you can, then show your brain a plan.",
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
                    text("hope + a plan", 0.5, 0.58, 140, font="hand", color="ink", upper=False, enter="pop", rot=-3),
                ],
                at="Believe",
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
    "p016-positive-thinking",
    "Does Positive Thinking Actually Work?",
    "thinking-music.mp3",
    [
        "Wood, J. V., Perunovic, W. Q. E., & Lee, J. W. (2009). Positive self-statements: Power for some, peril for others. Psychological Science, 20(7), 860-866.",
        "Oettingen, G., & Mayer, D. (2002). The motivating function of thinking about the future: Expectations versus fantasies. Journal of Personality and Social Psychology, 83(5), 1198-1212.",
    ],
    scenes,
)
