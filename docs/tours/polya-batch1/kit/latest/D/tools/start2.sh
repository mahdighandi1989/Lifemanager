#!/bin/bash
# start2.sh sid — fresh dir (keeps ovr/), start harness, drive, probe
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round18D
s=$1; mkdir -p $R/$s.ovr; python3 $R/tools/kill1.py $s >/dev/null; rm -rf $R/$s; mkdir -p $R/$s; cp -r $R/$s.ovr $R/$s/ovr
cd $R/tools && (nohup node harness5.js $R/$s >> $R/$s/harness.log 2>&1 &); sleep 8
python3 $R/tools/drive.py $s
sleep 1; python3 $R/tools/go.py $R/$s '{"exit":true}' >/dev/null 2>&1; sleep 3
bash $R/tools/probe.sh $s
