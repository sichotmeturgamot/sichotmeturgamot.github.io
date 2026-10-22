# שיחות חדשות מהאתר → קטעים לחיפוש (לפי עמודי sichos/*.html)
import re, html, json, sys
R='/home/claude/sichotmeturgamot.github.io/'
FS=sys.argv[1:]
def sentences(x): return [s for s in re.split(r'(?<=[.:?!])\s+', x) if s]
SEC=re.compile(r'^[א-ת]{1,2}\. ')
allc, alls = [], []
for f in FS:
    s=open(R+'sichos/'+f+'.html',encoding='utf-8').read()
    t=html.unescape(re.search(r'<h1[^>]*>(.*?)</h1>',s,re.S).group(1)); t=re.sub(r'<[^>]+>','',t).strip()
    body=s[s.index('class="text"'):]; body=body[:body.index('class="notes"')] if 'class="notes"' in body else body[:body.index('</main>')]
    body=re.sub(r'<sup>.*?</sup>','',body,flags=re.S)
    paras=[]
    for m in re.finditer(r'<(h2|p)[^>]*>(.*?)</\1>',body,re.S):
        x=html.unescape(re.sub(r'<[^>]+>','',m.group(2))).strip()
        if x: paras.append((m.group(1),x))
    chunks=[]; cur=None
    for tag,x in paras:
        if tag=='h2': continue
        if cur is None or (SEC.match(x) and len(cur.split())>60) or len(cur.split())+len(x.split())>190 and len(cur.split())>90:
            if cur: chunks.append(cur)
            cur=x
        else: cur+='\n'+x
    if cur: chunks.append(cur)
    if len(chunks)>1 and len(chunks[-1].split())<30: chunks[-2]+='\n'+chunks.pop()
    for i,x in enumerate(chunks):
        allc.append({'id':'%s#%d'%(f,i),'f':f,'u':'','t':t,'x':x})
        pi=len(allc)-1
        if len(x.split())>85:
            cur=[]
            for se in sentences(x.replace('\n',' ')):
                cur.append(se)
                if len(' '.join(cur).split())>=55: alls.append({'p':pi,'x':' '.join(cur)}); cur=[]
            if cur:
                if len(' '.join(cur).split())<25 and alls and alls[-1]['p']==pi: alls[-1]['x']+=' '+' '.join(cur)
                else: alls.append({'p':pi,'x':' '.join(cur)})
    print(f, t, len(chunks))
json.dump({'chunks':allc,'smalls':alls},open('site_meta.json','w'),ensure_ascii=False,indent=0)
print(len(allc),'chunks',len(alls),'smalls')
