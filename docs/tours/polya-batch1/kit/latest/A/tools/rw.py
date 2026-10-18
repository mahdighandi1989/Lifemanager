# rw.py SID N M 'new reply' [memory-suffix] : answer R11 pN with R10 rM json but reply replaced; records r10map
import sys,json,os,subprocess
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,n,m,rep=sys.argv[1:5]
t=open(f'{T}/round20A/{s}/ai/r{m}.txt').read()
mp=f'{T}/round21A/{s}/pidmap.json'
if os.path.exists(mp):
    for o,w in json.load(open(mp)).items(): t=t.replace(o,w)
j=json.loads(t)
if rep!='-': j['reply']=rep
if len(sys.argv)>5: j['memory']=sys.argv[5]
for a in j.get('actions',[]):
    if a.get('do')=='coach_state' and os.environ.get('SAID') is not None: a['said']=json.loads(os.environ['SAID'])
    if a.get('do')=='coach_state' and os.environ.get('ANS') is not None: a['ans']=json.loads(os.environ['ANS'])
f=f'{T}/round21A/{s}/ans_{n}.json'; open(f,'w').write(json.dumps(j,ensure_ascii=False))
um=f'{T}/round21A/{s}/r10map.json'; u=json.load(open(um)) if os.path.exists(um) else {}
u[str(n)]=str(m); json.dump(u,open(um,'w'))
print(subprocess.run(['python3',f'{T}/round21A/tools/d.py',s,'ans',str(n),'@'+f],capture_output=True,text=True).stdout[:1500])
