#!/bin/bash
# g.sh sid N 'json' -> write reply and continue driving in background
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24C
echo "${3:-{\}}" | python3 tools/w.py $1 $2 && (T=900 W=300 tools/d.sh $1 > $1/last.txt 2>&1 &)
