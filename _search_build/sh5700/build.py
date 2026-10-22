# ספר השיחות ה'ש"ת–ה'תש"א בלשון הקודש (תרגום גליצנשטיין) — מהעמודים שהועתקו מהסריקה לקטעים לחיפוש
import os, re, json
D = '/home/claude/sh1/pages/'
def heb(n):
    out = ''
    for v, ch in [(400,'ת'),(300,'ש'),(200,'ר'),(100,'ק'),(90,'צ'),(80,'פ'),(70,'ע'),(60,'ס'),(50,'נ'),(40,'מ'),(30,'ל'),(20,'כ'),(10,'י'),(9,'ט'),(8,'ח'),(7,'ז'),(6,'ו'),(5,'ה'),(4,'ד'),(3,'ג'),(2,'ב'),(1,'א')]:
        while n >= v: out += ch; n -= v
    out = out.replace('יה', 'טו').replace('יו', 'טז')
    return out[:-1] + '״' + out[-1] if len(out) > 1 else out + '׳'
def book(pg): return ('ה׳ש״ת', pg - 7) if pg < 200 else ('ה׳תש״א', pg - 214)
paras = []   # (pg, book, heading, text)
cur = {'ה׳ש״ת': 'לפני י׳ טבת', 'ה׳תש״א': 'ערב ראש השנה, תש״א'}
for f in sorted(os.listdir(D)):
    pg = int(f[:3]); b, bp = book(pg)
    if pg in (192, 193) or pg >= 363: continue
    for l in open(D + f, encoding='utf-8').read().split('\n'):
        l = l.strip()
        if not l: continue
        if l.startswith('##'):
            cur[b] = l.lstrip('#').strip(); paras.append([pg, b, cur[b], None]); continue
        paras.append([pg, b, cur[b], l])
SEC = re.compile(r'^[א-ת]{1,2}\. ')
# קטעים: לפי שיחה; פסקאות מצטרפות עד ~150 מילה, סעיף חדש (א. ב.) או שיחה חדשה — קטע חדש
chunks = []
for pg, b, h, x in paras:
    if x is None or x == '* * *':
        if chunks: chunks[-1]['close'] = True
        continue
    c = chunks[-1] if chunks else None
    new = (c is None or c['b'] != b or c['h'] != h or c.get('close') or SEC.match(x) and len(c['x'].split()) > 40
           or len(c['x'].split()) + len(x.split()) > 190 and len(c['x'].split()) > 90)
    if new: chunks.append({'pg': pg, 'b': b, 'h': h, 'x': x})
    else: c['x'] += '\n' + x
# קטע קטן מאוד — מצטרף לקודם באותה שיחה
out = []
for c in chunks:
    if out and out[-1]['h'] == c['h'] and out[-1]['b'] == c['b'] and len(c['x'].split()) < 30: out[-1]['x'] += '\n' + c['x']
    else: out.append(c)
def sentences(x): return [s for s in re.split(r'(?<=[.:?!])\s+', x) if s]
meta, smalls = [], []
for i, c in enumerate(out):
    bp = c['pg'] - (7 if c['b'] == 'ה׳ש״ת' else 214)
    t = 'ספר השיחות ' + c['b'] + ' (לה״ק) — ' + c['h'] + ' (עמ׳ ' + heb(bp) + ')'
    meta.append({'id': 'SH5700#%d' % i, 'f': '', 'u': '', 't': t, 'x': c['x']})
    if len(c['x'].split()) > 90:
        cur = []
        for s in sentences(c['x'].replace('\n', ' ')):
            cur.append(s)
            if len(' '.join(cur).split()) >= 55: smalls.append({'p': i, 'x': ' '.join(cur)}); cur = []
        if cur:
            if len(' '.join(cur).split()) < 25 and smalls and smalls[-1]['p'] == i: smalls[-1]['x'] += ' ' + ' '.join(cur)
            else: smalls.append({'p': i, 'x': ' '.join(cur)})
json.dump({'chunks': meta, 'smalls': smalls}, open('/home/claude/sh1/sh_meta.json', 'w'), ensure_ascii=False, indent=0)
w = [len(c['x'].split()) for c in meta]
print(len(meta), 'chunks', len(smalls), 'smalls; words', sum(w), 'median', sorted(w)[len(w)//2], 'max', max(w))
import collections; print(len(collections.Counter(c['t'].split(' (עמ')[0] for c in meta)), 'sichos')
