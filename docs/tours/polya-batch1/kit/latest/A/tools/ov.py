import json,sys,os,re
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A'
s=sys.argv[1]; D=f'{R}/{s}/ai'
n=len([f for f in os.listdir(D) if re.match(r'p\d+\.json',f)])
for i in range(1,n+1):
    p=json.load(open(f'{D}/p{i}.json')); u=p['user']; j=u.find('# نوبتِ تازه'); t=u[j+13:].strip() if j>=0 else '(consultant)'
    tq=''
    for l in u.split('\n'):
        m=re.search(r'(فقط \*\*یک\*\* پرسش[^:]*: «|پرسشِ این نوبت همین است:\*\*.*?«|پیشنهادِ این نوبت: «)(.{0,140})',l)
        if m and not tq: tq=m.group(2)
    ph=re.search(r'# مسئلهٔ زندهٔ این سشن[^·]*·[^·]*· مرحله: ([^·]+)',u); ph=ph.group(1).strip() if ph else ''
    rw='RW ' if '[سامانه — وارسی' in t else ''
    try: r=json.load(open(f'{D}/r{i}.txt')).get('reply','')[:120]
    except Exception: r='?'
    print(f'p{i} [{p.get("task")}] {rw}{ph} | U: {t[:110]!r}\n    TQ: {tq[:140]}\n    R: {r}')
