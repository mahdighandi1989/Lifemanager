#!/bin/bash
# tq.sh SID N : show turn-question lines + key blocks of pN
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24A
python3 - $1 $2 <<'PY'
import json,re,sys
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24A'
s,n=sys.argv[1],sys.argv[2]; p=json.load(open(f'{R}/{s}/ai/p{n}.json')); u=p['user']
print('p'+n,p['task'],[h[:45] for h in re.findall(r'(?m)^# .*',u)][3:])
for m in re.finditer(r'(?m)^.*(\*\*یک\*\* پرسش|پرسشِ این نوبت همین|\*\*پرسشِ این نوبت|^- پرسشِ این نوبت:|پرسیده نمی‌شود|پرسشِ تازه‌ای نساز).*$',u): print('TQ:',m.group(0)[:500])
for h in ['# مخاطب','# اصلاحی که صفحه','# نتیجهٔ صفحه از','# پرسش‌های تشخیصی','# پیش‌نیاز (','# اصلاحِ پیامِ پیشین']:
    for mm in re.finditer('(?m)^'+re.escape(h),u):
        i=mm.start(); blk=u[i:].split('\n# ')[0]
        if h=='# پیش‌نیاز (' and len(blk.strip().split('\n'))<=2: print('PRE: rule only'); continue
        print(blk[:900])
i=u.find('# نوبتِ تازه'); print(u[i:i+600])
PY
