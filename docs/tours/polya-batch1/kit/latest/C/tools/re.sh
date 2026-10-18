#!/bin/bash
# re.sh sid N [omit] -> reuse round7 answer N then continue driving; prints condensed tail
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22C
python3 tools/r6.py $1 $2 $3 </dev/null
tools/d.sh $1 > $1/last.txt 2>&1; cut -c1-${W:-500} $1/last.txt | grep -v "^   AUTO" | tail -${N:-45}
