# prv.py SID N : if prev/SID/ai/pN has the same «# نوبتِ تازه» as current pN, write answer from prev rN (ids remapped); exit 0, else 1
import json,sys,os,re
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22A'
s,n=sys.argv[1],sys.argv[2]
P=f'{R}/prev/{s}/ai'; C=f'{R}/{s}/ai'
if not os.path.exists(f'{P}/p{n}.json') or not os.path.exists(f'{P}/r{n}.txt'): sys.exit(1)
def turn(u): i=u.find('# نوبتِ تازه'); return u[i:] if i>=0 else u[-300:]
po=json.load(open(f'{P}/p{n}.json')); pn=json.load(open(f'{C}/p{n}.json'))
ID=re.compile(r'(?:pb_l_|prc_|prl_|achat_)[a-z0-9]{8,}')
def norm(t): return ID.sub('ID',t)
if norm(turn(po['user']))!=norm(turn(pn['user'])): print('turn differs'); sys.exit(1)
a=open(f'{P}/r{n}.txt').read()
old=[]; new=[]
for x in ID.findall(po['sys']+po['user']):
    if x not in old: old.append(x)
for x in ID.findall(pn['sys']+pn['user']):
    if x not in new: new.append(x)
mp={}
for k in ['pb_l_','prc_','prl_','achat_']:
    o=[x for x in old if x.startswith(k)]; w=[x for x in new if x.startswith(k)]
    for x,y in zip(o,w): mp[x]=y
for x,y in mp.items(): a=a.replace(x,y)
miss=[x for x in ID.findall(a) if x not in new]
if miss: print('UNMAPPED',miss)
open(f'{R}/{s}/ans_{n}.json','w').write(a); print('PREV OK p'+n)
