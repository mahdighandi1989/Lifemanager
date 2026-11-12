#!/bin/bash
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B; cd $B; s=$1
STOPAT=${STOPAT:-0} nohup python3 tools/drv26bm.py $s $(cat $s/src.txt) > g_$s.txt 2>&1 &
echo $! > $s/dpid.txt; echo "$! drv $s" >> pids.txt
