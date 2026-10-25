#!/bin/bash
# runall.sh sid — fresh run of a scenario: start harness6, drive25; restart (exit 4) => harness with v2 build; stops on NEED (exit 3)
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25D
s=$1; P=$R/$s.plan.json; L=$R/$s.run
if [ "$2" != "resume" ]; then python3 $R/tools/kill1.py $s >/dev/null; sleep 1; rm -rf $R/$s; mkdir -p $R/$s; : > $L; [ -f $R/$s.noshift ] || cp $R/inject_base.js $R/$s/inject.js;
  (cd $R/tools && LLA_HTML=$( [ -f $R/$s.html ] && cat $R/$s.html ) nohup node harness6.js $R/$s >> $R/$s/harness.log 2>&1 &); sleep 8; fi
while true; do
  python3 $R/tools/drive25.py $s $P >> $L 2>&1; rc=$?
  if [ $rc -eq 4 ]; then
    V=$(tail -1 $L | grep -o 'RESTART [a-z0-9_]*' | cut -d' ' -f2)
    pkill -9 -f "harness6.js $R/$s\$" ; sleep 3
    (cd $R/tools && LLA_HTML=file://$R/build/lla_$V.html nohup node harness6.js $R/$s >> $R/$s/harness.log 2>&1 &); sleep 10
    echo "$V" > $R/$s.html.cur; continue
  fi
  echo "RC $rc" >> $L; break
done
