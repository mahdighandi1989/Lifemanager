#!/bin/bash
D=$(cd "$1" && pwd); cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/camp && nohup node /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C/tools/harness6c.js "$D" >> "$D/harness.log" 2>&1 &
echo started $!
