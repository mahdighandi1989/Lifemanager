import json,sys,os,re
s=sys.argv[1]; W=int(os.environ.get('W','500'))
A='../round19B/'+s+'/out'; B=s+'/out'
n=len([f for f in os.listdir(B) if re.match(r's\d+\.json$',f)])
norm=lambda t: re.sub(r'pb_l_[a-z0-9]+|achat_[a-z0-9]+|\d{4}-\d\d-\d\dT[\d:.]+Z','X',t or '')
for k in range(1,n+1):
  try: b=json.load(open(f'{B}/s{k}.json'))
  except: continue
  try: a=json.load(open(f'{A}/s{k}.json'))
  except: a={}
  for key in ('eval0','eval','error'):
    x,y=norm(str(a.get(key,''))),norm(str(b.get(key,'')))
    if x!=y or os.environ.get('ALL'):
      if os.environ.get('HEAD') and x[:int(os.environ['HEAD'])]==y[:int(os.environ['HEAD'])]: continue
      print(f'== c{k} {key}\n  R18: {x[:W]}\n  R19: {y[:W]}')
