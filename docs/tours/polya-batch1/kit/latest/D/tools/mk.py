#!/usr/bin/env python3
# mk.py sid N 'patch-json' — build round18D/<sid>.ovr/rN.txt from round17D/<sid>/ai/rN.txt
# patch: cs={fields merged into coach_state (adds coach_state if absent)}, omit_cs=true, reply="…", reply_sub=[[old,new],…], acts=[extra actions appended before coach_state]
import sys,json,os
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,n,pj=sys.argv[1],sys.argv[2],json.loads(sys.argv[3])
r=json.loads(open(f'{B}/round17D/{s}/ai/r{n}.txt').read())
A=r.get('actions',[]); cs=[a for a in A if a.get('do')=='coach_state']; rest=[a for a in A if a.get('do')!='coach_state']
rest+=pj.get('acts',[])
if 'reply' in pj: r['reply']=pj['reply']
for a,b in pj.get('reply_sub',[]):
    assert a in r['reply'], ('reply_sub miss',a); r['reply']=r['reply'].replace(a,b)
if pj.get('omit_cs'): cs=[]
elif 'cs' in pj:
    c=cs[0] if cs else {"do":"coach_state","ph":pj.get('ph','u'),"said":[],"ans":[],"stuck":False,"fail":False,"role":"self","nat":pj.get('nat','objective')}
    for k,v in pj['cs'].items():
        if v is None: c.pop(k,None)
        else: c[k]=v
    cs=[c]
r['actions']=rest+cs
os.makedirs(f'{B}/round18D/{s}.ovr',exist_ok=True)
open(f'{B}/round18D/{s}.ovr/r{n}.txt','w').write(json.dumps(r,ensure_ascii=False))
print(s,n,json.dumps(r,ensure_ascii=False)[:900])
