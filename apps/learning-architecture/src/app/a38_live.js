/* ===== «🔭 مسئلهٔ حل‌نشدهٔ خودم»: همان تونلِ حل، روی مسئله‌ای که پاسخش را هیچ‌کس از پیش نمی‌داند (a38_live.js) =====
   مالک (۲۰۲۶-۱۰-۱۵): «میخوام برسه که بگی دیگه چیزی نیست … همه چیز در ارتباط … جزیره‌ای نباشه» و سودِ واقعی برای زندگی. شکاف (سند:
   docs/decisions/2026-10-15-polya-strict-regrade.md، «کمبودِ ساختاری»): تونلِ گام‌به‌گامِ a36 فقط روی مسئلهٔ حل‌شده کار می‌کرد — شبیه‌ساز گامِ تو
   را با گامِ درستِ ذخیره‌شده می‌سنجد. برای تصمیم، پروژه یا پرسشِ فکریِ واقعی فقط گره‌گشا و قابِ عملی بود.
   این پرونده سامانهٔ تازه نیست؛ حالتی از همان تونل است:
   • همان نوعِ رکورد: eprob با mode: "live" (و live: true)؛ رکوردهای پیشین با «mode» ِ خالی یک بار mode: "solved" می‌گیرند (fill-empty، بی تغییرِ زمان).
   • همان رکوردِ پیشرفت (eprog_<pid>.solve): کارتِ فهم (u)، حدس (g)، بازنگری (b)، درس‌ها، نردبانِ مرورِ ۱/۳/۷/۲۱/۶۰ (rev) و «🌱 کوچک‌ترین گامِ بعد» (will)
     همان‌هایند؛ فقط آنچه این حالت تازه دارد زیرِ solve.live می‌نشیند: فهرستِ داده‌ها، طرح، گام‌های واقعی با پیش‌بینی، ادعاها، حرکت‌ها، پیوندها.
   • همان پرسش‌ها: A.solveAskList (PLAN_QS/نوعِ مسئله)، با «چرا این پرسش» و «پرسشِ بعد»؛ همان دروازهٔ «الان از خودت چه می‌پرسی؟» (A.solveSelfAskGate).
   • داور واقعیت است، نه پاسخِ ذخیره‌شده: هر گامِ واقعی پیش از انجام یک پیش‌بینی با احتمال و موعد دارد ⇒ رکوردِ «🎯 دفترِ پیش‌بینی» (fcast، dim: s_problem)
     ⇒ همان مسیرِ دادهٔ کالیبراسیونِ پیش‌بینیِ رویداد (P.forecastEst ِ a34، بُعدِ «حلِ مسئله» ِ کارنامه). هم‌خوانیِ پیش‌بینی و نتیجه را خودت داوری می‌کنی (data-own).
   • هوش مصنوعی داور نیست و جای تو نمی‌نویسد: هیچ فیلدِ این‌جا را دستیار پر نمی‌کند (data-own)؛ شباهت‌یابیِ «مسئلهٔ مرتبط» با کد است (واژه‌های مشترک، نه مدل). */
