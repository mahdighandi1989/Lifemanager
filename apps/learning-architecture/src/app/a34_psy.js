/* ===== «📐 سنجشِ استاندارد»: سازه‌های جهانیِ روان‌سنجی، برآورد از بدیهیات، مقایسه با مردم فقط از منبعِ معتبر (مالک ۲۰۲۶-۱۰-۱۵) =====
   مالک: «بدونِ دادنِ اعدادِ قراردادی و نمایشی … بر اساسِ بدیهیاتِ عقلی و منطقی و استانداردهای کاملاً روان‌شناسیِ جهانی و نه دم‌دستی …
   هم مقایسه با گذشتهٔ خودم و هم مقایسه با سایرِ نمونه‌های انسان‌ها با همهٔ شرایط (سن و …) … و این همیشه باید به‌روز بشه».
   طراحی و مرزهای صداقت: docs/decisions/2026-10-15-mind-card-psychometric.md. خلاصه:
   - سازه‌ها از مدلِ جهانیِ CHC (هوش) و مدلِ عقلانیتِ استانوویچ (CART)، به‌علاوهٔ فراشناخت و پیش‌بینیِ هیجانی؛ «هوش‌های چندگانهٔ گاردنر»
     پشتوانهٔ تجربیِ کافی ندارد و به کار نمی‌رود. سازه‌ای که صفحه سنجهٔ ضمنیِ معتبر برایش ندارد صریحاً «سنجیده نمی‌شود» می‌گیرد.
   - هر عدد یک احتمال است که از داده و اصل‌های کارخانه (A3 حسابِ احتمالات، A4 بی‌مرجح) درمی‌آید — بی آستانه و بی میانگینِ قراردادی:
       «احتمالِ درستیِ پاسخِ بعدی» = (k+1)/(n+2) (قضیهٔ T_next)، «احتمالِ پیشرفت» = P(درستیِ ماهِ آخر > ماهِ نخست)،
       «احتمالِ بیش‌اطمینانی» = P(درستیِ واقعی < میانگینِ اطمینانِ اعلام‌شده) — مرزِ ½ خودش از A4 است.
   - مقایسه با مردم فقط با «معماهای لنگردار»: گویه‌هایی که دشواری‌شان در جمعیت از منبعِ معتبر آمده (norms/norms.json، با منبع، N، سن).
     مدل راش (از «عینیتِ خاص» و کفایتِ نمرهٔ خام مشتق می‌شود، نه قرارداد) + توزیعِ جمعیتِ همان منبع (با میانگین و پراکندگیِ معلوم،
     توزیعِ بیشینه‌آنتروپی = نرمال؛ همان اصلِ بی‌مرجح) ⇒ احتمالِ بالاتر بودن از میانهٔ هم‌سن‌ها و صدکِ مورد انتظار.
   - هیچ «ضریبِ هوشیِ کل» ساخته نمی‌شود مگر منبع‌ها برای همان سازه‌ها آن را بدهند؛ تا آن وقت صریحاً «ساخته نمی‌شود» با دلیل.
   صادرات: A.PSY (آمار، سازه‌ها، لنگرها، سن)، A.V.psy_item (معمای امروز)، رکوردِ «psyans». */
