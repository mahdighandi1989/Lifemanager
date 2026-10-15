/* ===== «📚 منبع‌ها و پوشش»: هر کتاب یا منطقِ بیرونی که مالک می‌فرستد، مورد‌به‌مورد با سامانه سنجیده و دیده می‌شود (مالک ۲۰۲۶-۱۰-۱۵) =====
   مالک: «می‌خوام در ادامه باز هم کتاب‌ها و منطق‌های بیشتری بفرستم تا زمانی برسه که بگی دیگه چیزی نیست که در سیستم نباشه … همه چیز در
   ارتباط با هم باشه و معنا پیدا کنه و جزیره‌ای نباشه … دستیار بفهمتش … تو اون صفحه در تب‌ها دیده بشه و همه چیز به‌روز بشه».
   نخستین منبع: «چگونه آن را حل کنیم» ِ پولیا. ولی این بخش «سامانهٔ پولیا» نیست؛ فقط آینهٔ پوشش است: هر موردِ منبع می‌گوید در کدام تونلِ
   موجودِ صفحه (حرکت، تکنیک، خانوادهٔ گره، ایستگاه، سفر، …) زندگی می‌کند و چقدر عمیق.
   داده: sources/<id>/{source.json, items.json, coverage.json} ⇒ window.SRC_COV (build.py). روال و قرارداد: AGENTS.md «📚 منبع‌ها و پوشش».
   داوری‌ها («عمیق / سطحی / ندارد / نامربوط») را بازبینِ مستقل با اجرای صفحه می‌دهد، نه این کد؛ این کد فقط نشان می‌دهد و پیوند می‌زند. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S;
  var SR = A.SOURCES = {};
  var VERD = [["عمیق", "good"], ["سطحی", "warn"], ["ندارد", "bad"], ["نامربوط", ""]];
  SR.VERD = VERD;
  SR.all = function () { return window.SRC_COV || []; };
  SR.get = function (id) { return SR.all().filter(function (s) { return s.id === id; })[0] || null; };
  SR.counts = function (src) {
    var c = { "عمیق": 0, "سطحی": 0, "ندارد": 0, "نامربوط": 0, "سنجیده‌نشده": 0 }, V = (src.coverage || {}).verdicts || {};
    (src.items || []).forEach(function (it) { var v = (V[it.id] || {}).verdict; c[v in c ? v : "سنجیده‌نشده"]++; });
    return c;
  };
  /* شناسهٔ تونلِ سامانه ⇒ جایِ واقعی (ممیزیِ ۲۰۲۶-۱۰-۱۵، L3/M1): یک خواننده برای سه مصرف — پیوندِ «↗» در این نما، یالِ «پوشش» در
     «🗺 نقشه‌ها» (SR.nodeOf) و جایِ هر مورد برای دستیار. شناسه‌های coverage.json را این کد عوض نمی‌کند (قلمروِ lla-sources)؛ فقط می‌خواندشان:
     «proto:P11 (حالتِ مسئله)» ⇒ proto:P11؛ «move:eq-table indep (a19)» ⇒ صفحهٔ حرکتِ «معادله» با جدولِ ترجمه؛ شناسه‌ای که نمای جدا ندارد
     ⇒ نزدیک‌ترین نما + «جایِ دقیق: …»؛ و آنچه هیچ نمایی ندارد (کد) ⇒ بی‌پیوند با دلیلِ صریح. */
  function parseSid(sid) {
    var raw = String(sid == null ? "" : sid).trim(), m = /^([a-z_]+):\s*(.*)$/i.exec(raw);
    if (!m) return { k: "", v: raw, note: "", raw: raw, range: false };
    var rest = m[2].trim(), note = "", pm = /^(.*?)\s*\((.*)\)\s*$/.exec(rest);
    if (pm) { rest = pm[1].trim(); note = pm[2].trim(); }
    var range = /…|\.\.\./.test(rest), t = /^([^\s…،,+/]+)\s*(.*)$/.exec(rest) || [0, rest, ""];
    if (t[2]) note = (t[2] + (note ? " (" + note + ")" : "")).trim();
    return { k: m[1].toLowerCase(), v: t[1] || "", note: note, raw: raw, range: range };
  }
  SR.parseSid = parseSid;
  function bare(P) { return P.raw.replace(/^[a-z_]+:\s*/i, ""); }
  /* نامِ فارسیِ قابلیت‌های شبیه‌سازِ مسئله (prob:*) — برای «جایِ دقیق»؛ کلیدِ ناشناخته با خودِ شناسه گفته می‌شود */
  var PROBF = { "small-win": "موفقیتِ کوچک پس از گامِ نادرست", moods: "حالِ تو پس از گامِ نادرست", joy: "لذتِ کشف پس از گامِ درست", "own-move": "حرکتِ خودت پیش از دیدنِ گام",
    "simulator-levels": "سه سطحِ شبیه‌ساز", "practice-cta": "روشن‌کردنِ مسئله‌های کوتاهِ تمرینی", "ask-now": "«❔ پرسشِ همین لحظه» بالای هر گام", motive: "«انگیزهٔ این گام» پس از دیدنِ گام",
    lookback: "بازنگری پس از آخرین گامِ هر سطح", lessons: "درس‌های همین مسئله", similar: "مسئله‌های هم‌ساختار", "solve-review": "مرورِ فاصله‌دار بالای شبیه‌ساز",
    "hint-ladder": "نردبانِ سرنخ (کلی ⇐ خاص)", hint: "سرنخِ گام", stepcheck: "وارسیِ گام‌به‌گامِ حلِ خودت", "understand-card": "کارتِ «مسئله را بفهم» پیش از گامِ ۱",
    guess: "حدس پیش از حل", "guess-first": "حدس در نخستین برخورد", drills: "تمرینِ آزمودنِ حدس", "dead-ends": "راه‌های بن‌بست", path: "راهِ حل", kind: "نوعِ مسئله (یافتنی/اثباتی)",
    will: "«🌱 کوچک‌ترین گامِ بعد»", checkpoint: "ایستِ پیشرفت («پیشرفت: نه»)", inject: "افزودنِ مسئلهٔ تو", "personal-sim": "شبیه‌سازِ مسئلهٔ خودت" };
  var MOVEF = { drills: [".mv-drills", "بخشِ «ورزشِ همین حرکت» در صفحهٔ هر حرکت"], "drill-answer": [".mv-drills", "پاسخِ «ورزشِ همین حرکت» در صفحهٔ هر حرکت"],
    "eq-table": [".mv-eqtab", "«جدولِ ترجمهٔ شرط» در صفحهٔ حرکتِ «معادله»", "mv_equation"], ask: [".mv-askcard", "«پرسشی که از خودت می‌پرسی» در صفحهٔ هر حرکت"],
    accuracy: [".mv-acccard", "«دقتِ تشخیصِ حرکت» در صفحهٔ هر حرکت"], "transfer-note": [".mv-transfer", "«دربارهٔ انتقال» بالای فهرستِ حرکت‌ها"],
    "untagged-steps": [".mv-untagged", "«گام‌های بی‌برچسب» در فهرستِ حرکت‌ها"], "interleaved-practice": [".mv-grid", "«تمرینِ درهم» از فهرستِ حرکت‌ها"] };
  var SRSF = { moves: ["moves", "موعدِ هر حرکت (ورزشِ حرکت)"], "none-moves": ["moves", "حرکت‌ها"], "sim-steps": ["e_prob", "مرورِ گام‌های شبیه‌ساز"], "solve-review": ["e_prob", "مرورِ فاصله‌دارِ حلِ مسئله"],
    "isomorph-ladder": ["e_prob", "نردبانِ مسئله‌های هم‌ساختار"], cards: ["review", "کارت‌های مرور"], "review-cards": ["review", "کارت‌های مرور"], "knot-ladder": ["kpractice", "نردبانِ ورزشِ گره‌ها"], "epi-warm": ["epi_course", "گرم‌کردنِ دورهٔ سنجش"] };
  function famOf(v) { var m = /^f(\d+)/i.exec(String(v || "")); return m ? "F" + (+m[1]) : null; }
  function kfamId(F) { return F && A.KF && A.KF.some(function (x) { return x.id === F; }) ? F : null; }
  function terrSys(aid) { var out = null; ((window.SYS_TERR || {}).systems || []).forEach(function (m) { (m.groups || []).forEach(function (g) { (g.areas || []).forEach(function (a) { if (a.id === aid) out = m.id; }); }); }); return out; }
  /* ⇒ { view, arg, sub, sel, fam, node, where, none, assist } — node کلیدِ گرهِ گرافِ «🗺 نقشه‌ها» است */
  SR.target = function (sid) {
    var P = parseSid(sid), k = P.k, v = P.v, T = { where: P.note ? bare(P) : "", node: null };
    var V = A.V || {}, has = function (x) { return !!V[x]; };
    function view(x, arg, sub) { if (!has(x)) { T.none = T.none || "نمای «" + x + "» در این نسخه نیست"; return T; } T.view = x; T.arg = arg == null ? null : arg; T.sub = sub == null ? null : sub; if (!T.node) T.node = "view:" + x; return T; }
    if (k === "tech" && A.T && A.T.some(function (t) { return String(t.id) === String(parseInt(v, 10)); })) { T.node = "tech:" + parseInt(v, 10); return view("tech", parseInt(v, 10)); }
    if (k === "move" || k === "moves") {
      if (!P.range && A.MOVES && A.MOVES[v]) { T.node = "move:" + v; return view("move", v); }
      var mf = MOVEF[v], mv = (/(mv_[a-z_]+)/.exec(P.note) || [])[1] || (mf && mf[2]);
      if (P.range) T.where = "چند حرکت: " + bare(P);
      else if (mf) { T.sel = mf[0]; T.where = mf[1] + (P.note ? " — " + P.note : ""); }
      else T.where = bare(P);
      if (!P.range && mv && A.MOVES && A.MOVES[mv]) { T.node = "move:" + mv; return view("move", mv); }
      return view("moves");
    }
    if (k === "proto" && A.C && (A.C.PROTOCOLS || []).some(function (p) { return p.id === v; })) { T.node = "proto:" + v; return view("proto", v); }
    if (k === "kfam" || k === "kact" || k === "kprobe" || k === "knot") {
      var F = kfamId(k === "kprobe" ? famOf(v) : String(v).split(/[.:]/)[0]);
      if (F) { T.fam = F; T.node = "kfam:" + F; if (k !== "kfam" || /\./.test(v) || P.note) T.where = "گره‌گشا، خانوادهٔ " + F + ": " + bare(P); return view("kcases"); }
    }
    if (/^k(step|stmt|verify|fam|act|probe)$/.test(k) || k === "knot") { T.where = "گره‌گشا (موقعیت ⇐ گام‌ها): " + bare(P); return view("kcases"); }
    if (k === "kgen") { T.where = "سازندهٔ تمرینِ «" + bare(P) + "» — در «🏋️ ورزشِ گره‌ها» و ورزشِ حرکت‌ها"; return view("kpractice"); }
    if (k === "ksim") { if ((A.KSIM || {})[v]) return view("ksims", v); T.where = "شبیه‌سازِ گره «" + v + "»"; return view("ksims"); }
    if ((k === "station" || k === "ws") && (window.EPI_ST || []).some(function (x) { return x.id === v; })) { T.node = "station:" + v; if (k === "ws") T.where = "کاربرگِ ایستگاه: " + bare(P); return view("e_st", v); }
    if (k === "factory" || k === "encode") { T.where = "کارخانه: " + bare(P); return view("e_home"); }
    if (k === "prob" || k === "problem") {
      if (A.getProb && A.getProb(v)) { T.node = "prob:" + v; return view("e_prob", v); }
      if (k === "prob") { T.where = "شبیه‌سازِ هر مسئله («🧗 مسئله‌های بزرگ» ⇐ یک مسئله ⇐ شبیه‌ساز): " + (PROBF[v] || v) + (P.note ? " — " + P.note : ""); if (v === "practice-cta") T.sel = ".practice-cta, .pb-practice"; }
      else T.where = "فهرستِ مسئله‌ها: " + bare(P);
      return view("e_prob");
    }
    if (k === "journey") { T.where = "گامِ " + v + " ِ سفرِ هر موضوع"; return view("topics"); }
    if (k === "terr") { var sy = terrSys(v); if (sy) { T.node = "sarea:" + v; return view("sterr", sy); } T.where = "حوزهٔ قلمرو: " + v; return view("sterr"); }
    if (k === "course") {
      var sm = /^sim:(\d+)/.exec(bare(P)), ct = null; try { ct = A.courseState ? A.courseState() : null; } catch (e) { }
      if (sm) { var n = +sm[1]; T.where = "شبیه‌سازِ درسِ تکنیکِ " + fa(n) + " (دوره، قدمِ ۲ «امتحان کن»)"; T.sel = ".crs-sim"; if (A.T && A.T.some(function (t) { return t.id === n; })) T.node = "tech:" + n; return ct && ct.topic ? view("lesson", n, "s2") : view("tech", n); }
      if (v === "warmup") { T.where = "گرم‌کردنِ دوره (فاصله‌دار)"; return view("course", null, "warm"); }
      if (v === "epi-course") return view("epi_course");
      return view("course");
    }
    if (k === "srs") { var sf = SRSF[v]; T.where = (sf ? sf[1] : bare(P)) + " — موعدش در «امروز» هم می‌آید"; return view(sf && has(sf[0]) ? sf[0] : "home"); }
    if (k === "today") { T.where = "«امروز»: " + bare(P); return view("home"); }
    if (k === "mind") return view("mind");
    if (k === "idea") { T.where = "«💡 جایگاهِ ایده»: " + bare(P); return view("idea"); }
    if (k === "prereq") return view("prereq");
    if (k === "sieve" || k === "assist") { T.assist = true; T.where = "«💬 دستیار»" + (k === "sieve" ? " — غربال: " : ": ") + bare(P); return T; }
    if (k === "code") { T.none = "کدِ خالص است، نه نما — در قابلیت‌هایی که صدایش می‌زنند دیده می‌شود: " + bare(P); return T; }
    T.none = "برای این شناسه نمایی ثبت نشده: " + P.raw; return T;
  };
  /* گرهِ گرافی که این شناسه به آن «پوشش» می‌دهد (همان target؛ دستیار ⇒ نمای «💬» ندارد، پس null) — a25_graph */
  SR.nodeOf = function (sid) { var t = SR.target(sid); return (t && !t.none && t.node) || null; };
  SR.go = function (sid) {
    var t = SR.target(sid); if (!t || t.none) return null;
    if (t.assist) return function () { if (A.ASSIST && A.ASSIST.toggle) A.ASSIST.toggle(true); };
    if (!t.view) return SR.goCoarse(sid);
    return function () {
      if (t.fam && A.kcFilter) A.kcFilter.fam = t.fam;
      A.go(t.view, t.arg, t.sub);
      if (t.sel) setTimeout(function () { var el = null; t.sel.split(",").some(function (q) { el = document.querySelector("#main " + q.trim()); return !!el; }); if (el) { if (el.tagName === "DETAILS") el.open = true; if (el.scrollIntoView) el.scrollIntoView({ block: "start" }); } }, 80);
    };
  };
  /* منبعِ پیش‌فرضِ زبانه: تازه‌ترین سنجش (نه «نخستینِ فهرست» — ترتیبِ build.py الفبایی است؛ ممیزی L7) */
  SR.defaultId = function () { var all = SR.all(); if (!all.length) return null; return all.slice().sort(function (a, b) { return String((b.coverage || {}).audited || "").localeCompare(String((a.coverage || {}).audited || "")); })[0].id; };
  /* پیوندِ درشتِ پیشین (قرنطینه، نه حذف — قاعدهٔ ۲): فقط وقتی SR.target نمایی نیافت */
  SR.goCoarse = function (sid) {
    var p = String(sid).split(":"), k = p[0], v = p.slice(1).join(":");
    if (k === "tech" && A.V.tech) return function () { A.go("tech", +v || v); };
    if (k === "move" && A.V.move) return function () { A.go("move", v); };
    if ((k === "kfam" || k === "kact" || k === "kprobe" || k === "kstmt") && A.V.kmap) return function () { A.go("kmap"); };
    if ((k === "kstep" || k === "kgen" || k === "ksim") && A.V.kcases) return function () { A.go("kcases"); };
    if ((k === "station" || k === "factory") && A.V.e_home) return function () { A.go("e_home"); };
    if (k === "proto" && A.V.proto) return function () { A.go("proto", v); };
    if ((k === "prob" || k === "problem") && A.V.e_prob) return function () { A.go("e_prob"); };
    if (k === "journey" && A.V.topics) return function () { A.go("topics"); };
    if (k === "terr" && A.V.sterr) return function () { A.go("sterr"); };
    if (k === "course" && A.V.course) return function () { A.go("course"); };
    if (k === "sieve" || k === "assist") return function () { if (A.ASSIST && A.ASSIST.toggle) A.ASSIST.toggle(true); };
    return null;
  };

  A.V.sources = function (id) {
    var root = h("div", { class: "page sources", dir: "rtl" });
    root.appendChild(A.head("نقشه‌ها", "📚 منبع‌ها و پوشش", "هر کتاب یا منطقِ بیرونی که می‌فرستی، مورد‌به‌مورد با سامانه سنجیده می‌شود: کجای سامانه است، چقدر عمیق، و چه کم است."));
    var all = SR.all();
    if (!all.length) { root.appendChild(h("p", { class: "card soft" }, "هنوز منبعی سنجیده نشده.")); return root; }
    var src = SR.get(id) || SR.get(SR.defaultId()) || all[0];
    if (all.length > 1) root.appendChild(h("div", { class: "row gap wrap" }, all.map(function (s) { return h("button", { class: "btn sm" + (s.id === src.id ? "" : " ghost"), type: "button", onclick: function () { A.go("sources", s.id); } }, s.title); })));
    var C = SR.counts(src), cov = src.coverage || {}, V = cov.verdicts || {}, n = (src.items || []).length;
    root.appendChild(h("section", { class: "card src-head" }, h("h2", {}, "«" + src.title + "» — " + src.author),
      h("p", { class: "small muted" }, "سنجش: " + (cov.audited || "—") + (cov.label ? " (" + cov.label + ")" : "") + " · " + fa(n) + " مورد · روش: " + (src.method || "")),
      h("div", { class: "bt-stats" }, VERD.concat([["سنجیده‌نشده", ""]]).map(function (v) { return C[v[0]] ? h("div", { class: "card soft bt-stat" }, h("div", { class: "small muted" }, v[0]), h("div", { class: "bt-num " + v[1] }, fa(C[v[0]]))) : null; })),
      (src.notes || []).length ? h("ul", { class: "small" }, src.notes.map(function (x) { return h("li", {}, x); })) : null,
      (cov.history || []).length ? h("p", { class: "small" }, "روند: " + cov.history.map(function (r) { return r.audited + " (" + (r.label || "") + "): عمیق " + fa(r["عمیق"] || 0) + " · سطحی " + fa(r["سطحی"] || 0) + " · ندارد " + fa(r["ندارد"] || 0); }).join(" ← ")) : null));
    if ((cov.beyond || []).length) root.appendChild(h("details", { class: "card" }, h("summary", {}, "➕ آنچه سامانه بیش از این منبع دارد (" + fa(cov.beyond.length) + ")"),
      h("ul", { class: "small" }, cov.beyond.map(function (b) { var g = SR.go(b.system); return h("li", {}, g ? h("button", { class: "linkish", type: "button", onclick: g }, b.what) : b.what); }))));
    /* فیلتر */
    var st = A.state.sub || "", bar = h("div", { class: "row gap wrap src-filter" }, [["", "همه"]].concat(VERD).map(function (v) { return h("button", { class: "btn sm" + (st === v[0] ? "" : " ghost"), type: "button", onclick: function () { A.go("sources", src.id, v[0]); } }, (v[1] === undefined ? v[0] : v[0] || "همه")); }));
    root.appendChild(bar);
    var bySec = {}, order = [];
    (src.items || []).forEach(function (it) { var v = V[it.id] || {}; if (st && v.verdict !== st) return; if (!bySec[it.section]) { bySec[it.section] = []; order.push(it.section); } bySec[it.section].push({ it: it, v: v }); });
    order.forEach(function (sec) {
      root.appendChild(h("details", { class: "card src-sec" }, h("summary", {}, sec + " (" + fa(bySec[sec].length) + ")"),
        h("ul", { class: "plain" }, bySec[sec].map(function (o) {
          var cls = (VERD.filter(function (x) { return x[0] === o.v.verdict; })[0] || [0, ""])[1];
          return h("li", { class: "src-it", "data-id": o.it.id }, h("span", { class: "pill " + cls }, o.v.verdict || "سنجیده‌نشده"), " ", h("b", {}, o.it.name_fa), o.it.name_en ? h("span", { class: "small muted", dir: "ltr" }, " (" + o.it.name_en + ")") : null,
            o.it.origin === "original" ? h("span", { class: "small muted" }, " · از متنِ اصلی") : null,
            h("div", { class: "small" }, o.it.what),
            o.v.experience ? h("div", { class: "small" }, "در سامانه: " + o.v.experience) : null,
            o.v.gap ? h("div", { class: "small bad" }, "کمبود: " + o.v.gap) : null,
            (o.v.system || []).length ? h("div", { class: "small row gap wrap" }, (o.v.system || []).slice(0, 8).map(function (sid) { var g = SR.go(sid), t = SR.target(sid) || {}; return g ? h("button", { class: "linkish", type: "button", onclick: g, title: t.where || "" }, "↗ " + sid) : h("span", { class: "muted src-nolink" }, sid + (t.none ? " — " + t.none : "")); })) : null,
            (function () { var ws = []; (o.v.system || []).slice(0, 8).forEach(function (sid) { var t = SR.target(sid); if (t && t.where && !t.none && ws.indexOf(t.where) < 0) ws.push(t.where); }); return ws.length ? h("div", { class: "small muted src-where" }, "جایِ دقیق: " + ws.join(" · ")) : null; })());
        }))));
    });
    return root;
  };
  A.VIEW_META = A.VIEW_META || {};
  A.VIEW_META.sources = { j: "ws", what: "منبع‌ها و پوشش: هر کتاب/منطقِ بیرونی که مالک فرستاده، مورد‌به‌مورد: کجای سامانه است (حرکت، تکنیک، گره، ایستگاه، سفر)، چقدر عمیق (عمیق/سطحی/ندارد/نامربوط)، کمبود، و آنچه سامانه بیش از منبع دارد." };
  A.SUB_VIEWS = A.SUB_VIEWS || {}; if (!A.SUB_VIEWS.sources) A.SUB_VIEWS.sources = "mind";
  if (A.GRAPH && A.GRAPH.MAPS && !A.GRAPH.MAPS.some(function (x) { return x.v === "sources"; })) A.GRAPH.MAPS.push({ v: "sources", fa: "📚 منبع‌ها و پوشش", what: "کتاب‌ها و منطق‌های بیرونی، مورد‌به‌مورد با سامانه" });

  /* دستیار: وقتی از کتاب/منبع/روش‌های حلِ مسئله می‌پرسند یا این نما باز است، خلاصهٔ پوشش را می‌بیند */
  var AS = A.ASSIST;
  if (AS) {
    AS.promptHooks = AS.promptHooks || [];
    /* L2 (ممیزیِ ۲۰۲۶-۱۰-۱۵): «منبعِ درآمد»، «پوشش بیمه»، «کتابِ حسابداری» این قلاب را روشن نمی‌کنند؛ «روش‌های حلِ مسئله»، «این کتاب»،
       «در سامانه کجاست/هست»، نام یا نویسندهٔ هر منبع، و شناسهٔ مورد (A013) روشن می‌کنند. */
    var SRC_RE = /پولیا|p[oó]lya|منبع‌?\s*ها و پوشش|روش(?:ِ|\s|‌)*(?:ها|های)?\s*(?:ی\s*)?حل(?:ِ|\s|‌)*(?:کردنِ?\s*)?مسئله|حل(?:ِ|\s|‌)*مسئله.{0,12}(?:کتاب|منبع)|(?:این|اون|آن|همین|همون)\s*کتاب|کتاب(?:ِ|ی)?(?:‌|\s)?(?:ها|های)?\s*(?:ی\s*)?(?:تازه|جدید|بیرونی|که فرستاد|را فرستاد|رو فرستاد|فرستاد)|منبع(?:ِ|\s)*(?:تازه|جدید|بیرونی)|(?:در|توی|تو)\s*(?:سامانه|سیستم)\s*(?:کجا|هست|هس|وجود)|کجای\s*(?:سامانه|سیستم)/i;
    SR.hookOn = function (text) {
      var t = String(text || ""); if (SRC_RE.test(t)) return true;
      if (/\b[A-Z]\d{3}\b/.test(t) && SR.matchItems(t).length) return true;
      return SR.all().some(function (src) { return (src.title && t.indexOf(src.title) >= 0) || /how to solve it/i.test(t) && /how to solve it/i.test(String(src.author || "") + src.title); });
    };
    /* مورد‌های منبع که پیامِ کاربر از آن‌ها می‌پرسد (برای «فلان مورد کجای سامانه است؟») — هم‌پوشانیِ واژه‌های نام، نامِ انگلیسی، یا شناسه */
    var STOP = " از به در با را و که این آن اون یک یه برای تا هم چه چی کجا کجاست کجای هست است نیست سامانه سیستم توی تو کتاب منبع کنم کند کرد شده بود باید چطور چگونه چیست آیا یا اگر وقتی خود خودت می ها های ی ".split(" ");
    function norm(x) { return String(x || "").toLowerCase().replace(/[\u064B-\u0652]/g, "").replace(/ۀ/g, "ه").replace(/ٔ/g, "").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " "); }
    function toks(x) { var o = []; norm(x).split(/[^a-zء-يپچژکگی0-9]+/).forEach(function (w) { if (w.length >= 3 && STOP.indexOf(" " + w + " ") < 0 && o.indexOf(w) < 0) o.push(w); }); return o; }
    STOP = " " + STOP.join(" ") + " ";
    SR.matchItems = function (text, max) {
      var t = String(text || ""), mt = toks(t), nt = norm(t), ids = t.match(/\b[A-Z]\d{3}\b/g) || [], out = [];
      SR.all().forEach(function (src) {
        (src.items || []).forEach(function (it) {
          var sc = 0;
          if (ids.indexOf(it.id) >= 0) sc = 3;
          else if (it.name_en && it.name_en.length > 6 && nt.indexOf(norm(it.name_en)) >= 0) sc = 2.5;
          else { var nn = toks(it.name_fa + " " + (it.name_en || "")), m = nn.filter(function (w) { return mt.indexOf(w) >= 0; }).length; if (nn.length && (m >= 2 && (m / nn.length >= 0.5 || m / mt.length >= 0.5) || m === 1 && mt.length === 1 && toks(it.name_fa).length === 1 && mt[0].length >= 5)) sc = m + m / nn.length; }
          if (sc) out.push({ src: src, it: it, sc: sc });
        });
      });
      return out.sort(function (a, b) { return b.sc - a.sc; }).slice(0, max || 6);
    };
    function clipT(x, n) { x = String(x == null ? "" : x).replace(/\s+/g, " ").trim(); return x.length > n ? x.slice(0, n - 1) + "…" : x; }
    function placeOf(sids) { var w = []; (sids || []).slice(0, 4).forEach(function (sid) { var t = SR.target(sid) || {}, nd = t.node && !/^view:/.test(t.node) ? t.node : ""; w.push(SR.parseSid(sid).k + ":" + SR.parseSid(sid).v + (t.view ? " ⇒ نمای " + t.view + (nd ? " (" + nd + ")" : "") : t.assist ? " ⇒ دستیار" : "") + (t.where ? " — " + clipT(t.where, 70) : "")); }); return w.join("؛ "); }
    AS.promptHooks.push(function (s, msg) {
      var recent = [String(msg || "")].concat(((s && s.msgs) || []).filter(function (m) { return m.role === "user"; }).slice(-4).map(function (m) { return m.text; })).join(" ");
      if (!((A.state && A.state.view === "sources") || SR.hookOn(recent))) return "";
      var L = ["# منبع‌ها و پوشش (کتاب‌هایی که مالک فرستاده — نمای «sources»)"];
      SR.all().forEach(function (src) {
        var C = SR.counts(src), V = (src.coverage || {}).verdicts || {};
        L.push("- «" + src.title + "» (" + (src.coverage || {}).audited + "): عمیق " + C["عمیق"] + " · سطحی " + C["سطحی"] + " · ندارد " + C["ندارد"] + " · نامربوط " + C["نامربوط"]);
        var miss = (src.items || []).filter(function (it) { return (V[it.id] || {}).verdict === "ندارد"; }).slice(0, 15).map(function (it) { return it.name_fa; });
        if (miss.length) L.push("  نبوده‌ها (نمونه): " + miss.join("، "));
        /* M7: سطحی‌ها هم — نام، کمبود و جایشان (فشرده) — تا «کجا کم است؟» از دادهٔ پوشش پاسخ بگیرد */
        var sh = (src.items || []).filter(function (it) { return (V[it.id] || {}).verdict === "سطحی"; });
        if (sh.length) { L.push("  سطحی‌ها (" + sh.length + "؛ شناسه نام — کمبود ⇐ جا):"); sh.slice(0, 40).forEach(function (it) { var v = V[it.id] || {}; L.push("  · " + it.id + " " + clipT(it.name_fa, 50) + (v.gap ? " — " + clipT(v.gap, 80) : "") + ((v.system || []).length ? " ⇐ " + clipT(placeOf(v.system), 110) : "")); }); }
      });
      /* موردهایی که همین پیام از آن‌ها می‌پرسد: هر کدام در کدام تونل زندگی می‌کند */
      var hit = SR.matchItems(recent);
      if (hit.length) { L.push("- موردهای منبع که کاربر از آن‌ها می‌پرسد (جایشان در سامانه؛ «جایِ دقیق» را همان‌طور بگو، چیزی نساز):"); hit.forEach(function (x) { var v = ((x.src.coverage || {}).verdicts || {})[x.it.id] || {}; L.push("  · " + x.it.id + " «" + clipT(x.it.name_fa, 60) + "» [" + (v.verdict || "سنجیده‌نشده") + "] ⇐ " + (placeOf(v.system) || "—") + (v.gap ? " · کمبود: " + clipT(v.gap, 90) : "")); }); }
      L.push("- اگر کاربر کتاب یا منطقِ تازه‌ای فرستاد و پرسید «در سامانه هست؟»: خودت داوری نکن؛ برگهٔ فوری بگذار: فیلدِ gap با area: lla-sources، kind: build، title: «منبعِ تازه: نامِ منبع»، و در missing بنویس فایل در کدام پیوستِ همین سشن است تا روتین طبقِ روالِ «📚 منبع‌ها و پوشش» (AGENTS.md) کامل بخواند، بسنجد، کمبودها را در تونل‌های موجود بسازد و همین نما به‌روز شود.");
      return L.join("\n");
    });
  }
})(APP);