(function (A) {
  if (!A.S || !A.V || !A.solveUI) return;
  var h = A.h, fa = A.fa, S = A.S, U = A.solveUI;
  var field = U.field, selF = U.selF, own = U.own, txt = U.txt, clip = U.clip, LADDER = U.LADDER;
  function nowISO() { return new Date().toISOString(); }
  function rec(pid) { var r = pid ? S.get("eprob_" + pid) : null; return r && r.live && r.p && r.status !== "rejected" ? r : null; }
  function lives() { return S.all("eprob", function (r) { return r && r.live && r.p && r.status !== "rejected"; }); }
  A.liveRec = rec; A.liveAll = lives;
  function pgOf(pid) { return U.prog(pid); }
  function solOf(pg) { var s = U.sol(pg); var L = s.live = s.live || {}; ["steps", "claims", "moves", "related", "aux", "knots"].forEach(function (k) { L[k] = L[k] || []; }); seqFix(s); return s; }
  /* شناسهٔ داده‌ها هرگز دوباره به کار نمی‌رود (تیک‌ها و «به‌کارنرفته»ها به شناسه بسته‌اند): شمارندهٔ یک‌سویه روی solve.live؛ رکوردهای پیشین
     یک بار از بیشینهٔ شناسه‌هایی که جایی آمده‌اند (کارتِ فهم، نسخه‌های پیشینِ آن، پیش‌نویس، تیکِ گام‌ها و پاسخ‌ها، «به‌کارنرفته»ها) پر می‌شوند */
  function seqFix(s) {
    var L = s.live, mx = L.dSeq || 0;
    function see(id) { var m = /^d(\d+)$/.exec(String(id || "")); if (m && +m[1] > mx) mx = +m[1]; }
    [s.u && s.u[1]].concat(L.uHist || []).forEach(function (u) { ((u && u.dl) || []).forEach(function (x) { see(x.id); }); });
    L.steps.forEach(function (st) { (st.data || []).forEach(see); });
    if (L.plan) Object.keys(L.plan.unused || {}).forEach(see);
    L.dSeq = mx;
  }
  /* شناسهٔ تازه بی مصرفِ شمارنده: بیشینهٔ «ثبت‌شده» (dSeq) و آنچه در همین پیش‌نویس هست، به‌علاوهٔ یک؛ شمارنده فقط هنگامِ ثبتِ کارت جلو می‌رود
     (باز کردنِ کارت بی تایپ هیچ شناسه‌ای مصرف نمی‌کند — بازبینیِ دورِ ۶) */
  function idNum(id) { var m = /^d(\d+)$/.exec(String(id || "")); return m ? +m[1] : 0; }
  function nid(s, list) { var mx = s.live.dSeq || 0; (list || []).forEach(function (x) { mx = Math.max(mx, idNum(x.id)); }); return "d" + (mx + 1); }
  function live(s) { return s.live; }
  function T0(t) { return (A.SOLVE_TYPES || {})[t] || A.SOLVE_TYPES.find; }
  function typeOf(r, s) { var t = (s && s.type) || (r && r.p && r.p.kind); return A.SOLVE_TYPES && A.SOLVE_TYPES[t] ? t : "find"; }

  /* ---------- داورِ مسئله (تور ۱ ِ پولیا؛ B093/B094/B098 «مسئلهٔ کامل‌بیان‌شده در برابرِ مسئلهٔ عملی») ----------
     همان تونل، سه داور: «life» (تصمیم/پروژه/پرسشِ زندگی؛ داور واقعیت — رفتارِ پیشین)، «practical» (مسئلهٔ عملی با کمیت: داده‌ها بی‌شمار و نادقیق‌اند،
     خودت مرز می‌کشی کدام داده اثرِ محسوس دارد و کدام تقریب بس است — قابِ ۸ جزئیِ گره‌گشا، A.KPRAC_KEYS، با وارسیِ A.measurableCheck)،
     «objective» (مسئلهٔ کامل‌بیان‌شده با پاسخِ عینی که هنوز حلش نکرده‌ای — ریاضی، اثبات، معما؛ داور برهان است: هر گام «روشن می‌بینی که درست است؟
     می‌توانی ثابت کنی؟»، و سنجیدن با واقعیت فقط اگر معنا دارد). در کارتِ فهم انتخاب می‌شود (u.nat؛ رکوردِ پیشین بی nat ⇒ «life»، fill-empty هنگامِ خواندن). */
  var NAT = {
    life: { fa: "تصمیم، پروژه یا پرسشِ زندگی — پاسخ را کسی از پیش نمی‌داند", note: "داور واقعیت و داوریِ خودت است: هر گامِ واقعی پیش‌بینی و روزِ وارسی دارد." },
    practical: { fa: "مسئلهٔ عملی با کمیت (خرید، ساخت، جا دادن، پول، زمان) — داده‌ها بی‌شمار و نادقیق‌اند", note: "مسئلهٔ عملی کامل بیان نشده است: داده‌ها و قیدها بی‌شمارند و نادقیق؛ خودت مرز می‌کشی کدام داده اثرِ محسوس دارد، کدام را با دلیل بیرون می‌گذاری و کدام تقریب بس است — و پرسشِ «همهٔ داده‌ها را به کار بردی؟» این‌جا می‌شود «داده‌هایی که اثرِ محسوس دارند را به کار بردی؟»." },
    objective: { fa: "مسئلهٔ کامل‌بیان‌شده با پاسخِ عینی (ریاضی، اثبات، معما، تمرین) — هنوز حلش نکرده‌ای", note: "مسئلهٔ کامل‌بیان‌شده: همهٔ داده‌ها و شرط داده شده و پاسخ عینی است؛ هر داده معمولاً به کار می‌آید (دادهٔ بی‌کار یعنی چیزی را ندیده‌ای) و داورِ هر گام برهان است، نه پیش‌بینیِ رویداد." }
  };
  A.LIVE_NAT = NAT;
  function natOf(s, r) { var u = uOf(s), n = (u && u.nat) || (r && r.p && r.p.nat); return NAT[n] ? n : "life"; }
  A.liveNature = function (pid) { var r = rec(pid); if (!r) return null; return natOf(solOf(pgOf(pid)), r); };
  /* نامِ صادرشده برای قلاب‌های بیرونی (تور، دستیار): «life» | «practical» | «objective» — همان data-lp-kind ِ صفحه */
  A.liveKind = A.liveNature;
  /* پیشنهاد (نه حکم): واژه‌های ریاضی/اثبات ⇒ کامل‌بیان‌شده؛ عدد با واحد ⇒ عملی */
  function natGuess(t) {
    var x = norm(t);
    if (/ثابت\s*کن|اثبات|برهان|معادله|مثلث|دایره|عدد\s*اول|معما|تمرین|بخش\s*پذیر|ریاضی|هندسه|زاویه|چندضلعی|المپیاد/.test(x)) return "objective";
    if (/\d/.test(x) && /متر|سانت|کیلو|لیتر|تومان|ریال|دلار|درصد|٪|%|ساعت|دقیقه|قسط|وام|اجاره|متری|وزن|حجم|مساحت|ظرفیت/.test(x)) return "practical";
    return "";
  }
  A.liveNatGuess = natGuess;

  /* ---------- «حکمتِ ضرب‌المثل‌ها» (تور ۱ ِ پولیا، s35): ثبت‌گاهِ کوچکِ گفته‌های اکتشافیِ خودِ کتاب — نقلِ ترجمه (sources/polya_how_to_solve_it/items.json،
     C151–C168)، هر کدام کنارِ همان پرسشی که پشتیبانی می‌کند و در همان مرحله؛ معادلِ فارسیِ عامیانه نه (وفاداری)، و همیشه با حدِ آن (C150: ضرب‌المثل
     قاعدهٔ قطعی نیست و اغلب ضدِ خود را دارد). قلابِ دستیار همین ثبت‌گاه را می‌خواند: A.HEUR_WISDOM (نامِ خنثی، بی نامِ کتاب؛ فیلدِ ph = مرحله/جا) و A.heurWisdom(ph). ---------- */
  var PROV = [
    { id: "C151", ph: "u", t: "کسی که بد می‌فهمد، بد پاسخ می‌دهد", q: "پیش از هر کار: مجهول چیست؟ داده‌ها چیست؟ شرط چیست؟", sec: "§۱" },
    { id: "C152", ph: "goal", t: "قبل از شروع به پایان فکر کن", q: "«حل‌شدن» دقیقاً چه شکلی است — هدف را روشن می‌بینی؟", sec: "§۱" },
    { id: "C153", ph: "will", t: "جایی که اراده‌ای هست، راهی هم هست", q: "چقدر می‌خواهی پیشش ببری — و کوچک‌ترین گامِ بعد چیست؟", sec: "§۱" },
    { id: "C166", ph: "five", t: "پنج دوستِ خوبِ شما چه، چرا، کجا، کی و چگونه هستند", q: "چه؟ چرا؟ کجا؟ کی؟ چگونه؟ — کدام دربارهٔ این مسئله هنوز بی‌پاسخ است؟", sec: "§۵" },
    { id: "C165", ph: "rel", t: "هدف، وسیله را پیشنهاد می‌کند", q: "به مجهول نگاه کن: کدام مسئلهٔ آشنا همین مجهول را داشت؟", sec: "§۵" },
    { id: "C154", ph: "incub", t: "سخت‌کوشی مادرِ خوش‌شانسی است", q: "ایدهٔ خوب پس از تلاشِ جدی می‌آید — چه چیزی را جدی آزمودی که حالا کنارش می‌گذاری؟", sec: "§۲" },
    { id: "C155", ph: "p", t: "همهٔ کلیدهای دسته را امتحان کنید", q: "کدام ابزارِ طرح را هنوز نیازموده‌ای — مسئلهٔ مرتبط، کار به عقب، مسئلهٔ کمکی، حرکتی دیگر؟", sec: "§۲" },
    { id: "C157", ph: "p2", t: "دو کمان برای تیراندازی داشته باشید", q: "اگر این طرح نشد، طرحِ دومت چیست؟", sec: "§۲" },
    { id: "C158", ph: "switch", t: "هدفِ ماهیگیری، ماهیگیری نیست بلکه صید است", q: "طرح را عوض می‌کنی — هدف را گم نکرده‌ای؟ طرحِ پیشین را به‌قدرِ کافی آزمودی؟", sec: "§۲" },
    { id: "C163", ph: "back", t: "ترتیبِ اجرا اغلب دقیقاً برعکسِ ترتیبِ اختراع است", q: "آخرین حلقه‌ای که از آخر به عقب نوشتی، نخستین گامِ اجراست؟", sec: "§۳" },
    { id: "C160", ph: "c", t: "یک تأخیرِ عاقلانه راه را امن می‌کند", q: "آماده‌ای این گام را برداری — نه با عجله، نه با تردیدِ بی‌پایان؟", sec: "§۳" },
    { id: "C162", ph: "cobj", t: "پله به پله نردبان بالا می‌رود", q: "روشن می‌بینی که این گام درست است؟ می‌توانی ثابت کنی؟", sec: "§۳" },
    { id: "C161", ph: "want", t: "ما به زودی آنچه را که می‌خواهیم باور می‌کنیم", q: "قوی‌ترین شاهدِ خلافِ همین ادعا چیست — آن را آزمودی؟", sec: "§۳" },
    { id: "C164", ph: "b", t: "با دو لنگر سوار شدن امن است", q: "نتیجه را از راهِ دیگری هم وارسی می‌کنی؟", sec: "§۴" },
    { id: "C168", ph: "new", t: "قارچ‌ها خوشه‌ای می‌رویند", q: "پس از این کشف، اطرافش را بنگر: مسئلهٔ تازه‌ای که از همین برمی‌آید چیست؟", sec: "§۵" }
  ];
  var PROV_LIMIT = "ضرب‌المثل قاعدهٔ قطعی نیست و اغلب ضدِ خود را دارد (C150)";
  A.HEUR_WISDOM = PROV; A.HEUR_WISDOM_LIMIT = PROV_LIMIT;
  function provOf(ph) { return PROV.filter(function (x) { return x.ph === ph; })[0] || null; }
  A.heurWisdom = provOf;
  function prov(ph) {
    var x = provOf(ph); if (!x) return null;
    return h("p", { class: "small muted lp-prov", "data-prov": x.id, dir: "rtl" }, "حکمتِ ضرب‌المثل‌ها (" + x.sec + "): «" + x.t + "» ⇐ " + x.q + " — قاعدهٔ قطعی نیست؛ فقط یادآورِ همین پرسش.");
  }

  /* ---------- fill-empty: «mode» برای رکوردهای پیشینِ مسئله (یک بار، بی تغییرِ زمانِ رکورد) ---------- */
  var MIGRATED = false;
  A.liveMigrate = function () {
    if (MIGRATED) return 0; MIGRATED = true; var n = 0;
    S.all("eprob", function (r) { return r && !r.mode; }).forEach(function (r) { r.mode = r.live ? "live" : "solved"; S.put(r, { keepTime: true }); n++; });
    /* تور ۱ ِ پولیا (s21): «ثبت‌های تازه» عنوانِ رکورد را از r.title می‌خواند — مسئلهٔ زنده عنوانِ بالایی می‌گیرد (fill-empty) و هرگز خالی نیست */
    lives().forEach(function (r) { if (!txt(r.title) || !txt(r.p.title)) { r.p.title = txt(r.p.title) || firstSentence(r.p.statement) || "مسئلهٔ بی‌نام"; r.title = r.p.title; S.put(r, { keepTime: true }); n++; } });
    return n;
  };

  /* ---------- واژه‌ها (کد، نه مدل): «از این داده استفاده کردی؟» و «مسئلهٔ مرتبط» ---------- */
  var STOP = " و در به از که را رو با این آن اون برای یا تا هم اگر من تو او ما شما یک یه است هست بود شد شود می نمی ها های چه چرا کجا کی چطور چگونه باید نباید شاید خیلی کمی هر همه هیچ ولی اما پس بعد قبل حالا الان دارم داری دارد کنم کنی کند کرد کردم کنیم بکنم بشه بشود شده خواهد خواهم نه بله اینکه آیا را چون وقتی خودم خودت چیزی ای ام ";
  function norm(t) { return String(t == null ? "" : t).replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[ً-ْٔ]/g, "").replace(/ۀ/g, "ه").replace(/‌/g, " ")
    .replace(/[۰-۹]/g, function (c) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(c); }).toLowerCase(); }
  function stem(w) { return w.length > 4 ? w.replace(/(?:هایی|های|ها|ترین|تر|یم|ید|ند|ام|ات|اش|مان|تان|شان|ی)$/, "") : w; }
  /* تور ۱ ِ پولیا (s11/s19): جمعِ مکسر به مفرد («نقاط» ⇐ «نقطه»، «اقساط» ⇐ «قسط») تا «از این داده استفاده کردی؟» نامِ داده را در جمعش هم ببیند */
  var BROKEN = { "نقاط": "نقطه", "اعداد": "عدد", "اضلاع": "ضلع", "زوایا": "زاویه", "اقساط": "قسط", "مسائل": "مسئله", "شرایط": "شرط", "ابعاد": "بعد", "ارقام": "رقم", "اشکال": "شکل", "اجزا": "جزء", "اجزاء": "جزء", "حروف": "حرف", "افراد": "فرد",
    "اوقات": "وقت", "منابع": "منبع", "اموال": "مال", "اسناد": "سند", "دلایل": "دلیل", "عوامل": "عامل", "نتایج": "نتیجه", "مراحل": "مرحله", "وسایل": "وسیله", "قوانین": "قانون", "خطوط": "خط", "سطوح": "سطح", "اقوام": "قوم", "مشتریان": "مشتری", "کتب": "کتاب", "دروس": "درس", "علائم": "علامت", "مقادیر": "مقدار" };
  /* «بُعد» (اندازه) با «بعد» (سپس، واژهٔ ایست) یکی نوشته می‌شود: با ضمه، یا پس از عدد («سه بعد»)، همان «ابعاد» است */
  function dimFix(t) { return String(t == null ? "" : t).replace(/بُعد|(?:یک|دو|سه|چهار|[0-9۰-۹])\s*بعد(?![ء-یپچژکگ])/g, function (m) { return m.replace(/بُ?عد$/, "ابعاد"); }); }
  function toks(t) { var o = []; norm(dimFix(t)).split(/[^0-9a-zء-يپچژکگی]+/).forEach(function (w) { if (!w || (w.length < 2 && !/\d/.test(w)) || STOP.indexOf(" " + w + " ") >= 0) return; w = stem(BROKEN[w] || w); if (o.indexOf(w) < 0) o.push(w); }); return o; }
  function hit(w, tt) { return tt.some(function (x) { return x === w || (w.length >= 4 && x.length >= 4 && (x.indexOf(w) === 0 || w.indexOf(x) === 0)); }); }
  /* دادهٔ d در متنِ t آمده؟ دست‌کم نیمی از واژه‌های معنادارِ داده */
  /* دادهٔ d در متنِ t «به کار رفته»؟ در یک بند (جمله/سطر/پاره‌ای میانِ ، ؛ .) دست‌کم نیمی از واژه‌های معنادارِ داده آمده و همان بند آن را
     نفی نکرده («مهم نیست»، «اصلاً»، «نه»، «ربطی ندارد»، «لازم نیست»، «به کار نمی‌آید») — نام بردنِ داده برای کنار گذاشتنش، به کار بردنش نیست */
  var NEG = /(?:^|\s)(?:نه|اصلا|هیچ|بی‌ربط|بی ربط)(?:\s|$)|مهم\s*نیست|ربطی\s*ندار|لازم\s*نیست|اهمیتی\s*ندار|به\s*کار\s*نمی|کاری\s*ندار|نادیده/;
  /* تور ۱ ِ پولیا (s35): بازگفتن به زبانِ دیگر هم به کار بردن است — یا نیمی از واژه‌های داده، یا دست‌کم دو واژهٔ معنادارِ مشترک (نه عدد و نه واژهٔ
     عامِ مقدار/زمان) در همان بند — و اگر داده فقط یک واژهٔ متمایز دارد («پس‌انداز ۳۰۰ میلیون»)، همان یک واژه؛ قاعدهٔ نفی همان می‌ماند */
  function mentions(t, d) {
    var dt = toks(d); if (!dt.length) return false;
    var dm = toksSim(d);
    return String(t == null ? "" : t).split(/[\n.،؛!?؟:]+|\s(?:ولی|اما)\s/).some(function (cl) {
      var tt = toks(cl); if (!tt.length || NEG.test(norm(cl).replace(/\s+/g, " "))) return false;
      return dt.filter(function (w) { return hit(w, tt); }).length >= Math.ceil(dt.length / 2) || (dm.length > 0 && dm.filter(function (w) { return hit(w, tt); }).length >= Math.min(2, dm.length));
    });
  }
  A.liveMentions = mentions; A.liveToks = toks;

  /* ---------- داده‌ها: کدام به کار رفت؟ (تیکِ خودت ∪ آمدنِ واژه‌هایش در طرح و گام‌ها) ---------- */
  function uOf(s) { return s.u && s.u[1] && s.u[1].done ? s.u[1] : null; }
  function dataOf(s) { var u = uOf(s); return (u && u.dl) || []; }
  /* تور ۱ ِ پولیا (s01/s11/s19): داده‌ای که «با دلیل» کنار گذاشته شد (در طرح «لازم نیست» با دلیلِ سه‌واژه‌ای، در قابِ عملی «اثرش ناچیز است» با دلیل،
     یا در بازنگری) رسیدگی‌شده است، نه «به‌کارنرفته» — در طرح، بازنگری و قلابِ دستیار. و نام بردنِ داده در پاسخ‌ها، زنجیرهٔ کار به عقب، گام‌ها
     (متن، تکیه‌گاه، برهان)، طرحِ دوم و پیش‌نویسِ طرح، به کار بردن است. */
  function asideMap(s) {
    var L = live(s), o = {}, u = uOf(s);
    ((u && u.dl) || []).forEach(function (x) { if (x.eff === "small" && toks(x.effWhy).length >= 2) o[x.id] = x.effWhy; });
    [(L.plan && L.plan.unused) || {}, (s.b && s.b[1] && s.b[1].unused) || {}].forEach(function (un) { Object.keys(un).forEach(function (k) { if (un[k] && un[k].ans === "skip" && toks(un[k].why).length >= 3) o[k] = un[k].why; }); });
    return o;
  }
  function usedMap(s, pg) {
    var dl = dataOf(s), L = live(s), used = {}, texts = [];
    ((pg.tut || {}).plan || []).forEach(function (e) { if (e && e.src === "live" && !e.skip) { (e.data || []).forEach(function (i) { used[i] = "tick"; }); texts.push(e.text); } });
    L.steps.forEach(function (st) { (st.data || []).forEach(function (i) { used[i] = "tick"; }); texts.push(st.text, st.prem, st.proof); });
    if (L.back) { texts.push(L.back.solved, L.back.before1, L.back.before2, L.back.have); (L.back.chains || []).forEach(function (c) { texts = texts.concat(c.links || []); }); }
    L.aux.forEach(function (a) { texts.push(a.t, a.bridge); });
    L.moves.forEach(function (m) { texts.push(m.why); });
    L.related.forEach(function (x) { texts.push(x.carry); });
    if (L.seen) texts.push(L.seen.where);
    texts.push(L.planDraft);
    /* تور ۱ (s01/s11): نام بردنِ داده در گفت‌وگوی همین مسئله با دستیار (پیام‌های خودِ کاربر، فقط خواندن) هم به کار بردن است */
    var pid0 = String(pg.id || "").replace(/^eprog_/, ""), r0 = rec(pid0), chatT = [];
    if (r0) S.all("achat", function (x) { return x && (x.lprob === pid0 || (r0.sess && x.id === r0.sess)); }).forEach(function (se) { (se.msgs || []).forEach(function (m) { if (m && m.role === "user" && !/^\[سامانه/.test(String(m.text || ""))) chatT.push(m.text); }); });
    if (L.plan) { texts.push(L.plan.t, L.plan.t2); Object.keys(L.plan.unused || {}).forEach(function (k) { if (L.plan.unused[k].ans === "use") used[k] = used[k] || "plan"; }); }
    var all = texts.filter(Boolean).join("\n");
    dl.forEach(function (d) { if (!used[d.id] && mentions(all, d.t)) used[d.id] = "text"; });
    if (chatT.length) { var allC = chatT.join("\n"); dl.forEach(function (d) { if (!used[d.id] && mentions(allC, d.t)) used[d.id] = "chat"; }); }
    var as = asideMap(s); dl.forEach(function (d) { if (!used[d.id] && as[d.id]) used[d.id] = "aside"; });
    return used;
  }
  A.liveAside = function (pid) { var pg = pgOf(pid); return asideMap(solOf(pg)); };
  A.liveUsed = function (pid) { var pg = pgOf(pid), s = solOf(pg); return usedMap(s, pg); };
  function unusedOf(s, pg) { var u = usedMap(s, pg); return dataOf(s).filter(function (d) { return !u[d.id]; }); }
  function dataTicks(s, idp, sel) {
    var dl = dataOf(s); if (!dl.length) return null;
    return h("fieldset", { class: "lp-ticks small" }, h("legend", {}, "از کدام داده‌ها استفاده می‌کند؟ (کد واژه‌هایش را هم در متنت می‌جوید)"),
      h("div", { class: "row gap wrap" }, dl.map(function (d) { var id = idp + d.id; return h("label", { class: "row gap", for: id }, h("input", { type: "checkbox", id: id, checked: sel.indexOf(d.id) >= 0 ? true : null, onchange: function (e) { var i = sel.indexOf(d.id); if (e.target.checked && i < 0) sel.push(d.id); if (!e.target.checked && i >= 0) sel.splice(i, 1); } }), clip(d.t, 60)); })));
  }
  var UNUSED_ANS = [["use", "حالا به کارش می‌برم"], ["skip", "لازم نیست — دلیلش را می‌نویسم"], ["unknown", "نمی‌دانم کجا به کار می‌آید"]];
  /* پولیا: «همهٔ داده‌ها را به کار بردی؟ هر داده را؟» — برای هر دادهٔ به‌کارنرفته با نامش؛ «نمی‌دانم» خودش سرنخ است (عنصرِ غایب) */
  function unusedAsk(list, store, idp, nat) {
    if (!list.length) return null;
    var box = h("div", own({ class: "col gap lp-unused" }), h("h4", {}, "داده‌هایی که هنوز به کار نرفته‌اند"),
      h("p", { class: "small" }, nat === "practical" ? "مسئلهٔ عملی: هر داده لازم نیست — ولی کنار گذاشتن دلیل می‌خواهد (اثرش ناچیز است؟ بیرونِ خطی است که کشیدی؟). داده‌ای که اثرِ محسوس دارد و بی‌کار مانده، سرنخ است." :
        nat === "objective" ? "در مسئلهٔ کامل‌بیان‌شده تقریباً هر داده به کار می‌آید: داده‌ای که بی‌کار مانده اغلب همان عنصرِ گمشدهٔ راه است — «لازم نیست» این‌جا ادعای سنگینی است و دلیل می‌خواهد." :
        "اگر داده‌ای را به کار نبرده‌ای، یا لازم نیست (بگو چرا)، یا همان‌جا سرنخی پنهان است: داده‌ای که بی‌کار مانده اغلب همان عنصرِ گمشدهٔ راه است."));
    list.forEach(function (d) {
      var a = store[d.id] = store[d.id] || { ans: "", why: "" };
      box.appendChild(h("div", { class: "card soft col gap lp-un", "data-d": d.id },
        selF(idp + "a_" + d.id, "از «" + clip(d.t, 80) + "» استفاده کردی؟ اگر نه، چرا؟", UNUSED_ANS, a.ans, function (v) { a.ans = v; }),
        field(idp + "w_" + d.id, "چرا؟ / کجا به کارش می‌بری؟ (یک جمله)", a.why, function (v) { a.why = v; }, 0)));
    });
    return box;
  }
  /* «لازم نیست» دلیل می‌خواهد: دست‌کم سه واژهٔ معنادار، و یک دلیلِ یکسان برای چند داده پذیرفته نیست (بازبینیِ دورِ ۶) */
  function unusedMiss(list, store) {
    var seen = {}, dup = [];
    list.forEach(function (d) { var a = store[d.id]; if (a && a.ans === "skip" && txt(a.why)) { var k = toks(a.why).join(" "); if (seen[k]) dup.push(d); seen[k] = 1; } });
    return list.filter(function (d) { var a = store[d.id]; return !a || !a.ans || (a.ans === "skip" ? toks(a.why).length < 3 || dup.indexOf(d) >= 0 : a.ans !== "use" && txt(a.why).length < 3); }).map(function (d) { return "«" + clip(d.t, 40) + "»"; }); }

  /* ---------- مرحله ---------- */
  var PHN = { u: "فهمِ مسئله", p: "طرح", c: "اجرا روی واقعیت", b: "بازنگری", done: "بسته" };
  function phaseOf(s) {
    var L = live(s);
    if (!uOf(s) || L.reU) return "u";
    if (L.state === "solved" || L.state === "abandoned") return s.b && s.b[1] && s.b[1].done ? "done" : "b";
    if (!(L.plan && L.plan.at)) return "p";
    return "c";
  }
  A.livePhase = function (pid) { var pg = pgOf(pid); return phaseOf(solOf(pg)); };
  function openStep(s) { var L = live(s); return L.steps.filter(function (x) { return !x.closed; }).pop() || null; }
  function lastClosed(s) { var L = live(s); var c = L.steps.filter(function (x) { return x.closed; }); return c[c.length - 1] || null; }

  /* ---------- ساختن (فرمِ برچسب‌دار — دستیار هم از همین فرم یا live_new می‌سازد) ---------- */
  function firstSentence(t) { var x = txt(String(t == null ? "" : t).split(/[.!?؟\n]/)[0]); return x ? clip(x, 80) : ""; }
  function create(title, statement, kind, extra) {
    extra = extra || {};
    var pid = "pb_l_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    var k = A.SOLVE_TYPES && A.SOLVE_TYPES[kind] ? kind : "find", st0 = String(statement || "").trim();
    var ti = clip(txt(title) || firstSentence(st0) || "مسئلهٔ بی‌نام", 120);   // عنوان هرگز خالی نیست (تور ۱، s21)
    var r = { id: "eprob_" + pid, type: "eprob", status: "live", mode: "live", live: true, by: extra.by || "user", title: ti,
      p: { id: pid, title: ti, statement: st0, kind: k, field: "مسئلهٔ زندهٔ من", live: true, stages: [], dead: [], drills: [], lessons: [] } };
    if (NAT[extra.nat]) r.p.nat = extra.nat;
    if (extra.origin) r.origin = extra.origin;
    if (extra.dormant) r.dormant = extra.dormant;
    if (extra.sess) r.sess = extra.sess;
    /* تور ۱ (s34): امید/میلِ کم در آغاز ⇒ «🌱 کوچک‌ترین گامِ بعد» پیش از کارتِ کاملِ فهم */
    if (extra.hope === "low" || extra.hope === "mid" || extra.hope === "high") r.hope = extra.hope;
    /* تور ۱ (s15/s16): مسئلهٔ «برای کسِ دیگری» — کاربر مربی است */
    if (extra.coach) r.coach = { who: clip(txt(extra.coach.who), 60), at: nowISO() };
    S.put(r);
    var pg = pgOf(pid), s = solOf(pg); s.type = k; S.put(pg);
    return r;
  }
  A.liveCreate = create;
  /* تور ۱ (s21): ساختن از فرمِ «🔭» مسئله را به سشنِ جاریِ دستیار می‌بندد (ASSIST.cur().lprob) — همان کاری که live_new می‌کند؛ صادر شده تا دستیار هم صدایش بزند */
  A.liveBindSession = function (pid, sess) {
    var AS0 = A.ASSIST, se = sess || (AS0 && typeof AS0.cur === "function" ? AS0.cur() : null);
    if (!se || !rec(pid)) return false;
    se.lprob = pid; try { S.put(se); } catch (e) { }
    return true;
  };
  A.liveLinkSession = A.liveBindSession;   // نامِ صادرشده برای دستیار (live_new) و قلاب‌های بیرونی
  var NEW = { title: "", statement: "", kind: "find", nat: "", hope: "", coach: false, who: "" };
  var HOPE = [["high", "زیاد — می‌خواهم و امید دارم"], ["mid", "کمی"], ["low", "کم — دلسردم یا حوصله‌اش را ندارم"]];
  A.liveNewPanel = function () {
    var box = h("section", { class: "card col gap lp-new", dir: "rtl" }, h("h2", {}, "🔭 مسئلهٔ حل‌نشدهٔ خودم"),
      h("p", { class: "small" }, "تصمیمی که باید بگیری، پروژه‌ای که گیر کرده، پرسشی فکری که جوابش را نمی‌دانی — پاسخ لازم نیست. همان تونلِ حل (فهم ⇐ طرح ⇐ اجرا ⇐ بازنگری) این بار روی واقعیت: هر گامِ واقعی پیش از انجام یک پیش‌بینی دارد و روزِ موعدش در «امروز» برمی‌گردد تا ببینی چه شد. داور نه صفحه است نه هوش مصنوعی: واقعیت و داوریِ خودت."));
    box.appendChild(field("lpNewT", "عنوانِ کوتاهِ مسئله", NEW.title, function (v) { NEW.title = v; }, 0, "مثلاً «پیشنهادِ کارِ دوم را بپذیرم یا نه؟»"));
    box.appendChild(field("lpNewS", "مسئله را همان‌طور که هست بنویس: چه می‌خواهی و چه چیزی آن را سخت می‌کند (پاسخ لازم نیست)", NEW.statement, function (v) { NEW.statement = v; }, 4));
    box.appendChild(U.typeSel("lpNewType", NEW.kind, function (v) { NEW.kind = v; }));
    box.appendChild(selF("lpNewNat", "داورِ این مسئله کیست؟", Object.keys(NAT).map(function (k) { return [k, NAT[k].fa]; }), NEW.nat, function (v) { NEW.nat = v; }));
    box.appendChild(selF("lpNewHope", "الان چقدر امید یا میل داری که پیشش ببری؟ (اختیاری)", HOPE, NEW.hope, function (v) { NEW.hope = v; }));
    var whoBox = h("div", { class: NEW.coach ? "" : "hidden" }, field("lpNewWho", "او کیست؟ (نام یا نسبت — مثلاً «پسرم»، «شاگردم»)", NEW.who, function (v) { NEW.who = v; }, 0));
    box.appendChild(h("label", { class: "row gap small", for: "lpNewCoach" }, h("input", { type: "checkbox", id: "lpNewCoach", checked: NEW.coach ? true : null, onchange: function (e) { NEW.coach = e.target.checked; whoBox.classList.toggle("hidden", !NEW.coach); } }),
      "این مسئلهٔ کسِ دیگری است و من مربی، معلم یا والدش هستم (پاسخ را نمی‌گویم؛ پرسش می‌پرسم)"));
    box.appendChild(whoBox);
    var out = h("div", { "aria-live": "polite", class: "small" });
    box.appendChild(h("button", { class: "btn lp-create", type: "button", onclick: function () {
      if (txt(NEW.statement).length < 10 || (txt(NEW.title) && txt(NEW.title).length < 3)) { out.textContent = "عنوان و صورتِ مسئله را بنویس (صورت دست‌کم یک جملهٔ کامل)."; A.toast(out.textContent, "bad"); return; }
      if (NEW.coach && txt(NEW.who).length < 2) { out.textContent = "بنویس مسئلهٔ چه کسی است (نام یا نسبت)."; A.toast(out.textContent, "bad"); return; }
      var r = create(NEW.title, NEW.statement, NEW.kind, { nat: NEW.nat, hope: NEW.hope, coach: NEW.coach ? { who: NEW.who } : null }); NEW = { title: "", statement: "", kind: "find", nat: "", hope: "", coach: false, who: "" };
      A.liveBindSession(r.p.id);
      A.toast(r.hope === "low" ? "مسئله ساخته شد؛ با کوچک‌ترین گام شروع کنیم." : "مسئله ساخته شد؛ اول بفهمیمش."); A.go("lprob", r.p.id, "u");
    } }, "ساختنِ مسئلهٔ حل‌نشده"));
    box.appendChild(out);
    var wrap = h("div", { class: "col gap" }, box);
    var ls = A.liveListSection(true); if (ls) wrap.appendChild(ls);
    return wrap;
  };
  A.liveInjectNote = function () {
    return h("p", { class: "card soft small lp-injnote", dir: "rtl" }, "پاسخش را هنوز نمی‌دانی (تصمیم، پروژه، پرسشِ باز)؟ این‌جا برای مسئلهٔ حل‌شده است. ",
      h("button", { class: "btn sm ghost", type: "button", onclick: function () { A.go("e_prob", null, "live"); } }, "🔭 مسئلهٔ حل‌نشدهٔ خودم"));
  };
  function nextInfo(r) {
    var pg = S.get("eprog_" + r.p.id), s = pg && pg.solve; if (!s) return "تازه";
    solOf(pg); var ph = phaseOf(s), o = openStep(s), t = A.today();
    return PHN[ph] + (o ? " · گامِ جاری: «" + clip(o.text, 40) + "» — وارسی " + (o.due <= t ? "امروز" : A.fdate(o.due)) : "");
  }
  A.liveListSection = function (always) {
    A.liveMigrate();
    var L = lives(); if (!L.length && !always) return h("p", { class: "small muted lp-listcta", dir: "rtl" }, "مسئلهٔ واقعیِ حل‌نشده‌ای داری؟ ", h("button", { class: "linkish", type: "button", onclick: function () { A.go("e_prob", null, "live"); } }, "🔭 مسئلهٔ حل‌نشدهٔ خودم"));
    if (!L.length) return null;
    var t = A.today();
    return h("section", { class: "card lp-list", dir: "rtl" }, h("h2", {}, "🔭 مسئله‌های حل‌نشدهٔ خودم (" + fa(L.length) + ")"),
      h("div", { class: "col gap" }, L.map(function (r) {
        var dorm = r.dormant && r.dormant > t && !r.woke;
        return h("div", { class: "card soft lp-item", "data-pid": r.p.id, "data-lp-kind": A.liveNature(r.p.id) }, h("div", { class: "row between wrap" },
          h("button", { class: "linkish", type: "button", onclick: function () { A.go("lprob", r.p.id); } }, h("strong", {}, r.p.title)),
          h("span", { class: "row gap wrap" }, r.origin && r.origin.type === "lprob" ? h("span", { class: "chip" }, "ساختهٔ خودت در بازنگری") : null, dorm ? h("span", { class: "chip lp-dorm" }, "برمی‌گردد " + A.fdate(r.dormant)) : h("span", { class: "chip" }, nextInfo(r)))),
          h("p", { class: "small" }, clip(r.p.statement, 200)));
      })));
  };

  /* ---------- فهم (کارتِ فهمِ همان تونل، با فهرستِ داده‌ها) ---------- */
  function wholeWhy(d, r) {
    var o = [], one = txt(d.one), st = txt(r.p.statement);
    if (one.length < 3) o.push("«کلِ مسئله در یک جمله» را بنویس");
    else {
      if (A.kNearCopy && A.kNearCopy(one, st)) o.push("جملهٔ کل تقریباً رونوشتِ صورت است — آن را به زبانِ خودت و بی‌جزئیات بگو");
      if (one.length >= st.length) o.push("جملهٔ کل باید کوتاه‌تر از صورت باشد (بی‌جزئیات)");
      if (/[.!?؟]\s*\S/.test(one.replace(/[.!?؟\s]+$/, ""))) o.push("فقط یک جمله");
    }
    if (txt(d.why).length < 3) o.push("«چرا می‌خواهی حلش کنی» را بنویس");
    return o;
  }
  var UD = {};
  /* تور ۱ ِ پولیا — افزوده‌های کارتِ فهم (همه در همان s.u[1]؛ رکوردِ پیشین بی این فیلدها همان رفتارِ پیشین را دارد):
     • داورِ مسئله (nat) و تمایزِ «کامل‌بیان‌شده / عملی» (B093/B094/B098)، با قابِ عملی (A.KPRAC_KEYS + A.measurableCheck) برای مسئلهٔ عملی؛
       «کدام داده‌ها اثرِ محسوس دارند؟» برای هر داده، و کنار گذاشتن با دلیل (= رسیدگی‌شده، نه «به‌کارنرفته»).
     • مسئلهٔ یافتنی: «آیا شرط برآوردنی است؟ اصلاً مجهولی هست؟»؛ «کافی است» با یک داده یا با داده‌ای که هنوز معلوم نیست ⇒ چالش.
     • جدولِ نمادگذاری (نماد | معنا) با وارسیِ «یک نماد برای دو چیز» (ممنوع، B247) و «دو نماد برای یک چیز» (هشدار، B248)؛ کارتِ شکل برای مسئلهٔ
       فضایی: «فرض کن ساخته شده» (B128)، هشدارِ شکلِ خاص (B134)، و نام‌ها روی شکل.
     • فهمِ دوباره ⇒ مقایسهٔ بیان‌ها: هم‌ارز / گسترده‌تر / باریک‌تر / دیگر (داوریِ خودت، ثبت و نمایش).
     • حدس: ۱۰۰٪ یا «هیچ چیز ردش نمی‌کند» ⇒ «چه چیزی حدست را رد می‌کند؟ آن را بیازما»؛ حدسِ «دوست دارم درست باشد» با اطمینانِ ≥ ۸۰٪ ⇒ «اثبات
       یا رد کن» + قوی‌ترین شاهدِ خلاف + پروندهٔ کارخانه (همان مسیرِ ادعا ⇐ پرونده). ابزارهای حدس کامل (جدول، تفاضل‌ها، فرمول، رقیب‌ها، قیاس).
     • خودداوریِ ۰/۱/۲ پس از «ثبتِ فهم» در پیش‌نویس می‌ماند (gradePending) — با بازسازیِ صفحه گم نمی‌شود. */
  var SAT = [["yes", "بله — دست‌کم یک پاسخ هست"], ["no", "نه — شرط برآوردنی نیست (مسئله پاسخ ندارد)"], ["unknown", "هنوز نمی‌دانم"]];
  var SAT_L = "آیا شرط برآوردنی است — اصلاً مجهولی هست که همهٔ شرط را برآورد؟";
  var EFF = [["big", "اثرِ محسوس دارد"], ["small", "اثرش ناچیز است — با دلیل کنارش می‌گذارم"]];
  var RESTATE = [["eq", "هم‌ارز — همان مسئله به بیانِ دیگر"], ["wider", "گسترده‌تر — مسئلهٔ کلی‌تر (شرط یا قیدی کمتر)"], ["narrower", "باریک‌تر — مسئلهٔ خاص‌تر (شرط یا قیدی بیشتر)"], ["other", "مسئلهٔ دیگری شد"]];
  var GWANT = [["yes", "بله — دوست دارم درست باشد"], ["no", "نه"], ["neutral", "فرقی نمی‌کند"]];
  var FIGGEN = [["general", "عمومی — ویژگیِ اضافه‌ای (تساوی، قائمه، تقارن) که شرط نگفته ندارد"], ["special", "خاص — ویژگی‌ای دارد که شرط نگفته"]];
  var UNKNOWNISH = /نمی[‌\s]?دانم|نمی[‌\s]?دونم|معلوم\s*نیست|نامعلوم|هنوز|باید\s*بپرسم|مطمئن\s*نیستم|شاید|[?؟]/;
  var NOREF = /هیچ\s*(?:چیز|چیزی)?\s*(?:رد|نمی)|نمی[‌\s]?(?:تواند|تونه)\s*رد|رد\s*نمی|ردش\s*نمی|محال|غیرممکن|غیر\s*ممکن/;
  var SPATIAL = /(?:^|[^ء-یپچژکگ])(?:شکل|مثلث|دایره|زاویه|مساحت|حجم|مکعب|استوانه|کره|قطر|ضلع|ارتفاع|نقشه|اتاق|ابعاد|چیدمان|فضای)|(?:^|\s)جا\s*(?:می|نمی)?\s*(?:شه|شود|بشه|گیرد|بگیرد)(?![ء-یپچژکگ])/;
  function suffShaky(items) { return items.length === 1 || items.some(function (x) { return UNKNOWNISH.test(norm(x.t)); }); }
  function suffChalQ(items) { var un = items.filter(function (x) { return UNKNOWNISH.test(norm(x.t)); }); return items.length === 1 ? "با همین یک داده مجهول معین می‌شود؟ چطور؟" : "گفتی کافی است، ولی «" + clip(un[0] ? un[0].t : "", 50) + "» هنوز معلوم نیست — بی آن مجهول معین می‌شود؟ چطور؟"; }
  function pracParts(d, items) { var P = d.prac || {}; return { want: d.u, have: items.map(function (x) { return txt(x.t); }).join(" · "), cond: d.c, vague: P.vague, ignore: P.ignore, approx: P.approx, prior: P.prior, measure: P.measure }; }
  function notaCheck(rows) {
    var bySym = {}, byMean = {}, two = [], same = [], half = [];
    (rows || []).forEach(function (r) {
      var sy = txt(r.s), mn = txt(r.m); if (!sy && !mn) return; if (!sy || !mn) { half.push(sy || mn); return; }
      var k = sy.toLowerCase(), m = toks(mn).join(" ") || mn;
      if (bySym[k] != null && bySym[k] !== m && two.indexOf(sy) < 0) two.push(sy); if (bySym[k] == null) bySym[k] = m;
      if (byMean[m] != null && byMean[m] !== k) same.push([byMean[m], sy]); if (byMean[m] == null) byMean[m] = k;
    });
    return { two: two, same: same, half: half };
  }
  A.liveNotaCheck = notaCheck;
  function coreOf(u) { return [txt(u.one), txt(u.u), txt(u.c), (u.dl || []).map(function (x) { return txt(x.t); }).filter(Boolean).join("|")].join("#"); }
  function uCard(r, pg, s) {
    var pid = r.p.id, prev = uOf(s) || {}, fresh = !s.g || !s.g[1], hasPrev = !!uOf(s);
    var L0 = live(s);
    /* پیش‌نویسِ کارتِ فهم با بارگذاریِ دوباره گم نمی‌شود (solve.live.uDraft؛ پس از ثبت پاک می‌شود) */
    var d = UD[pid] = UD[pid] || (L0.uDraft ? JSON.parse(JSON.stringify(L0.uDraft)) : { type: typeOf(r, s), nat: prev.nat || r.p.nat || "life", one: prev.one || "", why: prev.why || "", u: prev.u || "", dl: (prev.dl || []).map(function (x) { return { id: x.id, t: x.t, eff: x.eff || "", effWhy: x.effWhy || "" }; }), c: prev.c || "", rel: prev.rel || "", suff: prev.suff || "", suffWhy: prev.suffWhy || "", suffChal: prev.suffChal || "", sat: prev.sat || "", fig: prev.fig || "", dead: prev.deadTxt || "",
      prac: JSON.parse(JSON.stringify(prev.prac || {})), nota: JSON.parse(JSON.stringify(prev.nota || [])), spatial: prev.spatial != null ? !!prev.spatial : SPATIAL.test(norm(r.p.statement)), figc: JSON.parse(JSON.stringify(prev.figc || {})), restate: "", restateWhy: "",
      guess: "", conf: "", test: "", testRes: "", ifRef: "", gWant: "", gContra: "", gChal: "" });
    if (!d.dl.length) { d.dl.push({ id: nid(s, d.dl), t: "" }); d.dl.push({ id: nid(s, d.dl), t: "" }); }
    if (d.wholeOk == null) d.wholeOk = !!prev.one;
    if (!NAT[d.nat]) d.nat = "life";
    d.prac = d.prac || {}; d.nota = d.nota || []; d.figc = d.figc || {};
    if (!d.nota.length) d.nota.push({ s: "", m: "" });
    var dTimer = null;
    function saveNow() { if (UD[pid] !== d) return; L0.uDraft = JSON.parse(JSON.stringify(d)); S.put(pg); }
    function saveDraft() { if (dTimer) clearTimeout(dTimer); dTimer = setTimeout(function () { dTimer = null; saveNow(); }, 350); }
    function rerender() { if (dTimer) { clearTimeout(dTimer); dTimer = null; } saveNow(); A.render(); }
    var T = T0(d.type), prac = d.nat === "practical";
    var box = h("section", own({ class: "card lp-u", "data-nat": d.nat }), h("div", { class: "eyebrow" }, "فهمِ مسئله" + (live(s).reU ? " — دوباره" : "")),
      h("h3", {}, "اول کل، بعد جزءها"),
      h("p", { class: "small" }, "پیش از هر کاری مسئله را بفهم و بخواهی‌اش. اول کلِ مسئله را بی‌جزئیات در یک جمله ببین؛ بعد مجهول، هر داده جدا، و شرط. هر داده را جدا بنویس — بعداً صفحه دربارهٔ هر داده‌ای که به کار نبردی، با نامش، می‌پرسد."),
      prov("u"),
      h("div", { class: "card soft small lp-stmt" }, h("strong", {}, "صورتِ خودت: "), r.p.statement));
    /* داور: کامل‌بیان‌شده / عملی / زندگی — تمایز دیده و به کار گرفته می‌شود (قابِ عملی، اجرای برهانی، پرسش‌های بازنگری) */
    box.appendChild(selF("lpNat", "داورِ این مسئله کیست — کامل‌بیان‌شده یا عملی؟", Object.keys(NAT).map(function (k) { return [k, NAT[k].fa]; }), d.nat, function (v) { d.nat = NAT[v] ? v : "life"; rerender(); }));
    box.appendChild(h("p", { class: "small muted lp-natnote" }, NAT[d.nat].note));
    var ng = natGuess(r.p.statement); if (ng && ng !== d.nat) box.appendChild(h("p", { class: "small warnline lp-nathint" }, "از صورتت به نظر می‌رسد «" + NAT[ng].fa.split(" — ")[0] + "» باشد — اگر چنین است، داور را عوض کن (تصمیم با خودت است)."));
    box.appendChild(U.typeSel("lpType", d.type, function (v) { d.type = v; rerender(); }));
    box.appendChild(field("lpOne", "۱) کلِ مسئله در یک جملهٔ کامل — بی‌جزئیات", d.one, function (v) { d.one = v; }, 0, "«می‌خواهم … ، با داشتنِ … ، به شرطِ این‌که …»"));
    box.appendChild(prov("goal"));
    box.appendChild(field("lpWhy", "۲) چرا می‌خواهی حلش کنی؟ چه چیزی در آن برایت مهم است یا کنجکاوت می‌کند؟", d.why, function (v) { d.why = v; }, 0));
    /* «اول کل»: جزءها فقط پس از ثبتِ جملهٔ کل باز می‌شوند — جمله‌ای که رونوشتِ صورت نیست، یک جمله است و کوتاه‌تر از صورت */
    if (!d.wholeOk) {
      var wout = h("div", { class: "small", "aria-live": "polite" });
      box.appendChild(h("button", { class: "btn lp-onesave", type: "button", onclick: function () {
        var w = wholeWhy(d, r); wout.innerHTML = "";
        if (w.length) { wout.appendChild(h("p", { class: "bad lp-onemiss" }, "هنوز نه: " + w.join("؛ ") + ".")); return; }
        d.wholeOk = true; L0.uDraft = JSON.parse(JSON.stringify(d)); S.put(pg); A.render();
      } }, "ثبتِ کل — حالا جزءها"));
      box.appendChild(wout);
      box.addEventListener("input", saveDraft); box.addEventListener("change", saveDraft);
      return box;
    }
    box.appendChild(field("lpUnk", "۳) " + T.u, d.u, function (v) { d.u = v; }, 2));
    var dbox = h("fieldset", { class: "col gap lp-dl" }, h("legend", {}, "۴) " + (d.type === "find" ? "داده‌ها" : "بخش‌های فرض") + " — هر کدام جدا (چیزی که می‌دانی یا در دست داری: عدد، منبع، محدودیت، آدم، زمان)"));
    if (prac) dbox.appendChild(h("p", { class: "small lp-effq" }, "مسئلهٔ عملی: «همهٔ داده‌ها» بی‌شمارند — کدام داده‌ها اثرِ محسوس دارند؟ برای هر داده بگو؛ آنچه اثرش ناچیز است با دلیل کنار می‌رود (کجا خط می‌کشی)."));
    d.dl.forEach(function (x, i) {
      dbox.appendChild(field("lpD_" + x.id, (d.type === "find" ? "دادهٔ " : "فرضِ ") + fa(i + 1), x.t, function (v) { x.t = v; }, 0));
      if (prac) {
        dbox.appendChild(selF("lpDE_" + x.id, "اثرِ دادهٔ " + fa(i + 1) + " روی مجهول", EFF, x.eff || "", function (v) { x.eff = v; rerender(); }));
        if (x.eff === "small") dbox.appendChild(field("lpDW_" + x.id, "چرا اثرش ناچیز است؟ (دلیلِ کنار گذاشتن)", x.effWhy || "", function (v) { x.effWhy = v; }, 0));
      }
    });
    dbox.appendChild(h("button", { class: "btn ghost sm lp-dadd", type: "button", onclick: function () { d.dl.push({ id: nid(s, d.dl), t: "" }); L0.uDraft = JSON.parse(JSON.stringify(d)); S.put(pg); A.render(); } }, "+ دادهٔ دیگر"));
    box.appendChild(dbox);
    box.appendChild(field("lpCond", "۵) " + T.c, d.c, function (v) { d.c = v; }, 3, "هر بخش در یک سطر"));
    box.appendChild(field("lpRel", "۶) پیوندِ جزءها: کدام داده به کدام بخشِ شرط یا به مجهول ربط دارد؟ (اختیاری)", d.rel, function (v) { d.rel = v; }, 0));
    if (d.type === "find") box.appendChild(selF("lpSat", SAT_L, SAT, d.sat, function (v) { d.sat = v; }));
    box.appendChild(selF("lpSuff", prac ? "در مسئلهٔ عملی داده‌ها هرگز کامل و دقیق نیستند: با داده‌هایی که اثرِ محسوس دارند، مجهول به‌قدرِ تقریبِ کافی معین می‌شود؟" : T.suff, ["کافی است", "ناکافی است — چیزی کم است", "زائد دارد — بخشی لازم نیست", "متناقض است", "هنوز نمی‌دانم"], d.suff, function (v) { d.suff = v; rerender(); }));
    box.appendChild(field("lpSuffW", "چرا؟ (یک جمله)", d.suffWhy, function (v) { d.suffWhy = v; }, 0));
    var items0 = d.dl.filter(function (x) { return txt(x.t); });
    if (d.suff === "کافی است" && (d.showChal || (items0.length && suffShaky(items0)))) box.appendChild(h("div", { class: "card soft col gap lp-suffchal" }, h("p", { class: "small warnline" }, "پیش از «کافی است»: " + suffChalQ(items0.length ? items0 : [{ t: "" }])),
      field("lpSuffChal", "پاسخِ تو: مجهول با همین‌ها چطور معین می‌شود؟", d.suffChal, function (v) { d.suffChal = v; }, 0)));
    if (prac) {
      var P = d.prac, pf = h("fieldset", { class: "col gap lp-prac" }, h("legend", {}, "قابِ مسئلهٔ عملی — جایی که خط می‌کشی"));
      pf.appendChild(field("lpPrVague", "کدام مفهومِ مبهم را باید پیش از هر کار روشن کنی؟", P.vague, function (v) { P.vague = v; }, 0));
      pf.appendChild(field("lpPrLine", "کجا خط می‌کشی؟ چه چیزی را عمداً بیرون می‌گذاری و تا کجا اطلاعات جمع می‌کنی — و چرا؟", P.ignore, function (v) { P.ignore = v; }, 0));
      pf.appendChild(field("lpPrApprox", "کدام تقریب بس است — جوابِ «به‌اندازهٔ کافی خوب» چقدر دقیق است؟", P.approx, function (v) { P.approx = v; }, 0));
      pf.appendChild(field("lpPrPrior", "دانشِ پیشین و تجربیِ نادقیق: از تجربهٔ خودت یا دیگران (حتی تقریبی) دربارهٔ چنین مسئله‌ای چه می‌دانی؟", P.prior, function (v) { P.prior = v; }, 0));
      var mOut = h("p", { class: "small lp-measout", "aria-live": "polite" });
      var mDraw = function () { var v = txt(P.measure); mOut.textContent = ""; if (!v || !A.measurableCheck) return; var m = A.measurableCheck(v); mOut.className = "small lp-measout " + (m.ok ? "good" : "warnline"); mOut.textContent = m.ok ? "سنجیدنی است: عدد و رابطه دارد." : "هنوز سنجیدنی نیست: " + m.why.join(" و ") + "."; };
      var mf = field("lpPrMeasure", "ریاضی‌کردن: مجهول را کمیتی با عدد/واحد و موفقیت را یک رابطه بنویس (مثلاً «طولِ لوله ≤ قطرِ قطریِ بار»)", P.measure, function (v) { P.measure = v; mDraw(); }, 0);
      var mi = mf.querySelector("input"); if (mi) mi.setAttribute("dir", "auto");
      pf.appendChild(mf); pf.appendChild(mOut); mDraw();
      box.appendChild(pf);
    }
    box.appendChild(field("lpDead", "مهلتِ خودِ مسئله، اگر هست — تا کی باید حل یا تصمیم شود؟ (اختیاری؛ گام‌ها پس از آن پذیرفته نمی‌شوند)", d.dead, function (v) { d.dead = v; }, 0, "مثلاً «۱۲ آذر» یا «۱۰ روزِ دیگر»"));
    box.appendChild(field("lpFig", "شکل، جدول یا نمودار — حتی برای مسئلهٔ غیرهندسی (ستون‌های جدولت، محورهای نمودارت، نام‌هایی که می‌گذاری)", d.fig, function (v) { d.fig = v; }, 0));
    /* نمادگذاری: جدولِ دو ستونی؛ نمادِ یکسان برای دو چیز ممنوع، دو نماد برای یک چیز با احتیاط */
    var nt = h("fieldset", { class: "col gap lp-nota" }, h("legend", {}, "نمادگذاری (اختیاری): هر نام یا نماد و معنایش"),
      h("p", { class: "small muted" }, "نام‌گذاری وادارت می‌کند به خودِ چیزها نگاه کنی. یک نماد فقط برای یک چیز؛ برای چیزهای مرتبط، نمادهای مرتبط (حرفِ اول، یا a/b و x/y)."));
    var ntb = h("tbody", {});
    d.nota.forEach(function (row, i) {
      ntb.appendChild(h("tr", {}, h("td", {}, h("input", { type: "text", id: "lpNS_" + i, class: "lp-ns", dir: "auto", "aria-label": "نمادِ " + fa(i + 1), value: row.s || "", oninput: function (e) { row.s = e.target.value; } })),
        h("td", {}, h("input", { type: "text", id: "lpNM_" + i, class: "lp-nm", "aria-label": "معنای نمادِ " + fa(i + 1), value: row.m || "", oninput: function (e) { row.m = e.target.value; } }))));
    });
    nt.appendChild(h("table", { class: "small lp-notatab" }, h("thead", {}, h("tr", {}, h("th", {}, "نماد"), h("th", {}, "معنا"))), ntb));
    nt.appendChild(h("button", { class: "btn ghost sm lp-nadd", type: "button", onclick: function () { d.nota.push({ s: "", m: "" }); rerender(); } }, "+ نمادِ دیگر"));
    box.appendChild(nt);
    /* کارتِ شکل برای مسئلهٔ فضایی */
    box.appendChild(h("label", { class: "row gap small", for: "lpSpatial" }, h("input", { type: "checkbox", id: "lpSpatial", checked: d.spatial ? true : null, onchange: function (e) { d.spatial = e.target.checked; rerender(); } }), "مسئلهٔ فضایی یا هندسی است (شکل، اندازه، جا دادن، مسیر)"));
    if (d.spatial) {
      var F = d.figc, fg = h("fieldset", { class: "col gap lp-figc" }, h("legend", {}, "شکل: فرض کن ساخته شده"),
        h("p", { class: "small warnline lp-figwarn" }, "شکل نباید حالتِ خاصی را القا کند: مثلث را متساوی‌الساقین یا قائم‌الزاویه، و چهارضلعی را مربع نکش مگر شرط بگوید — شکلِ خاص نتیجهٔ خاص می‌دهد. شکل کمک است، نه مبنای نتیجه."));
      fg.appendChild(field("lpFigDone", "فرض کن آنچه خواسته شده ساخته شده و همهٔ شرط برقرار است: شکلش را بکش یا تصور کن — چه می‌بینی و مجهول کجای شکل است؟", F.done, function (v) { F.done = v; }, 2));
      fg.appendChild(selF("lpFigGen", "شکلت عمومی است یا حالتی خاص؟", FIGGEN, F.gen || "", function (v) { F.gen = v; rerender(); }));
      if (F.gen === "special") fg.appendChild(field("lpFigGenW", "کدام ویژگی خاص است و چرا شرط آن را می‌گوید — یا شکل را عمومی کن", F.genWhy, function (v) { F.genWhy = v; }, 0));
      fg.appendChild(field("lpFigLab", "نام‌ها روی شکل: مجهول و هر داده با چه نامی روی شکل نشسته‌اند؟", F.lab, function (v) { F.lab = v; }, 0));
      box.appendChild(fg);
    }
    /* فهمِ دوباره ⇒ مقایسهٔ بیانِ تازه با پیشین */
    if (hasPrev) {
      var rs = h("div", { class: "card soft col gap lp-restate" }, h("p", { class: "small" }, "فهمِ پیشینت: «" + clip(prev.one, 120) + "» — مجهول: «" + clip(prev.u, 80) + "»"),
        selF("lpRestate", "اگر فهمت را عوض کردی، بیانِ تازه نسبت به پیشین چیست؟", RESTATE, d.restate, function (v) { d.restate = v; }),
        field("lpRestateW", "چه چیزی عوض شد و چرا؟", d.restateWhy, function (v) { d.restateWhy = v; }, 0));
      box.appendChild(rs);
    }
    if (fresh) {
      box.appendChild(h("h4", {}, "پیش از حل: حدس بزن"));
      box.appendChild(h("p", { class: "small" }, "حدسِ صریح، با اطمینان و آزمونی که می‌تواند ردش کند — نه پذیرفتنِ بی‌آزمون، نه کنار گذاشتن. در بازنگری با آنچه واقعاً شد مقایسه می‌شود."));
      box.appendChild(field("lpGuess", "حدست دربارهٔ پاسخ (یا تصمیمِ درست) چیست؟", d.guess, function (v) { d.guess = v; }, 2));
      box.appendChild(selF("lpConf", "چقدر به حدست مطمئنی؟", ["50", "60", "70", "80", "90", "100"].map(function (x) { return [x, fa(x) + "٪"]; }), d.conf, function (v) { d.conf = v; rerender(); }));
      box.appendChild(field("lpTest", "آزمونِ حدس: چه چیزی (مشاهده، پرسش از کسی، حالتِ خاص) می‌تواند ردش کند؟", d.test, function (v) { d.test = v; }, 2));
      if (d.conf === "100" || NOREF.test(norm(d.test)) || d.showGChal) box.appendChild(h("div", { class: "card soft col gap lp-gchal" }, h("p", { class: "small warnline" }, "حدسی که «صددرصد» است یا «هیچ چیز ردش نمی‌کند» هنوز حدس نیست، باور است — یقین فقط از برهان می‌آید. چه چیزی حدست را رد می‌کند؟ آن را بیازما."),
        field("lpGChal", "یک مشاهده یا حالتِ مشخص که اگر رخ دهد حدست رد می‌شود — و کِی آن را می‌آزمایی", d.gChal, function (v) { d.gChal = v; }, 0)));
      box.appendChild(selF("lpIfRef", "اگر آزمون حدس را رد کند، چه می‌کنی؟", ["حدس را کنار می‌گذارم یا اصلاحش می‌کنم", "آزمون را نادیده می‌گیرم چون حدسم قوی است", "حدس را بی‌تغییر نگه می‌دارم و دیگر نمی‌آزمایم"], d.ifRef, function (v) { d.ifRef = v; }));
      box.appendChild(selF("lpGWant", "دوست داری حدست درست باشد؟", GWANT, d.gWant, function (v) { d.gWant = v; rerender(); }));
      if (d.gWant === "yes" && +d.conf >= 80) box.appendChild(h("div", { class: "card soft col gap lp-gwant" }, prov("want"),
        h("p", { class: "small" }, "حدسی که دوستش داری و به آن مطمئنی «اثبات یا رد کن» می‌شود: قوی‌ترین شاهدِ خلافش را بنویس؛ با ثبتِ فهم، یک پروندهٔ سنجش در کارخانه می‌گیرد."),
        field("lpGContra", "قوی‌ترین شاهدِ خلاف: چه چیزی، اگر درست باشد، این حدس را رد می‌کند؟", d.gContra, function (v) { d.gContra = v; }, 0)));
      if (A.solveKitUI) { d.kit = d.kit || A.solveBlankKit(); box.appendChild(A.solveKitUI(d.kit, { idp: "lpGK", problem: r.p.statement, parts: ["table", "formula", "rivals", "ana"], noDim: true, drills: false, title: "ابزارهای حدس: جدولِ حالت‌ها، تفاضل‌ها، حدسِ دقیق، حدس‌های رقیب و قیاس",
        intro: "حدس را از کجا آوردی؟ چند حالتِ خاص را خودت حساب یا مشاهده کن (جدول؛ کد تفاضل‌های پیاپی را می‌سازد)، حدس را دقیق بنویس (فرمول؛ کد با هر حالت می‌سنجد، با دقتی که خودت نوشتی)، دست‌کم یک حدسِ رقیب با آزمونِ جداکننده، و موردِ آشنای مشابه (قیاس). درستیِ قیاس را خودت می‌آزمایی." })); }
    }
    box.appendChild(U.planList(d.type));
    var out = h("div", { "aria-live": "polite", class: "col gap lp-uout" });
    function vald() {
      var items = d.dl.filter(function (x) { return txt(x.t); }), miss = wholeWhy(d, r).concat([[d.u, T.u], [d.c, T.c]].filter(function (x) { return txt(x[0]).length < 3; }).map(function (x) { return "«" + x[1] + "»"; })), warn = [];
      if (!items.length) miss.push("«دست‌کم یک داده»");
      if (d.type === "find" && !d.sat) miss.push("«" + SAT_L + "»");
      if (!d.suff) miss.push("«" + T.suff + "»");
      if (d.suff === "کافی است" && items.length && suffShaky(items) && toks(d.suffChal).length < 3) { d.showChal = true; miss.push("پاسخ به «" + suffChalQ(items) + "»"); }
      if (prac) {
        items.forEach(function (x) { if (!x.eff) miss.push("اثرِ «" + clip(x.t, 30) + "» (محسوس یا ناچیز)"); else if (x.eff === "small" && toks(x.effWhy).length < 2) miss.push("دلیلِ کنار گذاشتنِ «" + clip(x.t, 30) + "»"); });
        var fr = A.practicalFrameCheck && A.KPRAC_KEYS ? A.practicalFrameCheck(pracParts(d, items), A.KPRAC_KEYS) : null;
        if (fr && !fr.ok) { fr.missing.forEach(function (k) { if (["want", "have", "cond"].indexOf(k[0]) < 0) miss.push("«" + k[1] + "»"); }); fr.dup.forEach(function (x) { miss.push("«" + x + "» تکرارِ جزءِ دیگری است"); }); if (fr.unmeasured) miss.push("«ریاضی‌کردن» هنوز سنجیدنی نیست: " + fr.unmeasured.join(" و ")); }
      }
      var nc = notaCheck(d.nota);
      nc.half.forEach(function (x) { miss.push("نمادگذاری: «" + x + "» نماد یا معنایش را کم دارد"); });
      nc.two.forEach(function (x) { miss.push("نمادگذاری: «" + x + "» برای دو چیزِ متفاوت آمده — یک نماد فقط برای یک چیز"); });
      nc.same.forEach(function (x) { warn.push("«" + x[0] + "» و «" + x[1] + "» یک چیزند — دو نماد برای یک چیز جایز است ولی با احتیاط؛ اگر لازم نیست یکی را بردار."); });
      if (d.spatial) { var F2 = d.figc || {}; if (toks(F2.done).length < 3) miss.push("«فرض کن ساخته شده»"); if (!F2.gen) miss.push("«شکلت عمومی است یا خاص؟»"); else if (F2.gen === "special" && toks(F2.genWhy).length < 2) miss.push("«کدام ویژگیِ شکل خاص است و چرا»"); if (txt(F2.lab).length < 2) miss.push("«نام‌ها روی شکل»"); }
      if (hasPrev) { var cur = { one: d.one, u: d.u, c: d.c, dl: items }; if (coreOf(cur) !== coreOf(prev)) { if (!d.restate) miss.push("«بیانِ تازه نسبت به پیشین» (هم‌ارز، گسترده‌تر، باریک‌تر یا دیگر)"); else if (toks(d.restateWhy).length < 2) miss.push("«چه چیزی عوض شد و چرا؟»"); } }
      if (fresh && !txt(d.guess)) miss.push("«حدس»");
      if (fresh && txt(d.guess) && !txt(d.test)) miss.push("«آزمونِ حدس»");
      if (fresh && txt(d.guess) && !d.conf) miss.push("«اطمینان به حدس»");
      if (fresh && txt(d.guess) && (d.conf === "100" || NOREF.test(norm(d.test))) && (toks(d.gChal).length < 3 || NOREF.test(norm(d.gChal)))) { d.showGChal = true; miss.push("«چه چیزی حدست را رد می‌کند؟»"); }
      if (fresh && txt(d.guess) && d.gWant === "yes" && +d.conf >= 80 && toks(d.gContra).length < 2) miss.push("«قوی‌ترین شاهدِ خلافِ حدس»");
      var DW = !txt(d.dead) ? null : prev.deadTxt === txt(d.dead) && prev.deadline ? { date: prev.deadline } : A.willWhen(d.dead);
      if (txt(d.dead) && !(DW && DW.date && !DW.past)) miss.push("«مهلت» (روزِ مشخص و نگذشته بنویس، یا خالی بگذار)");
      return { miss: miss, warn: warn, items: items, DW: DW };
    }
    function commit(v, V) {
      var L = live(s), items = V.items, DW = V.DW, at = nowISO();
      if (uOf(s)) { L.uHist = L.uHist || []; L.uHist.push(JSON.parse(JSON.stringify(s.u[1]))); }
      s.type = d.type; r.p.kind = d.type;
      s.u[1] = { type: d.type, nat: d.nat, one: txt(d.one), why: txt(d.why), u: txt(d.u), d: items.map(function (x) { return txt(x.t); }).join(" · "),
        dl: items.map(function (x) { var o = { id: x.id, t: txt(x.t) }; if (d.nat === "practical" && x.eff) { o.eff = x.eff; if (x.eff === "small") o.effWhy = txt(x.effWhy); } return o; }),
        c: txt(d.c), rel: txt(d.rel), suff: d.suff, suffWhy: txt(d.suffWhy), fig: txt(d.fig), deadTxt: txt(d.dead), deadline: DW && DW.date || null, self: v, at: at, done: true, from: "live" };
      var U1 = s.u[1];
      if (d.type === "find" && d.sat) U1.sat = d.sat;
      if (txt(d.suffChal) && d.suff === "کافی است") U1.suffChal = txt(d.suffChal);
      if (d.nat === "practical") { U1.prac = { vague: txt(d.prac.vague), ignore: txt(d.prac.ignore), approx: txt(d.prac.approx), prior: txt(d.prac.prior), measure: txt(d.prac.measure) };
        U1.pracCard = prev.pracCard || null;
        if (!U1.pracCard && A.practicalFrameCard && A.KPRAC_KEYS) { var pp = pracParts(d, items), cd0 = A.practicalFrameCard(r.p.title, A.KPRAC_KEYS.map(function (k) { return [k[1], txt(pp[k[0]])]; }), "lprob:practical"); if (cd0) U1.pracCard = cd0.id; } }
      var nrows = (d.nota || []).filter(function (x) { return txt(x.s) && txt(x.m); }).map(function (x) { return { s: txt(x.s), m: txt(x.m) }; }); if (nrows.length) U1.nota = nrows;
      U1.spatial = !!d.spatial;
      if (d.spatial) U1.figc = { done: txt(d.figc.done), gen: d.figc.gen, genWhy: txt(d.figc.genWhy), lab: txt(d.figc.lab) };
      if (hasPrev && d.restate) { U1.restate = { rel: d.restate, why: txt(d.restateWhy), prevOne: prev.one, prevU: prev.u, at: at }; (L.restates = L.restates || []).push(U1.restate); }
      U.seed(s, "u");
      if (fresh) {
        s.g[1] = { guess: txt(d.guess), conf: +d.conf || null, test: txt(d.test), testRes: "", ifRef: d.ifRef, before: true, seen: false, at: at, from: "live" };
        if (txt(d.gChal)) s.g[1].chal = txt(d.gChal);
        if (d.gWant) s.g[1].want = d.gWant;
        if (d.kit && A.solveKitEmpty && !A.solveKitEmpty(d.kit)) s.g[1].kit = U.kitCopy(d.kit);
        U.seed(s, "g");
        /* حدسِ دلخواهِ مطمئن ⇒ «اثبات یا رد کن» در کارخانه (همان مسیرِ ادعا ⇐ پرونده) */
        if (d.gWant === "yes" && +d.conf >= 80 && txt(d.gContra) && A.newCase) {
          s.g[1].contra = txt(d.gContra);
          var cs = A.newCase({ title: clip("اثبات یا رد کن: " + txt(d.guess), 70), input: "اثبات یا رد کن: " + txt(d.guess) + "\nقوی‌ترین شاهدِ خلاف: " + txt(d.gContra), src: { type: "lprob", id: pid } });
          if (cs) { L.claims.push({ t: txt(d.guess), caseId: cs.id, at: at, pod: true, contra: txt(d.gContra), from: "guess" }); s.g[1].caseId = cs.id; }
        }
      }
      items.forEach(function (x) { L.dSeq = Math.max(L.dSeq || 0, idNum(x.id)); });
      L.reU = false; delete L.uDraft; if (r.dormant && !r.woke) r.woke = nowISO(); S.put(r); S.put(pg); delete UD[pid]; if (dTimer) clearTimeout(dTimer);
      A.toast("فهمت ثبت شد؛ از فردا بی‌نگاه مرور می‌شود."); A.go("lprob", pid, "plan");
    }
    function showGrade(V) {
      out.innerHTML = "";
      V.warn.forEach(function (w) { out.appendChild(h("p", { class: "small warnline lp-uwarn" }, w)); });
      out.appendChild(h("div", { class: "card soft small lp-ugrade" }, h("p", {}, h("strong", {}, "صورتِ خودت: "), r.p.statement),
        h("p", {}, "۲ = مجهول، همهٔ داده‌ها و همهٔ بخش‌های شرط آمده و با صورت می‌خواند؛ ۱ = چیزی جا افتاد یا مبهم بود؛ ۰ = صورت چیزِ دیگری می‌گوید."),
        h("p", { class: "muted" }, "ثبتِ فهم تا این داوری را نکنی تمام نمی‌شود — با بازسازیِ صفحه هم همین‌جا می‌ماند.")));
      out.appendChild(U.gradeBtns(function (v) { var V2 = vald(); if (V2.miss.length) { d.gradePending = false; saveNow(); A.toast("اول این‌ها را بنویس: " + V2.miss.join("، "), "bad"); A.render(); return; } commit(v, V2); }, "فهمت با صورتی که نوشتی چقدر می‌خواند؟"));
    }
    var saveBtn = h("button", { class: "btn lp-usave", type: "button", onclick: function () {
      var V = vald();
      if (V.miss.length) { d.gradePending = false; d.lastMiss = V.miss; A.toast("اول این‌ها را بنویس: " + V.miss.join("، "), "bad"); if ((d.showChal && !box.querySelector(".lp-suffchal")) || (d.showGChal && !box.querySelector(".lp-gchal"))) { rerender(); return; } out.innerHTML = ""; out.appendChild(h("p", { class: "bad small lp-umiss" }, "هنوز نه: " + V.miss.join("، "))); return; }
      d.lastMiss = null; d.gradePending = true; saveNow(); saveBtn.disabled = true; showGrade(V);
    } }, "ثبتِ فهم");
    box.appendChild(saveBtn);
    box.appendChild(out);
    if (d.gradePending) { var V0 = vald(); if (V0.miss.length) d.gradePending = false; else { saveBtn.disabled = true; showGrade(V0); } }
    else if (d.lastMiss && d.lastMiss.length) out.appendChild(h("p", { class: "bad small lp-umiss" }, "هنوز نه: " + d.lastMiss.join("، ")));
    box.addEventListener("input", saveDraft); box.addEventListener("change", saveDraft);
    return box;
  }
  var RESTATE_FA = {}; RESTATE.forEach(function (x) { RESTATE_FA[x[0]] = x[1].split(" — ")[0]; });
  function uSum(s) {
    var u = uOf(s); if (!u) return null; var T = T0(u.type), L = live(s);
    var o = h("div", { class: "small lp-usum" }, h("p", { class: "muted lp-natsum" }, "داور: " + NAT[u.nat || "life"].fa.split(" — ")[0]), h("p", {}, h("strong", {}, "کل: "), u.one), h("p", {}, h("strong", {}, T.u + " "), u.u),
      h("ul", {}, (u.dl || []).map(function (x) { return h("li", {}, x.t + (x.eff === "small" ? " — کنار گذاشته (اثرِ ناچیز): " + (x.effWhy || "") : x.eff === "big" ? " — اثرِ محسوس" : "")); })), h("p", {}, h("strong", {}, "شرط: "), u.c), u.why ? h("p", { class: "muted" }, "چرا برایت مهم است: " + u.why) : null);
    if (u.prac) o.appendChild(h("p", { class: "lp-pracsum" }, "خط کشیدی: " + (u.prac.ignore || "—") + " · تقریبِ کافی: " + (u.prac.approx || "—")));
    if ((u.nota || []).length) o.appendChild(h("table", { class: "small lp-notasum" }, h("tbody", {}, u.nota.map(function (x) { return h("tr", {}, h("td", { dir: "auto" }, x.s), h("td", {}, x.m)); }))));
    if (u.figc) o.appendChild(h("p", { class: "lp-figsum" }, "شکل (فرض کن ساخته شده): " + u.figc.done + (u.figc.gen === "special" ? " — حالتِ خاص: " + (u.figc.genWhy || "") : " — عمومی")));
    var rs = (L.restates || []); if (rs.length) o.appendChild(h("ul", { class: "lp-restsum" }, rs.map(function (x) { return h("li", {}, "بیانِ تازه نسبت به «" + clip(x.prevOne, 60) + "»: " + (RESTATE_FA[x.rel] || x.rel) + " — " + x.why); })));
    return o;
  }

  /* ---------- طرح: پرسشِ همین لحظه، یکی‌یکی، از کلی به خاص ---------- */
  var AD = {};
  function askCard(r, pg, s) {
    var pid = r.p.id, t = typeOf(r, s), Q = A.solveAskList ? A.solveAskList("p", 1, t) : [];
    if (!Q.length) return null;
    var tut = pg.tut = pg.tut || {}; tut.qi = tut.qi || {};
    /* هر مسئلهٔ تازه از پرسشی آغاز می‌کند که کمتر از همه ورزیده شده (پایین‌ترین پلهٔ نردبان؛ در برابری، کلی‌ترین) و از آن‌جا به ترتیبِ کلی ⇐ خاص
       جلو می‌رود — نه همیشه از پرسشِ ۱؛ پرسش‌هایی که از آنِ خودت شده‌اند در چرخه با «اول خودت بپرس» می‌آیند */
    if (tut.qi.lplan == null) { var best = 0, br = Infinity; Q.forEach(function (q, i) { var rg = A.qRung ? A.qRung(q) : 0; if (rg < br) { br = rg; best = i; } }); tut.qi.lplan = best; S.put(pg); }
    var qi = (tut.qi.lplan || 0) % Q.length, q = Q[qi], P = tut.plan = tut.plan || [];
    /* تور ۱ ِ پولیا (s30): خواندنِ مکانیکی — سه پاسخِ پیاپیِ یکسان یا تقریباً خالی (مثلاً «کمک نکرد»)، یا سه «کمک نکرد» در داوری، یا رسیدن به
       تهِ فهرست (دورِ دوم بی‌صدا آغاز نمی‌شود) ⇒ هشدارِ «پرسش‌ها را مکانیکی نخوان» و «کدام پرسش واقعاً حالا می‌خواند؟» (A164) */
    var rt = roteState(pg, s, Q);
    if (rt) return roteCard(r, pg, s, Q, rt);
    var cur = P.filter(function (e) { return e && e.src === "live" && e.qi === qi && e.q === q && !e.skip; }).pop();
    var box = h("section", own({ class: "card soft lp-ask", "data-qi": qi }), h("div", { class: "eyebrow" }, "❔ پرسشِ همین لحظه (طرح‌ریزی) · پرسشِ " + fa(qi + 1) + " از " + fa(Q.length) + " — از کلی به خاص"));
    function next() { tut.qi.lplan = (tut.qi.lplan || 0) + 1; S.put(pg); delete AD[pid]; A.render(); }
    var u = uOf(s); if (u && u.u) box.appendChild(h("p", { class: "small sv-goal" }, "🎯 هدف را گم نکن — " + (t === "find" ? "مجهول" : "حکم") + ": «" + clip(u.u, 140) + "»"));
    if (cur && cur.self == null) {
      box.appendChild(h("p", {}, h("strong", {}, "پرسش: "), q));
      box.appendChild(h("p", { class: "small" }, "پاسخت: «" + cur.text + "»"));
      box.appendChild(U.gradeBtns(function (v) { cur.self = v; cur.selfAt = nowISO(); cur.selfD = A.today(); S.put(pg); A.render(); }, "این پرسش راهی باز کرد؟"));
      return box;
    }
    if (cur) {
      box.appendChild(h("p", {}, h("strong", {}, "پرسش: "), q));
      box.appendChild(h("p", { class: "small" }, "پاسخت: «" + cur.text + "» · کمک کرد: " + ["نه", "تاحدی", "بله"][cur.self]));
      box.appendChild(h("button", { class: "btn sm lp-asknext", type: "button", onclick: next }, "پرسشِ بعد (کمی خاص‌تر)"));
      return box;
    }
    var gate = A.solveSelfAskGate ? A.solveSelfAskGate(pg, q, { lv: 1, sid: "live:" + qi, ph: "p", src: "live", onSkip: function () { P.push({ at: nowISO(), d: A.today(), q: q, qi: qi, skip: true, lv: 1, sid: "live:" + qi, ph: "p", src: "live" }); next(); } }) : null;
    if (gate && !gate.done) { box.appendChild(h("h4", {}, "اول خودت بپرس")); box.appendChild(gate.el); return box; }
    if (gate) box.appendChild(gate.el);
    var d = AD[pid] = AD[pid] || { a: "", data: [] };
    box.appendChild(h("p", { class: "lp-q" }, h("strong", {}, "پرسش: "), q));
    var rung = A.qRung ? A.qRung(q) : 0, nUse = A.qUses ? A.qUses(q).length : 0;
    box.appendChild(h("p", { class: "small muted" }, "چرا این پرسش؟ " + (t === "find" ? U.WHY.p : "طرحِ اثبات از پیوندِ فرض و حکم درمی‌آید؛ پرسش‌ها از آشنا به دور و از کل به جزء می‌روند.") + " اگر با وضعِ همین لحظه نمی‌خواند، نپرس — پرسشِ بعد را بگیر." + (nUse ? " این پرسش را " + fa(nUse) + " بار به کار برده‌ای (پلهٔ " + fa(rung) + " از نردبان؛ از پلهٔ " + fa(A.Q_OWN_RUNG) + " اول خودت می‌پرسی)." : "")));
    box.appendChild(field("lpAsk", "پاسخِ کوتاهِ تو (به قلمِ خودت)", d.a, function (v) { d.a = v; }, 2));
    var tk = dataTicks(s, "lpAD_", d.data); if (tk) box.appendChild(tk);
    box.appendChild(h("div", { class: "row gap wrap" },
      h("button", { class: "btn sm lp-askgo", type: "button", onclick: function () {
        if (!txt(d.a)) { A.toast("پاسخِ کوتاهت را بنویس — یا «پرسشِ بعد» اگر این پرسش حالا نمی‌خواند.", "bad"); return; }
        P.push({ at: nowISO(), d: A.today(), q: q, qi: qi, text: txt(d.a), data: d.data.slice(), lv: 1, sid: "live:" + qi, ph: "p", src: "live" }); S.put(pg); delete AD[pid]; A.render();
      } }, "ثبتِ پاسخ"),
      h("button", { class: "btn ghost sm lp-askskip", type: "button", onclick: function () { P.push({ at: nowISO(), d: A.today(), q: q, qi: qi, skip: true, lv: 1, sid: "live:" + qi, ph: "p", src: "live" }); next(); } }, "این پرسش حالا نمی‌خواند — پرسشِ بعد")));
    var done = P.filter(function (e) { return e && e.src === "live" && !e.skip && e.text; });
    if (done.length) box.appendChild(h("details", { class: "small lp-askhist" }, h("summary", {}, "پرسش‌هایی که تا حالا پرسیدی (" + fa(done.length) + ")"),
      h("ul", {}, done.map(function (e) { return h("li", {}, "«" + e.q + "» ⇐ «" + e.text + "»" + (e.self != null ? " · کمک: " + ["نه", "تاحدی", "بله"][e.self] : "")); }))));
    return box;
  }

  function roteState(pg, s, Q) {
    var tut = pg.tut || {}, qiS = tut.qi || {}, L = live(s), P = (tut.plan || []).filter(function (e) { return e && e.src === "live" && !e.skip && e.text; });
    var last = P.slice(-3), key = last.map(function (e) { return e.at; }).join("|");
    var same = last.length === 3 && last.every(function (e) { return toks(e.text).join(" ") === toks(last[0].text).join(" "); });
    var empty = last.length === 3 && last.every(function (e) { return toks(e.text).length <= 2; });
    var noHelp = last.length === 3 && last.every(function (e) { return e.self === 0; });
    if ((same || empty || noHelp) && L.roteAck !== key) return { kind: "rote", key: key, why: same ? "سه پاسخِ پیاپیت یکسان بود" : empty ? "سه پاسخِ پیاپیت تقریباً خالی بود" : "سه پرسشِ پیاپی، به داوریِ خودت، کمکی نکرد" };
    var rounds = Math.floor((qiS.lplan || 0) / Q.length);
    if (rounds > (qiS.lwrap || 0)) return { kind: "wrap", rounds: rounds, why: "همهٔ " + fa(Q.length) + " پرسشِ این فهرست را یک دور رفتی" };
    return null;
  }
  A.liveRote = function (pid) { var r = rec(pid); if (!r) return null; var pg = pgOf(pid), s = solOf(pg); return roteState(pg, s, A.solveAskList ? A.solveAskList("p", 1, typeOf(r, s)) : []); };
  var RD0 = {};
  function roteCard(r, pg, s, Q, rt) {
    var pid = r.p.id, L = live(s), tut = pg.tut, d = RD0[pid] = RD0[pid] || { pick: "", why: "" };
    var box = h("section", own({ class: "card soft lp-ask lp-rote", "data-rote": rt.kind }), h("div", { class: "eyebrow" }, "❔ پرسشِ همین لحظه (طرح‌ریزی) — ایست"),
      h("h4", {}, "پرسش‌ها را مکانیکی نخوان"),
      h("p", { class: "small warnline" }, rt.why + ". این فهرست ابزار است، نه آیین: هر روشِ خشک و مکانیکی بد است — پرسشی بپرس که با وضعِ همین لحظه می‌خواند، و اگر هیچ‌کدام نمی‌خواند، مسئله را از زاویهٔ دیگری ببین."),
      selF("lpRotePick", "کدام پرسش واقعاً با وضعِ همین لحظهٔ مسئله می‌خواند؟", Q.map(function (q, i) { return [String(i), clip(q, 90)]; }).concat([["none", "هیچ‌کدام — مسئله را از زاویهٔ دیگری می‌بینم"]]), d.pick, function (v) { d.pick = v; }),
      field("lpRoteWhy", "چرا همین — در وضعِ همین لحظه؟ (به زبانِ خودت)", d.why, function (v) { d.why = v; }, 0));
    box.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn sm lp-rotego", type: "button", onclick: function () {
      if (!d.pick || toks(d.why).length < 2) { A.toast("پرسشی را برگزین و بگو چرا همین حالا می‌خواند.", "bad"); return; }
      (L.rote = L.rote || []).push({ at: nowISO(), d: A.today(), kind: rt.kind, why: txt(d.why), pick: d.pick === "none" ? "" : Q[+d.pick] });
      if (rt.kind === "rote") L.roteAck = rt.key;
      tut.qi = tut.qi || {}; var base = Math.floor((tut.qi.lplan || 0) / Q.length);
      tut.qi.lwrap = base;
      if (d.pick !== "none") tut.qi.lplan = base * Q.length + (+d.pick);
      delete RD0[pid]; S.put(pg);
      if (d.pick === "none") { L.reU = true; S.put(pg); A.go("lprob", pid, "u"); return; }
      A.render();
    } }, "همین را می‌پرسم"),
      h("button", { class: "btn ghost sm lp-rotestuck", type: "button", onclick: function () { stuck(r, pg, s, null); } }, "🪢 گره‌گشا با همین مسئله")));
    return box;
  }

  /* ---------- مسئلهٔ مرتبط: از مسئله‌ها، موقعیت‌ها، ایده‌ها و پرونده‌های خودت (شباهتِ واژه‌ها با کد) ---------- */
  function candidates(pid) {
    var o = [];
    lives().forEach(function (r) { if (r.p.id !== pid) o.push({ type: "eprob", id: r.id, fa: "🔭 " + r.p.title, t: [r.p.title, r.p.statement].join(" "), go: ["lprob", r.p.id] }); });
    (A.probsMine ? A.probsMine() : []).forEach(function (p) { o.push({ type: "eprob", id: "eprob_" + p.id, fa: "🧗 " + p.title, t: [p.title, p.statement, p.answer].join(" "), go: ["e_prob", p.id] }); });
    S.all("kcase").forEach(function (k) { var it = k.intake || {}; o.push({ type: "kcase", id: k.id, fa: "🪢 " + (k.title || "موقعیت"), t: [k.title, it.what, it.expected, it.actual, it.thoughts, it.claim, it.statement].join(" "), go: ["kcase", k.id] }); });
    S.all("idea").forEach(function (x) { o.push({ type: "idea", id: x.id, fa: "💡 " + (x.title || "ایده"), t: [x.title, x.what].concat((x.parts || []).map(function (p) { return p.t; })).join(" "), go: ["idea", x.id] }); });
    S.all("case", function (c) { return !c.sample; }).forEach(function (c) { var d = c.st && c.st.st_intake && c.st.st_intake.data || {}; o.push({ type: "case", id: c.id, fa: "🏭 " + (c.title || "پرونده"), t: [c.title, d.input].join(" "), go: ["e_case", c.id] }); });
    return o;
  }
  /* شباهتِ «مسئلهٔ مرتبط»: عدد و واژه‌های عامِ مقدار و زمان («دو»، «کم»، «ماهانه»، «روز»…) شباهت نمی‌سازند؛ دست‌کم دو واژهٔ معنادارِ مشترک (بازبینیِ دورِ ۶) */
  var SIMSTOP = " یک دو سه چهار پنج شش هفت هشت نه ده صد هزار میلیون میلیارد تومان کم زیاد بیش بیشتر کمتر خیلی کمی تا روز روزه روزانه هفته هفتگی ماه ماهی ماهیانه ماهانه سال سالی سالانه روزی ساعت دقیقه بار اول دوم آخر وقت زمان امروز فردا دیروز همیشه هرگز گاهی هنوز دانم دونم دانی دانیم باید نباید خواهم خواستم کنم شد شده ";
  function toksSim(t) { return toks(t).filter(function (w) { return !/\d/.test(w) && SIMSTOP.indexOf(" " + w + " ") < 0 && w.length >= 3 && !/^[بن][ء-يپچژکگی]{2,}(?:م|یم|ی|د|ید|ند)$/.test(w); }); }   // فعلِ التزامی/منفی («بگیرم»، «نکنیم») موضوع نیست
  A.liveToksSim = toksSim;
  A.liveRelated = function (pid, n) {
    var r = rec(pid); if (!r) return [];
    var pg = pgOf(pid), s = solOf(pg), u = uOf(s) || {};
    var a = toksSim([r.p.title, r.p.statement, u.u, u.d, u.c].join(" "));
    return candidates(pid).map(function (c) { var b = toksSim(c.t), sh = a.filter(function (w) { return hit(w, b); }); return { c: c, sh: sh, s: sh.length / Math.sqrt((a.length || 1) * (b.length || 1)) }; })
      .filter(function (x) { return x.sh.length >= 2; }).sort(function (x, y) { return y.sh.length - x.sh.length || y.s - x.s; }).slice(0, n || 3);
  };
  var RD = {};
  function relatedCard(r, pg, s) {
    var pid = r.p.id, L = live(s), R = A.liveRelated(pid, 3), d = RD[pid] = RD[pid] || { ans: (L.seen && L.seen.ans) || "", where: (L.seen && L.seen.where) || "", fam: (L.seen && L.seen.fam) || "" };
    var box = h("section", own({ class: "card soft lp-rel" }), h("h4", {}, "به مجهول نگاه کن: مسئلهٔ مرتبط از کارهای خودت"),
      prov("rel"),
      h("p", { class: "small" }, "سه موردِ نزدیک از مسئله‌ها، موقعیت‌های گره‌گشا، ایده‌ها و پرونده‌های خودت — شباهت با کد (واژه‌های مشترک)، نه مدل؛ ممکن است بی‌ربط باشد. اگر مرتبط است، نتیجه‌اش یا روشش به کار می‌آید؟"));
    if (!R.length) box.appendChild(h("p", { class: "small muted lp-relnone" }, "هنوز موردی با واژه‌های مشترک پیدا نشد."));
    R.forEach(function (x) {
      var linked = L.related.some(function (y) { return y.id === x.c.id; });
      box.appendChild(h("div", { class: "row between wrap lp-relrow", "data-id": x.c.id }, h("button", { class: "linkish", type: "button", onclick: function () { A.go.apply(A, x.c.go); } }, x.c.fa),
        h("span", { class: "small muted" }, "واژه‌های مشترک: " + x.sh.slice(0, 5).join("، ")),
        linked ? h("span", { class: "chip" }, "پیوند خورد") : h("button", { class: "btn ghost sm lp-rellink", type: "button", onclick: function () { L.related.push({ type: x.c.type, id: x.c.id, at: nowISO() }); S.put(pg); A.render(); } }, "مرتبط است — پیوندش بده")));
    });
    /* پیوند به‌تنهایی «به کار بردنِ ابزار» نیست: بنویس دقیقاً چه چیزی از آن مورد به این مسئله می‌آید (نتیجه، روش، عنصرِ کمکی) */
    L.related.forEach(function (x, i) {
      var c = candidates(pid).filter(function (y) { return y.id === x.id; })[0], k = "c" + i; d[k] = d[k] != null ? d[k] : x.carry || "";
      box.appendChild(h("div", { class: "col gap lp-relcarry", "data-id": x.id }, field("lpRelC_" + i, "از «" + clip(c ? c.fa : x.id, 60) + "» دقیقاً چه چیزی به این مسئله می‌آید — نتیجه‌اش، روشش یا عنصری کمکی؟", d[k], function (v) { d[k] = v; }, 0),
        h("button", { class: "btn ghost sm lp-relcsave", type: "button", onclick: function () { if (!spec(d[k])) { A.toast("دقیق‌تر بنویس چه چیزی به کار می‌آید (دست‌کم سه واژهٔ معنادار).", "bad"); return; } x.carry = txt(d[k]); x.carryAt = nowISO(); S.put(pg); A.render(); } }, x.carry ? "به‌روزکردن" : "ثبتِ آنچه به کار می‌آید")));
    });
    box.appendChild(selF("lpSeen", "همین مجهول (یا مجهولی شبیه) را جایی دیده‌ای — در زندگیِ خودت یا کارِ دیگران؟", [["yes", "بله"], ["no", "نه"]], d.ans, function (v) { d.ans = v; A.render(); }));
    if (d.ans === "yes") box.appendChild(field("lpSeenW", "کجا؟ چه چیزی از آن به کار می‌آید — نتیجه‌اش، روشش، یا عنصری کمکی؟", d.where, function (v) { d.where = v; }, 2));
    if (d.ans === "no") box.appendChild(field("lpSeenF", "پاسخِ «نه» هم دانش را بسیج می‌کند: پس چه چیزی در این مسئله برایت آشناست؟", d.fam, function (v) { d.fam = v; }, 2));
    box.appendChild(h("button", { class: "btn ghost sm lp-seensave", type: "button", onclick: function () {
      if (!d.ans || (d.ans === "yes" && txt(d.where).length < 3) || (d.ans === "no" && txt(d.fam).length < 3)) { A.toast("بگو دیده‌ای یا نه، و یک جمله دربارهٔ آن.", "bad"); return; }
      L.seen = { ans: d.ans, where: txt(d.where), fam: txt(d.fam), at: nowISO() }; S.put(pg); A.toast("ثبت شد."); A.render();
    } }, "ثبت"));
    if (L.seen) box.appendChild(h("p", { class: "small good lp-seenok" }, "ثبت شد: " + (L.seen.ans === "yes" ? "دیده‌ای — " + L.seen.where : "ندیده‌ای؛ آشنا: " + L.seen.fam)));
    return box;
  }

  /* ---------- فرض کن حل شده — از آخر به عقب ---------- */
  /* تور ۱ ِ پولیا (s21–s29): زنجیره چند پله و چند شاخه دارد — «یک گام پیش‌تر» تا هر جا لازم است، شاخه‌های رقیب (راه‌های دیگری به همان وضع)،
     علامتِ «بن‌بست» با دلیل، و برگزیدنِ یک شاخه؛ نخستین گامِ واقعی با آخرین حلقهٔ شاخهٔ برگزیده سنجیده می‌شود (ترتیبِ اجرا وارونهٔ ترتیبِ اختراع).
     رکوردِ پیشین (before1/before2) یک بار به یک شاخه تبدیل می‌شود (fill-empty)؛ before1/before2 ِ شاخهٔ برگزیده برای خواننده‌های پیشین (مرورِ h) می‌ماند. */
  function backFix(L) {
    var b = L.back; if (!b || b.chains) return b;
    b.chains = [{ links: [b.before1, b.before2].filter(function (x) { return txt(x); }), dead: false, deadWhy: "" }]; b.chosen = 0; return b;
  }
  function liveChains(b) { return ((b && b.chains) || []).map(function (c, i) { return { c: c, i: i }; }).filter(function (x) { return !x.c.dead && (x.c.links || []).some(function (t) { return txt(t); }); }); }
  function chosenChain(L) { var b = backFix(L); if (!b) return null; var lc = liveChains(b); if (b.chosen != null && b.chains[b.chosen] && !b.chains[b.chosen].dead) return b.chains[b.chosen]; return lc.length === 1 ? lc[0].c : null; }
  function lastLink(L) { var c = chosenChain(L); if (!c) return ""; var ls = (c.links || []).filter(function (t) { return txt(t); }); return ls[ls.length - 1] || ""; }
  A.liveBackLast = function (pid) { var pg = pgOf(pid); return lastLink(live(solOf(pg))); };
  function bkId(ci, li) { return ci === 0 && li < 2 ? (li === 0 ? "lpBk1" : "lpBk2") : "lpBk_" + ci + "_" + li; }
  var BD = {};
  function backCard(r, pg, s) {
    var pid = r.p.id, L = live(s), b = backFix(L) || {};
    var d = BD[pid] = BD[pid] || { solved: b.solved || "", have: b.have || "", chosen: b.chosen != null ? b.chosen : null, chains: b.chains ? JSON.parse(JSON.stringify(b.chains)) : [{ links: ["", ""], dead: false, deadWhy: "" }] };
    d.chains.forEach(function (c) { c.links = c.links || []; while (c.links.length < 2) c.links.push(""); });
    var box = h("section", own({ class: "card soft lp-bk" }), h("h4", {}, "فرض کن حل شده — از آخر به عقب"),
      h("p", { class: "small" }, "رو برگرداندن از هدف سخت است، ولی نبوغ نمی‌خواهد: وضعِ حل‌شده را دقیق تصور کن (فقط تصور — امکانش را با یقین اشتباه نگیر)، بعد بپرس درست یک گام پیش از آن چه باید برقرار باشد، و باز یک گام پیش‌تر، تا به چیزی برسی که همین حالا در دستِ توست. اگر به یک وضع از چند راه می‌شود رسید، هر راه یک شاخه است؛ شاخه‌ای که به جایی نمی‌رسد بن‌بست است. این زنجیره اندیشه است (طرح)؛ اجرا همان زنجیره است وارونه — نخستین گامِ واقعیِ تو آخرین حلقهٔ شاخهٔ برگزیده است."),
      prov("back"),
      field("lpBkS", "اگر حل شده بود، وضع دقیقاً چه شکلی داشت؟ (دیدنی و مشخص)", d.solved, function (v) { d.solved = v; }, 2));
    function redraw() { A.render(); }
    d.chains.forEach(function (c, ci) {
      var fs = h("fieldset", { class: "col gap lp-bkchain" + (c.dead ? " lp-bkdead" : ""), "data-ci": ci }, h("legend", {}, "شاخهٔ " + fa(ci + 1) + (c.dead ? " — بن‌بست" : d.chosen === ci ? " — برگزیده" : "")));
      c.links.forEach(function (t, li) { fs.appendChild(field(bkId(ci, li), li === 0 ? "درست یک گام پیش از وضعِ حل‌شده، چه باید برقرار باشد؟" : "و یک گام پیش‌تر؟", t, function (v) { c.links[li] = v; }, li === 0 ? 2 : 0)); });
      fs.appendChild(h("div", { class: "row gap wrap" },
        h("button", { class: "btn ghost sm lp-bkdeeper", type: "button", onclick: function () { c.links.push(""); redraw(); } }, "+ یک گام پیش‌تر"),
        h("label", { class: "row gap small", for: "lpBkDead_" + ci }, h("input", { type: "checkbox", id: "lpBkDead_" + ci, checked: c.dead ? true : null, onchange: function (e) { c.dead = e.target.checked; if (c.dead && d.chosen === ci) d.chosen = null; redraw(); } }), "این شاخه بن‌بست است"),
        c.dead ? null : h("label", { class: "row gap small", for: "lpBkPick_" + ci }, h("input", { type: "radio", name: "lpBkPick_" + pid, id: "lpBkPick_" + ci, checked: d.chosen === ci ? true : null, onchange: function () { d.chosen = ci; redraw(); } }), "این شاخه را برمی‌گزینم")));
      if (c.dead) fs.appendChild(field("lpBkDeadW_" + ci, "چرا بن‌بست است؟ (به چه چیزی می‌رسد که در دستت نیست یا شدنی نیست)", c.deadWhy || "", function (v) { c.deadWhy = v; }, 0));
      box.appendChild(fs);
    });
    box.appendChild(h("button", { class: "btn ghost sm lp-bkbranch", type: "button", onclick: function () { d.chains.push({ links: ["", ""], dead: false, deadWhy: "" }); redraw(); } }, "+ شاخهٔ رقیب (راهِ دیگری به همان وضع)"));
    box.appendChild(field("lpBkH", "کدام از این‌ها همین حالا در دستِ توست (کدام داده)؟", d.have, function (v) { d.have = v; }, 0));
    box.appendChild(h("button", { class: "btn ghost sm lp-bksave", type: "button", onclick: function () {
      var miss = [], chains = d.chains.map(function (c) { return { links: c.links.map(txt).filter(Boolean), dead: !!c.dead, deadWhy: txt(c.deadWhy) }; });
      if (txt(d.solved).length < 3) miss.push("وضعِ حل‌شده");
      if (!chains.some(function (c) { return !c.dead && c.links.length && c.links[0].length >= 3; })) miss.push("دست‌کم یک شاخهٔ زنده با «گامِ پیش از آن»");
      chains.forEach(function (c, i) { if (c.dead && toks(c.deadWhy).length < 2) miss.push("دلیلِ بن‌بست بودنِ شاخهٔ " + fa(i + 1)); });
      var lc = chains.map(function (c, i) { return { c: c, i: i }; }).filter(function (x) { return !x.c.dead && x.c.links.length; });
      var ch = d.chosen != null && chains[d.chosen] && !chains[d.chosen].dead && chains[d.chosen].links.length ? d.chosen : lc.length === 1 ? lc[0].i : null;
      if (lc.length > 1 && ch == null) miss.push("از شاخه‌های رقیب یکی را برگزین (یا بن‌بستش را علامت بزن)");
      if (miss.length) { A.toast("اول این‌ها: " + miss.join("، "), "bad"); return; }
      var C = chains[ch];
      L.back = { solved: txt(d.solved), chains: chains, chosen: ch, have: txt(d.have), before1: C.links[0] || "", before2: C.links[1] || "", at: nowISO() };
      delete BD[pid]; S.put(pg); A.toast("ثبت شد."); A.render();
    } }, "ثبتِ کار به عقب"));
    if (L.back && L.back.at) {
      var ll = lastLink(L);
      box.appendChild(h("p", { class: "small good lp-bkok" }, "ثبت شد (" + A.fdate(A.localDay ? A.localDay(L.back.at) : String(L.back.at).slice(0, 10)) + ")." + (ll ? " نخستین گامِ اجرا باید آخرین حلقهٔ شاخهٔ برگزیده باشد: «" + clip(ll, 100) + "»." : "")));
    }
    return box;
  }

  /* ---------- مسئلهٔ کمکی ---------- */
  var XD = {};
  var AUX = [["special", "خاص‌تر/ساده‌تر (یک حالت، یک نمونهٔ کوچک)"], ["general", "کلی‌تر"], ["analog", "مشابه (قیاسی) — جای دیگری که همین ساختار را دارد"], ["part", "فقط بخشی از شرط را نگه دار"]];
  function auxCard(r, pg, s) {
    var pid = r.p.id, L = live(s), d = XD[pid] = XD[pid] || { k: "", t: "", bridge: "" };
    var box = h("section", own({ class: "card soft lp-aux" }), h("h4", {}, "مسئلهٔ کمکی"),
      h("p", { class: "small" }, "اگر همین را نمی‌توانی حل کنی، اول مسئلهٔ مرتبطی را حل کن. دلیلِ خوبِ انتخاب: دست‌یافتنی‌تر است، چیزی یادت می‌دهد، یا وقتی از اصلی خسته‌ای تازه است. پلِ برگشت را همین حالا بنویس — وگرنه مسئلهٔ اصلی گم می‌شود."),
      selF("lpAuxK", "چه نوع مسئلهٔ کمکی؟", AUX, d.k, function (v) { d.k = v; }),
      field("lpAuxT", "مسئلهٔ کمکی را بنویس", d.t, function (v) { d.t = v; }, 2),
      field("lpAuxB", "از آن چطور به مسئلهٔ اصلی برمی‌گردی؟", d.bridge, function (v) { d.bridge = v; }, 0));
    box.appendChild(h("button", { class: "btn ghost sm lp-auxsave", type: "button", onclick: function () {
      if (!d.k || txt(d.t).length < 3 || txt(d.bridge).length < 3) { A.toast("نوع، مسئلهٔ کمکی و پلِ برگشت لازم است.", "bad"); return; }
      L.aux.push({ k: d.k, t: txt(d.t), bridge: txt(d.bridge), at: nowISO() }); delete XD[pid]; S.put(pg); A.render();
    } }, "ثبتِ مسئلهٔ کمکی"));
    if (L.aux.length) box.appendChild(h("ul", { class: "small lp-auxlist" }, L.aux.map(function (a) { return h("li", {}, "«" + a.t + "» (" + ((AUX.filter(function (x) { return x[0] === a.k; })[0] || [])[1] || "") + ") — برگشت: " + a.bridge); })));
    return box;
  }

  /* ---------- حرکت‌ها: از ۲۷ حرکت، با دلیلِ یک‌خطیِ خودت ---------- */
  var MD = {};
  function movesCard(r, pg, s) {
    var pid = r.p.id, L = live(s), d = MD[pid] = MD[pid] || { mv: "", why: "" }, ML = A.MOVE_LIST || [];
    if (!ML.length) return null;
    var box = h("section", own({ class: "card soft lp-moves" }), h("h4", {}, "کدام حرکت‌ها؟"),
      h("p", { class: "small" }, "از حرکت‌های حلِ مسئله آن‌هایی را برگزین که این‌جا به کار می‌آیند — هر کدام با یک دلیلِ کوتاه. «همهٔ کلیدها را بیازما»: فهرستِ آزموده‌ها همین‌جا می‌ماند."),
      selF("lpMv", "حرکت", ML.map(function (m) { return [m.id, m.fa]; }), d.mv, function (v) { d.mv = v; }),
      field("lpMvWhy", "چرا این حرکت این‌جا؟ (یک خط)", d.why, function (v) { d.why = v; }, 0));
    box.appendChild(h("button", { class: "btn ghost sm lp-mvadd", type: "button", onclick: function () {
      if (!d.mv || txt(d.why).length < 3) { A.toast("حرکت و دلیلش را بنویس.", "bad"); return; }
      if (!L.moves.some(function (m) { return m.mv === d.mv; })) L.moves.push({ mv: d.mv, why: txt(d.why), at: nowISO() }); delete MD[pid]; S.put(pg); A.render();
    } }, "افزودنِ حرکت"));
    if (L.moves.length) box.appendChild(h("div", { class: "col gap lp-mvlist" }, L.moves.map(function (m) { return h("div", { class: "row gap wrap small" }, A.moveLink ? A.moveLink(m.mv) : m.mv, h("span", {}, m.why)); })));
    return box;
  }

  /* ---------- طرح در یک جمله + داده‌های به‌کارنرفته ---------- */
  /* پولیا، عمق: طرح دست‌کم یک ابزارِ طرح را واقعاً به کار گرفته باشد — کد فقط می‌سنجد ناخالی، مشخص (چند واژهٔ معنادار) و رونوشتِ صورت نیست */
  function near(a, b) { return !!(A.kNearCopy && txt(a) && txt(b) && A.kNearCopy(a, b)); }
  function spec(t, n) { return toks(t).length >= (n || 3); }
  function heurUsed(r, s) {
    var L = live(s), u = uOf(s) || {}, o = [], st = r.p.statement;
    if (L.back && spec(L.back.solved) && spec(L.back.before1, 2) && !near(L.back.solved, st) && !near(L.back.solved, u.one)) o.push("back");
    if (L.aux.some(function (a) { return spec(a.t) && spec(a.bridge, 2) && !near(a.t, st); })) o.push("aux");
    if (L.moves.some(function (m) { var mv = A.MOVES && A.MOVES[m.mv]; return spec(m.why) && !(mv && near(m.why, mv.fa + " " + (mv.d || ""))); })) o.push("move");
    if (L.related.some(function (x) { return spec(x.carry) && !near(x.carry, st); }) || (L.seen && L.seen.ans === "yes" && spec(L.seen.where) && !near(L.seen.where, st))) o.push("rel");
    return o;
  }
  A.liveHeur = function (pid) { var r = rec(pid); if (!r) return []; return heurUsed(r, solOf(pgOf(pid))); };
  var HEUR_FA = { back: "از آخر به عقب", aux: "مسئلهٔ کمکی", move: "حرکت با دلیل", rel: "مسئلهٔ مرتبط" };
  var PD = {};
  function planCard(r, pg, s) {
    var pid = r.p.id, L = live(s), nat = natOf(s, r), prac = nat === "practical";
    /* تور ۱: دلیل‌های ثبت‌شده در طرحِ پیشین در فرم می‌مانند؛ پیش‌نویسِ طرح روی رکورد (L.planDraft) تا «به‌کارنرفته» و قلابِ دستیار آن را هم ببینند */
    var d = PD[pid] = PD[pid] || { t: (L.plan && L.plan.t) || L.planDraft || "", t2: (L.plan && L.plan.t2) || "", unused: JSON.parse(JSON.stringify((L.plan && L.plan.unused) || {})) };
    function still() { return unusedOf(s, pg).filter(function (x) { return !mentions(d.t + "\n" + d.t2, x.t); }); }   // داده‌ای که در خودِ جملهٔ طرح آمده، به کار رفته است
    var hu = heurUsed(r, s);
    var box = h("section", own({ class: "card lp-plan" }), h("h4", {}, "طرحت"),
      h("p", { class: "small" }, "طرح از پیوندِ داده و مجهول درمی‌آید. در یک یا دو جمله: نخست چه، سپس چه — و با کدام داده‌ها."),
      h("p", { class: "small lp-heur " + (hu.length ? "good" : "warnline") }, hu.length ? "ابزارِ طرح که به کار بردی: " + hu.map(function (k) { return HEUR_FA[k]; }).join("، ") + "." :
        "پیش از ثبتِ طرح، دست‌کم یکی از ابزارهای بالا را واقعاً به کار ببر: مسئلهٔ مرتبط، از آخر به عقب، مسئلهٔ کمکی، یا حرکتی با دلیلش."));
    if (!hu.length) box.appendChild(prov("p"));
    var hold = h("div", { class: "lp-unhold" });
    function drawUn() { hold.innerHTML = ""; var un = still(), ua = unusedAsk(un, d.unused, "lpPU_", nat); if (ua) hold.appendChild(ua); else if (dataOf(s).length) hold.appendChild(h("p", { class: "small good lp-allused" }, "همهٔ داده‌ها جایی در پاسخ‌ها یا طرحت آمده‌اند، یا با دلیل کنار گذاشته شده‌اند.")); }
    var tmr = null, ptmr = null;
    function keepDraft() { if (ptmr) clearTimeout(ptmr); ptmr = setTimeout(function () { ptmr = null; if (PD[pid] !== d) return; L.planDraft = txt(d.t); S.put(pg); }, 400); }
    box.appendChild(field("lpPlan", "طرحت: نخست … ، سپس …", d.t, function (v) { d.t = v; keepDraft(); if (tmr) clearTimeout(tmr); tmr = setTimeout(drawUn, 250); }, 2));
    box.appendChild(prov("p2"));
    box.appendChild(field("lpPlan2", prac ? "طرحِ دوم (لازم برای مسئلهٔ عملی): اگر این طرح نشد، چه می‌کنی؟" : "طرحِ دوم (اختیاری): اگر این طرح نشد، چه می‌کنی؟", d.t2, function (v) { d.t2 = v; if (tmr) clearTimeout(tmr); tmr = setTimeout(drawUn, 250); }, 0));
    drawUn(); box.appendChild(hold);
    box.appendChild(h("button", { class: "btn lp-plansave", type: "button", onclick: function () {
      var miss = []; if (txt(d.t).length < 5) miss.push("«طرحت»");
      if (prac && toks(d.t2).length < 3) miss.push("«طرحِ دوم» (مسئلهٔ عملی: دو کمان)");
      if (!heurUsed(r, s).length) miss.push("«دست‌کم یک ابزارِ طرح که واقعاً به کار رفته باشد»");
      if (suffDue(s, "p")) miss.push("«کافی است؟» را دوباره پاسخ بده (کارتِ بالای طرح)");
      var bk = L.back && backFix(L); if (bk && liveChains(bk).length > 1 && !chosenChain(L)) miss.push("«از آخر به عقب»: از شاخه‌های رقیب یکی را برگزین");
      var un = still();
      unusedMiss(un, d.unused).forEach(function (x) { miss.push(x); });
      if (miss.length) { A.toast("اول این‌ها: " + miss.join("، "), "bad"); drawUn(); return; }
      var keep = JSON.parse(JSON.stringify((L.plan && L.plan.unused) || {})); un.forEach(function (x) { keep[x.id] = { ans: d.unused[x.id].ans, why: txt(d.unused[x.id].why), t: x.t }; });
      if (L.plan && L.plan.at && txt(L.plan.t) !== txt(d.t)) (L.planHist = L.planHist || []).push({ t: L.plan.t, t2: L.plan.t2 || "", at: L.plan.at });
      L.plan = { t: txt(d.t), at: nowISO(), d: A.today(), unused: keep, heur: heurUsed(r, s) }; if (txt(d.t2)) L.plan.t2 = txt(d.t2); delete L.planDraft; delete PD[pid];
      U.seed(s, "h");   // ابزارِ طرحی که به کار بردی از حافظه برمی‌گردد (نردبانِ همان تونل)
      S.put(pg);
      A.toast("طرح ثبت شد؛ حالا گامِ واقعیِ بعد — با پیش‌بینی."); A.go("lprob", pid, "exec");
    } }, L.plan && L.plan.at ? "به‌روزکردنِ طرح" : "ثبتِ طرح"));
    return box;
  }

  /* ---------- کفایت: «هنوز نمی‌دانم» پیگیری می‌شود (تور ۱، s01/s17/s37) ----------
     در طرح (پیش از ثبتِ طرح، لازم) و پس از نخستین گامِ بسته (پیشنهاد) دوباره می‌پرسد؛ هر پاسخ در L.suffLog می‌ماند (فهمِ ثبت‌شده دست نمی‌خورد). */
  var SUFF_OPTS = ["کافی است", "ناکافی است — چیزی کم است", "زائد دارد — بخشی لازم نیست", "متناقض است", "هنوز نمی‌دانم"];
  function suffNow(s) { var lg = live(s).suffLog || [], u = uOf(s) || {}; return lg.length ? lg[lg.length - 1].ans : u.suff; }
  function suffDue(s, where) {
    var u = uOf(s); if (!u || u.suff !== "هنوز نمی‌دانم") return false;
    var L = live(s), lg = L.suffLog || [];
    if (lg.some(function (x) { return x.ph === where; })) return false;
    if (where === "c") return suffNow(s) === "هنوز نمی‌دانم" && L.steps.some(function (x) { return x.closed && x.out && !x.out.auto; });
    return true;
  }
  A.liveSuffNow = function (pid) { var pg = pgOf(pid); return suffNow(solOf(pg)); };
  var SQD = {};
  function suffCard(r, pg, s, where) {
    if (!suffDue(s, where)) return null;
    var pid = r.p.id, L = live(s), u = uOf(s), d = SQD[pid + where] = SQD[pid + where] || { ans: "", why: "" }, T = T0(u.type);
    var box = h("section", own({ class: "card soft lp-suffq", "data-ph": where }), h("h4", {}, "دوباره: آیا شرط برای تعیینِ مجهول کافی است؟"),
      h("p", { class: "small" }, "در فهم گفتی «هنوز نمی‌دانم»" + (u.suffWhy ? " («" + clip(u.suffWhy, 100) + "»)" : "") + ". " + (where === "p" ? "حالا که داده‌ها و شرط را جدا نوشته‌ای، پیش از طرح دوباره بسنج — پاسخِ «نمی‌دانم» هم پذیرفته است، با دلیلِ تازه." : "حالا که نخستین گام را برداشتی و دیدی چه شد، دوباره بسنج.")),
      selF("lpSuffQ_" + where, T.suff, SUFF_OPTS, d.ans, function (v) { d.ans = v; }),
      field("lpSuffQW_" + where, "چرا؟ (یک جمله)", d.why, function (v) { d.why = v; }, 0));
    box.appendChild(h("button", { class: "btn ghost sm lp-suffqgo", type: "button", onclick: function () {
      if (!d.ans || toks(d.why).length < 2) { A.toast("پاسخ و دلیلش را بنویس.", "bad"); return; }
      (L.suffLog = L.suffLog || []).push({ at: nowISO(), d: A.today(), ph: where, ans: d.ans, why: txt(d.why) }); delete SQD[pid + where]; S.put(pg); A.render();
    } }, "ثبت"));
    return box;
  }

  /* ---------- بردهای کوچک (تور ۱، s34؛ «موفقیت‌های کوچک را بجویید») — یک سطرِ مشخص، بی امتیاز ---------- */
  function win(L, kind, t) { (L.wins = L.wins || []).push({ at: nowISO(), d: A.today(), kind: kind, t: clip(t, 120) }); if (L.wins.length > 40) L.wins = L.wins.slice(-40); }
  var WIN_FA = { pred: "پیش‌بینی‌ات درست درآمد", datum: "یک داده به کار رفت", goal: "یک گام به مجهول نزدیک‌تر", proof: "گامی که ثابتش کردی", idea: "ایده‌ای که پس از کنار گذاشتن آمد", sub: "زیرهدفی که رسیدی" };
  function winLine(L) {
    var w = (L.wins || []).filter(function (x) { return x.d === A.today(); }); if (!w.length) return null;
    var x = w[w.length - 1];
    return h("p", { class: "small good lp-win" }, "✓ " + WIN_FA[x.kind] + ": «" + x.t + "» — این یک پیشرفتِ واقعی است، نه دلداری.");
  }

  /* ---------- کنار بگذار تا فردا (تور ۱، s34؛ کارِ ناخودآگاه پس از تلاشِ جدی) ---------- */
  function effort(pg, s) {
    var L = live(s), P = ((pg.tut || {}).plan || []).filter(function (e) { return e && e.src === "live" && !e.skip && e.text; });
    return P.length + L.aux.length + L.moves.length + (L.back ? 1 : 0) + L.related.filter(function (x) { return x.carry; }).length + L.steps.filter(function (x) { return x.closed && x.out && !x.out.auto; }).length;
  }
  /* «تلاشِ جدی» ساختاری است، نه شمارِ قراردادی: دست‌کم یک ابزارِ طرح واقعاً به کار رفته (heurUsed) و دست‌کم یک تلاشِ ثبت‌شده (پاسخ به پرسش یا گامِ بسته) */
  function effortOk(r, pg, s) {
    var L = live(s), P = ((pg.tut || {}).plan || []).filter(function (e) { return e && e.src === "live" && !e.skip && e.text; });
    return heurUsed(r, s).length > 0 && (P.length > 0 || L.steps.some(function (x) { return x.closed && x.out && !x.out.auto; }));
  }
  function incubBtn(r, pg, s, ph) {
    var L = live(s); if (L.incub && !L.incub.back) return null;
    if (!effortOk(r, pg, s)) return null;
    return h("div", { class: "col gap lp-incubwrap" }, prov("incub"), h("button", { class: "btn ghost sm lp-incub", type: "button", onclick: function () {
      L.incub = { at: nowISO(), d: A.today(), due: A.addDays(A.today(), 1), ph: ph }; S.put(pg);
      A.toast("کنار گذاشته شد تا فردا؛ فردا در «امروز» می‌پرسد چه چیزی به ذهنت رسید."); A.render();
    } }, "😴 تلاشِ جدی کردم — کنار بگذار تا فردا"));
  }
  var ID = {};
  function incubCard(r, pg, s) {
    var L = live(s), x = L.incub; if (!x || x.back) return null;
    if (x.due > A.today()) return h("p", { class: "card soft small lp-incubwait" }, "پس از تلاشِ جدی کنارش گذاشتی؛ " + A.fdate(x.due) + " می‌پرسد چه چیزی به ذهنت رسید. اگر زودتر رسید، همین حالا هم ادامه بده.");
    var pid = r.p.id, d = ID[pid] = ID[pid] || { t: "" };
    var box = h("section", own({ class: "card lp-incubback" }), h("h4", {}, "دیروز کنارش گذاشتی — چه چیزی به ذهنت رسید؟"),
      h("p", { class: "small" }, "کار پس از تلاشِ جدی گاهی در غیابِ تو ادامه پیدا می‌کند: ایده‌ای، پرسشی، شکِ تازه‌ای — حتی «هیچ». همان را بنویس."),
      field("lpIncubT", "چه چیزی به ذهنت رسید؟", d.t, function (v) { d.t = v; }, 2));
    box.appendChild(h("button", { class: "btn sm lp-incubgo", type: "button", onclick: function () {
      if (txt(d.t).length < 2) { A.toast("بنویس چه چیزی رسید — حتی «هیچ».", "bad"); return; }
      x.back = { at: nowISO(), d: A.today(), t: txt(d.t) }; (L.incubLog = L.incubLog || []).push(JSON.parse(JSON.stringify(x)));
      if (toks(d.t).length >= 2) win(L, "idea", d.t);
      delete ID[pid]; S.put(pg); A.render();
    } }, "ثبت و ادامه"));
    return box;
  }

  /* ---------- حدسِ پیش از حل در اجرا: پیامدهای تازهٔ تأییدشده ⇐ سقفِ کارخانه (T_plausible؛ تور ۱، s21–s29) ----------
     n = گام‌هایی که به داوریِ خودت «پیامدی تازه از حدس را تأیید کرد»؛ سقف از خودِ موتور (EPI_FOUND.CAPF.conseq، فقط خواندن) — نه عددِ جدا. */
  function guessCons(s) { var c = { yes: 0, no: 0 }; live(s).steps.forEach(function (st) { var g = st.out && st.out.guess; if (g && g.rel === "confirm") c.yes++; if (g && g.rel === "refute") c.no++; }); return c; }
  function plausibleCap(n) {
    var F = window.EPI_FOUND; if (!(F && F.CAPF && typeof F.CAPF.conseq === "function")) return null;
    var v = F.CAPF.conseq({ x_conseq_n: n, x_conseq_new: "تازه" }); return isFinite(v) ? v : null;
  }
  A.livePlausible = function (pid) { var pg = pgOf(pid), s = solOf(pg), c = guessCons(s); return { n: c.yes, refuted: c.no, cap: c.no ? null : plausibleCap(c.yes) }; };
  function guessPanel(r, pg, s) {
    var g = s.g && s.g[1]; if (!g || !g.guess || g.hit) return null;
    var c = guessCons(s), cap = c.no ? null : plausibleCap(c.yes);
    var box = h("div", { class: "card soft small lp-guess" }, h("p", {}, h("strong", {}, "حدسِ پیش از حلت: "), "«" + g.guess + "»" + (g.conf ? " · اطمینانِ آغاز: " + fa(g.conf) + "٪" : "")),
      h("p", {}, "پیامدهای تازه‌ای که گام‌های واقعی تأیید کردند: " + fa(c.yes) + (c.no ? " · ردکننده: " + fa(c.no) : "")));
    if (c.no) box.appendChild(h("p", { class: "warnline lp-guessref" }, "واقعیت دست‌کم یک پیامدِ حدس را رد کرد — پیش از حل نوشتی اگر رد شد: «" + (g.ifRef || "—") + "»."));
    else if (cap != null) {
      box.appendChild(h("p", { class: "lp-plaus", "data-n": c.yes }, "سقفِ کارخانه برای حدسی با " + fa(c.yes) + " پیامدِ تازهٔ تأییدشده (استدلالِ معقول، (n+1)/(n+2)): " + fa(Math.round(cap)) + "٪ — هرگز یقین."));
      if (g.conf && g.conf > cap) box.appendChild(h("p", { class: "warnline lp-plausover" }, "اطمینانِ آغازت (" + fa(g.conf) + "٪) از این سقف بالاتر است: شاهد هنوز این‌قدر نیست. پیامدِ تازه‌ای بیازما که اگر حدس نادرست باشد، ردش کند."));
    }
    return box;
  }

  /* ---------- یادآورِ گامِ زمان‌دار (تور ۱، s13/s38): HOST.remind با ساعتِ خودِ کاربر — «فردا ۸ صبح» ⇒ پیش از ۸ ---------- */
  var HW = { "یک": 1, "یه": 1, "دو": 2, "سه": 3, "چهار": 4, "پنج": 5, "شش": 6, "شیش": 6, "هفت": 7, "هشت": 8, "نه": 9, "ده": 10, "یازده": 11, "دوازده": 12 };
  function hourOf(when) {
    var x = norm(when).replace(/\s+/g, " "), m, h0 = null, mi = 0;
    if ((m = /(\d{1,2})\s*[:٫]\s*(\d{2})/.exec(x))) { h0 = +m[1]; mi = +m[2]; }
    else if ((m = /ساعت\s*(\d{1,2})/.exec(x)) || (m = /(\d{1,2})\s*(?:صبح|ظهر|عصر|بعد ?از ?ظهر|شب|am|pm)/.exec(x))) h0 = +m[1];
    else if ((m = new RegExp("(?:ساعت\\s*)?(" + Object.keys(HW).join("|") + ")\\s*(?:صبح|ظهر|عصر|بعد ?از ?ظهر|شب)").exec(x))) h0 = HW[m[1]];
    if (h0 == null || h0 > 23) return null;
    if (/عصر|بعد ?از ?ظهر|pm/.test(x) && h0 < 12) h0 += 12;
    else if (/شب/.test(x) && h0 < 12 && h0 >= 5) h0 += 12;
    else if (/ظهر/.test(x) && h0 < 6) h0 += 12;
    return { h: h0, m: mi };
  }
  A.liveHourOf = hourOf;
  function notifyHour() { var n = ((S.settings && S.settings().knots) || {}).notify || {}; return n.hour == null ? 9 : n.hour; }
  function remindStep(r, st) {
    if (!(A.HOST && typeof A.HOST.remind === "function") || !st || !st.due) return null;
    var tz = "UTC"; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) { }
    var t = hourOf(st.when), hr = t ? Math.max(0, t.m ? t.h : t.h - 1) : notifyHour();
    var p = { key: "lprob:" + r.p.id + ":" + st.id, due_date: st.due, tz: tz, hour: hr, title: "معماری یادگیری — گامِ واقعی",
      body: "«" + clip(st.text, 80) + "» — " + (t ? "ساعتِ " + fa(t.h) + (t.m ? ":" + fa(String(t.m).padStart(2, "0")) : "") + " · " : "") + "پس از انجام، در صفحه بگو چه شد.", link: "?tab=lprob&a=" + encodeURIComponent(r.p.id) + "&sub=exec" };
    try { Promise.resolve(A.HOST.remind(p)).catch(function () { }); } catch (e) { }
    st.remind = { hour: hr, at: nowISO() };
    return p;
  }
  function unremindStep(r, st) { if (A.HOST && typeof A.HOST.unremind === "function" && st && st.remind) { try { Promise.resolve(A.HOST.unremind("lprob:" + r.p.id + ":" + st.id)).catch(function () { }); } catch (e) { } } }

  /* ---------- مربیگری (تور ۱، s15/s16): مسئلهٔ «کسِ دیگری»؛ کاربر مربی است ----------
     نردبانِ پرسش (کلی ⇐ خاص) از همان فهرست‌های تونل برای مرحلهٔ جاری؛ هرگز پاسخ؛ هر پیام یک پرسش یا یک ایده؛ ثبتِ این‌که یادگیرنده به کدام پله نیاز
     داشت، و برگشتِ فاصله‌دار (نردبانِ ۱/۳/۷/۲۱/۶۰) تا ببینی بی آن پرسش (یا با پرسشی کلی‌تر) می‌رسد. */
  function coachQs(r, s, ph) {
    var TQ = (A.ASSIST && A.ASSIST.tutorQuestions) || {};
    if (ph === "u") return (TQ.und && TQ.und.qs) || [];
    if (ph === "p") return A.solveAskList ? A.solveAskList("p", 1, typeOf(r, s)) : [];
    if (ph === "c") return (TQ.exec && TQ.exec.qs) || [];
    return (TQ.back && TQ.back.qs) || [];
  }
  var COACH_BACK = [["alone", "خودش رسید — بی آن پرسش، یا با پرسشی کلی‌تر"], ["same", "باز همان پرسش لازم شد"], ["more", "پرسشِ خاص‌تری لازم شد"]];
  var CB = {};
  function coachCard(r, pg, s, ph) {
    if (!r.coach) return null;
    var pid = r.p.id, L = live(s), C = L.coach = L.coach || { qi: {}, log: [] }, key = ph === "done" ? "b" : ph, Q = coachQs(r, s, key), k = C.qi[key] || 0, who = r.coach.who || "او";
    var box = h("section", own({ class: "card lp-coach" }), h("h3", {}, "تو مربیِ «" + who + "» هستی"),
      h("p", { class: "small" }, "پاسخ را نگو و گامی را که خودش می‌تواند بردارد جای او برندار. از کلی‌ترین پرسش شروع کن؛ فقط اگر پس از درنگ پاسخی نیامد، پرسشِ خاص‌ترِ بعدی را بپرس — تا بیشترین سهمِ کار با خودش باشد."),
      h("p", { class: "small warnline lp-coach1" }, "هر پیام فقط یک پرسش یا یک ایده — چند پرسش در یک پیام یعنی هیچ‌کدام شنیده نمی‌شود."));
    var due = C.due && C.due <= A.today() && C.last && !C.last.back;
    if (due) {
      var d = CB[pid] = CB[pid] || { v: "" };
      box.appendChild(h("div", { class: "card soft col gap lp-coachback" }, h("p", { class: "small" }, "دفعهٔ پیش «" + who + "» به این پرسش نیاز داشت: «" + C.last.q + "» (پلهٔ " + fa(C.last.k + 1) + "). امروز مسئلهٔ مشابهی به او بده و فقط اگر لازم شد بپرس."),
        selF("lpCoachBack", "این بار چه شد؟", COACH_BACK, d.v, function (v) { d.v = v; }),
        h("button", { class: "btn sm lp-coachbackgo", type: "button", onclick: function () {
          if (!d.v) { A.toast("بگو این بار چه شد.", "bad"); return; }
          var iv = U.nextIv(C.iv || LADDER[0], d.v === "alone"); C.last.back = { at: nowISO(), d: A.today(), v: d.v };
          C.log.push({ at: nowISO(), d: A.today(), kind: "back", v: d.v, q: C.last.q });
          C.iv = iv; C.due = A.addDays(A.today(), iv); C.last = { q: C.last.q, k: C.last.k, ph: C.last.ph, at: nowISO() };
          delete CB[pid]; S.put(pg); A.toast("ثبت شد؛ " + A.fdate(C.due) + " دوباره می‌پرسد."); A.render();
        } }, "ثبت")));
    }
    if (!Q.length) return box;
    if (k >= Q.length) {
      box.appendChild(h("p", { class: "small lp-coachend" }, "نردبانِ پرسش‌های این مرحله تمام شد. پس از تلاشِ جدیِ او، راه را با ایدهٔ کلیدیِ جدا نشان بده — و فردا بخواه خودش بی‌نگاه دوباره بسازدش."));
      box.appendChild(h("button", { class: "btn ghost sm lp-coachreset", type: "button", onclick: function () { C.qi[key] = 0; S.put(pg); A.render(); } }, "از نو، از کلی‌ترین پرسش"));
      return box;
    }
    box.appendChild(h("p", { class: "lp-coachq", "data-k": k }, h("strong", {}, "پرسشی که حالا از او می‌پرسی (پلهٔ " + fa(k + 1) + " از " + fa(Q.length) + "): "), "«" + Q[k] + "»"));
    box.appendChild(h("div", { class: "row gap wrap" },
      h("button", { class: "btn sm lp-coachok", type: "button", onclick: function () {
        C.log.push({ at: nowISO(), d: A.today(), ph: key, k: k, q: Q[k], needed: true });
        C.last = { q: Q[k], k: k, ph: key, at: nowISO() }; C.iv = LADDER[1]; C.due = A.addDays(A.today(), LADDER[1]); C.qi[key] = 0;
        S.put(pg); A.toast("ثبت شد: به پلهٔ " + fa(k + 1) + " نیاز داشت؛ " + A.fdate(C.due) + " برمی‌گردد."); A.render();
      } }, "با همین پرسش خودش رسید"),
      h("button", { class: "btn ghost sm lp-coachmore", type: "button", onclick: function () { C.qi[key] = k + 1; C.log.push({ at: nowISO(), d: A.today(), ph: key, k: k, q: Q[k], needed: false }); S.put(pg); A.render(); } }, "پاسخی نیامد — پرسشِ خاص‌تر")));
    var lg = C.log.filter(function (x) { return x.needed; });
    if (lg.length) box.appendChild(h("details", { class: "small lp-coachlog" }, h("summary", {}, "پرسش‌هایی که «" + who + "» به آن‌ها نیاز داشت (" + fa(lg.length) + ")"),
      h("ul", {}, lg.map(function (x) { return h("li", {}, "«" + x.q + "» — پلهٔ " + fa(x.k + 1) + " · " + A.fdate(x.d)); }))));
    return box;
  }

  /* ---------- ادعاهای درونِ مسئله ⇐ پروندهٔ کارخانه (یک کلیک)، با سقفِ موتورِ قطعی کنارش ---------- */
  var CD = {};
  /* تور ۱ ِ پولیا (s20/s26): ادعایی که دوست داری درست باشد و به آن مطمئنی (≥ ۸۰٪) ⇒ «اثبات یا رد کن» + قوی‌ترین شاهدِ خلاف، پیش از پرونده */
  function claimsCard(r, pg, s) {
    var pid = r.p.id, L = live(s), d = CD[pid] = CD[pid] || { t: "", want: "", conf: "", contra: "" };
    var box = h("section", own({ class: "card soft lp-claims" }), h("h4", {}, "ادعاهایی که حلت به آن‌ها تکیه دارد"),
      h("p", { class: "small" }, "«فکر می‌کنم … درست است» — هر ادعایی که طرح یا تصمیمت بر آن بنا شده. با یک کلیک یک پروندهٔ سنجش در کارخانه می‌گیرد؛ درجه‌اش را موتورِ قطعیِ کارخانه از کاربرگ‌ها می‌دهد (پروندهٔ نیمه‌کاره ⇒ «شک»، ½) — هوش مصنوعی داوری نمی‌کند."));
    L.claims.forEach(function (c) {
      var g = A.IDEA && A.IDEA.assumptionGrade ? A.IDEA.assumptionGrade({ caseId: c.caseId, claim: c.claim }, null) : null;
      box.appendChild(h("div", { class: "row between wrap lp-claim", "data-case": c.caseId }, h("span", {}, (c.pod ? "اثبات یا رد کن: " : "") + "«" + c.t + "»" + (c.contra ? " — شاهدِ خلاف: «" + clip(c.contra, 80) + "»" : "")),
        h("span", { class: "small lp-grade" }, g ? g.fa : "—"),
        h("button", { class: "btn ghost sm", type: "button", onclick: function () { A.go("e_case", c.caseId); } }, "🏭 پرونده")));
    });
    box.appendChild(field("lpClaim", "ادعای تازه: فکر می‌کنم … درست است", d.t, function (v) { d.t = v; }, 0));
    box.appendChild(h("div", { class: "row gap wrap" }, selF("lpClaimWant", "دوست داری این ادعا درست باشد؟", GWANT, d.want, function (v) { d.want = v; A.render(); }),
      selF("lpClaimConf", "چقدر به آن مطمئنی؟", ["50", "60", "70", "80", "90", "100"].map(function (x) { return [x, fa(x) + "٪"]; }), d.conf, function (v) { d.conf = v; A.render(); })));
    var podC = d.want === "yes" && +d.conf >= 80;
    if (podC) box.appendChild(h("div", { class: "card soft col gap lp-claimpod" }, prov("want"),
      h("p", { class: "small" }, "ادعایی که دوستش داری و به آن مطمئنی، «اثبات یا رد کن» می‌شود: پیش از پرونده، قوی‌ترین شاهدِ خلافش را بنویس — همان را اول بیازما."),
      field("lpClaimContra", "قوی‌ترین شاهدِ خلاف: چه چیزی، اگر درست باشد، این ادعا را رد می‌کند؟", d.contra, function (v) { d.contra = v; }, 0)));
    box.appendChild(h("button", { class: "btn ghost sm lp-claimgo", type: "button", onclick: function () {
      var t = txt(d.t); if (t.length < 5) { A.toast("ادعا را بنویس.", "bad"); return; }
      if (podC && toks(d.contra).length < 2) { A.toast("ادعای دلخواهِ مطمئن: اول قوی‌ترین شاهدِ خلافش را بنویس.", "bad"); return; }
      if (!A.newCase) { A.toast("کارخانه در این نسخه بار نشده.", "bad"); return; }
      var cs = A.newCase({ title: clip((podC ? "اثبات یا رد کن: " : "") + t, 70), input: podC ? "اثبات یا رد کن: " + t + "\nقوی‌ترین شاهدِ خلاف: " + txt(d.contra) : t, src: { type: "lprob", id: pid } });
      var cl = { t: t, caseId: cs.id, at: nowISO() }; if (d.want) cl.want = d.want; if (d.conf) cl.conf = +d.conf; if (podC) { cl.pod = true; cl.contra = txt(d.contra); }
      L.claims.push(cl); delete CD[pid]; S.put(pg);
      A.go("e_case", cs.id);
    } }, "🏭 در کارخانه بسنج"));
    return box;
  }

  /* ---------- اجرا روی واقعیت: گامِ واقعی، پیش‌بینی پیش از انجام، نتیجه در موعد ---------- */
  var SD = {};
  var CONF = ["50", "60", "70", "80", "90", "95"];
  /* B089: داده‌ای که در طرح گفتی «نمی‌دانم کجا به کار می‌آید» و هنوز به کار نرفته — در گامِ بعد و در بازنگری با نامش برمی‌گردد */
  function unknownData(s, pg) { var L = live(s), un = (L.plan && L.plan.unused) || {}, used = usedMap(s, pg); return dataOf(s).filter(function (x) { return un[x.id] && un[x.id].ans === "unknown" && !used[x.id]; }); }
  var WANT = [["more", "بیشتر می‌خواهم"], ["same", "همان‌قدر"], ["less", "کمتر"], ["changed", "عوض شد — حالا چیزِ دیگری می‌خواهم"]];
  /* تور ۱ ِ پولیا: (۱) مسئلهٔ کامل‌بیان‌شده ⇒ هر گام «روشن می‌بینی که درست است؟ می‌توانی ثابت کنی؟» (TQ.exec)، بی پیش‌بینیِ رویداد و موعد —
     مگر خودت بخواهی با واقعیت یا محاسبهٔ بیرونی هم بسنجی؛ (۲) گامی که از طرحِ ثبت‌شده نمی‌آید ⇒ «طرح را عوض کردی؟ چرا؟» (ثبت در L.switches)؛
     (۳) نخستین گامِ واقعی با آخرین حلقهٔ شاخهٔ برگزیدهٔ «از آخر به عقب» سنجیده می‌شود؛ (۴) گامِ زمان‌دار ⇒ HOST.remind با ساعتِ خودت. */
  var SWITCH = [["same", "نه — همین گام بخشی از همان طرح است"], ["plan2", "به طرحِ دومم رفتم"], ["new", "بله — طرح را عوض کردم"]];
  var BKM = [["yes", "بله — همین گام همان حلقه را اجرا می‌کند"], ["no", "نه — از جای دیگری شروع می‌کنم"]];
  function planToks(L) { var c = chosenChain(L); return toksSim([L.plan && L.plan.t, L.plan && L.plan.t2].concat(c ? c.links : []).join(" ")); }
  function stepFollows(L, text) { var pt = planToks(L), st = toksSim(text); if (st.length < 2 || !pt.length) return true; return st.some(function (w) { return hit(w, pt); }); }
  A.liveStepFollows = function (pid, text) { var pg = pgOf(pid); return stepFollows(live(solOf(pg)), text); };
  function stepForm(r, pg, s) {
    var pid = r.p.id, L = live(s), nat = natOf(s, r), obj = nat === "objective";
    var d = SD[pid] = SD[pid] || { text: "", clear: "", unclear: "", prem: "", proof: "", real: false, pred: "", conf: "", when: "", far: false, data: [], unk: {}, sw: "", swWhy: "", bkm: "", bkmWhy: "" };
    var u = uOf(s) || {}, unk = unknownData(s, pg), TQ = (A.ASSIST && A.ASSIST.tutorQuestions) || {}, EQ = (TQ.exec && TQ.exec.qs) || ["روشن می‌بینی که این گام درست است؟", "می‌توانی ثابت کنی که درست است؟"];
    var withReal = !obj || d.real;
    var box = h("section", own({ class: "card lp-stepf", "data-nat": nat }), h("h4", {}, obj ? "گامِ بعدِ حل" : "گامِ واقعیِ بعد"),
      h("p", { class: "small" }, obj ? "این مسئله پاسخِ عینی دارد: داورِ هر گام برهان است، نه پیش‌بینیِ رویداد. هر گام را وارسی کن — دیدنِ درستیِ گام با ثابت کردنش فرق دارد؛ اگر فقط می‌بینی‌اش، شهودی ثبتش کن تا بعد ثابتش کنی." :
        "اجرا یعنی هر گام را وارسی کنی، نه فقط بنویسی؛ و پیش از انجام بدانی تقریباً به چه می‌رسی. پیش‌بینی‌ات با احتمال در «🎯 دفترِ پیش‌بینی» می‌نشیند و در موعد، خودت می‌گویی چه شد — کالیبراسیونِ پیش‌بینی‌هایت در «🧠 کارنامهٔ ذهن» از همین‌ها ساخته می‌شود."),
      prov(obj ? "cobj" : "c"),
      field("lpStep", obj ? "گامِ بعد — یک گامِ استدلال، محاسبه یا ساخت (دقیق)" : "گامِ بعد — یک کارِ مشخص در دنیای واقعی (چه چیزی، با چه کسی یا با چه ابزاری)", d.text, function (v) { d.text = v; }, 2),
      selF("lpClear", obj ? EQ[0] : "روشن می‌بینی که این گام درست است — به مجهول نزدیکت می‌کند؟", ["بله", "مطمئن نیستم", "نه"], d.clear, function (v) { if (v === "نه") d.was = { text: txt(d.text), at: nowISO() }; d.clear = v; A.render(); }));
    /* A130 (سنجیده، نه تیک): «نه» گام را می‌بندد. یا بنویس کدام بخش روشن نیست، یا گام را کوچک‌تر بازنویسی کن — و بعد «روشن می‌بینی؟» را دوباره
       پاسخ بده. گامِ پیشین و تازه کنارِ هم ثبت می‌شوند */
    if (d.was) box.appendChild(h("div", { class: "col gap lp-unclear" }, h("p", { class: "small warnline" }, "گفتی روشن نمی‌بینی‌اش: «" + clip(d.was.text, 120) + "». بنویس دقیقاً کدام بخش روشن نیست، یا گام را بالا کوچک‌تر بازنویسی کن؛ بعد «روشن می‌بینی؟» را دوباره پاسخ بده."),
      field("lpUnclear", "کدام بخشِ این گام روشن نیست؟", d.unclear, function (v) { d.unclear = v; }, 2)));
    if (obj) box.appendChild(field("lpProof", EQ[1] + " — کدام داده، تعریف، قضیه یا گامِ پیشین آن را لازم می‌آورد؟", d.proof, function (v) { d.proof = v; }, 2));
    else box.appendChild(field("lpPrem", "به کدام داده یا دلیل تکیه دارد؟", d.prem, function (v) { d.prem = v; }, 0));
    unk.forEach(function (x) { box.appendChild(selF("lpSU_" + x.id, "در طرح گفتی نمی‌دانی «" + clip(x.t, 80) + "» کجا به کار می‌آید — در این گام به کار می‌آید؟", [["use", "بله — همین گام به کارش می‌برد"], ["notyet", "هنوز نه"]], d.unk[x.id] || "", function (v) { d.unk[x.id] = v; var i = d.data.indexOf(x.id); if (v === "use" && i < 0) d.data.push(x.id); if (v !== "use" && i >= 0) d.data.splice(i, 1); })); });
    /* نخستین گامِ واقعی ⇐ آخرین حلقهٔ شاخهٔ برگزیده */
    var ll = !L.steps.length ? lastLink(L) : "";
    if (ll) {
      box.appendChild(h("div", { class: "card soft col gap lp-bkmatch" }, h("p", { class: "small" }, "در «از آخر به عقب» آخرین حلقهٔ شاخهٔ برگزیده‌ات این بود: «" + clip(ll, 120) + "» — اجرا همان زنجیره است وارونه، پس نخستین گام باید همان باشد."),
        selF("lpBkMatch", "این نخستین گام همان آخرین حلقه است؟", BKM, d.bkm, function (v) { d.bkm = v; A.render(); }),
        d.bkm === "no" ? field("lpBkMatchW", "چرا از جای دیگری شروع می‌کنی؟", d.bkmWhy, function (v) { d.bkmWhy = v; }, 0) : null));
    }
    if (obj) box.appendChild(h("label", { class: "row gap small", for: "lpReal" }, h("input", { type: "checkbox", id: "lpReal", checked: d.real ? true : null, onchange: function (e) { d.real = e.target.checked; A.render(); } }), "این گام را با واقعیت یا محاسبهٔ بیرونی هم می‌سنجم (پیش‌بینی و روز)"));
    if (withReal) {
      box.appendChild(field("lpPred", "پیش از انجام: فکر می‌کنی چه می‌شود؟", d.pred, function (v) { d.pred = v; }, 2, "یک نتیجهٔ مشخص که بعداً بشود گفت شد یا نشد"));
      box.appendChild(selF("lpConf", "چقدر مطمئنی که همین می‌شود؟", CONF.map(function (x) { return [x, fa(x) + "٪"]; }), d.conf, function (v) { d.conf = v; }));
      box.appendChild(field("lpWhen", "کی انجامش می‌دهی؟ (روز، و اگر خواستی ساعت — همان روز نتیجه را می‌پرسم و پیش از آن ساعت یادآوری می‌کنم)", d.when, function (v) { d.when = v; }, 0, "مثلاً «پنجشنبه»، «فردا ۸ صبح»، «دهم آذر»، «آخرِ هفته»"));
      if (u.deadline) box.appendChild(h("p", { class: "small muted lp-deadnote" }, "مهلتِ خودِ مسئله: " + A.fdate(u.deadline)));
    }
    var tk = dataTicks(s, "lpSD_", d.data); if (tk) box.appendChild(tk);
    /* گامی که از طرح نمی‌آید ⇒ «طرح را عوض کردی؟» */
    if (L.plan && L.plan.at && (d.showSw || d.sw)) {
      var sw = h("div", { class: "card soft col gap lp-switch" }, h("p", { class: "small warnline" }, "این گام از طرحِ ثبت‌شده‌ات («" + clip(L.plan.t, 100) + "») نمی‌آید — کد واژهٔ مشترکی میانشان نیافت."),
        selF("lpSwitch", "طرح را عوض کردی؟", SWITCH, d.sw, function (v) { d.sw = v; A.render(); }),
        d.sw && d.sw !== "same" ? field("lpSwitchW", "چرا؟ (طرحِ پیشین چه شد؟)", d.swWhy, function (v) { d.swWhy = v; }, 0) : null);
      if ((L.switches || []).filter(function (x) { return x.to !== "same"; }).length) sw.appendChild(prov("switch"));
      box.appendChild(sw);
    }
    var farBox = h("div", {}), out = h("div", { class: "small", "aria-live": "polite" });
    box.appendChild(farBox);
    box.appendChild(h("button", { class: "btn lp-stepsave", type: "button", onclick: function () {
      var why = [], st = txt(d.text), W = withReal && txt(d.when) ? A.willWhen(d.when) : null;
      if (!st) why.push("گامِ بعد را بنویس");
      else if (!obj && A.willConcrete && !A.willConcrete(st)) why.push("«" + st + "» گام نیست، آرزوست — یک کارِ مشخص بنویس");
      else if (obj && toks(st).length < 2) why.push("گام را دقیق‌تر بنویس");
      if (!d.clear) why.push("«روشن می‌بینی؟» را انتخاب کن");
      else if (d.clear === "نه") why.push("روشن نمی‌بینی‌اش: بنویس کدام بخش روشن نیست یا گام را کوچک‌تر بازنویسی کن، و «روشن می‌بینی؟» را دوباره پاسخ بده");
      else if (d.was && toks(d.unclear).length < 2 && !(txt(d.text) !== d.was.text && txt(d.text).length <= d.was.text.length)) why.push("پیش‌تر گفتی روشن نمی‌بینی‌اش: یا بنویس کدام بخش روشن نبود، یا گام را کوچک‌تر بازنویسی کن");
      if (obj && d.clear === "بله" && toks(d.proof).length < 2) why.push("«می‌توانی ثابت کنی؟» — بنویس کدام مقدمه این گام را لازم می‌آورد (اگر فقط می‌بینی‌اش، «مطمئن نیستم» را بزن تا شهودی ثبت شود)");
      unk.forEach(function (x) { if (!d.unk[x.id]) why.push("بگو «" + clip(x.t, 40) + "» در این گام به کار می‌آید یا نه"); });
      if (ll && !d.bkm) why.push("بگو این نخستین گام همان آخرین حلقهٔ «از آخر به عقب» است یا نه");
      else if (ll && d.bkm === "no" && toks(d.bkmWhy).length < 2) why.push("بگو چرا از جای دیگری شروع می‌کنی");
      if (st && L.plan && L.plan.at && !stepFollows(L, st)) {
        if (!d.sw) { d.showSw = true; why.push("این گام از طرحت نمی‌آید — بگو طرح را عوض کردی یا نه"); }
        else if (d.sw !== "same" && toks(d.swWhy).length < 2) why.push("بگو چرا طرح را عوض کردی");
      }
      if (withReal) {
        if (txt(d.pred).length < 3) why.push("پیش‌بینی‌ات را بنویس");
        if (!d.conf) why.push("اطمینانت را انتخاب کن");
        if (!txt(d.when)) why.push("کِی؟ را بنویس");
        else if (!W) why.push("«" + d.when + "» زمان نیست — روزِ مشخص بنویس");
        else if (!W.date) why.push("روزش را هم بنویس (فقط ساعت آمده)");
        else if (W.past) why.push("«" + d.when + "» گذشته است");
        else if (u.deadline && W.date > u.deadline) why.push("«" + d.when + "» (" + A.fdate(W.date) + ") پس از مهلتِ خودِ مسئله (" + A.fdate(u.deadline) + ") است");
        else if (A.daysBetween(A.today(), W.date) > 365 && !d.far) {
          why.push("«" + d.when + "» بیش از یک سال بعد است (" + A.fdate(W.date) + ") — اگر واقعاً همین است، پایین تأیید کن");
          farBox.innerHTML = ""; farBox.appendChild(h("label", { class: "row gap small lp-farok", for: "lpFarOk" }, h("input", { type: "checkbox", id: "lpFarOk", onchange: function (e) { d.far = e.target.checked; } }), "بله، این گام واقعاً " + A.fdate(W.date) + " است"));
        }
      }
      out.innerHTML = "";
      if (why.length) { if (d.showSw && !box.querySelector(".lp-switch")) { A.toast("هنوز نه: " + why.join("؛ "), "bad"); A.render(); return; } out.appendChild(h("p", { class: "bad lp-stepmiss" }, "هنوز نه: " + why.join("؛ ") + ".")); return; }
      var id = "ls" + (L.steps.length + 1), stp, usedBefore = usedMap(s, pg);
      if (withReal) {
        var due = W.date < A.today() ? A.today() : W.date;
        var fc = { id: A.uid("fc"), type: "fcast", q: clip(txt(d.pred), 200) + " — گامِ «" + clip(st, 60) + "» در «" + clip(r.p.title, 50) + "»", p: +d.conf, due: due, dim: "s_problem", live: { pid: pid, step: id } };
        S.put(fc);
        stp = { id: id, at: nowISO(), d: A.today(), text: st, clear: d.clear, prem: txt(d.prem), pred: txt(d.pred), conf: +d.conf, when: txt(d.when), due: due, data: d.data.slice(), fc: fc.id };
      } else {
        /* گامِ برهانی: بی رویداد و بی موعد — همان لحظه وارسی‌شده (یا شهودی) ثبت و بسته می‌شود */
        stp = { id: id, at: nowISO(), d: A.today(), text: st, clear: d.clear, proof: txt(d.proof), intuitive: d.clear === "مطمئن نیستم" || toks(d.proof).length < 2, data: d.data.slice(), due: A.today(), closed: true,
          out: { at: nowISO(), d: A.today(), done: "yes", what: "", match: "", prog: "", kind: "proof" } };
      }
      if (obj) stp.obj = true;
      if (d.was) stp.reclear = { before: d.was.text, unclear: txt(d.unclear), after: st, clear: d.clear, smaller: st !== d.was.text && st.length <= d.was.text.length };
      if (unk.length) stp.unknownAsk = JSON.parse(JSON.stringify(d.unk));
      if (ll) stp.backLink = { link: ll, match: d.bkm, why: txt(d.bkmWhy) };
      if (L.plan && L.plan.at && d.sw && !stepFollows(L, st)) {
        var swr = { at: nowISO(), d: A.today(), step: id, text: st, from: L.plan.t, to: d.sw, why: txt(d.swWhy) };
        (L.switches = L.switches || []).push(swr); stp.sw = d.sw;
        if (d.sw === "new") L.plan.switched = (L.plan.switched || 0) + 1;
      }
      L.steps.push(stp);
      /* برد: داده‌ای که تا این گام بی‌کار بود و حالا به کار رفت؛ گامی که ثابتش کردی */
      dataOf(s).forEach(function (x) { if (stp.data.indexOf(x.id) >= 0 && (!usedBefore[x.id] || usedBefore[x.id] === "aside")) win(L, "datum", x.t); });
      if (!withReal && !stp.intuitive) win(L, "proof", st);
      if (withReal) remindStep(r, stp);
      delete SD[pid]; S.put(pg);
      A.toast(withReal ? "گام ثبت شد؛ " + (stp.due === A.today() ? "امروز" : A.fdate(stp.due)) + " در «امروز» می‌پرسد چه شد." : stp.intuitive ? "گام شهودی ثبت شد — بعداً ثابتش کن." : "گام با برهانش ثبت شد."); A.render();
    } }, withReal ? "ثبتِ گام و پیش‌بینی" : "ثبتِ گام (وارسی‌شده)"));
    box.appendChild(out);
    return box;
  }
  var OD = {};
  var MATCH = [["yes", "همان شد که پیش‌بینی کردم"], ["part", "تاحدی"], ["no", "پیش‌بینی‌ام درست درنیامد"]];
  var DONE = [["yes", "کامل انجامش دادم"], ["part", "تاحدی"], ["no", "نه"]];
  function lab(L0, k) { var x = L0.filter(function (y) { return y[0] === k; })[0]; return x ? x[1] : ""; }
  /* تور ۱ ِ پولیا (s21–s29): نتیجهٔ هر گام دربارهٔ حدسِ پیش از حل هم داوری می‌شود — «پیامدِ تازه‌ای را تأیید کرد / ردش کرد / ربطی نداشت»؛
     ردِ حدس ⇒ نوشتهٔ خودت «اگر آزمون حدس را رد کند، چه می‌کنی؟» دوباره جلوی چشمت و بازاندیشی (لازم). شمارِ تأییدها ⇐ سقفِ T_plausible (guessPanel). */
  var GREL = [["confirm", "پیامدی تازه از آن را تأیید کرد (پیامدی که حدس را با آن نساخته بودم)"], ["refute", "آن را رد کرد"], ["none", "ربطی به حدسم نداشت"]];
  function outcomeCard(r, pg, s, st) {
    var pid = r.p.id, fc = st.fc ? S.get(st.fc) : null, u = uOf(s) || {}, g = s.g && s.g[1], gAsk = !!(g && g.guess && !g.hit);
    var d = OD[st.id + pid] = OD[st.id + pid] || { done: "", what: "", match: fc && fc.outcome === "شد" ? "yes" : fc && fc.outcome === "نشد" ? "no" : "", prog: "", want: "", grel: "", reflect: "" };
    var box = h("section", own({ class: "card lp-out", "data-step": st.id }), h("h4", {}, "🔭 گامِ واقعی: انجامش دادی؟ چه شد؟"),
      h("p", { class: "small" }, "«" + st.text + "» — " + st.when + " · پیش‌بینی‌ات: «" + st.pred + "» (" + fa(st.conf) + "٪)"),
      selF("lpODone", "انجامش دادی؟", DONE, d.done, function (v) { d.done = v; A.render(); }),
      field("lpOWhat", "چه شد؟ (واقعیت، نه تفسیر — حتی «هیچ»)", d.what, function (v) { d.what = v; }, 2));
    if (d.done && d.done !== "no") box.appendChild(selF("lpOMatch", "با پیش‌بینی‌ات می‌خواند؟ (داوریِ خودت)", MATCH, d.match, function (v) { d.match = v; }));
    box.appendChild(selF("lpOProg", "به حلِ مسئله نزدیک‌تر شدی؟", ["بله، روشن", "کمی", "نه"], d.prog, function (v) { d.prog = v; }));
    /* خواستن در ایست‌ها: با آنچه در آغاز نوشتی */
    if (u.why) box.appendChild(h("p", { class: "small muted lp-owhy" }, "در آغاز نوشتی چرا می‌خواهی حلش کنی: «" + u.why + "»"));
    box.appendChild(selF("lpOWant", "حالا، پس از این گام، چقدر می‌خواهی حلش کنی — نسبت به آغاز؟", WANT, d.want, function (v) { d.want = v; }));
    if (gAsk && d.done && d.done !== "no") {
      box.appendChild(selF("lpOGuess", "این نتیجه دربارهٔ حدسِ پیش از حلت («" + clip(g.guess, 60) + "») چه می‌گوید؟", GREL, d.grel, function (v) { d.grel = v; A.render(); }));
      if (d.grel === "refute") box.appendChild(h("div", { class: "card soft col gap lp-ifref" }, h("p", { class: "small warnline" }, "پیش از حل نوشتی اگر آزمون حدس را رد کند: «" + (g.ifRef || "— چیزی ننوشتی —") + "»" + (g.chal ? " · و آنچه گفتی ردش می‌کند: «" + g.chal + "»" : "") + "."),
        field("lpOReflect", "حالا که رد شد: همان کار را می‌کنی؟ چرا — و حدسِ اصلاح‌شده چیست؟", d.reflect, function (v) { d.reflect = v; }, 2)));
    }
    box.appendChild(h("button", { class: "btn lp-outsave", type: "button", onclick: function () {
      var miss = []; if (!d.done) miss.push("«انجامش دادی؟»"); if (txt(d.what).length < 2) miss.push("«چه شد؟»"); if (d.done && d.done !== "no" && !d.match) miss.push("«با پیش‌بینی‌ات می‌خواند؟»"); if (!d.prog) miss.push("«نزدیک‌تر شدی؟»"); if (!d.want) miss.push("«چقدر می‌خواهی؟»");
      if (gAsk && d.done && d.done !== "no" && !d.grel) miss.push("«دربارهٔ حدست چه می‌گوید؟»");
      if (d.grel === "refute" && toks(d.reflect).length < 3) miss.push("«حالا که حدس رد شد، چه می‌کنی؟»");
      if (miss.length) { A.toast("اول این‌ها: " + miss.join("، "), "bad"); return; }
      st.out = { at: nowISO(), d: A.today(), done: d.done, what: txt(d.what), match: d.done === "no" ? "" : d.match, prog: d.prog, want: d.want }; st.closed = true;
      if (gAsk && d.grel && d.done !== "no") { st.out.guess = { rel: d.grel }; if (d.grel === "refute") { st.out.guess.reflect = txt(d.reflect); st.out.guess.ifRef = g.ifRef || ""; } }
      if (fc) { fc.outcome = d.done === "no" ? "انجام نشد" : d.match === "yes" ? "شد" : d.match === "no" ? "نشد" : "تاحدی"; fc.outcomeAt = nowISO(); S.put(fc); }
      unremindStep(r, st);
      var L1 = live(s);
      if (d.done !== "no" && d.match === "yes") win(L1, "pred", st.pred);
      if (d.prog === "بله، روشن") win(L1, "goal", st.text);
      delete OD[st.id + pid]; S.put(pg); A.render();
    } }, "ثبتِ نتیجه"));
    return box;
  }
  /* گامِ بازی که با «حل شد» یا «کنار گذاشتن» بسته می‌شود: پیش‌بینی‌اش هرگز آزموده نشد ⇒ «انجام نشد» (بیرون از کالیبراسیون و بی‌موعد در دفتر) */
  function closeOpen(s, why) {
    live(s).steps.forEach(function (st) { if (st.closed) return; st.closed = true; st.out = { at: nowISO(), d: A.today(), done: "no", what: "", match: "", prog: "", auto: why };
      var f = st.fc && S.get(st.fc); if (f && !f.outcome) { f.outcome = "انجام نشد"; f.outcomeAt = nowISO(); f.auto = why; S.put(f); } });
  }
  /* غافلگیری ⇒ داده است: گره‌گشا یا «دوباره فهمِ مسئله»؛ پیشرفتی نبود ⇒ «🌱 کوچک‌ترین گامِ بعد» */
  var MULTI_RE = /(?:دو|سه|چند|بیش\s*از\s*یک)\s*(?:تا\s*)?(?:جواب|پاسخ)|جواب‌?\s*های|پاسخ‌?\s*های|هیچ\s*(?:جوابی|پاسخی)|جواب\s*ندارد|پاسخ\s*ندارد/;
  function multiCard(r, pg, s, why) {
    var u = uOf(s) || {};
    return h("section", own({ class: "card soft lp-multi" }), h("h4", {}, "شرط کافی نبود؟ چند جواب؟"),
      h("p", { class: "small" }, why + " اگر مجهول بیش از یک مقدار (یا هیچ مقداری) دارد، شرط برای تعیینش کافی (یا برآوردنی) نبود. در فهم گفتی: «" + (suffNow(s) || "—") + "»" + (u.sat ? " و دربارهٔ برآوردنی بودن: «" + ((SAT.filter(function (x) { return x[0] === u.sat; })[0] || [])[1] || u.sat) + "»" : "") + "."),
      h("button", { class: "btn ghost sm lp-multigo", type: "button", onclick: function () { live(s).reU = true; S.put(pg); A.go("lprob", r.p.id, "u"); } }, "↺ برگرد به «کافی است؟» در فهمِ مسئله"));
  }
  function afterCard(r, pg, s) {
    var st = lastClosed(s); if (!st || !st.out || openStep(s)) return null;
    var o = st.out, box = h("div", { class: "col gap lp-after" });
    var wl = winLine(live(s)); if (wl) box.appendChild(wl);
    var sq = suffCard(r, pg, s, "c"); if (sq) box.appendChild(sq);
    if (MULTI_RE.test(norm(o.what || ""))) box.appendChild(multiCard(r, pg, s, "در نتیجهٔ گامت نوشتی: «" + clip(o.what, 100) + "»."));
    if (o.match === "no") box.appendChild(h("section", own({ class: "card soft lp-surprise" }), h("h4", {}, "غافلگیر شدی — این داده است، نه شکست"),
      h("p", { class: "small" }, "پیش‌بینی: «" + st.pred + "» · آنچه شد: «" + o.what + "». فاصلهٔ این دو جایی است که فهمت از مسئله یا از خودت ناقص بود."),
      h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm lp-toknot", type: "button", onclick: function () { stuck(r, pg, s, st); } }, "🪢 همین غافلگیری را در گره‌گشا بشکاف"),
        h("button", { class: "btn ghost sm lp-reu", type: "button", onclick: function () { live(s).reU = true; S.put(pg); A.go("lprob", r.p.id, "u"); } }, "↺ دوباره فهمِ مسئله"))));
    if ((o.prog === "نه" || o.done === "no") && A.willHost && A.willCard) {
      var hs = A.willHost("prob", r.p.id);
      if (hs) box.appendChild(A.willCard(hs, "live:" + (o.done === "no" ? "notdone" : "noprog"), o.done === "no" ? "گام انجام نشد — اشکالی ندارد؛ داده است. چقدر می‌خواهی پیشش ببری و کوچک‌ترین گامِ بعد چیست؟" : "پیشرفتی نبود. نه رها کن نه وانمود کن چیزی نشده: کوچک‌ترین گامِ مشخص بعد چیست، کی و چند دقیقه؟"));
    }
    return box.children.length ? box : null;
  }
  /* گیر ⇒ گره‌گشا با همین مسئله (موقعیتِ ازپیش‌پرشده؛ یکی برای هر مسئله تا وقتی باز است) */
  function stuck(r, pg, s, st) {
    if (!A.knotNewCase) { A.toast("گره‌گشا در این نسخه بار نشده.", "bad"); return; }
    var L = live(s), pid = r.p.id;
    var ex = !st ? S.all("kcase", function (c) { return c.src && c.src.type === "eprob" && c.src.pid === pid && c.src.live && !c.src.step && c.status !== "closed" && c.status !== "done"; })[0] : null;
    if (ex) { A.go("kcase", ex.id, ex.step || "in"); return; }
    var kc = A.knotNewCase(), u = uOf(s) || {};
    kc.kinds = ["problem"]; kc.titleSet = true;
    kc.title = st ? "غافلگیری در «" + clip(r.p.title, 50) + "»" : "گیر در «" + clip(r.p.title, 60) + "»";
    kc.intake.statement = r.p.statement + (u.u ? "\nمجهول: " + u.u : "") + (u.d ? "\nداده‌ها: " + u.d : "") + (u.c ? "\nشرط: " + u.c : "");
    kc.intake.what = st ? "در مسئلهٔ حل‌نشدهٔ خودم «" + r.p.title + "» گامِ «" + st.text + "» را برداشتم." : "در مسئلهٔ حل‌نشدهٔ خودم «" + r.p.title + "» نمی‌دانم گامِ بعد چیست.";
    if (st) { kc.intake.expected = st.pred; kc.intake.actual = (st.out && st.out.what) || ""; }
    kc.intake.seen = "no";
    kc.src = { type: "eprob", pid: pid, live: true, step: st ? st.id : null };
    try { var rk = {}; (A.knotRank ? A.knotRank(kc) : []).forEach(function (x) { rk[x.fam] = { score: x.score, why: x.why }; }); kc.rank = rk; } catch (e) { }
    S.put(kc); if (L.knots.indexOf(kc.id) < 0) L.knots.push(kc.id); S.put(pg);
    A.go("kcase", kc.id, "in");
  }
  A.liveStuck = function (pid) { var r = rec(pid); if (!r) return; var pg = pgOf(pid); stuck(r, pg, solOf(pg), null); };
  function stepsList(s) {
    var L = live(s); if (!L.steps.length) return null;
    return h("details", { class: "small lp-steps", open: true }, h("summary", {}, "گام‌های واقعی (" + fa(L.steps.length) + ")"),
      h("ol", {}, L.steps.map(function (st) {
        var o = st.out;
        if (o && o.kind === "proof") return h("li", { "data-step": st.id }, "«" + st.text + "» · " + (st.intuitive ? "شهودی — هنوز ثابت نشده" : "برهان: «" + st.proof + "»") + (st.sw && st.sw !== "same" ? " · طرح عوض شد" : ""));
        return h("li", { "data-step": st.id }, "«" + st.text + "» · پیش‌بینی: «" + st.pred + "» (" + fa(st.conf) + "٪) · " + (o ? lab(DONE, o.done) + (o.what ? " — «" + o.what + "»" : "") + (o.match ? " · " + lab(MATCH, o.match) : "") + " · پیشرفت: " + o.prog + (o.guess ? " · حدس: " + lab(GREL, o.guess.rel).split(" (")[0] : "") : "وارسی: " + A.fdate(st.due)) + (st.sw && st.sw !== "same" ? " · طرح عوض شد" : ""));
      })));
  }

  /* ---------- بازنگری (حل شد یا آگاهانه کنار گذاشتی) ---------- */
  var BKD = {};
  var DROPSRC = (A.WILL && A.WILL.DROPSRC) || [["thing", "از خودِ مسئله — دلیلش را دیده‌ام و سنجیده‌ام"], ["crit", "از حسِ پس از نقد یا شکست"], ["tired", "از خستگی"]];
  function usedQs(pg) { var o = []; ((pg.tut || {}).plan || []).forEach(function (e) { if (e && e.src === "live" && !e.skip && e.text && o.indexOf(e.q) < 0) o.push(e.q); }); return o; }
  /* تور ۱ (s11/s30): «کدام پرسش بیشتر کمک کرد؟» — پرسش‌های طرح، کارت‌هایی که واقعاً به کار رفتند، و پرسش‌هایی که دستیار در گفت‌وگوهای همین مسئله
     پرسید (سشن‌های achat با lprob = همین مسئله، یا سشنِ سازندهٔ آن؛ فقط خواندن) */
  function cardsUsed(r, s) {
    var L = live(s), g = s.g && s.g[1], o = [];
    if ((L.plan && Object.keys(L.plan.unused || {}).length) || L.steps.some(function (x) { return x.unknownAsk; })) o.push(["unused", "پرسشِ «از همهٔ داده‌ها استفاده کردی؟» (داده‌های به‌کارنرفته)"]);
    if (L.back) o.push(["back", "کار به عقب (فرض کن حل شده)" + ((L.back.chains || []).length > 1 ? " با شاخه‌های رقیب" : "")]);
    if (L.aux.length) o.push(["aux", "مسئلهٔ کمکی"]);
    if (L.related.some(function (x) { return x.carry; }) || (L.seen && L.seen.ans)) o.push(["rel", "مسئلهٔ مرتبط (همین مجهول را جایی دیده‌ای؟)"]);
    if (L.moves.length) o.push(["moves", "حرکت‌ها: " + L.moves.map(function (m) { return ((A.MOVES || {})[m.mv] || {}).fa || m.mv; }).join("، ")]);
    if (g && g.kit) o.push(["kit", "ابزارهای حدس (جدول، تفاضل‌ها، فرمول، رقیب‌ها، قیاس)"]);
    if ((L.suffLog || []).length) o.push(["suff", "پرسشِ «آیا شرط کافی است؟» (دوباره)"]);
    if ((L.rote || []).length) o.push(["rote", "ایستِ «پرسش‌ها را مکانیکی نخوان» و برگزیدنِ پرسشِ درست"]);
    return o;
  }
  function chatQs(r) {
    var pid = r.p.id, o = [];
    S.all("achat", function (x) { return x && (x.lprob === pid || (r.sess && x.id === r.sess)); }).forEach(function (se) {
      (se.msgs || []).forEach(function (m) { if (!m || m.role !== "ai") return; String(m.text || "").split(/(?<=[؟?])\s+|\n+/).forEach(function (t) { t = txt(t); if (/[؟?]$/.test(t) && t.length >= 8 && t.length <= 220 && o.indexOf(t) < 0) o.push(t); }); });
    });
    return o.slice(-8);
  }
  A.liveChatQs = function (pid) { var r = rec(pid); return r ? chatQs(r) : []; };
  function lookBack(r, pg, s) {
    var pid = r.p.id, L = live(s), ab = L.state === "abandoned", g = s.g && s.g[1];
    var d = BKD[pid] = BKD[pid] || { chkHow: "", chkRes: "", other: "", glance: "", use: "", worked: "", best: "", newProb: "", hit: "", why: "", src: "", gain: "", unused: {} };
    var un = unusedOf(s, pg);
    var box = h("section", own({ class: "card lp-lb" }), h("div", { class: "eyebrow" }, ab ? "کنار گذاشتنِ آگاهانه" : "پس از حل"),
      h("h3", {}, ab ? "کنار می‌گذاری — با دلیل، بی شرم" : "بازنگری: نتیجه و راه را وارسی کن"),
      h("p", { class: "small" }, ab ? "رها کردنِ آگاهانه جایز است — مثلِ «🌱»: با دلیل، و یک بار بعدتر می‌پرسد «هنوز همان دلیل را قبول داری؟». آنچه تا این‌جا به دست آمد هم درس است." :
        "حل تمام نیست تا نگاهی به پشتِ سر نینداخته‌ای. درسِ تو یک کارتِ مرور می‌سازد، و مسئلهٔ تازه‌ای که از این می‌سازی چند روز بعد برای حل برمی‌گردد."));
    var u0 = uOf(s); if (u0 && u0.why) box.appendChild(h("p", { class: "small muted lp-bwhy0" }, "در آغاز نوشتی چرا می‌خواهی حلش کنی: «" + u0.why + "»"));
    box.appendChild(selF("lpBWant", "در پایان، آن خواستن نسبت به آغاز چطور است؟", WANT, d.want || "", function (v) { d.want = v; }));
    var unk0 = unknownData(s, pg); if (unk0.length) box.appendChild(h("p", { class: "small warnline lp-bunk" }, "در طرح گفتی نمی‌دانی این‌ها کجا به کار می‌آیند و هنوز به کار نرفته‌اند: " + unk0.map(function (x) { return "«" + clip(x.t, 50) + "»"; }).join("، ") + " — پایین بگو چرا."));
    if (ab) {
      box.appendChild(field("lpBWhy", "چرا کنارش می‌گذاری؟ (دلیلِ خودِ مسئله)", d.why, function (v) { d.why = v; }, 2));
      box.appendChild(selF("lpBSrc", "این دلیل از کجاست؟", DROPSRC, d.src, function (v) { d.src = v; }));
      box.appendChild(field("lpBGain", "تا این‌جا چه به دست آمد؟ (حتی «فهمیدم کدام راه کار نمی‌کند»)", d.gain, function (v) { d.gain = v; }, 0));
    } else {
      box.appendChild(field("lpBChk", "نتیجه را وارسی می‌کنی؟ چطور — با یک واقعیت، عدد، نظرِ کسی، یا حالتِ خاص؟", d.chkHow, function (v) { d.chkHow = v; }, 2));
      box.appendChild(selF("lpBRes", "نتیجهٔ وارسی", ["نتیجه سالم ماند", "ایرادی یافتم", "نتوانستم وارسی کنم"], d.chkRes, function (v) { d.chkRes = v; }));
      box.appendChild(prov("b"));
      box.appendChild(field("lpBOther", "از راهِ دیگری هم به همین می‌رسیدی؟ چطور؟", d.other, function (v) { d.other = v; }, 0));
      box.appendChild(field("lpBGlance", "کلِ حل را در یک نگاه (یک جمله) ببین", d.glance, function (v) { d.glance = v; }, 0));
      box.appendChild(field("lpBWorked", "چه چیزی خوب کار کرد — و چطور دوباره همین‌قدر خوب عمل کنی؟", d.worked, function (v) { d.worked = v; }, 0));
    }
    /* بازنگری بر حسبِ نوع (تور ۱، s23/s33): فضایی ⇐ تقارن و واحد/بُعد؛ عملی ⇐ تقریب و آنچه بیرون ماند؛ اثباتی ⇐ همهٔ فرض و یکی بودنِ نتیجه */
    var u1 = u0 || {}, nat = natOf(s, r), ty = typeOf(r, s);
    if (!ab && u1.spatial) {
      box.appendChild(h("h4", {}, "وارسیِ شکل و اندازه"));
      box.appendChild(field("lpBSym", "تقارن: داده‌هایی که در مسئله نقشِ یکسان دارند، در نتیجه هم نقشِ یکسان دارند؟ (جابه‌جایشان کن — نتیجه عوض می‌شود؟)", d.sym || "", function (v) { d.sym = v; }, 0));
      box.appendChild(field("lpBUnits", "واحد و بُعد: اگر همهٔ اندازه‌ها را با واحدِ دیگری بسنجی، نتیجه درست می‌ماند؟ بُعدِ دو طرف یکی است (طول با طول، مساحت با مساحت)؟", d.units || "", function (v) { d.units = v; }, 0));
    }
    if (!ab && nat === "practical") {
      var asd = asideMap(s), asl = dataOf(s).filter(function (x) { return asd[x.id]; });
      box.appendChild(h("h4", {}, "وارسیِ مسئلهٔ عملی"));
      if (asl.length) box.appendChild(h("p", { class: "small lp-basides" }, "آنچه با دلیل بیرون گذاشتی: " + asl.map(function (x) { return "«" + clip(x.t, 50) + "» (" + clip(asd[x.id], 60) + ")"; }).join("، ")));
      if (u1.prac && u1.prac.approx) box.appendChild(h("p", { class: "small muted" }, "تقریبی که بس دانستی: «" + u1.prac.approx + "»"));
      box.appendChild(field("lpBApprox", "تقریبت بس بود؟ آنچه بیرون گذاشتی اثرِ محسوسی نشان داد؟ (در واقعیت چه دیدی)", d.approx || "", function (v) { d.approx = v; }, 2));
    }
    if (!ab && (ty === "prove" || ty === "pod")) {
      box.appendChild(h("h4", {}, "وارسیِ برهان"));
      box.appendChild(selF("lpBHyp", "همهٔ فرض به کار رفت؟", [["all", "بله — هر بخشِ فرض جایی در برهان آمد"], ["notall", "نه — بخشی به کار نرفت (پس یا زائد است یا برهان ناقص)"]], d.hyp || "", function (v) { d.hyp = v; }));
      box.appendChild(selF("lpBConcl", "نتیجه‌ای که برهانت واقعاً می‌دهد، با حکمی که ادعا شده بود یکی است؟", [["same", "یکی است"], ["diff", "یکی نیست — برهان چیزِ دیگری (ضعیف‌تر/قوی‌تر/عکسش) را نشان می‌دهد"]], d.concl || "", function (v) { d.concl = v; }));
    }
    if (!ab && ty === "find") {
      box.appendChild(selF("lpBMulti", "چند جواب پیدا شد؟", [["one", "یکی"], ["many", "بیش از یکی"], ["none", "هیچ — شرط برآوردنی نبود"]], d.multi || "", function (v) { d.multi = v; A.render(); }));
      if (d.multi === "many" || d.multi === "none") box.appendChild(multiCard(r, pg, s, d.multi === "many" ? "گفتی بیش از یک جواب پیدا شد." : "گفتی هیچ جوابی نبود."));
    }
    var Qs = usedQs(pg), Cs = cardsUsed(r, s), Ch = chatQs(r);
    var bestOpts = Qs.map(function (q, i) { return [String(i), clip(q, 90)]; }).concat(Cs.map(function (c) { return ["card:" + c[0], "🧰 " + c[1]]; })).concat(Ch.map(function (q, i) { return ["chat:" + i, "💬 " + clip(q, 90)]; }));
    if (bestOpts.length) box.appendChild(selF("lpBBest", "کدام پرسش یا ابزار بیشتر از همه کمک کرد؟ (پرسش‌های طرح، کارت‌هایی که به کار بردی، و پرسش‌های دستیار در گفت‌وگوی همین مسئله)", bestOpts.concat([["none", "هیچ‌کدام"]]), d.best, function (v) { d.best = v; }));
    box.appendChild(field("lpBUse", ab ? "درسِ تو به قلمِ خودت (اختیاری): کجای دیگر به کار می‌آید؟" : "درسِ تو به قلمِ خودت: این روش یا نتیجه کجای دیگر به کار می‌آید؟", d.use, function (v) { d.use = v; }, 2));
    box.appendChild(prov("new"));
    box.appendChild(field("lpBNew", ab ? "مسئلهٔ تازه‌ای که از این ساختی (اختیاری) — چند روز بعد برای حل برمی‌گردد" : "مسئلهٔ تازه‌ای که از این ساختی (کمی متفاوت، یا همان روش جای دیگر) — چند روز بعد برای حل برمی‌گردد", d.newProb, function (v) { d.newProb = v; }, 2));
    if (g && g.guess && !ab) {
      box.appendChild(h("p", { class: "small" }, "حدسِ پیش از حلت: «" + g.guess + "»" + (g.conf ? " با اطمینانِ " + fa(g.conf) + "٪" : "")));
      box.appendChild(selF("lpBHit", "حدست با آنچه شد می‌خواند؟", ["درست بود", "تاحدی", "نادرست بود"], d.hit, function (v) { d.hit = v; }));
    }
    var ua = unusedAsk(un, d.unused, "lpBU_"); if (ua) box.appendChild(ua);
    box.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn lp-lbsave", type: "button", onclick: function () {
      var miss = [];
      if (ab) { if (txt(d.why).length < 3) miss.push("«چرا کنارش می‌گذاری؟»"); if (!d.src) miss.push("«این دلیل از کجاست؟»"); }
      else {
        if (txt(d.chkHow).length < 3) miss.push("«وارسیِ نتیجه»"); if (!d.chkRes) miss.push("«نتیجهٔ وارسی»");
        [["other", "راهِ دیگر"], ["glance", "در یک نگاه"], ["worked", "چه کار کرد"]].forEach(function (x) { if (toks(d[x[0]]).length < 2) miss.push("«" + x[1] + "»"); });
        if (txt(d.use).length < 5) miss.push("«درسِ تو»"); if (txt(d.newProb).length < 5) miss.push("«مسئلهٔ تازه»");
        if (g && g.guess && !d.hit) miss.push("«داوریِ حدس»");
      }
      if (bestOpts.length && !d.best) miss.push("«کدام پرسش کمک کرد؟»");
      if (!ab && u1.spatial) { if (toks(d.sym).length < 2) miss.push("«تقارن»"); if (toks(d.units).length < 2) miss.push("«واحد و بُعد»"); }
      if (!ab && nat === "practical" && toks(d.approx).length < 2) miss.push("«تقریبت بس بود؟»");
      if (!ab && (ty === "prove" || ty === "pod")) { if (!d.hyp) miss.push("«همهٔ فرض به کار رفت؟»"); if (!d.concl) miss.push("«نتیجه با حکم یکی است؟»"); }
      if (!ab && ty === "find" && nat === "objective" && !d.multi) miss.push("«چند جواب پیدا شد؟»");
      if (!d.want) miss.push("«خواستن در پایان»");
      /* A157: مسئلهٔ تازه باید تازه باشد — نه تقریباً همان صورت (همان سنجهٔ رونوشتِ ورزشِ گره‌ها، A.kNearCopy) */
      if (txt(d.newProb) && (near(d.newProb, r.p.statement) || near(d.newProb, r.p.title) || near(d.newProb, (u0 || {}).one))) miss.push("«مسئلهٔ تازه» تقریباً همان مسئلهٔ اصلی است — چیزی را عوض کن (مجهول، داده یا شرط)");
      /* «نزدیک ولی متفاوت»: با اصلی دست‌کم یک واژهٔ معنادار (مجهول، داده یا موضوع) مشترک دارد */
      else if (txt(d.newProb)) { var orig = toksSim([r.p.title, r.p.statement, (u0 || {}).u, (u0 || {}).one, (u0 || {}).d].join(" ")), nw = toksSim(d.newProb); if (!nw.some(function (w) { return hit(w, orig); })) miss.push("«مسئلهٔ تازه» هیچ چیزِ مشترکی با این مسئله ندارد — همان مجهول، داده یا روش را در وضعِ دیگری بگذار"); }
      unusedMiss(un, d.unused).forEach(function (x) { miss.push(x); });
      if (miss.length) { A.toast("اول این‌ها: " + miss.join("، "), "bad"); return; }
      var at = nowISO(), keep = {}; un.forEach(function (x) { keep[x.id] = { ans: d.unused[x.id].ans, why: txt(d.unused[x.id].why), t: x.t }; });
      var b = { state: L.state, chkHow: txt(d.chkHow), chkRes: d.chkRes, other: txt(d.other), glance: txt(d.glance), worked: txt(d.worked), use: txt(d.use), newProb: txt(d.newProb), unused: keep, want: d.want, at: at, done: true, from: "live" };
      if (bestOpts.length) {
        var bv = d.best, bq = "";
        if (bv === "none") bq = ""; else if (/^card:/.test(bv)) { var cc = Cs.filter(function (c) { return "card:" + c[0] === bv; })[0]; bq = cc ? cc[1] : ""; b.bestKind = "card"; b.bestCard = bv.slice(5); }
        else if (/^chat:/.test(bv)) { bq = Ch[+bv.slice(5)] || ""; b.bestKind = "chat"; } else { bq = Qs[+bv] || ""; b.bestKind = "q"; }
        b.bestQ = bq; L.bestQ = b.bestQ;
      }
      if (!ab && u1.spatial) { b.sym = txt(d.sym); b.units = txt(d.units); }
      if (!ab && nat === "practical") b.approx = txt(d.approx);
      if (!ab && (ty === "prove" || ty === "pod")) { b.hyp = d.hyp; b.concl = d.concl; }
      if (!ab && ty === "find" && d.multi) b.multi = d.multi;
      if (ab) { b.why = txt(d.why); b.src = d.src; b.gain = txt(d.gain); }
      s.b[1] = b; U.seed(s, "b");
      if (g && g.guess && d.hit) { g.hit = d.hit; g.hitAt = at; }
      var les = { lv: 1, use: b.use, newProb: b.newProb, glance: b.glance, at: at, live: true };
      if (b.use && A.newCard) { var cd = A.newCard("در مسئلهٔ «" + r.p.title + "» چه درسی گرفتی و کجای دیگر به کارش می‌بری؟ (بی‌نگاه)", b.use + (b.newProb ? "\nمسئلهٔ تازه‌ای که ساختی: " + b.newProb : "") + (b.worked ? "\nچه خوب کار کرد: " + b.worked : ""), { pb: pid, due: A.addDays(A.today(), 1) }); les.card = cd && cd.id; }
      if (b.use) s.lessons.push(les);
      /* «مسئلهٔ تازه‌ای که خودت ساختی» ⇒ مسئلهٔ حل‌نشدهٔ تازه، خفته تا پلهٔ دومِ نردبان، و در «امروز» برای حل برمی‌گردد (پولیا: مسئله بساز و حلش کن) */
      if (b.newProb) { var nr = create(clip(b.newProb, 80), b.newProb, typeOf(r, s), { origin: { type: "lprob", id: pid }, dormant: A.addDays(A.today(), LADDER[1]) }); b.newPid = nr.p.id; L.made = (L.made || []).concat([nr.p.id]); }
      if (ab) {
        var w = s.will = s.will || {}; w.steps = w.steps || []; w.log = w.log || [];
        var riv = U.nextIv(LADDER[0], true);
        w.drop = { at: at, why: b.why, src: b.src, trig: "live:abandon", due: A.addDays(A.today(), riv), iv: riv };
        w.log.push({ at: at, kind: "commit", trig: "live:abandon", desire: "drop", hope: "", budget: "" });
      }
      closeOpen(s, L.state);
      L.closedAt = at; delete BKD[pid]; S.put(pg); S.put(r);
      A.toast(ab ? "کنار گذاشتنِ آگاهانه ثبت شد؛ " + A.fdate(s.will.drop.due) + " یک بار می‌پرسد." : "بازنگری ثبت شد: درس، کارتِ مرور، و مسئلهٔ تازه‌ات " + A.fdate(A.addDays(A.today(), LADDER[1])) + " برمی‌گردد.");
      A.render();
    } }, ab ? "ثبتِ کنار گذاشتن" : "ثبتِ بازنگری"),
      h("button", { class: "btn ghost sm lp-reopen", type: "button", onclick: function () { L.state = "open"; S.put(pg); A.go("lprob", pid, "exec"); } }, "برگرد — هنوز حل نشده")));
    return box;
  }
  function backSummary(s) {
    var b = s.b && s.b[1]; if (!b || !b.done) return null;
    return h("div", { class: "small lp-lbsum" }, h("p", {}, b.state === "abandoned" ? "کنار گذاشته شد: «" + (b.why || "") + "»" : "حل شد — وارسی: " + (b.chkRes || "")),
      b.use ? h("p", {}, "درس: " + b.use) : null, b.newProb ? h("p", {}, "مسئلهٔ تازه‌ات: " + b.newProb + (b.newPid && A.liveRec(b.newPid) ? "" : "")) : null,
      b.bestQ ? h("p", { class: "muted" }, "پرسشی که بیشتر کمک کرد: «" + b.bestQ + "»") : null,
      b.newPid && rec(b.newPid) ? h("button", { class: "linkish", type: "button", onclick: function () { A.go("lprob", b.newPid); } }, "🔭 مسئلهٔ تازه‌ات") : null);
  }

  /* ---------- صفحهٔ یک مسئلهٔ حل‌نشده ---------- */
  /* بخشی که خودت باز یا بسته کردی با بازسازیِ صفحه (مثلاً پس از انتخابِ یک گزینه) همان می‌ماند */
  var SECO = {};
  function sec(key, title, open, body, cls) {
    var sk = (A.state && A.state.arg) + "|" + key, op = SECO[sk] != null ? SECO[sk] : open;
    var det = h("details", { class: "card lp-sec " + (cls || ""), "data-sec": key, open: op ? true : null }, h("summary", {}, h("strong", {}, title)));
    det.addEventListener("toggle", function () { SECO[sk] = det.open; });
    (Array.isArray(body) ? body : [body]).forEach(function (b) { if (b) det.appendChild(b); });
    return det;
  }
  var LAST_NAV = "";
  A.V.lprob = function (pid, sub) {
    var nav = pid + "|" + (sub || ""); if (nav !== LAST_NAV) { LAST_NAV = nav; Object.keys(SECO).forEach(function (k) { if (k.indexOf(pid + "|") === 0) delete SECO[k]; }); }
    var r = rec(pid); if (!r) return A.empty("مسئله پیدا نشد.", h("button", { class: "btn", onclick: function () { A.go("e_prob", null, "live"); } }, "مسئله‌های حل‌نشده"));
    var pg = pgOf(pid), s = solOf(pg), L = live(s), t = A.today();
    /* «🌱» ِ رها کردن: «نه — دوباره پیش می‌برمش» ⇒ مسئله دوباره باز */
    if (L.state === "abandoned" && s.will && !s.will.drop && (s.will.log || []).some(function (x) { return x.kind === "drop-recheck" && x.keep === "back" && String(x.at) > String(L.stateAt || ""); })) { L.state = "open"; L.backAt = nowISO(); delete s.b[1]; S.put(pg); }
    var ph = phaseOf(s), want = sub === "u" || sub === "plan" || sub === "exec" || sub === "back" ? { u: "u", plan: "p", exec: "c", back: "b" }[sub] : ph;
    var root = h("div", { class: "page lp-page", dir: "rtl", "data-lp-nat": natOf(s, r), "data-lp-kind": natOf(s, r), "data-lp-ph": ph, "data-lp-coach": r.coach ? "1" : null });
    var strip = h("div", { class: "row gap wrap lp-strip" }, ["u", "p", "c", "b"].map(function (k) { return h("span", { class: "chip" + (k === ph ? " on" : ""), "data-ph": k }, PHN[k]); }));
    root.appendChild(A.head("🔭 مسئلهٔ حل‌نشدهٔ خودم · " + PHN[ph], r.p.title, r.p.statement, h("div", { class: "col gap" }, strip,
      h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm", type: "button", onclick: function () { A.go("e_prob", null, "live"); } }, "← مسئله‌های حل‌نشده"),
        ph !== "u" && ph !== "done" ? h("button", { class: "btn ghost sm lp-stuck", type: "button", onclick: function () { stuck(r, pg, s, null); } }, "🪢 گیر کرده‌ام — گره‌گشا با همین مسئله") : null,
        r.origin && r.origin.type === "lprob" && rec(r.origin.id) ? h("button", { class: "linkish small", type: "button", onclick: function () { A.go("lprob", r.origin.id); } }, "از بازنگریِ «" + clip(rec(r.origin.id).p.title, 40) + "»") : null))));
    if (r.dormant && r.dormant > t && !r.woke) root.appendChild(h("p", { class: "card soft small lp-dormnote" }, "این مسئله را خودت در بازنگری ساختی؛ " + A.fdate(r.dormant) + " برای حل برمی‌گردد — می‌توانی همین حالا هم شروعش کنی."));
    /* برگشتِ مسئلهٔ ساختهٔ خودت: «شروع می‌کنم» یا «فعلاً نه» — «فعلاً نه» یک پله دورتر روی همان نردبان (۳ ⇐ ۷ ⇐ ۲۱ ⇐ ۶۰)، نه هر روز */
    if (r.dormant && r.dormant <= t && !r.woke) root.appendChild(h("section", { class: "card soft lp-wake" }, h("p", { class: "small" }, "مسئله‌ای که خودت در بازنگری ساختی برگشته است. حالا حلش می‌کنی؟"),
      h("div", { class: "row gap wrap" }, h("button", { class: "btn sm lp-wakego", type: "button", onclick: function () { r.woke = nowISO(); S.put(r); A.go("lprob", pid, "u"); } }, "شروع می‌کنم"),
        h("button", { class: "btn ghost sm lp-snooze", type: "button", onclick: function () { var iv = U.nextIv(r.dIv || LADDER[1], true); r.dIv = iv; r.snoozes = (r.snoozes || 0) + 1; r.dormant = A.addDays(t, iv); S.put(r); A.toast("باشد؛ " + A.fdate(r.dormant) + " دوباره می‌پرسد."); A.go("e_prob", null, "live"); } }, "فعلاً نه"))));
    try { var rv = U.reviewPanel(r.p, pg); if (rv) root.appendChild(rv); } catch (e) { console.warn(e); }
    try { var wd = A.willDue ? A.willDue().filter(function (x) { return x.kind === "prob" && x.id === pid; }) : []; if (wd.length) { var hs = A.willHost("prob", pid); if (hs) root.appendChild(A.willCard(hs, "due")); } } catch (e) { console.warn(e); }
    try { var cc = coachCard(r, pg, s, ph); if (cc) root.appendChild(cc); } catch (e) { console.warn(e); }
    try { var ic = incubCard(r, pg, s); if (ic) root.appendChild(ic); } catch (e) { console.warn(e); }
    var os = openStep(s);
    if (os && os.due <= t && ph === "c") root.appendChild(outcomeCard(r, pg, s, os));
    /* تور ۱ (s34): امید/میلِ کم در آغاز ⇒ «🌱 کوچک‌ترین گامِ بعد» پیش از کارتِ کاملِ فهم؛ بعد به فهم می‌رود */
    var lowStart = ph === "u" && r.hope === "low" && !uOf(s) && !r.lowDone && A.willHost && A.willCard;
    if (lowStart) {
      var hsL = A.willHost("prob", pid), wl0 = hsL && hsL.box.will, committed = !!(wl0 && (wl0.log || []).some(function (x) { return x.trig === "live:lowstart"; }));
      if (hsL) root.appendChild(h("div", { class: "col gap lp-lowstart" }, prov("will"), A.willCard(hsL, "live:lowstart", "گفتی امید یا میلت کم است. پیش از فهمِ کامل، فقط کوچک‌ترین گامِ بعد: آن‌قدر کوچک که مطمئنی انجامش می‌دهی — حتی «فقط صورتِ مسئله را دوباره بخوانم». بعد با هم آن را می‌فهمیم."),
        h("button", { class: "btn " + (committed ? "" : "ghost ") + "sm lp-lowgo", type: "button", onclick: function () { r.lowDone = nowISO(); S.put(r); A.go("lprob", pid, "u"); } }, committed ? "گامِ کوچکم را نوشتم — حالا بفهمیمش" : "حالا مستقیم به فهمِ مسئله می‌روم")));
    }
    /* فهم */
    root.appendChild(sec("u", "۱) فهمِ مسئله" + (uOf(s) && ph !== "u" ? " ✓" : ""), want === "u" && !lowStart, ph === "u" ? uCard(r, pg, s) : [uSum(s),
      ph !== "done" ? h("button", { class: "btn ghost sm lp-reu2", type: "button", onclick: function () { L.reU = true; S.put(pg); A.go("lprob", pid, "u"); } }, "↺ دوباره فهمِ مسئله") : null]));
    if (ph === "u") return root;
    /* طرح */
    var planBody = [suffCard(r, pg, s, "p"), askCard(r, pg, s), relatedCard(r, pg, s), backCard(r, pg, s), auxCard(r, pg, s), movesCard(r, pg, s), planCard(r, pg, s), ph === "p" ? incubBtn(r, pg, s, "p") : null];
    root.appendChild(sec("p", "۲) طرح" + (L.plan && L.plan.at ? " ✓" : ""), want === "p", planBody));
    /* اجرا */
    var exBody = [];
    if (!(L.plan && L.plan.at)) exBody.push(h("p", { class: "small muted" }, "اول طرحت را ثبت کن (بخشِ ۲) — بعد گامِ واقعیِ بعد، با پیش‌بینی."));
    else if (ph === "c") {
      exBody.push(guessPanel(r, pg, s));
      exBody.push(stepsList(s));
      if (os && os.due > t) exBody.push(h("div", { class: "card soft small lp-cur" }, "گامِ جاری: «" + os.text + "» — وارسی " + A.fdate(os.due) + " ",
        h("button", { class: "btn ghost sm lp-early", type: "button", onclick: function () { os.due = t; var f0 = os.fc && S.get(os.fc); if (f0) { f0.due = t; S.put(f0); } S.put(pg); A.render(); } }, "زودتر انجامش دادم — نتیجه را ثبت کنم")));
      if (!os) { exBody.push(afterCard(r, pg, s)); exBody.push(stepForm(r, pg, s)); exBody.push(incubBtn(r, pg, s, "c")); }
      exBody.push(h("div", { class: "row gap wrap lp-endrow" },
        h("button", { class: "btn ghost sm lp-solved", type: "button", onclick: function () { L.state = "solved"; L.stateAt = nowISO(); S.put(pg); A.go("lprob", pid, "back"); } }, "✅ حل شد — بازنگری"),
        h("button", { class: "btn ghost sm lp-abandon", type: "button", onclick: function () { L.state = "abandoned"; L.stateAt = nowISO(); S.put(pg); A.go("lprob", pid, "back"); } }, "⏹ آگاهانه کنارش می‌گذارم")));
    } else exBody.push(stepsList(s));
    root.appendChild(sec("c", "۳) اجرا روی واقعیت", want === "c", exBody));
    root.appendChild(sec("claims", "ادعاهای درونِ مسئله" + (L.claims.length ? " (" + fa(L.claims.length) + ")" : ""), want === "p" || want === "c", claimsCard(r, pg, s), "lp-claimsec"));
    if (ph === "b" || ph === "done") root.appendChild(sec("b", "۴) بازنگری", true, ph === "b" ? lookBack(r, pg, s) : backSummary(s)));
    try { if (A.HOST && A.HOST.upload && A.attachSection) root.appendChild(A.attachSection(r.id, { group: "مسئله‌های من", title: r.p.title || "مسئله" })); } catch (e) { console.warn(e); }
    return root;
  };
  /* e_prob با شناسهٔ مسئلهٔ زنده (پیوندهای «امروز»، 🌱، مرورِ فاصله‌دار، آینهٔ درایو) ⇒ همین صفحه */
  var rawE = A.V.e_prob;
  if (rawE) A.V.e_prob = function (pid, tab) { if (pid && rec(pid)) return A.V.lprob(pid, tab === "sim" ? null : tab); return rawE.apply(this, arguments); };
  /* همهٔ خواننده‌های «مسئله» (🌱، مرورِ فاصله‌دار، کارنامه) این مسئله را هم بیابند — بی آن‌که در شبیه‌ساز، حرکت‌ها یا گرافِ «prob» بیاید (A.probs دست نمی‌خورد) */
  var rawG = A.getProb;
  if (rawG) A.getProb = function (id) { var p = rawG(id); if (p) return p; var r = rec(id); return r ? r.p : p; };

  /* ---------- «امروز»: یک سطر برای هر نوع ---------- */
  A.liveDue = function () {
    var t = A.today(), steps = [], back = [], incub = [], coach = [];
    lives().forEach(function (r) {
      if (r.dormant && r.dormant <= t && !r.woke) back.push(r);
      var pg = S.get("eprog_" + r.p.id); if (!pg || !pg.solve || !pg.solve.live) return;
      var s = solOf(pg), o = openStep(s), ph = phaseOf(s); if (o && o.due <= t && ph === "c") steps.push({ r: r, st: o });
      var L = live(s);
      if (ph !== "done" && L.incub && !L.incub.back && L.incub.due <= t) incub.push(r);   // «کنار بگذار تا فردا» ⇒ فردا: چه به ذهنت رسید؟
      if (r.coach && L.coach && L.coach.due && L.coach.due <= t && L.coach.last && !L.coach.last.back) coach.push(r);   // پیگیریِ فاصله‌دارِ مربیگری
    });
    return { steps: steps, back: back, incub: incub, coach: coach };
  };
  if (typeof A.dueList === "function" && !A.dueList._live) {
    var rawDue = A.dueList;
    A.dueList = function () {
      var items = rawDue.apply(this, arguments) || [];
      try {
        var D = A.liveDue();
        if (D.steps.length === 1) { var x = D.steps[0]; items.push({ k: "knot", live: 1, txt: "🔭 گامِ واقعی: «" + clip(x.st.text, 70) + "» — انجامش دادی؟ چه شد؟", sub: "«" + clip(x.r.p.title, 50) + "» · پیش‌بینی‌ات: «" + clip(x.st.pred, 60) + "»", go: function () { A.go("lprob", x.r.p.id, "exec"); } }); }
        else if (D.steps.length > 1) items.push({ k: "knot", live: D.steps.length, txt: "🔭 " + fa(D.steps.length) + " گامِ واقعی موعدِ وارسی است — انجامش دادی؟ چه شد؟", sub: D.steps.slice(0, 3).map(function (y) { return "«" + clip(y.r.p.title, 40) + "»"; }).join(" · "), go: function () { A.go("lprob", D.steps[0].r.p.id, "exec"); } });
        if (D.back.length === 1) { var b = D.back[0]; items.push({ k: "knot", live: 1, txt: "🧩 مسئلهٔ تازه‌ای که خودت ساختی برگشت: «" + clip(b.p.title, 70) + "»", sub: "از بازنگریِ یک مسئلهٔ دیگر — حالا حلش کن", go: function () { A.go("lprob", b.p.id, "u"); } }); }
        else if (D.back.length > 1) items.push({ k: "knot", live: D.back.length, txt: "🧩 " + fa(D.back.length) + " مسئلهٔ تازه‌ای که خودت ساختی برگشت", sub: D.back.slice(0, 3).map(function (y) { return "«" + clip(y.p.title, 40) + "»"; }).join(" · "), go: function () { A.go("lprob", D.back[0].p.id, "u"); } });
        D.incub.forEach(function (y) { items.push({ k: "knot", live: 1, txt: "😴 دیروز «" + clip(y.p.title, 60) + "» را کنار گذاشتی — چه چیزی به ذهنت رسید؟", sub: "پس از تلاشِ جدی؛ همان را بنویس، حتی «هیچ»", go: function () { A.go("lprob", y.p.id); } }); });
        D.coach.forEach(function (y) { items.push({ k: "knot", live: 1, txt: "🧑‍🏫 پیگیریِ مربیگری: «" + clip((y.coach && y.coach.who) || "", 30) + "» — «" + clip(y.p.title, 50) + "»", sub: "این بار بی همان پرسش (یا با پرسشی کلی‌تر) می‌رسد؟", go: function () { A.go("lprob", y.p.id); } }); });
      } catch (e) { console.warn(e); }
      return items;
    };
    A.dueList._live = true;
  }

  /* ---------- نما و منو ---------- */
  A.VIEW_META = A.VIEW_META || {};
  A.VIEW_META.lprob = { j: "untie", what: "یک مسئلهٔ حل‌نشدهٔ خودت (تصمیم، پروژه، پرسشِ فکری) در همان تونلِ حل: فهم با فهرستِ داده‌ها، طرح با یک پرسش در هر نوبت، گام‌های واقعی با پیش‌بینی و نتیجه در موعد، بازنگری.",
    why: "تا روشِ حلِ مسئله روی زندگیِ واقعی‌ات کار کند — داور واقعیت است، نه پاسخِ ذخیره‌شده؛ پیش‌بینی‌هایت کالیبره می‌شوند و درس‌ها برمی‌گردند.", next: [["e_prob", "مسئله‌های من"]] };
  A.SUB_VIEWS = A.SUB_VIEWS || {}; if (!A.SUB_VIEWS.lprob) A.SUB_VIEWS.lprob = "e_prob";

  /* ---------- دستیار: ساختن از حرفِ خودِ کاربر، و پرسشِ یکی‌یکی در مرحلهٔ همین مسئله (فقط وقتی به کار است) ---------- */
  var AS = A.ASSIST;
  if (AS) {
    AS.DO = AS.DO || {};
    /* {"do":"live_new","title":"…","statement":"عینِ حرفِ کاربر","kind":"find|prove|pod"} — فقط صورت؛ فهم، داده‌ها، پیش‌بینی و نتیجه را خودِ کاربر می‌نویسد */
    AS.DO.live_new = function (a) {
      var st = clip(a && a.statement, 1500), ti = clip((a && a.title) || firstSentence(st), 80);
      if (txt(st).length < 10) return "مسئله ثبت نشد: «statement» (عینِ حرفِ کاربر، دست‌کم یک جمله) لازم است";
      var s0 = AS._turnSession, r = create(ti, st, a && a.kind, { by: "assistant", sess: (s0 && s0.id) || "", nat: a && a.nat });
      if (s0) A.liveBindSession(r.p.id, s0);
      return "";
    };
    if (typeof AS.solvingCtx === "function") {
      /* معلمِ عامِ حل مرحله را از شبیه‌ساز می‌خواند؛ مسئلهٔ زنده قلابِ خودش را دارد (پایین) — دو معلم با دو مرحله هم‌زمان نه */
      var rawCtx = AS.solvingCtx;
      AS.solvingCtx = function (s) { var c = rawCtx.apply(this, arguments); if (c && c.p && c.p.live) return null; var st = A.state || {}; if (st.view === "lprob") return null; return c; };
    }
    var RULES = "# مسئلهٔ واقعیِ حل‌نشده («🔭 مسئلهٔ حل‌نشدهٔ خودم»)\n- اگر کاربر مسئلهٔ واقعیِ بازی آورد که پاسخش را نمی‌داند (تصمیم، پروژه، پرسشِ فکری، یا مسئلهٔ ریاضی/معمایی که هنوز حل نکرده) و می‌خواهد حلش کند، با {\"do\":\"live_new\",\"title\":\"…\",\"statement\":\"عینِ حرفِ خودش\",\"nat\":\"life|practical|objective\"} ثبتش کن و او را با {\"do\":\"go\",\"view\":\"lprob\",\"arg\":\"<شناسه>\"} به صفحه‌اش ببر (شناسه را در نوبتِ بعد از «مسئلهٔ زندهٔ این سشن» بخوان) — یا او را به «مسئله‌های بزرگ › 🔭 مسئلهٔ حل‌نشدهٔ خودم» ببر.\n- حلش نکن و تصمیم را جای او نگیر؛ هیچ فیلدِ فهم، داده، پیش‌بینی، نتیجه یا بازنگری را پر نکن (data-own). هر نوبت فقط یک پرسش، از کلی به خاص.";
    /* فقط وقتی خودِ کاربر از یک تصمیم یا مسئلهٔ بازِ زندگی‌اش می‌گوید — نه «فونتِ صفحه ریز است»، نه «کارتِ مرور حل نشده» */
    var LIVE_RE = /نمی[‌\s]?(?:دونم|دانم)\s*(?:چی[‌\s]?کار|چه[‌\s]*کار|کدوم|کدام)\s*(?:کنم|رو|را|بکنم|انتخاب)|(?:باید|می[‌\s]?خوام|می[‌\s]?خواهم)\s*(?:یه|یک)?\s*تصمیم\s*(?:بگیرم|بگیریم)|بین\s+[^.؟?]{2,60}\s+(?:انتخاب\s*کنم|تصمیم\s*بگیرم)|(?:بپذیرم|قبول\s*کنم|برم|بمونم|بمانم)\s*یا\s*(?:نه|نپذیرم|بمونم|بمانم|برم)|مسئله(?:‌ای)?\s+(?:تو|در)\s+زندگی(?:‌ام|م)?|گیر\s*کرده‌?ام\s*(?:سرِ|سر|توی|در)\s*(?:تصمیم|انتخاب|پروژه)|(?:^|\s)[بن][ء-یپچژکگ]{1,12}م\s+یا\s+(?:نه|[بن]?[ء-یپچژکگ]{1,12}م)(?![ء-یپچژکگ])|جا\s*(?:می[‌\s]?شه|می[‌\s]?شود|می[‌\s]?گیره)\s*یا\s*نه|(?:چند|چقدر|چه\s*قدر)\s*(?:تا\s*)?ب[ء-یپچژکگ]{2,12}م(?![ء-یپچژکگ])/;
    AS.promptHooks = AS.promptHooks || [];
    AS.promptHooks.push(function (s, msg) { var recent = [String(msg || "")].concat(((s && s.msgs) || []).filter(function (m) { return m.role === "user"; }).slice(-4).map(function (m) { return m.text; })).join(" "); return LIVE_RE.test(recent) ? RULES : ""; });
    var EXEC_Q = ["پیش از این گام: فکر می‌کنی چه می‌شود، و چقدر مطمئنی؟", "روشن می‌بینی که این گام به مجهول نزدیکت می‌کند — به کدام داده تکیه دارد؟", "کی انجامش می‌دهی؟ روزش را بگو تا همان روز بپرسم چه شد.", "آنچه شد با پیش‌بینی‌ات چه فاصله‌ای داشت — و این فاصله دربارهٔ فهمت از مسئله چه می‌گوید؟"];
    AS.promptHooks.push(function (s, msg) {
      var st = A.state || {}, onPage = st.view === "lprob" || (st.view === "e_prob" && rec(st.arg)), pid = onPage ? st.arg : (s && s.lprob), r = rec(pid); if (!r) return "";
      var pg = pgOf(pid), so = solOf(pg), ph = phaseOf(so), TQ = AS.tutorQuestions || {};
      if (ph === "done") return "";   // مسئلهٔ بسته‌شده دیگر «مسئلهٔ زندهٔ این سشن» نیست
      /* بیرون از صفحهٔ خودش فقط وقتی پیام دربارهٔ همین مسئله است (دست‌کم دو واژهٔ معنادارِ مشترک با عنوان/صورت/مجهول) */
      if (!onPage) { var mt0 = toks(msg), pt = toks([r.p.title, r.p.statement, (uOf(so) || {}).u].join(" ")); if (mt0.filter(function (w) { return hit(w, pt); }).length < 2) return ""; }
      /* تور ۱ ِ پولیا: داورِ مسئله (nat) متنِ قلاب را عوض می‌کند — مسئلهٔ کامل‌بیان‌شده «هیچ‌کس نمی‌داند» نیست؛ گام‌هایش با «روشن می‌بینی؟ می‌توانی ثابت کنی؟» (TQ.exec) */
      var nat = natOf(so, r);
      var Q = ph === "u" ? ((TQ.und && TQ.und.qs) || []) : ph === "p" ? (A.solveAskList ? A.solveAskList("p", 1, typeOf(r, so)) : []) : ph === "c" ? (nat === "objective" && TQ.exec && TQ.exec.qs ? TQ.exec.qs : EXEC_Q) : ((TQ.back && TQ.back.qs) || []);
      var tu = (s && (s.lpTutor = s.lpTutor || {})) || {}, k = pid + "|" + ph, mt = String(msg || "").trim();
      if (mt && !/^\[سامانه/.test(mt) && tu.last !== mt) { tu[k] = tu.last == null || tu.ph !== k ? (tu[k] || 0) : (tu[k] || 0) + 1; tu.last = mt; tu.ph = k; }
      /* طرح: همان پرسشی که کارتِ «❔ پرسشِ همین لحظه» در صفحه نشان می‌دهد (هم‌گام با صفحه، نه یک نوبت عقب) */
      var qi = Q.length ? (ph === "p" && pg.tut && pg.tut.qi && pg.tut.qi.lplan != null ? pg.tut.qi.lplan : (tu[k] || 0)) % Q.length : 0, un = unusedOf(so, pg), o = openStep(so);
      if (ph === "p" && Q.length && ((pg.tut || {}).plan || []).some(function (e) { return e && e.src === "live" && !e.skip && e.text && e.q === Q[qi]; })) qi = (qi + 1) % Q.length;   // پرسشِ پاسخ‌داده دوباره پیشنهاد نمی‌شود
      var pv = provOf(ph === "u" ? "u" : ph === "p" ? "p" : ph === "c" ? (nat === "objective" ? "cobj" : "c") : "b"), rt = ph === "p" && Q.length ? roteState(pg, so, Q) : null;
      return ["# مسئلهٔ زندهٔ این سشن (" + pid + "): «" + clip(r.p.title, 80) + "» · مرحله: " + PHN[ph] + " · داور: " + NAT[nat].fa.split(" — ")[0],
        nat === "objective" ? "- این مسئله پاسخِ عینی دارد (ریاضی، اثبات، معما) ولی کاربر هنوز حلش نکرده: پاسخ یا راه را لو نده و گامی را جای او برندار. هر گامش را با «روشن می‌بینی که این گام درست است؟ می‌توانی ثابت کنی؟» بسنجد؛ اگر گامی نادرست است، با پرسشی که او را به دیدنش برساند کمک کن، نه با گفتنِ جواب. فیلدهای صفحه را پر نکن (data-own)."
          : "- پاسخِ این مسئله را هیچ‌کس نمی‌داند — نه تو نه صفحه. حلش نکن، تصمیم را جای او نگیر، و دربارهٔ درستیِ گام‌ها یا تصمیمش داوری نکن (داور واقعیت و داوریِ خودِ اوست). فیلدهای صفحه را پر نکن (data-own).",
        nat === "practical" ? "- مسئلهٔ عملی: داده‌ها بی‌شمار و نادقیق‌اند — بپرس کدام داده‌ها اثرِ محسوس دارند، کجا خط می‌کشد و کدام تقریب بس است؛ داده‌ای که با دلیل کنار گذاشته شده رسیدگی‌شده است." : "",
        r.coach ? "- کاربر مربیِ «" + clip(r.coach.who, 30) + "» است، نه حل‌کننده: پرسش‌هایی برای پرسیدن از یادگیرنده پیشنهاد کن (کلی ⇐ خاص)، هرگز پاسخ؛ یک پرسش یا یک ایده در هر پیام." : "",
        rt ? "- کاربر پرسش‌ها را مکانیکی پاسخ داده (" + rt.why + "): بگو «پرسش‌ها را مکانیکی نخوان» و بپرس کدام پرسش واقعاً با وضعِ همین لحظه می‌خواند." : "",
        Q.length ? "- در این نوبت فقط **یک** پرسش، از همین فهرست و از کلی به خاص؛ پرسشِ پیشنهادیِ این نوبت: «" + Q[qi] + "». اگر با وضعِ همین لحظه نمی‌خواند، پرسشِ بعدیِ همین فهرست." : "",
        pv ? "- حکمتِ ضرب‌المثل‌ها برای همین مرحله (فقط اگر به کار آمد، همراهِ پرسشی که پشتیبانی می‌کند؛ قاعدهٔ قطعی نیست): «" + pv.t + "» ⇐ «" + pv.q + "»" : "",
        un.length && ph !== "u" ? "- داده‌هایی که هنوز به کار نرفته‌اند (اگر به کار آمد، یکی را با نامش بپرس: «از … استفاده کردی؟»): " + un.map(function (d) { return "«" + clip(d.t, 50) + "»"; }).join("، ") : "",
        o ? "- گامِ واقعیِ باز: «" + clip(o.text, 80) + "» · پیش‌بینی‌اش «" + clip(o.pred, 80) + "» · وارسی " + o.due + " — نتیجه را خودش در صفحه ثبت می‌کند." : ""].filter(Boolean).join("\n");
    });
  }
})(APP);
