# cv24.py rounddir sid [W] -> per prompt: task, turn, reply, actions
import json,glob,re,sys,os
R=sys.argv[1]; sid=sys.argv[2]; W=int(sys.argv[3]) if len(sys.argv)>3 else 600
for f in sorted(glob.glob(f'{R}/{sid}/ai/p*.json'),key=lambda x:int(x.split('/p')[-1][:-5])):
    k=int(f.split('/p')[-1][:-5]); j=json.load(open(f)); u=j['user']
    m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S); t=(m.group(1).strip() if m else u[-300:])
    print(f'--- p{k} task={j.get("task")} sys={j.get("sys","")[:30]!r}\nU: {t[:W]}')
    rf=f'{R}/{sid}/ai/r{k}.txt'
    if os.path.exists(rf):
        try:
            d=json.loads(open(rf).read()); print('R:',d.get('reply','')[:W]); print('A:',json.dumps([a for a in d.get('actions',[])],ensure_ascii=False)[:W])
        except Exception as e: print('R(raw):',open(rf).read()[:W])
