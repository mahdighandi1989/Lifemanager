#!/bin/bash
# kill.sh SID : stop ONLY my harness for SID (by recorded PID) and its own child processes
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A
P=$(cat $R/$1/pid 2>/dev/null); [ -z "$P" ] && { echo "no pid"; exit 0; }
kids() { for c in $(pgrep -P $1); do kids $c; echo $c; done; }
K=$(kids $P); kill $P $K 2>/dev/null; sleep 2; kill -9 $P $K 2>/dev/null; echo "killed $P $K" | cut -c1-200
