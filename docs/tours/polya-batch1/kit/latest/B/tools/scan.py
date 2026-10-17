import json,re,sys,os,glob
static=r'^- (قاعدهٔ سبک|پرسش‌ها را مکانیکی|حلِ مسئله مهارتی|شکل «|گامِ کوچک|ادعای محلِ|سکوت،|به تعریف‌ها|\*\*قابِ|\*\*پرسشِ بد|\*\*طرحی که از اقتدار|پرسش‌های «|پرسش‌های همین|\*\*گزارشِ|حلی که|سطحِ استقلال|پایانِ نردبان|این گفت‌وگو|این مسئله پاسخِ|پاسخِ این مسئله)'
for s in sys.argv[1:]:
  for f in sorted(glob.glob(f'{s}/ai/p*.json'),key=lambda x:int(re.findall(r'p(\d+)',x)[-1])):
    u=json.load(open(f))['user']
    for p in re.split(r'(?m)^(?=# )',u):
      hd=p.split('\n',1)[0]
      if not (hd.startswith('# مربیِ حل') or hd.startswith('# مسئلهٔ زنده') or hd.startswith('# مسئلهٔ واقعی')): continue
      for l in p.split('\n')[1:]:
        if not l.startswith('- ') or re.match(static,l): continue
        if 'زمینه (نه پرسشِ دوم)' in l[:40]: tag='CTX'
        elif 'پرسشِ این نوبت' in l[:60]: tag='TURN'
        else: tag='??? '
        ids=re.findall(r'[ABCD]\d{2,3}',l)
        print(f.split('/')[0],os.path.basename(f),hd[:12],tag,ids[:3],l[:110])
