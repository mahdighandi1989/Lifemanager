/* ===== گذر از تونل‌های حلِ مسئله: فهم ⇐ حدس ⇐ ایستِ پیشرفت ⇐ وارسیِ گام‌ها ⇐ بازنگری ⇐ مرورِ فاصله‌دار (a36_solve.js) =====
   خواستهٔ مالک (۲۰۲۶-۱۰-۱۵): «نمی‌خوام یه سیستمِ موازی داخلش باشه … سیستم رو جوری قرار بدیم که حسبِ اون مسئله خودش از دلِ تونل‌های
   لازم بگذره». پس این پرونده نما، منو یا زبانهٔ تازه نمی‌سازد؛ فقط تکه‌هایی است که شبیه‌سازِ مسئله‌ها (a8_prob.js)، «افزودنِ مسئلهٔ تو»،
   «درس‌ها»، کارت‌های مرور، مسئله‌های هم‌ساختار (a20)، ایستگاهِ «راه عقل و برهان» ِ کارخانه و «امروز» در لحظهٔ درستِ حل صدا می‌زنند.
   منبعِ روش (فقط یادداشتِ کد، نه برچسبِ صفحه): «چگونه آن را حل کنیم» ِ جرج پولیا — ممیزیِ پوششِ ۲۰۲۶-۱۰-۱۵، تغییرهای ت۱ (کارتِ فهم)،
   ت۲ (بازنگری)، ت۸ (وارسیِ گام‌ها)، ت۹ (ایستِ پیشرفت و کنارگذاشتن)، ت۱۰ (حدس و آزمونِ حدس)، ت۱۴ (یافتنی/اثباتی).
   قواعد:
   • هر پاسخِ یادگیرنده به قلمِ خودِ اوست (data-own): دستیار و هوش مصنوعی هیچ‌کدام از این فیلدها را پر نمی‌کنند.
   • نمرهٔ قراردادی نیست: خودارزیابیِ ۰/۱/۲ (همان روبریکِ صفحه) فقط نوبتِ بعدی را روی نردبانِ ۱/۳/۷/۲۱/۶۰ روز جابه‌جا می‌کند (A.knextIv)؛
     تنها عددی که به «🧠 کارنامهٔ ذهن» می‌رود جفتِ «اطمینانِ حدس ↔ درست بود/نبود» است (کالیبراسیون، همان A3+A4).
   • دسترس‌نبودن مانعِ کار نیست: کارت‌ها بالای گامِ ۱ و بالای «پایانِ سطح» پیشنهاد می‌شوند؛ اگر بی آن‌ها جلو بروی «ناتمام» ثبت می‌شود و
     فردا در «امروز» برمی‌گردد (تمرین را خودِ همین بخش می‌سازد و در A.dueList می‌آید — زمان‌بندِ موازی نیست).
   داده: همه در همان رکوردِ پیشرفتِ مسئله (eprog_<pid>.solve) — نوعِ رکوردِ تازه‌ای ساخته نمی‌شود:
     { type, u:{lv:{…}}, g:{lv:{…}}, b:{lv:{…}}, lessons:[…], chk:{key:{…}}, cps:[…], aside, incub:[…], rev:{u|b|g|c:{iv,due,hist}} } */
