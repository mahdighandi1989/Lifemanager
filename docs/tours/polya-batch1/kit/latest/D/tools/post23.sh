#!/bin/bash
# post23.sh sid — post22 (dossiers, practice, mind) + route map per live problem + mind text + age prompt check
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25D
D=$R/$1; T=$R/tools
bash $T/post22.sh $1 > /dev/null 2>&1
grep '^dossier_lp' $D/out/_post.list | while read name id; do
  k=${name#dossier_lp}
  timeout 90 node $T/shot.js $D part_route_$k "(async()=>{APP.go('route','$id');await new Promise(r=>setTimeout(r,1500));const m=APP.ROUTE&&APP.ROUTE.model?APP.ROUTE.model('$id'):null;return document.getElementById('main').innerText+'\n\n=== MODEL ===\n'+JSON.stringify(m).slice(0,6000)})()" > /dev/null
done
ls $D/out | grep part_
