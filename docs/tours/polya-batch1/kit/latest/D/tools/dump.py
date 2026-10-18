# dump.py sid [tagfilter] — per plan item: tag + eval summary + new msgs since previous item
import json,sys,re,os
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24D/'
s=sys.argv[1]; flt=sys.argv[2] if len(sys.argv)>2 else None
P=json.load(open(R+s+'.plan.json')); prev=[]
for i,x in enumerate(P,1):
    f=f'{R}{s}/out/s{i}.json'
    if not os.path.exists(f): break
    r=json.load(open(f)); m=r.get('state',{}).get('msgs',[])
    tag=x.get('tag') or ('src%d'%x['src'] if 'src' in x else 'EXIT')
    new=[y for y in m if y not in prev][-6:]; prev=m
    if flt and not re.search(flt,tag): continue
    e=str(r.get('eval') or '')
    if e.startswith('{"today"'):
        o=json.loads(e); e='REC today=%s dl=%s prc=%s lists=%s mind=%s'%(o.get('today'),o.get('dl'),[ (c.get('tid'),c.get('state'),c.get('due'),c.get('sess'),c.get('stable')) if isinstance(c,dict) else c for c in (o.get('prc') or [])],o.get('lists'),o.get('mind'))
    print(f'[{i}] {tag}: {e[:int(os.environ.get("EL","600"))]}')
    for y in new:
        if not y.startswith('user:') or os.environ.get('U'): print('    ',y[:int(os.environ.get("ML","400"))])
