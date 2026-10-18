#!/usr/bin/env python3
"""Synthesises the small royalty-free sound effects in public/sfx/ (no samples, pure math).

    python3 tools/sfx.py

Every effect is generated from sine waves and noise, so there are no licensing questions.
Add a new effect by writing a function that returns a float array and registering it in EFFECTS.
"""
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


def heartbeat() -> np.ndarray:
    # one slow, soft heartbeat: two low thumps ("lub-dub"), for slow-motion moments
    x = t(1.1)
    out = np.zeros_like(x)
    for start, amp in [(0.0, 1.0), (0.24, 0.7)]:
        k = np.clip(x - start, 0, None)
        on = x >= start
        out += on * amp * np.sin(2 * np.pi * (48 + 30 * np.exp(-20 * k)) * k) * np.exp(-14 * k) * np.minimum(1, k / 0.006)
    return out


def clink() -> np.ndarray:
    # a drinking glass caught in the hand: a short, bright glassy tap
    x = t(0.6)
    tone = sum(a * np.sin(2 * np.pi * f * x) for f, a in [(2093, 1), (3520, 0.45), (5274, 0.2)])
    tap = rng.standard_normal(len(x)) * np.exp(-200 * x) * 0.3
    return (tone * env(len(x), 0.001, 9) + tap) * 0.5


EFFECTS = {f.__name__: f for f in [pop, whoosh, ding, tick, boing, scratch, scribble, page, stamp, shower, heartbeat, clink]}


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
    for name, fn in EFFECTS.items():
        write(name, fn())
        print(f"public/sfx/{name}.wav")
