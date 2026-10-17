#!/bin/bash
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20A
mkdir -p $R/$1/{ai,ctl,out}; cp $R/tools/inject.js $R/$1/inject.js
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/camp && nohup node $R/tools/harness6.js "$R/$1" >> "$R/$1/harness.log" 2>&1 &
echo started $!
