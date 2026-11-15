#!/bin/bash
# run27.sh sid [resume] — start harness6 (PID recorded), drive27; restart (exit 4) => kill recorded harness PID, start with build vN; stop on NEED (exit 3)
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27D
T0=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26D
s=$1; P=$R/$s.plan.json; L=$R/$s.run
start_h() { # $1 = html url or empty
  (cd $R/tools && LLA_HTML="$1" PROF=$R/profiles/$s nohup node harness6.js $R/$s >> $R/$s/harness.log 2>&1 & echo $! > $R/$s/harness.pid); sleep 1; echo "$(cat $R/$s/harness.pid) harness $s $(date +%T)" >> $R/pids.txt; sleep 9; }
stop_h() { [ -f $R/$s/harness.pid ] && kill $(cat $R/$s/harness.pid) 2>/dev/null; for i in $(seq 1 20); do B=$(ps -eo pid,args | grep "[c]hrome-headless-shell.real" | grep "user-data-dir=$R/profiles/$s " | awk '{print $1}'); [ -z "$B" ] && break; [ $i -ge 5 ] && { echo "$B browser-of-$s killed $(date +%T)" >> $R/pids.txt; kill -9 $B 2>/dev/null; }; sleep 1; done; sleep 1; }
if [ "$2" != "resume" ]; then stop_h; rm -rf $R/$s $R/profiles/$s; mkdir -p $R/$s $R/profiles; : > $L
  if [ -f $R/$s.inject.js ]; then cp $R/$s.inject.js $R/$s/inject.js; elif [ -f $T0/${SRCSID:-$s}/inject.js ]; then cp $T0/${SRCSID:-$s}/inject.js $R/$s/inject.js; fi
  start_h ""; fi
while true; do
  python3 $R/tools/drive27.py $s $P >> $L 2>&1; rc=$?
  if [ $rc -eq 4 ]; then
    V=$(tail -1 $L | grep -o 'RESTART [a-z0-9_]*' | cut -d' ' -f2)
    stop_h; start_h "file://$R/build/lla_$V.html"; echo "$V" > $R/$s.html.cur; continue
  fi
  echo "RC $rc" >> $L; break
done
tail -3 $L
