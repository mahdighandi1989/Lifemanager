#!/bin/bash
# a.sh sid  (stdin = r.py block) : build the reply and answer + resume
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B; cd $B
python3 tools/r.py $1 >/dev/null && bash tools/q.sh $1 a/$1_cur.json
