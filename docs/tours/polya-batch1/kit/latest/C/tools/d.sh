#!/bin/bash
# d.sh sid -> drive auto, condensed; restarts harness after an exit ctl
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round15C
for i in 1 2 3 4 5; do
  L=$1/drive_$(date +%s%N).log
  T0=${T:-900}
  # if the last out is an exit, restart the harness first
  last=$(ls $1/out/*.json 2>/dev/null | sed 's/.*\/s//;s/.json//' | sort -n | tail -1)
  if [ -n "$last" ] && grep -q '"exit":true' $1/out/s$last.json && ! ps aux | grep "[h]arness3.js" | grep -q "round15C/$1\$"; then bash tools/start.sh $1 >/dev/null; sleep 6; fi
  timeout $T0 python3 tools/drive.py $1 auto > $L 2>&1
  cut -c1-${W:-260} $L | grep -E "^(>>|###|---|   [-+]|R6|!!!|TURN|END|TIMEOUT|  (eval|error|log|stateError)|   MSG ai|   AUTO|    - )" | grep -v -E "^    - (پرسش‌های|سکوت|شکل «)"
  tail -1 $L | grep -q "TIMEOUT" || break
done
