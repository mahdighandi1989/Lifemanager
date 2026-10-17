#!/usr/bin/env python3
# addcs.py SRC_r.txt DST_r.txt '<coach_state json or "">' — copy a round-4 answer, appending coach_state if given
import sys,json
d=json.loads(open(sys.argv[1]).read())
if len(sys.argv)>3 and sys.argv[3]:
    d.setdefault('actions',[]).append(json.loads(sys.argv[3]))
open(sys.argv[2],'w').write(json.dumps(d,ensure_ascii=False)); print('ok')
