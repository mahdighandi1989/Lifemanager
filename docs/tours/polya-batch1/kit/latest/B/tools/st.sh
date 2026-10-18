#!/bin/bash
# st.sh sid [src] : fresh dir (keeps seq/akey/apatch/aovr/stop_*), start harness5, run drv in bg -> g_sid.txt
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24B; cd $B; s=$1; src=${2:-$s}
mkdir -p $s; cp ../round23B/$src/inject.js $s/ 2>/dev/null; [ -f $s/inject.js ] || cp tools/inject.js $s/; [ -f $s/inject.js ] || cp tools/inject.js $s/
echo $src > $s/src.txt
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad && nohup node harness5.js $B/$s >> $B/$s/harness.log 2>&1 &
echo $! > $B/$s/pid.txt; sleep 7; cd $B; STOPAT=${STOPAT:-0} nohup python3 tools/drv.py $s $src > g_$s.txt 2>&1 &
echo "started $s src=$src harness=$(cat $s/pid.txt)"
