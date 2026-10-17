import json,re,sys,os
# rd.py sid n : raw new/removed prompt lines vs round17B (ignoring known-global additions, page & conversation sections)
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,n=sys.argv[1],sys.argv[2]; src=os.environ.get('SRCS') or s
IGN=re.compile(r'^('+(r'# درخواست‌های عقب‌افتادهٔ کاربر|- زمینه \(نه پرسشِ دوم\): خودش خواست «|' if os.environ.get('IGNPROM') else '')+(r'# مسئلهٔ واقعیِ حل‌نشده|- کاربر یک مسئله، تصمیم، انتخاب|' if os.environ.get('IGNLIVE') else '')+(r'# فرمول|اگر فرمول می‌نویسی، میانِ|' if os.environ.get('IGNMATH') else '')+r'- ضرب‌المثلِ همین مرحله|# گزارشِ وضع \(همهٔ نوبت‌ها\)|- زمینه \(نه پرسشِ دوم\): در actions یک \{"do":"coach_state"|# 🔭 مسئلهٔ حل‌نشدهٔ خودم \(قاعدهٔ کوتاه\)|- زمینه \(نه پرسشِ دوم\): «🔭 مسئلهٔ حل‌نشدهٔ خودم» جای|- زمینه \(نه پرسشِ دوم\): ضمیرِ گفت‌وگو \(شما/تو\) را عوض نکن — همان که|- زمینه \(نه پرسشِ دوم\): ضمیرِ گفت‌وگو \(شما/تو\) را عوض نکن — این گفت‌وگو با «(تو|شما)» است|- حلی که در همین گفت‌وگو تمام شد بی بازنگری رها نشود)')
def L(f):
  u=json.load(open(f))['user']
  u=re.sub(r'pb_[a-z]_[a-z0-9]+','PB',u); u=re.sub(r'(achat|case|dl|pr)_[a-z0-9]{6,}',r'\1_X',u); u=re.sub(r'20\d\d-\d\d-\d\d(T[\d:.]+Z)?','D',u)
  out=[]; skip=False
  for p in re.split(r'(?m)^(?=# )',u):
    hd=p.split('\n',1)[0]
    if hd.startswith(('# صفحهٔ فعلی','# گفت‌وگو تا این لحظه','# نقشهٔ سامانه','# دانسته‌های قلمرو','# نوبتِ تازه')): continue
    for l in p.split('\n'):
      l=l.rstrip()
      if l and not IGN.match(l): out.append(l)
  return out
n0=os.environ.get('SRCN',n); a=L(f'{B}/round17B/{src}/ai/p{n0}.json')
b=L(f'{B}/round18B/{s}/ai/p{n}.json')
K=lambda l: re.sub(r'\S+',lambda m:m.group(0)[:2],l)
if os.environ.get('REG','1')=='1':
  ka=set(K(x) for x in a); kb=set(K(x) for x in b)
  b=[x for x in b if K(x) not in ka]; a=[x for x in a if K(x) not in kb]
A=set(a); Bs=set(b)
W=int(os.environ.get('W','700'))
for l in b:
  if l not in A: print('+ '+l[:W])
for l in a:
  if l not in Bs: print('- '+l[:W])
u=json.load(open(f'{B}/round18B/{s}/ai/p{n}.json'))['user']; i=u.rfind('# نوبتِ تازه'); print('USER: '+u[i+13:i+400].strip())
