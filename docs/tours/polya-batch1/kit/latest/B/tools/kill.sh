#!/bin/bash
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B
for f in $B/$1/pid.txt $B/$1/dpid.txt; do [ -f $f ] && { p=$(cat $f); grep -q "^$p " $B/pids.txt && kill -9 $p 2>/dev/null; }; done; true
