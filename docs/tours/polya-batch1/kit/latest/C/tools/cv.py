# cv.py sid [N] -> compact review: task, turn, mapped r21 p, filtered diff (minus noise), Q lines, r21 reply
import json,re,sys,glob,os,difflib
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid=sys.argv[1]; D=f'{T}/round23C/{sid}'
n=int(sys.argv[2]) if len(sys.argv)>2 else max(int(f.split('/p')[-1][:-5]) for f in glob.glob(D+'/ai/p*.json'))
j=json.load(open(f'{D}/ai/p{n}.json')); u=j['user']
m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S); print(f'=== {sid} p{n} task={j.get("task")}\nTURN:',(m.group(1).strip()[:900] if m else '?'))
mp=json.load(open(D+'/drv.json')).get('map',{}).get(str(n),-1); print('MAP r21 p',mp)
NOISE=('- زمینه (نه پرسشِ دوم): این پیام شاید حرفِ پیشینِ خودش را اصلاح','- بازنگری: اگر درسی گفت','# پرونده‌های تمرینِ باز','- پروندهٔ تازه','- همهٔ تکنیک‌ها','- ضرب‌المثلِ همین مرحله','- زمینه (نه پرسشِ دوم): در actions یک {"do":"coach_state"','# مرحلهٔ خطا','- زمینه (نه پرسشِ دوم): در این مسئله شکست','# فرمول','- زمینه (نه پرسشِ دوم): اگر فرمول','# گزارشِ وضع (همهٔ')
def norm(x):
    L=[]
    for pt in re.split(r'(?m)^(?=# )',x):
        h=pt.split('\n',1)[0]
        if any(k in h for k in ['نقشهٔ سامانه','# امروز','برگه‌های باز','صفحهٔ فعلی','گفت‌وگو تا','تور (ماندگار','پیام‌های اخیر','نوبتِ تازه']): continue
        L+=[re.sub(r'pb_l_[a-z0-9]+|\d+ دقیقه','X',l) for l in pt.split('\n') if l.strip()]
    return L
p6=f'{T}/round22C/{sid}/ai/p{mp}.json'
if os.path.exists(p6):
    u6=json.load(open(p6))['user']
    d=[l for l in difflib.unified_diff(norm(u6),norm(u),lineterm='',n=0) if l[:1] in '+-' and not l.startswith(('+++','---')) and not l[1:].startswith(NOISE)]
    print('DIFF (%d):'%len(d)); [print('  ',l[:int(os.environ.get('W',500))]) for l in d[:40]]
for l in u.split('\n'):
    if 'فقط **یک** پرسش' in l or 'پرسشِ این نوبت همین' in l: print('Q:',l[:600])
r=f'{T}/round22C/{sid}/ai/r{mp}.txt'
if os.path.exists(r): print('R21:',open(r).read()[:int(os.environ.get('R',1500))])
