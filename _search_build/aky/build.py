# אגרות ביידיש (ניסוי) — מוצגות באידיש, עם כפתור "תרגם"
import os, re, json, sys
sys.path.insert(0, '/home/claude/ak1')
D = '/home/claude/aky/pages/'
OFF = {'ak1': 39, 'ak2': 66}; VOL = {'ak1': 'ח״א', 'ak2': 'ח״ב'}
src = open('/home/claude/ak1/build.py').read()
heb = {}; exec(src[src.index('def heb'):src.index('items = []')], heb); heb = heb['heb']
items, cur = [], None
for f in sorted(os.listdir(D), key=lambda f: (f[:3], int(f[4:7]))):
    vol, pg = f[:3], int(f[4:7])
    for l in open(D + f, encoding='utf-8').read().split('\n'):
        l = l.strip()
        if not l: continue
        if l.startswith('##'):
            cur = {'vol': vol, 'pg': pg, 'h': 'אגרת ' + l.lstrip('#').strip(), 'lines': []}; items.append(cur); continue
        cur['lines'].append((pg, l))
def sentences(x): return [s for s in re.split(r'(?<=[.:?!])\s+', x) if s]
meta, smalls = [], []
for it in items:
    out, chunk, cpg = [], [], None
    for pg, l in it['lines']:
        n = sum(len(x.split()) for x in chunk)
        if chunk and n + len(l.split()) > 180 and n > 80:
            out.append((cpg, '\n'.join(chunk))); chunk, cpg = [], None
        if cpg is None: cpg = pg
        chunk.append(l)
    if chunk: out.append((cpg, '\n'.join(chunk)))
    if len(out) > 1 and len(out[-1][1].split()) < 30:
        p, x = out.pop(); out[-1] = (out[-1][0], out[-1][1] + '\n' + x)
    for pg, x in out:
        i = len(meta)
        meta.append({'id': 'AKY#%d' % i, 'f': '', 'u': '', 't': 'אגרות קודש אדמו״ר מוהריי״צ ' + VOL[it['vol']] + ' — ' + it['h'] + ' (עמ׳ ' + heb(pg - OFF[it['vol']]) + ') · אידיש', 'x': x})
        if len(x.split()) > 90:
            c = []
            for s in sentences(x.replace('\n', ' ')):
                c.append(s)
                if len(' '.join(c).split()) >= 55: smalls.append({'p': i, 'x': ' '.join(c)}); c = []
            if c:
                if len(' '.join(c).split()) < 25 and smalls and smalls[-1]['p'] == i: smalls[-1]['x'] += ' ' + ' '.join(c)
                else: smalls.append({'p': i, 'x': ' '.join(c)})
json.dump({'chunks': meta, 'smalls': smalls}, open('/home/claude/aky/zich_meta.json', 'w'), ensure_ascii=False, indent=0)
print(len(items), 'letters', len(meta), 'chunks', len(smalls), 'smalls')
for c in meta[:3]: print(c['t'])
