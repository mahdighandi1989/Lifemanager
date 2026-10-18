# cmp.py sid -> compare out evals R7 vs R8 (normalized), show differing ones
import json,sys,re,os,glob
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s=sys.argv[1]; W=int(sys.argv[2]) if len(sys.argv)>2 else 400
def norm(x): 
    x=re.sub(r'pb_l_[a-z0-9]+|achat_[a-z0-9]+|\d{4}-\d\d-\d\dT[\d:.]+Z|lv_[a-z0-9]+|sh\d+|\d+ دقیقه','X',x); return x
for f in sorted(glob.glob(f'{T}/round24C/{s}/out/s*.json'),key=lambda x:int(x.split('/s')[-1][:-5])):
    n=f.split('/s')[-1][:-5]; g=f'{T}/round23C/{s}/out/s{n}.json'
    a=json.load(open(f)); b=json.load(open(g)) if os.path.exists(g) else {}
    for k in ('eval0','eval','error','log'):
        x=norm(json.dumps(a.get(k,''),ensure_ascii=False)); y=norm(json.dumps(b.get(k,''),ensure_ascii=False))
        if x!=y:
            i=0
            while i<min(len(x),len(y)) and x[i]==y[i]: i+=1
            st=max(0,i-80)
            print(f's{n} {k} @{i}\n  R7: {y[st:st+W]}\n  R8: {x[st:st+W]}')
