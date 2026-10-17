(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const S=(id,v)=>{const e=document.getElementById(id);if(!e)return 'NO '+id;e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'};const r=[];
r.push(S('ex_preds','با جمع ۱۲، بیشترین حاصل‌ضرب با چهار تا ۳ به دست میاد (۸۱)'),S('ex_preds_0_conf','70'),S('ex_preds_0_why','از روشِ همین مسئله'),S('ex_preds_0_due','۳ روز دیگر'));
r.push(S('ex_preds_1_st','برای جمع ۲۰ بهترین تعداد جزء ۷ است'),S('ex_preds_1_conf','80'),S('ex_preds_1_why','۲۰ تقسیم بر e حدود ۷'),S('ex_preds_1_due','۳ روز دیگر'));
r.push(S('ex_preds_2_st','بیشینهٔ حاصل‌ضرب با جمعِ مربع‌ها ۱۰ وقتیه که همه برابرند'),S('ex_preds_2_conf','60'),S('ex_preds_2_why','حس'),S('ex_preds_2_due','۳ روز دیگر'));
await w(500);const b=[...document.querySelectorAll('#main button')].find(b=>/ثبت نهایی/.test(b.textContent));b.scrollIntoView({block:'center'});b.click();await w(1200);
r.push(document.querySelector('.toast')?document.querySelector('.toast').innerText:'');
r.push(JSON.stringify(APP.PR.cases().map(c=>[c.id,c.tid,c.state,c.sessions.length,APP.PR.dueText(c)])));
r.push(JSON.stringify(APP.S.all('fcast').map(f=>[f.q.slice(0,30),f.p,f.due,f.prc,f.outcome])));
return r.join(' | ')})()
