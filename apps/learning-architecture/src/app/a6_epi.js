/* ===== کارخانه معرفت‌شناسی: پرونده‌ها، ایستگاه‌ها، مفاهیم، متن جزوه، پوشش ===== */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, E = window.EPI, BOOK = window.EPI_BOOK || { html: "", css: "", sec: {}, ch: [] };
  if (!E) return;

  /* ---------- نام فارسی به جای شناسه‌های داخلی در همه متن‌ها (st_… ، c_… ، dos_… ، d_… ، sNN ، کلید جدول‌ها) ---------- */
  (function () {
    var nm = {};
    (window.EPI_ST || []).forEach(function (x) { nm[x.id] = "«" + x.fa + "»"; });
    (window.EPI_CO || []).forEach(function (x) { if (!nm[x.id]) nm[x.id] = "«" + x.fa + "»"; });
    (window.EPI_DOS || []).forEach(function (x) { nm[x.id] = "«پرونده پشتوانه: " + x.fa + "»"; });
    (window.EPI_DR || []).forEach(function (x) { var st = (window.EPI_ST || []).filter(function (y) { return y.id === x.st; })[0]; nm[x.id] = "«تمرین " + (st ? st.fa : x.title) + "»"; });
    var KEYW = { claims: "فهرست تصدیق‌ها", grades: "جدول درجه‌ها", ways: "جدول راه‌ها", verdict: "حکم ایستگاه" };
    function dc(v) {
      return v.replace(/\b(?:st|c|dos|d)_[a-z0-9_]+(?:#\d+)?/g, function (m) { var b = m.split("#"); return nm[b[0]] ? nm[b[0]] + (b[1] ? " (مورد " + fa(b[1]) + ")" : "") : m; })
        .replace(/\bs(\d{1,2})\b/g, function (m, n) { return "§" + fa(n); })
        .replace(/\b(claims|grades|ways|verdict)\b/g, function (m, w, off, str) { return /[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(str) ? m : KEYW[m]; });
    }
    var SKIP = { id: 1, k: 1, t: 1, st: 1, sec: 1, secs: 1, vs: 1, tech: 1, did: 1, route: 1, after: 1, src: 0, a: 1, hall: 1, ord: 1, quick: 1, req: 1, qk: 1, min: 1, max: 1, n: 1 };
    function walk(o) {
      if (Array.isArray(o)) { for (var i = 0; i < o.length; i++) { if (typeof o[i] === "string") o[i] = dc(o[i]); else walk(o[i]); } return; }
      if (o && typeof o === "object") for (var k in o) { if (SKIP[k]) continue; if (typeof o[k] === "string") o[k] = dc(o[k]); else walk(o[k]); }
    }
    A.epiDC = dc;
    [window.EPI_ST, window.EPI_CO, window.EPI_DR, window.EPI_DOS, E.NOTES, E.HALLS, E.INTRO].forEach(walk);
    E.INTRO = E.INTRO.map(dc);
  })();

  /* ---------- آماده‌سازی داده ---------- */
  var ST = (window.EPI_ST || []).slice().sort(function (a, b) { return a.hall - b.hall || a.ord - b.ord; });
  var SM = {}; ST.forEach(function (s) { SM[s.id] = s; });
  /* ترتیب اجرای مسیر: سالن‌ها به ترتیب شماره، اما «حکم نهایی» همیشه آخرین ایستگاه است؛
     چون همهٔ درجه‌ها (از جمله سالن‌های ۴ و ۵) را جمع می‌کند و پرونده را می‌بندد. */
  var FINAL = "st_final";
  var RT = ST.filter(function (s) { return s.id !== FINAL; }).concat(SM[FINAL] ? [SM[FINAL]] : []);
  // ادغام مفاهیم هم‌شناسه (چند نویسنده یک مفهوم را از بخش‌های مختلف تعریف کرده‌اند): هیچ تعریفی حذف نمی‌شود
  var CO = [], CM = {};
  var AL = E.CO_ALIAS || {};
  function al(id) { return AL[id] || id; }
  (window.EPI_CO || []).forEach(function (c0) {
    var c = JSON.parse(JSON.stringify(c0)); c.id = al(c.id); c.vs = (c.vs || []).map(al);
    var x = CM[c.id];
    if (!x) { x = CM[c.id] = JSON.parse(JSON.stringify(c)); x.secs = x.secs || []; x.st = x.st || []; x.vs = x.vs || []; CO.push(x); return; }
    ["secs", "st", "vs"].forEach(function (k) { (c[k] || []).forEach(function (v) { if (x[k].indexOf(v) < 0) x[k].push(v); }); });
    ["def", "crit", "conf", "ex"].forEach(function (k) { if (c[k] && x[k] !== c[k]) x[k] = x[k] ? x[k] + "\n— از بخش دیگر: " + c[k] : c[k]; });
    if (!x.en && c.en) x.en = c.en;
  });
  CO.forEach(function (x) { x.vs = x.vs.filter(function (v, i, a) { return v !== x.id && a.indexOf(v) === i; }); });
  (E.CO_PAIR || []).forEach(function (p) { var a = CM[p[0]], b = CM[p[1]]; if (!a || !b) return; if (a.vs.indexOf(b.id) < 0) a.vs.push(b.id); if (b.vs.indexOf(a.id) < 0) b.vs.push(a.id); });
  var DR = window.EPI_DR || [], DM = {}; DR.forEach(function (d) { DM[d.id] = d; });
  var DOS = window.EPI_DOS || [];
  A.EST = SM; A.ESTL = ST; A.ECO = CM;

  /* نمایه معکوس: هر بخش جزوه کجا به کار رفته */
  var USE = {};
  function use(sec, kind, id, label) { if (!sec) return; (USE[sec] = USE[sec] || []).push({ k: kind, id: id, l: label }); }
  ST.forEach(function (s) { (s.basis || []).forEach(function (b) { use(b.sec, "st", s.id, s.fa); }); (s.mistakes || []).forEach(function (m) { if (m.sec) use(m.sec, "stm", s.id, s.fa); }); });
  CO.forEach(function (c) { (c.secs || []).forEach(function (sc) { use(sc, "co", c.id, c.fa); }); });
  DOS.forEach(function (d) { (d.secs || []).forEach(function (sc) { use(sc, "dos", d.id, d.fa); }); });
  DR.forEach(function (d) { (d.items || []).forEach(function (it) { if (it.sec) use(it.sec, "dr", d.st, (SM[d.st] || {}).fa || d.title); }); });
  function uniqUse(sec) { var seen = {}; return (USE[sec] || []).filter(function (u) { var k = u.k.replace("stm", "st") + u.id; if (seen[k]) return false; seen[k] = 1; return true; }); }

  /* ---------- متن جزوه ---------- */
  var bookDoc = null;
  function ensureCSS() { if (document.getElementById("epibookcss")) return; var st = document.createElement("style"); st.id = "epibookcss"; st.textContent = BOOK.css + "\n.epibook .bk{box-shadow:none}"; document.head.appendChild(st); }
  function getBook() { if (!bookDoc) { bookDoc = document.createElement("div"); bookDoc.innerHTML = BOOK.html; } return bookDoc; }
  function wireLinks(root) {
    root.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[data-eb]"); if (!a) return;
      e.preventDefault(); var id = a.getAttribute("data-eb");
      var t = root.querySelector("#eb-" + CSS.escape(id));
      if (t) { t.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      // پیوندی که مقصدش بیرون از این برش است (پانوشت، فصل، بخش دیگر): متن کامل جزوه در همان نقطه
      if (getBook().querySelector("#eb-" + CSS.escape(id))) A.go("e_book", id);
    });
    return root;
  }
  A.secHTML = function (sec) {
    var bk = getBook(); var start = bk.querySelector("#eb-" + sec);
    var box = h("div", { class: "epibook" }); ensureCSS();
    if (!start) { box.appendChild(h("p", { class: "muted" }, "بخش " + sec + " در متن یافت نشد.")); return box; }
    var inner = h("div", { class: "bd" });
    var n = start;
    do { inner.appendChild(n.cloneNode(true)); n = n.nextElementSibling; } while (n && !/^H[23]$/.test(n.tagName));
    box.appendChild(inner);
    // پانوشت‌های فصل: پیوند به متن کامل
    return wireLinks(box);
  };
  function secTitle(sec) { var s = BOOK.sec[sec]; return s ? s.title : sec; }
  function secChip(sec) {
    var s = BOOK.sec[sec];
    return h("button", { class: "tlink sec", title: s ? "فصل " + fa(s.chn) + " · " + s.title : sec, onclick: function () { A.go("e_book", sec); } }, h("b", {}, "§" + fa(sec.slice(1))), s ? " " + s.title.slice(0, 48) + (s.title.length > 48 ? "…" : "") : "");
  }
  A.stLink = function (id) { var s = SM[id]; if (!s) return h("span", { class: "chip" }, id); return h("button", { class: "tlink epist", title: s.q, onclick: function () { A.go("e_st", id); } }, s.fa); };
  function coLink(id) { var c = CM[al(id)]; if (!c) return null; return h("button", { class: "tlink epico", title: (c.def || "").slice(0, 160), onclick: function () { A.go("e_concepts", id); } }, c.fa); }
  function hallName(n) { var x = E.HALLS[n]; return x ? "سالن " + fa(n) + " · " + x.fa : ""; }
  function para(txt, cls) { return String(txt || "").split(/\n+/).filter(Boolean).map(function (p) { return h("p", { class: cls || "" }, p); }); }

  /* ---------- پرونده و مسیر ---------- */
  function claimsOf(cs) { var d = cs.st && cs.st.st_tasdiq && cs.st.st_tasdiq.data; return ((d && d.claims) || []).map(function (r) { return (r.txt || "").trim(); }); }
  function sdat(cs, sid) { cs.st = cs.st || {}; cs.st[sid] = cs.st[sid] || { data: {}, done: false, rubric: [] }; return cs.st[sid]; }
  function sd(cs, sid) { return (cs.st && cs.st[sid] && cs.st[sid].data) || {}; }
  /* «قلمرو» در پذیرش تعیین‌کننده است؛ اگر هنوز انتخاب نشده، حکم پذیرش ملاک است */
  function isRel(cs) { var d = sd(cs, "st_intake"); return d.special ? d.special === E.RELIGION : /دین/.test(d.verdict || ""); }
  function waysChosen(cs) { var d = sd(cs, "st_route"); var w = {}; (d.ways || []).forEach(function (r) { if (r.w) w[r.w] = 1; }); return w; }
  function kindOf(cs) { return sd(cs, "st_intake").kind || ""; }
  /* وضعیت هر ایستگاه در مسیر این پرونده */
  A.routeOf = function (cs) {
    var ways = waysChosen(cs), rel = isRel(cs), sug = E.KIND_SUGGEST[kindOf(cs)] || [], inc = cs.inc || {};
    var wayAuto = {}; Object.keys(E.WAYMAP).forEach(function (w) { if (ways[w]) wayAuto[E.WAYMAP[w]] = "راه «" + w + "» در جدول راه‌ها انتخاب شده"; });
    var it = sd(cs, "st_intake"), wd = sd(cs, "st_worlds"), rd = sd(cs, "st_route");
    /* پیشنهادهای برآمده از داده‌های خود پرونده (افزوده سامانه؛ بر پایه «بعد از این ایستگاه» ایستگاه‌ها) */
    var dataSug = {};
    if ((it.tools || []).indexOf("یافت درونی/شهود") >= 0) dataSug.st_core = "در پذیرش «یافت درونی/شهود» به‌عنوان ابزار ثبت شده";
    if ((wd.inner || []).some(function (r) { return r && (r.st || r.lb || r.or); })) dataSug.st_core = "در «واقع، فهم، زبان» حالت درونی گزارش شده";
    if (/^زیربنایی/.test(it.layer || "")) { dataSug.st_selfref = dataSug.st_doubts = "لایهٔ پرسش در پذیرش «زیربنایی» است"; }
    var clash = String(rd.clash || "").trim();
    return RT.map(function (s) {
      var o = { s: s, inRoute: false, auto: "", sug: "", forced: false };
      if (s.route === "always") {
        o.forced = true; o.inRoute = cs.mode === "quick" ? !!s.quick : true;
        // در مسیر سریع، ایستگاه همیشگیِ غیرسریع را می‌شود دستی افزود (و دوباره برداشت)
        if (cs.mode === "quick" && !s.quick) { o.forced = false; o.inRoute = inc[s.id] === true; if (!o.inRoute) o.sug = "همیشگیِ مسیر کامل؛ در مسیر سریع اختیاری"; }
        return o;
      }
      if (wayAuto[s.id]) o.auto = wayAuto[s.id];
      else if (s.hall === 5 && rel && s.id === "st_r_struct") o.auto = "پرونده در پذیرش «دینی» علامت خورده";
      else if (s.hall === 5 && rel && s.id === "st_r_sources" && (ways["نقل"] || ways["تخصص دیگران"] || ways["یادآوری"] || ways["شهود"])) o.auto = "پرونده دینی است و در جدول راه‌ها نقل، تخصص، یادآوری یا شهود آمده";
      else if (s.id === "st_conflict" && clash) o.auto = "در جدول راه‌ها ناسازگاری ثبت شده";
      if (!o.auto && s.hall === 5 && rel) o.sug = "پرونده دینی است؛ اگر شرط این ایستگاه برقرار است اضافه کن";
      if (!o.auto && dataSug[s.id]) o.sug = dataSug[s.id];
      if (!o.auto && sug.indexOf(s.id) >= 0) o.sug = "نوع ورودی «" + kindOf(cs) + "» معمولاً این ایستگاه را لازم دارد";
      if (s.id === "st_conflict" && Object.keys(ways).length > 1 && !o.auto) o.sug = o.sug || "چند راه معرفت در پرونده هست؛ اگر نتایجشان ناسازگار است این ایستگاه لازم است";
      if (s.hall === 5 && !rel && inc[s.id] !== true) { o.inRoute = false; return o; }
      o.inRoute = inc[s.id] === true || (!!o.auto && inc[s.id] !== false && (cs.mode !== "quick" || s.quick));
      return o;
    });
  };
  function routeList(cs) { return A.routeOf(cs).filter(function (x) { return x.inRoute; }).map(function (x) { return x.s; }); }
  A.newCase = function (o) {
    o = o || {};
    var cs = { id: A.uid("case"), type: "case", title: o.title || "پرونده تازه", mode: o.mode || "full", status: "open", st: {}, inc: {}, outcome: {}, src: o.src || null };
    sdat(cs, "st_intake").data = { title: o.title || "", input: o.input || "", kind: o.kind || "", special: o.special || "" };
    return S.put(cs);
  };
  function fieldsFor(s, cs) { return cs.mode === "quick" ? s.ws.filter(function (f) { return f.qk || f.t === "info"; }) : s.ws; }
  function stDone(cs, sid) { return !!(cs.st && cs.st[sid] && cs.st[sid].done); }
  /* کاربرگِ یک ایستگاه روی یک پرونده — همان که صفحهٔ پرونده می‌سازد (فیلدهای مسیر، فهرستِ تصدیق‌ها، بازنگاشتِ شماره‌ها
     با حذفِ یک تصدیق، برچسب‌های دسترس‌پذیری). دورهٔ کارخانه (a13) هم همین را صدا می‌زند تا منطق دو جا نباشد. */
  A.epiStationWS = function (cs, sid, onSave, prefix) {
    var s = SM[sid], st = sdat(cs, sid), claims = claimsOf(cs), snap = claims.slice();
    var ws = A.renderWS(fieldsFor(s, cs), st.data, function () {
      // حذف یک تصدیق از فهرست: ارجاع‌های شماره‌ای ایستگاه‌های دیگر جابه‌جا نشوند
      if (s.id === "st_tasdiq") { var now = claimsOf(cs); if (now.length < snap.length) remapClaims(cs, snap, now); snap = now; }
      if (onSave) onSave();
    }, { prefix: prefix || "e_" + s.id, claims: claims });
    a11yWS(ws);
    return ws;
  };
  A.epiFields = fieldsFor;
  A.epiClaimsOf = claimsOf;

  /* ---------- پوسته: نماهای کارخانه ---------- */
  A.EPI_NAV = [
    { g: "شروع" },
    ["epi_course", "🧭 دورهٔ گام‌به‌گام", "ایستگاه‌ها به ترتیبِ مسیر، درس‌به‌درس، روی یک ادعای واقعیِ خودت؛ اگر نمی‌دانی از کجا شروع کنی، همین‌جا"],
    { g: "کار" },
    ["e_home", "میز کار", "یک خبر یا ادعا را بسنج؛ از اینجا شروع کن"],
    ["e_cases", "پرونده‌ها", "همه سنجش‌هایت و گزارش‌هایشان"],
    { g: "دستگاه‌ها" },
    ["e_map", "نقشه کارخانه", fa(E.HALLS.length) + " سالن و " + fa(ST.length) + " ایستگاه؛ هر پرونده از کجا می‌گذرد"],
    ["e_st", "ایستگاه‌ها", "هر گام سنجش: چرا، چطور، متن جزوه، مثال، تمرین"],
    ["e_concepts", "مفاهیم", fa(CO.length) + " اصطلاح جزوه و راه تشخیص هرکدام"],
    { g: "اعتبارسنجی و تکامل" },
    ["e_bt", "اعتبارسنجی کارخانه و جزوه", "سه آزمون: آیا می‌شود به کارخانه و جزوه اعتماد کرد؟"],
    ["e_lib", "کتابخانه وقایع", "نمونه‌های واقعی و مثال‌های جزوه برای آزمون؛ صف تأیید"],
    ["e_aut", "اختلاف‌ها برای داوری", "جاهایی که کارخانه اشتباه کرد؛ تو بگو ایراد از کجاست"],
    ["e_living", "جزوه زنده", "هر قاعده جزوه و نتیجه‌اش در آزمون‌ها"],
    ["e_prob", "مسئله‌های بزرگ", "مسئلهٔ حل‌شدهٔ خودت را گام‌به‌گام شبیه‌ساز و تمرین کن"],
    { g: "مرجع" },
    ["e_book", "متن جزوه", "متن کامل و دست‌نخورده؛ هر بخش کجا به کار رفته"],
    ["e_dos", "پرونده‌های پشتوانه", "بخش‌های روایی و تاریخی که ایستگاه نشده‌اند"],
    ["e_cov", "پوشش و ملاحظات متن", fa(Object.keys(BOOK.sec).length) + " بخش جزوه کجا به کار رفته؛ " + fa(E.NOTES.length) + " نکته درباره خود متن"]
  ];

  /* ---------- میز کار ---------- */
  /* تاریخِ بازبینی ⇒ YYYY-MM-DD ِ میلادی یا null (ممیزی ۲۰۲۶-۱۰-۱۳: «۱۴۰۵-۰۸-۲۰» و «2026/10/01» در مقایسهٔ رشته‌ای غلط موعد می‌شدند).
     ارقامِ فارسی/عربی و «/» یکسان می‌شوند؛ سالِ کمتر از ۱۷۰۰ شمسی فرض و به میلادی تبدیل می‌شود (Intl، تقویمِ persian). */
  A.epiRevDate = function (v) {
    var s = String(v || "").trim().replace(/[۰-۹]/g, function (c) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(c); }).replace(/[٠-٩]/g, function (c) { return c.charCodeAt(0) - 0x660; }).replace(/[\/.]/g, "-");
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s); if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3]; if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    if (y < 1700) {   // شمسی ⇒ میلادی (الگوریتمِ استانداردِ jalali_to_gregorian)
      var jy = y + 1595, days = -355668 + 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + d + (mo < 7 ? (mo - 1) * 31 : (mo - 7) * 30 + 186);
      var gy = 400 * Math.floor(days / 146097); days %= 146097;
      if (days > 36524) { gy += 100 * Math.floor(--days / 36524); days %= 36524; if (days >= 365) days++; }
      gy += 4 * Math.floor(days / 1461); days %= 1461;
      if (days > 365) { gy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
      var gd = days + 1, sal = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], gm = 0;
      for (gm = 0; gm < 13 && gd > sal[gm]; gm++) gd -= sal[gm];
      y = gy; mo = gm; d = gd;
    }
    return y + "-" + ("0" + mo).slice(-2) + "-" + ("0" + d).slice(-2);
  };
  function dueReviews() {
    var t = A.today();
    return S.all("case", function (cs) {
      var d = cs.st && cs.st.st_final && cs.st.st_final.data; if (!d || !d.revdate) return false;
      var rd = A.epiRevDate(d.revdate);
      if (!rd || rd > t) return false;
      return (d.final || []).some(function (r) { return r.c && !(cs.outcome || {})[r.c]; });
    });
  }
  A.epiDue = dueReviews;
  A.V.e_home = function () {
    var root = h("div", { class: "page" });
    root.appendChild(A.head("کارخانه معرفت‌شناسی · " + A.fdate(A.today()), "هر چیز را از ایستگاه‌ها عبور بده", "یک خبر، ادعا یا برداشت را بنویس و «ورود به کارخانه» را بزن؛ کارخانه گام‌به‌گام کمکت می‌کند بسنجی چقدر معتبر است. پایه کار: " + E.SOURCE + "."));
    if (A.epiCourseCard) { try { root.appendChild(A.epiCourseCard()); } catch (e) { console.error(e); } }
    var ti = h("input", { id: "ncT", type: "text", placeholder: "عنوان کوتاه پرونده" });
    var ta = h("textarea", { id: "ncI", rows: 4, placeholder: "ورودی: یک برداشت، خبر، ادعا، گزارش، متن، استدلال یا باور خودت — همان‌طور که هست" });
    var kind = h("select", { id: "ncK", "aria-label": "نوع ورودی" }, h("option", { value: "" }, "نوع ورودی (اختیاری؛ در پذیرش هم می‌شود تعیین کرد)"), Object.keys(E.KIND_SUGGEST).map(function (k) { return h("option", { value: k }, k); }));
    var mode = h("select", { id: "ncM", "aria-label": "نوع مسیر" }, h("option", { value: "full" }, "مسیر کامل: همه ایستگاه‌های همیشگی + شرطی‌های لازم"), h("option", { value: "quick" }, "مسیر سریع: فقط فیلدهای کلیدی ایستگاه‌های اصلی"));
    root.appendChild(h("section", { class: "grid2" },
      h("div", { class: "card" }, h("h2", {}, "پرونده تازه"),
        h("label", { for: "ncT" }, "عنوان"), ti, h("label", { for: "ncI" }, "ورودی"), ta, h("div", { class: "row gap wrap" }, kind, mode),
        h("button", { class: "btn mt", onclick: function () {
          if (!ta.value.trim()) { A.toast("ورودی را بنویس.", "bad"); ta.focus(); return; }
          var cs = A.newCase({ title: ti.value.trim() || ta.value.trim().slice(0, 50), input: ta.value.trim(), kind: kind.value, mode: mode.value });
          A.go("e_case", cs.id);
        } }, "ورود به کارخانه")),
      h("div", { class: "card" }, h("h2", {}, "موعددار و باز"), (function () {
        var due = dueReviews(), open = S.all("case", function (c) { return c.status !== "closed"; });
        var items = [];
        due.forEach(function (cs) { items.push(h("li", { class: "due farm" }, h("button", { class: "dueb", onclick: function () { A.go("e_case", cs.id, "st_final"); } }, h("span", { class: "dt" }, "بازبینی: " + cs.title), h("span", { class: "ds" }, "موعد رسیده؛ نتیجه واقعی را ثبت کن تا کالیبراسیون به‌روز شود")))); });
        open.slice(0, 8).forEach(function (cs) { var r = routeList(cs), d = r.filter(function (s) { return stDone(cs, s.id); }).length; items.push(h("li", { class: "due p" }, h("button", { class: "dueb", onclick: function () { A.go("e_case", cs.id); } }, h("span", { class: "dt" }, cs.title), h("span", { class: "ds" }, fa(d) + " از " + fa(r.length) + " ایستگاه · " + (cs.mode === "quick" ? "سریع" : "کامل") + " · " + A.fdate(cs.updated))))); });
        return items.length ? h("ul", { class: "duel" }, items) : h("p", { class: "muted" }, "پرونده بازی نیست. یک ورودی کوچک از امروزت بیاور.");
      })())));
    var all = S.all("case"), closed = all.filter(function (c) { return c.status === "closed"; }).length;
    var drills = S.all("edrill"), cpts = A.calibPoints().filter(function (p) { return p.src === "case"; });
    root.appendChild(h("section", { class: "stats" },
      h("div", { class: "stat" }, h("div", { class: "sl" }, "پرونده‌ها"), h("div", { class: "sv" }, fa(all.length)), h("div", { class: "small muted" }, fa(closed) + " بسته‌شده")),
      h("div", { class: "stat" }, h("div", { class: "sl" }, "ایستگاه‌های تمرین‌شده"), h("div", { class: "sv" }, fa(Object.keys(drills.reduce(function (m, d) { m[d.st] = 1; return m; }, {})).length) + " از " + fa(Object.keys(DR.reduce(function (m, d) { m[d.st] = 1; return m; }, {})).length)), h("div", { class: "small muted" }, "تمرین سنجشی با پاسخ‌نامه")),
      h("div", { class: "stat" }, h("div", { class: "sl" }, "نقطه کالیبراسیون از پرونده‌ها"), h("div", { class: "sv" }, fa(cpts.length)), h("div", { class: "small muted" }, cpts.length ? "خطای پیش‌بینی (Brier؛ کمتر بهتر): " + fa(A.brier(cpts).toFixed(2)) : "پس از ثبت نتیجه واقعی بازبینی‌ها")),
      h("div", { class: "stat" }, h("div", { class: "sl" }, "مفاهیم جزوه"), h("div", { class: "sv" }, fa(CO.length)), h("div", { class: "small muted" }, "هر کدام با ملاک تشخیص و اشتباه رایج"))));
    if (A.runCycle) {
      if (A.epiCycleDue() && S.mode !== "gas") { try { A.runCycle(); } catch (e) { console.error(e); } }
      var cy = S.get("ecycle"), lr = cy && cy.reports && cy.reports[0], pend = S.all("ecase", function (c) { return c.status === "pending"; }).length;
      root.appendChild(h("section", { class: "card" }, h("h2", {}, "اعتبار کارخانه و جزوه"),
        lr && lr.a ? h("p", { class: "small" }, "آخرین بررسی خودکار: " + A.fdate(lr.at) + " — آزمون ۱ (کارخانه همان جزوه است): " + (lr.a.ok ? "✓ قبول" : "✗ رد") + " · آزمون ۲ (جزوه با تاریخ): هم‌خوانی " + fa(Math.round(100 * (lr.b.agree || 0))) + "٪") : h("p", { class: "small" }, "هنوز بررسی خودکاری اجرا نشده."),
        lr && lr.rulesChanged ? h("p", { class: "small bad" }, "⚠ قاعده‌های کارخانه از آخرین نسخه‌ای که تأیید کرده‌ای تغییر کرده‌اند (حتی اگر آزمون‌ها سبز باشند). در «سه آزمون» ببین و تأیید کن.") : null,
        pend ? h("p", { class: "small" }, fa(pend) + " واقعه پیشنهادی منتظر تأیید توست.") : null,
        h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm", onclick: function () { A.go("e_bt"); } }, "سه آزمون"), pend ? h("button", { class: "btn ghost sm", onclick: function () { A.go("e_lib", null, "pending"); } }, "صف تأیید") : null)));
    }
    root.appendChild(h("details", { class: "card", open: !all.length }, h("summary", {}, h("strong", {}, "این کارخانه چیست و چه نیست")), para(E.INTRO.join("\n"))));
    return root;
  };

  /* ---------- فهرست پرونده‌ها ---------- */
  A.V.e_cases = function () {
    var root = h("div", { class: "page" });
    root.appendChild(A.head("کارخانه معرفت‌شناسی", "پرونده‌ها", "هر پرونده یعنی چیزی که داری می‌سنجی (خبر، ادعا، برداشت). همه پرونده‌ها، تمام‌شده یا نیمه‌کاره، اینجاست."));
    var all = S.all("case");
    if (!all.length) { root.appendChild(A.empty("هنوز پرونده‌ای نیست.", h("button", { class: "btn", onclick: function () { A.go("e_home"); } }, "پرونده تازه"))); return root; }
    root.appendChild(h("div", { class: "col gap" }, all.map(function (cs) {
      var r = routeList(cs), d = r.filter(function (s) { return stDone(cs, s.id); }).length;
      var fin = cs.st && cs.st.st_final && cs.st.st_final.data;
      return h("div", { class: "card row between wrap" }, h("div", {}, h("button", { class: "linkish", onclick: function () { A.go("e_case", cs.id); } }, h("strong", {}, cs.title)),
        h("div", { class: "small muted" }, (cs.status === "closed" ? "بسته" : "باز") + " · " + (cs.mode === "quick" ? "سریع" : "کامل") + " · " + fa(d) + "/" + fa(r.length) + " ایستگاه · " + A.fdate(cs.updated)),
        fin && fin.conclusion ? h("div", { class: "small" }, fin.conclusion.slice(0, 220)) : null),
        h("div", { class: "row gap" }, h("button", { class: "btn ghost sm", onclick: function () { A.go("e_case", cs.id, "report"); } }, "گزارش"), A.confirmBtn("حذف", function () { S.del(cs.id); A.render(); })));
    })));
    return root;
  };

  /* ---------- صفحه پرونده ---------- */
  A.V.e_case = function (id, sub) {
    var cs = S.get(id);
    if (!cs) return A.empty("پرونده پیدا نشد.", h("button", { class: "btn", onclick: function () { A.go("e_cases"); } }, "پرونده‌ها"));
    var root = h("div", { class: "page" });
    var rt = A.routeOf(cs), inR = rt.filter(function (x) { return x.inRoute; });
    if (sub === "report") return report(cs);
    if (sub === "engine" && A.caseEngine) return A.caseEngine(cs);
    var cur = sub && SM[sub] ? sub : (inR.filter(function (x) { return !stDone(cs, x.s.id); })[0] || inR[0]).s.id;
    var title = h("input", { id: "csT", type: "text", value: cs.title, class: "titlein", "aria-label": "عنوان پرونده", onchange: function (e) { cs.title = e.target.value; S.put(cs); } });
    root.appendChild(h("header", { class: "phead" }, h("div", { class: "eyebrow" }, "پرونده · " + (cs.status === "closed" ? "بسته" : "باز")), title,
      h("div", { class: "row gap wrap" },
        h("label", { class: "small", for: "csM" }, "مسیر: "), h("select", { id: "csM", onchange: function (e) { cs.mode = e.target.value; S.put(cs); A.render(); } }, h("option", { value: "full", selected: cs.mode !== "quick" }, "کامل"), h("option", { value: "quick", selected: cs.mode === "quick" }, "سریع")),
        h("button", { class: "btn ghost sm", onclick: function () { A.go("e_case", cs.id, "report"); } }, "گزارش کامل"),
        A.caseEngine ? h("button", { class: "btn ghost sm", title: "رمزگذاری تصدیق‌ها و عبور از قاعده‌های بک‌تست‌شده، بدون هوش مصنوعی", onclick: function () { A.go("e_case", cs.id, "engine"); } }, "داوری قطعی (خودکار)") : null,
        cs.src && cs.src.t === "fnode" && S.get(cs.src.id) ? h("button", { class: "btn ghost sm", onclick: function () { A.farmSel = cs.src.id; var n = S.get(cs.src.id); A.go("farm", n.tree, "tree"); } }, "بازگشت به گره مزرعه") : null,
        cs.status === "closed" ? h("button", { class: "btn ghost sm", onclick: function () { cs.status = "open"; S.put(cs); A.render(); } }, "بازگشایی") : null)));
    var layout = h("div", { class: "caselay" });
    layout.appendChild(routePanel(cs, rt, cur));
    layout.appendChild(stationRun(cs, SM[cur], inR));
    root.appendChild(layout);
    return root;
  };
  function routePanel(cs, rt, cur) {
    var nIn = rt.filter(function (x) { return x.inRoute; }), nDone = nIn.filter(function (x) { return stDone(cs, x.s.id); }).length;
    var box = h("details", { class: "card routep", open: window.innerWidth > 900 || null }, h("summary", {}, h("strong", {}, "مسیر پرونده"), h("span", { class: "small muted" }, " · " + fa(nDone) + " از " + fa(nIn.length) + " ایستگاه")));
    var lastHall = -1, rel = isRel(cs);
    rt.forEach(function (x) {
      var s = x.s;
      var hk = s.id === FINAL ? "end" : s.hall;
      if (hk !== lastHall) {
        lastHall = hk;
        box.appendChild(h("div", { class: "rhall" }, hk === "end" ? "پایان مسیر · " + hallName(s.hall) : hallName(s.hall)));
        // سالن دین در پرونده غیردینی: فقط راهنما، نه ردیف‌های خاموش
        if (s.hall === 5 && !rel) box.appendChild(h("p", { class: "small muted rhint" }, "با انتخاب «" + E.RELIGION + "» در پذیرش باز می‌شود."));
      }
      if (s.hall === 5 && !rel && !x.inRoute) return;
      var done = stDone(cs, s.id);
      var row = h("div", { class: "rtr" + (x.inRoute ? "" : " off") + (s.id === cur ? " cur" : "") + (done ? " done" : "") });
      if (x.inRoute) row.appendChild(h("button", { class: "rbtn", onclick: function () { A.go("e_case", cs.id, s.id); } }, h("span", { class: "rmark", "aria-hidden": "true" }, done ? "✓" : s.id === cur ? "●" : "○"), s.fa));
      else row.appendChild(h("span", { class: "rbtn dim", title: s.cond || "" }, h("span", { class: "rmark", "aria-hidden": "true" }, "+"), s.fa));
      if (!x.forced) {
        var on = x.inRoute;
        row.appendChild(h("button", { class: "ib small", title: on ? "حذف از مسیر" : "افزودن به مسیر" + (s.cond ? " — شرط: " + s.cond : ""), "aria-label": (on ? "حذف از مسیر: " : "افزودن به مسیر: ") + s.fa, "aria-pressed": on ? "true" : "false", onclick: function () { cs.inc = cs.inc || {}; cs.inc[s.id] = !on; S.put(cs); A.render(); } }, on ? "−" : "+"));
      }
      if (x.auto && x.inRoute) row.appendChild(h("div", { class: "rwhy" }, "خودکار: " + x.auto));
      else if (x.sug && !x.inRoute) row.appendChild(h("div", { class: "rwhy sug" }, "پیشنهاد: " + x.sug));
      box.appendChild(row);
    });
    box.appendChild(h("p", { class: "small muted" }, "ایستگاه‌های شرطی (فقط وقتی لازم‌اند) را با «+» اضافه کن؛ نشانگر را روی نام هرکدام نگه دار تا ببینی کِی لازم است. ایستگاه‌های «راه معرفت» خودکار باز می‌شوند، بسته به اینکه در جدول «راه معرفت هر تصدیق» گفته‌ای هر ادعا از کجا آمده."));
    return box;
  }
  function stationRun(cs, s, inR) {
    var st = sdat(cs, s.id), claims = claimsOf(cs);
    var wrap = h("section", { class: "card strun" });
    wrap.appendChild(h("div", { class: "row between wrap" }, h("div", { class: "eyebrow" }, hallName(s.hall) + (s.route === "cond" ? " · شرطی" : "")), h("button", { class: "linkish small", onclick: function () { A.go("e_st", s.id); } }, "صفحه کامل ایستگاه")));
    wrap.appendChild(h("h2", {}, s.fa));
    wrap.appendChild(h("p", { class: "lead" }, s.q));
    if (s.cond) wrap.appendChild(h("p", { class: "small muted" }, "شرط ورود: " + s.cond));
    var inp = cs.st.st_intake && cs.st.st_intake.data && cs.st.st_intake.data.input;
    if (s.id !== "st_intake" && inp) wrap.appendChild(h("div", { class: "inbox" }, h("strong", {}, "ورودی پرونده: "), inp));
    wrap.appendChild(h("details", { class: "mini" }, h("summary", {}, "روش اجرای ایستگاه (" + fa(s.method.length) + " گام)"), h("ol", {}, s.method.map(function (m) { return h("li", {}, m); })),
      s.out ? h("p", { class: "small" }, h("strong", {}, "خروجی: "), s.out) : null));
    wrap.appendChild(h("details", { class: "mini" }, h("summary", {}, "چرا این ایستگاه؟ (فلسفه و پشتوانه جزوه)"), para(s.philo), para(s.why, "small"),
      h("div", { class: "row gap wrap" }, (s.basis || []).map(function (b) { return secChip(b.sec); }))));
    if (s.mistakes && s.mistakes.length) wrap.appendChild(h("details", { class: "mini" }, h("summary", {}, "خطاهای رایج در اجرا"), h("ul", {}, s.mistakes.map(function (m) { return h("li", {}, h("strong", {}, m.e), " — ", m.fix, m.sec ? " " : null, m.sec ? secChip(m.sec) : null); }))));
    if (s.id === "st_final") wrap.appendChild(aggregate(cs));
    var fields = fieldsFor(s, cs);
    var save = A.debounce(function () { S.put(cs); }, 400);
    function nextOf() { var r = routeList(cs).map(function (x) { return x.id; }); var i = r.indexOf(s.id); return i >= 0 && r[i + 1] ? SM[r[i + 1]] : null; }
    var goBtn = h("button", { class: "btn" });
    function lbl() { var n = nextOf(); goBtn.textContent = n ? "ثبت و ایستگاه بعد: " + n.fa : "ثبت و گزارش"; }
    var ws = A.epiStationWS(cs, s.id, function () { save(); lbl(); });
    wrap.appendChild(ws);
    if (s.id === "st_final") wrap.appendChild(outcomes(cs));
    // روبریک
    wrap.appendChild(h("div", { class: "rubric" }, h("h3", {}, "خودارزیابی اجرای ایستگاه"), s.rubric.map(function (r, i) {
      return h("div", { class: "rrow" }, h("div", { class: "rc" }, r), h("div", { class: "seg", role: "radiogroup", "aria-label": r }, [0, 1, 2].map(function (v) {
        return h("button", { type: "button", role: "radio", "aria-checked": st.rubric[i] === v ? "true" : "false", class: "sg" + (st.rubric[i] === v ? " on" : ""), onclick: function (e) { st.rubric[i] = v; e.target.parentNode.querySelectorAll(".sg").forEach(function (b, j) { b.classList.toggle("on", j === v); b.setAttribute("aria-checked", j === v ? "true" : "false"); }); S.put(cs); } }, ["۰ نه", "۱ تاحدی", "۲ کامل"][v]);
      })));
    })));
    var aiBox = h("div", { class: "aibox" }, st.ai ? A.md(st.ai) : null);
    lbl();
    goBtn.addEventListener("click", function () {
      var miss = ws._validate(); if (miss.length) { A.toast("الزامی: " + miss.join("، "), "bad"); return; }
      /* پذیرش (ممیزی ۲۰۲۶-۱۰-۱۳): «ورودی مبهم» یعنی «پیش از ادامه کامل شود» — جلو نمی‌رود؛ و حکم با «قلمرو» نباید تناقض داشته باشد */
      if (s.id === "st_intake") {
        var vd = String(st.data.verdict || ""), sp = String(st.data.special || "");
        if (/مبهم یا ناقص/.test(vd)) { A.toast("حکمِ این ایستگاه می‌گوید ورودی مبهم یا ناقص است؛ اول ورودی را کامل کن و حکم را عوض کن.", "bad"); return; }
        if (/دین/.test(vd) !== /^دین/.test(sp)) { A.toast("«قلمرو» و «حکمِ این ایستگاه» با هم نمی‌خوانند (یکی دین، دیگری عام). یکی را اصلاح کن.", "bad"); return; }
      }
      st.done = true;
      if (s.id === "st_final" && /بسته شد|نداشت/.test(st.data.verdict || "")) cs.status = "closed";
      S.put(cs);
      var nextS = nextOf();
      if (nextS) A.go("e_case", cs.id, nextS.id); else { A.toast("پرونده به پایان مسیر رسید."); A.go("e_case", cs.id, "report"); }
    });
    wrap.appendChild(h("div", { class: "row gap wrap mt" }, goBtn,
      h("button", { class: "btn ghost", onclick: function (e) {
        var b = e.target; b.disabled = true; b.textContent = "در حال نقد…";
        var msg = "ایستگاه: " + s.fa + "\nپرسش محوری: " + s.q + "\nروش: " + s.method.join(" | ") + "\nحکم‌های مجاز ایستگاه: " + ((s.ws.filter(function (f) { return f.k === "verdict"; })[0] || {}).opts || []).join(" / ") +
          "\nروبریک: " + s.rubric.join(" | ") + "\nبخش‌های پشتوانه جزوه: " + (s.basis || []).map(function (b) { return b.sec + " " + secTitle(b.sec) + " — " + b.use; }).join(" | ") +
          "\n\nورودی پرونده: " + (inp || "") + "\nتصدیق‌های پرونده: " + claims.map(function (c, i) { return (i + 1) + ". " + c; }).join(" | ") + "\n\nاجرای کاربر:\n" + A.serializeWS(fields, st.data, claims);
        A.callAI(E.AI_SYS, msg).then(function (r) { st.ai = r; S.put(cs); aiBox.innerHTML = ""; aiBox.appendChild(A.md(r)); b.disabled = false; b.textContent = "نقد دوباره"; }, function (err) { A.toast(err.message || String(err), "bad"); b.disabled = false; b.textContent = "نقد هوش مصنوعی"; });
      } }, "نقد هوش مصنوعی"),
      s.id === "st_final" && st.data.conclusion ? h("button", { class: "btn ghost", onclick: function () { A.toNursery(cs.title + ": " + st.data.conclusion, "fruit", { t: "case", id: cs.id, label: "پرونده معرفتی: " + cs.title }); A.toast("به نهالستان مزرعه رفت."); } }, "کاشت نتیجه در مزرعه") : null));
    wrap.appendChild(aiBox);
    if (s.examples && s.examples.length) wrap.appendChild(h("details", { class: "mini" }, h("summary", {}, "مثال اجرای این ایستگاه (" + fa(s.examples.length) + ")"), s.examples.map(exCard)));
    return wrap;
  }
  /* ارجاع به تصدیق‌ها شماره‌ای است (۱، ۲، …)؛ وقتی ردیفی از فهرست حذف شود، شماره‌ها در همه ایستگاه‌ها و نتیجه‌ها بازنگاشت می‌شوند */
  function remapClaims(cs, before, after) {
    var map = {}, j = 0;
    for (var i = 0; i < before.length; i++) { if (j < after.length && before[i] === after[j]) { map[i + 1] = String(j + 1); j++; } else map[i + 1] = ""; }
    ST.forEach(function (x) {
      var d = cs.st && cs.st[x.id] && cs.st[x.id].data; if (!d) return;
      x.ws.forEach(function (f) {
        if (f.t !== "table" || !Array.isArray(d[f.k])) return;
        var cc = (f.cols || []).filter(function (c) { return c.t === "claim"; }); if (!cc.length) return;
        d[f.k].forEach(function (r) { cc.forEach(function (c) { if (r && r[c.k] != null && r[c.k] !== "" && map[+r[c.k]] != null) r[c.k] = map[+r[c.k]]; }); });
      });
    });
    if (cs.outcome) { var o = {}; Object.keys(cs.outcome).forEach(function (k) { if (map[+k]) o[map[+k]] = cs.outcome[k]; }); cs.outcome = o; }
    /* رمزگذاریِ هر تصدیق (cs.feat) هم با همان نگاشت جابه‌جا می‌شود — ممیزی ۲۰۲۶-۱۰-۱۳: حذفِ تصدیقِ میانی ویژگی‌های «ب» را به «ج» می‌داد */
    ["feat", "featFrozen"].forEach(function (key) { if (!cs[key]) return; var f = {}; Object.keys(cs[key]).forEach(function (k) { if (map[+k]) f[map[+k]] = cs[key][k]; }); cs[key] = f; });
  }
  /* دسترس‌پذیری: ورودی‌های بی‌برچسب فهرست‌ها و زنجیره‌ها (ردیف‌های تازه هم) برچسب فیلد خود را می‌گیرند */
  function a11yWS(ws) {
    function fix() {
      Array.prototype.forEach.call(ws.querySelectorAll(".fld"), function (f) {
        var lb = f.querySelector(".flabel"); if (!lb) return;
        var t = lb.textContent.replace(/\s*\*\s*$/, "").trim(), n = 0;
        Array.prototype.forEach.call(f.querySelectorAll("input:not([type=hidden]), textarea, select"), function (el) {
          if (el.getAttribute("aria-label") || el.closest("label") || (el.id && ws.querySelector('label[for="' + CSS.escape(el.id) + '"]'))) return;
          n++; el.setAttribute("aria-label", t + " — " + fa(n));
        });
      });
    }
    fix();
    if (window.MutationObserver) new MutationObserver(fix).observe(ws, { childList: true, subtree: true });
  }
  function exCard(x) {
    return h("div", { class: "excard" }, h("div", { class: "row gap wrap" }, h("span", { class: "chip" }, x.dom), h("span", { class: "chip" + (/جزوه/.test(x.src || "") ? " good" : "") }, x.src || "")),
      h("p", {}, h("strong", {}, "ورودی: "), x["in"]), h("p", {}, h("strong", {}, "اجرا: "), x.walk), h("p", {}, h("strong", {}, "نتیجه: "), x.out));
  }
  function aggregate(cs) {
    var claims = claimsOf(cs), rows = {};
    var box = h("div", { class: "agg" }, h("h3", {}, "خلاصه خودکار ایستگاه‌ها"));
    var vl = routeList(cs).filter(function (s) { return s.id !== "st_final"; }).map(function (s) { var d = cs.st[s.id]; return h("li", {}, h("strong", {}, s.fa + ": "), d && d.data && d.data.verdict ? d.data.verdict : h("span", { class: "muted" }, d && d.done ? "—" : "اجرا نشده")); });
    box.appendChild(h("ul", { class: "plain small" }, vl));
    ST.forEach(function (s) {
      var d = cs.st && cs.st[s.id] && cs.st[s.id].data; if (!d || !d.grades) return;
      d.grades.forEach(function (r) { if (!r.c || r.p == null || r.p === "") return; (rows[r.c] = rows[r.c] || []).push({ s: s, p: +r.p, why: r.why || "" }); });
    });
    if (!claims.length) { box.appendChild(h("p", { class: "muted small" }, "هنوز تصدیقی در ایستگاه «تصور یا تصدیق» ثبت نشده.")); return box; }
    box.appendChild(h("div", { class: "scrollx" }, h("table", { class: "wt" }, h("thead", {}, h("tr", {}, h("th", {}, "#"), h("th", {}, "تصدیق"), h("th", {}, "درجه‌ها در ایستگاه‌ها"), h("th", {}, "کمینه"))),
      h("tbody", {}, claims.map(function (c, i) {
        var g = rows[String(i + 1)] || []; var mn = g.length ? Math.min.apply(null, g.map(function (x) { return x.p; })) : null;
        return h("tr", {}, h("td", {}, fa(i + 1)), h("td", {}, c), h("td", {}, g.length ? g.map(function (x) { return h("div", { class: "small", title: x.why }, x.s.fa + ": " + fa(x.p) + "٪"); }) : h("span", { class: "muted small" }, "—")), h("td", {}, mn == null ? "—" : fa(mn) + "٪"));
      })))));
    var pr = cs.st.st_intake && cs.st.st_intake.data && cs.st.st_intake.data.prior;
    if (pr != null) box.appendChild(h("p", { class: "small" }, "اطمینان اولیه در پذیرش: " + fa(pr) + "٪"));
    return box;
  }
  function outcomes(cs) {
    var d = cs.st.st_final && cs.st.st_final.data; var fin = (d && d.final) || []; var claims = claimsOf(cs);
    var rowsWithP = fin.filter(function (r) { return r.c && r.p != null && r.p !== ""; });
    if (!rowsWithP.length) return h("div");
    cs.outcome = cs.outcome || {};
    return h("div", { class: "card soft" }, h("h3", {}, "نتیجه واقعی (پس از بازبینی)"), h("p", { class: "small muted" }, "وقتی معیار بازبینی معلوم شد، اینجا ثبت کن. فقط «درست» و «نادرست» به کالیبراسیون مشترک می‌رود."),
      rowsWithP.map(function (r) {
        return h("div", { class: "row gap wrap" }, h("span", {}, fa(r.c) + ". " + (claims[+r.c - 1] || "").slice(0, 80) + " — " + fa(r.p) + "٪"),
          h("select", { "aria-label": "نتیجه ادعای " + r.c, onchange: function (e) {
            /* دفترِ پیش‌رو (آزمون ۳) فقط رمزگذاریِ پیش از نتیجه را می‌پذیرد: لحظهٔ اولین نتیجه ثبت و رمزگذاریِ همان لحظه منجمد می‌شود (ممیزی ۲۰۲۶-۱۰-۱۳) */
            if (e.target.value && !cs.outcomeAt) { cs.outcomeAt = new Date().toISOString(); if (cs.fwdAt) cs.featFrozen = JSON.parse(JSON.stringify(cs.feat || {})); }
            cs.outcome[r.c] = e.target.value; S.put(cs); A.toast("ثبت شد"); } }, ["", "درست", "نادرست", "نامعلوم"].map(function (o) { return h("option", { value: o, selected: (cs.outcome[r.c] || "") === o }, o || "—"); })));
      }));
  }
  function report(cs) {
    var root = h("div", { class: "page" }), claims = claimsOf(cs);
    root.appendChild(A.head("گزارش پرونده", cs.title, null, h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm", onclick: function () { A.go("e_case", cs.id); } }, "بازگشت به پرونده"), h("button", { class: "btn ghost sm", onclick: function () { A.copy(txt); } }, "کپی متن گزارش"))));
    var lines = ["پرونده: " + cs.title, "مسیر: " + (cs.mode === "quick" ? "سریع" : "کامل"), ""];
    routeList(cs).forEach(function (s) {
      var d = cs.st[s.id]; if (!d) return;
      var f = fieldsFor(s, cs);
      lines.push("━━ " + s.fa + (d.done ? "" : " (ناتمام)")); lines.push(A.serializeWS(f, d.data || {}, claims)); lines.push("");
      root.appendChild(h("section", { class: "card" }, h("h3", {}, s.fa, d.done ? null : h("span", { class: "chip" }, "ناتمام")), h("pre", { class: "rep" }, A.serializeWS(f, d.data || {}, claims)),
        h("button", { class: "linkish small", onclick: function () { A.go("e_case", cs.id, s.id); } }, "ویرایش")));
    });
    var txt = lines.join("\n");
    return root;
  }

  /* ---------- نقشه کارخانه ---------- */
  A.V.e_map = function () {
    var root = h("div", { class: "page" });
    root.appendChild(A.head("کارخانه معرفت‌شناسی", "نقشه کارخانه", "هر پرونده سالن‌ها را به ترتیب شماره (از راست به چپ) طی می‌کند و «حکم نهایی» همیشه آخرین ایستگاه است. پررنگ: همیشه در مسیر. خط‌چین: فقط وقتی لازم شود. نشان «س»: در مسیر سریع هم هست."));
    root.appendChild(h("div", { class: "hallflow" }, E.HALLS.map(function (H) {
      var ss = ST.filter(function (s) { return s.hall === H.n; });
      return h("div", { class: "hallcol" }, h("div", { class: "hallh" }, h("b", {}, "سالن " + fa(H.n)), " ", H.fa),
        h("p", { class: "small" }, H.goal), h("p", { class: "small muted" }, H.why),
        ss.map(function (s) { return h("button", { class: "stbox" + (s.route === "cond" ? " cond" : ""), title: s.route === "cond" ? "شرط: " + s.cond : s.id === FINAL ? "همیشه — آخرین ایستگاه مسیر، پس از سالن‌های ۴ و ۵ اگر باز باشند" : "همیشه", onclick: function () { A.go("e_st", s.id); } }, h("span", {}, s.fa + (s.id === FINAL ? " (پایان مسیر)" : "")), s.quick ? h("span", { class: "qb", title: "در مسیر سریع" }, "س") : null); }));
    })));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "قواعد مسیر"), h("ul", {},
      h("li", {}, "ایستگاه‌های همیشگی در مسیر کامل همه اجرا می‌شوند؛ در مسیر سریع فقط آن‌هایی که نشان «س» دارند و فقط فیلدهای کلیدی‌شان (بقیه را می‌شود با «+» افزود)."),
      h("li", {}, "ایستگاه‌های راه معرفت (شهود، حس، عقل، نقل، تخصص دیگران، استقراء، تجربه، یادآوری) از روی جدول «راه معرفت هر تصدیق» خودکار باز می‌شوند."),
      h("li", {}, "سالن دین وقتی باز می‌شود که در پذیرش «دین (معرفت‌شناسی دین)» انتخاب شده باشد؛ «ساختار دین» خودکار، «سنجش منابع دینی» وقتی در جدول راه‌ها نقل، تخصص، یادآوری یا شهود آمده باشد خودکار، بقیه با شرط خودشان."),
      h("li", {}, "«داوری در تعارض» وقتی در جدول راه‌ها ناسازگاری نوشته شود خودکار باز می‌شود؛ وقتی چند راه در پرونده هست پیشنهاد می‌شود."),
      h("li", {}, "بقیه ایستگاه‌های شرطی بر پایه نوع ورودی و داده‌های پذیرش (ابزار «یافت درونی/شهود»، لایهٔ «زیربنایی») یا حالت درونیِ ثبت‌شده پیشنهاد می‌شوند و با یک کلیک اضافه می‌شوند (پیشنهاد افزوده سامانه است، نه جزوه)."),
      h("li", {}, "ایستگاه «حکم نهایی» همیشه آخرین ایستگاه مسیر است (حتی پس از سالن‌های ۴ و ۵)، همه درجه‌ها را کنار هم می‌گذارد و پرونده را می‌بندد؛ نتیجه واقعی بعدی به کالیبراسیون مشترک با سامانه یادگیری می‌رود."))));
    var links = []; ST.forEach(function (s) { (s.tech || []).forEach(function (t) { links.push({ s: s, t: t }); }); });
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "رابطه با سامانه یادگیری"), para(E.INTRO[2]),
      h("h3", {}, "پیوندهای ایستگاه ← تکنیک (" + fa(links.length) + ")"), h("p", { class: "small muted" }, "فقط جایی که سازوکار یا خطا واقعاً مشترک است."),
      h("ul", { class: "plain" }, links.map(function (x) { return h("li", {}, A.stLink(x.s.id), " ← ", A.techLink(x.t.id), h("div", { class: "small muted" }, x.t.why)); }))));
    return root;
  };

  /* ---------- ایستگاه‌ها ---------- */
  function drillStats(sid) { var a = S.all("edrill", function (d) { return d.st === sid; }); var best = a.reduce(function (m, d) { return Math.max(m, Math.round(100 * d.score / d.n)); }, -1); return { n: a.length, best: best < 0 ? null : best }; }
  A.V.e_st = function (id, tab) {
    if (!id || !SM[id]) {
      var root = h("div", { class: "page" });
      root.appendChild(A.head("کارخانه معرفت‌شناسی", "ایستگاه‌ها", "هر ایستگاه یک گام سنجش از جزوه است. یکی را باز کن تا ببینی چرا لازم است، دقیقاً چطور انجامش دهی، متن جزوه، مثال، و تمرین با پاسخ‌نامه (به‌اضافه پیوندها و دیدگاه رقیب)."));
      E.HALLS.forEach(function (H) {
        root.appendChild(h("section", { class: "card" }, h("h2", {}, hallName(H.n)), h("p", { class: "small muted" }, H.goal),
          h("ul", { class: "plain" }, ST.filter(function (s) { return s.hall === H.n; }).map(function (s) {
            var ds = drillStats(s.id), used = S.all("case", function (c) { return stDone(c, s.id); }).length;
            return h("li", { class: "strow" }, A.stLink(s.id), h("span", { class: "small muted" }, " " + s.q),
              h("div", { class: "small muted" }, (s.route === "cond" ? "شرطی" : "همیشگی") + (s.id === FINAL ? " · همیشه آخرین ایستگاه مسیر" : "") + (s.quick ? " · در مسیر سریع" : "") + " · در " + fa(used) + " پرونده اجرا شده" + (ds.n ? " · بهترین تمرین " + fa(ds.best) + "٪" : "")));
          }))));
      });
      return root;
    }
    var s = SM[id]; tab = tab || "why";
    var root2 = h("div", { class: "page" });
    root2.appendChild(A.head(hallName(s.hall) + (s.route === "cond" ? " · شرطی" : " · همیشگی"), s.fa, s.q, h("div", { class: "row gap wrap" },
      h("button", { class: "btn sm", onclick: function () { var cs = A.newCase({ title: "اجرای " + s.fa }); if (s.route === "cond") { cs.inc[s.id] = true; S.put(cs); } A.go("e_case", cs.id); } }, "پرونده تازه"),
      s.cond ? h("span", { class: "small muted" }, "شرط ورود: " + s.cond) : null)));
    var tabs = [["why", "چرا و فلسفه"], ["how", "روش دقیق"], ["text", "متن جزوه"], ["ex", "مثال‌ها"], ["drill", "تمرین سنجشی"], ["rel", "پیوندها"], ["riv", "دیدگاه رقیب و افزوده‌ها"], ["hist", "سابقه"]];
    root2.appendChild(A.tabs(tabs, tab, function (k) { A.go("e_st", id, k); }));
    var body = h("div", { class: "col gap" }); root2.appendChild(body);
    if (tab === "why") {
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "فلسفه ایستگاه"), para(s.philo)));
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "چرا خطا را می‌گیرد"), para(s.why)));
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "پشتوانه در جزوه"), h("ul", { class: "plain" }, (s.basis || []).map(function (b) { return h("li", {}, secChip(b.sec), h("div", { class: "small" }, b.use)); }))));
    } else if (tab === "how") {
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "گام‌ها"), h("ol", {}, s.method.map(function (m) { return h("li", {}, m); })), s.out ? h("p", {}, h("strong", {}, "خروجی: "), s.out) : null, s.next ? h("p", {}, h("strong", {}, "بعد از این ایستگاه: "), s.next) : null));
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "خطاهای رایج و اصلاح"), h("ul", {}, (s.mistakes || []).map(function (m) { return h("li", {}, h("strong", {}, m.e), " — ", m.fix, m.sec ? " " : null, m.sec ? secChip(m.sec) : null); }))));
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "روبریک اجرای درست"), h("ol", {}, s.rubric.map(function (r) { return h("li", {}, r); })),
        h("h3", {}, "کاربرگ (" + fa(s.ws.length) + " فیلد)"), h("ul", { class: "small" }, s.ws.filter(function (f) { return f.t !== "info"; }).map(function (f) { return h("li", {}, f.l, f.qk ? h("span", { class: "chip" }, "سریع") : null, f.req ? h("span", { class: "chip" }, "الزامی") : null); }))));
    } else if (tab === "text") {
      (s.basis || []).forEach(function (b) { body.appendChild(h("section", { class: "card" }, h("div", { class: "small" }, h("strong", {}, "کاربرد در این ایستگاه: "), b.use), A.secHTML(b.sec))); });
    } else if (tab === "ex") {
      body.appendChild(h("p", { class: "small muted" }, "برچسب سبز «جزوه»: مثال خود متن. «ساخته سامانه»: مثالی که برای روشن کردن اجرا ساخته شده."));
      (s.examples || []).forEach(function (x) { body.appendChild(h("section", { class: "card" }, exCard(x))); });
    } else if (tab === "drill") {
      var ds = DR.filter(function (d) { return d.st === id; });
      if (!ds.length) body.appendChild(A.empty("این ایستگاه تمرین سنجشی ندارد: کارش ثبت یا جمع‌بندی است، نه به‌کاربستن یک ملاک جزوه."));
      ds.forEach(function (d) { body.appendChild(drill(d)); });
    } else if (tab === "rel") {
      var cos = CO.filter(function (c) { return (c.st || []).indexOf(id) >= 0; });
      var dos = DOS.filter(function (d) { return (d.st || []).indexOf(id) >= 0; });
      var from = ST.filter(function (x) { return x.next && x.next.indexOf(id) >= 0 && x.id !== id; });
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "مفاهیم این ایستگاه (" + fa(cos.length) + ")"), h("div", { class: "row gap wrap" }, cos.map(function (c) { return coLink(c.id); }))));
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "پیوند با سامانه یادگیری"), (s.tech || []).length ? h("ul", { class: "plain" }, s.tech.map(function (t) { return h("li", {}, A.techLink(t.id), h("div", { class: "small muted" }, t.why)); })) : h("p", { class: "muted small" }, "پیوند واقعی با تکنیک‌ها ثبت نشده (پیوند زورکی ساخته نشده).")));
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "بعد از این ایستگاه"), h("p", {}, s.next || "—"), from.length ? h("div", {}, h("strong", {}, "ارجاع‌دهنده‌ها: "), from.map(function (x) { return A.stLink(x.id); })) : null));
      if (dos.length) body.appendChild(h("section", { class: "card" }, h("h2", {}, "پرونده‌های پشتوانه"), dos.map(function (d) { return h("button", { class: "tlink", onclick: function () { A.go("e_dos", d.id); } }, d.fa); })));
    } else if (tab === "riv") {
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "دیدگاه رقیب"), h("p", { class: "small muted" }, "موضع جزوه نخست و بی‌تغییر می‌آید؛ رقیب فقط کنارش."),
        (s.contested || []).length ? s.contested.map(function (c) { return h("div", { class: "riv" }, h("p", {}, h("strong", {}, "موضع جزوه: "), c.pos), h("p", {}, h("strong", {}, "دیدگاه رقیب: "), c.rival), h("p", { class: "small muted" }, (c.who || "") + (c.ref ? " · " + c.ref : ""))); }) : h("p", { class: "muted" }, "موردی ثبت نشده.")));
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "افزوده‌های سامانه (فراتر از جزوه)"), (s.ext || []).length ? h("ul", {}, s.ext.map(function (x) { return h("li", {}, x); })) : h("p", { class: "muted" }, "این ایستگاه چیزی فراتر از جزوه ندارد.")));
    } else if (tab === "hist") {
      var cases = S.all("case", function (c) { return c.st && c.st[id]; });
      var att = S.all("edrill", function (d) { return d.st === id; });
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "پرونده‌ها"), cases.length ? h("ul", { class: "plain" }, cases.map(function (c) { var d = c.st[id]; return h("li", {}, h("button", { class: "linkish", onclick: function () { A.go("e_case", c.id, id); } }, c.title), h("span", { class: "small muted" }, " · " + (d.done ? (d.data.verdict || "ثبت‌شده") : "ناتمام"))); })) : h("p", { class: "muted" }, "هنوز در پرونده‌ای اجرا نشده.")));
      body.appendChild(h("section", { class: "card" }, h("h2", {}, "تمرین‌های سنجشی"), att.length ? h("ul", { class: "plain" }, att.map(function (a) { return h("li", {}, A.fdate(a.updated) + " · " + fa(a.score) + " از " + fa(a.n) + " (" + fa(Math.round(100 * a.score / a.n)) + "٪)"); })) : h("p", { class: "muted" }, "هنوز تمرینی انجام نشده.")));
    }
    return root2;
  };

  /* ---------- تمرین سنجشی ---------- */
  function drill(d) {
    var box = h("section", { class: "card drill" });
    var items = A.shuffle(d.items.map(function (it, i) { return { it: it, i: i, ord: A.shuffle(it.opts.map(function (_, k) { return k; })) }; }));
    var ans = {}, score = 0, done = 0;
    var head = h("div", { class: "row between wrap" }, h("h2", {}, d.title), h("span", { class: "pill" }, fa(d.items.length) + " مورد"));
    var prog = h("div", { class: "small muted" }, "هر مورد را پاسخ بده؛ توضیح و بخش جزوه بلافاصله نمایش داده می‌شود.");
    box.appendChild(head); box.appendChild(prog);
    items.forEach(function (x, n) {
      var fb = h("div", { class: "dfb" });
      var opts = h("div", { class: "dopts" }, x.ord.map(function (k) {
        return h("button", { class: "dopt", onclick: function (e) {
          if (ans[x.i] != null) return; ans[x.i] = k; done++;
          var ok = k === x.it.a; if (ok) score++;
          Array.prototype.forEach.call(opts.children, function (b, j) { b.disabled = true; var kk = x.ord[j]; if (kk === x.it.a) b.classList.add("right"); else if (kk === k) b.classList.add("wrong"); });
          fb.appendChild(h("div", { class: ok ? "good" : "bad" }, ok ? "درست." : "نادرست."));
          fb.appendChild(h("div", { class: "small" }, x.it.why));
          if (x.it.sec) fb.appendChild(secChip(x.it.sec));
          prog.textContent = fa(done) + " از " + fa(d.items.length) + " · درست: " + fa(score);
          if (done === d.items.length) {
            S.put({ id: A.uid("edr"), type: "edrill", did: d.id, st: d.st, score: score, n: d.items.length });
            box.appendChild(h("div", { class: "card soft" }, h("strong", {}, "نتیجه: " + fa(score) + " از " + fa(d.items.length) + " (" + fa(Math.round(100 * score / d.items.length)) + "٪)"),
              h("p", { class: "small" }, score / d.items.length >= 0.85 ? "ملاک‌های این ایستگاه را درست به کار می‌بری." : "موردهای نادرست را با بخش جزوه‌شان دوباره بخوان و بعد تمرین را تکرار کن (ترتیب موردها و گزینه‌ها هر بار عوض می‌شود)."),
              h("button", { class: "btn ghost sm", onclick: function () { A.render(); } }, "تکرار")));
          }
        } }, x.it.opts[k]);
      }));
      box.appendChild(h("div", { class: "ditem" }, h("div", { class: "dq" }, h("b", {}, fa(n + 1) + ". "), x.it.q), opts, fb));
    });
    return box;
  }

  /* ---------- مفاهیم ---------- */
  A.V.e_concepts = function (cid) {
    cid = cid && al(cid);
    var root = h("div", { class: "page" });
    root.appendChild(A.head("کارخانه معرفت‌شناسی", "مفاهیم جزوه", fa(CO.length) + " اصطلاح جزوه. برای هرکدام: تعریف طبق جزوه، راه تشخیص، اشتباه رایج، مثال، بخش‌های متن، مفهوم مقابل، و ایستگاه‌هایی که آن را به کار می‌برند."));
    var q = h("input", { id: "coQ", type: "search", "aria-label": "جستجوی مفهوم", placeholder: "جستجو در نام، تعریف، ملاک…", value: A.coQ || "" });
    var list = h("div", { class: "col gap" });
    function draw() {
      list.innerHTML = ""; var term = (q.value || "").trim(); A.coQ = term;
      var arr = CO.filter(function (c) { return !term || (c.fa + " " + (c.en || "") + " " + (c.def || "") + " " + (c.crit || "")).indexOf(term) >= 0; });
      if (cid && CM[cid] && !term) arr = [CM[cid]].concat(arr.filter(function (c) { return c.id !== cid; }));
      list.appendChild(h("p", { class: "small muted" }, fa(arr.length) + " مفهوم"));
      arr.slice(0, term || cid ? 400 : 400).forEach(function (c) { list.appendChild(coCard(c, c.id === cid)); });
    }
    q.addEventListener("input", A.debounce(draw, 200));
    root.appendChild(h("div", { class: "row gap" }, q)); root.appendChild(list); draw();
    return root;
  };
  function coCard(c, open) {
    return h("details", { class: "card co", open: open || null, id: "co-" + c.id }, h("summary", {}, h("strong", {}, c.fa), c.en ? h("span", { class: "muted small" }, " · " + c.en) : null),
      para(c.def),
      c.crit ? h("p", {}, h("strong", {}, "ملاک تشخیص: "), c.crit) : null,
      c.conf ? h("p", {}, h("strong", {}, "اشتباه رایج: "), c.conf) : null,
      c.ex ? h("p", {}, h("strong", {}, "مثال: "), c.ex) : null,
      (c.vs || []).length ? h("div", { class: "row gap wrap" }, h("span", { class: "small" }, "در برابرِ: "), c.vs.map(coLink)) : null,
      (c.st || []).length ? h("div", { class: "row gap wrap" }, h("span", { class: "small" }, "ایستگاه‌ها: "), c.st.map(A.stLink)) : null,
      h("div", { class: "row gap wrap" }, (c.secs || []).map(secChip)),
      h("button", { class: "btn ghost sm", onclick: function () { A.toNursery(c.fa + ": " + (c.def || "").split("\n")[0].slice(0, 300), "concept", { t: "eco", id: c.id, label: "مفهوم جزوه معرفت‌شناسی: " + c.fa }); A.toast("به نهالستان مزرعه رفت تا در درخت خودش جای بگیرد."); } }, "کاشت در مزرعه (برای یادگیری عمیق)"));
  }

  /* ---------- متن جزوه ---------- */
  A.V.e_book = function (sec) {
    var root = h("div", { class: "page" });
    root.appendChild(A.head("کارخانه معرفت‌شناسی", "متن کامل جزوه", "متن کامل جزوه، بی‌هیچ تغییری. زیر عنوان هر بخش نوشته شده آن بخش کجای کارخانه به کار رفته است."));
    ensureCSS();
    var box = h("div", { class: "epibook full" }); box.innerHTML = BOOK.html;
    Array.prototype.forEach.call(box.querySelectorAll("h3[id^='eb-s']"), function (h3) {
      var sid = h3.id.slice(3), us = uniqUse(sid);
      var bar = h("div", { class: "usebar" }, h("b", { class: "secno", title: "شماره این بخش در ارجاع‌های کارخانه" }, "§" + fa(sid.slice(1))), h("span", { class: "small" }, us.length ? "به کار رفته در: " : "⚠ این بخش هنوز جایی به کار نرفته"), us.slice(0, 18).map(function (u) {
        if (u.k === "st") return A.stLink(u.id);
        if (u.k === "co") return coLink(u.id);
        if (u.k === "dos") return h("button", { class: "tlink", onclick: function () { A.go("e_dos", u.id); } }, "پرونده: " + u.l);
        if (u.k === "dr") return h("button", { class: "tlink", onclick: function () { A.go("e_st", u.id, "drill"); } }, "تمرین: " + u.l);
        return null;
      }), us.length > 18 ? h("span", { class: "small muted" }, " و " + fa(us.length - 18) + " مورد دیگر") : null,
        (function () { var rs = (window.EPI_RULES || []).filter(function (r) { return (r.sec || []).indexOf(sid) >= 0; }); return rs.length && A.ruleChip ? h("span", { class: "small" }, " · قاعده‌های بک‌تست: ", rs.slice(0, 8).map(function (r) { return A.ruleChip(r.id); })) : null; })(),
        (function () { var er = A.epiErrata ? A.epiErrata(sid) : []; return er.length ? h("span", { class: "chip bad", title: er.map(function (a) { return a.note; }).join(" | ") }, "⚠ " + fa(er.length) + " ایراد ثبت‌شده به استناد بک‌تست") : null; })());
      h3.parentNode.insertBefore(bar, h3.nextSibling);
    });
    wireLinks(box);
    root.appendChild(box);
    if (sec) setTimeout(function () { var t = box.querySelector("#eb-" + CSS.escape(sec)); if (t) t.scrollIntoView({ block: "start" }); }, 30);
    return root;
  };

  /* ---------- پرونده‌های پشتوانه ---------- */
  A.V.e_dos = function (did) {
    var root = h("div", { class: "page" });
    root.appendChild(A.head("کارخانه معرفت‌شناسی", "پرونده‌های پشتوانه", "بخش‌های روایی و تاریخی جزوه، نمودارها و پانوشت‌ها که به ایستگاه تبدیل نشده‌اند ولی برای مطالعه اینجا نگه داشته شده‌اند."));
    DOS.forEach(function (d) {
      root.appendChild(h("details", { class: "card", open: did === d.id || null, id: "dos-" + d.id }, h("summary", {}, h("strong", {}, d.fa)),
        h("p", { class: "small muted" }, d.role), h("ul", {}, (d.points || []).map(function (p) { return h("li", {}, p); })),
        h("div", { class: "row gap wrap" }, (d.secs || []).map(secChip)), (d.st || []).length ? h("div", { class: "row gap wrap" }, h("span", { class: "small" }, "ایستگاه‌ها: "), d.st.map(A.stLink)) : null));
    });
    if (did) setTimeout(function () { var t = document.getElementById("dos-" + did); if (t) t.scrollIntoView({ block: "start" }); }, 30);
    return root;
  };

  /* ---------- پوشش و ملاحظات ---------- */
  A.V.e_cov = function (arg, tab) {
    tab = tab || "cov";
    var root = h("div", { class: "page" });
    root.appendChild(A.head("کارخانه معرفت‌شناسی", "پوشش و ملاحظات متن", "دو بررسی روی جزوه: آیا بخشی از آن در کارخانه جا افتاده است؟ و کجاها خود متن ناسازگاری داشت که هنگام ساخت دیده شد."));
    root.appendChild(A.tabs([["cov", "پوشش بخش‌ها"], ["notes", "ملاحظات متن (" + fa(E.NOTES.length) + ")"]], tab, function (k) { A.go("e_cov", null, k); }));
    if (tab === "notes") {
      root.appendChild(h("p", { class: "small muted" }, "متن جزوه تغییر نکرده. هر مورد: آنچه در متن هست، و تصمیمی که سامانه هنگام عملیاتی‌سازی گرفته."));
      E.NOTES.slice().sort(function (a, b) { return (+a.sec.slice(1) || 0) - (+b.sec.slice(1) || 0); }).forEach(function (n) { root.appendChild(h("section", { class: "card" }, secChip(n.sec), h("p", {}, n.txt), h("p", { class: "small" }, h("strong", {}, "تصمیم سامانه: "), n.dec))); });
      return root;
    }
    var secs = Object.keys(BOOK.sec), miss = secs.filter(function (s) { return !uniqUse(s).length; });
    root.appendChild(h("section", { class: "stats" },
      h("div", { class: "stat" }, h("div", { class: "sl" }, "بخش‌های جزوه"), h("div", { class: "sv" }, fa(secs.length))),
      h("div", { class: "stat" }, h("div", { class: "sl" }, "بخش‌های به‌کاررفته"), h("div", { class: "sv" }, fa(secs.length - miss.length))),
      h("div", { class: "stat" }, h("div", { class: "sl" }, "ایستگاه / مفهوم / پرسش تمرین / پرونده پشتوانه"), h("div", { class: "sv" }, fa(ST.length) + " / " + fa(CO.length) + " / " + fa(DR.reduce(function (a, d) { return a + d.items.length; }, 0)) + " / " + fa(DOS.length)))));
    var byCh = {}; secs.forEach(function (s) { var c = BOOK.sec[s].chn; (byCh[c] = byCh[c] || []).push(s); });
    BOOK.ch.forEach(function (ch) {
      root.appendChild(h("section", { class: "card" }, h("h3", {}, "فصل " + fa(ch.n) + " · " + ch.title), h("div", { class: "scrollx" }, h("table", { class: "wt cov" }, h("tbody", {}, (byCh[ch.n] || []).map(function (s) {
        var us = uniqUse(s), cnt = { st: 0, co: 0, dos: 0, dr: 0 }; us.forEach(function (u) { cnt[u.k.replace("stm", "st")]++; });
        return h("tr", { class: us.length ? "" : "bad" }, h("td", {}, secChip(s)), h("td", { class: "small" }, "ایستگاه " + fa(cnt.st) + " · مفهوم " + fa(cnt.co) + " · تمرین " + fa(cnt.dr) + " · پرونده " + fa(cnt.dos)),
          h("td", {}, us.filter(function (u) { return u.k === "st"; }).map(function (u) { return A.stLink(u.id); })));
      }))))));
    });
    return root;
  };
})(APP);
