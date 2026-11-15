#!/usr/bin/env python3
# blk.py SID N [heads...] : print blocks of pN user prompt whose header contains any of the given keys (default: key blocks)
import sys,json
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27A'
s,n=sys.argv[1:3]; keys=sys.argv[3:] or ['حسابِ صفحه','کارِ پیشین','پرسشِ این نوبت','اصلاح','تاریخ','پیش‌بینی','وضعِ کنونی','چند مسئله','مسئلهٔ زندهٔ']
p=json.load(open(f'{R}/{s}/ai/p{n}.json')); u=p['user']
print('task=',p.get('task'))
out=[];on=False
for l in u.split('\n'):
    if l.startswith('# '): on=any(k in l for k in keys)
    if on: out.append(l[:700])
print('\n'.join(out)[:int(sys.argv[0] and 6000)])
# also the coach turn question
for l in u.split('\n'):
    if 'پرسشِ این نوبت' in l or '**یک** پرسش' in l: print('TQ:',l[:500])
