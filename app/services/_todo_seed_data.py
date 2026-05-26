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

    # ── Self-development — 35+ items, free-form notes for spiritual /
    # philosophical practices the user is cultivating. None tick-checked.
    "خودسازی": [
        {"content": "با دقت نماز خواندن-1-1"},
        {
            "content": "محاسبه-1-1",
            "is_starred": True,
            "description": "https://docs.google.com/forms/d/e/1FAIpQLSdd8s0JO8usNxrH-tsmD1LpFQSGFrFeudMHNfOd7aAthfgYLQ/viewform",
        },
        {"content": "مشارطه-1-1"},
        {"content": "قرآن خواندن در شب-2-1"},
        {"content": "مراقبه-2-1"},
        {"content": "قرآن خواندن-1"},
        {"content": "نماز اول وقت-1"},
        {"content": "اجرای خوب برنامه روزانه"},
        {"content": "از بین بردن ترس ها (در فایل مراقبه لیست شده)"},
        {"content": "به خاطر خدا از لذت های سطحی بگذرم تا به عمیق برسم"},
        {"content": "به خاطر خدا رسیدن از گناه و لذت آن عبور کردن"},
        {"content": "به قبرستان مکرر رفتن"},
        {"content": "تقویت اراده (لیست قبلا تهیه شده)"},
        {"content": "تقویت شخصیت یک مرد کاریزماتیک و الهی (قبلا لیست شده)"},
        {"content": "تکمیل دروس ذهن برتر صیدا و مرور نکات و تمرین"},
        {"content": "تلاش برای رعایت اخلاص"},
        {"content": "تلاش برای قطع تعلق"},
        {"content": "تلاش برای یاد خدا بودن در همه حال"},
        {"content": "خواندن کتاب اسرار الصلاه مرحوم ملکی"},
        {"content": "خواندن کتاب خودشناسی برای خودسازی علامه مصباح"},
        {"content": "خواندن کتاب ظهور عامیانه عالمانه عارفانه و خواندن و شنیدن نوشته ها و صوت های دریافت هایی از خودشناسی و خدا شناسی"},
        {"content": "روزه گرفتن"},
        {"content": "روش اشاره و فراخوان درباره عادت های خوب و مخصوصا عادت های بد طبق تکنیک کتاب عادت های اتمی به کار گرفته شود"},
        {"content": "شنیدن صوت های استاد یزدان پناه برای شروع سلوک که رنجبر معرفی کرده بود"},
        {"content": "شنیدن و خواندن سخنرانی و متن ها درباره مرگ و کوتاهی دنیا"},
        {"content": "قبل از نماز بهترین لباس پوشیدن"},
        {"content": "گریه برای امام حسین"},
        {"content": "گریه برای خدا و ترس از اخرت"},
        {"content": "مبارزه با هوای نفس"},
        {"content": "مطالعه اون چند کار که قبلا برای هر عملی قبلش باید در نظر می گرفتم"},
        {"content": "مطالعه کتاب کهکشان نیستی"},
        {"content": "نماز قضا خواندن"},
        {"content": "نوشتن احوالات در قالب داستان"},
        {"content": "نوشتن دریافت های خدا شناسی و خود شناسی"},
        {"content": "هیپنوتیزم کردن و تلقین"},
    ],

    # ── Ideas / brainstorms — long descriptive paragraphs, no checks.
    "ایده ها": [
        {
            "content": "ساخت اپلیکیشن مدیریت پروژه چندلایه",
            "description": "نرم‌افزاری که هنگام شروع کار مرحله‌به‌مرحله ثبت میکنه تا کار گم نشه، شاخه‌های مرتبط رو بهم لینک کنه و مسیر رسیدن به هدف رو نشون بده.",
        },
        {
            "content": "نرم‌افزار نویسندگی هوشمند",
            "description": "ابزاری که هنگام نوشتن، استراتژی‌های نویسندگی رو پیاده می‌کنه و در زمان واقعی پیشنهاد یا اصلاح می‌ده.",
        },
        {
            "content": "نرم‌افزار نیازسنجی مبتنی بر لوکیشن",
            "description": "ثبت نیازهای کوتاه‌مدت و بلندمدت، با دیتابیس مکان‌ها/فروشگاه‌هایی که نیاز رو برطرف می‌کنن. وقتی به محل می‌رسی نوتیفیکیشن می‌فرسته.",
        },
        {
            "content": "روش کوچک‌کردن مفاهیم برای کسب مهارت سریع",
            "description": "ابتدا با کلیات مفاد بعدش رو در ذهن کوچک کنیم، از بالا نگاه کنیم و رفته‌رفته به جزئیات بپردازیم.",
        },
        {
            "content": "عامل صوتی برنامه‌نویسی‌شده برای تشخیص فرد در یوتیوب",
            "description": "ربات که با وصل شدن به اینترنت روی محتوای صوتی فرد رو با امضای صوتی منحصربه‌فرد تشخیص بده.",
        },
        {
            "content": "ضبط ایده‌های شبانه برای داستان‌نویسی",
            "description": "ایده‌های شبانه ادبی رو فوراً ضبط کنم تا از یاد نروند، چون اگر در حافظه نمونند با خواب فراموش می‌شوند.",
        },
        {
            "content": "نمایش انتخابی روی موبایل بر اساس مردمک چشم",
            "description": "اگر بشه مردمک هر کس رو مثل اثرانگشت ثبت کرد، می‌شه تصاویر موبایل رو طوری کرد که فقط فرد خاص ببینه و بقیه نه.",
        },
        {
            "content": "نشانه‌های جغرافیایی شهری برای پاسخ سریع",
            "description": "روی ساختمان‌ها/کوه‌های شهر علائم مشخص گذاشته بشه تا با نزدیک شدن، اپ موقعیت دقیق رو شناسایی کنه.",
        },
        {
            "content": "پرداخت سریع بلیط سینما با کسرواش",
            "description": "اگه سیستم بلیط طوری باشه که با اینترنت پرداخت آنی انجام بده و اگر زودتر بری، تخفیف خودکار اعمال بشه.",
        },
    ],

    # ── When-bored — almost entirely cross-list "go-to" actions.
    "وقتی بیکارم یا نمیدونم چی کار کنم": [
        {"content": "انجام تمرینات تقویت هوش"},
        {"content": "تماشای فیلم هایی که درباره انبیا قبلا دانلود کردم"},
        {"content": "مرور شعرها و مداحی های قبلی که یاد گرفتم"},
        {"content": "تقویت صدا", "shared_key": S_TAGHVIAT_SEDA},
        {"content": "دیدن فیلم به زبان انگلیسی"},
        {"content": "فیلم به زبان عربی لبنانی"},
        {"content": "استفاده از تکنیک آینه برای تمرین آموخته های زبان"},
        {"content": "دانلود شنیدن صوت ها و سوال جواب های گروه طرح ولایت"},
        {"content": "مرور و ادامه دروس معارف فطری از روی جزوه ای که نوشتم و کانالی که پیدا کردم"},
        {"content": "روزانه نویسی"},
        {"content": "رونویسی"},
        {"content": "بی هوا نویسی"},
        {"content": "نوشتن درباره رمان ها و فیلم هایی که خواندم و تماشا کردم"},
        {"content": "رمان خواندن"},
        {"content": "رمان شنیدن"},
        {"content": "ورزش در باشگاه یا نرم افزار"},
        {"content": "یک صفحه اضافه تر هم یا در طول کار یا بعد از کار و بعد از اندکی استراحت"},
        {"content": "هیپنوتیزم کردن و تلقین"},
        {"content": "نماز قضا خواندن"},
        {"content": "قرآن خواندن-1"},
    ],

    # ── 2-minute tasks — short habit-stacking checklist.
    "کارهای زیر 2 دقیقه": [
        {"content": "درخواست از هوش مصنوعی: فرض کن روح و جن هستی و اومدی رو زمین. اطرافت چجوری میبینی؟"},
        {
            "content": "دور نماز قضا 1",
            "subitems": [
                {"content": "1", "is_completed": True},
                {"content": "2", "is_completed": True},
                {"content": "3", "is_completed": True},
                {"content": "4", "is_completed": True},
                {"content": "5", "is_completed": True},
                {"content": "6", "is_completed": True},
                {"content": "7", "is_completed": True},
                {"content": "8", "is_completed": True},
                {"content": "9", "is_completed": True},
                {"content": "10"},
                {"content": "11"},
                {"content": "12"},
                {"content": "13"},
                {"content": "14"},
            ],
        },
        {
            "content": "مطالعه ریاضی از آکادمی خان",
            "description": "فعلا در زمان دستشویی این کار را میکنم شاید بعد بهتر باشد بدلیل کراهت در زیاد ماندن در دستشویی بیرون این مطالعه انجام شود",
        },
        {"content": "تماشای کلیپ آموزشی عربی این هفته"},
        {"content": "تنفس عمیق"},
        {"content": "وارد کردن فیلم های مورد علاقه در لیست تماشا نرم افزار ای ام دی بی و امتیاز به آنها"},
        {"content": "تمرکز روی شخصیتی ایده آل و نیز شخصیت یک مرد الهی و عادات و رفتارها و عقایدی که باعث میشود به این شخصیت برسم"},
        {"content": "روش اشاره و فراخوان درباره عادت های خوب و مخصوصا عادت های بد طبق تکنیک کتاب عادت های اتمی به کار گرفته شود"},
        {"content": "وارد کردن اطلاعات کتابخانه کرج و همه کتب الکترونیکی در اکسل"},
        {
            "content": "نوشتن اهداف در دفتری مشخص",
            "description": "ابتدا در جدول اکسل توسعه فردی و بعد در دفتر نوشته خواهد شد",
        },
        {
            "content": "تماشای ویدیوهای آکادمی ناجی",
            "description": (
                "صفحه اینستاگرام\n"
                "https://www.instagram.com/hamid.reza.talebii?igsh=MXZ1OGFmaTN3aGJpZg==\n\n"
                "در تلگرام فالو کردم"
            ),
        },
        {"content": "تمرکز، تفکر و تعمق درباره شخصیت ایده آلی که عادت ها را حول آن ایجاد خواهد کرد"},
        {"content": "آنفالو کردن پیج های بیخود"},
        {"content": "تمرین خوش نویسی"},
        {"content": "دسته بندی محتوایی عکس‌ها و فیلم ها. توی گوشی"},
        {"content": "مرتب کردن فایل های گوشی"},
        {"content": "تمرینات برای گفتن حرف ر"},
        {"content": "بازی پازل"},
        {"content": "پاک کردن برخی فعالیت ها در اینستگرام شخصی - کامنت & دایرکت"},
        {"content": "نوشتن تدریجی وصیت نامه"},
        {"content": "شماره جدید دو در همه اپلیکیشن ها جایگزین شماره اتصالات گردد"},
    ],

    # ── Income — duplicates of Important's "ارسال جنس به ایران" + "فارکس"
    # (cross-shared), plus extra import-trade and finance branches.
    # ── Writing — long-form descriptive items about the user's
    # writing process. Free-text descriptions captured verbatim.
    "نویسندگی": [
        {
            "content": "ایده داستان نویسنده غالب با خط داستان جذاب و بیان لطیف احساسات",
            "description": (
                "پیش از خواب متوجه شدم که ایده نویسندگی غالب با خط داستان "
                "جذاب و بیان لطیف احساسات به ذهن من آید اگر از قبل شالوده "
                "آن را در کاغذ پیاده کنم یا بعد از آن و داستان را حفظ کنم؛ "
                "لذا پس از آنش این ایده ها موقع خواب در ذهن میشود داستان "
                "را هر سرای تقویت کرد."
            ),
        },
        {
            "content": "چیزایی که دیگه نمیشه",
            "description": (
                "مثلا با مامان و بابا و مامان و فاطمه با دایی و ماماخاوی و "
                "خاتشین از شمال بوشهر مشهد بریم."
            ),
        },
        {
            "content": "جملات قشنگ بپوسر",
            "description": (
                "یادداشت‌های متفرقه شامل اسامی فامیل، تاریخ‌ها (1402، 1403، "
                "17/11/2024) و خاطرات."
            ),
        },
        {
            "content": "رونویسی از روی دست آثار بزرگان",
            "subitems": [
                {"content": "زن زیادی از جلال آل احمد (شروع 7 مهر 1403، پایان 27/10)", "is_completed": True},
            ],
            "description": (
                "باید دقت کرد که اگر مثلا جلال آل احمد را رو نویس میکنم بدانم "
                "این نویسنده نوع قلمش برای خلق فلان نوع از داستان های غمگین و "
                "دردناک مناسب نیست البته تا این جا که اینطور متوجه شدم."
            ),
        },
        {"content": "روزانه نویسی"},
        {"content": "بی هوا نویسی"},
        {"content": "رمان شنیدن"},
        {
            "content": "خواندن مجدد دروس از خلق تا پیشرفته - از هوش مصنوعی در هر مرحله برای عمق بخشیدن کمک گرفته شود",
            "subitems": [
                {"content": "تکالیف تالیف اولیه", "is_completed": True},
                {"content": "صوت های دانلود شده و مفاید های ساده آن مرور شد", "is_completed": True},
                {"content": "تکالیف باغی ماده مثل داستان های خوانده نشده انجام شود"},
                {"content": "رمان های توصیه شده دوباره خوانده شود"},
                {"content": "فیلم های توصیه شده دیده شود"},
                {"content": "برخی از داستان های زبان دوره دوباره خوانده شود"},
                {"content": "تکالیف و لازم های جلسه مرور شود"},
                {"content": "صوت ها و نقد های استاد بار شنیده شود"},
                {"content": "مرور به تکالیف خودم بیندازم و ببینم بچه تر شده ام"},
            ],
        },
        {"content": "رمان خواندن"},
        {"content": "قدم زدن های شبانه با بی هوا قدم زدن"},
        {"content": "نوشتن خواب ها اول صبح"},
        {"content": "نوشتن از سکانس هایی از زندگی مان که به عنوان خاطره زیبا یا ترسناک یا تلخ و ... ثبت شده و شرح و بسط آن"},
        {"content": "شرکت در دوره حرفه ای نویسندگی"},
        {"content": "دوره های نویسندگی اساتید معروف دنیا مثلا دوره عباس معروفی که دانلود شده و تماشا کنم"},
        {
            "content": "خرید ماشین تایپ رایتر - توضیحات",
            "description": (
                "بررسی برندهای: Royal Quiet Deluxe، Corona، Olivetti Lettera 32، "
                "Hermes 3000. قیمت‌های 1000 تا 2000 دلار. هزینه‌های ارسال و گمرک "
                "هم در نظر گرفته شود."
            ),
        },
        {"content": "پس برای هر حالتی که می خواهم بنویسم و فضایی خلق کنم باید مناسب آن زبان و قلمی برای خودش انتخاب کنم از بین نویسنده های ایرانی معروف یا ترکیب آنها"},
        {"content": "باید دقت کرد که اگر مثلا جلال آل احمد را رو نویس میکنم بدانم این نویسنده نوع قلمش برای خلق فلان نوع از داستان های غمگین و دردناک مناسب نیست"},
        {"content": "و به نظر شخصی خودم برای بهتر شدن حالت ها و فضا سازی ها و فضای روحی و ایده گرفتن در نوشتن و خلق صحنه ها از رمان های صوتی ترجیحا خارجی که معروف هستند استفاده شود زمان صوتی از بین رفتن در داستان به گویند دقیقا مناسب با ای زمان های صوتی"},
        {"content": "تماشای فیلم های سینمایی که کمک به نویسندگی میکند"},
        {"content": "تلاش برای ساخت ذهنی (و بعد پیاده کردن آن به صورت متن ) یک داستان رمان مانند طولانی و آموزنده که نکات دینی در غالب یک داستان ساختگی به صورت زیبا گنجانده شود . نمونه آنچه که در کتاب پینوایان هست (در هر زمانی که به ذهنم چیزی در این رابطه آمد سریع در دفترج چنبر می شود)"},
        {"content": "نوشتن درباره رمان ها و فیلم هایی که خواندم و تماشا کردم"},
        {"content": "نوشتن خواب ها به صورت داستان با کمک از قوه تخیل"},
        {"content": "نوشتن اول صبح"},
        {"content": "شنیدن صوت های کارگاه ها از ابتدا"},
    ],

    # ── Long aggregator list — links many items that also appear in
    # other lists. The content text is duplicated here (not all are
    # tagged with shared_key because some are slight rewordings of
    # items elsewhere). The seeder is content-aware for the explicit
    # shared_keys; the rest become independent rows by design.
    "پرونده های موقتا مختومه": [
        {
            "content": "ساخت عطر - توضیحات",
            "description": "در قسمت سوالات مهم و متفرقه چت جی پی تی و قسمت متفرقه جمینی پاسخ و منابعی معرفی شده",
        },
        {"content": "ایده پردازی و مرحله به مرحله رفتن شروع اختراع مهم و موثر برای خدا اسلام و دنیا"},
        {"content": "کراس فیت شنا (با مشورت دکتر مو)"},
        {"content": "یادگیری اردو"},
        {"content": "تقویت انگلیسی"},
        {"content": "دیدن فیلم به زبان انگلیسی"},
        {"content": "مهارت مذاکره"},
        {"content": "بورس"},
        {"content": "بازاریابی"},
        {"content": "دیجیتال مارکتینگ"},
        {"content": "الگوریتم و فلوچارت"},
        {"content": "درک برنامه نویسی - جادی"},
        {"content": "هوش مصنوعی"},
        {"content": "پایتون"},
        {"content": "یادگیری ماشین (برای برنامه نویسی)"},
        {"content": "هک", "subitems": [{"content": "آموزش هک با جادی"}]},
        {"content": "فعلا تا ریاضی پنجم دبستان دوباره مرور شود از روی جزوه خودم"},
        {"content": "یادگیری از روی کتاب و تمرین"},
        {"content": "رفتن به کلاس آنلاین یا حضوری"},
        {"content": "مدنی تا آنجه که نکته برداری شده مرور شود"},
        {"content": "مرور شعرها و مداحی های قبلی که یاد گرفتم"},
        {"content": "خواندن حافظ"},
        {"content": "خواندن پروین اعتصامی"},
        {"content": "خواندن اشعار شهریار"},
        {"content": "کتاب های که در کرج نگه داشتم"},
        {"content": "کتاب های طاقچه"},
        {"content": "تماشای فیلم هایی که درباره انبیا قبلا دانلود کردم"},
        {"content": "حاج آقا طهرانی"},
        {"content": "استاد نخعی"},
        {"content": "دوره استاد موسی نجفی"},
        {"content": "تماشای سریال های دوره تاریخ معاصر که قبلا دانلود کردم"},
        {
            "content": "بورس",
            "subitems": [
                {"content": "بورس ایران"},
                {"content": "مطالعه درباره بورس ایران"},
                {"content": "بانک"},
                {"content": "مدیریت سرمایه و نوشتن دخل و خرج"},
                {"content": "یادگیری مهارت های بانکی"},
            ],
        },
        {
            "content": "آوردن جنس از ایران",
            "subitems": [
                {"content": "آوردن جنس از ایران"},
                {"content": "فعلا عطر از سیدجواد", "is_completed": True},
                {"content": "آوردن توسط مسافر"},
                {"content": "پیدا کردن روش مناسب آوردن"},
                {"content": "بازاریابی برای اجناس دیگر"},
            ],
        },
    ],

    # ── موضوعات برای تفکر — 13-page PDF of philosophical prompts.
    # Each item is a question the user wants to meditate on, with a
    # multi-paragraph explanation. Only the headline questions are
    # captured here; the descriptions can be filled in via the UI as
    # the user works through them.
    "موضوعات برای تفکر": [
        {
            "content": "تفکر درباره اینکه چه برداشتنی میتوان از این مطلب داشت که وقتی فیلم ترسناک داخل گوش کوچک و داخون پخش میشود، گوش از صحنه های ترسناک واهمه و از صحنه های خوشحال کننده واکنش نشان نمیدهد اما انسان که سراینده آن است دچار وحشت میشود و میلرزد",
            "description": "سوال 11/02/2024",
        },
        {
            "content": "چرا ذهن انسان حاضر مثل هوش مصنوعی نمیتواند سریع داشت تحلیل کند معادلات حل کند و... مگر نه اینکه خاطر چیزی... باید از همان صفات مخلوق خود خدا ینشترش را دارا باشد؟",
        },
        {
            "content": "آیا پرتوهای اینترنت ماه و مویایل دو شب پیش ذهنم را هنگامی که به اینگرید برگمن در فیلم کازابلانکا فکر میکردم خواندند و امروز مطلبش را در رپ نشانه دادند و ذهنم قابلیت پیش بینی پیدا کرده، یعنی که به چیزی فکر میکنم که قرار است رو روز بعد با آن روبه شویم؟",
            "description": "سوال 09/11/2024",
        },
        {
            "content": "اگر سازنده شانس بلندیست و واقعی باشد که از ما بدلیل نوجهیم از آینده خبر میدند و چیزی که در ما سازه ها میینیم، در واقع تصاویر بنیتویونها سال قبل دنیامی و ها هم در حال و زمان حاضر جسممون روی زمینه ابا نده زمانش پشت بشد؟",
            "description": "سوال 09/11/2024",
        },
        {
            "content": "اقن در حالت تعقل بالا هستیم یا وقت که ارثاما نشده ام ؟",
            "description": "سوال 10/11/2024",
        },
    ],

    # ── کارهای اصلی این هفته — 7-page weekly project plan.
    # Each headline is a long-running project. Descriptions are
    # condensed; full content can be filled in via the UI.
    "کارهای اصلی این هفته - 05-05-2025": [
        {
            "content": "ساخت اپلیکیشن مدیریت کارهای چندلایه",
            "description": (
                "نرم‌افزاری که هنگام شروع، کار رو مرحله‌به‌مرحله ثبت میکنه، "
                "از کجا ادامه میدیم و ارتباط شاخه‌ها مشخص باشه و مسیر "
                "رسیدن به هدف رو نشون بده."
            ),
        },
        {
            "content": "بازی تریدر در دور تازه سود جمع کند",
        },
        {
            "content": "تهیه نرم‌افزار جامعی که همه کارها در آن انجام گیرد و خود خودجوربان تهیه کند",
        },
        {
            "content": "طراحی یک روش یادگیری ریاضی پروژه‌محور",
            "description": (
                "یک مسئله طولانی سخت ریاضی پیدا میکنم که حل آن نیازمند "
                "یادگیری همه عرصه‌های ریاضی باشد، سپس از تک به اول در شروع "
                "به یافتن سرنخ‌ها میکنم و کنش میکنم و این میان ریاضی را "
                "یادگرفته با روش پروژه‌محور یاد می‌گیرم."
            ),
        },
        {
            "content": "ربات فارکس باتوجه به داده‌های جدول",
            "description": (
                "در نظر گرفتن سناریوهای مختلف برای هر طبع و نقاط حمایت و "
                "تنظیم الگوریتم برای آن و به‌روزرسانی اخبار."
            ),
        },
        {
            "content": "تست گرفتن از روش گن در ویدیو فیلم زمانی",
        },
        {
            "content": "یک صفحه اینستا و یک اکانت تلگرام برای صرفاً حساب‌های پیشگویی و تحلیل گره‌های میسر دور قوت",
        },
    ],

    "کسب در آمد": [
        # Cross-shared duplicate of the "ارسال جنس به ایران" parent +
        # all 17 subitems. Wiring the parent by shared_key reuses the
        # exact same item id; the subitems re-appear by name as children
        # of the new parent — they aren't shared because Microsoft To Do
        # doesn't share subitem positions across lists.
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
        {
            "content": "آوردن جنس از ایران",
            "subitems": [
                {"content": "آوردن جنس از ایران"},
                {"content": "فعلا عطر از سیدجواد", "is_completed": True},
                {"content": "آوردن توسط مسافر"},
                {"content": "پیدا کردن روش مناسب آوردن"},
                {"content": "بازاریابی برای اجناس دیگر"},
            ],
        },
        {
            "content": "بورس",
            "subitems": [
                {"content": "بورس ایران"},
                {"content": "مطالعه درباره بورس ایران"},
                {"content": "بانک"},
                {"content": "مدیریت سرمایه و نوشتن دخل و خرج"},
                {"content": "یادگیری مهارت های بانکی"},
            ],
        },
    ],
}
