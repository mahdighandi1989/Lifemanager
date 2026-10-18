# ex.py sid ctls.json -> append ctls (list) to sid/ctl, restart harness if not running, wait for outs, print eval/error
import sys,json,os,time,subprocess
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21C'
sid=sys.argv[1]; D=f'{T}/{sid}'; L=json.load(open(sys.argv[2]))
if subprocess.run("ps aux | grep '[h]arness6c.js' | grep -q 'round21C/%s$'"%sid,shell=True).returncode!=0:
    subprocess.run(['bash',T+'/tools/start.sh',D]); time.sleep(10)
n0=len(os.listdir(D+'/ctl'))
for i,c in enumerate(L): open(f'{D}/ctl/c{n0+i+1}.json','w').write(json.dumps(c,ensure_ascii=False))
last=n0+len(L); t0=time.time()
while not os.path.exists(f'{D}/out/s{last}.json') and time.time()-t0<240: time.sleep(1)
for k in range(n0+1,last+1):
    f=f'{D}/out/s{k}.json'
    if not os.path.exists(f): print('s%d MISSING'%k); continue
    r=json.load(open(f)); print('s%d'%k, (r.get('eval') or r.get('error') or ('exit' if r.get('exit') else ''))[:int(os.environ.get('NX','1500'))] if isinstance(r.get('eval') or r.get('error') or '',str) else r.get('eval'))
