import json,os,re,sys
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24B'
for s in sys.argv[1:]:
    D=f'{B}/{s}/ai'; rows=[]; prev=None
    ns=sorted(int(f[1:-5]) for f in os.listdir(D) if re.match(r'p\d+\.json$',f))
    for n in ns:
        d=json.load(open(f'{D}/p{n}.json')); u=d['user']; i=u.rfind('# نوبتِ تازه'); t=u[i+13:].strip()
        rw='[سامانه — وارسیِ صفحه' in t
        t0=t.split('[سامانه — وارسیِ صفحه')[0].strip()
        if rw: kind='rewrite (post-check)'; exp=prev
        elif t0.startswith('[سامانه'): kind='automatic follow-up'; exp='lla_assistant'
        elif t0.startswith('[اصلاحِ پیامِ قبلی]'): kind='✏️ edit turn'; exp='lla_assistant'
        elif len(t0)<=40 and re.search(r'ثبت(ش)? ?کن|باز(ش)? ?کن|بنویس',t0) and '؟' not in t0: kind='action-only'; exp='lla_assistant'
        else: kind='coaching (problem talk)'; exp='lla_coach'
        task=d.get('task'); ok='✓' if task==exp else '✗'
        rows.append(f'| p{n} | {kind} | «{t0[:60].replace("|","/")}…» | {task} | {exp} | {ok} |'); prev=task
    print(f'### {s} routing'); print('| turn | kind | her message | task sent | expected | correct? |'); print('|---|---|---|---|---|---|'); print('\n'.join(rows)); print()
