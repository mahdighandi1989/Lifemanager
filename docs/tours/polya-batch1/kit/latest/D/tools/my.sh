#!/bin/bash
# my.sh sid N ansfile — answer pN with ansfile, continue replay, then resume loop2
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round15D
S=$1; N=$2; F=$3; K=$(ls $R/$S/ctl | wc -l)
OL=200 bash $R/tools/nx.sh $S $N $K $F 2>&1 | grep -a "STOPPED\|ERROR\|PENDING" | cut -c1-200
python3 $R/tools/loop2.py $S
