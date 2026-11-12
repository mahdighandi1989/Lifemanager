#!/usr/bin/env python3
# armf.py sid — compact evidence of a territory arm: sys state after the routine reply, page lines, markers (card / route / dossier / today)
import sys,json,glob,re,os
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26D/'
s=sys.argv[1]; D=R+s; num=lambda f:int(re.findall(r'\d+',os.path.basename(f))[0])
L=int(os.environ.get('L','420'))
seen=[]
for f in sorted(glob.glob(D+'/out/s*.json'),key=num):
    try: r=json.load(open(f))
    except: continue
    e=r.get('eval')
    if isinstance(e,str) and (e.startswith('{"areas"') or e.startswith('{"card"') or e.startswith('{"now"') or e.startswith('🧭') or e.startswith('["')):
        e2=e
        if e.startswith('{"areas"'):
            o=json.loads(e); e2='AREAS %s SYS %s'%(o['areas'],json.dumps(o['sys'],ensure_ascii=False))
        elif e.startswith('{"card"'):
            o=json.loads(e); e2='CARD '+o['card'].replace('\n',' / ')+' || ST '+json.dumps([(x.get('st'),x.get('tool')) for x in o.get('sys',[])],ensure_ascii=False)
        elif e.startswith('{"now"'):
            o=json.loads(e); e2='ROUTE now=%s remain=%s dets=%s'%(o['now'],o['remain'],[p for p in o['pts'] if p.startswith('det')])
        print(f'[s{num(f)}]',e2[:L].replace('\\n',' / '))
    for m in r.get('state',{}).get('msgs',[]):
        if m.startswith('sys:') and m not in seen: seen.append(m); print(f'[s{num(f)}]',m[:L])
sh=glob.glob(D+'/sheets/sh*.json')
for f in sh:
    j=json.load(open(f)); print('SHEET',j['number'],j['status'],[ (n['by'],n['text'][:150].replace('\n',' ')) for n in j['notes'][1:]])
