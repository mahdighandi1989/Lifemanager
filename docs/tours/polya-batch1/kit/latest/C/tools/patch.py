# patch.py sid N  (stdin: json dict patch applied to round22C rN; key "_cs" replaces coach_state; "_omit" removes it)
import sys,json
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid,N=sys.argv[1],sys.argv[2]
src=sys.argv[3] if len(sys.argv)>3 else N
d=json.load(open(f'{T}/round22C/{sid}/ai/r{src}.txt'))
p=json.loads(sys.stdin.read() or '{}')
cs=p.pop('_cs',None); om=p.pop('_omit',False)
d.update(p)
acts=d.get('actions',[])
if cs is not None: acts=[a for a in acts if a.get('do')!='coach_state']+[dict({"do":"coach_state"},**cs)]
if om: acts=[a for a in acts if a.get('do')!='coach_state']
d['actions']=acts
open(f'{T}/round23C/{sid}/ai/r{N}.txt','w').write(json.dumps(d,ensure_ascii=False)); print('wrote',sid,'r'+N,[a.get('do') for a in acts])
