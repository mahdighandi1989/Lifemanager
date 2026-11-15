#!/usr/bin/env python3
# mkplan27.py sid — round-27 plan: every executed round-26 ctl as {"src":k}, shell/restart items kept at their place
import json,sys,os,glob
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s=sys.argv[1]; P=json.load(open(f'{B}/round26D/{s}.plan.json')); N=len(glob.glob(f'{B}/round26D/{s}/ctl/c*.json'))
out=[];k=0
for it in P:
    if 'shell' in it:
        it=dict(it); it['shell']=it['shell'].replace('round26D','round27D'); out.append(it); continue
    if 'restart' in it: out.append(it); continue
    k+=1
    if k>N: break
    out.append({'src':k})
    if it.get('exit') or ('new' in it and it['new'].get('exit')): break
print(s,'ctl',N,'plan src',k, 'items',len(out))
json.dump(out,open(f'{B}/round27D/{s}.plan.json','w'),ensure_ascii=False)
