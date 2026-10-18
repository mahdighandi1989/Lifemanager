# helpers to build seq entries
import json, os
T = os.path.dirname(os.path.abspath(__file__))
DUMP = open(f'{T}/dump.js').read()
def src(*ks): return [{'src': k} for k in ks]
def say(t, adv=0): d = {'say': t}; d.update({'eval0': f'__adv({adv});1'} if adv else {}); return {'ctl': d}
def ev(js): return {'ctl': {'eval': js}}
def dump(): return ev(DUMP)
PID = "(()=>{const R=JSON.parse(localStorage.getItem('mla.records.v1')||'{}');const L=Object.values(R).filter(r=>r&&r.type==='eprob'&&r.live).map(r=>r.p.id);return L[L.length-1]})()"
def shot(view, sub=None, scroll=None, open_from=None):
    # close assistant, go to view (live pid auto), optionally scroll to text; the harness viewport shot s<N>.png shows it
    a = 'null' if sub is None else json.dumps(sub)
    sc = 'window.scrollTo(0,0);' if not scroll else "{const el=[...document.querySelectorAll('#main *')].filter(e=>e.children.length<6&&e.getClientRects().length&&"+json.dumps(scroll)+".split('|').some(t=>e.textContent.includes(t))).pop();if(el)el.scrollIntoView({block:'center'});}"
    tgt = PID if view in ('lprob', 'dossier') else 'null'
    if view == 'dossier-sess': view = 'dossier'; tgt = "APP.ASSIST.cur().id"
    js = "(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));APP.ASSIST.toggle(false);APP.go(" + json.dumps(view) + "," + tgt + "," + a + ");await w(1000);"
    if view == 'mind': js += "document.querySelectorAll('#main details').forEach(d=>{if(/از کجا/.test(d.textContent.slice(0,80)))d.open=true});await w(400);"
    js += sc + "await w(300);return location.hash+' '+APP.state.view+' '+(APP.state.arg||'')})()"
    return ev(js)
def openas(): return ev("(()=>{APP.ASSIST.toggle(true);return 1})()")
def write(sid, L):
    B = '/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24B'
    os.makedirs(f'{B}/{sid}', exist_ok=True); json.dump(L, open(f'{B}/{sid}/seq.json', 'w'), ensure_ascii=False, indent=0); print(sid, len(L), 'entries')
def route(sel='.rt-pt.rt-now', tag=''):
    # open «🧭» for the session's live problem (else the chat session), hover one point, return model summary + tip
    js = ("(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const s=APP.ASSIST.cur();let id='';try{const b=APP.ASSIST.boundLive?APP.ASSIST.boundLive(s):null;id=b&&b.pid?b.pid:(s.lprob&&APP.liveRec&&APP.liveRec(s.lprob)?s.lprob:s.id)}catch(e){id=s.id}"
          "APP.ASSIST.toggle(false);APP.go('route',id);await w(1200);const g=document.querySelector(%s)||document.querySelector('.rt-pt.rt-now')||document.querySelector('.rt-pt');"
          "if(g){g.dispatchEvent(new Event('mouseenter'));g.scrollIntoView({block:'center'});}await w(500);const t=document.querySelector('.rt-tip');let M={};try{M=APP.ROUTE.model(id)}catch(e){M={err:String(e)}}"
          "return %s+' id='+id+' TIP: '+(t&&!t.hidden?t.innerText:'(none)')+' ## M: '+JSON.stringify({pts:(M.pts||[]).map(p=>[p.cls,p.k,(p.title||'').slice(0,50)]),dets:(M.dets||[]).map(d=>[d.kind,d.concept,d.depth,d.open,d.rejoin]),backs:(M.backs||[]).length,now:M.nowFa,remain:M.remain,dest:M.dest}).slice(0,2500)})()") % (json.dumps(sel), json.dumps(tag))
    return ev(js)
def prer():
    js = "(()=>{const s=APP.ASSIST.cur();let o={};try{const sc=APP.PRE.scope(s);o.stack=APP.PRE.all(sc);o.rec=APP.PRE.rec(sc)}catch(e){o.err=String(e)}try{o.causes=APP.MIND.phases().causes;o.pre=APP.MIND.phases().prereq}catch(e){o.merr=String(e)}return JSON.stringify(o).slice(0,4000)})()"
    return ev(js)
