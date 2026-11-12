#!/usr/bin/env python3
"""r.py sid  (stdin: lines R:/M:/T:/P:/S:/G:/A:) -> a/<sid>_cur.json ; then caller runs q.sh"""
import sys,json,os
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B'
s=sys.argv[1]; d={}; cur=None
for l in sys.stdin.read().split('\n'):
    if l[:2] in ('R:','M:','T:','P:','S:','G:','A:','O:','C:','N:'): cur=l[0]; d[cur]=l[2:].strip()
    elif cur: d[cur]+='\n'+l
pf=f'{B}/a/{s}_pin.txt'
if 'P' in d: open(pf,'w').write(d['P'])
pin=open(pf).read() if os.path.exists(pf) else ''
o={"reply":d['R'].strip(),"pinned":pin,"memory":d.get('M','').strip(),"status":d.get('S','related').strip() or 'related',"next":False,"outside":d.get('O','').strip(),"know":[],"steps":[{"t":"کارِ همین گفت‌وگو","s":"now","view":"whole"}],"actions":json.loads(d.get('A','[]').strip() or '[]')}
nf=f'{B}/a/{s}_nat.txt'
if 'N' in d: open(nf,'w').write(d['N'].strip())
if 'C' in d:
    ph,said,ans,ex=(d['C'].strip().split('|',3)+['','',''])[:4]
    a={"do":"coach_state","ph":ph.strip(),"said":[x for x in said.split(',') if x.strip()],"ans":[x for x in ans.split(',') if x.strip()],"stuck":False,"fail":False,"role":"self","nat":open(nf).read() if os.path.exists(nf) else 'life'}
    if ex.strip(): a.update(json.loads(ex))
    o['actions'].append(a)
if 'T' in d: o['title']=d['T'].strip()
if 'G' in d: o['gap']=json.loads(d['G'])
json.dump(o,open(f'{B}/a/{s}_cur.json','w'),ensure_ascii=False); print('ok')
