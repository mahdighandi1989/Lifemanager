#!/usr/bin/env python3
# ans.py SID N REPLY [ACTIONS_JSON] [EXTRA_TOPLEVEL_JSON] : answer pN, print the resulting chat tail
import sys,json,subprocess
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A'
s,n,rep=sys.argv[1:4]; acts=json.loads(sys.argv[4]) if len(sys.argv)>4 else []
a={"reply":rep,"status":"related","next":False,"outside":"","know":[],"actions":acts}
if len(sys.argv)>5: a.update(json.loads(sys.argv[5]))
f=f'{R}/{s}/ans_{n}.json'; open(f,'w').write(json.dumps(a,ensure_ascii=False))
o=subprocess.run(['timeout','600','python3',R+'/tools/d.py',s,'ans',n,'@'+f],capture_output=True,text=True).stdout
print('\n'.join(l[:600] for l in o.split('\n') if l.startswith(('  MSG','=== AI','ERROR','EVAL','OVERLAY','VIEW'))))
