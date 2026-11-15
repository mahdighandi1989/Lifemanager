#!/bin/bash
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27D
for s in "$@"; do echo "=== $s $(date +%T)"; BATCH=1 timeout 1500 $R/tools/run27b.sh $s | tail -2; done
echo BATCH_DONE
