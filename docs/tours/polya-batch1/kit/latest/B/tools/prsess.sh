#!/bin/bash
# prsess.sh sid advDays "what" pct ok(1|0|"") : advance clock, open practice case, log session through the quick form; print case + Today lines
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20B; cd $B
python3 - "$@" > $1/c.json <<'PY'
import json,sys
s,adv,what,pct,ok=sys.argv[1:6]
js="""(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));if(%s)__adv(%s);APP.go('today');await w(900);const td=__fx.main(20000);const tl=td.split('\\n').filter(l=>/🧪|بازیابی|برگه|کدوم فرمول|تمرین/.test(l)).join(' ¦ ');
const c=APP.PR.cases()[0];APP.go('practice',c.id);await w(900);
if(%s){const q=document.querySelector('.prc-quick');const [wi,mi]=q.querySelectorAll('input');const sel=q.querySelector('select');__fx.set(wi,%s);__fx.set(mi,%s);__fx.set(sel,%s);q.querySelector('button').click();await w(900);}
const c2=APP.S.get(c.id);const m=__fx.main(6000);return 'TODAY: '+tl+'\\n### CASE state='+c2.state+' due='+c2.due+' reason='+c2.reason+' sess='+JSON.stringify((c2.sessions||[]).map(x=>[x.d,x.meas&&x.meas.pct,x.ok]))+' roles='+JSON.stringify(c2.roles)+' stable='+JSON.stringify(c2.stable)+'\\n### PAGE '+m.slice(m.indexOf('🧪 پروندهٔ تمرینِ باز'),m.indexOf('🧪 پروندهٔ تمرینِ باز')+900)})()"""%(adv,adv,'true' if what else 'false',json.dumps(what),json.dumps(pct),json.dumps(ok))
print(json.dumps({"eval":js}))
PY
python3 tools/step.py $1 $1/c.json > tmp_$1.txt; echo "exit=$?"; grep -v "^  \(user\|ai\|sys\):" tmp_$1.txt | head -40
