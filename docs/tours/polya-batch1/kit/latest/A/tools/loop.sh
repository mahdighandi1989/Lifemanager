#!/bin/bash
# loop.sh SID : while the last stop is BLOCKS EQUAL with no new heads, answer with the old reply and continue
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20A
for k in $(seq 1 30); do
  L=$(grep -n "##### STOP\|^END$\|cannot map\|NO R10 match" $R/$1/auto.log | tail -1)
  echo "$L" | grep -q "STOP p" || { echo "LOOP-END: $L"; break; }
  N=$(echo "$L" | sed -E 's/.*STOP p([0-9]+).*/\1/'); M=$(echo "$L" | sed -E 's/.*old r17 p([0-9]+).*/\1/')
  [ -f $R/$1/ai/r$N.txt ] && { echo "already answered p$N"; break; }
  T=$(sed -n "$(echo "$L" | cut -d: -f1),\$p" $R/$1/auto.log)
  echo "$T" | grep -q "^BLOCKS EQUAL" && echo "$T" | grep -qE "^NEWHEADS: \[(.\# برنامه.u200c?ها?ی بازِ خودش \(شناسه.u200cها\).)?\]$" || { echo "LOOP-STOP at p$N (diff/newheads)"; echo "$T" | grep -v "^   BLK:\|^   NL:" | cut -c1-1200; break; }
  X="{}"; [ -f $R/$1/over_$N.json ] && X=$(cat $R/$1/over_$N.json); echo "auto p$N <- r$M $X" | cut -c1-200; bash $R/tools/nx.sh $1 $N $M "$X" > /dev/null 2>&1
done
