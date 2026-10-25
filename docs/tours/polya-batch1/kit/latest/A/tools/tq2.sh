#!/bin/bash
# tq2.sh SID N : print TQ-ish lines and live header of pN
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A
python3 - $1 $2 <<'PY'
import json,sys
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A'
u=json.load(open(f'{R}/{sys.argv[1]}/ai/p{sys.argv[2]}.json'))['user']
for l in u.split('\n'):
  if l.startswith('# مسئلهٔ زنده') or l.startswith('# مربیِ حل'): print('H>',l[:200])
  if ('پیشنهادِ این نوبت' in l or 'فقط **یک** پرسش' in l or 'همین پیام' in l or 'پرسشِ این نوبت همین' in l or 'کارِ پیشینِ تو:' in l) and len(l)<4000: print('>>',l[-500:])
PY
