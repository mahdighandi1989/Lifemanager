#!/bin/bash
# wt.sh [secs] -> run rr auto pass repeatedly; exit when some scenario BLOCKs or all idle
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23C
S="${SIDS:-s22 s23 s25 s29 pC1 pC2 pC3}"
t0=$(date +%s); sleep 8
while [ $(( $(date +%s)-t0 )) -lt ${1:-240} ]; do
  o=$(tools/rr.sh $S 2>/dev/null); echo "$o" | grep auto
  if echo "$o" | grep -q BLOCK; then echo "$o" | grep BLOCK; exit; fi
  run=$(ps aux | grep -c "[d]rive.py ")
  [ $run = 0 ] && { echo IDLE; exit; }
  sleep 4
done; echo TIMEOUT
