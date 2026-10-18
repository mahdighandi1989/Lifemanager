#!/bin/bash
# bgl.sh SID : run loop.sh in background, output to SID/loop.out
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23A
( timeout 3000 bash $R/tools/loop.sh $1 > $R/$1/loop.out 2>&1; echo "LOOPDONE" >> $R/$1/loop.out ) &
