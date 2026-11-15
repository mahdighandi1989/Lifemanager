#!/bin/bash
# run27.sh SID : fresh start + replay + auto loop; waits until loop stops
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27A
bash $R/tools/go.sh $1; bash $R/tools/bg.sh $1 > /dev/null 2>&1
tail -n 25 $R/$1/drive.out | cut -c1-1200
