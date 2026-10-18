#!/bin/bash
# post21.sh sid — after EXIT: full-page settled shots + texts: dossiers (each live problem + each session), mind «از کجا», practice cases
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22D
D=$R/$1; T=$R/tools
n=$(timeout 60 node $T/shot.js $D _probe "JSON.stringify({lp:APP.liveAll().map(r=>r.p.id),ss:APP.S.all('achat').map(s=>s.id),prc:APP.PR.cases().map(c=>c.id)})" | sed 's/^shot _probe //')
echo "$n"
python3 - "$n" > $D/out/_post.list <<'PY'
import json,sys
o=json.loads(sys.argv[1])
for i,p in enumerate(o['lp']): print('dossier_lp%d'%(i+1),p)
for i,p in enumerate(o['ss']): print('dossier_ss%d'%(i+1),p)
for i,p in enumerate(o['prc']): print('practice_%d'%(i+1),p)
PY
while read name id; do
  if [[ $name == practice_* ]]; then js="(async()=>{APP.go('practice','$id');await new Promise(r=>setTimeout(r,1200));return document.getElementById('main').innerText})()"; 
  else js="(async()=>{APP.go('dossier','$id');await new Promise(r=>setTimeout(r,1500));return document.getElementById('main').innerText})()"; fi
  timeout 90 node $T/shot.js $D part_$name "$js" > /dev/null
done < $D/out/_post.list
timeout 90 node $T/shot.js $D part_mind_from "(async()=>{APP.go('mind');await new Promise(r=>setTimeout(r,1200));document.querySelectorAll('details').forEach(d=>d.open=true);await new Promise(r=>setTimeout(r,400));return document.getElementById('main').innerText})()" >/dev/null
ls $D/out | grep part_
