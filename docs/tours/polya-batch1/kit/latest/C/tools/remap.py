# remap.py sid N [omit] -> r19 answer with field keys remapped by label (old prompt -> new prompt); writes via w.py-like output
import json,re,sys,os
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid,N=sys.argv[1],sys.argv[2]; src=os.environ.get('SRC',N)
def keys(u):
    d={}
    for l in u.split('\n'):
        m=re.match(r'- (k\d+) \| \w+ \| «([^»]*)»',l)
        if m: d[m.group(1)]=m.group(2)
    return d
uo=json.load(open(f'{T}/round19C/{sid}/ai/p{src}.json'))['user']; un=json.load(open(f'{T}/round20C/{sid}/ai/p{N}.json'))['user']
ko,kn=keys(uo),keys(un); inv={}
for k,l in kn.items(): inv.setdefault(l,k)
d=json.load(open(f'{T}/round19C/{sid}/ai/r{src}.txt'))
for a in d.get('actions',[]):
    if 'k' in a and a['k'] in ko:
        nk=inv.get(ko[a['k']]); print(a['do'],a['k'],'->',nk,ko[a['k']][:40]); a['k']=nk or a['k']
if 'omit' in sys.argv: d['actions']=[a for a in d['actions'] if a.get('do')!='coach_state']
s=json.dumps(d,ensure_ascii=False); open(f'{T}/round20C/{sid}/ai/r{N}.txt','w').write(s)
os.makedirs(f'{T}/round20C/man/{sid}',exist_ok=True); open(f'{T}/round20C/man/{sid}/r{N}.txt','w').write(s)
