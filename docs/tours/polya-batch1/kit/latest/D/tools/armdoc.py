#!/usr/bin/env python3
# armdoc.py — findings.md + mail.json for the short territory arms (evidence gathered with armf.py)
import json,os
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26D/'
COMMON_RUN="بازپخشِ کنترل‌های round25D/{src} روی main 1f93c333، ساعتِ پایه ۲۶ مهر ۱۴۰۵. چهار نوبتِ آغازین (ایده ⇒ خواسته/داده/شرط ⇒ دو زیرمسئله ⇒ برگهٔ #۱۰۱ با gap.step) با همان پاسخ‌های مدلِ oD1u (نوشتهٔ همین دور) پاسخ داده شد. ساختِ قلمرو به راهِ واقعی: یادداشتِ «routine» زیرِ برگه در sheets/sh101.json{build} و بازکردنِ دوبارهٔ هارنس؛ هیچ درونِ صفحه دست‌کاری نشد."
A=json.load(open(R+'arms.json'))
for sid,a in A.items():
    crit='\n'.join('- '+x for x in a['crit'])
    f=f"""# {sid} — {a['h']} — دورِ ۲۶

## خلاصه برای مالک
{a['sum']}

## اجرا
{COMMON_RUN.format(src=a['src'],build=a.get('build',''))}
جوابِ روتین: «{a['reply']}»

## معیارها (با نوبت)
{crit}

## ایرادهای دورِ ۲۵ و پیش‌تر
{a.get('old','- (ایرادِ ویژه‌ای برای این بازو ثبت نبود)')}
- D25-24: CHANGED (S3) — p4 (حسابِ میانهٔ کار پس از ساختِ مسئلهٔ زنده) بلوکِ «کارِ پیشینِ تو» آورد؛ 🧭 «مانده: ۰ گام از ۱ گامِ کارِ پیشینت».
- D25-8: STILL (S3) — 🧭 «مقصد: یه جمله: می‌خوام بدونم …».

## ایرادهای تازهٔ دورِ ۲۶
{a.get('new','- هیچ')}

## مسیریابی
p1–p4 lla_coach ✓؛ p5 مشاورِ ارجاع. نادرست ۰.

## نقشهٔ نیاز
- حلقهٔ قلمرو (بخش): {a['need1']}
- آدم: {a['need2']}

## ارتقای لازم
- {a.get('up','تاریخِ چشم‌داشتِ جوابِ برگه (بانکِ ۱۷).')}

## کارنامه پیش/پس
فهم ۲/۲، اجرا ۱/۱؛ انتظارِ ابزار ضعف شمرده نشد. معقول.

## ایده‌ها
- {a.get('idea','—')}

RESULT: {a['res']}
"""
    os.makedirs(R+sid,exist_ok=True); open(R+sid+'/findings.md','w').write(f)
    json.dump(a['mail'],open(R+sid+'/mail.json','w'),ensure_ascii=False)
    print(sid,'ok')
