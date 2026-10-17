#!/usr/bin/env python3
# subst.py OLDP NEWP < reply > reply' — map record ids from old prompt to new prompt by first-appearance order
import sys,re,json
P=r'(?:pb_l_|achat_|case_|lp_)[a-z0-9]+'
def ids(f):
    t=open(f).read(); out=[]
    for m in re.findall(P,t):
        if m not in out: out.append(m)
    return out
r=sys.stdin.read()
try:
    a,b=ids(sys.argv[1]),ids(sys.argv[2])
    pre=lambda x:x.split('_')[0]+'_'+(x.split('_')[1] if x.startswith('pb_l') else '')
    mp={}
    for kind in ('pb_l_','achat_','case_','lp_'):
        A=[x for x in a if x.startswith(kind)]; Bb=[x for x in b if x.startswith(kind)]
        for x,y in zip(A,Bb):
            if x!=y: mp[x]=y
    for x,y in mp.items():
        if x in r: sys.stderr.write(f'SUBST {x}->{y}\n'); r=r.replace(x,y)
except Exception as e: sys.stderr.write('subst err '+str(e)+'\n')
sys.stdout.write(r)
