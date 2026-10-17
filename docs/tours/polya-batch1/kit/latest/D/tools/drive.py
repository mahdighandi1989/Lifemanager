#!/usr/bin/env python3
# drive.py sid [srcdir] — fresh replay of SRC ctl into round19D/sid; each AI call N answered with round19D/sid/ovr/rN.txt if present,
# else old rN with record ids substituted (subst.py). Stops at the first {"exit":true} ctl after which nothing but probes follow (prints STOP_EXIT k).
import sys,os,json,glob,re,subprocess,time
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
R=B+'/round20D'; s=sys.argv[1]; S=sys.argv[2] if len(sys.argv)>2 else B+'/round19D/'+s
D=R+'/'+s; T=R+'/tools'
N=len(glob.glob(S+'/ctl/c*.json'))
def pend():
    for f in sorted(glob.glob(D+'/ai/p*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0])):
        k=re.findall(r'\d+',os.path.basename(f))[0]
        if not os.path.exists(f'{D}/ai/r{k}.txt'): return int(k)
def answer(n):
    o=f'{D}/ovr/r{n}.txt'
    src='OVR' if os.path.exists(o) else 'OLD'
    t=subprocess.run(['python3',T+'/subst.py',f'{S}/ai/p{n}.json',f'{D}/ai/p{n}.json'],stdin=open(o if src=='OVR' else f'{S}/ai/r{n}.txt'),capture_output=True,text=True).stdout
    open(f'{D}/ai/r{n}.txt','w').write(t)
    def last(f):
        try: u=json.load(open(f))['user']; return u.split('# نوبتِ تازه')[-1].strip()[:160]
        except Exception as e: return 'ERR'
    a,b=last(f'{S}/ai/p{n}.json'),last(f'{D}/ai/p{n}.json')
    print(f'  answered p{n} ({src})'+('' if a==b else f' MISALIGN old={a[:80]!r} new={b[:80]!r}'),flush=True)
for k in range(1,N+1):
    c=open(f'{S}/ctl/c{k}.json').read()
    if json.loads(c).get('exit'): print('STOP_EXIT',k); break
    out=subprocess.run(['python3',T+'/go.py',D,c],capture_output=True,text=True).stdout
    while 'PENDING_AI' in out:
        n=int(re.findall(r'PENDING_AI (\d+)',out)[0]); answer(n)
        out=subprocess.run(['python3',T+'/go.py',D,'--wait'],capture_output=True,text=True).stdout
    err=[l[:200] for l in out.split('\n') if l.startswith('ERROR')]
    print(f'c{k} ok',err if err else '',flush=True)
