#!/bin/bash
# ok.sh sid [file] : answer pending (reuse R18 mapped, or file content) then continue auto in bg
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20B; cd $B; s=$1
p=$(python3 -c "
import os
d='$s/ai'
ps=sorted(int(f[1:-5]) for f in os.listdir(d) if f.startswith('p') and f.endswith('.json'))
print(next((n for n in ps if not os.path.exists(f'{d}/r{n}.txt')),''))")
if [ -n "$p" ]; then
 if [ -n "$2" ]; then tools/ans.sh $s < $2 | head -c 200; else HL=200 tools/reuse.sh $s $p; fi; echo
fi
STOPAT=$(ls ../round19B/${SRCS:-$s}/ctl | wc -l) SRCS=${SRCS:-$s} nohup tools/go2.sh $s > g_$s.txt 2>&1 &
echo cont $s
