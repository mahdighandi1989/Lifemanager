#!/usr/bin/env python3
# scanbad.py sid — known bad patterns in the end dump and all chat sys lines
import json,sys,re,glob,subprocess
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27D'
s=sys.argv[1]
d=subprocess.run(['python3',B+'/tools/dump.py',s],capture_output=True,text=True,env={'W':'60000','PATH':'/usr/bin:/bin'}).stdout
txt=re.sub(r'### [A-Z]+ [a-z_0-9]+','',d)
for f in glob.glob(f'{B}/{s}/out/s*.json'):
    try: txt+='\n'+'\n'.join(m for m in json.load(open(f)).get('state',{}).get('msgs',[]) if m.startswith('sys:'))
    except: pass
P={'undefined':r'undefined','raw id':r'\(?(?:it1|prc|pb_l|achat|case|lp)_[a-z0-9]{3,}','سنجیده نشد':r'از پیام‌های خودت سنجیده نشد','plan+طرح':r'· برنامهٔ خودت \(از گفت‌وگو\)','طرح از گفت‌وگو':r'· طرح \(از گفت‌وگو\)','ISO':r'\b20\d\d-\d\d-\d\d\b','prc word':r'\(prc\)','کهنه':r'کهنه پس از اصلاح','این‌جا هم':r'این‌جا هم عوض شود','؟«':r'،\d|،[۰-۹]{3}؟'}
for k,p in P.items():
    m=re.findall(p,txt)
    if m: print(f'{k}: {len(m)} e.g. {m[:3]}')
