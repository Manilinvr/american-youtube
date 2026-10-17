#!/usr/bin/env python3
"""p015: Does Money Buy Happiness? Two Scientists Disagreed, Then Worked It Out  (Kahneman & Deaton 2010; Killingsworth 2021; Killingsworth, Kahneman & Mellers 2023).

Reasoning format. No exact dollar thresholds are shown as facts (the ~$100k point is disputed); shapes are labelled as illustrations.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403

HAPPY = dict(xlabel="INCOME", ylabel="DAY-TO-DAY HAPPINESS")

scenes = [
    scene(
        "hook",
        "'Money can't buy happiness.' We say it all the time. And a famous study once said: after a certain income, more money does *nothing*. Then another study said the opposite. So who's right? Here's the twist: the two scientists teamed up to find out.",
        [
            shot(
                "accent",
                [
                    img("kbust-pocket", 0.5, 0.36, 0.52, enter="pop", delay=-0.3),
                    L("burst", text="$$$", x=0.8, y=0.12, w=0.3, at="start", enter="slam", rot=8, seed=3, fill="paper", sfx="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            slam_shot("ink", "MONEY CAN'T\nBUY HAPPINESS", size=170, at="Money", color="accent"),
            shot(
                "paper-grid",
                [
                    tag("STUDY 1: IT STOPS HELPING"),
                    L("chart", x=0.5, y=0.28, w=0.9, h=0.34, series=[{"pts": [[0.05, 0.12], [0.5, 0.6], [0.95, 0.62]], "color": "accent", "at": "famous", "label": "A PLATEAU"}], enter="up", at="start", **HAPPY),
                    chip("ILLUSTRATION OF THE SHAPE", 0.5, 0.56, size=28, bg="soft", color="ink", at="start", enter="up"),
                ],
                at="And",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "ink-grid",
                [
                    tag("STUDY 2: THE OPPOSITE", bg="accent", color="ink"),
                    L("chart", x=0.5, y=0.28, w=0.9, h=0.34, series=[{"pts": [[0.05, 0.12], [0.5, 0.5], [0.95, 0.9]], "color": "accent", "at": "Then", "label": "KEEPS RISING"}], enter="up", at="start", **HAPPY),
                    chip("ILLUSTRATION OF THE SHAPE", 0.5, 0.56, size=28, bg="soft", color="ink", at="start", enter="up"),
                ],
                at="Then",
                enter="wipe-l",
                cam={"z": [1.0, 1.05]},
            ),
            slam_shot("accent", "WHO'S\nRIGHT?", size=270, at="right", face="face-thinking"),
        ],
    ),
    scene(
        "first",
        "Study one, in 2010, led by Nobel-winning psychologist Daniel Kahneman with economist Angus Deaton. They found that people's day-to-day happiness rose with income, but then flattened out, at around seventy-five thousand dollars a year.",
        [
            shot(
                "paper",
                [
                    tag("2010: KAHNEMAN + DEATON"),
                    cite("Kahneman & Deaton · 2010", "start"),
                    img("kbust-pen", 0.5, 0.38, 0.5, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "ink-grid",
                [
                    tag("THEY FOUND A PLATEAU", bg="accent", color="ink"),
                    L("chart", x=0.5, y=0.28, w=0.9, h=0.34, series=[{"pts": [[0.05, 0.12], [0.55, 0.62], [0.95, 0.64]], "color": "accent", "at": "rose", "label": ""}], marks=[{"x": 0.55, "label": "≈ $75K", "at": "seventy"}], enter="up", at="start", **HAPPY),
                    chip("ILLUSTRATION OF THE SHAPE", 0.5, 0.56, size=28, bg="soft", color="ink", at="start", enter="up"),
                ],
                at="They",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            slam_shot("accent", "FLAT AFTER\n≈ $75K", size=190, at="flattened", face="face-calm"),
        ],
    ),
    scene(
        "second",
        "Study two, in 2021, came from Matthew Killingsworth. He didn't ask people to remember how happy they were. He pinged them on their phones at random moments, and asked, right now, how do you feel? Over thirty-three thousand workers answered, more than a million and a half times.",
        [
            shot(
                "paper-grid",
                [
                    tag("2021: KILLINGSWORTH"),
                    cite("Killingsworth · 2021", "start"),
                    L("phone", x=0.5, y=0.33, w=0.32, enter="up", screens=[{"at": "start", "s": "chat"}], rot=-3, id="ph15"),
                    L("bubble", text="How do you feel right now?", x=0.5, y=0.14, size=40, at="pinged", enter="pop", sfx="pop"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "accent",
                [
                    tag("NOT MEMORY. RIGHT NOW.", bg="ink"),
                    big("RIGHT\nNOW", size=270, y=0.26, at="right"),
                    img("face-smile", 0.5, 0.58, 0.3, at="right+0.2", enter="pop", rot=4),
                ],
                at="He",
                enter="flash",
                cam={"z": [1.0, 1.07], "punch": ["right"]},
            ),
            shot(
                "ink-grid",
                [
                    tag("THE SAMPLE", bg="accent", color="ink"),
                    L("counter", to=33000, suffix="+", size=300, color="paper", x=0.5, y=0.2, at="thirty-three", dur=26, enter="none", stroke="ink", shadow="accent", sfx="hit"),
                    chip("WORKERS", 0.5, 0.36, size=44, bg="paper", color="ink", at="workers", enter="up", sfx="blip"),
                    L("dots", x=0.5, y=0.5, w=0.7, total=48, cols=12, hit=0, at="thirty-three", step=0.15, enter="none", id="d48"),
                ],
                at="Over",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            slam_shot("accent", "1.7 MILLION\nCHECK-INS", size=150, at="million", face="face-surprised"),
        ],
    ),
    scene(
        "result2",
        "And his result? No plateau. Happiness kept rising with income, even above that old threshold. Each doubling of income gave a similar lift.",
        [
            shot(
                "ink",
                [
                    big("NO\nPLATEAU", size=270, y=0.26, color="accent", at="plateau"),
                    img("face-shock", 0.5, 0.58, 0.3, at="plateau+0.2", enter="pop", rot=4),
                ],
                cam={"z": [1.0, 1.07], "punch": ["plateau"]},
            ),
            shot(
                "paper-grid",
                [
                    L("chart", x=0.5, y=0.28, w=0.9, h=0.34, series=[{"pts": [[0.05, 0.12], [0.5, 0.5], [0.95, 0.88]], "color": "accent", "at": "rising", "label": ""}], marks=[{"x": 0.55, "label": "OLD THRESHOLD", "at": "above"}], enter="up", at="start", **HAPPY),
                    chip("ILLUSTRATION OF THE SHAPE", 0.5, 0.56, size=28, bg="soft", color="ink", at="start", enter="up"),
                ],
                at="Happiness",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    tag("EACH DOUBLING, SIMILAR LIFT", bg="ink"),
                    chip("EXAMPLE: $40K → $80K", 0.5, 0.2, size=44, bg="white", color="ink", at="doubling", enter="left", sfx="blip"),
                    chip("EXAMPLE: $80K → $160K", 0.5, 0.3, size=44, bg="ink", color="paper", at="similar", enter="right", sfx="blip"),
                    chip("ABOUT THE SAME BOOST", 0.5, 0.42, size=40, bg="paper", color="ink", at="lift", enter="up", sfx="blip"),
                ],
                at="Each",
                enter="slide-u",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "think",
        "Now let's think. Two careful studies, two opposite answers. They can't both be fully right. Unless they were measuring different *people*. And that's exactly the question they asked next.",
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
                "accent",
                [
                    L("card", kind="neutral", title="STUDY 1", text="PLATEAU", x=0.5, y=0.2, w=0.8, size=70, at="Two", enter="left", sfx="blip"),
                    L("card", kind="neutral", title="STUDY 2", text="NO PLATEAU", x=0.5, y=0.4, w=0.8, size=70, at="opposite", enter="right", sfx="blip"),
                ],
                at="Two",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            slam_shot("ink", "DIFFERENT\nPEOPLE?", size=200, at="different", color="accent", face="face-thinking"),
        ],
    ),
    scene(
        "together",
        "So in 2023, Killingsworth and Kahneman, the very person who'd been challenged, worked together, along with a third scientist. They re-checked the data by *how happy people were to begin with*.",
        [
            shot(
                "paper-grid",
                [
                    tag("2023: THEY TEAMED UP"),
                    cite("Killingsworth, Kahneman & Mellers · 2023", "start"),
                    img("face-smile", 0.3, 0.36, 0.32, enter="left"),
                    img("face-calm", 0.7, 0.36, 0.32, enter="right"),
                    chip("+ A THIRD SCIENTIST", 0.5, 0.6, size=40, bg="accent", color="ink", at="third", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "accent",
                [
                    tag("THE NEW QUESTION", bg="ink"),
                    big("HOW HAPPY\nTO BEGIN WITH?", size=160, y=0.26, at="how"),
                    img("kbust-pen", 0.5, 0.58, 0.3, at="how+0.2", enter="pop"),
                ],
                at="They",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["how"]},
            ),
        ],
    ),
    scene(
        "answer",
        "And look what happened. For most people, happiness kept rising with income. But for the *least* happy group, about one in five, it rose and then flattened. Both studies were right, about different people.",
        [
            shot(
                "ink-grid",
                [
                    tag("MOST PEOPLE", bg="accent", color="ink"),
                    L("chart", x=0.5, y=0.28, w=0.9, h=0.34, series=[{"pts": [[0.05, 0.14], [0.5, 0.52], [0.95, 0.9]], "color": "accent", "at": "most", "label": "KEEPS RISING"}], enter="up", at="start", **HAPPY),
                    chip("ILLUSTRATION OF THE SHAPE", 0.5, 0.56, size=28, bg="soft", color="ink", at="start", enter="up"),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "paper-grid",
                [
                    tag("THE LEAST HAPPY ≈ 1 IN 5"),
                    L("chart", x=0.5, y=0.28, w=0.9, h=0.34, series=[{"pts": [[0.05, 0.08], [0.55, 0.36], [0.95, 0.38]], "color": "ink", "at": "least", "label": "RISES, THEN FLAT"}], enter="up", at="start", **HAPPY),
                    chip("ILLUSTRATION OF THE SHAPE", 0.5, 0.56, size=28, bg="soft", color="ink", at="start", enter="up"),
                ],
                at="least",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            slam_shot("accent", "BOTH\nRIGHT", size=270, at="Both", face="face-surprised"),
        ],
    ),
    scene(
        "why",
        "Why would the unhappiest flatten? One reading: if your unhappiness comes from things money can't fix, for example grief, loneliness, or a health problem, then extra income doesn't touch it. Money helps the problems money can solve.",
        [
            shot(
                "paper",
                [
                    tag("ONE READING (AN INTERPRETATION)"),
                    img("face-tired", 0.5, 0.38, 0.44, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    chip("GRIEF", 0.28, 0.14, size=56, bg="ink", color="paper", at="grief", enter="left", sfx="blip"),
                    chip("LONELINESS", 0.7, 0.24, size=56, bg="white", color="ink", at="loneliness", enter="right", sfx="blip"),
                    chip("HEALTH", 0.34, 0.34, size=56, bg="ink", color="paper", at="health", enter="left", sfx="blip"),
                ],
                at="then",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            slam_shot("ink", "MONEY FIXES\nMONEY PROBLEMS", size=130, at="Money#2", color="accent", face="face-calm"),
        ],
    ),
    scene(
        "caveat",
        "Two honest warnings. First, these numbers show a link, not proof that money *causes* happiness. Maybe happier people earn more, or both come from something else. Second, scientists still argue about exactly where that flattening point is. So I won't give you a magic number.",
        [
            shot(
                "paper-grid",
                [
                    tag("WARNING 1: A LINK, NOT PROOF"),
                    chip("MONEY → HAPPY?", 0.3, 0.2, size=48, bg="ink", color="paper", at="causes", enter="left", sfx="blip"),
                    chip("HAPPY → MONEY?", 0.7, 0.3, size=48, bg="accent", color="ink", at="happier", enter="right", sfx="blip"),
                    chip("SOMETHING ELSE → BOTH?", 0.5, 0.4, size=40, bg="white", color="ink", at="both", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    tag("WARNING 2: THE EXACT POINT IS DISPUTED", bg="ink"),
                    img("face-skeptic", 0.5, 0.3, 0.4, enter="pop", delay=-0.2),
                    big("NO MAGIC\nNUMBER", size=210, y=0.26, at="magic"),
                    img("face-skeptic", 0.5, 0.58, 0.3, at="magic+0.2", enter="pop", rot=-4),
                ],
                at="Second",
                enter="wipe-r",
                cam={"z": [1.0, 1.06], "punch": ["magic"]},
            ),
        ],
    ),
    scene(
        "verdict",
        "So here's my verdict. Money does help for most people, and there's no clear point where it suddenly stops. But it's not a cure for unhappiness that comes from somewhere else.",
        [
            shot(
                "paper",
                [
                    L("stamp", text="VERDICT", sub="HELPS, BUT NOT A CURE", x=0.5, y=0.22, size=150, at="verdict", enter="slam", sfx="hit"),
                    img("kbust-calm", 0.5, 0.5, 0.36, enter="pop", delay=-0.2),
                ],
                cam={"z": [1.0, 1.06], "punch": ["verdict"]},
            ),
            shot(
                "accent",
                [
                    L("card", kind="for", title="FOR MOST PEOPLE", text="MORE MONEY\nGENERALLY HELPS.", x=0.5, y=0.22, w=0.9, size=46, at="most", enter="left", sfx="blip"),
                    L("card", kind="against", title="NOT A CURE", text="IT WON'T FIX\nUNHAPPINESS FROM\nELSEWHERE.", x=0.5, y=0.46, w=0.9, size=46, at="cure", enter="right", sfx="blip"),
                ],
                at="Money",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "advice",
        "My practical takeaway, my suggestion, not a finding. If you're struggling with money, take it seriously. It's a real source of stress, and fixing it can really help. But if money's already okay and you still feel low, don't just chase a bigger number. Look at the other parts: people, health, meaning.",
        [
            shot(
                "accent",
                [
                    tag("MY SUGGESTION, NOT A FINDING"),
                    L("card", kind="for", title="IF MONEY IS TIGHT", text="TAKE IT SERIOUSLY.\nFIXING IT HELPS.", x=0.5, y=0.22, w=0.9, size=46, at="struggling", enter="left", sfx="blip"),
                ],
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "paper-grid",
                [
                    tag("IF MONEY IS OKAY, BUT YOU FEEL LOW"),
                    chip("PEOPLE", 0.28, 0.2, size=56, bg="ink", color="paper", at="people", enter="left", sfx="blip"),
                    chip("HEALTH", 0.7, 0.3, size=56, bg="accent", color="ink", at="health", enter="right", sfx="blip"),
                    chip("MEANING", 0.34, 0.4, size=56, bg="white", color="ink", at="meaning", enter="left", sfx="blip"),
                ],
                at="But",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "close",
        "Money isn't the secret to happiness, and it isn't irrelevant either. It's a tool. A good one, for the jobs it can do.",
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
                    text("a tool, not a cure", 0.5, 0.58, 130, font="hand", color="ink", upper=False, enter="pop", rot=-3),
                ],
                at="tool",
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
    "p015-money-happiness",
    "Does Money Buy Happiness? Two Scientists Disagreed, Then Worked It Out",
    "dreamer.mp3",
    [
        "Kahneman, D., & Deaton, A. (2010). High income improves evaluation of life but not emotional well-being. PNAS, 107(38), 16489-16493.",
        "Killingsworth, M. A. (2021). Experienced well-being rises with income, even above $75,000 per year. PNAS, 118(4), e2016976118.",
        "Killingsworth, M. A., Kahneman, D., & Mellers, B. (2023). Income and emotional well-being: A conflict resolved. PNAS, 120(10), e2208661120. https://doi.org/10.1073/pnas.2208661120",
    ],
    scenes,
)
