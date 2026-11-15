#!/usr/bin/env python3
"""sys.py sid [W] : every new sys/assistant line per ctl step (dedup), plus ctl say text"""
import json,os,re,sys
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27B'
s=sys.argv[1]; W=int(sys.argv[2]) if len(sys.argv)>2 else 400; D=f'{B}/{s}'
seen=set(); n=len([f for f in os.listdir(D+'/out') if re.match(r's\d+\.json$',f)])
roles=os.environ.get('ROLES','sys').split(',')
for k in range(1,n+1):
    c=json.load(open(f'{D}/ctl/c{k}.json'))
    o=json.load(open(f'{D}/out/s{k}.json'))
    if 'say' in c: print(f'c{k} SAY: '+c['say'][:W].replace('\n',' '))
    elif c.get('exit'): print(f'c{k} EXIT'); continue
    elif os.environ.get('EV'): print(f'c{k} EVAL→ '+str(o.get('eval'))[:int(os.environ.get('EV'))].replace('\n',' '))
    for m in (o.get('state') or {}).get('msgs',[]):
        r=m.split(':',1)[0]
        if r in roles and m not in seen:
            seen.add(m); print('   '+m[:W].replace('\n',' ⏎ '))
    for m in (o.get('state') or {}).get('msgs',[]): seen.add(m)
