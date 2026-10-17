# usage: ans.py DIR N  (reads answer from stdin, validates json if possible)
import sys,json
D,N=sys.argv[1],sys.argv[2]
t=sys.stdin.read().strip()
try: json.loads(t); ok='json ok'
except Exception as e: ok='NOT JSON: '+str(e)
open(D+'/ai/r%s.txt'%N,'w').write(t); print('wrote r%s'%N, ok)
