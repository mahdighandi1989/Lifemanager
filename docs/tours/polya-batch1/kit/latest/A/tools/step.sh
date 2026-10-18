#!/bin/bash
# step.sh SID N [M] : answer pending pN with old rM (+ over_N.json), then run auto3 until next stop; print compact stop info
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22A
X="{}"; [ -f $R/$1/over_$2.json ] && X=$(cat $R/$1/over_$2.json)
python3 $R/tools/rx.py $1 $2 ${3:-$2} "$X" > $R/$1/_rx.txt 2>&1 || { tail -5 $R/$1/_rx.txt; exit 1; }
L=$(wc -l < $R/$1/auto.log)
STOPAT=${STOPAT:-} python3 -u $R/tools/auto3.py $1 >> $R/$1/auto.log 2>&1; echo "EXIT $?" >> $R/$1/auto.log
tail -n +$((L+1)) $R/$1/auto.log | grep -v "^   BLK:\|^   NL:\|^c[0-9]*:" | cut -c1-${4:-700}
