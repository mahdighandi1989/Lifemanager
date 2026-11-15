#!/usr/bin/env python3
# route27.py sid — routing table: pN · kind · task · ok?
import json,glob,re,sys
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27D'
s=sys.argv[1]; rows=[]; bad=0
for f in sorted(glob.glob(f'{B}/{s}/ai/p*.json'),key=lambda x:int(re.findall(r'\d+',x.split('/')[-1])[0])):
    n=int(re.findall(r'\d+',f.split('/')[-1])[0]); d=json.load(open(f)); t=d.get('task'); u=d.get('user',''); tail=u.split('# نوبتِ تازه')[-1].strip()
    sysmsg=d.get('sys','')[:200]
    if t=='learning_architecture': kind='internal (sheet/referral advisor)'; ok=True
    elif tail.startswith('[سامانه') or tail.startswith('[اصلاح') or '✏️' in tail[:40]: kind='system/✏️ follow-up'; ok=(t=='lla_assistant')
    else: kind='coaching/her message'; ok=(t=='lla_coach')
    bad+= (not ok); rows.append(f'p{n} · {kind} · {t} · {"✓" if ok else "✗"}')
print('\n'.join(rows)); print(f'wrong={bad}/{len(rows)}')
