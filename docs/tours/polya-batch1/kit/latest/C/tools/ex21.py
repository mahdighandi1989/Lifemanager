# ex21.py sid K spec.json -> keep src/<sid>/ctl c1..cK, append spec items
import json,sys,glob,os
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid=sys.argv[1]; K=int(sys.argv[2]); spec=json.load(open(sys.argv[3]))
D=f'{T}/round24C/src/{sid}/ctl'
for f in glob.glob(D+'/c*.json'):
    if int(f.split('/c')[-1][:-5])>K: os.remove(f)
REC=open(f'{T}/round24C/tools/rec.js').read()
HELP=json.load(open(T+'/round19C/s22/ctl/c1.json'))['eval0']
PIDJ="(window.__PID||localStorage.getItem('__PID')||(APP.liveAll().slice(-1)[0]||{p:{}}).p.id)"
GOP="(()=>{const p=%s;APP.go('lprob',p);return p})()"%PIDJ
GOD="(()=>{const p=%s;APP.go('dossier',p);return p})()"%PIDJ
TODAY="(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));APP.go('today');await W(1500);const t=document.querySelector('#main').innerText;return 'TODAY '+APP.today()+' || '+t.slice(0,3000)})()"
out=[]
def clock(d):
    out.append({"eval":"(()=>{const p=%s;if(p)localStorage.setItem('__PID',p);APP.clock.dev=true;localStorage.setItem('lla.dev','1');return APP.clock.set('%s')+' pid='+p})()"%(PIDJ,d)})
    out.append({"exit":True})
    out.append({"eval0":HELP+";window.__PID=localStorage.getItem('__PID')||(APP.liveAll().slice(-1)[0]||{p:{}}).p.id;APP.go('lprob',window.__PID);'restored '+APP.today()+' '+window.__PID"})
for it in spec:
    k=it[0]
    if k=='rec': out.append({"eval":REC})
    elif k=='shots':
        t=it[1]
        out.append({"shot":{"name":f"{t}_lprob","js":GOP,"full":True}})
        out.append({"shot":{"name":f"{t}_dossier","js":GOD,"full":True}})
        out.append({"shot":{"name":f"{t}_today","view":["today"],"full":True}})
        out.append({"shot":{"name":f"{t}_mind","view":["mind"],"full":True,"js":"(()=>{document.querySelectorAll('details').forEach(d=>{if(/از کجا/.test(d.innerText.slice(0,40)))d.open=true});return 'opened'})()"}})
    elif k=='panel': out.append({"shot":{"name":it[1],"fold":False,"full":False,"js":"(()=>{const pn=document.querySelector('.as-panel');if(!pn||pn.hidden)APP.ASSIST.toggle(true);const b=document.querySelector('.as-body,.as-msgs');if(b)b.scrollTop=b.scrollHeight;return 'panel'})()"}})
    elif k=='say': out.append({"say":it[1]})
    elif k=='edit':
        mid,old,new,tag=it[1],it[2],it[3],it[4]
        pre=("(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const pn=document.querySelector('.as-panel');if(!pn||pn.hidden)APP.ASSIST.toggle(true);await W(800);"
             "const w=document.querySelector('.as-mtools[data-mid=\"%s\"]');if(!w)return 'NO TOOLS';w.querySelector('.as-editb').click();await W(700);const ta=w.parentElement.querySelector('textarea')||document.querySelector('.as-edtx');if(!ta)return 'NO TA';const o=ta.value;ta.value=o.replace(%s,%s);ta.dispatchEvent(new Event('input',{bubbles:true}));ta.scrollIntoView({block:'center'});return (ta.value===o?'NOT REPLACED ':'editor open: ')+ta.value.slice(0,300)})()")%(mid,json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False))
        out.append({"eval":pre})
        out.append({"shot":{"name":tag+"_editor","fold":False,"full":False}})
        out.append({"eval":"(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const b=document.querySelector('.as-edsave');if(!b)return 'NO SAVE';b.click();await W(1500);return 'saved; toast='+[...document.querySelectorAll('.toast,.flash')].map(x=>x.innerText).join(' | ')})()"})
    elif k=='ask':  # answer the page's copy ask: yes/no
        cls='.as-askyes' if it[1]=='yes' else '.as-askno'
        out.append({"shot":{"name":it[2]+"_ask","fold":False,"full":False,"js":"(()=>{const pn=document.querySelector('.as-panel');if(!pn||pn.hidden)APP.ASSIST.toggle(true);const b=document.querySelector('%s');if(b)b.scrollIntoView({block:'center'});return b?'ASK '+b.closest('div').innerText.slice(0,300):'NO ASK'})()"%cls}})
        out.append({"eval":"(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const pn=document.querySelector('.as-panel');if(!pn||pn.hidden)APP.ASSIST.toggle(true);await W(600);const b=document.querySelector('%s');if(!b)return 'NO ASK BUTTON';const t=b.parentElement.innerText;b.click();await W(1200);return 'clicked: '+t.slice(0,300)+' || toast='+[...document.querySelectorAll('.toast,.flash')].map(x=>x.innerText).join(' | ')})()"%cls})
    elif k=='clock': clock(it[1])
    elif k=='today': out.append({"eval":TODAY}); out.append({"shot":{"name":it[1],"view":["today"],"full":True}})
    elif k=='raw': out.append(it[1])
    elif k=='exit': out.append({"exit":True})
for i,o in enumerate(out): open(f'{D}/c{K+i+1}.json','w').write(json.dumps(o,ensure_ascii=False))
print(sid,'kept',K,'appended',len(out),'total',K+len(out))
