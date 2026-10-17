import sys,os,json,re,difflib
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid=sys.argv[1]; R8=T+'/round15A/'+sid; R9=T+'/round16A/'+sid
mp=json.load(open(R9+'/pidmap.json')) if os.path.exists(R9+'/pidmap.json') else {}
def norm(s):
    s=re.sub(r'pb_l_[a-z0-9]{8,}','PID',s); s=re.sub(r'achat_[a-z0-9]+','CH',s); s=re.sub(r'20\d\d-\d\d-\d\dT[\d:.]+Z?','TS',s)
    s=re.sub(r'(sv|lp|kp)_[a-z0-9]{8,}','ID',s); return s
def load(D):
    res={}
    n=1
    while os.path.exists(D+'/ctl/c%d.json'%n):
        c=open(D+'/ctl/c%d.json'%n).read()
        for o,nw in mp.items(): c=c.replace(nw,o)
        c=c.replace('round16A','round15A')
        f=D+'/out/s%d.json'%n
        o=json.load(open(f)) if os.path.exists(f) else {}
        res.setdefault(c.strip(),[]).append(norm(str(o.get('eval') or o.get('eval0') or ''))+' ||MSG '+norm(' '.join((o.get('state') or {}).get('msgs',[])[-1:])))
        n+=1
    return res
a=load(R8); b=load(R9)
for k in a:
    if k not in b: continue
    for x,y in zip(a[k],b[k]):
        if x!=y:
            print('=== CTL',k[:150].replace('\n',' '))
            for l in difflib.unified_diff(x.split('\n'),y.split('\n'),n=0,lineterm=''):
                if l.startswith(('---','+++','@@')): continue
                print(l[:500])
