#!/bin/bash
# cont.sh sid k  — replay round14D/sid ctl from k to end into round14D/sid
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya
S=$1; K=$2; SD=${SRCD:-$B/round14D/$S}; N=$(ls $SD/ctl | wc -l)
OL=${OL:-900} python3 $B/round15D/tools/auto.py $B/round15D/$S $SD $K $N
