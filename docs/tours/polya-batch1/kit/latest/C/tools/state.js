(()=>{const out={};const ss=APP.ASSIST.sessions();out.sessions=ss.map(s=>({id:s.id,n:(s.msgs||[]).length,lprob:s.lprob}));
const s=APP.ASSIST.cur();out.cur=s&&s.id;
out.user=(s.msgs||[]).filter(m=>m.role==='user').map((m,i)=>(i+1)+' ['+APP.ASSIST.msgId(m)+'] '+m.text.slice(0,140));
out.probs=APP.liveAll().map(r=>{const pg=APP.S.get('eprog_'+r.p.id)||{};const sv=pg.solve||{};const L=sv.live||{};return {id:r.p.id,t:r.p.title,st:APP.liveClosure(r.p.id).state,stmt:(r.p.statement||'').slice(0,160),g:JSON.stringify(sv.g||null).slice(0,500),plan:JSON.stringify(L.plan||null).slice(0,200),steps:(L.steps||[]).map(x=>({t:(x.text||'').slice(0,60),due:x.due,out:JSON.stringify(x.out||null).slice(0,250)}))}});
out.plans=JSON.stringify((s.coach||{}).plans||null).slice(0,800);
out.today=(document.querySelector('#main')||{}).innerText?'':'';
return JSON.stringify(out,null,1);})()
