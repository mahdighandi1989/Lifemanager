import json,sys
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
def say(s,k): return json.load(open(f'{B}/round21D/{s}/ctl/c{k}.json'))['say']
DEMO='''(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const A=%s;
let e;if(A.field){try{APP.ASSIST.toggle(false)}catch(x){};await w(300);e=document.getElementById(A.field);}else{const pn=document.querySelector('.as-panel');if(!pn||pn.hidden)APP.ASSIST.toggle(true);await w(500);e=document.querySelector('textarea.as-in');}
if(!e)return 'NOFIELD';e.scrollIntoView({block:'center'});e.focus();await w(250);
const set=v=>{e.value=v;try{e.setSelectionRange(v.length,v.length)}catch(x){};e.dispatchEvent(new Event('input',{bubbles:true}))};
set(A.pre);await w(250);const tog=document.querySelector('.mx-bar-tog');if(tog&&tog.getAttribute('aria-expanded')!=='true')tog.click();await w(250);
if(A.sym){const b=document.querySelector('.mx-sym[data-k="'+A.sym+'"]');if(b){b.dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));b.click();}}
if(A.post){const v=e.value+A.post;set(v)}await w(400);
let pv=null;for(let n=e.nextElementSibling;n;n=n.nextElementSibling){if(n.classList&&n.classList.contains('mx-prev')){pv=n;break}}if(!pv&&e.id)pv=document.querySelector('.mx-prev[data-for="'+e.id+'"]');if(!pv&&e.parentElement)pv=e.parentElement.querySelector('.mx-prev');
const bar=document.querySelector('.mx-bar');(pv||e).scrollIntoView({block:'center'});
return JSON.stringify({val:e.value,eq:e.value===A.want,pv:pv?{hidden:pv.hidden,math:pv.querySelectorAll('math').length,txt:pv.innerText.slice(0,300),src:[...pv.querySelectorAll('bdi.mx')].map(b=>b.dataset.src)}:null,bar:bar?{shown:!!bar.offsetParent,open:!bar.querySelector('.mx-syms').hidden}:null})})()'''
CLEAR='''(async()=>{const e=document.querySelector('textarea.as-in');const v=e?e.value:null;if(e&&e.value){e.value='';e.dispatchEvent(new Event('input',{bubbles:true}))}return 'leftover:'+JSON.stringify(v)})()'''
def demo(pre,sym=None,post='',field=None,want=None):
    a={'pre':pre,'sym':sym,'post':post,'field':field,'want':want if want is not None else pre+(post or '')}
    return {'eval':DEMO%json.dumps(a,ensure_ascii=False)}
specs={}
# s31: type c7 and c8 into the chat input before sending
t7,t8=say('s31',7),say('s31',8)
specs['s31']={'before':{'7':[demo(t7)],'8':[demo(t8)]},'after':{'7':[{'eval':CLEAR}],'8':[{'eval':CLEAR}]}}
# s38: c4 typed with the ² from the bar; c12 typed
t4,t12=say('s38',4),say('s38',12)
i=t4.index('a²b/6')
specs['s38']={'before':{'4':[demo(t4[:i+1],'sq',t4[i+2:],want=t4)],'12':[demo(t12)]},'after':{'4':[{'eval':CLEAR}],'12':[{'eval':CLEAR}]}}
# s36: live step field with Persian-letter equation, ⇒ from the bar; chat input before c21 and c22
t21,t22=say('s36',21),say('s36',22)
specs['s36']={'before':{'8':[demo('۰٫۱×۲۰ + ۰٫۲۵×ح = ۰٫۱۵(۲۰+ح) ','imp',' ۰٫۱ح = ۱ ⇒ ح = ۱۰',field='lpStep',want='۰٫۱×۲۰ + ۰٫۲۵×ح = ۰٫۱۵(۲۰+ح) ⇒ ۰٫۱ح = ۱ ⇒ ح = ۱۰')],'21':[demo(t21)],'22':[demo(t22)]},'after':{'21':[{'eval':CLEAR}],'22':[{'eval':CLEAR}]}}
for s,sp in specs.items(): json.dump(sp,open(f'{B}/round21D/{s}.spec.json','w'),ensure_ascii=False)
print('ok')
