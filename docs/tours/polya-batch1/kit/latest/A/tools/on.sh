#!/bin/bash
# on.sh SID N [M] [EXTRA] : answer pN (old rM, over_N.json if no EXTRA) then loop
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21A
X=${4:-}; [ -z "$X" ] && { [ -f $R/$1/over_$2.json ] && X=$(cat $R/$1/over_$2.json) || X="{}"; }
bash $R/tools/nx.sh $1 $2 ${3:-$2} "$X" > /dev/null 2>&1
timeout 560 bash $R/tools/loop.sh $1 2>&1 | tail -${5:-22}
