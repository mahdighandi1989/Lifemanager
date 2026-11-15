import sys,re,difflib
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s=sys.argv[1]; W=int(sys.argv[2]) if len(sys.argv)>2 else 260
def nz(t): return [re.sub(r'(achat|pb_[a-z]|prc|prl|dl)_[a-z0-9]+','ID',l) for l in t.split('\n')]
a=nz(open(f'{B}/round26B/{s}/post.txt',encoding='utf-8').read()); b=nz(open(f'{B}/round27B/{s}/post.txt',encoding='utf-8').read())
seen=set()
for l in difflib.unified_diff(a,b,lineterm='',n=0):
    if l.startswith(('---','+++','@@')): continue
    if l in seen: continue
    seen.add(l); print(l[:W])
