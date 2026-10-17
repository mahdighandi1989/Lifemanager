#!/bin/bash
# vw.sh sid N — filtered diff vs round7 + turn text + r7 reply head
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round19D
echo "----- DIFF $1 p$2"
W=${W:-330} bash $B/tools/dd.sh $1 $2 | grep -av "pb_l_\|حافظهٔ سشن\|^---\|^[0-9,]*[acd][0-9,]*$\|سکوت، «نمی‌دونم»\|chat_solved\|achat_\|^[<>] دستیار:\|^[<>] کاربر:\|^[<>] *$"
echo "----- TURN"; python3 $B/tools/hk2.py $B/$1 $2 | sed -n '/# نوبتِ تازه/,$p' | head -4 | cut -c1-600
python3 $B/tools/hk2.py $B/$1 $2 | grep -ao "مرحلهٔ محتمل: [^—]*" | head -1
python3 $B/tools/hk2.py $B/$1 $2 | grep -ao "فقط \*\*یک\*\* پرسش.\{0,420\}" | head -1
echo "----- R7"; head -c ${R:-600} $B/../round19D/$1/ai/r$2.txt; echo
