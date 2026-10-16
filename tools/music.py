#!/usr/bin/env python3
"""Synthesises a soft, unobtrusive ambient pad for background music (no samples, no licences).

    python3 tools/music.py            -> public/music/soft-pad.mp3 (64 s, loops cleanly)

Slow chords of detuned sine waves with long fades, low-passed so they sit far behind the voice.
"""
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parents[1] / "public" / "music"

# Fmaj9 -> Am7 -> Dm9 -> Bbmaj7 (warm, unresolved, never "happy jingle")
CHORDS = [
    [53, 60, 64, 67, 69],
    [57, 60, 64, 67, 71],
    [50, 57, 60, 64, 65],
    [46, 53, 57, 62, 65],
]
CHORD_SEC = 8.0
REPEATS = 2


def hz(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def chord(notes: list[int], seconds: float) -> np.ndarray:
    t = np.arange(int(seconds * SR)) / SR
    sig = np.zeros_like(t)
    for j, m in enumerate(notes):
        f = hz(m)
        amp = 0.6 if j == 0 else 0.35
        for detune in (-0.12, 0.0, 0.12):  # cents-ish chorus
            sig += amp * np.sin(2 * np.pi * f * (1 + detune / 100) * t + j)
        sig += amp * 0.08 * np.sin(2 * np.pi * 2 * f * t)
    attack, release = 2.5, 3.0
    env = np.minimum(1, t / attack) * np.minimum(1, (seconds + release - t) / release)
    return sig * env


def lowpass(x: np.ndarray, alpha: float) -> np.ndarray:
    y = np.zeros_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += alpha * (v - acc)
        y[i] = acc
    return y


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    seq = CHORDS * REPEATS
    total = int(len(seq) * CHORD_SEC * SR)
    tail = int(3.0 * SR)
    mix = np.zeros(total + tail)
    for i, notes in enumerate(seq):
        c = chord(notes, CHORD_SEC)
        start = int(i * CHORD_SEC * SR)
        mix[start:start + len(c)] += c[: len(mix) - start]
    # wrap the release tail to the start so the file loops seamlessly
    mix[:tail] += mix[total:]
    mix = mix[:total]
    mix = lowpass(mix, 0.08)
    mix = mix / np.max(np.abs(mix)) * 0.6
    wav = OUT / "soft-pad.wav"
    with wave.open(str(wav), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes((mix * 32767).astype("<i2").tobytes())
    mp3 = OUT / "soft-pad.mp3"
    try:
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-b:a", "128k", str(mp3)], check=True)
        wav.unlink()
        print(mp3)
    except (OSError, subprocess.CalledProcessError):
        print(wav, "(install ffmpeg to get an mp3)")


if __name__ == "__main__":
    main()
