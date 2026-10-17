#!/usr/bin/env python3
# prints a ctl JSON that shifts the page clock by N days from real now (idempotent), re-renders, goes to home
import sys,json
n=float(sys.argv[1]); extra=sys.argv[2] if len(sys.argv)>2 else ''
js="(()=>{const R=window.__RD||Date;window.__RD=R;const off=%s*864e5;function D(...a){if(!(this instanceof D))return new R(R.now()+off).toString();return a.length?new R(...a):new R(R.now()+off)}D.prototype=R.prototype;D.now=()=>R.now()+off;D.UTC=R.UTC;D.parse=R.parse;window.Date=D;APP.go('home');return APP.today()+' due: '+APP.dueList().map(d=>d.txt+' / '+(d.sub||'')).join(' ;; ')})()"%n
d={"eval0":js}
if extra: d.update(json.loads(extra))
print(json.dumps(d))
