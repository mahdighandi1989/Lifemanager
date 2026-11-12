#!/usr/bin/env python3
# says.py sid — only the SAY turns (and day shifts) of a round-25 script
import sys,json,glob,re,os
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25D/'
fs=sorted(glob.glob(B+sys.argv[1]+'/ctl/c*.json'),key=lambda f:int(re.findall(r'\d+',os.path.basename(f))[0]))
W=int(os.environ.get('W','400'))
for i,f in enumerate(fs):
    d=json.load(open(f)); m=re.search(r'const off=([\d.\-]+)\*864e5',d.get('eval0',''))
    if m: print(f'[{i}] DAY {m.group(1)}')
    if d.get('say') is not None: print(f'[{i}] SAY {d["say"][:W]}')
    elif d.get('eval') and not re.search(r'const o=\{\};const s=APP.ASSIST.cur\(\);o.today',d['eval']): print(f'[{i}] ev {d["eval"][:int(os.environ.get("E","90"))]}'.replace('\n',' '))
