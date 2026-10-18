(()=>{const o={};const s=APP.ASSIST.cur();o.today=APP.today();const cl=(x,n)=>String(x==null?'':x).slice(0,n||160);
o.coach=s&&s.coach?{retracts:s.coach.retracts,guesses:s.coach.guesses,promises:s.coach.promises,result:s.coach.result,retNote:s.coach.retNote}:null;
o.sessRetracts=s&&s.retracts;o.plans=s&&(s.plans||[]).map(q=>({id:q.id,text:q.text,when:q.when,state:q.state,done:q.done,corr:q.corr,src:q.src&&(q.src.span||q.src)}));
o.copyAsk=s&&(s.copyAsk||[]);
o.msgs=s?s.msgs.slice(-60).map(m=>({r:m.role,id:APP.liveMsgId?APP.liveMsgId(m):'',t:cl(m.text,150),corr:m.corr,hist:m.textHist})).filter(m=>m.r==='user'||/^sys|system/.test(m.r)||/✓|اصلاح|ثبت نشد|نپذیرفت/.test(m.t)):[];
o.lp=APP.liveAll().map(r=>{const e=APP.S.get('eprog_'+r.p.id)||{};const L=(e.live||{});const sv=e.solve||{};return {id:r.p.id,title:r.p.title,st:cl(r.p.statement,220),stSrc:r.p.src&&{span:cl(r.p.src.span,80),key:r.p.src.key,edited:r.p.src.edited},stHist:r.p.fixHist||r.p.stHist,phase:APP.livePhase(r.p.id),clos:JSON.stringify(APP.liveClosure(r.p.id)||{}).slice(0,400),chat:L.chat&&JSON.stringify(L.chat).slice(0,300),plan:L.plan&&JSON.stringify(L.plan).slice(0,300),steps:(L.steps||[]).map(x=>({t:cl(x.t||x.text,90),out:x.out&&JSON.stringify(x.out).slice(0,200),fixHist:x.fixHist})),u:JSON.stringify(sv.u||{}).slice(0,500),one:cl(sv.one||(sv.u||{}).one,200),g:JSON.stringify(sv.g||{}).slice(0,300),b:JSON.stringify(sv.b||{}).slice(0,600),ans:JSON.stringify(e.ansLog||sv.ansLog||'').slice(0,300),fix:(JSON.stringify(e).match(/.{0,60}fixHist.{0,300}/g)||[]).slice(0,4)}});
o.dl=APP.S.all('deadline').map(d=>d.what+' @'+d.date+(d.time?' '+d.time:'')+(d.done?' done':'')+(d.fixHist?' fix:'+JSON.stringify(d.fixHist).slice(0,120):''));
o.cards=APP.S.all('card',c=>!c.sample).slice(-6).map(c=>cl(c.q||c.front||c.title,80)+' => '+cl(c.a||c.back,100)+(c.fixHist?' fix':''));
o.rem=(window.__rem||[]).slice(-6).map(x=>x.key+'@'+x.due_date+(x.hour!=null?' h'+x.hour:'')+(x.time?' t'+x.time:'')+' '+cl(x.body||x.title,100));
o.due=APP.dueList().map(d=>d.txt+' / '+(d.sub||''));
try{o.prc=window.__prcInfo?__prcInfo():APP.PR.cases().map(c=>c.id+':'+c.tid+':'+c.state+':'+c.due)}catch(e){o.prc='ERR '+e.message}
try{const M=APP.MIND.phases();o.mind=M.rows.map(r=>r.fa+' '+r.k+'/'+r.n+(r.none?' none':'')+' w'+Math.round((r.pWeak||0)*100)+' ['+(r.acts||[]).map(a=>(a.ok?'+':'-')+a.src+':'+(a.ref||'')+(a.withdrawn?'(W)':'')).join(',')+']')}catch(e){o.mind='ERR '+e.message}
try{o.lists=APP.PR.all(x=>x.kind==='list').map(c=>c.list+':'+(c.items||[]).map(x=>(x.text||x.name||x.claim||x.driver)+(x.recheck?' @'+x.recheck:'')+(x.count?' n'+x.count:'')+(x.status?' '+x.status:'')+(x.closed?' CLOSED':'')).join(' ; ')+' rev:'+(c.reviews||[]).join(','))}catch(e){o.lists='ERR '+e.message}
return JSON.stringify(o)})()
