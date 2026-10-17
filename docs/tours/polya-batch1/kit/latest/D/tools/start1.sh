#!/bin/bash
# start1.sh sid — start harness for sid then replay round16D script with signature auto-accept
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20D
s=$1; mkdir -p $R/$s; cd $R/tools && (nohup node harness5.js $R/$s >> $R/$s/harness.log 2>&1 & echo $! >> $R/pids.txt; echo "$! $s" >> $R/pids_named.txt); sleep 10
bash $R/tools/first.sh $s
