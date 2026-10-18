import json
from faster_whisper import WhisperModel
m=WhisperModel("small.en",device="cpu",compute_type="int8")
import numpy as np
audio=np.fromfile("audio.f32",dtype=np.float32)
segs,info=m.transcribe(audio,word_timestamps=True,language="en",beam_size=1,vad_filter=False)
W=[]
for s in segs:
    for w in s.words: W.append([w.word.strip(),round(w.start,2),round(w.end,2)])
json.dump(W,open("words.json","w"))
print(len(W), W[:5], W[-3:])
