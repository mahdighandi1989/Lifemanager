#!/usr/bin/env python3
"""mkpage.py name areas.json : scratch copy of the dist with extra territory areas (a real registry entry, as a build would add)"""
import json,sys
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27B'
h=open('/home/user/Lifemanager/apps/learning-architecture/dist/learning-architecture.html').read()
a=h.index('window.SYS_TERR = ')+len('window.SYS_TERR = '); b=h.index(';\nwindow.SYS_TERR_LEDGER',a)
T=json.loads(h[a:b]); add=json.load(open(sys.argv[2]))
for x in add:
    sysid,gid,area=x['sys'],x['group'],x['area']
    s=[m for m in T['systems'] if m['id']==sysid][0]; g=[g for g in s['groups'] if g['id']==gid][0]; g['areas'].append(area)
h=h[:a]+json.dumps(T,ensure_ascii=False,sort_keys=True,separators=(',',':'))+h[b:]
open(f'{B}/scratchpage/page_{sys.argv[1]}.html','w').write(h); print('ok',sys.argv[1],len(add))
