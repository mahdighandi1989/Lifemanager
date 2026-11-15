#!/usr/bin/env python3
# pv27.py sid N [old] — her message, turn question, arithmetic/correction lines, block heads; and the reply given (old/ovr)
import json,sys,re,os
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,n=sys.argv[1],int(sys.argv[2]); W=int(os.environ.get('W','600'))
d=json.load(open(f'{B}/round27D/{s}/ai/p{n}.json')); u=d.get('user','')
print('TASK',d.get('task'))
tail=u.split('# نوبتِ تازه')[-1].strip()
print('HER:',tail[:1500])
for l in (d.get('sys','')+'\n'+u).split('\n'):
    if (re.search(r'\*\*پرسشِ این نوبت|^- زمینه \(نه پرسشِ دوم\): [✓✗؟]|نسنجیده|^# (اصلاح|بازسنجی|کارِ پیشین|حساب|وضعِ کنونی|تاریخ|پیش‌بینی)|📅|🎯|با عددِ پیشین|^سامانه:',l) or os.environ.get('GREP') and re.search(os.environ['GREP'],l)) and not l.startswith('# نوبتِ تازه'):
        print('  |',l[:W])
r=f'{B}/round27D/{s}/ai/r{n}.txt'
if os.path.exists(r): print('REPLY:',open(r).read()[:2500])
