import json,sys
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A'
u=json.load(open(f'{R}/{sys.argv[1]}/ai/p{sys.argv[2]}.json'))['user']
i=u.find('{"changed"')
if i<0: print('no result json'); sys.exit()
d=json.loads(u[i:u.find('\n',i)])
for k in ('changed','ask','note'):
    v=d.get(k)
    if isinstance(v,list):
        for x in v: print(k,'|',json.dumps(x,ensure_ascii=False)[:int(sys.argv[3]) if len(sys.argv)>3 else 330])
    elif v: print(k,'|',str(v)[:500])
