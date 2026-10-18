#!/usr/bin/env python3
# mkplan21.py sid [ins.json] — plan = round21D src 1..N (exit dropped) with insertions {"after":k,"items":[...]} / {"before":k,...} / {"drop":[k..]} / {"replace":{k:item}}, then dosend + exit
import sys,json,glob,os
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s=sys.argv[1]; S=B+'/round21D/'+s; T=B+'/round23D/tools'
N=len(glob.glob(S+'/ctl/c*.json'))
ins=json.load(open(sys.argv[2])) if len(sys.argv)>2 else {}
drop=set(ins.get('drop',[])); rep={int(k):v for k,v in ins.get('replace',{}).items()}
aft={int(k):v for k,v in ins.get('after',{}).items()}; bef={int(k):v for k,v in ins.get('before',{}).items()}
P=[]
for k in range(1,N+1):
    c=json.load(open(f'{S}/ctl/c{k}.json'))
    if c.get('exit') or 'as-doslink' in str(c.get('eval','')): continue
    P+=bef.get(k,[])
    if k in rep: P+= rep[k] if isinstance(rep[k],list) else [rep[k]]
    elif k not in drop: P.append({'src':k})
    P+=aft.get(k,[])
P+=ins.get('end',[])
P.append({'new':{'eval':open(T+'/dosend.js').read()},'tag':'dosend'})
P.append({'exit':True})
json.dump(P,open(f'{B}/round23D/{s}.plan.json','w'),ensure_ascii=False,indent=0)
print(len(P),'items')
