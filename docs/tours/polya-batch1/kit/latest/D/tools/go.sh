#!/bin/bash
# go.sh sid — resume drive in background and wait (≤100s) for the next stop; prints new lines
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24D
s=$1; f=$R/$s.run; n=$(wc -l < $f 2>/dev/null || echo 0)
if ! pgrep -f "drive24.py $s " >/dev/null; then (python3 $R/tools/drive24.py $s $R/$s.plan.json >> $f 2>&1 &); fi
for i in $(seq 1 50); do sleep 2; if tail -n +$((n+1)) $f | grep -q "PLAN_DONE\|STOPPED\|NEED\|Traceback\|EXIT sent"; then break; fi; done
tail -n +$((n+1)) $f
