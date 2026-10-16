/* ===== «🔍 غربالِ لایه‌ها» و «🧩 نقشهٔ پیش‌نیازها» (مالک ۲۰۲۶-۱۰-۱۴) =====
   مالک: «سیستم به هیچ چیز نه نمی‌گفت و همه را راه می‌داد … ولی نباید حرفِ به‌ظاهر بی‌ربط را هم سریع رد کند؛ با پرسش‌های دقیق و موشکافانه
   از خودش، با ریز شدن و شکاف دادن ببیند چه گره یا مسئله‌ای برای گوینده در آن هست، دسته‌بندی، ترتیب و اولویت دهد و تور بسازد … ریشه‌های ثابت
   را در چیزهای به‌ظاهر متفاوت ببیند … و اگر مسئله‌ای علمی را نفهمیدم، بفهمد کدام علمِ مقدماتی را دقیقاً نمی‌دانستم».
   ۱) غربال: فهرستِ لایه‌ها از ثبت‌گاه‌ها (لایه‌های پایه + **هر ۱۲ خانوادهٔ گره از A.KF** + معرفت + مسئله/پیش‌نیاز/یادگیری + ریشهٔ مشترک)؛
      مدل برای هر لایه حکم می‌دهد (پیدا شد با شاهد از حرفِ خودِ کاربر / رد شد / باید پرسید / بیرون از صفحه) و وجه‌های تور فقط از یافته‌ها
      و به **ریشه** ساخته می‌شوند. دیدنی در کشوی تور و در ایمیل.
   ۲) نقشهٔ پیش‌نیازها: برای مسئله/مطلبی که فهمیده نشد — هر مفهومِ لازم با علم، شاخه، «در کدام گامِ حل لازم است» و یک پرسشِ تشخیصی؛
      سنجش با خودِ کاربر (هوش مصنوعی فقط پیشنهاد می‌دهد)؛ هر پیش‌نیازِ نبوده ⇒ یک موضوعِ یادگیری با سفرِ ۱۱ گامی؛ در پایان بازگشت به مسئلهٔ اصلی. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, AS = A.ASSIST;
  if (!AS || !A.V) return;
  function clip(s, n) { s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function nowIso() { return new Date().toISOString(); }

  /* ---------- لایه‌ها (از ثبت‌گاه؛ خانواده‌های گره از خودِ A.KF) ---------- */
  var BASE = [
    { g: "پایه", id: "safety", fa: "ایمنی و حال", q: "نشانهٔ پریشانیِ جدی هست؟ اول حالش." },
    { g: "پایه", id: "want", fa: "خواستهٔ واقعیِ پشتِ حرف", q: "در واقع چه می‌خواهد؟ «حل‌شدن» برایش چه شکلی است؟ چه چیزی را نگفته؟" },
    { g: "پایه", id: "recur", fa: "تکرار و ریشهٔ مشترک", q: "این الگو پیش‌تر هم رخ داده؟ در جاهای دیگرِ زندگی هم (کار، رابطه، پول، درس) همین شکل را دارد؟ با گره‌ها و موقعیت‌های پیشینش (فهرستِ «# گره‌های پیشینِ کاربر») همان ریشه/ساختار را دارد؟" },
    { g: "معرفت", id: "claim", fa: "ادعا یا باورِ پنهان", q: "کدام جمله‌اش ادعایی است که اگر نادرست باشد همه‌چیز عوض می‌شود؟ (کارخانه)" },
    { g: "معرفت", id: "route", fa: "راهِ دانستن و خطای همان راه", q: "آن را از کجا می‌داند — حس، نقل، تجربه، استقراء، تخصصِ دیگران، شهود؟ خطای رایجِ همان راه اینجا هست؟ دانشِ «عملی/ضمنی» (چشم و بو، مهارتِ دست) هم راهِ خودش را دارد: تمرین با بازخوردِ فوری و دیدنِ کارِ استاد، نه فقط دستورِ نوشته." },
    { g: "مسئله و دانش", id: "problem", fa: "مسئلهٔ سختِ مشخص", q: "مسئله‌ای مشخص (حل‌شده یا نه) هست که باید تجزیه، شبیه‌سازی و با هم‌ساختارها تمرین شود؟" },
    { g: "مسئله و دانش", id: "practical", fa: "مسئلهٔ عملی (تصمیم، کار یا برنامه)", q: "مسئلهٔ عملی‌ای هست که پیش از هر راه‌حل باید قاب شود — چه می‌خواهد (مجهول)، چه دارد (داده)، کدام قیدها (شرط)، کدام مفهومِ مبهم، کدام داده را عمداً کنار می‌گذارد و تا کجا اطلاعات جمع می‌کند، و کدام تقریب بس است؟" },
    { g: "مسئله و دانش", id: "prereq", fa: "دانشِ پیش‌نیازِ نبوده", q: "برای فهمیدن/حلِ آن کدام مفهوم از کدام علم و در کدام گامِ حل لازم است — و آیا آن را دارد؟ (🧩 نقشهٔ پیش‌نیازها)" },
    { g: "مسئله و دانش", id: "learn", fa: "یادگیری و ماندگاری", q: "چیزی هست که باید عمیق فهمیده و ماندگار شود (موضوع، سفرِ ۱۱ گامی، مرور)؟ «چطور این نوع چیز را یاد بگیرم» (مثلاً مهارتِ ضمنی با بازخورد) خودش درسی است که به چیزهای دیگرِ زندگی‌اش هم منتقل می‌شود؟" },
    { g: "پایه", id: "info", fa: "اطلاعاتِ ناموجود", q: "برای تشخیص چه چیزی را هنوز نمی‌دانیم و باید یکی‌یکی از او پرسید؟" },
    { g: "پایه", id: "territory", fa: "حوزه‌ای که هنوز نیست", q: "حوزه و ابزارش در قلمروها هست؟ گامِ ۰/۱ و او همین حالا لازم دارد ⇒ برگه." },
    { g: "پایه", id: "outside", fa: "بیرون از این صفحه", q: "کدام بخش واقعاً کارِ این صفحه نیست (درمان، حقوق، پولِ شخصی، تصمیمِ خودِ زندگی)؟ — فقط همان بخش، نه کلِ حرف." }
  ];
  var ST = { found: "پیدا شد", no: "رد شد", ask: "باید پرسید", out: "بیرون از صفحه" };
  /* قابِ مسئلهٔ عملی (لایهٔ practical): همان «مجهول / داده / شرط» ِ حلِ مسئله برای تصمیم و کار، به‌اضافهٔ مفهومِ مبهم، دادهٔ کنارگذاشته و
     حدِ گردآوریِ اطلاعات (⇐ ایستگاهِ «مسئولیتِ معرفتی» st_resp) و تقریبِ کافی. هر جزء فقط از حرفِ خودِ کاربر (tour_diag … parts). */
  var PRACT = [["unknown", "مجهول: دقیقاً چه می‌خواهی — «حل‌شدن» چه شکلی است؟"], ["data", "داده: چه داری (دانسته‌ها، منابع، امکان‌ها)؟"],
    ["cond", "شرط: کدام قیدها (زمان، پول، آدم‌ها، قاعده‌ها) — و کدامش واقعی است، کدام فرضی؟"], ["vague", "کدام مفهومِ مبهم را باید پیش از هر کار روشن کنی؟"],
    ["ignore", "کدام داده را عمداً کنار می‌گذاری و تا کجا اطلاعات جمع می‌کنی؟"], ["approx", "کدام تقریب بس است — جوابِ «به‌اندازهٔ کافی خوب» چیست؟"],
    /* R4 — تصمیمِ مالک (۲۰۲۶-۱۰-۱۵): دانشِ پیشین/تجربیِ نادقیق و ریاضی‌کردن (کمیت و رابطه؛ وارسیِ کدیِ A.measurableCheck ِ a16) */
    ["prior", "دانشِ پیشین: از تجربهٔ خودت یا دیگران (حتی نادقیق) دربارهٔ چنین مسئله‌ای چه می‌دانی؟"], ["measure", "ریاضی‌کردن: مجهول را کمیتی با عدد/واحد و موفقیت را یک رابطه بنویس (مثلاً x ≥ …)؟"]];
  AS.practicalParts = PRACT;
  /* قابِ کامل ⇒ یک کارتِ مرور (یک بار) — با کد، چه جزءها را دستیار از حرفِ کاربر ثبت کرده باشد چه خودِ کاربر در کشوی تور نوشته باشد */
  function practicalCard(s, x) {
    if (!x || x.card) return null; var pp = x.parts || {};
    var chk = A.practicalFrameCheck ? A.practicalFrameCheck(pp, PRACT) : { ok: PRACT.every(function (q) { return pp[q[0]]; }) };
    if (!chk.ok) return null;
    var rows = PRACT.map(function (q) { return [q[1].split(/[:؟]/)[0], pp[q[0]]]; }), title = (s.tour && s.tour.goal) || s.pinned || "تصمیم";
    var cd = A.practicalFrameCard ? A.practicalFrameCard(title, rows, "sieve:practical")
      : A.newCard && A.newCard("قابِ مسئلهٔ عملیِ «" + clip(title, 80) + "»", rows.map(function (r) { return r[0] + ": " + r[1]; }).join("\n"), { due: A.addDays(A.today(), 1), src: "sieve:practical" });
    if (cd) x.card = cd.id; return cd;
  }
  /* بی‌مدل: کاربر جزءِ مانده را خودش در کشوی تور می‌نویسد (data-own) — همان انباشت، همان کارت */
  AS.sievePracticalSet = function (s, key, val) {
    if (!s || !s.tour || PRACT.map(function (q) { return q[0]; }).indexOf(key) < 0) return false;
    var v = String(val || "").trim(); if (!v) return false;
    var d = s.tour.diag = s.tour.diag || {}, x = d.practical = d.practical || { st: "found", why: "", at: nowIso() };
    if (x.st !== "found") { (x.hist = x.hist || []).push({ st: x.st, why: x.why, at: x.at }); x.st = "found"; }
    x.why = x.why || "قابِ مسئلهٔ عملی را خودت نوشتی"; x.parts = x.parts || {}; x.parts[key] = clip(v, 300); x.at = nowIso();
    practicalCard(s, x); S.put(s); return true;
  };
  AS.sieveLayers = function () {
    var fam = (A.KF || []).map(function (F) { return { g: "ریشه‌های گره (۱۲ خانواده)", id: F.id, fa: F.fa, q: F.blurb || "" }; });
    // ترتیب: پایه‌های اول، بعد خانواده‌ها، بعد معرفت و مسئله، و پایه‌های پایانی
    var head = BASE.slice(0, 3), rest = BASE.slice(3);
    return head.concat(fam, rest);
  };
  // نام‌های نزدیک (کارزارِ آزمونِ دوم c16: «repeat» به جای «recur» ⇒ «لایهٔ ناشناخته» در گفت‌وگو)
  var ALIAS = { repeat: "recur", recurrence: "recur", recurring: "recur", pattern: "recur", prerequisite: "prereq", prerequisites: "prereq", knowledge: "prereq", belief: "claim", epistemic: "route", epistemology: "route", missing_info: "info", information: "info", learning: "learn", hard_problem: "problem", goal: "want", need: "want", risk: "safety", out: "outside" };
  function layerOf(id) { id = String(id || "").trim().replace(/^kf_/, ""); var lo = id.toLowerCase(); if (ALIAS[lo]) id = ALIAS[lo]; else if (/^f\d+$/.test(lo)) id = id.toUpperCase(); return AS.sieveLayers().filter(function (L) { return L.id === id; })[0]; }
  /* بی تور هم غربال در سشن می‌ماند (s.diag) و به مدل می‌رسد — تورِ پولیا (دستهٔ ۱): tour_diag ِ بی‌تور فقط «در انتظار» می‌ماند و قابِ مسئلهٔ عملی هرگز به مدل نمی‌رسید */
  AS.sieveState = function (s) { return (s && s.tour && s.tour.diag) || (s && s.diag) || {}; };
  /* شاهدِ لایه: بخش‌های «؛»‌جدا یکتا، بخشی که درونِ بخشِ دیگری هست حذف، و هر نقل‌قولِ «…» فقط بارِ اول */
  function nrm(x) { return String(x || "").replace(/[\s\u200c«»"'.,،:؛!?؟()\-]+/g, ""); }
  function dedupWhy(w) {
    var parts = String(w || "").split(/\s*؛\s*/).map(function (x) { return x.trim(); }).filter(Boolean), keep = [];
    parts.forEach(function (x) { var n = nrm(x); if (!n) return; if (keep.some(function (k) { return nrm(k).indexOf(n) >= 0; })) return; keep = keep.filter(function (k) { return n.indexOf(nrm(k)) < 0; }); keep.push(x); });
    var seen = {};
    return keep.join(" ؛ ").replace(/«([^«»]{2,})»/g, function (m0, q) { var k = nrm(q); if (seen[k]) return "(همان نقل)"; seen[k] = 1; return m0; }).trim();
  }
  AS.sieveDedupWhy = dedupWhy;
  /* پرسش‌های بدهکاری که **پیش از رفتن به فرم** باید پرسیده شوند (کارزارِ سوم v03: ایمنی و «باور/گفت‌وگوی درونی دربارهٔ خود» پرسیده نشد و فرمِ گره باز شد):
     ایمنی و حال، باور دربارهٔ خود (F9)، هیجان و انگیزه (F7) — اگر «باید پرسید» است */
  var BEFORE_FORMS = ["safety", "F9", "F7"];
  AS.owedBeforeForms = function (s) { var d = AS.sieveState(s); return AS.sieveLayers().filter(function (L) { return BEFORE_FORMS.indexOf(L.id) >= 0 && d[L.id] && d[L.id].st === "ask"; }); };

  var DO = AS.DO;
  DO.tour_diag = function (a) {
    var s = AS._turnSession; if (!s) return "سشن نیست";
    var list = Array.isArray(a.layers) ? a.layers : Array.isArray(a.diag) ? a.diag : a.id ? [a] : [], bad = [], safetyHeld = false;
    // غربال پیش از طرحِ تور (در همان نوبت) نگه داشته و پس از tour_plan اعمال می‌شود (کارزارِ آزمون c03/c06: گم می‌شد)
    // و بی تور در غربالِ خودِ سشن (s.diag) هم همین حالا ثبت می‌شود تا همین نوبت به مدل برسد (تورِ پولیا، دستهٔ ۱)
    if (!s.tour) s._diagPending = (s._diagPending || []).concat(list);
    var d = s.tour ? (s.tour.diag = s.tour.diag || {}) : (s.diag = s.diag || {});
    list.forEach(function (x) {
      var L = x && layerOf(x.id); if (!L) { bad.push(String(x && x.id)); return; }
      var st = ST[x.st] ? x.st : "ask", why = String(x.why || "").replace(/^[\s—\-–.]+$/, "").trim();
      // «پیدا شد» فقط با شاهد از حرفِ خودِ کاربر؛ «رد شد» هم فقط با دلیل — «هنوز نگفته» یعنی «باید پرسید» (کارزارِ آزمون c09/c10: ۲۰ لایه پس از یک پاسخ رد شد)
      if ((st === "found" || st === "no") && why.length < 3) st = "ask";
      var prev = d[L.id];
      // یک لایه چند یافته می‌گیرد (کارزارِ آزمون c10: کالیبراسیون زیرِ نشخوار گم شد)
      if (prev && prev.st === "found" && st === "found" && prev.why && prev.why.indexOf(why) < 0) why = prev.why + " ؛ " + why;
      why = dedupWhy(why);   // همان نقل‌قول سه بار در فهرستِ لایه‌ها نیاید (کارزارِ سوم v03)
      if (prev && prev.st === "found" && st === "no") { (prev.hist = prev.hist || []).push({ st: prev.st, why: prev.why, at: prev.at }); }
      // ایمنی: «رد شد» ِ مدل فقط با انکارِ صریحِ خودِ کاربر پس از نشانه و نقلِ عینیِ آن در why؛ وگرنه «باید پرسید» (بازبینیِ متقابلِ ۲۰۲۶-۱۰-۱۵)
      if (L.id === "safety" && st === "no" && s.safetyAt && !AS.safetyClearMsg(s, { st: "no", why: why, at: nowIso(), seq: s.seq })) { st = "ask"; safetyHeld = true; }
      /* گره‌ای (یکی از ۱۲ خانواده) که در میانهٔ حلِ مسئله پیدا شد ⇒ رویدادِ ناموفقِ همان مرحله در «🧩 چهار مرحلهٔ حل» (R7) — فقط بارِ نخست */
      if (st === "found" && !(prev && prev.st === "found") && /^F\d+$/.test(L.id) && AS.coachEvent) { var cph = (AS.boundLive && AS.boundLive(s) && !AS.boundLive(s).done && A.livePhase) ? A.livePhase(s.lprob) : (s.coach && s.coach.ph); if (cph && cph !== "done") try { AS.coachEvent(s, cph, "knot", L.id + ":" + why); } catch (e) { } }
      d[L.id] = { st: st, why: clip(why, 500), facet: x.facet ? String(x.facet).slice(0, 12) : (prev && prev.facet) || "", at: nowIso(), seq: s.seq, hist: prev && prev.hist };
      // قابِ مسئلهٔ عملی: جزءها انباشته می‌شوند (هر نوبت یکی؛ پاسخِ پیشین گم نمی‌شود)
      if (L.id === "practical") { var pp = (prev && prev.parts) || {}; if (x.parts && typeof x.parts === "object") PRACT.forEach(function (q) { var v = x.parts[q[0]]; if (typeof v === "string" && v.trim().length >= 2) pp[q[0]] = clip(v.trim(), 300); }); if (Object.keys(pp).length) d[L.id].parts = pp;
        // قابِ کامل ⇒ یک کارتِ مرور (یک بار): همان شش پرسش برای تصمیمِ بعدی تمرین می‌شود — فاصله‌دار، در «مرور» و «امروز»
        var pcard = prev && prev.card; if (pcard) d[L.id].card = pcard;
        practicalCard(s, d[L.id]); }
    });
    try { if (s.tour) AS.sieveToKnots(s); } catch (e) { console.error(e); }
    var held = safetyHeld ? "ایمنی خاموش نشد (هنوز «باید پرسید»): فقط انکارِ صریحِ خودِ کاربر در پیامی پس از نشانه — با نقلِ عینیِ همان جمله در why با «…» — آن را «رد شد» می‌کند" : "";
    return [bad.length ? "لایهٔ ناشناخته: " + bad.join("، ") : "", held].filter(Boolean).join(" · ");
  };
  /* نشانهٔ پریشانی هنوز فعال است؟ واژه‌نامه آن را روشن می‌کند؛ فقط حرفِ خودِ کاربر (لایهٔ «ایمنی» با «رد شد» و دلیل، پس از آن لحظه) خاموشش می‌کند —
     کارزارِ v08: کاربر دو بار صریحاً گفت آسیبی به خودش در کار نیست ولی هر ۱۷ ایمیل با بندِ بحران باز می‌شد */
  /* بازبینیِ متقابلِ ۲۰۲۶-۱۰-۱۵: مدل به‌تنهایی هرگز خاموشش نمی‌کند. خاموش فقط وقتی:
     ۱) لایهٔ «ایمنی» «رد شد» است و پس از نشانه ثبت شده؛
     ۲) یک پیامِ **خودِ کاربر**، پس از نشانه و نه پس از آن حکم، انکارِ صریح دارد (واژه‌نامهٔ کدیِ A.knotSafetyDenial ِ a16: «نه»، «فکرِ آسیب ندارم»، …)؛
     ۳) why ِ همان حکم آن پیام را عیناً نقل کرده («…»، بخشی که انکار را در بر دارد) — حکمِ همان نوبتِ نشانه یا با دلیلِ ساختگی ⇒ هنوز فعال. */
  function qn(x) { return (A.kSafeNorm ? A.kSafeNorm(x) : String(x || "")).replace(/[\s‌«»"“”'.,،:؛!?؟()\-]+/g, ""); }
  function after(m, s) { return m.seq != null && s.safetySeq != null ? m.seq > s.safetySeq : String(m.at || "") > String(s.safetyAt); }
  function notLater(m, L) { return m.seq != null && L.seq != null ? m.seq <= L.seq : String(m.at || "") <= String(L.at || ""); }
  function quotes(why, u, deny) {
    var qs = []; String(why || "").replace(/[«"“]([^«»"“”]{1,400})[»"”]/g, function (m0, q) { qs.push(q); return m0; });
    var nu = qn(u); return qs.some(function (q) { var nq = qn(q); return nq.length >= 2 && nu.indexOf(nq) >= 0 && deny.some(function (d) { return nq.indexOf(qn(d)) >= 0; }); });
  }
  AS.safetyClearMsg = function (s, L) {
    L = L || (s && s.tour && s.tour.diag && s.tour.diag.safety);
    if (!s || !s.safetyAt || !L || L.st !== "no" || !A.knotSafetyDenial) return null;
    if (!(L.seq != null && s.safetySeq != null ? L.seq > s.safetySeq : String(L.at || "") > String(s.safetyAt))) return null;
    return (s.msgs || []).filter(function (m) {
      if (!m || m.role !== "user" || !after(m, s) || !notLater(m, L)) return false;
      var dn = A.knotSafetyDenial(m.text); return dn.length > 0 && quotes(L.why, m.text, dn);
    }).pop() || null;
  };
  AS.safetyActive = function (s) {
    if (!s || !s.safetyAt) return false;
    return !AS.safetyClearMsg(s);
  };
  /* یافته‌های «پیدا شد» ِ خانواده‌های گره (F1…F12، با نقلِ حرفِ کاربر) ⇒ شاهد (ev) در دفترِ شواهدِ موقعیتِ گرهِ همین تور — تا رتبه‌ها جابه‌جا شوند و
     وعدهٔ پرامپت («یافته‌های غربال شاهدِ همان خانواده‌اند») راست باشد (تورِ پولیا s14: ev: [] و همهٔ رتبه‌ها ۰). یک شاهد برای هر خانواده (src = sieve:F)؛
     شاهدی که کاربر در دفترِ شواهد حذف کرد (kc.sieveOff) برنمی‌گردد. موقعیت‌هایی که به وجهی از تور وصل‌اند یا در همین سشن ساخته شده‌اند. */
  AS.sieveToKnots = function (s) {
    var d = AS.sieveState(s), fams = (A.KF || []).filter(function (F) { return d[F.id] && d[F.id].st === "found" && d[F.id].why; }); if (!s) return 0;
    var ids = []; ((s.tour && s.tour.facets) || []).forEach(function (f) { if (f.status !== "skipped") (f.refs || []).forEach(function (r) { if (r.type === "kcase" && ids.indexOf(r.id) < 0) ids.push(r.id); }); });
    (s.made || []).forEach(function (id) { var r = S.get(id); if (r && r.type === "kcase" && ids.indexOf(id) < 0) ids.push(id); });
    var n = 0;
    ids.forEach(function (id) {
      var kc = S.get(id); if (!kc || kc.type !== "kcase") return; kc.ev = kc.ev || []; var ch = false, off = kc.sieveOff || {};
      fams.forEach(function (F) {
        if (off[F.id]) return;
        var txt = "غربالِ گفت‌وگو: «" + clip(dedupWhy(d[F.id].why), 280) + "»", ex = kc.ev.filter(function (e) { return e.src === "sieve:" + F.id; })[0];
        if (ex) { if (ex.text !== txt) { ex.text = txt; ex.at = nowIso(); ch = true; } return; }
        kc.ev.push({ fam: F.id, dir: 1, sub: "", w: 1, kind: "fact", text: txt, src: "sieve:" + F.id, at: nowIso() }); ch = true; n++;
      });
      // لایه‌ای که بعداً «رد شد»: شاهدِ غربالیِ همان خانواده برداشته می‌شود
      var gone = kc.ev.filter(function (e) { var m = /^sieve:(F\d+)$/.exec(e.src || ""); return m && !(d[m[1]] && d[m[1]].st === "found"); });
      if (gone.length) { kc.ev = kc.ev.filter(function (e) { return gone.indexOf(e) < 0; }); ch = true; }
      if (ch) S.put(kc);
    });
    if (n && A.state && A.state.view === "kcase" && ids.indexOf(A.state.arg) >= 0) try { A.render(); } catch (e) { }
    return n;
  };
  var rawAfter = AS.tourAfterTurn;
  AS.tourAfterTurn = function (s) { var r = rawAfter.apply(this, arguments); try { AS.sieveToKnots(s); } catch (e) { console.error(e); } return r; };
  var rawLink = DO.tour_link;
  DO.tour_link = function (a) { var r = rawLink.apply(this, arguments); try { if (AS._turnSession) AS.sieveToKnots(AS._turnSession); } catch (e) { } return r; };
  // tour_plan می‌تواند غربال را هم‌زمان بیاورد
  var rawPlan = DO.tour_plan;
  DO.tour_plan = function (a) {
    var r = rawPlan.apply(this, arguments), s = AS._turnSession;
    if (a && (a.diag || a.layers)) { var r2 = DO.tour_diag(a); if (r2) r = (r ? r + " · " : "") + r2; }
    if (s && s.tour && s._diagPending) { var pend = s._diagPending; delete s._diagPending; var r3 = DO.tour_diag({ layers: pend }); if (r3) r = (r ? r + " · " : "") + r3; }
    // غربالِ پیش از تور (s.diag) هم به تور می‌رود — آنچه در پیش‌انتظار نبود (مثلاً جزءهای قابِ عملی) گم نشود
    if (s && s.tour && s.diag) { var dg = s.tour.diag = s.tour.diag || {}; Object.keys(s.diag).forEach(function (k) { if (!dg[k]) dg[k] = s.diag[k]; else if (k === "practical" && s.diag[k].parts) { dg[k].parts = Object.assign({}, s.diag[k].parts, dg[k].parts || {}); } }); delete s.diag; }
    return r;
  };

  /* ---------- برای مدل: وضعِ غربال + گره‌های پیشینِ کاربر ---------- */
  var rawText = AS.tourText;
  AS.tourText = function (s) {
    var t = rawText.apply(this, arguments); if (!t || !s || !s.tour) return t;
    var d = AS.sieveState(s), Ls = AS.sieveLayers(), done = [], open = [];
    Ls.forEach(function (L) { var x = d[L.id]; if (x) done.push("- [" + L.id + "] " + L.fa + ": " + ST[x.st] + (x.why ? " — " + dedupWhy(x.why) : "") + (x.facet ? " ⇒ " + x.facet : "")); else open.push(L.id + " " + L.fa); });
    // خانواده‌هایی که غربال پیدا کرد ⇒ در گره‌گشا (قدمِ ۱ و ۲) آزمون‌های همین‌ها جلو بیاید (کارزارِ آزمون c03/c06: رتبهٔ گره‌گشا یافته‌های غربال را نمی‌دید)
    var fams = (A.KF || []).filter(function (F) { return d[F.id] && d[F.id].st === "found"; }).map(function (F) { return F.id + " " + F.fa; });
    return t + "\n# غربالِ لایه‌ها (" + fa(done.length) + " از " + fa(Ls.length) + ")\n" + (done.join("\n") || "- هنوز هیچ لایه‌ای سنجیده نشده") +
      (open.length ? "\nسنجیده‌نشده: " + open.join("، ") : "") +
      // پرسش‌های «باید پرسید» که هنوز پرسیده نشده‌اند، با پرسشِ خودِ لایه (کارزارِ آزمونِ دوم c12/c14/c16: «تکرار» هرگز پرسیده نشد)
      (function () { var ow = Ls.filter(function (L) { return d[L.id] && d[L.id].st === "ask"; }).sort(function (a, b) { return (b.id === "safety") - (a.id === "safety"); }); return ow.length ? "\nپرسش‌های بدهکار (یکی را در همین نوبت، اگر کاربر چیزِ فوری‌تری نخواسته، بپرس): " + ow.slice(0, 4).map(function (L) { return L.fa + (L.q ? " — «" + clip(L.q, 90) + "»" : ""); }).join("؛ ") : ""; })() +
      // همهٔ خانواده‌ها «پیدا شد»؟ تقریباً همیشه یعنی غربال جدا نکرده (کارزارِ سوم v06: ۱۲ از ۱۲)
      (fams.length > 6 ? "\n⚠ " + fa(fams.length) + " خانواده «پیدا شد» است: غربال باید جدا کند؛ هر کدام که شاهدش ضعیف شد یا با پاسخی نمی‌خواند را بازبینی کن («رد شد» با دلیل یا «باید پرسید»)." : "") +
      (fams.length ? "\nخانواده‌هایی که غربال پیدا کرد: " + fams.join("، ") + " — در گره‌گشا (قدمِ ۱ و ۲) آزمون‌های تمایزدهندهٔ همین‌ها را هایلایت کن، هرچند رتبهٔ صفحه پایین‌تر باشد؛ اگر آزمون ردشان کرد، در غربال هم «رد شد» کن." : "");
  };
  AS.promptHooks = AS.promptHooks || [];
  /* فقط وقتی نشانه فعال است: قاعدهٔ خاموش‌کردن (پرامپتِ سامانه دست نمی‌خورد) */
  AS.promptHooks.push(function (s) {
    if (!AS.safetyActive(s)) return "";
    return "# ایمنی (فعال)\n- نشانهٔ پریشانیِ جدی در این سشن فعال است؛ تا خودِ کاربر صریحاً نگفته آسیبی در کار نیست، لایهٔ safety «باید پرسید» می‌ماند. «رد شد» فقط پس از انکارِ صریحِ خودش در پیامی بعد از نشانه، و why باید همان جمله‌اش را عیناً در «…» نقل کند — حدس یا لحنِ آرام بس نیست.";
  });
  /* داوری با کاربر (a6: data-own="verdict") — فقط روی پرونده/دورهٔ کارخانه */
  AS.promptHooks.push(function () {
    var v = A.state && A.state.view; if (v !== "e_case" && v !== "epi_course") return "";
    return "# داوری با کاربر\n- حکمِ هر ایستگاه، درجه/احتمالِ صدق، «وضعیت»، «حکم در یک بند» و اقدامِ «حکم نهایی» را خودِ کاربر می‌دهد: پرشان نکن و نزن (صفحه نمی‌گذارد)؛ فقط زرد کن و شاهدهای ایستگاه‌ها را یادآوری کن.";
  });
  AS.promptHooks.push(function () {
    var ks = S.all("knot").filter(function (k) { return !k.sample; }).slice(-15);
    if (!ks.length) return "";
    var KFM = {}; (A.KF || []).forEach(function (F) { KFM[F.id] = F.fa; });
    return "# گره‌های پیشینِ کاربر (برای ریشهٔ مشترک)\n" + ks.map(function (k) { return "- knot:" + k.id + " «" + clip(k.name || "گره", 50) + "» — " + (k.fam ? k.fam + " " + (KFM[k.fam] || "") : "") + " — " + (k.status || "open") + (k.deep ? " — ساختار: " + clip(k.deep, 80) : ""); }).join("\n");
  });

  /* قابِ مسئلهٔ عملی جلوی چشمِ مدل — فقط وقتی لایهٔ practical «پیدا شد» یا «باید پرسید» است (پرامپتِ سامانه دست نمی‌خورد) */
  AS.promptHooks.push(function (s) {
    var x = AS.sieveState(s).practical; if (!x || (x.st !== "found" && x.st !== "ask")) return "";
    /* یک منبعِ پرسش (تورِ پولیا دورِ ۲، rerunC): وقتی سشن به مسئلهٔ زندهٔ باز بسته است، قابِ صفحهٔ همان مسئله (فهم، داده، شرط، کارتِ عملی) منبع است —
       غربال فقط آنچه ثبت کرده را یادآوری می‌کند و پرسشِ جداگانه نمی‌پرسد؛ جزءی که صفحه پاسخ داده «هنوز نپرسیده» خوانده نمی‌شود */
    var bl = AS.boundLive ? AS.boundLive(s) : null;
    if (bl && !bl.done) {
      var pp0 = x.parts || {}, had = PRACT.filter(function (q) { return pp0[q[0]]; });
      return "# قابِ مسئلهٔ عملی (غربال — زیرِ قابِ صفحهٔ «" + clip(bl.r.p.title, 50) + "»)\n- منبعِ پرسشِ این نوبت «مسئلهٔ زندهٔ این سشن» است (همان پرسشِ هم‌گام با صفحه)؛ این‌جا پرسشِ جداگانه نپرس و جزءی را که صفحه یا گفت‌وگو پاسخ داده دوباره نپرس." +
        (had.length ? "\n- آنچه از حرفِ خودش در غربال ثبت شده: " + had.map(function (q) { return q[1].split(/[:؟—]/)[0] + " «" + clip(pp0[q[0]], 80) + "»"; }).join("؛ ") : "");
    }
    var pp = x.parts || {}, owed = PRACT.filter(function (q) { return !pp[q[0]] || (q[0] === "measure" && A.measurableCheck && !A.measurableCheck(pp.measure).ok); });   // ریاضی‌کردنِ ناسنجیدنی هنوز بدهکار است
    return "# قابِ مسئلهٔ عملی (لایهٔ «مسئلهٔ عملی»)\n" + PRACT.map(function (q) { return "- " + q[1] + " — " + (pp[q[0]] ? "«" + clip(pp[q[0]], 120) + "»" : "هنوز نپرسیده"); }).join("\n") +
      (owed.length ? "\nپیش از هر پیشنهادِ راه‌حل، **یکی** از مانده‌ها را بپرس (به همین ترتیب؛ بی پیشنهادِ جواب): «" + owed[0][1] + "». پاسخِ خودش را با {\"do\":\"tour_diag\",\"layers\":[{\"id\":\"practical\",\"st\":\"found\",\"why\":\"…\",\"parts\":{\"" + owed[0][0] + "\":\"همان جملهٔ خودش\"}}]} ثبت کن." : "\nقاب کامل است؛ حالا وجه‌ها را از همین قاب بساز.") +
      "\nبرای «تا کجا اطلاعات جمع کنی» ایستگاهِ «مسئولیتِ معرفتی» در کارخانه جایِ سنجیدنش است (پروندهٔ سنجش ⇐ همان ایستگاه): آیا امکان و وظیفهٔ تحقیقِ بیشتر هست؟";
  });

  /* همهٔ پرسش‌های تشخیصیِ نقشهٔ پیش‌نیاز جلوی چشمِ مدل (کارزارِ سوم v01: از ۸ پرسش فقط ۵ تا پرسیده شد) — نقشهٔ همین نما یا نقشه‌های وجه‌های تور */
  AS.promptHooks.push(function (s) {
    var ids = []; if (A.state && A.state.view === "prereq" && A.state.arg) ids.push(A.state.arg);
    ((s && s.tour && s.tour.facets) || []).forEach(function (f) { if (f.status !== "skipped") (f.refs || []).forEach(function (r) { if (r.type === "prereq" && ids.indexOf(r.id) < 0) ids.push(r.id); }); });
    var L = [];
    ids.forEach(function (id) {
      var p = S.get(id); if (!p || p.type !== "prereq" || !(p.items || []).length) return;
      var qs = p.items.filter(function (x) { return x.q; }), left = qs.filter(function (x) { return !String(x.ans || "").trim() && !x.self; });
      L.push("نقشهٔ «" + clip(p.title, 60) + "»: " + fa(qs.length) + " پرسشِ تشخیصی، " + fa(left.length) + " هنوز بی پاسخ و بی سنجش. همه را بپرس (یکی‌یکی یا با هم) — هیچ‌کدام را جا نینداز:");
      qs.forEach(function (x, i) { L.push("  " + (i + 1) + ") «" + clip(x.concept, 60) + "»: " + clip(x.q, 200) + " — " + (String(x.ans || "").trim() ? "پاسخ داده" : "هنوز بی پاسخ") + (x.self ? "، سنجش: " + x.self : "")); });
    });
    return L.length ? "# پرسش‌های تشخیصیِ پیش‌نیاز (همه)\n" + L.join("\n") : "";
  });
  AS.SYS += "\n" + [
    "# غربالِ لایه‌ها (پیش از هر طرحِ تور، و هر بار که حرفِ تازه‌ای آمد)",
    "- حرفِ کاربر را — حتی اگر به‌ظاهر بی‌ربط است (خرید، رابطه، کار، پول، سرگرمی) — نه سریع رد کن، نه پخش کن: لایه‌به‌لایه بشکاف. برای هر لایهٔ فهرستِ «# غربالِ لایه‌ها» پرسشِ همان لایه را از خودت بپرس و با {\"do\":\"tour_diag\",\"layers\":[{\"id\":\"F7\",\"st\":\"found|no|ask|out\",\"why\":\"شاهد با واژه‌های خودِ کاربر\",\"facet\":\"fN\"}]} حکم بده. found فقط با شاهد از حرفِ خودش؛ ask یعنی برای تشخیص باید چیزی را از او بپرسی (یکی‌یکی، دقیق، بی پیشنهادِ جواب)؛ out فقط برای همان بخشی که کارِ این صفحه نیست. هر ۱۲ خانوادهٔ گره را جدا بسنج.",
    "- وجه‌های تور فقط از لایه‌های found ساخته می‌شوند و به **ریشه** می‌روند، نه به سطح: چند یافته با یک ریشه = یک وجه؛ خودِ تصمیم یا موضوعِ بیرونی (ماشین، سرمایه‌گذاری، دعوا) وجه نیست — گره، خطای معرفتی، مسئلهٔ سخت، دانشِ پیش‌نیاز یا حوزه‌ای که پشتِ آن است وجه است. در why ِ هر وجه بگو از کدام یافته‌ها آمده.",
    "- ریشهٔ مشترک: «# گره‌های پیشینِ کاربر» را ببین؛ اگر همان خانواده و همان ساختارِ عمیق است، موقعیتِ تازه را به همان گره وصل کن (بازگشت/تکرار) نه گرهِ تازه، و این را صریح بگو — هنرِ این صفحه دیدنِ ریشهٔ ثابت در ظاهرهای متفاوت است.",
    "- برداشتِ خودِ کاربر دربارهٔ مسئله («باورش درست بود، دلیل هم داشت»، «سنگین‌تر یعنی زودتر») خودش یک **ادعا** است و راهِ دانستنش (شهود، تجربهٔ روزمره، نقل) لایهٔ **راه** — این دو را برای بدفهمیِ علمی رد نکن (کارزارِ آزمون c07).",
    "- مسئلهٔ علمی/هوشی/فلسفی که فهمیده یا حل نشده: دست‌کم سه لایه را جدا بسنج — گرهِ ذهنی (کدام خانواده: بازنمایی، راهبرد، پایش، …)، خطای معرفتی، و **دانشِ پیش‌نیاز** (کدام مفهوم، از کدام علم و شاخه، در کدام گامِ حل) ⇒ وجهِ kind=prereq با «🧩 نقشهٔ پیش‌نیازها» (نمای prereq). جوابِ مسئله را نگو؛ کاربر را تا خودِ حل ببر.",
    "- گره‌گشا عدد نمی‌دهد: هر خانواده «شاهد دارد»، «هنوز معلوم نیست» یا «کنار رفت» است. یک پاسخ فقط تبیینی را کنار می‌گذارد که با آن تناقض دارد («درست بازگفتم» فقط «بدخوانی» را، نه «مدلِ غلطِ مسئله»)؛ ندیدن و حدس دربارهٔ حالتِ فرضی چیزی را رد نمی‌کند؛ یافته‌های «پیدا شد» ِ غربالِ همین تور شاهدِ همان خانواده‌اند. پس به کاربر نگو «امتیازش پایین است»؛ بگو کدام تبیین کنار رفت، کدام باز است و آزمونِ بعدی کدام را جدا می‌کند. تصمیمِ ریشه با خودِ اوست.",
    "- لایهٔ «تکرار و ریشهٔ مشترک»: اگر گرهِ پیشینی ثبت نیست، «رد شد» نکن — «باید پرسید» بگذار و بپرس «پیش‌تر هم این حس/این نوع گیر را داشته‌ای؟». برای مسئله‌ای با پاسخِ معلوم، «🧪 شبیه‌سازِ همین مسئله» و «مسئله‌های هم‌ساختار» را هم پیشنهاد کن. فقط دربارهٔ چیزی که در پویشِ همین صفحه می‌بینی بگو «این‌جا بنویس/ببین»؛ رابطِ ناموجود را توصیف نکن.",
    "- غربال در یک نوبت بسته نمی‌شود: آنچه کاربر هنوز نگفته «باید پرسید» است نه «رد شد» (رد فقط با دلیل از حرفِ خودش). پرسش‌های «باید پرسید» را یکی‌یکی بپرس و با هر پاسخ غربال را به‌روز کن؛ تکرار در حوزه‌های **دیگرِ** زندگی‌اش را صریح بپرس («در یادگرفتنِ چیزهای دیگر هم همین‌طور بوده؟»). ترتیبِ وجه‌ها را با همان دلیلی که در why نوشتی هم‌خوان نگه دار.",
    "- پس از **هر** پیامِ کاربر غربال را با شاهدِ تازه بازبینی کن: لایه‌ای که «رد شد» بود و حالا شاهد دارد (مثلاً «همیشه دیدم برگ آروم‌تر میاد» ⇒ راهِ دانستن: تعمیمِ تجربهٔ روزمره) را با tour_diag «پیدا شد» کن.",
    "- «📧 گزارشِ تور» خودکار در حینِ تور به ایمیلِ کاربر می‌رود (و «الان بفرست» در کشوی تور هست)؛ اگر گزارش خواست، همین را بگو، نه «نمی‌توانم».",
    "- عددی یا واقعیتی را که کاربر نداده **فرض نکن** (مثلاً نرخِ مثبتِ کاذب، شیوع، اندازهٔ نمونه): بپرس «در برگهٔ آزمایش/مقاله این عدد آمده؟» و اگر نبود، صریح بگو با کدام فرض جلو می‌روی. تعریف‌ها (حساسیت، ویژگی، …) را دقیق بگو یا از دانسته‌های قلمرو بیاور.",
    "- خطای **معرفتی** که پیدا شد (مثلاً «بدیهیه»، «حس می‌کنم کلک داره»، «همه می‌گن») ریشهٔ جداست: وجهِ خودش را بگیرد (نوع claim)، در وجهِ پیش‌نیاز حل نشود. اگر کاربر در «🧩 نقشهٔ پیش‌نیازها» «بلدم» زد ولی پاسخِ نوشته‌اش همان ادعای بی دلیل است، پیش از «گامِ بعد» بخواه همان را با دلیل بنویسد؛ سنجش را خودش عوض کند.",
    "- وقتی پرسشی از «باید پرسید» می‌پرسی، همان نوبت را با همان پرسش تمام کن: در همان نوبت وجه‌ها را قطعی نکن و پنجره یا نقشهٔ تازه باز نکن؛ اول پاسخ را بگیر (کارزارِ آزمونِ دوم c14).",
    "- اگر راهِ دانستنِ کاربر «از یک منبع شنیدم/دیدم» است (ویدیو، مقاله، «همه می‌گن»)، وجهِ ادعا را به راهِ سنجشِ ادعا در کارخانهٔ معرفت‌شناسی بفرست (tour_link)، نه فقط توضیح بده.",
    "- **ایمنی اول:** اگر لایهٔ «ایمنی و حال» «باید پرسید» است، یا کاربر از بی‌علاقگی به همه‌چیز، خوابِ به‌هم‌ریخته، ناامیدی یا آسیب به خود گفته، پیش از هر tour_plan یا رفتن به فرمی **یک پرسشِ ملایمِ ایمنی** بپرس (مثلاً «این روزها حالت چطور است؟ فکرِ آسیب به خودت هم آمده؟») و تا پاسخ نیامده تور را قطعی نکن (کارزارِ سوم v03). همین برای پرسشِ «به خودت چه گفتی؟» پیش از بازکردنِ فرمِ گره‌گشا.",
    "- وقتی کاربر ریشهٔ مشترک را تأیید کرد، لایهٔ «تکرار و ریشهٔ مشترک» را با همان شاهد «پیدا شد» کن؛ و هر خانواده‌ای که خودت گفتی شاهدش ضعیف شد، بازبینی کن.",
    "- هرگز نگو «همه‌جا عوض کردم» مگر واقعاً همهٔ رکوردها را عوض کرده باشی؛ بگو دقیقاً کدام‌ها را (کارزارِ سوم v06).",
    "- اگر عددها یا تاریخ‌های خودِ کاربر با هم نمی‌خوانند (دفترچه، امروز)، ملایم همان لحظه بگو؛ در حافظه نگه ندار.",
    "- لغزنده‌ای که «تکان نخورده» است مقدار ندارد: عددش را از کاربر بپرس؛ تا نگفته، «گامِ بعد»/«ثبت» نزن.",
    "- اولویت: ایمنی؛ ریشه‌ای که بقیه از آن می‌رویند (گره یا پیش‌نیاز)؛ آنچه زمان‌دار است؛ فهم پیش از تمرین.",
    "- نخستین پاسخ به هر مسئلهٔ تازه: جواب، حکم یا یافتهٔ نهایی را نگو — حتی اگر از «# دانسته‌های قلمرو» می‌دانی (کارزارِ آزمون c08: معنای درستِ p و تکرارنشدنِ پژوهش در همان پاسخِ اول لو رفت). اول یک یا دو پرسشِ دقیق برای لایه‌هایی که «باید پرسید» است (بی پیشنهادِ جواب)، بعد غربال؛ یافتهٔ قطعی را وقتی بگو که کاربر خودش به آن رسیده یا ایستگاهِ مربوط طی شده. لایهٔ «اطلاعاتِ ناموجود» را جدی بسنج: چه عددی، منبعی یا واقعیتی هنوز نیست؟",
    "- در reply هرگز کلید یا کد ننویس (f1، k12، F7، شناسهٔ حوزه یا رکورد) — نامِ فارسیِ وجه، خانواده یا حوزه را بگو."
  ].join("\n");

  /* ---------- کشوی تور: غربال دیدنی ---------- */
  function sieveRows(s) {
    var d = AS.sieveState(s), facets = (s.tour && s.tour.facets) || [];
    return AS.sieveLayers().map(function (L) {
      var x = d[L.id], f = x && x.facet && facets.filter(function (z) { return z.key === x.facet; })[0];
      return { g: L.g, id: L.id, fa: L.fa, st: x ? x.st : "", stFa: x ? ST[x.st] : "سنجیده نشده", why: x ? dedupWhy(x.why) : "", facet: f ? f.title : "", parts: x && x.parts };
    });
  }
  AS.sieveRows = sieveRows;
  var rawDrawer = AS.tourDrawer;
  AS.tourDrawer = function (s) {
    var box = rawDrawer.apply(this, arguments);
    try {
      var rows = sieveRows(s), n = rows.filter(function (r) { return r.st; }).length, found = rows.filter(function (r) { return r.st === "found"; }).length;
      var det = h("details", { class: "as-sieve small" }, h("summary", {}, "🔍 غربالِ لایه‌ها · " + fa(n) + " از " + fa(rows.length) + " سنجیده · " + fa(found) + " یافته"));
      var g0 = "";
      rows.forEach(function (r) {
        if (r.g !== g0) { g0 = r.g; det.appendChild(h("div", { class: "muted mt" }, r.g)); }
        det.appendChild(h("div", { class: "as-sv as-sv-" + (r.st || "none") }, (r.st === "found" ? "● " : r.st === "no" ? "○ " : r.st === "ask" ? "？ " : r.st === "out" ? "↗ " : "· ") + r.fa + " — " + r.stFa +
          (r.why ? " — «" + clip(r.why, 90) + "»" : "") + (r.facet ? " ⇒ " + r.facet : "")));
        if (r.id === "practical" && (r.st === "found" || r.st === "ask")) det.appendChild(h("ul", { class: "plain as-pract", "data-own": "1" }, PRACT.map(function (q, qi) {
          var v = (r.parts || {})[q[0]], nm = q[1].split(":")[0].split("؟")[0];
          var unm = v && q[0] === "measure" && A.measurableCheck && !A.measurableCheck(v).ok;   // ریاضی‌کردنِ ناسنجیدنی ⇒ دوباره بنویس
          if (v && !unm) return h("li", { class: "ok" }, "✓ " + nm + " — «" + clip(v, 70) + "»");
          /* جزءِ مانده را خودت بنویس (بی‌مدل): ذخیره با change؛ قابِ کامل ⇒ کارتِ مرور با کد */
          var id = "asPract_" + q[0];
          return h("li", {}, h("label", { for: id }, "○ " + q[1] + (unm ? " (هنوز سنجیدنی نیست: " + A.measurableCheck(v).why.join(" و ") + ")" : "")), h("input", { id: id, type: "text", class: "as-practin", value: unm ? v : null, placeholder: "به زبانِ خودت", onchange: function (e) { if (AS.sievePracticalSet(s, q[0], e.target.value) && AS.paint) AS.paint(); } }));
        })));
      });
      box.appendChild(det);
    } catch (e) { }
    return box;
  };

  /* ---------- 🧩 نقشهٔ پیش‌نیازها ---------- */
  var SELF = ["", "بلدم", "نیمه", "بلد نیستم"];
  A.prereqState = function (p) {
    var it = (p && p.items) || [], rated = it.filter(function (x) { return x.self; }), miss = it.filter(function (x) { return x.self === "نیمه" || x.self === "بلد نیستم"; });
    return { n: it.length, sci: it.map(function (x) { return x.sci; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; }).length, rated: rated.length, miss: miss, topics: miss.filter(function (x) { return x.topic && S.get(x.topic); }) };
  };
  var SYS_PRE = "تو سازندهٔ «نقشهٔ پیش‌نیازها» هستی. مسئله یا مطلبی که کاربر نفهمیده یا حل نکرده را می‌گیری و فهرستِ **مفهوم‌های پیش‌نیاز** را می‌دهی که برای فهمیدن/حلِ همان لازم است — از پایه‌ای‌ترین تا نزدیک‌ترین به مسئله. برای هر کدام: علم (ریاضی، فیزیک، منطق، آمار، فلسفه، روان‌شناسی، …)، شاخه، نامِ دقیقِ مفهوم، «در کدام گامِ حل و چرا لازم است»، یک پرسشِ تشخیصیِ کوتاه که نشان دهد کاربر آن را دارد یا نه (پاسخِ خودِ مسئلهٔ اصلی را لو نده)، و پاسخِ مرجعِ همان پرسش. «why» فقط بگوید آن مفهوم در **کدام گام** به کار می‌آید، نه این‌که چطور به جواب می‌رسد — زنجیرهٔ استدلالِ حل را در why ها لو نده. «concept» فقط **نامِ** مفهوم است و هرگز پاسخِ پرسشِ تشخیصیِ خودش را در خود ندارد (نه فرمول، نه «=»، نه عدد یا نتیجه — مثلاً «معادلهٔ مکان در حرکتِ پرتابی»، نه «y = h + v₀t − ½gt²»). ۴ تا ۱۰ مورد، بی تکرار، فقط آنچه واقعاً لازم است — و حتماً **خودِ مفهومِ محوریِ مسئله** (مثلاً «بختِ معرفتی» برای گتیه) و اصطلاح‌ها/پاسخ‌های استانداردِ آن رشته به همان مسئله. فقط JSON: [{\"sci\":\"…\",\"sub\":\"…\",\"concept\":\"…\",\"why\":\"…\",\"q\":\"…\",\"ref\":\"…\"}]";
  /* نامِ مفهوم که پاسخِ پرسشِ تشخیصیِ خودش را لو می‌دهد (کارزارِ سوم v02: عنوانِ مفهومِ ۷ خودِ فرمول بود) ⇒ فقط نام می‌ماند */
  function pn(x) { return String(x || "").replace(/[\s\u200c«»"'.,،:؛!?؟()\-]+/g, "").toLowerCase(); }
  A.prereqLeaks = function (concept, ref) { var c = String(concept || ""); if (/[=≈≡]/.test(c)) return true; var r = pn(ref); return r.length >= 3 && pn(c).indexOf(r) >= 0; };
  A.prereqCleanName = function (x) {
    if (!A.prereqLeaks(x.concept, x.ref)) return x.concept;
    var c = String(x.concept || "").split(/[=≈≡]/)[0].replace(/[:：(（]\s*$/, "").trim();
    if (x.ref && pn(c).indexOf(pn(x.ref)) >= 0 && pn(x.ref).length >= 3) c = "";
    if (c.length < 3) c = "مفهومِ " + (x.sub || x.sci || "پیش‌نیاز") + " (نامِ پیشنهادی پاسخش را لو می‌داد)";
    return c;
  };
  function parseArr(t) { try { var m = String(t || "").match(/\[[\s\S]*\]/); var a = JSON.parse(m ? m[0] : t); return Array.isArray(a) ? a : null; } catch (e) { return null; } }
  function mkTopic(p, x) {
    var tp = S.put({ id: A.uid("tp"), type: "topic", title: "«" + x.concept + "» (" + [x.sci, x.sub].filter(Boolean).join(" › ") + ") — پیش‌نیازِ «" + clip(p.title, 50) + "»", dom: x.sci || "", src: "🧩 نقشهٔ پیش‌نیازها", kind: "", prereq: p.id });
    if (A.toNursery) try { A.toNursery(tp.title, "concept", { t: "topic", id: tp.id }); } catch (e) { }
    x.topic = tp.id; S.put(p); return tp;
  }
  A.V.prereq = function (arg) {
    var root = h("div", { class: "page", dir: "rtl" });
    root.appendChild(A.head("حلِ مسئله و یادگیری", "🧩 نقشهٔ پیش‌نیازها", "مسئله یا مطلبی که نفهمیدی: کدام مفهوم، از کدام علم و شاخه، در کدام گامِ حل لازم بود — و کدام را واقعاً نداشتی. هر پیش‌نیازِ نبوده یک موضوعِ یادگیری می‌شود؛ بعد به خودِ مسئله برمی‌گردی."));
    var p = arg && S.get(arg);
    if (!p || p.type !== "prereq") {
      var ti = h("input", { type: "text", id: "prT", placeholder: "مثلاً «چرا در مسئلهٔ مونتی‌هال عوض‌کردن بهتر است؟» یا «اثباتِ قضیهٔ بِیز را نفهمیدم»" });
      var st = h("textarea", { id: "prS", rows: 4, placeholder: "صورتِ مسئله / مطلب، و کجا گیر کردی (اختیاری ولی مفید)" });
      root.appendChild(h("section", { class: "card" }, h("h2", {}, "نقشهٔ تازه"), h("label", { for: "prT" }, "مسئله یا مطلب"), ti, h("label", { for: "prS" }, "صورت و جای گیر"), st,
        h("button", { class: "btn", type: "button", onclick: function () {
          if (!ti.value.trim()) { A.toast("اول بنویس کدام مسئله یا مطلب.", "bad"); return; }
          var r = S.put({ id: A.uid("pq"), type: "prereq", title: ti.value.trim(), statement: st.value.trim(), items: [], kcase: "" }); A.go("prereq", r.id);
        } }, "ساختنِ نقشه")));
      var list = S.all("prereq").sort(function (a, b) { return String(b.created || "").localeCompare(String(a.created || "")); });
      root.appendChild(h("section", { class: "card" }, h("h2", {}, "نقشه‌های تو (" + fa(list.length) + ")"), list.length ? h("ul", {}, list.map(function (x) { var k = A.prereqState(x); return h("li", {}, h("button", { class: "linkish", type: "button", onclick: function () { A.go("prereq", x.id); } }, x.title), h("span", { class: "small muted" }, " — " + fa(k.n) + " مفهوم از " + fa(k.sci) + " علم · " + fa(k.miss.length) + " نبوده")); })) : h("p", { class: "small muted" }, "هنوز نقشه‌ای نساخته‌ای.")));
      return root;
    }
    function save() { S.put(p); A.render(); }
    var k = A.prereqState(p);
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "«" + p.title + "»"), p.statement ? h("p", { class: "small" }, p.statement) : null,
      h("p", { class: "small" }, fa(k.n) + " مفهوم از " + fa(k.sci) + " علم · " + fa(k.rated) + " سنجیده · " + fa(k.miss.length) + " نبوده/نیمه · " + fa(k.topics.length) + " موضوعِ یادگیری"),
      h("div", { class: "row gap wrap" },
        A.knotAIGate ? h("button", { class: "btn", type: "button", onclick: function () {
          A.knotAIGate({ purpose: "پیشنهادِ مفهوم‌های پیش‌نیازِ این مسئله", noPriv: true, system: SYS_PRE,
            build: function () { return "مسئله/مطلب: " + p.title + (p.statement ? "\nصورت و جای گیر: " + p.statement : "") + (p.items.length ? "\nاز پیش در فهرست: " + p.items.map(function (x) { return x.concept; }).join("، ") : ""); },
            onResult: function (txt) {
              var arr = parseArr(txt); if (!arr) { A.toast("پاسخِ هوش مصنوعی قالبِ درستی نداشت.", "bad"); return; }
              var have = p.items.map(function (x) { return String(x.concept || "").trim(); });
              arr.slice(0, 12).forEach(function (x) { if (!x || !x.concept || have.indexOf(String(x.concept).trim()) >= 0) return; var leak = A.prereqLeaks(x.concept, x.ref); p.items.push({ sci: clip(x.sci, 60), sub: clip(x.sub, 80), concept: clip(A.prereqCleanName(x), 120), renamed: leak || null, why: clip(x.why, 300), q: clip(x.q, 300), ref: clip(x.ref, 500), by: "ai", self: "", ans: "" }); });
              save(); A.toast("پیشنهادها افزوده شد — ساختهٔ هوش مصنوعی و وارسی‌نشده؛ سنجش با خودت است.");
            } });
        } }, "🤖 پیشنهادِ پیش‌نیازها") : null)));
    var rows = p.items.map(function (x, i) {
      var ans = h("textarea", { rows: 2, "aria-label": "پاسخِ تو به پرسشِ تشخیصیِ «" + clip(x.concept, 40) + "»", placeholder: "پاسخِ خودت، از حافظه", onchange: function (e) { x.ans = e.target.value; S.put(p); } }, x.ans || "");
      // سنجشِ خود و «حل شد» تصمیمِ خودِ کاربر است: دستیار فقط زرد می‌کند، پر نمی‌کند (data-own — کارزارِ آزمون c03)
      var sel = h("select", { "data-own": "1", "aria-label": "این پیش‌نیاز را داری؟ («" + clip(x.concept, 40) + "»)", onchange: function (e) { x.self = e.target.value; x.selfAt = nowIso(); save(); } }, SELF.map(function (o) { return h("option", { value: o, selected: (x.self || "") === o ? true : null }, o || "— خودت بسنج —"); }));
      return h("div", { class: "card soft pr-item" },
        h("div", { class: "row gap wrap" }, h("b", {}, fa(i + 1) + ") " + x.concept), h("span", { class: "chip" }, [x.sci, x.sub].filter(Boolean).join(" › ")), x.by === "ai" ? h("span", { class: "small muted" }, "پیشنهادِ هوش مصنوعی — وارسی‌نشده") : null),
        x.why ? h("p", { class: "small" }, "در کدام گام و چرا: " + x.why) : null,
        x.q ? h("p", {}, "پرسشِ تشخیصی: " + x.q) : null, x.q ? ans : null,
        // «بلدم» بی دلیلِ نوشته (کارزارِ آزمونِ دوم c12: «بدیهیه» با «بلدم» پذیرفته شد و موضوعِ زوجیت ساخته نشد) — فقط هشدار؛ سنجش با خودِ کاربر می‌ماند
        x.self === "بلدم" && x.q && String(x.ans || "").replace(/\s+/g, "").length < 15 ? h("p", { class: "small warn pr-thin" }, "«بلدم» گفتی ولی پاسخِ نوشته‌ات هنوز دلیل ندارد" + (x.ans ? " («" + clip(x.ans, 40) + "»)" : "") + ". پاسخِ مرجع را باز کن و مقایسه کن؛ اگر فقط «بدیهی است» یا «می‌دانم» بود، شاید «نیمه» درست‌تر باشد.") : null,
        h("div", { class: "row gap wrap" }, sel,
          x.self && x.ref ? h("details", { class: "small" }, h("summary", {}, "پاسخِ مرجع"), h("p", {}, x.ref)) : null,
          (x.self === "نیمه" || x.self === "بلد نیستم") && !(x.topic && S.get(x.topic)) ? h("button", { class: "btn sm", type: "button", onclick: function () { var tp = mkTopic(p, x); A.toast("موضوعِ یادگیری ساخته شد؛ سفرِ ۱۱ گامی‌اش را از همان‌جا شروع کن."); A.go("topic", tp.id); } }, "📚 موضوعِ یادگیری بساز") : null,
          x.topic && S.get(x.topic) ? h("button", { class: "linkish small", type: "button", onclick: function () { A.go("topic", x.topic); } }, "↗ موضوعِ یادگیری") : null,
          // زیرِ موضوعِ دیگرِ همین نقشه (کارزارِ آزمونِ دوم c02: ۶ موضوع برای یک معما زیاد بود؛ ادغامِ توافقی ثبت‌شدنی نبود)
          (x.self === "نیمه" || x.self === "بلد نیستم") && !(x.topic && S.get(x.topic)) && p.items.some(function (y) { return y !== x && y.topic && S.get(y.topic); }) ?
            h("select", { "aria-label": "زیرِ موضوعِ دیگر (برای «" + clip(x.concept, 30) + "»)", onchange: function (e) { if (e.target.value) { x.topic = e.target.value; x.merged = true; save(); } } },
              [h("option", { value: "" }, "— یا زیرِ موضوعِ دیگر —")].concat(p.items.filter(function (y) { return y !== x && y.topic && S.get(y.topic); }).map(function (y) { return h("option", { value: y.topic }, "زیرِ «" + clip(y.concept, 30) + "»"); }))) : null));
    });
    // یک‌جا برای همهٔ نبوده‌ها (کارزارِ آزمون c06/c07: ساختنِ یکی‌یکی چند نوبت می‌برد و کلیکِ اول صفحه را عوض می‌کرد)
    var todo = p.items.filter(function (x) { return (x.self === "نیمه" || x.self === "بلد نیستم") && !(x.topic && S.get(x.topic)); });
    if (todo.length > 1) root.appendChild(h("button", { class: "btn", type: "button", onclick: function () { todo.forEach(function (x) { mkTopic(p, x); }); A.toast(fa(todo.length) + " موضوعِ یادگیری ساخته شد؛ سفرِ هر کدام را از «موضوع‌ها» شروع کن."); A.render(); } }, "📚 برای همهٔ " + fa(todo.length) + " پیش‌نیازِ نبوده موضوع بساز"));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "مفهوم‌های پیش‌نیاز"), rows.length ? h("div", { class: "col gap" }, rows) : h("p", { class: "small muted" }, "هنوز موردی نیست — «🤖 پیشنهادِ پیش‌نیازها» یا پایین خودت بیفزا.")));
    var c1 = h("input", { type: "text", id: "prC", placeholder: "مفهوم" }), c2 = h("input", { type: "text", id: "prSci", placeholder: "علم › شاخه" }), c3 = h("input", { type: "text", id: "prW", placeholder: "در کدام گامِ حل لازم بود" });
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "افزودنِ دستی"), h("label", { for: "prC" }, "مفهوم"), c1, h("label", { for: "prSci" }, "علم › شاخه"), c2, h("label", { for: "prW" }, "در کدام گام"), c3,
      h("button", { class: "btn sm", type: "button", onclick: function () { if (!c1.value.trim()) return; var sp = c2.value.split("›"); p.items.push({ concept: c1.value.trim(), sci: (sp[0] || "").trim(), sub: (sp[1] || "").trim(), why: c3.value.trim(), q: "", ref: "", by: "user", self: "" }); save(); } }, "+ افزودن")));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "بازگشت به خودِ مسئله"),
      h("p", { class: "small muted" }, "پس از پیش‌نیازها، مسئلهٔ اصلی را دوباره، بی نگاه به راه‌حل، امتحان کن."),
      h("label", { for: "prBack" }, "پاسخ یا راهِ حلِ خودت (پس از پیش‌نیازها)"), h("textarea", { id: "prBack", rows: 3, onchange: function (e) { p.backAns = e.target.value; S.put(p); } }, p.backAns || ""),
      h("select", { "data-own": "1", "aria-label": "مسئلهٔ اصلی را دوباره امتحان کردی؟", onchange: function (e) { p.back = e.target.value; p.backAt = nowIso(); save(); } }, ["", "حل شد", "هنوز نه"].map(function (o) { return h("option", { value: o, selected: (p.back || "") === o ? true : null }, o || "— هنوز امتحان نکرده‌ام —"); }))));
    root.appendChild(h("button", { class: "linkish", type: "button", onclick: function () { A.go("prereq"); } }, "← همهٔ نقشه‌ها"));
    return root;
  };
  A.VIEW_META = A.VIEW_META || {};
  A.VIEW_META.prereq = { j: "understand", what: "نقشهٔ پیش‌نیازها: برای مسئله/مطلبی که فهمیده نشد، هر مفهومِ لازم با علم و شاخه، گامِ حل، پرسشِ تشخیصی و سنجشِ خودِ کاربر؛ پیش‌نیازِ نبوده ⇒ موضوعِ یادگیری؛ بازگشت به مسئله.", why: "تا دقیقاً بدانی کدام دانشِ مقدماتی را نداشتی، نه فقط «نفهمیدم»." };

  /* «امروز»: نقشه‌ای که هنوز سنجیده نشده */
  if (typeof A.dueList === "function" && !A.dueList._prereq) {
    var raw = A.dueList;
    A.dueList = function () {
      var items = raw.apply(this, arguments) || [];
      S.all("prereq", function (p) { var k = A.prereqState(p); return k.n && k.rated < k.n; }).forEach(function (p) { var k = A.prereqState(p); items.push({ k: "p", txt: "🧩 پیش‌نیازهای «" + clip(p.title, 40) + "» را بسنج", sub: fa(k.n - k.rated) + " مفهوم سنجیده نشده", go: function () { A.go("prereq", p.id); } }); });
      return items;
    };
    A.dueList._prereq = true;
  }
  /* منو: کنارِ ابزارهای ذهن */
  [A.NAV, A.EPI_NAV].forEach(function (arr) {
    if (!Array.isArray(arr) || arr.some(function (n) { return Array.isArray(n) && n[0] === "prereq"; })) return;
    var gi = arr.findIndex(function (n) { return n && n.g === "🧰 ابزارهای ذهن"; }); if (gi < 0) return;
    var end = gi + 1; while (end < arr.length && Array.isArray(arr[end])) end++;
    arr.splice(end, 0, ["prereq", "🧩 نقشهٔ پیش‌نیازها", "کدام دانشِ مقدماتی را برای این مسئله نداشتی"]);
  });
  /* «🧩 نقشهٔ پیش‌نیازها» یک نقشه است ⇒ ذیلِ «🗺 نقشه‌ها» هم (هر دو منو) و کارتی در هابِ نقشه‌ها — افزودن، نه جابه‌جایی:
     همان ورودیِ «🧰 ابزارهای ذهن» سرِ جایش می‌ماند (ممیزیِ اجرا ۲۰۲۶-۱۰-۱۵) */
  [A.NAV, A.EPI_NAV].forEach(function (arr) {
    if (!Array.isArray(arr)) return;
    var gi = arr.findIndex(function (n) { return n && n.g === "🗺 نقشه‌ها"; }); if (gi < 0) return;
    var end = gi + 1; while (end < arr.length && Array.isArray(arr[end])) end++;
    if (arr.slice(gi + 1, end).some(function (n) { return n[0] === "prereq"; })) return;
    arr.splice(end, 0, ["prereq", "🧩 نقشهٔ پیش‌نیازها", "دانشِ مقدماتیِ هر مسئله و جایی که نبود"]);
  });
  if (A.GRAPH && A.GRAPH.MAPS && !A.GRAPH.MAPS.some(function (m) { return m.v === "prereq"; }))
    A.GRAPH.MAPS.push({ v: "prereq", fa: "🧩 نقشهٔ پیش‌نیازها", what: "برای هر مسئله: کدام دانشِ مقدماتی نبود، از کدام علم، و موضوعِ یادگیریِ هر کدام" });
})(APP);
