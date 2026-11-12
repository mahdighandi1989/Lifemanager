#!/usr/bin/env python3
# mkbuild.py vN areaKey[,areaKey] — scratch copy of the page with extra territory areas in the registry (maps + ledger), built with the page's own build.py
import sys,json,os,subprocess,shutil
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26D'
LA=R+'/build/la/apps/learning-architecture'; ORIG='/home/user/Lifemanager/apps/learning-architecture'
A={
 'change':{'id':'pr_change_detection','fa':'آشکارسازیِ تغییرِ ماندگار (پله) در دادهٔ نویزیِ حسگر','en':'Change-point (step) detection in noisy sensor data','desc_fa':'پنجرهٔ پایداری برای جدا کردنِ پلهٔ ماندگار از جهشِ گذرا، خط‌مبنای متحرک برای لغزش، و آستانه با سنجشِ هشدارِ نادرست','key_questions_fa':['این پله ماندگار است یا جهشِ گذرا؟']},
 'smooth':{'id':'pr_noise_smoothing','fa':'هموارسازیِ نویزِ اندازه‌گیری','en':'Measurement noise smoothing','desc_fa':'میانگینِ متحرک روی یک پنجره تا هر عدد آرام شود','key_questions_fa':['پنجره چند نمونه باشد تا نویز کم شود؟']},
 'frame':{'id':'pr_idea_place','fa':'جایگاهِ ایده و برگه‌های کمبودِ سامانه','en':'Idea placement and system-gap sheets','desc_fa':'نمای «💡 جایگاهِ ایده» و برگهٔ فوریِ دستیار برای کمبودِ سامانه در نظارت و سرکشی؛ نقشهٔ مسیرِ مسئله و گامِ منتظر','key_questions_fa':['این ایده کجای نقشهٔ سامانه می‌نشیند؟']},
 'step2':{'id':'pr_step_detection','fa':'تشخیصِ پلهٔ ماندگار در دادهٔ نویزیِ حسگر','en':'Persistent step detection in noisy sensor data','desc_fa':'پنجرهٔ پایداری برای جدا کردنِ پلهٔ ماندگار از جهشِ گذرا، خط‌مبنای متحرک برای لغزش، و آستانه با سنجشِ هشدارِ نادرست','key_questions_fa':['این پله ماندگار است یا جهشِ گذرا؟']},
}
v=sys.argv[1]; keys=sys.argv[2].split(',')
for f in ('territory/maps/s_problem.json','territory/ledger.json'): shutil.copy(ORIG+'/'+f,LA+'/'+f)
m=json.load(open(LA+'/territory/maps/s_problem.json')); l=json.load(open(LA+'/territory/ledger.json'))
tpl=m['groups'][0]['areas'][0]
for k in keys:
    a=dict(A[k]); a.update({'src':tpl['src'][:1],'tools':['move:mv_measure'],'gap_fa':'','claims':tpl['claims'][:1]})
    m['groups'][0]['areas'].append(a)
    l['areas'][a['id']]={'history':[{'at':'2026-10-18','by':'ساختِ آزمایشیِ تور (نسخهٔ خراش)','stage':3,'what':'ساخته شد'}],'stage':3,'system':'s_problem'}
json.dump(m,open(LA+'/territory/maps/s_problem.json','w'),ensure_ascii=False,indent=1); json.dump(l,open(LA+'/territory/ledger.json','w'),ensure_ascii=False,indent=1)
r=subprocess.run([sys.executable,LA+'/build.py'],capture_output=True,text=True); print((r.stdout+r.stderr)[-400:])
shutil.copy(LA+'/dist/learning-architecture.html',f'{R}/build/lla_{v}.html'); print('built',v,os.path.getsize(f'{R}/build/lla_{v}.html'))
