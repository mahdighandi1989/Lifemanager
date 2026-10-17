// helper: window.__q() returns current ladder question; __qa(text) answers it
window.__q=()=>{const t=__fx.main(80000);const i=t.indexOf('❔ پرسشِ همین لحظه');return t.slice(i,i+400).split('\n').filter(Boolean).slice(0,4).join(' | ')};
window.__qa=async(txt)=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const a=[...document.querySelectorAll('#main textarea,#main input')].find(e=>/^lpAsk/.test(e.id));if(!a)return 'NOASK';__fx.set(a,txt);await w(200);const r=__fx.btn(/ثبتِ پاسخ/);await w(900);const errs=[...document.querySelectorAll('#main .lp-err,#main .err,#main .warn,#main [role=alert],.toast')].map(e=>e.textContent.trim().slice(0,250)).join(' / ');return r+' ERR='+errs+' NEXT='+__q()};
'ok'
