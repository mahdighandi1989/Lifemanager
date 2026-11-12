import sys,re
for l in sys.stdin:
    l=l.rstrip('\n')
    if l.startswith('===== p'): print(l[:60])
    elif l.startswith('#### NEW'): print(l[:700])
    elif l.startswith('#### NEXT'): print(l[:330])
    elif l.startswith('[سامانه — وارسی'): print(l[:400])
    elif 'MSG> sys' in l: print(l[:420])
    elif 'ERROR' in l or 'EXIT' in l or 'PLAN_DONE' in l or 'answered' in l: print(l[:80])
    elif '**یک** پرسش' in l or 'پرسشِ این نوبت همین است' in l or 'پیشنهادِ این نوبت' in l:
        m=re.search(r'«[^»]{12,}»',l[60:]); print('  Q:',(m.group(0) if m else l[:200])[:230])
    elif l.startswith('# ') and not l.startswith('# مربیِ حل') and not l.startswith('# پرونده‌های تمرینِ باز: هنوز'): print(l[:110])
    elif l.startswith('  - ') and ('نخستین بار' in l or 'حسابِ' in l or 'می‌خواند' in l or 'اصلاح' in l[:40]): print(l[:300])
