# pm.py SID N M : extend pidmap from comparing old pM prompt with new pN prompt (pb_l_ and prc_ ids, per prefix, by order of first appearance)
import sys,json,os,re
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,n,m=sys.argv[1:4]
R=re.compile(r'(?:pb_l_|prc_)[a-z0-9]{8,}')
def ids(f):
    p=json.load(open(f)); out=[]
    for x in R.findall(p['sys']+p['user']):
        if x not in out: out.append(x)
    return out
mpf=f'{T}/round24A/{s}/pidmap.json'
mp=json.load(open(mpf)) if os.path.exists(mpf) else {}
o=ids(f'{T}/round23A/{s}/ai/p{m}.json'); w=ids(f'{T}/round24A/{s}/ai/p{n}.json')
for pre in ('pb_l_','prc_'):
    oo=[x for x in o if x.startswith(pre) and x not in mp]; ww=[x for x in w if x.startswith(pre) and x not in mp.values()]
    for a,b in zip(oo,ww): mp[a]=b
json.dump(mp,open(mpf,'w'))
ans=open(f'{T}/round23A/{s}/ai/r{m}.txt').read()
miss=[x for x in set(R.findall(ans)) if x not in mp]
if miss: print('UNMAPPED in answer:',miss,'map',mp); sys.exit(1)
