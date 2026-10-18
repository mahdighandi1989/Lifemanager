#!/bin/bash
# r.sh SID N : answer pN with JSON from stdin (validated), print the page outcome
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24A
cat > $R/$1/ans_$2.json; python3 -c "import json;json.load(open('$R/$1/ans_$2.json'))" || { echo BADJSON; exit 1; }
timeout 300 python3 $R/tools/d.py $1 ans $2 @$R/$1/ans_$2.json > $R/$1/_ans.out 2>&1
N=$(ls $R/$1/ai | grep -c '^p'); if [ ! -f $R/$1/ai/r$N.txt ]; then echo "NEXT PROMPT p$N (follow-up)"; python3 $R/tools/vw.py $1 $N | grep -v "شیوهٔ همان یک پرسشِ نوبت\|^- گامِ کوچک ارزش\|^- ضرب‌المثلِ همین\|^- پرسش‌ها را مکانیکی\|^- \*\*گزارشِ وضع\|^- زمینه (نه پرسشِ دوم): سکوت\|^# نقشهٔ سامانه"; else grep -v "^VIEW" $R/$1/_ans.out | cut -c1-1500 | tail -12; fi
