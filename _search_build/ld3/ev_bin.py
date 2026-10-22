import json,struct,hashlib,numpy as np
exec(open('/home/claude/ld3/ev_all.py').read().split("for d in sys.argv[1:]:")[0])
d='/home/claude/sichotmeturgamot.github.io/'
V,par,np_,delta,m=load(d); N=len(V)
Vi=np.rint(V*400)  # int8 values
bits=(Vi>0)
pc=np.array([bin(i).count('1') for i in range(256)],dtype=np.int32)
B=np.packbits(bits,axis=1)  # N x 128
def exact(q):
    s=V@q; best=s[:np_].copy(); np.maximum.at(best,par[np_:],s[np_:]-delta); return best
def two(q,K):
    qb=np.packbits(q>0)
    ham=pc[np.bitwise_xor(B,qb)].sum(1); sim=1024-2*ham   # ~ proportional to cosine
    pb=sim[:np_].astype(np.float32).copy(); np.maximum.at(pb,par[np_:],sim[np_:]-0)  # parent approx score (no delta)
    top=np.argsort(-pb)[:K]; keep=np.zeros(np_,bool); keep[top]=True
    s=np.full(np_,-9.0,np.float32); s[top]=V[top]@q
    ks=np.where(keep[par[np_:]])[0]+np_
    sc=V[ks]@q-delta; np.maximum.at(s,par[ks],sc); return s
def rank(sc,ig): o=np.argsort(-sc); return next((k for k,p in enumerate(o) if ig(m['chunks'][p])),999)
for name,qs,ig in sets:
    for K in [0,300]:
        r=[rank(exact(q) if K==0 else two(q,K),(lambda g: lambda c: ig(c,g))(gold)) for q,gold in qs]
        print(name,'exact' if K==0 else 'K=%d'%K,'top5',sum(x<5 for x in r),'top50',sum(x<50 for x in r),'/',len(r),sorted(r)[-3:])
