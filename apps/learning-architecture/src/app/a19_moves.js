/* ===== حرکت‌های حلِ مسئله: یک «حرکت» (تعمیم، ناوردا، برهانِ خلف…) را در مسئله‌های رشته‌های مختلف ببین و تشخیصش را ورزیده کن =====
   چرا (و حدِّ آن): پژوهش‌های انتقالِ قیاسی نشان می‌دهند دیدنِ یک راه‌حل در یک ظاهر کم منتقل می‌شود و دیدنِ همان ساختار در
   چند ظاهرِ متفاوت، و مقایسه‌شان، انتقال را بهتر می‌کند (Gick & Holyoak 1980; 1983). تمرینِ درهم (تکنیکِ ۴۳) آدم را وامی‌دارد
   پیش از حل، نوعِ مسئله و حرکتِ لازم را تشخیص دهد. ولی تمرین روی گام‌های تاریخیِ مسئله‌های حل‌شده، حلِ مسئله‌های بازِ تازه را
   تضمین نمی‌کند — این‌جا همین را صریح می‌گوییم و وعدهٔ دیگری نمی‌دهیم.
   داده:
   • A.MOVES / A.MOVE_IDS — ۱۶ حرکتِ ثابت (شناسه‌ها تغییر نمی‌کنند؛ تجزیه‌گرِ هوش مصنوعی و epi_problems_b هم همین‌ها را می‌نویسند).
   • A.MOVE_TAGS — برچسبِ حرکتِ گام‌های ۸ مسئلهٔ epi_problems.js بی‌ویرایشِ آن فایل؛ در زمانِ اجرا: stage.mv || MOVE_TAGS[pid][sid].
   • A.MOVE_UNTAGGED — گام‌هایی که عمداً برچسب نگرفتند، با دلیل (حرکتِ قاطعشان داوری/وارسی/انتشار است، نه یکی از ۱۶ حرکت).
   رکورد: {id:"moves_prog", type:"mvprog", by:{mv_x:{n,ok}}, log:[…]} — یک نوشتن برای هر پاسخِ «کدام حرکت؟». */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S;

  /* ---------- ۱۶ حرکت ----------
     tech: فقط تکنیک‌هایی که سازوکارشان واقعاً همین حرکت است؛ دلیلِ هر پیوند کنارش نوشته شده (پیوندِ تعارفی نداریم).
     lit: فقط جایی که منبع واقعاً همین را می‌گوید؛ جایی که پولیا مدخلِ مستقیم ندارد، همین را گفته‌ایم. */
  var MOVES = [
    { id: "mv_special", fa: "حالتِ خاص/ساده‌تر را اول حل کن", d: "به‌جای کلِ مسئله، یک حالتِ خاص، کوچک‌تر یا یکنواخت‌تر را بگیر که یا خودش راه را نشان می‌دهد یا (اگر کلِ حکم به آن برگردد) کافی است.",
      sig: ["مسئلهٔ کلی آن‌قدر بزرگ است که نمی‌دانی از کجا شروع کنی.", "یک پارامتر (عدد، بُعد، تعداد) هست که می‌شود آن را کوچک یا ساده گرفت.", "می‌خواهی یک استدلالِ کلی را با یک مثالِ مشخص بیازمایی."],
      tech: [[27, "آزمایشِ فکری یعنی یک متغیر را تا مقدارِ ساده یا حدی ببری و ببینی چه می‌شود — همان «تخصیص»."], [5, "پایین آمدن از سطحِ کلی به یک نمونهٔ مشخص (زومِ درون) خودِ این حرکت است."]],
      lit: "پولیا (How to Solve It، ۱۹۴۵): مدخلِ «تخصیص» (Specialization)." },
    { id: "mv_general", fa: "تعمیم: صورتِ کلی‌تر را هدف بگیر", d: "مسئله را جزئی از یک مسئلهٔ کلی‌تر ببین؛ گاهی حکمِ کلی‌تر ساختارِ روشن‌تری دارد و آسان‌تر ثابت می‌شود، یا روشِ یک حالت به یک خانوادهٔ کامل می‌رسد.",
      sig: ["حالت‌ها را تک‌تک حل می‌کنی و هر کدام ترفندِ تازه می‌خواهد.", "جزئیاتِ خاصِ مسئله به نظر مزاحم‌اند، نه کمک.", "یک روشِ موفق داری و نمی‌دانی دامنهٔ اعتبارش تا کجاست."],
      tech: [[17, "انتزاع و تعمیم دقیقاً همین است: ارتقای یک بینشِ خاص به اصلِ کلی، و آزمودنش با مرزها."], [5, "بالا رفتن به سطحِ کلی‌تر (زومِ بیرون) و دیدنِ مسئله در دلِ خانواده‌اش."]],
      lit: "پولیا (۱۹۴۵): مدخلِ «تعمیم» و «پارادوکسِ مخترع» — طرحِ بلندپروازانه‌تر گاهی شانسِ موفقیتِ بیشتری دارد." },
    { id: "mv_extend", fa: "رفتن به دستگاه یا چارچوبِ بزرگ‌تر", d: "مسئله را از دستگاهی که در آن طرح شده (مثلاً اعدادِ صحیح، خط‌کش و پرگار) به دستگاهی بزرگ‌تر ببر که ابزارِ بیشتری دارد — و بپرس قوانینِ آشنا آن‌جا هم برقرارند یا نه.",
      sig: ["ابزارهای دستگاهِ فعلی بارها کم آورده‌اند.", "عبارت در دستگاهِ بزرگ‌تری تجزیه یا ساده می‌شود.", "حکمِ «ناممکن» با قیدِ یک ابزارِ مشخص گفته شده است."],
      tech: [[14, "قاب‌بندیِ مجدد شاملِ «گسترشِ» مسئله و برداشتنِ یک قیدِ فرضی است — رفتن به دستگاهِ بزرگ‌تر همین است."], [17, "ساختنِ ساختاری کلی‌تر که دستگاهِ قدیم حالتِ خاصِ آن است، تعمیمِ خودِ شیء است."]],
      lit: "نزدیک به «مسئلهٔ کمکی» در پولیا (۱۹۴۵)؛ پولیا مدخلِ جداگانه‌ای برای گسترشِ دستگاه ندارد." },
    { id: "mv_represent", fa: "تغییرِ بازنمایی/زبانِ مسئله", d: "همان مسئله را به زبانِ دیگری ترجمه کن (هندسه ⇠ جبر، نقشه ⇠ گراف، مکان ⇠ زمان) که در آن ابزار یا حکمِ کلی در دسترس است.",
      sig: ["در زبانِ فعلی نمی‌توانی دربارهٔ «همهٔ راه‌ها» یک‌جا حکم بدهی.", "رشتهٔ دیگری ابزارِ قوی برای شیءِ مشابهی دارد.", "مجهول سخت است ولی با یک مجهولِ دیگر هم‌ارز است."],
      tech: [[14, "قاب‌بندیِ مجدد یعنی تغییرِ صورت‌بندی پیش از جست‌وجوی راه‌حل؛ شکلِ پرسش تعیین می‌کند کدام راه‌حل دیده شود."], [26, "ترجمهٔ روابط به فرمِ دیداری (مثلاً گرافِ دوگان) یک تغییرِ بازنماییِ مشخص است."]],
      lit: "Kaplan & Simon (1990) دربارهٔ بینش به‌عنوانِ تغییرِ بازنمایی؛ در پولیا (۱۹۴۵) زیرِ «تغییرِ مسئله» و «مسئلهٔ کمکی»." },
    { id: "mv_invariant", fa: "ناوردا (یا کمیتِ یکنوا)", d: "کمیتی پیدا کن که هر حرکتِ مجاز حفظش می‌کند (یا همیشه در یک جهت تغییرش می‌دهد) و هدف آن را ندارد — یا ابزارِ تشخیصِ قوی‌تری بساز که دو چیزِ متفاوت را یکی نشان ندهد.",
      sig: ["می‌خواهی ثابت کنی با این حرکت‌ها هرگز به هدف نمی‌رسی.", "فرایندی پیچیده و آشوبناک است و دنبالِ قطب‌نما هستی.", "ابزارِ سنجشت دو چیزِ متفاوت را یکسان نشان می‌دهد."],
      tech: [[27, "در آزمایشِ فکری چیزها را عوض می‌کنی و می‌پایی چه عوض نمی‌شود — راهِ عملیِ پیدا کردنِ ناوردا."]],
      lit: "در پولیا (۱۹۴۵) مدخلِ مستقیم ندارد؛ «اصلِ ناوردایی» فصلِ نخستِ Engel (Problem-Solving Strategies، ۱۹۹۸) است و کمیتِ یکنوا (monovariant) در Zeitz (The Art and Craft of Problem Solving)." },
    { id: "mv_backward", fa: "از هدف به عقب", d: "از آنچه باید ثابت یا ساخته شود شروع کن و بپرس «دقیقاً چه چیزی برای رسیدن به آن کافی است؟»؛ گام‌به‌گام عقب برو تا به چیزی برسی که داری.",
      sig: ["نقطهٔ شروع مبهم است ولی هدف دقیق است.", "حکمِ ضعیف‌تری داری و نمی‌دانی برای هدف کافی است یا نه.", "مسیرهای رو به جلو زیادند و نمی‌دانی کدام به هدف می‌رسد."],
      tech: [[11, "شکلِ دومِ تکنیکِ وارونگی دقیقاً «کار از پایان به آغاز» است: از نتیجه شروع کن و شرایطِ لازم را عقب‌عقب استخراج کن."]],
      lit: "پولیا (۱۹۴۵): مدخلِ «کار به عقب» (Working backwards)، که به پاپوس برمی‌گرداند." },
    { id: "mv_contra", fa: "برهانِ خلف (فرضِ مخالف)", d: "فرض کن حکم نادرست است (یا جوابی که «نباید باشد» هست) و پیامدهایش را تا تناقض با چیزی مسلم دنبال کن.",
      sig: ["حکم از نوعِ «هیچ … وجود ندارد» یا «ناممکن است» است.", "مستقیم نمی‌دانی چه بسازی، ولی می‌دانی وجودِ مثالِ نقض چه چیزهایی را لازم می‌آورد.", "یک حقیقتِ بزرگِ دیگر هست که شاید با وجودِ آن جواب ناسازگار باشد."],
      tech: [[27, "برهانِ خلف یک آزمایشِ فکریِ کنترل‌شده است: سناریوی «فرض کن هست» را اجرا کن و پیامدش را ببین."]],
      lit: "پولیا (۱۹۴۵): مدخلِ «برهانِ خلف و برهانِ غیرمستقیم» (Reductio ad absurdum and indirect proof)." },
    { id: "mv_descent", fa: "نزول یا استقراء", d: "نشان بده هر نمونه (مثلاً هر جوابِ فرضی یا کوچک‌ترین مثالِ نقض) نمونهٔ کوچک‌تری می‌زاید یا از نمونهٔ کوچک‌تر ساخته می‌شود؛ چون اعدادِ طبیعی بی‌پایان کوچک نمی‌شوند، کار تمام است.",
      sig: ["شیءها اندازه‌ای طبیعی دارند (عدد، تعدادِ ناحیه، درجه).", "از یک نمونه می‌شود نمونهٔ کوچک‌ترِ هم‌نوع ساخت.", "حکم دربارهٔ «همهٔ n» است."],
      tech: [[2, "نزول و استقراء شکلِ بازگشتیِ تقسیم و حل‌اند: مسئله را به نمونهٔ کوچک‌ترِ همان مسئله برمی‌گردانند."]],
      lit: "پولیا (۱۹۴۵): مدخلِ «استقراء و استقرای ریاضی»؛ «نزولِ بی‌پایان» روشِ خودِ فرماست؛ «اصلِ اکسترمال» (کوچک‌ترین مثالِ نقض) در Engel (۱۹۹۸)." },
    { id: "mv_decompose", fa: "شکستن به حالت‌ها/اجزا", d: "همهٔ حالت‌های ممکن را به چند دستهٔ جدا (و جمعاً کامل) بشکن و هر دسته را جدا ببند؛ یا مسئله را به اجزایی بشکن که هر کدام ابزارِ خودش را دارد.",
      sig: ["یک استدلالِ واحد برای همه کار نمی‌کند ولی برای بخشی کار می‌کند.", "چند فرضِ رقیب هست که می‌شود فهرستشان کرد.", "حالت‌ها متناهی‌اند، یا می‌شود فهرستی متناهی ساخت که همه را بپوشاند."],
      tech: [[2, "تجزیه (تقسیم و حل) همین حرکت است: شکستن به اجزای معنادار، حلِ جداگانه، و دوباره سوار کردن."]],
      lit: "پولیا (۱۹۴۵): مدخلِ «تجزیه و ترکیبِ دوباره» (Decomposing and recombining)." },
    { id: "mv_analogy", fa: "قیاس از حوزهٔ دیگر", d: "ساختارِ یک مسئله یا راه‌حلِ آشنا را از حوزهٔ دیگری (معادلهٔ گرما، کره، کالبدشکافی) به مسئله نگاشت کن — و صریحاً بسنج کجا قیاس می‌شکند.",
      sig: ["نتیجه‌های عجیبِ مسئله شبیهِ چیزی آشنا در جای دیگری است.", "رخدادی از حوزهٔ دیگر همان الگوی علّی را نشان می‌دهد.", "فرایندی طبیعی در رشتهٔ دیگری کاری را می‌کند که تو لازم داری."],
      tech: [[6, "استدلالِ قیاسی: نگاشتِ روابط از منبعِ آشنا به هدف، و مشخص کردنِ جای شکستِ قیاس."], [19, "گرده‌افشانی: انتقالِ ساختارِ یک راه‌حل از دامنهٔ دور، به شرطِ وارسیِ روابطِ علّی در دامنهٔ تازه."]],
      lit: "پولیا (۱۹۴۵): مدخلِ «قیاس»؛ Gick & Holyoak (1980; 1983) دربارهٔ انتقالِ قیاسی." },
    { id: "mv_assume", fa: "یافتن و ردِ فرضِ پنهان", d: "مقدمه‌ای را که آن‌قدر بدیهی به نظر می‌رسد که دیده نمی‌شود (یکتاییِ تجزیه، «بزرگ‌تر بهتر است»، یک اصلِ هم‌ارز) آشکار کن و بپرس «آیا لزوماً درست است؟».",
      sig: ["استدلالی که همهٔ گام‌هایش درست به نظر می‌رسد، به نتیجهٔ نادرست یا تکرارِ شکست می‌رسد.", "قانونی از دنیای آشنا به دنیای ناآشنا منتقل شده است.", "تلاش‌های پیاپیِ متخصصان در یک نقطه شکست می‌خورد."],
      tech: [[15, "به چالش کشیدنِ فرضیات: آشکار کردن و آزمودنِ فرض‌های باربر — دقیقاً همین حرکت."], [13, "پرسشگریِ سقراطی پرسش‌های نظام‌مند دربارهٔ فرض‌ها دارد که مقدمهٔ بی‌صدا را بیرون می‌کشد."]],
      lit: "لاکاتوش (Proofs and Refutations، ۱۹۷۶): «لم‌های پنهان» و پیدا کردنِ «لمِ مقصر» پس از مثالِ نقض." },
    { id: "mv_control", fa: "آزمایشِ کنترل‌شده (حذفِ یک متغیر)", d: "دو گروه یا دو وضعیت را که جز در یک عامل یکسان‌اند مقایسه کن، یا فقط همان یک عامل را تغییر بده و ببین اثر می‌ماند یا می‌رود.",
      sig: ["چند علتِ رقیب هست و داده‌ها میانشان تمایز نمی‌گذارند.", "دو گروهِ تقریباً هم‌شرایط نتیجهٔ متفاوت دارند.", "یک موفقیتِ تک ممکن است شانس باشد."],
      tech: [[21, "آزمونِ فرضیه: کوچک‌ترین آزمونی که واقعاً بتواند فرضیه را رد کند — معمولاً تغییرِ یک عامل با گروهِ مقایسه."], [22, "ابطال‌گرایی: از پیش بگو چه مشاهده‌ای فرضیه را باطل می‌کند و دنبالش برو؛ آزمایشِ کنترل‌شده ابزارِ همین است."]],
      lit: "«روشِ تفاوت» در منطقِ جان استوارت میل (A System of Logic، ۱۸۴۳)؛ در پولیا مدخلِ مستقیم ندارد." },
    { id: "mv_measure", fa: "اندازه‌گیری یا ابزارِ دقیق‌تر", d: "وقتی ابزارِ موجود نمی‌تواند دو حالت را از هم جدا کند یا خطایش از اثر بزرگ‌تر است، سنجه یا ابزارِ دقیق‌تری بساز — یا معیارِ موفقیت را عددی و آزمون‌پذیر کن.",
      sig: ["بحث بر سرِ اثری است که از خطای سنجش کوچک‌تر است.", "«حل» تعریفِ اندازه‌پذیر ندارد.", "روش در شرایطِ واقعیِ اندازه‌گیری (کشتیِ لرزان، برنامهٔ رایانه‌ای) کار نمی‌کند."],
      tech: [[10, "تمایزِ سیگنال از نویز: تا خطای سنجش کوچک‌تر از اثر نشود، الگو را نمی‌شود از نوسان جدا کرد."]],
      lit: "در پولیا مدخلِ مستقیم ندارد؛ این حرکتِ تجربی/مهندسی است." },
    { id: "mv_anomaly", fa: "جدی‌گرفتنِ ناهنجاری به‌جای وصله‌کردن", d: "مشاهده یا مثالِ نقضی را که با چارچوبِ فعلی نمی‌خواند نادیده نگیر و با وصلهٔ موردی هم خاموشش نکن؛ آن را سرنخِ اصلی بگیر و ببین چه چیزی را عوض می‌کند.",
      sig: ["یک مثالِ نقض یا رخدادِ غیرمنتظره با نظریهٔ رایج نمی‌خواند.", "وسوسه می‌شوی بگویی «حکم احتمالاً درست است، خطا را ندیده بگیر».", "نتیجه‌ای «عجیب» است ولی هنوز تناقضی در آن پیدا نشده."],
      tech: [[22, "ابطال‌گرایی: مشاهدهٔ ناسازگار را فعالانه جدی می‌گیرد، نه این‌که برایش بهانه بسازد."], [39, "یادگیریِ دوحلقه‌ای: به‌جای وصلهٔ راهبرد، باورِ حاکم را که ناهنجاری زیرِ سؤال برده بازبینی می‌کند."], [10, "پیش از ساختنِ نظریه روی یک ناهنجاری، بپرس سیگنال است یا نویز."]],
      lit: "کوهن (ساختارِ انقلاب‌های علمی، ۱۹۶۲) دربارهٔ نقشِ ناهنجاری؛ لاکاتوش (۱۹۷۶): «دفعِ هیولا» در برابرِ جدی گرفتنِ مثالِ نقض." },
    { id: "mv_impossible", fa: "اثباتِ ناممکنی به‌جای ادامهٔ جستجو", d: "وقتی جست‌وجوی طولانی برای ساختن یا اثبات پی‌درپی شکست می‌خورد، هدف را عوض کن: دقیق تعریف کن «راه» یعنی چه و ثابت کن هیچ راهی از آن نوع وجود ندارد.",
      sig: ["متخصصان بارها در همان نقطه شکست خورده‌اند.", "می‌شود همهٔ «راه‌های مجاز» را دقیق تعریف کرد.", "یک مثالِ عددی ادعای «فرمول یافتم» را رد کرده است."],
      tech: [[14, "قاب‌بندیِ مجدد «تغییرِ هدف» را صریحاً شامل می‌شود: از «بساز» به «ثابت کن نمی‌شود ساخت»."], [39, "یادگیریِ دوحلقه‌ای: پس از شکستِ تکراری، خودِ هدف را زیرِ سؤال ببر نه فقط راهبرد را."]],
      lit: "در پولیا مدخلِ مستقیم ندارد؛ نمونه‌های کلاسیکش آبل (۱۸۲۴)، ونتسل (۱۸۳۷) و مدلِ بلترامی (۱۸۶۸) در همین شبیه‌سازند." },
    { id: "mv_compute", fa: "جستجوی نظام‌مند/محاسبهٔ گسترده", d: "وقتی حالت‌ها متناهی ولی بیش از توانِ دستِ انسان‌اند، تولید و وارسیِ نظام‌مندشان را به محاسبه (رایانه یا جدولِ ازپیش‌محاسبه‌شده) بسپار — و اعتماد به خودِ محاسبه را هم بیازما.",
      sig: ["مسئله به فهرستی متناهی ولی بسیار بزرگ از حالت‌ها برگشته است.", "یک کارِ محاسباتیِ تکراری را می‌شود یک‌بار انجام داد و بارها به کار برد.", "استدلالِ هوشمندانهٔ یکتا پیدا نمی‌شود ولی وارسیِ موردبه‌مورد ممکن است."],
      tech: [[2, "محاسبهٔ گسترده پس از تجزیه به فهرستِ متناهیِ حالت‌ها معنا پیدا می‌کند."], [27, "شبیه‌سازی در مدل (کد، جدول) برای دیدنِ پیامدِ همهٔ حالت‌ها."]],
      lit: "در پولیا (۱۹۴۵) نیست؛ برهانِ چهار رنگ (اپل و هاکن ۱۹۷۶) نمونهٔ شاخصِ آن است." }
  ];
  A.MOVES = {}; A.MOVE_IDS = [];
  MOVES.forEach(function (m, i) { m.n = i; A.MOVES[m.id] = m; A.MOVE_IDS.push(m.id); });
  A.MOVE_LIST = MOVES;

  /* ---------- برچسبِ حرکتِ گام‌های ۸ مسئلهٔ epi_problems.js ----------
     هر برچسب از روی q / move / idea و گزینهٔ درستِ همان گام انتخاب شده؛ ۱ یا ۲ حرکت که حرکتِ قاطعِ گام را توصیف می‌کنند. */
  A.MOVE_TAGS = {
    pb_flt: {
      n1: ["mv_descent", "mv_decompose"],   // نزولِ بی‌پایان برای n=4 + تقلیل به n=4 و نماهای اولِ فرد
      n2: ["mv_extend"],                    // اویلر: اعدادِ a+b√-3
      n3: ["mv_decompose", "mv_general"],   // ژرمن: دو حالت، و حلِ حالتِ اول برای یک خانواده نه یک نما
      n4: ["mv_assume"],                    // لیوویل: یکتاییِ تجزیه مقدمهٔ پنهان است
      n5: ["mv_extend"],                    // کومر: اعدادِ ایدئال (دستگاهِ بزرگ‌تر) + مرزِ اعتبار (نماهای منظم)
      n8: ["mv_represent", "mv_contra"],    // فری–ریبت: معادله ⇠ خمِ بیضوی؛ «اگر جواب باشد، شیءِ ناممکن»
      n11: ["mv_general"]                   // BCDT: از نیم‌پایدار به همهٔ خم‌ها
    },
    pb_fourcolor: {
      n2: ["mv_special", "mv_represent"],   // کافی است نقشه‌های مکعبی؛ گرافِ دوگان
      n3: ["mv_descent", "mv_contra"],      // کوچک‌ترین مثالِ نقضِ فرضی
      n5: ["mv_represent", "mv_assume"],    // تیت: صورتِ هم‌ارزِ یالی؛ کنار گذاشتنِ فرضِ اثبات‌نشدهٔ دورِ همیلتونی
      n4: ["mv_anomaly"],                   // هیوود: مثالِ نقضِ گام جدی گرفته شد، نه «احتمالاً درست است»
      n6: ["mv_decompose"],                 // اجتناب‌ناپذیری + تقلیل‌پذیری: فهرستِ متناهیِ پوشاننده
      n7: ["mv_compute"],                   // هش: گزینهٔ درست «مقیاس ⇒ ابزارِ محاسباتی لازم است»؛ تخلیه ابزارِ ساختنِ فهرست است، نه ناوردایی که چیزی را ناممکن کند
      n8: ["mv_compute"]                    // اپل و هاکن: وارسیِ رایانه‌ای
    },
    pb_poincare: {
      n1: ["mv_invariant"],                 // همولوژی ناوردای ضعیفی است ⇒ مثالِ نقض
      n2: ["mv_invariant"],                 // پرسش با ناوردای قوی‌تر (گروهِ بنیادی)
      n3: ["mv_assume"],                    // وایتهد: مقدمهٔ «طبیعی» کاذب بود
      n5: ["mv_general"],                   // ترستن: حدسِ هندسی‌سازی
      n6: ["mv_represent", "mv_analogy"],   // همیلتون: پرسشِ توپولوژیک ⇠ تحولِ هندسی؛ شبیهِ معادلهٔ گرما
      n8: ["mv_invariant"],                 // پرلمن: تابعکِ یکنوا
      n9: ["mv_backward"]                   // انقراضِ متناهی: دقیقاً همان چیزی که برای هدف کافی است
    },
    pb_quintic: {
      n2: ["mv_represent", "mv_invariant"], // لاگرانژ: از «فرمول» به جایگشتِ ریشه‌ها و رفتارِ حلّال زیرِ آن
      n3: ["mv_impossible", "mv_assume"],   // روفینی: برهانِ ناممکنی با یک فرضِ اثبات‌نشده
      n4: ["mv_special", "mv_impossible"],  // آبل: آزمونِ عددی ⇠ کشفِ خطا ⇠ اثباتِ ناممکنی
      n5: ["mv_impossible"],                // آبل ۱۸۲۴
      n6: ["mv_represent", "mv_invariant"], // گالوا: «حل‌پذیر؟» ⇠ «ساختارِ گروهِ تقارن‌ها»
      n8: ["mv_extend"]                     // هرمیت: توابعِ بیضوی، فراتر از رادیکال‌ها
    },
    pb_greek: {
      n2: ["mv_extend"],                    // مخروطی‌ها، نئوسیس: ابزارِ قوی‌تر (مسئلهٔ دیگری حل شد)
      n3: ["mv_represent"],                 // دکارت: جبری‌سازیِ هندسه
      n5: ["mv_represent"],                 // گاوس: ساخت‌پذیری با تحلیلِ جبری
      n6: ["mv_invariant", "mv_impossible"],// ونتسل: درجه (توانی از ۲) ناوردای ساخت است
      n7: ["mv_backward"],                  // دقیقاً کدام حکم لازم است: متعالی بودن، نه گنگ بودن
      n8: ["mv_contra", "mv_general"]       // لیندمان: تعمیمِ روشِ هرمیت + e^(iπ)=−1 ⇒ تناقض
    },
    pb_parallel: {
      n2: ["mv_assume"],                    // پروکلس: فرض‌های پنهانِ هم‌ارز
      n3: ["mv_decompose"],                 // خیام و طوسی: سه حالتِ زاویه
      n4: ["mv_assume"],                    // والیس: جایگزینی با فرضِ هم‌ارز، نه اثبات
      n5: ["mv_anomaly"],                   // ساکری: «عجیب» را با «متناقض» اشتباه گرفت؛ حرکتِ درست جدی گرفتنِ نتایجِ عجیب
      n6: ["mv_analogy"],                   // لامبرت: شبیهِ کره با شعاعِ موهومی
      n7: ["mv_impossible"],                // لژاندر: شکستِ پیاپی ⇒ شاید اثبات ناممکن است
      n8: ["mv_assume"],                    // لباچفسکی و بویوئی: نقیضِ اصل را اصل گرفتن
      n9: ["mv_impossible", "mv_represent"] // بلترامی: مدل ⇒ استقلال (اثباتِ ناممکنیِ اثبات)
    },
    pb_longitude: {
      n1: ["mv_represent"],                 // مکان ⇠ زمان
      n2: ["mv_measure"],                   // اقمارِ مشتری: شرایطِ اندازه‌گیری روی کشتی
      n3: ["mv_measure"],                   // قانونِ ۱۷۱۴: معیارِ موفقیتِ اندازه‌پذیر
      n4: ["mv_measure"],                   // H1 ⇠ H2، H3: ابزارِ دقیق‌تر پیش از آزمونِ رسمی
      n5: ["mv_assume"],                    // هریسون: رها کردنِ فرضِ «ساعتِ بزرگ‌تر پایدارتر است»
      n6: ["mv_measure", "mv_compute"],     // فاصلهٔ ماه: اکتانت + جدول‌های ازپیش‌محاسبه‌شده
      n7: ["mv_control"]                    // آزمونِ دوم با کنترلِ بهتر
    },
    pb_semmelweis: {
      n1: ["mv_control"],                   // مقایسهٔ دو بخشِ هم‌شرایط
      n2: ["mv_control"],                   // حذفِ فرضیه‌های رقیب با «گروه‌های مقایسهٔ» موجود (شلوغی، زایمانِ خیابانی)
      n3: ["mv_control"],                   // تغییرِ یک عامل (مسیرِ کشیش، وضعیتِ زایمان)
      n4: ["mv_analogy", "mv_anomaly"],     // کولچکا: رخدادِ غیرمنتظره + تمثیل
      n5: ["mv_control"],                   // مداخله‌ای که دقیقاً همان فرضیه را می‌آزماید
      n6: ["mv_control", "mv_anomaly"]      // وضع و رفع با گروهِ مقایسه؛ موردِ سرطان فرضیه را دقیق‌تر کرد
    }
  };
  /* گام‌هایی که عمداً برچسب نگرفتند: حرکتِ قاطعشان یکی از ۱۶ حرکت نیست. */
  A.MOVE_UNTAGGED = {
    pb_flt: { n7: "خواندنِ دقیقِ یک نتیجهٔ جزئی (فالتینگز) — داوری، نه حرکتِ حل", n6: "شواهدِ عددی؛ درسِ گام تفکیکِ «بررسی‌شده» از «همه» است، نه خودِ محاسبه", n9: "داوریِ مستقل و کشفِ شکاف", n10: "ترکیبِ دو رویکردِ ناکافی؛ در فهرستِ ۱۶ حرکت معادلِ دقیقی ندارد" },
    pb_fourcolor: { n1: "صورت‌بندیِ دقیقِ شرایط — پیش‌نیازِ همهٔ حرکت‌ها، نه یکی از آن‌ها", n9: "بازسازیِ مستقلِ برهان (وارسی)", n10: "وارسیِ صوری در دستیارِ اثبات — اعتبارسنجیِ برهانی که از پیش هست (هم‌خانوادهٔ n9)، نه حرکتِ حل؛ «ابزارِ دقیق‌تر» این‌جا به سنجشِ یک اثر برنمی‌گردد" },
    pb_poincare: { n4: "پذیرفتنِ ویژه بودنِ بُعدِ ۳ — داوری دربارهٔ حدِّ یک تعمیم", n7: "شناساییِ دقیقِ مانع؛ تشخیص، نه حرکتِ حل", n10: "وارسیِ جمعیِ برهان" },
    pb_quintic: { n1: "انباشتِ ترفند؛ درسِ گام پرسیدنِ «چرا کار کرد» است", n7: "داوری دربارهٔ گزارشِ پواسون و انتشار" },
    pb_greek: { n1: "موفقیتِ جزئی (هلال‌ها)؛ درسِ گام هشدار دربارهٔ تعمیمِ شتاب‌زده است", n4: "تصمیمِ نهادی بر پایهٔ نرخِ پایه", n9: "ماجرای لایحهٔ ایندیانا — داوریِ نهادی" },
    pb_parallel: { n1: "طرحِ پرسشِ استقلال", n10: "تفکیکِ پرسشِ ریاضی از پرسشِ تجربی" },
    pb_longitude: { n8: "تکرارپذیری و انتقالِ دانش (افشای طراحی)", n9: "اعتبارسنجیِ میدانی", n10: "حلِ سیاسیِ مناقشه" },
    pb_semmelweis: { n7: "انتشار و انتقالِ یافته", n8: "ردِ جامعهٔ پزشکی", n9: "شیوهٔ دفاع", n10: "تبیینِ سازوکار در دهه‌های بعد" }
  };

  /* ---------- دسترسی ---------- */
  function probs() { return A.probs ? A.probs() : (window.EPI_PROBLEMS || []); }
  function yr(y) { return A.probYear ? A.probYear(y) : fa(y == null ? "" : y); }
  function yrWho(s, lead) { var a = [], y = s && s.year; if (y != null && y !== "") a.push(h("bdi", { class: "pb-year" }, yr(y))); if (s && s.who) a.push(s.who); if (!a.length) return null; var out = [lead || ""]; a.forEach(function (x, i) { if (i) out.push(" · "); out.push(x); }); return out; }
  A.stageMoves = function (p, s) {
    var raw = s && s.mv != null ? s.mv : ((A.MOVE_TAGS[p && p.id] || {})[s && s.id]);
    var arr = typeof raw === "string" ? [raw] : Array.isArray(raw) ? raw : [];
    return arr.filter(function (x, i) { return A.MOVES[x] && arr.indexOf(x) === i; });
  };
  function allTagged() {
    var out = [];
    probs().forEach(function (p) { (p.stages || []).forEach(function (s, i) { var m = A.stageMoves(p, s); if (m.length) out.push({ p: p, s: s, i: i, mv: m }); }); });
    return out;
  }
  A.moveStages = function (mv) { return allTagged().filter(function (x) { return x.mv.indexOf(mv) >= 0; }); };
  function mvName(id) { var m = A.MOVES[id]; return m ? m.fa : id; }
  function mvLink(id, extra) {
    var m = A.MOVES[id]; if (!m) return null;
    return h("button", { class: "tlink mv-chip", style: { "--pc": "var(--p" + (m.n % 9) + ")" }, title: m.d, onclick: function () { A.go("move", id); } }, "🧗 " + m.fa, extra || null);
  }
  A.moveLink = mvLink;
  A.moveChips = function (p, s, label) {
    var ms = A.stageMoves(p, s); if (!ms.length) return null;
    return h("div", { class: "row gap wrap mv-chips", dir: "rtl" }, label ? h("span", { class: "small muted" }, label) : null, ms.map(function (id) { return mvLink(id); }));
  };

  /* ---------- پیشرفت: دقتِ تشخیصِ حرکت ----------
     تعریف: برای حرکتِ X، از گام‌هایی که X حرکتِ (یکی از حرکت‌های) آن‌ها بود، چند بار در پرسشِ «کدام حرکت؟» درست زدی. */
  function prog() { var r = S.get("moves_prog"); if (!r) r = { id: "moves_prog", type: "mvprog", by: {}, log: [] }; r.by = r.by || {}; r.log = r.log || []; return r; }
  A.moveAcc = function (mv) { var b = (S.get("moves_prog") || { by: {} }).by[mv]; return b ? { n: b.n || 0, ok: b.ok || 0 } : { n: 0, ok: 0 }; };
  function record(item, pick, ok) {
    var r = prog();
    item.mv.forEach(function (t) { var b = r.by[t] = r.by[t] || { n: 0, ok: 0 }; b.n++; if (ok) b.ok++; });
    r.log.push({ pid: item.p.id, sid: item.s.id, pick: pick, ok: ok, at: new Date().toISOString() });
    if (r.log.length > 300) r.log = r.log.slice(-300);
    S.put(r);  // یک نوشتن برای هر پاسخ
    try { document.querySelectorAll(".mv-accval[data-mv]").forEach(function (el) { el.textContent = accText(el.getAttribute("data-mv")); }); } catch (e) { }
  }
  function accText(mv) { var a = A.moveAcc(mv); return a.n ? fa(a.ok) + " از " + fa(a.n) + " (" + fa(Math.round(100 * a.ok / a.n)) + "٪)" : "هنوز تمرین نشده"; }

  /* ---------- «🪢 این‌جا گیر کردم» ⇒ موقعیتِ عادیِ گره‌گشا ---------- */
  /* زمینهٔ خنثی: هر جملهٔ ctx که با متنِ یکی از گزینه‌ها یا با move/idea ِ همان گام دست‌کم ۴ واژهٔ پیاپیِ مشترک دارد، حذف می‌شود
     (پاسخ از راهِ زمینه لو نرود). متنِ کاملِ ctx فقط پس از دیدنِ پاسخ به صورتِ مسئله افزوده می‌شود. */
  function words(t) {
    return String(t || "").replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/[\u064B-\u0655\u0670\u0640]/g, "").replace(/\u200c/g, " ")
      .replace(/[0-9۰-۹٠-٩]+/g, function (d) { return d.replace(/[۰-۹]/g, function (c) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(c); }).replace(/[٠-٩]/g, function (c) { return "٠١٢٣٤٥٦٧٨٩".indexOf(c); }); })
      .toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  }
  function grams(t, n) { var w = words(t), out = {}; for (var i = 0; i + n <= w.length; i++) out[w.slice(i, i + n).join(" ")] = 1; return out; }
  function sentences(t) { return String(t || "").split(/(?<=[.!?؟؛])\s+|\n+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  A.probNeutralCtx = function (s) {
    var bad = {};
    (s.opts || []).map(function (o) { return o && o.t; }).concat([s.move, s.idea]).forEach(function (t) { Object.assign(bad, grams(t, 4)); });
    return sentences(s.ctx).filter(function (x) { var g = grams(x, 4); return !Object.keys(g).some(function (k) { return bad[k]; }); }).join(" ");
  };
  A.probShares4 = function (a, b) { var g = grams(b, 4); return Object.keys(grams(a, 4)).filter(function (k) { return g[k]; }); };
  function stuck(p, s, idx, st) {
    var ex = S.all("kcase", function (c) { return c.src && c.src.type === "eprob" && c.src.pid === p.id && c.src.sid === s.id && c.status !== "closed" && c.status !== "done"; })[0];
    if (ex) { A.toast("برای همین گام پیش‌تر یک موقعیت ساخته‌ای؛ همان باز شد."); A.go("kcase", ex.id, ex.step || "in"); return ex; }
    var kc = A.knotNewCase(), ok = (s.opts || []).filter(function (o) { return o.ok; })[0];
    var where = "گامِ " + fa(idx + 1) + " از مسئلهٔ «" + p.title + "»";
    kc.kinds = ["problem"]; kc.title = "گیر در " + where; kc.titleSet = true;
    var seen = !!(st && st.revealed), nctx = seen ? (s.ctx || "") : A.probNeutralCtx(s);
    kc.intake.statement = (nctx ? nctx + "\n\n" : "") + (s.q || "");    // فقط زمینهٔ خنثی و پرسش — پاسخ هرگز در صورتِ مسئله نمی‌آید
    kc.intake.answer = ok ? ok.t : (s.move || "");                          // برای نردبان و کنترلِ نشت (در فرم تا «نمایش» پوشیده است)
    kc.intake.answerHow = "مسیرِ تاریخیِ ثبت‌شده در «مسئله‌های بزرگ» (" + [yr(s.year), s.who].filter(Boolean).join("، ") + ")";
    kc.intake.stuckAt = where + (s.year != null && s.year !== "" ? " — لحظهٔ تاریخیِ " + yr(s.year) : "");
    kc.intake.what = "در شبیه‌سازِ «مسئله‌های بزرگ»، در " + where + " حرکتِ بعدی را پیدا نکردم.";
    kc.intake.seen = st && st.revealed ? "yes" : "no";
    if (st && st.mine && String(st.mine).trim()) kc.intake.thoughts = String(st.mine).trim();
    kc.src = { type: "eprob", pid: p.id, sid: s.id };
    if (!seen && normWS(nctx) !== normWS(s.ctx)) kc.src.ctxHeld = String(s.ctx || "");   // پس از دیدنِ پاسخ به صورت افزوده می‌شود
    try { var r = {}; (A.knotRank ? A.knotRank(kc) : []).forEach(function (x) { r[x.fam] = { score: x.score, why: x.why }; }); kc.rank = r; } catch (e) { }
    S.put(kc);
    A.go("kcase", kc.id, "in");
    return kc;
  }
  function normWS(t) { return String(t || "").replace(/\s+/g, " ").trim(); }
  /* زمینهٔ کاملِ نگه‌داشته را (یک‌بار) به صورتِ موقعیت بیفزا — وقتی پاسخ دیده شد */
  function releaseCtx(kc) {
    if (!kc || !kc.src || !kc.src.ctxHeld) return false;
    var it = kc.intake = kc.intake || {}; var q = (A.getProb && A.getProb(kc.src.pid) || { stages: [] }).stages.filter(function (x) { return x.id === kc.src.sid; })[0];
    it.statement = "زمینهٔ کامل (پس از دیدنِ پاسخ): " + kc.src.ctxHeld + "\n\n" + (it.statement || (q && q.q) || "");
    delete kc.src.ctxHeld; S.put(kc);
    var ta = document.getElementById("knStmt"); if (ta) ta.value = it.statement;
    return true;
  }
  A.probReleaseCtx = releaseCtx;
  A.probStuck = function (p, s, idx, getState) {
    if (!A.V.kcase || typeof A.knotNewCase !== "function") return null;
    return h("div", { class: "row gap wrap mv-stuckrow" },
      h("button", { class: "btn ghost sm mv-stuck", onclick: function () { stuck(p, s, idx, getState ? getState() : {}); } }, "🪢 این‌جا گیر کردم"),
      h("span", { class: "small muted" }, "یک موقعیتِ «گره‌گشا» با صورتِ همین گام ساخته می‌شود تا ریشهٔ گیرکردن را پیدا کنی؛ اگر پاسخ را هنوز ندیده‌ای، لو نمی‌رود."));
  };
  A.moveStuckCase = stuck;

  /* ---------- نمای «حرکت‌ها» ---------- */
  var TRANSFER = "دربارهٔ انتقال: پژوهش‌ها نشان می‌دهند یک راه‌حل که فقط در یک ظاهر دیده شده، به مسئلهٔ تازه کم منتقل می‌شود؛ ولی دیدنِ همان ساختار در چند مثالِ متفاوت و مقایسه‌شان انتقال را بهتر می‌کند (Gick & Holyoak 1983، انتقالِ قیاسی با چند مثال). پولیا (How to Solve It، ۱۹۴۵) همین حرکت‌ها را «اکتشافی» (heuristic) نامید: راهنمای جست‌وجو، نه دستورِ تضمینی. پس تشخیصِ یک حرکت در رشته‌های مختلف همان چیزی است که شواهد می‌گویند به انتقال کمک می‌کند — اما تمرین روی گام‌های تاریخیِ مسئله‌هایی که پاسخشان معلوم است، تضمین نمی‌کند مسئلهٔ بازِ تازه‌ای را حل کنی. این‌جا هم پاسخ‌ها از پیش معلوم‌اند و گزینه‌ها راهنمایی می‌کنند؛ مسئلهٔ واقعی چنین نیست.";
  function transferNote() {
    return h("details", { class: "card soft mv-transfer" }, h("summary", {}, h("strong", {}, "دربارهٔ انتقال (این تمرین چه می‌کند و چه نمی‌کند)")), h("p", { class: "small" }, TRANSFER),
      h("div", { class: "row gap wrap" }, A.techLink(43), A.techLink(6), A.techLink(17)));
  }
  A.V.moves = function (mvId) {
    if (mvId && A.MOVES[mvId]) return movePage(mvId);
    var root = h("div", { class: "page mv", dir: "rtl" });
    var tagged = allTagged(), ps = probs();
    root.appendChild(A.head("حلِ مسئله", "حرکت‌های حلِ مسئله",
      "۱۶ حرکتِ تکرارشونده در حلِ مسئله. هر حرکت را در گام‌های مسئله‌هایی که خودت وارد کرده‌ای ببین، بعد با «تمرینِ درهم» تشخیصش را بیازما: پیش از دیدنِ گزینه‌ها، اول بگو کدام حرکت این‌جا کار می‌کند.",
      h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm", onclick: function () { A.go("e_prob"); } }, "🧗 مسئله‌های بزرگ"))));
    root.appendChild(transferNote());
    /* حرکت‌ها فقط از مسئله‌هایی پر می‌شوند که خودِ مالک وارد کرده (۲۰۲۶-۱۰-۱۳)؛ نمونه‌های آمادهٔ سازنده فقط با گزینهٔ تنظیمات */
    if (!ps.length) root.appendChild(h("section", { class: "card mv-empty", dir: "rtl" }, h("h2", {}, "هنوز مسئله‌ای وارد نکرده‌ای"),
      h("p", {}, "این صفحه گام‌های مسئله‌هایی را که خودت آورده‌ای بر اساسِ «حرکتِ قاطعِ» هر گام کنار هم می‌گذارد و تمرینِ درهم را از همان‌ها می‌سازد. با اولین مسئلهٔ تأییدشده (از «مسئله‌های بزرگ» یا «شبیه‌سازِ همین مسئله» در گره‌گشا) پر می‌شود."),
      h("div", { class: "row gap wrap" }, h("button", { class: "btn", onclick: function () { A.go("e_prob", null, "inject"); } }, "افزودنِ مسئلهٔ تو")),
      A.samplesNote ? A.samplesNote("گام‌های «۱۳ مسئلهٔ آماده»ای که سازنده نوشته") : null));
    root.appendChild(h("p", { class: "small muted" }, fa(tagged.length) + " گام از " + fa(ps.length) + " مسئله برچسبِ حرکت دارند" + (A.showSamples && A.showSamples() ? " (با نمونه‌های آمادهٔ سازنده)" : " (فقط مسئله‌های خودت)") + "."));
    root.appendChild(h("div", { class: "mv-grid" }, MOVES.map(function (m) {
      var st = A.moveStages(m.id), np = {}; st.forEach(function (x) { np[x.p.id] = 1; });
      return h("section", { class: "card mv-card", style: { "--pc": "var(--p" + (m.n % 9) + ")" }, "data-mv": m.id },
        h("h2", {}, h("button", { class: "linkish", onclick: function () { A.go("move", m.id); } }, "🧗 " + m.fa)),
        h("p", { class: "small" }, m.d),
        h("div", { class: "row gap wrap small" }, h("span", { class: "chip mv-count" }, fa(st.length) + " گام · " + fa(Object.keys(np).length) + " مسئله"),
          h("span", { class: "chip mv-acc" }, "دقتِ تشخیص: " + accText(m.id))));
    })));
    var un = [];
    ps.forEach(function (p) { (p.stages || []).forEach(function (s, i) { if (!A.stageMoves(p, s).length) un.push({ p: p, s: s, i: i, why: (A.MOVE_UNTAGGED[p.id] || {})[s.id] }); }); });
    if (un.length) root.appendChild(h("details", { class: "card soft mv-untagged" }, h("summary", {}, "گام‌های بی‌برچسب (" + fa(un.length) + ") — و چرا"),
      h("p", { class: "small muted" }, "این گام‌ها عمداً برچسب نگرفته‌اند: حرکتِ قاطعشان داوری، وارسی، انتشار یا پذیرش است، نه یکی از ۱۶ حرکتِ حل. برچسبِ زورکی تشخیص را خراب می‌کرد."),
      h("ul", { class: "small" }, un.map(function (x) { return h("li", {}, h("button", { class: "linkish", onclick: function () { A.go("e_prob", x.p.id, "sim:" + x.s.id); } }, x.p.title + " · گامِ " + fa(x.i + 1)), x.why ? " — " + x.why : ""); }))));
    return root;
  };
  A.V.move = function (mvId) { return A.MOVES[mvId] ? movePage(mvId) : A.V.moves(); };

  function stageCard(x, cur) {
    var others = x.mv.filter(function (t) { return t !== cur; });
    return h("article", { class: "card mv-stage", "data-pid": x.p.id, "data-sid": x.s.id },
      h("div", { class: "row between wrap gap" }, h("button", { class: "linkish", onclick: function () { A.go("e_prob", x.p.id, "about"); } }, h("strong", {}, x.p.title)), h("span", { class: "chip" }, x.p.field || "")),
      h("div", { class: "small muted", dir: "rtl" }, "گامِ " + fa(x.i + 1), yrWho(x.s, " · ")),
      h("p", { class: "small" }, x.s.ctx || ""), h("p", {}, h("strong", {}, x.s.q || "")),
      others.length ? h("div", { class: "row gap wrap small" }, h("span", { class: "muted" }, "همراه با: "), others.map(function (t) { return mvLink(t); })) : null,
      h("div", { class: "row gap wrap" }, h("button", { class: "btn sm mv-try", onclick: function () { A.go("e_prob", x.p.id, "sim:" + x.s.id); } }, "تمرین کن ←")));
  }
  function movePage(id) {
    var m = A.MOVES[id], st = A.moveStages(id);
    var root = h("div", { class: "page mv", dir: "rtl" });
    root.appendChild(A.head("حرکت‌های حلِ مسئله", "🧗 " + m.fa, m.d, h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm", onclick: function () { A.go("moves"); } }, "← همهٔ حرکت‌ها"))));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "کِی به این حرکت شک کنی"), h("ul", {}, m.sig.map(function (x) { return h("li", {}, x); })),
      m.lit ? h("p", { class: "small muted" }, "در ادبیاتِ حلِ مسئله: " + m.lit) : null));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "تکنیک‌های مرتبط"), h("ul", { class: "plain mv-techs" }, m.tech.map(function (t) { return h("li", {}, A.techLink(t[0]), h("span", { class: "small" }, " — " + t[1])); }))));
    var np = {}; st.forEach(function (x) { np[x.p.id] = x.p; });
    var fields = {}; st.forEach(function (x) { fields[x.p.field || "—"] = 1; });
    root.appendChild(h("section", { class: "card mv-acccard" }, h("h2", {}, "دقتِ تشخیصِ حرکت"),
      h("p", { class: "mv-accval", "data-mv": id }, accText(id)), h("p", { class: "small muted" }, "یعنی از گام‌هایی که این حرکت حرکتِ (یکی از حرکت‌های) آن‌ها بود، در پرسشِ «کدام حرکت؟» چند بار درست تشخیص دادی.")));
    root.appendChild(practiceSection(id, st));
    root.appendChild(h("section", { class: "col gap" }, h("h2", {}, "کجا قاطع بود — " + fa(st.length) + " گام در " + fa(Object.keys(np).length) + " مسئله (" + fa(Object.keys(fields).length) + " رشته)"),
      st.length ? st.map(function (x) { return stageCard(x, id); }) : A.empty("هنوز گامی با این حرکت برچسب نخورده است.")));
    root.appendChild(transferNote());
    return root;
  }

  /* ---------- تمرینِ درهم ---------- */
  var SESS = null;
  function byProblemRR(list, n) {   // نوبت‌چرخشی میانِ مسئله‌ها تا گام‌ها از مسئله‌های متفاوت بیایند
    var g = {}, order = [];
    A.shuffle(list.slice()).forEach(function (x) { if (!g[x.p.id]) { g[x.p.id] = []; order.push(x.p.id); } g[x.p.id].push(x); });
    var out = [];
    while (out.length < n) { var any = false; order.forEach(function (pid) { if (out.length < n && g[pid].length) { out.push(g[pid].shift()); any = true; } }); if (!any) break; }
    return out;
  }
  function buildSession(mv) {
    var own = byProblemRR(A.moveStages(mv), 8);
    var others = byProblemRR(allTagged().filter(function (x) { return x.mv.indexOf(mv) < 0; }), own.length >= 5 ? 3 : 2);
    var items = A.shuffle(own.concat(others)).map(function (x) {
      var pool = A.MOVE_IDS.filter(function (t) { return x.mv.indexOf(t) < 0; });
      var dis = [];
      if (x.mv.indexOf(mv) < 0) dis.push(mv);   // در گام‌های «حرکتِ دیگر»، خودِ حرکتِ هدف گزینهٔ فریبنده است ⇒ تمایز، نه حدس
      A.shuffle(pool).forEach(function (t) { if (dis.length + x.mv.length < 4 && dis.indexOf(t) < 0) dis.push(t); });
      return { p: x.p, s: x.s, i: x.i, mv: x.mv, choices: A.shuffle(x.mv.concat(dis).slice(0, 4)) };
    });
    return { mv: mv, items: items, k: 0, phase: "move", score: 0, ans: [] };
  }
  function practiceSection(mv, st) {
    var sec = h("section", { class: "card mv-practice", id: "mvPractice", "aria-live": "polite" });
    function draw() {
      sec.innerHTML = "";
      sec.appendChild(h("h2", { tabindex: "-1", class: "mv-ph" }, "تمرینِ درهم"));
      if (!SESS || SESS.mv !== mv) {
        sec.appendChild(h("p", { class: "small" }, "تا ۸ گام که این حرکت در آن‌ها قاطع بود، از مسئله‌های مختلف، درهم با ۲ تا ۳ گام که حرکتِ دیگری می‌خواستند. در هر گام اول می‌پرسیم «کدام حرکت این‌جا کار می‌کند؟» (از ۴ گزینه) و بعد گزینه‌های خودِ گام را."));
        if (st.length < 5) sec.appendChild(h("p", { class: "small muted" }, "این حرکت فعلاً فقط در " + fa(st.length) + " گام برچسب خورده؛ تمرین کوتاه‌تر است."));
        sec.appendChild(h("button", { class: "btn mv-start", disabled: st.length ? null : true, onclick: function () { SESS = buildSession(mv); draw(); focusHead(); } }, "شروعِ تمرینِ درهم"));
        return;
      }
      var S2 = SESS;
      if (S2.k >= S2.items.length) {
        sec.appendChild(h("p", {}, "پایان: حرکت را در " + fa(S2.score) + " از " + fa(S2.items.length) + " گام درست تشخیص دادی."));
        sec.appendChild(h("ul", { class: "small" }, S2.ans.map(function (a) { return h("li", { class: a.ok ? "good" : "bad" }, (a.ok ? "✓ " : "✗ ") + a.title + " — درست: " + a.right.map(mvName).join(" یا ") + (a.ok ? "" : " · تو: " + mvName(a.pick))); })));
        sec.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn", onclick: function () { SESS = buildSession(mv); draw(); focusHead(); } }, "دوباره (ترکیبِ تازه)"), h("button", { class: "btn ghost", onclick: function () { SESS = null; draw(); } }, "بستن")));
        return;
      }
      var it = S2.items[S2.k];
      sec.appendChild(h("div", { class: "row between wrap gap small muted" }, h("span", {}, "پرسشِ " + fa(S2.k + 1) + " از " + fa(S2.items.length)), h("span", {}, "تشخیصِ درست تا این‌جا: " + fa(S2.score))));
      var card = h("div", { class: "mv-item" });
      card.appendChild(h("div", { class: "row between wrap gap" }, h("strong", {}, it.p.title), h("span", { class: "chip" }, it.p.field || "")));
      card.appendChild(h("div", { class: "small muted", dir: "rtl" }, yrWho(it.s, "")));
      card.appendChild(h("p", {}, h("strong", {}, "وضعِ دانش: "), it.s.ctx || ""));
      card.appendChild(h("h3", {}, it.s.q || ""));
      sec.appendChild(card);
      var q1 = h("fieldset", { class: "mv-q1" }, h("legend", {}, "کدام حرکت این‌جا کار می‌کند؟"));
      var fb1 = h("div", { class: "dfb" });
      var bs = h("div", { class: "dopts mv-opts pb-opts" }, it.choices.map(function (c) {
        return h("button", { class: "dopt mv-opt", "data-mv": c, disabled: S2.phase !== "move" ? true : null, onclick: function () {
          if (S2.phase !== "move") return;
          var ok = it.mv.indexOf(c) >= 0; S2.phase = "stage"; if (ok) S2.score++;
          S2.ans.push({ title: it.p.title + " · گامِ " + fa(it.i + 1), right: it.mv, pick: c, ok: ok });
          record(it, c, ok);
          Array.prototype.forEach.call(bs.children, function (b) { b.disabled = true; var v = b.getAttribute("data-mv"); if (it.mv.indexOf(v) >= 0) b.classList.add("right"); else if (v === c) b.classList.add("wrong"); });
          fb1.appendChild(h("div", { class: ok ? "good" : "bad" }, ok ? "درست." : "نه."));
          fb1.appendChild(h("div", { class: "small" }, "حرکتِ این گام: ", it.mv.map(function (t) { return h("span", {}, mvLink(t), " "); }), it.mv.length > 1 ? h("span", { class: "muted" }, "(هر دو پذیرفته است)") : null));
          stagePart(); var f = sec.querySelector(".mv-q2 legend"); if (f) { f.setAttribute("tabindex", "-1"); f.focus(); }
        } }, h("b", {}, A.MOVES[c].fa), h("span", { class: "small muted mv-od" }, A.MOVES[c].d));
      }));
      q1.appendChild(bs); q1.appendChild(fb1); sec.appendChild(q1);
      var q2 = h("fieldset", { class: "mv-q2" + (S2.phase === "move" ? " hidden" : "") }, h("legend", {}, "حالا خودِ گام: حرکتِ بعدی کدام است؟"));
      sec.appendChild(q2);
      function stagePart() {
        q2.classList.remove("hidden"); q2.innerHTML = ""; q2.appendChild(h("legend", {}, "حالا خودِ گام: حرکتِ بعدی کدام است؟"));
        var ord = A.shuffle((it.s.opts || []).map(function (_, j) { return j; })), fb2 = h("div", { class: "dfb" });
        var os = h("div", { class: "dopts pb-opts" }, ord.map(function (j) { var o = it.s.opts[j]; return h("button", { class: "dopt mv-sopt", onclick: function (e) {
          var b = e.currentTarget; if (b.disabled) return; b.disabled = true; b.classList.add(o.ok ? "right" : "wrong");
          fb2.appendChild(h("div", { class: "small " + (o.ok ? "good" : "bad") }, (o.ok ? "درست: " : "نه: ") + (o.why || "") + (o.hist ? " — " + o.hist : "")));
          if (o.ok) {
            Array.prototype.forEach.call(os.children, function (x) { x.disabled = true; });
            fb2.appendChild(h("div", { class: "card soft" }, h("p", {}, h("strong", {}, "حرکتِ واقعی: "), it.s.move || ""), h("p", {}, h("strong", {}, "ایدهٔ ساده: "), it.s.idea || "")));
            fb2.appendChild(h("button", { class: "btn mv-next", onclick: function () { S2.k++; S2.phase = "move"; draw(); focusHead(); } }, S2.k + 1 < S2.items.length ? "بعدی" : "پایان"));
          }
        } }, o.t); }));
        q2.appendChild(os); q2.appendChild(fb2);
      }
      if (S2.phase === "stage") { // بازسازی پس از رندر دوباره (مثلاً برگشت به صفحه)
        Array.prototype.forEach.call(bs.children, function (b) { var v = b.getAttribute("data-mv"); if (it.mv.indexOf(v) >= 0) b.classList.add("right"); });
        stagePart();
      }
    }
    function focusHead() { var x = sec.querySelector(".mv-ph"); if (x) try { x.focus({ preventScroll: false }); } catch (e) { } }
    draw();
    return sec;
  }
  A.moveSession = function () { return SESS; };
  A.moveBuildSession = buildSession;

  /* ---------- پیوند به پوسته: منو، ردِ پا، سامانه ---------- */
  if (A.NAV_PARENT) A.NAV_PARENT.move = "moves";
  if (A.EPI_NAV) { var at = -1; A.EPI_NAV.forEach(function (n, i) { if (n[0] === "e_prob") at = i; }); if (at >= 0 && !A.EPI_NAV.some(function (n) { return n[0] === "moves"; })) A.EPI_NAV.splice(at + 1, 0, ["moves", "🧗 حرکت‌های حلِ مسئله", "یک حرکت را در مسئله‌های رشته‌های مختلف ببین و تشخیصش را تمرین کن"]); }
  /* «مسئله‌های بزرگ» و «حرکت‌ها» در هر دو منو هستند: در همان سامانه‌ای می‌مانند که از آن آمدی */
  var rawSys = A.sysOf;
  A.sysOf = function (v) { if (v === "e_prob" || v === "moves" || v === "move") return A.lastSys || (v === "e_prob" ? "epi" : "learn"); return rawSys(v); };
  var rawRender = A.render;
  A.render = function () {
    rawRender.apply(this, arguments);
    try {
      if (A.state.view === "move") {
        document.querySelectorAll('.nav[data-v="moves"]').forEach(function (b) { b.classList.add("on"); });
        var m = document.getElementById("main"); if (m) m.setAttribute("data-report-section-label", "حرکتِ حلِ مسئله");
      }
    } catch (e) { console.error(e); }
  };
  /* موقعیتی که از «گیر کردم» آمده: راهِ برگشت به همان گام، و پوشاندنِ پاسخ تا وقتی ندیده‌ای (بی‌ویرایشِ a16) */
  var rawK = A.V.kcase;
  if (rawK) A.V.kcase = function (id) {
    var root = rawK.apply(this, arguments);
    try {
      var kc = id && S.get(id), src = kc && kc.src;
      if (src && src.type === "eprob" && root && root.querySelector) {
        var p = A.getProb ? A.getProb(src.pid) : null, idx = -1;
        if (p) p.stages.forEach(function (s, i) { if (s.id === src.sid) idx = i; });
        var sec = h("section", { class: "card soft mv-kback", dir: "rtl" }, h("p", { class: "small" }, "این موقعیت از «مسئله‌های بزرگ» آمده است: ", h("b", {}, p ? p.title + (idx >= 0 ? " · گامِ " + fa(idx + 1) : "") : "مسئله‌ای که دیگر در دسترس نیست"), "."),
          p ? h("button", { class: "btn ghost sm mv-kback-go", onclick: function () { A.go("e_prob", src.pid, "sim:" + src.sid); } }, "🧗 برگشت به همان گام در شبیه‌ساز") : null);
        var hd = root.querySelector(".phead"); if (hd && hd.parentNode) hd.parentNode.insertBefore(sec, hd.nextSibling); else root.insertBefore(sec, root.firstChild);
        if (src.ctxHeld && (kc.intake || {}).seen === "yes") releaseCtx(kc);
        var ans = root.querySelector("#knAns");
        if (ans && (kc.intake || {}).seen !== "yes") {
          ans.classList.add("mv-masked"); ans.setAttribute("aria-describedby", "mvAnsNote");
          var show = h("button", { type: "button", class: "btn ghost sm mv-unmask", onclick: function () { ans.classList.remove("mv-masked"); show.remove(); var k2 = S.get(id); if (releaseCtx(k2)) { var t2 = root.querySelector("#knStmt"); if (t2) t2.value = k2.intake.statement; } note.textContent = "پاسخ نمایش داده شد. اگر حالا آن را دیده‌ای، «پاسخ/راه‌حل را دیده‌ای؟» را به «بله» تغییر بده."; } }, "نمایشِ پاسخ (لو می‌دهد)");
          var note = h("div", { class: "fhint", id: "mvAnsNote" }, "پاسخ پوشیده است چون هنوز در شبیه‌ساز آن را ندیده‌ای؛ نردبانِ راهنمایی فقط برای این‌که چیزی لو نرود از آن استفاده می‌کند.");
          ans.parentNode.insertBefore(h("div", { class: "row gap wrap" }, show), ans.nextSibling); ans.parentNode.appendChild(note);
        }
      }
    } catch (e) { console.error(e); }
    return root;
  };
})(APP);
