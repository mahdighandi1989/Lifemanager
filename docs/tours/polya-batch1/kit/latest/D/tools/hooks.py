#!/usr/bin/env python3
# usage: hooks.py <dir> N  — prints task + user prompt minus the system map and knowledge bullets
import sys,json,re
D,N=sys.argv[1],sys.argv[2]; p=json.load(open(f'{D}/ai/p{N}.json'));u=p['user'];s=p['sys']
print('TASK',p.get('task'),'SYSHEAD',s[:120].replace('\n',' '),'SYSLEN',len(s))
if not s.startswith('تو «دستیار»'):
    print('=== SYS ===');print(s);print('=== USER ===');print(u[:int(__import__('os').environ.get('UL','20000'))]);sys.exit()
i=u.find('# امروز'); body=u[i:] if i>=0 else u
body=re.sub(r'\n   ·[^\n]*','',body)
k=body.find('# صفحهٔ فعلی'); g=body.find('# گفت‌وگو تا این لحظه')
print(body[:k]); 
pg=body[k:g]; print(pg[:int(__import__('os').environ.get('PG','3500'))])
conv=body[g:]
L=int(__import__('os').environ.get('CV','2500'))
print(conv if len(conv)<L else '...'+conv[-L:])
