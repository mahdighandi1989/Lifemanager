#!/bin/bash
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B; cd $B
for i in $(seq 1 30); do kill -0 $(cat $1/pid.txt) 2>/dev/null || break; sleep 2; done
bash tools/kill.sh $1; node tools/post21.js $B/$1 ${2:-$(python3 tools/advsum.py $B/$1)} > $1/post.log 2>&1; tail -5 $1/post.log
