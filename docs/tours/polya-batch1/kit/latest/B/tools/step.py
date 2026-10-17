#!/usr/bin/env python3
"""step.py <dir> [ctl-json-file|-]   : if ctl given, write next ctl/cN.json. Then wait until either
an unanswered ai/pN.json appears (print it, exit 2) or the out/sN.json for the last ctl appears (print summary, exit 0).
step.py <dir> --answer <file>        : write file content as answer to the pending pN (validate JSON if it parses), then wait as above."""
import json, os, sys, time, hashlib
D = sys.argv[1]
os.makedirs(D + '/ctl', exist_ok=True)
SEEN = D + '/tools_seen_sys.txt'

def nctl():
    return len([f for f in os.listdir(D + '/ctl') if f.startswith('c') and f.endswith('.json')])

def pending():
    ai = D + '/ai'
    if not os.path.isdir(ai): return None
    ps = sorted(int(f[1:-5]) for f in os.listdir(ai) if f.startswith('p') and f.endswith('.json'))
    for n in ps:
        if not os.path.exists(f'{ai}/r{n}.txt'): return n
    return None

args = sys.argv[2:]
if args and args[0] == '--answer':
    n = pending()
    txt = open(args[1]).read().strip()
    try:
        json.loads(txt)
    except Exception as e:
        if txt.startswith('{'):
            print('INVALID JSON', e); sys.exit(3)
    open(f'{D}/ai/r{n}.txt', 'w').write(txt)
    print('answered p%d' % n)
elif args:
    src = args[0]
    c = sys.stdin.read() if src == '-' else open(src).read()
    json.loads(c)
    k = nctl() + 1
    open(f'{D}/ctl/c{k}.json', 'w').write(c)
    print('wrote c%d' % k)

target = nctl()
t0 = time.time()
while True:
    n = pending()
    if n:
        time.sleep(0.5)
        d = json.load(open(f'{D}/ai/p{n}.json'))
        sysp = d['sys']; h = hashlib.md5(sysp.encode()).hexdigest()[:8]
        seen = open(SEEN).read().split() if os.path.exists(SEEN) else []
        print(f'=== PENDING p{n} task={d.get("task")} files={d.get("fileIds")} syslen={len(sysp)} hash={h}')
        if h not in seen:
            print('--- SYS (new) ---'); print(sysp)
            open(SEEN, 'a').write(h + '\n')
        u = d['user']
        print('--- USER (%d chars) ---' % len(u))
        if os.environ.get('FULLU') or not u.startswith('# نقشهٔ سامانه'):
            lim = int(os.environ.get('ULIM', '14000'))
            print(u if len(u) <= lim else u[:lim // 2] + '\n.....[CUT].....\n' + u[-lim // 2:])
        else:
            import re
            parts = re.split(r'(?m)^(?=# )', u)
            caps = {'# نقشهٔ سامانه': 0, '# دانسته‌های قلمرو': 700, '# صفحهٔ فعلی': int(os.environ.get('PAGE', '3500')), '# گفت‌وگو تا این لحظه': int(os.environ.get('CONV', '2500'))}
            for pt in parts:
                hd = pt.split('\n', 1)[0]
                cap = next((v for k, v in caps.items() if hd.startswith(k)), 6000)
                if cap == 0: print(hd + ' [omitted]'); continue
                if hd.startswith('# گفت‌وگو'): print(hd + '\n...' + pt[-cap:] if len(pt) > cap else pt)
                else: print(pt[:cap] + (' …[+%d]' % (len(pt) - cap) if len(pt) > cap else ''))
        sys.exit(2)
    of = f'{D}/out/s{target}.json'
    if target and os.path.exists(of):
        time.sleep(0.3)
        o = json.load(open(of))
        st = o.get('state', {})
        print(f'=== OUT s{target}')
        for k in ('error', 'stateError', 'eval0', 'eval', 'log'):
            if o.get(k): print(k.upper() + ':', str(o[k])[:int(os.environ.get('ELIM', '3000'))])
        print('view:', st.get('view'), st.get('arg'), st.get('sub'), 'rem:', st.get('rem'))
        print('MSGS:'); [print('  ' + m[:1800]) for m in st.get('msgs', [])[-int(os.environ.get('NMSG', '4')):]]
        if st.get('overlay'): print('OVERLAY:', st['overlay'][:800])
        if st.get('marks'): print('MARKS:', st['marks'])
        if os.environ.get('MAIN'): print('MAIN:', st.get('main', '')[:int(os.environ.get('MAIN'))])
        if os.environ.get('TOUR') and st.get('tour'): print('TOUR:', st['tour'][:3000])
        sys.exit(0)
    if time.time() - t0 > float(os.environ.get('TMO', '170')):
        print('...still waiting (target s%d)' % target); sys.exit(1)
    time.sleep(1)
