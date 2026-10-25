# scan2.py sid... -> per prompt: header list + every line (outside turn line / context-marked) with «بپرس» or ending in «؟»
import json,sys,re,glob
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C'
SKIP=('# نوبتِ تازه','# پیام‌های اخیر','# گفت‌وگو','# نقشهٔ سامانه','# امروز','# برگه','# صفحهٔ فعلی')
args=sys.argv[1:]; only=None
if args and args[-1].isdigit(): only=int(args.pop())
for sid in args:
  for f in sorted(glob.glob(f'{T}/{sid}/ai/p*.json'),key=lambda x:int(x.split('/p')[-1][:-5])):
    n=int(f.split('/p')[-1][:-5])
    if only and n!=only: continue
    u=json.load(open(f))['user']; L=[]; hs=[]
    for pt in re.split(r'(?m)^(?=# )',u):
        h=pt.split('\n',1)[0]; hs.append(h[:30])
        if h.startswith(SKIP): continue
        for l in pt.split('\n')[1:]:
            s=l.strip()
            if not s or s.startswith('- زمینه (نه پرسشِ دوم)') or 'پرسشِ این نوبت همین است' in s: continue
            if re.search(r'(^|[^\w])بپرس',s) or re.search(r'[؟?][»)\s*]*$',s): L.append(s[:260])
    print('==',sid,'p%d'%n,len(L))
    for l in L: print('    ',l)
