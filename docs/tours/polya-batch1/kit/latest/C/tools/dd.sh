#!/bin/bash
# dd.sh sid... -> start d.sh unless a drive for sid is already running
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22C
for s in "$@"; do ps aux | grep -q "[d]rive.py $s " || (T=900 W=300 tools/d.sh $s > $s/last.txt 2>&1 &); done
