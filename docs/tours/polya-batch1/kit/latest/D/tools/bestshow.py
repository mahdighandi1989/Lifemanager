import json,glob,re,os,sys
D=sys.argv[1]
fs=sorted(glob.glob(D+'/out/s*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0]))
for f in reversed(fs):
    e=json.load(open(f)).get('eval')
    if isinstance(e,str) and e.startswith('[{"id"') and '"items"' in e: break
for p in json.loads(e):
    print('##',p['t'],p['st'],p['sub'])
    for it in (p.get('items') or []):
        print('   *',json.dumps(it,ensure_ascii=False)[:420])
    if p.get('best'): print('   SELECT:',' | '.join(x[:120] for x in p['best']))
