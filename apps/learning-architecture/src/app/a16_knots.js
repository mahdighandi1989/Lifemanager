/* ===== «گره‌گشا» (۱): ثبتِ موقعیت، تونل‌های ۰ تا ۴، دادهٔ ۱۲ خانواده و پیوندها =====
   طرحِ مرجع: docs/specs/KNOTS.md (بندِ ۱۲ «اصلاحاتِ الزامی» بر متنِ پیشین برتر است؛ بندِ ۱۳ قراردادِ میانِ ماژول‌ها).
   اصل‌ها: تشخیص فرضیه است و ریشه را خودِ کاربر تأیید می‌کند · همهٔ ۱۲ خانواده همیشه دیده می‌شوند و رتبه فقط ترتیبِ بررسی است ·
   رتبه از قواعدِ قطعی روی ورودی و شاهدها (وزن‌ها ثابت و در همین داده) · دیدن ≠ نوشتن: موقعیت با اولین ورودیِ واقعی ساخته
   می‌شود و نمایش هیچ چیز ذخیره نمی‌کند · هوش مصنوعی فقط پیشنهاد می‌دهد، پس از بررسیِ ایمنی و اعلامِ «ارسال به ارائه‌دهندهٔ
   بیرونی»، و هرگز دربارهٔ حالِ درونیِ شخصِ سوم یا تشخیصِ بالینی. ورزش (قدمِ ۵–۶) در a17 و نقشه/شبیه‌سازها در a18 است. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S;

  /* ---------- ابزارها ---------- */
  function norm(s) {
    return String(s == null ? "" : s).toLowerCase().replace(/[ً-ْٰ]/g, "").replace(/[‌‍‎‏]/g, " ")
      .replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[۰-۹]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); })
      .replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).replace(/\s+/g, " ").trim();
  }
  function K(it, k) { return (it.kinds || []).indexOf(k) >= 0; }
  function ST(it, id) { return (it.stmts || []).indexOf(id) >= 0; }
  function N(v) { return v === "" || v == null || isNaN(+v) ? null : +v; }
  function GE(it, k, n) { var v = N(it[k]); return v != null && v >= n; }
  function TX(it) { return norm([it.claim, it.thoughts, it.what, it.actual].join(" ")); }
  function CL(it) { return norm(it.claim); }
  function now() { return new Date().toISOString(); }
  function r2(x) { return Math.round(x * 100) / 100; }
  function sgn(x) { return (x > 0 ? "+" : x < 0 ? "−" : "") + fa(String(Math.abs(r2(x))).replace(".", "٫")); }
  A.knNorm = norm;

  /* ---------- ورودی: نوع‌ها و جمله‌های آشنا (نشانه‌های §۴ به زبانِ خودِ کاربر) ---------- */
  var KINDS = [["problem", "مسئلهٔ حل‌نشده (هوش، ریاضی، فیزیک، منطق، علمی)"], ["behavior", "رفتار یا واکنشِ خودم"], ["social", "نتیجهٔ اجتماعی یا کاری"],
    ["emotion", "احساس یا حالتی که مانع شد"], ["repeat", "خطای تکراری"], ["inference", "برداشتی که از یک اتفاق کردم"]];
  var KINDFA = {}; KINDS.forEach(function (k) { KINDFA[k[0]] = k[1]; });
  var STMT = [
    ["s_rule", "«بعد از دیدنِ جواب، یک قاعده/فرمول را نمی‌شناختم.»"],
    ["s_reread", "«بعد که دوباره خواندم دیدم…» (چیزی را جا انداخته یا بد خوانده بودم)"],
    ["s_cant", "«فکر کردم نباید/نمی‌شود…» (قیدی را فرض کردم)"],
    ["s_oneway", "«یک راه را تا آخر رفتم و دیگری به ذهنم نرسید.»"],
    ["s_complex", "«جواب ساده بود ولی من پیچیده رفتم.»"],
    ["s_sure", "«مطمئن بودم درست است.»"],
    ["s_wrongsure", "پاسخم غلط بود، با اطمینانِ بالا."],
    ["s_long", "«وقتِ زیادی روی یک چیز ماندم.»"],
    ["s_juggle", "«چند چیز را هم‌زمان در ذهن نگه داشتم.»"],
    ["s_later", "بعداً در آرامش راحت حل شد."],
    ["s_nothink", "«بی‌فکر انجامش دادم.»"],
    ["s_always", "«همیشه همین‌طور می‌کنم.»"],
    ["s_afraid", "«نمی‌خواستم اشتباه کنم/احمق به نظر برسم.»"],
    ["s_knowmore", "«بیشتر می‌دانم ولی…»"],
    ["s_unheard", "«حرفم را نشنیدند.»"],
    ["s_unwritten", "«قوانینِ نانوشته» در کار است."],
    ["s_disputed", "پاسخِ «درست» محلِ اختلاف است."],
    ["s_shouldbut", "«می‌دانستم باید… ولی»"],
    ["s_sunk", "«چون وقت/پول گذاشته بودم ادامه دادم.»"],
    ["s_sooner", "«فکر می‌کردم زودتر تمام می‌شود.»"],
    ["s_popular", "این «آزمون» یا قاعده را از یک فرد یا شبکهٔ اجتماعی شنیده‌ام."]
  ];
  A.KSTMT = STMT; A.KKINDS = KINDS;
  var RE_ALWAYS = /همیشه|هیچ ?وقت|هرگز|آدم .{0,25}نیستم|هیچ ?وقت .{0,30}نمی/;
  /* «همیشه/هیچ‌وقت» فقط وقتی شاهدِ «باور دربارهٔ خود» است که جمله دربارهٔ خودِ گوینده باشد (اول‌شخص): «آشیل هیچ‌وقت نمی‌رسد» دربارهٔ تو نیست
     (مالک ۲۰۲۶-۱۰-۱۵: «همه چیز باید به بدیهیات برگردد» — شاهد باید دربارهٔ همان چیزی باشد که فرضیه می‌گوید؛ کارزارِ دوم c15) */
  var RE_FP = /(^|\s)(من|خودم|مرا|منو|منم)(\s|$)|(^|\s)(ن?می ?\S+م|\S*(?:ستم|بودم|کردم|شدم|دارم|تونم|توانم|کنم|فهمم|بلدم))(\s|$)/;
  function alwaysSelf(it) { return norm([it.claim, it.thoughts, it.what].join("\n")).split(/[.!؟?\n،;]+/).some(function (x) { return RE_ALWAYS.test(x) && RE_FP.test(x.trim()); }); }
  A.knotAlwaysSelf = alwaysSelf;
  /* باورِ کلی دربارهٔ توانِ خود (F9): «بلد نیستم»، «نمی‌تونم/نمی‌توانم»، «استعدادش را/رو ندارم» هم (ممیزی ۲۰۲۶-۱۰-۱۲) */
  var RE_SELF = /(بیشتر|بهتر|کمتر|بدتر|برتر|باهوش ?تر|ضعیف ?تر|قوی ?تر|زرنگ ?تر) از|از .{0,25}(بیشتر|بهتر|کمتر|بدتر|برتر)|باهوش|کودن|بی ?استعداد|استعداد ندارم|استعداد ?(?:ش|اش|شو) ?(?:را |رو )?ندارم|بلد نیستم|نمی ?(?:تونم|توانم)|بی ?عرضه|احمقم|ناتوانم/;
  var RE_INFER = /نشان می ?ده|نشون می ?ده|یعنی من|پس من|ثابت می ?کن|معلوم شد که من|معلوم میشه که من/;

  /* ---------- آزمون‌ها: وزنِ شاهد بر پایهٔ نوع (§۱۲.۳: مقایسهٔ عملکرد ±۳، گزارشِ واقعیت ±۱، پیش‌بینیِ خلافِ واقعِ خود ±۰٫۵ — Nisbett & Wilson 1977)؛
     بازشدن در یک پلهٔ نردبان فقط شاهدِ ضعیف +۱ (§۱۲.۲) ---------- */
  var KW = { contrast: 3, fact: 1, counterfactual: 0.5, ladder: 1, control: 1, manual: 1 };
  var KWFA = { contrast: "مقایسهٔ عملکرد", fact: "گزارشِ واقعیت", counterfactual: "پیش‌بینیِ خلافِ واقعِ خود", ladder: "پلهٔ نردبان (شاهدِ ضعیف)", control: "پلهٔ کنترل (شاهدِ ضعیف)", manual: "شاهدِ دستی" };
  A.KEVW = KW; A.KEVFA = KWFA;
  /* P = یک آزمون. opts: [{v, fa, ev:[[fam, dir, sub]]}]؛ need:"problem" ⇒ فقط وقتی نوعِ موقعیت «مسئله» است؛ iso ⇒ اگر پاسخ دیده شده یا نردبان
     قفل را باز کرده، باید روی «هم‌ریخت» انجام شود (§۱۲.۱). */
  function P(id, kind, faT, ask, opts, x) {
    x = x || {};
    var p = { id: id, kind: kind, fa: faT, ask: ask, opts: opts, need: x.need || "", iso: !!x.iso, input: x.input || "", note: x.note || "", nums: x.nums || null };
    p.scoreFrom = x.score || function (ans) {
      var o = (opts || []).filter(function (q) { return q.v === (ans && ans.v); })[0];
      return o && o.ev ? o.ev.map(function (e) { return { fam: e[0], dir: e[1], sub: e[2] || "" }; }) : [];
    };
    return p;
  }
  function O(v, faT, ev) { return { v: v, fa: faT, ev: ev || [] }; }
  function T(tid, note, sub) { return { tid: tid, note: note || "", sub: sub || "" }; }
  function X(key, faT, src, ev, how, sub) { return { ext: key, fa: faT, src: src, ev: ev, how: how, sub: sub || "" }; }

  /* ---------- ۱۲ خانواده (§۴ + زیرنوع‌های افزودهٔ §۱۲.۱۳). منبع‌ها عیناً از طرح؛ چیزی افزوده نشده. ---------- */
  var IMPL_HOW = "یک جملهٔ «اگر [نشانهٔ مشخصِ موقعیت] پیش آمد، آنگاه [رفتارِ مشخص] را انجام می‌دهم» بنویس؛ نشانه باید دیدنی باشد، نه یک حس.";
  A.KF = [
    { id: "F1", fa: "دانش و مفهوم", blurb: "مفهومِ لازم کم است، بد فهمیده شده، یا هست ولی سرِ بزنگاه فعال نمی‌شود.",
      subs: [{ id: "gap", fa: "کمبودِ مفهومِ پیش‌نیاز", src: "" }, { id: "mis", fa: "بدفهمی", src: "Posner et al. 1982؛ Chi 2008" },
        { id: "inert", fa: "دانشِ «بی‌اثر» (هست ولی فعال نمی‌شود)", src: "Whitehead 1929؛ Gick & Holyoak 1980" },
        { id: "fluency", fa: "کمبودِ مهارت/روانی («می‌دانم ولی نمی‌توانم اجرا کنم») — تمرین نه توضیح", src: "" }],
      signals: [{ id: "F1.k", kind: 1, fa: "نوعِ موقعیت: مسئله", w: 1, test: function (it) { return K(it, "problem"); } },
        { id: "F1.rule", fa: STMT[0][1], w: 3, test: function (it) { return ST(it, "s_rule"); } }],
      probes: [
        P("f1_def", "fact", "تعریف از حافظه", "مفهومِ کلیدیِ این مسئله را (اگر می‌دانی کدام است) از حافظه تعریف کن و یک مثال بزن.", [
          O("no", "نتوانستم تعریفش کنم", [["F1", 1, "gap"]]), O("unused", "توانستم، ولی در مسئله به کارش نبردم", [["F1", 1, "inert"]]), O("used", "توانستم و به کار هم بردم", [["F1", -1, ["gap", "inert"]]])], { need: "problem", input: "مفهوم (اختیاری)" }),
        P("f1_named", "contrast", "مفهوم نام‌برده/نشده", "روی هم‌ریخت (یا همین مسئله اگر هنوز بازش نکرده‌ای): اول بی‌کمک تلاش کن؛ اگر نشد، فقط «نامِ مفهومِ کلیدی» را ببین و دوباره تلاش کن.", [
          O("only", "فقط با نامِ مفهوم حل شد", [["F1", 1]]), O("without", "بی‌نامِ مفهوم هم حل شد", [["F1", -1, ["gap", "inert"]]]), O("neither", "با نامِ مفهوم هم حل نشد", [["F1", -1, ["inert"]]])], { need: "problem", iso: true, note: "«با نام هم نشد» می‌تواند کمبودِ روانی (زیرنوعِ آخر) باشد، نه نبودنِ مفهوم — در ریشه سنجیده می‌شود." })],
      acts: [T(41), T(28), T(45), T(13, "برای بدفهمی", "mis"),
        X("refute", "«متنِ ردیه»", "Tippett 2010", "", "یک متنِ کوتاه بنویس که (۱) بدفهمیِ رایج را صریح بیان کند، (۲) صریح بگوید چرا نادرست است، و (۳) تبیینِ درست را با یک مثالِ آزمون‌پذیر بیاورد.", "mis"),
        T(7, "شناختِ نوعِ مسئله — برای دانشِ بی‌اثر", "inert"), T(43, "برای دانشِ بی‌اثر", "inert"), { farm: true, fa: "نهالِ «گره شخصی» در مزرعه", note: "اگر گره به یک مفهومِ علمی برمی‌گردد" }] },
    { id: "F2", fa: "بازنماییِ مسئله", blurb: "صورت دقیق خوانده یا مدل نشده، بازنمایی غلط است، یا قیدی خودساخته راه را بسته.",
      subs: [{ id: "read", fa: "صورت را دقیق نخواندم/مدل نساختم", src: "Kintsch 1998" },
        { id: "rep", fa: "بازنماییِ غلط و قیدِ خودساخته", src: "Ohlsson 1992؛ Knoblich et al. 1999 (حساب‌های چوب‌کبریتی)؛ Kershaw & Ohlsson 2004 — داستانِ رایجِ «نُه نقطه» محلِ مناقشه است: Weisberg & Alba 1981" },
        { id: "ignore", fa: "اطلاعات را نادیده گرفتم", src: "" }, { id: "attn", fa: "کورِ توجهی و تلهٔ ادراکی", src: "" },
        { id: "term", fa: "بدخوانیِ اصطلاح/واژهٔ دوپهلو (از جمله فارسی/انگلیسی)", src: "" }],
      signals: [{ id: "F2.k", kind: 1, fa: "نوعِ موقعیت: مسئله", w: 1, test: function (it) { return K(it, "problem"); } },
        { id: "F2.reread", fa: STMT[1][1], w: 3, test: function (it) { return ST(it, "s_reread"); } },
        { id: "F2.cant", fa: STMT[2][1], w: 2, test: function (it) { return ST(it, "s_cant"); } }],
      probes: [
        P("f2_restate", "fact", "بازگویی بی‌نگاه", "هدف، همهٔ داده‌ها و همهٔ قیدها را بی‌نگاه به صورت بنویس؛ بعد با صورت مقایسه کن.", [
          O("miss", "چیزی جا انداختم یا اشتباه گفتم", [["F2", 1, "read"]]), O("ok", "کامل و درست بود", [["F2", -1, ["read"]]])], { need: "problem" }),
        P("f2_selfcon", "fact", "قیدِ خودساخته", "کدام قیدها را خودت فرض کردی که در صورتِ مسئله نبود؟", [
          O("found", "دست‌کم یکی پیدا کردم", [["F2", 1, "rep"]]), O("none", "هیچ", [["F2", -1, []]])], { need: "problem", input: "کدام قید؟ (اختیاری)" }),
        P("f2_given", "contrast", "بازنمایی داده‌شده/نشده", "روی هم‌ریخت (یا همین مسئله اگر هنوز بازش نکرده‌ای): اول بی‌کمک؛ اگر نشد، یک بازنماییِ درست (رسم، جدول یا مدلِ موقعیت) را ببین و دوباره تلاش کن.", [
          O("only", "فقط با بازنماییِ داده‌شده حل شد", [["F2", 1, "rep"]]), O("without", "بی‌آن هم حل شد", [["F2", -1, ["rep"]]]), O("neither", "با آن هم حل نشد", [["F2", -1, ["rep"]]])], { need: "problem", iso: true })],
      acts: [T(36), T(15, "قیدهای خودساخته"), T(14), T(26), T(38), T(5)] },
    { id: "F3", fa: "راهبرد و گیرکردن", blurb: "یک راه ذهن را قفل کرده، کارکردِ آشنا راهِ دیگر را پوشانده، یا رپرتوارِ اکتشافی کم است.",
      subs: [{ id: "einst", fa: "اثرِ آمادگیِ ذهنی (Einstellung)", src: "Luchins 1942؛ Bilalić et al. 2008" }, { id: "fixed", fa: "تثبیتِ کارکردی", src: "Duncker 1945" },
        { id: "early", fa: "بستنِ زودهنگام/اولین راه", src: "" }, { id: "heur", fa: "نبودِ رپرتوارِ اکتشافی (حالتِ خاص، از آخر به اول، رسم)", src: "Pólya 1945" },
        { id: "level", fa: "سطحِ نادرست (جزئیات ↔ تصویرِ کل)", src: "" }],
      signals: [{ id: "F3.k", kind: 1, fa: "نوعِ موقعیت: مسئله", w: 1, test: function (it) { return K(it, "problem"); } },
        { id: "F3.one", fa: STMT[3][1], w: 3, test: function (it) { return ST(it, "s_oneway"); } },
        { id: "F3.cx", fa: STMT[4][1], w: 2, test: function (it) { return ST(it, "s_complex"); } }],
      probes: [
        P("f3_count", "fact", "شمارِ راه‌ها", "چند راهِ واقعاً متفاوت امتحان کردی؟ نامشان را بنویس.", [
          O("one", "فقط یک راه", [["F3", 1, "einst"]]), O("more", "دو راه یا بیشتر", [["F3", -1, ["einst", "early"]]])], { need: "problem", input: "راه‌ها (اختیاری)" }),
        P("f3_back", "counterfactual", "اگر از آخر…", "اگر از آخر، از یک حالتِ خاص یا با رسم شروع می‌کردی، فکر می‌کنی باز می‌شد؟", [
          O("yes", "احتمالاً بله", [["F3", 1, "heur"]]), O("no", "نه", [["F3", -1, []]])], { need: "problem" }),
        P("f3_hint", "contrast", "راهنماییِ راهبرد با/بی", "روی هم‌ریخت (یا همین مسئله اگر هنوز بازش نکرده‌ای): اول بی‌کمک؛ اگر نشد، فقط یک راهنماییِ راهبرد («از آخر»، «حالتِ خاص»، «قرینه») را ببین و دوباره تلاش کن.", [
          O("only", "فقط با راهنماییِ راهبرد حل شد", [["F3", 1, "heur"]]), O("without", "بی‌آن هم حل شد", [["F3", -1, ["heur"]]]), O("neither", "با آن هم حل نشد", [["F3", -1, ["heur"]]])], { need: "problem", iso: true })],
      acts: [T(11), { pid: "P7", fa: "حل از ۳ مسیر" }, T(14), T(1), T(6), T(5), T(7), T(43),
        /* «مسئله‌های بزرگ» ِ کارخانه (a8_prob، نمای e_prob): پیوندِ معنایی، نه تکنیک — آخرِ فهرست */
        { prob: true, fa: "مسئله‌های بزرگ", note: "تمرینِ انتخابِ حرکتِ بعدی در گام‌به‌گامِ حلِ مسئلهٔ خودت (و مسئله‌هایی که خودت وارد کرده‌ای)؛ همان مهارتِ «عوض‌کردنِ راه»" }] },
    { id: "F4", fa: "پایش و فراشناخت", blurb: "وارسی نشد، اطمینان بیش از درستی بود، یا قاعدهٔ توقف (زود ول کردن/زیاد ماندن) بد بود.",
      subs: [{ id: "nocheck", fa: "بی‌وارسی", src: "" },
        { id: "over", fa: "اطمینانِ بیش‌ازحد/توهمِ فهم", src: "Koriat 1997؛ Kruger & Dunning 1999 — با برچسبِ «مناقشهٔ آماری»: Gignac & Zajenkowski 2020" },
        { id: "unaware", fa: "نفهمیدنِ اینکه گیر کرده‌ام", src: "" }, { id: "stop", fa: "قاعدهٔ توقفِ بد (زود ول کردن/زیاد ماندن)", src: "" }],
      signals: [{ id: "F4.sure", fa: STMT[5][1], w: 2, test: function (it) { return ST(it, "s_sure"); } },
        { id: "F4.wrong", fa: STMT[6][1], w: 3, test: function (it) { return ST(it, "s_wrongsure"); } },
        { id: "F4.long", fa: STMT[7][1], w: 2, test: function (it) { return ST(it, "s_long"); } }],
      probes: [
        P("f4_where", "fact", "کجا وارسی کردی؟", "پیش از اعلامِ پاسخ یا تصمیم، کجا و چطور وارسی کردی؟", [
          O("none", "هیچ‌جا", [["F4", 1, "nocheck"]]), O("some", "دست‌کم یک وارسیِ واقعی", [["F4", -1, ["nocheck"]]])]),
        P("f4_conf", "fact", "اطمینان پیش از نتیجه", "پیش از دیدنِ نتیجه چقدر مطمئن بودی، و نتیجه چه شد؟", [
          O("hiwrong", "۸۰٪ یا بیشتر، و غلط بود", [["F4", 1, "over"]]), O("lowrong", "مطمئن نبودم، و غلط بود", [["F4", -1, ["over"]]]), O("right", "نتیجه درست بود", [])])],
      acts: [T(32), T(24), T(23), T(25), T(22)] },
    { id: "F5", fa: "ظرفیت و حالتِ ذهنی", blurb: "بارِ حافظهٔ کاری، فشارِ زمان، خستگی یا حالتِ بدن جا را برای فکر تنگ کرده.",
      subs: [{ id: "wm", fa: "بارِ حافظهٔ کاری", src: "Sweller 1988؛ Cowan 2001" }, { id: "choke", fa: "فشارِ زمان/استرس و «کم‌آوردن زیرِ فشار» در ریاضی", src: "Beilock & Carr 2005" },
        { id: "tired", fa: "خستگی", src: "" }, { id: "anx", fa: "اضطرابِ آزمون", src: "" },
        { id: "body", fa: "خواب، گرسنگی، بیماری، دارو — فقط پرسش و ارجاع", src: "" }],
      signals: [{ id: "F5.press", fa: "فشارِ زمان ۷ یا بیشتر", w: 2, test: function (it) { return GE(it, "pressure", 7); } },
        { id: "F5.emo", fa: "شدتِ احساس ۷ یا بیشتر", w: 2, test: function (it) { return GE(it, "emo", 7); } },
        { id: "F5.tired", fa: "خستگی ۷ یا بیشتر", w: 2, test: function (it) { return GE(it, "fatigue", 7); } },
        { id: "F5.jug", fa: STMT[8][1], w: 2, test: function (it) { return ST(it, "s_juggle"); } },
        { id: "F5.later", fa: STMT[9][1], w: 3, test: function (it) { return ST(it, "s_later"); } }],
      probes: [
        P("f5_calm", "contrast", "بی‌فشار، با کاغذ", "همین را (یا هم‌ریختش را، اگر پاسخ را دیده‌ای) حالا بی‌فشارِ زمان و با کاغذ حل کن.", [
          O("solved", "حل شد", [["F5", 1, "choke"]]), O("not", "حل نشد", [["F5", -1, ["choke", "anx", "wm"]]])], { need: "problem", iso: true }),
        P("f5_items", "fact", "اقلامِ هم‌زمان", "در آن لحظه چند قلم (عدد، قید، گام) را هم‌زمان در ذهن نگه می‌داشتی؟", [
          O("many", "زیاد — بیش از حدودِ چهار قلم", [["F5", 1, "wm"]]), O("few", "کم", [["F5", -1, ["wm"]]])]),
        P("f5_body", "fact", "خواب، گرسنگی، بیماری، دارو", "خواب، گرسنگی، بیماری یا دارو در آن لحظه نقشی داشت؟", [
          O("maybe", "بله یا شاید", [["F5", 1, "body"]]), O("no", "نه", [])], { note: "این فقط ثبت می‌شود؛ ابزار دربارهٔ بدن و سلامت چیزی تشخیص نمی‌دهد. اگر تکرار می‌شود، با پزشک مطرحش کن." })],
      acts: [T(37, "بیرون‌ریزی روی کاغذ"), T(26),
        X("reappraise", "بازارزیابیِ برانگیختگی", "Jamieson et al. 2010", "شواهدِ محدود", "پیش از آزمون به خودت یادآوری کن که تپشِ قلب و برانگیختگی می‌تواند به عملکرد کمک کند و لزوماً نشانهٔ شکست نیست."),
        X("expressive", "نوشتنِ بیانگر پیش از آزمون", "Ramirez & Beilock 2011", "تکرارهای ناهمسو", "حدودِ ۱۰ دقیقه پیش از آزمون، نگرانی‌هایت دربارهٔ همان آزمون را آزادانه بنویس.")] },
    { id: "F6", fa: "عادت و خودکاری (رفتار و حرکت)", blurb: "پاسخِ عادتی یا خودکار پیش از انتخاب اجرا شده؛ یا برنامه‌ریزیِ حرکت برای کارِ بعدی شکلش را تعیین کرده.",
      subs: [{ id: "dom", fa: "پاسخِ غالب/عادتی — لغزشِ عمل", src: "Norman 1981؛ Reason 1990" },
        { id: "motor", fa: "برنامه‌ریزیِ حرکتی (اثرِ «راحتیِ وضعیتِ پایانی»)", src: "Rosenbaum et al. 1990" }, { id: "auto", fa: "کنشِ خودکارِ بی‌توجه", src: "" }],
      signals: [{ id: "F6.k", kind: 1, fa: "نوعِ موقعیت: رفتار", w: 2, test: function (it) { return K(it, "behavior"); } },
        { id: "F6.nt", fa: STMT[10][1], w: 3, test: function (it) { return ST(it, "s_nothink"); } },
        { id: "F6.al", fa: STMT[11][1], w: 2, test: function (it) { return ST(it, "s_always"); } }],
      probes: [
        P("f6_pause", "counterfactual", "یک ثانیه مکث", "اگر پیش از انجام یک ثانیه مکث می‌کردی، همان را می‌کردی؟", [
          O("no", "احتمالاً نه", [["F6", 1, "dom"]]), O("same", "بله، همان را", [["F6", -1, []]])]),
        P("f6_similar", "fact", "در موقعیت‌های مشابه", "در موقعیت‌های مشابه هم همین را می‌کنی؟ (دیده‌ای، نه حدس)", [
          O("yes", "بله، دیده‌ام", [["F6", 1, "auto"]]), O("no", "نه", [["F6", -1, ["dom", "auto"]]])]),
        P("f6_motor", "fact", "کارِ بعدیِ دست", "اگر حرکتی بود: کدام شکل برای کارِ بعدیِ دست راحت‌تر بود؟", [
          O("mine", "شکلی که انتخاب کردم برای کارِ بعدی راحت‌تر بود", [["F6", 1, "motor"]]), O("same", "فرقی نداشت", [])],
          { note: "«راحتیِ وضعیتِ پایانی» دربارهٔ گرفتنِ یک شیء برای کارِ بعدی است؛ برای دیدنِ ناخن فقط قیاسی حدسی است، نه شاهد. خودِ «آزمونِ ناخن» عامیانه است (قدمِ ۰ و خانوادهٔ ۱۱)." })],
      acts: [T(23), T(21, "آزمایشِ رفتاری"), X("impl", "قصدِ اجرایی «اگر… آنگاه…»", "Gollwitzer 1999", "", IMPL_HOW),
        X("vary", "تنوعِ عمدی", "", "منبعی در طرح برایش ذکر نشده؛ پیشنهادِ طراحی است", "گاه‌به‌گاه عمداً شکلِ دیگرِ همان کار را انجام بده تا انتخاب از خودکاری بیرون بیاید.")] },
    { id: "F7", fa: "هیجان و انگیزه", blurb: "اجتناب، محافظت از خود و ترس از قضاوت‌شدن، یا خواستنِ یک نتیجه، مسیر را کج کرده.",
      subs: [{ id: "avoid", fa: "اجتناب", src: "" }, { id: "protect", fa: "محافظت از خود/ترس از قضاوت‌شدن", src: "" }, { id: "motiv", fa: "استدلالِ انگیزه‌دار", src: "Kunda 1990" }],
      signals: [{ id: "F7.emo", fa: "احساسِ شدید (۷ یا بیشتر) یا نوعِ «احساسی که مانع شد»", w: 2, test: function (it) { return GE(it, "emo", 7) || K(it, "emotion"); } },
        { id: "F7.oth", fa: "حضورِ دیگران/ارزیابی‌شدن", w: 2, test: function (it) { return it.others === "yes"; } },
        { id: "F7.af", fa: STMT[12][1], w: 3, test: function (it) { return ST(it, "s_afraid"); } }],
      probes: [
        P("f7_unseen", "counterfactual", "اگر کسی نمی‌دید", "اگر کسی نمی‌دید یا نتیجه مهم نبود، همین را می‌کردی؟", [
          O("diff", "نه، فرق می‌کرد", [["F7", 1, "protect"]]), O("same", "همین را می‌کردم", [["F7", -1, []]])]),
        P("f7_lose", "counterfactual", "چه از دست می‌رفت؟", "چه چیزی را از دست می‌دادی اگر طورِ دیگری رفتار می‌کردی؟", [
          O("some", "چیزی مثلِ آبرو، تأیید یا امنیت", [["F7", 1, "avoid"]]), O("nothing", "چیزی از دست نمی‌رفت", [["F7", -1, []]])], { input: "چه چیزی؟ (خصوصی؛ اختیاری)" })],
      acts: [T(21, "آزمایشِ رفتاری با پیش‌بینیِ ثبت‌شده"), T(35),
        X("bexp", "آزمایشِ رفتاری با پیش‌بینیِ ثبت‌شده", "Bennett-Levy et al. 2004", "برگرفته از درمانِ شناختی-رفتاری — این‌جا بی هیچ ادعای درمانی",
          "پیش‌بینیِ نگران‌کننده‌ات را دقیق و با درصد بنویس، یک کارِ کوچک که آن را می‌آزماید انجام بده، و نتیجه را ثبت و با پیش‌بینی مقایسه کن.")] },
    { id: "F8", fa: "اجتماعی و ارتباطی", blurb: "دانستن با اثرگذاشتن یکی نیست: قاب‌بندی، نشانه‌های اطمینان، زمان‌بندی، اعتماد و رسانه هم تعیین می‌کنند.",
      subs: [{ id: "curse", fa: "نفرینِ دانش", src: "Camerer et al. 1989؛ Newton 1990، رسالهٔ دکتریِ منتشرنشده: ضربه‌زن‌ها ۵۰٪ پیش‌بینی کردند، شنونده‌ها ۲٫۵٪ حدس زدند" },
        { id: "frame", fa: "قاب‌بندی برای هدفِ مخاطب", src: "" }, { id: "conf", fa: "نشانه‌های اطمینان (اطمینان و غلبه به‌عنوانِ شایستگی خوانده می‌شود)", src: "Anderson & Kilduff 2009" },
        { id: "transp", fa: "توهمِ شفافیت", src: "Gilovich, Savitsky & Medvec 1998" }, { id: "timing", fa: "زمان‌بندی و اول‌گفتن", src: "" },
        { id: "trust", fa: "سرمایهٔ اعتماد و رابطه", src: "" }, { id: "visible", fa: "دیده‌شدن", src: "" }, { id: "express", fa: "مهارتِ ابرازگری و مذاکره", src: "" }, { id: "medium", fa: "انتخابِ رسانه", src: "" }],
      signals: [{ id: "F8.k", kind: 1, fa: "نوعِ موقعیت: اجتماعی/کاری", w: 2, test: function (it) { return K(it, "social"); } },
        { id: "F8.km", fa: STMT[13][1], w: 3, test: function (it) { return ST(it, "s_knowmore"); } },
        { id: "F8.uh", fa: STMT[14][1], w: 2, test: function (it) { return ST(it, "s_unheard"); } }],
      probes: [
        P("f8_onesent", "fact", "یک جمله از زاویهٔ هدفِ او", "پیامت را در یک جمله و از زاویهٔ هدفِ مخاطب (مثلاً مدیر) بنویس — او چه چیزی را بهینه می‌کند؟", [
          O("hard", "در آن لحظه پیامم این شکل را نداشت", [["F8", 1, "frame"]]), O("had", "همین شکل را داشت", [["F8", -1, ["frame"]]])], { input: "جملهٔ تو (اختیاری)" }),
        P("f8_diff", "fact", "رفتار، نه صفت", "طرفِ مقابل دقیقاً چه کرد که تو نکردی؟ (رفتارِ دیدنی، نه صفت یا نیت)", [
          O("found", "یک رفتارِ مشخص پیدا کردم", [["F8", 1]]), O("none", "هیچ تفاوتِ رفتاری نمی‌بینم", [["F8", -1, []]])], { input: "آن رفتار (اختیاری)" }),
        P("f8_elsewhere", "fact", "ترجیح در جاهای دیگر", "آیا تصمیم‌گیرنده‌ها او را در موقعیت‌های دیگر هم ترجیح می‌دهند؟ (اگر بله ⇒ ساختار/رابطه)", [
          O("yes", "بله", [["F10", 1, "status"], ["F8", 1, "trust"]]), O("no", "نه", [["F10", -1, ["status"]]]), O("unk", "نمی‌دانم", [])])],
      acts: [T(20, "چشمِ مدیر"), T(28, "بی‌اصطلاح"), T(3, "یک نکتهٔ اصلی"), T(11, "«چطور مطمئن شوم حرفم شنیده نمی‌شود؟»"), T(25, "تمرین با منتقد"), T(21, "جلسهٔ بعد یک قاب‌بندی را بیازما و ثبت کن")] },
    { id: "F9", fa: "باور دربارهٔ خود و اسناد", blurb: "یک باورِ کلی دربارهٔ خود (توانایی، برتری، درماندگی) تفسیرِ رخداد را رنگ زده.",
      subs: [{ id: "fixed", fa: "ذهنیتِ ثابت", src: "Dweck 2006 — اثرهای کوچک و وابسته به زمینه: Sisk et al. 2018؛ Yeager et al. 2019" },
        { id: "selfserv", fa: "اسنادِ خودخدمت", src: "Miller & Ross 1975 (تبیینِ انگیزشی‌اش را زیر سؤال برد)" },
        { id: "bta", fa: "اثرِ «بالاتر از میانگین»", src: "Alicke & Govorun 2005" }, { id: "helpless", fa: "درماندگیِ آموخته", src: "Maier & Seligman 2016" }],
      signals: [{ id: "F9.al", fa: "دربارهٔ خودت گفته‌ای «همیشه…»، «هیچ‌وقت…» یا «من آدمِ … نیستم»", w: 2, test: function (it) { return alwaysSelf(it); } },
        { id: "F9.self", fa: "جملهٔ نتیجه دربارهٔ برتری یا ضعفِ خودت است", w: 2, test: function (it) { return RE_SELF.test(CL(it)); } }],
      probes: [
        P("f9_evidence", "fact", "شاهدِ له و علیه", "شاهدِ عینیِ این باور دربارهٔ خودت چیست؟ مخالفش چیست؟", [
          O("against", "شاهدِ مخالف هم پیدا کردم؛ باور کلی‌تر از شواهد است", [["F9", 1]]), O("solid", "شواهد واقعاً پشتش است و مخالفی نیافتم", [["F9", -1, []]])], { input: "شاهدها (خصوصی؛ اختیاری)" }),
        P("f9_neutral", "fact", "نگاهِ بی‌طرف", "دیگرانِ بی‌طرف (کسی که سودی در نتیجه ندارد) چه می‌گویند؟", [
          O("differ", "با برداشتِ من نمی‌خواند", [["F9", 1]]), O("agree", "می‌خواند", [["F9", -1, ["fixed", "selfserv", "bta", "helpless"]]]), O("unasked", "نپرسیده‌ام", [])])],
      acts: [T(13), T(34), T(24), T(22), T(31, "اثرهای کوچک و وابسته به زمینه (Sisk 2018؛ Yeager 2019)")] },
    { id: "F10", fa: "موقعیت و ساختار (بیرون از ذهن)", blurb: "مشوق‌ها، سیاست، اطلاعاتِ نامتقارن، صورتِ مبهم یا معیارِ پنهانِ داور — شاید جواب «تغییرِ محیط» باشد نه «تغییرِ ذهن».",
      subs: [{ id: "incent", fa: "مشوق‌ها و سیاست", src: "" }, { id: "asym", fa: "اطلاعاتِ نامتقارن", src: "" }, { id: "ambig", fa: "صورتِ مسئلهٔ مبهم/غلط", src: "" },
        { id: "hidden", fa: "معیارِ پنهانِ داور", src: "" }, { id: "status", fa: "منزلت و سلسله‌مراتب", src: "" }, { id: "culture", fa: "هنجارهای فرهنگی (آبرو، رابطه)", src: "" }, { id: "liking", fa: "شباهت و علاقه", src: "" }],
      signals: [{ id: "F10.k", kind: 1, fa: "نوعِ موقعیت: اجتماعی/کاری", w: 2, test: function (it) { return K(it, "social"); } },
        { id: "F10.uw", fa: STMT[15][1], w: 2, test: function (it) { return ST(it, "s_unwritten"); } },
        { id: "F10.dis", fa: STMT[16][1], w: 2, test: function (it) { return ST(it, "s_disputed"); } }],
      probes: [
        P("f10_swap", "counterfactual", "جابه‌جاییِ فرد", "اگر فردِ دیگری با همان توانایی جای تو بود، نتیجه فرق می‌کرد؟", [
          O("same", "نه، همان می‌شد", [["F10", 1]]), O("diff", "بله، فرق می‌کرد", [["F10", -1, []]])]),
        P("f10_benefit", "fact", "چه کسی سود می‌برد؟", "چه کسی یا چه ساختاری از نتیجهٔ فعلی سود می‌برد؟ (نقش، نه نام)", [
          O("someone", "کسی یا ساختاری مشخص سود می‌برد", [["F10", 1, "incent"]]), O("none", "هیچ‌کس به‌طورِ خاص", [["F10", -1, []]])], { input: "چه کسی/چه ساختاری؟ (اختیاری)" })],
      acts: [T(20), T(8), T(3), T(9), X("env", "تصمیمِ «تغییرِ محیط/انتخاب‌ها» به‌جای «تغییرِ خود»", "", "تصمیم است، نه تکنیکِ آزموده",
        "فهرست کن چه چیزی در ساختار (معیار، مشوق، کانال، زمان، جا) قابلِ تغییر یا انتخاب است؛ بعد تصمیم بگیر کدام را به‌جای تغییرِ خودت عوض کنی.")] },
    { id: "F11", fa: "برداشت و نتیجه‌گیری (معرفتی)", blurb: "از یک تجربه قاعده ساخته شده، یا «آزمونی» عامه‌پسند و بی‌اعتبار، یا خودتشخیصی‌ای که هیچ مشاهده‌ای باطلش نمی‌کند.",
      subs: [{ id: "onecase", fa: "از یک تجربه قاعده ساختن", src: "" }, { id: "folk", fa: "آزمون‌های عامه‌پسندِ بی‌اعتبار", src: "" }, { id: "unfals", fa: "خودتشخیصیِ ابطال‌ناپذیر", src: "" }],
      signals: [{ id: "F11.cl", fa: "جملهٔ «این نشان می‌دهد که من…»", w: 2, test: function (it) { return RE_INFER.test(CL(it)); } },
        { id: "F11.pop", fa: STMT[20][1], w: 3, test: function (it) { return ST(it, "s_popular"); } },
        { id: "F11.k", kind: 1, fa: "نوعِ موقعیت: برداشتی که از یک اتفاق کردم", w: 2, test: function (it) { return K(it, "inference"); } },
        { id: "F11.once", fa: "نتیجه‌ای دربارهٔ خود از رخدادی که یک‌بار پیش آمده", w: 1, test: function (it) { return it.freq === "once" && !!CL(it); } }],
      probes: [
        P("f11_ref", "fact", "کلاسِ مرجع", "در مواردِ مشابه، این اتفاق برای دیگران هم چقدر می‌افتد؟", [
          O("common", "زیاد؛ عادی است", [["F11", 1, "onecase"]]), O("rare", "کم و نادر", [["F11", -1, []]]), O("unk", "نمی‌دانم", [])]),
        P("f11_signal", "fact", "سیگنال یا نویز", "این برداشت از چند موردِ مستقل آمده؟", [
          O("few", "یک یا دو مورد", [["F11", 1, "onecase"]]), O("many", "موردهای مستقلِ زیاد", [["F11", -1, ["onecase"]]])]),
        P("f11_falsify", "fact", "چه چیزی باطلش می‌کند؟", "چه مشاهده‌ای این برداشت را باطل می‌کند؟", [
          O("none", "نمی‌توانم چنین مشاهده‌ای تصور کنم", [["F11", 1, "unfals"]]), O("can", "می‌توانم و می‌شود آزمودش", [["F11", -1, ["unfals"]]])], { input: "آن مشاهده (اختیاری)" })],
      acts: [{ epi: true, fa: "پروندهٔ کارخانهٔ معرفت‌شناسی" }, T(10), T(9), T(22), T(21)] },
    { id: "F12", fa: "تصمیم و خودتنظیمی", blurb: "هزینهٔ ازدست‌رفته، گریز از زیان، سوگیریِ اکنون یا خطای برنامه‌ریزی تصمیم را از دانسته جدا کرده.",
      subs: [{ id: "sunk", fa: "هزینهٔ ازدست‌رفته", src: "" }, { id: "loss", fa: "گریز از زیان", src: "" }, { id: "present", fa: "سوگیریِ اکنون و اهمال‌کاری", src: "Steel 2007" },
        { id: "plan", fa: "خطای برنامه‌ریزی", src: "Buehler et al. 1994" }],
      signals: [{ id: "F12.sb", fa: STMT[17][1], w: 3, test: function (it) { return ST(it, "s_shouldbut"); } },
        { id: "F12.sk", fa: STMT[18][1], w: 3, test: function (it) { return ST(it, "s_sunk"); } },
        { id: "F12.so", fa: STMT[19][1], w: 2, test: function (it) { return ST(it, "s_sooner"); } }],
      probes: [
        P("f12_zero", "counterfactual", "از صفر", "اگر امروز از صفر تصمیم می‌گرفتی، همان را انتخاب می‌کردی؟", [
          O("other", "کارِ دیگری می‌کردم", [["F12", 1, "sunk"]]), O("same", "همان را", [["F12", -1, []]])]),
        P("f12_plan", "fact", "پیش‌بینیِ زمان", "پیش‌بینیِ قبلی‌ات از زمان چه بود و زمانِ واقعی چه شد؟ (هر واحدی، ولی هر دو یکسان)", null, {
          nums: [["pred", "پیش‌بینی"], ["real", "واقعی"]],
          score: function (ans) { var p = N(ans && ans.pred), r = N(ans && ans.real); if (p == null || r == null || p <= 0) return []; return r > p * 1.25 ? [{ fam: "F12", dir: 1, sub: "plan" }] : [{ fam: "F12", dir: -1, sub: ["plan"] }]; } })],
      acts: [T(9, "کلاسِ مرجع برای زمان"), T(11), T(23), X("impl2", "قصدِ اجرایی «اگر… آنگاه…»", "Gollwitzer & Sheeran 2006", "", IMPL_HOW)] }
  ];
  /* پیوندِ معناییِ هر خانواده به ایستگاه‌های کارخانهٔ معرفت‌شناسی (مالک ۲۰۲۶-۱۰-۱۲: «ارتباطِ معناییِ دقیق، نه تعارفی»).
     هر پیوند یک «چرا»ی یک‌خطی دارد که به کاربر نشان داده می‌شود؛ خانواده‌ای که پیوندِ واقعی ندارد (F3، F5، F6، F7، F10، F12) هیچ نمی‌گیرد.
     شناسه‌ای که در A.EST نباشد هنگامِ نمایش کنار می‌رود. */
  var EPI_LINKS = {
    F1: [{ st: "st_tasdiq", why: "تصور یا تصدیق: مفهوم را نمی‌شناختم یا حکم را؟" }],
    F2: [{ st: "st_worlds", why: "واقع، فهم، زبان: فرقِ خودِ مسئله با فهمِ تو و کلماتش" }, { st: "st_herm", why: "خواندنِ دقیقِ متنِ صورتِ مسئله" }],
    F4: [{ st: "st_grade", why: "پیش از اعلامِ پاسخ، اعتبارش چقدر است؟" }, { st: "st_conflict", why: "وقتی دو برداشت با هم نمی‌خوانند" }],
    F8: [{ st: "st_expert", why: "مدیرها به تخصصِ چه کسی تکیه می‌کنند و با چه ملاک‌هایی — همان سازوکارِ «استناد به تخصصِ دیگران»" }, { st: "st_herm", why: "فهمِ متن و گوینده: پیامِ تو چطور فهمیده می‌شود" }],
    F9: [{ st: "st_background", why: "پیش‌زمینه‌هایی که برداشتت را شکل داده‌اند" }, { st: "st_grade", why: "درجهٔ اعتبارِ برداشت" }, { st: "st_resp", why: "مسئولیتِ معرفتی: چقدر باید مطمئن باشم پیش از اینکه دربارهٔ خودم حکم کنم" }],
    F11: [{ st: "st_istiqra", why: "از چند مورد به قاعده رسیدن — همان کاری که با یک اتفاق کردی" }, { st: "st_tajrobe", why: "تجربه کی معتبر است" }, { st: "st_grade", why: "درجهٔ اعتبارِ برداشت" }]
  };
  A.KF.forEach(function (F) { F.epi = EPI_LINKS[F.id] || []; });
  var KFM = {}; A.KF.forEach(function (F, i) { F.n = i + 1; KFM[F.id] = F; });
  A.KFM = KFM;
  function famName(id) { var F = KFM[id]; return F ? fa(F.n) + " · " + F.fa : id; }
  function subName(fam, sid) { var F = KFM[fam]; var s = F && F.subs.filter(function (x) { return x.id === sid; })[0]; return s ? s.fa : ""; }
  A.knotFamName = famName; A.knotSubName = subName;

  /* ---------- رتبه: قاعدهٔ وزن‌دارِ پیشین (§۴ + §۱۲.۳ ِ طرح) تا ۲۰۲۶-۱۰-۱۴ برقرار بود و با تصمیمِ مالک کنار رفت؛ قاعدهٔ تازه پایین‌تر.
     KIND_DIV و KW فقط برای سازگاریِ خواندنِ داده‌های قدیمی و آزمون‌های دیگر نگه داشته شده‌اند و در رتبه به کار نمی‌روند. */
  var KIND_DIV = 3;
  A.KIND_DIV = KIND_DIV;
  function intakeOf(kc) { var it = {}, src = (kc && kc.intake) || {}; for (var k in src) it[k] = src[k]; it.kinds = (kc && kc.kinds) || []; return it; }
  /* ---------- رتبه‌بندیِ بی‌وزن، برگشته به اصل‌ها (مالک ۲۰۲۶-۱۰-۱۵: «همه چیز باید به بدیهیاتِ یقینی برگردد»؛ HANDBOOK §۱۲ ردیفِ ۴۵) ----------
     وزن‌های قراردادیِ پیشین (۳ / ۱ / ۰٫۵، نشانه‌ها ۱ تا ۳، ÷۳) کنار رفت. هر خانواده = چند تبیینِ فرعی (زیرنوع). سه قاعده، هر کدام از یک اصلِ کارخانه:
     ۱) A0 (امتناعِ تناقض): پاسخی فقط تبیینی را رد می‌کند که لزوماً خلافِ آن پاسخ را پیش‌بینی کند؛ پس هر گزینهٔ «علیه» دقیقاً می‌گوید کدام
        زیرنوع‌ها را رد می‌کند («درست بازگفتم» فقط «بدخوانی» را، نه «مدلِ غلط»). ندیدن، نبودن نیست؛ و پیش‌بینیِ تو دربارهٔ حالتِ فرضی
        («اگر کسی نمی‌دید…») مشاهده نیست ⇒ هیچ‌کدام چیزی را رد نمی‌کنند.
     ۲) A1 (کل از جزء کمتر نیست): خانواده فقط وقتی کنار می‌رود که **همهٔ** زیرنوع‌هایش رد شده باشند (یا خودت در دفترِ شواهد ردش کرده باشی).
     ۳) A4 (بی‌مرجح): نشانه‌ای که برای چند خانواده به یک اندازه برقرار است («نوعِ موقعیت: مسئله») هیچ را بر دیگری ترجیح نمی‌دهد ⇒ «زمینه» است، نه شاهد.
        شاهد = حرف یا پاسخِ خودِ تو که همین خانواده پیش‌بینی‌اش می‌کند (جمله‌های تیک‌خورده، پاسخِ آزمون، پلهٔ نردبان، یافتهٔ غربالِ تور با نقلِ حرفت).
     خروجی: وضع = «کنار رفت» / «شاهد دارد» / «هنوز معلوم نیست» — بی هیچ عدد. ترتیب فقط برای بررسی است: اول «شاهد دارد»، بعد «معلوم نیست»، آخر
     «کنار رفت»؛ درونِ هر گروه، آن‌که شاهدِ بیشتری دارد بعد آن‌که زیرنوعِ ردشدهٔ کمتری دارد، و بعد شمارهٔ خانواده. این ترتیب داوری نیست. */
  var STATE_FA = { ev: "شاهد دارد", open: "هنوز معلوم نیست", out: "کنار رفت" };
  A.KNOT_STATE_FA = STATE_FA;
  var PROBE = {}; A.KF.forEach(function (F) { F.probes.forEach(function (p) { PROBE[p.id] = p; }); });
  /* شاهدهای آزمون از روی تعریفِ فعلیِ آزمون و پاسخِ ثبت‌شده دوباره ساخته می‌شوند تا پرونده‌های قدیمی هم با همین منطق سنجیده شوند */
  function liveEv(kc) {
    var out = [];
    (kc.ev || []).forEach(function (e) {
      var m = /^probe:(.+)$/.exec(e.src || ""), p = m && PROBE[m[1]], a = m && kc.pans && kc.pans[m[1]];
      if (p && a) {
        var fresh = p.scoreFrom(a).filter(function (x) { return x.fam === e.fam && (x.dir < 0) === (e.dir < 0); })[0];
        out.push(fresh ? Object.assign({}, e, { sub: fresh.sub }) : e);
      } else out.push(e);
    });
    return out;
  }
  /* یافته‌های «پیدا شد» ِ غربالِ هر تورِ دستیار که این موقعیت را به وجهی وصل کرده (با نقلِ حرفِ خودِ کاربر) */
  function sieveOf(kc) {
    var r = {};
    try { S.all("achat", function (x) { return x.tour && x.tour.diag && (x.tour.facets || []).some(function (f) { return (f.refs || []).some(function (z) { return z.id === kc.id; }); }); })
      .forEach(function (x) { Object.keys(x.tour.diag).forEach(function (id) { var d = x.tour.diag[id]; if (/^F\d+$/.test(id) && d && d.st === "found" && d.why) r[id] = d.why; }); }); } catch (e) { }
    return r;
  }
  A.knotRank = function (kc) {
    var it = intakeOf(kc), evs = liveEv(kc), sv = sieveOf(kc);
    return A.KF.map(function (F, idx) {
      var why = [], whyx = [], sup = [], ctx = [], ref = {}, refBy = {}, neutral = [], famOut = "", supSubs = {};
      F.signals.forEach(function (sg) {
        var on = false; try { on = !!sg.test(it); } catch (e) { on = false; }
        if (!on) return;
        if (sg.kind) { ctx.push(sg.fa); whyx.push({ t: "ctx", txt: sg.fa }); }
        else { sup.push(sg.fa); whyx.push({ t: "sig", txt: sg.fa }); }
      });
      evs.forEach(function (e) {
        if (e.fam !== F.id) return;
        if (e.dir > 0) { sup.push(e.text); if (e.sub && typeof e.sub === "string") supSubs[e.sub] = e.text; whyx.push({ t: "ev", txt: e.text, kind: e.kind }); return; }
        if (e.kind === "manual" || e.src === "manual") { famOut = e.text; whyx.push({ t: "out", txt: e.text }); return; }
        var subs = Array.isArray(e.sub) ? e.sub : [];
        if (!subs.length) { neutral.push(e.text); whyx.push({ t: "neutral", txt: e.text }); return; }
        subs.forEach(function (x) { ref[x] = 1; refBy[x] = e.text; }); whyx.push({ t: "ref", txt: e.text, subs: subs });
      });
      // شاهدِ غربال که در دفترِ شواهد نشسته (src = sieve:F، a32 AS.sieveToKnots) دوباره شمرده نمی‌شود؛ حذفِ کاربر (sieveOff) هم محترم است
      if (sv[F.id] && !(kc.ev || []).some(function (e) { return e.src === "sieve:" + F.id; }) && !(kc.sieveOff || {})[F.id]) { sup.push("غربالِ تور: «" + sv[F.id] + "»"); whyx.push({ t: "sieve", txt: sv[F.id] }); }
      var refSubs = F.subs.filter(function (x) { return ref[x.id]; }), left = F.subs.filter(function (x) { return !ref[x.id]; });
      var state = famOut || !left.length ? "out" : sup.length ? "ev" : "open";
      var subFa = function (id) { var x = F.subs.filter(function (y) { return y.id === id; })[0]; return x ? x.fa : id; };
      sup.forEach(function (t) { why.push("شاهد: " + t); });
      refSubs.forEach(function (x) { why.push("کنار رفت — «" + x.fa + "»: پاسخت با آن نمی‌خواند (" + refBy[x.id] + ")"); });
      Object.keys(supSubs).forEach(function (x) { if (ref[x]) why.push("⚠ ناسازگاری: برای «" + subFa(x) + "» هم شاهد هست («" + supSubs[x] + "») و هم پاسخی که با آن نمی‌خواند («" + refBy[x] + "») — یکی از این دو پاسخ را دوباره ببین"); });
      if (famOut) why.push("خودت در دفترِ شواهد کنارش گذاشتی: " + famOut);
      neutral.forEach(function (t) { why.push("پاسخِ «نه» که چیزی را رد نمی‌کند (ندیدن، نبودن نیست؛ یا حدس دربارهٔ حالتِ فرضی است): " + t); });
      ctx.forEach(function (t) { why.push("زمینه، نه شاهد (برای چند خانواده یکسان است): " + t); });
      if (refSubs.length && left.length) why.push("هنوز باز: " + left.map(function (x) { return "«" + x.fa + "»"; }).join("، "));
      return { fam: F.id, state: state, stateFa: STATE_FA[state], score: state === "ev" ? 1 : state === "out" ? -1 : 0, n: sup.length, refSubs: refSubs.map(function (x) { return x.id; }),
        openSubs: left.map(function (x) { return x.id; }), conflict: Object.keys(supSubs).some(function (x) { return ref[x]; }), sig: sup.length, ev: sup.length, why: why, whyx: whyx, ord: idx };
    }).sort(function (a, b) { return b.score - a.score || b.n - a.n || a.refSubs.length - b.refSubs.length || a.ord - b.ord; });
  };

  /* ---------- رکوردها ---------- */
  A.KSTATUS = { open: "باز", working: "در حالِ باز شدن", practised: "ورزیده‌شده", returned: "بازگشته" };
  var KCST = { open: "در جریان", closed: "بسته — احتمالاً گره نبود", rooted: "ریشه تأیید شد", done: "کارتِ گره نوشته شد" };
  A.KCASE_STATUS = KCST;
  A.newKnot = function (o) {
    o = o || {};
    var k = { id: A.uid("knot"), type: "knot", name: o.name || "", fam: o.fam || "", sub: o.sub || "", extra: o.extra || [], principle: "", signals: "", counter: "", example: "",
      cases: o.cases || [], links: o.links || [], status: "open", items: [], log: [], next: null, interval: null, solvedAt: null, returnedAt: null };
    return S.put(k);
  };
  /* مقیاسِ فرمِ موقعیت (همان گزینه‌های «چند بار پیش آمده؟» و «شدتِ احساس (۰–۱۰)») — دوباره‌سنجی (a33 DO.remeasure) با همین می‌سنجد */
  A.KFREQ = [["once", "یک‌بار"], ["some", "گاهی"], ["often", "مرتب"]];
  A.KEMO_MAX = 10;
  /* ثبتِ نخست: کهنه‌ترین موقعیتِ پیوسته به گره */
  A.knotIntake = function (k) {
    var cs = k ? A.knotCases(k.id).slice().sort(function (a, b) { return String(a.created || "").localeCompare(String(b.created || "")); }) : [];
    var it = (cs[0] && cs[0].intake) || {}; return { freq: it.freq || "", emo: it.emo === "" || it.emo == null || isNaN(+it.emo) ? null : +it.emo, at: cs[0] ? cs[0].created || "" : "" };
  };
  A.knotFreqFa = function (id) { var o = A.KFREQ.filter(function (x) { return x[0] === id; })[0]; return o ? o[1] : ""; };
  /* «پیش‌تر ← اکنون» با همان مقیاس و رقمِ فارسی (کارنامه، صفحهٔ گره، ایمیل) */
  A.knotRemeasureText = function (k, r) {
    var b = A.knotIntake(k), part = function (fr, em) { return [fr ? A.knotFreqFa(fr) || fr : "", em != null ? "شدت " + fa(em) + " از " + fa(A.KEMO_MAX) : ""].filter(Boolean).join(" · ") || "نگفته"; };
    return "ثبتِ نخست: " + part(b.freq, b.emo) + " ← اکنون: " + part(r.freqId || "", r.intensity) + (r.note ? " — " + r.note : "");
  };
  A.knotCases = function (knotId) { return S.all("kcase", function (c) { return (c.knots || []).indexOf(knotId) >= 0; }); };
  A.knotStatus = function (k) {
    if (!k) return "open";
    if (A.kmastery) { try { var m = A.kmastery(k); if (m && A.KSTATUS[m.status]) return m.status; } catch (e) { } }
    return A.KSTATUS[k.status] ? k.status : "open";
  };
  function cardDone(k) { return !!(k && ["name", "principle", "signals", "counter", "example"].every(function (f) { return String(k[f] || "").trim(); })); }
  A.knotCardDone = cardDone;

  /* ---------- ایمنی (§۱۰، §۱۲.۱۰): بررسیِ محلیِ کلیدواژه‌ها پیش از هر درخواستِ هوش مصنوعی و هنگامِ ثبت ---------- */
  /* یک نرمال‌ساز و یک فهرست برای همهٔ ماژول‌ها (a17 هم همین را صدا می‌زند).
     نرمال‌سازی: ي/ى⇒ی، ك⇒ک، ة⇒ه، أ/إ⇒ا، حذفِ اعراب و کشیده (ـ)، نیم‌فاصله/نویسه‌های جهت ⇒ فاصله، فاصله‌های پیاپی ⇒ یکی، حروفِ کوچک.
     «فاصله» در الگوها اختیاری است (` ?`) تا «می‌خواهم»/«میخواهم»/«می خواهم» یکی شوند.
     عمداً «ایمنی بر دقت مقدم است»: «بمیرم برات» (قربان‌صدقه) هم برخورد حساب می‌شود — کارت آرام است، فقط منابع را نشان می‌دهد
     و کاربر با «خواندم؛ ادامه می‌دهم» ادامه می‌دهد. ولی جمله‌های رایجِ بی‌خطرِ همین ابزار عمداً برخورد نیستند:
     «این عادت را از بین ببرم» (بی «خودم»)، «می‌خواهم این مسئله را تمومش کنم» (زمینهٔ کار/مسئله). */
  function safeNorm(s) {
    return norm(String(s == null ? "" : s).replace(/ـ/g, "").replace(/[ىي]/g, "ی").replace(/ة/g, "ه").replace(/[أإ]/g, "ا")).replace(/\s+/g, " ");
  }
  A.kSafeNorm = safeNorm;
  var SAFE_WORDS = ["خودکشی", "خود کشی", "خودمو بکشم", "خودم را بکشم", "خودمو میکشم", "خودمو می کشم", "خودم را می کشم", "به خودم آسیب", "آسیب به خودم", "خودزنی", "خود زنی",
    "رگمو بزنم", "رگم را بزنم", "می خواهم بمیرم", "میخواهم بمیرم", "میخوام بمیرم", "می خوام بمیرم", "دلم می خواد بمیرم", "دلم میخواد بمیرم", "نمی خواهم زنده باشم",
    "نمیخواهم زنده باشم", "نمیخوام زنده باشم", "نمی خوام زنده باشم", "کاش مرده بودم", "کاش نبودم", "به زندگیم پایان", "به زندگی ام پایان", "بکشمش", "بکشمشون", "بهش آسیب بزنم",
    "suicide", "suicidal", "kill myself", "killing myself", "self-harm", "self harm", "hurt myself", "hurting myself", "end my life", "end it all", "want to die", "cut myself", "kill him", "kill her", "kill them"].map(safeNorm);
  var FL = "آ-یپچژکگ";                                   // حروفِ فارسی پس از نرمال‌سازی (برای مرزِ واژه)
  var WB0 = "(?:^|[^" + FL + "])", WB1 = "(?=$|[^" + FL + "])";
  var SELF = "خود ?م(?:و| ?را| ?رو)?";                   // «خودم»، «خودمو»، «خودم را»، «خودم رو»
  var SAFE_RE = [
    ["خودکشی", new RegExp("خود ?کش(?:ی|ي)")],
    ["خودزنی", new RegExp("خود ?زنی")],
    ["خودم را بکشم", new RegExp(SELF + " ?(?:ب|می ?)کشم" + WB1)],
    ["خودم را از بین ببرم", new RegExp(SELF + "(?: [" + FL + "]+){0,3} ?از بین (?:ببرم|می ?برم|بردن)")],
    ["از بین بروم", new RegExp("از بین (?:برم|بروم)" + WB1)],
    ["صدمه/آسیب به خودم", new RegExp("(?:صدمه|آسیب)(?: [" + FL + "]+){0,2} ?به خود ?م" + WB1)],
    ["به خودم صدمه/آسیب", new RegExp("به خود ?م(?: [" + FL + "]+){0,2} (?:صدمه|آسیب)")],
    ["خودم را زخمی کنم", new RegExp(SELF + " ?(?:زخمی|ناکار) (?:کنم|می ?کنم)")],
    ["بمیرم", new RegExp(WB0 + "بمیرم")],
    ["آرزوی مرگ", new RegExp("(?:دلم|آرزوی|آرزوم) ?مرگ")],
    ["کاش نبودم", new RegExp("کاش(?: [" + FL + "]+){0,2} (?:نبودم|نیست بودم|به دنیا نیومده بودم|به دنیا نیامده بودم|مرده بودم)")],
    ["نمی‌خواهم زنده باشم", new RegExp("نمی ?(?:خواهم|خوام) (?:دیگه |دیگر )?زنده (?:باشم|بمونم|بمانم)")],
    /* ممیزی ۲۰۲۶-۱۰-۱۳: «یه مشت قرص بخورم و تمومش کنم» و «از پل بپرم» دیده نمی‌شد */
    ["قرص زیاد خوردن", new RegExp("(?:یه مشت|یک مشت|همه ?ی|همهٔ|کلی|یه بسته|یک بسته|بسته) ?(?:[" + FL + "]+ ){0,2}قرص(?: [" + FL + "]+){0,3} ?(?:بخورم|می ?خورم|خوردن)")],
    ["پریدن از بلندی", new RegExp("از (?:پل|بالای|پشت ?بام|ساختمان|طبقه|بلندی|کوه|صخره)(?: [" + FL + "]+){0,2} ?(?:بپرم|می ?پرم|پایین بپرم|بیفتم|خودمو پرت|خودم را پرت)")],
    ["به زندگی‌ام پایان", new RegExp("(?:به )?زندگی ?(?:م|ام|مو|ام را|م را) ?(?:را |رو )?(?:پایان|تموم|تمام) ?(?:بدم|بدهم|کنم|می ?دم|میدم)")],
    /* بازبینیِ متقابلِ ۲۰۲۶-۱۰-۱۵ — اندیشهٔ منفعل («بهتره نباشم»، «همه بدونِ من راحت‌ترن»، …) دیده نمی‌شد. واژه‌های میانی محدودند
       تا «بهتره فردا سرِ کلاس نباشم» یا «پروژه بدونِ من بهتر پیش می‌رود» برخورد نشوند (آزمون‌های منفی در tests/test_fixes_1015c.js) */
    ["بهتره نباشم", new RegExp(WB0 + "بهتر(?: ?ه| است| اس)(?: (?:که|دیگه|دیگر|اصلا|اصلاً|کلا|کلاً|من|زنده))* (?:نباشم|نمونم|نمانم|بمیرم|زنده نمونم|زنده نمانم)" + WB1)],
    ["همه بدونِ من راحت‌ترن", new RegExp(WB0 + "(?:همه|همه ?ی? ?شون|بقیه|دنیا|خانواده ?ام|خانواده ?م|خانواده|اونا|آنها|آن ها|مامان ?م|بابا ?م|بچه ?هام|بچه ?ها ?م)(?: (?:هم|خیلی|حتما|حتماً|قطعا|قطعاً))* (?:بدون|بی) (?:وجود )?من(?: (?:خیلی|هم|حتما|حتماً|قطعا|قطعاً))* (?:راحت ?تر|بهتر|خوشحال ?تر|خوشبخت ?تر|آسوده ?تر)")],
    ["رگ زدن", new RegExp(WB0 + "رگ(?: ?م| ?مو| ?م را| ?م رو| ?دستم| ?دستمو| دستم را)? ?(?:زدن|بزنم|می ?زنم|رو بزنم|را بزنم)" + WB1)],
    ["زندگی ارزشِ ادامه ندارد", new RegExp("زندگی(?: [" + FL + "]+){0,2} ارزش ?(?:ش)?(?: [" + FL + "]+){0,3} ?(?:نداره|ندارد|نداشت)" + WB1)],
    ["نمی‌خواهم به زندگی ادامه بدهم", new RegExp("(?:نمی ?(?:خوام|خواهم)|نمی ?تونم|نمی ?توانم)(?: [" + FL + "]+){0,2} ?(?:(?:به )?زندگی(?: [" + FL + "]+){0,1} (?:را |رو )?ادامه (?:بدم|بدهم|دادن)|ادامه (?:بدم|بدهم|دادن)(?: [" + FL + "]+){0,1} (?:به )?زندگی)")]
  ];
  /* انکارِ صریحِ خودِ کاربر (بازبینیِ متقابلِ ۲۰۲۶-۱۰-۱۵): فقط همین، در پیامی پس از نشانه، بندِ ایمنی را خاموش می‌کند (a32 AS.safetyActive) —
     مدل به‌تنهایی هرگز. فهرست عمداً تنگ است: «نه» در آغازِ پیام، «قصد/فکرِ خودکشی/آسیب ندارم»، «به خودم آسیب نمی‌زنم»، «در خطر نیستم»، … */
  var DENY_N = "(?:خود ?کشی|آسیب ?ی?|صدمه ?ای?|خود ?زنی|مرگ|مردن|کشتن ?خود ?م|بلایی)";
  var DENY_RE = [
    new RegExp("^(?:نه|نخیر|خیر|ابدا|ابداً|اصلا|اصلاً|هرگز|no|nope)(?=$|[^" + FL + "a-z])"),
    new RegExp("(?:قصد|فکر|نیت|برنامه|خیال)(?: [" + FL + "]+){0,3} ?" + DENY_N + "(?: [" + FL + "]+){0,4} ?(?:ندارم|نیست|نکردم|نمی ?کنم)" + WB1),
    new RegExp(DENY_N + "(?: [" + FL + "]+){0,3} ?(?:نمی ?(?:زنم|کنم|رسونم|رسانم)|ندارم|در کار نیست)" + WB1),
    new RegExp("(?:به )?خود ?م(?: [" + FL + "]+){0,2} ?(?:آسیب|صدمه)(?: ?ی| ?ای)? ?نمی ?(?:زنم|رسونم|رسانم)" + WB1),
    new RegExp(SELF + " ?نمی ?کشم" + WB1),
    new RegExp("نمی ?(?:خوام|خواهم) (?:بمیرم|خودمو بکشم|خودم را بکشم)" + WB1),
    new RegExp("(?:در )?خطر ?(?:ی)? (?:نیستم|نیست|ندارم)" + WB1),
    new RegExp("منظور ?م(?: [" + FL + "]+){0,3} ?نبود" + WB1),
    /not suicidal|no intention|i'?m safe|i am safe|won'?t hurt myself|not going to hurt myself/
  ];
  /* انکارهای پیام (نرمال‌شده). خالی ⇒ انکار نیست */
  A.knotSafetyDenial = function (text) {
    var t = safeNorm(text), out = [];
    DENY_RE.forEach(function (re) { var m = t.match(re); if (m && m[0].trim()) out.push(m[0].trim()); });
    return out;
  };
  /* پیام بی بخش‌های انکار — اگر باز هم واژهٔ ایمنی داشت، نشانهٔ تازه است («نه، دیگه نمی‌خوام زنده باشم») */
  A.knotSafetyStripDenial = function (text) {
    var t = safeNorm(text);
    DENY_RE.forEach(function (re) { t = t.replace(new RegExp(re.source, "g"), " "); });
    return t;
  };
  /* «تمومش کنم» فقط وقتی دربارهٔ زندگی/خود است: پنجرهٔ ۴۰ نویسه در دو سو. یا واژهٔ زندگی/خود/مرگ در پنجره هست،
     یا «می‌خواهم/دلم می‌خواد/بهتره» درست پیش از آن آمده و هیچ واژهٔ کار/مسئله در پنجره نیست. */
  var END_RE = /(?:تموم ?ش|تمام ?ش|همه چی(?:ز)? ?(?:را|رو)? ?تموم) ?(?:کنم|می ?کنم|بکنم)/g;
  var END_LIFE = /زندگی|خود ?م|مرگ|بمیرم|نفس|دنیا|دیگه نمی|دیگر نمی|طاقت|خسته ام|خسته‌ام|بریدم/;
  var END_WANT = /(?:می ?(?:خوام|خواهم)|دلم می ?(?:خواد|خواهد)|بهتره|بهتر است|باید) ?$/;
  var END_TASK = /کار|پروژه|گزارش|تمرین|کتاب|درس|پرونده|جلسه|مسئله|مساله|سوال|سؤال|تکلیف|فصل|ورزش|آزمون|امتحان|بحث|قرارداد|دعوا|رابطه/;
  function endHit(t) {
    var m; END_RE.lastIndex = 0;
    while ((m = END_RE.exec(t))) {
      var before = t.slice(Math.max(0, m.index - 40), m.index), after = t.slice(m.index + m[0].length, m.index + m[0].length + 40), win = before + " " + after;
      if (END_LIFE.test(win)) return true;
      if (END_WANT.test(before) && !END_TASK.test(win)) return true;
    }
    return false;
  }
  A.knotSafetyMatch = function (text) {
    var t = safeNorm(text), out = [];
    SAFE_WORDS.forEach(function (w) { if (t.indexOf(w) >= 0) out.push(w); });
    SAFE_RE.forEach(function (x) { if (x[1].test(t)) out.push(x[0]); });
    if (endHit(t)) out.push("تمومش کنم");
    return out;
  };
  A.knotSafetyHit = function (text) { return A.knotSafetyMatch(text).length > 0; };
  function kcText(kc) { var it = kc.intake || {}, pr = it.prac || {}; return [kc.title, it.what, it.expected, it.actual, it.thoughts, it.claim, it.context, it.emoName, it.statement, it.stuckAt, pr.want, pr.have, pr.cond, pr.vague, pr.ignore, pr.approx].join(" \n "); }
  function safetyPending(kc) { return A.knotSafetyHit(kcText(kc)) && !kc.safetyAck; }
  A.knotSafetyCard = function (onAck, onStop) {
    var ov = h("div", { class: "overlay kn-safe", role: "alertdialog", "aria-modal": "true", "aria-labelledby": "knSafeT" });
    var ack = h("button", { class: "btn", onclick: function () { ov.remove(); if (onAck) onAck(); } }, "خواندم؛ ادامه می‌دهم");
    ov.appendChild(h("div", { class: "dialog", dir: "rtl" },
      h("h3", { id: "knSafeT" }, "یک لحظه — حالِ تو مهم‌تر از این تمرین است"),
      h("p", {}, "در نوشته‌ات واژه‌ای دیدیم که ممکن است به آسیب‌زدن به خود یا دیگری مربوط باشد. این ابزار برای چنین لحظه‌ای ساخته نشده و جای گفت‌وگو با یک انسان را نمی‌گیرد."),
      h("p", {}, "اگر در خطرِ فوری هستی یا ممکن است به خودت یا کسی آسیب بزنی، همین حالا با اورژانس تماس بگیر یا به کسی که نزدیکت است بگو. گفت‌وگو با یک متخصص (روان‌شناس، مشاور یا پزشک) کمک می‌کند."),
      h("ul", { class: "kn-help" },
        h("li", {}, "امارات: ", h("bdi", { dir: "ltr" }, "999"), " — اورژانس"),
        h("li", {}, "ایران: ", h("bdi", { dir: "ltr" }, "123"), " — اورژانسِ اجتماعی · ", h("bdi", { dir: "ltr" }, "1480"), " — خطِ مشاورهٔ تلفنی")),
      h("p", { class: "small muted" }, "شماره‌های عمومی؛ پیش از نیاز وارسی کن. اگر برداشتِ ما اشتباه است (مثلاً واژه در معنای دیگری آمده)، می‌توانی ادامه بدهی."),
      h("div", { class: "row gap wrap" }, ack, h("button", { class: "btn ghost", onclick: function () { ov.remove(); if (onStop) onStop(); } }, "فعلاً بس است"))));
    A.layer().appendChild(ov); ack.focus();
    return ov;
  };
  /* شدتِ احساسِ ۸ یا بیشتر در سه موقعیتِ پیاپیِ آخر ⇒ پیشنهادِ گفت‌وگو با متخصص (نه تشخیص) */
  A.knotEmoStreak = function () {
    var cs = S.all("kcase").slice().sort(function (a, b) { return (a.created || "").localeCompare(b.created || ""); }).slice(-3);
    return cs.length === 3 && cs.every(function (c) { return GE((c.intake || {}), "emo", 8); });
  };
  function emoCard() {
    return h("section", { class: "card soft kn-pro" }, h("p", {}, h("b", {}, "پیشنهاد: "), "در سه موقعیتِ آخر شدتِ احساس ۸ یا بیشتر بوده است. این ابزار درمان نیست؛ گفت‌وگو با یک متخصص (روان‌شناس یا مشاور) می‌تواند کمک کند. ادامهٔ کار این‌جا به خودِ تو بستگی دارد."));
  }

  /* ---------- هوش مصنوعی: بررسیِ ایمنی ⇐ اعلامِ ارسال (+ حذفِ نام‌ها) ⇐ درخواست. خروجی فقط پیشنهاد است. ---------- */
  var DIAG = /adhd|بیش ?فعالی|نقص توجه|کم ?توجهی|خوانش ?پریشی|نارساخوانی|dyslexi|اوتیسم|autis|افسردگی|depress|دوقطبی|bipolar|اختلال|disorder|وسواس|ocd/;
  /* حالِ درونی (§۱۲.۱۰: هیچ فرضیهٔ هوش مصنوعی دربارهٔ حالِ درونیِ شخصِ سوم). روی متنِ نرمال‌شده (نیم‌فاصله ⇒ فاصله). */
  /* ممیزی ۲۰۲۶-۱۰-۱۳: صورت‌های رایجِ دیگر (گذشته، «گمان/خیال»، «بیزار/نفرت»، «احساسِ تهدید»، «نگران»، «رنجیده») رد نمی‌شدند */
  var MIND = /فکر[\s\u200c]?(?:می[\s\u200c]?)?(?:کن|کرد)|گمان|خیال|می[\s\u200c]?پندار|پنداشت|تصور[\s\u200c]?می|می[\s\u200c]?خواه|می[\s\u200c]?خواد|خواست|قصد|نیت|حسادت|حسود|کینه|متنفر|نفرت|بیزار|دوست[\s\u200c]?(?:ن)?دار|علاقه|خوش[\s\u200c]?ش|خوششان|بدش|می[\s\u200c]?دان|می[\s\u200c]?دون|احساس|حس[\s\u200c]?(?:می|کرد|ِ)|انگیزه|می[\s\u200c]?ترس|ترسید|هراس|نگران|تهدید|عصبانی|خشمگین|ناراحت|دلخور|رنجید|رنجیده|دلش|حسرت|تحقیر|رقابت|باور[\s\u200c]?دار|معتقد|دلسرد|احترام[\s\u200c]?نمی/;
  /* شخصِ سوم: نقش‌ها، ضمیرها، «فلانی»، نشانِ «[شخص]» و هر نامی که کاربر در «دیگرانِ درگیر» یا در خانهٔ حذفِ نام نوشته است */
  var OTHERS = /مدیر|همکار|رئیس|سرپرست|کارفرما|ایشان|دیگران|طرف ?مقابل|فلانی|\[شخص\]|(?:^|[^آ-ی])(?:او|اون|وی|آن ?ها|اونا|آنان)(?=$|[^آ-ی])/;
  function nameList(names) {
    var a = Array.isArray(names) ? names : String(names || "").split(/[،,;؛\n]/);
    return a.map(function (x) { return String(x == null ? "" : x).replace(/ي/g, "ی").replace(/ك/g, "ک").trim(); }).filter(function (x) { return x.length >= 2; });
  }
  A.knotNameList = nameList;
  /* حذفِ نام (§۱۲.۹) — فقط واژهٔ کامل: پیش و پس از نام نباید حرفِ فارسی/لاتین، رقم یا نیم‌فاصله باشد
     (پس «علی» به «فعلی» یا «علی‌رضا» دست نمی‌زند و «رضا» به «رضایت»)؛ پس از نام اعرابِ اضافه (ِ) مجاز است.
     ي/ك هم در متن و هم در نام‌ها پیش از تطبیق یکی می‌شوند. یک تابع برای a16 و a17: A.kRedact(text, names[, label]). */
  /* حروف، رقم‌ها و اعراب — نه نشانه‌های نگارشی («،» «؛» «؟» «٪» «۔») که در همان بازهٔ یونیکد هستند */
  var WCH = "A-Za-z0-9\u0621-\u063A\u0640-\u0669\u066E-\u06D3\u06D5-\u06FF\u200C\u200D";
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  A.kRedact = function (text, names, label) {
    var t = String(text == null ? "" : text).replace(/ي/g, "ی").replace(/ك/g, "ک");
    nameList(names).sort(function (a, b) { return b.length - a.length; }).forEach(function (n, i) {
      var pat = esc(n).replace(/\s+/g, "[\\s\\u200C]+");
      var re = new RegExp("(^|[^" + WCH + "])" + pat + "(?=[\\u064B-\\u0652]*(?:$|[^" + WCH + "]))", "g");
      var tok = typeof label === "function" ? label(i) : (label || "[شخص]");
      t = t.replace(re, function (m, pre) { return pre + tok; });
    });
    return t;
  };
  function stripNames(t, names) { return A.kRedact(t, names); }
  A.knotStripNames = stripNames;
  /* پالایشِ فرضیهٔ هوش مصنوعی: تشخیصِ بالینی ⇒ کنار؛ و قاعدهٔ ساختاری: هر جمله‌ای (در متن، رقیب یا آزمون) که به شخصِ سوم اشاره کند
     (نقش/ضمیر/نامِ دیگرانِ درگیر/نام‌های حذف‌شده) و واژهٔ حالِ درونی داشته باشد ⇒ کلِ فرضیه کنار. توصیفِ رفتار (بی واژهٔ حالِ درونی) می‌ماند. */
  A.knotHypOk = function (x, people, names) {
    if (!x || !KFM[x.fam] || !String(x.text || "").trim()) return false;
    if (DIAG.test(norm([x.text, x.rival, x.test, x.sub].join(" ")))) return false;
    var ps = nameList(people).concat(nameList(names)).map(norm);
    var sents = [x.text, x.rival, x.test].map(function (s) { return String(s || ""); }).join("\n").split(/[.!?؟؛;\n]+/);
    return !sents.some(function (s) {
      var n = norm(s); if (!n) return false;
      var third = OTHERS.test(n) || ps.some(function (p) { return p && n.indexOf(p) >= 0; });
      return third && MIND.test(n);
    });
  };
  function parseJSON(txt) {
    var s = String(txt || ""), m = s.match(/```(?:json)?\s*([\s\S]*?)```/); if (m) s = m[1];
    var i = s.search(/[\[{]/); if (i < 0) return null;
    var close = s[i] === "[" ? "]" : "}", j = s.lastIndexOf(close); if (j < i) return null;
    try { return JSON.parse(s.slice(i, j + 1)); } catch (e) { return null; }
  }
  A.knotParseJSON = parseJSON;
  /* ---------- پیوستِ تصویری برای هوش مصنوعی («عکسِ سؤالِ آزمونِ هوش»؛ مالک ۲۰۲۶-۱۰-۱۲) ----------
     فقط در میزبان (A.HOST.files): پیوست‌های یک موقعیت — از ۲۰۲۶-۱۰-۱۴ **هر قالب** (Word، Excel، PowerPoint، PDF ِ اسکن‌شده، صوت/ویدیو،
     ZIP، …) تا ۴۰ فایل و ۱۰۰ مگابایت؛ سرور هر کدام را **کامل** می‌خواند (app_reading) — پیش‌تر فقط ۴ عکس/PDF ِ ≤ ۸ مگابایت.
     recIds به ترتیبِ اولویت؛ اولین موقعیتی که پیوستِ مناسب دارد برگزیده می‌شود. نسخهٔ مستقل ⇒ null (همه‌چیز بی تصویر کار می‌کند). */
  var AI_FILE_MAX = 100 * 1024 * 1024;
  function aiFileOk(f) { return !!f && f.id != null && (+f.size || 0) <= AI_FILE_MAX; }
  A.knotAIFileOk = aiFileOk;
  A.knotAttachables = function (recIds) {
    if (!(A.HOST && typeof A.HOST.files === "function")) return Promise.resolve(null);
    var ids = (recIds || []).filter(Boolean), i = 0;
    return new Promise(function (resolve) {
      (function next() {
        if (i >= ids.length) return resolve(null);
        var rid = ids[i++], pr;
        try { pr = A.HOST.files(rid); } catch (e) { return next(); }
        Promise.resolve(pr).then(function (fs) {
          var all = (fs || []).filter(aiFileOk);
          all.forEach(function (x) { A.fileNames[x.id] = x.name; });
          var ok = all.slice(0, A.AI_FILE_MAX || 40);  /* سقف همان ۴۰؛ بقیه با نام در کادر گفته می‌شود (dropped) */
          if (ok.length) resolve({ recId: rid, files: ok, dropped: all.slice(ok.length) }); else next();
        }, function () { next(); });
      })();
    });
  };
  function aiGate(o) {
    /* o: {purpose, system, build(includePrivate) ⇒ text, people, onResult(txt, meta) [may return a promise], onDone(),
           noPriv (no private-fields toggle), more (extra line: what else is sent in the same action),
           onSend(text, meta) ⇒ confirm-only: the caller makes the request(s) itself with the confirmed text/names (a17),
           attach: {recIds:[kcase ids, by priority]} ⇒ in the host, the case's image/PDF attachments are listed with a checkbox
             (default ON when that case's kinds include "problem") and meta.fileIds carries the chosen ids}
       Same component for every AI request of the knot workshop: safety check ⇒ notice + exact preview + name removal ⇒ request. */
    function start() {
      if (A.knotSafetyHit(o.build(true))) { A.knotSafetyCard(open, o.onDone); return; }
      open();
    }
    function open() {
      var strip = true, priv = false, att = null, attOn = false;
      var names = h("input", { type: "text", id: "knAiNames", placeholder: "مثلاً: علی، سارا رضایی", oninput: upd });
      var pre = h("textarea", { id: "knAiPre", rows: 7, readonly: true, class: "kn-pre" });
      function finalText() { var t = o.build(priv); return strip ? stripNames(t, names.value) : t; }
      function meta() { return { names: strip ? nameList(names.value) : [], strip: strip, priv: priv, fileIds: att && attOn ? att.files.map(function (f) { return f.id; }) : [] }; }
      /* o.maskPreview: متنی که در پیش‌نمایش پوشیده می‌شود ولی فرستاده می‌شود (ممیزی ۲۰۲۶-۱۰-۱۳: پاسخی که کاربر هنوز ندیده
         در پیش‌نمایشِ نردبان دیده می‌شد) — پیش‌نمایش صریحاً می‌گوید چه چیزی پوشیده است */
      function upd() { pre.value = o.maskPreview ? o.maskPreview(finalText()) : finalText(); }
      /* پیوستِ تصویری: فقط اگر میزبان پیوست دارد؛ تا خوانده نشده، چیزی فرستاده نمی‌شود (fileIds خالی) */
      var attBox = null;
      if (o.attach && A.HOST && typeof A.HOST.files === "function") {
        attBox = h("div", { class: "kn-ai-att small muted", "aria-live": "polite" }, "در حالِ خواندنِ فهرستِ پیوست‌ها…");
        A.knotAttachables(o.attach.recIds).then(function (r) {
          attBox.innerHTML = "";
          if (!r) { attBox.textContent = "پیوستی برای این موقعیت نیست؛ فقط متن فرستاده می‌شود."; return; }
          att = r; var rec = S.get(r.recId) || {};
          attOn = (rec.kinds || []).indexOf("problem") >= 0;
          var warn = h("p", { class: "small warnline kn-ai-attw" + (attOn ? "" : " hidden") }, "پیوست‌ها هم همراهِ همین متن برای همان ارائه‌دهندهٔ بیرونیِ هوش مصنوعی فرستاده و کامل خوانده می‌شوند. «حذفِ نام‌ها» فقط روی متن اثر دارد، نه روی محتوای فایل‌ها.");
          attBox.classList.remove("muted");
          attBox.appendChild(h("label", { class: "row gap", for: "knAiAtt" }, h("input", { type: "checkbox", id: "knAiAtt", checked: attOn, onchange: function (e) { attOn = e.target.checked; warn.classList.toggle("hidden", !attOn); } }),
            "پیوست‌ها هم فرستاده و کامل خوانده شوند (" + fa(r.files.length) + ")"));
          attBox.appendChild(h("ul", { class: "plain small kn-ai-files" }, r.files.map(function (f) { return h("li", {}, "📎 ", h("bdi", {}, f.name || "پیوست")); })));
          if (r.dropped && r.dropped.length) attBox.appendChild(h("p", { class: "small warnline kn-ai-attdrop", role: "alert" },
            A.aiFileDropMsg(r.dropped.map(A.aiFileName), r.files.length + r.dropped.length)));
          var ids0 = o.attach.recIds || [];
          if (ids0.length > 1 || ids0[0] !== r.recId) attBox.appendChild(h("p", { class: "small muted" }, "از موقعیتِ «" + (rec.title || "موقعیت") + "»."));
          attBox.appendChild(warn);
        }, function () { attBox.textContent = "پیوست‌ها خوانده نشد؛ فقط متن فرستاده می‌شود."; });
      }
      var ov = h("div", { class: "overlay kn-ai", role: "dialog", "aria-modal": "true", "aria-labelledby": "knAiT" });
      var send = h("button", { class: "btn", onclick: function () { var t = finalText(), m = meta(); ov.remove(); if (o.onSend) o.onSend(t, m); else call(t, m); } }, "بفرست");
      ov.appendChild(h("div", { class: "dialog wide", dir: "rtl" },
        h("h3", { id: "knAiT" }, "پیش از فرستادن: " + o.purpose),
        h("p", {}, h("b", {}, "این متن برای ارائه‌دهندهٔ بیرونیِ هوش مصنوعی فرستاده می‌شود"), A.HOST ? " (از راهِ سرورِ Lifemanager به مدلِ تنظیم‌شده)." : " (مستقیم به ارائه‌دهنده‌ای که در «تنظیمات» گذاشته‌ای).",
          " خروجی فقط پیشنهاد است؛ چیزی خودکار اعمال نمی‌شود."),
        h("label", { class: "row gap" }, h("input", { type: "checkbox", id: "knAiStrip", checked: true, onchange: function (e) { strip = e.target.checked; upd(); } }), "حذفِ نام‌ها: هر نامی که این‌جا بنویسی (فقط واژهٔ کامل) با «[شخص]» جایگزین می‌شود"),
        h("label", { for: "knAiNames", class: "small" }, "نام‌هایی که نباید فرستاده شوند" + (o.people ? " (دیگرانِ درگیر را «" + o.people + "» نوشته‌ای؛ اگر نامِ واقعی است این‌جا هم بنویس)" : "")), names,
        o.noPriv ? null : h("label", { class: "row gap small" }, h("input", { type: "checkbox", onchange: function (e) { priv = e.target.checked; upd(); } }), "فیلدهای خصوصی (نام و شدتِ احساس) هم فرستاده شود"),
        h("label", { for: "knAiPre", class: "small muted" }, "دقیقاً همین فرستاده می‌شود:"), pre,
        attBox,
        o.more ? h("p", { class: "small muted kn-ai-more" }, o.more) : null,
        h("div", { class: "row gap wrap" }, send, h("button", { class: "btn ghost", onclick: function () { ov.remove(); if (o.onDone) o.onDone(); } }, "انصراف"))));
      upd(); A.layer().appendChild(ov); send.focus();
    }
    function call(text, m) {
      Promise.resolve().then(function () { return m.fileIds && m.fileIds.length ? A.callAI(o.system, text, { fileIds: m.fileIds }) : A.callAI(o.system, text); })
        .then(function (txt) { return o.onResult(txt, m); }).then(null, function (e) { A.toast((e && e.message) || "اتصال به هوش مصنوعی برقرار نشد", "bad"); })
        .then(function () { if (o.onDone) o.onDone(); });
    }
    start();
  }
  A.knotAIGate = aiGate;
  /* کنترلِ نشت (§۵، §۱۲.۵-د): هیچ پله/راهنمایی نباید رشتهٔ پاسخ یا عددِ پاسخ را داشته باشد */
  function compact(s) { return norm(s).replace(/[\s«»"'`.,،؛;:!?؟()\[\]{}]/g, ""); }
  A.knotLeaks = function (answer, texts) {
    var a = compact(answer); if (!a) return [];
    var nums = (norm(answer).match(/-?\d+(?:[.\/]\d+)?/g) || []);
    var numOnly = nums.length === 1 && compact(answer).replace(/[^\d.\/-]/g, "").length >= compact(answer).length - 3;
    var bad = [];
    (texts || []).forEach(function (t, i) {
      var c = compact(t);
      if (c.indexOf(a) >= 0) { bad.push(i); return; }
      if (numOnly && new RegExp("(^|[^\\d.])" + nums[0].replace(/[.\/]/g, "\\$&") + "($|[^\\d])").test(norm(t))) bad.push(i);
    });
    return bad;
  };

  /* ---------- حالتِ نمایش ---------- */
  var ORDER = ["in", "s0", "s1", "s2", "s3", "s4"];
  var SNAME = { in: "ثبت", s0: "۰ آیا گره است؟", s1: "۱ فرضیه‌ها", s2: "۲ آزمون‌ها", s3: "۳ ریشه", s4: "۴ بازکردن" };
  function blank() {
    return { id: A.uid("kc"), type: "kcase", title: "", kinds: [], intake: { stmts: [] }, premise: {}, rank: {}, ev: [], pans: {}, ladder: {}, iso: null,
      root: { extra: [], why5: [] }, knots: [], acts: [], hyps: [], topic: A.pendingTopic || "", status: "open", step: "in" };
  }
  function fill(kc) {
    kc.kinds = kc.kinds || []; kc.intake = kc.intake || {}; kc.intake.stmts = kc.intake.stmts || []; kc.premise = kc.premise || {}; kc.ev = kc.ev || [];
    kc.pans = kc.pans || {}; kc.ladder = kc.ladder || {}; kc.root = kc.root || {}; kc.root.extra = kc.root.extra || []; kc.root.why5 = kc.root.why5 || [];
    kc.knots = kc.knots || []; kc.acts = kc.acts || []; kc.hyps = kc.hyps || []; return kc;
  }
  A.knotNewCase = function () { return fill(blank()); };  // برای پل‌های بیرونی (مثلاً «گیر کردم» ِ مسئله‌های بزرگ، a19): همان شکلِ موقعیتِ عادی
  function autoTitle(kc) { var t = String((kc.intake || {}).what || "").trim().replace(/\s+/g, " "); return t ? (t.length > 60 ? t.slice(0, 58) + "…" : t) : "موقعیت"; }
  function snapshot(kc) { var r = {}; A.knotRank(kc).forEach(function (x) { r[x.fam] = { score: x.score, why: x.why }; }); kc.rank = r; }
  /* یک دستگیره برای هر نمایش: رکورد فقط با اولین تغییرِ واقعی ساخته می‌شود؛ هر تغییر = یک نوشتن (تایپ با درنگ جمع می‌شود). */
  var TIMERS = {};
  function handle(kc, live) {
    var H = {
      kc: kc, live: function () { return live; },
      put: function () {
        if (TIMERS[kc.id]) { clearTimeout(TIMERS[kc.id]); delete TIMERS[kc.id]; }
        if (!kc.titleSet) kc.title = autoTitle(kc);
        snapshot(kc); S.put(kc);
        if (!live) { live = true; adopt(kc); }
      },
      soon: function () { if (TIMERS[kc.id]) clearTimeout(TIMERS[kc.id]); TIMERS[kc.id] = setTimeout(function () { delete TIMERS[kc.id]; H.put(); }, 450); },
      flush: function () { if (TIMERS[kc.id]) H.put(); }
    };
    return H;
  }
  function adopt(kc) {
    if (A.state.view !== "kcase") return;
    A.state.arg = kc.id;
    if (A.HOST && A.HOST.navigate) { try { A.HOST.navigate({ tab: "kcase", a: kc.id, s: A.state.sub || "", replace: true }); } catch (e) { } }
  }
  function redraw() { var y = window.scrollY; A.render(); try { window.scrollTo(0, y); } catch (e) { } }
  function seenIso(kc) { return kc.intake.seen === "yes" || (kc.ladder.opened != null && kc.ladder.opened >= 0); }
  function isProblem(kc) { return kc.kinds.indexOf("problem") >= 0; }
  function isPractical(kc) { return ["behavior", "social", "inference"].some(function (k) { return kc.kinds.indexOf(k) >= 0; }); }
  function recurring(kc) { return kc.intake.freq === "some" || kc.intake.freq === "often" || kc.kinds.indexOf("repeat") >= 0; }
  var REQ = [["kinds", "نوعِ موقعیت"], ["what", "چه شد"], ["expected", "چه انتظار داشتم"], ["actual", "در واقع چه شد"], ["thoughts", "چه فکرهایی کردم/چه کردم"], ["seen", "پاسخ/راه‌حل را دیده‌ای؟"]];
  function intakeMissing(kc) {
    return REQ.filter(function (r) { return r[0] === "kinds" ? !kc.kinds.length : !String(kc.intake[r[0]] || "").trim(); });
  }
  function lockReason(kc, s) {
    var i = ORDER.indexOf(s);
    if (i >= 1) {
      var m = intakeMissing(kc);
      if (m.length) return "اول «ثبت» را کامل کن: " + m.map(function (x) { return x[1]; }).slice(0, 3).join("، ") + (m.length > 3 ? "…" : "");
      if (safetyPending(kc)) return "اول پیامِ ایمنی را بخوان و تأیید کن.";
    }
    if (i >= 2 && !kc.premise.verdict) return "در قدمِ ۰ بگو آیا احتمالاً گره است.";
    if (i >= 4 && !kc.ev.length) return "دست‌کم یک شاهد (پاسخِ یک آزمون یا بازشدن در یک پلهٔ نردبان) در قدمِ ۲ ثبت کن.";
    if (i >= 5 && !(kc.root.confirmed && kc.knots.length)) return "در قدمِ ۳ ریشه را تأیید کن.";
    return null;
  }
  A.knotLockReason = lockReason;
  function furthest(kc) { var f = "in"; ORDER.forEach(function (s) { if (!lockReason(kc, s)) f = s; }); return f; }
  function goStep(H, s) {
    var kc = H.kc, r = lockReason(kc, s);
    if (r) { A.toast(r, "bad"); return false; }
    H.flush();
    if (H.live() && kc.step !== s) { kc.step = s; H.put(); }
    A.go("kcase", H.live() ? kc.id : "new", s);
    return true;
  }

  /* ---------- اجزای فرم ---------- */
  function fld(label, ctl, o) {
    o = o || {};
    return h("div", { class: "kn-f" + (o.req ? " req" : "") + (o.cls ? " " + o.cls : ""), "data-k": o.k || null },
      h("label", { class: "flabel", for: ctl.id || null }, label, o.req ? h("span", { class: "reqmark", title: "الزامی" }, " *") : null,
        o.priv ? h("span", { class: "chip kn-priv", title: "فقط در همین برنامه؛ به هوش مصنوعی فرستاده نمی‌شود مگر خودت بخواهی." }, "🔒 خصوصی") : null),
      ctl, o.hint ? h("div", { class: "fhint" }, o.hint) : null);
  }
  function group(legend, kids, o) {
    o = o || {};
    return h("fieldset", { class: "kn-g" + (o.req ? " req" : ""), "data-k": o.k || null }, h("legend", { class: "flabel" }, legend, o.req ? h("span", { class: "reqmark", title: "الزامی" }, " *") : null), kids, o.hint ? h("div", { class: "fhint" }, o.hint) : null);
  }
  function scaleSel(id, val, onCh) {
    var s = h("select", { id: id, onchange: function (e) { onCh(e.target.value === "" ? "" : +e.target.value); } }, h("option", { value: "" }, "—"));
    for (var i = 0; i <= 10; i++) s.appendChild(h("option", { value: String(i), selected: val !== "" && val != null && +val === i }, fa(i)));
    return s;
  }
  function sel(id, val, opts, onCh) {
    return h("select", { id: id, onchange: function (e) { onCh(e.target.value); } }, h("option", { value: "" }, "— انتخاب کن —"),
      opts.map(function (o) { return h("option", { value: o[0], selected: val === o[0] }, o[1]); }));
  }
  function radios(name, val, opts, onCh, own) {
    return h("div", { class: "kn-radios", role: "radiogroup", "data-own": own ? "1" : null }, opts.map(function (o, i) {
      var id = name + "_" + i;
      return h("label", { class: "kn-radio", for: id }, h("input", { type: "radio", id: id, name: name, value: o[0], checked: val === o[0], onchange: function () { onCh(o[0]); } }), h("span", {}, o[1]));
    }));
  }
  function area(id, val, rows, onIn, ph) { var t = h("textarea", { id: id, rows: rows || 3, placeholder: ph || "", oninput: function (e) { onIn(e.target.value); } }); t.value = val || ""; return t; }
  function txt(id, val, onIn, ph) { return h("input", { type: "text", id: id, value: val || "", placeholder: ph || "", oninput: function (e) { onIn(e.target.value); } }); }
  function famChip(id) { var F = KFM[id]; return F ? h("span", { class: "chip kn-fam", style: { "--kc": "var(--p" + ((F.n - 1) % 9) + ")" } }, famName(id)) : null; }
  /* نوعِ شاهد بی عدد: رتبه دیگر وزن ندارد (مالک ۲۰۲۶-۱۰-۱۵) — فقط این‌که چه جور شاهدی است (کارزارِ سوم v05: «±۱ / ±۰٫۵» هنوز دیده می‌شد) */
  function kchip(kind) { return h("span", { class: "chip kn-k kn-k-" + kind }, KWFA[kind]); }

  /* ================= نمای «موقعیت» ================= */
  A.V.kcase = function (id, step) {
    var kc = id && id !== "new" ? S.get(id) : null;
    if (id && id !== "new" && (!kc || kc.type !== "kcase")) return A.empty("این موقعیت پیدا نشد.", h("button", { class: "btn", onclick: function () { A.go("kcases"); } }, "🪢 فهرستِ موقعیت‌ها"));
    var live = !!kc; kc = fill(kc || blank());
    var H = handle(kc, live);
    var want = ORDER.indexOf(step) >= 0 ? step : (live ? (ORDER.indexOf(kc.step) >= 0 ? kc.step : "in") : "in");
    var cur = want, note = lockReason(kc, want);
    if (note) { for (var i = ORDER.indexOf(want); i >= 0; i--) if (!lockReason(kc, ORDER[i])) { cur = ORDER[i]; break; } A.state.sub = cur; }
    var root = h("div", { class: "page kn", dir: "rtl" });
    root.appendChild(h("div", { class: "row between wrap gap kn-top" },
      h("button", { class: "linkish", onclick: function () { A.go("kcases"); } }, "← همهٔ موقعیت‌ها"),
      h("span", { class: "small muted" }, live ? (KCST[kc.status] || "") + " · " + A.fdate(kc.created) : "تا چیزی ننویسی، چیزی ذخیره نمی‌شود")));
    root.appendChild(A.head("گره‌گشا · موقعیت", live && kc.title ? kc.title : "موقعیتِ تازه",
      "قدم‌به‌قدم: ثبت ⇐ آیا اصلاً گره است؟ ⇐ همهٔ ۱۲ خانوادهٔ فرضیه ⇐ آزمون‌هایی که آن‌ها را از هم جدا می‌کنند ⇐ ریشه (با تأییدِ خودت) ⇐ بازکردن. هر قدم ذخیره می‌شود و هر وقت برگردی همان‌جا ادامه می‌دهی."));
    root.appendChild(strip(H, cur));
    if (note && cur !== want) root.appendChild(h("p", { class: "card soft kn-note small" }, "🔒 " + note));
    if (live && safetyPending(kc)) root.appendChild(h("section", { class: "card kn-safeinline" }, h("p", {}, "پیش از ادامه، پیامِ ایمنی را بخوان."),
      h("button", { class: "btn sm", onclick: function () { A.knotSafetyCard(function () { kc.safetyAck = now(); H.put(); redraw(); }); } }, "خواندنِ پیام")));
    var body = cur === "in" ? intakeStep(H) : cur === "s0" ? premiseStep(H) : cur === "s1" ? rankStep(H) : cur === "s2" ? probeStep(H) : cur === "s3" ? rootStep(H) : unpackStep(H);
    root.appendChild(h("div", { class: "kn-body" }, body));
    /* «🧪 شبیه‌سازِ همین مسئله» (۲۰۲۶-۱۰-۱۳): شبیه‌ساز از مسئلهٔ خودِ مالک، با همان موتورِ «مسئله‌های بزرگ» (a8) */
    if (live && isProblem(kc) && A.probCaseBox) { try { var pcb = A.probCaseBox(kc, seenIso(kc)); if (pcb) root.appendChild(pcb); } catch (e) { console.warn(e); } }
    var oi = ORDER.indexOf(cur);
    root.appendChild(h("div", { class: "row between gap kn-nav" },
      oi > 0 ? h("button", { class: "btn ghost", onclick: function () { goStep(H, ORDER[oi - 1]); } }, "→ قدمِ قبل") : h("span"),
      oi < ORDER.length - 1 ? h("button", { class: "btn kn-next", onclick: function () { nextFrom(H, cur, root); } }, "قدمِ بعد ←") : h("span")));
    return root;
  };
  function nextFrom(H, cur, root) {
    var kc = H.kc, nx = ORDER[ORDER.indexOf(cur) + 1];
    if (cur === "in") {
      var miss = intakeMissing(kc);
      root.querySelectorAll("[data-k]").forEach(function (el) { el.classList.toggle("missing", miss.some(function (m) { return m[0] === el.getAttribute("data-k"); })); });
      if (miss.length) { A.toast("این‌ها هنوز خالی‌اند: " + miss.map(function (m) { return m[1]; }).slice(0, 3).join("، "), "bad"); var f = root.querySelector(".missing"); if (f && f.scrollIntoView) f.scrollIntoView({ block: "center" }); return; }
      if (safetyPending(kc)) { A.knotSafetyCard(function () { kc.safetyAck = now(); H.put(); goStep(H, nx); }); return; }
    }
    goStep(H, nx);
  }
  function strip(H, cur) {
    var kc = H.kc, fi = ORDER.indexOf(furthest(kc));
    return h("ol", { class: "kn-strip", "aria-label": "قدم‌های تونل" }, ORDER.map(function (s, i) {
      var lock = lockReason(kc, s), here = s === cur, done = i < fi && !here;
      return h("li", { class: "kn-st" + (here ? " here" : "") + (done ? " done" : "") + (lock ? " lock" : "") },
        h("button", { type: "button", disabled: !!lock && !here, "aria-current": here ? "step" : null, title: lock || SNAME[s],
          // برچسبِ دسترس‌پذیر: این‌ها «رفتن به قدم» اند، نه دکمهٔ ذخیره (دستیار «✓ثبت» را با «ثبت کن» اشتباه می‌گرفت)
          "aria-label": "رفتن به قدمِ «" + SNAME[s] + "»" + (here ? " — همین‌جا" : lock ? " — قفل" : done ? " — گذشته" : ""), onclick: function () { if (!here) goStep(H, s); } },
          h("span", { class: "n", "aria-hidden": "true" }, here ? "📍" : lock ? "🔒" : done ? "✓" : "○"), h("span", { class: "t" }, SNAME[s])));
    }));
  }

  /* ---------- «عکسِ سؤال» درست در کارتِ ثبت (فقط میزبان) ----------
     همان درِ «پیوست‌ها»ی a12 (A.HOST.upload ⇒ فولدرِ همین موقعیت در درایو؛ سرور فقط اشاره‌گر نگه می‌دارد)، پس پیوست در فهرستِ
     «📎 پیوست‌ها»ی پایینِ صفحه هم هست. موقعیت تا اولین ورودی ساخته نمی‌شود؛ انتخابِ فایل خودش ورودی است ⇒ اگر هنوز نیست، همین‌جا ساخته می‌شود. */
  function upErr(e) { var d = e && e.response && e.response.data; return (d && d.detail) || (e && e.message) || "فرستادنِ فایل ناموفق بود"; }
  function photoField(H) {
    var kc = H.kc, st = h("span", { class: "small muted kn-upst", "aria-live": "polite" }), list = h("ul", { class: "plain small kn-uplist" });
    function load() {
      if (!H.live() || typeof A.HOST.files !== "function") return;
      Promise.resolve(A.HOST.files(kc.id)).then(function (fs) {
        list.innerHTML = "";
        (fs || []).forEach(function (f) { list.appendChild(h("li", {}, h("a", { href: f.link, target: "_blank", rel: "noopener" }, "📎 " + (f.name || "پیوست")))); });
      }, function () { });
    }
    var inp = h("input", { type: "file", id: "knPhoto", multiple: true, onchange: function () {
      var files = Array.prototype.slice.call(inp.files || []); if (!files.length) return;
      if (!H.live()) H.put(); else H.flush();   // the record must exist before its first attachment
      var i = 0, ok = 0;
      (function next() {
        if (i >= files.length) {
          inp.value = ""; A._mirrorCache = null;
          if (ok) { st.textContent = ""; A.toast(fa(ok) + " فایل در فولدرِ این موقعیت در درایو گذاشته شد."); redraw(); }
          return;
        }
        var f = files[i++];
        if (f.size > 100 * 1048576) { st.textContent = "«" + f.name + "» بزرگ‌تر از ۱۰۰ مگابایت است."; A.toast(st.textContent, "bad"); return next(); }
        st.textContent = "در حالِ فرستادنِ «" + f.name + "» به درایو…";
        Promise.resolve().then(function () { return A.HOST.upload(kc.id, f, { group: "گره‌گشا — موقعیت‌ها", title: kc.title || "موقعیت" }); })
          .then(function () { ok++; next(); }, function (e) { st.textContent = upErr(e); st.classList.remove("muted"); st.classList.add("bad"); A.toast(st.textContent, "bad"); next(); });
      })();
    } });
    load();
    return fld("عکسِ سؤال (اختیاری)", h("div", { class: "col gap kn-photo" }, h("div", { class: "row gap wrap" }, inp, st), list),
      { hint: "عکس، PDF یا هر فایلِ صورتِ مسئله (Word، Excel، صوت…)؛ مستقیم در فولدرِ همین موقعیت در گوگل درایو (نه در سرور). اگر هوش مصنوعی بخواهی، پیش از هر درخواست می‌پرسیم که تصویر هم فرستاده شود یا نه." });
  }

  /* ---------- ثبت ---------- */
  var SHOWN_SAFE = {};
  /* قابِ مسئلهٔ عملی — یک وارسیِ کدی برای دو جا (ثبتِ موقعیت در گره‌گشا، و لایهٔ «مسئلهٔ عملی» ِ غربالِ دستیار): هر جزء نوشته شده و
     هیچ جزئی رونوشتِ جزءِ دیگر نیست. عددِ قراردادی (کمینهٔ واژه) ندارد: «نوشته» یعنی ناخالی. */
  /* R4 — تصمیمِ مالک (۲۰۲۶-۱۰-۱۵؛ «موافقم»): دو جزءِ تازه برای تصمیم‌ها و ایده‌ها: «دانشِ پیشین و تجربیِ نادقیق» (آنچه از تجربهٔ خودت
     یا دیگران، حتی تقریبی، دربارهٔ چنین مسئله‌ای می‌دانی) و «ریاضی‌کردن» (مجهول ⇐ کمیتی با عدد/واحد، موفقیت ⇐ یک رابطه). وارسیِ کدیِ
     «ریاضی‌کردن»: دست‌کم یک عدد و یک رابطه (= ، ≥ ، ≤ ، < ، > ، «بیشتر/کمتر از»، «دست‌کم/حداکثر»…) — ساختار، نه آستانه. */
  var PRAC_KEYS = [["want", "مجهول (چه می‌خواهی)"], ["have", "داده‌ها"], ["cond", "شرط (قیدها)"], ["vague", "مفهومِ مبهم"], ["ignore", "دادهٔ کنارگذاشته و حدِ جست‌وجو"], ["approx", "تقریبِ کافی"],
    ["prior", "دانشِ پیشین و تجربیِ نادقیق"], ["measure", "ریاضی‌کردن (کمیت و رابطه)"]];
  A.KPRAC_KEYS = PRAC_KEYS;
  function pnorm(x) { return String(x == null ? "" : x).replace(/[\s\u200c«»"'.,،:؛!?؟()\-]+/g, ""); }
  var REL = /[=<>≤≥≠]|بیش(?:تر)? ?از|کم(?:تر)? ?از|دست ?\u200c?کم|حد ?\u200c?اقل|حد ?\u200c?اکثر|برابر|نه بیش|نه کم|تا سقفِ?|کمینه|بیشینه/;
  /* ممیزیِ ۲۰۲۶-۱۰-۱۵: «دست کم یک بار در روز» سنجیدنی است (عدد به واژه + شمارش)، «سال ۱۳۹۸ برابر بود» نیست (سال یا تاریخ کمیت نیست) —
     عدد = رقم یا واژهٔ عدد (یک، دو، نیم، …) که سال/تاریخ نباشد. */
  var NUMWORD = /(?:^|[^ء-يپچژکگی])(?:یک|یه|دو|سه|چهار|پنج|شش|هفت|هشت|ده|بیست|سی|چهل|پنجاه|صد|هزار|میلیون|نیم|نصف|ربع)(?![ء-يپچژکگی])/;
  A.measurableCheck = function (t) {
    var x0 = String(t == null ? "" : t).replace(/[۰-۹]/g, function (c) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(c); }).replace(/[٠-٩]/g, function (c) { return c.charCodeAt(0) - 0x660; }).replace(/‌/g, " ");
    var x = x0.replace(/(?:سال|year)\s*\d{2,4}/gi, " ").replace(/\d{2,4}\s*[\/\-.]\s*\d{1,2}\s*[\/\-.]\s*\d{1,4}/g, " ");
    var num = /[0-9]/.test(x) || NUMWORD.test(x), rel = REL.test(x);
    var why = []; if (!num) why.push("عدد یا مقدار (با واحد) ندارد"); if (!rel) why.push("رابطه‌ای (مثلاً ≥ ، ≤ ، = یا «دست‌کم/بیشتر از») ندارد");
    return { ok: num && rel, num: num, rel: rel, why: why };
  };
  A.practicalFrameCheck = function (parts, keys) {
    parts = parts || {}; var missing = keys.filter(function (k) { return !pnorm(parts[k[0]]); }), seen = {}, dup = [];
    keys.forEach(function (k) { var n = pnorm(parts[k[0]]); if (!n) return; if (seen[n]) dup.push(k[1]); else seen[n] = 1; });
    var mk = keys.filter(function (k) { return k[0] === "measure"; })[0], meas = mk && pnorm(parts.measure) ? A.measurableCheck(parts.measure) : null;
    return { ok: !missing.length && !dup.length && !(meas && !meas.ok), missing: missing, dup: dup, unmeasured: meas && !meas.ok ? meas.why : null };
  };
  A.practicalFrameCard = function (title, rows, src) {
    if (!A.newCard) return null;
    return A.newCard("قابِ مسئلهٔ عملیِ «" + String(title).slice(0, 80) + "»: بی‌نگاه بگو مجهول، داده، شرط، مفهومِ مبهم، دادهٔ کنارگذاشته (و حدِ اطلاعات)، تقریبِ کافی، دانشِ پیشین و صورتِ ریاضی‌اش (کمیت و رابطه) چه بود — و همین پرسش‌ها را برای تصمیمِ بعدی‌ات بپرس.",
      rows.map(function (r) { return r[0] + ": " + r[1]; }).join("\n"), { due: A.addDays(A.today(), 1), src: src });
  };
  function intakeStep(H) {
    var kc = H.kc, it = kc.intake;
    var box = h("div", { class: "col gap kn-intake" });
    var safeCheck = A.debounce(function () {
      if (H.live() && !kc.safetyAck && !SHOWN_SAFE[kc.id] && A.knotSafetyHit(kcText(kc))) { SHOWN_SAFE[kc.id] = 1; A.knotSafetyCard(function () { kc.safetyAck = now(); H.put(); }); }
    }, 900);
    function ch() { H.soon(); safeCheck(); }
    function set(k) { return function (v) { it[k] = v; ch(); }; }
    var probSec = h("section", { class: "card kn-prob" + (isProblem(kc) ? "" : " hidden") },
      h("h3", {}, "اگر مسئله است"),
      fld("صورتِ کامل", area("knStmt", it.statement, 4, set("statement")), { hint: A.HOST && A.HOST.upload ? "عکسِ مسئله را همین پایین در «عکسِ سؤال» بگذار؛ در «پیوست‌ها»ی همین موقعیت هم دیده می‌شود. اگر صورت فقط در عکس است، این‌جا یک جملهٔ کوتاه بنویس (مثلاً «صورت در عکسِ پیوست است»)." : "پس از ثبت، عکسِ مسئله را در بخشِ «پیوست‌ها»ی همین موقعیت بگذار (فقط داخلِ Lifemanager؛ در این نسخهٔ مستقل پیوست نیست — متن را بنویس)." }),
      A.HOST && typeof A.HOST.upload === "function" ? photoField(H) : null,
      fld("پاسخِ درست", txt("knAns", it.answer, set("answer")), { hint: "برای نردبانِ راهنمایی و کنترلِ نشت لازم است." }),
      fld("از کجا معلوم است که این پاسخ درست است؟", txt("knAnsHow", it.answerHow, set("answerHow"))),
      fld("کجا دقیقاً گیر کردم؟", area("knStuck", it.stuckAt, 2, set("stuckAt"))),
      fld("چقدر وقت گذاشتم؟ (دقیقه)", h("input", { type: "number", id: "knMin", min: "0", value: it.minutes == null ? "" : it.minutes, oninput: function (e) { it.minutes = e.target.value; ch(); } })));
    /* مسئلهٔ عملی (تصمیم، کار، رابطه): همان قالبِ «مجهول / داده / شرط» ِ مسئله‌های ذهنی، به‌اضافهٔ مفهومِ مبهم، داده‌ای که آگاهانه کنار می‌گذاری
       و این‌که تا کجا اطلاعات جمع می‌کنی (⇐ ایستگاهِ «مسئولیتِ معرفتی»)، و تقریبی که بس است. اختیاری؛ در intake.prac ذخیره می‌شود. */
    var pr = it.prac = it.prac || {};
    function setP(k) { return function (v) { pr[k] = v; it.prac = pr; ch(); }; }
    /* وارسیِ قاب با کد (بی‌مدل): هر شش جزء، از قلمِ خودت؛ قابِ کامل ⇒ یک کارتِ مرور (فردا و بعد روی نردبانِ مرور) — همان کارتی که غربالِ دستیار هم می‌سازد */
    var pracOut = h("div", { class: "small kn-pracout", "aria-live": "polite" });
    function pracRun() {
      var r = A.practicalFrameCheck(pr, PRAC_KEYS);
      pr.chk = { at: now(), ok: r.ok, missing: r.missing.map(function (x) { return x[0]; }), dup: r.dup };
      pracOut.innerHTML = "";
      if (!r.ok) { pracOut.appendChild(h("p", { class: "bad" }, "قاب هنوز کامل نیست: " + r.missing.map(function (x) { return "«" + x[1] + "»"; }).concat(r.dup.map(function (d) { return "«" + d + "» همان جزءِ دیگری را تکرار می‌کند"; })).concat(r.unmeasured ? ["«ریاضی‌کردن» هنوز سنجیدنی نیست: " + r.unmeasured.join(" و ")] : []).join("، ") + ".")); ch(); return; }
      if (!pr.card) { var cd = A.practicalFrameCard(kc.title || it.what || "تصمیم", PRAC_KEYS.map(function (x) { return [x[1], pr[x[0]]]; }), "knot:practical"); if (cd) pr.card = cd.id; }
      pracOut.appendChild(h("p", { class: "good" }, "قاب کامل است: هر " + fa(PRAC_KEYS.length) + " جزء از نوشتهٔ خودت، و صورتِ ریاضی‌اش سنجیدنی است. یک کارتِ مرور ساخته شد (فردا، و بعد با فاصلهٔ بیشتر) تا همین پرسش‌ها را برای تصمیمِ بعدی‌ات بی‌نگاه بپرسی."));
      ch();
    }
    var pracSec = h("section", { class: "card kn-prac" + (isPractical(kc) ? "" : " hidden"), dir: "rtl", "data-own": "1" },
      h("h3", {}, "اگر مسئلهٔ عملی است (تصمیم، کار، رابطه)"),
      h("p", { class: "small muted" }, "همان پرسش‌هایی که در هر مسئله می‌پرسی؛ اختیاری‌اند ولی گره‌یابی و گام‌های بعد را دقیق‌تر می‌کنند."),
      h("div", { class: "kn-grid" },
        fld("چه می‌خواهی؟ (مجهول)", area("knPWant", pr.want, 2, setP("want"), "دقیقاً چه چیزی باید روشن یا انجام شود؟")),
        fld("چه داری؟ (داده‌ها)", area("knPHave", pr.have, 2, setP("have"), "واقعیت‌ها، منابع، زمان، کسانی که می‌توانند کمک کنند")),
        fld("چه قیدهایی هست؟ (شرط)", area("knPCond", pr.cond, 2, setP("cond"), "مهلت، بودجه، قاعده، آنچه نباید از دست برود")),
        fld("کدام مفهومِ مبهم را باید روشن کنی؟", area("knPVague", pr.vague, 2, setP("vague"), "مثلاً «موفق»، «به‌موقع»، «کافی» یعنی دقیقاً چه؟")),
        fld("کدام داده را آگاهانه کنار می‌گذاری، و تا کجا اطلاعات جمع می‌کنی؟", area("knPIgnore", pr.ignore, 2, setP("ignore"), "چه چیزی را نمی‌پرسی و چرا؛ کِی دست از جست‌وجو می‌کشی")),
        fld("کدام تقریب بس است؟", area("knPApprox", pr.approx, 2, setP("approx"), "چه دقتی برای این تصمیم کافی است؟")),
        fld("از تجربهٔ خودت یا دیگران دربارهٔ چنین مسئله‌ای چه می‌دانی — حتی نادقیق؟ (دانشِ پیشین)", area("knPPrior", pr.prior, 2, setP("prior"), "قاعدهٔ سرانگشتی، موردِ مشابهی که دیده‌ای، حرفِ کسی که این کار را کرده — و چقدر به آن اعتماد داری")),
        fld("ریاضی‌اش کن: مجهول را یک کمیت (با عدد/واحد) و موفقیت را یک رابطه بنویس", area("knPMeasure", pr.measure, 2, setP("measure"), "مثلاً «x = درآمدِ ماهانه؛ موفقیت: x ≥ ۲۵ میلیون تا شش ماهِ دیگر، رفت‌وآمد ≤ ۴۵ دقیقه»"))),
      A.solveKitUI ? (function () { pr.kit = pr.kit || A.solveBlankKit(); var kd = A.solveKitUI(pr.kit, { idp: "knPK", parts: ["rivals", "table"], drills: false, title: "گزینه‌ها و حدس‌های رقیب (اختیاری؛ وارسی با کد)",
        rivTitle: "گزینه‌ها یا حدس‌های رقیب", rivHint: "دست‌کم دو گزینه یا دو حدس دربارهٔ نتیجه (مثلاً «جابه‌جایی درآمد را بالا می‌برد» در برابرِ «فقط هزینهٔ رفت‌وآمد را جابه‌جا می‌کند») — هر کدام با آزمونی که می‌تواند ردش کند.",
        tableTitle: "موردهایی که دیده‌ای یا حساب کرده‌ای", onCheck: function () { it.prac = pr; ch(); } }); kd.addEventListener("change", function () { it.prac = pr; ch(); }); return kd; })() : null,
      A.stLink && A.EST && A.EST.st_resp ? h("div", { class: "row gap wrap small" }, h("span", { class: "muted" }, "برای «تا کجا اطلاعات جمع کنم؟»: "), A.stLink("st_resp")) : null,
      h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm kn-pracchk", type: "button", onclick: pracRun }, "وارسیِ قاب (همهٔ جزءها)"),
        pr.card ? h("span", { class: "small muted" }, "کارتِ مرورِ این قاب ساخته شده است.") : null), pracOut);
    box.appendChild(h("section", { class: "card" },
      h("p", { class: "small muted" }, "واقعیت را بی‌تفسیر بنویس. اگر از کسی نام می‌بری، فقط نقش یا نامِ مستعار بنویس (مثلاً «مدیرِ بخش»، «همکارِ الف»). فیلدهای ستاره‌دار لازم‌اند؛ بقیه اختیاری. هر چه بنویسی خودکار ذخیره می‌شود."),
      group("نوعِ موقعیت (هر ترکیبی مجاز است)", h("div", { class: "kn-checks" }, KINDS.map(function (k, i) {
        var id = "knKind_" + i;
        return h("label", { class: "kn-check", for: id }, h("input", { type: "checkbox", id: id, checked: kc.kinds.indexOf(k[0]) >= 0, onchange: function (e) {
          var a = kc.kinds.filter(function (x) { return x !== k[0]; }); if (e.target.checked) a.push(k[0]);
          kc.kinds = KINDS.map(function (x) { return x[0]; }).filter(function (x) { return a.indexOf(x) >= 0; });
          probSec.classList.toggle("hidden", !isProblem(kc)); pracSec.classList.toggle("hidden", !isPractical(kc)); ch();
        } }), h("span", {}, k[1]));
      })), { req: true, k: "kinds" }),
      fld("عنوانِ کوتاه (اختیاری)", txt("knTitle", kc.titleSet ? kc.title : "", function (v) { kc.title = v.trim(); kc.titleSet = !!v.trim(); ch(); }, "اگر خالی بماند، از «چه شد» ساخته می‌شود")),
      fld("چه شد (واقعیت‌ها، بی‌تفسیر)", area("knWhat", it.what, 3, set("what")), { req: true, k: "what" }),
      fld("چه انتظار داشتم", area("knExp", it.expected, 2, set("expected")), { req: true, k: "expected" }),
      fld("در واقع چه شد", area("knAct", it.actual, 2, set("actual")), { req: true, k: "actual" }),
      fld("چه فکرهایی کردم / چه کردم (همان‌طور که یادت هست)", area("knThk", it.thoughts, 3, set("thoughts")), { req: true, k: "thoughts" }),
      group("پاسخ/راه‌حل را دیده‌ای؟", radios("knSeen", it.seen, [["yes", "بله، دیده‌ام"], ["no", "نه، هنوز ندیده‌ام"], ["na", "پاسخِ یکتایی در کار نیست (موقعیتِ باز)"]], function (v) { it.seen = v; ch(); }, true),
        { req: true, k: "seen", hint: "اگر دیده‌ای، نردبانِ راهنمایی روی همین مسئله خاموش می‌شود و آزمون‌ها روی یک «هم‌ریخت» (همان ساختار، ظاهرِ نو) انجام می‌شوند." })));
    box.appendChild(probSec);
    box.appendChild(pracSec);
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "زمینه"),
      h("div", { class: "kn-grid" },
        fld("چند بار پیش آمده؟", sel("knFreq", it.freq, A.KFREQ, set("freq"))),
        fld("چقدر پس از رخداد می‌نویسی؟", sel("knLag", it.lag, [["now", "همان روز (کمتر از ۲۴ ساعت)"], ["days", "۱ تا ۷ روز بعد"], ["weeks", "بیش از یک هفته بعد"]], set("lag")),
          { hint: "بیش از ۲۴ ساعت ⇒ حافظه با دانستنِ نتیجه بازنویسی می‌شود (سوگیریِ پس‌نگری، Fischhoff 1975)." }),
        fld("اهمیت (۰–۱۰)", scaleSel("knImp", it.imp, set("imp"))),
        fld("فشارِ زمان (۰–۱۰)", scaleSel("knPress", it.pressure, set("pressure"))),
        fld("خستگی (۰–۱۰)", scaleSel("knTired", it.fatigue, set("fatigue"))),
        fld("حضورِ دیگران یا ارزیابی‌شدن", sel("knOthers", it.others, [["yes", "بله"], ["no", "نه"]], set("others"))),
        fld("شدتِ احساس در لحظه (۰–۱۰)", scaleSel("knEmo", it.emo, set("emo")), { priv: true }),
        fld("نامِ آن احساس", txt("knEmoName", it.emoName, set("emoName")), { priv: true })),
      fld("دیگرانِ درگیر — فقط نقش یا نامِ مستعار", txt("knPeople", it.people, set("people"), "مثلاً: مدیرِ بخش، همکارِ الف"),
        { hint: "سامانه دربارهٔ حالِ درونی یا نیتِ دیگران فرضیه نمی‌سازد؛ فقط رفتارِ دیده‌شده و ساختارِ موقعیت." }),
      fld("زمینه (اختیاری)", area("knCtx", it.context, 2, set("context"))),
      fld("چه نتیجه‌ای دربارهٔ خودم گرفتم؟ (یک جمله)", area("knClaim", it.claim, 2, set("claim"), "مثلاً «این نشان می‌دهد من…»"), { hint: "این جمله در قدمِ ۰ سنجیده می‌شود — خودش یک ادعاست." }),
      fld("پیوند به یک موضوع (اختیاری)", A.topicSelect(kc.topic, function (v) { kc.topic = v; ch(); }, "knTopic"))));
    box.appendChild(h("section", { class: "card" },
      group("کدام جمله‌ها دربارهٔ این موقعیت درست است؟ (اختیاری)", h("div", { class: "kn-checks" }, STMT.map(function (s, i) {
        var id = "knSt_" + i;
        return h("label", { class: "kn-check", for: id }, h("input", { type: "checkbox", id: id, "data-st": s[0], checked: it.stmts.indexOf(s[0]) >= 0, onchange: function (e) {
          it.stmts = it.stmts.filter(function (x) { return x !== s[0]; }); if (e.target.checked) it.stmts.push(s[0]); ch();
        } }), h("span", {}, s[1]));
      })), { hint: "این‌ها نشانه‌های جدولِ خانواده‌ها هستند؛ فقط آن‌هایی را بزن که واقعاً درست است. رتبه‌بندی از همین‌ها و از پاسخِ آزمون‌ها ساخته می‌شود." })));
    return box;
  }

  /* ---------- قدمِ ۰: آیا اصلاً گره است؟ ---------- */
  function factoryBtn(H, label) {
    var kc = H.kc, cs = kc.premise.ecase && S.get(kc.premise.ecase);
    if (cs) return h("button", { class: "btn ghost kn-epi", onclick: function () { A.go("e_case", cs.id); } }, "🏭 پروندهٔ کارخانهٔ این برداشت را باز کن");
    return h("button", { class: "btn kn-epi", onclick: function () {
      var claim = String(kc.intake.claim || "").trim();
      if (!claim) { A.toast("اول در «ثبت» جملهٔ «چه نتیجه‌ای دربارهٔ خودم گرفتم؟» را بنویس.", "bad"); return; }
      var c = A.newCase({ title: claim.length > 70 ? claim.slice(0, 68) + "…" : claim, input: claim, src: { type: "kcase", id: kc.id } });
      kc.premise.ecase = c.id; H.put(); A.go("e_case", c.id);
    } }, label || "🏭 این برداشت را در کارخانه بسنج");
  }
  function premiseStep(H) {
    var kc = H.kc, it = kc.intake, pr = kc.premise, iv = intakeOf(kc);
    var box = h("div", { class: "col gap" });
    function set(k) { return function (v) { pr[k] = v; H.soon(); }; }
    if (A.knotEmoStreak()) box.appendChild(emoCard());
    box.appendChild(h("section", { class: "card soft" }, h("p", {}, "پیش از گره‌یابی، خودِ مقدمه را بسنج: شاید اصلاً گره‌ای نباشد — یک‌بار و اتفاقی بوده، یا معیارِ «درست» خودش محلِ پرسش است."),
      it.claim ? h("p", {}, h("b", {}, "جملهٔ تو: "), h("q", {}, it.claim)) : h("p", { class: "small muted" }, "جملهٔ «چه نتیجه‌ای دربارهٔ خودم گرفتم؟» را ننوشته‌ای.")));
    var freqTxt = { once: "یک‌بار", some: "گاهی", often: "مرتب" }[it.freq] || "نگفته‌ای";
    var slip = it.freq === "once" && (GE(it, "pressure", 7) || GE(it, "fatigue", 7));
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "۱) یک‌بار بوده یا تکراری؟"),
      h("p", {}, "گفته‌ای: ", h("b", {}, freqTxt), "."),
      slip ? h("p", { class: "warnline" }, "یک‌بار بوده و فشار یا خستگی بالا بوده ⇒ احتمالِ «لغزش» بیشتر از گره است.") : null));
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "۲) دیگران هم در همین مورد معمولاً همین‌طورند؟ (نرخِ پایه)"),
      radios("knBase", pr.base, [["same", "بله، معمولاً همین‌طورند"], ["diff", "نه، بیشترِ دیگران نه"], ["unk", "نمی‌دانم"]], function (v) { pr.base = v; H.soon(); })));
    var notes = [];
    /* مثال فقط از خودِ موقعیتِ کاربر یا خنثی (بازبینیِ اجرا v04، ۲۰۲۶-۱۰-۱۵: در موقعیتِ «ترس از بیکاری»، قدمِ ۰ مثالِ «نگاه‌کردن به ناخن» را
       طوری نشان داد که انگار دربارهٔ خودِ اوست). مثالِ ناخن فقط وقتی موقعیتِ خودش دربارهٔ ناخن است؛ وگرنه جملهٔ کلی، بی مثالِ دیگری. */
    var mine = JSON.stringify(kc.intake || {}) + " " + (kc.title || ""), nail = /ناخن/.test(mine);
    if (K(iv, "behavior")) notes.push(h("p", { class: "small kn-exnote" }, nail ? "«راهِ درست/بهتر» واقعاً بهتر است یا فقط متفاوت؟ در نگاه‌کردن به ناخن (همان موقعیتِ تو)، هر دو روش متداول‌اند و «ساده‌تر» بودنِ خم‌کردنِ انگشت فرض است، نه واقعیت. " +
      "«راحتیِ وضعیتِ پایانی» (Rosenbaum et al. 1990) دربارهٔ گرفتنِ یک شیء برای کارِ بعدی است؛ برای دیدنِ ناخن فقط قیاسی حدسی است، نه شاهد (خانوادهٔ ۶)."
      : "«راهِ درست/بهتر» در موقعیتِ تو واقعاً بهتر است یا فقط متفاوت؟ وقتی دو روشِ متداول هست، «ساده‌تر» یا «درست‌تر» بودنِ یکی فرض است تا شاهدی بیاید (خانوادهٔ ۶)."));
    if (KFM.F11.signals.some(function (s) { return s.test(iv); })) notes.push(h("p", { class: "small kn-exnote" }, "«آزمون»‌های عامه‌پسند" + (nail ? " (مثلِ همان «آزمونِ ناخن»)" : "") + " معمولاً هیچ اعتبارسنجی ندارند و از یک مورد قاعده می‌سازند — خانوادهٔ ۱۱. جملهٔ نتیجه را در کارخانه بسنج."));
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "۳) «راهِ درست/بهتر» واقعاً بهتر است یا فقط متفاوت؟"), notes,
      radios("knBetter", pr.better, [["better", "واقعاً بهتر است (شاهد دارم)"], ["diff", "فقط متفاوت است"], ["unk", "نمی‌دانم"]], function (v) { pr.better = v; H.soon(); })));
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "۴) معیارِ «موفقیت» در این موقعیت چه بود و چه کسی تعیینش کرد؟"),
      area("knCrit", pr.crit, 2, set("crit"))));
    var sugg = it.claim && (RE_INFER.test(CL(it)) || RE_SELF.test(CL(it)) || RE_ALWAYS.test(CL(it)));
    box.appendChild(h("section", { class: "card" + (sugg ? " kn-sugg" : "") }, h("h3", {}, "کارخانهٔ معرفت‌شناسی"),
      h("p", { class: "small" }, sugg ? "پیشنهاد: جملهٔ نتیجه‌ات دربارهٔ خودت یک ادعای کلی است؛ کارخانه برای سنجیدنِ اعتبارِ همین ادعاهاست." : "اگر جملهٔ نتیجه‌ات ادعایی دربارهٔ خودت یا دیگران است، می‌توانی اعتبارش را در کارخانه بسنجی."),
      factoryBtn(H)));
    var noteBox = h("div", { class: "col gap" + (pr.verdict === "no" ? "" : " hidden") },
      fld("یادداشتِ بستن", area("knCloseNote", pr.notes, 2, set("notes"), "چرا احتمالاً گره نیست؟")),
      h("div", { class: "row gap wrap" },
        h("button", { class: "btn sm", onclick: function () { kc.status = "closed"; kc.closedAt = now(); H.put(); A.toast("موقعیت با یادداشت بسته شد."); A.go("kcases"); } }, "موقعیت را با همین یادداشت ببند"),
        h("span", { class: "small muted" }, "یا با «قدمِ بعد» به هر حال ادامه بده.")));
    box.appendChild(h("section", { class: "card", "data-k": "verdict" }, h("h3", {}, "نتیجهٔ قدمِ ۰ ", h("span", { class: "reqmark" }, "*")),
      radios("knVerdict", pr.verdict, [["no", "احتمالاً گره نیست"], ["maybe", "شاید"], ["yes", "احتمالاً هست"]], function (v) {
        pr.verdict = v; if (kc.status === "closed" && v !== "no") { kc.status = "open"; kc.closedAt = null; } noteBox.classList.toggle("hidden", v !== "no"); H.put();
      }, true), h("p", { class: "small muted" }, "هر سه گزینه اجازهٔ ادامه می‌دهند."), noteBox));
    return box;
  }

  /* ---------- قدمِ ۱: همهٔ ۱۲ خانواده ---------- */
  function hindsight(kc) {
    return kc.intake.lag === "days" || kc.intake.lag === "weeks" ? h("p", { class: "card soft warnline small kn-hind" }, "⚠ بیش از ۲۴ ساعت پس از رخداد نوشته‌ای: حافظه با دانستنِ نتیجه بازنویسی می‌شود و چیزها «از اول معلوم» به نظر می‌رسند (سوگیریِ پس‌نگری، Fischhoff 1975). به شاهدهای مقایسهٔ عملکرد بیشتر از یادآوری تکیه کن.") : null;
  }
  function famBody(kc, r, F) {
    var hy = kc.hyps.filter(function (x) { return x.fam === F.id; });
    return h("div", { class: "kn-fb" },
      h("p", { class: "small" }, F.blurb),
      h("div", { class: "kn-why" }, h("b", { class: "small" }, "چرا این‌جاست؟"),
        r.why.length ? h("ul", { class: "small" }, r.why.map(function (w) { return h("li", {}, w); })) : h("p", { class: "small muted" }, "هنوز نه شاهدی دارد و نه پاسخی که ردش کند؛ چون همهٔ خانواده‌ها همیشه بررسی می‌شوند این‌جاست.")),
      h("details", { class: "kn-subs" }, h("summary", { class: "small" }, "زیرنوع‌ها و منبع‌ها (" + fa(F.subs.length) + ")"),
        h("ul", { class: "small" }, F.subs.map(function (s) { return h("li", {}, s.fa, s.src ? h("span", { class: "muted", dir: "auto" }, " — " + s.src) : null); }))),
      hy.length ? h("div", { class: "small" }, h("b", {}, "فرضیه‌های فرعیِ پذیرفته‌شده:"), h("ul", {}, hy.map(function (x) { return h("li", {}, x.text, x.rival ? h("span", { class: "muted" }, " · رقیب: " + x.rival) : null, x.by === "ai" ? h("span", { class: "chip" }, "پیشنهادِ هوش مصنوعی") : null); }))) : null,
      h("p", { class: "small muted" }, fa(F.probes.length) + " آزمونِ تمایزدهنده در قدمِ ۲."));
  }
  function rankStep(H) {
    var kc = H.kc, rk = A.knotRank(kc);
    var box = h("div", { class: "col gap" });
    var hs = hindsight(kc); if (hs) box.appendChild(hs);
    box.appendChild(h("section", { class: "card soft" },
      h("div", { class: "row between wrap gap" }, h("h2", {}, "همهٔ ۱۲ خانواده"), h("span", { class: "pill kn-order" }, "ترتیبِ بررسی، نه احتمال")),
      h("p", { class: "small" }, "هیچ عددِ قراردادی‌ای در کار نیست. هر خانواده یکی از سه وضع را دارد: «شاهد دارد» (حرف یا پاسخِ خودت که همین خانواده پیش‌بینی‌اش می‌کند)، «هنوز معلوم نیست»، یا «کنار رفت» (فقط وقتی پاسخی با **همهٔ** تبیین‌های فرعیِ آن تناقض داشت — اصلِ امتناعِ تناقض؛ ردِ یک تبیینِ فرعی خانواده را کنار نمی‌گذارد). نشانه‌ای که برای چند خانواده یکسان است «زمینه» است، نه شاهد. ترتیب فقط برای بررسی است، نه داوری؛ هیچ خانواده‌ای حذف نمی‌شود و ریشه را در قدمِ ۳ خودت تأیید می‌کنی.")));
    box.appendChild(h("div", { class: "kn-ranks" }, rk.map(function (r, i) {
      var F = KFM[r.fam];
      return h("details", { class: "card kn-fam-card" + (i < 3 ? " top" : ""), open: i < 3, "data-fam": r.fam },
        h("summary", {}, h("span", { class: "kn-rn" }, fa(i + 1)), h("span", { class: "kn-fn" }, famName(r.fam)),
          h("span", { class: "pill kn-state " + (r.score > 0 ? "good" : r.score < 0 ? "bad" : "") }, r.stateFa + (r.n ? " · " + fa(r.n) + " شاهد" : "") + (r.conflict ? " · ⚠ ناسازگاری" : ""))),
        famBody(kc, r, F));
    })));
    /* پیشنهادِ اختیاریِ هوش مصنوعی: فقط فرضیهٔ فرعی و تبیینِ رقیب — رتبه را عوض نمی‌کند */
    var out = h("div", { class: "col gap kn-aiout" });
    var btn = h("button", { class: "btn ghost", onclick: function () {
      btn.disabled = true; btn.textContent = "در حالِ پرسیدن…";
      aiGate({ purpose: "پیشنهادِ فرضیهٔ فرعی و تبیینِ رقیب", system: SYS_HYP, people: kc.intake.people, attach: { recIds: [kc.id] }, build: function (priv) { return caseText(kc, priv, rk); },
        onResult: function (t, m) { showHyps(H, t, out, m); }, onDone: function () { btn.disabled = false; btn.textContent = "🤖 پیشنهادِ هوش مصنوعی: فرضیهٔ فرعی و تبیینِ رقیب"; } });
    } }, "🤖 پیشنهادِ هوش مصنوعی: فرضیهٔ فرعی و تبیینِ رقیب");
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "پیشنهادِ اختیاری"),
      h("p", { class: "small muted" }, "هوش مصنوعی فقط فرضیه‌های فرعی و تبیین‌های رقیب پیشنهاد می‌کند؛ رتبه را عوض نمی‌کند و چیزی خودکار افزوده نمی‌شود. هر پیشنهاد را خودت می‌پذیری یا رها می‌کنی. پیش از فرستادن، متن و حذفِ نام‌ها را می‌بینی."),
      btn, out));
    return box;
  }
  var SYS_HYP = "تو دستیارِ پیشنهاددهنده در ابزارِ «گره‌گشا» هستی، نه داور و نه درمانگر. کاربر یک موقعیت از زندگیِ خودش نوشته است. تشخیص با خودِ کاربر است. قواعدِ سخت:\n" +
    "۱) فقط فرضیهٔ فرعی (زیرنوع) در یکی از ۱۲ خانوادهٔ داده‌شده پیشنهاد بده و برای هر کدام یک تبیینِ رقیب و یک آزمونِ کوچکِ جداکننده.\n" +
    "۲) هیچ فرضیه‌ای دربارهٔ حالِ درونی، نیت، احساس یا انگیزهٔ شخصِ سوم ننویس؛ دربارهٔ دیگران فقط رفتارِ دیده‌شده یا ساختارِ موقعیت.\n" +
    "۳) هیچ تشخیصِ بالینی یا روان‌پزشکی (مثل ADHD، خوانش‌پریشی، افسردگی، هر «اختلال») و هیچ توصیهٔ درمانی؛ دربارهٔ خواب، گرسنگی، بیماری یا دارو فقط پرسش.\n" +
    "۴) ادعای علمیِ بی‌منبع نساز.\n" +
    "۵) خروجی فقط JSON: آرایه‌ای از حداکثر ۵ شیء {\"fam\":\"F1\"…\"F12\",\"sub\":\"نامِ زیرنوع\",\"text\":\"فرضیهٔ فرعی در یک جمله\",\"rival\":\"تبیینِ رقیب در یک جمله\",\"test\":\"آزمونِ جداکننده در یک جمله\"}. فارسی، بی‌تعارف.";
  function caseText(kc, priv, rk) {
    var it = kc.intake, L = [];
    L.push("نوعِ موقعیت: " + kc.kinds.map(function (k) { return KINDFA[k]; }).join("، "));
    [["what", "چه شد"], ["expected", "انتظار"], ["actual", "در واقع"], ["thoughts", "فکرها/کارها"], ["statement", "صورتِ مسئله"], ["stuckAt", "کجا گیر کرد"], ["context", "زمینه"], ["claim", "نتیجه‌ای که دربارهٔ خودش گرفت"]].forEach(function (f) { if (String(it[f[0]] || "").trim()) L.push(f[1] + ": " + it[f[0]]); });
    var prc = it.prac || {}; [["want", "مجهول (چه می‌خواهد)"], ["have", "داده‌ها"], ["cond", "قیدها"], ["vague", "مفهومِ مبهم"], ["ignore", "دادهٔ کنارگذاشته/حدِ جست‌وجو"], ["approx", "تقریبِ کافی"]].forEach(function (x) { if (String(prc[x[0]] || "").trim()) L.push(x[1] + ": " + prc[x[0]]); });
    L.push("فشارِ زمان: " + (it.pressure === "" || it.pressure == null ? "؟" : it.pressure) + "/10 · خستگی: " + (it.fatigue === "" || it.fatigue == null ? "؟" : it.fatigue) + "/10 · حضورِ دیگران: " + (it.others || "؟"));
    if (priv) L.push("احساس: " + (it.emoName || "؟") + " · شدت: " + (it.emo === "" || it.emo == null ? "؟" : it.emo) + "/10");
    L.push("جمله‌هایی که کاربر درست دانسته: " + (it.stmts || []).map(function (s) { var x = STMT.filter(function (y) { return y[0] === s; })[0]; return x ? x[1] : s; }).join(" · "));
    L.push("۱۲ خانواده (به ترتیبِ بررسیِ فعلی): " + (rk || A.knotRank(kc)).map(function (r) { return r.fam + " " + KFM[r.fam].fa; }).join(" | "));
    return L.join("\n");
  }
  function showHyps(H, t, out, meta) {
    var kc = H.kc, arr = parseJSON(t), dropped = 0;
    out.innerHTML = "";
    if (!Array.isArray(arr)) { out.appendChild(h("p", { class: "small bad" }, "پاسخِ هوش مصنوعی قالبِ درستی نداشت؛ چیزی افزوده نشد.")); return; }
    var ok = arr.filter(function (x) {
      if (A.knotHypOk(x, kc.intake.people || "", (meta && meta.names) || [])) return true;
      dropped++; return false;
    }).slice(0, 5);
    out.appendChild(h("p", { class: "small muted" }, "ساختهٔ هوش مصنوعی — وارسی‌نشده؛ فقط پیشنهاد." + (dropped ? " " + fa(dropped) + " پیشنهاد کنار گذاشته شد (قالبِ نادرست، اشارهٔ تشخیصی، یا فرضیه دربارهٔ حالِ درونیِ دیگران)." : "")));
    ok.forEach(function (x) {
      var added = kc.hyps.some(function (y) { return y.text === x.text; });
      // برچسبِ یکتا برای هر پیشنهاد (کارزارِ آزمون sc09/sc12: پنج دکمهٔ هم‌نام؛ دستیار نمی‌دانست کدام مالِ کدام خانواده است)
      var b = h("button", { class: "btn sm", disabled: added, "aria-label": "افزودن به فرضیه‌های " + x.fam + " " + ((KFM[x.fam] || {}).fa || "") + ": «" + String(x.text || "").slice(0, 50) + "»", onclick: function () {
        kc.hyps.push({ fam: x.fam, sub: String(x.sub || ""), text: String(x.text), rival: String(x.rival || ""), test: String(x.test || ""), by: "ai", at: now() }); H.put();
        b.disabled = true; b.textContent = "افزوده شد";
      } }, added ? "افزوده شده" : "افزودن به فرضیه‌های این خانواده");
      out.appendChild(h("div", { class: "card soft kn-hyp" }, famChip(x.fam), h("p", {}, x.text), x.rival ? h("p", { class: "small" }, h("b", {}, "تبیینِ رقیب: "), x.rival) : null,
        x.test ? h("p", { class: "small" }, h("b", {}, "آزمونِ جداکننده: "), x.test) : null, b));
    });
  }

  /* ---------- قدمِ ۲: آزمون‌ها، نردبان، هم‌ریخت، دفترِ شواهد ---------- */
  var LAD = [
    { n: 0, fa: "۲ تا ۵ دقیقهٔ دیگر بی‌هیچ راهنمایی تلاش کن.", tag: "پلهٔ کنترل" },
    { n: 1, fa: "صورت را دوباره و کلمه‌به‌کلمه بخوان.", fam: "F2", sub: "read" },
    { n: 2, fa: "مجهول چیست؟ داده‌ها چیست؟ شرط چیست؟ هدف و همهٔ قیدها را بازگو کن؛ کدام را خودت فرض کردی؟ همهٔ داده‌ها، کلِ شرط و همهٔ مفهوم‌های اساسیِ مسئله را به کار برده‌ای؟", fam: "F2", sub: "rep" },
    { n: 3, fa: "روی کاغذ شکل بکش یا جدول کن و نمادِ مناسب بگذار.", fam: "F5", sub: "wm" },
    { n: 4, gen: true, label: "راهنماییِ راهبرد (از پرسش‌های طرح‌ریزی: مسئلهٔ مرتبط ⇐ به مجهول نگاه کن ⇐ عنصرِ کمکی ⇐ خاص/کلی/مشابه ⇐ بخشی از شرط)", fam: "F3", sub: "heur" },
    { n: 5, gen: true, label: "نامِ مفهومِ کلیدی", fam: "F1" },
    { n: 6, gen: true, label: "گامِ کلیدی (بدونِ پاسخِ نهایی)", tag: "تشخیصی نیست" }
  ];
  A.KLADDER = LAD;
  function ladderEv(kc, n) {
    var L = LAD[n], at = now(), base = { src: "ladder", at: at };
    kc.ev = kc.ev.filter(function (e) { return e.src !== "ladder"; });
    if (n === 0) {
      kc.ev.push(Object.assign({ fam: "F4", dir: 1, sub: "stop", w: KW.control, kind: "control", text: "نردبان: با ۲ تا ۵ دقیقهٔ بیشترِ بی‌راهنما باز شد (شاید زود دست کشیده بودم)" }, base));
      kc.ev.push(Object.assign({ fam: "F5", dir: 1, sub: "", w: KW.control, kind: "control", text: "نردبان: با فقط زمانِ بیشتر باز شد (شاید فشار/بار)" }, base));
    } else if (L.fam) kc.ev.push(Object.assign({ fam: L.fam, dir: 1, sub: L.sub || "", w: KW.ladder, kind: "ladder", text: "نردبان: در پلهٔ " + fa(n) + " («" + (L.label || L.fa) + "») باز شد" }, base));
  }
  function ladderBox(H) {
    var kc = H.kc, it = kc.intake, L = kc.ladder;
    var sec = h("section", { class: "card kn-ladder" }, h("h3", {}, "نردبانِ راهنمایی"));
    if (it.seen === "yes") { sec.appendChild(h("p", { class: "small muted kn-ladoff" }, "خاموش: پاسخ را دیده‌ای، پس نردبان روی همین مسئله چیزی را تمایز نمی‌دهد. آزمون‌های مقایسه‌ای روی یک «هم‌ریخت» انجام می‌شوند.")); return sec; }
    sec.appendChild(h("p", { class: "small" }, "پس از هر پله دوباره تلاش کن و بگو «باز شد» یا «نشد». پله‌ای که در آن باز شد فقط شاهدِ ضعیف (+۱) است؛ پلهٔ ۰ کنترل است و پلهٔ ۶ تشخیصی نیست. قدرتِ تمایز در آزمون‌های مقایسه‌ایِ پایین‌تر است."));
    var cur = L.cur || 0, steps = L.steps || {};
    if (L.opened != null) {
      if (L.opened >= 0) sec.appendChild(backBox(H));
      sec.appendChild(h("p", { class: "kn-ladres" }, L.opened >= 0 ? "در پلهٔ " + fa(L.opened) + " باز شد" + (L.opened === 6 ? " — پلهٔ ۶ تشخیصی نیست؛ شاهدی ثبت نشد." : L.opened === 0 ? " — فقط با زمانِ بیشتر (پلهٔ کنترل)." : ".") : "تا پلهٔ ۶ هم باز نشد — شاهدی ثبت نشد؛ با آزمون‌ها ادامه بده."));
      sec.appendChild(h("button", { class: "btn ghost sm", onclick: function () { kc.ladder = {}; kc.ev = kc.ev.filter(function (e) { return e.src !== "ladder"; }); H.put(); redraw(); } }, "از نو"));
      return sec;
    }
    sec.appendChild(h("ol", { class: "kn-lad", start: "0" }, LAD.map(function (s) {
      var t = s.gen ? steps[s.n] : s.fa;
      return h("li", { class: s.n < cur ? "past" : s.n === cur ? "now" : "next" }, h("b", {}, "پلهٔ " + fa(s.n) + (s.tag ? " (" + s.tag + ")" : "") + ": "),
        s.n <= cur ? (t || h("span", { class: "muted" }, s.label + " — هنوز نوشته نشده")) : h("span", { class: "muted" }, s.gen ? s.label : "…"));
    })));
    if (cur === 4) sec.appendChild(planBox(H));
    var S0 = LAD[cur];
    if (S0.gen && !steps[cur]) {
      var ins = {}; var gen = h("div", { class: "col gap" });
      [4, 5, 6].forEach(function (n) { ins[n] = txt("knLad" + n, steps[n] || "", function () { }, LAD[n].label); gen.appendChild(fld("پلهٔ " + fa(n) + ": " + LAD[n].label, ins[n])); });
      var save = h("button", { class: "btn sm", onclick: function () {
        var vals = [4, 5, 6].map(function (n) { return ins[n].value.trim(); });
        if (vals.some(function (v) { return !v; })) { A.toast("هر سه پله را بنویس.", "bad"); return; }
        if (A.knotLeaks(it.answer, vals).length) { A.toast("پله‌ای پاسخِ نهایی را دارد؛ آن را بی‌پاسخ بنویس.", "bad"); return; }
        /* منشأ (ممیزی ۲۰۲۶-۱۰-۱۳): اگر پله‌ها همان پیشنهادِ هوش مصنوعی‌اند (یا ویرایشِ آن)، «ai»/«ai+user» ثبت می‌شود نه «user» */
        var g = A._knotLadAI && A._knotLadAI[kc.id], same = g && [0, 1, 2].every(function (i) { return g[i] === vals[i]; });
        L.steps = { 4: vals[0], 5: vals[1], 6: vals[2] }; L.by = g ? (same ? "ai" : "ai+user") : "user"; L.at = now(); L.cur = cur; kc.ladder = L; H.put(); redraw();
      } }, "ذخیرهٔ پله‌ها");
      var aib = h("button", { class: "btn ghost sm", onclick: function () {
        if (!String(it.statement || "").trim()) { A.toast("برای ساختنِ پله‌ها «صورتِ کامل» ِ مسئله لازم است.", "bad"); return; }
        /* مسئلهٔ حل‌نشده (پاسخ را نمی‌دانی — کارزارِ آزمونِ دوم c01: نردبان می‌ایستاد): هوش مصنوعی پاسخ را **پنهان** حل می‌کند، یک حل‌کنندهٔ
           مستقلِ دوم باید به همان برسد، و همان پاسخِ پنهان برای کنترلِ نشت به کار می‌رود — هرگز به تو نشان داده نمی‌شود تا خودت برسی */
        var known = !!String(it.answer || "").trim();
        aib.disabled = true;
        aiGate({ purpose: known ? "ساختنِ پله‌های ۴ تا ۶ ِ نردبان" : "ساختنِ پله‌های ۴ تا ۶ برای مسئلهٔ حل‌نشده (پاسخ پنهان می‌ماند)", system: known ? SYS_LAD : SYS_LAD_HID, people: it.people, noPriv: true, attach: { recIds: [kc.id] },
          maskPreview: it.seen === "yes" ? null : function (t) { var a = String(it.answer || ""); return a ? t.split(a).join("•••• (پاسخ — این‌جا پنهان، چون هنوز ندیده‌ای؛ فقط برای این‌که هوش مصنوعی آن را لو ندهد فرستاده می‌شود)") : t; },
          more: "پس از ساخت، یک درخواستِ دومِ مستقل فقط با خودِ سه پله (بی صورتِ مسئله، بی پاسخ و بی تصویرِ پیوست) فرستاده می‌شود تا ببیند آیا پاسخِ نهایی از خودِ پله‌ها درمی‌آید؛ اگر درآمد، پله‌ها کنار می‌روند.",
          build: function () { return "صورتِ مسئله: " + it.statement + (known ? "\nپاسخِ درست (فقط برای این‌که لو نرود): " + it.answer : "") + (it.stuckAt ? "\nکجا گیر کرده: " + it.stuckAt : ""); },
          onResult: function (t, m) {
            var o = parseJSON(t); var v = o && [o.s4, o.s5, o.s6].map(function (x) { return String(x || "").trim(); });
            if (!v || v.some(function (x) { return !x; })) { A.toast("پاسخِ هوش مصنوعی قالبِ درستی نداشت.", "bad"); return; }
            var ansRef = known ? it.answer : String((o && o.answer) || "").trim();
            if (!known) {
              if (!ansRef) { A.toast("هوش مصنوعی پاسخِ پنهانی نداد؛ پله‌ها ساخته نشد.", "bad"); return; }
              var nrm = function (x) { return String(x || "").replace(/[۰-۹]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); }).replace(/[\s«»"'.,،]/g, "").toLowerCase(); };
              return Promise.resolve(A.callAI(SYS_SOLVE_IND, "صورتِ مسئله: " + (m && m.names && m.names.length ? A.kRedact(it.statement, m.names) : it.statement))).then(function (t3) {
                var r3 = parseJSON(t3), a2 = r3 && r3.answer != null ? String(r3.answer).trim() : "";
                // پاسخِ غیرعددی (شکل، راهبرد — کارزارِ آزمونِ دوم c16: معمای نُه نقطه) با برابریِ رشته‌ای جور نمی‌شود ⇒ داورِ سوم فقط «یکی‌اند؟» را می‌سنجد
                var same = !!a2 && nrm(a2) === nrm(ansRef);
                return (same || !a2 ? Promise.resolve(same) : Promise.resolve(A.callAI(SYS_SAME, "پاسخِ الف: " + ansRef + "\nپاسخِ ب: " + a2)).then(function (t4) { var r4 = parseJSON(t4); return !!(r4 && r4.same === true); }, function () { return false; })).then(function (ok) {
                if (!ok) { A.toast("دو حلِ مستقلِ پنهان به یک پاسخ نرسیدند؛ پله‌ها ساخته نشد (پاسخِ نامطمئن راهنمای نادرست می‌سازد). دوباره بخواه یا دستی بنویس.", "bad"); return; }
                it.aiAnswer = ansRef; it.aiAnswerBy = "ai×2"; it.aiAnswerAt = now(); H.put();
                return finish();
                });
              });
            }
            return finish();
            function finish() {
            var bad = A.knotLeaks(ansRef, v);
            if (bad.length) { A.toast("پله‌های ساخته‌شده پاسخ را لو می‌دادند (پلهٔ " + bad.map(function (i) { return fa(i + 4); }).join("، ") + ")؛ کنار گذاشته شد. دستی بنویس یا دوباره بخواه.", "bad"); return; }
            /* §۱۲.۵-د + ممیزی: نشتِ غیرمتنی (مثلاً «۶ × ۷» یا «۳۰ + ۱۲») با کنترلِ رشته‌ای دیده نمی‌شود ⇒ یک حل‌کنندهٔ مستقل
               فقط از روی خودِ پله‌ها پاسخِ نهایی را درمی‌آورد؛ اگر درآورد، پله‌ها کنار می‌روند. */
            var hint = "سه راهنمایی برای یک مسئلهٔ پنهان:\n۴) " + v[0] + "\n۵) " + v[1] + "\n۶) " + v[2];
            if (m && m.names && m.names.length) hint = A.kRedact(hint, m.names);
            return Promise.resolve(A.callAI(SYS_LADCHK, hint)).then(function (t2) {
              var r = parseJSON(t2), got = r && r.answer != null ? String(r.answer).trim() : "";
              if (got && got !== "null" && A.knotLeaks(ansRef, [got]).length) {
                A.toast("یک حل‌کنندهٔ مستقل از خودِ این پله‌ها (بی صورتِ مسئله) به پاسخِ نهایی رسید؛ پله‌ها کنار گذاشته شد. دستی بنویس یا دوباره بخواه.", "bad"); return;
              }
              [4, 5, 6].forEach(function (n, i) { ins[n].value = v[i]; });
              A._knotLadAI = A._knotLadAI || {}; A._knotLadAI[kc.id] = v.slice();
              A.toast("پله‌ها در خانه‌ها گذاشته شد — بخوان، اگر لازم است اصلاح کن و «ذخیره» بزن (ساختهٔ هوش مصنوعی؛ وارسی‌شده برای نشتِ متنی و با یک حل‌کنندهٔ مستقل که از خودِ پله‌ها به پاسخ نرسید — درستیِ راهنمایی وارسی نشده).");
            }, function () {
              A.toast("وارسیِ دوم (آیا پاسخ از خودِ پله‌ها درمی‌آید؟) انجام نشد؛ پله‌ها گذاشته نشد. دوباره بخواه یا دستی بنویس.", "bad");
            });
            }
          }, onDone: function () { aib.disabled = false; } });
      } }, "🤖 بساز با هوش مصنوعی");
      // پیش از نوشته‌شدنِ پله‌ها هم «خودم حل کردم» ثبت‌شدنی است (کارزارِ آزمونِ دوم c16: «باز شد» نبود چون پلهٔ ۴ متن نداشت)
      sec.appendChild(h("button", { class: "btn sm kn-lad-open", onclick: function () { var o = Math.max(0, cur - 1); L.opened = o; L.late = true; L.cur = cur; kc.ladder = L; ladderEv(kc, o); H.put(); redraw(); } }, "خودم حل کردم (پس از پلهٔ " + fa(Math.max(0, cur - 1)) + ")"));
      sec.appendChild(h("div", { class: "card soft col gap" }, h("p", { class: "small" }, "پله‌های ۴ تا ۶ از متنِ همین مسئله ساخته می‌شوند: دستی بنویس، یا هوش مصنوعی بسازد (هیچ پله‌ای نباید پاسخِ نهایی را داشته باشد — بررسی می‌شود)."), gen, h("div", { class: "row gap wrap" }, save, aib)));
      return sec;
    }
    sec.appendChild(h("div", { class: "row gap wrap" },
      h("button", { class: "btn sm kn-lad-open", onclick: function () { L.opened = cur; L.cur = cur; kc.ladder = L; ladderEv(kc, cur); H.put(); redraw(); } }, "باز شد"),
      h("button", { class: "btn ghost sm kn-lad-next", onclick: function () { if (cur >= 6) { L.opened = -1; } else L.cur = cur + 1; kc.ladder = L; H.put(); redraw(); } }, cur >= 6 ? "باز نشد (پایانِ نردبان)" : "باز نشد ⇐ پلهٔ بعد")));
    return sec;
  }
  /* پلهٔ ۴: پرسش‌های طرح‌ریزی به ترتیبِ فهرست (A.PLAN_QS ِ ثبت‌گاهِ حرکت‌ها، a19) — یکی‌یکی، با «پرسشِ بعدی»؛ جای پرسش در kc.ladder.pq.
     پس از «باز شد»: یک پرسشِ بازنگری (A.BACK_QS) با پاسخِ کوتاهِ خودت (kc.ladder.back) — بازنگری بی‌درنگ پس از حل معنا دارد. */
  function planBox(H) {
    var kc = H.kc, L = kc.ladder = kc.ladder || {}, Q = A.PLAN_QS || [];
    if (!Q.length) return h("span", {});
    var i = (L.pq || 0) % Q.length, q = Q[i];
    return h("div", { class: "card soft kn-planq", dir: "rtl" }, h("div", { class: "small muted" }, "پرسشِ طرح‌ریزی " + fa(i + 1) + " از " + fa(Q.length) + " — پیش از راهنماییِ اختصاصیِ پلهٔ ۴ از خودت بپرس:"),
      h("p", { class: "kn-planq-t" }, q.t), q.mv && q.mv.length && A.moveLink ? h("div", { class: "row gap wrap small" }, q.mv.map(function (m) { return A.moveLink(m); })) : null,
      h("button", { class: "btn ghost sm kn-planq-next", type: "button", onclick: function () { L.pq = (i + 1) % Q.length; kc.ladder = L; H.put(); redraw(); } }, "پرسشِ بعدی"));
  }
  function backBox(H) {
    var kc = H.kc, L = kc.ladder || {}, Q = A.BACK_QS || [];
    if (!Q.length) return h("span", {});
    var b = L.back || {}, q = b.q || Q[(String(kc.id).length + (L.opened || 0)) % Q.length];
    var ta = area("knBack", b.a || "", 2, function (v) { L.back = { q: q, a: v, at: now() }; kc.ladder = L; H.soon(); }, "پاسخِ کوتاهِ خودت");
    return h("div", { class: "card soft kn-back", dir: "rtl" }, h("div", { class: "small muted" }, "بازنگری — حالا که باز شد:"), h("p", { class: "kn-back-q" }, q), fld("پاسخِ بازنگری", ta));
  }
  var SYS_LAD_HID = "تو سازندهٔ راهنمایی‌های پله‌ای برای مسئله‌ای هستی که کاربر پاسخش را نمی‌داند. اول خودت مسئله را دقیق و گام‌به‌گام (در ذهن) حل کن؛ پاسخ فقط در فیلدِ answer می‌آید و **هرگز** به کاربر نشان داده نمی‌شود. راهنمایی‌ها هرگز پاسخِ نهایی، عددِ پاسخ یا عبارتِ پاسخ را ندارند. فقط JSON: {\"answer\":\"پاسخِ نهایی (کوتاه)\",\"s4\":\"یک راهنماییِ راهبرد بی‌آن‌که راه را کامل کند\",\"s5\":\"فقط نامِ مفهوم یا بازنماییِ کلیدی\",\"s6\":\"نخستین گامِ راه، نه بیشتر\"}";
  var SYS_SAME = "دو پاسخ به یک مسئلهٔ پنهان می‌بینی. فقط بگو آیا هر دو **همان راه‌حل یا همان پاسخ**اند (با بیانِ متفاوت)، نه این‌که کدام درست است. فقط JSON: {\"same\":true|false}";
  var SYS_SOLVE_IND = "این مسئله را مستقل، دقیق و گام‌به‌گام حل کن. فقط JSON: {\"answer\":\"پاسخِ نهایی کوتاه\"}";
  var SYS_LAD = "تو سازندهٔ راهنمایی‌های پله‌ای برای یک مسئله هستی. هرگز پاسخِ نهایی، عددِ پاسخ یا عبارتِ پاسخ را ننویس. خروجی فقط JSON: {\"s4\":\"یک راهنماییِ راهبرد (از آخر/حالتِ خاص/قرینه) بی‌آن‌که راه را کامل کند\",\"s5\":\"فقط نامِ مفهومِ کلیدی\",\"s6\":\"گامِ کلیدی بدونِ پاسخِ نهایی\"}. فارسی، کوتاه.";
  var SYS_LADCHK = "تو حل‌کننده‌ای هستی که فقط سه «راهنمایی» از یک مسئلهٔ پنهان را می‌بینی، نه خودِ مسئله را. بگو آیا پاسخِ نهاییِ مسئله را فقط از روی همین راهنمایی‌ها می‌شود دقیق به دست آورد. اگر می‌شود، آن را بنویس؛ اگر نمی‌شود، null. خروجی فقط JSON: {\"answer\": \"…\" | null}.";
  A.KSYS_LADCHK = SYS_LADCHK;
  var SYS_ISO ="تو سازندهٔ «هم‌ریخت» هستی: مسئله‌ای با همان ساختارِ عمیق و همان گامِ کلیدی، اما با ظاهر، زمینه و عددهای کاملاً متفاوت. پاسخِ مسئلهٔ اصلی را تکرار نکن و هیچ‌کدام از عددها یا جمله‌های مسئلهٔ اصلی را در صورت نیاور (اگر دنباله است، دنبالهٔ دیگری با همان قاعده؛ اگر داستان است، داستانِ دیگری). پاسخِ هم‌ریخت اگر ممکن است یک عددِ صحیح با رقمِ لاتین باشد. خروجی فقط JSON: {\"problem\":\"صورتِ کاملِ هم‌ریخت\",\"answer\":\"پاسخِ هم‌ریخت\"}. فارسی.";
  function isoBox(H) {
    var kc = H.kc, it = kc.intake, iso = kc.iso;
    var sec = h("section", { class: "card kn-iso" }, h("h3", {}, "هم‌ریخت (همان ساختار، ظاهرِ نو)"),
      h("p", { class: "small" }, it.seen === "yes" ? "پاسخ را دیده‌ای؛ آزمون‌های مقایسه‌ای و «بی‌فشار دوباره حل کن» روی یک هم‌ریخت انجام می‌شوند." : "قفل با نردبان باز شده؛ آزمون‌های مقایسه‌ای را روی یک هم‌ریخت انجام بده."));
    var t = area("knIso", iso && iso.by === "user" ? iso.text : "", 3, function (v) { kc.iso = v.trim() ? { text: v, by: "user", at: now() } : null; H.soon(); }, "هم‌ریخت را خودت بنویس…");
    if (iso && iso.by === "ai") sec.appendChild(h("div", { class: "card soft" }, iso.verified ? h("span", { class: "chip good" }, "ساختهٔ هوش مصنوعی — وارسی‌شده ۳ از ۳") : h("span", { class: "chip" }, "ساختهٔ هوش مصنوعی — وارسی‌نشده"), h("p", {}, iso.text),
      iso.answer ? h("details", {}, h("summary", { class: "small" }, "پاسخِ هم‌ریخت (پس از تلاش)"), h("p", { class: "small" }, iso.answer)) : null,
      h("button", { class: "btn ghost sm", onclick: function () { kc.iso = null; H.put(); redraw(); } }, "کنار بگذار")));
    else sec.appendChild(fld("هم‌ریختِ خودت", t));
    var out = h("div", {});
    var aib = h("button", { class: "btn ghost sm", onclick: function () {
      if (!String(it.statement || "").trim()) { A.toast("برای ساختنِ هم‌ریخت «صورتِ کامل» لازم است.", "bad"); return; }
      aib.disabled = true;
      aiGate({ purpose: "ساختنِ یک هم‌ریخت", system: SYS_ISO, people: it.people, noPriv: true, attach: { recIds: [kc.id] },
        build: function () { return "مسئلهٔ اصلی: " + it.statement + (it.answer ? "\nپاسخِ اصلی (تکرار نشود): " + it.answer : ""); },
        onResult: function (t2, m) {
          /* اجرای واقعی (۲۰۲۶-۱۰-۱۳): مدل گاهی همان دنباله/عددهای مسئلهٔ اصلی را تکرار می‌کرد ⇒ نشت ⇒ رد. یک تلاشِ دوبارهٔ خودکار،
             و پاسخِ عددیِ هم‌ریخت با همان سه حلِ مستقلِ گره‌گشا (A.kverify) وارسی می‌شود — خواستهٔ مالک: «با جوابِ غلط تمرین نکنم». */
          function bad(o) {
            if (!o || !String(o.problem || "").trim()) return "پاسخِ هوش مصنوعی قالبِ درستی نداشت.";
            if (it.answer && A.knotLeaks(it.answer, [o.problem]).length) return "هم‌ریخت پاسخِ مسئلهٔ اصلی را در خودش داشت؛ کنار گذاشته شد.";
            if (A.kNearCopy && A.kNearCopy(o.problem, it.statement)) return "هم‌ریخت تقریباً همان مسئلهٔ اصلی بود؛ کنار گذاشته شد.";
            return null;
          }
          var o = parseJSON(t2), why = bad(o), sys = SYS_ISO, ask = "مسئلهٔ اصلی: " + it.statement + (it.answer ? "\nپاسخِ اصلی (تکرار نشود): " + it.answer : "");
          if (m && m.names && m.names.length && A.kRedact) ask = A.kRedact(ask, m.names);
          var first = why ? Promise.resolve(A.callAI(sys, ask + "\n(تلاشِ قبلی پذیرفته نشد: " + why + " عددها و جمله‌های مسئلهٔ اصلی را به کار نبر.)")).then(function (t3) { var o2 = parseJSON(t3); var w2 = bad(o2); if (w2) throw new Error(w2); return o2; }) : Promise.resolve(o);
          return first.then(function (ok) {
            var ans = String(ok.answer || "").trim(), latin = ans.replace(/[۰-۹]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); });
            var check = /^-?\d+$/.test(latin) && A.kverify ? A.kverify({ principle: "همان ساختارِ عمیقِ این مسئلهٔ اصلی: " + it.statement }, { prompt: String(ok.problem), atype: "int", answer: latin, decoy: false }, function (x) { return m && m.names && m.names.length && A.kRedact ? A.kRedact(x, m.names) : x; }) : Promise.resolve(null);
            return check.then(function (ver) {
              out.innerHTML = "";
              var chip = ver ? (ver.ok ? h("span", { class: "chip good" }, "ساختهٔ هوش مصنوعی — وارسی‌شده ۳ از ۳") : h("span", { class: "chip bad" }, "وارسی‌نشده — " + ver.why)) : h("span", { class: "chip" }, "ساختهٔ هوش مصنوعی — وارسی‌نشده (پاسخِ عددی ندارد)");
              out.appendChild(h("div", { class: "card soft kn-isoai" }, chip, h("p", {}, ok.problem),
                h("button", { class: "btn sm", onclick: function () { kc.iso = { text: String(ok.problem), answer: ans, by: "ai", at: now(), verified: !!(ver && ver.ok), ver: ver || null }; H.put(); redraw(); } }, "همین را بپذیر")));
            });
          }, function (e) { out.innerHTML = ""; A.toast((e && e.message) || why || "ساخته نشد", "bad"); });
        }, onDone: function () { aib.disabled = false; } });
    } }, "🤖 هم‌ریخت بساز");
    sec.appendChild(h("div", { class: "row gap wrap" }, aib)); sec.appendChild(out);
    return sec;
  }
  function probeBox(H, F, p) {
    var kc = H.kc, ans = kc.pans[p.id] || {}, iv = intakeOf(kc);
    var wrap = h("div", { class: "kn-probe", "data-probe": p.id }, h("div", { class: "row gap wrap" }, h("b", {}, p.fa), kchip(p.kind)), h("p", { class: "small" }, p.ask));
    if (p.need === "problem" && !K(iv, "problem")) { wrap.appendChild(h("p", { class: "small muted" }, "فقط برای موقعیت‌های «مسئله».")); wrap.classList.add("na"); return wrap; }
    if (p.iso && seenIso(kc) && !(kc.iso && String(kc.iso.text || "").trim())) { wrap.appendChild(h("p", { class: "small warnline kn-neediso" }, "اول یک هم‌ریخت ثبت کن (بالای همین صفحه) — این آزمون روی خودِ مسئله دیگر چیزی را جدا نمی‌کند.")); wrap.classList.add("na"); return wrap; }
    if (p.note) wrap.appendChild(h("p", { class: "small muted" }, p.note));
    function record(v, optFa) {
      var a = { v: v, at: now() }; if (ans.txt) a.txt = ans.txt; if (p.nums) p.nums.forEach(function (n) { a[n[0]] = ans[n[0]]; });
      kc.pans[p.id] = a;
      var evs = p.scoreFrom(a);
      kc.ev = kc.ev.filter(function (e) { return e.src !== "probe:" + p.id; }).concat(evs.map(function (e) {
        return { fam: e.fam, dir: e.dir, sub: e.sub || "", w: KW[p.kind], kind: p.kind, text: p.fa + " — " + optFa, src: "probe:" + p.id, at: a.at };
      }));
      H.put(); redraw();
    }
    if (p.input) wrap.appendChild(txt("knPi_" + p.id, ans.txt, function (v) { ans.txt = v; if (kc.pans[p.id]) { kc.pans[p.id].txt = v; H.soon(); } }, p.input));
    if (p.nums) {
      var ins = p.nums.map(function (n) { return h("label", { class: "kn-num" }, h("span", { class: "small" }, n[1]), h("input", { type: "number", min: "0", id: "knPn_" + p.id + "_" + n[0], value: ans[n[0]] == null ? "" : ans[n[0]], oninput: function (e) { ans[n[0]] = e.target.value; } })); });
      wrap.appendChild(h("div", { class: "row gap wrap" }, ins, h("button", { class: "btn sm", onclick: function () {
        var evs = p.scoreFrom(ans); if (!evs.length) { A.toast("هر دو عدد را بنویس (پیش‌بینی بزرگ‌تر از صفر).", "bad"); return; }
        record("nums", "پیش‌بینی " + fa(ans.pred) + "، واقعی " + fa(ans.real) + (evs[0].dir > 0 ? " (بیش از ۲۵٪ دیرتر)" : " (نزدیک به پیش‌بینی)"));
      } }, "ثبت")));
    } else wrap.appendChild(h("div", { class: "kn-opts", role: "group", "aria-label": p.fa, "data-own": "1" }, p.opts.map(function (o) {
      var on = kc.pans[p.id] && kc.pans[p.id].v === o.v;
      return h("button", { type: "button", class: "btn sm" + (on ? "" : " ghost") + " kn-opt", "aria-pressed": on ? "true" : "false", onclick: function () { if (!on) record(o.v, o.fa); } }, o.fa);
    })));
    /* اثرِ پاسخ، با دلیل (کارزارِ سوم v05: «F10 با دو پاسخِ علیه کنار نرفت و هیچ‌جا نگفت چرا») */
    if (kc.pans[p.id]) {
      var F0 = KFM[F.id], eff = p.scoreFrom(kc.pans[p.id]).map(function (e) {
        var Fx = KFM[e.fam] || F0, nm = function (id) { var x = Fx.subs.filter(function (y) { return y.id === id; })[0]; return x ? "«" + x.fa + "»" : id; };
        if (e.dir > 0) return "شاهد برای «" + Fx.fa + "»" + (e.sub && typeof e.sub === "string" ? " — " + nm(e.sub) : "");
        var subs = Array.isArray(e.sub) ? e.sub : [];
        return subs.length ? "کنار می‌گذارد: " + subs.map(nm).join("، ") + " (پاسخت با آن نمی‌خواند)؛ بقیهٔ «" + Fx.fa + "» باز می‌ماند"
          : "چیزی را کنار نمی‌گذارد — هیچ تبیینی از این خانواده لزوماً خلافِ این پاسخ را پیش‌بینی نمی‌کند" + (p.kind === "counterfactual" ? " (و حدس دربارهٔ حالتِ فرضی مشاهده نیست)" : "");
      });
      if (eff.length) wrap.appendChild(h("p", { class: "small muted kn-eff" }, "اثرِ این پاسخ: " + eff.join(" · ")));
    }
    return wrap;
  }
  function simLinks(fam) {
    if (!A.knotSimFor || !A.KSIM) return null;
    if (!(A.showSamples && A.showSamples())) return null;   // نمایش‌های آماده فقط با «نمونه‌های آمادهٔ سازنده» (۲۰۲۶-۱۰-۱۳)
    var keys = []; try { keys = A.knotSimFor(fam) || []; } catch (e) { keys = []; }
    keys = keys.filter(function (k) { return A.KSIM[k]; });
    if (!keys.length) return null;
    return h("div", { class: "row gap wrap small" }, h("span", { class: "muted" }, "شبیه‌سازِ نمایشی:"), keys.map(function (k) {
      var s = A.KSIM[k];
      return h("button", { class: "linkish small", onclick: function () {
        var ov = h("div", { class: "overlay", role: "dialog", "aria-modal": "true", "aria-label": s.title, onclick: function (e) { if (e.target === ov) ov.remove(); } });
        var body; try { body = s.draw(); } catch (e) { body = h("p", { class: "bad" }, "نمایش داده نشد."); }
        ov.appendChild(h("div", { class: "dialog wide" }, h("div", { class: "eyebrow" }, "نمایشی"), h("h3", {}, s.title), body, s.note ? h("p", { class: "small muted" }, s.note) : null, h("button", { class: "btn", onclick: function () { ov.remove(); } }, "بستن")));
        A.layer().appendChild(ov);
      } }, s.title);
    }));
  }
  function probeStep(H) {
    var kc = H.kc, rk = A.knotRank(kc), iv = intakeOf(kc);
    var box = h("div", { class: "col gap" });
    var hs = hindsight(kc); if (hs) box.appendChild(hs);
    if (K(iv, "problem") && seenIso(kc)) box.appendChild(isoBox(H));
    if (K(iv, "problem")) box.appendChild(ladderBox(H));
    function famSec(r, i) {
      var F = KFM[r.fam];
      return h("section", { class: "card kn-pf", "data-fam": F.id }, h("div", { class: "row between wrap gap" }, h("h3", {}, fa(i + 1) + ") " + famName(F.id)), h("span", { class: "pill kn-state" }, r.stateFa)),
        F.probes.map(function (p) { return probeBox(H, F, p); }), simLinks(F.id));
    }
    box.appendChild(h("h2", {}, "آزمون‌های تمایزدهنده — سه خانوادهٔ اولِ ترتیبِ بررسی"));
    rk.slice(0, 3).forEach(function (r, i) { box.appendChild(famSec(r, i)); });
    /* اصلِ ۴ ِ طرح: «موقعیت و ساختار» همیشه کنارِ بقیه بررسی می‌شود — اگر در سه تای اول نیست، آزمون‌هایش باز می‌ماند (امتیازش عوض نمی‌شود) */
    var i10 = -1; rk.forEach(function (r, i) { if (r.fam === "F10") i10 = i; });
    if (i10 >= 3) {
      var s10 = famSec(rk[i10], i10); s10.classList.add("kn-always");
      s10.insertBefore(h("p", { class: "small muted" }, "همیشه بررسی می‌شود: شاید جواب «تغییرِ محیط» باشد نه «تغییرِ ذهن». جایش در ترتیبِ بررسی عوض نشده است."), s10.children[1] || null);
      box.appendChild(s10);
    }
    var rest = rk.map(function (r, i) { return [r, i]; }).filter(function (x) { return x[1] >= 3 && x[0].fam !== "F10"; });
    box.appendChild(h("details", { class: "card kn-more" }, h("summary", {}, "آزمونِ خانواده‌های دیگر (" + fa(rest.length) + ")"),
      h("div", { class: "col gap" }, rest.map(function (x) { return famSec(x[0], x[1]); }))));
    box.appendChild(ledger(H));
    return box;
  }
  function ledger(H) {
    var kc = H.kc;
    var sec = h("section", { class: "card kn-ledger" }, h("h3", {}, "دفترِ شواهد (" + fa(kc.ev.length) + ")"));
    if (!kc.ev.length) sec.appendChild(h("p", { class: "small muted" }, "هنوز شاهدی نیست. به یکی از آزمون‌ها پاسخ بده یا نردبان را برو."));
    else sec.appendChild(h("div", { class: "scrollx" }, h("table", { class: "dt kn-evt" }, h("thead", {}, h("tr", {}, h("th", {}, "خانواده"), h("th", {}, "اثر"), h("th", {}, "نوع"), h("th", {}, "شاهد"), h("th", {}, ""))),
      h("tbody", {}, kc.ev.map(function (e, i) {
        var le = liveEv({ ev: [e], pans: kc.pans })[0], Fx = KFM[e.fam], eff = e.dir > 0 ? "شاهد" : (e.kind === "manual" || e.src === "manual") ? "کنارش گذاشتی" :
          Array.isArray(le.sub) && le.sub.length ? "رد می‌کند: " + le.sub.map(function (id) { var x = Fx && Fx.subs.filter(function (y) { return y.id === id; })[0]; return x ? x.fa : id; }).join("، ") : "چیزی را رد نمی‌کند";
        return h("tr", {}, h("td", {}, famName(e.fam)), h("td", {}, h("span", { class: "pill " + (e.dir > 0 ? "good" : /^رد/.test(eff) || /کنار/.test(eff) ? "bad" : "") }, eff)), h("td", { class: "small" }, KWFA[e.kind] || e.kind), h("td", { class: "small" }, e.text),
          h("td", {}, h("button", { class: "linkish small", "aria-label": "حذفِ این شاهد", onclick: function () {
            var rm = kc.ev[i]; kc.ev.splice(i, 1);
            if (rm && /^probe:/.test(rm.src || "") && !kc.ev.some(function (x) { return x.src === rm.src; })) delete kc.pans[rm.src.slice(6)];
            if (rm && rm.src === "ladder" && !kc.ev.some(function (x) { return x.src === "ladder"; })) kc.ladder = {};
            if (rm && /^sieve:/.test(rm.src || "")) { kc.sieveOff = kc.sieveOff || {}; kc.sieveOff[rm.fam] = new Date().toISOString(); }
            H.put(); redraw();
          } }, "حذف")));
      })))));
    var fs = sel("knEvFam", "", A.KF.map(function (F) { return [F.id, famName(F.id)]; }), function () { }), ds = sel("knEvDir", "", [["1", "شاهد (له)"], ["-1", "کنارش می‌گذارم (حکمِ خودم)"]], function () { }),
      ks = sel("knEvKind", "", [["contrast", KWFA.contrast + " (±۳)"], ["fact", KWFA.fact + " (±۱)"], ["counterfactual", KWFA.counterfactual + " (±۰٫۵)"]], function () { }),
      tx = txt("knEvTxt", "", function () { }, "شاهد در یک جمله");
    sec.appendChild(h("details", { class: "kn-addev" }, h("summary", { class: "small" }, "افزودنِ شاهدِ دستی"),
      h("div", { class: "kn-grid" }, fld("خانواده", fs), fld("جهت", ds), fld("نوع", ks), fld("شاهد", tx)),
      h("button", { class: "btn sm", onclick: function () {
        if (!fs.value || !ds.value || !ks.value || !tx.value.trim()) { A.toast("هر چهار خانه لازم است.", "bad"); return; }
        kc.ev.push({ fam: fs.value, dir: +ds.value, sub: "", w: KW[ks.value], kind: ks.value, text: tx.value.trim(), src: "manual", at: now() }); H.put(); redraw();
      } }, "افزودن")));
    return sec;
  }

  /* ---------- قدمِ ۳: ریشه ---------- */
  function toks(s) {
    var STOP = ["برای", "این", "آن", "که", "چرا", "چه", "است", "های", "یک", "را", "با", "از", "در", "به", "هم", "یا", "اگر", "من", "تو", "او", "می", "ها", "بود", "شد", "کرد", "کردم", "ولی", "اما", "وقتی"];
    return norm(s).replace(/[«»"'.,،؛;:!?؟()\[\]{}\-–—…]/g, " ").split(" ").filter(function (w) { return w.length > 2 && STOP.indexOf(w) < 0; });
  }
  A.knotSimilar = function (kc, fam) {
    var a = toks([kc.title, kc.intake.what, kc.intake.thoughts, kc.intake.claim].join(" "));
    return S.all("knot").map(function (k) {
      var b = toks([k.name, k.principle, k.signals, k.counter].join(" ")), ov = a.filter(function (w, i) { return a.indexOf(w) === i && b.indexOf(w) >= 0; }).length;
      return { k: k, s: (k.fam === fam ? 2 : 0) + ov, ov: ov, same: k.fam === fam };
    }).filter(function (x) { return x.same || x.ov >= 2; }).sort(function (x, y) { return y.s - x.s; }).slice(0, 4);
  };
  function supportOf(kc, fam) { return (kc.ev || []).filter(function (e) { return e.fam === fam && e.dir > 0; }); }
  A.knotSupport = supportOf;
  /* تنها نویسندهٔ وضعیتِ گره A.knotSetStatus (a18) است؛ این فقط اگر a18 نباشد مستقیم می‌نویسد */
  function setKStatus(k, st, opts) {
    opts = opts || {};
    if (A.knotSetStatus) return A.knotSetStatus(k, st, opts);
    if (!k || k.status === st) return false;
    k.status = st; if (st === "returned") k.returnedAt = opts.at || now(); if (!opts.noSave) S.put(k); return true;
  }
  A.knotSetStatusSafe = setKStatus;
  /* پیوندِ موقعیت به گرهِ موجود؛ گرهِ «ورزیده‌شده» ⇒ «بازگشته» (وضعیتِ ثبت‌شده تصمیم می‌گیرد، نه A.knotStatus که با پیوندِ تازه
     دوباره حساب می‌شود). نویسندهٔ وضعیت پس از ذخیره یادآورِ پیگیری هم ثبت می‌کند. */
  function linkKnot(k, kc) {
    if ((k.cases || []).indexOf(kc.id) < 0) {
      k.cases = (k.cases || []).concat([kc.id]);
      if (k.status === "practised") setKStatus(k, "returned", { noSave: true, at: now() });
    }
    S.put(k);
  }
  function rootStep(H) {
    var kc = H.kc, R = kc.root, rk = A.knotRank(kc), top = rk[0].fam;
    var box = h("div", { class: "col gap" });
    box.appendChild(h("section", { class: "card soft" }, h("p", {}, "ریشه را خودت تأیید می‌کنی. ترتیبِ بررسی الان با «" + famName(top) + "» شروع می‌شود؛ این پیشنهاد است، نه حکم. سه خانوادهٔ اول: ",
      rk.slice(0, 3).map(function (r) { return famName(r.fam) + " (" + r.stateFa + ")"; }).join("، ") + ".")));
    function soon() { H.soon(); }
    var subSel = h("div", {});
    function drawSub() {
      subSel.innerHTML = "";
      var F = KFM[R.primary]; if (!F) return;
      subSel.appendChild(fld("زیرنوع (اختیاری)", sel("knRootSub", R.sub, F.subs.map(function (s) { return [s.id, s.fa]; }), function (v) { R.sub = v; soon(); })));
    }
    var ctlBox = h("div", {});
    function needCtl() { return top === "F10" || R.primary === "F10"; }
    function drawCtl() {
      ctlBox.innerHTML = "";
      if (!needCtl()) return;
      ctlBox.appendChild(fld("چه چیزی در کنترلِ من بود؟", area("knCtl", R.control, 2, function (v) { R.control = v; soon(); }, "حتی وقتی ساختار مقصر است، سهمِ قابلِ‌تغییرِ خودت چیست؟"),
        { req: true, k: "control", hint: "وقتی «موقعیت و ساختار» اول است این پرسش الزامی است: نه همه‌چیز بیرون است، نه همه‌چیز درون." }));
    }
    /* §۰.۱ و §۱۲.۴: ریشه بی‌شاهد تأیید نمی‌شود — دست‌کم یک شاهدِ «له» برای خانوادهٔ انتخاب‌شده، یا دلیلِ نوشته‌شده که چرا با
       رتبه‌بندی/شاهدها مخالفی؛ و هر فرضیه (از جمله خودِ ریشه) یک تبیینِ رقیب دارد. */
    var sup = supportOf(kc, R.primary), offTop = R.primary && R.primary !== top;
    var supBox = KFM[R.primary] ? h("div", { class: "col gap" },
      h("p", { class: "small " + (sup.length ? "muted" : "warnline") + " kn-sup" }, sup.length ? "شاهدِ له برای این خانواده: " + sup.map(function (e) { return e.text; }).slice(0, 3).join(" · ") : "برای این خانواده هنوز هیچ شاهدِ «له»ی در دفترِ شواهد (قدمِ ۲) نیست."),
      sup.length && !offTop ? null : fld(sup.length ? "چرا خانواده‌ای جز اولیِ ترتیبِ بررسی را انتخاب می‌کنی؟ (اختیاری)" : "چرا با رتبه‌بندی/شاهدها مخالفم و باز هم این را ریشه می‌دانم؟",
        area("knDisagree", R.disagree, 2, function (v) { R.disagree = v; soon(); }, "مثلاً: «آزمونِ این خانواده را نشد بدهم، ولی در سه موقعیتِ دیگر هم…»"),
        { req: !sup.length, k: "disagree", hint: sup.length ? null : "یا به قدمِ ۲ برگرد و یک آزمونِ همین خانواده را بده تا شاهد ثبت شود." })) : null;
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "گرهِ اصلی"),
      fld("خانوادهٔ اصلی", sel("knRootFam", R.primary, rk.map(function (r) { return [r.fam, famName(r.fam) + " — " + r.stateFa]; }), function (v) { R.primary = v; R.sub = ""; R.extra = R.extra.filter(function (x) { return x.fam !== v; }); H.put(); redraw(); }), { req: true, k: "primary" }),
      subSel, supBox,
      fld("تبیینِ رقیبِ اصلی: اگر ریشه این نباشد، محتمل‌ترین تبیینِ دیگر چیست؟", area("knRootRival", R.rival, 2, function (v) { R.rival = v; soon(); }, "مثلاً: «شاید فقط خسته بودم» یا «شاید معیارِ داور پنهان بود»"),
        { req: true, k: "rival", hint: "هر فرضیه یک تبیینِ رقیب دارد (§۰.۱)؛ ریشه هم." }),
      fld("درصدِ اطمینانت به این ریشه (۰ تا ۱۰۰)", h("input", { type: "number", id: "knConf", min: "0", max: "100", value: R.conf == null ? "" : R.conf, oninput: function (e) { R.conf = e.target.value === "" ? null : Math.max(0, Math.min(100, +e.target.value)); soon(); } }),
        { req: true, k: "conf", hint: "کالیبراسیونِ اطمینان (تکنیک ۲۴): عددی که حاضری رویش شرط ببندی، نه آرزو." }), ctlBox));
    drawSub(); drawCtl();
    var exBox = h("div", { class: "kn-checks" });
    function drawExtra() {
      exBox.innerHTML = "";
      A.KF.forEach(function (F) {
        if (F.id === R.primary) return;
        var cur = R.extra.filter(function (x) { return x.fam === F.id; })[0], id = "knEx_" + F.id;
        var row = h("div", { class: "kn-exrow" }, h("label", { class: "kn-check", for: id }, h("input", { type: "checkbox", id: id, checked: !!cur, onchange: function (e) {
          R.extra = R.extra.filter(function (x) { return x.fam !== F.id; }); if (e.target.checked) R.extra.push({ fam: F.id, sub: "" }); drawExtra(); soon();
        } }), h("span", {}, famName(F.id))),
          cur ? sel("knExS_" + F.id, cur.sub, F.subs.map(function (s) { return [s.id, s.fa]; }), function (v) { cur.sub = v; soon(); }) : null);
        exBox.appendChild(row);
        /* §۱: یک موقعیت یک گرهِ اصلی و چند گرهِ کمکی دارد — برای هر خانوادهٔ کمکی، گرهِ کمکیِ تازه یا پیوند به گرهِ موجود (اختیاری).
           همهٔ گره‌ها در kc.knots می‌روند (اصلی اول) و یالِ «هم‌رخداد» ِ نقشه از همین‌ها ساخته می‌شود. */
        if (cur) {
          var opts = [["new", "گرهِ کمکیِ تازه بساز"]].concat(S.all("knot", function (k) { return k.fam === F.id || (k.extra || []).some(function (x) { return x.fam === F.id; }); })
            .map(function (k) { return [k.id, "پیوند به «" + (k.name || "گرهِ بی‌نام") + "» · " + A.KSTATUS[A.knotStatus(k)]]; }));
          var nm = cur.knotPick === "new" ? txt("knExN_" + F.id, cur.newName, function (v) { cur.newName = v; soon(); }, "نامِ گرهِ کمکی (اختیاری؛ پیش‌فرض «گرهِ کمکی»)") : null;
          var ks = h("select", { id: "knExK_" + F.id, "aria-label": "گرهِ کمکی برای " + famName(F.id), onchange: function (e) { cur.knotPick = e.target.value; drawExtra(); soon(); } },
            h("option", { value: "" }, "فقط خانواده (بی گرهِ جدا)"), opts.map(function (o) { return h("option", { value: o[0], selected: cur.knotPick === o[0] }, o[1]); }));
          exBox.appendChild(h("div", { class: "kn-exknot row gap wrap", "data-fam": F.id }, h("span", { class: "small muted" }, "گرهِ کمکی:"), ks, nm));
        }
      });
    }
    drawExtra();
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "گره‌های کمکی (اختیاری)"),
      h("p", { class: "small muted" }, "برای هر خانوادهٔ کمکی می‌توانی یک گرهِ جدا بسازی یا به گرهِ موجود پیوند بدهی؛ آن‌وقت در «نقشهٔ ذهن» یالِ «هم‌رخداد در یک موقعیت» میانِ گره‌ها کشیده می‌شود."), exBox));
    /* چرا‌ها: حداکثر ۳، هر کدام یک شاهد؛ برای هر چرای درونی یک تبیینِ رقیبِ بیرونی (§۱۲.۴) */
    var whyBox = h("div", { class: "col gap" });
    function drawWhy() {
      whyBox.innerHTML = "";
      R.why5.forEach(function (w, i) {
        whyBox.appendChild(h("div", { class: "card soft kn-whyrow", "data-k": "why" + i }, h("div", { class: "row between" }, h("b", {}, "چرای " + fa(i + 1)),
          h("button", { class: "linkish small", onclick: function () { R.why5.splice(i, 1); drawWhy(); soon(); } }, "حذف")),
          fld("چرا؟", txt("knW_" + i, w.why, function (v) { w.why = v; soon(); }), { req: true }),
          fld("یک شاهد برای همین چرا", txt("knWe_" + i, w.ev, function (v) { w.ev = v; soon(); }), { req: true }),
          fld("درونی یا بیرونی؟", sel("knWt_" + i, w.kind, [["in", "درونی (در ذهن/رفتارِ من)"], ["out", "بیرونی (موقعیت/ساختار)"]], function (v) { w.kind = v; drawWhy(); soon(); }), { req: true }),
          w.kind === "in" ? fld("تبیینِ رقیبِ بیرونی", txt("knWr_" + i, w.rival, function (v) { w.rival = v; soon(); }, "اگر علت بیرون از من بود، چه بود؟"), { req: true }) : null));
      });
      if (R.why5.length < 3) whyBox.appendChild(h("button", { class: "btn ghost sm", onclick: function () { R.why5.push({ why: "", ev: "", kind: "", rival: "" }); drawWhy(); } }, "+ یک «چرا»ی دیگر"));
    }
    drawWhy();
    box.appendChild(h("section", { class: "card kn-whysec", "data-k": "why" }, h("h3", {}, "چرا‌ها (تکنیک ۱۲؛ دست‌کم ۱، حداکثر ۳ سطح)", h("span", { class: "reqmark", title: "الزامی" }, " *")), h("p", { class: "small muted" }, "از گره به ریشهٔ عمیق‌تر؛ دست‌کم یک «چرا» لازم است. هر «چرا» یک شاهد می‌خواهد، و برای هر چرای درونی یک تبیینِ رقیبِ بیرونی تا همه‌چیز به درونِ ذهن نسبت داده نشود."), whyBox));
    if (recurring(kc)) box.appendChild(h("section", { class: "card", "data-k": "loop2" }, h("h3", {}, "یادگیریِ دوحلقه‌ای (تکنیک ۳۹)"),
      fld("متغیرِ حاکم: این رفتار برای کدام هدف، باور یا معیار بهینه است؟", area("knLoop2", R.loop2, 2, function (v) { R.loop2 = v; soon(); }), { req: true, hint: "چون تکراری است، فقط کارِ بعدی را عوض کردن کافی نیست؛ معیاری را پیدا کن که این رفتار برایش «درست» است." })));
    /* گره: تازه یا پیوند به موجود */
    var fam = R.primary || top, sims = A.knotSimilar(kc, fam), linked = kc.knots[0] && S.get(kc.knots[0]);
    var choice = R.knotPick || (linked ? linked.id : "new");
    var kb = h("section", { class: "card" }, h("h3", {}, "گره"),
      linked ? h("p", { class: "small" }, "این موقعیت به گرهِ «" + (linked.name || "بی‌نام") + "» پیوند خورده است.") : null,
      sims.length ? h("p", { class: "small muted" }, "گره‌های مشابه (همان خانواده یا واژه‌های مشترک):") : h("p", { class: "small muted" }, "گرهِ مشابهی پیدا نشد."),
      radios("knPick", choice, (linked && !sims.some(function (x) { return x.k.id === linked.id; }) ? [[linked.id, "همان گرهِ پیوندخورده: «" + (linked.name || "گرهِ بی‌نام") + "»"]] : []).concat(sims.map(function (x) { return [x.k.id, "پیوند به «" + (x.k.name || "گرهِ بی‌نام") + "» · " + famName(x.k.fam) + " · " + A.KSTATUS[A.knotStatus(x.k)] + (x.ov ? " · " + fa(x.ov) + " واژهٔ مشترک" : "")]; })).concat([["new", "گرهِ تازه بساز"]]),
        function (v) { R.knotPick = v; soon(); }),
      fld("نامِ گرهِ تازه (اختیاری؛ در کارت هم می‌شود نوشت)", txt("knNewName", R.newName, function (v) { R.newName = v; soon(); })));
    box.appendChild(kb);
    var conf = h("button", { class: "btn lg kn-confirm", onclick: function () {
      var miss = [];
      if (!KFM[R.primary]) miss.push(["primary", "خانوادهٔ اصلی"]);
      if (R.conf == null || isNaN(+R.conf)) miss.push(["conf", "درصدِ اطمینان"]);
      if (needCtl() && !String(R.control || "").trim()) miss.push(["control", "چه چیزی در کنترلِ من بود؟"]);
      if (KFM[R.primary] && !supportOf(kc, R.primary).length && !String(R.disagree || "").trim()) miss.push(["disagree", "شاهدِ له برای این خانواده یا دلیلِ مخالفت با رتبه‌بندی"]);
      if (!String(R.rival || "").trim()) miss.push(["rival", "تبیینِ رقیبِ اصلی"]);
      if (!R.why5.length) miss.push(["why", "دست‌کم یک «چرا»"]);
      R.why5.forEach(function (w, i) { if (!String(w.why || "").trim() || !String(w.ev || "").trim() || !w.kind || (w.kind === "in" && !String(w.rival || "").trim())) miss.push(["why" + i, "چرای " + fa(i + 1)]); });
      if (recurring(kc) && !String(R.loop2 || "").trim()) miss.push(["loop2", "متغیرِ حاکم"]);
      box.querySelectorAll("[data-k]").forEach(function (el) { el.classList.toggle("missing", miss.some(function (m) { return m[0] === el.getAttribute("data-k"); })); });
      if (miss.length) { A.toast("این‌ها هنوز کامل نیستند: " + miss.map(function (m) { return m[1]; }).slice(0, 3).join("، "), "bad"); var f0 = box.querySelector(".missing"); if (f0 && f0.scrollIntoView) f0.scrollIntoView({ block: "center" }); return; }
      var pick = R.knotPick || (linked ? linked.id : "new"), k = pick !== "new" && S.get(pick);
      if (!k) { k = A.newKnot({ name: String(R.newName || "").trim(), fam: R.primary, sub: R.sub || "", extra: R.extra.map(function (x) { return { fam: x.fam, sub: x.sub || "" }; }), cases: [kc.id] }); R.knotPick = k.id; }
      else { if (!k.fam) k.fam = R.primary; linkKnot(k, kc); }
      /* گره‌های کمکی: تازه (یک بار — شناسه‌اش در همان ردیف می‌ماند تا تأییدِ دوباره گرهِ تکراری نسازد) یا پیوند به موجود */
      var ids = [k.id];
      R.extra.forEach(function (x) {
        if (!x.knotPick || !KFM[x.fam]) return;
        var xk = x.knotPick !== "new" && S.get(x.knotPick);
        if (!xk) { xk = A.newKnot({ name: String(x.newName || "").trim() || "گرهِ کمکی", fam: x.fam, sub: x.sub || "", cases: [kc.id] }); x.knotPick = xk.id; }
        else linkKnot(xk, kc);
        if (ids.indexOf(xk.id) < 0) ids.push(xk.id);
      });
      kc.knots.filter(function (x) { return ids.indexOf(x) < 0; }).forEach(function (old) { var o = S.get(old); if (o) { o.cases = (o.cases || []).filter(function (c) { return c !== kc.id; }); S.put(o); } });
      kc.knots = ids; R.confirmed = true; R.at = now(); kc.status = kc.status === "done" ? "done" : "rooted"; kc.step = "s4"; H.put();
      A.toast(k.status === "returned" ? "ریشه تأیید شد — این گره «بازگشته» است." : "ریشه تأیید شد." + (ids.length > 1 ? " (" + fa(ids.length - 1) + " گرهِ کمکی)" : ""));
      A.go("kcase", kc.id, "s4");
    } }, kc.root.confirmed ? "به‌روزرسانی و تأییدِ دوبارهٔ ریشه" : "ریشه را تأیید کن");
    box.appendChild(h("div", { class: "row gap wrap" }, conf));
    return box;
  }

  /* ---------- قدمِ ۴: بازکردن ---------- */
  function actKey(a) { return a.tid ? "t" + a.tid : a.ext ? "x:" + a.ext : a.pid ? "p:" + a.pid : a.epi ? "epi" : a.farm ? "farm" : a.prob ? "prob" : "?"; }
  A.knotActs = function (kc) {
    var R = kc.root || {}, list = [], seen = {};
    [{ fam: R.primary, sub: R.sub }].concat(R.extra || []).forEach(function (fs) {
      var F = KFM[fs.fam]; if (!F) return;
      F.acts.forEach(function (a) {
        if (a.sub && a.sub !== fs.sub) return;
        var k = actKey(a); if (seen[k]) return; seen[k] = 1;
        list.push({ key: k, a: a, fam: F.id });
      });
    });
    return list;
  };
  function actRec(kc, key) { var r = kc.acts.filter(function (x) { return x.key === key; })[0]; return r; }
  function unpackStep(H) {
    var kc = H.kc, k = S.get(kc.knots[0]);
    if (!k) return A.empty("گرهِ این موقعیت پیدا نشد؛ در قدمِ ۳ دوباره تأیید کن.");
    var box = h("div", { class: "col gap" });
    box.appendChild(h("section", { class: "card soft" }, h("p", {}, "گره: ", h("b", {}, k.name || "بی‌نام"), " · ", famChip(k.fam), k.sub ? " · " + subName(k.fam, k.sub) : "", " · وضعیت: " + A.KSTATUS[A.knotStatus(k)]),
      h("p", { class: "small" }, "مداخله‌ها به ترتیبِ اولویت. هر تکنیک کاربرگِ واقعیِ خودش را همین‌جا روی همین موقعیت باز می‌کند (با اولین نوشته‌ات ذخیره می‌شود). مداخله‌های «بیرون از ۴۵ تکنیک» منبع و سطحِ شواهدشان را کنارشان دارند.")));
    var acts = A.knotActs(kc);
    box.appendChild(h("section", { class: "card" }, h("h2", {}, "مداخله‌ها"), h("ol", { class: "kn-acts" }, acts.map(function (x, i) { return actRow(H, k, x, i); }))));
    var el = epiLinksSec(kc); if (el) box.appendChild(el);
    /* R4 — تصمیمِ مالک (۲۰۲۶-۱۰-۱۵): گرهِ «هیجان و انگیزه» (F7: اجتناب، ترس از قضاوت، رها کردن پس از نقد) ⇒ «🌱 کوچک‌ترین گامِ بعد»
       (a36): خواستن و امید به‌صورتِ داده، گامِ کوچکِ زمان‌دار که روزِ موعد وارسی می‌شود — تمرینِ همین گره در زندگیِ واقعی */
    if (A.willCard && ([].concat(k.fam || []).indexOf("F7") >= 0 || (kc.root && kc.root.primary === "F7"))) {
      box.appendChild(A.willCard({ kind: "knot", id: kc.id, title: kc.title || k.name || "", box: kc, put: function () { H.put(); }, go: function () { A.go("kcase", kc.id, "s4"); } }, "knot:F7",
        "این گره در «هیجان و انگیزه» است: ترس یا ناامیدی مسیر را کج می‌کند. پادزهرش تعهدِ کوچکِ مشخص است، نه تصمیمِ بزرگ — کوچک‌ترین گامِ بعد چیست و کِی؟ روزِ موعد همین‌جا و در «امروز» برمی‌گردد."));
    }
    box.appendChild(knotCardEditor(k, { kc: kc, H: H }));
    if (A.V.kpractice) box.appendChild(h("section", { class: "card kn-close" }, h("h3", {}, "بعد: ورزیدگی"),
      h("p", { class: "small" }, "ورزش یعنی شناختنِ همین ساختار در ظاهرهای تازه (و نمونه‌های بدلی که گره در آن‌ها نیست) — نه حفظِ یک راه‌حل. تمرینِ سؤال‌های شبیهِ آزمونِ هوش نمرهٔ همان نوع آزمون را با آشنایی بالا می‌برد، نه توانِ کلی را."),
      h("button", { class: "btn", disabled: !cardDone(k), title: cardDone(k) ? "" : "اول کارتِ گره را کامل کن", onclick: function () { A.go("kpractice", k.id); } }, "🏋️ ورزش را شروع کن")));
    else box.appendChild(h("p", { class: "small muted" }, "بخشِ ورزش (نمونه‌های تازه برای همین گره) هنوز در این نسخه نیست."));
    return box;
  }
  function actRow(H, k, x, i) {
    var kc = H.kc, a = x.a, rec = actRec(kc, x.key);
    var li = h("li", { class: "kn-act" + (rec && rec.done ? " done" : ""), "data-act": x.key });
    var panel = h("div", { class: "kn-actp hidden" });
    var title, chip;
    if (a.tid) { var t = A.TM[a.tid]; title = fa(a.tid) + " · " + (t ? t.fa : ""); chip = h("span", { class: "chip" }, "تکنیکِ " + fa(a.tid)); }
    else if (a.pid) { title = A.pn ? A.pn(a.pid) : a.fa; chip = h("span", { class: "chip" }, "روال"); }
    else if (a.ext) { title = a.fa; chip = h("span", { class: "chip kn-ext" }, "بیرون از ۴۵ تکنیک"); }
    else { title = a.fa; chip = h("span", { class: "chip" }, a.epi || a.prob ? "کارخانه" : "مزرعه"); }
    var openB = h("button", { class: "btn ghost sm", "aria-expanded": "false", onclick: function () {
      var on = panel.classList.toggle("hidden"); openB.setAttribute("aria-expanded", on ? "false" : "true"); openB.textContent = on ? "باز کن" : "ببند";
      if (!on && !panel.firstChild) fillPanel();
    } }, "باز کن");
    li.appendChild(h("div", { class: "row between wrap gap" }, h("div", {}, h("span", { class: "kn-an" }, fa(i + 1)), " ", h("b", {}, title), " ", chip, rec && rec.done ? h("span", { class: "chip good" }, "✓ انجام شد") : null,
      a.note ? h("div", { class: "small muted" }, a.prob ? "چرا: " + a.note : a.note) : null, a.tid ? courseLink(a.tid) : null, x.fam !== kc.root.primary ? h("div", { class: "small muted" }, "از گرهِ کمکی: " + famName(x.fam)) : null), openB));
    li.appendChild(panel);
    function mark(extra) {
      var r = actRec(kc, x.key); if (!r) { r = { key: x.key }; if (a.tid) r.tid = a.tid; if (a.ext) r.ext = a.ext; kc.acts.push(r); }
      for (var q in extra) r[q] = extra[q]; return r;
    }
    function fillPanel() {
      if (a.tid) {
        var t = A.TM[a.tid]; if (!t) { panel.appendChild(h("p", { class: "bad" }, "این تکنیک پیدا نشد.")); return; }
        var r0 = actRec(kc, x.key), ex = r0 && r0.exId && S.get(r0.exId), data = ex ? ex.data || (ex.data = {}) : {};
        var savef = A.debounce(function () {
          if (!ex) { ex = A.newEx(a.tid, kc.topic || ""); ex.data = data; ex.kcase = kc.id; S.put(ex); mark({ exId: ex.id }); H.put(); if ((k.status || "open") === "open") setKStatus(k, "working"); }
          else S.put(ex);
        }, 450);
        panel.appendChild(h("p", { class: "small" }, t.def, " ", A.peekChip ? A.peekChip(a.tid) : null));
        var ws = A.renderWS(t.ws, data, function () { savef(); }, { prefix: "kn" + a.tid });
        panel.appendChild(h("div", { class: "card wsform" }, ws));
        panel.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn sm", onclick: function () {
          var miss = ws._validate();
          if (miss.length) { A.toast("این بخش‌ها هنوز خالی‌اند: " + miss.slice(0, 3).join("، "), "bad"); return; }
          if (!ex) { ex = A.newEx(a.tid, kc.topic || ""); ex.data = data; ex.kcase = kc.id; mark({ exId: ex.id }); }
          ex.status = "done"; S.put(ex); try { if (A.onExDone) A.onExDone(ex); } catch (e) { console.error(e); }
          mark({ done: true, at: now() }); if ((k.status || "open") === "open") setKStatus(k, "working"); H.put(); redraw();
        } }, "کاربرگ کامل شد"), ex ? h("button", { class: "linkish small", onclick: function () { A.go("tech", a.tid, "ws:" + ex.id); } }, "در صفحهٔ تکنیک") : null));
      } else if (a.ext) {
        panel.appendChild(h("p", {}, a.how));
        panel.appendChild(h("p", { class: "small" }, h("b", {}, "منبع: "), a.src ? h("span", { dir: "auto" }, a.src) : "در طرح منبعی ذکر نشده"));
        panel.appendChild(h("p", { class: "small warnline" }, "بیرون از ۴۵ تکنیک" + (a.ev ? " · " + a.ev : "")));
        var nt = area("knActN_" + a.ext, (actRec(kc, x.key) || {}).note, 2, function (v) { mark({ note: v }); H.soon(); }, "چه کردی و چه دیدی؟ (اختیاری)");
        panel.appendChild(fld("یادداشت", nt));
        panel.appendChild(h("button", { class: "btn sm", onclick: function () { mark({ done: true, at: now() }); H.put(); redraw(); } }, "انجامش دادم"));
      } else if (a.pid) {
        panel.appendChild(h("p", { class: "small" }, "این مداخله یک روالِ کامل است و در صفحهٔ خودش اجرا می‌شود (با «↩ برگرد» برمی‌گردی)."));
        panel.appendChild(h("button", { class: "btn sm", onclick: function () { mark({ started: now() }); H.put(); A.startProto(a.pid, { topic: kc.topic || "", preset: { p: kc.title } }); } }, "اجرای «" + (A.pn ? A.pn(a.pid) : a.fa) + "»"));
      } else if (a.epi) {
        panel.appendChild(h("p", { class: "small" }, "جملهٔ نتیجه‌ات را در کارخانه بسنج: از کجا آمده، با چه ملاکی سنجیده می‌شود، و چه چیزی باطلش می‌کند."));
        panel.appendChild(factoryBtn(H));
      } else if (a.prob) {
        /* ممیزی ۲۰۲۶-۱۰-۱۳: با نمونه‌های آماده پنهان، این متن از «مسئلهٔ مشهور» حرف می‌زد و به فهرستی خالی می‌برد ⇒ اول «شبیه‌سازِ همین مسئله» */
        var ownP = A.probOfCase ? A.probOfCase(kc) : null, mine = A.probsMine ? A.probsMine().length : 0;
        panel.appendChild(h("p", { class: "small" }, "در شبیه‌سازِ گام‌به‌گام، در هر لحظه حرکتِ بعدی را انتخاب می‌کنی و می‌بینی کدام راه بن‌بست می‌شود — همان «عوض‌کردنِ راه» که این گره کم دارد. " +
          (ownP && ownP.status === "approved" ? "شبیه‌سازِ همین مسئلهٔ خودت آماده است." : ownP ? "شبیه‌سازِ همین مسئله ساخته شده و منتظرِ تأییدِ توست." : "اگر این موقعیت «مسئله» است، پایینِ همین صفحه «🧪 شبیه‌سازِ همین مسئله» را بساز.") +
          (mine ? " " + fa(mine) + " مسئلهٔ دیگرِ خودت هم در «مسئله‌های بزرگ» هست." : "") + " (با «↩ برگرد» برمی‌گردی)"));
        panel.appendChild(h("div", { class: "row gap wrap" },
          ownP && ownP.status === "approved" ? h("button", { class: "btn sm kn-prob-own", onclick: function () { mark({ started: now() }); H.put(); A.go("e_prob", ownP.p.id, "sim"); } }, "🧪 شبیه‌سازِ همین مسئله") : null,
          h("button", { class: "btn sm ghost kn-prob-go", onclick: function () { mark({ started: now() }); H.put(); A.go("e_prob", null, ownP && ownP.status !== "approved" ? "pending" : null); } }, "🏛️ «مسئله‌های بزرگ» ِ خودت")));
      } else if (a.farm) panel.appendChild(nurseryBtn(k));
    }
    return li;
  }
  /* تکنیکی که درسِ «دورهٔ گام‌به‌گام» هم هست ⇒ یک پیوند به همان درس (A.COURSE_LESSONS از a11) */
  function courseLink(tid) {
    var L = (A.COURSE_LESSONS || []).filter(function (l) { return !l.pid && +l.tid === +tid; })[0];
    if (!L || !A.V.lesson) return null;
    return h("p", { class: "small kn-crslink" }, "این تکنیک درسِ دورهٔ گام‌به‌گام هم هست (منزلِ " + fa(L.w) + ") — ",
      h("button", { class: "linkish small", onclick: function () { A.go("lesson", L.tid, "s1"); } }, "📚 درسِ «" + (L.fa || "") + "» در دوره"),
      h("span", { class: "muted" }, " (با «↩ برگرد» برمی‌گردی)"));
  }
  A.knotCourseLink = courseLink;
  /* قدمِ ۴ ⇐ ایستگاه‌های کارخانه: برای خانوادهٔ اصلی و کمکی‌ها، هر کدام با «چرا»ی خودش؛ بی‌پیوند ⇒ هیچ (نه بخشِ خالی) */
  A.knotEpiLinks = function (kc) {
    var R = (kc && kc.root) || {}, out = [], seen = {};
    [R.primary].concat((R.extra || []).map(function (x) { return x && (x.fam || x); })).forEach(function (fam) {
      var F = KFM[fam]; if (!F) return;
      (F.epi || []).forEach(function (l) {
        if (seen[l.st] || !(A.EST && A.EST[l.st])) return;
        seen[l.st] = 1; out.push({ st: l.st, why: l.why, fam: fam });
      });
    });
    return out;
  };
  function epiLinksSec(kc) {
    var ls = A.knotEpiLinks(kc); if (!ls.length) return null;
    return h("section", { class: "card kn-epilinks", "data-report-section": "kepi", "data-report-section-label": "در کارخانهٔ معرفت‌شناسی" },
      h("h3", {}, "🏭 در کارخانهٔ معرفت‌شناسی"),
      h("p", { class: "small muted" }, "ایستگاه‌هایی که دقیقاً به سازوکارِ همین خانواده مربوط‌اند؛ هر کدام با یک خط «چرا»."),
      h("ul", { class: "plain kn-epil" }, ls.map(function (l) {
        return h("li", { "data-st": l.st }, h("button", { class: "linkish", onclick: function () { A.go("e_st", l.st); } }, "🏭 " + A.EST[l.st].fa),
          h("span", { class: "muted small" }, " · " + famName(l.fam)), h("div", { class: "small" }, "چرا: " + l.why));
      })));
  }
  function nurseryBtn(k) {
    var done = S.all("seedling", function (s) { return s.src && s.src.id === k.id; }).length;
    return h("div", { class: "col gap" }, h("p", { class: "small" }, "اگر این گره به یک مفهومِ علمی برمی‌گردد (برای علم حل‌شده، برای تو نه)، یک نهال با نوعِ «گره شخصی» در نهالستانِ مزرعه بکار تا در درختِ همان علم جا بگیرد."),
      h("button", { class: "btn sm kn-nursery", disabled: !!done, onclick: function (e) {
        var text = String(k.name || "").trim() + (k.principle ? " — " + k.principle : "");
        if (!text.trim()) { A.toast("اول نامِ گره یا ساختارِ عمیقش را در کارت بنویس.", "bad"); return; }
        A.toNursery(text, "knot", { type: "knot", t: "knot", id: k.id, label: "گرهِ ذهنی: " + (k.name || "") }, "me");
        e.target.disabled = true; e.target.textContent = "در نهالستان کاشته شد"; A.toast("نهال در نهالستانِ مزرعه است.");
      } }, done ? "در نهالستان کاشته شده" : "🌱 در نهالستانِ مزرعه بکار"));
  }
  function knotCardEditor(k, o) {
    o = o || {};
    var sec = h("section", { class: "card kn-kcard", "data-own": "1" }, h("h2", {}, "کارتِ گره — به قلمِ خودت"),
      h("p", { class: "small muted" }, "نوشتنِ کارت خودش بخشی از بازکردن است (اثرِ تولید، تکنیک ۴۴): سامانه برایت نمی‌نویسد."));
    var save = A.debounce(function () { S.put(k); }, 450);
    var F = [["name", "نامِ گره", "kn-name", 1, "یک نامِ کوتاه که خودت بشناسی"], ["principle", "ساختارِ عمیق", "kn-pr", 3, "زیرِ ظاهرِ این موقعیت، چه سازوکاری تکرار می‌شود؟"],
      ["signals", "نشانه‌های تشخیص", "kn-sg", 2, "«وقتی … دیدی، احتمالاً این گره فعال است»"], ["counter", "حرکتِ مقابل", "kn-co", 2, "وقتی نشانه را دیدی دقیقاً چه می‌کنی؟"], ["example", "یک مثالِ خودت", "kn-ex", 2, "یک موقعیتِ دیگر (نه همین) که همین ساختار را دارد"]];
    F.forEach(function (f) {
      var ctl = f[3] === 1 ? txt("knC_" + f[0], k[f[0]], function (v) { k[f[0]] = v; save(); }, f[4]) : area("knC_" + f[0], k[f[0]], f[3], function (v) { k[f[0]] = v; save(); }, f[4]);
      sec.appendChild(fld(f[1], ctl, { req: true, k: "c_" + f[0] }));
    });
    var after = h("div", { class: "col gap" });
    function drawAfter() {
      after.innerHTML = "";
      if (!k.cardAt) return;
      var has = S.all("card", function (c) { return c.knot === k.id; }).length;
      after.appendChild(h("div", { class: "row gap wrap" },
        h("button", { class: "btn ghost sm kn-rcard", disabled: !!has, onclick: function (e) {
          A.newCard("نشانه: " + k.signals + "\n— حرکتِ مقابل چیست؟", k.counter + "\n(گره: " + k.name + ")", { knot: k.id });
          e.target.disabled = true; e.target.textContent = "کارتِ مرور ساخته شد"; A.toast("کارت در صفِ مرور است.");
        } }, has ? "کارتِ مرورِ این گره ساخته شده" : "🗂️ کارتِ مرور بساز (نشانه ⇐ حرکتِ مقابل)")),
        h("p", { class: "small muted" }, "کارتِ مرور «نشانه ⇐ حرکتِ مقابل» را می‌آزماید؛ ورزش «تشخیصِ ساختار» را — دو برنامهٔ فاصلهٔ جدا، عمداً."));
      var fams = [k.fam].concat((k.extra || []).map(function (x) { return x.fam; }));
      if (fams.indexOf("F1") >= 0) after.appendChild(nurseryBtn(k));
    }
    sec.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn kn-cardsave", onclick: function () {
      var miss = F.filter(function (f) { return !String(k[f[0]] || "").trim(); });
      sec.querySelectorAll("[data-k]").forEach(function (el) { el.classList.toggle("missing", miss.some(function (f) { return "c_" + f[0] === el.getAttribute("data-k"); })); });
      if (miss.length) { A.toast("کارت کامل نیست: " + miss.map(function (f) { return f[1]; }).join("، "), "bad"); return; }
      k.cardAt = k.cardAt || now(); if ((k.status || "open") === "open") setKStatus(k, "working", { noSave: true }); S.put(k);
      if (o.kc) { o.kc.status = "done"; o.H.put(); }
      A.toast("کارتِ گره ثبت شد."); drawAfter();
      var pr = document.querySelector("main .kn-close .btn"); if (pr) { pr.disabled = false; pr.title = ""; }
    } }, k.cardAt ? "به‌روزرسانیِ کارت" : "ثبتِ کارتِ گره")));
    sec.appendChild(after); drawAfter();
    return sec;
  }

  /* ================= فهرستِ موقعیت‌ها و گره‌ها ================= */
  A.kcFilter = { st: "", fam: "", q: "" };
  A.V.kcases = function () {
    var root = h("div", { class: "page kn", dir: "rtl" });
    root.appendChild(A.head("گره‌گشا", "جایی گیر کردم یا کاری کردم که نمی‌فهمم چرا",
      "مسئله‌ای که حل نشد، واکنشی که از خودت دیدی، یا نتیجه‌ای اجتماعی که نمی‌فهمی. هر موقعیت از چند تونل می‌گذرد تا ریشه را — با شاهد و با تأییدِ خودت — پیدا کنی و کم‌کم بازش کنی."));
    root.appendChild(h("section", { class: "card soft small" }, h("p", {}, "صادقانه: این ابزار ریشه را حدس نمی‌زند و حکم نمی‌دهد؛ فرضیه‌ها را کنارِ هم می‌گذارد و تو با شاهد انتخاب می‌کنی. ورزش، شناختنِ همان ساختار را در شکل‌های تازه تمرین می‌دهد؛ قولِ «قوی‌ترشدنِ مغز» یا «بالا رفتنِ ضریبِ هوش» نمی‌دهد، و نمی‌گوید گره دیگر برنمی‌گردد — آزمونِ واقعی، موقعیتِ واقعیِ بعدی است."),
      h("p", { class: "muted" }, "تشخیصِ بالینی و درمان نیست.")));
    if (A.V.concerns) root.appendChild(h("p", { class: "small kn-concern" }, "این بخش پاسخِ دغدغهٔ شمارهٔ ۱۰ توست — «گره‌های ذهنی‌ام باز شوند و با تمرین محو شوند». ",
      h("button", { class: "linkish small", onclick: function () { A.go("concerns", "c10"); } }, "دیدنِ دغدغه‌ها")));
    if (A.knotEmoStreak()) root.appendChild(emoCard());
    root.appendChild(h("div", { class: "row gap wrap" },
      h("button", { class: "btn lg kn-new", onclick: function () { A.go("kcase", "new", "in"); } }, "+ موقعیتِ تازه"),
      A.V.kpractice ? h("button", { class: "btn ghost", onclick: function () { A.go("kpractice"); } }, "🏋️ ورزشِ گره‌ها") : null,
      A.V.kmap ? h("button", { class: "btn ghost", onclick: function () { A.go("kmap"); } }, "🕸️ نقشهٔ ذهن") : null));
    var F = A.kcFilter, list = h("div", { class: "col gap" });
    root.appendChild(h("div", { class: "filters kn-filters" },
      h("input", { type: "search", id: "kcq", "aria-label": "جست‌وجو در موقعیت‌ها", placeholder: "جست‌وجو…", value: F.q, oninput: function (e) { F.q = e.target.value; draw(); } }),
      h("select", { id: "kcst", "aria-label": "وضعیت", onchange: function (e) { F.st = e.target.value; draw(); } }, h("option", { value: "" }, "همهٔ وضعیت‌ها"), Object.keys(KCST).map(function (s) { return h("option", { value: s, selected: F.st === s }, KCST[s]); })),
      h("select", { id: "kcfam", "aria-label": "خانواده", onchange: function (e) { F.fam = e.target.value; draw(); } }, h("option", { value: "" }, "همهٔ خانواده‌ها"), A.KF.map(function (x) { return h("option", { value: x.id, selected: F.fam === x.id }, famName(x.id)); }))));
    root.appendChild(h("h2", {}, "موقعیت‌ها")); root.appendChild(list);
    function draw() {
      list.innerHTML = "";
      var cs = S.all("kcase", function (c) {
        if (F.st && (c.status || "open") !== F.st) return false;
        if (F.fam && ((c.root || {}).primary || "") !== F.fam && !((c.root || {}).extra || []).some(function (x) { return x.fam === F.fam; })) return false;
        if (F.q.trim() && norm(c.title + " " + ((c.intake || {}).what || "")).indexOf(norm(F.q)) < 0) return false;
        return true;
      });
      if (!cs.length) { list.appendChild(A.empty(S.all("kcase").length ? "موردی با این فیلتر نیست." : "هنوز موقعیتی ثبت نشده.")); return; }
      cs.forEach(function (c) {
        var pf = (c.root || {}).primary;
        list.appendChild(h("div", { class: "card kn-row" }, h("div", { class: "row between wrap gap" },
          h("div", {}, h("b", {}, c.title || "موقعیت"), h("div", { class: "row gap wrap small" }, (c.kinds || []).map(function (k) { return h("span", { class: "chip" }, (KINDFA[k] || k).split(" (")[0]); }), pf ? famChip(pf) : null,
            h("span", { class: "muted" }, (KCST[c.status] || "") + " · " + A.fdate(c.created) + (c.status !== "closed" && c.status !== "done" ? " · " + (SNAME[c.step] || "ثبت") : "")))),
          h("button", { class: "btn sm", onclick: function () { A.go("kcase", c.id, c.step || "in"); } }, c.status === "done" || c.status === "closed" ? "باز کن" : "ادامه"))));
      });
    }
    draw();
    var ks = S.all("knot");
    root.appendChild(h("h2", { class: "mt" }, "گره‌های من"));
    root.appendChild(ks.length ? h("div", { class: "kn-knots" }, ks.map(function (k) {
      var st = A.knotStatus(k);
      return h("button", { class: "card kn-kbtn kn-s-" + st, onclick: function () { A.go("knot", k.id); } }, h("b", {}, k.name || "گرهِ بی‌نام"),
        h("div", { class: "row gap wrap small" }, famChip(k.fam), h("span", { class: "chip kn-stc" }, A.KSTATUS[st]), h("span", { class: "muted" }, fa(A.knotCases(k.id).length) + " موقعیت")));
    })) : A.empty("هنوز گرهی تأیید نشده؛ هر گره پس از قدمِ ۳ ِ یک موقعیت ساخته می‌شود."));
    return root;
  };

  A.V.knot = function (id, tab) {
    var k = id && S.get(id);
    if (!k || k.type !== "knot") return A.empty("این گره پیدا نشد.", h("button", { class: "btn", onclick: function () { A.go("kcases"); } }, "🪢 گره‌گشا"));
    var st = A.knotStatus(k), root = h("div", { class: "page kn", dir: "rtl" });
    root.appendChild(h("button", { class: "linkish", onclick: function () { A.go("kcases"); } }, "← گره‌گشا"));
    root.appendChild(A.head("گرهِ ذهنی", k.name || "گرهِ بی‌نام", null, h("div", { class: "row gap wrap" }, famChip(k.fam), k.sub ? h("span", { class: "chip" }, subName(k.fam, k.sub)) : null,
      (k.extra || []).map(function (x) { return famChip(x.fam); }), h("span", { class: "chip kn-stc kn-s-" + st }, "وضعیت: " + A.KSTATUS[st]))));
    if (st === "returned") root.appendChild(h("p", { class: "card soft warnline small" }, "«بازگشته»: پس از ورزیدگی، موقعیتِ تازه‌ای به این گره پیوند خورده است" + (k.returnedAt ? " (" + A.fdate(k.returnedAt) + ")" : "") + ". این خودش داده است، نه شکست."));
    var mm = null; if (A.kmastery) { try { mm = A.kmastery(k); } catch (e) { mm = null; } }
    if (mm && mm.lapse) root.appendChild(h("p", { class: "card soft warnline small kn-lapse" }, A.KLAPSE || "یک پاسخِ نادرست پس از ورزیدگی — مرورِ بیشتر پیشنهاد می‌شود."));
    var gap = A.kcodeGap ? A.kcodeGap(k) : null;
    if (gap) root.appendChild(h("p", { class: "card soft small kn-codegap" }, gap));
    root.appendChild(h("div", { class: "row gap wrap" },
      A.V.kpractice ? h("button", { class: "btn", disabled: !cardDone(k), title: cardDone(k) ? "" : "اول کارتِ گره را کامل کن", onclick: function () { A.go("kpractice", k.id); } }, "🏋️ ورزش") : null,
      A.V.kmap ? h("button", { class: "btn ghost", onclick: function () { A.go("kmap", k.id); } }, "🕸️ در نقشهٔ ذهن") : null,
      // «دوباره پیش آمد» (کارزارِ آزمون sc17): بازگشتِ گرهِ ورزیده بی ساختنِ تحلیلِ پنج‌قدمیِ تازه — تصمیمِ خودِ کاربر، با تأیید
      st === "practised" && A.knotReturned && A.confirmBtn ? A.confirmBtn("↩ دوباره پیش آمد", function () {
        A.knotReturned(k.id); A.toast("ثبت شد: «بازگشته». ماندگاری دوباره از نو سنجیده می‌شود؛ اگر خواستی موقعیتِ تازه را در گره‌گشا ثبت کن تا چرایی‌اش روشن شود."); A.render();
      }) : null));
    var t = tab || "card";
    root.appendChild(A.tabs([["card", "کارت"], ["cases", "موقعیت‌ها (" + fa(A.knotCases(k.id).length) + ")"], ["links", "پیوندها"]], t, function (x) { A.go("knot", k.id, x); }));
    if (t === "cases") {
      var cs = A.knotCases(k.id);
      root.appendChild(cs.length ? h("ul", { class: "plain kn-cl" }, cs.map(function (c) {
        return h("li", {}, h("button", { class: "linkish", onclick: function () { A.go("kcase", c.id, c.step || "s4"); } }, c.title || "موقعیت"), h("span", { class: "muted small" }, " · " + A.fdate(c.created) + " · " + (KCST[c.status] || "")));
      })) : A.empty("موقعیتی به این گره پیوند نخورده."));
      // دوباره‌سنجی‌ها کنارِ ثبتِ نخست، با همان مقیاس (بازبینیِ متقابلِ ۲۰۲۶-۱۰-۱۵)
      if ((k.remeasures || []).length) root.appendChild(h("section", { class: "card soft kn-remeasure", dir: "rtl" }, h("h3", {}, "📏 دوباره‌سنجی"),
        h("ul", { class: "plain" }, k.remeasures.map(function (r) { return h("li", {}, h("span", { class: "muted small" }, A.fdate(r.at) + " · "), A.knotRemeasureText(k, r)); }))));
    } else if (t === "links") root.appendChild(knotLinks(k));
    else root.appendChild(knotCardEditor(k));
    return root;
  };
  function knotLinks(k) {
    var cs = A.knotCases(k.id), rows = [];
    cs.forEach(function (c) {
      var e = c.premise && c.premise.ecase && S.get(c.premise.ecase);
      if (e) rows.push(h("li", {}, "🏭 ", h("button", { class: "linkish", onclick: function () { A.go("e_case", e.id); } }, "پروندهٔ کارخانه: " + e.title)));
      S.all("ex", function (x) { return x.kcase === c.id; }).forEach(function (x) { var t = A.TM[x.tid]; rows.push(h("li", {}, "🧩 ", h("button", { class: "linkish", onclick: function () { A.go("tech", x.tid, "ws:" + x.id); } }, "کاربرگِ تکنیکِ " + fa(x.tid) + (t ? " · " + t.fa : "")), h("span", { class: "muted small" }, x.status === "done" ? " · کامل" : " · پیش‌نویس"))); });
    });
    S.all("card", function (c) { return c.knot === k.id; }).forEach(function (c) { rows.push(h("li", {}, "🗂️ کارتِ مرور · موعد " + A.fdate(c.due))); });
    S.all("seedling", function (s) { return s.src && s.src.id === k.id; }).forEach(function () { rows.push(h("li", {}, "🌱 ", h("button", { class: "linkish", onclick: function () { A.go("farm", null, "nursery"); } }, "نهالِ «گره شخصی» در مزرعه"))); });
    var sim = S.all("knot", function (x) { return x.id !== k.id && x.fam === k.fam; });
    return h("div", { class: "col gap" }, h("section", { class: "card" }, h("h3", {}, "پیوندها"), rows.length ? h("ul", { class: "plain" }, rows) : h("p", { class: "muted small" }, "هنوز پیوندی نیست.")),
      sim.length ? h("section", { class: "card" }, h("h3", {}, "گره‌های هم‌خانواده"), h("ul", { class: "plain" }, sim.map(function (x) { return h("li", {}, h("button", { class: "linkish", onclick: function () { A.go("knot", x.id); } }, x.name || "بی‌نام")); }))) : null);
  }

  /* ================= یکپارچگی: منو، پرونده‌های کارخانه، P9 ================= */
  /* ورزش و نقشه (a17/a18) اگر ساخته شده‌اند، در همان گروهِ «گره‌گشا» ِ منو می‌آیند — بی‌تکرار */
  var rawShell = A.shell;
  A.shell = function () {
    try {
      var nav = A.NAV, at = -1, has = {};
      nav.forEach(function (n, i) { if (!n.g) { has[n[0]] = 1; if (n[0] === "kcases") at = i; } });
      if (at >= 0) {
        var add = [];
        if (A.V.kpractice && !has.kpractice) add.push(["kpractice", "🏋️ ورزشِ گره‌ها", "نمونه‌های تازه با شکل‌های گوناگون برای گره‌هایت؛ درهم‌تنیده و با فاصله"]);
        if (A.V.kmap && !has.kmap) add.push(["kmap", "🕸️ نقشهٔ ذهن", "گره‌ها، وضعیتشان و پیوندهایشان در یک گراف"]);
        if (add.length) nav.splice.apply(nav, [at + 1, 0].concat(add));
      }
    } catch (e) { console.error(e); }
    return rawShell.apply(this, arguments);
  };
  /* پروندهٔ کارخانه‌ای که از یک موقعیت آمده، راهِ برگشت به همان موقعیت را نشان می‌دهد (بی‌ویرایشِ a6) */
  var rawECase = A.V.e_case;
  if (rawECase) A.V.e_case = function (id) {
    var root = rawECase.apply(this, arguments);
    try {
      var cs = S.get(id), src = cs && cs.src, kc = src && src.type === "kcase" && S.get(src.id);
      if (kc && root && root.insertBefore) root.insertBefore(h("section", { class: "card soft kn-back" }, h("p", { class: "small" }, "این پرونده از یک موقعیتِ «گره‌گشا» آمده است: ", h("b", {}, kc.title || "موقعیت"), "."),
        h("button", { class: "btn ghost sm", onclick: function () { A.go("kcase", kc.id, "s0"); } }, "🪢 برگشت به همان موقعیت")), root.children[1] || null);
    } catch (e) { console.error(e); }
    return root;
  };
  /* دغدغه‌ها: c10 («گره‌های ذهنی‌ام … باز شوند و با تمرین …») دقیقاً همین ابزار است و c7 («حفظ نه … عمقِ کار را بفهمم») اصلِ ورزشِ آن.
     فقط یک پیوند زیرِ همان دو کارت (بی‌ویرایشِ a4)؛ دغدغهٔ دیگری پیوند نمی‌گیرد. */
  var KCONCERN = { c10: "این ابزار برای همین ساخته شده: هر گیرکردن را از تونل‌ها می‌گذراند تا ریشه را با شاهد پیدا کنی، بازش کنی و با نمونه‌های متنوع ورزیده شوی.",
    c7: "ورزشِ گره‌گشا حفظِ راه‌حل نیست: همان ساختار را در ظاهرهای تازه و در نمونه‌های بدلی تشخیص می‌دهی — یعنی فهمِ عمق." };
  var rawConcerns = A.V.concerns;
  if (rawConcerns) A.V.concerns = function () {
    var root = rawConcerns.apply(this, arguments);
    try {
      Object.keys(KCONCERN).forEach(function (cid) {
        var card = root && root.querySelector && root.querySelector("#cc_" + cid); if (!card) return;
        card.appendChild(h("div", { class: "kv mt kn-concern-link", "data-concern": cid }, h("span", {}, h("button", { class: "linkish", onclick: function () { A.go("kcases"); } }, "🪢 گره‌گشا")), h("span", { class: "small" }, KCONCERN[cid])));
      });
    } catch (e) { console.error(e); }
    return root;
  };
  /* P9 (ممیزیِ دوحلقه‌ای ماهانه): گره‌های «بازگشته» همان خطای تکراری‌اند */
  var rawProto = A.V.proto;
  if (rawProto) A.V.proto = function (pid) {
    var root = rawProto.apply(this, arguments);
    try {
      if (pid === "P9" && root && root.appendChild) {
        var ret = S.all("knot", function (k) { return A.knotStatus(k) === "returned"; });
        root.appendChild(h("section", { class: "card kn-p9" }, h("h3", {}, "🪢 گره‌های «بازگشته»"),
          h("p", { class: "small muted" }, "گره‌هایی که پس از ورزیدگی دوباره در یک موقعیتِ واقعی دیده شده‌اند — مادهٔ خامِ همین ممیزیِ دوحلقه‌ای."),
          ret.length ? h("ul", { class: "plain" }, ret.map(function (k) { return h("li", {}, h("button", { class: "linkish", onclick: function () { A.go("knot", k.id); } }, k.name || "گرهِ بی‌نام"), h("span", { class: "muted small" }, " · " + famName(k.fam))); }))
            : h("p", { class: "small" }, "این ماه گرهِ بازگشته‌ای نیست.")));
      }
    } catch (e) { console.error(e); }
    return root;
  };
})(APP);
