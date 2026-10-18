#!/usr/bin/env python3
"""sv.py <sid> <file> : answer the pending call with file content; store it in akey (ids templated) for reruns"""
import json, os, sys, re, importlib.util
B = '/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid = sys.argv[1]; D = f'{B}/round23B/{sid}'
spec = importlib.util.spec_from_file_location('drvm', os.path.join(os.path.dirname(__file__), 'drvlib.py')); M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
n = M.pending(D); t = open(sys.argv[2]).read().strip(); json.loads(t)
h = M.keyhash(D, n); cur = M.ids(json.load(open(f'{D}/ai/p{n}.json'))['user'])
tt = t
for i, x in enumerate(cur): tt = tt.replace(x, f'__I{i}__')
open(f'{D}/akey/{h}.txt', 'w').write(tt); open(f'{D}/ai/r{n}.txt', 'w').write(t)
open(f'{D}/drv.log', 'a').write(f'ANS p{n} task={json.load(open(f"{D}/ai/p{n}.json")).get("task")} manual akey {h}\n'); print('answered p%d akey %s' % (n, h))
