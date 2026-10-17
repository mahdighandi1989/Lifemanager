#!/bin/bash
# sw.sh s.. : wait until any listed g_ file has rc=, then show all finished
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round16B; cd $B
t=0; until grep -l "^rc=" $(for s in "$@"; do echo g_$s.txt; done) >/dev/null 2>&1 || [ $t -gt 100 ]; do sleep 2; t=$((t+1)); done
for s in "$@"; do grep -q "^rc=" g_$s.txt 2>/dev/null || { echo "######## $s (running)"; continue; }; echo "######## $s"; cut -c1-${CW:-500} g_$s.txt | grep -v "^  ??? .*\(قابِ مربی\|این مسئله پاسخِ عینی\|از کتاب برای\|این گفت‌وگو به همین\|تعارف و دلداری\|حدس‌های رقیب\|گزارشِ وضع\|سطحِ استقلال\|حلی که در همین\|پایانِ نردبانِ سرنخ\|پاسخِ این مسئله را هیچ\)\|^  TURN - (زمینه، نه"; done
