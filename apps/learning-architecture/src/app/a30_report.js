/* ===== «📧 گزارشِ تور» — گزارشِ شکیل و دقیقِ هر تور به ایمیلِ مالک، در حینِ کار (مالک ۲۰۲۶-۱۰-۱۴) =====
   مالک: «نتیجهٔ تور در حینِ کار از طریقِ اپشنِ داخلِ برنامه ایمیل شود — برای هر مسئله چطور شد، از کجا عبور کرد، به کجا رفت …
   به صورتِ گزارشِ شکیل؛ برای تورهای بعدی که خودم می‌روم هم؛ و کارنامهٔ نقشهٔ ذهن با همهٔ نمودارها و شبکه و گراف و روندها».
   - رویدادها: طرحِ تور، کامل‌شدنِ هر وجه، پیگیریِ برگه (ناقص/درست)، طیِ ترتیب، تسلطِ کامل ⇒ گزارش (رویدادهای نزدیک به هم یکی می‌شوند).
   - متن: HTML ِ ایمیل‌پسند (جدول و سبکِ درون‌خطی، راست‌به‌چپ) + متنِ ساده؛ نمودارهای کارنامهٔ ذهن PNG ِ درون‌خطی (cid).
   - گذرگاه: HOST.mail ⇒ POST /api/app-records/{app}/report-email (Gmail ِ متصل یا SMTP)؛ وضعِ واقعی در s.tour.mails.
   - تنظیم: «📧» در کشوی تور (پیش‌فرض روشن وقتی میزبان ایمیل دارد) و «👁 پیش‌نمایش» بی میزبان هم کار می‌کند. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, AS = A.ASSIST;
  if (!AS) return;
  var R = A.REPORT = {}; R.URGENT_MS = 90000; R._pend = {};
  /* آهنگِ ایمیل (کارزارِ سوم v04: ۶ ایمیل در ۲۵ دقیقه برای یک تور): ایمیلِ خودکار فقط برای رویدادِ معنادار (طرحِ تور، برپاشدنِ وجه،
     برگه، بازشدنِ دوباره، طیِ ترتیب، تسلط) و پس از نخستین ایمیل حداکثر یکی در هر ۳ ساعت؛ رویدادهای میانه جمع می‌شوند و با بعدی می‌روند.
     «الان بفرست» ِ مالک (force) همیشه می‌فرستد. */
  R.MIN_GAP_MS = 3 * 3600000;
  var GAP_MS = 5 * 60000, BIG = /^(plan|facet|done|mastered|sheet|reopen|safety)$/;
  function nowIso() { return A.nowISO(); }
  /* ایمیل بی کد (مالک ۲۰۲۶-۱۰-۱۴: «جاهایی کدگذاری‌شده حرف می‌زند — f7 و … — نباید باشد»): کلیدِ وجه ⇒ نامِ وجه، خانوادهٔ گره ⇒ نامش،
     شناسهٔ حوزه ⇒ نامِ حوزه، کلید/شناسهٔ رکورد ⇒ حذف، واژه‌های فنیِ برگه ⇒ فارسی */
  var CUR = null, WORDS = { "sys-territory": "قلمروِ سامانه‌ها", "epi-territory": "قلمروِ معرفت‌شناسی", "epi-backtest": "بک‌تستِ معرفت‌شناسی", "epi-engine": "موتورِ داوری", "lla-page": "خودِ صفحه",
    deferred: "به بعد موکول شد", priority: "اولویت‌دار", prereq: "دانشِ پیش‌نیاز", kcase: "موقعیتِ گره‌گشا", eprob: "مسئلهٔ بزرگ", wchain: "زنجیرهٔ نگرانی", fcast: "پیش‌بینی", kexp: "آزمایشِ واقعی", kitem: "ورزشِ گره", pbitem: "مسئلهٔ هم‌ساختار", knot: "گرهِ ذهنی", claim: "سنجشِ ادعا", area: "حوزهٔ قلمرو", learn: "فهمیدنِ عمیق", problem: "مسئلهٔ بزرگ", territory: "حوزهٔ نبوده", fix: "رفعِ خطا", done: "انجام شد", answered: "پاسخ داده شد", supervisor: "نظارت" };
  function human(x) {
    var t = String(x == null ? "" : x);
    if (CUR && CUR.tour) t = t.replace(/\[?\b(f\d{1,2})\b\]?/g, function (m0, k) { var f = CUR.tour.facets.filter(function (z) { return z.key === k; })[0]; return f ? "«" + f.title + "»" : ""; });
    t = t.replace(/\b(F\d{1,2})(?:\.[a-z]+)?\b/g, function (m0, k) { var F = (A.KF || []).filter(function (z) { return z.id === k; })[0]; return F ? "«" + F.fa + "»" : m0; });
    t = t.replace(/\b(?:ln|md|pr|dc|sc|sf|a)_[a-z0-9_]+\b/g, function (m0) { var x0 = A.SYST && (A.SYST.byId ? A.SYST.byId(m0) : A.SYST.find(m0)); return x0 ? "«" + x0.a.fa + "»" : m0; });
    t = t.replace(/\b(?:kc|kcase|knot|case|kexp|kitem|pbitem|fc|wc|vl|mn|tp|ex|eprob|achat|rep|pq)_[A-Za-z0-9]+\b/g, "").replace(/\bk\d{1,3}\b/g, "").replace(/\(?\b(?:sub|view|arg|tab)=[A-Za-z0-9_:.-]+\)?/g, "");
    t = t.replace(/\b(sys-territory|epi-territory|epi-backtest|epi-engine|lla-page|deferred|priority|answered|supervisor|prereq|kcase|eprob|wchain|fcast|kexp|kitem|pbitem|knot|claim|area|learn|problem|territory)\b/g, function (w) { return WORDS[w] || w; });
    // متنِ وارسی‌کنندهٔ برگه شناسهٔ نما و اصطلاحِ فنی دارد (کارزارِ سوم v02: «view:negprep»، «VIEW_META»، «رجیستریِ حوزه» در ایمیل)
    t = t.replace(/\bview:([a-z][a-z0-9_]*)\b/g, function (m0, v) { var M = A.VIEW_META && A.VIEW_META[v], nv = (A.NAV || []).concat(A.EPI_NAV || []).filter(function (n) { return Array.isArray(n) && n[0] === v; })[0]; return nv ? "نمای «" + nv[1] + "»" : M ? "نمای «" + String(M.what || "").split(/[:،.]/)[0] + "»" : "یک نمای صفحه"; });
    t = t.replace(/\bVIEW_META\b/g, "توضیحِ نما برای دستیار").replace(/رجیستری(?:ِ)?/g, "فهرستِ ثبتِ").replace(/\b(?:APP|A)\.[A-Za-z_.]+/g, "").replace(/\b[a-z]+_[a-z0-9_]+\.js\b/g, "کدِ صفحه");
    // شمارهٔ بخشِ جزوه یا دفترچه («(§۸)»، «§6») برای مالک معنا ندارد (کارزارِ v07: «قلمرو معرفت‌شناسی (§۸)» در ایمیل)
    t = t.replace(/\s*\(?§\s*[0-9۰-۹]+(?:[.٫][0-9۰-۹]+)?\)?/g, "");
    return t.replace(/\s{2,}/g, " ");
  }
  R.human = function (s, x) { var o = CUR; CUR = s; try { return human(x); } finally { CUR = o; } };
  function esc(x) { return human(x).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  // بُرش پیش از پرانتز/گیومهٔ نیمه‌باز، تا «… (فیزیک › نسبی…» نشود (کارزارِ آزمونِ دوم c14)
  function clip(x, n) {
    x = String(x || "").replace(/\s+/g, " ").trim(); if (x.length <= n) return x;
    var c = x.slice(0, n - 1), o = Math.max(c.lastIndexOf("("), c.lastIndexOf("«"));
    if (o > n / 3 && c.indexOf(c.charAt(o) === "(" ? ")" : "»", o) < 0) c = c.slice(0, o);
    return c.replace(/[\s،,—\-–]+$/, "") + "…";
  }
  R.enabled = function () { var t = (S.settings().tour || {}); return t.mail == null ? !!(A.HOST && A.HOST.mail) : !!t.mail; };
  R.setEnabled = function (on) { var st = S.settings(); st.tour = st.tour || {}; st.tour.mail = !!on; if (S.saveSettings) S.saveSettings(st); else S.put && S.put(st); };

  /* ---------- مسیرِ عبور: هر بار که صفحه در سشنِ تور‌دار رسم شد و نما عوض شده بود ---------- */
  var rawRender = A.render;
  A.render = function () {
    rawRender.apply(this, arguments);
    /* تورِ پولیا دورِ ۲ (rerunC s22/s26: پس از «✓ پایهٔ وجه برپا شد» ایمیلی نیامد): سقفِ «یک ایمیل در ۳ ساعت» (تصمیمِ پیشین) می‌ماند، ولی ایمیلِ
       نقطهٔ عطف در صف گم نمی‌شود — زمان‌سنجِ setTimeout با بستنِ صفحه می‌میرد؛ پس هر رسمِ صفحه صفِ معنادار را وارسی می‌کند و پس از مهلت می‌فرستد */
    try { var s0 = AS.cur(); if (s0 && s0.tour && (s0.tour.mailq || []).some(function (e) { return BIG.test(e.k); }) && !R._pend[s0.id] && !R._busy) R.flush(s0, true); } catch (e) { }
    try {
      var s = AS.cur(); if (!s || !s.tour || s.tour.masteredAt) return;
      var tr = s.trail = s.trail || [], v = A.state.view, key = v + "|" + (A.state.arg || "") + "|" + (A.state.sub || "");
      if (tr.length && tr[tr.length - 1].k === key) return;
      var sf = subFa(A.state.sub);
      tr.push({ k: key, at: nowIso(), v: v, label: (AS.labelOf ? AS.labelOf(v) : v) + (sf ? " · " + sf : "") });
      if (tr.length > 300) s.trail = tr.slice(-300);
    } catch (e) { }
  };

  /* ---------- رویدادها: از تغییرِ وضعِ تور ---------- */
  /* نتیجهٔ واقعیِ تمرین‌ها (کارزارِ آزمون sc04: ایمیل فقط «ساخته شد» می‌گفت، نه «چقدر درست») — از تاریخچهٔ خودِ رکوردها */
  function scores(f) {
    if (f.status === "skipped" || !AS.tourChildren) return [];
    var c = AS.tourChildren(f), out = [];
    function tally(items, label) { var n = 0, ok = 0, days = {}; items.forEach(function (it) { (it.hist || []).forEach(function (e) { if (typeof e.ok !== "boolean") return; n++; if (e.ok) ok++; days[String(e.at || e.d || "").slice(0, 10)] = 1; }); }); if (n) out.push(label + ": " + fa(ok) + " درست از " + fa(n) + " پاسخ در " + fa(Object.keys(days).filter(Boolean).length) + " روز"); }
    tally(c.kitem || [], "ورزشِ گره");
    tally((c.pbitem || []).filter(function (x) { return A.pbServable ? A.pbServable(x) : true; }), "هم‌ساختارها");
    (c.eprob || []).forEach(function (r) {
      var pg = r.p && S.get("eprog_" + r.p.id), n = r.p && (r.p.stages || []).length; if (!pg || !n) return;
      Object.keys(pg.lv || {}).sort().forEach(function (l) { var L = pg.lv[l] || {}, ks = Object.keys(L); if (!ks.length) return; var ok = ks.filter(function (k) { return L[k].first === true || L[k].self === 2; }).length;
        out.push("شبیه‌ساز سطحِ " + fa(l) + ": " + fa(ks.length) + " از " + fa(n) + " گام، " + fa(Math.round(100 * ok / ks.length)) + "٪ درست در بارِ اول"); });
    });
    var ex = (c.ex || []).filter(function (x) { return x.status === "done"; }); if (ex.length) out.push("تمرین‌های موضوع: " + fa(ex.length) + " انجام‌شده");
    return out;
  }
  R.scores = scores;
  function subFa(sub) {
    sub = String(sub || ""); if (!sub) return "";
    var m = /^s(\d+)$/.exec(sub); if (m) return "قدمِ " + fa(+m[1]);
    if (sub === "in") return "ثبتِ موقعیت"; if (/^ws:/.test(sub)) return "کاربرگ"; if (/^st_/.test(sub)) return "ایستگاه";
    return /[A-Za-z_:]/.test(sub) ? "" : sub;
  }
  function sfOf(t) { var d = (t.diag || {}).safety; return d ? d.st : ""; }
  function snap(t) { return { sf: sfOf(t), st: t.facets.map(function (f) { return f.key + ":" + f.status + ":" + ((f.blocked && f.blocked.checks) || []).length + ":" + AS.tourMilestones(f).filter(function (m) { return m.ok; }).length; }).join(","), done: !!t.doneAt, m: !!t.masteredAt,
    // کدام نشانه‌ها ✓ است (بی شمارهٔ پرانتزی) — تا ایمیل بگوید دقیقاً چه تازه شد یا دوباره باز شد (کارزارِ آزمون sc17: ماندگاریِ ۳۰ روزه و بازگشت گم بود)
    ms: (function () { var o = {}; t.facets.forEach(function (f) { o[f.key] = AS.tourMilestones(f).filter(function (m) { return m.ok; }).map(function (m) { return m.t.replace(/\s*\([^)]*\)\s*$/, ""); }); }); return o; })() }; }
  function events(s, before) {
    var t = s.tour, ev = [], b = before || { st: "", done: false, m: false };
    if (!before) ev.push({ k: "plan", fa: "تورِ تازه با " + fa(t.facets.length) + " وجه: " + t.facets.map(function (f) { return "«" + f.title + "»"; }).join("، ") });
    var old = {}; (b.st || "").split(",").forEach(function (x) { var p = x.split(":"); if (p[0]) old[p[0]] = { st: p[1], ck: +p[2] || 0, ok: +p[3] || 0 }; });
    t.facets.forEach(function (f) {
      var o = old[f.key];
      if (before && !o) ev.push({ k: "plan", fa: "وجهِ تازه: «" + f.title + "»" });
      if (o && o.st !== "done" && f.status === "done") ev.push({ k: "facet", fa: "✓ پایهٔ وجهِ «" + f.title + "» برپا شد" });
      if (o && o.st !== "blocked" && f.status === "blocked") ev.push({ k: "sheet", fa: "🛎 برای وجهِ «" + f.title + "» برگهٔ فوری #" + fa((f.blocked || {}).number) + " ثبت شد" });
      // موضوعِ ایمیل کوتاه و بی اصطلاحاتِ داخلی؛ دلیلِ فنی فقط در متن (کارزارِ آزمون: موضوع‌ها «deferred»، «sf_values گامِ ۰» داشتند)
      var ck = ((f.blocked && f.blocked.checks) || []); if (o && ck.length > o.ck) { var c = ck[ck.length - 1]; ev.push({ k: "sheet", fa: c.ok ? "✅ آنچه برای «" + f.title + "» کم بود ساخته شد" : c.lag ? "⏳ ساخته‌شدنِ «" + f.title + "» هنوز دیده نمی‌شود" : "↩ ساختِ «" + f.title + "» هنوز درست نیست؛ پیگیری کردم", detail: clip(c.reason, 300) }); }
      var okN = AS.tourMilestones(f).filter(function (m) { return m.ok; }).length;
      // آخرین وضعِ ثبت‌شده (پس از نوبتِ پیش) — تا تغییرِ بیرون از نوبت هم (مثلاً «↩ دوباره پیش آمد») دیده شود
      var was = (t.lastMs || b.ms || {})[f.key], now = AS.tourMilestones(f).filter(function (m) { return m.ok; }).map(function (m) { return m.t.replace(/\s*\([^)]*\)\s*$/, ""); });
      if (o && was && f.status !== "skipped") {
        now.filter(function (x) { return was.indexOf(x) < 0; }).forEach(function (x) { if (!(o.st !== "done" && f.status === "done")) ev.push({ k: "step", fa: "▲ «" + f.title + "»: " + x, detail: "✓ " + x }); });
        was.filter(function (x) { return now.indexOf(x) < 0; }).forEach(function (x) { ev.push({ k: "reopen", fa: "↩ «" + f.title + "»: «" + x + "» دوباره باز شد", detail: "این نشانه از روی داده‌ها دیگر برقرار نیست (مثلاً گره بازگشت) — دوباره سنجیده می‌شود" }); });
      } else if (o && f.status !== "skipped" && okN > (o.ok || 0) && !(o.st !== "done" && f.status === "done")) ev.push({ k: "step", fa: "▲ پیشرفت در «" + f.title + "» (" + fa(okN) + " نشانه)" });
    });
    // وضعِ لایهٔ ایمنی عوض شد (مثلاً ارجاع به پزشک ⇒ «بیرون از صفحه») ⇒ ایمیلِ تازه، تا آخرین ایمیل «باید پرسید» ِ کهنه نماند (کارزارِ سوم v03)
    if (before && (b.sf || "") !== sfOf(t) && sfOf(t)) ev.push({ k: "safety", fa: "🤝 «ایمنی و حال»: " + ({ found: "نشانه‌ای پیدا شد", no: "نشانه‌ای نیست", ask: "هنوز باید پرسید", out: "به کمکِ بیرون از صفحه ارجاع شد" }[sfOf(t)] || sfOf(t)) });
    if (!b.done && t.doneAt) ev.push({ k: "done", fa: "🎉 پایهٔ همهٔ وجه‌ها به ترتیب برپا شد (نشانه‌های مانده تا تسلط پیگیری می‌شوند)" });
    if (!b.m && t.masteredAt) ev.push({ k: "mastered", fa: "🏁 تور تا تسلطِ کامل تمام شد" });
    return ev;
  }
  R.note = function (s, before, noFlush) {
    if (!s || !s.tour) return;
    var ev = events(s, before); try { s.tour.lastMs = snap(s.tour).ms; } catch (e) { }
    if (ev.length) { s.tour.mailq = (s.tour.mailq || []).concat(ev.map(function (e) { e.at = nowIso(); return e; })).slice(-40); S.put(s); }
    // طرحِ تور پیش از کارهای همان نوبت ساخته می‌شود ⇒ فرستادن پس از نوبت (تا گزارش وضعِ واقعیِ پس از کارها را بگوید — کارزارِ آزمون)
    if (!noFlush && (s.tour.mailq || []).length) R.flush(s, (s.tour.mailq || []).some(function (e) { return BIG.test(e.k); }));
  };
  R.flush = function (s, urgent, force) {
    var t = s && s.tour; if (!t || !(t.mailq || []).length && !force) return Promise.resolve(null);
    if (!force && !R.enabled()) return Promise.resolve(null);
    if (!(A.HOST && A.HOST.mail)) return Promise.resolve(null);
    var last = Date.parse(t.mailAt || 0) || 0;
    if (!force && !urgent && A.nowMs() - last < GAP_MS) return Promise.resolve(null);
    var big = (t.mailq || []).some(function (e) { return BIG.test(e.k); });
    if (!force && !big) return Promise.resolve(null);   // فقط رویدادِ ریز ⇒ با رویدادِ معنادارِ بعدی می‌رود
    // پس از نخستین ایمیل: حداکثر یکی در هر R.MIN_GAP_MS؛ و رویدادهای مهمِ پشتِ‌هم یک ایمیل می‌شوند (کارزارِ آزمون sc15) — جا نمی‌مانند: پس از مهلت خودش می‌فرستد
    var safety = (t.mailq || []).some(function (e) { return e.k === "safety"; });   // تغییرِ وضعِ ایمنی منتظرِ ۳ ساعت نمی‌ماند
    var gap = last && !safety && (t.mails || []).some(function (m) { return m.status === "sent"; }) ? Math.max(R.MIN_GAP_MS, R.URGENT_MS) : last ? R.URGENT_MS : 0;
    if (!force && A.nowMs() - last < gap) {
      if (!R._pend[s.id]) R._pend[s.id] = setTimeout(function () { delete R._pend[s.id]; R.flush(s, true); }, Math.min(gap - (A.nowMs() - last) + 50, 2147483000));
      return Promise.resolve(null);
    }   // رویدادهای ریز جمع می‌شوند
    if (R._busy) return Promise.resolve(null); R._busy = true;
    var evs = (t.mailq || []).slice(); t.mailq = [];
    return R.build(s, evs).then(function (rep) { return Promise.resolve(A.HOST.mail(rep)).then(function (r) { return { r: r, rep: rep }; }); })
      .then(function (x) {
        var st = (x.r && x.r.status) || (x.r && x.r.ok ? "sent" : "failed");
        t.mailAt = nowIso(); (t.mails = t.mails || []).push({ at: t.mailAt, status: st, subject: x.rep.subject, events: evs.length }); t.mails = t.mails.slice(-60);
        if (st !== "sent") { t.mailq = evs.concat(t.mailq || []).slice(-40); }
        S.put(s); R._busy = false; return st;
      }, function (e) { t.mailq = evs.concat(t.mailq || []).slice(-40); (t.mails = t.mails || []).push({ at: nowIso(), status: "failed", error: String((e && e.message) || e).slice(0, 200) }); S.put(s); R._busy = false; return "failed"; });
  };
  /* رویدادها پس از هر نوبت و هر وارسیِ برگه */
  var rawAfter = AS.tourAfterTurn;
  AS.tourAfterTurn = function (s) { var had = s && s.tour, b = had ? snap(s.tour) : null; var r = rawAfter.apply(this, arguments); try { if (s && s.tour) R.note(s, had && s.tour.facets.length ? b : null); } catch (e) { console.error(e); } return r; };
  var rawCheck = AS.tourCheckSheets;
  AS.tourCheckSheets = function (s) { var b = s && s.tour ? snap(s.tour) : null; return rawCheck.apply(this, arguments).then(function (x) { try { if (b) R.note(s, b); } catch (e) { } return x; }); };
  /* طرحِ نخستِ تور (پیش از tourAfterTurn ساخته می‌شود) */
  var rawPlan = AS.DO.tour_plan;
  AS.DO.tour_plan = function (a) { var s = AS._turnSession, had = !!(s && s.tour), b = had ? snap(s.tour) : null; var r = rawPlan.apply(this, arguments); try { if (s && s.tour) R.note(s, b, true); } catch (e) { } return r; };

  /* ---------- ساختنِ گزارش ---------- */
  var KIND = AS.tourKinds || {};
  var ST_FA = { todo: "مانده", now: "در جریان", done: "انجام شد", blocked: "منتظرِ ساختِ حوزه", skipped: "کنار گذاشته شد" };
  // «انجام شد» فقط وقتی همهٔ نشانه‌ها ✓ است؛ وگرنه «پایه برپا شد · x از y» (کارزارِ آزمونِ دوم c14: «انجام شد» با ۴ از ۸ نشانه)
  function stFa(f) {
    if (f.status !== "done") return ST_FA[f.status] || f.status;
    var ms = AS.tourMilestones(f), ok = ms.filter(function (x) { return x.ok; }).length;
    return ok === ms.length ? "انجام شد" : "پایه برپا شد · " + fa(ok) + " از " + fa(ms.length) + " نشانه";
  }
  var C = { ink: "#1f2937", mute: "#6b7280", line: "#e5e7eb", ok: "#047857", warn: "#b45309", bad: "#b91c1c", head: "#0f766e", soft: "#f0fdfa" };
  function sec(title, inner) { return '<tr><td style="padding:18px 22px 6px;font-size:17px;font-weight:700;color:' + C.head + ';border-top:1px solid ' + C.line + '">' + title + '</td></tr><tr><td style="padding:4px 22px 14px;font-size:14px;line-height:1.9;color:' + C.ink + '">' + inner + "</td></tr>"; }
  // آزمایشِ واقعی «plan» دارد، موقعیتِ گره‌گشا «intake.what» (کارزارِ آزمونِ دوم c19: «»…«» ِ خالی در ایمیل)
  function recTitle(r) { var x = S.get(r.id); if (!x) return ""; return x.title || x.name || x.q || x.plan || x.predict || x.note || x.statement || (x.intake && (x.intake.what || x.intake.statement)) || (x.p && x.p.title) || ""; }
  var TYPE_FA = { kcase: "موقعیتِ گره‌گشا", knot: "گره", "case": "پروندهٔ سنجش", eprob: "مسئلهٔ بزرگ", topic: "موضوع", fcast: "پیش‌بینی", wchain: "زنجیرهٔ نگرانی", kexp: "آزمایشِ واقعی", ex: "کاربرگ", value: "ارزش", meaning: "وارسیِ معنا", prereq: "نقشهٔ پیش‌نیازها" };
  R.build = function (s, evs) {
    CUR = s;
    var t = s.tour, title = s.title || s.pinned || t.goal || "تور", m = A.MIND ? A.MIND.model() : null;
    var charts = m ? A.MIND.charts(m) : {}, names = [["radar", "نیم‌رخِ هفت بُعد"], ["trend", "روندِ ماهانه"], ["calib", "کالیبراسیون"], ["mindmap", "نقشهٔ کاملِ ذهن"], ["neural", "شبکهٔ ذهن"]];
    var imgs = [];
    var chain = Promise.resolve();
    names.forEach(function (n) { chain = chain.then(function () { if (!charts[n[0]]) return; return A.MIND.png(charts[n[0]]).then(function (d) { if (d) imgs.push({ cid: "mind_" + n[0], data: d, fa: n[1] }); }); }); });
    // نمودارِ پیشرفتِ همین تور (نشانه‌های ✓ در زمان) — همان که کشو نشان می‌دهد (کارزارِ سوم v06)
    var tch = AS.tourChart ? AS.tourChart(s, { w: 560, h: 150 }) : null, tImg = null;
    if (tch && A.MIND && A.MIND.png) chain = chain.then(function () { return A.MIND.png(tch).then(function (d) { if (d) { tImg = { cid: "tour_prog", data: d, fa: "پیشرفتِ تور در زمان" }; imgs.push(tImg); } }); });
    return chain.then(function () {
      // وجهِ کنارگذاشته نه «پیشرفت» است نه در مخرج (کارزارِ آزمون sc08: «۳ از ۶» با یک وجهِ تهیِ کنارگذاشته)
      var live = t.facets.filter(function (f) { return f.status !== "skipped"; }), done = live.filter(function (f) { return f.status === "done"; }).length;
      // شمارِ صادقِ نشانه‌ها کنارِ «پایه برپا شد» (کارزارِ آزمون c10: «۳ از ۴ وجه» در حالی که نشانه‌ها ۲/۳، ۵/۸، ۲/۴ بود)
      var msOk = 0, msAll = 0; live.forEach(function (f) { AS.tourMilestones(f).forEach(function (m) { msAll++; if (m.ok) msOk++; }); });
      var H = [];
      H.push('<!doctype html><html dir="rtl" lang="fa"><head><meta charset="utf-8"></head><body style="margin:0;background:#f3f4f6"><table role="presentation" dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;font-family:Tahoma,Vazirmatn,Arial,sans-serif"><tr><td align="center" style="padding:16px">');
      H.push('<table role="presentation" width="680" cellpadding="0" cellspacing="0" dir="rtl" style="max-width:680px;width:100%;background:#fff;border-radius:12px;overflow:hidden;text-align:right">');
      H.push('<tr><td style="background:' + C.head + ';color:#fff;padding:20px 22px"><div style="font-size:13px;opacity:.85">معماری یادگیری عمیق · 🧭 گزارشِ تور · ' + esc(A.fdate ? A.fdate(A.today()) : A.today()) + '</div><div style="font-size:22px;font-weight:700;margin-top:6px">' + esc(title) + '</div><div style="font-size:14px;margin-top:6px;opacity:.95">' + esc(t.goal || s.pinned || "") + '</div><div style="font-size:13px;margin-top:8px">پایهٔ ' + fa(done) + " از " + fa(live.length) + " وجه برپا شد · نشانه‌های حل‌شدن: " + fa(msOk) + " از " + fa(msAll) + (live.length < t.facets.length ? " (" + fa(t.facets.length - live.length) + " کنار گذاشته)" : "") + (t.masteredAt ? " · 🏁 تا تسلط کامل شد" : t.doneAt ? " · ترتیب طی شد؛ پیگیری تا تسلط" : "") + "</div></td></tr>");
      if (AS.safetyActive ? AS.safetyActive(s) : s.safetyAt) H.push('<tr><td style="padding:14px 22px;background:#fff7ed;font-size:14px;line-height:1.9;color:' + C.ink + '"><b>🤝 پیش از هر چیز</b><br>در این گفت‌وگو از حالِ سختی گفتی. اگر امروز هم سخت است، همین حالا با یک نفرِ نزدیک یا یک متخصص حرف بزن.<br><span style="color:' + C.mute + '">' + esc(A.KHELP || "") + "</span><br>(به خاطرِ حریمِ خصوصی، متنِ گفت‌وگو در این ایمیل نمی‌آید.)</td></tr>");
      /* نتیجه در یک نگاه: آنچه واقعاً رخ داد، از خودِ داده‌ها (کارزارِ آزمونِ دوم c16/c17: هیچ ایمیلی صریح نمی‌گفت «خودت حل کردی») */
      var outc = []; try { live.forEach(function (f) { var c = AS.tourChildren ? AS.tourChildren(f) : {};
        (c.kcase || []).forEach(function (kc) {
          var L = kc.ladder || {}; if (L.opened != null && L.opened >= 0) outc.push("خودت گره را باز کردی" + (L.opened > 0 ? " (پس از راهنماییِ پلهٔ " + fa(L.opened) + ")" : " (بی راهنمایی)") + " — «" + clip((kc.intake && kc.intake.what) || f.title, 50) + "»");
          if (kc.root && kc.root.confirmed) { var k = S.get((kc.knots || [])[0]); outc.push("ریشه را خودت تأیید کردی" + (k && k.name ? ": «" + clip(k.name, 50) + "»" : "") + (k && k.status === "returned" ? " — همان گرهِ پیشین، بازگشته" : "")); }
        });
        (c.prereq || []).forEach(function (pq) { var k = A.prereqState ? A.prereqState(pq) : null; if (k && k.n) outc.push("نقشهٔ پیش‌نیازها: " + fa(k.n) + " مفهوم، " + fa(k.miss.length) + " تا را نداشتی" + (pq.back ? " — بازگشت به خودِ مسئله: " + pq.back : " — هنوز به خودِ مسئله برنگشته‌ای")); });
        scores(f).forEach(function (x) { outc.push(x); });
      }); } catch (e) { }
      outc = outc.filter(function (x, i, a) { return a.indexOf(x) === i; });
      if (outc.length) H.push(sec("🎯 نتیجه در یک نگاه", "<ul style=\"margin:0;padding-right:18px\">" + outc.slice(0, 8).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"));
      if ((evs || []).length) H.push(sec("🆕 آنچه تازه شد", "<ul style=\"margin:0;padding-right:18px\">" + evs.map(function (e) { return "<li>" + esc(e.fa) + (e.detail ? '<div style="color:' + C.mute + ';font-size:12px">' + esc(e.detail) + "</div>" : "") + "</li>"; }).join("") + "</ul>"));
      /* نقشهٔ راه */
      var rows = t.facets.map(function (f, i) {
        var ms = AS.tourMilestones(f), ok = ms.filter(function (x) { return x.ok; }).length, col = f.status === "done" ? C.ok : f.status === "blocked" ? C.warn : f.status === "now" ? C.head : C.mute;
        return '<tr><td style="padding:6px;border-bottom:1px solid ' + C.line + '">' + fa(i + 1) + '</td><td style="padding:6px;border-bottom:1px solid ' + C.line + '">' + esc(((KIND[f.kind] || {}).ic || "") + " " + f.title) + '<div style="color:' + C.mute + ';font-size:12px">' + esc((KIND[f.kind] || {}).fa || "") + '</div></td><td style="padding:6px;border-bottom:1px solid ' + C.line + ';color:' + col + ';white-space:nowrap">' + esc(stFa(f)) + '</td><td style="padding:6px;border-bottom:1px solid ' + C.line + ';white-space:nowrap">' + fa(ok) + "/" + fa(ms.length) + "</td></tr>";
      }).join("");
      H.push('<tr><td style="padding:10px 22px;font-size:12px;line-height:1.9;color:' + C.mute + '">واژه‌ها: <b>وجه</b> = یکی از بخش‌های مسئله‌ات که جدا پیگیری می‌شود · <b>پایه برپا شد</b> = ابزار و تمرینش ساخته شد، ولی هنوز «حل‌شده» نیست · <b>غربال</b> = لایه‌هایی که دستیار برای پیدا کردنِ ریشه سنجید · <b>لایه</b> = یک پرسشِ ثابتِ غربال (مثلاً «ایمنی و حال» یا «باور دربارهٔ خود») که جدا سنجیده می‌شود · <b>سازه</b> = یک توانِ ذهنیِ سنجیدنی در کارنامه (مثلاً استدلال یا حافظه) · <b>ماندگاری</b> = پاسخِ درستِ دوباره پس از ۳۰ و ۹۰ روز.</td></tr>');
      H.push(sec("🗺 نقشهٔ راه و ترتیب", '<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse"><tr style="color:' + C.mute + ';font-size:12px"><td style="padding:6px">#</td><td style="padding:6px">وجه</td><td style="padding:6px">وضع</td><td style="padding:6px">نشانه‌ها</td></tr>' + rows + "</table>"));
      /* غربالِ لایه‌ها: کدام لایه‌ها سنجیده شد و چه پیدا شد — فقط یافته‌ها، «باید پرسید» و «بیرون»؛ «رد شد» ها شمرده می‌شوند (مالک ۲۰۲۶-۱۰-۱۴) */
      // نشانهٔ پریشانی فعال ⇒ شاهدِ لایه‌ای که جملهٔ پریشانی را نقل می‌کند در ایمیل نمی‌آید (همان قاعدهٔ پنهان‌ماندنِ گفت‌وگو)
      var sact = AS.safetyActive ? AS.safetyActive(s) : !!s.safetyAt;
      if (AS.sieveRows) { var sr = AS.sieveRows(s), sn = sr.filter(function (r) { return r.st; }).length;
        if (sn) H.push(sec("🔍 غربالِ لایه‌ها (" + fa(sn) + " از " + fa(sr.length) + " لایه سنجیده شد)", sr.filter(function (r) { return r.st === "found" || r.st === "ask" || r.st === "out"; }).map(function (r) {
          return '<div style="margin:3px 0"><b style="color:' + (r.st === "found" ? C.ok : r.st === "ask" ? C.warn : C.mute) + '">' + (r.st === "found" ? "● پیدا شد" : r.st === "ask" ? "？ باید پرسید" : "↗ بیرون از صفحه") + "</b> — " + esc(r.fa) + (r.why && !(sact && (r.id === "safety" || (A.knotSafetyHit && A.knotSafetyHit(r.why)))) ? ": «" + esc(clip(String(r.why).replace(/^[«"\s]+|[»"\s]+$/g, ""), 200)) + "»" : "") + (r.facet ? " ⇒ وجهِ «" + esc(r.facet) + "»" : "") + "</div>";
        }).join("") + '<div style="color:' + C.mute + ';font-size:12px">' + fa(sr.filter(function (r) { return r.st === "no"; }).length) + " لایه سنجیده و رد شد؛ " + fa(sr.length - sn) + " لایه هنوز سنجیده نشده.</div>")); }
      /* جزئیاتِ هر وجه */
      t.facets.forEach(function (f, i) {
        var ms = f.status === "skipped" ? [] : AS.tourMilestones(f), pr = f.status === "skipped" ? [] : AS.tourPractice(f), b = f.blocked;
        var inner = (f.why ? '<div style="color:' + C.mute + '">چرا این‌جای ترتیب: ' + esc(f.why) + "</div>" : "") +
          '<ul style="margin:6px 0;padding-right:18px">' + ms.map(function (x) { return '<li style="color:' + (x.ok ? C.ok : C.ink) + '">' + (x.ok ? "✓ " : "○ ") + esc(x.t) + "</li>"; }).join("") + "</ul>" +
          ((f.refs || []).length ? "<div><b>رکوردها:</b> " + f.refs.map(function (r) { var tt = clip(recTitle(r), 50); return esc((TYPE_FA[r.type] || "رکورد") + (tt ? " «" + tt + "»" : "")); }).join("، ") + "</div>" : "") +
          (scores(f).length ? "<div><b>🎯 نتیجهٔ تمرین‌ها:</b> " + esc(scores(f).join("؛ ")) + "</div>" : "") +
          (pr.length ? "<div><b>📅 تمرین‌های زمان‌بندی‌شده:</b> " + pr.map(function (p) { return esc(p.t + " — " + (A.fdate ? A.fdate(p.due) : p.due)) + (p.overdue ? ' <span style="color:' + C.bad + '">(موعد)</span>' : ""); }).join("؛ ") + "</div>" : "") +
          (b ? '<div style="margin-top:6px;padding:8px;background:' + C.soft + ';border-radius:8px"><b>🛎 برگهٔ #' + fa(b.number) + "</b> (" + esc(b.area || "") + ") — " + (b.verified ? "ساخته و وارسی شد" : "منتظرِ روتینِ مسئول") +
            ((b.checks || []).length ? '<ol style="margin:4px 0;padding-right:18px">' + b.checks.map(function (c) { return "<li>" + esc((c.at || "").slice(0, 10)) + " — " + (c.ok ? "✅ درست: " : c.lag ? "⏳ شاید منتشر نشده: " : "↩ ناقص، با دلیل دوباره باز شد: ") + esc(clip(c.reason, 300)) + "</li>"; }).join("") + "</ol>" : "") + "</div>" : "") +
          (f.skipWhy ? "<div>کنار گذاشته شد: " + esc(f.skipWhy) + "</div>" : "");
        H.push(sec(fa(i + 1) + ") " + esc(((KIND[f.kind] || {}).ic || "") + " " + f.title) + ' <span style="font-size:13px;color:' + C.mute + '">— ' + esc(stFa(f)) + "</span>", inner));
      });
      /* پیشرفت در زمان و مسیرِ واقعیِ وجه‌ها (بی کد: نامِ وجه‌ها) */
      var pth = AS.tourPathText ? AS.tourPathText(s) : "", ser = AS.tourSeries ? AS.tourSeries(s) : [];
      if (pth || ser.length) H.push(sec("📈 پیشرفت در زمان و مسیرِ واقعی", (tImg ? '<div style="text-align:center"><img src="cid:tour_prog" alt="پیشرفتِ تور در زمان" style="max-width:100%;border:1px solid ' + C.line + ';border-radius:8px"></div>' : "") +
        (ser.length ? '<div style="color:' + C.mute + ';font-size:12px">' + ser.slice(-6).map(function (p) { return esc((A.fdate ? A.fdate(String(p.at).slice(0, 10)) : String(p.at).slice(0, 10)) + " " + String(p.at).slice(11, 16) + ": " + fa(p.n) + " از " + fa(p.all) + " نشانه"); }).join(" · ") + "</div>" : "") +
        (pth ? "<div><b>🚶 ترتیبِ واقعیِ وجه‌ها:</b> " + esc(pth) + "</div>" : "")));
      /* مسیرِ عبور */
      var tr = (s.trail || []).slice(-60);
      // کدهای خامِ قدم (in/s0/s1/ws:…) به فارسی یا حذف (کارزارِ آزمون sc16) — برای مسیرهای قدیمیِ ذخیره‌شده هم
      tr = tr.map(function (x) { var p = String(x.label || "").split(" · "); return { label: p[0] + (p[1] ? (subFa(p[1]) ? " · " + subFa(p[1]) : "") : "") }; }).filter(function (x, i, a) { return !i || a[i - 1].label !== x.label; });
      // رفت‌وبرگشتِ تکراری (الف ← ب ← الف ← ب …) یک بار با شمار (کارزارِ آزمون c06: همان دو قدم ۶ بار)
      var seen = {}, uniq = []; tr.forEach(function (x) { if (seen[x.label]) seen[x.label].n++; else { seen[x.label] = { label: x.label, n: 1 }; uniq.push(seen[x.label]); } });
      tr = uniq.map(function (x) { return { label: x.label + (x.n > 1 ? " (×" + fa(x.n) + ")" : "") }; });
      if (tr.length) H.push(sec("🚶 از کجا عبور کرد", tr.map(function (x) { return '<span style="white-space:nowrap">' + esc(x.label) + "</span>"; }).join(' <span style="color:' + C.mute + '">←</span> ')));
      /* گفت‌وگو */
      var msgs = (s.msgs || []).filter(function (x) { return x.role !== "sys" || /✓|🛎|✅|↩|🎉|🏁|⏳|↗|🤝/.test(x.text); }).slice(-40);
      if (msgs.length && !(AS.safetyActive ? AS.safetyActive(s) : s.safetyAt)) H.push(sec("💬 گفت‌وگو (فشرده)", msgs.map(function (x) { return '<div style="margin:4px 0"><b style="color:' + (x.role === "user" ? C.head : x.role === "ai" ? C.ink : C.warn) + '">' + (x.role === "user" ? "تو" : x.role === "ai" ? "دستیار" : "سامانه") + ":</b> " + esc(clip(x.text, 400)) + "</div>"; }).join("")));
      if ((s.outside || []).length && !(AS.safetyActive ? AS.safetyActive(s) : s.safetyAt)) H.push(sec("↗ بیرون از این صفحه", s.outside.map(function (o) { return "<div>" + esc(o.text) + "</div>"; }).join("")));
      /* کارنامهٔ ذهن */
      if (m) {
        /* بی «نمره/مرحله» ِ قراردادی (مالک ۲۰۲۶-۱۰-۱۵): همان احتمال‌های کارنامه (a34_psy) */
        var td = function (x) { return '<td style="padding:5px;border-bottom:1px solid ' + C.line + '">' + x + "</td>"; }, pc = function (p) { return fa(Math.round(100 * p)) + "٪"; };
        var tb = '<table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;border-collapse:collapse"><tr style="color:' + C.mute + '"><td style="padding:5px">سازه</td><td>احتمالِ درستیِ پاسخِ بعدی</td><td>احتمالِ پیشرفت</td><td>نسبت به مردم</td></tr>' +
          (m.psy || []).map(function (c) {
            if (c.none) return "<tr>" + td(esc(c.fa)) + '<td colspan="3" style="padding:5px;border-bottom:1px solid ' + C.line + ';color:' + C.mute + '">سنجیده نمی‌شود</td></tr>';
            var e = c.self, p = c.pop || { n: 0 };
            return "<tr>" + td(esc(c.fa)) + td(e.n ? pc(e.next) + ' <span style="color:' + C.mute + '">(' + fa(e.k) + " از " + fa(e.n) + ")</span>" : "—") +
              td(e.progress ? pc(e.progress.p) + ' <span style="color:' + C.mute + '">(' + fa(e.progress.from) + " ← " + fa(e.progress.to) + ")</span>" : "—") +
              td(p.n ? (p.none ? esc(A.PSY.popFa(p)) : "بالاتر از میانهٔ " + esc(p.peers) + ": " + pc(p.pAbove)) : "—") + "</tr>";
          }).join("") + "</table>";
        var black = m.black.length ? '<ul style="margin:6px 0;padding-right:18px">' + m.black.slice(0, 12).map(function (b) { return "<li>" + esc(b.fa) + "</li>"; }).join("") + "</ul>" : '<div style="color:' + C.mute + '">نقطهٔ سیاهی دیده نشد.</div>';
        var pics = imgs.map(function (im) { return '<div style="margin:12px 0;text-align:center"><div style="font-weight:700;margin-bottom:4px">' + esc(im.fa) + '</div><img src="cid:' + im.cid + '" alt="' + esc(im.fa) + '" style="max-width:100%;border:1px solid ' + C.line + ';border-radius:8px"></div>'; }).join("");
        /* فقط پیگیری‌های همین تور — نه همهٔ کارهای «امروز» ِ صفحه (بازیِ کارآگاهی و … ربطی به این گزارش ندارد) */
        var ahead = [];
        t.facets.forEach(function (f) { (AS.tourFollowups ? AS.tourFollowups(f) : []).slice(0, 2).forEach(function (x) { ahead.push({ fa: "«" + f.title + "»: " + x.t }); }); AS.tourPractice(f).forEach(function (p) { ahead.push({ fa: p.t + " — " + (A.fdate ? A.fdate(p.due) : p.due) }); }); });
        ahead = ahead.slice(0, 12);
        H.push(sec("🧠 کارنامهٔ ذهن", '<div style="color:' + C.mute + ';font-size:12px">هر عدد یک احتمال است که از دادهٔ خودِ تو و اصل‌های عقلی درمی‌آید، بی‌برشِ قراردادی. «پاسخِ بعدی» یعنی (درست+۱)/(کل+۲). مقایسه با مردم فقط با معماهایی است که دشواری‌شان در نمونهٔ بزرگی از مردم از منبعِ معتبر سنجیده شده. «ضریبِ هوشیِ کل» ساخته نمی‌شود.</div>' + tb +
          '<div style="margin-top:10px"><b>⚫ نقطه‌های سیاه</b></div>' + black + pics +
          (ahead.length ? '<div style="margin-top:8px"><b>🛤 مسیرهای پیشِ رو</b><ul style="margin:4px 0;padding-right:18px">' + ahead.map(function (x) { return "<li>" + esc(x.fa) + "</li>"; }).join("") + "</ul></div>" : "")));
      }
      var link = (location.protocol === "http:" || location.protocol === "https:") ? location.origin + "/apps/learning-architecture" : "";
      H.push('<tr><td style="padding:16px 22px;font-size:12px;color:' + C.mute + ';border-top:1px solid ' + C.line + '">این گزارش را «💬 دستیار» در حینِ تور خودکار ساخت.' + (link ? ' <a href="' + esc(link) + '" style="color:' + C.head + '">باز کردنِ صفحه</a>.' : "") + " برای خاموش‌کردن: «📧» در کشوی تور.</td></tr></table></td></tr></table></body></html>");
      var text = "گزارشِ تور: " + title + "\n" + (t.goal || "") + "\n\n" + (evs || []).map(function (e) { return "- " + e.fa; }).join("\n") + "\n\n" +
        (pth ? "مسیرِ واقعی: " + pth + "\n\n" : "") + t.facets.map(function (f, i) { return (i + 1) + ") " + f.title + " — " + stFa(f) + "\n" + AS.tourMilestones(f).map(function (x) { return "   " + (x.ok ? "✓ " : "○ ") + x.t; }).join("\n"); }).join("\n");
      var head = (evs || []).filter(function (e) { return BIG.test(e.k); })[0] || (evs || [])[0];
      return { subject: clip(human("🧭 تور «" + title + "»" + (head ? " — " + head.fa : "")), 190), html: H.join(""), text: human(text), images: imgs.map(function (im) { return { cid: im.cid, data: im.data }; }) };
    });
  };

  /* ---------- کشوی تور: «📧» و «👁 پیش‌نمایش» ---------- */
  var rawDrawer = AS.tourDrawer;
  AS.tourDrawer = function (s) {
    var box = rawDrawer.apply(this, arguments);
    var t = s.tour, last = (t.mails || []).slice(-1)[0];
    var cb = h("input", { type: "checkbox", checked: R.enabled() ? true : null, onchange: function (e) { R.setEnabled(e.target.checked); } });
    box.appendChild(h("div", { class: "small as-mail row gap wrap" },
      h("label", { class: "row gap" }, cb, A.HOST && A.HOST.mail ? "📧 گزارشِ تور با ایمیل" : "📧 گزارشِ ایمیلی (فقط در Lifemanager)"),
      A.HOST && A.HOST.mail ? h("button", { class: "linkish", type: "button", onclick: function () { R.flush(s, true, true).then(function (st) { A.toast(st === "sent" ? "گزارش فرستاده شد." : st === "skipped_unconfigured" ? "ایمیل روی سرور تنظیم نیست (Gmail ِ متصل یا SMTP)." : "فرستاده نشد (" + (st || "?") + ")", st === "sent" ? "" : "bad"); AS.paint(); }); } }, "الان بفرست") : null,
      h("button", { class: "linkish", type: "button", onclick: function () { R.preview(s); } }, "👁 پیش‌نمایش"),
      last ? h("span", { class: "muted" }, "آخرین: " + (last.status === "sent" ? "فرستاده شد" : last.status) + " · " + String(last.at).slice(0, 16).replace("T", " ")) : null));
    return box;
  };
  R.preview = function (s) {
    R.build(s, (s.tour.mailq || []).slice()).then(function (rep) {
      var html = rep.html; rep.images.forEach(function (im) { html = html.split("cid:" + im.cid).join(im.data); });
      var w = window.open("", "_blank"); if (w) { w.document.open(); w.document.write(html); w.document.close(); } else A.toast("پنجرهٔ پیش‌نمایش باز نشد (مسدودکنندهٔ پنجره).", "bad");
    });
  };
})(APP);
