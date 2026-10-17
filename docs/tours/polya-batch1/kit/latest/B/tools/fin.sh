#!/bin/bash
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round19B
cd $B && echo '{"exit":true}' | TMO=20 python3 tools/step.py $1 - >/dev/null; touch $1/ai/STOP; echo done $1
