#!/bin/bash
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20D
bash $B/tools/rerun.sh s34 ../round20D/s34 6
python3 $B/tools/subst.py $B/../round20D/s34/ai/p6.json $B/s34/ai/p6.json < $B/../round20D/s34/ai/r6.txt > $B/s34/r6sub.txt
bash $B/tools/my.sh s34 6 $B/s34/r6sub.txt
