import json,re,sys,os
W=int(os.environ.get('W','260'))
static=r"^- (سطحِ استقلال|زمینه \(نه پرسشِ دوم\) — شیوهٔ|قاعدهٔ سبک|پرسش‌ها را مکانیکی|حلِ مسئله مهارتی|گامِ کوچک|ادعای محلِ|سکوت،|چهار مرحلهٔ حل|زمینه \(نه پرسشِ دوم\): (شکل «|به تعریف‌ها|ادعای محلِ|چهار مرحلهٔ حل|سطحِ استقلال|حلِ مسئله مهارتی|قاعدهٔ سبک|پرسش‌ها را مکانیکی|گامِ کوچک|سکوت،)|شکل «|به تعریف‌ها)"
def lines(f):
  d=json.load(open(f)); u=d['user']; out=[]
  for p in re.split(r'(?m)^(?=# )',u):
    hd=p.split('\n',1)[0]
    if hd.startswith(('# مربیِ حل','# مسئلهٔ زنده','# مسئلهٔ واقعی','# پس از','# 🌱','# قابِ')) or 'مربی' in hd[:30] or 'مسئله' in hd[:20]:
      out.append('H '+hd[:150])
      for l in p.split('\n')[1:]:
        if not l.startswith('- ') or re.match(static,l): continue
        if l.startswith('- پرسش‌های'):
          m=re.search(r'پیشنهادِ این نوبت: «[^»]*»',l); out.append('  LIST '+(m.group(0) if m else l[-150:])); continue
        tag='CTX ' if 'زمینه (نه پرسشِ دوم)' in l[:40] else ('TURN' if 'پرسشِ این نوبت' in l[:60] else '??? ')
        if 'ضرب‌المثلِ همین مرحله' in l: l=l[:l.find('»')+1]
        if tag=='CTX ': l=l[:70]
        out.append('  '+tag+' '+l[:W])
  i=u.rfind('# نوبتِ تازه'); out.append('USER: '+u[i+13:i+500].strip() if i>=0 else 'USER?')
  return out

print('\n'.join(lines(sys.argv[1])))
