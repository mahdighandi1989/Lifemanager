#!/usr/bin/env python3
# sendmod.py SID I REPL_JSON  : send round23A ctl cI with [[old,new],...] replacements (pid-mapped), set pos=I
import sys,json,os,subprocess
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,i=sys.argv[1],sys.argv[2]; R=json.loads(sys.argv[3]) if len(sys.argv)>3 else []
t=open(f'{T}/round23A/{s}/ctl/c{i}.json').read()
d=json.loads(t)
for k in d:
    if isinstance(d[k],str):
        for a,b in R:
            if a in d[k]: d[k]=d[k].replace(a,b); print('replaced:',a[:50])
t=json.dumps(d,ensure_ascii=False)
mp=f'{T}/round24A/{s}/pidmap.json'
if os.path.exists(mp):
    for a,b in json.load(open(mp)).items(): t=t.replace(a,b)
tf=f'{T}/round24A/{s}/_tmp.json'; open(tf,'w').write(t)
o=subprocess.run(['python3',T+'/round24A/tools/d.py',s,'send','@'+tf],capture_output=True,text=True,timeout=1200).stdout
print(subprocess.run(['python3',T+'/round24A/tools/f.py'],input=o,capture_output=True,text=True).stdout[-5000:])
open(f'{T}/round24A/{s}/pos','w').write(i)
