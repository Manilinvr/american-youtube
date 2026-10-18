"""ep007 - Why time goes slow motion when you're scared (Stetson, Fiesta & Eagleman, 2007)."""
from layout import scene, write

# custom plate: a tall panel for the tower, everything else in rows (page is 1080 wide)
PANELS = [
    # id, x, y, w, h, tone, art, fig, figPos, props
    ("kitchen", 44, 176, 992, 480, "cream", "kitchen-glass", "fig. 1 — one long second", None, None),
    ("slowmo", 44, 678, 600, 300, "parchment", "slowmo-glass", "fig. 2 — how it feels", "br", None),
    ("tower", 666, 678, 370, 640, "ochre", "scad-tower", "fig. 3 — the drop", "br", None),
    ("estimate", 44, 1000, 600, 318, "cream", "fall-estimate", "fig. 4 — how long it felt", "bl", None),
    ("chrono", 44, 1340, 520, 340, "parchment", "chronometer", "fig. 5 — the wrist test", "bl", None),
    ("result", 586, 1340, 450, 340, "ochre", "fall-result", "fig. 6 — mid-fall vs. the ground", "br", None),
    ("finding", 44, 1702, 330, 330, "dark", "title-card", None, None,
     {"kicker": "The finding", "title": "It's the\nMemory", "sub": "not the eyes", "cite": "Stetson et al., 2007", "size": 38, "at": "memory", "subAt": "eyes"}),
    ("memory", 396, 1702, 640, 330, "parchment", "memory-reel", "fig. 8 — more footage (a metaphor)", "bl", None),
    ("vacation", 44, 2054, 600, 300, "ochre", "vacation-strip", "fig. 9 — a short vacation, remembered", "bl", None),
    ("new", 666, 2054, 370, 300, "cream", "new-route", "fig. 10 — the same walk, a new way", "bl", None),
]


def panels():
    out = []
    for pid, x, y, w, h, tone, art, fig, fig_pos, props in PANELS:
        p = {"id": pid, "x": x, "y": y, "w": w, "h": h, "tone": tone, "art": art}
        if fig:
            p["fig"] = fig
        if fig_pos:
            p["figPos"] = fig_pos
        if props:
            p["props"] = props
        out.append(p)
    return out


