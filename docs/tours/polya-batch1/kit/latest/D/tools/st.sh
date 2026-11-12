#!/bin/bash
# st.sh sid [srcsid] [html] — fresh start: plan (if missing), harness in background (PID recorded), then drive
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26D
s=$1; src=${2:-$1}
mkdir -p $R/$s
[ -f $R/$s.plan.json ] || python3 - $s $src <<'PY'
import sys,json,glob
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,src=sys.argv[1],sys.argv[2]; n=len(glob.glob(f'{B}/round25D/{src}/ctl/c*.json'))
json.dump([{'src':k} for k in range(1,n+1)],open(f'{B}/round26D/{s}.plan.json','w'))
json.dump({'src':src},open(f'{B}/round26D/{s}.plan.json.src','w'))
PY
[ -f $R/$s.noshift ] || cp $( [ -f $R/$s.inject.js ] && echo $R/$s.inject.js || echo $R/inject_base.js ) $R/$s/inject.js
cd $R/tools; LLA_HTML=$3 nohup node harness6.js $R/$s >> $R/$s/harness.log 2>&1 &
echo "$! harness $s" >> $R/pids.txt; echo $! > $R/$s/harness.pid
sleep 9; python3 $R/tools/d.py $s
