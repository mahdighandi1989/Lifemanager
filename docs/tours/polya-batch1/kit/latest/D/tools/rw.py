# rw.py sid N outfile 'new reply' — take r(N-1) actions, set reply, write to ovr outfile
import json,sys
D='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25D/'
s,N,out,txt=sys.argv[1],int(sys.argv[2]),sys.argv[3],sys.argv[4]
a=json.loads(open(f'{D}{s}/ai/r{N-1}.txt').read()); a['reply']=txt
open(out if out.startswith('/') else f'{D}{s}.ovr/{out}','w').write(json.dumps(a,ensure_ascii=False)); print('ok')
