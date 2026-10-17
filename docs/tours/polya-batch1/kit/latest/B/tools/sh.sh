#!/bin/bash
# sh.sh sid N : show hook p N (filtered) + ids + round6 answer N
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya
cd $B/round16B; python3 tools/hk.py $1/ai/p$2.json ${W:-800} | grep -v "قاعدهٔ سبک\|پرسش‌ها را مکانیکی\|مهارتی عملی\|گامِ کوچک ارزش دارد\|^  > - شکل «\|به تعریف‌ها برگرد\|چهار مرحلهٔ حل در\|سکوت، «نمی‌دونم»"; python3 tools/ids.py $1/ai/p$2.json; echo "--- R7 r$2:"; cat $B/round15B/$1/ai/r$2.txt 2>/dev/null; echo
