# sysat.py sid k [round] — sys lines after the last user msg at ctl k (new and old)
import json,sys
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/'
s,k=sys.argv[1],int(sys.argv[2])
for R in ('round24D','round25D'):
    try: m=json.load(open(f'{B}{R}/{s}/out/s{k}.json')).get('state',{}).get('msgs',[])
    except Exception as e: print(R,e); continue
    idx=max([i for i,x in enumerate(m) if x.startswith('user:')]+[-1])
    print('==',R); [print('  ',x[:700]) for x in m[idx+1:]]
