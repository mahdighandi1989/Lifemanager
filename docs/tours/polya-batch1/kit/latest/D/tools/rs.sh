#!/bin/bash
# rs.sh sid vN — restart my harness for sid on scratch build vN (same profile), then continue driving
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26D
s=$1; kill -9 $(cat $R/$s/harness.pid) 2>/dev/null; sleep 2
cd $R/tools; LLA_HTML=$( [ "$2" = base ] && echo "" || echo file://$R/build/lla_$2.html ) nohup node harness6.js $R/$s >> $R/$s/harness.log 2>&1 &
echo "$! harness $s ($2)" >> $R/pids.txt; echo $! > $R/$s/harness.pid; echo "$2" > $R/$s/html.cur
sleep 9; python3 $R/tools/d.py $s
