# אגרות קודש אדמו"ר מוהריי"צ ח"א — רק הטקסט העברי (pages/NNN.txt) → קטעים לחיפוש
import os, re, json
D = '/home/claude/ak2/pages/'
OFF = 66   # עמוד בספר = עמוד PDF פחות 66
def heb(n):
    out = ''
    for v, ch in [(400,'ת'),(300,'ש'),(200,'ר'),(100,'ק'),(90,'צ'),(80,'פ'),(70,'ע'),(60,'ס'),(50,'נ'),(40,'מ'),(30,'ל'),(20,'כ'),(10,'י'),(9,'ט'),(8,'ח'),(7,'ז'),(6,'ו'),(5,'ה'),(4,'ד'),(3,'ג'),(2,'ב'),(1,'א')]:
        while n >= v: out += ch; n -= v
    out = out.replace('יה', 'טו').replace('יו', 'טז')
    return out[:-1] + '״' + out[-1] if len(out) > 1 else out + '׳'
items = []   # {'pg','h','lines'}
cur = None
for f in sorted(os.listdir(D)):
    pg = int(f[:3])
    for l in open(D + f, encoding='utf-8').read().replace('"', '״').replace("'", '׳').split('\n'):
        l = l.strip()
        if not l: continue
        if l.startswith('##'):
            cur = {'pg': pg, 'h': 'אגרת ' + l.lstrip('#').strip(), 'lines': []}; items.append(cur); continue
        if cur is None: cur = {'pg': pg, 'h': 'אגרת שמב', 'lines': []}; items.append(cur)
        if l == '[יידיש]': continue
        cur['lines'].append((pg, l))
def sentences(x): return [s for s in re.split(r'(?<=[.:?!])\s+', x) if s]
meta, smalls = [], []
for it in items:
    # קטעים של עד ~170 מילה בתוך כל אגרת
    chunk, cpg = [], None
    def flush():
        if chunk: out.append((cpg, '\n'.join(chunk)))
    out = []
    for pg, l in it['lines']:
        n = sum(len(x.split()) for x in chunk)
        if chunk and n + len(l.split()) > 180 and n > 80:
            flush(); chunk, cpg = [], None
        if cpg is None: cpg = pg
        chunk.append(l)
    flush()
    if len(out) > 1 and len(out[-1][1].split()) < 30:
        p, x = out.pop(); out[-1] = (out[-1][0], out[-1][1] + '\n' + x)
    for pg, x in out:
        if len(x.split()) < 4: continue
        i = len(meta)
        meta.append({'id': 'AK2#%d' % i, 'f': '', 'u': '', 't': 'אגרות קודש אדמו״ר מוהריי״צ ח״ב — ' + it['h'] + ' (עמ׳ ' + heb(pg - OFF) + ')', 'x': x})
        if len(x.split()) > 90:
            c = []
            for s in sentences(x.replace('\n', ' ')):
                c.append(s)
                if len(' '.join(c).split()) >= 55: smalls.append({'p': i, 'x': ' '.join(c)}); c = []
            if c:
                if len(' '.join(c).split()) < 25 and smalls and smalls[-1]['p'] == i: smalls[-1]['x'] += ' ' + ' '.join(c)
                else: smalls.append({'p': i, 'x': ' '.join(c)})
json.dump({'chunks': meta, 'smalls': smalls}, open('/home/claude/ak2/zich_meta.json', 'w'), ensure_ascii=False, indent=0)
w = [len(c['x'].split()) for c in meta]
print(len(items), 'letters', len(meta), 'chunks', len(smalls), 'smalls; words', sum(w), 'median', sorted(w)[len(w)//2], 'max', max(w))
