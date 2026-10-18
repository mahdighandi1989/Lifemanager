#!/bin/bash
# chatpage.sh sid — open each live problem page (after the run) and shoot the forms; text lines carrying «از گفت‌وگو» / «درست است؟»
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24D
n=$(cat $R/$1/out/_post.list 2>/dev/null | grep -c dossier_lp)
for i in $(seq 1 $n); do id=$(grep "^dossier_lp$i " $R/$1/out/_post.list | cut -d' ' -f2)
timeout 90 node $R/tools/shot.js $R/$1 part_lprob_$i "(async()=>{APP.go('lprob','$id');await new Promise(r=>setTimeout(r,1500));const m=document.getElementById('main');const x=[...m.querySelectorAll('*')].filter(e=>e.children.length<4&&/از گفت‌وگو/.test(e.textContent)).shift();if(x)x.scrollIntoView({block:'center'});return m.innerText.split('\n').filter(l=>/از گفت‌وگو|درست است|مرحله|پیش‌نویس/.test(l)).join(' || ').slice(0,3000)})()" > /dev/null
echo "== lp$i"; cat $R/$1/out/part_lprob_$i.txt | cut -c1-1500; echo; done
