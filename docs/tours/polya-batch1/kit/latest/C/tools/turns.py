import json,re,glob,sys
for R in ('round20C','round21C'):
  print('##',R)
  for f in sorted(glob.glob(f'{R}/{sys.argv[1]}/ai/p*.json'),key=lambda x:int(x.split('/p')[-1][:-5])):
    j=json.load(open(f)); u=j['user']; m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S)
    print(f.split('/')[-1],j.get('task'),(m.group(1)[:70] if m else u[:70]).replace('\n',' '))
