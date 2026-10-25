import json,sys
# extract a subagent's final report: the input of its SubagentHandback tool call (last one wins)
aid,out=sys.argv[1],sys.argv[2]
best=''
for l in open(f'/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/tasks/{aid}.output'):
    try: d=json.loads(l)
    except: continue
    for c in (d.get('message') or {}).get('content') or []:
        if isinstance(c,dict) and c.get('type')=='tool_use' and 'andback' in str(c.get('name','')):
            v=[x for x in c['input'].values() if isinstance(x,str)]
            if v: best=max(v,key=len)
open(out,'w').write(best); print(len(best))
