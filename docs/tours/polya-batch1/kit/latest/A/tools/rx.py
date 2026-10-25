#!/usr/bin/env python3
# rx.py SID N M 'EXTRA_JSON' : answer pN with r17 rM (pid-mapped), merged with EXTRA:
#   keys merged into coach_state; special: _cs:false drop coach_state; _reply: replace reply; _add:[actions]; _del:[do names]; _set:{top-level keys}
import sys,json,os,subprocess,re
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,n,m=sys.argv[1:4]; ex=json.loads(sys.argv[4]) if len(sys.argv)>4 else {}
D=f'{T}/round25A/{s}'
if m!='0':
    r=subprocess.run(['python3',T+'/round25A/tools/pm.py',s,n,m],capture_output=True,text=True)
    if r.returncode: print(r.stdout,r.stderr); sys.exit(1)
    t=open(f'{T}/round24A/{s}/ai/r{m}.txt').read()
    mp=f'{D}/pidmap.json'
    if os.path.exists(mp):
        for o,nn in json.load(open(mp)).items(): t=t.replace(o,nn)
    a=json.loads(t)
else: a={"reply":"","status":"related","next":False,"outside":"","know":[],"actions":[]}
acts=a.get('actions') or []
if ex.get('_del'): acts=[x for x in acts if x.get('do') not in ex['_del']]
if '_reply' in ex: a['reply']=ex['_reply']
for k,v in (ex.get('_set') or {}).items(): a[k]=v
acts+= ex.get('_add',[])
csx={k:v for k,v in ex.items() if not k.startswith('_')}
cs=[x for x in acts if x.get('do')=='coach_state']
if ex.get('_cs') is False: acts=[x for x in acts if x.get('do')!='coach_state']
elif csx:
    if cs: cs[0].update(csx)
    else: acts.append(dict({"do":"coach_state"},**csx))
a['actions']=acts
if m!='0':
    uf=f'{D}/r10map.json'; u=json.load(open(uf)) if os.path.exists(uf) else {}; u[n]=m; json.dump(u,open(uf,'w'))
js=json.dumps(a,ensure_ascii=False)
open(f'{D}/ans_{n}.json','w').write(js)
print('ANSWER:',js[:1500])
o=subprocess.run(['python3',T+'/round25A/tools/d.py',s,'ans',n,'@'+f'{D}/ans_{n}.json'],capture_output=True,text=True,timeout=1200).stdout
print(subprocess.run(['python3',T+'/round25A/tools/f.py'],input=o,capture_output=True,text=True).stdout[-4000:])
