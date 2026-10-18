import json,re,glob,sys
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24C'
ACT=re.compile(r'^\s*(آره|باشه)?[،, ]*(ثبتش|بازش) کن\.?\s*$')
tot={'ok':0,'bad':0}
for sid in sys.argv[1:]:
    rows=[];prev=None
    for f in sorted(glob.glob(f'{T}/{sid}/ai/p*.json'),key=lambda x:int(x.split('/p')[-1][:-5])):
        n=int(f.split('/p')[-1][:-5]); j=json.load(open(f)); u=j['user']
        m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S); turn=(m.group(1).strip() if m else '')
        if turn.startswith('[سامانه'): k='پیگیریِ خودکارِ سامانه'; exp='lla_assistant'
        elif turn.startswith('[اصلاحِ پیامِ قبلی]'): k='✏️ اصلاح'; exp='lla_assistant'
        elif prev and '[سامانه — وارسیِ صفحه' in turn: k='درخواستِ بازنویسی (همان نوبت)'; exp=rows[-1][3]
        elif ACT.match(turn): k='فقط-عمل'; exp='lla_assistant'
        else: k='مربی‌گری'; exp='lla_coach'
        t=j.get('task'); ok=(t==exp); tot['ok' if ok else 'bad']+=1
        rows.append((n,k,t,exp,ok,turn.split('\n')[0][:70])); prev=turn
    print(f'### {sid}\n| نوبت | نوع | task | باید | درست؟ | آغازِ پیام |\n|---|---|---|---|---|---|')
    for r in rows: print(f'| p{r[0]} | {r[1]} | {r[2]} | {r[3]} | {"✓" if r[4] else "✗"} | {r[5].replace("|","¦")} |')
    print()
print(tot,file=sys.stderr)
