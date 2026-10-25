#!/bin/bash
# an.sh sid — post-run analysis bundle into <sid>/analysis.txt (post23 shots, cq lists, sys-line diff vs r23, eval diff, routing, strict scan)
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25D; s=$1; T=$R/tools
bash $T/post23.sh $s >/dev/null 2>&1
{ echo "## CQ"; bash $T/cq.sh $s; echo; echo "## SYSDIFF"; SRC=${SRCSID:-$s} python3 $T/cmpsys.py $s | grep -A8 DIFF | cut -c1-600
  echo "## EVALDIFF"; python3 $T/recdiff.py $s 2>/dev/null | grep -v "DIFF fields \[\]" | cut -c1-500 | head -80
  echo "## ROUTING"; python3 $T/rtab.py $s; echo "## STRICT"; LIVEOK=1 python3 $T/strict.py $R $s 2>&1 | tail -6; } > $R/$s/analysis.txt 2>&1
python3 $T/rtab.py $s > $R/$s/routing.md
wc -l $R/$s/analysis.txt
