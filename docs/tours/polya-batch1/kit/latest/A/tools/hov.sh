#!/bin/bash
# hov.sh SID IDX SHOTNAME : hover (mouseenter) route point #IDX, print tip, shoot
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23A
bash $R/tools/e.sh $1 "(()=>{const g=[...document.querySelectorAll('.rt-pt')];const x=g[$2];if(!x)return 'NO PT of '+g.length;x.dispatchEvent(new MouseEvent('mouseenter'));const t=document.querySelector('.rt-tip');t&&t.scrollIntoView({block:'center'});return g.length+' pts | '+x.getAttribute('aria-label')+' || TIP: '+(t?t.innerText:'')})()"
echo "{\"shot\":{\"name\":\"$3\",\"sel\":\".rt-tip\"}}" | bash $R/tools/s.sh $1 > /dev/null
