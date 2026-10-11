const { chromium } = require('playwright'); const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/fonts.googleapis.com/**', r => r.abort());
await p.goto('file://'+path.join(__dirname,'..','dist','learning-architecture.html'));await p.waitForSelector('.nav');
const r=await p.evaluate(()=>{
 const A=APP,S=A.S;
 A.startProto('P1'); let pr=S.all('pr',x=>x.pid==='P1')[0]; Object.assign(pr.data,{src:'دوره',q1:'حلقه بازخورد',q2:'تریلینگ',qq:'تأخیر حلقه را چطور بسنجم؟',d:['a','b','c'],hook:'h'}); pr.status='done'; A.onProtoDone(pr);
 const st=S.all('struct',s=>s.fa==='حلقه بازخورد')[0];
 const ex=A.newEx(45,''); ex.data.gaps=['چرا X؟']; ex.status='done'; A.onExDone(ex);
 const ns=A.nurseryNew().map(x=>x.text);
 A.go('tech',45,'und'); const ph=A.phaseOf(45);
 A.go('base',null,'tr'); const tr=document.querySelectorAll('main table tbody tr').length;
 A.go('protos'); const qbtn=[...document.querySelectorAll('main .btn')].some(b=>b.textContent.includes('صف منابع'));
 A.go('map',null,'plan'); A.go('map',null,'net'); A.go('farm',null,'logic');
 A.startProto('P11',{preset:{mode:'توضیح سامانه: اول سامانه درس را به بیان دیگر باز می‌کند، بعد خودم بازسازی می‌کنم',lesson:'متن درس'}});
 const hasLesson=!!document.querySelector('[data-k="lesson"]'), hasSplit=!!document.querySelector('[data-k="knotSplit"]');
 return {stExtra:st&&st.extra.length, stQ:st&&st.q, ns, ph, tr, qbtn, hasLesson, hasSplit};
});
console.log(JSON.stringify(r)); console.log(errs.join('\n')||'no errors'); await b.close();})();
