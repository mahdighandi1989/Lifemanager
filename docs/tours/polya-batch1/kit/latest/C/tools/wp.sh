#!/bin/bash
# wp.sh secs sids... -> wait until some sid has a pending prompt with no drive running (or all ended); print status of each
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23C
T=$1; shift; t0=$(date +%s)
st(){ s=$1; r=$(ps aux | grep "[d]rive.py $s " | wc -l); n=$(ls $s/ai/p*.json 2>/dev/null | sed 's/.*\/p//;s/.json//' | sort -n | tail -1); 
  if [ $r -gt 0 ]; then echo RUN; elif [ -n "$n" ] && [ ! -f $s/ai/r$n.txt ]; then echo "PEND$n"; else echo IDLE; fi; }
while [ $(( $(date +%s)-t0 )) -lt $T ]; do
  any=0; for s in "$@"; do x=$(st $s); case $x in PEND*) any=1;; IDLE) any=1;; esac; done
  [ $any = 1 ] && break; sleep 4
done
for s in "$@"; do echo "## $s $(st $s) ctl $(ls $s/ctl 2>/dev/null|wc -l)/$(ls src/$s/ctl|wc -l)"; done
