#!/bin/bash
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A
for s in "$@"; do tail -1 $R/$s/drive.out 2>/dev/null | grep -q "LOOPDONE\|FULLDONE" || continue; echo "======== $s"; L=$(grep -n "##### STOP p\|^END\|NO R10\|cannot map" $R/$s/auto.log | tail -1 | cut -d: -f1); sed -n "${L},\$p" $R/$s/auto.log | grep "STOP p\|^END\|NO R10\|cannot\|TURN\|NEWHEADS\|BLOCKS EQUAL\|OLD REPLY\|OLD ANSWER" | cut -c1-${W:-300}; N=$(ls $R/$s/ai | grep -c '^p'); [ -f $R/$s/ai/r$N.txt ] || python3 - $R/$s $N <<'PY'
import json,sys
u=json.load(open(f'{sys.argv[1]}/ai/p{sys.argv[2]}.json'))['user']
for l in u.split('\n'):
    if l.startswith('# مسئلهٔ زنده'): print('H>',l[:160])
    if 'فقط **یک** پرسش' in l or 'پرسشِ این نوبت همین' in l:
        i=l.find('): «'); print('TQ>',(l[i+3:] if i>0 else l)[:260]); break
for l in u.split('\n'):
    if 'کارِ پیشینِ تو:' in l: print('PR>',l[-120:])
PY
done
