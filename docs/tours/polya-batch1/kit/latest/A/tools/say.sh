#!/bin/bash
# say.sh SID TEXT : send a chat message, print compact prompt view (TQ etc.)
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23A
python3 -c "import json,sys;print(json.dumps({'say':sys.argv[1]},ensure_ascii=False))" "$2" | timeout 200 bash $R/tools/s.sh $1 > /dev/null 2>&1
N=$(ls $R/$1/ai | grep -c '^p'); [ -f $R/$1/ai/r$N.txt ] && { echo "no new prompt"; exit 0; }
python3 - $1 $N <<'PY'
import json,re,sys
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23A'
s,n=sys.argv[1],sys.argv[2]; p=json.load(open(f'{R}/{s}/ai/p{n}.json')); u=p['user']
print('p'+n,p['task'],[h[:40] for h in re.findall(r'(?m)^# .*',u)][4:])
for m in re.finditer(r'(?m)^- (در این نوبت فقط \*\*یک\*\* پرسش|\*\*پرسشِ این نوبت|زمینه \(نه پرسشِ دوم؛ پرسشِ این نوبت|پرسشِ این نوبت:).*$',u): print('TQ:',m.group(0)[:600])
i=u.find('# مسئلهٔ زندهٔ این سشن'); print(u[i:i+200] if i>=0 else 'no live block')
for h in ['# اصلاحی که صفحه انجام داد','# نتیجهٔ صفحه از','# پرسش‌های تشخیصی']:
    i=u.find(h)
    if i>=0: print(u[i:i+700])
PY
