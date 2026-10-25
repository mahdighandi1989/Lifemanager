#!/bin/bash
# arm.sh sid days : insert+run a ctl that advances the clock, opens Today, and reports the loop entries, sys lines, Today lines
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25B; cd $B; s=$1; d=${2:-0}
python3 - "$d" <<'PY' | EL=4000 TMO=${TMO:-90} bash tools/ins.sh $s
import json,sys
d=sys.argv[1]
js=("(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));__adv(%s);APP.ASSIST.toggle(false);APP.go('today');await w(4000);APP.render();await w(3000);APP.go('today');await w(1500);"
 "const L=(APP.PRE.sysAll?APP.PRE.sysAll():[]).map(o=>({id:o.e.id,state:o.e.state,how:o.e.how,ruled:o.e.ruled,ask:o.e.ask&&{id:o.e.ask.id,fa:o.e.ask.fa},rejected:o.e.rejected,checks:(o.e.checks||[]).map(c=>c.reason||c)}));const s=APP.ASSIST.cur();"
 "let sh=null;try{sh=await APP.HOST.sheet('sh101');sh={status:sh.status,notes:sh.notes.slice(-2).map(n=>n.by+': '+n.text.slice(0,400))}}catch(e){}"
 "return JSON.stringify({sys:L,sheet:sh,msgs:(s.msgs||[]).filter(m=>m.role==='sys').slice(-3).map(m=>m.text),today:document.getElementById('main').innerText.split('\\n').filter(l=>/ابزار|برگه|🛎|⛔|⚠️|❓|⏸/.test(l)).slice(0,8)})})()") % d
print(json.dumps({'eval':js},ensure_ascii=False))
PY
