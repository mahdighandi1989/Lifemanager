#!/bin/bash
# st2.sh sid : create dir, ok flags, start harness5, run auto (stop before exit) in bg
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20B; cd $B; s=$1; src=${SRCS:-$s}
mkdir -p $s/aovr; for i in $(seq 1 30); do touch $s/aovr/ok$i; done; cp ../round19B/$src/inject.js $s/
n=$(ls ../round19B/$src/ctl | wc -l)
bash tools/start5.sh $B/$s > $s/pid.txt
sleep 6; STOPAT=$n SRCS=$src nohup tools/go2.sh $s > g_$s.txt 2>&1 &
echo "started $s $(cat $s/pid.txt) stopat=$n"
