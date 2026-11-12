#!/usr/bin/env python3
# a.py sid < reply — answer the pending AI call (validates JSON), then continue the driver
import sys,os,json,glob,re,subprocess
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26D'
s=sys.argv[1]; D=B+'/'+s; num=lambda f:int(re.findall(r'\d+',os.path.basename(f))[0])
t=sys.stdin.read().strip()
p=[num(f) for f in sorted(glob.glob(D+'/ai/p*.json'),key=num) if not os.path.exists(f'{D}/ai/r{num(f)}.txt')]
if not p: print('NO PENDING'); sys.exit(1)
if t[:1] in '{[' and not os.environ.get('RAW'): json.loads(t)
open(f'{D}/ai/r{p[0]}.txt','w').write(t); print('answered p%d'%p[0])
os.execvp('python3',['python3',B+'/tools/d.py',s])
