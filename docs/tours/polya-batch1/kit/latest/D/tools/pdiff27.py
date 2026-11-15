#!/usr/bin/env python3
# pdiff27.py sid [N] — diff each round-27 prompt pN against the round-26 prompt it was answered from (changed lines only)
import json,sys,re,difflib,os
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s=sys.argv[1]; only=int(sys.argv[2]) if len(sys.argv)>2 else None
mp={}
for l in open(f'{B}/round27D/{s}.run',encoding='utf-8'):
    m=re.search(r'answered p(\d+) \[[^\]]*\] \((?:OLD|OVR) r(\d+)',l)
    if m: mp[int(m.group(1))]=int(m.group(2))
def norm(t):
    t=re.sub(r'(pb_l_|achat_|case_|lp_|prc_|it1_|sh)[a-z0-9_]+','ID',t)
    t=re.sub(r'\d{4}-\d\d-\d\dT[\d:.]+Z?','TS',t)
    return t.split('\n')
for n,m in sorted(mp.items()):
    if only and n!=only: continue
    a=json.load(open(f'{B}/round26D/{s}/ai/p{m}.json')); b=json.load(open(f'{B}/round27D/{s}/ai/p{n}.json'))
    print(f'===== p{n} (old p{m}) task {a.get("task")}->{b.get("task")}')
    for part in ('sys','user'):
        d=[l for l in difflib.unified_diff(norm(a.get(part,'')),norm(b.get(part,'')),lineterm='',n=0) if l[:1] in '+-' and not l.startswith(('+++','---'))]
        for l in d[:int(os.environ.get('MX','40'))]: print(part[0],l[:int(os.environ.get('W','400'))])
