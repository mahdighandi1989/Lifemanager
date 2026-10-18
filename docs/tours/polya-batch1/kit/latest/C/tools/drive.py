# drive.py sid [N]  -> feed round23C ctls until an AI request or out of ctls (or N ctl steps). Prints outs briefly, AI digest+diff.
import sys, os, json, time, glob, re, difflib

import datetime as _dt
def _shd(t):
    return t
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid=sys.argv[1]; D=f'{T}/round24C/{sid}'; S6=f'{T}/round23C/'+os.environ.get('SRC',sid)
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
    mf=f'{T}/round24C/man/{sid}/r{n}.txt'
    if os.path.exists(mf):
        txt=open(mf).read(); u0=json.load(open(D+'/ai/p%d.json'%n))['user']
        def _pick(kind):
            for pat in [r'- پروندهٔ تازه[^\n]*?\(pid ('+kind+r'[a-z0-9]+)\)', r'# مسئلهٔ زندهٔ این سشن \(('+kind+r'[a-z0-9]+)\)', r'- ('+kind+r'[a-z0-9]+): تکنیکِ']:
                m_=re.search(pat,u0)
                if m_: return m_.group(1)
            a=re.findall('('+kind+r'[a-z0-9]+)',u0); return a[0] if a else None
        for kind in ['pb_l_','prc_']:
            tgt=_pick(kind)
            if tgt:
                for old_id in set(re.findall('('+kind+r'[a-z0-9]+)',txt)):
                    if old_id not in u0: txt=txt.replace(old_id,tgt)
        open(D+'/ai/r%d.txt'%n,'w').write(txt); print('### AI p%d   AUTO-manual r%d'%(n,n)); return True
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
    def turnOf(x):
        mm=re.search(r'# نوبتِ تازه\n(.*)',x,re.S); return (mm.group(1).strip()[:300] if mm else x[-300:])
    MP=S.setdefault('map',{})
    if str(n) not in MP:
        used=set(MP.values()); tn=turnOf(u); best=None
        for f6 in sorted(glob.glob(S6+'/ai/p*.json'),key=lambda x:int(x.split('/p')[-1][:-5])):
            k6=int(f6.split('/p')[-1][:-5])
            if k6 in used: continue
            if turnOf(json.load(open(f6))['user'])==tn: best=k6; break
        MP[str(n)]=best if best else -1; json.dump(S,open(stf,'w'))
    m6=MP[str(n)]; print('MAP p%d -> r20 p%s'%(n,m6))
    p6=S6+'/ai/p%d.json'%m6
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
        IGN=('# گزارشِ وضع (همهٔ','- زمینه (نه پرسشِ دوم): اگر فرمول','- زمینه (نه پرسشِ دوم): چهار مرحلهٔ حل','- زمینه (نه پرسشِ دوم): در actions یک {"do":"coach_state"','# فرمول','اگر فرمول می‌نویسی','- زمینه (نه پرسشِ دوم): ضمیرِ گفت‌وگو','# 🔭 مسئلهٔ حل‌نشدهٔ خودم (قاعدهٔ کوتاه)','- زمینه (نه پرسشِ دوم): «🔭 مسئلهٔ حل‌نشدهٔ خودم» جای مسئلهٔ واقعیِ','- حلی که در همین گفت‌وگو تمام شد بی بازنگری رها نشود','حافظهٔ سشن','- حلی که در همین گفت‌وگو','- سکوت، «نمی‌دونم» یا پاسخِ بی‌ربط','- سطحِ استقلال','- ضرب‌المثلِ همین','# پیام‌های اخیرِ صفحه','# وضعِ کنونی','- زمینه (نه پرسشِ دوم): مسئلهٔ گفت‌وگو «','- زمینه (نه پرسشِ دوم): مسئلهٔ زنده «','ساعتِ یادآورها','- اگر کاربر برای موعد ساعت هم گفت','- زمینه (نه پرسشِ دوم): در actions یک {"do":"coach_state"','# پرونده‌های تمرینِ باز','- پروندهٔ تازه','- همهٔ تکنیک‌ها','- ضرب‌المثلِ همین مرحله','- زمینه (نه پرسشِ دوم): گزارشِ پیشینت said','# مرحلهٔ خطا از حرفِ خودش','- زمینه (نه پرسشِ دوم): در این مسئله شکست/گیری ثبت شده','# فهرست‌های جاری','- جای هر نیاز:','- اگر خودش خواست چیزی را نگه دارد','- تغییرِ یک مورد از حرفِ خودش','# مخاطب','- سنِ کاربر نامعلوم','- تا آن وقت: زبانِ روشن','# پیش‌نیاز (کمبودِ پیش‌نیاز','- زمینه (نه پرسشِ دوم): اگر حرفِ همین پیامش نشان','- گام‌ها: بگذار خودش','# 🧭 نقشهٔ مسیرِ همین مسئله','- زمینه (نه پرسشِ دوم): «نقشهٔ مسیرم رو نشون بده»','- کاربر ۱','- کاربر ۲','- کاربر ۳','- کاربر ۴','- کاربر ۵','- کاربر ۶','- کاربر ۷','- کاربر ۸','- کاربر ۹','- منطقِ حل، پرسش‌های پولیا','- زبان:','- مثال از','- تشویق بی','- ضمیر:','- ایمنی (کم‌سال)','- اگر پای چیزِ واقعاً مهم','- با حوصله','- اندازهٔ گام','- بی تحقیر','- زمینه (نه پرسشِ دوم): هنوز مسئله یا کارِ بازی','- اگر کاربر تاریخِ تولد')
        dd=[l for l in d if not l[1:].startswith(IGN) and l[1:].strip()]
        conv=re.search(r'# گفت‌وگو تا این لحظه\n(.*?)(?=\n# |\Z)',u,re.S)
        first='قاعدهٔ کوتاه)' in u and not (conv and 'دستیار:' in conv.group(1))
        def acts(k):
            f=S6+'/ai/r%d.txt'%k
            try: return [a.get('do') for a in json.load(open(f)).get('actions',[])]
            except Exception: return []
        clos='chat_solved' in acts(m6) or 'chat_solved' in acts(m6-1) or 'chat_invent' in acts(m6)
        _sf=f'{T}/round24C/stop_{sid}.txt'
        if os.path.exists(_sf) and any(x.strip() and x.strip() in turnOf(u) for x in open(_sf).read().split('\n')): print('!!! STOP-LIST'); dd=dd or ['(stoplist)']
        if first or clos: print('!!! STOP-REVIEW first=%s closure=%s'%(first,clos)); dd=dd or ['(review)']
        sysT=bool(re.search(r'# نوبتِ تازه\n\[سامانه',u))
        if AUTO and (sysT or os.environ.get('AUTOU')) and not dd and kf(u)==kf(u6) and os.path.exists(S6+'/ai/r%d.txt'%m6):
            open(D+'/ai/r%d.txt'%n,'w').write(_shd(open(S6+'/ai/r%d.txt'%m6).read())); print('   AUTO-reused r20 r%d'%m6); return True
        if AUTO and (sysT or os.environ.get('AUTOU')) and not dd and kf(u)!=kf(u6) and os.path.exists(S6+'/ai/r%d.txt'%m6):
            import subprocess
            o=subprocess.run(['python3',T+'/round24C/tools/remap.py',sid,str(n)],env=dict(os.environ,SRC=str(m6)),capture_output=True,text=True)
            print('   AUTO-remapped r22 r%d'%m6, o.stdout.replace(chr(10),' | ')[:300])
            if o.returncode==0: return True
            print('!!! REMAP FAILED — manual')
        print('--- DIFF vs r20 p%d (%d lines):'%(m6,len(d)))
        for l in d[:40]: print('  ',l[:400])
        pass
    if os.path.exists(p6):
        if kf(u)!=kf(u6): print('!!! FIELDS CHANGED:',[l for l in kf(u) if l not in kf(u6)][:8])
        r6=S6+'/ai/r%d.txt'%m6
        if os.path.exists(r6): print('R6 ANSWER:',open(r6).read()[:1500])
    else: print('(no r6 counterpart)')
