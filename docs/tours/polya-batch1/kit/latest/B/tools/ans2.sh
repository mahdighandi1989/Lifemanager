#!/bin/bash
# ans2.sh sid file : answer pending with file; wait for next pending or completion of last ctl
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24B; cd $B; s=$1
python3 tools/sv.py $s $2 || exit 1
k=$(ls $s/ctl | grep -c '^c[0-9]*.json$')
for i in $(seq 1 100); do sleep 2; p=$(python3 -c "
import sys;sys.path.insert(0,'tools');from drvlib import pending;print(pending('$B/$s') or '')"); [ -n "$p" ] && { echo "PENDING p$p"; exit 0; }; [ -f $s/out/s$k.json ] && { echo "DONE c$k"; exit 0; }; done; echo TIMEOUT
