#!/bin/bash
# q.sh sid [answer.json] : answer + resume + minimal view (stop line, new sys lines, TQ, turn)
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B; cd $B; s=$1
PL=200 PW=${PW:-520} NM=${NM:-3} MW=${MW:-420} EL=${EL:-120} bash tools/nx.sh "$@" | grep "STOP\|END\|EXITED\|sys:\|LAST\|TQ: - \*\*\|TQ: پیشنهاد\|فقط \*\*یک\*\*\|^# \|حسابِ صفحه\|می‌خواند\|✗" | grep -v "^# وضعِ کنونی\|^# مربیِ حل\|^# مسئلهٔ زندهٔ\|^# برنامه‌های باز\|^# اصلاحِ پیامِ پیشین (شاید)\|^# درخواستِ عقب\|^# مسئلهٔ واقعیِ حل‌نشده" | cut -c1-${PW:-520}
python3 -c "
import json,sys
sys.path.insert(0,'tools'); from drvlib import pending
n=pending('$B/$s')
if n:
    u=json.load(open('$B/$s/ai/p%d.json'%n))['user']; j=u.rfind('# نوبتِ تازه'); print('TURN:',u[j+13:][:int('${TL:-700}')].strip())"
