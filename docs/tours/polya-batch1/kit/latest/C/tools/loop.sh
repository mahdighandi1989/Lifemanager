#!/bin/bash
# loop.sh sid -> reuse manual (man/) or r12 answer while turn question unchanged; stop at first changed one
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round19C
for k in $(seq 1 30); do
  n=$(ls $1/ai/p*.json 2>/dev/null | sed 's/.*\/p//;s/.json//' | sort -n | tail -1)
  if [ -n "$n" ] && [ ! -f $1/ai/r$n.txt ]; then
    if [ -f man/$1/r$n.txt ]; then cp man/$1/r$n.txt $1/ai/r$n.txt; echo "$1 p$n manual" >> $1/loop.log
    elif python3 tools/tq.py $1 $n > $1/tq.txt; then python3 tools/r6.py $1 $n </dev/null >/dev/null; echo "$1 p$n reused" >> $1/loop.log; else echo "$1 p$n STOP"; cat $1/tq.txt | cut -c1-600; exit; fi
  fi
  tools/d.sh $1 >> $1/last.txt 2>&1
  n2=$(ls $1/ai/p*.json 2>/dev/null | sed 's/.*\/p//;s/.json//' | sort -n | tail -1)
  if [ -z "$n2" ] || [ -f $1/ai/r$n2.txt ]; then echo "$1 END (last p$n2)"; tail -n 2 $1/last.txt|cut -c1-200; exit; fi
done
