import json,re,sys,os
# patch.py sid n : round17B rN with ids mapped (order of first appearance) + patch apatch/pN.json {cs:{...}, add:[actions], reply:str, rep:[[a,b]], drop:[do-names], nocs:bool}
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,n=sys.argv[1],sys.argv[2]; ss=os.environ.get('SRCS') or s
def ids(f):
  u=json.load(open(f))['user']; out=[]
  for m in re.findall(r'pb_[a-z]_[a-z0-9]+',u):
    if m not in out: out.append(m)
  return out
P=json.load(open(f'{B}/round18B/{s}/apatch/p{n}.json'))
n0=n; n=str(P.get('src',n))
src=f'{B}/round17B/{ss}/ai/r{n}.txt'
t=open(src).read() if os.path.exists(src) else '{"reply":"","actions":[]}'
if os.path.exists(f'{B}/round17B/{ss}/ai/p{n}.json'):
  a=ids(f'{B}/round17B/{ss}/ai/p{n}.json'); b=ids(f'{B}/round18B/{s}/ai/p{n0}.json')
  for x,y in zip(a,b): t=t.replace(x,y)
d=json.loads(t) if 'new' not in P else P['new']
for a_,b_ in P.get('rep',[]): 
  d['reply']=d['reply'].replace(a_,b_)
if 'reply' in P: d['reply']=P['reply']
acts=[x for x in d.get('actions',[]) if x.get('do') not in P.get('drop',[])]
if P.get('cs'):
  cs=[x for x in acts if x.get('do')=='coach_state']
  if cs: cs[0].update(P['cs'])
  else: acts.append(dict({'do':'coach_state'},**P['cs']))
acts+=P.get('add',[])
d['actions']=acts
for k in ('memory','pinned'):
  if k in P: d[k]=P[k]
print(json.dumps(d,ensure_ascii=False))
