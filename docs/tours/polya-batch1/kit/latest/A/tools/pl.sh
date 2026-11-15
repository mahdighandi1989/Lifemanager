#!/bin/bash
# pl.sh SID DATE "msg" ok(true|false) : move clock, say msg, answer with practice_log, print case state + Today line
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27A
S=$1; echo "{\"clock\":\"$2\"}" | timeout 200 bash $R/tools/s.sh $S > /dev/null 2>&1
P=$(bash $R/tools/ev1.sh $S 'APP.PR.all()[0].id' | sed 's/EVAL: //; s/"//g')
bash $R/tools/say.sh $S "$3" > /dev/null
N=$(ls $R/$S/ai | grep -c '^p')
python3 - "$S" "$N" "$P" "$3" "$4" <<'PY'
import json,sys,subprocess
S,N,P,msg,ok=sys.argv[1:6]
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27A'
rep="جلسهٔ امروزت را ثبت کردم." if ok=='true' else "این بار یادت نیامد — همین هم دادهٔ تمرین است؛ ثبتش کردم."
a={"reply":rep+" کدام بخشش برایت از همه سخت‌تر بود؟","status":"related","next":False,"outside":"","know":[],"actions":[{"do":"practice_log","prc":P,"what":"بازیابیِ بی‌نگاهِ برهانِ کاشی","ok":ok=='true',"quote":msg},{"do":"coach_state","ph":"b","said":[],"ans":[],"stuck":ok!='true',"fail":False,"role":"self","nat":"objective"}]}
open(f'{R}/{S}/ans_{N}.json','w').write(json.dumps(a,ensure_ascii=False))
subprocess.run(['bash',R+'/tools/an.sh',S,N],stdin=open(f'{R}/{S}/ans_{N}.json'),capture_output=True)
PY
bash $R/tools/ev1.sh $S 'JSON.stringify({t:APP.today(),sys:APP.ASSIST.cur().msgs.filter(m=>m.role=="sys").slice(-1).map(m=>m.text.slice(0,350)),c:APP.PR.all().map(c=>({st:c.state,next:c.next,n:(c.sessions||[]).length})),due:(APP.dueList()||[]).map(x=>x.txt+" | "+(x.sub||"").slice(0,160)).filter(x=>/🧪|تمرین/.test(x))})'
