#!/usr/bin/env python3
# subst.py OLDP NEWP < reply > reply' — map record ids from old prompt to new prompt by first-appearance order;
# round 23: also map field keys kN by their «label» in the prompt's field list ("- kN | type | «label» | …")
import sys,re,json
P=r'(?:pb_l_|achat_|case_|lp_)[a-z0-9]+'
def txt(f):
    d=json.load(open(f)); return d.get('sys','')+'\n'+d.get('user','')
def ids(t):
    out=[]
    for m in re.findall(P,t):
        if m not in out: out.append(m)
    return out
def keys(t):
    mp={}
    for k,ty,lab in re.findall(r'^- (k\d+) \| ([^|]+)\| (.{0,120}?) \|',t,re.M):
        mp[k]=(ty.strip(),lab.strip())
    for k,lab in re.findall(r'(?<![\w])(k\d+)=«([^»]{1,90})»',t):
        mp.setdefault(k,('btn',lab.strip()))
    return mp
r=sys.stdin.read()
try:
    ta,tb=txt(sys.argv[1]),txt(sys.argv[2])
    a,b=ids(ta),ids(tb)
    mp={}
    for kind in ('pb_l_','achat_','case_','lp_'):
        A=[x for x in a if x.startswith(kind)]; Bb=[x for x in b if x.startswith(kind)]
        for x,y in zip(A,Bb):
            if x!=y: mp[x]=y
    for x,y in mp.items():
        if x in r: sys.stderr.write(f'SUBST {x}->{y}\n'); r=r.replace(x,y)
    ka,kb=keys(ta),keys(tb); inv={}
    for k,v in kb.items(): inv.setdefault(v,k)
    km={}
    for k,v in ka.items():
        if v in inv and inv[v]!=k: km[k]=inv[v]
    if km:
        def rep(m):
            k=m.group(2); return m.group(1)+km.get(k,k)+m.group(3)
        r2=re.sub(r'("k"\s*:\s*")(k\d+)(")',rep,r)
        if r2!=r: sys.stderr.write('KEYS '+json.dumps({k:v for k,v in km.items() if ('"'+k+'"') in r})+'\n')
        r=r2
except Exception as e: sys.stderr.write('subst err '+str(e)+'\n')
sys.stdout.write(r)
