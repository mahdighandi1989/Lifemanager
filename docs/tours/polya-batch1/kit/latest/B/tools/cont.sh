#!/bin/bash
# cont.sh sid stopat [n] : (reuse R17 answer n) and continue auto in bg
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round18B; cd $B
[ -n "$3" ] && HL=200 tools/reuse.sh $1 $3 >/dev/null
STOPAT=$2 nohup tools/go2.sh $1 > g_$1.txt 2>&1 &
