#!/bin/bash
# co.sh SID : continue replay from pos (no pending prompt); show next prompt or END
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A
L=$(wc -l < $R/$1/auto.log)
python3 -u $R/tools/auto3.py $1 >> $R/$1/auto.log 2>&1; echo "EXIT $?" >> $R/$1/auto.log
tail -n +$((L+1)) $R/$1/auto.log | grep "^c[0-9]*: \|cannot map\|^END\|STOPCTL" | cut -c1-${CW:-170} | tail -${CT:-6}
N=$(ls $R/$1/ai | grep -c '^p'); [ -f $R/$1/ai/r$N.txt ] && { echo "no pending (last p$N) pos=$(cat $R/$1/pos)"; exit 0; }
python3 $R/tools/vv.py $1
