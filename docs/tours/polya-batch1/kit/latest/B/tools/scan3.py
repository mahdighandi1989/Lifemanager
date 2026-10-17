import json,re,sys,glob,os
files=[]
for d in sys.argv[1:]: files+=sorted(glob.glob(f'{d}/ai/p*.json'),key=lambda x:int(re.findall(r'p(\d+)\.json',x)[0]))
SKIPH=('# نقشهٔ سامانه','# دانسته‌های قلمرو','# صفحهٔ فعلی','# گفت‌وگو','# نوبتِ تازه','# امروز')
GEN=re.compile(r'^- (قاعدهٔ سبک|پرسش‌ها را مکانیکی|حلِ مسئله مهارتی|گامِ کوچک|ادعای محلِ بحث|سکوت،|چهار مرحلهٔ حل|سطحِ استقلال|پایانِ نردبان|\*\*گزارشِ وضع|حلی که در همین|شکل «|به تعریف‌ها|این گفت‌وگو به همین مسئله بسته|پرسشِ این نوبت: \*\*فقط\*\* همان|اگر حرفِ تازه‌اش|\*\*قابِ مربی|ضرب‌المثلِ همین مرحله|بازنگری مهم‌ترین|از کتاب برای همین مرحله|پاسخِ این مسئله را هیچ|این مسئله پاسخِ عینی)')
def norm(q): return re.sub(r'[\s«»؟?،:.—\-]','',q)
for f in files:
  d=json.load(open(f))
  if d.get('task')!='lla_assistant': continue
  u=d['user']; qs={}; extra=[]
  for p in re.split(r'(?m)^(?=# )',u):
    hd=p.split('\n',1)[0]
    if hd.startswith(SKIPH) or not hd.startswith('# '): continue
    for l in p.split('\n')[1:]:
      if not l.startswith('- ') or l.startswith('- زمینه (نه پرسشِ دوم)'): continue
      if l.startswith('- پرسش‌های'):
        m=re.search(r'پیشنهادِ این نوبت: «([^»]*)»',l)
        if m: qs.setdefault(norm(m.group(1)),[]).append('LIST: '+m.group(1)[:90])
        continue
      if GEN.match(l):
        # generic lines: still check for an embedded turn question inside (e.g. guess)
        m=re.search(r'پرسشِ این نوبت همین است[^«]*«([^»]*)»',l)
        if m: qs.setdefault(norm(m.group(1)),[]).append('GEN-TURN: '+m.group(1)[:90])
        if l.startswith('- در این نوبت فقط'): pass
        continue
      if l.startswith('- در این نوبت فقط **یک** پرسش'):
        m=re.search(r'\):\s*«([^»]*)»',l) or re.search(r'«([^»]*؟)»',l)
        if m: qs.setdefault(norm(m.group(1)),[]).append('LIVE1: '+m.group(1)[:90]); continue
      if re.search(r'بپرس|پرسشِ این نوبت',l):
        m=re.search(r'بپرس\s*[^«]{0,30}«([^»]*)»',l) or re.search(r'پرسشِ این نوبت[^«]*«([^»]*)»',l)
        key=norm(m.group(1)) if m else 'L:'+l[:40]
        qs.setdefault(key,[]).append(('Q: '+m.group(1)[:90]) if m else 'UNQ: '+hd[:20]+' | '+l[:150])
  # also: a LIVE1 present makes coach LIST irrelevant? keep raw
  if len(qs)>=2:
    print('##',f.split('round16B/')[-1],len(qs))
    for k,v in qs.items(): print('    ',v[0], ('x%d'%len(v) if len(v)>1 else ''))
