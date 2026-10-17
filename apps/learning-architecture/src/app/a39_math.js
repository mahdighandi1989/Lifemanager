/* ===== نمایشِ درستِ فرمول (a39_math.js) — تورِ پولیا دورِ ۱۷، INF1 =====
   ۱۴ از ۳۸ سناریو عددی/فرمولی/برهانی بودند و گفت‌وگو و فیلدها فرمول را متنِ خام نشان می‌دادند («1/((n+1)(n+2))»).
   یک نمایش‌گرِ واحد، بی کتابخانهٔ بیرونی (بسته مستقل است): LaTeX ِ سبکِ درونِ $…$ یا \(…\) و ریاضیِ ASCII ِ کاربرِ فارسی‌نویس
   («1/((n+1)(n+2))»، «x^2+1»، «a_n»، «n(n+1)/2»، «√2») ⇒ MathML ِ بومی (MathML Core در مرورگرهای کنونی).
   • فقط تکه‌ای که آشکارا ریاضی است تبدیل می‌شود (نشانه‌اش: ^، _ پس از یک حرف، √/sqrt، \فرمان، یا «/» کنارِ پرانتز)؛ عددِ تنها
     درونِ جملهٔ فارسی («۳۰ پله»، «۴۰ درصد»)، تاریخ («۱۴۰۲/۰۵/۱۲»)، نشانی و نامِ_فایل متن می‌مانند.
   • ایمنی: درخت با createElementNS/createTextNode ساخته می‌شود — هیچ innerHTML ای از ورودی نیست؛ ورودیِ ناشناخته یا بدشکل
     (فرمانِ ناشناخته، پرانتزِ ناجفت، حرفِ فارسی بیرونِ \text) متنِ دست‌نخورده می‌ماند.
   • راست‌به‌چپ: هر <math> درونِ <bdi dir="ltr"> (unicode-bidi:isolate) می‌نشیند تا ترتیبِ جملهٔ فارسیِ دورش به هم نریزد.
   به کار می‌رود در: حبابِ «💬 دستیار» (a26، A.MATH.nodes) و پیش‌نمایشِ زیرِ صورت/گامِ «🔭 مسئلهٔ حل‌نشدهٔ خودم» (a38، A.MATH.attach). */
