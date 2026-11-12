#!/bin/bash
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B; cd $B
for s in "$@"; do r=$(WAIT=600 bash tools/run.sh $s); echo "$r" >> chain.log; echo "$r" | grep -q ": END" || { echo "CHAIN STOP at $s" >> chain.log; exit 3; }; bash tools/fin.sh $s >> chain.log 2>&1; done; echo "CHAIN DONE" >> chain.log
