#!/bin/bash
# sweep.sh SID TAG : reload, sweep, print sys entries + k23 msgs + Today; shoot Today
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A
echo '{"reload":true}' | bash $R/tools/s.sh $1 > /dev/null 2>&1
bash $R/tools/e.sh $1 '(()=>{APP.PRE.sysSweep(true);return "swept"})()' > /dev/null
bash $R/tools/e.sh $1 'JSON.stringify({sys:APP.PRE.sysAll().map(x=>[x.e.number,x.e.state,x.e.how||"",(x.e.checks||[]).slice(-2).map(c=>c.reason).join(" || "),x.e.ask?x.e.ask.fa:""]),msgs:APP.S.all("achat",x=>x&&x.msgs).flatMap(s=>s.msgs.filter(m=>m.k23)).map(m=>m.text).slice(-3),due:(APP.dueList()||[]).map(x=>x.txt).filter(t=>/برگه|ابزار/.test(t))},null,0)' 9000
echo "{\"eval\":\"APP.go('today')\"}" | bash $R/tools/s.sh $1 > /dev/null 2>&1
echo "{\"shot\":{\"name\":\"tA1_today_$2\",\"full\":true}}" | bash $R/tools/s.sh $1 > /dev/null 2>&1
