#!/bin/bash
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C
for s in ${@:-s21 s22 s23 s24 s25 s26 s27 s28 s29 pC1 pC2 pC3 aC1 aC2 aC3 aC4 tC1 oC1 pwC1 pwC2}; do
  [ -d $s/ai ] || continue
  r=$(ps aux | grep "[d]rive.py $s " | wc -l); h=$(ps aux | grep "[h]arness6c.js" | grep -c "round25C/$s\$")
  n=$(ls $s/ai/p*.json 2>/dev/null | sed 's/.*\/p//;s/.json//' | sort -n | tail -1)
  pend=""; [ -n "$n" ] && [ ! -f $s/ai/r$n.txt ] && pend="PENDING p$n"
  c=$(ls $s/ctl 2>/dev/null | wc -l); sc=$(ls src/$s/ctl 2>/dev/null | wc -l)
  ex=""; [ -f $s/DONE ] && ex=DONE
  echo "$s drive=$r harness=$h ctl=$c/$sc $pend $ex"
done
