import json,glob,re,sys,os
B=sys.argv[1]
for s in sys.argv[2:]:
  for f in sorted(glob.glob(f'{B}/{s}/ai/p*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0])):
    p=json.load(open(f)); u=p['user']
    if not p['sys'].startswith('تو «دستیار»'): continue
    i=u.find('# نوبتِ تازه'); turn=u[i:i+200].split('\n')[1] if i>=0 else ''
    hits=[]
    for sec in re.split(r'\n(?=# )',u):
      h=sec.split('\n')[0]
      if not (h.startswith('# مربیِ حل') or h.startswith('# مسئلهٔ زندهٔ')): continue
      for l in sec.split('\n'):
        if not l.startswith('- '): continue
        if 'زمینه (نه پرسشِ دوم)' in l: continue
        if re.search(r'فقط \*\*یک\*\* پرسش|پرسشِ این نوبت:|قاعدهٔ سبک|گزارشِ وضع|پرسش‌های همین مرحله|سطحِ استقلال|مکانیکی نخوان|ضرب‌المثلِ همین مرحله|^- پاسخِ این مسئله|^- مسئلهٔ عملی|این گفت‌وگو به همین|سکوت، «نمی‌دونم»|chat_solved|chat_invent',l): continue
        if re.search(r'بپرس|؟»|\?»|بخواه',l) and re.search(r'پولیا|[ABC]\d{3}',l):
          hits.append(l[:230])
    if hits:
      print(f'== {s} {os.path.basename(f)} | {turn[:90]}')
      for h in hits: print('   ',h)
