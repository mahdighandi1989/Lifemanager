#!/bin/bash
# start.sh sid -> start my harness for that scenario, record PID
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26C
D=$R/$1; mkdir -p $D
cd $R
export NODE_PATH=/opt/node-tools/node_modules
nohup node $R/tools/h26c.js "$D" >> "$D/harness.log" 2>&1 &
P=$!
echo $P >> $R/pids.txt; echo $P > $D/harness.pid; echo started $P
