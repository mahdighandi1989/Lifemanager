#!/usr/bin/env python3
# usage: go.py <dir> '<json ctl>' | go.py <dir> --wait   — writes next ctl (unless --wait) then waits for out or pending AI
import sys, os, json, time, glob, re
D=sys.argv[1]; arg=sys.argv[2] if len(sys.argv)>2 else '--wait'
ctl=os.path.join(D,'ctl'); os.makedirs(ctl,exist_ok=True)
def ncur(): return max([int(re.findall(r'\d+',os.path.basename(f))[0]) for f in glob.glob(ctl+'/c*.json')]+[0])
if arg!='--wait':
    json.loads(arg); n=ncur()+1; open(f'{ctl}/c{n}.json','w').write(arg)
n=ncur(); out=f'{D}/out/s{n}.json'; t0=time.time()
def pending():
    for f in sorted(glob.glob(D+'/ai/p*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0])):
        k=re.findall(r'\d+',os.path.basename(f))[0]
        if not os.path.exists(f'{D}/ai/r{k}.txt'): return int(k)
    return None
while True:
    p=pending()
    if p: print('PENDING_AI',p); sys.exit(0)
    if os.path.exists(out):
        time.sleep(0.5); r=json.load(open(out)); st=r.get('state',{})
        print('STEP',n)
        for k in ('eval0','eval','error','stateError'):
            if k in r: print(k.upper()+':',str(r[k])[:3000])
        if r.get('log'): print('LOG:',r['log'][:5])
        print('VIEW:',st.get('view'),st.get('arg'),st.get('sub'),'rem',st.get('rem'))
        for m in (st.get('msgs',[])[-int(os.environ.get('NM','1')):] if int(os.environ.get('NM','1')) else []): print('MSG>',m[:2500],flush=True)
        if st.get('overlay'): print('OVERLAY:',st['overlay'][:800])
        if st.get('marks'): print('MARKS:',st['marks'][:12])
        if os.environ.get('MAIN'): print('MAIN:',st.get('main','')[:int(os.environ['MAIN'])])
        sys.exit(0)
    if time.time()-t0>900: print('TIMEOUT'); sys.exit(1)
    time.sleep(1.5)
