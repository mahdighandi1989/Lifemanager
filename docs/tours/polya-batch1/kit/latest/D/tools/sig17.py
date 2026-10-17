import sys,re,json,os
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
src=open(B+'/round19D/tools/loop2.py').read().split('def pend')[0].replace('S=sys.argv[1]','S="x"')
exec(src)
s=sys.argv[1]; n=1
while os.path.exists(f'{B}/round19D/{s}/ai/p{n}.json'):
    o=f'{B}/round18D/{s}/ai/p{n}.json'
    if not os.path.exists(o): print(n,'NO OLD'); n+=1; continue
    a,b=sig(o),sig(f'{B}/round19D/{s}/ai/p{n}.json')
    ok=a[:3]==b[:3] and set(b[3])<=set(a[3])
    print(n,'SAME' if ok else 'DIFF')
    if not ok:
        for x,y,nm in zip(a,b,['turn','sug','tl','extras']):
            if x!=y: print('  ',nm,'\n    OLD:',str(x)[:400],'\n    NEW:',str(y)[:400])
    n+=1
