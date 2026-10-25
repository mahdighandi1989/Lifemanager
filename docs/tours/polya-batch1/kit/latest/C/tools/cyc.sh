#!/bin/bash
# cyc.sh secs -> loop: autoacc all; stop when there is a MANUAL pending or timeout; print statuses
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C
ALL=${SIDS:-s21 s22 s23 s24 s25 s26 s27 s28 s29 pC1 pC2 pC3 aC1 aC2 aC3 aC4 tC1 oC1}
t0=$(date +%s)
while [ $(( $(date +%s)-t0 )) -lt ${1:-300} ]; do
  out=$(tools/autoacc.sh $ALL)
  echo "$out" | grep AUTOACC
  if echo "$out" | grep -q MANUAL; then echo "$out" | grep MANUAL; break; fi
  sleep 5
done
for s in $ALL; do [ -d $s ] || continue; r=$(ps aux | grep "[d]rive.py $s " | wc -l); n=$(ls $s/ai/p*.json 2>/dev/null | sed 's/.*\/p//;s/.json//' | sort -n | tail -1); st=IDLE; [ $r -gt 0 ] && st=RUN; [ -n "$n" ] && [ ! -f $s/ai/r$n.txt ] && [ $r = 0 ] && st=PEND$n; echo -n "$s:$st:$(ls $s/ctl 2>/dev/null|wc -l)/$(ls src/$s/ctl 2>/dev/null|wc -l) "; done; echo
