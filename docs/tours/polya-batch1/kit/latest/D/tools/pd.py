#!/usr/bin/env python3
# pd.py sid [N] — meaningful prompt changes vs round 26 (noise dropped); W=width
import json,sys,re,os
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s=sys.argv[1]; only=int(sys.argv[2]) if len(sys.argv)>2 else None; W=int(os.environ.get('W','330'))
mp={}
for l in open(f'{B}/round27D/{s}.run',encoding='utf-8'):
    m=re.search(r'answered p(\d+) \[[^\]]*\] \((OLD|OVR) r(\d+)',l)
    if m: mp[int(m.group(1))]=(int(m.group(3)),m.group(2))
NOISE=('- ماهیت','- توجیه','- s_','## پیشنهادهای','دکمه‌ها:','- منابع','- شکاکیت','- پیشرفته','- عقلانیت','- اخلاق','- معرفت','- اپیستمولوژی','- فضیلت','- گواهی','- s ')
def norm(t):
    t=re.sub(r'(pb_l_|achat_|case_|lp_|prc_|it1_|sh)[a-z0-9_]+','ID',t)
    t=re.sub(r'\d{4}-\d\d-\d\dT[\d:.]+Z?','TS',t)
    return [l for l in t.split('\n') if l.strip() and not l.startswith(NOISE)]
for n,(m,k) in sorted(mp.items()):
    if only and n!=only: continue
    a=json.load(open(f'{B}/round26D/{s}/ai/p{m}.json')); b=json.load(open(f'{B}/round27D/{s}/ai/p{n}.json'))
    A=norm(a.get('sys','')+'\n'+a.get('user','')); Bb=norm(b.get('sys','')+'\n'+b.get('user',''))
    sa,sb=set(A),set(Bb)
    rm=[l for l in A if l not in sb]; ad=[l for l in Bb if l not in sa]
    tq=[l for l in Bb if 'پرسشِ این نوبت' in l]
    if not rm and not ad: print(f'p{n}<-r{m} {k} SAME'); continue
    print(f'===== p{n} <- old r{m} ({k}) task {b.get("task")}  -{len(rm)} +{len(ad)}')
    for l in rm[:25]: print('  -',l[:W])
    for l in ad[:25]: print('  +',l[:W])
