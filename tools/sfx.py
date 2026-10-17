#!/usr/bin/env python3
"""Synthesises the small royalty-free sound effects in public/sfx/ (no samples, pure math).

    python3 tools/sfx.py

Every effect is generated from sine waves and noise, so there are no licensing questions.
Add a new effect by writing a function that returns a float array and registering it in EFFECTS.
"""
import sys
import wave
from pathlib import Path

import numpy as np

SR = 24000
OUT = Path(__file__).resolve().parents[1] / "public" / "sfx"
rng = np.random.default_rng(7)


def t(sec: float) -> np.ndarray:
    return np.arange(int(sec * SR)) / SR


def env(n: int, attack: float = 0.005, decay: float = 8.0) -> np.ndarray:
    x = np.arange(n) / SR
    return np.minimum(1, x / attack) * np.exp(-decay * x)


def pop() -> np.ndarray:
    x = t(0.12)
    freq = 900 * np.exp(-25 * x) + 250
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(len(x), 0.002, 35)


def whoosh() -> np.ndarray:
    x = t(0.45)
    noise = rng.standard_normal(len(x))
    # sweep a simple one-pole low-pass up and down for the "air" movement
    cutoff = 0.02 + 0.25 * np.sin(np.pi * x / x[-1]) ** 2
    out, y = np.zeros_like(noise), 0.0
    for i, n in enumerate(noise):
        y += cutoff[i] * (n - y)
        out[i] = y
    return out * np.sin(np.pi * x / x[-1]) ** 1.5 * 2.2


def ding() -> np.ndarray:
    x = t(0.9)
    tone = sum(a * np.sin(2 * np.pi * f * x) for f, a in [(1318.5, 1), (2637, 0.35), (3955, 0.12)])
    return tone * env(len(x), 0.002, 5) * 0.6


def tick() -> np.ndarray:
    x = t(0.05)
    return np.sin(2 * np.pi * 2200 * x) * env(len(x), 0.001, 90) * 0.7


def boing() -> np.ndarray:
    x = t(0.5)
    freq = 180 + 140 * np.sin(2 * np.pi * 14 * x) * np.exp(-6 * x) + 120 * x
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(len(x), 0.003, 6) * 0.8


def scratch() -> np.ndarray:
    # record scratch: noisy chirp down then up
    x = t(0.35)
    freq = 300 + 1500 * np.abs(np.sin(2 * np.pi * 2.6 * x))
    tone = np.sin(2 * np.pi * np.cumsum(freq) / SR) * 0.4 + rng.standard_normal(len(x)) * 0.25
    return tone * np.minimum(1, (x[-1] - x) / 0.05)


def scribble() -> np.ndarray:
    # pencil on paper: bursts of band-limited noise with a scratchy rhythm
    x = t(0.5)
    noise = rng.standard_normal(len(x))
    hp = np.diff(noise, prepend=0)  # crude high-pass = papery hiss
    strokes = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 9 * x + 0.6 * np.sin(2 * np.pi * 3 * x)))
    return hp * strokes * np.minimum(1, np.minimum(x / 0.02, (x[-1] - x) / 0.08)) * 0.5


def page() -> np.ndarray:
    # quick paper flip
    x = t(0.35)
    noise = rng.standard_normal(len(x))
    out, y = np.zeros_like(noise), 0.0
    for i, n in enumerate(noise):
        y += 0.35 * (n - y)
        out[i] = y
    return out * np.sin(np.pi * (x / x[-1]) ** 0.6) ** 2


def stamp() -> np.ndarray:
    # rubber stamp hitting paper: a low thump plus a short papery slap
    x = t(0.3)
    thump = np.sin(2 * np.pi * (90 * np.exp(-12 * x) + 55) * x) * np.exp(-18 * x)
    slap = rng.standard_normal(len(x)) * np.exp(-60 * x) * 0.6
    return thump + slap


def shower() -> np.ndarray:
    # running water, seamless 4 s loop: band-limited noise with a slow gentle swell
    n = int(4 * SR)
    noise = rng.standard_normal(n)
    out, lp, hp_prev, y = np.zeros(n), 0.0, 0.0, 0.0
    for i, v in enumerate(noise):
        lp += 0.35 * (v - lp)      # soften the top end
        y = 0.97 * (y + lp - hp_prev)  # remove rumble
        hp_prev = lp
        out[i] = y
    swell = 0.85 + 0.15 * np.sin(2 * np.pi * np.arange(n) / n)
    out *= swell
    fade = int(0.05 * SR)  # tiny crossfade so the loop point is inaudible
    out[:fade] = out[:fade] * np.linspace(0, 1, fade) + out[-fade:] * np.linspace(1, 0, fade)
    return out[:-fade] * 0.5


def buzz() -> np.ndarray:
    # phone vibration motor: low hum chopped by a fast amplitude wobble, two short bursts
    x = t(0.62)
    carrier = np.sin(2 * np.pi * 168 * x) + 0.5 * np.sin(2 * np.pi * 336 * x) + 0.25 * np.sign(np.sin(2 * np.pi * 168 * x))
    gate = (np.sin(2 * np.pi * 26 * x) > -0.25).astype(float)
    bursts = ((x < 0.26) | ((x > 0.32) & (x < 0.58))).astype(float)
    return carrier * gate * bursts * np.minimum(1, x / 0.01) * 0.7


def hit() -> np.ndarray:
    # soft cinematic impact for a number or title landing
    x = t(0.5)
    boom = np.sin(2 * np.pi * (70 * np.exp(-9 * x) + 42) * x) * np.exp(-7 * x)
    air = rng.standard_normal(len(x)) * np.exp(-30 * x) * 0.35
    return boom + air


def rise() -> np.ndarray:
    # short riser before a reveal
    x = t(0.7)
    freq = 300 + 1700 * (x / x[-1]) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(freq) / SR) * 0.4
    air = np.diff(rng.standard_normal(len(x)), prepend=0) * 0.25
    return (tone + air) * (x / x[-1]) ** 1.5 * np.minimum(1, (x[-1] - x) / 0.04)


def blip() -> np.ndarray:
    # tiny interface blip for chips and labels
    x = t(0.09)
    return np.sin(2 * np.pi * (1500 + 600 * x / x[-1]) * x) * env(len(x), 0.002, 45) * 0.6


EFFECTS = {f.__name__: f for f in [pop, whoosh, ding, tick, boing, scratch, scribble, page, stamp, shower, buzz, hit, rise, blip]}


def write(name: str, audio: np.ndarray) -> None:
    audio = audio / max(1e-9, np.max(np.abs(audio))) * 0.8
    pcm = (audio * 32767).astype("<i2")
    with wave.open(str(OUT / f"{name}.wav"), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(pcm.tobytes())


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    only = sys.argv[1:]  # e.g. `python3 tools/sfx.py buzz hit` writes just those (others stay byte-identical)
    for name, fn in EFFECTS.items():
        audio = fn()  # always run, so the random generator stays in step
        if only and name not in only:
            continue
        write(name, audio)
        print(f"public/sfx/{name}.wav")
