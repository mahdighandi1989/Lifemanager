import json,sys,re
s,n=sys.argv[1],sys.argv[2]
u=json.load(open(f'{s}/ai/p{n}.json'))['user']
i=u.find('\n# ',u.find('# برگه‌های باز')+5); j=u.find('# صفحهٔ فعلی')
for l in u[i:j].split('\n'):
    if l.startswith('# ') : print(l[:200]); continue
    if re.search(r'بپرس|پرسشِ این نوبت|\*\*یک\*\* پرسش|پیشنهادِ این نوبت|زمینه|بخواه|بازنگری',l):
        if 'پیشنهادِ این نوبت' in l and l.startswith('- پرسش‌های'): l='- [list]… '+l[l.find('پیشنهادِ این نوبت'):]
        print(l[:int(sys.argv[3]) if len(sys.argv)>3 else 500])
i=u.find('# نوبتِ تازه'); print(u[i:i+600])
