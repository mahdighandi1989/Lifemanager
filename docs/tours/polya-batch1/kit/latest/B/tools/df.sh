#!/bin/bash
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya
cd $B/round20B; o=$(python3 tools/rd.py $1 $2 | grep -v '^USER:'); [ -z "$o" ] && echo "SAME-HOOK p$2"
