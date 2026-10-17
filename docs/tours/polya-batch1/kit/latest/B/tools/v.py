import json,re,sys,os
s,n=sys.argv[1],sys.argv[2]; W=int(os.environ.get('W','260'))
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
        out.append('  '+tag+' '+l[:W])
  i=u.rfind('# نوبتِ تازه'); out.append('USER: '+u[i+13:i+500].strip() if i>=0 else 'USER?')
  return out
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
old=lines(f'{B}/round14B/{s}/ai/p{n}.json') if os.path.exists(f'{B}/round14B/{s}/ai/p{n}.json') else ['(none)']
new=lines(f'{B}/round15B/{s}/ai/p{n}.json')
print('=== R10'); print('\n'.join(old)); print('=== R11'); print('\n'.join(new))
r=f'{B}/round14B/{s}/ai/r{n}.txt'
print('=== R10 answer'); print(open(r).read()[:int(os.environ.get('RA','1500'))] if os.path.exists(r) else '(none)')
