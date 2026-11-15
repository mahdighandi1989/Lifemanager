#!/usr/bin/env python3
# tqr.py sid N.. — turn-question line(s) of pN + the reply given
import json,sys,re
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27D'
s=sys.argv[1]
for n in sys.argv[2:]:
    d=json.load(open(f'{B}/{s}/ai/p{n}.json')); u=d.get('sys','')+'\n'+d.get('user','')
    print(f'== p{n}')
    for l in u.split('\n'):
        if re.search(r'\*\*پرسشِ این نوبت|در این نوبت فقط \*\*یک\*\* پرسش',l): print('  TQ:',l[:600])
    try:
        a=json.loads(open(f'{B}/{s}/ai/r{n}.txt').read()); print('  R:',a.get('reply','')[:600]); print('  A:',json.dumps([x.get('do') for x in a.get('actions',[])],ensure_ascii=False))
    except Exception as e: print('  R?',e)
