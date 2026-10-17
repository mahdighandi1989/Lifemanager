#!/bin/bash
# sh.sh sid N — compact hook view + round6 reply
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya
cd $B/round15D
python3 tools/hk2.py $1 $2 > /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/hk_$1_$2.txt
F=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/hk_$1_$2.txt
grep -E "^# (مسئلهٔ|مربیِ)" $F | cut -c1-330
grep -E "فقط \*\*یک\*\* پرسش|پیشنهادِ این نوبت|\[در گفت‌وگو|[ABCD][0-9]{3}\)|\(C[0-9]{3}|A[0-9]{3}\b|B[0-9]{3}\b|«حل شد» را تأیید" $F | grep -v "^   ·" | cut -c1-${W:-420}
sed -n '/# نوبتِ تازه/,$p' $F | head -5 | cut -c1-500
echo "--- r6:"; head -c ${R:-700} ../round14D/$1/ai/r$2.txt 2>/dev/null; echo
