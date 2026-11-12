#!/bin/bash
# arm.sh SID NUM AT TAG 'note text' : routine note + sweep, compact print
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A
python3 $R/tools/note.py $1 $2 $3 "$5"
bash $R/tools/sweep.sh $1 $4 > $R/$1/arm_$4.txt 2>&1
python3 - $R/$1/arm_$4.txt <<'P'
import sys,json,re
t=open(sys.argv[1]).read()
m=re.search(r'\{"sys".*\}',t)
if not m: print(t[:1500]); sys.exit()
try:
    d=json.loads(m.group(0))
except Exception:
    d=json.loads(json.loads('"'+m.group(0)+'"'))
for s in d['sys']: print('SYS',json.dumps(s,ensure_ascii=False)[:700])
print('LASTMSG',d['msgs'][-1][:700] if d['msgs'] else None)
print('DUE',d['due'])
P
