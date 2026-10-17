import json,sys,glob,re,os
D=sys.argv[1]
fs=sorted(glob.glob(D+'/out/s*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0]))
for f in reversed(fs):
    r=json.load(open(f)); e=r.get('eval')
    if isinstance(e,str) and e.startswith('{"p":') and '"log"' in e: break
o=json.loads(e)
for p in o['p']: print('PROB',p['id'],p.get('sess'),p.get('cr'),p['t'])
for s in o['s']:
    print('SESS',s['id'],s.get('lp'),s.get('lpAt'),json.dumps(s.get('log'),ensure_ascii=False))
    for m in s['m']: print('   ',m[:int(os.environ.get('W','700'))].replace('\n',' / '))
for f in reversed(fs):
    r=json.load(open(f)); e=r.get('eval')
    if isinstance(e,str) and e.startswith('[{"id":') and '"items"' in e: break
for p in json.loads(e):
    print('BEST',p['id'],p['t'],p['sub'])
    for b in (p['best'] or []): print('    opt',b)
    for it in p['items']: print('    item t=',it['t'],' | k=',it['k'])
