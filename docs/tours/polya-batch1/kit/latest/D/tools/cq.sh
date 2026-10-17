#!/bin/bash
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round18D
s=$1; cd $R/tools && (nohup node harness5.js $R/$s >> $R/$s/harness.log 2>&1 &); sleep 8; cd $R
timeout 200 python3 tools/run.py $s '(()=>{const o={};o.p=APP.liveAll().map(r=>({id:r.p.id,sess:r.sess,cr:r.created,t:r.p.title.slice(0,40),q:APP.liveChatQs(r.p.id)}));o.s=APP.S.all("achat",()=>true).map(se=>({id:se.id,lp:se.lprob,lpAt:se.lprobAt,m:(se.msgs||[]).map((m,i)=>i+":"+m.role+":"+String(m.at||"").slice(0,10)+":"+(m.actions||[]).join(",")+":"+(m.role==="ai"?String(m.text||"").slice(-160):String(m.text||"").slice(0,80)))}));return JSON.stringify(o)})()' 2>&1 | grep -a "^EVAL:" > $R/$s/cq.json
python3 tools/go.py $s '{"exit":true}' >/dev/null 2>&1
