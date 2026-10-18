# rshot.py tag [hoversel] -> print ctl json lines for a route-map shot + model probe + hover shot
import json,sys
tag=sys.argv[1]; sel=sys.argv[2] if len(sys.argv)>2 else '.rt-pt.rt-p-det'
P="(window.__PID||localStorage.getItem('__PID')||APP.state.arg||((APP.liveAll().slice(-1)[0]||{p:{}}).p.id))"
out=[{"shot":{"name":"route_"+tag,"full":True,"js":"(()=>{const p=%s;APP.go('route',p);return p})()"%P}},
 {"eval":"(()=>{const p=%s;const M=APP.ROUTE&&APP.ROUTE.model(p);return JSON.stringify(M?{n:M.pts.length,now:M.nowFa,dest:M.dest,remain:M.remain,dets:M.dets.map(d=>({k:d.kind,c:d.concept,depth:d.depth,open:d.open,rejoin:d.rejoin})),backs:M.backs.length,pts:M.pts.map(x=>x.cls+'|'+x.k+'|'+String(x.title||'').slice(0,50))}:'NO MODEL')})()"%P},
 {"shot":{"name":"route_"+tag+"_hover","full":False,"js":"(()=>{const L=[...document.querySelectorAll('%s')];const g=L.pop()||document.querySelector('.rt-pt');if(!g)return 'NO PT';g.scrollIntoView({block:'center'});g.dispatchEvent(new Event('mouseenter'));const t=document.querySelector('.rt-tip');return g.getAttribute('aria-label')+' || '+(t?t.innerText:'')})()"%sel}}]
for o in out: print(json.dumps(o,ensure_ascii=False))
