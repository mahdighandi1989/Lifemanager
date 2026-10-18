#!/usr/bin/env python3
# rtab.py sid [override json: {"pN":"kind"}] -> markdown routing table
import sys,json,glob,re,os
D='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22D/'+sys.argv[1]
ov=json.loads(sys.argv[2]) if len(sys.argv)>2 else {}
fs=sorted(glob.glob(D+'/ai/p*.json'),key=lambda f:int(re.findall(r'\d+',os.path.basename(f))[0]))
print('| نوبت | پیام (کوتاه) | نوع | task | درست؟ |'); print('|---|---|---|---|---|')
bad=0;tot=0
for f in fs:
    p=json.load(open(f)); n='p'+re.findall(r'\d+',os.path.basename(f))[0]
    u=p['user']; last=u.split('# نوبتِ تازه')[-1].strip().replace('\n',' ').replace('|','/')
    if '[سامانه — وارسیِ صفحه' in last: kind='rewrite'
    elif last.startswith('[سامانه'): kind='follow'
    elif last.startswith('[اصلاحِ پیامِ قبلی]'): kind='edit'
    else: kind='coach'
    kind=ov.get(n,kind)
    exp={'coach':'lla_coach','follow':'lla_assistant','edit':'lla_assistant','action':'lla_assistant','rewrite':None}[kind]
    t=p.get('task'); ok='—' if exp is None else ('✓' if t==exp else '✗')
    if exp: tot+=1
    if ok=='✗': bad+=1
    K={'coach':'مربی‌گری','follow':'پیگیریِ خودکار','edit':'✏️','action':'فقط-عمل','rewrite':'بازنویسیِ صفحه (همان رده)'}[kind]
    print(f'| {n} | {last[:70]} | {K} | {t} | {ok} |')
print(f'\nنادرست: {bad} از {tot}')
