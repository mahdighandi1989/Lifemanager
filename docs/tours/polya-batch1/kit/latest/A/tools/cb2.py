import json,sys,glob
D=sys.argv[1]; n=sys.argv[2] if len(sys.argv)>2 else None
f=(D+'/ai/p%s.json'%n) if n else sorted(glob.glob(D+'/ai/p*.json'),key=lambda x:int(x.split('/p')[-1][:-5]))[-1]
u=json.load(open(f))['user'];print(f)
i=min([x for x in [u.find('# پس از شکست'),u.find('# مسئلهٔ زندهٔ'),u.find('# مسئلهٔ حل‌شدهٔ'),u.find('# مربیِ حل'),u.find('# مسئلهٔ بازِ')] if x>=0] or [0]);j=u.find('# صفحهٔ فعلی')
skip=('گامِ کوچک ارزش','گزارشِ وضع','معلمِ خیالی','پرسش‌ها را مکانیکی','قاعدهٔ سبک','سطحِ استقلال','ضرب‌المثلِ همین','حلی که در همین گفت','پاسخِ این مسئله را هیچ','این مسئله پاسخِ عینی')
for l in u[i:j].split('\n'):
  if any(k in l for k in skip): continue
  print(l[:int(sys.argv[3]) if len(sys.argv)>3 else 600])
