import json,sys
aid,out=sys.argv[1],sys.argv[2]
best=''
for l in open(f'/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/tasks/{aid}.output'):
    try: d=json.loads(l)
    except: continue
    for c in (d.get('message') or {}).get('content') or []:
        if isinstance(c,dict) and c.get('type')=='tool_use':
            for v in c['input'].values():
                if isinstance(v,str) and len(v)>len(best) and 'round 2' in v.lower() and 'Runner' in v: best=v
open(out,'w').write(best); print(len(best))
