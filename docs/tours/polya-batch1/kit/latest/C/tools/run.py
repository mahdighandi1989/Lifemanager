# run.py sid [maxsteps] -> feed src ctls until an AI request is pending (prints digest) or ctls end.
import sys, os, json, time, glob, re, subprocess
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26C'
sid=sys.argv[1]; D=f'{R}/{sid}'; W=int(os.environ.get('W','500')); OW=int(os.environ.get('OW','110')); QUIETOUT=os.environ.get('QO','1')=='1'
lim=int(sys.argv[2]) if len(sys.argv)>2 else 9999
stf=D+'/drv.json'
S=json.load(open(stf)) if os.path.exists(stf) else {'ptr':1,'wait':0}
def save(): json.dump(S,open(stf,'w'))
def alive():
    try:
        pid=int(open(D+'/harness.pid').read()); os.kill(pid,0)
        return 'h26c' in open('/proc/%d/cmdline'%pid).read()
    except Exception: return False
def start():
    subprocess.run(['bash',R+'/tools/start.sh',sid],stdout=subprocess.DEVNULL); time.sleep(7)
def pend():
    fs=glob.glob(D+'/ai/p*.json')
    for n in sorted(int(f.split('/p')[-1][:-5]) for f in fs):
        if not os.path.exists(D+'/ai/r%d.txt'%n): return n
ctls=sorted(glob.glob(f'{R}/src/{sid}/ctl/c*.json'),key=lambda x:int(x.split('/c')[-1][:-5]))
if not alive(): start()
steps=0
while True:
    p=pend()
    if p:
        mf=f'{R}/man/{sid}/r{p}.txt'; tf=f'{R}/man/{sid}/t{p}.txt'
        tn=json.load(open(D+'/ai/p%d.json'%p))['user'].split('# نوبتِ تازه')[-1].strip()
        if os.path.exists(mf) and os.path.exists(tf) and open(tf).read()==tn:
            open(D+'/ai/r%d.txt'%p,'w').write(open(mf).read()); print('  (auto r%d)'%p); time.sleep(0.5); continue
        subprocess.run(['python3',R+'/tools/dg.py',sid,str(p)]); break
    w=S['wait']
    if w:
        t0=time.time(); p=None
        while not os.path.exists(D+'/out/s%d.json'%w):
            p=pend()
            if p: break
            if time.time()-t0>240: print('TIMEOUT waiting s%d'%w); sys.exit(1)
            time.sleep(0.7)
        if p: continue
        time.sleep(0.3); r=json.load(open(D+'/out/s%d.json'%w)); st=r.get('state',{})
        c=open(D+'/ctl/c%d.json'%w).read()
        line='# s%d %s/%s'%(w,st.get('view'),st.get('sub') or '')
        for k in ['error','eval0','eval','shotjs','shotErr','stateError','log']:
            if r.get(k):
                v=json.dumps(r[k],ensure_ascii=False); bad=k in ('error','shotErr','stateError') or re.search(r'NOFIELD|NOBTN|NO CARD|NONE|ERR|هنوز نه|اول این‌ها',v)
                line+=' %s: %s'%(k,v[:(W if bad else OW)])
        if QUIETOUT and not re.search(r'error|NOFIELD|NOBTN|NO CARD|NONE|ERR|هنوز نه|اول این‌ها|NO ASK|shotErr',line): pass
        else: print(line)
        if '"say"' in c[:400]:
            for m in st.get('msgs',[])[-1:]:
                if not m.startswith('ai:'): print('   MSG',m[:W+300])
        S['wait']=0; save()
        if '"exit"' in c and 'true' in c and len(c)<40:
            for _ in range(120):
                if not alive(): break
                time.sleep(0.5)
            else:
                try: os.kill(int(open(D+'/harness.pid').read()),9); print('  (killed stuck harness)'); time.sleep(1)
                except Exception: pass
            if S['ptr']<=len(ctls): start()
    if steps>=lim: print('LIMIT'); break
    if S['ptr']>len(ctls): print('END of ctls (ptr %d)'%S['ptr']); break
    src=open(ctls[S['ptr']-1]).read()
    n=len(os.listdir(D+'/ctl'))+1
    open(D+'/ctl/c%d.json'%n,'w').write(src)
    try:
        j=json.loads(src); k='SAY '+j['say'][:W] if 'say' in j else ('EXIT' if 'exit' in j else ('SHOT '+j['shot'].get('name','') if 'shot' in j else ''))
    except Exception: k='BAD'
    if k and not QUIETOUT: print('> c%d(src %d) %s'%(n,S['ptr'],k[:140]))
    S['ptr']+=1; S['wait']=n; save(); steps+=1
