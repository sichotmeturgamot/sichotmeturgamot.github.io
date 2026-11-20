# בניית search-tx.bin ו-search-groups.bin מתוך search-meta.json + descs.json
# search-tx.bin: השרת לא טוען את כל הטקסטים לזיכרון אלא קורא מ-R2 רק את הקטעים שצריך (קריאה אחת לכל קטע).
#   מבנה: <II np, ns> · uint32[np+1] היסטים (מתחילת אזור הנתונים) · נתונים.
#   בלוק לכל קטע p (UTF-8, מופרד ב-\x1e): "שם | תיאור", "f\tu\tt", טקסט מלא, ואחריהם טקסטי החתיכות של הקטע לפי סדרן בווקטורים.
# search-groups.bin: <I np> · np בתים קוד מקור (s/l/r/z כמו בשרת) · np בתים 1 = קטע ביידיש.
import json, struct, os
R = os.path.dirname(os.path.abspath(__file__)) + '/../'
m = json.load(open(R + 'search-meta.json')); D = json.load(open(R + '_search_build/descs.json'))
C, S = m['chunks'], m['smalls']; assert len(C) == len(D)
np_, ns = len(C), len(S)
kids = [[] for _ in range(np_)]
for s in S: kids[s['p']].append(s['x'])
SEP = '\x1e'
blocks = []
for i, c in enumerate(C):
    parts = [c['t'] + ' | ' + D[i], c.get('f', '') + '\t' + c.get('u', '') + '\t' + c['t'], c['x']] + kids[i]
    assert not any(SEP in x for x in parts), i
    blocks.append(SEP.join(parts).encode())
offs = [0]
for b in blocks: offs.append(offs[-1] + len(b))
with open(R + 'search-tx.bin', 'wb') as f:
    f.write(struct.pack('<II', np_, ns)); f.write(struct.pack('<%dI' % len(offs), *offs)); f.write(b''.join(blocks))
g = bytearray(np_); y = bytearray(np_)
for i, c in enumerate(C):
    f, u, t = c.get('f', ''), c.get('u', ''), c['t']
    g[i] = 122 if t.startswith('ספר הזכרונות') else 115 if (f or t.startswith('ספר השיחות')) else 114 if t.startswith('אגרות קודש') else 108 if 'hebrewbooks' in u else 114
    y[i] = 1 if t.endswith(' · אידיש') else 0
with open(R + 'search-groups.bin', 'wb') as f:
    f.write(struct.pack('<I', np_)); f.write(bytes(g)); f.write(bytes(y))
print('tx', np_, ns, os.path.getsize(R + 'search-tx.bin'), 'groups', os.path.getsize(R + 'search-groups.bin'))
