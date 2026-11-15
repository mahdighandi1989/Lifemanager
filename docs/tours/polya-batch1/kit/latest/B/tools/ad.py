#!/usr/bin/env python3
"""ad.py sid file.json [pos] : insert entries (list of {ctl:{...}} or {hook:...} / {say:..} shorthand) into seq.json
before the end block (first ctl after the last 'say' of round 26) unless pos (1-based seq index to insert before) is given."""
import json,sys,os,re
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s=sys.argv[1]; D=f'{B}/round27B/{s}'; src=open(f'{D}/src.txt').read().strip() if os.path.exists(f'{D}/src.txt') else s
L=json.load(open(f'{D}/seq.json'))
def isay(e):
    if 'ctl' in e: c=e['ctl']
    elif 'src' in e: c=json.load(open(f'{B}/round26B/{src}/ctl/c{e["src"]}.json'))
    else: return False
    return 'say' in c
if len(sys.argv)>3: pos=int(sys.argv[3])-1
else:
    last=max(i for i,e in enumerate(L) if isay(e)); pos=last+1
new=json.load(open(sys.argv[2])); out=[]
for e in new:
    if 'say' in e and 'ctl' not in e: e={'ctl':e}
    out.append(e)
L=L[:pos]+out+L[pos:]
json.dump(L,open(f'{D}/seq.json','w'),ensure_ascii=False,indent=0); print(s,'inserted',len(out),'at',pos+1,'of',len(L))
