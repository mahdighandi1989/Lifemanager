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
  /* شناسهٔ تونلِ سامانه ⇒ رفتن به همان جا (فقط آنچه نمایش دارد) */
  SR.go = function (sid) {
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
    var src = SR.get(id) || all[0];
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
            (o.v.system || []).length ? h("div", { class: "small row gap wrap" }, (o.v.system || []).slice(0, 8).map(function (sid) { var g = SR.go(sid); return g ? h("button", { class: "linkish", type: "button", onclick: g }, "↗ " + sid) : h("span", { class: "muted" }, sid); })) : null);
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
    AS.promptHooks.push(function (s, msg) {
      var recent = [String(msg || "")].concat(((s && s.msgs) || []).filter(function (m) { return m.role === "user"; }).slice(-4).map(function (m) { return m.text; })).join(" ");
      if (!((A.state && A.state.view === "sources") || /کتاب|منبع|پولیا|polya|پوشش|روشِ? حلِ? مسئله/i.test(recent))) return "";
      var L = ["# منبع‌ها و پوشش (کتاب‌هایی که مالک فرستاده — نمای «sources»)"];
      SR.all().forEach(function (src) {
        var C = SR.counts(src), V = (src.coverage || {}).verdicts || {};
        L.push("- «" + src.title + "» (" + (src.coverage || {}).audited + "): عمیق " + C["عمیق"] + " · سطحی " + C["سطحی"] + " · ندارد " + C["ندارد"] + " · نامربوط " + C["نامربوط"]);
        var miss = (src.items || []).filter(function (it) { return (V[it.id] || {}).verdict === "ندارد"; }).slice(0, 15).map(function (it) { return it.name_fa; });
        if (miss.length) L.push("  نبوده‌ها (نمونه): " + miss.join("، "));
      });
      L.push("- اگر کاربر کتاب یا منطقِ تازه‌ای فرستاد و پرسید «در سامانه هست؟»: خودت داوری نکن؛ برگهٔ فوری بگذار: فیلدِ gap با area="lla-sources"، kind="build"، title="منبعِ تازه: <نامِ منبع>"، و در missing بنویس فایل در کدام پیوستِ همین سشن است تا روتین طبقِ روالِ «📚 منبع‌ها و پوشش» (AGENTS.md) کامل بخواند، بسنجد، کمبودها را در تونل‌های موجود بسازد و همین نما به‌روز شود.");
      return L.join("\n");
    });
  }
})(APP);
