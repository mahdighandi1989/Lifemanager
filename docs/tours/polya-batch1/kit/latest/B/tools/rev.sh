#!/bin/bash
# rev.sh sid : per answered turn: her msg, new/gone prompt lines (minus common), reply used
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25B; cd $B; s=$1
for f in $(ls $s/ai/p*.json | sed 's/.*p\([0-9]*\).json/\1/' | sort -n); do
  W=${W:-300} RL=0 python3 tools/show.py $s $f $(cat $s/src.txt) | grep -E "^=== |^TURN|^\+ |^- |NO r21" | grep -v "هر تاریخی که کاربر می‌گوید\|^+ # وضعِ کنونی\|زمینه (نه پرسشِ دوم): مسئلهٔ گفت‌وگو «\|در actions یک {\"do\":\"coach_state\"\|زمینه (نه پرسشِ دوم): مسئلهٔ زنده «\|هنوز مسئله یا کارِ بازی در این سشن نیست\|# فهرست‌های جاری\|جای هر نیاز: assumptions\|list_add\|list_update\|# پیش‌نیاز (کمبود\|زمینه (نه پرسشِ دوم): اگر حرفِ همین پیامش نشان\|سنِ کاربر نامعلوم\|تا آن وقت: زبانِ روشن\|^+ # مخاطب" | cut -c1-${W:-300}
  echo "  >> r$f: $(head -c ${RC:-400} $s/ai/r$f.txt)"
done
