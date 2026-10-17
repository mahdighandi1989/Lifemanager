#!/usr/bin/env python3
# usage: pend.py <dir> N  — print request; sys printed only if new (hash cache)
import sys,json,hashlib,os
D,N=sys.argv[1],sys.argv[2]; p=json.load(open(f'{D}/ai/p{N}.json'))
sysp=p['sys']; h=hashlib.md5(sysp.encode()).hexdigest()[:10]
seen=f'{D}/ai/.seen_sys'; S=set(open(seen).read().split()) if os.path.exists(seen) else set()
print('TASK',p.get('task'),'fileIds',p.get('fileIds'),'SYSLEN',len(sysp),'HASH',h, 'USERLEN',len(p['user']))
full=os.environ.get('FULL')
if h not in S or full:
    print('=== SYS ===');print(sysp); open(seen,'a').write(h+'\n')
else: print('(sys seen) head:',sysp[:300].replace('\n',' '))
print('=== USER ===');u=p['user'];L=int(os.environ.get('UL','12000'))
print(u if len(u)<=L else u[:L//3]+'\n…[cut '+str(len(u)-L)+']…\n'+u[-2*L//3:])
