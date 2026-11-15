#!/usr/bin/env python3
# rt.py SID : routing table -> SID/route_table.md ; prints summary
import json,os,re,sys
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27A'
s=sys.argv[1]; D=f'{R}/{s}/ai'
ns=sorted(int(m.group(1)) for f in os.listdir(D) for m in [re.match(r'p(\d+)\.json',f)] if m)
rows=['| p | task | kind | ok |','|---|---|---|---|']; bad=0; c={}
for n in ns:
    p=json.load(open(f'{D}/p{n}.json')); t=p.get('task'); u=p['user']
    i=u.find('# نوبتِ تازه'); turn=u[i+13:i+90].replace('\n',' ') if i>=0 else ''
    sysf=turn.strip().startswith('[سامانه')
    kind='system follow-up' if sysf else ('chat' if t in('lla_coach','lla_assistant') else 'page')
    ok='✓'
    if sysf and t=='lla_coach': ok='✗'; bad+=1
    c[t]=c.get(t,0)+1
    rows.append(f'| p{n} | {t} | {kind}: {turn[:60]} | {ok} |')
open(f'{R}/{s}/route_table.md','w',encoding='utf-8').write('\n'.join(rows)+'\n')
print(s,len(ns),'turns',c,'flagged',bad)
