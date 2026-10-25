#!/bin/bash
# finish.sh SID DAY : dossiers (text+shot) for every live problem, clock jump to DAY + Today, mind shot, phases, exit, cleanup
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A; S=$1
P=$(bash $R/tools/ev.sh $S 'APP.liveAll().map(r=>r.p.id).join(" ")' | grep EVAL | sed 's/EVAL: //')
i=0; for p in $P; do i=$((i+1)); bash $R/tools/ev.sh $S "(()=>{APP.go('dossier','$p');const t=document.getElementById('main').innerText;return t.slice(t.indexOf('📜 پروندهٔ کامل · فقط'))})()" eval 20000 | grep -v "^wrote\|^===" > $R/$S/dossier_$i.txt; echo "{\"shot\":{\"name\":\"dossier_full_$i\",\"full\":true}}" | bash $R/tools/s.sh $S >/dev/null; done
if [ -n "$2" ]; then bash $R/tools/clk.sh $S $2; bash $R/tools/ev.sh $S '(()=>{APP.go("today");return JSON.stringify((APP.dueList()||[]).map(x=>x.txt+" | "+(x.sub||"")))})()' eval 4000 | grep EVAL > $R/$S/today_after.txt; echo '{"shot":{"name":"part_today_later","full":true}}' | bash $R/tools/s.sh $S >/dev/null; fi
bash $R/tools/ev.sh $S '(()=>{APP.go("mind");document.querySelectorAll("details").forEach(d=>{if(/از کجا/.test(d.textContent.slice(0,80)))d.open=true});const t=document.getElementById("main").innerText;const i=t.indexOf("بخشِ حل (پولیا)");const j=t.indexOf("⚫ نقطه");return t.slice(i,j+400)})()' eval 9000 | grep -v "^wrote\|^===" > $R/$S/mind_after.txt; echo '{"shot":{"name":"part_mind_from","full":true}}' | bash $R/tools/s.sh $S >/dev/null
bash $R/tools/fin.sh $S 2>&1 | head -1 | cut -c1-600
bash $R/tools/kill.sh $S >/dev/null 2>&1; rm -rf $R/$S/profile; echo FINISHED $S; ls $R/$S/dossier_*.txt
