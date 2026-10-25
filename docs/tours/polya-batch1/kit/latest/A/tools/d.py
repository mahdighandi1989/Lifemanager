#!/usr/bin/env python3
# d.py SID send '<json>' | d.py SID ans N '<text>' | d.py SID show N [full] | d.py SID wait | d.py SID out N
import sys, os, json, time, re, hashlib
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A'
sid=sys.argv[1]; D=os.path.join(R,sid); cmd=sys.argv[2]
AI=os.path.join(D,'ai'); CTL=os.path.join(D,'ctl'); OUT=os.path.join(D,'out')
def nums(d,pat):
    return sorted(int(m.group(1)) for f in os.listdir(d) for m in [re.match(pat,f)] if m)
def pending():
    for n in nums(AI,r'^p(\d+)\.json$'):
        if not os.path.exists(os.path.join(AI,'r%d.txt'%n)): return n
def show(n,full=False):
    p=json.load(open(os.path.join(AI,'p%d.json'%n)))
    s=p['sys']; t=p.get('task')
    print('=== AI p%d task=%s files=%s sys=%d user=%d sysmd5=%s'%(n,t,p.get('fileIds'),len(s),len(p['user']),hashlib.md5(s.encode()).hexdigest()[:8]))
    if t!='lla_assistant' or full: print('--- SYS\n'+s)
    u=p['user']; i=u.find('\n# امروز')
    if i>0 and not full: u=u[i:]
    out=[]; blk=''
    for l in u.split('\n'):
        if l.startswith('# '): blk=l
        if not full:
            if l.startswith('متنِ صفحه') or l.startswith('دکمه‌ها:'): l=l[:700]+' …[cut]'
            if l.startswith('   ·'): continue
            if blk.startswith('# مربیِ حل') and not l.startswith('# ') and not any(k in l for k in ('پیشنهادِ این نوبت','پرسشِ این نوبت','ضرب‌المثلِ','پس از بستن','حل شد','دلسرد','میانهٔ راه','بسته شده','بازنگری:','پرسش‌های «')): continue
            if blk.startswith('# دانسته‌های قلمرو') and l.startswith('- ['): l=l[:160]
            if blk.startswith('# ساعتِ') or l.startswith('- اگر کاربر برای موعد ساعت'): continue
        out.append(l)
    print('\n'.join(out))
def outsum(n):
    o=json.load(open(os.path.join(OUT,'s%d.json'%n)))
    print('=== OUT s%d'%n)
    for k in ('error','eval0','eval','stateError','log'):
        if o.get(k): print(k.upper()+':',o[k] if isinstance(o[k],str) else json.dumps(o[k],ensure_ascii=False)[:6000])
    s=o.get('state') or {}
    print('VIEW:',s.get('view'),s.get('arg'),s.get('sub'),'rem',s.get('rem'))
    for m in (s.get('msgs') or [])[-3:]: print('  MSG',m[:1500])
    if s.get('overlay'): print('OVERLAY:',s['overlay'][:600])
def wait(target,timeout=600):
    t0=time.time()
    while time.time()-t0<timeout:
        n=pending()
        if n: show(n); return
        if target and os.path.exists(os.path.join(OUT,'s%d.json'%target)):
            time.sleep(0.3); outsum(target); return
        time.sleep(1)
    print('TIMEOUT')
def lastctl():
    c=nums(CTL,r'^c(\d+)\.json$'); return c[-1] if c else 0
if cmd=='send':
    data=sys.argv[3]
    if data.startswith('@'): data=open(data[1:]).read()
    json.loads(data); n=lastctl()+1
    open(os.path.join(CTL,'c%d.json'%n),'w').write(data); print('wrote c%d'%n); wait(n)
elif cmd=='ans':
    n=int(sys.argv[3]); data=sys.argv[4]
    if data.startswith('@'): data=open(data[1:]).read()
    data=data.strip(); json.loads(data)
    open(os.path.join(AI,'r%d.txt'%n),'w').write(data); print('answered p%d'%n); time.sleep(1.5); wait(lastctl())
elif cmd=='show': show(int(sys.argv[3]),len(sys.argv)>4)
elif cmd=='wait': wait(lastctl())
elif cmd=='out': outsum(int(sys.argv[3]))
