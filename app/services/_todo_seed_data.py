"""Single source of truth for the user's TodoItem seed payload.

The user exported their 33-list Microsoft To Do profile as PDFs and
asked us to materialise the items verbatim. We keep the content here
(rather than re-encoding it in each migration) so both:

  * migrations/versions/0007_seed_todo_items_from_pdfs.py (alembic path)
  * app/services/list_service.seed_todo_items_if_empty (startup path)

share the same canonical data. Adding new items only requires editing
this module.

Schema for each list entry (key is the TodoList.name):

    LISTS_DATA: dict[str, list[ItemDict]]

    ItemDict:
        content:      str  (required)
        is_completed: bool = False
        is_starred:   bool = False
        due_date:     datetime.date | None = None
        description:  str | None = None
        subitems:     list[ItemDict] = []
        shared_key:   str | None = None
            # When set, the same item is reused across lists that share
            # this key (single TodoItem row, multiple list memberships).
"""
from __future__ import annotations

from datetime import date

# Cross-list membership keys — chosen for clarity, not stability.
S_AKADEMI_KHAN = "shared:akademi-khan-bathroom"
S_VELAYAT = "shared:morur-tarh-velayat"
S_HEFZ_2P = "shared:roozi-yek-do-safhe-hefz-2"
S_RONUEVISI = "shared:dar-tool-rounevisi-az-ketab"
S_FAN_BAYAN = "shared:fan-bayan"
S_TAGHVIAT_SEDA = "shared:taghviat-seda"
S_BAZI_COMP = "shared:bazi-kamputer"


