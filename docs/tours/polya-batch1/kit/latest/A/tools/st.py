#!/usr/bin/env python3
# st.py DIR send JSONFILE|-   : write next ctl and wait
# st.py DIR wait             : wait for pending AI or latest out
# st.py DIR ans N FILE        : validate & write rN.txt then wait
# st.py DIR show N [full]     : print AI request N
import sys, os, json, time, re, glob, difflib, hashlib
D = sys.argv[1]; cmd = sys.argv[2]
AI = os.path.join(D, 'ai'); CTL = os.path.join(D, 'ctl'); OUT = os.path.join(D, 'out')
STATE = os.path.join(D, 'tools_state.json')
def ld():
    try: return json.load(open(STATE))
    except: return {'sys': {}, 'seenmap': False}
def sv(s): json.dump(s, open(STATE, 'w'))
def nums(d, pat):
    return sorted(int(m.group(1)) for f in os.listdir(d) for m in [re.match(pat, f)] if m)
def pending():
    for n in nums(AI, r'^p(\d+)\.json$'):
        if not os.path.exists(os.path.join(AI, 'r%d.txt' % n)): return n
    return None
def show(n, full=False):
    p = json.load(open(os.path.join(AI, 'p%d.json' % n)))
    st = ld(); sysT = p['sys']; task = p.get('task'); key = task + '|' + sysT[:60]
    print('=== AI REQUEST p%d task=%s fileIds=%s sys=%d user=%d' % (n, task, p.get('fileIds'), len(sysT), len(p['user'])))
    prev = st['sys'].get(key)
    if prev is None or full:
        print('--- SYS (full)\n' + sysT)
    elif prev != sysT:
        print('--- SYS diff vs previous same-task:')
        for l in difflib.unified_diff(prev.splitlines(), sysT.splitlines(), lineterm='', n=0): print(l[:1500])
    else: print('--- SYS unchanged')
    st['sys'][key] = sysT
    u = p['user']
    if task == 'lla_assistant' and not full:
        i = u.find('\n# امروز')
        if i > 0:
            head = u[:i]
            h = hashlib.md5(head.encode()).hexdigest()
            if st.get('maphash') != h:
                if not st.get('seenmap'):
                    print('--- USER map (first time, full)\n' + head); st['seenmap'] = True
                else:
                    # print only user-data section + diff summary
                    j = head.find('## دادهٔ خودِ کاربر'); k = head.find('## قلمروِ سامانه‌ها')
                    print('--- USER map changed; user-data section:\n' + (head[j:k] if j >= 0 else '(none)'))
                    old = st.get('maphead', '')
                    for l in difflib.unified_diff(old.splitlines(), head.splitlines(), lineterm='', n=0):
                        if len(l) < 3000: print('MAPDIFF ' + l[:600])
                st['maphash'] = h; st['maphead'] = head
            else: print('--- USER map unchanged')
            u = u[i:]
    print('--- USER\n' + u)
    sv(st)
def outsum(n):
    o = json.load(open(os.path.join(OUT, 's%d.json' % n)))
    print('=== OUT s%d' % n)
    for k in ('error', 'eval0', 'eval', 'stateError', 'log'):
        if o.get(k): print(k.upper() + ':', str(o[k])[:3000])
    s = o.get('state') or {}
    print('VIEW:', s.get('view'), s.get('arg'), s.get('sub'), 'rem', s.get('rem'))
    print('MSGS:'); [print('  ' + m[:1500]) for m in (s.get('msgs') or [])[-4:]]
    if s.get('overlay'): print('OVERLAY:', s['overlay'][:800])
    if s.get('marks'): print('MARKS:', s['marks'])
    if s.get('tour'): print('TOUR:', s['tour'][:1500])
    print('MAIN:', (s.get('main') or '')[:900])
def wait(target_out, timeout=280):
    t0 = time.time()
    while time.time() - t0 < timeout:
        n = pending()
        if n: show(n); return
        if target_out and os.path.exists(os.path.join(OUT, 's%d.json' % target_out)):
            time.sleep(0.3); outsum(target_out); return
        time.sleep(1.5)
    print('TIMEOUT waiting (target s%s)' % target_out)
def lastctl():
    c = nums(CTL, r'^c(\d+)\.json$'); return c[-1] if c else 0
if cmd == 'send':
    src = sys.argv[3]; data = sys.stdin.read() if src == '-' else open(src).read()
    json.loads(data)
    n = lastctl() + 1; open(os.path.join(CTL, 'c%d.json' % n), 'w').write(data); print('wrote c%d' % n)
    wait(n)
elif cmd == 'wait':
    wait(lastctl())
elif cmd == 'ans':
    n = int(sys.argv[3]); data = open(sys.argv[4]).read() if sys.argv[4] != '-' else sys.stdin.read()
    data = data.strip()
    try: json.loads(data)
    except Exception as e:
        if '--raw' not in sys.argv: print('INVALID JSON', e); sys.exit(1)
    open(os.path.join(AI, 'r%d.txt' % n), 'w').write(data); print('answered p%d' % n)
    time.sleep(2); wait(lastctl())
elif cmd == 'show':
    show(int(sys.argv[3]), len(sys.argv) > 4)
elif cmd == 'out':
    outsum(int(sys.argv[3]))
