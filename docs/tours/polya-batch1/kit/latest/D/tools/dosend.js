(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const o={};
const pn=document.querySelector('.as-panel');if(!pn||pn.hidden)APP.ASSIST.toggle(true);await w(600);
const L=[...document.querySelectorAll('.as-doslink')].filter(b=>b.offsetParent);o.links=L.map(b=>b.textContent.trim());
const lp=APP.liveAll().map(r=>r.p.id);o.lp=APP.liveAll().map(r=>r.p.title);
if(L.length){L[0].click();}else if(lp.length){APP.go('dossier',lp[lp.length-1]);}else{const s=APP.ASSIST.cur();APP.go('dossier',s.id);}
await w(1500);APP.ASSIST.toggle(false);await w(300);o.hash=location.hash;o.main=(document.getElementById('main')||{}).innerText.slice(0,5000);
o.raw=/\[object Object\]|\b(?:pb_l_|achat_|lp_|case_|pl\d)\w*|\d{4}-\d{2}-\d{2}T/.test(o.main)?'RAWHIT '+((o.main.match(/\[object Object\]|\b(?:pb_l_|achat_|lp_|case_)\w*|\bpl\d+\b|\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g)||[]).slice(0,8).join(' | ')):'clean';
return JSON.stringify(o)})()
