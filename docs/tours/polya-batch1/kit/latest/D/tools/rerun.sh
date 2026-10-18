#!/bin/bash
# rerun.sh newdir srcdir upto  — replay srcdir ctl into newdir, answering pN with srcdir rN for N<upto (stops at p$upto)
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21D
D=$B/$1; S=$B/$2; U=$3; T=$(ls $S/ctl | wc -l); K=1
while true; do
  o=$(OL=300 python3 $B/tools/auto.py $D $S $K $T); echo "$o" | grep -a "STOPPED\|ERROR" | cut -c1-200
  k=$(echo "$o" | grep -ao "STOPPED_AT_SRC [0-9]*" | tail -1 | grep -o "[0-9]*")
  [ -z "$k" ] && { echo END; break; }
  while true; do
    N=$(python3 -c "
import glob,re,os
for f in sorted(glob.glob('$D/ai/p*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0])):
  n=re.findall(r'\d+',os.path.basename(f))[0]
  if not os.path.exists('$D/ai/r'+n+'.txt'): print(n); break")
    [ -z "$N" ] && break
    [ "$N" -ge "$U" ] && { echo "STOP at p$N"; exit; }
    python3 $B/tools/ans.py $D $N < $S/ai/r$N.txt >/dev/null
    w=$(python3 $B/tools/go.py $D --wait); echo "$w" | grep -q PENDING_AI || break
  done
  K=$((k+1))
done
