#!/usr/bin/env python3
# run.py DIR [--day N] 'JS (async body allowed; must return)'  -> eval0 = setf (+ day shift), eval = JS
import sys,json,subprocess,os
T=os.path.dirname(os.path.abspath(__file__))
a=sys.argv[1:]; D=a.pop(0); day=None
if a and a[0]=='--day': a.pop(0); day=a.pop(0)
js=a[0] if a else '1'
setf=open(T+'/setf.js').read()
e0=setf
if day is not None:
    dj=json.loads(subprocess.check_output(['python3',T+'/day.py',day]))['eval0']
    e0=setf+'\n;'+dj
c={'eval0':e0,'eval':js}
subprocess.run(['python3',T+'/go.py',D,json.dumps(c)])
