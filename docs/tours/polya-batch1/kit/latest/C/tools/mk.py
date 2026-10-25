# mk.py: helpers to build ctl json lines
import json
P="(window.__PID||localStorage.getItem('__PID')||APP.state.arg||((APP.liveAll().slice(-1)[0]||{p:{}}).p.id))"
def card(v):
    return {"eval":"(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const pn=document.querySelector('.as-panel');if(!pn||pn.hidden)APP.ASSIST.toggle(true);await W(300);const c=[...document.querySelectorAll('.age-ask')].pop();if(!c)return 'NO CARD';const i=c.querySelector('.age-in');i.focus();i.value=%s;i.dispatchEvent(new Event('input',{bubbles:true}));[...c.querySelectorAll('button')].find(b=>b.textContent.trim()==='ثبت').click();await W(400);const e=c.querySelector('.age-err');return 'typed='+%s+' err='+(e?e.textContent:'')+' | birth='+APP.AGE.birth()+' j='+JSON.stringify(APP.AGE.g2j(APP.AGE.birth()||'x'))+' age='+APP.AGE.age()+' band='+((APP.AGE.band(APP.AGE.age())||{}).id)+' card='+!!document.querySelector('.age-ask')})()"%(json.dumps(v,ensure_ascii=False),json.dumps(v,ensure_ascii=False))}
def later():
    return {"eval":"(()=>{const c=[...document.querySelectorAll('.age-ask')].pop();if(!c)return 'NO CARD';[...c.querySelectorAll('button')].find(b=>b.textContent.trim()==='بعداً').click();return 'later; age='+APP.AGE.age()})()"}
def birth():
    return {"eval":"(()=>'birth='+APP.AGE.birth()+' j='+JSON.stringify(APP.AGE.g2j(APP.AGE.birth()||'x'))+' age='+APP.AGE.age()+' band='+((APP.AGE.band(APP.AGE.age())||{}).id)+' said='+JSON.stringify((APP.S.settings().profile||{}).ageSaid||null)+' sys='+JSON.stringify((APP.ASSIST.cur().msgs||[]).filter(m=>m.role==='sys'&&/تولد/.test(m.text)).map(m=>m.text)))()"}
def panel(name):
    return {"shot":{"name":name,"fold":False,"full":False,"js":"(()=>{const pn=document.querySelector('.as-panel');if(!pn||pn.hidden)APP.ASSIST.toggle(true);const b=document.querySelector('.as-body,.as-msgs');if(b)b.scrollTop=b.scrollHeight;return 'panel'})()"}}
def route(tag, chat=False, sel='.rt-pt.rt-p-det'):
    pj="(APP.ASSIST.cur().id)" if chat else P
    return [{"shot":{"name":"route_"+tag,"full":True,"js":"(()=>{const p=%s;APP.go('route',p);return p})()"%pj}},
     {"eval":"(()=>{const p=%s;const M=APP.ROUTE&&APP.ROUTE.model(p);return JSON.stringify(M?{n:M.pts.length,now:M.nowFa,dest:M.dest,remain:M.remain,dets:M.dets.map(d=>({k:d.kind,c:d.concept,depth:d.depth,open:d.open,rejoin:d.rejoin,sheet:d.sheet})),backs:M.backs.length,pts:M.pts.map(x=>x.cls+'|'+x.k+'|'+String(x.title||'').slice(0,60))}:'NO MODEL')})()"%pj},
     {"shot":{"name":"route_"+tag+"_hover","full":False,"js":"(()=>{const L=[...document.querySelectorAll('%s')];const g=L.pop()||[...document.querySelectorAll('.rt-pt')].pop();if(!g)return 'NO PT';g.scrollIntoView({block:'center'});g.dispatchEvent(new Event('mouseenter'));const t=document.querySelector('.rt-tip');return g.getAttribute('aria-label')+' || '+(t?t.innerText:'')})()"%sel}}]
def fin(tag='post', chat=False):
    pj="(APP.ASSIST.cur().id)" if chat else P
    L=[]
    if not chat:
        L.append({"shot":{"name":tag+"_lprob","full":True,"js":"(()=>{const p=%s;APP.go('lprob',p);return p})()"%P}})
        L.append({"shot":{"name":tag+"_dossier","full":True,"js":"(()=>{const p=%s;APP.go('dossier',p);return p})()"%P}})
    L.append({"shot":{"name":tag+"_mind","view":["mind"],"full":True,"js":"(()=>{document.querySelectorAll('details').forEach(d=>{if(/از کجا/.test(d.innerText.slice(0,40)))d.open=true});return 1})()"}})
    L.append({"eval":"(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));APP.go('mind');await W(1800);const t=document.querySelector('#main').innerText;const out=[];let i=-1;for(const m of t.matchAll(/هنجار|هم‌سن|گروه‌های سنی|سن: |علت|ضعیف‌ترین|پیش‌نیاز ·/g)){if(m.index-i>250){out.push(t.slice(Math.max(0,m.index-150),m.index+350));i=m.index;}}return out.join(' ⟂ ').slice(0,4000)})()"})
    L.append({"shot":{"name":tag+"_today","view":["today"],"full":True}})
    L.append({"eval":"(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));APP.go('today');await W(1200);return 'TODAY '+APP.today()+' || '+document.querySelector('#main').innerText.slice(0,2500)})()"})
    L.append({"shot":{"name":tag+"_sessdossier","full":True,"js":"(()=>{const s=APP.ASSIST.cur();APP.go('dossier',s.id);return s.id})()"}})
    L.append({"eval":"(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const s=APP.ASSIST.cur();APP.go('dossier',s.id);await W(1200);return document.querySelector('#main').innerText.slice(0,5000)})()"})
    if not chat:
        L.append({"eval":"(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const p=%s;APP.go('dossier',p);await W(1200);return document.querySelector('#main').innerText.slice(0,5000)})()"%P})
    L.append(panel(tag+'_panel'))
    return L
def clock(d):
    HELP=json.load(open('/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24C/s22/ctl/c1.json'))['eval0']
    PIDJ="(window.__PID||localStorage.getItem('__PID')||(APP.liveAll().slice(-1)[0]||{p:{}}).p.id)"
    return [{"eval":"(()=>{const p=%s;if(p)localStorage.setItem('__PID',p);APP.clock.dev=true;localStorage.setItem('lla.dev','1');return APP.clock.set('%s')+' pid='+p})()"%(PIDJ,d)},{"exit":True},{"eval0":HELP+";window.__PID=localStorage.getItem('__PID')||(APP.liveAll().slice(-1)[0]||{p:{}}).p.id;if(window.__PID)APP.go('lprob',window.__PID);'restored '+APP.today()+' '+window.__PID"}]
def write(sid, L):
    import os,glob
    D='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C/src/%s/ctl'%sid
    os.makedirs(D,exist_ok=True)
    for f in glob.glob(D+'/*'): os.remove(f)
    for i,o in enumerate(L): open('%s/c%d.json'%(D,i+1),'w').write(o if isinstance(o,str) else json.dumps(o,ensure_ascii=False))
    print(sid,len(L))
def append(sid, L):
    import os,glob
    D='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25C/src/%s/ctl'%sid
    n=len(glob.glob(D+'/c*.json'))
    for i,o in enumerate(L): open('%s/c%d.json'%(D,n+i+1),'w').write(o if isinstance(o,str) else json.dumps(o,ensure_ascii=False))
    print(sid,'appended',len(L),'->',n+len(L))
def old(sid,i):
    return open('/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24C/%s/ctl/c%d.json'%(sid,i)).read()
