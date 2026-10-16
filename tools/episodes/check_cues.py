"""Check that every cue word in an episode (events, camera keys, sfx) matches a spoken word."""
import json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
norm = lambda s: re.sub(r'[^a-z0-9%]', '', s.lower())
bad = 0
for eid in sys.argv[1:]:
    e = json.loads((ROOT / 'episodes' / f'{eid}.json').read_text())
    m = {s['id']: s for s in json.loads((ROOT / 'public/voice' / eid / 'manifest.json').read_text())['scenes']}
    for s in e['scenes']:
        words = [norm(w['t']) for w in m[s['id']]['words']]
        v = s['visual']
        cues = list((v.get('events') or {}).values()) + [k.get('at') for k in v.get('camera', [])] + [k.get('at') for k in v.get('sfx', [])]
        for c in cues:
            if not isinstance(c, str):
                continue
            w, _, nth = c.partition('#')
            hits = [x for x in words if x.startswith(norm(w))]
            if len(hits) < (int(nth) if nth else 1):
                bad += 1
                print(f'{eid}/{s["id"]}: cue "{c}" not found in: {" ".join(words)}')
print('cue problems:', bad)
