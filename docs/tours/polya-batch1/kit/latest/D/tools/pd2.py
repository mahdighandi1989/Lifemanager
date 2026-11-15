#!/usr/bin/env python3
# pd2.py sid [N] — only decision-relevant prompt changes vs round 26: arithmetic verdicts, re-check, page correction result,
# turn-question lines, prior-work/date blocks heads, and NEW system lines in the transcript tail.
import json,sys,re,os
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s=sys.argv[1]; only=int(sys.argv[2]) if len(sys.argv)>2 else None; W=int(os.environ.get('W','260'))
mp={}
for l in open(f'{B}/round27D/{s}.run',encoding='utf-8'):
    m=re.search(r'answered p(\d+) \[[^\]]*\] \((OLD|OVR) r(\d+)',l)
    if m: mp[int(m.group(1))]=(int(m.group(3)),m.group(2))
PAT=re.compile(r'^- زمینه \(نه پرسشِ دوم\): ([✓✗؟—]|—)|بازسنجی|نتیجهٔ صفحه \(عیناً|\*\*پرسشِ این نوبت|در این نوبت فقط \*\*یک\*\* پرسش|^# (تاریخ|کارِ پیشین|اصلاح|بازسنجی|چند مسئله|کدام|پیش‌بینی)|^- زمینه \(نه پرسشِ دوم\): (همین پیام|پیامِ پیشینش|این پیام)')
def norm(t):
    t=re.sub(r'(pb_l_|achat_|case_|lp_|prc_|it1_|sh)[a-z0-9_]+','ID',t); return t
def pick(d):
    u=d.get('sys','')+'\n'+d.get('user','')
    head,_,tail=u.rpartition('# نوبتِ تازه')
    L=[norm(l) for l in head.split('\n') if PAT.search(l)]
    conv=[norm(l) for l in u.split('\n') if l.startswith('سامانه:')]
    return L,conv
for n,(m,k) in sorted(mp.items()):
    if only and n!=only: continue
    a=json.load(open(f'{B}/round26D/{s}/ai/p{m}.json')); b=json.load(open(f'{B}/round27D/{s}/ai/p{n}.json'))
    La,Ca=pick(a); Lb,Cb=pick(b)
    rm=[l for l in La if l not in Lb]; ad=[l for l in Lb if l not in La]
    cn=[l for l in Cb if l not in Ca]
    her=b.get('user','').split('# نوبتِ تازه')[-1].strip().replace('\n',' ')
    if not rm and not ad and not cn: print(f'p{n}<-r{m} {k} same'); continue
    print(f'===== p{n} <- r{m} ({k}) {b.get("task")} | HER: {her[:160]}')
    for l in rm: print('  -',l[:W])
    for l in ad: print('  +',l[:W])
    for l in cn[-4:]: print('  S',l[:W])
