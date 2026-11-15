#!/bin/bash
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27D
for s in "$@"; do V=$(cat $R/$s.startv 2>/dev/null || echo base); echo "=== $s $V $(date +%T)"
  if [ -f $R/$s.src ]; then export SRCSID=$(cat $R/$s.src); else unset SRCSID; fi
  START_HTML="file://$R/build/lla_$V.html" BATCH=1 timeout 1500 $R/tools/run27b.sh $s | tail -2; done
echo BATCH_DONE
