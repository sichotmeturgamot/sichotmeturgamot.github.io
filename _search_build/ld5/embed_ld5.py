import json,sys
src=open('/home/claude/sichotmeturgamot.github.io/_search_build/embed.py').read().split("if __name__")[0].replace("CACHE='cache.json'","CACHE='/home/claude/ld5/cache_ld5.json'")
g={}; exec(src,g)
m=json.load(open('/home/claude/ld5/ld5_meta.json')); D=json.load(open('/home/claude/ld5/descs_ld5.json'))
ev=json.load(open('/home/claude/ld5/ld5_eval.json'))
T=[D[i]+'\n'+c['x'] for i,c in enumerate(m['chunks'])]+[s['x'] for s in m['smalls']]+[q['q'] for q in ev]
g['embed_all'](T); print('done')
