#!/bin/bash
# wait until some scenario stopped (no drive running) with a pending prompt, or all idle; max $1 s
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22C
t0=$(date +%s)
while [ $(( $(date +%s)-t0 )) -lt ${1:-300} ]; do
  for s in s21 s22 s23 s24 s25 s26 s27 s28 s29; do
    [ -d $s/ai ] || continue
    r=$(ps aux | grep "[d]rive.py $s " | wc -l); [ $r -gt 0 ] && continue
    n=$(ls $s/ai/p*.json 2>/dev/null | sed 's/.*\/p//;s/.json//' | sort -n | tail -1)
    [ -n "$n" ] && [ ! -f $s/ai/r$n.txt ] && { echo "PENDING $s p$n"; exit; }
  done
  sleep 5
done
echo timeout
