#!/bin/bash
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round18D
for s in s30 s31 s32 s33 s34 s35 s36 s37 s38; do n=$(ls $s/ai | grep -c '^p'); r=$(ls $s/ai | grep -c '^r'); echo "$s p=$n r=$r out=$(ls $s/out/*.json 2>/dev/null|wc -l)/src $(ls ../round18D/$s/ctl|wc -l) | $(tail -1 $s.run|cut -c1-120)"; done
