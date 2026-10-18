#!/usr/bin/env python3
"""pv.py sid [n] : compact view of a prompt for answering: heads, key lines (TQ, state, coach header, live block, corrections, practice, prereq), conv tail, turn; prints keyhash"""
import json,sys,os,re
sys.path.insert(0,os.path.dirname(__file__))
from drvlib import keyhash, pending
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23B'
s=sys.argv[1]; D=f'{B}/{s}'
n=int(sys.argv[2]) if len(sys.argv)>2 else pending(D)
d=json.load(open(f'{D}/ai/p{n}.json')); u=d['user']
print(f'=== {s} p{n} task={d.get("task")} hash={keyhash(D,n)}')
print('HEADS:',' | '.join(l[:60] for l in u.split('\n') if l.startswith('# ')))
W=int(os.environ.get('W','700'))
keep=re.compile(r'پرسشِ این نوبت همین|فقط \*\*یک\*\* پرسش|پیشنهادِ این نوبت|^- پرسش‌های «|پیش‌نیاز|retract|اصلاح|^# وضعِ کنونی|مرحلهٔ محتمل|start_practice|بازنگری: اگر درسی|chat_solved|live_new|🔭')
sk=('# نقشهٔ سامانه','# صفحهٔ فعلی','# دانسته‌های قلمرو','# کارنامهٔ ذهن')
blk=None
for p in re.split(r'(?m)^(?=# )',u):
    hd=p.split('\n',1)[0]
    if hd.startswith(sk) or hd.startswith('# گفت‌وگو') or hd.startswith('# نوبتِ تازه'): continue
    for l in p.split('\n'):
        if keep.search(l): print('  ',l[:W])
for h in os.environ.get('BLK','').split(','):
    if h:
        i=u.find('# '+h); print(u[i:i+int(os.environ.get('BL','2500'))])
i=u.find('# گفت‌وگو تا این لحظه'); j=u.rfind('# نوبتِ تازه')
print('CONV TAIL:', u[i:j][-int(os.environ.get('CONV','1500')):])
print(u[j:])
