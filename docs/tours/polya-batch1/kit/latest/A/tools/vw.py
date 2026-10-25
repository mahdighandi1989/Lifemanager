#!/usr/bin/env python3
# vw.py SID N [all] : compact but complete view of the decision-relevant blocks of pN
import json,sys,re
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A'
s,n=sys.argv[1],sys.argv[2]; full=len(sys.argv)>3
p=json.load(open(f'{R}/{s}/ai/p{n}.json')); u=p['user']
print('=== %s p%s task=%s'%(s,n,p.get('task')))
blocks=re.split(r'(?m)^(?=# )',u)
SKIP=('# نقشهٔ سامانه','# امروز','# برگه‌های باز','# پرونده‌های تمرینِ باز','# فهرست‌های جاری','# 🔭 مسئلهٔ حل‌نشدهٔ خودم (قاعدهٔ','# گزارشِ وضع','# صفحهٔ فعلی','# چه کسی مسئول','# قلمروها','# دانسته‌های قلمرو (')
heads=[b.split('\n')[0][:60] for b in blocks if b.startswith('# ')]
print('HEADS:',heads)
for b in blocks:
    h=b.split('\n')[0]
    if not b.startswith('# '): continue
    if h.startswith('# پیش‌نیاز (') and len(b.strip().split('\n'))<=2 and not full: print('# پیش‌نیاز: [rule only]'); continue
    if h.startswith('# گفت‌وگو تا این لحظه'):
        L=[l for l in b.split('\n')[1:] if l.strip()]
        print(h); print('\n'.join(x[:700] for x in L[-6:])); continue
    if h.startswith('# صفحهٔ فعلی'):
        L=b.split('\n'); print('\n'.join(x[:300] for x in L[:3]));
        for x in L:
            if x.startswith('- ') and ('lp' in x or 'k' in x[:6]): pass
        continue
    if h.startswith(SKIP) and not full: continue
    if h.startswith('# مربیِ حل') and not full:
        for l in b.split('\n'):
            if l.startswith('- پرسش‌های') or l.startswith('- ضرب‌المثل') or l.startswith('- گامِ کوچک') or 'شیوهٔ همان یک پرسشِ نوبت' in l: print(l[:160]+' …'); continue
            print(l[:1200])
        continue
    print(b.strip()[:3500] if not full else b.strip())
