# helpers for building insertion specs
import json
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23D/tools/'
REC=open(T+'rec22.js').read(); SETF=open(T+'setf.js').read(); PRC=open(T+'prc.js').read()+'\n;'+open(T+'lists.js').read()
def rec(tag): return {'new':{'eval0':SETF+'\n;'+PRC,'eval':REC},'tag':tag}
def say(t,tag): return {'new':{'say':t},'tag':tag}
def ev(js,tag): return {'new':{'eval0':SETF+'\n;'+PRC,'eval':js},'tag':tag}
def day(n,tag,js=None):
    d="(()=>{const R=window.__RD||Date;window.__RD=R;const off=%s*864e5;function D(...a){if(!(this instanceof D))return new R(R.now()+off).toString();return a.length?new R(...a):new R(R.now()+off)}D.prototype=R.prototype;D.now=()=>R.now()+off;D.UTC=R.UTC;D.parse=R.parse;window.Date=D;APP.go('home');return APP.today()})()"%n
    return {'new':{'eval0':SETF+'\n;'+PRC+'\n;'+d,'eval':js or REC},'tag':tag}
def shot(tag): return {'new':{'snap':tag},'tag':tag}

def edit(find,old,new,tag):
    js="(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const s=APP.ASSIST.cur();const pn=document.querySelector('.as-panel');if(!pn||pn.hidden)APP.ASSIST.toggle(true);await w(400);const m=s.msgs.filter(m=>m.role==='user'&&m.text.includes(%s)).pop();if(!m)return 'NOMSG';const mid=APP.liveMsgId(m);const tl=[...document.querySelectorAll('.as-mtools')].find(x=>x.dataset.mid===mid);const b=tl&&tl.querySelector('.as-editb');if(!b)return 'NOBTN '+mid;b.scrollIntoView({block:'center'});b.click();await w(400);const ta=document.querySelector('.as-edtx');ta.value=m.text.replace(%s,%s);ta.dispatchEvent(new Event('input',{bubbles:true}));await w(300);const sv=document.querySelector('.as-edsave');sv.scrollIntoView({block:'center'});await w(200);sv.click();await w(900);return 'edited '+mid+' :: '+ta.value})()"%(json.dumps(find),json.dumps(old),json.dumps(new))
    return ev(js,tag)
ASKYES="(async()=>{const pn=document.querySelector('.as-panel');if(!pn||pn.hidden)APP.ASSIST.toggle(true);await __w(500);const B=[...document.querySelectorAll('.as-copyask')];const t=B.map(b=>b.innerText).join(' ## ')||'NO ASKBOX';let n=0;for(const b of B){for(const y of b.querySelectorAll('.as-askyes')){y.scrollIntoView({block:'center'});await __w(300);y.click();n++;await __w(700)}}return t+' || clicked:'+n+' || '+JSON.stringify((APP.ASSIST.cur().copyAsk||[]).map(q=>[q.label,q.old,q.new,q.state]))})()"
ASKSHOW="(async()=>{const pn=document.querySelector('.as-panel');if(!pn||pn.hidden)APP.ASSIST.toggle(true);await __w(500);const b=document.querySelector('.as-copyask');if(b)b.scrollIntoView({block:'center'});return b?b.innerText:'NO ASKBOX'})()"

def birth(d,tag='birth'):
    js="(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<20&&!document.querySelector('.age-in');i++)await w(300);const i=document.querySelector('.age-in');if(!i)return 'NO age card';i.scrollIntoView({block:'center'});i.value=%s;i.dispatchEvent(new Event('input',{bubbles:true}));await w(150);const b=[...i.parentElement.querySelectorAll('button')].find(x=>x.textContent.trim()==='ثبت');b.click();await w(600);const m=i.closest('.age-ask');return 'birth='+APP.AGE.birth()+' age='+APP.AGE.age()+' band='+(APP.AGE.band(APP.AGE.age())||{}).id+' err='+((m&&m.querySelector('.bad')||{}).textContent||'')})()"%json.dumps(d)
    return {'new':{'eval':js},'tag':tag}
ROUTE="(async()=>{const lp=APP.liveAll().map(r=>r.p.id);const id=lp.length?lp[lp.length-1]:APP.ASSIST.cur().id;APP.ASSIST.toggle(false);APP.go('route',id);await __w(1500);const m=APP.ROUTE.model(id);return JSON.stringify({id:id,now:m.nowFa,remain:m.remain,pts:m.pts.map(p=>p.cls+':'+p.title),dets:m.dets.map(d=>d.fa+':'+d.concept+':'+d.state+':'+d.depth),backs:m.backs.length})})()"
def route(tag): return ev(ROUTE,tag)
