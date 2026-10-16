#!/usr/bin/env python3
"""Batch synthesis with Chatterbox TTS (Resemble AI, MIT licence). Called by voice.py; runs in its own env.

    .venv-chatterbox/bin/python tools/tts/chatterbox_batch.py jobs.json

jobs.json: [{"text": "...", "speed": 1.0, "ref": "path/to/reference.wav" | null, "out": "path.wav"}, ...]
Writes 24 kHz mono 16-bit WAVs. "speed" != 1 is applied with a pitch-preserving time stretch.
Outputs carry Resemble's imperceptible Perth watermark (responsible-AI marking; inaudible).
"""
import json
import sys
import wave

import numpy as np

EXAGGERATION = 0.35  # lower = calmer, less theatrical delivery
CFG_WEIGHT = 0.4  # lower = slower, more deliberate pacing
TEMPERATURE = 0.7


def main() -> None:
    import torch
    from chatterbox.tts import ChatterboxTTS

    torch.set_num_threads(max(1, torch.get_num_threads()))
    jobs = json.load(open(sys.argv[1]))
    device = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
    model = ChatterboxTTS.from_pretrained(device=device)
    assert model.sr == 24000, model.sr
    for i, job in enumerate(jobs):
        wav = model.generate(job["text"], audio_prompt_path=job.get("ref"), exaggeration=EXAGGERATION, cfg_weight=CFG_WEIGHT, temperature=TEMPERATURE)
        audio = wav.squeeze(0).cpu().numpy().astype(np.float32)
        speed = float(job.get("speed") or 1.0)
        if abs(speed - 1.0) > 0.01:
            import librosa

            audio = librosa.effects.time_stretch(audio, rate=speed)
        pcm = (np.clip(audio, -1, 1) * 32767).astype("<i2")
        with wave.open(job["out"], "wb") as f:
            f.setnchannels(1)
            f.setsampwidth(2)
            f.setframerate(24000)
            f.writeframes(pcm.tobytes())
        print(f"    chatterbox {i + 1}/{len(jobs)}: {len(audio) / 24000:.1f}s", flush=True)


if __name__ == "__main__":
    main()
