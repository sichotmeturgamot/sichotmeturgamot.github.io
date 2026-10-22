# ספר הזכרונות ח"א — קטעים לחיפוש מתוך העמודים המוגהים (pages_fixed, ואם חסר — pages)
import re, json, os
S = json.load(open('struct.json', encoding='utf-8')); CH, OFF, LAST = S['CH'], S['OFF'], S['LAST']
def chap(pg): return max(i for i, c in enumerate(CH) if c[0] <= pg)
def heb(l): return l + '׳' if len(l) == 1 else l[:-1] + '״' + l[-1]
def ctitle(ci):
    a, l, n = CH[ci]
    return 'ספר הזכרונות ח״א — ' + ('פרק ' + heb(l) + ': ' + n if l else n)
lines, missing = [], []
for pg in range(7, LAST + 1):
    fx = 'pages_fixed/%03d.txt' % pg
    if not os.path.exists(fx): missing.append(pg); fx = 'pages/%03d.txt' % pg
    for l in open(fx, encoding='utf-8').read().split('\n'):
        if l.strip(): lines.append((pg, chap(pg), l.strip()))
# טקסט רציף לכל פרק, עם סימון עמוד לכל מילה
def sentences(x): return [s for s in re.split(r'(?<=[.:?!״])\s+(?=\S)', x) if s]
chunks = []
for ci in range(len(CH)):
    L = [(pg, s) for pg, c, s in lines if c == ci]
    if not L: continue
    # חיבור שורות: מילה שנחתכה במקף בסוף שורה — לא קיים בספר הזה; פשוט רווח
    sents, cur_pg = [], None
    buf = ''
    starts = []
    for pg, s in L:
        if not buf: starts.append(pg)
        buf = (buf + ' ' + s).strip()
    # עמוד לכל משפט: לפי מיקום תווים
    pos, pgpos = 0, []
    for pg, s in L: pgpos.append((pos, pg)); pos += len(s) + 1
    def pg_at(i): return max((p for p in pgpos if p[0] <= i), key=lambda p: p[0])[1]
    text = ' '.join(s for _, s in L)
    i0, cur, cur_start = 0, [], 0
    idx = 0
    for s in sentences(text):
        k = text.find(s, idx); idx = k + len(s)
        if not cur: cur_start = k
        cur.append(s)
        if len(' '.join(cur).split()) >= 150:
            chunks.append({'ci': ci, 'pg': pg_at(cur_start), 'x': ' '.join(cur)}); cur = []
    if cur:
        tail = ' '.join(cur)
        if chunks and chunks[-1]['ci'] == ci and len(tail.split()) < 40: chunks[-1]['x'] += ' ' + tail
        else: chunks.append({'ci': ci, 'pg': pg_at(cur_start), 'x': tail})
meta, smalls = [], []
for i, c in enumerate(chunks):
    t = ctitle(c['ci']) + ' (עמ׳ ' + str(c['pg'] - OFF) + ')'
    meta.append({'id': 'ZICH1#%d' % i, 'f': '', 't': t, 'x': c['x'], 'u': ''})
    if len(c['x'].split()) > 90:
        cur = []
        for s in sentences(c['x']):
            cur.append(s)
            if len(' '.join(cur).split()) >= 55: smalls.append({'p': i, 'x': ' '.join(cur)}); cur = []
        if cur:
            if len(' '.join(cur).split()) < 25 and smalls and smalls[-1]['p'] == i: smalls[-1]['x'] += ' ' + ' '.join(cur)
            else: smalls.append({'p': i, 'x': ' '.join(cur)})
json.dump({'chunks': meta, 'smalls': smalls}, open('zich_meta.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
wc = [len(c['x'].split()) for c in meta]
print(len(meta), 'chunks', len(smalls), 'smalls; words', sum(wc), 'median', sorted(wc)[len(wc)//2], 'max', max(wc), 'min', min(wc), '| missing fixed:', len(missing))
