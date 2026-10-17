# tq.py sid N -> exit 0 if turn-question lines of round13 pN equal round12 pN (and r12 answer exists); prints both if differ
import json,sys,re,os
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid,n=sys.argv[1],sys.argv[2]
def tq(f):
    u=json.load(open(f))['user']; L=[]
    m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S); turn=m.group(1).strip()[:300] if m else ''
    for l in u.split('\n'):
        if l.startswith('- زمینه (نه پرسشِ دوم)'): continue
        if 'پرسشِ این نوبت همین است' in l or 'پیشنهادِ این نوبت' in l or l.startswith('- در این نوبت فقط یک پرسش') or 'فقط یک پرسش' in l or 'فقط **یک** پرسش' in l or 'همه‌ٔ پرسش‌ها' in l or 'u0)' in l or 'u0 ' in l:
            l=re.sub(r'pb_l_[a-z0-9]+|\d+ دقیقه','X',l)
            mm=re.search(r'پیشنهادِ این نوبت: «[^»]*(?:«[^»]*»[^»]*)*»',l)
            L.append(mm.group(0) if mm else l[:400])
    return turn,L
a=f'{T}/round16C/{sid}/ai/p{n}.json'; b=f'{T}/round15C/{sid}/ai/p{n}.json'
if not os.path.exists(b) or not os.path.exists(f'{T}/round15C/{sid}/ai/r{n}.txt'): print('NO R12 counterpart'); sys.exit(2)
ta,La=tq(a); tb,Lb=tq(b)
if ta!=tb: print('TURN DIFFERS\n 13:',ta[:200],'\n 12:',tb[:200]); sys.exit(1)
if La==Lb: sys.exit(0)
print('TQ DIFF',sid,'p'+n)
for x in La:
  if x not in Lb: print('  +',x[:400])
for x in Lb:
  if x not in La: print('  -',x[:400])
sys.exit(1)
