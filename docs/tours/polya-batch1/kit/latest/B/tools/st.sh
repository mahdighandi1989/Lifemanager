#!/bin/bash
# st.sh sid : create dir, start harness3, run auto (go2) in bg into g_sid.txt
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20B; cd $B; s=$1
mkdir -p $s; [ -d keep/${s}_aovr ] && cp -r keep/${s}_aovr $s/aovr; cp ../round19B/${SRCS:-$s}/inject.js $s/; [ -f ../round19B/${SRCS:-$s}/off.txt ] && cp ../round19B/${SRCS:-$s}/off.txt $s/
bash tools/start5.sh $B/$s > $s/pid.txt
sleep 6; nohup tools/go2.sh $s > g_$s.txt 2>&1 &
echo "started $s $(cat $s/pid.txt)"
