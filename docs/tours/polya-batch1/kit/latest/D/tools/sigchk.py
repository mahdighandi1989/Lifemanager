import sys,re,json,os
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
src=open(B+'/round18D/tools/loop2.py').read().split('def pend')[0].replace('S=sys.argv[1]','S="x"')
exec(src)
s=sys.argv[1]; n=1
while os.path.exists(f'{B}/round18D/{s}/ai/p{n}.json'):
    a,b=sig(f'{B}/round18D/{s}/ai/p{n}.json'),sig(f'{B}/round18D/{s}/ai/p{n}.json')
    print(n,'SAME' if a[:3]==b[:3] and set(b[3])<=set(a[3]) else 'DIFF'); n+=1
