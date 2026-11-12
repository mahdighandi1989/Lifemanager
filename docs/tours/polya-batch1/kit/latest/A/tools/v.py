# v.py SID [N] [extra-head-substr ...] : compact view of prompt N (default: pending/last)
import json,re,sys,os
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A'
s=sys.argv[1]; D=f'{R}/{s}/ai'
ns=sorted(int(m.group(1)) for f in os.listdir(D) for m in [re.match(r'p(\d+)\.json',f)] if m)
n=int(sys.argv[2]) if len(sys.argv)>2 and sys.argv[2].isdigit() else ns[-1]
extra=[x for x in sys.argv[2:] if x and not x.isdigit()]
p=json.load(open(f'{D}/p{n}.json')); u=p['user']
hs=[(m.start(),m.group(0)) for m in re.finditer(r'(?m)^# .*',u)]
SKIP=('# نقشهٔ سامانه','# امروز','# سشن','# برگه‌های بازِ','# پرونده‌های تمرینِ باز: هنوز','# فهرست‌های جاری','# 🧭','# گزارشِ وضع','# صفحهٔ فعلی','# گفت‌وگو تا','# 🔭 مسئلهٔ حل‌نشدهٔ خودم (قاعدهٔ','# ساعتِ','# فرمول','# مرحلهٔ خطا','# پیام‌های اخیرِ')
print(f'=== p{n} task={p.get("task")} answered={os.path.exists(f"{D}/r{n}.txt")} len={len(u)}')
W=int(os.environ.get('W','900'))
for i,(a,h) in enumerate(hs):
    b=hs[i+1][0] if i+1<len(hs) else len(u); blk=u[a:b].rstrip()
    if any(x in h for x in extra): print(blk[:4000]); continue
    if h.startswith(SKIP): continue
    if h.startswith('# پیش‌نیاز ('):
        if len(blk.split('\n'))<=2 or 'پشته' not in blk and 'منتظر' not in blk and 'تشخیص' not in blk[200:]: continue
        print(blk[:1200]); continue
    if h.startswith('# وضعِ کنونی'): print(blk[:400]); continue
    if h.startswith('# مسئلهٔ زندهٔ') or h.startswith('# مسئلهٔ'):
        print(h[:200]); 
        for l in blk.split('\n')[1:]:
            if any(k in l for k in ('کارِ پیشین','منتظر','ازسرگیری','حدس','برگه','⏸')): print('   ',l[:400])
        continue
    if h.startswith('# مربیِ حل'):
        print(h[:160])
        for l in blk.split('\n')[1:]:
            if any(k in l for k in ('**یک** پرسش','پرسشِ این نوبت','همین پیام','کارِ پیشین','دوباره‌سنج','رد کرد')) and not l.startswith('- زمینه'): print('   ',l[:700])
        continue
    if h.startswith('# نوبتِ تازه'): print(blk[:1500]); continue
    print(blk[:W])
