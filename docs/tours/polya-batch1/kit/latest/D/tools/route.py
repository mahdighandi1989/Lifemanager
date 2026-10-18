#!/usr/bin/env python3
# route.py sid — per AI call: task, headers that matter, last user turn
import sys,json,glob,re,os
D='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21D/'+sys.argv[1]
H=[('LIVE','# مسئلهٔ زندهٔ این سشن'),('TEACH','# معلمِ حلِ مسئله'),('LBQ','# پاسخ به پرسشِ بازنگری'),('TASTE','# سلیقه برای بازنگریِ'),('RET','# اصلاحِ پیامِ'),('RETRES','# اصلاحی که صفحه'),('OPEN','# مسئلهٔ واقعیِ حل‌نشده'),('REL','# مسئلهٔ حل‌شدهٔ مرتبط'),('FAIL','# پس از شکست'),('COACH','# مربیِ حل'),('PRC','# پرونده‌های تمرینِ باز'),('NOW','# وضعِ کنونی'),('TOUR','# تور')]
fs=sorted(glob.glob(D+'/ai/p*.json'),key=lambda f:int(re.findall(r'\d+',os.path.basename(f))[0]))
for f in fs:
    p=json.load(open(f)); u=p['user']; n=re.findall(r'\d+',os.path.basename(f))[0]
    last=u.split('# نوبتِ تازه')[-1].strip().replace('\n',' ')
    hs=[k for k,h in H if h in u]
    m=re.search(r'# مربیِ حل[^\n]*مرحلهٔ محتمل: ([^·\n]*)·?([^\n—]*)',u)
    kind=(m.group(2).strip()[:30] if m else '')
    print(f"p{n}\t{p.get('task')}\t{','.join(hs)}\t{kind}\t{last[:110]}")
