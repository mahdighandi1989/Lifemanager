/* ===== دورهٔ گام‌به‌گامِ کارخانهٔ معرفت‌شناسی =====
   چرا (مالک ۲۰۲۶-۱۰-۱۲): «آدم را وسطِ اقیانوس می‌اندازد؛ فقط متن است، نه مسیری، نه تعاملی». این دوره همان ایستگاه‌های کارخانه را
   به ترتیبِ مسیرِ خودِ کارخانه (سالن‌ها به ترتیب، «حکم نهایی» همیشه آخر) یکی‌یکی جلو می‌برد، روی **یک ادعای واقعیِ خودت**
   (پروندهٔ دوره)، با همان الگوی ثابتِ دورهٔ یادگیری (a11_course.js):
     ۰ گرم‌کردن — بازیابیِ ایستگاه‌های قبلی با فاصلهٔ فزاینده (از تمرین‌ها، مثال‌ها و پرسشِ محوریِ خودِ ایستگاه‌ها)
     ۱ ببین و بفهم — پرسشِ محوری، چرایی، روش، جای ایستگاه روی نقشهٔ کارخانه، متنِ جزوه در کشوی کناری
     ۲ امتحان کن — تمرین با پاسخ‌نامهٔ خودِ کارخانه (EPI_DR) و شبیه‌سازهایی که توابعِ قطعیِ واقعیِ کارخانه را صدا می‌زنند
     ۳ انجام بده — همین ایستگاه روی پروندهٔ دوره، با کاربرگِ خودِ کارخانه (A.epiStationWS)
     ۴ بسنج و ببند — روبریکِ ایستگاه، نوشتن از حافظه، و زمان‌بندیِ گرم‌کردن
   خطوطِ قرمز: متنِ جزوه فقط نقل/باز می‌شود (A.secHTML)، هیچ پاسخ‌نامه‌ای ساخته نمی‌شود، هیچ قاعده/وزنی عوض نمی‌شود و
   هوش مصنوعی هیچ نقشی ندارد. شبیه‌سازها «تصویرِ آموزشی»اند و همین را روی خودشان می‌نویسند.
   قاعدهٔ ذخیره (مثلِ a11): دیدنِ یک قدم هیچ رکوردی نمی‌سازد؛ پروندهٔ کارخانه فقط با اولین ورودیِ واقعی ساخته می‌شود؛ هر تغییرِ
   واقعی یک نوشتن (تنها استثنا: لحظهٔ ساختِ پرونده، که پرونده و دوره هر کدام یک بار نوشته می‌شوند). */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, E = window.EPI, BOOK = window.EPI_BOOK || { sec: {} };
  if (!E || !A.ESTL || !A.EST || !A.routeOf) return;
  var SM = A.EST, FINAL = "st_final", REC = "epi_course";
  var RT = A.ESTL.filter(function (s) { return s.id !== FINAL; }).concat(SM[FINAL] ? [SM[FINAL]] : []);
  var DR = window.EPI_DR || [];
  var AL = E.CO_ALIAS || {};
  function co(id) { return (A.ECO || {})[AL[id] || id] || null; }

  /* ---------- درس‌ها و منزل‌ها ---------- */
  var INTRO_IDS = ["c_marefat", "c_tasavvor", "c_tasdiq", "c_huzuri", "c_husuli", "c_badihi", "c_nazari", "c_sedq", "c_sedq_akhlaqi", "c_tawjih", "c_daraje_etebar", "c_rah"];
  var INTRO = []; INTRO_IDS.forEach(function (id) { var c = co(id); if (c && INTRO.indexOf(c) < 0) INTRO.push(c); });
  var PAIRS = [["c_tasavvor", "c_tasdiq"], ["c_huzuri", "c_husuli"], ["c_badihi", "c_nazari"], ["c_sedq", "c_sedq_akhlaqi"]]
    .map(function (p) { return [co(p[0]), co(p[1])]; }).filter(function (p) { return p[0] && p[1] && p[0] !== p[1]; });
  var MANZ = [];
  if (INTRO.length) MANZ.push({ fa: "پایه: واژه‌های بنیادی", goal: "پیش از ایستگاه‌ها، چند واژه‌ای که همهٔ کارخانه رویشان بنا شده: معرفت، تصور و تصدیق، علمِ حضوری و حصولی، بدیهی و نظری، صدق و درجهٔ اعتبار.", ids: ["intro"] });
  E.HALLS.forEach(function (H) {
    var ids = RT.filter(function (s) { return s.hall === H.n && s.id !== FINAL; }).map(function (s) { return s.id; });
    if (ids.length) MANZ.push({ hall: H.n, fa: "سالنِ " + fa(H.n) + " · " + H.fa, short: H.fa, goal: H.goal, ids: ids });
  });
  if (SM[FINAL]) MANZ.push({ end: true, hall: SM[FINAL].hall, fa: "پایانِ مسیر · " + SM[FINAL].fa, short: "حکمِ نهایی", goal: SM[FINAL].q, ids: [FINAL] });
  var LESSONS = [], LIDX = {};
  MANZ.forEach(function (m, mi) { m.n = mi; m.ids.forEach(function (id, i) { LIDX[id] = LESSONS.length; LESSONS.push({ id: id, m: mi, mi: i, mn: m.ids.length, intro: id === "intro" }); }); });
  A.EPI_COURSE_LESSONS = LESSONS;
  function lname(id) { return id === "intro" ? "واژه‌های بنیادی" : (SM[id] || {}).fa || id; }
  function drillsOf(sid) { var out = []; DR.forEach(function (d) { if (d.st === sid) d.items.forEach(function (it) { out.push({ it: it, did: d.id }); }); }); return out; }
  function featsOf(sid) { return (window.EPI_FEAT || []).filter(function (d) { return d.st === sid; }); }

  /* ---------- زمانِ تقریبیِ هر درس: از روی اندازهٔ واقعیِ خودِ درس ----------
     خواندنِ قدمِ ۱ (پرسش، چرایی، روش، خروجی)، تمرینِ قدمِ ۲ (موردهای پاسخ‌نامه‌دار + شبیه‌ساز)، فیلدهای کاربرگِ قدمِ ۳، قدمِ ۴.
     کف = فقط فیلدهای الزامی (در ایستگاهِ شرطی: فقط سنجیدنِ شرط)؛ سقف = همهٔ فیلدها. وزن‌ها تخمینِ دقیقه‌اند، نه اندازه‌گیری. */
  var FW = { text: 1.5, area: 2.5, list: 3, table: 4, chain: 4, tree: 5, graph: 4, sel: 0.5, checks: 1, lock: 2.5, scale: 0.5, info: 0.5 };
  function r5(x) { return Math.max(5, Math.round(x / 5) * 5); }
  function lessonMin(id) {
    if (id === "intro") {
      var rd = INTRO.map(function (c) { return (c.def || "") + (c.crit || ""); }).join("").length / 900;
      return [r5(3 + rd + 5 + 5 + 3), r5(3 + rd + 5 + 7 + 3)];
    }
    var s = SM[id], read = [s.q, s.why, s.out].concat(s.method || []).join(" ").length / 900;
    var dn = Math.min(6, drillsOf(id).length), fixed = 3 + read + (dn ? dn * 0.8 : 4) + (SIM[id] ? 5 : 0) + 4, lo = 0, hi = 0;
    s.ws.forEach(function (f) { var m = FW[f.t] || 2; hi += m; if (f.req) lo += m; });
    if (s.route === "cond") lo = 2;
    return [r5(fixed + lo), r5(fixed + hi)];
  }
  function minText(id) { var m = lessonMin(id); return m[0] === m[1] ? "حدودِ " + fa(m[0]) + " دقیقه" : "حدودِ " + fa(m[0]) + " تا " + fa(m[1]) + " دقیقه"; }
  function courseSpan() { var lo = 1e9, hi = 0; LESSONS.forEach(function (l) { var m = lessonMin(l.id); lo = Math.min(lo, m[0]); hi = Math.max(hi, m[1]); }); return [lo, hi]; }
  A.epiLessonMinutes = lessonMin;

  /* ---------- وضعیت ---------- */
  var KEYS = ["done", "warm", "step", "recall", "na", "tried", "rub", "intro"];
  function st() {
    var c = S.get(REC);
    if (!c) c = { id: REC, type: "epi_course", claim: "", title: "", caseId: "" };
    KEYS.forEach(function (k) { c[k] = c[k] || {}; });
    return c;
  }
  var soonT = null;
  function save(c) { if (soonT) { clearTimeout(soonT); soonT = null; } S.put(c); }
  function saveSoon(c) { if (soonT) clearTimeout(soonT); soonT = setTimeout(function () { soonT = null; S.put(c); }, 400); }
  function nDone(c) { return Object.keys(c.done).filter(function (k) { return LIDX[k] != null; }).length; }
  function nextLesson(c) { for (var i = 0; i < LESSONS.length; i++) if (!c.done[LESSONS[i].id]) return LESSONS[i]; return null; }
  function pct(c) { return Math.round(100 * nDone(c) / LESSONS.length); }
  function progressText(c) { return h("span", { dir: "rtl" }, fa(nDone(c)) + " از " + fa(LESSONS.length) + " درس · " + fa(pct(c)) + "٪ از دوره"); }
  function claimShort(c, n) { var t = String(c.claim || "").replace(/\s+/g, " ").trim(); n = n || 70; return t.length > n ? t.slice(0, n) + "…" : t; }
  A.epiCourseState = function () { return S.get(REC) ? st() : null; };
  A.epiCourseNext = function () { var c = S.get(REC); return c && c.claim ? nextLesson(st()) : null; };
  function markTry(id, k) { var c = st(); if (c.tried[id] && c.tried[id][k]) return; c.tried[id] = c.tried[id] || {}; c.tried[id][k] = 1; if (S.get(REC)) save(c); }

  /* ---------- پروندهٔ دوره: تا اولین ورودیِ واقعی فقط در حافظه ---------- */
  var memCase = null;
  function caseOf(c) { var cs = c.caseId && S.get(c.caseId); return cs && cs.type === "case" ? cs : null; }
  function caseLost(c) { return !!(c.caseId && !caseOf(c)); }
  function caseHandle(c) {
    var cs = caseOf(c);
    if (cs) return { cs: cs, live: true, put: function () { S.put(cs); } };
    if (!memCase || memCase._claim !== c.claim) {
      memCase = { id: "", type: "case", title: c.title || claimShort(c, 50), mode: "full", status: "open", st: {}, inc: {}, outcome: {}, _claim: c.claim };
      memCase.st.st_intake = { data: { title: c.title || claimShort(c, 50), input: c.claim, kind: "", special: "" }, done: false, rubric: [] };
    }
    var hd = { cs: memCase, live: false };
    hd.put = function () {
      if (hd.live) { S.put(hd.cs); return; }
      var m = hd.cs, it = (m.st.st_intake && m.st.st_intake.data) || {};
      var real = A.newCase({ title: it.title || m.title, input: it.input || c.claim, kind: it.kind || "", special: it.special || "", mode: "full",
        src: { t: "epi_course", id: REC, label: "دورهٔ گام‌به‌گامِ کارخانه" } });
      Object.keys(m.st).forEach(function (k) { real.st[k] = m.st[k]; });
      Object.keys(m.inc).forEach(function (k) { real.inc[k] = m.inc[k]; });
      S.put(real);
      hd.cs = real; hd.live = true; memCase = null;
      c.caseId = real.id; save(c);
    };
    return hd;
  }
  function routeRow(cs, sid) { return A.routeOf(cs).filter(function (x) { return x.s.id === sid; })[0] || { inRoute: false }; }

  /* ---------- کشوی کناری: متنِ جزوه و مفهوم، بی‌پرت‌شدن ---------- */
  function overlay(label, body) {
    var ov = h("div", { class: "overlay crs-peek ecrs-peek", role: "dialog", "aria-modal": "true", "aria-label": label, onclick: function (e) { if (e.target === ov) ov.remove(); } });
    // پیوندِ درونِ متنِ جزوه که به بیرونِ این برش می‌رود صفحه را عوض می‌کند؛ کشو هم بسته شود
    ov.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("a[data-eb]")) setTimeout(function () { if (A.state.view !== "epi_lesson") ov.remove(); }, 0); });
    ov.appendChild(h("div", { class: "dialog", dir: "rtl" }, body, h("div", { class: "row gap wrap mt" }, h("button", { class: "btn", onclick: function () { ov.remove(); } }, "بستن و ادامه"))));
    A.layer().appendChild(ov);
    return ov;
  }
  function peekSec(sec) {
    var s = BOOK.sec[sec];
    var ov = overlay("متنِ جزوه " + sec, h("div", {},
      h("div", { class: "eyebrow" }, "متنِ جزوه، دست‌نخورده · تو همین‌جا می‌مانی"),
      h("h3", {}, "§" + fa(sec.slice(1)) + (s ? " · " + s.title : "")),
      s ? h("p", { class: "small muted" }, "فصلِ " + fa(s.chn)) : null,
      A.secHTML ? A.secHTML(sec) : null,
      h("button", { class: "btn ghost sm", onclick: function () { ov.remove(); A.go("e_book", sec); } }, "متنِ کاملِ جزوه از همین‌جا (با «↩ برگرد» برمی‌گردی)")));
  }
  A.epiPeekSec = peekSec;
  function secBtn(sec, use) {
    var s = BOOK.sec[sec];
    return h("button", { class: "tlink sec", title: use || (s ? s.title : sec), onclick: function () { peekSec(sec); } }, h("b", {}, "§" + fa(sec.slice(1))), s ? " " + s.title.slice(0, 48) + (s.title.length > 48 ? "…" : "") : "");
  }
  function peekCo(c) {
    overlay(c.fa, h("div", {},
      h("div", { class: "eyebrow" }, "مفهومِ جزوه · نگاهِ کوتاه"),
      h("h3", {}, c.fa), String(c.def || "").split(/\n+/).filter(Boolean).map(function (p) { return h("p", {}, p); }),
      c.crit ? h("p", { class: "small" }, h("b", {}, "ملاکِ تشخیص: "), c.crit) : null,
      c.conf ? h("p", { class: "small" }, h("b", {}, "اشتباهِ رایج: "), c.conf) : null,
      c.ex ? h("p", { class: "small" }, h("b", {}, "مثال: "), c.ex) : null,
      (c.secs || []).length ? h("div", { class: "row gap wrap" }, c.secs.map(function (x) { return secBtn(x); })) : null));
  }
  function coBtn(c) { return h("button", { class: "tlink epico", onclick: function () { peekCo(c); } }, c.fa); }
  function para(t, cls) { return String(t || "").split(/\n+/).filter(Boolean).map(function (p) { return h("p", { class: cls || "" }, p); }); }
  function exBox(x) {
    return h("div", { class: "excard" }, h("div", { class: "row gap wrap" }, x.dom ? h("span", { class: "chip" }, x.dom) : null, x.src ? h("span", { class: "chip" + (/جزوه/.test(x.src) ? " good" : "") }, x.src) : null),
      h("p", {}, h("b", {}, "ورودی: "), x["in"]), h("p", {}, h("b", {}, "اجرا: "), x.walk), h("p", {}, h("b", {}, "نتیجه: "), x.out));
  }

  /* ---------- نقشهٔ کارخانه با 📍 ---------- */
  function hallMap(cur, c) {
    return h("div", {},
      h("div", { class: "ecrs-halls", role: "img", "aria-label": "نقشهٔ کارخانه؛ 📍 جای این درس" }, MANZ.filter(function (m) { return m.hall != null; }).map(function (m) {
        var on = m.ids.indexOf(cur) >= 0;
        return h("div", { class: "ecrs-hall" + (on ? " on" : "") + (m.end ? " end" : "") },
          h("div", { class: "ecrs-hallt" }, (on ? "📍 " : "") + (m.end ? "پایان" : "سالنِ " + fa(m.hall))),
          h("div", { class: "small muted ecrs-halln" }, m.short),
          h("div", { class: "ecrs-sts" }, m.ids.map(function (id) {
            var s = SM[id];
            return h("span", { class: "ecrs-st" + (id === cur ? " cur" : "") + (c.done[id] ? " done" : "") + (s.route === "cond" ? " cond" : ""), title: s.fa + (s.route === "cond" ? " (شرطی)" : "") + (c.done[id] ? " · تمام‌شده" : "") }, id === cur ? "📍" : c.done[id] ? "✓" : "");
          })));
      })),
      h("p", { class: "small muted" }, "هر خانه یک ایستگاه است: 📍 همین درس · ✓ تمام‌شده · خط‌چین = شرطی (فقط وقتی لازم شود). سالن‌ها به ترتیبِ شماره طی می‌شوند و «حکم نهایی» همیشه آخر است."));
  }

  /* ---------- شروع / عوض‌کردنِ ادعا ---------- */
  function stepIcons() {
    return h("div", { class: "crs-howgrid" }, [["۰", "گرم‌کردن", "چند پرسش از ایستگاه‌های قبل، از حافظه"], ["۱", "ببین و بفهم", "پرسشِ محوری، چرایی، روش، جای ایستگاه"], ["۲", "امتحان کن", "تمرین با پاسخ‌نامهٔ کارخانه و شبیه‌ساز"], ["۳", "انجام بده", "همین ایستگاه روی پرونده‌ات"], ["۴", "بسنج و ببند", "روبریک و نوشتن از حافظه"]].map(function (x) {
      return h("div", { class: "crs-howstep" }, h("span", { class: "n" }, x[0]), h("b", {}, x[1]), h("span", { class: "small muted" }, x[2]));
    }));
  }
  function onboarding(c, mode) {
    var root = h("div", { class: "page crs ecrs" }), span = courseSpan();
    if (mode === "new") {
      root.appendChild(A.head("کارخانهٔ معرفت‌شناسی · دورهٔ گام‌به‌گام", "از صفر، یک ایستگاه در هر بار", "این دوره همهٔ " + fa(RT.length) + " ایستگاهِ کارخانه را، به همان ترتیبی که یک پرونده از کارخانه می‌گذرد، در " + fa(MANZ.length) + " منزل و " + fa(LESSONS.length) + " درس جلو می‌برد. هر درس بسته به ایستگاهش " + fa(span[0]) + " تا " + fa(span[1]) + " دقیقه طول می‌کشد (زمانِ تقریبیِ هر درس سرِ خودش نوشته شده) و لازم نیست یک‌نفس تمامش کنی: همه‌چیز ذخیره می‌شود. لازم نیست جزوه را از قبل خوانده باشی؛ متنِ جزوه هر جا لازم شد در کشوی کناری باز می‌شود و تو همان‌جا می‌مانی."));
      root.appendChild(h("section", { class: "card" }, h("h2", {}, "هر درس همیشه همین پنج قدم است"), stepIcons(),
        h("p", { class: "small muted" }, "تمرین‌های قدمِ ۲ پاسخ‌نامهٔ خودِ کارخانه را دارند (همان تمرین‌های سنجشیِ ایستگاه‌ها). هیچ داوری‌ای را هوش مصنوعی نمی‌کند؛ حکمِ هر ایستگاه با خودِ توست.")));
      root.appendChild(h("section", { class: "card" }, h("h2", {}, "مسیر: " + fa(MANZ.length) + " منزل"), road(c, true)));
    } else {
      root.appendChild(A.head("کارخانهٔ معرفت‌شناسی · دورهٔ گام‌به‌گام", "عوض‌کردنِ ادعای دوره", null));
      root.appendChild(h("section", { class: "card soft" }, h("p", {}, "پیشرفتت سرِ جایش می‌ماند: ", progressText(c), ". پروندهٔ قبلی هم در «پرونده‌ها»ی کارخانه می‌ماند؛ درس‌های بعدی روی یک پروندهٔ تازه با ادعای تازه انجام می‌شوند.")));
    }
    var ti = h("input", { type: "text", id: "ecrsTitle", placeholder: "عنوانِ کوتاه (اختیاری)", value: mode === "change" ? "" : (c.title || "") });
    var ta = h("textarea", { id: "ecrsClaim", rows: 4, placeholder: "مثلاً: «کانالی گفت دلار تا آخرِ ماه بالا می‌رود»، «کارشناس ارزشِ ملکِ وثیقه را ۱۲ میلیون درهم برآورد کرده»، یا باوری از خودت" });
    if (mode !== "change") ta.value = c.claim || "";
    var going = nDone(c) > 0;
    root.appendChild(h("section", { class: "card crs-start" },
      h("h2", {}, mode === "new" ? "یک ادعای واقعی بنویس" : "ادعای تازه"),
      h("p", {}, "همهٔ قدم‌های «انجام بده» روی همین یک ادعا انجام می‌شوند: درس به درس، یک پروندهٔ واقعی در کارخانه پُر می‌شود. پس چیزی باشد که واقعاً برایت مهم است که بدانی چقدر معتبر است — یک خبر، گزارش، برداشت یا باورِ خودت."),
      h("label", { for: "ecrsClaim" }, "ادعا، خبر یا باور — همان‌طور که هست"), ta,
      h("label", { for: "ecrsTitle", class: "small" }, "عنوان"), ti,
      h("div", { class: "row gap wrap mt" }, h("button", { class: "btn", onclick: function () {
        var cl = ta.value.trim();
        if (cl.length < 8) { A.toast("ادعا را بنویس (دست‌کم یک جملهٔ کامل).", "bad"); ta.focus(); return; }
        c.claim = cl; c.title = ti.value.trim() || cl.slice(0, 50); c.started = c.started || A.today();
        if (mode === "change") { c.caseId = ""; memCase = null; }
        A._ecrsChange = false; save(c);
        if (going) A.go("epi_course"); else A.go("epi_lesson", LESSONS[0].id, "s1");
      } }, going ? "ادامهٔ دوره با این ادعا ←" : "شروعِ درسِ اول ←"),
        mode === "change" ? h("button", { class: "btn ghost", onclick: function () { A._ecrsChange = false; A.render(); } }, "انصراف — همان ادعای قبلی بماند") : null)));
    return root;
  }

  /* ---------- نقشهٔ دوره ---------- */
  function road(c, compact) {
    var nl = nextLesson(c);
    return h("ol", { class: "crs-road ecrs-road" + (compact ? " compact" : "") }, MANZ.map(function (m) {
      var done = m.ids.filter(function (id) { return c.done[id]; }).length, all = m.ids.length, here = nl && LESSONS[LIDX[nl.id]].m === m.n;
      return h("li", { class: "crs-stop" + (done === all ? " done" : "") + (here ? " here" : "") },
        h("div", { class: "crs-stopn" }, done === all ? "✓" : fa(m.n)),
        h("div", { class: "crs-stopb" },
          h("div", { class: "crs-stopt" }, (here ? "📍 " : "") + "منزلِ " + fa(m.n) + " · " + m.fa),
          h("div", { class: "crs-dots", "aria-label": fa(done) + " از " + fa(all) + " درس" }, m.ids.map(function (id) {
            var on = !!c.done[id], now = nl && nl.id === id;
            return h("button", { class: "crs-dot" + (on ? " on" : "") + (now ? " now" : ""), title: lname(id) + (on ? " (تمام‌شده)" : now ? " (درسِ بعدیِ تو)" : ""), "aria-label": lname(id),
              onclick: function () { if (c.claim) A.go("epi_lesson", id, c.step[id] || "s1"); } });
          })),
          compact ? null : h("div", { class: "small muted" }, fa(done) + " از " + fa(all) + " درس")));
    }));
  }
  A.V.epi_course = function () {
    var c = st();
    if (!c.claim) return onboarding(c, "new");
    if (A._ecrsChange) return onboarding(c, "change");
    var nl = nextLesson(c), cs = caseOf(c), warmDue = nl && gateOpen(c, nl.id);
    var root = h("div", { class: "page crs ecrs" });
    root.appendChild(A.head("کارخانهٔ معرفت‌شناسی · دورهٔ گام‌به‌گام", "نقشهٔ سفر", "کجای کارخانه‌ای، چقدر مانده، و قدمِ بعدی‌ات چیست."));
    root.appendChild(h("section", { class: "card crs-now" },
      h("div", { class: "crs-bar" }, h("i", { style: { width: pct(c) + "%" } })),
      h("div", { class: "row between wrap gap" },
        h("div", { class: "col" }, h("div", { class: "small muted" }, progressText(c)),
          h("div", { class: "small" }, "ادعای دوره: ", h("b", {}, "«" + claimShort(c, 90) + "»"), " ", h("button", { class: "linkish small", onclick: function () { A._ecrsChange = true; A.render(); } }, "(عوض کن)")),
          cs ? h("div", { class: "small" }, "پروندهٔ دوره در کارخانه: ", h("button", { class: "linkish small", onclick: function () { A.go("e_case", cs.id); } }, cs.title))
            : h("div", { class: "small muted" }, caseLost(c) ? "پروندهٔ قبلیِ دوره در کارخانه پیدا نشد (شاید حذف شده)؛ با اولین ورودی در قدمِ «انجام بده» یک پروندهٔ تازه با همین ادعا ساخته می‌شود." : "پروندهٔ دوره با اولین چیزی که در قدمِ «انجام بده» بنویسی در کارخانه ساخته می‌شود.")),
        nl ? h("div", { class: "col" },
          h("button", { class: "btn lg", onclick: function () { A.go("epi_lesson", nl.id, c.step[nl.id] || "s1"); } },
            warmDue ? "▶ ادامه: اول گرم‌کردنِ امروز، بعد درسِ " + fa(LIDX[nl.id] + 1) : "▶ ادامه: درسِ " + fa(LIDX[nl.id] + 1) + " — " + lname(nl.id)),
          h("span", { class: "small muted" }, "زمانِ تقریبیِ این درس: " + minText(nl.id)))
          : h("span", { class: "pill good" }, "دوره تمام شد 🎉"))));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "مسیر"), h("p", { class: "small muted" }, "هر خال یک درس (یک ایستگاه) است؛ پُر = تمام‌شده، 📍 = درسِ بعدیِ تو. روی هر خال بزنی همان درس باز می‌شود."), road(c, false)));
    var cm = nl ? MANZ[LESSONS[LIDX[nl.id]].m] : MANZ[MANZ.length - 1];
    root.appendChild(h("section", { class: "card" },
      h("h2", {}, "منزلِ " + fa(cm.n) + ": " + cm.fa), h("p", {}, cm.goal),
      h("ol", { class: "crs-wlist" }, cm.ids.map(function (id) {
        var s = SM[id];
        return h("li", { class: c.done[id] ? "on" : "" }, h("button", { class: "linkish", onclick: function () { A.go("epi_lesson", id, c.step[id] || "s1"); } }, (c.done[id] ? "✓ " : "") + lname(id)),
          h("span", { class: "small muted" }, s ? " — " + s.q.slice(0, 100) + (s.q.length > 100 ? "…" : "") + (s.route === "cond" ? " (شرطی)" : "") : " — " + fa(INTRO.length) + " مفهومِ پایه"));
      }))));
    return root;
  };

  /* ---------- گرم‌کردن: پرسش‌های کاربردی از دادهٔ خودِ ایستگاه‌ها ---------- */
  var GAPS = [1, 3, 7, 21, 60];
  function dueWarm(c, except) {
    var t = A.today();
    return Object.keys(c.done).filter(function (id) {
      if (id === except || LIDX[id] == null) return false;
      var w = c.warm[id] || { n: 0, due: A.addDays(c.done[id], 1) };
      return (w.due || "") <= t;
    }).sort(function (a, b) { return ((c.warm[a] || {}).due || c.done[a]) < ((c.warm[b] || {}).due || c.done[b]) ? -1 : 1; }).slice(0, 2);
  }
  function gateOpen(c, id) { var d = A.today(); return dueWarm(c, id).length > 0 && c.warmDay !== d && c.warmSkip !== d; }
  /* k: ۰ یک موردِ تمرینِ پاسخ‌نامه‌دار · ۱ یک مثالِ اجرای ایستگاه · ۲ پرسشِ محوری روی پروندهٔ خودت */
  function warmPrompt(id, c, w) {
    var turn = (w.log || []).length, k = (w.n || 0) % 3;
    if (id === "intro") {
      var p = PAIRS[(turn + (w.n || 0)) % Math.max(1, PAIRS.length)];
      if (!p) return { q: "بی‌نگاه: تصور و تصدیق چه فرقی دارند؟ در ادعای دوره‌ات هر کدام کجاست؟", a: function () { return h("p", {}, ""); } };
      return { q: "بی‌نگاه: فرقِ «" + p[0].fa + "» و «" + p[1].fa + "» چیست؟ برای هر کدام یک نمونه از ادعای دوره‌ات («" + claimShort(c, 60) + "») یا از زندگیِ خودت بیاور.",
        a: function () { return h("div", {}, p.map(function (x) { return h("p", { class: "small" }, h("b", {}, x.fa + ": "), String(x.def || "").split("\n")[0], x.crit ? h("span", { class: "muted" }, " — ملاک: " + x.crit) : null); })); } };
    }
    var s = SM[id], items = drillsOf(id), exs = s.examples || [];
    if (k === 0 && !items.length) k = 1;
    if (k === 1 && !exs.length) k = 2;
    if (k === 0) {
      var x = items[(turn * 5 + (w.n || 0)) % items.length].it;
      return { q: "بی‌نگاه به گزینه‌ها، از حافظه: " + x.q,
        a: function () { return h("div", {}, h("p", { class: "small good" }, h("b", {}, "پاسخِ درست (پاسخ‌نامهٔ کارخانه): "), x.opts[x.a]), h("p", { class: "small" }, x.why), x.sec ? secBtn(x.sec) : null); } };
    }
    if (k === 1) {
      var ex = exs[turn % exs.length];
      return { q: "این ورودی به ایستگاهِ «" + s.fa + "» رسیده: «" + ex["in"] + "» — بی‌نگاه بگو این ایستگاه با آن چه می‌کند و به چه نتیجه‌ای می‌رسد؟",
        a: function () { return h("div", {}, h("p", { class: "small" }, h("b", {}, "اجرا: "), ex.walk), h("p", { class: "small" }, h("b", {}, "نتیجه: "), ex.out)); } };
    }
    var cs = caseOf(c), mine = cs && cs.st && cs.st[id] && cs.st[id].data && cs.st[id].data.verdict;
    return { q: "روی ادعای دوره‌ات («" + claimShort(c, 60) + "»): پرسشِ محوریِ «" + s.fa + "» این است: «" + s.q + "» بی‌نگاه بگو جوابش در پرونده‌ات چه بود و با چه ملاکی به آن رسیدی.",
      a: function () { return h("div", {}, h("p", { class: "small" }, h("b", {}, "روشِ ایستگاه:")), flow(s.method), mine ? h("p", { class: "small" }, h("b", {}, "حکمی که خودت در پرونده ثبت کردی: "), mine) : h("p", { class: "small muted" }, "در پرونده‌ات حکمی برای این ایستگاه ثبت نشده (شاید شرطش برقرار نبود).")); } };
  }
  function warmStep(c, id, next, nextLabel, gated) {
    var ids = dueWarm(c, id), box = h("div", { class: "col gap" });
    if (gated) box.appendChild(h("section", { class: "card soft" }, h("b", {}, "پیش از ادامه: گرم‌کردنِ امروز موعد است. "), "چند دقیقه طول می‌کشد؛ بعدش مستقیم به همان قدمی می‌روی که می‌خواستی."));
    box.appendChild(h("p", { class: "lead small" }, "پیش از درسِ تازه، از حافظه: بی‌نگاه جواب بده، بعد پاسخ را ببین و صادقانه بگو چقدر یادت بود. پرسش‌ها از تمرین‌ها، مثال‌ها و پرسشِ محوریِ همان ایستگاه‌هایی است که تمام کرده‌ای، و هر بار که یادت باشد فاصله‌اش بیشتر می‌شود (۱، ۳، ۷، ۲۱، ۶۰ روز)."));
    if (!ids.length) { box.appendChild(A.empty("امروز چیزی برای گرم‌کردن موعد نیست.", h("button", { class: "btn", onclick: next }, nextLabel))); return box; }
    var graded = {};
    ids.forEach(function (wid) {
      var w0 = c.warm[wid] || {}, P = warmPrompt(wid, c, w0);
      var ta = h("textarea", { rows: 3, placeholder: "پاسخِ تو، از حافظه…", "aria-label": P.q });
      if (w0.draft && w0.draft.d === A.today()) ta.value = w0.draft.txt || "";
      ta.addEventListener("input", function () { var w = c.warm[wid] || (c.warm[wid] = { n: 0, due: A.addDays(c.done[wid], 1) }); w.draft = { d: A.today(), txt: ta.value }; saveSoon(c); });
      var log = (w0.log || []).slice(-1)[0];
      var ans = h("div", { class: "crs-reveal hidden" }, P.a(),
        log && log.txt ? h("details", { class: "small" }, h("summary", {}, "پاسخِ قبلیِ خودت (" + A.fdate(log.d) + ")"), h("p", {}, log.txt)) : null,
        h("div", { class: "row gap wrap" }, [["یادم بود", 2], ["تا حدودی", 1], ["یادم نبود", 0]].map(function (g) {
          return h("button", { class: "btn sm" + (g[1] === 2 ? "" : " ghost"), onclick: function (e) {
            var w = c.warm[wid] || { n: 0 };
            w.n = g[1] === 2 ? (w.n || 0) + 1 : g[1] === 1 ? Math.max(0, (w.n || 0)) : 0;
            w.due = A.addDays(A.today(), GAPS[Math.min(w.n, GAPS.length - 1)] * (g[1] === 1 ? 0.5 : 1) | 0 || 1);
            w.last = A.today(); w.g = g[1];
            (w.log = w.log || []).push({ d: A.today(), g: g[1], q: P.q.slice(0, 200), txt: ta.value.trim() });
            if (w.log.length > 20) w.log = w.log.slice(-20);
            delete w.draft;
            c.warm[wid] = w; graded[wid] = 1;
            if (ids.every(function (x) { return graded[x]; })) c.warmDay = A.today();
            save(c);
            e.target.parentNode.replaceWith(h("p", { class: "small muted" }, "ثبت شد (پاسخت هم ذخیره شد)؛ دفعهٔ بعد: " + A.fdate(w.due)));
          } }, g[0]);
        })));
      box.appendChild(h("section", { class: "card" }, h("h3", {}, "«" + lname(wid) + "»"), h("p", { class: "small" }, P.q), ta,
        h("button", { class: "btn ghost sm mt", onclick: function (e) { ans.classList.remove("hidden"); e.target.remove(); } }, "پاسخ را نشان بده"), ans));
    });
    box.appendChild(h("div", { class: "row gap wrap" },
      h("button", { class: "btn", onclick: function () {
        var left = ids.filter(function (x) { return !graded[x]; }).length;
        if (left) { A.toast("هنوز به " + fa(left) + " پرسش نمره نداده‌ای: پاسخ را ببین و بگو چقدر یادت بود — یا «فعلاً رد کن» را بزن.", "bad"); return; }
        next();
      } }, nextLabel),
      h("button", { class: "btn ghost crs-skipwarm", onclick: function () { c.warmSkip = A.today(); save(c); next(); } }, "فعلاً رد کن (این پرسش‌ها موعد می‌مانند و دفعهٔ بعد دوباره می‌آیند)")));
    return box;
  }

  /* ---------- قدمِ ۱: ببین و بفهم ---------- */
  function flow(list) { return h("ol", { class: "crs-flow" }, (list || []).map(function (s, i) { return h("li", {}, h("span", { class: "n" }, fa(i + 1)), h("span", {}, s)); })); }
  function seeIntro(c) {
    var box = h("div", { class: "col gap" });
    box.appendChild(h("section", { class: "card crs-def" }, h("div", { class: "eyebrow" }, "چرا از این‌جا"), h("p", { class: "big" }, "کارخانه دربارهٔ «تصدیق‌ها» داوری می‌کند؛ و تصدیقی را که تصورهایش روشن نیست نمی‌شود سنجید. پس اول چند واژه‌ای که همهٔ ایستگاه‌ها با آن‌ها کار می‌کنند.")));
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "کارخانه در یک نگاه"), hallMap("", c)));
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "واژه‌های بنیادی (تعریف‌ها عینِ دادهٔ کارخانه از روی جزوه)"),
      h("div", { class: "col gap" }, INTRO.map(function (x) {
        return h("details", { class: "ecrs-co" }, h("summary", {}, h("b", {}, x.fa), x.en ? h("span", { class: "small muted", dir: "ltr" }, " · " + x.en) : null),
          para(x.def, "small"), x.crit ? h("p", { class: "small" }, h("b", {}, "ملاکِ تشخیص: "), x.crit) : null, x.conf ? h("p", { class: "small" }, h("b", {}, "اشتباهِ رایج: "), x.conf) : null,
          (x.secs || []).length ? h("div", { class: "row gap wrap" }, x.secs.map(function (sc) { return secBtn(sc); })) : null);
      }))));
    box.appendChild(h("section", { class: "card soft" }, h("p", { class: "small" }, "هر «§» متنِ دست‌نخوردهٔ همان بخشِ جزوه را در کشوی کناری باز می‌کند؛ از درس بیرون نمی‌روی.")));
    return box;
  }
  function seeStep(s, c) {
    var box = h("div", { class: "col gap" });
    box.appendChild(h("section", { class: "card crs-def" }, h("div", { class: "eyebrow" }, "پرسشِ محوریِ این ایستگاه"), h("p", { class: "big" }, s.q)));
    var H = E.HALLS[s.hall] || {};
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "جای این ایستگاه در کارخانه"), hallMap(s.id, c),
      h("p", { class: "small" }, h("b", {}, s.id === FINAL ? "پایانِ مسیر: " : "سالنِ " + fa(s.hall) + " · " + H.fa + ": "), s.id === FINAL ? "همهٔ درجه‌ها را کنارِ هم می‌گذارد و پرونده را می‌بندد؛ برای همین همیشه آخرین ایستگاه است." : H.goal),
      h("p", { class: "small muted" }, s.route === "cond" ? "شرطی — فقط وقتی لازم است: " + (s.cond || "") : "همیشگی — در هر پرونده اجرا می‌شود.")));
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "چرا این ایستگاه؟"), para(s.why)));
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "اجرایش، قدم‌به‌قدم"), flow(s.method), s.out ? h("p", { class: "small" }, h("b", {}, "خروجی: "), s.out) : null));
    if ((s.basis || []).length) box.appendChild(h("section", { class: "card" }, h("h3", {}, "پشتوانه در جزوه"),
      h("p", { class: "small muted" }, "متنِ دست‌نخوردهٔ جزوه در کشوی کناری باز می‌شود؛ همین‌جا می‌مانی."),
      h("ul", { class: "plain" }, s.basis.map(function (b) { return h("li", {}, secBtn(b.sec, b.use), h("div", { class: "small muted" }, b.use)); }))));
    var cos = Object.keys(A.ECO || {}).map(function (k) { return A.ECO[k]; }).filter(function (x) { return (x.st || []).indexOf(s.id) >= 0; });
    if (cos.length) box.appendChild(h("details", { class: "card" }, h("summary", {}, "مفاهیمِ این ایستگاه (" + fa(cos.length) + ") — اختیاری"), h("div", { class: "row gap wrap" }, cos.map(coBtn))));
    if ((s.mistakes || []).length) box.appendChild(h("details", { class: "card" }, h("summary", {}, "خطاهای رایج در اجرا (اختیاری)"), h("ul", {}, s.mistakes.map(function (m) { return h("li", { class: "small" }, h("b", {}, m.e), " — ", m.fix, m.sec ? " " : null, m.sec ? secBtn(m.sec) : null); }))));
    if (s.philo) box.appendChild(h("details", { class: "card" }, h("summary", {}, "فلسفهٔ ایستگاه (اختیاری)"), para(s.philo, "small")));
    if ((s.examples || []).length) box.appendChild(h("details", { class: "card" }, h("summary", {}, "یک نمونهٔ اجرا ببین (اختیاری)"), exBox(s.examples[0])));
    return box;
  }

  /* ---------- قدمِ ۲: امتحان کن ---------- */
  /* تمرین با پاسخ‌نامهٔ خودِ کارخانه (EPI_DR): هر بار تا ۶ موردِ تصادفی؛ بازخوردِ فوری با توضیح و بخشِ جزوه */
  function drillCard(s) {
    var pool = drillsOf(s.id); if (!pool.length) return null;
    var box = h("section", { class: "card drill ecrs-drill" });
    function draw() {
      box.innerHTML = "";
      var pick = A.shuffle(pool.slice()).slice(0, Math.min(6, pool.length)), score = 0, done = 0;
      var prog = h("p", { class: "small muted" }, "هر مورد را جواب بده؛ درستی، توضیح و بخشِ جزوه بلافاصله می‌آید.");
      box.appendChild(h("div", { class: "row between wrap" }, h("h3", {}, "تمرین با پاسخ‌نامهٔ کارخانه"), h("span", { class: "pill" }, fa(pick.length) + " مورد از " + fa(pool.length))));
      box.appendChild(prog);
      pick.forEach(function (x, n) {
        var ord = A.shuffle(x.it.opts.map(function (_, k) { return k; })), fb = h("div", { class: "dfb" }), answered = false;
        var opts = h("div", { class: "dopts" }, ord.map(function (k) {
          return h("button", { class: "dopt", onclick: function () {
            if (answered) return; answered = true; done++;
            var ok = k === x.it.a; if (ok) score++;
            Array.prototype.forEach.call(opts.children, function (b, j) { b.disabled = true; var kk = ord[j]; if (kk === x.it.a) b.classList.add("right"); else if (kk === k) b.classList.add("wrong"); });
            fb.appendChild(h("div", { class: ok ? "good" : "bad" }, ok ? "✓ درست." : "✗ نادرست — گزینهٔ درست سبز شده."));
            fb.appendChild(h("div", { class: "small" }, x.it.why));
            if (x.it.sec) fb.appendChild(secBtn(x.it.sec));
            prog.textContent = fa(done) + " از " + fa(pick.length) + " · درست: " + fa(score);
            if (done === pick.length) {
              S.put({ id: A.uid("edr"), type: "edrill", did: x.did, st: s.id, score: score, n: pick.length, course: true });
              markTry(s.id, "drill");
              box.appendChild(h("div", { class: "card soft" }, h("b", {}, "نتیجه: " + fa(score) + " از " + fa(pick.length) + " (" + fa(Math.round(100 * score / pick.length)) + "٪)"),
                h("p", { class: "small" }, score / pick.length >= 0.85 ? "ملاک‌های این ایستگاه را درست به کار می‌بری." : "موردهای نادرست را با بخشِ جزوه‌شان یک بار دیگر بخوان؛ بعد دوباره امتحان کن (موردها و ترتیبِ گزینه‌ها هر بار عوض می‌شوند)."),
                h("button", { class: "btn ghost sm", onclick: draw }, "دوباره، با موردهای دیگر")));
            }
          } }, x.it.opts[k]);
        }));
        box.appendChild(h("div", { class: "ditem" }, h("div", { class: "dq" }, h("b", {}, fa(n + 1) + ". "), x.it.q), opts, fb));
      });
    }
    draw();
    return box;
  }
  /* «اول خودت، بعد مقایسه» روی مثال‌های خودِ ایستگاه (برای ایستگاهی که تمرینِ پاسخ‌نامه‌دار ندارد) */
  function exampleTry(s) {
    var exs = (s.examples || []).slice(0, 2); if (!exs.length) return null;
    return h("section", { class: "card" }, h("h3", {}, "اول خودت، بعد مقایسه"),
      h("p", { class: "small muted" }, "این ایستگاه تمرینِ سنجشی با پاسخ‌نامه ندارد (کارش جمع‌بندی و حکم است، نه به‌کاربستنِ یک ملاکِ جداگانه). به‌جایش: ورودیِ هر نمونه را بخوان، بنویس خودت چه می‌کردی، بعد اجرای نمونه را ببین. چیزی ذخیره نمی‌شود."),
      exs.map(function (x) {
        var ta = h("textarea", { rows: 3, placeholder: "خودت با این ورودی چه می‌کردی و به چه حکمی می‌رسیدی؟", "aria-label": "پاسخِ تو به نمونه" });
        var rev = h("div", { class: "crs-reveal hidden" }, h("p", { class: "small" }, h("b", {}, "اجرا: "), x.walk), h("p", { class: "small" }, h("b", {}, "نتیجه: "), x.out));
        return h("div", { class: "crs-spot" }, h("p", {}, h("b", {}, "ورودی: "), x["in"]), ta,
          h("button", { class: "btn ghost sm mt", onclick: function (e) { if (ta.value.trim().length < 5) { A.toast("اول چیزی بنویس — تلاشِ خودت مهم است، نه کامل‌بودنش.", "bad"); return; } rev.classList.remove("hidden"); e.target.remove(); markTry(s.id, "ex"); } }, "مقایسه کن"), rev);
      }));
  }
  /* درسِ پایه: «این ملاک مالِ کدام مفهوم است؟» — پاسخ همان مفهومی است که داده این ملاک را برایش ثبت کرده */
  function conceptMatch() {
    var set = INTRO.filter(function (x) { return x.crit || x.def; });
    if (set.length < 4) return null;
    var box = h("section", { class: "card ecrs-drill" });
    function mask(t, x) { return String(t || "").split("\n")[0].split(x.fa).join("[…]"); }
    function draw() {
      box.innerHTML = "";
      var pick = A.shuffle(set.slice()).slice(0, 6), right = 0, left = pick.length, out = h("p", { class: "small muted" }, "نامِ خودِ مفهوم با [...] پوشانده شده.");
      box.appendChild(h("h3", {}, "این ملاکِ تشخیص مالِ کدام مفهوم است؟"));
      box.appendChild(out);
      pick.forEach(function (x, n) {
        var others = A.shuffle(set.filter(function (y) { return y !== x; })).slice(0, 3), opts = A.shuffle(others.concat([x])), fb = h("div", { class: "dfb" }), answered = false;
        var ob = h("div", { class: "dopts" }, opts.map(function (o) {
          return h("button", { class: "dopt", onclick: function () {
            if (answered) return; answered = true; left--;
            var ok = o === x; if (ok) right++;
            Array.prototype.forEach.call(ob.children, function (b, j) { b.disabled = true; if (opts[j] === x) b.classList.add("right"); else if (opts[j] === o) b.classList.add("wrong"); });
            fb.appendChild(h("div", { class: ok ? "good" : "bad" }, (ok ? "✓ درست — " : "✗ نه — ") + "این ملاکِ «" + x.fa + "» است."));
            fb.appendChild(h("div", { class: "small" }, String(x.def || "").split("\n")[0]));
            if ((x.secs || [])[0]) fb.appendChild(secBtn(x.secs[0]));
            if (!left) { out.textContent = fa(right) + " از " + fa(pick.length) + " درست."; out.className = "small " + (right === pick.length ? "good" : "warn"); markTry("intro", "match");
              box.appendChild(h("button", { class: "btn ghost sm", onclick: draw }, "دوباره، با مفهوم‌های دیگر")); }
          } }, o.fa);
        }));
        box.appendChild(h("div", { class: "ditem" }, h("div", { class: "dq" }, h("b", {}, fa(n + 1) + ". "), mask(x.crit || x.def, x)), ob, fb));
      });
    }
    draw();
    return box;
  }
  function tryStep(s) {
    var box = h("div", { class: "col gap" }), sim = SIM[s.id];
    if (sim) box.appendChild(h("section", { class: "card crs-sim" }, h("div", { class: "eyebrow" }, "شبیه‌ساز · تصویرِ آموزشی"), h("h3", {}, sim.title), sim.draw(), h("p", { class: "small muted" }, sim.note)));
    var d = drillCard(s); if (d) box.appendChild(d);
    else { var e = exampleTry(s); if (e) box.appendChild(e); }
    if (!sim && !d && !(s.examples || []).length) box.appendChild(A.empty("برای این ایستگاه تمرینِ کوتاهِ جداگانه‌ای نیست؛ در قدمِ ۳ روی پرونده‌ات تمرینش کن."));
    return box;
  }

  /* ---------- قدمِ ۳: انجام بده ---------- */
  var INTRO_WS = [
    { k: "tasavvor", t: "area", req: true, l: "تصورهای کلیدیِ ادعایت: کدام واژه‌ها باید دقیق فهمیده شوند تا بشود ادعا را سنجید؟", h: "مثلاً در «دلار تا آخرِ ماه بالا می‌رود»: «دلار» (کدام نرخ؟)، «بالا رفتن» (چقدر؟ نسبت به چه؟)" },
    { k: "tasdiq", t: "area", req: true, l: "خودِ حکم: ادعایت دقیقاً چه چیزی را دربارهٔ چه چیزی تصدیق می‌کند؟ (در یک جمله، طوری که بشود درست یا نادرستش دانست)" },
    { k: "rah", t: "text", l: "حدسِ اولیه: این ادعا از چه راهی به تو رسیده؟ (دیدن، شنیدن از دیگران، استدلال، کارشناس، …) — اختیاری" }
  ];
  function doIntro(c, ctl) {
    var box = h("div", { class: "col gap" });
    box.appendChild(h("section", { class: "card soft" }, h("p", {}, "پیش از ایستگاه‌ها، همین واژه‌ها را روی ادعای خودت به کار ببر: ", h("b", {}, "«" + claimShort(c, 120) + "»"), ". فیلدهای ستاره‌دار لازم‌اند؛ هر چه بنویسی خودکار ذخیره می‌شود.")));
    var ws = A.renderWS(INTRO_WS, c.intro, function () { saveSoon(c); }, { prefix: "ecrs_intro" });
    ctl.validate = function () { return ws._validate(); };
    box.appendChild(h("section", { class: "card wsform" }, ws));
    return box;
  }
  function doStep(s, c, ctl) {
    var hd = caseHandle(c), cs = hd.cs, row = routeRow(cs, s.id);
    var box = h("div", { class: "col gap" });
    box.appendChild(h("section", { class: "card soft" },
      h("p", {}, "حالا «" + s.fa + "» را روی پروندهٔ خودت اجرا کن: ", h("b", {}, "«" + claimShort(c, 120) + "»"), "."),
      hd.live ? h("p", { class: "small" }, "پروندهٔ دوره در کارخانه: ", h("button", { class: "linkish small", onclick: function () { A.go("e_case", hd.cs.id, s.id); } }, hd.cs.title), h("span", { class: "muted" }, " — همین ایستگاه را آن‌جا هم می‌بینی."))
        : h("p", { class: "small muted" }, (caseLost(c) ? "پروندهٔ قبلیِ دوره پیدا نشد. " : "") + "پروندهٔ دوره با اولین چیزی که این‌جا بنویسی در کارخانه ساخته می‌شود؛ تا آن موقع چیزی ذخیره نمی‌شود.")));
    if (!row.inRoute) {
      /* ایستگاهِ شرطی که در مسیرِ این پرونده نیست: اول خودِ شرط سنجیده می‌شود */
      var way = Object.keys(E.WAYMAP || {}).filter(function (w) { return E.WAYMAP[w] === s.id; })[0];
      var cond = h("section", { class: "card" }, h("h3", {}, "این ایستگاه شرطی است: در پرونده‌ات لازم است؟"),
        h("p", {}, h("b", {}, "شرطِ ورود: "), s.cond || "—"),
        row.sug ? h("p", { class: "small" }, h("b", {}, "پیشنهادِ کارخانه برای پرونده‌ات: "), row.sug) : null,
        way ? h("p", { class: "small muted" }, "اگر در درسِ «راه معرفت هر تصدیق» برای یکی از تصدیق‌هایت راهِ «" + way + "» را انتخاب کرده بودی، این ایستگاه خودکار باز می‌شد.") : null,
        s.hall === 5 ? h("p", { class: "small muted" }, "سالنِ دین وقتی باز می‌شود که در پذیرش «" + E.RELIGION + "» انتخاب شده باشد.") : null);
      if (c.na[s.id]) {
        cond.appendChild(h("p", { class: "small good" }, "ثبت کردی که شرطِ این ایستگاه در پرونده‌ات برقرار نیست (" + A.fdate(c.na[s.id]) + ")؛ این درس بی‌کاربرگ هم تمام می‌شود."));
        cond.appendChild(h("button", { class: "btn ghost sm", onclick: function () { delete c.na[s.id]; save(c); A.render(); } }, "نظرم عوض شد — دوباره بپرس"));
        ctl.validate = function () { return []; };
      } else {
        cond.appendChild(h("div", { class: "row gap wrap" },
          h("button", { class: "btn sm", onclick: function () { hd.cs.inc[s.id] = true; hd.put(); A.render(); } }, "شرط برقرار است — به مسیرِ پرونده‌ام اضافه کن"),
          h("button", { class: "btn ghost sm", onclick: function () { c.na[s.id] = A.today(); save(c); A.render(); } }, "شرط در پرونده‌ام برقرار نیست")));
        ctl.validate = function () { return ["اول بگو شرطِ این ایستگاه در پرونده‌ات برقرار است یا نه"]; };
      }
      box.appendChild(cond);
      var e = exampleTry(s); if (e) { e.querySelector("h3").textContent = "تمرینِ جایگزین: روی نمونه‌های خودِ ایستگاه"; box.appendChild(e); }
      return box;
    }
    if (row.auto && s.route === "cond") box.appendChild(h("p", { class: "small muted" }, "این ایستگاه خودکار در مسیرِ پرونده‌ات است: " + row.auto + "."));
    if (!row.forced && cs.inc && cs.inc[s.id] === true && !row.auto) box.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "linkish small", onclick: function () { hd.cs.inc[s.id] = false; hd.put(); A.render(); } }, "این ایستگاه را از مسیرِ پرونده‌ام بردار")));
    if ((s.examples || []).length) box.appendChild(h("details", { class: "card" }, h("summary", { class: "small" }, "نمی‌دانی چه بنویسی؟ یک نمونهٔ اجرا ببین"), exBox(s.examples[0])));
    var savef = A.debounce(function () { hd.put(); }, 400);
    var ws = A.epiStationWS(hd.cs, s.id, function () { savef(); }, "ecrs_" + s.id);
    ctl.validate = function () { return ws._validate(); };
    box.appendChild(h("section", { class: "card wsform" }, ws));
    return box;
  }

  /* ---------- قدمِ ۴: بسنج و ببند ---------- */
  function checkStep(L, c, finish) {
    var box = h("div", { class: "col gap" }), s = L.intro ? null : SM[L.id];
    if (s) {
      var cs = caseOf(c), inCase = cs && !c.na[s.id] && routeRow(cs, s.id).inRoute;
      var arr;
      if (inCase) { cs.st[s.id] = cs.st[s.id] || { data: {}, done: false, rubric: [] }; arr = cs.st[s.id].rubric = cs.st[s.id].rubric || []; }
      else arr = c.rub[s.id] = c.rub[s.id] || [];
      var put = function () { if (inCase) S.put(cs); else save(c); };
      box.appendChild(h("section", { class: "card" }, h("h3", {}, "خودارزیابی: ایستگاه را درست اجرا کردم؟"),
        h("p", { class: "small muted" }, "روبریکِ خودِ ایستگاه؛ صادقانه. " + (inCase ? "در خودِ پرونده هم ذخیره می‌شود (همان روبریکِ صفحهٔ پرونده)." : "")),
        h("div", { class: "rubric" }, s.rubric.map(function (q, i) {
          return h("div", { class: "rrow" }, h("div", { class: "rc" }, q), h("div", { class: "seg", role: "radiogroup", "aria-label": q }, [0, 1, 2].map(function (v) {
            return h("button", { type: "button", role: "radio", "aria-checked": arr[i] === v ? "true" : "false", class: "sg" + (arr[i] === v ? " on" : ""), onclick: function (e) {
              if (arr[i] === v) return;
              arr[i] = v; e.target.parentNode.querySelectorAll(".sg").forEach(function (b, j) { b.classList.toggle("on", j === v); b.setAttribute("aria-checked", j === v ? "true" : "false"); }); put();
            } }, ["۰ · نه", "۱ · تا حدودی", "۲ · کامل"][v]);
          })));
        }))));
    }
    var q = s ? "بی‌نگاه بنویس: ایستگاهِ «" + s.fa + "» دقیقاً چه چیزی را می‌آزماید، با چه ملاکی، و خروجی‌اش چیست؟" : "بی‌نگاه: تصور و تصدیق، علمِ حضوری و حصولی، بدیهی و نظری — هر جفت را در یک جمله از هم جدا کن.";
    var ta = h("textarea", { rows: 4, placeholder: "از حافظه…", "aria-label": q });
    var prev = c.recall[L.id]; if (prev && prev.txt) ta.value = prev.txt;
    ta.addEventListener("input", function () { c.recall[L.id] = { d: A.today(), txt: ta.value }; saveSoon(c); });
    var reveal = h("div", { class: "crs-reveal hidden" }, s ? [h("p", { class: "small" }, h("b", {}, "پرسشِ محوری: "), s.q), s.out ? h("p", { class: "small" }, h("b", {}, "خروجی: "), s.out) : null, h("p", { class: "small" }, h("b", {}, "روش:")), flow(s.method)]
      : PAIRS.map(function (p) { return h("p", { class: "small" }, h("b", {}, p[0].fa + " / " + p[1].fa + ": "), String(p[0].def || "").split("\n")[0], " — ", String(p[1].def || "").split("\n")[0]); }));
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "پیش از بستن، از حافظه"), h("p", { class: "small" }, q),
      h("p", { class: "small muted" }, "یک بار بی‌نگاه بنویس؛ بعد مقایسه کن. نوشته‌ات ذخیره می‌شود و از فردا همین ایستگاه در «گرم‌کردن» از حافظه پرسیده می‌شود (فاصله‌ها: ۱، ۳، ۷، ۲۱ و ۶۰ روز، بسته به این‌که چقدر یادت بود)."), ta,
      h("button", { class: "btn ghost sm mt", onclick: function (e) { reveal.classList.remove("hidden"); e.target.remove(); } }, "مقایسه کن"), reveal));
    var nl = LESSONS[LIDX[L.id] + 1];
    box.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn lg", onclick: finish }, (c.done[L.id] ? "✓ تمام‌شده — " : "✓ این درس تمام شد — ") + (nl ? "درسِ بعد ←" : "نقشهٔ دوره ←"))));
    return box;
  }
  function missingOf(L, c) {
    if (L.intro) return A.renderWS(INTRO_WS, c.intro, function () {}, { prefix: "ecrs_chk" })._validate();
    var s = SM[L.id]; if (c.na[s.id]) return [];
    var hd = caseHandle(c), row = routeRow(hd.cs, s.id);
    if (!row.inRoute) return ["شرطِ ایستگاه (برقرار است یا نه)"];
    var d = (hd.cs.st && hd.cs.st[s.id] && hd.cs.st[s.id].data) || {};
    return A.renderWS(A.epiFields(s, hd.cs), d, function () {}, { prefix: "ecrs_chk" })._validate();
  }

  /* ---------- درس ---------- */
  var STEPS = [["s0", "۰ گرم‌کردن"], ["s1", "۱ ببین و بفهم"], ["s2", "۲ امتحان کن"], ["s3", "۳ انجام بده"], ["s4", "۴ بسنج و ببند"]];
  var STEPNAME = { s0: "گرم‌کردن", s1: "قدمِ ۱", s2: "قدمِ ۲", s3: "قدمِ ۳", s4: "قدمِ ۴" };
  function goNext(c) { var nl = nextLesson(c); if (nl) A.go("epi_lesson", nl.id, "s1"); else A.go("epi_course"); }
  A.V.epi_lesson = function (id, sub) {
    var c = st();
    A._ecrsChange = false;
    if (!c.claim) return onboarding(c, "new");
    var L = LESSONS[LIDX[id]];
    if (!L) return A.empty("این درس پیدا نشد.", h("button", { class: "btn", onclick: function () { A.go("epi_course"); } }, "نقشهٔ دوره"));
    var s = L.intro ? null : SM[L.id], M = MANZ[L.m], li = LIDX[L.id];
    var want = /^s[0-4]$/.test(sub || "") ? sub : "s1", step = want, gated = false;
    if (want !== "s0" && !c.done[L.id] && gateOpen(c, L.id)) { step = "s0"; gated = true; A.state.sub = "s0"; }
    if (step !== "s0" && c.step[L.id] !== step) { c.step[L.id] = step; saveSoon(c); }
    var root = h("div", { class: "page crs ecrs" });
    root.appendChild(h("div", { class: "crs-top" },
      h("div", { class: "crs-bar" }, h("i", { style: { width: pct(c) + "%" } })),
      h("div", { class: "row between wrap gap small" },
        h("span", { dir: "rtl" }, "منزلِ " + fa(M.n) + " از " + fa(MANZ.length - 1) + " · " + M.fa + " · درسِ " + fa(L.mi + 1) + " از " + fa(L.mn), h("span", { class: "muted" }, " (کلِ دوره: " + fa(li + 1) + " از " + fa(LESSONS.length) + ")")),
        h("button", { class: "btn ghost sm", onclick: function () { A.go("epi_course"); } }, "🗺️ نقشهٔ دوره"))));
    root.appendChild(A.head("کارخانهٔ معرفت‌شناسی · درسِ " + fa(li + 1), lname(L.id) + (s && s.route === "cond" ? " (شرطی)" : ""),
      (s ? "تا آخرِ این درس می‌توانی ایستگاهِ «" + s.fa + "» را روی پرونده‌ات اجرا کنی." : "واژه‌هایی که همهٔ ایستگاه‌ها با آن‌ها کار می‌کنند، روی ادعای خودت.") + " زمانِ تقریبی: " + minText(L.id) + " (برآورد از روی اندازهٔ واقعیِ همین درس: متن، تمرین‌ها و فیلدهای کاربرگ؛ لازم نیست یک‌نفس تمامش کنی — هر چه بنویسی ذخیره می‌شود).",
      s ? h("div", { class: "row gap wrap" }, h("button", { class: "linkish small", onclick: function () { A.go("e_st", s.id); } }, "صفحهٔ کاملِ ایستگاه (با «↩ برگرد» برمی‌گردی)")) : null));
    var order = STEPS.map(function (x) { return x[0]; });
    function goStep(x) { A.go("epi_lesson", L.id, x); }
    root.appendChild(A.tabs(STEPS.map(function (x) { return [x[0], (c.done[L.id] && x[0] === "s4" ? "✓ " : "") + x[1]]; }), step, goStep));
    var ctl = {}, body;
    if (step === "s0") { var to = gated ? want : "s1"; body = warmStep(c, L.id, function () { goStep(to); }, gated ? "ادامه به " + STEPNAME[to] + " ←" : "برو به قدمِ ۱ ←", gated); }
    else if (step === "s1") body = s ? seeStep(s, c) : seeIntro(c);
    else if (step === "s2") body = s ? tryStep(s) : (function () { var b = h("div", { class: "col gap" }), m = conceptMatch(); b.appendChild(m || A.empty("واژه‌ها را در قدمِ ۱ بخوان و برو سراغِ قدمِ ۳.")); return b; })();
    else if (step === "s3") body = s ? doStep(s, c, ctl) : doIntro(c, ctl);
    else body = checkStep(L, c, function () {
      var miss = missingOf(L, c);
      if (miss.length) { A.toast("قدمِ ۳ هنوز کامل نیست: " + miss.slice(0, 2).join("، ") + (miss.length > 2 ? "…" : ""), "bad"); goStep("s3"); return; }
      if (s && !c.na[s.id]) {
        var cs = caseOf(c), d = cs && cs.st && cs.st[s.id];
        if (d && !d.done) { d.done = true; if (s.id === FINAL && /بسته شد|نداشت/.test((d.data || {}).verdict || "")) cs.status = "closed"; S.put(cs); }
      }
      if (!c.done[L.id]) c.done[L.id] = A.today();
      save(c);
      A.toast("درسِ " + fa(li + 1) + " تمام شد.");
      goNext(c);
    });
    root.appendChild(h("div", { class: "crs-body" }, body));
    if (step !== "s4" && step !== "s0") {
      var i = order.indexOf(step);
      root.appendChild(h("div", { class: "row between gap crs-nav" },
        i > 0 ? h("button", { class: "btn ghost", onclick: function () { goStep(order[i - 1]); } }, "→ قدمِ قبل") : h("span"),
        h("button", { class: "btn", onclick: function () {
          if (step === "s3" && ctl.validate) { var miss = ctl.validate(); if (miss.length) { A.toast("این‌ها هنوز خالی‌اند: " + miss.slice(0, 3).join("، "), "bad"); return; } }
          goStep(order[i + 1]);
        } }, "قدمِ بعد ←")));
    }
    return root;
  };

  /* ================= شبیه‌سازها: تصویرِ آموزشی با توابعِ قطعیِ واقعیِ کارخانه =================
     هیچ‌کدام قاعده یا وزنی را تغییر نمی‌دهند و چیزی ذخیره نمی‌کنند (جز علامتِ «امتحان کردم» در رکوردِ دوره).
     ۱) سقفِ اعتبار: window.EPIX.runClaim با «دستورِ منجمدِ جزوه» (EPIX.DEFAULT_CFG، بی‌تنظیم) روی ویژگی‌هایی که خودت می‌چینی.
     ۲) راه ← ایستگاه: A.routeOf روی یک پروندهٔ ساختگیِ درونِ حافظه با جدولِ راه‌هایی که خودت پر می‌کنی.
     ۳) مسیرِ پرونده: A.routeOf با پذیرشی که خودت می‌چینی. */
  var SIM = {};
  var ENGINE_NOTE = "تصویرِ آموزشی، نه داوری: عدد و پرچم را همان موتورِ قطعیِ کارخانه (بی هوش مصنوعی) با «دستورِ منجمدِ جزوه»، یعنی قاعده‌های بک‌تست‌شده بی هیچ تنظیمِ وزن، حساب می‌کند. عددها مقیاسِ قراردادیِ خودِ سامانه‌اند (یقین ۱۰۰، نزدیک به یقین ۹۵، ظنِ معتبر ۸۰، ظنِ متوسط ۷۰، ظنِ ضعیف ۴۵، فاقدِ اعتبار ۲۵، کذبِ یقینی ۰)؛ جزوه فقط ترتیبِ کیفی می‌دهد. ویژگیِ «نامعلوم» هیچ قاعده‌ای را روشن نمی‌کند. چیزی ذخیره نمی‌شود.";
  function featCtl(d, f, onCh) {
    var id = "ecrs_fe_" + d.k + "_" + Math.random().toString(36).slice(2, 6), ctl;
    if (d.t === "enum") ctl = h("select", { id: id, onchange: function (e) { if (e.target.value === "") delete f[d.k]; else f[d.k] = e.target.value; onCh(); } }, h("option", { value: "" }, "نامعلوم"), d.v.map(function (v) { return h("option", { value: v, selected: f[d.k] === v }, v); }));
    else if (d.t === "bool") ctl = h("select", { id: id, onchange: function (e) { if (e.target.value === "") delete f[d.k]; else f[d.k] = e.target.value === "1"; onCh(); } }, h("option", { value: "" }, "نامعلوم"), h("option", { value: "1", selected: f[d.k] === true }, "بله"), h("option", { value: "0", selected: f[d.k] === false }, "خیر"));
    else ctl = h("input", { id: id, type: "number", min: 0, max: 100, step: 5, placeholder: "نامعلوم", value: f[d.k] == null ? "" : f[d.k], oninput: function (e) { if (e.target.value === "") delete f[d.k]; else f[d.k] = Math.max(0, Math.min(100, +e.target.value)); onCh(); } });
    return h("div", { class: "ecrs-frow" }, h("label", { for: id, class: "small" }, d.fa), ctl);
  }
  function ceilingSim(o) {
    return { title: o.title, note: ENGINE_NOTE + (o.note ? " " + o.note : ""), draw: function () {
      var X = window.EPIX, FM = window.EPI_FM || {};
      if (!X || !X.runClaim || !X.RM) return A.empty("موتورِ قطعیِ کارخانه در این نسخه بار نشده؛ این شبیه‌ساز فقط با خودِ آن کار می‌کند.");
      var f = JSON.parse(JSON.stringify(o.preset || {})), keys = o.keys.filter(function (k) { return FM[k]; }), touched = false;
      var out = h("div", { class: "ecrs-ceil", "aria-live": "polite" });
      function draw() {
        var cfg = X.DEFAULT_CFG ? X.DEFAULT_CFG() : null, r = X.runClaim({ f: f }, cfg), tol = cfg && cfg.tol != null ? cfg.tol : 10;
        out.innerHTML = "";
        var cv = function (x) { return Math.round(X.capOf ? X.capOf(cfg, x, f) : x.cap); };   // سقفِ قضیه‌ایِ همین تصدیق (۲۰۲۶-۱۰-۱۴)
        var caps = r.fired.map(function (id) { return X.RM[id]; }).filter(function (x) { return x && x.eff === "cap"; }).sort(function (a, b) { return cv(a) - cv(b); });
        var flags = r.fired.map(function (id) { return X.RM[id]; }).filter(function (x) { return x && x.eff === "flag"; });
        out.appendChild(h("div", { class: "ecrs-ceilhead" }, h("span", { class: "small muted" }, "سقفِ اعتبارِ موجهِ این تصدیق"), h("b", { class: "ecrs-ceilv" }, fa(r.ceil) + "٪"),
          h("div", { class: "crs-meter" }, h("i", { style: { width: r.ceil + "%" } }))));
        if (!caps.length) out.appendChild(h("p", { class: "small" }, "با این ویژگی‌ها هیچ ملاکی سقف نگذاشته (سقف ۱۰۰). اگر ویژگی‌ای «نامعلوم» است، یعنی هنوز سنجیده نشده — نه این‌که برقرار است."));
        else {
          out.appendChild(h("p", { class: "small" }, caps.length > 1 ? "هر ملاکی که برقرار نیست سقفی می‌گذارد؛ موتور پایین‌ترینِ آن‌ها را برمی‌دارد: درجهٔ تصدیق از ضعیف‌ترین حلقه بالاتر نمی‌رود." : "یک ملاک سقف گذاشته:"));
          out.appendChild(h("div", { class: "col" }, caps.map(function (x) {
            var bind = x.id === r.bind;
            return h("div", { class: "ecrs-cap" + (bind ? " bind" : "") },
              h("div", { class: "ecrs-capbar" }, h("i", { style: { width: cv(x) + "%" } }), h("span", {}, fa(cv(x)) + "٪")),
              h("div", { class: "small" }, (bind ? "⛓ ضعیف‌ترین حلقه — همین سقف را تعیین می‌کند: " : "") , h("b", {}, x.fa), SM[x.st] ? h("span", { class: "muted" }, " · ایستگاهِ «" + SM[x.st].fa + "»") : null),
              h("div", { class: "row gap wrap" }, (x.sec || []).slice(0, 3).map(function (sc) { return secBtn(sc); })));
          })));
        }
        if (flags.length) out.appendChild(h("div", { class: "col" }, flags.map(function (x) { return h("p", { class: "small bad" }, "⚑ پرچمِ خطا (مستقل از درجه)" + (SM[x.st] ? " در «" + SM[x.st].fa + "»" : "") + ": " + (x.err || x.fa)); })));
        if (o.conf) out.appendChild(r.conf == null ? h("p", { class: "small muted" }, "اطمینانت را وارد کن تا ببینی با سقف می‌خواند یا نه.")
          : r.over ? h("p", { class: "small bad" }, "بیش‌اطمینانی: اطمینانِ تو (" + fa(r.conf) + "٪) از سقف (" + fa(r.ceil) + "٪) به‌اضافهٔ تحملِ " + fa(tol) + " واحد بیشتر است. موتور این را در ایستگاهِ «" + ((SM[(X.RM[r.bind] || {}).st] || SM.st_grade || {}).fa || "") + "» پرچم می‌زند.")
          : h("p", { class: "small good" }, "اطمینانِ تو (" + fa(r.conf) + "٪) از سقف (" + fa(r.ceil) + "٪) به‌اضافهٔ تحملِ " + fa(tol) + " واحد بالاتر نیست."));
      }
      var box = h("div", { class: "col gap" }, h("div", { class: "ecrs-feats" }, keys.map(function (k) { return featCtl(FM[k], f, function () { if (!touched) { touched = true; markTry(o.sid, "sim"); } draw(); }); })), out);
      draw();
      return box;
    } };
  }
  function waySim(sid) {
    return { title: "راهِ هر تصدیق ← کدام ایستگاه و کدام آزمون", note: "تصویرِ آموزشی با تابعِ واقعیِ مسیرِ کارخانه (همانی که صفحهٔ پرونده از آن مسیر می‌سازد) روی یک پروندهٔ ساختگیِ درونِ حافظه؛ هیچ پرونده‌ای ساخته یا ذخیره نمی‌شود. «آزمون‌ها» ویژگی‌هایی است که موتورِ قطعی در آن ایستگاه می‌خواند، و «سقف‌ها» قاعده‌های همان ایستگاه.",
      draw: function () {
        var WAYS = Object.keys(E.WAYMAP || {}), rows = [{ c: "1", w: "" }, { c: "2", w: "" }, { c: "3", w: "" }], clash = false, touched = false;
        var out = h("div", { class: "col gap", "aria-live": "polite" });
        function ch() { if (!touched) { touched = true; markTry(sid, "sim"); } draw(); }
        var tbl = h("div", { class: "col gap" }, rows.map(function (r) {
          var id = "ecrs_way_" + r.c;
          return h("div", { class: "ecrs-frow" }, h("label", { for: id, class: "small" }, "تصدیقِ " + fa(r.c) + " از چه راهی آمده؟"),
            h("select", { id: id, onchange: function (e) { r.w = e.target.value; ch(); } }, h("option", { value: "" }, "—"), WAYS.concat(["بدیهی (بی‌نیاز از راه)"]).map(function (w) { return h("option", { value: w }, w); })));
        }));
        var cb = h("input", { type: "checkbox", id: "ecrs_clash", onchange: function (e) { clash = e.target.checked; ch(); } });
        function draw() {
          var mem = { mode: "full", st: { st_intake: { data: {} }, st_route: { data: { ways: rows.filter(function (r) { return r.w; }).map(function (r) { return { c: r.c, w: r.w }; }), clash: clash ? "ناسازگاری میانِ دو تصدیق" : "" } } }, inc: {} };
          var rt = A.routeOf(mem).filter(function (x) { return x.auto && x.inRoute; });
          out.innerHTML = "";
          if (!rows.some(function (r) { return r.w; })) { out.appendChild(h("p", { class: "small muted" }, "برای یک یا چند تصدیق راهی انتخاب کن.")); return; }
          if (!rt.length) out.appendChild(h("p", { class: "small" }, "هیچ ایستگاهِ راهی باز نشد: تصدیقِ بدیهی به راه نیاز ندارد؛ بدیهی یا نظری بودنش را ایستگاهِ «بدیهی یا نظری» می‌سنجد."));
          rt.forEach(function (x) {
            var fs = featsOf(x.s.id), nCap = (window.EPI_RULES || []).filter(function (r) { return r.st === x.s.id && r.eff === "cap"; }).length;
            out.appendChild(h("div", { class: "crs-spot ok" }, h("p", {}, h("b", {}, "باز شد: «" + x.s.fa + "»"), h("span", { class: "small muted" }, " — " + x.auto)),
              h("p", { class: "small" }, x.s.q),
              fs.length ? h("ul", { class: "small" }, fs.map(function (d) { return h("li", {}, d.fa); })) : null,
              h("p", { class: "small muted" }, fa(nCap) + " قاعدهٔ سقف در این ایستگاه")));
          });
        }
        var box = h("div", { class: "col gap" }, tbl, h("label", { class: "row gap small", for: "ecrs_clash" }, cb, h("span", {}, "در جدولِ راه‌ها ناسازگاری میانِ تصدیق‌ها ثبت شده")), out);
        draw();
        return box;
      } };
  }
  function routeSim(sid) {
    return { title: "مسیرِ پرونده را بچین: پذیرش چه ایستگاه‌هایی را باز می‌کند؟", note: "تصویرِ آموزشی با تابعِ واقعیِ مسیرِ کارخانه روی یک پروندهٔ ساختگیِ درونِ حافظه؛ هیچ پرونده‌ای ساخته یا ذخیره نمی‌شود. «پیشنهاد» افزودهٔ سامانه است، نه جزوه؛ ایستگاه‌های راه را جدولِ راه‌ها (درسِ بعدی‌تر) باز می‌کند.",
      draw: function () {
        var lay = ((SM.st_intake.ws.filter(function (f) { return f.k === "layer"; })[0] || {}).opts) || [];
        var d = { kind: "", special: "", layer: "", tools: [] }, mode = "full", touched = false;
        var out = h("div", { class: "col gap", "aria-live": "polite" });
        function ch() { if (!touched) { touched = true; markTry(sid, "sim"); } draw(); }
        function sel(lbl, id, opts, on) { return h("div", { class: "ecrs-frow" }, h("label", { for: id, class: "small" }, lbl), h("select", { id: id, onchange: function (e) { on(e.target.value); ch(); } }, opts.map(function (o) { return h("option", { value: o[0] }, o[1]); }))); }
        function draw() {
          var mem = { mode: mode, st: { st_intake: { data: d } }, inc: {} };
          var rt = A.routeOf(mem), inR = rt.filter(function (x) { return x.inRoute; }), sug = rt.filter(function (x) { return !x.inRoute && x.sug; });
          out.innerHTML = "";
          out.appendChild(h("p", { class: "small" }, h("b", {}, fa(inR.length) + " ایستگاه در مسیر"), " · " + fa(sug.length) + " پیشنهاد"));
          out.appendChild(h("ol", { class: "ecrs-route small" }, inR.map(function (x) { return h("li", {}, x.s.fa + (x.s.route === "cond" ? " (شرطی، خودکار)" : "")); })));
          if (sug.length) out.appendChild(h("ul", { class: "small muted" }, sug.map(function (x) { return h("li", {}, "پیشنهاد: «" + x.s.fa + "» — " + x.sug); })));
        }
        var box = h("div", { class: "col gap" },
          h("div", { class: "ecrs-feats" },
            sel("نوعِ ورودی", "ecrs_rk", [["", "—"]].concat(Object.keys(E.KIND_SUGGEST || {}).map(function (k) { return [k, k]; })), function (v) { d.kind = v; }),
            sel("قلمرو", "ecrs_rs", [["", "عام (هر موضوع)"], [E.RELIGION, E.RELIGION]], function (v) { d.special = v; }),
            sel("لایهٔ پرسش", "ecrs_rl", [["", "—"]].concat(lay.map(function (k) { return [k, k]; })), function (v) { d.layer = v; }),
            sel("ابزارِ «یافت درونی/شهود» در ساختِ ادعا", "ecrs_rt", [["", "نه"], ["1", "بله"]], function (v) { d.tools = v ? ["یافت درونی/شهود"] : []; }),
            sel("نوعِ مسیر", "ecrs_rm", [["full", "کامل"], ["quick", "سریع"]], function (v) { mode = v; })),
          out);
        draw();
        return box;
      } };
  }
  (function () {
    var FM = window.EPI_FM || {};
    SIM.st_intake = routeSim("st_intake");
    SIM.st_route = waySim("st_route");
    var grade = ["way", "narrator", "issued", "tawatur", "x_method", "x_comp", "x_bias", "sense_ctrl", "form", "matter", "ind_complete", "mem_doc"];
    SIM.st_grade = ceilingSim({ sid: "st_grade", keys: grade, title: "سقفِ اعتبار: ضعیف‌ترین حلقه", note: "چند ویژگی از راه‌های گوناگون را عوض کن و ببین کدام ملاک سقف را پایین می‌کشد." });
    SIM[FINAL] = ceilingSim({ sid: FINAL, keys: ["way", "narrator", "x_comp", "sense_ctrl", "matter", "conf"], conf: true, title: "اطمینانِ تو در برابرِ سقف: بیش‌اطمینانی", note: "تحملِ بیش‌اطمینانی هم از همان دستورِ منجمد می‌آید." });
    Object.keys(E.WAYMAP || {}).forEach(function (w) {
      var sid = E.WAYMAP[w]; if (!SM[sid]) return;
      SIM[sid] = ceilingSim({ sid: sid, keys: featsOf(sid).map(function (d) { return d.k; }), preset: { way: w }, title: "آزمون‌های راهِ «" + w + "» و سقفی که هر کدام می‌گذارد", note: "راهِ تصدیق از پیش «" + w + "» گذاشته شده." });
    });
    RT.forEach(function (s) {
      if (SIM[s.id]) return;
      var keys = featsOf(s.id).map(function (d) { return d.k; }).filter(function (k) { return FM[k]; });
      if (keys.length) SIM[s.id] = ceilingSim({ sid: s.id, keys: keys, title: "آنچه موتورِ قطعی در این ایستگاه می‌سنجد", note: "ویژگی‌های تشخیصی خودشان داوری‌اند (پرچم)؛ بقیه سقف می‌گذارند." });
    });
  })();

  /* ---------- درِ ورود در میزِ کارِ کارخانه ---------- */
  A.epiCourseCard = function () {
    var c = S.get(REC) ? st() : null, nl = c && c.claim ? nextLesson(c) : null;
    return h("section", { class: "card crs-home ecrs-home" },
      h("div", { class: "row between wrap gap" },
        h("div", {}, h("div", { class: "eyebrow" }, "🧭 دورهٔ گام‌به‌گامِ کارخانه"),
          h("div", {}, c && c.claim ? (nl ? "درسِ بعدی‌ات: " + fa(LIDX[nl.id] + 1) + " · " + lname(nl.id) + " — " + progressText(c).textContent : "دوره را تمام کرده‌ای.")
            : "کارخانه را تازه شروع می‌کنی؟ دوره ایستگاه‌به‌ایستگاه، به ترتیبِ مسیر، روی یک ادعای واقعیِ خودت جلو می‌برد.")),
        h("button", { class: "btn", onclick: function () { if (c && c.claim && nl) A.go("epi_lesson", nl.id, c.step[nl.id] || "s1"); else A.go("epi_course"); } },
          c && c.claim ? (nl ? "▶ ادامهٔ دورهٔ کارخانه" : "نقشهٔ دوره") : "▶ شروعِ دورهٔ کارخانه")));
  };

  /* ---------- پوسته: این دو نما مالِ سامانهٔ کارخانه‌اند ---------- */
  var rawSys = A.sysOf;
  A.sysOf = function (v) { return /^epi_/.test(v || "") ? "epi" : rawSys(v); };
  var rawRender = A.render;
  A.render = function () {
    rawRender();
    try {
      if (A.state.view === "epi_lesson") {
        document.querySelectorAll('.nav[data-v="epi_course"]').forEach(function (b) { b.classList.add("on"); });
        var m = document.getElementById("main"); if (m) m.setAttribute("data-report-section-label", "درسِ دورهٔ کارخانه");
      }
    } catch (e) { }
  };

  /* ---------- آینهٔ درایو (فقط در میزبان) ---------- */
  if (A.MIRROR_BUILD) A.MIRROR_BUILD.epi_course = function (c) {
    var cs = c.caseId && S.get(c.caseId), base = location.origin + location.pathname + "?tab=";
    var rows = [["درس", "منزل", "ایستگاه", "تمام‌شده", "شرط برقرار نبود", "گرم‌کردنِ بعدی", "آخرین نمرهٔ گرم‌کردن", "نوشته از حافظه"]];
    LESSONS.forEach(function (l, i) {
      var w = (c.warm || {})[l.id] || {};
      rows.push([i + 1, MANZ[l.m].fa, lname(l.id), (c.done || {})[l.id] || "", (c.na || {})[l.id] || "", w.due || "", w.g == null ? "" : ["یادم نبود", "تا حدودی", "یادم بود"][w.g], (((c.recall || {})[l.id] || {}).txt || "")]);
    });
    return { group: "دوره", title: "دورهٔ کارخانه", tabs: [
      { name: "خلاصه", rows: [["فیلد", "مقدار"], ["ادعای دوره", c.claim || ""], ["عنوان", c.title || ""], ["پروندهٔ دوره", cs ? cs.title + " · " + base + "e_case&a=" + encodeURIComponent(cs.id) : ""],
        ["شروع", c.started || ""], ["درس‌های تمام‌شده", Object.keys(c.done || {}).filter(function (k) { return LIDX[k] != null; }).length + " از " + LESSONS.length], ["در برنامه", base + "epi_course"]] },
      { name: "پیشرفت", rows: rows }] };
  };
})(APP);
