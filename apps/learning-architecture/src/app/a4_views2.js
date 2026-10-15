/* ===== نماها: نقشه، موضوع‌ها، پروتکل‌ها، مرور، دغدغه‌ها، اطلس، مبانی، تنظیمات، راه‌اندازی ===== */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, C = A.C;

  /* ---------- نقشه و گراف ---------- */
  A.V.map = function (arg, sub) {
    var root = h("div", { class: "page" });
    root.appendChild(A.head("نقشه", "جریان، شبکه و ترتیب", "تصویر کلی سامانه در سه نما: مراحلی (۹ فاز) که هر موضوع طی می‌کند، اینکه ۴۵ تکنیک چطور و چرا به هم مربوط‌اند، و ترتیب پیشنهادی برای یاد گرفتن خودِ تکنیک‌ها."));
    var tab = sub || "flow";
    root.appendChild(A.tabs([["flow", "جریان ۹ فازی"], ["net", "شبکه روابط"], ["plan", "برنامه ۸ هفته‌ای و اولویت‌ها"]].concat(A.graphPanel ? [["graph", "🕸 گرافِ کاملِ یادگیری"]] : []), tab, function (k) { A.go("map", null, k); }));
    if (tab === "graph" && A.graphPanel) { root.appendChild(A.graphPanel({ ctx: "learn", sys: { learn: 1, mine: 1, epi: 0 } })); return root; }
    if (A.GRAPH) root.appendChild(h("p", { class: "small" }, "این نقشه فقط لایهٔ تکنیک‌ها و فازهاست. ", h("button", { class: "linkish", onclick: function () { A.GRAPH.open(null); } }, "🕸 گرافِ مشترک"), " همهٔ سامانهٔ یادگیری (سفر، حرکت‌ها، پروتکل‌ها، دغدغه‌ها، گره‌ها، مزرعه، مسئله‌ها) را همراهِ پل‌هایش به معرفت‌شناسی نشان می‌دهد."));
    if (tab === "flow") root.appendChild(flow());
    else if (tab === "net") root.appendChild(network());
    else root.appendChild(plan());
    return root;
  };
  function flow() {
    var wrap = h("div", { class: "flow" });
    wrap.appendChild(h("p", { class: "small muted" }, "فازهای ۰ و ۱ همیشه برقرارند (پیش از هر جلسه). فازهای ۲ تا ۸ را برای هر موضوع به ترتیب طی می‌کنی، ولی برگشت هم دارد: اگر در فاز ۷ برداشتت رد شد، به فاز ۲ برمی‌گردی؛ و مرورِ فاز ۸ از همان روز اول شروع می‌شود. تکنیک‌های پررنگ مهم‌ترین‌اند (هسته)."));
    C.PHASES.forEach(function (p, i) {
      var ids = A.T.filter(function (t) { return A.phaseOf(t.id) === p.n; }).map(function (t) { return t.id; }).sort(function (a, b) { return C.PRIORITY[a] - C.PRIORITY[b] || a - b; });
      wrap.appendChild(h("div", { class: "fstage" + (p.always ? " always" : ""), style: { "--pc": "var(--p" + p.n + ")" } },
        h("div", { class: "fnum" }, fa(p.n)),
        h("div", { class: "fbody" },
          h("div", { class: "row between wrap" }, h("h3", {}, p.fa), p.always ? h("span", { class: "chip" }, "همیشه‌روشن") : null),
          h("p", {}, p.goal),
          h("div", { class: "small" }, h("strong", {}, "خروجی فاز: "), p.out),
          p.note ? h("div", { class: "small muted" }, p.note) : null,
          h("div", { class: "row gap wrap mt" }, ids.map(function (id) { var el = A.techLink(id); if (C.PRIORITY[id] === 1) el.classList.add("core"); return el; })),
          C.PHASE_REFS[p.n] ? h("div", { class: "row gap wrap mt" }, h("span", { class: "small muted" }, "پروتکل/بخش:"), C.PHASE_REFS[p.n].map(A.refChip), C.PHASE_REF_NOTE[p.n] ? h("span", { class: "small muted" }, C.PHASE_REF_NOTE[p.n]) : null) : null)));
      if (i === 1) wrap.appendChild(h("div", { class: "fsplit" }, "↓ از اینجا هر موضوع وارد خط لوله می‌شود"));
      if (i === 7) wrap.appendChild(h("div", { class: "floop" }, "↺ اگر فرضیه ابطال شد یا خطا تکرار شد: ممیزی دوحلقه‌ای (۳۹) ← بازگشت به فاز ۲ با فرض حاکم جدید"));
    });
    return wrap;
  }
  function network() {
    var wrap = h("div", { class: "net" });
    var show = A.netShow = A.netShow || { req: true, feeds: true, pairs: false };
    var sel = A.netSel || null;
    var info = h("div", { class: "netinfo card" });
    var W = 1100, H = 560, padX = 60;
    var cols = {}; A.T.forEach(function (t) { var p = A.phaseOf(t.id); (cols[p] = cols[p] || []).push(t.id); });
    var pos = {};
    for (var p = 0; p <= 8; p++) {
      var ids = (cols[p] || []).sort(function (a, b) { return a - b; });
      var x = W - padX - p * ((W - 2 * padX) / 8);
      ids.forEach(function (id, i) { pos[id] = { x: x, y: 60 + (i + 0.5) * ((H - 90) / Math.max(ids.length, 5)) + (ids.length < 5 ? ((5 - ids.length) * (H - 90) / 10) : 0) }; });
    }
    var s = A.svg;
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "netsvg", role: "img", "aria-label": "شبکه روابط ۴۵ تکنیک" });
    var defs = s("defs", {});
    ["req", "feeds", "pairs"].forEach(function (k) { var mk = s("marker", { id: "nm-" + k, viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "6", markerHeight: "6", orient: "auto-start-reverse" }); mk.appendChild(s("path", { d: "M0,0 L10,5 L0,10 z", class: "nmk-" + k })); defs.appendChild(mk); });
    svg.appendChild(defs);
    for (var q = 0; q <= 8; q++) {
      var xx = W - padX - q * ((W - 2 * padX) / 8);
      svg.appendChild(s("text", { x: xx, y: 22, class: "nph", "text-anchor": "middle", style: "fill:var(--p" + q + ")" }, "فاز " + fa(q)));
      svg.appendChild(s("text", { x: xx, y: 38, class: "nphs", "text-anchor": "middle" }, C.PHASES[q].short));
    }
    var nb = {}; if (sel) C.EDGES.forEach(function (e) { if (!show[e[2]]) return; if (e[0] === sel) nb[e[1]] = 1; if (e[1] === sel) nb[e[0]] = 1; });
    C.EDGES.forEach(function (e) {
      if (!show[e[2]]) return;
      var a = pos[e[0]], b = pos[e[1]]; if (!a || !b) return;
      var act = sel && (e[0] === sel || e[1] === sel);
      var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
      var x1 = a.x + ux * 15, y1 = a.y + uy * 15, x2 = b.x - ux * 16, y2 = b.y - uy * 16;
      var bend = Math.abs(dx) < 5 ? 50 : 0.12 * d;
      var mx = (x1 + x2) / 2 - uy * bend, my = (y1 + y2) / 2 + ux * bend;
      svg.appendChild(s("path", { d: "M" + x1 + "," + y1 + " Q" + mx + "," + my + " " + x2 + "," + y2, class: "ne ne-" + e[2] + (sel ? (act ? " act" : " dim") : ""), "marker-end": e[2] === "pairs" ? "" : "url(#nm-" + e[2] + ")" }));
    });
    A.T.forEach(function (t) {
      var p0 = pos[t.id], ph = A.phaseOf(t.id);
      var g = s("g", { class: "nn" + (sel === t.id ? " sel" : "") + (sel && !nb[t.id] && sel !== t.id ? " dim" : ""), tabindex: "0", role: "button", "aria-label": t.fa });
      g.appendChild(s("circle", { cx: p0.x, cy: p0.y, r: C.PRIORITY[t.id] === 1 ? 15 : 12.5, style: "fill:var(--p" + ph + ")" }));
      g.appendChild(s("text", { x: p0.x, y: p0.y + 4, class: "nnum", "text-anchor": "middle" }, fa(t.id)));
      g.appendChild(s("text", { x: p0.x, y: p0.y + 28, class: "nlab", "text-anchor": "middle" }, t.fa.length > 16 ? t.fa.slice(0, 15) + "…" : t.fa));
      function pick() { A.netSel = sel === t.id ? null : t.id; A.render(); }
      g.addEventListener("click", pick); g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
      svg.appendChild(g);
    });
    wrap.appendChild(h("div", { class: "row gap wrap netctl" },
      [["req", "پیش‌نیاز مهارتی"], ["feeds", "تغذیه (خروجی ← ورودی)"], ["pairs", "مکمل"]].map(function (k) {
        var cid = "nshow_" + k[0];
        return h("label", { class: "chk", for: cid }, h("input", { type: "checkbox", id: cid, checked: show[k[0]], onchange: function (e) { show[k[0]] = e.target.checked; A.render(); } }), h("span", { class: "lg lg-" + k[0] }), k[1]);
      }),
      h("span", { class: "small muted" }, "روی هر گره بزن تا روابطش با دلیل نمایش داده شود.")));
    wrap.appendChild(h("div", { class: "scrollx netbox" }, svg));
    if (sel) {
      var t = A.TM[sel];
      var es = C.EDGES.filter(function (e) { return show[e[2]] && (e[0] === sel || e[1] === sel); });
      info.appendChild(h("div", { class: "row between wrap" }, h("h3", {}, "تکنیک " + fa(sel) + ": " + t.fa), h("button", { class: "btn sm", onclick: function () { A.go("tech", sel); } }, "باز کردن تکنیک")));
      info.appendChild(h("p", { class: "small" }, t.def));
      info.appendChild(h("ul", { class: "rels" }, es.map(function (e) {
        var other = e[0] === sel ? e[1] : e[0];
        var dir = e[2] === "pairs" ? "مکمل" : e[2] === "req" ? (e[1] === sel ? "پیش‌نیاز آن" : "برای آن پیش‌نیاز است") : (e[1] === sel ? "ورودی از" : "خروجی به");
        return h("li", {}, h("span", { class: "chip" }, dir), " ", A.techLink(other), h("div", { class: "small" }, e[3]));
      })));
      wrap.appendChild(info);
    }
    return wrap;
  }
  function plan() {
    var wrap = h("div", {});
    wrap.appendChild(h("div", { class: "card" }, h("h3", {}, "دو ترتیب متفاوت"),
      h("p", {}, "ترتیب ۱ — اجرای فازها روی یک موضوع: هر موضوع (مثلاً «حد ضرر متحرک بر پایه ATR») از فاز ۰ تا ۸ عبور می‌کند. این را در بخش «موضوع‌ها» اجرا کن."),
      h("p", {}, "ترتیب ۲ — یادگیری خودِ تکنیک‌ها: نمی‌شود ۴۵ مهارت را هم‌زمان یاد گرفت (همان سرریز بار شناختی). برنامه زیر بر پایه پیش‌نیازهای گراف و قوت شواهد چیده شده است. هسته (اولویت ۱) پیش از همه، چون بقیه روی آن سوارند."),
      h("div", { class: "row gap wrap" }, [1, 2, 3].map(function (p) { return h("div", { class: "pribox p" + p }, h("strong", {}, "اولویت " + C.PRIORITY_INFO[p].fa), h("div", { class: "small" }, C.PRIORITY_INFO[p].why)); }))));
    C.CURRICULUM.forEach(function (w) {
      var done = w.ids.filter(function (id) { return A.mastery(id).n >= 2; }).length;
      wrap.appendChild(h("div", { class: "card week" + (done === w.ids.length ? " done" : "") },
        h("div", { class: "row between wrap" }, h("h3", {}, "هفته " + fa(w.w) + " · " + w.fa), h("span", { class: "pill " + (done === w.ids.length ? "good" : "") }, fa(done) + " از " + fa(w.ids.length))),
        h("p", { class: "small" }, w.why),
        h("div", { class: "row gap wrap" }, w.ids.map(function (id) { var m = A.mastery(id); return h("span", { class: "wt2" }, A.techLink(id, { sub: "ws" }), A.mDots(m.lvl)); })),
        w.protos.length ? h("div", { class: "row gap wrap mt" }, h("span", { class: "small muted" }, "پروتکل‌های این هفته:"), w.protos.map(A.refChip)) : null));
    });
    return wrap;
  }

  /* ---------- موضوع‌ها ---------- */
  A.V.topics = function () {
    var root = h("div", { class: "page" });
    root.appendChild(A.head("موضوع‌ها", "یک موضوع، ۹ فاز", "موضوع یعنی چیزی که می‌خواهی عمیق بفهمی: یک مفهوم، فصل یا مسئله. از همین‌جا شروع کن: عنوانش را بنویس؛ تمرین‌ها و روال‌های تکرار به آن وصل می‌شوند تا مسیر فهمت دیده شود."));
    var ti = h("input", { id: "ntTitle", type: "text", placeholder: "مثلاً: چرا یخ روی آب شناور می‌ماند؟" });
    var tk = h("select", { id: "ntKind", "aria-label": "نوع" }, h("option", { value: "" }, "این برای تو چیست؟"), A.FTYPES.map(function (f) { return h("option", { value: f }, f.split(":")[0]); }));
    var td = h("select", { id: "ntDom", "aria-label": "حوزه" }, h("option", { value: "" }, "حوزه"), C.DOMAIN_OPTS.map(function (o) { return h("option", { value: o }, o); }));
    var ts = h("input", { id: "ntSrc", type: "text", "aria-label": "منبع موضوع", placeholder: "منبع (دوره، کتاب، فصل) — اختیاری" });
    root.appendChild(h("div", { class: "card" }, h("h2", {}, "موضوع تازه"), h("div", { class: "frow" }, h("label", { for: "ntTitle" }, "عنوان (بهتر است به شکل پرسش)"), ti), h("div", { class: "row gap wrap" }, tk, td, ts,
      h("button", { class: "btn", onclick: function () { if (!ti.value.trim()) { A.toast("عنوان موضوع را بنویس.", "bad"); return; } var t = S.put({ id: A.uid("tp"), type: "topic", title: ti.value.trim(), dom: td.value, src: ts.value.trim(), kind: tk.value }); A.toNursery(t.title, tk.value.indexOf("گره") === 0 ? "knot" : tk.value ? "fruit" : "concept", { t: "topic", id: t.id }, tk.value.indexOf("مرزی") >= 0 ? "science" : tk.value.indexOf("گره") === 0 ? "me" : ""); A.go("topic", t.id); } }, "ساخت و شروع"))));
    var tops = S.all("topic", function (t) { return !(A.marketSample && A.marketSample(t)); });
    if (!tops.length) root.appendChild(A.empty("هنوز موضوعی نساخته‌ای. عنوان اولین موضوع را در کادر بالا بنویس."));
    root.appendChild(h("div", { class: "tgrid" }, tops.map(function (t) {
      var pr = topicProgress(t.id);
      return h("div", { class: "tcwrap" }, h("button", { class: "tcard", onclick: function () { A.go("topic", t.id); } }, h("div", { class: "tfa" }, t.title), h("div", { class: "small muted" }, (t.dom || "") + (t.src ? " · " + t.src : "")),
        h("div", { class: "phbar" }, C.PHASES.map(function (p) { return h("i", { class: pr.ph[p.n] ? "on" : "", style: { "--pc": "var(--p" + p.n + ")" }, title: "فاز " + fa(p.n) }); })),
        h("div", { class: "small" }, fa(pr.n) + " تمرین · " + fa(pr.phases) + " از ۹ فاز"), t.sample ? h("span", { class: "chip" }, "نمونه") : null),
        A.journeyButton ? A.journeyButton(t, true) : null);
    })));
    return root;
  };
  function topicProgress(tid) {
    var exs = S.all("ex", function (e) { return e.topic === tid && e.status === "done"; });
    var ph = {}; exs.forEach(function (e) { ph[A.phaseOf(e.tid)] = (ph[A.phaseOf(e.tid)] || 0) + 1; });
    S.all("pr", function (r) { return r.topic === tid && r.status === "done" && (r.pid === "P3" || r.pid === "P4"); }).forEach(function () { ph[8] = (ph[8] || 0) + 1; });
    return { n: exs.length, ph: ph, phases: Object.keys(ph).length };
  }
  A.V.topic = function (id) {
    var t = S.get(id); if (!t) return A.empty("موضوع پیدا نشد.");
    var root = h("div", { class: "page" });
    root.appendChild(h("div", { class: "crumbs" }, h("button", { class: "linkish", onclick: function () { A.go("topics"); } }, "← موضوع‌ها")));
    var pr = topicProgress(id);
    root.appendChild(A.head("موضوع" + (t.dom ? " · " + t.dom : ""), t.title, t.src ? "منبع: " + t.src : null,
      h("div", { class: "row gap wrap" }, h("span", { class: "pill" }, fa(pr.n) + " تمرین کامل"), h("span", { class: "pill" }, fa(pr.phases) + " از ۹ فاز"), t.sample ? h("span", { class: "chip" }, "نمونه") : null)));
    if (A.journeyButton) root.appendChild(A.journeyButton(t));
    var scheds = S.all("sched", function (s) { return s.topic === id; }).sort(function (a, b) { return a.due.localeCompare(b.due); });
    root.appendChild(h("div", { class: "card" }, h("div", { class: "row between wrap" }, h("h3", {}, "چرخه بازیابی ۱-۳-۷ برای این موضوع"),
      scheds.length ? null : h("button", { class: "btn sm", onclick: function () { A.start137(id, t.title); A.render(); } }, "شروع چرخه از امروز")),
      scheds.length ? h("div", { class: "row gap wrap" }, scheds.map(function (s) { return h("span", { class: "pill " + (s.done ? "good" : s.due <= A.today() ? "warn" : "") }, s.label + " · " + A.fdate(s.due) + (s.done ? " ✓" : "")); }))
        : h("p", { class: "small muted" }, "پس از اولین مطالعه جدی این موضوع، چرخه را شروع کن تا روز ۱، ۳ و ۷ خودکار در «امروز» ظاهر شود.")));
    root.appendChild(A.pipelineView(t));
    root.appendChild(h("h2", { class: "mt" }, "حالت کامل: همه تکنیک‌های هر فاز روی این موضوع"));
    C.PHASES.forEach(function (p) {
      var ids = A.T.filter(function (x) { return A.phaseOf(x.id) === p.n; }).map(function (x) { return x.id; }).sort(function (a, b) { return C.PRIORITY[a] - C.PRIORITY[b] || a - b; });
      var exs = S.all("ex", function (e) { return e.topic === id && ids.indexOf(e.tid) >= 0; });
      root.appendChild(h("section", { class: "tphase" + (pr.ph[p.n] ? " done" : ""), style: { "--pc": "var(--p" + p.n + ")" } },
        h("div", { class: "phh" }, h("span", { class: "phn" }, fa(p.n)), h("div", {}, h("h3", {}, p.fa), h("p", { class: "small" }, p.goal), h("p", { class: "small muted" }, "خروجی: " + p.out))),
        h("div", { class: "row gap wrap" }, ids.map(function (tid) {
          var n = exs.filter(function (e) { return e.tid === tid && e.status === "done"; }).length;
          return h("button", { class: "tlink" + (C.PRIORITY[tid] === 1 ? " core" : "") + (n ? " has" : ""), style: { "--pc": "var(--p" + p.n + ")" }, onclick: function () { var e = A.newEx(tid, id); A.go("tech", tid, "ws:" + e.id); } },
            h("b", {}, fa(tid)), " ", A.TM[tid].fa, n ? " · " + fa(n) + "✓" : "");
        })),
        exs.length ? h("ul", { class: "plain small mt" }, exs.map(function (e) { return h("li", {}, h("button", { class: "linkish", onclick: function () { A.go("tech", e.tid, "ws:" + e.id); } }, fa(e.tid) + " · " + A.TM[e.tid].fa), " — " + (e.status === "done" ? "کامل" : "پیش‌نویس") + " · " + A.fdate(e.updated)); })) : null));
    });
    var prs = S.all("pr", function (r) { return r.topic === id; });
    if (prs.length) root.appendChild(h("div", { class: "card" }, h("h3", {}, "پروتکل‌های اجراشده روی این موضوع"), h("ul", { class: "plain" }, prs.map(function (r) { return h("li", {}, h("button", { class: "linkish", onclick: function () { A.go("proto", r.pid, r.id); } }, A.PM[r.pid].fa), " · " + A.fdate(r.updated)); }))));
    root.appendChild(h("div", { class: "row gap" }, A.confirmBtn("حذف موضوع (تمرین‌ها باقی می‌مانند)", function () { S.del(id); A.go("topics"); })));
    return root;
  };
  A.start137 = function (topicId, title) {
    [[1, "روز ۱"], [3, "روز ۳"], [7, "روز ۷"]].forEach(function (x) { S.put({ id: A.uid("sc"), type: "sched", proto: "P3", topic: topicId || "", title: title || "", due: A.addDays(A.today(), x[0]), label: x[1], done: false }); });
    A.toast("چرخه ۱-۳-۷ زمان‌بندی شد.");
  };

  /* ---------- پروتکل‌ها ---------- */
  /* دیدن ≠ ذخیره (ممیزی ۲۰۲۶-۱۰-۱۳): زدنِ یک کارِ موعد در «امروز» یا «اجرای تازه» فقط یک پیش‌نویسِ درون‌حافظه می‌سازد؛
     رکورد با اولین ورودیِ واقعی (فیلد، موضوع، روبریک، ثبت) نوشته می‌شود. اگر پیش‌نویسِ نیمه‌کاره‌ای از همان روال با همان موضوع/نوبت
     هست، همان باز می‌شود تا پیش‌نویسِ تکراری ساخته نشود. */
  var DRAFTS = A._protoDrafts = {};
  A.protoDraft = function (id) { return DRAFTS[id] || null; };
  A.startProto = function (pid, o) {
    o = o || {};
    var same = S.all("pr", function (x) { return x.pid === pid && x.status !== "done" && !x.sample && (x.topic || "") === (o.topic || "") && (x.sched || "") === (o.sched || "") && (x.node || "") === (o.node || ""); })[0];
    if (same) { A.go("proto", pid, same.id); return same; }
    var r = { id: A.uid("pr"), type: "pr", pid: pid, topic: o.topic || "", sched: o.sched || "", node: o.node || "", status: "draft", data: o.preset || {}, created: new Date().toISOString() };
    DRAFTS[r.id] = r;
    A.go("proto", pid, r.id);
    return r;
  };
  A.V.protos = function (arg, sub) {
    var root = h("div", { class: "page" });
    root.appendChild(A.head("پروتکل‌ها", "روتین‌هایی که دانش را زنده نگه می‌دارند", "پروتکل یعنی روال زمان‌دار: چه کاری را کِی تکرار کنی تا آموخته‌ها فراموش نشوند (پس از هر جلسه، هفتگی، هر دوره). تکنیک‌ها مهارت‌اند و پروتکل‌ها برنامه به‌کار بستنشان در روزمره. همه از سشن‌های تو استخراج و هر جا لازم بود اصلاح شده‌اند."));
    var tab = sub || "list";
    root.appendChild(A.tabs([["list", "همه پروتکل‌ها"], ["queue", "صف منابع و رژیم داده"]], tab, function (k) { A.go("protos", null, k); }));
    if (tab === "queue") { root.appendChild(queue()); return root; }
    var fq = { session: "پس از هر جلسه", daily: "روزانه", weekly: "هفتگی", monthly: "ماهانه", topic137: "روز ۱، ۳، ۷", course: "هر دوره", concept: "برای هر مفهوم", ongoing: "پیوسته" };
    var rank = { session: 1, concept: 2, daily: 3, topic137: 4, weekly: 5, monthly: 6, course: 7, ongoing: 8 };
    var plist = C.PROTOCOLS.slice().sort(function (a, b) { return (rank[a.freq] || 9) - (rank[b.freq] || 9) || (+a.id.slice(1)) - (+b.id.slice(1)); });
    root.appendChild(h("p", { class: "small muted" }, "ترتیب: از کوتاه‌ترین چرخه (پس از هر جلسه) تا بلندترین (هر دوره) و در پایان روال پیوسته."));
    var lastFq = null;
    root.appendChild(h("div", { class: "plist" }, plist.map(function (p) {
      var hd = p.freq !== lastFq ? h("h2", { class: "plgroup" }, fq[p.freq] || "پیوسته") : null; lastFq = p.freq;
      return [hd, protoCard(p)];
    })));
    return root;
    function protoCard(p) {
      var runs = S.all("pr", function (r) { return r.pid === p.id && r.status === "done"; });
      return h("div", { class: "card proto" },
        h("div", { class: "row between wrap" }, h("div", {}, h("div", { class: "eyebrow" }, (fq[p.freq] || "پیوسته") + " · " + p.dur), h("h3", {}, p.fa)), h("span", { class: "pill" }, fa(runs.length) + " اجرا")),
        h("p", { class: "small" }, h("strong", {}, "کی: "), p.when), h("p", {}, p.why),
        p.fix ? h("p", { class: "small fixline" }, p.fix) : null,
        h("div", { class: "row gap wrap" }, p.ids.map(function (id) { return A.techLink(id); })),
        p.custom === "queue" ? h("button", { class: "btn", onclick: function () { A.go("protos", null, "queue"); } }, "باز کردن صف منابع") : h("div", { class: "row gap wrap mt" }, h("button", { class: "btn", onclick: function () { A.startProto(p.id); } }, "اجرای تازه"), runs.length ? h("button", { class: "btn ghost", onclick: function () { A.go("proto", p.id); } }, "سابقه") : null));
    }
  };
  A.V.proto = function (pid, runId) {
    var p = A.PM[pid]; if (!p) return A.empty("پروتکل پیدا نشد.");
    if (p.custom === "queue") { setTimeout(function () { A.go("protos", null, "queue"); }, 0); return h("div"); }
    var root = h("div", { class: "page" });
    root.appendChild(h("div", { class: "crumbs" }, h("button", { class: "linkish", onclick: function () { A.go("protos"); } }, "← پروتکل‌ها")));
    root.appendChild(A.head("پروتکل · " + p.dur, p.fa, p.why));
    var r = runId && (S.get(runId) || DRAFTS[runId]);
    if (!r) {
      var runs = S.all("pr", function (x) { return x.pid === pid; });
      root.appendChild(h("button", { class: "btn", onclick: function () { A.startProto(pid); } }, "اجرای تازه"));
      root.appendChild(runs.length ? h("table", { class: "dt mt" }, h("thead", {}, h("tr", {}, h("th", {}, "تاریخ"), h("th", {}, "موضوع"), h("th", {}, "وضعیت"), h("th", {}, ""))), h("tbody", {}, runs.map(function (x) {
        var tp = x.topic && S.get(x.topic);
        return h("tr", {}, h("td", {}, A.fdate(x.created)), h("td", {}, tp ? tp.title : (x.data.topic || x.data.src || x.data.course || x.data.sci || "—")), h("td", {}, x.status === "done" ? "کامل" : "پیش‌نویس"), h("td", {}, h("button", { class: "btn ghost sm", onclick: function () { A.go("proto", pid, x.id); } }, "باز کردن")));
      }))) : A.empty("هنوز اجرا نشده."));
      return root;
    }
    var save = A.debounce(function () { S.put(r); delete DRAFTS[r.id]; }, 500);
    root.appendChild(h("div", { class: "row gap wrap" }, h("label", { for: "prTopic", class: "small" }, "موضوع:"), A.topicSelect(r.topic, function (v) { r.topic = v; S.put(r); delete DRAFTS[r.id]; }, "prTopic"),
      h("span", { class: "small muted" }, r.status === "done" ? "کامل‌شده · " + A.fdate(r.updated) : "پیش‌نویس · خودکار ذخیره می‌شود")));
    var ws = A.renderWS(p.ws, r.data, save, { prefix: "pr" });
    var formCard = h("div", { class: "card wsform" }, ws);
    if (pid === "P11") root.appendChild(h("div", { class: "row gap wrap sticky-tools" }, h("button", { class: "btn ghost sm", onclick: function (e) { var on = formCard.classList.toggle("recon"); e.target.textContent = on ? "نمایش دوباره جدول فرود" : "حالت بازسازی (پنهان کردن فرود و پاسخ‌ها)"; if (aiBox2) aiBox2.classList.toggle("reconhide", on); } }, "حالت بازسازی (پنهان کردن فرود و پاسخ‌ها)")));
    root.appendChild(formCard);
    var aiBox2 = null;
    if (pid === "P11") {
      aiBox2 = h("div", { class: "card aibox" + (r.data.__ai ? "" : " hidden") }); if (r.data.__ai) aiBox2.appendChild(A.md(r.data.__ai));
      var bBtn = h("button", { class: "btn ghost", onclick: function () { A.bayanAI(r, aiBox2, bBtn); } }, "دریافت بیان دیگر");
      root.appendChild(h("div", { class: "card" }, h("div", { class: "row gap wrap" }, bBtn, h("button", { class: "btn ghost", onclick: function () { A.plantP11(r); } }, r.data.__planted ? "کاشت دوباره در مزرعه" : "کاشت در مزرعه")), h("p", { class: "small muted" }, "«دریافت بیان دیگر» فقط بعد از تلاش خودت فعال می‌شود و همین موضوع را پله‌به‌پله توضیح می‌دهد (منتقد هوش مصنوعی باید در تنظیمات فعال باشد). بعد «حالت بازسازی» را بزن تا جدول فرود و این توضیح پنهان شوند و خودت از نو بسازی."), aiBox2));
    }
    if (p.rubric) {
      r.rubric = r.rubric || [];
      root.appendChild(h("div", { class: "card" }, h("h3", {}, "خودارزیابی: آیا درست اجرا کردم؟"), h("div", { class: "rubric" }, p.rubric.map(function (c, i) {
        return h("div", { class: "rrow" }, h("div", { class: "rc" }, c), h("div", { class: "seg", role: "radiogroup", "aria-label": c }, [0, 1, 2].map(function (v) {
          return h("button", { type: "button", role: "radio", "aria-checked": r.rubric[i] === v ? "true" : "false", class: "sg" + (r.rubric[i] === v ? " on" : ""), onclick: function (e) { r.rubric[i] = v; e.target.parentNode.querySelectorAll(".sg").forEach(function (b, j) { b.classList.toggle("on", j === v); b.setAttribute("aria-checked", j === v ? "true" : "false"); }); S.put(r); } }, ["۰ نه", "۱ تاحدی", "۲ کامل"][v]);
        })));
      }))));
    }
    if (pid === "P4" || pid === "P2") {
      var span = pid === "P4" ? 7 : 0;
      var deltas = S.all("pr", function (x) { return x.pid === "P1" && x.status === "done" && A.daysBetween(A.localDay(x.created), A.today()) <= span; });
      var box = h("div", { class: "card soft deltas" + (r.data.cmp__open ? "" : " hidden") }, h("h3", {}, pid === "P4" ? "ثبت‌های ۵ خط دلتای این هفته" : "ثبت‌های ۵ خط دلتای امروز"),
        deltas.length ? deltas.map(function (x) { return h("div", { class: "delta" }, h("strong", {}, x.data.src || ""), h("ul", {}, (x.data.d || []).filter(Boolean).map(function (d) { return h("li", {}, d); })), h("div", { class: "small" }, "پرسش: " + (x.data.qq || "") + " · قلاب: " + (x.data.hook || ""))); }) : h("p", { class: "muted small" }, "ثبتی پیدا نشد."));
      root.appendChild(box);
      var iv = setInterval(function () { if (!document.body.contains(box)) { clearInterval(iv); return; } box.classList.toggle("hidden", !r.data.cmp__open); }, 600);
    }
    root.appendChild(h("div", { class: "row gap wrap" },
      h("button", { class: "btn", onclick: function () {
        var miss = ws._validate(); if (miss.length) { A.toast("این بخش‌ها هنوز خالی‌اند: " + miss.slice(0, 3).join("، "), "bad"); return; }
        r.status = "done"; S.put(r); A.onProtoDone(r);
        if (r.sched) { var sc = S.get(r.sched); if (sc) { sc.done = true; S.put(sc); } }
        if (pid === "P3" && (r.data.gaps || []).filter(Boolean).length) A.toast("شکاف‌ها را با «ساخت کارت از شکاف‌ها» وارد مرور کن.");
        A.toast("ثبت شد.");
        A.render();
      } }, r.status === "done" ? "ثبت مجدد" : "ثبت نهایی"),
      pid === "P3" && !r.sched ? h("button", { class: "btn ghost", onclick: function () { A.start137(r.topic, r.data.topic); } }, "زمان‌بندی روز ۱، ۳، ۷") : null,
      (pid === "P3" || pid === "P4") ? h("button", { class: "btn ghost", onclick: function () {
        var gs = (r.data.gaps || []).filter(Boolean); if (!gs.length) { A.toast("شکافی ثبت نشده.", "bad"); return; }
        gs.forEach(function (g) { A.newCard("در «" + (r.data.topic || "مرور هفتگی") + "» این شکاف را از حافظه توضیح بده: " + g, "(پاسخ را پس از مراجعه به منبع، با کلمات خودت اینجا بنویس — ویرایش در بخش مرور)", { topic: r.topic, src: r.id }); });
        A.toast(fa(gs.length) + " کارت ساخته شد.");
      } }, "ساخت کارت از شکاف‌ها") : null,
      pid === "P1" && r.data.q1 ? h("button", { class: "btn ghost", onclick: function () { A.addStructInstance(r.data.q1, r.data.q2 || r.data.src, r.data.dom); } }, "افزودن مصداق به اطلس") : null,
      A.confirmBtn("حذف", function () { delete DRAFTS[r.id]; if (S.get(r.id)) S.del(r.id); A.go("proto", pid); })));
    return root;
  };
  A.protoQueue = function () { return queue(); };
  function queue() {
    var wrap = h("div", {});
    var act = S.all("srcq", function (s) { return s.status === "active"; });
    wrap.appendChild(h("div", { class: "card" }, h("h3", {}, "رژیم داده: سقف منابع فعال"),
      h("p", {}, "هر منبع فعال، بخشی از توجه و حافظه کاری را حتی وقتی سراغش نمی‌روی اشغال می‌کند (کارهای نیمه‌تمام ذهن را درگیر نگه می‌دارند). سقف پیشنهادی: ۲ منبع فعال. بقیه یا در «صف» منتظرند، یا «معدن»اند: فقط برای استخراج یک ساختار مشخص به آن‌ها سر می‌زنی، نه برای تمام کردن."),
      h("div", { class: "pill " + (act.length > 2 ? "bad" : "good") }, fa(act.length) + " منبع فعال")));
    var ti = h("input", { id: "sqT", type: "text", placeholder: "نام دوره/کتاب/مجموعه" });
    var tw = h("input", { id: "sqW", type: "text", placeholder: "چرا؟ کدام مسئله یا ساختار را از آن می‌خواهم؟" });
    var tsel = h("select", { id: "sqS", "aria-label": "وضعیت منبع تازه" }, [["queue", "صف"], ["active", "فعال"], ["quarry", "معدن"], ["done", "تمام/کنار گذاشته"]].map(function (o) { return h("option", { value: o[0] }, o[1]); }));
    wrap.appendChild(h("div", { class: "card" }, h("div", { class: "frow" }, h("label", { for: "sqT" }, "منبع تازه"), ti), h("div", { class: "frow" }, h("label", { for: "sqW" }, "هدف استخراج"), tw),
      h("div", { class: "row gap" }, tsel, h("button", { class: "btn", onclick: function () { if (!ti.value.trim()) return; S.put({ id: A.uid("sq"), type: "srcq", title: ti.value.trim(), why: tw.value.trim(), status: tsel.value }); A.render(); } }, "افزودن"))));
    var labels = { active: "فعال", queue: "صف", quarry: "معدن", done: "تمام/کنار گذاشته" };
    ["active", "queue", "quarry", "done"].forEach(function (st) {
      var items = S.all("srcq", function (s) { return s.status === st; });
      wrap.appendChild(h("div", { class: "card" }, h("h3", {}, labels[st] + " (" + fa(items.length) + ")"),
        items.length ? h("ul", { class: "plain" }, items.map(function (s) {
          return h("li", { class: "qrow" }, h("div", {}, h("strong", {}, s.title), s.why ? h("div", { class: "small muted" }, s.why) : null),
            h("select", { "aria-label": "وضعیت " + s.title, onchange: function (e) { s.status = e.target.value; S.put(s); A.render(); } }, Object.keys(labels).map(function (k) { return h("option", { value: k, selected: s.status === k }, labels[k]); })),
            A.confirmBtn("حذف", function () { S.del(s.id); A.render(); }));
        })) : h("p", { class: "muted small" }, "—")));
    });
    return wrap;
  }

  /* ---------- مرور ---------- */
  A.V.review = function (arg, sub) {
    var root = h("div", { class: "page" });
    root.appendChild(A.head("مرور", "بازیابی، فاصله، درهم‌تنیدن", "اول پاسخ را از حافظه بگو و بگو چند درصد مطمئنی، بعد پشت کارت را ببین. همین یادآوری حافظه را محکم می‌کند و نشان می‌دهد اطمینانت چقدر با واقعیت می‌خواند (کالیبراسیون)."));
    var tab = sub || "due";
    root.appendChild(A.tabs([["due", "مرور امروز"], ["mix", "تمرین درهم‌تنیده"], ["cards", "همه کارت‌ها"], ["calib", "کالیبراسیون"]], tab, function (k) { A.go("review", null, k); }));
    if (tab === "due") root.appendChild(session(interleave(A.dueCards()), "due"));
    else if (tab === "mix") root.appendChild(session(interleave(A.shuffle(S.all("card")).slice(0, 12)), "mix"));
    else if (tab === "cards") root.appendChild(cardList());
    else root.appendChild(calibView());
    return root;
  };
  function interleave(cards) {
    var groups = {}; cards.forEach(function (c) { var k = c.topic || ("t" + (c.tid || 0)); (groups[k] = groups[k] || []).push(c); });
    var keys = Object.keys(groups), out = [];
    while (out.length < cards.length) keys.forEach(function (k) { if (groups[k].length) out.push(groups[k].shift()); });
    return out;
  }
  function session(cards, mode) {
    var wrap = h("div", { class: "review" });
    if (!cards.length) { wrap.appendChild(A.empty(mode === "due" ? "کارتی موعد امروز نیست. کارت‌ها از کارگاه تکنیک‌ها و شکاف‌های برگه سفید ساخته می‌شوند." : "هنوز کارتی نساخته‌ای.", h("button", { class: "btn", onclick: function () { A.cardDialog("", "", {}, function () { A.render(); }); } }, "ساخت کارت"))); return wrap; }
    var i = 0, area = h("div", {});
    wrap.appendChild(h("p", { class: "small muted" }, mode === "mix" ? "کارت‌ها از موضوع‌ها و تکنیک‌های مختلف یک‌درمیان چیده شده‌اند تا مجبور شوی اول تشخیص دهی «این از کدام نوع است» (ارزش اصلی درهم‌تنیدن). نمره‌ها زمان‌بندی را هم به‌روز می‌کنند." : "کارت‌ها از موضوع‌های مختلف یک‌درمیان چیده شده‌اند."));
    wrap.appendChild(area);
    show();
    return wrap;
    function show() {
      area.innerHTML = "";
      if (i >= cards.length) { area.appendChild(h("div", { class: "card done" }, h("h3", {}, "تمام شد"), h("p", {}, fa(cards.length) + " کارت مرور شد."), h("button", { class: "btn", onclick: function () { A.go("review", null, "calib"); } }, "دیدن کالیبراسیون"))); return; }
      var c = cards[i], tp = c.topic && S.get(c.topic);
      var conf = 60, preConf = null;  // اطمینانِ پیش از دیدنِ پاسخ؛ پس از «نمایش پاسخ» قفل می‌شود (کالیبراسیونِ صادق)
      var att = h("textarea", { id: "rvAtt", rows: 3, placeholder: "پاسخت را از حافظه بنویس (حتی ناقص)." });
      var co = h("output", {}, fa(conf) + "٪");
      var slider = h("input", { id: "rvConf", type: "range", min: 0, max: 100, step: 10, value: conf, oninput: function (e) { if (preConf != null) { e.target.value = preConf; return; } conf = +e.target.value; co.textContent = fa(conf) + "٪"; } });
      var back = h("div", { class: "back hidden" });
      var grades = h("div", { class: "grades hidden" }, [[0, "اصلاً یادم نبود"], [1, "اشتباه"], [2, "اشتباه اما آشنا"], [3, "درست، با زحمت زیاد"], [4, "درست، با کمی تردید"], [5, "آسان و کامل"]].map(function (g) {
        return h("button", { class: "btn g" + g[0], onclick: function () { A.srsGrade(c, g[0], preConf == null ? conf : preConf); c.lastAtt = att.value; S.put(c); i++; show(); } }, fa(g[0]) + " · " + g[1]);
      }));
      area.appendChild(h("div", { class: "card flash" },
        h("div", { class: "row between wrap small muted" }, h("span", {}, "کارت " + fa(i + 1) + " از " + fa(cards.length)), h("span", {}, (c.tid ? "تکنیک " + fa(c.tid) + " · " : "") + (tp ? tp.title : ""))),
        h("div", { class: "q" }, c.q),
        h("label", { for: "rvAtt", class: "small" }, "پاسخ تو"), att,
        h("div", { class: "scale" }, h("label", { for: "rvConf", class: "small" }, "اطمینان"), slider, co),
        h("button", { class: "btn", onclick: function (e) { preConf = conf; slider.disabled = true; slider.setAttribute("aria-disabled", "true"); co.textContent = fa(preConf) + "٪ (پیش از دیدنِ پاسخ ثبت شد)"; back.classList.remove("hidden"); grades.classList.remove("hidden"); e.target.remove(); } }, "نمایش پاسخ"),
        back, grades));
      back.appendChild(h("div", { class: "small muted" }, "پاسخ:")); back.appendChild(h("div", { class: "a" }, c.a));
    }
  }
  function cardList() {
    var cards = S.all("card");
    var wrap = h("div", {});
    wrap.appendChild(h("div", { class: "row gap" }, h("button", { class: "btn", onclick: function () { A.cardDialog("", "", {}, function () { A.render(); }); } }, "کارت تازه"), h("span", { class: "small muted" }, fa(cards.length) + " کارت")));
    if (!cards.length) return wrap;
    wrap.appendChild(h("div", { class: "scrollx" }, h("table", { class: "dt mt" }, h("thead", {}, h("tr", {}, h("th", {}, "پرسش"), h("th", {}, "پاسخ"), h("th", {}, "موعد"), h("th", {}, "فاصله"), h("th", {}, ""))),
      h("tbody", {}, cards.map(function (c) {
        var q = h("textarea", { rows: 2, "aria-label": "پرسش", onchange: function (e) { c.q = e.target.value; S.put(c); } }); q.value = c.q;
        var a = h("textarea", { rows: 2, "aria-label": "پاسخ", onchange: function (e) { c.a = e.target.value; S.put(c); } }); a.value = c.a;
        return h("tr", {}, h("td", {}, q), h("td", {}, a), h("td", {}, A.fdate(c.due)), h("td", {}, fa(c.iv || 0) + " روز"), h("td", {}, A.confirmBtn("حذف", function () { S.del(c.id); A.render(); })));
      })))));
    return wrap;
  }
  function calibView() {
    var pts = A.calibPoints();
    var wrap = h("div", {});
    wrap.appendChild(h("div", { class: "card" }, h("h3", {}, "کالیبراسیون اعتماد"),
      h("p", { class: "small" }, "داده از دو منبع جمع می‌شود: درصد اطمینانی که پیش از دیدن پاسخ هر کارت اعلام می‌کنی، و جدول پیش‌بینی‌های تکنیک ۲۴. هدف «اطمینان بالا» نیست؛ هدف این است که وقتی می‌گویی ۷۰٪، تقریباً ۷۰٪ مواقع درست باشی."),
      pts.length ? A.calibChart(pts, 0) : h("p", { class: "muted" }, "هنوز داده کافی نیست. چند کارت را با اعلام اطمینان مرور کن.")));
    var rt = A.recallTrend();
    wrap.appendChild(h("div", { class: "card" }, h("h3", {}, "روند درصد بازیابی برگه سفید"), A.spark(rt.map(function (x) { return x.v; }))));
    return wrap;
  }

  /* ---------- دغدغه‌ها ---------- */
  A.V.concerns = function (focus) {
    var root = h("div", { class: "page" });
    root.appendChild(A.head("دغدغه‌ها", "دغدغه‌های تو و راه حلشان", "هر دغدغه با کلمات خودت از سشن‌ها آمده. کنار هرکدام: ریشه‌اش، پشتوانه علمی، قدم‌به‌قدم راه حل (کدام تکنیک‌ها و پروتکل‌ها)، اولین اقدام، و اینکه از کجا بفهمی حل شده."));
    C.LAYERS.forEach(function (L) {
      var cs = C.CONCERNS.filter(function (c) { return c.L === L.id; });
      root.appendChild(h("section", { class: "layer" }, h("div", { class: "lh" }, h("span", { class: "phn" }, fa(L.pri)), h("div", {}, h("h2", {}, L.fa), h("p", { class: "small" }, L.text), h("p", { class: "small muted" }, "منطق تقدم: " + L.logic))),
        cs.map(function (c) {
          var st = S.get("concern_" + c.id) || { id: "concern_" + c.id, type: "concern", status: "open", note: "" };
          var note = h("textarea", { rows: 2, id: "cn_" + c.id, placeholder: "شواهد پیشرفت (عدد، تاریخ، مشاهده)", onchange: function (e) { st.note = e.target.value; S.put(st); } }); note.value = st.note || "";
          return h("div", { class: "card concern" + (focus === c.id ? " focus" : ""), id: "cc_" + c.id },
            h("div", { class: "row between wrap" }, h("div", { class: "eyebrow" }, "دغدغه " + fa(c.id.slice(1)) + (c.s === 5.5 ? " · گفت‌وگوی درخت علم (۶/۴/۲۰۲۶)" : c.s < 5 ? " · سشن " + fa(c.s) : " · سامانه")),
              h("select", { "aria-label": "وضعیت", onchange: function (e) { st.status = e.target.value; S.put(st); } }, [["open", "باز"], ["work", "در حال کار"], ["done", "حل‌شده"]].map(function (o) { return h("option", { value: o[0], selected: st.status === o[0] }, o[1]); }))),
            h("blockquote", {}, c.text),
            h("div", { class: "kv" }, h("span", {}, "اعتبارسنجی"), h("span", {}, c.verdict)),
            h("div", { class: "kv" }, h("span", {}, "ریشه"), h("span", {}, c.R.map(function (r) { var x = C.ROOTS.filter(function (y) { return y.id === r; })[0]; return x.fa; }).join(" · "))),
            h("p", {}, c.diag),
            h("div", { class: "small muted" }, "مسیر حل به ترتیب:"), h("div", { class: "row gap wrap path" }, c.path.map(function (r, i) { return [i ? h("span", { class: "arr", "aria-hidden": "true" }, "←") : null, A.refChip(r)]; })),
            h("div", { class: "kv mt" }, h("span", {}, "اولین اقدام"), h("span", {}, c.first)),
            h("div", { class: "kv" }, h("span", {}, "معیار حل شدن"), h("span", {}, c.metric)),
            h("label", { for: "cn_" + c.id, class: "small" }, "یادداشت شواهد"), note);
        })));
    });
    if (focus) setTimeout(function () { var el = document.getElementById("cc_" + focus); if (el) el.scrollIntoView({ block: "center" }); }, 50);
    return root;
  };

  /* ---------- اطلس ---------- */
  A.addStructInstance = function (structName, text, dom) {
    var all = S.all("struct"); var found = all.filter(function (s) { return s.fa === structName; })[0];
    if (!found) found = S.put({ id: A.uid("st"), type: "struct", fa: structName, en: "", ess: "", inst: {}, extra: [], q: "" });
    found.extra = found.extra || []; found.extra.push({ t: text, dom: dom || "", d: A.today() }); S.put(found);
    A.toast("مصداق به «" + structName + "» در اطلس اضافه شد.");
  };
  A.V.atlas = function (arg, sub) {
    var root = h("div", { class: "page" });
    root.appendChild(A.head("اطلس", "الگوهای مشترک علوم و زندگی", "ایده اصلی: واحد یادگیری «ساختار» (الگوی تکرارشونده) است، نه دوره و نه علم. اینجا ساختارهای مادر با نمونه‌هایشان در زندگی تو، معرفی هر علم، و پل میان حوزه‌هایی که در آن‌ها زندگی و کار می‌کنی جمع شده‌اند."));
    var tab = sub || "struct";
    root.appendChild(A.tabs([["struct", "ساختارهای مادر"], ["sci", "علوم و شناسنامه‌ها"], ["dom", "حوزه‌های زیسته"]], tab, function (k) { A.go("atlas", null, k); }));
    if (tab === "struct") {
      var ni = h("input", { id: "nsT", type: "text", "aria-label": "نام ساختار تازه", placeholder: "نام ساختار تازه (مثلاً «گلوگاه»، «اثر شبکه‌ای»)" });
      root.appendChild(h("div", { class: "row gap" }, ni, h("button", { class: "btn", onclick: function () { if (!ni.value.trim()) return; S.put({ id: A.uid("st"), type: "struct", fa: ni.value.trim(), en: "", ess: "", inst: {}, extra: [], q: "" }); A.render(); } }, "افزودن ساختار")));
      root.appendChild(h("p", { class: "small muted" }, C.FOUNDATIONS_NOTE + " ساختارهای فونداسیون با برچسب مشخص شده‌اند."));
      var dn = { trading: "ترید", banking: "بانک", game: "بازی", cinema: "سینما", nature: "طبیعت/علم" };
      root.appendChild(h("div", { class: "slist" }, S.all("struct").sort(function (a, b) { return (a.ord || 99) - (b.ord || 99); }).map(function (s) {
        var ess = h("textarea", { rows: 2, "aria-label": "جوهره", onchange: function (e) { s.ess = e.target.value; S.put(s); } }); ess.value = s.ess || "";
        var q = h("input", { type: "text", "aria-label": "پرسش باز", value: s.q || "", placeholder: "پرسش باز", onchange: function (e) { s.q = e.target.value; S.put(s); } });
        var add = h("input", { type: "text", "aria-label": "مصداق تازه", placeholder: "مصداق تازه از زندگی یا یک دوره" });
        var count = Object.keys(s.inst || {}).filter(function (k) { return s.inst[k]; }).length + (s.extra || []).length;
        return h("div", { class: "card struct" }, h("div", { class: "row between wrap" }, h("h3", {}, s.fa + (s.en ? " · " + s.en : ""), s.found || (C.STRUCTURES.filter(function (x) { return "st_" + x.id === s.id && x.found; }).length) ? h("span", { class: "chip" }, " فونداسیون") : null), h("span", { class: "pill " + (count >= 3 ? "good" : "warn") }, fa(count) + " مصداق")),
          h("label", { class: "small" }, "جوهره"), ess,
          h("div", { class: "inst" }, Object.keys(dn).filter(function (k) { return s.inst && s.inst[k]; }).map(function (k) { return h("div", { class: "kv" }, h("span", {}, dn[k]), h("span", {}, s.inst[k])); }),
            (s.extra || []).map(function (x) { return h("div", { class: "kv" }, h("span", {}, x.dom || "مصداق تو"), h("span", {}, x.t)); })),
          h("div", { class: "row gap" }, add, h("button", { class: "btn sm", onclick: function () { if (!add.value.trim()) return; (s.extra = s.extra || []).push({ t: add.value.trim(), d: A.today() }); S.put(s); A.render(); } }, "افزودن")),
          h("label", { class: "small" }, "پرسش باز"), q);
      })));
    } else if (tab === "sci") {
      root.appendChild(h("div", { class: "card" }, h("h3", {}, "زنجیره علوم"), h("div", { class: "chainline" }, C.SCIENCE_CHAIN.map(function (x, i) { return [i ? h("span", { class: "arr" }, "←") : null, h("span", { class: "chip" }, x)]; })),
        h("p", { class: "small muted" }, C.SCIENCE_CHAIN_NOTE)));
      var ps = S.all("pr", function (r) { return r.pid === "P6"; });
      root.appendChild(h("button", { class: "btn", onclick: function () { A.startProto("P6"); } }, "شناسنامه علم تازه"));
      root.appendChild(h("div", { class: "tgrid mt" }, ps.map(function (r) {
        return h("button", { class: "tcard", onclick: function () { A.go("proto", "P6", r.id); } }, h("div", { class: "tfa" }, r.data.sci || "بی‌نام"), h("div", { class: "small" }, (r.data.s1 || "").slice(0, 120)), h("div", { class: "small muted" }, "جای من: " + (r.data.s10 || "—").slice(0, 80)));
      })));
    } else {
      root.appendChild(h("div", { class: "scrollx" }, h("table", { class: "dt" }, h("thead", {}, h("tr", {}, h("th", {}, "حوزه زیسته"), h("th", {}, "دارایی‌های بالفعل"), h("th", {}, "پل به ساختارهای مادر و علوم"))),
        h("tbody", {}, C.DOMAINS.map(function (d) { return h("tr", {}, h("td", {}, h("strong", {}, d.fa)), h("td", {}, d.have), h("td", {}, d.bridge)); })))));
      root.appendChild(h("p", { class: "small muted" }, "«نیاز، عمیق‌ترین معلم است»: آمار را سر پول واقعی معاملات آموختی، نه در کلاس. هر ساختار تازه را دست‌کم به یکی از این چهار حوزه قلاب کن."));
    }
    return root;
  };

  /* ---------- مبانی ---------- */
  A.V.base = function (arg, sub) {
    var root = h("div", { class: "page" });
    root.appendChild(A.head("مبانی", "ستون‌ها، ریشه‌ها و اصلاحیه‌ها", "پشتوانه علمی این سامانه، پنج ریشه اصلی دغدغه‌ها، و فهرست کامل خطاها و ناسازگاری‌هایی که در اسناد و کد قبلی پیدا و اصلاح شد. برای کار روزانه لازم نیست؛ مرجع است."));
    var tab = sub || "pil";
    root.appendChild(A.tabs([["pil", "ستون‌های علمی"], ["roots", "ریشه‌ها و لایه‌ها"], ["tr", "ماتریس گذار و سه اقدام"], ["err", "اصلاحیه‌ها (" + fa(C.ERRATA.length) + ")"], ["map", "نگاشت فهرست پاورپوینت"]], tab, function (k) { A.go("base", null, k); }));
    if (tab === "err") {
      ["ساختار", "کد قبلی", "علمی"].forEach(function (cat) {
        root.appendChild(h("h2", { class: "mt" }, cat === "علمی" ? "خطاها و اغراق‌های علمی" : cat === "ساختار" ? "ناسازگاری‌های ساختاری اسناد" : "کد قبلی (code_artifact 20)"));
        C.ERRATA.filter(function (e) { return e.cat === cat; }).forEach(function (e) {
          root.appendChild(h("div", { class: "card err" }, h("div", { class: "eyebrow" }, e.where), h("div", { class: "said" }, h("span", { class: "chip bad" }, "در سند"), " ", e.said), h("div", { class: "fixd" }, h("span", { class: "chip good" }, "اصلاح"), " ", e.fix)));
        });
      });
      root.appendChild(h("p", { class: "small muted" }, "علاوه بر این‌ها، اصلاحیه‌های ویژه هر تکنیک در بخش «فهم» همان تکنیک آمده است."));
      var withFix = A.T.filter(function (t) { return t.fix; });
      root.appendChild(h("div", { class: "row gap wrap" }, withFix.map(function (t) { return A.techLink(t.id); })));
    } else if (tab === "pil") {
      root.appendChild(h("div", { class: "plist" }, C.PILLARS.map(function (p) {
        return h("div", { class: "card" }, h("div", { class: "eyebrow" }, p.who + " · " + p.yr), h("h3", {}, p.th), h("p", {}, p.claim), h("p", { class: "small" }, h("strong", {}, "در عمل: "), p.practice), h("div", { class: "row gap wrap" }, p.ids.map(function (id) { return A.techLink(id); })));
      })));
    } else if (tab === "tr") {
      root.appendChild(h("p", {}, "از پاورپوینت (اسلاید ۱۴ و ۱۵) و فرجام سند Word: گذار از «مصرف‌کننده منفعل دوره‌ها» به «معمار متفکر چندرشته‌ای». خودسنجی ماهانه هر بُعد در «ممیزی ماهانه» انجام می‌شود."));
      root.appendChild(h("div", { class: "scrollx" }, h("table", { class: "dt" }, h("thead", {}, h("tr", {}, h("th", {}, "بُعد"), h("th", {}, "مصرف‌کننده منفعل (سنتی)"), h("th", {}, "معمار ذهن و متفکر چندرشته‌ای (نوین)"))),
        h("tbody", {}, C.TRANSITION.map(function (t) { return h("tr", {}, h("td", {}, h("strong", {}, t[0])), h("td", {}, t[1]), h("td", {}, t[2])); })))));
      root.appendChild(h("h2", { class: "mt" }, "سه اقدام «از همین فردا» (اسلاید ۱۵)"));
      root.appendChild(h("div", { class: "plist" }, C.QUICKSTART.map(function (q) { return h("div", { class: "card" }, h("h3", {}, q[0]), h("p", {}, q[1]), h("div", { class: "row gap wrap" }, A.refChip(q[2]), h("span", { class: "small muted" }, q[3]))); })));
      root.appendChild(h("h2", { class: "mt" }, "بهای اجتناب‌ناپذیر سیستم (سشن ۱)"));
      root.appendChild(h("ul", {}, C.COSTS.map(function (c) { return h("li", {}, c); })));
    } else if (tab === "roots") {
      root.appendChild(h("h2", {}, "پنج ریشه علّی"));
      C.ROOTS.forEach(function (r) { root.appendChild(h("div", { class: "card" }, h("div", { class: "eyebrow" }, r.who), h("h3", {}, r.fa), h("p", {}, r.text), r.fixNote ? h("p", { class: "small fixline" }, "اصلاح: " + r.fixNote) : null)); });
      root.appendChild(h("h2", { class: "mt" }, "پنج لایه دغدغه به ترتیب تقدم"));
      C.LAYERS.forEach(function (L) { root.appendChild(h("div", { class: "card" }, h("div", { class: "eyebrow" }, "اولویت " + fa(L.pri) + " · " + L.en), h("h3", {}, L.fa), h("p", {}, L.text), h("p", { class: "small muted" }, L.logic))); });
    } else {
      root.appendChild(h("p", {}, "پاورپوینت شما فهرست ۴۵‌تایی دیگری داشت. هیچ موردی دور ریخته نشد؛ هر کدام به تکنیک مرجع یا پروتکل متناظر وصل است:"));
      root.appendChild(h("div", { class: "scrollx" }, h("table", { class: "dt" }, h("thead", {}, h("tr", {}, h("th", {}, "# پاورپوینت"), h("th", {}, "نام در پاورپوینت"), h("th", {}, "در این سامانه"))),
        h("tbody", {}, C.PPTX_MAP.map(function (m) {
          return h("tr", {}, h("td", {}, fa(m[0])), h("td", {}, m[1]), h("td", {}, h("div", { class: "row gap wrap" }, m[2].split(" · ").map(function (x) { var k = x.split(" ")[0]; var rest = x.slice(k.length); return h("span", {}, /^t\d+$/.test(k) || /^P\d+$/.test(k) ? A.refChip(k) : k, rest ? h("span", { class: "small muted" }, rest) : null); }))));
        })))));
    }
    return root;
  };

  /* ---------- تنظیمات ---------- */
  /* «نمونه‌های آمادهٔ سازنده» (مالک، ۲۰۲۶-۱۰-۱۳: «تو که نباید مسئله طرح کنی؛ قرار شد مسئله‌ها را من بدهم»):
     ۶ شبیه‌سازِ نمایشیِ گره، ۶ سازندهٔ برنامه‌وارِ نمونه و ۱۳ مسئلهٔ بزرگِ آماده را سازنده نوشته، نه مالک. پیش‌فرض پنهان‌اند و فقط
     با همین گزینه در تنظیمات دیده می‌شوند (قرنطینه، نه حذف — همان الگوی «مثال‌های ساختهٔ سامانه»، WORKLOG (2)).
     داده‌ها و بک‌تستِ کارخانه دست نمی‌خورند (بک‌تست مستقیم از EPI_PROBLEMS می‌خواند). */
  A.showSamples = function () { try { return S.settings().samples === true; } catch (e) { return false; } };
  A.samplesNote = function (what) {
    return h("p", { class: "small muted samples-note", dir: "rtl" }, what + " پنهان است، چون سازنده آن را نوشته و مسئلهٔ تو نیست. اگر خواستی ببینی: ",
      h("button", { class: "linkish", type: "button", onclick: function () { A.go("settings"); } }, "تنظیمات › نمونه‌های آمادهٔ سازنده"), ".");
  };
  A.V.settings = function () {
    var root = h("div", { class: "page" });
    root.appendChild(A.head("تنظیمات", "هوش مصنوعی و داده‌ها", "کلید هوش مصنوعی (اختیاری) و پشتیبان‌گیری از داده‌ها؛ برای هر دو سامانه."));
    var st = S.settings(); st.ai = st.ai || {};
    if (S.mode === "host") {
      root.appendChild(h("div", { class: "card" }, h("h3", {}, "هوش مصنوعی"), h("p", { class: "small" }, "در Lifemanager، منتقد هوش مصنوعی از همان سرویس هوش مصنوعیِ خود Lifemanager استفاده می‌کند (تنظیمات مدل‌ها در Lifemanager). کلیدی اینجا ذخیره نمی‌شود.")));
    } else if (S.mode === "gas") {
      var gp = h("select", { id: "gP" }, h("option", { value: "gemini" }, "Google Gemini"), h("option", { value: "anthropic" }, "Anthropic Claude"));
      var gm = h("input", { id: "gM", type: "text", placeholder: "نام مدل (مثلاً gemini-2.5-flash)" });
      var gk = h("input", { id: "gK", type: "password", placeholder: "کلید API (در Script Properties ذخیره می‌شود، نه در مرورگر)" });
      var info = h("p", { class: "small muted" }, "در حال خواندن تنظیمات…");
      google.script.run.withSuccessHandler(function (r) { try { r = JSON.parse(r); gp.value = r.provider; gm.value = r.model; info.textContent = r.hasKey ? "کلید ذخیره شده است." : "کلیدی ذخیره نشده."; } catch (e) { } }).api_getAI();
      root.appendChild(h("div", { class: "card" }, h("h3", {}, "منتقد هوش مصنوعی (سمت سرور)"), info, h("div", { class: "frow" }, h("label", { for: "gP" }, "سرویس"), gp), h("div", { class: "frow" }, h("label", { for: "gM" }, "مدل"), gm), h("div", { class: "frow" }, h("label", { for: "gK" }, "کلید"), gk),
        h("button", { class: "btn", onclick: function () { google.script.run.withSuccessHandler(function () { A.toast("ذخیره شد."); A.render(); }).api_setAI(gp.value, gm.value, gk.value); } }, "ذخیره")));
      root.appendChild(h("div", { class: "card" }, h("h3", {}, "یادآور روزانه ایمیلی"), h("p", { class: "small" }, "هر روز ساعت ۷ صبح فهرست کارهای موعددار (کارت‌ها، برگه‌های سفید ۱-۳-۷، قرائت روز) به ایمیل حساب گوگلت فرستاده می‌شود."),
        h("div", { class: "row gap" }, h("button", { class: "btn", onclick: function () { google.script.run.withSuccessHandler(function (m) { A.toast(m); }).withFailureHandler(function (e) { A.toast(e.message, "bad"); }).installDailyReminder(7); } }, "فعال‌سازی"),
          h("button", { class: "btn ghost", onclick: function () { google.script.run.withSuccessHandler(function (m) { A.toast(m); }).removeDailyReminder(); } }, "غیرفعال‌سازی"),
          h("button", { class: "btn ghost", onclick: function () { google.script.run.withSuccessHandler(function (m) { A.toast(m); }).withFailureHandler(function (e) { A.toast(e.message, "bad"); }).sendReminderNow(); } }, "ارسال آزمایشی"))));
      root.appendChild(h("div", { class: "card" }, h("h3", {}, "پایگاه داده"), h("p", { class: "small" }, "همه رکوردها در یک Google Sheet به نام «LearningArchitecture_DB» در Drive تو ذخیره می‌شوند."),
        h("button", { class: "btn ghost", onclick: function () { google.script.run.withSuccessHandler(function (u) { A.copy(u); A.toast("نشانی Sheet کپی شد: " + u); }).api_dbUrl(); } }, "کپی نشانی Sheet")));
    } else {
      var lp = h("select", { id: "lP", onchange: function () { lm.value = lp.value === "anthropic" ? "claude-sonnet-5-5" : "gemini-2.5-flash"; } }, h("option", { value: "gemini", selected: st.ai.provider !== "anthropic" }, "Google Gemini"), h("option", { value: "anthropic", selected: st.ai.provider === "anthropic" }, "Anthropic Claude"));
      var lm = h("input", { id: "lM", type: "text", value: st.ai.model || "gemini-2.5-flash" });
      var lk = h("input", { id: "lK", type: "password", value: st.ai.key || "", placeholder: "کلید API" });
      root.appendChild(h("div", { class: "card" }, h("h3", {}, "منتقد هوش مصنوعی"),
        h("p", { class: "small" }, "اختیاری است؛ همه کارگاه‌ها بدون آن هم کار می‌کنند. کلید فقط در همین مرورگر ذخیره می‌شود. نسخه Artifact نمی‌تواند به سرویس بیرونی وصل شود؛ برای منتقد، نسخه گوگل اپس‌اسکریپت یا فایل HTML مستقل را به کار ببر."),
        h("div", { class: "frow" }, h("label", { for: "lP" }, "سرویس"), lp), h("div", { class: "frow" }, h("label", { for: "lM" }, "مدل"), lm), h("div", { class: "frow" }, h("label", { for: "lK" }, "کلید"), lk),
        h("button", { class: "btn", onclick: function () { st.ai = { provider: lp.value, model: lm.value.trim(), key: lk.value.trim() }; S.saveSettings(st); A.toast("ذخیره شد."); } }, "ذخیره")));
    }
    root.appendChild(h("div", { class: "card" }, h("h3", {}, "مثال‌های کارشده ساخته سامانه"), h("p", { class: "small" }, "مثال‌های بخشِ «اجرا» (علم، بازی، سینما، …) را سامانه نوشته است و در منابع شما نیست. متن «کاربرد عملی» PDF همیشه نمایش داده می‌شود. مثال‌های بازارِ مالی و بانک به‌طورِ پیش‌فرض پنهان‌اند."),
      h("label", { class: "chk", for: "hideGen" }, h("input", { type: "checkbox", id: "hideGen", checked: !!st.hideGen, onchange: function (e) { st.hideGen = e.target.checked; S.saveSettings(st); } }), "پنهان کردن مثال‌های ساخته سامانه"),
      h("label", { class: "chk", for: "showMarketEx" }, h("input", { type: "checkbox", id: "showMarketEx", checked: !!st.showMarketEx, onchange: function (e) { st.showMarketEx = e.target.checked; S.saveSettings(st); } }), "مثال‌های بازارِ مالی و بانک را هم نشان بده")));
    root.appendChild(h("div", { class: "card samples-card", dir: "rtl" }, h("h3", {}, "نمونه‌های آمادهٔ سازنده (نه مسئله‌های تو)"),
      h("p", { class: "small" }, "مسئله‌ها را تو می‌دهی؛ گره‌گشا و «مسئله‌های بزرگ» از مسئله‌های خودت کار می‌کنند. این‌ها را سازنده از پیش نوشته و به‌طورِ پیش‌فرض پنهان‌اند:"),
      h("ul", { class: "small" }, h("li", {}, "۶ شبیه‌سازِ نمایشیِ گره (کوزه‌های آب، ۲-۴-۶، نفرینِ دانش، حافظهٔ کاری، وضعیتِ پایانی، نردبان)"),
        h("li", {}, "۶ سازندهٔ برنامه‌وارِ نمونه در ورزشِ گره (کوزهٔ آب، قاعدهٔ پنهان، کارت‌های واسون، نرخِ پایه، زنجیرهٔ حافظه، قیدِ پنهان)"),
        h("li", {}, "۱۳ مسئلهٔ بزرگِ آماده (و حرکت‌ها و تمرین‌هایی که از آن‌ها ساخته می‌شود)")),
      h("p", { class: "small muted" }, "پنهان‌بودن چیزی را پاک نمی‌کند: نمونه‌هایی که قبلاً ساخته‌ای و پیشرفتت می‌مانند، و پرونده‌های بک‌تستِ کارخانه همیشه سر جایشان‌اند."),
      h("label", { class: "chk", for: "showSamples" }, h("input", { type: "checkbox", id: "showSamples", checked: st.samples === true, onchange: function (e) { st.samples = e.target.checked; S.saveSettings(st); A.toast(e.target.checked ? "نمونه‌های آماده نشان داده می‌شوند." : "نمونه‌های آماده پنهان شدند."); } }), "نمونه‌های آمادهٔ سازنده را هم نشان بده")));
    var jg = h("textarea", { id: "jg", rows: 3, "aria-label": "واژه‌های تخصصی (با ویرگول جدا کن)" }); jg.value = (st.jargon || []).join("، ");
    root.appendChild(h("div", { class: "card" }, h("h3", {}, "فهرست اصطلاحات شخصی برای تحلیلگر فاینمن"), h("p", { class: "small muted" }, "واژه‌هایی که در حوزه خودت اصطلاح فنی محسوب می‌شوند (با «،» جدا کن). فهرست پایه: " + C.JARGON_SEED.slice(0, 18).join("، ") + "…"),
      jg, h("button", { class: "btn", onclick: function () { st.jargon = jg.value.split(/[،,\n]/).map(function (x) { return x.trim(); }).filter(Boolean); S.saveSettings(st); A.toast("ذخیره شد."); } }, "ذخیره")));
    var ex = h("textarea", { id: "exJ", rows: 5, readonly: true, class: "mono" });
    var im = h("textarea", { id: "imJ", rows: 5, class: "mono", placeholder: "JSON پشتیبان را اینجا بچسبان" });
    root.appendChild(h("div", { class: "card" }, h("h3", {}, "پشتیبان‌گیری و انتقال"),
      h("p", { class: "small" }, "برای انتقال داده میان نسخه مرورگر و نسخه گوگل اپس‌اسکریپت: خروجی را کپی کن و در نسخه دیگر وارد کن."),
      h("div", { class: "row gap" }, h("button", { class: "btn ghost", onclick: function () { ex.value = JSON.stringify(S.all(), null, 0); } }, "تولید خروجی"), h("button", { class: "btn ghost", onclick: function () { if (!ex.value) ex.value = JSON.stringify(S.all()); A.copy(ex.value); } }, "کپی")),
      h("label", { for: "exJ", class: "small" }, "خروجی"), ex,
      h("label", { for: "imJ", class: "small" }, "ورود"), im,
      h("div", { class: "row gap" }, h("button", { class: "btn", onclick: function () {
        try { var arr = JSON.parse(im.value); if (!Array.isArray(arr)) throw new Error("قالب نادرست"); arr.forEach(function (r) { if (r && r.id && r.type) S.put(r, { keepTime: true }); }); /* زمانِ «updated» ِ پشتیبان حفظ می‌شود */ A.toast(fa(arr.length) + " رکورد وارد شد."); A.render(); }
        catch (e) { A.toast("JSON نامعتبر: " + e.message, "bad"); }
      } }, "ورود داده"), A.confirmBtn("حذف نمونه‌ها", function () { S.all(null, function (r) { return r.sample; }).forEach(function (r) { S.del(r.id); }); A.toast("نمونه‌ها حذف شدند."); A.render(); }))));
    root.appendChild(h("p", { class: "small muted" }, "حالت ذخیره: " + (S.mode === "host" ? "پایگاه داده Lifemanager" : S.mode === "gas" ? "Google Sheets" : "همین مرورگر") + " · " + fa(Object.keys(S.recs).length) + " رکورد"));
    return root;
  };

  /* ---------- داده‌های اولیه و نمونه ---------- */
  function seed() {
    var st = S.settings();
    if (!st.farmSeeded) { if (!S.all("tree").length) C.FARM_SEED.forEach(function (n, i) { S.put({ id: "tr_seed" + i, type: "tree", name: n, kind: "original", parents: [], ord: i + 1, note: "" }); }); st.farmSeeded = true; S.saveSettings(st); }
    if (st.seeded) return;
    C.STRUCTURES.forEach(function (s, i) { S.put({ id: "st_" + s.id, type: "struct", fa: s.fa, en: s.en, ess: s.ess, inst: s.inst, extra: [], q: s.q, ord: i + 1 }); });
    var tp = S.put({ id: "tp_sample", type: "topic", title: "نمونه: چرا حد ضرر متحرک ثابت در طلا زود فعال می‌شود؟", dom: "تریدینگ و اکسپرت", src: "تجربه معاملات + مقاله ATR", sample: true });
    var t28 = A.TM[28];
    if (t28) {
      var d = {};
      t28.ws.forEach(function (f) {
        if (f.t === "text") d[f.k] = "چرا تریلینگ استاپ ثابت ۲۰ پیپی در طلا زود بسته می‌شود؟";
        else if (f.t === "area" && !d.__a) { d[f.k] = "قیمت در هر بازه زمانی یک دامنه رفت‌وبرگشت عادی دارد که میانگین دامنه واقعی (ATR) آن را اندازه می‌گیرد. اگر فاصله استاپ از این دامنه عادی کمتر باشد، یک عقب‌نشینی معمولی هم به استاپ می‌رسد، بنابراین معامله پیش از ادامه روند بسته می‌شود. در نتیجه فاصله باید مضربی از ATR باشد تا فقط حرکتی بیش از نوسان عادی استاپ را فعال کند."; d.__a = 1; }
      });
      delete d.__a;
      S.put({ id: "ex_sample28", type: "ex", tid: 28, topic: tp.id, status: "draft", data: d, rubric: [], sample: true });
    }
    A.newCard("چرا فاصله تریلینگ استاپ باید بر پایه ATR باشد نه عدد ثابت؟ (نمونه)", "چون ATR دامنه نوسان عادی را می‌سنجد؛ استاپِ کوچک‌تر از نوسان عادی با عقب‌نشینی معمولی فعال می‌شود. با تغییر نوسان، فاصله ثابت گاهی تنگ و گاهی گشاد می‌شود.", { topic: tp.id, tid: 28, sample: true });
    A.newCard("چرا بازخوانی جزوه حس فهمیدن می‌دهد ولی در آزمون کم می‌آورد؟ (نمونه)", "روانی و آشنایی بصری (بازشناسی) با توان بازیابی اشتباه گرفته می‌شود؛ بازخوانی اصطکاک ندارد و ردّ حافظه را برای بیرون کشیدن تقویت نمی‌کند (Bjork؛ Roediger & Karpicke 2006).", { tid: 41, sample: true });
    st.seeded = true; S.saveSettings(st);
  }

  A.boot = function () {
    A.shell();
    S.init(function () {
      seed();
      var hv = (location.hash || "").replace("#", "");
      if (A.HOST && A.HOST.initial) { var q = A.HOST.initial(); if (q && q.tab && A.V[q.tab]) { A.state = { view: q.tab, arg: q.a === "" || q.a == null ? null : (/^\d+$/.test(q.a) ? +q.a : q.a), sub: q.s || null }; A.render(); return; } hv = ""; }
      if (hv && A.V[hv] && ["tech", "topic", "proto", "e_case"].indexOf(hv) < 0) A.state.view = hv;
      /* اولین ورود پس از لایهٔ راه‌یابی (۲۰۲۶-۱۰-۱۳): «نقشهٔ کل» — نه وسطِ «امروز» */
      else if (!hv && A.V.whole && !((S.settings().orient || {}).seen)) A.state.view = "whole";
      else if (!hv && !(S.settings().seenStart)) A.state.view = "start";
      A.render();
    });
  };
})(APP);
if (!window.LLA_HOST) document.addEventListener("DOMContentLoaded", function () { APP.boot(); });
