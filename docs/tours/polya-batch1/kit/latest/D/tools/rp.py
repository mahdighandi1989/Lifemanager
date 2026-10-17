#!/usr/bin/env python3
# rp.py DIR SRC N  — replay round-3 ctl file SRC/ctl/cN.json into DIR (prints result)
import sys,subprocess,os,json,re
T=os.path.dirname(os.path.abspath(__file__))
D,S,N=sys.argv[1:4]; t=open(f'{S}/ctl/c{N}.json').read()
d=json.loads(t); e0=d.get('eval0','')
m=re.search(r'const off=([\d.\-]+)\*864e5',e0)
print('DAYSHIFT',m.group(1) if m else '-')
subprocess.run(['python3',T+'/go.py',D,t])
