import json,sys,re
d=json.load(open(sys.argv[1]));u=d['user']
skip=r'^- (\*\*گزارشِ وضع|حلی که|سطحِ استقلال|ضرب‌المثلِ|پایانِ نردبان|این گفت‌وگو به همین|این مسئله پاسخِ عینی|پاسخِ این مسئله را هیچ)'
for p in re.split(r'(?m)^(?=# )',u):
  hd=p.split('\n',1)[0]
  if hd.startswith(('# مسئلهٔ زنده','# مربیِ حل','# مسئلهٔ حل','# پس از','# پیام‌های اخیر','# نوبتِ تازه','# مسئلهٔ واقعی','# قابِ','# دانسته')) or 'مربی' in hd[:30]:
    print(hd[:400])
    for l in p.split('\n')[1:]:
      if not l.strip() or re.match(skip,l): continue
      if l.startswith('- پرسش‌های «') or l.startswith('- پرسش‌های همین'):
        m=re.search(r'پیشنهادِ این نوبت: «[^»]*»',l); print('  > LIST... '+(m.group(0) if m else l[-200:])); continue
      print('  > '+l[:int(sys.argv[2]) if len(sys.argv)>2 else 500])
