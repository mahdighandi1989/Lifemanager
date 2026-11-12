#!/bin/bash
# a.sh sid N  (stdin = reply JSON) -> validate, write rN, continue driving
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26C
cd $R; python3 -c "
import sys,json
t=sys.stdin.read().strip(); d=json.loads(t); assert 'reply' in d
import os
os.makedirs('man/$1',exist_ok=True)
o=json.dumps(d,ensure_ascii=False)
open('man/$1/r$2.txt','w').write(o)
open('man/$1/t$2.txt','w').write(json.load(open('$1/ai/p$2.json'))['user'].split('# نوبتِ تازه')[-1].strip())
open('$1/ai/r$2.txt','w').write(o)" || { echo BADJSON; exit 1; }
timeout ${T:-560} python3 tools/run.py $1 ${3:-}
