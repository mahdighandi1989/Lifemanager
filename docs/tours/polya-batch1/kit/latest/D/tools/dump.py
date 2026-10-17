#!/usr/bin/env python3
# dump.py SRCDIR — per AI call: user turn (after «# نوبتِ تازه») + old reply's coach_state / actions names
import sys,json,glob,re,os
D=sys.argv[1]
fs=sorted(glob.glob(D+'/ai/p*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0]))
for f in fs:
    k=re.findall(r'\d+',os.path.basename(f))[0]; p=json.load(open(f)); u=p['user']
    if not p['sys'].startswith('تو «دستیار»'): print(f'--- p{k} NON-ASSIST {p.get("task")}'); continue
    t=u.split('# نوبتِ تازه')[-1].strip()
    try: r=json.loads(open(f'{D}/ai/r{k}.txt').read())
    except Exception as e: r={'reply':'?? '+str(e)}
    acts=r.get('actions',[]); cs=[a for a in acts if a.get('do')=='coach_state']
    print(f'--- p{k} USER: {t[:600]}')
    print(f'    REPLY: {r.get("reply","")[:300]}')
    print(f'    ACTS: {[a.get("do") for a in acts]}  CS: {json.dumps(cs,ensure_ascii=False)[:400]}')
