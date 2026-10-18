#!/bin/bash
# edit.sh SID MID FROM TO SHOTNAME : open ✏️ editor on her message MID, replace FROM->TO, shot (panel open), then save
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21A
J=$(sed "s/__MID__/$2/; s/__FROM__/$3/; s/__TO__/$4/" $R/tools/edit_open.js)
bash $R/tools/ev.sh $1 "$J" | grep EVAL
echo "{\"shot\":{\"name\":\"$5\",\"fold\":false}}" | bash $R/tools/s.sh $1 > /dev/null 2>&1
bash $R/tools/ev.sh $1 "(()=>{document.querySelector('.as-edsave').click();return 'saved'})()" | grep -v "^   " | head -30
