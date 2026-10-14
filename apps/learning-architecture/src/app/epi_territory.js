/* ===== نقشهٔ قلمروِ معرفت‌شناسی (مالک ۲۰۲۶-۱۰-۱۴) =====
   مالک: «تشخیص دهد در علمِ معرفت‌شناسی چه دروازه‌ها و حوزه‌هایی هست و به همه رسوخ کند و قلمروش را بر پایهٔ بدیهیاتِ قطعی گسترش دهد …
   نقشه ناقص نباشد، کامل و جامع … در هر حوزه دقیقاً پیشرفت کند و روندش در جزوه‌ها و مستندات ثبت شود».
   این فایل فقط «نقشه» است (ثابت، از منابعِ معتبر گردآوری‌شده — `sources`). پیشرفتِ هر حوزه در `backtest/territory.json` است و فقط
   ابزارِ قطعیِ `tools/epi_backtest.js territory` آن را جلو می‌برد (هر گام با شاهد؛ گامِ آخر را خودِ ابزار با وقایعِ تازه تأیید می‌کند).
   `book`: بخش‌هایی از جزوهٔ مصباح که این حوزه را پوشش می‌دهند (قاعده‌های کارخانه روی همین بخش‌ها نشسته‌اند). */
(function (W) {
  var T = W.EPI_TERR = W.EPI_TERR || {};
  T.STAGES = [
    { n: 0, fa: "نقشه‌شده", need: "در نقشه هست؛ هنوز کاری نشده" },
    { n: 1, fa: "منابع خوانده شد", need: "دست‌کم دو منبعِ معتبرِ واقعی (عنوان + پیوند/ارجاع) که خوانده شد" },
    { n: 2, fa: "گزاره‌ها فهرست شد", need: "دست‌کم سه گزاره/ملاکِ محوریِ حوزه (آنچه می‌گوید کِی باور موجه است)" },
    { n: 3, fa: "رده‌بندی بر پایهٔ بدیهیات", need: "هر گزاره یکی از سه: قضیه (برهان از اصولِ ثابت) · قضیه × مقدارِ پایهٔ سنجیدنی · بیرون از قلمروِ قطعی (با دلیل)" },
    { n: 4, fa: "قاعده یا مرز", need: "برای گزاره‌های قضیه‌ای: قاعدهٔ کارخانه (موجود یا پیشنهادِ ثبت‌شده)؛ اگر همه بیرون‌اند: مرزِ ثبت‌شده" },
    { n: 5, fa: "تثبیت‌شده", need: "خودِ ابزار: دست‌کم ۳ واقعهٔ تازه که قاعده‌های این حوزه را به کار انداختند، همه درست" }
  ];
  /* نقشه: ۱۴ گروه، ۱۰۸ حوزه — گردآوری‌شده (۲۰۲۶-۱۰-۱۴) از فهرستِ مدخل‌های دانشنامهٔ استنفورد (SEP) و IEP، فهرستِ ۷۸ فصلِ
     Routledge Companion to Epistemology، کتاب‌های درسیِ Audi و Pritchard، منابعِ معرفت‌شناسیِ صوری/اجتماعی/کاربردی، و سنتِ اسلامی
     (مصباح، «آموزش فلسفه»). نشانی‌های SEP یکی‌یکی وارسی شد. حوزه‌های کم‌منبع (src کوتاه) را ناظر در گامِ ۱ با منابعِ بیشتر می‌خواند. */
  T.sources = [
 {
  "tag": "SEP",
  "title": "Stanford Encyclopedia of Philosophy — 'Epistemology' (Steup & Neta) and linked/related epistemology entries",
  "url": "https://plato.stanford.edu/entries/epistemology/"
 },
 {
  "tag": "SEP-toc",
  "title": "Stanford Encyclopedia of Philosophy — Table of Contents (epistemology-related entries)",
  "url": "https://plato.stanford.edu/contents.html"
 },
 {
  "tag": "RCE",
  "title": "Bernecker & Pritchard (eds.), The Routledge Companion to Epistemology (2011), 78 chapters in 10 parts",
  "url": "https://www.routledge.com/9780415722698"
 },
 {
  "tag": "Audi",
  "title": "Robert Audi, Epistemology: A Contemporary Introduction to the Theory of Knowledge (2nd/3rd ed., Routledge), chs. 1–10",
  "url": "https://www.cs.rutgers.edu/~biglars/epis.pdf"
 },
 {
  "tag": "Pritchard",
  "title": "Duncan Pritchard, What is this thing called Knowledge? (4th ed. 2018 adds applied chapters: technology, education, law, politics; 5th ed. adds social-epistemology part)",
  "url": "https://www.bookshare.org/browse/book/2005787"
 },
 {
  "tag": "IEP",
  "title": "Internet Encyclopedia of Philosophy — 'Epistemology' entry and the Epistemology category (85 articles)",
  "url": "https://iep.utm.edu/category/s-l-m/epistemology/"
 },
 {
  "tag": "FakeNews",
  "title": "Bernecker, Flowerree & Grundmann (eds.), The Epistemology of Fake News (Oxford UP, 2021)",
  "url": "https://academic.oup.com/book/39398"
 },
 {
  "tag": "W&O",
  "title": "Weatherall & O'Connor, 'Fake News and Misinformation' (PhilSci Archive)",
  "url": "https://philsci-archive.pitt.edu/22510/1/Fake_News_and_Misinformation.pdf"
 },
 {
  "tag": "Goldman1991",
  "title": "Alvin Goldman, 'Epistemic Paternalism: Communication Control in Law and Society', Journal of Philosophy 88 (1991)",
  "url": "https://doi.org/10.2307/2026906"
 },
 {
  "tag": "Friedman2020",
  "title": "Jane Friedman, 'The Epistemic and the Zetetic', Philosophical Review 129 (2020)",
  "url": "https://doi.org/10.1215/00318108-8311261"
 },
 {
  "tag": "Mesbah",
  "title": "محمدتقی مصباح یزدی، «آموزش فلسفه»، جلد ۱، بخش دوم: شناخت‌شناسی (درس‌های ۱۱–۲۰)",
  "url": "https://fidibo.com/book/162293-آموزش-فلسفه-جلد-اول"
 },
 {
  "tag": "SEP-ArabicMind",
  "title": "SEP — 'Arabic and Islamic Philosophy of Mind' / 'Ibn Sina [Avicenna]'",
  "url": "https://plato.stanford.edu/entries/arabic-islamic-mind/"
 },
 {
  "tag": "Emadzadeh",
  "title": "حسین عمادزاده، مقاله دربارهٔ اعتبار شهود عرفانی در معرفت‌شناسی حکمت متعالیه (ensani.ir)",
  "url": "https://ensani.ir/fa/article/author/50703"
 },
 {
  "tag": "Wikifeqh",
  "title": "دانشنامهٔ ویکی‌فقه — «معرفت دینی»",
  "url": "https://fa.wikifeqh.ir/معرفت_دینی"
 }
];
  T.groups = [
 {
  "id": "g_foundational_concepts",
  "fa": "مفاهیم بنیادین و عقلانیت",
  "en": "Foundational Concepts and Rationality",
  "areas": [
   {
    "id": "a_truth",
    "fa": "صدق",
    "en": "Truth",
    "desc_fa": "نسبت صدق با معرفت و باور را بررسی می‌کند و می‌پرسد صدق چیست و چرا هدف یا معیار باور است.",
    "key_questions_fa": [
     "آیا صدق شرط لازم معرفت است؟",
     "کدام نظریهٔ صدق (مطابقت، انسجام، عمل‌گرایانه، کاهشی) با معرفت‌شناسی سازگارتر است؟",
     "آیا صدق تنها ارزش بنیادین معرفتی است؟"
    ],
    "src": [
     "RCE ch.1",
     "SEP truth",
     "IEP"
    ],
    "book": [
     "s6",
     "s38"
    ]
   },
   {
    "id": "a_belief",
    "fa": "باور",
    "en": "Belief",
    "desc_fa": "ماهیت باور، هدف آن و نسبت آن با پذیرش، ایمان و حالت‌های هم‌خانواده را بررسی می‌کند.",
    "key_questions_fa": [
     "باور چیست و چه تفاوتی با پذیرش (acceptance) و فرض دارد؟",
     "آیا باور ذاتاً «معطوف به صدق» است؟",
     "باور تمام‌عیار چه نسبتی با درجات باور دارد؟"
    ],
    "src": [
     "RCE ch.2",
     "SEP belief",
     "IEP Belief, Aim of"
    ]
   },
   {
    "id": "a_evidence",
    "fa": "شاهد و قرینه",
    "en": "Evidence",
    "desc_fa": "می‌پرسد شاهد چیست، چه چیزی جزو شواهد یک فاعل است و شاهد چگونه از باور پشتیبانی می‌کند.",
    "key_questions_fa": [
     "شواهد ما حالات ذهنی‌اند یا گزاره‌ها یا واقعیت‌ها؟",
     "آیا شاهد ما همان معرفت ماست (E=K)؟",
     "«پشتیبانی شاهد» از باور را چگونه باید سنجید؟"
    ],
    "src": [
     "RCE ch.6",
     "SEP evidence",
     "IEP Evidence"
    ]
   },
   {
    "id": "a_epistemic_rationality",
    "fa": "عقلانیت معرفتی",
    "en": "Epistemic Rationality",
    "desc_fa": "معیارهای عقلانی بودن باور و استدلال را، در برابر عقلانیت عملی و ابزاری و عقلانیت ساختاری (انسجامی)، بررسی می‌کند.",
    "key_questions_fa": [
     "عقلانیت معرفتی چه تفاوتی با توجیه و با عقلانیت عملی دارد؟",
     "آیا الزامات انسجام (ساختاری) هنجاری‌اند؟",
     "عقلانیت محدود انسان‌ها چه پیامدی برای هنجارهای معرفتی دارد؟"
    ],
    "src": [
     "RCE ch.4",
     "SEP rationality-structural",
     "SEP rationality-instrumental",
     "SEP bounded rationality"
    ]
   },
   {
    "id": "a_epistemic_norms",
    "fa": "هنجارهای معرفتی",
    "en": "Epistemic Norms",
    "desc_fa": "هنجارهای حاکم بر باور، ادعا و عمل (مانند هنجار معرفت برای اظهار) و منشأ هنجاری بودن آن‌ها را بررسی می‌کند.",
    "key_questions_fa": [
     "چه هنجاری بر اظهار و ادعا حاکم است: معرفت، باور موجه یا صدق؟",
     "آیا عمل بر پایهٔ یک گزاره مستلزم دانستن آن است؟",
     "منشأ الزام‌آور بودن هنجارهای معرفتی چیست؟"
    ],
    "src": [
     "RCE ch.5",
     "IEP Knowledge Norms"
    ]
   },
   {
    "id": "a_certainty",
    "fa": "یقین و مراتب آن",
    "en": "Certainty",
    "desc_fa": "انواع یقین (روان‌شناختی و معرفتی)، نسبت یقین با معرفت و امکان دستیابی به آن را بررسی می‌کند.",
    "key_questions_fa": [
     "یقین معرفتی چیست و چه تفاوتی با اطمینان روانی دارد؟",
     "آیا معرفت مستلزم یقین است؟",
     "آیا اصلاً گزاره‌ای یقینی وجود دارد؟"
    ],
    "src": [
     "SEP certainty",
     "IEP Certainty"
    ],
    "book": [
     "s39",
     "s40"
    ]
   },
   {
    "id": "a_higher_order_evidence",
    "fa": "شاهد مرتبهٔ بالاتر و تردید در خود",
    "en": "Higher-Order Evidence and Epistemic Self-Doubt",
    "desc_fa": "می‌پرسد شواهدی دربارهٔ اعتمادپذیری داوری خودمان (خستگی، سوگیری، مخالفت دیگران) چگونه باید باورهای مرتبهٔ اول را تغییر دهد.",
    "key_questions_fa": [
     "آیا شاهد مرتبهٔ بالاتر می‌تواند توجیه مرتبهٔ اول را از میان ببرد؟",
     "وقتی به توانایی‌های خود شک داریم، عقلانی است به آن‌ها اعتماد کنیم؟",
     "آیا ممکن است عقلانیت ما را به «ناهمخوانی میان مراتب» وادارد؟"
    ],
    "src": [
     "SEP higher-order-evidence",
     "SEP epistemic-self-doubt"
    ]
   }
  ]
 },
 {
  "id": "g_nature_of_knowledge",
  "fa": "ماهیت و تحلیل معرفت",
  "en": "The Nature and Analysis of Knowledge",
  "areas": [
   {
    "id": "a_kinds_of_knowledge",
    "fa": "انواع معرفت",
    "en": "Varieties of Knowledge and Cognitive Success",
    "desc_fa": "انواع معرفت (گزاره‌ای، مهارتی، آشنایی) و گونه‌های دیگر موفقیت شناختی را از هم تمییز می‌دهد.",
    "key_questions_fa": [
     "چه گونه‌هایی از موفقیت شناختی وجود دارد؟",
     "آیا معرفت گزاره‌ای بنیادی‌ترین نوع معرفت است؟",
     "چه چیزهایی می‌توانند حامل موفقیت معرفتی باشند: باور، فرد، گروه یا نهاد؟"
    ],
    "src": [
     "SEP epistemology §1–2",
     "IEP Epistemology §1"
    ],
    "book": [
     "s8",
     "s9",
     "s11"
    ]
   },
   {
    "id": "a_tripartite_analysis",
    "fa": "تحلیل سنتی معرفت (باور صادق موجه)",
    "en": "The Traditional (JTB) Analysis of Knowledge",
    "desc_fa": "تلاش برای تعریف معرفت گزاره‌ای بر حسب شرایط لازم و کافی، به‌ویژه تعریف سه‌جزئی «باور صادق موجه».",
    "key_questions_fa": [
     "آیا معرفت قابل تحلیل به شرایط لازم و کافی است؟",
     "آیا باور، صدق و توجیه هر سه برای معرفت لازم‌اند؟",
     "تحلیل معرفت چه هدفی را دنبال می‌کند؟"
    ],
    "src": [
     "SEP knowledge-analysis",
     "IEP Knowledge",
     "Audi ch.8",
     "Pritchard"
    ]
   },
   {
    "id": "a_gettier_problem",
    "fa": "مسئلهٔ گتیه",
    "en": "The Gettier Problem",
    "desc_fa": "موارد گتیه را بررسی می‌کند که در آن‌ها باور صادق موجه به‌سبب بخت معرفت نیست، و راه‌حل‌های پیشنهادی (شرط نفی باور کاذب، نظریهٔ علّی و…) را می‌سنجد.",
    "key_questions_fa": [
     "چرا باور صادق موجه در موارد گتیه معرفت نیست؟",
     "آیا شرط چهارمی می‌تواند مسئله را حل کند؟",
     "آیا مسئلهٔ گتیه اساساً حل‌شدنی است؟"
    ],
    "src": [
     "RCE ch.12",
     "IEP Gettier Problems",
     "SEP knowledge-analysis"
    ]
   },
   {
    "id": "a_defeasibility_theory",
    "fa": "نظریهٔ شکست‌پذیری معرفت",
    "en": "Defeasibility Theory of Knowledge",
    "desc_fa": "معرفت را باور صادق موجهی می‌داند که هیچ حقیقتِ ناقضی (شکننده‌ای) توجیه آن را از میان نبرد؛ و انواع ناقض‌ها را بررسی می‌کند.",
    "key_questions_fa": [
     "شکنندهٔ (ناقض) گمراه‌کننده با شکنندهٔ واقعی چه تفاوتی دارد؟",
     "آیا شرط «نبودِ ناقض» مسئلهٔ گتیه را حل می‌کند؟"
    ],
    "src": [
     "RCE ch.15",
     "IEP Gettier Problems §ii"
    ]
   },
   {
    "id": "a_modal_anti_luck",
    "fa": "شرایط موجهاتی و معرفت‌شناسی ضدِبخت",
    "en": "Modal and Anti-Luck Epistemology (Safety, Sensitivity)",
    "desc_fa": "شرایط موجهاتیِ معرفت مانند حساسیت و ایمنی را برای کنار گذاشتن بخت معرفتی بررسی می‌کند.",
    "key_questions_fa": [
     "بخت معرفتی چیست و کدام انواع آن با معرفت ناسازگار است؟",
     "شرط ایمنی بهتر است یا شرط حساسیت؟",
     "آیا معرفت باید هم ضدِبخت و هم مبتنی بر توانایی باشد؟"
    ],
    "src": [
     "RCE ch.18",
     "IEP The Safety Condition for Knowledge",
     "IEP Epistemic Luck"
    ]
   },
   {
    "id": "a_fallibilism",
    "fa": "خطاپذیری‌گرایی",
    "en": "Fallibilism",
    "desc_fa": "این دیدگاه را بررسی می‌کند که معرفت با امکان خطا سازگار است، و تنش آن با شهودهایی مانند «می‌دانم p اما ممکن است p نباشد».",
    "key_questions_fa": [
     "آیا می‌توان چیزی را دانست بی‌آنکه شاهد ما صدق آن را تضمین کند؟",
     "چرا جملهٔ «می‌دانم p، ولی شاید p نباشد» ناهنجار است؟",
     "آیا خطاناپذیری‌گرایی به شک‌گرایی می‌انجامد؟"
    ],
    "src": [
     "RCE ch.13",
     "IEP Fallibilism"
    ]
   },
   {
    "id": "a_knowledge_first",
    "fa": "معرفت‌شناسی معرفت‌محور",
    "en": "Knowledge-First Epistemology",
    "desc_fa": "معرفت را مفهومی بنیادین و تحلیل‌ناپذیر می‌گیرد و باور، شاهد و توجیه را برحسب آن تبیین می‌کند.",
    "key_questions_fa": [
     "آیا معرفت یک حالت ذهنی بنیادین است؟",
     "آیا می‌توان توجیه را برحسب معرفت تعریف کرد؟",
     "آیا شواهد ما همان معرفت ماست؟"
    ],
    "src": [
     "RCE ch.20",
     "IEP Knowledge-First Theories of Justification"
    ]
   },
   {
    "id": "a_knowledge_how",
    "fa": "دانستنِ چگونگی (معرفت مهارتی)",
    "en": "Knowledge-How",
    "desc_fa": "می‌پرسد دانستن اینکه چگونه کاری انجام شود نوعی توانایی است یا نوعی معرفت گزاره‌ای (عقل‌گرایی در برابر ضدعقل‌گرایی).",
    "key_questions_fa": [
     "آیا دانستنِ چگونگی به دانستنِ اینکه قابل تحویل است؟",
     "نسبت مهارت، توانایی و معرفت مهارتی چیست؟"
    ],
    "src": [
     "SEP knowledge-how",
     "SEP epistemology §2.2"
    ]
   },
   {
    "id": "a_acquaintance",
    "fa": "معرفت از راه آشنایی و از راه توصیف",
    "en": "Knowledge by Acquaintance and by Description",
    "desc_fa": "تمایز راسلیِ آشنایی مستقیم با اشیا و معرفت توصیفی، و نقش آشنایی در بنیاد معرفت را بررسی می‌کند.",
    "key_questions_fa": [
     "آشنایی مستقیم با چه چیزهایی ممکن است؟",
     "آیا آشنایی خودش معرفت است یا پایهٔ معرفت؟",
     "آیا معرفت به افراد به معرفت گزاره‌ای تحویل‌پذیر است؟"
    ],
    "src": [
     "SEP knowledge-acquaindescrip",
     "IEP Knowledge by Acquaintance and Knowledge by Description",
     "SEP epistemology §2.1"
    ],
    "book": [
     "s11"
    ]
   },
   {
    "id": "a_higher_order_knowledge",
    "fa": "معرفت مرتبهٔ دوم و اصل KK",
    "en": "Second-Order Knowledge and the KK Principle",
    "desc_fa": "می‌پرسد آیا دانستن مستلزم دانستنِ اینکه می‌دانیم است، و نقش شفافیت حالت‌های معرفتی چیست.",
    "key_questions_fa": [
     "آیا اگر بدانیم p، لزوماً می‌دانیم که می‌دانیم p؟",
     "استدلال‌های ویلیامسون علیه «درخشش» حالات معرفتی چه می‌گوید؟"
    ],
    "src": [
     "RCE ch.53",
     "IEP KK Principle"
    ]
   }
  ]
 },
 {
  "id": "g_justification",
  "fa": "توجیه: نظریه‌ها و ساختار",
  "en": "Justification: Theories and Structure",
  "areas": [
   {
    "id": "a_justification_concept",
    "fa": "مفهوم توجیه معرفتی",
    "en": "The Concept of Epistemic Justification",
    "desc_fa": "چیستی توجیه، تفاوت توجیه گزاره‌ای و باوری، و تلقی وظیفه‌گرایانه و غیروظیفه‌گرایانه از آن را بررسی می‌کند.",
    "key_questions_fa": [
     "توجیه معرفتی دقیقاً چیست؟",
     "توجیه گزاره‌ای و توجیه باوری چه تفاوتی دارند؟",
     "آیا توجیه مفهومی وظیفه‌گرایانه (ناظر به تکلیف) است؟"
    ],
    "src": [
     "RCE ch.3",
     "SEP epistemology §3",
     "IEP Justification, Epistemic"
    ]
   },
   {
    "id": "a_internalism_externalism",
    "fa": "درون‌گرایی و برون‌گرایی",
    "en": "Internalism and Externalism",
    "desc_fa": "می‌پرسد آیا عوامل توجیه‌کننده باید از درون برای فاعل در دسترس باشند (درون‌گرایی) یا می‌توانند بیرونی باشند (برون‌گرایی)؛ شامل مسئلهٔ «شیطان فریبکار جدید».",
    "key_questions_fa": [
     "آیا توجیه بر حالات ذهنی فاعل استوار (supervene) است؟",
     "آیا قربانی شیطان فریبکار به اندازهٔ ما موجه است؟",
     "آیا دسترسی بازتابی شرط توجیه است؟"
    ],
    "src": [
     "RCE ch.14",
     "SEP justep-intext",
     "IEP Internalism and Externalism in Epistemology",
     "IEP Evil Demon Problem, The New"
    ]
   },
   {
    "id": "a_evidentialism",
    "fa": "قرینه‌گرایی",
    "en": "Evidentialism",
    "desc_fa": "این نظریه را بررسی می‌کند که توجیه باور تنها به تناسب آن با شواهد فاعل بستگی دارد.",
    "key_questions_fa": [
     "آیا توجیه فقط تابع شواهد است؟",
     "آیا ملاحظات عملی می‌توانند دلیل باور باشند؟"
    ],
    "src": [
     "RCE ch.16",
     "IEP Evidentialism"
    ]
   },
   {
    "id": "a_reliabilism",
    "fa": "اعتمادگرایی",
    "en": "Reliabilism",
    "desc_fa": "توجیه یا معرفت را برحسب اعتمادپذیری فرایندهای باورساز تبیین می‌کند و مسائلی مانند «مسئلهٔ عام بودن» را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا باور موجه همان باور برآمده از فرایند اعتمادپذیر است؟",
     "مسئلهٔ عام بودن (generality) چگونه حل می‌شود؟",
     "اعتمادگرایی با مثال‌های کلرآوایان و شیطان فریبکار چه می‌کند؟"
    ],
    "src": [
     "RCE ch.17",
     "SEP reliabilism",
     "IEP Reliabilism"
    ]
   },
   {
    "id": "a_proper_functionalism",
    "fa": "کارکرد درست",
    "en": "Proper Functionalism",
    "desc_fa": "تضمین معرفتی را برحسب کارکرد درست قوای شناختی مطابق طرح، در محیط مناسب، تبیین می‌کند (پلانتینگا).",
    "key_questions_fa": [
     "آیا تضمین (warrant) همان کارکرد درست قواست؟",
     "«طرح» قوای شناختی از کجا می‌آید: تکامل یا خالق؟"
    ],
    "src": [
     "IEP Proper Functionalism"
    ]
   },
   {
    "id": "a_conservatism",
    "fa": "محافظه‌کاری پدیداری و محافظه‌کاری باوری",
    "en": "Phenomenal and Doxastic Conservatism",
    "desc_fa": "این دیدگاه را بررسی می‌کند که «به نظر رسیدن» یا صرف داشتن باور، در غیاب ناقض، توجیه اولیه فراهم می‌کند.",
    "key_questions_fa": [
     "آیا هر نمود (seeming) توجیه در نگاه نخست ایجاد می‌کند؟",
     "آیا صرف باور داشتن دلیلی برای حفظ باور است؟"
    ],
    "src": [
     "IEP Phenomenal Conservatism",
     "IEP Doxastic Conservatism"
    ]
   },
   {
    "id": "a_basing_relation",
    "fa": "رابطهٔ ابتنا",
    "en": "The Basing Relation",
    "desc_fa": "می‌پرسد باور چگونه بر دلیل یا شاهد «مبتنی» می‌شود و این رابطه علّی است یا عقلانی.",
    "key_questions_fa": [
     "چه چیزی باور را مبتنی بر یک دلیل می‌کند؟",
     "آیا رابطهٔ ابتنا علّی است یا اعتقادی یا هر دو؟"
    ],
    "src": [
     "RCE ch.11",
     "SEP basing-epistemic"
    ]
   },
   {
    "id": "a_defeaters",
    "fa": "ناقض‌ها و استدلال شکست‌پذیر",
    "en": "Defeaters and Defeasible Reasoning",
    "desc_fa": "انواع ناقض‌ها (ردکننده و تضعیف‌کننده، ذهنی و عینی) و منطق استدلال شکست‌پذیر را بررسی می‌کند.",
    "key_questions_fa": [
     "ناقض ردکننده (rebutting) با ناقض تضعیف‌کننده (undercutting) چه فرقی دارد؟",
     "آیا ناقضِ ناقض توجیه را بازمی‌گرداند؟",
     "استدلال شکست‌پذیر را چگونه باید صورت‌بندی کرد؟"
    ],
    "src": [
     "IEP Defeaters in Epistemology",
     "SEP reasoning-defeasible",
     "RCE ch.15"
    ],
    "book": [
     "s53"
    ]
   },
   {
    "id": "a_entitlement_transmission",
    "fa": "استحقاق معرفتی و انتقال توجیه",
    "en": "Epistemic Entitlement and Transmission of Warrant",
    "desc_fa": "توجیهِ بی‌نیاز از دلیلِ در دسترس (استحقاق) و شرایط انتقال یا شکست انتقالِ توجیه در استنتاج را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا ما بی‌آنکه دلیلی داشته باشیم حق داریم به برخی گزاره‌ها تکیه کنیم؟",
     "چرا برخی استدلال‌های معتبر توجیه را منتقل نمی‌کنند (مانند استدلال مور)؟"
    ],
    "src": [
     "IEP Epistemic Entitlement",
     "SEP transmission-justification-warrant",
     "IEP Transmission and Transmission Failure in Epistemology"
    ]
   },
   {
    "id": "a_regress_problem",
    "fa": "مسئلهٔ تسلسل توجیه و دور معرفتی",
    "en": "The Regress Problem, Epistemic Circularity and the Criterion",
    "desc_fa": "مسئلهٔ تسلسل دلیل‌ها، دور معرفتی و «مسئلهٔ معیار» را که پیش‌زمینهٔ نظریه‌های ساختار توجیه‌اند بررسی می‌کند.",
    "key_questions_fa": [
     "زنجیرهٔ دلیل‌ها چگونه پایان می‌یابد؟",
     "آیا اثبات اعتمادپذیری یک قوه با خود آن قوه دوری باطل است؟",
     "ابتدا باید معیار شناخت را بدانیم یا مصادیق آن را؟"
    ],
    "src": [
     "SEP infinite-regress",
     "IEP Epistemic Circularity",
     "IEP Problem of the Criterion",
     "SEP epistemology §4"
    ],
    "book": [
     "s40",
     "s69"
    ]
   },
   {
    "id": "a_foundationalism",
    "fa": "مبناگرایی",
    "en": "Foundationalism",
    "desc_fa": "این دیدگاه را بررسی می‌کند که باورهای پایه‌ای بی‌نیاز از استنتاج وجود دارند و دیگر باورها بر آن‌ها استوارند.",
    "key_questions_fa": [
     "باورهای پایه چه هستند و چه چیزی آن‌ها را موجه می‌کند؟",
     "آیا مبانی باید خطاناپذیر باشند؟",
     "توجیه چگونه از مبانی به باورهای غیرپایه منتقل می‌شود؟"
    ],
    "src": [
     "RCE ch.22",
     "SEP justep-foundational",
     "IEP Foundationalism",
     "Audi ch.7"
    ],
    "book": [
     "s40",
     "s46",
     "s57"
    ]
   },
   {
    "id": "a_coherentism",
    "fa": "انسجام‌گرایی",
    "en": "Coherentism",
    "desc_fa": "این دیدگاه را بررسی می‌کند که توجیه از انسجام باور با کل نظام باورها برمی‌خیزد.",
    "key_questions_fa": [
     "انسجام دقیقاً چیست؟",
     "آیا انسجام صدق‌رسان است؟",
     "انسجام‌گرایی با مسئلهٔ جدا افتادن از جهان (isolation) چه می‌کند؟"
    ],
    "src": [
     "RCE ch.24",
     "SEP justep-coherence",
     "IEP Coherentism in Epistemology",
     "Audi ch.7"
    ],
    "book": [
     "s62",
     "s63"
    ]
   },
   {
    "id": "a_infinitism",
    "fa": "بی‌نهایت‌گرایی",
    "en": "Infinitism",
    "desc_fa": "این دیدگاه را بررسی می‌کند که توجیه از زنجیره‌ای نامتناهی و غیردوری از دلیل‌ها حاصل می‌شود.",
    "key_questions_fa": [
     "آیا ذهن محدود می‌تواند زنجیرهٔ نامتناهی دلیل داشته باشد؟",
     "آیا بی‌نهایت‌گرایی به شک‌گرایی می‌انجامد؟"
    ],
    "src": [
     "RCE ch.23",
     "IEP Epistemology, Infinitism in"
    ]
   }
  ]
 },
 {
  "id": "g_sources",
  "fa": "منابع معرفت",
  "en": "Sources of Knowledge",
  "areas": [
   {
    "id": "a_perception",
    "fa": "ادراک حسی",
    "en": "Perception",
    "desc_fa": "چگونگی توجیه باورهای ادراکی، نقش تجربهٔ حسی، رئالیسم مستقیم و غیرمستقیم و نفوذپذیری شناختی ادراک را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا ادراک ما را مستقیماً با جهان مرتبط می‌کند؟",
     "تجربهٔ حسی چگونه باور ادراکی را موجه می‌کند؟",
     "آیا نفوذ انتظارات و باورها در ادراک توجیه را تضعیف می‌کند؟"
    ],
    "src": [
     "RCE ch.27",
     "Audi ch.1",
     "SEP perception-episprob",
     "SEP perception-justification",
     "IEP Epistemology of Perception",
     "IEP Cognitive Penetrability of Perception and Epistemic Justification"
    ],
    "book": [
     "s21",
     "s43",
     "s61"
    ]
   },
   {
    "id": "a_memory",
    "fa": "حافظه",
    "en": "Memory",
    "desc_fa": "حافظه را به‌عنوان منبع (نگه‌دارنده یا تولیدکنندهٔ) معرفت، و توجیه باورهای حافظه‌ای با وجود فراموشی منبع اصلی، بررسی می‌کند.",
    "key_questions_fa": [
     "آیا حافظه فقط معرفت را حفظ می‌کند یا می‌تواند معرفت بسازد؟",
     "باوری که منشأ اولیه‌اش فراموش شده چگونه موجه می‌ماند؟"
    ],
    "src": [
     "RCE ch.30",
     "Audi ch.2",
     "SEP memory-episprob",
     "IEP Memory, Epistemology of"
    ],
    "book": [
     "s52"
    ]
   },
   {
    "id": "a_self_knowledge",
    "fa": "خودشناسی و درون‌نگری",
    "en": "Self-Knowledge and Introspection",
    "desc_fa": "معرفت فرد به حالات ذهنی خود، اعتبار ویژه (مرجعیت اول‌شخص) و سازوکار درون‌نگری را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا معرفت ما به حالات ذهنی خود خطاناپذیر یا ممتاز است؟",
     "درون‌نگری نوعی ادراک درونی است یا سازوکاری دیگر؟",
     "آیا برون‌گرایی محتوایی با خودشناسی سازگار است؟"
    ],
    "src": [
     "RCE ch.28",
     "Audi ch.3",
     "SEP self-knowledge",
     "SEP introspection",
     "SEP epistemology §5.2"
    ],
    "book": [
     "s18",
     "s19"
    ]
   },
   {
    "id": "a_a_priori",
    "fa": "معرفت پیشینی و عقل",
    "en": "A Priori Knowledge and Reason",
    "desc_fa": "امکان و ماهیت معرفتِ مستقل از تجربه، شهود عقلی و تمایز پیشینی/پسینی و تحلیلی/ترکیبی را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا معرفت پیشینی ممکن است و چگونه؟",
     "آیا شهود عقلی منبع توجیه است؟",
     "آیا پیشینی بودن با تجدیدنظرپذیری سازگار است؟"
    ],
    "src": [
     "RCE ch.26",
     "Audi ch.4",
     "SEP apriori",
     "IEP A Priori and A Posteriori",
     "SEP rationalism-empiricism"
    ],
    "book": [
     "s39",
     "s44"
    ]
   },
   {
    "id": "a_testimony",
    "fa": "گواهی (معرفت از راه گفتهٔ دیگران)",
    "en": "Testimony",
    "desc_fa": "توجیه باورهای مبتنی بر گفتهٔ دیگران را بررسی می‌کند: تحویل‌گرایی در برابر ضدتحویل‌گرایی، و انتقال یا تولید معرفت با گواهی.",
    "key_questions_fa": [
     "آیا برای پذیرش گواهی به دلیل مستقل نیاز داریم؟",
     "آیا گواهی فقط معرفت را منتقل می‌کند یا می‌تواند آن را تولید کند؟",
     "اعتماد به گوینده چه نقشی در توجیه دارد؟"
    ],
    "src": [
     "RCE ch.29",
     "Audi ch.5",
     "SEP testimony-episprob",
     "IEP Epistemology of Testimony"
    ],
    "book": [
     "s47",
     "s48"
    ]
   },
   {
    "id": "a_inference_reasoning",
    "fa": "استنتاج و استدلال",
    "en": "Inference and Reasoning",
    "desc_fa": "چگونگی گسترش معرفت از راه استنتاج، شرایط استنتاج درست و نسبت قواعد منطقی با هنجارهای استدلال را بررسی می‌کند.",
    "key_questions_fa": [
     "استنتاج چه زمانی معرفت را گسترش می‌دهد؟",
     "آیا قواعد منطق همان هنجارهای استدلال‌اند؟",
     "شرط «گرفتن» (taking) در استنتاج چیست؟"
    ],
    "src": [
     "Audi ch.6",
     "SEP epistemology §5.4",
     "SEP reasoning-defeasible"
    ],
    "book": [
     "s40",
     "s44"
    ]
   },
   {
    "id": "a_semantic_knowledge",
    "fa": "معرفت زبانی و معنایی",
    "en": "Semantic and Linguistic Knowledge",
    "desc_fa": "معرفت ما به معنا و زبان، و نسبت آن با فهم سخن دیگران را بررسی می‌کند.",
    "key_questions_fa": [
     "دانستن معنای یک واژه چه نوع معرفتی است؟",
     "آیا معرفت زبانی ضمنی، معرفت گزاره‌ای است؟"
    ],
    "src": [
     "RCE ch.31",
     "IEP Language, Knowledge of"
    ],
    "book": [
     "s16",
     "s22",
     "s69"
    ]
   }
  ]
 },
 {
  "id": "g_inference_science",
  "fa": "استقرا، تأیید و معرفت علمی",
  "en": "Induction, Confirmation and Scientific Knowledge",
  "areas": [
   {
    "id": "a_induction",
    "fa": "استقرا و مسئلهٔ استقرا",
    "en": "Induction and the Problem of Induction",
    "desc_fa": "توجیه استنتاج از موارد مشاهده‌شده به موارد مشاهده‌نشده، شک هیومی و معمای جدید گودمن را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا استقرا توجیه عقلانی دارد؟",
     "آیا می‌توان استقرا را با خود استقرا موجه کرد؟",
     "کدام محمول‌ها «فرافکنی‌پذیر»ند؟"
    ],
    "src": [
     "RCE ch.25",
     "RCE ch.41",
     "SEP induction-problem",
     "IEP Epistemology §4.d"
    ],
    "book": [
     "s50"
    ]
   },
   {
    "id": "a_abduction_ibe",
    "fa": "استنتاج بهترین تبیین",
    "en": "Abduction / Inference to the Best Explanation",
    "desc_fa": "اعتبار استنتاج از تبیین‌گری یک فرضیه به صدق آن و معیارهای «بهترین» تبیین را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا تبیین‌گری نشانهٔ صدق است؟",
     "فضیلت‌های تبیینی (سادگی، گستره، انسجام) چه وزنی دارند؟",
     "نسبت استنتاج بهترین تبیین با بیزگرایی چیست؟"
    ],
    "src": [
     "SEP abduction",
     "IEP Theories of Explanation"
    ]
   },
   {
    "id": "a_confirmation",
    "fa": "تأیید",
    "en": "Confirmation Theory",
    "desc_fa": "چگونگی تأیید یا ابطال فرضیه‌ها با شواهد، پارادوکس‌های تأیید (کلاغ‌ها، گرو) و سنجه‌های کمّی تأیید را بررسی می‌کند.",
    "key_questions_fa": [
     "چه وقت یک شاهد فرضیه‌ای را تأیید می‌کند؟",
     "پارادوکس کلاغ‌ها چگونه حل می‌شود؟",
     "کدام سنجهٔ کمّی تأیید درست است؟"
    ],
    "src": [
     "SEP confirmation",
     "IEP Confirmation and Induction"
    ],
    "book": [
     "s50",
     "s51"
    ]
   },
   {
    "id": "a_scientific_knowledge",
    "fa": "معرفت علمی و ابعاد اجتماعی آن",
    "en": "Scientific Knowledge",
    "desc_fa": "ماهیت و توجیه معرفت علمی، نقش جامعهٔ علمی و ارزش‌ها و عینیت در علم را بررسی می‌کند.",
    "key_questions_fa": [
     "چه چیزی معرفت علمی را از دیگر انواع معرفت متمایز می‌کند؟",
     "ساختار اجتماعی علم چگونه بر عینیت اثر می‌گذارد؟",
     "آیا ارزش‌های غیرمعرفتی جایی مشروع در علم دارند؟"
    ],
    "src": [
     "RCE ch.32",
     "Audi ch.9",
     "SEP scientific-knowledge-social",
     "IEP Objectivity",
     "IEP Popper: Critical Rationalism"
    ],
    "book": [
     "s51"
    ]
   },
   {
    "id": "a_underdetermination_realism",
    "fa": "تعین ناقص نظریه و واقع‌گرایی علمی",
    "en": "Underdetermination and Scientific Realism",
    "desc_fa": "می‌پرسد آیا شواهد برای انتخاب میان نظریه‌های رقیب کافی‌اند و آیا باید به صدق تقریبی نظریه‌های موفق باور داشت.",
    "key_questions_fa": [
     "آیا نظریه‌ها همواره با شواهد تعین ناقص دارند؟",
     "آیا موفقیت پیش‌بینی دلیل صدق نظریه است؟"
    ],
    "src": [
     "SEP scientific-underdetermination",
     "SEP scientific-realism",
     "SEP epistemology §6.3"
    ]
   },
   {
    "id": "a_explanation",
    "fa": "تبیین",
    "en": "Explanation",
    "desc_fa": "ماهیت تبیین (علمی و غیرعلمی) و نسبت آن با فهم و تأیید را بررسی می‌کند.",
    "key_questions_fa": [
     "تبیین چیست: قانون‌محور، علّی یا وحدت‌بخش؟",
     "چرا تبیین به فهم می‌انجامد؟"
    ],
    "src": [
     "SEP scientific-explanation",
     "IEP Theories of Explanation"
    ]
   },
   {
    "id": "a_thought_experiments_models",
    "fa": "آزمایش فکری، مدل و شبیه‌سازی",
    "en": "Thought Experiments, Models and Simulations",
    "desc_fa": "می‌پرسد چگونه آزمایش‌های فکری، مدل‌ها و شبیه‌سازی‌های رایانه‌ای بی‌مشاهدهٔ مستقیم معرفت تولید می‌کنند.",
    "key_questions_fa": [
     "آزمایش فکری از کجا معرفت تازه می‌دهد؟",
     "آیا نتایج شبیه‌سازی هم‌پایهٔ نتایج آزمایش‌اند؟"
    ],
    "src": [
     "SEP thought-experiment",
     "SEP simulations-science"
    ]
   }
  ]
 },
 {
  "id": "g_domains",
  "fa": "معرفت در قلمروهای خاص",
  "en": "Domain-Specific Epistemologies",
  "areas": [
   {
    "id": "a_math_logic",
    "fa": "معرفت ریاضی و منطقی",
    "en": "Mathematical and Logical Knowledge",
    "desc_fa": "چگونگی معرفت به حقایق ریاضی و منطقی، نقش برهان، شهود و تجسم در ریاضیات را بررسی می‌کند.",
    "key_questions_fa": [
     "چگونه به اشیای انتزاعی ریاضی علم داریم (معضل بناسراف)؟",
     "آیا معرفت منطقی پیشینی است؟",
     "آیا تجسم و نمودار می‌توانند ریاضیات را موجه کنند؟"
    ],
    "src": [
     "RCE ch.33",
     "SEP visual thinking in mathematics",
     "SEP geometry: epistemology of",
     "IEP The Cognitive Foundations and Epistemology of Arithmetic and Geometry"
    ]
   },
   {
    "id": "a_modal_knowledge",
    "fa": "معرفت موجهاتی",
    "en": "Modal Knowledge",
    "desc_fa": "معرفت ما به امکان و ضرورت و نقش تصورپذیری در آن را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا تصورپذیری راهنمای امکان است؟",
     "معرفت به ضرورت از کجا می‌آید؟"
    ],
    "src": [
     "SEP modality-epistemology"
    ]
   },
   {
    "id": "a_moral_epistemology",
    "fa": "معرفت‌شناسی اخلاق",
    "en": "Moral Epistemology",
    "desc_fa": "امکان و منابع معرفت اخلاقی (شهود، موازنهٔ متأملانه، گواهی اخلاقی) و شک‌گرایی اخلاقی را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا معرفت اخلاقی ممکن است؟",
     "آیا شهودهای اخلاقی توجیه‌کننده‌اند؟",
     "آیا می‌توان با گواهی معرفت اخلاقی کسب کرد؟"
    ],
    "src": [
     "RCE ch.35",
     "RCE ch.43",
     "Audi ch.9",
     "SEP moral-epistemology",
     "IEP Moral Epistemology",
     "SEP reflective-equilibrium"
    ]
   },
   {
    "id": "a_aesthetic_knowledge",
    "fa": "معرفت زیبایی‌شناختی",
    "en": "Aesthetic Knowledge",
    "desc_fa": "امکان معرفت در داوری‌های زیبایی‌شناختی، نقش آشنایی مستقیم و گواهی زیبایی‌شناختی را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا داوری زیبایی‌شناختی می‌تواند معرفت باشد؟",
     "آیا می‌توان از راه گواهی دانست که اثری زیباست؟",
     "آیا هنر منبع معرفت است؟"
    ],
    "src": [
     "RCE ch.34",
     "IEP Art and Epistemology",
     "SEP-toc aesthetic testimony"
    ]
   },
   {
    "id": "a_religious_epistemology",
    "fa": "معرفت‌شناسی دینی",
    "en": "Religious Epistemology",
    "desc_fa": "عقلانیت و توجیه باور دینی، قرینه‌گرایی در برابر معرفت‌شناسی اصلاح‌شده، و نقش تجربهٔ دینی را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا باور دینی بدون شاهد استدلالی می‌تواند موجه باشد؟",
     "آیا تجربهٔ دینی منبع توجیه است؟",
     "تکثر ادیان چه تأثیری بر عقلانیت باور دینی دارد؟"
    ],
    "src": [
     "RCE ch.36",
     "Audi ch.9",
     "SEP religion-epistemology",
     "IEP Religious Epistemology",
     "IEP Reformed Epistemology",
     "SEP religious-experience"
    ],
    "book": [
     "s71",
     "s72",
     "s73",
     "s74",
     "s80"
    ]
   },
   {
    "id": "a_legal_epistemology",
    "fa": "معرفت‌شناسی حقوقی",
    "en": "Legal Epistemology",
    "desc_fa": "مفهوم شاهد در حقوق، معیارهای اثبات، شواهد صرفاً آماری و اعتبار گواهی در دادگاه را بررسی می‌کند.",
    "key_questions_fa": [
     "چرا شواهد صرفاً آماری برای محکومیت کافی نیست؟",
     "معیار «فراتر از شک معقول» چه نسبتی با معرفت دارد؟"
    ],
    "src": [
     "SEP evidence-legal",
     "Pritchard"
    ]
   },
   {
    "id": "a_other_minds",
    "fa": "معرفت به اذهان دیگر",
    "en": "Knowledge of Other Minds",
    "desc_fa": "می‌پرسد چگونه از وجود و محتوای ذهن دیگران آگاه می‌شویم و شک دربارهٔ آن چگونه پاسخ می‌یابد.",
    "key_questions_fa": [
     "آیا استدلال تمثیلی برای اذهان دیگر کافی است؟",
     "آیا می‌توان حالات ذهنی دیگران را مستقیماً ادراک کرد؟"
    ],
    "src": [
     "RCE ch.40"
    ]
   }
  ]
 },
 {
  "id": "g_skepticism",
  "fa": "شک‌گرایی و پاسخ‌ها",
  "en": "Skepticism and Responses",
  "areas": [
   {
    "id": "a_pyrrhonian",
    "fa": "شک‌گرایی باستان (پورونی و آکادمیک)",
    "en": "Ancient (Pyrrhonian and Academic) Skepticism",
    "desc_fa": "شک‌گرایی یونانی، روش تعلیق حکم، حالت‌های (tropes) آگریپا و شک‌گرایی آکادمیک را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا می‌توان بی‌باور زیست؟",
     "آیا سه‌گانهٔ آگریپا (تسلسل، دور، فرض) گریزناپذیر است؟"
    ],
    "src": [
     "RCE ch.37",
     "SEP skepticism-ancient",
     "IEP Ancient Greek Skepticism",
     "IEP Cicero: Academic Skepticism"
    ]
   },
   {
    "id": "a_radical_skepticism",
    "fa": "شک‌گرایی دکارتی و فراگیر",
    "en": "Cartesian / Radical Skepticism",
    "desc_fa": "استدلال‌های شکاکانهٔ فراگیر (رؤیا، شیطان فریبکار، مغز در خمره) و انواع شک‌گرایی (عام و گزینشی) را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا می‌دانم که مغز در خمره نیستم؟",
     "استدلال شکاکانه بر کدام مقدمه تکیه دارد: بستار، تعین ناقص یا امکان معرفتی؟"
    ],
    "src": [
     "RCE ch.38",
     "SEP skepticism",
     "IEP Contemporary Skepticism",
     "IEP Brain in a Vat Argument",
     "SEP epistemology §6",
     "Audi ch.10"
    ],
    "book": [
     "s54",
     "s56",
     "s57",
     "s59",
     "s60",
     "s61"
    ]
   },
   {
    "id": "a_epistemic_closure",
    "fa": "اصل بستار معرفتی",
    "en": "Epistemic Closure",
    "desc_fa": "این اصل را بررسی می‌کند که معرفت تحت استلزام معلوم بسته است، و نقش آن در استدلال شکاکانه.",
    "key_questions_fa": [
     "آیا اگر بدانم p و بدانم p مستلزم q است، q را می‌دانم؟",
     "آیا انکار بستار (درتسکی، نوزیک) پاسخی معقول به شک است؟"
    ],
    "src": [
     "RCE ch.54",
     "SEP closure-epistemic",
     "IEP Epistemic Closure Principles",
     "SEP epistemology §6.2"
    ]
   },
   {
    "id": "a_rule_following_skepticism",
    "fa": "شک دربارهٔ پیروی از قاعده و خودشناسی",
    "en": "Rule-Following and Self-Knowledge Skepticism",
    "desc_fa": "شک ویتگنشتاین-کریپکی دربارهٔ معنا و پیروی از قاعده، و شک دربارهٔ معرفت به حالات ذهنی خود را بررسی می‌کند.",
    "key_questions_fa": [
     "چه واقعیتی تعیین می‌کند که من از کدام قاعده پیروی می‌کنم؟",
     "آیا ممکن است دربارهٔ محتوای افکار خود دچار خطا باشیم؟"
    ],
    "src": [
     "RCE ch.42",
     "RCE ch.39"
    ]
   },
   {
    "id": "a_moorean_hinge",
    "fa": "پاسخ‌های عقل سلیم و لولا (مور و ویتگنشتاین)",
    "en": "Moorean and Hinge Responses",
    "desc_fa": "پاسخ مور («این یک دست است») و معرفت‌شناسی لولا (باورهای بنیادینِ ناپرسیدنی) در برابر شک‌گرایی را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا استدلال مور شک را رد می‌کند یا مصادره به مطلوب است؟",
     "آیا گزاره‌های لولا اصلاً متعلق معرفت‌اند؟"
    ],
    "src": [
     "RCE ch.68",
     "IEP Wittgenstein: Epistemology",
     "SEP transmission-justification-warrant"
    ]
   },
   {
    "id": "a_externalist_transcendental_responses",
    "fa": "پاسخ‌های برون‌گرایانه، معناشناختی و استعلایی",
    "en": "Externalist, Semantic and Transcendental Responses",
    "desc_fa": "پاسخ‌های مبتنی بر برون‌گرایی معرفتی، برون‌گرایی محتوایی (پاتنم) و استدلال‌های استعلایی/ضدواقع‌گرایانه به شک را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا برون‌گرایی معرفتی شک را پاسخ می‌دهد یا فقط آن را دور می‌زند؟",
     "آیا مغز در خمره می‌تواند حتی بیندیشد «من مغز در خمره‌ام»؟",
     "آیا استدلال استعلایی می‌تواند وجود جهان خارج را اثبات کند؟"
    ],
    "src": [
     "RCE ch.44",
     "RCE ch.45",
     "RCE ch.46",
     "SEP skepticism-content-externalism",
     "IEP Transcendental Arguments"
    ]
   }
  ]
 },
 {
  "id": "g_attributions",
  "fa": "معرفت، زبان و بافت",
  "en": "Knowledge Attributions and Context",
  "areas": [
   {
    "id": "a_contextualism",
    "fa": "بافت‌گرایی معرفتی",
    "en": "Epistemic Contextualism",
    "desc_fa": "این دیدگاه را بررسی می‌کند که شرایط صدق جملهٔ «S می‌داند که p» با بافتِ گوینده تغییر می‌کند.",
    "key_questions_fa": [
     "آیا «دانستن» واژه‌ای بافت‌حساس است؟",
     "آیا بافت‌گرایی پاسخ خوبی به شک‌گرایی است؟"
    ],
    "src": [
     "RCE ch.48",
     "SEP contextualism-epistemology",
     "IEP Contextualism in Epistemology"
    ]
   },
   {
    "id": "a_contrastivism",
    "fa": "تقابل‌گرایی",
    "en": "Contrastivism",
    "desc_fa": "معرفت را رابطه‌ای سه‌جزئی میان فاعل، گزاره و بدیلِ متقابل می‌داند.",
    "key_questions_fa": [
     "آیا دانستن همیشه دانستنِ «p به‌جای q» است؟",
     "تقابل‌گرایی چه پیامدی برای شک دارد؟"
    ],
    "src": [
     "RCE ch.47"
    ]
   },
   {
    "id": "a_pragmatic_encroachment",
    "fa": "تأثیر ملاحظات عملی (تجاوز عمل‌گرایانه)",
    "en": "Pragmatic Encroachment and Subject-Sensitive Invariantism",
    "desc_fa": "این دیدگاه را بررسی می‌کند که آنچه برای فاعل در خطر است (اهمیت عملی) در دانستن یا موجه بودن او اثر دارد.",
    "key_questions_fa": [
     "آیا با بالا رفتن اهمیت عملی، شاهد بیشتری برای دانستن لازم است؟",
     "آیا معرفت باید به‌طور کامل «خالص» از ملاحظات عملی باشد؟"
    ],
    "src": [
     "RCE ch.51"
    ]
   },
   {
    "id": "a_epistemic_relativism",
    "fa": "نسبی‌گرایی معرفتی",
    "en": "Epistemic Relativism",
    "desc_fa": "این دیدگاه را بررسی می‌کند که توجیه یا معرفت نسبت به نظام‌های معرفتی، فرهنگ‌ها یا معیارهای ارزیابی است؛ شامل نسبی‌گرایی دربارهٔ اسناد معرفت.",
    "key_questions_fa": [
     "آیا معیارهای معرفتی بی‌طرف و همگانی وجود دارد؟",
     "آیا نسبی‌گرایی معرفتی خودشکن است؟",
     "آیا صدق جمله‌های معرفتی به بافت ارزیابی وابسته است؟"
    ],
    "src": [
     "RCE ch.8",
     "RCE ch.49",
     "SEP relativism",
     "IEP Epistemology and Relativism",
     "IEP Relativism"
    ],
    "book": [
     "s55",
     "s56",
     "s63",
     "s67",
     "s68"
    ]
   },
   {
    "id": "a_epistemic_modals",
    "fa": "وجه‌نماهای معرفتی",
    "en": "Epistemic Modals",
    "desc_fa": "معنای عبارت‌هایی مانند «شاید»، «باید» و «ممکن است» در کاربرد معرفتی و نسبت آن‌ها با معرفت گوینده را بررسی می‌کند.",
    "key_questions_fa": [
     "«ممکن است p» به معرفت چه کسی ارجاع دارد؟",
     "آیا وجه‌نماهای معرفتی نسبی به ارزیاب‌اند؟"
    ],
    "src": [
     "RCE ch.50",
     "IEP Epistemic Modality"
    ]
   }
  ]
 },
 {
  "id": "g_formal",
  "fa": "معرفت‌شناسی صوری",
  "en": "Formal Epistemology",
  "areas": [
   {
    "id": "a_epistemic_logic",
    "fa": "منطق معرفتی و پویا",
    "en": "Epistemic and Dynamic Epistemic Logic",
    "desc_fa": "صورت‌بندی منطقی معرفت و باور (منطق‌های موجهاتی) و تغییر آن‌ها با کسب اطلاع (منطق معرفتی پویا) را بررسی می‌کند.",
    "key_questions_fa": [
     "کدام اصول موجهاتی (مانند T، 4، 5) برای معرفت درست‌اند؟",
     "مسئلهٔ «همه‌دانی منطقی» چگونه حل می‌شود؟",
     "اعلان عمومی چگونه معرفت گروه را تغییر می‌دهد؟"
    ],
    "src": [
     "RCE ch.52",
     "SEP logic-epistemic",
     "SEP dynamic-epistemic",
     "IEP Dynamic Epistemic Logic"
    ]
   },
   {
    "id": "a_bayesian",
    "fa": "معرفت‌شناسی بیزی و احتمال",
    "en": "Bayesian Epistemology and Probability",
    "desc_fa": "درجات باور (اعتبار) را با نظریهٔ احتمال الگوسازی می‌کند و قواعد شرطی‌سازی و تفسیرهای احتمال را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا درجات باور باید از اصول احتمال پیروی کنند؟",
     "احتمال‌های پیشین را چگونه باید تعیین کرد؟",
     "تفسیر درست احتمال (ذهنی، عینی، منطقی) کدام است؟"
    ],
    "src": [
     "RCE ch.55",
     "SEP epistemology-bayesian",
     "SEP formal-epistemology",
     "SEP probability, interpretations of"
    ]
   },
   {
    "id": "a_belief_credence",
    "fa": "باور تمام‌عیار و درجهٔ باور",
    "en": "Full Belief and Credence",
    "desc_fa": "نسبت باور قطعی با درجهٔ باور (مانند تز لاکی) و بازنمایی‌های صوری باور را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا باور همان درجهٔ باور بالاتر از یک آستانه است؟",
     "آیا یکی از این دو به دیگری تحویل‌پذیر است؟"
    ],
    "src": [
     "SEP formal-belief"
    ]
   },
   {
    "id": "a_accuracy_dutch_book",
    "fa": "استدلال‌های دقت و شرط‌بندی هلندی",
    "en": "Accuracy-First and Dutch Book Arguments",
    "desc_fa": "توجیه هنجارهای معرفتی (مانند احتمال‌گرایی) از راه سود معرفتی/دقت یا آسیب‌پذیری در شرط‌بندی را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا هنجارهای معرفتی از هدف دقت به دست می‌آیند؟",
     "آیا استدلال شرط‌بندی هلندی دلیلی معرفتی است یا عملی؟"
    ],
    "src": [
     "SEP epistemic-utility",
     "SEP dutch-book",
     "IEP Consequentialism Epistemic"
    ]
   },
   {
    "id": "a_belief_revision",
    "fa": "نظریه‌های تغییر باور",
    "en": "Belief Revision Theory",
    "desc_fa": "قواعد عقلانی افزودن، حذف و بازنگری باور در پرتو اطلاع تازه (مانند نظریهٔ AGM) را بررسی می‌کند.",
    "key_questions_fa": [
     "هنگام تعارض اطلاع تازه با باورها کدام باور را باید کنار گذاشت؟",
     "اصول حداقل تغییر چه توجیهی دارند؟"
    ],
    "src": [
     "RCE ch.56",
     "SEP logic-belief-revision"
    ]
   },
   {
    "id": "a_epistemic_paradoxes",
    "fa": "پارادوکس‌های معرفتی",
    "en": "Epistemic Paradoxes",
    "desc_fa": "پارادوکس‌هایی مانند بخت‌آزمایی، دیباچه، امتحان غافلگیرانه و معرفت‌پذیری (فیچ) و پیامدهای آن‌ها را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا باور به اینکه هر بلیت می‌بازد موجه است؟",
     "آیا پارادوکس فیچ نشان می‌دهد هر حقیقتی دانستنی نیست؟"
    ],
    "src": [
     "RCE ch.57",
     "SEP epistemic-paradoxes",
     "SEP fitch-paradox"
    ]
   },
   {
    "id": "a_common_knowledge_self_location",
    "fa": "معرفت مشترک و باورهای خودموقعیت‌یاب",
    "en": "Common Knowledge and Self-Locating Belief",
    "desc_fa": "معرفت مشترک در گروه‌ها و باورهای مربوط به جایگاه خود در زمان و مکان (مانند مسئلهٔ زیبای خفته) را بررسی می‌کند.",
    "key_questions_fa": [
     "معرفت مشترک چیست و چگونه حاصل می‌شود؟",
     "در مسئلهٔ زیبای خفته اعتبار باید یک‌دوم باشد یا یک‌سوم؟"
    ],
    "src": [
     "SEP common-knowledge",
     "SEP self-locating-beliefs"
    ]
   }
  ]
 },
 {
  "id": "g_social",
  "fa": "معرفت‌شناسی اجتماعی",
  "en": "Social Epistemology",
  "areas": [
   {
    "id": "a_disagreement",
    "fa": "اختلاف نظر همتایان",
    "en": "Peer Disagreement",
    "desc_fa": "می‌پرسد وقتی همتای معرفتی‌ام با من مخالف است، باید باورم را تعدیل کنم یا حفظ کنم.",
    "key_questions_fa": [
     "آیا اختلاف با همتا ما را به تعلیق یا تعدیل باور ملزم می‌کند؟",
     "آیا باید به دیدگاه خود وزن ویژه داد؟",
     "اختلاف دینی و اخلاقی چه پیامدی دارد؟"
    ],
    "src": [
     "RCE ch.7",
     "SEP disagreement",
     "IEP Disagreement, Religious"
    ]
   },
   {
    "id": "a_trust_expertise",
    "fa": "اعتماد و کارشناسی",
    "en": "Trust and Expertise",
    "desc_fa": "اعتماد معرفتی، تشخیص کارشناس واقعی و وابستگی معرفتی به دیگران را بررسی می‌کند.",
    "key_questions_fa": [
     "نوآموز چگونه کارشناس قابل اعتماد را تشخیص دهد؟",
     "اعتماد معرفتی چه زمانی معقول است؟",
     "وابستگی به کارشناس با خودمختاری معرفتی چگونه جمع می‌شود؟"
    ],
    "src": [
     "SEP trust",
     "IEP The Ethics and Epistemology of Trust",
     "SEP epistemology-social"
    ],
    "book": [
     "s49"
    ]
   },
   {
    "id": "a_group_epistemology",
    "fa": "معرفت و باور گروهی",
    "en": "Group Knowledge and Collective Epistemology",
    "desc_fa": "می‌پرسد آیا گروه‌ها و نهادها می‌توانند باور، توجیه یا معرفت داشته باشند و تجمیع داوری‌ها چگونه است.",
    "key_questions_fa": [
     "آیا گروه می‌تواند چیزی بداند که هیچ عضوش نمی‌داند؟",
     "قضایای هیئت‌منصفه (کندورسه) چه می‌گویند؟"
    ],
    "src": [
     "SEP epistemology-social",
     "SEP-toc jury theorems",
     "Pritchard"
    ]
   },
   {
    "id": "a_epistemic_injustice",
    "fa": "بی‌عدالتی معرفتی",
    "en": "Epistemic Injustice",
    "desc_fa": "آسیب‌ها و ظلم‌هایی را که به فرد در مقام دانا وارد می‌شود (بی‌عدالتی گواهی و تفسیری) بررسی می‌کند.",
    "key_questions_fa": [
     "بی‌عدالتی گواهی (کسر اعتبار به‌سبب پیش‌داوری) چیست؟",
     "بی‌عدالتی تفسیری از کجا ناشی می‌شود؟",
     "چه فضیلت‌هایی آن را جبران می‌کند؟"
    ],
    "src": [
     "SEP epistemic-injustice",
     "SEP feminist-social-epistemology",
     "SEP epistemology §1.6"
    ]
   },
   {
    "id": "a_feminist_standpoint",
    "fa": "معرفت‌شناسی فمینیستی و نظریهٔ موضع",
    "en": "Feminist Epistemology and Standpoint Theory",
    "desc_fa": "نقش موقعیت اجتماعی، جنسیت و قدرت در معرفت و نظریهٔ موضع را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا موقعیت اجتماعی بر دسترسی معرفتی اثر دارد؟",
     "آیا جایگاه‌های به‌حاشیه‌رانده امتیاز معرفتی دارند؟"
    ],
    "src": [
     "RCE ch.78",
     "SEP feminism-epistemology",
     "IEP Feminist Epistemology",
     "IEP Feminist Standpoint Theory"
    ]
   },
   {
    "id": "a_ignorance",
    "fa": "معرفت‌شناسی جهل",
    "en": "Epistemology of Ignorance",
    "desc_fa": "ماهیت جهل و جهلِ برساختهٔ اجتماعی (نادانیِ نظام‌مند و خودخواسته) را بررسی می‌کند.",
    "key_questions_fa": [
     "جهل نبودِ معرفت است یا نبودِ باور صادق؟",
     "جهل چگونه به‌طور اجتماعی تولید و حفظ می‌شود؟"
    ],
    "src": [
     "SEP feminism-epistemology",
     "SEP feminist-social-epistemology"
    ]
   },
   {
    "id": "a_epistemic_autonomy_paternalism",
    "fa": "خودمختاری و پدرسالاری معرفتی",
    "en": "Epistemic Autonomy and Paternalism",
    "desc_fa": "می‌پرسد آیا می‌توان مشروعاً دسترسی دیگران به اطلاعات را برای بهبود باورهایشان محدود کرد، و ارزش خودمختاری معرفتی چیست.",
    "key_questions_fa": [
     "آیا محدود کردن اطلاعات برای صلاح معرفتی دیگران موجه است؟",
     "خودمختاری معرفتی چه ارزشی دارد؟"
    ],
    "src": [
     "Goldman1991",
     "SEP epistemology-social"
    ]
   }
  ]
 },
 {
  "id": "g_virtue_value",
  "fa": "فضیلت، ارزش و اخلاق باور",
  "en": "Virtue, Epistemic Value and the Ethics of Belief",
  "areas": [
   {
    "id": "a_virtue_epistemology",
    "fa": "معرفت‌شناسی فضیلت",
    "en": "Virtue Epistemology",
    "desc_fa": "معرفت و توجیه را برحسب فضیلت‌های فکری (قابلیت‌محور و منش‌محور) تبیین می‌کند.",
    "key_questions_fa": [
     "آیا معرفت باور صادقی است که از توانایی فکری حاصل شده باشد؟",
     "فضیلت قابلیت‌محور با فضیلت منش‌محور چه تفاوتی دارد؟"
    ],
    "src": [
     "RCE ch.19",
     "SEP epistemology-virtue",
     "IEP Virtue Epistemology",
     "Audi"
    ]
   },
   {
    "id": "a_intellectual_virtues_vices",
    "fa": "فضیلت‌ها و رذیلت‌های فکری",
    "en": "Intellectual Virtues and Vices",
    "desc_fa": "فضیلت‌هایی مانند فروتنی فکری، گشوده‌ذهنی و کنجکاوی و رذیلت‌هایی مانند جزم‌اندیشی و بسته‌ذهنی را بررسی می‌کند.",
    "key_questions_fa": [
     "فروتنی فکری چیست؟",
     "آیا گشوده‌ذهنی همیشه فضیلت است؟",
     "رذیلت فکری چگونه به باور نادرست می‌انجامد؟"
    ],
    "src": [
     "SEP epistemology-virtue",
     "IEP Virtue Epistemology"
    ]
   },
   {
    "id": "a_epistemic_value",
    "fa": "ارزش معرفتی و مسئلهٔ ارزش",
    "en": "Epistemic Value and the Value Problem",
    "desc_fa": "می‌پرسد چرا معرفت از باور صادق صرف ارزشمندتر است و چه چیزهایی ارزش معرفتی بنیادین دارند.",
    "key_questions_fa": [
     "چرا معرفت بیش از باور صادق ارزش دارد (مسئلهٔ منون)؟",
     "آیا صدق تنها ارزش معرفتی بنیادین است؟",
     "آیا پیامدگرایی معرفتی درست است؟"
    ],
    "src": [
     "RCE ch.21",
     "SEP knowledge-value",
     "IEP Epistemic Value",
     "IEP Consequentialism Epistemic"
    ]
   },
   {
    "id": "a_understanding",
    "fa": "فهم",
    "en": "Understanding",
    "desc_fa": "فهم (چرایی، موضوعی، عینی) را به‌عنوان دستاورد معرفتی متمایز از معرفت بررسی می‌کند.",
    "key_questions_fa": [
     "آیا فهم نوعی معرفت است؟",
     "آیا فهم با بخت معرفتی سازگار است؟",
     "آیا فهم از معرفت ارزشمندتر است؟"
    ],
    "src": [
     "RCE ch.9",
     "SEP understanding",
     "IEP Understanding in Epistemology"
    ]
   },
   {
    "id": "a_wisdom",
    "fa": "حکمت و فرزانگی",
    "en": "Wisdom",
    "desc_fa": "ماهیت حکمت (نظری و عملی) و نسبت آن با معرفت و فضیلت را بررسی می‌کند.",
    "key_questions_fa": [
     "حکمت چیست: معرفت گسترده، فروتنی معرفتی یا داوری درست عملی؟",
     "حکمت چه نسبتی با فهم دارد؟"
    ],
    "src": [
     "RCE ch.10",
     "SEP wisdom"
    ]
   },
   {
    "id": "a_ethics_of_belief",
    "fa": "اخلاق باور",
    "en": "Ethics of Belief",
    "desc_fa": "می‌پرسد آیا وظیفه‌ای (اخلاقی یا معرفتی) دربارهٔ چگونگی باور داریم و آیا باور زیانبار یا بی‌دلیل خطاست (کلیفورد و جیمز).",
    "key_questions_fa": [
     "آیا باور کردن بدون شاهد کافی همیشه خطاست؟",
     "آیا ملاحظات اخلاقی می‌توانند بر آنچه باید باور کنیم اثر بگذارند (تجاوز اخلاقی)؟"
    ],
    "src": [
     "SEP ethics-belief"
    ],
    "book": [
     "s70",
     "s80"
    ]
   },
   {
    "id": "a_doxastic_voluntarism",
    "fa": "اراده‌گرایی باوری",
    "en": "Doxastic Voluntarism",
    "desc_fa": "می‌پرسد آیا باورها تحت کنترل ارادی‌اند و اگر نیستند، چگونه می‌توان دربارهٔ آن‌ها مسئولیت و وظیفه داشت.",
    "key_questions_fa": [
     "آیا می‌توانیم به اراده باور کنیم؟",
     "آیا مسئولیت باوری مستلزم کنترل ارادی است؟"
    ],
    "src": [
     "SEP doxastic-voluntarism",
     "IEP Doxastic Voluntarism",
     "SEP epistemology §3.1"
    ]
   },
   {
    "id": "a_inquiry",
    "fa": "معرفت‌شناسی پژوهش (زتتیک)",
    "en": "Epistemology of Inquiry (Zetetic Epistemology)",
    "desc_fa": "هنجارهای حاکم بر پرسیدن، جست‌وجو و تحقیق، و نسبت آن‌ها با هنجارهای باور را بررسی می‌کند.",
    "key_questions_fa": [
     "چه هنجارهایی بر شروع و پایان تحقیق حاکم است؟",
     "آیا هنجارهای تحقیق با هنجارهای باور تعارض دارند؟"
    ],
    "src": [
     "Friedman2020"
    ]
   }
  ]
 },
 {
  "id": "g_meta_method",
  "fa": "فرامعرفت‌شناسی، روش و سنت‌ها",
  "en": "Metaepistemology, Method and Traditions",
  "areas": [
   {
    "id": "a_metaepistemology",
    "fa": "فرامعرفت‌شناسی",
    "en": "Metaepistemology",
    "desc_fa": "ماهیت و منزلت مفاهیم و احکام معرفتی (واقع‌گرایی و ضدواقع‌گرایی معرفتی، هنجاری بودن) را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا واقعیت‌های معرفتی مستقل از ما وجود دارند؟",
     "آیا مفاهیم معرفتی هنجاری‌اند؟"
    ],
    "src": [
     "SEP metaepistemology",
     "IEP Metaepistemology"
    ],
    "book": [
     "s4",
     "s5",
     "s6",
     "s8",
     "s9"
    ]
   },
   {
    "id": "a_intuitions_method",
    "fa": "شهودها و روش در معرفت‌شناسی",
    "en": "Intuitions and Epistemological Method",
    "desc_fa": "نقش شهودها، مثال‌های فرضی و موازنهٔ متأملانه در روش معرفت‌شناسی را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا شهودهای فلسفی شاهدند؟",
     "موازنهٔ متأملانه چگونه کار می‌کند؟"
    ],
    "src": [
     "RCE ch.72",
     "SEP intuition",
     "SEP reflective-equilibrium"
    ]
   },
   {
    "id": "a_experimental_epistemology",
    "fa": "معرفت‌شناسی تجربی و قوم‌معرفت‌شناسی",
    "en": "Experimental Epistemology and Ethnoepistemology",
    "desc_fa": "آزمودن تجربی شهودهای معرفتی و تنوع فرهنگی آن‌ها را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا شهودهای معرفتی میان فرهنگ‌ها متفاوت‌اند؟",
     "یافته‌های تجربی چه پیامدی برای روش فلسفی دارند؟"
    ],
    "src": [
     "RCE ch.73",
     "IEP Ethnoepistemology"
    ]
   },
   {
    "id": "a_naturalized",
    "fa": "معرفت‌شناسی طبیعی‌شده",
    "en": "Naturalized Epistemology",
    "desc_fa": "پیوند معرفت‌شناسی با علوم تجربی، به‌ویژه روان‌شناسی شناختی (پیشنهاد کواین) را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا معرفت‌شناسی باید شاخه‌ای از روان‌شناسی باشد؟",
     "آیا طبیعی‌سازی هنجاری بودن معرفت‌شناسی را از میان می‌برد؟"
    ],
    "src": [
     "RCE ch.74",
     "SEP epistemology-naturalized",
     "IEP Naturalistic Epistemology"
    ]
   },
   {
    "id": "a_evolutionary",
    "fa": "معرفت‌شناسی تکاملی",
    "en": "Evolutionary Epistemology",
    "desc_fa": "تبیین تکاملی قوای شناختی و رشد معرفت و پیامدهای معرفتی آن را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا تکامل قوای شناختی صدق‌نما را برمی‌گزیند؟",
     "آیا رشد علم فرایندی شبه‌تکاملی است؟"
    ],
    "src": [
     "RCE ch.75",
     "SEP epistemology-evolutionary",
     "IEP Evolutionary Epistemology"
    ]
   },
   {
    "id": "a_pragmatist",
    "fa": "معرفت‌شناسی عمل‌گرایانه",
    "en": "Pragmatist Epistemology",
    "desc_fa": "رویکرد پیرس، جیمز و دیویی به تحقیق، باور و صدق و نسبت معرفت با عمل را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا معرفت را باید برحسب موفقیت در عمل فهمید؟",
     "آیا خطاپذیری‌گرایی عمل‌گرایانه راه میانه‌ای میان جزم و شک است؟"
    ],
    "src": [
     "RCE ch.76",
     "IEP Pragmatism",
     "IEP Peirce, Charles Sanders: Pragmatism"
    ]
   },
   {
    "id": "a_history_ancient_medieval",
    "fa": "تاریخ معرفت‌شناسی: باستان و سده‌های میانه",
    "en": "History: Ancient and Medieval",
    "desc_fa": "دیدگاه‌های افلاطون (تئایتتوس)، ارسطو، و معرفت‌شناسی سده‌های میانه دربارهٔ معرفت، اپیستمه و تخنه را بررسی می‌کند.",
    "key_questions_fa": [
     "معرفت در تئایتتوس چگونه تعریف می‌شود؟",
     "تمایز اپیستمه و تخنه چیست؟"
    ],
    "src": [
     "RCE ch.58",
     "RCE ch.59",
     "SEP plato-theaetetus",
     "IEP Aristotle: Epistemology",
     "SEP episteme-techne"
    ]
   },
   {
    "id": "a_history_modern",
    "fa": "تاریخ معرفت‌شناسی: دورهٔ مدرن",
    "en": "History: Early Modern and Kant",
    "desc_fa": "عقل‌گرایی و تجربه‌گرایی (دکارت، لاک، لایب‌نیتس، برکلی، هیوم، رید) و فلسفهٔ نقدی کانت را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا همهٔ معرفت از تجربه است؟",
     "کانت چگونه احکام ترکیبی پیشینی را ممکن می‌داند؟"
    ],
    "src": [
     "RCE ch.60–66",
     "SEP rationalism-empiricism",
     "SEP kant-transcendental-idealism"
    ]
   },
   {
    "id": "a_history_twentieth",
    "fa": "تاریخ معرفت‌شناسی: سدهٔ بیستم",
    "en": "History: Twentieth Century",
    "desc_fa": "معرفت‌شناسی راسل، ویتگنشتاین، کارنپ، کواین، آستین و چیزم را بررسی می‌کند.",
    "key_questions_fa": [
     "پوزیتیویسم منطقی معرفت را چگونه می‌فهمید؟",
     "کواین چه تغییری در معرفت‌شناسی ایجاد کرد؟"
    ],
    "src": [
     "RCE ch.67–71",
     "IEP Roderick M. Chisholm: Epistemology",
     "IEP Wittgenstein: Epistemology"
    ]
   },
   {
    "id": "a_cross_cultural",
    "fa": "سنت‌های غیرغربی معرفت‌شناسی",
    "en": "Non-Western Epistemological Traditions",
    "desc_fa": "معرفت‌شناسی هندی (پرامانه‌ها)، چینی، تبتی و آمریکای لاتین را بررسی می‌کند.",
    "key_questions_fa": [
     "منابع معتبر معرفت (پرامانه) در فلسفهٔ هندی کدام‌اند؟",
     "این سنت‌ها چه چیزی به بحث معاصر می‌افزایند؟"
    ],
    "src": [
     "SEP-toc Indian Philosophy (Classical): epistemology",
     "SEP-toc Chinese Philosophy: epistemology",
     "SEP epistemology-latin-america"
    ]
   }
  ]
 },
 {
  "id": "g_applied",
  "fa": "معرفت‌شناسی کاربردی، فناوری و اطلاعات",
  "en": "Applied Epistemology, Technology and Information",
  "areas": [
   {
    "id": "a_misinformation",
    "fa": "اطلاعات نادرست، اخبار جعلی و نظریه‌های توطئه",
    "en": "Misinformation, Fake News and Conspiracy Theories",
    "desc_fa": "ماهیت اطلاعات نادرست و دروغ‌پراکنی، اتاق‌های پژواک، قطبی‌شدن باور و عقلانیت باور به نظریه‌های توطئه را بررسی می‌کند.",
    "key_questions_fa": [
     "خبر جعلی چیست و چرا گسترش می‌یابد؟",
     "آیا باور به نظریه‌های توطئه همیشه نامعقول است؟",
     "اتاق پژواک با حباب معرفتی چه تفاوتی دارد؟"
    ],
    "src": [
     "FakeNews",
     "W&O",
     "IEP Conspiracy Theories"
    ]
   },
   {
    "id": "a_political_epistemology",
    "fa": "معرفت‌شناسی سیاسی و دموکراسی",
    "en": "Political Epistemology",
    "desc_fa": "ارزش معرفتی دموکراسی، خرد جمعی، و نقش معرفت در مشروعیت سیاسی را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا دموکراسی تصمیم‌های درست‌تری تولید می‌کند؟",
     "جهل رأی‌دهندگان چه پیامدی دارد؟"
    ],
    "src": [
     "Pritchard",
     "SEP-toc jury theorems",
     "SEP epistemology-social"
    ]
   },
   {
    "id": "a_education",
    "fa": "معرفت‌شناسی آموزش",
    "en": "Epistemology of Education",
    "desc_fa": "هدف‌های معرفتی آموزش (معرفت، فهم، تفکر نقادانه، فضیلت فکری) را بررسی می‌کند.",
    "key_questions_fa": [
     "هدف معرفتی آموزش چیست: انتقال معرفت یا پرورش فضیلت فکری؟",
     "آموزش تفکر نقادانه چه نسبتی با اعتماد به مرجع دارد؟"
    ],
    "src": [
     "Pritchard"
    ]
   },
   {
    "id": "a_technology_extended",
    "fa": "فناوری و معرفت گسترش‌یافته",
    "en": "Technology and Extended Knowledge",
    "desc_fa": "معرفت مبتنی بر ابزارها و فناوری (موتورهای جست‌وجو، اینترنت، ذهن گسترش‌یافته) را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا اطلاعات ذخیره‌شده در ابزار می‌تواند جزو معرفت ما باشد؟",
     "تکیه بر جست‌وجوی اینترنتی چه تأثیری بر فضیلت فکری دارد؟"
    ],
    "src": [
     "Pritchard"
    ]
   },
   {
    "id": "a_ai_machine",
    "fa": "معرفت‌شناسی هوش مصنوعی و ماشین",
    "en": "Epistemology of AI and Machines",
    "desc_fa": "اعتمادپذیری خروجی‌های سامانه‌های هوشمند، کدری (جعبهٔ سیاه)، گواهی ماشینی و امکان باور و معرفت در ماشین را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا می‌توان به خروجی الگوریتم کدر تکیه کرد و آن را معرفت دانست؟",
     "آیا گفتهٔ هوش مصنوعی نوعی گواهی است؟",
     "آیا ماشین می‌تواند دانا یا فهمنده باشد؟"
    ],
    "src": [
     "SEP ethics-ai",
     "SEP simulations-science",
     "Pritchard"
    ]
   }
  ]
 },
 {
  "id": "g_islamic",
  "fa": "سنت معرفت‌شناسی اسلامی",
  "en": "Islamic Epistemological Tradition",
  "areas": [
   {
    "id": "a_huduri_husuli",
    "fa": "علم حضوری و علم حصولی",
    "en": "Knowledge by Presence and Acquired (Representational) Knowledge",
    "desc_fa": "تقسیم علم به حضوری (بی‌واسطهٔ صورت ذهنی) و حصولی (با واسطهٔ مفهوم)، خطاناپذیری علم حضوری و ارجاع علوم حصولی به حضوری را بررسی می‌کند.",
    "key_questions_fa": [
     "علم حضوری چیست و مصادیق آن کدام‌اند؟",
     "آیا علم حضوری خطاناپذیر است؟",
     "آیا همهٔ علوم حصولی به علم حضوری بازمی‌گردند؟"
    ],
    "src": [
     "Mesbah",
     "SEP-ArabicMind"
    ],
    "book": [
     "s11",
     "s12",
     "s13",
     "s14",
     "s17",
     "s18",
     "s19",
     "s46"
    ]
   },
   {
    "id": "a_tasawwur_tasdiq",
    "fa": "تصور و تصدیق و ارزش معلومات",
    "en": "Conception, Assent and the Value of Knowledge",
    "desc_fa": "تقسیم علم حصولی به تصور و تصدیق، مسئلهٔ مطابقت (ارزش معلومات) و وجود ذهنی را بررسی می‌کند.",
    "key_questions_fa": [
     "تصور و تصدیق چه تفاوتی دارند؟",
     "چگونه مطابقت صورت ذهنی با واقع احراز می‌شود؟",
     "وجود ذهنی چیست و چه نقشی در معرفت دارد؟"
    ],
    "src": [
     "Mesbah",
     "SEP-ArabicMind"
    ],
    "book": [
     "s27",
     "s28",
     "s30",
     "s31"
    ]
   },
   {
    "id": "a_concept_types",
    "fa": "مفاهیم ماهوی، فلسفی و منطقی (معقولات اولی و ثانیه)",
    "en": "Types of Concepts: Primary and Secondary Intelligibles",
    "desc_fa": "تقسیم مفاهیم کلی به ماهوی (معقول اول)، فلسفی و منطقی (معقولات ثانیه) و منشأ انتزاع آن‌ها را بررسی می‌کند.",
    "key_questions_fa": [
     "معقولات ثانیهٔ فلسفی چگونه از واقعیت انتزاع می‌شوند؟",
     "آیا مفاهیمی چون علیت ساختهٔ ذهن‌اند؟",
     "تفاوت معقول ثانی فلسفی و منطقی چیست؟"
    ],
    "src": [
     "Mesbah"
    ],
    "book": [
     "s33",
     "s34",
     "s35",
     "s36"
    ]
   },
   {
    "id": "a_badihiyyat",
    "fa": "بدیهیات و مبادی یقین",
    "en": "Self-Evident Propositions (Badīhiyyāt) and Principles of Certainty",
    "desc_fa": "تقسیم قضایا به بدیهی و نظری، بدیهیات اولیه و ثانویه (اولیات، وجدانیات، محسوسات، تجربیات، حدسیات، فطریات) و ملاک بداهت را بررسی می‌کند؛ صورت اسلامی مبناگرایی.",
    "key_questions_fa": [
     "ملاک بدیهی بودن یک قضیه چیست؟",
     "آیا تجربیات و حدسیات یقین‌آورند؟",
     "چگونه نظریات به بدیهیات بازمی‌گردند؟"
    ],
    "src": [
     "Mesbah",
     "SEP ibn-sina"
    ],
    "book": [
     "s39",
     "s40"
    ]
   },
   {
    "id": "a_tawatur",
    "fa": "تواتر و خبر",
    "en": "Mass-Transmitted Report (Tawātur) and Testimony",
    "desc_fa": "یقین‌آوری خبر متواتر، شرایط تواتر و اعتبار خبر واحد را، در نسبت با بحث گواهی، بررسی می‌کند.",
    "key_questions_fa": [
     "چرا خبر متواتر یقین‌آور است؟",
     "چه شمار و شرایطی تواتر را محقق می‌کند؟",
     "خبر واحد در چه شرایطی حجت است؟"
    ],
    "src": [
     "Mesbah",
     "SEP ibn-sina"
    ],
    "book": [
     "s48"
    ]
   },
   {
    "id": "a_wahy_ilham",
    "fa": "وحی و الهام",
    "en": "Revelation and Inspiration as Sources of Knowledge",
    "desc_fa": "وحی و الهام را به‌عنوان منبع معرفت، ویژگی‌های معرفت وحیانی و راه‌های احراز آن بررسی می‌کند.",
    "key_questions_fa": [
     "آیا وحی منبع مستقل معرفت است؟",
     "معرفت وحیانی چه نسبتی با عقل دارد؟",
     "چگونه می‌توان الهام حقیقی را از خیال بازشناخت؟"
    ],
    "src": [
     "Mesbah",
     "SEP religion-epistemology"
    ],
    "book": [
     "s25",
     "s72"
    ]
   },
   {
    "id": "a_mystical_intuition",
    "fa": "شهود عرفانی",
    "en": "Mystical Intuition (Kashf / Shuhūd)",
    "desc_fa": "اعتبار معرفتی شهود و کشف عرفانی، معیارهای سنجش آن و انتقال‌پذیری‌اش را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا شهود عرفانی برای دیگران حجت است؟",
     "معیار سنجش کشف صحیح از ناصحیح چیست؟"
    ],
    "src": [
     "Emadzadeh",
     "SEP mysticism",
     "SEP religious-experience"
    ],
    "book": [
     "s23",
     "s24",
     "s42"
    ]
   },
   {
    "id": "a_religious_hermeneutics",
    "fa": "فهم متون دینی: حجیت ظواهر و قرائت‌ها",
    "en": "Interpretation of Religious Texts: Authority of Apparent Meaning and Plural Readings",
    "desc_fa": "حجیت ظواهر متون، امکان قرائت‌های گوناگون از دین و نسبت معرفت دینی با دین (ثابت و متغیر) را بررسی می‌کند.",
    "key_questions_fa": [
     "آیا ظاهر متن دینی حجت است؟",
     "آیا قرائت‌های متکثر از دین همه معتبرند؟",
     "معرفت دینی چه نسبتی با خود دین دارد؟"
    ],
    "src": [
     "Wikifeqh",
     "Mesbah"
    ],
    "book": [
     "s64",
     "s65",
     "s67",
     "s68",
     "s69",
     "s70",
     "s76",
     "s77",
     "s78",
     "s85"
    ]
   },
   {
    "id": "a_pluralism",
    "fa": "کثرت‌گرایی دینی و معرفتی",
    "en": "Religious and Epistemic Pluralism",
    "desc_fa": "این دیدگاه را بررسی می‌کند که چند نظام باور ناسازگار می‌توانند هم‌زمان حق یا موجه باشند، و نسبت آن با نسبی‌گرایی.",
    "key_questions_fa": [
     "آیا ادیان متعارض می‌توانند همگی حق باشند؟",
     "آیا کثرت‌گرایی به نسبی‌گرایی معرفتی می‌انجامد؟"
    ],
    "src": [
     "SEP religion-epistemology",
     "IEP Disagreement, Religious",
     "Wikifeqh"
    ],
    "book": [
     "s81",
     "s82",
     "s83",
     "s86",
     "s87"
    ]
   }
  ]
 }
];
})(typeof window !== "undefined" ? window : globalThis);
