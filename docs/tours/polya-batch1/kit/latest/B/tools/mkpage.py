#!/usr/bin/env python3
"""mkpage.py out.html id1 id2 … : scratch copy of the built page with NEW areas added to the problem-solving territory map
(the same registry file a real build would extend: territory/maps/s_problem.json, embedded in the bundle)."""
import json,sys
A={
'pr_market_scan':dict(fa='بررسیِ بازار و رقیبان',en='Market and competitor scan',desc_fa='شناختنِ رقیبان، قیمت‌ها و سهمِ بازار برای جایگاه‌یابیِ یک ایدهٔ محصول: چه کسی چه می‌فروشد، به چه قیمتی و به کدام مشتری.',kq=['رقیبانِ اصلی چه کسانی‌اند و چه قیمتی می‌فروشند؟','جایگاهِ ایدهٔ من میانِ آن‌ها کجاست؟']),
'pr_prior_art':dict(fa='جستجوی پیشینهٔ اختراع',en='Prior-art search',desc_fa='یافتنِ این‌که پیش‌تر کسی همین را ساخته یا ثبتِ اختراع کرده است: جستجوی گام‌به‌گام در پایگاه‌های ثبتِ اختراع، محصول‌های موجود و مقاله‌ها با واژه‌های کارکردِ دستگاه، و ثبتِ یافته‌ها با تاریخ.',kq=['قبلاً کسی همین را ساخته یا ثبتِ اختراع کرده است؟','با کدام واژه‌ها و در کدام پایگاه‌ها باید گشت؟']),
'pr_patent_claims':dict(fa='نوشتنِ ادعاهای ثبتِ اختراع',en='Drafting patent claims',desc_fa='صورت‌بندیِ ادعاهای یک اختراع برای ثبت: دامنهٔ هر ادعا، تازگی و گامِ ابتکاری.',kq=['ادعای اصلی دقیقاً چه چیزی را می‌پوشاند؟']),
'pr_tech_history':dict(fa='تاریخِ فناوری و پیشینهٔ ابزارها',en='History of technology',desc_fa='سیرِ تاریخیِ یک فناوری: ابزارها چگونه پدید آمدند، دگرگون شدند و جای یکدیگر را گرفتند.',kq=['این ابزار از کجا آمد و چه چیزی جایش را گرفت؟']),
'pr_patent_db':dict(fa='جستجو در پایگاه‌های ثبتِ اختراع',en='Patent database search',desc_fa='گشتن در پایگاه‌های ثبتِ اختراع تا معلوم شود کسی همین را ثبتِ اختراع کرده است یا نه.',kq=['کسی همین را ثبتِ اختراع کرده است؟']),
'pr_product_db':dict(fa='جستجوی محصول‌های ساخته‌شدهٔ مشابه',en='Existing-product search',desc_fa='گشتن میانِ محصول‌های موجود تا معلوم شود کسی همین را ساخته است یا نه.',kq=['کسی همین را ساخته است؟']),
}
src='/home/user/Lifemanager/apps/learning-architecture/dist/learning-architecture.html'
s=open(src,encoding='utf-8').read(); p=s.find('"id":"pr_representation"'); assert p>0
q=s.rfind('{"claims":[',0,p); assert q>0
ins=''
for i in sys.argv[2:]:
    a=A[i]; o={"claims":[{"fa":a['desc_fa'],"kind":"empirical","basis_fa":"افزودهٔ آزمایشیِ تور (رونوشتِ خراشی)","src":["polya1945"]}],"desc_fa":a['desc_fa'],"en":a['en'],"fa":a['fa'],"gap_fa":"","id":i,"key_questions_fa":a['kq'],"src":["polya1945"],"tools":["view:e_prob"]}
    ins+=json.dumps(o,ensure_ascii=False,separators=(',',':'),sort_keys=True)+','
open(sys.argv[1],'w',encoding='utf-8').write(s[:q]+ins+s[q:]); print('wrote',sys.argv[1],len(sys.argv[2:]),'areas')
