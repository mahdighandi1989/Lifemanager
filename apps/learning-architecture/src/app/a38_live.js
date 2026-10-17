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
  /* A13 (s30/s34/s35): پیامِ «اول این‌ها: …» ِ کهنه پس از ثبتِ موفق یا رفتن به نمای دیگر پاک می‌شود — وگرنه کاربر نمی‌داند ثبت شد یا نه */
  function clearBad() { try { var tb = document.getElementById("toasts"); if (tb) Array.prototype.slice.call(tb.querySelectorAll(".toast.bad")).forEach(function (e) { e.remove(); }); } catch (e) { }
    try { if (A.ASSIST && typeof A.ASSIST.dropBadToasts === "function") A.ASSIST.dropBadToasts(); } catch (e) { } }   // E8 (دورِ ۴): ردِ کهنه از «پیام‌های اخیرِ صفحه» ِ دستیار هم می‌رود
  A.liveClearBad = clearBad;
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
  /* G5 (دورِ ۶، s03/s05/s10): واژهٔ «خواسته» بر حسبِ نوع و داور — یافتنی «مجهول»، اثباتیِ عینی «حکم»، «اثبات یا رد کن» ِ زندگی «فرضیه» (برهان ندارد) */
  function proofLike(r, s) { var t = typeOf(r, s); return t === "prove" || (t === "pod" && natOf(s, r) === "objective"); }
  function goalWord(r, s) { var t = typeOf(r, s); return t === "find" ? "مجهول" : t === "pod" && natOf(s, r) !== "objective" ? "فرضیه" : "حکم"; }
  /* G5 (دورِ ۶، s03): نامِ مرحلهٔ سوم — «اجرا روی واقعیت» فقط وقتی داور واقعیت است؛ مسئلهٔ کامل‌بیان‌شده گام‌به‌گام با وارسی و برهان اجرا می‌شود */
  function phName(ph, r, s) { return ph === "c" && r && natOf(s, r) === "objective" ? "اجرای طرح (گام‌به‌گام، با وارسی)" : PHN[ph]; }

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
  /* تکمنبعِ داور (دورِ ۲ ِ تورِ پولیا، R2؛ ۲۰۲۶-۱۰-۱۶): داور روی خودِ رکورد است (r.p.nat) — نه پیش‌نویسِ کارتِ فهم و نه پیش‌فرضِ «life».
     • «اثباتی» و «اثبات یا رد کن» ذاتاً پاسخِ عینی دارند (حکم یا درست است یا نه) ⇒ همیشه objective؛
     • وگرنه r.p.nat (انتخابِ کاربر، یا پیشنهادِ کد که در فرم پیش‌انتخاب شد و کاربر عوضش نکرد)؛ رکوردِ پیشین: u.nat (یک بار به r.p.nat می‌رود، fill-empty)؛
     • هیچ‌کدام ⇒ «life» فقط برای خواندن (رفتارِ پیشین)؛ کارتِ فهم در این حالت انتخابِ صریح می‌خواهد (A.liveKindInfo(pid).set = false). */
  /* D1 (دورِ ۳ ِ تور، تصمیمِ واگذارشدهٔ مالک ۲۰۲۶-۱۰-۱۶): «اثباتی / اثبات یا رد کن» پیش‌فرضشان کامل‌بیان‌شده است، نه اجبار — فرضیهٔ زندگی
     («X برای من درست است؟») شکلِ «اثبات یا رد کن» دارد ولی برهان ندارد (s05: آزمونِ بدگمانیِ محلِ کار برهان‌سنجی شد و «هرگز یقین» را گم کرد).
     پیش‌فرض فقط وقتی می‌ماند که داورِ صریحی (انتخابِ کاربر، ارث از پدر، دستیار با nat ِ صریح) روی رکورد نیست. */
  function natExplicit(r) { var p = r && r.p; return p && NAT[p.nat] && p.natBy && p.natBy !== "type" && p.natBy !== "guess" ? p.nat : ""; }
  function natOf(s, r) {
    var u = uOf(s), ty = (u && u.type) || (s && s.type) || (r && r.p && (r.p.kind || r.p.ptype));
    if ((ty === "prove" || ty === "pod") && NAT.objective) return natExplicit(r) || "objective";
    var n = (r && r.p && r.p.nat) || (u && u.nat); return NAT[n] ? n : "life";
  }
  function natSet(s, r) { var u = uOf(s), ty = (u && u.type) || (s && s.type) || (r && r.p && r.p.kind); return ty === "prove" || ty === "pod" || !!(r && r.p && NAT[r.p.nat]) || !!(u && NAT[u.nat]); }
  A.liveNature = function (pid) { var r = rec(pid); if (!r) return null; return natOf(solOf(pgOf(pid)), r); };
  /* نامِ صادرشده برای قلاب‌های بیرونی (تور، دستیار): «life» | «practical» | «objective» — همان data-lp-kind ِ صفحه */
  A.liveKind = A.liveNature;
  /* شرحِ کامل برای دستیار و تور: داور، نوع (find/prove/pod)، فضایی بودن، و این‌که داور انتخاب/تأیید شده یا فقط خوانشِ پیش‌فرض است */
  A.liveKindInfo = function (pid) {
    var r = rec(pid); if (!r) return null; var s = solOf(pgOf(pid)), k = natOf(s, r);
    return { kind: k, type: typeOf(r, s), spatial: spatialOf(s, r), set: natSet(s, r), by: (typeOf(r, s) === "prove" || typeOf(r, s) === "pod") && !natExplicit(r) ? "type" : (r.p.natBy || (r.p.nat ? "user" : uOf(s) && uOf(s).nat ? "legacy" : "default")), fa: NAT[k].fa.split(" — ")[0] };
  };
  /* فضایی بودن هم روی رکورد (r.p.spatial)؛ فقط با انتخابِ صریح (تیکِ کارتِ فهم) یا ارث از مسئلهٔ پدر — واژه‌ها فقط پیشنهاد می‌دهند */
  function spatialOf(s, r) { var u = uOf(s); if (r && r.p && r.p.spatial != null) return !!r.p.spatial; return !!(u && u.spatial); }
  A.liveSpatial = function (pid) { var r = rec(pid); return r ? spatialOf(solOf(pgOf(pid)), r) : false; };
  /* پیشنهاد (نه حکم) — پیش‌انتخاب در فرم و کارتِ فهم، کاربر عوضش می‌کند. ترتیب: کامل‌بیان‌شده (ریاضی، اثبات، معما، شمارش، شطرنج، دومینو، احتمال…)
     ⇐ عملی (عدد کنارِ واحدِ فیزیکی یا پولی؛ «٪» و ساعت/دقیقه به‌تنهایی نه — دومینوی «۶ ساعت» عملی نیست) ⇐ زندگی (تصمیمِ «… یا …»، شغل، رابطه) ⇐ هیچ (بی پیش‌انتخاب) */
  /* D4 (دورِ ۳): واژه‌ها کامل سنجیده می‌شوند — مرزِ واژهٔ فارسی (آغاز، فاصله، نیم‌فاصله که norm آن را فاصله می‌کند، نشانه‌گذاری) و فقط پسوندهای
     دستوری؛ نه زیرِرشته («۱۰۰۰ تاست» ≠ تاس، «کمتره» ≠ متر، «احتمالاً» ≠ احتمال). */
  var WB0 = "(?:^|[\\s.,،؛:!?؟()«»\"'/\\-])", WB1 = "(?:ها|های|هایی|ی|ای|یی|ات|ه|ش|اش|م|یم|ید|ند)?(?=$|[\\s.,،؛:!?؟()«»\"'/\\-])";
  function wordsRe(alts) { return new RegExp(WB0 + "(?:" + alts + ")" + WB1); }
  var OBJ_W = wordsRe("ثابت\\s*کن|اثبات|برهان|معادله|مثلث|دایره|عدد\\s*اول|معما|بخش\\s*پذیر|ریاضی|هندسه|زاویه|چندضلعی|المپیاد|شطرنج|دومینو|پازل|سودوکو|جدول\\s*کلمات|کلمات\\s*متقاطع|احتمال|تاس|سکه|جایگشت|استقرا|استقراء|مماس|حوض|مجموع\\s*(?:اعداد|جمله)|دنباله|تمرین\\s*(?:ریاضی|کتاب|درس)|تکلیف\\s*(?:ریاضی|درسی|مدرسه|پسرم|دخترم)");
  var OBJ_SYM = /(?:^|\s)(?:به\s*)?چند\s*(?:راه|روش|طریق|حالت|جور|ترتیب|مسیر)(?=\s|$|[.,،؛:!?؟])|[a-z]\s*[≥≤]\s*\d|\d\s*[a-z]\s*[+=]/;
  var PRAC_W = wordsRe("کیلومتر|سانتی\\s*متر|میلی\\s*متر|متر\\s*مربع|متر\\s*مکعب|متر|سانت|کیلوگرم|کیلو|گرم|لیتر|تومان|تومن|ریال|دلار|یورو|قسط|وام|اجاره|حجم|مساحت|ظرفیت|میلیون|میلیارد");
  /* «مسئلهٔ عملی» یعنی قید یا منبعِ واقعیِ خودِ کاربر، نه صرفِ واحد (D4): مسئلهٔ کتابیِ سوم‌شخص با واحد («مخزنی ۳۰۰ لیتری … در چند دقیقه پر می‌شود؟»)
     کامل‌بیان‌شده است؛ «… بخرم»، «… دارم»، «خانه‌ام» نشانهٔ موقعیتِ خودِ اوست. */
  /* E2 (دورِ ۴ ِ تور، s36/s37/s38/s13/s01): «عملی» = سهمِ واقعیِ خودِ کاربر — اول‌شخصِ مفرد همراهِ منبع/پیامدی که مالِ اوست (بخرم، بفروشم، سود کنم،
     پولم، خانه‌ام، دارم)؛ صدای کتابِ درسی با اول‌شخصِ جمع («۲۰ لیتر آب‌نمک داریم … چند لیتر اضافه کنیم؟»، «قیفی داریم») با داده‌های عددیِ کامل و یک
     مجهولِ محاسبه‌ای ⇒ کامل‌بیان‌شده. فعلِ دانستن/یافتن ِ مفرد («می‌خوام بدونم»، «چطور پیدا کنم»، «امتحان کنم») سهم نیست. صورتِ نقل‌شده در «…» (تکلیفِ
     دخترم: «…») خودش مسئله است — پیشنهاد اول از همان. دوراهیِ اخلاقی («گزارش بدم یا نه؟ درستش چیه؟») زندگی است، حتی با «هزار تومن». */
  var STAKE_RE = /(?:^|\s)(?:می\s*|نمی\s*|ب|ن)?(?:خرم|فروشم|فروشمش|پردازم|سازم|کارم|چینم)(?=$|[\s.,،؛:!?؟]|ش)|(?:خرج|سود|ضرر|پس\s*انداز|اجاره|قرض|سرمایه\s*گذاری|هزینه|سفارش)\s*(?:کنم|بکنم|می\s*کنم|نکنم|بدم|بدهم)(?=$|[\s.,،؛:!?؟])|(?:وام|قرض|خانه|خونه|ماشین)\s*(?:بگیرم|نگیرم|می\s*گیرم)(?=$|[\s.,،؛:!?؟])|(?:^|\s)جا\s*(?:بدم|بدهم|بدیم)(?=$|[\s.,،؛:!?؟])|(?:^|\s)(?:دارم|ندارم)(?=$|[\s.,،؛:!?؟])|(?:پول|حقوق|درآمد|بودجه|پس\s*انداز|خانه|خونه|اتاق|باغ|باغچه|حیاط|ماشین|مغازه|وام|قسط|اجاره|کیک|قالب)\s*(?:ام|م|مان|مون)(?=$|[\s.,،؛:!?؟])|(?:^|\s)(?:قالب|دستور|ظرف|اتاق|خانه|خونه|ماشین|موتور|باغ|باغچه|حیاط|پول|حقوق|بودجه|مغازه|آشپزخانه|آشپزخونه|فر|کیک)\s*(?:ِ\s*)?(?:من|ما)(?=$|[\s.,،؛:!?؟])|(?:^|\s)(?:می\s*|نمی\s*)(?:رسیم|رسم)\s*[?؟]/;
  /* F4 (دورِ ۵، s23/s26): منبعِ واقعیِ خودِ کاربر هم سهم است — «قالبِ من»، «سه نفریم… می‌رسیم؟» (پرسشِ رسیدنِ خودمان، نه مقدارِ محاسبه‌ای ِ کتاب) */
  var FIRST_S = /(?:^|\s)(?:من|خودم)(?=$|[\s.,،؛:!?؟])|(?:^|\s)(?:می\s*|نمی\s*|ب|ن)[ء-یپچژکگ]{2,12}م(?=$|[\s.,،؛:!?؟])|(?:^|\s)(?:دارم|ندارم|هستم|برم|کنم|باشم|خواهم|بگم)(?=$|[\s.,،؛:!?؟])|(?:^|\s)(?:مجهول|پسر|دختر|همکار|همسر|راه)(?:م|ام)(?=$|[\s.,،؛:!?؟])/;
  var QUEST_RE = /[?؟]|(?:^|\s)(?:چند|چقدر|چه\s*قدر|چه\s*مقدار|کدام|بیابید|بیاب|حساب\s*کنید|پیدا\s*کنید)(?=$|[\s.,،؛:!?؟])/;
  var TEXT_IMP = /(?:^|\s)(?:پیدا\s*کنید|بیابید|حساب\s*کنید|به\s*دست\s*آورید|نشان\s*دهید|ثابت\s*کنید)(?=$|[\s.,،؛:!?؟])/;
  var ETHIC_RE = /درستش\s*(?:چیه|چیست)|کار\s*(?:ِ\s*)?درست\s*(?:چیه|چیست|کدام)|اخلاق|وجدان|شریک\s*(?:ِ\s*)?جرم|گزارش\s*(?:بدم|ندم|بدهم)|لو\s*(?:بدم|بدهم)|دروغ\s*(?:بگم|بگویم)|خیانت|قانون\s*چی\s*می\s*گه/;
  var QTY_Q = /(?:چقدر|چه\s*قدر|چه\s*اندازه|چند)\s*(?:تا\s*)?(?:بزرگ|کوچک|بلند|پهن|عمیق|حجم|جا|لیتر|متر|کیلو|گرم|پول|تومن|تومان|ظرفیت)/;
  var LIFE_RE = /(?:^|\s)[بن][ء-یپچژکگ]{1,12}م\s+یا\s+\S|[ء-یپچژکگ]{1,12}(?:م|یم)\s+یا\s+نه(?![ء-یپچژکگ])|تصمیم|شغل|ازدواج|مهاجرت|همسر|رابطه|پیشنهادِ?\s*کار|بمونم|بمانم/;
  function natGuess0(x) {
    if (OBJ_W.test(x) || OBJ_SYM.test(x)) return "objective";
    if (ETHIC_RE.test(x)) return "life";
    if (/\d/.test(x) && PRAC_W.test(x)) { if (STAKE_RE.test(x)) return "practical"; if (QUEST_RE.test(x) && !FIRST_S.test(x)) return "objective"; }
    if (TEXT_IMP.test(x) && !FIRST_S.test(x)) return "objective";
    /* G5 (دورِ ۶، s17): منبعِ خودِ کاربر («مخزن … بسازم»، «باغ»، «انبار») با پرسشِ اندازه/مقدار («چقدر بزرگ؟») مسئلهٔ عملی است حتی بی عدد و حتی وقتی
       «بتنی بسازم یا پلاستیکی؟» شکلِ دوراهی دارد — دوراهی این‌جا بخشی از همان کارِ کمّی است، نه تصمیمِ زندگی */
    if (STAKE_RE.test(x) && QTY_Q.test(x)) return "practical";
    /* G5 (دورِ ۶، s08): معمای سوم‌شخص/جمع با چند عدد و پرسشِ «چطور؟/چند؟» («دو ساعت‌شنی داریم، ۷ و ۱۱ دقیقه … ۱۵ دقیقه چطوری؟») کامل‌بیان‌شده است —
       بی سهمِ خودِ کاربر (اول‌شخصِ مفرد یا منبعِ خودش) و بی شکلِ دوراهی */
    if ((x.match(/\d+(?:[.٫]\d+)?/g) || []).length >= 2 && (QUEST_RE.test(x) || /(?:^|\s)چطور/.test(x)) && !FIRST_S.test(x) && !STAKE_RE.test(x) && !LIFE_RE.test(x)) return "objective";
    if (LIFE_RE.test(x)) return "life";
    return "";
  }
  function natGuess(t) {
    var x = norm(t), qs = [], m, QRE = /«([^«»]{12,})»/g;
    while ((m = QRE.exec(x))) qs.push(m[1]);
    if (qs.length) { var gq = natGuess0(qs.join(" ")); if (gq) return gq; }
    return natGuess0(x);
  }
  /* E2: نوعِ پیشنهادی از صورت (پیش‌انتخاب، نه حکم) — «ثابت کنید/نشان دهید که» ⇒ اثباتی؛ «آیا …؟» یا «… هنوز درست است؟» ⇒ اثبات یا رد کن */
  var PROVE_W = /ثابت\s*(?:کن|کنید|کنیم)|اثبات\s*کن|نشان\s*(?:بده|دهید|بدهید)\s*که|برهان\s*بیاور/;
  var POD_W = /اثبات\s*یا\s*رد|(?:^|[\s«(])آیا\s|(?:درست|برقرار|صادق|صحیح)\s*(?:است|هست|ه|می\s*ماند|میمونه|می\s*مونه)?\s*[?؟]/;
  /* F4 (دورِ ۵، s25/s33): ادعایی که درستی‌اش پرسیده می‌شود هم «اثبات یا رد کن» است — «درسته؟»، «حق داره؟»، «همیشه … میشه»، «فکر کنم … درسته؟»؛
     دوراهیِ تصمیم («برم یا بمونم؟»، «کدوم بهتره؟») نه — آن تصمیم است، نه ادعا */
  var POD_CHAT = /(?:درست|درسته|درسته\s*دیگه|راست|راسته|حق)\s*(?:است|هست|ه|داره|دارد|می\s*گه|میگه)?\s*(?:دیگه|یا\s*نه)?\s*[?؟]|(?:^|\s)همیشه\s[^.؟?!\n]{1,60}\s(?:میشه|می\s*شود|می\s*شه|است|هست)(?=$|[\s.,،؛:!?؟…])|فکر\s*(?:کنم|می\s*کنم)\s[^.؟?!\n]{1,80}(?:درسته|درست\s*است|درسته\s*دیگه)|حدس\s*(?:م|ام|ِ?\s*من)?\s*(?:اینه|این\s*است|این\s*هست)\s*که|حدس\s*می\s*زنم\s*(?:که\s*)?\S/;   // G5 (دورِ ۶، s25): «حدسم اینه که …» ادعایی است که باید ثابت یا رد شود
  var DECIDE_RE = /(?:^|\s)[بن][ء-یپچژکگ]{1,12}م\s+یا\s+\S|کدوم\s*بهتر|کدام\s*بهتر|چی\s*کار\s*کنم|چه\s*کار\s*کنم/;
  function typeGuess(t) { var x = norm(t); if (/اثبات\s*یا\s*رد/.test(x)) return "pod"; if (DECIDE_RE.test(x)) return ""; if (POD_CHAT.test(x)) return "pod"; if (LIFE_RE.test(x) || ETHIC_RE.test(x)) return ""; return POD_W.test(x) ? "pod" : PROVE_W.test(x) ? "prove" : ""; }
  A.liveTypeGuess = typeGuess;
  A.liveNatGuess = natGuess;

  /* ---------- «حکمتِ ضرب‌المثل‌ها» (تور ۱ ِ پولیا، s35): ثبت‌گاهِ کوچکِ گفته‌های اکتشافیِ خودِ کتاب — نقلِ ترجمه (sources/polya_how_to_solve_it/items.json،
     C151–C168)، هر کدام کنارِ همان پرسشی که پشتیبانی می‌کند و در همان مرحله؛ معادلِ فارسیِ عامیانه نه (وفاداری)، و همیشه با حدِ آن (C150: ضرب‌المثل
     قاعدهٔ قطعی نیست و اغلب ضدِ خود را دارد). قلابِ دستیار همین ثبت‌گاه را می‌خواند: A.HEUR_WISDOM (نامِ خنثی، بی نامِ کتاب؛ فیلدِ ph = مرحله/جا) و A.heurWisdom(ph). ---------- */
  var PROV = [
    { id: "C151", ph: "u", t: "کسی که بد می‌فهمد، بد پاسخ می‌دهد", q: "پیش از هر کار: مجهول چیست؟ داده‌ها چیست؟ شرط چیست؟", qp: "پیش از هر کار: فرض چیست؟ حکم چیست؟ هر بخشِ فرض کدام است؟", sec: "§۱" },
    { id: "C152", ph: "goal", t: "قبل از شروع به پایان فکر کن", q: "«حل‌شدن» دقیقاً چه شکلی است — هدف را روشن می‌بینی؟", sec: "§۱" },
    { id: "C153", ph: "will", t: "جایی که اراده‌ای هست، راهی هم هست", q: "چقدر می‌خواهی پیشش ببری — و کوچک‌ترین گامِ بعد چیست؟", sec: "§۱" },
    { id: "C166", ph: "five", t: "پنج دوستِ خوبِ شما چه، چرا، کجا، کی و چگونه هستند", q: "چه؟ چرا؟ کجا؟ کی؟ چگونه؟ — کدام دربارهٔ این مسئله هنوز بی‌پاسخ است؟", sec: "§۵" },
    { id: "C165", ph: "rel", t: "هدف، وسیله را پیشنهاد می‌کند", q: "به مجهول نگاه کن: کدام مسئلهٔ آشنا همین مجهول را داشت؟", qp: "به حکم نگاه کن: کدام قضیهٔ آشنا همین حکم (یا حکمی شبیه) را داشت؟", sec: "§۵" },
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
  /* G5 (دورِ ۶، s03): مسئلهٔ اثباتی مجهول ندارد — همان ضرب‌المثل با پرسشِ «فرض/حکم» (qp) */
  function provOf(ph, pr) { var x = PROV.filter(function (y) { return y.ph === ph; })[0] || null; return x && pr && x.qp ? Object.assign({}, x, { q: x.qp }) : x; }
  A.heurWisdom = provOf;
  function prov(ph, pr) {
    var x = provOf(ph, pr); if (!x) return null;
    return h("p", { class: "small muted lp-prov", "data-prov": x.id, dir: "rtl" }, "حکمتِ ضرب‌المثل‌ها (" + x.sec + "): «" + x.t + "» ⇐ " + x.q + " — قاعدهٔ قطعی نیست؛ فقط یادآورِ همین پرسش.");
  }

  /* ---------- fill-empty: «mode» برای رکوردهای پیشینِ مسئله (یک بار، بی تغییرِ زمانِ رکورد) ---------- */
  var MIGRATED = false;
  A.liveMigrate = function () {
    if (MIGRATED) return 0; MIGRATED = true; var n = 0;
    S.all("eprob", function (r) { return r && !r.mode; }).forEach(function (r) { r.mode = r.live ? "live" : "solved"; S.put(r, { keepTime: true }); n++; });
    /* تور ۱ ِ پولیا (s21): «ثبت‌های تازه» عنوانِ رکورد را از r.title می‌خواند — مسئلهٔ زنده عنوانِ بالایی می‌گیرد (fill-empty) و هرگز خالی نیست */
    /* R2: داورِ رکوردِ پیشین از کارتِ فهمش به خودِ رکورد (یک بار) */
    lives().forEach(function (r) { if (r.p.nat) return; var pg = S.get("eprog_" + r.p.id), u = pg && pg.solve && pg.solve.u && pg.solve.u[1]; if (u && u.done && NAT[u.nat]) { r.p.nat = u.nat; r.p.natBy = "user"; if (u.spatial != null && r.p.spatial == null) r.p.spatial = !!u.spatial; S.put(r, { keepTime: true }); n++; } });
    lives().forEach(function (r) { if (!txt(r.title) || !txt(r.p.title)) { r.p.title = txt(r.p.title) || firstSentence(r.p.statement) || "مسئلهٔ بی‌نام"; r.title = r.p.title; S.put(r, { keepTime: true }); n++; } });
    return n;
  };

  /* ---------- واژه‌ها (کد، نه مدل): «از این داده استفاده کردی؟» و «مسئلهٔ مرتبط» ---------- */
  var STOP = " و در به از که را رو با این آن اون برای یا تا هم اگر من تو او ما شما یک یه است هست بود شد شود می نمی ها های چه چرا کجا کی چطور چگونه باید نباید شاید خیلی کمی هر همه هیچ ولی اما پس بعد قبل حالا الان دارم داری دارد کنم کنی کند کرد کردم کنیم بکنم بشه بشود شده خواهد خواهم نه بله اینکه آیا را چون وقتی خودم خودت چیزی ای ام اند روی ";
  function norm(t) { return String(t == null ? "" : t).replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[ً-ْٔ]/g, "").replace(/ۀ/g, "ه").replace(/‌/g, " ")
    .replace(/[۰-۹]/g, function (c) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(c); }).replace(/[٠-٩]/g, function (c) { return "٠١٢٣٤٥٦٧٨٩".indexOf(c); }).toLowerCase(); }
  function stem(w) { return w.length > 4 ? w.replace(/(?:هایی|های|ها|ترین|تر|یم|ید|ند|ام|ات|اش|مان|تان|شان|ی)$/, "") : w; }
  /* تور ۱ ِ پولیا (s11/s19): جمعِ مکسر به مفرد («نقاط» ⇐ «نقطه»، «اقساط» ⇐ «قسط») تا «از این داده استفاده کردی؟» نامِ داده را در جمعش هم ببیند */
  var BROKEN = { "نقاط": "نقطه", "اعداد": "عدد", "اضلاع": "ضلع", "زوایا": "زاویه", "اقساط": "قسط", "مسائل": "مسئله", "شرایط": "شرط", "ابعاد": "بعد", "ارقام": "رقم", "اشکال": "شکل", "اجزا": "جزء", "اجزاء": "جزء", "حروف": "حرف", "افراد": "فرد",
    "اوقات": "وقت", "منابع": "منبع", "اموال": "مال", "اسناد": "سند", "دلایل": "دلیل", "عوامل": "عامل", "نتایج": "نتیجه", "مراحل": "مرحله", "وسایل": "وسیله", "قوانین": "قانون", "خطوط": "خط", "سطوح": "سطح", "اقوام": "قوم", "مشتریان": "مشتری", "کتب": "کتاب", "دروس": "درس", "علائم": "علامت", "مقادیر": "مقدار" };
  /* «بُعد» (اندازه) با «بعد» (سپس، واژهٔ ایست) یکی نوشته می‌شود: با ضمه، یا پس از عدد («سه بعد»)، همان «ابعاد» است */
  function dimFix(t) { return String(t == null ? "" : t).replace(/بُعد|(?:یک|دو|سه|چهار|[0-9۰-۹])\s*بعد(?![ء-یپچژکگ])/g, function (m) { return m.replace(/بُ?عد$/, "ابعاد"); }); }
  /* دورِ ۱۰ (D5، s28): عددِ چسبیده به اسمِ شمردنی («دوفرزندی» = «دو فرزند») و «بچه» ⇄ «فرزند» یک اسم‌اند — «دو بچه» در «خانواده‌های دوفرزندی» به کار رفته است */
  function numNoun(t) { return String(t == null ? "" : t).replace(/(^|[^ء-یپچژکگ])(یک|دو|سه|چهار|پنج|تک)(فرزند|بچه)/g, "$1$2 $3"); }
  var SYN = { "بچه": "فرزند", "فرز": "فرزند", "فرزندان": "فرزند" };   // پس از ریشه‌یابی («فرزند» ⇐ «فرز»)
  function toks(t) { var o = []; norm(numNoun(dimFix(t))).split(/[^0-9a-zء-يپچژکگی]+/).forEach(function (w) { if (!w || (w.length < 2 && !/\d/.test(w)) || STOP.indexOf(" " + w + " ") >= 0) return; w = stem(BROKEN[w] || w); w = SYN[w] || w; if (o.indexOf(w) < 0) o.push(w); }); return o; }
  function hit(w, tt) { return tt.some(function (x) { return x === w || (w.length >= 4 && x.length >= 4 && (x.indexOf(w) === 0 || w.indexOf(x) === 0)); }); }
  /* دادهٔ d در متنِ t «به کار رفته»؟ در یک بند (جمله/سطر/پاره‌ای میانِ ، ؛ .) دست‌کم نیمی از واژه‌های معنادارِ داده آمده و همان بند آن را
     نفی یا کوچک نکرده — نام بردنِ داده برای کنار گذاشتنش («بی‌فایده است»، «تزئینی است»، «به درد نمی‌خورد»، «مهم نیست»…) به کار بردنش نیست.
     دورِ ۲ ِ تور (R3، s03): اگر داده واژه‌ای دارد که در هیچ دادهٔ دیگری نیست (بخشِ متمایزش، مثلاً «روی مرز» در «نقطه‌ها داخلِ مربع‌اند — شاید روی مرز»)،
     همان بند باید دست‌کم یکی از واژه‌های متمایز را هم داشته باشد — وگرنه واژه‌های مشترک («نقطه»، «مربع») جای خالیِ برهان را پنهان می‌کنند. */
  var NEG = /(?:^|\s)(?:نه|اصلا|هیچ|بی‌ربط|بی ربط|بیربط)(?:\s|$)|مهم\s*نیست|ربطی\s*ندار|لازم\s*نیست|نیازی\s*نیست|اهمیتی\s*ندار|به\s*کار\s*نمی|به\s*درد\s*نمی|بدرد\s*نمی|کاری\s*ندار|نادیده|بی\s*فایده|بیفایده|بی\s*اثر|بیهوده|تزئینی|تزیینی|زینتی|فرقی\s*نمی|اثری\s*ندار|استفاده\s*(?:نمی|نکرد|نکن)|کنار\s*(?:گذاشت|می\s*گذار|بذار|بگذار)|حذف(?:ش)?\s*(?:کرد|می\s*کن)|زائد|زاید|حواس\s*پرت\s*کن/;
  A.liveNeg = function (t) { return NEG.test(norm(t).replace(/\s+/g, " ")); };
  /* تور ۱ ِ پولیا (s35): بازگفتن به زبانِ دیگر هم به کار بردن است — یا نیمی از واژه‌های داده، یا دست‌کم دو واژهٔ معنادارِ مشترک (نه عدد و نه واژهٔ
     عامِ مقدار/زمان) در همان بند — و اگر داده فقط یک واژهٔ متمایز دارد («پس‌انداز ۳۰۰ میلیون»)، همان یک واژه؛ قاعدهٔ نفی همان می‌ماند.
     others (اختیاری): متنِ داده‌های دیگرِ همان مسئله — برای «واژهٔ متمایز». */
  /* F7 (دورِ ۵، s23/s24/s28/s29): (۱) نامِ تک‌حرفیِ لاتین («مسیرِ A/B/C» ⇄ «مماس بر A و B») واژه است؛ (۲) عدد کنارِ اسم («۳۰ پله»، «هر گام ۱، ۲ یا ۳ پله»)
     با خودِ اسم سنجیده می‌شود — عدد به‌تنهایی «واژهٔ متمایز» نیست و در شمارِ «نیمِ واژه‌ها» فقط وقتی می‌آید که داده جز عدد چیزی ندارد؛ (۳) دادهٔ
     فهرست‌وار با برچسب («دستور: ۳ تخم‌مرغ، …») با نامِ برچسبش («همهٔ موادِ دستور») به کار رفته است. */
  function toksM(t) { var o = toks(t); (norm(t).match(/(?:^|[^a-z0-9])([a-z])(?=$|[^a-z0-9])/g) || []).forEach(function (m) { var c = m.slice(-1); if (o.indexOf(c) < 0) o.push(c); }); return o; }
  function mentions(t, d, others) {
    var dt0 = toksM(d); if (!dt0.length) return false;
    var dtw = dt0.filter(function (w) { return !/^\d/.test(w); }), dt = dtw.length ? dtw : dt0;
    var dm = toksSim(d), ot = toks((others || []).join(" ")), dist = dt.filter(function (w) { return !hit(w, ot); });
    var lab = /^\s*([^:：]{2,30})[:：]\s*\S/.exec(String(d || "")), lt = lab ? toks(lab[1]) : [];
    var fd = fmlOne(d);
    return String(t == null ? "" : t).split(/[\n.،؛!?؟:]+|\s(?:ولی|اما)\s/).some(function (cl) {
      var tt = toksM(cl); if (!tt.length || NEG.test(norm(cl).replace(/\s+/g, " "))) return false;
      /* G6 (دورِ ۶، s25): دادهٔ فرمول‌دار («جملهٔ k ام ۱/(k(k+1))») با نمونه‌اش به کار رفته است — همان تابع با جابه‌جاییِ اندیس («۱/((n+1)(n+2))» = f(n+1)) */
      if (fd.length && fmlOne(cl).some(function (g) { return fd.some(function (f) { return fmlInstance(f, g); }); })) return true;
      if (lt.length && lt.every(function (w) { return hit(w, tt); })) return true;
      if (others && dist.length && dist.length < dt.length && !dist.some(function (w) { return hit(w, tt); })) return false;
      return dt.filter(function (w) { return hit(w, tt); }).length >= Math.ceil(dt.length / 2) || (dm.length > 0 && dm.filter(function (w) { return hit(w, tt); }).length >= Math.min(2, dm.length));
    });
  }
  /* فرمول‌های یک‌متغیره (تکه‌ای از نماد و عدد با عملگر و دست‌کم یک حرفِ لاتین، همه یک حرف) ⇐ تابعِ عددی با eqParse */
  function fmlOne(t) {
    return (norm(t).replace(/[−–]/g, "-").match(/[a-z0-9.()+\-*/^×·÷ ]{5,}/g) || []).map(function (c) { return c.trim(); }).filter(function (c) { return /[a-z]/.test(c) && /[\/*^×·÷()]/.test(c) && /\d/.test(c); })
      .map(function (c) { var e = eqParse(c); if (!e) return null; var vs = e.vars.filter(function (v, i, A0) { return A0.indexOf(v) === i; }); return vs.length === 1 ? { f: e.f, v: vs[0] } : null; }).filter(Boolean);
  }
  /* g نمونهٔ f است: g(n) = f(n + c) برای جابه‌جاییِ صحیحِ کوچکِ c ∈ [−۲، ۲] در سه نقطهٔ ناصحیح (برابریِ تصادفی در سه نقطه ناممکن‌گونه است؛ تحملِ گردکردن ۱e-9 نسبی) */
  function fmlInstance(f, g) {
    for (var c = -2; c <= 2; c++) { var ok = [2.37, 5.11, 9.73].every(function (x) { var e1 = {}, e2 = {}; e1[f.v] = x + c; e2[g.v] = x; var a = f.f(e1), b = g.f(e2); return isFinite(a) && isFinite(b) && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a)); }); if (ok) return true; }
    return false;
  }
  A.liveMentions = mentions; A.liveToks = toks;

  /* ---------- داده‌ها: کدام به کار رفت؟ (تیکِ خودت ∪ آمدنِ واژه‌هایش در طرح و گام‌ها) ---------- */
  function uOf(s) { return s.u && s.u[1] && s.u[1].done ? s.u[1] : null; }
  function dataOf(s) { var u = uOf(s); return (u && u.dl) || []; }
  /* بخش‌های شرط (دورِ ۲، R3؛ B086 «از کلِ شرط استفاده کردی؟»): هر سطرِ «شرط» در کارتِ فهم یک بخش است (برای اثباتی: بخش‌های حکم). در طرح و هر گام
     پرسیده می‌شود «کدام بخش را به کار می‌گیرد؟»؛ بخشی که در هیچ‌جا نیامد، در بازنگری با نامش برمی‌گردد. */
  function condParts(s) { var u = uOf(s); return String((u && u.c) || "").split(/\n|؛/).map(txt).filter(function (x) { return x.length >= 2; }); }
  function condUsed(s) {
    var L = live(s), P = condParts(s), o = {}, texts = [];
    ((L.plan && L.plan.cparts) || []).forEach(function (i) { o[i] = "tick"; });
    L.steps.forEach(function (st) { (st.cparts || []).forEach(function (i) { o[i] = "tick"; }); texts.push(st.text, st.proof, st.prem); });
    if (L.plan) texts.push(L.plan.t, L.plan.t2);
    if (L.plan && L.plan.relax && L.plan.relax.on !== "hyp" && L.plan.relax.part !== "" && L.plan.relax.part != null && L.plan.relax.part !== "prove") o[+L.plan.relax.part] = o[+L.plan.relax.part] || "relaxed";
    var all = texts.filter(Boolean).join("\n");
    P.forEach(function (t, i) { if (!o[i] && mentions(all, t, P.filter(function (y, j) { return j !== i; }))) o[i] = "text"; });
    return P.map(function (t, i) { return { i: i, t: t, used: o[i] || "" }; });
  }
  function condTicks(s, idp, sel, legend) {
    var P = condParts(s); if (P.length < 1) return null;
    return h("fieldset", { class: "lp-cticks small" }, h("legend", {}, legend),
      h("div", { class: "row gap wrap" }, P.map(function (t, i) { var id = idp + i; return h("label", { class: "row gap", for: id }, h("input", { type: "checkbox", id: id, checked: sel.indexOf(i) >= 0 ? true : null, onchange: function (e) { var j = sel.indexOf(i); if (e.target.checked && j < 0) sel.push(i); if (!e.target.checked && j >= 0) sel.splice(j, 1); } }), clip(t, 60)); })));
  }
  /* تور ۱ ِ پولیا (s01/s11/s19): داده‌ای که «با دلیل» کنار گذاشته شد (در طرح «لازم نیست» با دلیلِ سه‌واژه‌ای، در قابِ عملی «اثرش ناچیز است» با دلیل،
     یا در بازنگری) رسیدگی‌شده است، نه «به‌کارنرفته». «به کار رفته» فقط یعنی در کارِ خودِ حل آمده: پاسخ‌های طرح، زنجیرهٔ کار به عقب، گام‌ها (متن،
     تکیه‌گاه، برهان، معادله)، مسئلهٔ کمکی، حرکت‌ها، مسئلهٔ مرتبط، معنای نمادها، طرح و پیش‌نویسِ آن.
     دورِ ۲ ِ تور (R3، ۲۰۲۶-۱۰-۱۶): نام بردنِ داده در گفت‌وگو با دستیار دیگر «به کار بردن» نیست (اغلب برای کنار گذاشتنش است: «اون رخ بی‌فایده‌ست») —
     پیش‌تر used = "chat" بود و دروازهٔ «همهٔ داده‌ها» هرگز باز نمی‌شد. */
  function asideMap(s) {
    var L = live(s), o = {}, u = uOf(s);
    ((u && u.dl) || []).forEach(function (x) { if (x.eff === "small" && toks(x.effWhy).length >= 2) o[x.id] = x.effWhy; });
    [(L.plan && L.plan.unused) || {}, (s.b && s.b[1] && s.b[1].unused) || {}].forEach(function (un) { Object.keys(un).forEach(function (k) { if (un[k] && un[k].ans === "skip" && toks(un[k].why).length >= 3) o[k] = un[k].why; }); });
    return o;
  }
  function usedMap(s, pg) {
    var dl = dataOf(s), L = live(s), used = {}, texts = [], u = uOf(s) || {};
    ((pg.tut || {}).plan || []).forEach(function (e) { if (e && e.src === "live" && !e.skip) { (e.data || []).forEach(function (i) { used[i] = "tick"; }); texts.push(e.text); } });
    L.steps.forEach(function (st) { (st.data || []).forEach(function (i) { used[i] = "tick"; }); texts.push(st.text, st.prem, st.proof, st.base); });
    if (L.back) { texts.push(L.back.solved, L.back.before1, L.back.before2, L.back.have); (L.back.chains || []).forEach(function (c) { texts = texts.concat(c.links || []); }); }
    L.aux.forEach(function (a) { texts.push(a.t, a.bridge); });
    L.moves.forEach(function (m) { texts.push(m.why); });
    L.related.forEach(function (x) { texts.push(x.carry, x.map); });
    if (L.seen) texts.push(L.seen.where);
    (u.nota || []).forEach(function (x) { texts.push(x.m); });
    texts.push(L.planDraft);
    if (L.plan) { texts.push(L.plan.t, L.plan.t2, L.plan.rot); Object.keys(L.plan.unused || {}).forEach(function (k) { if (L.plan.unused[k].ans === "use" || L.plan.unused[k].ans === "soft") used[k] = used[k] || "plan"; }); }   // «soft»: هشدارِ واژه‌ای دیده شد و با دلیلِ خودش گذشت (D5)
    var all = texts.filter(Boolean).join("\n");
    dl.forEach(function (d) { if (!used[d.id] && mentions(all, d.t, dl.filter(function (y) { return y !== d; }).map(function (y) { return y.t; }))) used[d.id] = "text"; });
    var as = asideMap(s); dl.forEach(function (d) { if (!used[d.id] && as[d.id]) used[d.id] = "aside"; });
    return used;
  }
  A.liveAside = function (pid) { var pg = pgOf(pid); return asideMap(solOf(pg)); };
  /* «کدام داده به کار رفت؟» با همان معنای صفحه (R3): {id: "tick" | "plan" | "text" | "aside"} — گفت‌وگو هرگز. A.liveUnused(pid) = داده‌های بی‌کار [{id, t}] */
  A.liveUsed = function (pid) { var pg = pgOf(pid), s = solOf(pg); return usedMap(s, pg); };
  A.liveUnused = function (pid) { if (!rec(pid)) return []; var pg = pgOf(pid), s = solOf(pg); return unusedOf(s, pg).map(function (d) { return { id: d.id, t: d.t }; }); };
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
    /* E8 (دورِ ۴، s27): بازنگری‌ای که ایراد یافت و «برگرد به طرح» گفت ⇒ مرحله «طرح» است تا طرح دوباره ثبت شود (livePhase، closure.back و نما یکی) */
    var df = (L.defects || []).filter(function (y) { return !y.resolvedAt; }).pop();
    if (df && df.to === "p" && !(String(L.plan.at) > String(df.at))) return "p";
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
    /* E2 (دورِ ۴، s03/s27): نوع از خودِ صورت (پیشنهاد) — فرزندِ بازنگری نوعِ خودش را دارد، نه نوعِ پدر («اگر ۴ نقطه باشد، حکم هنوز درست است؟» ⇒ اثبات یا رد کن) */
    var st0 = String(statement || "").trim(), k0 = A.SOLVE_TYPES && A.SOLVE_TYPES[kind] ? kind : typeGuess(st0) || "find";
    var k = A.SOLVE_TYPES && A.SOLVE_TYPES[k0] ? k0 : "find";
    var ti = clip(txt(title) || firstSentence(st0) || "مسئلهٔ بی‌نام", 120);   // عنوان هرگز خالی نیست (تور ۱، s21)
    var r = { id: "eprob_" + pid, type: "eprob", status: "live", mode: "live", live: true, by: extra.by || "user", title: ti,
      p: { id: pid, title: ti, statement: st0, kind: k, field: "مسئلهٔ زندهٔ من", live: true, stages: [], dead: [], drills: [], lessons: [] } };
    /* داور و فضایی بودن (R2): انتخابِ صریح ⇐ ارث از مسئلهٔ پدر (مسئلهٔ تازهٔ بازنگری، ساختهٔ گفت‌وگو) ⇐ پیشنهادِ کد (پیش‌انتخاب، natBy: "guess") */
    var par = extra.origin && extra.origin.type === "lprob" ? rec(extra.origin.id) : null, parS = par ? solOf(pgOf(par.p.id)) : null;
    /* D1: داورِ صریح (انتخابِ کاربر در فرم، دستیار با nat) ⇐ ارث از پدر ⇐ پیش‌فرضِ «اثباتی/اثبات یا رد کن» (کامل‌بیان‌شده) ⇐ پیشنهادِ کد */
    if (NAT[extra.nat] && extra.natBy !== "guess") { r.p.nat = extra.nat; r.p.natBy = extra.natBy || "user"; }
    else if (par) { r.p.nat = natOf(parS, par); r.p.natBy = "parent"; }
    else if (k === "prove" || k === "pod") { r.p.nat = "objective"; r.p.natBy = "type"; }
    else if (NAT[extra.nat]) { r.p.nat = extra.nat; r.p.natBy = "guess"; }
    else { var gs = natGuess(st0 + " " + ti); if (gs) { r.p.nat = gs; r.p.natBy = "guess"; } }
    if (extra.spatial === true || extra.spatial === false) r.p.spatial = extra.spatial;
    else if (par && spatialOf(parS, par)) { r.p.spatial = true; r.p.spatialBy = "parent"; }
    if (extra.origin) r.origin = extra.origin;
    if (extra.dormant) r.dormant = extra.dormant;
    if (extra.sess) r.sess = extra.sess;
    /* تور ۱ (s34): امید/میلِ کم در آغاز ⇒ «🌱 کوچک‌ترین گامِ بعد» پیش از کارتِ کاملِ فهم */
    if (extra.hope === "low" || extra.hope === "mid" || extra.hope === "high") r.hope = extra.hope;
    /* تور ۱ (s15/s16): مسئلهٔ «برای کسِ دیگری» — کاربر مربی است */
    if (extra.coach) r.coach = { who: clip(txt(extra.coach.who), 60), at: nowISO() };
    S.put(r);
    var pg = pgOf(pid), s = solOf(pg); s.type = k; s.live.startD = A.today(); S.put(pg);
    return r;
  }
  A.liveCreate = create;
  /* F4 (دورِ ۵، s25): صورتِ تازهٔ همان مسئله (chat_invent ِ هم‌خانواده) نوع را دوباره حدس می‌زند — حدسی که «…درسته؟» شد «اثبات یا رد کن» است.
     فقط تا وقتی کاربر خودش نوع را در کارتِ فهم ثبت نکرده (انتخابِ صریح برنده است). برمی‌گرداند نوعِ تازه یا "". */
  A.liveRetype = function (pid, statement) {
    var r = rec(pid); if (!r) return ""; var pg = pgOf(pid), s = solOf(pg), g = typeGuess(statement);
    if (!g || uOf(s) || r.p.kind === g || r.p.kindBy === "user") return "";
    r.p.kind = g; r.p.kindBy = "guess"; s.type = g;
    if ((g === "prove" || g === "pod") && (!r.p.nat || r.p.natBy === "guess")) { r.p.nat = "objective"; r.p.natBy = "type"; }
    S.put(r); S.put(pg); return g;
  };
  /* تور ۱ (s21): ساختن از فرمِ «🔭» مسئله را به سشنِ جاریِ دستیار می‌بندد (ASSIST.cur().lprob) — همان کاری که live_new می‌کند؛ صادر شده تا دستیار هم صدایش بزند */
  /* سشن ⇄ مسئله (R1/R2، دورِ ۲): سشنی که مسئلهٔ زندهٔ بازی (نه بسته‌شده) دارد، به مسئلهٔ دیگری بسته نمی‌شود مگر کاربر خودش عوض کند (opts.force:
     رفتن به صفحهٔ مسئلهٔ دیگر، «این گفت‌وگو دربارهٔ آن مسئله است»). پیش‌تر ساختنِ مسئلهٔ دوم پیوندِ سشنِ مسئلهٔ اول را بی‌صدا جابه‌جا می‌کرد.
     برمی‌گرداند: true (بسته شد یا از پیش همین بود) | false (سشن نیست، مسئله نیست، یا سشن مسئلهٔ بازِ دیگری دارد). */
  function openPid(pid) { var r = rec(pid); if (!r) return false; var pg = S.get("eprog_" + pid); if (!pg || !pg.solve) return true; return phaseOf(solOf(pg)) !== "done"; }
  A.liveBindSession = function (pid, sess, opts) {
    var AS0 = A.ASSIST, se = sess || (AS0 && typeof AS0.cur === "function" ? AS0.cur() : null);
    if (!se || !rec(pid)) return false;
    if (se.lprob === pid) return true;
    if (se.lprob && se.lprob !== pid && openPid(se.lprob) && !(opts && opts.force)) return false;
    se.lprob = pid; se.lprobAt = bindLog(se, pid); try { S.put(se); } catch (e) { }
    return true;
  };
  /* M1 (دورِ ۱۳): دفترِ موضوع‌های سشن (lprobLog) — هر بار سشن به مسئله‌ای بسته یا از آن باز می‌شود: کدام مسئله، کی، و آیا در نوبتِ دستیارِ همین سشن (کنشِ او:
     live_new، کلیکِ «ساختن» در فرم) — پنجرهٔ «کدام پرسش کمک کرد؟» از همین دفتر. فقط افزودنی؛ lprob/lprobAt همان می‌مانند. ثبت‌های پیش از نخستین پیامِ ماندهٔ
     سشن کنار می‌روند جز واپسینشان (موضوعِ آغازِ پیام‌های مانده) */
  function bindLog(se, p) {
    var AS0 = A.ASSIST, ai = false; try { ai = !!(AS0 && typeof AS0.busy === "function" && AS0.busy() && AS0._turnSession && AS0._turnSession.id === se.id); } catch (e) { }
    var at = nowISO(), m0 = (se.msgs || []).filter(function (m) { return m && m.at; })[0], f0 = m0 ? String(m0.at) : "", Lg = (se.lprobLog || []).filter(Boolean);
    if (f0) { var keep = -1; Lg.forEach(function (e, i) { if (String(e.at || "") < f0) keep = i; }); Lg = Lg.filter(function (e, i) { return String(e.at || "") >= f0 || i === keep; }); }
    Lg.push({ p: p || "", at: at, ai: ai }); se.lprobLog = Lg; return at;
  }
  A.liveUnbindSession = function (sess) { if (!sess || !sess.lprob) return false; bindLog(sess, ""); delete sess.lprob; delete sess.lprobAt; try { S.put(sess); } catch (e) { } return true; };
  /* مسئلهٔ بازی که سشن به آن بسته است (یا null): قلاب‌ها با همین «مسئلهٔ زندهٔ این سشن» را همیشه می‌آورند، بی شرطِ واژهٔ مشترک */
  A.liveSessionPid = function (sess) { var pid = sess && sess.lprob; return pid && rec(pid) && openPid(pid) ? pid : null; };
  A.liveLinkSession = A.liveBindSession;   // نامِ صادرشده برای دستیار (live_new) و قلاب‌های بیرونی
  var NEW = { title: "", statement: "", kind: "find", nat: "", hope: "", coach: false, who: "" };
  var HOPE = [["high", "زیاد — می‌خواهم و امید دارم"], ["mid", "کمی"], ["low", "کم — دلسردم یا حوصله‌اش را ندارم"]];
  A.liveNewPanel = function () {
    var box = h("section", { class: "card col gap lp-new", dir: "rtl" }, h("h2", {}, "🔭 مسئلهٔ حل‌نشدهٔ خودم"),
      h("p", { class: "small" }, "تصمیمی که باید بگیری، پروژه‌ای که گیر کرده، پرسشی فکری که جوابش را نمی‌دانی — پاسخ لازم نیست. همان تونلِ حل (فهم ⇐ طرح ⇐ اجرا ⇐ بازنگری) این بار روی واقعیت: هر گامِ واقعی پیش از انجام یک پیش‌بینی دارد و روزِ موعدش در «امروز» برمی‌گردد تا ببینی چه شد. داور نه صفحه است نه هوش مصنوعی: واقعیت و داوریِ خودت."));
    box.appendChild(field("lpNewT", "عنوانِ کوتاهِ مسئله", NEW.title, function (v) { NEW.title = v; }, 0, "مثلاً «پیشنهادِ کارِ دوم را بپذیرم یا نه؟»"));
    /* R2: پیشنهادِ کد (از صورت؛ «اثباتی/اثبات یا رد کن» ⇐ کامل‌بیان‌شده) همان‌جا پیش‌انتخاب می‌شود و دیده می‌شود — کاربر عوضش می‌کند؛ پیش‌فرضِ بی‌صدای «life» نیست */
    var natHint = h("p", { class: "small muted lp-newnathint", "aria-live": "polite" });
    function natSync() {
      var sel0 = box.querySelector("#lpNewNat"); if (!sel0) return;
      /* E2: نوعِ پیشنهادی از صورت (تا کاربر خودش نوع را برنگزیده) — «آیا…؟» ⇒ اثبات یا رد کن، «ثابت کنید» ⇒ اثباتی */
      if (!NEW.kindSet) { NEW.kind = typeGuess(NEW.statement + " " + NEW.title) || "find"; var ts0 = box.querySelector("#lpNewType"); if (ts0) ts0.value = NEW.kind; }
      if ((NEW.kind === "prove" || NEW.kind === "pod") && !NEW.natSet) { NEW.nat = "objective"; NEW.natAuto = true; }   // D1: پیش‌فرض، نه قفل
      else if (!NEW.natSet) { NEW.nat = natGuess(NEW.statement + " " + NEW.title); NEW.natAuto = !!NEW.nat; }
      sel0.value = NEW.nat || "";
      natHint.textContent = NEW.natAuto && NEW.nat && (NEW.kind === "prove" || NEW.kind === "pod") ? "پیش‌انتخاب: «" + NAT[NEW.nat].fa.split(" — ")[0] + "» (داورِ حکم برهان است) — اگر فرضیه‌ای دربارهٔ زندگیِ خودت است که برهان ندارد («… برای من درست است؟»)، «زندگی» را برگزین." : NEW.natAuto && NEW.nat ? "پیش‌انتخابِ کد از صورتت: «" + NAT[NEW.nat].fa.split(" — ")[0] + "» — اگر نیست، عوضش کن." : !NEW.nat ? "داور را خودت برگزین (کد از صورت چیزی پیشنهاد نکرد)." : "";
    }
    box.appendChild(field("lpNewS", "مسئله را همان‌طور که هست بنویس: چه می‌خواهی و چه چیزی آن را سخت می‌کند (پاسخ لازم نیست)", NEW.statement, function (v) { NEW.statement = v; natSync(); }, 4));
    box.appendChild(U.typeSel("lpNewType", NEW.kind, function (v) { NEW.kind = v; NEW.kindSet = true; natSync(); }));
    box.appendChild(selF("lpNewNat", "داورِ این مسئله کیست؟", Object.keys(NAT).map(function (k) { return [k, NAT[k].fa]; }), NEW.nat, function (v) { NEW.nat = v; NEW.natSet = !!v; NEW.natAuto = false; natSync(); }));
    box.appendChild(natHint);
    box.appendChild(selF("lpNewHope", "الان چقدر امید یا میل داری که پیشش ببری؟ (اختیاری)", HOPE, NEW.hope, function (v) { NEW.hope = v; }));
    var whoBox = h("div", { class: NEW.coach ? "" : "hidden" }, field("lpNewWho", "او کیست؟ (نام یا نسبت — مثلاً «پسرم»، «شاگردم»)", NEW.who, function (v) { NEW.who = v; }, 0));
    box.appendChild(h("label", { class: "row gap small", for: "lpNewCoach" }, h("input", { type: "checkbox", id: "lpNewCoach", checked: NEW.coach ? true : null, onchange: function (e) { NEW.coach = e.target.checked; whoBox.classList.toggle("hidden", !NEW.coach); } }),
      "این مسئلهٔ کسِ دیگری است و من مربی، معلم یا والدش هستم (پاسخ را نمی‌گویم؛ پرسش می‌پرسم)"));
    box.appendChild(whoBox);
    var out = h("div", { "aria-live": "polite", class: "small" });
    box.appendChild(h("button", { class: "btn lp-create", type: "button", onclick: function () {
      if (txt(NEW.statement).length < 10 || (txt(NEW.title) && txt(NEW.title).length < 3)) { out.textContent = "عنوان و صورتِ مسئله را بنویس (صورت دست‌کم یک جملهٔ کامل)."; A.toast(out.textContent, "bad"); return; }
      if (NEW.coach && txt(NEW.who).length < 2) { out.textContent = "بنویس مسئلهٔ چه کسی است (نام یا نسبت)."; A.toast(out.textContent, "bad"); return; }
      var r = create(NEW.title, NEW.statement, NEW.kind, { nat: NEW.nat, natBy: NEW.natAuto ? "guess" : "user", hope: NEW.hope, coach: NEW.coach ? { who: NEW.who } : null }); NEW = { title: "", statement: "", kind: "find", nat: "", hope: "", coach: false, who: "" };
      A.liveBindSession(r.p.id);
      A.toast(r.hope === "low" ? "مسئله ساخته شد؛ با کوچک‌ترین گام شروع کنیم." : "مسئله ساخته شد؛ اول بفهمیمش."); A.go("lprob", r.p.id, "u");
    } }, "ساختنِ مسئلهٔ حل‌نشده"));
    box.appendChild(out);
    natSync();
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
      /* دورِ ۲ (R4): «کوتاه‌تر از صورت» برداشته شد — صورتِ بسیار کوتاه بازگفتِ درستِ هم‌اندازه دارد؛ فقط رونوشتِ تقریبی ممنوع است */
      /* A13 (s37): نشانه‌ای که به رقم چسبیده («؟۴۸۷؟» در معمای رقمی، «۱.۵») پایانِ جمله نیست؛ پایانِ جمله = نشانه و سپس فاصله */
      if (/[.!?؟]\s+\S/.test(one.replace(/[.!?؟\s]+$/, "").replace(/[.!?؟](?=[0-9۰-۹٠-٩])|([0-9۰-۹٠-٩])[.!?؟]/g, "$1"))) o.push("فقط یک جمله");
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
  var SAT_POD = "آیا فرض برآوردنی است — اصلاً موردی هست که همهٔ فرض را برآورد (وگرنه حکم تهی است)؟";
  /* E3 (دورِ ۴، s05): «اثبات یا رد کن» ِ زندگی برهان ندارد — «حکم تهی» و «اثباتی» واژهٔ ریاضی‌اند؛ فرضیهٔ زندگی با موقعیت‌های واقعی سنجیده می‌شود */
  var SAT_POD_LIFE = "آیا موقعیتی واقعی هست که همهٔ فرضت در آن برقرار باشد — وگرنه فرضیه چیزی را نمی‌سنجد؟";
  var SAT_POD_OPTS = [["yes", "بله — دست‌کم یک مورد همهٔ فرض را دارد"], ["no", "نه — هیچ موردی همهٔ فرض را ندارد"], ["unknown", "هنوز نمی‌دانم"]];
  /* G5 (دورِ ۶، s10): «اثبات یا رد کن» که خودش پرسشِ وجود است («آیا چیدمانی هست که همهٔ قوانین را برآورد؟») حکمی با فرض ندارد که «تهی» شود —
     پرسشِ پولیا همان «شرط برآوردنی است؟» است */
  var EXIST_Q = /(?:^|\s)آیا\s[^؟?]{0,120}(?:هست|هستند|وجود\s*دارد|وجود\s*داره|داریم|پیدا\s*می\s*شود|میشه|می\s*شه|می\s*شود)\s*(?:که|[؟?])|(?:راهی|چیدمانی|موردی|جوابی|پاسخی|عددی|ترتیبی)\s+(?:هست|وجود\s*دارد)/;
  function existQ(st) { return EXIST_Q.test(norm(st)); }
  function satLabel(ty, nat, st) { return ty === "pod" ? (nat !== "objective" ? SAT_POD_LIFE : existQ(st) ? SAT_L : SAT_POD) : SAT_L; }
  var EFF = [["big", "اثرِ محسوس دارد"], ["small", "اثرش ناچیز است — با دلیل کنارش می‌گذارم"]];
  var RESTATE = [["eq", "هم‌ارز — همان مسئله به بیانِ دیگر"], ["wider", "گسترده‌تر — مسئلهٔ کلی‌تر (شرط یا قیدی کمتر)"], ["narrower", "باریک‌تر — مسئلهٔ خاص‌تر (شرط یا قیدی بیشتر)"], ["other", "مسئلهٔ دیگری شد"]];
  var TEST_COST = /هزینه|گران|خطر|ریسک|وقت|زمان|پول|آسیب|ضرر|برگشت\s*ناپذیر|جبران\s*ناپذیر|در\s*دسترس|دسترسی|ناممکن|غیرممکن|نمی\s*شود\s*(?:آزمود|امتحان)|اخلاقی|قیمت|سلامت|جان/;
  var IFREF = ["حدس را کنار می‌گذارم یا اصلاحش می‌کنم", "آزمون را نادیده می‌گیرم چون حدسم قوی است", "حدس را بی‌تغییر نگه می‌دارم و دیگر نمی‌آزمایم"];
  var GWANT = [["yes", "بله — دوست دارم درست باشد"], ["no", "نه"], ["neutral", "فرقی نمی‌کند"]];
  var FIGGEN = [["general", "عمومی — ویژگیِ اضافه‌ای (تساوی، قائمه، تقارن) که شرط نگفته ندارد"], ["special", "خاص — ویژگی‌ای دارد که شرط نگفته"]];
  var UNKNOWNISH = /نمی[‌\s]?دانم|نمی[‌\s]?دونم|معلوم\s*نیست|نامعلوم|هنوز|باید\s*بپرسم|مطمئن\s*نیستم|شاید|[?؟]/;
  var NOREF = /هیچ\s*(?:چیز|چیزی)?\s*(?:رد|نمی)|نمی[‌\s]?(?:تواند|تونه)\s*رد|رد\s*نمی|ردش\s*نمی|محال|غیرممکن|غیر\s*ممکن/;
  /* فقط پیشنهاد (R2): تیکِ «فضایی» را خودِ کاربر می‌زند؛ «حجم» یا «چیدمان» آن را خودکار روشن نمی‌کنند (چیدمانِ مهمان‌ها فضایی نیست) */
  var SPATIAL = /(?:^|[^ء-یپچژکگ])(?:شکل|مثلث|دایره|زاویه|مساحت|حجم|مکعب|استوانه|کره|قطر|ضلع|ارتفاع|نقشه|اتاق|ابعاد|چیدمان|فضای|مماس|مسیر|حوض)|(?:^|\s)جا\s*(?:می|نمی)?\s*(?:شه|شود|بشه|گیرد|بگیرد)(?![ء-یپچژکگ])/;
  /* F4 (دورِ ۵، s10): معمای نشستن («۹ نفر، سه میزِ سه‌نفره… کنارِ…»، «چیدمان»ِ آدم‌ها روی صندلی) ترتیب است نه شکل و اندازه — «چیدمان/کنار» آن‌جا فضایی نمی‌کند */
  var SEAT_RE = /میز|صندلی|نشستن|بنشینند|بشینن|بشینند|می\s*نشینند|ردیف|نفره(?![ء-یپچژکگ])/;
  function spatialGuess(t) { var x = norm(t); if (SEAT_RE.test(x)) x = x.replace(/چیدمان|ابعاد/g, " "); return SPATIAL.test(x); }
  A.liveSpatialGuess = spatialGuess;
  /* A6 (دورِ ۳، s22): «برآوردنی؟ بله / کافی است» با دلیلی که خودِ مجهول را پیش‌فرض می‌گیرد («فقط سه نفر کلید داشتند پس کارِ یکی از آن‌هاست») —
     دلیلی که نتیجه‌ای دربارهٔ مجهول اعلام می‌کند (پس، بنابراین، حتماً، معلوم است…) یا خودِ مجهول را نام می‌برد، دوری است مگر داده‌ای آن را بگوید */
  /* E4 (دورِ ۴، s19/s24/s29): «معلوم است/مشخص است» در فارسی بیشتر یعنی «داده شده» («تعدادِ پله‌ها معلوم است»)، نه «پیداست که» — از نشانه‌های نتیجه‌گیری
     بیرون رفت. دوری یعنی دلیل مقدار یا هویتِ مجهول را اعلام کند («پس کارِ یکی از آن‌هاست»، «جواب همان ۵ است»)، نه این‌که فقط واژهٔ مجهول را بیاورد
     («سه شرطِ مماس برای مرکز و شعاع» دوری نیست). */
  var CIRC_RE = /(?:^|\s)(?:پس|بنابراین|بنابرین|لابد|حتما|حتماً|قطعا|قطعاً|مسلما|مسلماً)(?=\s)|واضح\s*است|واضحه|کار\s*(?:یکی|خود)/;
  var ASSERT_RE = /(?:^|\s)(?:همان|همون|خود)(?=\s)|=|(?:^|\s)(?:جواب|پاسخ|مجهول)(?:ش|اش)?\s*(?:همان|است|هست|=|می\s*شود|میشه|می\s*شه)|(?:کار|تقصیر|گناه)\s*[ء-یپچژکگ]+\s*(?:است|ه|بود)(?=$|\s|[.,،؛])/;
  function circular(why, unk) { var w = txt(why); if (!w) return false; var x = norm(w); return CIRC_RE.test(x) || (toks(unk).length > 0 && mentions(w, unk) && ASSERT_RE.test(x)); }
  var EMPTY_W = " هیچ هیچی چیز چیزی نمی دانم دونم ندارم نه نیست بیرون نمی ذارم گذارم دلم خواد خواهد دقیق باشه باشد کاملا همه همش ";
  var ALLKEEP_RE = /هیچ\s*(?:چیز|چیزی|چی|چیو|کدوم|کدام)?\s*(?:رو|را|ی\s*رو)?\s*(?:بیرون|کنار)\s*(?:نمی|نم)|هیچی\s*(?:رو|را)?\s*(?:بیرون|کنار)|همه\s*(?:ی|ٔ)?\s*[^.؟?!\n،]{0,30}(?:مهم|لازم|ضروری)\s*(?:ه|است|ان|اند|هستن|ند)?(?=$|[\s.,،؛:!?؟…])|همه\s*(?:را|رو|چیز\s*(?:را|رو)?)\s*نگه/;
  var NOLINE_RE = /هیچ|همه\s*(?:را|رو)?\s*نگه|نمی\s*(?:ذارم|گذارم)/, APPROX_RE = /[0-9]|٪|درصد|±|حدود|تقریب|کمتر|بیشتر|تا\s|خطا|اختلاف|بس\s*است|بسه|(?:^|\s)(?:یک|یه|دو|سه|چهار|پنج|شش|هفت|هشت|ده|بیست|سی|صد|هزار|نیم|نصف|ربع|ثلث)(?=\s|$)|لازم\s*نیست|کیفی/;   // E4: «ده سانت»، «نصف خانوارها»، «±۱۰٪»
  /* E4 (دورِ ۴، s22): مجهولِ کیفی (چه کسی؟ کدام؟) تقریبِ عددی ندارد — «تقریب لازم نیست — مجهول کیفی است» پاسخِ درست است */
  var QUAL_UNK = /(?:^|\s)(?:چه\s*کسی|کی|کسی\s*که|کدام|کدوم|کدامیک|چه\s*چیزی|چرا|آیا)(?=\s|$)|مقصر|متهم|فاعل|هویت/;
  function suffShaky(items) { return items.length === 1 || items.some(function (x) { return UNKNOWNISH.test(norm(x.t)); }); }
  function suffChalQ(items) { var un = items.filter(function (x) { return UNKNOWNISH.test(norm(x.t)); }); return items.length === 1 ? "با همین یک داده مجهول معین می‌شود؟ چطور؟" : "گفتی کافی است، ولی «" + clip(un[0] ? un[0].t : "", 50) + "» هنوز معلوم نیست — بی آن مجهول معین می‌شود؟ چطور؟"; }
  /* E4 (دورِ ۴ ِ تور، تصمیمِ R4): وارسی‌ای که ممکن است از واژه‌ها اشتباه کند (دوری، تقریب، «کجا خط می‌کشی»، واحدها، «کافی است» با دادهٔ نامعلوم، حالتِ حدی،
     نزدیک‌به‌رونوشت) هشدار می‌دهد، سد نمی‌کند: یک بار چالشش را نشان می‌دهد و «ثبت با همین — دلیل» (یک خط، ذخیره‌شده) پیشنهاد می‌کند؛ فقط وارسیِ محتوایی
     (فیلدِ خالی، یک نماد برای دو چیز، داوریِ صریحِ خودِ کاربر) سد می‌کند. soft = [[کلید، پیام]]؛ گذر ⇒ {keys, why}. */
  /* دورِ ۱۱ (K6، s22 c13، s26 c5، پروبِ p26): «هنوز نه» ِ سخت (فیلدِ خالی، پاسخِ دوباره) و هشدارهای حدسی جدا نگه داشته می‌شوند — d.softMsgs همین هشدارها،
     d.softHard موردهای سخت که هم‌زمان مانده‌اند؛ متنِ «حدس زده شده… دلیل بنویس» فقط بالای فهرستِ خودش و کنارِ همان فیلدِ دلیل است، و اگر موردِ سختی هم
     مانده، صریح می‌گوید که دلیل فقط از هشدارها می‌گذرد */
  function softGate(d, soft, miss) {
    d.softHard = miss.slice();
    if (!soft.length) { d.softShow = false; d.softMsgs = []; return null; }
    d.softMsgs = soft.map(function (x) { return x[1]; });
    d.softSeen = d.softSeen || []; var seen = soft.every(function (x) { return d.softSeen.indexOf(x[0]) >= 0; });
    if (seen && toks(d.softWhy).length >= 2) { d.softOk = true; return { keys: soft.map(function (x) { return x[0]; }), why: txt(d.softWhy), at: nowISO() }; }
    d.softOk = false;
    soft.forEach(function (x) { if (d.softSeen.indexOf(x[0]) < 0) d.softSeen.push(x[0]); miss.push(x[1]); });
    d.softShow = true; return null;
  }
  /* پیامِ کوتاهِ toast: سخت‌ها و هشدارهای حدسی جدا و با نامِ خودشان (هرگز یک فهرستِ آمیخته زیرِ «اول این‌ها») */
  function missToast(d, miss, where) { var hd = hardOf(d, miss), sm = d.softShow ? (d.softMsgs || []) : [];
    return (hd.length ? "اول این‌ها: " + hd.join("، ") : "") + (sm.length ? (hd.length ? " — جدا از آن، " : "") + "هشدارهای حدسی (" + where + "؛ ثبت با همین — دلیل): " + sm.join("، ") : ""); }
  function hardOf(d, miss) { var sm = d.softShow ? (d.softMsgs || []) : []; return (miss || []).filter(function (m) { return sm.indexOf(m) < 0; }); }
  function softField(id, d, fn) {
    var hard = (d.softHard || []).length, msgs = d.softMsgs || [];
    return h("div", { class: "card soft col gap lp-softgate" },
      h("p", { class: "small" }, (hard ? "جدا از «هنوز نه» ِ بالا، " : "") + "این هشدارها از واژه‌ها حدس زده شده‌اند و ممکن است این‌جا به جا نباشند:"),
      msgs.length ? h("ul", { class: "small lp-softlist" }, msgs.map(function (m) { return h("li", {}, m); })) : null,
      h("p", { class: "small" }, d.softOk && hard ? "دلیلت برای همین هشدارها پذیرفته شد؛ ثبت فقط منتظرِ موردهای «هنوز نه» است." :
        "اگر پس از دیدنشان همین را می‌خواهی، یک خط دلیل بنویس و ثبت کن (دلیلت ذخیره می‌شود)" + (hard ? " — این دلیل فقط از همین هشدارها می‌گذرد؛ موردهای «هنوز نه» را باید خودت کامل کنی." : ".")),
      field(id, "ثبت با همین — دلیل:", d.softWhy || "", function (v) { d.softWhy = v; if (fn) fn(v); }, 0));
  }
  /* جای پیامِ «هنوز نه»: سخت‌ها در یک بند، و کارتِ هشدارهای حدسی با فیلدِ دلیلش درست زیرِ همان (یک جا، نه یکی بالای دکمه و دیگری زیرش) */
  function missBox(cls, id, d, miss) {
    var hd = hardOf(d, miss), o = h("div", { class: "small col gap " + cls });
    if (hd.length) o.appendChild(h("p", { class: "bad lp-hardmiss", "aria-live": "polite" }, "هنوز نه: " + hd.join("، ") + "."));
    if (d.softShow) o.appendChild(softField(id, d));
    return o;
  }
  function pracParts(d, items) { var P = d.prac || {}; return { want: d.u, have: items.map(function (x) { return txt(x.t); }).join(" · "), cond: d.c, vague: P.vague, ignore: P.ignore, approx: P.approx, prior: P.prior, measure: P.measure }; }
  /* ---------- واحدها در «ریاضی‌کردن» (دورِ ۲ ِ تور، s16؛ A152 «اگر همهٔ اندازه‌ها را به واحدِ دیگری ببری، رابطه باید درست بماند») ----------
     «۲۰۰ × ۱۲۰ × ۱۰۰ لیتر» پذیرفته می‌شد: سه عددِ بی‌واحد و «لیتر» فقط کنارِ آخری. کد فقط حاصل‌ضرب/خارج‌قسمتِ عددها را می‌سنجد: هر عامل واحد دارد؟
     بُعدِ دو طرف یکی است؟ دو واحدِ هم‌بُعد ولی ناهم‌اندازه (سانتی‌متر³ و لیتر) تبدیل را نوشته‌اند؟ — عددِ قراردادی نیست، فقط ابعاد. */
  /* A2 (دورِ ۳، s17): واحدِ مرکب به هر شکلِ رایج — «مترمربع/مترمکعب» (چسبیده)، «متر مربع»، «سانتی‌متر مکعب»، m^2 ، cm³ — پیش‌تر «۲۰۰ مترمربع × ۰٫۱۲ متر
     = ۲۴ مترمکعب» (کارِ درست) رد می‌شد چون فقط شکلِ با فاصله شناخته می‌شد. ترتیب مهم است: مرکب پیش از ساده. */
  var UNIT_T = [["کیلو ?متر ?مربع|km\\^?2|km²", { L: 2 }, 1e6], ["کیلومتر|km", { L: 1 }, 1e3], ["سانتی ?متر ?مکعب|سانتیمتر ?مکعب|cm\\^?3|cm³|سی ?سی|cc", { L: 3 }, 1e-6], ["میلی ?متر ?مکعب|mm\\^?3|mm³", { L: 3 }, 1e-9], ["متر ?مکعب|m\\^?3|m³", { L: 3 }, 1],
    ["سانتی ?متر ?مربع|سانتیمتر ?مربع|cm\\^?2|cm²", { L: 2 }, 1e-4], ["میلی ?متر ?مربع|mm\\^?2|mm²", { L: 2 }, 1e-6], ["متر ?مربع|m\\^?2|m²", { L: 2 }, 1],
    ["میلی ?متر|mm", { L: 1 }, 1e-3], ["سانتی ?متر|سانتیمتر|سانت|cm", { L: 1 }, 1e-2], ["متر|m", { L: 1 }, 1], ["اینچ|inch", { L: 1 }, 0.0254], ["میلی ?لیتر|ml", { L: 3 }, 1e-6], ["لیتر|lit|l", { L: 3 }, 1e-3],
    ["کیلوگرم|کیلو|kg", { M: 1 }, 1], ["گرم|g", { M: 1 }, 1e-3], ["تن", { M: 1 }, 1e3], ["ثانیه|sec|s", { T: 1 }, 1], ["دقیقه|min", { T: 1 }, 60], ["ساعت|h", { T: 1 }, 3600], ["روز", { T: 1 }, 86400],
    ["تومان|تومن", { C: 1 }, 10], ["ریال", { C: 1 }, 1], ["دلار", { D: 1 }, 1]];
  var UNIT_RE = new RegExp("^\\s*(" + UNIT_T.map(function (u) { return u[0]; }).join("|") + ")(?![a-zء-یپچژکگ])");
  function unitOf(t) { var m = UNIT_RE.exec(t); if (!m) return null; var w = m[1]; for (var i = 0; i < UNIT_T.length; i++) if (new RegExp("^(?:" + UNIT_T[i][0] + ")$").test(w)) return { w: w, dim: UNIT_T[i][1], k: UNIT_T[i][2] }; return null; }
  function dimAdd(a, b, sg) { var o = {}; Object.keys(a).concat(Object.keys(b)).forEach(function (k) { o[k] = (a[k] || 0) + sg * (b[k] || 0); if (!o[k]) delete o[k]; }); return o; }
  function dimFa(dm) { var F = { L: "طول", M: "جرم", T: "زمان", C: "پول (ریال/تومان)", D: "دلار" }, ks = Object.keys(dm); return ks.length ? ks.map(function (k) { return F[k] + (dm[k] !== 1 ? "^" + dm[k] : ""); }).join("·") : "بی‌بُعد"; }
  /* E4 (دورِ ۴، s17): «۰٫۱۲ متر ⇒ ۲۰۰ مترمربع × ۰٫۱۲ متر = ۲۴ مترمکعب» رد می‌شد چون فقط «=» جدا می‌کرد و تبدیلِ پیشین به حاصل‌ضرب چسبید —
     هر گزاره (جداشده با ⇒ / → / ؛ / «پس» / سطرِ تازه) جدا سنجیده می‌شود؛ پیامِ تکراری یک بار. */
  function unitsCheck(text) {
    var st = norm(text).split(/⇒|⟹|→|=>|->|؛|;|\n|(?:^|\s)پس(?=\s)/).filter(function (x) { return /\d/.test(x); }), why = [], dims = [];
    if (st.length > 1) { st.forEach(function (x) { var r0 = unitsCheck1(x); r0.why.forEach(function (w) { if (why.indexOf(w) < 0) why.push(w); }); dims = dims.concat(r0.dims); }); return { ok: !why.length, why: why, dims: dims }; }
    return unitsCheck1(text);
  }
  function unitsCheck1(text) {
    var x = norm(text).replace(/٫/g, ".").replace(/[×✕✖·*]/g, " * ").replace(/[÷⁄∕]/g, " / ").replace(/(\d)\s*x\s*(?=\d)/g, "$1 * ").replace(/(\d[^\d*\/=<>≤≥]{0,25}?)\s+در\s+(?=\d)/g, "$1 * ");
    var why = [], sides = x.split(/[=≤≥<>]|برابر|کمتر\s*از|بیشتر\s*از/), info = [];
    var sd = sides.map(function (sd0) {
      var parts = sd0.split(/\s*([*\/])\s*/), fac = [];
      for (var i = 0; i < parts.length; i += 2) { var m = /(\d+(?:\.\d+)?)(.*)$/.exec(parts[i] || ""); if (m) fac.push({ n: m[1], u: unitOf(m[2]), op: i ? parts[i - 1] : "*" }); }
      return fac;
    });
    /* بی عددِ قراردادی: عاملِ بی‌واحد در دو الگو پرسیده می‌شود — (۱) «واحد فقط کنارِ عددِ آخر» («۲۰۰ × ۱۲۰ × ۱۰۰ لیتر»: آن لیتر مالِ کدام است؟)
       (۲) هیچ عاملی واحد ندارد ولی طرفِ دیگر واحد دارد. توانِ ده (۱۰، ۱۰۰، ۱۰۰۰ …) ضریبِ تبدیل است. پاسخ: واحدِ هر عدد، یا «ضریب/بی‌بُعد/ثابت» کنارش. */
    function pow10(n) { var l = Math.log10(+n); return +n > 1 && Math.abs(l - Math.round(l)) < 1e-12; }
    var constOk = /ضریب|بی\s*بعد|ثابت|π|پی(?![ء-ی])/.test(x), unitAny = sd.some(function (fac) { return fac.some(function (f) { return f.u; }); });
    sd.forEach(function (fac, si) {
      if (fac.length < 2) return;
      var bare = fac.filter(function (f) { return !f.u && !pow10(f.n); }), last = fac[fac.length - 1], onlyLast = last.u && fac.slice(0, -1).every(function (f) { return !f.u; });
      if (!constOk && onlyLast && bare.length >= 1) why.push("در «" + fac.map(function (f) { return fa(f.n) + (f.u ? " " + f.u.w : ""); }).join(" … ") + "» واحد فقط کنارِ عددِ آخر آمده: واحدِ " + bare.map(function (f) { return fa(f.n); }).join("، ") + " را بنویس (اگر ضریب‌اند، «ضریب» کنارشان) — بعد ببین حاصل با «" + last.u.w + "» هم‌واحد است یا تبدیل لازم است");
      else if (!constOk && bare.length === fac.length && unitAny) why.push("در «" + fac.map(function (f) { return fa(f.n); }).join(" … ") + "» هیچ عددی واحد ندارد ولی طرفِ دیگر واحد دارد — واحدِ هر کدام را بنویس");
      else if (fac.some(function (f) { return f.u; })) {
        var dm = {}, k = 1; fac.forEach(function (f) { var sg = f.op === "/" ? -1 : 1; if (f.u) { dm = dimAdd(dm, f.u.dim, sg); k *= Math.pow(f.u.k, sg); } else k *= Math.pow(+f.n, -sg); });
        sd[si].dim = dm; sd[si].k = k; info.push(dimFa(dm));
      }
    });
    sd.forEach(function (fac, si) { if (fac.length === 1 && fac[0].u) { sd[si].dim = fac[0].u.dim; sd[si].k = fac[0].u.k; } });
    var withDim = sd.filter(function (f) { return f.dim; });
    if (withDim.length >= 2) {
      var a = withDim[0], b = withDim[1];
      if (dimFa(a.dim) !== dimFa(b.dim)) why.push("بُعدِ دو طرف یکی نیست: " + dimFa(a.dim) + " در برابرِ " + dimFa(b.dim));
      else if (Math.abs(Math.log10(a.k / b.k)) > 1e-9) {
        var lr = Math.abs(Math.log10(a.k / b.k)), conv = /تبدیل/.test(x) || (x.match(/\d+(?:\.\d+)?/g) || []).some(function (n0) { return +n0 > 0 && Math.abs(Math.abs(Math.log10(+n0)) - lr) < 1e-9; });
        if (Math.abs(lr) < 1e-9) conv = true;
        if (!conv) why.push("دو طرف هم‌بُعدند (" + dimFa(a.dim) + ") ولی واحدشان هم‌اندازه نیست — ضریبِ تبدیل را بنویس (مثلاً ۱۰۰۰ سانتی‌متر³ = ۱ لیتر)");
      }
    }
    why = why.filter(function (w, i) { return why.indexOf(w) === i; });
    return { ok: !why.length, why: why, dims: info };
  }
  A.liveUnitsCheck = unitsCheck;
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
    var d = UD[pid] = UD[pid] || (L0.uDraft ? JSON.parse(JSON.stringify(L0.uDraft)) : { type: typeOf(r, s), nat: "", one: prev.one || "", why: prev.why || "", u: prev.u || "", dl: (prev.dl || []).map(function (x) { return { id: x.id, t: x.t, eff: x.eff || "", effWhy: x.effWhy || "" }; }), c: prev.c || "", rel: prev.rel || "", suff: prev.suff || "", suffWhy: prev.suffWhy || "", suffChal: prev.suffChal || "", sat: prev.sat || "", fig: prev.fig || "", dead: prev.deadTxt || "",
      prac: JSON.parse(JSON.stringify(prev.prac || {})), nota: JSON.parse(JSON.stringify(prev.nota || [])), spatial: spatialOf(s, r), figc: JSON.parse(JSON.stringify(prev.figc || {})), restate: "", restateWhy: "",
      guess: "", conf: "", test: "", testRes: "", ifRef: "", gWant: "", gContra: "", gChal: "" });
    if (!d.dl.length) { d.dl.push({ id: nid(s, d.dl), t: "" }); d.dl.push({ id: nid(s, d.dl), t: "" }); }
    if (d.wholeOk == null) d.wholeOk = !!prev.one;
    /* داور: انتخابِ کاربر در همین پیش‌نویس ⇐ رکورد (r.p.nat) ⇐ پیشنهادِ کد (پیش‌انتخاب) ⇐ خالی (انتخاب لازم) — هرگز پیش‌فرضِ بی‌صدا */
    if (d.type === "prove" || d.type === "pod") { if (!d.natSet) { var ex0 = natExplicit(r); d.nat = ex0 || "objective"; d.natAuto = !ex0; } }   // D1: پیش‌فرض، نه قفل
    else if (!d.natSet) { d.nat = (r.p.nat && NAT[r.p.nat] ? r.p.nat : NAT[prev.nat] ? prev.nat : natGuess(r.p.statement + " " + r.p.title)) || ""; d.natAuto = !!d.nat && (!r.p.nat || r.p.natBy === "guess") && !prev.nat; }
    if (!NAT[d.nat]) d.nat = "";
    d.prac = d.prac || {}; d.nota = d.nota || []; d.figc = d.figc || {};
    if (!d.nota.length) d.nota.push({ s: "", m: "" });
    var dTimer = null;
    function saveNow() { if (UD[pid] !== d) return; L0.uDraft = JSON.parse(JSON.stringify(d)); S.put(pg); }
    function saveDraft() { if (dTimer) clearTimeout(dTimer); dTimer = setTimeout(function () { dTimer = null; saveNow(); }, 350); }
    function rerender() { if (dTimer) { clearTimeout(dTimer); dTimer = null; } saveNow(); A.render(); }
    var T = T0(d.type), prac = d.nat === "practical";
    var box = h("section", own({ class: "card lp-u", "data-nat": d.nat || "none" }), h("div", { class: "eyebrow" }, "فهمِ مسئله" + (live(s).reU ? " — دوباره" : "")),
      h("h3", {}, "اول کل، بعد جزءها"),
      h("p", { class: "small" }, d.type !== "find" ? "پیش از هر کاری مسئله را بفهم و بخواهی‌اش. اول کلِ مسئله را بی‌جزئیات در یک جمله ببین؛ بعد حکم، هر بخشِ فرض جدا، و بخش‌های حکم. هر بخشِ فرض را جدا بنویس — بعداً صفحه دربارهٔ هر بخشی که به کار نبردی، با نامش، می‌پرسد." : "پیش از هر کاری مسئله را بفهم و بخواهی‌اش. اول کلِ مسئله را بی‌جزئیات در یک جمله ببین؛ بعد مجهول، هر داده جدا، و شرط. هر داده را جدا بنویس — بعداً صفحه دربارهٔ هر داده‌ای که به کار نبردی، با نامش، می‌پرسد."),
      prov("u", d.type === "prove" || (d.type === "pod" && d.nat === "objective")),
      h("div", { class: "card soft small lp-stmt" }, h("strong", {}, "صورتِ خودت: "), r.p.statement));
    /* داور: کامل‌بیان‌شده / عملی / زندگی — تمایز دیده و به کار گرفته می‌شود (قابِ عملی، اجرای برهانی، پرسش‌های بازنگری) */
    var natSel = selF("lpNat", "داورِ این مسئله کیست — کامل‌بیان‌شده یا عملی؟", Object.keys(NAT).map(function (k) { return [k, NAT[k].fa]; }), d.nat, function (v) { d.nat = NAT[v] ? v : ""; d.natSet = true; d.natAuto = false;
      /* F4 (دورِ ۵، s13): انتخابِ داور همان لحظه روی رکورد می‌نشیند — نه فقط با «ثبتِ فهم» (پیش‌تر دستیار در این فاصله می‌گفت «داور هنوز انتخاب نشده») */
      if (NAT[v]) { r.p.nat = v; r.p.natBy = "user"; S.put(r); }
      rerender(); });
    var objT = d.type === "prove" || d.type === "pod";
    box.appendChild(natSel);
    if (objT) box.appendChild(h("p", { class: "small muted lp-natobj" }, d.nat === "objective" ? "پیش‌فرضِ «اثباتی» و «اثبات یا رد کن»: کامل‌بیان‌شده — حکم یا درست است یا نه و داورش برهان است. اگر فرضیه‌ای دربارهٔ زندگیِ خودت است که برهان ندارد («… برای من درست است؟»)، داور را «زندگی» کن." : "«اثبات یا رد کن» با داورِ «" + (NAT[d.nat] ? NAT[d.nat].fa.split(" — ")[0] : "—") + "»: برهان ندارد — داور واقعیت است و هرگز یقین نمی‌دهد."));
    else if (d.natAuto && d.nat) box.appendChild(h("p", { class: "small lp-natauto" }, "پیش‌انتخابِ کد از صورتت — اگر نیست، عوضش کن (تصمیم با خودت است)."));
    else if (!d.nat) box.appendChild(h("p", { class: "small warnline lp-natneed" }, "داور را برگزین: تصمیم یا پروژهٔ زندگی، مسئلهٔ عملی با کمیت، یا مسئلهٔ کامل‌بیان‌شده با پاسخِ عینی — همهٔ پرسش‌های بعدی از همین می‌آیند."));
    if (d.nat) box.appendChild(h("p", { class: "small muted lp-natnote" }, NAT[d.nat].note));
    var ng = natGuess(r.p.statement + " " + r.p.title); if (ng && d.nat && ng !== d.nat && !objT) box.appendChild(h("p", { class: "small warnline lp-nathint" }, "از صورتت به نظر می‌رسد «" + NAT[ng].fa.split(" — ")[0] + "» باشد — اگر چنین است، داور را عوض کن (تصمیم با خودت است)."));
    box.appendChild(U.typeSel("lpType", d.type, function (v) { d.type = v; if ((v === "prove" || v === "pod") && !d.natSet) { d.nat = natExplicit(r) || "objective"; } else if (objT && !d.natSet) { d.nat = ""; } rerender(); }));
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
    /* برچسب‌های «اثباتی / اثبات یا رد کن» بی واژه‌های مسئلهٔ یافتنی (دورِ ۲، s33): فرض = بخش‌های فرض؛ ۵ = بخش‌های حکم (نه تکرارِ «بخش‌های فرض») */
    var dbox = h("fieldset", { class: "col gap lp-dl" }, h("legend", {}, "۴) " + (d.type === "find" ? "داده‌ها — هر کدام جدا (چیزی که می‌دانی یا در دست داری: عدد، منبع، محدودیت، آدم، زمان)" : "بخش‌های فرض — هر بخش جدا (آنچه پذیرفته شده: «… است»، «اگر …»)")));
    if (prac) dbox.appendChild(h("p", { class: "small lp-effq" }, "مسئلهٔ عملی: «همهٔ داده‌ها» بی‌شمارند — کدام داده‌ها اثرِ محسوس دارند؟ برای هر داده بگو؛ آنچه اثرش ناچیز است با دلیل کنار می‌رود (کجا خط می‌کشی)."));
    d.dl.forEach(function (x, i) {
      dbox.appendChild(field("lpD_" + x.id, (d.type === "find" ? "دادهٔ " : "فرضِ ") + fa(i + 1), x.t, function (v) { x.t = v; }, 0));
      if (prac) {
        dbox.appendChild(selF("lpDE_" + x.id, "اثرِ دادهٔ " + fa(i + 1) + " روی مجهول", EFF, x.eff || "", function (v) { x.eff = v; rerender(); }));
        if (x.eff === "small") dbox.appendChild(field("lpDW_" + x.id, "چرا اثرش ناچیز است؟ (دلیلِ کنار گذاشتن)", x.effWhy || "", function (v) { x.effWhy = v; }, 0));
      }
    });
    dbox.appendChild(h("button", { class: "btn ghost sm lp-dadd", type: "button", onclick: function () { d.dl.push({ id: nid(s, d.dl), t: "" }); L0.uDraft = JSON.parse(JSON.stringify(d)); S.put(pg); A.render(); } }, d.type === "find" ? "+ دادهٔ دیگر" : "+ فرضِ دیگر"));
    box.appendChild(dbox);
    box.appendChild(field("lpCond", "۵) " + T.c, d.c, function (v) { d.c = v; }, 3, "هر بخش در یک سطر"));
    box.appendChild(field("lpRel", d.type === "find" ? "۶) پیوندِ جزءها: کدام داده به کدام بخشِ شرط یا به مجهول ربط دارد؟ (اختیاری)" : "۶) پیوندِ جزءها: کدام بخشِ فرض به کدام بخشِ حکم ربط دارد؟ (اختیاری)", d.rel, function (v) { d.rel = v; }, 0));
    /* دادهٔ وابسته به مجهول (دورِ ۲، s03/s10؛ A151 یکنوایی): داده‌ای که خودش با مجهول عوض می‌شود — در طرح رابطه‌اش و در بازنگری یکنوایی پرسیده می‌شود */
    if (d.type === "find") {
      box.appendChild(selF("lpDep", "آیا داده‌ای هست که خودش با مجهول عوض می‌شود (به مجهول وابسته است)؟ (اختیاری)", [["no", "نه — داده‌ها ثابت‌اند"], ["yes", "بله"]], d.dep || "", function (v) { d.dep = v; rerender(); }));
      if (d.dep === "yes") box.appendChild(field("lpDepW", "کدام داده، و وقتی مجهول بزرگ‌تر می‌شود آن بیشتر می‌شود یا کمتر؟", d.depWhy || "", function (v) { d.depWhy = v; }, 0));
    }
    /* A13 (s10): «برآوردنی؟» برای «اثبات یا رد کن» هم — فرضی که هیچ موردی برآوردش نمی‌کند حکم را تهی می‌کند؛ «نه» ⇒ کارتِ شل کردنِ بخشی از شرط در طرح */
    if (d.type === "find" || d.type === "pod") box.appendChild(selF("lpSat", satLabel(d.type, d.nat, r.p.statement), d.type === "pod" ? SAT_POD_OPTS : SAT, d.sat, function (v) { d.sat = v; rerender(); }));
    box.appendChild(selF("lpSuff", prac ? "در مسئلهٔ عملی داده‌ها هرگز کامل و دقیق نیستند: با داده‌هایی که اثرِ محسوس دارند، مجهول به‌قدرِ تقریبِ کافی معین می‌شود؟" : T.suff, suffOpts(d.type), d.suff, function (v) { d.suff = v; rerender(); }));
    box.appendChild(field("lpSuffW", "چرا؟ (یک جمله)", d.suffWhy, function (v) { d.suffWhy = v; }, 0));
    var items0 = d.dl.filter(function (x) { return txt(x.t); });
    if ((d.suff === "کافی است" || d.sat === "yes") && (d.showCirc || circular(d.suffWhy, d.u))) box.appendChild(h("div", { class: "card soft col gap lp-suffcirc" }, h("p", { class: "small warnline" }, "دلیلت («" + clip(d.suffWhy, 100) + "») نتیجه‌ای دربارهٔ خودِ مجهول می‌گیرد — این را از داده‌ها داری یا پیش‌فرض است؟ پاسخِ «برآوردنی/کافی است» نباید جوابِ مسئله را از پیش بداند."),
      field("lpSuffCirc", "کدام داده این را می‌گوید؟ اگر هیچ داده‌ای نمی‌گوید، بنویس «پیش‌فرض است» و آن را جدا نگه دار تا بیازمایی‌اش.", d.suffCirc || "", function (v) { d.suffCirc = v; }, 0)));
    if (d.suff === "کافی است" && (d.showChal || (items0.length && suffShaky(items0)))) box.appendChild(h("div", { class: "card soft col gap lp-suffchal" }, h("p", { class: "small warnline" }, "پیش از «کافی است»: " + suffChalQ(items0.length ? items0 : [{ t: "" }])),
      field("lpSuffChal", "پاسخِ تو: مجهول با همین‌ها چطور معین می‌شود؟", d.suffChal, function (v) { d.suffChal = v; }, 0)));
    if (prac) {
      var P = d.prac, pf = h("fieldset", { class: "col gap lp-prac" }, h("legend", {}, "قابِ مسئلهٔ عملی — جایی که خط می‌کشی"));
      pf.appendChild(field("lpPrVague", "کدام مفهومِ مبهم را باید پیش از هر کار روشن کنی؟", P.vague, function (v) { P.vague = v; }, 0));
      pf.appendChild(field("lpPrLine", "کجا خط می‌کشی؟ چه چیزی را عمداً بیرون می‌گذاری و تا کجا اطلاعات جمع می‌کنی — و چرا؟", P.ignore, function (v) { P.ignore = v; }, 0));
      pf.appendChild(field("lpPrApprox", "کدام تقریب بس است — جوابِ «به‌اندازهٔ کافی خوب» چقدر دقیق است؟", P.approx, function (v) { P.approx = v; }, 0));
      pf.appendChild(field("lpPrPrior", "دانشِ پیشین و تجربیِ نادقیق: از تجربهٔ خودت یا دیگران (حتی تقریبی) دربارهٔ چنین مسئله‌ای چه می‌دانی؟", P.prior, function (v) { P.prior = v; }, 0));
      var mOut = h("p", { class: "small lp-measout", "aria-live": "polite" });
      var mDraw = function () { var v = txt(P.measure); mOut.textContent = ""; if (!v || !A.measurableCheck) return; var m = A.measurableCheck(v), uc = unitsCheck(v); mOut.className = "small lp-measout " + (m.ok && uc.ok ? "good" : "warnline"); mOut.textContent = (m.ok ? "سنجیدنی است: عدد و رابطه دارد." : "هنوز سنجیدنی نیست: " + m.why.join(" و ") + ".") + (uc.ok ? "" : " واحدها: " + uc.why.join("؛ ") + "."); };
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
    box.appendChild(h("label", { class: "row gap small", for: "lpSpatial" }, h("input", { type: "checkbox", id: "lpSpatial", checked: d.spatial ? true : null, onchange: function (e) { d.spatial = e.target.checked; d.spatialSet = true; rerender(); } }), "مسئلهٔ فضایی یا هندسی است (شکل، اندازه، جا دادن، مسیر)"));
    if (!d.spatial && !d.spatialSet && spatialGuess(r.p.statement)) box.appendChild(h("p", { class: "small muted lp-spathint" }, "از صورتت شاید فضایی باشد — اگر شکل و اندازه در آن نقش دارند، تیک بزن (کارتِ شکل باز می‌شود)؛ اگر نه، همین‌طور بگذار."));
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
      box.appendChild(selF("lpIfRef", "اگر آزمون حدس را رد کند، چه می‌کنی؟", IFREF, d.ifRef, function (v) { d.ifRef = v; rerender(); }));
      /* دورِ ۲ (R5، s22): «آزمون را نادیده می‌گیرم» بی واکنش پذیرفته می‌شد — داستانِ جونز (B111) و C161: آزمونی که نتیجه‌اش از پیش نادیده گرفته شود، آزمون نیست */
      if (d.ifRef && d.ifRef !== IFREF[0]) box.appendChild(h("div", { class: "card soft col gap lp-ifrefwarn" }, prov("want"),
        h("p", { class: "small warnline" }, "آزمونی که نتیجه‌اش را از پیش نادیده می‌گیری، آزمون نیست: کسی که نشانه‌های خلاف را نادیده می‌گیرد کم‌کم در برابرِ همهٔ آن‌ها کور می‌شود (B111). حدسِ خوب را نگه دار — ولی فقط تا وقتی که واقعیت ردش نکرده. یا گزینهٔ اول را برگزین، یا بنویس چرا این آزمون نباید حدس را عوض کند."),
        field("lpIfRefW", "چرا ردِ این آزمون نباید حدست را عوض کند؟", d.ifRefWhy || "", function (v) { d.ifRefWhy = v; }, 0)));
      box.appendChild(selF("lpGWant", "دوست داری حدست درست باشد؟", GWANT, d.gWant, function (v) { d.gWant = v; rerender(); }));
      /* آستانهٔ بی‌قرارداد (۲۰۲۶-۱۰-۱۶): بی شاهد، درجهٔ معقول ½ است (A4)؛ خواستنِ درستی + اطمینانِ بیش از ½ همان خطرِ «دلخواه‌اندیشی» است ⇒ چالش. (پیش‌تر ۸۰٪ ِ قراردادی بود.) */
      if (d.gWant === "yes" && +d.conf > 50) box.appendChild(h("div", { class: "card soft col gap lp-gwant" }, prov("want"),
        h("p", { class: "small" }, "حدسی که دوستش داری و به آن مطمئنی «اثبات یا رد کن» می‌شود: قوی‌ترین شاهدِ خلافش را بنویس؛ با ثبتِ فهم، یک پروندهٔ سنجش در کارخانه می‌گیرد."),
        field("lpGContra", "قوی‌ترین شاهدِ خلاف: چه چیزی، اگر درست باشد، این حدس را رد می‌کند؟", d.gContra, function (v) { d.gContra = v; }, 0)));
      /* F7 (دورِ ۵، s13): تصمیمِ زندگی جدولِ x/n و فرمول ندارد — فقط حدس‌های رقیب و قیاس */
      if (A.solveKitUI) { d.kit = d.kit || A.solveBlankKit(); box.appendChild(A.solveKitUI(d.kit, { idp: "lpGK", problem: r.p.statement, parts: d.nat === "life" ? ["rivals", "ana"] : ["table", "formula", "rivals", "ana"], noDim: true, drills: false, title: d.nat === "life" ? "ابزارهای حدس: حدس‌های رقیب و قیاس" : "ابزارهای حدس: جدولِ حالت‌ها، تفاضل‌ها، حدسِ دقیق، حدس‌های رقیب و قیاس",
        intro: d.nat === "life" ? "حدس را از کجا آوردی؟ دست‌کم یک حدسِ رقیب با آزمونی که آن دو را از هم جدا کند، و موردِ آشنای مشابه (قیاس) — درستیِ قیاس را خودت می‌آزمایی." : "حدس را از کجا آوردی؟ چند حالتِ خاص را خودت حساب یا مشاهده کن (جدول؛ کد تفاضل‌های پیاپی را می‌سازد)، حدس را دقیق بنویس (فرمول؛ کد با هر حالت می‌سنجد، با دقتی که خودت نوشتی)، دست‌کم یک حدسِ رقیب با آزمونِ جداکننده، و موردِ آشنای مشابه (قیاس). درستیِ قیاس را خودت می‌آزمایی." })); }
    }
    box.appendChild(U.planList(d.type));
    var out = h("div", { "aria-live": "polite", class: "col gap lp-uout" });
    function vald() {
      var items = d.dl.filter(function (x) { return txt(x.t); }), miss = wholeWhy(d, r).concat([[d.u, T.u], [d.c, T.c]].filter(function (x) { return txt(x[0]).length < 3; }).map(function (x) { return "«" + x[1] + "»"; })), warn = [], soft = [];
      if (!NAT[d.nat]) miss.push("«داورِ این مسئله» (زندگی، عملی یا کامل‌بیان‌شده)");
      if (!items.length) miss.push(d.type === "find" ? "«دست‌کم یک داده»" : "«دست‌کم یک بخشِ فرض»");
      if (d.type === "find" && d.dep === "yes" && toks(d.depWhy).length < 2) miss.push("«کدام داده به مجهول وابسته است و چطور»");
      /* E8 (دورِ ۴، s28): «آزمون را نادیده می‌گیرم» دلیلی می‌خواهد که هزینه یا خطرِ خودِ آزمون را بگوید — «حدسم قوی است» دلیل نیست (B111) */
      if (fresh && txt(d.guess) && d.ifRef && d.ifRef !== IFREF[0] && toks(d.ifRefWhy).length >= 3 && !TEST_COST.test(norm(d.ifRefWhy))) soft.push(["ifref", "«چرا ردِ آزمون نباید حدست را عوض کند؟» — دلیلت هزینه یا خطرِ خودِ آزمون را نمی‌گوید (گران، خطرناک، برگشت‌ناپذیر، در دسترس نیست…)؛ «حدسم قوی است» دلیل نیست"]);
      if (fresh && txt(d.guess) && d.ifRef && d.ifRef !== IFREF[0] && toks(d.ifRefWhy).length < 3) miss.push("«چرا ردِ آزمون نباید حدست را عوض کند؟» (یا گزینهٔ اول)");
      if ((d.type === "find" || d.type === "pod") && !d.sat) miss.push("«" + satLabel(d.type, d.nat, r.p.statement) + "»");
      if (!d.suff) miss.push("«" + T.suff + "»");
      if (d.suff === "کافی است" && items.length && suffShaky(items) && toks(d.suffChal).length < 3) { d.showChal = true; soft.push(["chal", "پاسخ به «" + suffChalQ(items) + "»"]); }
      if ((d.suff === "کافی است" || d.sat === "yes") && circular(d.suffWhy, d.u)) {
        var cw = txt(d.suffCirc), okC = toks(cw).length >= 3 && (/پیش\s*فرض|فرض\s*کرد/.test(norm(cw)) || items.some(function (x) { return mentions(cw, x.t); }));
        if (!okC) { d.showCirc = true; soft.push(["circ", "«دلیلت مجهول را پیش‌فرض می‌گیرد؟» — بگو کدام داده آن را می‌گوید، یا که پیش‌فرض است"]); }
      }
      if (prac) {
        items.forEach(function (x) { if (!x.eff) miss.push("اثرِ «" + clip(x.t, 30) + "» (محسوس یا ناچیز)"); else if (x.eff === "small" && toks(x.effWhy).length < 2) miss.push("دلیلِ کنار گذاشتنِ «" + clip(x.t, 30) + "»"); });
        var fr = A.practicalFrameCheck && A.KPRAC_KEYS ? A.practicalFrameCheck(pracParts(d, items), A.KPRAC_KEYS) : null;
        if (fr && !fr.ok) { fr.missing.forEach(function (k) { if (["want", "have", "cond"].indexOf(k[0]) < 0) miss.push("«" + k[1] + "»"); }); fr.dup.forEach(function (x) { miss.push("«" + x + "» تکرارِ جزءِ دیگری است"); }); if (fr.unmeasured) miss.push("«ریاضی‌کردن» هنوز سنجیدنی نیست: " + fr.unmeasured.join(" و ")); }
        /* A13 (s01/s09): قابِ عملی پاسخِ تهی نمی‌پذیرد — «هیچی رو بیرون نمی‌ذارم» خط کشیدن نیست (داده‌ها بی‌شمارند)، «نمی‌دونم، دلم می‌خواد دقیق باشه» تقریب نیست */
        /* F5 (دورِ ۵، s01): «هیچی رو بیرون نمی‌ذارم، همه مهمه» با هر طولی همان «خط نمی‌کشم» است — چالشِ نرم، نه فقط پاسخِ کوتاه */
        if (txt(d.prac.ignore) && NOLINE_RE.test(norm(d.prac.ignore)) && (ALLKEEP_RE.test(norm(d.prac.ignore)) || toks(d.prac.ignore).filter(function (w) { return EMPTY_W.indexOf(" " + w + " ") < 0; }).length < 2)) soft.push(["line", "«کجا خط می‌کشی؟» — در مسئلهٔ عملی همه چیز را نمی‌شود نگه داشت؛ دست‌کم یک چیز را با دلیل بیرون بگذار"]);
        if (txt(d.prac.approx) && !APPROX_RE.test(norm(d.prac.approx)) && !QUAL_UNK.test(norm(d.u))) soft.push(["approx", "«کدام تقریب بس است؟» — حدی بگو (مثلاً «±۱۰٪»، «تا نیم متر»، «حدودِ …»)؛ «کاملاً دقیق» در مسئلهٔ عملی تقریب نیست" + (QUAL_UNK.test(norm(d.u)) ? "" : " (اگر مجهول کیفی است — چه کسی، کدام — بنویس «تقریب لازم نیست — مجهول کیفی است»)")]);
        [["vague", "کدام مفهومِ مبهم"], ["prior", "دانشِ پیشین"]].forEach(function (k) { var v0 = d.prac[k[0]]; if (txt(v0) && toks(v0).filter(function (w) { return EMPTY_W.indexOf(" " + w + " ") < 0; }).length < 2) soft.push([k[0], "«" + k[1] + "» — «نمی‌دانم/هیچ» پاسخ نیست؛ حتی حدسی یا تجربهٔ کسِ دیگری را بنویس"]); });
        /* F7 (دورِ ۵، s17): پیامِ واحد یک بار — اگر «ریاضی‌کردن هنوز سنجیدنی نیست» خودش واحدها را گفته، هشدارِ نرمِ واحد تکرار نمی‌شود */
        var ucm = txt(d.prac.measure) && !(fr && !fr.ok && (fr.unmeasured || []).some(function (x) { return /واحد/.test(x); })) ? unitsCheck(d.prac.measure) : null; if (ucm && !ucm.ok) soft.push(["units", "«ریاضی‌کردن» — واحدها: " + ucm.why.join("؛ ")]);
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
      if (fresh && txt(d.guess) && d.gWant === "yes" && +d.conf > 50 && toks(d.gContra).length < 2) miss.push("«قوی‌ترین شاهدِ خلافِ حدس»");
      var DW = !txt(d.dead) ? null : prev.deadTxt === txt(d.dead) && prev.deadline ? { date: prev.deadline } : A.willWhen(d.dead);
      if (txt(d.dead) && !(DW && DW.date && !DW.past)) miss.push("«مهلت» (روزِ مشخص و نگذشته بنویس، یا خالی بگذار)");
      var sg = softGate(d, soft, miss);   // هشدارها پس از فیلدهای واقعاً خالی
      return { miss: miss, warn: warn, items: items, DW: DW, soft: sg };
    }
    function commit(v, V) {
      var L = live(s), items = V.items, DW = V.DW, at = nowISO();
      if (uOf(s)) { L.uHist = L.uHist || []; L.uHist.push(JSON.parse(JSON.stringify(s.u[1]))); }
      s.type = d.type; r.p.kind = d.type;
      /* R2: داور و فضایی بودن روی خودِ رکورد — تکمنبع؛ ثبتِ فهم یعنی کاربر آن را تأیید کرد */
      var objC = d.type === "prove" || d.type === "pod";   // D1: پیش‌فرضِ دست‌نخورده ⇒ «type»؛ انتخابِ کاربر ⇒ «user»
      r.p.nat = d.nat; r.p.natBy = objC && !d.natSet && d.nat === "objective" ? "type" : "user"; r.p.spatial = !!d.spatial; r.p.spatialBy = "user";
      s.u[1] = { type: d.type, nat: d.nat, one: txt(d.one), why: txt(d.why), u: txt(d.u), d: items.map(function (x) { return txt(x.t); }).join(" · "),
        dl: items.map(function (x) { var o = { id: x.id, t: txt(x.t) }; if (d.nat === "practical" && x.eff) { o.eff = x.eff; if (x.eff === "small") o.effWhy = txt(x.effWhy); } return o; }),
        c: txt(d.c), rel: txt(d.rel), suff: d.suff, suffWhy: txt(d.suffWhy), fig: txt(d.fig), deadTxt: txt(d.dead), deadline: DW && DW.date || null, self: v, at: at, done: true, from: "live" };
      var U1 = s.u[1];
      if ((d.type === "find" || d.type === "pod") && d.sat) U1.sat = d.sat;
      if (txt(d.suffChal) && d.suff === "کافی است") U1.suffChal = txt(d.suffChal);
      if (V.soft) { U1.soft = V.soft; (L.softLog = L.softLog || []).push({ where: "u", keys: V.soft.keys, why: V.soft.why, at: V.soft.at }); }
      if (txt(d.suffCirc) && circular(d.suffWhy, d.u)) { U1.suffCirc = txt(d.suffCirc); if (/پیش\s*فرض|فرض\s*کرد/.test(norm(d.suffCirc))) U1.presup = true; }
      if (d.nat === "practical") { U1.prac = { vague: txt(d.prac.vague), ignore: txt(d.prac.ignore), approx: txt(d.prac.approx), prior: txt(d.prac.prior), measure: txt(d.prac.measure) };
        U1.pracCard = prev.pracCard || null;
        if (!U1.pracCard && A.practicalFrameCard && A.KPRAC_KEYS) { var pp = pracParts(d, items), cd0 = A.practicalFrameCard(r.p.title, A.KPRAC_KEYS.map(function (k) { return [k[1], txt(pp[k[0]])]; }), "lprob:practical"); if (cd0) U1.pracCard = cd0.id; } }
      var nrows = (d.nota || []).filter(function (x) { return txt(x.s) && txt(x.m); }).map(function (x) { return { s: txt(x.s), m: txt(x.m) }; }); if (nrows.length) U1.nota = nrows;
      U1.spatial = !!d.spatial;
      if (d.type === "find" && d.dep === "yes") U1.dep = txt(d.depWhy); else if (d.dep === "no") U1.dep = "";
      if (d.spatial) U1.figc = { done: txt(d.figc.done), gen: d.figc.gen, genWhy: txt(d.figc.genWhy), lab: txt(d.figc.lab) };
      if (hasPrev && d.restate) { U1.restate = { rel: d.restate, why: txt(d.restateWhy), prevOne: prev.one, prevU: prev.u, at: at }; (L.restates = L.restates || []).push(U1.restate); }
      U.seed(s, "u");
      if (fresh) {
        s.g[1] = { guess: txt(d.guess), conf: +d.conf || null, test: txt(d.test), testRes: "", ifRef: d.ifRef, before: true, seen: false, at: at, from: "live" };
        if (txt(d.gChal)) s.g[1].chal = txt(d.gChal);
        if (d.ifRef && d.ifRef !== IFREF[0]) s.g[1].ifRefWhy = txt(d.ifRefWhy);
        if (d.gWant) s.g[1].want = d.gWant;
        if (d.kit && A.solveKitEmpty && !A.solveKitEmpty(d.kit)) s.g[1].kit = U.kitCopy(d.kit);
        U.seed(s, "g");
        /* حدسِ دلخواهِ مطمئن ⇒ «اثبات یا رد کن» در کارخانه (همان مسیرِ ادعا ⇐ پرونده) */
        if (d.gWant === "yes" && +d.conf > 50 && txt(d.gContra) && A.newCase) {
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
      /* دورِ ۲ (s02): جملهٔ کلی که پس از «ثبتِ کل» دوباره رونوشت شد ⇒ دروازهٔ «اول کل» دوباره جلوی چشم (نه پیامی دربارهٔ فیلدی که دیده نمی‌شود) */
      var ww = wholeWhy(d, r); if (ww.length) { d.wholeOk = false; d.lastMiss = null; rerender(); A.toast("هنوز نه: " + ww.join("؛ "), "bad"); return; }
      var V = vald();
      if (V.miss.length) { d.gradePending = false; d.lastMiss = V.miss; A.toast(missToast(d, V.miss, "زیرِ دکمه"), "bad"); if ((d.showChal && !box.querySelector(".lp-suffchal")) || (d.showGChal && !box.querySelector(".lp-gchal")) || (d.showCirc && !box.querySelector(".lp-suffcirc"))) { rerender(); return; } out.innerHTML = ""; out.appendChild(missBox("lp-umiss", "lpSoftWhy", d, V.miss)); return; }
      d.lastMiss = null; d.gradePending = true; saveNow(); saveBtn.disabled = true; showGrade(V);
    } }, "ثبتِ فهم");
    box.appendChild(saveBtn);
    box.appendChild(out);
    if (d.gradePending && wholeWhy(d, r).length) { d.gradePending = false; d.wholeOk = false; }
    if (d.gradePending) { var V0 = vald(); if (V0.miss.length) d.gradePending = false; else { saveBtn.disabled = true; showGrade(V0); } }
    else if (d.lastMiss && d.lastMiss.length) out.appendChild(missBox("lp-umiss", "lpSoftWhy", d, d.lastMiss));
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
    var pid = r.p.id, t = typeOf(r, s), Q = phaseQs(r, s, "p");   // A11: همان فهرستِ نوع‌دارِ مربی و دستیار (یک منبع)
    if (!Q.length) return null;
    var tut = pg.tut = pg.tut || {}; tut.qi = tut.qi || {};
    /* هر مسئلهٔ تازه از پرسشی آغاز می‌کند که کمتر از همه ورزیده شده (پایین‌ترین پلهٔ نردبان؛ در برابری، کلی‌ترین) و از آن‌جا به ترتیبِ کلی ⇐ خاص
       جلو می‌رود — نه همیشه از پرسشِ ۱؛ پرسش‌هایی که از آنِ خودت شده‌اند در چرخه با «اول خودت بپرس» می‌آیند */
    if (tut.qi.lplan == null) { var best = 0, br = Infinity; Q.forEach(function (q, i) { var rg = A.qRung ? A.qRung(q) : 0; if (rg < br) { br = rg; best = i; } }); tut.qi.lplan = best; S.put(pg); }
    /* F2 (دورِ ۵، s30/s33/s35): همان قاعدهٔ پرسشِ نوبت (qOk) — «همهٔ داده‌ها؟» پیش از وجودِ طرح پرسیده نمی‌شود؛ کارت از آن می‌گذرد (و می‌شمارد‌ش) */
    for (var sk = 0; sk < Q.length && !qOk(s, Q[(tut.qi.lplan || 0) % Q.length]); sk++) tut.qi.lplan = (tut.qi.lplan || 0) + 1;
    if (sk) S.put(pg);
    var qi = (tut.qi.lplan || 0) % Q.length, q = Q[qi], P = tut.plan = tut.plan || [];
    /* تور ۱ ِ پولیا (s30): خواندنِ مکانیکی — سه پاسخِ پیاپیِ یکسان یا تقریباً خالی (مثلاً «کمک نکرد»)، یا سه «کمک نکرد» در داوری، یا رسیدن به
       تهِ فهرست (دورِ دوم بی‌صدا آغاز نمی‌شود) ⇒ هشدارِ «پرسش‌ها را مکانیکی نخوان» و «کدام پرسش واقعاً حالا می‌خواند؟» (A164) */
    var rt = roteState(pg, s, Q);
    if (rt) return roteCard(r, pg, s, Q, rt);
    var cur = P.filter(function (e) { return e && e.src === "live" && e.qi === qi && e.q === q && !e.skip; }).pop();
    var box = h("section", own({ class: "card soft lp-ask", "data-qi": qi }), h("div", { class: "eyebrow" }, "❔ پرسشِ همین لحظه (طرح‌ریزی) · پرسشِ " + fa(qi + 1) + " از " + fa(Q.length) + " — از کلی به خاص"));
    function next() { tut.qi.lplan = (tut.qi.lplan || 0) + 1; S.put(pg); delete AD[pid]; A.render(); }
    var u = uOf(s); if (u && u.u) box.appendChild(h("p", { class: "small sv-goal" }, "🎯 هدف را گم نکن — " + goalWord(r, s) + ": «" + clip(u.u, 140) + "»"));
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
    box.appendChild(h("p", { class: "small muted" }, "چرا این پرسش؟ " + (t === "find" ? U.WHY.p : goalWord(r, s) === "فرضیه" ? "طرحِ آزمودنِ فرضیه از پیوندِ فرض با پیامدهای سنجیدنی‌اش درمی‌آید؛ پرسش‌ها از آشنا به دور و از کل به جزء می‌روند." : "طرحِ اثبات از پیوندِ فرض و حکم درمی‌آید؛ پرسش‌ها از آشنا به دور و از کل به جزء می‌روند.") + " اگر با وضعِ همین لحظه نمی‌خواند، نپرس — پرسشِ بعد را بگیر." + (nUse ? " این پرسش را " + fa(nUse) + " بار به کار برده‌ای (پلهٔ " + fa(rung) + " از نردبان؛ از پلهٔ " + fa(A.Q_OWN_RUNG) + " اول خودت می‌پرسی)." : "")));
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
  A.liveRote = function (pid) { var r = rec(pid); if (!r) return null; var pg = pgOf(pid), s = solOf(pg); return roteState(pg, s, phaseQs(r, s, "p")); };
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
  /* «چه چیزی مشترک است؟» (دورِ ۲، R4): کاربر خودش اعلام می‌کند — روش، مجهول، داده‌ها، شرط، شکل/ساختار (هم‌ریخت، A234) یا نتیجه؛ کد فقط می‌سنجد
     خطِ توضیح مشخص است (سه واژهٔ معنادار) و رونوشتِ صورت نیست — نه «واژهٔ مشترک ندارد». «شکل/ساختار» نگاشتِ خودِ کاربر را می‌خواهد (هر جزء ⇐ جزءِ متناظر). */
  var SHARE = [["method", "روش — همان راه به کار می‌آید"], ["unknown", "مجهول — همان خواسته یا خواسته‌ای شبیه"], ["data", "داده‌ها — همان داده‌ها یا داده‌هایی شبیه"], ["cond", "شرط — همان شرط یا بخشی از آن"], ["form", "شکل/ساختار — هم‌ریخت: هر جزءِ آن متناظرِ جزئی از این"], ["result", "نتیجه‌اش — نتیجهٔ آن را این‌جا به کار می‌برم"]];
  var MAP_RE = /\S+\s*(?:⇐|⇒|←|→|=|:|↔|به\s*جای|متناظر\s*(?:با|ِ)?|یعنی)\s*\S+/;
  function mapOk(t) { return MAP_RE.test(String(t || "")) && toks(t).length >= 2; }
  A.liveMapOk = mapOk;
  function shareMiss(sh, line, map, st) {
    var o = []; if (!sh) o.push("بگو چه چیزی مشترک است (روش، مجهول، داده، شرط، ساختار یا نتیجه)");
    if (!spec(line)) o.push("یک خطِ مشخص بنویس (دست‌کم سه واژهٔ معنادار)"); else if (near(line, st)) o.push("این خط رونوشتِ صورتِ همین مسئله است — بگو دقیقاً چه چیزی از آن مورد می‌آید");
    if (sh === "form" && !mapOk(map)) o.push("ساختارِ یکسان نگاشت می‌خواهد: هر جزءِ آن مسئله ⇐ جزءِ متناظر در این (مثلاً «شهرها ⇐ رأس‌ها، جاده‌ها ⇐ یال‌ها»)");
    return o;
  }
  var RD = {};
  function relatedCard(r, pg, s) {
    var pid = r.p.id, L = live(s), R = A.liveRelated(pid, 3), d = RD[pid] = RD[pid] || { ans: (L.seen && L.seen.ans) || "", where: (L.seen && L.seen.where) || "", fam: (L.seen && L.seen.fam) || "", share: (L.seen && L.seen.share) || "", map: (L.seen && L.seen.map) || "" };
    var prR = proofLike(r, s);   // G5 (دورِ ۶، s03): اثباتی مجهول ندارد — «به حکم نگاه کن»
    var lpR = lifePod(r, s), pvR = prov("rel", prR); if (lpR && pvR) pvR.textContent = podWord(pvR.textContent);
    var box = h("section", own({ class: "card soft lp-rel" }), h("h4", {}, (prR ? "به حکم نگاه کن" : lpR ? "به فرضیه نگاه کن" : "به مجهول نگاه کن") + ": مسئلهٔ مرتبط از کارهای خودت"),
      pvR,
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
      var c = candidates(pid).filter(function (y) { return y.id === x.id; })[0], k = "c" + i, ks = "s" + i, km = "m" + i; d[k] = d[k] != null ? d[k] : x.carry || ""; d[ks] = d[ks] != null ? d[ks] : x.share || ""; d[km] = d[km] != null ? d[km] : x.map || "";
      var rc = h("div", { class: "col gap lp-relcarry", "data-id": x.id }, selF("lpRelS_" + i, "با «" + clip(c ? c.fa : x.id, 60) + "» چه چیزی مشترک است؟", SHARE, d[ks], function (v) { d[ks] = v; A.render(); }),
        field("lpRelC_" + i, "از «" + clip(c ? c.fa : x.id, 60) + "» دقیقاً چه چیزی به این مسئله می‌آید — نتیجه‌اش، روشش یا عنصری کمکی؟", d[k], function (v) { d[k] = v; }, 0));
      if (d[ks] === "form") rc.appendChild(field("lpRelM_" + i, "نگاشت: هر جزءِ آن مسئله ⇐ کدام جزءِ این مسئله؟ (مثلاً «شهرها ⇐ رأس‌ها، جاده‌ها ⇐ یال‌ها»)", d[km], function (v) { d[km] = v; }, 0));
      rc.appendChild(h("button", { class: "btn ghost sm lp-relcsave", type: "button", onclick: function () { var ms = shareMiss(d[ks], d[k], d[km], r.p.statement); if (ms.length) { A.toast("هنوز نه: " + ms.join("؛ ") + ".", "bad"); return; } x.carry = txt(d[k]); x.share = d[ks]; if (d[ks] === "form") x.map = txt(d[km]); else delete x.map; x.carryAt = nowISO(); S.put(pg); A.render(); } }, x.carry ? "به‌روزکردن" : "ثبتِ آنچه به کار می‌آید"));
      box.appendChild(rc);
    });
    box.appendChild(selF("lpSeen", prR ? "همین حکم (یا حکمی شبیه) را جایی دیده‌ای — قضیه‌ای که همین را نتیجه می‌دهد؟" : lpR ? "همین فرضیه (یا فرضیه‌ای شبیه) را جایی دیده‌ای — در زندگیِ خودت یا کارِ دیگران؟" : "همین مجهول (یا مجهولی شبیه) را جایی دیده‌ای — در زندگیِ خودت یا کارِ دیگران؟", [["yes", "بله"], ["no", "نه"]], d.ans, function (v) { d.ans = v; A.render(); }));
    if (d.ans === "yes") { box.appendChild(selF("lpSeenS", "با آن چه چیزی مشترک است؟", SHARE, d.share, function (v) { d.share = v; A.render(); }));
      box.appendChild(field("lpSeenW", "کجا؟ چه چیزی از آن به کار می‌آید — نتیجه‌اش، روشش، یا عنصری کمکی؟", d.where, function (v) { d.where = v; }, 2));
      if (d.share === "form") box.appendChild(field("lpSeenM", "نگاشت: هر جزءِ آن ⇐ کدام جزءِ این مسئله؟", d.map, function (v) { d.map = v; }, 0)); }
    if (d.ans === "no") box.appendChild(field("lpSeenF", "پاسخِ «نه» هم دانش را بسیج می‌کند: پس چه چیزی در این مسئله برایت آشناست؟", d.fam, function (v) { d.fam = v; }, 2));
    box.appendChild(h("button", { class: "btn ghost sm lp-seensave", type: "button", onclick: function () {
      if (!d.ans || (d.ans === "no" && txt(d.fam).length < 3)) { A.toast("بگو دیده‌ای یا نه، و یک جمله دربارهٔ آن.", "bad"); return; }
      if (d.ans === "yes") { var ms = shareMiss(d.share, d.where, d.map, r.p.statement); if (ms.length) { A.toast("هنوز نه: " + ms.join("؛ ") + ".", "bad"); return; } }
      L.seen = { ans: d.ans, where: txt(d.where), fam: txt(d.fam), at: nowISO() }; if (d.ans === "yes") { L.seen.share = d.share; if (d.share === "form") L.seen.map = txt(d.map); } S.put(pg); A.toast("ثبت شد."); A.render();
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
      /* دورِ ۲ (s03؛ C094/C095): نبودِ نشانهٔ پیشرفت از بن‌بست خبر می‌دهد — ولی نشانه‌ها گاهی فریب می‌دهند */
      if (c.dead) fs.appendChild(h("p", { class: "small warnline lp-bkmislead" }, "نبودِ نشانهٔ پیشرفت از بن‌بست خبر می‌دهد، ولی نشانه‌ها گاهی فریب می‌دهند (C095): پیش از کنار گذاشتنِ این شاخه بپرس کدام حلقه‌اش واقعاً ناشدنی است — شاید فقط همان یک حلقه را باید عوض کرد، نه کلِ شاخه را."));
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
      selF("lpAuxK", "چه نوع مسئلهٔ کمکی؟", AUX, d.k, function (v) { d.k = v; A.render(); }),   // نوع ⇒ پرسشِ ویژه‌اش (حدِ قیاس، استدلالِ تعمیم) همان‌جا
      field("lpAuxT", "مسئلهٔ کمکی را بنویس", d.t, function (v) { d.t = v; }, 2),
      field("lpAuxB", "از آن چطور به مسئلهٔ اصلی برمی‌گردی؟", d.bridge, function (v) { d.bridge = v; }, 0));
    /* A7 (دورِ ۳): قیاس بی حدش نیست — «کجا این شباهت می‌شکند؟» (C150 همان روحِ «هر ضرب‌المثل ضدِ خود را دارد»: شباهت راهنماست، نه برهان) */
    /* F7 (دورِ ۵، s04): «فقط بخشی از شرط را نگه دار» بی پرسشِ کتاب ناقص است — «مجهول چگونه تغییر می‌کند؟» (C045) */
    if (d.k === "part") box.appendChild(field("lpAuxVary", "مجهول چگونه تغییر می‌کند؟ — با کنار گذاشتنِ آن بخش، مجهول تا کجا معین می‌شود و وقتی آن بخش را برمی‌گردانی چطور تغییر می‌کند؟", d.vary || "", function (v) { d.vary = v; }, 0));
    if (d.k === "analog") box.appendChild(field("lpAuxLim", "کجا این شباهت می‌شکند؟ (کدام جزءِ آن مسئله این‌جا متناظری ندارد یا فرق می‌کند)", d.lim || "", function (v) { d.lim = v; }, 0));
    /* A3: «خاص ⇐ عام» برای مسئلهٔ کامل‌بیان‌شده استدلالِ تعمیم می‌خواهد (حالتِ خاص چیزی کلی را ثابت نمی‌کند) — هشدار همین‌جا */
    if (d.k === "special" && natOf(s, r) === "objective") box.appendChild(h("p", { class: "small muted lp-auxgenq" }, "پلِ «حالتِ خاص ⇐ مسئلهٔ اصلی» باید بگوید چرا نتیجهٔ خاص برای همه برقرار است: استقرا، «برای هر … چون …»، تقارن، یا «بی کاستن از کلیت». وگرنه حالتِ خاص فقط حدس می‌دهد."));
    var aout = h("p", { class: "small bad lp-auxmiss", "aria-live": "polite" });
    box.appendChild(h("button", { class: "btn ghost sm lp-auxsave", type: "button", onclick: function () {
      var miss = [];
      if (!d.k || txt(d.t).length < 3 || txt(d.bridge).length < 3) miss.push("نوع، مسئلهٔ کمکی و پلِ برگشت لازم است");
      if (d.k === "analog" && toks(d.lim).length < 2) miss.push("بگو کجا این شباهت می‌شکند (دست‌کم دو واژهٔ معنادار)");
      if (d.k === "part" && toks(d.vary).length < 2) miss.push("بگو مجهول چگونه تغییر می‌کند (دست‌کم دو واژهٔ معنادار)");
      /* G6 (دورِ ۶، s29): همان پیام یک بار — زیرِ دکمه؛ toast فقط می‌گوید ثبت نشد (پیش‌تر همان متن دو بار پشتِ هم دیده می‌شد) */
      if (miss.length) { aout.textContent = "هنوز نه: " + miss.join("؛ ") + "."; A.toast("مسئلهٔ کمکی هنوز ثبت نشد — کمبودش زیرِ «ثبتِ مسئلهٔ کمکی» آمده است.", "bad"); return; }
      var ax = { k: d.k, t: txt(d.t), bridge: txt(d.bridge), at: nowISO() }; if (d.k === "analog") ax.lim = txt(d.lim); if (d.k === "part") ax.vary = txt(d.vary);
      if (d.k === "special" && natOf(s, r) === "objective") ax.gen = genArg(ax.bridge);
      L.aux.push(ax); delete XD[pid]; S.put(pg); A.render();
    } }, "ثبتِ مسئلهٔ کمکی"));
    box.appendChild(aout);
    if (L.aux.length) box.appendChild(h("ul", { class: "small lp-auxlist" }, L.aux.map(function (a) { return h("li", {}, "«" + a.t + "» (" + ((AUX.filter(function (x) { return x[0] === a.k; })[0] || [])[1] || "") + ") — برگشت: " + a.bridge + (a.lim ? " · جایی که شباهت می‌شکند: " + a.lim : "") + (a.vary ? " · مجهول چگونه تغییر می‌کند: " + a.vary : ""),
      a.gen === false ? h("span", { class: "warnline lp-auxnogen" }, " — از حالت خاص به عام بدون استدلال: پل نمی‌گوید چرا برای همه برقرار است") : null); })));
    return box;
  }
  /* استدلالِ تعمیم (A3): استقرا، تقارن، «بی کاستن از کلیت»، نگاشتِ هم‌ریخت — یا سورِ کلی («برای هر …»، «دلخواه») همراهِ دلیل («چون»، «زیرا»، «بنا بر») */
  var GEN_STRONG = /استقرا|تقارن|متقارن|کاستن\s*از\s*کلیت|هم\s*ریخت|نزول/, GEN_Q = /(?:برای|به\s*ازای)\s*(?:هر|همه)|دلخواه/, GEN_WHY = /(?:^|\s)(?:چون|زیرا|چرا\s*که|بنا\s*بر|بنابر|به\s*دلیل)(?=\s)|هیچ\s*جا\s*از|استفاده\s*نکرد/;
  function genArg(t) { var x = norm(t); return GEN_STRONG.test(x) || (GEN_Q.test(x) && GEN_WHY.test(x)); }

  /* ---------- حرکت‌ها: از ۲۷ حرکت، با دلیلِ یک‌خطیِ خودت ---------- */
  var MD = {};
  function movesCard(r, pg, s) {
    var pid = r.p.id, L = live(s), d = MD[pid] = MD[pid] || { mv: "", why: "" }, ML = A.MOVE_LIST || [];
    if (!ML.length) return null;
    var box = h("section", own({ class: "card soft lp-moves" }), h("h4", {}, "کدام حرکت‌ها؟"),
      h("p", { class: "small" }, "از حرکت‌های حلِ مسئله آن‌هایی را برگزین که این‌جا به کار می‌آیند — هر کدام با یک دلیلِ کوتاه. «همهٔ کلیدها را بیازما»: فهرستِ آزموده‌ها همین‌جا می‌ماند."),
      selF("lpMv", "حرکت", ML.map(function (m) { return [m.id, m.fa]; }), d.mv, function (v) { var re = (v === "mv_analogy") !== (d.mv === "mv_analogy"); d.mv = v; if (re) A.render(); }),
      field("lpMvWhy", "چرا این حرکت این‌جا؟ (یک خط)", d.why, function (v) { d.why = v; }, 0));
    /* A7: «قیاس از حوزهٔ دیگر» حدِ شباهت را هم می‌خواهد */
    if (d.mv === "mv_analogy") box.appendChild(field("lpMvLim", "کجا این شباهت می‌شکند؟ (کدام جزءِ آن حوزه این‌جا متناظری ندارد)", d.lim || "", function (v) { d.lim = v; }, 0));
    box.appendChild(h("button", { class: "btn ghost sm lp-mvadd", type: "button", onclick: function () {
      if (!d.mv || txt(d.why).length < 3) { A.toast("حرکت و دلیلش را بنویس.", "bad"); return; }
      /* دلیلی که «ابزارِ طرح» شمرده نمی‌شود بی‌صدا رد نمی‌شود (دورِ ۲، s23): همین‌جا گفته می‌شود چرا */
      if (!spec(d.why)) { A.toast("دلیل را مشخص‌تر بنویس: چرا همین حرکت در همین مسئله (دست‌کم سه واژهٔ معنادار).", "bad"); return; }
      if (near(d.why, r.p.statement)) { A.toast("دلیل رونوشتِ صورتِ مسئله است — بگو این حرکت این‌جا چه می‌کند.", "bad"); return; }
      if (d.mv === "mv_analogy" && toks(d.lim).length < 2) { A.toast("قیاس: بگو کجا این شباهت می‌شکند (دست‌کم دو واژهٔ معنادار).", "bad"); return; }
      if (!L.moves.some(function (m) { return m.mv === d.mv; })) { var mv0 = { mv: d.mv, why: txt(d.why), at: nowISO() }; if (d.mv === "mv_analogy") mv0.lim = txt(d.lim); L.moves.push(mv0); } delete MD[pid]; S.put(pg); A.render();
    } }, "افزودنِ حرکت"));
    if (L.moves.length) box.appendChild(h("div", { class: "col gap lp-mvlist" }, L.moves.map(function (m) { return h("div", { class: "row gap wrap small" }, A.moveLink ? A.moveLink(m.mv) : m.mv, h("span", {}, m.why)); })));
    return box;
  }

  /* ---------- طرح در یک جمله + داده‌های به‌کارنرفته ---------- */
  /* پولیا، عمق: طرح دست‌کم یک ابزارِ طرح را واقعاً به کار گرفته باشد — کد فقط می‌سنجد ناخالی، مشخص (چند واژهٔ معنادار) و رونوشتِ صورت نیست */
  function near(a, b) { return !!(A.kNearCopy && txt(a) && txt(b) && A.kNearCopy(a, b)); }
  /* A13 (دورِ ۳، s29/s36): «مسئلهٔ تازه» ِ بازنگری با «عوض کردنِ داده یا شرط» (پولیا: «داده‌ها را عوض کن») ساخته می‌شود — پس فقط رونوشت رد می‌شود:
     همان واژه‌ها پس از یکسان‌سازیِ فاصله، نیم‌فاصله، خطِ رقم و نشانه‌گذاری؛ چهارضلعی ⇐ پنج‌ضلعی یا ۵ ⇐ ۴ مسئلهٔ تازه است. */
  function sameText(a, b) { var f = function (t) { return norm(t).split(/[^0-9a-zء-یپچژکگ]+/).filter(Boolean).join(" "); }; return !!(txt(a) && txt(b)) && f(a) === f(b); }
  function spec(t, n) { return toks(t).length >= (n || 3); }
  function heurUsed(r, s) {
    var L = live(s), u = uOf(s) || {}, o = [], st = r.p.statement;
    if (L.back && spec(L.back.solved) && spec(L.back.before1, 2) && !near(L.back.solved, st) && !near(L.back.solved, u.one)) o.push("back");
    if (L.aux.some(function (a) { return spec(a.t) && spec(a.bridge, 2) && !near(a.t, st); })) o.push("aux");
    /* دورِ ۲ (R4، s23): دلیلِ حرکت فقط در برابرِ صورتِ مسئله رونوشت‌سنجی می‌شود (نه در برابرِ نامِ خودِ حرکت — دلیلِ درست اغلب همان واژه‌ها را دارد) */
    if (L.moves.some(function (m) { return spec(m.why) && !near(m.why, st); })) o.push("move");
    /* A13 (s04): پاسخِ مشخص به «پرسشِ همین لحظه» ِ طرح هم به کار بردنِ ابزارِ طرح است (همان پرسش‌های کتاب) */
    var pgH = pgOf(r.p.id); if (((pgH.tut || {}).plan || []).some(function (e) { return e && e.src === "live" && !e.skip && spec(e.text) && !near(e.text, st); })) o.push("ask");
    if (L.related.some(function (x) { return spec(x.carry) && !near(x.carry, st) && (x.share !== "form" || mapOk(x.map)); }) || (L.seen && L.seen.ans === "yes" && spec(L.seen.where) && !near(L.seen.where, st) && (L.seen.share !== "form" || mapOk(L.seen.map)))) o.push("rel");
    return o;
  }
  A.liveHeur = function (pid) { var r = rec(pid); if (!r) return []; return heurUsed(r, solOf(pgOf(pid))); };
  var HEUR_FA = { back: "از آخر به عقب", aux: "مسئلهٔ کمکی", move: "حرکت با دلیل", rel: "مسئلهٔ مرتبط", ask: "پرسشِ طرح که پاسخش دادی" };
  var PD = {};
  function planCard(r, pg, s) {
    var pid = r.p.id, L = live(s), nat = natOf(s, r), prac = nat === "practical";
    /* تور ۱: دلیل‌های ثبت‌شده در طرحِ پیشین در فرم می‌مانند؛ پیش‌نویسِ طرح روی رکورد (L.planDraft) تا «به‌کارنرفته» و قلابِ دستیار آن را هم ببینند */
    var d = PD[pid] = PD[pid] || { t: (L.plan && L.plan.t) || L.planDraft || "", t2: (L.plan && L.plan.t2) || "", rot: (L.plan && L.plan.rot) || "", cparts: ((L.plan && L.plan.cparts) || []).slice(), relax: (L.plan && L.plan.relax && L.plan.relax.part != null) ? String(L.plan.relax.part) : "", relaxWhy: (L.plan && L.plan.relax && L.plan.relax.why) || "", unused: JSON.parse(JSON.stringify((L.plan && L.plan.unused) || {})) };
    var u0 = uOf(s) || {}, contra = suffNow(s) === "متناقض است" || u0.sat === "no";
    function still() { var dl0 = dataOf(s); return unusedOf(s, pg).filter(function (x) { return !mentions(d.t + "\n" + d.t2 + "\n" + (d.rot || ""), x.t, dl0.filter(function (y) { return y !== x; }).map(function (y) { return y.t; })); }); }   // داده‌ای که در خودِ جملهٔ طرح آمده، به کار رفته است
    var hu = heurUsed(r, s);
    var box = h("section", own({ class: "card lp-plan" }), h("h4", {}, "طرحت"),
      h("p", { class: "small lp-planhint" }, lifePod(r, s) ? "طرح از پیوندِ آنچه در دست داری با فرضیه‌ای که می‌آزمایی درمی‌آید. در یک یا دو جمله: نخست چه، سپس چه — و با کدام داده‌ها." : "طرح از پیوندِ داده و مجهول درمی‌آید. در یک یا دو جمله: نخست چه، سپس چه — و با کدام داده‌ها."),   // R8 (I-live 10، s05)
      h("p", { class: "small lp-heur " + (hu.length ? "good" : "warnline") }, hu.length ? "ابزارِ طرح که به کار بردی: " + hu.map(function (k) { return HEUR_FA[k]; }).join("، ") + "." :
        "پیش از ثبتِ طرح، دست‌کم یکی از ابزارهای بالا را واقعاً به کار ببر: مسئلهٔ مرتبط، از آخر به عقب، مسئلهٔ کمکی، یا حرکتی با دلیلش."));
    if (!hu.length) box.appendChild(prov("p"));
    var hold = h("div", { class: "lp-unhold" }), pout = h("div", { class: "lp-planmisswrap" });
    function drawMiss() { pout.innerHTML = ""; if (d.planMissL && d.planMissL.length) pout.appendChild(missBox("lp-planmiss", "lpPSoftWhy", d, d.planMissL)); }   // A13: پیامِ بازدارنده دیده شود، نه فقط در aria-live ِ toast
    function drawUn() { hold.innerHTML = ""; var un = still(), ua = unusedAsk(un, d.unused, "lpPU_", nat); if (ua) hold.appendChild(ua); else if (dataOf(s).length) hold.appendChild(h("p", { class: "small good lp-allused" }, "همهٔ داده‌ها جایی در پاسخ‌ها یا طرحت آمده‌اند، یا با دلیل کنار گذاشته شده‌اند.")); }
    var tmr = null, ptmr = null;
    function keepDraft() { if (ptmr) clearTimeout(ptmr); ptmr = setTimeout(function () { ptmr = null; if (PD[pid] !== d) return; L.planDraft = txt(d.t); S.put(pg); }, 400); }
    box.appendChild(field("lpPlan", "طرحت: نخست … ، سپس …", d.t, function (v) { d.t = v; keepDraft(); if (tmr) clearTimeout(tmr); tmr = setTimeout(drawUn, 250); }, 2));
    box.appendChild(prov("p2"));
    box.appendChild(field("lpPlan2", prac ? "طرحِ دوم (لازم برای مسئلهٔ عملی): اگر این طرح نشد، چه می‌کنی؟" : "طرحِ دوم (اختیاری): اگر این طرح نشد، چه می‌کنی؟", d.t2, function (v) { d.t2 = v; if (tmr) clearTimeout(tmr); tmr = setTimeout(drawUn, 250); }, 0));
    drawUn(); box.appendChild(hold);
    /* گام‌هایی که به نوبت تکرار می‌شوند (دورِ ۲، s37): گامی که از چرخشِ اعلام‌شده می‌آید «عوض کردنِ طرح» نیست */
    box.appendChild(field("lpPlanRot", "اگر طرحت گام‌هایی دارد که به نوبت یا هر بار تکرار می‌شوند، این‌جا بنویس (اختیاری) — مثلاً «هفتهٔ اول … ، هفتهٔ دوم …»", d.rot, function (v) { d.rot = v; }, 0));
    var ct = condTicks(s, "lpPC_", d.cparts, (typeOf(r, s) === "find" ? "طرحت کدام بخش‌های شرط را به کار می‌گیرد؟" : "طرحت کدام بخش‌های حکم را ثابت می‌کند؟") + " (کد واژه‌هایشان را هم در طرح می‌جوید)"); if (ct) box.appendChild(ct);
    if (u0.dep) box.appendChild(h("p", { class: "small warnline lp-plandep" }, "دادهٔ وابسته به مجهول: «" + clip(u0.dep, 100) + "» — طرحت این وابستگی را چطور می‌نویسد (رابطه‌ای میانِ آن و مجهول)؟ در بازنگری یکنوایی‌اش را می‌سنجی."));
    /* شرطِ متناقض یا برآوردنی‌نبودن (دورِ ۲، s10/s03؛ C045 «فقط بخشی از شرط را نگه دار»، C051 «ثابت کن برآوردنِ هم‌زمانِ بخش‌ها ناممکن است») */
    if (contra) {
      var podH = typeOf(r, s) === "pod", P0 = podH ? dataOf(s).map(function (x) { return x.t; }) : condParts(s);   // «اثبات یا رد کن»: بخش‌های فرض شل می‌شوند
      box.appendChild(h("div", { class: "card soft col gap lp-relax" }, h("h4", {}, u0.sat === "no" ? (podH ? (existQ(r.p.statement) ? "گفتی فرض برآوردنی نیست — کدام بخشِ آن را شل کنی تا موردی پیدا شود؟" : "گفتی فرض برآوردنی نیست — کدام بخشِ فرض را شل کنی تا حکم تهی نباشد؟") : "گفتی شرط برآوردنی نیست") : "گفتی شرط متناقض است"),
        h("p", { class: "small" }, "دو راه: کدام بخشِ شرط (کدام قاعده) را شل کنی تا مسئله شدنی شود — همان «فقط بخشی از شرط را نگه دار» (C045) — یا ثابت کنی که برآوردنِ هم‌زمانِ بخش‌ها ناممکن است (C051). ناممکن بودن هم پاسخ است، اگر ثابت شود."),
        selF("lpRelax", "کدام بخش را شل می‌کنی؟", P0.map(function (t, i) { return [String(i), clip(t, 80)]; }).concat([["prove", "هیچ‌کدام — اول ثابت می‌کنم که ناممکن است"]]), d.relax, function (v) { d.relax = v; }),
        field("lpRelaxW", "چرا همین؟ (با شل کردنش چه چیزی را از دست می‌دهی — یا ناممکن بودن را از کجا ثابت می‌کنی؟)", d.relaxWhy, function (v) { d.relaxWhy = v; }, 0),
        field("lpRelaxVary", "مجهول چگونه تغییر می‌کند؟ — با شل کردنِ همان بخش، مجهول تا کجا معین می‌شود و چطور تغییر می‌کند؟ (اگر ناممکن بودن را ثابت می‌کنی، لازم نیست)", d.relaxVary || "", function (v) { d.relaxVary = v; }, 0)));
    }
    box.appendChild(h("button", { class: "btn lp-plansave", type: "button", onclick: function () {
      var miss = []; if (txt(d.t).length < 5) miss.push("«طرحت»");
      if (contra && (!d.relax || toks(d.relaxWhy).length < 2)) miss.push("«کدام بخشِ شرط را شل می‌کنی (یا ناممکن بودن را ثابت می‌کنی)؟» با دلیل");
      if (contra && d.relax && d.relax !== "prove" && toks(d.relaxVary).length < 2) miss.push("«مجهول چگونه تغییر می‌کند؟»");
      if (prac && toks(d.t2).length < 3) miss.push("«طرحِ دوم» (مسئلهٔ عملی: دو کمان)");
      if (!heurUsed(r, s).length) miss.push("«دست‌کم یک ابزارِ طرح که واقعاً به کار رفته باشد»");
      if (suffDue(s, "p")) miss.push("«کافی است؟» را دوباره پاسخ بده (کارتِ بالای طرح)");
      var bk = L.back && backFix(L); if (bk && liveChains(bk).length > 1 && !chosenChain(L)) miss.push("«از آخر به عقب»: از شاخه‌های رقیب یکی را برگزین");
      var un = still(), soft = [];
      /* دورِ ۱۰ (D5، s28؛ E4): «به‌کارنرفته» حدسی از واژه‌هاست («دوفرزندی» به‌جای «دو بچه») — دادهٔ بی‌پاسخ یک بار هشدار می‌گیرد و «ثبت با همین — دلیل»
         را می‌پذیرد؛ پاسخِ خودِ کاربر («لازم نیست» بی دلیل، «نمی‌دانم» بی جمله) وارسیِ محتوایی است و سد می‌کند */
      var unAns = un.filter(function (x) { var a = d.unused[x.id]; return !a || !a.ans; });
      unAns.forEach(function (x) { soft.push(["unused:" + x.id, "«" + clip(x.t, 40) + "» را در طرحت نیافتم — به کارش بردی؟ (حدسی از واژه‌ها: اگر به نامِ دیگری آمده، همان را در دلیل بگو)"]); });
      unusedMiss(un.filter(function (x) { return unAns.indexOf(x) < 0; }), d.unused).forEach(function (x) { miss.push(x); });
      var sg = softGate(d, soft, miss);
      if (miss.length) { d.planMissL = miss.slice(); drawMiss(); A.toast(missToast(d, miss, "زیرِ دکمه"), "bad"); drawUn(); return; }
      var keep = JSON.parse(JSON.stringify((L.plan && L.plan.unused) || {})); un.forEach(function (x) { var a = d.unused[x.id] || {}; keep[x.id] = unAns.indexOf(x) >= 0 && sg ? { ans: "soft", why: sg.why, t: x.t } : { ans: a.ans, why: txt(a.why), t: x.t }; });
      if (L.plan && L.plan.at && txt(L.plan.t) !== txt(d.t)) (L.planHist = L.planHist || []).push({ t: L.plan.t, t2: L.plan.t2 || "", at: L.plan.at });
      L.plan = { t: txt(d.t), at: nowISO(), d: A.today(), unused: keep, heur: heurUsed(r, s) }; if (txt(d.t2)) L.plan.t2 = txt(d.t2);
      if (txt(d.rot)) L.plan.rot = txt(d.rot); if (d.cparts.length) L.plan.cparts = d.cparts.slice();
      if (sg) { L.plan.soft = sg; (L.softLog = L.softLog || []).push({ where: "p", keys: sg.keys, why: sg.why, at: sg.at }); }
      if (contra) { var podH2 = typeOf(r, s) === "pod"; L.plan.relax = { part: d.relax === "prove" ? "prove" : +d.relax, why: txt(d.relaxWhy), vary: d.relax === "prove" ? "" : txt(d.relaxVary), t: d.relax === "prove" ? "" : ((podH2 ? dataOf(s).map(function (x) { return x.t; }) : condParts(s))[+d.relax] || "") }; if (podH2) L.plan.relax.on = "hyp"; } delete L.planDraft; delete PD[pid];
      U.seed(s, "h");   // ابزارِ طرحی که به کار بردی از حافظه برمی‌گردد (نردبانِ همان تونل)
      S.put(pg); clearBad();
      A.toast(natOf(s, r) === "objective" ? "طرح ثبت شد؛ حالا گامِ اول — هر گام را وارسی کن: روشن می‌بینی که درست است؟ می‌توانی ثابت کنی؟" : "طرح ثبت شد؛ حالا گامِ واقعیِ بعد — با پیش‌بینی."); A.go("lprob", pid, "exec");
    } }, L.plan && L.plan.at ? "به‌روزکردنِ طرح" : "ثبتِ طرح"));
    drawMiss();
    box.appendChild(pout);
    return box;
  }

  /* ---------- کفایت: «هنوز نمی‌دانم» پیگیری می‌شود (تور ۱، s01/s17/s37) ----------
     در طرح (پیش از ثبتِ طرح، لازم) و پس از نخستین گامِ بسته (پیشنهاد) دوباره می‌پرسد؛ هر پاسخ در L.suffLog می‌ماند (فهمِ ثبت‌شده دست نمی‌خورد). */
  var SUFF_OPTS = ["کافی است", "ناکافی است — چیزی کم است", "زائد دارد — بخشی لازم نیست", "متناقض است", "هنوز نمی‌دانم"];
  /* E8 (دورِ ۴، s25): برچسبِ گزینه‌ها با نوع — «اثباتی/اثبات یا رد کن» از فرض و حکم می‌پرسد، نه از «مجهول»؛ مقدارها همان (suffNow و دوری با همان می‌خوانند) */
  var SUFF_FA = { prove: ["همهٔ فرض لازم است و برای حکم بس است", "فرض برای حکم کم است — چیزی کم است", "بخشی از فرض زائد است", "فرض‌ها با هم ناسازگارند", "هنوز نمی‌دانم"],
    pod: ["فرض برای داوری بس است", "فرض برای داوری کم است — چیزی کم است", "بخشی از فرض زائد است", "فرض‌ها با هم ناسازگارند", "هنوز نمی‌دانم"] };
  function suffOpts(ty) { var F0 = SUFF_FA[ty]; return F0 ? SUFF_OPTS.map(function (v, i) { return [v, F0[i]]; }) : SUFF_OPTS.slice(); }
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
    var box = h("section", own({ class: "card soft lp-suffq", "data-ph": where }), h("h4", {}, "دوباره: " + (String(T.suff || "").split(/[؟?]/)[0] || "آیا شرط برای تعیینِ مجهول کافی است") + "؟"),   // G5 (دورِ ۶، s03): پرسشِ همان نوع (اثباتی: «همهٔ فرض لازم است؟»)
      h("p", { class: "small" }, "در فهم گفتی «هنوز نمی‌دانم»" + (u.suffWhy ? " («" + clip(u.suffWhy, 100) + "»)" : "") + ". " + (where === "p" ? "حالا که داده‌ها و شرط را جدا نوشته‌ای، پیش از طرح دوباره بسنج — پاسخِ «نمی‌دانم» هم پذیرفته است، با دلیلِ تازه." : "حالا که نخستین گام را برداشتی و دیدی چه شد، دوباره بسنج.")),
      selF("lpSuffQ_" + where, T.suff, suffOpts(u.type), d.ans, function (v) { d.ans = v; }),
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
    /* E8 (دورِ ۴، s-D): «دیروز» فقط اگر دیروز بود — شمارِ واقعیِ روزها */
    var nD = x.d && A.daysBetween ? A.daysBetween(x.d, A.today()) : 1;
    var box = h("section", own({ class: "card lp-incubback" }), h("h4", {}, (nD > 1 ? fa(nD) + " روز پیش" : "دیروز") + " کنارش گذاشتی — چه چیزی به ذهنت رسید؟"),
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
  function guessCons(s) { var c = { yes: 0, no: 0 }, g0 = s.g && s.g[1], since = (g0 && g0.since) || ""; live(s).steps.forEach(function (st) { if (since && !(st.out && String(st.out.at) > since)) return; var g = st.out && st.out.guess; if (g && g.rel === "confirm") c.yes++; if (g && g.rel === "refute") c.no++; }); return c; }
  function plausibleCap(n) {
    var F = window.EPI_FOUND; if (!(F && F.CAPF && typeof F.CAPF.conseq === "function")) return null;
    var v = F.CAPF.conseq({ x_conseq_n: n, x_conseq_new: "تازه" }); return isFinite(v) ? v : null;
  }
  /* H3 (دورِ ۷، s01): حدسی که رد شد و جایش «ثبت به‌عنوانِ حدس» آمد در تاریخچه (L.guessHist) می‌ماند — «دوباره پیشنهادش نکن» با حدسِ تازه گم نمی‌شود؛
     سقفِ کارخانه فقط از پیامدهای همان حدسِ تازه (refutedNow) */
  A.livePlausible = function (pid) { var pg = pgOf(pid), s = solOf(pg), c = guessCons(s), H = (live(s).guessHist || []).filter(function (x) { return x && x.guess; });
    return { n: c.yes, refuted: c.no + H.length, refutedNow: c.no, refutedG: H.map(function (x) { return x.guess; }), cap: c.no ? null : plausibleCap(c.yes) }; };
  function guessPanel(r, pg, s) {
    var g = s.g && s.g[1]; if (!g || !g.guess || g.hit) return null;
    /* دورِ ۲ (R5، s20): در مسئلهٔ کامل‌بیان‌شده حدس با برهان یقینی می‌شود، نه با شمارِ پیامدها — «۵۰٪ هرگز یقین» پس از برهانِ کامل نادرست بود */
    var Lg = live(s), pfs = Lg.steps.filter(function (x) { return x.out && x.out.kind === "proof"; });
    if (natOf(s, r) === "objective" && pfs.length) {
      var intu = pfs.filter(function (x) { return x.intuitive; });
      return h("div", { class: "card soft small lp-guess lp-guessproof" }, h("p", {}, h("strong", {}, "حدسِ پیش از حلت: "), "«" + g.guess + "»" + (g.conf ? " · اطمینانِ آغاز: " + fa(g.conf) + "٪" : "")),
        h("p", {}, "برهان در کار است: " + fa(pfs.length - intu.length) + " گامِ ثابت‌شده" + (intu.length ? "، " + fa(intu.length) + " گامِ شهودی که هنوز ثابت نشده" : "") + "."),
        h("p", { class: "muted" }, "در مسئلهٔ کامل‌بیان‌شده حدس با برهانِ کامل «اثبات شد» می‌شود — نه «احتمالاً» و نه با شمارِ پیامدهای تأییدشده. وقتی همهٔ گام‌ها ثابت شدند و بازنگری ایرادی نیافت، همین‌جا «اثبات شد» می‌آید."));
    }
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
  function coachQs(r, s, ph) { return phaseQs(r, s, ph); }
  /* ---------- پرسش‌های هر مرحله، نوع‌دار (دورِ ۲ ِ تور، R2؛ برای کارتِ مربی، قلابِ دستیار و A.liveCoach) ----------
     اجرا: کامل‌بیان‌شده ⇐ «روشن می‌بینی؟ می‌توانی ثابت کنی؟» (+ حالتِ پایه برای استقرا و «n ≥ k»، + هم‌ارزی پس از تبدیل)؛ زندگی/عملی ⇐ پیش‌بینی، موعد، فاصله.
     بازنگری: اثباتی ⇐ همهٔ فرض (B095)، قاعدهٔ پاسکال (B060)، نتیجه = حکم، نقطه‌های حساس، هم‌ارزی (B009)، غیرمستقیم ⇐ مستقیم (C064)؛
     یافتنیِ کامل‌بیان‌شده ⇐ جای‌گذاری در شرط، حالتِ حدی/ابعاد/یکنوایی (A150–A152)، چند جواب، کلِ شرط؛ عملی ⇐ تقریب، واحد، دامنه و حالتِ حدیِ قانون؛ زندگی ⇐ فهرستِ عام. */
  var EXEC_LIFE = ["پیش از این گام: فکر می‌کنی چه می‌شود، و چقدر مطمئنی؟", "روشن می‌بینی که این گام به مجهول نزدیکت می‌کند — به کدام داده تکیه دارد؟", "کی انجامش می‌دهی؟ روزش را بگو تا همان روز بپرسم چه شد.", "آنچه شد با پیش‌بینی‌ات چه فاصله‌ای داشت — و این فاصله دربارهٔ فهمت از مسئله چه می‌گوید؟"];
  var EXEC_OBJ = ["هر گام را وارسی کن: روشن می‌بینی که این گام درست است؟", "می‌توانی ثابت کنی که درست است — کدام داده، تعریف، قضیه یا گامِ پیشین آن را لازم می‌آورد؟", "این گام کدام بخشِ شرط را به کار می‌برد؟"];
  var Q_BASE = "استقرا یا «برای هر n ≥ k»: حالتِ پایه (کوچک‌ترین n) را جدا وارسی کردی؟ گامِ استقرا دقیقاً کجا از فرضِ استقرا استفاده کرد؟";
  var Q_EQUIV = "شرط یا معادله را تبدیل کردی (توانِ دو، ضرب یا تقسیم در عبارتِ متغیر)؟ شرطِ تازه هم‌ارزِ شرطِ اصلی است — جوابی زائد نیامد و جوابی گم نشد؟";
  var Q_ANALIM = "قیاس را به کار بردی: کجا این شباهت می‌شکند — کدام جزءِ آن مورد این‌جا متناظری ندارد، و همین گام به آن جزء تکیه دارد؟";
  /* E5 (دورِ ۴، s23): نسبت یا رابطه‌ای که به کمیتِ تازه برده می‌شود («زمان هم ۲٫۸ برابر؟»، «به همان نسبت») هم قیاس است — در گام یا در گفت‌وگوی همین مسئله */
  var CARRY_RE = /(?:^|\s)(?:هم|نیز)\s+(?:[^.؟?!\n]{0,30}\s)?(?:برابر|نسبت|متناسب)|به\s*همان\s*نسبت|همان\s*نسبت|همین\s*نسبت|متناسب\s*(?:با|است|ه)|(?:[0-9]+(?:\.[0-9]+)?|دو|سه|چند)\s*برابر\s*(?:می\s*شه|می\s*شود|میشه|بشه)?\s*[?؟]/;
  function usesAnalogy(s, r) {
    var L = live(s), g = s.g && s.g[1];
    if (L.aux.some(function (a) { return a.k === "analog"; }) || L.moves.some(function (m) { return m.mv === "mv_analogy"; }) || !!(g && g.kit && txt(g.kit.ana))) return true;
    if (L.steps.some(function (x) { return CARRY_RE.test(norm([x.text, x.proof, x.pred].join(" "))); })) return true;
    if (!r) return false; var pid = r.p.id;
    return S.all("achat", function (x) { return x && (x.lprob === pid || (r.sess && x.id === r.sess)); }).some(function (se) { return (se.msgs || []).some(function (m) { return m && m.role === "user" && CARRY_RE.test(norm(m.text)); }); });
  }
  var Q_PASCAL_C = "قاعدهٔ پاسکال در همین گام: به‌جای هر واژهٔ کلیدی تعریفش را بگذار — گام هنوز درست است و از کدام بخشِ تعریف استفاده می‌کند؟";
  var Q_TASTE = "این نوع مسئله برایت چطور بود — کدام بخشش را دوست داشتی و کدامش را نه؟";
  var BACK_PROVE = ["همهٔ فرض به کار رفت — هر بخشِ فرض کجای برهان آمد؟", "قاعدهٔ پاسکال: هر واژهٔ اصلیِ حکم را با تعریفش جایگزین کن — برهان کجا از تعریفِ هر کدام استفاده کرد؟", "نتیجه‌ای که برهان می‌دهد دقیقاً همان حکم است — نه ضعیف‌تر، نه قوی‌تر، نه عکسش؟", "استدلال را در نقطه‌های حساسش وارسی می‌کنی — حالت‌های پایه و مرزی جدا؟", Q_EQUIV, "از راهِ دیگری هم ثابتش می‌کنی؟ اگر غیرمستقیم (خلف) بود، مستقیمش می‌کنی؟", Q_TASTE];
  var BACK_FIND = ["جواب را در شرط جای‌گذاری کن — همهٔ شرط برقرار است؟", "حالتِ خاص یا حدی، واحد و بُعد، و یکنوایی (اگر داده‌ای بیشتر شود، جواب در جهتِ درست عوض می‌شود؟) را می‌آزمایی؟", "چند جواب دارد — همه را یافتی؟ شرط برای تعیینِ مجهول کافی بود؟", "استدلال را در نقطه‌های حساسش وارسی می‌کنی — گامی که بیشترین شک را دارد؟", Q_EQUIV, "همهٔ داده‌ها و کلِ شرط در حل آمده‌اند؟", "نتیجه را از راهِ دیگری به دست می‌آوری؟ در یک نگاه می‌بینی‌اش؟", Q_TASTE];
  var BACK_PRAC = ["تقریبت بس بود — آنچه با دلیل بیرون گذاشتی اثرِ محسوسی نشان داد؟", "واحدها و ابعاد درست‌اند؟ اگر همه را با واحدِ دیگری بسنجی، رابطه درست می‌ماند؟", "قانون یا رابطه‌ای که یافتی در کدام دامنه آزموده شد — و در حالتِ حدی (صفر، خیلی بزرگ) چه می‌گوید؟"];
  /* E3 (دورِ ۴ ِ تور، s13/s35/s37/s38/s08/s04): فهرستِ هر داور همان فهرستِ اصلیِ پولیاست با واژه‌های همان داور — بازنویسی، هرگز زیرمجموعه. پیش‌تر
     فهرستِ «عملی/زندگی» چهار پرسش بود و «به تعریف‌ها برگرد» (s13)، «نتیجه یا روشِ مسئلهٔ مرتبط؟ عنصرِ کمکی» (s35)، «به مجهول نگاه کن» (s38) و
     «دادهٔ دیگری لازم است؟» (s37) را نداشت. منبعِ یکتای محتوا همین‌جاست (A.LIVE_QK)؛ مربیِ گفت‌وگو (a27) همین را می‌خواند (A.liveKindQs) — ترتیب و
     پیشنهاد با مربی است. پرسش‌های ویژهٔ کمیت (اثرِ محسوس، تقریب) فقط در «عملی». */
  var Q_UNK = { practical: "به مجهول نگاه کن: دقیقاً چه می‌خواهی — «حل‌شدن» چه شکلی است و با چه عدد یا واحدی سنجیده می‌شود؟", life: "به مجهول نگاه کن: دقیقاً چه می‌خواهی — «حل‌شدن» چه شکلی است و از کجا می‌فهمی رسیده‌ای؟" };
  var Q_DEF = "مسئله را به شکلِ دیگری بیان کن — به تعریف‌ها برگرد: هر واژهٔ کلیدیِ خواسته و قیدها دقیقاً یعنی چه؟";
  var Q_REL = "مسئلهٔ مرتبطی که پیش‌تر حل شده (در زندگیِ خودت یا دیگران): نتیجه‌اش را به کار می‌بری یا روشش را؟ برای به‌کار بردنش عنصرِ کمکی‌ای (کار، آدم، ابزار، گامِ میانی) لازم است؟";
  var Q_MORE = "دادهٔ دیگری لازم است — چه چیزی را باید بپرسی، بسنجی یا پیدا کنی تا خواسته معین شود؟";
  var Q_BACKW = "از خواسته به عقب: فرض کن حل شده — یک گام مانده به آخر چه وضعی بود که از آن به خواسته می‌رسیدی؟ و آن وضع از کجا؟";
  var Q_RESTATE_C = "این گام جواب نداد؟ مسئله را به شکلِ دیگری بیان کن — کدام قید یا واژه را می‌شود جورِ دیگری دید (به تعریف برگرد)؟";
  var LIVE_QK = {
    practical: {
      u: [Q_UNK.practical, "چه داری — دانسته‌ها، منابع، امکان‌ها (داده‌ها)؟ کدام اثرِ محسوس دارد و کدام را با دلیل کنار می‌گذاری؟", "شرط چیست — کدام قیدها (زمان، پول، آدم‌ها، اندازه) واقعی‌اند و کدام فرضی؟ بخش‌هایش را جدا بنویس.",
        "آیا این داده‌ها و قیدها برای تعیینِ خواسته کافی‌اند؟ زائد؟ متناقض؟", "کدام تقریب بس است — جوابِ «به‌اندازهٔ کافی خوب» چیست؟", "شکل، جدول یا فهرستی بکش؛ مسئله را به زبانِ خودت دوباره بگو.", "چه؟ چرا؟ کجا؟ کی؟ چگونه؟ — کدام‌یک دربارهٔ این مسئله هنوز بی‌پاسخ است؟"],
      p: ["پیش‌تر مسئله‌ای شبیه این — در کارِ خودت یا دیگران — دیده‌ای؟ از آن چه به کار می‌آید؟", "به مجهول نگاه کن: مسئلهٔ آشنایی با همین خواسته (یا خواستهٔ مشابه) می‌شناسی — خرید، ساخت، جا دادن، بودجه‌ای که پیش‌تر حساب کردی؟", Q_REL, Q_DEF, Q_BACKW,
        "اگر همین را نمی‌توانی، مسئلهٔ ساده‌ترِ مرتبط: کوچک‌ترین نسخه (فقط بخشی از قیدها) که همین هفته بیازمایی — خواسته با آن تا کجا معین می‌شود و چطور تغییر می‌کند؟", Q_MORE, "داده‌هایی که اثرِ محسوس دارند همه در طرح آمده‌اند؟ کلِ قیدها را؟"],
      c: ["پیش از گامِ واقعی: چه پیش‌بینی می‌کنی و چقدر مطمئنی؟", "روشن می‌بینی که این گام به خواسته نزدیکت می‌کند — به کدام داده تکیه دارد؟ واحدها در دو سوی حساب یکی است؟", "کی انجامش می‌دهی؟ روزش را بگو.", "آنچه شد با پیش‌بینی‌ات چه فاصله‌ای داشت — و این فاصله دربارهٔ فهمت چه می‌گوید؟", Q_RESTATE_C, Q_MORE] },
    life: {
      u: [Q_UNK.life, "چه داری — دانسته‌ها، منابع، امکان‌ها، آدم‌ها (داده‌ها)؟", "شرط چیست — کدام قیدها (زمان، پول، آدم‌ها، ارزش‌هایت) واقعی‌اند و کدام فرضی؟ بخش‌هایش را جدا بنویس.",
        "آیا آنچه داری برای تصمیم کافی است؟ چیزی زائد یا متناقض نیست؟", "شکل، جدول یا فهرستی بکش؛ مسئله را به زبانِ خودت دوباره بگو.", "چه؟ چرا؟ کجا؟ کی؟ چگونه؟ — کدام‌یک دربارهٔ این مسئله هنوز بی‌پاسخ است؟"],
      p: ["پیش‌تر مسئله‌ای شبیه این — در زندگیِ خودت یا دیگران — دیده‌ای؟ از آن چه به کار می‌آید؟", "به مجهول نگاه کن: موقعیتِ آشنایی با همین خواسته (یا خواستهٔ مشابه) می‌شناسی؟", Q_REL, Q_DEF, Q_BACKW,
        "اگر همین را نمی‌توانی، مسئلهٔ ساده‌ترِ مرتبط: کوچک‌ترین نسخه (فقط بخشی از شرط) که همین هفته بیازمایی؟", Q_MORE, "همهٔ داده‌ها و قیدهای واقعی‌ات (زمان، پول، آدم‌ها) در طرح آمده‌اند؟ کلِ شرط را؟"],
      c: ["پیش از این گام: فکر می‌کنی چه می‌شود، و چقدر مطمئنی؟", "روشن می‌بینی که این گام به مجهول نزدیکت می‌کند — به کدام داده تکیه دارد؟", "کی انجامش می‌دهی؟ روزش را بگو تا همان روز بپرسم چه شد.", "آنچه شد با پیش‌بینی‌ات چه فاصله‌ای داشت — و این فاصله دربارهٔ فهمت از مسئله چه می‌گوید؟", Q_RESTATE_C, Q_MORE] }
  };
  A.LIVE_QK = LIVE_QK;
  /* هستهٔ پولیا که هیچ فهرستی (حتی فهرستِ ریاضیِ کتاب یا اثباتی) نباید کم داشته باشد — اگر نبود، با واژهٔ همان نوع افزوده می‌شود */
  var CORE = {
    p: [[/به\s*(?:مجهول|حکم|خواسته)\s*نگاه/, function (pr) { return pr ? "به حکم نگاه کن: قضیه‌ای با همین حکم (یا حکمِ مشابه) می‌شناسی؟" : "به مجهول نگاه کن: مسئلهٔ آشنایی با همین مجهول یا مجهولِ مشابه می‌شناسی؟"; }],
      [/تعریف/, function (pr) { return pr ? "به تعریف‌ها برگرد: هر واژهٔ حکم را با تعریفش جایگزین کن (پاسکال) — چه می‌شود؟" : "مسئله را به شکلِ دیگری بیان می‌کنی؟ به تعریف‌ها برگرد."; }],
      [/نتیجه[\s\S]{0,40}روش[\s\S]{0,80}کمکی/, function () { return "اگر مسئلهٔ مرتبطِ حل‌شده‌ای داری: نتیجه‌اش را به کار می‌بری؟ روشش را؟ برای به‌کار بردنش عنصرِ کمکی لازم است؟"; }],
      [/به\s*عقب/, function (pr) { return pr ? "از حکم به عقب: حکم از چه چیزی نتیجه می‌شد — و آن از چه؟ تا به فرض برسی." : Q_BACKW; }],
      [/داده[ٔ‌\s]*(?:ها|های|ی)?\s*دیگر/, function (pr) { return pr ? "از فرض چیزی سودمند بیرون می‌کشی؟ دادهٔ دیگری (بخشی از فرض که هنوز به کار نرفته، یا قضیه‌ای) به ذهنت می‌رسد که برای رسیدن به حکم مناسب باشد؟" : "از داده‌ها چیزی سودمند بیرون می‌کشی؟ داده‌های دیگری به ذهنت می‌رسد که برای یافتنِ مجهول مناسب باشد؟"; }]],   // F7 (دورِ ۵، s33): «مجهول» در فهرستِ اثباتی نه
    c: [[/شکلِ?\s*دیگری\s*بیان/, function () { return Q_RESTATE_C; }], [/داده[ٔ‌\s]*(?:ها|های|ی)?\s*دیگر/, function () { return Q_MORE; }]]
  };
  function withCore(q, ph, ty) {
    var C = CORE[ph]; if (!C) return q; var pr = ty === "prove" || ty === "pod", o = q.slice();
    C.forEach(function (c) { if (!o.some(function (x) { return c[0].test(x); })) o.push(c[1](pr)); });
    return o;
  }
  /* برای مربیِ گفت‌وگو (مسئلهٔ فقط‌درگفت‌وگو): ردهٔ مربی ⇒ فهرستِ همین‌جا. «pract» (تصمیم/کارِ واقعی) همان فهرستِ «عملی» است (رفتارِ پیشین)؛
     ردهٔ دیگر ⇒ فهرستِ خودِ مربی با هستهٔ پولیا تکمیل‌شده (fallback = همان فهرستِ مربی) */
  A.liveKindQs = function (cls, ph, fallback) {
    var K = cls === "pract" || cls === "practical" ? LIVE_QK.practical : cls === "life" ? LIVE_QK.life : null;
    if (K && K[ph]) return K[ph].slice();
    return withCore((fallback || []).slice(), ph, cls === "prove" ? "prove" : "find");
  };
  function kindQs(r, s, ph) {
    var nat = natOf(s, r);
    if (!natSet(s, r) || nat === "objective" || !LIVE_QK[nat] || !LIVE_QK[nat][ph]) return null;
    return LIVE_QK[nat][ph].slice();
  }
  /* H3 (دورِ ۷، s05): فرضیهٔ زندگی مجهول ندارد — کارت‌ها و پرسش‌های طرح و اجرا با «فرضیه» (همان واژهٔ goalWord) */
  function podWord(x) { return String(x).replace(/به\s*مجهول\s*نزدیکت/g, "به آزمودنِ فرضیه نزدیکت").replace(/(?:یا\s*)?مجهولِ\s*مشابه/g, "یا فرضیهٔ مشابه").replace(/مسئلهٔ\s*آشنایی/g, "موقعیتِ آشنایی").replace(/مسئلهٔ\s*آشنا/g, "موقعیتِ آشنا").replace(/مجهول/g, "فرضیه"); }
  function lifePod(r, s) { return goalWord(r, s) === "فرضیه"; }
  function phaseQs(r, s, ph) { var q = phaseQs0(r, s, ph); return (ph === "p" || ph === "c") && lifePod(r, s) ? q.map(podWord) : q; }
  function phaseQs0(r, s, ph) {
    var TQ = (A.ASSIST && A.ASSIST.tutorQuestions) || {}, nat = natOf(s, r), ty = typeOf(r, s), L = live(s);
    if (ph === "u" || ph === "p") { var kq = kindQs(r, s, ph); if (kq) return kq; }
    if (ph === "u") return ((TQ.und && TQ.und.qs) || (A.solveAskList ? A.solveAskList("u", 1, ty) : [])).slice();
    if (ph === "p") return withCore(A.solveAskList ? A.solveAskList("p", 1, ty) : [], "p", ty);
    if (ph === "c") {
      if (nat !== "objective") return (kindQs(r, s, "c") || EXEC_LIFE.slice()).concat(usesAnalogy(s, r) ? [Q_ANALIM] : []);
      var q = withCore(EXEC_OBJ.slice(), "c", ty), all = [r.p.statement, (uOf(s) || {}).u, L.plan && L.plan.t].concat(L.steps.map(function (x) { return x.text + " " + (x.proof || ""); })).join(" ");
      if (IND_RE.test(norm(all))) q.splice(2, 0, Q_BASE);
      if (transfIn(all)) q.push(Q_EQUIV);
      if (ty === "prove" || ty === "pod") q.push(Q_PASCAL_C);
      if (usesAnalogy(s, r)) q.push(Q_ANALIM);
      return q;
    }
    if (nat === "objective") return (ty === "prove" || ty === "pod" ? BACK_PROVE : BACK_FIND).slice();
    var tb = ((TQ.back && TQ.back.qs) || []).slice();
    return nat === "practical" ? BACK_PRAC.concat(tb) : tb;
  }
  /* «مربیِ این مسئله» برای دستیار و تور (G2): مرحلهٔ جاری، داور، نوع، و فهرستِ پرسش‌های همان مرحله (نوع‌دار) با پرسشِ پیشنهادیِ همین حالا —
     همان که صفحه می‌پرسد؛ پرسشِ پاسخ‌گرفته در صفحه دوباره پیشنهاد نمی‌شود. */
  /* D2 (دورِ ۳): ترتیبِ پرسش = کلی ⇐ خاص بر پایهٔ «پله»ٔ کاربر در همین مرحله (چند پرسشِ همین مرحله در همین مسئله پرسیده یا پاسخ داده شد)،
     هرگز شمارِ پیام؛ پرسشِ پاسخ‌گرفته (در صفحه یا گفت‌وگو — opts.asked) دوباره پیشنهاد نمی‌شود. تمام شدنِ نردبان ⇒ ladderEnd (قاعدهٔ C188، D3). */
  /* بی واژهٔ پرسشی، فقط وقتی «بیش از نیم» ِ واژه‌های هر دو سو مشترک است (A4 از هر دو سو — «خیلی خوب؟» پرسشِ فهرست نیست) */
  function sameQBoth(a, b) { var x = toks(a), y = toks(b); if (!x.length || !y.length) return false; var sh = x.filter(function (w) { return y.indexOf(w) >= 0; }).length; return sh / Math.max(x.length, y.length) > 0.5; }
  /* دورِ ۹ (E5 در برابرِ s28): تکهٔ عینیِ یک پرسشِ فهرست (پیامِ دستیار در «؟» شکسته شد: «برای به‌کار بردنش عنصرِ کمکی لازم است؟») همان پرسش است —
     نه پرسشی که فقط چند واژه با آن شریک است */
  /* دورِ ۱۰ (J3، s05): پرسشِ صفحه و بازگفتنش در گفت‌وگو یک گزینه‌اند — بدنهٔ پرسش (بی برچسبِ «به مجهول نگاه کن:») در هر دو سو بیش از نیمِ واژه‌هایش
     در دیگری است (A4 از هر دو سو؛ واژه با ریشه: «می‌فهمی» ⇄ «می‌فهمیدی») — پرسشی که فقط چند واژه با پرسشِ صفحه شریک است گزینهٔ خودش را دارد */
  function qBody(t) { return String(t || "").replace(/^[^:：؟?«»\n]{2,40}[:：]\s*/, ""); }
  function sameQPair(a, b) { var x = toks(qBody(a)), y = toks(qBody(b)); if (!x.length || !y.length) return false; return x.filter(function (w) { return hit(w, y); }).length / x.length > 0.5 && y.filter(function (w) { return hit(w, x); }).length / y.length > 0.5; }
  /* دورِ ۱۱ (K4، s21/s23/s24/s28): پرسشِ فهرست که از چند پرسشِ پولیا با «؛» ساخته شده («شکلی بکش …؛ مسئله را به زبانِ خودت دوباره بگو.») — پرسشِ گفت‌وگو
     که با **یکی** از همین بندها همان است (همان sameQPair ِ دوسویه، بیش از نیم از هر دو سو: «کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی؟» ⇄ بندِ دوم)
     همان پرسشِ فهرست است (u5)، نه گزینه‌ای جدا و نه افتاده */
  /* … و بازگفتن «به زبانِ خودت» پیوندِ صریحِ همان پرسشِ پولیاست (A191 ِ مربی ⇄ u5 ِ فهرست)، نه هم‌پوشانیِ واژه — «کل در یک جمله» واژه‌های دیگری دارد */
  var OWNWORDS_RE = /به\s*زبان\s*خود(?:ت|تان)(?![آ-ی])/;
  function clauseOf(t, q) { var cl = String(q || "").split(/\s*؛\s*/); return cl.some(function (c) { return (cl.length > 1 && toks(c).length >= 3 && sameQPair(t, c)) || (OWNWORDS_RE.test(norm(c)) && OWNWORDS_RE.test(norm(t))); }); }
  function fragOf(t, q) { var a = norm(t).replace(/[؟?]\s*$/, "").trim(); return a.length >= 8 && norm(q).indexOf(a) >= 0; }
  function sameQ(a, b) { var x = toks(a), y = toks(b); if (!x.length || !y.length) return false; var sh = x.filter(function (w) { return y.indexOf(w) >= 0; }).length; return sh / Math.min(x.length, y.length) > 0.5; }   // A4: «بیش از نیم» ِ واژه‌های پرسشِ کوتاه‌تر
  /* F2 (دورِ ۵): یک پرسش در هر نوبت، یک منبع — همین تابع پرسشِ بازِ کارتِ صفحه را هم تعیین می‌کند (pageQ) و پرسشِ نوبت را با این ترتیب (پولیا: اول
     دشواریِ واقعیِ همین لحظهٔ یادگیرنده):
     (۱) آنچه کاربر همین نوبت کرد — نسبت/رابطه‌ای را به کمیتِ تازه برد ⇒ حدِ قیاس (s23)؛ نتیجه‌ای گفت ⇒ «از راهِ دیگر؟ وارسی کن» حتی پیش از ثبت در صفحه (s28)؛
     (۲) شکست — پیش‌فرضِ شکسته (s22)، دادهٔ کنارگذاشته پس از حدسِ ردشده (s22)، گیر در طرح ⇒ «از خواسته به عقب» (s08)، شکستِ گزارش‌شده ⇒ «به شکلِ دیگری بیان کن»؛
     (۳) پرسشِ بازِ کارتِ صفحه؛ (۴) نردبان به ترتیبِ پله. «همهٔ داده‌ها؟» (B3) پیش از وجودِ طرح هرگز (s30/s33/s35)؛ پرسشِ پیش‌بینی/موعد پس از ثبتش برای
     همان گامِ باز تکرار نمی‌شود (s35). opts: {asked:[…], stuck:bool (نامِ پیشین), turn:{analogy, result, stuck, fail, text}} — امضای پیشین هم کار می‌کند. */
  var B3_RE = /همه\s*(?:ی\s*)?(?:داده|فرض)|داده\s*هایی\s*که\s*اثر\s*محسوس/, PRED_Q = /چه\s*پیش\s*بینی\s*می\s*کنی|فکر\s*می\s*کنی\s*چه\s*می\s*شود/, WHEN_Q = /کی\s*انجامش\s*می\s*دهی/;
  function planExists(s) { var L = live(s); return !!(L.plan && L.plan.at); }
  /* G2 (دورِ ۶، s02/s11): «همهٔ داده‌ها؟» در آغازِ طرح‌ریزی (هنوز طرحی نیست و گیر نیست) نه؛ ولی گیر در ساختنِ طرح دقیقاً لحظهٔ همین پرسشِ پولیاست */
  function qOk(s, q, stuck) { var x = norm(q), o = openStep(s); if (B3_RE.test(x) && !planExists(s) && !stuck) return false; if (o && txt(o.pred) && PRED_Q.test(x)) return false; if (o && txt(o.when) && WHEN_Q.test(x)) return false; return true; }
  function resultQ(r, s) { var ty = typeOf(r, s), nat = natOf(s, r);
    return nat !== "objective" ? "نتیجه‌ای گفتی — با واقعیت سنجیدی‌اش؟ کدام پیش‌بینی درست درآمد و کدام نه، و از راهِ دیگری هم به همین می‌رسیدی؟ (بعد در صفحه «✅ حل شد» و بازنگری)"
      : ty === "prove" || ty === "pod" ? "برهانی گفتی — از راهِ دیگری هم به همین حکم می‌رسی؟ وارسی‌اش کن: هر بخشِ فرض کجا به کار رفت و نتیجه دقیقاً همان حکم است؟ (بعد در صفحه «✅ حل شد» و بازنگری)"
        : "نتیجه‌ای گفتی — از راهِ دیگری هم به همین می‌رسی؟ نتیجه را وارسی کن: در شرط بگذار یا با حالتی خاص بسنج. (بعد در صفحه «✅ حل شد» و بازنگری)"; }
  function presupBroken(s) { var lc = lastClosed(s), lo = lc && lc.out, u1 = uOf(s) || {}; if (openStep(s) || !lo || !u1.presup || !txt(u1.suffCirc)) return ""; var failed = lo.done === "no" || lo.prog === "نه" || lo.match === "no"; return failed || partNegated(lo.what, u1.suffCirc) ? u1.suffCirc : ""; }
  function guessRefuted(s) { var gg = s.g && s.g[1], lc = lastClosed(s); return !!((gg && gg.guess && (gg.hit === "نادرست بود" || guessCons(s).no)) || (lc && lc.out && lc.out.guess && lc.out.guess.rel === "refute")); }
  function asideList(s) { var asd = asideMap(s); return dataOf(s).filter(function (x) { return asd[x.id]; }).map(function (x) { return { t: x.t, why: asd[x.id] }; }); }
  /* G2 (دورِ ۶): پرسش‌های ثابتِ اولویت — همه از خودِ کتاب: «مسئلهٔ مرتبطِ حل‌شده را به کار ببر» (A-list «نتیجه/روش/عنصرِ کمکی»)، «پیش از رها کردن کدام
     حلقه شکست؟» (C095/C096)، «فقط بخشی از شرط / حالتِ خاص» (C045)، «همهٔ داده‌ها؟» (B086) */
  var Q_RELUSE = "یک مسئلهٔ مرتبطِ حل‌شده داری — نتیجه‌اش را به کار می‌گیری یا روشش را؟ برای به‌کار بردنش عنصرِ کمکی لازم است؟";
  var Q_LINK = "پیش از رها کردنِ کلِ راه: کدام حلقه دقیقاً شکست؟ شاید فقط همان یکی باید عوض شود و بقیهٔ زنجیره درست است.";
  var Q_PARTAUX = "پیش از رها کردن: مسئلهٔ کوچک‌تری که از پسش برمی‌آیی کدام است — فقط بخشی از شرط را نگه دار، یا یک حالتِ خاص را حل کن؟";
  var Q_ALLD = "همهٔ داده‌ها را به کار برده‌ای؟ کلِ شرط را؟";
  var Q_GUESST = "حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟";
  /* دورِ ۱۲ (L4، s21…s29): تا کارتِ «اول کل، بعد جزءها» باز است (جملهٔ کل هنوز ثبت نشده)، پرسشِ صفحه همین است — نه «مجهول چیست؟» ِ کارتی که هنوز باز نشده (A191) */
  var Q_WHOLE = "اول کل، بعد جزءها: کلِ مسئله را بی‌جزئیات، در یک جملهٔ کامل و به زبانِ خودت، می‌گویی؟";
  function wholeOpen(s) { var d = live(s).uDraft; if (d && d.wholeOk != null) return !d.wholeOk; return !txt((uOf(s) || {}).one); }
  A.liveWholeQ = Q_WHOLE;
  /* دورِ ۱۲ (L4، s34 p6): پیامی که خودش ایدهٔ رسیده را گزارش می‌کند («یه ایده … به ذهنم رسید: …») پاسخِ کارتِ «😴 چه به ذهنت رسید؟» را دارد — آن کارت پرسشِ نوبت نیست (روی صفحه می‌ماند تا ثبتش کند) */
  var IDEA_RPT = /به\s*(?:ذهنم|فکرم|سرم)\s*(?:رسید|اومد|آمد|زد)|(?:یه|یک)\s*ایده\s*(?:ای\s*)?(?:[^.؟?!\n]{0,40}\s)?(?:دارم|اومد|آمد|رسید|زد|پیدا\s*کردم)/;
  var REL_USE_RE = /(?:نمی\s*(?:دونم|دانم)|نمیدونم)\s*(?:چطور|چطوری|چگونه|چه\s*جوری|چجوری)\s*(?:[^.؟?!\n]{0,40}\s)?(?:استفاده|به\s*کار)/;
  var REL_EVID_RE = /حل\s*(?:کرد|شد|کرده)|موفق|قبلا|قبلاً|مشابه|شبیه|همین\s*(?:طرح|کار|روش|مسئله)|مثل\s*همین|یادم\s*(?:اومد|آمد)/;
  var ABANDON_L = /بندازم\s*دور|دور\s*(?:بندازم|بریزم)|(?:^|\s)ول\s*(?:ش\s*)?کنم|ولش\s*کنم|بی\s*خیال|راهی\s*نیست|رها\s*(?:ش\s*)?کنم|کنار\s*(?:ش\s*)?(?:بذارم|بگذارم)|انصراف\s*(?:بدم|بدهم)|از\s*صفر\s*شروع\s*کنم/;
  /* کارتِ خاصی که همین حالا روی صفحه است (همان چیزی که کاربر می‌بیند؛ «همان که صفحه می‌پرسد» فقط وقتی پرسشِ نوبت همین است — s34/s37) —
     به ترتیبِ صفحه: «😴 چه به ذهنت رسید؟» و «میانهٔ راه» بالای صفحه؛ در اجرا (بی گامِ باز) کارتِ نتیجه: هم‌ارزیِ تبدیل، «شرط کافی نبود؟ چند جواب؟»،
     پیش‌فرضِ شکسته، دادهٔ کنارگذاشته پس از حدسِ ردشده؛ و حکمِ کارتِ «معادله‌ها در برابرِ مجهول‌ها» */
  /* H2 (دورِ ۷، s36/s35): ترتیبِ کارت‌های خاص — ردِ حل‌نشدهٔ همین صفحه (دروازهٔ هدف، «از طرح نمی‌آید»، حالتِ پایه — کاربر همین حالا پشتِ آن مانده) ⇐
     حکمِ کارتِ نتیجه (هم‌ارزی، چند جواب، پیش‌فرض، دادهٔ کنارگذاشته پس از رد) و معادله‌ها ⇐ پس از آن‌ها «😴» و «میانهٔ راه» (مرورِ کلی‌تر، نه پاسخ به همین گام) */
  /* R8 (I-live 5، s35): گامِ چرخش که به داده/علتی از کارتِ فهم می‌پردازد (همان چیزهایی که مجهول به آن‌ها بسته است) رو به هدف است، حتی بی واژه‌های مجهول —
     شاهد از حرفِ خودِ گام: دست‌کم دو واژهٔ معنادارِ مشترک با یک داده، یا داده‌ای که تیک زد و دست‌کم یک واژهٔ معنادارش در گام آمده. تیکِ تنها شاهد نیست
     (گامِ جایزه هم دادهٔ «۴۰۰ خانوار» را تیک زد و خودش گفت «جایزه به هیچ‌کدوم از دو علت ربط نداره») */
  function stepToCause(s, st, ticked) {
    var tt = toksSim(st), tk = ticked || [];
    return dataOf(s).some(function (x) { var n = toksSim(x.t).filter(function (w) { return hit(w, tt); }).length; return n >= 2 || (n >= 1 && tk.indexOf(x.id) >= 0); });
  }
  function specCards(r, pg, s) {
    var L = live(s), ph = phaseOf(s), o = [], t = A.today(), d0 = SD[r.p.id];
    if (ph === "c" && d0 && !openStep(s)) {
      /* R8 (I-live 2، s19): ردِ صفحه فقط تا وقتی «تازه» است پرسشِ نوبت است — همان روزِ رد (d0.refD)؛ روزِ دیگر، پیامِ بعدیِ کاربر خودش پاسخِ اوست
         («دیگه برنامه عوض نکردم») و رد زمینه می‌شود (کارت روی صفحه می‌ماند) */
      var fr0 = !d0.refD || d0.refD === t;
      if (d0.showGoal && toks(d0.goalW).length < 2) o.push({ q: "🎯 هدف را گم نکن — " + goalWord(r, s) + ": «" + clip((uOf(s) || {}).u, 80) + "». گامی که می‌نویسی («" + clip(d0.text, 60) + "») چطور به آن نزدیکت می‌کند؟", why: "refuse", fresh: fr0 });
      else if (d0.showSw && !d0.sw) o.push({ q: "این گام («" + clip(d0.text, 60) + "») از طرحت نمی‌آید — طرح را عوض کردی؟ اگر آری، چرا؟", why: "refuse", fresh: fr0 });
      else if (d0.showBase && toks(d0.base).length < 2) o.push({ q: Q_BASE, why: "refuse", fresh: fr0 });
    }
    if (ph === "c" && !openStep(s)) {
      var lc = lastClosed(s), lo = lc && lc.out, ty1 = typeOf(r, s);
      if (lc && lo && lo.kind === "proof" && transfIn([lc.text, lc.proof].join(" "))) o.push({ q: Q_EQUIV, why: "equiv" });
      var mt0 = lo ? (lo.kind === "proof" ? [lc.text, lc.proof].join("\n") : lo.what || "") : "";
      if (lo && MULTI_RE.test(norm(mt0))) o.push({ q: "شرط کافی نبود؟ چند جواب؟ — اگر مجهول بیش از یک مقدار (یا هیچ) دارد، شرط برای تعیینش کافی نبود: کدام داده یا بخشِ شرط کم است؟", why: "multi" });
      var pb = presupBroken(s); if (pb) o.push({ q: "پیش‌فرضی که نگه داشتی تا بیازمایی‌اش («" + clip(pb, 80) + "») — این نتیجه با آن می‌خواند؟ اگر نه، کنارش بگذار و به «کافی است؟» ِ فهم برگرد.", why: "presup" });
      var asl = asideList(s); if (asl.length && guessRefuted(s)) o.push({ q: "حدست رد شد — داده‌ای که کنار گذاشته بودی («" + clip(asl[0].t, 60) + "»، دلیلت: «" + clip(asl[0].why, 50) + "») هنوز بی‌ربط است؟ دادهٔ کنارگذاشته گاهی همان عنصرِ غایب است.", why: "aside" });
    }
    if (ph === "c" && L.eqUnk && typeOf(r, s) !== "prove" && typeOf(r, s) !== "pod" && eqsOf(s).length < L.eqUnk) o.push({ q: EQ_FEW, why: "eqfew" });
    if (L.incub && !L.incub.back && L.incub.due <= t) { var nD = L.incub.d && A.daysBetween ? A.daysBetween(L.incub.d, t) : 1; o.push({ q: (nD > 1 ? fa(nD) + " روز پیش" : "دیروز") + " کنارش گذاشتی — چه چیزی به ذهنت رسید؟ (حتی «هیچ»)", why: "incub" }); }
    var ckD = checkDue(r, s); if (ckD) o.push({ q: "میانهٔ راه: چه آموختی؟ — دربارهٔ مسئله چه آموختی که روزِ اول نمی‌دانستی، و دربارهٔ خودت چه دیدی؟", why: "checkin", due: ckD });
    return o;
  }
  /* H2 (دورِ ۷): «نوبت» = پیامِ کاربر در گفت‌وگو (شناسهٔ سشن + شمارِ پیام‌های کاربر، از زمینهٔ قلاب‌ها AS._hookCtx) — دو «نمی‌دونم» ِ پشتِ سرِ هم دو نوبت‌اند؛
     چند فراخوانِ liveCoach در همان نوبت (قلابِ مربی و قلابِ مسئله) یک نوبت‌اند. بی زمینهٔ قلاب (فراخوانِ مستقیم) متنِ همان پیام کلید است. */
  function turnKey(tx) {
    var c = A.ASSIST && A.ASSIST._hookCtx, se = c && c.s;
    if (se && se.id) return se.id + "#" + (se.msgs || []).filter(function (m) { return m && m.role === "user"; }).length + "#" + mkey(c.msg);
    return tx ? "t:" + tx.slice(0, 160) : "";
  }
  function mkey(t) { return norm(String(t || "")).replace(/\s+/g, " ").trim().slice(0, 160); }
  /* H2 (دورِ ۷، s01): گردآوریِ بی‌پایان در مسئلهٔ عملی («می‌ترسم جا انداخته باشم، کِی بسه؟») — «همهٔ داده‌ها؟» درست برعکس است؛ پرسشِ پولیا برای داده‌های بی‌شمار «کجا خط می‌کشی؟» است */
  var OVERCOL_RE = /جا\s*(?:ان|ا)?داخته\s*باشم|جا\s*بندازم|ک[ِ]?ی\s*(?:دیگه\s*|دیگر\s*)?بس(?:ه|ه\s*است|\s*است)|تا\s*کجا\s*(?:اطلاعات|داده|بگردم|جمع)|(?:چقدر|چه\s*قدر)\s*(?:دیگه\s*)?(?:اطلاعات|داده)\s*(?:جمع|لازم)|همه\s*چی(?:ز)?\s*(?:رو|را)?\s*(?:جمع|بدونم|بدانم|چک)|می\s*ترسم\s*(?:یه|یک)?\s*(?:چیز|نکته|داده)|باید\s*دقیق\s*تر\s*(?:بشه|بشود|باشه|باشد|کنم)|(?:رو|را)\s*هم\s*(?:در\s*بیارم|در\s*بیاورم|درآورم|به\s*دست\s*(?:بیارم|بیاورم)|بدست\s*بیارم|پیدا\s*کنم|حساب\s*کنم|بسنجم)/;   // R8 (I-live 6، s17)
  var PRESENT_RE = /(?:چطور|چطوری|چگونه|چه\s*جوری|چجوری)\s*(?:[^.؟?!\n]{0,30}\s)?(?:بگم|بگویم|توضیح\s*(?:بدم|بدهم)|بنویسم|ارائه\s*(?:بدم|کنم)|بفهمونم|بفهمانم)/;
  var Q_LINE = "کجا خط می‌کشی؟ چه چیزی را عمداً بیرون می‌گذاری و تا کجا اطلاعات جمع می‌کنی — و چرا؟ (در مسئلهٔ عملی داده‌ها بی‌شمارند؛ فقط آنچه اثرِ محسوس دارد، و تقریبی که بس است)";
  var Q_AUXP = "اگر همین را نمی‌توانی، اول مسئلهٔ کمکیِ کوچک‌تری را حل کن: فقط بخشی از شرط را نگه دار (مجهول چگونه تغییر می‌کند؟)، یا یک حالتِ خاص را؟";
  /* «از خواسته به عقب» به واژهٔ همان نوع (اثباتی: از حکم) */
  function backQ(r, s, Q) { var pr = proofLike(r, s); return Q.filter(function (x) { return /به\s*عقب/.test(x); })[0] || (pr ? "از حکم به عقب: حکم از چه چیزی نتیجه می‌شد — و آن از چه؟ تا به فرض برسی." : Q_BACKW); }
  /* R8 (I-live 1): متن‌های خودِ کاربر روی همین مسئله — پیام‌های او در سشن‌های همین مسئله (نه «[سامانه…»، نه پیامی که فقط صورتِ مسئله را آورد)،
     پیامِ همین نوبت، و طرح/پیش‌نویس/گام‌ها */
  function userTexts(r, s, cur) {
    var L = live(s), st = toks(r.p.statement || ""), o = [cur || ""];
    var isStmt = function (t) { if (st.length < 4) return false; var tt = toks(t); return st.filter(function (w) { return hit(w, tt); }).length >= Math.ceil(st.length * 0.6); };
    S.all("achat", function (x) { return x && (x.lprob === r.p.id || (r.sess && x.id === r.sess)); }).forEach(function (se) { (se.msgs || []).forEach(function (m) { if (m && m.role === "user" && !/^\s*\[سامانه/.test(String(m.text || "")) && !isStmt(m.text)) o.push(String(m.text || "")); }); });
    if (L.plan) o.push(L.plan.t, L.plan.t2, L.plan.rot); o.push(L.planDraft);
    L.steps.forEach(function (x) { o.push(x.text, x.prem, x.proof); });
    return o.filter(Boolean).join("\n");
  }
  function numTok(t) { return (norm(t).match(/\d+(?:[.٫/]\d+)?/g) || []).map(function (n) { return n.replace(/[٫/]/, "."); }); }
  /* داده «دیده‌شده» است اگر عددی که فقط مالِ همین داده است، یا دست‌کم نیمی از واژه‌های متمایزش (نه در داده‌های دیگر، نه در مجهول/عنوان) در متنِ کاربر آمده باشد */
  function datumSeen(d, others, ctx, T) {
    var oT = others.join(" "), oN = numTok(oT), nT = numTok(T);
    if (numTok(d).some(function (n) { return oN.indexOf(n) < 0 && nT.indexOf(n) >= 0; })) return true;
    var ot = toks(oT + " " + ctx), tt = toksM(T), dist = toksM(d).filter(function (w) { return !/^\d/.test(w) && !hit(w, ot); });
    return dist.length > 0 && dist.filter(function (w) { return hit(w, tt); }).length >= Math.ceil(dist.length / 2);
  }
  function unSeen(r, s, un, cur) {
    var dl = dataOf(s), T = userTexts(r, s, cur), ctx = [(uOf(s) || {}).u, r.p.title].join(" ");
    return un.filter(function (d) { return !datumSeen(d.t, dl.filter(function (y) { return y.id !== d.id; }).map(function (y) { return y.t; }), ctx, T); });
  }
  /* R8 (I-live 3): پلهٔ خاص‌ترِ درونِ یک کارت — معادله‌ها: نامِ بخشِ شرطی که هنوز در هیچ گام/معادله‌ای نیامده؛ بی آن، مجهولی که هنوز به بقیه بسته نشده */
  function cardEsc(r, s, c) {
    if (c.why !== "eqfew") return "";
    var cu = condUsed(s).filter(function (x) { return !x.used; });
    return cu.length ? "بخشِ «" + clip(cu[0].t, 60) + "» از شرط هنوز در هیچ معادله‌ای نیامده — همین بخش را با نمادها بنویس: کدام کمیت‌ها در آن برابر می‌شوند؟"
      : "کدام مجهول هنوز در هیچ معادله‌ای به بقیه بسته نشده — و کدام بخشِ شرط آن را می‌بندد؟";
  }
  function coachCore(r, pg, s, opts) {
    var L = live(s), ph = phaseOf(s), key = ph === "done" ? "b" : ph, Q = phaseQs(r, s, key), q = "", tut = pg.tut || {}, o = opts || {}, T = o.turn || {};
    var asked = (o.asked || []).filter(Boolean), isAsked = function (x) { return asked.some(function (a) { return sameQ(a, x); }); };
    /* H2 (دورِ ۷): متنِ همین نوبت — اگر نشانه‌های نوبت متن نیاوردند، همان پیامِ کاربر در زمینهٔ قلاب (نه پیامِ سامانه) */
    var hc0 = o.turn && !T.text && A.ASSIST && A.ASSIST._hookCtx, hm0 = hc0 && !/^\s*\[سامانه/.test(String(hc0.msg || "")) ? String(hc0.msg || "") : "";
    if (hm0) T = Object.assign({}, T, { text: hm0 });
    var stuckT = !!(T.stuck || o.stuck), tx = norm(T.text || ""), ok = function (x) { return x && !isAsked(x) && qOk(s, x, stuckT); };
    /* (۴) پرسشِ بازِ کارتِ طرح/اجرا */
    var pageQ = "";
    if (ph === "u") { var d = L.uDraft || {}; pageQ = wholeOpen(s) ? Q_WHOLE : Q[!txt(d.u) ? 0 : !(d.dl || []).some(function (x) { return txt(x.t); }) ? 1 : !txt(d.c) ? 2 : 3] || Q[0] || ""; }
    else if (ph === "p" && Q.length) { var P = tut.plan || [], qi0 = tut.qi && tut.qi.lplan != null ? +tut.qi.lplan : 0;
      for (var k = 0; k < Q.length; k++) { var j = (qi0 + k) % Q.length; if (qOk(s, Q[j]) && !P.some(function (e) { return e && e.src === "live" && e.q === Q[j] && (e.text || e.skip); })) { pageQ = Q[j]; break; } } }
    else if (ph === "c") { var o0 = openStep(s); if (o0 && o0.due <= A.today()) pageQ = "موعدِ گامِ «" + clip(o0.text, 60) + "» رسیده: انجامش دادی؟ آنچه شد با پیش‌بینی‌ات («" + clip(o0.pred, 60) + "») چه فاصله‌ای داشت؟ (نتیجه را خودش در صفحه ثبت می‌کند)";
      else if (!o0) { var lc = lastClosed(s), lo = lc && lc.out, c0 = [];
        var failed0 = !!(lo && (lo.done === "no" || lo.prog === "نه" || lo.match === "no"));
        if (lo && lo.kind !== "proof") c0 = c0.concat(Q.filter(function (x) { return /فاصله/.test(x); }));
        if (failed0) c0 = c0.concat(Q.filter(function (x) { return /شکلِ?\s*دیگری\s*بیان/.test(x); }));
        pageQ = c0.filter(ok)[0] || ""; } }
    /* کارتِ روی صفحه: کارتِ خاص (بالاتر از کارتِ عام) ⇐ کارتِ طرح/اجرا */
    var SC = specCards(r, pg, s), card = (SC[0] && SC[0].q) || pageQ;
    var src = "", pick = function (x, why) { if (!q && ok(x)) { q = x; src = why; } };
    var act = ph === "u" || ph === "p" || ph === "c";
    /* (۱) کارِ همین نوبت */
    /* «…درسته؟» پس از یک مقدار حدس است، نه نتیجه (G1/G2 دورِ ۶، s02/s07/s09 — turn.guess از مربی) ⇒ «چطور می‌آزمایی‌اش؟» */
    if (act && onlyAnsNow(r, s, T, tx)) pick(Q_ONLYANS, "turn-onlyans");
    if (act && T.guess) pick(Q_GUESST, "turn-guess");
    if (ph !== "done" && ph !== "b" && T.result) pick(resultQ(r, s), "turn-result");
    if ((ph === "c" || ph === "p") && (T.analogy || (tx && CARRY_RE.test(tx)))) pick(Q_ANALIM, "turn-analogy");
    /* «نمی‌دونم چطور از X استفاده کنم» با مسئلهٔ مرتبطِ حل‌شده — دشواریِ واقعی به‌کار بردنِ آن است، نه گیرِ عام (s35) */
    if (act && (T.related || (REL_USE_RE.test(tx) && (L.related.length || (L.seen && L.seen.ans === "yes") || REL_EVID_RE.test(tx))))) pick(Q.filter(function (x) { return /نتیجه[\s\S]{0,40}روش[\s\S]{0,80}کمکی/.test(x); })[0] || Q_RELUSE, "turn-related");
    /* میلِ رها کردن: در زنجیرهٔ «از آخر به عقب» ⇒ کدام حلقه شکست (C095/C096)؛ وگرنه مسئلهٔ کمکیِ کوچک‌تر (بخشی از شرط/حالتِ خاص) — همان که 🌱 می‌خواهد (s04/s06) */
    if ((ph === "p" || ph === "c") && (typeof T.abandon === "boolean" ? T.abandon : ABANDON_L.test(tx))) { var ch = chosenChain(L); pick(ch && (ch.links || []).some(function (x) { return txt(x); }) ? Q_LINK : Q_PARTAUX, "turn-abandon"); }
    /* H3 (دورِ ۷، s10): در بازنگریِ برهان، «چطوری بگم/توضیح بدم؟» همان پرسشِ «از راهِ دیگر؟ مستقیمش می‌کنی؟» (C064) است — ارائهٔ برهان برای دیگری */
    if (ph === "b" && proofLike(r, s) && PRESENT_RE.test(tx)) pick(Q.filter(function (x) { return /مستقیم/.test(x); })[0] || "", "turn-present");
    /* H2 (دورِ ۷، s01): گردآوریِ بی‌پایان در مسئلهٔ عملی ⇒ «کجا خط می‌کشی؟»، هرگز «همهٔ داده‌ها؟» */
    var overCol = act && natOf(s, r) === "practical" && OVERCOL_RE.test(tx);
    if (overCol) pick(Q_LINE, "turn-line");
    /* H2 (دورِ ۷): نوبتِ گفت‌وگو و شمارِ گیرهای پیاپی — حالتِ کوچکِ همین مسئله (L.stk)؛ فقط فراخوانی که نشانه‌های نوبت (turn) دارد آن را جلو می‌برد */
    /* R8 (I-live 7، s34): نوبتِ «[سامانه: …]» (پرکردنِ فرم، دنباله‌های خودکار) نوبتِ کاربر نیست — نه شمارِ گیر را جلو می‌برد، نه نگه‌داشتِ یک‌نوبتیِ «میانهٔ راه» را مصرف می‌کند */
    var hcS = A.ASSIST && A.ASSIST._hookCtx, sysT = !!(o.turn && hcS && /^\s*\[سامانه/.test(String(hcS.msg || "")));
    var K = o.turn && !sysT ? turnKey(tx) : "", R = L.stk || null, R0 = JSON.stringify([L.stk || null, L.ckHold || null]);
    if (K) {
      /* گیرهای «پیاپی» در همان گفت‌وگو — سشنِ تازه (روزی دیگر) دنباله را از کلی‌ترین پرسش آغاز می‌کند */
      if (!R || R.k !== K) { var same = !!R && String(R.k).split("#")[0] === String(K).split("#")[0]; R = L.stk = { k: K, pst: same && !!R.st, pn: same ? R.n || 0 : 0, pq: same ? R.q || "" : "", st: false, n: 0, q: "" }; }
      if (stuckT && !R.st) { R.st = true; R.n = R.pst ? R.pn + 1 : 1; }
    }
    var stuckN = K && R ? R.n : stuckT ? 1 : 0, prevQ = K && R && R.pst ? R.pq : "";
    /* (۲) کارتِ خاصِ صفحه بر پرسشِ عام مقدم است (s26 معادله‌ها، s36 هم‌ارزی، s37 «شرط کافی نبود؟»، s34 «😴»/«میانهٔ راه»، پیش‌فرضِ شکسته، دادهٔ کنارگذاشته).
       H2 (دورِ ۷، s01/s04/s36): «میانهٔ راه» پرسشِ نوبت است فقط در **یک** نوبت (نخستین نوبتی که آمد) و نه وقتی کاربر در همین پیام پرسشِ خودش را دارد — کارت روی صفحه می‌ماند */
    var ownQ = !!o.turn && /[؟?]/.test(String(T.text || ""));
    /* L4 (دورِ ۱۲): متنِ همین نوبت — با نشانه‌های نوبت همان؛ فراخوانِ بی نشانه درونِ ساختِ پرامپت (پیشنهادِ «مسئلهٔ بازِ تو») پیامِ همان نوبت (نه پیامِ سامانه) */
    var hcI = !o.turn && A.ASSIST && A.ASSIST._hookCtx, ideaTx = tx || (hcI && !/^\s*\[سامانه/.test(String(hcI.msg || "")) ? norm(String(hcI.msg || "")) : ""), ideaNow = !!ideaTx && IDEA_RPT.test(ideaTx);
    SC.forEach(function (c) {
      if (c.why === "incub" && ideaNow) return;
      if (c.why === "checkin") { if (q) return; var H = L.ckHold; if (ownQ || (H && H.due === c.due && (sysT || (K && H.k !== K)))) return; pick(c.q, "card-checkin"); if (q === c.q && K && !(H && H.due === c.due)) L.ckHold = { due: c.due, k: K }; return; }
      /* R8 (I-live 2): ردِ کهنه (نه همان روز) در نوبتِ گفت‌وگو زمینه است، نه پرسشِ نوبت */
      if (c.why === "refuse" && c.fresh === false && o.turn) return;
      /* R8 (I-live 3، s26): «هرگز همان پرسش دو بار پیاپی» کارتِ خاص را هم می‌گیرد — گیرِ دومِ پیاپی روی همان کارت ⇒ پلهٔ خاص‌ترِ درونِ همان کارت
         (نامِ بخشِ شرطی که هنوز به معادله درنیامده)؛ کارتی که پلهٔ خاص‌تر ندارد کنار می‌رود تا دنبالهٔ گیر پلهٔ بعد را بدهد */
      var e0 = stuckT && prevQ ? cardEsc(r, s, c) : "";
      if (stuckT && prevQ && (c.q === prevQ || (e0 && e0 === prevQ))) { if (c.q === prevQ && e0) pick(e0, "card-" + c.why + "-more"); return; }   // پس از پلهٔ خاص‌تر، گیرِ بعدی به کلی‌ترِ همان کارت برنمی‌گردد
      pick(c.q, c.why === "presup" ? "fail-presup" : c.why === "aside" ? "fail-aside" : "card-" + c.why);
    });
    /* (۳) گیر — دشواریِ همین مرحله. H2 (دورِ ۷، s02): پولیا از کلی به خاص — هر گیرِ پیاپی یک پلهٔ خاص‌تر (پلهٔ این دنباله = شمارِ گیرهای پیاپیِ همین مسئله)،
       و هرگز همان پرسشِ نوبتِ پیش: همهٔ داده‌ها؟ ⇐ نامِ دادهٔ (یا بخشِ شرطِ) به‌کارنرفته ⇐ (اجرا، استقرا: حالتِ پایه/جای فرضِ استقرا) ⇐ از خواسته به عقب ⇐
       مسئلهٔ مرتبط/کمکی. دادهٔ کنارگذاشته با دلیل «رسیدگی‌شده» است (s30): پرسشِ نوبت فقط پس از حدسِ ردشده یا وقتی همهٔ دادهٔ دیگر به کار رفته. */
    if (stuckT && (ph === "p" || ph === "c")) {
      var asl = asideList(s), un = overCol ? [] : unusedOf(s, pg), lcF = lastClosed(s), loF = lcF && lcF.out, failedS = !!(loF && !loF.auto && (loF.done === "no" || loF.prog === "نه" || loF.match === "no"));
      var seq = [], qAll = Q.filter(function (x) { return B3_RE.test(norm(x)); })[0] || Q_ALLD;
      if (asl.length && (guessRefuted(s) || !un.length)) seq.push(["داده‌ای که کنار گذاشته بودی («" + clip(asl[0].t, 60) + "»، دلیلت: «" + clip(asl[0].why, 50) + "») هنوز بی‌ربط است؟ دادهٔ کنارگذاشته گاهی همان عنصرِ غایب است.", "stuck-aside"]);
      if (ph === "c" && failedS) seq.push([Q.filter(function (x) { return /شکلِ?\s*دیگری\s*بیان/.test(x); })[0] || Q_RESTATE_C, "fail-restate"]);
      /* R8 (I-live 1، s02): پلهٔ «نامِ داده» فقط داده‌ای را نام می‌برد که کاربر هیچ‌جا (گفت‌وگوی همین مسئله، پیامِ همین نوبت، طرح و گام‌ها) به کارش نبرده —
         عددِ ویژه‌اش یا واژه‌های متمایزش نیامده؛ اگر چنین داده‌ای نماند، این پله کنار می‌رود (پلهٔ بعد: از خواسته به عقب) */
      if (un.length) { seq.push([qAll, "stuck-alldata"]); var unN = unSeen(r, s, un, tx); if (unN.length) seq.push(["دادهٔ «" + clip(unN[0].t, 60) + "» را کجا به کار برده‌ای؟ اگر هنوز نه، در کدام گام جا دارد — یا با دلیل کنارش می‌گذاری؟", "stuck-name"]); }
      else if (ph === "c" && natOf(s, r) === "objective") { var cu0 = condUsed(s).filter(function (x) { return !x.used; }); if (cu0.length && L.steps.length) seq.push(["بخشِ «" + clip(cu0[0].t, 60) + "» از شرط در کدام گامت آمد؟ اگر در هیچ‌کدام، کجا جایش است؟", "stuck-name"]); }
      if (ph === "c" && IND_RE.test(norm([r.p.statement, (uOf(s) || {}).u, L.plan && L.plan.t].join(" ")))) seq.push([Q_BASE, "stuck-exec"]);
      seq.push([backQ(r, s, Q), "stuck-back"]);
      /* دورِ ۹ (s35x): پرسشِ «مسئلهٔ مرتبط — نتیجه یا روشش؟» فقط اگر هنوز به کار نرفته — اگر آنچه در «پیش‌تر دیده‌ای؟» گفته (L.seen.where/fam) در طرح یا گام‌ها آمده، دوباره پرسیده نمی‌شود */
      var relTxt = [L.plan && L.plan.t, L.draft && L.draft.t].concat((L.steps || []).map(function (x) { return [x.text, x.prem, x.proof, x.goalWhy].join(" "); })).join(" ");
      var relUsed = !!(L.seen && L.seen.ans === "yes" && [L.seen.where, L.seen.fam].some(function (w) { return w && mentions(relTxt, w); }));
      if ((L.related.length || (L.seen && L.seen.ans === "yes")) && !relUsed) seq.push([Q.filter(function (x) { return /نتیجه[\s\S]{0,40}روش[\s\S]{0,80}کمکی/.test(x); })[0] || Q_RELUSE, "stuck-related"]);
      seq.push([Q_AUXP, "stuck-aux"]);
      var i0 = Math.max(0, Math.min((stuckN || 1) - 1, seq.length - 1)), cand = seq.slice(i0).concat(seq.slice(0, i0).reverse());
      cand.forEach(function (c) { if (c[0] !== prevQ) pick(c[0], c[1]); });
    }
    /* شکستِ گزارش‌شده پس از گامی واقعی ⇒ «به شکلِ دیگری بیان کن»؛ بی هیچ گامی هرگز «این گام جواب نداد» (s25) */
    if (ph === "c" && T.fail && L.steps.some(function (x) { return x.closed && x.out && !x.out.auto; })) pick(Q.filter(function (x) { return /شکلِ?\s*دیگری\s*بیان/.test(x); })[0] || Q_RESTATE_C, "fail-restate");
    /* (۴) کارتِ صفحه — موعدِ گامِ باز حتی اگر پیش‌تر پرسیده شده، چون صفحه هنوز همان را می‌پرسد */
    if (!q && pageQ && (ok(pageQ) || (ph === "c" && openStep(s)))) { q = pageQ; src = "page"; }
    /* (۵) نردبان */
    if (!q) { q = Q.filter(function (x) { return ok(x) && !(ph === "p" && (tut.plan || []).some(function (e) { return e && e.src === "live" && e.q === x && (e.text || e.skip); })); })[0] || ""; if (q) src = "ladder"; }
    var rung = Q.length ? Q.indexOf(q) : 0; if (rung < 0) rung = Q.filter(isAsked).length;
    if (K && R && (stuckT || !R.st)) R.q = q;
    if (K && JSON.stringify([L.stk || null, L.ckHold || null]) !== R0) { try { S.put(pg); } catch (e) { } }
    return { ph: ph, Q: Q, q: q, src: src, pageQ: pageQ, card: card, cardWhy: SC[0] ? SC[0].why : pageQ ? "page" : "", rung: rung, ladderEnd: !!Q.length && !q, stuckN: stuckN };
  }
  /* دورِ ۱۰ (J1، s38 p1): «فقط جواب رو بگو» بی تلاشِ دیدنی (نه در همین پیام، نه طرح/گامی در صفحه) ⇒ کارِ همین نوبت با بالاترین اولویت (پولیا: پیش از
     نخستین سرنخ، تلاشِ خودش را بشنو) — opts.turn.onlyAns (بولی، از مربی) بر الگوی متنیِ همین‌جا مقدم است؛ امضای پیشین بی آن هم کار می‌کند */
  var Q_ONLYANS = "پیش از هر سرنخ: خودت تا کجا رفتی و کجا ماندی؟";
  /* دورِ ۱۱ (K3، s01/s02/s04/s05): همان خانوادهٔ «فقط جواب» — «زود بگو»، «یه راه‌حل بده»، «فقط بگو X یا Y؟» (خواستنِ حکمِ آماده میانِ دو گزینه)؛
     بی تلاشِ دیدنی همان لحظهٔ A073 است (ATTEMPT_L هنوز کنارش می‌گذارد) */
  var ONLY_ANS_L = /فقط\s*(?:جواب|پاسخ)|جواب(?:ش|شو)?\s*(?:رو|را)?\s*(?:فقط\s*)?بگو|جوابِ?\s*آخر(?:ش)?\s*(?:رو|را)?\s*بده|(?:تو|شما)\s*(?:خودت\s*|خودتون\s*)?که\s*(?:ماشینی|ماشین\s*هستی|هوش\s*مصنوعی|کامپیوتری)[^.؟?]{0,25}?بگو|خودت\s*بگو|(?:^|[^آ-ی])زود\s*(?:بگو|بگید|بگین|جواب\s*بده)|(?:یه|یک)\s*راه\s*حل(?:ی)?\s*(?:بهم\s*|به\s*من\s*)?(?:بده|بگو)|راه\s*حل(?:ش|شو)\s*(?:رو|را)?\s*(?:بده|بگو)|فقط\s*بگو\s+[^.؟?!\n]{1,60}?\s+یا\s+[^.؟?!\n]{1,60}?[؟?]/;
  var ATTEMPT_L = /(?:امتحان|سعی|حساب|جای\s*گذاری|فرض|رسم|ضرب|جمع|تقسیم)\s*کردم|رسیدم|به\s*دست\s*آوردم|نوشتم|کشیدم|شمردم|ساختم|تا\s*(?:این\s*جا|اینجا)|حدس(?:م|\s*می\s*زنم)|به\s*نظرم|فکر\s*(?:کنم|می\s*کنم|کردم)|راه(?:م|ِ?\s*من)\s|اول(?:ش)?\s+[^.؟?!\n]{2,40}\s(?:کردم|گرفتم|زدم)|[=＝]/;
  function onlyAnsNow(r, s, T, tx) {
    if (typeof T.onlyAns === "boolean") return T.onlyAns;
    var own = norm(String(T.text || "").replace(/«[^»]*»|"[^"\n]*"|“[^”]*”/g, " "));
    if (!ONLY_ANS_L.test(own) || ATTEMPT_L.test(own)) return false;
    var L = live(s); return !(L.plan && L.plan.at) && !L.steps.length && !L.planDraft;
  }
  A.liveOnlyAns = function (t) { return ONLY_ANS_L.test(norm(String(t || ""))); };
  A.liveCoach = function (pid, opts) {
    var r = rec(pid); if (!r) return null; var pg = pgOf(pid), s = solOf(pg), C = coachCore(r, pg, s, opts), ph = C.ph;
    var ki = A.liveKindInfo(pid), aside = asideList(s);
    return { pid: pid, ph: ph, phFa: PHN[ph], kind: ki.kind, type: ki.type, spatial: ki.spatial, kindSet: ki.set, q: C.q, src: C.src, stuckN: C.stuckN, pageQ: C.pageQ, card: C.card, cardWhy: C.cardWhy, samePage: !!C.q && C.q === C.card, planExists: planExists(s), rung: C.rung, ladderEnd: C.ladderEnd, list: C.Q, closure: A.liveClosure(pid), unused: unusedOf(s, pg).map(function (x) { return x.t; }), condUnused: condUsed(s).filter(function (x) { return !x.used; }).map(function (x) { return x.t; }), aside: aside };
  };
  A.liveCarry = function (t) { return CARRY_RE.test(norm(t)); };
  A.liveCarryRe = CARRY_RE;   // همان الگوی «نسبت به کمیتِ تازه» برای مربی (a27) — یک منبع; روی متنِ norm‌شده بیازما (A.liveCarry)
  A.livePhaseQs = function (pid, ph) { var r = rec(pid); if (!r) return []; var s = solOf(pgOf(pid)); return phaseQs(r, s, ph || phaseOf(s)); };
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
      box.appendChild(h("p", { class: "small lp-coachend" }, "نردبانِ پرسش‌های این مرحله تمام شد. اگر نردبان تمام شد: ایدهٔ کلیدی را جدا کن و فقط گامِ بعد را بگو، سپس «کتاب را ببند و خودت دوباره حل کن» (C188) — و فردا بخواه خودش بی‌نگاه دوباره بسازدش."));
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
    /* دورِ ۲ (R5، s22): ادعای «۱۰۰٪» — خواسته یا ناخواسته — هم «اثبات یا رد کن» است: یقین فقط از برهان می‌آید */
    var podC = (d.want === "yes" && +d.conf > 50) || d.conf === "100";
    if (podC) box.appendChild(h("div", { class: "card soft col gap lp-claimpod" }, prov("want"),
      h("p", { class: "small" }, d.conf === "100" && d.want !== "yes" ? "ادعای «صددرصد» هنوز ادعاست تا ثابت یا رد شود — «اثبات یا رد کن»: پیش از پرونده، قوی‌ترین شاهدِ خلافش را بنویس و همان را اول بیازما." : "ادعایی که دوستش داری و به آن مطمئنی، «اثبات یا رد کن» می‌شود: پیش از پرونده، قوی‌ترین شاهدِ خلافش را بنویس — همان را اول بیازما."),
      field("lpClaimContra", "قوی‌ترین شاهدِ خلاف: چه چیزی، اگر درست باشد، این ادعا را رد می‌کند؟", d.contra, function (v) { d.contra = v; }, 0)));
    box.appendChild(h("button", { class: "btn ghost sm lp-claimgo", type: "button", onclick: function () {
      var t = txt(d.t); if (t.length < 5) { A.toast("ادعا را بنویس.", "bad"); return; }
      if (podC && toks(d.contra).length < 2) { A.toast("«اثبات یا رد کن»: اول قوی‌ترین شاهدِ خلافش را بنویس.", "bad"); return; }
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
  /* «این گام از طرح می‌آید؟» (دورِ ۲، R4): با گام‌های اعلام‌شدهٔ طرح سنجیده می‌شود — هر پاره‌ی «نخست … سپس …»، طرحِ دوم، چرخشِ اعلام‌شده و شاخهٔ
     برگزیدهٔ کار به عقب جدا؛ برچسب: "p1" (طرحِ اصلی) | "p2" (فقط طرحِ دوم ⇒ «به طرحِ دوم رفتی؟») | "rot" (چرخشِ اعلام‌شده) | "back" | "ind" (گامِ پایه/استقرا
     در طرحی که استقرا را اعلام کرده) | "" (از طرح نمی‌آید) | "short" (گام کوتاه‌تر از آن است که سنجیده شود). */
  var IND_STEP = /پایه|گام\s*(?:ِ\s*)?استقرا|فرض\s*(?:ِ\s*)?استقرا|[nk]\s*\+\s*1|n\s*=\s*k|برای\s*n\s*=|حالت\s*(?:ِ\s*)?پایه/;
  function planPieces(t) { return String(t || "").split(/\n|؛|،?\s(?:سپس|بعد|بعدش|آنگاه|آن‌گاه|و\s*بعد|و\s*سپس)\s|[.]\s/).map(txt).filter(Boolean); }
  /* A8 (دورِ ۳): هر دو سو —
     • طرحِ استقرایی بی واژهٔ «استقرا» هم استقرایی است: «برای n=1 وارسی … فرض می‌کنم برای n … برای n+1»، یا حرکتِ «نزول یا استقراء» (s25)؛
     • گامِ وارسی یا دادهٔ تازه («درستیِ گامِ پیش را دوباره وارسی کردم»، «اندازه گرفتم») بخشی از هر طرح است، نه عوض کردنِ آن (s36) ⇒ "check"؛
     • هم‌واژگی با پاره‌ای از طرح که گام همان واژه را نفی می‌کند («کیش نیست» در برابرِ «با وزیر کیش می‌دهم»، s21) پیروی نیست. */
  var CHECK_STEP = /وارسی|بررسی|چک\s*(?:کرد|می|کن)|امتحان\s*کرد|آزمود|دوباره\s*(?:حساب|شمرد)|داده\s*(?:ی|ای)?\s*(?:تازه|جدید)|اطلاعات\s*(?:تازه|جدید)|اندازه\s*گرفت|پرسیدم|فهمیدم\s*که|جای?\s*گذاری|جایگذاری|جا\s*گذاشتم|(?:در|تو|توی)\s*شرط\s*(?:اصلی\s*)?(?:گذاشتم|قرار\s*دادم)|گذاشتم\s*(?:در|تو|توی)\s*شرط/;   // E8 (s36): جای‌گذاری در شرط وارسی است
  var NEG_AFTER = /^(?:نیست|نیستند|نبود|نشد|نمی|نه|ندارد|ندارند|نداد|نمی\s*دهد|نمیده|نمیدهد)$/;
  function negatedIn(text, w) {
    var ws = norm(text).split(/[^0-9a-zء-یپچژکگ]+/).filter(Boolean);
    for (var i = 0; i < ws.length; i++) { var t = stem(BROKEN[ws[i]] || ws[i]); if (!(t === w || (w.length >= 4 && t.length >= 4 && (t.indexOf(w) === 0 || w.indexOf(t) === 0)))) continue;
      if (((ws[i + 1] && NEG_AFTER.test(ws[i + 1])) || (ws[i + 2] && NEG_AFTER.test(ws[i + 2]) && !/^(?:و|یا|ولی)$/.test(ws[i + 1])))) return true; }   // «بی/بدونِ X» صفت است، نه نفیِ گزاره («یک ماه بی کلاس» همان طرح است)
    return false;
  }
  function indPlan(L) { var t = norm([L.plan.t, L.plan.t2].join(" ")); return /استقرا/.test(t) || IND_RE.test(t) || /n\s*\+\s*1|k\s*\+\s*1/.test(t) || L.moves.some(function (m) { return m.mv === "mv_descent"; }); }
  function stepFollowsTag(L, text) {
    var st = toksSim(text); if (!(L.plan && L.plan.at)) return "p1";
    var nm = norm(text);
    if (indPlan(L) && (IND_STEP.test(nm) || IND_RE.test(nm))) return "ind";
    if (CHECK_STEP.test(nm)) return "check";
    if (st.length < 2) return "short";
    if (!toksSim([L.plan.t, L.plan.t2, L.plan.rot].join(" ")).length) return "p1";
    /* E8 (دورِ ۴، s21): گامی که کنشِ اصلیِ طرح را نفی می‌کند («کیش نیست» برای طرحِ «با وزیر کیش می‌دهم») پیروِ طرح نیست، هرچند «وزیر/مات» مشترک باشد */
    /* F5 (دورِ ۵، s21): فقط نفیِ «کنش»ِ طرح (نخستین پارهٔ طرح که گام با آن هم‌واژه است) پیوند را می‌بُرد؛ نفیِ «پیامد»ی که در پاره‌ای دیرتر آمده
       («… مات نمی‌شود» برای «نخست با وزیر کیش می‌دهم سپس مات می‌کنم») گامی را که خودِ کنش را اجرا می‌کند بیرون نمی‌کند */
    if (negAction(L, text)) return "";
    var any = function (t) { var pt = toksSim(t), sh = st.filter(function (w) { return hit(w, pt); }); return pt.length && sh.length && !sh.some(function (w) { return negatedIn(text, w); }); };
    if (planPieces(L.plan.t).some(any) || any(L.plan.t)) return "p1";
    if (txt(L.plan.rot) && (planPieces(L.plan.rot).some(any) || any(L.plan.rot))) return "rot";
    var c = chosenChain(L); if (c && any((c.links || []).join(" "))) return "back";
    if (txt(L.plan.t2) && any(L.plan.t2)) return "p2";
    return "";
  }
  function negAction(L, text) {
    var st = toksSim(text), pcs = planPieces(L.plan.t).concat(planPieces(L.plan.t2), planPieces(L.plan.rot));
    for (var i = 0; i < pcs.length; i++) { var pt = toksSim(pcs[i]), sh = st.filter(function (w) { return hit(w, pt); }); if (!sh.length) continue;
      var ng = sh.filter(function (w) { return negatedIn(text, w); }); return ng.length ? ng[0] : ""; }
    return "";
  }
  A.liveStepNegAction = function (pid, text) { var pg = pgOf(pid), L = live(solOf(pg)); return L.plan && L.plan.at ? negAction(L, text) : ""; };
  function stepFollows(L, text) { var t = stepFollowsTag(L, text); return t !== "" && t !== "p2"; }
  A.liveStepFollows = function (pid, text) { var pg = pgOf(pid); return stepFollows(live(solOf(pg)), text); };
  A.liveStepFollowsTag = function (pid, text) { var pg = pgOf(pid); return stepFollowsTag(live(solOf(pg)), text); };
  /* استقرا و «n ≥ k» (دورِ ۲، R2، s24؛ B184 «کافی است بدانیم گزاره برای n = 1 درست است»): گامی که استقرا یا «برای هر n ≥ k» را به کار می‌برد، حالتِ پایه را جدا می‌خواهد */
  var IND_RE = /استقرا|[nk]\s*\+\s*1|برای\s*(?:هر|همهٔ?)\s*(?:عدد\s*)?(?:طبیعی\s*)?n|n\s*[≥>]=?\s*\d|n\s*>=\s*\d/;
  function needsBase(s, r, text) { var u = uOf(s) || {}; return IND_RE.test(norm([text].join(" "))) || (IND_RE.test(norm([r.p.statement, u.u].join(" "))) && /(?:^|\s)(?:پس|بنابراین)\s|برای\s*(?:هر|همه)/.test(norm(text))); }
  /* معادله‌ها در برابرِ مجهول‌ها (دورِ ۲، R3، s26): کد معادله‌های گام‌ها را می‌شمارد؛ شمارِ مجهول‌ها را کاربر می‌گوید */
  /* A9 (دورِ ۳، s12/s26/s36): فقط معادلهٔ واقعی شمرده می‌شود — تکه‌ای از نمادها و عددها (بی واژهٔ فارسی) که «=» دارد و دو سویش نماد/عدد است،
     دست‌کم یک سو نمادِ مجهول (حرفِ لاتین) دارد، و «x = ۳» (یک نماد برابرِ یک عدد) جواب است نه معادله. زنجیرهٔ ساده‌سازیِ «a = b + 1 = c» یک معادله است،
     نه چند تا؛ فاصله‌ها برای شناختنِ مرزِ جمله نگه داشته می‌شوند (پیش‌تر «پس30−x=y.باسه…» یک معادله شمرده می‌شد). */
  var EQ_CHUNK = /[A-Za-z0-9.,()+\-−–*/^×÷·√²³ⁿ'′_ =]+/g;
  /* F5 (دورِ ۵، s26): معادله‌ای که از جای‌گذاریِ معادله‌های پیشین درمی‌آید («x = 4.5y» پس از «2x = 9y») معادلهٔ تازه نیست — شمارش = رتبه.
     هر معادله f = چپ − راست است؛ گرادیانش در یک نقطهٔ ثابت (تفاضلِ مرکزی) سطری از ماتریس است و معادله فقط اگر رتبه را بالا ببرد مستقل شمرده می‌شود
     (برای معادله‌های خطی دقیق؛ معادله‌ای که تجزیه نشد، مثلِ پیش، مستقل شمرده می‌شود — رفتارِ پیشین). */
  function eqParse(src) {
    var t = String(src).replace(/[−–]/g, "-").replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/²/g, "^2").replace(/³/g, "^3").replace(/,/g, "."), i = 0, toks0 = [], m;
    var RE = /\s*(?:(\d+(?:\.\d+)?)|([a-z][0-9_′']*)|([-+*/^()]))/gi;
    while (i < t.length) { RE.lastIndex = i; m = RE.exec(t); if (!m || m.index !== i) { if (/^\s+$/.test(t.slice(i))) break; return null; } i = RE.lastIndex; toks0.push(m[1] != null ? { n: +m[1] } : m[2] != null ? { v: m[2].toLowerCase() } : { o: m[3] }); }
    var tk = []; toks0.forEach(function (x, j) { var p = tk[tk.length - 1]; if (p && (p.n != null || p.v || p.o === ")") && (x.n != null || x.v || x.o === "(")) tk.push({ o: "*" }); tk.push(x); });   // ضربِ ضمنی: 4.5y، 40(y/5)
    var k = 0;
    function prim() { var x = tk[k++]; if (!x) throw 0; if (x.n != null) return function () { return x.n; }; if (x.v) return function (e) { return e[x.v] || 0; };
      if (x.o === "(") { var a = add(); if (!tk[k] || tk[k].o !== ")") throw 0; k++; return a; } if (x.o === "-") { var b = pw(); return function (e) { return -b(e); }; } if (x.o === "+") return pw(); throw 0; }
    function pw() { var a = prim(); if (tk[k] && tk[k].o === "^") { k++; var b = pw(); return function (e) { return Math.pow(a(e), b(e)); }; } return a; }
    function mul() { var a = pw(); while (tk[k] && (tk[k].o === "*" || tk[k].o === "/")) { var op = tk[k++].o, b = pw(), a0 = a; a = op === "*" ? (function (p, q) { return function (e) { return p(e) * q(e); }; })(a0, b) : (function (p, q) { return function (e) { return p(e) / q(e); }; })(a0, b); } return a; }
    function add() { var a = mul(); while (tk[k] && (tk[k].o === "+" || tk[k].o === "-")) { var op = tk[k++].o, b = mul(), a0 = a; a = op === "+" ? (function (p, q) { return function (e) { return p(e) + q(e); }; })(a0, b) : (function (p, q) { return function (e) { return p(e) - q(e); }; })(a0, b); } return a; }
    try { var f = add(); if (k !== tk.length) return null; return { f: f, vars: tk.filter(function (x) { return x.v; }).map(function (x) { return x.v; }) }; } catch (e) { return null; }
  }
  function eqRankFilter(list) {
    var rows = [], indep = [], derived = [], P = {};
    list.forEach(function (c) {
      var sd = c.split("="), a = eqParse(sd[0]), b = eqParse(sd[1]);
      if (!a || !b) { indep.push(c); return; }
      var vs = a.vars.concat(b.vars).filter(function (v, j, A0) { return A0.indexOf(v) === j; });
      vs.forEach(function (v) { if (P[v] == null) P[v] = 1.3 + 0.37 * Object.keys(P).length; });
      var f = function (e) { return a.f(e) - b.f(e); }, g = {}, ok = true;
      vs.forEach(function (v) { var h0 = 1e-4, e1 = Object.assign({}, P), e2 = Object.assign({}, P); e1[v] += h0; e2[v] -= h0; var dv = (f(e1) - f(e2)) / (2 * h0); if (!isFinite(dv)) ok = false; g[v] = dv; });
      if (!ok) { indep.push(c); return; }
      /* حذفِ گاوسی روی سطرهای پیشین (هر سطر ستونِ لولا دارد) */
      var r0 = Object.assign({}, g); rows.forEach(function (R) { var c0 = r0[R.piv] || 0; if (c0) Object.keys(R.g).forEach(function (v) { r0[v] = (r0[v] || 0) - c0 * R.g[v]; }); });
      var mx = 0, piv = null, sc = 0; Object.keys(g).forEach(function (v) { sc = Math.max(sc, Math.abs(g[v])); }); Object.keys(r0).forEach(function (v) { if (Math.abs(r0[v]) > mx) { mx = Math.abs(r0[v]); piv = v; } });
      if (!piv || mx <= 1e-6 * Math.max(1, sc)) { derived.push(c); return; }
      var pv = r0[piv]; Object.keys(r0).forEach(function (v) { r0[v] /= pv; });
      rows.forEach(function (R) { var c1 = R.g[piv] || 0; if (c1) Object.keys(r0).forEach(function (v) { R.g[v] = (R.g[v] || 0) - c1 * r0[v]; }); });
      rows.push({ piv: piv, g: r0 }); indep.push(c);
    });
    return { indep: indep, derived: derived };
  }
  function eqsOf(s) { return eqRankFilter(eqsRaw(s)).indep; }
  function eqsRaw(s) {
    var o = [];
    live(s).steps.forEach(function (st) { [st.text, st.proof].forEach(function (t) {
      var x = norm(t).replace(/٫/g, ".");
      (x.match(EQ_CHUNK) || []).forEach(function (c0) {
        var c = c0.replace(/^[\s.,]+|[\s.,]+$/g, ""); if (c.indexOf("=") < 0 || /==|=>|<=|>=/.test(c)) return;
        var sides = c.split("=").map(function (y) { return y.trim(); }); if (sides.length < 2 || sides.some(function (y) { return !/[a-z0-9]/i.test(y); })) return;
        if (!sides.some(function (y) { return /[a-z]/i.test(y); })) return;   // فقط حساب (۲ + ۲ = ۴) معادله‌ای در مجهول نیست
        if (sides.length === 2 && sides.some(function (y) { return /^[a-z][0-9_′']*$/i.test(y); }) && sides.some(function (y) { return /^[\-−]?[0-9.]+$/.test(y); })) return;   // جواب: x = 3
        var k = c.replace(/\s+/g, ""); if (o.indexOf(k) < 0) o.push(k);
      });
    }); });
    return o;
  }
  A.liveEquations = function (pid) { var pg = pgOf(pid); return eqsOf(solOf(pg)); };
  A.liveEquationsDerived = function (pid) { var pg = pgOf(pid); return eqRankFilter(eqsRaw(solOf(pg))).derived; };
  function stepForm(r, pg, s) {
    var pid = r.p.id, L = live(s), nat = natOf(s, r), obj = nat === "objective";
    var d = SD[pid] = SD[pid] || { text: "", clear: "", unclear: "", prem: "", proof: "", base: "", real: false, pred: "", conf: "", when: "", far: false, data: [], cparts: [], unk: {}, sw: "", swWhy: "", bkm: "", bkmWhy: "" };
    var u = uOf(s) || {}, unk = unknownData(s, pg), TQ = (A.ASSIST && A.ASSIST.tutorQuestions) || {}, EQ = (TQ.exec && TQ.exec.qs) || ["روشن می‌بینی که این گام درست است؟", "می‌توانی ثابت کنی که درست است؟"];
    var withReal = !obj || d.real;
    var box = h("section", own({ class: "card lp-stepf", "data-nat": nat }), h("h4", {}, obj ? "گامِ بعدِ حل" : "گامِ واقعیِ بعد"),
      h("p", { class: "small" }, obj ? "این مسئله پاسخِ عینی دارد: داورِ هر گام برهان است، نه پیش‌بینیِ رویداد. هر گام را وارسی کن — دیدنِ درستیِ گام با ثابت کردنش فرق دارد؛ اگر فقط می‌بینی‌اش، شهودی ثبتش کن تا بعد ثابتش کنی." :
        "اجرا یعنی هر گام را وارسی کنی، نه فقط بنویسی؛ و پیش از انجام بدانی تقریباً به چه می‌رسی. پیش‌بینی‌ات با احتمال در «🎯 دفترِ پیش‌بینی» می‌نشیند و در موعد، خودت می‌گویی چه شد — کالیبراسیونِ پیش‌بینی‌هایت در «🧠 کارنامهٔ ذهن» از همین‌ها ساخته می‌شود."),
      prov(obj ? "cobj" : "c"),
      field("lpStep", obj ? "گامِ بعد — یک گامِ استدلال، محاسبه یا ساخت (دقیق)" : "گامِ بعد — یک کارِ مشخص در دنیای واقعی (چه چیزی، با چه کسی یا با چه ابزاری)", d.text, function (v) { d.text = v; }, 2),
      selF("lpClear", obj ? EQ[0] : lifePod(r, s) ? "روشن می‌بینی که این گام درست است — به آزمودنِ فرضیه نزدیکت می‌کند؟" : "روشن می‌بینی که این گام درست است — به مجهول نزدیکت می‌کند؟", ["بله", "مطمئن نیستم", "نه"], d.clear, function (v) { if (v === "نه") d.was = { text: txt(d.text), at: nowISO() }; d.clear = v; A.render(); }));
    /* A130 (سنجیده، نه تیک): «نه» گام را می‌بندد. یا بنویس کدام بخش روشن نیست، یا گام را کوچک‌تر بازنویسی کن — و بعد «روشن می‌بینی؟» را دوباره
       پاسخ بده. گامِ پیشین و تازه کنارِ هم ثبت می‌شوند */
    if (d.was) box.appendChild(h("div", { class: "col gap lp-unclear" }, h("p", { class: "small warnline" }, "گفتی روشن نمی‌بینی‌اش: «" + clip(d.was.text, 120) + "». بنویس دقیقاً کدام بخش روشن نیست، یا گام را بالا کوچک‌تر بازنویسی کن؛ بعد «روشن می‌بینی؟» را دوباره پاسخ بده."),
      field("lpUnclear", "کدام بخشِ این گام روشن نیست؟", d.unclear, function (v) { d.unclear = v; }, 2)));
    if (obj) box.appendChild(field("lpProof", EQ[1] + " — کدام داده، تعریف، قضیه یا گامِ پیشین آن را لازم می‌آورد؟", d.proof, function (v) { d.proof = v; }, 2));
    if (obj && (d.showBase || txt(d.base))) box.appendChild(h("div", { class: "card soft col gap lp-base" }, h("p", { class: "small warnline" }, "این گام استقرا یا «برای هر n ≥ …» را به کار می‌برد: گامِ استقرا بی حالتِ پایه هیچ چیز را ثابت نمی‌کند (B184). کوچک‌ترین n ای که حکم از آن آغاز می‌شود را جدا وارسی کن."),
      field("lpBase", "حالتِ پایه: برای کوچک‌ترین n (مثلاً n = ۱ یا همان k ِ «n ≥ k») چه دیدی و چطور وارسی‌اش کردی؟", d.base, function (v) { d.base = v; }, 0)));
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
    /* A13 (s07؛ A150): پیش از آزمایشِ واقعی، حالتِ حدی — آنچه با فکر دیده می‌شود را با آزمایشِ گران نیازما */
    if (withReal && (nat === "practical" || dataOf(s).some(function (x) { return /[0-9]/.test(norm(x.t)); }))) box.appendChild(h("p", { class: "small muted lp-stlim" }, "پیش از آزمایش: حالتِ حدی (یک اندازه صفر، خیلی بزرگ، یا دو داده برابر) چه پیش‌بینی می‌کند؟ اگر حالتِ حدی پاسخ را از پیش می‌گوید، آزمایش را برای جایی نگه دار که فکر به آن نمی‌رسد."));
    if (withReal) {
      box.appendChild(field("lpPred", "پیش از انجام: فکر می‌کنی چه می‌شود؟", d.pred, function (v) { d.pred = v; }, 2, "یک نتیجهٔ مشخص که بعداً بشود گفت شد یا نشد"));
      box.appendChild(selF("lpConf", "چقدر مطمئنی که همین می‌شود؟", CONF.map(function (x) { return [x, fa(x) + "٪"]; }), d.conf, function (v) { d.conf = v; }));
      box.appendChild(field("lpWhen", "کی انجامش می‌دهی؟ (روز، و اگر خواستی ساعت — همان روز نتیجه را می‌پرسم و پیش از آن ساعت یادآوری می‌کنم)", d.when, function (v) { d.when = v; }, 0, "مثلاً «پنجشنبه»، «فردا ۸ صبح»، «دهم آذر»، «آخرِ هفته»"));
      if (u.deadline) box.appendChild(h("p", { class: "small muted lp-deadnote" }, "مهلتِ خودِ مسئله: " + A.fdate(u.deadline)));
    }
    var tk = dataTicks(s, "lpSD_", d.data); if (tk) box.appendChild(tk);
    var ctk = condTicks(s, "lpSC_", d.cparts, typeOf(r, s) === "find" ? "این گام (یا معادله) کدام بخشِ شرط را به کار می‌برد؟" : "این گام کدام بخشِ حکم را پیش می‌برد؟"); if (ctk) box.appendChild(ctk);
    /* F7 (دورِ ۵، s35): گامی که از «چرخشِ اعلام‌شده» می‌آید هم باید به مجهول برسد — چرخش مجوزِ گم کردنِ هدف نیست */
    if (d.showGoal) box.appendChild(field("lpGoalW", "🎯 هدف را گم نکن — " + goalWord(r, s) + ": «" + clip((uOf(s) || {}).u, 100) + "». این گام (از چرخشِ اعلام‌شده) چطور به آن نزدیکت می‌کند؟", d.goalW || "", function (v) { d.goalW = v; }, 0));
    /* گامی که از طرح نمی‌آید ⇒ «طرح را عوض کردی؟»؛ گامی که فقط از طرحِ دوم می‌آید ⇒ «به طرحِ دومت رفتی؟» */
    if (L.plan && L.plan.at && (d.showSw || d.sw)) {
      var sw = h("div", { class: "card soft col gap lp-switch", "data-tag": d.swTag || "" }, h("p", { class: "small warnline" }, d.swTag === "p2" ? "این گام از طرحِ دومت («" + clip(L.plan.t2, 100) + "») می‌آید، نه از طرحِ اصلی — به طرحِ دوم رفتی؟" : "این گام از طرحِ ثبت‌شده‌ات («" + clip(L.plan.t, 100) + "») نمی‌آید — " + (negAction(L, d.text) ? "گامت کنشِ طرح («" + negAction(L, d.text) + "») را نفی می‌کند." : "کد واژهٔ مشترکی میانِ این گام و گام‌های طرح، طرحِ دوم، چرخشِ اعلام‌شده یا کار به عقب نیافت.")),
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
        var tg = stepFollowsTag(L, st); if (d.swTag !== tg) { d.swTag = tg; if (tg === "p2" && !d.sw) d.sw = "plan2"; d.showSw = true; }
        if (!d.sw) { d.showSw = true; why.push("این گام از طرحت نمی‌آید — بگو طرح را عوض کردی یا نه"); }
        else if (d.sw !== "same" && toks(d.swWhy).length < 2) { d.showSw = true; why.push(d.sw === "plan2" ? "بگو چرا طرحِ اول کنار رفت (به طرحِ دوم رفتی)" : "بگو چرا طرح را عوض کردی"); }
      }
      /* G6 (دورِ ۶، s35): زیرِ چرخشِ اعلام‌شده گام با خودِ هدف (مجهول) سنجیده می‌شود، نه با برچسبِ «از کدام پارهٔ طرح» — گامی که با یک واژهٔ همگانی به
         پارهٔ نخست چسبیده («جمع») ولی چیزِ تازه‌ای (جایزه) می‌آورد همان خطرِ گم کردنِ هدف را دارد (گامِ «طرحِ دوم/کار به عقب» پرسشِ خودش را دارد) */
      var tgG = st && L.plan && L.plan.at ? stepFollowsTag(L, st) : "";
      /* H2 (دورِ ۷، s35): نخستین گامِ کار همان طرح است که با هدف سنجیده شد — خطرِ گم کردنِ هدف از وقتی است که چرخش راه افتاده (دست‌کم یک گامِ پیشین)؛
         هم‌پوشانیِ واژه با مجهول به‌تنهایی نشانهٔ دور شدن نیست */
      if (st && L.steps.length && L.plan && L.plan.at && txt(L.plan.rot) && (tgG === "rot" || tgG === "p1") && txt(u.u) && !mentions(st, u.u) && !stepToCause(s, st, d.data) && toks(d.goalW).length < 2) { d.showGoal = true; why.push("طرحت چرخشِ تکرارشونده دارد — بگو این گام چطور به " + goalWord(r, s) + " نزدیکت می‌کند (هدف را گم نکن)"); }
      if (obj && st && needsBase(s, r, st + " " + d.proof) && !L.steps.some(function (x) { return toks(x.base).length >= 2; }) && toks(d.base).length < 2) { d.showBase = true; why.push("حالتِ پایهٔ استقرا (کوچک‌ترین n) را جدا وارسی کن و بنویس"); }
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
      if (why.length && (d.showSw || d.showGoal || d.showBase)) d.refD = A.today();   // R8 (I-live 2): روزِ آخرین ردِ صفحه — تازگیِ رد در پرسشِ نوبت
      if (why.length) { if ((d.showSw && !box.querySelector(".lp-switch")) || (d.showGoal && !box.querySelector("#lpGoalW")) || (d.showBase && !box.querySelector(".lp-base")) || (d.swTag && box.querySelector(".lp-switch") && box.querySelector(".lp-switch").getAttribute("data-tag") !== d.swTag)) { A.toast("هنوز نه: " + why.join("؛ "), "bad"); A.render(); return; } out.appendChild(h("p", { class: "bad lp-stepmiss" }, "هنوز نه: " + why.join("؛ ") + ".")); return; }
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
      if (d.cparts.length) stp.cparts = d.cparts.slice();
      if (toks(d.goalW).length >= 2) stp.goalWhy = txt(d.goalW);
      if (toks(d.base).length >= 2) stp.base = txt(d.base);
      if (d.was) stp.reclear = { before: d.was.text, unclear: txt(d.unclear), after: st, clear: d.clear, smaller: st !== d.was.text && st.length <= d.was.text.length };
      if (unk.length) stp.unknownAsk = JSON.parse(JSON.stringify(d.unk));
      if (ll) stp.backLink = { link: ll, match: d.bkm, why: txt(d.bkmWhy) };
      if (L.plan && L.plan.at && d.sw && !stepFollows(L, st)) {
        var swr = { at: nowISO(), d: A.today(), step: id, text: st, from: L.plan.t, to: d.sw, why: txt(d.swWhy), tag: stepFollowsTag(L, st) };
        (L.switches = L.switches || []).push(swr); stp.sw = d.sw;
        if (d.sw === "new") L.plan.switched = (L.plan.switched || 0) + 1;
      }
      L.steps.push(stp);
      /* برد: داده‌ای که تا این گام بی‌کار بود و حالا به کار رفت؛ گامی که ثابتش کردی */
      dataOf(s).forEach(function (x) { if (stp.data.indexOf(x.id) >= 0 && (!usedBefore[x.id] || usedBefore[x.id] === "aside")) win(L, "datum", x.t); });
      if (!withReal && !stp.intuitive) win(L, "proof", st);
      if (withReal) remindStep(r, stp);
      delete SD[pid]; S.put(pg); clearBad();
      clearBad(); A.toast(withReal ? "گام ثبت شد؛ " + (stp.due === A.today() ? "امروز" : A.fdate(stp.due)) + " در «امروز» می‌پرسد چه شد." : stp.intuitive ? "گام شهودی ثبت شد — بعداً ثابتش کن." : "گام با برهانش ثبت شد."); A.render();
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
  /* پروندهٔ کارخانهٔ حدس (s.g[1].caseId، «اثبات یا رد کن: …») — سرانجامِ صفحه در خودِ پرونده: status «closed» و liveResult (کلیدهای cs.outcome
     شمارهٔ ادعاهای ایستگاهِ تصدیق‌اند، پس این‌جا نوشته نمی‌شود) */
  function closeGuessCase(g, v, why) {
    var cs = g && g.caseId ? S.get(g.caseId) : null; if (!cs || cs.status === "closed") return false;
    cs.status = "closed"; cs.closedAt = nowISO(); cs.liveResult = { v: v, why: clip(why, 200), at: cs.closedAt, d: A.today() }; S.put(cs);
    if (cs.src && cs.src.type === "lprob" && rec(cs.src.id)) { var pgC = pgOf(cs.src.id); (live(solOf(pgC)).claims || []).forEach(function (c) { if (c.caseId === cs.id) c.result = v; }); }
    return true;
  }
  A.liveCloseGuessCase = closeGuessCase;
  /* G5 (دورِ ۶، s01): «نتیجه» ِ مسئلهٔ بسته برای «مسئلهٔ حل‌شدهٔ مرتبط» — همان جوابی که به آن رسید (جوابِ بازه‌ای؛ آنچه آخرین گامِ واقعی نشان داد؛ گامِ آخرِ
     برهان)، نه جملهٔ «در یک نگاه» ِ بازنگری (که روش است، نه جواب) */
  A.liveResult = function (pid) {
    var r = rec(pid); if (!r) return ""; var s = solOf(pgOf(pid)), L = live(s), b = s.b && s.b[1];
    if (b && b.verdict === "range" && txt(b.rangeW)) return txt(b.rangeW);
    var last = L.steps.filter(function (x) { return x.closed && x.out && !x.out.auto; }).pop();
    if (last) return last.out.kind === "proof" ? txt(last.text) : txt(last.out.what) || txt(last.text);
    return txt(L.chat && L.chat.solution) || "";
  };
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
        field("lpOReflect", "حالا که رد شد: همان کار را می‌کنی؟ چرا — و حدسِ اصلاح‌شده چیست؟", d.reflect, function (v) { d.reflect = v; }, 2),
        /* F7 (دورِ ۵، s22): «حدسِ تازه» فقط متن نماند — یک کلیک تا حدسِ تازهٔ همین مسئله شود (حدسِ ردشده در تاریخچه می‌ماند؛ شمارشِ پیامدها از نو) */
        selF("lpONewG", "حدسِ اصلاح‌شده را به‌عنوانِ حدسِ تازه ثبت کنم؟", [["no", "نه — فقط یادداشت"], ["yes", "بله — ثبت به‌عنوانِ حدس"]], d.newG || "", function (v) { d.newG = v; A.render(); }),
        d.newG === "yes" ? field("lpONewGT", "حدسِ تازه (یک جمله؛ با آزمونی که ردش کند)", d.newGT || "", function (v) { d.newGT = v; }, 0) : null,
        /* G5 (دورِ ۶، s01/s22): حدسِ تازه اطمینان و آزمونِ خودش را دارد — نه ارثِ حدسِ ردشده (۹۰٪ ِ آن حدس دربارهٔ این یکی چیزی نمی‌گوید) */
        d.newG === "yes" ? selF("lpONewGC", "چقدر به حدسِ تازه مطمئنی؟", ["50", "60", "70", "80", "90", "100"].map(function (x) { return [x, fa(x) + "٪"]; }), d.newGC || "", function (v) { d.newGC = v; }) : null,
        d.newG === "yes" ? field("lpONewGTest", "کدام آزمون می‌تواند حدسِ تازه را رد کند؟", d.newGTest || "", function (v) { d.newGTest = v; }, 0) : null,
        d.newG === "yes" ? field("lpONewGIf", "اگر آن آزمون ردش کرد، چه می‌کنی؟ (اختیاری)", d.newGIf || "", function (v) { d.newGIf = v; }, 0) : null));
    }
    box.appendChild(h("button", { class: "btn lp-outsave", type: "button", onclick: function () {
      var miss = []; if (!d.done) miss.push("«انجامش دادی؟»"); if (txt(d.what).length < 2) miss.push("«چه شد؟»"); if (d.done && d.done !== "no" && !d.match) miss.push("«با پیش‌بینی‌ات می‌خواند؟»"); if (!d.prog) miss.push("«نزدیک‌تر شدی؟»"); if (!d.want) miss.push("«چقدر می‌خواهی؟»");
      if (gAsk && d.done && d.done !== "no" && !d.grel) miss.push("«دربارهٔ حدست چه می‌گوید؟»");
      if (d.grel === "refute" && toks(d.reflect).length < 3) miss.push("«حالا که حدس رد شد، چه می‌کنی؟»");
      if (d.grel === "refute" && d.newG === "yes" && toks(d.newGT).length < 2) miss.push("«حدسِ تازه»");
      if (d.grel === "refute" && d.newG === "yes" && !d.newGC) miss.push("«چقدر به حدسِ تازه مطمئنی؟»");
      if (d.grel === "refute" && d.newG === "yes" && toks(d.newGTest).length < 2) miss.push("«کدام آزمون حدسِ تازه را رد می‌کند؟»");
      if (miss.length) { A.toast("اول این‌ها: " + miss.join("، "), "bad"); return; }
      st.out = { at: nowISO(), d: A.today(), done: d.done, what: txt(d.what), match: d.done === "no" ? "" : d.match, prog: d.prog, want: d.want }; st.closed = true;
      if (gAsk && d.grel && d.done !== "no") { st.out.guess = { rel: d.grel, g: g.guess }; if (d.grel === "refute") { st.out.guess.reflect = txt(d.reflect); st.out.guess.ifRef = g.ifRef || ""; } }
      if (gAsk && d.grel === "refute" && d.newG === "yes" && txt(d.newGT)) { var Lg0 = live(s); (Lg0.guessHist = Lg0.guessHist || []).push(Object.assign({}, g, { refutedAt: st.out.at, by: st.id }));
        s.g[1] = { guess: txt(d.newGT), conf: +d.newGC || null, test: txt(d.newGTest), testRes: "", ifRef: txt(d.newGIf), before: false, seen: false, at: st.out.at, since: st.out.at, prev: g.guess, from: "live:refute" }; }
      /* G6 (دورِ ۶، s11): ردِ حدس در صفحه ⇒ پروندهٔ کارخانهٔ همان حدس با سرانجامش بسته می‌شود (پیش‌تر «باز» با سرانجامِ خالی می‌ماند) */
      if (gAsk && d.grel === "refute" && d.done !== "no") closeGuessCase(g, "نادرست", "گامِ «" + clip(st.text, 60) + "»: " + txt(d.what));
      if (fc) { fc.outcome = d.done === "no" ? "انجام نشد" : d.match === "yes" ? "شد" : d.match === "no" ? "نشد" : "تاحدی"; fc.outcomeAt = nowISO(); S.put(fc); }
      unremindStep(r, st);
      var L1 = live(s);
      if (d.done !== "no" && d.match === "yes") win(L1, "pred", st.pred);
      if (d.prog === "بله، روشن") win(L1, "goal", st.text);
      delete OD[st.id + pid]; S.put(pg); clearBad(); A.render();
    } }, "ثبتِ نتیجه"));
    return box;
  }
  /* گامِ بازی که با «حل شد» یا «کنار گذاشتن» بسته می‌شود: پیش‌بینی‌اش هرگز آزموده نشد ⇒ «انجام نشد» (بیرون از کالیبراسیون و بی‌موعد در دفتر) */
  function closeOpen(s, why) {
    live(s).steps.forEach(function (st) { if (st.closed) return; st.closed = true; st.out = { at: nowISO(), d: A.today(), done: "no", what: "", match: "", prog: "", auto: why };
      var f = st.fc && S.get(st.fc); if (f && !f.outcome) { f.outcome = "انجام نشد"; f.outcomeAt = nowISO(); f.auto = why; S.put(f); } });
  }
  /* غافلگیری ⇒ داده است: گره‌گشا یا «دوباره فهمِ مسئله»؛ پیشرفتی نبود ⇒ «🌱 کوچک‌ترین گامِ بعد» */
  var MULTI_RE = /(?:دو|سه|چند|[2-9]|بیش\s*از\s*یک)\s*(?:تا\s*)?(?:جواب|پاسخ|ریشه)|جواب‌?\s*های|پاسخ‌?\s*های|هیچ\s*(?:جوابی|پاسخی)|جواب\s*ندارد|پاسخ\s*ندارد/;
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
    /* دورِ ۲ (s33): در گامِ برهانی «نتیجه» در متن و برهانِ گام است — «دو جواب» آن‌جا هم به «کافی است؟» پیوند می‌خورد */
    /* F2 (دورِ ۵، s22): کارتِ نتیجه هم همان را می‌پرسد که پرسشِ نوبت — پیش‌فرضِ شکسته، و دادهٔ کنارگذاشته پس از حدسِ ردشده */
    if (o.kind === "proof" && transfIn([st.text, st.proof].join(" "))) box.appendChild(h("p", { class: "card soft small warnline lp-equivq" }, "در این گام شرط یا معادله را تبدیل کردی: " + Q_EQUIV + " — چند جواب به دست آمد و هر کدام در شرطِ اصلی می‌نشیند؟"));
    /* F7 (دورِ ۵، s19): نتیجه‌ای که به حلقه‌ای از «از آخر به عقب» رسید (نقطهٔ میانی: «هفتهٔ ۸: ۴ کیلو کمتر») با همان حلقه پیوند می‌خورد */
    var cc0 = chosenChain(live(s)), lk = cc0 && o.what ? (cc0.links || []).filter(function (t) { return txt(t) && mentions(o.what, t); }) : [];
    if (lk.length) box.appendChild(h("p", { class: "small good lp-mslink" }, "🔗 این نتیجه به حلقهٔ «" + clip(lk[lk.length - 1], 80) + "» از «از آخر به عقب» رسید — نقطهٔ میانیِ راه."));
    var pb = presupBroken(s);
    if (pb) box.appendChild(h("section", own({ class: "card soft lp-presupback" }), h("h4", {}, "پیش‌فرضی که نگه داشتی"),
      h("p", { class: "small warnline" }, "پیش‌فرضی که نگه داشتی تا بیازمایی‌اش («" + clip(pb, 120) + "») — این نتیجه با آن می‌خواند؟ اگر نه، کنارش بگذار و به «کافی است؟» ِ فهم برگرد."),
      h("button", { class: "btn ghost sm lp-presupgo", type: "button", onclick: function () { live(s).reU = true; S.put(pg); A.go("lprob", r.p.id, "u"); } }, "↺ برگرد به «کافی است؟» در فهمِ مسئله")));
    var asl = asideList(s);
    if (asl.length && guessRefuted(s)) box.appendChild(h("section", own({ class: "card soft lp-asideback" }), h("h4", {}, "حدست رد شد — داده‌ای که کنار گذاشتی"),
      h("p", { class: "small" }, asl.map(function (x) { return "«" + clip(x.t, 60) + "» (دلیلت: «" + clip(x.why, 60) + "»)"; }).join("، ") + " — هنوز بی‌ربط است؟ دادهٔ کنارگذاشته گاهی همان عنصرِ غایب است.")));
    var mt0 = o.kind === "proof" ? [st.text, st.proof].join("\n") : o.what || "";
    if (MULTI_RE.test(norm(mt0))) box.appendChild(multiCard(r, pg, s, (o.kind === "proof" ? "در گامت نوشتی: «" : "در نتیجهٔ گامت نوشتی: «") + clip(o.kind === "proof" ? st.text : o.what, 100) + "»."));
    if (o.match === "no") box.appendChild(h("section", own({ class: "card soft lp-surprise" }), h("h4", {}, "غافلگیر شدی — این داده است، نه شکست"),
      h("p", { class: "small" }, "پیش‌بینی: «" + st.pred + "» · آنچه شد: «" + o.what + "». فاصلهٔ این دو جایی است که فهمت از مسئله یا از خودت ناقص بود."),
      h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm lp-toknot", type: "button", onclick: function () { stuck(r, pg, s, st); } }, "🪢 همین غافلگیری را در گره‌گشا بشکاف"),
        h("button", { class: "btn ghost sm lp-reu", type: "button", onclick: function () { live(s).reU = true; S.put(pg); A.go("lprob", r.p.id, "u"); } }, "↺ دوباره فهمِ مسئله"))));
    /* B9 (تورِ ۱ دورِ ۳، s19 — ویرایشِ کمینهٔ «coach»): خواستنی که پس از گام «کمتر» شد هم شکست/میلِ رها کردن است ⇒ همان کارتِ «🌱» */
    /* E8 (دورِ ۴، s19): پس از ثبتِ گامِ 🌱 برای همین نتیجه، کارت دوباره خالی نمی‌آید — فقط یک سطرِ «ثبت شد» */
    var wl0 = s.will || {}, wCommit = (wl0.log || []).filter(function (x) { return x && x.kind === "commit" && String(x.at) >= String(o.at || ""); }).pop(), wStep = wCommit && (wl0.steps || []).filter(function (x) { return String(x.at) === String(wCommit.at); })[0];
    if (wCommit) box.appendChild(h("p", { class: "small good lp-willdone" }, "🌱 " + (wStep ? "گامِ کوچکت ثبت شد: «" + clip(wStep.step, 80) + "» — وارسی: " + A.fdate(wStep.due) : "تصمیمت ثبت شد") + "."));
    else if ((o.prog === "نه" || o.done === "no" || o.want === "less") && A.willHost && A.willCard) {
      var hs = A.willHost("prob", r.p.id);
      if (hs) box.appendChild(A.willCard(hs, "live:" + (o.done === "no" ? "notdone" : o.prog === "نه" ? "noprog" : "less"), o.done === "no" ? "گام انجام نشد — اشکالی ندارد؛ داده است. چقدر می‌خواهی پیشش ببری و کوچک‌ترین گامِ بعد چیست؟" : o.prog === "نه" ? "پیشرفتی نبود. نه رها کن نه وانمود کن چیزی نشده: کوچک‌ترین گامِ مشخص بعد چیست، کی و چند دقیقه؟" : "پس از این گام کمتر می‌خواهی حلش کنی. نه رها کن نه وانمود کن چیزی نشده: کوچک‌ترین گامِ مشخص بعد چیست، کی و چند دقیقه؟ (یا آگاهانه، با دلیل، کنارش بگذار)"));
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

  /* ---------- بستنِ صادقانه (دورِ ۲ ِ تور، R5؛ ۲۰۲۶-۱۰-۱۶) ----------
     «✅ حل شد» دیگر یک کلیک نیست وقتی چیزی پشتِ سر باز مانده:
     • مسئلهٔ کمکی ≠ مسئلهٔ اصلی (A246: «مسئلهٔ کمکی وسیله است، نه هدف»): برای هر مسئلهٔ کمکی بگو پل را طی کردی (نتیجهٔ آن چطور نتیجهٔ اصلی را داد) یا در حلِ
       نهایی به کار نرفت — پیش‌تر «✅ حل شد» پس از حلِ فقط مسئلهٔ کمکی، اصلی را می‌بست (s29)؛
     • گامِ شهودی («بعداً ثابتش کن»، A131): همین‌جا یادآوری می‌شود — یا حالا ثابتش کن، یا آگاهانه شهودی بماند (حکمِ بستن «با گامِ شهودی» می‌شود، نه «اثبات شد»).
     همه داوریِ خودِ کاربر است؛ کد فقط می‌پرسد و ناخالی/مشخص بودن را می‌سنجد. */
  function gateItems(r, s) {
    var L = live(s), o = [];
    L.aux.forEach(function (a, i) { if (!a.crossed && !a.unused) o.push({ k: "aux", i: i, a: a }); });
    if (natOf(s, r) === "objective") L.steps.forEach(function (st) { if (st.intuitive && !st.keepIntuitive) o.push({ k: "intu", st: st }); });
    return o;
  }
  var XC = [["crossed", "پل را طی کردم — نتیجهٔ آن، نتیجهٔ اصلی را داد"], ["unused", "این مسئلهٔ کمکی در حلِ نهایی به کار نرفت"]];
  var IS = [["prove", "حالا ثابتش می‌کنم"], ["keep", "هنوز نه — آگاهانه شهودی می‌ماند"]];
  var GD = {};
  function solveClick(r, pg, s) {
    var L = live(s); (L.defects || []).forEach(function (x) { if (!x.resolvedAt && !x.retryAt) x.retryAt = nowISO(); });
    if (gateItems(r, s).length) { L.closing = { at: nowISO() }; S.put(pg); A.render(); return; }
    L.state = "solved"; L.stateAt = nowISO(); L.stateD = A.today(); delete L.closing; S.put(pg); A.go("lprob", r.p.id, "back");
  }
  function closeGateCard(r, pg, s) {
    var L = live(s); if (!L.closing) return null;
    var items = gateItems(r, s); if (!items.length) { delete L.closing; return null; }
    var pid = r.p.id, d = GD[pid] = GD[pid] || {};
    var box = h("section", own({ class: "card lp-close" }), h("h4", {}, "پیش از «حل شد»: چیزی پشتِ سر باز مانده"),
      h("p", { class: "small" }, "مسئلهٔ کمکی وسیله است، نه هدف؛ و گامی که فقط «می‌بینی» هنوز ثابت نشده. این‌ها را ببند — بعد «حل شد»."));
    items.forEach(function (it) {
      if (it.k === "aux") {
        var ka = "a" + it.i; d[ka] = d[ka] || { v: "", t: "" };
        box.appendChild(h("div", { class: "card soft col gap lp-closeaux", "data-aux": it.i }, h("p", { class: "small" }, "مسئلهٔ کمکی: «" + clip(it.a.t, 120) + "» — پلِ برگشتی که نوشتی: «" + clip(it.a.bridge, 120) + "»"),
          selF("lpXC_" + it.i, "حلِ آن چطور به حلِ مسئلهٔ اصلی رسید؟", XC, d[ka].v, function (v) { d[ka].v = v; A.render(); }),
          field("lpXCW_" + it.i, d[ka].v === "unused" ? "پس حلِ اصلی از کجا آمد؟ (یک خط)" : "نتیجهٔ کمکی ⇐ نتیجهٔ اصلی: دقیقاً چطور؟", d[ka].t, function (v) { d[ka].t = v; }, 0),
          it.a.k === "special" && natOf(s, r) === "objective" ? h("p", { class: "small warnline lp-closegen" }, "این مسئلهٔ کمکی حالتِ خاص بود: بگو چرا نتیجه‌اش برای همه برقرار است (استقرا، «برای هر … چون …»، تقارن، «بی کاستن از کلیت»). بی آن، مسئله با حکمِ «از حالت خاص به عام بدون استدلال» بسته می‌شود — نه «اثبات شد».") : null));
      } else {
        var ks = "s" + it.st.id; d[ks] = d[ks] || { v: "", t: "" };
        box.appendChild(h("div", { class: "card soft col gap lp-closeintu", "data-step": it.st.id }, h("p", { class: "small warnline" }, "این گام را شهودی ثبت کردی — «بعداً ثابتش کن»: «" + clip(it.st.text, 140) + "»"),
          selF("lpIS_" + it.st.id, "حالا؟", IS, d[ks].v, function (v) { d[ks].v = v; A.render(); }),
          d[ks].v === "prove" ? field("lpISP_" + it.st.id, "برهانش: کدام داده، تعریف، قضیه یا گامِ پیشین آن را لازم می‌آورد؟", d[ks].t, function (v) { d[ks].t = v; }, 0) : null));
      }
    });
    box.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn sm lp-closego", type: "button", onclick: function () {
      var miss = [];
      items.forEach(function (it) {
        if (it.k === "aux") { var x = d["a" + it.i] || {}; if (!x.v) miss.push("بگو مسئلهٔ کمکیِ «" + clip(it.a.t, 30) + "» چه شد"); else if (toks(x.t).length < (x.v === "crossed" ? 3 : 2)) miss.push(x.v === "crossed" ? "بنویس نتیجهٔ کمکی دقیقاً چطور نتیجهٔ اصلی را داد" : "بنویس حلِ اصلی از کجا آمد"); }
        else { var y = d["s" + it.st.id] || {}; if (!y.v) miss.push("بگو گامِ شهودیِ «" + clip(it.st.text, 30) + "» را حالا ثابت می‌کنی یا نه"); else if (y.v === "prove" && toks(y.t).length < 2) miss.push("برهانِ گامِ «" + clip(it.st.text, 30) + "» را بنویس"); }
      });
      if (miss.length) { A.toast("هنوز نه: " + miss.join("؛ "), "bad"); return; }
      var at = nowISO();
      items.forEach(function (it) {
        if (it.k === "aux") { var x = d["a" + it.i]; if (x.v === "crossed") { it.a.crossed = { t: txt(x.t), at: at }; if (it.a.k === "special" && natOf(s, r) === "objective") it.a.crossed.gen = genArg(it.a.bridge + "\n" + x.t); } else it.a.unused = { t: txt(x.t), at: at }; }
        else { var y = d["s" + it.st.id]; if (y.v === "prove") { it.st.proof = txt(y.t); it.st.intuitive = false; it.st.provedAt = at; win(L, "proof", it.st.text); } else it.st.keepIntuitive = at; }
      });
      delete GD[pid]; delete L.closing; L.state = "solved"; L.stateAt = at; L.stateD = A.today(); S.put(pg); A.go("lprob", pid, "back");
    } }, "تأیید — حل شد"), h("button", { class: "btn ghost sm lp-closeback", type: "button", onclick: function () { delete L.closing; delete GD[pid]; S.put(pg); A.render(); } }, "برگرد به اجرا")));
    return box;
  }
  /* بازنگری‌ای که ایراد یافت ⇒ کارتِ «ناتمام» در اجرا تا دوباره «حل شد» */
  function defectCard(s) {
    var L = live(s), x = (L.defects || []).filter(function (y) { return !y.resolvedAt; }).pop(); if (!x) return null;
    return h("p", { class: "card soft small warnline lp-defect" }, "ناتمام — بازنگری‌ات ایراد یافت: «" + clip(x.why, 140) + "» (برگشت به «" + (BACK_TO_FA[x.to] || "اجرا") + "»). پس از درست کردن دوباره «✅ حل شد» — بازنگری از نو.");
  }
  /* «حالِ بستن» برای دستیار و تور: { state: open|solved|abandoned|incomplete|closing, verdict, label, back, gate:[…], aux:{n, crossed}, intuitive:n, proved } */
  A.liveClosure = function (pid) {
    /* F5 (دورِ ۵، s30): «✅ حل شد» ِ دوباره پس از درست کردنِ ایراد ⇒ «در بازنگری» (review)، نه «ناتمام» با برچسبِ ایرادِ کهنه — ایرادی که پس از آن «حل شد» زده شد
       (retryAt) تا وقتی کاربر در بازنگری است کنار است؛ «برگرد — هنوز حل نشده» یا ایرادِ تازه آن را دوباره «ناتمام» می‌کند */
    var r = rec(pid); if (!r) return null; var pg = pgOf(pid), s = solOf(pg), L = live(s), b = s.b && s.b[1], ph = phaseOf(s), retry = L.state === "solved" || !!L.closing, df = (L.defects || []).filter(function (y) { return !y.resolvedAt && !(retry && y.retryAt); }).pop();
    /* A12 (دورِ ۳، s03 D6): «✅ حل شد» زده شد ولی بازنگری هنوز ثبت نشده ⇒ «review» («در بازنگری — هنوز بسته نشده»)، نه «حل شد» — بستن یعنی بازنگریِ ثبت‌شده */
    var st = ph === "done" ? (b && b.state === "abandoned" ? "abandoned" : "solved") : df ? "incomplete" : L.closing ? "closing" : L.state === "solved" || L.state === "abandoned" ? "review" : "open";
    var vd = b && b.done ? b.verdict || (b.state === "abandoned" ? "" : "verified") : "";
    var lab = st === "incomplete" ? "ناتمام — برگرد به «" + (BACK_TO_FA[df.to] || "اجرا") + "»: " + clip(df.why, 80) : st === "solved" ? vLabel(vd, typeOf(r, s), b) || "حل شد" : st === "abandoned" ? "آگاهانه کنار گذاشته شد" : st === "closing" ? "پیش از «حل شد»: پلِ مسئلهٔ کمکی یا گامِ شهودی باز است" : st === "open" ? "باز" : L.state === "abandoned" ? "در بازنگری — کنار گذاشتن هنوز ثبت نشده" : "در بازنگری — هنوز بسته نشده (تا بازنگری ثبت نشود «حل شد» نیست)";
    return { state: st, phase: ph, verdict: vd, label: lab, back: df ? df.to : null, gate: gateItems(r, s).map(function (x) { return x.k === "aux" ? { k: "aux", t: x.a.t } : { k: "intuitive", t: x.st.text }; }),
      date: L.closedD || L.stateD || "", aux: { n: L.aux.length, crossed: L.aux.filter(function (a) { return a.crossed; }).length }, intuitive: L.steps.filter(function (x) { return x.intuitive; }).length, proved: vd === "proved", refuted: vd === "refuted" || vd === "liferef", defects: (L.defects || []).length };
  };

  /* ---------- معادله‌ها در برابرِ مجهول‌ها (دورِ ۲، R3) ---------- */
  var EQD = {};
  var EQ_FEW = "معادله کم است: کدام بخشِ شرط هنوز به معادله درنیامده؟ (برای n مجهول دست‌کم n معادلهٔ مستقل لازم است)";
  function eqCard(r, pg, s) {
    var E = eqsOf(s), Ed = eqRankFilter(eqsRaw(s)).derived; if (!E.length) return null;
    var ty0 = typeOf(r, s); if (ty0 === "prove" || ty0 === "pod") return null;   // A9: برهان مجهول ندارد — شمارِ معادله‌ها در برابرِ مجهول‌ها بی‌معناست
    var pid = r.p.id, L = live(s), d = EQD[pid] = EQD[pid] || { n: L.eqUnk != null ? String(L.eqUnk) : "" };
    var box = h("section", own({ class: "card soft lp-eqs" }), h("h4", {}, "معادله‌ها در برابرِ مجهول‌ها"),
      h("p", { class: "small" }, "تا حالا " + fa(E.length) + " معادله نوشته‌ای:"), h("ul", { class: "small", dir: "ltr" }, E.slice(0, 8).map(function (e) { return h("li", {}, h("bdi", {}, e)); })),
      Ed.length ? h("p", { class: "small muted lp-eqder" }, "و " + fa(Ed.length) + " معادله که از جای‌گذاریِ همین‌ها درمی‌آید (تازه نیست، شمرده نشد): ", h("bdi", { dir: "ltr" }, Ed.slice(0, 4).join(" ؛ "))) : null,
      field("lpEqUnk", "چند مجهول داری؟ (عدد)", d.n, function (v) { d.n = v; }, 0),
      h("button", { class: "btn ghost sm lp-eqsave", type: "button", onclick: function () { var n = +norm(d.n).replace(/[^\d]/g, ""); if (!n) { A.toast("شمارِ مجهول‌ها را با عدد بنویس.", "bad"); return; } L.eqUnk = n; delete EQD[pid]; S.put(pg); A.render(); } }, "بسنج"));
    if (L.eqUnk) {
      var un = condUsed(s).filter(function (x) { return !x.used; }).map(function (x) { return "«" + clip(x.t, 50) + "»"; });
      box.appendChild(h("p", { class: "small " + (E.length === L.eqUnk ? "good" : "warnline") + " lp-eqmsg" }, E.length < L.eqUnk ? "معادله کم است: برای " + fa(L.eqUnk) + " مجهول دست‌کم " + fa(L.eqUnk) + " معادلهٔ مستقل لازم است — کدام بخشِ شرط هنوز به معادله درنیامده؟" + (un.length ? " (بخش‌هایی که هنوز در هیچ گامی نیامده‌اند: " + un.join("، ") + ")" : "")
        : E.length > L.eqUnk ? "معادله‌ها بیش از مجهول‌هایند: یا برخی از بقیه درمی‌آیند، یا با هم ناسازگارند — وارسی کن." : "شمارِ معادله‌ها و مجهول‌ها برابر است — مستقل‌اند؟ (هیچ‌کدام از بقیه درنمی‌آید؟)"));
    }
    return box;
  }

  /* ---------- مرورِ میانهٔ راه (دورِ ۲، R8؛ s35) — روی نردبانِ خودِ مسئله (۳ ⇐ ۷ ⇐ ۲۱ ⇐ ۶۰ روز از آغاز)، نه عددِ تازه ---------- */
  function checkDue(r, s) {
    var L = live(s), ph = phaseOf(s); if (ph === "done" || ph === "b" || !uOf(s)) return null;
    /* H2 (دورِ ۷، s36): نردبان از نخستین گامِ کار شمرده می‌شود، نه از روزِ ساختنِ مسئله — روزِ نخستِ کار هنوز «میانهٔ راه» نیست؛ بی هیچ گامی همان آغازِ مسئله */
    var day1 = function (x) { return x ? (A.localDay ? A.localDay(x) : String(x).slice(0, 10)) : ""; }, st1 = L.steps[0], w1 = st1 ? st1.d || day1(st1.at) : "";
    var u0 = uOf(s) || {}, start = w1 || L.startD || day1(u0.at); if (!start) return null;
    var n = (L.checkins || []).length, rung = LADDER[Math.min(n + 1, LADDER.length - 1)], due = A.addDays(start, LADDER.slice(1, n + 2).reduce(function (a, b) { return a + b; }, 0) || rung);
    /* E8 (دورِ ۴، s34): مرورِ دیرتر از موعد ثبت شد ⇒ پلهٔ بعد از روزِ همان مرور شمرده می‌شود (پیش‌تر کارت و «امروز» همان روز دوباره خالی برمی‌گشت) */
    var lastCk = n ? L.checkins[n - 1] : null; if (lastCk && lastCk.d) { var d2 = A.addDays(lastCk.d, rung); if (d2 > due) due = d2; }
    return due <= A.today() ? due : null;
  }
  var CKD = {};
  function checkinCard(r, pg, s) {
    if (!checkDue(r, s)) return null;
    var pid = r.p.id, L = live(s), d = CKD[pid] = CKD[pid] || { prob: "", self: "", want: "" };
    var box = h("section", own({ class: "card lp-checkin" }), h("h4", {}, "میانهٔ راه: چه آموختی؟"),
      h("p", { class: "small" }, "این مسئله مدتی است با توست. پیش از گامِ بعد، یک نگاهِ کوتاه به پشتِ سر — دربارهٔ خودِ مسئله و دربارهٔ خودت."),
      field("lpCkP", "دربارهٔ مسئله چه آموختی که روزِ اول نمی‌دانستی؟", d.prob, function (v) { d.prob = v; }, 0),
      field("lpCkS", "دربارهٔ خودت — شیوهٔ کارت، جایی که گیر می‌کنی — چه دیدی؟", d.self, function (v) { d.self = v; }, 0),
      selF("lpCkW", "حالا چقدر می‌خواهی حلش کنی — نسبت به آغاز؟", WANT, d.want, function (v) { d.want = v; }));
    box.appendChild(h("button", { class: "btn sm lp-ckgo", type: "button", onclick: function () {
      if (toks(d.prob).length < 2 || toks(d.self).length < 2 || !d.want) { A.toast("هر سه را بنویس — حتی کوتاه.", "bad"); return; }
      (L.checkins = L.checkins || []).push({ at: nowISO(), d: A.today(), prob: txt(d.prob), self: txt(d.self), want: d.want }); delete CKD[pid]; S.put(pg); clearBad(); A.toast("مرورِ میانهٔ راه ثبت شد."); A.render();
    } }, "ثبت و ادامه"));
    return box;
  }

  /* ---------- پیوست‌های گفت‌وگو ⇐ همین مسئله (دورِ ۲، R8؛ s21) — دستیار با A.liveAttach(pid, {name, id?, url?, mime?, sess?}) می‌بندد ---------- */
  A.liveAttach = function (pid, a) {
    var r = rec(pid); if (!r || !a || !txt(a.name)) return false; var pg = pgOf(pid), L = live(solOf(pg));
    L.attach = L.attach || []; var key = a.id || a.url || a.name;
    if (L.attach.some(function (x) { return (x.id || x.url || x.name) === key; })) return true;
    L.attach.push({ name: clip(txt(a.name), 120), id: a.id || "", url: a.url || "", mime: a.mime || "", sess: a.sess || "", at: nowISO() }); S.put(pg); return true;
  };
  A.liveAttachments = function (pid) { var r = rec(pid); if (!r) return []; var pg = pgOf(pid); return (live(solOf(pg)).attach || []).slice(); };
  function attachList(s) {
    var at = live(s).attach || []; if (!at.length) return null;
    return h("details", { class: "card small lp-attach", open: true }, h("summary", {}, "📎 پیوست‌های گفت‌وگو دربارهٔ همین مسئله (" + fa(at.length) + ")"),
      h("ul", {}, at.map(function (x) { return h("li", {}, x.url ? h("a", { href: x.url, target: "_blank", rel: "noopener" }, h("bdi", {}, x.name)) : h("bdi", {}, x.name), " · " + A.fdate(A.localDay ? A.localDay(x.at) : String(x.at).slice(0, 10))); })));
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
  /* «کدام پرسش کمک کرد؟» فقط پرسش است (دورِ ۲، s37): جملهٔ دستیار وقتی پرسش است که به «؟» ختم شود و واژهٔ پرسشی داشته باشد (نه «آفرین، ادامه بده؟») */
  var QWORD = /(?:^|[\s«(])(?:چه|چی|چیه|چرا|کدام|کدوم|آیا|چطور|چطوری|چگونه|کجا|کجای|کی|چند|چقدر|می[‌\s]?توانی|می[‌\s]?تونی|میتونی|می[‌\s]?شود|میشه|می[‌\s]?شه|هست|داری|دیده‌ای|دیدی|بود|است|کرده‌ای|کردی|گرفتی|برده‌ای|بردی|چیست)(?=[\s؟?،]|$)|(?:^|[\s«(])(?:ن?می[‌\s]?[آ-ی]{2,}ی|(?:بگوی|بنویس|ببین|بکن|بده|بیاب|بسنج|بیازمای|بیاور|بگیر|بدان|بخواه|بشمار|بساز|بکش|بخوان|ببر|بگذار|بپرس)ی)(?=[\s؟?،]|$)/;
  /* دورِ ۱۱ (K4، s21/s23/s24/s28/s01/s02/s05/s06): پرسشِ آری/نه با فعلِ دوم‌شخصِ مضارع («… به زبانِ خودت می‌گویی؟»، «بنویسی؟») هم پرسش است — QWORD ِ بالا
     فقط واژه‌های پرسشی و چند فعلِ ماضی را می‌شناخت، پس پرسشِ A191 ِ مربی در «کدام پرسش کمک کرد؟» نمی‌آمد */
  var HEADQ_RE = /(?:^|\s)(?:یا|آیا)\s|(?:^|\s)می\s*[ء-یپچژکگ]+ی(?=$|[\s،,؟?])|[؟?]|(?:^|\s)(?:چیست|چیه|کدام|کدوم|چطور|چطوری|چگونه|کجا|چرا|چند|چقدر)(?=$|[\s،,])/, TAILREF_RE = /^\s*(?:کدام|کدوم|کدامش|کدومش)\s*(?:را|رو)?\s|^\s*(?:آن|این|اون|همین)\s*(?:را|رو)\s|^\s*و\s+\S|^\s*و(?:آن|این|اون|اینم|اونم)(?:\s|$)/;
  /* دورِ ۱۰ (J3، s25 c16): سرِ پرسشیِ بی «؟» با فعلِ ماضیِ نقلیِ دوم‌شخص («حالتِ پایه را جدا وارسی کرده‌ای —») هم بخشی از پرسش است (پرسشِ آری/نه در فارسی
     نشانه‌ای جز آهنگ ندارد)؛ فقط سرِ ستایشی («آفرین، … پیش رفته‌ای —») پیش‌درآمد می‌ماند. دنباله‌ای که با «و» آغاز می‌شود («— و در گامِ استقرا کجا…؟»)
     هم‌پایهٔ سر است، نه پرسشی جدا — بی سرش نیمی از پرسش است. */
  var HEADPERF_RE = /(?:^|\s)ن?(?:کرده|دیده|رفته|گرفته|داشته|نوشته|گذاشته|برده|آورده|رسیده|شنیده|یافته|سنجیده|آزموده|خوانده|زده|فهمیده|ساخته|شمرده|پرسیده|دانسته|توانسته|خواسته|بوده|شده|کشیده|گفته|اندیشیده|بسته|آزمایش\s*کرده)\s*ای(?=$|[\s،,؟?])/, PRAISE_HEAD = /^\s*(?:آفرین|عالی|احسنت|درسته|باشه|خوبه|دمت\s*گرم|بارک\s*الله)(?![آ-ی])/;
  function headQ(h0) { return HEADQ_RE.test(h0) || (HEADPERF_RE.test(h0) && !PRAISE_HEAD.test(h0)); }   // R8 (I-live 9، s25/s29): سرِ پرسشیِ بی «؟» («مجهول دقیقاً چیست —») و دنبالهٔ «و آن از چه…» می‌مانند
  /* دورِ ۱۲ (L5، s29 c23): «کدام پرسش کمک کرد؟» فقط پرسش‌های گفت‌وگو دربارهٔ **همین** مسئله — سشنی که پیش‌تر دربارهٔ چیزِ دیگری بود (مسئلهٔ باغچه) و بعد همین
     مسئله را ساخت (live_new)، فقط از پاسخِ سازنده به بعد؛ سشنی که بعدتر به مسئلهٔ دیگری رفت، فقط تا پیش از آن. لحظهٔ ساخت از خودِ رکورد (r.created، یا زمانِ درونِ شناسه) */
  function bornAt(r) { if (r.created) return String(r.created); var m = /^pb_l_([0-9a-z]+)[0-9a-z]{3}$/.exec(String(r.p.id || "")), n = m ? parseInt(m[1], 36) : NaN; return n > 1e12 && n < 1e14 ? new Date(n).toISOString() : ""; }
  /* (دورِ ۱۴: قاعدهٔ آغاز با N1 ِ پایین جایگزین شد؛ این شرح تاریخچه است) دورِ ۱۳ (M1، s29 c23، s30، s31، s36): یک قاعده برای هر راهی که مسئله موضوعِ سشن می‌شود — پنجرهٔ گفت‌وگوی مسئله از پیامی آغاز می‌شود که همین مسئله
     موضوعِ سشن شد و تا جایی است که سشن به موضوعِ دیگری رفت:
     • پاسخِ دستیاری که کنشش آن را ساخت یا با فرم ساخت/باز کرد (live_new، chat_invent، chat_solved، کلیکِ «ساختن» — بستنِ سشن در نوبتِ دستیار، lprobLog.ai)؛
     • رفتنِ سشن به آن (lprobAt / lprobLog بی نوبتِ دستیار) ⇒ نخستین پیامِ پس از آن؛
     • هیچ‌کدام معلوم نیست ⇒ لحظهٔ ساخت (r.created / زمانِ شناسه).
     مسئله‌ای که با chat_solved ساخته شد پیش از ثبت در همین گفت‌وگو حل و بازنگری شد (قاعدهٔ a27: «پس از بازنگریِ خودش») ⇒ از آغازِ سشن اگر پیش‌تر موضوعی نبود،
     وگرنه از نخستین پیامِ کاربر پس از آن موضوع که همین مسئله را نام برد. مسئلهٔ کنارگذاشته (chat_invent: dormant) موضوعِ سشن نشد ⇒ از پاسخِ سازنده فقط پرسشی
     که خودِ آن مسئله را نام می‌برد. پایان = رفتنِ سشن به مسئلهٔ دیگر (دفترِ lprobLog؛ برای سشنِ کهنهٔ بی دفتر: lprobAt و live_new ِ دیگر). */
  var CREATE_ACTS = ["live_new", "chat_invent", "chat_solved"], OPEN_ACTS = CREATE_ACTS.concat(["click", "go"]);
  function actsHas(m, L) { return !!m && m.role === "ai" && (m.actions || []).some(function (x) { return L.indexOf(x) >= 0; }); }
  function talkM(m) { return !!m && (m.role === "user" || m.role === "ai"); }
  function startAt(MS, t, ai) {
    var k = -1; for (var i = 0; i < MS.length; i++) if (talkM(MS[i]) && MS[i].at && String(MS[i].at) <= t) k = i;   // پیامِ بی زمان (رکوردِ کهنه) با لحظه سنجیده نمی‌شود
    if (k >= 0 && MS[k].role === "ai" && (ai === true || (ai == null && actsHas(MS[k], OPEN_ACTS)))) return k;
    /* بی کنشِ دستیار: نخستین پیامِ هم‌زمان یا پس از آن لحظه (پیامِ هم‌لحظه با رفتن، پس از رفتن نوشته شد) */
    var k2 = -1; for (var i2 = 0; i2 < MS.length; i2++) if (talkM(MS[i2]) && MS[i2].at && String(MS[i2].at) < t) k2 = i2;
    for (var j = k2 + 1; j < MS.length; j++) if (talkM(MS[j])) return j;
    return MS.length;
  }
  function creatIdx(MS, t) { var c = -1; if (t) MS.forEach(function (m, i) { if (actsHas(m, CREATE_ACTS) && m.at && String(m.at) <= t) c = i; }); return c; }
  /* دورِ ۱۴ (N1، s03/s07/s10/s11/s21/s23/s25/s29/s33/s35/s36/s37): یک قاعده، با **مرز** — نه با راهِ ساختن. موضوع‌های سشن = بسته شدن‌هایش (lprobLog؛ سشنِ
     کهنهٔ بی دفتر: lprobAt و live_new ِ دیگر) و ساختنِ همین مسئله در همین سشن (live_new / chat_solved — مسئلهٔ کنارگذاشتهٔ chat_invent موضوع نشد).
     پنجرهٔ P = از دیرترینِ {آغازِ سشن، لحظه‌ای که موضوعِ «دیگرِ» پیشین تمام شد} تا لحظه‌ای که سشن از P رفت. «تمام شد» = پیامِ رفتن: نخستین پیامِ کاربر
     پس از بسته شدنِ سشن به آن موضوعِ دیگر که همین P را نام می‌برد («باغچه تموم شد. حالا حوض: …»)؛ اگر چنین پیامی نیست، خودِ لحظهٔ بسته شدنِ سشن به P
     (startAt). پایانِ P = آغازِ موضوعِ دیگرِ بعدی با همین تعریف. بی موضوعِ دیگرِ پیشین ⇒ آغازِ سشن (پرسش‌های پیش از ساخت/ثبت، به هر راهی، مالِ همین مسئله‌اند). */
  function msgWin(se, r) {
    var MS = se.msgs || [], pid = r.p.id, LG = (se.lprobLog || []).filter(Boolean), t0 = bornAt(r), only = {}, SUB = [], nmC = {};
    var namer = function (p) { if (nmC.hasOwnProperty(p)) return nmC[p]; var x = p === pid ? r : p ? rec(p) : null, pt = x && x.p ? toks([x.p.title, x.p.statement].join(" ")) : [];
      return (nmC[p] = pt.length ? function (m) { return !!m && m.role === "user" && toks(m.text).filter(function (w) { return hit(w, pt); }).length >= 2; } : null); };
    LG.forEach(function (e) { SUB.push({ p: e.p || "", i: startAt(MS, String(e.at || ""), e.ai) }); });
    if (!LG.length) {
      if (se.lprob && se.lprobAt) SUB.push({ p: se.lprob, i: startAt(MS, String(se.lprobAt), null) });
      else if (se.lprob === pid) SUB.push({ p: pid, i: t0 ? startAt(MS, t0, null) : 0 });
      lives().forEach(function (x) { if (x.p.id !== pid && x.sess === se.id && x.by === "assistant" && !x.dormant) { var cx = creatIdx(MS, bornAt(x)); if (cx >= 0) SUB.push({ p: x.p.id, i: cx }); } });
    }
    if (r.sess && se.id === r.sess) {
      var c = creatIdx(MS, t0);
      if (c >= 0 && r.dormant && r.by === "user") only[c] = true;   // chat_invent ِ کنارگذاشته: فقط پاسخِ سازنده، فقط پرسشی که خودِ آن را نام می‌برد
      else if (c >= 0) SUB.push({ p: pid, i: c });
      else if (!SUB.some(function (e) { return e.p === pid; })) SUB.push({ p: pid, i: t0 ? startAt(MS, t0, null) : 0 });
    }
    SUB.forEach(function (e, n) { e.n = n; });
    SUB.sort(function (x, y) { return x.i - y.i || x.n - y.n; });
    var begin = function (k) {
      var e = SUB[k], prev = null; for (var j = k - 1; j >= 0; j--) if (SUB[j].p !== e.p) { prev = SUB[j]; break; }
      if (!prev) return 0;
      var f = e.p ? namer(e.p) : null;
      if (f) for (var u = prev.i + 1; u <= e.i && u < MS.length; u++) if (f(MS[u])) return u;
      return e.i;
    };
    var W = [];
    SUB.forEach(function (e, k) { if (e.p !== pid) return; var nx = -1; for (var j = k + 1; j < SUB.length; j++) if (SUB[j].p !== pid) { nx = j; break; }
      W.push([begin(k), nx < 0 ? MS.length : begin(nx)]); });
    /* پرسشِ پاسخِ سازندهٔ مسئلهٔ کنارگذاشته که خودِ آن را نام می‌برد مالِ همان است، نه موضوعِ جاریِ سشن — «نام بردن» با واژه‌های عنوانش که در عنوانِ
       هم‌زادهای همان پاسخ نیستند (دو مسئلهٔ «… با جمعِ ۱۰» با «جمع» و «۱۰» از هم جدا نمی‌شوند) */
    var DM = lives().filter(function (x) { return x.sess === se.id && x.dormant && x.by === "user"; }).map(function (x) { return { id: x.p.id, c: creatIdx(MS, bornAt(x)), t: toks(x.p.title) }; }).filter(function (x) { return x.c >= 0; });
    var namesD = function (d, q) { var o = DM.filter(function (y) { return y.c === d.c && y.id !== d.id; }).reduce(function (a, y) { return a.concat(y.t); }, []), dt = d.t.filter(function (w) { return !hit(w, o); }), qt = toks(q);
      return dt.length > 0 && dt.filter(function (w) { return hit(w, qt); }).length >= Math.min(2, dt.length); };
    return function (mi, q) {
      var here = q == null ? [] : DM.filter(function (d) { return d.c === mi; });
      if (here.length && here.some(function (d) { return d.id !== pid && namesD(d, q); })) return false;
      if (only[mi]) return q == null || here.some(function (d) { return d.id === pid && namesD(d, q); });
      return W.some(function (w) { return mi >= w[0] && mi < w[1]; });
    };
  }
  /* دورِ ۱۲ (L5، s02/s11): پرسشِ نوبتِ چندجمله‌ایِ صفحه («حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟») که دستیار عیناً گفت
     یک گزینه است، نه دو تکهٔ بی‌مرجع — جمله‌های پیاپیِ پیام که همان جمله‌های پرسشِ شناخته‌شده‌اند (نخستین با پیش‌درآمد یا بی سرِ «… —») یکی می‌شوند */
  var SPLIT_Q = /(?<=[؟?])\s+|\n+|(?<=[.!:])\s+/;
  /* دورِ ۱۳ (M2، s01 c40): دنبالهٔ بازگفته‌ای که به جملهٔ پیشین برمی‌گردد («ردش»، «آن»، «این») همان پرسشِ چندجمله‌ای است — نه گزینهٔ دوم. برگشت = ضمیرِ
     اشاره، ضمیرِ پیوستهٔ جدا («اش»)، یا واژهٔ ضمیردارِ («…ش») همان جملهٔ پرسشِ صفحه */
  var REFBACK_RE = /(?:^|\s)(?:آن|این|اون|همین|همان|اش)(?=$|[\s،,؟?])/;   // دورِ ۱۳؛ از دورِ ۱۴ جایش demBack (پایین)
  /* دورِ ۱۴ (N2، s23): ضمیرِ اشاره فقط وقتی برگشت است که خودش جای اسم نشسته باشد («آن را»، «به همین می‌رسی»، «در آن به …»، پایانِ جمله) — صفتِ اشاره پیش از
     اسم («کجا این شباهت می‌شکند»، «همین ۴.۰۰۵») مرجعش را درونِ همان پرسش دارد؛ آن پرسش خودبسنده است و پیوند نمی‌دهد */
  var DEM_W = ["آن", "این", "اون", "همین", "همان"], DEM_PRON_NEXT = /^(?:را|رو|که|هم|است|هست|نیست|بود|به|از|در|با|برای|تا|چه|چی|یعنی|ن?می)$/;
  function demBack(a) { var w = String(a || "").split(/\s+/).filter(Boolean);
    for (var i = 0; i < w.length; i++) { var c = w[i].replace(/[؟?،,.:!»«]+$/, ""); if (c === "اش") return true; if (DEM_W.indexOf(c) < 0) continue;
      if (c !== w[i] || i === w.length - 1) return true;
      if (DEM_PRON_NEXT.test(w[i + 1].replace(/[؟?،,.:!»«]+$/, ""))) return true; }
    return false; }
  function refsBack(a, kj) { if (demBack(a)) return true; var kw = kj.split(/\s+/).filter(function (w) { return /^[آ-ی]{2,}ش$/.test(w); }); return a.split(/\s+/).some(function (w) { return kw.indexOf(w.replace(/[؟?،,.]+$/, "")) >= 0; }); }
  /* N2: بخشی از جملهٔ خودِ دستیار که همان جملهٔ پرسشِ صفحه است (پس از پیش‌درآمدش) — با واژه‌های خودِ او */
  function ownTail(orig, target, nn) { var o = String(orig || ""); if (nn(o) === target) return txt(o).replace(/^[-•*\d.)\s]+/, "");
    for (var i = 1; i < o.length; i++) if (/\s/.test(o.charAt(i - 1)) && !/\s/.test(o.charAt(i)) && nn(o.slice(i)) === target) return txt(o.slice(i));
    return target; }
  function joinKnown(parts, multi) {
    var nn = function (x) { return norm(txt(x)).replace(/^[-•*\d.)\s]+/, "").replace(/\s+/g, " ").trim(); }, isQp = function (x) { return /[؟?]$/.test(x); }, out = [];
    for (var i = 0; i < parts.length; i++) {
      var hitK = null, used = 0, first = "";
      for (var k = 0; k < multi.length && !hitK; k++) {
        var KP = multi[k].p, n = KP.length;
        var a = nn(parts[i]), f = nn(KP[0]), ft = (/\s[—–]\s([^—–]+)$/.exec(f) || [])[1] || "";
        if (!(a === f || (a.length > f.length && a.slice(-f.length - 1) === " " + f) || (ft.length >= 8 && (a === ft || a.slice(-ft.length - 1) === " " + ft)))) continue;
        /* M2 (دورِ ۱۳، s06): جمله‌های پیاپی همان پرسشِ صفحه‌اند — عینِ جملهٔ صفحه، یا (برای جملهٔ پرسشی) بازگفتِ پرسشی‌ای که به پیشین برمی‌گردد؛ جمله‌های خبریِ
           پایانی («شاید فقط همان یکی…»، «(بعد در صفحه …)») اختیاری‌اند، ولی هیچ جملهٔ پرسشیِ پرسشِ صفحه جا نمی‌ماند. پرسش بودنش از متنِ شناختهٔ صفحه است، نه از «؟» ِ پایانی */
        var m = 1, okK = true;
        for (var j = 1; j < n; j++) {
          var b = i + j < parts.length ? nn(parts[i + j]) : null, kj = nn(KP[j]);
          /* N2 (دورِ ۱۴، s23): بازگفتِ دنباله فقط به جملهٔ **پرسشیِ** پیش از خودش می‌پیوندد — پیش‌درآمدِ خبری («قیاس را به کار بردی:») هرگز با آن یک گزینه نمی‌شود */
          if (b !== null && (b === kj || (isQp(kj) && isQp(b) && isQp(nn(parts[i + j - 1])) && refsBack(b, kj)))) { m = j + 1; continue; }
          if (KP.slice(j).some(function (x) { return isQp(nn(x)); })) okK = false;
          break;
        }
        if (okK && m >= 2) { hitK = multi[k]; used = m; first = a === f || a.slice(-f.length - 1) === " " + f ? f : ft; }
      }
      /* N2 (دورِ ۱۴، s02/s23): گزینه همان جمله‌های خودِ دستیار است (بی پیش‌درآمدِ جملهٔ نخست)؛ پرسشِ صفحه فقط کلید است (یکی کردن و شناسه) */
      if (hitK) { out.push({ q: [ownTail(parts[i], first, nn)].concat(parts.slice(i + 1, i + used).map(function (x) { return txt(x); })).join(" "), k: hitK.q }); i += used - 1; } else out.push(parts[i]);
    }
    return out;
  }
  /* N2 (دورِ ۱۴): هر پرسشِ گفت‌وگو = { t: همان که دستیار پرسید، k: پرسشِ صفحه/فهرستی که با آن یکی است (یا "") } — k فقط برای یکی کردن و شناسه */
  function chatQs(r) { return chatItems(r).map(function (e) { return e.t; }); }
  function chatItems(r) {
    var pid = r.p.id, o = [], s0 = solOf(pgOf(pid)), known = [];
    ["u", "p", "c", "b"].forEach(function (k) { try { phaseQs(r, s0, k).forEach(function (q) { if (known.indexOf(q) < 0) known.push(q); }); } catch (e) { } });
    var XQ = [Q_GUESST, Q_RELUSE, Q_LINK, Q_PARTAUX, Q_ALLD, Q_ONLYANS, Q_LINE, Q_AUXP, Q_BACKW, Q_RESTATE_C, Q_ANALIM, Q_BASE, Q_EQUIV, EQ_FEW, Q_WHOLE, resultQ(r, s0)];
    var multi = known.concat(XQ)
      .map(function (q) { return { q: q, p: String(q).split(SPLIT_Q).filter(function (x) { return txt(x); }) }; }).filter(function (x) { return x.p.length > 1; });
    S.all("achat", function (x) { return x && (x.lprob === pid || (r.sess && x.id === r.sess) || (x.lprobLog || []).some(function (e) { return e && e.p === pid; })); }).forEach(function (se) {
      var MS = se.msgs || [], inW = msgWin(se, r);
      MS.forEach(function (m, mi) { if (!m || m.role !== "ai" || !inW(mi)) return;
        /* H3 (دورِ ۷، s02): پرسشی که کاربر پس از آن پاسخِ واقعی داد (پیامِ بعدیِ او، نه «نمی‌دونم») همیشه در فهرست می‌ماند */
        var nx = MS.slice(mi + 1).filter(function (y) { return y && y.role === "user"; })[0], ansd = !!(nx && txt(nx.text) && !/^\s*(?:نمی\s*(?:دونم|دانم)|نمیدونم|گیر\s*کردم)[.!؟?\s]*$/.test(norm(nx.text)));
        joinKnown(String(m.text || "").split(SPLIT_Q), multi).forEach(function (t) { var whole = !!(t && typeof t === "object"), wk = whole ? t.k : ""; t = whole ? t.q : txt(t).replace(/^[-•*\d.)\s]+/, "");
        /* F7 (دورِ ۵، s01): پیش‌درآمدِ پیش از «—» («ولی بار فقط یک کف نیست — از … استفاده کردی؟») بخشی از پرسش نیست */
        /* G5 (دورِ ۶، s23/s29): فقط پیش‌درآمدِ خبری بریده می‌شود — بخشِ پیش از «—» که خودش بخشی از پرسش است (فعلِ دوم‌شخص، «یا …»، «آیا»)، یا دنباله‌ای
           که بی آن بی‌مرجع است («کدام را اول…؟»)، می‌ماند */
        var tail = whole ? null : /\s[—–]\s([^—–]+[؟?])$/.exec(t), head0 = tail ? norm(t.slice(0, tail.index)) : "";
        /* دورِ ۱۱ (K4، s01): سری که خودش «—» دارد یعنی «—» ِ پیش از دنباله بستنِ یک جملهٔ معترضه است («… مهدکودک — که با دلیل کنار گذاشته بودی — هنوز بی‌ربط
           است؟»): دنباله بی سرش بی‌مرجع است ⇒ پرسش همان کلِ جمله؛ فقط پیش‌درآمدِ ستایشیِ پیش از نخستین «—» بریده می‌شود */
        for (var g0 = 0; g0 < 4; g0++) {
          var paren = !!tail && /\s[—–]\s/.test(" " + head0 + " "), pre0 = paren ? /^([^—–]*?)\s[—–]\s/.exec(t) : null;
          if (pre0 && PRAISE_HEAD.test(norm(pre0[1])) && !headQ(norm(pre0[1]))) { t = txt(t.slice(pre0[0].length)); tail = /\s[—–]\s([^—–]+[؟?])$/.exec(t); head0 = tail ? norm(t.slice(0, tail.index)) : ""; continue; }
          if (!paren && tail && QWORD.test(tail[1]) && txt(tail[1]).length >= 8 && !headQ(head0) && !TAILREF_RE.test(norm(tail[1]))) t = txt(tail[1]);
          break;
        }
        if (!whole) t = t.replace(/^(?:ولی|اما|خب|خوب|آفرین|عالی|باشه|درسته)[،,!.\s]+/, "");
        /* E5: تکهٔ یک پرسشِ شناخته‌شده («از آن چه به کار می‌آید؟») ⇒ همان پرسشِ کامل — H3 (دورِ ۷، s02): پرسشِ شناخته‌شدهٔ فهرست («همهٔ داده‌ها را به کار برده‌ای؟»)
           واژهٔ پرسشی نمی‌خواهد */
        var isQ = whole || (/[؟?]$/.test(t) && QWORD.test(t) && t.length >= 8 && t.length <= 220);
        var kq = whole ? wk : /[؟?]$/.test(t) && t.length >= 8 ? (known.filter(function (q) { return sameQBoth(t, q) || fragOf(t, q) || clauseOf(t, q); /* دورِ ۹ (s28): نگاشتِ پرسشِ گفت‌وگو به پرسشِ فهرست در «کدام پرسش کمک کرد؟» دوسویه است (بیش از نیمِ واژه‌های هر دو، A4) — وگرنه پرسشی که پرسیده نشد جای پرسشِ پرسیده‌شده می‌نشست */ })[0] || (!isQ && XQ.filter(function (q) { return fragOf(t, q); })[0]) || (!isQ && B3_RE.test(norm(t)) ? t : "")) : "";   /* N2 (دورِ ۱۴، s02): جملهٔ عینِ پرسشِ نوبتِ صفحه («نتیجه‌ای گفتی — با واقعیت سنجیدی‌اش؟») پرسش است حتی بی واژهٔ پرسشی — با واژه‌های خودِ دستیار */
        if (!kq && !isQ) return;
        if (!inW(mi, t)) return;   // M1: از پاسخِ سازندهٔ مسئلهٔ کنارگذاشته فقط پرسشی که خودِ آن را نام می‌برد
        /* N2 (دورِ ۱۴، s02/s23/s11 r1): گزینه همان پرسشِ دستیار است، نه متنِ عامِ صفحه — نگاشت (kq) فقط کلیدِ یکی کردن است */
        var key = kq || t, ix = -1; o.forEach(function (e, i) { if ((e.k || e.t) === key || e.t === t) ix = i; });
        if (ix < 0) o.push({ t: t, k: kq || "", a: ansd }); else if (ansd) o[ix].a = true; }); });
    });
    var tailN = o.length - 8;
    return o.filter(function (e, i) { return e.a || i >= tailN; }).map(function (e) { return { t: e.t, k: e.k }; });
  }
  /* پرسش‌هایی که در صفحه پاسخ گرفتند: پرسش‌های کارتِ فهم (مجهول، داده‌ها، شرط، «کافی است؟» — کارت بی آن‌ها ثبت نمی‌شود) + پرسش‌های طرح که پاسخ دادی */
  function pageQs(r, s, pg) {
    var o = [], u = uOf(s), U0 = [];
    try { U0 = phaseQs(r, s, "u"); } catch (e) { U0 = []; }
    usedQs(pg).forEach(function (q) { if (o.indexOf(q) < 0) o.push(q); });
    /* F7 (دورِ ۵، s23): پرسش‌های طرح که در کارت‌های خودشان پاسخ گرفتند هم — «پیش‌تر … دیده‌ای؟» (کارتِ مسئلهٔ مرتبط)، «از خواسته به عقب» (کارتِ کار به عقب)، مسئلهٔ کمکی */
    var L = live(s), PQ = []; try { PQ = phaseQs(r, s, "p"); } catch (e) { PQ = []; }
    var byCard = [[L.seen && L.seen.ans, /پیش\s*تر[^؟?]*دیده/], [L.back, /به\s*عقب/], [L.aux.length, /ساده\s*تر|کمکی/]];
    byCard.forEach(function (bc) { if (!bc[0]) return; var q = PQ.filter(function (x) { return bc[1].test(norm(x)); })[0]; if (q && o.indexOf(q) < 0) o.push(q); });
    if (u) U0.slice(0, 4).forEach(function (q) { if (o.indexOf(q) < 0) o.push(q); });
    return o;
  }
  A.liveChatQs = function (pid) { var r = rec(pid); return r ? chatQs(r) : []; };
  A.liveChatQItems = function (pid) { var r = rec(pid); return r ? chatItems(r) : []; };   // N2: { t: پرسشِ دستیار، k: پرسشِ صفحه/فهرستِ هم‌سان }
  /* R8 (I-live 4، s18): مسئلهٔ فقط‌درگفت‌وگو، گیر در اجرا با داده‌ای که هنوز به کار نرفته ⇒ «همهٔ داده‌ها؟» (و اگر همان را پرسیده بودی، داده با نامش)
     بر سطرِ 🎯 ِ هدف مقدم است (پولیا: «همهٔ داده‌ها را به کار برده‌ای؟» پرسشِ گیرِ اجراست). داده‌ها = عددهای صورتِ مسئله با واژهٔ کنارشان (نه تکه‌ای از
     فرمولِ خودِ کاربر)؛ «به کار رفته» = همان عدد در پیام‌های بعدیِ کاربر (نه پیامی که خودِ صورت را آورد). بی دادهٔ به‌کارنرفته ⇒ "" (سطرِ هدف می‌ماند). */
  var OPR = /[=+*×·÷^²³√π⅓½¼()]/;
  function stmtData(stmt) {
    var w = String(stmt || "").split(/\s+/).filter(Boolean), o = [], seen = {};
    w.forEach(function (x, i) {
      if (!/^[0-9۰-۹]+(?:[.٫/][0-9۰-۹]+)?[^0-9۰-۹]{0,3}$/.test(x) || OPR.test(x) || OPR.test(w[i - 1] || "") || OPR.test(w[i + 1] || "")) return;
      var n = numTok(x)[0]; if (!n || seen[n]) return; seen[n] = 1;
      o.push({ n: n, t: [w[i - 1] || "", x, (w[i + 1] || "").replace(/[،,.؛:؟?!]+$/, "")].join(" ").replace(/[،,.؛:؟?!]+(?=\s|$)/g, "").trim() });
    });
    return o;
  }
  A.liveChatStuckQ = function (stmt, texts, lastAi) {
    var D = stmtData(stmt); if (!D.length) return "";
    var st = toks(stmt), isStmt = function (t) { var tt = toks(t); return st.length >= 4 && st.filter(function (x) { return hit(x, tt); }).length >= Math.ceil(st.length * 0.6); };
    var T = (texts || []).filter(function (t) { return t && !/^\s*\[سامانه/.test(String(t)) && !isStmt(t); }).join("\n"), N = numTok(T);
    var un = D.filter(function (d) { return N.indexOf(d.n) < 0; }); if (!un.length) return "";
    return B3_RE.test(norm(lastAi || "")) ? "دادهٔ «" + clip(un[0].t, 60) + "» را کجا به کار برده‌ای؟ اگر هنوز نه، در کدام گام جا دارد؟" : Q_ALLD;
  };
  A.livePageQs = function (pid) { var r = rec(pid); if (!r) return []; var pg = pgOf(pid); return pageQs(r, solOf(pg), pg); };   // گزینه‌های «کدام پرسش کمک کرد؟» (پرسش‌های پاسخ‌گرفته در صفحه)
  /* ---------- بازنگری بر حسبِ نوع (دورِ ۲ ِ تور؛ R2/R5/R8) ----------
     • قانون یا رابطهٔ تجربی (عملی/زندگی): دامنه و حالتِ حدی (A150، «دامنه را باریک کن»)؛ دادهٔ وابسته به مجهول: یکنوایی (A151)؛ فضایی: حالتِ حدی هم.
     • کامل‌بیان‌شده: کلِ شرط (B086) با نامِ بخش‌های به‌کارنرفته؛ تبدیل‌ها هم‌ارز بودند؟ (B009)؛ اثباتی: همهٔ فرض (B095)، قاعدهٔ پاسکال (B060)، نتیجه = حکم،
       و برهانِ غیرمستقیم ⇐ مستقیم (C064/C067).
     • صداقتِ بستن (R5): بازنگری‌ای که ایراد یافت (وارسی «ایرادی یافتم»، بخشی از فرض به کار نرفت، نتیجه ≠ حکم، تبدیلِ ناهم‌ارز) نمی‌تواند «حل شد» ثبت کند —
       مسئله «ناتمام» می‌ماند و به مرحله‌ای که خودت می‌گویی برمی‌گردد؛ «حدسم نادرست بود» ⇒ «چرا شهودت خطا رفت؟»؛ سلیقه (C120)؛ پیش‌نویس با بستنِ صفحه نمی‌رود. */
  /* G5 (دورِ ۶، s01): «قانون» یعنی رابطهٔ تجربیِ یافته (برابری/تناسب) — معیارِ نابرابریِ خودت («پرداخت / درآمد ≤ ۰٫۴») قانون نیست */
  /* H3 (دورِ ۷، s01): «قانون/رابطه‌ای که یافتی» فقط برای مسئلهٔ عملی‌ای که خواسته‌اش کمیت یا رابطه است — نه تصمیم/انتخاب میانِ گزینه‌ها (و هرگز زندگی):
     «=» در مقدمهٔ یک گامِ تصمیم («= ۷ سال») قانونِ یافته نیست */
  var CHOICE_RE = /انتخاب|گزینه|تصمیم|کدوم\s*بهتر|کدام\s*بهتر|بهترین|(?:^|\s)[بن][ء-یپچژکگ]{1,12}م\s+یا\s+\S/;
  var LAW_RE = /قانون|فرمول|خطی|نمایی|متناسب|نسبت\s*مستقیم|رابطه\s*(?:ی\s*)?(?:بین|میان|خطی|ریاضی|عددی)|[a-z]\s*(?<![<>≤≥!])=(?!=)|(?<![<>≤≥!])=\s*[0-9a-z]/;
  var TRANSF_RE = /توان\s*(?:دو|2)|به\s*توان|مربع\s*(?:کرد|کن|می|گرفت)|جذر|رادیکال|ضرب\s*(?:کرد[ء-ی]*\s*)?در\s*[a-zء-ی(]|تقسیم\s*(?:کرد[ء-ی]*\s*)?بر\s*[a-zء-ی(]|\^\s*2|²|طرفین/;
  /* G6 (دورِ ۶، s25): «توانِ دو» ِ نمادین در اتحادی که فقط ساده می‌شود («n(n+2)+1 = (n+1)^2»، دو سو برابر برای هر مقدار) تبدیلِ شرط نیست — جوابی
     زائد نمی‌آورد و گم نمی‌کند؛ فقط وقتی معادله‌ای با توان اتحاد نیست (یا فعلِ تبدیل آمده: «مربع کردم»، «طرفین»، «ضرب در …») پرسشِ هم‌ارزی می‌آید */
  var TRANSF_SYM = /توان\s*(?:دو|2)|به\s*توان|\^\s*2|²/g;
  function isIdent(c) {
    var sd = c.split("=").map(function (x) { return x.trim(); }).filter(Boolean); if (sd.length < 2) return false;
    var P = sd.map(eqParse); if (P.some(function (x) { return !x; })) return false;
    var vs = []; P.forEach(function (x) { x.vars.forEach(function (v) { if (vs.indexOf(v) < 0) vs.push(v); }); });
    return [0.37, 1.91, 4.63].every(function (o) { var e = {}; vs.forEach(function (v, i) { e[v] = 1.7 + 0.61 * i + o; }); var a = P[0].f(e); return isFinite(a) && P.every(function (x) { var b = x.f(e); return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a)); }); });
  }
  function transfIn(t) {
    var x = norm(t); if (!TRANSF_RE.test(x)) return false;
    if (TRANSF_RE.test(x.replace(TRANSF_SYM, " "))) return true;
    var eqs = (x.replace(/²/g, "^2").match(EQ_CHUNK) || []).filter(function (c) { return /=/.test(c) && /\^/.test(c); });
    return !eqs.length || eqs.some(function (c) { return !isIdent(c); });
  }
  A.liveTransf = transfIn;
  var INDIRECT_RE = /خلف|تناقض|فرض\s*(?:کن|کنیم|می\s*کنیم)\s*(?:که\s*)?[^.؟]{0,40}نباشد|غیرمستقیم|غیر\s*مستقیم|برعکس\s*فرض/;
  var HIT_OPTS = ["درست بود", "تاحدی", "نادرست بود"];
  var BACK_TO = [["c", "اجرا — گامی را درست یا کامل می‌کنم"], ["p", "طرح — راهِ دیگری لازم است"], ["u", "فهم — مسئله را بد فهمیده بودم"]];
  var BACK_TO_FA = { c: "اجرا", p: "طرح", u: "فهمِ مسئله" };
  var LPOD = [["ok", "تأیید شد — شواهد با فرضیه خواند"], ["ref", "رد شد — شواهد خلافش را نشان داد"], ["unk", "هنوز نامعلوم — شواهدم ناکافی است"]];
  /* F5 (دورِ ۵، s29): «بیش از یک جواب» یعنی شرط مجهول را معین نکرد — تا همه یافته نشده‌اند یا شرط کامل نشده، «اثبات شد» نیست */
  var MULTI_ALL = [["all", "بله — همه را یافتم و نشان دادم جوابِ دیگری نیست"], ["completed", "شرط را کامل کردم — حالا جواب یکتاست"], ["no", "نه هنوز — همه را نیافته‌ام"]];
  var EQUIV = [["eq", "بله — هر تبدیل در هر دو جهت درست است (هم‌ارز)"], ["check", "یک‌سویه بود — هر جواب را در شرطِ اصلی جای‌گذاری و وارسی کردم"], ["no", "نه — ممکن است جوابِ زائد آمده یا جوابی گم شده باشد"]];
  function lbFlags(r, s) {
    var L = live(s), u = uOf(s) || {}, nat = natOf(s, r), ty = typeOf(r, s);
    var all = norm(L.steps.map(function (x) { return [x.text, x.proof, x.prem, x.base, x.out && x.out.what].join(" "); }).concat([L.plan && L.plan.t, u.prac && u.prac.measure]).join(" "));
    /* D1: وارسیِ برهان (همهٔ فرض، نتیجه = حکم) فقط برای حکمی که داورش برهان است — «اثبات یا رد کن» ِ زندگی برهان ندارد */
    var prf = (ty === "prove" || ty === "pod") && nat === "objective";
    /* F5 (دورِ ۵، s05): «اثبات یا رد کن» ِ زندگی (فرضیه) برهان ندارد ولی سرانجام دارد — تأیید شد / رد شد / هنوز نامعلوم، با سنجشِ هر بخشِ فرضیه */
    return { nat: nat, ty: ty, obj: nat === "objective", proof: prf, pod: ty === "pod" && prf, lpod: ty === "pod" && !prf, spatial: spatialOf(s, r), dep: u.dep || "",
      law: nat === "practical" && !CHOICE_RE.test(norm([r.p.statement, u.u].join(" "))) && LAW_RE.test(norm(L.steps.map(function (x) { return [x.text, x.proof, x.prem, x.base, x.out && x.out.what].join(" "); }).concat([L.plan && L.plan.t, u.prac && u.prac.measure]).join(" "))), transf: nat === "objective" && transfIn(all),
      /* E5 (دورِ ۴، s11): «غیرمستقیم ⇐ مستقیم» برای هر گامِ برهان‌شکل در مسئلهٔ کامل‌بیان‌شده، نه فقط «اثباتی/اثبات یا رد کن» */
      indirect: nat === "objective" && INDIRECT_RE.test(all),
      /* E5 (دورِ ۴، s01/s09): نتیجه با تک‌تکِ بخش‌های ثبت‌شدهٔ شرط سنجیده می‌شود («اثبات یا رد کن» سرانجامِ خودش را دارد) */
      parts: ty === "pod" && prf ? [] : condParts(s),
      cond: nat === "objective" ? condUsed(s).filter(function (x) { return !x.used; }) : [],
      /* A5: «داده بازه دارد» = دادهٔ عددی یا نمادی (کمیتی که می‌تواند به صفر یا بی‌نهایت برود)، یا مسئلهٔ فضایی؛ برای برهانِ «اثباتی» حالت‌های پایه/مرزی در خودِ BACK_PROVE است */
      /* E4 (دورِ ۴، s21): حالتِ حدی فقط برای یافتنیِ کامل‌بیان‌شده با دادهٔ عددی/نمادی (یا فضایی) — نامِ خانه‌های شطرنج («f6»، «b1») داده نیست */
      limit: spatialOf(s, r) || (ty === "find" && nat === "objective" && dataOf(s).concat([{ t: u.u }]).some(function (x) { var t0 = norm(x.t).replace(/(?:^|[^a-z0-9])[a-z]{1,2}[0-9]{1,2}(?=$|[^a-z0-9])/g, " "); return /[0-9]|(?:^|[^a-z])[a-z](?:$|[^a-z])/.test(t0); })),
      depNo: ty === "find" && u.dep === "" };
  }
  function lbDefect(d, F) { return d.chkRes === "ایرادی یافتم" || (F.proof && (d.hyp === "notall" || d.concl === "diff")) || (F.transf && d.equiv === "no") || (F.pod && d.pod === "gap") || cpNo(d, F); }
  /* E5: هر «نه» در سنجشِ بخش‌های شرط ⇒ ناتمام (هرگز «سالم») */
  function cpNo(d, F) { return !F.lpod && (F.parts || []).some(function (x, i) { return d.cp && d.cp[i] === "no"; }); }
  function cpRange(d, F) { return (F.parts || []).some(function (x, i) { return d.cp && d.cp[i] === "range"; }); }
  function cpImp(d, F) { return (F.parts || []).some(function (x, i) { return d.cp && d.cp[i] === "imp"; }); }
  var NEG_PART = /(?:^|\s)(?:نه|نیست|نبود|نشد|نرسید|نمی\s*رسد|نمی\s*رسه|نرسیده|برقرار\s*نیست|نقض|کمتر\s*از|بیشتر\s*از|نه\s*[0-9])(?=\s|$|[.,،؛])/;
  /* F5 (دورِ ۵، s01/s09): پیش‌تر mentions() هر بندی را که «نه» داشت کنار می‌گذاشت — یعنی همان بندی که باید سنجیده شود؛ پس هشدار هرگز نمی‌آمد.
     حالا سه راه، هر کدام فقط «چالشِ نرم» (کاربر داور است): (۱) بندی که بیش از نیمِ واژه‌های بخش را دارد (A4) و نفی/«نرسید» می‌گوید؛ (۲) بندی که عددِ
     همان بخش را دارد و نفی می‌کند («۵ ساله است نه ۷ ساله»، «به ۲۰ نرسید»)؛ (۳) بخش کرانه‌ای عددی با واحد دارد («دست‌کم ۲۰ میلیون»، «تا ۷ سال … نکنه»)
     و وارسی عددی با همان واحد می‌گوید که بیرونِ آن است («۱۷٫۵ میلیون»، «۵ ساله»). */
  function numsOf(t) { var o = [], re = /(\d+(?:[.٫/]\d+)?)\s*(?:٪|درصد)?\s*([ء-یپچژکگa-z]{2,})?/g, m, x = norm(t).replace(/٬/g, ""); while ((m = re.exec(x))) o.push({ v: parseFloat(m[1].replace("٫", ".").replace("/", ".")), u: m[2] || "", at: m.index, end: re.lastIndex }); return o; }
  /* F7 (دورِ ۵، s02): تقریبِ «بس» در برابرِ فاصلهٔ واقعی — هر دو عدد با واحد (عددِ واژه‌ای هم: «نیم سانت»، «یک سانت»). اگر فاصله‌ای که در واقعیت دیدی
     («نیم سانت جا کم بود») از تقریبی که بس دانستی («تا یک سانت») کوچک‌تر است، آن تقریب جواب را معین نمی‌کند — چالشِ نرم، داوری با خودت. */
  var NUMW = { "نیم": "0.5", "یک": "1", "یه": "1", "دو": "2", "سه": "3", "چهار": "4", "پنج": "5", "شش": "6", "هفت": "7", "هشت": "8", "ده": "10" };
  var MUNIT = /^(?:سانت|سانتی|متر|میلی|کیلو|گرم|لیتر|دقیقه|ساعت|روز|تومان|تومن|ریال|میلیون|هزار|درجه)/, MARGIN_W = /فاصله|حاشیه|اختلاف|فرق|جا\s|کمتر|بیشتر|کم\s*(?:بود|آمد|اومد|شد)|زیاد\s*(?:بود|آمد|شد)|دقت/;
  function wnum(t) { return norm(t).replace(/(^|\s)(نیم|یک|یه|دو|سه|چهار|پنج|شش|هفت|هشت|ده)(?=\s+[ء-یپچژکگ])/g, function (m, a, w) { return a + NUMW[w]; }); }
  function approxVsMargin(approx, texts) {
    var T = numsOf(wnum(approx)).filter(function (n) { return MUNIT.test(n.u); })[0]; if (!T) return null;
    var hitM = null;
    (texts || []).forEach(function (t) { String(t || "").split(/[.؛;\n،]/).forEach(function (cl) { if (hitM || !MARGIN_W.test(norm(cl) + " ")) return;
      numsOf(wnum(cl)).forEach(function (n) { if (!hitM && sameUnit(n.u, T.u) && n.v < T.v) hitM = { m: n.v, u: n.u, tol: T.v }; }); }); });
    return hitM;
  }
  A.liveApproxMargin = approxVsMargin;
  function sameUnit(a, b) { if (!a || !b) return false; var x = stem(a), y = stem(b); return x === y || (Math.min(x.length, y.length) >= 3 && (x.indexOf(y) === 0 || y.indexOf(x) === 0)); }
  var LOW_W = /(?:≥|>=|دست\s*کم|حداقل|لااقل|کم\s*کم|بیش\s*از|بیشتر\s*از|بالای|بالاتر\s*از)\s*$/, UP_W = /(?:≤|<=|حداکثر|نهایتا|نهایتاً|کمتر\s*از|زیر|تا)\s*$/, NEG_V = /(?:^|\s)(?:نشه|نشود|نباشد|نباشه|نره|نرود|نکنه|نکند|نکنیم|نکنم|نگذره|نگذرد|نرسه|نرسد)(?=\s|$|[.,،؛])/;
  function partBounds(part) {
    var x = norm(part), out = [];
    numsOf(part).forEach(function (n) { var pre = x.slice(Math.max(0, n.at - 16), n.at), lo = LOW_W.test(pre), up = UP_W.test(pre); if (!lo && !up) return;
      if (NEG_V.test(x.slice(n.end))) { var t0 = lo; lo = up; up = t0; }   // «بیشتر از ۴۰٪ … نشه» = کرانهٔ بالا؛ «تا ۷ سال اسباب‌کشی نکنه» = کرانهٔ پایین
      out.push({ v: n.v, u: n.u, lo: lo, up: up }); });
    return out;
  }
  function partNegated(chk, part) {
    var pt = toks(part), pn = numsOf(part).map(function (n) { return n.v; }), B = partBounds(part);
    return String(chk || "").split(/[.؛;\n،]/).some(function (cl) {
      var x = norm(cl), tt = toks(cl); if (!tt.length) return false;
      var neg = NEG_PART.test(x) || NEG_V.test(x);
      if (neg && pt.length && pt.filter(function (w) { return hit(w, tt); }).length * 2 > pt.length) return true;   // A4: بیش از نیم
      var cn = numsOf(cl);
      if (neg && cn.some(function (n) { return pn.indexOf(n.v) >= 0; })) return true;
      return cn.some(function (n) { return B.some(function (b) { return sameUnit(n.u, b.u) && ((b.lo && n.v < b.v) || (b.up && n.v > b.v)); }); });
    });
  }
  A.livePartNegated = partNegated;
  A.liveLookFlags = function (pid) { var r = rec(pid); return r ? lbFlags(r, solOf(pgOf(pid))) : null; };
  function lookBack(r, pg, s) {
    var pid = r.p.id, L = live(s), ab = L.state === "abandoned", g = s.g && s.g[1], F = lbFlags(r, s);
    var d = BKD[pid] = BKD[pid] || (L.bDraft ? JSON.parse(JSON.stringify(L.bDraft)) : { chkHow: "", chkRes: "", other: "", glance: "", use: "", worked: "", best: "", tool: "", newProb: "", newShare: "", newWhy: "", hit: "", hitWhy: "", taste: "", why: "", src: "", gain: "", unused: {} });
    d.unused = d.unused || {};
    var dTimer = null;
    function saveNow() { if (BKD[pid] !== d) return; L.bDraft = JSON.parse(JSON.stringify(d)); S.put(pg); }
    function saveDraft() { if (dTimer) clearTimeout(dTimer); dTimer = setTimeout(function () { dTimer = null; saveNow(); }, 350); }
    function rer() { if (dTimer) { clearTimeout(dTimer); dTimer = null; } saveNow(); A.render(); }
    var un = unusedOf(s, pg);
    var box = h("section", own({ class: "card lp-lb" }), h("div", { class: "eyebrow" }, ab ? "کنار گذاشتنِ آگاهانه" : "پس از حل"),
      h("h3", {}, ab ? "کنار می‌گذاری — با دلیل، بی شرم" : "بازنگری: نتیجه و راه را وارسی کن"),
      h("p", { class: "small" }, ab ? "رها کردنِ آگاهانه جایز است — مثلِ «🌱»: با دلیل، و یک بار بعدتر می‌پرسد «هنوز همان دلیل را قبول داری؟». آنچه تا این‌جا به دست آمد هم درس است." :
        "مهم‌ترین بخشِ کار همین نگاه به راه‌حلِ تمام‌شده است (C115) — و هیچ مسئله‌ای کاملاً تمام نمی‌شود (A138). درسِ تو یک کارتِ مرور می‌سازد، و مسئلهٔ تازه‌ای که از این می‌سازی چند روز بعد برای حل برمی‌گردد. اگر وارسی ایرادی یافت، مسئله «حل شد» ثبت نمی‌شود — ناتمام می‌ماند و برمی‌گردی."));
    var u0 = uOf(s); if (u0 && u0.why) box.appendChild(h("p", { class: "small muted lp-bwhy0" }, "در آغاز نوشتی چرا می‌خواهی حلش کنی: «" + u0.why + "»"));
    box.appendChild(selF("lpBWant", "در پایان، آن خواستن نسبت به آغاز چطور است؟", WANT, d.want || "", function (v) { d.want = v; }));
    var unk0 = unknownData(s, pg); if (unk0.length) box.appendChild(h("p", { class: "small warnline lp-bunk" }, "در طرح گفتی نمی‌دانی این‌ها کجا به کار می‌آیند و هنوز به کار نرفته‌اند: " + unk0.map(function (x) { return "«" + clip(x.t, 50) + "»"; }).join("، ") + " — پایین بگو چرا."));
    if (ab) {
      box.appendChild(field("lpBWhy", "چرا کنارش می‌گذاری؟ (دلیلِ خودِ مسئله)", d.why, function (v) { d.why = v; }, 2));
      box.appendChild(selF("lpBSrc", "این دلیل از کجاست؟", DROPSRC, d.src, function (v) { d.src = v; }));
      box.appendChild(field("lpBGain", "تا این‌جا چه به دست آمد؟ (حتی «فهمیدم کدام راه کار نمی‌کند»)", d.gain, function (v) { d.gain = v; }, 0));
    } else {
      box.appendChild(field("lpBChk", "نتیجه را وارسی می‌کنی؟ چطور — با یک واقعیت، عدد، نظرِ کسی، یا حالتِ خاص؟", d.chkHow, function (v) { d.chkHow = v; }, 2));
      box.appendChild(selF("lpBRes", "نتیجهٔ وارسی", ["نتیجه سالم ماند", "ایرادی یافتم", "نتوانستم وارسی کنم"], d.chkRes, function (v) { d.chkRes = v; rer(); }));
      if (F.parts.length) {
        d.cp = d.cp || {};
        var cpf = h("fieldset", { class: "col gap lp-bparts" }, h("legend", {}, F.ty === "prove" ? "برهانت هر بخشِ حکم را نشان می‌دهد؟" : F.lpod ? "شواهدت را با هر بخشِ فرضیه بسنج" : "نتیجه را با هر بخشِ شرطی که در فهم نوشتی بسنج"));
        /* F5 (دورِ ۵، s11): ثابت کردنِ «جوابی نیست» هم نتیجه است — گزینهٔ «ناممکن» برای هر بخش (پیش‌تر پاسخِ راستِ «نه» ایراد ثبت می‌کرد و تنها راهِ بستن «بله» ِ خلافِ معنا بود) */
        var CPO = F.lpod ? [["yes", "شواهد این بخش را تأیید کرد"], ["no", "شواهد این بخش را رد کرد"], ["unk", "نامعلوم — شاهدِ کافی ندارم"]]
          : F.ty === "prove" ? [["yes", "بله"], ["no", "نه — برآورده نمی‌کند"]] : [["yes", "بله"], ["no", "نه — برآورده نمی‌کند"], ["imp", "جوابی نیست — ثابت کردم این شرط‌ها با هم برآوردنی نیستند"]];
        /* G6 (دورِ ۶، s09): مسئلهٔ عملی گاهی جوابِ صادقانه‌اش بازه است یا «با این داده‌ها هدف دست‌نیافتنی است» — این هم جواب است (پولیا: جوابِ شرطی)،
           نه ایرادی که باید به طرح برگردد؛ با دلیلِ خودت */
        if (!F.lpod && !F.obj && F.ty === "find") CPO = CPO.concat([["range", "جوابِ صادقانه بازه است، یا با این داده‌ها دست‌نیافتنی است — دلیلش را می‌نویسم"]]);
        F.parts.forEach(function (pt, i) {
          cpf.appendChild(selF("lpBCP_" + i, "«" + clip(pt, 90) + "» — " + (F.ty === "prove" ? "برهانت این بخش را نشان می‌دهد؟" : F.lpod ? "شواهدت دربارهٔ این بخش چه می‌گوید؟" : "نتیجه این بخش را برآورده می‌کند؟"), CPO, d.cp[i] || "", function (v) { d.cp[i] = v; rer(); }));
          if (d.cp[i] !== "no" && d.cp[i] !== "imp" && d.cp[i] !== "range" && !F.lpod && partNegated(d.chkHow, pt)) cpf.appendChild(h("p", { class: "small warnline lp-bpneg", "data-part": i }, "وارسی‌ات دربارهٔ همین بخش «نه/نرسید» می‌گوید — نتیجه آن را برآورده می‌کند؟"));
        });
        box.appendChild(cpf);
        if (cpRange(d, F)) box.appendChild(field("lpBRangeW", "جوابِ بازه‌ای یا «دست‌نیافتنی»: بازه چیست، یا چرا با این داده‌ها نمی‌رسد؟ (با عدد یا شاهدِ خودت)", d.rangeW || "", function (v) { d.rangeW = v; }, 0));
      }
      if (F.lpod) box.appendChild(selF("lpBPodL", "سرانجامِ فرضیه — با شواهدِ واقعیت (نه برهان):", LPOD, d.podL || "", function (v) { d.podL = v; rer(); }));
      box.appendChild(prov("b"));
      box.appendChild(field("lpBOther", "از راهِ دیگری هم به همین می‌رسیدی؟ چطور؟", d.other, function (v) { d.other = v; }, 0));
      box.appendChild(field("lpBGlance", "کلِ حل را در یک نگاه (یک جمله) ببین", d.glance, function (v) { d.glance = v; }, 0));
      box.appendChild(field("lpBWorked", "چه چیزی خوب کار کرد — و چطور دوباره همین‌قدر خوب عمل کنی؟", d.worked, function (v) { d.worked = v; }, 0));
    }
    if (!ab && F.spatial) {
      box.appendChild(h("h4", {}, "وارسیِ شکل و اندازه"));
      box.appendChild(field("lpBSym", "تقارن: داده‌هایی که در مسئله نقشِ یکسان دارند، در نتیجه هم نقشِ یکسان دارند؟ (جابه‌جایشان کن — نتیجه عوض می‌شود؟)", d.sym || "", function (v) { d.sym = v; }, 0));
      box.appendChild(field("lpBUnits", "واحد و بُعد: اگر همهٔ اندازه‌ها را با واحدِ دیگری بسنجی، نتیجه درست می‌ماند؟ بُعدِ دو طرف یکی است (طول با طول، مساحت با مساحت)؟", d.units || "", function (v) { d.units = v; }, 0));
      /* A13 (s02): صورتِ حرفی و انتقال — نتیجه را با حرف‌ها بنویس تا وارسی‌های بالا ممکن شوند؛ همان روش برای کمیتِ دیگر (زاویه، حجم) */
      box.appendChild(field("lpBLetter", "صورتِ حرفی (اختیاری): نتیجه را با حرف‌ها (a، b، c …) به‌جای عددها بنویس — حالا تقارن، بُعد و حالتِ حدی را روی همین فرمول ببین.", d.letter || "", function (v) { d.letter = v; }, 0));
      box.appendChild(h("p", { class: "small muted lp-btransfer" }, "انتقال: همین روش (یا همین نتیجه) برای کمیتِ دیگری هم کار می‌کند — مثلاً به‌جای طول، زاویه؛ به‌جای مساحت، حجم؟ اگر آری، همان را پایین «مسئلهٔ تازه» کن."));
    }
    /* A5 (دورِ ۳، s26): حالتِ حدی (A150) برای هر مسئله‌ای که داده‌اش اندازه/عدد دارد (بازه دارد)، نه فقط فضایی */
    if (!ab && F.limit) box.appendChild(field("lpBLimit", "حالتِ حدی (A150): اگر یکی از اندازه‌ها به صفر برسد یا خیلی بزرگ شود (یا دو داده برابر شوند)، نتیجه‌ات همان را می‌گوید که باید؟", d.limit || "", function (v) { d.limit = v; }, 0));
    /* A13 (s07): «نه — داده‌ها ثابت‌اند» ِ فهم پس از حل دوباره سنجیده می‌شود؛ اگر حالا وابسته است، یکنوایی پرسیده می‌شود */
    if (!ab && F.depNo) {
      /* E8 (s-B، ردهٔ d): پرسش و گزینه‌ها هم‌جهت — «بله» یعنی بله (پیش‌تر «نه» با مقدارِ yes گیج می‌کرد) */
      box.appendChild(selF("lpBDep", "در فهم گفتی هیچ داده‌ای با مجهول عوض نمی‌شود. حالا که نتیجه را دیدی: داده‌ای هست که با مجهول عوض شود؟", [["no", "نه — داده‌ها ثابت ماندند"], ["yes", "بله — داده‌ای با مجهول عوض شد"]], d.depAgain || "", function (v) { d.depAgain = v; rer(); }));
      if (d.depAgain === "yes") box.appendChild(field("lpBMono", "کدام داده، و وقتی آن بیشتر شود نتیجه‌ات در جهتِ درست عوض می‌شود؟ (یکنوایی، A151)", d.mono || "", function (v) { d.mono = v; }, 0));
    }
    if (!ab && F.dep) box.appendChild(field("lpBMono", "یکنوایی (A151): گفتی «" + clip(F.dep, 80) + "» — وقتی آن بیشتر شود، نتیجه‌ات در جهتِ درست عوض می‌شود؟", d.mono || "", function (v) { d.mono = v; }, 0));
    if (!ab && F.law) box.appendChild(field("lpBLaw", "قانون یا رابطه‌ای که یافتی در کدام دامنه آزموده شد — و در حالتِ حدی (صفر، خیلی بزرگ) چه می‌گوید؟ دامنه را تا جایی که داده داری باریک کن.", d.law || "", function (v) { d.law = v; }, 0));
    if (!ab && F.nat === "practical") {
      var asd = asideMap(s), asl = dataOf(s).filter(function (x) { return asd[x.id]; });
      box.appendChild(h("h4", {}, "وارسیِ مسئلهٔ عملی"));
      if (asl.length) box.appendChild(h("p", { class: "small lp-basides" }, "آنچه با دلیل بیرون گذاشتی: " + asl.map(function (x) { return "«" + clip(x.t, 50) + "» (" + clip(asd[x.id], 60) + ")"; }).join("، ")));
      if (u0 && u0.prac && u0.prac.approx) box.appendChild(h("p", { class: "small muted" }, "تقریبی که بس دانستی: «" + u0.prac.approx + "»"));
      var avm = u0 && u0.prac && u0.prac.approx ? approxVsMargin(u0.prac.approx, [d.approx, d.chkHow].concat(L.steps.map(function (x) { return x.out && x.out.what; }))) : null;
      if (avm) box.appendChild(h("p", { class: "small warnline lp-bapproxm" }, "تقریبی که بس دانستی (" + fa(avm.tol) + " " + avm.u + ") از فاصلهٔ واقعی (" + fa(avm.m) + " " + avm.u + ") درشت‌تر است — با این تقریب جواب معین نمی‌شود؛ تقریب واقعاً بس بود؟"));
      box.appendChild(field("lpBApprox", "تقریبت بس بود؟ آنچه بیرون گذاشتی اثرِ محسوسی نشان داد؟ (در واقعیت چه دیدی)", d.approx || "", function (v) { d.approx = v; }, 2));
      /* E8 (s23): واحد و بُعد در بازنگریِ مسئلهٔ عملی هم (A152) */
      if (!F.spatial) box.appendChild(field("lpBUnits", "واحد و بُعد: دو سوی هر رابطه‌ات هم‌واحدند؟ اگر همه را با واحدِ دیگری بسنجی، نتیجه درست می‌ماند؟", d.units || "", function (v) { d.units = v; }, 0));
    }
    if (!ab && F.cond.length) box.appendChild(h("div", { class: "card soft col gap lp-bcond" }, h("p", { class: "small warnline" }, "از کلِ شرط استفاده کردی؟ (B086) این بخش‌ها در هیچ گام یا طرحی نیامدند: " + F.cond.map(function (x) { return "«" + clip(x.t, 60) + "»"; }).join("، ")),
      field("lpBCond", "هر کدام کجا به کار رفت — یا چرا لازم نبود؟", d.cond || "", function (v) { d.cond = v; }, 0)));
    if (!ab && F.transf) box.appendChild(selF("lpBEquiv", "در حل شرط یا معادله را تبدیل کردی (توانِ دو، ضرب یا تقسیم در عبارتِ متغیر…): شرطِ تازه هم‌ارزِ شرطِ اصلی بود؟ (B009)", EQUIV, d.equiv || "", function (v) { d.equiv = v; rer(); }));
    if (!ab && F.proof) {
      box.appendChild(h("h4", {}, "وارسیِ برهان"));
      /* A10 (دورِ ۳، s03/s38): در «اثبات یا رد کن» دو چیز هست — حکمی که سنجیده شد و ردِ تو. پرسش‌ها اول می‌پرسند کدام شد، بعد دربارهٔ همان می‌پرسند
         (پیش‌تر «همهٔ فرض به کار رفت؟» دربارهٔ حکمِ ردشده پرسیده می‌شد و پاسخِ راست «ایراد» ثبت می‌کرد) */
      var podR = F.pod && d.pod === "refuted";
      /* E5 (دورِ ۴، s27): گزینهٔ سوم — «هیچ‌کدام: استدلالم شکاف دارد» ⇒ ناتمام (پیش‌تر برای ثبتِ ایراد باید «ثابت/رد کردم» برگزیده می‌شد) */
      if (F.pod) box.appendChild(selF("lpBPod", "سرانجامِ «اثبات یا رد کن»: حکم را ثابت کردی یا رد کردی؟", [["proved", "ثابت کردم — حکم درست است"], ["refuted", "رد کردم — حکم نادرست است (مثالِ نقض یا برهانِ خلاف)"], ["gap", "هیچ‌کدام — استدلالم شکاف دارد"]], d.pod || "", function (v) { d.pod = v; rer(); }));
      if (!(F.pod && d.pod === "gap")) {
      box.appendChild(selF("lpBHyp", podR ? "ردِ تو (مثالِ نقض) همهٔ فرضِ حکم را برآورده می‌کند؟ (مثالی که بخشی از فرض را ندارد، حکم را رد نمی‌کند)" : "همهٔ فرض به کار رفت؟ (B095: هر بندِ فرض باید برای حکم لازم باشد)", podR ? [["all", "بله — همهٔ فرض در مثالم برقرار است و حکم نه"], ["notall", "نه — بخشی از فرض در مثالم برقرار نیست (پس رد نمی‌کند)"]] : [["all", "بله — هر بخشِ فرض جایی در برهان آمد"], ["notall", "نه — بخشی به کار نرفت (پس یا زائد است یا برهان ناقص)"]], d.hyp || "", function (v) { d.hyp = v; rer(); }));
      box.appendChild(selF("lpBConcl", podR ? "ردت دقیقاً خلافِ همان حکم را نشان می‌دهد (نه حکمی دیگر یا ضعیف‌تر)؟" : "نتیجه‌ای که برهانت واقعاً می‌دهد، با حکمی که ادعا شده بود یکی است؟", podR ? [["same", "بله — دقیقاً نقیضِ همان حکم"], ["diff", "نه — چیزِ دیگری را رد می‌کند"]] : [["same", "یکی است"], ["diff", "یکی نیست — برهان چیزِ دیگری (ضعیف‌تر/قوی‌تر/عکسش) را نشان می‌دهد"]], d.concl || "", function (v) { d.concl = v; rer(); }));
      box.appendChild(field("lpBDef", "قاعدهٔ پاسکال (B060): هر واژهٔ اصلیِ حکم را با تعریفش جایگزین کن — برهانت کجا از تعریفِ هر کدام استفاده کرد؟", d.def || "", function (v) { d.def = v; }, 0));
      }
    }
    if (!ab && F.indirect) box.appendChild(field("lpBDirect", "استدلالت غیرمستقیم (خلف) بود: می‌توانی مستقیمش کنی؟ کدام بخشش به فرضِ نادرست بسته نیست و جدا می‌ماند (C064/C067)؟", d.direct || "", function (v) { d.direct = v; }, 0));
    if (!ab && F.ty === "find" && F.obj) {
      box.appendChild(selF("lpBMulti", "چند جواب پیدا شد؟", [["one", "یکی"], ["many", "بیش از یکی"], ["none", "هیچ — شرط برآوردنی نبود"]], d.multi || "", function (v) { d.multi = v; rer(); }));
      if (d.multi === "many" || d.multi === "none") box.appendChild(multiCard(r, pg, s, d.multi === "many" ? "گفتی بیش از یک جواب پیدا شد." : "گفتی هیچ جوابی نبود."));
      /* E8 (s29): «بیش از یکی» ⇒ همه را یافتی؟ و شرط را با نام‌ها/خط‌های تازه دوباره بیان کن */
      if (d.multi === "many") box.appendChild(field("lpBMultiW", "همه را یافتی؟ کدام بخشِ شرط آن‌ها را از هم جدا نمی‌کند — شرط را با نام‌ها یا خط‌های تازه دوباره بیان کن.", d.multiW || "", function (v) { d.multiW = v; }, 0));
      if (d.multi === "many") box.appendChild(selF("lpBMultiAll", "پس شرط کافی نبود: همه را یافتی، یا شرط را کامل کردی؟", MULTI_ALL, d.multiAll || "", function (v) { d.multiAll = v; rer(); }));
    }
    var defect = !ab && lbDefect(d, F);
    if (defect) box.appendChild(h("div", { class: "card soft col gap lp-bdefect" }, h("h4", {}, "وارسی ایراد یافت — هنوز حل نشده"),
      h("p", { class: "small warnline" }, "بازنگری‌ای که ایراد می‌یابد کارش را درست کرده است — ولی مسئله را «حل شد» نمی‌بندد. ایراد را بنویس و بگو به کجا برمی‌گردی؛ مسئله ناتمام می‌ماند تا درستش کنی."),
      field("lpBDefW", "ایراد دقیقاً چیست؟", d.defWhy || "", function (v) { d.defWhy = v; }, 0),
      selF("lpBDefTo", "به کدام مرحله برمی‌گردی؟", BACK_TO, d.defTo || "", function (v) { d.defTo = v; })));
    /* «کدام پرسش کمک کرد؟» فقط پرسش‌ها (پرسش‌های طرح که پاسخشان دادی + پرسش‌های واقعیِ دستیار)؛ ابزارها جدا */
    /* E5 (دورِ ۴، s23/s29): «کدام پرسش کمک کرد؟» همیشه هست — پرسش‌هایی که در صفحه پاسخ دادی (کارتِ فهم، پرسش‌های طرح) و پرسش‌های دستیار، هر کدام کامل */
    /* N2 (دورِ ۱۴): گزینهٔ 💬 واژه‌های خودِ دستیار را نشان می‌دهد؛ اگر همان پرسشِ صفحه است (k) که در صفحه پاسخ دادی، یک گزینه می‌ماند (گزینهٔ صفحه) */
    var Qs = pageQs(r, s, pg), Cs = cardsUsed(r, s), ChI = chatItems(r).filter(function (e) { return [e.t, e.k].every(function (q) { return !q || (Qs.indexOf(q) < 0 && !Qs.some(function (Q) { return sameQPair(q, Q); })); }); }), Ch = ChI.map(function (e) { return e.t; });
    var bestOpts = Qs.map(function (q, i) { return [String(i), q]; }).concat(Ch.map(function (q, i) { return ["chat:" + i, "💬 " + q]; }));   // A13: کلِ پرسش، نه تکهٔ آغازش
    if (!defect && bestOpts.length) box.appendChild(selF("lpBBest", "کدام پرسش بیشتر از همه کمک کرد؟ (پرسش‌هایی که در صفحه پاسخ دادی، و پرسش‌های دستیار در گفت‌وگوی همین مسئله)", bestOpts.concat([["none", "هیچ‌کدام"]]), d.best, function (v) { d.best = v; }));
    if (!defect && Cs.length) box.appendChild(selF("lpBTool", "و کدام ابزار؟ (اختیاری)", Cs.map(function (c) { return [c[0], "🧰 " + c[1]]; }).concat([["none", "هیچ‌کدام"]]), d.tool || "", function (v) { d.tool = v; }));
    if (!defect) {
      box.appendChild(field("lpBUse", ab ? "درسِ تو به قلمِ خودت (اختیاری): کجای دیگر به کار می‌آید؟" : "درسِ تو به قلمِ خودت: این روش یا نتیجه کجای دیگر به کار می‌آید؟", d.use, function (v) { d.use = v; }, 2));
      if (!ab) box.appendChild(field("lpBTaste", "این نوع مسئله برایت چطور بود — کدام بخشش را دوست داشتی و کدامش را نه؟ (سلیقه و خطِ کارِ خودت را بشناس، C120)", d.taste || "", function (v) { d.taste = v; }, 0));
      box.appendChild(prov("new"));
      box.appendChild(field("lpBNew", ab ? "مسئلهٔ تازه‌ای که از این ساختی (اختیاری) — چند روز بعد برای حل برمی‌گردد" : "مسئلهٔ تازه‌ای که از این ساختی (کمی متفاوت، یا همان روش جای دیگر) — چند روز بعد برای حل برمی‌گردد", d.newProb, function (v) { d.newProb = v; }, 2));
      box.appendChild(selF("lpBNewS", "مسئلهٔ تازه با این مسئله چه چیزی مشترک دارد؟", SHARE, d.newShare || "", function (v) { d.newShare = v; rer(); }));
      box.appendChild(field("lpBNewW", "در یک خط: دقیقاً چه چیزی از این مسئله در آن هست؟", d.newWhy || "", function (v) { d.newWhy = v; }, 0));
      /* A4 (دورِ ۳): «ساختار — هم‌ریخت» همان نگاشتِ خودِ کاربر را می‌خواهد که «مسئلهٔ مرتبط» می‌خواهد (A.liveMapOk) — «دقیقاً همان مسئله است» نگاشت نیست */
      if (d.newShare === "form") box.appendChild(field("lpBNewM", "نگاشت: هر جزءِ این مسئله ⇐ کدام جزءِ مسئلهٔ تازه؟ (مثلاً «نقطه‌ها ⇐ جوراب‌ها، مربع‌های کوچک ⇐ رنگ‌ها»)", d.newMap || "", function (v) { d.newMap = v; }, 0));
    }
    if (g && g.guess && !ab && !defect) {
      box.appendChild(h("p", { class: "small" }, "حدسِ پیش از حلت: «" + g.guess + "»" + (g.conf ? " با اطمینانِ " + fa(g.conf) + "٪" : "")));
      box.appendChild(selF("lpBHit", "حدست با آنچه شد می‌خواند؟", HIT_OPTS, d.hit, function (v) { d.hit = v; rer(); }));
      if (d.hit === "نادرست بود" || d.hit === "تاحدی") box.appendChild(field("lpBHitW", d.hit === "نادرست بود" ? "چرا شهودت خطا رفت — کدام فرضِ پنهان یا نشانهٔ فریبنده تو را به آن حدس برد؟" : "کدام بخشِ حدس نادرست بود و چرا؟ (اختیاری)", d.hitWhy || "", function (v) { d.hitWhy = v; }, 0));
    }
    var ua = defect ? null : unusedAsk(un, d.unused, "lpBU_"); if (ua) box.appendChild(ua);
    if (d.softShow) box.appendChild(softField("lpBSoftWhy", d));
    box.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn lp-lbsave", type: "button", onclick: function () {
      var miss = [], soft = [];
      if (ab) { if (txt(d.why).length < 3) miss.push("«چرا کنارش می‌گذاری؟»"); if (!d.src) miss.push("«این دلیل از کجاست؟»"); }
      else {
        if (txt(d.chkHow).length < 3) miss.push("«وارسیِ نتیجه»"); if (!d.chkRes) miss.push("«نتیجهٔ وارسی»");
        if (F.pod && !d.pod) miss.push("«سرانجام: ثابت کردی یا رد کردی؟»");
        if (F.proof && !(F.pod && d.pod === "gap")) { if (!d.hyp) miss.push("«همهٔ فرض به کار رفت؟»"); if (!d.concl) miss.push("«نتیجه با حکم یکی است؟»"); }
        if (!cpImp(d, F)) F.parts.forEach(function (pt, i) { if (!(d.cp && d.cp[i])) miss.push("«" + clip(pt, 40) + "» — " + (F.lpod ? "شواهدت دربارهٔ این بخش چه می‌گوید؟" : "نتیجه این بخش را برآورده می‌کند؟")); });
        if (F.lpod && !d.podL) miss.push("«سرانجامِ فرضیه: تأیید، رد، یا هنوز نامعلوم؟»");
        if (cpRange(d, F) && toks(d.rangeW).length < 2) miss.push("«بازه یا دلیلِ دست‌نیافتنی بودن»");
        if (F.transf && !d.equiv) miss.push("«تبدیل‌ها هم‌ارز بودند؟»");
      }
      if (defect) {
        /* F5 (دورِ ۵، s03): ثبتِ ایراد هرگز منتظرِ پاسخ به سنجش‌های دیگر (هر بخشِ شرط، فرض/حکم، هم‌ارزی) نمی‌ماند — ایراد خودش کافی است */
        miss = [];
        if (toks(d.defWhy).length < 2) miss.push("«ایراد دقیقاً چیست؟»"); if (!d.defTo) miss.push("«به کدام مرحله برمی‌گردی؟»");
        if (miss.length) { A.toast("اول این‌ها: " + miss.join("، "), "bad"); return; }
        var atD = nowISO(), dfx = { at: atD, d: A.today(), why: txt(d.defWhy), to: d.defTo, chkHow: txt(d.chkHow), chkRes: d.chkRes, hyp: d.hyp || "", concl: d.concl || "", equiv: d.equiv || "" };
        if (cpNo(d, F)) dfx.parts = F.parts.filter(function (x, i) { return d.cp[i] === "no"; });
        if (F.pod && d.pod === "gap") dfx.pod = "gap";
        (L.defects = L.defects || []).push(dfx); L.state = "open"; L.reopenAt = atD; if (d.defTo === "u") L.reU = true;
        delete BKD[pid]; delete L.bDraft; if (dTimer) clearTimeout(dTimer); S.put(pg);
        A.toast("ناتمام — برگرد به «" + BACK_TO_FA[d.defTo] + "». ایراد ثبت شد؛ پس از درست کردن دوباره «✅ حل شد»."); A.go("lprob", pid, d.defTo === "u" ? "u" : d.defTo === "p" ? "plan" : "exec");
        return;
      }
      if (!ab) {
        [["other", "راهِ دیگر"], ["glance", "در یک نگاه"], ["worked", "چه کار کرد"]].forEach(function (x) { if (toks(d[x[0]]).length < 2) miss.push("«" + x[1] + "»"); });
        if (txt(d.use).length < 5) miss.push("«درسِ تو»"); if (txt(d.newProb).length < 5) miss.push("«مسئلهٔ تازه»");
        if (toks(d.taste).length < 2) miss.push("«این نوع مسئله برایت چطور بود؟» (سلیقه)");
        if (g && g.guess && !d.hit) miss.push("«داوریِ حدس»");
        if (g && g.guess && d.hit === "نادرست بود" && toks(d.hitWhy).length < 3) miss.push("«چرا شهودت خطا رفت؟»");
        if (F.spatial) { if (toks(d.sym).length < 2) miss.push("«تقارن»"); if (toks(d.units).length < 2) miss.push("«واحد و بُعد»"); }
        if (F.limit && !txt(d.limit)) miss.push("«حالتِ حدی»"); else if (F.limit && toks(d.limit).length < 2) soft.push(["limit", "«حالتِ حدی» — اگر یکی از اندازه‌ها به صفر یا بی‌نهایت برود، نتیجه‌ات چه می‌گوید؟"]);
        if (F.depNo && !d.depAgain) miss.push("«داده‌ها هنوز ثابت‌اند؟»");
        if ((F.dep || (F.depNo && d.depAgain === "yes")) && toks(d.mono).length < 2) miss.push("«یکنوایی»");
        if (F.law && toks(d.law).length < 3) miss.push("«دامنه و حالتِ حدیِ قانونت»");
        if (F.nat === "practical" && !txt(d.approx)) miss.push("«تقریبت بس بود؟»"); else if (F.nat === "practical" && toks(d.approx).length < 2 && !APPROX_RE.test(norm(d.approx))) soft.push(["approx", "«تقریبت بس بود؟» — در واقعیت چه دیدی؟ (مثلاً «±۱۰٪ بس بود»)"]);
        if (F.nat === "practical" && !F.spatial && toks(d.units).length < 2) miss.push("«واحد و بُعد»");
        if (F.nat === "practical" && u0 && u0.prac && u0.prac.approx) { var avm2 = approxVsMargin(u0.prac.approx, [d.approx, d.chkHow].concat(L.steps.map(function (x) { return x.out && x.out.what; }))); if (avm2) soft.push(["approxm", "تقریبِ بس (" + fa(avm2.tol) + " " + avm2.u + ") از فاصلهٔ واقعی (" + fa(avm2.m) + " " + avm2.u + ") درشت‌تر است — تقریب بس بود؟"]); }
        if (F.ty === "find" && F.obj && d.multi === "many" && toks(d.multiW).length < 2) miss.push("«همه را یافتی؟ شرط را دوباره بیان کن»");
        if (F.ty === "find" && F.obj && d.multi === "many" && !d.multiAll) miss.push("«همه را یافتی، یا شرط را کامل کردی؟»");
        /* F5 (دورِ ۵، s05): تأییدِ فرضیه با بخشی که شواهد ردش کرد نمی‌خواند — چالشِ نرم */
        if (F.lpod && d.podL === "ok" && F.parts.some(function (x, i) { return d.cp && d.cp[i] === "no"; })) soft.push(["lpodno", "گفتی فرضیه تأیید شد ولی شواهد بخشی از آن را رد کرد — کدام درست است؟"]);
        F.parts.forEach(function (pt, i) { if (d.cp && d.cp[i] === "yes" && partNegated(d.chkHow, pt)) soft.push(["cpneg" + i, "وارسی‌ات دربارهٔ «" + clip(pt, 40) + "» «نه/نرسید» می‌گوید ولی گفتی برآورده می‌کند — کدام درست است؟"]); });
        if (F.cond.length && toks(d.cond).length < 2) miss.push("«بخش‌های شرط که به کار نرفتند»");
        if (F.proof && toks(d.def).length < 2) miss.push("«قاعدهٔ پاسکال: برهان کجا از تعریف استفاده کرد؟»");
        if (F.indirect && toks(d.direct).length < 2) miss.push("«برهانِ غیرمستقیم ⇐ مستقیم»");
        if (F.ty === "find" && F.obj && !d.multi) miss.push("«چند جواب پیدا شد؟»");
      }
      if (bestOpts.length && !d.best && !defect) miss.push("«کدام پرسش کمک کرد؟»");
      if (!d.want) miss.push("«خواستن در پایان»");
      /* A157: مسئلهٔ تازه باید تازه باشد — نه تقریباً همان صورت (A.kNearCopy). دورِ ۲ (R4): «چه چیزی مشترک است» را خودت اعلام می‌کنی (روش، مجهول، داده، شرط،
         ساختار، نتیجه) با یک خطِ مشخص — کد دیگر با واژه‌های مشترک «هیچ چیزِ مشترکی ندارد» نمی‌گوید (مسئلهٔ تازه با همان روش اغلب هیچ واژهٔ مشترکی ندارد) */
      if (txt(d.newProb)) {
        if (sameText(d.newProb, r.p.statement) || sameText(d.newProb, r.p.title) || sameText(d.newProb, (u0 || {}).one)) soft.push(["copy", "«مسئلهٔ تازه» همان مسئلهٔ اصلی است — چیزی را عوض کن (مجهول، داده یا شرط)"]);
        if (!d.newShare) miss.push("«مسئلهٔ تازه چه چیزی با این مشترک دارد؟»");
        else if (d.newShare === "form" && !mapOk(d.newMap)) miss.push("«ساختار — هم‌ریخت» نگاشت می‌خواهد: هر جزءِ این مسئله ⇐ جزءِ متناظر در تازه (مثلاً «شهرها ⇐ رأس‌ها»)");
        if (!spec(d.newWhy)) miss.push("«در یک خط: چه چیزی از این مسئله در آن هست؟» (دست‌کم سه واژهٔ معنادار)");
        else if (near(d.newWhy, d.newProb) || near(d.newWhy, r.p.statement)) soft.push(["copywhy", "خطِ «چه چیزی مشترک است» رونوشتِ صورت است — بگو دقیقاً چه چیزی"]);
      }
      unusedMiss(un, d.unused).forEach(function (x) { miss.push(x); });
      var sg = softGate(d, soft, miss);
      if (miss.length) { A.toast(missToast(d, miss, "بالای دکمه"), "bad"); var sgB = box.querySelector(".lp-softgate"); if (d.softShow && !sgB) rer(); else if (d.softShow && sgB) sgB.replaceWith(softField("lpBSoftWhy", d)); return; }
      var at = nowISO(), keep = {}; un.forEach(function (x) { keep[x.id] = { ans: d.unused[x.id].ans, why: txt(d.unused[x.id].why), t: x.t }; });
      var b = { state: L.state, chkHow: txt(d.chkHow), chkRes: d.chkRes, other: txt(d.other), glance: txt(d.glance), worked: txt(d.worked), use: txt(d.use), newProb: txt(d.newProb), unused: keep, want: d.want, at: at, done: true, from: "live" };
      if (txt(d.newProb)) { b.newShare = d.newShare; b.newWhy = txt(d.newWhy); if (d.newShare === "form") b.newMap = txt(d.newMap); }
      if (bestOpts.length) {
        var bv = d.best, bq = "";
        if (bv === "none") bq = ""; else if (/^chat:/.test(bv)) { bq = Ch[+bv.slice(5)] || ""; b.bestKind = "chat"; var bk = (ChI[+bv.slice(5)] || {}).k; if (bk) b.bestListQ = bk; } else { bq = Qs[+bv] || ""; b.bestKind = "q"; }
        b.bestQ = bq; L.bestQ = b.bestQ;
      }
      if (d.tool && d.tool !== "none") { var cc = Cs.filter(function (c) { return c[0] === d.tool; })[0]; if (cc) { b.bestCard = cc[0]; b.bestTool = cc[1]; } }
      if (!ab) {
        b.taste = txt(d.taste);
        if (F.spatial) { b.sym = txt(d.sym); b.units = txt(d.units); if (txt(d.letter)) b.letter = txt(d.letter); }
        if (F.limit) b.limit = txt(d.limit);
        if (F.depNo) b.depAgain = d.depAgain;
        if (F.dep || (F.depNo && d.depAgain === "yes")) b.mono = txt(d.mono);
        if (F.law) b.law = txt(d.law);
        if (F.nat === "practical") { b.approx = txt(d.approx); if (!F.spatial) b.units = txt(d.units); }
        if (F.parts.length) b.parts = F.parts.map(function (x, i) { return { t: x, ok: d.cp[i] }; });
        if (d.multi === "many") { b.multiW = txt(d.multiW); b.multiAll = d.multiAll; }
        if (F.lpod) b.podL = d.podL;
        if (F.cond.length) b.cond = txt(d.cond);
        if (F.transf) b.equiv = d.equiv;
        if (F.proof) { b.hyp = d.hyp; b.concl = d.concl; b.def = txt(d.def); }
        if (F.indirect) b.direct = txt(d.direct);
        if (sg) { b.soft = sg; (L.softLog = L.softLog || []).push({ where: "b", keys: sg.keys, why: sg.why, at: sg.at }); }
        if (F.ty === "find" && F.obj && d.multi) b.multi = d.multi;
        /* حکمِ صادقانهٔ بستن: «اثبات شد» فقط برای برهانِ کاملِ وارسی‌شده؛ گامِ شهودیِ ثابت‌نشده ⇒ «با گامِ شهودی»؛ «نتوانستم وارسی کنم» ⇒ «وارسی نشد» */
        var pfSteps = L.steps.filter(function (x) { return x.out && x.out.kind === "proof"; }), intu = L.steps.filter(function (x) { return x.intuitive; });
        /* A3: پلِ «خاص ⇐ عام» بی استدلالِ تعمیم ⇒ هرگز «اثبات شد»؛ A10: «اثبات یا رد کن» که رد شد ⇒ «رد شد»، نه «اثبات شد» */
        var noGen = F.obj && L.aux.some(function (a) { return a.crossed && a.crossed.gen === false; });
        var full = F.obj && pfSteps.length && (!F.proof || (d.hyp === "all" && d.concl === "same")) && (!F.transf || d.equiv !== "no");
        b.verdict = d.chkRes === "نتوانستم وارسی کنم" ? "unverified" : intu.length ? "intuitive" : noGen ? "special" : F.lpod ? (d.podL === "ok" ? "lifeok" : d.podL === "ref" ? "liferef" : "lifeunk")
          : d.multi === "many" && d.multiAll !== "all" && d.multiAll !== "completed" ? "partial" : cpImp(d, F) ? "impossible" : cpRange(d, F) ? "range" : full ? (F.pod && d.pod === "refuted" ? "refuted" : "proved") : "verified";
        /* F5 (s29): «بیش از یکی» یعنی شرط کافی نبود — کارتِ فهم هم همین را می‌گوید (دفترِ «کافی است؟»)، نه «کافی است» ِ آغاز */
        if (d.multi === "many" && suffNow(s) === "کافی است") (L.suffLog = L.suffLog || []).push({ at: at, d: A.today(), ans: "ناکافی است — چیزی کم است", why: "بازنگری: بیش از یک جواب پیدا شد", where: "b" });
        if (F.pod) b.pod = d.pod;
        if (b.verdict === "range") b.rangeW = txt(d.rangeW);
      }
      if (ab) { b.why = txt(d.why); b.src = d.src; b.gain = txt(d.gain); }
      s.b[1] = b; U.seed(s, "b");
      if (g && g.guess && d.hit) { g.hit = d.hit; g.hitAt = at; if (txt(d.hitWhy)) g.hitWhy = txt(d.hitWhy); }
      if (g && (b.verdict === "proved" || b.verdict === "refuted") && guessFate(g) === "ok") { g.proved = at; }
      if (g && guessFate(g) === "refuted") { g.refuted = at; delete g.proved; }
      if (g && !ab) { var gfv = guessFate(g); if (gfv === "refuted") closeGuessCase(g, "نادرست", "بازنگری: " + clip(g.hitWhy || b.chkHow || "", 160)); else if (gfv === "ok" && (b.verdict === "proved" || b.verdict === "refuted" || b.verdict === "lifeok")) closeGuessCase(g, "درست", "بازنگری: " + VERDICT_FA[b.verdict]); }
      ((L.defects || []).filter(function (x) { return !x.resolvedAt; })).forEach(function (x) { x.resolvedAt = at; });
      var les = { lv: 1, use: b.use, newProb: b.newProb, glance: b.glance, at: at, live: true };
      if (b.use && A.newCard) { var cd = A.newCard("در مسئلهٔ «" + r.p.title + "» چه درسی گرفتی و کجای دیگر به کارش می‌بری؟ (بی‌نگاه)", b.use + (b.newProb ? "\nمسئلهٔ تازه‌ای که ساختی: " + b.newProb : "") + (b.worked ? "\nچه خوب کار کرد: " + b.worked : ""), { pb: pid, due: A.addDays(A.today(), 1) }); les.card = cd && cd.id; }
      if (b.use) s.lessons.push(les);
      /* «مسئلهٔ تازه‌ای که خودت ساختی» ⇒ مسئلهٔ حل‌نشدهٔ تازه، خفته تا پلهٔ دومِ نردبان؛ داور، نوع و فضایی بودن را از همین مسئله ارث می‌برد (R2) */
      if (b.newProb) { var nr = create(clip(b.newProb, 80), b.newProb, "", { origin: { type: "lprob", id: pid, share: b.newShare || "", map: b.newMap || "", why: b.newWhy || "" }, dormant: A.addDays(A.today(), LADDER[1]) }); b.newPid = nr.p.id; L.made = (L.made || []).concat([nr.p.id]); }
      if (ab) {
        var w = s.will = s.will || {}; w.steps = w.steps || []; w.log = w.log || [];
        var riv = U.nextIv(LADDER[0], true);
        w.drop = { at: at, why: b.why, src: b.src, trig: "live:abandon", due: A.addDays(A.today(), riv), iv: riv };
        w.log.push({ at: at, kind: "commit", trig: "live:abandon", desire: "drop", hope: "", budget: "" });
      }
      closeOpen(s, L.state);
      L.closedAt = at; L.closedD = A.today(); delete BKD[pid]; delete L.bDraft; if (dTimer) clearTimeout(dTimer); S.put(pg); S.put(r);
      clearBad(); A.toast(ab ? "کنار گذاشتنِ آگاهانه ثبت شد؛ " + A.fdate(s.will.drop.due) + " یک بار می‌پرسد." : (b.verdict === "proved" ? (F.ty === "find" ? "حل شد. " : "اثبات شد. ") : b.verdict === "refuted" ? "رد شد (حکم نادرست است). " : "") + (guessFate(g) === "refuted" ? "حدسِ پیش از حلت رد شد. " : "") + "بازنگری ثبت شد: درس، کارتِ مرور، و مسئلهٔ تازه‌ات " + A.fdate(A.addDays(A.today(), LADDER[1])) + " برمی‌گردد.");
      A.render();
    } }, ab ? "ثبتِ کنار گذاشتن" : defect ? "ثبتِ ایراد — برگرد (ناتمام)" : "ثبتِ بازنگری"),
      h("button", { class: "btn ghost sm lp-reopen", type: "button", onclick: function () { saveNow(); L.state = "open"; S.put(pg); A.go("lprob", pid, "exec"); } }, "برگرد — هنوز حل نشده")));
    box.addEventListener("input", saveDraft); box.addEventListener("change", saveDraft);
    return box;
  }
  var VERDICT_FA = { proved: "✅ اثبات شد — همهٔ گام‌ها ثابت شدند و بازنگری ایرادی نیافت", impossible: "✅ ناممکن (اثبات شد) — نشان دادی که شرط‌ها با هم برآوردنی نیستند",
    lifeok: "✅ تأیید شد — شواهدِ واقعیت با فرضیه خواند (برهان نیست؛ شاهدِ تازه می‌تواند عوضش کند)", liferef: "✅ رد شد — شواهدِ واقعیت فرضیه را رد کرد", lifeunk: "بسته شد — هنوز نامعلوم: شواهد برای داوری ناکافی بود",
    partial: "حل شد — بیش از یک جواب و شرط کافی نبود: هنوز همهٔ جواب‌ها یافته نشده (نه «اثبات شد»)", refuted: "✅ رد شد — حکم نادرست است: ردِ تو (مثالِ نقض یا برهانِ خلاف) وارسی شد و ایرادی نداشت",
    range: "✅ حل شد — جواب: بازه یا «دست‌نیافتنی» (با دلیل)",
    special: "حل شد — ولی از حالتِ خاص به عام بدون استدلال (هنوز ثابت نشده)", verified: "حل شد — وارسی: نتیجه سالم ماند", intuitive: "حل شد — با گامِ شهودیِ هنوز ثابت‌نشده", unverified: "حل شد — وارسی نشد" };
  /* A1 (دورِ ۳، s11/s21/s26): «حدست — اثبات شد» فقط وقتی حدس رد نشده است؛ حدسِ ردشده «رد شد» است، با پاسخِ «چرا شهودت خطا رفت؟» (R5) */
  /* G5 (دورِ ۶، s06): مسئلهٔ یافتنی که همهٔ گام‌هایش ثابت شد «حل شد» است، نه «اثبات شد» (حکمی نبود که ثابت شود)؛ داده همان «proved» می‌ماند */
  function vLabel(vd, ty, b) { if (vd === "proved" && ty === "find") return "✅ حل شد — همهٔ گام‌ها ثابت شدند و بازنگری ایرادی نیافت"; if (vd === "range") return VERDICT_FA.range + (b && b.rangeW ? ": «" + clip(b.rangeW, 120) + "»" : ""); return VERDICT_FA[vd]; }
  function guessFate(g) { return !g || !g.guess ? "" : g.hit === "نادرست بود" ? "refuted" : g.hit === "تاحدی" ? "part" : "ok"; }
  function backSummary(s) {
    var b = s.b && s.b[1]; if (!b || !b.done) return null; var g = s.g && s.g[1], L = live(s), gf = guessFate(g);
    return h("div", { class: "small lp-lbsum", "data-verdict": b.verdict || "" }, h("p", {}, b.state === "abandoned" ? "کنار گذاشته شد: «" + (b.why || "") + "»" : vLabel(b.verdict, typeOf(null, s), b) || "حل شد — وارسی: " + (b.chkRes || "")),
      gf === "ok" && (b.verdict === "proved" || b.verdict === "refuted") ? h("p", { class: "good lp-proved" }, "حدسِ پیش از حلت «" + clip(g.guess, 100) + "» — " + (b.verdict === "refuted" ? "درست درآمد: برهان (ردِ حکم) یقین می‌دهد." : typeOf(null, s) === "find" ? "درست درآمد: حلی با گام‌های ثابت‌شده یقین می‌دهد (نه «احتمالاً»)." : "اثبات شد (نه «احتمالاً»: برهان یقین می‌دهد).")) : null,
      gf === "refuted" ? h("p", { class: "warnline lp-guessrefuted" }, "حدسِ پیش از حلت «" + clip(g.guess, 100) + "» — رد شد: آنچه حل نشان داد خلافِ آن بود." + (g.hitWhy ? " چرا شهودت خطا رفت (نوشتهٔ خودت): «" + clip(g.hitWhy, 160) + "»" : "")) : null,
      gf === "part" ? h("p", { class: "muted lp-guesspart" }, "حدسِ پیش از حلت «" + clip(g.guess, 100) + "» — فقط تاحدی درست بود" + (g.hitWhy ? ": «" + clip(g.hitWhy, 160) + "»" : ".")) : null,
      (L.aux || []).some(function (a) { return a.crossed && a.crossed.gen === false; }) ? h("p", { class: "warnline lp-nogen" }, "از حالت خاص به عام بدون استدلال: نتیجهٔ مسئلهٔ کمکیِ خاص بی استدلالِ تعمیم (استقرا، «برای هر …» با دلیل، تقارن) به حکمِ کلی رسید — حالتِ خاص چیزی کلی را ثابت نمی‌کند.") : null,
      (L.defects || []).length ? h("p", { class: "muted lp-defsum" }, "بازنگری " + fa(L.defects.length) + " بار ایراد یافت و برگشتی — همان ایرادها هم درس‌اند.") : null,
      b.use ? h("p", {}, "درس: " + b.use) : null, b.taste ? h("p", { class: "muted" }, "سلیقه‌ات: " + b.taste) : null, b.newProb ? h("p", {}, "مسئلهٔ تازه‌ات: " + b.newProb) : null,
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
    var nav = pid + "|" + (sub || ""); if (nav !== LAST_NAV) { LAST_NAV = nav; clearBad(); Object.keys(SECO).forEach(function (k) { if (k.indexOf(pid + "|") === 0) delete SECO[k]; }); }
    var r = rec(pid); if (!r) return A.empty("مسئله پیدا نشد.", h("button", { class: "btn", onclick: function () { A.go("e_prob", null, "live"); } }, "مسئله‌های حل‌نشده"));
    var pg = pgOf(pid), s = solOf(pg), L = live(s), t = A.today();
    /* «🌱» ِ رها کردن: «نه — دوباره پیش می‌برمش» ⇒ مسئله دوباره باز */
    if (L.state === "abandoned" && s.will && !s.will.drop && (s.will.log || []).some(function (x) { return x.kind === "drop-recheck" && x.keep === "back" && String(x.at) > String(L.stateAt || ""); })) { L.state = "open"; L.backAt = nowISO(); delete s.b[1]; S.put(pg); }
    var ph = phaseOf(s), want = sub === "u" || sub === "plan" || sub === "exec" || sub === "back" ? { u: "u", plan: "p", exec: "c", back: "b" }[sub] : ph;
    var root = h("div", { class: "page lp-page", dir: "rtl", "data-lp-nat": natOf(s, r), "data-lp-kind": natOf(s, r), "data-lp-ph": ph, "data-lp-coach": r.coach ? "1" : null });
    var strip = h("div", { class: "row gap wrap lp-strip" }, ["u", "p", "c", "b"].map(function (k) { return h("span", { class: "chip" + (k === ph ? " on" : ""), "data-ph": k }, phName(k, r, s)); }));
    root.appendChild(A.head("🔭 مسئلهٔ حل‌نشدهٔ خودم · " + phName(ph, r, s), r.p.title, r.p.statement, h("div", { class: "col gap" }, strip,
      h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm", type: "button", onclick: function () { A.go("e_prob", null, "live"); } }, "← مسئله‌های حل‌نشده"),
        ph !== "u" && ph !== "done" ? h("button", { class: "btn ghost sm lp-stuck", type: "button", onclick: function () { stuck(r, pg, s, null); } }, "🪢 گیر کرده‌ام — گره‌گشا با همین مسئله") : null,
        r.origin && r.origin.type === "lprob" && rec(r.origin.id) ? h("button", { class: "linkish small", type: "button", onclick: function () { A.go("lprob", r.origin.id); } }, backFrom(r)) : null))));
    /* E5 (دورِ ۴، s24): مسئلهٔ «ساختار — هم‌ریخت» نگاشتِ خودِ کاربر را با خود می‌آورد */
    if (r.origin && r.origin.type === "lprob" && txt(r.origin.map)) root.appendChild(h("p", { class: "card soft small lp-childmap" }, "نگاشتی که در بازنگریِ «" + clip((rec(r.origin.id) || { p: { title: "" } }).p.title, 40) + "» نوشتی: «" + r.origin.map + "» — هر گامِ این را از راهِ همین نگاشت با حلِ آن مقایسه کن."));
    if (r.dormant && r.dormant > t && !r.woke) root.appendChild(h("p", { class: "card soft small lp-dormnote" }, "این مسئله را خودت در بازنگری ساختی؛ " + A.fdate(r.dormant) + " برای حل برمی‌گردد — می‌توانی همین حالا هم شروعش کنی."));
    /* برگشتِ مسئلهٔ ساختهٔ خودت: «شروع می‌کنم» یا «فعلاً نه» — «فعلاً نه» یک پله دورتر روی همان نردبان (۳ ⇐ ۷ ⇐ ۲۱ ⇐ ۶۰)، نه هر روز */
    if (r.dormant && r.dormant <= t && !r.woke) root.appendChild(h("section", { class: "card soft lp-wake" }, h("p", { class: "small" }, "مسئله‌ای که خودت در بازنگری ساختی برگشته است. حالا حلش می‌کنی؟"),
      h("div", { class: "row gap wrap" }, h("button", { class: "btn sm lp-wakego", type: "button", onclick: function () { r.woke = nowISO(); delete UD[pid]; S.put(r); A.go("lprob", pid, "u"); } }, "شروع می‌کنم"),
        h("button", { class: "btn ghost sm lp-snooze", type: "button", onclick: function () { var iv = U.nextIv(r.dIv || LADDER[1], true); r.dIv = iv; r.snoozes = (r.snoozes || 0) + 1; r.dormant = A.addDays(t, iv); S.put(r); A.toast("باشد؛ " + A.fdate(r.dormant) + " دوباره می‌پرسد."); A.go("e_prob", null, "live"); } }, "فعلاً نه"))));
    try { var rv = U.reviewPanel(r.p, pg); if (rv) root.appendChild(rv); } catch (e) { console.warn(e); }
    /* E8 (دورِ ۴، s19): گامِ 🌱 که همین امروز ثبت شد همین حالا «انجامش دادی؟» نمی‌خواهد (پیش‌تر بلافاصله پس از ثبت، کارتِ 🌱 ِ خالی دوباره می‌آمد) */
    try { var wOpen = s.will && (s.will.steps || []).filter(function (x) { return !x.closed; }).pop(), wToday = !!(wOpen && A.localDay && A.localDay(wOpen.at) === t);
      var wd = A.willDue ? A.willDue().filter(function (x) { return x.kind === "prob" && x.id === pid && !(x.what === "step" && wToday); }) : []; if (wd.length) { var hs = A.willHost("prob", pid); if (hs) root.appendChild(A.willCard(hs, "due")); } } catch (e) { console.warn(e); }
    try { var cc = coachCard(r, pg, s, ph); if (cc) root.appendChild(cc); } catch (e) { console.warn(e); }
    try { var ic = incubCard(r, pg, s); if (ic) root.appendChild(ic); } catch (e) { console.warn(e); }
    try { var ck = checkinCard(r, pg, s); if (ck) root.appendChild(ck); } catch (e) { console.warn(e); }
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
    /* پیوستِ گفت‌وگو (A.liveAttach) از همان آغاز دیده شود — عکسی که هنگامِ گفتنِ صورت فرستاده شد، در مرحلهٔ فهم هم (ادغامِ G1/G2) */
    if (ph === "u") { try { var al0 = attachList(s); if (al0) root.appendChild(al0); } catch (e) { console.warn(e); } return root; }
    /* طرح */
    var planBody = [suffCard(r, pg, s, "p"), askCard(r, pg, s), relatedCard(r, pg, s), backCard(r, pg, s), auxCard(r, pg, s), movesCard(r, pg, s), planCard(r, pg, s), ph === "p" ? incubBtn(r, pg, s, "p") : null];
    root.appendChild(sec("p", "۲) طرح" + (L.plan && L.plan.at ? " ✓" : ""), want === "p", planBody));
    /* اجرا */
    var exBody = [];
    if (!(L.plan && L.plan.at)) exBody.push(h("p", { class: "small muted" }, "اول طرحت را ثبت کن (بخشِ ۲) — بعد گامِ واقعیِ بعد، با پیش‌بینی."));
    else if (ph === "c") {
      exBody.push(defectCard(s));
      exBody.push(closeGateCard(r, pg, s));
      exBody.push(guessPanel(r, pg, s));
      exBody.push(stepsList(s));
      exBody.push(eqCard(r, pg, s));
      if (os && os.due > t) exBody.push(h("div", { class: "card soft small lp-cur" }, "گامِ جاری: «" + os.text + "» — وارسی " + A.fdate(os.due) + " ",
        h("button", { class: "btn ghost sm lp-early", type: "button", onclick: function () { os.due = t; var f0 = os.fc && S.get(os.fc); if (f0) { f0.due = t; S.put(f0); } S.put(pg); A.render(); } }, "زودتر انجامش دادم — نتیجه را ثبت کنم")));
      if (!os) { exBody.push(afterCard(r, pg, s)); exBody.push(stepForm(r, pg, s)); exBody.push(incubBtn(r, pg, s, "c")); }
      exBody.push(h("div", { class: "row gap wrap lp-endrow" },
        h("button", { class: "btn ghost sm lp-solved", type: "button", onclick: function () { solveClick(r, pg, s); } }, "✅ حل شد — بازنگری"),
        h("button", { class: "btn ghost sm lp-abandon", type: "button", onclick: function () { L.state = "abandoned"; L.stateAt = nowISO(); L.stateD = A.today(); S.put(pg); A.go("lprob", pid, "back"); } }, "⏹ آگاهانه کنارش می‌گذارم")));
    } else exBody.push(stepsList(s));
    root.appendChild(sec("c", "۳) " + phName("c", r, s), want === "c", exBody));
    root.appendChild(sec("claims", "ادعاهای درونِ مسئله" + (L.claims.length ? " (" + fa(L.claims.length) + ")" : ""), want === "p" || want === "c", claimsCard(r, pg, s), "lp-claimsec"));
    if (ph === "b" || ph === "done") root.appendChild(sec("b", "۴) بازنگری", true, ph === "b" ? lookBack(r, pg, s) : backSummary(s)));
    try { var al = attachList(s); if (al) root.appendChild(al); } catch (e) { console.warn(e); }
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
    var t = A.today(), steps = [], back = [], incub = [], coach = [], checkin = [];
    lives().forEach(function (r) {
      if (r.dormant && r.dormant <= t && !r.woke) back.push(r);
      var pg = S.get("eprog_" + r.p.id); if (!pg || !pg.solve || !pg.solve.live) return;
      var s = solOf(pg), o = openStep(s), ph = phaseOf(s); if (o && o.due <= t && ph === "c") steps.push({ r: r, st: o });
      var L = live(s);
      if (ph !== "done" && L.incub && !L.incub.back && L.incub.due <= t) incub.push(r);   // «کنار بگذار تا فردا» ⇒ فردا: چه به ذهنت رسید؟
      if (r.coach && L.coach && L.coach.due && L.coach.due <= t && L.coach.last && !L.coach.last.back) coach.push(r);   // پیگیریِ فاصله‌دارِ مربیگری
      if (!(o && o.due <= t && ph === "c") && !(r.dormant && r.dormant > t && !r.woke) && checkDue(r, s)) checkin.push(r);   // مرورِ میانهٔ راه روی نردبانِ خودِ مسئله (روزی که گامی موعد دارد، همان سطرِ گام بس است — کارت در صفحه هست)
    });
    return { steps: steps, back: back, incub: incub, coach: coach, checkin: checkin };
  };
  function backFrom(r) {
    var o = r.origin || {}, pr = o.type === "lprob" ? rec(o.id) : null;
    if (o.type === "chat") return "ساخته‌شده در گفت‌وگو با دستیار";
    if (pr && o.via === "chat") return "ساخته از «" + clip(pr.p.title, 40) + "» در گفت‌وگو با دستیار";
    if (pr) return "از بازنگریِ «" + clip(pr.p.title, 40) + "»";
    return "از بازنگریِ یک مسئلهٔ دیگر";
  }
  if (typeof A.dueList === "function" && !A.dueList._live) {
    var rawDue = A.dueList;
    A.dueList = function () {
      var items = rawDue.apply(this, arguments) || [];
      try {
        var D = A.liveDue();
        if (D.steps.length === 1) { var x = D.steps[0]; items.push({ k: "knot", live: 1, txt: "🔭 گامِ واقعی: «" + clip(x.st.text, 70) + "» — انجامش دادی؟ چه شد؟", sub: "«" + clip(x.r.p.title, 50) + "» · پیش‌بینی‌ات: «" + clip(x.st.pred, 60) + "»", go: function () { A.go("lprob", x.r.p.id, "exec"); } }); }
        else if (D.steps.length > 1) items.push({ k: "knot", live: D.steps.length, txt: "🔭 " + fa(D.steps.length) + " گامِ واقعی موعدِ وارسی است — انجامش دادی؟ چه شد؟", sub: D.steps.slice(0, 3).map(function (y) { return "«" + clip(y.r.p.title, 40) + "»"; }).join(" · "), go: function () { A.go("lprob", D.steps[0].r.p.id, "exec"); } });
        /* متنِ «امروز» (تورِ پولیا دورِ ۲، rerunD s31/s34؛ ادغامِ G1/G2 — یک منبع، لایهٔ رونویسِ a27 برداشته شد): شمار با فهرست می‌خواند («و k تای دیگر»)،
           «دیروز» فقط اگر دیروز بود (وگرنه «n روز پیش»)، و برچسب از خاستگاهِ واقعی: بازنگریِ همین صفحه، گفت‌وگو با دستیار، یا ساخته از مسئلهٔ دیگری در گفت‌وگو */
        if (D.back.length === 1) { var b = D.back[0]; items.push({ k: "knot", live: 1, txt: "🧩 مسئلهٔ تازه‌ای که خودت ساختی برگشت: «" + clip(b.p.title, 70) + "»", sub: backFrom(b) + " — حالا حلش کن", go: function () { A.go("lprob", b.p.id, "u"); } }); }
        else if (D.back.length > 1) items.push({ k: "knot", live: D.back.length, txt: "🧩 " + fa(D.back.length) + " مسئلهٔ تازه‌ای که خودت ساختی برگشت", sub: D.back.slice(0, 3).map(function (y) { return "«" + clip(y.p.title, 40) + "»"; }).join(" · ") + (D.back.length > 3 ? " و " + fa(D.back.length - 3) + " تای دیگر" : ""), go: function () { A.go("lprob", D.back[0].p.id, "u"); } });
        D.incub.forEach(function (y) { var ic = live(solOf(pgOf(y.p.id))).incub || {}, d0 = ic.d || String(ic.at || "").slice(0, 10), n = d0 && A.daysBetween ? A.daysBetween(d0, A.today()) : 1;
          items.push({ k: "knot", live: 1, txt: "😴 " + (n > 1 ? fa(n) + " روز پیش" : "دیروز") + " «" + clip(y.p.title, 60) + "» را کنار گذاشتی — چه چیزی به ذهنت رسید؟", sub: "پس از تلاشِ جدی؛ همان را بنویس، حتی «هیچ»", go: function () { A.go("lprob", y.p.id); } }); });
        D.checkin.forEach(function (y) { items.push({ k: "knot", live: 1, txt: "🔭 میانهٔ راهِ «" + clip(y.p.title, 60) + "»: چه آموختی؟", sub: "دربارهٔ مسئله و دربارهٔ خودت — هنوز همان را می‌خواهی؟", go: function () { A.go("lprob", y.p.id); } }); });
        D.coach.forEach(function (y) { items.push({ k: "knot", live: 1, txt: "🧑‍🏫 پیگیریِ مربیگری: «" + clip((y.coach && y.coach.who) || "", 30) + "» — «" + clip(y.p.title, 50) + "»", sub: "این بار بی همان پرسش (یا با پرسشی کلی‌تر) می‌رسد؟", go: function () { A.go("lprob", y.p.id); } }); });
      } catch (e) { console.warn(e); }
      return items;
    };
    A.dueList._live = true;
  }

  /* ---------- نما و منو ---------- */
  A.VIEW_META = A.VIEW_META || {};
  A.VIEW_META.lprob = { j: "untie", what: "یک مسئلهٔ حل‌نشدهٔ خودت (تصمیم، پروژه، پرسشِ فکری) در همان تونلِ حل: فهم با فهرستِ داده‌ها، طرح با یک پرسش در هر نوبت، گام‌ها — در تصمیم یا مسئلهٔ عملی با پیش‌بینی و نتیجه در موعد، در مسئلهٔ کامل‌بیان‌شده با وارسی و برهانِ هر گام — و بازنگری.",
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
      var s0 = AS._turnSession, cur0 = typeof AS.cur === "function" ? AS.cur() : null, bp = A.liveSessionPid(s0);
      /* دورِ ۲ (s19): همان مسئله دوباره ساخته نمی‌شود — سشن از پیش به مسئلهٔ بازی با همین صورت بسته است */
      if (bp && (near(st, rec(bp).p.statement) || txt(st) === txt(rec(bp).p.statement))) return "";
      /* G5 (دورِ ۶، s13/s30): بی nat ِ صریحِ مدل ⇒ پیشنهاد (natBy: "guess"، کارتِ فهم پیش‌انتخاب می‌کند و کاربر عوضش می‌کند): حدسِ کد از همین صورت ⇐
         حدسِ نوعِ مدل در گزارشِ وضعِ همین سشن ⇐ ردهٔ مربیِ همین گفت‌وگو (زندگی/عملی/عینی) — گفت‌وگو داورِ مسئله را پیش‌تر شناخته بود */
      var nat0 = NAT[a && a.nat] ? a.nat : "", natBy0 = "assistant";
      if (!nat0) { var C0 = (s0 && s0.coach) || {}, cl0 = C0.cls; nat0 = natGuess(st + " " + ti) || (NAT[C0.natSug] ? C0.natSug : "") || (cl0 === "life" ? "life" : cl0 === "pract" ? "practical" : cl0 === "obj" || cl0 === "prove" ? "objective" : ""); natBy0 = "guess"; }
      var r = create(ti, st, a && a.kind, { by: "assistant", sess: (s0 && s0.id) || "", nat: nat0, natBy: natBy0 });
      /* فقط سشنِ همین نوبت (نه سشنِ کهنه) و به خواستِ خودِ کاربر در همین گفت‌وگو ⇒ عوض شدنِ مسئلهٔ سشن مجاز است */
      if (s0) A.liveBindSession(r.p.id, s0, { force: !!(cur0 && cur0.id === s0.id) });
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
    /* E5/E8 (دورِ ۴): گیرِ کاربر در همین نوبت؛ ضرب‌المثلِ خودِ کاربر (s35)؛ سطرهای کتاب برای هر مرحله از پوششِ تور (coverage: A263/B188 پارادوکسِ مخترع،
       A038/B051 به تعریف برگرد، C145/B162/A269 اکتشافی را ناتمام برچسب بزن، C168 قارچ‌ها خوشه‌ای) — فقط در قلاب، پرامپتِ سامانه دست نمی‌خورد */
    var STUCK_L = /گیر\s*(?:کرد|افتاد)|نمی\s*(?:دونم|دانم)|جلو\s*نمی\s*(?:رم|روم|ره)|به\s*جایی\s*نمی|راهی\s*نیست|هیچ\s*کاری\s*نمی|جور\s*نمی\s*(?:شه|شود|ده)|نمی\s*تونم\s*ادامه|نتونستم|نتوانستم|باز\s*(?:هم\s*)?نشد|کم\s*آوردم|از\s*پسش\s*بر\s*نمیام/;
    /* دورِ ۹ (s35x): «گفتن/می‌گن» ِ گزارشِ عادی («گفتن سطل‌ها کمه») ضرب‌المثل نیست — فقط با نشانهٔ صریح (به قول، ضرب‌المثل، مثلِ معروف) یا نقلِ داخلِ گیومه */
    var OWN_PROV = /(?:به\s*قولِ?|ضرب\s*المثل|مثلِ?\s*معروف|(?:می\s*گن|میگن|گفته\s*اند)\s*[«"“])[^.؟?!\n]{3,80}|آب\s*که\s*از\s*سر\s*گذشت[^.؟?!\n]{0,40}|کار\s*از\s*کار\s*گذشت[^.؟?!\n]{0,30}/;
    var BOOK_L = { p: "پارادوکسِ مخترع — گاهی مسئلهٔ کلی‌تر (طرحِ بلندپروازانه‌تر) آسان‌تر است؛ اگر همین را نمی‌توانی، کلی‌ترش را بیازما · به تعریف‌ها برگرد — واژهٔ کلیدیِ مبهم را با تعریفش جایگزین کن؛ عنصرهای تازه از همان می‌آیند.",
      c: "استدلالِ اکتشافی (شهود، قیاس، استقرا) داربست است، نه برهان — هنگامِ اجرا فقط گامِ قطعی را بپذیر و هر گامِ اکتشافی را «ناتمام» برچسب بزن؛ هرگز آن را برهانِ کامل نفروش.",
      b: "قارچ‌ها خوشه‌ای می‌رویند — پس از حل، دنبالِ مسئله‌های همسایه بگرد · استدلالی که فقط اکتشافی بود را «ناتمام» نام ببر، نه «اثبات شد»." };
    /* سشنی که مسئلهٔ زندهٔ باز دارد، قاعدهٔ «بساز» را دوباره نمی‌گیرد (دورِ ۲، s26: قاعده‌ها دوباره تزریق می‌شد و مسئلهٔ تکراری ساخته می‌شد) */
    AS.promptHooks.push(function (s, msg) { if (A.liveSessionPid(s)) return ""; var recent = [String(msg || "")].concat(((s && s.msgs) || []).filter(function (m) { return m.role === "user"; }).slice(-4).map(function (m) { return m.text; })).join(" "); return LIVE_RE.test(recent) ? RULES : ""; });
    AS.promptHooks.push(function (s, msg) {
      var st = A.state || {}, onPage = st.view === "lprob" || (st.view === "e_prob" && rec(st.arg)), bp = A.liveSessionPid(s), pid = onPage ? st.arg : bp || (s && s.lprob), r = rec(pid); if (!r) return "";
      var pg = pgOf(pid), so = solOf(pg), ph = phaseOf(so);
      if (ph === "done") return "";   // مسئلهٔ بسته‌شده دیگر «مسئلهٔ زندهٔ این سشن» نیست
      /* دورِ ۲ (R1/R2): سشنی که به این مسئله بسته است (ساختنِ آن در همین سشن، یا رفتن به صفحه‌اش) همیشه این بلوک را می‌گیرد — بی شرطِ واژهٔ مشترک.
         فقط سشنِ نابسته‌ای که پیشینه دارد هنوز به «دو واژهٔ مشترک» نیاز دارد. */
      if (!onPage && bp !== pid) { var mt0 = toks(msg), pt = toks([r.p.title, r.p.statement, (uOf(so) || {}).u].join(" ")); if (mt0.filter(function (w) { return hit(w, pt); }).length < 2) return ""; }
      var nat = natOf(so, r), ki = A.liveKindInfo(pid), cl = A.liveClosure(pid), L0 = live(so), u0 = uOf(so) || {};
      var Q = phaseQs(r, so, ph);
      var tu = (s && (s.lpTutor = s.lpTutor || {})) || {}, k = pid + "|" + ph, mt = String(msg || "").trim();
      if (mt && !/^\[سامانه/.test(mt) && tu.last !== mt) { tu[k] = tu.last == null || tu.ph !== k ? (tu[k] || 0) : (tu[k] || 0) + 1; tu.last = mt; tu.ph = k; }
      /* پرسشِ پیشنهادی: همان که A.liveCoach می‌دهد (هم‌گام با صفحه؛ پرسشِ پاسخ‌گرفته در صفحه نه) */
      var askedS = ((s && s.msgs) || []).filter(function (m) { return m && m.role === "ai"; }).map(function (m) { return String(m.text || ""); }), askedQ = Q.concat(ph === "u" ? [Q_WHOLE] : []).filter(function (x) { return askedS.some(function (t) { return t.split(/(?<=[؟?])\s+|\n+/).some(function (y) { return /[؟?]/.test(y) && sameQ(y, x); }); }); });
      var stuckNow = STUCK_L.test(norm(msg)), co = A.liveCoach(pid, { asked: askedQ, stuck: stuckNow, turn: { stuck: stuckNow, text: String(msg || "") } }) || {}, qNow = co.q || "", un = unusedOf(so, pg), o = openStep(so);
      var provM = OWN_PROV.exec(String(msg || "")), bookL = BOOK_L[ph] || "";
      var gg = so.g && so.g[1], refT = gg && gg.guess && (gg.hit === "نادرست بود" || guessCons(so).no) ? gg.guess : "";
      /* هماهنگ با مربی (دورِ ۶): سطرِ «حدسِ ردشده — بپرس از ردش چه آموخت» فقط در نخستین نوبت پس از رد (و تکرارِ همان پیام)، نه هر نوبت */
      var refK = refT ? pid + "|" + refT : "", refFirst = false;
      if (refK) { if (tu.refK !== refK) { tu.refK = refK; tu.refMsg = mt; refFirst = true; } else refFirst = tu.refMsg === mt; }
      /* H3 (دورِ ۷، s19): «بپرس از ردش چه آموخت» فقط در روزِ خودِ رد — نه نخستین نوبتی که شش هفته بعد می‌آید */
      var refSt = refT ? L0.steps.filter(function (x) { return x.out && x.out.guess && x.out.guess.rel === "refute"; }).pop() : null, refD = refSt ? refSt.out.d || String(refSt.out.at || "").slice(0, 10) : "";
      if (refD && refD !== A.today()) refFirst = false;
      var pv = provOf(ph === "u" ? "u" : ph === "p" ? "p" : ph === "c" ? (nat === "objective" ? "cobj" : "c") : "b", proofLike(r, so)), rt = ph === "p" && Q.length ? roteState(pg, so, Q) : null;
      var cu = condUsed(so).filter(function (x) { return !x.used; });
      /* دورِ ۱۰ (J1، سویِ بلوکِ زنده): یک پرسش در هر بلوک — پرسشِ نوبت یا پرسشِ «داور؟» (D4؛ مگر کارِ همین نوبت پرسشِ نوبت باشد) است یا سطرِ «فقط یک پرسش»؛
         هر سطرِ دیگرِ همین بلوک که پرسشی پیشنهاد می‌کند (عملی، مکانیکی، ردِ حدس، شرطِ متناقض، پیش‌فرض، ضرب‌المثل، نگاشت) «زمینه (نه پرسشِ دوم)» است و «بپرس» ندارد */
      var kindTurn = !ki.set && !/^turn-/.test(String(co.src || "")), qTurn = !!(Q.length && qNow) && !kindTurn, TQ = kindTurn || qTurn, CTX = "- زمینه (نه پرسشِ دوم): ";
      return ["# مسئلهٔ زندهٔ این سشن (" + pid + "): «" + clip(r.p.title, 80) + "» · مرحله: " + phName(ph, r, so) + " · داور: " + (ki.set ? NAT[nat].fa.split(" — ")[0] : "هنوز انتخاب نشده") + (ki.type !== "find" ? " · نوع: " + (nat !== "objective" ? "فرضیه — درست یا نادرست؟ (داور واقعیت است، نه برهان)" : ki.type === "prove" ? "اثباتی" : "اثبات یا رد کن") : "") + (ki.spatial ? " · فضایی" : "") + " · وضع: " + cl.label,
        /* D4: داورِ انتخاب‌نشده ⇒ قابِ خنثی (اول نوع را بپرس)، نه قابِ «زندگی — هیچ‌کس نمی‌داند» */
        !ki.set && !kindTurn ? CTX + "داورِ این مسئله هنوز انتخاب نشده: پس از پرسشِ این نوبت، نوعش را روشن کن — پاسخش عینی است (ریاضی، اثبات، معما)، مسئلهٔ عملی با کمیت است، یا تصمیم/پرسشِ زندگی. تا آن وقت نه حلش کن، نه دربارهٔ درستیِ چیزی داوری کن؛ فیلدهای صفحه را پر نکن (data-own)."
          : !ki.set ? "- داورِ این مسئله هنوز انتخاب نشده: پیش از هر پرسشِ دیگر بپرس پاسخش عینی است (ریاضی، اثبات، معما)، مسئلهٔ عملی با کمیت است (خرید، ساخت، پول، زمانِ خودش)، یا تصمیم/پرسشِ زندگی — قابِ همهٔ پرسش‌های بعد از همین می‌آید. تا آن وقت نه حلش کن، نه دربارهٔ درستیِ چیزی داوری کن؛ فیلدهای صفحه را پر نکن (data-own)."
          : nat === "objective" ? "- این مسئله پاسخِ عینی دارد (ریاضی، اثبات، معما) ولی کاربر هنوز حلش نکرده: پاسخ یا راه را لو نده و گامی را جای او برندار. داورِ هر گام برهان و وارسیِ خودِ اوست (کارتِ اجرای صفحه همان را از او می‌خواهد)؛ اگر گامی نادرست است، کمک همان پرسشِ این نوبت است، نه گفتنِ جواب. فیلدهای صفحه را پر نکن (data-own)."
          : "- پاسخِ این مسئله را هیچ‌کس نمی‌داند — نه تو نه صفحه. حلش نکن، تصمیم را جای او نگیر، و دربارهٔ درستیِ گام‌ها یا تصمیمش داوری نکن (داور واقعیت و داوریِ خودِ اوست). فیلدهای صفحه را پر نکن (data-own).",
        nat === "practical" ? CTX + "مسئلهٔ عملی: داده‌ها بی‌شمار و نادقیق‌اند — آنچه به کار می‌آید: کدام داده‌ها اثرِ محسوس دارند، کجا خط می‌کشد و کدام تقریب بس است (هر کدام پرسشِ نوبتی دیگر)؛ داده‌ای که با دلیل کنار گذاشته شده رسیدگی‌شده است." : "",
        r.coach ? "- کاربر مربیِ «" + clip(r.coach.who, 30) + "» است، نه حل‌کننده: پرسش‌هایی برای پرسیدن از یادگیرنده پیشنهاد کن (کلی ⇐ خاص)، هرگز پاسخ؛ یک پرسش یا یک ایده در هر پیام." : "",
        rt ? CTX + "کاربر پرسش‌ها را مکانیکی پاسخ داده (" + rt.why + "): «پرسش‌ها را مکانیکی نخوان» را یادآوری کن — پرسشِ این نوبت همان یکی است که با وضعِ همین لحظه می‌خواند." : "",
        Q.length && qNow && kindTurn ? CTX + "پرسشِ بعد از روشن شدنِ داور، از همین فهرست (پلهٔ " + fa((co.rung || 0) + 1) + " از " + fa(Q.length) + "): «" + qNow + "» — نه در همین نوبت." : "",
        qTurn ? "- در این نوبت فقط **یک** پرسش، از همین فهرست و از کلی به خاص (پلهٔ " + fa((co.rung || 0) + 1) + " از " + fa(Q.length) + "؛ پرسش‌هایی که پرسیده یا پاسخ گرفته‌ای دوباره نه)؛ پرسشِ پیشنهادیِ این نوبت: «" + qNow + "». اگر با وضعِ همین لحظه نمی‌خواند، پرسشِ بعدیِ همین فهرست." : "",
        Q.length && co.ladderEnd ? (kindTurn ? CTX : "- ") + "نردبانِ پرسش‌های این مرحله تمام شد: اگر نردبان تمام شد: ایدهٔ کلیدی را جدا کن و فقط گامِ بعد را بگو، سپس «کتاب را ببند و خودت دوباره حل کن»." : "",
        refT && refFirst ? CTX + "حدسی که خودش با آزمون رد کرد: «" + clip(refT, 100) + "» — آن را دوباره پیشنهاد نکن؛ «از ردش چه آموخت و کدام فرضِ پنهان شکست؟» " + (TQ ? "برای پس از پرسشِ این نوبت است" : "نامزدِ پرسشی است که مربی برای همین نوبت برمی‌گزیند (یک پرسش)") + "، اگر خودش به آن نرسید." : "",
        /* E3/E8 (دورِ ۴، s11/s25): فهرست کامل و هر پرسش کامل — پرسشِ پیشنهادیِ هشتم یا پرسشِ بلندِ استقرا دیگر بریده نمی‌شود */
        Q.length > 1 ? "- پرسش‌های همین مرحله (برای همین نوعِ مسئله): " + Q.map(function (x) { return "«" + x + "»"; }).join(" · ") : "",
        pv ? "- حکمتِ ضرب‌المثل‌ها برای همین مرحله (فقط اگر به کار آمد، همراهِ پرسشی که پشتیبانی می‌کند؛ قاعدهٔ قطعی نیست): «" + pv.t + "» ⇐ «" + pv.q + "»" : "",
        /* E3 (دورِ ۴، s30/s33/s35): «همهٔ داده‌ها؟» پس از وجودِ طرح یا وقتی کاربر گیر کرده — نه در آغازِ طرح‌ریزی که هر داده‌ای هنوز «به‌کارنرفته» است */
        un.length && (ph === "c" || ph === "b" || (ph === "p" && stuckNow)) ? CTX + "داده‌هایی که هنوز در کارِ حل نیامده‌اند (نام بردنش در گفت‌وگو به کار بردن نیست): " + un.map(function (d) { return "«" + clip(d.t, 50) + "»"; }).join("، ") + " — «همهٔ داده‌ها را به کار بردی؟» و پس از آن «از … استفاده کردی؟» (با نامِ یکی) نامزدِ پرسشِ نوبت‌اند وقتی گیر است، نه پرسشی کنارِ پرسشِ این نوبت." : "",
        cu.length && (ph === "c" || ph === "b") && nat === "objective" ? "- بخش‌هایی از شرط که هنوز در هیچ گامی نیامده‌اند: " + cu.map(function (x) { return "«" + clip(x.t, 50) + "»"; }).join("، ") : "",
        (suffNow(so) === "متناقض است" || u0.sat === "no") && ph === "p" ? CTX + "کاربر گفته شرط متناقض است یا برآوردنی نیست: راهِ پیشِ رو شل کردنِ یک بخشِ شرط است (فقط بخشی از شرط را نگه دار) — یا اثباتِ این‌که برآوردنِ هم‌زمانِ بخش‌ها ناممکن است." : "",
        cl.state === "incomplete" ? "- بازنگری ایراد یافت و مسئله ناتمام است (" + cl.label + "): «حل شد» نگو و جشن نگیر؛ کمک کن همان ایراد را خودش درست کند." : cl.gate.length ? "- پیش از «حل شد» باز مانده: " + cl.gate.map(function (x) { return (x.k === "aux" ? "پلِ برگشت از مسئلهٔ کمکیِ «" : "گامِ شهودیِ ثابت‌نشدهٔ «") + clip(x.t, 50) + "»"; }).join("، ") + " — مسئلهٔ کمکی حل شد ≠ مسئلهٔ اصلی حل شد." : "",
        o ? "- گامِ واقعیِ باز: «" + clip(o.text, 80) + "» · پیش‌بینی‌اش «" + clip(o.pred, 80) + "» · وارسی " + o.due + " — نتیجه را خودش در صفحه ثبت می‌کند." : "",
        /* G2 (دورِ ۶، s21): یک پرسش در هر بلوک — دادهٔ کنارگذاشته وقتی گیر است خودش پرسشِ نوبت است (stuck-aside)؛ وگرنه فقط زمینه، نه پرسشِ دوم */
        stuckNow && (co.aside || []).length && !/aside/.test(co.src || "") ? "- زمینه (نه پرسشِ دوم): کاربر داده‌ای را پیش‌تر کنار گذاشته بود: " + co.aside.map(function (x) { return "«" + clip(x.t, 50) + "» (دلیلش: «" + clip(x.why, 50) + "»)"; }).join("، ") + " — اگر پرسشِ این نوبت راه نبرد، همین داده نامزدِ بعدی است." : "",
        r.origin && r.origin.type === "lprob" && txt(r.origin.map) ? CTX + "این مسئله با نگاشتِ هم‌ریختیِ خودِ کاربر از مسئلهٔ «" + clip((rec(r.origin.id) || { p: { title: "" } }).p.title, 40) + "» ساخته شد: «" + clip(r.origin.map, 160) + "» — وقتی به گام رسید، هر گام از راهِ همین نگاشت به کدام گامِ حلِ آن برمی‌گردد." : "",
        u0.presup && txt(u0.suffCirc) && (ph === "c" || ph === "b") ? CTX + "پیش‌فرضی که کاربر نگه داشت تا بیازماید: «" + clip(u0.suffCirc, 100) + "» — اگر نتیجه‌ای با آن نخواند، همین نامزدِ پرسشِ نوبتِ بعد است." : "",
        provM ? CTX + "کاربر ضرب‌المثلِ خودش را آورد («" + clip(provM[0], 80) + "»): " + PROV_LIMIT + " — نه تأییدش کن نه ردش؛ «در همین موقعیت درست است یا ضدش، و کدام داده آن را می‌گوید؟» " + (TQ ? "برای پس از پرسشِ این نوبت است." : "نامزدِ پرسشی است که مربی برای همین نوبت برمی‌گزیند (یک پرسش).") : "",
        /* دورِ ۱۲ (L2): سطرهای کتاب (پارادوکسِ مخترع، «به تعریف‌ها برگرد»، …) نامزدند، نه دستوری کنارِ پرسشِ این نوبت */
        bookL ? CTX + "از کتاب برای همین مرحله (فقط اگر به کار آمد؛ پرسشِ این نوبت همان یکی است): " + bookL : "",
        bp === pid ? CTX + "این گفت‌وگو به همین مسئله بسته است؛ مسئلهٔ تازهٔ دیگری که کاربر بیاورد یا جای این را می‌گیرد یا جدا ساخته می‌شود — آن انتخاب کارِ نوبتی است که او مسئلهٔ دیگری بیاورد، نه پرسشی کنارِ پرسشِ این نوبت." : ""].filter(Boolean).join("\n");
    });
  }
})(APP);
