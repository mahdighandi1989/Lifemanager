import json,sys
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
def load(r,s):
    t=open(f'{B}/{r}/{s}/best.json',encoding='utf-8').read()
    return json.loads(t[t.index('EVAL:')+6:],strict=False)
for s in sys.argv[1:]:
    a,b=load('round16D',s),load('round18D',s)
    print('########',s)
    for pa,pb in zip(a,b):
        ia=[x['t'] for x in pa['items'] or []]; ib=[x['t'] for x in pb['items'] or []]
        print('##',pb['t'],'| st',pb['st'],'| best-select:',None if pb['best'] is None else len(pb['best']))
        for x in ib: print('   ', '  ' if x in ia else 'NEW', x[:300])
        for x in ia:
            if x not in ib: print('    GONE', x[:300])
