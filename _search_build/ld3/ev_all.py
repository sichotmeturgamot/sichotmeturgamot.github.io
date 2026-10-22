import json,struct,hashlib,numpy as np,sys,os
key=lambda t: hashlib.sha1(t.encode()).hexdigest()
src=open('/home/claude/sichotmeturgamot.github.io/_search_build/embed.py').read().split("if __name__")[0].replace("CACHE='cache.json'","CACHE='/home/claude/ld3/qcache.json'")
g={}; exec(src,g)
B='/home/claude/sichotmeturgamot.github.io/_search_build/'
def load(d):
    b=open(d+'search-vectors.bin','rb').read(); N,dim,np_,dl=struct.unpack('<IIII',b[:16])
    par=np.frombuffer(b,np.uint16,N,16); V=np.frombuffer(b,np.int8,offset=16+2*N).reshape(N,dim).astype(np.float32)/400
    m=json.load(open(d+'search-meta.json')); return V,par,np_,dl/1000,m
def ranks(d,qs,isgold):
    V,par,np_,delta,m=load(d); out=[]
    for q,gold in qs:
        s=V@q; best=s[:np_].copy(); np.maximum.at(best,par[np_:],s[np_:]-delta); o=np.argsort(-best)
        out.append(next((k for k,p in enumerate(o) if isgold(m['chunks'][p],gold)),999))
    return out
old=json.load(open('/home/claude/enrich/cache.json'))
ev=json.load(open(B+'eval.json'))
sets=[('sichos',[(np.array(old[key(x['q'])],np.float32),x['exp']) for x in ev],lambda c,g: c['f'] in g)]
for name,f,pre in [('LD1',B+'ld1/ld_eval.json','LD1#'),('LD2',B+'ld2/ld2_eval.json','LD2#'),('RSH8',B+'rsh8/rsh8_eval.json','RSH8#'),('LD3','/home/claude/ld3/ld3_eval.json','LD3#'),('LD4','/home/claude/ld4/ld4_eval.json','LD4#'),('LD5','/home/claude/ld5/ld5_eval.json','LD5#'),('SH','/home/claude/sh1/sh_eval.json','SH5700#')]:
    if not os.path.exists(f): continue
    E=json.load(open(f)); qv=g['embed_all']([x['q'] for x in E])
    sets.append((name,[(np.array(v,np.float32),x['gold']) for v,x in zip(qv,E)],(lambda pre: lambda c,gl: c['id'] in {pre+str(k) for k in gl})(pre)))
for d in sys.argv[1:]:
    for name,qs,ig in sets:
        r=ranks(d,qs,ig); print(d[-8:],name,'top5',sum(x<5 for x in r),'top50',sum(x<50 for x in r),'top60',sum(x<60 for x in r),'top80',sum(x<80 for x in r),'/',len(r),'worst',sorted(r)[-3:])
