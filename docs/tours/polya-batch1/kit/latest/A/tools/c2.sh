#!/bin/bash
# c2.sh SID : continue replay (auto3) then loop, background → loop.out
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24A
( python3 -u $R/tools/auto3.py $1 >> $R/$1/auto.log 2>&1; echo "EXIT $?" >> $R/$1/auto.log; timeout 3000 bash $R/tools/loop.sh $1 > $R/$1/loop.out 2>&1; echo LOOPDONE >> $R/$1/loop.out ) > /dev/null 2>&1 &
echo cont
