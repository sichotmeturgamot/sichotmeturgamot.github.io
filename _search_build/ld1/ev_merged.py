import json,struct,hashlib,numpy as np,sys
key=lambda t: hashlib.sha1(t.encode()).hexdigest()
src=open('/home/claude/sichotmeturgamot.github.io/_search_build/embed.py').read().split("if __name__")[0].replace("CACHE='cache.json'","CACHE='cache_ld1.json'")
g={}; exec(src,g)
old=json.load(open('/home/claude/enrich/cache.json'))
def load(d):
    b=open(d+'search-vectors.bin','rb').read(); N,dim,np_,dl=struct.unpack('<IIII',b[:16])
    par=np.frombuffer(b,np.uint16,N,16); V=np.frombuffer(b,np.int8,offset=16+2*N).reshape(N,dim).astype(np.float32)/400
    m=json.load(open(d+'search-meta.json')); return V,par,np_,dl/1000,m
def scores(q,V,par,np_,delta):
    s=V@q; best=s[:np_].copy()
    np.maximum.at(best,par[np_:],s[np_:]-delta); return best
def evalset(d,qs,isgold):
    V,par,np_,delta,m=load(d); ranks=[]
    for q,gold in qs:
        sc=scores(q,V,par,np_,delta); o=np.argsort(-sc)
        r=next((k for k,p in enumerate(o) if isgold(m['chunks'][p],p,gold)),999); ranks.append(r)
    return ranks
ev=json.load(open('/home/claude/enrich/eval.json'))
Q1=[(np.array(old[key(x['q'])],np.float32),x['exp']) for x in ev]
R='/home/claude/sichotmeturgamot.github.io/'
for name,d in [('before',R),('after','/tmp/claude-0/t/mg/')]:
    r=evalset(d,Q1,lambda c,p,g: c['f'] in g)
    print('sichos eval',name,'top5',sum(x<5 for x in r),'top30',sum(x<30 for x in r),'top50',sum(x<50 for x in r),r)
le=json.load(open('ld_eval.json'))
qv=g['embed_all']([x['q'] for x in le])
V,par,np_,delta,m=load('/tmp/claude-0/t/mg/'); off=np_-564
r=evalset('/tmp/claude-0/t/mg/',[(np.array(v,np.float32),x['gold']) for v,x in zip(qv,le)],lambda c,p,g: p-off in g)
print('LD1 eval top5',sum(x<5 for x in r),'top30',sum(x<30 for x in r),'/',len(r),r)
for x,rr in zip(le,r): print(rr,x['q'])
