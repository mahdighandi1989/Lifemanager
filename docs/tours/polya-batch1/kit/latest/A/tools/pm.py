# pm.py SID N M : extend pidmap from comparing round8 pM prompt with round10 pN prompt
import sys,json,os,re
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,n,m=sys.argv[1:4]
R=re.compile(r'pb_l_[a-z0-9]{8,}')
def ids(f):
    p=json.load(open(f)); seen=set(R.findall(p['sys']+p['user']))
    return sorted(seen)
mpf=f'{T}/round19A/{s}/pidmap.json'
mp=json.load(open(mpf)) if os.path.exists(mpf) else {}
o=ids(f'{T}/round18A/{s}/ai/p{m}.json'); w=ids(f'{T}/round19A/{s}/ai/p{n}.json')
w=[x for x in w if x not in mp.values()] ; o2=[x for x in o if x not in mp]
for a,b in zip(o2,w): mp[a]=b
json.dump(mp,open(mpf,'w'))
ans=open(f'{T}/round18A/{s}/ai/r{m}.txt').read()
miss=[x for x in set(R.findall(ans)) if x not in mp]
if miss: print('UNMAPPED in answer:',miss,'map',mp); sys.exit(1)
