#!/bin/bash
# clk.sh SID YYYY-MM-DD : set dev clock (independent of APP.today overrides), reload, print today
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22A
bash $R/tools/ev.sh $1 "(()=>{const t='$2';const d=new Date();const real=new Date(d.getFullYear(),d.getMonth(),d.getDate());const p=t.split('-');const off=Math.round((new Date(+p[0],+p[1]-1,+p[2])-real)/864e5);localStorage.setItem('lla.dev','1');localStorage.setItem('lla.clockOff',String(off));localStorage.removeItem('lla.clockParam');return off})()" >/dev/null
echo '{"reload":true}' | bash $R/tools/s.sh $1 >/dev/null
bash $R/tools/ev.sh $1 'APP.today()+" "+JSON.stringify(APP.clock.check())' | grep EVAL