(function (A) {
  var NS = "http://www.w3.org/1998/Math/MathML";
  var RTL = /[֐-ٟ٪-ۯۺ-ࣿיִ-﷿ﹰ-﻿]/;
  var GREEK = { alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ϵ", varepsilon: "ε", zeta: "ζ", eta: "η", theta: "θ", vartheta: "ϑ", iota: "ι", kappa: "κ",
    lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", pi: "π", rho: "ρ", sigma: "σ", tau: "τ", upsilon: "υ", phi: "ϕ", varphi: "φ", chi: "χ", psi: "ψ", omega: "ω",
    Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Xi: "Ξ", Pi: "Π", Sigma: "Σ", Phi: "Φ", Psi: "Ψ", Omega: "Ω", infty: "∞", partial: "∂", ell: "ℓ", emptyset: "∅" };
  var OPS = { le: "≤", leq: "≤", ge: "≥", geq: "≥", ne: "≠", neq: "≠", cdot: "⋅", times: "×", div: "÷", pm: "±", mp: "∓", to: "→", rightarrow: "→", leftarrow: "←",
    Rightarrow: "⇒", implies: "⇒", Leftarrow: "⇐", iff: "⇔", Leftrightarrow: "⇔", approx: "≈", equiv: "≡", sim: "∼", in: "∈", notin: "∉", subset: "⊂", subseteq: "⊆",
    cup: "∪", cap: "∩", ldots: "…", dots: "…", cdots: "⋯", forall: "∀", exists: "∃", neg: "¬", land: "∧", lor: "∨", circ: "∘", mid: "∣", lt: "<", gt: ">",
    setminus: "∖", angle: "∠", perp: "⊥", parallel: "∥", deg: "°", ast: "∗", mod: "mod", bmod: "mod" };
  var FUNCS = ["arcsin", "arccos", "arctan", "sinh", "cosh", "tanh", "sin", "cos", "tan", "cot", "sec", "csc", "log", "ln", "exp", "lim", "max", "min", "gcd", "lcm", "det", "mod"];
  var BIG = { sum: "∑", prod: "∏", int: "∫", oint: "∮" }, UNDER = { sum: 1, prod: 1, lim: 1, max: 1, min: 1 };
  var BB = { R: "ℝ", N: "ℕ", Z: "ℤ", Q: "ℚ", C: "ℂ", P: "ℙ" };
  var ACC = { overline: "¯", bar: "¯", hat: "^", vec: "→", tilde: "~", dot: "˙" };
  var USUP = { "²": "2", "³": "3", "¹": "1", "⁰": "0", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "ⁿ": "n" };
  var AOPS = [["<=", "≤"], [">=", "≥"], ["!=", "≠"], ["->", "→"], ["=>", "⇒"], ["+-", "±"], ["...", "…"]];
  var OPCH = "+-−=<>≤≥≠×·⋅÷±∓→←↔⇒⇐⇔≈≡∼∈∉⊂⊆∪∩,;:!/%…∘|*∣∖∠⊥∥°";
  var CLOSE = { "(": ")", "[": "]", "{": "}" };

  function Bad() { }   // ورودیِ ناشناخته ⇒ تکه متن می‌ماند
  function fail() { throw new Bad(); }

  /* ---------- نشانه‌ها ---------- */
  function lex(s, ascii) {
    var t = [], i = 0, n = s.length, m;
    while (i < n) {
      var c = s[i], rest = s.slice(i);
      if (/\s/.test(c)) { i++; continue; }
      if ((m = /^[0-9۰-۹٠-٩]+(?:[.٫][0-9۰-۹٠-٩]+)?/.exec(rest))) { t.push({ y: "num", v: m[0] }); i += m[0].length; continue; }
      if (c === "\\") {
        if ((m = /^\\([A-Za-z]+)/.exec(rest))) {
          var cmd = m[1]; i += m[0].length;
          if (/^(text|mathrm|textrm|mbox|operatorname|mathbb)$/.test(cmd)) {
            while (s[i] === " ") i++;
            if (s[i] !== "{") fail();
            var j = s.indexOf("}", i); if (j < 0) fail();
            t.push({ y: "text", c: cmd, v: s.slice(i + 1, j) }); i = j + 1; continue;
          }
          t.push({ y: "cmd", v: cmd }); continue;
        }
        var nx = s[i + 1];
        if (nx === "," || nx === ";" || nx === ":" || nx === " " || nx === "!") { t.push({ y: "sp", v: nx === "!" ? "0" : nx === ";" ? "0.28em" : "0.17em" }); i += 2; continue; }
        if (nx === "{" || nx === "}" || nx === "|" || nx === "%") { t.push({ y: "op", v: nx }); i += 2; continue; }
        if (nx === "\\") { i += 2; continue; }
        fail();
      }
      if (/[A-Za-z]/.test(c)) {
        if (ascii) {
          var w = /^[A-Za-z]+/.exec(rest)[0], f = null;
          if (w === "sqrt") { t.push({ y: "cmd", v: "sqrt" }); i += 4; continue; }
          if (w === "pi") { t.push({ y: "id", v: "π" }); i += 2; continue; }
          for (var k = 0; k < FUNCS.length; k++) if (w.indexOf(FUNCS[k]) === 0 && (w.length === FUNCS[k].length)) { f = FUNCS[k]; break; }
          if (f) { t.push({ y: "fn", v: f }); i += f.length; continue; }
        }
        t.push({ y: "id", v: c }); i++; continue;
      }
      if (/[α-ωΑ-Ω∞∂ℓ∅]/.test(c)) { t.push({ y: "id", v: c }); i++; continue; }
      if (USUP[c]) { t.push({ y: "usup", v: USUP[c] }); i++; continue; }
      if (c === "√") { t.push({ y: "cmd", v: "sqrt" }); i++; continue; }
      if (c === "∑" || c === "∏" || c === "∫") { t.push({ y: "cmd", v: c === "∑" ? "sum" : c === "∏" ? "prod" : "int" }); i++; continue; }
      if (c === "^") { t.push({ y: "sup" }); i++; continue; }
      if (c === "_") { t.push({ y: "sub" }); i++; continue; }
      if (c === "'" || c === "′") { t.push({ y: "prime" }); i++; continue; }
      if (c === "(" || c === "[" || c === "{") { t.push({ y: "open", v: c }); i++; continue; }
      if (c === ")" || c === "]" || c === "}") { t.push({ y: "close", v: c }); i++; continue; }
      if (ascii) { var hit = null; AOPS.forEach(function (p) { if (!hit && rest.indexOf(p[0]) === 0) hit = p; }); if (hit) { t.push({ y: "op", v: hit[1] }); i += hit[0].length; continue; } }
      if (OPCH.indexOf(c) >= 0) { t.push({ y: "op", v: c === "-" ? "−" : c === "*" || c === "·" ? "⋅" : c }); i++; continue; }
      if (c === "." && !ascii) { t.push({ y: "op", v: "." }); i++; continue; }
      fail();   // حرفِ فارسی، نشانهٔ ناشناخته و … ⇒ متن می‌ماند
    }
    return t;
  }

  /* ---------- درختِ MathML ---------- */
  function E(tag, kids, at) {
    var e = document.createElementNS(NS, tag);
    if (at) Object.keys(at).forEach(function (k) { e.setAttribute(k, at[k]); });
    (kids || []).forEach(function (k) { if (k != null) e.appendChild(typeof k === "string" ? document.createTextNode(k) : k); });
    return e;
  }
  function row(nodes) { return nodes.length === 1 ? nodes[0] : E("mrow", nodes); }

  function parse(src, ascii) {
    var T = lex(src, ascii), i = 0;
    function peek() { return T[i]; }
    function next() { return T[i++]; }
    function seq(stop) {
      var items = [];
      while (i < T.length) {
        var k = T[i];
        if (k.y === "close") { if (stop && k.v === stop) break; fail(); }
        items.push(item());
      }
      if (stop) { if (!T[i] || T[i].v !== stop) fail(); i++; }
      return items;
    }
    function item() {
      var k = next();
      if (k.y === "op") return { k: "op", t: k.v, n: E("mo", [k.v]) };
      if (k.y === "sp") return { k: "sp", n: E("mspace", [], { width: k.v }) };
      var a = primary(k);
      return scripts(a);
    }
    function group(open) {   // پرانتز/کروشه/آکولاد ⇒ {n، درونِ بی‌پرانتز}
      var inner = row(nodes(seq(CLOSE[open])));
      return open === "{" ? { n: inner, paren: inner } : { n: E("mrow", [E("mo", [open]), inner, E("mo", [CLOSE[open]])]), paren: inner };
    }
    function arg() {   // آرگومانِ ^ _ و فرمان‌ها
      var k = next(); if (!k) fail();
      if (k.y === "open" && (k.v === "{" || ascii)) return group(k.v).paren;
      if (!ascii && k.y === "num" && k.v.length > 1) { T.splice(i, 0, { y: "num", v: k.v.slice(1) }); return E("mn", [k.v[0]]); }   // TeX: \frac12 ، x^23
      if (ascii && k.y === "op" && (k.v === "−" || k.v === "+")) return E("mrow", [E("mo", [k.v]), arg()]);
      if (k.y === "num" || k.y === "id" || k.y === "fn" || k.y === "cmd" || k.y === "text") return primary(k).n;
      fail();
    }
    function primary(k) {
      if (!k) fail();
      if (k.y === "num") return { n: E("mn", [k.v]) };
      if (k.y === "id") return { n: E("mi", [k.v]) };
      if (k.y === "fn") return { n: E("mi", [k.v]), fn: k.v };
      if (k.y === "open") return group(k.v);
      if (k.y === "text") {
        if (k.c === "mathbb") return { n: E("mi", [BB[k.v] || k.v], BB[k.v] ? null : { mathvariant: "double-struck" }) };
        if (k.c === "operatorname" || k.c === "mathrm") return { n: E("mi", [k.v], { mathvariant: "normal" }) };
        return { n: E("mtext", [k.v]) };
      }
      if (k.y === "cmd") {
        var c = k.v;
        if (GREEK[c]) return { n: E("mi", [GREEK[c]]) };
        if (OPS[c]) return { n: E("mo", [OPS[c]]), op: true };
        if (FUNCS.indexOf(c) >= 0) return { n: E("mi", [c]), fn: c };
        if (BIG[c]) return { n: E("mo", [BIG[c]], { largeop: "true" }), big: c };
        if (c === "frac" || c === "dfrac" || c === "tfrac") { var a = arg(), b = arg(); return { n: E("mfrac", [a, b]) }; }
        if (c === "binom") { var p = arg(), q = arg(); return { n: E("mrow", [E("mo", ["("]), E("mfrac", [p, q], { linethickness: "0" }), E("mo", [")"])]) }; }
        if (c === "sqrt") {
          if (!ascii && peek() && peek().y === "open" && peek().v === "[") { next(); var ix = row(nodes(seq("]"))); return { n: E("mroot", [arg(), ix]) }; }
          return { n: E("msqrt", [arg()]) };
        }
        if (ACC[c]) return { n: E("mover", [arg(), E("mo", [ACC[c]])], { accent: "true" }) };
        if (c === "left" || c === "right") { var d = next(); if (!d) fail(); if (d.y === "op" && d.v === ".") return { n: E("mrow", []) }; if (d.y === "open" || d.y === "close" || d.y === "op") return { n: E("mo", [d.v]), op: true }; fail(); }
        if (c === "quad" || c === "qquad") return { n: E("mspace", [], { width: c === "quad" ? "1em" : "2em" }) };
        fail();   // فرمانِ ناشناخته
      }
      fail();
    }
    function scripts(a) {
      var base = a.n, sub = null, sup = null;
      while (peek() && (peek().y === "prime")) { next(); base = E("msup", [base, E("mo", ["′"])]); }
      while (peek() && (peek().y === "sup" || peek().y === "sub" || peek().y === "usup")) {
        var k = next();
        if (k.y === "usup") { if (sup) fail(); sup = E(/\d/.test(k.v) ? "mn" : "mi", [k.v]); while (peek() && peek().y === "usup") { var u = next(); sup = row([sup, E(/\d/.test(u.v) ? "mn" : "mi", [u.v])]); } }
        else if (k.y === "sup") { if (sup) fail(); sup = arg(); }
        else { if (sub) fail(); sub = arg(); }
      }
      var n = base, under = a.big ? UNDER[a.big] : (a.fn && UNDER[a.fn]);
      if (sub && sup) n = E(under ? "munderover" : "msubsup", [base, sub, sup]);
      else if (sub) n = E(under ? "munder" : "msub", [base, sub]);
      else if (sup) n = E(under ? "mover" : "msup", [base, sup]);
      if (under && (sub || sup)) n.setAttribute("movablelimits", "true");
      return { k: a.op ? "op" : "atom", n: n, paren: sub || sup ? null : a.paren, fn: a.fn };
    }
    /* «/» ِ ASCII کسر می‌سازد: صورت = زنجیرهٔ ضربیِ پیوستهٔ پیش از آن، مخرج = زنجیرهٔ پس از آن؛ یک پرانتزِ تنها دورِ هر کدام برداشته می‌شود */
    function nodes(items) {
      var out = [];
      if (ascii) {
        var res = [];
        for (var x = 0; x < items.length; x++) {
          var it = items[x];
          if (it.k === "op" && it.t === "/") {
            var L = []; while (res.length && res[res.length - 1].k === "atom") L.unshift(res.pop());
            var R = []; while (x + 1 < items.length && items[x + 1].k === "atom") R.push(items[++x]);
            if (!L.length || !R.length) { res = res.concat(L); res.push(it); res = res.concat(R); continue; }
            res.push({ k: "atom", n: E("mfrac", [chain(L), chain(R)]) });
          } else res.push(it);
        }
        items = res;
      }
      items.forEach(function (it, j) {
        out.push(it.n);
        if (it.fn && items[j + 1] && items[j + 1].k === "atom") out.push(E("mspace", [], { width: "0.17em" }));
      });
      return out;
    }
    function chain(L) { return L.length === 1 && L[0].paren ? L[0].paren : row(L.map(function (z) { return z.n; })); }
    var body = nodes(seq(null));
    if (!body.length) fail();
    return E("math", [row(body)], { display: "inline", displaystyle: "true", dir: "ltr", alttext: src });   // کسرِ درونِ جمله به اندازهٔ خوانا
  }

  /* ---------- یافتنِ تکه‌های ریاضی ---------- */
  var MATHCH = /^[A-Za-z0-9۰-۹٠-٩α-ωΑ-Ω∞π√∑∏∫^_()\[\]{}+\-−=<>≤≥≠×·⋅÷±→⇒≈\/*!'′.,|²³¹⁰⁴⁵⁶⁷⁸⁹ⁿ%\\:]+$/;
  function trigger(s) {
    return /\^\s*[\w({\-۰-۹]/.test(s) || /(?:^|[^A-Za-z0-9])[A-Za-z]_(?:[A-Za-z0-9۰-۹]{1,2}|[({])(?![A-Za-z])/.test(s) ||
      /√|\bsqrt\s*\(/.test(s) || /\\[A-Za-z]+/.test(s) || /[\w)\]π]\s*\/\s*\(/.test(s) || /\)\s*\/\s*[\w(π]/.test(s) || /[∑∫∏]/.test(s);
  }
  function mathyWord(w) {
    if (!w || RTL.test(w) || /:\/\/|^www\.|@/.test(w) || !MATHCH.test(w)) return false;
    // واژهٔ لاتینِ سه‌حرفی و بیشتر (جز نامِ تابع و \فرمان) یعنی متن است، نه فرمول («src=x»، «onerror=…»)
    var words = w.replace(/\\[A-Za-z]+/g, " ").match(/[A-Za-z]{3,}/g) || [];
    if (words.some(function (x) { return FUNCS.indexOf(x) < 0 && x !== "sqrt"; })) return false;
    var letters = w.replace(/[^A-Za-z]/g, "");
    if (/[0-9۰-۹٠-٩^_()\[\]{}+\-−=<>≤≥≠×·⋅÷±→⇒≈\/*!√∑∫∏π²³ⁿ\\]/.test(w)) return true;
    return letters.length <= 2 || FUNCS.indexOf(w) >= 0;
  }
  function count(s, ch) { return s.split(ch).length - 1; }
  function tryAscii(run) {   // ⇒ [پیش، فرمول، پس] یا null
    var lead = (run.match(/^[«"“(]+/) || [""])[0], trail = (run.match(/[.,،:؛!?؟…»"”)]+$/) || [""])[0];
    var core = run.slice(lead.length, run.length - trail.length);
    // پرانتزهای ناجفتِ دو سر بیرون می‌مانند؛ جفت‌ها به فرمول برمی‌گردند
    while (lead && lead[lead.length - 1] === "(" && count(core, ")") > count(core, "(")) { core = "(" + core; lead = lead.slice(0, -1); }
    while (trail && trail[0] === ")" && count(core, "(") > count(core, ")")) { core += ")"; trail = trail.slice(1); }
    if (!core || !/[A-Za-z0-9۰-۹٠-٩]/.test(core) || !trigger(core)) return null;
    try { return [lead, parse(core, !/\\[A-Za-z]/.test(core)), trail, core]; } catch (e) { if (e instanceof Bad) return null; throw e; }
  }
  function asciiSegs(text, out) {
    var parts = String(text).split(/(\s+)/), buf = "", run = [];
    function flush() {
      if (!run.length) return;
      var ws = /^\s+$/.test(run[run.length - 1]) ? run.pop() : "";
      flushRun(); buf += ws;
    }
    function flushRun() {
      var r = run.join(""); run = [];
      var got = tryAscii(r);
      if (!got) { buf += r; return; }
      buf += got[0]; if (buf) out.push({ t: buf }); buf = got[2];
      out.push({ m: got[1], src: got[3] });
    }
    parts.forEach(function (p) {
      if (!p) return;
      if (/^\s+$/.test(p)) { if (run.length) run.push(p); else buf += p; return; }
      var bare = p.replace(/^[«"“(]+|[.,،:؛!?؟…»"”)]+$/g, "");
      if (mathyWord(bare)) {
        if (/^[«"“]/.test(p) && run.length) flush();
        run.push(p);
        if (/[.,،:؛!?؟…»"”]$/.test(p)) flush();
        return;
      }
      flush(); buf += p;
    });
    flush();
    if (buf) out.push({ t: buf });
  }
  var EXPL = /\$\$([^$]+?)\$\$|\$(?![\s$])([^$\n]*?[^\s$\\])\$(?!\d)|\\\(([\s\S]+?)\\\)/g;
  function segments(text) {
    var s = String(text == null ? "" : text), out = [], last = 0, m;
    EXPL.lastIndex = 0;
    while ((m = EXPL.exec(s))) {
      var tex = m[1] != null ? m[1] : m[2] != null ? m[2] : m[3], node = null;
      try { node = parse(tex.trim(), false); } catch (e) { if (!(e instanceof Bad)) throw e; }
      if (!node) continue;   // بدشکل ⇒ همان متن (با $ ها) در تکهٔ بعدی می‌ماند
      if (m.index > last) asciiSegs(s.slice(last, m.index), out);
      out.push({ m: node, src: tex.trim(), tex: true });
      last = EXPL.lastIndex;
    }
    if (last < s.length) asciiSegs(s.slice(last), out);
    // تکه‌های متنیِ پیاپی یکی می‌شوند
    var res = [];
    out.forEach(function (x) { if (x.t != null && res.length && res[res.length - 1].t != null) res[res.length - 1].t += x.t; else res.push(x); });
    return res;
  }

  function wrap(seg) {
    var b = document.createElement("bdi");
    b.setAttribute("dir", "ltr"); b.className = "mx"; b.setAttribute("style", "unicode-bidi:isolate;direction:ltr;display:inline-block");
    b.setAttribute("data-src", seg.src);
    b.appendChild(seg.m);
    return b;
  }
  /* متن ⇒ آرایهٔ گره‌ها؛ تکه‌های متنی از textFn می‌گذرند (مثلاً bidiNodes ِ دستیار)، بی آن رشتهٔ خام */
  function toNodes(text, textFn) {
    var out = [];
    segments(text).forEach(function (x) {
      if (x.m) { out.push(wrap(x)); return; }
      var r = textFn ? textFn(x.t) : x.t;
      if (Array.isArray(r)) r.forEach(function (y) { out.push(y); }); else out.push(r);
    });
    return out;
  }
  function has(text) { return segments(text).some(function (x) { return !!x.m; }); }
  function html(text) {
    var d = document.createElement("div");
    toNodes(text).forEach(function (n) { d.appendChild(typeof n === "string" ? document.createTextNode(n) : n); });
    return d.innerHTML;
  }
  /* پیش‌نمایشِ زندهٔ زیرِ یک فیلد: فقط وقتی متن فرمولی دارد پیدا می‌شود */
  function attach(wrapEl) {
    var inp = wrapEl && wrapEl.querySelector && wrapEl.querySelector("textarea,input");
    if (!inp) return wrapEl;
    var pv = document.createElement("div");
    pv.className = "mx-prev small"; pv.setAttribute("dir", "rtl"); pv.setAttribute("aria-live", "polite");
    pv.setAttribute("style", "margin-top:4px;padding:4px 8px;border-radius:6px;background:rgba(127,127,127,.08);line-height:2");
    function up() {
      var v = inp.value || "";
      while (pv.firstChild) pv.removeChild(pv.firstChild);
      if (!has(v)) { pv.hidden = true; return; }
      pv.hidden = false;
      var lb = document.createElement("span"); lb.className = "muted"; lb.textContent = "نمایشِ فرمول: "; pv.appendChild(lb);
      var tf = A.ASSIST && A.ASSIST.bidiNodes;
      toNodes(v, tf).forEach(function (n) { pv.appendChild(typeof n === "string" ? document.createTextNode(n) : n); });
    }
    inp.addEventListener("input", up); up();
    wrapEl.appendChild(pv);
    return wrapEl;
  }
  /* دستیار: «می‌توانی فرمول را میانِ $…$ بنویسی». AS.SYS سقفِ ۲۰ هزار دارد و پر است (AGENTS.md قاعدهٔ ۸) ⇒ با promptHooks، فقط در نوبتی
     که ریاضی در کار است: فرمول در پیامِ تازه یا چهار پیامِ اخیر، یا نمای مسئله/حل */
  var MATHY = /[0-9\u06F0-\u06F9]\s*[=+×÷^\/<>≤≥]|[A-Za-z]\s*[=^_\/]|[√∑∫π]|\$|\\[a-z]/;
  if (A.ASSIST) (A.ASSIST.promptHooks = A.ASSIST.promptHooks || []).push(function (s, msg) {
    var v = (A.state || {}).view || "", recent = ((s && s.msgs) || []).slice(-4).map(function (m) { return m.text || ""; }).join(" ");
    if (!(MATHY.test(String(msg || "")) || MATHY.test(recent) || /^(e_prob|lprob)$/.test(v))) return "";
    return "# فرمول\nاگر فرمول می‌نویسی، میانِ $…$ بنویس (مثلاً $\\frac{1}{n(n+1)}$، $x^2$، $a_n$، $\\sqrt{2}$، $\\sum_{k=1}^{n} k$)؛ صفحه آن را درست نمایش می‌دهد. عدد درونِ جمله را بی $ بنویس.";
  });
  A.MATH = { segments: segments, parse: function (src, ascii) { try { return parse(String(src), !!ascii); } catch (e) { if (e instanceof Bad) return null; throw e; } },
    nodes: toNodes, html: html, has: has, attach: attach };
})(APP);
