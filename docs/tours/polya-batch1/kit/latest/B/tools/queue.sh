#!/bin/bash
# queue.sh "sid:src ..." : keep <=4 of my runs active; cleanup profile when done
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round18B; cd $B
act(){ n=0; for g in g_*.txt; do grep -q "^rc=" $g || n=$((n+1)); done; echo $n; }
for item in "$@"; do s=${item%%:*}; src=${item#*:}; [ "$src" = "$item" ] && src=$s
  while [ $(act) -ge 4 ]; do sleep 10; for g in g_*.txt; do grep -q "^rc=" $g && { x=${g#g_}; x=${x%.txt}; [ -d $x/profile ] && ! pgrep -f "harness5.js $B/$x\$" >/dev/null && rm -rf $x/profile; }; done; done
  SRCS=$src tools/st.sh $s; sleep 5
done
while [ $(act) -gt 0 ]; do sleep 10; done
for d in */profile; do x=${d%/profile}; pgrep -f "harness5.js $B/$x\$" >/dev/null || rm -rf $d; done
echo ALLDONE
