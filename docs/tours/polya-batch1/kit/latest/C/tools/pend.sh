#!/bin/bash
# pend.sh -> for each scenario: progress; if waiting for an AI answer (no drive running): turn, diff, round-18 answer
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24C
for s in ${SIDS:-s21 s22 s23 s24 s25 s26 s27 s28 s29 pC1 pC2 pC3}; do
  [ -d $s/ai ] || continue
  n=$(ls $s/ai/p*.json 2>/dev/null | sed 's/.*\/p//;s/.json//' | sort -n | tail -1)
  dr=$(ps aux | grep -c "[d]rive.py $s ")
  echo "## $s p$n ctl $(ls $s/ctl | wc -l)/$(ls src/$s/ctl|wc -l) drive=$dr $( [ -n "$n" ] && [ ! -f $s/ai/r$n.txt ] && echo PENDING)"
  if [ -n "$n" ] && [ ! -f $s/ai/r$n.txt ] && [ $dr = 0 ]; then
    grep "TURN:" $s/last.txt | tail -1 | cut -c1-500
    tac $s/last.txt | sed -n '/R6 ANSWER/,/--- DIFF/p' | tac | grep -v "coach_state\",…} با این\|^   [-+]$\|اگر فرمول می‌نویسی\|^   [-+]# فرمول\|چهار مرحلهٔ حل در دادهٔ" | cut -c1-${W:-700}
    [ -f ../round23C/$s/ai/r$n.txt ] && python3 -c "
import json;d=json.load(open('../round23C/$s/ai/r$n.txt'));print('ACTS',[ (a.get('do'),{k:v for k,v in a.items() if k in ('guess','plan','defer','register','check','step','id')}) for a in d.get('actions',[])])"
  fi
  grep -E "^  error" $s/last.txt | tail -2 | cut -c1-200
done
