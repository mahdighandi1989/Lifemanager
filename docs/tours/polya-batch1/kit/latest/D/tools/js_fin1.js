(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO '+id;e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'};const r=[];
const c=APP.PR.cases()[0];APP.go('practice',c.id);await w(800);r.push('CASE: '+document.getElementById('main').innerText.slice(0,900));
const b0=[...document.querySelectorAll('#main button')].find(b=>/ادامه با کاربرگ/.test(b.textContent));b0.click();await w(1000);
const OUT=["\u062f\u0631\u0633\u062a", "\u062f\u0631\u0633\u062a", "\u062f\u0631\u0633\u062a"];OUT.forEach((o,i)=>r.push(S('ex_preds_'+i+'_out',o)));
r.push(S('ex_selfguess','فکر می‌کنم حدودِ ۷۰٪ درست درمیاد'),S('ex_pattern','در گزاره‌های عددی کم‌اطمینان بودم؛ اطمینانم از حس بود'),S('ex_rule','وقتی روش رو از مسئلهٔ حل‌شده دارم، اطمینان رو ۱۰ درصد بالاتر بنویسم'));await w(400);
const b=[...document.querySelectorAll('#main button')].find(b=>/ثبت نهایی/.test(b.textContent));b.scrollIntoView({block:'center'});b.click();await w(1200);
r.push((document.querySelector('.toast')||{}).innerText||'');
const c2=APP.S.get(c.id);const R=APP.PR.eval(c2);r.push(JSON.stringify({state:c2.state,sess:c2.sessions.map(s=>[s.d,s.ok,s.what,s.why]),due:APP.PR.dueText(c2),crit:R.crit,calib:R.calib,stable:c2.stable}));
r.push(JSON.stringify(APP.S.all('fcast').map(f=>[f.q.slice(0,25),f.p,f.due,f.outcome,String(f.created).slice(0,10)])));
return r.join(' | ')})()
