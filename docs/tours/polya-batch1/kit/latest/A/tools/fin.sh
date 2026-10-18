#!/bin/bash
# fin.sh SID : phases text then exit
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23A
python3 $R/tools/d.py $1 send @$R/ph.json | grep -A30 EVAL | head -40
echo '{"exit":true}' > $R/_ex.json; timeout 300 python3 $R/tools/d.py $1 send @$R/_ex.json | tail -1; sleep 4; ls $R/$1/out | grep -c view_post
