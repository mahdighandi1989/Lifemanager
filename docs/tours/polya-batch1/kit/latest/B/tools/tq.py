import json,re,sys,os
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
def tq(u):
    out=[]
    for l in u.split('\n'):
        m=re.search(r'\*\*پرسشِ این نوبت همین است:\*\*(.*)',l)
        if m: out.append(re.sub(r'pb_l_\w+','ID',m.group(1))[:200])
        m=re.search(r'در این نوبت فقط \*\*یک\*\* پرسش[^«]*«([^»]*)»',l)
        if m: out.append('LIVE:'+m.group(1)[:200])
    return out
for s in sys.argv[1:]:
    D=f'{B}/round21B/{s}'; src=open(f'{D}/src.txt').read().strip(); S=f'{B}/round20B/{src}'
    am=json.load(open(f'{D}/amap.json')) if os.path.exists(f'{D}/amap.json') else {}
    log=open(f'{D}/drv.log').read()
    for n,m in sorted(am.items(), key=lambda x:int(x[0])):
        if not re.search(rf'ANS p{n} .*reuse', log): continue
        a=tq(json.load(open(f'{D}/ai/p{n}.json'))['user']); b=tq(json.load(open(f'{S}/ai/p{m}.json'))['user'])
        if a!=b: print(f'{s} p{n}(r20 p{m}) TQ CHANGED\n  R21: {a}\n  R20: {b}')
