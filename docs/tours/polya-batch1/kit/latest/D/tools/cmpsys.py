# cmpsys.py sid — per «say» ctl: sys lines (page lines) produced in old (round22D) vs new (round23D) run; marks differences
import json,sys,os,glob
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/'
s=sys.argv[1]; O=B+'round22D/'+s; N=B+'round23D/'+s
def ctl(D,k):
    try: return json.load(open(f'{D}/ctl/c{k}.json'))
    except: return None
def msgs(D,k):
    try: return json.load(open(f'{D}/out/s{k}.json')).get('state',{}).get('msgs',[])
    except: return []
no=len(glob.glob(O+'/ctl/c*.json')); nn=len(glob.glob(N+'/ctl/c*.json'))
# align new ctl indexes to old by say text
newsay={}
for k in range(1,nn+1):
    c=ctl(N,k)
    if c and c.get('say'): newsay.setdefault(c['say'],[]).append(k)
prev_o=[];prev_n=[]
for k in range(1,no+1):
    c=ctl(O,k)
    if not c or not c.get('say'): continue
    kn=(newsay.get(c['say']) or [None]).pop(0) if newsay.get(c['say']) else None
    mo=msgs(O,k); mn=msgs(N,kn) if kn else []
    def tail(m):
        # messages after the last user message
        idx=max([i for i,x in enumerate(m) if x.startswith('user:')]+[-1])
        return [x for x in m[idx+1:]]
    to=tail(mo); tn=tail(mn)
    so=[x[:220] for x in to if x.startswith('sys')]; sn=[x[:220] for x in tn if x.startswith('sys')]
    flag='' if so==sn else '  <<DIFF'
    print(f'c{k}->c{kn}: {c["say"][:70]}{flag}')
    if flag:
        for x in so:
            if x not in sn: print('   OLD-only:',x)
        for x in sn:
            if x not in so: print('   NEW-only:',x)
