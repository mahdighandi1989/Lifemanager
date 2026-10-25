(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const out=[];const m=()=>document.getElementById('main');
const lab=(re)=>{const L=[...m().querySelectorAll('label')].find(l=>re.test(l.textContent));if(!L)return null;return L.querySelector('input,textarea,select')||document.getElementById(L.getAttribute('for'))||L.parentElement.querySelector('input,textarea')};
const setv=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))};
const A=window.__FW||{};
for(let k=0;k<12;k++){const b=[...m().querySelectorAll('button')].find(b=>b.offsetParent&&/^✓ درست است/.test(b.textContent.trim())&&!b.closest('.lp-prior')&&!b.dataset.fwdone);if(!b)break;b.dataset.fwdone=1;b.scrollIntoView({block:'center'});b.click();out.push('ok-draft');await w(500);}
if(A.prior){for(let k=0;k<12;k++){const b=[...m().querySelectorAll('.lp-prior button.lp-prior-ok')].find(b=>b.offsetParent);if(!b)break;b.click();out.push('ok-prior');await w(400);}}
for(const [re,v] of (A.fill||[])){const el=lab(new RegExp(re));if(el){setv(el,v);out.push('fill '+re);}else out.push('NOFIELD '+re);await w(300);}
for(const re of (A.click||[])){const b=[...m().querySelectorAll('button')].find(b=>b.offsetParent&&new RegExp(re).test(b.textContent));if(b){b.scrollIntoView({block:'center'});b.click();out.push('click '+b.textContent.trim().slice(0,40));await w(900);}else out.push('NOBTN '+re);}
await w(800);return JSON.stringify({out,phase:APP.livePhase(APP.liveAll().map(r=>r.p.id).pop()),bad:(window.__bad?__bad():''),main:(A.from?m().innerText.slice(Math.max(0,m().innerText.indexOf(A.from))):m().innerText).slice(0,A.len||3500)})})()
