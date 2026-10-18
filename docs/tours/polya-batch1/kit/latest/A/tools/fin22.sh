#!/bin/bash
# fin21.sh SID : dossiers (every live problem + every session) text+full shot, mind «از کجا؟» text+shot, Today shot, exit, kill, remove profile
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23A; S=$1
P=$(bash $R/tools/ev.sh $S 'APP.S.all("eprob",r=>r&&r.live&&r.p).map(r=>r.p.id).join(" ")' | grep EVAL | sed 's/EVAL: //')
i=0; for p in $P; do i=$((i+1)); bash $R/tools/ev.sh $S "(()=>{APP.go('dossier','$p');const t=document.getElementById('main').innerText;return t.slice(t.indexOf('📜'))})()" eval 30000 | grep -v "^wrote\|^===" > $R/$S/dossier22_$i.txt; echo "{\"shot\":{\"name\":\"dossier22_full_$i\",\"full\":true}}" | bash $R/tools/s.sh $S >/dev/null 2>&1; done
Q=$(bash $R/tools/ev.sh $S 'APP.S.all("achat",x=>x&&x.msgs&&x.msgs.length).map(x=>x.id).join(" ")' | grep EVAL | sed 's/EVAL: //')
j=0; for q in $Q; do j=$((j+1)); bash $R/tools/ev.sh $S "(()=>{APP.go('dossier','$q');const t=document.getElementById('main').innerText;return t.slice(Math.max(0,t.indexOf('📜')))})()" eval 30000 | grep -v "^wrote\|^===" > $R/$S/dossier22_sess_$j.txt; echo "{\"shot\":{\"name\":\"dossier22_sess_$j\",\"full\":true}}" | bash $R/tools/s.sh $S >/dev/null 2>&1; done
bash $R/tools/ev.sh $S '(()=>{APP.go("mind");document.querySelectorAll("details").forEach(d=>{d.open=true});const t=document.getElementById("main").innerText;const i=t.indexOf("بخشِ حل (پولیا)");return t.slice(Math.max(0,i),i+9000)})()' eval 12000 | grep -v "^wrote\|^===" > $R/$S/mind22_after.txt; echo '{"shot":{"name":"part_mind22_from","full":true}}' | bash $R/tools/s.sh $S >/dev/null 2>&1
bash $R/tools/ev.sh $S '(()=>{APP.go("today");return APP.today()+"\n"+(APP.dueList()||[]).map(x=>x.txt+" | "+(x.sub||"")).join("\n")})()' eval 6000 | grep -v "^wrote\|^===" > $R/$S/today22_end.txt; echo '{"shot":{"name":"part_today22_end","full":true}}' | bash $R/tools/s.sh $S >/dev/null 2>&1
bash $R/tools/ev.sh $S '(()=>{try{return APP.MIND.phasesText()}catch(e){return "ERR "+e}})()' | grep EVAL > $R/$S/phases22.txt
echo '{"exit":true}' > $R/_ex.json; timeout 300 python3 $R/tools/d.py $S send @$R/_ex.json > /dev/null 2>&1; sleep 4
ls $R/$S/out | grep -c view_post
bash $R/tools/kill.sh $S >/dev/null 2>&1; rm -rf $R/$S/profile; touch $R/$S/DONE; echo FINISHED $S; ls $R/$S/dossier22_*.txt
