#!/bin/bash
# turn.sh SID N M STOPLIST : answer pN with JSON from stdin (map->M), then run auto3 to the next stop; show next prompt summary
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21A
cat > $R/$1/ans_$2.json; python3 -c "import json;json.load(open('$R/$1/ans_$2.json'))" || exit 1
python3 -c "
import json,os;f='$R/$1/r10map.json';m=json.load(open(f)) if os.path.exists(f) else {};m['$2']='$3';json.dump(m,open(f,'w'))"
python3 $R/tools/d.py $1 ans $2 @$R/$1/ans_$2.json > /dev/null 2>&1
L=$(wc -l < $R/$1/auto.log); STOPAT=$4 python3 -u $R/tools/auto3.py $1 >> $R/$1/auto.log 2>&1
tail -n +$((L+1)) $R/$1/auto.log | grep -v "^   BLK\|^   NL" | cut -c1-250 | grep -v "^  D" | tail -4
N=$(ls $R/$1/ai | grep -c '^p'); [ -f $R/$1/ai/r$N.txt ] && { echo "no pending (last p$N)"; exit 0; }
python3 - "$1" "$N" <<'PY'
import json,re,sys
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21A'
s,n=sys.argv[1],sys.argv[2]; p=json.load(open(f'{R}/{s}/ai/p{n}.json')); u=p['user']
print('=== p'+n, p['task']); print([h[:45] for h in re.findall(r'(?m)^# .*',u)])
for h in ['# اصلاحی که صفحه انجام','# اصلاحِ پیامِ قبلی','# اصلاحِ پیامِ پیشین','# نتیجهٔ صفحه','# برنامهٔ خودش که','# گامِ بازِ','# پرونده‌های تمرین']:
    i=u.find(h)
    if i>=0: print(u[i:i+700]); print('-')
i=u.find('# مسئلهٔ زندهٔ این سشن')
if i>=0:
    m=re.search(r'در این نوبت فقط \*\*یک\*\* پرسش[^\n]*',u[i:]); print('TQ:',m.group(0)[:500] if m else 'none')
i=u.find('# نوبتِ تازه'); print(u[i:i+500])
PY
