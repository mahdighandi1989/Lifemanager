#!/bin/bash
# ev.sh sid DAY 'js' — run js (async ok) with page clock at real+DAY days (day.py patch) ; prints eval
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20D
D=$(python3 $R/tools/day.py $2 | python3 -c "import json,sys;print(json.load(sys.stdin)['eval0'])")
python3 - "$R/$1" "$D" "$3" <<'PY'
import json,sys,subprocess
d,e0,js=sys.argv[1:4]
setf=open('/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20D/tools/setf.js').read()
c={'eval0':setf+'\n;'+e0,'eval':js}
out=subprocess.run(['python3','/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20D/tools/go.py',d,json.dumps(c)],capture_output=True,text=True).stdout
for l in out.split('\n'):
    if l.startswith(('EVAL:','ERROR','EVAL0','PENDING','STEP')): print(l[:4000])
PY
