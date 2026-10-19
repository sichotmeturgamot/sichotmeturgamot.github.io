import json,os,sys,hashlib,urllib.request,time
ACC=os.environ['CF_ACCOUNT_ID'];TOK=os.environ['CF_API_TOKEN']
CACHE='cache.json'; cache=json.load(open(CACHE)) if os.path.exists(CACHE) else {}
def key(t): return hashlib.sha1(t.encode()).hexdigest()
def cf(batch):
  req=urllib.request.Request(f'https://api.cloudflare.com/client/v4/accounts/{ACC}/ai/run/@cf/baai/bge-m3',
    data=json.dumps({'text':batch}).encode(),headers={'Authorization':'Bearer '+TOK,'Content-Type':'application/json'})
  for a in range(4):
    try: return json.load(urllib.request.urlopen(req,timeout=120))['result']['data']
    except Exception as e: print('retry',e,file=sys.stderr); time.sleep(3*(a+1))
  raise SystemExit('fail')
def embed_all(texts):
  todo=list(dict.fromkeys(t for t in texts if key(t) not in cache))
  for i in range(0,len(todo),40):
    b=todo[i:i+40]
    for t,v in zip(b,cf(b)): cache[key(t)]=v
    print(i+len(b),'/',len(todo),file=sys.stderr)
  json.dump(cache,open(CACHE,'w'))
  return [cache[key(t)] for t in texts]
if __name__=='__main__':
  m=json.load(open('/home/claude/sichotmeturgamot.github.io/search-meta.json'))
  D=json.load(open('descs.json')); C=m['chunks']; S=m['smalls']
  ev=json.load(open('eval.json'))
  T=[c['x'] for c in C]+[s['x'] for s in S]+[D[i]+'\n'+c['x'] for i,c in enumerate(C)]+[D[s['p']]+'\n'+s['x'] for s in S]+D+[q['q'] for q in ev]
  embed_all(T); print('done',len(cache))
