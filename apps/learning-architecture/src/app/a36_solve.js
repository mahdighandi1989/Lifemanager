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
    ["lessons", "cps", "incub", "mot"].forEach(function (k) { s[k] = s[k] || []; });
    migMot(pg, s);
    return s;
  }
  /* M2 (ممیزیِ ۲۰۲۶-۱۰-۱۵): رکوردِ «انگیزهٔ این گام» جایِ خودش را دارد (solve.mot)، نه فهرستِ پاسخ‌های «❔ پرسشِ همین لحظه» (pg.tut) —
     وگرنه کارتِ پرسش آن را «پاسخت» می‌خواند و مرورِ «t» می‌پرسید «پرسش: انگیزهٔ گام». جابه‌جاییِ رکوردهای پیشین (k: "motive") بی‌اتلاف و
     یک‌باره: به solve.mot می‌روند (اگر همان گام آن‌جا نیست) و از tut برداشته می‌شوند؛ بقیهٔ tut دست نمی‌خورد. */
  function migMot(pg, s) {
    var T = pg.tut; if (!T) return;
    ["und", "plan", "exec", "back"].forEach(function (tk) {
      var L = T[tk]; if (!Array.isArray(L) || !L.some(function (e) { return e && e.k === "motive"; })) return;
      T[tk] = L.filter(function (e) {
        if (!(e && e.k === "motive")) return true;
        if (!s.mot.some(function (m) { return m.lv === e.lv && m.sid === e.sid; })) s.mot.push({ at: e.at, lv: e.lv, sid: e.sid, ph: e.ph, tk: tk, motive: e.motive || "", self: e.self, selfAt: e.selfAt, from: "tut" });
        return false;
      });
    });
    /* نوبتِ «t» ای که فقط از رکوردِ انگیزه ساخته شده بود ⇒ نوبتِ «m» (همان موعد و تاریخچه؛ «t» دست‌نخورده می‌ماند و بی پرسش دیده نمی‌شود) */
    if (s.rev.t && !s.rev.m && s.mot.length && !hasT(pg)) s.rev.m = JSON.parse(JSON.stringify(s.rev.t));
  }
  function txt(v) { return String(v == null ? "" : v).trim(); }
  function clip(t, n) { t = String(t == null ? "" : t); return t.length > n ? t.slice(0, n - 1) + "…" : t; }
  function own(attrs) { attrs = attrs || {}; attrs["data-own"] = "1"; attrs.dir = "rtl"; return attrs; }
  A.solveOf = function (pid) { var pg = S.get("eprog_" + pid); return pg && pg.solve ? pg.solve : null; };

  /* ---------- نوعِ مسئله (ت۱۴): قالبِ فهم و پرسش‌های طرح‌ریزی با نوع عوض می‌شوند ---------- */
  var TYPES = {
    find: { fa: "یافتنی — چیزی را باید پیدا کنی (عدد، شکل، راه، تصمیم)", u: "مجهول (خواسته) چیست؟", d: "داده‌ها چیست؟", c: "شرط چیست؟ بخش‌هایش را جدا بنویس",
      suff: "آیا شرط برای تعیینِ مجهول کافی است؟ زائد است؟ متناقض است؟", ans: "پاسخ نهایی (مجهولِ یافته‌شده) و حل‌کننده",
      plan: ["به مجهول نگاه کن: مسئله‌ای می‌شناسی که همین مجهول (یا مجهولی شبیه) را داشته باشد؟", "فقط بخشی از شرط را نگه دار و بقیه را رها کن: مجهول تا چه حد معین می‌شود و چطور تغییر می‌کند؟",
        "از داده‌ها چیزِ سودمندی بیرون می‌کشی؟ همهٔ داده‌ها و کلِ شرط را به کار برده‌ای؟", "مسئلهٔ کمکیِ ساده‌تری هست — حالتِ خاص‌تر، کلی‌تر یا مشابه؟",
        "عنصرِ کمکی‌ای (خطی، نقطه‌ای، مجهولی، نامی) معرفی می‌کنی که مسئله را به آشنا نزدیک کند؟"],
      note: "مسئلهٔ یافتنی در کار و ریاضیِ مقدماتی رایج‌تر است؛ اگر پرسش «آیا … درست است؟» است، نوعش را «اثباتی» یا «اثبات یا رد کن» بگذار." },
    /* دورِ ۲ ِ تورِ پولیا (s33): «ج» دیگر تکرارِ «بخش‌های فرض» نیست — بخش‌های حکم (A194: فرض و حکم دو بخشِ اصلیِ مسئلهٔ اثباتی‌اند) */
    prove: { fa: "اثباتی — باید نشان بدهی حکمی درست است", u: "حکم (آنچه باید ثابت شود) چیست؟", d: "فرض (آنچه داده شده) چیست؟", c: "حکم را به بخش‌هایش بشکن: هر بخشِ آنچه باید ثابت شود در یک سطر («اگر … آن‌گاه …»، «برای هر … : …»)",
      suff: "آیا همهٔ فرض لازم است؟ اگر بخشی از فرض را کنار بگذاری، حکم هنوز برقرار است؟ فرض‌ها با هم سازگارند؟", ans: "خلاصهٔ برهان (یا ردِ حکم) و حل‌کننده",
      plan: ["به حکم نگاه کن: قضیه‌ای می‌شناسی که همین حکم (یا حکمی شبیه) را داشته باشد؟", "فقط بخشی از فرض را نگه دار: حکم هنوز برقرار است؟ اگر نه، کدام بخش لازم بود؟",
        "از فرض چیزِ سودمندی بیرون می‌کشی؟ همهٔ فرض را به کار برده‌ای؟", "حکمِ ساده‌تری که به این حکم برسد پیدا می‌کنی (لم)؟ از حکم به عقب برو: از چه چیزی این حکم لازم می‌آید؟",
        "فرضِ دیگری می‌توانی بسازی که همین حکم از آن هم برآید — ساده‌تر یا آشناتر؟", "فرض یا حکم یا هر دو را تغییر بده (قوی‌تر، ضعیف‌تر، عکس): حکمِ تازه هنوز درست است؟ به اثباتِ این یکی کمک می‌کند؟",
        "مسئلهٔ یافتنی یا اثباتیِ دیگری با همین فرض می‌شناسی که پلِ اثبات شود؟", "عنصرِ کمکی‌ای (ساختی، نامی، لمی، پاره‌خطی) معرفی می‌کنی که فرض را به حکم وصل کند؟"],
      note: "اگر حکم به «فرض ⇐ حکم» شکسته نمی‌شود (مثلاً «هر عددِ اولِ بزرگ‌تر از ۲ فرد است»)، آن را «برای هر … : …» بنویس و همان «برای هر …» را فرض بگیر. مسئلهٔ اثباتی در ریاضیِ پیشرفته محوری‌تر است؛ یافتنی در کار و ریاضیِ مقدماتی." },
    pod: { fa: "اثبات یا رد کن — هنوز نمی‌دانی حکم درست است یا نه", u: "حکمی که باید درستی یا نادرستی‌اش را نشان بدهی چیست؟", d: "فرض (آنچه داده شده) چیست؟", c: "حکم را به بخش‌هایش بشکن: هر بخشِ ادعایی که درستی یا نادرستی‌اش را می‌سنجی در یک سطر",
      suff: "آیا فرض برای داوری کافی است؟ زائد یا متناقض نیست؟", ans: "داوری (درست/نادرست) با برهان یا مثالِ نقض، و حل‌کننده",
      plan: ["پیش از اثبات، حالت‌های خاص و حدی را بیازما: مثالِ نقضی پیدا می‌شود؟", "اگر حکم درست است، به حکم نگاه کن: قضیه‌ای با همین حکم می‌شناسی؟",
        "اگر نادرست است، کوچک‌ترین مثالِ نقض را بساز و نشان بده کدام بخشِ فرض را برآورده می‌کند.", "فقط بخشی از فرض را نگه دار: حکم هنوز برقرار است؟",
        "عنصرِ کمکی‌ای (ساختی، نامی، لمی) معرفی می‌کنی که فرض را به حکم وصل کند — یا مثالِ نقض را بسازد؟"],
      note: "پیش از آن‌که وقتِ اثبات بگذاری، حدس بزن درست است یا نه و حدست را با حالت‌های خاص بیازما." }
  };
  A.SOLVE_TYPES = TYPES;
  function typeOf(p, s) { var t = (s && s.type) || (p && p.kind); return TYPES[t] ? t : "find"; }
  function typeSel(id, val, onPick) {
    return h("div", { class: "col" }, h("label", { for: id }, "نوعِ مسئله"),
      h("select", { id: id, class: "sv-type", onchange: function (e) { onPick(e.target.value); } }, Object.keys(TYPES).map(function (k) { return h("option", { value: k, selected: val === k }, TYPES[k].fa); })),
      TYPES[val] && TYPES[val].note ? h("p", { class: "small muted sv-tnote" }, TYPES[val].note) : null);
  }
  function field(id, label, val, onIn, rows, ph) {
    var el = rows ? h("textarea", { id: id, rows: rows, placeholder: ph || "", oninput: function (e) { onIn(e.target.value); } }) : h("input", { id: id, type: "text", placeholder: ph || "", oninput: function (e) { onIn(e.target.value); } });
    el.value = val || "";
    return h("div", { class: "col" }, h("label", { for: id }, label), el);
  }
  function selF(id, label, opts, val, onPick) {
    return h("div", { class: "col", style: { minWidth: "0", maxWidth: "100%" } }, h("label", { for: id }, label), h("select", { id: id, style: { maxWidth: "100%" }, onchange: function (e) { onPick(e.target.value); } }, h("option", { value: "" }, "—"), opts.map(function (o) { var v = Array.isArray(o) ? o[0] : o; return h("option", { value: v, selected: val === v }, Array.isArray(o) ? o[1] : o); })));
  }
  function planList(t, cls) {
    return h("details", { class: "small sv-plan " + (cls || ""), dir: "rtl" }, h("summary", {}, "پرسش‌هایی که در این مسئلهٔ " + (t === "find" ? "یافتنی" : t === "prove" ? "اثباتی" : "«اثبات یا رد کن»") + " از خودت می‌پرسی"),
      h("ul", {}, TYPES[t].plan.map(function (q) { return h("li", {}, q); })));
  }

  /* ---------- نردبانِ مرورِ فاصله‌دار (u فهم، b بازنگری، g آزمونِ حدس، c گامِ ضعیف) ---------- */
  var PH = { u: "فهمِ مسئله (بی‌نگاه)", b: "درسِ بازنگری و کاربستش", g: "آزمودنِ حدس با حالتِ خاص یا مثالِ نقض", c: "گامِ ضعیفِ حلت", t: "پرسشی که پیش از گام از خودت پرسیدی", m: "انگیزهٔ گام: چرا همین گام، همین حالا", h: "ابزارِ طرحی که به کار بردی (از حافظه)" };
  /* L5: نوبتِ نخست فرداست، پس پله‌اش همان LADDER[0] است (نه ۰) — وگرنه نخستین «درست» دوباره «۱ روز» می‌داد (+۱، +۱، +۳ …) */
  function seed(s, ph) { if (!s.rev[ph]) s.rev[ph] = { iv: LADDER[0], due: tomorrow(), hist: [] }; }
  /* آغازِ نوبت با نتیجهٔ همین بار: نادرست/ناقص ⇒ پلهٔ اولِ نردبان (فردا)؛ درست ⇒ پلهٔ بعد از آن (همان نردبان، بی عددِ تازه).
     اگر نوبتی زودتر از قبل هست، همان می‌ماند. */
  function seedAt(s, ph, ok) {
    var iv = ok ? nextIv(LADDER[0], true) : LADDER[0], due = A.addDays(A.today(), iv), r = s.rev[ph];
    if (r && r.due && r.due <= due) return r;
    s.rev[ph] = { iv: iv, due: due, hist: (r && r.hist) || [] }; return s.rev[ph];
  }
  A.solveSeedAt = seedAt;
  function grade(s, ph, self) {
    var r = s.rev[ph] || (s.rev[ph] = { iv: 0, due: A.today(), hist: [] }), d = A.today();
    (r.hist = r.hist || []).push({ at: nowISO(), d: d, self: self });
    if (r.hist.length > 40) r.hist = r.hist.slice(-40);
    r.iv = nextIv(r.iv || LADDER[0], self === 2); r.due = A.addDays(d, r.iv);   // رکوردِ پیشینِ iv: 0 هم پلهٔ نخست شمرده می‌شود (L5)
  }
  A.solveGrade = grade;
  function duePh(s, pg) { var t = A.today(); return Object.keys(PH).filter(function (k) { return s.rev[k] && s.rev[k].due && s.rev[k].due <= t && (k !== "t" || !pg || hasT(pg)) && (k !== "m" || (s.mot || []).length) && (k !== "h" || !!(s.live && s.live.plan && (s.live.plan.heur || []).length)); }); }
  /* مرورِ «t» فقط وقتی پاسخی به «❔ پرسشِ همین لحظه» هست (رکوردِ انگیزه‌ی تنها پرسش نیست — M2) */
  function hasT(pg) { var T = pg.tut || {}; return ["und", "plan", "exec", "back"].some(function (k) { return (T[k] || []).some(function (e) { return e && e.src === "sim" && !e.skip && e.q && e.k !== "motive"; }); }); }
  /* کارتِ «ناتمام»: فهم یا بازنگری‌ای که بی‌نوشتن از کنارش گذشتی */
  function pending(s) { var o = []; ["u", "b"].forEach(function (k) { Object.keys(s[k]).forEach(function (lv) { var x = s[k][lv]; if (x && x.skipped && !x.done) o.push({ k: k, lv: +lv }); }); }); return o; }
  function gradeBtns(onPick, lab) {
    return h("div", own({ class: "row gap wrap sv-grade" }), h("span", { class: "small" }, lab || "خودت داوری کن:"),
      [0, 1, 2].map(function (v) { return h("button", { class: "btn ghost sm sv-g" + v, type: "button", "data-v": v, onclick: function () { onPick(v); } }, ["۰ نه", "۱ تاحدی", "۲ کامل"][v]); }));
  }

  /* خوانشِ مرجعِ مجهول/داده/شرط — یک خواننده (A.udcOf ِ a8) برای {u,d,c} و {unknown,data,condition} */
  function udcRef(p) { if (A.udcOf) return A.udcOf(p); var x = p && p.udc; return x && (x.u || x.d || x.c) ? x : null; }
  /* «نخستین برخورد»: هنوز هیچ گامی از هیچ سطحی زده/دیده نشده و حدسی هم ثبت نشده */
  function guessFresh(pg) {
    var anyStep = Object.keys(pg.lv || {}).some(function (l) { return Object.keys(pg.lv[l] || {}).length; });
    var anyG = pg.solve && pg.solve.g && Object.keys(pg.solve.g).length;
    return !anyStep && !anyG;
  }
  A.solveGuessFresh = guessFresh;
  /* تمرینِ «حدس را بیازما» — نمونهٔ ساختهٔ کد (A.KGEN.guesstest ِ a17) روی صفحهٔ حرکتِ «حالتِ خاص»؛ پاسخ به موعدِ همان حرکت می‌رود */
  function guessDrill() {
    if (!A.moveGenDrill || !(A.KGEN && A.KGEN.guesstest)) return null;
    var det = h("details", { class: "small sv-gdrill" }, h("summary", {}, "تمرینِ آزمودنِ حدس: یک نمونهٔ تازه (حالتِ خاص، مثالِ نقض، حالتِ حدی؛ تفاضل‌ها، حدس‌های رقیب، قیاس)"));
    det.addEventListener("toggle", function () { if (det.open && !det.querySelector(".mv-gen")) { det.appendChild(A.moveGenDrill("mv_special", "guesstest"));
      /* R4: جدولِ حالت‌ها/تفاضل‌ها، حدس‌های رقیب، حدس با قیاس — هر کدام به موعدِ حرکتِ خودش */
      [["mv_special", "diffs"], ["mv_special", "rivals"], ["mv_analogy", "analogy"]].forEach(function (x) { if (A.KGEN[x[1]]) { var g = A.moveGenDrill(x[0], x[1]); if (g) det.appendChild(g); } }); } });
    return det;
  }
  A.solveGuessDrill = guessDrill;

  /* ---------- ت۱ + ت۱۴ + ت۱۰: کارتِ «فهمِ مسئله» پیش از گامِ ۱ ِ هر سطح (و در نخستین برخورد، حدس با اطمینان) ---------- */
  var DRAFT = {};
  function uCard(p, pg, lv) {
    var s = sol(pg), key = p.id + "|" + lv, prev = s.u[lv] && !s.u[lv].skipped ? s.u[lv] : null;
    var base = prev || s.u[lv - 1] || s.u[0] || {};
    var d = DRAFT[key] = DRAFT[key] || { type: typeOf(p, s), u: lv === 1 ? base.u || "" : "", d: lv === 1 ? base.d || "" : "", c: lv === 1 ? base.c || "" : "", one: "", suff: "", suffWhy: "", fig: lv === 1 ? base.fig || "" : "", drawn: false, guess: "", conf: "70", test: "", testRes: "", ifRef: "", peek: lv === 1 };
    /* حدس فقط در نخستین برخورد با مسئله (هر سطحی)، پیش از دیدنِ هیچ گام یا پاسخی — نه در سطحِ ۳ که راه دو بار دیده شده است */
    var fresh = guessFresh(pg);
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
    if (d.type !== "find" && T.note) box.appendChild(h("p", { class: "small muted" }, T.note));
    box.appendChild(field("svOne" + lv, "کلِ مسئله را در یک جملهٔ کامل و مرتب بگو (به زبانِ خودت)", d.one, function (v) { d.one = v; }, 0, "مثلاً «می‌خواهم … را بیابم، با داشتنِ …، به شرطِ این‌که …»"));
    box.appendChild(selF("svSuff" + lv, T.suff, ["کافی است", "ناکافی است — چیزی کم است", "زائد دارد — بخشی لازم نیست", "متناقض است", "هنوز نمی‌دانم"], d.suff, function (v) { d.suff = v; }));
    box.appendChild(field("svSuffW" + lv, "چرا؟ (یک جمله)", d.suffWhy, function (v) { d.suffWhy = v; }, 0));
    box.appendChild(field("svFig" + lv, "شکل، جدول یا نام‌گذاری: نمادهایت را بنویس (هر نماد برای چه)", d.fig, function (v) { d.fig = v; }, 2, "مثلاً a = طولِ ضلع، t = زمان… یا ستون‌های جدولت"));
    box.appendChild(h("label", { class: "row gap small", for: "svDrawn" + lv }, h("input", { type: "checkbox", id: "svDrawn" + lv, checked: !!d.drawn, onchange: function (e) { d.drawn = e.target.checked; } }), "شکل یا جدول را روی کاغذ کشیدم"));
    if (fresh) {
      box.appendChild(h("h4", {}, "پیش از حل: حدس بزن"));
      box.appendChild(h("p", { class: "small sv-gintro" }, "نخستین برخورد با این مسئله است و هنوز هیچ گامی ندیده‌ای — بهترین لحظه برای حدس. حدس را نه بی‌آزمون بپذیر، نه کنار بگذار: صریح بنویسش، بگو چقدر مطمئنی، و یک آزمون پیدا کن که بتواند ردش کند. حدسِ صورت‌بندی‌شده مسئلهٔ یافتنی را به مسئلهٔ اثباتی بدل می‌کند."));
      box.appendChild(field("svGuess" + lv, "حدست دربارهٔ جواب (یا ماهیتش) چیست؟", d.guess, function (v) { d.guess = v; }, 2, "مثلاً «جواب عددی زوج است» یا «حکم نادرست است»"));
      box.appendChild(selF("svConf" + lv, "چقدر به حدست مطمئنی؟", ["50", "60", "70", "80", "90", "100"].map(function (x) { return [x, fa(x) + "٪"]; }), d.conf, function (v) { d.conf = v; }));
      box.appendChild(field("svTest" + lv, "حدست را بیازما: یک حالتِ خاص، حالتِ حدی یا مثالِ نقض بنویس که می‌تواند ردش کند", d.test, function (v) { d.test = v; }, 2));
      box.appendChild(selF("svTestR" + lv, "این آزمون چه نشان داد؟", ["حدس سالم ماند", "حدس رد شد — حدسِ تازه لازم است", "نتوانستم بیازمایم"], d.testRes, function (v) { d.testRes = v; }));
      box.appendChild(selF("svIfRef" + lv, "اگر آزمونی حدس را رد کند، چه می‌کنی؟", ["حدس را کنار می‌گذارم یا اصلاحش می‌کنم", "آزمون را نادیده می‌گیرم چون حدسم قوی است", "حدس را بی‌تغییر نگه می‌دارم و دیگر نمی‌آزمایم"], d.ifRef, function (v) { d.ifRef = v; }));
      d.kit = d.kit || blankKit();
      box.appendChild(kitUI(d.kit, { idp: "svGK" + lv, problem: p.statement || "", open: true, drills: false, title: "ابزارهای حدس — پیش از آزمودن: قیاس، جدولِ حالت‌ها، حدسِ دقیق، حدس‌های رقیب",
        intro: "حدس را از کجا آوردی؟ یک نتیجهٔ آشنای مشابه (قیاس)، چند حالتِ خاص که خودت حساب کنی (جدول)، حدس به زبانِ دقیق (فرمول)، و دست‌کم یک حدسِ رقیب با آزمونش. کد جدول و فرمول و رقیب‌ها را می‌سنجد." }));
      box.appendChild(guessDrill());
    }
    box.appendChild(planList(d.type));
    var out = h("div", { "aria-live": "polite", class: "col gap" });
    box.appendChild(h("button", { class: "btn sv-usave", type: "button", onclick: function (e) {
      var miss = [[d.u, T.u], [d.d, T.d], [d.c, T.c]].filter(function (x) { return !txt(x[0]); }).map(function (x) { return "«" + x[1] + "»"; });
      if (!d.suff) miss.push("«" + T.suff + "»");
      if (fresh && !txt(d.guess)) miss.push("«حدس»");   // عددِ کوتاه («۶۶»، «۱۲») هم پاسخِ کامل است (ممیزیِ دورِ ۳)
      if (fresh && txt(d.guess) && !txt(d.test)) miss.push("«آزمونِ حدس»");
      if (miss.length) { A.toast("اول این‌ها را بنویس: " + miss.join("، "), "bad"); return; }
      e.currentTarget.disabled = true;
      out.appendChild(h("div", { class: "card soft small sv-ucmp" }, h("strong", {}, "صورتِ مسئله:"), String(p.statement || "").split("\n").map(function (x) { return h("p", {}, x); }),
        udcRef(p) ? h("div", { class: "sv-udcref" }, h("strong", {}, "خوانشِ مرجع (فقط برای مقایسه):"), h("ul", {}, [["u", T.u], ["d", T.d], ["c", T.c]].map(function (k) { var R = udcRef(p); return R[k[0]] ? h("li", {}, k[1] + " " + R[k[0]]) : null; }))) : null,
        prev || s.u[lv - 1] ? h("p", { class: "muted" }, "نوشتهٔ پیشینِ خودت: " + [base.u, base.d, base.c].filter(Boolean).join(" · ")) : null,
        h("p", {}, "۲ = مجهول/حکم، همهٔ داده‌ها/فرض و همهٔ بخش‌های شرط درست و کامل؛ ۱ = یکی جا افتاد یا مبهم بود؛ ۰ = مسئله را جورِ دیگری فهمیده بودی.")));
      out.appendChild(gradeBtns(function (v) {
        var rec = { type: d.type, u: txt(d.u), d: txt(d.d), c: txt(d.c), one: txt(d.one), suff: d.suff, suffWhy: txt(d.suffWhy), fig: txt(d.fig), drawn: !!d.drawn, peek: !!d.peeked, self: v, at: nowISO(), done: true };
        s.type = d.type; s.u[lv] = rec; seed(s, "u");
        if (fresh) {
          var seen = !guessFresh(pg);   // اگر در همین فاصله گامی دیده شد، حدس دیگر پیش‌بینی نیست ⇒ بیرون از کالیبراسیون
          s.g[lv] = { guess: txt(d.guess), conf: +d.conf || null, test: txt(d.test), testRes: d.testRes, ifRef: d.ifRef, before: !seen, seen: seen, at: nowISO() };
          if (!kitEmpty(d.kit)) { s.g[lv].kit = kitCopy(d.kit); if (!d.kit.chk && A.kguessCheck) { var kr = A.kguessCheck(d.kit, { problem: p.statement || "" }); s.g[lv].kit.chk = { at: nowISO(), ok: kr.ok, issues: kr.issues, order: kr.table ? kr.table.order : null, fits: kr.formula ? kr.formula.fits : null, sep: kr.rivals && kr.rivals.sep ? kr.rivals.sep : null, decided: kr.rivals && kr.rivals.decided || null }; } }
          if (txt(d.test)) seed(s, "g");
        }
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
      wrap.appendChild(h("p", { class: "small" }, "هر گام یک سطر است. برای هر گام از خودت بپرس: درستی‌اش را روشن می‌بینی؟ می‌توانی ثابتش کنی؟ به کدام مقدمه تکیه دارد؟ شهودی است یا صوری؟ — همان سنجشِ صورت و مادهٔ ایستگاهِ «راه عقل و برهان». ترتیبِ کار: اول گام‌های اصلی (خطِ اصلی) را وارسی کن، بعد جزئیاتِ فرعی؛ ترتیبِ نوشتنِ نهایی می‌تواند با ترتیبِ کشف فرق کند."));
      rows.forEach(function (r, i) {
        var id = "svk_" + key.replace(/[^a-z0-9]/gi, "") + "_" + i;
        tb.appendChild(h("div", { class: "card soft col gap sv-row", "data-i": i },
          field(id + "t", "گامِ " + fa(i + 1), r.t, function (v) { r.t = v; }, 2),
          h("div", { class: "row gap wrap" },
            selF(id + "c", "درستی‌اش را روشن می‌بینی؟", ["بله", "نه", "مطمئن نیستم"], r.clear, function (v) { r.clear = v; }),
            selF(id + "p", "می‌توانی ثابتش کنی؟", ["بله", "نه"], r.prove, function (v) { r.prove = v; }),
            selF(id + "k", "شهودی یا صوری؟", ["شهودی", "صوری"], r.kind, function (v) { r.kind = v; }),
            selF(id + "s", "وضعِ مقدمه‌اش", O.st, r.st, function (v) { r.st = v; }),
            selF(id + "r", "گامِ اصلی یا جزئیاتِ فرعی؟", ["گامِ اصلی (خطِ اصلی)", "جزئیاتِ فرعی"], r.role, function (v) { r.role = v; })),
          field(id + "m", "به کدام مقدمه یا دلیل تکیه دارد؟", r.prem, function (v) { r.prem = v; }, 0)));
      });
      wrap.appendChild(tb);
      var fid = "svkf_" + key.replace(/[^a-z0-9]/gi, "");
      wrap.appendChild(selF(fid, "صورتِ کلِ استدلال", O.form, form, function (v) { form = v; }));
      var res = h("div", { "aria-live": "polite" });
      wrap.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn sm sv-chkrun", type: "button", onclick: function () {
        var w = weakOf(rows, form), mains = rows.map(function (r, i) { return /^گامِ اصلی/.test(r.role || "") ? i : -1; }).filter(function (i) { return i >= 0; });
        s.chk[key] = { rows: rows, form: form, weak: w, main: mains, at: nowISO(), title: title || "" };
        if (w) { s.chk[key].weakT = w.t || w.why[0]; seed(s, "c"); }
        S.put(pg); res.innerHTML = "";
        res.appendChild(w ? h("div", { class: "card soft badv sv-weak" }, h("strong", {}, w.i >= 0 ? "نخستین گامِ ضعیف: گامِ " + fa(w.i + 1) : "ضعف در صورتِ استدلال"), w.t ? h("p", {}, "«" + w.t + "»") : null, h("ul", { class: "small" }, w.why.map(function (x) { return h("li", {}, x); })),
            h("p", { class: "small muted" }, "این گام از فردا در «امروز» برمی‌گردد تا ثابتش کنی یا جایگزینش را بیابی."))
          : h("div", { class: "card soft okv sv-weak-none" }, h("strong", {}, "گامِ ضعیفی نیافتی."), h("p", { class: "small" }, "هر گام را روشن می‌بینی، ثابت می‌کنی و مقدمه‌اش یقینی است؛ صورتِ کل قیاسِ معتبر است.")));
        res.appendChild(h("p", { class: "small sv-mainline" }, mains.length ? "خطِ اصلی: " + mains.map(function (i) { return "گامِ " + fa(i + 1); }).join("، ") + (mains[0] > 0 ? " — پیش از جزئیاتِ گام‌های " + fa(1) + " تا " + fa(mains[0]) + "، همین‌ها را وارسی کن." : "؛ جزئیاتِ فرعی را پس از آن‌ها پر کن.")
          : "هنوز هیچ گامی را «گامِ اصلی» نگذاشته‌ای: اول خطِ اصلیِ حل را مشخص کن (کدام گام‌ها بی‌آن‌ها حل فرو می‌ریزد)، بعد جزئیات."));
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
    var s = sol(pg), d = { prog: "", gain: "" }, willSlot = h("div", { class: "sv-cpwill" });
    var box = h("section", own({ class: "card soft sv-cp", role: "group", "aria-label": "ایستِ پیشرفت" }), h("h4", {}, "⏸ ایست: نشانه‌های پیشرفت"),
      h("p", { class: "small" }, "مدتی است روی همین گامی. پیش از ادامه: پیشرفتی داشته‌ای؟ تا این‌جا چه به دست آمده؟ گاهی ادامه درست است، گاهی تغییرِ مسئله (حالتِ خاص، بخشی از شرط، مسئلهٔ کمکی)، و گاهی کنار گذاشتن تا فردا — ذهن در فاصله کار می‌کند."),
      selF("svCpP", "پیشرفتی داشته‌ای؟", ["بله، روشن", "کمی", "نه"], "", function (v) { d.prog = v; willSlot.innerHTML = ""; if (v === "نه") { var hs = A.willHost("prob", p.id); if (hs) willSlot.appendChild(A.willCard(hs, "stuck", "پیشرفتی نبود: پیش از ادامه، تغییر یا کنار گذاشتن — کوچک‌ترین گامی که تا وارسیِ بعد برمی‌داری چیست؟ (اختیاری؛ روزِ موعد برمی‌گردد)")); } }),
      field("svCpG", "دستاوردِ اصلی تا این‌جا چه بود؟ (حتی «فهمیدم کدام راه کار نمی‌کند»)", "", function (v) { d.gain = v; }, 2),
      selF("svCpFeel", "راهِ فعلی چه حسی می‌دهد؟ (نشانهٔ پیشرفت: هماهنگ و متعادل شدنِ تکه‌ها)", ["متعادل و هماهنگ — تکه‌ها جا می‌افتند", "ناهماهنگ — چیزی جا نمی‌افتد", "هنوز حسی ندارم"], "", function (v) { d.feel = v; }));
    function rec(choice) {
      if (!d.prog) { A.toast("اول بگو پیشرفتی داشته‌ای یا نه.", "bad"); return null; }
      var e = { at: nowISO(), lv: st.lv, sid: s0.id, i: st.i, prog: d.prog, gain: txt(d.gain), feel: d.feel || "", choice: choice };
      s.cps.push(e); if (s.cps.length > 60) s.cps = s.cps.slice(-60); return e;
    }
    var more = h("div", { class: "small" });
    box.appendChild(h("div", { class: "row gap wrap" },
      h("button", { class: "btn sm sv-cpgo", type: "button", onclick: function () { if (rec("ادامه")) { S.put(pg); box.remove(); A.toast("ادامه بده؛ دستاوردت ثبت شد."); } } }, "ادامه می‌دهم"),
      h("button", { class: "btn ghost sm sv-cpchg", type: "button", onclick: function () { var e0 = rec("تغییرِ مسئله"); if (!e0) return; S.put(pg); more.innerHTML = "";
        more.appendChild(h("ul", {}, ["حالتِ خاص‌تری را حل کن (یک عدد، یک شکلِ ساده، یک مورد).", "فقط بخشی از شرط را نگه دار: مجهول چقدر معین می‌شود؟", "مسئلهٔ کمکیِ ساده‌تر یا مشابهی بساز و اول آن را حل کن.", "به مجهول (یا حکم) نگاه کن و از آن به عقب برو."].map(function (x) { return h("li", {}, x); })));
        /* به پایان بنگر: اگر هم مجهول و هم داده را عوض کنی، خطرِ گم کردنِ مسئلهٔ اصلی هست — پلِ برگشت را همین حالا بنویس */
        more.appendChild(h("div", own({ class: "col gap sv-cpback" }), field("svCpBridge", "از مسئلهٔ تغییریافته چطور به مسئلهٔ اصلی برمی‌گردی؟ (اگر هم مجهول و هم داده را عوض کنی، ممکن است مسئلهٔ اصلی گم شود)", "", function (v) { e0.bridge = txt(v); S.put(pg); }, 2))); } }, "مسئله را تغییر می‌دهم"),
      h("button", { class: "btn ghost sm sv-cpaside", type: "button", onclick: function () { var e = rec("کنار گذاشتن"); if (!e) return;
        s.aside = { lv: st.lv, i: st.i, sid: s0.id, order: st.order, gain: e.gain, at: e.at, due: tomorrow() }; S.put(pg);
        A.toast("کنار گذاشتی؛ فردا در «امروز» برمی‌گردد."); A.go("e_prob"); } }, "کنار می‌گذارم تا فردا")));
    box.appendChild(willSlot);
    box.appendChild(more);   // پیش‌تر به‌عنوانِ آرگومانِ دومِ appendChild گم می‌شد: پیشنهادهای «تغییرِ مسئله» هرگز دیده نمی‌شدند
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
    var s = sol(pg), due = duePh(s, pg), pend = pending(s);
    if (!due.length && !pend.length) return null;
    var T = TYPES[typeOf(p, s)];
    var box = h("section", own({ class: "card sv-rev" }), h("div", { class: "eyebrow" }, "مرورِ فاصله‌دار (۱، ۳، ۷، ۲۱، ۶۰ روز)"), h("h3", {}, "پیش از تمرینِ امروز: بی‌نگاه"));
    if (pend.length) box.appendChild(h("p", { class: "small warnline sv-pend" }, "ناتمام: " + pend.map(function (x) { return (x.k === "u" ? "کارتِ فهمِ سطحِ " : "بازنگریِ سطحِ ") + fa(x.lv); }).join("، ") + " — در همان سطح، کارت را بنویس."));
    function lastU() { var ks = Object.keys(s.u).filter(function (k) { return s.u[k] && !s.u[k].skipped; }).sort(function (a, b) { return b - a; }); return ks.length ? s.u[ks[0]] : null; }
    function lastG() { var ks = Object.keys(s.g).sort(function (a, b) { return b - a; }); return ks.length ? s.g[ks[0]] : null; }
    function lastT() { var L = []; ["und", "plan", "exec", "back"].forEach(function (k) { ((pg.tut || {})[k] || []).forEach(function (e) { if (e && e.src === "sim" && !e.skip && e.q && e.k !== "motive") L.push(e); }); });
      L.sort(function (a, b) { return String(a.at).localeCompare(String(b.at)); }); var weak = L.filter(function (e) { return e.self != null && e.self < 2; }); return (weak.length ? weak : L).pop() || null; }
    function lastM() { var L = s.mot.filter(function (m) { return m && m.self != null; }); var weak = L.filter(function (m) { return m.self < 2; }); return (weak.length ? weak : L).pop() || null; }
    function lastW() { var ks = Object.keys(s.chk).filter(function (k) { return s.chk[k] && s.chk[k].weak; }).sort(function (a, b) { return String(s.chk[b].at).localeCompare(String(s.chk[a].at)); }); return ks.length ? s.chk[ks[0]] : null; }
    due.forEach(function (ph) {
      var d = {}, card = h("div", { class: "card soft col gap sv-rph", "data-ph": ph }, h("h4", {}, PH[ph])), out = h("div", { class: "col gap" });
      var reveal;
      if (ph === "u") {
        var xu = lastU() || {}, lvU = xu.from === "live";
        /* مسئلهٔ حل‌نشدهٔ خودم (a38): «کل در یک جمله» و «چرا می‌خواهی حلش کنی» هم از حافظه برمی‌گردند و با نوشتهٔ پیشین سنجیده می‌شوند */
        if (lvU) { card.appendChild(field("svRU1", "کلِ مسئله در یک جمله (بی‌نگاه)", "", function (v) { d.one = v; }, 0)); card.appendChild(field("svRUW", "چرا می‌خواستی حلش کنی؟ هنوز همان است؟", "", function (v) { d.why = v; }, 0)); }
        card.appendChild(field("svRU", T.u, "", function (v) { d.u = v; }, 2)); card.appendChild(field("svRD", T.d, "", function (v) { d.d = v; }, 2)); card.appendChild(field("svRC", T.c, "", function (v) { d.c = v; }, 2));
        reveal = function () { var x = lastU() || {}; return [h("p", { class: "small" }, h("strong", {}, "صورت: "), String(p.statement || "")), h("p", { class: "small muted" }, "کارتِ پیشینت: " + [x.u, x.d, x.c].filter(Boolean).join(" · ")),
          lvU ? h("p", { class: "small muted sv-ruone" }, "کلِ مسئله که نوشته بودی: «" + (x.one || "—") + "» · چرا: «" + (x.why || "—") + "»" + (d.why ? " · حالا: «" + txt(d.why) + "»" : "")) : null]; };
      } else if (ph === "b") {
        card.appendChild(field("svRB", "از این مسئله چه درسی گرفتی و کجای دیگر به کارش می‌بری؟", "", function (v) { d.b = v; }, 3));
        var bb = p.live && s.b && s.b[1] && s.b[1].done ? s.b[1] : null;
        /* مسئلهٔ زنده: «در یک نگاه»، «راهِ دیگر» و «چه کار کرد» هم از حافظه برمی‌گردند */
        if (bb && bb.glance) card.appendChild(field("svRBG", "کلِ حل در یک نگاه — و راهِ دیگری که به همان می‌رسید (بی‌نگاه)", "", function (v) { d.bg = v; }, 2));
        reveal = function () { return [h("ul", { class: "small" }, s.lessons.slice(-3).map(function (l) { return h("li", {}, l.use + (l.newProb ? " — مسئلهٔ تازه‌ات: " + l.newProb : "")); })),
          bb && bb.glance ? h("p", { class: "small muted sv-rbwas" }, "در یک نگاه: «" + bb.glance + "» · راهِ دیگر: «" + (bb.other || "—") + "» · چه کار کرد: «" + (bb.worked || "—") + "»") : null]; };
      } else if (ph === "g") {
        var g = lastG() || {};
        card.appendChild(h("p", { class: "small" }, "حدسِ پیشینت: «" + (g.guess || "—") + "»" + (p.live && g.hit ? " · داوری‌ات پس از آنچه شد: " + g.hit : "")));
        /* مسئلهٔ زنده (a38): حدسی که واقعیت ردش کرده دوباره آزموده نمی‌شود — مرور می‌پرسد چه ردش کرد و برای حدسِ بعد چه می‌آموزد */
        if (p.live && g.hit === "نادرست بود") card.appendChild(field("svRG", "حدست رد شد. از حافظه: چه چیزی ردش کرد، و برای حدسِ بعدی‌ات در چنین مسئله‌ای چه می‌آموزی؟", "", function (v) { d.g = v; }, 3));
        else card.appendChild(field("svRG", "یک حالتِ خاص یا مثالِ نقضِ تازه بنویس که این حدس را بیازماید، و نتیجه‌اش را", "", function (v) { d.g = v; }, 3));
        var gk = g.kit || null, grv = gk ? (gk.rivals || []).filter(function (x) { return txt(x.t); }) : [];
        if (grv.length) card.appendChild(field("svRGR", "حدس‌های رقیبت چه بودند و کدام حالت جدایشان می‌کرد؟ (بی‌نگاه)", "", function (v) { d.gr = v; }, 2));
        var liveOut = function () { var L = s.live, b = s.b && s.b[1], st = L && (L.steps || []).filter(function (x) { return x.out && x.out.what; }).pop();
          if (b && b.done) return "در بازنگری: " + (b.state === "abandoned" ? "کنار گذاشتی — «" + (b.why || "") + "»" : (b.chkHow || b.glance || "حل شد") + (b.chkRes ? " (" + b.chkRes + ")" : ""));
          return st ? "آخرین نتیجهٔ واقعی: «" + st.out.what + "»" : null; };
        reveal = function () { var lo = p.live ? liveOut() : null; return [p.live ? (lo ? h("p", { class: "small sv-rgout" }, h("strong", {}, "آنچه واقعاً شد: "), lo) : null) : h("p", { class: "small" }, h("strong", {}, "پاسخِ مسئله: "), String(p.answer || "—")), g.test ? h("p", { class: "small muted" }, "آزمونِ پیشینت: " + g.test) : null,
          grv.length ? h("p", { class: "small muted" }, "رقیب‌هایت: " + grv.map(function (x) { return "«" + x.t + "»" + (x.test ? " (آزمون: " + x.test + ")" : ""); }).join("، ") + (gk.chk && gk.chk.sep ? " · حالتِ جداکننده: " + LT("n = " + gk.chk.sep.n) : gk.chk && gk.chk.decided ? " · جدولت داوری کرد: " + (gk.chk.decided === "both" ? "هر دو رد شدند" : "حدسِ " + fa(gk.chk.decided) + " رد شد") : "")) : null,
          gk && txt(gk.formula) ? h("p", { class: "small muted" }, "حدسِ دقیقت: " + gk.formula + (gk.chk && gk.chk.fits === false ? " (با جدولت نمی‌خواند)" : "")) : null]; };
      } else if (ph === "t") {
        var te = lastT() || {}, ts = (p.stages || []).filter(function (x) { return x.id === te.sid; })[0];
        card.appendChild(h("p", { class: "small" }, "پرسش: «" + (te.q || "—") + "»" + (ts ? " — در گامِ «" + clip(ts.q, 90) + "»" : "")));
        card.appendChild(field("svRT", "دوباره، بی‌نگاه: همین پرسش در همین گام چه پاسخی دارد و به کدام حرکت راه می‌برد؟", "", function (v) { d.t = v; }, 3));
        reveal = function () { return [h("p", { class: "small muted" }, "پاسخِ پیشینت: «" + (te.text || "—") + "»" + (te.motive ? " · انگیزه‌ای که نوشتی: «" + te.motive + "»" : "")), ts ? h("p", { class: "small" }, h("strong", {}, "حرکتِ واقعی: "), ts.move || "—") : null]; };
      } else if (ph === "h") {
        var LH = s.live || {}, hk = ((LH.plan && LH.plan.heur) || [])[0], hq = { back: "از آخر به عقب در این مسئله به کجا رسیدی — وضعِ حل‌شده، و گامِ پیش از آن؟", aux: "مسئلهٔ کمکی‌ات چه بود و از آن چطور به مسئلهٔ اصلی برمی‌گشتی؟", move: "کدام حرکت را برای این مسئله برگزیدی و چرا؟", rel: "کدام مسئلهٔ مرتبط (یا چه چیزِ آشنایی) را در این مسئله یافتی و چه چیزی از آن به کار آمد؟" }[hk] || "کدام ابزارِ طرح را به کار بردی؟";
        card.appendChild(h("p", { class: "small" }, hq));
        card.appendChild(field("svRH", "از حافظه، بی‌نگاه", "", function (v) { d.hh = v; }, 3));
        reveal = function () { var w = hk === "back" && LH.back ? "حل‌شده: «" + LH.back.solved + "» ⇐ پیش از آن: «" + LH.back.before1 + "»" : hk === "aux" ? (LH.aux || []).map(function (a) { return "«" + a.t + "» — برگشت: " + a.bridge; }).join(" · ") : hk === "move" ? (LH.moves || []).map(function (m) { return ((A.MOVES || {})[m.mv] || {}).fa + ": " + m.why; }).join(" · ") : hk === "rel" && LH.seen ? (LH.seen.where || LH.seen.fam || "") : "";
          return [h("p", { class: "small muted sv-rhwas" }, "آنچه نوشته بودی: " + (w || "—"))]; };
      } else if (ph === "m") {
        var mo = lastM() || {}, ms = (p.stages || []).filter(function (x) { return x.id === mo.sid; })[0];
        card.appendChild(h("p", { class: "small" }, ms ? "گام: «" + clip(ms.q, 120) + "»" : "گامی که انگیزه‌اش را نوشتی"));
        card.appendChild(field("svRM", "دوباره، بی‌نگاه: این گام چرا همان‌جا آمد و به کدام بخشِ مجهول (یا حکم) نزدیکت کرد؟", "", function (v) { d.m = v; }, 3));
        reveal = function () { return [h("p", { class: "small muted" }, "انگیزه‌ای که پیش‌تر نوشتی: «" + (mo.motive || "—") + "»"), ms ? h("p", { class: "small" }, h("strong", {}, "ایدهٔ واقعیِ گام: "), ms.idea || "—") : null]; };
      } else {
        var w = lastW() || {};
        card.appendChild(h("p", { class: "small" }, "گامِ ضعیف: «" + (w.weakT || "—") + "»"));
        card.appendChild(field("svRW", "اکنون: این گام را ثابت کن، یا بگو با چه گامی جایگزینش می‌کنی (و به کدام مقدمه تکیه دارد)", "", function (v) { d.w = v; }, 3));
        reveal = function () { return [h("ul", { class: "small muted" }, ((w.weak && w.weak.why) || []).map(function (x) { return h("li", {}, x); }))]; };
      }
      card.appendChild(h("button", { class: "btn sm sv-rshow", type: "button", onclick: function (e) {
        var v = d.u || d.b || d.g || d.w || d.t || d.m || d.hh; if (txt(v).length < 3) { A.toast("اول بی‌نگاه بنویس.", "bad"); return; }
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
    var d = LB[key] = LB[key] || { chk: {}, chkHow: "", chkRes: "", arg: "", other: "", glance: "", use: "", newProb: "", hit: "", short: "", better: "", crit: "", clumsy: "", taste: "", main: "", intu: "", pic: "" };
    var g = s.g[lv];
    var box = h("section", own({ class: "card sv-lb", "data-lv": lv }), h("div", { class: "eyebrow" }, "پس از آخرین گام · سطحِ " + fa(lv)), h("h3", {}, "بازنگری: نتیجه و راه را وارسی کن"),
      h("p", { class: "small" }, "حل تمام نیست تا نگاهی به پشتِ سر نینداخته‌ای. با جمله‌های خودت بنویس؛ درسِ تو در «درس‌ها»ی همین مسئله می‌نشیند، یک کارتِ مرور می‌سازد و بذرِ مسئله‌های هم‌ساختار می‌شود."));
    box.appendChild(h("h4", {}, "۱) نتیجه را وارسی کن"));
    box.appendChild(h("div", { class: "row gap wrap small" }, [["sp", "حالتِ خاص یا حدی"], ["dim", "ابعاد یا واحدها"], ["sym", "تقارن"], ["all", "همهٔ داده‌ها (یا کلِ فرض) در جواب آمده‌اند؟"],
      ["ana", "با مسئلهٔ قیاسیِ ساده‌تر (مثلاً همتای دوبعدیِ یک مسئلهٔ سه‌بعدی)"], ["mono", "یکنوایی: اگر یک داده بزرگ‌تر شود، جواب همان‌سو تغییر می‌کند که باید؟"], ["num", "وارسیِ عددی یا تجربی: یک نمونهٔ واقعی را حساب کن یا بسنج"]].map(function (c) {
      var id = "svLb_" + c[0] + lv; return h("label", { class: "row gap", for: id }, h("input", { type: "checkbox", id: id, checked: !!d.chk[c[0]], onchange: function (e) { d.chk[c[0]] = e.target.checked; } }), c[1]);
    })));
    box.appendChild(field("svLbHow" + lv, "چطور وارسی کردی و چه دیدی؟", d.chkHow, function (v) { d.chkHow = v; }, 2));
    box.appendChild(selF("svLbRes" + lv, "نتیجهٔ وارسی", ["نتیجه سالم ماند", "ایرادی یافتم", "نتوانستم وارسی کنم"], d.chkRes, function (v) { d.chkRes = v; }));
    var gdl = guessDrill(); if (gdl) box.appendChild(gdl);
    box.appendChild(h("h4", {}, "۲) استدلال را در نقاطِ حساس وارسی کن"));
    var argF = field("svLbArg" + lv, "حلت را گام‌به‌گام بنویس (هر گام یک سطر)", d.arg, function (v) { d.arg = v; }, 4);
    box.appendChild(argF);
    box.appendChild(stepCheck(function () { return d.arg; }, pg, "lb" + lv, p, p.title + " — سطحِ " + fa(lv)));
    box.appendChild(h("h4", {}, "۳) از راهِ دیگر و ۴) در یک نگاه"));
    box.appendChild(field("svLbOther" + lv, "از راهِ دیگری هم به همین نتیجه می‌رسی؟ چطور؟", d.other, function (v) { d.other = v; }, 2));
    box.appendChild(field("svLbGlance" + lv, "کلِ حل را در یک نگاه (یک جمله) ببین", d.glance, function (v) { d.glance = v; }, 0));
    box.appendChild(h("h4", {}, "بهترش کن"));
    box.appendChild(field("svLbShort" + lv, "کدام بخشِ طولانی را می‌شود ساده‌تر یا کوتاه‌تر کرد؟", d.short, function (v) { d.short = v; }, 0));
    box.appendChild(field("svLbBetter" + lv, "راه را چطور بهتر می‌کنی — شهودی‌ترش می‌کنی یا به چیزی که از پیش می‌دانی وصلش می‌کنی؟", d.better, function (v) { d.better = v; }, 0));
    box.appendChild(field("svLbCrit" + lv, "اگر یک داده را پارامتر بگیری (مسئلهٔ کلی‌تر)، مقدارهای بحرانی یا جالبِ آن کدام‌اند و آن‌جا چه می‌شود؟", d.crit, function (v) { d.crit = v; }, 0));
    box.appendChild(field("svLbClumsy" + lv, "کدام تلاشت (یا کدام بن‌بستِ این مسئله) ناشیانه بود — و چرا؟", d.clumsy, function (v) { d.clumsy = v; }, 0));
    if ((p.dead || []).length) box.appendChild(h("button", { class: "linkish small sv-lbdead", type: "button", onclick: function () { A.go("e_prob", p.id, "dead"); } }, "بن‌بست‌های این مسئله را ببین و یکی را تحلیل کن ←"));
    if (t !== "find") {
      box.appendChild(h("h4", {}, "برهان: خطِ اصلی و جایگاهش"));
      box.appendChild(field("svLbMain" + lv, "ایدهٔ اصلیِ برهان در یک جمله — چیزی که از خودِ حکم مهم‌تر است، جای دیگر هم به کار می‌آید و اگر حکم را فراموش کنی، از رویش بازش می‌سازی", d.main, function (v) { d.main = v; }, 0));
      box.appendChild(field("svLbIntu" + lv, "کدام گام را فعلاً شهودی پذیرفتی و بعداً صوری‌اش می‌کنی؟ (برهانِ ناقص، آگاهانه و در جای خودش)", d.intu, function (v) { d.intu = v; }, 0));
      box.appendChild(field("svLbPic" + lv, "تصویر یا شکلی که برهان را شهودی می‌کند", d.pic, function (v) { d.pic = v; }, 0));
    }
    box.appendChild(field("svLbTaste" + lv, "این نوع مسئله با سلیقه و توانت چطور می‌خواند؟ کدام بخشش را دوست داشتی و کدامش را نه؟", d.taste, function (v) { d.taste = v; }, 0));
    box.appendChild(h("h4", {}, "۵) نتیجه یا روش را کجای دیگر به کار می‌بری؟"));
    box.appendChild(field("svLbUse" + lv, "درسِ تو: این روش یا نتیجه کجای دیگر به کار می‌آید؟", d.use, function (v) { d.use = v; }, 2));
    box.appendChild(field("svLbNew" + lv, "یک مسئلهٔ تازه بساز که با همین روش (یا با همین نتیجه) حل شود", d.newProb, function (v) { d.newProb = v; }, 2));
    d.kit = d.kit || blankKit();
    box.appendChild(kitUI(d.kit, { idp: "svLK" + lv, problem: p.statement || "", parts: ["table", "formula", "rivals", "ana"], title: "تعمیم با جدول: یک داده را n بگیر — حالت‌ها، تفاضل‌ها، حکمِ دقیق، و رقیبِ آن",
      intro: "مسئله را کلی کن: یکی از داده‌ها را n بگیر و نتیجه را برای n = ۱، ۲، ۳ … خودت حساب کن. کد تفاضل‌های پیاپی را می‌سازد؛ حکمِ کلی را دقیق (فرمول) بنویس تا با هر حالت سنجیده شود. یک حکمِ رقیب هم بنویس و بگو کدام حالت جدایشان می‌کند. قیاس: همین نتیجه در یک بُعد کمتر یا بیشتر چه می‌شود؟" }));
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
      var EXTRA = [["short", "ساده‌تر/کوتاه‌تر"], ["better", "بهتر کردنِ راه"], ["crit", "مقدارهای بحرانی"], ["clumsy", "تلاشِ ناشیانه و چرایش"], ["main", "ایدهٔ اصلیِ برهان"], ["intu", "گامِ شهودیِ پذیرفته"], ["pic", "تصویرِ شهودی"], ["taste", "سلیقه"]];
      EXTRA.forEach(function (x) { if (txt(d[x[0]])) rec[x[0]] = txt(d[x[0]]); });
      if (!kitEmpty(d.kit)) rec.kit = kitCopy(d.kit);
      var extraTxt = EXTRA.filter(function (x) { return rec[x[0]]; }).map(function (x) { return x[1] + ": " + rec[x[0]]; }).join("\n");
      if (rec.kit && txt(rec.kit.formula)) extraTxt += (extraTxt ? "\n" : "") + "حکمِ کلیِ دقیق (فرمولِ n): " + txt(rec.kit.formula) + (rec.kit.rivals || []).filter(function (x) { return txt(x.t); }).slice(1).map(function (x) { return " · رقیب: " + txt(x.t) + (txt(x.test) ? " (آزمون: " + txt(x.test) + ")" : ""); }).join("");
      s.b[lv] = rec;
      var les = { lv: lv, use: rec.use, newProb: rec.newProb, glance: rec.glance, at: rec.at };
      if (A.newCard) { var cd = A.newCard("در مسئلهٔ «" + p.title + "» چه درسی گرفتی و کجای دیگر به کارش می‌بری؟ (بی‌نگاه)", rec.use + "\nمسئلهٔ تازه‌ای که ساختی: " + rec.newProb + (extraTxt ? "\n" + extraTxt : ""), { pb: p.id, due: tomorrow() }); les.card = cd && cd.id; }
      s.lessons.push(les); seed(s, "b");
      if (g && g.guess) { g.hit = d.hit; g.hitAt = nowISO(); }
      S.put(pg); delete LB[key]; A.toast("بازنگری ثبت شد: درس، کارتِ مرور و بذرِ مسئله‌های هم‌ساختار."); A.render();
    } }, "ثبتِ بازنگری"),
      h("button", { class: "btn ghost sm sv-lblater", type: "button", onclick: function () { if (!s.b[lv] || !s.b[lv].done) { s.b[lv] = { skipped: true, at: nowISO() }; S.put(pg); } A.toast("بازنگری ناتمام ماند؛ در «امروز» برمی‌گردد."); A.render(); } }, "بعداً — در «امروز» یادم بیاور")));
    return box;
  }
  A.solveLookBackCard = lookBack;


  /* ---------- پرسشِ همین لحظه (بی‌مدل): همان پرسشِ مرحلهٔ گام، از کلی به خاص، با پاسخِ کوتاهِ خودت ----------
     همان فهرست‌های ثابتِ ثبت‌گاهِ حرکت‌ها (A.SOLVE_PHASES، A.PLAN_QS، A.BACK_QS) — همان پرسش‌هایی که قلابِ «معلمِ حلِ مسئله» ِ دستیار هم
     می‌دهد، ولی این‌جا بی‌مدل: یک پرسش در هر گام، به ترتیب (پرسشِ بعدی کمی خاص‌تر)، «این پرسش حالا نمی‌خواند» ⇒ پرسشِ بعد (پرسشِ بی‌دلیل
     ممنوع)، پاسخ در eprog.tut (همان ظرفِ tutor_mark: und/plan/exec/back، src: "sim"). پس از دیدنِ حرکتِ واقعی: «انگیزهٔ این گام» و
     خودداوری «پاسخت به حرکتِ واقعی راه می‌برد؟» ⇒ نوبتِ مرورِ «t» روی همان نردبان (نادرست ⇒ فردا، درست ⇒ پلهٔ بعد). */
  var TK = { u: "und", p: "plan", c: "exec", b: "back" };
  var WHY = { u: "هنوز مسئله را نفهمیده‌ای کاری نکن: بی دانستنِ مجهول، داده و شرط، هر حرکتی کورمال است.", p: "طرح از پیوندِ داده و مجهول درمی‌آید؛ پرسش‌ها از آشنا به دور و از کل به جزء می‌روند.",
    c: "اجرا یعنی هر گام را وارسی کنی، نه فقط بنویسی؛ و پیش از محاسبه بدانی تقریباً به چه می‌رسی.", b: "تا نگاهی به پشتِ سر نیندازی، از حل چیزی برای مسئلهٔ بعد نمی‌ماند." };
  /* t = نوعِ مسئله: برای «اثباتی» و «اثبات یا رد کن» پرسش‌های طرح همان پرسش‌های همان نوع‌اند (حکم/فرض)، نه پرسش‌های مسئلهٔ یافتنی (مجهول/داده) —
     بازبینیِ دورِ ۵ (۲۰۲۶-۱۰-۱۵): پیش‌تر مسئلهٔ اثباتی هم «به مجهول نگاه کن» می‌گرفت. */
  function askList(ph, lv, t) {
    var SP = A.SOLVE_PHASES || {};
    if (ph === "u") return ((SP.u && SP.u.q) || []).concat(["چه؟ چرا؟ کجا؟ کی؟ چگونه؟ — کدام‌یک دربارهٔ این مسئله هنوز بی‌پاسخ است؟"]);
    if (ph === "p" && (t === "prove" || t === "pod")) return TYPES[t].plan.slice();
    if (ph === "p") return (A.PLAN_QS || []).map(function (x) { return x.t; });
    if (ph === "c") {
      var q = ["پیش از اجرا: طرحت آماده است — گام‌های اصلی‌اش را می‌دانی؟ نه با عجله آغاز کن، نه با درنگِ بی‌پایان.", "پیش از محاسبه: نتیجه تقریباً چه خواهد بود (بزرگی، علامت، شکل)؟"];
      var cq = (SP.c && SP.c.q) || [];
      q.push(cq[0] || "روشن می‌بینی که این گام درست است؟");
      if (lv >= 3 && cq[1]) q.push(cq[1]);   // برهانِ صوری فقط وقتی آماده‌ای (از سطحِ ۳)؛ در سطحِ آشنایی «روشن می‌بینی؟» بس است
      return q;
    }
    return (A.BACK_QS || []).slice();
  }
  A.solveAskList = askList;
  /* ---------- G: درونی‌سازیِ پرسش‌ها — «الان از خودت چه می‌پرسی؟» پیش از دیدنِ پرسشِ فهرست ----------
     پولیا: پرسش‌ها باید پرسش‌های خودت شوند. پلهٔ هر پرسش از خودِ پاسخ‌ها ساخته می‌شود (رکوردِ تازه‌ای نیست، آستانهٔ قراردادی نیست):
     همان نردبانِ ۱/۳/۷/۲۱/۶۰ (nextIv) روی کاربست‌های همان پرسش با خودداوری («راه برد/کمک کرد» = ۲)؛ کاربستِ پیش از موعد پله را جابه‌جا
     نمی‌کند (تکرارِ فشرده یادگیریِ فاصله‌دار نیست). پلهٔ ۳ یعنی دست‌کم دو بار، با فاصله، کمک کرد و از آن پس شکستی نبود. */
  A.Q_OWN_RUNG = 3;
  function qk(q) { return String(q || "").replace(/\s+/g, " ").trim(); }
  /* روزِ کاربست = روزِ پاسخ، نه روزِ داوری (داوریِ دیرتر نباید فاصله بسازد) */
  function useDay(e) { return e.d || (A.localDay ? A.localDay(e.at) : String(e.at || "").slice(0, 10)); }
  A.qUses = function (q) {
    var k = qk(q), L = [];
    S.all("eprog", function (r) { return r && r.tut; }).forEach(function (pg) { ["und", "plan", "exec", "back"].forEach(function (tk) { (pg.tut[tk] || []).forEach(function (e) {
      if (e && !e.skip && e.k !== "motive" && (e.src === "sim" || e.src === "live") && qk(e.q) === k) L.push(e); }); }); });
    return L.sort(function (a, b) { return String(useDay(a)).localeCompare(String(useDay(b))) || String(a.at).localeCompare(String(b.at)); });
  };
  A.qRung = function (q) {
    var iv = 0, due = null;
    A.qUses(q).forEach(function (e) {
      if (e.self == null) return; var d = useDay(e); if (due && d < due) return;
      iv = iv ? nextIv(iv, e.self === 2) : (e.self === 2 ? nextIv(LADDER[0], true) : LADDER[0]); due = A.addDays(d, iv);
    });
    return iv ? LADDER.filter(function (x) { return x <= iv; }).length : 0;
  };
  var SELF_D = {};
  /* null ⇒ پرسش هنوز به آن پله نرسیده (رفتارِ پیشین)؛ {done:false, el} ⇒ اول بپرس؛ {done:true, el} ⇒ پرسیده شد و ثبت شد (یادداشتِ کوتاه) */
  function selfAskGate(pg, q, c) {
    var tut = pg.tut = pg.tut || {}, L = tut.selfAsk = tut.selfAsk || [];
    var rec = L.filter(function (x) { return x && qk(x.q) === qk(q) && x.lv === c.lv && x.sid === c.sid && x.src === c.src; }).pop();
    if (rec && rec.match != null) return { done: true, el: h("p", { class: "small sv-selfdone" }, "پرسشِ خودت: «" + rec.mine + "» · با پرسشِ فهرست " + ["نمی‌خواند", "تاحدی می‌خواند", "می‌خواند"][rec.match]) };
    if (A.qRung(q) < A.Q_OWN_RUNG) return null;
    var key = [pg.id, c.lv, c.sid, qk(q)].join("|"), d = SELF_D[key] = SELF_D[key] || { mine: "", shown: false };
    var box = h("div", own({ class: "col gap sv-selfask" }),
      h("p", { class: "small" }, "این پرسش را بارها، با فاصله، به کار برده‌ای و کمکت کرده — دیگر لازم نیست صفحه آن را بدهد. اول خودت: در همین لحظه از خودت چه می‌پرسی؟ بعد با پرسشِ فهرست مقایسه کن."));
    var id = "svSelf_" + String(c.src) + "_" + c.lv + "_" + String(c.sid).replace(/[^a-z0-9]/gi, "");
    box.appendChild(field(id, "الان از خودت چه می‌پرسی؟", d.mine, function (v) { d.mine = v; }, 0, "پرسشی که خودت در این لحظه از خودت می‌پرسی"));
    var out = h("div", { class: "col gap", "aria-live": "polite" });
    box.appendChild(h("button", { class: "btn ghost sm sv-selfshow", type: "button", onclick: function (e) {
      if (txt(d.mine).length < 3) { A.toast("اول پرسشِ خودت را بنویس.", "bad"); return; }
      e.currentTarget.disabled = true;
      out.appendChild(h("p", { class: "small sv-selfq" }, h("strong", {}, "پرسشِ فهرست: "), q));
      out.appendChild(gradeBtns(function (v) {
        L.push({ at: nowISO(), d: A.today(), q: q, mine: txt(d.mine), match: v, lv: c.lv, sid: c.sid, ph: c.ph, src: c.src }); if (L.length > 200) tut.selfAsk = L.slice(-200);
        delete SELF_D[key]; S.put(pg); A.render();
      }, "پرسشِ خودت با پرسشِ فهرست می‌خواند؟"));
    } }, "پرسشِ فهرست را نشان بده"));
    box.appendChild(out);
    /* «پرسشِ بعد» در پلهٔ ۳ هم هست: پرسشی که حالا نمی‌خواند، حتی اگر از آنِ خودت شده، پرسیده نمی‌شود */
    if (c.onSkip) box.appendChild(h("button", { class: "btn ghost sm sv-selfskip", type: "button", onclick: function () { delete SELF_D[key]; c.onSkip(); } }, "این پرسش حالا نمی‌خواند — پرسشِ بعد"));
    return { done: false, el: box };
  }
  A.solveSelfAskGate = selfAskGate;
  function simEntries(pg, tk, lv, sid) { return ((pg.tut || {})[tk] || []).filter(function (e) { return e && e.src === "sim" && e.k !== "motive" && e.lv === lv && e.sid === sid; }); }
  function askCard(p, pg, st, s0) {
    var ph = A.stagePhase ? A.stagePhase(p, s0) : "p", ty = typeOf(p, pg.solve), Q = askList(ph, st.lv, ty); if (!Q.length) return null;
    var tk = TK[ph] || "plan", tut = pg.tut = pg.tut || {}; tut.qi = tut.qi || {};
    var mine = simEntries(pg, tk, st.lv, s0.id).filter(function (e) { return !e.skip; }).pop();
    var L = pg.lv[st.lv] || {}, es = Object.keys(L).map(function (k) { return L[k]; }).filter(function (e) { return e && e.at; }).sort(function (a, b) { return String(a.at).localeCompare(String(b.at)); });
    var lastWrong = es.length && !(es[es.length - 1].first === true || es[es.length - 1].self === 2);
    var qi = (tut.qi[tk] || 0) % Q.length, d = { a: "" };
    var pf = (A.SOLVE_PHASES && A.SOLVE_PHASES[ph] && A.SOLVE_PHASES[ph].fa) || "";
    /* باز فقط وقتی به کار است (نخستین گام یا پس از گامِ نادرست، و هنوز پاسخی ننوشته‌ای) — کارِ درستِ پیش‌رونده را قطع نمی‌کند */
    /* G (درونی‌سازیِ پرسش‌ها): پرسشی که پلهٔ نردبانش به A.Q_OWN_RUNG رسیده، پنهان است تا اول خودت بپرسی؛ زیرِ آن پله رفتار همان پیشین است */
    var gate = !mine ? selfAskGate(pg, Q[qi], { lv: st.lv, sid: s0.id, ph: ph, src: "sim", onSkip: function () {
      (tut[tk] = tut[tk] || []).push({ at: nowISO(), d: A.today(), q: Q[qi], qi: qi, skip: true, lv: st.lv, sid: s0.id, ph: ph, src: "sim" }); tut.qi[tk] = qi + 1; S.put(pg); A.render(); } }) : null;
    var det = h("details", own({ class: "card soft sv-ask", "data-ph": ph, open: !mine && (st.i === 0 || lastWrong) ? true : null }),
      h("summary", {}, "❔ پرسشِ همین لحظه (" + pf + "): " + (mine ? mine.q : gate && !gate.done ? "اول خودت بپرس" : Q[qi])));
    if (gate && !gate.done) { det.appendChild(gate.el); return det; }
    if (gate && gate.done) det.appendChild(gate.el);
    var u = (pg.solve && pg.solve.u && (pg.solve.u[st.lv] || pg.solve.u[1] || pg.solve.u[0])) || null;
    if (u && u.u) det.appendChild(h("p", { class: "small sv-goal" }, "🎯 هدف را گم نکن — " + (typeOf(p, pg.solve) === "find" ? "مجهول" : "حکم") + "، به زبانِ خودت: «" + clip(u.u, 140) + "»"));
    if (mine) { det.appendChild(h("p", { class: "small sv-askmine" }, "پاسخت: «" + mine.text + "»")); return det; }
    det.appendChild(h("p", { class: "small muted" }, "چرا این پرسش؟ " + (ph === "p" && ty !== "find" ? "طرحِ اثبات از پیوندِ فرض و حکم درمی‌آید؛ پرسش‌ها از آشنا به دور و از کل به جزء می‌روند." : WHY[ph]) + " اگر با وضعِ همین لحظه نمی‌خواند، نپرس — پرسشِ بعد را بگیر. پیش از پاسخ، از تجربهٔ خودت بپرس: آخرین بار کجا در چنین گامی گیر کردی و چه چیزی بازت کرد؟"));
    var id = "svAsk_" + st.lv + "_" + String(s0.id).replace(/[^a-z0-9]/gi, "");
    det.appendChild(field(id, "پاسخِ کوتاهِ تو (به قلمِ خودت)", "", function (v) { d.a = v; }, 0));
    det.appendChild(h("div", { class: "row gap wrap" },
      h("button", { class: "btn sm sv-askgo", type: "button", onclick: function () {
        if (!txt(d.a)) { A.toast("پاسخِ کوتاهت را بنویس — یا «پرسشِ بعد» اگر این پرسش حالا نمی‌خواند.", "bad"); return; }   // «۱۲» یا «x» هم پاسخِ کامل است
        (tut[tk] = tut[tk] || []).push({ at: nowISO(), d: A.today(), q: Q[qi], qi: qi, text: txt(d.a), lv: st.lv, sid: s0.id, ph: ph, src: "sim" });
        tut.qi[tk] = qi + 1; S.put(pg); A.toast("پاسخت ثبت شد؛ پس از دیدنِ حرکتِ واقعی با آن مقایسه‌اش می‌کنی."); A.render();
      } }, "ثبتِ پاسخ"),
      h("button", { class: "btn ghost sm sv-asknext", type: "button", onclick: function () {
        (tut[tk] = tut[tk] || []).push({ at: nowISO(), q: Q[qi], qi: qi, skip: true, lv: st.lv, sid: s0.id, ph: ph, src: "sim" });
        tut.qi[tk] = qi + 1; S.put(pg); A.render();
      } }, "این پرسش حالا نمی‌خواند — پرسشِ بعد (کمی خاص‌تر)")));
    return det;
  }
  A.solveAskCard = askCard;
  /* تکه‌های همین تونل برای «مسئلهٔ حل‌نشدهٔ خودم» (a38_live.js) — همان فیلدها، نردبان و داوری؛ نسخهٔ دوم ساخته نمی‌شود */
  A.solveUI = { field: field, selF: selF, typeSel: typeSel, gradeBtns: gradeBtns, planList: planList, own: own, txt: txt, clip: clip, sol: sol, prog: prog,
    seed: seed, seedAt: seedAt, grade: grade, nextIv: nextIv, LADDER: LADDER, PH: PH, WHY: WHY, reviewPanel: function (p, pg) { return reviewPanel(p, pg); }, kitCopy: kitCopy, qk: qk };
  /* پس از دیدنِ حرکتِ واقعی: انگیزهٔ گام + مقایسهٔ پاسخِ «پرسشِ همین لحظه» با حرکتِ واقعی (خودداوری ⇒ نوبتِ t) */
  function motiveCard(p, pg, st, s0) {
    var ph = A.stagePhase ? A.stagePhase(p, s0) : "p", tk = TK[ph] || "plan", s = sol(pg);
    var all = simEntries(pg, tk, st.lv, s0.id), e = all.filter(function (x) { return !x.skip; }).pop(), d = { m: "" };
    var mo = s.mot.filter(function (m) { return m.lv === st.lv && m.sid === s0.id; }).pop();
    var box = h("section", own({ class: "card soft sv-mot" }), h("h4", {}, "انگیزهٔ این گام"));
    if (mo && mo.self != null) { box.appendChild(h("p", { class: "small" }, "انگیزه‌ای که نوشتی: «" + (mo.motive || "—") + "» · داوری‌ات: " + ["۰ نه", "۱ تاحدی", "۲ کامل"][mo.self])); return box; }
    if (e && e.self != null) { box.appendChild(h("p", { class: "small" }, "انگیزه‌ای که نوشتی: «" + (e.motive || "—") + "» · داوری‌ات: " + ["۰ نه", "۱ تاحدی", "۲ کامل"][e.self])); return box; }
    var mvs = A.stageMoves ? A.stageMoves(p, s0) : [];
    box.appendChild(h("p", { class: "small" }, "درست بودنِ گام کافی نیست؛ خواننده (و خودت فردا) می‌خواهد بداند این گام چرا همین حالا آمد. با «ایده»ی بالا مقایسه کن."));
    if (mvs.some(function (m) { return m === "mv_equation" || m === "mv_represent"; })) box.appendChild(h("p", { class: "small muted" }, "اگر نماد یا جبرِ این گام زائد به نظرت می‌آید: همین نماد چه کاری را آسان کرد که بی آن سخت بود؟"));
    var helped = st.lv <= 2 && (st.lv === 1 || (pg.lv[st.lv] && pg.lv[st.lv][s0.id] && pg.lv[st.lv][s0.id].first === false));
    if (helped) box.appendChild(h("p", { class: "small muted sv-motext" }, "این گام را با سرنخ یا الگو برداشتی؛ طرحی که از بیرون می‌آید زود فراموش می‌شود — آن را به زبانِ خودت بازسازی کن (نادرست‌ها فردا بی‌سرنخ برمی‌گردند)."));
    var id = "svMot_" + st.lv + "_" + String(s0.id).replace(/[^a-z0-9]/gi, "");
    box.appendChild(field(id, "چرا این گام، همین حالا؟ به کدام بخشِ مجهول (یا حکم) نزدیکت کرد؟", "", function (v) { d.m = v; }, 0));
    if (e) box.appendChild(h("p", { class: "small" }, "پرسشی که پیش از گام از خودت پرسیدی: «" + e.q + "» — پاسخت: «" + e.text + "»"));
    var out = h("div", { class: "col gap" });
    box.appendChild(h("button", { class: "btn ghost sm sv-motgo", type: "button", onclick: function (ev) {
      if (txt(d.m).length < 3) { A.toast("انگیزهٔ گام را در یک جمله بنویس.", "bad"); return; }
      ev.currentTarget.disabled = true;
      out.appendChild(h("p", { class: "small" }, h("strong", {}, "ایدهٔ واقعیِ گام: "), s0.idea || "—"));
      out.appendChild(gradeBtns(function (v) {
        var at = nowISO();
        s.mot.push({ at: at, lv: st.lv, sid: s0.id, ph: ph, tk: tk, motive: txt(d.m), self: v, selfAt: at });
        /* داوری روی پاسخِ «❔ پرسشِ همین لحظه» فقط وقتی پاسخی بوده؛ مرورِ «t» هم فقط همان پرسش را برمی‌گرداند (نه «انگیزهٔ گام») */
        if (e) { e.motive = txt(d.m); e.self = v; e.selfAt = at; e.selfD = A.today(); seedAt(s, "t", v === 2); }
        else seedAt(s, "m", v === 2);   // انگیزهٔ بی‌پرسش نوبتِ خودش را دارد («m»)، نه «t»
        S.put(pg);
        A.toast(v === 2 ? "ثبت شد؛ این پرسش چند روز دیگر برمی‌گردد." : "ثبت شد؛ همین پرسش فردا دوباره می‌آید."); out.innerHTML = ""; out.appendChild(h("p", { class: "small good sv-motok" }, "ثبت شد."));
      }, e ? "پاسخت (و انگیزه‌ای که نوشتی) به حرکتِ واقعی راه می‌بُرد؟" : "انگیزه‌ات با ایدهٔ واقعیِ گام می‌خواند؟"));
    } }, "ثبت و مقایسه با ایدهٔ گام"));
    box.appendChild(out);
    return box;
  }
  A.solveMotiveCard = motiveCard;

  /* ---------- موفقیتِ کوچک (بی‌مدل) ----------
     همان شرطِ قلابِ دستیار (AS.smallWin ِ a27): در سطحِ کنونی با k درست از n، احتمالِ درستیِ گامِ بعد (k+1)/(n+2) (T_next) کمتر از ½ ِ
     «نمی‌دانیم» (A4) و آخرین تلاش نادرست ⇒ پیش از گامِ بعد، یک گامِ آسان‌ترِ همان گام: «کدام نوع حرکت این‌جا به کار می‌آید؟» (پاسخ از
     برچسبِ حرکتِ گام، کلیددار؛ به موعدِ همان حرکت می‌رود) — یا برای گامِ بی‌برچسب، همان گام با یک گزینهٔ کمتر (مثلِ سرنخ: بار اول نادرست
     حساب می‌شود). نتیجه در eprog.solve.wins؛ حالِ تو (کنجکاوی، دلسردی، ترس از اشتباه) هم، و پیوندِ گره‌گشا اگر حالت ناخوش است. */
  var HELP = {};
  A.solveHelped = function (pid, lv, sid) { return !!HELP[pid + "|" + lv + "|" + sid]; };
  function odds(pid) { var AS = A.ASSIST; return AS && AS.levelOdds ? AS.levelOdds(pid) : null; }
  function winCard(p, pg, st, s0) {
    var od = odds(p.id); if (!od || !(od.p < 0.5) || od.last || od.lv !== st.lv) return null;
    var s = sol(pg); s.wins = s.wins || [];
    var done = s.wins.filter(function (w) { return w.lv === st.lv && w.sid === s0.id && w.kind !== "step"; })[0];
    var box = h("section", own({ class: "card soft sv-win" }), h("h4", {}, "🌱 یک موفقیتِ کوچک پیش از این گام"),
      h("p", { class: "small" }, "در این سطح " + fa(od.k) + " گام از " + fa(od.n) + " درست بود؛ احتمالِ درستیِ گامِ بعد (k+1)/(n+2) = " + fa(Math.round(100 * od.p)) + "٪ — کمتر از نیمه. پیش از گامِ اصلی، یک گامِ آسان‌ترِ همان: موفقیتِ واقعی، نه دلداری."));
    if (done) { box.appendChild(h("p", { class: "small sv-windone" }, done.ok ? "این موفقیت را گرفتی: " + (done.what || "") : "گامِ آسان‌تر هم نشد؛ «سطحِ آسان» یا «🪜 سرنخِ پله‌ای» را ببین.")); }
    else {
      var mvs = A.stageMoves ? A.stageMoves(p, s0) : [], fb = h("div", { class: "dfb" }), opts, right, q, kind;
      if (mvs.length && A.MOVES && A.MOVE_LIST) {
        kind = "move"; right = mvs[0];
        var others = A.MOVE_LIST.map(function (m) { return m.id; }).filter(function (id) { return mvs.indexOf(id) < 0; });
        var hsh = 0; String(s0.id + p.id).split("").forEach(function (c) { hsh = (hsh * 31 + c.charCodeAt(0)) >>> 0; });
        var dec = [others[hsh % others.length], others[(hsh + 7) % others.length]]; if (dec[0] === dec[1]) dec[1] = others[(hsh + 8) % others.length];
        opts = A.shuffle([right].concat(dec)).map(function (id) { return { id: id, t: A.MOVES[id].fa, ok: id === right }; });
        q = "در گامِ بعد («" + clip(s0.q, 120) + "») کدام نوع حرکت به کار می‌آید؟ (هنوز گزینهٔ خودِ گام را نمی‌خواهیم)";
      } else {
        kind = "fewer"; var good = (s0.opts || []).filter(function (o) { return o.ok; })[0], bad = (s0.opts || []).filter(function (o) { return !o.ok; })[0];
        if (!good || !bad) return null;
        opts = A.shuffle([good, bad]).map(function (o) { return { t: o.t, ok: !!o.ok }; });
        q = "همین گام با یک گزینهٔ کمتر: «" + clip(s0.q, 140) + "» (مثلِ سرنخ، بار اولِ گامِ اصلی را نادرست حساب می‌کند)";
      }
      var os = h("div", { class: "dopts sv-winopts" }, opts.map(function (o) {
        return h("button", { type: "button", class: "dopt", "data-ok": o.ok ? "1" : null, onclick: function (e) {
          if (os.getAttribute("data-done")) return; os.setAttribute("data-done", "1");
          Array.prototype.forEach.call(os.children, function (b) { b.disabled = true; }); e.currentTarget.classList.add(o.ok ? "right" : "wrong");
          var w = { at: nowISO(), lv: st.lv, sid: s0.id, kind: kind, ok: !!o.ok, odds: { k: od.k, n: od.n } };
          if (kind === "move") { w.mv = right; if (A.moveDrillAnswer) A.moveDrillAnswer(right, "win", !!o.ok); w.what = "حرکتِ «" + A.MOVES[right].fa + "» را خودت تشخیص دادی"; }
          else { HELP[p.id + "|" + st.lv + "|" + s0.id] = true; w.what = "یک گزینهٔ نادرست را کنار گذاشتی"; }
          s.wins.push(w); if (s.wins.length > 80) s.wins = s.wins.slice(-80); S.put(pg);
          fb.appendChild(h("p", { class: "small " + (o.ok ? "good" : "bad") }, o.ok ? "درست — این موفقیتِ توست. " + (kind === "move" && A.MOVES[right].ask ? "حالا همین پرسش را در گامِ اصلی از خودت بپرس: «" + A.MOVES[right].ask + "»" : "حالا گامِ اصلی را بزن.")
            : "نه" + (kind === "move" ? "؛ حرکتِ این گام «" + A.MOVES[right].fa + "» است. پرسشش: «" + (A.MOVES[right].ask || "") + "»" : "") + " — اشکالی ندارد؛ «سطحِ آسان» هم هست."));
        } }, o.t);
      }));
      box.appendChild(h("fieldset", { class: "sv-winq" }, h("legend", { class: "small" }, q), os, fb));
    }
    var links = h("div", { class: "row gap wrap small sv-winlinks" },
      h("button", { class: "linkish", type: "button", onclick: function () { A.simState = { pid: p.id, lv: 1, order: "e2h", i: 0 }; A.go("e_prob", p.id, "sim"); } }, "سطحِ آسان، از آسان‌ترین گام"), " · ",
      h("button", { class: "linkish", type: "button", onclick: function () { A.go("e_prob", p.id, "drills"); } }, "تمرین‌های هم‌خانواده"));
    box.appendChild(selF("svWinMood_" + st.lv, "حالت همین حالا؟ (فقط برای خودت؛ اراده با امید و ناامیدی بالا و پایین می‌رود)", ["کنجکاوم", "خوبم", "خسته‌ام", "دلسردم", "نگرانِ اشتباهم"], "", function (v) {
      s.moods = s.moods || []; s.moods.push({ at: nowISO(), lv: st.lv, sid: s0.id, v: v }); if (s.moods.length > 60) s.moods = s.moods.slice(-60); S.put(pg);
      var kn = links.querySelector(".sv-winknot"); if (kn) kn.remove();
      if (/دلسرد|نگران|خسته/.test(v) && A.V.kcases) links.appendChild(h("button", { class: "linkish sv-winknot", type: "button", onclick: function () { A.go("kcases"); } }, " · 🪢 اگر این حس جاهای دیگر هم هست: گره‌گشا (هیجان و انگیزه)"));
      /* R4: پس از گامِ نادرست با حالِ دلسرد/نگران/خسته — خواستن یک گزینهٔ حال نیست: کوچک‌ترین گامِ بعد، زمان‌دار، که برمی‌گردد و وارسی می‌شود */
      wslot.innerHTML = "";
      if (/دلسرد|نگران|خسته/.test(v)) { var hs = A.willHost("prob", p.id); if (hs) wslot.appendChild(A.willCard(hs, "mood:" + v, "پس از گامِ نادرست، " + v.replace(/م$/, "ی") + ". نه دلداری: چقدر می‌خواهی حلش کنی، چه کنجکاوت می‌کند، و کوچک‌ترین گامِ بعد (کی، چند دقیقه، بی‌وقفه) چیست؟ روزِ موعد برمی‌گردد.")); }
    }));
    box.appendChild(links);
    var wslot = h("div", { class: "sv-winwill" }); box.appendChild(wslot);
    return box;
  }
  A.solveWinCard = winCard;

  /* ---------- «ابزارهای حدس» (بی‌مدل؛ وارسی با کد: A.kguessCheck ِ a17) ----------
     تصمیمِ مالک (۲۰۲۶-۱۰-۱۵؛ «حدس‌ها و ایده‌ها و تصمیم‌ها را بیازما، تأیید نکن»): در لحظهٔ حدس (نخستین برخورد)، در بازنگری (تعمیم)، در
     «💡 جایگاهِ ایده» و در قابِ مسئلهٔ عملی همین تکه پیش می‌آید: حدس با قیاس (نتیجهٔ آشنای مشابه؛ ۱، ۲، ۳ ⇐ n)، جدولِ حالت‌ها که خودت
     می‌سازی ⇐ تفاضل‌های پیاپی (کد)، حدسِ دقیق (فرمولِ n؛ کد با هر حالت می‌سنجد)، حدس‌های رقیب هر کدام با آزمون (کد: کدام حالت جدایشان می‌کند)
     و «کدام شایستهٔ آزمودنِ نخست است — چرا؟». تمرینِ فاصله‌دارش سازنده‌های کدیِ «تفاضل‌های پیاپی»، «حدس‌های رقیب» و «حدس با قیاس» اند
     (a17، روی صفحهٔ حرکت‌ها و همین‌جا؛ پاسخ ⇐ موعدِ همان حرکت). */
  var KIT_N = 0;
  function LT(x) { return A.kltr ? A.kltr(x) : String(x); }   // عبارتِ ریاضی درونِ جملهٔ فارسی: جداسازِ چپ‌به‌راست (قاعدهٔ bidi)
  function ltrIn(div) { var el = div.querySelector("input,textarea"); if (el) el.setAttribute("dir", "auto"); return div; }
  function blankKit() { return { ana: "", anaGuess: "", anaTest: "", dim: "", rows: [{ x: "1", y: "" }, { x: "2", y: "" }, { x: "3", y: "" }], formula: "", rivals: [{ t: "", test: "" }, { t: "", test: "" }], worth: "", worthWhy: "" }; }
  A.solveBlankKit = blankKit;
  function kitEmpty(k) { if (!k) return true; return !txt(k.countHow) && !txt(k.ana) && !txt(k.anaGuess) && !txt(k.anaTest) && !txt(k.dim) && !txt(k.formula) && !(k.rows || []).some(function (r) { return txt(r.y); }) && !(k.rivals || []).some(function (r) { return txt(r.t) || txt(r.test); }); }
  A.solveKitEmpty = kitEmpty;
  function kitCopy(k) { return JSON.parse(JSON.stringify(k || {})); }
  function kitUI(kit, o) {
    o = o || {}; var P = o.parts || ["ana", "table", "formula", "rivals"], idp = (o.idp || "svK") + (++KIT_N) + "_";
    var det = h("details", own({ class: "card soft sv-kit", open: o.open ? true : null }), h("summary", {}, o.title || "ابزارهای حدس: قیاس، جدولِ حالت‌ها، بیانِ دقیق، حدس‌های رقیب"));
    if (o.intro) det.appendChild(h("p", { class: "small" }, o.intro));
    if (P.indexOf("ana") >= 0) {
      det.appendChild(h("h5", {}, "حدس با قیاس"));
      det.appendChild(field(idp + "ana", o.anaLabel || "نتیجه یا مسئلهٔ آشنای مشابه چیست (یک بُعد کمتر، شکلِ ساده‌تر، موردی که دیده‌ای)؟", kit.ana, function (v) { kit.ana = v; }, 0));
      det.appendChild(field(idp + "anag", "قیاس چه حدسی دربارهٔ این یکی می‌دهد — و کجا ممکن است بشکند؟", kit.anaGuess, function (v) { kit.anaGuess = v; }, 0));
      det.appendChild(field(idp + "anat", "با چه حالتِ خاص یا آزمونی می‌بینی که این انتقال درست است (یا می‌شکند)؟", kit.anaTest, function (v) { kit.anaTest = v; }, 0));
      if (!o.noDim) det.appendChild(field(idp + "dim", "استقرا با قیاس: اگر اندازه یا بُعد را ۱، ۲، ۳ … بگیری، الگو در n چه می‌گوید؟", kit.dim, function (v) { kit.dim = v; }, 0));
    }
    if (P.indexOf("table") >= 0) {
      det.appendChild(h("h5", {}, o.tableTitle || "جدولِ حالت‌ها (خودت بساز)"));
      det.appendChild(h("p", { class: "small muted" }, o.tableHint || "چند حالتِ خاص را خودت حساب کن یا بسنج و بنویس (x = اندازه یا شمارهٔ حالت، y = نتیجه). کد تفاضل‌های پیاپی را می‌سازد."));
      var tb = h("tbody", {});
      var drawRows = function () {
        tb.innerHTML = "";
        kit.rows.forEach(function (r, i) {
          tb.appendChild(h("tr", {}, h("td", {}, h("input", { type: "text", id: idp + "x" + i, class: "sv-kx", dir: "ltr", "aria-label": "حالتِ " + fa(i + 1) + ": x", value: r.x || "", oninput: function (e) { r.x = e.target.value; } })),
            h("td", {}, h("input", { type: "text", id: idp + "y" + i, class: "sv-ky", dir: "ltr", "aria-label": "حالتِ " + fa(i + 1) + ": نتیجه (y)", value: r.y || "", oninput: function (e) { r.y = e.target.value; } }))));
        });
      };
      drawRows();
      det.appendChild(h("table", { class: "sv-ktab small" }, h("thead", {}, h("tr", {}, h("th", {}, "x"), h("th", {}, "y"))), tb));
      det.appendChild(h("button", { class: "btn ghost sm sv-kaddrow", type: "button", onclick: function () { var last = kit.rows[kit.rows.length - 1], nx = A.knumOf && last ? A.knumOf(last.x) : null; kit.rows.push({ x: nx != null ? String(nx + 1) : "", y: "" }); drawRows(); } }, "+ حالتِ دیگر"));
      /* دورِ ۲ ِ تور (s24): جدولِ مسئلهٔ شمارشی وارسیِ درونی می‌خواهد — «همه را شمردی؟» (کد بی پاسخش «وارسی شد» نمی‌دهد) */
      if (o.counting || (A.kCountRe && A.kCountRe.test(String(o.problem || "")))) det.appendChild(field(idp + "cnt", "شمارش: در هر حالت همه را شمردی؟ چطور مطمئنی هیچ موردی جا نیفتاده و هیچ موردی دو بار شمرده نشده (فهرستِ منظم)؟", kit.countHow || "", function (v) { kit.countHow = v; }, 0));
    }
    if (P.indexOf("formula") >= 0) det.appendChild(ltrIn(field(idp + "f", "حدست را دقیق بنویس — به صورتِ فرمولِ n (مثلاً " + LT("n(n+1)/2") + " یا " + LT("2^n − 1") + "، یا رابطهٔ بازگشتی مثلِ " + LT("a(n) = a(n−1) + a(n−2)") + " که کد روی جدولِ خودت می‌سنجد؛ حرفِ فارسی مثلِ «ن» یا «ح» هم همان متغیر است، و کسر مثلِ " + LT("1000/27") + " در جدول خوانده می‌شود)", kit.formula, function (v) { kit.formula = v; }, 0, "فرمول بر حسبِ n")));
    if (P.indexOf("rivals") >= 0) {
      det.appendChild(h("h5", {}, o.rivTitle || "حدس‌های رقیب"));
      det.appendChild(h("p", { class: "small muted" }, o.rivHint || "دست‌کم دو حدس که هر دو با آنچه می‌دانی جور درمی‌آیند؛ برای هر کدام آزمونی که می‌تواند ردش کند. اگر حدس‌ها فرمول‌اند، کد حالتی را می‌یابد که جدایشان می‌کند."));
      var rv = h("div", { class: "col gap sv-krivals" });
      var drawRiv = function () {
        rv.innerHTML = "";
        kit.rivals.forEach(function (x, i) {
          rv.appendChild(h("div", { class: "row gap wrap sv-kriv" }, ltrIn(field(idp + "r" + i, "حدسِ " + fa(i + 1), x.t, function (v) { x.t = v; }, 0)), field(idp + "rt" + i, "آزمونی که می‌تواند حدسِ " + fa(i + 1) + " را رد کند", x.test, function (v) { x.test = v; }, 0)));
        });
      };
      drawRiv(); det.appendChild(rv);
      det.appendChild(h("button", { class: "btn ghost sm sv-kaddriv", type: "button", onclick: function () { kit.rivals.push({ t: "", test: "" }); drawRiv(); wsel(); } }, "+ حدسِ رقیبِ دیگر"));
      var wslot = h("div", { class: "row gap wrap" });
      var wsel = function () {
        wslot.innerHTML = "";
        wslot.appendChild(selF(idp + "w", "کدام حدس شایستهٔ آزمودنِ نخست است؟", kit.rivals.map(function (x, i) { return [String(i), "حدسِ " + fa(i + 1)]; }), kit.worth === "" || kit.worth == null ? "" : String(kit.worth), function (v) { kit.worth = v; }));
        wslot.appendChild(selF(idp + "ww", "چرا همان؟", (A.KWORTH_WHY || []).map(function (x) { return [x[0], x[1]]; }), kit.worthWhy, function (v) { kit.worthWhy = v; }));
      };
      wsel(); det.appendChild(wslot);
    }
    var out = h("div", { class: "small sv-kout", "aria-live": "polite" });
    det.appendChild(h("button", { class: "btn ghost sm sv-kchk", type: "button", onclick: function () {
      var r = A.kguessCheck ? A.kguessCheck(kit, { problem: o.problem || "" }) : null; out.innerHTML = ""; if (!r) return;
      kit.chk = { at: nowISO(), ok: r.ok, issues: r.issues.slice(), order: r.table ? r.table.order : null, fits: r.formula ? r.formula.fits : null, sep: r.rivals && r.rivals.sep ? r.rivals.sep : null, decided: r.rivals && r.rivals.decided || null };
      if (r.table && r.table.diffs) {
        out.appendChild(h("div", { class: "sv-kdiffs", dir: "ltr" }, r.table.diffs.slice(0, 6).map(function (row, k) { return h("div", {}, (k ? "Δ" + (k > 1 ? "^" + k : "") : "y") + ": " + row.map(function (v) { return fa(Math.round(v * 1000) / 1000); }).join("  ")); })));
        out.appendChild(h("p", { class: r.table.order >= 0 ? "good" : "" }, r.table.order >= 0 ? "تفاضل‌های مرتبهٔ " + fa(r.table.order) + " ثابت‌اند ⇒ حالتِ بعد (" + LT("x = " + r.table.nextX) + ") احتمالاً " + fa(Math.round(r.table.next * 1000) / 1000) + (r.table.thin ? " — ولی «ثابت» فقط با دو مقدار دیده شد؛ یک حالتِ دیگر بساز و بیازما." : ". این حدس است، نه برهان.")
          : "هیچ مرتبه‌ای از تفاضل‌ها ثابت نشد — یا حالت‌های بیشتری لازم است یا الگو چندجمله‌ای نیست (نسبت یا الگوی دیگری بجوی)."));
      }
      if (r.formula && r.formula.ok && !r.formula.rec) out.appendChild(h("p", { class: r.formula.fits ? "good" : "bad" }, r.formula.fits ? "فرمولت با هر " + fa(r.formula.tested) + " حالتِ جدول می‌خواند" + (r.formula.next != null ? "؛ در حالتِ بعد " + fa(Math.round(r.formula.next * 1000) / 1000) + " پیش‌بینی می‌کند — همان را بیازما." : ".") + " پشتیبانی شد، نه ثابت."
        : "فرمولت با این حالت‌ها نمی‌خواند: " + r.formula.mism.slice(0, 3).map(function (m) { return LT("x = " + m.x) + " ⇒ فرمول " + fa(Math.round(m.fx * 1000) / 1000) + "، جدول " + fa(m.y); }).join("؛ ") + " — حدس را اصلاح کن یا کنار بگذار."));
      if (r.rivals && r.rivals.sep) out.appendChild(h("p", { class: "sv-ksep" }, "حالتی که دو حدسِ نخست را جدا می‌کند و هنوز در جدولت نیست: " + LT("n = " + r.rivals.sep.n) + " (حدسِ ۱ ⇒ " + fa(r.rivals.sep.a) + "، حدسِ ۲ ⇒ " + fa(r.rivals.sep.b) + ") — آزمونِ شایسته همین است."));
      if (r.rivals && r.rivals.fit) out.appendChild(h("p", {}, r.rivals.fit.map(function (f, i) { return "حدسِ " + fa(i + 1) + (f === true ? " با جدول می‌خواند" : f === false ? " با جدول نمی‌خواند (رد شد)" : " فرمول نیست"); }).join("؛ ") + "."));
      r.issues.forEach(function (x) { out.appendChild(h("p", { class: "bad" }, x)); });
      r.notes.forEach(function (x) { out.appendChild(h("p", { class: "muted" }, x)); });
      if (r.ana && r.ana.ok) out.appendChild(h("p", { class: "muted sv-kana" }, "قیاس: نوشته شده، رونوشتِ خودِ مسئله نیست، انتقال و آزمونش گفته شده (کد درستیِ قیاس را نمی‌سنجد — آزمونش را خودت انجام بده)."));
      if (r.ok && !r.issues.length) out.appendChild(h("p", { class: "good sv-kok" }, "ابزارهای حدس وارسی شد."));
      else if (r.refuted && !r.issues.length) out.appendChild(h("p", { class: "warnline sv-krefuted" }, "حدس با جدولت نمی‌خواند (رد شد) — اصلاحش کن یا کنار بگذار؛ این وارسی تأییدِ حدس نیست."));
      if (o.onCheck) o.onCheck(r);
    } }, "بسنج (با کد)")); det.appendChild(out);
    if (o.drills !== false && A.moveGenDrill && A.KGEN) {
      var dd = h("details", { class: "small sv-kdrills" }, h("summary", {}, "تمرینِ فاصله‌دار: نمونهٔ تازهٔ ساختهٔ کد (تفاضل‌ها، حدس‌های رقیب، قیاس)"));
      dd.addEventListener("toggle", function () { if (dd.open && !dd.querySelector(".mv-gen")) [["mv_special", "diffs"], ["mv_special", "rivals"], ["mv_analogy", "analogy"]].forEach(function (x) { if (A.KGEN[x[1]]) { var g = A.moveGenDrill(x[0], x[1]); if (g) dd.appendChild(g); } }); });
      det.appendChild(dd);
    }
    return det;
  }
  A.solveKitUI = kitUI;

  /* ---------- «🌱 کوچک‌ترین گامِ بعد»: اراده و امید پس از شکست یا نقد (بی‌مدل) ----------
     تصمیمِ مالک (۲۰۲۶-۱۰-۱۵؛ «موافقم»): برای کسی که پس از نخستین نقد ایده را رها می‌کرد و ترسِ از دست دادنِ کار دارد، «خواستن» نه یک
     گزینهٔ حال، بلکه یک تعهدِ کوچکِ مشخص است که برمی‌گردد و وارسی می‌شود. هر جا شکست یا نقد پیش آمد (گامِ نادرست و حالِ دلسرد در شبیه‌ساز،
     «پیشرفت: نه» در ایستِ پیشرفت، نقد در «💡 جایگاهِ ایده»، گرهِ «هیجان و انگیزه» در گره‌گشا) صفحه می‌پرسد: چقدر می‌خواهی؟ امید داری؟ چه
     کنجکاوت می‌کند؟ کوچک‌ترین گامِ بعد چیست و کِی، چند دقیقه و بی‌وقفه؟ این کار برایت چقدر می‌ارزد (اراده متناسب با مسئله)؟ — و روزِ موعد
     (نردبانِ همیشگی: نخستین وارسی فردا؛ هر گامِ انجام‌شده ⇒ وارسیِ گامِ بعد یک پله دورتر؛ انجام‌نشده ⇒ گامِ کوچک‌تر و فردا) برمی‌گردد:
     انجامش دادی؟ چه دیدی؟ چه جلویت را گرفت؟ غرق شدی یا پراکنده؟ تلاش با ارزشش جور بود؟ خواستن و امید هر بار «داده»اند (دفترِ پیشرفت)،
     نه نمره. رها کردنِ آگاهانه هم مجاز است — با دلیل، و یک بار بعدتر می‌پرسد «هنوز همان دلیل را قبول داری؟». داده در خودِ رکوردِ میزبان:
     eprog.solve.will / idea.will / kcase.will (نوعِ رکوردِ تازه نیست؛ زمان‌بندِ موازی نیست — موعد در A.dueList ِ همین پرونده). */
  var WILL_DESIRE = [["want", "می‌خواهم — برایم مهم است"], ["some", "کمی"], ["unsure", "نمی‌دانم"], ["drop", "نه — می‌خواهم آگاهانه رهایش کنم"]];
  var WILL_HOPE = [["yes", "امید دارم که راهی هست"], ["unsure", "مطمئن نیستم"], ["no", "نه، ناامیدم"]];
  var WILL_BUDGET = [["one", "یک گامِ کوچک و بعد بازبینی"], ["week", "چند جلسهٔ کوتاه در هفته"], ["much", "هر چه لازم باشد — بسیار مهم است"], ["easy", "فقط اگر آسان پیش برود"]];
  var WILL_DONE = [["yes", "کامل انجامش دادم"], ["part", "تاحدی"], ["no", "نه"]];
  var WILL_BLOCK = [["fear", "ترس از اشتباه یا نقد"], ["time", "وقت نشد یا حواسم پرت شد"], ["big", "گام بزرگ بود"], ["nowant", "دیگر نمی‌خواهم"], ["other", "چیزِ دیگر"]];
  var WILL_IMM = [["deep", "غرق در کار شدم"], ["mid", "بین این دو"], ["scat", "حواسم پراکنده بود"], ["none", "شروع نکردم"]];
  var WILL_PROP = [["less", "کمتر از ارزشش وقت گذاشتم"], ["fit", "با ارزشش جور بود"], ["more", "بیش از ارزشش وقت گذاشتم"]];
  var WILL_DROPSRC = [["thing", "از خودِ مسئله/ایده — دلیلش را دیده‌ام و سنجیده‌ام"], ["crit", "از حسِ پس از نقد یا شکست"], ["tired", "از خستگی"]];
  A.WILL = { DESIRE: WILL_DESIRE, HOPE: WILL_HOPE, BUDGET: WILL_BUDGET, DONE: WILL_DONE, BLOCK: WILL_BLOCK, IMM: WILL_IMM, PROP: WILL_PROP, DROPSRC: WILL_DROPSRC };
  function lab(list, k) { var x = list.filter(function (y) { return y[0] === k; })[0]; return x ? x[1] : ""; }
  function willBox(box) { var w = box.will = box.will || {}; w.steps = w.steps || []; w.log = w.log || []; return willFix(w); }
  function willOpen(w) { var st = (w.steps || []).filter(function (x) { return !x.closed; }); return st[st.length - 1] || null; }
  function willLast(w) { var st = (w.steps || []).filter(function (x) { return x.closed; }); return st[st.length - 1] || null; }
  A.willOf = function (box) { return box && box.will ? box.will : null; };
  /* وارسیِ کدیِ گامِ تازه: مشخص (نه «بیشتر تلاش کنم»)، زمان‌دار، نه رونوشتِ خودِ هدف، و پس از گامِ انجام‌نشده، گامی دیگر (کوچک‌تر) */
  var VAGUE = /^(?:من\s*)?(?:بیشتر\s*|باز\s*|دوباره\s*)?(?:تلاش|سعی|فکر|کار|ادامه|تمرکز)\s*(?:کنم|می‌کنم|می کنم|بکنم|بدهم|می‌دهم|بدم|میکنم|میدم)?$/;
  A.willStepCheck = function (d, w, title) {
    var why = [];
    if (!d.desire) why.push("«چقدر می‌خواهی؟» را انتخاب کن");
    if (d.desire === "drop") {
      if (!txt(d.dropWhy)) why.push("دلیلِ رها کردن را بنویس");
      if (!d.dropSrc) why.push("بگو این دلیل از کجاست");
      return { ok: !why.length, why: why, drop: true };
    }
    if (!d.hope) why.push("«امید داری؟» را انتخاب کن");
    var st = txt(d.step), n = st.replace(/[\s‌«»"'.,،:؛!?؟()\-]+/g, "");
    if (!st) why.push("کوچک‌ترین گامِ بعد را بنویس");
    else if (VAGUE.test(st.replace(/\s+/g, " ")) || !A.willConcrete(st)) why.push("«" + st + "» گام نیست، آرزوست — یک کارِ مشخص بنویس (چه چیزی را، با چه کسی یا با چه ابزاری)");
    else if (title && n === String(title).replace(/[\s‌«»"'.,،:؛!?؟()\-]+/g, "")) why.push("این خودِ هدف است، نه گامِ بعد — کوچک‌ترش کن");
    var last = w && willLast(w), lc = last && last.checks && last.checks[last.checks.length - 1];
    if (st && lc && lc.done !== "yes" && n === String(last.step || "").replace(/[\s‌«»"'.,،:؛!?؟()\-]+/g, "")) why.push("همان گامِ انجام‌نشدهٔ قبلی است — کوچک‌ترش کن (نصفش، یا فقط نخستین دقیقه‌اش)");
    var wn = txt(d.when), W = wn ? A.willWhen(wn) : null;
    if (!wn) why.push("کِی، چند دقیقه و بی‌وقفه؟ را بنویس");
    else if (!W) why.push("«" + wn + "» زمان نیست — روز یا ساعتِ مشخص بنویس (مثلاً «فردا ساعتِ ۷»، «پنجشنبه صبح»، «۲۵ آبان»، «۳ روزِ دیگر»)");
    else if (W.past) why.push("«" + wn + "» گذشته است — زمانی از امروز به بعد بنویس");
    return { ok: !why.length, why: why, when: W };
  };
  /* گامِ «مشخص» (پاسخ به ممیزیِ ۲۰۲۶-۱۰-۱۵): پس از برداشتنِ نشانه‌گذاری، نیم‌فاصله، واژه‌های تلاش/نیت («سعی، تلاش، تمرکز، بیشتر،
     بهتر، جدی‌تر، باید، از فردا…»)، فعل‌های کمکی («می‌کنم، خواهم کرد، باشم…») و زمان («۲۰ دقیقه، فردا»)، دست‌کم یک چیزِ وارسی‌پذیر بماند:
     مفعول یا ابزارِ مشخص (فصل، کاغذ، جلسه، نام، عدد). کد معنا را نمی‌فهمد؛ فقط می‌گوید جمله جز نیت و تلاش چیزی ندارد. */
  var WILL_GENERIC = " تلاش سعی فکر کار کاری کارها کارم ادامه تمرکز درس درسم درسا بیشتر بهتر جدی جدیتر تر خیلی کمی یکم زیاد باز دوباره باید شاید من خودم همه همش چیز چیزی فردا امروز امشب هفته روز ماه بعد بعدا بعدش دیگر دیگه آینده از به با در را رو و که هم تا برای یه یک این آن اون قبل حالا الان فقط خوب خوبی مهم وقت وقتم حتما حتماً واقعا جدیت انشالله ";
  var WILL_LIGHT = " می نمی کنم بکنم نکنم کردم کرد کنیم خواهم خواهیم خواهد شوم بشوم شم بشم میشم میشه باشم باشه بود بدم بدهم دهم بدیم بخونم بخوانم بزنم برم بروم ";
  A.willConcrete = function (step) {
    var x = String(step == null ? "" : step).replace(/[۰-۹]/g, function (c) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(c); }).replace(/[ً-ْٔ]/g, "").replace(/ۀ/g, "ه").replace(/‌/g, " ")
      .replace(/\d+\s*(?:دقیقه|ساعت|روز|هفته|ماه|بار|min|minutes?|hours?)/gi, " ").replace(/[«»"'.,،:؛!?؟()\-…]+/g, " ").toLowerCase();
    return x.split(/\s+/).some(function (w) {
      if (!w) return false;
      if (/\d/.test(w)) return true;
      if (w.length < 2 || WILL_GENERIC.indexOf(" " + w + " ") >= 0 || WILL_LIGHT.indexOf(" " + w + " ") >= 0) return false;
      if (/^(?:دقیقه|ساعت|صبح|ظهر|عصر|شب|بعدازظهر)$/.test(w)) return false;
      if (/^[بن][ء-يپچژکگی]{2,}(?:م|یم)$/.test(w)) return false;   // فعلِ التزامی/منفی («بخونم»، «نکنم») چیزی را مشخص نمی‌کند
      return true;
    });
  };
  /* M3: «کِی؟» ِ خودِ کاربر ⇐ روزِ وارسی. ارقامِ فارسی/لاتین؛ «فردا/پس‌فردا/امروز/امشب»؛ «N روز/هفته/ماهِ دیگر» (N رقم یا واژه)؛ نامِ روزِ هفته؛
     تاریخِ شمسی «۲۵ آبان» (و «۲۵ آبان ۱۴۰۵»)، «۱۴۰۵/۰۸/۲۵»، میلادی «2026-11-16» یا «16 November» — تبدیلِ شمسی ⇐ میلادی با همان الگوریتمِ
     A.epiRevDate (a6). فقط ساعت/پاره‌ای از روز («ساعتِ ۷»، «صبح») ⇒ زمان هست ولی روز نه ({date: null}). هیچ‌کدام ⇒ null. */
  var JM = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
  var GM = [["january", "jan", "ژانویه"], ["february", "feb", "فوریه"], ["march", "mar", "مارس"], ["april", "apr", "آوریل"], ["may", "may", "مه"], ["june", "jun", "ژوئن"], ["july", "jul", "ژوئیه", "جولای"], ["august", "aug", "اوت", "آگوست"], ["september", "sep", "سپتامبر"], ["october", "oct", "اکتبر"], ["november", "nov", "نوامبر"], ["december", "dec", "دسامبر"]];
  var ORD = [["یکم", 1], ["اول", 1], ["دوم", 2], ["سوم", 3], ["چهارم", 4], ["پنجم", 5], ["ششم", 6], ["هفتم", 7], ["هشتم", 8], ["نهم", 9], ["دهم", 10], ["یازدهم", 11], ["دوازدهم", 12], ["سیزدهم", 13], ["چهاردهم", 14],
    ["پانزدهم", 15], ["پونزدهم", 15], ["شانزدهم", 16], ["هفدهم", 17], ["هجدهم", 18], ["هیجدهم", 18], ["نوزدهم", 19], ["بیستم", 20], ["سی ام", 30], ["سیام", 30]].sort(function (a, b) { return b[0].length - a[0].length; });
  var NUMW = { "یک": 1, "یه": 1, "دو": 2, "سه": 3, "چهار": 4, "پنج": 5, "شش": 6, "شیش": 6, "هفت": 7, "هشت": 8, "نه": 9, "ده": 10, "a": 1, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5 };
  var WD = [["یکشنبه", 0], ["دوشنبه", 1], ["سهشنبه", 2], ["چهارشنبه", 3], ["پنجشنبه", 4], ["جمعه", 5], ["شنبه", 6], ["sunday", 0], ["monday", 1], ["tuesday", 2], ["wednesday", 3], ["thursday", 4], ["friday", 5], ["saturday", 6]];
  function jal2g(jy, jm, jd) { return A.epiRevDate ? A.epiRevDate(jy + "-" + jm + "-" + jd) : null; }
  A.willJalali = jal2g;
  A.willWhen = function (when, base) {
    var today = base || A.today(), x = String(when == null ? "" : when).replace(/[۰-۹]/g, function (c) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(c); }).replace(/[٠-٩]/g, function (c) { return c.charCodeAt(0) - 0x660; })
      .replace(/[ً-ْٔ]/g, "").replace(/ۀ/g, "ه").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ").replace(/\s+/g, " ").toLowerCase().trim();
    if (!x) return null;
    /* «دهم آذر»، «بیست و یکم آبان»، «سی ام دی»: عددِ ترتیبیِ واژه‌ای پیش از نامِ ماهِ شمسی ⇒ رقم (بازبینیِ ۲۰۲۶-۱۰-۱۵) */
    x = x.replace(new RegExp("(?:(بیست|سی)\\s*و\\s*)?(" + ORD.map(function (o) { return o[0]; }).join("|") + ")\\s+(?=(?:" + JM.join("|") + "))", "g"), function (all, tens, w) {
      var n = ORD.filter(function (o) { return o[0] === w; })[0][1]; if (tens) { if (n > 9) return all; n += tens === "بیست" ? 20 : 30; } return n + " "; });
    var gy = +today.slice(0, 4), m, out = null;
    function res(d, src) { if (!d) return null; return { date: d, src: src, past: d < today }; }
    function upcoming(f) { for (var dy = -1; dy <= 2; dy++) { var d = f(dy); if (d && d >= today) return d; } return f(0); }
    if ((m = /(\d{4})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{1,2})/.exec(x)) && A.epiRevDate) out = res(A.epiRevDate(m[1] + "-" + m[2] + "-" + m[3]), "date");
    if (!out && (m = new RegExp("(\\d{1,2})\\s*(?:ام|م)?\\s*(" + JM.join("|") + ")(?:\\s*(?:ماه)?\\s*(\\d{4}))?(?![ء-يپچژکگی])").exec(x))) {
      var jd = +m[1], jm = JM.indexOf(m[2]) + 1, jy = m[3] ? +m[3] : null;
      if (jd >= 1 && jd <= (jm <= 6 ? 31 : 30)) out = res(jy ? jal2g(jy, jm, jd) : upcoming(function (dy) { return jal2g(gy - 621 + dy, jm, jd); }), "jalali");
    }
    if (!out) GM.some(function (g, i) {
      var re = new RegExp("(?:(\\d{1,2})\\s*(?:" + g.join("|") + ")|(?:" + g.join("|") + ")\\s*(\\d{1,2}))(?![a-zء-يپچژکگی])(?:\\s*,?\\s*(\\d{4}))?"), mm = re.exec(x);
      if (!mm) return false; var d = +(mm[1] || mm[2]); if (d < 1 || d > 31) return false;
      var mk = function (y) { var dt = new Date(y, i, d); return dt.getMonth() === i ? y + "-" + A.pad(i + 1) + "-" + A.pad(d) : null; };
      out = res(mm[3] ? mk(+mm[3]) : upcoming(function (dy) { return mk(gy + dy); }), "date"); return !!out;
    });
    if (!out && /پس ?فردا(?![ء-يپچژکگی])|day after tomorrow/.test(x)) out = res(A.addDays(today, 2), "rel");
    if (!out && /(?:^|[^ء-يپچژکگی])فردا(?![ء-يپچژکگی])|tomorrow/.test(x)) out = res(A.addDays(today, 1), "rel");   // «فرداها» زمان نیست
    if (!out && /آخر\s*هفته|weekend/.test(x)) { var pw = today.split("-"), dw = new Date(+pw[0], +pw[1] - 1, +pw[2]).getDay(); out = res(A.addDays(today, (5 - dw + 7) % 7), "rel"); }   // آخرِ هفتهٔ ایرانی = جمعهٔ پیشِ رو
    if (!out && (m = /(?:^|\s)(\d+|یک|یه|دو|سه|چهار|پنج|شش|شیش|هفت|هشت|نه|ده|a|one|two|three|four|five)\s*(روز|هفته|ماه|days?|weeks?|months?)(?![ء-يپچژکگی])\s*(پیش|قبل|ago)?/.exec(x))) {
      var nn = /\d/.test(m[1]) ? +m[1] : NUMW[m[1]], u = /روز|day/.test(m[2]) ? 1 : /هفته|week/.test(m[2]) ? 7 : 30;
      if (nn) out = res(A.addDays(today, (m[3] ? -1 : 1) * nn * u), "rel");   // «۲ روز پیش» ⇒ گذشته
    }
    if (!out && /(?:هفته|week)\s*(?:ی|ِ)?\s*(?:بعد|دیگر|دیگه|آینده)|next week/.test(x)) out = res(A.addDays(today, 7), "rel");
    if (!out && /(?:ماه)\s*(?:ی|ِ)?\s*(?:بعد|دیگر|دیگه|آینده)|next month/.test(x)) out = res(A.addDays(today, 30), "rel");
    if (!out && /امروز|امشب|همین حالا|همین الان|الان|today|tonight|now/.test(x)) out = res(today, "rel");
    if (!out) { var xs = x.replace(/ /g, ""); WD.some(function (wd) { var at = xs.indexOf(wd[0]); if (at < 0) return false; if (wd[0] === "شنبه" && at > 0 && /[یکدوسهچارپنج]$/.test(xs.slice(0, at))) return false;
      var p = today.split("-"), dow = new Date(+p[0], +p[1] - 1, +p[2]).getDay(), add = (wd[1] - dow + 7) % 7 || 7; out = res(A.addDays(today, add), "weekday"); return true; }); }
    if (out) return out;
    if (/ساعت\s*\d|\d{1,2}\s*[:٫]\s*\d{2}|\d{1,2}\s*(?:am|pm)|صبح|ظهر|عصر|شب|بعد ?از ?ظهر|morning|evening|noon/.test(x)) return { date: null, src: "time", past: false };
    return null;
  };
  /* روزِ وارسی: روزِ خودِ کاربر (نه زودتر از فردا — گامِ امروز فردا وارسی می‌شود)؛ بی روز ⇒ پلهٔ نردبان (نخستین بار فردا) */
  function willDueOf(W, iv, base) { var t = base || A.today(), tm = A.addDays(t, 1); if (W && W.date && !W.past) return { due: W.date > tm ? W.date : tm, from: "when" }; return { due: A.addDays(t, iv), from: "ladder" }; }
  A.willDueOf = willDueOf;
  /* رکوردهای پیشین (پیش از M3) که روزِ کاربر را نادیده گرفته بودند: یک بار، فقط اگر «dueFrom» خالی است، از همان «کِی» و روزِ ثبت دوباره
     ساخته می‌شوند (fill-empty)؛ «کِی» ِ ناخوانا ⇒ همان موعدِ پیشین می‌ماند. */
  function willFix(w) {
    (w && w.steps || []).forEach(function (x) {
      if (!x || x.closed || x.dueFrom) return;
      var base = A.localDay ? A.localDay(x.at) : String(x.at || "").slice(0, 10), W = base && A.willWhen(x.when, base);
      if (W && W.date && !W.past) { var dd = willDueOf(W, x.iv || LADDER[0], base); x.due = dd.due; x.dueFrom = "when"; } else x.dueFrom = "ladder";
    });
    return w;
  }
  A.willFix = willFix;
  function willIv(w) { var last = willLast(w), lc = last && last.checks && last.checks[last.checks.length - 1]; return lc && lc.done === "yes" ? nextIv(last.iv || LADDER[0], true) : LADDER[0]; }
  A.willNextIv = willIv;
  var WILL_N = 0;
  function willForm(host, trig, after) {
    var w = willBox(host.box), uid = "wl" + (++WILL_N) + "_", d = { desire: "", hope: "", curious: "", step: "", when: "", budget: "", dropWhy: "", dropSrc: "" };
    var f = h("div", { class: "col gap sv-willf" });
    var iv = willIv(w);
    f.appendChild(selF(uid + "des", "چقدر می‌خواهی این را پیش ببری؟", WILL_DESIRE, "", function (v) { d.desire = v; drop.classList.toggle("hidden", v !== "drop"); go.classList.toggle("hidden", v === "drop"); }));
    var go = h("div", { class: "col gap" });
    go.appendChild(selF(uid + "hope", "امید داری که راهی هست؟", WILL_HOPE, "", function (v) { d.hope = v; }));
    go.appendChild(field(uid + "cur", "چه چیزی در آن کنجکاوت می‌کند (یا روزی کنجکاوت کرد)؟", "", function (v) { d.curious = v; }, 0));
    go.appendChild(field(uid + "step", "کوچک‌ترین گامِ بعد — آن‌قدر کوچک که مطمئنی انجامش می‌دهی (یک کارِ مشخص)", "", function (v) { d.step = v; }, 0, "مثلاً «فردا ۲۰ دقیقه: دو نفر را پیدا کنم که این مشکل را دارند و یک پرسش از هر کدام بپرسم»"));
    go.appendChild(field(uid + "when", "کِی، چند دقیقه، بی‌وقفه؟ (زمانِ متمرکز)", "", function (v) { d.when = v; }, 0, "مثلاً «پنجشنبه ساعتِ ۷ صبح، ۲۰ دقیقه، گوشی دور»"));
    go.appendChild(selF(uid + "bud", "این کار برایت چقدر می‌ارزد — چقدر وقت و تلاش برایش کنار می‌گذاری؟", WILL_BUDGET, "", function (v) { d.budget = v; }));
    var drop = h("div", { class: "col gap hidden sv-willdrop" });
    drop.appendChild(field(uid + "dw", "چرا رهایش می‌کنی؟ (دلیلِ خودِ مسئله یا ایده)", "", function (v) { d.dropWhy = v; }, 0));
    drop.appendChild(selF(uid + "ds", "این دلیل از کجاست؟", WILL_DROPSRC, "", function (v) { d.dropSrc = v; }));
    f.appendChild(go); f.appendChild(drop);
    var out = h("div", { class: "small", "aria-live": "polite" });
    f.appendChild(h("button", { class: "btn sm sv-willsave", type: "button", onclick: function (e) {
      var c = A.willStepCheck(d, w, host.title); out.innerHTML = "";
      if (!c.ok) { out.appendChild(h("p", { class: "bad" }, "هنوز نه: " + c.why.join("؛ ") + ".")); return; }
      e.currentTarget.disabled = true;
      var at = nowISO();
      w.log.push({ at: at, kind: "commit", trig: trig || "", desire: d.desire, hope: d.hope || "", budget: d.budget || "" });
      w.reask = null;   // تصمیمِ تازه (گام یا رها کردن) ⇒ بازپرسیِ معلق بسته شد
      if (c.drop) {
        var riv = nextIv(LADDER[0], true);
        w.drop = { at: at, why: txt(d.dropWhy), src: d.dropSrc, trig: trig || "", due: A.addDays(A.today(), riv), iv: riv };
        host.put();
        out.appendChild(h("p", { class: d.dropSrc === "thing" ? "good" : "warnline" }, d.dropSrc === "thing" ? "رها کردنِ آگاهانه ثبت شد؛ " + A.fdate(w.drop.due) + " یک بار می‌پرسد که هنوز همان دلیل را قبول داری یا نه."
          : "ثبت شد — ولی دلیلی که از حسِ پس از نقد یا خستگی می‌آید، دلیلِ خودِ ایده نیست. پیش از رها کردن، نقد را بیازما: کدام فرض را می‌زند و کوچک‌ترین آزمونش چیست؟ " + A.fdate(w.drop.due) + " دوباره می‌پرسد."));
        if (d.dropSrc !== "thing") out.appendChild(f7Link());
        if (after) after(); return;
      }
      w.drop = null;
      var dd = willDueOf(c.when, iv);   // M3: روزِ خودِ کاربر اگر خوانا است؛ وگرنه پلهٔ نردبان — و همین را می‌گوید
      var stp = { id: "ws" + w.steps.length, at: at, trig: trig || "", step: txt(d.step), when: txt(d.when), desire: d.desire, hope: d.hope, curious: txt(d.curious), budget: d.budget, iv: iv, due: dd.due, dueFrom: dd.from, checks: [] };
      /* ممیزیِ ۲۰۲۶-۱۰-۱۵ (A4): گام ثبت می‌کند چه چیزی را می‌آزماید (مثلاً کدام نقد و کدام فرضِ ایده — میزبان می‌دهد) */
      if (host.tests) stp.tests = JSON.parse(JSON.stringify(host.tests));
      w.steps.push(stp); if (w.steps.length > 60) w.steps = w.steps.slice(-60); host.put();
      var left = A.daysBetween(A.today(), stp.due);
      out.appendChild(h("p", { class: "good sv-willok" }, "ثبت شد. " + (dd.from === "when" ? "وارسی: " + A.fdate(stp.due) + " (" + fa(left) + " روزِ دیگر — از همان «کِی» که نوشتی" + (c.when && c.when.date && c.when.date < stp.due ? "؛ گامِ امروز فردا وارسی می‌شود" : "") + ")"
        : "از «کِی» ِ تو روزی خوانده نشد؛ وارسی " + A.fdate(stp.due) + " (" + fa(left) + " روزِ دیگر، پلهٔ نردبان)") + " همین‌جا و در «امروز» برمی‌گردد و می‌پرسد انجامش دادی یا نه."));
      if (d.hope === "no" || d.desire === "unsure") out.appendChild(f7Link());
      if (after) after();
    } }, "ثبتِ گامِ کوچک")); f.appendChild(out);
    return f;
  }
  function f7Link() {
    return A.V.kcases ? h("p", { class: "small sv-willf7" }, h("button", { class: "linkish", type: "button", onclick: function () { A.go("kcases"); } }, "🪢 اگر ترس، ناامیدی یا رها کردن تکرار می‌شود: گره‌گشا — خانوادهٔ «هیجان و انگیزه»")) : null;
  }
  function willCheckCard(host, stp, after) {
    var w = willBox(host.box), uid = "wc" + (++WILL_N) + "_", d = { done: "", what: "", block: "", imm: "", prop: "", desire: "", hope: "" };
    var box = h("section", own({ class: "card sv-willchk", role: "group", "aria-label": "وارسیِ گامِ کوچک" }), h("h4", {}, "🌱 گامِ کوچکی که قول دادی"),
      h("p", { class: "small" }, "«" + stp.step + "» — " + stp.when + " (ثبت: " + A.fdate(String(stp.at).slice(0, 10)) + ")"));
    box.appendChild(selF(uid + "done", "انجامش دادی؟", WILL_DONE, "", function (v) { d.done = v; blk.classList.toggle("hidden", v === "yes" || !v); }));
    box.appendChild(field(uid + "what", "چه کردی و چه دیدی؟ (حتی «هیچ»)", "", function (v) { d.what = v; }, 0));
    var blk = h("div", { class: "hidden" }, selF(uid + "blk", "چه چیزی جلویت را گرفت؟", WILL_BLOCK, "", function (v) { d.block = v; }));
    box.appendChild(blk);
    box.appendChild(selF(uid + "imm", "در آن زمان غرق در کار بودی یا پراکنده؟", WILL_IMM, "", function (v) { d.imm = v; }));
    box.appendChild(selF(uid + "prop", "تلاشت با ارزشِ این کار جور بود؟", WILL_PROP, "", function (v) { d.prop = v; }));
    box.appendChild(selF(uid + "des", "حالا چقدر می‌خواهی پیش ببری‌اش؟", WILL_DESIRE.slice(0, 3), "", function (v) { d.desire = v; }));
    box.appendChild(selF(uid + "hope", "حالا امید داری؟", WILL_HOPE, "", function (v) { d.hope = v; }));
    var out = h("div", { class: "col gap", "aria-live": "polite" });
    box.appendChild(h("button", { class: "btn sm sv-willchkgo", type: "button", onclick: function (e) {
      var miss = []; if (!d.done) miss.push("«انجامش دادی؟»"); if (d.done && d.done !== "yes" && !d.block) miss.push("«چه جلویت را گرفت؟»"); if (!d.imm) miss.push("«غرق یا پراکنده؟»");
      if (miss.length) { A.toast("اول این‌ها را بگو: " + miss.join("، "), "bad"); return; }
      e.currentTarget.disabled = true;
      var c = { at: nowISO(), done: d.done, what: txt(d.what), block: d.block, imm: d.imm, prop: d.prop, desire: d.desire, hope: d.hope };
      stp.checks.push(c); stp.closed = true;
      /* ممیزیِ ۲۰۲۶-۱۰-۱۵ (A4): «نه» یا «ترس» و گامِ تازه‌ای ثبت نشد ⇒ بی‌صدا تمام نمی‌شود: همان نردبانِ رها کردن (پلهٔ بعد از فردا) یک بار دوباره می‌پرسد */
      if (d.done === "no" || d.block === "fear") { var riv2 = nextIv(LADDER[0], true); w.reask = { at: c.at, step: stp.id, block: d.block || "", iv: riv2, due: A.addDays(A.today(), riv2) }; }
      w.log.push({ at: c.at, kind: "check", step: stp.id, done: d.done, block: d.block || "", imm: d.imm, prop: d.prop || "", desire: d.desire || "", hope: d.hope || "" });
      host.put();
      out.appendChild(h("p", { class: d.done === "yes" ? "good" : "" }, d.done === "yes" ? "انجام شد — پیشرفتِ واقعی، کوچک ولی ثبت‌شده. گامِ کوچکِ بعد؟ (وارسی‌اش یک پله دورتر روی نردبان: " + fa(willIv(w)) + " روز)"
        : "اشکالی ندارد؛ داده است، نه شکست. گام را کوچک‌تر کن — نصفش، یا فقط نخستین دقیقه‌اش — و فردا دوباره."));
      if (d.block === "fear") out.appendChild(h("p", { class: "small" }, "ترس از اشتباه یا نقد: نقد را رها نکن و کورکورانه هم نپذیر — بپرس کدام فرض را می‌زند و کوچک‌ترین آزمونش چیست."));
      if (d.block === "fear" || d.hope === "no") out.appendChild(f7Link());
      if (d.prop === "more") out.appendChild(h("p", { class: "small muted" }, "بیش از ارزشش وقت گذاشتی: اراده باید با اندازهٔ مسئله جور باشد — گامِ بعد را کوتاه‌تر بگیر یا بپرس ارزشش را دوباره بسنجی."));
      out.appendChild(willForm(host, "check:" + d.done, after));
    } }, "ثبتِ وارسی"));
    box.appendChild(out);
    return box;
  }
  function willDropCard(host, after) {
    var w = willBox(host.box), dr = w.drop, uid = "wd" + (++WILL_N) + "_", d = { keep: "" };
    var box = h("section", own({ class: "card soft sv-willdropchk" }), h("h4", {}, "🌱 چیزی که آگاهانه رها کردی"),
      h("p", { class: "small" }, "روزِ " + A.fdate(String(dr.at).slice(0, 10)) + " نوشتی: «" + dr.why + "» (" + lab(WILL_DROPSRC, dr.src) + ")."));
    box.appendChild(selF(uid + "k", "هنوز همان دلیل را قبول داری؟", [["keep", "بله — رها می‌ماند"], ["back", "نه — دوباره پیش می‌برمش"]], "", function (v) { d.keep = v; }));
    var out = h("div", { class: "col gap" });
    box.appendChild(h("button", { class: "btn sm sv-willdropgo", type: "button", onclick: function (e) {
      if (!d.keep) { A.toast("اول بگو.", "bad"); return; }
      e.currentTarget.disabled = true; dr.rechecked = nowISO(); dr.keep = d.keep;
      w.log.push({ at: dr.rechecked, kind: "drop-recheck", keep: d.keep });
      if (d.keep === "keep") { dr.closed = true; host.put(); out.appendChild(h("p", { class: "small good" }, "رها کردنِ آگاهانه — با دلیل، نه از ترس. ثبت شد.")); }
      else { w.drop = null; host.put(); out.appendChild(willForm(host, "drop-back", after)); }
    } }, "ثبت"));
    box.appendChild(out);
    return box;
  }
  /* کارتِ کامل برای یک میزبان: وارسیِ موعد، یا گامِ جاری، یا فرمِ گامِ تازه؛ و دفترِ پیشرفت */
  A.willCard = function (host, trig, intro) {
    var w = willBox(host.box), t = A.today(), open = willOpen(w);
    var box = h("section", own({ class: "card sv-will", "data-host": host.kind }), h("h3", {}, "🌱 کوچک‌ترین گامِ بعد"),
      h("p", { class: "small" }, intro || "پس از شکست یا نقد، نه رها کن نه وانمود کن چیزی نشده: کوچک‌ترین گامِ مشخص را بنویس؛ روزِ موعد برمی‌گردد و می‌پرسد."));
    function redraw() { var nb = A.willCard(host, trig, intro); if (box.parentNode) box.replaceWith(nb); }
    if (w.drop && !w.drop.closed && w.drop.due && w.drop.due <= t) box.appendChild(willDropCard(host, redraw));
    else if (w.drop && !w.drop.closed) box.appendChild(h("p", { class: "small muted" }, "آگاهانه رهایش کردی؛ " + A.fdate(w.drop.due) + " یک بار دیگر می‌پرسد."));
    else if (open && open.due <= t) box.appendChild(willCheckCard(host, open, null));
    else if (open) box.appendChild(h("p", { class: "small sv-willcur" }, "گامِ جاری: «" + open.step + "» — زمانِ تو: «" + open.when + "» · " + (open.dueFrom === "when" ? "همان روز" : "روزی در آن نیست؛") + " وارسی: " + A.fdate(open.due)));   // یک تاریخ (M3)
    else {
      if (w.reask && w.reask.due && w.reask.due <= t) box.appendChild(h("p", { class: "small sv-willreask" }, "دفعهٔ پیش گفتی گام انجام نشد" + (w.reask.block === "fear" ? " (ترس از اشتباه یا نقد)" : "") + " و گامِ تازه‌ای ننوشتی. دوباره می‌پرسم — نه برای سرزنش: کوچک‌ترین گامِ بعد چیست؟ یا آگاهانه رهایش کن."));
      box.appendChild(willForm(host, trig, null));
    }
    var lg = A.willLog(w); if (lg) box.appendChild(lg);
    return box;
  };
  /* دفترِ پیشرفت: هر گام و وارسی‌اش، و خواستن/امید/غرق‌شدن به‌صورتِ داده (بی نمره) */
  A.willLog = function (w) {
    var st = (w && w.steps) || []; if (!st.length && !(w && w.drop)) return null;
    return h("details", { class: "small sv-willlog" }, h("summary", {}, "دفترِ پیشرفت (" + fa(st.length) + " گام)"),
      h("ol", {}, st.map(function (x) {
        var c = (x.checks || [])[x.checks.length - 1];
        return h("li", {}, "«" + x.step + "» — " + A.fdate(String(x.at).slice(0, 10)) + (x.tests ? " · می‌آزماید: " + (x.tests.t ? "نقدِ «" + clip(x.tests.t, 50) + "»" + (x.tests.target ? " ⇐ " : "") : "") + (x.tests.target ? "فرضِ «" + clip(x.tests.target, 50) + "»" : "") : "") + " · خواستن: " + lab(WILL_DESIRE, x.desire) + " · امید: " + lab(WILL_HOPE, x.hope) +
          (c ? " ⇒ " + lab(WILL_DONE, c.done) + (c.block ? " (" + lab(WILL_BLOCK, c.block) + ")" : "") + " · " + lab(WILL_IMM, c.imm) + (c.hope ? " · امیدِ پس از آن: " + lab(WILL_HOPE, c.hope) : "") : " ⇒ وارسی: " + A.fdate(x.due)));
      })));
  };
  /* میزبان‌ها: مسئله (eprog.solve)، ایده (رکوردِ idea)، گره‌گشا (رکوردِ kcase) */
  A.willHost = function (kind, id) {
    if (kind === "prob") { var p = A.getProb ? A.getProb(id) : null; if (!p) return null; var pg = prog(id), s = sol(pg); return { kind: kind, id: id, title: p.title, box: s, put: function () { S.put(pg); }, go: function () { A.go("e_prob", id, "sim"); } }; }
    var r = S.get(id); if (!r) return null;
    if (kind === "idea" && r.type === "idea") return { kind: kind, id: id, title: r.title, box: r, put: function () { S.put(r); }, go: function () { A.go("idea", id); } };
    if (kind === "knot" && r.type === "kcase") return { kind: kind, id: id, title: r.title, box: r, put: function () { S.put(r); }, go: function () { A.go("kcase", id, "s4"); } };
    return null;
  };
  A.willDue = function () {
    var t = A.today(), out = [];
    function scan(kind, id, w) {
      if (!w) return; willFix(w); var o = willOpen(w);
      if (o && o.due && o.due <= t) out.push({ kind: kind, id: id, what: "step", txt: o.step });
      if (w.drop && !w.drop.closed && w.drop.due && w.drop.due <= t) out.push({ kind: kind, id: id, what: "drop", txt: w.drop.why });
      if (!o && !(w.drop && !w.drop.closed) && w.reask && w.reask.due && w.reask.due <= t) out.push({ kind: kind, id: id, what: "reask", txt: "" });
    }
    S.all("eprog", function (r) { return r && r.solve && r.solve.will; }).forEach(function (r) { scan("prob", String(r.id).replace(/^eprog_/, ""), r.solve.will); });
    S.all("idea", function (r) { return r && r.will; }).forEach(function (r) { scan("idea", r.id, r.will); });
    S.all("kcase", function (r) { return r && r.will; }).forEach(function (r) { scan("knot", r.id, r.will); });
    return out;
  };
  if (typeof A.dueList === "function" && !A.dueList._will) {
    var rawDueW = A.dueList;
    A.dueList = function () {
      var items = rawDueW.apply(this, arguments) || [];
      try {
        /* M4: همهٔ گام‌های 🌱 ِ موعد یک سطر (مثلِ «n مرورِ حلِ مسئله»)؛ یکی ⇒ همان سطرِ پیشین (با «دوباره می‌پرسم» ِ A4) */
        var WD0 = A.willDue().map(function (x) { return { x: x, hs: A.willHost(x.kind, x.id) }; }).filter(function (o) { return o.hs; });
        var wTxt = function (x) { return x.what === "drop" ? "🌱 چیزی که آگاهانه رها کردی: هنوز همان دلیل؟" : x.what === "reask" ? "🌱 گامی که انجام نشد: کوچک‌ترین گامِ بعد؟ (دوباره می‌پرسم)" : "🌱 گامِ کوچکی که قول دادی: «" + clip(x.txt, 80) + "»"; };
        var wSub = function (x) { return x.what === "drop" ? "یک بار دیگر بسنج" : x.what === "reask" ? "گامِ کوچک‌تر، یا رها کردنِ آگاهانه" : "انجامش دادی؟ چه دیدی؟"; };
        if (WD0.length === 1) { var o1 = WD0[0]; items.push({ k: "knot", will: 1, txt: wTxt(o1.x), sub: "«" + clip(o1.hs.title, 60) + "» — " + wSub(o1.x), go: o1.hs.go }); }
        else if (WD0.length > 1) items.push({ k: "knot", will: WD0.length, txt: "🌱 " + fa(WD0.length) + " گامِ کوچک موعدِ وارسی است", sub: WD0.slice(0, 3).map(function (o) { return "«" + clip(o.hs.title, 40) + "»: " + (o.x.what === "drop" ? "رها کردی — هنوز همان دلیل؟" : o.x.what === "reask" ? "گامِ تازه؟" : clip(o.x.txt, 50)); }).join(" · ") + (WD0.length > 3 ? " · …" : ""), go: WD0[0].hs.go });
      } catch (e) { console.warn(e); }
      return items;
    };
    A.dueList._will = true;
  }
  /* قلابِ دستیار (پرامپتِ سامانه دست نمی‌خورد؛ فقط وقتی حرف از شکست/نقد/رها کردن است) */
  if (A.ASSIST) {
    var WILL_RULES = "# پس از شکست، نقد یا میلِ رها کردن («🌱 کوچک‌ترین گامِ بعد»)\n- تعارف و دلداری نکن؛ نقد را کورکورانه نپذیر و ایده را هم رها نکن: بپرس نقد کدام فرض را می‌زند و کوچک‌ترین آزمونش چیست. کارتِ «🌱 کوچک‌ترین گامِ بعد» (💡 جایگاهِ ایده، گره‌گشای «هیجان و انگیزه»، شبیه‌ساز) گامِ مشخص و زمان‌دار را ثبت و روزِ موعد وارسی می‌کند — به قلمِ خودِ کاربر است (data-own)؛ پرش نکن، فقط او را به آن ببر. خواستن، امید و غرق‌شدن داده‌اند، نه نمره.\n- حدس یا تصمیم را با «حدس‌های رقیب» بسنج (هر کدام با آزمونی که می‌تواند ردش کند؛ کدام اول — نه آن‌که دوستش دارد).";
    A.ASSIST.promptHooks = A.ASSIST.promptHooks || [];
    A.ASSIST.promptHooks.push(function (s, msg) { var recent = [String(msg || "")].concat(((s && s.msgs) || []).filter(function (m) { return m.role === "user"; }).slice(-6).map(function (m) { return m.text; })).join(" ");
      return A.willHookOn(recent) ? WILL_RULES : ""; });
    /* L2: «نقد» و «ترس» فقط به‌صورتِ واژه (نقدم، نقدها، ترسیدم، می‌ترسم)، نه «ترسیم» (کشیدن) یا «نقدی» (پول) */
    A.willHookOn = function (t) { t = String(t || "");
      return /ناامید|دلسرد|رها ?کرد|رهاش|ول ?کرد|بی‌خیال|انتقاد|ایراد گرفت|شکست|اخراج|از دست دادنِ? ?کار/.test(t) ||
        /(?:^|[^ء-يپچژکگی])(?:نقد(?:ها|های|هایی|م|ش|ت|و|ِ)?|(?:می‌?\s?|ن)?ترس(?:م|ی|ه|ت|ش|ند|ید|یدم|یدی|یده|ناک|و|ِ)?)(?![ء-يپچژکگی])/.test(t); };
  }

  /* ---------- قلاب‌های شبیه‌ساز (a8_prob.js صدا می‌زند) ---------- */
  /* بالای شبیه‌ساز: مرورِ موعد، برگشتِ کنارگذاشته، و پیش از گامِ ۱ کارتِ فهم. شبیه‌ساز بسته نمی‌شود؛ اگر بی کارت جلو بروی «ناتمام» ثبت می‌شود. */
  A.solvePre = function (p, st, pg, idx) {
    var s = sol(pg), col = h("div", { class: "col gap sv-pre" }), t = A.today();
    if (cpTimer) { clearTimeout(cpTimer); cpTimer = null; }
    if (s.aside && s.aside.due && s.aside.due <= t) { col.appendChild(backCard(p, pg)); return col; }
    try { var wl = s.will, wo = wl && willOpen(wl); if (wl && ((wo && wo.due <= t) || (wl.drop && !wl.drop.closed && wl.drop.due <= t))) { var hs = A.willHost("prob", p.id); if (hs) col.appendChild(A.willCard(hs, "due")); } } catch (e) { console.warn(e); }
    var rv = reviewPanel(p, pg); if (rv) col.appendChild(rv);
    if (st.i >= idx.length) return col.children.length ? col : null;
    var u = s.u[st.lv];
    if (st.i === 0 && (!u || !u.done)) col.appendChild(uCard(p, pg, st.lv));
    else if (st.i > 0 && !u && !st.focus) { s.u[st.lv] = { skipped: true, at: nowISO() }; S.put(pg); }
    try { var si = idx[st.i], s0 = p.stages[si]; if (s0 && !((pg.lv[st.lv] || {})[s0.id])) { var wc = winCard(p, pg, st, s0); if (wc) col.appendChild(wc); } } catch (e) { console.warn(e); }
    return col.children.length ? col : null;
  };
  /* درونِ کارتِ گام: خلاصهٔ فهم، پرسش‌های نوع، وارسیِ گام‌ها زیرِ «حرکتِ تو»، و ایستِ پیشرفت */
  A.solveStep = function (p, st, pg, s0, card, area, ta) {
    var s = sol(pg), sum = uSummary(p, pg, st.lv);
    if (sum) card.insertBefore(sum, card.children[1] || null);
    if (st.i === 0 && !(s.u[st.lv] && s.u[st.lv].done)) card.insertBefore(h("p", { class: "small warnline sv-uhint" }, "اول کارتِ «مسئله را بفهم» را بالا بنویس؛ اگر بی آن جلو بروی، فردا در «امروز» برمی‌گردد."), card.children[1] || null);
    try { var ak = askCard(p, pg, st, s0); if (ak) card.insertBefore(ak, area); } catch (e) { console.warn(e); }
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
    var col = h("div", { class: "col gap sv-revx" });
    if (!ms.length && why) col.appendChild(h("div", { class: "row gap wrap sv-lbchip" }, h("span", { class: "chip" }, "🔁 گامِ بازنگری"), h("span", { class: "small muted" }, "این گام وارسی و داوری است، نه حرکتِ حل: " + why)));
    var st = A.simState && A.simState.pid === p.id ? A.simState : null;
    if (st) {
      try {
        var pg = prog(p.id), s = sol(pg), r = (pg.lv[st.lv] || {})[s0.id];
        /* لذتِ کشف: پس از سختیِ همین سطح (یک موفقیتِ کوچک ثبت شده)، گامی را خودت بار اول درست زدی — ثبت و نام بردن، بی تعارف */
        var W = s.wins = s.wins || [];
        if (r && r.first === true && W.some(function (w) { return w.lv === st.lv && w.kind !== "step"; }) && !W.some(function (w) { return w.lv === st.lv && w.sid === s0.id && w.kind === "step"; })) {
          W.push({ at: nowISO(), lv: st.lv, sid: s0.id, kind: "step", ok: true, what: "گامِ «" + clip(s0.q, 80) + "» را خودت بار اول درست زدی" }); S.put(pg);
          col.appendChild(h("p", { class: "small good sv-joy" }, "🌱 این گام را خودت، بار اول، درست زدی — پس از سختیِ همین سطح. «" + clip(s0.idea || s0.move || "", 140) + "» را خودت دیدی."));
        }
        col.appendChild(motiveCard(p, pg, st, s0));
      } catch (e) { console.warn(e); }
    }
    return col.children.length ? col : null;
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
    var t = A.today(), out = [], seen = {};
    /* L6: مرورهای مسئله‌ای که رویش کار کرده‌ای با خاموش‌کردنِ «مسئله‌های کوتاهِ تمرینی» گم نمی‌شوند — فهرست از رکوردهای پیشرفت (eprog.solve)
       ساخته می‌شود و مسئله از همهٔ مسئله‌ها (A.getProb)، نه فقط مسئله‌های روشن (A.probs) */
    var list = (A.probs ? A.probs() : []).slice();
    try { S.all("eprog", function (r) { return r && r.solve; }).forEach(function (r) { var p = A.getProb ? A.getProb(String(r.id).replace(/^eprog_/, "")) : null; if (p && list.indexOf(p) < 0) list.push(p); }); } catch (e) { }
    list.forEach(function (p) {
      if (!p || seen[p.id]) return; seen[p.id] = 1;
      var pg = S.get("eprog_" + p.id); if (!pg || !pg.solve) return; var s = sol(pg);
      var ph = duePh(s, pg), pend = pending(s), aside = s.aside && s.aside.due && s.aside.due <= t;
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