(function (A) {
  var S = A.S, fa = A.fa, h = A.h;
  var P = A.PSY = {};

  /* ---------- آمار: پسینِ بتا از A4 (هیچ نسبتی بر دیگری مرجح نیست) + A3 ---------- */
  function lgamma(x) {
    var c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    var y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t); var s = 1.000000000190015;
    for (var j = 0; j < 6; j++) s += c[j] / ++y;
    return -t + Math.log(2.5066282746310005 * s / x);
  }
  function lbeta(x, a, b) { return x <= 0 || x >= 1 ? -Infinity : (a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) + lgamma(a + b) - lgamma(a) - lgamma(b); }
  var GRID = 801;
  /* P(p1 > p2) برای p_i ~ Beta(k_i+1, n_i−k_i+1) — انتگرالِ عددی روی شبکه */
  P.pGreater = function (k1, n1, k2, n2) {
    var a1 = k1 + 1, b1 = n1 - k1 + 1, a2 = k2 + 1, b2 = n2 - k2 + 1, dx = 1 / (GRID - 1), c1 = 0, out = 0, f1 = [], f2 = [], i, x, s1 = 0, s2 = 0;
    for (i = 0; i < GRID; i++) { x = Math.min(1 - 1e-9, Math.max(1e-9, i * dx)); f1.push(Math.exp(lbeta(x, a1, b1))); f2.push(Math.exp(lbeta(x, a2, b2))); s1 += f1[i]; s2 += f2[i]; }
    for (i = 0; i < GRID; i++) { out += (f2[i] / s2) * (1 - c1 - f1[i] / s1 / 2); c1 += f1[i] / s1; }
    return Math.max(0, Math.min(1, out));
  };
  /* P(p < c) */
  P.pBelow = function (k, n, c) {
    var a = k + 1, b = n - k + 1, dx = 1 / (GRID - 1), s = 0, below = 0;
    for (var i = 0; i < GRID; i++) { var x = Math.min(1 - 1e-9, Math.max(1e-9, i * dx)), f = Math.exp(lbeta(x, a, b)); s += f; if (x < c) below += f; }
    return s ? below / s : 0.5;
  };
  P.next = function (k, n) { return (k + 1) / (n + 2); };   // T_next
  /* چگالیِ پسین برای نمودار (بی سطحِ اطمینانِ قراردادی: خودِ منحنی نشان داده می‌شود) */
  P.density = function (k, n, pts) { pts = pts || 61; var a = k + 1, b = n - k + 1, out = []; for (var i = 0; i < pts; i++) { var x = Math.min(1 - 1e-9, Math.max(1e-9, i / (pts - 1))); out.push([x, Math.exp(lbeta(x, a, b))]); } return out; };

  /* ---------- سازه‌ها (منابع در سندِ تصمیم؛ نگاشتِ دادهٔ صفحه ⇐ سازه با دلیل) ---------- */
  P.CONSTRUCTS = [
    { id: "Gf", fa: "استدلالِ سیال", en: "Fluid reasoning (CHC Gf)", from: "مسئله‌های هم‌ساختار، ورزش‌های گره در «بازنمایی» و «راهبرد»، معماهای لنگردارِ استدلال", fams: ["F2", "F3"] },
    { id: "Gc", fa: "دانش و فهمِ انباشته", en: "Comprehension-knowledge (CHC Gc)", from: "ورزش‌های گره در «دانش و مفهوم»، معماهای لنگردارِ کلامی", fams: ["F1"] },
    { id: "Glr", fa: "یادگیری و بازیابیِ بلندمدت", en: "Learning efficiency & retrieval (CHC Gl/Gr)", from: "سنجش‌های ماندگاریِ ۳۰ و ۹۰ روزهٔ گره‌ها (نخستین پاسخِ پس از موعد)؛ کارت‌های مرور خودسنجی‌اند و جدا نشان داده می‌شوند", fams: [] },
    { id: "RQ", fa: "عقلانیت (تأمل، احتمال، تصمیم)", en: "Rational thinking (Stanovich, West & Toplak 2016, CART)", from: "ورزش‌های گره در «برداشت و نتیجه‌گیری» و «تصمیم»، داوریِ پرونده‌های کارخانه، معماهای لنگردارِ تأمل و احتمال", fams: ["F11", "F12"] },
    { id: "META", fa: "فراشناخت: هم‌خوانیِ اطمینان با درستی", en: "Metacognitive calibration", from: "اطمینانی که پیش از دیدنِ جواب به پاسخِ خودت گفته‌ای (ورزشِ گره، مسئله، حدسِ پیش از حل، معما)؛ پیش‌بینیِ رویدادها جدا سنجیده می‌شود", fams: ["F4"] },
    { id: "AFF", fa: "پیش‌بینیِ هیجانی", en: "Affective forecasting (Wilson & Gilbert 2005)", from: "زنجیره‌های نگرانی: حسِ اول در برابرِ آنچه واقعاً رخ داد", fams: [] },
    { id: "Gwm", fa: "حافظهٔ کاری و سرعتِ پردازش", en: "Working memory / processing speed (CHC Gwm, Gs)", from: "", fams: [], none: "به آزمونِ زمان‌دار و کنترل‌شده نیاز دارد؛ صفحه سنجهٔ ضمنیِ معتبر برایش ندارد ⇒ سنجیده نمی‌شود" },
    { id: "EI", fa: "هوشِ هیجانی و اجتماعی", en: "Ability EI (MSCEIT) / social cognition", from: "", fams: [], none: "سنجهٔ استانداردش (MSCEIT) آزمونِ حق‌دار و کنترل‌شده است؛ رفتارِ روزمره در صفحه جای آن را نمی‌گیرد ⇒ سنجیده نمی‌شود (فعالیت‌ها در «حوزه‌های زندگی» دیده می‌شوند)" }
  ];
  var FAM2C = {}; P.CONSTRUCTS.forEach(function (c) { (c.fams || []).forEach(function (f) { FAM2C[f] = c.id; }); });
  function okv(x) { return x === true || x === 1 || x === "1" || x === "true"; }
  function conf01(c) { c = parseFloat(c); if (isNaN(c)) return null; return c > 1 ? c / 100 : c; }

  /* روزِ محلی (نه UTC): A.today() محلی است؛ slice(0,10) روی ISO در تهران بینِ ۰۰:۰۰ تا ۰۳:۳۰ یک روز عقب است (بازبینیِ ۲۰۲۶-۱۰-۱۵، M3) */
  function lday(x) { return A.localDay ? A.localDay(x) : String(x || "").slice(0, 10); }
  P.day = lday;
  /* پاسخ‌های دقیقِ هر سازه (همان داده‌ای که کارنامه می‌خواند؛ پاسخِ «خودم سنجیدم» و ورزشِ نامعتبر شمرده نمی‌شود).
     دو جنسِ اطمینان جدا می‌مانند (بازبینیِ ۲۰۲۶-۱۰-۱۵، H3):
       - «اطمینان به پاسخِ خودم» (ورزشِ گره، مسئلهٔ هم‌ساختار، حدسِ پیش از حل، معما) ⇒ META؛
       - «احتمالِ یک رویداد» (حکمِ پرونده، زنجیرهٔ نگرانی، دفترِ پیش‌بینی) ⇒ R.FC، کالیبراسیونِ پیش‌بینی (P.forecastEst) — نه بیش‌اطمینانی به پاسخ.
     کارت‌های مرور خودسنجی‌اند (نمره را خودت می‌دهی) ⇒ مثلِ «خودم سنجیدم» ِ گره‌ها بیرون از برآورد؛ جدا در P.cardSelf() (M6). */
  P.answers = function () {
    var R = {}; P.CONSTRUCTS.forEach(function (c) { R[c.id] = []; }); R.FC = [];
    function add(cid, x, src) { if (!R[cid] || !x || x.self || x.ok == null || x.ok === "") return; R[cid].push({ at: x.at || x.d || "", ok: okv(x.ok), conf: conf01(x.conf), src: src }); }
    function fc(p, ok, at, src) { if (p == null || isNaN(p)) return; R.FC.push({ p: p, ok: ok, at: at || "", src: src }); }
    var kfam = {}; S.all("knot", function (k) { return !k.sample; }).forEach(function (k) { kfam[k.id] = k.fam || "F1"; });
    var countable = typeof A.kcountable === "function" ? A.kcountable : function (it) { return !it.bad; };
    S.all("kitem", function (it) { return !it.bad && countable(it); }).forEach(function (it) { var c = FAM2C[kfam[it.knot]]; (it.hist || []).forEach(function (x) { if (c) add(c, x, "kitem"); if (conf01(x.conf) != null) add("META", x, "kitem"); }); });
    S.all("pbitem").forEach(function (it) { (it.hist || []).forEach(function (x) { add("Gf", x, "pbitem"); if (conf01(x.conf) != null) add("META", x, "pbitem"); }); });
    /* حدسِ پیش از حل (شبیه‌ساز): اطمینان به حدسِ خودم ↔ «درست بود/نادرست بود» — همان داده‌ای که کارنامه در کالیبراسیون می‌خواند (L7) */
    S.all("eprog", function (pg) { return pg.solve && pg.solve.g; }).forEach(function (pg) {
      Object.keys(pg.solve.g).forEach(function (lv) { var g = pg.solve.g[lv]; if (!g || g.seen || conf01(g.conf) == null || (g.hit !== "درست بود" && g.hit !== "نادرست بود")) return;
        if (g.from === "live") { fc(conf01(g.conf), g.hit === "درست بود", g.hitAt || g.at, "eprog-live"); return; }   // حدسِ مسئلهٔ زنده با واقعیت داوری می‌شود ⇒ پیش‌بینیِ رویداد
        add("META", { at: g.hitAt || g.at, ok: g.hit === "درست بود", conf: g.conf }, "eprog"); });
    });
    S.all("case", function (c) { return !c.sample; }).forEach(function (cs) {
      var d = cs.st && cs.st.st_final && cs.st.st_final.data, fin = (d && d.final) || [];
      fin.forEach(function (r) { var o = (cs.outcome || {})[r.c], p = conf01(r.p); if (!r.c || p == null || (o !== "درست" && o !== "نادرست")) return;
        var y = { at: cs.outcomeAt || cs.updated || cs.created, ok: (p >= 0.5) === (o === "درست"), conf: null }; add("RQ", y, "case"); fc(p, o === "درست", y.at, "case"); });
    });
    S.all("wchain", function (c) { return c.feel != null && (c.outcome === "رخ داد" || c.outcome === "رخ نداد"); }).forEach(function (c) {
      var p = c.feel / 100, ok = c.outcome === "رخ داد"; add("AFF", { at: c.outcomeAt || c.due, ok: (p >= 0.5) === ok }, "wchain"); fc(p, ok, c.outcomeAt || c.due, "wchain");
    });
    S.all("fcast", function (x) { return x.p != null && (x.outcome === "شد" || x.outcome === "نشد"); }).forEach(function (x) { fc(conf01(x.p), x.outcome === "شد", x.outcomeAt || x.due, "fcast"); });
    /* سنجش‌های ماندگاریِ ۳۰ و ۹۰ روزهٔ گره‌ها ⇒ یادگیری و بازیابیِ بلندمدت (کارزارِ v08: پاسِ ۳۰ روزه هیچ‌جای کارنامه نبود) */
    P.holds().forEach(function (x) { add("Glr", { at: x.at, ok: x.ok }, "hold"); });
    /* معما: «دیده‌ام» ⇒ نه در مقایسه با مردم و نه در «نسبت به خودت» (پاسخِ از‌برشده درستیِ استدلال نیست)؛ ولی اطمینانش هنوز داده‌ای از فراشناخت است.
       «وقت تمام شد» ⇒ در سازه نادرست (همان نمره‌گذاریِ منبع)، ولی در META نه: پاسخی داده نشد که به آن مطمئن باشی (L5) */
    S.all("psyans").forEach(function (a) { var it = P.item(a.item); if (it && R[it.construct] && !a.familiar) add(it.construct, a, "anchor"); if (a.conf != null && !a.timeout) add("META", a, "anchor"); });
    return R;
  };
  /* کارت‌های مرور: نمرهٔ SM-2 را خودِ کاربر می‌دهد (۳ تا ۵ = «درست» در تعریفِ SM-2) ⇒ خودسنجی، جدا از برآوردها */
  P.cardSelf = function () {
    var n = 0, k = 0; S.all("card", function (c) { return !c.sample; }).forEach(function (c) { (c.hist || []).forEach(function (x) { if (x.g == null) return; n++; if (x.g >= 3) k++; }); });
    return { n: n, k: k };
  };

  /* ماندگاری: برای هر گرهِ ورزیده، هر موعدِ ۳۰/۹۰ روزه‌ای که رسیده — داوری با «نخستین» پاسخِ معتبر از روزِ موعد به بعد
     (پاسخِ درست پس از یک بازیابیِ ناموفق، ماندگاری نیست؛ بازبینیِ ۲۰۲۶-۱۰-۱۵، M4). پاسخِ «خودم سنجیدم» یا نمونهٔ وارسی‌نشده
     (e.el === false) هرگز شمرده نمی‌شود. بازگشتِ گره پیش از نخستین پاسخ ⇒ نادرست. */
  P.holds = function () {
    var out = [], HOLD = (A.ASSIST && A.ASSIST.tourHold) || [30, 90], today = A.today();
    function valid(e) { return e && e.ok != null && e.ok !== "" && !e.self && e.el !== false; }
    S.all("knot", function (k) { return !k.sample && k.solvedAt; }).forEach(function (k) {
      var solvedDay = lday(k.solvedAt), backDay = k.returnedAt && k.returnedAt > k.solvedAt ? lday(k.returnedAt) : "";
      if (backDay && backDay > today) backDay = "";
      HOLD.forEach(function (n) {
        var from = A.addDays(solvedDay, n); if (today < from) return;
        var first = (k.log || []).filter(function (e) { return valid(e) && (e.d || lday(e.at)) >= from; })
          .sort(function (a, b) { return String(a.at || a.d || "").localeCompare(String(b.at || b.d || "")); })[0];
        var fDay = first ? (first.d || lday(first.at)) : "";
        if (backDay && (backDay <= from || !first || backDay < fDay)) { out.push({ knot: k.id, n: n, at: (backDay > from ? backDay : from) + "T12:00:00Z", ok: false }); return; }
        if (!first) return;   // هنوز سنجیده نشده
        out.push({ knot: k.id, n: n, at: first.at || (fDay + "T12:00:00Z"), ok: okv(first.ok) });
      });
    });
    return out;
  };
  /* برآوردِ «نسبت به خودت» برای یک سازه */
  function month(x) { return lday(x).slice(0, 7); }
  P.selfEst = function (arr, isMeta) {
    var n = arr.length, k = arr.filter(function (a) { return a.ok; }).length, e = { n: n, k: k, next: P.next(k, n) };
    var bym = {}; arr.forEach(function (a) { var m = month(a.at); if (!m) return; (bym[m] = bym[m] || { n: 0, k: 0 }).n++; if (a.ok) bym[m].k++; });
    var ms = Object.keys(bym).sort();
    e.months = ms.map(function (m) { return { m: m, n: bym[m].n, k: bym[m].k, next: P.next(bym[m].k, bym[m].n) }; });
    if (ms.length >= 2) { var f = bym[ms[0]], l = bym[ms[ms.length - 1]]; e.progress = { from: ms[0], to: ms[ms.length - 1], p: P.pGreater(l.k, l.n, f.k, f.n) }; }
    if (isMeta) {
      var cs = arr.filter(function (a) { return a.conf != null; });
      if (cs.length) { var mc = cs.reduce(function (s, a) { return s + a.conf; }, 0) / cs.length, kk = cs.filter(function (a) { return a.ok; }).length;
        e.meanConf = mc; e.calN = cs.length; e.pOver = P.pBelow(kk, cs.length, mc); }
    }
    return e;
  };
  /* کالیبراسیونِ پیش‌بینیِ رویدادها (H3): «۱۰٪ که رخ ندهد» اطمینان به درستیِ پاسخ نیست؛ احتمالِ یک رویداد است.
     بیش‌اطمینانی در پیش‌بینی = احتمال‌هایی تندتر از بسامدِ واقعی (Lichtenstein, Fischhoff & Phillips 1982؛ Moore & Healy 2008 «overprecision»):
     هر پیش‌بینی به «طرفِ محتمل‌تر» برگردانده می‌شود، q = max(p, 1−p)، و «درست» یعنی همان طرف رخ داد؛ پس
     P(بیش‌اطمینانی) = P(بسامدِ واقعیِ طرفِ محتمل‌تر < میانگینِ q) با همان پسینِ بتای A4. پیش‌بینیِ ½ هیچ طرفی را مرجح نمی‌کند (A4) ⇒ ادعای جهت‌دار ندارد و
     در این آزمون نمی‌آید. هر دهک هم جدا: احتمالِ گفته‌شده در برابرِ بسامدِ مشاهده‌شده (برای نمودار و دستیار) — بی کفِ نمونه، با اندازهٔ نمونه. */
  P.forecastEst = function (pairs) {
    pairs = (pairs || []).filter(function (x) { return x && x.p != null && !isNaN(x.p); });
    var e = { n: pairs.length, bins: [] };
    if (!pairs.length) return e;
    var bb = {}; pairs.forEach(function (x) { var i = Math.min(9, Math.floor(x.p * 10)); (bb[i] = bb[i] || { i: i, n: 0, k: 0, s: 0 }).n++; bb[i].s += x.p; if (x.ok) bb[i].k++; });
    e.bins = Object.keys(bb).sort(function (a, b) { return a - b; }).map(function (i) { var b = bb[i]; return { lo: b.i / 10, hi: (b.i + 1) / 10, n: b.n, k: b.k, stated: b.s / b.n, next: P.next(b.k, b.n) }; });
    var bs = 0; pairs.forEach(function (x) { bs += Math.pow(x.p - (x.ok ? 1 : 0), 2); }); e.brier = bs / pairs.length;
    var dir = pairs.filter(function (x) { return x.p !== 0.5; });
    e.dirN = dir.length;
    if (dir.length) {
      var q = dir.reduce(function (s, x) { return s + Math.max(x.p, 1 - x.p); }, 0) / dir.length, hit = dir.filter(function (x) { return (x.p > 0.5) === !!x.ok; }).length;
      e.meanQ = q; e.hit = hit; e.pOver = P.pBelow(hit, dir.length, q);
    }
    return e;
  };
  /* متنِ یک‌خطیِ کالیبراسیونِ پیش‌بینی (کارنامه، سنجشِ استاندارد، دستیار) */
  P.forecastFa = function (f) {
    if (!f || !f.dirN) return f && f.n ? "پیش‌بینی‌های رویداد: " + fa(f.n) + " (همه ۵۰٪؛ ادعای جهت‌دار نیست)" : "";
    return "پیش‌بینی‌های رویداد (" + fa(f.dirN) + "): طرفِ محتمل‌تر را به‌طورِ میانگین " + fa(Math.round(100 * f.meanQ)) + "٪ گفتی و همان طرف " + fa(f.hit) + " بار از " + fa(f.dirN) + " رخ داد · احتمالِ بیش‌اطمینانی در پیش‌بینی " + P.pctFa(f.pOver);
  };

  /* ---------- لنگرها: گویه‌هایی با دشواریِ جمعیتی از منبعِ معتبر ---------- */
  /* خوانده‌شدن در لحظه (نه هنگامِ بارگذاری) تا فهرستِ تازه بی بارگذاریِ دوباره دیده شود */
  P.norms = function () { return window.PSY_NORMS || { items: [], sources: [] }; };
  P.item = function (id) { return (P.norms().items || []).filter(function (x) { return x.id === id; })[0] || null; };
  function sig(z) { return 1 / (1 + Math.exp(-z)); }
  function phi(z) { return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); }
  /* دشواریِ راش از نسبتِ درستیِ جمعیت (اگر منبع b را مستقیم نداده): حلِ ∫σ(θ−b)φ(θ)dθ = p */
  P.bFromP = function (p) {
    function pr(b) { var s = 0, dz = 0.05; for (var z = -6; z <= 6; z += dz) s += sig(z - b) * phi(z) * dz; return s; }
    var lo = -8, hi = 8; for (var i = 0; i < 60; i++) { var m = (lo + hi) / 2; if (pr(m) > p) lo = m; else hi = m; } return (lo + hi) / 2;
  };
  /* گویهٔ «لنگر» (در θ به کار می‌رود) فقط با b ِ وارسی‌شده؛ گویهٔ «توصیفی» (کلامی/مشهور) فقط «X٪ ِ گروه درست جواب دادند» */
  function bOf(it) { if (!it || it.kind === "descriptive") return null; return it.b != null ? +it.b : it.p != null ? P.bFromP(+it.p) : null; }
  P.isAnchor = function (it) { return !!it && it.kind !== "descriptive" && bOf(it) != null; };
  P.scale = function (id) { return (P.norms().scales || []).filter(function (s) { return s.id === id; })[0] || null; };
  /* کفِ حدس = ۱/شمارِ گزینه‌ها: بی‌دانستن هیچ گزینه بر دیگری مرجح نیست (A4) — قرارداد نیست */
  function cOf(it) { return it.c != null ? +it.c : (it.options && it.options.length ? 1 / it.options.length : 0); }
  function prc(th, it) { var c = cOf(it); return c + (1 - c) * sig(th - bOf(it)); }
  /* سن از تاریخِ تولدِ ثبت‌شده در تنظیمات (خودِ کاربر یا دستیار از حرفِ کاربر) */
  /* بستهٔ سن (۲۰۲۶-۱۰-۱۸): یک تاریخِ تولد — میزبان (حسابِ کاربر) یا تنظیماتِ صفحه — از A.AGE (a43_age.js)؛ سن همیشه از تاریخ */
  P.birth = function () { if (A.AGE) return A.AGE.birth(); var p = (S.settings().profile) || {}; return /^\d{4}-\d{2}-\d{2}$/.test(p.birth || "") ? p.birth : ""; };
  P.age = function () { if (A.AGE) return A.AGE.age(); var b = P.birth(); if (!b) return null; var t = A.today(), y = +t.slice(0, 4) - +b.slice(0, 4); if (t.slice(5) < b.slice(5)) y--; return y; };
  P.setBirth = function (d) { if (A.AGE) return A.AGE.setBirth(d); if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || d >= A.today() || d < "1900-01-01") return "تاریخِ تولد ثبت نشد"; var st = S.settings(); st.profile = st.profile || {}; st.profile.birth = d; S.saveSettings(st); return ""; };
  P.NO_NORM = "برای این سن هنجارِ معتبر در دست نیست";
  P.NEED_BIRTH = "برای مقایسه با هم‌سن‌ها تاریخِ دقیقِ تولدت لازم است";
  /* پوششِ سنیِ منبع (sources[].ages)؛ بی آن، همهٔ منبع‌های این فهرست نمونهٔ بزرگسال‌اند (۱۸+؛ CRC مادهٔ ۱) — هرگز به کم‌سال تعمیم داده نمی‌شوند */
  P.srcAges = function (srcId) { var s = (P.norms().sources || []).filter(function (x) { return x.id === srcId; })[0]; return (s && s.ages) || { lo: 18, hi: null }; };
  function inAges(g, age) { return age >= g.lo && (g.hi == null || age <= g.hi); }
  /* گروهِ مرجع روی مقیاسِ همان منبع: بازهٔ سنیِ شامل ِ سنِ تو؛ نبود ⇒ کلِ نمونهٔ همان مقیاس با اعلامِ صریح (نسخهٔ ۱: age.bands روی گویه) */
  /* بستهٔ سن (۲۰۲۶-۱۰-۱۸، بندِ ۵): فقط گروهِ سنیِ خودِ کاربر در همان منبع. بی تاریخِ تولد ⇒ {none:"birth"} (پرسیدن، نه N(0,1) با برچسبِ غلط ِ پیشین)؛
     سنِ بیرون از بازه‌های منبع، یا خانه‌ای که منبع‌پژوه نامعتبر علامت زده (valid:false، مثلاً ۵۰ تا ۷۴ ِ کم‌جمعیت) ⇒ {none:"age"} — بی عدد.
     «کلِ نمونه» (all) فقط وقتی منبع سن‌به‌سن ندارد و سنِ کاربر در پوششِ سنیِ آن منبع است، با اعلامِ صریح. */
  function peers(scaleOrItem, age) {
    var bands = (scaleOrItem && (scaleOrItem.bands || (scaleOrItem.age && scaleOrItem.age.bands))) || [];
    if (age == null) return { none: "birth", label: P.NEED_BIRTH, aged: false };
    var hit = bands.filter(function (x) { return x.lo != null && age >= x.lo && (x.hi == null || age <= x.hi); })[0];
    if (hit && hit.valid !== false && hit.mu != null) return { mu: +hit.mu, sd: +(hit.sd || 1), label: hit.label || "هم‌سن‌ها (" + fa(hit.lo) + " تا " + fa(hit.hi) + " سال) در همان منبع", aged: true };
    if (hit) return { none: "age", label: P.NO_NORM, why: hit.invalid_why || "", aged: false };
    var all = bands.filter(function (x) { return x.all && x.mu != null; })[0];
    var src = scaleOrItem && scaleOrItem.src, g = all && (all.lo != null ? { lo: all.lo, hi: all.hi == null ? null : all.hi } : P.srcAges(src));
    if (all && inAges(g, age)) return { mu: +all.mu, sd: +(all.sd || 1), label: (all.label || "کلِ نمونهٔ همان منبع") + " (سن‌به‌سن در منبع نیست)", aged: false };
    return { none: "age", label: P.NO_NORM, aged: false };
  }
  P.peers = peers;
  /* پسینِ θ روی شبکه (هر مقیاس جدا؛ مقیاس‌های دو منبع هرگز روی هم ریخته نمی‌شوند) */
  function posterior(ans, pe) {
    var post = [], sum = 0;
    for (var th = -6; th <= 6.0001; th += 0.02) {
      var ll = Math.log(phi((th - pe.mu) / pe.sd) / pe.sd);
      ans.forEach(function (a) { var it = P.item(a.item), pr = prc(th, it); ll += okv(a.ok) ? Math.log(pr) : Math.log(1 - pr); });
      post.push([th, ll]);
    }
    var mx = Math.max.apply(null, post.map(function (q) { return q[1]; }));
    post.forEach(function (q) { q[1] = Math.exp(q[1] - mx); sum += q[1]; });
    post.forEach(function (q) { q[1] /= sum; });
    return post;
  }
  function usable(a) { var it = P.item(a.item); return P.isAnchor(it) && !a.familiar && !a.skipped; }
  P.scaleEst = function (sid, extra) {
    var age = P.age(), sc = P.scale(sid), ans = S.all("psyans").filter(function (a) { var it = P.item(a.item); return usable(a) && (it.scale || "_" + it.construct) === sid; }).concat(extra || []);
    var first = ans[0] && P.item(ans[0].item), pe = peers(sc || first, age);
    var srcs0 = {}; ans.forEach(function (a) { var it = P.item(a.item); if (it && it.src) srcs0[it.src] = 1; });
    if (pe.none) return { scale: sid, n: ans.length, k: ans.filter(function (a) { return okv(a.ok); }).length, none: pe.none, why: pe.why || "", peers: pe.label, aged: false, theta: null, srcs: Object.keys(srcs0) };
    var post = posterior(ans, pe), above = 0, pct = 0, mean = 0, v = 0;
    post.forEach(function (q) { if (q[0] > pe.mu) above += q[1]; mean += q[0] * q[1]; pct += q[1] * 0.5 * (1 + erf((q[0] - pe.mu) / pe.sd / Math.SQRT2)); });
    post.forEach(function (q) { v += q[1] * (q[0] - mean) * (q[0] - mean); });
    var srcs = {}; ans.forEach(function (a) { var it = P.item(a.item); if (it && it.src) srcs[it.src] = 1; });
    return { scale: sid, n: ans.length, k: ans.filter(function (a) { return okv(a.ok); }).length, pAbove: above, pct: pct, theta: mean, sdTheta: Math.sqrt(v), peers: pe.label, aged: pe.aged, srcs: Object.keys(srcs) };
  };
  /* هر سازه: فهرستِ برآوردِ مقیاس‌هایش؛ برای سازگاری، نخستین مقیاس هم در خودِ شیء */
  P.popEst = function (cid) {
    var sids = {}; S.all("psyans").forEach(function (a) { var it = P.item(a.item); if (usable(a) && it.construct === cid) sids[it.scale || "_" + cid] = 1; });
    var list = Object.keys(sids).map(function (sid) { return P.scaleEst(sid); });
    if (!list.length) return { n: 0, scales: [] };
    var o = Object.assign({}, list[0]); o.scales = list; return o;
  };
  function erf(x) { var t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
  /* نشانیِ تصویرِ گویه: کنارِ بسته (/assets/lla/) یا کنارِ فایلِ مستقل (dist/) */
  P.img = function (path) {
    if (!path) return "";
    var s = document.querySelector('script[src*="/assets/lla/lla."]');
    return (s ? s.src.replace(/[^\/]*$/, "") : "") + path;
  };

  /* مدلِ کامل برای کارنامه، ایمیل و دستیار */
  P.model = function () {
    var R = P.answers(), cards = P.cardSelf();
    return P.CONSTRUCTS.map(function (c) {
      if (c.none) return { id: c.id, fa: c.fa, en: c.en, none: c.none };
      var o = { id: c.id, fa: c.fa, en: c.en, from: c.from, self: P.selfEst(R[c.id] || [], c.id === "META"), pop: P.popEst(c.id) };
      if (c.id === "META") o.fc = P.forecastEst(R.FC);
      if (c.id === "Glr") o.cards = cards;
      return o;
    });
  };
  /* درصدِ درستیِ یک گویهٔ توصیفی در گروهِ هم‌سنِ تو، اگر منبع آن را به تفکیکِ سن داده (p_band؛ M9). کلیدها «30-49» یا «65+» */
  P.bandP = function (it, age) {
    if (!it || !it.p_band || age == null) return null;
    var hit = null;
    Object.keys(it.p_band).forEach(function (key) {
      var m = /^(\d+)\s*-\s*(\d+)$/.exec(key), m2 = /^(\d+)\s*\+$/.exec(key), lo = m ? +m[1] : m2 ? +m2[1] : null, hi = m ? +m[2] : m2 ? Infinity : null;
      if (lo == null || hit || it.p_band[key] == null || age < lo || age > hi) return;
      var sc = P.scale(it.scale), b = sc && (sc.bands || []).filter(function (x) { return x.lo === lo && (x.hi == null ? hi === Infinity : x.hi === hi); })[0];
      hit = { p: +it.p_band[key], lo: lo, hi: hi, label: (b && b.label) || ("بزرگسالانِ " + fa(lo) + (hi === Infinity ? " سال به بالا" : " تا " + fa(hi) + " ساله") + " در همان منبع") };
    });
    return hit;
  };
  P.pctFa = function (p) { return fa(Math.round(100 * p)) + "٪"; };
  /* متنِ «نسبت به مردم» ِ یک مقیاس — کارنامه، گزارش و دستیار همه همین را می‌گویند (بی عدد وقتی هنجار نیست؛ بی تشویق) */
  P.popFa = function (q) {
    if (!q) return "";
    if (q.none === "birth") return P.NEED_BIRTH + "؛ تا آن وقت فقط روندِ خودت (" + fa(q.k) + " از " + fa(q.n) + " معمای لنگردار).";
    if (q.none) { var sc = P.scale(q.scale), src = sc && (P.norms().sources || []).filter(function (x) { return x.id === sc.src; })[0];
      var cov = sc ? (sc.bands || []).filter(function (b) { return b.valid !== false && b.mu != null; }).map(function (b) { return fa(b.lo) + (b.hi == null ? "+" : "–" + fa(b.hi)); }).join("، ") : "";
      return P.NO_NORM + (src ? " (منبع: " + String(src.cite || src.id).split(".")[0] + (cov ? "؛ گروه‌های سنیِ معتبرش: " + cov + " سال" : "") + ")" : "") + "؛ فقط روندِ خودت: " + fa(q.k) + " از " + fa(q.n) + " معمای لنگردار."; }
    return "احتمالِ بالاتر بودن از میانهٔ " + q.peers + ": " + P.pctFa(q.pAbove) + " · صدکِ مورد انتظار: " + fa(Math.round(100 * q.pct)) + " (" + fa(q.k) + " از " + fa(q.n) + " معمای لنگردار)";
  };
  /* گویهٔ توصیفی: درصدِ گروه فقط اگر سنِ کاربر در پوششِ سنیِ منبعِ همان گویه است */
  /* دورِ ۲۴ (R5، D24-10): سنِ معلوم و هیچ معمای لنگردارِ این سازه که منبعش این سن را پوشش دهد ⇒ همان جملهٔ صادقانه، نه «هنوز جواب نداده‌ای» (مقایسه‌ای در کار نیست) */
  P.noNormFor = function (cid, age) { if (age === undefined) age = P.age(); if (age == null) return "";
    var an = (P.norms().items || []).filter(function (it) { return (!cid || it.construct === cid) && P.isAnchor(it); });
    /* همان داوریِ مقایسه (peers): مقیاسِ گویه اگر هست — خانهٔ نامعتبر (valid:false، مثلاً ۵۰ تا ۷۴) هم «بی هنجار» است؛ وگرنه پوششِ سنیِ منبع */
    var SC = P.norms().scales || [];
    return an.length && !an.some(function (it) { var sc = SC.filter(function (x) { return x.id === it.scale; })[0]; return sc ? !peers(sc, age).none : inAges(P.srcAges(it.src), age); }) ? P.NO_NORM + "؛ فقط روندِ خودت" : ""; };
  P.descNorm = function (it, age) { if (age == null) return "birth"; return inAges(P.srcAges(it && it.src), age) ? "" : "age"; };

  /* بخشِ «📐 سنجشِ استاندارد» در کارنامه */
  P.section = function () {
    var md = P.model(), age = P.age(), N = P.norms(), sec = h("section", { class: "card psy-sec" });
    sec.appendChild(h("h2", {}, "📐 سنجشِ استاندارد"));
    sec.appendChild(h("p", { class: "small muted" }, "سازه‌ها از مدل‌های جهانیِ روان‌سنجی: CHC برای هوش، و مدلِ عقلانیتِ استانوویچ. «هوش‌های چندگانه» پشتوانهٔ تجربیِ کافی ندارد و به کار نمی‌رود. هر عدد یک احتمال است: «پاسخِ بعدی» = (درست+۱)/(کل+۲)، که از اصلِ بی‌مرجح درمی‌آید؛ «پیشرفت» = احتمالِ اینکه درستیِ ماهِ آخر از ماهِ نخست بیشتر باشد."));
    /* سن: از تاریخِ تولدی که خودت ثبت می‌کنی (یا به دستیار می‌گویی) */
    var bErr = h("p", { class: "small bad psy-age-err", role: "alert" });   // دورِ ۲۴ (R5، A24-13): خطای همین فیلد کنارِ خودش، نه فقط یک toast ِ گذرا
    var bIn = h("input", { type: "text", class: "inp sm", dir: "rtl", "data-own": "1", "aria-label": "تاریخِ تولد (شمسی یا میلادی)", placeholder: "مثلاً ۲۰ تیر ۱۳۸۵", value: P.birth() && A.AGE && A.AGE.g2j ? A.AGE.faJal(A.AGE.g2j(P.birth())) : P.birth() });   // دورِ ۲۳ (Q1): شمسی هم
    sec.appendChild(h("div", { class: "row gap wrap small psy-age" }, h("span", {}, age == null ? "پیش از مقایسه با هم‌سن‌ها، تاریخِ دقیقِ تولدت را بگو — " + (A.AGE ? A.AGE.WHY : "مقایسه فقط با هم‌سن‌ها معتبر است.") : "سن: " + fa(age) + " سال (از تاریخِ تولدِ ثبت‌شده)."), bIn,
      h("button", { class: "btn ghost sm", type: "button", "data-own": "1", onclick: function () { var e = P.setBirth(bIn.value); if (e) { var et = e.replace(/^تاریخِ تولد ثبت نشد: /, ""); bErr.textContent = (A.ASSIST && A.ASSIST.regPage ? A.ASSIST.regPage("ثبت نشد: " + et) : "ثبت نشد: " + et); A.toast(et); return; } A.render(); } }, "ثبت")));
    sec.appendChild(bErr);
    sec.appendChild(h("div", { class: "mind-scroll" }, h("table", { class: "mind-table small psy-table" },
      h("thead", {}, h("tr", {}, ["سازه", "از کجا سنجیده می‌شود", "احتمالِ درستیِ پاسخِ بعدی", "احتمالِ پیشرفت", "نسبت به مردم"].map(function (x) { return h("th", {}, x); }))),
      h("tbody", {}, md.map(function (c) {
        if (c.none) return h("tr", { "data-c": c.id, class: "muted" }, h("td", { title: c.en }, c.fa), h("td", { colspan: 4 }, c.none));
        var e = c.self, p = c.pop || { n: 0 };
        var meta = c.id === "META" && e.calN ? " · احتمالِ بیش‌اطمینانی به پاسخ‌هایت " + P.pctFa(e.pOver) + " (میانگینِ اطمینان " + fa(Math.round(100 * e.meanConf)) + "٪)" : "";
        var extra = c.id === "META" && c.fc && c.fc.n ? h("div", { class: "small psy-fc" }, P.forecastFa(c.fc)) :
          c.id === "Glr" && c.cards && c.cards.n ? h("div", { class: "small muted psy-cards" }, "کارت‌های مرور (خودسنجی، بیرون از این برآورد): " + fa(c.cards.k) + " از " + fa(c.cards.n) + " مرور را خودت «درست» (۳ تا ۵ ِ SM-2) نمره دادی") : null;
        return h("tr", { "data-c": c.id }, h("td", { title: c.en }, c.fa), h("td", { class: "small" }, c.from),
          h("td", {}, e.n ? P.pctFa(e.next) + " (" + fa(e.k) + " از " + fa(e.n) + ")" + meta : "— (هنوز پاسخی نیست)", extra),
          h("td", {}, e.progress ? P.pctFa(e.progress.p) + " (" + fa(e.progress.from) + " ← " + fa(e.progress.to) + ")" : "— (کمتر از دو ماهِ سنجیده)"),
          h("td", { class: "small" }, p.n ? (p.scales || [p]).map(P.popFa).join(" | ") :
            (N.items || []).some(function (it) { return it.construct === c.id && P.isAnchor(it); }) ? (P.noNormFor(c.id, age) || "هنوز معمای لنگرداری در این سازه جواب نداده‌ای") :
            (N.items || []).some(function (it) { return it.construct === c.id; }) ? (function () {
              /* فقط گویهٔ توصیفی (کلامی/مشهور؛ ترجمه دشواری را جابه‌جا می‌کند) ⇒ بی برآوردِ مقایسه‌ای؛ فقط درستیِ تو کنارِ درصدِ گروه */
              var da = S.all("psyans").filter(function (a) { var it = P.item(a.item); return it && it.construct === c.id && it.kind === "descriptive" && !a.familiar; });
              /* بستهٔ سن: بی تاریخ ⇒ پرسیدن؛ بیرون از پوششِ سنیِ منبع ⇒ جملهٔ صادقانه، بی درصدِ گروهِ دیگر */
              var dn = da.length ? P.descNorm(P.item(da[0].item), age) : "";
              if (dn) return "فقط معماهای توصیفی (کلامی یا مشهور) هست. تو " + fa(da.filter(function (a) { return okv(a.ok); }).length) + " از " + fa(da.length) + " را درست گفتی. " + (dn === "birth" ? P.NEED_BIRTH + "." : P.NO_NORM + "؛ فقط روندِ خودت.");
              /* درصدِ گروهِ هم‌سن هر جا منبع آن را داده (p_band)؛ وگرنه کلِ نمونه (M9) */
              var nb = 0, avg = da.length ? da.reduce(function (s, a) { var it = P.item(a.item), bp = P.bandP(it, age); if (bp) nb++; return s + (bp ? bp.p : (+it.p || 0)); }, 0) / da.length : null;
              var grp = !da.length ? "" : nb === da.length ? "در گروهِ هم‌سنِ تو در همان منبع‌ها" : nb ? "در گروهِ منبع (هم‌سن‌هایت هر جا منبع بازهٔ سنی داشت)" : "در گروهِ منبع";
              return "فقط معماهای توصیفی (کلامی یا مشهور) هست؛ برآوردِ مقایسه‌ای ساخته نمی‌شود چون ترجمه دشواری را عوض می‌کند." + (da.length ? " تو " + fa(da.filter(function (a) { return okv(a.ok); }).length) + " از " + fa(da.length) + " را درست گفتی؛ " + grp + " به‌طورِ میانگین " + fa(Math.round(100 * avg)) + "٪ درست گفته بودند." : "");
            })() : "هنوز معمای لنگرداری با دادهٔ جمعیتیِ وارسی‌شده برای این سازه در فهرست نیست"));
      })))));
    sec.appendChild(h("p", { class: "small" }, h("b", {}, "ضریبِ هوشیِ کل: "), "ساخته نمی‌شود. «ضریبِ هوشیِ کل» فقط از آزمونِ هنجاریابی‌شده و کنترل‌شده معتبر است. این صفحه آن آزمون نیست. به جایش، هر سازه جدا و با منبع با مردم مقایسه می‌شود."));
    var src = (N.sources || []), nAnch = (N.items || []).filter(P.isAnchor).length, nDesc = (N.items || []).length - nAnch;
    sec.appendChild(h("details", { class: "small" }, h("summary", {}, "منبع‌های دادهٔ جمعیتی (" + fa(src.length) + ") · " + fa(nAnch) + " معمای لنگردار" + (nDesc ? " و " + fa(nDesc) + " معمای توصیفی" : "") + (N.retrieved ? " · به‌روزرسانی " + fa(N.retrieved) : "")),
      src.length ? h("ul", {}, src.map(function (x) { return h("li", {}, (x.cite || x.id) + (x.n ? " — N=" + fa(x.n) : "") + (x.url ? " " : ""), x.url ? h("a", { href: x.url, target: "_blank", rel: "noopener" }, "پیوند") : null); })) :
        h("p", {}, "هنوز هیچ دادهٔ جمعیتیِ وارسی‌شده‌ای نیست. ناظر آن را از منابعِ معتبر (مقاله‌های داوری‌شده، فراتحلیل‌ها، نمونه‌های هنجاریِ بزرگ) جمع می‌کند و بازبینِ مستقل وارسی‌اش می‌کند.")));
    /* روزی یکی (M2): دکمه فقط اگر امروز جواب نداده‌ای، یا معمایی باز و بی‌پاسخ مانده (ادامهٔ همان) */
    if (P.canOpenToday()) sec.appendChild(h("button", { class: "btn ghost sm psy-open", type: "button", onclick: function () { A.go("psy_item"); } }, P.openItems().length ? "🧩 ادامهٔ معمای امروز" : "🧩 معمای امروز"));
    else if (P.pending().length) sec.appendChild(h("p", { class: "small muted psy-tomorrow" }, "معمای امروز را جواب داده‌ای؛ معمای بعدی فردا."));
    return sec;
  };

  /* ---------- معمای امروز — پاسخ فقط با خودِ کاربر ---------- */
  /* انتخابِ معمای بعدی: لنگری که در برآوردِ کنونی بیشترین آگاهی را می‌دهد (اطلاعِ فیشر P(1−P) در θ ِ کنونی — بیشینهٔ دانستنِ تازه،
     نه انتخابِ دلبخواه)؛ هر گویه فقط یک بار (تکرار، دشواری را عوض می‌کند)؛ گویه‌های توصیفی پس از لنگرها */
  P.pending = function () {
    var done = {}; S.all("psyans").forEach(function (a) { done[a.item] = 1; });
    var left = (P.norms().items || []).filter(function (it) { return !done[it.id] && (it.text || it.img); });
    var th = {};
    left.forEach(function (it) { var sid = it.scale || "_" + it.construct; if (P.isAnchor(it) && th[sid] == null) th[sid] = P.scaleEst(sid).theta; });
    function info(it) { if (!P.isAnchor(it)) return -1; var p = prc(th[it.scale || "_" + it.construct] || 0, it); return p * (1 - p); }
    /* معمای بازشده و بی‌پاسخ همیشه اول (M1): دیدن و رد شدن به معمای دیگر ممکن نیست */
    var op = opens();
    return left.sort(function (a, b) { return (op[b.id] ? 1 : 0) - (op[a.id] ? 1 : 0) || info(b) - info(a); });
  };
  /* «امروز» به روزِ محلی (M3) */
  P.answeredToday = function () { var t = A.today(); return S.all("psyans").some(function (a) { return lday(a.at) === t; }); };
  /* زمانِ بازشدنِ هر معما (ماندگار در تنظیمات؛ M1): بازگشت یا بارگذاریِ دوباره همان ساعت را ادامه می‌دهد؛ زمانِ گذشته ⇒ «وقت تمام شد» (نادرست) */
  function opens() { return (S.settings().psyOpen) || {}; }
  P.openedAt = function (id) { return opens()[id] || null; };
  function markOpen(id) { var st = S.settings(); st.psyOpen = st.psyOpen || {}; if (!st.psyOpen[id]) { st.psyOpen[id] = A.nowISO(); S.saveSettings(st); } return st.psyOpen[id]; }
  function clearOpen(id) { var st = S.settings(); if (st.psyOpen && st.psyOpen[id]) { delete st.psyOpen[id]; S.saveSettings(st); } }
  function answeredMap() { var d = {}; S.all("psyans").forEach(function (a) { d[a.item] = 1; }); return d; }
  /* معماهای بازشده و هنوز بی‌پاسخ */
  P.openItems = function () { var o = opens(), d = answeredMap(); return Object.keys(o).filter(function (id) { return !d[id] && P.item(id); }); };
  /* معمای زمان‌داری که باز شد و زمانش گذشت ⇒ همان «وقت تمام شد» ِ اجرای مرجع، با زمانِ پایانِ واقعی */
  P.sweep = function () {
    var o = opens(), d = answeredMap(), now = A.nowMs(), n = 0;
    Object.keys(o).forEach(function (id) {
      var it = P.item(id), t0 = Date.parse(o[id]); if (d[id] || !it || !it.time_limit_s || isNaN(t0)) return;
      var lim = 1000 * +it.time_limit_s; if (now - t0 < lim) return;
      S.put({ id: A.uid("pa"), type: "psyans", item: id, ok: false, timeout: true, familiar: false, conf: null, ms: lim, at: new Date(t0 + lim).toISOString(), created: A.nowISO() }); n++;
    });
    return n;
  };
  /* روزی یکی (M2): امروز جواب نداده‌ای و معمایی مانده — یا معمایی باز و بی‌پاسخ است (ادامهٔ همان) */
  /* دورِ ۲۳ (Q1، D23-27): معمایی که هنجارش فقط برای بزرگسال است به کم‌سال پیشنهاد نمی‌شود — هنجاری برای سنش نیست و مقایسه بی‌معناست؛ معمای بازِ پیشین ادامه دارد */
  P.ageBlocked = function () { var age = P.age(); if (age == null || !(A.AGE && A.AGE.minor(age))) return false; return !P.pending().some(function (it) { return it && inAges(P.srcAges(it.src), age); }); };
  P.canOpenToday = function () { P.sweep(); return P.openItems().length > 0 || (P.pending().length > 0 && !P.answeredToday() && !P.ageBlocked()); };
  /* پاسخِ آزاد ⇒ رقم‌های فارسی/عربی، جداکنندهٔ هزارگان و ممیزِ فارسی، ی/ک ِ عربی، نیم‌فاصله؛ و فقط وقتی کلیدِ گویه عددی است
     عددهای نوشته‌شده با حروف (صفر تا بیست؛ «نه» نه، چون «نه» ِ منفی هم هست) — H2 */
  var NUMW = { "صفر": 0, "یک": 1, "دو": 2, "سه": 3, "چهار": 4, "پنج": 5, "شش": 6, "هفت": 7, "هشت": 8, "ده": 10, "یازده": 11, "دوازده": 12, "سیزده": 13, "چهارده": 14, "پانزده": 15, "پونزده": 15, "شانزده": 16, "شونزده": 16, "هفده": 17, "هجده": 18, "هیجده": 18, "نوزده": 19, "بیست": 20 };
  P.normAns = function (v, numeric) {
    var s = String(v == null ? "" : v).replace(/[۰-۹]/g, function (d) { return String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)); }).replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x660); })
      .replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[‌‎‏]/g, " ")
      .replace(/(\d)[,٬'’](?=\d{3}(?!\d))/g, "$1").replace(/(\d)٫(?=\d)/g, "$1.")
      .replace(/\s+/g, " ").trim();
    if (numeric) s = s.split(" ").map(function (w) { return Object.prototype.hasOwnProperty.call(NUMW, w) ? String(NUMW[w]) : w; }).join(" ");
    return s;
  };
  /* درصدِ اطمینان از متن (رقمِ فارسی/لاتین، با یا بی ٪)؛ نامعلوم ⇒ NaN (اطمینان گفته نشده) */
  function confVal(c) { var s = P.normAns(c).replace(/[%٪]/g, "").trim(); return s === "" || !/^\d+(\.\d+)?$/.test(s) ? NaN : +s; }
  P.check = function (it, v) {
    if (it.options && it.options.length) return v !== "" && v != null && +v === +it.answer;
    var num = /^-?\d+(\.\d+)?$/.test(String(it.answer)), s = P.normAns(v, num);
    return (it.accept || [String(it.answer)]).some(function (re) { try { return new RegExp("^\\s*(" + re + ")\\s*$", "i").test(s); } catch (e) { return false; } });
  };
  function optLabel(o) { return typeof o === "string" ? o : (o && o.t) || ""; }
  A.V.psy_item = function () {
    P.sweep();
    var open = P.openItems(), it = P.item(A.state.arg) || P.pending()[0], root = h("div", { class: "page psy", dir: "rtl" });
    root.appendChild(A.head("نقشه‌ها", "🧩 معمای امروز", "یک معمای کوتاه. با فکرِ خودت جواب بده و بگو چقدر مطمئنی."));
    if (!it) { root.appendChild(h("p", { class: "card soft" }, (P.norms().items || []).length ? "همهٔ معماهای موجود را جواب داده‌ای." : "هنوز معمایی با دادهٔ جمعیتیِ وارسی‌شده در فهرست نیست.")); return root; }
    if (S.all("psyans").some(function (a) { return a.item === it.id; })) { root.appendChild(h("p", { class: "card soft" }, "این معما را پیش‌تر جواب داده‌ای؛ هر معما فقط یک بار شمرده می‌شود.")); return root; }
    /* معمای دیگری باز و بی‌پاسخ است ⇒ همان (دیدن و رد شدن ممکن نیست؛ M1) */
    if (open.length && open.indexOf(it.id) < 0) it = P.item(open[0]);
    /* دورِ ۲۴ (R5، C24-18): کم‌سال هرگز معمایی نمی‌گیرد که هنجارش فقط برای سنِ دیگری است (مسیرِ مستقیمِ این نما، نه فقط «امروز») — مگر همان معمای بازِ پیشین؛
       اگر معمای هم‌سنی هست، همان */
    var ag24 = P.age();
    if (ag24 != null && A.AGE && A.AGE.minor(ag24) && !P.openedAt(it.id) && !inAges(P.srcAges(it.src), ag24)) {
      var cov = P.pending().filter(function (x) { return inAges(P.srcAges(x.src), ag24); })[0];
      if (!cov) { root.appendChild(h("p", { class: "card soft psy-noage" }, "معمای امروز برای مقایسه با هم‌سن‌هاست و " + P.NO_NORM + " — پس این‌جا معمایی پیشنهاد نمی‌شود. روندِ خودت در کارنامه هست.")); return root; }
      it = cov;
    }
    /* روزی یکی (M2) */
    if (!P.openedAt(it.id) && P.answeredToday()) { root.appendChild(h("p", { class: "card soft psy-tomorrow" }, "معمای امروز را جواب داده‌ای؛ روزی یک معما — معمای بعدی فردا.")); return root; }
    var st = { v: "", c: "", fam: false, done: false }, box = h("section", { class: "card psy-q" }), t0 = Date.parse(markOpen(it.id)) || A.nowMs(), fb = h("div", { class: "small" }), timer = null;
    if (it.text) box.appendChild(h("p", { class: "psy-text" }, it.text));
    if (it.img) box.appendChild(h("img", { class: "psy-img", src: P.img(it.img), alt: "تصویرِ معما", style: "max-width:100%;height:auto" }));
    if (it.options && it.options.length) box.appendChild(h("div", { class: "pb-opts psy-opts", role: "radiogroup", "aria-label": "گزینه‌ها" }, it.options.map(function (o, i) {
      var lab = optLabel(o) || "گزینهٔ " + fa(i + 1);
      return h("label", { class: "row gap" }, h("input", { type: "radio", name: "psy-o", "data-own": "1", "aria-label": lab, onchange: function () { st.v = String(i); } }),
        o && o.img ? h("img", { src: P.img(o.img), alt: lab, style: "max-height:90px" }) : lab); })));
    else box.appendChild(h("input", { type: "text", class: "inp", "data-own": "1", "aria-label": "پاسخِ تو", oninput: function (e) { st.v = e.target.value; } }));
    box.appendChild(h("label", { class: "small" }, "چقدر مطمئنی؟ (۰ تا ۱۰۰) ", h("input", { type: "text", inputmode: "numeric", maxlength: 4, class: "inp sm", "data-own": "1", "aria-label": "درصدِ اطمینان", placeholder: "۰ تا ۱۰۰", oninput: function (e) { st.c = e.target.value; } })));
    /* آشنایی: معمای دیده‌شده دشواری‌اش برای تو با جمعیت یکی نیست ⇒ در مقایسه با مردم شمرده نمی‌شود (Stieger & Reips 2016: ۴۴٪ CRT را دیده بودند) */
    box.appendChild(h("label", { class: "small row gap" }, h("input", { type: "checkbox", "data-own": "1", "aria-label": "این معما یا شبیهش را پیش‌تر دیده‌ام", onchange: function (e) { st.fam = e.target.checked; } }), "این معما یا شبیهش را پیش‌تر دیده‌ام"));
    function save(timeout) {
      if (st.done) return; st.done = true; if (timer) clearInterval(timer);
      if (S.all("psyans").some(function (a) { return a.item === it.id; })) { A.go("mind"); return; }   // در همین فاصله ثبت شده (مثلاً پایانِ زمان در زبانه‌ای دیگر)
      var ok = !timeout && P.check(it, st.v);
      var cv = confVal(st.c);
      S.put({ id: A.uid("pa"), type: "psyans", item: it.id, ok: ok, timeout: !!timeout, familiar: st.fam, conf: isNaN(cv) ? null : Math.max(0, Math.min(100, cv)), ms: A.nowMs() - t0, at: A.nowISO(), created: A.nowISO() });
      clearOpen(it.id);
      var msg = timeout ? "وقت تمام شد." : ok ? "درست." : "نادرست.";
      if (it.kind === "descriptive" && it.p != null) {
        var bp = P.bandP(it, P.age()), sc = P.scale(it.scale), grp = (it.group || (sc && sc.bands && sc.bands[0] && sc.bands[0].label) || "نمونهٔ منبع"), dn = P.descNorm(it, P.age());
        msg += dn === "birth" ? " " + P.NEED_BIRTH + " (در کارنامه)." : dn ? " " + P.NO_NORM + "." : bp ? " " + fa(Math.round(100 * bp.p)) + "٪ ِ " + bp.label + " (هم‌سن‌هایت) درست جواب دادند؛ در کلِ نمونه " + fa(Math.round(100 * it.p)) + "٪." : " " + fa(Math.round(100 * it.p)) + "٪ ِ " + grp + " درست جواب دادند.";
      }
      A.toast(msg); A.go("mind");
    }
    box.appendChild(h("button", { class: "btn", type: "button", "data-own": "1", onclick: function () { if (st.v === "") { fb.textContent = "اول جواب بده."; return; } if (String(st.c).trim() !== "" && isNaN(confVal(st.c))) { fb.textContent = "اطمینان را با یک عدد از ۰ تا ۱۰۰ بنویس (یا خالی بگذار)."; return; } save(false); } }, "ثبتِ پاسخ"));
    /* زمانِ همان اجرای مرجع (مثلاً ۳۰ ثانیهٔ MaRs-IB) — تا دشواری با دادهٔ جمعیت یکی بماند */
    if (it.time_limit_s) {
      /* ساعت از لحظهٔ نخستین بازشدن می‌شمارد (ماندگار)، نه از هر بار نمایش (M1) */
      var lim = 1000 * +it.time_limit_s, rem = function () { return Math.max(0, Math.ceil((t0 + lim - A.nowMs()) / 1000)); };
      var tl = h("div", { class: "small psy-timer", "aria-live": "polite" }, "زمان: " + fa(rem()) + " ثانیه");
      box.appendChild(tl);
      timer = setInterval(function () { if (!document.body.contains(tl)) { clearInterval(timer); return; } var left = rem(); tl.textContent = "زمان: " + fa(left) + " ثانیه"; if (left <= 0) save(true); }, 1000);
    }
    box.appendChild(fb);
    root.appendChild(box);
    var src = (P.norms().sources || []).filter(function (s) { return s.id === it.src; })[0];
    root.appendChild(h("p", { class: "small muted" }, it.kind === "descriptive" ? "این معما در نمونه‌ای از مردم پرسیده شده؛ پس از پاسخ می‌بینی چند درصدشان درست گفتند. چون کلامی یا مشهور است، در برآوردِ مقایسه‌ای شمرده نمی‌شود." :
      "دشواریِ این معما در نمونهٔ بزرگی از مردم سنجیده شده" + (src ? " (" + (src.cite || src.id) + ")" : "") + "؛ پاسخت فقط برای مقایسهٔ منصفانه با آن‌ها به کار می‌رود."));
    return root;
  };
  A.VIEW_META = A.VIEW_META || {};
  A.VIEW_META.psy_item = { j: "ws", what: "معمای امروز: یک گویهٔ لنگردار (دشواری‌اش در جمعیت از منبعِ معتبر). پاسخ و اطمینان فقط با خودِ کاربر — دستیار نه جواب می‌دهد، نه راهنمایی می‌کند.", why: "کالیبره‌کردنِ خودسنجی با یک گویهٔ لنگردار: پاسخِ خودت در برابرِ دشواریِ جمعیتی — بی کمکِ دستیار" };
  /* «امروز»: روزی یک معما، اگر مانده و امروز جواب نداده */
  if (typeof A.dueList === "function" && !A.dueList._psy) {
    var raw = A.dueList;
    A.dueList = function () {
      var items = raw.apply(this, arguments) || [];
      if (P.canOpenToday()) items.push({ k: "p", txt: "🧩 معمای امروز", sub: "یک معمای کوتاه — با فکرِ خودت", go: function () { A.go("psy_item"); }, act: "باز کن" });
      return items;
    };
    A.dueList._psy = true;
  }
  /* دستیار: تاریخِ تولد از حرفِ خودِ کاربر؛ هرگز جوابِ معما را نمی‌دهد */
  var AS = A.ASSIST;
  if (AS && AS.DO) {
    /* دورِ ۲۳ (Q1، B·D6/D23-25): تاریخ همان‌طور که خودش گفت (شمسی یا میلادی، با نامِ ماه، یا روز + سنی که گفت) — صفحه تبدیل و وارسی می‌کند و تبدیل را نشان می‌دهد */
    /* دورِ ۲۴ (R5، B24·D6/D7، D24-5، A24-20): یک مسیر — A.AGE.fromModel: خواندنِ خودِ صفحه از پیامِ او بر تاریخِ مدل مقدم است، یک تأیید در سشن و فقط شمسی.
       مسیرِ دورِ ۲۳ (پایین) فقط بی بستهٔ سن */
    AS.DO.birth = function (a) {
      if (A.AGE && A.AGE.fromModel) return A.AGE.fromModel(a, AS._turnSession || (AS.cur && AS.cur()) || null);
      var d = String((a && (a.date || a.text)) || "").trim(), ag = a && a.age != null && +a.age >= 1 ? +a.age : null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(d) && d >= "1900-01-01" && d < A.today()) return P.setBirth(d) ? "تاریخِ تولد ثبت نشد: " + d + " در تقویم نیست" : "";
      if (!A.AGE || !A.AGE.setBirthInfo) return "تاریخِ تولد ثبت نشد: YYYY-MM-DD میلادی لازم است";
      var r = A.AGE.setBirthInfo(d, { age: ag });
      return r.iso ? "✓ تاریخِ تولد ثبت شد: " + A.AGE.faBoth(r.iso) : "تاریخِ تولد ثبت نشد: " + r.err;
    };
    var RULES = [
      "# سنجشِ استاندارد",
      "- اگر کاربر تاریخِ تولدِ خودش را گفت، با {\"do\":\"birth\",\"date\":\"همان‌طور که گفت\"} ثبت کن (شمسی یا میلادی، مثلاً «۲۰ اردیبهشت ۱۳۳۸»؛ روز بی سال + سنی که گفت ⇒ \"age\":عدد) — خودت تبدیل نکن؛ صفحه تبدیل می‌کند و نتیجه را نشان می‌دهد. فقط از حرفِ خودش، نه تولدِ دیگری.",
      "- اگر «🧩 معمای امروز» مانده و کاربر آرام است (نه وسطِ پریشانی یا کارِ فوری)، روزی یک بار با یک جمله پیشنهادش کن («یک معمای کوتاه برای امروز هست»)؛ آن را «آزمونِ هوش» نخوان و نتیجه‌اش را پیش‌بینی نکن.",
      "- «🧩 معمای امروز» را هرگز حل نکن، راهنمایی نکن و جوابش را نگو؛ اگر کاربر پرسید، بگو این یکی باید با فکرِ خودش باشد تا مقایسه منصفانه بماند.",
      "- دربارهٔ «هوش» فقط همان سازه‌ها و احتمال‌هایی را بگو که کارنامه نشان می‌دهد؛ «ضریبِ هوشیِ کل» یا رتبه‌ای را که کارنامه نمی‌دهد نساز."
    ].join("\n");
    /* فقط وقتی به کار است در پرامپت می‌آید — پرامپتِ سامانه سقفِ ۲۰ هزار نویسهٔ سرور را دارد (test_assist) */
    AS.promptHooks = AS.promptHooks || [];
    /* قاعدهٔ «هرگز حل نکن» هر وقت معمایی باز و بی‌پاسخ است (در هر نما)، یا پیام تکه‌ای از متنِ یک معما را دارد (L6) — نه فقط با کلیدواژه */
    function relatesToItem(text) {
      var t = P.normAns(text).replace(/[«»"'؟?!.,،:؛()\[\]]/g, " ").replace(/\s+/g, " ");
      if (t.length < 12) return false;
      return (P.norms().items || []).some(function (it) {
        if (!it.text) return false;
        var w = P.normAns(it.text).replace(/[«»"'؟?!.,،:؛()\[\]]/g, " ").replace(/\s+/g, " ").trim().split(" ");
        for (var i = 0; i + 4 <= w.length; i++) if (t.indexOf(w.slice(i, i + 4).join(" ")) >= 0) return true;
        return false;
      });
    }
    P.relatesToItem = relatesToItem;
    AS.promptHooks.push(function (s, msg) {
      var recent = [String(msg || "")].concat(((s && s.msgs) || []).filter(function (m) { return m.role === "user"; }).slice(-6).map(function (m) { return m.text; })).join(" ");
      var open = false; try { open = P.openItems().length > 0; } catch (e) { }
      return ((A.state && /^(mind|psy_item)$/.test(A.state.view)) || open || /تولد|سن[ّم]? |هوش|معما|IQ|ضریب/.test(recent) || relatesToItem(recent)) ? RULES : "";
    });
  }
})(APP);
