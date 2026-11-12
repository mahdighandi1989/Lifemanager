#!/usr/bin/env python3
# hk2.py DIR N — full coach block + live block + other non-map blocks + last turn
import sys,json,re,os
D,N=sys.argv[1],sys.argv[2]; p=json.load(open(f'{D}/ai/p{N}.json')); u=p['user']; s=p['sys']
if not s.startswith('تو «دستیار»'): print('NON-ASSIST TASK',p.get('task')); print(s[:1500]); print(u[:3000]); sys.exit()
secs=re.split(r'\n(?=# )',u)
for sc in secs:
    h=sc.split('\n')[0]
    if h.startswith('# صفحهٔ فعلی'): print(h[:80],'...'); continue
    if any(h.startswith(x) for x in ['# نقشهٔ سامانه','## ','# برگه‌ها','# ساعت']): continue
    if h.startswith('# گفت‌وگو'):
        print(h); print(sc[-int(os.environ.get('CV','700')):]); continue
    if h.startswith('# امروز') and not os.environ.get('TODAY'): print(sc[:400]); continue
    print(sc[:int(os.environ.get('BL','6000'))])
