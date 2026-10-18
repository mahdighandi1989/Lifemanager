#!/bin/bash
# nx.sh [secs] -> wait for pendings, then cq for each pending sid (compact)
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24C
ALL=${SIDS:-s21 s22 s23 s24 s25 s26 s27 s28 s29 pC1 pC2 pC3}
tools/wp.sh ${1:-60} $ALL | tr '\n' ' '; echo
for s in $ALL; do r=$(ps aux | grep "[d]rive.py $s " | wc -l); n=$(ls $s/ai/p*.json 2>/dev/null | sed 's/.*\/p//;s/.json//' | sort -n | tail -1)
  if [ $r = 0 ] && [ -n "$n" ] && [ ! -f $s/ai/r$n.txt ]; then W=${W:-260} python3 tools/cq.py $s | grep -v "^ [NO]| - پرسش‌های «" ; grep -E "^!!!" $s/last.txt | tail -2; echo; fi; done
