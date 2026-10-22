# ניקוי שכבת ה-OCR של לקוטי דיבורים ח"א (HebrewBooks 39163) וחלוקה לקטעים לחיפוש
import re, json, sys, collections
SRC = '/home/claude/ld5/ld5.txt'
HB = 'https://hebrewbooks.org/pdfpager.aspx?req=39162&pgnum={}'
# (עמוד PDF ראשון, אחרון, שם הליקוט)
PARTS = [
    (12, 29, 'שמחת תורה תרצ״א'),
    (31, 49, 'י״ט כסלו תרצ״א'),
    (51, 62, 'פורים תרצ״א'),
    (64, 73, 'ראקשיק, אדר תרצ״א'),
    (75, 94, 'י״ב תמוז תרצ״א'),
    (96, 123, 'י״ט כסלו תרצ״ב'),
    (125, 128, 'דברי שלום — כינוס הרבנים בריגא, כ׳ אדר ב׳ תרצ״ב'),
    (130, 144, 'הביקור בגלובאקע, סיון–תמוז תרצ״ד'),
    (146, 152, 'שמיני עצרת תרצ״ג'),
    (154, 177, 'יום ב׳ דחג השבועות תרצ״ג'),
    (179, 182, 'לנשי ישראל — ריגא, אדר תרצ״ד'),
    (184, 185, 'למדריכי מסיבות שבת, י״ט אדר תש״ב'),
    (187, 212, 'מאמר לפתיחת החגיגה דתומכי תמימים, ער״ח תמוז תש״ב'),
    (214, 228, 'יובל שלש השנים של מרכז הישיבות, ז׳ אדר ב׳ תש״ג'),
    (230, 232, 'אשרי האיש — י״ט כסלו תש״ד'),
    (234, 242, 'החגיגה השנתית של מרכז הישיבות, פסח שני תש״ד'),
    (244, 248, 'ועידת מרכז הישיבות, ב׳ אדר תש״ה'),
    (250, 251, 'לקבוצת עסקנים של מרכז הישיבות, תש״י'),
    (253, 273, 'מכתב — חשון תרפ״ח'),
    (275, 313, 'יומן — תרפ״ז'),
    (315, 330, 'הוספות לרשימת המאסר'),
    (332, 384, 'מכתבי הרה״ח ר׳ אלי׳ חיים אלטהויז על המאסר והגאולה'),
    (387, 433, 'יסוריו של הרבי מליובאוויטש ברוסיה הסובייטית'),
]
SKIP_UNTIL = {}
raw = re.sub(r'[‪-‮]', '', open(SRC, encoding='utf-8').read())
P = raw.split('\f')

# מספרי עמודים בספר: לפי המספר בראש העמוד, וההפרש ממולא לעמודים בלי מספר
offs = []
for i, p in enumerate(P):
    L = [l.strip() for l in p.split('\n') if l.strip()]
    top = [m.group(1) for x in L[:3] for m in [re.search(r'(?<!\d)(1[0-4]\d\d)(?!\d)', x)] if m]
    offs.append(int(top[0]) - (i + 1) if top else None)
for i in range(len(offs) - 2, -1, -1):
    if offs[i] is None: offs[i] = offs[i + 1]
def bookpage(pdf): return pdf + (offs[pdf - 1] if offs[pdf - 1] is not None else 0)

HEADER = re.compile(r'^(ליקוט [א-ת]{1,2}\.?\)?.*|ליקוט|[א-ת]{1,2}\.|לקו[טש]י דיבורים|\)?חלק (ראשון|שני)\(?|\d{1,4}|.*\b1[0-4]\d\d\b.*)$')
def fixline(s):
    s = re.sub(r'(?<!\S)((?:[א-ת] ){2,}[א-ת])(?!\S)', lambda m: m.group(1).replace(' ', ''), s)  # אותיות מרווחות
    s = re.sub(r'\s+([.,:;!?])(?=\S)', r'\1 ', s)                     # רווח לפני סימן פיסוק
    s = re.sub(r'\s+([.,:;!?])\s*$', r'\1', s)
    s = re.sub(r'\s{2,}', ' ', s).strip()
    return s

