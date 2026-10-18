import json,sys
a=json.load(open(sys.argv[1])); b=json.load(open(sys.argv[2]))
def walk(x,y,p):
    if isinstance(x,dict) and isinstance(y,dict):
        for k in sorted(set(x)|set(y)): walk(x.get(k),y.get(k),p+'.'+str(k))
    elif isinstance(x,list) and isinstance(y,list) and len(x)==len(y):
        for i,(u,v) in enumerate(zip(x,y)): walk(u,v,p+'[%d]'%i)
    elif x!=y:
        sx=json.dumps(x,ensure_ascii=False); sy=json.dumps(y,ensure_ascii=False)
        print(p,'\n   - ',sx[:600],'\n   + ',sy[:600])
walk(a,b,'')
