(()=>{const R=JSON.parse(localStorage.getItem('mla.records.v1')||'{}');const V=Object.values(R);
const ach=V.filter(r=>r&&r.type==='achat').map(s=>({id:s.id,lprob:s.lprob,lprobAt:s.lprobAt,log:s.lprobLog,inv:s.invented,n:(s.msgs||[]).length,last:(s.msgs||[]).slice(-3).map(m=>m.role+':'+String(m.text).slice(0,90)+' '+JSON.stringify(m.actions||''))}));
const ep=V.filter(r=>r&&r.type==='eprob'&&r.live).map(r=>({id:r.p&&r.p.id,t:r.title,sess:r.sess,by:r.by,dormant:r.dormant,origin:r.origin,restated:r.p&&r.p.restated}));
return JSON.stringify({ach,ep},null,1)})()