lines = []   # (pdf page, part index, text)
for pi, (a, b, title) in enumerate(PARTS):
    for pg in range(a, b + 1):
        L = P[pg - 1].split('\n')
        if pg in SKIP_UNTIL:
            k0 = next(k for k, l in enumerate(L) if SKIP_UNTIL[pg] in l); L = L[k0:]
        body = []
        for k, l in enumerate(L):
            s = l.strip()
            if not s: continue
            if re.match(r'^\(?\d{1,3}\S', s) and l.startswith(' ('): continue   # הערת שוליים
            if l.startswith(' (') and re.match(r'^\(\d', s): continue
            if k < 6 and HEADER.match(s): continue
            if pg == a and k < 8 and (s in ('שמיני עצרת ושמחת תורה', 'חג הפסח', 'חג השבועות', 'אחרון של פסח') or re.fullmatch(r'[תר][א-ת״׳\' ]{1,6}', s) or 'כסלו' in s and len(s) < 26 and not re.match(r'^[א-ת] \.', s)):
                continue
            if re.fullmatch(r'[\d\W״׳]{1,4}|[א-ת]{1}|Ill', s): continue        # ספרות הערה ורעש
            body.append(s)
        for s in body: lines.append((pg, pi, fixline(s)))

# תיקון אותיות שה-OCR מחליף (ו/ן סופית, ט/ס, ס/ט, ח/ה): רק כשהצורה המתוקנת נפוצה הרבה יותר
#   (שכיחות מתוך הספר עצמו ומתוך כל התרגומים שכבר בחיפוש באתר)
SITE = json.load(open('/home/claude/sichotmeturgamot.github.io/search-meta.json', encoding='utf-8'))
corpus = ' '.join(l for _, _, l in lines) + ' ' + ' '.join(c['x'] for c in SITE['chunks'])
words = collections.Counter(re.findall(r'[א-ת]+', corpus))
site_words = collections.Counter(re.findall(r'[א-ת]+', ' '.join(c['x'] for c in SITE['chunks'])))
SWAPS = [('ט', 'ס'), ('ס', 'ט'), ('ה', 'ח'), ('ח', 'ה'), ('ן', 'ו')]
def best(w):
    if w in ('תחלה', 'חמים', 'המחר', 'שהורה') or len(w) < 4 or site_words[w] > 0: return w   # מילה תקינה שמופיעה בתרגומים — לא נוגעים
    cands = []
    if w.endswith('ו'): cands.append(w[:-1] + 'ן')
    for a, b in SWAPS:
        for k, ch in enumerate(w):
            if ch == a and not (a == 'ן' and k == len(w) - 1): cands.append(w[:k] + b + w[k + 1:])
    alt = max(cands, key=lambda x: words[x], default=None)
    if alt and words[alt] >= 4 and words[alt] >= 5 * max(words[w], 1): return alt
    return w
EXTRA = {'וכר': 'וכו׳', 'מכו': 'מכן', 'כלןמר': 'כלומר', 'תוצ״ד': 'תרצ״ד', 'תוצ״ג': 'תרצ״ג', 'כי׳ק': 'כ״ק'}
CHANGED = collections.Counter()
def fixwords(s):
    def f(m):
        w = m.group(0)
        if w in EXTRA: r = EXTRA[w]
        elif m.end() < len(s) and s[m.end()] in '׳״\'"': r = w        # ראשי תיבות / קיצור
        else: r = best(w)
        if r != w: CHANGED[(w, r)] += 1
        return r
    return re.sub(r'[א-ת][א-ת״׳]*[א-ת]|[א-ת]', f, s)
lines = [(pg, pi, re.sub(r'ן(?=[א-ת])', 'ו', fixwords(s))) for pg, pi, s in lines]   # ן באמצע מילה = ו

# שלב ההגהה: כל עמוד נשמר לקובץ; אם יש גרסה מוגהת מול הסריקה (pages_fixed) — משתמשים בה
import os
os.makedirs('pages', exist_ok=True)
bypage = collections.OrderedDict()
for pg, pi, s in lines: bypage.setdefault((pg, pi), []).append(s)
lines = []
for (pg, pi), ls in bypage.items():
    open('pages/%03d.txt' % pg, 'w', encoding='utf-8').write('\n'.join(ls) + '\n')
    fx = 'pages_fixed/%03d.txt' % pg
    if os.path.exists(fx): ls = [l.strip() for l in open(fx, encoding='utf-8').read().split('\n') if l.strip()]
    lines += [(pg, pi, l) for l in ls]

