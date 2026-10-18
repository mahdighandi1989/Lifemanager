#!/bin/bash
# ab.sh SID N M 'EXTRA' : answer pN from old rM (+EXTRA, see rx.py) then continue loop in background → SID/loop.out
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24A
X=${4:-"{}"}
( bash $R/tools/nx.sh $1 $2 $3 "$X" > $R/$1/loop.out 2>&1; timeout 3000 bash $R/tools/loop.sh $1 >> $R/$1/loop.out 2>&1; echo "LOOPDONE" >> $R/$1/loop.out ) > /dev/null 2>&1 &
echo started
