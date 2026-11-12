import json,sys,glob,re,os
# lastev.py sid k  -> print full eval of the k-th last out file containing 'eval' (1 = last)
s=sys.argv[1]; k=int(sys.argv[2]) if len(sys.argv)>2 else 1
fs=sorted(glob.glob(f'{s}/out/s*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0]))
ev=[json.load(open(f)).get('eval') for f in fs]; ev=[e for e in ev if e]
print(ev[-k])
