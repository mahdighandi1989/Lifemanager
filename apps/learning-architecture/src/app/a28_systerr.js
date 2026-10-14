/* ===== «🗺 قلمروِ سامانه‌ها» — نقشهٔ هر سامانهٔ این صفحه بر پایهٔ اصول، با پیشرفتِ گام‌به‌گام (مالک ۲۰۲۶-۱۰-۱۴) =====
   مالک: «در هر قسمت قلمروهای جدید و منطقی بر اساسِ بدیهیاتِ قطعی بسازد، نه فقط برای معرفت‌شناسی — همه چیز».
   همان الگوی «🗺 قلمروِ معرفت‌شناسی»: نقشهٔ ثابت از منابعِ معتبر (territory/maps/*.json ⇒ window.SYS_TERR) و دفترِ گام‌ها
   (territory/ledger.json ⇒ window.SYS_TERR_LEDGER — فقط tools/sys_territory.py جلو می‌بردش و هرگز بیش از شاهدِ نقشه).
   گامِ ۵ («تثبیت در کار») را هیچ‌کس نمی‌نویسد: همین‌جا از دادهٔ خودِ کاربر حساب می‌شود — دست‌کم ۳ کاربستِ ابزارهای حوزه با نتیجهٔ ثبت‌شده.
   این صفحه چیزی را عوض نمی‌کند؛ دستیار و گرافِ مشترک همین را می‌خوانند. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S;
  var ST = { stages: ["نقشه‌شده", "منابع ثبت شد", "گزاره‌ها فهرست شد", "رده‌بندی بر پایهٔ اصول", "ابزارِ کامل در صفحه", "تثبیت در کار"],
    need: ["در نقشه هست؛ هنوز کاری نشده", "دست‌کم ۲ منبعِ معتبرِ ثبت‌شده", "دست‌کم ۳ گزارهٔ محوریِ آزمودنی",
      "هر گزاره رده‌بندی شد: قضیه (برهان از اصل یا تعریف) · تجربی (با شاهدِ تکرارشده) · بیرون (با دلیل)",
      "ابزارِ همین صفحه برای حوزه هست و کمبودِ ثبت‌شده‌ای نمانده (ابزارِ ناقص ⇒ گامِ ۳ با «کمبودِ صفحه»)",
      "از دادهٔ خودت: دست‌کم ۳ کاربستِ ابزارهای حوزه با نتیجهٔ ثبت‌شده"] };
  var KIND = { theorem: "قضیه", empirical: "تجربی", outside: "بیرون از قطعی" };
  var SYS = A.SYST = { stages: ST.stages, need: ST.need, KIND: KIND };
  SYS.systems = function () { return ((window.SYS_TERR || {}).systems || []); };
  SYS.ledger = function () { return ((window.SYS_TERR_LEDGER || {}).areas || {}); };
  SYS.areas = function () {
    var out = [];
    SYS.systems().forEach(function (m) { (m.groups || []).forEach(function (g) { (g.areas || []).forEach(function (a) { out.push({ sys: m, group: g, a: a }); }); }); });
    return out;
  };
  SYS.find = function (id) { return SYS.areas().filter(function (x) { return x.a.id === id; })[0] || null; };

  /* ابزارِ صفحه از روی ارجاع («tech:12»، «kfam:F7»، …) — برچسب و جای رفتن؛ ناموجود ⇒ null (آزمون می‌سنجد) */
  SYS.tool = function (ref) {
    var m = /^([a-z]+):(.+)$/.exec(String(ref || "")); if (!m) return null;
    var k = m[1], id = m[2], C = A.C || {};
    if (k === "tech") { var t = (A.T || []).filter(function (x) { return String(x.id) === id; })[0]; return t ? { fa: "فن " + fa(t.id) + " · " + t.fa, go: ["tech", t.id] } : null; }
    if (k === "proto") { var p = (C.PROTOCOLS || []).filter(function (x) { return x.id === id; })[0]; return p ? { fa: "روال " + p.id + " · " + p.fa, go: ["proto", p.id] } : null; }
    if (k === "kfam") { var f = (A.KF || []).filter(function (x) { return x.id === id; })[0]; return f ? { fa: "خانوادهٔ گره " + f.id.slice(1) + " · " + f.fa, go: ["kcases"] } : null; }
    if (k === "move") { var mv = (A.MOVES || {})[id]; return mv ? { fa: "حرکت · " + (mv.fa || mv.title || id), go: A.V.move ? ["move", id] : ["moves"] } : null; }
    if (k === "station") { var st = (A.EST || {})[id]; return st ? { fa: "ایستگاه · " + (st.fa || st.title), go: ["e_st", id] } : null; }
    if (k === "view") { return A.V[id] ? { fa: "نما · " + (A.ASSIST && A.ASSIST.labelOf ? A.ASSIST.labelOf(id) : id), go: [id] } : null; }
    return null;
  };
  /* کاربست‌های کاربر با نتیجهٔ ثبت‌شده، برای هر ابزار */
  SYS.uses = function (a) {
    var n = 0, det = [];
    (a.tools || []).forEach(function (ref) {
      var m = /^([a-z]+):(.+)$/.exec(ref); if (!m) return; var k = m[1], id = m[2], c = 0;
      if (k === "tech") c = S.all("ex", function (e) { return String(e.tid) === id && e.status === "done" && !e.sample; }).length;
      else if (k === "proto") c = S.all("pr", function (e) { return e.pid === id && e.status === "done"; }).length;
      else if (k === "kfam") c = S.all("knot", function (x) { return x.fam === id && (x.status === "practised" || x.status === "returned"); }).length;
      else if (k === "move") c = A.moveAcc ? A.moveAcc(id).n : 0;
      else if (k === "station") c = S.all("case", function (cs) { return cs.st && cs.st[id] && cs.st[id].done && !cs.sample; }).length;
      if (c) { n += c; det.push(ref + "×" + c); }
    });
    return { n: n, det: det };
  };
  SYS.stage = function (a) {
    var rec = SYS.ledger()[a.id] || { stage: 0 }, s = rec.stage || 0;
    return s >= 4 && SYS.uses(a).n >= 3 ? 5 : s;
  };
  SYS.score = function (m) {
    var as = []; (m.groups || []).forEach(function (g) { as = as.concat(g.areas || []); });
    var sum = as.reduce(function (t, a) { return t + SYS.stage(a); }, 0);
    return { n: as.length, sum: sum, pct: Math.round(100 * sum / Math.max(1, as.length * 5)) };
  };

  function bar(stage) { var b = h("span", { class: "terr-bar", "aria-label": "گامِ " + fa(stage) + " از ۵" }); for (var i = 1; i <= 5; i++) b.appendChild(h("i", { class: i <= stage ? "on" : "" })); return b; }
  A.V.sterr = function (arg) {
    var ms = SYS.systems(), cur = ms.filter(function (m) { return m.id === arg; })[0] || ms[0];
    var root = h("div", { class: "page", dir: "rtl" });
    root.appendChild(A.head("نقشه‌ها", "🗺 قلمروِ سامانه‌ها", "هر سامانهٔ این صفحه — یادگیری، ذهن، حلِ مسئله، تصمیم، ارتباط، خودشناسی — نقشهٔ کاملِ حوزه‌هایش را از منابعِ معتبر دارد؛ هر حوزه گام‌به‌گام و با شاهد جلو می‌رود و گزاره‌هایش بر پایهٔ همان اصولِ بدیهیِ کارخانه رده‌بندی شده است."));
    if (!ms.length) { root.appendChild(h("p", { class: "card muted" }, "هنوز نقشه‌ای ثبت نشده.")); return root; }
    root.appendChild(h("div", { class: "row gap wrap sterr-sys" }, ms.map(function (m) {
      var sc = SYS.score(m);
      return h("button", { class: "card soft gr-mapcard" + (m === cur ? " on" : ""), type: "button", "data-sys": m.id, onclick: function () { A.go("sterr", m.id); } },
        h("b", {}, m.fa), h("div", { class: "small muted" }, fa(sc.n) + " حوزه · پیشرفت " + fa(sc.pct) + "٪"));
    })));
    root.appendChild(A.territoryEpiLink ? A.territoryEpiLink() : h("p", { class: "small" }, h("button", { class: "linkish", type: "button", onclick: function () { A.go("e_bt", null, "terr"); } }, "🗺 قلمروِ معرفت‌شناسی (۱۰۸ حوزه) ←")));
    var all = []; (cur.groups || []).forEach(function (g) { all = all.concat(g.areas || []); });
    var cnt = ST.stages.map(function (s, i) { return all.filter(function (a) { return SYS.stage(a) === i; }).length; });
    root.appendChild(h("section", { class: "card" }, h("h2", {}, cur.fa + (cur.en ? " · " + cur.en : "")), cur.about_fa ? h("p", {}, cur.about_fa) : null,
      h("p", { class: "small" }, h("b", {}, "اصول: "), (cur.axioms || []).map(function (x) { var ax = ((window.EPI_FOUND || {}).AX || []).filter(function (y) { return y.id === x; })[0]; return x + (ax ? " (" + ax.fa + ")" : ""); }).join("، ")),
      cur.bridge_fa ? h("p", { class: "small" }, h("b", {}, "پلِ تجربه به اصول: "), cur.bridge_fa) : null,
      h("ol", { class: "small terr-stages", start: 0 }, ST.stages.map(function (s, i) { return h("li", { value: i }, h("b", {}, s + ": "), ST.need[i]); })),
      h("div", { class: "bt-stats" }, ST.stages.map(function (s, i) { return h("div", { class: "card soft bt-stat" }, h("div", { class: "small muted" }, "گامِ " + fa(i) + " — " + s), h("div", { class: "bt-num" }, fa(cnt[i]))); }))));
    var q = h("input", { type: "search", placeholder: "جستجوی حوزه…", "aria-label": "جستجوی حوزه", oninput: function () { fill(); } });
    var list = h("div", { class: "col gap" });
    function fill() {
      list.innerHTML = ""; var qs = (q.value || "").trim();
      (cur.groups || []).forEach(function (g) {
        var as = (g.areas || []).filter(function (a) { return !qs || (a.fa + " " + (a.en || "") + " " + (a.desc_fa || "")).indexOf(qs) >= 0; });
        if (!as.length) return;
        list.appendChild(h("section", { class: "card terr-group", "data-g": g.id }, h("h3", {}, g.fa + (g.en ? " · " + g.en : "") + " (" + fa(as.length) + ")"),
          h("ul", { class: "plain" }, as.map(function (a) {
            var st = SYS.stage(a), rec = SYS.ledger()[a.id] || {}, u = SYS.uses(a);
            return h("li", { class: "terr-area", "data-a": a.id, "data-stage": st }, h("details", {},
              h("summary", {}, bar(st), " ", h("b", {}, a.fa), a.en ? h("span", { class: "muted small" }, " · " + a.en) : null, h("span", { class: "chip" }, ST.stages[st])),
              a.desc_fa ? h("p", { class: "small" }, a.desc_fa) : null,
              (a.key_questions_fa || []).length ? h("ul", { class: "small" }, a.key_questions_fa.map(function (x) { return h("li", {}, x); })) : null,
              (a.claims || []).length ? h("ul", { class: "small terr-claims" }, a.claims.map(function (c) { return h("li", { "data-kind": c.kind }, h("b", {}, (KIND[c.kind] || c.kind) + ": "), c.fa, h("div", { class: "muted" }, c.basis_fa || "")); })) : null,
              (a.tools || []).length ? h("div", { class: "small row gap wrap" }, h("b", {}, "ابزار در صفحه: "), a.tools.map(function (r) { var t = SYS.tool(r); return t ? h("button", { class: "chip linkish", type: "button", onclick: function () { A.go(t.go[0], t.go[1] == null ? null : t.go[1], t.go[2] || null); } }, t.fa) : h("span", { class: "chip warn" }, r); })) : null,
              a.gap_fa ? h("p", { class: "small warnline" }, h("b", {}, "کمبودِ صفحه: "), a.gap_fa) : null,
              h("p", { class: "small muted" }, "کاربست‌های تو با نتیجه: " + (u.n ? fa(u.n) + " (" + u.det.join("، ") + ")" : "هنوز نه") + (st === 5 ? " — تثبیت‌شده در کارِ تو" : "")),
              (rec.history || []).length ? h("ol", { class: "small terr-hist" }, rec.history.map(function (x) { return h("li", {}, x.at + " ⇒ گامِ " + fa(x.stage) + ": " + x.what + " — " + x.by); })) : null));
          }))));
      });
      if (!list.children.length) list.appendChild(h("p", { class: "small muted" }, "حوزه‌ای با این پالایه نیست."));
    }
    root.appendChild(h("div", { class: "row gap wrap" }, q)); root.appendChild(list); fill();
    if ((cur.sources || []).length) root.appendChild(h("details", { class: "card soft" }, h("summary", {}, "منابعِ نقشه (" + fa(cur.sources.length) + ")"),
      h("ul", { class: "small" }, cur.sources.map(function (x) { return h("li", {}, x.url ? h("a", { href: x.url, target: "_blank", rel: "noopener" }, x.title) : x.title); }))));
    return root;
  };
  A.VIEW_META = A.VIEW_META || {};
  A.VIEW_META.sterr = { j: "ws", what: "قلمروِ هر سامانهٔ این صفحه (یادگیری، ذهن، حلِ مسئله، تصمیم، ارتباط، خودشناسی): همهٔ حوزه‌ها، گامِ هر کدام، گزاره‌ها بر پایهٔ اصول، ابزارهای صفحه و کمبودها.", why: "تا بدانی هر موضوع در کدام حوزه است، صفحه برایش چه دارد و چه ندارد." };
  if (A.GRAPH && A.GRAPH.MAPS && !A.GRAPH.MAPS.some(function (m) { return m.v === "sterr"; })) A.GRAPH.MAPS.push({ v: "sterr", fa: "🗺 قلمروِ سامانه‌ها", what: "یادگیری، ذهن، حلِ مسئله، تصمیم، ارتباط و خودشناسی — حوزه‌ها، گام‌ها، ابزارها و کمبودها" });

  /* دستیار: قلمروهای همهٔ سامانه‌ها با گامِ هر حوزه — تا «نیست / در راه / خراب» را در هر سامانه درست تشخیص دهد */
  SYS.manifest = function () {
    var L = ["## قلمروِ سامانه‌ها (view=sterr arg=<سامانه>) — گامِ هر حوزه ۰…۵ (۰ نقشه‌شده، ۳ رده‌بندی‌شده — ابزار ناقص یا نیست، ۴ ابزارِ کامل در صفحه، ۵ تثبیت در کارِ کاربر)؛ کمبودِ این‌ها ⇒ area=sys-territory"];
    SYS.systems().forEach(function (m) {
      L.push("- " + m.id + " «" + m.fa + "»: " + (m.groups || []).map(function (g) { return (g.areas || []).map(function (a) { return a.id + "=" + a.fa + ":" + SYS.stage(a) + ((a.tools || []).length ? "" : "∅"); }).join("، "); }).join("، "));
    });
    L.push("(∅ = هنوز هیچ ابزاری در صفحه برای آن حوزه نیست)");
    return L.join("\n");
  };
  /* «# دانسته‌های قلمرو»: حوزه‌های مرتبط با پیام (از هر شش سامانه و قلمروِ معرفت‌شناسی) با گزاره‌ها و رده‌شان — دستیار یافتهٔ
     تثبیت‌شده را از همین‌جا می‌گوید، نه از حافظهٔ خودش، و «حکم نمی‌کنم» را با «یافته چیست» اشتباه نمی‌گیرد (کارزارِ آزمون) */
  var STOP = /^(که|را|از|به|با|در|این|آن|برای|است|هست|نیست|می|من|تو|یه|یک|هم|اگر|چرا|چه|چطور|کنم|کنی|کند|بود|شد|شده|دارم|داره|دیگه|خیلی|همه|ولی|اما|تا|رو|اون|این‌ها|باید)$/;
  function toks(t) { return String(t || "").replace(/[\u064B-\u065F\u0670\u0654\u200c]/g, "").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[^\u0600-\u06FFa-zA-Z0-9 ]+/g, " ").split(/\s+/).filter(function (w) { return w.length >= 3 && !STOP.test(w); }).map(function (w) { return w.replace(/(ها|های|هایی|ی|ام|ات|اش)$/, ""); }); }
  SYS.related = function (text, n) {
    var q = toks(text); if (!q.length) return [];
    var qs = {}; q.forEach(function (w) { qs[w] = 1; });
    function score(blob) { var b = toks(blob), hit = 0, seen = {}; b.forEach(function (w) { if (qs[w] && !seen[w]) { seen[w] = 1; hit++; } else if (w.length >= 4) Object.keys(qs).forEach(function (k) { if (k.length >= 4 && !seen[k] && (w.indexOf(k) === 0 || k.indexOf(w) === 0)) { seen[k] = 1; hit += 0.5; } }); }); return hit; }
    var out = [];
    SYS.areas().forEach(function (x) { var a = x.a, sc = 2 * score(a.fa + " " + (a.en || "")) + score((a.desc_fa || "") + " " + (a.key_questions_fa || []).join(" ") + " " + (a.claims || []).map(function (c) { return c.fa; }).join(" ")); if (sc >= 2) out.push({ sc: sc + 0.5, sys: x.sys, a: a, epi: false }); });
    var T = window.EPI_TERR || {}, EL = ((window.EPI_BT_LEDGER || {}).territory || {}).areas || {};
    (T.groups || []).forEach(function (g) { (g.areas || []).forEach(function (a) { var sc = 2 * score(a.fa + " " + (a.en || "")) + score((a.desc_fa || "") + " " + (a.key_questions_fa || []).join(" ")); if (sc >= 2) out.push({ sc: sc, a: a, epi: true, st: (EL[a.id] || {}).stage || 0 }); }); });
    return out.sort(function (a, b) { return b.sc - a.sc; }).slice(0, n || 4);
  };
  /* حوزه با شناسه (برای know ِ مدل): هم سامانه‌ها هم معرفت‌شناسی */
  SYS.byId = function (id) {
    var x = SYS.find(id); if (x) return { sys: x.sys, a: x.a, epi: false };
    var T = window.EPI_TERR || {}, EL = ((window.EPI_BT_LEDGER || {}).territory || {}).areas || {}, hit = null;
    (T.groups || []).forEach(function (g) { (g.areas || []).forEach(function (a) { if (a.id === id) hit = { a: a, epi: true, st: (EL[a.id] || {}).stage || 0 }; }); });
    return hit;
  };
  SYS.knowledge = function (s, msg) {
    var want = ((s && s.know) || []).map(SYS.byId).filter(Boolean);
    var rel = want.concat(SYS.related((msg || "") + " " + ((s && s.pinned) || ""), 3).filter(function (r) { return !want.some(function (w) { return w.a.id === r.a.id; }); })).slice(0, 6);
    if (!rel.length) return "";
    var L = ["# دانسته‌های قلمرو (حوزه‌های مرتبط با همین پیام — از نقشه‌ها، نه از حافظهٔ مدل)"];
    rel.forEach(function (r) {
      var a = r.a;
      if (r.epi) { L.push("- [معرفت‌شناسی] " + a.id + " «" + a.fa + "» گامِ " + r.st + (r.st <= 1 ? " (هنوز محتوای سنجیده ندارد)" : "") + ": " + (a.desc_fa || "") + (a.key_questions_fa ? " — پرسش‌ها: " + a.key_questions_fa.slice(0, 2).join(" / ") : "")); return; }
      L.push("- [" + r.sys.fa + "] " + a.id + " «" + a.fa + "» گامِ " + SYS.stage(a) + (a.tools && a.tools.length ? " — ابزارها: " + a.tools.slice(0, 5).join("، ") : "") + (a.gap_fa ? " — کمبودِ صفحه: " + a.gap_fa.slice(0, 160) : ""));
      (a.claims || []).slice(0, 3).forEach(function (c) { L.push("   · " + (KIND[c.kind] || c.kind) + ": " + c.fa + " — " + String(c.basis_fa || "").slice(0, 140)); });
    });
    return L.join("\n").slice(0, 4000);
  };
  if (A.ASSIST) (A.ASSIST.promptHooks = A.ASSIST.promptHooks || []).push(SYS.knowledge);
  if (A.ASSIST && A.ASSIST.manifest && !A.ASSIST.manifest._sys) {
    var rawM = A.ASSIST.manifest;
    A.ASSIST.manifest = function () { var t = rawM.apply(this, arguments); try { return t + "\n" + SYS.manifest(); } catch (e) { return t; } };
    A.ASSIST.manifest._sys = true;
  }
})(APP);
