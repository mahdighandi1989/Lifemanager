#!/bin/bash
# st.sh sid... -> pending prompt summary (turn, SUG, turn line, scan2, R11 reply)
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21C
for s in "$@"; do n=$(ls $s/ai/p*.json | sed 's/.*\/p//;s/.json//' | sort -n | tail -1); if [ -f $s/ai/r$n.txt ]; then echo "=== $s (no pending; last p$n)"; tail -3 $s/last.txt | cut -c1-200; continue; fi
python3 tools/q.py $s | cut -c1-${W:-420}; python3 tools/scan2.py $s $n | tail -n +2; echo; done
