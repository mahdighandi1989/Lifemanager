#!/bin/bash
# wt.sh [secs] -> wait until no drive.py of round25C is running (all scenarios idle/pending) or timeout
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C
t0=$(date +%s); T=${1:-60}
until [ $(( $(date +%s)-t0 )) -ge $T ]; do
  n=0; for p in $(pgrep -f "python3 tools/drive.py"); do c=$(readlink /proc/$p/cwd 2>/dev/null); [ "$c" = "$(pwd)" ] && n=$((n+1)); done
  [ $n -eq 0 ] && break; sleep 3
done
