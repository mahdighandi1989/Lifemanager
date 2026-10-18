#!/bin/bash
# rwshow.sh sid N — show rewrite request of pN and the reply it rejects (r(N-1))
D=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24D/$1
python3 - $D $2 <<'PY'
import json,sys,re
D,N=sys.argv[1],int(sys.argv[2]); u=json.load(open(f'{D}/ai/p{N}.json'))['user']
m=re.findall(r'\[سامانه — وارسیِ صفحه[^\]]*\]',u); print('REQ:',m[-1] if m else 'none')
print('LAST:',u.split('# نوبتِ تازه')[-1].strip()[:400])
try: print('PREV REPLY:',json.loads(open(f'{D}/ai/r{N-1}.txt').read())['reply'])
except Exception as e: print('prev err',e)
PY
