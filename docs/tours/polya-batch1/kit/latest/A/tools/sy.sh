#!/bin/bash
# sy.sh SID 'text' [EVAL0] : send a chat message (optional eval0 first) and show the pending prompt compactly
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A
python3 -c "import json,sys;d={'say':sys.argv[1]};
if len(sys.argv)>2 and sys.argv[2]: d['eval0']=sys.argv[2]
print(json.dumps(d,ensure_ascii=False))" "$2" "$3" > $R/$1/_say.json
timeout 300 python3 $R/tools/d.py $1 send @$R/$1/_say.json > $R/$1/_send.txt 2>&1
grep -q "=== AI" $R/$1/_send.txt && python3 $R/tools/v.py $1 ${@:4} || { echo "NO NEW PROMPT"; grep "MSG\|ERROR\|OVERLAY" $R/$1/_send.txt | cut -c1-700; }
