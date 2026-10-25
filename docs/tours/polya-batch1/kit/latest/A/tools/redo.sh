#!/bin/bash
# redo.sh SID : resume replay; answer each pending prompt from prev/ if same turn; stop when no prev match
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A
[ -f $R/$1/stops.env ] && { . $R/$1/stops.env; export STOPCTL; }
for k in $(seq 1 60); do
  N=$(python3 -c "
import os,re;D='$R/$1/ai';ns=sorted(int(m.group(1)) for f in os.listdir(D) for m in [re.match(r'p(\d+)\.json',f)] if m);p=[x for x in ns if not os.path.exists(D+'/r%d.txt'%x)];print(p[0] if p else '')")
  if [ -z "$N" ]; then python3 -u $R/tools/auto3.py $1 >> $R/$1/auto.log 2>&1; echo "EXIT $?" >> $R/$1/auto.log; 
     N2=$(python3 -c "
import os,re;D='$R/$1/ai';ns=sorted(int(m.group(1)) for f in os.listdir(D) for m in [re.match(r'p(\d+)\.json',f)] if m);p=[x for x in ns if not os.path.exists(D+'/r%d.txt'%x)];print(p[0] if p else '')")
     [ -z "$N2" ] && { echo "REDO-END (no pending)"; tail -3 $R/$1/auto.log | cut -c1-200; break; }; continue; fi
  python3 $R/tools/prv.py $1 $N || { echo "REDO-STOP at p$N"; break; }
  M=$(python3 -c "import json;print(json.load(open('$R/prev/$1/r10map.json')).get('$N','0'))" 2>/dev/null)
  python3 -c "
import json,os;f='$R/$1/r10map.json';m=json.load(open(f)) if os.path.exists(f) else {};m['$N']='${M:-0}';json.dump(m,open(f,'w'))"
  python3 $R/tools/d.py $1 ans $N @$R/$1/ans_$N.json > /dev/null 2>&1
  python3 -u $R/tools/auto3.py $1 >> $R/$1/auto.log 2>&1; echo "EXIT $?" >> $R/$1/auto.log
done
