# pv.py sid N — key dynamic sections of prompt N + conversation tail + new turn
import json,sys,re,os
D='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25D/'+sys.argv[1]
p=json.load(open(f'{D}/ai/p{sys.argv[2]}.json')); u=p['user']; print('TASK',p.get('task'))
secs=re.split(r'\n(?=# )',u)
want=('# وضعِ کنونی','# مسئلهٔ زنده','# مسئلهٔ حل‌شده','# اصلاحی که صفحه انجام','# اصلاحی که صفحه نپذیرفت','# اصلاحِ پیامِ قبلی','# پرونده‌های تمرینِ باز','# پیام‌های اخیرِ صفحه','# موعدهای کاربر','# مربیِ حل','# مسئلهٔ واقعیِ','# مرحلهٔ خطا','# سلیقه','# برنامه','# قول','# عادت','# 🌱','# تور','# پیش‌نیاز','# وارسیِ','# پس از شکست','# ضمیر','# مخاطب','# فهرست‌های جاری','# سنجشِ استاندارد','# مسئلهٔ بازِ تو')
L=int(os.environ.get('BL','1400'))
for sc in secs:
    h=sc.split('\n')[0]
    if h.startswith('# گفت‌وگو'):
        print('#### CONV'); print(sc[-int(os.environ.get('CV','1500')):]); continue
    if any(h.startswith(w) for w in want):
        sc=re.sub(r'- همهٔ تکنیک‌ها[^\n]*','- [TECHS]',sc)
        sc=re.sub(r'- قاعدهٔ سبک[^\n]*\n|- پرسش‌ها را مکانیکی[^\n]*\n|- زمینه \(نه پرسشِ دوم\) — شیوهٔ همان[^\n]*\n|- \*\*گزارشِ وضع[^\n]*\n','',sc)
        print(sc[:L]); print('--')
    elif not any(h.startswith(x) for x in ('# نقشهٔ سامانه','# امروز','# سشن','# برگه','# صفحهٔ فعلی','# فرمول','# 🔭 مسئلهٔ حل‌نشده','# گزارشِ وضع','# نوبتِ تازه')): print('[other]',h[:100],len(sc))
print('#### NEW:',u.split('# نوبتِ تازه')[-1].strip()[:700])
