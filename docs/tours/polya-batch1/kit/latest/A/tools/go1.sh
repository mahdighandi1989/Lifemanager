#!/bin/bash
# go1.sh SID N M ['EXTRA'] : answer pN from old rM (+EXTRA) and continue replay+loop, all in background
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A
X=${4:-"{}"}
( echo "---- go1 p$2<-r$3 $(date +%T)" >> $R/$1/drive.out; timeout 3000 bash $R/tools/nx.sh $1 $2 $3 "$X" >> $R/$1/nx.out 2>&1; timeout 3000 bash $R/tools/bg.sh $1 > /dev/null 2>&1 ) > /dev/null 2>&1 &
echo "go1 $1 p$2"
