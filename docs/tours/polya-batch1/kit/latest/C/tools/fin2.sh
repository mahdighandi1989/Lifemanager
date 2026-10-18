#!/bin/bash
# fin2.sh sid -> append route shots (main/hover) + fin.sh final shots + exit, then drive
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23C
s=$1
python3 tools/rshot.py end ".rt-pt.rt-p-${2:-main}" | while read -r l; do python3 tools/nc.py $s raw "$l" >/dev/null; done
bash tools/fin.sh $s post >/dev/null
(T=900 W=300 tools/d.sh $s > $s/last.txt 2>&1 &)
