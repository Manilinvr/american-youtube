"""Print scene start frames and suggested QC frames for an episode (mirrors src/timing.ts)."""
import json, math, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
eid = sys.argv[1]
e = json.loads((ROOT / 'episodes' / f'{eid}.json').read_text())
m = {s['id']: s for s in json.loads((ROOT / 'public/voice' / eid / 'manifest.json').read_text())['scenes']}
tones = json.loads((ROOT / 'config/tones.json').read_text())
TF = {'fade': 24, 'zoom': 24, 'black': 40, 'cut': 0}
t = 0; prev_end = 0; out = []
n = len(e['scenes'])
for i, s in enumerate(e['scenes']):
    tin = 'cut' if i == 0 else s.get('transition', 'fade')
    tout = 'black' if i == n - 1 else e['scenes'][i + 1].get('transition', 'fade')
    fin = TF[tin]; fout = 30 if i == n - 1 else TF[tout]
    lead = 0 if i == 0 else round(fin * (0.85 if tin == 'black' else 0.6)) + 4
    tone = tones[s.get('tone', e['tone'])]
    out_room = fout * (1 if (i == n - 1 or tout == 'black') else 0.75) / 30 + 0.15
    hold = max(s.get('hold', 0.5 if i == n - 1 else tone['pause']), out_room)
    d = math.ceil(max(1.2, lead / 30 + m[s['id']]['duration'] + hold) * 30)
    frm = 0 if i == 0 else prev_end - fin
    prev_end = frm + d
    out.append((s['id'], frm, d, lead))
for sid, frm, d, lead in out:
    print(f"{sid:10s} {frm:5d} +{d:4d}  ({frm/30:5.1f}s)")
print('total', prev_end, f'{prev_end/30:.1f}s')
qc = [frm + int(d * k) for sid, frm, d, lead in out for k in (0.45, 0.9)]
print('QC', ' '.join(map(str, qc)))
