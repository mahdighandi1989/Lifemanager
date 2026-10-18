#!/bin/bash
# go.sh SID [STOPCTL]: fresh start + auto replay; log to SID/auto.log
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24A
bash $R/tools/start.sh $1 > /dev/null; sleep 12
STOPCTL=$2 python3 -u $R/tools/auto3.py $1 > $R/$1/auto.log 2>&1
echo "EXIT $?" >> $R/$1/auto.log
