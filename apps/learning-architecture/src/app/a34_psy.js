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
    { id: "Glr", fa: "یادگیری و بازیابیِ بلندمدت", en: "Learning efficiency & retrieval (CHC Gl/Gr)", from: "کارت‌های مرور، سنجش‌های ماندگاریِ ۳۰ و ۹۰ روزه", fams: [] },
    { id: "RQ", fa: "عقلانیت (تأمل، احتمال، تصمیم)", en: "Rational thinking (Stanovich, West & Toplak 2016, CART)", from: "ورزش‌های گره در «برداشت و نتیجه‌گیری» و «تصمیم»، داوریِ پرونده‌های کارخانه، معماهای لنگردارِ تأمل و احتمال", fams: ["F11", "F12"] },
    { id: "META", fa: "فراشناخت: هم‌خوانیِ اطمینان با درستی", en: "Metacognitive calibration", from: "هر پاسخی که با درصدِ اطمینان ثبت شده", fams: ["F4"] },
    { id: "AFF", fa: "پیش‌بینیِ هیجانی", en: "Affective forecasting (Wilson & Gilbert 2005)", from: "زنجیره‌های نگرانی: حسِ اول در برابرِ آنچه واقعاً رخ داد", fams: [] },
    { id: "Gwm", fa: "حافظهٔ کاری و سرعتِ پردازش", en: "Working memory / processing speed (CHC Gwm, Gs)", from: "", fams: [], none: "به آزمونِ زمان‌دار و کنترل‌شده نیاز دارد؛ صفحه سنجهٔ ضمنیِ معتبر برایش ندارد ⇒ سنجیده نمی‌شود" },
    { id: "EI", fa: "هوشِ هیجانی و اجتماعی", en: "Ability EI (MSCEIT) / social cognition", from: "", fams: [], none: "سنجهٔ استانداردش (MSCEIT) آزمونِ حق‌دار و کنترل‌شده است؛ رفتارِ روزمره در صفحه جای آن را نمی‌گیرد ⇒ سنجیده نمی‌شود (فعالیت‌ها در «حوزه‌های زندگی» دیده می‌شوند)" }
  ];
  var FAM2C = {}; P.CONSTRUCTS.forEach(function (c) { (c.fams || []).forEach(function (f) { FAM2C[f] = c.id; }); });
  function okv(x) { return x === true || x === 1 || x === "1" || x === "true"; }
  function conf01(c) { c = parseFloat(c); if (isNaN(c)) return null; return c > 1 ? c / 100 : c; }

  /* پاسخ‌های دقیقِ هر سازه (همان داده‌ای که کارنامه می‌خواند؛ پاسخِ «خودم سنجیدم» و ورزشِ نامعتبر شمرده نمی‌شود) */
  P.answers = function () {
    var R = {}; P.CONSTRUCTS.forEach(function (c) { R[c.id] = []; });
    function add(cid, x, src) { if (!R[cid] || !x || x.self || x.ok == null || x.ok === "") return; R[cid].push({ at: x.at || x.d || "", ok: okv(x.ok), conf: conf01(x.conf), src: src }); }
    var kfam = {}; S.all("knot", function (k) { return !k.sample; }).forEach(function (k) { kfam[k.id] = k.fam || "F1"; });
    var countable = typeof A.kcountable === "function" ? A.kcountable : function (it) { return !it.bad; };
    S.all("kitem", function (it) { return !it.bad && countable(it); }).forEach(function (it) { var c = FAM2C[kfam[it.knot]]; (it.hist || []).forEach(function (x) { if (c) add(c, x, "kitem"); if (conf01(x.conf) != null) add("META", x, "kitem"); }); });
    S.all("pbitem").forEach(function (it) { (it.hist || []).forEach(function (x) { add("Gf", x, "pbitem"); if (conf01(x.conf) != null) add("META", x, "pbitem"); }); });
    S.all("card", function (c) { return !c.sample; }).forEach(function (c) { (c.hist || []).forEach(function (x) { var y = { at: x.d, ok: x.g >= 3, conf: x.c }; add("Glr", y, "card"); if (conf01(x.c) != null) add("META", y, "card"); }); });
    S.all("case", function (c) { return !c.sample; }).forEach(function (cs) {
      var d = cs.st && cs.st.st_final && cs.st.st_final.data, fin = (d && d.final) || [];
      fin.forEach(function (r) { var o = (cs.outcome || {})[r.c], p = conf01(r.p); if (!r.c || p == null || (o !== "درست" && o !== "نادرست")) return;
        var y = { at: cs.outcomeAt || cs.updated || cs.created, ok: (p >= 0.5) === (o === "درست"), conf: null }; add("RQ", y, "case"); add("META", { at: y.at, ok: o === "درست", conf: p }, "case"); });
    });
    S.all("wchain", function (c) { return c.feel != null && (c.outcome === "رخ داد" || c.outcome === "رخ نداد"); }).forEach(function (c) {
      var p = c.feel / 100, ok = c.outcome === "رخ داد"; add("AFF", { at: c.outcomeAt || c.due, ok: (p >= 0.5) === ok }, "wchain"); add("META", { at: c.outcomeAt || c.due, ok: ok, conf: p }, "wchain");
    });
    S.all("psyans").forEach(function (a) { var it = P.item(a.item); if (it && R[it.construct]) add(it.construct, a, "anchor"); if (a.conf != null) add("META", a, "anchor"); });
    return R;
  };

  /* برآوردِ «نسبت به خودت» برای یک سازه */
  function month(x) { return String(x || "").slice(0, 7); }
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
  P.birth = function () { var p = (S.settings().profile) || {}; return /^\d{4}-\d{2}-\d{2}$/.test(p.birth || "") ? p.birth : ""; };
  P.age = function () { var b = P.birth(); if (!b) return null; var t = A.today(), y = +t.slice(0, 4) - +b.slice(0, 4); if (t.slice(5) < b.slice(5)) y--; return y; };
  /* گروهِ مرجع روی مقیاسِ همان منبع: بازهٔ سنیِ شامل ِ سنِ تو؛ نبود ⇒ کلِ نمونهٔ همان مقیاس با اعلامِ صریح (نسخهٔ ۱: age.bands روی گویه) */
  function peers(scaleOrItem, age) {
    var bands = (scaleOrItem && (scaleOrItem.bands || (scaleOrItem.age && scaleOrItem.age.bands))) || [];
    var b = age == null ? null : bands.filter(function (x) { return age >= x.lo && age <= x.hi && x.mu != null; })[0];
    if (b) return { mu: +b.mu, sd: +(b.sd || 1), label: b.label || "هم‌سن‌ها (" + fa(b.lo) + " تا " + fa(b.hi) + " سال) در همان منبع", aged: true };
    var all = bands.filter(function (x) { return x.all && x.mu != null; })[0];
    return all ? { mu: +all.mu, sd: +(all.sd || 1), label: (all.label || "کلِ نمونهٔ همان منبع") + (age == null ? " (سنت ثبت نشده)" : " (برای سنِ تو بازه‌ای در منبع نیست)"), aged: false } :
      { mu: 0, sd: 1, label: "کلِ نمونهٔ همان منبع (سن‌به‌سن در منبع نیست" + (age == null ? "؛ سنت هم ثبت نشده" : "") + ")", aged: false };
  }
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
    var R = P.answers();
    return P.CONSTRUCTS.map(function (c) {
      if (c.none) return { id: c.id, fa: c.fa, en: c.en, none: c.none };
      return { id: c.id, fa: c.fa, en: c.en, from: c.from, self: P.selfEst(R[c.id] || [], c.id === "META"), pop: P.popEst(c.id) };
    });
  };
  P.pctFa = function (p) { return fa(Math.round(100 * p)) + "٪"; };

  /* بخشِ «📐 سنجشِ استاندارد» در کارنامه */
  P.section = function () {
    var md = P.model(), age = P.age(), N = P.norms(), sec = h("section", { class: "card psy-sec" });
    sec.appendChild(h("h2", {}, "📐 سنجشِ استاندارد"));
    sec.appendChild(h("p", { class: "small muted" }, "سازه‌ها از مدل‌های جهانیِ روان‌سنجی: CHC برای هوش، و مدلِ عقلانیتِ استانوویچ. «هوش‌های چندگانه» پشتوانهٔ تجربیِ کافی ندارد و به کار نمی‌رود. هر عدد یک احتمال است: «پاسخِ بعدی» = (درست+۱)/(کل+۲)، که از اصلِ بی‌مرجح درمی‌آید؛ «پیشرفت» = احتمالِ اینکه درستیِ ماهِ آخر از ماهِ نخست بیشتر باشد."));
    /* سن: از تاریخِ تولدی که خودت ثبت می‌کنی (یا به دستیار می‌گویی) */
    var bIn = h("input", { type: "date", class: "inp sm", "data-own": "1", "aria-label": "تاریخِ تولد (میلادی)", value: P.birth() });
    sec.appendChild(h("div", { class: "row gap wrap small psy-age" }, h("span", {}, age == null ? "سنت هنوز ثبت نشده؛ مقایسه با هم‌سن‌ها به آن نیاز دارد:" : "سن: " + fa(age) + " سال (از تاریخِ تولدِ ثبت‌شده)."), bIn,
      h("button", { class: "btn ghost sm", type: "button", "data-own": "1", onclick: function () { var d = bIn.value; if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || d >= A.today()) { A.toast("تاریخ درست نیست."); return; } var st = S.settings(); st.profile = st.profile || {}; st.profile.birth = d; S.saveSettings(st); A.render(); } }, "ثبت")));
    sec.appendChild(h("table", { class: "mind-table small psy-table" },
      h("thead", {}, h("tr", {}, ["سازه", "از کجا سنجیده می‌شود", "احتمالِ درستیِ پاسخِ بعدی", "احتمالِ پیشرفت", "نسبت به مردم"].map(function (x) { return h("th", {}, x); }))),
      h("tbody", {}, md.map(function (c) {
        if (c.none) return h("tr", { "data-c": c.id, class: "muted" }, h("td", { title: c.en }, c.fa), h("td", { colspan: 4 }, c.none));
        var e = c.self, p = c.pop || { n: 0 };
        var meta = c.id === "META" && e.calN ? " · احتمالِ بیش‌اطمینانی " + P.pctFa(e.pOver) + " (میانگینِ اطمینان " + fa(Math.round(100 * e.meanConf)) + "٪)" : "";
        return h("tr", { "data-c": c.id }, h("td", { title: c.en }, c.fa), h("td", { class: "small" }, c.from),
          h("td", {}, e.n ? P.pctFa(e.next) + " (" + fa(e.k) + " از " + fa(e.n) + ")" + meta : "— (هنوز پاسخی نیست)"),
          h("td", {}, e.progress ? P.pctFa(e.progress.p) + " (" + fa(e.progress.from) + " ← " + fa(e.progress.to) + ")" : "— (کمتر از دو ماهِ سنجیده)"),
          h("td", { class: "small" }, p.n ? (p.scales || [p]).map(function (q) { return "احتمالِ بالاتر بودن از میانهٔ " + q.peers + ": " + P.pctFa(q.pAbove) + " · صدکِ مورد انتظار: " + fa(Math.round(100 * q.pct)) + " (" + fa(q.k) + " از " + fa(q.n) + " معمای لنگردار)"; }).join(" | ") :
            (N.items || []).some(function (it) { return it.construct === c.id; }) ? "هنوز معمای لنگرداری در این سازه جواب نداده‌ای" : "هنوز معمای لنگرداری با دادهٔ جمعیتیِ وارسی‌شده برای این سازه در فهرست نیست"));
      }))));
    sec.appendChild(h("p", { class: "small" }, h("b", {}, "ضریبِ هوشیِ کل: "), "ساخته نمی‌شود. «ضریبِ هوشیِ کل» فقط از آزمونِ هنجاریابی‌شده و کنترل‌شده معتبر است. این صفحه آن آزمون نیست. به جایش، هر سازه جدا و با منبع با مردم مقایسه می‌شود."));
    var src = (N.sources || []);
    sec.appendChild(h("details", { class: "small" }, h("summary", {}, "منبع‌های دادهٔ جمعیتی (" + fa(src.length) + ") · " + fa((N.items || []).length) + " معمای لنگردار" + (N.retrieved ? " · به‌روزرسانی " + N.retrieved : "")),
      src.length ? h("ul", {}, src.map(function (x) { return h("li", {}, (x.cite || x.id) + (x.n ? " — N=" + fa(x.n) : "") + (x.url ? " " : ""), x.url ? h("a", { href: x.url, target: "_blank", rel: "noopener" }, "پیوند") : null); })) :
        h("p", {}, "هنوز هیچ دادهٔ جمعیتیِ وارسی‌شده‌ای نیست. ناظر آن را از منابعِ معتبر (مقاله‌های داوری‌شده، فراتحلیل‌ها، نمونه‌های هنجاریِ بزرگ) جمع می‌کند و بازبینِ مستقل وارسی‌اش می‌کند.")));
    if (P.pending().length) sec.appendChild(h("button", { class: "btn ghost sm", type: "button", onclick: function () { A.go("psy_item"); } }, "🧩 معمای امروز"));
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
    return left.sort(function (a, b) { return info(b) - info(a); });
  };
  P.answeredToday = function () { return S.all("psyans").some(function (a) { return String(a.at).slice(0, 10) === A.today(); }); };
  function optLabel(o) { return typeof o === "string" ? o : (o && o.t) || ""; }
  A.V.psy_item = function () {
    var it = P.item(A.state.arg) || P.pending()[0], root = h("div", { class: "page psy", dir: "rtl" });
    root.appendChild(A.head("نقشه‌ها", "🧩 معمای امروز", "یک معمای کوتاه. با فکرِ خودت جواب بده و بگو چقدر مطمئنی."));
    if (!it) { root.appendChild(h("p", { class: "card soft" }, (P.norms().items || []).length ? "همهٔ معماهای موجود را جواب داده‌ای." : "هنوز معمایی با دادهٔ جمعیتیِ وارسی‌شده در فهرست نیست.")); return root; }
    if (S.all("psyans").some(function (a) { return a.item === it.id; })) { root.appendChild(h("p", { class: "card soft" }, "این معما را پیش‌تر جواب داده‌ای؛ هر معما فقط یک بار شمرده می‌شود.")); return root; }
    var st = { v: "", c: "", fam: false, done: false }, box = h("section", { class: "card psy-q" }), t0 = Date.now(), fb = h("div", { class: "small" }), timer = null;
    if (it.text) box.appendChild(h("p", { class: "psy-text" }, it.text));
    if (it.img) box.appendChild(h("img", { class: "psy-img", src: P.img(it.img), alt: "تصویرِ معما", style: "max-width:100%;height:auto" }));
    if (it.options && it.options.length) box.appendChild(h("div", { class: "pb-opts psy-opts", role: "radiogroup", "aria-label": "گزینه‌ها" }, it.options.map(function (o, i) {
      var lab = optLabel(o) || "گزینهٔ " + fa(i + 1);
      return h("label", { class: "row gap" }, h("input", { type: "radio", name: "psy-o", "data-own": "1", "aria-label": lab, onchange: function () { st.v = String(i); } }),
        o && o.img ? h("img", { src: P.img(o.img), alt: lab, style: "max-height:90px" }) : lab); })));
    else box.appendChild(h("input", { type: "text", class: "inp", "data-own": "1", "aria-label": "پاسخِ تو", oninput: function (e) { st.v = e.target.value; } }));
    box.appendChild(h("label", { class: "small" }, "چقدر مطمئنی؟ (۰ تا ۱۰۰) ", h("input", { type: "number", min: 0, max: 100, class: "inp sm", "data-own": "1", "aria-label": "درصدِ اطمینان", oninput: function (e) { st.c = e.target.value; } })));
    /* آشنایی: معمای دیده‌شده دشواری‌اش برای تو با جمعیت یکی نیست ⇒ در مقایسه با مردم شمرده نمی‌شود (Stieger & Reips 2016: ۴۴٪ CRT را دیده بودند) */
    box.appendChild(h("label", { class: "small row gap" }, h("input", { type: "checkbox", "data-own": "1", "aria-label": "این معما یا شبیهش را پیش‌تر دیده‌ام", onchange: function (e) { st.fam = e.target.checked; } }), "این معما یا شبیهش را پیش‌تر دیده‌ام"));
    function save(timeout) {
      if (st.done) return; st.done = true; if (timer) clearInterval(timer);
      var ok = !timeout && (it.options && it.options.length ? st.v !== "" && +st.v === +it.answer : (it.accept || [String(it.answer)]).some(function (re) { try { return new RegExp("^\\s*(" + re + ")\\s*$", "i").test(A.toEnDigits ? A.toEnDigits(st.v) : st.v); } catch (e) { return false; } }));
      S.put({ id: A.uid("pa"), type: "psyans", item: it.id, ok: ok, timeout: !!timeout, familiar: st.fam, conf: st.c === "" ? null : Math.max(0, Math.min(100, +st.c)), ms: Date.now() - t0, at: new Date().toISOString(), created: new Date().toISOString() });
      var msg = timeout ? "وقت تمام شد." : ok ? "درست." : "نادرست.";
      if (it.kind === "descriptive" && it.p != null) { var sc = P.scale(it.scale), grp = (it.group || (sc && sc.bands && sc.bands[0] && sc.bands[0].label) || "نمونهٔ منبع"); msg += " " + fa(Math.round(100 * it.p)) + "٪ ِ " + grp + " درست جواب دادند."; }
      A.toast(msg); A.go("mind");
    }
    box.appendChild(h("button", { class: "btn", type: "button", "data-own": "1", onclick: function () { if (st.v === "") { fb.textContent = "اول جواب بده."; return; } save(false); } }, "ثبتِ پاسخ"));
    /* زمانِ همان اجرای مرجع (مثلاً ۳۰ ثانیهٔ MaRs-IB) — تا دشواری با دادهٔ جمعیت یکی بماند */
    if (it.time_limit_s) {
      var left = +it.time_limit_s, tl = h("div", { class: "small psy-timer", "aria-live": "polite" }, "زمان: " + fa(left) + " ثانیه");
      box.appendChild(tl);
      timer = setInterval(function () { if (!document.body.contains(tl)) { clearInterval(timer); return; } left--; tl.textContent = "زمان: " + fa(Math.max(0, left)) + " ثانیه"; if (left <= 0) save(true); }, 1000);
    }
    box.appendChild(fb);
    root.appendChild(box);
    var src = (P.norms().sources || []).filter(function (s) { return s.id === it.src; })[0];
    root.appendChild(h("p", { class: "small muted" }, it.kind === "descriptive" ? "این معما در نمونه‌ای از مردم پرسیده شده؛ پس از پاسخ می‌بینی چند درصدشان درست گفتند. چون کلامی یا مشهور است، در برآوردِ مقایسه‌ای شمرده نمی‌شود." :
      "دشواریِ این معما در نمونهٔ بزرگی از مردم سنجیده شده" + (src ? " (" + (src.cite || src.id) + ")" : "") + "؛ پاسخت فقط برای مقایسهٔ منصفانه با آن‌ها به کار می‌رود."));
    return root;
  };
  A.VIEW_META = A.VIEW_META || {};
  A.VIEW_META.psy_item = { j: "ws", what: "معمای امروز: یک گویهٔ لنگردار (دشواری‌اش در جمعیت از منبعِ معتبر). پاسخ و اطمینان فقط با خودِ کاربر — دستیار نه جواب می‌دهد، نه راهنمایی می‌کند." };
  /* «امروز»: روزی یک معما، اگر مانده و امروز جواب نداده */
  if (typeof A.dueList === "function" && !A.dueList._psy) {
    var raw = A.dueList;
    A.dueList = function () {
      var items = raw.apply(this, arguments) || [];
      if (P.pending().length && !P.answeredToday()) items.push({ k: "p", txt: "🧩 معمای امروز", sub: "یک معمای کوتاه — با فکرِ خودت", go: function () { A.go("psy_item"); }, act: "باز کن" });
      return items;
    };
    A.dueList._psy = true;
  }
  /* دستیار: تاریخِ تولد از حرفِ خودِ کاربر؛ هرگز جوابِ معما را نمی‌دهد */
  var AS = A.ASSIST;
  if (AS && AS.DO) {
    AS.DO.birth = function (a) {
      var d = String((a && a.date) || "").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || d >= A.today() || d < "1900-01-01") return "تاریخِ تولد ثبت نشد: YYYY-MM-DD میلادی لازم است";
      var st = S.settings(); st.profile = st.profile || {}; st.profile.birth = d; S.saveSettings(st); return "";
    };
    AS.SYS += "\n" + [
      "# سنجشِ استاندارد",
      "- اگر کاربر تاریخِ تولدش را گفت، با {\"do\":\"birth\",\"date\":\"YYYY-MM-DD\"} (میلادی) ثبت کن — فقط از حرفِ خودش.",
      "- اگر «🧩 معمای امروز» مانده و کاربر آرام است (نه وسطِ پریشانی یا کارِ فوری)، روزی یک بار با یک جمله پیشنهادش کن («یک معمای کوتاه برای امروز هست»)؛ آن را «آزمونِ هوش» نخوان و نتیجه‌اش را پیش‌بینی نکن.",
      "- «🧩 معمای امروز» را هرگز حل نکن، راهنمایی نکن و جوابش را نگو؛ اگر کاربر پرسید، بگو این یکی باید با فکرِ خودش باشد تا مقایسه منصفانه بماند.",
      "- دربارهٔ «هوش» فقط همان سازه‌ها و احتمال‌هایی را بگو که کارنامه نشان می‌دهد؛ «ضریبِ هوشیِ کل» یا رتبه‌ای را که کارنامه نمی‌دهد نساز."
    ].join("\n");
  }
})(APP);
