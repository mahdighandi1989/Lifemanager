#!/bin/bash
# probe.sh sid — clean unprocessed ctl, start harness, cq + best probes, exit
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21D
s=$1; o=$(ls $R/$s/out/*.json|wc -l); for f in $R/$s/ctl/c*.json; do n=$(basename $f .json|tr -d c); [ $n -gt $o ] && rm $f; done
cd $R/tools && (nohup node harness5.js $R/$s >> $R/$s/harness.log 2>&1 &); sleep 8; cd $R
CQ='(()=>{const o={};o.p=APP.liveAll().map(r=>({id:r.p.id,sess:r.sess,cr:r.created,t:r.p.title.slice(0,40),q:APP.liveChatQs(r.p.id)}));o.s=APP.S.all("achat",()=>true).map(se=>({id:se.id,lp:se.lprob,lpAt:se.lprobAt,log:se.lprobLog,m:(se.msgs||[]).map((m,i)=>i+":"+m.role+":"+String(m.at||"").slice(0,19)+":"+(m.actions||[]).join(",")+":"+String(m.text||""))}));return JSON.stringify(o)})()'
timeout 200 python3 tools/run.py $s "$CQ" 2>&1 | grep -a "^EVAL:" > $R/$s/cq.json
timeout 200 python3 tools/run.py $s "$(cat tools/best.js)" 2>&1 | grep -a "^EVAL:" > $R/$s/best.json
timeout 100 python3 tools/go.py $s '{"exit":true}' >/dev/null 2>&1
ls -la $R/$s/cq.json $R/$s/best.json
