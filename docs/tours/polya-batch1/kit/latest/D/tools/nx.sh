#!/bin/bash
# nx.sh sid N k [file]  — answer AI call N (with round16D rN or given file), wait, continue replay from src k+1
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya
S=$1; N=$2; K=$3; F=${4:-${SRCD:-$B/round21D/$S}/ai/r$N.txt}
python3 $B/round21D/tools/ans.py $B/round21D/$S $N < $F
W=$(NM=${NM:-1} python3 $B/round21D/tools/go.py $B/round21D/$S --wait)
echo "$W" | cut -c1-${OL:-900}
if echo "$W" | grep -q PENDING_AI; then echo "STOPPED_AT_SRC $K (another AI call inside same step)"; exit; fi
$B/round21D/tools/cont.sh $S $((K+1))
