# mk.py field_formula chat_formula [nonmath_chat] -> ctls json on stdout: field preview + symbol bar, chat-input preview, exit
import sys,json
ff,cf=sys.argv[1],sys.argv[2]; nm=sys.argv[3] if len(sys.argv)>3 else ''
W="const W=ms=>new Promise(r=>setTimeout(r,ms));"
a=("(async()=>{"+W+"if(APP.ASSIST&&APP.ASSIST.toggle)APP.ASSIST.toggle(false);const L=APP.liveAll().filter(r=>!APP.liveClosure||APP.liveClosure(r.p.id).state!=='solved');const r=L[L.length-1]||APP.liveAll()[0];APP.go('lprob',r.p.id);await W(1500);"
 "const f=[...document.querySelectorAll('#main textarea[id^=lp],#main input[id^=lp][type=text]')].filter(e=>e.offsetParent)[0];if(!f)return 'NOFIELD';f.scrollIntoView({block:'center'});f.focus();f.value=%s;f.dispatchEvent(new Event('input',{bubbles:true}));f.setSelectionRange(f.value.length,f.value.length);await W(300);"
 "const tog=document.querySelector('.mx-bar-tog');if(tog&&tog.getAttribute('aria-expanded')!=='true')tog.click();await W(200);const sq=document.querySelector('.mx-sym[data-k=le]');if(sq)sq.click();await W(200);f.value=f.value+' ۱۰۰';f.dispatchEvent(new Event('input',{bubbles:true}));await W(400);"
 "const pv=document.querySelector('.mx-prev[data-for=\"'+f.id+'\"]');return 'PID '+r.p.title+' FIELD '+f.id+' VAL '+f.value+' || PREV '+(pv&&!pv.hidden?pv.innerText:'(none)')+' || BAR '+(document.querySelector('.mx-bar')?[...document.querySelectorAll('.mx-sym')].map(x=>x.textContent).join(' '):'none')+' focus='+(document.activeElement===f);})()") % json.dumps(ff,ensure_ascii=False)
b=("(async()=>{"+W+"APP.ASSIST.toggle(true);await W(600);const i=document.querySelector('textarea.as-in');i.focus();i.value=%s;i.dispatchEvent(new Event('input',{bubbles:true}));await W(500);const tog=document.querySelector('.mx-bar-tog');if(tog&&tog.getAttribute('aria-expanded')!=='true')tog.click();await W(300);const pv=document.querySelector('.mx-prev[data-for]')&&[...document.querySelectorAll('.mx-prev')].find(p=>p.previousElementSibling===i||p.parentElement===i.parentElement||p.closest('.as-root'));"
 "const all=[...document.querySelectorAll('.as-root .mx-prev')];const vis=all.filter(p=>!p.hidden);if(vis[0])vis[0].scrollIntoView({block:'end'});return 'CHATPREV '+vis.map(p=>p.innerText).join(' | ')+' || plots='+document.querySelectorAll('.as-msg .mx-plot').length+' boards='+document.querySelectorAll('.as-msg .mx-board').length;})()") % json.dumps(cf,ensure_ascii=False)
L=[{"eval":a},{"eval":b}]
if nm:
    c=("(async()=>{"+W+"const i=document.querySelector('textarea.as-in');i.value=%s;i.dispatchEvent(new Event('input',{bubbles:true}));await W(500);const vis=[...document.querySelectorAll('.as-root .mx-prev')].filter(p=>!p.hidden);return 'NONMATH prev='+vis.map(p=>p.innerText).join(' | ');})()") % json.dumps(nm,ensure_ascii=False)
    L.append({"eval":c})
L.append({"eval":"(()=>{const i=document.querySelector('textarea.as-in');if(i){i.value='';i.dispatchEvent(new Event('input',{bubbles:true}));}return 'cleared'})()"})
L.append({"exit":True})
print(json.dumps(L,ensure_ascii=False))
