import json,sys,re
d=json.load(open(sys.argv[1]));u=d['user']
want=sys.argv[2:] or ['# مسئلهٔ زنده','# مربیِ حل','# دانسته','# پیام‌های اخیر','# گفت‌وگو','# نوبتِ تازه','# مسئلهٔ حل‌شده','# تور']
parts=re.split(r'(?m)^(?=# )',u)
for p in parts:
  hd=p.split('\n',1)[0]
  if any(hd.startswith(w) for w in want):
    if hd.startswith('# مربیِ حل'):
      # drop static lines
      ls=[l for l in p.split('\n') if not re.match(r'- (قاعدهٔ سبک|پرسش‌ها را مکانیکی|حلِ مسئله مهارتی|شکل «|گامِ کوچک|ادعای محلِ|سکوت،)',l)]
      p='\n'.join(ls)
    if hd.startswith('# گفت‌وگو'): p=hd+'\n...'+p[-1200:]
    print(p[:5000])
