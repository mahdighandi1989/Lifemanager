#!/usr/bin/env python3
"""endseq.py sid [kinds...] : append final dump/shots/exit to seq.json (kinds: dump prer mind prereq route dossier dossier-sess practice today exit)"""
import json,sys,os
sys.path.insert(0,os.path.dirname(__file__)); import mk
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25B'
s=sys.argv[1]; ks=sys.argv[2:] or ['dump','prer','mind','prereq','route','dossier-sess','exit']
L=json.load(open(f'{B}/{s}/seq.json'))
n=len([x for x in os.listdir(f'{B}/{s}/ctl') if x.endswith('.json')])
L=L[:n]
for k in ks:
    if k=='dump': L.append(mk.dump())
    elif k=='prer': L.append(mk.prer())
    elif k=='route': L.append(mk.route('.rt-pt.rt-dest','FINAL'))
    elif k=='exit': L.append({'ctl':{'exit':True}})
    elif k=='open': L.append(mk.openas())
    else: L.append(mk.shot(k))
json.dump(L,open(f'{B}/{s}/seq.json','w'),ensure_ascii=False,indent=0); print(s,len(L))
