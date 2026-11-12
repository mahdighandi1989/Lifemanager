#!/bin/bash
# df.sh sid [W] : compact new-vs-round25 prompt lines per turn (+ lines deduped across turns; - lines counted)
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B; cd $B; s=$1
for f in $(ls $s/ai/p*.json | sed 's/.*p\([0-9]*\).json/\1/' | sort -n); do
  W=2000 RL=0 python3 tools/show.py $s $f $(cat $s/src.txt) 2>/dev/null | grep -E "^=== |^\+ |^- |NO r2" 
done | python3 -c "
import sys,re
W=int('${2:-230}'); seen=set(); minus=0
SK=re.compile(r'هر تاریخی که کاربر می‌گوید|^\+ # وضعِ کنونی|مسئلهٔ گفت‌وگو «|\"do\":\"coach_state\"|مسئلهٔ زنده «|هنوز مسئله یا کارِ بازی|# فهرست‌های جاری|جای هر نیاز: assumptions|list_add|list_update|# پیش‌نیاز \(کمبود|اگر حرفِ همین پیامش نشان|سنِ کاربر نامعلوم|تا آن وقت: زبانِ روشن|^\+ # مخاطب|ایدهٔ این سشن|پرونده: case_')
for l in sys.stdin:
    l=l.rstrip()
    if l.startswith('==='):
        if minus: print('   (-%d lines gone)'%minus)
        minus=0; print(l[:60]); continue
    if l.startswith('- '): minus+=1; continue
    if SK.search(l): continue
    k=re.sub(r'\d+','N',l)[:120]
    if k in seen: print('   + (again) '+l[2:70]); continue
    seen.add(k); print('   '+l[:W])
if minus: print('   (-%d lines gone)'%minus)
"
