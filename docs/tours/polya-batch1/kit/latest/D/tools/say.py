#!/usr/bin/env python3
# say.py DIR 'message' [evalJS]  -> ctl with say (+ setf eval0)
import sys,json,subprocess,os
T=os.path.dirname(os.path.abspath(__file__))
D,msg=sys.argv[1],sys.argv[2]; c={'eval0':open(T+'/setf.js').read(),'say':msg}
if len(sys.argv)>3: c['eval']=sys.argv[3]
subprocess.run(['python3',T+'/go.py',D,json.dumps(c)])
