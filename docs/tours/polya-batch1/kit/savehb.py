import json,sys
aid,out=sys.argv[1],sys.argv[2]
def txt(x):
    if isinstance(x,str): return x
    if isinstance(x,list): return '\n'.join(txt(i) for i in x)
    if isinstance(x,dict): return txt(x.get('text') or x.get('content') or '')
    return ''
best=''
for l in open('/root/.claude/projects/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5.jsonl'):
    if aid in l and 'Subagent hand-back' in l and len(l)>len(best): best=l
t=txt(json.loads(best).get('message',{}).get('content',''))
open(out,'w').write(t); print(len(t))
