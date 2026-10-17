#!/usr/bin/env python3
# showctl.py SRCDIR — compact listing of a ctl script
import sys,json,glob,re,os
S=sys.argv[1]
fs=sorted(glob.glob(S+'/ctl/c*.json'),key=lambda f:int(re.findall(r'\d+',os.path.basename(f))[0]))
for f in fs:
    d=json.load(open(f)); n=re.findall(r'\d+',os.path.basename(f))[0]
    e0=d.get('eval0','');m=re.search(r'const off=([\d.\-]+)\*864e5',e0)
    parts=[]
    if m: parts.append('DAY '+m.group(1))
    rest=e0.split('window.__out=')[-1] if 'window.__out=' in e0 else ''
    if 'say' in d: parts.append('SAY '+d['say'])
    if 'eval' in d and 'offsetParent)return;let lab' not in d['eval']: parts.append('EVAL '+d['eval'])
    elif 'eval' in d: parts.append('FIELDS')
    for k in ('click','fill','exit'):
        if k in d: parts.append(k.upper()+' '+json.dumps(d[k],ensure_ascii=False))
    # extra eval0 beyond setf/day
    tail=e0.split(';1\n')[-1] if e0 else ''
    print('c'+n,' | '.join(parts)[:int(os.environ.get('W','600'))])
