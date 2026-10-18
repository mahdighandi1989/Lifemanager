#!/bin/bash
# nx.sh SID N M [EXTRA] : answer then continue; print compact tail
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21A
python3 $R/tools/rx.py $1 $2 $3 "${4:-{\}}" > $R/$1/_rx.txt 2>&1 || { cat $R/$1/_rx.txt; exit 1; }
grep -m1 ANSWER $R/$1/_rx.txt | cut -c1-300
L=$(wc -l < $R/$1/auto.log)
python3 -u $R/tools/auto3.py $1 >> $R/$1/auto.log 2>&1; echo "EXIT $?" >> $R/$1/auto.log
tail -n +$((L+1)) $R/$1/auto.log | grep -v "^   BLK:\|^   NL: متنِ صفحه\|^   NL: - زمینه (نه پرسشِ دوم): در actions\|^   NL: حافظهٔ سشن" | cut -c1-${5:-1200}
