#!/usr/bin/env python3
# say.py SID TEXT : send chat text, wait for AI prompt, print compact TQ view
import sys,json,subprocess,os
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A'
s,t=sys.argv[1],sys.argv[2]
f=f'{R}/{s}/_say.json'; json.dump({'say':t},open(f,'w'),ensure_ascii=False)
o=subprocess.run(['timeout','300','python3',R+'/tools/d.py',s,'send','@'+f],capture_output=True,text=True).stdout
n=len([x for x in os.listdir(f'{R}/{s}/ai') if x.startswith('p')])
if os.path.exists(f'{R}/{s}/ai/r{n}.txt'): print('NO NEW PROMPT\n'+o[-1500:]); sys.exit()
print(subprocess.run(['bash',R+'/tools/tq.sh',s,str(n)],capture_output=True,text=True).stdout[:int(os.environ.get('W','2500'))])
