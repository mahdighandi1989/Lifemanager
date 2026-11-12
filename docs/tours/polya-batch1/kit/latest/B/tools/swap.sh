#!/bin/bash
# swap.sh sid page.html basedays : restart the harness on a scratch copy of the page (same profile), base clock = basedays
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B; cd $B; s=$1
bash tools/kill.sh $s; sleep 2; echo $3 > $s/base.txt
if [ "$2" = "-" ]; then P=""; else P="file://$B/scratchpage/$2"; fi
PAGE=$P nohup node tools/harness26bm.js $B/$s >> $B/$s/harness.log 2>&1 &
echo $! > $B/$s/pid.txt; echo "$! harness $s" >> $B/pids.txt; sleep 9; echo "restarted $s on ${2} base=$3"
