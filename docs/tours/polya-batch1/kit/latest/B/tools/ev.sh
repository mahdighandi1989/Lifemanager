#!/bin/bash
# ev.sh sid  (JS on stdin) -> eval
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round15B
cd $B; python3 -c "import json,sys;print(json.dumps({'eval':sys.stdin.read()}))" > $1/c.json; python3 tools/step.py $1 $1/c.json > tmp_$1.txt; echo "exit=$?"; cat tmp_$1.txt
