#!/bin/bash
# mine2.sh sid srcctl srcans STOPAT : replay ctl from srcctl dir; answer from srcans
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20B; cd $B; s=$1; C=$2; A=$3
for i in $(seq 1 80); do
  p=$(python3 -c "
import os
d='$s/ai'
ps=sorted(int(f[1:-5]) for f in os.listdir(d) if f.startswith('p') and f.endswith('.json')) if os.path.isdir(d) else []
print(next((n for n in ps if not os.path.exists(f'{d}/r{n}.txt')),''))")
  if [ -n "$p" ]; then if [ -f $A/r$p.txt ]; then tools/ans.sh $s < $A/r$p.txt >/dev/null; echo "ans p$p"; continue; else echo "NOANS p$p"; exit 3; fi; fi
  k=$(( $(ls $s/ctl 2>/dev/null | wc -l) + 1 )); n=$(ls $C | wc -l)
  if [ $k -gt $n ] || [ $k -ge ${4:-999} ]; then echo "STOP k=$k"; exit 0; fi
  for id in $(grep -o 'pb_[a-z]_[a-z0-9]\{6,\}' $C/c$k.json | sort -u); do grep -q "^$id " $s/map.txt 2>/dev/null && continue
    nid=$(cat $s/out/s*.json | grep -o 'pb_l_[a-z0-9]\{8,\}' | sort | uniq -c | sort -rn | head -1 | awk '{print $2}'); echo "MAP $id <- $nid"; echo "$id $nid" >> $s/map.txt; done
  SRC=$C ELIM=200 tools/rp.sh $s $k | head -c 200; echo
done
