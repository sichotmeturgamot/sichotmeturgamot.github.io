# הוספת ספר/חוברת לאינדקס הקיים באתר
# שימוש: python3 add_book.py <book_meta.json> <descs.json> <cache.json> <PREFIX>
#   book_meta.json: {"chunks":[{id,f,u,t,x}], "smalls":[{p,x}]}  (p = מספר קטע בתוך הספר)
#   descs.json: רשימת תיאורים (מחרוזות או {"i","d"}) לפי סדר הקטעים
#   cache.json: מטמון וקטורים (embed) — מפתח sha1 של הטקסט
#   PREFIX: קידומת המזהים (למשל RSH8#) — קטעים קודמים עם אותה קידומת יוחלפו
import json, struct, hashlib, sys, subprocess, numpy as np, os
R = os.path.dirname(os.path.abspath(__file__)) + '/../'
book, descs, cachef, prefix = sys.argv[1:5]
key = lambda t: hashlib.sha1(t.encode()).hexdigest()
old = json.load(open(R + 'search-meta.json')); oldD = json.load(open(R + '_search_build/descs.json'))
buf = open(R + 'search-vectors.bin', 'rb').read()
N0, dim, np0, d1000 = struct.unpack('<IIII', buf[:16])
V0 = np.frombuffer(buf, np.int8, offset=16 + 2 * N0).reshape(N0, dim)
keep = [i for i, c in enumerate(old['chunks']) if not c['id'].startswith(prefix)]
remap = {o: n for n, o in enumerate(keep)}
oldC = [old['chunks'][i] for i in keep]; oldDk = [oldD[i] for i in keep]
oldS = [(j, s) for j, s in enumerate(old['smalls']) if s['p'] in remap]
B = json.load(open(book)); bd = json.load(open(descs)); bd = [d['d'] if isinstance(d, dict) else d for d in bd]
assert len(bd) == len(B['chunks'])
cache = json.load(open(cachef))
q = lambda texts: np.clip(np.rint(np.array([cache[key(t)] for t in texts], np.float32) * 400), -127, 127).astype(np.int8)
Pn = q([bd[i] + '\n' + c['x'] for i, c in enumerate(B['chunks'])]); Sn = q([s['x'] for s in B['smalls']])
np1 = len(oldC)
C = oldC + B['chunks']; D = oldDk + bd
S = [{'p': remap[s['p']], 'x': s['x']} for _, s in oldS] + [{'p': s['p'] + np1, 'x': s['x']} for s in B['smalls']]
V = np.concatenate([V0[keep], Pn, V0[[np0 + j for j, _ in oldS]], Sn])
parent = np.array(list(range(len(C))) + [s['p'] for s in S], dtype=np.uint16)
with open(R + 'search-vectors.bin', 'wb') as f:
    f.write(struct.pack('<IIII', len(V), dim, len(C), d1000)); f.write(parent.tobytes()); f.write(V.tobytes())
json.dump({'chunks': C, 'smalls': S}, open(R + 'search-meta.json', 'w'), ensure_ascii=False, separators=(',', ':'))
json.dump(D, open(R + '_search_build/descs.json', 'w'), ensure_ascii=False, indent=0)
subprocess.run(['python3', R + '_search_build/build_texts.py'], check=True)
subprocess.run(['node', R + '_search_build/build_kw.mjs'], cwd=R, check=True)
subprocess.run(['python3', R + '_search_build/build_bits.py'], check=True)   # search-bits.bin לשלב הסינון בשרת
print('parents', len(C), 'smalls', len(S), 'vectors', len(V))
