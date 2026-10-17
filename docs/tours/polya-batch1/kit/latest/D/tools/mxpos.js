(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));try{APP.ASSIST.toggle(true)}catch(e){}await w(1200);
const out=[];document.querySelectorAll("bdi.mx").forEach(b=>{const m=b.querySelector("math");if(!m)return;const r=x=>Math.round(x.getBoundingClientRect().left);
const sups=[...m.querySelectorAll("msup,msubsup")].map(s=>({base:r(s.children[0]),sup:r(s.children[1]),ok:r(s.children[0])<r(s.children[1])}));
const leaves=[...m.querySelectorAll("mi,mn,mo")];const first=leaves[0],last=leaves[leaves.length-1];
out.push({src:b.dataset.src,dir:getComputedStyle(m).direction,mdir:m.getAttribute("dir"),firstLeaf:first&&first.textContent,firstX:first&&r(first),lastLeaf:last&&last.textContent,lastX:last&&r(last),sups})});
return JSON.stringify(out.slice(0,12))})()
