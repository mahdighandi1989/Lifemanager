#!/bin/bash
# goc.sh SID : (after answering manually) continue replay + loop in background
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A
( [ -f $R/$1/stops.env ] && . $R/$1/stops.env; export STOPCTL; echo "---- goc $(date +%T)" >> $R/$1/drive.out; python3 -u $R/tools/auto3.py $1 >> $R/$1/auto.log 2>&1; echo "EXIT $?" >> $R/$1/auto.log; timeout 3000 bash $R/tools/bg.sh $1 > /dev/null 2>&1 ) > /dev/null 2>&1 &
echo "goc $1"
