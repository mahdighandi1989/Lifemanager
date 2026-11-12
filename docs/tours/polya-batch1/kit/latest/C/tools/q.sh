#!/bin/bash
# q.sh sid N [maxsteps] (stdin short JSON) -> build full reply, write, drive on
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26C
cd $R; python3 tools/q.py $1 $2 > /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/q26c_$1.json || { echo BADQ; exit 1; }
tools/a.sh $1 $2 $3 < /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/q26c_$1.json 2>&1 | grep -v -E '^\[(برگه‌ها)\] \(هیچ' | cut -c1-${C:-700}
