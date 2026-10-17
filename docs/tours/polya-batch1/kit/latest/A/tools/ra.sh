#!/bin/bash
# ra.sh SID N [M] : answer pN with round8 rM.txt (pid-mapped). Then show filtered output
T=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya
M=${3:-$2}
python3 $T/round15A/tools/pm.py $1 $2 $M || exit 1
python3 - "$1" "$M" > $T/round15A/$1/ans_$2.json <<'PY'
import sys,json,os
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,m=sys.argv[1],sys.argv[2]
t=open(f'{T}/round14A/{s}/ai/r{m}.txt').read()
mp=f'{T}/round15A/{s}/pidmap.json'
if os.path.exists(mp):
    for o,n in json.load(open(mp)).items(): t=t.replace(o,n)
print(t)
PY
python3 $T/round15A/tools/d.py $1 ans $2 @$T/round15A/$1/ans_$2.json | python3 $T/round15A/tools/f.py
