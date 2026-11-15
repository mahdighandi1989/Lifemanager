import re,sys
cur=open('/home/user/Lifemanager/apps/learning-architecture/dist/learning-architecture.html',encoding='utf-8').read()
for b in sys.argv[1:]:
    src=open(f'round26A/{b}/learning-architecture.html',encoding='utf-8').read()
    ids=set(re.findall(r'"id":"([a-z]{2}_[a-z0-9_]+)"',src))-set(re.findall(r'"id":"([a-z]{2}_[a-z0-9_]+)"',cur))
    out=cur; ins=[]
    for i in sorted(ids):
        k=src.find('"id":"%s"'%i)
        # scan back to object start
        d=0;j=k
        while j>0:
            c=src[j]
            if c=='}': d+=1
            elif c=='{':
                if d==0: break
                d-=1
            j-=1
        # scan fwd to end
        d=0;e=j
        while True:
            c=src[e]
            if c=='{': d+=1
            elif c=='}':
                d-=1
                if d==0: break
            e+=1
        obj=src[j:e+1]
        # anchor: text right after the object in src (next 200 chars) must exist in cur
        anc=src[e+1:e+120]
        n=cur.count(anc)
        print(b,i,len(obj),'anchor count',n, repr(anc[:60]))
        if n==1:
            ins.append((cur.find(anc),obj))
    for p,obj in sorted(ins,key=lambda x:-x[0]): out=out[:p]+','+obj+out[p:]
    import os; os.makedirs(f'round27A/{b}',exist_ok=True)
    open(f'round27A/{b}/learning-architecture.html','w',encoding='utf-8').write(out)
