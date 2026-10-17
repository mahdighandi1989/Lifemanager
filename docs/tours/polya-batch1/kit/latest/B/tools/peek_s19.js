(()=>{__adv(56);const R=JSON.parse(localStorage.getItem('mla.records.v1')||'{}');const V=Object.values(R);
const pg=V.find(r=>r&&r.type==='eprog');const s=pg.solve;const L=s.live||{};
return JSON.stringify({today:APP.today(),phase:s.phase, keys:Object.keys(L), steps:(L.steps||[]).map(x=>({id:x.id,t:String(x.text).slice(0,60),due:x.due,out:!!x.out, pred:String(x.pred||'').slice(0,40)})), due:APP.liveDue&&Object.fromEntries(Object.entries(APP.liveDue()).map(([k,v])=>[k,v.length]))})})()
