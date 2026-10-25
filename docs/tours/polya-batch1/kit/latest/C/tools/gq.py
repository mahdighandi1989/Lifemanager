# gq.py sid N marker [extra-json]  -> write rN = round24C rN with guess.q = the question sentence of the reply containing marker; extra json merged (w.py keys)
import sys,json,re,subprocess
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid,N,mk=sys.argv[1:4]; ex=json.loads(sys.argv[4]) if len(sys.argv)>4 else {}
d=json.load(open(f'{T}/round24C/{sid}/ai/r{ex.get("src",N)}.txt')); rep=ex.get('reply',d['reply'])
i=rep.index(mk); a=max(rep.rfind(c,0,i) for c in '.!؟?:\n')+1; b=rep.index('؟',i)+1
q=rep[a:b].strip()
cs=[x for x in d['actions'] if x.get('do')=='coach_state']
g=dict((cs[0].get('guess') if cs else None) or {}); g.update(ex.pop('guess',{})); g['q']=q
add=ex.pop('add',{}); add['guess']=g; ex['add']=add
print('q =',q)
subprocess.run(['python3',T+'/round25C/tools/w.py',sid,N],input=json.dumps(ex,ensure_ascii=False),text=True)
