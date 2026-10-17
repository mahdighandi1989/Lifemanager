#!/bin/bash
# finish.sh sid — stop the stalled replay chain, then probe (cq + best) with a fresh harness
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round16D
python3 $R/tools/kill1.py $1; sleep 2; bash $R/tools/probe.sh $1
