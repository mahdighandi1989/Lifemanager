#!/bin/bash
# fwd.sh SID K [STOPN] : answer up to K pending prompts with their matched old reply (from auto.log STOP lines); log TURN/TQ to SID/fwd.log
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27A
for k in $(seq 1 $2); do
  L=$(grep -n "##### STOP p\|^END$\|NO R10" $R/$1/auto.log | tail -1)
  echo "$L" | grep -q "STOP p" || { echo "END: $L"; break; }
  N=$(echo "$L" | sed -E 's/.*STOP p([0-9]+).*/\1/'); M=$(echo "$L" | sed -E 's/.*old r17 p([0-9]+).*/\1/')
  [ -f $R/$1/ai/r$N.txt ] && { echo "answered p$N"; break; }
  [ "$N" = "$3" ] && { echo "STOPN p$N"; break; }
  { echo "== p$N <- r$M"; W=300 python3 $R/tools/vv.py $1 $N | grep "^TQ\|^TURN\|LASTSYS\|  changed\|  ask\|  note\|✗\|؟ «"; } >> $R/$1/fwd.log
  bash $R/tools/nx.sh $1 $N $M > /dev/null 2>&1; echo "p$N<-r$M"
done
