#!/usr/bin/env python3
"""p019: THE CASE OF THE 38 WITNESSES  — "case file" style (theme 'case': cork board, polaroids, red strings, typed documents, typewriter captions).

Facts (all read in this session):
- Kitty Genovese story: NYT 1964 said 38 witnesses; Manning, Levine & Collins 2007 (American Psychologist) found no evidence for 38 witnesses who saw the attack,
  nor that inaction caused the death; the NYT in 2016 called its own account flawed.
- Darley & Latane 1968 (JPSP 4, 377-383): intercom discussion, a confederate seemed to have a seizure; more believed listeners -> less likely to help.
- Fischer et al. 2011 (Psych Bulletin 137, 517-537): effect attenuated when danger is clear, perpetrator present, physical costs of helping.
- Philpot et al. 2020 (American Psychologist 75, 66-75): CCTV of 219 public conflicts in Amsterdam, Cape Town, Lancaster; in ~9 of 10 at least one bystander intervened;
  more bystanders -> higher chance that someone intervened.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prof.lib import *  # noqa: E402,F403


def pol(src, x, y, w, caption=None, rot=0, **kw):
    return L("polaroid", src=src, x=x, y=y, w=w, caption=caption, rot=rot, **kw)


def note(text, x, y, w=0.34, rot=-4, **kw):
    return L("note", text=text, x=x, y=y, w=w, rot=rot, **kw)


def string(a, b, at, **kw):
    return L("string", **{"from": a}, to=b, x=0.5, y=0.5, w=1.0, at=at, enter="none", **kw)


def stamp(text, x=0.5, y=0.3, size=150, at=None, sub=None, tilt=-9, **kw):
    d = dict(text=text, sub=sub, x=x, y=y, size=size, tilt=tilt, enter="slam", sfx="hit")
    d.update(kw)
    if at is not None:
        d["at"] = at
    return L("rubber", **d)


def exhibit(label, x, y, at, w=0.3, sub=None, **kw):
    return L("exhibit", label=label, sub=sub, x=x, y=y, w=w, at=at, enter="drop", sfx="pop", **kw)


scenes = [
    scene(
        "hook",
        "March, nineteen sixty-four. A young woman is killed in New York. The newspaper says thirty-eight people watched, and *nobody* helped. For sixty years, we've told this story to explain why people don't help. But when I opened the case file... the story didn't add up.",
        [
            shot(
                "desk",
                [
                    L("doc", header="CASE FILE · 1964", lines=[{"text": "VICTIM: A YOUNG WOMAN", "at": 0.2}, {"text": "CITY: NEW YORK", "at": 1.0}, {"text": "WITNESSES: ", "at": 1.8, "red": True}], x=0.5, y=0.3, w=0.82, size=44, tilt=-2, enter="drop", delay=-0.3, sfx="pop"),
                    stamp("COLD CASE", x=0.62, y=0.54, size=100, at="killed", tilt=-12),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "kraft",
                [
                    pol("kbust-calm", 0.5, 0.3, 0.46, caption="the newspaper", rot=-3, enter="drop", delay=-0.3),
                    L("doc", header="NEW YORK, 1964", lines=[{"text": "38 PEOPLE WATCHED.", "at": "thirty-eight"}, {"text": "NOBODY HELPED.", "at": "nobody", "red": True}], x=0.5, y=0.58, w=0.82, size=44, tilt=2, enter="up"),
                ],
                at="newspaper",
                enter="flash",
                cam={"z": [1.0, 1.08], "punch": ["nobody"]},
            ),
            shot(
                "cork",
                [
                    pol("kbust-pen", 0.3, 0.2, 0.34, caption="the story", rot=-5, enter="left"),
                    pol("face-skeptic", 0.7, 0.2, 0.34, caption="the doubt", rot=4, enter="right", at="opened"),
                    string((0.3, 0.2), (0.7, 0.2), at="opened", sag=0.03),
                    stamp("DOESN'T ADD UP", x=0.5, y=0.45, size=84, at="add", tilt=-6),
                ],
                at="sixty#2",
                enter="wipe-r",
                cam={"z": [1.0, 1.06], "shake": ["add"]},
            ),
        ],
    ),
    scene(
        "idea",
        "That story inspired a famous idea: the *bystander effect*. The more people who see an emergency, the less likely any one of them is to act.",
        [
            shot(
                "cork",
                [
                    L("note", text="THE BYSTANDER EFFECT", x=0.5, y=0.14, w=0.66, rot=-2, size=70, enter="drop", at="bystander", sfx="pop", delay=-0.3),
                    pol("kbust-calm", 0.28, 0.38, 0.3, caption="1 witness", rot=-4, enter="left", delay=-0.2),
                    pol("face-calm", 0.72, 0.38, 0.24, caption="", rot=4, enter="right", at="more", bg="soft"),
                    pol("face-calm", 0.58, 0.44, 0.22, caption="many witnesses", rot=-3, enter="right", at="more+0.15", bg="soft"),
                    string((0.28, 0.32), (0.72, 0.32), at="less", sag=0.04),
                ],
                cam={"z": [1.0, 1.08]},
            ),
            shot(
                "desk",
                [
                    L("doc", header="THE THEORY", lines=[{"text": "MORE PEOPLE WATCH", "at": "more"}, {"text": "= LESS CHANCE", "at": "less"}, {"text": "ANY ONE OF THEM ACTS.", "at": "act", "red": True}], x=0.5, y=0.28, w=0.84, size=46, tilt=-1.5, enter="up"),
                ],
                at="The#2",
                enter="iris",
                irisAt=[0.5, 0.3],
                cam={"z": [1.0, 1.07]},
            ),
        ],
    ),
    scene(
        "examA",
        "Exhibit A, the lab. In 1968, psychologists Darley and Latané had students talk over an intercom. One of them suddenly seemed to have a seizure. Some students thought they were the only one listening. Others thought several more were listening too. And the more listeners they imagined, the *less* likely each one was to help.",
        [
            shot(
                "desk",
                [
                    exhibit("A", 0.5, 0.2, at="start", w=0.34, sub="THE LAB · 1968", delay=-0.3),
                    L("doc", header="DARLEY & LATANÉ", lines=[{"text": "INTERCOM DISCUSSION.", "at": "intercom"}, {"text": "ONE VOICE: A SEIZURE.", "at": "seizure", "red": True}], x=0.5, y=0.52, w=0.82, size=42, tilt=1.5, enter="up"),
                    cite("Darley & Latané · 1968", "start"),
                ],
                cam={"z": [1.0, 1.07]},
            ),
            shot(
                "cork",
                [
                    pol("kbust-pocket", 0.3, 0.2, 0.32, caption="ALONE", rot=-4, enter="left"),
                    note("I'M THE\nONLY ONE\nLISTENING", 0.7, 0.18, w=0.32, rot=4, at="only", enter="right"),
                ],
                at="Some",
                enter="slide-l",
                cam={"z": [1.0, 1.07]},
            ),
            shot(
                "cork",
                [
                    pol("kbust-pocket", 0.28, 0.2, 0.28, caption="", rot=-4, enter="none"),
                    pol("face-calm", 0.55, 0.22, 0.22, caption="", rot=3, enter="right", at="Others", bg="soft"),
                    pol("face-smile", 0.78, 0.2, 0.22, caption="", rot=-2, enter="right", at="several", bg="soft"),
                    pol("face-skeptic", 0.52, 0.42, 0.22, caption="", rot=2, enter="right", at="listening#2", bg="soft"),
                    pol("face-surprised", 0.78, 0.42, 0.22, caption="", rot=-3, enter="right", at="too", bg="soft"),
                    note("OTHERS ARE\nLISTENING TOO", 0.28, 0.44, w=0.3, rot=-3, at="too", enter="left"),
                ],
                at="Others",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    L("chart", x=0.5, y=0.28, w=0.9, h=0.34, xlabel="BELIEVED LISTENERS", ylabel="CHANCE OF HELPING", series=[{"pts": [[0.05, 0.9], [0.5, 0.55], [0.95, 0.2]], "color": "accent", "at": "less", "label": "FALLS"}], enter="up", at="start"),
                    chip("ILLUSTRATION OF THE TREND", 0.5, 0.075, size=26, bg="soft", color="ink", at="start", enter="down"),
                ],
                at="And#2",
                enter="flash",
                cam={"z": [1.0, 1.06], "shake": ["less"]},
            ),
        ],
    ),
    scene(
        "real",
        "So, the effect is real... in situations like that one.",
        [
            shot(
                "kraft",
                [
                    stamp("CONFIRMED", x=0.5, y=0.26, size=140, at="real", tilt=-8, sub="IN THAT KIND OF SITUATION"),
                    pol("kbust-pen", 0.5, 0.5, 0.36, caption="the effect is real", rot=-3, enter="up", delay=-0.2),
                ],
                cam={"z": [1.0, 1.08], "punch": ["real"]},
            )
        ],
    ),
    scene(
        "examB",
        "Exhibit B, the big review. In 2011, researchers combined dozens of experiments. And they found the effect gets *weaker* when the danger is clear, when the attacker is right there, and when helping carries a physical risk.",
        [
            shot(
                "desk",
                [
                    exhibit("B", 0.5, 0.2, at="start", w=0.34, sub="THE BIG REVIEW · 2011", delay=-0.3),
                    cite("Fischer et al. · 2011", "start"),
                    pol("kbust-big-pen", 0.5, 0.5, 0.36, caption="dozens of experiments", rot=2, enter="up", delay=-0.2),
                ],
                cam={"z": [1.0, 1.07]},
            ),
            shot(
                "cork",
                [
                    note("THE EFFECT\nGETS WEAKER\nWHEN...", 0.5, 0.12, w=0.5, rot=-2, size=68, enter="drop", at="weaker"),
                    L("doc", header="WEAKER WHEN", lines=[{"text": "DANGER IS CLEAR", "at": "clear"}, {"text": "ATTACKER IS THERE", "at": "attacker"}, {"text": "HELPING IS RISKY", "at": "physical", "red": True}], x=0.5, y=0.42, w=0.84, size=46, tilt=1, enter="up"),
                ],
                at="weaker",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "examC",
        "Exhibit C, the cameras. In 2020, researchers studied security-camera footage of two hundred and nineteen real public fights, in three cities: Amsterdam, Cape Town, and Lancaster, in England. In about nine out of ten, at least one bystander stepped in. And more people around meant it was *more* likely that someone helped, not less.",
        [
            shot(
                "desk",
                [
                    exhibit("C", 0.5, 0.2, at="start", w=0.34, sub="THE CAMERAS · 2020", delay=-0.3),
                    cite("Philpot et al. · 2020", "start"),
                    L("counter", to=219, size=300, color="paper", x=0.5, y=0.48, at="two", dur=24, enter="none", stroke="ink", shadow="accent", sfx="hit"),
                    chip("REAL PUBLIC CONFLICTS ON CCTV", 0.5, 0.58, size=32, bg="white", color="ink", at="two", enter="up", sfx="blip"),
                ],
                cam={"z": [1.0, 1.07], "punch": ["two"]},
            ),
            shot(
                "cork",
                [
                    pol("", 0.25, 0.18, 0.3, caption="", big="AMSTERDAM", rot=-4, enter="left", at="Amsterdam"),
                    pol("", 0.62, 0.2, 0.3, caption="", big="CAPE\nTOWN", rot=3, enter="drop", at="Cape"),
                    pol("", 0.43, 0.44, 0.3, caption="", big="LANCASTER", rot=-2, enter="right", at="Lancaster"),
                    string((0.25, 0.14), (0.62, 0.16), at="Cape", sag=0.03),
                    string((0.62, 0.16), (0.43, 0.4), at="Lancaster", sag=0.03),
                ],
                at="three",
                enter="blinds",
                cam={"z": [1.0, 1.07]},
            ),
            shot(
                "ink",
                [
                    L("dots", x=0.5, y=0.2, w=0.7, total=10, cols=5, hit=9, hitAt="nine#2", at="start", delay=-0.4, step=0.1, hitStep=0.3, enter="none", id="d10"),
                    big("9 OF 10", size=300, y=0.46, color="accent", at="nine#2"),
                    chip("AT LEAST ONE PERSON STEPPED IN", 0.5, 0.6, size=34, bg="paper", color="ink", at="stepped", enter="up", sfx="blip"),
                ],
                at="In#3",
                enter="flash",
                cam={"z": [1.0, 1.07], "punch": ["nine#2"]},
            ),
            shot(
                "cork",
                [
                    note("MORE PEOPLE\nAROUND =\nMORE LIKELY\nSOMEONE HELPS", 0.5, 0.2, w=0.64, rot=-2, size=70, enter="drop", at="more"),
                ],
                at="And#3",
                enter="slide-u",
                cam={"z": [1.0, 1.07]},
            ),
        ],
    ),
    scene(
        "back",
        "Now back to the first case. In 2007, researchers went through court records and police files. They found no evidence that thirty-eight people watched the attack. And in 2016, the newspaper itself called its original story flawed.",
        [
            shot(
                "desk",
                [
                    L("doc", header="RE-OPENED: 2007", lines=[{"text": "COURT RECORDS. POLICE FILES.", "at": "records"}, {"text": "38 WITNESSES: ", "at": "thirty-eight"}, {"text": "NO EVIDENCE.", "at": "evidence", "red": True}], x=0.5, y=0.3, w=0.84, size=46, tilt=-1, enter="drop", delay=-0.3, sfx="pop"),
                    cite("Manning, Levine & Collins · 2007", "start"),
                ],
                cam={"z": [1.0, 1.07]},
            ),
            shot(
                "kraft",
                [
                    L("doc", header="NEW YORK TIMES, 1964", lines=[{"text": "38 WATCHED.", "at": "start+0.3", "redact": True, "revealAt": "flawed"}], x=0.5, y=0.26, w=0.84, size=52, tilt=2, enter="up"),
                    stamp("FLAWED", x=0.5, y=0.52, size=130, at="flawed", tilt=-10, sub="THE NEWSPAPER, 2016"),
                ],
                at="newspaper",
                enter="flash",
                cam={"z": [1.0, 1.08], "punch": ["flawed"]},
            ),
        ],
    ),
    scene(
        "think",
        "So how can all of this be true? Here's my reading. The lab studies used *unclear* situations: a voice on an intercom, nobody in sight. When it's unclear, we glance at each other. And if nobody moves, we decide it's probably fine. But a real fight in the street is obvious. When it's clearly serious, most people act.",
        [
            shot(
                "cork",
                [
                    note("MY READING\n(NOT A FINDING)", 0.5, 0.1, w=0.54, rot=-3, size=60, enter="drop", delay=-0.3),
                    pol("kbust-calm", 0.5, 0.36, 0.36, caption="how can both be true?", rot=3, enter="up", delay=-0.2),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "desk",
                [
                    L("doc", header="THE LAB", lines=[{"text": "A VOICE ON AN INTERCOM.", "at": "voice"}, {"text": "NOBODY IN SIGHT.", "at": "sight"}, {"text": "UNCLEAR.", "at": "unclear", "red": True}], x=0.5, y=0.26, w=0.84, size=44, tilt=-1.5, enter="up"),
                ],
                at="lab",
                enter="wipe-r",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "cork",
                [
                    pol("face-skeptic", 0.28, 0.2, 0.28, caption="", rot=-4, enter="left", bg="soft"),
                    pol("face-calm", 0.7, 0.22, 0.28, caption="", rot=3, enter="right", bg="soft"),
                    string((0.28, 0.16), (0.7, 0.18), at="glance", sag=0.03),
                    note("NOBODY\nMOVES =\nPROBABLY\nFINE", 0.5, 0.46, w=0.44, rot=-2, at="moves", enter="drop"),
                ],
                at="glance",
                enter="slide-l",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    big("A REAL\nFIGHT IS\nOBVIOUS", size=170, y=0.24, color="paper", at="real"),
                    stamp("PEOPLE ACT", x=0.5, y=0.5, size=100, at="act", tilt=-6),
                ],
                at="But",
                enter="flash",
                cam={"z": [1.0, 1.07], "punch": ["act"]},
            ),
        ],
    ),
    scene(
        "verdict",
        "So, my verdict. The bystander effect is real, but the story that people just walk by is a *myth*. It depends on one thing: how clear the emergency is.",
        [
            shot(
                "kraft",
                [
                    stamp("CASE CLOSED", x=0.5, y=0.2, size=130, at="verdict", tilt=-7, sub="THE EFFECT IS REAL · THE MYTH IS NOT"),
                    pol("kbust-pen", 0.5, 0.5, 0.36, caption="the verdict", rot=-2, enter="up", delay=-0.2),
                ],
                cam={"z": [1.0, 1.08], "punch": ["verdict"]},
            ),
            shot(
                "desk",
                [
                    L("doc", header="THE VERDICT", lines=[{"text": "THE EFFECT: REAL.", "at": "real"}, {"text": "'PEOPLE WALK BY': MYTH.", "at": "myth", "red": True}, {"text": "DEPENDS ON: HOW CLEAR.", "at": "clear"}], x=0.5, y=0.28, w=0.86, size=46, tilt=1, enter="up"),
                ],
                at="myth",
                enter="wipe-l",
                cam={"z": [1.0, 1.06]},
            ),
        ],
    ),
    scene(
        "advice",
        "If you ever see something that might be an emergency, don't assume someone else has already acted. Point at one person and say, 'You, call for help.' Or just be the first to move. These are my suggestions, not study findings.",
        [
            shot(
                "cork",
                [
                    note("MY ADVICE\n(NOT A FINDING)", 0.5, 0.1, w=0.54, rot=-3, size=60, enter="drop", delay=-0.3),
                    L("doc", header="IF YOU SEE IT", lines=[{"text": "DON'T ASSUME", "at": "don't"}, {"text": "SOMEONE ELSE HAS CALLED.", "at": "someone", "red": True}], x=0.5, y=0.36, w=0.84, size=44, tilt=-1, enter="up"),
                ],
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "kraft",
                [
                    pol("kfull-point", 0.5, 0.3, 0.4, caption="POINT AT ONE PERSON", rot=-2, enter="drop", bottom=0, fit=1),
                    L("bubble", text="You, call for help!", x=0.5, y=0.56, size=44, at="call", enter="pop", sfx="pop"),
                ],
                at="Point",
                enter="slide-l",
                cam={"z": [1.0, 1.06]},
            ),
            shot(
                "ink",
                [
                    big("BE THE\nFIRST", size=230, y=0.26, color="paper", at="first"),
                    img("kfull-walk", 0.5, 0.58, 0.22, enter="left", at="first", filter="sepia(0.4)"),
                ],
                at="Or",
                enter="flash",
                cam={"z": [1.0, 1.07], "punch": ["first"]},
            ),
        ],
    ),
    scene(
        "close",
        "People aren't cold. They just need a clear signal, and someone willing to go *first*.",
        [
            shot(
                "kraft",
                [
                    pol("kbust-calm", 0.5, 0.32, 0.5, caption="people aren't cold", rot=-2, enter="drop", delay=-0.2),
                    stamp("A CLEAR SIGNAL", x=0.5, y=0.62, size=64, at="clear", tilt=-4),
                ],
                cam={"z": [1.0, 1.07]},
            )
        ],
        tone="prof-soft",
    ),
    OUTRO,
]

build(
    "p019-case-38-witnesses",
    "The Case of the 38 Witnesses (Bystander Effect)",
    "gymnopedie-no-1.mp3",
    [
        "Manning, R., Levine, M., & Collins, A. (2007). The Kitty Genovese murder and the social psychology of helping: The parable of the 38 witnesses. American Psychologist, 62(6), 555-562.",
        "Darley, J. M., & Latané, B. (1968). Bystander intervention in emergencies: Diffusion of responsibility. Journal of Personality and Social Psychology, 8(4, Pt.1), 377-383.",
        "Fischer, P., et al. (2011). The bystander-effect: A meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin, 137(4), 517-537.",
        "Philpot, R., Liebst, L. S., Levine, M., Bernasco, W., & Lindegaard, M. R. (2020). Would I be helped? Cross-national CCTV footage shows that intervention is the norm in public conflicts. American Psychologist, 75(1), 66-75. https://doi.org/10.1037/amp0000469",
    ],
    scenes,
)
f = ROOT / "episodes" / "p019-case-38-witnesses.json"
d = json.loads(f.read_text())
d["theme"] = "case"
f.write_text(json.dumps(d, indent="\t", ensure_ascii=False) + "\n")
