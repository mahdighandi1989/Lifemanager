(async(o)=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const f=(id,v)=>{const e=document.getElementById(id);if(!e)return id+'?';e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'};
const r=[];if(o.topic)r.push(f('ex_topic',o.topic));r.push(f('ex_pred',String(o.pred)));r.push(f('ex_dump',o.dump));
['ex_decl_0','ex_decl_1'].forEach(id=>{const e=document.getElementById(id);if(e&&!e.checked)e.click()});
const ob=[...document.querySelectorAll('#main button')].find(b=>/^باز کردن$/.test(b.textContent.trim()));if(ob)ob.click();await w(300);
for(let i=0;i<o.idea.length;i++){if(!document.getElementById('ex_gaps_'+i+'_st')){const ad=[...document.querySelectorAll('#main button')].find(b=>/\+ ردیف/.test(b.textContent));if(ad){ad.click();await w(200)}}
 const inp=document.getElementById('ex_gaps_'+i+'_idea')||[...document.querySelectorAll('#main input,#main textarea')].filter(e=>e.id&&e.id.startsWith('ex_gaps_'+i)&&!/_st|_why/.test(e.id))[0];
 if(inp){inp.value=o.idea[i];inp.dispatchEvent(new Event('input',{bubbles:true}));}
 r.push(f('ex_gaps_'+i+'_st',o.st[i]));if(o.why[i])f('ex_gaps_'+i+'_why',o.why[i]);}
r.push(f('ex_actual',String(o.act)));r.push(f('ex_nextQ_0',o.q[0]));r.push(f('ex_nextQ_1',o.q[1]));
const g=[...document.querySelectorAll('#main button')].filter(b=>/^۲ کامل$/.test(b.textContent.trim()));g.forEach(b=>b.click());await w(200);
const fin=[...document.querySelectorAll('#main button')].find(b=>/^ثبت نهایی$/.test(b.textContent.trim()));if(fin)fin.click();await w(600);
return r.join(',')+' | '+TT()+'\nPRC:'+JSON.stringify(APP.PR.all().filter(c=>c.tid===41).map(c=>({id:c.id,subj:c.subj,due:c.due,state:c.state,ss:(c.sessions||[]).map(s=>[s.d,s.ok,s.meas,s.src])})))})(__O__)
