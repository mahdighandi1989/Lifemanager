#!/bin/bash
# rr.sh sid... -> loop: pending with zero filtered diff and not in manual_<sid>.txt -> reuse r21; else print review and continue others; exit when all non-auto
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23C
t0=$(date +%s)
for _once in 1; do
  allblk=1; any=0
  for s in "$@"; do
    [ -d $s/ai ] || continue
    dr=$(ps aux | grep -c "[d]rive.py $s ")
    n=$(ls $s/ai/p*.json 2>/dev/null | sed 's/.*\/p//;s/.json//' | sort -n | tail -1)
    if [ $dr -gt 0 ] || [ -z "$n" ] || [ -f $s/ai/r$n.txt ]; then
      # running or done
      if [ $dr -gt 0 ]; then allblk=0; fi; continue; fi
    out=$(python3 tools/cv.py $s $n)
    turn=$(echo "$out" | sed -n 2p)
    man=0; [ -f manual_$s.txt ] && while read -r x; do [ -n "$x" ] && echo "$turn" | grep -qF "$x" && man=1; done < manual_$s.txt
    if echo "$out" | grep -q "^DIFF (0):" && [ $man = 0 ] && echo "$out" | grep -q "^R21:"; then
      tools/ok.sh $s $n >/dev/null; echo "auto $s p$n"; allblk=0
    else echo "BLOCK $s p$n"; fi
  done
  [ $allblk = 1 ] && break

done
