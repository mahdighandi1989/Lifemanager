#!/usr/bin/env python3
"""drv.py <sid> [src_sid] : replay round21B/<src>/ctl (via <sid>/seq.json if present) on a running harness5 in round22B/<sid>;
answer AI calls: akey (manual, by turn key) > rewrite? stop > round20 match by turn key (apatch/aovr/stop flags) > stop.
exit 0 END, 3 needs manual answer, 1 timeout."""
import json, os, sys, time, re, hashlib
B = '/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
sid = sys.argv[1]; src = sys.argv[2] if len(sys.argv) > 2 else os.environ.get('SRCS', sid)
D = f'{B}/round22B/{sid}'; S = f'{B}/round21B/{src}'
for d in ('ctl', 'akey', 'apatch', 'aovr', 'diff'): os.makedirs(f'{D}/{d}', exist_ok=True)
IDRE = re.compile(r'\b(?:pb_[a-z]_[a-z0-9]{6,}|prc_[a-z0-9]{6,}|prl_[a-z0-9]{6,}|achat_[a-z0-9]{6,}|dl_[a-z0-9]{6,})\b')
RW = '[سامانه — وارسیِ صفحه پیش از نشان دادنِ پاسخ'
FA = str.maketrans('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩', '01234567890123456789')
def jl(f): return json.load(open(f))
def ids(u):
    out = []
    for m in IDRE.findall(u):
        if m not in out: out.append(m)
    return out
def turnkey(u):
    i = u.rfind('# نوبتِ تازه'); t = u[i + 13:] if i >= 0 else u[-600:]
    rw = ''
    j = t.find(RW)
    if j >= 0: rw = t[j:]; t = t[:j]
    def nz(x):
        x = IDRE.sub('ID', x); x = x.translate(FA); x = re.sub(r'20\d\d-\d\d-\d\d(T[\d:.]+Z)?', 'D', x)
        x = re.sub(r'\d+', 'N', x); return re.sub(r'\s+', ' ', x).strip()[:400]
    return nz(t), (nz(rw) if rw else '')
def seq():
    f = f'{D}/seq.json'
    if os.path.exists(f): return jl(f)
    n = len([x for x in os.listdir(f'{S}/ctl') if re.match(r'c\d+\.json$', x)])
    return [{'src': k} for k in range(1, n + 1)]
def nctl(): return len([x for x in os.listdir(f'{D}/ctl') if re.match(r'c\d+\.json$', x)])
def pending():
    a = f'{D}/ai'
    if not os.path.isdir(a): return None
    ps = sorted(int(f[1:-5]) for f in os.listdir(a) if re.match(r'p\d+\.json$', f))
    return next((n for n in ps if not os.path.exists(f'{a}/r{n}.txt')), None)
def loadmap():
    m = {}
    if os.path.exists(f'{D}/map.txt'):
        for l in open(f'{D}/map.txt'):
            p = l.split()
            if len(p) == 2: m[p[0]] = p[1]
    return m
def addmap(a, b):
    m = loadmap()
    if a != b and a not in m and a.startswith('pb_'): open(f'{D}/map.txt', 'a').write(f'{a} {b}\n')
def src_calls():
    a = f'{S}/ai'; out = []
    if not os.path.isdir(a): return out
    for n in sorted(int(f[1:-5]) for f in os.listdir(a) if re.match(r'p\d+\.json$', f)):
        if os.path.exists(f'{a}/r{n}.txt'):
            u = jl(f'{a}/p{n}.json')['user']; out.append((n, turnkey(u)[0], u))
    return out
AM = f'{D}/amap.json'
def amap(): return jl(AM) if os.path.exists(AM) else {}
def log(s):
    print(s, flush=True); open(f'{D}/drv.log', 'a').write(s + '\n')
def write_ans(n, txt, how):
    try: json.loads(txt)
    except Exception as e:
        log(f'INVALID JSON for p{n}: {e}'); sys.exit(3)
    open(f'{D}/ai/r{n}.txt', 'w').write(txt)
    d = jl(f'{D}/ai/p{n}.json'); log(f'ANS p{n} task={d.get("task")} {how}')
def keyhash(n):
    d = jl(f'{D}/ai/p{n}.json'); k, rw = turnkey(d['user']); full = k + ('|RW|' + rw if rw else '')
    occ = 0
    for m in range(1, n):
        f = f'{D}/ai/p{m}.json'
        if os.path.exists(f):
            k2, rw2 = turnkey(jl(f)['user'])
            if k2 + ('|RW|' + rw2 if rw2 else '') == full: occ += 1
    return hashlib.md5(full.encode()).hexdigest()[:10] + f'_{occ}', k, rw
