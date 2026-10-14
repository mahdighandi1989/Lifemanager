/* ===== بک‌تست کارخانه: دادگاه، کتابخانه پرونده‌ها، کالبدشکافی، جزوه زنده، چرخه دوره‌ای ===== */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, X = window.EPIX, BT = window.EPI_BT, E = window.EPI;
  if (!X || !BT) return;
  var FM = window.EPI_FM, FEAT = window.EPI_FEAT;
  /* نام فارسی به جای شناسه‌ها در متن قاعده‌ها، پرونده‌ها و مسئله‌ها (فقط فیلدهای متنی؛ کلیدهای ساختاری دست نمی‌خورند) */
  (function () {
    var RN = {}; (window.EPI_RULES || []).forEach(function (r) { RN[r.id] = r.fa; });
    function dcr(t) { t = String(t).replace(/\br_[a-z0-9_]+\b/g, function (m) { return RN[m] ? "«" + RN[m] + "»" : window.EPI_FM[m] ? "«" + window.EPI_FM[m].fa + "»" : m; }).replace(/\b(r_[a-z_]+?)_?\*/g, function (m, p) { return "قاعده‌های «" + p + "…»"; }).replace(/\b[a-z][a-z_]*_[a-z_]+\b/g, function (m) { return window.EPI_FM[m] ? "«" + window.EPI_FM[m].fa + "»" : m; }); return A.epiDC ? A.epiDC(t) : t; }
    function walk(o, skip) {
      if (Array.isArray(o)) { for (var i = 0; i < o.length; i++) { if (typeof o[i] === "string") o[i] = dcr(o[i]); else walk(o[i], skip); } return; }
      if (o && typeof o === "object") for (var k in o) { if (skip[k]) continue; if (typeof o[k] === "string") o[k] = dcr(o[k]); else walk(o[k], skip); }
    }
    walk(window.EPI_RULES || [], { id: 1, st: 1, sec: 1, when: 1, eff: 1, book: 1, basis: 1, cap: 1 });
    var CS = { id: 1, kind: 1, grp: 1, f: 1, fail: 1, status: 1, by: 1, year: 1, plant: 1, dom: 1, role: 1 };
    walk(window.EPI_CASES || [], CS);
    walk(window.EPI_PROBLEMS || [], { id: 1, st: 1, tech: 1, lvl: 1, year: 1, a: 1, ok: 1, kind: 1, grp: 1, f: 1, fail: 1, status: 1, by: 1, dom: 1, role: 1 });
    A.btDC = dcr;
  })();
  var SEED = X.seedCases(); var SEEDM = {}; SEED.forEach(function (c) { SEEDM[c.id] = c; });
  var BLIND = {}; (window.EPI_BLIND || []).forEach(function (c) { BLIND[c.id] = c; });
  function f2(v) { return v == null ? "—" : fa((+v).toFixed(2)); }
  function pct(v) { return v == null ? "—" : fa(Math.round(100 * v)) + "٪"; }
  function stName(id) { var s = A.EST && A.EST[id]; return s ? s.fa : id; }
  function stChip(id) { return A.stLink ? A.stLink(id) : h("span", { class: "chip" }, stName(id)); }
  function ruleChip(id) { var r = X.RM[id]; return h("button", { class: "tlink rule", title: r ? r.stmt : id, onclick: function () { A.go("e_living", null, id); } }, r ? r.fa : id); }
  A.ruleChip = ruleChip;
  function dc(t) { return A.btDC(String(t || "")).replace(/\b(r_[a-z0-9_]+|st_[a-z_]+)\b/g, function (m) { return m.indexOf("r_") === 0 ? (X.RM[m] ? "«" + X.RM[m].fa + "»" : m) : "«" + stName(m) + "»"; }); }

  /* ---------- داده ---------- */
  function userCases(st) { return S.all("ecase", function (c) { return !st || c.status === st; }); }
  A.btCases = function (enc) {
    var all = SEED.concat(userCases("approved"));
    if (enc === "B") all = all.map(function (c) { var b = BLIND[c.id]; if (!b) return c; var o = {}; for (var k in c) o[k] = c[k]; o.claims = c.claims.map(function (k) { var bk = b.claims.filter(function (x) { return x.id === k.id; })[0]; var kk = {}; for (var y in k) kk[y] = k[y]; kk.f = bk ? bk.f : {}; return kk; }); o.enc = "B"; return o; });
    if (enc === "F") all = X.factsOnly(all);
    return all;
  };
  var ENC = { A: "رمزگذاری نخست", B: "رمزگذاری کور مستقل", F: "فقط واقعیت‌ها (بی‌ویژگی‌های تشخیصی)" };
  function featText(k, v) { var d = FM[k]; if (!d) return k + ": " + v; return d.fa + ": " + (v === true ? "بله" : v === false ? "خیر" : fa(v)); }

  /* ---------- سه آزمون ---------- */
  A.btCfg = function () { return X.DEFAULT_CFG(); };
  /* record=false (۲۰۲۶-۱۰-۱۳): باز کردنِ «جزوهٔ زنده» یا «اختلاف‌ها» فقط برای نمایش حساب می‌کند و اجرای «دستی» در تاریخچه ثبت نمی‌کند */
  A.runThree = function (enc, record) {
    enc = enc || "A";
    var cases = A.btCases(enc), seed = X.hash(new Date().toISOString().slice(0, 10));
    var t = X.three(cases, X.DEFAULT_CFG(), seed);
    /* آزمون ۱ همیشه با رمزگذاری رسمی مثال‌های جزوه: محکش خود جزوه است، نه رمزگذار */
    if (enc !== "A") t.a = X.testA(A.btCases("A"), X.DEFAULT_CFG(), seed);
    t.sens = X.ruleSensitivity(cases, X.DEFAULT_CFG());
    t.meta = { enc: enc, at: new Date().toISOString(), n: cases.length };
    A.lastThree = t;
    if (record !== false) S.put({ id: A.uid("ebt"), type: "ebt", meta: { mode: "three", enc: enc, at: t.meta.at, n: cases.length }, ok: t.a.ok && t.b.ok,
      m: { a: t.a.ok, book: t.a.bookScore, b: t.b.ok, agree: t.b.agree, lb: t.b.lb, sens: t.b.sens, spec: t.b.spec, pf1: t.b.claims.pFalseFlagged, pf0: t.b.claims.pFalseUnflagged, c: t.c.neff },
      aut: t.a.bad.map(function (x) { return { id: x.cs.id, stage: "a", truthFail: x.cs.truth.fail || [], flagged: x.res.flagged }; })
        .concat(t.b.disagree.map(function (x) { return { id: x.cs.id, stage: "b", fieldOk: x.ok, flagged: x.res.flagged }; })) });
    return t;
  };
  function stat(l, v, s) { return h("div", { class: "stat" }, h("div", { class: "sl" }, l), h("div", { class: "sv" }, v), s ? h("div", { class: "small muted" }, s) : null); }
  function testCard(n, title, q, yard, ok, verdict, body, meaning) {
    return h("section", { class: "card test " + (ok === true ? "okv" : ok === false ? "badv" : "") },
      h("div", { class: "row between wrap" }, h("h2", {}, "آزمون " + fa(n) + " — " + title), h("span", { class: "pill " + (ok === true ? "good" : ok === false ? "bad" : "") }, verdict)),
      h("p", {}, h("strong", {}, "پرسش: "), q), h("p", { class: "small" }, h("strong", {}, "محک: "), yard), body, h("p", { class: "small muted" }, h("strong", {}, "اگر رد شود یعنی: "), meaning));
  }
  /* ممیزیِ ۲۰۲۶-۱۰-۱۳: سه سنجهٔ صادقانه کنارِ آزمونِ ۱ — بی تغییرِ قاعده یا معیارِ قبول (تصمیم با مالک) */
  A.rulesApproved = function () { var o = S.get("epi_rules_ok"); return o && o.hash; };
  function t1Honesty(a) {
    if (!a || a.fullScore == null) return null;
    var okH = A.rulesApproved(), cur = a.rulesHash, cov = a.coverage || { tested: [], untested: [], n: 0 };
    return h("div", { class: "card soft t1-honest", dir: "rtl" },
      h("p", { class: "small" }, h("strong", {}, "مکان‌یابیِ کامل: "), pct(a.fullScore) + " (" + fa(a.nBook - a.partial.length - (a.book.rows || []).filter(function (x) { return !x.fate.pass; }).length) + " از " + fa(a.nBook) + ") — «قبول» یعنی دست‌کم یکی از ایستگاه‌هایی که جزوه می‌گوید پرچم خورده؛ این‌جا شمرده می‌شود چند مثال «همهٔ» آن ایستگاه‌ها را گرفتند."),
      a.partial.length ? h("details", { class: "small" }, h("summary", {}, fa(a.partial.length) + " مثال فقط بخشی از ایستگاه‌ها را گرفت — داوری با تو (خطای سازنده یا برچسبِ جزوه؟)"),
        h("ul", {}, a.partial.map(function (x) { var miss = (x.cs.truth.fail || []).filter(function (s) { return x.res.flagged.indexOf(s) < 0; }); return h("li", {}, h("button", { class: "linkish", onclick: function () { A.go("e_lib", x.cs.id); } }, x.cs.title), " — جزوه: " + (x.cs.truth.fail || []).map(stName).join("، ") + " · گرفته‌نشده: " + miss.map(stName).join("، ")); }))) : null,
      h("p", { class: "small" }, h("strong", {}, "پوششِ قاعده‌ها: "), fa(cov.tested.length) + " از " + fa(cov.n) + " قاعده با مثال‌های خودِ جزوه آزموده می‌شوند (خاموش‌کردنشان حکمِ دست‌کم یک مثال را عوض می‌کند). " + fa(cov.untested.length) + " قاعدهٔ دیگر فقط با سناریوهای ساختگی سنجیده می‌شوند که از خودِ قاعده‌ها ساخته شده‌اند — محکِ مستقل نیستند؛ رانشِ آن‌ها را «اثرِ انگشتِ قاعده‌ها» می‌گیرد."),
      cov.untested.length ? h("details", { class: "small" }, h("summary", {}, "قاعده‌های بی‌مثال در جزوه (" + fa(cov.untested.length) + ")"), h("div", { class: "row gap wrap" }, cov.untested.map(function (id) { return ruleChip(id); }))) : null,
      h("p", { class: "small " + (okH && okH !== cur ? "bad" : "") }, h("strong", {}, "اثرِ انگشتِ قاعده‌ها: "),
        !okH ? "هنوز نسخه‌ای از قاعده‌ها را تأیید نکرده‌ای. پس از مرور، تأییدش کن تا هر تغییرِ بعدی در قاعده‌ها (حتی بی‌اثر بر مثال‌ها) در دورهٔ هفتگی هشدار بدهد." :
        okH === cur ? "قاعده‌ها همان نسخه‌ای‌اند که تأیید کرده‌ای." : "⚠ قاعده‌ها از آخرین تأییدِ تو تغییر کرده‌اند — پیش از اعتماد، تغییر را در «جزوهٔ زنده» و دفترِ کار ببین.",
        " ", okH !== cur ? h("button", { class: "btn ghost sm t1-approve", onclick: function () { S.put({ id: "epi_rules_ok", type: "erules", hash: cur, at: new Date().toISOString() }); A.toast("این نسخهٔ قاعده‌ها تأیید شد."); A.render(); } }, "این نسخهٔ قاعده‌ها را تأیید می‌کنم") : null));
  }
  function threeView(t) {
    var box = h("div", { class: "col gap" });
    var aBad = t.a.bad.length;
    box.appendChild(testCard(1, "آیا کارخانه همان جزوه است؟", "وقتی مثال‌های خود جزوه را به کارخانه می‌دهیم، همان حکمی را می‌دهد که جزوه داده؟ و خطایی که عمداً در سناریو کاشته‌ایم، در همان ایستگاه گرفته می‌شود؟",
      "فقط خود جزوه (" + fa(t.a.nBook) + " مثال) و " + fa(t.a.synthN) + " سناریوی ساختگی با خطای کاشته.", t.a.ok, t.a.ok ? "قبول" : "رد",
      h("div", {}, h("p", {}, "مثال‌های جزوه درست داوری شد: " + pct(t.a.bookScore) + " · خطاهای کاشته در ایستگاه درست: " + pct(t.a.posF) + " · همزادهای سالم بی‌پرچم: " + pct(t.a.posH)),
        t1Honesty(t.a),
        aBad ? h("div", {}, h("p", { class: "small" }, fa(aBad) + " مورد ناهمخوان (هر کدام خطای سازنده است، نه جزوه):"), h("ul", { class: "small" }, t.a.bad.slice(0, 20).map(function (x) { return h("li", {}, h("button", { class: "linkish", onclick: function () { A.go("e_lib", x.cs.id); } }, x.cs.title), " — ", dc(x.fate.why)); }))) : h("p", { class: "small good" }, "هیچ ناهمخوانی‌ای نیست.")),
      "کارخانه جزوه را درست پیاده نکرده (ایراد از سازنده است). تا این آزمون قبول نشود، نتیجه آزمون ۲ را نمی‌شود به گردن جزوه انداخت."));
    var cl = t.b.claims;
    box.appendChild(testCard(2, "آیا جزوه با تاریخ می‌خواند؟", "روی وقایع واقعی که سرانجامشان معلوم است، آیا کارخانه (یعنی ملاک‌های جزوه) همان روش‌هایی را معیوب می‌داند که خود آن رشته معیوب می‌داند، و ادعاهایی را که پرچم می‌زند واقعاً بیشتر نادرست درآمده‌اند؟",
      "مستقل از جزوه: سرانجام واقعی هر ادعا و داوری خود آن رشته (پزشکی، مهندسی، مالی، تاریخ…) درباره روش کنشگر. برچسب‌زن نه جزوه را دیده بود و نه قاعده‌ها را.",
      t.a.ok ? t.b.ok : null, !t.a.ok ? "منتظر قبولی آزمون ۱" : t.b.ok ? "می‌خواند" : "نمی‌خواند",
      h("div", {}, h("section", { class: "stats" },
        stat("هم‌خوانی با داوری رشته", pct(t.b.agree), fa(t.b.neff) + " رخداد مستقل · کران پایین " + f2(t.b.lb)),
        stat("روش‌های معیوب که کارخانه دید", pct(t.b.sens), "از " + fa(t.b.rows.filter(function (x) { return !x.ok; }).length) + " مورد"),
        stat("روش‌های سالم که کارخانه سالم دید", pct(t.b.spec), "از " + fa(t.b.rows.filter(function (x) { return x.ok; }).length) + " مورد"),
        stat("ادعای پرچم‌خورده که نادرست درآمد", pct(cl.pFalseFlagged), fa(cl.nFlagged) + " ادعا (در برابر " + pct(cl.pFalseUnflagged) + " برای بی‌پرچم‌ها)"),
        stat("دقت سقف‌های اعتبار (Brier)", f2(cl.brier), "بدون کارخانه (فقط نرخ پایه): " + f2(cl.brierBase) + " — کمتر بهتر است")),
        h("p", { class: "small" }, "پایداری در دو نیمه تاریخی (پیش و پس از " + fa(t.b.halves.mid) + "): " + pct(t.b.halves.old) + " و " + pct(t.b.halves.neu) + "."),
        t.b.disagree.length ? h("div", {}, h("p", { class: "small" }, fa(t.b.disagree.length) + " اختلاف برای داوری تو (در «اختلاف‌ها»):"), h("ul", { class: "small" }, t.b.disagree.map(function (x) { return h("li", {}, h("button", { class: "linkish", onclick: function () { A.go("e_lib", x.cs.id); } }, x.cs.title), " — رشته: " + (x.ok ? "روش سالم" : "روش معیوب") + "؛ کارخانه: " + (x.res.healthy ? "سالم" : "پرچم در " + x.res.flagged.map(stName).join("، "))); }))) : null),
      "یا ملاکی از جزوه با تاریخ نمی‌خواند (ایراد احتمالی جزوه)، یا پرونده بد رمزگذاری شده، یا برچسب رشته محل بحث است. هر اختلاف را در «اختلاف‌ها» داوری کن."));
    box.appendChild(testCard(3, "وقایع جاری", "پرونده‌هایی که پیش از معلوم شدن نتیجه از کارخانه رد کردی، بعداً با نتیجه واقعی چقدر خواندند؟ این تنها آزمونی است که دانستن سرانجام در آن دخالت ندارد.",
      "پرونده‌های خودت در «دفتر پیش‌رو» (از دکمه «داوری قطعی» در هر پرونده).", t.c.enough ? t.c.ok : null, t.c.enough ? (t.c.ok ? "می‌خواند" : "نمی‌خواند") : fa(t.c.neff) + " از ۲۰ ادعا",
      h("p", {}, t.c.neff ? fa(t.c.neff) + " ادعا با نتیجه معلوم · ادعای پرچم‌خورده که نادرست درآمد: " + pct(t.c.claims.pFalseFlagged) + " (بی‌پرچم‌ها: " + pct(t.c.claims.pFalseUnflagged) + ") · دقت سقف‌ها (Brier): " + f2(t.c.claims.brier) + " در برابر " + f2(t.c.claims.brierBase) + " بدون کارخانه" : "هنوز پرونده‌ای با نتیجه معلوم نیست."),
      "کارخانه در عمل، روی زندگی خودت، به اندازه بک‌تست خوب نیست؛ این نتیجه بر آزمون ۲ مقدم است."));
    box.appendChild(h("section", { class: "card soft" }, h("h3", {}, "حدّ این نتیجه‌ها"), h("ul", { class: "small" },
      h("li", {}, "وقایع کتابخانه بیشتر رخدادهای مشهورند و مشهورند چون روشن‌اند؛ این آزمون را آسان‌تر از زندگی واقعی می‌کند."),
      h("li", {}, "رمزگذاری وقایع تاریخی با دانستن سرانجامشان انجام شده. رمزگذاری کور این اثر را کم می‌کند ولی صفر نمی‌کند. آزمون ۳ این ضعف را ندارد."),
      h("li", {}, "هیچ وزنی خودکار تنظیم نمی‌شود: قاعده‌ها همان‌اند که جزوه گفته. اگر قاعده‌ای با تاریخ نخواند، در «حساسیت قاعده‌ها» و «اختلاف‌ها» به‌عنوان پرسش از جزوه پیش تو می‌آید."))));
    return box;
  }
  function sensView(t) {
    var rows = t.sens.filter(function (x) { return x.fires; });
    return h("section", { class: "card" }, h("h2", {}, "حساسیت قاعده‌ها"), h("p", { class: "small" }, "برای هر قاعده: اگر این ملاک جزوه نبود، کارخانه بیشتر با داوری متخصصان هر رشته می‌خواند یا کمتر؟ عدد مثبت یعنی بدون آن بهتر می‌خواند (پس جای پرسش از جزوه است)؛ منفی یعنی این قاعده لازم است. این فقط گزارش است و چیزی را تغییر نمی‌دهد."),
      h("div", { class: "scrollx" }, h("table", { class: "wt" }, h("thead", {}, h("tr", {}, h("th", {}, "قاعده"), h("th", {}, "ایستگاه"), h("th", {}, "فعال روی روش معیوب"), h("th", {}, "فعال روی روش سالم"), h("th", {}, "تغییر هم‌خوانی بدون آن"))),
        h("tbody", {}, rows.map(function (x) { var r = X.RM[x.id]; return h("tr", { class: x.dAgree > 0 ? "warnrow" : "" }, h("td", {}, ruleChip(x.id)), h("td", { class: "small" }, r ? stName(r.st) : ""), h("td", {}, fa(x.onFlawed)), h("td", {}, fa(x.onSound)), h("td", {}, (x.dAgree > 0 ? "+" : "") + fa((100 * x.dAgree).toFixed(1)) + "٪")); })))),
      h("p", { class: "small muted" }, "قاعده‌هایی که روی هیچ رخداد واقعی فعال نشدند (" + fa(t.sens.length - rows.length) + ") فقط با مثال‌های جزوه و سناریوهای کاشته آزموده شده‌اند."));
  }
  A.V.e_bt = function (arg, tab) {
    tab = tab || "live";  // پیش‌فرض: بک‌تستِ پیوسته (۲۰۲۶-۱۰-۱۳)
    var root = h("div", { class: "page" });
    root.appendChild(A.head("کارخانه معرفت‌شناسی", "اعتبارسنجی کارخانه و جزوه", "آیا می‌شود به کارخانه اعتماد کرد؟ سه آزمون پشت‌سرهم: ۱) کارخانه همان را می‌گوید که جزوه می‌گوید؟ ۲) جزوه با وقایع تاریخی می‌خواند؟ ۳) در وقایع امروز درست درمی‌آید؟"));
    root.appendChild(A.tabs([["live", "♾ بک‌تستِ پیوسته"], ["found", "🧱 مبنای درجه‌ها"], ["terr", "🗺 قلمرو"], ["three", "سه آزمون"], ["sens", "حساسیت قاعده‌ها"], ["cycle", "تکرار دوره‌ای"], ["enc", "پایداری رمزگذاری"], ["hist", "تاریخچه"], ["about", "روش و حدود"]], tab, function (k) { A.go("e_bt", null, k); }));
    var body = h("div", { class: "col gap" }); root.appendChild(body);
    if (tab === "about") { body.appendChild(h("section", { class: "card" }, BT.INTRO.map(function (p) { return h("div", {}, String(p).split("\n").map(function (l) { return h("p", {}, l); })); }))); return root; }
    if (tab === "hist") {
      var runs = S.all("ebt", function (r) { return r.meta && (r.meta.mode === "three" || r.meta.mode === "cycle"); });
      body.appendChild(runs.length ? h("div", { class: "scrollx" }, h("table", { class: "wt" }, h("thead", {}, h("tr", {}, h("th", {}, "زمان"), h("th", {}, "نوع"), h("th", {}, "آزمون ۱"), h("th", {}, "آزمون ۲: هم‌خوانی"), h("th", {}, "کران پایین"))),
        h("tbody", {}, runs.map(function (r) { var m = r.m || {}; return h("tr", {}, h("td", { class: "small" }, A.fdate(r.meta.at)), h("td", { class: "small" }, r.meta.mode === "cycle" ? "دوره‌ای" : "دستی"), h("td", {}, m.a ? "✓" : "✗"), h("td", {}, pct(m.agree)), h("td", {}, f2(m.lb))); })))) : A.empty("هنوز هیچ آزمونی اجرا نشده."));
      return root;
    }
    if (tab === "enc") { body.appendChild(encAgreement()); return root; }
    if (tab === "cycle") { body.appendChild(cyclePanel()); return root; }
    if (tab === "live" && A.btLivePanel) { body.appendChild(A.btLivePanel()); return root; }
    if (tab === "found" && A.foundPanel) { body.appendChild(A.foundPanel()); return root; }
    if (tab === "terr" && A.territoryPanel) { body.appendChild(A.territoryPanel()); return root; }
    if (!A.lastThree || (A.lastThree.meta && A.lastThree.meta.enc !== (A.encSel || "A"))) A.runThree(A.encSel || "A", false);  // دیدن ≠ ثبتِ اجرا (۲۰۲۶-۱۰-۱۳)
    if (tab === "sens") { body.appendChild(sensView(A.lastThree)); return root; }
    var encSel = h("select", { id: "btEnc", onchange: function (e) { A.encSel = e.target.value; A.lastThree = null; A.render(); } }, Object.keys(ENC).map(function (k) { return h("option", { value: k, selected: (A.encSel || "A") === k }, ENC[k]); }));
    body.appendChild(h("section", { class: "card" }, h("div", { class: "row gap wrap" }, h("label", { for: "btEnc" }, "رمزگذاری پرونده‌ها:"), encSel, h("button", { class: "btn ghost sm", onclick: function () { A.runThree(A.encSel || "A", true); A.render(); } }, "اجرای دوباره (و ثبت در تاریخچه)")),
      h("p", { class: "small muted" }, "رمزگذاری یعنی ویژگی‌هایی که برای هر ادعای پرونده ثبت شده. «رمزگذاری کور» را کسی انجام داده که سرانجام پرونده‌ها را نمی‌دانست؛ اگر نتیجه با آن هم بماند، به نحوه رمزگذاری وابسته نیست.")));
    body.appendChild(threeView(A.lastThree));
    return root;
  };

  /* ---------- پایداری رمزگذاری (توافق دو رمزگذار مستقل) ---------- */
  function encAgreement() {
    var per = {}, agree = 0, tot = 0, verdictSame = 0, nc = 0, cfg = X.DEFAULT_CFG();
    SEED.forEach(function (c) {
      var b = BLIND[c.id]; if (!b) return;
      var bc = { claims: c.claims.map(function (k) { var bk = b.claims.filter(function (x) { return x.id === k.id; })[0]; return { id: k.id, f: bk ? bk.f : {} }; }) };
      nc++; var r1 = X.runCase(c, cfg), r2 = X.runCase(bc, cfg); if (r1.healthy === r2.healthy && r1.first === r2.first) verdictSame++;
      c.claims.forEach(function (k, i) { var bf = bc.claims[i].f; var keys = {}; Object.keys(k.f || {}).concat(Object.keys(bf)).forEach(function (x) { keys[x] = 1; });
        Object.keys(keys).forEach(function (x) { if (x === "conf") return; tot++; var ok = JSON.stringify(k.f[x]) === JSON.stringify(bf[x]); if (ok) agree++; var p = per[x] = per[x] || [0, 0]; p[1]++; if (ok) p[0]++; }); });
    });
    var ks = Object.keys(per).sort(function (a, b) { return per[a][0] / per[a][1] - per[b][0] / per[b][1]; });
    return h("section", { class: "card" }, h("h2", {}, "دو رمزگذار مستقل چقدر یکسان دیدند؟"),
      h("p", {}, "رمزگذار دوم برچسب حقیقت و رمزگذاری نخست را ندیده بود. توافق کل ویژگی‌ها: " + pct(tot ? agree / tot : 0) + " (" + fa(tot) + " مقایسه). یکسانی حکم موتور (سالم/شکست و نخستین ایستگاه) روی " + fa(nc) + " پرونده: " + pct(nc ? verdictSame / nc : 0) + "."),
      h("p", { class: "small muted" }, "اگر دو نفر یک ویژگی را بیشتر وقت‌ها متفاوت علامت زده‌اند، تعریف آن ویژگی روشن نیست. این ایراد سازنده سامانه است، نه جزوه؛ تعریف آن ویژگی باید دقیق‌تر شود."),
      h("div", { class: "scrollx" }, h("table", { class: "wt" }, h("thead", {}, h("tr", {}, h("th", {}, "ویژگی"), h("th", {}, "تشخیصی؟"), h("th", {}, "توافق"), h("th", {}, "تعداد"))),
        h("tbody", {}, ks.map(function (k) { var p = per[k], d = FM[k]; return h("tr", { class: p[0] / p[1] < 0.5 ? "warnrow" : "" }, h("td", { class: "small" }, d ? d.fa : k), h("td", {}, d && d.dx ? "بله" : "—"), h("td", {}, pct(p[0] / p[1])), h("td", {}, fa(p[1]))); })))));
  }

  /* ---------- تکرار دوره‌ای ---------- */
  function cycState() { return S.get("ecycle") || { id: "ecycle", type: "ecyc", runs: 0, sigs: [], reports: [] }; }
  A.epiCycleDue = function () { var st = cycState(); return !st.last || A.daysBetween(st.last.slice(0, 10), A.today()) >= 7; };
  A.runCycle = function () {
    var st = cycState();
    var ok0 = S.get("epi_rules_ok");
    var r = X.cycle({ runs: st.runs, sigs: st.sigs, rulesOk: ok0 && ok0.hash }, A.btCases("A"), new Date().toISOString());
    st.runs = (st.runs || 0) + 1; st.sigs = r.sigs; st.last = r.report.at; st.reports = [r.report].concat(st.reports || []).slice(0, 30); S.put(st);
    S.put({ id: A.uid("ebt"), type: "ebt", meta: { mode: "cycle", enc: "A", at: r.report.at, n: 0 }, ok: r.report.a.ok && r.report.b.ok, m: { a: r.report.a.ok, book: r.report.a.book, b: r.report.b.ok, agree: r.report.b.agree, lb: r.report.b.lb, c: r.report.c.n }, aut: [] });
    return r.report;
  };
  function cyclePanel() {
    var st = cycState(), box = h("div", { class: "col gap" });
    box.appendChild(h("section", { class: "card" }, h("h2", {}, "تکرار دوره‌ای (هر هفته)"), h("p", {}, "هر دوره بدون هیچ تنظیم وزنی این کارها را انجام می‌دهد:"),
      h("ul", {},
        h("li", {}, "دسته‌ای تازه از سناریوهای ساختگی با خطای کاشته می‌سازد، بی‌تکرار نسبت به دوره‌های قبل، تا آزمون ۱ هر بار با داده تازه تکرار شود."),
        h("li", {}, "سه آزمون را روی همه پرونده‌های تأییدشده، از جمله پرونده‌هایی که از آخرین دوره اضافه شده‌اند، دوباره اجرا می‌کند."),
        h("li", {}, "اگر آزمون ۱ رد شود (یعنی تغییری در کارخانه آن را از جزوه دور کرده)، در گزارش هشدار می‌دهد.")),
      h("p", { class: "small muted" }, "در نسخه گوگل اپس‌اسکریپت، دوره روی سرور اجرا و گزارشش ایمیل می‌شود. در Lifemanager و مرورگر، اگر هفت روز از دوره قبل گذشته باشد، با باز کردن میز کار اجرا می‌شود. پرونده‌هایی که هوش مصنوعی پیدا می‌کند همیشه اول به صف تأیید تو می‌روند."),
      h("div", { class: "row gap wrap" }, h("button", { class: "btn", onclick: function (e) { e.target.disabled = true; setTimeout(function () { var r = A.runCycle(); A.toast("دوره اجرا شد: " + fa(r.fresh.n) + " سناریوی تازه"); A.render(); }, 20); } }, "اجرای یک دوره اکنون"),
        S.mode === "gas" ? h("button", { class: "btn ghost", onclick: function () { google.script.run.withSuccessHandler(function (m) { A.toast(m); }).withFailureHandler(function (e) { A.toast(e.message, "bad"); }).installEpiCycle(); } }, "نصب دوره هفتگی روی سرور") : null,
        S.mode === "gas" ? h("button", { class: "btn ghost", onclick: function () { google.script.run.withSuccessHandler(function (m) { A.toast(m); }).removeEpiCycle(); } }, "حذف دوره هفتگی") : null)));
    box.appendChild(h("section", { class: "card" }, h("h2", {}, "گزارش دوره‌ها (" + fa(st.runs || 0) + ")"), (st.reports || []).length ? h("div", { class: "scrollx" }, h("table", { class: "wt" }, h("thead", {}, h("tr", {}, h("th", {}, "زمان"), h("th", {}, "سناریوی تازه"), h("th", {}, "آزمون ۱"), h("th", {}, "آزمون ۲: هم‌خوانی"), h("th", {}, "آزمون ۳"))),
      h("tbody", {}, st.reports.map(function (r) { var a = r.a || {}, b = r.b || {}, c = r.c || {}; return h("tr", {}, h("td", { class: "small" }, A.fdate(r.at)), h("td", {}, fa(r.fresh.n) + " (" + pct(r.fresh.score) + ")"), h("td", {}, a.ok ? "✓ قبول" : "✗ رد"), h("td", {}, pct(b.agree) + " · کران " + f2(b.lb)), h("td", { class: "small" }, fa(c.n || 0) + " پرونده")); })))) : h("p", { class: "muted" }, "هنوز دوره‌ای اجرا نشده.")));
    return box;
  }

  /* ---------- کتابخانه پرونده‌ها ---------- */
  function caseMatch(c) { var r = X.runCase(c, A.btCfg()); return { res: r, fate: X.fate(c, r) }; }
  A.V.e_lib = function (cid, tab) {
    if (cid) return caseDetail(cid);
    tab = tab || "list";
    var root = h("div", { class: "page" });
    var pend = userCases("pending");
    root.appendChild(A.head("کارخانه معرفت‌شناسی · بک‌تست", "کتابخانه پرونده‌ها", "نمونه‌هایی که کارخانه با آن‌ها آزموده می‌شود: رخدادهای واقعی، مثال‌های خود جزوه، مسئله‌های بزرگ، و پرونده‌هایی که تو یا هوش مصنوعی (پس از تأیید تو) افزوده‌اید."));
    root.appendChild(A.tabs([["list", "همه پرونده‌ها"], ["pending", "صف تأیید (" + fa(pend.length) + ")"], ["add", "افزودن پرونده"], ["harvest", "گردآوری با هوش مصنوعی"]], tab, function (k) { A.go("e_lib", null, k); }));
    var body = h("div", { class: "col gap" }); root.appendChild(body);
    if (tab === "add") { body.appendChild(caseEditor(null)); return root; }
    if (tab === "harvest") { body.appendChild(harvestPanel()); return root; }
    var list = tab === "pending" ? pend : SEED.concat(userCases("approved"));
    var fk = h("select", { id: "lbK" }, h("option", { value: "" }, "همه انواع"), [["real", "واقعی"], ["booklet", "مثال جزوه"], ["problem", "مسئله بزرگ"], ["user", "افزوده شما"], ["forward", "پیش‌رو"]].map(function (x) { return h("option", { value: x[0] }, x[1]); }));
    var fo = h("select", { id: "lbO" }, h("option", { value: "" }, "سالم و شکست"), h("option", { value: "1" }, "فقط سالم"), h("option", { value: "0" }, "فقط شکست"));
    var fm = h("select", { id: "lbM" }, h("option", { value: "" }, "همه داوری‌ها"), h("option", { value: "bad" }, "فقط داوری نادرست موتور"));
    var q = h("input", { id: "lbQ", type: "search", placeholder: "جستجو در عنوان یا روایت" });
    var out = h("div", { class: "col gap" });
    function draw() {
      out.innerHTML = "";
      var arr = list.filter(function (c) {
        if (fk.value && (fk.value === "user" ? !c.by || c.by === "seed" : c.kind !== fk.value)) return false;
        if (fo.value && String(c.truth && c.truth.ok ? 1 : 0) !== fo.value) return false;
        if (q.value && (c.title + " " + c.story).indexOf(q.value) < 0) return false;
        return true;
      }).map(function (c) { return { c: c, m: caseMatch(c) }; }).filter(function (x) { return fm.value !== "bad" || !x.m.fate.pass; });
      out.appendChild(h("p", { class: "small muted" }, fa(arr.length) + " پرونده · داوری کارخانه با قاعده‌های جزوه (بی‌هیچ تنظیم)"));
      out.appendChild(h("div", { class: "scrollx" }, h("table", { class: "wt" }, h("thead", {}, h("tr", {}, h("th", {}, "پرونده"), h("th", {}, "حوزه"), h("th", {}, "سال"), h("th", {}, "برچسب با ملاک جزوه"), h("th", {}, "داوری رشته"), h("th", {}, "حکم کارخانه"), h("th", {}, ""))),
        h("tbody", {}, arr.map(function (x) { var c = x.c, t = c.truth || {}; return h("tr", { class: x.m.fate.pass ? "" : "warnrow" }, h("td", {}, h("button", { class: "linkish", onclick: function () { A.go("e_lib", c.id); } }, c.title)), h("td", { class: "small" }, c.dom), h("td", {}, c.year ? fa(c.year) : "—"),
          h("td", { class: "small" }, t.ok ? "سالم" : "شکست: " + (t.fail || []).map(stName).join("، ")), h("td", { class: "small" }, (function () { var fl = X.fieldOf(c); return !fl || fl.field.ok == null ? "—" : fl.field.ok ? "سالم" : "معیوب"; })()), h("td", { class: "small" }, x.m.res.healthy ? "سالم" : "پرچم: " + x.m.res.flagged.map(stName).join("، ")), h("td", {}, x.m.fate.pass ? "✓" : "✗")); })))));
    }
    [fk, fo, fm].forEach(function (s) { s.addEventListener("change", draw); }); q.addEventListener("input", A.debounce(draw, 200));
    body.appendChild(h("div", { class: "row gap wrap" }, fk, fo, fm, q)); body.appendChild(out); draw();
    return root;
  };
  function claimEngine(k, r) {
    return h("div", { class: "eng" }, h("div", {}, h("strong", {}, "سقف اعتبار موجه: " + fa(r.ceil) + "٪"), r.bind ? h("span", { class: "small" }, " — قاعده تعیین‌کننده: ", ruleChip(r.bind)) : null, r.conf != null ? h("span", { class: "small" }, " · اطمینان کنشگر: " + fa(r.conf) + "٪") : null),
      r.flags.length ? h("ul", { class: "small" }, r.flags.map(function (fl) { return h("li", {}, h("strong", {}, stName(fl.st) + ": "), fl.kind === "over" ? "بیش‌اطمینانی (" + fa(fl.gap) + " واحد بالاتر از سقف)" : "خطا", " ", fl.rules.map(ruleChip)); })) : h("div", { class: "small good" }, "بی‌پرچم"),
      r.fired.length ? h("div", { class: "small muted" }, "قاعده‌های فعال: ", r.fired.map(ruleChip)) : null);
  }
  function featList(f) { var ks = Object.keys(f || {}); return ks.length ? h("ul", { class: "small featl" }, ks.map(function (k) { return h("li", { class: FM[k] && FM[k].dx ? "dx" : "" }, featText(k, f[k])); })) : h("p", { class: "small muted" }, "بدون ویژگی"); }
  function caseDetail(cid) {
    var c = SEEDM[cid] || S.get(cid); if (!c) return A.empty("پرونده پیدا نشد.");
    var root = h("div", { class: "page" }), cfg = A.btCfg(), r = X.runCase(c, cfg), fate = X.fate(c, r), t = c.truth || {};
    var b = BLIND[c.id];
    root.appendChild(A.head("پرونده بک‌تست · " + (c.kind === "booklet" ? "مثال جزوه" : c.kind === "problem" ? "مسئله بزرگ" : c.kind === "forward" ? "پیش‌رو" : "واقعی") + " · " + c.dom + (c.year ? " · " + fa(c.year) : ""), c.title, null,
      h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm", onclick: function () { A.go("e_lib"); } }, "← کتابخانه"),
        c.status === "pending" ? h("button", { class: "btn sm", onclick: function () { c.status = "approved"; c.addedAt = new Date().toISOString(); S.put(c); A.toast("تأیید شد و وارد بک‌تست شد."); A.go("e_lib", null, "pending"); } }, "تأیید و ورود به بک‌تست") : null,
        c.status === "pending" ? h("button", { class: "btn ghost sm", onclick: function () { c.status = "rejected"; S.put(c); A.go("e_lib", null, "pending"); } }, "رد") : null,
        S.get(cid) ? h("button", { class: "btn ghost sm", onclick: function () { A.editCase = cid; A.go("e_lib", null, "add"); } }, "ویرایش") : null)));
    root.appendChild(h("section", { class: "card" }, h("p", {}, c.story), c.actor ? h("p", {}, h("strong", {}, "کنشگر: "), c.actor) : null, (c.src || []).length ? h("p", { class: "small muted" }, "منابع: " + c.src.join(" · ")) : null));
    root.appendChild(h("section", { class: "card verdict " + (fate.pass ? "okv" : "badv") }, h("h2", {}, "داوری موتور: " + (r.healthy ? "سالم" : "شکست در " + r.flagged.map(stName).join("، ")) + " — " + (fate.pass ? "مطابق حقیقت" : "نادرست")), h("p", { class: "small" }, dc(fate.why)),
      r.fixes.length ? h("div", {}, h("strong", {}, "مسیر درست به حکم قاعده‌ها:"), h("ul", {}, r.fixes.map(function (x) { return h("li", {}, x); }))) : null));
    var fld = X.fieldOf(c);
    if (fld) root.appendChild(h("section", { class: "card" }, h("h2", {}, "محک مستقل از جزوه (آزمون ۲)"), h("p", {}, h("strong", {}, "داوری خود رشته: "), fld.field.ok == null ? "معلوم نیست" : fld.field.ok ? "روش کنشگر سالم بود" : "روش کنشگر معیوب بود", fld.field.basis ? " — " + fld.field.basis : ""),
      h("p", { class: "small" }, "سرانجام ادعاها: " + c.claims.map(function (k, i) { var o = fld.out && fld.out[k.id]; return fa(i + 1) + ": " + (o === true ? "درست درآمد" : o === false ? "نادرست درآمد" : "نامعلوم"); }).join(" · ")),
      h("p", { class: "small muted" }, "این برچسب را کسی زده که جزوه و قاعده‌ها را ندیده بود.")));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "برچسب با ملاک جزوه (برای آزمون ۱ و مکان‌یابی)"), h("p", {}, h("strong", {}, t.ok ? "فرایند سالم" : "فرایند شکست‌خورده"), !t.ok ? h("span", {}, " در: ", (t.fail || []).map(stChip)) : null), t.why ? h("p", {}, t.why) : null, t.right ? h("p", {}, h("strong", {}, "مسیر درست: "), t.right) : null));
    c.claims.forEach(function (k, i) {
      var bk = b && b.claims.filter(function (x) { return x.id === k.id; })[0];
      root.appendChild(h("section", { class: "card" }, h("h3", {}, "تصدیق " + fa(i + 1) + " (" + (k.role || "") + "): " + k.txt), k.truth != null ? h("p", { class: "small" }, "سرانجام: " + (k.truth ? "درست بود" : "نادرست بود")) : null,
        h("div", { class: "grid2" }, h("div", {}, h("h4", {}, "رمزگذاری نخست"), featList(k.f)), bk ? h("div", {}, h("h4", {}, "رمزگذاری کور مستقل"), featList(bk.f)) : null),
        h("h4", {}, "نتیجه داوری قطعی"), claimEngine(k, r.claims[i])));
    });
    var auts = S.all("eaut", function (a) { return a.caseId === cid; });
    if (auts.length) root.appendChild(h("section", { class: "card" }, h("h2", {}, "علت‌یابی‌های ثبت‌شده"), auts.map(autRow)));
    return root;
  }

  /* ---------- ویرایشگر ویژگی‌ها (مشترک: پرونده بک‌تست و پرونده انسانی) ---------- */
  A.featEditor = function (f, onCh, pre) {
    var box = h("div", { class: "feated" }), last = -1;
    FEAT.forEach(function (d) {
      var st = A.EST && A.EST[d.st], hall = st ? st.hall : 0;
      if (hall !== last) { last = hall; box.appendChild(h("div", { class: "rhall" }, (E && E.HALLS[hall] ? "سالن " + fa(hall) + " · " + E.HALLS[hall].fa : ""))); }
      var id = "fe_" + (pre ? pre + "_" : "") + d.k, ctl;   // پیشوند برای هر تصدیق ⇒ شناسه‌ها و برچسب‌ها یکتا (ممیزی ۲۰۲۶-۱۰-۱۳)
      if (d.t === "enum") ctl = h("select", { id: id, onchange: function (e) { if (e.target.value === "") delete f[d.k]; else f[d.k] = e.target.value; onCh && onCh(); } }, h("option", { value: "" }, "— تعیین نشده —"), d.v.map(function (v) { return h("option", { value: v, selected: f[d.k] === v }, v); }));
      else if (d.t === "bool") ctl = h("select", { id: id, onchange: function (e) { if (e.target.value === "") delete f[d.k]; else f[d.k] = e.target.value === "1"; onCh && onCh(); } }, h("option", { value: "" }, "— تعیین نشده —"), h("option", { value: "1", selected: f[d.k] === true }, "بله"), h("option", { value: "0", selected: f[d.k] === false }, "خیر"));
      else ctl = h("input", { id: id, type: "number", min: 0, max: 100, value: f[d.k] == null ? "" : f[d.k], oninput: function (e) { if (e.target.value === "") delete f[d.k]; else f[d.k] = Math.max(0, Math.min(100, +e.target.value)); onCh && onCh(); } });
      box.appendChild(h("div", { class: "ferow" + (d.dx ? " dx" : "") }, h("label", { for: id, class: "small" }, d.fa, d.dx ? h("span", { class: "chip", title: "ویژگی تشخیصی: خودش داوری است" }, "تشخیصی") : null), ctl));
    });
    return box;
  };
  function caseEditor(cid) {
    cid = cid || A.editCase; A.editCase = null;
    var c = cid && S.get(cid) ? JSON.parse(JSON.stringify(S.get(cid))) : { id: A.uid("ecase"), type: "ecase", kind: "real", by: "user", status: "approved", title: "", dom: "زندگی روزمره", year: new Date().getFullYear(), grp: "", src: [], story: "", actor: "", claims: [{ id: "k1", txt: "", role: "اصلی", f: {}, truth: null }], truth: { ok: false, fail: [], why: "", right: "" } };
    var box = h("section", { class: "card col gap" }, h("h2", {}, cid ? "ویرایش پرونده" : "پرونده تازه برای بک‌تست"), h("p", { class: "small muted" }, "پرونده‌ای که سرنوشتش معلوم است. برچسب حقیقت (سالم یا شکست، و ایستگاه شکست) را از تحلیل خود رخداد بگذار، نه از حدس اینکه موتور چه می‌گوید."));
    function inp(lbl, key, ta) { var el = ta ? h("textarea", { rows: 3, oninput: function (e) { c[key] = e.target.value; } }) : h("input", { type: key === "year" ? "number" : "text", value: c[key] || "", oninput: function (e) { c[key] = key === "year" ? +e.target.value : e.target.value; } }); if (ta) el.value = c[key] || ""; return h("div", {}, h("label", {}, lbl), el); }
    box.appendChild(inp("عنوان", "title")); box.appendChild(inp("حوزه", "dom")); box.appendChild(inp("سال رخداد", "year")); box.appendChild(inp("روایت دقیق", "story", true)); box.appendChild(inp("کنشگر و داوری‌اش", "actor", true));
    var srcI = h("input", { type: "text", value: (c.src || []).join(" | "), oninput: function (e) { c.src = e.target.value.split("|").map(function (x) { return x.trim(); }).filter(Boolean); } });
    box.appendChild(h("div", {}, h("label", {}, "منابع (با | جدا کن)"), srcI));
    var cl = h("div", { class: "col gap" });
    function drawClaims() {
      cl.innerHTML = "";
      c.claims.forEach(function (k, i) {
        var tx = h("input", { type: "text", value: k.txt, placeholder: "متن تصدیق", oninput: function (e) { k.txt = e.target.value; } });
        var tr = h("select", { onchange: function (e) { k.truth = e.target.value === "" ? null : e.target.value === "1"; } }, h("option", { value: "" }, "سرانجام نامعلوم"), h("option", { value: "1", selected: k.truth === true }, "درست بود"), h("option", { value: "0", selected: k.truth === false }, "نادرست بود"));
        cl.appendChild(h("details", { class: "card soft", open: i === c.claims.length - 1 || null }, h("summary", {}, "تصدیق " + fa(i + 1) + ": " + (k.txt || "…")), tx, tr, A.featEditor(k.f, null, "k" + (i + 1))));
      });
    }
    drawClaims();
    box.appendChild(cl);
    box.appendChild(h("button", { class: "btn ghost sm", onclick: function () { c.claims.push({ id: "k" + (c.claims.length + 1), txt: "", role: "مقدمه", f: {}, truth: null }); drawClaims(); } }, "+ تصدیق"));
    var okS = h("select", { onchange: function (e) { c.truth.ok = e.target.value === "1"; } }, h("option", { value: "0", selected: !c.truth.ok }, "فرایند شکست خورد"), h("option", { value: "1", selected: c.truth.ok }, "فرایند سالم بود (نه شانسی)"));
    var failC = h("div", { class: "checks" }, window.EPI_PIPE.filter(function (s) { return s !== "st_intake" && s !== "st_final"; }).map(function (s) { return h("label", { class: "chk" }, h("input", { type: "checkbox", checked: c.truth.fail.indexOf(s) >= 0, onchange: function (e) { c.truth.fail = c.truth.fail.filter(function (x) { return x !== s; }); if (e.target.checked) c.truth.fail.push(s); } }), h("span", {}, stName(s))); }));
    var why = h("textarea", { rows: 3, oninput: function (e) { c.truth.why = e.target.value; } }); why.value = c.truth.why || "";
    var right = h("textarea", { rows: 2, oninput: function (e) { c.truth.right = e.target.value; } }); right.value = c.truth.right || "";
    c.field = c.field || { ok: null, basis: "", src: "" };
    var fOk = h("select", { onchange: function (e) { c.field.ok = e.target.value === "" ? null : e.target.value === "1"; } }, h("option", { value: "" }, "داوری رشته معلوم نیست"), h("option", { value: "1", selected: c.field.ok === true }, "رشته روش را سالم می‌داند"), h("option", { value: "0", selected: c.field.ok === false }, "رشته روش را معیوب می‌داند"));
    var fB = h("input", { type: "text", value: c.field.basis || "", placeholder: "بر چه پایه‌ای (گزارش رسمی، اجماع متخصصان…)", oninput: function (e) { c.field.basis = e.target.value; } });
    box.appendChild(h("div", { class: "card soft" }, h("h3", {}, "محک مستقل از جزوه (برای آزمون ۲)"), h("p", { class: "small muted" }, "سرانجام هر ادعا را بالاتر در هر تصدیق ثبت کن. اینجا بگو خود آن رشته، با معیارهای حرفه‌ای خودش، روش کنشگر را چگونه می‌داند؛ نه با ملاک جزوه."), fOk, fB));
    box.appendChild(h("div", { class: "card soft" }, h("h3", {}, "برچسب با ملاک جزوه (برای آزمون ۱ و کالبدشکافی)"), okS, h("label", {}, "ایستگاه(های) واقعی شکست"), failC, h("label", {}, "تحلیل (با ارجاع به ملاک جزوه)"), why, h("label", {}, "مسیر درست"), right));
    box.appendChild(h("button", { class: "btn", onclick: function () {
      if (!c.title || !c.claims.some(function (k) { return k.txt; })) { A.toast("عنوان و دست‌کم یک تصدیق لازم است.", "bad"); return; }
      if (!c.truth.ok && !c.truth.fail.length) { A.toast("برای شکست، ایستگاه شکست را مشخص کن.", "bad"); return; }
      c.grp = c.grp || c.id; c.addedAt = c.addedAt || new Date().toISOString(); S.put(c); A.toast("ثبت شد و در دوره بعدی بک‌تست هست."); A.go("e_lib", c.id);
    } }, "ثبت پرونده"));
    return box;
  }

  /* ---------- گردآوری با هوش مصنوعی (فقط سازنده؛ همه به صف تأیید) ---------- */
  function schemaText() { return FEAT.map(function (d) { return d.k + "=" + (d.t === "enum" ? d.v.join("|") : d.t); }).join("\n"); }
  function validateCase(o) {
    var errs = []; if (!o || !o.title || !Array.isArray(o.claims)) return ["ساختار نادرست"];
    o.claims.forEach(function (k) { Object.keys(k.f || {}).forEach(function (key) { var d = FM[key]; if (!d) { errs.push("کلید ناشناخته " + key); delete k.f[key]; return; } var v = k.f[key]; if (d.t === "enum" && d.v.indexOf(v) < 0) { errs.push("مقدار نادرست " + key); delete k.f[key]; } if (d.t === "bool" && typeof v !== "boolean") { errs.push("بولی نادرست " + key); delete k.f[key]; } if (d.t === "num") k.f[key] = Math.max(0, Math.min(100, +v || 0)); }); });
    o.truth = o.truth || { ok: false, fail: [] }; o.truth.fail = (o.truth.fail || []).filter(function (s) { return window.EPI_PIPE.indexOf(s) >= 0; });
    return errs;
  }
  /* درخواستِ JSON با یک تلاشِ دوباره (اجرای واقعی با مدلِ production، ۲۰۲۶-۱۰-۱۳): گاهی پاسخِ کاملِ مدل JSON ِ نامعتبر است؛ یک بار دیگر
     همان درخواست فرستاده می‌شود و اگر باز نامعتبر بود، همان خطای قبلی. parse = تابعِ تجزیهٔ خودِ فراخواننده (باید روی خطا throw کند). */
  A.callAIJson = function (system, user, opts, parse) {
    function again() { return A.callAI(system, user, opts).then(function (t2) { return parse(t2); }); }
    // خطای گذرای ارائه‌دهنده (مثلاً ReadTimeout روی پاسخِ بزرگ — همان اجرای واقعی) هم یک بار دوباره
    return A.callAI(system, user, opts).then(function (t) { try { return parse(t); } catch (e) { return again(); } }, function () { return again(); });
  };
  A.parseJSONLoose = function (txt) { var s = String(txt || ""); var i = Math.min.apply(null, ["[", "{"].map(function (ch) { var p = s.indexOf(ch); return p < 0 ? 1e9 : p; })); var j = Math.max(s.lastIndexOf("]"), s.lastIndexOf("}")); return JSON.parse(s.slice(i, j + 1)); };
  function harvestPanel() {
    var n = h("input", { type: "number", min: 1, max: 8, value: 4, id: "hvN" });
    var dom = h("input", { type: "text", id: "hvD", placeholder: "حوزه یا موضوع (اختیاری)، مثلاً «بانکداری و وثیقه» یا «پزشکی»" });
    var out = h("div", { class: "col gap" });
    return h("section", { class: "card col gap" }, h("h2", {}, "گردآوری پرونده با هوش مصنوعی"),
      h("p", { class: "small" }, "هوش مصنوعی فقط پیشنهاد می‌دهد. هر پرونده با ویژگی‌ها و برچسب پیشنهادی‌اش به صف تأیید می‌رود و فقط با تأیید تو وارد آزمون‌ها (بک‌تست) می‌شود. پیش از تأیید، منبع و برچسب را خودت بررسی کن."),
      h("div", { class: "row gap wrap" }, h("label", { for: "hvN" }, "تعداد"), n, dom),
      h("button", { class: "btn", onclick: function (e) {
        var b = e.target; b.disabled = true; b.textContent = "در حال گردآوری…";
        var titles = SEED.concat(userCases()).map(function (c) { return c.title; }).join("؛ ");
        var msg = "تعداد: " + n.value + (dom.value ? "\nحوزه: " + dom.value : "") + "\nاین‌ها را تکرار نکن: " + titles.slice(0, 6000);
        A.callAI(BT.HARVEST_SYS + schemaText() + "\nایستگاه‌های مجاز fail: " + window.EPI_PIPE.join(", "), msg, { maxTokens: 8192 }).then(function (txt) {
          var arr; try { arr = A.parseJSONLoose(txt); } catch (er) { throw new Error("پاسخ JSON معتبر نبود"); }
          if (!Array.isArray(arr)) arr = [arr];
          var nOk = 0; arr.forEach(function (o) { var errs = validateCase(o); o.id = A.uid("ecase"); o.type = "ecase"; o.kind = "real"; o.by = "ai"; o.status = "pending"; o.grp = o.grp ? "ai_" + o.grp : o.id; o.aiErr = errs; S.put(o); nOk++; });
          out.innerHTML = ""; out.appendChild(h("p", {}, fa(nOk) + " پرونده به صف تأیید رفت.")); b.disabled = false; b.textContent = "گردآوری دوباره";
        }).catch(function (err) { A.toast(err.message || String(err), "bad"); b.disabled = false; b.textContent = "گردآوری"; });
      } }, "گردآوری"), out);
  }

  /* ---------- اختلاف‌ها برای داوری (کالبدشکافی) ---------- */
  function autRow(a) {
    return h("div", { class: "autrow" }, h("div", {}, h("strong", {}, a.attr), " · ", h("span", { class: "small muted" }, A.fdate(a.updated))), a.note ? h("p", { class: "small" }, a.note) : null,
      h("div", { class: "row gap wrap" }, (a.rules || []).map(ruleChip), (a.secs || []).map(function (s) { return h("span", { class: "chip" }, "§" + fa(s.slice(1))); })));
  }
  A.epiErrata = function (sec) { return S.all("eaut", function (a) { return (a.secs || []).indexOf(sec) >= 0 && /جزوه/.test(a.attr); }); };
  var ATTR_A = ["قاعده کارخانه حکم جزوه را درست پیاده نکرده (سازنده)", "مثال جزوه بد رمزگذاری شده (سازنده)", "برچسب مثال با متن جزوه نمی‌خواند (سازنده)", "نامعلوم — بررسی بیشتر"];
  A.V.e_aut = function () {
    var root = h("div", { class: "page" });
    root.appendChild(A.head("کارخانه معرفت‌شناسی", "اختلاف‌ها برای داوری", "هر جا نتیجه کارخانه با جواب درست نخواند، اینجا می‌آید تا تو بگویی ایراد از کجاست (جزوه، سازنده، یا خود پرونده). ایرادی که به جزوه نسبت بدهی، زیر همان بخش جزوه و در «جزوه زنده» دیده می‌شود."));
    if (!A.lastThree) A.runThree("A", false);
    var t = A.lastThree;
    function item(cs, stage, info, opts) {
      var secs = [], culprits = [];
      var r = X.runCase(cs, X.DEFAULT_CFG());
      r.claims.forEach(function (k) { k.flags.forEach(function (fl) { fl.rules.forEach(function (id) { if (culprits.indexOf(id) < 0) culprits.push(id); }); }); });
      culprits.forEach(function (id) { var rr = X.RM[id]; if (rr) (rr.sec || []).forEach(function (s) { if (secs.indexOf(s) < 0) secs.push(s); }); });
      var ex = S.all("eaut", function (a) { return a.caseId === cs.id; })[0];
      var sel = h("select", { "aria-label": "علت" }, opts.map(function (x) { return h("option", { value: x, selected: ex && ex.attr === x }, x); }));
      var note = h("textarea", { rows: 2, placeholder: "دقیقاً کجا و چرا؛ اگر ایراد جزوه است، کدام جمله؛ اگر سازنده، کدام قاعده یا ویژگی باید عوض شود" }); note.value = ex ? ex.note : "";
      return h("section", { class: "card" }, h("div", { class: "row between wrap" }, h("button", { class: "linkish", onclick: function () { A.go("e_lib", cs.id); } }, h("strong", {}, cs.title)), h("span", { class: "chip" }, stage === "a" ? "آزمون ۱" : "آزمون ۲")),
        h("p", { class: "small" }, info), culprits.length ? h("div", { class: "row gap wrap" }, h("span", { class: "small" }, "قاعده‌هایی که پرچم زدند: "), culprits.map(ruleChip)) : h("p", { class: "small muted" }, "هیچ قاعده‌ای پرچم نزد."),
        h("div", { class: "row gap wrap mt" }, sel, h("button", { class: "btn sm", onclick: function () {
          var a = ex || { id: "eaut_" + cs.id, type: "eaut", caseId: cs.id };
          a.attr = sel.value; a.note = note.value; a.rules = culprits; a.secs = secs; a.stage = stage; S.put(a); A.toast("ثبت شد" + (/جزوه/.test(a.attr) ? "؛ زیر بخش‌های جزوه نمایش داده می‌شود" : "")); A.render();
        } }, ex ? "به‌روزرسانی" : "ثبت علت")), note);
    }
    root.appendChild(h("h2", {}, "از آزمون ۱: ناهمخوانی کارخانه با خود جزوه (" + fa(t.a.bad.length) + ")"));
    root.appendChild(h("p", { class: "small muted" }, "محک اینجا خود جزوه است، پس هر ناهمخوانی خطای سازنده است. پیش از هر داوری درباره جزوه، این‌ها باید درست شوند."));
    if (!t.a.bad.length) root.appendChild(A.empty("موردی نیست؛ کارخانه همه مثال‌های جزوه را مثل خود جزوه داوری کرد."));
    t.a.bad.forEach(function (x) { root.appendChild(item(x.cs, "a", "حکم جزوه: " + (x.cs.truth.ok ? "سالم" : "خطا در " + (x.cs.truth.fail || []).map(stName).join("، ")) + " · کارخانه: " + (x.res.healthy ? "سالم" : "خطا در " + x.res.flagged.map(stName).join("، ")), ATTR_A)); });
    root.appendChild(h("h2", { class: "mt" }, "از آزمون ۲: اختلاف کارخانه با داوری رشته‌ها (" + fa(t.b.disagree.length) + ")"));
    root.appendChild(h("p", { class: "small muted" }, t.a.ok ? "آزمون ۱ قبول است، پس کارخانه همان جزوه است و این اختلاف‌ها پرسش واقعی از جزوه‌اند، مگر رمزگذاری یا برچسب رشته خطا باشد." : "آزمون ۱ هنوز رد است؛ تا درست نشود، این اختلاف‌ها را نمی‌شود به گردن جزوه انداخت."));
    t.b.disagree.forEach(function (x) { var fl = X.fieldOf(x.cs); root.appendChild(item(x.cs, "b", "داوری رشته: " + (x.ok ? "روش سالم" : "روش معیوب") + (fl && fl.field && fl.field.basis ? " — " + fl.field.basis : "") + " · کارخانه: " + (x.res.healthy ? "سالم" : "خطا در " + x.res.flagged.map(stName).join("، ")), BT.ATTR)); });
    var led = S.all("eaut");
    root.appendChild(h("section", { class: "card mt" }, h("h2", {}, "دفتر علت‌ها (" + fa(led.length) + ")"), led.length ? ATTR_A.concat(BT.ATTR).filter(function (v, i, a) { return a.indexOf(v) === i; }).map(function (at) { var xs = led.filter(function (a) { return a.attr === at; }); return xs.length ? h("div", {}, h("h3", {}, at + " (" + fa(xs.length) + ")"), xs.map(function (a) { var cs = SEEDM[a.caseId] || S.get(a.caseId); return h("div", {}, h("button", { class: "linkish small", onclick: function () { A.go("e_lib", a.caseId); } }, cs ? cs.title : a.caseId), autRow(a)); })) : null; }) : h("p", { class: "muted" }, "هنوز علتی ثبت نشده.")));
    return root;
  };

  /* ---------- جزوه زنده ---------- */
  function ruleStatus(r, sens) {
    var err = S.all("eaut", function (a) { return (a.rules || []).indexOf(r.id) >= 0; });
    var s = sens && sens.filter(function (x) { return x.id === r.id; })[0];
    if (err.some(function (a) { return /جزوه/.test(a.attr); })) return { t: "ایراد به جزوه ثبت شده", c: "bad", err: err };
    if (!s || !s.fires) return { t: "روی وقایع واقعی آزموده نشده (فقط مثال‌های جزوه و سناریوهای کاشته)", c: "", err: err };
    if (s.onSound && !s.onFlawed) return { t: "پرسش از جزوه: فقط روی روش‌های سالمِ رشته فعال شد", c: "bad", err: err };
    if (s.onSound) return { t: "با تاریخ می‌خواند، با " + fa(s.onSound) + " مورد پرسش‌برانگیز (روی " + fa(s.onFlawed) + " روش معیوب درست فعال شد)", c: "warn", err: err };
    return { t: "با تاریخ می‌خواند (روی " + fa(s.onFlawed) + " روش معیوب درست فعال شد)", c: "good", err: err };
  }
  A.snapshotLiving = function (why) {
    if (!A.lastThree) A.runThree("A", false);
    var t = A.lastThree, vs = S.all("eliving"), v = vs.length + 1;
    S.put({ id: "eliv_" + v, type: "eliving", v: v, why: why || "", rules: (window.EPI_RULES || []).map(function (r) { var s = ruleStatus(r, t.sens); return { id: r.id, st: s.t, err: s.err.length }; }), m: { a: t.a.ok, agree: t.b.agree, lb: t.b.lb } });
  };
  A.V.e_living = function (arg, focus) {
    var root = h("div", { class: "page" });
    if (!A.lastThree) A.runThree("A", false);
    var t = A.lastThree, vs = S.all("eliving").sort(function (a, b) { return b.v - a.v; });
    root.appendChild(A.head("کارخانه معرفت‌شناسی", "جزوه زنده", "همه قاعده‌های جزوه یک‌جا: متن پشتوانه هرکدام، نتیجه‌اش در آزمون‌ها، و ایرادهایی که ثبت کرده‌ای. هر بار نسخه تازه ثبت کنی، تغییرات نسبت به نسخه قبل نشان داده می‌شود."));
    root.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm", onclick: function () { A.snapshotLiving("ثبت دستی"); A.toast("نسخه ثبت شد"); A.render(); } }, "ثبت نسخه تازه"),
      h("span", { class: "small muted" }, vs.length ? "آخرین نسخه: شماره " + fa(vs[0].v) + "، ثبت‌شده در " + A.fdate(vs[0].updated) + (vs[0].why ? "، " + vs[0].why : "") : "هنوز نسخه‌ای ثبت نشده")));
    if (vs.length > 1) {
      var a = vs[0], b = vs[1], diff = a.rules.filter(function (r) { var o = b.rules.filter(function (x) { return x.id === r.id; })[0]; return !o || o.st !== r.st || o.err !== r.err; });
      root.appendChild(h("section", { class: "card soft" }, h("h3", {}, "تغییر نسخه " + fa(a.v) + " نسبت به " + fa(b.v) + " (" + fa(diff.length) + " قاعده)"), diff.length ? h("ul", { class: "small" }, diff.map(function (r) { return h("li", {}, ruleChip(r.id), " — " + r.st); })) : h("p", { class: "small muted" }, "بی‌تغییر")));
    }
    (E ? E.HALLS : []).forEach(function (H) {
      var sts = A.ESTL.filter(function (s) { return s.hall === H.n; });
      var sec = h("section", { class: "card" }, h("h2", {}, "سالن " + fa(H.n) + " · " + H.fa));
      sts.forEach(function (s) {
        var rs = (window.EPI_RULES || []).filter(function (r) { return r.st === s.id; });
        sec.appendChild(h("h3", {}, stChip(s.id), " ", h("span", { class: "small muted" }, fa(rs.length) + " قاعده")));
        if (!rs.length) { sec.appendChild(h("p", { class: "small muted" }, "این ایستگاه هنوز قاعده خودکار ندارد؛ ملاک‌هایش را فقط با کاربرگ خود ایستگاه می‌شود اجرا کرد.")); return; }
        rs.forEach(function (r) {
          var stt = ruleStatus(r, t.sens);
          sec.appendChild(h("div", { class: "lrule" + (focus === r.id ? " focus" : ""), id: "lr-" + r.id }, h("div", { class: "row between wrap" }, h("strong", {}, r.fa), h("span", { class: "pill " + stt.c }, stt.t)),
            h("p", {}, r.stmt), h("p", { class: "small" }, r.eff === "cap" ? "اثر: اعتبار ادعا حداکثر " + (window.EPI_FOUND && window.EPI_FOUND.capText ? window.EPI_FOUND.capText(r).replace(/\d+(\.\d+)?/g, function (n) { return fa(+n); }) : fa(r.cap) + "٪") : "اثر: خطا در این ایستگاه", " ", r.basis === "system" ? h("span", { class: "chip" }, "عدد یا صورت‌بندی از سامانه") : h("span", { class: "chip good" }, "حکم جزوه")),
            r.note ? h("p", { class: "small muted" }, r.note) : null, r.fix ? h("p", { class: "small" }, h("strong", {}, "مسیر درست: "), r.fix) : null,
            h("div", { class: "row gap wrap" }, (r.sec || []).map(function (sc) { return h("button", { class: "tlink sec", onclick: function () { A.go("e_book", sc); } }, "§" + fa(sc.slice(1))); })),
            stt.err.length ? h("div", { class: "errata" }, h("strong", {}, "علت‌های ثبت‌شده:"), stt.err.map(autRow)) : null));
        });
      });
      root.appendChild(sec);
    });
    if (focus) setTimeout(function () { var el = document.getElementById("lr-" + focus); if (el) el.scrollIntoView({ block: "center" }); }, 40);
    return root;
  };

  /* ---------- داوری قطعی برای پرونده انسانی کارخانه ---------- */
  A.caseEngine = function (cs) {
    var claims = ((cs.st && cs.st.st_tasdiq && cs.st.st_tasdiq.data && cs.st.st_tasdiq.data.claims) || []).map(function (r) { return (r.txt || "").trim(); });
    cs.feat = cs.feat || {};
    var root = h("div", { class: "page" });
    root.appendChild(A.head("پرونده · داوری قطعی (خودکار)", cs.title, "برای هر ادعای پرونده چند ویژگی را علامت بزن (رمزگذاری). بعد همان قاعده‌های آزموده‌شده جزوه، بی‌هیچ هوش مصنوعی، نشان می‌دهند هر ادعا حداکثر چقدر معتبر است و اولین خطا کجاست. این نظر دوم است، نه جایگزین داوری تو.", h("div", { class: "row gap" }, h("button", { class: "btn ghost sm", onclick: function () { A.go("e_case", cs.id); } }, "← بازگشت به پرونده"))));
    if (!claims.length) { root.appendChild(A.empty("اول در ایستگاه «تصور یا تصدیق» تصدیق‌ها را ثبت کن.")); return root; }
    var out = h("div", { class: "col gap" });
    function calc() {
      out.innerHTML = "";
      var tmp = { claims: claims.map(function (t, i) { return { id: "k" + (i + 1), txt: t, f: cs.feat[i + 1] || {} }; }) };
      var r = X.runCase(tmp, A.btCfg());
      out.appendChild(h("section", { class: "card verdict " + (r.healthy ? "okv" : "badv") }, h("h2", {}, r.healthy ? "داوری قطعی خطایی ندید" : "نخستین نقطه خطا: " + stName(r.first)), r.fixes.length ? h("ul", {}, r.fixes.map(function (x) { return h("li", {}, x); })) : null));
      tmp.claims.forEach(function (k, i) { out.appendChild(h("section", { class: "card" }, h("h3", {}, fa(i + 1) + ". " + k.txt), claimEngine(k, r.claims[i]))); });
    }
    var save = A.debounce(function () { S.put(cs); calc(); }, 300);
    /* کاربرگ ⇒ رمزگذاری (ممیزی ۲۰۲۶-۱۰-۱۳: موتور کاربرگ‌ها را نمی‌دید؛ «نقل» با اطمینانِ ۹۵ «خطایی ندید» می‌گفت).
       فقط خانه‌های خالی پر می‌شوند — انتخابِ دستیِ تو دست نمی‌خورد: راه از «راه معرفت هر تصدیق»، اطمینان از «درجهٔ نهایی» ِ «حکم نهایی»،
       بهای خطا از «هزینه خطا» ِ پذیرش (۱–۲ کم، ۳ متوسط، ۴–۵ زیاد). */
    var filled = [];
    (function prefill() {
      var D = function (sid) { return (cs.st && cs.st[sid] && cs.st[sid].data) || {}; };
      var ways = (D("st_route").ways || []).filter(function (r) { return r && r.c && r.w; }).sort(function (a, b) { return (+a.ord || 99) - (+b.ord || 99); });
      var fin = (D("st_final").final || []).filter(function (r) { return r && r.c; }), stk = +D("st_intake").stakes;
      claims.forEach(function (t, i) {
        var f = cs.feat[i + 1] = cs.feat[i + 1] || {}, n = String(i + 1), w = ways.filter(function (r) { return String(r.c) === n; })[0], fr = fin.filter(function (r) { return String(r.c) === n; })[0];
        if (f.way == null && w) { f.way = w.w; filled.push(fa(i + 1) + ": راه ← " + w.w); }
        if (f.conf == null && fr && fr.p !== "" && fr.p != null && !isNaN(+String(fr.p).replace(/[۰-۹]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); }))) { f.conf = Math.max(0, Math.min(100, +String(fr.p).replace(/[۰-۹]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); }))); filled.push(fa(i + 1) + ": اطمینان ← " + fa(f.conf) + "٪"); }
        if (f.stakes == null && stk >= 1) { f.stakes = stk <= 2 ? "کم" : stk === 3 ? "متوسط" : "زیاد"; filled.push(fa(i + 1) + ": بهای خطا ← " + f.stakes); }
      });
      if (filled.length && !(cs.outcomeAt && cs.fwdAt)) S.put(cs);
    })();
    if (filled.length) root.appendChild(h("p", { class: "small card soft feat-prefill", dir: "rtl" }, "از کاربرگ‌های همین پرونده پر شد (فقط خانه‌های خالی؛ قابلِ تغییر): " + filled.join(" · ")));
    claims.forEach(function (t, i) { cs.feat[i + 1] = cs.feat[i + 1] || {}; root.appendChild(h("details", { class: "card", open: i === 0 || null }, h("summary", {}, h("strong", {}, "رمزگذاری تصدیق " + fa(i + 1) + ": "), t), A.featEditor(cs.feat[i + 1], save, "c" + (i + 1)))); });
    root.appendChild(out); calc();
    /* اگر نتیجه پیش از اولین رمزگذاری ثبت شده، این پرونده «پس‌نگر» است و به دفترِ پیش‌رو نمی‌رود (ممیزی ۲۰۲۶-۱۰-۱۳) */
    if (!cs.fwdAt) { cs.fwdAt = new Date().toISOString(); if (cs.outcomeAt || Object.keys(cs.outcome || {}).some(function (k) { return cs.outcome[k]; })) cs.fwdLate = true; S.put(cs); }
    root.appendChild(h("section", { class: "card soft" }, h("h3", {}, "دفتر پیش‌رو"), h("p", { class: "small" }, "این رمزگذاری پیش از معلوم شدن نتیجه ثبت شد (" + A.fdate(cs.fwdAt) + "). وقتی نتیجه واقعی در «حکم نهایی» ثبت شود، این پرونده با برچسب‌گذاری تو وارد دفتر پیش‌رو می‌شود. دفتر پیش‌رو سخت‌ترین آزمون سامانه است، چون دانش پسینی در آن نیست."),
      h("button", { class: "btn ghost sm", onclick: function () {
        var fin = cs.st && cs.st.st_final && cs.st.st_final.data; var outc = cs.outcome || {};
        if (!fin || !Object.keys(outc).length) { A.toast("اول نتیجه واقعی را در «حکم نهایی» ثبت کن.", "bad"); return; }
        if (cs.fwdLate || (cs.outcomeAt && cs.fwdAt > cs.outcomeAt)) { A.toast("رمزگذاریِ این پرونده پس از معلوم‌شدنِ نتیجه انجام شد؛ دفترِ پیش‌رو فقط رمزگذاریِ پیش از نتیجه را می‌پذیرد (وگرنه آزمونِ ۳ با دانستنِ جواب باد می‌کند).", "bad"); return; }
        var featUse = cs.featFrozen || cs.feat || {};   // رمزگذاریِ لحظهٔ نتیجه، نه ویرایش‌های بعدی
        var anyFalse = Object.keys(outc).some(function (k) { return outc[k] === "نادرست"; });
        var c2 = { id: "ecase_fw_" + cs.id, type: "ecase", kind: "forward", by: "user", status: "approved", title: cs.title, dom: "زندگی روزمره", year: new Date().getFullYear(), grp: cs.id, src: [], story: (cs.st.st_intake && cs.st.st_intake.data.input) || "", actor: "خودم",
          claims: claims.map(function (t, i) { return { id: "k" + (i + 1), txt: t, f: featUse[i + 1] || {}, truth: outc[String(i + 1)] === "درست" ? true : outc[String(i + 1)] === "نادرست" ? false : null }; }),
          truth: { ok: !anyFalse, fail: [], why: "برچسب از نتیجه واقعی پرونده انسانی", right: "" }, field: { ok: null, basis: "پرونده پیش‌رو: محک، سرانجام واقعی ادعاهاست" }, out: (function () { var o = {}; claims.forEach(function (t, i) { var v = outc[String(i + 1)]; o["k" + (i + 1)] = v === "درست" ? true : v === "نادرست" ? false : null; }); return o; })(), encodedAt: cs.fwdAt, addedAt: new Date().toISOString() };
        S.put(c2); A.toast("به دفتر پیش‌رو رفت (آزمون ۳)."); A.go("e_lib", c2.id);
      } }, "افزودن به دفتر پیش‌رو (پس از معلوم شدن نتیجه)")));
    return root;
  };
})(APP);
