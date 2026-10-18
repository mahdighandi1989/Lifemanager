#!/bin/bash
# v2.sh sid -> last pending digest (filtered)
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21C
awk '/^### AI p/{buf=""} {buf=buf"\n"$0} END{print buf}' $1/last.txt | grep -E "^(### AI|TURN|MAP|!!!|--- DIFF|   [-+]|R6 ANSWER|\(no r6)" | grep -v -E "^   [-+]$" | grep -v "ساعتِ یادآورها\|اگر کاربر برای موعد\|coach_state\",…} با این\|^   +# وضعِ کنونی\|ضرب‌المثلِ همین\|^   [-+]# مسئلهٔ حل‌شدهٔ مرتبط" | cut -c1-${W:-700}
