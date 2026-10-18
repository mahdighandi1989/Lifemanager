# extras.py sid json-spec -> append ctls to src/<sid>/ctl. spec items: ["rec"], ["shots",tag], ["say",text], ["edit",mid,old,new], ["raw",ctl], ["exit"], ["restore"]
import json,sys,glob,os
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid=sys.argv[1]; spec=json.load(open(sys.argv[2]))
D=f'{T}/round21C/src/{sid}/ctl'; n=len(glob.glob(D+'/c*.json'))
REC=open(f'{T}/round21C/tools/rec.js').read()
HELP=json.load(open(T+'/round20C/s22/ctl/c1.json'))['eval0']
GOP="(()=>{const p=window.__PID||localStorage.getItem('__PID')||(APP.liveAll().slice(-1)[0]||{p:{}}).p.id;APP.go('lprob',p);return p})()"
GOD="(()=>{const p=window.__PID||localStorage.getItem('__PID')||(APP.liveAll().slice(-1)[0]||{p:{}}).p.id;APP.go('dossier',p);return p})()"
out=[]
for it in spec:
    k=it[0]
    if k=='rec': out.append({"eval":REC})
    elif k=='shots':
        t=it[1]
        out.append({"shot":{"name":f"{t}_lprob","js":GOP,"full":True}})
        out.append({"shot":{"name":f"{t}_dossier","js":GOD,"full":True}})
        out.append({"shot":{"name":f"{t}_today","view":["today"],"full":True}})
        out.append({"shot":{"name":f"{t}_mind","view":["mind"],"full":True,"js":"(()=>{document.querySelectorAll('details.mind-from,details').forEach(d=>{if(/از کجا/.test(d.innerText.slice(0,40)))d.open=true});return 'opened'})()"}})
    elif k=='say': out.append({"say":it[1]})
    elif k=='edit':
        mid,old,new=it[1],it[2],it[3]
        js=("(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const pn=document.querySelector('.as-panel');if(!pn||pn.hidden)APP.ASSIST.toggle(true);await W(800);"
            "const w=document.querySelector('.as-mtools[data-mid=\"%s\"]');if(!w)return 'NO TOOLS';w.querySelector('.as-editb').click();await W(600);"
            "const ta=document.querySelector('.as-mtools[data-mid=\"%s\"] textarea');if(!ta)return 'NO TA';const o=ta.value;ta.value=o.replace(%s,%s);ta.dispatchEvent(new Event('input',{bubbles:true}));if(ta.value===o)return 'NOT REPLACED';"
            "await W(300);ta.scrollIntoView({block:'center'});window.__edShot=1;document.querySelector('.as-mtools[data-mid=\"%s\"] .as-edsave').click();await W(1500);"
            "const t=[...document.querySelectorAll('.toast,.flash')].map(x=>x.innerText).join(' | ');return 'saved; toast='+t;})()")%(mid,mid,json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False),mid)
        pre=("(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const pn=document.querySelector('.as-panel');if(!pn||pn.hidden)APP.ASSIST.toggle(true);await W(800);"
             "const w=document.querySelector('.as-mtools[data-mid=\"%s\"]');if(!w)return 'NO TOOLS';w.querySelector('.as-editb').click();await W(600);const ta=w.parentElement.querySelector('textarea')||document.querySelector('.as-edtx');ta.value=ta.value.replace(%s,%s);ta.dispatchEvent(new Event('input',{bubbles:true}));ta.scrollIntoView({block:'center'});return 'editor open: '+ta.value.slice(0,200)})()")%(mid,json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False))
        out.append({"eval":pre}); out.append({"raw_shot":1})
        out.append({"eval":"(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const b=document.querySelector('.as-mtools[data-mid=\"%s\"] .as-edsave');if(!b)return 'NO SAVE';b.click();await W(1500);return 'saved; toast='+[...document.querySelectorAll('.toast,.flash')].map(x=>x.innerText).join(' | ')})()"%mid})
    elif k=='raw': out.append(it[1])
    elif k=='exit': out.append({"exit":True})
    elif k=='restore': out.append({"eval0":HELP+";window.__PID=localStorage.getItem('__PID')||(APP.liveAll().slice(-1)[0]||{p:{}}).p.id;APP.go('lprob',window.__PID);'restored '+APP.today()+' '+window.__PID"})
out=[o for o in out if 'raw_shot' not in o]
for i,o in enumerate(out): open(f'{D}/c{n+i+1}.json','w').write(json.dumps(o,ensure_ascii=False))
print(sid,'appended',len(out),'from c%d'%(n+1))
