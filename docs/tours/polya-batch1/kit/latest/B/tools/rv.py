#!/usr/bin/env python3
"""rv.py sid [from] [to] : per ctl step: her say, then every msg after it in state (ai/sys), eval result (short)"""
import json,os,re,sys
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B'
s=sys.argv[1]; D=f'{B}/{s}'; a=int(sys.argv[2]) if len(sys.argv)>2 else 1; b=int(sys.argv[3]) if len(sys.argv)>3 else 9999
W=int(os.environ.get('W','500')); EL=int(os.environ.get('EL','600'))
ks=sorted(int(x[1:-5]) for x in os.listdir(f'{D}/ctl') if re.match(r'c\d+\.json$',x))
for k in ks:
    if k<a or k>b: continue
    c=json.load(open(f'{D}/ctl/c{k}.json')); f=f'{D}/out/s{k}.json'
    if not os.path.exists(f): print(f'c{k} (no out)'); continue
    o=json.load(open(f)); st=o.get('state') or {}
    if 'say' in c:
        print(f'== c{k} SAY: {c["say"][:W]}' + (f'  [{c["eval0"]}]' if c.get('eval0') else ''))
        m=st.get('msgs',[]); idx=max([i for i,x in enumerate(m) if x.startswith('user: ') and x[6:26]==c['say'][:20]] or [len(m)-3])
        for x in m[idx+1:]: print('    ',x[:W].replace('\n',' ⏎ '))
    elif c.get('exit'): print(f'== c{k} EXIT')
    else:
        print(f'== c{k} EVAL {(c.get("eval") or json.dumps(c,ensure_ascii=False))[:90]} => {str(o.get("eval"))[:EL]}')
    if o.get('error'): print('    ERR',o['error'][:300])
    if o.get('log'): print('    LOG',str(o['log'])[:300])
