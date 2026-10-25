#!/usr/bin/env python3
"""ans.py sid '<json>' : write akey for the pending prompt (validates json), then caller runs go.sh"""
import json,sys,os
sys.path.insert(0,os.path.dirname(__file__))
from drvlib import keyhash,pending
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25B'
s=sys.argv[1]; D=f'{B}/{s}'; n=pending(D)
txt=sys.argv[2] if len(sys.argv)>2 else sys.stdin.read()
d=json.loads(txt)
h=keyhash(D,n); open(f'{D}/akey/{h}.txt','w').write(json.dumps(d,ensure_ascii=False)); print('wrote',h,'for p',n)
