# בניית טקסט מחדש מתיבות האותיות: ב-OCR של ח"ה כל אות היא "מילה" — מחברים לפי המרווח
import re, html
s = open('bbox.html', encoding='utf-8').read()
pages = s.split('<page ')[1:]
def fix(w):   # מילה רב־אותית מגיעה בסדר חזותי (הפוך) — להפוך; סוגריים מתחלפים
    if len(w) > 1 and re.search('[א-ת]', w): w = w[::-1].translate(str.maketrans('()', ')('))
    return w
out = []
for pg in pages:
    W = [(float(a), float(b), float(c), float(d), fix(html.unescape(w))) for a, b, c, d, w in
         re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)</word>', pg)]
    W.sort(key=lambda w: ((w[1] + w[3]) / 2, -w[2]))
    lines = []
    for w in W:
        yc = (w[1] + w[3]) / 2
        if lines and abs(lines[-1][0] - yc) < 4: lines[-1][1].append(w)
        else: lines.append([yc, [w]])
    txt = []
    for yc, ws in lines:
        ws.sort(key=lambda w: -w[2])
        t, prev = '', None
        for w in ws:
            if prev is None: t = w[4]
            else:
                gap = prev[0] - w[2]
                t += ('' if gap < 3.0 else ' ') + w[4]
            prev = w
        txt.append(t)
    out.append('\n'.join(txt))
open('ld5.txt', 'w', encoding='utf-8').write('\f'.join(out))
print(len(out))
