#!/bin/bash
# rwshow.sh SID : show pending rewrite request: reason + previous reply
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22A
python3 - $1 <<'PY'
import json,sys,os,re
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22A'
s=sys.argv[1]; D=f'{R}/{s}/ai'
ns=sorted(int(m.group(1)) for f in os.listdir(D) for m in [re.match(r'p(\d+)\.json',f)] if m)
n=[x for x in ns if not os.path.exists(f'{D}/r{x}.txt')]
if not n: print('no pending'); sys.exit()
n=n[0]; p=json.load(open(f'{D}/p{n}.json')); u=p['user']; i=u.find('[سامانه — ')
print('PENDING p%d task=%s'%(n,p['task'])); print(u[i:i+700] if i>=0 else u[u.find('# نوبتِ تازه'):][:600])
m=json.load(open(f'{R}/{s}/r10map.json')).get(str(n-1))
print('prev p%d mapped old r%s'%(n-1,m))
try: print('PREV REPLY:',json.load(open(f'{D}/r{n-1}.txt'))['reply'])
except Exception as e: print(e)
PY
