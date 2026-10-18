#!/bin/bash
# start21.sh sid [plan] — fresh dir, start harness, drive
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21D
s=$1; python3 $R/tools/kill1.py $s; sleep 2; rm -rf $R/$s; mkdir -p $R/$s
cd $R/tools && (nohup node harness5.js $R/$s >> $R/$s/harness.log 2>&1 &); sleep 8
python3 $R/tools/drive21.py $s $2
