#!/bin/bash
# go.sh sid... -> drive in parallel until all stop, then summarize
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20C
for s in "$@"; do tools/d.sh $s > $s/last.txt 2>&1 & done
wait
W=${W:-380} tools/st.sh "$@"
