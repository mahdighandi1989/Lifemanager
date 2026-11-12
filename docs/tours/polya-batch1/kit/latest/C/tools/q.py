# q.py sid N  (stdin: JSON {"r":reply, "cs":{coach_state fields}|null, "a":[other actions], + any top-level overrides like status/gap/next/know/title/pinned})
import sys,json,os,re
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26C'
sid,N=sys.argv[1],sys.argv[2]
p=json.loads(sys.stdin.read())
u=json.load(open(f'{R}/{sid}/ai/p{N}.json'))['user']
turn=u.split('# نوبتِ تازه')[-1].strip()
mf=f'{R}/man/{sid}/mem.json'; os.makedirs(f'{R}/man/{sid}',exist_ok=True)
M=json.load(open(mf)) if os.path.exists(mf) else {'title':'','pinned':'','mem':[]}
if p.get('title'): M['title']=p.pop('title')
if p.get('pinned'): M['pinned']=p.pop('pinned')
if not turn.startswith('[سامانه'): M['mem'].append('کاربر: '+turn[:90].replace('\n',' '))
M['mem'].append('دستیار: '+p['r'][:70])
M['mem']=M['mem'][-14:]
json.dump(M,open(mf,'w'),ensure_ascii=False)
acts=list(p.pop('a',[]) or [])
cs=p.pop('cs',None)
if cs is not None:
    base={"do":"coach_state","ph":"u","said":[],"ans":[],"stuck":False,"fail":False,"role":"self","nat":"?"}; base.update(cs); acts.append(base)
d={"reply":p.pop('r'),"title":M['title'] or 'گفت‌وگو',"pinned":M['pinned'] or M['title'],"memory":' / '.join(M['mem']),"status":"related","next":False,"outside":"","know":[],"steps":[],"actions":acts}
d.update(p)
print(json.dumps(d,ensure_ascii=False))
