# vv.py SID [N] : minimal view of the pending/last prompt
import json,re,sys,os
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A'
s=sys.argv[1]; D=f'{R}/{s}/ai'
ns=sorted(int(m.group(1)) for f in os.listdir(D) for m in [re.match(r'p(\d+)\.json',f)] if m)
n=int(sys.argv[2]) if len(sys.argv)>2 else ns[-1]
p=json.load(open(f'{D}/p{n}.json')); u=p['user']
W=int(os.environ.get('W','380'))
def blk(h):
    i=u.find('\n'+h)
    if i<0: return None
    j=u.find('\n# ',i+3); return u[i+1:j if j>0 else len(u)]
print(f'=== p{n} [{p.get("task")}] answered={os.path.exists(f"{D}/r{n}.txt")}')
b=blk('# وضعِ کنونی'); 
if b: print('ST:',b.split('\n')[1][22:22+200])
b=blk('# مخاطب')
if b: print('AUD:',' '.join(b.split('\n')[1:3])[:110])
m=re.search(r'(?m)^# مسئلهٔ زندهٔ این سشن[^\n]*',u)
if m: print('LIVE:',m.group(0)[23:200])
for l in u.split('\n'):
    if l.startswith('- زمینه'): 
        if 'دو شاخهٔ همان' in l: print('TQ2:',l[30:30+W])
        continue
    if l.startswith('- پرسش‌های «') and ('پرسشِ این نوبت همین است' in u or '**یک** پرسش' in u): continue
    if '**یک** پرسش' in l or 'پرسشِ این نوبت همین است' in l:
        k=l.find('«') if '**یک** پرسش' in l else l.find('همین است:')
        print('TQ:',l[max(0,k):max(0,k)+W])
    elif 'پیشنهادِ این نوبت:' in l and '**یک** پرسش' not in u and 'پرسشِ این نوبت همین است' not in u:
        k=l.find('پیشنهادِ این نوبت:'); print('TQs:',l[k:k+W])
for h in ('# کارِ پیشینِ تو (حکمِ','# حسابِ صفحه','# تاریخِ خودش','# پیگیریِ برنامهٔ خودش','# اصلاحِ پیامِ پیشین','# دو مسئله','# بستنِ مسئله','# پرونده‌های تمرینِ باز:','# برگه','# کمبود','# قلمرو','# ابزار'):
    b=blk(h)
    if not b: continue
    L=b.split('\n')
    if h.startswith('# پرونده‌های تمرینِ باز') and 'هنوز هیچ' in L[0]: continue
    if h.startswith('# برگه') and 'هیچ برگهٔ بازی' in b: continue
    print(L[0][:120])
    for l in L[1:8]:
        l=l.replace('- زمینه (نه پرسشِ دوم): ','· ')
        if l.strip(): print('  ',l[:W])
if '# کارِ پیشینِ تو\n' in u: print('PRIOR-REQUEST block present')
b=blk('# پیش‌نیاز (')
if b:
    for l in b.split('\n')[1:]:
        if 'پشتهٔ جاهای' in l: print('PRE-STACK:',l[:W])
i=u.find('{"changed"')
if i>=0:
    try:
        d=json.loads(u[i:u.find('\n',i)])
        for k in ('changed','ask'):
            for x in d.get(k) or []: print(' ',k,'|',json.dumps(x,ensure_ascii=False)[:300])
        if d.get('note'): print('  note |',str(d['note'])[:300])
    except Exception as e: print('result-json err')
b=blk('# نتیجهٔ صفحه از نوبتِ پیش')
if b: print(b[:W+200])
b=blk('# گزارشِ نوبتِ پیش')
if b: print(b[:W])
c=blk('# گفت‌وگو تا این لحظه') or ''
sysl=[l for l in c.split('\n') if l.startswith('سامانه:')]
if sysl: print('LASTSYS:',sysl[-1][:W])
i=u.find('# نوبتِ تازه'); print('TURN:',u[i+13:i+13+int(os.environ.get('TW','1300'))])
