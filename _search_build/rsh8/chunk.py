import json,re
P=json.load(open('pages.json'))
def pnum(h):
    for x in h:
        y=x.replace('יומן כ"ק אדמו"ר מוהריי"צ','').strip()
        if re.fullmatch(r'[א-ת]{1,3}',y): return y
    return ''
def fix(l):
    l=re.sub(r'\s*[©¨]','',l)            # סימני ניקוד (פתח/קמץ) של אידיש — מוסרים
    l=re.sub(r'R\s*','פ',l)               # פּ
    l=re.sub(r',(?=[א-ת])',', ',l)
    return l
lines=[]
for p in P[4:59]:
    pn=pnum(p['hdr'])
    for l in p['lines']:
        l=fix(l).strip()
        if l: lines.append((p['pdf'],pn,l))
W=sorted(len(l) for _,_,l in lines)[len(lines)*3//4]   # רוחב שורה טיפוסי
paras=[]; prev=None
for pdf,pn,l in lines:
    if re.fullmatch(r'[*\s]+',l): paras.append(None); prev=None; continue
    start = prev is None or (re.search(r'[.:]["״]?$',prev) and len(prev) < W*0.85)
    if start or not paras or paras[-1] is None: paras.append({'pdf':pdf,'pn':pn,'x':l})
    else:
        q=paras[-1]; q['x'] = q['x'][:-1]+l if q['x'].endswith('־') and not q['x'].endswith(' ־') else q['x']+' '+l
    prev=l
paras=[p for p in paras if p]
def sents(x): return [s for s in re.split(r'(?<=[.:?!])\s+',x) if s]
paras2=[]
for p in paras:
    if paras2 and len(paras2[-1]['x'].split())<25: paras2[-1]['x']+='\n'+p['x']
    else: paras2.append(dict(p))
paras=paras2
chunks=[]
for p in paras:
    cur=[]
    for s in sents(p['x']):
        cur.append(s)
        if len(' '.join(cur).split())>=150: chunks.append({**p,'x':' '.join(cur)}); cur=[]
    if cur:
        tail=' '.join(cur)
        if chunks and len(tail.split())<45: chunks[-1]['x']+='\n'+tail
        else: chunks.append({**p,'x':tail})
mc=[];sm=[]
for i,c in enumerate(chunks):
    mc.append({'id':'RSH8#%d'%i,'f':'','u':'','t':'רשימות היומן חוברת ח׳ — דברי ימי חיי אדמו״ר הזקן (עמ׳ %s)'%c['pn'],'x':c['x']})
    if len(c['x'].split())>90:
        cur=[]
        for s in sents(c['x'].replace('\n',' ')):
            cur.append(s)
            if len(' '.join(cur).split())>=55: sm.append({'p':i,'x':' '.join(cur)}); cur=[]
        if cur:
            if len(' '.join(cur).split())<25 and sm and sm[-1]['p']==i: sm[-1]['x']+=' '+' '.join(cur)
            else: sm.append({'p':i,'x':' '.join(cur)})
json.dump({'chunks':mc,'smalls':sm},open('rsh8_meta.json','w'),ensure_ascii=False,indent=0)
wc=[len(c['x'].split()) for c in mc]
print(len(mc),'chunks',len(sm),'smalls; median',sorted(wc)[len(wc)//2],'min',min(wc),'max',max(wc),'W',W)
for i in (0,1,40,len(mc)-1): print(mc[i]['t']); print(mc[i]['x'][:300]); print()
