# pv.py sid [N] -> compact pending view: task, turn, turn-question new vs old, special blocks, r23 reply
import json,sys,re,glob,os
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid=sys.argv[1]; D=f'{T}/round24C/{sid}'
n=int(sys.argv[2]) if len(sys.argv)>2 else max(int(f.split('/p')[-1][:-5]) for f in glob.glob(D+'/ai/p*.json'))
W=int(os.environ.get('W','400'))
def tq(u):
    L=[]
    for l in u.split('\n'):
        if '**پرسشِ این نوبت همین است:**' in l or ('فقط **یک** پرسش' in l and not l.startswith('- پرسشِ این نوبت: **فقط**')) or 'پیشنهادِ این نوبت' in l or 'پرسشِ این نوبت همان یکی است): پرسشِ دیگری' in l:
            L.append(l[:W])
        elif re.match(r'- زمینه \(نه پرسشِ دوم\): پرسشِ پیشنهادیِ صفحه',l): L.append('DEMOTE '+l[:W])
    return L
def spec(u):
    L=[]
    for pt in re.split(r'(?m)^(?=# )',u):
        h=pt.split('\n',1)[0]
        if h.startswith(('# اصلاحی','# پیش‌نیاز')) :
            for l in pt.split('\n')[1:]:
                if l.startswith('- زمینه (نه پرسشِ دوم): اگر حرفِ همین پیامش نشان'): continue
                if l.strip(): L.append('  '+l[:W])
    for l in u.split('\n'):
        if 'از گفت‌وگو' in l and ('درست است' in l or 'story' in l): L.append('  STORY '+l[:W])
        if '⏸' in l or 'منتظرِ برگه' in l: L.append('  WAIT '+l[:W])
    return L
j=json.load(open(f'{D}/ai/p{n}.json')); u=j['user']
m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S); t=m.group(1).strip() if m else '?'
mp=json.load(open(D+'/drv.json')).get('map',{}).get(str(n)) if os.path.exists(D+'/drv.json') else None
ot=None
if mp and mp!=-1 and os.path.exists(f'{T}/round23C/{sid}/ai/p{mp}.json'): ot=json.load(open(f'{T}/round23C/{sid}/ai/p{mp}.json'))
print(f'=== {sid} p{n} task={j.get("task")} (r23 p{mp} task={ot.get("task") if ot else "-"})\nTURN: {t[:900]}')
for l in tq(u): print(' N|',l)
if ot:
    for l in tq(ot['user']): print(' O|',l)
for l in spec(u): print(' S|',l)
if ot:
    r=f'{T}/round23C/{sid}/ai/r{mp}.txt'
    if os.path.exists(r):
        d=json.load(open(r)); print(' R23:',d.get('reply','')[:900]); print(' ACTS:',json.dumps([a for a in d.get('actions',[])],ensure_ascii=False)[:1200])
        for k in ('status','gap','title','pinned'):
            if k in d and k!='status': print(' TOP',k,str(d[k])[:200])
