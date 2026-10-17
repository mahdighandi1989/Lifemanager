# q.py sid [N] -> pending (or N) prompt: turn, turn-question lines, unmarked directives, r10 reply
import json,sys,re,glob,os
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid=sys.argv[1]; D=f'{T}/round16C/{sid}'
if len(sys.argv)>2: n=int(sys.argv[2])
else:
    n=max(int(f.split('/p')[-1][:-5]) for f in glob.glob(D+'/ai/p*.json'))
u=json.load(open(f'{D}/ai/p{n}.json'))['user']
m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S); print(f'=== {sid} p{n} TURN:',m.group(1).strip()[:700] if m else '?')
GEN=('- قاعدهٔ سبک','- به تعریف‌ها برگرد','- شکل «حتی','- ضرب‌المثلِ همین','- حلی که در همین','- پرسش‌ها را مکانیکی','- سکوت،','- پایانِ نردبان','- سطحِ استقلال','- حلِ مسئله مهارتی','- ادعای محلِ بحث («حق داره؟»، «درسته؟»، «همیشه برقراره؟») یا حدسِ تازه ⇒ داوری نکن: «ثابتش کن یا با مثالِ نقض ردش کن — کدام را اول امتحان می‌کنی؟».')
for pt in re.split(r'(?m)^(?=# )',u):
    h=pt.split('\n',1)[0]
    if not h.startswith(('# مسئلهٔ زنده','# مربیِ حل')): continue
    print(' >>',h[:140])
    for l in pt.split('\n')[1:]:
        if not l.startswith('- '): continue
        mm=re.search(r'پیشنهادِ این نوبت: «[^»]*(?:«[^»]*»[^»]*)*»',l)
        if mm: print('   SUG:',mm.group(0)[:300]); continue
        if l.startswith('- زمینه (نه پرسشِ دوم)'): continue
        if l.strip() in GEN or l.startswith(GEN): continue
        if re.search(r'بپرس|پرسشِ این نوبت|⇐ همان پرسش|یک\*\* پرسش|یک پرسش|پرسشِ نوبت|[؟?]»',l): print('   Q:',l[:300])
r=f'{T}/round15C/{sid}/ai/r{n}.txt'
if os.path.exists(r): print(' R10:',json.load(open(r))['reply'][:500], [a.get('do') for a in json.load(open(r)).get('actions',[])])
