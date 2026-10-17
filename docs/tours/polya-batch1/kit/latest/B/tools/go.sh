#!/bin/bash
# usage: go.sh <sid> <ctl-json-or-file> : writes ctl and waits; prints compact
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round18B
cd $B; if [ -f "$2" ]; then python3 tools/step.py $1 "$2" > tmp_$1.txt; else echo "$2" | python3 tools/step.py $1 - > tmp_$1.txt; fi; echo "exit=$?"; cat tmp_$1.txt