(function (A) {
  if (!A.S || !A.V) return;
  var h = A.h, fa = A.fa, S = A.S;
  var LADDER = [1, 3, 7, 21, 60];
  function nextIv(iv, ok) { if (A.knextIv) return A.knextIv(iv, ok); if (!ok) return 1; for (var i = 0; i < LADDER.length; i++) if (LADDER[i] > (iv || 0)) return LADDER[i]; return LADDER[LADDER.length - 1]; }
  function nowISO() { return new Date().toISOString(); }
  function tomorrow() { return A.addDays(A.today(), 1); }
  function prog(pid) { return S.get("eprog_" + pid) || { id: "eprog_" + pid, type: "eprog", lv: {} }; }
  function sol(pg) {
    var s = pg.solve = pg.solve || {};
    ["u", "g", "b", "chk", "rev"].forEach(function (k) { s[k] = s[k] || {}; });
    ["lessons", "cps", "incub"].forEach(function (k) { s[k] = s[k] || []; });
    return s;
  }
  function txt(v) { return String(v == null ? "" : v).trim(); }
  function own(attrs) { attrs = attrs || {}; attrs["data-own"] = "1"; attrs.dir = "rtl"; return attrs; }
  A.solveOf = function (pid) { var pg = S.get("eprog_" + pid); return pg && pg.solve ? pg.solve : null; };

  /* ---------- نوعِ مسئله (ت۱۴): قالبِ فهم و پرسش‌های طرح‌ریزی با نوع عوض می‌شوند ---------- */
  var TYPES = {
    find: { fa: "یافتنی — چیزی را باید پیدا کنی (عدد، شکل، راه، تصمیم)", u: "مجهول (خواسته) چیست؟", d: "داده‌ها چیست؟", c: "شرط چیست؟ بخش‌هایش را جدا بنویس",
      suff: "آیا شرط برای تعیینِ مجهول کافی است؟ زائد است؟ متناقض است؟", ans: "پاسخ نهایی (مجهولِ یافته‌شده) و حل‌کننده",
      plan: ["به مجهول نگاه کن: مسئله‌ای می‌شناسی که همین مجهول (یا مجهولی شبیه) را داشته باشد؟", "فقط بخشی از شرط را نگه دار و بقیه را رها کن: مجهول تا چه حد معین می‌شود و چطور تغییر می‌کند؟",
        "از داده‌ها چیزِ سودمندی بیرون می‌کشی؟ همهٔ داده‌ها و کلِ شرط را به کار برده‌ای؟", "مسئلهٔ کمکیِ ساده‌تری هست — حالتِ خاص‌تر، کلی‌تر یا مشابه؟"] },
    prove: { fa: "اثباتی — باید نشان بدهی حکمی درست است", u: "حکم (آنچه باید ثابت شود) چیست؟", d: "فرض (آنچه داده شده) چیست؟", c: "بخش‌های فرض را جدا بنویس",
      suff: "آیا همهٔ فرض لازم است؟ اگر بخشی از فرض را کنار بگذاری، حکم هنوز برقرار است؟ فرض‌ها با هم سازگارند؟", ans: "خلاصهٔ برهان (یا ردِ حکم) و حل‌کننده",
      plan: ["به حکم نگاه کن: قضیه‌ای می‌شناسی که همین حکم (یا حکمی شبیه) را داشته باشد؟", "فقط بخشی از فرض را نگه دار: حکم هنوز برقرار است؟ اگر نه، کدام بخش لازم بود؟",
        "از فرض چیزِ سودمندی بیرون می‌کشی؟ همهٔ فرض را به کار برده‌ای؟", "حکمِ ساده‌تری که به این حکم برسد پیدا می‌کنی (لم)؟ از حکم به عقب برو: از چه چیزی این حکم لازم می‌آید؟"] },
    pod: { fa: "اثبات یا رد کن — هنوز نمی‌دانی حکم درست است یا نه", u: "حکمی که باید درستی یا نادرستی‌اش را نشان بدهی چیست؟", d: "فرض (آنچه داده شده) چیست؟", c: "بخش‌های فرض را جدا بنویس",
      suff: "آیا فرض برای داوری کافی است؟ زائد یا متناقض نیست؟", ans: "داوری (درست/نادرست) با برهان یا مثالِ نقض، و حل‌کننده",
      plan: ["پیش از اثبات، حالت‌های خاص و حدی را بیازما: مثالِ نقضی پیدا می‌شود؟", "اگر حکم درست است، به حکم نگاه کن: قضیه‌ای با همین حکم می‌شناسی؟",
        "اگر نادرست است، کوچک‌ترین مثالِ نقض را بساز و نشان بده کدام بخشِ فرض را برآورده می‌کند.", "فقط بخشی از فرض را نگه دار: حکم هنوز برقرار است؟"] }
  };
  A.SOLVE_TYPES = TYPES;
  function typeOf(p, s) { var t = (s && s.type) || (p && p.kind); return TYPES[t] ? t : "find"; }
  function typeSel(id, val, onPick) {
    return h("div", { class: "col" }, h("label", { for: id }, "نوعِ مسئله"),
      h("select", { id: id, class: "sv-type", onchange: function (e) { onPick(e.target.value); } }, Object.keys(TYPES).map(function (k) { return h("option", { value: k, selected: val === k }, TYPES[k].fa); })));
  }
  function field(id, label, val, onIn, rows, ph) {
    var el = rows ? h("textarea", { id: id, rows: rows, placeholder: ph || "", oninput: function (e) { onIn(e.target.value); } }) : h("input", { id: id, type: "text", placeholder: ph || "", oninput: function (e) { onIn(e.target.value); } });
    el.value = val || "";
    return h("div", { class: "col" }, h("label", { for: id }, label), el);
  }
  function selF(id, label, opts, val, onPick) {
    return h("div", { class: "col" }, h("label", { for: id }, label), h("select", { id: id, onchange: function (e) { onPick(e.target.value); } }, h("option", { value: "" }, "—"), opts.map(function (o) { var v = Array.isArray(o) ? o[0] : o; return h("option", { value: v, selected: val === v }, Array.isArray(o) ? o[1] : o); })));
  }
  function planList(t, cls) {
    return h("details", { class: "small sv-plan " + (cls || ""), dir: "rtl" }, h("summary", {}, "پرسش‌هایی که در این مسئلهٔ " + (t === "find" ? "یافتنی" : t === "prove" ? "اثباتی" : "«اثبات یا رد کن»") + " از خودت می‌پرسی"),
      h("ul", {}, TYPES[t].plan.map(function (q) { return h("li", {}, q); })));
  }

  /* ---------- نردبانِ مرورِ فاصله‌دار (u فهم، b بازنگری، g آزمونِ حدس، c گامِ ضعیف) ---------- */
  var PH = { u: "فهمِ مسئله (بی‌نگاه)", b: "درسِ بازنگری و کاربستش", g: "آزمودنِ حدس با حالتِ خاص یا مثالِ نقض", c: "گامِ ضعیفِ حلت" };
  function seed(s, ph) { if (!s.rev[ph]) s.rev[ph] = { iv: 0, due: tomorrow(), hist: [] }; }
  function grade(s, ph, self) {
    var r = s.rev[ph] || (s.rev[ph] = { iv: 0, due: A.today(), hist: [] }), d = A.today();
    (r.hist = r.hist || []).push({ at: nowISO(), d: d, self: self });
    if (r.hist.length > 40) r.hist = r.hist.slice(-40);
    r.iv = nextIv(r.iv, self === 2); r.due = A.addDays(d, r.iv);
  }
  A.solveGrade = grade;
  function duePh(s) { var t = A.today(); return Object.keys(PH).filter(function (k) { return s.rev[k] && s.rev[k].due && s.rev[k].due <= t; }); }
  /* کارتِ «ناتمام»: فهم یا بازنگری‌ای که بی‌نوشتن از کنارش گذشتی */
  function pending(s) { var o = []; ["u", "b"].forEach(function (k) { Object.keys(s[k]).forEach(function (lv) { var x = s[k][lv]; if (x && x.skipped && !x.done) o.push({ k: k, lv: +lv }); }); }); return o; }
  function gradeBtns(onPick, lab) {
    return h("div", own({ class: "row gap wrap sv-grade" }), h("span", { class: "small" }, lab || "خودت داوری کن:"),
      [0, 1, 2].map(function (v) { return h("button", { class: "btn ghost sm sv-g" + v, type: "button", "data-v": v, onclick: function () { onPick(v); } }, ["۰ نه", "۱ تاحدی", "۲ کامل"][v]); }));
  }

  /* ---------- ت۱ + ت۱۴ + ت۱۰: کارتِ «فهمِ مسئله» پیش از گامِ ۱ ِ هر سطح (و در سطحِ ۳–۴ حدس با اطمینان) ---------- */
  var DRAFT = {};
  function uCard(p, pg, lv) {
    var s = sol(pg), key = p.id + "|" + lv, prev = s.u[lv] && !s.u[lv].skipped ? s.u[lv] : null;
    var base = prev || s.u[lv - 1] || s.u[0] || {};
    var d = DRAFT[key] = DRAFT[key] || { type: typeOf(p, s), u: lv === 1 ? base.u || "" : "", d: lv === 1 ? base.d || "" : "", c: lv === 1 ? base.c || "" : "", suff: "", suffWhy: "", fig: lv === 1 ? base.fig || "" : "", drawn: false, guess: "", conf: "70", test: "", testRes: "", peek: lv === 1 };
    var T = TYPES[d.type] || TYPES.find;
    var box = h("section", own({ class: "card sv-u", "data-lv": lv }), h("div", { class: "eyebrow" }, "پیش از نخستین حرکت · سطحِ " + fa(lv)),
      h("h3", {}, "مسئله را بفهم: " + (d.type === "find" ? "مجهول، داده‌ها، شرط" : "حکم، فرض")),
      h("p", { class: "small" }, lv === 1 ? "صورت را بخوان و با جمله‌های خودت بنویس. یک شکل یا جدول بکش و برای چیزها نام بگذار. بعد با صورت مقایسه کن و خودت داوری کن." :
        "این بار بی‌نگاه به صورت بنویس — همان‌طور که در ذهنت مانده؛ بعد با صورت مقایسه کن. اگر لازم شد نگاه کنی، ثبت می‌شود."));
    var stmt = h("div", { class: "card soft small sv-stmt" }, String(p.statement || "").split("\n").map(function (x) { return h("p", {}, x); }));
    if (d.peek) box.appendChild(stmt);
    else box.appendChild(h("button", { class: "btn ghost sm sv-peek", type: "button", onclick: function (e) { d.peek = true; d.peeked = true; e.currentTarget.replaceWith(stmt); } }, "نگاه به صورتِ مسئله (ثبت می‌شود)"));
    box.appendChild(typeSel("svType" + lv, d.type, function (v) { d.type = v; A.render(); }));
    box.appendChild(field("svU" + lv, T.u, d.u, function (v) { d.u = v; }, 2));
    box.appendChild(field("svD" + lv, T.d, d.d, function (v) { d.d = v; }, 2));
    box.appendChild(field("svC" + lv, T.c, d.c, function (v) { d.c = v; }, 3, "هر بخش در یک سطر"));
    box.appendChild(selF("svSuff" + lv, T.suff, ["کافی است", "ناکافی است — چیزی کم است", "زائد دارد — بخشی لازم نیست", "متناقض است", "هنوز نمی‌دانم"], d.suff, function (v) { d.suff = v; }));
    box.appendChild(field("svSuffW" + lv, "چرا؟ (یک جمله)", d.suffWhy, function (v) { d.suffWhy = v; }, 0));
    box.appendChild(field("svFig" + lv, "شکل، جدول یا نام‌گذاری: نمادهایت را بنویس (هر نماد برای چه)", d.fig, function (v) { d.fig = v; }, 2, "مثلاً a = طولِ ضلع، t = زمان… یا ستون‌های جدولت"));
    box.appendChild(h("label", { class: "row gap small", for: "svDrawn" + lv }, h("input", { type: "checkbox", id: "svDrawn" + lv, checked: !!d.drawn, onchange: function (e) { d.drawn = e.target.checked; } }), "شکل یا جدول را روی کاغذ کشیدم"));
    if (lv >= 3) {
      box.appendChild(h("h4", {}, "پیش از حل: حدس بزن"));
      box.appendChild(field("svGuess" + lv, "حدست دربارهٔ جواب (یا ماهیتش) چیست؟", d.guess, function (v) { d.guess = v; }, 2, "مثلاً «جواب عددی زوج است» یا «حکم نادرست است»"));
      box.appendChild(selF("svConf" + lv, "چقدر به حدست مطمئنی؟", ["50", "60", "70", "80", "90", "100"].map(function (x) { return [x, fa(x) + "٪"]; }), d.conf, function (v) { d.conf = v; }));
      box.appendChild(field("svTest" + lv, "حدست را بیازما: یک حالتِ خاص، حالتِ حدی یا مثالِ نقض بنویس که می‌تواند ردش کند", d.test, function (v) { d.test = v; }, 2));
      box.appendChild(selF("svTestR" + lv, "این آزمون چه نشان داد؟", ["حدس سالم ماند", "حدس رد شد — حدسِ تازه لازم است", "نتوانستم بیازمایم"], d.testRes, function (v) { d.testRes = v; }));
    }
    box.appendChild(planList(d.type));
    var out = h("div", { "aria-live": "polite", class: "col gap" });
    box.appendChild(h("button", { class: "btn sv-usave", type: "button", onclick: function (e) {
      var miss = [[d.u, T.u], [d.d, T.d], [d.c, T.c]].filter(function (x) { return txt(x[0]).length < 3; }).map(function (x) { return "«" + x[1] + "»"; });
      if (!d.suff) miss.push("«" + T.suff + "»");
      if (lv >= 3 && txt(d.guess).length < 3) miss.push("«حدس»");
      if (miss.length) { A.toast("اول این‌ها را بنویس: " + miss.join("، "), "bad"); return; }
      e.currentTarget.disabled = true;
      out.appendChild(h("div", { class: "card soft small sv-ucmp" }, h("strong", {}, "صورتِ مسئله:"), String(p.statement || "").split("\n").map(function (x) { return h("p", {}, x); }),
        p.udc && (p.udc.u || p.udc.d || p.udc.c) ? h("div", {}, h("strong", {}, "خوانشِ مرجعِ تجزیه (فقط برای مقایسه):"), h("ul", {}, [["u", T.u], ["d", T.d], ["c", T.c]].map(function (k) { return p.udc[k[0]] ? h("li", {}, k[1] + " " + p.udc[k[0]]) : null; }))) : null,
        prev || s.u[lv - 1] ? h("p", { class: "muted" }, "نوشتهٔ پیشینِ خودت: " + [base.u, base.d, base.c].filter(Boolean).join(" · ")) : null,
        h("p", {}, "۲ = مجهول/حکم، همهٔ داده‌ها/فرض و همهٔ بخش‌های شرط درست و کامل؛ ۱ = یکی جا افتاد یا مبهم بود؛ ۰ = مسئله را جورِ دیگری فهمیده بودی.")));
      out.appendChild(gradeBtns(function (v) {
        var rec = { type: d.type, u: txt(d.u), d: txt(d.d), c: txt(d.c), suff: d.suff, suffWhy: txt(d.suffWhy), fig: txt(d.fig), drawn: !!d.drawn, peek: !!d.peeked, self: v, at: nowISO(), done: true };
        s.type = d.type; s.u[lv] = rec; seed(s, "u");
        if (lv >= 3) { s.g[lv] = { guess: txt(d.guess), conf: +d.conf || null, test: txt(d.test), testRes: d.testRes, at: nowISO() }; if (txt(d.test)) seed(s, "g"); }
        S.put(pg); delete DRAFT[key]; A.toast("فهمِ تو ثبت شد؛ از فردا بی‌نگاه مرور می‌شود."); A.render();
      }, "فهمت با صورت چقدر می‌خواند؟"));
    } }, "ثبت و مقایسه با صورتِ مسئله"));
    box.appendChild(out);
    return box;
  }
  A.solveUCard = uCard;
  function uSummary(p, pg, lv) {
    var s = sol(pg), x = s.u[lv], t = typeOf(p, s), T = TYPES[t];
    if (!x || x.skipped) return null;
    var g = s.g[lv];
    return h("details", { class: "small sv-usum", dir: "rtl" }, h("summary", {}, "فهمِ تو از مسئله (" + (t === "find" ? "یافتنی" : t === "prove" ? "اثباتی" : "اثبات یا رد") + ")" + (g && g.guess ? " و حدست" : "")),
      h("ul", {}, h("li", {}, T.u + " " + x.u), h("li", {}, T.d + " " + x.d), h("li", {}, T.c + " " + x.c), x.fig ? h("li", {}, "نمادها: " + x.fig) : null, g && g.guess ? h("li", {}, "حدست: " + g.guess + (g.conf ? " (اطمینان " + fa(g.conf) + "٪)" : "")) : null));
  }

  /* ---------- ت۸: وارسیِ گام‌به‌گامِ حلِ خودت (همان واژگان و حکمِ ایستگاهِ «راه عقل و برهان») ---------- */
  function aqlOpts() {
    var st = (window.EPI_ST || []).filter(function (x) { return x.id === "st_aql"; })[0], ws = (st && st.ws) || [];
    var prem = ws.filter(function (f) { return f.k === "prem"; })[0], form = ws.filter(function (f) { return f.k === "form"; })[0];
    var stc = prem && (prem.cols || []).filter(function (c) { return c.k === "st"; })[0];
    return { st: (stc && stc.opts) || ["بدیهی اولی", "بدیهی وجدانی", "نظریِ منتهی به بدیهی (زنجیره روشن)", "ظنی (نقل، استقراء، حافظه، حدس...)", "نامعلوم"],
      form: (form && form.opts) || ["قیاس معتبر — نتیجه ضرورتاً لازم می‌آید", "استقرائی (از جزئی به کلی)", "تمثیلی (از شباهت)", "مغالطه‌آمیز / نتیجه لازم نمی‌آید"] };
  }
  function splitSteps(t) {
    var s = String(t || "").replace(/\r/g, "").trim(); if (!s) return [];
    var parts = s.split(/\n+/);
    if (parts.length < 2) parts = s.replace(/([.؛!?؟])\s+/g, "$1\n").replace(/\s*(?:⇐|=>|←)\s*/g, "\n").split("\n");
    return parts.map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 12);
  }
  A.solveSplitSteps = splitSteps;
  /* نخستین گامِ ضعیف — قاعدهٔ قطعی، بی هوش مصنوعی: گامی که «روشن نمی‌بینی» یا «نمی‌توانی ثابت کنی»، گامی که مقدمه‌اش ظنی/نامعلوم است،
     یا گامِ «ثابت می‌کنم» بی مقدمهٔ نوشته. صورتِ کلِ استدلال اگر قیاسِ معتبر نباشد، خودش ضعف است (st_aql: صورت معتبر + مادهٔ یقینی = برهان). */
  function weakOf(rows, form) {
    var O = aqlOpts(), bad = [O.st[3], O.st[4]];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], why = [];
      if (!txt(r.t)) continue;
      if (r.clear === "نه" || r.clear === "مطمئن نیستم") why.push("درستی‌اش را روشن نمی‌بینی");
      if (r.prove === "نه") why.push("نمی‌توانی ثابتش کنی");
      if (r.prove === "بله" && !txt(r.prem)) why.push("گفتی ثابتش می‌کنی ولی مقدمه‌اش را ننوشته‌ای");
      if (bad.indexOf(r.st) >= 0) why.push("مقدمه‌اش «" + r.st + "» است، نه یقینی");
      if (r.kind === "شهودی" && r.prove !== "بله") why.push("فقط شهودی است و هنوز صوری ثابت نشده");
      if (why.length) return { i: i, t: r.t, why: why };
    }
    if (form && form !== O.form[0]) return { i: -1, t: "", why: ["صورتِ کلِ استدلال «" + form + "» است؛ نتیجه از آن ضرورتاً لازم نمی‌آید"] };
    return null;
  }
  A.solveWeakOf = weakOf;
  function stepCheck(getText, pg, key, p, title) {
    var s = sol(pg), O = aqlOpts();
    var wrap = h("div", own({ class: "col gap sv-chk", "data-key": key }));
    var btn = h("button", { class: "btn ghost sm sv-chkopen", type: "button", onclick: function () {
      var text = getText(); var prev = s.chk[key];
      var rows = splitSteps(text).map(function (t) { var o = prev && (prev.rows || []).filter(function (r) { return r.t === t; })[0]; return o ? JSON.parse(JSON.stringify(o)) : { t: t }; });
      if (!rows.length) { A.toast("اول حلت (یا حرکتت) را بنویس — هر گام در یک سطر.", "bad"); return; }
      btn.remove(); draw(rows, prev ? prev.form || "" : "");
    } }, "🔎 وارسیِ گام‌به‌گام (راه عقل و برهان)");
    wrap.appendChild(btn);
    function draw(rows, form) {
      var tb = h("div", { class: "col gap" });
      wrap.appendChild(h("p", { class: "small" }, "هر گام یک سطر است. برای هر گام از خودت بپرس: درستی‌اش را روشن می‌بینی؟ می‌توانی ثابتش کنی؟ به کدام مقدمه تکیه دارد؟ شهودی است یا صوری؟ — همان سنجشِ صورت و مادهٔ ایستگاهِ «راه عقل و برهان»."));
      rows.forEach(function (r, i) {
        var id = "svk_" + key.replace(/[^a-z0-9]/gi, "") + "_" + i;
        tb.appendChild(h("div", { class: "card soft col gap sv-row", "data-i": i },
          field(id + "t", "گامِ " + fa(i + 1), r.t, function (v) { r.t = v; }, 2),
          h("div", { class: "row gap wrap" },
            selF(id + "c", "درستی‌اش را روشن می‌بینی؟", ["بله", "نه", "مطمئن نیستم"], r.clear, function (v) { r.clear = v; }),
            selF(id + "p", "می‌توانی ثابتش کنی؟", ["بله", "نه"], r.prove, function (v) { r.prove = v; }),
            selF(id + "k", "شهودی یا صوری؟", ["شهودی", "صوری"], r.kind, function (v) { r.kind = v; }),
            selF(id + "s", "وضعِ مقدمه‌اش", O.st, r.st, function (v) { r.st = v; })),
          field(id + "m", "به کدام مقدمه یا دلیل تکیه دارد؟", r.prem, function (v) { r.prem = v; }, 0)));
      });
      wrap.appendChild(tb);
      var fid = "svkf_" + key.replace(/[^a-z0-9]/gi, "");
      wrap.appendChild(selF(fid, "صورتِ کلِ استدلال", O.form, form, function (v) { form = v; }));
      var res = h("div", { "aria-live": "polite" });
      wrap.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn sm sv-chkrun", type: "button", onclick: function () {
        var w = weakOf(rows, form);
        s.chk[key] = { rows: rows, form: form, weak: w, at: nowISO(), title: title || "" };
        if (w) { s.chk[key].weakT = w.t || w.why[0]; seed(s, "c"); }
        S.put(pg); res.innerHTML = "";
        res.appendChild(w ? h("div", { class: "card soft badv sv-weak" }, h("strong", {}, w.i >= 0 ? "نخستین گامِ ضعیف: گامِ " + fa(w.i + 1) : "ضعف در صورتِ استدلال"), w.t ? h("p", {}, "«" + w.t + "»") : null, h("ul", { class: "small" }, w.why.map(function (x) { return h("li", {}, x); })),
            h("p", { class: "small muted" }, "این گام از فردا در «امروز» برمی‌گردد تا ثابتش کنی یا جایگزینش را بیابی."))
          : h("div", { class: "card soft okv sv-weak-none" }, h("strong", {}, "گامِ ضعیفی نیافتی."), h("p", { class: "small" }, "هر گام را روشن می‌بینی، ثابت می‌کنی و مقدمه‌اش یقینی است؛ صورتِ کل قیاسِ معتبر است.")));
      } }, "نخستین گامِ ضعیف را نشان بده"),
        h("button", { class: "btn ghost sm sv-tocase", type: "button", onclick: function () { toFactory(rows, form, p, title); } }, "باز کردنِ کاربرگِ «راه عقل و برهان» روی همین حل"),
        A.stLink ? A.stLink("st_aql") : null));
      wrap.appendChild(res);
    }
    return wrap;
  }
  A.solveStepCheck = stepCheck;
  /* همان کاربرگِ ایستگاه در یک پروندهٔ واقعیِ کارخانه — گام‌ها «استدلالِ کامل» و هر مقدمه یک سطرِ «ماده» */
  function toFactory(rows, form, p, title) {
    if (!A.newCase) { A.toast("کارخانه در این نسخه بار نشده.", "bad"); return; }
    var steps = rows.map(function (r) { return txt(r.t); }).filter(Boolean);
    var cs = A.newCase({ title: "وارسیِ حل: " + (title || (p && p.title) || "مسئلهٔ من"), input: steps.join("\n"), kind: "استدلال/نظریه" });
    cs.st = cs.st || {};
    cs.st.st_aql = { data: { func: "استدلال و ترکیب قضایا", arg: steps.slice(), form: form || "", prem: rows.filter(function (r) { return txt(r.prem) || r.st; }).map(function (r) { return { txt: txt(r.prem) || txt(r.t), st: r.st || "" }; }) }, done: false, rubric: [] };
    cs.src = { t: "eprob", id: p ? "eprob_" + p.id : null };
    S.put(cs); A.go("e_case", cs.id, "st_aql");
  }

  /* ---------- ت۹: ایستِ «نشانه‌های پیشرفت» و کنارگذاشتنِ آگاهانه ---------- */
  A.SOLVE_CP_MIN = 10;   // پس از چند دقیقه روی یک گام کارتِ ایست خودش پیشنهاد می‌شود؛ دکمه‌اش همیشه هست
  var cpTimer = null;
  function cpCard(p, pg, st, s0) {
    var s = sol(pg), d = { prog: "", gain: "" };
    var box = h("section", own({ class: "card soft sv-cp", role: "group", "aria-label": "ایستِ پیشرفت" }), h("h4", {}, "⏸ ایست: نشانه‌های پیشرفت"),
      h("p", { class: "small" }, "مدتی است روی همین گامی. پیش از ادامه: پیشرفتی داشته‌ای؟ تا این‌جا چه به دست آمده؟ گاهی ادامه درست است، گاهی تغییرِ مسئله (حالتِ خاص، بخشی از شرط، مسئلهٔ کمکی)، و گاهی کنار گذاشتن تا فردا — ذهن در فاصله کار می‌کند."),
      selF("svCpP", "پیشرفتی داشته‌ای؟", ["بله، روشن", "کمی", "نه"], "", function (v) { d.prog = v; }),
      field("svCpG", "دستاوردِ اصلی تا این‌جا چه بود؟ (حتی «فهمیدم کدام راه کار نمی‌کند»)", "", function (v) { d.gain = v; }, 2));
    function rec(choice) {
      if (!d.prog) { A.toast("اول بگو پیشرفتی داشته‌ای یا نه.", "bad"); return null; }
      var e = { at: nowISO(), lv: st.lv, sid: s0.id, i: st.i, prog: d.prog, gain: txt(d.gain), choice: choice };
      s.cps.push(e); if (s.cps.length > 60) s.cps = s.cps.slice(-60); return e;
    }
    var more = h("div", { class: "small" });
    box.appendChild(h("div", { class: "row gap wrap" },
      h("button", { class: "btn sm sv-cpgo", type: "button", onclick: function () { if (rec("ادامه")) { S.put(pg); box.remove(); A.toast("ادامه بده؛ دستاوردت ثبت شد."); } } }, "ادامه می‌دهم"),
      h("button", { class: "btn ghost sm sv-cpchg", type: "button", onclick: function () { if (!rec("تغییرِ مسئله")) return; S.put(pg); more.innerHTML = "";
        more.appendChild(h("ul", {}, ["حالتِ خاص‌تری را حل کن (یک عدد، یک شکلِ ساده، یک مورد).", "فقط بخشی از شرط را نگه دار: مجهول چقدر معین می‌شود؟", "مسئلهٔ کمکیِ ساده‌تر یا مشابهی بساز و اول آن را حل کن.", "به مجهول (یا حکم) نگاه کن و از آن به عقب برو."].map(function (x) { return h("li", {}, x); }))); } }, "مسئله را تغییر می‌دهم"),
      h("button", { class: "btn ghost sm sv-cpaside", type: "button", onclick: function () { var e = rec("کنار گذاشتن"); if (!e) return;
        s.aside = { lv: st.lv, i: st.i, sid: s0.id, order: st.order, gain: e.gain, at: e.at, due: tomorrow() }; S.put(pg);
        A.toast("کنار گذاشتی؛ فردا در «امروز» برمی‌گردد."); A.go("e_prob"); } }, "کنار می‌گذارم تا فردا")), more);
    return box;
  }
  /* برگشت پس از کنارگذاشتن: «چیزی تازه رسید؟» — اگر مسئله از گره‌گشا آمده، «بعداً در آرامش حل شد» همان‌جا شاهد می‌شود */
  function backCard(p, pg) {
    var s = sol(pg), a = s.aside, d = { fresh: "", what: "" };
    return h("section", own({ class: "card sv-back" }), h("h3", {}, "↩ برگشت به مسئلهٔ کنارگذاشته"),
      h("p", { class: "small" }, "روزِ " + A.fdate(String(a.at).slice(0, 10)) + " این‌جا را کنار گذاشتی (سطحِ " + fa(a.lv) + "، گامِ " + fa(a.i + 1) + ")" + (a.gain ? "؛ دستاوردت: «" + a.gain + "»" : "") + "."),
      selF("svBackF", "پس از این فاصله، چیزی تازه به ذهنت رسید؟", ["بله — راه باز شد", "کمی — ایده‌ای تازه ولی ناتمام", "نه، هنوز همان‌جام"], "", function (v) { d.fresh = v; }),
      field("svBackW", "چه چیزی؟ (اگر رسید)", "", function (v) { d.what = v; }, 2),
      h("button", { class: "btn sm sv-backgo", type: "button", onclick: function () {
        if (!d.fresh) { A.toast("اول بگو چیزی تازه رسید یا نه.", "bad"); return; }
        var e = { at: nowISO(), aside: a.at, fresh: d.fresh, what: txt(d.what) }; s.incub.push(e); a.back = e.at; s.aside = null;
        var kc = p.origin && p.origin.type === "kcase" ? S.get(p.origin.id) : null;
        if (kc && /^بله/.test(d.fresh)) { kc.intake = kc.intake || {}; kc.intake.stmts = kc.intake.stmts || []; if (kc.intake.stmts.indexOf("s_later") < 0) { kc.intake.stmts.push("s_later"); S.put(kc); e.evidence = "s_later"; } }
        A.simState = { pid: p.id, lv: a.lv, order: a.order || "hist", i: a.i }; S.put(pg); A.render();
      } }, "ثبت و ادامه از همان گام"));
  }
  A.solveResume = function (pid) { var pg = prog(pid), s = sol(pg); if (s.aside) A.simState = { pid: pid, lv: s.aside.lv, order: s.aside.order || "hist", i: s.aside.i }; A.go("e_prob", pid, "sim"); };

  /* ---------- مرورِ فاصله‌دار (بالای شبیه‌ساز، وقتی موعد است) ---------- */
  function reviewPanel(p, pg) {
    var s = sol(pg), due = duePh(s), pend = pending(s);
    if (!due.length && !pend.length) return null;
    var T = TYPES[typeOf(p, s)];
    var box = h("section", own({ class: "card sv-rev" }), h("div", { class: "eyebrow" }, "مرورِ فاصله‌دار (۱، ۳، ۷، ۲۱، ۶۰ روز)"), h("h3", {}, "پیش از تمرینِ امروز: بی‌نگاه"));
    if (pend.length) box.appendChild(h("p", { class: "small warnline sv-pend" }, "ناتمام: " + pend.map(function (x) { return (x.k === "u" ? "کارتِ فهمِ سطحِ " : "بازنگریِ سطحِ ") + fa(x.lv); }).join("، ") + " — در همان سطح، کارت را بنویس."));
    function lastU() { var ks = Object.keys(s.u).filter(function (k) { return s.u[k] && !s.u[k].skipped; }).sort(function (a, b) { return b - a; }); return ks.length ? s.u[ks[0]] : null; }
    function lastG() { var ks = Object.keys(s.g).sort(function (a, b) { return b - a; }); return ks.length ? s.g[ks[0]] : null; }
    function lastW() { var ks = Object.keys(s.chk).filter(function (k) { return s.chk[k] && s.chk[k].weak; }).sort(function (a, b) { return String(s.chk[b].at).localeCompare(String(s.chk[a].at)); }); return ks.length ? s.chk[ks[0]] : null; }
    due.forEach(function (ph) {
      var d = {}, card = h("div", { class: "card soft col gap sv-rph", "data-ph": ph }, h("h4", {}, PH[ph])), out = h("div", { class: "col gap" });
      var reveal;
      if (ph === "u") {
        card.appendChild(field("svRU", T.u, "", function (v) { d.u = v; }, 2)); card.appendChild(field("svRD", T.d, "", function (v) { d.d = v; }, 2)); card.appendChild(field("svRC", T.c, "", function (v) { d.c = v; }, 2));
        reveal = function () { var x = lastU() || {}; return [h("p", { class: "small" }, h("strong", {}, "صورت: "), String(p.statement || "")), h("p", { class: "small muted" }, "کارتِ پیشینت: " + [x.u, x.d, x.c].filter(Boolean).join(" · "))]; };
      } else if (ph === "b") {
        card.appendChild(field("svRB", "از این مسئله چه درسی گرفتی و کجای دیگر به کارش می‌بری؟", "", function (v) { d.b = v; }, 3));
        reveal = function () { return [h("ul", { class: "small" }, s.lessons.slice(-3).map(function (l) { return h("li", {}, l.use + (l.newProb ? " — مسئلهٔ تازه‌ات: " + l.newProb : "")); }))]; };
      } else if (ph === "g") {
        var g = lastG() || {};
        card.appendChild(h("p", { class: "small" }, "حدسِ پیشینت: «" + (g.guess || "—") + "»"));
        card.appendChild(field("svRG", "یک حالتِ خاص یا مثالِ نقضِ تازه بنویس که این حدس را بیازماید، و نتیجه‌اش را", "", function (v) { d.g = v; }, 3));
        reveal = function () { return [h("p", { class: "small" }, h("strong", {}, "پاسخِ مسئله: "), String(p.answer || "—")), g.test ? h("p", { class: "small muted" }, "آزمونِ پیشینت: " + g.test) : null]; };
      } else {
        var w = lastW() || {};
        card.appendChild(h("p", { class: "small" }, "گامِ ضعیف: «" + (w.weakT || "—") + "»"));
        card.appendChild(field("svRW", "اکنون: این گام را ثابت کن، یا بگو با چه گامی جایگزینش می‌کنی (و به کدام مقدمه تکیه دارد)", "", function (v) { d.w = v; }, 3));
        reveal = function () { return [h("ul", { class: "small muted" }, ((w.weak && w.weak.why) || []).map(function (x) { return h("li", {}, x); }))]; };
      }
      card.appendChild(h("button", { class: "btn sm sv-rshow", type: "button", onclick: function (e) {
        var v = d.u || d.b || d.g || d.w; if (txt(v).length < 3) { A.toast("اول بی‌نگاه بنویس.", "bad"); return; }
        e.currentTarget.disabled = true; reveal().forEach(function (x) { if (x) out.appendChild(x); });
        out.appendChild(gradeBtns(function (v2) { grade(s, ph, v2); (s.rev[ph].hist[s.rev[ph].hist.length - 1]).mine = txt(v); S.put(pg); A.toast("نوبتِ بعد: " + A.fdate(s.rev[ph].due)); A.render(); }));
      } }, "ثبت و مقایسه"));
      card.appendChild(out); box.appendChild(card);
    });
    return box;
  }

  /* ---------- ت۲: بازنگری پس از آخرین گامِ هر سطح ---------- */
  var LB = {};
  function lookBack(p, pg, lv) {
    var s = sol(pg), key = p.id + "|" + lv, t = typeOf(p, s);
    var d = LB[key] = LB[key] || { chk: {}, chkHow: "", chkRes: "", arg: "", other: "", glance: "", use: "", newProb: "", hit: "" };
    var g = s.g[lv];
    var box = h("section", own({ class: "card sv-lb", "data-lv": lv }), h("div", { class: "eyebrow" }, "پس از آخرین گام · سطحِ " + fa(lv)), h("h3", {}, "بازنگری: نتیجه و راه را وارسی کن"),
      h("p", { class: "small" }, "حل تمام نیست تا نگاهی به پشتِ سر نینداخته‌ای. با جمله‌های خودت بنویس؛ درسِ تو در «درس‌ها»ی همین مسئله می‌نشیند، یک کارتِ مرور می‌سازد و بذرِ مسئله‌های هم‌ساختار می‌شود."));
    box.appendChild(h("h4", {}, "۱) نتیجه را وارسی کن"));
    box.appendChild(h("div", { class: "row gap wrap small" }, [["sp", "حالتِ خاص یا حدی"], ["dim", "ابعاد یا واحدها"], ["sym", "تقارن"], ["all", "همهٔ داده‌ها (یا کلِ فرض) در جواب آمده‌اند؟"]].map(function (c) {
      var id = "svLb_" + c[0] + lv; return h("label", { class: "row gap", for: id }, h("input", { type: "checkbox", id: id, checked: !!d.chk[c[0]], onchange: function (e) { d.chk[c[0]] = e.target.checked; } }), c[1]);
    })));
    box.appendChild(field("svLbHow" + lv, "چطور وارسی کردی و چه دیدی؟", d.chkHow, function (v) { d.chkHow = v; }, 2));
    box.appendChild(selF("svLbRes" + lv, "نتیجهٔ وارسی", ["نتیجه سالم ماند", "ایرادی یافتم", "نتوانستم وارسی کنم"], d.chkRes, function (v) { d.chkRes = v; }));
    box.appendChild(h("h4", {}, "۲) استدلال را در نقاطِ حساس وارسی کن"));
    var argF = field("svLbArg" + lv, "حلت را گام‌به‌گام بنویس (هر گام یک سطر)", d.arg, function (v) { d.arg = v; }, 4);
    box.appendChild(argF);
    box.appendChild(stepCheck(function () { return d.arg; }, pg, "lb" + lv, p, p.title + " — سطحِ " + fa(lv)));
    box.appendChild(h("h4", {}, "۳) از راهِ دیگر و ۴) در یک نگاه"));
    box.appendChild(field("svLbOther" + lv, "از راهِ دیگری هم به همین نتیجه می‌رسی؟ چطور؟", d.other, function (v) { d.other = v; }, 2));
    box.appendChild(field("svLbGlance" + lv, "کلِ حل را در یک نگاه (یک جمله) ببین", d.glance, function (v) { d.glance = v; }, 0));
    box.appendChild(h("h4", {}, "۵) نتیجه یا روش را کجای دیگر به کار می‌بری؟"));
    box.appendChild(field("svLbUse" + lv, "درسِ تو: این روش یا نتیجه کجای دیگر به کار می‌آید؟", d.use, function (v) { d.use = v; }, 2));
    box.appendChild(field("svLbNew" + lv, "یک مسئلهٔ تازه بساز که با همین روش (یا با همین نتیجه) حل شود", d.newProb, function (v) { d.newProb = v; }, 2));
    if (g && g.guess) {
      box.appendChild(h("h4", {}, "حدست پیش از حل"));
      box.appendChild(h("p", { class: "small" }, "حدست: «" + g.guess + "»" + (g.conf ? " با اطمینانِ " + fa(g.conf) + "٪" : "") + " · پاسخ: «" + String(p.answer || "—") + "»"));
      box.appendChild(selF("svLbHit" + lv, "حدست با پاسخ می‌خواند؟", ["درست بود", "تاحدی", "نادرست بود"], d.hit, function (v) { d.hit = v; }));
    }
    box.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn sv-lbsave", type: "button", onclick: function () {
      var anyChk = Object.keys(d.chk).some(function (k) { return d.chk[k]; }) || txt(d.chkHow).length >= 3;
      var miss = [];
      if (!anyChk) miss.push("وارسیِ نتیجه"); if (!d.chkRes) miss.push("نتیجهٔ وارسی"); if (txt(d.use).length < 5) miss.push("درسِ تو (کاربست)"); if (txt(d.newProb).length < 5) miss.push("مسئلهٔ تازه");
      if (g && g.guess && !d.hit) miss.push("داوریِ حدس");
      if (miss.length) { A.toast("اول این‌ها را بنویس: " + miss.join("، "), "bad"); return; }
      var rec = { chk: d.chk, chkHow: txt(d.chkHow), chkRes: d.chkRes, arg: txt(d.arg), other: txt(d.other), glance: txt(d.glance), use: txt(d.use), newProb: txt(d.newProb), at: nowISO(), done: true };
      s.b[lv] = rec;
      var les = { lv: lv, use: rec.use, newProb: rec.newProb, glance: rec.glance, at: rec.at };
      if (A.newCard) { var cd = A.newCard("در مسئلهٔ «" + p.title + "» چه درسی گرفتی و کجای دیگر به کارش می‌بری؟ (بی‌نگاه)", rec.use + "\nمسئلهٔ تازه‌ای که ساختی: " + rec.newProb, { pb: p.id, due: tomorrow() }); les.card = cd && cd.id; }
      s.lessons.push(les); seed(s, "b");
      if (g && g.guess) { g.hit = d.hit; g.hitAt = nowISO(); }
      S.put(pg); delete LB[key]; A.toast("بازنگری ثبت شد: درس، کارتِ مرور و بذرِ مسئله‌های هم‌ساختار."); A.render();
    } }, "ثبتِ بازنگری"),
      h("button", { class: "btn ghost sm sv-lblater", type: "button", onclick: function () { if (!s.b[lv] || !s.b[lv].done) { s.b[lv] = { skipped: true, at: nowISO() }; S.put(pg); } A.toast("بازنگری ناتمام ماند؛ در «امروز» برمی‌گردد."); A.render(); } }, "بعداً — در «امروز» یادم بیاور")));
    return box;
  }
  A.solveLookBackCard = lookBack;

  /* ---------- قلاب‌های شبیه‌ساز (a8_prob.js صدا می‌زند) ---------- */
  /* بالای شبیه‌ساز: مرورِ موعد، برگشتِ کنارگذاشته، و پیش از گامِ ۱ کارتِ فهم. شبیه‌ساز بسته نمی‌شود؛ اگر بی کارت جلو بروی «ناتمام» ثبت می‌شود. */
  A.solvePre = function (p, st, pg, idx) {
    var s = sol(pg), col = h("div", { class: "col gap sv-pre" }), t = A.today();
    if (cpTimer) { clearTimeout(cpTimer); cpTimer = null; }
    if (s.aside && s.aside.due && s.aside.due <= t) { col.appendChild(backCard(p, pg)); return col; }
    var rv = reviewPanel(p, pg); if (rv) col.appendChild(rv);
    if (st.i >= idx.length) return col.children.length ? col : null;
    var u = s.u[st.lv];
    if (st.i === 0 && (!u || !u.done)) col.appendChild(uCard(p, pg, st.lv));
    else if (st.i > 0 && !u && !st.focus) { s.u[st.lv] = { skipped: true, at: nowISO() }; S.put(pg); }
    return col.children.length ? col : null;
  };
  /* درونِ کارتِ گام: خلاصهٔ فهم، پرسش‌های نوع، وارسیِ گام‌ها زیرِ «حرکتِ تو»، و ایستِ پیشرفت */
  A.solveStep = function (p, st, pg, s0, card, area, ta) {
    var s = sol(pg), sum = uSummary(p, pg, st.lv);
    if (sum) card.insertBefore(sum, card.children[1] || null);
    if (st.i === 0 && !(s.u[st.lv] && s.u[st.lv].done)) card.insertBefore(h("p", { class: "small warnline sv-uhint" }, "اول کارتِ «مسئله را بفهم» را بالا بنویس؛ اگر بی آن جلو بروی، فردا در «امروز» برمی‌گردد."), card.children[1] || null);
    if (ta && st.lv >= 3) {
      var t = typeOf(p, s);
      area.insertBefore(planList(t, "sv-plan-step"), ta);
      area.appendChild(stepCheck(function () { return ta.value; }, pg, "mv_" + st.lv + "_" + s0.id, p, p.title + " — حرکتِ تو"));
    }
    var cpb = h("button", { class: "btn ghost sm sv-cpbtn", type: "button", onclick: function () { cpb.replaceWith(cpCard(p, pg, st, s0)); } }, "⏸ ایستِ پیشرفت / کنار گذاشتن");
    card.appendChild(h("div", { class: "row gap wrap sv-cprow" }, cpb));
    var started = Date.now();
    cpTimer = setTimeout(function () {
      if (!document.body.contains(card) || card.querySelector(".sv-cp") || Date.now() - started < A.SOLVE_CP_MIN * 60000 - 50) return;
      if (cpb.parentNode) cpb.replaceWith(cpCard(p, pg, st, s0));
    }, A.SOLVE_CP_MIN * 60000);
    A._solveCpFire = function () { if (cpb.parentNode && document.body.contains(card)) cpb.replaceWith(cpCard(p, pg, st, s0)); };
  };
  /* پس از دیدنِ حرکتِ واقعی: گامی که عمداً برچسبِ حرکت ندارد چون «داوری/وارسی» است ⇒ برچسبِ «بازنگری» */
  A.solveRevealExtra = function (p, s0) {
    var ms = A.stageMoves ? A.stageMoves(p, s0) : []; var why = ((A.MOVE_UNTAGGED || {})[p.id] || {})[s0.id];
    if (ms.length || !why) return null;
    return h("div", { class: "row gap wrap sv-lbchip" }, h("span", { class: "chip" }, "🔁 گامِ بازنگری"), h("span", { class: "small muted" }, "این گام وارسی و داوری است، نه حرکتِ حل: " + why));
  };
  /* پایانِ سطح: کارتِ بازنگری بالای نتیجهٔ سطح (اگر هنوز نوشته نشده) */
  A.solveLookBack = function (p, st, pg) { var s = sol(pg), b = s.b[st.lv]; if (b && b.done) return null; return lookBack(p, pg, st.lv); };
  A.solveLeaveLevel = function (p, st, pg) { var s = sol(pg); if (!s.b[st.lv]) { s.b[st.lv] = { skipped: true, at: nowISO() }; S.put(pg); } };

  /* ---------- «درس‌ها و ایستگاه‌ها»: درس‌های خودت ---------- */
  A.solveLessons = function (p) {
    var s = A.solveOf(p.id); var L = s && s.lessons || [];
    return h("section", own({ class: "card sv-lessons" }), h("h2", {}, "درس‌های خودت (از بازنگری)"),
      L.length ? h("ul", {}, L.map(function (l) { return h("li", {}, h("strong", {}, "سطحِ " + fa(l.lv) + ": "), l.use, l.newProb ? h("div", { class: "small" }, "مسئلهٔ تازه‌ای که ساختی: " + l.newProb) : null, l.glance ? h("div", { class: "small muted" }, "در یک نگاه: " + l.glance) : null, h("div", { class: "small muted" }, A.fdate(String(l.at).slice(0, 10)) + (l.card ? " · کارتِ مرور ساخته شد" : ""))); }))
        : h("p", { class: "small muted" }, "هنوز درسی ننوشته‌ای. پس از آخرینِ گامِ هر سطحِ شبیه‌ساز، بازنگری درسِ تو را این‌جا می‌گذارد."));
  };
  /* بذرِ مسئله‌های هم‌ساختار (a20): درس‌ها و مسئله‌های تازه‌ای که خودت در بازنگری ساختی */
  A.solveSeed = function (p) {
    var s = A.solveOf(p.id); var L = (s && s.lessons || []).slice(-4); if (!L.length) return "";
    return "\nبذرهای حل‌کننده (از بازنگریِ خودش؛ ساختار را از این‌ها هم بگیر، ولی مسئله را عیناً تکرار نکن): " + L.map(function (l) { return l.use + (l.newProb ? " ⇐ مسئلهٔ تازه‌اش: " + l.newProb : ""); }).join(" | ");
  };

  /* ---------- «افزودنِ مسئلهٔ تو»: نوع + فهم پیش از تجزیه (اختیاری؛ به قلمِ خودت) ---------- */
  A.solveInjectCard = function (f, getPid) {
    f.kind = f.kind || "find"; f.u = f.u || {};
    var box = h("section", own({ class: "card soft col gap sv-inj" }), h("h3", {}, "پیش از تجزیه: فهمِ خودت از مسئله"),
      h("p", { class: "small" }, "به قلمِ خودت (هوش مصنوعی این‌ها را نمی‌بیند و پر نمی‌کند). همین کارت در گامِ ۱ ِ شبیه‌ساز پیش رویت می‌آید تا با صورت مقایسه‌اش کنی."));
    function draw() {
      box.querySelectorAll(".sv-injf").forEach(function (x) { x.remove(); });
      var T = TYPES[f.kind], c = h("div", { class: "col gap sv-injf" });
      c.appendChild(field("svInU", T.u, f.u.u, function (v) { f.u.u = v; }, 2));
      c.appendChild(field("svInD", T.d, f.u.d, function (v) { f.u.d = v; }, 2));
      c.appendChild(field("svInC", T.c, f.u.c, function (v) { f.u.c = v; }, 2, "هر بخش در یک سطر"));
      c.appendChild(selF("svInS", T.suff, ["کافی است", "ناکافی است — چیزی کم است", "زائد دارد — بخشی لازم نیست", "متناقض است", "هنوز نمی‌دانم"], f.u.suff, function (v) { f.u.suff = v; }));
      c.appendChild(field("svInF", "شکل، جدول یا نام‌گذاری: نمادهایت", f.u.fig, function (v) { f.u.fig = v; }, 0));
      c.appendChild(planList(f.kind));
      c.appendChild(stepCheck(function () { return f.answer; }, prog(getPid()), "inject", { id: getPid(), title: f.title || "مسئلهٔ من" }, "حلِ مسئلهٔ تو"));
      box.appendChild(c);
      var al = document.querySelector('label[for="pbIn_answer"]'); if (al) al.textContent = T.ans;
    }
    box.appendChild(typeSel("svInType", f.kind, function (v) { f.kind = v; draw(); }));
    draw(); setTimeout(function () { var al = document.querySelector('label[for="pbIn_answer"]'); if (al) al.textContent = TYPES[f.kind].ans; }, 0);
    return box;
  };
  A.solveInjectStore = function (pid, f, o) {
    if (TYPES[f.kind] && o) o.kind = f.kind;
    var u = f.u || {}; if (!txt(u.u) && !txt(u.d) && !txt(u.c)) { if (TYPES[f.kind]) { var pg0 = prog(pid); sol(pg0).type = f.kind; S.put(pg0); } return; }
    var pg = prog(pid), s = sol(pg); s.type = f.kind;
    s.u[0] = { type: f.kind, u: txt(u.u), d: txt(u.d), c: txt(u.c), suff: u.suff || "", fig: txt(u.fig), at: nowISO(), from: "inject" };
    S.put(pg);
  };

  /* ---------- «امروز» ---------- */
  A.solveDue = function () {
    var t = A.today(), out = [];
    (A.probs ? A.probs() : []).forEach(function (p) {
      var pg = S.get("eprog_" + p.id); if (!pg || !pg.solve) return; var s = sol(pg);
      var ph = duePh(s), pend = pending(s), aside = s.aside && s.aside.due && s.aside.due <= t;
      if (ph.length || pend.length || aside) out.push({ p: p, ph: ph, pend: pend, aside: aside });
    });
    return out;
  };
  if (typeof A.dueList === "function" && !A.dueList._solve) {
    var rawDueS = A.dueList;
    A.dueList = function () {
      var items = rawDueS.apply(this, arguments) || [];
      try {
        var D = A.solveDue();
        D.filter(function (x) { return x.aside; }).forEach(function (x) { items.push({ k: "knot", txt: "↩ مسئلهٔ کنارگذاشته برگشت: «" + x.p.title + "»", sub: "دیروز کنارش گذاشتی؛ ببین فاصله چه کرد و از همان گام ادامه بده", go: function () { A.solveResume(x.p.id); } }); });
        var rev = D.filter(function (x) { return !x.aside && (x.ph.length || x.pend.length); });
        if (rev.length) {
          var n = rev.reduce(function (a, x) { return a + x.ph.length + x.pend.length; }, 0);
          items.push({ k: "knot", txt: fa(n) + " مرورِ حلِ مسئله موعد است", sub: rev.slice(0, 3).map(function (x) { return "«" + x.p.title + "»: " + x.ph.map(function (k) { return PH[k]; }).concat(x.pend.map(function (y) { return (y.k === "u" ? "فهمِ" : "بازنگریِ") + " ناتمام"; })).join("، "); }).join(" · "),
            go: function () { var x = rev[0], pd = x.pend[0]; if (pd && !x.ph.length) A.simState = { pid: x.p.id, lv: pd.lv, order: "hist", i: pd.k === "u" ? 0 : (x.p.stages || []).length }; A.go("e_prob", x.p.id, "sim"); } });
        }
      } catch (e) { console.warn(e); }
      return items;
    };
    A.dueList._solve = true;
  }
})(APP);
