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
    B = '/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22B'
    os.makedirs(f'{B}/{sid}', exist_ok=True); json.dump(L, open(f'{B}/{sid}/seq.json', 'w'), ensure_ascii=False, indent=0); print(sid, len(L), 'entries')
