#!/bin/bash
# auto.sh sid : loop: replay remaining ctl; on pending pN: if hook same as R8 -> reuse R8 rN; else stop & show diff
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round19B
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
    if [ -f $s/apatch/p$p.json ]; then echo "##### PATCH p$p"; python3 tools/rd.py $s $p | head -60; python3 tools/patch.py $s $p | tools/ans.sh $s | head -c ${HL:-300}; echo; continue; fi
    if [ -f $s/aovr/r$p.txt ]; then echo "AUTO p$p OVR"; python3 -c "
import re,sys
t=open('$s/aovr/r$p.txt').read(); u=open('$s/ai/p$p.json').read(); m=re.search(r'pid\\\\?\":\\\\?\"(pb_l_[a-z0-9]+)',u)
print(t.replace('__PID__',m.group(1) if m else '__PID__'))" | tools/ans.sh $s | head -c ${HL:-300}; echo; continue; fi
    if [ ! -f $s/aovr/ok$p ] && grep -q '"do": *"\(chat_solved\|chat_invent\|live_new\|deadline\|remind\)"' ../round18B/${SRCS:-$s}/ai/r$p.txt; then echo "##### DIFF p$p (ACTION-REVIEW)"; python3 tools/rd.py $s $p; echo "=== R18 answer"; head -c 2500 ../round18B/${SRCS:-$s}/ai/r$p.txt; exit 3; fi
    if tools/df.sh $s $p >/dev/null 2>&1; then echo "AUTO p$p reuse"; HL=300 tools/reuse.sh $s $p >/dev/null; continue
    else echo "##### DIFF p$p"; python3 tools/rd.py $s $p; echo "=== R18 answer"; head -c 1500 ../round18B/${SRCS:-$s}/ai/r$p.txt; exit 3; fi
  fi
  off=$(cat $s/off.txt 2>/dev/null || echo 0); k=$(( $(ls $s/ctl | wc -l) + 1 - off )); n=$(ls ../round18B/${SRCS:-$s}/ctl | wc -l)
  if [ $k -gt $n ]; then echo "END ctl=$((k-1))"; exit 0; fi
  if [ -n "$STOPAT" ] && [ $k -ge $STOPAT ]; then echo "STOPAT $k"; exit 4; fi
  for id in $(grep -o 'pb_[a-z]_[a-z0-9]\{6,\}' ../round18B/${SRCS:-$s}/ctl/c$k.json | sort -u); do grep -q "^$id " $s/map.txt 2>/dev/null && continue; nid=$(cat $s/out/s*.json | grep -o 'pb_l_[a-z0-9]\{8,\}' | sort | uniq -c | sort -rn | head -1 | awk '{print $2}'); echo "MAP $id <- $nid"; [ -n "$nid" ] || { echo "NEEDMAP c$k $id"; exit 5; }; echo "$id $nid" >> $s/map.txt; done
  echo "##### c$k $(head -c 160 ../round18B/${SRCS:-$s}/ctl/c$k.json)"
  ELIM=600 tools/rp.sh $s $k | head -c ${HL:-600}; echo
done
