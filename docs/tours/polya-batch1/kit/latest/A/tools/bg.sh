#!/bin/bash
# bg.sh SID : run loop with STOPS/STOPM from SID/stops.env ; output in SID/drive.out
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23A
[ -f $R/$1/stops.env ] && . $R/$1/stops.env
export STOPS STOPM STOPCTL
echo "---- $(date +%T)" >> $R/$1/drive.out
timeout 3000 bash $R/tools/loop.sh $1 >> $R/$1/drive.out 2>&1
echo "LOOPDONE $1" >> $R/$1/drive.out
tail -c 2500 $R/$1/drive.out
