#!/bin/bash
# plus.sh sid : new prompt lines per answered turn (minus the common ones)
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24B; cd $B; s=$1
for f in $(ls $s/ai/p*.json | sed 's/.*p\([0-9]*\).json/\1/' | sort -n); do
  W=${W:-260} RL=0 python3 tools/show.py $s $f $(cat $s/src.txt) | grep -E "^=== |^\+ |^- |NO r20" | grep -v "هر تاریخی که کاربر می‌گوید\|^+ # وضعِ کنونی\|زمینه (نه پرسشِ دوم): مسئلهٔ گفت‌وگو «\|در actions یک {\"do\":\"coach_state\"\|زمینه (نه پرسشِ دوم): مسئلهٔ زنده «\|هنوز مسئله یا کارِ بازی در این سشن نیست"
done
