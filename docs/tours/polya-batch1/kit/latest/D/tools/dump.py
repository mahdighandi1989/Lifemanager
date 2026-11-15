#!/usr/bin/env python3
# dump.py sid — print the end-of-run probe (route points + dossier per id + today), compacted
import json,sys,re,glob,os
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27D'
s=sys.argv[1]; W=int(os.environ.get('W','20000'))
for f in sorted(glob.glob(f'{B}/{s}/out/s*.json'),key=lambda x:int(re.findall(r'\d+',x.split('/')[-1])[0])):
    r=json.load(open(f)); e=r.get('eval','')
    if isinstance(e,str) and e.startswith('{"ids"'):
        o=json.loads(e); break
else: print('no dump'); sys.exit()
for i in o['ids']:
    v=o['route'].get(i); print('### ROUTE',i, (v.get('dest','')[:100] if isinstance(v,dict) else v))
    if isinstance(v,dict): print('   ', ' | '.join(p[1] for p in v['pts']))
    d=o['dossier'].get(i,''); d=re.sub(r'از پیامِ گفت‌وگو: «[^»]*»','«…»',d); d=re.sub(r'\n+','\n',d)
    k=d.find('📜 پروندهٔ کامل'); print('### DOSSIER',i); print(d[k:k+W])
print('### TODAY'); t=o['today']; k=t.find('کارهای موعددار'); print(t[k:k+1500])
