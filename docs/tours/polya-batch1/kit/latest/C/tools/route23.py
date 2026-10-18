# route23.py sid... -> routing table per scenario (turn / kind / task / correct?)
import json,glob,re,sys
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23C'
out=[]; tot=[0,0]
for sid in sys.argv[1:]:
    L=[f'### {sid}','| turn | kind | task | ok |','|---|---|---|---|']; ok=n=0
    for f in sorted(glob.glob(f'{T}/{sid}/ai/p*.json'),key=lambda x:int(x.split('/p')[-1][:-5])):
        k=int(f.split('/p')[-1][:-5]); j=json.load(open(f)); u=j['user']
        m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S); t=(m.group(1).strip() if m else '')
        if j.get('sys','').startswith('تو مشاورِ ارشد'): kind='نظرِ دوم (مشاورِ برگه)'; want=None
        elif t.startswith('[اصلاحِ پیامِ قبلی]'): kind='✏️'; want='lla_assistant'
        elif t.startswith('[سامانه'): kind='سامانه'; want='lla_assistant'
        elif re.match(r'^(آره|بله)،? (بازش|ثبتش) کن\.?$',t): kind='فرمانِ فقط‌عمل'; want='lla_assistant'
        elif '[سامانه — وارسیِ صفحه' in t: kind='بازنویسی'; want=None
        else: kind='مربی‌گری'; want='lla_coach'
        task=j.get('task'); good = (want is None) or task==want
        if want is None: good=True
        n+=1; ok+=good
        L.append(f'| p{k} «{t[:40].replace("|","/")}…» | {kind} | {task} | {"✓" if good else "✗"} |')
    L.append(f'\n{sid}: {ok}/{n} درست'); tot[0]+=ok; tot[1]+=n
    out.append('\n'.join(L))
print('\n\n'.join(out)); print(f'\nTOTAL {tot[0]}/{tot[1]}')
