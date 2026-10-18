# helpers for building insertion specs
import json
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21D/tools/'
REC=open(T+'rec21.js').read(); SETF=open(T+'setf.js').read(); PRC=open(T+'prc.js').read()
def rec(tag): return {'new':{'eval0':SETF+'\n;'+PRC,'eval':REC},'tag':tag}
def say(t,tag): return {'new':{'say':t},'tag':tag}
def ev(js,tag): return {'new':{'eval0':SETF+'\n;'+PRC,'eval':js},'tag':tag}
def day(n,tag,js=None):
    d="(()=>{const R=window.__RD||Date;window.__RD=R;const off=%s*864e5;function D(...a){if(!(this instanceof D))return new R(R.now()+off).toString();return a.length?new R(...a):new R(R.now()+off)}D.prototype=R.prototype;D.now=()=>R.now()+off;D.UTC=R.UTC;D.parse=R.parse;window.Date=D;APP.go('home');return APP.today()})()"%n
    return {'new':{'eval0':SETF+'\n;'+PRC+'\n;'+d,'eval':js or REC},'tag':tag}
def shot(tag): return {'new':{'snap':tag},'tag':tag}
