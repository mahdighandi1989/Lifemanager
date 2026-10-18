# ng.py SID N M : answer pN with R10 rM minus redundant go + "opening page" phrase
import sys,json,os,subprocess,re
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,n,m=sys.argv[1:4]
t=open(f'{T}/round22A/{s}/ai/r{m}.txt').read()
j=json.loads(t)
j['actions']=[a for a in j.get('actions',[]) if a.get('do')!='go']
j['reply']=re.sub(r'\s*صفحهٔ (?:همین )?مسئله را باز می‌کنم\.','',j['reply']).strip()
j['memory']=re.sub(r'pb_l_[a-z0-9]+','',j.get('memory',''))
f=f'{T}/round23A/{s}/ans_{n}.json'; open(f,'w').write(json.dumps(j,ensure_ascii=False))
um=f'{T}/round23A/{s}/r10map.json'; u=json.load(open(um)) if os.path.exists(um) else {}
u[str(n)]=str(m); json.dump(u,open(um,'w'))
print(j['reply'])
print(subprocess.run(['python3',f'{T}/round23A/tools/d.py',s,'ans',str(n),'@'+f],capture_output=True,text=True).stdout[-300:])
