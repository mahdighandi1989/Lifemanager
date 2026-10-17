#!/usr/bin/env python3
# drive20.py sid plan.json [--fresh]  — replay with insertions. plan = [{"src":k} | {"new":{ctl}, "tag":"x"} | {"exit":true}]
# src ctl k -> its AI calls answered with round19D/<sid> rN (mapped from round19D/<sid>.run), override ovr/rN.txt (N = source number)
# new ctl -> AI calls answered with ovr/<tag>_<j>.txt (j=1..); missing -> prints NEED and exits (harness keeps waiting); rerun resumes.
import sys,os,json,glob,re,subprocess
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
R=B+'/round20D'; s=sys.argv[1]; plan=json.load(open(sys.argv[2])); S=B+'/round19D/'+s; D=R+'/'+s; T=R+'/tools'
O=R+'/'+s+'.ovr'
# map source ctl -> AI numbers
mp={}; pend=[]
for l in open(B+'/round19D/'+s+'.run'):
    m=re.match(r'\s*answered p(\d+)',l)
    if m: pend.append(int(m.group(1)))
    m=re.match(r'c(\d+) ok',l)
    if m: mp[int(m.group(1))]=pend; pend=[]
stf=D+'/drive_state.json'
st=json.load(open(stf)) if os.path.exists(stf) else {'i':0,'j':0,'sent':False}
def save(): json.dump(st,open(stf,'w'))
def pending():
    for f in sorted(glob.glob(D+'/ai/p*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0])):
        k=re.findall(r'\d+',os.path.basename(f))[0]
        if not os.path.exists(f'{D}/ai/r{k}.txt'): return int(k)
def last(f):
    try: return json.load(open(f))['user'].split('# نوبتِ تازه')[-1].strip()[:120]
    except: return ''
def answer(n,it):
    st['j']+=1; j=st['j']
    if 'src' in it:
        L=mp.get(it['src'],[])
        if j>len(L): print(f'NEED extra AI p{n} for src c{it["src"]} (j={j}) -> write {O}/x{it["src"]}_{j}.txt'); 
        if j>len(L):
            f=f'{O}/x{it["src"]}_{j}.txt'
            if not os.path.exists(f): st['j']-=1; save(); sys.exit(3)
            txt=open(f).read(); tag='X'
        else:
            N=L[j-1]; f=f'{O}/r{N}.txt'
            if os.path.exists(f): txt=open(f).read(); tag='OVR r%d'%N
            else:
                txt=subprocess.run(['python3',T+'/subst.py',f'{S}/ai/p{N}.json',f'{D}/ai/p{n}.json'],stdin=open(f'{S}/ai/r{N}.txt'),capture_output=True,text=True).stdout; tag='OLD r%d'%N
            a,b=last(f'{S}/ai/p{N}.json'),last(f'{D}/ai/p{n}.json')
            if a!=b: tag+=f' MISALIGN old={a[:60]!r} new={b[:60]!r}'
    else:
        f=f'{O}/{it["tag"]}_{j}.txt'
        if not os.path.exists(f): print(f'NEED p{n} -> {f}'); st['j']-=1; save(); sys.exit(3)
        txt=open(f).read(); tag='NEW '+it['tag']
    open(f'{D}/ai/r{n}.txt','w').write(txt.strip()); print(f'  answered p{n} ({tag})',flush=True); save()
while st['i']<len(plan):
    it=plan[st['i']]
    if not st['sent']:
        c=json.dumps(it['new']) if 'new' in it else (json.dumps({'exit':True}) if it.get('exit') else open(f'{S}/ctl/c{it["src"]}.json').read())
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
