#!/usr/bin/env python3
# addprobe.py sid — insert probe items before the final exit item of round27D/<sid>.plan.json (idempotent)
import json,sys,subprocess
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27D'
s=sys.argv[1]; P=json.load(open(f'{R}/{s}.plan.json'))
if any(it.get('tag')=='pdump' for it in P): print('already'); sys.exit()
items=json.loads(subprocess.run(['python3',R+'/tools/probe27.py'],capture_output=True,text=True).stdout)
P=P[:-1]+items+P[-1:]
json.dump(P,open(f'{R}/{s}.plan.json','w'),ensure_ascii=False); print(s,len(P))
