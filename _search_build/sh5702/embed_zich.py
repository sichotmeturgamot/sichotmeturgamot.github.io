import json,sys
src=open('/home/claude/sichotmeturgamot.github.io/_search_build/embed.py').read().split("if __name__")[0].replace("CACHE='cache.json'","CACHE='/home/claude/zich3/cache_zich.json'")
g={}; exec(src,g)
m=json.load(open('/home/claude/zich3/zich_meta.json')); D=json.load(open('/home/claude/zich3/descs_zich.json'))
ev=json.load(open('/home/claude/zich3/zich_eval.json'))
T=[D[i]+'\n'+c['x'] for i,c in enumerate(m['chunks'])]+[s['x'] for s in m['smalls']]+[q['q'] for q in ev]
g['embed_all'](T); print('done')
