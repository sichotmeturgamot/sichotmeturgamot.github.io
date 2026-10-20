import json,sys
sys.argv=['x']; import importlib.util
spec=importlib.util.spec_from_file_location('E','/home/claude/sichotmeturgamot.github.io/_search_build/embed.py')
src=open('/home/claude/sichotmeturgamot.github.io/_search_build/embed.py').read().split("if __name__")[0].replace("CACHE='cache.json'","CACHE='cache_ld1.json'")
g={}; exec(src,g)
m=json.load(open('ld1_meta.json')); D=[]
for b in range(8): D+=[d['d'] for d in json.load(open(f'desc_{b}.json'))]
T=[D[i]+'\n'+c['x'] for i,c in enumerate(m['chunks'])]+[s['x'] for s in m['smalls']]
g['embed_all'](T); print('ok',len(T))
