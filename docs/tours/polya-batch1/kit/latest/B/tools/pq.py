#!/usr/bin/env python3
"""pq.py sid [n] : compact prompt view for answering as the model"""
import json,sys,os,re
sys.path.insert(0,os.path.dirname(__file__))
from drvlib import keyhash, pending
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B'
s=sys.argv[1]; D=f'{B}/{s}'
n=int(sys.argv[2]) if len(sys.argv)>2 else pending(D)
if not n: print('no pending'); sys.exit()
d=json.load(open(f'{D}/ai/p{n}.json')); u=d['user']
BL=int(os.environ.get('BL','1400')); W=int(os.environ.get('W','520'))
print(f'=== {s} p{n} task={d.get("task")} len={len(u)}')
STD=('# مرحلهٔ خطا از حرفِ خودش','# امروز','# سنجشِ استاندارد','# نقشهٔ سامانه','# صفحهٔ فعلی','# دانسته‌های قلمرو','# کارنامهٔ ذهن','# سشن','# برگه‌های بازِ','# فرمول','# پرونده‌های تمرینِ باز','# فهرست‌های جاری','# 🧭 نقشهٔ مسیرِ','# مربیِ حل','# 🔭 مسئلهٔ حل‌نشدهٔ','# گزارشِ وضع','# گفت‌وگو تا این لحظه','# نوبتِ تازه','# موعدهای کاربر','# غربالِ لایه‌ها','# مخاطب','# پیش‌نیاز (کمبود')
FULL=os.environ.get('FULL','').split(',') if os.environ.get('FULL') else []
heads=[]
for p in re.split(r'(?m)^(?=# )',u):
    hd=p.split('\n',1)[0]
    if not hd.startswith('# '): continue
    heads.append(hd[:40])
    if hd.startswith('# امروز'): print('TODAY:',p.split('\n')[1][:28])
    if any(hd.startswith('# '+f) for f in FULL): print(p[:6000]); continue
    if hd.startswith('# مربیِ حل'):
        print(hd[:200])
        for l in p.split('\n'):
            if 'پرسشِ این نوبت همین' in l or 'فقط **یک** پرسش' in l or 'پیشنهادِ این نوبت' in l:
                i=l.find('پیشنهادِ این نوبت'); print('  TQ:',(l[i:] if i>=0 and 'پرسشِ این نوبت همین' not in l else l)[:W])
        continue
    if hd.startswith(STD): continue
    print(p.strip()[:BL].replace('ساعتِ یادآورها: ۹ (پیش‌فرض)','').split('- اگر کاربر برای موعد ساعت هم گفت')[0]); print('--')
i=u.find('# گفت‌وگو تا این لحظه'); j=u.rfind('# نوبتِ تازه')
c=int(os.environ.get('CONV','0'))
if c: print('CONV TAIL:', u[i:j][-c:].strip())
print(u[j:][:int(os.environ.get('TL','3000'))])
if os.environ.get('HEADS'): print('HEADS:',' | '.join(heads))
