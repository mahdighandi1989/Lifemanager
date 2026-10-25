# wr.py sid N  (stdin raw text) -> write rN + man copy (no JSON reformat), then drive in background
import sys,os,subprocess
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C'
sid,N=sys.argv[1],sys.argv[2]; s=sys.stdin.read().strip()
open(f'{T}/{sid}/ai/r{N}.txt','w').write(s); os.makedirs(f'{T}/man/{sid}',exist_ok=True); open(f'{T}/man/{sid}/r{N}.txt','w').write(s); print('wrote raw',sid,N)
subprocess.Popen('sleep 3; cd '+T+' && T=900 W=300 tools/d.sh '+sid+' > '+sid+'/last.txt 2>&1',shell=True)
