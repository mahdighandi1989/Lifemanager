#!/bin/bash
# ans.sh SID N 'EXTRAJSON' : fresh answer (no old) for pN, then wait for next AI/ctl result; prints compact output
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23A
python3 $R/tools/rx.py $1 $2 0 "$3" 2>&1 | grep -v "^   BLK\|^   NL" | cut -c1-${4:-1500} | tail -${5:-30}