LISTS_DATA: dict[str, list[dict]] = {
    "Important": [
        {
            "content": "یافتن افکار و رفتاری که انجام و تمرکز بر آن در زمان های خلوت یا عادی و حتی شلوغ باعث تقویت ذهنم میشود",
            "is_starred": True,
            "description": (
                "تمرین‌های ذهنی برای تقویت هوش و شکل‌دادن سبک زندگی متمرکز. "
                "شامل: Mental Simulation، Multiple Perspectives Thinking، "
                "Mental Micro-Summarizing، On-the-Go Mind Puzzles، "
                "If-Then Reasoning، Mental Reflection، Microlearning، "
                "Rotation Schedule، Walking Reflection، Stuff You Should Know."
            ),
        },
        {"content": "از روی نرم افزار آکادمی خان - در دستشویی", "is_starred": True, "shared_key": S_AKADEMI_KHAN},
        {"content": "مرور طرح ولایت", "is_starred": True, "shared_key": S_VELAYAT},
        {"content": "روزی یک یا دو صفحه حفظ-2", "is_starred": True, "shared_key": S_HEFZ_2P},
        {
            "content": "ارسال جنس به ایران",
            "is_starred": True,
            "subitems": [
                {"content": "ارسال جنس به ایران"},
                {"content": "نیاز به لنج مطمئن و سریع"},
                {"content": "وبسایت برای تبلیغ و اعتبار و خرید مشتری از وبسایت"},
                {"content": "دستگاه تصفیه هوا"},
                {"content": "لباس و برخی اقلام از تیمو"},
                {"content": "یادگیری دیجیتال مارکتینگ گوگل"},
                {"content": "داشتن انبار یا محل برای نگهداری"},
                {"content": "ترجیحا ثبت شرکت در ایران"},
                {"content": "لباس مهمانی زنانه"},
                {"content": "لوازم آرایش"},
                {"content": "PS5"},
                {"content": "اسکوتر"},
                {"content": "قطعات و لوازم یدکی خودرو"},
                {"content": "تبلیغ : دیوار، دیجی کالا، ترب، اینستاگرام، تلگرام"},
                {"content": "شماره تماس و و اتس اپ بیزینس"},
                {"content": "خرید از علی بابا، تیمو، شین، آمازون، نون و ..."},
                {"content": "دیدن آموزش های صفحه واعظی"},
            ],
        },
        {
            "content": "فارکس",
            "is_starred": True,
            "subitems": [
                {"content": "فارکس"},
                {"content": "مطالعه درباره فارکس"},
                {"content": "یادگیری تحلیل کردن"},
                {"content": "فهمیدن اخباری که اثر می گذراد"},
                {"content": "مدیریت سرمایه"},
                {"content": "داشتن چند پلن و جلو بردن همزمان"},
                {"content": "برداشتن اکثر سودها و زدن به کار دیگر و نگه داشتن اصل سرمایه و اضافه کردن یک پلن دیگر برای خرید یا فروش دیگر"},
                {"content": "داشتن کانال های معتبر تحلیل ارز"},
                {"content": "داشتن کانال های معتبر اخبار لحظه ای موثر در فارکس"},
                {"content": "تعیین ساعت مناسب خرید و فروش"},
                {"content": "داشتن لپ تاپ همراه"},
                {"content": "دو اینترنت قوی همزمان متصل باشد"},
                {"content": "ژورنال نویسی"},
            ],
        },
        {"content": "تقویت صدا", "is_starred": True, "shared_key": S_TAGHVIAT_SEDA},
        {"content": "فن بیان", "is_starred": True, "shared_key": S_FAN_BAYAN},
        {"content": "در طول نوشتن رونویسی از کتاب", "is_starred": True, "shared_key": S_RONUEVISI},
        {
            "content": "محاسبه-1-1",
            "is_starred": True,
            "description": "https://docs.google.com/forms/d/e/1FAIpQLSdd8s0JO8usNxrH-tsmD1LpFQSGFrFeudMHNfOd7aAthfgYLQ/viewform",
        },
    ],

    "Tasks": [
        {"content": "جلسه قرآن با غروی", "is_completed": True, "due_date": date(2024, 5, 22)},
        {"content": "حدود 500 درهم بعد از آمدن مامان بابت تولد داده شود", "is_completed": True, "is_starred": True},
        {"content": "فیروز آبادی - چرخیان - بررسی موارد لازم سر کار", "is_completed": True, "due_date": date(2024, 5, 22)},
        {"content": "مرور 1 تا 30", "is_completed": True, "due_date": date(2024, 5, 20)},
        {"content": "مرور 121 تا 140", "is_completed": True, "due_date": date(2024, 5, 17)},
        {"content": "تردمیل", "is_completed": True, "due_date": date(2024, 5, 17)},
        {"content": "مرور 162 تا 171", "is_completed": True, "due_date": date(2024, 5, 17)},
        {"content": "در صورت رسیدن جنس به مشتری و نبودن اعتراض دلار در نوبیتکس به کارت یا ... منتقل شود", "is_completed": True, "due_date": date(2024, 5, 18)},
        {"content": "ورزش از نرم افزار و باشگاه", "is_completed": True, "due_date": date(2024, 5, 16)},
        {"content": "حنا ب سر", "is_completed": True, "due_date": date(2024, 5, 16)},
        {"content": "جستجو در مصنویات و خواندن آن برای یافتن مشتریان معوق", "is_completed": True, "due_date": date(2024, 5, 16)},
        {"content": "ورزش قبل از رفتن به جلسه با غروی", "is_completed": True, "due_date": date(2024, 5, 15)},
        {"content": "دوره از صفحات 140 تا 167", "is_completed": True, "due_date": date(2024, 5, 13)},
        {"content": "حنا به سر", "is_completed": True, "due_date": date(2024, 5, 13)},
        {"content": "تبریک تولد مامان", "is_completed": True, "is_starred": True, "due_date": date(2024, 5, 13)},
        {"content": "انتقال 315 هزار به نوبیتکس", "is_completed": True, "due_date": date(2024, 5, 13)},
        {"content": "ارسال کیک برای مامان با اسنپ", "is_completed": True, "due_date": date(2024, 5, 13)},
        {"content": "خرید از کارفور", "is_completed": True, "due_date": date(2024, 5, 13)},
        {
            "content": "قرآن 104 تا 140 تمرکز روی ص فرد برای 20 ص اول",
            "is_completed": True,
            "description": (
                "قرار بود جمعه تا 120 تکمیل کنم که ظهر بد خواب شدم و بعد از "
                "ظهر تا بعد از نماز مغرب خواب رفت و بیدار که شدم وقت کم بود "
                "و سریع موضوع فروش... جنس در سایت زیاد وقتم هدر رفت سر کار "
                "هم وقت کم داشتم. فاطمه اصلا توی قضیه فروش جنس درست همکاری "
                "و دلسوزی نمیکنه"
            ),
            "subitems": [{"content": "صفحه صبح 10 ص شب 10"}],
        },
        {"content": "ورزش", "is_completed": True},
        {"content": "عربی لبنانی ۹ و ۱۰", "is_completed": True, "due_date": date(2024, 5, 12)},
        {"content": "بررسی اکسل کارهای من و وارد کردن بخشی از آن برای انجام در هفته", "is_completed": True},
        {"content": "انجام مرحله به مرحله مواردی که روی کاغذ سر کار نوشتم", "is_completed": True},
        {"content": "شستن لباس", "is_completed": True},
        {"content": "انتقال پول فروش به صرافی نوبیتکس", "is_completed": True},
        {"content": "چک کردن واتساپ ۰۵۰", "is_completed": True, "due_date": date(2024, 5, 10)},
        {"content": "غسل جمعه", "is_completed": True, "is_starred": True, "description": "نشد. حتی برا نماز هم خواب موندم"},
        {"content": "حنا زدن به سر", "is_completed": True},
        {"content": "عربی لبنانی ۷ و ۸", "is_completed": True},
        {"content": "چک کردن سفارش در سایت و هماهنگی برای ارسال", "is_completed": True},
        {"content": "تکمیل ده صفحه حفظ قرآن ۹۰ تا ۱۰۰", "is_completed": True},
        {"content": "مرور درس ۴ تا ۶ عربی لبنانی", "is_completed": True, "due_date": date(2024, 5, 9)},
        {"content": "ورزش", "is_completed": True, "due_date": date(2024, 5, 9)},
    ],

    "انجام تمرینات تقویت هوش": [],
    "تاریخ شفاهی فامیل": [],
    "تحلیل سیاسی": [],
    "خودهیپنوتیزم": [],

    "برنامه نویسی": [
        {"content": "الگوریتم و فلوچارت", "is_completed": True},
        {"content": "درک برنامه نویسی - جادی", "is_completed": True},
        {"content": "هوش مصنوعی", "is_completed": True},
        {"content": "یادگیری ماشین (برای برنامه نویسی)", "is_completed": True},
        {"content": "پایتون", "is_completed": True},
        {"content": "هک", "is_completed": True, "subitems": [{"content": "آموزش هک با جادی"}]},
    ],

    "تاریخ انبیا": [
        {"content": "حاج آقا طهرانی", "is_completed": True},
        {"content": "استاد نخعی", "is_completed": True},
        {"content": "تماشای فیلم هایی که درباره انبیا قبلا دانلود کردم", "is_completed": True},
    ],

    "تاریخ معاصر": [
        {"content": "تماشای سریال های دوره تاریخ معاصر که قبلا دانلود کردم"},
        {"content": "دوره استاد موسی نجفی", "is_completed": True},
    ],

    "تجارت": [
        {"content": "مهارت مذاکره"},
        {"content": "بورس"},
        {"content": "بازاریابی"},
        {"content": "دیجیتال مارکتینگ"},
        {"content": "صادر و وارد کردن جنس به/ از ایران"},
    ],

    "تفریح و سرگرمی": [
        {"content": "فیلم دیدن"},
        {"content": "با مامان بیرون رفتن"},
        {"content": "بیرون قدم زدن و رفتن جاهای جدید"},
        {"content": "بازی کامپیوتر", "is_completed": True, "shared_key": S_BAZI_COMP},
    ],

    "حفظ قرآن": [
        {"content": "روزی یک یا دو صفحه حفظ-2", "is_starred": True, "shared_key": S_HEFZ_2P},
        {"content": "روزی سی صفحه یا دو جزء یا نهایتا سه جز مرور"},
        {"content": "صفحه جدید هر روز ساعتی یک بار و تا ده روز روزی یک بار مرور شود-1-2"},
        {"content": "مرور سر کار یا موقع پیاده روی"},
        {"content": "تحویل مجازی یا حضوری با غروی جهت تثبیت"},
        {"content": "ترجمه و یک دور روخوانی شب قبلش بهتر است انجام شود"},
        {"content": "یک صفحه اضافه تر هم یا در طول کار یا بعد از کار و بعد از اندکی استراحت"},
        {"content": "حفظ ترجیحا بعد از نماز صبح-2-2"},
    ],

    "خریدهای لازم": [
        {"content": "کیف مشکی برای سر کار. کوچک"},
        {"content": "خرید قرص نورکرین برای مو و ایمیدین برای پوست"},
        {"content": "اسپری تمیز کننده لپتاپ"},
        {"content": "کمبرند مشکی که بندش از زیر برود"},
        {"content": "کفش اسپرت راحتی"},
        {"content": "کفش مشکی جهت سر کار"},
        {"content": "پیژامه و پیراهن مناسب (با پول حقوق مامان چون میخواهم با آن نماز بخوانم)"},
        {"content": "windows blind roller پرده جهت پوشش کامل پنجره از نوع"},
        {"content": "اسپیکر"},
        {"content": "ویدیو پروژکتور"},
        {"content": "پایه موبایل بلند با لامپ اطرافش جهت مصاحبه"},
        {"content": "تعویض اسکرین برای گوشی خودم"},
        {"content": "کاور موبایل برای گوشی موبایل"},
        {"content": "ماشین تایپ رایتر (برای نویسندگی)"},
        {"content": "آباژور رومیزی"},
        {
            "content": "عطر",
            "subitems": [
                {"content": "عطر المرج از شرکت احمد المغربی به قیمت 148 درهم 5/10/2024 از اکسپو خریدم", "is_completed": True},
                {"content": "عطر لاثانی از برند احمد المغربی در تاریخ 11/10/2024 از نمایشگاه اکسپو شارجه به قیمت 148 درهم خریده شد", "is_completed": True},
                {"content": "عطر بومبای عود از برند احمد المغربی در تاریخ 11/10/2024 از نمایشگاه اکسپو شارجه به قیمت 140 درهم خریده شد", "is_completed": True},
                {"content": "عطر عود کلاسیک از برند احمد المغربی در تاریخ 11/10/2024 از نمایشگاه اکسپو شارجه به قیمت 51 درهم خریده شد", "is_completed": True},
                {"content": "آذرماه 1403 هنگام عزیمت به تهران از ترمینال 1 دبی خریداری شد Concentre d'orange verte Eau de toilette عطر", "is_completed": True},
                {"content": "که برند زیر مجموعه لطافه ست و شباهت زیادی به تام ck be و fusion intense jl Maison al hambra در مورخ 18/12/2024 دو عطر French fragrance نورد ناکینگ نایبلس دارد از عطر فروشی خریداری شد", "is_completed": True},
                {"content": "از برند لطافه خریداری شد pisa و ramz در مورخ 19/12/2024 دو عطر", "is_completed": True},
                {"content": "در 8-4/3/2025 عدد عطر : الخمره و الخمره قهوه از لطافه (یکبش بوی انجل شیراز) - حرمین امبر عود(بوی ایمجینیتیش)-جین لو نویر(بوی tuxedo) - امبر نومد از برند العمیرا - دارک عود (بوی تام فورد عود وود) از العمیرا - موستاج روچاس (بوی انجل شیراز) - ویستام الجمیل", "is_completed": True},
            ],
        },
    ],

    "خوشنویسی": [
        {"content": "در طول نوشتن رونویسی از کتاب", "is_starred": True, "shared_key": S_RONUEVISI},
        {"content": "رفتن به کلاس آنلاین یا حضوری"},
        {"content": "یادگیری از روی کتاب و تمرین"},
        {"content": "در طول نوشتن خواب ها"},
        {"content": "در طول نوشتن بی هوا نویسی اگر با قلم باشد"},
    ],

    "دروس حقوق": [
        {"content": "مدنی تا آنجه که نکته برداری شده مرور شود", "is_completed": True},
    ],

    "ریاضی و فیزیک": [
        {"content": "از روی نرم افزار آکادمی خان - در دستشویی", "is_starred": True, "shared_key": S_AKADEMI_KHAN},
        {"content": "فعلا تا ریاضی پنجم دبستان دوباره مرور شود از روی جزوه خودم"},
    ],

    "زبان": [
        {
            "content": "پیدا کردن پارتنر زبان برای تمرین",
            "description": (
                "https://www.italki.com/en/teacher/12370168/arabic\n\n"
                "https://www.italki.com/en/teacher/9620158/arabic\n"
                "https://www.italki.com/en/teacher/10502276/arabic\n\n"
                "https://www.italki.com/en/teacher/7286480/arabic\n"
                "https://www.italki.com/en/teacher/12942672/arabic\n\n"
                "https://www.italki.com/en/teacher/11849728/arabic\n"
                "https://www.italki.com/en/teacher/9797044/arabic\n"
                "https://www.italki.com/en/teacher/7670619/arabic"
            ),
        },
        {"content": "استفاده از تکنیک آینه برای تمرین آموخته های زبان"},
        {"content": "یادگیری اردو"},
        {"content": "فیلم به زبان عربی لبنانی"},
        {"content": "دیدن فیلم به زبان انگلیسی"},
        {"content": "تقویت انگلیسی"},
    ],

    "شعر گفتن": [
        {"content": "خواندن اشعار شهریار", "is_completed": True},
        {"content": "خواندن پروین اعتصامی", "is_completed": True},
        {"content": "خواندن حافظ", "is_completed": True},
    ],

    "علوم و معارف اسلامی": [
        {"content": "مرور و ادامه دروس معارف فطری از روی جزوه ای که نوشتم و کانالی که پیدا کردم", "is_completed": True},
        {"content": "مطالعه مجدد جزوات دروس فلسفه که خواندم", "is_completed": True},
        {"content": "دانلود شنیدن صوت ها و سوال جواب های گروه طرح ولایت", "is_completed": True},
        {"content": "گسترش موضوعی مباحث طرح ولایت", "is_completed": True},
        {"content": "ادامه خوانش فلسفه", "is_completed": True},
        {"content": "مرور طرح ولایت", "is_completed": True, "is_starred": True, "shared_key": S_VELAYAT},
    ],

    "مداحی": [
        {"content": "مرور شعرها و مداحی های قبلی که یاد گرفتم", "is_completed": True},
    ],

    "مهارت نفوذ": [
        {"content": "کتاب های طاقچه", "is_completed": True},
        {"content": "کتاب های که در کرج نگه داشتم", "is_completed": True},
    ],

    "مهارت های فردی": [
        {
            "content": "ساخت عطر - توضیحات",
            "description": "در قسمت سوالات مهم و متفرقه چت جی پی تی و قسمت متفرقه جمینی پاسخ و منابعی معرفی شده",
        },
        {"content": "فن بیان", "is_starred": True, "shared_key": S_FAN_BAYAN},
        {"content": "تقویت صدا", "is_starred": True, "shared_key": S_TAGHVIAT_SEDA},
    ],

    "ورزش": [
        {"content": "تردمیل در باشگاه - تا لاغری"},
        {"content": "شنا (با مشورت دکتر مو)"},
        {"content": "کراس فیت شنا (با مشورت دکتر مو)"},
        {"content": "کیک بوکس قدم زدن"},
        {"content": "بوکس"},
    ],

    "پرونده های مختومه": [
        {"content": "بازی کامپیوتر", "is_completed": True, "shared_key": S_BAZI_COMP},
    ],
}
