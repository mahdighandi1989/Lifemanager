#!/bin/bash
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round18D
OL=300 bash $B/tools/cont.sh $1 1 | grep -a "STOPPED\|ERROR" | cut -c1-200
python3 $B/tools/loop2.py $1
