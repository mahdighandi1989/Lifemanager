# pv.py sid [N] -> new-scenario prompt view: task, turn, live block lines, coach Q lines, extra blocks heads
import json,re,sys,glob
s=sys.argv[1]; n=int(sys.argv[2]) if len(sys.argv)>2 else max(int(f.split('/p')[-1][:-5]) for f in glob.glob(s+'/ai/p*.json'))
j=json.load(open(f'{s}/ai/p{n}.json')); u=j['user']; print('=====',s,n,j['task'])
m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S); print('TURN:',m.group(1)[:500] if m else '')
SK=('نقشهٔ سامانه','# امروز','# سشن','برگه‌ها','گزارشِ وضع','صفحهٔ فعلی','گفت‌وگو تا','نوبتِ تازه','قاعدهٔ کوتاه','فرمول','پرونده‌های تمرین')
for pt in re.split(r'(?m)^(?=# )',u):
    h=pt.split('\n',1)[0]
    if not h.strip() or any(k in h for k in SK): continue
    print('##',h[:200])
    for l in pt.split('\n')[1:]:
        if not l.strip(): continue
        if any(l.startswith(x) for x in ('- قاعدهٔ سبک','- پرسش‌ها را مکانیکی','- **گزارشِ وضع','- زمینه (نه پرسشِ دوم): سکوت','- زمینه (نه پرسشِ دوم) — شیوهٔ','- گامِ کوچک','- زمینه (نه پرسشِ دوم): شکل','- زمینه (نه پرسشِ دوم): به تعریف','- حلی که در همین','- زمینه (نه پرسشِ دوم): ضمیرِ','- زمینه (نه پرسشِ دوم): ادعای','- ضرب‌المثل','- زمینه (نه پرسشِ دوم): در actions','ساعتِ یادآورها','- اگر کاربر برای موعد')): continue
        print('  ',l[:int(__import__('os').environ.get('W',700))])
