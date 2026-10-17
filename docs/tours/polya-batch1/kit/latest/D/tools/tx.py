import json,glob,re,os,sys
s=sys.argv[1]
for f in sorted(glob.glob(f'{s}/ai/p*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0])):
    p=json.load(open(f)); u=p['user']; i=u.find('# نوبتِ تازه')
    n=re.findall(r'\d+',os.path.basename(f))[0]
    try: r=json.load(open(f'{s}/ai/r{n}.txt'))['reply']
    except Exception: r=open(f'{s}/ai/r{n}.txt').read()[:200]
    print(f'p{n} U:',u[i+12:i+260].replace('\n',' ').strip()); print(f'   A:',r[:330])
