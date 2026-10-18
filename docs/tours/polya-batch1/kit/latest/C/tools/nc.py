# nc.py sid kind value  -> append one ctl to src/<sid>/ctl (kind: say|eval|eval0say|raw|exit|shot|clock)
import json,sys,glob,os
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid,k=sys.argv[1],sys.argv[2]; v=sys.argv[3] if len(sys.argv)>3 else ''
D=f'{T}/round23C/src/{sid}/ctl'; os.makedirs(D,exist_ok=True)
n=len(glob.glob(D+'/c*.json'))+1
HELP=json.load(open(T+'/round22C/s22/ctl/c1.json'))['eval0']
PIDJ="(window.__PID||localStorage.getItem('__PID')||(APP.liveAll().slice(-1)[0]||{p:{}}).p.id)"
if k=='say': o={'say':v}
elif k=='eval': o={'eval':v}
elif k=='first': o={'eval0':HELP+";APP.clock.dev=true;localStorage.setItem('lla.dev','1');'ok'",'say':v}
elif k=='raw': o=json.loads(v)
elif k=='exit': o={'exit':True}
elif k=='shot': o={'shot':{'name':v,'full':True}}
elif k=='panel': o={"shot":{"name":v,"fold":False,"full":False,"js":"(()=>{const pn=document.querySelector('.as-panel');if(!pn||pn.hidden)APP.ASSIST.toggle(true);const b=document.querySelector('.as-body,.as-msgs');if(b)b.scrollTop=b.scrollHeight;return 'panel'})()"}}
elif k=='clock':
    outs=[{"eval":"(()=>{const p=%s;if(p)localStorage.setItem('__PID',p);APP.clock.dev=true;localStorage.setItem('lla.dev','1');return APP.clock.set('%s')+' pid='+p})()"%(PIDJ,v)},{"exit":True},{"eval0":HELP+";window.__PID=localStorage.getItem('__PID')||(APP.liveAll().slice(-1)[0]||{p:{}}).p.id;if(window.__PID)APP.go('lprob',window.__PID);'restored '+APP.today()+' '+window.__PID"}]
    for i,x in enumerate(outs): open(f'{D}/c{n+i}.json','w').write(json.dumps(x,ensure_ascii=False))
    print('added c%d..c%d'%(n,n+2)); sys.exit()
open(f'{D}/c{n}.json','w').write(json.dumps(o,ensure_ascii=False)); print('added c%d'%n)
