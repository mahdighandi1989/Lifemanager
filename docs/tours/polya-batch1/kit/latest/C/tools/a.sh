#!/bin/bash
# a.sh sid N [patch-json|-]  -> write rN (patch on r16 rN, or reuse), save to man/, then drive in background
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C
mkdir -p man/$1
P="${3:-}"; [ -z "$P" ] && P='{}'
echo "$P" | python3 tools/patch.py $1 $2 ${4:-} && cp $1/ai/r$2.txt man/$1/r$2.txt
(T=900 W=300 tools/d.sh $1 > $1/last.txt 2>&1 &)
