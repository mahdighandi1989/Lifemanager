#!/bin/bash
# u.sh SID TEXT : user says TEXT; print the compact view of the new prompt
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24A
python3 -c "import json,sys;print(json.dumps({'say':sys.argv[1]},ensure_ascii=False))" "$2" > $R/$1/_say.json
timeout 300 python3 $R/tools/d.py $1 send @$R/$1/_say.json > $R/$1/_say.out 2>&1
N=$(ls $R/$1/ai | grep -c '^p'); [ -f $R/$1/ai/r$N.txt ] && { echo "no new prompt"; tail -20 $R/$1/_say.out; exit 0; }
python3 $R/tools/vw.py $1 $N | grep -v "شیوهٔ همان یک پرسشِ نوبت\|^- گامِ کوچک ارزش\|^- ضرب‌المثلِ همین\|^- پرسش‌ها را مکانیکی\|^- \*\*گزارشِ وضع\|^- زمینه (نه پرسشِ دوم): سکوت\|^# نقشهٔ سامانه"
