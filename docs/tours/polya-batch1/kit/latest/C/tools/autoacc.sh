#!/bin/bash
# autoacc.sh sids... -> for each pending sid with no drive running: if acc.py ok => ok.sh; else print reason
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24C
for s in "$@"; do
  [ -d $s/ai ] || continue
  r=$(ps aux | grep "[d]rive.py $s " | wc -l); [ $r -gt 0 ] && continue
  n=$(ls $s/ai/p*.json 2>/dev/null | sed 's/.*\/p//;s/.json//' | sort -n | tail -1)
  [ -n "$n" ] && [ ! -f $s/ai/r$n.txt ] || continue
  why=$(python3 tools/acc.py $s); rc=$?
  if [ $rc = 0 ]; then tools/ok.sh $s $n >/dev/null; echo "AUTOACC $s p$n" | tee -a autoacc.log; else echo "MANUAL $s p$n: $why"; fi
done
