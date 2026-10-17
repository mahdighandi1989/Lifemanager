#!/bin/bash
# reuse.sh sid N : answer pending with R8 rN, mapping pb ids (order of first appearance in hook user text)
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya
python3 - $1 $2 <<'PY' | $B/round15B/tools/ans.sh $1 | head -c ${HL:-1500}
import json,re,sys
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,n=sys.argv[1],sys.argv[2]
def ids(f):
  u=json.load(open(f))['user']; out=[]
  for m in re.findall(r'pb_[a-z]_[a-z0-9]+',u):
    if m not in out: out.append(m)
  return out
a=ids(f'{B}/round14B/{s}/ai/p{n}.json'); b=ids(f'{B}/round15B/{s}/ai/p{n}.json')
t=open(f'{B}/round14B/{s}/ai/r{n}.txt').read()
for x,y in zip(a,b): t=t.replace(x,y)
print(t)
PY
