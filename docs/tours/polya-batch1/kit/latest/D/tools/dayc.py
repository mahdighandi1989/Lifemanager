#!/usr/bin/env python3
# dayc.py N 'js'  -> prints {"eval0": datepatch+helpers, "eval": js}
import sys,json
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21D/tools/'
n=float(sys.argv[1]); js=sys.argv[2] if len(sys.argv)>2 else open(T+'rec21.js').read()
d="(()=>{const R=window.__RD||Date;window.__RD=R;const off=%s*864e5;function D(...a){if(!(this instanceof D))return new R(R.now()+off).toString();return a.length?new R(...a):new R(R.now()+off)}D.prototype=R.prototype;D.now=()=>R.now()+off;D.UTC=R.UTC;D.parse=R.parse;window.Date=D;APP.go('home');return APP.today()})()"%n
print(json.dumps({"eval0":open(T+'setf.js').read()+'\n;'+open(T+'prc.js').read()+'\n;'+d,"eval":js}))
