#!/bin/bash
# x.sh SID N M 'EXTRA' : answer pN from old rM merged with EXTRA, continue replay, then loop while equal
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A
bash $R/tools/nx.sh $1 $2 $3 "${4:-{\}}" 900 > /dev/null 2>&1
timeout 1500 bash $R/tools/loop.sh $1 2>&1 | cut -c1-${W:-1300} | grep -v "^  D @@\|^  D ---\|^  D +++"
