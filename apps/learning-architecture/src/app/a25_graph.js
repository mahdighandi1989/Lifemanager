/* ===== «🗺 نقشه‌ها»: گرافِ مشترکِ زنده (سامانهٔ یادگیری + کارخانهٔ معرفت‌شناسی + داده‌های خودِ مالک) — مالک ۲۰۲۶-۱۰-۱۴ =====
   مالک: «نقشه و گراف فقط برای سامانهٔ یادگیری است و کامل نیست؛ برای معرفت‌شناسی اصلاً نیست؛ یک نقشهٔ کلی که ارتباطِ این دو را
   به‌صورتِ گراف نشان دهد، دقیق و واضح و به‌روزشونده … هر چیزی که در به‌روزرسانی‌ها و روتین‌ها انجام می‌شود باید در آن بیاید …
   و چندین جا "نقشه" نوشته — همه بی حذف ذیلِ یک قسمت».
   اصل: این گراف **دستی کشیده نمی‌شود**؛ هر بار از خودِ ثبت‌گاه‌ها ساخته می‌شود (A.GRAPH.model) — تکنیک‌ها، فازها، پروتکل‌ها،
   سفر، دوره، حرکت‌ها، خانواده‌های گره، گره‌ها و موقعیت‌ها، درخت‌های مزرعه، مسئله‌ها، سالن‌ها، ایستگاه‌ها، قاعده‌ها، جزوه،
   اصول/قضیه‌ها/پایه‌ها، قلمرو، یافته‌ها و پیشنهادها. هر چیزی که هر نشست یا روتین به این ثبت‌گاه‌ها بیفزاید همان لحظه در گراف است.
   نوعِ تازه‌ای از داده ⇒ در TYPES و build() ثبت شود (آزمونِ tests/test_graph.js پوششِ همهٔ ثبت‌گاه‌ها را می‌سنجد).
   پیوندها فقط همان‌هایی‌اند که در داده هست — هیچ پیوندی ساخته نمی‌شود؛ جاهایی که پل نیست، «شکاف» نشان داده می‌شود. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, svg = A.svg;
  var G = A.GRAPH = {};
  /* انواعِ گره: sys = learn (سامانهٔ یادگیری) | mine (دادهٔ خودِ تو) | epi (کارخانه و جزوه) */
  G.TYPES = [
    { t: "phase", fa: "فازِ یادگیری", sys: "learn" }, { t: "tech", fa: "تکنیک", sys: "learn" }, { t: "proto", fa: "پروتکل", sys: "learn" },
    { t: "week", fa: "هفتهٔ برنامه/دوره", sys: "learn" }, { t: "concern", fa: "دغدغه", sys: "learn" }, { t: "jstep", fa: "گامِ سفر", sys: "learn" },
    { t: "move", fa: "حرکتِ حلِ مسئله", sys: "learn" }, { t: "kfam", fa: "خانوادهٔ گره", sys: "learn" },
    { t: "topic", fa: "موضوعِ تو", sys: "mine" }, { t: "tree", fa: "درختِ مزرعه", sys: "mine" }, { t: "fnode", fa: "مفهومِ مزرعه", sys: "mine" },
    { t: "tool", fa: "ابزارِ سامانه", sys: "learn" }, { t: "lesson", fa: "درسِ دوره", sys: "learn" }, { t: "struct", fa: "ساختارِ اطلس", sys: "learn" },
    { t: "knot", fa: "گرهِ ذهنیِ تو", sys: "mine" }, { t: "kcase", fa: "موقعیتِ گره‌گشا", sys: "mine" }, { t: "prob", fa: "مسئله", sys: "mine" },
    { t: "kitem", fa: "تمرینِ گره", sys: "mine" }, { t: "seedling", fa: "نهالِ مزرعه", sys: "mine" }, { t: "ecase", fa: "پروندهٔ سنجشِ تو", sys: "mine" },
    { t: "hall", fa: "سالنِ کارخانه", sys: "epi" }, { t: "concept", fa: "مفهومِ معرفت‌شناسی", sys: "epi" }, { t: "drill", fa: "تمرینِ ایستگاه", sys: "epi" },
    { t: "dossier", fa: "پروندهٔ پشتوانه", sys: "epi" }, { t: "event", fa: "واقعهٔ بک‌تست", sys: "epi" }, { t: "station", fa: "ایستگاه", sys: "epi" }, { t: "rule", fa: "قاعده", sys: "epi" },
    { t: "chapter", fa: "فصلِ جزوه", sys: "epi" }, { t: "section", fa: "بخشِ جزوه", sys: "epi" }, { t: "axiom", fa: "اصلِ بدیهی", sys: "epi" },
    { t: "theorem", fa: "قضیه", sys: "epi" }, { t: "base", fa: "مقدارِ پایه", sys: "epi" }, { t: "tgroup", fa: "گروهِ قلمرو", sys: "epi" },
    { t: "area", fa: "حوزهٔ قلمرو", sys: "epi" }, { t: "ssys", fa: "سامانهٔ قلمرو", sys: "learn" }, { t: "sarea", fa: "حوزهٔ قلمروِ سامانه", sys: "learn" }, { t: "finding", fa: "یافتهٔ بک‌تست", sys: "epi" }, { t: "proposal", fa: "پیشنهادِ تغییر", sys: "epi" },
    /* نماهای صفحه (A.V): ارجاعِ «view:…» ِ قلمروِ سامانه‌ها به این‌ها می‌رسد — نمای ناموجود ⇒ ارجاعِ شکسته (نه حذفِ بی‌صدا) */
    { t: "view", fa: "نمای صفحه", sys: "learn" },
    /* ثبت‌گاه‌های دیگرِ دادهٔ تو (مالک ۲۰۲۶-۱۰-۱۴ «هر چیزی… باید در آن بیاید»؛ ممیزیِ اجرا ۲۰۲۶-۱۰-۱۵) */
    { t: "prereq", fa: "نقشهٔ پیش‌نیازها", sys: "mine" }, { t: "tour", fa: "تورِ دستیار", sys: "mine" }, { t: "tfacet", fa: "وجهِ تور", sys: "mine" },
    { t: "wchain", fa: "زنجیرهٔ نگرانی", sys: "mine" }, { t: "fcast", fa: "پیش‌بینیِ تو", sys: "mine" }, { t: "value", fa: "ارزشِ تو", sys: "mine" },
    { t: "meaning", fa: "وارسیِ معنا", sys: "mine" }, { t: "kexp", fa: "آزمایشِ گره", sys: "mine" }, { t: "deadline", fa: "موعدِ تو", sys: "mine" }, { t: "ex", fa: "تمرینِ تکنیک", sys: "mine" },
    { t: "prun", fa: "اجرای پروتکل", sys: "mine" }, { t: "card", fa: "کارتِ مرور", sys: "mine" }, { t: "pbitem", fa: "تمرینِ مسئلهٔ هم‌ساختار", sys: "mine" },
    /* «📐 سنجشِ استاندارد» (a34_psy): سازه‌های جهانی (ثبت‌گاه) و پاسخ‌های تو به معماهای لنگردار */
    { t: "psyc", fa: "سازهٔ روان‌سنجی", sys: "learn" }, { t: "psyans", fa: "پاسخِ معمای لنگردار", sys: "mine" },
    { t: "idea", fa: "ایدهٔ تو", sys: "mine" },
    /* «🔭 مسئلهٔ حل‌نشدهٔ خودم» (a38_live): همان رکوردِ eprob با mode: "live" — پیوند به حرکت‌هایی که برگزیدی، موقعیت‌های گره‌گشا، پرونده‌های ادعاها، ایده‌ها و مسئلهٔ تازه‌ای که از آن ساختی */
    { t: "lprob", fa: "مسئلهٔ حل‌نشدهٔ تو", sys: "mine" },
    /* «🧪 پروندهٔ تمرینِ باز» (a41_practice): یک پرونده برای هر تکنیک × موضوع، و فهرست‌های جاری (kind: list) */
    { t: "practice", fa: "پروندهٔ تمرینِ تو", sys: "mine" },
    /* «📚 منبع‌ها و پوشش» (a37_sources): کتاب‌های بیرونی و موردهایشان، با پیوند به تونلِ موجودی که هر مورد در آن زندگی می‌کند */
    { t: "src", fa: "منبعِ بیرونی (کتاب)", sys: "learn" }, { t: "srcitem", fa: "موردِ منبع", sys: "learn" }
  ];
  G.TM = {}; G.TYPES.forEach(function (x) { G.TM[x.t] = x; });
  G.REL = { in: "عضوِ", req: "پیش‌نیازِ", feeds: "تغذیه می‌کند", pairs: "مکمل", uses: "به کار می‌برد", serves: "پاسخ به دغدغه", core: "تکنیکِ اصلیِ گام",
    fam: "از خانوادهٔ", has: "دارد", root: "ریشه در", link: "پیوندِ تو", dep: "وابسته به", tag: "حرکت", at: "ایستگاهِ", basis: "مبنا در", proof: "برهان از",
    measures: "پایه", covers: "پوشش", about: "دربارهٔ", step: "گامِ کنونی", bridge: "پل", vs: "در برابرِ", fails: "شکست در", from: "برخاسته از", practises: "تمرینِ", judged: "سنجیده در" };

  function ref(t, id) { return t + ":" + id; }
  G.build = function () {
    var N = {}, E = [], C = A.C || {}, W = window;
    function node(t, id, label, meta) { var k = ref(t, id); if (!N[k]) N[k] = { k: k, t: t, id: String(id), label: String(label || id), sys: G.TM[t].sys, meta: meta || {} }; return N[k]; }
    var broken = [];   /* خوداصلاحی: ارجاعِ شکسته (سرِ یال در داده نیست) پنهان نمی‌شود — گزارش می‌شود */
    function edge(a, b, rel, why) { if (!a || !b || a === b) return; if (!N[a] || !N[b]) { broken.push({ a: a, b: b, rel: rel, missing: !N[a] ? a : b }); return; } E.push({ a: a, b: b, rel: rel, why: why || "" }); }
    /* ---------- سامانهٔ یادگیری ---------- */
    (C.PHASES || []).forEach(function (p) { node("phase", p.n, "فاز " + fa(p.n) + " · " + (p.short || p.fa), { go: ["map", null, "flow"] }); });
    (A.T || []).forEach(function (t) { node("tech", t.id, fa(t.id) + ". " + t.fa, { go: ["tech", t.id] }); });
    (A.T || []).forEach(function (t) { if (A.phaseOf) edge(ref("tech", t.id), ref("phase", A.phaseOf(t.id)), "in"); });
    (C.EDGES || []).forEach(function (e) { edge(ref("tech", e[0]), ref("tech", e[1]), e[2], e[3]); });
    (C.PROTOCOLS || []).forEach(function (p) { node("proto", p.id, p.id + " · " + p.fa, { go: ["proto", p.id] }); });
    (C.PROTOCOLS || []).forEach(function (p) { (p.ids || []).forEach(function (t) { edge(ref("proto", p.id), ref("tech", t), "uses"); }); });
    /* «FARM»/«ATLAS» در ارجاع‌ها پروتکل نیستند، ابزارِ سامانه‌اند (مزرعه، اطلس) — گرهِ «ابزار» */
    node("tool", "FARM", "ابزار: مزرعه", { go: ["farm"] }); node("tool", "ATLAS", "ابزار: اطلس", { go: ["atlas"] });
    var pref = function (pid) { return N[ref("proto", pid)] ? ref("proto", pid) : ref("tool", pid); };
    Object.keys(C.PHASE_REFS || {}).forEach(function (ph) { (C.PHASE_REFS[ph] || []).forEach(function (pid) { edge(ref("phase", ph), pref(pid), "uses"); }); });
    (C.CURRICULUM || []).forEach(function (w) { node("week", w.w, "هفتهٔ " + fa(w.w) + " · " + w.fa, { go: ["map", null, "plan"] });
      (w.ids || []).forEach(function (t) { edge(ref("week", w.w), ref("tech", t), "uses"); }); (w.protos || []).forEach(function (p) { edge(ref("week", w.w), pref(p), "uses"); }); });
    (C.CONCERNS || []).forEach(function (c) { node("concern", c.id, c.id + " · " + String(c.text || "").slice(0, 60), { go: ["concerns"] }); });
    (A.T || []).forEach(function (t) { (t.concerns || []).forEach(function (c) { edge(ref("tech", t.id), ref("concern", c), "serves"); }); });
    (C.PROTOCOLS || []).forEach(function (p) { (p.concerns || []).forEach(function (c) { edge(ref("proto", p.id), ref("concern", c), "serves"); }); });
    (C.PIPELINE || []).forEach(function (s) { node("jstep", s.k, s.k + " · " + s.fa, { go: ["topics"] }); (s.core || []).forEach(function (t) { edge(ref("jstep", s.k), ref("tech", t), "core"); }); if (s.ph != null) edge(ref("jstep", s.k), ref("phase", s.ph), "in"); });
    (A.MOVE_LIST || []).forEach(function (m) { node("move", m.id, m.fa, { go: ["move", m.id] }); (m.tech || []).forEach(function (x) { edge(ref("move", m.id), ref("tech", x[0]), "uses", x[1]); }); });
    (A.KF || []).forEach(function (f) { node("kfam", f.id, f.id + " · " + f.fa, { go: ["kcases"] }); (f.acts || []).forEach(function (a) { if (a.tid) edge(ref("kfam", f.id), ref("tech", a.tid), "uses"); }); });
    (A.COURSE_LESSONS || []).forEach(function (l, i) { var id = (l.pid || l.tid) + "@" + l.w; node("lesson", id, "درسِ هفتهٔ " + fa(l.w) + " · " + (l.fa || id), { go: ["course"] });
      if (l.pid) edge(ref("lesson", id), ref("proto", l.pid), "practises"); else edge(ref("lesson", id), ref("tech", l.tid), "practises"); edge(ref("lesson", id), ref("week", l.w), "in"); });
    (C.STRUCTURES || []).forEach(function (x) { node("struct", x.id, x.fa, { go: ["atlas"] }); edge(ref("struct", x.id), ref("tool", "ATLAS"), "in"); });
    /* نماهای صفحه — همه از A.V (نامشان از منو/VIEW_FA)؛ ارجاعِ «view:…» به این‌ها */
    var navLab = {}; (A.NAV || []).concat(A.EPI_NAV || [], [A.NAV_WHOLE, A.NAV_MAPS, A.NAV_SETTINGS, A.NAV_START]).forEach(function (n) { if (Array.isArray(n) && n[0] && !navLab[n[0]]) navLab[n[0]] = n[1]; });
    Object.keys(A.V || {}).forEach(function (v) { node("view", v, "نما: " + ((A.VIEW_FA && A.VIEW_FA[v]) || navLab[v] || v), { go: [v] }); });
    var covLater = [];   /* یال‌های «پوشش» پس از ساختِ همهٔ گره‌ها (حوزهٔ قلمرو/مسئله دیرتر ساخته می‌شوند) */
    (W.SRC_COV || []).forEach(function (src) {
      node("src", src.id, "📚 " + src.title, { go: ["sources", src.id] });
      var V = (src.coverage || {}).verdicts || {};
      (src.items || []).forEach(function (it) {
        var v = V[it.id] || {}, k = src.id + "/" + it.id;
        node("srcitem", k, (v.verdict ? "[" + v.verdict + "] " : "") + String(it.name_fa || it.id).slice(0, 60), { go: ["sources", src.id] });
        edge(ref("srcitem", k), ref("src", src.id), "in");
        /* هر شناسهٔ تونل ⇒ گرهِ جایی که مورد در آن زندگی می‌کند (A.SOURCES.nodeOf، همان خوانندهٔ پیوندهای نما — ممیزیِ M1 ۲۰۲۶-۱۰-۱۵):
           تکنیک/حرکت/خانوادهٔ گره/ایستگاه/پروتکل/حوزهٔ قلمرو اگر هست، وگرنه نمای صفحه‌ای که آن قابلیت در آن رندر می‌شود (prob:* ⇒ view:e_prob،
           kstep:* ⇒ view:kcases، …). فقط به گره‌های موجود؛ هر یال یک بار. */
        var seenCov = {};
        (v.system || []).forEach(function (sid) {
          var nk = A.SOURCES && A.SOURCES.nodeOf ? A.SOURCES.nodeOf(sid) : null;
          if (!nk) { var p = String(sid).split(":"), t2 = p[0], id2 = p.slice(1).join(":"); if (t2 === "tech") id2 = String(parseInt(id2, 10)); if ({ tech: 1, move: 1, kfam: 1, station: 1, proto: 1 }[t2]) nk = ref(t2, id2); }
          if (nk && !seenCov[nk]) { seenCov[nk] = 1; covLater.push([ref("srcitem", k), nk]); } });
      });
    });
    if (A.PSY) A.PSY.CONSTRUCTS.forEach(function (c) { node("psyc", c.id, "📐 " + c.fa, { go: ["mind"] }); edge(ref("psyc", c.id), ref("view", "mind"), "in"); });
    /* ---------- دادهٔ خودِ تو ---------- */
    var all = function (t) { try { return (S && S.all) ? S.all(t) : []; } catch (e) { return []; } };
    all("topic").forEach(function (t) { node("topic", t.id, t.title, { go: ["topic", t.id] }); var st = t.journey && t.journey.step; if (st) edge(ref("topic", t.id), ref("jstep", st), "step"); });
    all("tree").forEach(function (t) { node("tree", t.id, t.name, { go: ["farm", t.id, "tree"] }); edge(ref("tree", t.id), ref("tool", "FARM"), "in"); });
    all("fnode").forEach(function (n) { node("fnode", n.id, n.title, { go: ["farm", n.tree, "tree"] }); });
    all("fnode").forEach(function (n) { edge(ref("fnode", n.id), n.parent ? ref("fnode", n.parent) : ref("tree", n.tree), "in"); (n.deps || []).forEach(function (d) { edge(ref("fnode", n.id), ref("fnode", d), "dep"); }); });
    all("knot").forEach(function (k) { node("knot", k.id, k.name, { go: ["knot", k.id] }); if (k.fam) edge(ref("knot", k.id), ref("kfam", k.fam), "fam"); });
    all("knot").forEach(function (k) { (k.links || []).forEach(function (l) { edge(ref("knot", k.id), ref("knot", l.to), "link", l.rel); }); });
    all("kcase").forEach(function (c) { node("kcase", c.id, c.title, { go: ["kcase", c.id] }); (c.knots || []).forEach(function (k) { edge(ref("kcase", c.id), ref("knot", k), "has"); });
      if (c.root && c.root.primary) edge(ref("kcase", c.id), ref("kfam", c.root.primary), "root"); if (c.topic) edge(ref("kcase", c.id), ref("topic", c.topic), "about"); });
    all("kitem").forEach(function (it) { node("kitem", it.id, String(it.prompt || "تمرین").slice(0, 50), { go: ["kpractice"] }); edge(ref("kitem", it.id), ref("knot", it.knot), "practises"); });
    all("seedling").forEach(function (sd) { node("seedling", sd.id, String(sd.text || "").slice(0, 50), { go: ["farm", null, "nursery"] }); edge(ref("seedling", sd.id), ref("tool", "FARM"), "in"); var sr = sd.src; if (sr && sr.type && sr.id) edge(ref("seedling", sd.id), ref(sr.type === "kcase" ? "kcase" : sr.type === "knot" ? "knot" : sr.type, sr.id), "from"); });
    all("struct").forEach(function (x) { if (!N[ref("struct", String(x.id).replace(/^st_/, ""))]) node("struct", x.id, x.fa || x.title || x.id, { go: ["atlas"] }); });
    var probs = []; try { probs = A.probs ? A.probs() : []; } catch (e) { }
    probs.forEach(function (p) { node("prob", p.id, p.title, { go: ["e_prob", p.id] }); });
    var lives = all("eprob").filter(function (r) { return r && r.live && r.p && r.status !== "rejected"; });
    lives.forEach(function (r) { node("lprob", r.p.id, "🔭 " + String(r.p.title || "مسئله").slice(0, 50), { go: ["lprob", r.p.id] }); });
    all("eprob").forEach(function (r) { var o = r.origin || (r.p && r.p.origin); if (o && o.type === "kcase" && r.p && N[ref("prob", r.p.id)]) edge(ref("prob", r.p.id), ref("kcase", o.id), "from"); });
    /* مسئله‌های آمادهٔ سازنده (EPI_PROBLEMS) فقط با «نمونه‌های آمادهٔ سازنده» گره می‌شوند؛ شمارِ پنهان‌ها در «شکاف‌ها» گفته می‌شود */
    var hiddenProbs = (W.EPI_PROBLEMS || []).filter(function (p) { return p && !N[ref("prob", p.id)]; }).map(function (p) { return p.id; });
    var isHidden = function (pid) { return hiddenProbs.indexOf(pid) >= 0 || (A.getProb && !N[ref("prob", pid)] && !!A.getProb(pid)); };
    all("pbitem").forEach(function (it) { node("pbitem", it.id, "🧩 " + String(it.prompt || "تمرین").slice(0, 50), { go: ["e_prob", it.pid] }); if (it.pid && !isHidden(it.pid)) edge(ref("pbitem", it.id), ref("prob", it.pid), "practises"); });
    /* ---------- کارخانه و جزوه ---------- */
    var E0 = W.EPI || {};
    (E0.HALLS || []).forEach(function (hl) { node("hall", hl.n, "سالنِ " + fa(hl.n) + " · " + hl.fa, { go: ["e_map"] }); });
    (W.EPI_ST || []).forEach(function (s) { node("station", s.id, s.fa, { go: ["e_st", s.id] }); edge(ref("station", s.id), ref("hall", s.hall), "in"); });
    var B = W.EPI_BOOK || {};
    (B.ch || []).forEach(function (c) { node("chapter", c.id, "فصلِ " + fa(c.n) + " · " + c.title, { go: ["e_book"] }); });
    Object.keys(B.sec || {}).forEach(function (s) { node("section", s, s + " · " + (B.sec[s].title || ""), { go: ["e_book", s] }); edge(ref("section", s), ref("chapter", B.sec[s].ch), "in"); });
    (W.EPI_ST || []).forEach(function (s) { (s.basis || []).forEach(function (b) { edge(ref("station", s.id), ref("section", b.sec), "basis"); }); });
    var F = W.EPI_FOUND || {};
    (F.AX || []).forEach(function (a) { node("axiom", a.id, a.id + " · " + a.fa, { go: ["e_bt", null, "found"] }); (a.sec || []).forEach(function (s) { edge(ref("axiom", a.id), ref("section", s), "basis"); }); });
    Object.keys(F.TH || {}).forEach(function (t) { node("theorem", t, F.TH[t].fa, { go: ["e_bt", null, "found"] }); });
    Object.keys(F.TH || {}).forEach(function (t) { (F.TH[t].from || []).forEach(function (x) { edge(ref("theorem", t), (F.TH[x] ? ref("theorem", x) : ref("axiom", x)), "proof"); }); });
    Object.keys(F.BASE || {}).forEach(function (b) { node("base", b, F.BASE[b].fa, { go: ["e_bt", null, "found"] }); });
    (W.EPI_RULES || []).forEach(function (r) { node("rule", r.id, r.fa, { go: ["e_bt", null, "found"] }); edge(ref("rule", r.id), ref("station", r.st), "at");
      (r.sec || []).forEach(function (s) { edge(ref("rule", r.id), ref("section", s), "basis"); });
      var d = (F.DER || {})[r.id]; if (d) { if (d.th) edge(ref("rule", r.id), F.TH[d.th] ? ref("theorem", d.th) : ref("axiom", d.th), "proof"); if (d.base) edge(ref("rule", r.id), ref("base", d.base), "measures"); } });
    var dups = [], seenCo = {};
    (W.EPI_CO || []).forEach(function (c) { if (seenCo[c.id]) dups.push({ t: "concept", id: c.id, a: seenCo[c.id], b: c.fa }); else seenCo[c.id] = c.fa; node("concept", c.id, c.fa, { go: ["e_concepts", c.id] }); });
    (W.EPI_CO || []).forEach(function (c) { (c.secs || []).forEach(function (x) { edge(ref("concept", c.id), ref("section", x), "basis"); }); (c.st || []).forEach(function (x) { edge(ref("concept", c.id), ref("station", x), "at"); });
      (c.vs || []).forEach(function (x) { var id = typeof x === "string" ? x : (x && x.id); if (id) edge(ref("concept", c.id), ref("concept", id), "vs"); }); });
    (W.EPI_DR || []).forEach(function (d) { node("drill", d.id, d.title || d.id, { go: ["e_st", d.st] }); edge(ref("drill", d.id), ref("station", d.st), "practises"); });
    (W.EPI_DOS || []).forEach(function (d) { node("dossier", d.id, d.fa, { go: ["e_dos"] }); (d.secs || []).forEach(function (x) { edge(ref("dossier", d.id), ref("section", x), "basis"); }); });
    /* واقعه‌های بک‌تست (بذر + افزوده‌های هر دورِ ناظر) از دفترِ همان دور — هر دورِ تازه خودکار */
    (((W.EPI_BT_LEDGER || {}).results || {}).cases || []).forEach(function (c) { node("event", c.id, c.t, { go: c.r > 0 ? ["e_bt", null, "live"] : ["e_lib", c.id] }); (c.ex || []).forEach(function (st) { edge(ref("event", c.id), ref("station", st), "fails"); }); });
    all("case").forEach(function (c) { node("ecase", c.id, c.title, { go: ["e_case", c.id] }); Object.keys(c.st || {}).forEach(function (st) { edge(ref("ecase", c.id), ref("station", st), "judged"); });
      var sr = c.src; if (sr && sr.type && sr.id) edge(ref("ecase", c.id), ref(sr.type === "kcase" ? "kcase" : sr.type === "fnode" ? "fnode" : sr.type, sr.id), "from"); });
    var T = W.EPI_TERR || {};
    (T.groups || []).forEach(function (g) { node("tgroup", g.id, g.fa, { go: ["e_bt", null, "terr"] }); (g.areas || []).forEach(function (a) { node("area", a.id, a.fa, { go: ["e_bt", null, "terr"] }); edge(ref("area", a.id), ref("tgroup", g.id), "in"); (a.book || []).forEach(function (s) { edge(ref("area", a.id), ref("section", s), "covers"); }); }); });
    var L = W.EPI_BT_LEDGER || {}, TS = (L.territory || {}).areas || {};
    Object.keys(TS).forEach(function (aid) { (TS[aid].rules || []).forEach(function (r) { edge(ref("area", aid), ref("rule", r), "covers"); });
      /* گزاره‌های حوزه بر پایهٔ کدام اصل/قضیه (claims[].th) — از edge() تا اصل/قضیهٔ ناموجود شکسته گزارش شود */
      (TS[aid].claims || []).forEach(function (c) { if (c && c.th) edge(ref("area", aid), F.TH && F.TH[c.th] ? ref("theorem", c.th) : ref("axiom", c.th), "basis", String(c.txt || "").slice(0, 90)); }); });
    ((L.findings || {}).findings || []).forEach(function (f) { node("finding", f.id, f.title + " — " + f.status, { go: ["e_bt", null, "live"] }); (f.rules || []).forEach(function (r) { edge(ref("finding", f.id), ref("rule", r), "about"); }); });
    ((L.proposals || {}).proposals || []).forEach(function (p) { node("proposal", p.id, p.title, { go: ["e_bt", null, "live"] }); if (p.finding) edge(ref("proposal", p.id), ref("finding", p.finding), "about"); });
    /* «🗺 قلمروِ سامانه‌ها» (a28): سامانه ⇐ حوزه ⇐ ابزارهای صفحه (فقط ارجاع‌های ثبت‌شده در نقشه) */
    ((W.SYS_TERR || {}).systems || []).forEach(function (m) {
      node("ssys", m.id, m.fa, { go: ["sterr", m.id] });
      (m.groups || []).forEach(function (g) { (g.areas || []).forEach(function (a) {
        node("sarea", a.id, a.fa, { go: ["sterr", m.id] }); edge(ref("sarea", a.id), ref("ssys", m.id), "in");
        /* هر ابزار (tech/proto/kfam/move/station/view) از edge() — ابزارِ ناموجود شکسته گزارش می‌شود، نه بی‌صدا رها */
        (a.tools || []).forEach(function (t) { var mm = /^([a-z]+):(.+)$/.exec(String(t)); edge(ref("sarea", a.id), mm ? ref(mm[1], mm[2]) : ref("tool", t), "uses"); });
      }); });
    });
    /* سایرِ ثبت‌گاه‌های دادهٔ تو (پس از کارخانه و قلمرو، چون به پرونده/سامانه هم ارجاع می‌دهند) — هر کدام با یال به همان چیزی که ارجاع می‌دهد (همه از edge(): ارجاعِ شکسته گزارش می‌شود) */
    var vw = function (v) { return ref("view", v); };
    all("prereq").forEach(function (p) { node("prereq", p.id, "🧩 " + (p.title || "پیش‌نیاز"), { go: ["prereq", p.id] }); edge(ref("prereq", p.id), vw("prereq"), "in");
      if (p.kcase) edge(ref("prereq", p.id), ref("kcase", p.kcase), "about");
      var tseen = {}; (p.items || []).forEach(function (x) { if (x && x.topic && !tseen[x.topic]) { tseen[x.topic] = 1; edge(ref("prereq", p.id), ref("topic", x.topic), "req"); } }); });
    all("wchain").forEach(function (c) { node("wchain", c.id, "⛓ " + (c.title || "زنجیره"), { go: ["chain"] }); edge(ref("wchain", c.id), vw("chain"), "in"); });
    all("fcast").forEach(function (x) { node("fcast", x.id, "🎯 " + String(x.q || x.title || "پیش‌بینی").slice(0, 60), { go: ["fcast"] }); edge(ref("fcast", x.id), vw("fcast"), "in");
      if (x.dim && x.dim !== "s_epi") edge(ref("fcast", x.id), ref("ssys", x.dim), "about");
      if (x.live && x.live.pid && N[ref("lprob", x.live.pid)]) edge(ref("fcast", x.id), ref("lprob", x.live.pid), "about", "پیش‌بینیِ گامِ «" + (x.live.step || "") + "»"); });
    var vByT = {}; all("value").forEach(function (v) { node("value", v.id, "🧭 " + (v.title || "ارزش"), { go: ["vals"] }); edge(ref("value", v.id), vw("vals"), "in"); if (v.title) vByT[v.title] = v.id; });
    all("value").forEach(function (v) { (v.vs || []).forEach(function (c) { if (c && c.with) edge(ref("value", v.id), ref("value", vByT[c.with] || c.with), "vs", c.rule || ""); }); });
    all("meaning").forEach(function (m) { node("meaning", m.id, "وارسیِ معنا · " + (m.date || ""), { go: ["vals"] }); edge(ref("meaning", m.id), vw("vals"), "in"); });
    all("kexp").forEach(function (x) { node("kexp", x.id, "🧪 " + String(x.plan || "آزمایش").slice(0, 50), { go: ["knot", x.knot] }); if (x.knot) edge(ref("kexp", x.id), ref("knot", x.knot), "practises"); });
    all("ex").forEach(function (x) { node("ex", x.id, "تمرینِ تکنیکِ " + fa(x.tid), { go: ["tech", x.tid] }); if (x.tid != null && x.tid !== "") edge(ref("ex", x.id), ref("tech", x.tid), "practises"); if (x.topic) edge(ref("ex", x.id), ref("topic", x.topic), "about"); });
    all("pr").forEach(function (x) { node("prun", x.id, "اجرای پروتکلِ " + (x.pid || ""), { go: ["proto", x.pid] }); if (x.pid) edge(ref("prun", x.id), pref(x.pid), "practises"); if (x.topic) edge(ref("prun", x.id), ref("topic", x.topic), "about"); });
    all("card").forEach(function (c) { node("card", c.id, "🃏 " + String(c.q || "کارت").slice(0, 50), { go: ["review"] }); edge(ref("card", c.id), vw("review"), "in");
      if (c.tid != null && c.tid !== "") edge(ref("card", c.id), ref("tech", c.tid), "practises"); if (c.pid) edge(ref("card", c.id), pref(c.pid), "practises");
      if (c.topic) edge(ref("card", c.id), ref("topic", c.topic), "about"); if (c.knot) edge(ref("card", c.id), ref("knot", c.knot), "practises");
      /* کارتِ درسِ بازنگری (c.pb): به مسئلهٔ زنده یا مسئله‌ای که گره دارد؛ مسئلهٔ پنهان (نمونهٔ سازنده) نه گره است نه شکسته */
      if (c.pb) { var pk = N[ref("lprob", c.pb)] ? ref("lprob", c.pb) : N[ref("prob", c.pb)] ? ref("prob", c.pb) : null; if (pk) edge(ref("card", c.id), pk, "about"); } });
    /* تورهای دستیار (رکوردِ achat با tour): تور ⇐ وجه‌ها ⇐ ارجاع‌های هر وجه */
    function recRef(type, id) {
      if (type === "eprob") { var r = S && S.get ? S.get(id) : null; if (r && r.live && r.p && N[ref("lprob", r.p.id)]) return ref("lprob", r.p.id); if (r && r.p && N[ref("prob", r.p.id)]) return ref("prob", r.p.id); return r ? null : ref("eprob", id); }   /* مسئلهٔ تأییدنشده/پنهان: نه گره، نه شکسته */
      if (type === "lprob") return ref("lprob", id);
      var gt = ({ "case": "ecase", achat: "tour", pr: "prun" })[type] || type; return ref(gt, id);
    }
    all("achat").filter(function (s) { return s.tour; }).forEach(function (s) {
      node("tour", s.id, "🧭 تور: " + (s.title || s.pinned || "تور"), { go: ["home"] });
      (s.tour.facets || []).forEach(function (f, i) { var fid = s.id + "/" + (f.key || f.id || i); node("tfacet", fid, (f.title || "وجه"), { go: [f.view || "home", f.arg || null] }); edge(ref("tfacet", fid), ref("tour", s.id), "in");
        (f.refs || []).forEach(function (r) { if (!r || !r.id) return; var k = recRef(r.type, r.id); if (k) edge(ref("tfacet", fid), k, "about"); }); });
    });
    if (A.PSY) {
      all("psyans").forEach(function (x) { var it = A.PSY.item(x.item); node("psyans", x.id, "🧩 " + (x.ok ? "درست" : "نادرست") + (it ? " — " + String(it.text).slice(0, 40) : ""), { go: ["mind"] }); if (it && N[ref("psyc", it.construct)]) edge(ref("psyans", x.id), ref("psyc", it.construct), "measures"); });
    }
    /* «💡 جایگاهِ ایده»: ایده ⇐ پرونده‌های فرض‌ها، مسئله/نقشهٔ پیش‌نیازِ مسئله‌های طراحی، تورِ سشن */
    all("idea").forEach(function (x) {
      node("idea", x.id, "💡 " + String(x.title || "ایده").slice(0, 50), { go: ["idea", x.id] });
      if (x.sess && N[ref("tour", x.sess)]) edge(ref("idea", x.id), ref("tour", x.sess), "in");
      (x.parts || []).forEach(function (p) { var k = p.caseId ? recRef("case", p.caseId) : p.recId ? recRef((S.get(p.recId) || {}).type, p.recId) : null; if (k) edge(ref("idea", x.id), k, p.k === "assumption" ? "dep" : "has"); });
    });
    /* «🔭 مسئلهٔ حل‌نشدهٔ خودم»: حرکت‌های برگزیده (با دلیلِ خودت)، موقعیت‌های گره‌گشای همین مسئله، پرونده‌های ادعاها، پیوندهایی که خودت از «مسئلهٔ مرتبط» زدی، و مسئلهٔ مادر */
    lives.forEach(function (r) {
      var k0 = ref("lprob", r.p.id), pg = S.get("eprog_" + r.p.id), L = (pg && pg.solve && pg.solve.live) || {};
      edge(k0, N[ref("ssys", "s_problem")] ? ref("ssys", "s_problem") : vw("e_prob"), "in");   // هیچ مسئلهٔ زنده‌ای جزیره نیست
      (L.moves || []).forEach(function (m) { if (m && m.mv) edge(k0, ref("move", m.mv), "uses", m.why || ""); });
      (L.claims || []).forEach(function (c) { if (c && c.caseId) edge(k0, recRef("case", c.caseId), "dep", c.t || ""); });
      (L.knots || []).forEach(function (id) { edge(k0, ref("kcase", id), "has"); });
      (L.related || []).forEach(function (x) { if (x && x.id) { var rk = recRef(x.type, x.id); if (rk && rk !== k0) edge(k0, rk, "link"); } });
      var o = r.origin; if (o && o.type === "lprob" && o.id) edge(k0, ref("lprob", o.id), "from");
    });
    all("deadline").forEach(function (x) { node("deadline", x.id, "⏰ " + String(x.what || "موعد").slice(0, 50), { go: ["home"] }); if (x.sess && N[ref("tour", x.sess)]) edge(ref("deadline", x.id), ref("tour", x.sess), "in"); });
    all("practice").forEach(function (c) { node("practice", c.id, "🧪 " + (c.kind === "list" ? ((A.PR && A.PR.LISTS[c.list] || {}).fa || "فهرست") : "تمرینِ " + fa(c.tid) + " — " + ((c.subj && c.subj.t) || "")), { go: ["practice", c.id] }); if (c.tid) edge(ref("practice", c.id), ref("tech", c.tid), "practises");
      var sj = c.subj || {}, tt = { live: "lprob", "case": "ecase", knot: "knot", kcase: "kcase", topic: "topic" }[sj.k]; if (tt && sj.id) edge(ref("practice", c.id), ref(tt, sj.id), "about"); });
    /* ---------- پل‌ها (فقط آنچه در داده هست) ---------- */
    (W.EPI_ST || []).forEach(function (s) { (s.tech || []).forEach(function (x) { edge(ref("station", s.id), ref("tech", x.id), "bridge", x.why); }); });
    (A.KF || []).forEach(function (f) { (f.epi || []).forEach(function (x) { edge(ref("kfam", f.id), ref("station", x.st), "bridge", x.why); }); });
    probs.forEach(function (p) { (p.stages || []).forEach(function (s) {
      (s.st || []).forEach(function (st) { edge(ref("prob", p.id), ref("station", st), "bridge"); });
      (s.tech || []).forEach(function (t) { edge(ref("prob", p.id), ref("tech", t), "uses"); });
      var mv = []; try { mv = A.stageMoves ? A.stageMoves(p, s) : (s.mv || []); } catch (e) { mv = s.mv || []; }
      (mv || []).forEach(function (m) { edge(ref("prob", p.id), ref("move", m), "tag"); }); }); });
    covLater.forEach(function (x) { if (N[x[1]]) edge(x[0], x[1], "covers"); });
    /* یالِ تکراری یکی شود (همان دو سر و همان نوع) */
    var seen = {}, E2 = []; E.forEach(function (e) { var key = e.a + "|" + e.b + "|" + e.rel; if (!seen[key]) { seen[key] = 1; E2.push(e); } });
    var adj = {}; E2.forEach(function (e, i) { (adj[e.a] = adj[e.a] || []).push(i); (adj[e.b] = adj[e.b] || []).push(i); });
    return { nodes: N, edges: E2, adj: adj, broken: broken, dups: dups, hiddenProbs: hiddenProbs };
  };
  G.model = function () { return G.build(); };
  /* شکاف‌ها: کجا میانِ دو سامانه پل نیست — فقط گزارش، نه ساختنِ پیوند */
  G.gaps = function (M) {
    M = M || G.build();
    function deg(k, pred) { return (M.adj[k] || []).filter(function (i) { return pred(M.edges[i]); }).length; }
    /* «پل» فقط پیوندِ ثبت‌شدهٔ rel=bridge است (ایستگاه⇄تکنیک، خانواده⇄ایستگاه، مسئله⇄ایستگاه) — نه هر یالِ میانِ دو رنگ
       (ممیزیِ اجرا ۲۰۲۶-۱۰-۱۵: ارجاع‌های ابزارِ «قلمروِ سامانه‌ها» به ایستگاه‌ها شمارِ پل را ~۲۶ تا باد کرده بود و شکافِ ایستگاه‌ها را می‌پوشاند) */
    var isBridge = function (e) { return e.rel === "bridge" && M.nodes[e.a] && M.nodes[e.b] && M.nodes[e.a].sys !== M.nodes[e.b].sys && (M.nodes[e.a].sys === "epi" || M.nodes[e.b].sys === "epi"); };
    var list = function (t) { return Object.keys(M.nodes).filter(function (k) { return M.nodes[k].t === t; }); };
    return {
      bridges: M.edges.filter(isBridge).length,
      stationsNoTech: list("station").filter(function (k) { return !deg(k, isBridge); }),
      techNoStation: list("tech").filter(function (k) { return !deg(k, isBridge); }),
      famNoStation: list("kfam").filter(function (k) { return !deg(k, isBridge); }),
      areasNoRule: list("area").filter(function (k) { return !deg(k, function (e) { return M.nodes[e.a].t === "rule" || M.nodes[e.b].t === "rule"; }); }),
      /* واقعهٔ سالم (بی ایستگاهِ شکست) طبیعتاً پیوندِ «شکست در» ندارد؛ جزوِ شکاف نیست */
      isolated: Object.keys(M.nodes).filter(function (k) { return !(M.adj[k] || []).length && M.nodes[k].t !== "event" && M.nodes[k].t !== "view"; }),   /* نمای بی‌ارجاع شکاف نیست */
      hiddenSamples: (M.hiddenProbs || []).length,
      dups: M.dups || [],
      broken: M.broken || []
    };
  };

  /* ======================= نما ======================= */
  var ST = { sys: { learn: 1, mine: 1, epi: 1 }, focus: null, q: "" };
  var SYSFA = { learn: "سامانهٔ یادگیری", mine: "دادهٔ خودِ تو", epi: "کارخانه و جزوهٔ معرفت‌شناسی" };
  function goNode(n) { var g = n.meta && n.meta.go; if (g) A.go(g[0], g[1], g[2]); }

  /* نمای کلان: هر نوع یک جعبه (با شمار)، یال‌های میانِ نوع‌ها با شمار — سه ستون: یادگیری | دادهٔ تو | معرفت‌شناسی */
  function overview(M) {
    var counts = {}, links = {};
    Object.keys(M.nodes).forEach(function (k) { var n = M.nodes[k]; counts[n.t] = (counts[n.t] || 0) + 1; });
    M.edges.forEach(function (e) { var a = M.nodes[e.a].t, b = M.nodes[e.b].t; if (a === b) return; var key = a < b ? a + "|" + b : b + "|" + a; links[key] = (links[key] || 0) + 1; });
    var cols = { learn: [], mine: [], epi: [] };
    G.TYPES.forEach(function (x) { if (counts[x.t] && ST.sys[x.sys]) cols[x.sys].push(x); });
    var Wd = 960, colX = { learn: 800, mine: 480, epi: 160 }, bw = 210, bh = 30, gap = 10;
    var rows = Math.max(cols.learn.length, cols.mine.length, cols.epi.length, 1), Ht = 60 + rows * (bh + gap);
    var pos = {};
    ["learn", "mine", "epi"].forEach(function (s) { cols[s].forEach(function (x, i) { pos[x.t] = { x: colX[s], y: 50 + i * (bh + gap) + bh / 2 }; }); });
    var el = svg("svg", { viewBox: "0 0 " + Wd + " " + Ht, class: "gr-over", role: "img", "aria-label": "نمای کلانِ گرافِ مشترک" });
    ["learn", "mine", "epi"].forEach(function (s) { if (cols[s].length) el.appendChild(svg("text", { x: colX[s], y: 24, "text-anchor": "middle", direction: "rtl", class: "gr-colh gr-" + s }, SYSFA[s])); });
    Object.keys(links).forEach(function (key) {
      var ab = key.split("|"), p = pos[ab[0]], q = pos[ab[1]]; if (!p || !q) return;
      var cross = G.TM[ab[0]].sys !== G.TM[ab[1]].sys, x1 = p.x + (q.x < p.x ? -bw / 2 : q.x > p.x ? bw / 2 : bw / 2), x2 = q.x + (p.x < q.x ? -bw / 2 : p.x > q.x ? bw / 2 : bw / 2);
      var mx = p.x === q.x ? p.x + bw / 2 + 40 + Math.abs(p.y - q.y) / 6 : (x1 + x2) / 2;
      var d = "M" + x1 + "," + p.y + " Q" + mx + "," + ((p.y + q.y) / 2) + " " + x2 + "," + q.y;
      el.appendChild(svg("path", { d: d, class: "gr-ol" + (cross ? " cross" : ""), "stroke-width": String(Math.min(6, 0.8 + Math.log(1 + links[key]))), fill: "none" }, ab[0] + " ↔ " + ab[1] + ": " + links[key]));
    });
    G.TYPES.forEach(function (x) {
      var p = pos[x.t]; if (!p) return;
      var g = svg("g", { class: "gr-box gr-" + x.sys, tabindex: "0", role: "button", "data-t": x.t, "aria-label": x.fa + " (" + counts[x.t] + ")" });
      g.appendChild(svg("rect", { x: p.x - bw / 2, y: p.y - bh / 2, width: bw, height: bh, rx: 8 }));
      g.appendChild(svg("text", { x: p.x, y: p.y + 5, direction: "rtl", "text-anchor": "middle" }, x.fa + " (" + fa(counts[x.t]) + ")"));
      var pick = function () { ST.type = x.t; ST.focus = null; A.render(); };
      g.addEventListener("click", pick); g.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); pick(); } });
      el.appendChild(g);
    });
    return el;
  }
  /* نمای کانونی: یک گره و همهٔ همسایه‌هایش، دسته‌بندی‌شده بر حسبِ نوع در بخش‌های دایره (چیدمانِ قطعی) */
  function focusView(M, k) {
    var n = M.nodes[k]; if (!n) return h("p", { class: "small muted" }, "این گره دیگر در داده نیست.");
    var nb = {}; (M.adj[k] || []).forEach(function (i) { var e = M.edges[i], o = e.a === k ? e.b : e.a; (nb[o] = nb[o] || []).push(e); });
    var ids = Object.keys(nb), byT = {}; ids.forEach(function (o) { var t = M.nodes[o].t; (byT[t] = byT[t] || []).push(o); });
    var types = G.TYPES.map(function (x) { return x.t; }).filter(function (t) { return byT[t]; });
    var MAXN = 70, shown = 0, Wd = 960, Ht = 620, cx = Wd / 2, cy = Ht / 2;
    var el = svg("svg", { viewBox: "0 0 " + Wd + " " + Ht, class: "gr-focus", role: "img", "aria-label": "همسایه‌های " + n.label });
    var tot = Math.min(ids.length, MAXN), idx = 0, P = {};
    types.forEach(function (t) { byT[t].sort().forEach(function (o) { if (shown >= MAXN) return; var a = (idx / Math.max(1, tot)) * 2 * Math.PI - Math.PI / 2; var r = tot > 24 ? (idx % 2 ? 270 : 210) : 230; P[o] = { x: cx + r * Math.cos(a) * 1.3, y: cy + r * Math.sin(a) }; idx++; shown++; }); });
    Object.keys(P).forEach(function (o) {
      nb[o].forEach(function (e) {
        var q = P[o], out = e.a === k;
        el.appendChild(svg("line", { x1: cx, y1: cy, x2: q.x, y2: q.y, class: "gr-fl rel-" + e.rel + (M.nodes[o].sys !== n.sys ? " cross" : "") }, (G.REL[e.rel] || e.rel) + (e.why ? " — " + e.why : "")));
      });
    });
    Object.keys(P).forEach(function (o) {
      var m = M.nodes[o], q = P[o], g = svg("g", { class: "gr-node gr-" + m.sys, tabindex: "0", role: "button", "data-k": o });
      g.appendChild(svg("circle", { cx: q.x, cy: q.y, r: 7 }));
      var lab = m.label.length > 22 ? m.label.slice(0, 21) + "…" : m.label;
      /* direction=rtl (bidi): در RTL «start» لبهٔ راستِ متن است ⇒ گرهِ سمتِ چپ: start، سمتِ راست: end */
      g.appendChild(svg("text", { x: q.x + (q.x < cx ? -11 : 11), y: q.y + 4, direction: "rtl", "text-anchor": q.x < cx ? "start" : "end" }, lab));
      g.appendChild(svg("title", {}, G.TM[m.t].fa + ": " + m.label + " — " + nb[o].map(function (e) { return G.REL[e.rel] || e.rel; }).join("، ")));
      var pick = function () { ST.focus = o; A.render(); };
      g.addEventListener("click", pick); g.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); pick(); } });
      el.appendChild(g);
    });
    var c = svg("g", { class: "gr-center gr-" + n.sys });
    c.appendChild(svg("circle", { cx: cx, cy: cy, r: 13 }));
    c.appendChild(svg("text", { x: cx, y: cy - 20, direction: "rtl", "text-anchor": "middle" }, n.label.length > 40 ? n.label.slice(0, 39) + "…" : n.label));
    el.appendChild(c);
    var more = ids.length > MAXN ? h("p", { class: "small muted" }, "و " + fa(ids.length - MAXN) + " همسایهٔ دیگر — در فهرستِ زیر") : null;
    var lst = h("details", { class: "gr-nlist" }, h("summary", {}, "همهٔ " + fa(ids.length) + " پیوند، بر حسبِ نوع"),
      h("div", {}, types.map(function (t) { return h("div", { class: "small" }, h("b", {}, G.TM[t].fa + " (" + fa(byT[t].length) + "): "),
        byT[t].map(function (o) { return h("button", { class: "linkish gr-nb", "data-k": o, onclick: function () { ST.focus = o; A.render(); } }, M.nodes[o].label); })); })));
    return h("div", { class: "col gap" },
      h("div", { class: "row between wrap" }, h("div", {}, h("span", { class: "chip gr-" + n.sys }, G.TM[n.t].fa + " · " + SYSFA[n.sys]), " ", h("b", {}, n.label)),
        h("div", { class: "row gap" }, n.meta.go ? h("button", { class: "btn sm", onclick: function () { goNode(n); } }, "باز کن") : null, h("button", { class: "btn ghost sm gr-back", onclick: function () { ST.focus = null; A.render(); } }, "↩ نمای کلان"))),
      h("div", { class: "scrollx" }, el), more, lst);
  }
  A.graphPanel = function (opt) {
    if (opt && opt.sys && ST.ctx !== opt.ctx) { ST.sys = opt.sys; ST.ctx = opt.ctx; ST.focus = null; ST.type = null; }
    if (!opt && ST.ctx) { ST.sys = { learn: 1, mine: 1, epi: 1 }; ST.ctx = null; }
    var M = G.build(), box = h("div", { class: "col gap gr", dir: "rtl" }), gp = G.gaps(M);
    var nN = Object.keys(M.nodes).length;
    box.appendChild(h("section", { class: "card" }, h("h2", {}, "🕸 گرافِ مشترک — سامانهٔ یادگیری، دادهٔ تو، و معرفت‌شناسی در یک شبکه"),
      h("p", { class: "small" }, "این گراف هر بار از خودِ داده‌ها ساخته می‌شود، نه دستی: هر تکنیک، فاز، پروتکل، حرکت، گره، موقعیت، درخت، مسئله، ایستگاه، قاعده، بخشِ جزوه، اصل و قضیه، حوزهٔ قلمرو و یافتهٔ بک‌تست. هر چیزی که تو، یک نشست یا روتینِ شبانه بیفزاید، همین لحظه این‌جاست. پیوندها فقط همان‌هایی‌اند که در داده ثبت شده‌اند؛ جاهایی که میانِ دو سامانه پل نیست، پایین‌تر «شکاف» آمده — ساخته نمی‌شوند."),
      h("div", { class: "bt-stats" },
        h("div", { class: "card soft bt-stat" }, h("div", { class: "small muted" }, "گره"), h("div", { class: "bt-num gr-nn" }, fa(nN))),
        h("div", { class: "card soft bt-stat" }, h("div", { class: "small muted" }, "پیوند"), h("div", { class: "bt-num" }, fa(M.edges.length))),
        h("div", { class: "card soft bt-stat" }, h("div", { class: "small muted" }, "پل میانِ دو سامانه"), h("div", { class: "bt-num gr-nbr" }, fa(gp.bridges))))));
    /* پالایه و جستجو */
    var q = h("input", { type: "search", class: "gr-q", placeholder: "جستجوی هر چیز (تکنیک، ایستگاه، قاعده، گره…)", "aria-label": "جستجو در گراف", value: ST.q || "",
      oninput: function () { ST.q = q.value; res.innerHTML = ""; fillRes(); } });
    var res = h("div", { class: "gr-res" });
    function fillRes() {
      var s = (ST.q || "").trim(); if (s.length < 2) return;
      var hits = Object.keys(M.nodes).filter(function (k) { return M.nodes[k].label.indexOf(s) >= 0 || M.nodes[k].id === s; }).slice(0, 30);
      res.appendChild(h("div", { class: "row gap wrap" }, hits.length ? hits.map(function (k) { var m = M.nodes[k]; return h("button", { class: "chip gr-hit gr-" + m.sys, onclick: function () { ST.focus = k; ST.q = ""; A.render(); } }, G.TM[m.t].fa + ": " + m.label); }) : h("span", { class: "small muted" }, "چیزی پیدا نشد.")));
    }
    var sysBox = h("div", { class: "row gap wrap small" }, ["learn", "mine", "epi"].map(function (s) {
      var cb = h("input", { type: "checkbox", checked: !!ST.sys[s], onchange: function () { ST.sys[s] = cb.checked ? 1 : 0; A.render(); } });
      return h("label", { class: "gr-sys gr-" + s }, cb, " " + SYSFA[s]); }));
    box.appendChild(h("section", { class: "card" }, h("div", { class: "row gap wrap" }, q, sysBox), res));
    fillRes();
    if (ST.focus) box.appendChild(h("section", { class: "card" }, focusView(M, ST.focus)));
    else {
      box.appendChild(h("section", { class: "card" }, h("h3", {}, "نمای کلان — روی هر جعبه بزن تا اعضایش را ببینی؛ روی هر عضو، تا همسایه‌هایش"),
        h("p", { class: "small muted" }, "ضخامتِ خط = شمارِ پیوندها؛ خطِ رنگی = پل میانِ دو سامانه."), h("div", { class: "scrollx" }, overview(M))));
      if (ST.type && G.TM[ST.type]) {
        var ks = Object.keys(M.nodes).filter(function (k) { return M.nodes[k].t === ST.type; });
        box.appendChild(h("section", { class: "card gr-members" }, h("h3", {}, G.TM[ST.type].fa + " (" + fa(ks.length) + ")"),
          h("div", { class: "row gap wrap" }, ks.map(function (k) { var m = M.nodes[k]; return h("button", { class: "chip gr-" + m.sys, "data-k": k, onclick: function () { ST.focus = k; A.render(); } }, m.label + " · " + fa((M.adj[k] || []).length)); }))));
      }
    }
    /* شکاف‌ها */
    function gapRow(lab, arr) { return h("details", { class: "small" }, h("summary", {}, lab + ": " + fa(arr.length)), h("div", { class: "row gap wrap" }, arr.map(function (k) { return h("button", { class: "linkish", onclick: function () { ST.focus = k; A.render(); } }, M.nodes[k].label); }))); }
    box.appendChild(h("section", { class: "card gr-gaps" }, h("h3", {}, "شکاف‌ها — جایی که میانِ دو سامانه هنوز پلی ثبت نشده"),
      h("p", { class: "small muted" }, "این‌ها پیوندِ ساختگی نمی‌گیرند؛ فهرستِ کارِ آینده‌اند (برای تو، نشست‌ها و ناظرِ شبانه)."),
      gapRow("ایستگاه‌هایی که به هیچ تکنیک/خانواده/مسئله‌ای وصل نیستند", gp.stationsNoTech),
      gapRow("تکنیک‌هایی که به هیچ ایستگاهی وصل نیستند", gp.techNoStation),
      gapRow("خانواده‌های گره بی پیوند به ایستگاه", gp.famNoStation),
      gapRow("حوزه‌های قلمرو بی قاعده", gp.areasNoRule),
      gapRow("گره‌های بی هیچ پیوند", gp.isolated),
      gp.hiddenSamples ? h("p", { class: "small muted gr-hidden" }, "پنهان: " + fa(gp.hiddenSamples) + " مسئلهٔ آمادهٔ سازنده (کتابخانهٔ مسئله‌ها) در گراف نیامده‌اند، چون «نمونه‌های آمادهٔ سازنده» در تنظیمات خاموش است — با روشن کردنش همراهِ پل‌هایشان به ایستگاه‌ها می‌آیند.") : null));
    /* خوداصلاحی: ارجاعِ شکسته در داده (مثلاً پیوند به گرهِ پاک‌شده، ایستگاه/بخشِ ناموجود) — پنهان نمی‌شود */
    box.appendChild(h("section", { class: "card gr-broken" + (gp.broken.length ? " bad" : "") }, h("h3", {}, (gp.broken.length ? "⚠ " : "✓ ") + "ارجاع‌های شکسته: " + fa(gp.broken.length)),
      h("p", { class: "small muted" }, "هر پیوندی که یک سرش در داده نیست این‌جا می‌آید، نه این‌که بی‌صدا حذف شود. برای ثبت‌گاه‌های کارخانه و جزوه، دروازهٔ ادغام (`epi_backtest.js audit`) همین را نگه می‌دارد؛ برای داده‌های خودت، این‌جا ببین و اصلاح کن."),
      gp.broken.length ? h("ul", { class: "small" }, gp.broken.slice(0, 60).map(function (b) { var src = M.nodes[b.a]; return h("li", {}, (src ? G.TM[src.t].fa + " «" + src.label + "»" : b.a) + " ⇒ " + (G.REL[b.rel] || b.rel) + " ⇒ ناموجود: " + b.missing); })) : null,
      gp.dups.length ? h("p", { class: "small" }, h("b", {}, "⚠ تعریفِ دوگانه (یک شناسه، دو تعریف — نسخهٔ دوم بی‌صدا جای اولی را می‌گیرد؛ تصمیمِ محتوایی با مالک): "),
        gp.dups.map(function (d) { return d.id + " («" + d.a + "» / «" + d.b + "»)"; }).join("؛ ")) : null));
    return box;
  };

  /* ======================= «🗺 نقشه‌ها»: همهٔ نقشه‌ها ذیلِ یک قسمت (هیچ‌کدام حذف نشد) ======================= */
  G.MAPS = [
    { v: "maps", fa: "🕸 گرافِ مشترک", what: "یادگیری + دادهٔ تو + معرفت‌شناسی در یک شبکهٔ زنده؛ پل‌ها و شکاف‌ها" },
    { v: "map", fa: "🧩 نقشهٔ مسیرِ یادگیری", what: function () { var C = A.C || {}; return fa((C.PHASES || []).length) + " فاز، شبکهٔ " + fa((A.T || []).length) + " تکنیک، برنامهٔ " + fa((C.CURRICULUM || []).length) + " هفته‌ای"; } },
    { v: "kmap", fa: "🗺️ نقشهٔ ذهنِ تو", what: "گره‌های ذهنیِ تو، پیوندهایشان، روندِ باز شدن (از موقعیت‌هایی که خودت ثبت می‌کنی)" },
    { v: "farm", fa: "🌳 مزرعه", what: "درختِ مفهوم‌هایی که فهمیده‌ای" },
    { v: "e_map", fa: "🏭 نقشهٔ کارخانه", what: function () { return fa(((window.EPI || {}).HALLS || []).length) + " سالن و " + fa((window.EPI_ST || []).length) + " ایستگاهِ سنجشِ معرفتی"; } },
    { v: "e_bt", s: "terr", fa: "🗺 قلمروِ معرفت‌شناسی", what: "همهٔ حوزه‌های این علم و پیشرفتِ هر کدام" },
    { v: "e_bt", s: "found", fa: "🧱 مبنای درجه‌ها", what: "اصولِ بدیهی، قضیه‌ها، مبنای هر عدد" },
    { v: "whole", fa: "🧭 این برنامه چیست؟", what: "نقشهٔ کلِ برنامه: از چه ساخته شده، سه کارِ اصلی، و تو کجای آنی" }
  ];
  A.V.maps = function () {
    var root = h("div", { class: "page", dir: "rtl" });
    root.appendChild(A.head("نقشه‌ها", "🗺 همهٔ نقشه‌ها در یک جا", "هر نقشه یک لایه از همین برنامه است؛ «گرافِ مشترک» همه را به هم وصل می‌کند. هیچ‌کدام حذف نشده — از همین‌جا یا از منوی هر سامانه باز می‌شوند."));
    root.appendChild(h("div", { class: "gr-maps" }, G.MAPS.map(function (m) {
      return h("button", { class: "card soft gr-mapcard" + (m.v === "maps" ? " on" : ""), "data-v": m.v + (m.s ? ":" + m.s : ""), onclick: function () { if (m.v !== "maps") A.go(m.v, null, m.s || null); } },
        h("b", {}, m.fa), h("div", { class: "small muted" }, typeof m.what === "function" ? m.what() : m.what)); })));
    root.appendChild(A.graphPanel());
    return root;
  };
  G.open = function (k) { ST.focus = k || null; ST.ctx = null; ST.sys = { learn: 1, mine: 1, epi: 1 }; A.go("maps"); };
  A.NAV_MAPS = ["maps", "🗺 نقشه‌ها (گرافِ مشترک)", "همهٔ نقشه‌ها ذیلِ یک قسمت؛ شبکهٔ زندهٔ یادگیری + معرفت‌شناسی + دادهٔ تو"];
  /* منو: هر «نقشه» در سامانهٔ خودش ذیلِ گروهِ «🗺 نقشه‌ها» با نامِ روشن — جابه‌جا و نام‌گذاری، نه حذف */
  (function regroup() {
    function move(arr, ids, label) {
      if (!Array.isArray(arr)) return;
      var items = [];
      ids.forEach(function (x) { var i = arr.findIndex(function (n) { return Array.isArray(n) && n[0] === x[0]; }); if (i >= 0) { var it = arr.splice(i, 1)[0]; it = [it[0], x[1], it[2]]; items.push(it); } });
      for (var j = arr.length - 1; j >= 0; j--) if (arr[j] && arr[j].g && !arr.slice(j + 1).length) arr.pop(); /* گروهِ تهیِ آخر */
      for (var g = arr.length - 1; g >= 0; g--) if (arr[g] && arr[g].g && (!arr[g + 1] || arr[g + 1].g)) arr.splice(g, 1); /* هر گروهِ تهی */
      if (items.length) { arr.push({ g: label }); items.forEach(function (it) { arr.push(it); }); }
    }
    move(A.NAV, [["map", "🧩 نقشهٔ مسیرِ یادگیری"], ["kmap", "🗺️ نقشهٔ ذهنِ تو"]], "🗺 نقشه‌ها");
    move(A.EPI_NAV, [["e_map", "🏭 نقشهٔ کارخانه"]], "🗺 نقشه‌ها");
    /* نقشهٔ ذهن مالِ هر دو سامانه است (گره‌ها از هر دو جا می‌آیند و به ایستگاه‌ها وصل‌اند) ⇒ در منوی کارخانه هم، همان نما */
    if (Array.isArray(A.EPI_NAV) && !A.EPI_NAV.some(function (n) { return Array.isArray(n) && n[0] === "kmap"; })) A.EPI_NAV.push(["kmap", "🗺️ نقشهٔ ذهنِ تو", "گره‌های ذهنیِ تو و ایستگاه‌های معرفتیِ هر کدام"]);
  })();
  if (A.VIEW_META) A.VIEW_META.maps = { j: "ws", what: "همهٔ نقشه‌ها در یک جا، و گرافِ مشترکِ زنده: یادگیری + دادهٔ تو + معرفت‌شناسی.", why: "تا ببینی هر چیز به چه وصل است و کجا میانِ دو سامانه هنوز پلی نیست." };
})(APP);
