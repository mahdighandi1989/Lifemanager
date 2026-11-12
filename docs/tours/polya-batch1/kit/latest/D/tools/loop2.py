#!/usr/bin/env python3
# loop2.py sid — auto-accept old reply while the turn-question signature (turn text, SUG, turn lines, one-question line, unmarked extras) is unchanged
import sys,subprocess,re,os,glob,json
sys.argv_saved=sys.argv; 
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
R=B+'/round21D'; S=sys.argv[1]
src=open(R+'/tools/struct.py').read().split('for s in sys.argv[2:]:')[0].replace("B=sys.argv[1]","")
exec(src)
def sig(path):
    p=json.load(open(path)); u=p['user']
    if not p['sys'].startswith('تو «دستیار»'): return ('NA',p.get('task'),re.sub(r'\d','',u[-3000:]))
    i=u.find('# نوبتِ تازه'); turn=u[i:].split('\n')[1] if i>=0 else ''
    n,sq,tq,ex=struct(u)
    tl=[l for l in u.split('\n') if 'پرسشِ این نوبت همین است' in l or re.match(r'^- در این نوبت فقط \*\*یک\*\* پرسش',l)]
    tl=[tuple(qsIn(QB.sub(' ',x))) for x in tl if not x.startswith('- پرسش‌های «') and not x.startswith('- زمینه')]
    return (turn,sq,tuple(tl),tuple(ex))
def pend():
    for f in sorted(glob.glob(f'{R}/{S}/ai/p*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0])):
        k=re.findall(r'\d+',os.path.basename(f))[0]
        if not os.path.exists(f'{R}/{S}/ai/r{k}.txt'): return int(k)
while True:
    N=pend()
    if not N: print('NO PENDING'); break
    SD=os.environ.get('SRCD',f'{B}/round21D/{S}'); old=f'{SD}/ai/p{N}.json'
    if not os.path.exists(old) or not os.path.exists(f'{SD}/ai/r{N}.txt'): print(f'STOP p{N} (no old)'); break
    a,b=sig(old),sig(f'{R}/{S}/ai/p{N}.json')
    ok=a[:3]==b[:3] and (a[0]=='NA' and a==b or a[0]!='NA' and set(b[3])<=set(a[3]))
    if not ok:
        print(f'STOP p{N} sig differs')
        for x,y,nm in zip(a,b,['turn','sug','tl','extras']):
            if x!=y: print('  ',nm,'\n    OLD:',str(x)[:700],'\n    NEW:',str(y)[:700])
        break
    K=len(glob.glob(f'{R}/{S}/ctl/c*.json'))
    o=subprocess.run(['bash',f'{R}/tools/nx.sh',S,str(N),str(K)],capture_output=True,encoding='utf-8',errors='replace',env=dict(os.environ,OL='200')).stdout
    ks=re.findall(r'STOPPED_AT_SRC (\d+)',o)
    print(f'auto p{N} (K={K}) ->',ks[-1] if ks else 'END',[l[:160] for l in o.split('\n') if 'ERROR' in l][:3],flush=True)
    if not ks: print('END'); break
