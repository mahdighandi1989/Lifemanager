#!/usr/bin/env python3
# sum.py sid — per assist prompt: turn text, SUG, turn-lines, live one-question, A-ids marked as turn
import sys,json,re,glob,os
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20D'
s=sys.argv[1]
for f in sorted(glob.glob(f'{B}/{s}/ai/p*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0])):
    p=json.load(open(f)); u=p['user']; n=os.path.basename(f)[:-5]
    if not p['sys'].startswith('تو «دستیار»'): print(f'## {n} NON-ASSIST task={p.get("task")}'); continue
    i=u.find('# نوبتِ تازه'); turn=u[i:].split('\n')[1] if i>=0 else ''
    print(f'## {n} U: {turn[:220]}')
    m=re.search(r'مرحلهٔ محتمل: ([^—\n]*)',u); print('   phase:',m.group(1)[:80] if m else None)
    for l in u.split('\n'):
        if l.startswith('- پرسش‌های «'):
            m=re.search(r'پیشنهادِ این نوبت: «(.*?)»\. ',l); print('   SUG:',(m.group(1) if m else '?')[:200])
        elif 'پرسشِ این نوبت همین است' in l: print('   TURN:',l[:int(os.environ.get('W','300'))])
        elif re.match(r'^- در این نوبت فقط \*\*یک\*\* پرسش',l): 
            q=re.findall(r'«[^»]*[؟?][^»]*»',l.split('. اگر با وضعِ')[0]); print('   LIVE1:',q[-1][:200] if q else l[:200])
    r=f'{B}/{s}/ai/r{n[1:]}.txt'
    if os.path.exists(r): print('   R:',open(r).read()[:int(os.environ.get('R','260'))].replace('\n',' '))
