#!/bin/bash
# ok.sh sid N [patch-json] -> write rN = round20 mapped reply (+w.py patch), then drive in background
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23C
m=$(python3 -c "import json;print(json.load(open('$1/drv.json'))['map'].get('$2',-1))")
P="${3:-}"; [ -z "$P" ] && P='{}'
echo "$P" | python3 -c "
import json,sys;p=json.loads(sys.stdin.read());
if 'new' not in p and 'src' not in p: p['src']=$m
print(json.dumps(p,ensure_ascii=False))" | python3 tools/w.py $1 $2
(T=900 W=300 tools/d.sh $1 > $1/last.txt 2>&1 &)
