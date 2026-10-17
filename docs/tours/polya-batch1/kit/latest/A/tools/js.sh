#!/bin/bash
# js.sh SID [eval|eval0]  (JS from stdin) ; optional SAY env
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20A
K=${2:-eval}; T=$(mktemp -p $R)
python3 -c "import json,sys,os;d={sys.argv[1]:sys.stdin.read()};s=os.environ.get('SAY');
if s: d['say']=s
print(json.dumps(d,ensure_ascii=False))" $K > $T
python3 $R/tools/d.py $1 send @$T | python3 -c "import sys;t=sys.stdin.read();i=t.find('VIEW:');print(t if i<0 else t[:i][:4000])"; rm -f $T
