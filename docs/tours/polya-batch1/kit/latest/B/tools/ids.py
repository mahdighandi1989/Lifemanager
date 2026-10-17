import json,re,sys
for f in sys.argv[1:]:
  u=json.load(open(f))['user']; i=u.find('# امروز'); u2=u[i:] if i>0 else u
  print(f.split('/')[-3]+'/'+f.split('/')[-1], sorted(set(re.findall(r'(?<![A-Za-z])([ABC]\d{3})(?!\d)',u2))))
