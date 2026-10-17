#!/bin/bash
# fin2.sh sid [adv] : exit + post (dossier etc.)
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20B; cd $B
echo '{"exit":true}' | TMO=60 python3 tools/step.py $1 - >/dev/null
for i in $(seq 1 30); do pgrep -f "harness5.js .*round20B/$1\$" >/dev/null || break; sleep 2; done
node tools/post.js $B/$1 ${2:-0} > $1/post.log 2>&1; cat $1/post.log
