/* ===== «🧠 کارنامهٔ ذهن» — یک نگاه و جزئیات، از دادهٔ خودِ تو (مالک ۲۰۲۶-۱۰-۱۴) =====
   طراحی و مرزهای صداقت: docs/decisions/2026-10-14-mind-report-card.md. خلاصه: هفت بُعد (شش سامانهٔ «🗺 قلمروِ سامانه‌ها» + داوریِ
   معرفتی)، چهار شاخصِ شفاف (دقت، کالیبراسیون، ماندگاری، بازشدنِ گره‌ها) هر کدام با اندازهٔ نمونه؛ زیرِ ۵ نمونه عدد نمی‌دهد. هیچ «ضریبِ
   هوشی» و هیچ مقایسه با «مردم» بی منبع ساخته نمی‌شود. نمودارها SVG ِ بی‌کتابخانه‌اند و برای ایمیل به PNG تبدیل می‌شوند (A.MIND.png).
   صادرات: A.MIND.model() (دادهٔ کامل)، A.MIND.charts(model) ⇒ {radar, trend, calib, neural, mindmap, months}، A.V.mind. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S;
  var M = A.MIND = {};
  var NS = "http://www.w3.org/2000/svg";
  var MIN_N = 5, HOLD = 30, BANDS = [[40, "در آغاز"], [65, "در حالِ رشد"], [85, "ورزیده"], [101, "استوار"]];
  M.MIN_N = MIN_N; M.BANDS = BANDS;
  /* قرنطینه (بازبینیِ ۲۰۲۶-۱۰-۱۵، M6): نقطهٔ سیاهِ «بیش از ۳۰ روز باز» برشِ قراردادی بود؛ جایش «موعدِ ورزشِ خودِ گره گذشته».
     برای بازگرداندن، عددِ روز را این‌جا بگذار (۰ = خاموش). حذف فقط با تأییدِ مالک (docs/overhaul/REMOVAL_CANDIDATES.md). */
  M.LEGACY_STALE_DAYS = 0;
  /* هر خانوادهٔ گره ⇐ بُعد: اول از ارجاع‌های نقشهٔ قلمروها (همان «kfam:F7» در حوزه‌های هر سامانه)، و اگر نبود این پیش‌فرض */
  var KF_DEFAULT = { F1: "s_learn", F2: "s_problem", F3: "s_problem", F4: "s_learn", F5: "s_mind", F6: "s_decision", F7: "s_mind", F8: "s_social", F9: "s_self", F10: "s_decision", F11: "s_epi", F12: "s_decision" };
  M.dims = function () {
    var ss = ((window.SYS_TERR || {}).systems || []).map(function (m) { return { id: m.id, fa: m.fa }; });
    if (!ss.length) ss = [{ id: "s_learn", fa: "یادگیری و حافظه" }, { id: "s_mind", fa: "ذهن و هیجان" }, { id: "s_problem", fa: "حلِ مسئله و استدلال" }, { id: "s_decision", fa: "تصمیم و خودتنظیمی" }, { id: "s_social", fa: "ارتباط و دیگران" }, { id: "s_self", fa: "خودشناسی و معنا" }];
    return ss.concat([{ id: "s_epi", fa: "داوریِ معرفتی" }]);
  };
  M.dimOf = function (ref) {
    // خانوادهٔ گره یک بُعدِ اصلی دارد (معنای خودِ خانواده)؛ شمارشِ حوزه‌ها فقط برای فن/حرکت/ایستگاه — کارزارِ آزمون (sc01، sc03، sc04):
    // F11 در شش حوزهٔ «خودشناسی» آمده بود و گره‌های برداشت زیرِ خودشناسی می‌رفتند
    var kf = /^kfam:(F\d+)$/.exec(ref); if (kf && KF_DEFAULT[kf[1]]) return KF_DEFAULT[kf[1]];
    var cnt = {};
    ((window.SYS_TERR || {}).systems || []).forEach(function (m) { (m.groups || []).forEach(function (g) { (g.areas || []).forEach(function (a) { if ((a.tools || []).indexOf(ref) >= 0) cnt[m.id] = (cnt[m.id] || 0) + 1; }); }); });
    var best = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a] || a.localeCompare(b); })[0];
    if (best) return best;
    var m = /^kfam:(F\d+)$/.exec(ref); if (m) return KF_DEFAULT[m[1]] || "s_mind";
    if (/^move:/.test(ref)) return "s_problem";
    if (/^station:/.test(ref)) return "s_epi";
    return "s_learn";
  };
  /* روز و ماهِ محلی (نه UTC؛ بازبینیِ ۲۰۲۶-۱۰-۱۵، M3) */
  function day(x) { return A.localDay ? A.localDay(x) : String(x || "").slice(0, 10); }
  function month(x) { return day(x).slice(0, 7); }
  function brier(pairs) { if (!pairs.length) return null; var s = 0; pairs.forEach(function (p) { s += Math.pow(p.p - (p.ok ? 1 : 0), 2); }); return s / pairs.length; }
  function conf01(c) { c = parseFloat(c); if (isNaN(c)) return null; return c > 1 ? c / 100 : c; }

  /* ---------- مدل ---------- */
  M.model = function () {
    var dims = M.dims(), D = {};
    dims.forEach(function (d) { D[d.id] = { id: d.id, fa: d.fa, ans: [], cal: [], ret: { n: 0, ok: 0 }, knots: { open: 0, working: 0, practised: 0, returned: 0, all: 0 }, items: [] }; });
    function put(dim, rec) { (D[dim] || D.s_mind).ans.push(rec); }
    var knots = S.all("knot", function (k) { return !k.sample; }), kdim = {};
    knots.forEach(function (k) {
      var d = M.dimOf("kfam:" + (k.fam || "F1")); kdim[k.id] = d;
      var st = k.status || "open", X = D[d] || D.s_mind; X.knots.all++; X.knots[st] = (X.knots[st] || 0) + 1; X.items.push({ t: "knot", id: k.id, fa: k.name || k.title || "گره", st: st, at: k.created });
    });
    /* پاسخ‌های پاسخ‌دقیق: ورزشِ گره (وارسی‌شده/کد/خودت با عدد) و مسئله‌های هم‌ساختار */
    var countable = typeof A.kcountable === "function" ? A.kcountable : function (it) { return !it.bad; };
    /* noRet: ماندگاریِ گره‌ها فقط از A.PSY.holds (نخستین پاسخِ پس از موعد) — این‌جا دوباره شمرده نمی‌شود (M5) */
    function ingest(dim, hist, noRet, c) {
      var t0 = null;
      (hist || []).forEach(function (x) {
        if (!x || x.self || x.ok == null || x.ok === "") return;
        var ok = x.ok === true || x.ok === 1 || x.ok === "1" || x.ok === "true", at = x.at || x.d || "";
        put(dim, { at: at, ok: ok, src: c });
        var cf = conf01(x.conf); if (cf != null) (D[dim] || D.s_mind).cal.push({ p: cf, ok: ok, at: at, src: c });
        if (!noRet && t0 && day(at) >= A.addDays(day(t0), HOLD)) { var R = (D[dim] || D.s_mind).ret; R.n++; if (ok) R.ok++; }
        if (ok && !t0) t0 = at;
      });
    }
    S.all("kitem", function (it) { return !it.bad && countable(it); }).forEach(function (it) { ingest(kdim[it.knot] || "s_mind", it.hist, !!(A.PSY && A.PSY.holds), { id: it.id, fa: "ورزشِ گره «" + String(it.q || it.title || it.prompt || "").slice(0, 50) + "»" }); });
    S.all("pbitem").forEach(function (it) { ingest("s_problem", it.hist, false, { id: it.id, fa: "مسئلهٔ هم‌ساختار «" + String(it.q || it.title || it.prompt || "").slice(0, 50) + "»" }); });
    /* حدسِ پیش از حل (شبیه‌ساز، سطحِ ۳–۴): اطمینان ↔ «درست بود/نادرست بود» با پاسخِ معلومِ مسئله ⇒ فقط کالیبراسیونِ حلِ مسئله، نه دقت («تاحدی» بیرون) */
    S.all("eprog", function (pg) { return pg.solve && pg.solve.g; }).forEach(function (pg) {
      Object.keys(pg.solve.g).forEach(function (lv) { var g = pg.solve.g[lv]; if (!g || g.seen || g.wd || g.retracted || g.conf == null || (g.hit !== "درست بود" && g.hit !== "نادرست بود")) return;   // INF17: حدسِ پس‌گرفته (اصلاح) شمرده نمی‌شود   // حدسِ پس از دیدنِ راه پیش‌بینی نیست
        /* حدسِ «🔭 مسئلهٔ حل‌نشدهٔ خودم» با واقعیت داوری می‌شود، نه با پاسخِ معلوم ⇒ پیش‌بینیِ رویداد (fc)، نه اطمینان به پاسخ */
        var c = conf01(g.conf), pid0 = String(pg.id).replace(/^eprog_/, ""); if (c != null) D.s_problem.cal.push({ p: c, ok: g.hit === "درست بود", at: g.hitAt || g.at, fc: g.from === "live" || undefined, src: { id: "g:" + pg.id + ":" + lv, pid: pid0, fa: "حدسِ «" + String(g.guess || "").slice(0, 50) + "» (اطمینان " + Math.round(100 * c) + "٪)" } }); });
    });
    /* کارت‌های مرور: نمره را خودِ کاربر می‌دهد ⇒ خودسنجی؛ مثلِ «خودم سنجیدم» ِ گره‌ها بیرون از دقت/اطمینان/ماندگاری، جدا شمرده می‌شود (M6) */
    D.s_learn.cardSelf = { n: 0, k: 0 };
    S.all("card", function (c) { return !c.sample; }).forEach(function (c) { (c.hist || []).forEach(function (x) { if (x.g == null) return; D.s_learn.cardSelf.n++; if (x.g >= 3) D.s_learn.cardSelf.k++; }); });
    /* حرکت‌ها: شمارِ پاسخ‌های درست/نادرستِ هر حرکت (دفترِ حرکت‌ها زمان و حرکت را با هم نگه نمی‌دارد ⇒ در روندِ ماهانه نمی‌آید) */
    var mp = S.get("moves_prog"); Object.keys((mp && mp.by) || {}).forEach(function (mv) { var b = mp.by[mv], d = M.dimOf("move:" + mv); for (var i = 0; i < (b.n || 0); i++) put(d, { at: "", ok: i < (b.ok || 0), src: { id: "move:" + mv + ":" + i, fa: "حرکتِ «" + mv + "»" } }); });
    /* داوریِ معرفتی: درجهٔ نهاییِ تو ↔ نتیجهٔ واقعیِ ثبت‌شده در بازبینی */
    var cases = S.all("case", function (c) { return !c.sample; });
    cases.forEach(function (cs) {
      var d = cs.st && cs.st.st_final && cs.st.st_final.data, fin = (d && d.final) || [];
      D.s_epi.items.push({ t: "case", id: cs.id, fa: cs.title || "پرونده", st: (cs.st && cs.st.st_final && cs.st.st_final.done) ? "done" : "open", at: cs.created });
      fin.forEach(function (r) {
        var o = (cs.outcome || {})[r.c]; if (!r.c || r.p == null || r.p === "" || (o !== "درست" && o !== "نادرست")) return;
        var p = conf01(r.p), ok = o === "درست", at = cs.outcomeAt || cs.updated || cs.created;
        var cs0 = { id: "case:" + cs.id + ":" + r.c, fa: "پروندهٔ «" + String(cs.title || "").slice(0, 40) + "» — درجهٔ پایانی در برابرِ نتیجهٔ واقعی" };
        D.s_epi.cal.push({ p: p, ok: ok, at: at, fc: true, src: cs0 });
        D.s_epi.ans.push({ at: at, ok: (p >= 0.5) === ok, src: cs0 });
      });
    });
    /* ⛓ زنجیرهٔ نگرانی (حسِ اول ↔ رخ داد/نداد) و 🎯 دفترِ پیش‌بینی (احتمال ↔ شد/نشد) ⇒ کالیبراسیونِ همان بُعد.
       «fc» = احتمالِ یک رویداد، نه اطمینان به پاسخِ خودم ⇒ با P.forecastEst سنجیده می‌شود، نه با بیش‌اطمینانی به پاسخ (H3) */
    S.all("wchain", function (c) { return c.feel != null && (c.outcome === "رخ داد" || c.outcome === "رخ نداد"); }).forEach(function (c) {
      var p = c.feel / 100, ok = c.outcome === "رخ داد", w0 = { id: "wchain:" + c.id, fa: "زنجیرهٔ نگرانی «" + String(c.title || "").slice(0, 40) + "»" }; D.s_mind.cal.push({ p: p, ok: ok, at: c.outcomeAt || c.due, fc: true, src: w0 }); D.s_mind.ans.push({ at: c.outcomeAt || c.due, ok: (p >= 0.5) === ok, src: w0 });
    });
    S.all("fcast", function (x) { return x.p != null && (x.outcome === "شد" || x.outcome === "نشد"); }).forEach(function (x) {
      /* پیش‌بینیِ رویداد فقط کالیبراسیونِ پیش‌بینی است، نه «دقتِ پاسخ» (بازبینیِ ۲۰۲۶-۱۰-۱۵ ِ «🔭 مسئلهٔ حل‌نشدهٔ خودم»): «طرفِ محتمل‌تر رخ داد» پاسخِ
         درست به پرسشی نیست؛ همین برای همهٔ دفترِ پیش‌بینی برقرار است، پس دیگر به X.ans نمی‌رود */
      var X = D[x.dim] || D.s_decision, p = x.p / 100, ok = x.outcome === "شد"; X.cal.push({ p: p, ok: ok, at: x.outcomeAt || x.due, fc: true, src: { id: "fcast:" + x.id, fa: "پیش‌بینیِ «" + String(x.q || x.title || x.what || "").slice(0, 40) + "»" } });
    });
    // نقشه‌های پیش‌نیاز ⇒ بُعدِ «یادگیری و حافظه» (کارزارِ آزمون c08: کارنامه از ۸ پیش‌نیازِ سنجیده هیچ نشان نمی‌داد)
    S.all("prereq").forEach(function (p) { var it = p.items || []; if (it.length) D.s_learn.items.push({ t: "prereq", id: p.id, fa: "🧩 " + (p.title || "پیش‌نیاز") + " — " + (function () { var no = it.filter(function (x) { return x.self === "بلد نیستم"; }).length, half = it.filter(function (x) { return x.self === "نیمه"; }).length; return "از " + it.length + ": " + no + " نبود" + (half ? "، " + half + " نیمه" : ""); })(), st: p.back === "حل شد" ? "practised" : "open", at: p.created }); });
    S.all("eprob", function (p) { return !p.sample; }).forEach(function (p) { D.s_problem.items.push({ t: "prob", id: p.id, fa: (p.p && p.p.title) || "مسئله", st: p.status, at: p.created }); });
    /* شاخص‌ها */
    dims.forEach(function (dd) {
      var X = D[dd.id], ix = {};
      ix.acc = X.ans.length >= MIN_N ? Math.round(100 * X.ans.filter(function (a) { return a.ok; }).length / X.ans.length) : null;
      var b = brier(X.cal); ix.cal = X.cal.length >= MIN_N ? Math.round(100 * (1 - b)) : null;
      ix.ret = X.ret.n >= MIN_N ? Math.round(100 * X.ret.ok / X.ret.n) : null;
      ix.knot = X.knots.all >= MIN_N ? Math.round(100 * (X.knots.practised || 0) / X.knots.all) : null;
      var vals = [ix.acc, ix.cal, ix.ret, ix.knot].filter(function (v) { return v != null; });
      if (ix.acc == null && ix.cal == null) vals = [];   // بی شاخصِ عملکرد (دقت یا کالیبراسیون با ≥ ۵ نمونه) نمره‌ای نیست — وضعِ گره‌ها تنها کافی نیست
      X.ix = ix; X.n = { acc: X.ans.length, cal: X.cal.length, ret: X.ret.n, knot: X.knots.all };
      X.score = vals.length ? Math.round(vals.reduce(function (s, v) { return s + v; }, 0) / vals.length) : null;
      X.band = X.score == null ? "دادهٔ کم" : BANDS.filter(function (b2) { return X.score < b2[0]; })[0][1];
      // «ورزیده/استوار» همان معیارِ «حل‌شدن» را می‌خواهد: دست‌کم ۲ نوبت با ≥ ۳ روز فاصله؛ یک نشستِ پرامتیاز «در حالِ رشد» می‌ماند (کارزارِ آزمون sc04)
      var dys = X.ans.concat(X.cal).map(function (a) { return String(a.at || "").slice(0, 10); }).filter(Boolean).sort();
      X.spread = dys.length ? A.daysBetween(dys[0], dys[dys.length - 1]) : 0;
      if (X.score != null && X.score >= 65 && X.spread < 3) X.band = "در حالِ رشد · تک‌نوبت";
      // گرهِ بازگشته در همین بُعد ⇒ «استوار» نیست (کارزارِ آزمون sc17: پس از بازگشت «۹۸ · استوار» ماند)
      if (X.band === "استوار" && (X.knots.returned || 0) > 0) X.band = "ورزیده · گرهِ بازگشته";
      /* روندِ ماهانه: دقت و کالیبراسیونِ هر ماه (نمونهٔ ماه ≥ ۳) */
      /* بی کفِ نمونه (M6): هر ماه با هر شمار پاسخ، و برآوردش (درست+۱)/(کل+۲) که با نمونهٔ کم خودبه‌خود به ½ نزدیک می‌ماند (A4) */
      var bym = {}; X.ans.forEach(function (a) { var m = month(a.at); if (!m) return; (bym[m] = bym[m] || { n: 0, ok: 0, cal: [] }).n++; if (a.ok) bym[m].ok++; });
      X.cal.forEach(function (c) { var m = month(c.at); if (!m) return; (bym[m] = bym[m] || { n: 0, ok: 0, cal: [] }).cal.push(c); });
      X.months = Object.keys(bym).sort().map(function (m) { var r = bym[m], bb = brier(r.cal); return { m: m, acc: r.n ? Math.round(100 * r.ok / r.n) : null, cal: r.cal.length ? Math.round(100 * (1 - bb)) : null, n: r.n, k: r.ok, next: r.n ? (r.ok + 1) / (r.n + 2) : null }; });
      var lm = X.months.filter(function (x) { return x.acc != null; });
      // روند = نخستین ماهِ سنجیده تا آخرین ماهِ سنجیده، با بازه‌اش (کارزارِ سوم v05: فقط دو ماهِ آخر ⇒ ۴۰→۱۰۰ «▲۰» نشان می‌داد)
      X.trend = lm.length >= 2 ? lm[lm.length - 1].acc - lm[0].acc : null;
      X.trendFrom = lm.length >= 2 ? lm[0].m : null; X.trendTo = lm.length >= 2 ? lm[lm.length - 1].m : null;
      /* برآوردِ بی‌آستانه (مالک ۲۰۲۶-۱۰-۱۵: «بدونِ اعدادِ قراردادی»): هر عدد یک احتمال از A3+A4 — ر.ک. a34_psy.js. «نمره» و «مرحله» ِ بالا
         (میانگینِ چهار شاخص و برش‌های ۴۰/۶۵/۸۵) قراردادی بودند: فقط برای سازگاریِ پیشین حساب می‌شوند و نمایش داده نمی‌شوند (REMOVAL_CANDIDATES). */
      if (A.PSY) {
        X.est = A.PSY.selfEst(X.ans, false);
        /* اطمینان به پاسخِ خودم ⇒ P(درستیِ واقعی < میانگینِ اطمینان)؛ احتمالِ رویداد ⇒ کالیبراسیونِ پیش‌بینی (طرفِ محتمل‌تر؛ H3) — هرگز روی هم ریخته نمی‌شوند */
        var calE = A.PSY.selfEst(X.cal.filter(function (c) { return !c.fc; }).map(function (c) { return { at: c.at, ok: c.ok, conf: c.p }; }), true);
        X.est.pOver = calE.pOver; X.est.meanConf = calE.meanConf; X.est.calN = calE.calN || 0;
        X.est.fc = A.PSY.forecastEst ? A.PSY.forecastEst(X.cal.filter(function (c) { return c.fc; })) : { n: 0 };
      }
    });
    /* نقطه‌های سیاه */
    var black = [], today = A.today();
    knots.forEach(function (k) {
      if (k.status === "returned") black.push({ k: "returned", fa: "گرهِ بازگشته: «" + (k.name || "گره") + "»", go: ["knot", k.id], dim: kdim[k.id] });
      else if ((k.status || "open") !== "practised") {
        /* «گیر کرده» از برنامهٔ خودِ همان گره (موعدِ ورزشِ بعدی‌اش روی نردبانِ فاصله‌ها گذشته)، نه از برشِ قراردادیِ «۳۰ روز» (M6؛
           برشِ پیشین قرنطینه است: M.LEGACY_STALE_DAYS، خاموش؛ docs/overhaul/REMOVAL_CANDIDATES.md) */
        var nx = typeof A.knotNext === "function" ? A.knotNext(k) : null;
        if (nx && nx < today) black.push({ k: "stale", fa: "ورزشِ گرهِ بازِ «" + (k.name || "گره") + "» از موعدِ خودش (" + A.fdate(nx) + ") گذشته", go: ["kpractice", k.id], dim: kdim[k.id] });
        else if (M.LEGACY_STALE_DAYS && k.created && A.daysBetween(day(k.created), today) > M.LEGACY_STALE_DAYS) black.push({ k: "stale", fa: "بیش از " + fa(M.LEGACY_STALE_DAYS) + " روز باز: «" + (k.name || "گره") + "»", go: ["kpractice", k.id], dim: kdim[k.id] });
      }
    });
    dims.forEach(function (dd) {
      // بیش‌اطمینانی: وقتی احتمالِ «درستیِ واقعی کمتر از میانگینِ اطمینانِ اعلام‌شده» از ½ بیشتر است (مرزِ ½ از A4، نه برشِ قراردادیِ ۸۰/۶۵)
      var X = D[dd.id], E = X.est || {};
      /* تورِ پولیا (RN3b): نقطهٔ سیاهِ بیش‌اطمینانی فقط با دست‌کم یک رویدادِ همان نوع — پاسخِ مطمئن (>½) که نادرست بود / پیش‌بینیِ جهت‌دار که طرفِ محتمل‌ترش رخ نداد؛
         پیش‌بینیِ درست هرگز (پیشینِ ½ به‌تنهایی برچسب نمی‌سازد) */
      var missA = X.cal.filter(function (c) { return !c.fc && c.p > 0.5 && !c.ok; }).length, missF = X.cal.filter(function (c) { return c.fc && c.p != null && c.p !== 0.5 && (c.p > 0.5) !== !!c.ok; }).length;
      if (E.pOver != null && E.pOver > 0.5 && missA >= 1) black.push({ k: "overconf", fa: "بیش‌اطمینانی در پاسخ‌های «" + dd.fa + "»: میانگینِ اطمینانت " + fa(Math.round(100 * E.meanConf)) + "٪ بوده و احتمالِ اینکه درستیِ واقعی‌ات کمتر از آن باشد " + fa(Math.round(100 * E.pOver)) + "٪ است (" + fa(E.calN) + " پاسخ)", dim: dd.id });
      var F = E.fc || {};
      if (F.pOver != null && F.pOver > 0.5 && missF >= 1) black.push({ k: "overconf_fc", fa: "بیش‌اطمینانی در پیش‌بینی‌های «" + dd.fa + "»: طرفِ محتمل‌تر را به‌طورِ میانگین " + fa(Math.round(100 * F.meanQ)) + "٪ گفتی، ولی همان طرف " + fa(F.dirN - F.hit) + " بار از " + fa(F.dirN) + " رخ نداد (" + fa(F.hit) + " بار رخ داد)؛ احتمالِ اینکه بسامدِ واقعی کمتر از گفته‌ات باشد " + fa(Math.round(100 * F.pOver)) + "٪ است", dim: dd.id });
    });
    /* مسیرهای پیشِ رو و «از کجا دوری» (از قلمروِ سامانه‌ها) */
    var far = [], ahead = [];
    if (A.SYST) A.SYST.areas().forEach(function (x) {
      var st = A.SYST.stage(x.a), u = A.SYST.uses(x.a).n;
      if ((x.a.tools || []).length && !u) far.push({ dim: x.sys.id, fa: x.a.fa, why: "ابزار دارد ولی هنوز به کارش نبرده‌ای", go: ["sterr", x.sys.id] });
      else if (!(x.a.tools || []).length) far.push({ dim: x.sys.id, fa: x.a.fa, why: "صفحه هنوز ابزاری برایش ندارد (گامِ " + fa(st) + ")", go: ["sterr", x.sys.id] });
    });
    S.all("achat", function (s) { return s.tour && !s.tour.masteredAt; }).forEach(function (s) {
      (s.tour.facets || []).forEach(function (f) { var fu = A.ASSIST && A.ASSIST.tourFollowups ? A.ASSIST.tourFollowups(f) : []; if (fu.length) ahead.push({ fa: "«" + f.title + "»: " + fu[0].t, go: [f.view || "home", f.arg || null] }); });
    });
    var due = typeof A.dueList === "function" ? A.dueList().slice(0, 8).map(function (x) { return { fa: x.txt }; }) : [];
    /* خطِ زمانی */
    var ev = [];
    knots.forEach(function (k) { if (k.created) ev.push({ at: k.created, fa: "گرهٔ تازه: «" + (k.name || "گره") + "»" }); (k.hist || []).forEach(function (x) { if (x.status === "practised") ev.push({ at: x.at, fa: "✓ ورزیده: «" + (k.name || "گره") + "»" }); if (x.status === "returned") ev.push({ at: x.at, fa: "↩ بازگشت: «" + (k.name || "گره") + "»" }); }); });
    knots.forEach(function (k) { (k.remeasures || []).forEach(function (r) { ev.push({ at: r.at, fa: "📏 دوباره‌سنجیِ «" + (k.name || "گره") + "»: " + (A.knotRemeasureText ? A.knotRemeasureText(k, r) : [r.freq, r.intensity != null ? "شدت " + fa(r.intensity) : "", r.note].filter(Boolean).join(" · ")) }); }); });
    /* ماندگاریِ گره‌ها: فقط همین‌جا شمرده می‌شود (ingest پاسخ‌های گره را دوباره نمی‌شمارد؛ M5) */
    if (A.PSY && A.PSY.holds) A.PSY.holds().forEach(function (x) { var k = S.get(x.knot) || {}; ev.push({ at: x.at, fa: (x.ok ? "✓" : "✗") + " ماندگاریِ " + x.n + " روزهٔ «" + (k.name || "گره") + "»" }); var X = D[kdim[x.knot]]; if (X) { X.ret.n++; if (x.ok) X.ret.ok++; } });
    cases.forEach(function (c) { if (c.created) ev.push({ at: c.created, fa: "پروندهٔ سنجش: «" + (c.title || "") + "»" }); var fn = c.st && c.st.st_final; if (fn && fn.done) ev.push({ at: fn.at || c.updated || c.created, fa: "⚖️ حکمِ پایانیِ پرونده: «" + (c.title || "") + "»" }); if (c.outcomeAt) ev.push({ at: c.outcomeAt, fa: "نتیجهٔ واقعی ثبت شد: «" + (c.title || "") + "»" }); });
    S.all("kcase", function (c) { return !c.sample && c.created; }).forEach(function (c) { ev.push({ at: c.created, fa: "🪢 موقعیتِ گره‌گشا: «" + (c.title || "") + "»" }); });
    S.all("prereq", function (p) { return p.created; }).forEach(function (p) { ev.push({ at: p.created, fa: "🧩 نقشهٔ پیش‌نیازها: «" + (p.title || "") + "»" }); if (p.backAt && p.back) ev.push({ at: p.backAt, fa: "🧩 بازگشت به مسئله: " + p.back }); });
    S.all("wchain", function (c) { return c.created; }).forEach(function (c) { ev.push({ at: c.created, fa: "⛓ زنجیرهٔ نگرانی: «" + c.title + "»" }); if (c.outcomeAt) ev.push({ at: c.outcomeAt, fa: "⛓ نتیجهٔ «" + c.title + "»: " + c.outcome }); });
    S.all("achat", function (s) { return s.tour; }).forEach(function (s) { ev.push({ at: s.tour.createdAt, fa: "🧭 تورِ تازه: «" + (s.title || s.pinned || "") + "»" }); if (s.tour.doneAt) ev.push({ at: s.tour.doneAt, fa: "🧭 ترتیبِ تور طی شد: «" + (s.title || "") + "»" }); if (s.tour.masteredAt) ev.push({ at: s.tour.masteredAt, fa: "🏁 تور تا تسلط کامل شد: «" + (s.title || "") + "»" }); });
    /* حلِ مسئله (شبیه‌ساز): بازنگری‌ها و برگشت پس از کنارگذاشتن — رویداد، نه نمره */
    S.all("eprog", function (pg) { return pg.solve; }).forEach(function (pg) {
      var pid = String(pg.id).replace(/^eprog_/, ""), pr = A.getProb ? A.getProb(pid) : null, tt = (pr && pr.title) || "مسئله";
      (pg.solve.lessons || []).forEach(function (l) { ev.push({ at: l.at, fa: "🔁 بازنگریِ «" + tt + "»: " + String(l.use || "").slice(0, 60) }); });
      (pg.solve.incub || []).forEach(function (x) { ev.push({ at: x.at, fa: "↩ برگشت به «" + tt + "» پس از کنارگذاشتن: " + x.fresh }); });
    });
    /* موفقیت‌های کوچک و نهفتگی (تورِ ۱، s34): «🌱 گامِ کوچکِ انجام‌شده» و «کنار گذاشتن و بازگشت» — فقط داده، از همان رکوردهای «🌱» (will) و گام‌های مسئلهٔ زنده؛ نمره نیست */
    function willEv(w, tt) {
      if (!w) return;
      (w.steps || []).forEach(function (st) { (st.checks || []).forEach(function (c) { if (c.done === "yes") ev.push({ at: c.at, kind: "small", fa: "🌱 گامِ کوچکِ انجام‌شده در «" + tt + "»: " + String(st.step || "").slice(0, 70) }); else if (c.done === "part") ev.push({ at: c.at, kind: "small", fa: "🌱 گامِ کوچکِ نیمه‌انجام در «" + tt + "»: " + String(st.step || "").slice(0, 70) }); }); });
      (w.log || []).forEach(function (l) {
        if (l.kind === "commit" && l.desire === "drop") ev.push({ at: l.at, kind: "incub", fa: "⏸ کنار گذاشتن (آگاهانه): «" + tt + "»" });
        if (l.kind === "drop-recheck") ev.push({ at: l.at, kind: "incub", fa: l.keep === "back" ? "↩ بازگشت پس از کنار گذاشتن: «" + tt + "»" : "⏸ کنار ماند (همان دلیل هنوز پذیرفته): «" + tt + "»" });
      });
    }
    S.all("eprog", function (pg) { return pg.solve && (pg.solve.will || pg.solve.live); }).forEach(function (pg) {
      var pid = String(pg.id).replace(/^eprog_/, ""), pr = A.getProb ? A.getProb(pid) : null, tt = (pr && pr.title) || "مسئله";
      willEv(pg.solve.will, tt);
      ((pg.solve.live && pg.solve.live.steps) || []).forEach(function (st) { var o = st && st.out; if (o && !o.auto && o.done === "yes") ev.push({ at: o.at, kind: "small", fa: "🌱 گامِ کوچکِ انجام‌شده در «" + tt + "»: " + String(st.text || "").slice(0, 70) }); });
    });
    S.all("idea", function (r) { return r.will; }).forEach(function (r) { willEv(r.will, r.title || "ایده"); });
    S.all("kcase", function (r) { return r.will && !r.sample; }).forEach(function (r) { willEv(r.will, r.title || "موقعیت"); });
    S.all("eprob", function (r) { return r && r.live && r.p && r.dormant && r.woke; }).forEach(function (r) { ev.push({ at: r.woke, kind: "incub", fa: "↩ بازگشت به مسئلهٔ خفته پس از کنار ماندن: «" + r.p.title + "»" }); });
    ev = ev.filter(function (e) { return e.at; }).sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); });
    var tot = { knots: knots.length, practised: knots.filter(function (k) { return k.status === "practised"; }).length, returned: knots.filter(function (k) { return k.status === "returned"; }).length,
    /* «مسئله‌ها»: مسئلهٔ خودِ کاربر در گره‌گشا و نقشهٔ پیش‌نیاز هم مسئله است (کارزارِ آزمونِ دوم c16/c17: «مسئله‌ها ۰») */
      cases: cases.length, probs: S.all("eprob", function (p) { return !p.sample; }).length + S.all("prereq").length + S.all("kcase", function (c) { return !c.sample && c.intake && (c.intake.kinds || []).indexOf("problem") >= 0; }).length, tours: S.all("achat", function (s) { return s.tour; }).length, answers: dims.reduce(function (t, d) { return t + D[d.id].ans.length; }, 0) };
    return { at: new Date().toISOString(), psy: A.PSY ? A.PSY.model() : [], dims: dims.map(function (d) { return D[d.id]; }), black: black, far: far, ahead: ahead, due: due, events: ev.slice(0, 60), tot: tot };
  };

  /* ---------- نمودارها (SVG) ---------- */
  function el(n, at, kids) { var e = document.createElementNS(NS, n); Object.keys(at || {}).forEach(function (k) { if (at[k] != null) e.setAttribute(k, at[k]); }); (kids || []).forEach(function (c) { if (c) e.appendChild(c); }); return e; }
  function txt(x, y, s, at) { var t = el("text", Object.assign({ x: x, y: y, "font-size": 11, fill: "#334", "text-anchor": "middle", direction: "rtl", "font-family": "Vazirmatn, Tahoma, sans-serif" }, at || {})); t.textContent = s; return t; }
  function svgBox(w, hh, title) { var s = el("svg", { xmlns: NS, viewBox: "0 0 " + w + " " + hh, width: w, height: hh, role: "img", "aria-label": title, class: "mind-svg", style: "max-width:100%;height:auto" }); s.appendChild(el("rect", { x: 0, y: 0, width: w, height: hh, fill: "#fff" })); return s; }
  /* نیم‌رخ: احتمالِ درستیِ پاسخِ بعدی در هر سازهٔ استاندارد (a34_psy) — خاکستری = هنوز پاسخی نیست؛ سازهٔ «سنجیده‌نشدنی» روی نمودار نمی‌آید */
  M.radar = function (m) {
    var cs = (m.psy || []).filter(function (c) { return !c.none; });
    var W = 420, H = 380, cx = 210, cy = 195, R = 130, n = Math.max(3, cs.length), s = svgBox(W, H, "نیم‌رخِ سازه‌ها");
    s.appendChild(txt(cx, 22, "احتمالِ درستیِ پاسخِ بعدی در هر سازه (خاکستری = هنوز پاسخی نیست)", { "font-size": 12, "font-weight": 700 }));
    [25, 50, 75, 100].forEach(function (v) { var pts = []; for (var i = 0; i < n; i++) { var a = -Math.PI / 2 + 2 * Math.PI * i / n; pts.push((cx + R * v / 100 * Math.cos(a)).toFixed(1) + "," + (cy + R * v / 100 * Math.sin(a)).toFixed(1)); } s.appendChild(el("polygon", { points: pts.join(" "), fill: "none", stroke: v === 50 ? "#94a3b8" : "#e2e8f0", "stroke-dasharray": v === 50 ? "4 3" : null })); });
    var pts = [];
    cs.forEach(function (c, i) {
      var a = -Math.PI / 2 + 2 * Math.PI * i / n, x = cx + (R + 30) * Math.cos(a), y = cy + (R + 30) * Math.sin(a), e = c.self || { n: 0 };
      s.appendChild(el("line", { x1: cx, y1: cy, x2: cx + R * Math.cos(a), y2: cy + R * Math.sin(a), stroke: "#dde" }));
      s.appendChild(txt(x, y, c.fa.split(/[،,:(]/)[0].trim() + (e.n ? " (" + fa(Math.round(100 * e.next)) + ")" : " (—)"), { fill: e.n ? "#223" : "#999", "font-size": 10 }));
      var v = e.n ? e.next : 0.5; pts.push((cx + R * v * Math.cos(a)).toFixed(1) + "," + (cy + R * v * Math.sin(a)).toFixed(1));
    });
    if (cs.length) s.appendChild(el("polygon", { points: pts.join(" "), fill: "rgba(15,118,110,.25)", stroke: "#0f766e", "stroke-width": 2 }));
    s.appendChild(txt(cx, H - 8, "خطِ‌چینِ میانی = ½ (بی‌داده، هیچ طرف مرجح نیست)", { "font-size": 9, fill: "#666" }));
    return s;
  };
  /* تازه‌ترین‌ها بر پایهٔ تاریخ، نه ترتیبِ ذخیره (کارزارِ سوم v05: پس از رکوردهای عقب‌برده، رکوردهای واقعیِ تازه از نقشه افتادند) */
  function newest(arr, n) { var d = function (x) { return String((x && (x.created || x.at || x.date || x.updated)) || ""); }; return arr.slice().sort(function (a, b) { return d(a).localeCompare(d(b)); }).slice(-n); }
  M.trend = function (m) {
    var W = 560, H = 260, s = svgBox(W, H, "روندِ ماهانهٔ دقت"), months = {};
    m.dims.forEach(function (d) { d.months.forEach(function (x) { months[x.m] = 1; }); });
    var ms = Object.keys(months).sort().slice(-12);
    s.appendChild(txt(W / 2, 20, "روندِ ماهانه: احتمالِ درستیِ پاسخِ بعدی در هر بُعد، (درست+۱)/(کل+۲) ِ همان ماه", { "font-size": 12, "font-weight": 700 }));
    var x0 = 40, x1 = W - 20, y0 = H - 40, y1 = 64;
    [0, 50, 100].forEach(function (v) { var y = y0 - (y0 - y1) * v / 100; s.appendChild(el("line", { x1: x0, x2: x1, y1: y, y2: y, stroke: "#eee" })); s.appendChild(txt(x0 - 14, y + 4, fa(v), { "font-size": 9 })); });
    if (!ms.length) { s.appendChild(txt(W / 2, H / 2, "هنوز پاسخی برای روند نیست", { fill: "#999" })); return s; }
    ms.forEach(function (mm, i) { var x = ms.length > 1 ? x0 + (x1 - x0) * i / (ms.length - 1) : (x0 + x1) / 2; s.appendChild(txt(x, H - 20, mm.slice(2).replace("-", "/"), { "font-size": 9 })); });
    var COL = ["#0f766e", "#b45309", "#7c3aed", "#be123c", "#1d4ed8", "#4d7c0f", "#475569"];
    m.dims.forEach(function (d, k) {
      var pts = []; d.months.forEach(function (x) { var i = ms.indexOf(x.m); if (i < 0 || x.next == null) return; pts.push([ms.length > 1 ? x0 + (x1 - x0) * i / (ms.length - 1) : (x0 + x1) / 2, y0 - (y0 - y1) * x.next]); });
      if (!pts.length) return;
      s.appendChild(el("polyline", { points: pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "), fill: "none", stroke: COL[k % COL.length], "stroke-width": 2 }));
      pts.forEach(function (p) { s.appendChild(el("circle", { cx: p[0], cy: p[1], r: 3, fill: COL[k % COL.length] })); });
      s.appendChild(txt(W - 10 - 84 * (k % 6), 38 + 13 * Math.floor(k / 6), "■ " + d.fa.split(/[،,]| و /)[0], { fill: COL[k % COL.length], "font-size": 10, "text-anchor": "end" }));
    });
    return s;
  };
  M.calib = function (m) {
    var W = 360, H = 300, s = svgBox(W, H, "کالیبراسیون"), all = [];
    m.dims.forEach(function (d) { all = all.concat(d.cal); });
    s.appendChild(txt(W / 2, 20, "کالیبراسیون: احتمالِ گفته‌شده ↔ بسامدِ واقعی", { "font-size": 13, "font-weight": 700 }));
    s.appendChild(txt(W / 2, 36, "● آبی: اطمینان به پاسخت · ● نارنجی: پیش‌بینیِ رویداد (اندازه = شمار)", { "font-size": 9, fill: "#555" }));
    var x0 = 40, x1 = W - 20, y0 = H - 40, y1 = 40;
    s.appendChild(el("line", { x1: x0, y1: y0, x2: x1, y2: y1, stroke: "#ccc", "stroke-dasharray": "4 3" }));
    s.appendChild(txt((x0 + x1) / 2, H - 12, "اطمینان", { "font-size": 10 })); s.appendChild(txt(16, (y0 + y1) / 2, "درستی", { "font-size": 10 }));
    // محورها با عدد (کارزارِ آزمون sc09: نمودار عدد نداشت)
    s.appendChild(el("line", { x1: x0, y1: y0, x2: x1, y2: y0, stroke: "#999" })); s.appendChild(el("line", { x1: x0, y1: y0, x2: x0, y2: y1, stroke: "#999" }));
    [0, 50, 100].forEach(function (v) {
      s.appendChild(txt(x0 + (x1 - x0) * v / 100, y0 + 14, A.fa(v) + "٪", { "font-size": 9, fill: "#666" }));
      s.appendChild(txt(x0 - 14, y0 - (y0 - y1) * v / 100 + 3, A.fa(v) + "٪", { "font-size": 9, fill: "#666" }));
    });
    /* بی کفِ نمونه (M6): اندازهٔ دایره شمار را نشان می‌دهد؛ دو جنسِ اطمینان دو رنگ (H3) */
    [[false, "rgba(29,78,216,.6)"], [true, "rgba(217,119,6,.6)"]].forEach(function (ser) {
      for (var i = 0; i < 10; i++) {
        var bin = all.filter(function (c) { return !!c.fc === ser[0] && Math.min(9, Math.floor(c.p * 10)) === i; }); if (!bin.length) continue;
        var acc = bin.filter(function (c) { return c.ok; }).length / bin.length, cx = x0 + (x1 - x0) * (i + 0.5) / 10, cy = y0 - (y0 - y1) * acc;
        s.appendChild(el("circle", { cx: cx, cy: cy, r: Math.min(14, 3 + Math.sqrt(bin.length) * 2), fill: ser[1], "data-n": bin.length, "data-fc": ser[0] ? 1 : 0 }));
      }
    });
    if (!all.length) s.appendChild(txt(W / 2, H / 2, "هنوز پاسخی با اطمینانِ ثبت‌شده نیست", { fill: "#999" }));
    return s;
  };
  /* «شبکهٔ عصبی»: ورودی (موقعیت/پرونده/مسئله) ⇐ پنهان (گره‌ها) ⇐ خروجی (بُعدها) — فقط پیوندهای موجود در داده */
  M.neural = function (m) {
    var W = 640, H = 420, s = svgBox(W, H, "شبکهٔ ذهن");
    s.appendChild(txt(W / 2, 20, "شبکهٔ ذهن: موقعیت‌ها ⇐ گره‌ها ⇐ بُعدها (ضخامت = شمارِ پیوند؛ رنگ = وضع)", { "font-size": 12, "font-weight": 700 }));
    var kcs = newest(S.all("kcase", function (c) { return !c.sample; }), 14), cases = newest(S.all("case", function (c) { return !c.sample; }), 6), probs = newest(S.all("eprob", function (p) { return !p.sample; }), 4);
    var ins = kcs.map(function (c) { return { id: c.id, fa: c.title || "موقعیت", kn: c.knots || [] }; })
      .concat(cases.map(function (c) { return { id: c.id, fa: c.title || "پرونده", kn: c.src && c.src.type === "kcase" ? ((S.get(c.src.id) || {}).knots || []) : [], dim: "s_epi" }; }))
      .concat(probs.map(function (p) { return { id: p.id, fa: (p.p && p.p.title) || "مسئله", kn: [], dim: "s_problem" }; }))
      /* نقشهٔ پیش‌نیاز (گره‌های موقعیتِ خودش) و تورهای دستیار (گره‌ها و گره‌های موقعیت‌هایی که هر وجه ارجاع می‌دهد) — ممیزیِ اجرا ۲۰۲۶-۱۰-۱۵ */
      .concat(newest(S.all("prereq"), 4).map(function (p) { var kc = p.kcase ? S.get(p.kcase) : null; return { id: p.id, fa: "🧩 " + (p.title || "پیش‌نیاز"), kn: (kc && kc.knots) || [], dim: "s_learn" }; }))
      .concat(newest(S.all("achat", function (x) { return x.tour; }), 3).map(function (x) {
        var kn = []; (x.tour.facets || []).forEach(function (f) { (f.refs || []).forEach(function (r) { if (!r) return; if (r.type === "knot") kn.push(r.id); else if (r.type === "kcase") kn = kn.concat((S.get(r.id) || {}).knots || []); }); });
        return { id: x.id, fa: "🧭 " + (x.title || "تور"), kn: kn.filter(function (v, i, a) { return a.indexOf(v) === i; }), dim: null }; }));
    var knots = newest(S.all("knot", function (k) { return !k.sample; }), 16), dims = m.dims;
    var col = { open: "#94a3b8", working: "#f59e0b", practised: "#10b981", returned: "#ef4444" };
    function ys(n, i) { return 50 + (H - 80) * (n === 1 ? 0.5 : i / (n - 1)); }
    var P = {};
    ins.forEach(function (x, i) { P["i" + x.id] = [W - 170, ys(ins.length, i)]; });
    knots.forEach(function (k, i) { P["k" + k.id] = [W / 2, ys(knots.length, i)]; });
    dims.forEach(function (d, i) { P["d" + d.id] = [170, ys(dims.length, i)]; });
    function link(a, b, w, c) { if (!P[a] || !P[b]) return; s.appendChild(el("line", { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], stroke: c || "#9db", "stroke-width": w, "stroke-opacity": 0.7 })); }
    ins.forEach(function (x) { x.kn.forEach(function (kid) { link("i" + x.id, "k" + kid, 1.5); }); if (x.dim) link("i" + x.id, "d" + x.dim, 1, "#cbd5e1"); });
    var kd = {}; knots.forEach(function (k) { var d = M.dimOf("kfam:" + (k.fam || "F1")); kd[k.id] = d; link("k" + k.id, "d" + d, 1 + Math.min(4, (k.cases || []).length), col[k.status || "open"]); });
    ins.forEach(function (x) { var p = P["i" + x.id]; s.appendChild(el("circle", { cx: p[0], cy: p[1], r: 5, fill: "#64748b" })); s.appendChild(txt(p[0] + 10, p[1] + 4, String(x.fa).slice(0, 26), { "text-anchor": "start", direction: "ltr", "font-size": 9 })); });
    knots.forEach(function (k) { var p = P["k" + k.id]; s.appendChild(el("circle", { cx: p[0], cy: p[1], r: 7, fill: col[k.status || "open"] })); s.appendChild(txt(p[0], p[1] - 10, String(k.name || "گره").slice(0, 24), { "font-size": 9 })); });
    /* اندازهٔ گرهٔ بُعد = احتمالِ درستیِ پاسخِ بعدی (A3+A4)، نه «نمره» ِ قرنطینه‌شده (M6) */
    dims.forEach(function (d) { var p = P["d" + d.id], E = d.est || { n: 0 }; s.appendChild(el("circle", { cx: p[0], cy: p[1], r: 10 + (E.n ? 10 * E.next : 0), fill: E.n ? "#0f766e" : "#e2e8f0", "data-next": E.n ? E.next.toFixed(3) : "" })); s.appendChild(txt(p[0] - 22, p[1] + 4, d.fa.split(/[،,]| و /)[0], { "text-anchor": "end", direction: "ltr", "font-size": 10 })); });
    if (!ins.length && !knots.length) s.appendChild(txt(W / 2, H / 2, "هنوز موقعیت یا گره‌ای ثبت نشده", { fill: "#999" }));
    return s;
  };
  /* نقشهٔ کاملِ ذهن: تو در مرکز، بُعدها، و گره‌ها/پرونده‌ها/مسئله‌ها/موضوع‌ها/تورها با پیوندهای واقعی */
  M.mindmap = function (m) {
    var W = 640, H = 520, cx = W / 2, cy = H / 2 + 10, s = svgBox(W, H, "نقشهٔ کاملِ ذهن");
    s.appendChild(txt(W / 2, 20, "نقشهٔ کاملِ ذهن: گره‌ها، موقعیت‌ها، خطاهای معرفتی، مسئله‌ها، موضوع‌ها و تورها", { "font-size": 12, "font-weight": 700 }));
    var dims = m.dims, R1 = 110, R2 = 215, pos = {};
    dims.forEach(function (d, i) { var a = -Math.PI / 2 + 2 * Math.PI * i / dims.length; pos[d.id] = [cx + R1 * Math.cos(a), cy + R1 * Math.sin(a), a]; });
    var outer = [];
    dims.forEach(function (d) { newest(d.items, 8).forEach(function (it) { outer.push({ d: d.id, it: it }); }); });
    /* موقعیت‌های گره‌گشا (در d.items نیستند) — با خطِ واقعی به گره‌هایشان (ممیزیِ اجرا ۲۰۲۶-۱۰-۱۵) */
    newest(S.all("kcase", function (c) { return !c.sample; }), 6).forEach(function (c) { var k0 = (c.knots || []).map(function (id) { return S.get(id); }).filter(Boolean)[0];
      var dd = (c.root && c.root.primary) ? M.dimOf("kfam:" + c.root.primary) : k0 ? M.dimOf("kfam:" + (k0.fam || "F1")) : "s_mind";
      outer.push({ d: dd, it: { t: "kcase", id: c.id, fa: "🪢 " + (c.title || (c.intake && c.intake.what) || "موقعیت"), st: c.status === "done" || c.resolved ? "practised" : "open", refs: (c.knots || []).slice() } }); });
    newest(S.all("topic", function (t) { return !t.sample; }), 6).forEach(function (t) { outer.push({ d: "s_learn", it: { t: "topic", id: t.id, fa: t.title || "موضوع", st: "open" } }); });
    newest(S.all("achat", function (x) { return x.tour; }), 4).forEach(function (x) { outer.push({ d: null, it: { t: "tour", id: x.id, fa: "🧭 " + (x.title || "تور"), st: x.tour.masteredAt ? "practised" : x.tour.doneAt ? "working" : "open", refs: [].concat.apply([], x.tour.facets.map(function (f) { return (f.refs || []).map(function (r) { return r.id; }); })) } }); });
    var col = { open: "#94a3b8", working: "#f59e0b", practised: "#10b981", returned: "#ef4444", done: "#10b981", approved: "#10b981", pending: "#f59e0b" };
    var P = {};
    outer.forEach(function (o, i) { var a = -Math.PI / 2 + 2 * Math.PI * i / Math.max(1, outer.length); P[o.it.id] = [cx + R2 * Math.cos(a), cy + R2 * Math.sin(a)]; });
    outer.forEach(function (o) { var p = P[o.it.id]; if (o.d && pos[o.d]) s.appendChild(el("line", { x1: pos[o.d][0], y1: pos[o.d][1], x2: p[0], y2: p[1], stroke: "#e2e8f0" })); (o.it.refs || []).forEach(function (rid) { var q = P[rid]; if (q) s.appendChild(el("line", { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: "#a78bfa", "stroke-dasharray": "3 2" })); }); });
    dims.forEach(function (d) { s.appendChild(el("line", { x1: cx, y1: cy, x2: pos[d.id][0], y2: pos[d.id][1], stroke: "#99c" })); });
    s.appendChild(el("circle", { cx: cx, cy: cy, r: 22, fill: "#0f766e" })); s.appendChild(txt(cx, cy + 4, "تو", { fill: "#fff", "font-size": 12 }));
    dims.forEach(function (d) { var p = pos[d.id], E = d.est || { n: 0 }; s.appendChild(el("circle", { cx: p[0], cy: p[1], r: 14, fill: E.n ? "#99f6e4" : "#e2e8f0", stroke: "#0f766e" })); s.appendChild(txt(p[0], p[1] - 18, d.fa.split(/[،,]| و /)[0], { "font-size": 10 })); });
    outer.forEach(function (o) { var p = P[o.it.id]; s.appendChild(el(o.it.t === "tour" ? "rect" : "circle", o.it.t === "tour" ? { x: p[0] - 6, y: p[1] - 6, width: 12, height: 12, fill: col[o.it.st] || "#94a3b8" } : { cx: p[0], cy: p[1], r: 6, fill: col[o.it.st] || "#94a3b8" })); s.appendChild(txt(p[0], p[1] + 16, String(o.it.fa).slice(0, 20), { "font-size": 8 })); });
    return s;
  };
  /* ---------- «چهار مرحلهٔ حل» (پولیا): کدام مرحله برای تو ضعیف‌تر است — تورِ ۱، s14 D2 (۲۰۲۶-۱۰-۱۵) ----------
     هیچ رکوردِ تازه‌ای نیست؛ همه از دادهٔ موجود، هر رویداد دوتایی (موفق/ناموفق) و منسوب به یک مرحله:
       • «پرسشِ همین لحظه» و پاسخ‌های معلمِ حل (tut.und/plan/exec/back روی هر میزبان: مسئله، موقعیتِ گره‌گشا، پاپوس، سشنِ دستیار) با خودداوریِ
         «کمک کرد؟» (۰/۱/۲): موفق فقط «بله» (۲) — همان معیارِ نردبانِ درونی‌سازی (qRung)؛
       • شبیه‌ساز: درستیِ «بار اول» ِ هر گام (pg.lv[سطح][گام].first) با مرحلهٔ همان گام (A.stagePhase)؛
       • کارتِ فهم (شبیه‌ساز و مسئلهٔ زنده، با نسخه‌های پیشین): خودسنجیِ ۰/۱/۲ در برابرِ صورت — موفق = ۲؛
       • گام‌های واقعیِ مسئلهٔ زنده (اجرا): «انجامش دادی؟» — موفق = «کامل»؛ بسته‌شدنِ خودکار (بی پاسخ) شمرده نمی‌شود؛
       • بازنگری (شبیه‌ساز و زنده): انجام شد و نتیجه وارسی شد = موفق؛ «بعداً» (skipped) یا «نتوانستم وارسی کنم» = ناموفق.
     برآورد = (k+1)/(n+2) (A3 + A4 «هیچ نسبتی مرجح نیست»)؛ «احتمالِ ضعیف‌ترین بودن» = P(p_این < p_سه‌تای دیگر) از پسین‌های بتا — بی آستانه؛
     بی‌داده هر چهار ½ و ¼ (نمی‌دانیم). خروجی برای تور/دستیار: A.MIND.phases(). */
  var PH4 = [["und", "u", "فهمِ مسئله"], ["plan", "p", "طرح‌ریزی"], ["exec", "c", "اجرای طرح"], ["back", "b", "بازنگری"]];
  var PH_SRC = { ask: "پرسشِ همین لحظه / معلمِ حل (خودداوریِ «کمک کرد؟»)", sim: "شبیه‌ساز (درستیِ بار اولِ گام)", ucard: "کارتِ فهم (خودسنجی در برابرِ صورت)", live: "گام‌های واقعیِ مسئلهٔ زنده", lb: "بازنگری انجام و وارسی شد",
    chat: "گیر یا «حل نشد» ِ خودت در گفت‌وگو با مربی", knot: "گره‌ای که هنگامِ حل در غربال پیدا شد",
    chatok: "پاسخ، گذر از مرحله یا «حل شد» ِ سنجیده در گفت‌وگو با مربی", lplan: "طرحِ ثبت‌شده، مسئلهٔ کمکی و دادهٔ به‌کاررفته در مسئلهٔ زنده" };
  var NO_DATA = "هنوز داده‌ای نیست";
  M.NO_DATA = NO_DATA;
  M.PHASES = PH4.map(function (x) { return { id: x[0], ph: x[1], fa: x[2] }; });
  /* تورِ پولیا (INF17، دورِ ۱۹b): هر سطر «از کجا؟» دارد — فهرستِ کارهایی که آن را جابه‌جا کردند (منبع، تاریخ، +/−، مسئله برای «📜 پرونده»)، هر کار یک بار
     (همان جا که شمرده می‌شود ثبت می‌شود ⇒ شمارِ فهرست = n و جمعِ + = k)؛ کارِ پس‌گرفته (اصلاحِ پیامِ منبع، wd) نه شمرده می‌شود نه فهرست. opt.pid ⇒ فقط کارهای همان مسئله. */
  /* تورِ پولیا (RO7، دورِ ۲۰ — B·D9): «withdrawn» در پروندهٔ تمرین (a41) فهرستِ پس‌گرفتنِ «تثبیت شد» است، نه پس‌گرفتنِ خودِ رکورد — آرایه (حتی تهی) هرگز
     «پس‌گرفته» نیست؛ فقط true/رشته/شیءِ تکی (و wd/retracted) */
  function wdFlag(v) { return v === true || (typeof v === "string" && !!v.trim()) || (!!v && typeof v === "object" && !Array.isArray(v)); }
  function wdOut(o) { return !!(o && (wdFlag(o.wd) || wdFlag(o.retracted) || wdFlag(o.withdrawn))); }
  M.wdOut = wdOut;
  M.phases = function (opt) {
    var fpid = opt && opt.pid ? String(opt.pid) : "";
    var R = {}; PH4.forEach(function (x) { R[x[0]] = { id: x[0], ph: x[1], fa: x[2], k: 0, n: 0, src: {}, acts: [] }; });
    var byPh = { u: "und", p: "plan", c: "exec", b: "back" };
    function add(tk, src, ok, act) { var X = R[tk]; if (!X) return; act = act || {}; if (fpid && String(act.pid || "") !== fpid) return;
      X.n++; if (ok) X.k++; var s = X.src[src] = X.src[src] || { k: 0, n: 0 }; s.n++; if (ok) s.k++;
      X.acts.push({ id: act.id || (src + ":" + X.acts.length), src: src, ok: !!ok, at: act.at || "", fa: act.fa || PH_SRC[src] || src, pid: act.pid || "", sess: act.sess || "", ref: act.ref || "", cause: act.cause || "", causeWhy: act.causeWhy || "" }); }
    /* دورِ ۲۲ (P1، §۱۵ ِ نقشهٔ راه): هر گیر علت دارد — پیش‌نیاز / گره / مهارت — با شاهدش. گیری که علتش پیش‌نیازِ تشخیص‌داده‌شده است (a44: e.cause = "prereq")
       هرگز مرحله را پایین نمی‌آورد و «ضعیف‌ترین» نمی‌سازد؛ جدا فهرست می‌شود. «مهارت» فقط با شاهد: پیش‌نیاز آزموده شد و بود (causeWhy)، یا مربی در حرفش پیش‌نیازی ندید. */
    var CZ = { prereq: [], knot: [], skill: [], unk: [] };
    /* تورِ پولیا دورِ ۲ (R7): بازگفتِ دستیار (e.by = assistant، متنی که در پیام‌های خودِ کاربر نیست) شاهدِ موفقیتِ او نیست */
    function tutOf(T, c) { if (!T) return; c = c || {}; PH4.forEach(function (x) { (T[x[0]] || []).forEach(function (e, j) { if (!e || e.skip || e.k === "motive" || (e.self !== 0 && e.self !== 1 && e.self !== 2)) return; if (e.by === "assistant" && e.self === 2) return;
      add(x[0], "ask", e.self === 2, { id: "tut:" + (c.id || "") + ":" + x[0] + ":" + j, at: e.at || "", pid: c.pid || "", fa: "پرسشِ همین لحظه" + (e.q ? " «" + String(e.q).slice(0, 50) + "»" : "") + (c.title ? " — «" + String(c.title).slice(0, 40) + "»" : "") }); }); }); }
    function pTitle(pid) { try { var r = A.liveRec ? A.liveRec(pid) : null, p = r && r.p ? r.p : A.getProb ? A.getProb(pid) : null; return (p && (p.title || (p.p && p.p.title))) || ""; } catch (e) { return ""; } }
    S.all("eprog").forEach(function (pg) { var pid0 = String(pg.id).replace(/^eprog_/, ""); tutOf(pg.tut, { id: pg.id, pid: pid0, title: pTitle(pid0) }); });
    /* RN2e: شناسهٔ کارهای زنده‌ای که پیامدشان در همین جدول شمرده می‌شود (گامِ بسته با پیامد) */
    var liveActs = {}, seenAct = {};
    S.all("eprog").forEach(function (pg) { var pid0 = String(pg.id).replace(/^eprog_/, ""); (((pg.solve || {}).live || {}).steps || []).forEach(function (st) { var o = st && st.out; if (o && !o.auto && o.done && !wdOut(o)) liveActs["lstep:" + pid0 + ":" + st.id] = 1; }); });
    S.all("kcase", function (c) { return !c.sample; }).forEach(function (c) { tutOf(c.tut, { id: c.id, title: c.title }); });
    S.all("pr").forEach(function (r) { tutOf(r.data && r.data.tut, { id: r.id }); });
    S.all("achat").forEach(function (s) { tutOf(s.tut, { id: s.id, title: s.title });
      /* مربیِ گفت‌وگو (a27): گیر/«حل نشد» ِ خودِ کاربر و گره‌ای که در میانهٔ حل پیدا شد ⇒ ناموفق در همان مرحله */
      /* تورِ پولیا (RM1a): موفقیتِ سنجیدهٔ گفت‌وگو (src «chatok»، ok:true) هم — هر کدام یک رویداد */
      /* تورِ پولیا (RN3c): رویدادِ «در انتظارِ» الگو (pend، بی گزارشِ مدل) شمرده نمی‌شود؛ (RN2e) هر کار یک بار — رویدادی که شناسه‌اش (act) همان گامِ ثبت‌شدهٔ
         مسئلهٔ زنده است کنار می‌رود (پیامد همان‌جا شمرده می‌شود)، و دو رویدادِ گفت‌وگو با یک شناسه و یک مرحله یکی‌اند */
      (s.coachEv || []).forEach(function (e) { if (!e || !byPh[e.ph] || !(e.src === "chat" || e.src === "knot" || e.src === "chatok") || e.pend || e.wd) return;
        if (e.act) { if (liveActs[e.act]) return; var ak = e.act + "|" + e.ph + "|" + (e.ok ? 1 : 0); if (seenAct[ak]) return; seenAct[ak] = 1; }
        /* تورِ پولیا (R3g، دورِ ۲۱، B·D9/D·11): کلیدِ کارِ دوباره‌ثبت‌شده «…|rebook:u6» است — «از کجا؟» نقلِ حرفِ خودش را نشان می‌دهد، نه شناسهٔ خام */
        var kp = String(e.key || "").split("|").filter(function (x) { return x && !/^rebook:|^sc$/.test(x); }), q0 = e.rebook && e.src20 && e.src20.span ? String(e.src20.span) : (kp.pop() || ""), how = { selfcorr: "خودش حرفِ پیشینش را اصلاح کرد (بازنگری)", plan_done: "برنامه‌اش را انجام داد", solved: "«حل شد» در گفت‌وگو", own: "بازگوییِ خودش", res: "نتیجه‌ای که گفت", lesson: "درسی که گفت", plan: "طرحی که گفت", ans: "پاسخ به پرسشِ مرحله", pass: "گذر از مرحله" }[e.how] || "";
        if (!e.ok && e.cause === "prereq") { if (!fpid || String(e.prePid || e.pid || "") === fpid) CZ.prereq.push({ id: "ev:" + s.id + ":" + (e.msg || "") + ":" + e.key, ph: byPh[e.ph], at: e.at, concept: e.preC || "", step: e.preStep || "", quote: e.preQ || "", pid: e.prePid || e.pid || "", sess: s.id, rec: e.preRec || "" }); return; }
        var cz22 = e.ok ? "" : e.src === "knot" ? "knot" : (e.cause === "knot" || e.cause === "skill" ? e.cause : "unk"), czw22 = e.ok ? "" : e.src === "knot" ? "گره‌ای که هنگامِ حل در غربال پیدا شد" : (e.causeWhy || "علت هنوز روشن نیست — پیش‌نیازِ کم‌شده‌ای دیده نشد و گره یا مهارت با شاهد گزارش نشد");
        if (cz22 && (!fpid || String(e.pid || "") === fpid)) CZ[cz22].push({ ph: byPh[e.ph], at: e.at, why: czw22, pid: e.pid || "", sess: s.id });
        add(byPh[e.ph], e.src, !!e.ok, { cause: cz22, causeWhy: czw22, id: e.act || ("ev:" + s.id + ":" + (e.msg || "") + ":" + e.key), at: e.at, pid: e.pid || (/^l:/.test(String(e.pk || "")) ? String(e.pk).slice(2) : "") || (/^lstep:([^:]+):/.exec(String(e.act || "")) || [])[1] || "", sess: s.id, ref: e.msg || "",
          fa: (how || PH_SRC[e.src] || e.src) + (e.src === "knot" ? " " + q0.split(":")[0] : q0 ? " — «" + q0.slice(0, 50) + "»" : "") }); }); });
    S.all("eprog").forEach(function (pg) {
      var pid = String(pg.id).replace(/^eprog_/, ""), p = A.getProb ? A.getProb(pid) : null, sv = pg.solve || {};
      if (p && Array.isArray(p.stages) && A.stagePhase) Object.keys(pg.lv || {}).forEach(function (lv) {
        var L = pg.lv[lv] || {};
        Object.keys(L).forEach(function (sid) { var e = L[sid], s0 = p.stages.filter(function (x) { return x && x.id === sid; })[0]; if (!s0 || !e || typeof e.first !== "boolean") return; add(byPh[A.stagePhase(p, s0)] || "plan", "sim", e.first, { id: "sim:" + pid + ":" + lv + ":" + sid, at: e.at || "", pid: pid, fa: "شبیه‌ساز — «" + String(p.title || "").slice(0, 40) + "»، گامِ " + sid }); });
      });
      var us = []; Object.keys(sv.u || {}).forEach(function (lv) { if (sv.u[lv]) us.push(sv.u[lv]); }); us = us.concat((sv.live && sv.live.uHist) || []);
      var tt0 = pTitle(pid);
      us.forEach(function (u, j) { if (u && u.done && (u.self === 0 || u.self === 1 || u.self === 2)) add("und", "ucard", u.self === 2, { id: "uc:" + pid + ":" + j + ":" + (u.at || ""), at: u.at || u.doneAt || "", pid: pid, fa: "کارتِ فهم — «" + String(tt0).slice(0, 40) + "»" }); });
      /* تورِ پولیا دورِ ۳ (A12/R7، s04): گامی که انجام شد ولی به حل نزدیک نکرد («پیشرفت: نه») شکستِ اجراست، نه موفقیت — موفق = کامل انجام شد و
         دست‌کم کمی پیش برد (پیش‌بینیِ نادرست به‌تنهایی داده است، نه شکست: «غافلگیر شدی — این داده است»). گامِ برهانی «پیشرفت» ندارد و همان رفتارِ پیشین را دارد. */
      ((sv.live && sv.live.steps) || []).forEach(function (st) { var o = st && st.out; if (!o || o.auto || !o.done || wdOut(o)) return; add("exec", "live", o.done === "yes" && o.prog !== "نه", { id: "lstep:" + pid + ":" + st.id, at: o.at || "", pid: pid, ref: st.id,
        fa: "گامِ «" + String(st.text || "").slice(0, 50) + "»" + (o.what ? " — «" + String(o.what).slice(0, 40) + "»" : "") + (o.from === "chat" ? " (از گفت‌وگو)" : "") + (tt0 ? " · «" + String(tt0).slice(0, 30) + "»" : "") }); });
      /* بازنگری‌ای که دستیار از گفت‌وگو ثبت کرد (chat_solved) فقط وقتی شمرده می‌شود که درسش به قلمِ خودِ کاربر باشد (b.own) — R7 */
      /* تورِ پولیا (RM1a): وارسیِ سنجیده از پیام‌های خودِ کاربر (chkBy: msgs) هم بازنگریِ اوست، حتی اگر درس را دستیار نوشت */
      Object.keys(sv.b || {}).forEach(function (lv) { var b = sv.b[lv]; if (!b) return; if (b.from === "chat" && !b.own && b.chkBy !== "msgs") return; if (b.superseded && b.verdict === "unverified" && b.chkBy === "superseded") return;   /* دورِ ۲۲ (P8، B·D21، بانکِ R22 #179): حکمی که با اصلاحِ داده کنار رفت دیگر «بازنگری — نتیجه سالم ماند» ِ موفق نیست (تا دوباره وارسی شود) */ var la = { id: "lb:" + pid + ":" + lv, at: b.at || b.doneAt || "", pid: pid, fa: "بازنگری" + (b.chkRes ? " — " + String(b.chkRes).slice(0, 40) : "") + (tt0 ? " · «" + String(tt0).slice(0, 30) + "»" : "") }; if (b.skipped) add("back", "lb", false, la); else if (b.done) add("back", "lb", b.chkRes !== "نتوانستم وارسی کنم", la); });
      /* تورِ پولیا (RM1b): تونلِ زنده هم شاهدِ طرح است — هر طرحِ ثبت‌شده (کنونی و پیشین‌ها) یک موفقیت؛ مسئلهٔ کمکی که پلش زده شد موفقیت و آن‌که به کار
         نیامد شکست؛ داده‌ای که تا آن گام بی‌کار بود و در گامی به کار رفت (برد «datum») موفقیت. هیچ وزنی نیست؛ همان رکوردهای a38. */
      var L18 = sv.live || {};
      var lp = function (k, x, f) { return { id: "lplan:" + pid + ":" + k + ":" + ((x && x.at) || ""), at: (x && x.at) || "", pid: pid, fa: f + (tt0 ? " · «" + String(tt0).slice(0, 30) + "»" : "") }; };
      if (L18.plan && L18.plan.at) add("plan", "lplan", true, lp("plan", L18.plan, "طرحِ ثبت‌شده"));
      (L18.planHist || []).forEach(function (x, j) { if (x && x.at) add("plan", "lplan", true, lp("ph" + j, x, "طرحِ پیشین")); });
      (L18.aux || []).forEach(function (x, j) { if (!x) return; if (x.crossed) add("plan", "lplan", true, lp("aux" + j, x, "مسئلهٔ کمکی که پلش زده شد")); else if (x.unused) add("plan", "lplan", false, lp("aux" + j, x, "مسئلهٔ کمکی که به کار نیامد")); });
      (L18.wins || []).forEach(function (x, j) { if (x && x.kind === "datum") add("plan", "lplan", true, lp("win" + j, x, "داده‌ای که به کار رفت")); });
    });
    var P = A.PSY, G = 241, rows0 = PH4.map(function (x) { return R[x[0]]; });
    rows0.forEach(function (X) { X.p = (X.k + 1) / (X.n + 2); X.none = !X.n; X.pWeak = 0; });
    /* تورِ پولیا (RM1c): مرحلهٔ بی رویداد «هنوز داده‌ای نیست» است و هرگز در رتبه‌بندی نمی‌آید (پیشینِ ½ اش با دیگران سنجیده نمی‌شود)؛ «ضعیف‌ترین» فقط
       میانِ دست‌کم دو مرحلهٔ دارای داده */
    var rows = rows0.filter(function (X) { return X.n > 0; });
    /* P(این مرحله کمترین احتمالِ موفقیت را دارد) = ∫ f_X(x) Π_{Y≠X} P(p_Y > x) dx — روی شبکه، از همان چگالیِ پسینِ a34 */
    if (P && P.density) {
      var D = rows.map(function (X) { var d = P.density(X.k, X.n, G), s = 0; d.forEach(function (q) { s += q[1]; }); var c = 0; return d.map(function (q) { var w = s ? q[1] / s : 1 / G; c += w; return { w: w, cdf: c }; }); });
      rows.forEach(function (X, i) { var t = 0; for (var g = 0; g < G; g++) { var pr = D[i][g].w; rows.forEach(function (Y, j) { if (j !== i) pr *= 1 - (D[j][g].cdf - D[j][g].w / 2); }); t += pr; } X.pWeak = t; });
      var tot = rows.reduce(function (a, X) { return a + X.pWeak; }, 0); rows.forEach(function (X) { X.pWeak = tot ? X.pWeak / tot : 0.25; });
    } else rows.forEach(function (X) { X.pWeak = rows.length ? 1 / rows.length : 0; });
    var n = rows.reduce(function (a, X) { return a + X.n; }, 0);
    /* تورِ پولیا (RN3a، C·X4): «ضعیف‌ترین» فقط وقتی دادهٔ دیده‌شده تمایز می‌دهد — آن مرحله دست‌کم یک شکست دارد و نسبتِ موفقیتِ دیده‌شده‌اش (k/n) از هر مرحلهٔ
       دیگرِ دارای داده **اکیداً** کمتر است؛ برابری، نبودِ شکست، ترتیبِ جدول یا پیشینِ ½ هرگز نام نمی‌دهد (weakestR18 = قاعدهٔ پیشین، قرنطینه) */
    var weak = M.weakestOf(rows);
    /* پیش‌نیازِ نبوده که بعد آموخته شد = پیشرفت (نه ضعف) — از «🧩 نقشهٔ پیش‌نیازها» ِ همان مسئله؛ نقشِ «مربیِ یادگیرنده» هم شمرده می‌شود (یادگیریِ خودِ اوست) */
    var PL = { learned: [], open: [] };
    S.all("prereq").forEach(function (pq) { if (fpid && String(pq.pid || "") !== fpid) return; (pq.items || []).forEach(function (x) { if (!x || !x.eid) return;
      var o = { concept: x.concept, step: x.step || "", at: x.learned || x.at || "", pid: pq.pid || "", rec: pq.id, title: pq.title || "", mastery: x.mastery || "" };
      if (x.state === "learned") PL.learned.push(o); else if (x.state === "diag" || x.state === "teach") PL.open.push(o); }); });
    return { at: new Date().toISOString(), n: n, rows: rows0, ranked: rows.length, weakest: weak ? { id: weak.id, fa: weak.fa, p: weak.pWeak } : null, distinct: !!weak, src: PH_SRC, causes: CZ, prereq: PL };
  };
  M.weakestOf = function (rows) {
    if (!rows || rows.length < 2) return null;
    var r = function (X) { return X.k / X.n; }, lo = rows.slice().sort(function (a, b) { return r(a) - r(b); }), w = lo[0];
    if (w.n - w.k < 1) return null;   // بی شکست ⇒ تمایزی نیست
    if (rows.some(function (X) { return X !== w && r(X) <= r(w); })) return null;   // برابری ⇒ نامی نیست
    return w;
  };
  /* قرنطینه (RN3a — REMOVAL_CANDIDATES): بیشترین «احتمالِ ضعیف‌ترین بودن» میانِ دست‌کم دو مرحلهٔ دارای داده — بی شکست یا با برابری هم نام می‌برد (ترتیبِ جدول) */
  M.weakestR18 = function (rows) { return rows && rows.length >= 2 ? rows.slice().sort(function (a, b) { return b.pWeak - a.pWeak; })[0] : null; };
  M.NO_DISTINCT = "هنوز تمایزی دیده نشده";
  M.phasesText = function (Q) {
    Q = Q || M.phases(); var pc = function (p) { return Math.round(100 * p) + "%"; };
    return "چهار مرحلهٔ حل (پولیا؛ (k+1)/(n+2)، بی آستانه): " + Q.rows.map(function (X) { return X.none ? X.fa + " — " + NO_DATA : X.fa + " " + pc(X.p) + " (" + X.k + "/" + X.n + (Q.weakest ? "، احتمالِ ضعیف‌ترین بودن " + pc(X.pWeak) : "") + ")"; }).join(" · ") +
      (Q.n ? (Q.weakest ? " — تنها مرحله‌ای که شکست دارد و از همه پایین‌تر است: " + Q.weakest.fa : Q.ranked >= 2 ? " — " + M.NO_DISTINCT : "") : " — هنوز هیچ داده‌ای نیست؛ هر چهار «نمی‌دانیم» است.") +
      ((Q.causes && Q.causes.prereq.length) ? " · گیرهایی که علتشان پیش‌نیاز بود (در مرحله‌ها شمرده نشدند): " + Q.causes.prereq.length : "") +
      ((Q.prereq && Q.prereq.learned.length) ? " · پیش‌نیازهای آموخته (پیشرفت): " + Q.prereq.learned.map(function (x) { return "«" + x.concept + "»"; }).join("، ") : "");
  };
  /* دورِ ۲۲ (P1): «علتِ هر گیر» و «پیش‌نیازهای آموخته» — زیرِ جدولِ چهار مرحله */
  function causesSection(Q) {
    var C = Q.causes || { prereq: [], knot: [], skill: [] }, P = Q.prereq || { learned: [], open: [] };
    C.unk = C.unk || []; if (!C.prereq.length && !C.knot.length && !C.skill.length && !C.unk.length && !P.learned.length && !P.open.length) return null;
    var PHF = {}; PH4.forEach(function (x) { PHF[x[0]] = x[2]; });
    return h("div", { class: "mind-causes small", dir: "rtl" },
      h("p", {}, h("strong", {}, "علتِ هر گیر: "), "پیش‌نیاز " + fa(C.prereq.length) + " · گره " + fa(C.knot.length) + " · مهارت " + fa(C.skill.length) + (C.unk.length ? " · هنوز نامعلوم " + fa(C.unk.length) : "") + " — گیری که علتش پیش‌نیاز بود ضعفِ مرحله نیست و در جدول شمرده نمی‌شود."),
      C.prereq.length ? h("ul", { class: "mind-cz-pre" }, C.prereq.map(function (x) { return h("li", { "data-cause": "prereq" }, "گیر در «" + (PHF[x.ph] || "") + "» — علت: نبودِ «" + x.concept + "»" + (x.step ? " در گامِ «" + String(x.step).slice(0, 50) + "»" : "") + (x.quote ? " · شاهد: «" + String(x.quote).slice(0, 70) + "»" : "")); })) : null,
      C.skill.length || C.knot.length || C.unk.length ? h("details", {}, h("summary", {}, "گیرهای گره/مهارت/نامعلوم (" + fa(C.knot.length + C.skill.length + C.unk.length) + ")"), h("ul", {}, C.knot.concat(C.skill, C.unk).map(function (x) { return h("li", { "data-cause": C.knot.indexOf(x) >= 0 ? "knot" : C.skill.indexOf(x) >= 0 ? "skill" : "unk" }, "«" + (PHF[x.ph] || "") + "» — " + x.why); }))) : null,
      P.learned.length ? h("p", { class: "mind-prelearn" }, h("strong", {}, "پیش‌نیازهای آموخته (پیشرفت، نه ضعف): "), P.learned.map(function (x) { return "«" + x.concept + "»" + (x.at ? " (" + A.fdate(String(x.at).slice(0, 10)) + ")" : ""); }).join("، ")) : null,
      P.open.length ? h("p", { class: "muted" }, "در حالِ یاد گرفتن: " + P.open.map(function (x) { return "«" + x.concept + "»"; }).join("، ")) : null);
  }
  M.causesSection = causesSection;
  function phasesSection() {
    var Q = M.phases(), pf = function (p) { return A.PSY && A.PSY.pctFa ? A.PSY.pctFa(p) : fa(Math.round(100 * p)) + "٪"; };
    return h("section", { class: "card mind-phases", dir: "rtl", "data-n": String(Q.n) }, h("h2", {}, "🧩 چهار مرحلهٔ حل"),
      h("p", { class: "small muted" }, "پولیا حل را چهار مرحله می‌داند: فهم، طرح، اجرا، بازنگری. این جدول از پاسخ‌ها و گام‌های خودت (پرسشِ همین لحظه، شبیه‌ساز، کارتِ فهم، مسئلهٔ زنده، بازنگری) می‌گوید در هر مرحله احتمالِ موفقیتِ نوبتِ بعد چقدر است و هر مرحله با چه احتمالی ضعیف‌ترینِ چهارتاست — بی برشِ «ضعیف/قوی»؛ با نمونهٔ کم، عددها نزدیکِ ½ و ¼ می‌مانند."),
      h("div", { class: "mind-scroll" }, h("table", { class: "mind-table small mind-phtable" },
        h("thead", {}, h("tr", {}, ["بخشِ حل (پولیا)", "احتمالِ موفقیتِ نوبتِ بعد", "موفق از کل", "احتمالِ ضعیف‌ترین بودن", "از کجا"].map(function (x) { return h("th", {}, x); }))),
        h("tbody", {}, Q.rows.map(function (X) {
          if (X.none) return h("tr", { "data-ph": X.id, "data-none": "1" }, h("td", {}, X.fa), h("td", { class: "mind-php" }, NO_DATA), h("td", {}, "—"), h("td", { class: "mind-phw" }, "—"), h("td", { class: "small" }, "— (" + NO_DATA + ")"));
          return h("tr", { "data-ph": X.id }, h("td", {}, X.fa), h("td", { class: "mind-php" }, pf(X.p) + " (" + fa(X.n) + ")"), h("td", {}, fa(X.k) + " از " + fa(X.n)), h("td", { class: "mind-phw" }, Q.weakest ? pf(X.pWeak) : "—"),
            h("td", { class: "small" }, Object.keys(X.src).length ? Object.keys(X.src).map(function (s) { return Q.src[s] + ": " + fa(X.src[s].k) + " از " + fa(X.src[s].n); }).join(" · ") : "— (هنوز رویدادی نیست)", fromList(X.acts, "ph:" + X.id)));
        })))),
      h("p", { class: "small muted mind-phweak" }, Q.weakest ? "بیشترین احتمالِ ضعیف‌ترین بودن: «" + Q.weakest.fa + "» (" + pf(Q.weakest.p) + ") از " + fa(Q.n) + " رویداد، فقط میانِ مرحله‌هایی که داده دارند. این احتمال است، نه برچسب؛ با هر پاسخ و گامِ تازه جابه‌جا می‌شود."
        : Q.n && Q.ranked >= 2 ? M.NO_DISTINCT + " (" + fa(Q.n) + " رویداد) — هیچ مرحله‌ای شکستی ندارد یا مرحله‌ها برابرند؛ «ضعیف‌ترین» فقط وقتی نام برده می‌شود که مرحله‌ای شکست دارد و از همهٔ مرحله‌های دیگر به‌روشنی پایین‌تر است."
        : Q.n ? "فقط یک مرحله داده دارد (" + fa(Q.n) + " رویداد) — هیچ مرحله‌ای «ضعیف‌ترین» نامیده نمی‌شود؛ مرحله‌های بی‌داده با پیشینِ ½ سنجیده نمی‌شوند." : "هنوز هیچ رویدادِ سنجیده‌ای نیست — هیچ مرحله‌ای رتبه نمی‌گیرد (نمی‌دانیم)."),
      causesSection(Q),
      /* تورِ پولیا (RM1e): رادارِ سازه‌ها نگاشتی از مرحله‌های حل ندارد — همین را صادقانه می‌گوییم، نگاشتِ ساختگی نمی‌سازیم */
      h("p", { class: "small muted mind-phradar" }, PH_RADAR));
  }
  M.phasesSection = phasesSection;
  /* INF17: فهرستِ «از کجا؟» — هر کار یک سطر: تاریخ · منبع · +/− · «📜» به پروندهٔ همان مسئله (اگر نمای پرونده هست) */
  function fromList(acts, tag) {
    acts = (acts || []).slice().sort(function (a, b) { return String(b.at || "").localeCompare(String(a.at || "")); });
    if (!acts.length) return null;
    var pos = acts.filter(function (a) { return a.ok; }).length;
    return h("details", { class: "mind-from", "data-row": tag, "data-n": String(acts.length), "data-plus": String(pos) }, h("summary", {}, "از کجا؟ (" + fa(acts.length) + " کار: +" + fa(pos) + " −" + fa(acts.length - pos) + ")"),
      h("ol", { class: "small mind-from-list" }, acts.map(function (a) {
        var dv = !!(a.pid && A.V && A.V.dossier);
        return h("li", { class: "mind-act", "data-act": a.id, "data-ok": a.ok ? "1" : "0", "data-pid": a.pid || "" }, h("span", { class: a.ok ? "good" : "warnline" }, a.ok ? "+ " : "− "),
          (a.at ? A.fdate(day(a.at)) + " · " : "") + a.fa,
          dv ? h("button", { class: "linkish mind-act-go", type: "button", title: "پروندهٔ کاملِ همین مسئله", onclick: function () { A.go("dossier", a.pid, a.ref || null); } }, " 📜") : null);
      })));
  }
  M.fromList = fromList;
  M.dimActs = function (d) { var seen = {}, out = [];
    (d.ans || []).concat(d.cal || []).forEach(function (a, i) { var sc = a.src || {}, id = (sc.id || ("x" + i)) + "|" + (a.at || ""); if (seen[id]) return; seen[id] = 1;
      out.push({ id: sc.id || ("x" + i), ok: !!a.ok, at: a.at || "", fa: sc.fa || "پاسخ", pid: sc.pid || "" }); });
    return out; };
  var PH_RADAR = "این جدول روی «نیم‌رخِ سازه‌ها» (رادار) نمی‌نشیند: کارنامه هیچ نگاشتی از مرحله‌های حلِ پولیا به سازه‌های رادار (استدلالِ سیال، دانش، …) ندارد و نمی‌سازد؛ رادار فقط از پاسخ‌های پاسخ‌دقیق (مسئله‌های هم‌ساختار، ورزشِ گره، اطمینانِ پیش از جواب) پر می‌شود. حل و برهانِ وارسی‌شدهٔ مسئلهٔ زنده‌ات این‌جا، در همین جدول، ثبت است.";
  M.PH_RADAR = PH_RADAR;

  /* ---------- 🏋 کارِ تکنیک‌ها (تورِ پولیا دورِ ۱۹c، LT4؛ DECISIONS_R19c) ----------
     کارنامه کارِ تکنیک‌ها را می‌خواند: پرونده‌های تمرین (`practice` از a41: {id, type, tech, subject, sessions:[{at, done, outcome, score, measured}], state}) و
     نشست‌هایشان، نمرهٔ روبریکِ برگه‌ها (خودسنجی، نه اندازه)، جدول‌های کالیبراسیونِ برگه‌ها (T24/T32/T33 و هر برگه‌ای با فیلدِ calib)، درصدِ بازیابیِ
     چرخهٔ ۱-۳-۷ (P3) و برگهٔ سفیدِ هفتگی (P4). هر نشست یک بار (شناسهٔ کار، RN2e)؛ تکرارِ همان روز یک سطر؛ کارِ پس‌گرفته/پیش‌نویس/در انتظارِ داوری
     شمرده نمی‌شود؛ رکوردِ نمونه/آزمون/تور هرگز. هر سطر در «از کجا؟» (INF17) تاریخ و منبع دارد و رکوردش را باز می‌کند.
     نگاشت به بُعدها فقط آن‌جا که کارنامه همان منبع را از پیش می‌نگارد (پروندهٔ سنجش ⇒ «داوریِ معرفتی»، دفترِ پیش‌بینی ⇒ بُعدِ خودش)؛ بقیه «بی‌نگاشت» —
     نگاشتِ ساختگیِ تکنیک ⇒ بُعد ساخته نمی‌شود، و این کارها به عددهای بُعدها هم افزوده نمی‌شوند. نمرهٔ منتقدِ هوش مصنوعی و نتیجهٔ کسی که به او یاد دادی
     هرگز اندازهٔ خودِ تو نیست. */
  var UNMAPPED = "بی‌نگاشت";
  M.UNMAPPED = UNMAPPED;
  function realRec(r) { return !!r && !(r.sample || r.test || r.tour || r.tourRun || r.sim || r.simulated || r.fixture || r.demo || r.seed || r.tourTest || r.runner); }
  M.realRec = realRec;
  function wdx(x) { return wdOut(x); }   // RO7: همان قاعدهٔ wdOut (آرایهٔ withdrawn ِ پرونده پس‌گرفتن نیست)
  function nq(s) { return String(s || "").replace(/[\s‌]+/g, " ").trim().toLowerCase(); }
  function byAt(a, b) { return String(a.at || "").localeCompare(String(b.at || "")); }
  function tFa(tid) { return tid ? "T" + String(tid) : "تکنیک"; }
  function pct01(x, of) { var v = parseFloat(x); if (isNaN(v)) return null; of = parseFloat(of); if (!isNaN(of) && of > 0) return 100 * v / of; return v > 0 && v <= 1 ? 100 * v : v; }
  var FAIL_RE = /شکست|ناموفق|نتوانستم|یادم نیامد|خراب شد|\bfail/i;
  var ASSIST_RE = /^(assistant|assist|دستیار)$/;
  function viaAssist(r) { return [r.by, r.via, r.from, r.origin, r.startedBy, typeof r.src === "string" ? r.src : ""].some(function (x) { return ASSIST_RE.test(String(x || "")); }); }
  function otherPerson(s) { var w = s.learner || s.student || (s.of && s.of !== "self" && s.of !== "me" ? s.of : "") || (s.who && s.who !== "self" && s.who !== "me" ? s.who : ""); return w ? String(w) : ""; }
  function subjOf(sb) {
    if (!sb) return { fa: "" };
    if (typeof sb === "string") { var r0 = S.get(sb); return r0 ? { fa: r0.title || (r0.p && r0.p.title) || r0.name || sb, id: sb, kind: r0.type } : { fa: sb }; }
    var id = sb.id || sb.ref || "", rec = id ? S.get(id) : null;
    return { fa: sb.title || sb.fa || sb.text || sb.t || (rec && (rec.title || (rec.p && rec.p.title) || rec.name)) || "", id: id, kind: sb.kind || sb.k || (rec && rec.type) || "" };
  }
  /* اندازهٔ یک نشست: عدد ⇒ درصد (بازیابی و مانند آن)؛ {pred, actual} ⇒ پیش‌بینیِ یادگیری (JOL) در برابرِ واقعی؛ {pre, post, quiz} ⇒ پیش/پس از مطالعه
     در برابرِ آزمونک؛ {p, ok} ⇒ یک پیش‌بینیِ داوری‌شده. اندازه‌ای که هوش مصنوعی داده (by: ai) اندازهٔ تو نیست ⇒ نادیده. */
  function measOf(s) {
    var m = s.measured != null ? s.measured : s.meas; if (m == null || m === "") return null;
    if (s.measuredBy === "ai" || (m && typeof m === "object" && (m.by === "ai" || m.src === "ai"))) return null;
    if (typeof m !== "object") { var v = pct01(m); return v == null ? null : { kind: "pct", v: v }; }
    var at = m.resolvedAt || m.at || "";
    if (m.pred != null) { var pr = pct01(m.pred, m.of), ac = m.actual == null || m.actual === "" ? null : pct01(m.actual, m.of); return pr == null ? null : ac == null ? { kind: "pending" } : { kind: "jol", pred: pr, actual: ac, gap: pr - ac, at: at }; }
    if (m.quiz != null && (m.pre != null || m.post != null)) { var q = pct01(m.quiz); if (q == null) return null; var pre = pct01(m.pre), post = pct01(m.post); return { kind: "prepost", pre: pre, post: post, quiz: q, gap: post != null ? post - q : pre - q, at: at }; }
    if (m.p != null && (m.ok === true || m.ok === false || m.out === "درست" || m.out === "نادرست")) { var p = pct01(m.p); return p == null ? null : { kind: "cal", p: p / 100, ok: m.ok === true || m.out === "درست", at: at }; }
    var v2 = pct01(m.v != null ? m.v : m.pct != null ? m.pct : m.value, m.of); return v2 == null ? null : { kind: "pct", v: v2, at: at };
  }
  function pf0(v) { return fa(Math.round(v)) + "٪"; }
  function sgn(v) { v = Math.round(v); return (v > 0 ? "+" : v < 0 ? "−" : "±") + fa(Math.abs(v)); }
  M.techWork = function () {
    var rows = {}, order = [], LINK = {}, cal = [], calSeen = {}, gaps = [], pending = 0;
    var fcById = {}, fcByQ = {};
    var fcByRow = {};
    S.all("fcast", realRec).forEach(function (x) { fcById[x.id] = x; var q = nq(x.q); if (q) fcByQ[q] = x; if (x.src && x.src.ex != null && x.src.row != null) fcByRow[x.src.ex + "|" + x.src.row] = x; });
    function fcOf(o, text, exRow) { var id = o && (o.fcast || o.fcastId || o.fcId || (typeof o.fc === "string" ? o.fc : "")); if (id && fcById[id]) return fcById[id]; if (exRow && fcByRow[exRow]) return fcByRow[exRow]; var q = nq(text); return (q && fcByQ[q]) || null; }
    function row(key, o) { if (!rows[key]) { rows[key] = Object.assign({ key: key, acts: [], ev: [], fcs: {}, pending: 0 }, o); order.push(key); } return rows[key]; }
    /* یک سطر برای هر (ردیف، روز): نشستِ دیرترِ همان روز می‌ماند و تکرارها رویش شمرده می‌شوند (RN2e) */
    function push(R, a) {
      a.day = day(a.at); a.rep = a.rep || 1; a.row = R.key;
      var prev = R.acts.filter(function (x) { return x.day === a.day; })[0];
      if (prev) { if (String(a.at) >= String(prev.at)) { a.rep = prev.rep + 1; R.acts[R.acts.indexOf(prev)] = a; return a; } prev.rep++; return prev; }
      R.acts.push(a); return a;
    }
    function addCal(c, key) { if (calSeen[key]) return; calSeen[key] = 1; cal.push(c); }
    /* ۱) پرونده‌های تمرین */
    var P3S = {};   // نشستِ a41 که از اجرای P3/P4 آمده (src: "p3") ⇒ همان اجرا دوباره شمرده نمی‌شود
    S.all("practice", realRec).forEach(function (rec) {
      if (wdx(rec) || rec.kind === "list") return;
      var tid = rec.tech != null ? String(rec.tech).replace(/^t/i, "") : rec.tid != null ? String(rec.tid) : "", sb = subjOf(rec.subject || rec.subj), asst = viaAssist(rec);
      var link = sb.id && (sb.kind === "case") ? { kind: "case", id: sb.id } : null;
      var R = row("prac:" + rec.id, { tech: tid, subj: sb.fa, rid: rec.id, src: "practice", state: rec.state || "", link: link,
        go: A.V && A.V.practice ? ["practice", rec.id] : tid ? ["tech", +tid] : null,
        base: (asst ? "دستیار ← " : "") + "تمرینِ " + tFa(tid) + (sb.fa ? " «" + String(sb.fa).slice(0, 50) + "»" : "") });
      (rec.history || rec.hist || []).forEach(function (x) { var st = x && (x.state || x.to); if (x && (x.d || x.at) && st && x.ev !== "claim") R.ev.push({ at: x.d || x.at, state: st, why: x.why || x.note || "" }); });
      /* RO7 (دورِ ۲۰، قراردادِ a41): پس‌گرفتنِ «تثبیت شد» در stableOff[] {d, was, why} (رکوردهای کهنه: withdrawn ِ آرایه) — تاریخچهٔ ثبات، نه پس‌گرفتنِ رکورد */
      R.off = []; (Array.isArray(rec.stableOff) ? rec.stableOff : Array.isArray(rec.withdrawn) ? rec.withdrawn : []).forEach(function (w) { if (!w || !w.d) return;
        if (w.was && !R.ev.some(function (e) { return /^(stable|تثبیت)/.test(e.state) && day(e.at) === day(w.was); })) R.ev.push({ at: w.was, state: "stable", why: "" });
        R.off.push({ at: w.d, was: w.was || "", why: w.why || "" }); });
      (rec.sessions || []).map(function (s, j) { return { s: s, j: j }; }).filter(function (x) { return x.s && (x.s.d || x.s.at); }).sort(function (a, b) { return String(a.s.d || a.s.at).localeCompare(String(b.s.d || b.s.at)) || byAt(a.s, b.s); }).forEach(function (x) {
        var s = x.s, j = x.j;
        if (wdx(s) || s.draft || s.status === "draft" || !realRec(s)) return;
        var sid = "prac:" + rec.id + ":" + (s.id || j);
        [s.pr, s.src, s.ref, s.rec].concat(Array.isArray(s.ex) ? s.ex : [s.ex]).forEach(function (k) { if (typeof k === "string" && k) LINK[k] = R.key; });
        var who = otherPerson(s), mz = who ? null : measOf(s), parts = [], ok = null, at = s.resolvedAt || (mz && mz.at) || s.d || s.at;
        if (s.src === "p3" && mz && mz.kind === "pct") P3S[day(at) + "|" + Math.round(mz.v)] = 1;
        if (mz && mz.kind === "pending") { R.pending++; pending++; mz = null; }
        var M0 = s.meas || {}, out = String(s.outcome || M0.obs || "").trim(), did = String(s.done || s.what || "").trim();
        if (s.why && !(mz && mz.kind === "pct")) parts.push(String(s.why).slice(0, 100));
        if (who) { parts.push("یاد دادن به «" + who + "»" + (s.measured != null && s.measured !== "" ? " — نتیجهٔ او (" + (typeof s.measured === "object" ? JSON.stringify(s.measured) : fa(String(s.measured))) + ") مالِ خودِ اوست، نه مهارتِ تو" : "")); }
        if (did && did !== out) parts.push(did.slice(0, 80));
        if (out) parts.push("نتیجه: " + out.slice(0, 80));
        if (s.ok === true || s.ok === false) ok = s.ok; else if (out && FAIL_RE.test(out)) ok = false;
        var a = { id: sid, at: at, src: "practice", kind: who ? "teach" : "session", rid: rec.id, go: R.go, ok: ok, why: out || did };
        if (mz && mz.kind === "pct") { a.v = mz.v; parts.push("اندازه‌گیری‌شده: " + pf0(mz.v)); }
        if (mz && (mz.kind === "jol" || mz.kind === "prepost")) {
          var gtx = mz.kind === "jol" ? "پیش‌بینیِ یادگیری " + pf0(mz.pred) + " ← واقعی " + pf0(mz.actual)
            : "پیش از مطالعه " + (mz.pre != null ? pf0(mz.pre) : "—") + " · پس از آن " + (mz.post != null ? pf0(mz.post) : "—") + " ← آزمونک " + pf0(mz.quiz);
          gtx += ": " + (mz.gap > 0 ? "بیش‌اطمینانی " : mz.gap < 0 ? "کم‌اطمینانی " : "هم‌خوان ") + sgn(mz.gap) + " واحد";
          parts.push(gtx); a.gap = mz.gap;
        }
        if (mz && mz.kind === "cal") {
          var f = fcOf(s, s.q || s.st);
          if (f) { R.fcs[f.id] = f; parts.push("همان پیش‌بینیِ «" + String(f.q || "").slice(0, 40) + "» در دفترِ 🎯 — آن‌جا یک بار شمرده شد"); }
          else { a.cal = { p: mz.p, ok: mz.ok }; parts.push("پیش‌بینیِ " + pf0(100 * mz.p) + " — " + (mz.ok ? "درست" : "نادرست")); if (ok == null) ok = mz.ok; }
        }
        if (s.src === "card" && a.ok != null && a.cal == null) { a.ok = null; parts.push("نمرهٔ مرور را خودت دادی"); }
        var sc0 = s.score != null && s.score !== "" ? s.score : s.self; if (sc0 != null && sc0 !== "") parts.push("خودسنجی: " + fa(String(sc0)) + " (خودت دادی، اندازه نیست)");
        if (!parts.length) return;
        a.fa = R.base + " — " + parts.join(" · ");
        var kept = push(R, a);
        if (kept === a && a.cal) addCal({ id: sid, p: a.cal.p, ok: a.cal.ok, at: at, fa: a.fa, go: R.go, row: R.key }, R.key + "|" + a.day);
        if (kept === a && a.gap != null) gaps.push(a);
      });
    });
    /* ۲) برگه‌های کامل‌شدهٔ تکنیک (پیش‌نویس هرگز): روبریک = خودسنجی؛ ردیف‌های جدولِ کالیبراسیون = پیش‌بینیِ داوری‌شده (در انتظار ⇒ شمرده نمی‌شود) */
    S.all("ex", function (e) { return realRec(e) && e.status === "done" && !wdx(e); }).forEach(function (e) {
      var tid = String(e.tid), t = A.TM && A.TM[e.tid], tp = e.topic && S.get(e.topic), at = e.doneAt || e.updated || e.created; if (!at) return;
      var lk = LINK[e.id] || (e.prc && rows["prac:" + e.prc] ? "prac:" + e.prc : ""), R = lk ? rows[lk] : row("ex:" + tid + ":" + (e.topic || ""), { tech: tid, subj: tp ? tp.title : "", src: "ws", go: ["tech", +e.tid, "ws:" + e.id],
        base: "برگهٔ " + tFa(tid) + (t ? " «" + t.fa + "»" : "") + (tp ? " — " + String(tp.title).slice(0, 40) : "") });
      var cf = null; ((t && t.ws) || []).forEach(function (f) { if (f.t === "calib") cf = f; });
      var nOk = 0, nRes = 0, nPend = 0, nFc = 0;
      if (cf) ((e.data || {})[cf.src] || []).forEach(function (rw, i) {
        if (!rw) return; var txt = rw.st || rw.c || rw.q || rw.claim || "", p = parseFloat(rw[cf.conf]), o = rw[cf.out];
        if (isNaN(p) || (o !== "درست" && o !== "نادرست")) { if (String(txt).trim() || !isNaN(p)) nPend++; return; }
        var f = fcOf(rw, txt, e.id + "|" + i); if (f) { R.fcs[f.id] = f; nFc++; return; }
        var rat = rw.outAt || rw.at || at, key = nq(txt) ? "t|" + nq(txt) + "|" + day(rat) : "r|" + e.id + "|" + i;
        if (calSeen[key]) return;
        nRes++; if (o === "درست") nOk++;
        addCal({ id: "exrow:" + e.id + ":" + i, p: (p > 1 ? p / 100 : p), ok: o === "درست", at: rat, fc: tid === "24", go: ["tech", +e.tid, "ws:" + e.id], row: R.key,
          fa: tFa(tid) + " «" + String(txt).slice(0, 50) + "» (" + pf0(p > 1 ? p : 100 * p) + ") — " + o }, key);
      });
      R.pending += nPend; pending += nPend;
      if (lk) return;   // نشستِ همین برگه را پروندهٔ تمرین ثبت کرده ⇒ یک بار
      var rp = A.rubricPct ? A.rubricPct(e) : null, parts = [];
      if (rp != null) parts.push("روبریکِ خودسنجی " + pf0(rp) + " (خودت دادی، اندازه نیست)");
      if (nRes) parts.push(fa(nRes) + " پیش‌بینیِ داوری‌شده: " + fa(nOk) + " درست");
      if (nPend) parts.push(fa(nPend) + " در انتظارِ داوری (شمرده نشد)");
      if (nFc) parts.push(fa(nFc) + " همان پیش‌بینیِ دفترِ 🎯 (آن‌جا یک بار شمرده شد)");
      push(R, { id: "ex:" + e.id, at: at, src: "ws", kind: "session", go: ["tech", +e.tid, "ws:" + e.id], ok: null, fa: R.base + " — " + (parts.length ? parts.join(" · ") : "برگهٔ کامل‌شده") });
    });
    /* ۳) چرخهٔ ۱-۳-۷ (P3) و برگهٔ سفیدِ هفتگی (P4): درصدِ بازیابی = اندازه */
    S.all("pr", function (r) { return realRec(r) && !wdx(r) && (r.pid === "P3" || r.pid === "P4") && r.status === "done" && r.data && r.data.pct != null && r.data.pct !== ""; }).forEach(function (r) {
      if (LINK[r.id]) return;   // پروندهٔ تمرین همین نشست را دارد
      var v = parseFloat(r.data.pct); if (isNaN(v)) return;
      if (P3S[day(r.doneAt || r.created || r.updated) + "|" + Math.round(v)]) return;   // a41 همین اجرا را نشستِ T41 کرده
      var tp = r.topic && S.get(r.topic), subj = (tp && tp.title) || r.data.topic || "", sc = r.sched && S.get(r.sched), at = r.doneAt || r.created || r.updated;
      var R = row(r.pid + ":" + (r.topic || nq(subj)), { tech: "41", subj: subj, src: r.pid, go: ["proto", r.pid],
        base: (r.pid === "P3" ? "چرخهٔ ۱-۳-۷" : "برگهٔ سفیدِ هفتگی") + (subj ? " «" + String(subj).slice(0, 50) + "»" : "") });
      push(R, { id: "pr:" + r.id, at: at, src: r.pid, kind: "session", go: ["proto", r.pid, r.id], ok: null, v: v, fa: R.base + (sc && sc.label ? " (" + sc.label + ")" : "") + " — بازیابیِ اندازه‌گیری‌شده: " + pf0(v) });
    });
    /* روند، افت و نگاشت */
    var out = order.map(function (k) {
      var R = rows[k]; R.acts.sort(byAt);
      var prevV = null; R.acts.forEach(function (a) {
        if (a.v == null) return;
        if (prevV != null && a.ok == null) { a.ok = a.v > prevV ? true : a.v < prevV ? false : null; if (a.v !== prevV) a.fa += " (از " + pf0(prevV) + ")"; }
        if (prevV != null && a.v < prevV && !a.why) a.why = "افتِ بازیابی از " + pf0(prevV) + " به " + pf0(a.v);
        prevV = a.v; });
      R.acts.forEach(function (a) { if (a.rep > 1) a.fa += " (" + fa(a.rep) + " بار در همین روز — یک بار شمرده شد)"; });
      var ms = R.acts.filter(function (a) { return a.v != null; });
      R.last = ms.length ? ms[ms.length - 1].v : null; R.first = ms.length ? ms[0].v : null; R.nm = ms.length;
      R.days = R.acts.length;
      var last = R.acts[R.acts.length - 1], stab = R.ev.filter(function (x) { return /^(stable|تثبیت)/.test(x.state); }).sort(byAt).pop();
      if (last && last.ok === false && ((stab && String(stab.at) <= String(last.at)) || R.acts.slice(0, -1).some(function (a) { return a.ok !== false; })))
        R.decline = { at: last.at, why: last.why || "", after: stab ? stab.at : "" };
      R.stableAt = stab ? stab.at : "";
      var fcl = Object.keys(R.fcs).map(function (i) { return R.fcs[i]; });
      if (R.link && R.link.kind === "case") { R.dim = "s_epi"; R.dimHow = "از راهِ پروندهٔ سنجش"; R.acts.forEach(function (a) { a.go = ["e_case", R.link.id]; }); }
      else if (fcl.length) { R.dim = fcl[0].dim || "s_decision"; R.dimHow = "از راهِ دفترِ پیش‌بینی"; }
      else { R.dim = null; R.dimHow = UNMAPPED; }
      return R;
    }).filter(function (R) { return R.acts.length || R.pending; });
    cal.sort(byAt);
    var cn = cal.length, B = cn ? cal.reduce(function (t, c) { return t + Math.pow(c.p - (c.ok ? 1 : 0), 2); }, 0) / cn : null;
    return { rows: out, acts: out.reduce(function (t, R) { return t.concat(R.acts); }, []), cal: { acts: cal, n: cn, brier: B, hit: cn ? cal.filter(function (c) { return c.ok; }).length / cn : null, meanP: cn ? cal.reduce(function (t, c) { return t + c.p; }, 0) / cn : null },
      gaps: gaps.sort(byAt), pending: pending };
  };
  /* فهرستِ «از کجا؟» ِ کارِ تکنیک‌ها — همان قالبِ INF17؛ «◦» = نه موفق نه ناموفق (خودسنجی/نخستین اندازه)؛ ↗ رکوردِ منبع را باز می‌کند */
  function techList(acts, tag) {
    acts = (acts || []).slice().sort(function (a, b) { return String(b.at || "").localeCompare(String(a.at || "")); });
    if (!acts.length) return null;
    var pos = acts.filter(function (a) { return a.ok === true; }).length, neg = acts.filter(function (a) { return a.ok === false; }).length;
    return h("details", { class: "mind-from mind-techfrom", "data-row": tag, "data-n": String(acts.length), "data-plus": String(pos) }, h("summary", {}, "از کجا؟ (" + fa(acts.length) + " کار: +" + fa(pos) + " −" + fa(neg) + ")"),
      h("ol", { class: "small mind-from-list" }, acts.map(function (a) {
        var g = a.go && A.V && A.V[a.go[0]] ? a.go : null;
        return h("li", { class: "mind-act", "data-act": a.id, "data-ok": a.ok === true ? "1" : a.ok === false ? "0" : "", "data-at": day(a.at), "data-src": a.src || "", "data-kind": a.kind || "", "data-go": g ? g.join("|") : "" },
          h("span", { class: a.ok === true ? "good" : a.ok === false ? "warnline" : "muted" }, a.ok === true ? "+ " : a.ok === false ? "− " : "◦ "),
          A.fdate(day(a.at)) + " · " + a.fa,
          g ? h("button", { class: "linkish mind-act-go", type: "button", title: "رکوردِ همین کار", onclick: function () { A.go(g[0], g[1] == null ? null : g[1], g[2] == null ? null : g[2]); } }, " ↗") : null);
      })));
  }
  M.techList = techList;
  function techSection() {
    var W = M.techWork(), dimFa = {}; M.dims().forEach(function (d) { dimFa[d.id] = d.fa; });
    var sec = h("section", { class: "card mind-tech", dir: "rtl", "data-n": String(W.acts.length), "data-cal": String(W.cal.n) }, h("h2", {}, "🏋 کارِ تکنیک‌ها"),
      h("p", { class: "small muted" }, "پرونده‌های تمرین، برگه‌های کامل‌شده، جدول‌های کالیبراسیونِ برگه‌ها، چرخهٔ ۱-۳-۷ و برگهٔ سفیدِ هفتگی — هر نشست یک بار، تکرارِ همان روز یک سطر؛ پیش‌نویس، کارِ پس‌گرفته و پیش‌بینیِ داوری‌نشده شمرده نمی‌شوند. روبریک خودسنجی است، نه اندازه. «" + UNMAPPED + "» یعنی کارنامه نگاشتی از این تکنیک به بُعدهای بالا ندارد و نمی‌سازد؛ پس این کارها فقط این‌جا می‌آیند و عددهای بُعدها را جابه‌جا نمی‌کنند."));
    if (!W.rows.length && !W.cal.n) { sec.appendChild(h("p", { class: "small muted mind-tech-empty" }, "هنوز کارِ تکنیکیِ کامل‌شده‌ای نیست.")); return sec; }
    sec.appendChild(h("div", { class: "mind-scroll" }, h("table", { class: "mind-table small mind-techtable" },
      h("thead", {}, h("tr", {}, ["تکنیک و موضوع", "نشست‌ها (روزهای جدا)", "اندازه (نخست ← آخر)", "بُعد", "از کجا"].map(function (x) { return h("th", {}, x); }))),
      h("tbody", {}, W.rows.map(function (R) {
        return h("tr", { "data-row": R.key, "data-tech": R.tech || "", "data-dim": R.dim || "" },
          h("td", {}, R.base, R.stableAt ? h("div", { class: "small good" }, "تثبیت شد: " + A.fdate(day(R.stableAt))) : null,
            (R.off || []).map(function (w) { return h("div", { class: "small warnline mind-tech-off", "data-at": day(w.at) }, "«تثبیت شد»" + (w.was ? " (" + A.fdate(day(w.was)) + ")" : "") + " در " + A.fdate(day(w.at)) + " پس گرفته شد" + (w.why ? ": " + w.why : "")); }),
            R.decline ? h("div", { class: "small warnline mind-tech-decline", "data-at": day(R.decline.at) }, "افت در " + A.fdate(day(R.decline.at)) + (R.decline.after ? " (پس از «تثبیت شد» در " + A.fdate(day(R.decline.after)) + ")" : "") + (R.decline.why ? ": " + R.decline.why : "")) : null),
          h("td", {}, fa(R.days) + (R.pending ? " · " + fa(R.pending) + " در انتظار" : "")),
          h("td", {}, R.nm ? (R.nm > 1 ? pf0(R.first) + " ← " + pf0(R.last) + " (" + fa(R.nm) + ")" : pf0(R.last) + " (۱)") : "— (اندازه‌ای نیست)"),
          h("td", { class: "mind-tech-dim" }, R.dim ? (dimFa[R.dim] || R.dim) + " — " + R.dimHow : UNMAPPED),
          h("td", { class: "small" }, techList(R.acts, "tech:" + R.key)));
      })))));
    var C = W.cal;
    if (C.n) sec.appendChild(h("div", { class: "mind-tech-cal", "data-n": String(C.n), "data-brier": C.brier.toFixed(4) },
      h("b", {}, "کالیبراسیونِ برگه‌ها و تمرین‌ها: "), fa(C.n) + " پیش‌بینیِ داوری‌شده · Brier " + fa(C.brier.toFixed(3)) + " · درست " + pf0(100 * C.hit) + " در برابرِ میانگینِ اطمینانِ " + pf0(100 * C.meanP) + " (" + (C.meanP > C.hit ? "بیش‌اطمینانی " : C.meanP < C.hit ? "کم‌اطمینانی " : "") + sgn(100 * (C.meanP - C.hit)) + " واحد) — " + UNMAPPED + "؛ پیش‌بینی‌ای که همان پیش‌بینیِ دفترِ 🎯 است فقط آن‌جا شمرده می‌شود.",
      techList(C.acts.map(function (c) { return { id: c.id, at: c.at, ok: c.ok, fa: c.fa, go: c.go, src: "cal", kind: "cal" }; }), "techcal")));
    if (W.gaps.length) sec.appendChild(h("div", { class: "mind-tech-gaps", "data-n": String(W.gaps.length) }, h("b", {}, "پیش‌بینی از یادگیریِ خودت در برابرِ واقعی: "), techList(W.gaps, "techgap")));
    return sec;
  }
  M.techSection = techSection;
  M.techText = function (W) {
    W = W || M.techWork(); if (!W.rows.length && !W.cal.n) return "";
    return "کارِ تکنیک‌ها (هر نشست یک بار؛ نگاشت به بُعد فقط از راهِ پرونده/دفترِ پیش‌بینی، وگرنه «" + UNMAPPED + "»): " + W.rows.slice(0, 8).map(function (R) {
      return R.base + " — " + R.days + " نشست" + (R.nm ? "، اندازه " + Math.round(R.first) + "%→" + Math.round(R.last) + "%" : "") + (R.decline ? "، افت در " + day(R.decline.at) + (R.decline.why ? " (" + R.decline.why + ")" : "") : "");
    }).join(" · ") + (W.cal.n ? " · کالیبراسیونِ برگه‌ها: " + W.cal.n + " داوری‌شده، Brier " + W.cal.brier.toFixed(3) : "");
  };

  /* ---------- 📈 نمودارِ سادهٔ CSV (فقط داده، بی استنتاج) — تورِ ۱، s32: «حتی اگر مسئله هندسی نیست، شکل بکش» ----------
     ستونی عددی است که همهٔ خانه‌های پرِ آن عدد باشند (بی آستانه)؛ هر ستونِ عددی یک خط، محورِ افقی ترتیبِ سطرها با برچسبِ نخستین ستونِ غیرعددی.
     هیچ روند، میانگین یا خطِ برازشی کشیده نمی‌شود — دیدن و داوری با خودت. */
  function csvRows(text) {
    var t = String(text || "").replace(/^﻿/, ""), lines = t.split(/\r?\n/).filter(function (l) { return l.trim() !== ""; }); if (!lines.length) return [];
    var cand = [",", ";", "\t", "،"], d = cand.map(function (c) { return [c, lines[0].split(c).length]; }).sort(function (a, b) { return b[1] - a[1]; })[0][0];
    return lines.map(function (l) {
      var out = [], cur = "", q = false;
      for (var i = 0; i < l.length; i++) { var ch = l[i]; if (ch === '"') { if (q && l[i + 1] === '"') { cur += '"'; i++; } else q = !q; } else if (ch === d && !q) { out.push(cur.trim()); cur = ""; } else cur += ch; }
      out.push(cur.trim()); return out;
    });
  }
  function csvNum(v) { v = String(v == null ? "" : v).trim(); if (v === "") return null; var n = A.parseNum ? A.parseNum(v) : parseFloat(v); return n == null || isNaN(n) || !isFinite(n) ? NaN : +n; }
  M.csvParse = function (text) {
    var rows = csvRows(text); if (rows.length < 2) return null;
    var head = rows[0], body = rows.slice(1), w = Math.max.apply(null, rows.map(function (r) { return r.length; })), cols = [];
    var headNum = head.every(function (c) { var n = csvNum(c); return n != null && !isNaN(n); });
    if (headNum) { body = rows; head = head.map(function (c, i) { return "ستون " + fa(i + 1); }); }
    for (var j = 0; j < w; j++) {
      var vals = body.map(function (r) { return csvNum(r[j]); }), filled = vals.filter(function (v) { return v != null; });
      cols.push({ i: j, name: head[j] || ("ستون " + fa(j + 1)), num: filled.length >= 2 && filled.every(function (v) { return !isNaN(v); }), vals: vals, raw: body.map(function (r) { return r[j] || ""; }) });
    }
    var lab = cols.filter(function (c) { return !c.num; })[0] || null;
    return { n: body.length, cols: cols, num: cols.filter(function (c) { return c.num; }), label: lab };
  };
  M.csvChart = function (text, title) {
    var P0 = M.csvParse(text); if (!P0 || !P0.num.length) return null;
    var W = 640, H = 300, x0 = 56, x1 = W - 16, y0 = H - 40, y1 = 24, ser = P0.num.slice(0, 6), all = [];
    ser.forEach(function (c) { c.vals.forEach(function (v) { if (v != null && !isNaN(v)) all.push(v); }); });
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all); if (lo === hi) { lo -= 1; hi += 1; }
    var s = svgBox(W, H, title || "نمودارِ CSV"), N = P0.n, COLS = ["#1d4ed8", "#b45309", "#0f766e", "#9333ea", "#be123c", "#4d7c0f"];
    function X(i) { return N > 1 ? x0 + (x1 - x0) * i / (N - 1) : (x0 + x1) / 2; }
    function Y(v) { return y0 - (y0 - y1) * (v - lo) / (hi - lo); }
    [lo, (lo + hi) / 2, hi].forEach(function (v) { s.appendChild(el("line", { x1: x0, x2: x1, y1: Y(v), y2: Y(v), stroke: "#e5e7eb" })); s.appendChild(txt(x0 - 6, Y(v) + 4, fa(+v.toPrecision(4)), { "font-size": 11, "text-anchor": "end", direction: "ltr" })); });
    var step = Math.max(1, Math.ceil(N / 8));
    for (var i = 0; i < N; i += step) s.appendChild(txt(X(i), H - 22, String(P0.label ? P0.label.raw[i] : fa(i + 1)).slice(0, 10), { "font-size": 11 }));
    ser.forEach(function (c, k) {
      var seg = [], segs = [];
      c.vals.forEach(function (v, i) { if (v == null || isNaN(v)) { if (seg.length) segs.push(seg); seg = []; return; } seg.push([X(i), Y(v)]); });
      if (seg.length) segs.push(seg);
      segs.forEach(function (sg) { s.appendChild(el("polyline", { points: sg.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "), fill: "none", stroke: COLS[k], "stroke-width": 2, "data-col": c.name })); sg.forEach(function (p) { s.appendChild(el("circle", { cx: p[0], cy: p[1], r: 2.5, fill: COLS[k] })); }); });
      s.appendChild(el("rect", { x: x0 + 110 * k, y: H - 12, width: 10, height: 6, fill: COLS[k] })); s.appendChild(txt(x0 + 110 * k + 14, H - 6, String(c.name).slice(0, 14), { "font-size": 11, "text-anchor": "start" }));
    });
    return { svg: s, n: N, series: ser.map(function (c) { return c.name; }), skipped: P0.num.length - ser.length, label: P0.label ? P0.label.name : null };
  };
  /* بخشِ نمایش برای یک فایلِ CSV (پیوست): نمودار + یک خطِ صادقانه که چه کشیده شد و چه نه */
  M.csvBlock = function (name, text) {
    var C = M.csvChart(text, "نمودارِ «" + name + "»"), box = h("div", { class: "card soft csv-plot", dir: "rtl", "data-file": name });
    box.appendChild(h("h4", {}, "📈 نمودارِ «" + name + "»"));
    if (!C) { box.appendChild(h("p", { class: "small muted" }, "ستونِ عددی‌ای پیدا نشد که همهٔ خانه‌هایش عدد باشد — نموداری کشیده نشد.")); return box; }
    /* تورِ پولیا دورِ ۳ (A13، s32): در حبابِ باریکِ گفت‌وگو SVG ِ ۶۴۰ پیکسلی کوچک می‌شد و برچسب‌های محورِ ۱۱px چند پیکسل می‌شدند —
       نمودار در اندازهٔ خودش می‌ماند (برچسب‌ها واقعاً ۱۱px) و قابش افقی می‌لغزد؛ صفحه سرریز نمی‌کند */
    C.svg.setAttribute("style", "max-width:none;height:auto;display:block");
    box.appendChild(h("div", { class: "csv-scroll", dir: "ltr", style: "overflow-x:auto;max-width:100%" }, C.svg));
    box.appendChild(h("p", { class: "small muted csv-note" }, fa(C.n) + " سطر · ستون‌ها: " + C.series.join("، ") + (C.label ? " · محورِ افقی: «" + C.label + "»" : " · محورِ افقی: شمارهٔ سطر") + (C.skipped ? " · " + fa(C.skipped) + " ستونِ عددیِ دیگر کشیده نشد" : "") +
      " — فقط خودِ داده‌ها؛ هیچ روند، میانگین یا برازشی کشیده نشده. الگو (فصل، جهش، تکرار) را خودت ببین و داوری کن."));
    return box;
  };

  M.charts = function (m) { m = m || M.model(); return { radar: M.radar(m), trend: M.trend(m), calib: M.calib(m), neural: M.neural(m), mindmap: M.mindmap(m) }; };
  /* SVG ⇒ PNG (برای ایمیل: Gmail ِ SVG را نشان نمی‌دهد) */
  M.png = function (svg) {
    return new Promise(function (res) {
      try {
        var x = new XMLSerializer().serializeToString(svg), img = new Image(), w = +svg.getAttribute("width") || 600, hh = +svg.getAttribute("height") || 400;
        img.onload = function () { try { var c = document.createElement("canvas"); c.width = w * 2; c.height = hh * 2; var g = c.getContext("2d"); g.scale(2, 2); g.drawImage(img, 0, 0, w, hh); res(c.toDataURL("image/png")); } catch (e) { res(""); } };
        img.onerror = function () { res(""); };
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(x);
      } catch (e) { res(""); }
    });
  };

  /* ---------- نما ---------- */
  A.V.mind = function () {
    var m = M.model(), root = h("div", { class: "page mind", dir: "rtl" });
    root.appendChild(A.head("نقشه‌ها", "🧠 کارنامهٔ ذهن", "یک نگاه به هفت بُعدِ ذهنت از روی دادهٔ خودت — دقت، کالیبراسیون، ماندگاری و بازشدنِ گره‌ها — با نقطه‌های سیاه، روند، شبکه و مسیرهای پیشِ رو. هر عدد اندازهٔ نمونه‌اش را کنارش دارد؛ با نمونهٔ کم، برآورد خودش به ½ نزدیک می‌ماند (بی کفِ قراردادی)."));
    root.appendChild(h("p", { class: "card soft small" }, "هر عددِ این کارنامه یک احتمال است که از دادهٔ خودت و اصل‌های عقلی درمی‌آید — بی‌برش و بی‌میانگینِ قراردادی. مقایسه با مردم فقط در «📐 سنجشِ استاندارد» و فقط با معماهایی که دشواری‌شان در نمونهٔ بزرگی از مردم از منبعِ معتبر سنجیده شده (چرا و چطور: ", h("button", { class: "linkish", type: "button", onclick: function () { if (A.HOST && A.HOST.openDoc) A.HOST.openDoc("HANDBOOK"); } }, "دفترچه، §۱۰"), ")."));
    if (A.PSY && A.PSY.section) root.appendChild(A.PSY.section());
    var t = m.tot;
    root.appendChild(h("div", { class: "bt-stats" }, [["گره‌ها", t.knots], ["ورزیده", t.practised], ["بازگشته", t.returned], ["پرونده‌های سنجش", t.cases], ["مسئله‌ها", t.probs], ["تورها", t.tours], ["پاسخ‌های دقیق", t.answers]].map(function (x) {
      return h("div", { class: "card soft bt-stat" }, h("div", { class: "small muted" }, x[0]), h("div", { class: "bt-num" }, fa(x[1])));
    })));
    /* پیوند به سوی معرفت‌شناسی و گرافِ مشترک (ممیزیِ اجرا ۲۰۲۶-۱۰-۱۵: کارنامه به هیچ‌جا راه نداشت) */
    root.appendChild(h("div", { class: "row gap wrap mind-links" },
      A.GRAPH ? h("button", { class: "btn ghost sm mind-graph", type: "button", onclick: function () { A.GRAPH.open(null); } }, "🕸 در گرافِ مشترک") : null,
      h("button", { class: "btn ghost sm mind-epi", type: "button", onclick: function () { A.go("e_cases"); } }, "⚖️ پرونده‌های سنجش در کارخانه"),
      h("button", { class: "btn ghost sm", type: "button", onclick: function () { A.go("kmap"); } }, "🗺️ نقشهٔ ذهنِ تو"),
      h("button", { class: "btn ghost sm", type: "button", onclick: function () { A.go("sterr"); } }, "🗺 قلمروِ سامانه‌ها")));
    var C = M.charts(m);
    root.appendChild(h("section", { class: "card mind-glance" }, h("h2", {}, "در یک نگاه"), h("div", { class: "row gap wrap" }, C.radar, C.calib)));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "کارنامهٔ هر بُعد"), h("div", { class: "mind-scroll" }, h("table", { class: "mind-table small" },
      h("thead", {}, h("tr", {}, ["حوزهٔ زندگی", "احتمالِ درستیِ پاسخِ بعدی", "پاسخ‌ها (درست از کل)", "احتمالِ بیش‌اطمینانی", "ماندگاری (درست از کل)", "گره‌های ورزیده", "احتمالِ پیشرفت"].map(function (x) { return h("th", {}, x); }))),
      h("tbody", {}, m.dims.map(function (d) {
        var E = d.est || { n: 0 };
        function cell(v, n) { return h("td", { title: "نمونه: " + fa(n) }, v == null ? "— (" + fa(n) + ")" : fa(v) + " (" + fa(n) + ")"); }
        /* بُعدِ «داوریِ معرفتی» ⇒ پرونده‌های کارخانه (همان‌جا که این عددها از آن می‌آیند) */
        return h("tr", { "data-dim": d.id }, h("td", {}, d.id === "s_epi" ? h("button", { class: "linkish mind-dim-epi", type: "button", title: "پرونده‌های سنجش در کارخانهٔ معرفت‌شناسی", onclick: function () { A.go("e_cases"); } }, d.fa + " ↗") : d.fa), h("td", {}, E.n ? A.PSY.pctFa(E.next) + " (" + fa(E.n) + ")" : "— (هنوز پاسخی نیست)"), h("td", {}, fa(E.k || 0) + " از " + fa(E.n || 0)),
          (function () {
            /* اطمینان به پاسخ و پیش‌بینیِ رویداد جدا (H3) */
            var F = E.fc || { n: 0 }, parts = [];
            if (E.calN) parts.push("پاسخ‌ها: " + A.PSY.pctFa(E.pOver) + " (" + fa(E.calN) + ")");
            if (F.dirN) parts.push("پیش‌بینی‌ها: " + A.PSY.pctFa(F.pOver) + " (" + fa(F.dirN) + ")");
            return h("td", { title: (E.calN ? "میانگینِ اطمینان به پاسخ " + fa(Math.round(100 * E.meanConf)) + "٪" : "") + (F.dirN ? (E.calN ? " · " : "") + "میانگینِ احتمالِ طرفِ محتمل‌تر " + fa(Math.round(100 * F.meanQ)) + "٪، " + fa(F.hit) + " از " + fa(F.dirN) + " رخ داد" : "") }, parts.length ? parts.join(" · ") : "— (اطمینانی ثبت نشده)");
          })(),
          h("td", {}, fa(d.ret.ok) + " از " + fa(d.ret.n)), h("td", {}, fa(d.knots.practised || 0) + " از " + fa(d.knots.all)),
          h("td", {}, E.progress ? A.PSY.pctFa(E.progress.p) + " (" + fa(E.progress.from) + " ← " + fa(E.progress.to) + ")" : "— (کمتر از دو ماهِ سنجیده)"));
      })))), (function () { var cs = (m.dims.filter(function (d) { return d.id === "s_learn"; })[0] || {}).cardSelf; return cs && cs.n ? h("p", { class: "small muted mind-cards" }, "کارت‌های مرور خودسنجی‌اند (نمره را خودت می‌دهی)؛ مثلِ پاسخِ «خودم سنجیدم» در گره‌ها در این عددها نمی‌آیند: " + fa(cs.k) + " از " + fa(cs.n) + " مرور را «درست» (۳ تا ۵ ِ SM-2) نمره دادی.") : null; })()));
    /* INF17: «از کجا؟» ِ هر بُعد — پاسخ‌ها و پیش‌بینی‌هایی که آن را جابه‌جا کردند (هر کار یک بار) */
    var dimFrom = m.dims.map(function (d) { var A0 = M.dimActs(d); return A0.length ? h("div", { class: "mind-dimfrom", "data-dim": d.id }, h("b", {}, d.fa + ": "), fromList(A0, "dim:" + d.id)) : null; }).filter(Boolean);
    if (dimFrom.length) root.appendChild(h("section", { class: "card mind-dimsfrom" }, h("h2", {}, "از کجا؟ — هر بُعد"), h("p", { class: "small muted" }, "هر پاسخ، حدس یا پیش‌بینیِ سنجیده که عددهای بالا را جابه‌جا کرد، با تاریخ و درست/نادرست؛ کارِ پس‌گرفته (اصلاح‌شده) این‌جا نیست."), dimFrom));
    root.appendChild(phasesSection());
    root.appendChild(techSection());   // LT4 (دورِ ۱۹c): کارِ تکنیک‌ها با «از کجا؟»
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "⚫ نقطه‌های سیاه"), m.black.length ? h("ul", {}, m.black.map(function (b) { return h("li", {}, b.go ? h("button", { class: "linkish", type: "button", onclick: function () { A.go(b.go[0], b.go[1] || null); } }, b.fa) : b.fa); })) : h("p", { class: "small muted" }, "نقطهٔ سیاهی دیده نشد (یا هنوز دادهٔ کافی نیست).")));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "📈 روند"), C.trend));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "🕸 نقشهٔ کاملِ ذهن"), C.mindmap));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "🧬 شبکهٔ ذهن"), h("p", { class: "small muted" }, "نمایشی برای دیدنِ جریان — نه مدلِ عصبیِ مغز."), C.neural));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "🛤 مسیرهای پیشِ رو"), h("ul", {}, m.ahead.concat(m.due).slice(0, 14).map(function (x) { return h("li", {}, x.go ? h("button", { class: "linkish", type: "button", onclick: function () { A.go(x.go[0], x.go[1] || null); } }, x.fa) : x.fa); }).concat(m.ahead.length + m.due.length ? [] : [h("li", { class: "muted" }, "فعلاً کارِ بازی نیست.")]))));
    root.appendChild(h("details", { class: "card" }, h("summary", {}, "🧭 از کجا دوری و چرا (" + fa(m.far.length) + ")"),
      h("div", {}, m.dims.map(function (d) { var f = m.far.filter(function (x) { return x.dim === d.id; }); return f.length ? h("div", {}, h("b", {}, d.fa + " (" + fa(f.length) + "): "), h("span", { class: "small" }, f.slice(0, 12).map(function (x) { return x.fa + " — " + x.why; }).join(" · "))) : null; }))));
    root.appendChild(h("details", { class: "card" }, h("summary", {}, "🗓 خطِ زمانی (" + fa(m.events.length) + ")"), h("ol", { class: "small" }, m.events.map(function (e) { return h("li", {}, A.fdate(day(e.at)) + " — " + e.fa); }))));
    return root;
  };
  /* زنده: اگر همین نما باز است و رکوردی نوشته/پاک شد، کارنامه دوباره ساخته می‌شود (S.listeners؛ با درنگ، و نه وسطِ تایپ) */
  if (S && Array.isArray(S.listeners)) {
    var mindTimer = null;
    S.listeners.push(function () {
      if (!A.state || A.state.view !== "mind") return;
      clearTimeout(mindTimer);
      mindTimer = setTimeout(function () {
        if (!A.state || A.state.view !== "mind") return;
        var ae = document.activeElement; if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return;
        var y = window.scrollY; A.render(); try { window.scrollTo(0, y); } catch (e) { }
      }, 250);
    });
  }
  A.VIEW_META = A.VIEW_META || {};
  A.VIEW_META.mind = { j: "ws", what: "کارنامهٔ ذهن: هفت بُعد با دقت، کالیبراسیون، ماندگاری و بازشدنِ گره‌ها؛ نقطه‌های سیاه، روند، نقشهٔ کاملِ ذهن، شبکه و مسیرهای پیشِ رو.", why: "تا ذهنت را در یک نگاه و در جزئیات ببینی و بدانی کجا جلو رفته‌ای، کجا گیر کرده‌ای و راهِ بعد چیست." };
  if (A.GRAPH && A.GRAPH.MAPS && !A.GRAPH.MAPS.some(function (x) { return x.v === "mind"; })) A.GRAPH.MAPS.splice(1, 0, { v: "mind", fa: "🧠 کارنامهٔ ذهن", what: "هفت بُعد، نقطه‌های سیاه، روند، نقشهٔ کاملِ ذهن و شبکه" });
})(APP);
/* دستیار عددهای کارنامه را هم می‌بیند (کارزارِ آزمون sc09: «عددها را در اسکنم نمی‌بینم» و افتِ ۷۰→۶۱ را حدس زد) — فقط وقتی همین نما باز است */
(function (A) {
  if (!A.ASSIST || !A.MIND) return;
  A.ASSIST.promptHooks = A.ASSIST.promptHooks || [];
  A.ASSIST.promptHooks.push(function () {
    if (!A.state || A.state.view !== "mind") return "";
    var M = A.MIND.model(), pc = function (p) { return Math.round(100 * p) + "%"; }, L = ["# کارنامهٔ ذهن (همین که کاربر می‌بیند؛ هر عدد یک احتمال از A3+A4، بی‌برشِ قراردادی؛ «ضریبِ هوشیِ کل» ساخته نمی‌شود)"];
    L.push("## سازه‌های استاندارد (CHC و عقلانیت)");
    (M.psy || []).forEach(function (c) {
      if (c.none) { L.push("- " + c.fa + ": سنجیده نمی‌شود — " + c.none); return; }
      var e = c.self, p = c.pop || { n: 0 };
      L.push("- " + c.fa + ": پاسخِ بعدی " + (e.n ? pc(e.next) + " (" + e.k + "/" + e.n + ")" : "—") + (e.progress ? " · احتمالِ پیشرفت " + pc(e.progress.p) + " (" + e.progress.from + "→" + e.progress.to + ")" : "") +
        (c.id === "META" && e.calN ? " · احتمالِ بیش‌اطمینانی به پاسخ‌ها " + pc(e.pOver) : "") + (c.id === "META" && c.fc && c.fc.dirN ? " · پیش‌بینیِ رویدادها (جدا): " + c.fc.hit + "/" + c.fc.dirN + " طرفِ محتمل‌تر رخ داد، احتمالِ بیش‌اطمینانی در پیش‌بینی " + pc(c.fc.pOver) : "") + (p.n ? " · مقایسه با مردم: " + (p.scales || [p]).map(function (q) { return A.PSY.popFa(q); }).join(" | ") : " · مقایسه با مردم: هنوز معمای لنگرداری جواب داده نشده"));
    });
    L.push("## حوزه‌های زندگی");
    M.dims.forEach(function (d) { var E = d.est || { n: 0 };
      L.push("- " + (d.fa || d.id) + ": پاسخِ بعدی " + (E.n ? pc(E.next) + " (" + E.k + "/" + E.n + ")" : "—") + (E.calN ? " · احتمالِ بیش‌اطمینانی به پاسخ‌ها " + pc(E.pOver) : "") + (E.fc && E.fc.dirN ? " · پیش‌بینیِ رویدادها: طرفِ محتمل‌تر میانگین " + pc(E.fc.meanQ) + "، " + E.fc.hit + "/" + E.fc.dirN + " رخ داد، احتمالِ بیش‌اطمینانی در پیش‌بینی " + pc(E.fc.pOver) : "") + " · ماندگاری " + d.ret.ok + "/" + d.ret.n + " · گره‌های ورزیده " + (d.knots.practised || 0) + "/" + d.knots.all + (E.progress ? " · احتمالِ پیشرفت " + pc(E.progress.p) : ""));
    });
    if (A.MIND.phasesText) L.push("## " + A.MIND.phasesText());
    if (A.MIND.techText) { var tt = A.MIND.techText(); if (tt) L.push("## " + tt); }
    if ((M.black || []).length) L.push("نقطه‌های سیاه: " + M.black.slice(0, 6).map(function (b) { return b.fa || b.t || ""; }).join(" · "));
    return L.join("\n");
  });
})(APP);
