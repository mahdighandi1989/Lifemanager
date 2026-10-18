import json,sys,os,re
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24A'
s=sys.argv[1]; D=f'{R}/{s}/ai'
ns=sorted(int(m.group(1)) for f in os.listdir(D) for m in [re.match(r'p(\d+)\.json',f)] if m)
print('| نوبت | پیام (کوتاه) | نوع | task | درست؟ |'); print('|---|---|---|---|---|')
bad=0
for n in ns:
    p=json.load(open(f'{D}/p{n}.json')); u=p['user']; i=u.find('# نوبتِ تازه'); t=u[i+13:].strip() if i>=0 else ''
    rw='[سامانه — وارسیِ صفحه' in t
    first=t.split('\n')[0]
    if i<0:
        print(f"| p{n} | (قابلیتِ هوشِ صفحه) | قابلیتِ صفحه (نه گفت‌وگو) | {p['task']} | ✓ |"); continue
    if first.startswith('[اصلاحِ پیامِ قبلی]'): k,exp='✏️','lla_assistant'
    elif first.startswith('[سامانه'): k,exp='پیگیریِ خودکارِ [سامانه]','lla_assistant'
    elif re.fullmatch(r'(آره|باشه|بله)?[،, ]*(ثبتش کن|اینو ثبت کن)[.!]?',first.strip()): k,exp='فقط-عمل','lla_assistant'
    else: k,exp='مربی‌گری','lla_coach'
    if rw: k='بازنویسی ('+k+')'; exp=None
    ok='✓' if (exp is None or p['task']==exp) else '✗'
    if ok=='✗': bad+=1
    print(f"| p{n} | {first[:60].replace('|','/')} | {k} | {p['task']} | {ok}{' (هم‌ردهٔ نوبتِ خودش)' if exp is None else ''} |")
print(f'\n✗ = {bad}')
