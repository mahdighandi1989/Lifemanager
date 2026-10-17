#!/usr/bin/env python3
# tq.py sid N — turn-question lines + unmarked question directives, old (round16D) vs new (round16D)
import sys,json,re,os
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,N=sys.argv[1],sys.argv[2]
SKIP=r'فقط \*\*یک\*\* پرسش|پرسشِ این نوبت:|قاعدهٔ سبک|گزارشِ وضع|پرسش‌های همین مرحله|سطحِ استقلال|مکانیکی نخوان|ضرب‌المثلِ همین مرحله|^- پاسخِ این مسئله|^- مسئلهٔ عملی|این گفت‌وگو به همین|سکوت، «نمی‌دونم»|chat_solved|chat_invent'
def show(tag,path):
    if not os.path.exists(path): print(tag,'MISSING'); return
    p=json.load(open(path)); u=p['user']
    if not p['sys'].startswith('تو «دستیار»'): print(tag,'NON-ASSIST',p.get('task')); return
    i=u.find('# نوبتِ تازه'); 
    print(f'== {tag} TURN:',u[i:].split('\n')[1][:300] if i>=0 else '')
    for sec in re.split(r'\n(?=# )',u):
        h=sec.split('\n')[0]
        if not (h.startswith('# مربیِ حل') or h.startswith('# مسئلهٔ زندهٔ') or '🌱' in h): continue
        print('  H:',h[:200])
        for l in sec.split('\n'):
            if l.startswith('- پرسش‌های «'):
                m=re.search(r'پیشنهادِ این نوبت: «([^»]+)»',l); print('   SUG:',m.group(1) if m else None)
            elif re.search(r'پرسشِ این نوبت همین|فقط \*\*یک\*\* پرسش',l): print('   *',l[:int(os.environ.get('W','420'))])
            elif l.startswith('- ') and 'زمینه (نه پرسشِ دوم)' not in l and not re.search(SKIP,l) and re.search(r'بپرس|؟»|\?»|بخواه',l) and re.search(r'پولیا|[ABC]\d{3}',l):
                print('   UNMARKED:',l[:300])
SD=os.environ.get('SRCD',f'{B}/round19D/{s}'); show('OLD',f'{SD}/ai/p{N}.json'); show('NEW',f'{B}/round19D/{s}/ai/p{N}.json')
print('== R10 reply:',open(f'{SD}/ai/r{N}.txt').read()[:int(os.environ.get('R','700'))] if os.path.exists(f'{SD}/ai/r{N}.txt') else 'NONE')
