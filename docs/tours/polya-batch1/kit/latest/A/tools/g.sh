#!/bin/bash
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A
bash $R/tools/go.sh $1 > /dev/null 2>&1
timeout 3000 bash $R/tools/loop.sh $1 2>&1 | cut -c1-${W:-1300} | grep -v "^  D @@\|^  D ---\|^  D +++"
