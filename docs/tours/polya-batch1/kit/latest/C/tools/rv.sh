#!/bin/bash
# rv.sh sid -> last pending digest: turn, diff (filtered), r19 answer
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C
grep -E "AUTO" $1/last.txt | tail -3
awk '/^### AI p/{buf=""} {buf=buf"\n"$0} END{print buf}' $1/last.txt | grep -E "^(### AI|TURN|!!!|--- DIFF|   [-+]|R6 ANSWER|\(no r6)" | grep -v -E '^   [-+]- زمینه \(نه پرسشِ دوم\): (در actions یک|ضمیرِ گفت)' | cut -c1-${W:-600}
