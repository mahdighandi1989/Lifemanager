# r6.py sid N [omit]  -> reuse round23C rN as answer (optionally strip coach_state); or with stdin python-dict patch
import sys,json
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid,N=sys.argv[1],sys.argv[2]; mode=sys.argv[3] if len(sys.argv)>3 else ''
d=json.load(open(f'{T}/round23C/{sid}/ai/r{N}.txt'))
if not sys.stdin.isatty():
    p=sys.stdin.read().strip()
    if p: d.update(json.loads(p))
if mode=='omit': d['actions']=[a for a in d.get('actions',[]) if a.get('do')!='coach_state']
open(f'{T}/round24C/{sid}/ai/r{N}.txt','w').write(json.dumps(d,ensure_ascii=False)); print('wrote r'+N,[a.get('do') for a in d.get('actions',[])])
