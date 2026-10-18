# build_src.py -> round23C/src/<sid>/ctl from round22C/<sid>/ctl: drop trailing exit; real clock instead of APP.today patches;
# a new day starts with [set clock, save PID, exit, helpers+restore]
import json,os,re,glob,sys
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
DAYMAP={'s22':{'2026-10-17':'2026-10-18','2026-10-18':'2026-10-19'},'s23':{'2026-10-17':'2026-10-18'},'s26':{'2026-10-17':'2026-10-18'},'s27':{'2026-10-17':'2026-10-18'}}
HELP=json.load(open(T+'/round22C/s22/ctl/c1.json'))['eval0']
def clk(d): return "(APP.clock.dev=true,localStorage.setItem('lla.dev','1'),APP.clock.set('%s'))"%d
def restore(): return HELP+";window.__PID=localStorage.getItem('__PID')||(APP.liveAll()[0]||{p:{}}).p.id;APP.go('lprob',window.__PID);'restored '+APP.today()"
for sid in sys.argv[1:]:
    src=sorted(glob.glob(f'{T}/round22C/{sid}/ctl/c*.json'),key=lambda x:int(x.split('/c')[-1][:-5]))
    L=[open(f).read() for f in src]
    while L and '"exit"' in L[-1]: L.pop()
    out=[]; cur=None
    for t in L:
        m=re.findall(r"APP\.today=\(\)=>\\?['\"](\d{4}-\d\d-\d\d)\\?['\"]",t)
        if m:
            d=DAYMAP.get(sid,{}).get(m[0],m[0])
            t=re.sub(r"APP\.today=\(\)=>\\?['\"](\d{4}-\d\d-\d\d)\\?['\"]",lambda mm: clk(DAYMAP.get(sid,{}).get(mm.group(1),mm.group(1))).replace("'","\\'") if False else clk(DAYMAP.get(sid,{}).get(mm.group(1),mm.group(1))),t)
            if d!=cur and d>'2026-10-17':
                out.append(json.dumps({"eval":"(()=>{const p=window.__PID||APP.state.arg;if(p)localStorage.setItem('__PID',p);return %s+' pid='+p})()"%clk(d)}))
                out.append('{"exit":true}')
                out.append(json.dumps({"eval0":restore()}))
            cur=d
        json.loads(t)
        out.append(t)
    D=f'{T}/round23C/src/{sid}/ctl'; os.makedirs(D,exist_ok=True)
    for f in glob.glob(D+'/*'): os.remove(f)
    for i,t in enumerate(out): open(f'{D}/c{i+1}.json','w').write(t)
    print(sid,len(L),'->',len(out))
