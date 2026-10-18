#!/usr/bin/env python3
"""show.py <sid> [n] [src] : show pending (or n) prompt: key, task, new/removed lines vs the matching round-20 prompt, conversation tail, r21 answer"""
import json, os, sys, re
sys.path.insert(0, os.path.dirname(__file__))
B = '/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid = sys.argv[1]; D = f'{B}/round24B/{sid}'
src = sys.argv[3] if len(sys.argv) > 3 else os.environ.get('SRCS', sid); S = f'{B}/round23B/{src}'
import importlib.util
def pend():
    a = f'{D}/ai'; ps = sorted(int(f[1:-5]) for f in os.listdir(a) if re.match(r'p\d+\.json$', f))
    return next((n for n in ps if not os.path.exists(f'{a}/r{n}.txt')), None)
n = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2] != '-' else pend()
IDRE = re.compile(r'\b(?:pb_[a-z]_[a-z0-9]{6,}|prc_[a-z0-9]{6,}|prl_[a-z0-9]{6,}|achat_[a-z0-9]{6,}|dl_[a-z0-9]{6,})\b')
FA = str.maketrans('۰۱۲۳۴۵۶۷۸۹', '0123456789')
def tk(u):
    i = u.rfind('# نوبتِ تازه'); t = u[i + 13:] if i >= 0 else u[-600:]
    j = t.find('[سامانه — وارسیِ صفحه'); t = t[:j] if j >= 0 else t
    x = IDRE.sub('ID', t).translate(FA); x = re.sub(r'20\d\d-\d\d-\d\d(T[\d:.]+Z)?', 'D', x); x = re.sub(r'\d+', 'N', x); return re.sub(r'\s+', ' ', x).strip()[:400]
def L(u):
    u = IDRE.sub('ID', u); u = re.sub(r'20\d\d-\d\d-\d\d(T[\d:.]+Z)?', 'D', u); out = []
    for p in re.split(r'(?m)^(?=# )', u):
        hd = p.split('\n', 1)[0]
        if hd.startswith(('# صفحهٔ فعلی', '# گفت‌وگو تا این لحظه', '# نقشهٔ سامانه', '# دانسته‌های قلمرو', '# نوبتِ تازه')): continue
        for l in p.split('\n'):
            l = l.rstrip()
            if l: out.append(l)
    return out
d = json.load(open(f'{D}/ai/p{n}.json')); u = d['user']
print(f'=== p{n} task={d.get("task")} len={len(u)} files={d.get("fileIds")}')
am = json.load(open(f'{D}/amap.json')) if os.path.exists(f'{D}/amap.json') else {}
m = am.get(str(n))
if m is None:
    used = set(am.values()); k = tk(u)
    for f in sorted((int(x[1:-5]) for x in os.listdir(f'{S}/ai') if re.match(r'p\d+\.json$', x))):
        if f in used: continue
        if tk(json.load(open(f'{S}/ai/p{f}.json'))['user']) == k: m = f; break
print('heads:', ' | '.join(l[:70] for l in u.split('\n') if l.startswith('# ')))
i = u.rfind('# نوبتِ تازه'); print('TURN:', u[i + 13:][:1500])
W = int(os.environ.get('W', '600'))
if m:
    a = L(json.load(open(f'{S}/ai/p{m}.json'))['user']); b = L(u); A = set(a); Bs = set(b)
    print(f'--- vs r21 p{m}: + new / - gone')
    for l in b:
        if l not in A: print('+ ' + l[:W])
    for l in a:
        if l not in Bs: print('- ' + l[:W])
    print(f'--- r21 r{m}:'); print(open(f'{S}/ai/r{m}.txt').read()[:int(os.environ.get('RL', '2500'))])
else:
    print('--- NO r21 MATCH; full prompt blocks (no map/terr/page):')
    for l in L(u): print('  ' + l[:W])
if os.environ.get('CONV'):
    j = u.find('# گفت‌وگو تا این لحظه'); print(u[j:i][-int(os.environ['CONV']):])
if os.environ.get('PAGE'):
    j = u.find('# صفحهٔ فعلی'); print(u[j:j + int(os.environ['PAGE'])])
