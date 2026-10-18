# nr.py sid N  (stdin: reply json) -> write rN + man copy, then drive in background
import sys,json,os,subprocess
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23C'
sid,N=sys.argv[1],sys.argv[2]; t=sys.stdin.read().strip(); d=json.loads(t); s=json.dumps(d,ensure_ascii=False)
open(f'{T}/{sid}/ai/r{N}.txt','w').write(s); os.makedirs(f'{T}/man/{sid}',exist_ok=True); open(f'{T}/man/{sid}/r{N}.txt','w').write(s)
print('wrote',sid,'r'+N,[a.get('do') for a in d.get('actions',[])])

subprocess.Popen('sleep 3; cd '+T+' && tools/dd.sh '+sid,shell=True)