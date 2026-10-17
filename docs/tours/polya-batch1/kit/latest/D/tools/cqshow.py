import json,sys,glob,re,os
D=sys.argv[1]
fs=sorted(glob.glob(D+'/out/s*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0]))
for f in reversed(fs):
    r=json.load(open(f)); e=r.get('eval')
    if isinstance(e,str) and e.startswith('{"p":'): break
o=json.loads(e)
for p in o['p']: print(p['id'],p.get('sess'),p.get('cr'),p['t'],'\n   Q:',[q[:100] for q in p['q']])
if len(sys.argv)>2:
  for s in o['s']:
    print(s['id'],s.get('lp'),s.get('lpAt'))
    for m in s['m']: print('   ',m[:240])
