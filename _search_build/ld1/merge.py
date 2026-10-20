# מיזוג לקוטי דיבורים ח"א לאינדקס הקיים באתר
# וקטורים ישנים נלקחים כמו שהם מהקובץ הקיים; חדשים מחושבים ב-Cloudflare (embed.py, מטמון cache_ld1.json)
import json, struct, hashlib, os, sys, numpy as np
R = '/home/claude/sichotmeturgamot.github.io/'
OUT = sys.argv[1] if len(sys.argv) > 1 else R
def key(t): return hashlib.sha1(t.encode()).hexdigest()

old = json.load(open(R + 'search-meta.json')); oldD = json.load(open(R + '_search_build/descs.json'))
oldC = [c for c in old['chunks'] if not c['id'].startswith('LD1#')]   # בנייה חוזרת — בלי הישנים של LD1
assert len(oldC) == len(oldD), (len(oldC), len(oldD))
new = json.load(open('ld1_meta.json'))
newD = []
for b in range(8): newD += [d['d'] for d in json.load(open('desc_%d.json' % b))]
assert len(newD) == len(new['chunks'])

# וקטורים ישנים מהקובץ באתר
buf = open(R + 'search-vectors.bin', 'rb').read()
N0, dim, np0, d1000 = struct.unpack('<IIII', buf[:16])
assert np0 == len(oldC)
par0 = np.frombuffer(buf, np.uint16, N0, 16)
V0 = np.frombuffer(buf, np.int8, offset=16 + 2 * N0).reshape(N0, dim)
oldS = old['smalls'][:N0 - np0]

cache = json.load(open('cache_ld1.json'))
def q(texts):
    V = np.array([cache[key(t)] for t in texts], dtype=np.float32)
    return np.clip(np.rint(V * 400), -127, 127).astype(np.int8)
Pn = q([newD[i] + '\n' + c['x'] for i, c in enumerate(new['chunks'])])
Sn = q([s['x'] for s in new['smalls']])

C = oldC + new['chunks']; D = oldD + newD; np_ = len(C)
S = oldS + [{'p': s['p'] + np0, 'x': s['x']} for s in new['smalls']]
V = np.concatenate([V0[:np0], Pn, V0[np0:], Sn])
parent = np.array(list(range(np_)) + [s['p'] for s in S], dtype=np.uint16)
N = len(V)
with open(OUT + 'search-vectors.bin', 'wb') as f:
    f.write(struct.pack('<IIII', N, dim, np_, d1000)); f.write(parent.tobytes()); f.write(V.tobytes())
strs = [c['t'] + ' | ' + D[i] for i, c in enumerate(C)] + [s['x'] for s in S] + [c['x'][:700] for c in C]
bs = [s.encode() for s in strs]; offs = [0]
for b in bs: offs.append(offs[-1] + len(b))
with open(OUT + 'search-texts.bin', 'wb') as f:
    f.write(struct.pack('<I', len(bs))); f.write(struct.pack('<%dI' % len(offs), *offs)); f.write(b''.join(bs))
json.dump({'chunks': C, 'smalls': S}, open(OUT + 'search-meta.json', 'w'), ensure_ascii=False, separators=(',', ':'))
json.dump(D, open(OUT + '_search_build/descs.json', 'w'), ensure_ascii=False, indent=0)
print('parents', np_, 'smalls', len(S), 'N', N)
