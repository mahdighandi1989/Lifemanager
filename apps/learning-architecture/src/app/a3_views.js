/* ===== نماها: پوسته، خانه، کتابخانه، صفحه تکنیک و کارگاه ===== */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, C = A.C;
  var NAV = [
    { g: "دوره: از صفر" },
    /* شمار و زمانِ درس‌ها را دوره (a11_course.js، A.courseBlurb) از روی خودِ درس‌ها می‌سازد و همین متن را هنگامِ بارگذاری جایگزین می‌کند */
    ["course", "🧭 دورهٔ یادگیری (گام‌به‌گام)", "یادگرفتنِ خودِ روش‌های یادگیری: تکنیک‌ها و روال‌ها، درس به درس، روی موضوعِ خودت"],
    { g: "کار روزانه" },
    ["home", "امروز", "کارهای امروز و پیشرفتت"],
    { g: "گره‌گشا" },
    ["kcases", "🪢 گره‌گشا: جایی گیر کردم", "مسئله‌ای که حل نشد، کاری که نمی‌فهمی چرا کردی، یا نتیجه‌ای اجتماعی که نمی‌فهمی — تا ریشه، با شاهد"],
    { g: "حلِ مسئله" },
    ["e_prob", "🧗 مسئله‌های بزرگ", "مسئلهٔ سختِ حل‌شده‌ای را که خودت می‌آوری (صورت + پاسخ) گام‌به‌گام شبیه‌ساز کن، و مسئله‌های هم‌ساختارِ تازه بساز"],
    ["moves", "🧗 حرکت‌های حلِ مسئله", "۱۶ حرکتِ تکرارشونده (تعمیم، ناوردا، برهانِ خلف…) و تمرینِ درهم برای تشخیصشان — از گام‌های مسئله‌هایی که خودت آورده‌ای"],
    { g: "مسیر یادگیری" },
    ["map", "نقشه و گراف", "مراحل یادگیری (" + fa(C.PHASES.length) + " فاز)، ارتباط تکنیک‌ها، برنامه " + fa(C.CURRICULUM.length) + " هفته‌ای"],
    ["lib", "۴۵ تکنیک", "هر روش یادگیری: چرا کار می‌کند، چطور، و تمرینش"],
    ["topics", "موضوع‌ها", "چیزی که می‌خواهی عمیق بفهمی؛ سفرِ ۱۱ گامی قدم‌به‌قدم می‌بردت"],
    ["farm", "مزرعه", "هر مفهومی که فهمیدی، در درخت علم خودش (مسیر " + fa(C.PIPELINE.length) + " گامی)"],
    ["protos", "پروتکل‌ها", fa(C.PROTOCOLS.length) + " روال تکرار: از «پس از هر جلسه» تا «هر دوره»، و صف منابع"],
    ["review", "مرور", "مرور کارت‌های امروز و سنجش میزان اطمینانت"],
    { g: "مرجع" },
    ["concerns", "دغدغه‌ها", fa(C.CONCERNS.length) + " دغدغه تو و راه حل هرکدام"],
    ["atlas", "اطلس", "الگوهای مشترک علوم و زندگی تو"],
    ["base", "مبانی و اصلاحیه‌ها", "پشتوانه علمی سامانه و " + fa(C.ERRATA.length) + " اصلاحیه (مرجع)"]
  ];
  var SETTINGS = ["settings", "تنظیمات", "کلید هوش مصنوعی و پشتیبان‌گیری (برای هر دو سامانه)"];
  var START = ["start", "از اینجا شروع کن", "این برنامه چیست و برای هر خواسته از کجا شروع کنی"];
  A.NAV = NAV; A.NAV_SETTINGS = SETTINGS; A.NAV_START = START;
  A.sysOf = function (v) { return /^e_/.test(v) ? "epi" : (v === "settings" || v === "start" || v === "whole" || v === "maps") ? (A.lastSys || "learn") : "learn"; };
  A.state = { view: "home", arg: null, sub: null };
  A.go = function (view, arg, sub) {
    // a change of sub-tab inside the same page REPLACES the history entry (so the browser's Back and the app's
    // «↩ برگرد» agree: one history step = one page the learner actually moved to)
    var samePage = A.state.view === view && String(A.state.arg == null ? "" : A.state.arg) === String(arg == null ? "" : arg);
    if (A.HOST && A.HOST.navigate) { try { A.HOST.navigate({ tab: view, a: arg == null ? "" : String(arg), s: sub || "", replace: samePage || !!A._replaceNav }); } catch (e) { } }
    else { try { if (!arg && history.replaceState) history.replaceState(null, "", "#" + view); } catch (e) { } }
    A.state = { view: view, arg: arg == null ? null : arg, sub: sub || null }; A._replaceNav = false;
    A.render(); try { (A.mountEl && A.mountEl.scrollIntoView) ? A.mountEl.scrollIntoView({ block: "start" }) : window.scrollTo(0, 0); } catch (e) { window.scrollTo(0, 0); }
    var m = document.getElementById("main"); if (m) m.focus({ preventScroll: true });
  };
  A.shell = function () {
    var app = A.mountEl || document.getElementById("app"); app.innerHTML = "";
    function navBtn(n) {
      var d = n[0] === "course" && A.courseNavText ? A.courseNavText() : n[2];
      return h("button", { class: "nav", "data-v": n[0], title: d, onclick: function () { (A.goRoot || A.go)(n[0]); } }, h("span", { class: "nt" }, n[1]), h("span", { class: "nd" }, d));
    }
    function navList(arr, sys) { return h("div", { class: "navlist", "data-sys": sys }, arr.map(function (n) { return n.g ? h("div", { class: "navg" }, n.g) : navBtn(n); })); }
    var nav = h("nav", { class: "side", "aria-label": "بخش‌ها" },
      h("div", { class: "brand" }, h("div", { class: "bmark", "aria-hidden": "true" }, svgMark()), h("div", {}, h("div", { class: "bname", id: "bname" }, "معماری یادگیری عمیق"), h("div", { class: "bsub", id: "bsub" }, "۴۵ تکنیک · ۹ فاز · ۲۴ دغدغه"))),
      h("div", { class: "sysw", role: "tablist", "aria-label": "سامانه" },
        h("button", { class: "sysb", "data-sys": "learn", role: "tab", onclick: function () { (A.goRoot || A.go)("home"); } }, "سامانه یادگیری"),
        h("button", { class: "sysb", "data-sys": "epi", role: "tab", onclick: function () { (A.goRoot || A.go)("e_home"); } }, "کارخانه معرفت‌شناسی")),
      h("div", { class: "navlist" }, A.NAV_WHOLE ? navBtn(A.NAV_WHOLE) : null, A.NAV_MAPS ? navBtn(A.NAV_MAPS) : null, navBtn(START)),
      navList(NAV, "learn"), navList(A.EPI_NAV || [], "epi"),
      h("div", { class: "navlist" }, navBtn(SETTINGS)),
      h("div", { class: "sync" }, h("span", { id: "syncState" }, S.status)));
    app.appendChild(nav);
    app.appendChild(h("main", { id: "main", tabindex: "-1" }));
  };
  function svgMark() {
    var s = A.svg, svg = s("svg", { viewBox: "0 0 40 40", width: "34", height: "34" });
    var pts = [[20, 4], [34, 12], [34, 28], [20, 36], [6, 28], [6, 12], [20, 20]];
    [[0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [0, 1], [2, 3], [4, 5]].forEach(function (e) { svg.appendChild(s("line", { x1: pts[e[0]][0], y1: pts[e[0]][1], x2: pts[e[1]][0], y2: pts[e[1]][1], stroke: "currentColor", "stroke-width": "1.4", opacity: ".55" })); });
    pts.forEach(function (p, i) { svg.appendChild(s("circle", { cx: p[0], cy: p[1], r: i === 6 ? 4.2 : 2.8, fill: i === 6 ? "var(--accent)" : "currentColor" })); });
    return svg;
  }
  A.render = function () {
    var sys = A.sysOf(A.state.view); A.lastSys = sys;
    document.querySelectorAll(".navlist[data-sys]").forEach(function (l) { l.hidden = l.dataset.sys !== sys; });
    document.querySelectorAll(".sysb").forEach(function (b) { var on = b.dataset.sys === sys; b.classList.toggle("on", on); b.setAttribute("aria-selected", on ? "true" : "false"); });
    var bn = document.getElementById("bname"), bs = document.getElementById("bsub");
    if (bn) bn.textContent = sys === "epi" ? "کارخانه معرفت‌شناسی" : "معماری یادگیری عمیق";
    if (bs) bs.textContent = sys === "epi" ? fa(((window.EPI || {}).HALLS || []).length) + " سالن · " + fa((A.ESTL || []).length) + " ایستگاه · جزوه مصباح" : "۴۵ تکنیک · ۹ فاز · ۲۴ دغدغه";
    document.querySelectorAll(".nav").forEach(function (b) { b.classList.toggle("on", b.dataset.v === A.state.view || (A.state.view === "tech" && b.dataset.v === "lib") || ((A.state.view === "topic" || A.state.view === "journey") && b.dataset.v === "topics") || (A.state.view === "lesson" && b.dataset.v === "course") || (A.state.view === "proto" && b.dataset.v === "protos") || (A.state.view === "e_case" && b.dataset.v === "e_cases") || ((A.state.view === "kcase" || A.state.view === "knot") && b.dataset.v === "kcases")); });
    var main = document.getElementById("main"); if (!main) return; main.innerHTML = "";
    // in the host, nothing renders before the records arrive: a view could otherwise save defaults (e.g. settings)
    // over the owner's real data — a deep link or the host's URL effect can call render that early (2026-10-12 audit)
    if (A.HOST && !A.S.loaded) { main.appendChild(h("div", { class: "card" }, "در حالِ بارگذاریِ داده‌ها…")); return; }
    /* برای «نظارت و سرکشی» میزبان: هر نما یک بخش نام‌دار است */
    var lab = (function () { var all = NAV.concat(A.EPI_NAV || [], [SETTINGS, START]); for (var i = 0; i < all.length; i++) if (all[i][0] === A.state.view) return all[i][1]; return ({ tech: "صفحه تکنیک", lesson: "درسِ دوره", topic: "موضوع", journey: "سفرِ گام‌به‌گام روی موضوع", proto: "پروتکل", e_case: "پرونده کارخانه", kcase: "موقعیتِ گره‌گشا", knot: "گرهِ ذهنی", kpractice: "ورزشِ گره‌ها", kmap: "نقشهٔ ذهن" })[A.state.view] || (A.viewLabel ? A.viewLabel(A.state.view, A.state.arg) : A.state.view); })();
    main.setAttribute("data-report-section", A.state.view); main.setAttribute("data-report-section-label", lab);
    var fn = A.V[A.state.view] || A.V.home;
    try { main.appendChild(fn(A.state.arg, A.state.sub)); }
    catch (e) { console.error(e); main.appendChild(h("div", { class: "card bad" }, h("p", {}, "این بخش نمایش داده نشد (" + e.message + ") — شاید پیوند قدیمی یا ناقص است."), h("button", { class: "btn sm", onclick: function () { (A.goRoot || A.go)("home"); } }, "رفتن به خانه"))); }
  };
  A.V = {};

  /* ---------- اجزای مشترک ---------- */
  A.head = function (eyebrow, title, lead, extra) {
    return h("header", { class: "phead" }, eyebrow ? h("div", { class: "eyebrow" }, eyebrow) : null, h("h1", {}, title), lead ? h("p", { class: "lead" }, lead) : null, extra || null);
  };
  A.phaseChip = function (n) { var p = C.PHASES[n]; return h("span", { class: "chip ph", style: { "--pc": "var(--p" + n + ")" } }, "فاز " + fa(n) + " · " + p.short); };
  A.priChip = function (id) { var p = C.PRIORITY[id]; return h("span", { class: "chip pri p" + p, title: C.PRIORITY_INFO[p].why }, "اولویت " + C.PRIORITY_INFO[p].fa); };
  /* قاعدهٔ تکنیک‌های ترکیبی (ممیزی B28، ۲۰۲۶-۱۰-۱۲): وقتی خودِ ترکیب آزمون نشده و شواهد فقط برای اجزا هست (ev.basis = "components")،
     سطح = B فقط اگر سازوکارِ اصلی‌اش شواهدِ مستقیم و فراتحلیلی دارد، وگرنه C؛ و همیشه برچسبِ «بر پایهٔ اجزا» می‌گیرد. */
  A.EV_BASIS = { components: "بر پایهٔ اجزا؛ خودِ ترکیب آزمون نشده" };
  A.evChip = function (t) { var m = { A: "شواهد قوی", B: "شواهد متوسط", C: "اکتشافی/تجربه‌محور" }; var b = A.EV_BASIS[t.ev.basis]; return h("span", { class: "chip ev ev" + t.ev.lvl, title: (b ? b + " — " : "") + t.ev.note }, "سطح " + t.ev.lvl + " · " + m[t.ev.lvl] + (b ? " · بر پایهٔ اجزا" : "")); };
  A.techLink = function (id, opts) {
    var t = A.TM[id]; if (!t) return h("span", {}, "#" + id);
    return h("button", { class: "tlink", style: { "--pc": "var(--p" + A.phaseOf(id) + ")" }, onclick: function () { A.go("tech", id, opts && opts.sub); } }, h("b", {}, fa(id)), " ", t.fa);
  };
  A.refChip = function (ref) {
    if (ref[0] === "t") return A.techLink(+ref.slice(1));
    if (ref === "FARM") return h("button", { class: "tlink proto farmref", onclick: function () { A.go("farm"); } }, "مزرعه");
    if (ref === "FARMLOGIC") return h("button", { class: "tlink proto farmref", onclick: function () { A.go("farm", null, "logic"); } }, "منطق مزرعه");
    if (ref === "ATLAS") return h("button", { class: "tlink proto", onclick: function () { A.go("atlas"); } }, "اطلس ساختارها");
    if (ref === "P10") return h("button", { class: "tlink proto", onclick: function () { A.go("protos", null, "queue"); } }, "صف منابع و رژیم داده");
    var p = A.PM[ref]; if (!p) return h("span", {}, ref);
    return h("button", { class: "tlink proto", title: p.fa, onclick: function () { A.go("proto", ref); } }, p.fa);
  };
  A.mDots = function (lvl) { return h("span", { class: "mdots", title: "تسلط: " + A.MLV[lvl] }, [1, 2, 3].map(function (i) { return h("i", { class: i <= lvl ? "on" : "" }); })); };
  A.empty = function (text, btn) { return h("div", { class: "empty" }, h("p", {}, text), btn || null); };
  A.tabs = function (items, cur, onPick) {
    return h("div", { class: "tabs", role: "tablist" }, items.map(function (it) {
      return h("button", { role: "tab", class: "tab" + (it[0] === cur ? " on" : ""), "aria-selected": it[0] === cur ? "true" : "false", onclick: function () { onPick(it[0]); } }, it[1]);
    }));
  };
  A.topicSelect = function (val, onPick, id) {
    var topics = S.all("topic");
    return h("select", { id: id || "topicSel", onchange: function (e) { onPick(e.target.value); } }, h("option", { value: "" }, "— بدون موضوع —"),
      topics.map(function (t) { return h("option", { value: t.id, selected: val === t.id }, t.title); }));
  };

  /* ---------- خانه ---------- */
  A.dueList = function () {
    var t = A.today(), items = [];
    var cards = A.dueCards();
    if (cards.length) items.push({ k: "review", txt: fa(cards.length) + " کارت مرور موعد امروز", sub: "بازیابی پیش از نگاه به پاسخ", go: function () { A.go("review"); } });
    S.all("sched", function (s) { return !s.done && s.due <= t; }).forEach(function (s) {
      var tp = S.get(s.topic);
      items.push({ k: "sched", txt: "برگه سفید " + s.label + (tp ? " — " + tp.title : s.title ? " — " + s.title : ""), sub: "چرخه ۱-۳-۷ · موعد " + A.fdate(s.due), go: function () { A.startProto("P3", { sched: s.id, topic: s.topic, preset: { topic: s.title || (tp && tp.title) || "" } }); } });
    });
    function lastRun(pid) { var r = S.all("pr", function (x) { return x.pid === pid && x.status === "done"; })[0]; return r ? A.localDay(r.created) : null; }
    var p2 = lastRun("P2"); if (p2 !== t) items.push({ k: "p", txt: "قرائت ۱۰ دقیقه‌ای امروز", sub: "یک رخداد امروز از پشت یک عینک علمی", go: function () { A.startProto("P2"); } });
    [["P4", 7, "جلسه هفتگی برگه سفید"], ["P5", 7, "تولید هفتگی بازی کارآگاهی"], ["P9", 30, "ممیزی دوحلقه‌ای ماهانه"]].forEach(function (x) {
      var l = lastRun(x[0]); if (!l || A.daysBetween(l, t) >= x[1]) items.push({ k: "p", txt: x[2], sub: l ? "آخرین اجرا " + A.fdate(l) : "هنوز اجرا نشده", go: function () { A.startProto(x[0]); } });
    });
    var act = S.all("srcq", function (s) { return s.status === "active"; }).length;
    var nn = A.nurseryNew ? A.nurseryNew().length : 0;
    if (nn) items.push({ k: "farm", txt: fa(nn) + " نهال در نهالستان مزرعه", sub: "جای‌گذاری هر مفهوم در درخت علم خودش", go: function () { A.go("farm", null, "nursery"); } });
    var ed = A.epiDue ? A.epiDue().length : 0;
    if (ed) items.push({ k: "farm", txt: fa(ed) + " پرونده معرفتی موعد بازبینی", sub: "نتیجه واقعی را ثبت کن؛ به کالیبراسیون مشترک می‌رود", go: function () { A.go("e_home"); } });
    /* گره‌گشا: یک سطرِ ترکیبی برای همهٔ ورزش‌های موعد (a17) */
    var kd = 0; if (A.kpracticeDue) { try { kd = (A.kpracticeDue() || []).length; } catch (e) { kd = 0; } }
    if (kd) items.push({ k: "knot", txt: fa(kd) + " ورزشِ گره موعد است", sub: "شناختنِ ساختارِ گره‌هایت در شکل‌های تازه", go: function () { A.go("kpractice"); } });
    /* مسئله‌های هم‌ساختار (a20): موعدها، به ترتیبِ مسئله */
    var pdue = []; if (A.pbDue) { try { pdue = A.pbDue() || []; } catch (e) { pdue = []; } }
    if (pdue.length) items.push({ k: "knot", txt: fa(pdue.length) + " مسئلهٔ هم‌ساختار موعد است", sub: "همان ساختارِ مسئله‌های خودت در لباسِ تازه", go: function () { A.go("e_prob", pdue[0].pid, "similar"); } });
    if (act > 2) items.unshift({ k: "warn", txt: fa(act) + " منبع فعال هم‌زمان (سقف پیشنهادی ۲)", sub: "بار بیرونی بالاست؛ یکی را به صف یا معدن ببر", go: function () { A.go("protos", null, "queue"); } });
    return items;
  };
  A.curWeek = function () {
    for (var i = 0; i < C.CURRICULUM.length; i++) {
      var w = C.CURRICULUM[i];
      if (w.ids.some(function (id) { return A.mastery(id).n < 2; })) return w;
    }
    return C.CURRICULUM[C.CURRICULUM.length - 1];
  };
  A.V.home = function () {
    var root = h("div", { class: "page" });
    var exs = S.all("ex", function (e) { return e.status === "done" && !e.sample; });
    var practiced = A.T.filter(function (t) { return A.mastery(t.id).n > 0; }).length;
    var pcts = exs.map(A.rubricPct).filter(function (x) { return x != null; });
    var avg = pcts.length ? Math.round(pcts.reduce(function (a, b) { return a + b; }, 0) / pcts.length) : null;
    var cpts = A.calibPoints(); var br = A.brier(cpts);
    var rt = A.recallTrend();
    root.appendChild(A.head("امروز · " + A.fdate(A.today()), "از فهمیدن تا ماندن", "کارهایی که امروز موعدشان رسیده و پیشرفتت اینجاست. برای یاد گرفتن خودِ روش‌ها برنامه ۸ هفته‌ای را دنبال کن؛ برای فهم یک موضوع تازه به «موضوع‌ها» برو."));
    if (A.courseState) {
      var cst = A.courseState(), cnl = A.courseNext && A.courseNext();
      var cwarm = cst && cst.topic && A.courseWarmDue ? A.courseWarmDue().length : 0;
      root.appendChild(h("section", { class: "card crs-home" },
        h("div", { class: "row between wrap gap" },
          h("div", {}, h("div", { class: "eyebrow" }, "🧭 دورهٔ گام‌به‌گام"),
            h("div", {}, cst && cst.topic ? (cnl ? "درسِ بعدی‌ات: " + (A.courseLessonName ? A.courseLessonName(cnl) : fa(cnl.tid) + " · " + (A.TM[cnl.tid] || {}).fa) : "دوره را تمام کرده‌ای.") : "نمی‌دانی از کجا شروع کنی؟ دوره قدم‌به‌قدم می‌بردت؛ " + (A.courseBlurb ? A.courseBlurb(true) : "هر درس قابلِ تقسیم به چند نشست است.")),
              cwarm ? h("div", { class: "small crs-homewarm" }, "گرم‌کردنِ امروز موعد است: " + fa(cwarm) + " پرسش از درس‌های قبلی (فاصله‌های ۱، ۳، ۷، ۲۱ و ۶۰ روزه).") : null),
          h("div", { class: "row gap wrap" },
            cwarm && !cnl ? h("button", { class: "btn crs-warmgo", onclick: function () { A.go("course", null, "warm"); } }, "▶ گرم‌کردنِ امروز") : null,
            h("button", { class: "btn" + (cwarm && !cnl ? " ghost" : ""), onclick: function () { if (cst && cst.topic && cnl) A.go("lesson", cnl.tid, (cst.step || {})[cnl.tid] || "s1"); else A.go("course"); } }, cst && cst.topic ? (cnl ? "▶ ادامهٔ دوره" : "نقشهٔ دوره") : "▶ شروعِ دوره")))));
    }
    var due = A.dueList();
    root.appendChild(h("section", { class: "grid2" },
      h("div", { class: "card" }, h("h2", {}, "کارهای موعددار"),
        due.length ? h("ul", { class: "duel" }, due.map(function (d) { return h("li", { class: "due " + d.k }, h("button", { class: "dueb", onclick: d.go }, h("span", { class: "dt" }, d.txt), h("span", { class: "ds" }, d.sub))); }))
          : h("p", { class: "muted" }, "چیزی موعد نیست. یک تمرین از هفته جاری برنامه انتخاب کن.")),
      weekCard()));
    root.appendChild(h("section", { class: "stats" },
      stat("تمرین ثبت‌شده", fa(exs.length), "تمرین‌های کامل‌شده (بدون نمونه‌ها)"),
      stat("تکنیک تمرین‌شده", fa(practiced) + " از " + fa(A.T.length), "دست‌کم یک تمرین کامل"),
      stat("میانگین روبریک", avg == null ? "—" : fa(avg) + "٪", "خودارزیابی ۰/۱/۲ پس از هر تمرین"),
      stat("دقت اطمینان (Brier؛ کمتر بهتر)", br == null ? "—" : fa(br.toFixed(2)), cpts.length ? fa(cpts.length) + " پیش‌بینی/پاسخ با درصد اطمینان" : "از مرور کارت‌ها و تکنیک ۲۴ پر می‌شود"),
      h("div", { class: "stat wide" }, h("div", { class: "sl" }, "روند درصد بازیابی برگه سفید"), A.spark(rt.map(function (x) { return x.v; })), h("div", { class: "small muted" }, rt.length ? "آخرین: " + fa(rt[rt.length - 1].v) + "٪" : "با اجرای پروتکل ۱-۳-۷ یا جلسه هفتگی پر می‌شود"))));
    var recent = S.all(null, function (r) { return r.type === "ex" || r.type === "pr"; }).slice(0, 6);
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "آخرین فعالیت‌ها"),
      recent.length ? h("ul", { class: "plain" }, recent.map(function (r) {
        var name = r.type === "ex" ? (A.TM[r.tid] ? "تکنیک " + fa(r.tid) + " · " + A.TM[r.tid].fa : "") : (A.PM[r.pid] ? A.PM[r.pid].fa : r.pid);
        var tp = r.topic && S.get(r.topic);
        return h("li", {}, h("button", { class: "linkish", onclick: function () { if (r.type === "ex") A.go("tech", r.tid, "ws:" + r.id); else A.go("proto", r.pid, r.id); } }, name), tp ? h("span", { class: "muted" }, " — " + tp.title) : null,
          r.sample ? h("span", { class: "chip" }, "نمونه") : null, h("span", { class: "muted small" }, " · " + A.fdate(r.updated) + (r.status === "draft" ? " · پیش‌نویس" : "")));
      })) : h("p", { class: "muted" }, "هنوز تمرینی ثبت نشده.")));
    return root;
    function stat(l, v, s) { return h("div", { class: "stat" }, h("div", { class: "sl" }, l), h("div", { class: "sv" }, v), h("div", { class: "small muted" }, s)); }
    function weekCard() {
      var w = A.curWeek();
      return h("div", { class: "card" }, h("div", { class: "eyebrow" }, "برنامه ۸ هفته‌ای · هفته " + fa(w.w)), h("h2", {}, w.fa), h("p", { class: "small" }, w.why),
        h("div", { class: "tl" }, w.ids.map(function (id) { var m = A.mastery(id); return h("div", { class: "wrow" }, A.techLink(id, { sub: "ws" }), A.mDots(m.lvl), h("span", { class: "small muted" }, fa(m.n) + " تمرین")); })),
        w.protos.length ? h("div", { class: "row gap wrap mt" }, w.protos.map(A.refChip)) : null,
        h("div", { class: "small muted mt" }, "معیار عبور از هفته: هر تکنیک دست‌کم ۲ تمرین کامل."));
    }
  };

  /* ---------- کتابخانه ---------- */
  A.libFilter = { q: "", pri: "", ev: "" };
  A.V.lib = function () {
    var root = h("div", { class: "page" });
    root.appendChild(A.head("کتابخانه", "۴۵ تکنیک در ۹ فاز", "روش‌های یادگیری، به ترتیب مراحل یادگیری (فاز ۰ تا ۸). یکی را باز کن تا ببینی چرا کار می‌کند، چطور انجامش دهی و تمرینش کنی. نقطه‌ها میزان تسلط تو را نشان می‌دهند؛ شماره‌ها همان شماره‌های سند Word توست."));
    var F = A.libFilter;
    var list = h("div", { class: "lib" });
    var bar = h("div", { class: "filters" },
      h("input", { type: "search", id: "libq", "aria-label": "جست‌وجوی تکنیک", placeholder: "جست‌وجو در نام، تعریف، نام انگلیسی…", value: F.q, oninput: function (e) { F.q = e.target.value; draw(); } }),
      h("select", { id: "libpri", "aria-label": "اولویت", onchange: function (e) { F.pri = e.target.value; draw(); } }, h("option", { value: "" }, "همه اولویت‌ها"), [1, 2, 3].map(function (p) { return h("option", { value: p, selected: String(F.pri) === String(p) }, "اولویت " + C.PRIORITY_INFO[p].fa); })),
      h("select", { id: "libev", "aria-label": "سطح شواهد", onchange: function (e) { F.ev = e.target.value; draw(); } }, h("option", { value: "" }, "همه سطوح شواهد"), ["A", "B", "C"].map(function (l) { return h("option", { value: l, selected: F.ev === l }, "شواهد " + l); })));
    root.appendChild(bar); root.appendChild(list);
    function draw() {
      list.innerHTML = "";
      C.PHASES.forEach(function (p) {
        var ids = A.T.filter(function (t) { return A.phaseOf(t.id) === p.n; }).map(function (t) { return t.id; });
        ids = ids.filter(function (id) {
          var t = A.TM[id], q = F.q.trim();
          if (F.pri && String(C.PRIORITY[id]) !== String(F.pri)) return false;
          if (F.ev && t.ev.lvl !== F.ev) return false;
          if (q && (t.fa + " " + t.en + " " + t.def + " " + (t.aka || []).join(" ")).toLowerCase().indexOf(q.toLowerCase()) < 0) return false;
          return true;
        });
        if (!ids.length) return;
        list.appendChild(h("section", { class: "phsec", style: { "--pc": "var(--p" + p.n + ")" } },
          h("div", { class: "phh" }, h("span", { class: "phn" }, fa(p.n)), h("div", {}, h("h2", {}, p.fa), h("p", { class: "small muted" }, p.goal))),
          h("div", { class: "tgrid" }, ids.map(function (id) {
            var t = A.TM[id], m = A.mastery(id);
            return h("button", { class: "tcard", onclick: function () { A.go("tech", id); } },
              h("div", { class: "tct" }, h("span", { class: "tno" }, fa(id)), h("span", { class: "tfa" }, t.fa), A.mDots(m.lvl)),
              h("div", { class: "ten" }, t.en),
              h("div", { class: "tdef" }, t.def),
              h("div", { class: "row gap wrap" }, A.priChip(id), A.evChip(t)));
          }))));
      });
      if (!list.children.length) list.appendChild(A.empty("موردی با این فیلتر پیدا نشد."));
    }
    draw();
    return root;
  };

  /* ---------- صفحه تکنیک ---------- */
  A.V.tech = function (id, sub) {
    var t = A.TM[id]; if (!t) return A.empty("تکنیک پیدا نشد.");
    var root = h("div", { class: "page tech", style: { "--pc": "var(--p" + A.phaseOf(id) + ")" } });
    var g = A.GOF[id], m = A.mastery(id);
    // قبلی/بعدی به ترتیب جریان شناختی (همان ترتیب کتابخانه: فاز ۰ تا ۸)، نه شمارهٔ سند
    var flow = []; C.PHASES.forEach(function (p) { A.T.forEach(function (x) { if (A.phaseOf(x.id) === p.n) flow.push(x.id); }); });
    var fi = flow.indexOf(id), prevId = fi > 0 ? flow[fi - 1] : null, nextId = fi >= 0 && fi < flow.length - 1 ? flow[fi + 1] : null;
    var prev = prevId != null && A.TM[prevId], next = nextId != null && A.TM[nextId];
    root.appendChild(h("div", { class: "crumbs" }, h("button", { class: "linkish", onclick: function () { A.go("lib"); } }, "← ۴۵ تکنیک"),
      h("span", { class: "row gap" }, prev ? h("button", { class: "linkish", title: "قبلی در جریان ۹ فازی: " + prev.fa, onclick: function () { A.go("tech", prevId, (sub || "").split(":")[0] || null); } }, "قبلی: " + fa(prevId)) : null,
        next ? h("button", { class: "linkish", title: "بعدی در جریان ۹ فازی: " + next.fa, onclick: function () { A.go("tech", nextId, (sub || "").split(":")[0] || null); } }, "بعدی: " + fa(nextId)) : null)));
    root.appendChild(h("header", { class: "thead" },
      h("div", { class: "tbig" }, fa(id)),
      h("div", { class: "tmeta" },
        h("div", { class: "eyebrow" }, "گروه " + fa(g.g) + " · " + g.fa),
        h("h1", {}, t.fa), h("div", { class: "en" }, t.en + (t.aka && t.aka.length ? " · " + t.aka.join("، ") : "")),
        h("div", { class: "row gap wrap" }, A.phaseChip(A.phaseOf(id)), A.priChip(id), A.evChip(t), h("span", { class: "chip" }, "تسلط تو: " + A.MLV[m.lvl] + (m.avg != null ? " · " + fa(m.avg) + "٪" : ""))))));
    var tab = (sub || "und").split(":")[0];
    var cont = h("div", { class: "tbody" });
    root.appendChild(A.tabs([["und", "فهم: چرا کار می‌کند"], ["do", "اجرا: دقیقاً چطور"], ["ws", "کارگاه تمرین"], ["rel", "ارتباطات"], ["hist", "سابقه"]], tab, function (k) { A.go("tech", id, k); }));
    root.appendChild(cont);
    if (tab === "und") cont.appendChild(understand(t));
    else if (tab === "do") cont.appendChild(doIt(t));
    else if (tab === "rel") cont.appendChild(relations(t));
    else if (tab === "ws") cont.appendChild(A.workshop(t, (sub || "").split(":")[1]));
    else cont.appendChild(history(t));
    return root;
  };
  function sec(title, body, cls) { return h("section", { class: "tsec " + (cls || "") }, h("h3", {}, title), body); }
  function para(txt) { return h("p", {}, txt); }
  function understand(t) {
    return h("div", { class: "cols" },
      h("div", { class: "colmain" },
        sec("تعریف", h("p", { class: "def" }, t.def)),
        sec("چرا کار می‌کند", para(t.why)),
        sec("سازوکار شناختی", para(t.mech)),
        sec("فلسفه و ریشه", para(t.philo)),
        t.fix ? sec("اصلاحیه نسبت به اسناد شما", para(t.fix), "fixsec") : null),
      h("aside", { class: "colside" },
        sec("سطح شواهد: " + t.ev.lvl + (A.EV_BASIS[t.ev.basis] ? " (" + A.EV_BASIS[t.ev.basis] + ")" : ""), para(t.ev.note), "evsec ev" + t.ev.lvl),
        sec("کی به کار ببرم", para(t.when)),
        sec("کی کار نمی‌کند", para(t.limits)),
        sec("منبع در اسناد", h("p", { class: "small" }, t.src)),
        window.SRCX && SRCX[t.id] ? sec("تعریف در متن منبع (PDF ص " + fa(SRCX[t.id].page) + ")", h("p", { class: "srcq" }, SRCX[t.id].def), "srcsec") : sec("منبع", h("p", { class: "small" }, "این تکنیک در PDF نیست؛ از افزوده‌های سند Word شماست (فصل ۷)."), "srcsec"),
        h("button", { class: "btn wide", onclick: function () { A.go("tech", t.id, "ws"); } }, "رفتن به کارگاه تمرین")));
  }
  function doIt(t) {
    var ex = t.example || {};
    var dn = { trading: "تریدینگ", banking: "بانک و وثیقه", game: "بازی‌سازی", cinema: "سینما", science: "علم" };
    return h("div", { class: "cols" },
      h("div", { class: "colmain" },
        sec("روش اجرا گام‌به‌گام", h("ol", { class: "steps" }, t.steps.map(function (s) { return h("li", {}, s); }))),
        window.SRCX && SRCX[t.id] ? sec("کاربرد عملی در متن منبع (PDF ص " + fa(SRCX[t.id].page) + ")", h("div", {}, SRCX[t.id].app.split("\n").map(function (x) { return h("p", { class: "srcq" }, x); })), "srcsec") : null,
        S.settings().hideGen ? null : h("details", { class: "tsec exsec gen" }, h("summary", {}, "مثال کارشده ساخته سامانه · " + (dn[ex.d] || ex.d || "") + " — در منابع شما نیست"), h("p", { class: "small muted" }, "این مثال را سامانه نوشته تا ببینی اجرای کامل تکنیک روی یک موضوع واقعی چه شکلی است. حوزه‌ها از «قلاب‌های تجربی» سند Word تو آمده‌اند؛ نکته‌های فنی داخل مثال توصیه نیستند. همه مثال‌ها را می‌توانی از «تنظیمات» پنهان کنی."), h("h4", {}, ex.title), para(ex.text)),
        sec("سطح‌بندی مهارت", h("ol", { class: "levels" }, t.levels.map(function (s) { return h("li", {}, s); })))),
      h("aside", { class: "colside" },
        sec("دوز و زمان", para(t.dose)),
        sec("خطاهای رایج", h("ul", { class: "warnl" }, t.mistakes.map(function (s) { return h("li", {}, s); }))),
        sec("نشانه‌های اجرای درست", h("ul", { class: "okl" }, t.signals.map(function (s) { return h("li", {}, s); }))),
        sec("روبریک خودارزیابی", h("ol", { class: "small" }, t.rubric.map(function (s) { return h("li", {}, s); })))));
  }
  function relations(t) {
    var id = t.id, wrap = h("div", { class: "cols" });
    var main = h("div", { class: "colmain" });
    var kinds = [["req", "پیش‌نیازهای این تکنیک", function (e) { return e[1] === id; }, 0], ["req", "این تکنیک پیش‌نیاز است برای", function (e) { return e[0] === id; }, 1],
      ["feeds", "ورودی‌ها (خروجی چه تکنیکی به اینجا می‌رسد)", function (e) { return e[1] === id; }, 0], ["feeds", "خروجی این تکنیک می‌رود به", function (e) { return e[0] === id; }, 1],
      ["pairs", "مکمل‌ها", function (e) { return e[0] === id || e[1] === id; }, 2]];
    kinds.forEach(function (k) {
      var es = C.EDGES.filter(function (e) { return e[2] === k[0] && k[2](e); });
      if (!es.length) return;
      main.appendChild(sec(k[1], h("ul", { class: "rels" }, es.map(function (e) {
        var other = k[3] === 0 ? e[0] : k[3] === 1 ? e[1] : (e[0] === id ? e[1] : e[0]);
        return h("li", {}, A.techLink(other, { sub: "rel" }), h("div", { class: "small" }, e[3]));
      }))));
    });
    main.appendChild(sec("نمای گراف همسایگی", miniGraph(id)));
    var cs = C.CONCERNS.filter(function (c) { return (t.concerns || []).indexOf(c.id) >= 0; });
    var protos = C.PROTOCOLS.filter(function (p) { return p.ids.indexOf(id) >= 0; });
    var weeks = C.CURRICULUM.filter(function (w) { return w.ids.indexOf(id) >= 0; });
    wrap.appendChild(main);
    wrap.appendChild(h("aside", { class: "colside" },
      sec("دغدغه‌هایی که پاسخ می‌دهد", cs.length ? h("ul", { class: "plain" }, cs.map(function (c) { return h("li", {}, h("button", { class: "linkish", onclick: function () { A.go("concerns", c.id); } }, "دغدغه " + fa(c.id.slice(1)) + ": " + c.text.slice(0, 80) + (c.text.length > 80 ? "…" : ""))); })) : h("p", { class: "muted" }, "—")),
      sec("در کدام پروتکل‌ها به کار می‌رود", protos.length ? h("div", { class: "col gap" }, protos.map(function (p) { return A.refChip(p.id); })) : h("p", { class: "muted" }, "—")),
      sec("جایگاه در برنامه ۸ هفته‌ای", weeks.length ? h("p", {}, "هفته " + fa(weeks[0].w) + ": " + weeks[0].fa) : null),
      sec("جایگاه در جریان ۹ فازی", h("p", {}, C.PHASES[A.phaseOf(id)].fa + ". " + C.PHASES[A.phaseOf(id)].goal)),
      (function () { var ls = []; (A.ESTL || []).forEach(function (s) { (s.tech || []).forEach(function (x) { if (x.id === id) ls.push({ s: s, why: x.why }); }); });
        return ls.length ? sec("ایستگاه‌های کارخانه معرفت‌شناسی که با این تکنیک سازوکار مشترک دارند", h("ul", { class: "plain" }, ls.map(function (x) { return h("li", {}, A.stLink(x.s.id), h("div", { class: "small" }, x.why)); }))) : null; })()));
    return wrap;
  }
  function miniGraph(id) {
    var es = C.EDGES.filter(function (e) { return e[0] === id || e[1] === id; });
    var txt = es.map(function (e) { var a = A.TM[e[0]], b = A.TM[e[1]]; return fa(e[0]) + " " + a.fa + (e[2] === "pairs" ? " +> " : " -> ") + fa(e[1]) + " " + b.fa + " : " + (e[2] === "req" ? "پیش‌نیاز" : e[2] === "feeds" ? "تغذیه" : "مکمل"); }).join("\n");
    return h("div", {}, A.renderGraph(txt), h("div", { class: "small muted" }, "سبز = رابطه مکمل · خاکستری = پیش‌نیاز یا تغذیه (جهت پیکان)."));
  }
  function history(t) {
    var exs = S.all("ex", function (e) { return e.tid === t.id; });
    if (!exs.length) return A.empty("هنوز تمرینی برای این تکنیک ثبت نشده.", h("button", { class: "btn", onclick: function () { A.go("tech", t.id, "ws"); } }, "شروع اولین تمرین"));
    var pts = exs.filter(function (e) { return e.status === "done"; }).map(A.rubricPct).filter(function (x) { return x != null; }).reverse();
    return h("div", {},
      h("div", { class: "card" }, h("div", { class: "sl" }, "روند نمره روبریک"), A.spark(pts)),
      h("table", { class: "dt" }, h("thead", {}, h("tr", {}, h("th", {}, "تاریخ"), h("th", {}, "موضوع"), h("th", {}, "وضعیت"), h("th", {}, "روبریک"), h("th", {}, ""))),
        h("tbody", {}, exs.map(function (e) {
          var tp = e.topic && S.get(e.topic); var p = A.rubricPct(e);
          return h("tr", {}, h("td", {}, A.fdate(e.updated)), h("td", {}, tp ? tp.title : "—", e.sample ? h("span", { class: "chip" }, "نمونه") : null), h("td", {}, e.status === "done" ? "کامل" : "پیش‌نویس"), h("td", {}, p == null ? "—" : fa(p) + "٪"),
            h("td", {}, h("button", { class: "btn ghost sm", onclick: function () { A.go("tech", t.id, "ws:" + e.id); } }, "باز کردن")));
        }))));
  }

  /* ---------- کارگاه ---------- */
  A.newEx = function (tid, topic) { return S.put({ id: A.uid("ex"), type: "ex", tid: tid, topic: topic || "", status: "draft", data: {}, rubric: [] }); };
  A.workshop = function (t, exId) {
    var wrap = h("div", { class: "workshop" });
    var ex = exId && S.get(exId);
    if (!ex) {
      var drafts = S.all("ex", function (e) { return e.tid === t.id && e.status === "draft"; });
      var pickTopic = A.pendingTopic || "";
      wrap.appendChild(h("div", { class: "card start" },
        h("h2", {}, "تمرین جدید: " + t.fa),
        h("p", { class: "small" }, "تمرین را روی یک موضوع واقعی که الان درگیرش هستی انجام بده (ترید، پرونده وثیقه، مرحله بازی، فیلم، یا درسی که می‌خوانی). تمرین روی موضوع ساختگی، مهارت انتقال‌پذیر نمی‌سازد."),
        h("div", { class: "row gap wrap" }, h("label", { for: "wsTopic", class: "small" }, "موضوع:"), A.topicSelect(pickTopic, function (v) { pickTopic = v; }, "wsTopic"),
          h("button", { class: "btn", onclick: function () { var e = A.newEx(t.id, pickTopic); A.pendingTopic = null; A.go("tech", t.id, "ws:" + e.id); } }, "شروع تمرین"),
          h("button", { class: "btn ghost", onclick: function () { A.go("topics"); } }, "ساخت موضوع جدید")),
        drafts.length ? h("div", { class: "mt" }, h("div", { class: "small muted" }, "پیش‌نویس‌های نیمه‌کاره:"), h("ul", { class: "plain" }, drafts.map(function (d) {
          var tp = d.topic && S.get(d.topic);
          return h("li", {}, h("button", { class: "linkish", onclick: function () { A.go("tech", t.id, "ws:" + d.id); } }, (tp ? tp.title : "بدون موضوع") + " · " + A.fdate(d.updated)));
        }))) : null));
      wrap.appendChild(h("div", { class: "card soft" }, h("h3", {}, "پیش از شروع، گام‌ها را یک بار مرور کن"), h("ol", { class: "steps small" }, t.steps.map(function (s) { return h("li", {}, s); }))));
      return wrap;
    }
    var save = A.debounce(function () { S.put(ex); }, 500);
    var tp = ex.topic && S.get(ex.topic);
    wrap.appendChild(h("div", { class: "wshead" },
      h("div", {}, h("div", { class: "eyebrow" }, ex.sample ? "تمرین نمونه (قابل حذف)" : ex.status === "done" ? "تمرین کامل‌شده · قابل ویرایش" : "پیش‌نویس · خودکار ذخیره می‌شود"),
        h("div", { class: "row gap wrap" }, h("label", { for: "exTopic", class: "small" }, "موضوع:"), A.topicSelect(ex.topic, function (v) { ex.topic = v; S.put(ex); }, "exTopic"))),
      h("button", { class: "btn ghost sm", onclick: function () { A.go("tech", t.id, "ws"); } }, "تمرین دیگر")));
    var ws = A.renderWS(t.ws, ex.data, function () { save(); }, { prefix: "ex" });
    wrap.appendChild(h("div", { class: "card wsform" }, ws));
    // روبریک
    ex.rubric = ex.rubric || [];
    var rubOut = h("span", { class: "pill" });
    function rubUpdate() { var p = A.rubricPct(ex); rubOut.textContent = p == null ? "هنوز نمره نداده‌ای" : "نمره: " + fa(p) + "٪"; rubOut.className = "pill " + (p == null ? "" : p >= 75 ? "good" : p >= 50 ? "warn" : "bad"); }
    var rub = h("div", { class: "rubric" }, t.rubric.map(function (c, i) {
      return h("div", { class: "rrow" }, h("div", { class: "rc" }, c), h("div", { class: "seg", role: "radiogroup", "aria-label": c }, [0, 1, 2].map(function (v) {
        return h("button", { type: "button", role: "radio", "aria-checked": ex.rubric[i] === v ? "true" : "false", class: "sg" + (ex.rubric[i] === v ? " on" : ""), onclick: function (e) {
          ex.rubric[i] = v; e.target.parentNode.querySelectorAll(".sg").forEach(function (b, j) { b.classList.toggle("on", j === v); b.setAttribute("aria-checked", j === v ? "true" : "false"); }); rubUpdate(); S.put(ex);
        } }, ["۰ نه", "۱ تاحدی", "۲ کامل"][v]);
      })));
    }));
    rubUpdate();
    wrap.appendChild(h("div", { class: "card" }, h("div", { class: "row between wrap" }, h("h3", {}, "خودارزیابی: آیا درست اجرا کردم؟"), rubOut),
      h("p", { class: "small muted" }, "صادقانه نمره بده؛ این نمره فقط برای خودت است و روند تسلطت را می‌سازد. نشانه‌های اجرای درست: " + t.signals.join(" · ")), rub));
    // عملیات
    var aiBox = h("div", { class: "aibox" + (ex.ai ? "" : " hidden") });
    if (ex.ai) aiBox.appendChild(A.md(ex.ai));
    var aiBtn = h("button", { class: "btn ghost", onclick: function () {
      var miss = ws._validate();
      if (miss.length) { A.toast("اول خودت فیلدهای الزامی را پر کن؛ منتقد بعد از تلاش تو فعال می‌شود.", "bad"); return; }
      aiBtn.disabled = true; aiBtn.textContent = "در حال نقد…";
      var g = A.GOF[t.id];
      var user = "تکنیک: " + t.id + ". " + t.fa + " (" + t.en + ") — گروه: " + g.fa + "\nتعریف: " + t.def + "\nگام‌های درست اجرا:\n" + t.steps.map(function (s, i) { return (i + 1) + ") " + s; }).join("\n") +
        "\nروبریک:\n" + t.rubric.map(function (s, i) { return (i + 1) + ") " + s; }).join("\n") + "\nدستور ویژه این تکنیک: " + t.ai +
        "\nخودارزیابی کاربر: " + (A.rubricPct(ex) == null ? "نداده" : A.rubricPct(ex) + "٪") + "\n\n--- کار کاربر ---\n" + A.serializeWS(t.ws, ex.data);
      A.callAI(A.AI_SYS, user).then(function (txt) {
        ex.ai = txt; S.put(ex); aiBox.innerHTML = ""; aiBox.appendChild(A.md(txt)); aiBox.classList.remove("hidden");
      }, function (err) { A.toast((err && err.message) || "خطا در اتصال", "bad"); }).then(function () { aiBtn.disabled = false; aiBtn.textContent = "نقد منتقد هوش مصنوعی"; });
    } }, "نقد منتقد هوش مصنوعی");
    var actions = h("div", { class: "row gap wrap actions" },
      h("button", { class: "btn", onclick: function () {
        var miss = ws._validate();
        if (miss.length) { A.toast("این بخش‌ها هنوز خالی‌اند: " + miss.slice(0, 3).join("، ") + (miss.length > 3 ? "…" : ""), "bad"); var f = wrap.querySelector(".missing"); if (f) f.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
        ex.status = "done"; S.put(ex); A.onExDone(ex); A.toast("تمرین ثبت شد."); if (A.rubricPct(ex) == null) A.toast("روبریک را هم نمره بده تا تسلطت اندازه گرفته شود.");
      } }, ex.status === "done" ? "ثبت مجدد" : "ثبت نهایی"),
      aiBtn,
      t.card ? h("button", { class: "btn ghost", onclick: function () { A.cardDialog(fill(t.card.q, ex.data), fill(t.card.a, ex.data), { tid: t.id, topic: ex.topic, src: ex.id }); } }, "ساخت کارت مرور") : null,
      h("button", { class: "btn ghost", onclick: function () { A.cardDialog("", "", { tid: t.id, topic: ex.topic, src: ex.id }); } }, "کارت دلخواه"),
      h("button", { class: "btn ghost", onclick: function () { var tp = ex.topic && S.get(ex.topic); var txt = ""; t.ws.forEach(function (f) { if (!txt && (f.t === "text" || f.t === "area") && A.filled(ex.data[f.k])) txt = String(ex.data[f.k]).slice(0, 200); }); A.placeDialog({ text: tp ? tp.title : txt, body: tp ? txt : "", src: { t: "ex", id: ex.id } }, function () { }); } }, "کاشت در مزرعه"),
      A.confirmBtn("حذف تمرین", function () { S.del(ex.id); A.go("tech", t.id, "ws"); }));
    wrap.appendChild(h("div", { class: "card" }, actions, h("p", { class: "small muted" }, "منتقد هوش مصنوعی کار را به جای تو انجام نمی‌دهد؛ با روبریک می‌سنجد، ضعیف‌ترین گام را نشان می‌دهد، پرسش می‌پرسد و یک سرنخ می‌دهد."), aiBox));
    return wrap;
    function fill(tpl, d) { return (tpl || "").replace(/\{(\w+)\}/g, function (_, k) { var v = d[k]; if (Array.isArray(v)) return v.map(function (x) { return typeof x === "object" ? Object.keys(x).map(function (kk) { return x[kk]; }).join(" – ") : x; }).filter(Boolean).join("؛ "); return v == null ? "…" : String(v); }); }
  };
  A.confirmBtn = function (label, fn) {
    var b = h("button", { class: "btn danger ghost", type: "button", onclick: function () {
      if (b.dataset.arm) { fn(); return; }
      b.dataset.arm = "1"; b.textContent = "مطمئنی؟ دوباره بزن"; setTimeout(function () { if (document.body.contains(b)) { delete b.dataset.arm; b.textContent = label; } }, 3000);
    } }, label);
    return b;
  };
  A.md = function (txt) {
    var el = h("div", { class: "md" });
    var html = A.esc(txt).replace(/^### (.*)$/gm, "<h4>$1</h4>").replace(/^## (.*)$/gm, "<h4>$1</h4>").replace(/^# (.*)$/gm, "<h4>$1</h4>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/^\s*[-*•] (.*)$/gm, "<li>$1</li>").replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>");
    el.innerHTML = "<p>" + html + "</p>"; return el;
  };
  A.cardDialog = function (q, a, extra, onDone) {
    var ov = h("div", { class: "overlay", role: "dialog", "aria-modal": "true", "aria-label": "ساخت کارت مرور" });
    var qi = h("textarea", { id: "cdq", rows: 3 }); qi.value = q;
    var ai = h("textarea", { id: "cda", rows: 4 }); ai.value = a;
    ov.appendChild(h("div", { class: "dialog" }, h("h3", {}, "کارت مرور فاصله‌دار"),
      h("p", { class: "small muted" }, "کارت خوب «چرا» یا «چگونه» می‌پرسد، نه تعریف. پاسخ را با کلمات خودت بنویس."),
      h("label", { for: "cdq" }, "پرسش (رو)"), qi, h("label", { for: "cda" }, "پاسخ (پشت)"), ai,
      h("div", { class: "row gap" }, h("button", { class: "btn", onclick: function () { if (!qi.value.trim() || !ai.value.trim()) { A.toast("رو و پشت کارت را پر کن.", "bad"); return; } var cd = A.newCard(qi.value.trim(), ai.value.trim(), extra); ov.remove(); A.toast("کارت ساخته شد؛ از امروز در صف مرور است."); if (onDone) onDone(cd); } }, "ساخت کارت"),
        h("button", { class: "btn ghost", onclick: function () { ov.remove(); } }, "انصراف"))));
    A.layer().appendChild(ov); qi.focus();
  };
})(APP);
