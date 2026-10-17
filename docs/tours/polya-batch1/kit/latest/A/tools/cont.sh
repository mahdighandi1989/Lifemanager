#!/bin/bash
# cont.sh SID : continue auto replay from pos
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20A
python3 -u $R/tools/auto3.py $1 >> $R/$1/auto.log 2>&1; echo "EXIT $?" >> $R/$1/auto.log
tail -c ${2:-6000} $R/$1/auto.log
