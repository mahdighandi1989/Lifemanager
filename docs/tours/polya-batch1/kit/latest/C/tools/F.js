window.F=(id,v)=>{const e=document.getElementById(id); if(!e) return 'NOFIELD '+id; e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return 'ok';};
window.B=(re,root)=>{const b=[...(root||document.querySelector('#main')).querySelectorAll('button')].find(b=>re.test(b.textContent)); if(!b) return 'NOBTN '+re; b.click(); return 'clicked '+b.textContent.slice(0,40);};
window.IDS=()=>[...document.querySelectorAll('#main input,#main textarea,#main select')].map(e=>e.id+':'+(e.labels&&e.labels[0]?e.labels[0].textContent.slice(0,50):'')).join(' | ');
window.BTNS=()=>[...document.querySelectorAll('#main button')].map(b=>b.textContent.trim().slice(0,40)).join(' | ');
'helpers'
