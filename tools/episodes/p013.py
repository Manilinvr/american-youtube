#!/usr/bin/env python3
"""p013: Does 'Letting It Out' Really Help When You're Angry?  (Bushman 2002, PSPB 28(6), 724-731; 600 undergraduates).

Reasoning format. Cautious: one lab study on students; 'venting' by talking to a supportive friend is a different thing.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403

scenes = [
    scene(
        "hook",
        "You're furious. Someone says, 'Don't bottle it up. Let it out. Punch a pillow. Scream into the car.' It sounds so *logical*. Pressure builds, so you release it. But wait. Is anger really like steam in a pot?",
        [
            shot(
                "accent",
                [
                    img("kbust-pocket", 0.5, 0.36, 0.52, enter="pop", delay=-0.3),
                    L("burst", text="ARGH!", x=0.8, y=0.12, w=0.3, at="start", enter="slam", rot=8, seed=3, fill="paper", sfx="hit", delay=-0.2),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            slam_shot("ink", "LET IT\nOUT!", size=270, at="Let", color="accent"),
            shot(
                "paper-grid",
                [
                    tag("THE LOGIC"),
                    chip("PRESSURE BUILDS", 0.3, 0.2, size=44, bg="ink", color="paper", at="Pressure", enter="left", sfx="blip"),
                    L("scribble", shape="arrow", x=0.5, y=0.2, w=0.14, h=0.06, color="accent", strokeW=14, at="release", dur=10, curve=0.0),
                    chip("YOU RELEASE IT", 0.74, 0.2, size=44, bg="accent", color="ink", at="release", enter="right", sfx="blip"),
                    img("kbust-pen2", 0.5, 0.5, 0.34, enter="pop", at="logical"),
                ],
                at="It",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
            slam_shot("accent", "LIKE STEAM\nIN A POT?", size=190, at="steam", face="face-skeptic"),
        ],
    ),
    scene(
        "idea",
        "That idea is old. It's called *catharsis*. The thinking goes: if you act out your anger, it drains away. And if that's true, hitting a punching bag should calm you down.",
        [
            shot(
                "ink",
                [
                    tag("THE OLD IDEA: CATHARSIS", bg="accent", color="ink"),
                    big("CATHARSIS", size=190, y=0.25, color="paper", at="catharsis"),
                    img("kbust-calm", 0.5, 0.52, 0.32, enter="pop", at="catharsis+0.2"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "paper",
                [
                    L("battery", x=0.5, y=0.2, w=0.76, label="ANGER", level=[{"at": "start", "v": 1.0}, {"at": "drains", "v": 0.1}], glide=40, enter="pop"),
                    chip("ACT IT OUT = ANGER DRAINS", 0.5, 0.4, size=34, bg="ink", color="paper", at="act", enter="up", sfx="blip"),
                ],
                at="The",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "accent",
                [
                    tag("THE PREDICTION", bg="ink"),
                    img("kfull-point", 0.5, 0.42, 0.34, enter="up"),
                    chip("PUNCHING BAG → CALM", 0.5, 0.18, size=44, bg="white", color="ink", at="hitting", enter="down", sfx="blip"),
                ],
                at="And",
                enter="slide-u",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "test",
        "So how would you test it? Well, make people angry first. In a famous 2002 experiment, six hundred students wrote an essay, and then got insulting feedback on it from another student.",
        [
            shot(
                "paper-grid",
                [
                    tag("HOW TO TEST IT"),
                    cite("Bushman · 2002", "start"),
                    img("kbust-pen", 0.5, 0.36, 0.5, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink-grid",
                [
                    tag("STEP 1: MAKE THEM ANGRY", bg="accent", color="ink"),
                    L("counter", to=600, size=420, color="paper", x=0.5, y=0.22, at="six", dur=24, enter="none", stroke="ink", shadow="accent", sfx="hit"),
                    chip("STUDENTS", 0.5, 0.42, size=44, bg="paper", color="ink", at="students", enter="up", sfx="blip"),
                ],
                at="In",
                enter="wipe-r",
                cam={"z": [1.0, 1.06], "punch": ["six"]},
            ),
            shot(
                "accent",
                [
                    tag("A WRITTEN ESSAY", bg="ink"),
                    L("card", kind="neutral", title="FEEDBACK ON YOUR ESSAY", text="\"ONE OF THE WORST\nESSAYS I'VE READ.\"", x=0.5, y=0.26, w=0.9, size=46, at="insulting", enter="up", sfx="blip"),
                    img("face-angry", 0.5, 0.56, 0.28, at="insulting+0.2", enter="pop", rot=5),
                ],
                at="then",
                enter="slide-u",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "groups",
        "Then they were split into three groups. Group one hit a punching bag while thinking about the person who insulted them. Group two hit the bag too, but thought about getting *fit*. And group three just sat quietly.",
        [
            shot(
                "paper",
                [
                    tag("THREE GROUPS"),
                    img("kbust-big-pen", 0.5, 0.36, 0.5, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "ink",
                [
                    L("card", kind="against", title="GROUP 1: RUMINATE", text="HIT THE BAG.\nTHINK ABOUT\nTHE INSULTER.", x=0.5, y=0.27, w=0.88, size=50, enter="pop", sfx="blip"),
                ],
                at="Group",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "accent",
                [
                    L("card", kind="for", title="GROUP 2: DISTRACT", text="HIT THE BAG.\nTHINK ABOUT\nGETTING FIT.", x=0.5, y=0.27, w=0.88, size=50, enter="pop", sfx="blip"),
                ],
                at="two",
                enter="wipe-l",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "paper-grid",
                [
                    L("card", kind="neutral", title="GROUP 3: CONTROL", text="NO BAG.\nJUST SIT\nQUIETLY.", x=0.5, y=0.27, w=0.88, size=50, enter="pop", sfx="blip"),
                ],
                at="three#2",
                enter="slide-u",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "pred",
        "Now, if catharsis is right, who ends up calmest? The group that vented the most. The one that really *went for it*.",
        [
            shot(
                "paper",
                [
                    tag("IF CATHARSIS IS RIGHT..."),
                    img("face-thinking", 0.5, 0.36, 0.44, enter="pop", delay=-0.2),
                    chip("CALMEST = THE VENTERS?", 0.5, 0.62, size=40, bg="accent", color="ink", at="calmest", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "accent",
                [
                    big("GROUP 1\nWINS?", size=240, y=0.26, at="vented"),
                    img("kfull-point2", 0.5, 0.56, 0.2, at="vented+0.2", enter="up"),
                ],
                at="The",
                enter="flash",
                cam={"z": [1.0, 1.07], "punch": ["vented"]},
            ),
        ],
    ),
    scene(
        "result",
        "But that's not what happened. The group that hit the bag while thinking about their insulter ended up the *angriest*. And when they got a chance to blast that person with loud noise, they chose the loudest blasts.",
        [
            shot(
                "ink",
                [
                    big("NOT WHAT\nHAPPENED", size=210, y=0.25, color="paper", at="not"),
                    img("face-shock", 0.5, 0.58, 0.3, at="not+0.2", enter="pop", rot=5),
                ],
                cam={"z": [1.0, 1.06], "punch": ["not"]},
            ),
            shot(
                "ink-grid",
                [
                    chip("ILLUSTRATION, NOT REAL DATA", 0.5, 0.075, size=28, bg="soft", color="ink", at="start", enter="down"),
                    L("bars", x=0.46, y=0.3, w=0.74, h=0.4, items=[{"label": "RUMINATE", "value": 0.82, "color": "accent", "at": "angriest"}, {"label": "DISTRACT", "value": 0.45, "color": "paper", "at": "angriest+0.3"}, {"label": "SIT", "value": 0.45, "color": "paper", "at": "angriest+0.6"}], labelColor="paper", enter="none", at="start"),
                    chip("HOW ANGRY AFTERWARD", 0.5, 0.58, size=32, bg="white", color="ink", at="angriest", enter="up"),
                ],
                at="group",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    tag("THEN: BLAST YOUR INSULTER WITH NOISE", bg="ink"),
                    L("waves", x=0.5, y=0.3, w=1.0, at="loud", dur=120, strokeW=18, enter="none"),
                    big("LOUDEST\nBLASTS", size=200, y=0.3, at="loudest"),
                ],
                at="And",
                enter="slide-l",
                cam={"z": [1.0, 1.07], "shake": ["loudest"]},
            ),
            shot(
                "ink",
                [
                    L("bars", x=0.46, y=0.3, w=0.74, h=0.4, items=[{"label": "RUMINATE", "value": 0.85, "color": "accent", "at": "start"}, {"label": "DISTRACT", "value": 0.55, "color": "paper", "at": "start"}, {"label": "SIT", "value": 0.4, "color": "paper", "at": "start"}], labelColor="paper", enter="none", at="start"),
                    chip("ILLUSTRATION: HOW AGGRESSIVE", 0.5, 0.075, size=28, bg="soft", color="ink", at="start", enter="down"),
                    cite("Bushman · 2002", "start"),
                ],
                at="chose",
                enter="wipe-l",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "think",
        "Let's think about why. When you hit the bag *and* replay the insult, you're not releasing anything. You're rehearsing. You're feeding the anger with fresh fuel, again and again. It's less like letting steam out of a pot, and more like fanning a fire.",
        [
            shot(
                "paper",
                [
                    tag("LET'S THINK ABOUT WHY"),
                    img("kbust-pen2", 0.5, 0.38, 0.5, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    big("NOT\nRELEASING", size=220, y=0.25, at="not"),
                    L("scribble", shape="strike", x=0.5, y=0.25, w=0.8, h=0.06, color="ink", strokeW=20, at="releasing", dur=9, outline=False),
                ],
                at="releasing",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["releasing"]},
            ),
            shot(
                "ink",
                [
                    big("REHEARSING", size=180, y=0.25, color="accent", at="rehearsing"),
                    img("kfull-point", 0.5, 0.52, 0.26, at="rehearsing+0.2", enter="up"),
                ],
                at="rehearsing",
                enter="punch",
                cam={"z": [1.0, 1.07], "punch": ["rehearsing"]},
            ),
            shot(
                "paper-grid",
                [
                    chip("A COMPARISON, NOT SCIENCE", 0.5, 0.075, size=30, bg="ink", color="paper", at="start", enter="down"),
                    L("cups", x=0.5, y=0.3, w=0.7, items=[{"label": "STEAM POT", "sub": "LETTING IT OUT", "level": 0.2, "at": "steam", "color": "paper"}, {"label": "FIRE", "sub": "FANNING IT", "level": 0.9, "at": "fanning", "color": "accent"}], enter="none", at="start"),
                ],
                at="less",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "counter",
        "Now, a fair objection. It was one lab study, with college students. And talking about your feelings with a supportive friend is a very different thing from punching a bag while you stew. So I'm not saying, 'never express anger.' I'm saying: *how* you do it matters.",
        [
            shot(
                "paper-grid",
                [
                    tag("A FAIR OBJECTION"),
                    chip("ONE LAB STUDY", 0.3, 0.2, size=44, bg="ink", color="paper", at="one", enter="left", sfx="blip"),
                    chip("COLLEGE STUDENTS", 0.68, 0.3, size=44, bg="white", color="ink", at="college", enter="right", sfx="blip"),
                    img("face-skeptic", 0.5, 0.56, 0.28, enter="pop", at="one"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "accent",
                [
                    L("card", kind="against", title="STEWING + PUNCHING", text="KEEPS THE\nANGER GOING.", x=0.5, y=0.2, w=0.88, size=46, at="punching", enter="left", sfx="blip"),
                    L("card", kind="for", title="TALKING TO A FRIEND", text="A DIFFERENT\nTHING.", x=0.5, y=0.42, w=0.88, size=46, at="friend", enter="right", sfx="blip"),
                ],
                at="And",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            slam_shot("ink", "HOW\nMATTERS", size=250, at="matters", color="accent"),
        ],
    ),
    scene(
        "verdict",
        "So here's my verdict. 'Let it out' is only half-true. Feeling your anger is fine. Fueling it is not. Venting by replaying the insult makes the fire bigger, not smaller.",
        [
            shot(
                "paper",
                [
                    L("stamp", text="VERDICT", sub="HALF TRUE", x=0.5, y=0.22, size=170, at="verdict", enter="slam", sfx="hit"),
                    img("kbust-calm", 0.5, 0.5, 0.36, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.06], "punch": ["verdict"]},
            ),
            shot(
                "accent",
                [
                    chip("FEELING IT", 0.3, 0.12, size=56, bg="white", color="ink", at="Feeling", enter="left", sfx="blip"),
                    chip("= FINE", 0.72, 0.12, size=56, bg="ink", color="paper", at="fine", enter="right", sfx="blip"),
                    chip("FUELING IT", 0.3, 0.28, size=56, bg="ink", color="paper", at="Fueling", enter="left", sfx="blip"),
                    chip("= NOT", 0.72, 0.28, size=56, bg="white", color="ink", at="not", enter="right", sfx="blip"),
                    img("face-angry", 0.5, 0.56, 0.28, enter="pop", at="Fueling", rot=4),
                ],
                at="Feeling",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "advice",
        "What can you do instead? Three small things, and these are my suggestions, not findings. One: let your body calm down first, a short walk or slow breathing. Two: do something that takes your mind off it. Three: when you're calmer, talk it through with someone, or say what you need, without the replay.",
        [
            shot(
                "accent",
                [
                    tag("WHAT TO DO INSTEAD (MY ADVICE)"),
                    img("kfull-walk", 0.5, 0.4, 0.3, enter="left"),
                    chip("1  CALM THE BODY FIRST", 0.5, 0.16, size=40, bg="white", color="ink", at="One", enter="down", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "paper-grid",
                [
                    tag("2  TAKE YOUR MIND OFF IT"),
                    L("phone", x=0.5, y=0.33, w=0.3, enter="up", screens=[{"at": "start", "s": "lock"}], rot=-3, id="ph13"),
                ],
                at="Two",
                enter="slide-l",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    tag("3  LATER: TALK IT THROUGH", bg="accent", color="ink"),
                    img("face-smile", 0.3, 0.38, 0.34, enter="left"),
                    img("face-calm", 0.72, 0.38, 0.34, enter="right"),
                    L("bubble", text="Here's what I need.", x=0.5, y=0.16, size=48, at="need", enter="pop", sfx="pop"),
                ],
                at="Three",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "close",
        "Anger isn't a pot of steam that needs a valve. It's more like a fire. And you don't put out a fire by feeding it. You give it *time*, and you stop adding fuel.",
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
                    text("stop adding fuel", 0.5, 0.58, 130, font="hand", color="ink", upper=False, enter="pop", rot=-3),
                ],
                at="stop",
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
    "p013-venting-anger",
    "Does 'Letting It Out' Really Help When You're Angry?",
    "gymnopedie-no-1.mp3",
    [
        "Bushman, B. J. (2002). Does venting anger feed or extinguish the flame? Catharsis, rumination, distraction, anger, and aggressive responding. Personality and Social Psychology Bulletin, 28(6), 724-731. https://doi.org/10.1177/0146167202289002",
    ],
    scenes,
)
