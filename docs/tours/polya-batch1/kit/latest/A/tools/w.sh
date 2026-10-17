#!/bin/bash
# w.sh SID : wait until auto.log ends with EXIT line (max 15 min), then print compact tail
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20A
for i in $(seq 1 450); do tail -1 $R/$1/auto.log 2>/dev/null | grep -q '^EXIT' && break; sleep 2; done
tail -n 40 $R/$1/auto.log | grep -v "^   BLK:\|^   NL: متنِ صفحه\|^   NL: - زمینه (نه پرسشِ دوم): در actions\|^   NL: حافظهٔ سشن" | cut -c1-${2:-900}
