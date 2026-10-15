/* ===== موتور کارگاه: فیلدها، تحلیلگرها، نمودارها ===== */
(function (A) {
  var h = A.h, fa = A.fa;

  /* ---------- گراف متنی → SVG ---------- */
  A.parseGraph = function (txt) {
    var nodes = {}, edges = [], order = [];
    (txt || "").split(/\n/).forEach(function (line) {
      line = line.trim(); if (!line) return;
      var m = line.match(/^(.+?)\s*(->|\+>|!>|→)\s*(.+?)(?:\s*:\s*(.+))?$/);
      if (!m) { var single = line.replace(/:.*/, "").trim(); if (single && !nodes[single]) { nodes[single] = 1; order.push(single); } return; }
      var a = m[1].trim(), b = m[3].trim(), kind = m[2] === "+>" ? "pos" : m[2] === "!>" ? "neg" : "neu";
      [a, b].forEach(function (n) { if (!nodes[n]) { nodes[n] = 1; order.push(n); } });
      edges.push({ a: a, b: b, k: kind, l: (m[4] || "").trim() });
    });
    return { nodes: order, edges: edges };
  };
  function layout(nodes, edges, W, H) {
    var n = nodes.length, pos = {}, i;
    // seed on circle (deterministic)
    nodes.forEach(function (id, k) { var a = (2 * Math.PI * k) / Math.max(1, n); pos[id] = { x: W / 2 + (W * 0.32) * Math.cos(a), y: H / 2 + (H * 0.32) * Math.sin(a) }; });
    if (n <= 2) { if (n === 2) { pos[nodes[0]] = { x: W * 0.78, y: H / 2 }; pos[nodes[1]] = { x: W * 0.22, y: H / 2 }; } return pos; }
    var k = Math.sqrt((W * H) / n) * 0.75;
    for (var it = 0; it < 260; it++) {
      var disp = {}; nodes.forEach(function (v) { disp[v] = { x: 0, y: 0 }; });
      for (i = 0; i < n; i++) for (var j = i + 1; j < n; j++) {
        var u = pos[nodes[i]], v = pos[nodes[j]], dx = u.x - v.x, dy = u.y - v.y, d = Math.sqrt(dx * dx + dy * dy) || 0.01, f = (k * k) / d;
        disp[nodes[i]].x += dx / d * f; disp[nodes[i]].y += dy / d * f; disp[nodes[j]].x -= dx / d * f; disp[nodes[j]].y -= dy / d * f;
      }
      edges.forEach(function (e) {
        var u = pos[e.a], v = pos[e.b]; if (!u || !v || e.a === e.b) return;
        var dx = u.x - v.x, dy = u.y - v.y, d = Math.sqrt(dx * dx + dy * dy) || 0.01, f = (d * d) / k;
        disp[e.a].x -= dx / d * f; disp[e.a].y -= dy / d * f; disp[e.b].x += dx / d * f; disp[e.b].y += dy / d * f;
      });
      var temp = 40 * (1 - it / 260) + 1;
      nodes.forEach(function (v) {
        var d = disp[v], len = Math.sqrt(d.x * d.x + d.y * d.y) || 1;
        pos[v].x += d.x / len * Math.min(len, temp); pos[v].y += d.y / len * Math.min(len, temp);
        pos[v].x = Math.max(80, Math.min(W - 80, pos[v].x)); pos[v].y = Math.max(30, Math.min(H - 30, pos[v].y));
      });
    }
    return pos;
  }
  var SVGNS = "http://www.w3.org/2000/svg";
  function s(tag, attrs, txt) { var el = document.createElementNS(SVGNS, tag); for (var k in attrs) el.setAttribute(k, attrs[k]); if (txt != null) el.textContent = txt; return el; }
  A.svg = s;
  A.renderGraph = function (txt) {
    var g = A.parseGraph(txt);
    var wrap = h("div", { class: "gview" });
    if (!g.nodes.length) { wrap.appendChild(h("div", { class: "muted small" }, "پیش‌نمایش نمودار اینجا ظاهر می‌شود. هر خط یک رابطه: «الف -> ب»، «الف +> ب» (هم‌جهت)، «الف !> ب» (خلاف‌جهت)، و برچسب اختیاری بعد از «:».")); return wrap; }
    var W = 720, H = Math.max(260, Math.min(560, 120 + g.nodes.length * 34));
    var pos = layout(g.nodes, g.edges, W, H);
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "gsvg", role: "img", "aria-label": "نمودار روابط" });
    var defs = s("defs", {});
    [["neu", "var(--ink-2)"], ["pos", "var(--good)"], ["neg", "var(--bad)"]].forEach(function (m) {
      var mk = s("marker", { id: "ar-" + m[0], viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" });
      mk.appendChild(s("path", { d: "M0,0 L10,5 L0,10 z", fill: m[1] })); defs.appendChild(mk);
    });
    svg.appendChild(defs);
    var pairCount = {};
    g.edges.forEach(function (e) {
      var u = pos[e.a], v = pos[e.b]; if (!u || !v) return;
      var key = [e.a, e.b].sort().join("|"); pairCount[key] = (pairCount[key] || 0) + 1;
      var bend = pairCount[key] > 1 || g.edges.some(function (o) { return o.a === e.b && o.b === e.a; }) ? 40 : 14;
      if (e.a === e.b) { svg.appendChild(s("path", { d: "M" + (u.x + 20) + "," + (u.y - 12) + " c40,-50 60,30 10,22", fill: "none", stroke: "var(--ink-2)", "stroke-width": "1.6", "marker-end": "url(#ar-" + e.k + ")" })); return; }
      var dx = v.x - u.x, dy = v.y - u.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / d, uy = dy / d, r = 22;
      var x1 = u.x + ux * r * 2.2, y1 = u.y + uy * r, x2 = v.x - ux * r * 2.2, y2 = v.y - uy * r;
      var mx = (x1 + x2) / 2 - uy * bend, my = (y1 + y2) / 2 + ux * bend;
      var col = e.k === "pos" ? "var(--good)" : e.k === "neg" ? "var(--bad)" : "var(--ink-2)";
      svg.appendChild(s("path", { d: "M" + x1 + "," + y1 + " Q" + mx + "," + my + " " + x2 + "," + y2, fill: "none", stroke: col, "stroke-width": "1.7", "stroke-dasharray": e.k === "neg" ? "5 4" : "", "marker-end": "url(#ar-" + e.k + ")" }));
      var lab = (e.k === "pos" ? "+ " : e.k === "neg" ? "− " : "") + (e.l || "");
      if (lab.trim()) { var t = s("text", { x: mx, y: my, class: "glabel", "text-anchor": "middle" }, lab); svg.appendChild(t); }
    });
    g.nodes.forEach(function (n) {
      var p = pos[n], w = Math.min(170, 18 + n.length * 7.2);
      svg.appendChild(s("rect", { x: p.x - w / 2, y: p.y - 16, width: w, height: 32, rx: 7, fill: "var(--surface)", stroke: "var(--accent)", "stroke-width": "1.4" }));
      svg.appendChild(s("text", { x: p.x, y: p.y + 5, class: "gnode", "text-anchor": "middle" }, n.length > 24 ? n.slice(0, 23) + "…" : n));
    });
    wrap.appendChild(h("div", { class: "scrollx" }, svg));
    // تشخیص حلقه‌ها
    var loops = findLoops(g);
    if (loops.length) wrap.appendChild(h("div", { class: "small loops" }, loops.map(function (L) {
      var neg = L.filter(function (e) { return e.k === "neg"; }).length;
      var known = L.every(function (e) { return e.k !== "neu"; });
      var type = !known ? "نوع نامشخص (علامت همه یال‌ها را بزن)" : (neg % 2 === 0 ? "حلقه تقویت‌کننده (R)" : "حلقه متعادل‌کننده (B)");
      return h("div", {}, "⟲ " + L.map(function (e) { return e.a; }).join(" ← ") + " — " + type);
    })));
    return wrap;
  };
  function findLoops(g) {
    var adj = {}, found = [], seen = {};
    g.edges.forEach(function (e) { (adj[e.a] = adj[e.a] || []).push(e); });
    g.nodes.forEach(function (start) {
      (function dfs(node, path, visited) {
        if (path.length > 7) return;
        (adj[node] || []).forEach(function (e) {
          if (e.b === start && path.length + 1 >= 1) {
            var cyc = path.concat([e]); var key = cyc.map(function (x) { return x.a; }).sort().join("|");
            if (!seen[key]) { seen[key] = 1; found.push(cyc); }
          } else if (!visited[e.b] && e.b > start) { visited[e.b] = 1; dfs(e.b, path.concat([e]), visited); visited[e.b] = 0; }
        });
      })(start, [], {});
    });
    return found.slice(0, 6);
  }

  /* ---------- درخت ---------- */
  A.renderTree = function (txt) {
    var lines = (txt || "").split("\n").filter(function (l) { return l.trim(); });
    if (!lines.length) return h("div", { class: "muted small" }, "هر سطح فرزند را با دو فاصله بیشتر شروع کن. پیش‌نمایش درخت اینجا می‌آید.");
    var root = { kids: [], lvl: -1 }, stack = [root];
    lines.forEach(function (l) {
      var lvl = Math.floor((l.match(/^\s*/)[0].replace(/\t/g, "  ").length) / 2);
      var node = { t: l.trim().replace(/^[-•*]\s*/, ""), kids: [], lvl: lvl };
      while (stack.length > 1 && stack[stack.length - 1].lvl >= lvl) stack.pop();
      stack[stack.length - 1].kids.push(node); stack.push(node);
    });
    function ul(n) { return h("ul", {}, n.kids.map(function (k) { return h("li", {}, h("span", {}, k.t), k.kids.length ? ul(k) : null); })); }
    var leaves = 0, depth = 0; (function cnt(n, d) { if (!n.kids.length && d > 0) leaves++; depth = Math.max(depth, d); n.kids.forEach(function (k) { cnt(k, d + 1); }); })(root, 0);
    return h("div", { class: "tview" }, ul(root), h("div", { class: "small muted" }, "عمق: " + fa(depth) + " · برگ‌ها: " + fa(leaves)));
  };

  /* ---------- تحلیلگر اصطلاح (فاینمن) ---------- */
  A.analyzeJargon = function (txt) {
    txt = txt || "";
    var st = A.S.settings(); var list = (A.C.JARGON_SEED || []).concat(st.jargon || []);
    var words = txt.split(/[\s،,.؛;:!?؟()«»"\[\]{}]+/).filter(Boolean);
    var latin = words.filter(function (w) { return /[A-Za-z]{2,}/.test(w); });
    var jar = []; list.forEach(function (j) { if (j && txt.indexOf(j) >= 0) jar.push(j); });
    var longW = words.filter(function (w) { return w.replace(/[‌]/g, "").length >= 11 && !/[A-Za-z]/.test(w); });
    var sents = txt.split(/[.!?؟\n]+/).map(function (x) { return x.trim(); }).filter(Boolean);
    var longS = sents.filter(function (x) { return x.split(/\s+/).length > 28; });
    var causal = (txt.match(/چون|زیرا|بنابراین|در نتیجه|به همین دلیل|باعث|منجر|پس |اگر |آنگاه|به این دلیل|از آنجا که/g) || []).length;
    var vague = (txt.match(/به‌طور کلی|به طور کلی|به نوعی|به‌نوعی|یه جورایی|یک جورهایی|و غیره|و\.\.\.|مثل اینکه|تقریباً همه|خیلی مهم/g) || []).length;
    var score = 100;
    score -= Math.min(30, (jar.length + latin.length) * 5); score -= Math.min(15, longS.length * 5); score -= Math.min(15, vague * 5);
    if (sents.length) score -= causal / sents.length < 0.3 ? 20 : 0;
    return { words: words.length, sents: sents.length, latin: latin, jar: jar, longW: longW, longS: longS.length, causal: causal, vague: vague, score: Math.max(0, score) };
  };

  /* ---------- فیلدهای کارگاه ---------- */
  A.renderWS = function (fields, data, onChange, opts) {
    opts = opts || {};
    var root = h("div", { class: "ws" });
    var updaters = [];
    function changed() { updaters.forEach(function (u) { try { u(); } catch (e) { console.error(e); } }); onChange && onChange(); }
    fields.forEach(function (f, idx) {
      var id = (opts.prefix || "f") + "_" + f.k;
      var box = h("div", { class: "fld fld-" + f.t + (f.req ? " req" : ""), "data-k": f.k });
      var label = f.t === "info" ? null : h("label", { class: "flabel", for: id }, f.l, f.req ? h("span", { class: "reqmark", title: "الزامی" }, " *") : null);
      if (label) box.appendChild(label);
      var hint = f.h && f.t !== "info" && f.t !== "graph" ? f.h : null;
      var ctl = FIELD[f.t] ? FIELD[f.t](f, data, changed, id, updaters, opts) : h("div", { class: "muted" }, "نوع فیلد ناشناخته: " + f.t);
      box.appendChild(ctl);
      if (hint && ["text", "area", "list", "chain", "tree"].indexOf(f.t) < 0) box.appendChild(h("div", { class: "fhint" }, hint));
      root.appendChild(box);
    });
    root._validate = function () {
      var missing = [];
      fields.forEach(function (f) {
        if (!f.req) return;
        var ok = A.filled(data[f.k]);
        // data-driven table constraints (audit B27): distinct values in a column / at least one matching row
        if (ok && Array.isArray(data[f.k]) && (f.distinct || f.needOne)) {
          var rows = data[f.k].filter(function (r) { return r && typeof r === "object" && A.filled(r); });
          if (f.distinct) {
            var seen = {}; rows.forEach(function (r) { var v = String(r[f.distinct.col] || "").trim(); if (v) seen[v] = 1; });
            if (Object.keys(seen).length < f.distinct.n) { ok = false; missing.push(f.l + " — " + f.distinct.msg); }
          }
          if (ok && f.needOne) {
            var re = new RegExp(f.needOne.re);
            if (!rows.some(function (r) { return re.test(String(r[f.needOne.col] || "")); })) { ok = false; missing.push(f.l + " — " + f.needOne.msg); }
          }
          var el2 = root.querySelector('[data-k="' + f.k + '"]'); if (el2) el2.classList.toggle("missing", !ok);
          if (!ok) return;
        }
        var el = root.querySelector('[data-k="' + f.k + '"]');
        if (el) el.classList.toggle("missing", !ok);
        if (!ok) missing.push(f.l);
      });
      return missing;
    };
    setTimeout(function () { updaters.forEach(function (u) { try { u(); } catch (e) { } }); }, 0);
    return root;
  };

  var FIELD = {};
  FIELD.info = function (f) { return h("div", { class: "finfo" }, h("strong", {}, f.l), f.h ? h("div", {}, f.h) : null); };
  FIELD.text = function (f, d, ch, id) {
    return h("input", { id: id, type: "text", value: d[f.k] || "", placeholder: f.h || "", oninput: function (e) { d[f.k] = e.target.value; ch(); } });
  };
  FIELD.area = function (f, d, ch, id) {
    var ta = h("textarea", { id: id, rows: f.rows || 4, placeholder: f.h || "", oninput: function (e) { d[f.k] = e.target.value; ch(); } });
    ta.value = d[f.k] || ""; return ta;
  };
  FIELD.sel = function (f, d, ch, id) {
    var sel = h("select", { id: id, onchange: function (e) { d[f.k] = e.target.value; ch(); } }, h("option", { value: "" }, "— انتخاب کن —"),
      (f.opts || []).map(function (o) { return h("option", { value: o, selected: d[f.k] === o }, o); }));
    // مقدارِ ذخیره‌شده‌ای که دیگر در گزینه‌ها نیست (گزینه بازنویسی شد) گم نمی‌شود (۲۰۲۶-۱۰-۱۵: پاک‌کردنِ مثال‌های بازار از کاربرگ‌ها)
    if (d[f.k] && (f.opts || []).indexOf(d[f.k]) < 0) sel.appendChild(h("option", { value: d[f.k], selected: true }, d[f.k] + " (گزینهٔ پیشین)"));
    return sel;
  };
  FIELD.checks = function (f, d, ch, id) {
    var cur = d[f.k] || [];
    var opts0 = (f.opts || []).concat(cur.filter(function (x) { return x && (f.opts || []).indexOf(x) < 0; }));   // گزینهٔ پیشینِ تیک‌خورده هم دیده شود
    return h("div", { class: "checks", id: id }, opts0.map(function (o, i) {
      var cid = id + "_" + i;
      return h("label", { class: "chk", for: cid }, h("input", { type: "checkbox", id: cid, checked: cur.indexOf(o) >= 0, onchange: function (e) {
        var arr = (d[f.k] || []).filter(function (x) { return x !== o; }); if (e.target.checked) arr.push(o); d[f.k] = arr; ch(); } }), h("span", {}, (f.opts || []).indexOf(o) < 0 ? o + " (گزینهٔ پیشین)" : o));
    }));
  };
  FIELD.scale = function (f, d, ch, id) {
    var min = f.min == null ? 0 : f.min, max = f.max == null ? 100 : f.max;
    var val = d[f.k] == null ? null : d[f.k];
    var out = h("output", { class: "sval" }, val == null ? "—" : fa(val));
    var r = h("input", { id: id, type: "range", min: min, max: max, step: f.step || 1, value: val == null ? Math.round((min + max) / 2) : val, "data-unset": val == null ? "1" : null,
      oninput: function (e) { e.target.removeAttribute("data-unset"); d[f.k] = +e.target.value; out.textContent = fa(e.target.value); ch(); } });
    return h("div", { class: "scale" }, h("span", { class: "small muted" }, f.lo || fa(min)), r, h("span", { class: "small muted" }, f.hi || fa(max)), out);
  };
  FIELD.list = function (f, d, ch, id) {
    var wrap = h("div", { class: "flist" });
    function draw() {
      wrap.innerHTML = "";
      var arr = d[f.k] = d[f.k] || [];
      var n = Math.max(f.min || 1, arr.length);
      for (var i = 0; i < n; i++) (function (i) {
        wrap.appendChild(h("div", { class: "lrow" }, h("span", { class: "lnum" }, fa(i + 1)),
          h("input", { type: "text", id: i === 0 ? id : id + "_" + i, "aria-label": i === 0 ? null : (f.l || "ردیف") + " — " + fa(i + 1), value: arr[i] || "", placeholder: i === 0 ? (f.h || "") : "", oninput: function (e) { arr[i] = e.target.value; ch(); } }),
          i >= (f.min || 1) ? h("button", { class: "ib", type: "button", title: "حذف", "aria-label": "حذف ردیف", onclick: function () { arr.splice(i, 1); draw(); ch(); } }, "×") : null));
      })(i);
      if (!f.max || n < f.max) wrap.appendChild(h("button", { class: "btn ghost sm", type: "button", onclick: function () { arr.length = n; arr.push(""); draw(); } }, "+ افزودن"));
    }
    draw(); return wrap;
  };
  FIELD.chain = function (f, d, ch, id) {
    var wrap = h("div", { class: "chain" });
    var arr = d[f.k] = d[f.k] || [];
    var ctxEls = [];
    for (var i = 0; i < (f.n || 5); i++) (function (i) {
      var ctx = h("div", { class: "cctx small" });
      ctxEls.push(ctx);
      var ta = h("textarea", { id: i === 0 ? id : id + "_" + i, rows: 2, "aria-label": i === 0 ? null : (f.prefix || "گام") + " " + fa(i + 1) + (f.l ? " — " + f.l : ""), placeholder: i === 0 ? (f.h || "") : "", oninput: function (e) { arr[i] = e.target.value; refresh(); ch(); } });
      ta.value = arr[i] || "";
      wrap.appendChild(h("div", { class: "crow" }, h("div", { class: "cnum" }, (f.prefix || "گام") + " " + fa(i + 1)), h("div", { class: "cbody" }, ctx, ta)));
    })(i);
    function refresh() { ctxEls.forEach(function (c, i) { c.textContent = i === 0 ? "" : (arr[i - 1] ? "دربارهٔ: «" + arr[i - 1].slice(0, 140) + "»" : "اول گام قبلی را بنویس."); }); }
    refresh(); return wrap;
  };
  FIELD.table = function (f, d, ch, id, updaters, opts) {
    var wrap = h("div", { class: "ftable" });
    function draw() {
      wrap.innerHTML = "";
      var rows = d[f.k] = d[f.k] || [];
      var n = Math.max(f.min || 1, rows.length);
      while (rows.length < n) rows.push({});
      var tbl = h("table", { class: "wt" }, h("thead", {}, h("tr", {}, h("th", {}, "#"), f.cols.map(function (c) { return h("th", {}, c.l); }), h("th", {}, ""))));
      var tb = h("tbody");
      rows.forEach(function (row, ri) {
        tb.appendChild(h("tr", {}, h("td", { class: "rn" }, fa(ri + 1)), f.cols.map(function (c, ci) {
          var cid = ri === 0 && ci === 0 ? id : id + "_" + ri + "_" + c.k;
          var input;
          var frozen = c.freeze && A.filled(row[c.freeze]) && row[c.k] != null && row[c.k] !== "";
          if (frozen) return h("td", { "data-l": c.l }, h("span", { class: "frozen", title: "پس از ثبت نتیجه قفل شد تا اطمینان پیشین دست نخورد" }, String(row[c.k])));
          if (c.t === "claim") { var cl = (opts && opts.claims) || []; input = h("select", { id: cid, "aria-label": c.l, onchange: function (e) { row[c.k] = e.target.value; ch(); } }, h("option", { value: "" }, cl.length ? "— ادعا —" : "اول در ایستگاه «تصور یا تصدیق» ادعاها را ثبت کن"), cl.map(function (t, i) { var v = String(i + 1); return h("option", { value: v, selected: String(row[c.k]) === v }, fa(i + 1) + ". " + (t || "").slice(0, 70)); })); }
          else if (c.t === "sel") input = h("select", { id: cid, "aria-label": c.l, onchange: function (e) { row[c.k] = e.target.value; ch(); } }, h("option", { value: "" }, "—"), (c.opts || []).map(function (o) { return h("option", { value: o, selected: row[c.k] === o }, o); }));
          else if (c.t === "num" || c.t === "pct") input = h("input", { id: cid, "aria-label": c.l, type: "number", step: "any", min: c.t === "pct" ? 0 : null, max: c.t === "pct" ? 100 : null, value: row[c.k] == null ? "" : row[c.k], oninput: function (e) { var v = e.target.value === "" ? null : +e.target.value; if (v != null && c.t === "pct") v = Math.max(0, Math.min(100, v)); row[c.k] = v; ch(); }, onblur: function (e) { if (row[c.k] != null) e.target.value = row[c.k]; } });
          else { input = h("textarea", { id: cid, "aria-label": c.l, rows: 1, oninput: function (e) { row[c.k] = e.target.value; ch(); } }); input.value = row[c.k] || ""; }
          return h("td", { "data-l": c.l }, input);
        }), h("td", {}, ri >= (f.min || 1) ? h("button", { class: "ib", type: "button", "aria-label": "حذف ردیف", onclick: function () { rows.splice(ri, 1); draw(); ch(); } }, "×") : null)));
      });
      tbl.appendChild(tb);
      wrap.appendChild(h("div", { class: "scrollx" }, tbl));
      wrap.appendChild(h("button", { class: "btn ghost sm", type: "button", onclick: function () { rows.push({}); draw(); } }, "+ ردیف"));
    }
    draw(); return wrap;
  };
  FIELD.tree = function (f, d, ch, id) {
    var prev = h("div", { class: "tprev" });
    var ta = h("textarea", { id: id, rows: 8, class: "mono", placeholder: f.h || "ریشه\n  شاخه ۱\n    برگ\n  شاخه ۲", oninput: function (e) { d[f.k] = e.target.value; up(); ch(); },
      onkeydown: function (e) { if (e.key === "Tab") { e.preventDefault(); var s0 = ta.selectionStart; ta.value = ta.value.slice(0, s0) + "  " + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s0 + 2; d[f.k] = ta.value; up(); ch(); } } });
    ta.value = d[f.k] || "";
    function up() { prev.innerHTML = ""; prev.appendChild(A.renderTree(ta.value)); }
    up(); return h("div", { class: "two" }, ta, prev);
  };
  FIELD.graph = function (f, d, ch, id) {
    var prev = h("div", { class: "gprev" });
    var ta = h("textarea", { id: id, rows: 7, class: "mono", placeholder: f.h || "دما -> حجمِ آب : انبساط\nیخ زدن +> حجم\nحجم !> چگالی", oninput: function (e) { d[f.k] = e.target.value; up(); ch(); } });
    ta.value = d[f.k] || "";
    var up = A.debounce(function () { prev.innerHTML = ""; prev.appendChild(A.renderGraph(ta.value)); }, 250);
    prev.appendChild(A.renderGraph(ta.value));
    return h("div", {}, h("div", { class: "fhint" }, "نحو: «الف -> ب» رابطه · «الف +> ب» هم‌جهت (افزایش الف، ب را افزایش می‌دهد) · «الف !> ب» خلاف‌جهت · «: برچسب» اختیاری"), ta, prev);
  };
  FIELD.timer = function (f, d, ch, id) {
    var st = d[f.k] = d[f.k] || { sec: 0, done: false };
    // f.max = a CEILING (stop and move on when it's reached — audit B25), f.min = a target to reach
    var cap = f.max || 0, target = (cap || f.min || 10) * 60, iv = null;
    var disp = h("div", { class: "tdisp", "aria-live": "polite" });
    var bar = h("div", { class: "tbar" }, h("i", {}));
    function show() {
      var left = Math.max(0, target - st.sec);
      disp.textContent = fa(A.pad(Math.floor(left / 60)) + ":" + A.pad(left % 60));
      bar.firstChild.style.width = Math.min(100, 100 * st.sec / target) + "%";
      box.classList.toggle("done", !!st.done);
    }
    var bStart = h("button", { class: "btn sm", type: "button", id: id, onclick: function () {
      if (iv) { clearInterval(iv); iv = null; bStart.textContent = "ادامه"; ch(); return; }
      bStart.textContent = "مکث";
      iv = setInterval(function () {
        if (cap && st.sec >= target) { clearInterval(iv); iv = null; bStart.textContent = "ادامه"; show(); return; }
        st.sec++;
        if (st.sec >= target && !st.done) {
          st.done = true;
          if (cap) { clearInterval(iv); iv = null; bStart.textContent = "ادامه"; A.toast("سقفِ " + fa(cap) + " دقیقه رسید: بیش از این تلاش نکن — حالا پاسخ را ببین و مقایسه کن."); }
          else A.toast("زمان تمام شد. حالا ادامه بده.");
          ch();
        }
        show(); if (!document.body.contains(box)) clearInterval(iv);
      }, 1000);
    } }, st.sec ? "ادامه" : "شروع");
    var box = h("div", { class: "timer" }, disp, bar, h("div", { class: "row gap" }, bStart, h("button", { class: "btn ghost sm", type: "button", onclick: function () { st.sec = 0; st.done = false; show(); ch(); } }, "صفر"),
      h("span", { class: "small muted" }, cap ? "سقف: " + fa(cap) + " دقیقه (نه کف — زودتر هم می‌توانی تمام کنی)" : "هدف: " + fa(f.min || 10) + " دقیقه")));
    show(); return box;
  };
  FIELD.lock = function (f, d, ch, id, updaters) {
    var uk = f.k + "__open";
    var wrap = h("div", { class: "lockbox" });
    function draw() {
      wrap.innerHTML = "";
      if (d[uk]) {
        var ta = h("textarea", { id: id, rows: 5, placeholder: f.h || "", oninput: function (e) { d[f.k] = e.target.value; ch(); } }); ta.value = d[f.k] || "";
        wrap.appendChild(ta); return;
      }
      var ready = A.filled(d[f.after]);
      var btn = h("button", { class: "btn sm", type: "button", id: id, disabled: !ready, onclick: function () { d[uk] = true; draw(); ch(); } }, "باز کردن");
      wrap.appendChild(h("div", { class: "locked" }, h("span", { class: "lk", "aria-hidden": "true" }), h("div", {}, h("div", {}, ready ? "تلاشت ثبت شد. حالا می‌توانی منبع یا پاسخ را ببینی و مقایسه کنی." : "قفل است تا اول بخش قبلی را از حافظه یا با تلاش خودت پر کنی."), h("div", { class: "small muted" }, "دلیل: اثر تولید و اثر آزمون — تلاش پیش از دیدن پاسخ، ماندگاری را بالا می‌برد.")), btn));
      updaters.push(function () { btn.disabled = !A.filled(d[f.after]); });
    }
    draw(); return wrap;
  };
  FIELD.draw = function (f, d, ch, id) {
    var W = 720, H = 360;
    var cv = h("canvas", { id: id, width: W, height: H, class: "cv", "aria-label": f.l });
    var ctx = cv.getContext("2d");
    function bg() { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H); }
    bg();
    if (d[f.k]) { var im = new Image(); im.onload = function () { ctx.drawImage(im, 0, 0, W, H); }; im.src = d[f.k]; }
    var drawing = false, last = null, color = "#17201e", width = 2.5;
    function pt(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
    cv.addEventListener("pointerdown", function (e) { drawing = true; last = pt(e); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", function (e) { if (!drawing) return; var p = pt(e); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; });
    function end() { if (!drawing) return; drawing = false; try { d[f.k] = cv.toDataURL("image/jpeg", 0.6); } catch (e) { } ch(); }
    cv.addEventListener("pointerup", end); cv.addEventListener("pointerleave", end);
    var tools = h("div", { class: "row gap wrap" },
      [["#17201e", "مداد"], ["#0f6e66", "سبزآبی"], ["#b3372e", "قرمز"], ["#ffffff", "پاک‌کن"]].map(function (c) {
        return h("button", { class: "btn ghost sm", type: "button", onclick: function () { color = c[0]; width = c[0] === "#ffffff" ? 16 : 2.5; } }, h("span", { class: "sw", style: { background: c[0] } }), c[1]);
      }),
      h("button", { class: "btn ghost sm", type: "button", onclick: function () { bg(); d[f.k] = ""; ch(); } }, "پاک کردن همه"));
    return h("div", { class: "drawbox" }, tools, h("div", { class: "cvwrap" }, cv));
  };
  FIELD.jargon = function (f, d, ch, id, updaters) {
    var box = h("div", { class: "analyzer", id: id });
    updaters.push(function () {
      var r = A.analyzeJargon(d[f.src]); box.innerHTML = "";
      if (!r.words) { box.appendChild(h("div", { class: "muted small" }, "وقتی توضیحت را بنویسی، اینجا تحلیل می‌شود.")); return; }
      var cls = r.score >= 75 ? "good" : r.score >= 50 ? "warn" : "bad";
      box.appendChild(h("div", { class: "an-head" }, h("span", { class: "pill " + cls }, "سادگی و علّیت: " + fa(r.score) + " از ۱۰۰"), h("span", { class: "small muted" }, fa(r.words) + " واژه · " + fa(r.sents) + " جمله")));
      var rows = [
        ["اصطلاحات فنی یافت‌شده", r.jar.concat(r.latin).length ? r.jar.concat(r.latin).join("، ") : "هیچ — عالی", r.jar.length + r.latin.length ? "bad" : "good", "هر کدام را یا حذف کن یا در یک جمله با زبان روزمره باز کن."],
        ["واژه‌های بلند", r.longW.length ? r.longW.slice(0, 8).join("، ") : "—", r.longW.length > 3 ? "warn" : "good", "واژه بلند اغلب نشانه زبان رسمی به جای زبان فهم است."],
        ["پیوندهای علّی (چون، زیرا، بنابراین…)", fa(r.causal), r.sents && r.causal / r.sents >= 0.3 ? "good" : "bad", "توضیح سازوکاری یعنی زنجیره «چون… بنابراین…». کمتر از یک پیوند در هر ۳ جمله یعنی بیشتر توصیف کرده‌ای تا توضیح."],
        ["جمله‌های خیلی بلند", fa(r.longS), r.longS ? "warn" : "good", "جمله بیش از ۲۸ واژه را بشکن."],
        ["عبارت‌های مبهم (به‌طور کلی، به‌نوعی…)", fa(r.vague), r.vague ? "bad" : "good", "عبارت مبهم دقیقاً جای شکاف فهم است. کنارش علامت بزن."]
      ];
      box.appendChild(h("div", { class: "an-rows" }, rows.map(function (x) { return h("div", { class: "an-row" }, h("span", { class: "dot " + x[2] }), h("div", {}, h("div", {}, h("strong", {}, x[0] + ": "), x[1]), h("div", { class: "small muted" }, x[3]))); })));
    });
    return box;
  };
  FIELD.pareto = function (f, d, ch, id, updaters) {
    var box = h("div", { class: "analyzer", id: id });
    updaters.push(function () {
      box.innerHTML = "";
      var rows = (d[f.src] || []).filter(function (r) { return r[f.name] && !isNaN(parseFloat(r[f.val])); }).map(function (r) { return { n: r[f.name], v: Math.max(0, parseFloat(r[f.val])) }; });
      if (rows.length < 2) { box.appendChild(h("div", { class: "muted small" }, "دست‌کم دو ردیف با نام و عدد اثر وارد کن تا تحلیل پارتو نمایش داده شود.")); return; }
      rows.sort(function (a, b) { return b.v - a.v; });
      var tot = rows.reduce(function (a, r) { return a + r.v; }, 0) || 1, cum = 0, cut = -1;
      rows.forEach(function (r, i) { cum += r.v; r.c = 100 * cum / tot; if (cut < 0 && r.c >= 80) cut = i; });
      var share = Math.round(100 * (cut + 1) / rows.length);
      box.appendChild(h("div", { class: "an-head" }, h("span", { class: "pill " + (share <= 40 ? "good" : "warn") }, fa(cut + 1) + " از " + fa(rows.length) + " عامل (" + fa(share) + "٪) حدود ۸۰٪ اثر را می‌سازند"),
        share > 50 ? h("span", { class: "small muted" }, "توزیع اثر یکنواخت است؛ اینجا پارتو صادق نیست — همین یک یافته است.") : null));
      box.appendChild(h("div", { class: "pbars" }, rows.map(function (r, i) {
        return h("div", { class: "pbar" + (i <= cut ? " key" : "") }, h("span", { class: "pn" }, r.n), h("span", { class: "pt" }, h("i", { style: { width: (100 * r.v / rows[0].v) + "%" } })), h("span", { class: "pc" }, fa(Math.round(r.c)) + "٪"));
      })));
    });
    return box;
  };
  FIELD.calib = function (f, d, ch, id, updaters) {
    var box = h("div", { class: "analyzer", id: id });
    updaters.push(function () {
      box.innerHTML = "";
      var pts = (d[f.src] || []).map(function (r) { var p = Math.max(0, Math.min(100, parseFloat(r[f.conf]))); var o = r[f.out]; return (isNaN(p) || (o !== "درست" && o !== "نادرست")) ? null : { p: p / 100, o: o === "درست" ? 1 : 0 }; }).filter(Boolean);
      var pending = (d[f.src] || []).filter(function (r) { return r[f.conf] != null && (!r[f.out] || r[f.out] === "نامعلوم"); }).length;
      if (f.minN && pts.length < f.minN) { box.appendChild(h("div", { class: "muted small" }, fa(pts.length) + " پیش‌بینی ارزیابی‌شده؛ برای منحنی معتبر دست‌کم " + fa(f.minN) + " لازم است (کمتر از آن، نویز است). " + (pending ? fa(pending) + " در انتظار نتیجه." : ""))); return; }
      if (!pts.length) { box.appendChild(h("div", { class: "muted small" }, "وقتی نتیجه پیش‌بینی‌ها (درست/نادرست) مشخص شد، نمره کالیبراسیون اینجا حساب می‌شود. " + (pending ? fa(pending) + " پیش‌بینی در انتظار نتیجه." : ""))); return; }
      box.appendChild(A.calibChart(pts, pending));
    });
    return box;
  };

  /* ---------- نمودار کالیبراسیون ---------- */
  A.calibChart = function (pts, pending) {
    var b = A.brier(pts);
    var bins = [[0, .2], [.2, .4], [.4, .6], [.6, .8], [.8, 1.01]].map(function (r) {
      var inb = pts.filter(function (x) { return x.p >= r[0] && x.p < r[1]; });
      return { lo: r[0], hi: Math.min(1, r[1]), n: inb.length, p: inb.length ? inb.reduce(function (a, x) { return a + x.p; }, 0) / inb.length : null, o: inb.length ? inb.reduce(function (a, x) { return a + x.o; }, 0) / inb.length : null };
    });
    var meanP = pts.reduce(function (a, x) { return a + x.p; }, 0) / pts.length, meanO = pts.reduce(function (a, x) { return a + x.o; }, 0) / pts.length;
    var diff = meanP - meanO;
    var W = 300, H = 220, pad = 34, s = A.svg;
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "cchart", role: "img", "aria-label": "نمودار کالیبراسیون" });
    var X = function (v) { return pad + v * (W - pad - 10); }, Y = function (v) { return H - pad - v * (H - pad - 12); };
    [0, .25, .5, .75, 1].forEach(function (v) {
      svg.appendChild(s("line", { x1: X(0), x2: X(1), y1: Y(v), y2: Y(v), class: "grid" }));
      svg.appendChild(s("text", { x: pad - 6, y: Y(v) + 4, class: "ax", "text-anchor": "end" }, fa(Math.round(v * 100))));
      svg.appendChild(s("text", { x: X(v), y: H - pad + 16, class: "ax", "text-anchor": "middle" }, fa(Math.round(v * 100))));
    });
    svg.appendChild(s("line", { x1: X(0), y1: Y(0), x2: X(1), y2: Y(1), class: "diag" }));
    var path = bins.filter(function (b) { return b.n; }).map(function (b, i) { return (i ? "L" : "M") + X(b.p) + "," + Y(b.o); }).join(" ");
    if (path) svg.appendChild(s("path", { d: path, class: "cline" }));
    bins.forEach(function (b) { if (b.n) svg.appendChild(s("circle", { cx: X(b.p), cy: Y(b.o), r: 3 + Math.min(6, b.n), class: "cdot" })); });
    svg.appendChild(s("text", { x: X(.5), y: H - 4, class: "ax", "text-anchor": "middle" }, "اطمینان اعلام‌شده ٪"));
    var verdict = Math.abs(diff) < 0.07 ? ["good", "کالیبره"] : diff > 0 ? ["bad", "بیش‌اطمینان (" + fa(Math.round(diff * 100)) + " واحد)"] : ["warn", "کم‌اطمینان (" + fa(Math.round(-diff * 100)) + " واحد)"];
    return h("div", { class: "calib" }, h("div", { class: "an-head" },
      h("span", { class: "pill " + (b < 0.18 ? "good" : b < 0.25 ? "warn" : "bad") }, "Brier: " + fa(b.toFixed(3))),
      h("span", { class: "pill " + verdict[0] }, verdict[1]),
      h("span", { class: "small muted" }, fa(pts.length) + " پیش‌بینی ارزیابی‌شده" + (pending ? " · " + fa(pending) + " در انتظار" : ""))),
      h("div", { class: "scrollx" }, svg),
      h("div", { class: "small muted" }, "نمره Brier صفر یعنی کامل، ۰٫۲۵ یعنی معادل حدس سکه‌ای با ۵۰٪. نقاط زیر خط مورب = بیش‌اطمینانی؛ بالای آن = کم‌اطمینانی."));
  };

  /* ---------- نمودار خطی کوچک ---------- */
  A.spark = function (vals, max) {
    var W = 240, H = 56, s = A.svg; max = max || 100;
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "spark", role: "img", "aria-label": "روند" });
    if (vals.length < 2) { svg.appendChild(s("text", { x: W / 2, y: H / 2, class: "ax", "text-anchor": "middle" }, vals.length ? "یک نقطه — دست‌کم دو نوبت لازم است" : "هنوز داده‌ای نیست")); return svg; }
    var X = function (i) { return 6 + i * (W - 12) / (vals.length - 1); }, Y = function (v) { return H - 6 - (v / max) * (H - 12); };
    svg.appendChild(s("path", { d: "M" + X(0) + "," + (H - 6) + vals.map(function (v, i) { return " L" + X(i) + "," + Y(v); }).join("") + " L" + X(vals.length - 1) + "," + (H - 6) + " Z", class: "sarea" }));
    svg.appendChild(s("path", { d: vals.map(function (v, i) { return (i ? "L" : "M") + X(i) + "," + Y(v); }).join(" "), class: "sline" }));
    svg.appendChild(s("circle", { cx: X(vals.length - 1), cy: Y(vals[vals.length - 1]), r: 3.5, class: "sdot" }));
    return svg;
  };
})(APP);
