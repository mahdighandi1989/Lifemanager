# finx.py sid [N] -> print eval outputs of the last N ctls (default 16)
import json,glob,sys
sid=sys.argv[1]; N=int(sys.argv[2]) if len(sys.argv)>2 else 16
fs=sorted(glob.glob(f'{sid}/out/s*.json'),key=lambda x:int(x.split('/s')[-1][:-5]))
for f in fs[-N:]:
    k=f.split('/s')[-1][:-5]
    try: d=json.load(open(f))
    except Exception: continue
    c=open(f'{sid}/ctl/c{k}.json').read()[:70].replace('\n',' ')
    v=d.get('eval') or d.get('shot') or d.get('eval0') or ('EXIT' if d.get('exit') else '')
    print(f'== c{k} {c}\n{str(v)[:int(sys.argv[3]) if len(sys.argv)>3 else 3000]}\n')