# פסקאות: סעיף חדש מתחיל ב"א." וכו'; כותרת = שורה קצרה בלי סימן פיסוק
SEC = re.compile(r'^[א-ת]{1,2}\. ')
paras = []   # dict(pg, pi, x, head)
for pg, pi, s in lines:
    words_n = len(s.split())
    is_head = words_n <= 6 and not re.search(r'[.,:;!?״—\-]$', s) and not SEC.match(s) and not s.startswith('—')
    prev = paras[-1] if paras else None
    if is_head and len(re.sub(r'[^א-ת]', '', s)) < 3: continue
    if is_head:
        paras.append({'pg': pg, 'pi': pi, 'x': '', 'head': s}); continue
    if prev is None or prev['pi'] != pi or SEC.match(s) or (prev['x'] and re.search(r'[.:?!]$', prev['x']) and len(prev['x'].split()) > 120):
        paras.append({'pg': pg, 'pi': pi, 'x': s, 'head': None})
    else:
        prev['x'] = (prev['x'] + ' ' + s).strip()
# כותרות מצטרפות לפסקה שאחריהן
out, pend = [], None
for p in paras:
    if p['head'] is not None and not p['x']:
        pend = p['head'] if pend is None else pend + ' — ' + p['head']; continue
    if pend: p['x'] = pend + '\n' + p['x']; pend = None
    out.append(p)
paras = out

def sentences(x):
    return [s for s in re.split(r'(?<=[.:?!])\s+', x) if s]

# קטעים: סעיף שלם, ופיצול סעיפים ארוכים לכ-150 מילה
chunks = []
for p in paras:
    sents = sentences(p['x']); cur = []
    for s in sents:
        cur.append(s)
        if len(' '.join(cur).split()) >= 150:
            chunks.append({'pg': p['pg'], 'pi': p['pi'], 'x': ' '.join(cur)}); cur = []
    if cur:
        tail = ' '.join(cur)
        if chunks and chunks[-1]['pi'] == p['pi'] and len(tail.split()) < 40 and not SEC.match(tail):
            chunks[-1]['x'] += ' ' + tail
        else:
            chunks.append({'pg': p['pg'], 'pi': p['pi'], 'x': tail})
# קטעים קטנים מאוד מצטרפים לקודם
merged = []
for c in chunks:
    if merged and merged[-1]['pi'] == c['pi'] and len(c['x'].split()) < 25:
        merged[-1]['x'] += '\n' + c['x']
    else: merged.append(c)
chunks = merged

meta_chunks, smalls = [], []
for i, c in enumerate(chunks):
    bp = bookpage(c['pg'])
    t = 'לקוטי דיבורים ח״ה — ' + PARTS[c['pi']][2] + ' (עמ׳ ' + str(bp) + ')'
    meta_chunks.append({'id': 'LD5#%d' % i, 'f': '', 't': t, 'x': c['x'], 'u': HB.format(c['pg'])})
    if len(c['x'].split()) > 90:
        cur = []
        for s in sentences(c['x'].replace('\n', ' ')):
            cur.append(s)
            if len(' '.join(cur).split()) >= 55:
                smalls.append({'p': i, 'x': ' '.join(cur)}); cur = []
        if cur:
            if len(' '.join(cur).split()) < 25 and smalls and smalls[-1]['p'] == i: smalls[-1]['x'] += ' ' + ' '.join(cur)
            else: smalls.append({'p': i, 'x': ' '.join(cur)})
json.dump({'chunks': meta_chunks, 'smalls': smalls}, open('ld5_meta.json', 'w'), ensure_ascii=False, indent=0)
wc = [len(c['x'].split()) for c in meta_chunks]
json.dump([[a,b,n] for (a,b),n in CHANGED.most_common()], open('changes.json','w'), ensure_ascii=False)
print(len(meta_chunks), 'chunks', len(smalls), 'smalls; words total', sum(wc), 'median', sorted(wc)[len(wc)//2], 'max', max(wc), 'min', min(wc))
