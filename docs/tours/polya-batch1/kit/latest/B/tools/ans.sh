#!/bin/bash
# usage: ans.sh <sid>  (answer text on stdin)
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round16B
cd $B; cat > $1/ans_cur.txt; python3 tools/step.py $1 --answer $1/ans_cur.txt > tmp_$1.txt; echo "exit=$?"; cat tmp_$1.txt
