# cr.py sid [N] -> print correction blocks + live header of pending prompt, and the mapped r24 reply
import json,sys,glob,os,re
sid=sys.argv[1]; D=sid
n=int(sys.argv[2]) if len(sys.argv)>2 else max(int(f.split('/p')[-1][:-5]) for f in glob.glob(D+'/ai/p*.json'))
u=json.load(open(f'{D}/ai/p{n}.json'))['user']
for h in ['# اصلاحی','# اصلاحِ پیامِ پیشین','# مسئلهٔ زنده','# کارِ پیشینِ تو','# وضعِ کنونی','# پیش‌نیاز (کمبود','# نوبتِ تازه']:
    i=u.find(h)
    if i>=0:
        seg=u[i:].split('\n# ')[0]; print(seg[:int(os.environ.get('W','1500'))]); print('---')
m=json.load(open(f'{D}/drv.json')).get('map',{}).get(str(n))
print('MAP',m)
f=f'../round24C/{sid}/ai/r{m}.txt'
if m and m!=-1 and os.path.exists(f): print(open(f).read()[:2500])
