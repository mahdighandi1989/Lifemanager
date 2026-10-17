#!/bin/bash
# go2.sh sid N [file] — answer pN (old or file), continue replay, then loop2 (signature auto-accept)
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round16D
K=$(ls $B/$1/ctl | wc -l)
OL=200 bash $B/tools/nx.sh $1 $2 $K $3 2>&1 | grep -aE "ERROR|PENDING|STOPPED" | cut -c1-300
python3 $B/tools/loop2.py $1 2>&1
