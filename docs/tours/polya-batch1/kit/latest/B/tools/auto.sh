#!/bin/bash
# auto.sh sid : loop: replay remaining ctl; on pending pN: if hook same as R8 -> reuse R8 rN; else stop & show diff
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round15B
cd $B; s=$1
pend(){ python3 - <<PY
import os
d='$s/ai'
ps=sorted(int(f[1:-5]) for f in os.listdir(d) if f.startswith('p') and f.endswith('.json')) if os.path.isdir(d) else []
print(next((n for n in ps if not os.path.exists(f'{d}/r{n}.txt')),''))
PY
}
for i in $(seq 1 80); do
  p=$(pend)
  if [ -n "$p" ]; then
    if tools/df.sh $s $p >/dev/null 2>&1; then echo "AUTO p$p reuse"; HL=300 tools/reuse.sh $s $p >/dev/null; continue
    else echo "##### DIFF p$p"; python3 tools/v.py $s $p; exit 3; fi
  fi
  off=$(cat $s/off.txt 2>/dev/null || echo 0); k=$(( $(ls $s/ctl | wc -l) + 1 - off )); n=$(ls ../round14B/$s/ctl | wc -l)
  if [ $k -gt $n ]; then echo "END ctl=$((k-1))"; exit 0; fi
  if [ -n "$STOPAT" ] && [ $k -ge $STOPAT ]; then echo "STOPAT $k"; exit 4; fi
  for id in $(grep -o 'pb_[a-z]_[a-z0-9]\{6,\}' ../round14B/$s/ctl/c$k.json | sort -u); do grep -q "^$id " $s/map.txt 2>/dev/null && continue; nid=$(cat $s/out/s*.json | grep -o 'pb_l_[a-z0-9]\{8,\}' | sort | uniq -c | sort -rn | head -1 | awk '{print $2}'); echo "MAP $id <- $nid"; [ -n "$nid" ] || { echo "NEEDMAP c$k $id"; exit 5; }; echo "$id $nid" >> $s/map.txt; done
  echo "##### c$k $(head -c 160 ../round14B/$s/ctl/c$k.json)"
  ELIM=600 tools/rp.sh $s $k | head -c ${HL:-600}; echo
done
