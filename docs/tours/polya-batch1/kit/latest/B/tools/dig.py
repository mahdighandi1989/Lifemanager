#!/usr/bin/env python3
"""dig.py sid [n...] : per AI call: task, how answered, stage, turn question, arithmetic block lines, prior/date/correction block heads, and diff of TQ vs round-26 twin"""
import json,os,re,sys
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s=sys.argv[1]; D=f'{B}/round27B/{s}'; src=open(f'{D}/src.txt').read().strip(); S=f'{B}/round26B/{src}'
W=int(os.environ.get('W','300'))
log=open(f'{D}/drv.log').read() if os.path.exists(f'{D}/drv.log') else ''
am=json.load(open(f'{D}/amap.json')) if os.path.exists(f'{D}/amap.json') else {}
ns=sorted(int(f[1:-5]) for f in os.listdir(f'{D}/ai') if re.match(r'p\d+\.json$',f))
if len(sys.argv)>2: ns=[int(x) for x in sys.argv[2:]]
def tq(u):
    out=[]
    for l in u.split('\n'):
        if 'پرسشِ این نوبت همین است' in l: out.append(re.sub(r'pb_l_\w+','ID',l.strip())[:W])
        m=re.search(r'در این نوبت فقط \*\*یک\*\* پرسش[^«]*«([^»]*)»',l)
        if m: out.append('LIVE:'+m.group(1)[:W])
    return out
def blocks(u):
    hs=[]
    for p in re.split(r'(?m)^(?=# )',u):
        hd=p.split('\n',1)[0]
        if re.match(r'# (حسابِ صفحه|کارِ پیشین|اصلاح|📅|تاریخ|پیش‌بینی|چند مسئله|کدام|موعد|🎯)',hd) or 'حساب' in hd[:30] or 'پیشین' in hd[:30]:
            hs.append(p.strip()[:int(os.environ.get('BL','900'))])
    return hs
for n in ns:
    d=json.load(open(f'{D}/ai/p{n}.json')); u=d['user']
    m=re.search(rf'ANS p{n} .*',log); how=m.group(0)[len(f'ANS p{n} '):][:60] if m else '?'
    j=u.rfind('# نوبتِ تازه'); turn=u[j+13:j+13+int(os.environ.get('TL','160'))].strip().replace('\n',' ')
    st=re.search(r'(?m)^# وضعِ کنونی.*\n?(.*)',u); stage=(st.group(0).replace('\n',' ')[:220] if st else '')
    print(f'=== p{n} {how} | {turn}')
    if stage and not os.environ.get('NOST'): print('  STAGE:',stage)
    for t in tq(u): print('  TQ:',t)
    tw=am.get(str(n))
    if tw is not None and int(tw)<1000 and os.path.exists(f'{S}/ai/p{tw}.json'):
        old=tq(json.load(open(f'{S}/ai/p{tw}.json'))['user'])
        if old!=tq(u): print('  TQ26:',old)
    if not os.environ.get('NOBL'):
        for b in blocks(u): print('  BLK:',b.replace('\n',' ⏎ '))
