#!/usr/bin/env python3
# run.py SID FROM [TO] : replay round23A ctl cFROM..cTO into round24A with pid mapping; stops at AI request
import sys,os,json,re,subprocess,glob
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
R9=T+'/round24A'; R8=T+'/round23A'
sid=sys.argv[1]; a=int(sys.argv[2]); b=int(sys.argv[3]) if len(sys.argv)>3 else 999
D=R9+'/'+sid; MP=D+'/pidmap.json'
PIDRE=re.compile(r'pb_l_[a-z0-9]{8,}')
def old_all():
    s=set()
    for f in glob.glob(R8+'/'+sid+'/ctl/*.json')+glob.glob(R8+'/'+sid+'/out/*.json'):
        s|=set(PIDRE.findall(open(f).read()))
    return sorted(s)
def d(*args,inp=None):
    r=subprocess.run(['python3',R9+'/tools/d.py',sid]+list(args),capture_output=True,text=True,timeout=1200)
    return r.stdout
def newids():
    js=json.dumps({'eval':"JSON.stringify(APP.liveAll().map(r=>r.p.id))"})
    tf=D+'/_tmp.json'; open(tf,'w').write(js); o=d('send','@'+tf); os.remove(tf)
    m=re.search(r'EVAL: (.*)',o)
    try: return sorted(json.loads(json.loads(m.group(1))) if m.group(1).startswith('"') else json.loads(m.group(1)))
    except Exception as e: print('newids fail',o[:500]); return []
mp=json.load(open(MP)) if os.path.exists(MP) else {}
def clockfix(t):
    j=json.loads(t); day=None
    for k in ('eval0','eval'):
        v=j.get(k)
        if not isinstance(v,str): continue
        m=re.search(r'const t=\'(\d{4}-\d\d-\d\d)\';const d=new Date\(\)',v)
        if m and 'lla.clockOff' in v: day=m.group(1); j[k]='"clock->'+day+'"'; continue
        def f(mm):
            nonlocal day; day=mm.group(2); return '0'
        v=re.sub(r'APP\.today\s*=\s*\(\)\s*=>\s*(["\'])(\d{4}-\d\d-\d\d)\1',f,v)
        v=re.sub(r'APP\.clock\.set\((["\'])(\d{4}-\d\d-\d\d)\1\)',f,v)
        j[k]=v
    if day: j['clock']=day
    return json.dumps(j,ensure_ascii=False)
OLD=old_all()
for i in range(a,b+1):
    f=R8+'/'+sid+'/ctl/c%d.json'%i
    if not os.path.exists(f): print('END at',i); break
    ovf=D+'/ovr/c%d.json'%i
    if os.path.exists(ovf):
        L=json.load(open(ovf)); o=''
        for x in L:
            tx=json.dumps(x,ensure_ascii=False)
            need=[p for p in set(PIDRE.findall(tx)) if p not in mp]
            if need:
                nw=[y for y in newids() if y.startswith('pb_l_')]
                for p in need:
                    k=OLD.index(p) if p in OLD else -1
                    if 0<=k<len(nw): mp[p]=nw[k]
                    else: print('!! cannot map',p); sys.exit(2)
                json.dump(mp,open(MP,'w'))
            for o0,n0 in mp.items(): tx=tx.replace(o0,n0)
            tf=D+'/_tmp.json'; open(tf,'w').write(tx); o=d('send','@'+tf); os.remove(tf)
            print('##### replay(ovr) c%d -> %s'%(i,json.dumps(x,ensure_ascii=False)[:160])); print(o[:1500])
        open(D+'/pos','w').write(str(i)); continue
    t=open(f).read().replace('round23A','round24A')
    t=clockfix(t)
    need=[p for p in set(PIDRE.findall(t)) if p not in mp]
    if need:
        nw=[x for x in newids() if x.startswith('pb_l_')]
        for p in need:
            k=OLD.index(p) if p in OLD else -1
            if 0<=k<len(nw): mp[p]=nw[k]
            else: print('!! cannot map',p,'old',OLD,'new',nw); sys.exit(2)
        json.dump(mp,open(MP,'w'))
    for o,n in mp.items(): t=t.replace(o,n)
    if json.loads(t).get('exit'): print('skip exit at',i); break
    tf=D+'/_tmp.json'; open(tf,'w').write(t)
    o=d('send','@'+tf); os.remove(tf)
    print('##### replay c%d -> %s'%(i,t[:160].replace('\n',' ')))
    if '=== AI' in o:
        p=subprocess.run(['python3',R9+'/tools/f.py'],input=o,capture_output=True,text=True).stdout
        print(p); print('##### STOPPED at AI after old c%d'%i); open(D+'/pos','w').write(str(i)); break
    else:
        print(o[:2500])
    open(D+'/pos','w').write(str(i))
