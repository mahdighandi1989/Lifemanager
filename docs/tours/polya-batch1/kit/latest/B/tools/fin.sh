#!/bin/bash
# fin.sh sid [adv] : after exit: post shots/text, then DONE marker is manual
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23B; cd $B
for i in $(seq 1 30); do pgrep -f "harness5.js $B/$1\$" >/dev/null || break; sleep 2; done
bash tools/kill.sh $1; node tools/post21.js $B/$1 ${2:-$(python3 tools/advsum.py $B/$1)} > $1/post.log 2>&1; cat $1/post.log
