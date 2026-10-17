#!/usr/bin/env python3
# usage: ans.py <dir> N < answer   (validates JSON if it starts with { or [)
import sys,json
D,N=sys.argv[1],sys.argv[2]; t=sys.stdin.read().strip()
if t[:1] in '{[': json.loads(t)
open(f'{D}/ai/r{N}.txt','w').write(t); print('ok',len(t))
