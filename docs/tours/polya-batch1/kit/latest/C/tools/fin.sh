#!/bin/bash
# fin.sh sid tag -> append final shots (lprob/dossier/mind/today/panel/session dossier) + exit
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22C
s=$1; t=$2
P="(window.__PID||localStorage.getItem('__PID')||(APP.liveAll().slice(-1)[0]||{p:{}}).p.id)"
python3 tools/nc.py $s raw "{\"shot\":{\"name\":\"${t}_lprob\",\"full\":true,\"js\":\"(()=>{const p=$P;APP.go('lprob',p);return p})()\"}}"
python3 tools/nc.py $s raw "{\"shot\":{\"name\":\"${t}_dossier\",\"full\":true,\"js\":\"(()=>{const p=$P;APP.go('dossier',p);return p})()\"}}"
python3 tools/nc.py $s raw "{\"shot\":{\"name\":\"${t}_mind\",\"view\":[\"mind\"],\"full\":true,\"js\":\"(()=>{document.querySelectorAll('details').forEach(d=>{if(/از کجا/.test(d.innerText.slice(0,40)))d.open=true});return 1})()\"}}"
python3 tools/nc.py $s raw "{\"shot\":{\"name\":\"${t}_today\",\"view\":[\"today\"],\"full\":true}}"
python3 tools/nc.py $s raw "{\"shot\":{\"name\":\"${t}_sessdossier\",\"full\":true,\"js\":\"(()=>{const s=APP.ASSIST.cur();APP.go('dossier',s.id);return s.id})()\"}}"
python3 tools/nc.py $s eval "(()=>document.querySelector('#main').innerText.slice(0,6000))()"
python3 tools/nc.py $s exit
