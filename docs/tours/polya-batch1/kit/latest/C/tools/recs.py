# recs.py sid [k] -> show the last k rec outputs (evals that start with {"today")
import json,glob,sys
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24C'
sid=sys.argv[1]; k=int(sys.argv[2]) if len(sys.argv)>2 else 1; W=int(sys.argv[3]) if len(sys.argv)>3 else 900
fs=sorted(glob.glob(f'{T}/{sid}/out/s*.json'),key=lambda x:int(x.split('/s')[-1][:-5]))
R=[]
for f in fs:
    try: r=json.load(open(f))
    except: continue
    ev=r.get('eval')
    if isinstance(ev,str) and ev.lstrip().startswith('{') and '"today"' in ev[:30]: R.append((f,json.loads(ev)))
for f,e in R[-k:]:
    print('=====',f.split('/')[-1],e.get('today'))
    for kk in ['guesses','retracts','asks','mind','plans','prc']: print(kk,':',json.dumps(e.get(kk),ensure_ascii=False)[:W])
    for p in e['probs']: print('PROB',p['t'][:40],p['st'],'| stmt',p['stmt'][:200],'| pfix',p['pfix'][:200],'| u1',p['u1'][:300],'| steps',json.dumps(p['steps'],ensure_ascii=False)[:W],'| g',p['g'][:400],'| bk',p.get('bk','')[:300])
    print('SYS',json.dumps(e.get('sys',[])[-3:],ensure_ascii=False)[:1200])
