import json,hashlib,numpy as np
key=lambda t: hashlib.sha1(t.encode()).hexdigest()
cache=json.load(open('cache.json'))
m=json.load(open('/home/claude/sichotmeturgamot.github.io/search-meta.json'));C=m['chunks'];S=m['smalls'];D=json.load(open('descs.json'))
ev=json.load(open('eval.json'))
E=lambda ts:np.array([cache[key(t)] for t in ts],dtype=np.float32)
def nrm(a): return a/np.linalg.norm(a,axis=1,keepdims=True)
Q=nrm(E([q['q'] for q in ev]))
Pt=nrm(E([c['x'] for c in C])); Pd=nrm(E([D[i]+'\n'+c['x'] for i,c in enumerate(C)]))
St=nrm(E([s['x'] for s in S])); Sd=nrm(E([D[s['p']]+'\n'+s['x'] for s in S])); Dd=nrm(E(D))
sp=np.array([s['p'] for s in S]); dp=np.arange(len(C))
F=[c['f'] for c in C]
def run(P,kids,delta):
  sc=Q@P.T
  for K,par in kids:
    ks=Q@K.T-delta
    for j in range(len(par)):
      sc[:,par[j]]=np.maximum(sc[:,par[j]],ks[:,j])
  h1=h5=h20=0;mrr=0;rows=[]
  for qi,q in enumerate(ev):
    order=np.argsort(-sc[qi]); fs=[F[p] for p in order]
    r=next((k for k,f in enumerate(fs) if f in q['exp']),999)
    h1+=r<1;h5+=r<5;h20+=r<20;mrr+=1/(r+1) if r<999 else 0;rows.append(r)
  return h1,h5,h20,round(mrr/len(ev),3),rows
V={'A text+small':(Pt,[(St,sp)]),'B desc+text, small':(Pd,[(St,sp)]),'C desc+text, desc+small':(Pd,[(Sd,sp)]),
   'D B + desc child':(Pd,[(St,sp),(Dd,dp)]),'E C + desc child':(Pd,[(Sd,sp),(Dd,dp)]),'F text, desc+small':(Pt,[(Sd,sp)])}
for name,(P,k) in V.items():
  for d in [0,0.02,0.04]:
    h1,h5,h20,mrr,rows=run(P,k,d); print(f'{name:28s} d={d}: top1 {h1}/30 top5 {h5}/30 top20 {h20}/30 MRR {mrr}  last4={rows[-4:]}')

print('--- quantized B, delta .02')
for scale in [127,400]:
  qz=lambda a: np.clip(np.round(a*scale),-127,127)/scale
  for cand in [20,25,30]:
    h1,h5,h20,mrr,rows=run(qz(Pd),[(qz(St),sp)],0.02)
  print(scale,h1,h5,h20,mrr,rows)
sc=Q@Pd.T; ks=Q@St.T-0.02
for j in range(len(sp)): sc[:,sp[j]]=np.maximum(sc[:,sp[j]],ks[:,j])
o=np.argsort(-sc[26])[:25]; print([ (k,F[p]) for k,p in enumerate(o) if F[p] in ev[26]['exp']])
