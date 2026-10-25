#!/bin/bash
# re2.sh sid [patch-json] -> reuse the mapped r22 reply for the pending turn (remap keys if needed; else w.py with patch), then drive in background
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C
s=$1; n=$(ls $s/ai/p*.json | sed 's/.*\/p//;s/.json//' | sort -n | tail -1)
[ -f $s/ai/r$n.txt ] && { echo "no pending in $s"; exit 1; }
m=$(python3 -c "import json;print(json.load(open('$s/drv.json'))['map'].get('$n',-1))")
P="${2:-}"
if [ -z "$P" ] && grep -q '"k": *"k' ../round24C/$s/ai/r$m.txt; then SRC=$m python3 tools/remap.py $s $n || exit 3
else [ -z "$P" ] && P='{}'; echo "$P" | python3 tools/w.py $s $n || exit 3; fi
(T=900 W=300 tools/d.sh $s > $s/last.txt 2>&1 &)
