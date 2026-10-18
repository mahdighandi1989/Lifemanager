import json,sys,glob,re,os
D=sys.argv[1]; k=sys.argv[2]
r=json.load(open(f'{D}/out/s{k}.json')); e=r.get('eval')
try: o=json.loads(e)
except: print(str(e)[:3000]); sys.exit()
keys=sys.argv[3].split(',') if len(sys.argv)>3 else o.keys()
for kk in keys:
    print('##',kk,':',json.dumps(o.get(kk),ensure_ascii=False)[:int(os.environ.get('L','1500'))])
