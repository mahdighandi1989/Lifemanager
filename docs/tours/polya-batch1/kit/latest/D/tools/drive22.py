#!/usr/bin/env python3
# drive21.py sid [plan.json] — replay round21D/<sid> ctl list (or plan items) into round23D/<sid>.
# plan = [{"src":k} | {"new":{ctl},"tag":"x"} | {"exit":true}]; no plan => all source ctls in order.
# src AI calls: mapping from round21D mtimes (P files between Ck and Sk). answer = ovr/r{N}.txt else subst(old rN).
# extra AI calls beyond source => ovr/x{k}_{j}.txt (NEED + exit 3). new => ovr/{tag}_{j}.txt. Resumable.
import sys,os,json,glob,re,subprocess
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
R=B+'/round23D'; s=sys.argv[1]; S=B+'/round21D/'+s; D=R+'/'+s; T=R+'/tools'; O=R+'/'+s+'.ovr'
os.makedirs(O,exist_ok=True)
N=len(glob.glob(S+'/ctl/c*.json'))
plan=json.load(open(sys.argv[2])) if len(sys.argv)>2 else [{'src':k} for k in range(1,N+1)]
ev=[]
num=lambda f:int(re.findall(r'\d+',os.path.basename(f))[0])
for f in glob.glob(S+'/ctl/c*.json'): ev.append((os.path.getmtime(f),'C',num(f)))
for f in glob.glob(S+'/out/s*.json'): ev.append((os.path.getmtime(f),'S',num(f)))
for f in glob.glob(S+'/ai/p*.json'): ev.append((os.path.getmtime(f),'P',num(f)))
ev.sort(); mp={}; cur=None
for t,k,n in ev:
    if k=='C': cur=n; mp[n]=[]
    elif k=='P' and cur: mp[cur].append(n)
stf=D+'/drive_state.json'
st=json.load(open(stf)) if os.path.exists(stf) else {'i':0,'j':0,'sent':False}
def save(): json.dump(st,open(stf,'w'))
def last(f):
    try: return json.load(open(f))['user'].split('# نوبتِ تازه')[-1].strip()[:120]
    except: return ''
def task(f):
    try: return json.load(open(f)).get('task','?')
    except: return '?'
def answer(n,it):
    st['j']+=1; j=st['j']
    if 'src' in it:
        L=mp.get(it['src'],[])
        if j>len(L):
            f=f'{O}/x{it["src"]}_{j}.txt'
            if not os.path.exists(f): print(f'NEED extra p{n} [{task(D+f"/ai/p{n}.json")}] for src c{it["src"]} -> {f}'); st['j']-=1; save(); sys.exit(3)
            txt=open(f).read(); tag='X'
        else:
            M=L[j-1]; f=f'{O}/r{M}.txt'
            if os.path.exists(f'{O}/r{M}.need') and not os.path.exists(f): print(f'NEED p{n} [{task(D+f"/ai/p{n}.json")}] (src c{it["src"]} old r{M}) -> {f}'); st['j']-=1; save(); sys.exit(3)
            if os.path.exists(f): txt=open(f).read(); tag='OVR r%d'%M
            else:
                txt=subprocess.run(['python3',T+'/subst.py',f'{S}/ai/p{M}.json',f'{D}/ai/p{n}.json'],stdin=open(f'{S}/ai/r{M}.txt'),capture_output=True,text=True).stdout; tag='OLD r%d'%M
            a,b=last(f'{S}/ai/p{M}.json'),last(f'{D}/ai/p{n}.json')
            if a!=b: tag+=f' MISALIGN old={a[:60]!r} new={b[:60]!r}'
    else:
        f=f'{O}/{it["tag"]}_{j}.txt'
        if not os.path.exists(f): print(f'NEED p{n} [{task(D+f"/ai/p{n}.json")}] -> {f}'); st['j']-=1; save(); sys.exit(3)
        txt=open(f).read(); tag='NEW '+it['tag']
    try:
        pu=open(f'{D}/ai/p{n}.json').read()
        for pre in ('prc_','pb_l_'):
            pids=[]
            for m in re.findall(pre+r'[a-z0-9]+',pu):
                if m not in pids: pids.append(m)
            for m in set(re.findall(pre+r'[a-z0-9]+',txt)):
                if m not in pids and pids: txt=txt.replace(m,pids[0]); tag+=f' SUB {m}->{pids[0]}'
    except Exception as e: tag+=' suberr'
    open(f'{D}/ai/r{n}.txt','w').write(txt.strip()); print(f'  answered p{n} [{task(D+f"/ai/p{n}.json")}] ({tag})',flush=True); save()
while st['i']<len(plan):
    it=plan[st['i']]
    if 'src' in it:
        c0=open(f'{S}/ctl/c{it["src"]}.json').read()
        if json.loads(c0).get('exit'): it={'exit':True}
    if not st['sent']:
        c=json.dumps(it['new']) if 'new' in it else (json.dumps({'exit':True}) if it.get('exit') else c0)
        st['sent']=True; st['j']=0; save()
        out=subprocess.run(['python3',T+'/go.py',D,c],capture_output=True,text=True).stdout
        if it.get('exit'): print('EXIT sent'); st['i']+=1; st['sent']=False; save(); break
    else:
        out=subprocess.run(['python3',T+'/go.py',D,'--wait'],capture_output=True,text=True).stdout
    while 'PENDING_AI' in out:
        n=int(re.findall(r'PENDING_AI (\d+)',out)[0]); answer(n,it)
        out=subprocess.run(['python3',T+'/go.py',D,'--wait'],capture_output=True,text=True).stdout
    err=[l[:200] for l in out.split('\n') if l.startswith('ERROR')]
    lab=('c%d'%it['src']) if 'src' in it else it.get('tag','?')
    print(f'[{st["i"]}] {lab} ok',err if err else '',flush=True)
    if 'src' in it and st['j']<len(mp.get(it['src'],[])): print(f'  NOTE fewer AI calls than source ({st["j"]}<{len(mp[it["src"]])})')
    st['i']+=1; st['sent']=False; st['j']=0; save()
print('PLAN_DONE' if st['i']>=len(plan) else 'STOPPED')
