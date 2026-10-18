#!/bin/bash
# ex.sh SID : graceful exit of my harness
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23A
timeout 60 python3 $R/tools/d.py $1 send "{\"exit\":true}" >/dev/null; sleep 3
ps aux | grep "round23A/$1" | grep -v grep | wc -l
