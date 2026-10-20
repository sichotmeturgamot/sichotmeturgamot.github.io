# בניית search-texts.bin מתוך search-meta.json + descs.json (הווקטורים לא משתנים)
# מבנה: [0,np) "שם | תיאור" · [np,np+ns) חתיכות קטנות · [np+ns,2np+ns) טקסט מלא של כל קטע · [2np+ns,3np+ns) "f\tu\tt"
import json, struct, os
R = os.path.dirname(os.path.abspath(__file__)) + '/../'
m = json.load(open(R + 'search-meta.json')); D = json.load(open(R + '_search_build/descs.json'))
C, S = m['chunks'], m['smalls']; assert len(C) == len(D)
strs = [c['t'] + ' | ' + D[i] for i, c in enumerate(C)] + [s['x'] for s in S] + [c['x'] for c in C] + \
       [c.get('f', '') + '\t' + c.get('u', '') + '\t' + c['t'] for c in C]
bs = [s.encode() for s in strs]; offs = [0]
for b in bs: offs.append(offs[-1] + len(b))
with open(R + 'search-texts.bin', 'wb') as f:
    f.write(struct.pack('<I', len(bs))); f.write(struct.pack('<%dI' % len(offs), *offs)); f.write(b''.join(bs))
print('strings', len(bs), 'bytes', offs[-1])
