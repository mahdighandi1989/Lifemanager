/* ===== «🗺 قلمروِ معرفت‌شناسی» در «اعتبارسنجیِ کارخانه و جزوه» (مالک ۲۰۲۶-۱۰-۱۴) =====
   نقشهٔ کاملِ حوزه‌های معرفت‌شناسی (EPI_TERR، از منابعِ معتبر) و پیشرفتِ گام‌به‌گامِ هر حوزه (backtest/territory.json — فقط ابزارِ قطعی
   جلو می‌بردش). صفحه چیزی را عوض نمی‌کند؛ همان دفتر را نشان می‌دهد. سندِ همین نقشه با تاریخچهٔ هر حوزه: docs/TERRITORY.md. */
(function (A) {
  var h = A.h, fa = A.fa;
  function D() { return (window.EPI_BT_LEDGER || {}).territory || { areas: {} }; }
  function bar(stage) { var b = h("span", { class: "terr-bar", "aria-label": "گامِ " + fa(stage) + " از ۵" }); for (var i = 1; i <= 5; i++) b.appendChild(h("i", { class: i <= stage ? "on" : "" })); return b; }
  A.territoryPanel = function () {
    var T = window.EPI_TERR || { groups: [], STAGES: [] }, S = D().areas || {}, box = h("div", { class: "col gap terr", dir: "rtl" });
    var all = []; (T.groups || []).forEach(function (g) { (g.areas || []).forEach(function (a) { all.push(a); }); });
    var cnt = T.STAGES.map(function (s) { return all.filter(function (a) { return ((S[a.id] || {}).stage || 0) === s.n; }).length; });
    var score = all.reduce(function (t, a) { return t + ((S[a.id] || {}).stage || 0); }, 0);
    box.appendChild(h("section", { class: "card" }, h("h2", {}, "🗺 قلمروِ معرفت‌شناسی — همهٔ حوزه‌ها و پیشرفتِ هر کدام"),
      h("p", {}, "نقشهٔ کاملِ حوزه‌های این علم، از منابعِ معتبر (فهرستِ منابع پایینِ صفحه). هر حوزه گام‌به‌گام جلو می‌رود و هر گام با شاهد ثبت می‌شود. گسترش فقط بر پایهٔ همان پنج اصلِ بدیهیِ «🧱 مبنای درجه‌ها»: هر گزارهٔ یک حوزه یا قضیه‌ای از آن‌هاست، یا قضیه × مقدارِ پایه‌ای که با واقعیت سنجیده می‌شود، یا صادقانه «بیرون از قلمروِ قطعی» علامت می‌خورد — هیچ چیز ساخته نمی‌شود."),
      h("ol", { class: "small terr-stages" }, T.STAGES.map(function (s) { return h("li", { value: s.n }, h("b", {}, s.fa + ": "), s.need); })),
      h("div", { class: "bt-stats" }, T.STAGES.map(function (s, i) { return h("div", { class: "card soft bt-stat" }, h("div", { class: "small muted" }, "گامِ " + fa(s.n) + " — " + s.fa), h("div", { class: "bt-num" }, fa(cnt[i]))); })
        .concat([h("div", { class: "card soft bt-stat" }, h("div", { class: "small muted" }, "پیشرفتِ کل"), h("div", { class: "bt-num" }, fa(Math.round(100 * score / Math.max(1, all.length * 5))) + "٪"), h("div", { class: "small" }, fa(all.length) + " حوزه"))]))));
    var rounds = (((window.EPI_BT_LEDGER || {}).ledger || {}).rounds || []).filter(function (r) { return r.territory; });
    if (rounds.length) box.appendChild(h("p", { class: "small muted" }, "روند (امتیازِ کل در دورها): " + rounds.map(function (r) { return fa(r.round) + ": " + fa(r.territory.score); }).join(" · ")));
    var q = h("input", { type: "search", placeholder: "جستجوی حوزه…", "aria-label": "جستجوی حوزه", oninput: function () { fill(); } });
    var sel = h("select", { "aria-label": "گام", onchange: function () { fill(); } }, [["", "همهٔ گام‌ها"]].concat(T.STAGES.map(function (s) { return [String(s.n), "گامِ " + s.n + " — " + s.fa]; })).map(function (o) { return h("option", { value: o[0] }, o[1]); }));
    var list = h("div", { class: "col gap" });
    function fill() {
      list.innerHTML = ""; var qs = (q.value || "").trim();
      (T.groups || []).forEach(function (g) {
        var as = (g.areas || []).filter(function (a) { var st = (S[a.id] || {}).stage || 0; return (sel.value === "" || String(st) === sel.value) && (!qs || (a.fa + " " + (a.en || "") + " " + (a.desc_fa || "")).indexOf(qs) >= 0); });
        if (!as.length) return;
        list.appendChild(h("section", { class: "card terr-group", "data-g": g.id }, h("h3", {}, g.fa + (g.en ? " · " + g.en : "") + " (" + fa(as.length) + ")"),
          h("ul", { class: "plain" }, as.map(function (a) {
            var c = S[a.id] || { stage: 0 }, st = c.stage || 0;
            return h("li", { class: "terr-area", "data-a": a.id, "data-stage": st }, h("details", {},
              h("summary", {}, bar(st), " ", h("b", {}, a.fa), a.en ? h("span", { class: "muted small" }, " · " + a.en) : null, h("span", { class: "chip" }, (T.STAGES[st] || {}).fa || "")),
              a.desc_fa ? h("p", { class: "small" }, a.desc_fa) : null,
              (a.key_questions_fa || []).length ? h("ul", { class: "small" }, a.key_questions_fa.map(function (x) { return h("li", {}, x); })) : null,
              (a.book || []).length ? h("p", { class: "small" }, h("b", {}, "جزوه: "), a.book.join("، ")) : h("p", { class: "small muted" }, "در جزوهٔ مصباح نیست."),
              (c.claims || []).length ? h("ul", { class: "small terr-claims" }, c.claims.map(function (x) { return h("li", { "data-kind": x.kind || "" }, h("b", {}, ({ theorem: "قضیه", base: "قضیه × پایه", outside: "بیرون از قلمروِ قطعی" }[x.kind] || "گزاره") + ": "), x.txt, x.th ? h("span", { class: "muted" }, " — " + x.th) : null, x.why ? h("span", { class: "muted" }, " — " + x.why) : null); })) : null,
              c.boundary ? h("p", { class: "small" }, h("b", {}, "مرز: "), c.boundary) : null,
              c.verify ? h("p", { class: "small muted" }, "تثبیت: " + fa(c.verify.ok) + " از " + fa(c.verify.fresh) + " واقعهٔ تازه درست (لازم ≥ ۳، همه درست)") : null,
              (c.history || []).length ? h("ol", { class: "small terr-hist" }, c.history.map(function (x) { return h("li", {}, "دورِ " + fa(x.round) + " (" + x.at + ") ⇒ گامِ " + fa(x.stage) + ": " + x.what + " — " + x.by); })) : null));
          }))));
      });
      if (!list.children.length) list.appendChild(h("p", { class: "small muted" }, "حوزه‌ای با این پالایه نیست."));
    }
    box.appendChild(h("div", { class: "row gap wrap" }, q, sel));
    box.appendChild(list); fill();
    if ((T.sources || []).length) box.appendChild(h("details", { class: "card soft" }, h("summary", {}, "منابعِ نقشه (" + fa(T.sources.length) + ")"),
      h("ul", { class: "small" }, T.sources.map(function (x) { return h("li", {}, x.url ? h("a", { href: x.url, target: "_blank", rel: "noopener" }, x.title) : x.title); }))));
    if (A.HOST && A.HOST.openDoc) box.appendChild(h("button", { class: "btn sm", onclick: function () { A.HOST.openDoc("TERRITORY"); } }, "📄 سندِ قلمرو با تاریخچهٔ هر حوزه"));
    return box;
  };
})(APP);
