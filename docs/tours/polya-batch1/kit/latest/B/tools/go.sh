#!/bin/bash
# go.sh sid : resume drv in bg
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22B; cd $B; s=$1
STOPAT=${STOPAT:-0} nohup python3 tools/drv.py $s $(cat $s/src.txt) > g_$s.txt 2>&1 &
