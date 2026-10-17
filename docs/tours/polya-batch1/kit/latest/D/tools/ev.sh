#!/bin/bash
# ev.sh sid 'JS' — start harness on finished sid, eval JS (full result printed from out file), exit
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round18D
s=$1; o=$(ls $R/$s/out/s*.json|wc -l); for f in $R/$s/ctl/c*.json; do n=$(basename $f .json|tr -d c); [ $n -gt $o ] && rm $f; done
cd $R/tools && (nohup node harness5.js $R/$s >> $R/$s/harness.log 2>&1 &); sleep 8; cd $R
timeout 200 python3 tools/run.py $s "$2" >/dev/null 2>&1
n=$(ls $R/$s/ctl/c*.json | wc -l); python3 -c "import json;r=json.load(open('$R/$s/out/s$n.json'));print(r.get('eval') if 'eval' in r else 'ERR '+str(r.get('error'))[:500])"
timeout 100 python3 tools/go.py $s '{"exit":true}' >/dev/null 2>&1
