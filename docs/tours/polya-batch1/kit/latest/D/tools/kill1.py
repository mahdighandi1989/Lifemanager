#!/usr/bin/env python3
# kill1.py sid — kill only my replay/harness processes for that scenario (never the caller's shell)
import os,sys,signal
s=sys.argv[1]; me={os.getpid(),os.getppid()}
R='tour1_polya/round21D'
for p in os.listdir('/proc'):
    if not p.isdigit() or int(p) in me: continue
    try: a=open(f'/proc/{p}/cmdline','rb').read().split(b'\0')
    except: continue
    a=[x.decode('utf-8','replace') for x in a if x]
    if not a or a[0] in ('bash','-bash','/bin/bash') and any(x=='-c' for x in a): continue
    j=' '.join(a)
    if R not in j: continue
    if f'{R}/{s}' in j or (f'{R}/tools/' in j and s in a):
        try: os.kill(int(p),signal.SIGKILL); print('killed',p,j[:120])
        except Exception as e: print(e)
