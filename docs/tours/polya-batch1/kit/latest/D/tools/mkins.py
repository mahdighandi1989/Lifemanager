# helpers for building insertion specs
import json
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22D/tools/'
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
