# cq.py sid [N] -> compare the turn question(s) of round23 pN with its round22 counterpart; show r22 reply
import json,sys,re,glob,os
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid=sys.argv[1]; D=f'{T}/round24C/{sid}'
n=int(sys.argv[2]) if len(sys.argv)>2 else max(int(f.split('/p')[-1][:-5]) for f in glob.glob(D+'/ai/p*.json'))
W=int(os.environ.get('W','330'))
def tq(u):
    L=[]
    for pt in re.split(r'(?m)^(?=# )',u):
        h=pt.split('\n',1)[0]
        if h.startswith(('# پیش‌نیاز','# مخاطب','# اصلاحی','# پس از شکست')) and len(pt)>0:
            for l in pt.split('\n'):
                if l.startswith('- زمینه (نه پرسشِ دوم): اگر حرفِ همین پیامش نشان') : continue
                if l.strip(): L.append('  '+l[:W])
            continue
        for l in pt.split('\n'):
            if '**پرسشِ این نوبت همین است:**' in l or 'فقط **یک** پرسش' in l or 'پیشنهادِ این نوبت' in l: L.append(l[:W])
    return L
j=json.load(open(f'{D}/ai/p{n}.json')); u=j['user']
m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S); print(f'=== {sid} p{n} task={j.get("task")} TURN:',m.group(1).strip()[:600] if m else '?')
for l in tq(u): print(' N|',l)
mp=json.load(open(D+'/drv.json')).get('map',{}).get(str(n)) if os.path.exists(D+'/drv.json') else None
if mp and mp!=-1 and os.path.exists(f'{T}/round23C/{sid}/ai/p{mp}.json'):
    print(f'--- r22 p{mp}')
    for l in tq(json.load(open(f'{T}/round23C/{sid}/ai/p{mp}.json'))['user']): print(' O|',l)
    r=f'{T}/round23C/{sid}/ai/r{mp}.txt'
    if os.path.exists(r):
        d=json.load(open(r)); print(' R22:',d['reply'][:700]); print(' ACTS:',json.dumps([a for a in d.get('actions',[])],ensure_ascii=False)[:900])
else: print('--- no r22 map',mp)