write({
    "id": "ep007-slow-motion",
    "format": "short",
    "title": "Why Time Goes Slow Motion When You're Scared",
    "tone": "documentary",
    "music": "dreamer.mp3",
    "sources": [
        "Stetson, C., Fiesta, M. P., & Eagleman, D. M. (2007). Does time really slow down during a frightening event? PLoS ONE, 2(12), e1295. doi:10.1371/journal.pone.0001295",
        "Avni-Babad, D., & Ritov, I. (2003). Routine and the perception of time. Journal of Experimental Psychology: General, 132(4), 543-550. doi:10.1037/0096-3445.132.4.543",
        "McGaugh, J. L. (2004). The amygdala modulates the consolidation of memories of emotionally arousing experiences. Annual Review of Neuroscience, 27, 1-28. doi:10.1146/annurev.neuro.27.070203.144157",
        "Arstila, V. (2012). Time slows down during accidents. Frontiers in Psychology, 3, 196. doi:10.3389/fpsyg.2012.00196",
    ],
    "page": {
        "width": 1080, "height": 2520,
        "plate": "Plate VII.", "title": "The Slow-Motion Second",
        "subtitle": "on fear, memory, and the feeling that time has stretched",
        "caption": [
            "Plate VII. The slow-motion second.",
            "Fig. 1-2, a falling glass. Fig. 3-6, the tower experiment (Dallas, Texas). Fig. 7, the finding.",
            "Fig. 8, memory as footage (a metaphor; brain simplified). Fig. 9, a vacation. Fig. 10, a new route.",
            "After Stetson, Fiesta & Eagleman 2007; Avni-Babad & Ritov 2003; McGaugh 2004.",
        ],
        "panels": panels(),
    },
    "scenes": [
        scene("hook", "A glass slips off the counter. And for one long second... the world goes *slow motion*.",
              [{"panel": "kitchen", "zoom": 2.6, "focus": [0.5, 0.52], "secs": 0.1},
               {"at": "one", "panel": "kitchen", "zoom": 1.9, "focus": [0.52, 0.5], "secs": 2.2},
               {"at": "slow", "panel": "kitchen", "zoom": 3.0, "focus": [0.53, 0.6], "secs": 2.6}],
              events={"slip": "slips", "slow": "slow"},
              sfx=[{"at": "slow", "name": "heartbeat", "volume": 0.35}]),
        scene("drops", "You see every drop. But did time really *slow down*?",
              [{"panel": "slowmo", "zoom": 2.4, "focus": [0.3, 0.45], "secs": 1.2},
               {"at": "but", "panel": "slowmo", "secs": 1.8}],
              events={"frames": 0, "q": "really"},
              sfx=[{"at": "really", "name": "scribble", "volume": 0.16}], hold=0.5),
        scene("tower", "Scientists tested it at a Texas amusement park. They hoisted volunteers [150 feet|a hundred and fifty feet] up a tower, and dropped them backward... into a *net*.",
              [{"panel": "tower", "secs": 1.3},
               {"at": "hoisted", "panel": "tower", "zoom": 2.3, "focus": [0.5, 0.3], "secs": 1.8},
               {"at": "dropped", "panel": "tower", "zoom": 2.0, "focus": [0.5, 0.55], "secs": 1.6}],
              events={"hoist": "hoisted", "drop": "dropped", "net": "net"},
              sfx=[{"at": "dropped", "name": "whoosh", "volume": 0.25}], hold=0.5),
        scene("estimate", "Afterward, their own fall felt about [36%|thirty-six percent] longer than falls they'd only watched.",
              [{"panel": "estimate", "secs": 1.4},
               {"at": "36", "panel": "estimate", "zoom": 2.4, "focus": [0.66, 0.5], "secs": 1.6}],
              events={"click": 0.3, "own": "own", "pct": "36", "watched": "watched"},
              sfx=[{"at": 0.3, "name": "tick", "volume": 0.2}], hold=0.5),
        scene("device", "But on each wrist was a tiny screen, flashing a number too fast to read. If time really slowed, that number should pop out.",
              [{"panel": "chrono", "zoom": 2.3, "focus": [0.33, 0.5], "secs": 1.4},
               {"at": "flashing", "panel": "chrono", "secs": 1.6},
               {"at": "if", "panel": "chrono", "zoom": 2.2, "focus": [0.72, 0.5], "secs": 1.6}],
              events={"wrist": "wrist", "flash": "flashing", "blur": "fast", "pop": "pop"},
              sfx=[{"at": "pop", "name": "pop", "volume": 0.2}], hold=0.4),
        scene("result", "It didn't. Mid-fall, they read it no better than people on the ground.",
              [{"panel": "chrono", "zoom": 2.2, "focus": [0.72, 0.5], "secs": 0.3},
               {"at": "mid", "panel": "result", "secs": 1.5}],
              events={"didnt": "didn't", "air": "mid", "ground": "ground"},
              sfx=[{"at": "didn't", "name": "scribble", "volume": 0.16}], hold=0.6),
        scene("name", "So the slow motion isn't in your eyes. It's in your *memory*.",
              [{"panel": "finding", "secs": 1.3}],
              events={"eyes": "eyes", "memory": "memory"}, hold=0.7),
        scene("why", "The researchers' best guess: fear wakes up the brain's alarm, the amygdala, and you store extra detail. More footage... feels like more time.",
              [{"panel": "memory", "secs": 1.4},
               {"at": "alarm", "panel": "memory", "zoom": 2.4, "focus": [0.24, 0.5], "secs": 1.4},
               {"at": "store", "panel": "memory", "secs": 1.6}],
              events={"alarm": "alarm", "store": "store", "more": "more", "time": "time"},
              hold=0.6),
        scene("vacation", "There's a calmer version, too. In one study of beach vacations, the first days felt longest, looking back. Then routine set in... and the days *flew*.",
              [{"panel": "vacation", "secs": 1.4},
               {"at": "first", "panel": "vacation", "zoom": 2.3, "focus": [0.33, 0.62], "secs": 1.5},
               {"at": "routine", "panel": "vacation", "secs": 1.6}],
              events={"first": "first", "routine": "routine", "flew": "flew"},
              sfx=[{"at": "flew", "name": "whoosh", "volume": 0.16}], hold=0.5),
        scene("tip", "Want a year that feels longer? Give your memory something *new*.",
              [{"panel": "new", "secs": 1.4}],
              events={"walk": 0, "new": "give"}, hold=1.0),
        scene("close", "And next time the world goes slow motion... time isn't stopping. Your brain is just taking *notes*.",
              [{"at": -0.63, "panel": "kitchen", "zoom": 2.2, "focus": [0.53, 0.55], "secs": 0.1},
               {"at": "notes", "page": True, "secs": 3.2}],
              events={"back": 0, "catch": "stopping", "notes": "brain"},
              sfx=[{"at": "stopping", "name": "clink", "volume": 0.25}, {"at": "notes", "name": "page", "volume": 0.14}],
              tone="deep", hold=3.2, transition="black"),
    ],
})
