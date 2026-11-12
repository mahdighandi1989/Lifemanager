#!/bin/bash
# g2.sh SID : fresh start + replay until first AI prompt; show vv
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A
bash $R/tools/go.sh $1 > /dev/null 2>&1
grep "^c[0-9]*: \|cannot map\|^END" $R/$1/auto.log | cut -c1-170 | tail -4
python3 $R/tools/vv.py $1
