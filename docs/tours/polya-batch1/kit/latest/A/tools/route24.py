import json,os,re,sys
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24A'
tot=bad=0; allbad=[]
for s in sys.argv[1:]:
    D=f'{R}/{s}/ai'; n=len([f for f in os.listdir(D) if f.startswith('p')]); rows=[]; b=0
    for i in range(1,n+1):
        p=json.load(open(f'{D}/p{i}.json')); u=p['user']; t=p.get('task'); j=u.find('# نوبتِ تازه'); m=u[j+13:].strip() if j>=0 else '(consultant)'
        rw='[سامانه — وارسیِ صفحه' in m; mm=m.split('\n\n[سامانه — وارسی')[0]
        if t=='learning_architecture': kind,exp='مشاورِ ارجاع (برگه)','learning_architecture'
        elif mm.startswith('[سامانه'): kind,exp='پیگیریِ خودکار','lla_assistant'
        elif mm.startswith('[اصلاحِ پیامِ قبلی]'): kind,exp='✏️','lla_assistant'
        elif re.fullmatch(r'(آره|بله|باشه)?[،, ]*ثبتش کن\.?',mm.strip()): kind,exp='فقط-عمل','lla_assistant|lla_coach'
        else: kind,exp='مربی‌گری','lla_coach'
        if rw: kind='بازنویسی ('+kind+')'
        ok=t in exp.split('|'); tot+=1
        if not ok: b+=1; bad+=1; allbad.append(f'{s} p{i} {t} {mm[:60]}')
        rows.append(f'| p{i} | {mm[:60].replace("|","/").replace(chr(10)," ")} | {kind} | {t} | {"✓" if ok else "✗"} |')
    open(f'{R}/{s}/route_table.md','w').write('| نوبت | پیام (کوتاه) | نوع | task | درست؟ |\n|---|---|---|---|---|\n'+'\n'.join(rows)+f'\n\n✗ = {b}\n')
print('total',tot,'bad',bad); print('\n'.join(allbad))
