#!/bin/bash
# cq.sh sid — per live problem: title + liveChatQs options (look-back «کدام پرسش کمک کرد؟») + Today list at the end
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24D
timeout 90 node $R/tools/shot.js $R/$1 _cq "JSON.stringify(APP.liveAll().map(r=>({t:r.p.title,st:(APP.S.get('eprog_'+r.p.id)||{solve:{live:{}}}).solve.live.state,q:(APP.liveChatQs?APP.liveChatQs(r.p.id):[]).map(x=>typeof x==='string'?x:(x.q||x.text||JSON.stringify(x)))})),null,1)" >/dev/null; cat $R/$1/out/_cq.txt
