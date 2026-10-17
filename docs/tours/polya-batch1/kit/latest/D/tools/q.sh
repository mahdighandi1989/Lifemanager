#!/bin/bash
python3 $(dirname $0)/hk2.py $1 $2 | grep -v "^- \*\*گزارشِ وضع" | grep -E "مرحلهٔ محتمل|فقط \*\*یک\*\* پرسش|پاسخ گرفته|^# |\(پولیا، [ABCD][0-9]+\)|C1[0-9][0-9]|D0[0-9][0-9]" | grep -v "^# امروز\|^# سشن\|^# صفحهٔ\|^# گفت" | cut -c1-${W:-260}
python3 $(dirname $0)/hk2.py $1 $2 | python3 -c "import sys,re;t=sys.stdin.read();m=re.search(r'پیشنهادِ این نوبت: (.*?)\. اگر حرف',t);print('SUG:',m.group(1) if m else None)"
python3 $(dirname $0)/hk2.py $1 $2 | sed -n '/# نوبتِ تازه/,$p'
