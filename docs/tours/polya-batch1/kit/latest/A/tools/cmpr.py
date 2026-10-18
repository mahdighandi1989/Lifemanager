import json,os,sys,re
R,R22,s=sys.argv[1:4]
def reps(d):
    out={}
    if not os.path.isdir(d): return out
    for f in os.listdir(d):
        m=re.match(r'r(\d+)\.txt$',f)
        if not m: continue
        t=open(os.path.join(d,f)).read()
        try: j=json.loads(t); rp=j.get('reply') if isinstance(j,dict) else None
        except Exception: rp=None
        out[int(m.group(1))]=(rp,t)
    return out
a=reps(os.path.join(R,s,'ai')); b=reps(os.path.join(R22,s,'ai'))
old=set(v[0] for v in b.values() if v[0])
for n in sorted(a):
    rp,t=a[n]
    p=json.load(open(os.path.join(R,s,'ai','p%d.json'%n)))
    tag='SAME' if rp in old else ('NEW' if rp else 'NOREPLY')
    print(n,p.get('task'),tag,(rp or t)[:160].replace('\n',' '))
