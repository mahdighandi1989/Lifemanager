#!/usr/bin/env python3
# lsc.py dir — list ctls: say / eval (tail) / click / fill
import json,glob,os,re,sys
D=sys.argv[1]
for f in sorted(glob.glob(D+'/ctl/c*.json'),key=lambda x:int(re.findall(r'\d+',os.path.basename(x))[0])):
    c=json.load(open(f)); k=os.path.basename(f)[:-5]
    parts=[]
    for key in ('say','click','fill','exit','snap'):
        if key in c: parts.append(f'{key}={str(c[key])[:int(os.environ.get("W","200"))]}')
    if 'eval' in c: parts.append('eval='+c['eval'][-int(os.environ.get('W','200')):].replace('\n',' '))
    if 'eval0' in c and not parts: parts.append('eval0='+c['eval0'][-150:].replace('\n',' '))
    print(k,' | '.join(parts))
