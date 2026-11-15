#!/usr/bin/env python3
# msgs.py dir k [n] — last n chat messages after ctl k (default all 10) + overlay/marks
import json,sys
D,k=sys.argv[1],sys.argv[2]; n=int(sys.argv[3]) if len(sys.argv)>3 else 10
r=json.load(open(f'{D}/out/s{k}.json')); st=r.get('state',{})
for m in st.get('msgs',[])[-n:]: print('>>',m[:1500])
for key in ('eval0','eval','error'):
    if key in r: print(key.upper(),str(r[key])[:1500])
if st.get('overlay'): print('OVERLAY',st['overlay'][:500])
