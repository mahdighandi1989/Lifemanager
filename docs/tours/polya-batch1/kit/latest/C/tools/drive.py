# drive.py sid [N]  -> feed round15C ctls until an AI request or out of ctls (or N ctl steps). Prints outs briefly, AI digest+diff.
import sys, os, json, time, glob, re, difflib
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid=sys.argv[1]; D=f'{T}/round16C/{sid}'; S6=f'{T}/round15C/'+os.environ.get('SRC',sid)
lim=int(sys.argv[2]) if len(sys.argv)>2 and sys.argv[2].isdigit() else 999
stf=D+'/drv.json'
S=json.load(open(stf)) if os.path.exists(stf) else {'ptr':1,'wait':0}
def pend():
    for f in sorted(glob.glob(D+'/ai/p*.json'), key=lambda x:int(x.split('/p')[-1][:-5])):
        n=int(f.split('/p')[-1][:-5])
        if not os.path.exists(D+'/ai/r%d.txt'%n): return n
def sect(u):
    out={}
    for pt in re.split(r'(?m)^(?=# )',u):
        h=pt.split('\n',1)[0]; out[h[:40]]=pt
    return out
AUTO='auto' in sys.argv
kf=lambda x:[l[:110] for l in x.split('\n') if re.match(r'- k\d+ \|',l)]
def digest(n):
    j=json.load(open(D+'/ai/p%d.json'%n)); u=j['user']
    print('### AI p%d task=%s'%(n,j.get('task')))
    m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S); print('TURN:',(m.group(1)[:400] if m else '?'))
    keep=('# مسئلهٔ زنده','# مربیِ حل','# پس از شکست','# مسئلهٔ حل‌شدهٔ مرتبط','# پیام‌های اخیر','# قلمرو','دانسته‌های قلمرو')
    for pt in re.split(r'(?m)^(?=# )',u):
        h=pt.split('\n',1)[0]
        if h.startswith('# مسئلهٔ زنده') or h.startswith('# مربیِ حل'):
            print('>>',h[:300])
            for l in pt.split('\n')[1:]:
                CONST=('- حلی که در همین','- ضرب‌المثل','- سطحِ استقلال','- **گزارشِ وضع','- حلِ مسئله مهارتی','- پایانِ نردبان','- گامِ کوچک ارزش','- ادعای محلِ بحث','- به تعریف‌ها برگرد','- قاعدهٔ سبک','- پرسش‌ها را مکانیکی','- استدلالِ اکتشافی (چند','- سلیقه و درنگ','- چهار مرحلهٔ حل','- پرسشِ این نوبت: **فقط**','- این گفت‌وگو به همین','- پرسش‌های همین مرحله','- از کتاب برای همین','- پاسخِ این مسئله را','- این مسئله پاسخِ عینی','- مسئلهٔ عملی:')
                if l.startswith(CONST) or not l.strip(): continue
                print('   ',l[:500])
        elif any(k in h for k in keep): print('>>',pt[:600])
    p6=S6+'/ai/p%d.json'%n
    if os.path.exists(p6):
        u6=json.load(open(p6))['user']
        def norm(x):
            L=[]
            for pt in re.split(r'(?m)^(?=# )',x):
                h=pt.split('\n',1)[0]
                if any(k in h for k in ['نقشهٔ سامانه','# امروز','برگه‌های باز','صفحهٔ فعلی','گفت‌وگو تا','تور (ماندگار','پیام‌های اخیر']): continue
                L+=[re.sub(r'pb_l_[a-z0-9]+|\d+ دقیقه','X',l).replace('- زمینه (نه پرسشِ دوم): سلیقه و درنگ','- سلیقه و درنگ') for l in pt.split('\n')]
            return L
        d=[l for l in difflib.unified_diff(norm(u6),norm(u),lineterm='',n=0) if l[:1] in '+-' and not l.startswith(('+++','---'))]
        IGN=('حافظهٔ سشن','- حلی که در همین گفت‌وگو','- سکوت، «نمی‌دونم» یا پاسخِ بی‌ربط','- سطحِ استقلال','- ضرب‌المثلِ همین','# پیام‌های اخیرِ صفحه')
        dd=[l for l in d if not l[1:].startswith(IGN)]
        if AUTO and not dd and kf(u)==kf(u6) and os.path.exists(S6+'/ai/r%d.txt'%n):
            open(D+'/ai/r%d.txt'%n,'w').write(open(S6+'/ai/r%d.txt'%n).read()); print('   AUTO-reused r6 r%d'%n); return True
        print('--- DIFF vs r6 p%d (%d lines):'%(n,len(d)))
        for l in d[:40]: print('  ',l[:400])
        pass
    if os.path.exists(p6):
        if kf(u)!=kf(u6): print('!!! FIELDS CHANGED:',[l for l in kf(u) if l not in kf(u6)][:8])
        r6=S6+'/ai/r%d.txt'%n
        if os.path.exists(r6): print('R6 ANSWER:',open(r6).read()[:1500])
    else: print('(no r6 counterpart)')
ctl6=sorted(glob.glob(S6+'/ctl/c*.json'),key=lambda x:int(x.split('/c')[-1][:-5]))
steps=0
while True:
    p=pend()
    if p:
        if digest(p): continue
        break
    w=S['wait']
    if w:
        t0=time.time()
        while not os.path.exists(D+'/out/s%d.json'%w):
            p=pend()
            if p: break
            if time.time()-t0>300: print('TIMEOUT waiting s%d'%w); sys.exit(1)
            time.sleep(1)
        if p: continue
        time.sleep(0.3); r=json.load(open(D+'/out/s%d.json'%w))
        st=r.get('state',{})
        print('### OUT s%d'%w, 'view',st.get('view'),st.get('sub'))
        for k in ['error','eval0','eval','stateError','log']:
            if r.get(k): print(' ',k,':',json.dumps(r[k],ensure_ascii=False)[:1800])
        if 'say' in open(D+'/ctl/c%d.json'%w).read()[:10]:
            for m in st.get('msgs',[])[-3:]: print('   MSG',m[:900])
        S['wait']=0; json.dump(S,open(stf,'w'))
    if steps>=lim: break
    if S['ptr']>len(ctl6): print('END of round6 ctls'); break
    src=open(ctl6[S['ptr']-1]).read()
    src=re.sub(r"'pb_l_[a-z0-9]+'",'(window.__PID||APP.state.arg||(APP.liveAll()[0]||{p:{}}).p.id)',src)
    n=len(os.listdir(D+'/ctl'))+1
    open(D+'/ctl/c%d.json'%n,'w').write(src); print('>> fed r6 c%d as c%d: %s'%(S['ptr'],n,src[:160].replace('\n',' ')))
    S['ptr']+=1; S['wait']=n; json.dump(S,open(stf,'w')); steps+=1