ctl6=sorted(glob.glob(f'{T}/round24C/src/{sid}/ctl/c*.json'),key=lambda x:int(x.split('/c')[-1][:-5]))
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
    try:
        _j=json.loads(src)
        if isinstance(_j.get('eval0'),str) and _j['eval0'].startswith('window.F=') and "APP.go('lprob'" not in _j['eval0']:
            _j['eval0']+=";window.__PID=window.__PID||localStorage.getItem('__PID')||(APP.liveAll().slice(-1)[0]||{p:{}}).p.id;if(APP.state.view==='lprob'&&!APP.state.arg&&window.__PID)APP.go('lprob',window.__PID);'ok'"
            src=json.dumps(_j,ensure_ascii=False)
    except Exception as e: pass
    n=len(os.listdir(D+'/ctl'))+1
    lo=D+'/out/s%d.json'%(n-1)
    if n>1 and os.path.exists(lo) and '"exit":true' in open(lo).read():
        import subprocess
        for _w in range(30):
            if subprocess.run("ps aux | grep '[h]arness6c.js' | grep -q 'round24C/%s$'"%sid,shell=True).returncode!=0: break
            time.sleep(1)
        else:
            subprocess.run("for p in $(ps aux | grep '[h]arness6c.js' | grep 'round24C/%s$' | awk '{print $2}'); do kill -9 $p; done"%sid,shell=True); time.sleep(2)
        if subprocess.run("ps aux | grep '[h]arness6c.js' | grep -q 'round24C/%s$'"%sid,shell=True).returncode!=0:
            time.sleep(3); subprocess.run(['bash',T+'/round24C/tools/start.sh',D]); time.sleep(8); print('>> restarted harness')
    open(D+'/ctl/c%d.json'%n,'w').write(src); print('>> fed r6 c%d as c%d: %s'%(S['ptr'],n,src[:160].replace('\n',' ')))
    S['ptr']+=1; S['wait']=n; json.dump(S,open(stf,'w')); steps+=1
