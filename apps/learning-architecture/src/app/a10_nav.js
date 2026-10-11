/* ===== راه‌یابی: «اینجا کجاست»، «از کجا آمدی»، «↩ برگرد» =====
   مشکلی که حل می‌کند (مالک ۲۰۲۶-۱۰-۱۱): با زدنِ هر پیوند به صفحهٔ دیگری پرت می‌شدی و نه می‌دانستی کجایی، نه از کجا آمدی،
   نه راهی برای برگشت به همان نقطه بود. حالا:
   • هر بار از درونِ یک صفحه به صفحهٔ دیگری می‌روی، جای قبلی (صفحه، بخشی که رویش زدی، و جای اسکرول) در «ردِ پا» می‌ماند؛
   • بالای هر صفحه نوارِ «📍 اینجا» (سامانه › گروه › صفحه) و دکمهٔ «↩ برگرد به …» هست که دقیقاً همان‌جا برمی‌گرداند؛
   • رفتن از منوی کناری یعنی «شروعِ تازه» و ردِ پا را پاک می‌کند؛ رفتن بینِ زبانه‌های یک صفحه ردِ پا نمی‌سازد. */
(function (A) {
  var h = A.h;
  var rawGo = A.go, rawRender = A.render;
  var PARENT = { tech: "lib", topic: "topics", proto: "protos", e_case: "e_cases", lesson: "course" };
  A.trail = [];
  var lastClick = null;
  document.addEventListener("click", function (e) { lastClick = e.target; }, true);

  function mainEl() { return document.getElementById("main"); }
  function scrollPos() {
    var se = document.scrollingElement || document.documentElement;
    return { win: window.scrollY || se.scrollTop || 0, main: (mainEl() || {}).scrollTop || 0 };
  }
  function pageTitle() {
    var m = mainEl(); var h1 = m && m.querySelector("h1");
    var t = h1 ? h1.textContent.trim() : "";
    if (A.state.view === "tech" && A.TM[A.state.arg]) t = A.fa(A.state.arg) + " · " + A.TM[A.state.arg].fa;
    return t || navLabel(A.state.view) || A.state.view;
  }
  /* بخشی از صفحه که رویش زدی: نزدیک‌ترین کارت/بخش با عنوان */
  function clickContext() {
    var m = mainEl(); var el = lastClick;
    if (!m || !el || !m.contains(el)) return "";
    while (el && el !== m) {
      if (/^(SECTION|ARTICLE|DETAILS)$/.test(el.tagName) || (el.classList && el.classList.contains("card"))) {
        var hd = el.querySelector("h2, h3, h4, summary, .eyebrow, header b, strong");
        var tx = hd && hd.textContent.replace(/\s+/g, " ").trim();
        if (tx) return tx.slice(0, 70);
      }
      el = el.parentElement;
    }
    return "";
  }
  function navEntry(view) {
    var lists = [[A.NAV || [], "سامانه یادگیری"], [A.EPI_NAV || [], "کارخانه معرفت‌شناسی"]];
    for (var l = 0; l < lists.length; l++) {
      var g = "";
      for (var i = 0; i < lists[l][0].length; i++) {
        var n = lists[l][0][i];
        if (n.g) { g = n.g; continue; }
        if (n[0] === view) return { sys: lists[l][1], group: g, label: n[1] };
      }
    }
    if (A.NAV_START && view === A.NAV_START[0]) return { sys: "", group: "", label: A.NAV_START[1] };
    if (A.NAV_SETTINGS && view === A.NAV_SETTINGS[0]) return { sys: "", group: "", label: A.NAV_SETTINGS[1] };
    if (view === "course") return { sys: "سامانه یادگیری", group: "دوره", label: "دورهٔ گام‌به‌گام" };
    return null;
  }
  function navLabel(view) { var e = navEntry(view); return e ? e.label : ""; }

  A.go = function (view, arg, sub) {
    var cur = A.state || {};
    var nArg = arg == null ? null : arg;
    var moving = cur.view && (cur.view !== view || String(cur.arg) !== String(nArg));
    if (!A._noTrail && moving && mainEl()) {
      var ctx = clickContext(), title = pageTitle();
      A.trail.push({ view: cur.view, arg: cur.arg, sub: cur.sub, label: title, ctx: ctx && ctx !== title ? ctx : "", scroll: scrollPos() });
      if (A.trail.length > 25) A.trail.shift();
    }
    A._noTrail = false;
    rawGo(view, arg, sub);
  };
  /* منوی کناری: شروعِ تازه */
  A.goRoot = function (view, arg, sub) { A.trail = []; A._noTrail = true; A.go(view, arg, sub); };
  /* برگشت به یک قدمِ مشخص از ردِ پا (پیش‌فرض: آخرین) */
  A.back = function (i) {
    if (!A.trail.length) return;
    if (i == null) i = A.trail.length - 1;
    var e = A.trail[i]; A.trail = A.trail.slice(0, i);
    A._noTrail = true; A.go(e.view, e.arg, e.sub);
    var sp = e.scroll || {};
    setTimeout(function () {
      var m = mainEl(); if (m && sp.main) m.scrollTop = sp.main;
      if (sp.win) window.scrollTo(0, sp.win);
    }, 30);
  };
  /* بازگشت با دکمهٔ Back ِ مرورگر (میزبان) */
  var rawFromURL = A.goFromURL;
  if (rawFromURL) A.goFromURL = function (q) {
    var cur = A.state || {};
    var same = q && q.tab === cur.view && String(q.a || "") === String(cur.arg == null ? "" : cur.arg);
    if (q && q.tab && !same) {
      for (var i = A.trail.length - 1; i >= 0; i--) {
        var e = A.trail[i];
        if (e.view === q.tab && String(e.arg == null ? "" : e.arg) === String(q.a || "")) { A.trail = A.trail.slice(0, i); break; }
        if (i === 0) A.trail = [];
      }
    }
    return rawFromURL(q);
  };

  function crumbs() {
    var v = A.state.view, ent = navEntry(v) || navEntry(PARENT[v]) || {};
    var here = h("div", { class: "where" }, h("span", { class: "pin", "aria-hidden": "true" }, "📍"),
      ent.sys ? h("span", { class: "cr" }, ent.sys) : null,
      ent.group ? h("span", { class: "cr" }, ent.group) : null,
      PARENT[v] && navEntry(PARENT[v]) ? h("button", { class: "cr link", onclick: function () { A.go(PARENT[v]); } }, navLabel(PARENT[v])) : null,
      h("span", { class: "cr now" }, PARENT[v] ? pageTitle() : (ent.label || pageTitle())));
    var bar = h("nav", { class: "crumbs", "aria-label": "جای تو" }, here);
    if (A.trail.length) {
      var last = A.trail[A.trail.length - 1];
      bar.appendChild(h("div", { class: "trailrow" },
        h("button", { class: "btn sm backbtn", onclick: function () { A.back(); }, title: "دقیقاً به همان صفحه و همان جای اسکرول برمی‌گردی" },
          "↩ برگرد به «" + last.label + "»"),
        last.ctx ? h("span", { class: "small muted fromctx" }, "از بخشِ «" + last.ctx + "» آمدی") : null,
        A.trail.length > 1 ? h("details", { class: "trailall" }, h("summary", { class: "small" }, "مسیری که آمدی (" + A.fa(A.trail.length) + " قدم)"),
          h("ol", { class: "small" }, A.trail.map(function (e, i) {
            return h("li", {}, h("button", { class: "linkish", onclick: function () { A.back(i); } }, e.label + (e.ctx ? " › " + e.ctx : "")));
          }))) : null));
    }
    return bar;
  }
  A.render = function () {
    rawRender();
    var m = mainEl(); if (!m) return;
    try {
      m.insertBefore(crumbs(), m.firstChild);
      if (A.trail.length) {
        var last = A.trail[A.trail.length - 1];
        m.appendChild(h("button", { class: "backfab", title: "برگرد به «" + last.label + "»", "aria-label": "برگرد به «" + last.label + "»", onclick: function () { A.back(); } }, "↩ برگرد"));
      }
    } catch (e) { console.error(e); }
  };
})(APP);
