# pin.py sid date -> insert [set clock date, exit] before c1 of src/<sid>/ctl (idempotent via marker file)
import json,sys,glob,os
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24C'
sid,d=sys.argv[1],sys.argv[2]; D=f'{T}/src/{sid}/ctl'
if os.path.exists(D+'/.pinned'): print('already'); sys.exit()
fs=sorted(glob.glob(D+'/c*.json'),key=lambda x:int(x.split('/c')[-1][:-5]))
for f in reversed(fs):
    n=int(f.split('/c')[-1][:-5]); os.rename(f,f'{D}/c{n+2}.json')
open(D+'/c1.json','w').write(json.dumps({"eval":"(()=>{APP.clock.dev=true;localStorage.setItem('lla.dev','1');return 'pinned '+APP.clock.set('%s')})()"%d}))
open(D+'/c2.json','w').write('{"exit":true}'); open(D+'/.pinned','w').write(d); print(sid,'pinned',d,len(fs)+2)