def answer(n):
    d = jl(f'{D}/ai/p{n}.json'); u = d['user']; cur = ids(u)
    h, k, rw = keyhash(n)
    f = f'{D}/akey/{h}.txt'
    if os.path.exists(f):
        t = open(f).read()
        for i, x in enumerate(cur): t = t.replace(f'__I{i}__', x)
        lp = [x for x in cur if x.startswith('pb_l_')]
        for x in set(re.findall(r'pb_l_[a-z0-9]{8,}', t)):
            if x not in cur and lp: t = t.replace(x, lp[0]); log(f'AKEY-MAP {x} -> {lp[0]}')
        pc = [x for x in cur if x.startswith('prc_')]
        for x in set(re.findall(r'prc_[a-z0-9]{6,}', t)):
            if x not in cur and pc: t = t.replace(x, pc[0]); log(f'AKEY-MAP {x} -> {pc[0]}')
        write_ans(n, t, f'akey {h}'); return True
    if rw:
        am = amap(); used = set(am.values())
        for (m, k2, u2) in src_calls():
            if m in used or k2 != k or turnkey(u2)[1] != rw: continue
            am[str(n)] = m; json.dump(am, open(AM, 'w'))
            if os.path.exists(f'{D}/stop_{m}'): log(f'STOP p{n} (=r21 rw p{m}) flagged'); return False
            old = ids(u2); t = open(f'{D}/aovr/r{m}.txt').read() if os.path.exists(f'{D}/aovr/r{m}.txt') else open(f'{S}/ai/r{m}.txt').read()
            for a, b in zip(old, cur): t = t.replace(a, b)
            write_ans(n, t, f'reuse r21 rewrite p{m}'); return True
        log(f'STOP p{n} REWRITE h={h} :: {rw[:300]}'); return False
    am = amap(); used = set(am.values())
    for (m, k2, u2) in src_calls():
        if m in used or k2 != k: continue
        am[str(n)] = m; json.dump(am, open(AM, 'w'))
        if os.path.exists(f'{D}/stop_{m}'):
            log(f'STOP p{n} (=r21 p{m}) flagged h={h}'); return False
        old = ids(u2)
        for a, b in zip(old, cur): addmap(a, b)
        if os.path.exists(f'{D}/aovr/r{m}.txt'):
            t = open(f'{D}/aovr/r{m}.txt').read()
        else:
            t = open(f'{S}/ai/r{m}.txt').read()
        for a, b in zip(old, cur): t = t.replace(a, b)
        how = f'reuse r21 p{m}'
        if os.path.exists(f'{D}/apatch/p{m}.json'):
            P = jl(f'{D}/apatch/p{m}.json'); dd = json.loads(t) if 'new' not in P else P['new']
            for a_, b_ in P.get('rep', []): dd['reply'] = dd['reply'].replace(a_, b_)
            if 'reply' in P: dd['reply'] = P['reply']
            acts = [x for x in dd.get('actions', []) if x.get('do') not in P.get('drop', [])]
            if P.get('nocs'): acts = [x for x in acts if x.get('do') != 'coach_state']
            if P.get('cs'):
                cs = [x for x in acts if x.get('do') == 'coach_state']
                if cs: cs[0].update(P['cs'])
                else: acts.append(dict({'do': 'coach_state'}, **P['cs']))
            for x in acts:
                if x.get('do') == 'coach_state':
                    for kk in P.get('csdel', []): x.pop(kk, None)
            acts += P.get('add', [])
            dd['actions'] = acts
            for kk in ('memory', 'pinned'):
                if kk in P: dd[kk] = P[kk]
            t = json.dumps(dd, ensure_ascii=False); how += ' +patch'
            for i, x in enumerate(cur): t = t.replace(f'__I{i}__', x)
        write_ans(n, t, how); return True
    log(f'STOP p{n} NOMATCH h={h} key={k[:200]}'); return False
def nextctl(e):
    if 'ctl' in e: c = json.dumps(e['ctl'], ensure_ascii=False)
    else: c = open(f'{S}/ctl/c{e["src"]}.json').read()
    m = loadmap()
    for a, b in m.items(): c = c.replace(a, b)
    for x in set(re.findall(r'pb_l_[a-z0-9]{8,}', c)):
        if x in m.values(): continue
        # unknown id: map to the most common live id seen in outputs
        cnt = {}
        for f in os.listdir(f'{D}/out'):
            if re.match(r's\d+\.json$', f):
                for y in re.findall(r'pb_l_[a-z0-9]{8,}', open(f'{D}/out/{f}').read()): cnt[y] = cnt.get(y, 0) + 1
        if not cnt: log(f'NEEDMAP {x}'); sys.exit(5)
        y = max(cnt, key=cnt.get); open(f'{D}/map.txt', 'a').write(f'{x} {y}\n'); c = c.replace(x, y); log(f'MAP {x} <- {y} (heur)')
    json.loads(c); k = nctl() + 1; open(f'{D}/ctl/c{k}.json', 'w').write(c)
    log(f'CTL c{k} {("src c"+str(e["src"])) if "src" in e else "new"} :: {c[:140]}')
L = seq(); t0 = time.time(); stopat = int(os.environ.get('STOPAT', '0'))
while True:
    p = pending()
    if p:
        time.sleep(0.4)
        if not answer(p): sys.exit(3)
        t0 = time.time(); continue
    k = nctl()
    if k == 0 or os.path.exists(f'{D}/out/s{k}.json'):
        if k >= len(L): log('END'); sys.exit(0)
        if stopat and k + 1 >= stopat: log(f'STOPAT {k+1}'); sys.exit(4)
        nextctl(L[k]); t0 = time.time(); continue
    if time.time() - t0 > float(os.environ.get('TMO', '240')): log(f'TIMEOUT waiting s{k}'); sys.exit(1)
    time.sleep(0.5)
