#!/usr/bin/env python3
"""Free AI voice-over for an episode, using Kokoro TTS (Apache-2.0, runs offline on CPU).

    python3 tools/tts/voice.py firefighter-short          # voice every scene (cached)
    python3 tools/tts/voice.py firefighter-short --force  # re-voice everything
    python3 tools/tts/voice.py --voices                   # list available voices

Reads  episodes/<id>.json  and  config/moods.json
Writes public/voice/<id>/<scene>.wav  and  public/voice/<id>/manifest.json

The manifest holds, per scene: the audio duration, a timing estimate for every
word (for captions and visual cues) and a per-frame loudness envelope (for the
characters' mouth movement). Remotion reads it at render time.

Script markup inside "say":
    *word*                  emphasised in captions (different colour)
    [4%|four percent]       caption shows "4%", the voice says "four percent"
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import urllib.request
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
MODELS = ROOT / "models"
MODEL_FILES = {
    "kokoro-v1.0.onnx": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx",
    "voices-v1.0.bin": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin",
}
FPS = 30
SAMPLE_RATE = 24000
TOKEN_RE = re.compile(r"\[([^|\]]+)\|([^\]]+)\]|\*|\s+|[^\s\[\*]+")


def download_models() -> None:
    MODELS.mkdir(exist_ok=True)
    for name, url in MODEL_FILES.items():
        target = MODELS / name
        if target.exists():
            continue
        print(f"Downloading {name} (one time only)...")
        tmp = target.with_suffix(".part")

        def progress(blocks: int, block_size: int, total: int) -> None:
            if total > 0:
                done = min(blocks * block_size, total)
                print(f"\r  {done / 1e6:6.1f} / {total / 1e6:.1f} MB", end="", flush=True)

        urllib.request.urlretrieve(url, tmp, progress)
        tmp.rename(target)
        print()


def load_kokoro():
    try:
        from kokoro_onnx import Kokoro
    except ImportError:
        sys.exit("kokoro-onnx is not installed. Run:  pip install -r tools/tts/requirements.txt")
    download_models()
    return Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))


def resolve_voice(kokoro, spec: str):
    """'am_michael' or a blend like 'am_michael:70,am_fenrir:30' (a unique channel voice)."""
    if ":" not in spec and "," not in spec:
        return spec
    parts = []
    for item in spec.split(","):
        name, _, weight = item.strip().partition(":")
        parts.append((name, float(weight or 1)))
    total = sum(w for _, w in parts)
    return sum(kokoro.get_voice_style(name) * (w / total) for name, w in parts)


def parse_say(text: str) -> list[dict]:
    """Split narration into words, honouring *emphasis* and [display|spoken] overrides."""
    words: list[dict] = []
    cur = None
    emph = False
    for m in TOKEN_RE.finditer(text):
        tok = m.group(0)
        if tok.isspace():
            cur = None
            continue
        if tok == "*":
            emph = not emph
            continue
        if m.group(1) is not None:
            display, spoken = m.group(1), m.group(2)
        else:
            display = spoken = tok
        if cur is None:
            cur = {"display": "", "spoken": "", "emph": False}
            words.append(cur)
        cur["display"] += display
        cur["spoken"] += spoken
        cur["emph"] = cur["emph"] or emph
    return words


def split_sentences(words: list[dict]) -> list[list[dict]]:
    sentences, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r"[.!?…][\"')\]]*$", w["spoken"]):
            sentences.append(cur)
            cur = []
    if cur:
        sentences.append(cur)
    return sentences


def word_weight(w: dict) -> float:
    spoken = w["spoken"].lower()
    syllables = max(1, len(re.findall(r"[aeiouy]+", spoken)) + 2 * len(re.findall(r"\d", spoken)))
    weight = syllables * 2 + 0.25 * len(re.sub(r"[^a-z0-9]", "", spoken))
    if re.search(r"[,;:—–-]$", w["spoken"]):
        weight += 2.5  # the voice pauses after commas and dashes
    return weight


def trim_silence(audio: np.ndarray, threshold: float = 0.012, margin: float = 0.03) -> np.ndarray:
    loud = np.where(np.abs(audio) > threshold)[0]
    if len(loud) == 0:
        return audio
    pad = int(margin * SAMPLE_RATE)
    return audio[max(0, loud[0] - pad): loud[-1] + pad]


def envelope(audio: np.ndarray) -> str:
    """Loudness per video frame, quantised to one digit 0-9 (drives mouth movement)."""
    hop = SAMPLE_RATE // FPS
    frames = int(np.ceil(len(audio) / hop))
    rms = np.array([np.sqrt(np.mean(audio[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(frames)])
    voiced = rms[rms > 0.005]
    ref = np.percentile(voiced, 98) if len(voiced) else 1.0
    level = np.clip(rms / ref, 0, 1) ** 0.7
    level[rms < 0.006] = 0
    return "".join(str(int(round(v * 9))) for v in level)


def voice_scene(kokoro, scene: dict, voice: str, speed: float, pause: float) -> tuple[np.ndarray, list[dict]]:
    words = parse_say(scene["say"])
    style = resolve_voice(kokoro, voice)
    chunks, timed, t = [], [], 0.0
    sentences = split_sentences(words)
    for i, sentence in enumerate(sentences):
        text = " ".join(w["spoken"] for w in sentence)
        audio, sr = kokoro.create(text, voice=style, speed=speed, lang="en-us")
        assert sr == SAMPLE_RATE, sr
        audio = trim_silence(np.asarray(audio, dtype=np.float32))
        dur = len(audio) / SAMPLE_RATE
        weights = [word_weight(w) for w in sentence]
        total = sum(weights)
        start = t
        for w, wt in zip(sentence, weights):
            end = start + dur * wt / total
            timed.append({"t": w["display"], "s": round(start, 3), "e": round(end, 3), "em": w["emph"]})
            start = end
        chunks.append(audio)
        t += dur
        if i < len(sentences) - 1:
            gap = pause * (2.5 if sentence[-1]["spoken"].endswith(("...", "…")) else 1.0)
            chunks.append(np.zeros(int(gap * SAMPLE_RATE), dtype=np.float32))
            t += gap
    return np.concatenate(chunks), timed


def write_wav(path: Path, audio: np.ndarray) -> None:
    pcm = (np.clip(audio, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SAMPLE_RATE)
        f.writeframes(pcm.tobytes())


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("episode", nargs="?", help="episode id = file name in episodes/ without .json")
    ap.add_argument("--force", action="store_true", help="ignore the cache and re-voice every scene")
    ap.add_argument("--voices", action="store_true", help="list the available voices and exit")
    args = ap.parse_args()

    if args.voices:
        kokoro = load_kokoro()
        print("\n".join(v for v in kokoro.get_voices() if v[:3] in ("af_", "am_", "bf_", "bm_")))
        return
    if not args.episode:
        ap.error("episode id is required")

    episode = json.loads((ROOT / "episodes" / f"{args.episode}.json").read_text())
    mood = json.loads((ROOT / "config" / "moods.json").read_text())[episode["mood"]]
    ep_voice = episode.get("voice", {})
    out_dir = ROOT / "public" / "voice" / episode["id"]
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "manifest.json"
    old = {}
    if manifest_path.exists() and not args.force:
        old = {s["id"]: s for s in json.loads(manifest_path.read_text())["scenes"]}

    kokoro = None
    scenes = []
    for scene in episode["scenes"]:
        voice = scene.get("voice", ep_voice.get("name", mood["voice"]))
        speed = scene.get("speed", ep_voice.get("speed", mood["speed"]))
        pause = ep_voice.get("pause", mood["pause"])
        key = hashlib.sha1(json.dumps([scene["say"], voice, speed, pause, 1]).encode()).hexdigest()[:12]
        wav = out_dir / f"{scene['id']}.wav"
        cached = old.get(scene["id"])
        if cached and cached["hash"] == key and wav.exists():
            scenes.append(cached)
            print(f"  = {scene['id']:<14} (cached)")
            continue
        kokoro = kokoro or load_kokoro()
        audio, words = voice_scene(kokoro, scene, voice, speed, pause)
        write_wav(wav, audio)
        dur = len(audio) / SAMPLE_RATE
        scenes.append({
            "id": scene["id"],
            "file": f"voice/{episode['id']}/{wav.name}",
            "duration": round(dur, 3),
            "hash": key,
            "words": words,
            "env": envelope(audio),
        })
        print(f"  + {scene['id']:<14} {dur:5.2f}s  {voice} x{speed}")

    manifest = {"episode": episode["id"], "fps": FPS, "sampleRate": SAMPLE_RATE, "scenes": scenes}
    manifest_path.write_text(json.dumps(manifest, indent=1))
    total = sum(s["duration"] for s in scenes)
    print(f"Voice-over ready: {len(scenes)} scenes, {total:.1f}s of speech -> {manifest_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
