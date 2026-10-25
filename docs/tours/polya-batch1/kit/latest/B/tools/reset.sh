#!/bin/bash
# reset.sh sid : kill and wipe run state but keep plan/answers
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25B; cd $B; s=$1
bash tools/kill.sh $s; sleep 1; rm -rf $s/ai $s/ctl $s/out $s/profile $s/sheets $s/mail $s/drive $s/amap.json $s/map.txt $s/drv.log $s/harness.log $s/diff $s/post.txt
