# tqcmp.py sid -> per turn: turn-question line r23 vs mapped r22
import json,glob,re,sys,os
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid=sys.argv[1]
def tq(u):
    for l in u.split('\n'):
        if '**پرسشِ این نوبت همین است:**' in l or 'فقط **یک** پرسش' in l:
            m=re.search(r'«([^»]{5,160})',l.split('**پرسشِ این نوبت همین است:**')[-1]) if 'همین است' in l else re.search(r'\): «([^»]{5,160})',l)
            return (m.group(1) if m else l[:120])
    m=re.search(r'پیشنهادِ این نوبت: «([^»]{5,160})',u)
    return 'SUG '+m.group(1) if m else '—'
mp=json.load(open(f'{T}/round23C/{sid}/drv.json')).get('map',{})
for f in sorted(glob.glob(f'{T}/round23C/{sid}/ai/p*.json'),key=lambda x:int(x.split('/p')[-1][:-5])):
    k=int(f.split('/p')[-1][:-5]); u=json.load(open(f))['user']
    m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S); t=(m.group(1).strip()[:50] if m else '')
    a=tq(u); o=mp.get(str(k),-1); b='-'
    if o and o!=-1 and os.path.exists(f'{T}/round22C/{sid}/ai/p{o}.json'): b=tq(json.load(open(f'{T}/round22C/{sid}/ai/p{o}.json'))['user'])
    flag='' if a==b else ' **DIFF**'
    print(f'p{k} [r22 p{o}] «{t}»{flag}\n   23: {a[:150]}\n   22: {b[:150]}' if flag else f'p{k} [r22 p{o}] same: {a[:90]}')
