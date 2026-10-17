#!/bin/bash
# best.sh sid — start harness, dump look-back #lpBBest for every live problem + chat items, exit
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20D
s=$1; o=$(ls $R/$s/out/*.json|wc -l); for f in $R/$s/ctl/c*.json; do n=$(basename $f .json|tr -d c); [ $n -gt $o ] && rm $f; done
cd $R/tools && (nohup node harness5.js $R/$s >> $R/$s/harness.log 2>&1 &); sleep 8; cd $R
timeout 200 python3 tools/run.py $s "$(cat tools/best.js)" 2>&1 | grep -a "^EVAL:" > $R/$s/best.json
python3 tools/go.py $s '{"exit":true}' >/dev/null 2>&1
