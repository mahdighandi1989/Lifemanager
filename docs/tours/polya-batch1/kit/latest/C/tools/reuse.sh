#!/bin/bash
# reuse.sh sid... -> answer each pending prompt with round11 rN (if exists), then drive all in parallel, wait, summarize
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23C
for s in "$@"; do n=$(ls $s/ai/p*.json | sed 's/.*\/p//;s/.json//' | sort -n | tail -1); [ -f $s/ai/r$n.txt ] || python3 tools/r6.py $s $n </dev/null; done
