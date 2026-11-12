#!/usr/bin/env python3
# d.py sid — round-26 driver: replay plan (round26D/<sid>.plan.json; default = round25D/<src>/ctl in order), stop at each pending AI call.
import sys,os,json,glob,re,subprocess,time
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
R=B+'/round26D'; s=sys.argv[1]; D=R+'/'+s; T=R+'/tools'
pf=R+'/'+s+'.plan.json'
plan=json.load(open(pf))
stf=D+'/dstate.json'
st=json.load(open(stf)) if os.path.exists(stf) else {'i':0,'sent':False}
def save(): json.dump(st,open(stf,'w'))
num=lambda f:int(re.findall(r'\d+',os.path.basename(f))[0])
def ncur(): return max([num(f) for f in glob.glob(D+'/ctl/c*.json')]+[0])
def pending():
    for f in sorted(glob.glob(D+'/ai/p*.json'),key=num):
        if not os.path.exists(f'{D}/ai/r{num(f)}.txt'): return num(f)
SRC=json.load(open(pf+'.src'))['src'] if os.path.exists(pf+'.src') else s
def ctlof(it):
    if 'src' in it: return json.load(open(f'{B}/round25D/{it.get("sid",SRC)}/ctl/c{it["src"]}.json'))
    return it['new']
EL=int(os.environ.get('EL','0'))
def show(n,it):
    out=f'{D}/out/s{n}.json'; r=json.load(open(out)); stt=r.get('state',{})
    lab=('c%d'%it['src']) if 'src' in it else it.get('tag','new')
    print(f'--- [{st["i"]}] {lab} => s{n}  view={stt.get("view")}/{stt.get("arg")}')
    for k in ('eval0','eval','error','stateError'):
        if k in r and r[k] not in (None,1,'1'):
            v=str(r[k]); 
            if k=='eval0' and len(v)<3: continue
            print('  '+k.upper()+':',v[:EL])
    if r.get('log'): print('  LOG:',r['log'][:4])
    c=ctlof(it)
    if c.get('say') is not None:
        for m in stt.get('msgs',[])[-1:]: print('  MSG>',m[:1500])
    if stt.get('overlay'): print('  OVERLAY:',stt['overlay'][:400])
while st['i']<len(plan):
    it=plan[st['i']]
    if 'restart' in it:
        print(f'[{st["i"]}] RESTART {it["restart"]}'); st['i']+=1; save(); sys.exit(4)
    if 'shell' in it:
        r=subprocess.run(it['shell'].replace('$D',D),shell=True,capture_output=True,text=True); print(f'[{st["i"]}] SHELL: {(r.stdout+r.stderr)[:400]}'); st['i']+=1; save(); continue
    c=ctlof(it)
    if not st['sent']:
        n=ncur()+1; os.makedirs(D+'/ctl',exist_ok=True); json.dump(c,open(f'{D}/ctl/c{n}.json','w'),ensure_ascii=False); st['sent']=True; st['n']=n; save()
        if c.get('say') is not None: print(f'>>> SAY [{st["i"]}]: {c["say"]}')
        if c.get('exit'):
            for _ in range(120):
                if os.path.exists(f'{D}/out/s{n}.json'): break
                time.sleep(1)
            print('EXIT done'); st['i']+=1; st['sent']=False; save(); break
    n=st['n']; t0=time.time()
    while True:
        p=pending()
        if p and os.path.exists(f'{R}/{s}.pre/r{p}.txt'):
            open(f'{D}/ai/r{p}.txt','w').write(open(f'{R}/{s}.pre/r{p}.txt').read()); print(f'  (pre-answered p{p})'); time.sleep(1); continue
        if p:
            subprocess.run(['python3',T+'/pv.py',s,str(p)])
            for q in range(st['i']+1,len(plan)):
                cq=ctlof(plan[q]) if 'restart' not in plan[q] and 'shell' not in plan[q] else {}
                if cq.get('say') is not None: print(f'#### NEXT SAY [{q}]:',cq['say'][:700]); break
            sys.exit(3)
        if os.path.exists(f'{D}/out/s{n}.json'): time.sleep(0.4); break
        if time.time()-t0>300: print('TIMEOUT waiting s%d'%n); sys.exit(1)
        time.sleep(0.7)
    show(n,it); st['i']+=1; st['sent']=False; save()
print('PLAN_DONE' if st['i']>=len(plan) else 'STOPPED')
