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


def alarm() -> np.ndarray:
    # classic fire-station double tone, 4 bursts
    x = t(0.22)
    burst = np.sign(np.sin(2 * np.pi * 950 * x)) * 0.35 + np.sin(2 * np.pi * 1900 * x) * 0.2
    burst *= np.minimum(1, np.minimum(x / 0.01, (x[-1] - x) / 0.01))
    gap = np.zeros(int(0.08 * SR))
    return np.concatenate([burst, gap] * 4)


def tick() -> np.ndarray:
    x = t(0.05)
    return np.sin(2 * np.pi * 2200 * x) * env(len(x), 0.001, 90) * 0.7


def siren() -> np.ndarray:
    x = t(2.4)
    freq = 750 + 450 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.9 * x - np.pi / 2))
    tone = np.sin(2 * np.pi * np.cumsum(freq) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(freq) / SR)
    fade = np.minimum(1, np.minimum(x / 0.3, (x[-1] - x) / 0.6))
    return tone * fade * 0.35


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


EFFECTS = {f.__name__: f for f in [pop, whoosh, ding, alarm, tick, siren, boing, scratch]}


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
