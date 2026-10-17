import json,sys,re
d=json.load(open(sys.argv[1]));u=d['user']
parts=re.split(r'(?m)^(?=# )',u)
for p in parts:
  hd=p.split('\n',1)[0]
  if hd.startswith('# نقشه') or hd.startswith('# صفحهٔ فعلی') or hd.startswith('# گفت‌وگو'): continue
  if hd.startswith('# نوبتِ تازه'): print(p[:700]); continue
  print(hd[:300])
  for l in p.split('\n')[1:]:
    if re.search(r'پیشنهادِ این نوبت|پرسشِ این نوبت|در این نوبت فقط|پلهٔ نردبان|قاب|یادگیرنده|🌱|^- [a-z]+_|نتیجه|روش|رد شد|خواستن|پیام‌های اخیر|^- ',l) and not re.search(r'^- (قاعدهٔ سبک|پرسش‌ها را مکانیکی|حلِ مسئله مهارتی|شکل «|گامِ کوچک|ادعای محلِ|سکوت،|حلی که در همین|پایانِ نردبان|اگر کاربر برای موعد)',l): print('  >',l[:600])
