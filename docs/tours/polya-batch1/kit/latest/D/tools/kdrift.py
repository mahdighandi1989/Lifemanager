import json,re,sys,glob,os
s=sys.argv[1]
run=open(s+'.run').read()
def keys(pf):
    u=json.load(open(pf))['user']; i=u.find('# صفحهٔ فعلی'); t=u[i:]
    d={m.group(1):m.group(2)[:50] for m in re.finditer(r'(k\d+)=«([^»]{0,60})',t)}
    for m in re.finditer(r'- (k\d+) \| (\w+) \| «([^»]{0,50})',t): d[m.group(1)]=m.group(3)
    return d
for m in re.finditer(r'answered p(\d+) \[[^\]]*\] \(OLD r(\d+)',run):
    n,o=m.group(1),m.group(2)
    try: rep=json.loads(open(f'../round20D/{s}/ai/r{o}.txt').read())
    except Exception: continue
    acts=[a for a in rep.get('actions',[]) if isinstance(a,dict) and a.get('k')]
    if not acts: continue
    try: ka=keys(f'../round20D/{s}/ai/p{o}.json'); kb=keys(f'{s}/ai/p{n}.json')
    except Exception as e: print('err',e); continue
    for a in acts:
        k=a['k']
        if ka.get(k)!=kb.get(k): print(f'{s} p{n}<-r{o} {a.get("do")} {k}: R20={ka.get(k)!r} R21={kb.get(k)!r}')
