# w.py sid N  (stdin json): base = round22C r{src|N} (or "new": full reply object); "add": merged into coach_state; "omit": drop coach_state;
# "acts": extra actions appended; "drop": action names to remove; other keys update top-level. Saves to round23C/sid/ai/rN.txt and man/sid/rN.txt
import sys,json,os,re

import datetime as _dt
def _shd(t):
    return t
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid,N=sys.argv[1],sys.argv[2]
p=json.loads(sys.stdin.read() or '{}')
if 'new' in p: d=p.pop('new')
else:
    _m=json.load(open(f'{T}/round23C/{sid}/drv.json')).get('map',{}).get(str(N),N) if os.path.exists(f'{T}/round23C/{sid}/drv.json') else N
    d=json.loads(_shd(open(f'{T}/round22C/{sid}/ai/r{p.pop("src",_m)}.txt').read()))
add=p.pop('add',None); om=p.pop('omit',False); ex=p.pop('acts',[]); dr=p.pop('drop',[])
d.update(p); acts=[a for a in d.get('actions',[]) if a.get('do') not in dr]
if add:
    cs=[a for a in acts if a.get('do')=='coach_state']
    if cs: cs[0].update(add)
    else: acts.append(dict({"do":"coach_state","ph":"u","said":[],"ans":[],"stuck":False,"fail":False,"role":"self","nat":"?"},**add))
if om: acts=[a for a in acts if a.get('do')!='coach_state']
acts+=ex
# keep coach_state last
acts=[a for a in acts if a.get('do')!='coach_state']+[a for a in acts if a.get('do')=='coach_state']
d['actions']=acts
s=json.dumps(d,ensure_ascii=False)
try:
    u0=json.load(open(f'{T}/round23C/{sid}/ai/p{N}.json'))['user']
    def _pick(kind):
        for pat in [r'- پروندهٔ تازه[^\n]*?\(pid ('+kind+r'[a-z0-9]+)\)', r'# مسئلهٔ زندهٔ این سشن \(('+kind+r'[a-z0-9]+)\)', r'- ('+kind+r'[a-z0-9]+): تکنیکِ']:
            m_=re.search(pat,u0)
            if m_: return m_.group(1)
        a=re.findall('('+kind+r'[a-z0-9]+)',u0); return a[0] if a else None
    for kind in ['pb_l_','prc_']:
        tgt=_pick(kind)
        for old_id in set(re.findall('('+kind+r'[a-z0-9]+)',s)):
            if old_id not in u0:
                if tgt: s=s.replace(old_id,tgt); print('ID-SUB',old_id,'->',tgt)
                else: print('!!! STALE ID with no target',old_id)
except Exception as e: print('idsub err',e)
open(f'{T}/round23C/{sid}/ai/r{N}.txt','w').write(s); os.makedirs(f'{T}/round23C/man/{sid}',exist_ok=True); open(f'{T}/round23C/man/{sid}/r{N}.txt','w').write(s)
print('wrote',sid,'r'+N,[ (a.get('do'), {k:v for k,v in a.items() if k in ('guess','plan','defer','taste','register','check')}) for a in acts])
