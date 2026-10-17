#!/bin/bash
# say.sh dir 'text' — send chat message (no wait for AI)
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round15D
python3 $B/tools/go.py $B/$1 "$(python3 -c 'import json,sys;print(json.dumps({"say":sys.argv[1]},ensure_ascii=False))' "$2")" | grep -a "PENDING\|MSG\|ERROR" | cut -c1-300
