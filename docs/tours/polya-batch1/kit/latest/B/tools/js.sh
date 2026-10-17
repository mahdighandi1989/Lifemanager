#!/bin/bash
# usage: js.sh <sid> <jsfile> [key=eval]  -> wraps JS file into ctl and waits
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round16B
cd $B; python3 -c "import json,sys;print(json.dumps({sys.argv[2]:open(sys.argv[1]).read()}))" "$2" "${3:-eval}" > $1/c.json; python3 tools/step.py $1 $1/c.json > tmp_$1.txt; echo "exit=$?"; cat tmp_$1.txt
