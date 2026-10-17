#!/usr/bin/env python3
"""p009: Can Talking to AI Make You Lonelier?  (OpenAI + MIT Media Lab studies, March 2025; APA Monitor Jan-Feb 2026).

Cautious by design: the heavy-use link is correlational, so the script says so and offers no medical advice.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403

CITE = "OpenAI + MIT Media Lab · 2025"

scenes = [
    scene(
        "hook",
        "Millions of people now talk to AI about their *feelings*. Is that good for you?",
        [
            shot(
                "accent",
                [
                    L("phone", x=0.5, y=0.33, w=0.42, enter="pop", delay=-0.3, screens=[{"at": "start", "s": "chat"}], rot=-3, id="ph9"),
                    L("heart", x=0.82, y=0.14, w=0.18, at="feelings", enter="pop", pulse=["feelings"], rot=12),
                    chip("TALKING TO AI", 0.5, 0.075, size=44, bg="ink", color="paper", at="start", enter="down"),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "ink",
                [
                    img("kbust-calm", 0.5, 0.36, 0.5, enter="pop"),
                    text("GOOD\nFOR YOU?", 0.5, 0.12, 170, color="accent", stroke="ink", shadow="paper", at="good", enter="slam", sfx="hit"),
                ],
                at="good",
                enter="iris",
                irisAt=[0.5, 0.36],
                cam={"z": [1.0, 1.08], "punch": ["good"]},
            ),
        ],
    ),
    scene(
        "why",
        "It makes sense. It's always awake. It never judges. And it always *answers*.",
        [
            shot(
                "paper",
                [
                    chip("ALWAYS AWAKE", 0.3, 0.1, size=44, bg="ink", color="paper", at="awake", enter="left", sfx="blip"),
                    chip("NEVER JUDGES", 0.7, 0.2, size=44, bg="accent", color="ink", at="judges", enter="right", sfx="blip"),
                    chip("ALWAYS ANSWERS", 0.34, 0.3, size=44, bg="white", color="ink", at="answers", enter="left", sfx="blip"),
                    img("kbust-mug", 0.5, 0.53, 0.34, at="makes", enter="pop"),
                ],
                cam={"z": [1.0, 1.06]},
            )
        ],
    ),
    scene(
        "study",
        "In 2025, researchers at MIT and OpenAI studied this. In one study, almost a *thousand* people used a chatbot for four weeks.",
        [
            shot(
                "ink-grid",
                [
                    chip("MIT + OPENAI · 2025", 0.5, 0.075, size=40, bg="accent", color="ink", at="researchers", enter="down", sfx="blip"),
                    cite(CITE, "researchers"),
                    img("kbust-pen", 0.5, 0.36, 0.5, enter="pop"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "paper-grid",
                [
                    L("dots", x=0.5, y=0.17, w=0.86, total=100, cols=20, hit=0, at="thousand", step=0.1, enter="none", id="d100"),
                    text("≈ 1,000", 0.5, 0.4, 230, color="ink", mark="accent", at="thousand", enter="slam", sfx="hit"),
                    chip("PEOPLE · 4 WEEKS", 0.5, 0.52, size=44, bg="ink", color="paper", at="four", enter="up", sfx="blip"),
                ],
                at="almost",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
        ],
    ),
    scene(
        "result",
        "In these studies, the worrying pattern showed up mostly in the *heaviest* users.",
        [
            shot(
                "ink",
                [
                    chip("ILLUSTRATION, NOT REAL DATA", 0.5, 0.075, size=28, bg="soft", color="ink", at="start", enter="down"),
                    L("bars", x=0.46, y=0.33, w=0.7, h=0.38, items=[{"label": "LIGHT USE", "value": 0.3, "color": "paper", "at": "start"}, {"label": "HEAVIEST USE", "value": 0.78, "color": "accent", "at": "heaviest"}], labelColor="paper", enter="none", at="start"),
                    chip("A WORRYING PATTERN", 0.5, 0.6, size=36, bg="white", color="ink", at="worrying", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06], "punch": ["heaviest"]},
            )
        ],
    ),
    scene(
        "what",
        "The heaviest users reported feeling lonelier, relying on the chatbot more, and spending less time with real people.",
        [
            shot(
                "accent",
                [
                    chip("THE HEAVIEST USERS", 0.5, 0.075, size=44, bg="ink", color="paper", at="heaviest", enter="down", sfx="blip"),
                    img("face-tired", 0.5, 0.56, 0.34, enter="pop", delay=-0.2),
                    chip("LONELIER", 0.3, 0.22, size=50, bg="white", color="ink", at="lonelier", enter="left", sfx="blip"),
                    chip("RELIED ON IT MORE", 0.68, 0.32, size=44, bg="ink", color="paper", at="relying", enter="right", sfx="blip"),
                    chip("LESS TIME WITH PEOPLE", 0.4, 0.42, size=44, bg="white", color="ink", at="spending", enter="left", sfx="blip"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "paper",
                [
                    img("klying", 0.5, 0.33, 0.6, enter="up"),
                    chip("REAL PEOPLE", 0.5, 0.08, size=44, bg="accent", color="ink", at="real", enter="down", sfx="blip"),
                ],
                at="real",
                enter="slide-u",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "caveat",
        "But careful. This is a link, not proof. Lonely people may use it *more*. Or the two may feed each other.",
        [
            shot(
                "paper-grid",
                [
                    text("A LINK", 0.5, 0.15, 240, color="ink", mark="accent", at="link", enter="slam", sfx="hit"),
                    text("NOT PROOF", 0.5, 0.3, 190, color="graphite", at="proof", enter="up"),
                ],
                cam={"z": [1.0, 1.05], "punch": ["link"]},
            ),
            shot(
                "ink",
                [
                    chip("LONELY PEOPLE", 0.3, 0.14, size=44, bg="paper", color="ink", at="Lonely", enter="left", sfx="blip"),
                    L("scribble", shape="arrow", x=0.5, y=0.14, w=0.14, h=0.07, color="accent", strokeW=14, at="more", dur=10, curve=0.0),
                    chip("USE AI MORE", 0.74, 0.14, size=44, bg="accent", color="ink", at="more", enter="right", sfx="blip"),
                ],
                at="Lonely",
                enter="wipe-r",
                cam={"z": [1.0, 1.05]},
            ),
            shot(
                "accent",
                [
                    L("pulse", x=0.5, y=0.3, w=1.0, enter="none", color="ink"),
                    text("A LOOP?", 0.5, 0.3, 240, color="ink", stroke="paper", strokeW=10, at="feed", enter="slam", sfx="hit"),
                    img("face-thinking", 0.5, 0.52, 0.28, at="feed+0.2", enter="pop", rot=-4),
                ],
                at="Or",
                enter="flash",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "drink",
        "Think of a sweet drink and a glass of water. A sweet drink feels great right now. But it can't replace water.",
        [
            shot(
                "paper",
                [
                    chip("A COMPARISON, NOT SCIENCE", 0.5, 0.075, size=30, bg="ink", color="paper", at="start", enter="down"),
                    L("cups", x=0.5, y=0.3, w=0.7, items=[{"label": "SWEET DRINK", "sub": "FEELS GREAT NOW", "level": 0.8, "at": "sweet", "color": "accent"}, {"label": "WATER", "sub": "WHAT YOU NEED", "level": 0.8, "at": "water", "color": "graphite"}], enter="none", at="start"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "accent",
                [
                    text("CAN'T\nREPLACE IT", 0.5, 0.27, 190, color="ink", stroke="paper", strokeW=8, at="replace", enter="slam", sfx="hit"),
                ],
                at="But",
                enter="flash",
                cam={"z": [1.0, 1.06], "punch": ["replace"]},
            ),
        ],
    ),
    scene(
        "tip",
        "A simple idea: use it to practice what you want to say. Then go and say it to a *person*.",
        [
            shot(
                "accent",
                [
                    chip("A SIMPLE IDEA", 0.5, 0.075, size=44, bg="ink", color="paper", at="simple", enter="down", sfx="blip"),
                    L("phone", x=0.3, y=0.33, w=0.28, enter="left", screens=[{"at": "start", "s": "chat"}], rot=-5, id="ph9b"),
                    L("scribble", shape="arrow", x=0.55, y=0.33, w=0.2, h=0.08, color="ink", strokeW=14, at="Then", dur=12, curve=0.0, outline=False),
                    img("kfull-point2", 0.78, 0.34, 0.22, at="Then", enter="right"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    text("TELL A\nPERSON", 0.5, 0.26, 230, color="accent", stroke="ink", shadow="paper", at="person", enter="slam", sfx="hit"),
                    L("heart", x=0.5, y=0.5, w=0.2, at="person+0.2", enter="pop", pulse=["person"]),
                ],
                at="person",
                enter="flash",
                cam={"z": [1.0, 1.07], "punch": ["person"]},
            ),
        ],
    ),
    scene(
        "close",
        "If you often feel very low or alone, a friend or a professional can help in ways a chatbot can't.",
        [
            shot(
                "accent",
                [
                    img("kbust-calm", 0.5, 0.34, 0.54, enter="pop", loop="breathe"),
                    chip("A FRIEND OR A PROFESSIONAL", 0.5, 0.58, size=36, bg="ink", color="paper", at="friend", enter="up", sfx="blip"),
                    L("heart", x=0.82, y=0.14, w=0.16, at="friend", enter="pop", pulse=["professional"], rot=12),
                ],
                cam={"z": [1.0, 1.07]},
            )
        ],
        tone="prof-soft",
    ),
    OUTRO,
]

build(
    "p009-ai-loneliness",
    "Can Talking to AI Make You Lonelier?",
    "gymnopedie-no-1.mp3",
    [
        "Phang, J., et al. / OpenAI & MIT Media Lab (2025). Investigating affective use and emotional well-being on ChatGPT; and Fang, C. M., et al. (2025). How AI and human behaviors shape psychosocial effects of chatbot use: A longitudinal randomized controlled study. (Both released March 2025.)",
        "American Psychological Association (2026). AI chatbots and digital companions are reshaping emotional connection. APA Monitor on Psychology, Jan-Feb 2026. https://www.apa.org/monitor/2026/01-02/trends-digital-ai-relationships-emotional-connection",
    ],
    scenes,
)
