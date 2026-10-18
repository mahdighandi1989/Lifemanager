#!/bin/bash
# man.sh sid N  (stdin json patch on r12 answer) -> save to man/ and continue loop in background
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21C
mkdir -p man/$1; python3 tools/r6.py $1 $2 $3 && cp $1/ai/r$2.txt man/$1/r$2.txt
(tools/loop.sh $1 > $1/loop.out 2>&1 &)
