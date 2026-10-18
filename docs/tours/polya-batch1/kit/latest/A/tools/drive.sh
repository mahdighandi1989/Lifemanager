#!/bin/bash
# drive.sh SID STOPCTL : fresh start + replay + auto-loop until a stop that needs me; writes SID/drive.out
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23A
bash $R/tools/go.sh $1 $2
timeout 3000 bash $R/tools/loop.sh $1 > $R/$1/drive.out 2>&1
echo DRIVE-DONE >> $R/$1/drive.out
