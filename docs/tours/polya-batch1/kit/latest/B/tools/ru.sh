#!/bin/bash
# ru.sh sid n : reuse R10 answer n then continue
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round15B
cd $B; HL=200 tools/reuse.sh $1 $2 >/dev/null; tools/go2.sh $1
