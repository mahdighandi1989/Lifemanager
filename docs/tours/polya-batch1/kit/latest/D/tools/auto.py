#!/usr/bin/env python3
# auto.py DIR SRC i j — replay SRC/ctl/c{i..j}.json into DIR; stop at PENDING_AI (prints source idx)
import sys,subprocess,os,json
T=os.path.dirname(os.path.abspath(__file__))
D,S,i,j=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4])
for k in range(i,j+1):
    print(f'##### src c{k}',flush=True)
    o=subprocess.run(['python3',T+'/rp.py',D,S,str(k)],capture_output=True,text=True).stdout
    L=int(os.environ.get('OL','2500'))
    print(o if len(o)<L else o[:L]+'…',flush=True)
    if 'PENDING_AI' in o: print('STOPPED_AT_SRC',k); break
