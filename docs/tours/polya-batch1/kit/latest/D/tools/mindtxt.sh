#!/bin/bash
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21D
timeout 90 node $R/tools/shot.js $R/$1 part_mind_from "(async()=>{APP.go('mind');await new Promise(r=>setTimeout(r,900));document.querySelectorAll('details').forEach(d=>d.open=true);const t=document.getElementById('main').innerText;const i=t.indexOf('🧩 چهار مرحله');const j=t.indexOf('🕸 نقشهٔ کاملِ ذهن');return t.slice(i,j)})()" >/dev/null; tr -s '\n' < $R/$1/out/part_mind_from.txt | grep -v "^پولیا حل را\|^این جدول روی\|^پرونده‌های تمرین\|^روندِ ماهانه\|^۰$\|^۵۰$\|^۱۰۰$"
