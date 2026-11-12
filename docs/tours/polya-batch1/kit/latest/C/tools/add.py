# add.py sid  (stdin: JSON list of items; item = {"say":..}|{"eval":..}|{"shot":name|{..}}|"exit"|"restore"|{"sheet":[id,text]}|{"clock":"YYYY-MM-DD"}|{"view":[v,arg]}) -> append ctls to src/<sid>/ctl
import sys,json,glob,os
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26C'
sid=sys.argv[1]; D=f'{R}/src/{sid}/ctl'
HELP=json.load(open(f'{R}/src/s21/ctl/c23.json'))['eval0']
PID="(window.__PID||localStorage.getItem('__PID')||APP.state.arg||((APP.liveAll().slice(-1)[0]||{p:{}}).p.id))"
items=json.loads(sys.stdin.read()); n=len(glob.glob(D+'/c*.json'))
def w(o):
    global n; n+=1; open(f'{D}/c{n}.json','w').write(json.dumps(o,ensure_ascii=False))
for it in items:
    if it=='exit': w({"exit":True})
    elif it=='restore': w({"eval0":HELP+";APP.clock.dev=true;localStorage.setItem('lla.dev','1');window.__PID=localStorage.getItem('__PID')||(APP.liveAll().slice(-1)[0]||{p:{}}).p.id;if(window.__PID)APP.go('lprob',window.__PID);'restored '+APP.today()+' '+window.__PID"})
    elif 'say' in it: w({"say":it['say']})
    elif 'eval' in it: w({"eval":it['eval']})
    elif 'clock' in it: w({"eval":"(()=>{const p=%s;if(p)localStorage.setItem('__PID',p);APP.clock.dev=true;localStorage.setItem('lla.dev','1');return APP.clock.set('%s')+' pid='+p})()"%(PID,it['clock'])})
    elif 'sheet' in it:
        sid_,txt=it['sheet']; w({"eval":"(async()=>{const s=await window.__sheetLoad('%s');if(!s)return 'NO SHEET';s.status='answered';s.notes.push({id:'r'+Date.now(),by:'routine',at:new Date().toISOString(),text:%s});await window.__sheetSave(s);return 'sheet %s '+s.status+' notes='+s.notes.length})()"%(sid_,json.dumps(txt,ensure_ascii=False),sid_)})
    elif 'sys' in it: w({"eval":"(()=>JSON.stringify((APP.ASSIST.cur().msgs||[]).filter(m=>m.role==='sys').slice(-%d).map(m=>m.text)))()"%it['sys']})
    elif 'text' in it: w({"shot":{"name":it['name'],"full":True,"js":"(()=>{const p=%s;APP.go('%s',%s);return 1})()"%(PID,it['text'],'p' if it.get('pid',True) else 'undefined')}}); w({"eval":"(()=>document.querySelector('#main').innerText.slice(%d,%d))()"%(it.get('from',0),it.get('to',5000))})
    elif 'shot' in it: w({"shot":{"name":it['shot'],"full":True}})
print('ctls now',n)
