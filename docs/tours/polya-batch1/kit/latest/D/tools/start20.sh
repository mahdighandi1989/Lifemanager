#!/bin/bash
# start20.sh sid — fresh dir, start harness, drive plan (resumable: rerun drive20.py)
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20D
s=$1; python3 $R/tools/kill1.py $s >/dev/null; rm -rf $R/$s; mkdir -p $R/$s
cd $R/tools && (nohup node harness5.js $R/$s >> $R/$s/harness.log 2>&1 &); sleep 8
python3 $R/tools/drive20.py $s $R/$s.plan.json
