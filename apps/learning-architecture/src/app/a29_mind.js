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
  function day(x) { return String(x || "").slice(0, 10); }
  function month(x) { return String(x || "").slice(0, 7); }
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
    function ingest(dim, hist) {
      var t0 = null;
      (hist || []).forEach(function (x) {
        if (!x || x.self || x.ok == null || x.ok === "") return;
        var ok = x.ok === true || x.ok === 1 || x.ok === "1" || x.ok === "true", at = x.at || x.d || "";
        put(dim, { at: at, ok: ok });
        var c = conf01(x.conf); if (c != null) (D[dim] || D.s_mind).cal.push({ p: c, ok: ok, at: at });
        if (t0 && day(at) >= A.addDays(day(t0), HOLD)) { var R = (D[dim] || D.s_mind).ret; R.n++; if (ok) R.ok++; }
        if (ok && !t0) t0 = at;
      });
    }
    S.all("kitem", function (it) { return !it.bad && countable(it); }).forEach(function (it) { ingest(kdim[it.knot] || "s_mind", it.hist); });
    S.all("pbitem").forEach(function (it) { ingest("s_problem", it.hist); });
    /* کارت‌های مرور: اطمینان پیش از دیدنِ پاسخ (c) و نمرهٔ یادآوری (g ≥ ۳ = درست) ⇒ یادگیری و حافظه */
    S.all("card", function (c) { return !c.sample; }).forEach(function (c) { ingest("s_learn", (c.hist || []).map(function (x) { return { at: x.d, conf: x.c, ok: x.g >= 3 }; })); });
    /* حرکت‌ها: شمارِ پاسخ‌های درست/نادرستِ هر حرکت (دفترِ حرکت‌ها زمان و حرکت را با هم نگه نمی‌دارد ⇒ در روندِ ماهانه نمی‌آید) */
    var mp = S.get("moves_prog"); Object.keys((mp && mp.by) || {}).forEach(function (mv) { var b = mp.by[mv], d = M.dimOf("move:" + mv); for (var i = 0; i < (b.n || 0); i++) put(d, { at: "", ok: i < (b.ok || 0) }); });
    /* داوریِ معرفتی: درجهٔ نهاییِ تو ↔ نتیجهٔ واقعیِ ثبت‌شده در بازبینی */
    var cases = S.all("case", function (c) { return !c.sample; });
    cases.forEach(function (cs) {
      var d = cs.st && cs.st.st_final && cs.st.st_final.data, fin = (d && d.final) || [];
      D.s_epi.items.push({ t: "case", id: cs.id, fa: cs.title || "پرونده", st: (cs.st && cs.st.st_final && cs.st.st_final.done) ? "done" : "open", at: cs.created });
      fin.forEach(function (r) {
        var o = (cs.outcome || {})[r.c]; if (!r.c || r.p == null || r.p === "" || (o !== "درست" && o !== "نادرست")) return;
        var p = conf01(r.p), ok = o === "درست", at = cs.outcomeAt || cs.updated || cs.created;
        D.s_epi.cal.push({ p: p, ok: ok, at: at });
        D.s_epi.ans.push({ at: at, ok: (p >= 0.5) === ok });
      });
    });
    /* ⛓ زنجیرهٔ نگرانی (حسِ اول ↔ رخ داد/نداد) و 🎯 دفترِ پیش‌بینی (احتمال ↔ شد/نشد) ⇒ کالیبراسیونِ همان بُعد */
    S.all("wchain", function (c) { return c.feel != null && (c.outcome === "رخ داد" || c.outcome === "رخ نداد"); }).forEach(function (c) {
      var p = c.feel / 100, ok = c.outcome === "رخ داد"; D.s_mind.cal.push({ p: p, ok: ok, at: c.outcomeAt || c.due }); D.s_mind.ans.push({ at: c.outcomeAt || c.due, ok: (p >= 0.5) === ok });
    });
    S.all("fcast", function (x) { return x.p != null && (x.outcome === "شد" || x.outcome === "نشد"); }).forEach(function (x) {
      var X = D[x.dim] || D.s_decision, p = x.p / 100, ok = x.outcome === "شد"; X.cal.push({ p: p, ok: ok, at: x.outcomeAt || x.due }); X.ans.push({ at: x.outcomeAt || x.due, ok: (p >= 0.5) === ok });
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
      var bym = {}; X.ans.forEach(function (a) { var m = month(a.at); if (!m) return; (bym[m] = bym[m] || { n: 0, ok: 0, cal: [] }).n++; if (a.ok) bym[m].ok++; });
      X.cal.forEach(function (c) { var m = month(c.at); if (!m) return; (bym[m] = bym[m] || { n: 0, ok: 0, cal: [] }).cal.push(c); });
      X.months = Object.keys(bym).sort().map(function (m) { var r = bym[m], bb = brier(r.cal); return { m: m, acc: r.n >= 3 ? Math.round(100 * r.ok / r.n) : null, cal: r.cal.length >= 3 ? Math.round(100 * (1 - bb)) : null, n: r.n }; });
      var lm = X.months.filter(function (x) { return x.acc != null; });
      // روند = نخستین ماهِ سنجیده تا آخرین ماهِ سنجیده، با بازه‌اش (کارزارِ سوم v05: فقط دو ماهِ آخر ⇒ ۴۰→۱۰۰ «▲۰» نشان می‌داد)
      X.trend = lm.length >= 2 ? lm[lm.length - 1].acc - lm[0].acc : null;
      X.trendFrom = lm.length >= 2 ? lm[0].m : null; X.trendTo = lm.length >= 2 ? lm[lm.length - 1].m : null;
      /* برآوردِ بی‌آستانه (مالک ۲۰۲۶-۱۰-۱۵: «بدونِ اعدادِ قراردادی»): هر عدد یک احتمال از A3+A4 — ر.ک. a34_psy.js. «نمره» و «مرحله» ِ بالا
         (میانگینِ چهار شاخص و برش‌های ۴۰/۶۵/۸۵) قراردادی بودند: فقط برای سازگاریِ پیشین حساب می‌شوند و نمایش داده نمی‌شوند (REMOVAL_CANDIDATES). */
      if (A.PSY) {
        X.est = A.PSY.selfEst(X.ans, false);
        var calE = A.PSY.selfEst(X.cal.map(function (c) { return { at: c.at, ok: c.ok, conf: c.p }; }), true);
        X.est.pOver = calE.pOver; X.est.meanConf = calE.meanConf; X.est.calN = calE.calN || 0;
      }
    });
    /* نقطه‌های سیاه */
    var black = [], today = A.today();
    knots.forEach(function (k) {
      if (k.status === "returned") black.push({ k: "returned", fa: "گرهِ بازگشته: «" + (k.name || "گره") + "»", go: ["knot", k.id], dim: kdim[k.id] });
      else if ((k.status || "open") !== "practised" && k.created && A.daysBetween(day(k.created), today) > 30) black.push({ k: "stale", fa: "بیش از ۳۰ روز باز: «" + (k.name || "گره") + "»", go: ["kpractice", k.id], dim: kdim[k.id] });
    });
    dims.forEach(function (dd) {
      // بیش‌اطمینانی: وقتی احتمالِ «درستیِ واقعی کمتر از میانگینِ اطمینانِ اعلام‌شده» از ½ بیشتر است (مرزِ ½ از A4، نه برشِ قراردادیِ ۸۰/۶۵)
      var X = D[dd.id], E = X.est || {};
      if (E.pOver != null && E.pOver > 0.5) black.push({ k: "overconf", fa: "بیش‌اطمینانی در «" + dd.fa + "»: میانگینِ اطمینانت " + fa(Math.round(100 * E.meanConf)) + "٪ بوده و احتمالِ اینکه درستیِ واقعی‌ات کمتر از آن باشد " + fa(Math.round(100 * E.pOver)) + "٪ است (" + fa(E.calN) + " پاسخ)", dim: dd.id });
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
    cases.forEach(function (c) { if (c.created) ev.push({ at: c.created, fa: "پروندهٔ سنجش: «" + (c.title || "") + "»" }); var fn = c.st && c.st.st_final; if (fn && fn.done) ev.push({ at: fn.at || c.updated || c.created, fa: "⚖️ حکمِ پایانیِ پرونده: «" + (c.title || "") + "»" }); if (c.outcomeAt) ev.push({ at: c.outcomeAt, fa: "نتیجهٔ واقعی ثبت شد: «" + (c.title || "") + "»" }); });
    S.all("kcase", function (c) { return !c.sample && c.created; }).forEach(function (c) { ev.push({ at: c.created, fa: "🪢 موقعیتِ گره‌گشا: «" + (c.title || "") + "»" }); });
    S.all("prereq", function (p) { return p.created; }).forEach(function (p) { ev.push({ at: p.created, fa: "🧩 نقشهٔ پیش‌نیازها: «" + (p.title || "") + "»" }); if (p.backAt && p.back) ev.push({ at: p.backAt, fa: "🧩 بازگشت به مسئله: " + p.back }); });
    S.all("wchain", function (c) { return c.created; }).forEach(function (c) { ev.push({ at: c.created, fa: "⛓ زنجیرهٔ نگرانی: «" + c.title + "»" }); if (c.outcomeAt) ev.push({ at: c.outcomeAt, fa: "⛓ نتیجهٔ «" + c.title + "»: " + c.outcome }); });
    S.all("achat", function (s) { return s.tour; }).forEach(function (s) { ev.push({ at: s.tour.createdAt, fa: "🧭 تورِ تازه: «" + (s.title || s.pinned || "") + "»" }); if (s.tour.doneAt) ev.push({ at: s.tour.doneAt, fa: "🧭 ترتیبِ تور طی شد: «" + (s.title || "") + "»" }); if (s.tour.masteredAt) ev.push({ at: s.tour.masteredAt, fa: "🏁 تور تا تسلط کامل شد: «" + (s.title || "") + "»" }); });
    ev = ev.filter(function (e) { return e.at; }).sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); });
    var tot = { knots: knots.length, practised: knots.filter(function (k) { return k.status === "practised"; }).length, returned: knots.filter(function (k) { return k.status === "returned"; }).length,
    /* «مسئله‌ها»: مسئلهٔ خودِ کاربر در گره‌گشا و نقشهٔ پیش‌نیاز هم مسئله است (کارزارِ آزمونِ دوم c16/c17: «مسئله‌ها ۰») */
      cases: cases.length, probs: S.all("eprob", function (p) { return !p.sample; }).length + S.all("prereq").length + S.all("kcase", function (c) { return !c.sample && c.intake && (c.intake.kinds || []).indexOf("problem") >= 0; }).length, tours: S.all("achat", function (s) { return s.tour; }).length, answers: dims.reduce(function (t, d) { return t + D[d.id].ans.length; }, 0) };
    return { at: new Date().toISOString(), psy: A.PSY ? A.PSY.model() : [], dims: dims.map(function (d) { return D[d.id]; }), black: black, far: far, ahead: ahead, due: due, events: ev.slice(0, 60), tot: tot };
  };

  /* ---------- نمودارها (SVG) ---------- */
  function el(n, at, kids) { var e = document.createElementNS(NS, n); Object.keys(at || {}).forEach(function (k) { if (at[k] != null) e.setAttribute(k, at[k]); }); (kids || []).forEach(function (c) { if (c) e.appendChild(c); }); return e; }
  function txt(x, y, s, at) { var t = el("text", Object.assign({ x: x, y: y, "font-size": 11, fill: "#334", "text-anchor": "middle", direction: "rtl", "font-family": "Vazirmatn, Tahoma, sans-serif" }, at || {})); t.textContent = s; return t; }
  function svgBox(w, hh, title) { var s = el("svg", { xmlns: NS, viewBox: "0 0 " + w + " " + hh, width: w, height: hh, role: "img", "aria-label": title, class: "mind-svg" }); s.appendChild(el("rect", { x: 0, y: 0, width: w, height: hh, fill: "#fff" })); return s; }
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
    s.appendChild(txt(W / 2, 20, "روندِ ماهانهٔ دقت در هر بُعد (پیشرفت ▲ / پس‌رفت ▼)", { "font-size": 13, "font-weight": 700 }));
    var x0 = 40, x1 = W - 20, y0 = H - 40, y1 = 64;
    [0, 50, 100].forEach(function (v) { var y = y0 - (y0 - y1) * v / 100; s.appendChild(el("line", { x1: x0, x2: x1, y1: y, y2: y, stroke: "#eee" })); s.appendChild(txt(x0 - 14, y + 4, fa(v), { "font-size": 9 })); });
    if (!ms.length) { s.appendChild(txt(W / 2, H / 2, "هنوز پاسخی برای روند نیست", { fill: "#999" })); return s; }
    ms.forEach(function (mm, i) { var x = ms.length > 1 ? x0 + (x1 - x0) * i / (ms.length - 1) : (x0 + x1) / 2; s.appendChild(txt(x, H - 20, mm.slice(2).replace("-", "/"), { "font-size": 9 })); });
    var COL = ["#0f766e", "#b45309", "#7c3aed", "#be123c", "#1d4ed8", "#4d7c0f", "#475569"];
    m.dims.forEach(function (d, k) {
      var pts = []; d.months.forEach(function (x) { var i = ms.indexOf(x.m); if (i < 0 || x.acc == null) return; pts.push([ms.length > 1 ? x0 + (x1 - x0) * i / (ms.length - 1) : (x0 + x1) / 2, y0 - (y0 - y1) * x.acc / 100]); });
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
    s.appendChild(txt(W / 2, 20, "کالیبراسیون: اطمینانِ تو ↔ درستیِ واقعی", { "font-size": 13, "font-weight": 700 }));
    var x0 = 40, x1 = W - 20, y0 = H - 40, y1 = 40;
    s.appendChild(el("line", { x1: x0, y1: y0, x2: x1, y2: y1, stroke: "#ccc", "stroke-dasharray": "4 3" }));
    s.appendChild(txt((x0 + x1) / 2, H - 12, "اطمینان", { "font-size": 10 })); s.appendChild(txt(16, (y0 + y1) / 2, "درستی", { "font-size": 10 }));
    // محورها با عدد (کارزارِ آزمون sc09: نمودار عدد نداشت)
    s.appendChild(el("line", { x1: x0, y1: y0, x2: x1, y2: y0, stroke: "#999" })); s.appendChild(el("line", { x1: x0, y1: y0, x2: x0, y2: y1, stroke: "#999" }));
    [0, 50, 100].forEach(function (v) {
      s.appendChild(txt(x0 + (x1 - x0) * v / 100, y0 + 14, A.fa(v) + "٪", { "font-size": 9, fill: "#666" }));
      s.appendChild(txt(x0 - 14, y0 - (y0 - y1) * v / 100 + 3, A.fa(v) + "٪", { "font-size": 9, fill: "#666" }));
    });
    for (var i = 0; i < 10; i++) {
      var bin = all.filter(function (c) { return Math.min(9, Math.floor(c.p * 10)) === i; }); if (!bin.length) continue;
      var acc = bin.filter(function (c) { return c.ok; }).length / bin.length, cx = x0 + (x1 - x0) * (i + 0.5) / 10, cy = y0 - (y0 - y1) * acc;
      s.appendChild(el("circle", { cx: cx, cy: cy, r: Math.min(14, 3 + Math.sqrt(bin.length) * 2), fill: bin.length >= MIN_N ? "rgba(29,78,216,.6)" : "rgba(148,163,184,.6)" }));
    }
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
    dims.forEach(function (d) { var p = P["d" + d.id]; s.appendChild(el("circle", { cx: p[0], cy: p[1], r: 10 + (d.score || 0) / 12, fill: d.score == null ? "#e2e8f0" : "#0f766e" })); s.appendChild(txt(p[0] - 22, p[1] + 4, d.fa.split(/[،,]| و /)[0], { "text-anchor": "end", direction: "ltr", "font-size": 10 })); });
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
    dims.forEach(function (d) { var p = pos[d.id]; s.appendChild(el("circle", { cx: p[0], cy: p[1], r: 14, fill: d.score == null ? "#e2e8f0" : "#99f6e4", stroke: "#0f766e" })); s.appendChild(txt(p[0], p[1] - 18, d.fa.split(/[،,]| و /)[0], { "font-size": 10 })); });
    outer.forEach(function (o) { var p = P[o.it.id]; s.appendChild(el(o.it.t === "tour" ? "rect" : "circle", o.it.t === "tour" ? { x: p[0] - 6, y: p[1] - 6, width: 12, height: 12, fill: col[o.it.st] || "#94a3b8" } : { cx: p[0], cy: p[1], r: 6, fill: col[o.it.st] || "#94a3b8" })); s.appendChild(txt(p[0], p[1] + 16, String(o.it.fa).slice(0, 20), { "font-size": 8 })); });
    return s;
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
    root.appendChild(A.head("نقشه‌ها", "🧠 کارنامهٔ ذهن", "یک نگاه به هفت بُعدِ ذهنت از روی دادهٔ خودت — دقت، کالیبراسیون، ماندگاری و بازشدنِ گره‌ها — با نقطه‌های سیاه، روند، شبکه و مسیرهای پیشِ رو. هر عدد اندازهٔ نمونه‌اش را دارد؛ زیرِ " + fa(MIN_N) + " نمونه عدد داده نمی‌شود."));
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
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "کارنامهٔ هر بُعد"), h("table", { class: "mind-table small" },
      h("thead", {}, h("tr", {}, ["حوزهٔ زندگی", "احتمالِ درستیِ پاسخِ بعدی", "پاسخ‌ها (درست از کل)", "احتمالِ بیش‌اطمینانی", "ماندگاری (درست از کل)", "گره‌های ورزیده", "احتمالِ پیشرفت"].map(function (x) { return h("th", {}, x); }))),
      h("tbody", {}, m.dims.map(function (d) {
        var E = d.est || { n: 0 };
        function cell(v, n) { return h("td", { title: "نمونه: " + fa(n) }, v == null ? "— (" + fa(n) + ")" : fa(v) + " (" + fa(n) + ")"); }
        /* بُعدِ «داوریِ معرفتی» ⇒ پرونده‌های کارخانه (همان‌جا که این عددها از آن می‌آیند) */
        return h("tr", { "data-dim": d.id }, h("td", {}, d.id === "s_epi" ? h("button", { class: "linkish mind-dim-epi", type: "button", title: "پرونده‌های سنجش در کارخانهٔ معرفت‌شناسی", onclick: function () { A.go("e_cases"); } }, d.fa + " ↗") : d.fa), h("td", {}, E.n ? A.PSY.pctFa(E.next) + " (" + fa(E.n) + ")" : "— (هنوز پاسخی نیست)"), h("td", {}, fa(E.k || 0) + " از " + fa(E.n || 0)),
          h("td", { title: E.calN ? "میانگینِ اطمینان " + fa(Math.round(100 * E.meanConf)) + "٪" : "" }, E.calN ? A.PSY.pctFa(E.pOver) + " (" + fa(E.calN) + ")" : "— (اطمینانی ثبت نشده)"),
          h("td", {}, fa(d.ret.ok) + " از " + fa(d.ret.n)), h("td", {}, fa(d.knots.practised || 0) + " از " + fa(d.knots.all)),
          h("td", {}, E.progress ? A.PSY.pctFa(E.progress.p) + " (" + fa(E.progress.from) + " ← " + fa(E.progress.to) + ")" : "— (کمتر از دو ماهِ سنجیده)"));
      })))));
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
        (c.id === "META" && e.calN ? " · احتمالِ بیش‌اطمینانی " + pc(e.pOver) : "") + (p.n ? " · بالاتر از میانهٔ " + p.peers + ": " + pc(p.pAbove) : " · مقایسه با مردم: هنوز معمای لنگرداری جواب داده نشده"));
    });
    L.push("## حوزه‌های زندگی");
    M.dims.forEach(function (d) { var E = d.est || { n: 0 };
      L.push("- " + (d.fa || d.id) + ": پاسخِ بعدی " + (E.n ? pc(E.next) + " (" + E.k + "/" + E.n + ")" : "—") + (E.calN ? " · احتمالِ بیش‌اطمینانی " + pc(E.pOver) : "") + " · ماندگاری " + d.ret.ok + "/" + d.ret.n + " · گره‌های ورزیده " + (d.knots.practised || 0) + "/" + d.knots.all + (E.progress ? " · احتمالِ پیشرفت " + pc(E.progress.p) : ""));
    });
    if ((M.black || []).length) L.push("نقطه‌های سیاه: " + M.black.slice(0, 6).map(function (b) { return b.fa || b.t || ""; }).join(" · "));
    return L.join("\n");
  });
})(APP);
