#!/bin/bash
# say.sh sid 'text' [adv] : send a turn in bg; wait until a pending AI call or the ctl result exists; print pending prompt summary
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24B; cd $B; s=$1
n=$(ls $s/ctl | grep -c '^c[0-9]*.json$'); k=$((n+1))
(TMO=600 bash tools/turn.sh $s "$2" ${3:-0} > /dev/null 2>&1 &)
for i in $(seq 1 100); do sleep 2; p=$(python3 -c "
import sys;sys.path.insert(0,'tools');from drvlib import pending;print(pending('$B/$s') or '')"); [ -n "$p" ] && { echo "PENDING p$p"; exit 0; }; [ -f $s/out/s$k.json ] && { echo "DONE c$k"; exit 0; }; done; echo TIMEOUT
