import json,sys,os,re
s=sys.argv[1]; off=int(open(f'{s}/off.txt').read()) if os.path.exists(f'{s}/off.txt') else 0
B='../round17B/'+s
n=len(os.listdir(B+'/ctl'))
for k in range(1,n+1):
  def g(d,kk):
    f=f'{d}/out/s{kk}.json'
    if not os.path.exists(f): return 'MISSING'
    o=json.load(open(f)); return re.sub(r'pb_[a-z]_[a-z0-9]+','PB',re.sub(r'20\d\d-\d\d-\d\dT[\d:.]+Z','TS',str(o.get('error') or '')+str(o.get('eval0') or '')+str(o.get('eval') or '')))
  a=g(B,k); 
  # map R8 ctl k -> R9 out index: k + (#extra evals inserted before) ; assume extras inserted before map point
  kk=k+ (off if k>=int(os.environ.get('OFFAT','9999')) else 0)
  b=g(s,kk)
  if a!=b: print(f'--c{k} DIFF\n R8:',a[:int(os.environ.get('L','400'))],'\n R9:',b[:int(os.environ.get('L','400'))])
