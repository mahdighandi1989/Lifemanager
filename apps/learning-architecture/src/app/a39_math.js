/* ===== نمایشِ درستِ فرمول (a39_math.js) — تورِ پولیا دورِ ۱۷، INF1 =====
   ۱۴ از ۳۸ سناریو عددی/فرمولی/برهانی بودند و گفت‌وگو و فیلدها فرمول را متنِ خام نشان می‌دادند («1/((n+1)(n+2))»).
   یک نمایش‌گرِ واحد، بی کتابخانهٔ بیرونی (بسته مستقل است): LaTeX ِ سبکِ درونِ $…$ یا \(…\) و ریاضیِ ASCII ِ کاربرِ فارسی‌نویس
   («1/((n+1)(n+2))»، «x^2+1»، «a_n»، «n(n+1)/2»، «√2») ⇒ MathML ِ بومی (MathML Core در مرورگرهای کنونی).
   • فقط تکه‌ای که آشکارا ریاضی است تبدیل می‌شود (نشانه‌اش: ^، _ پس از یک حرف، √/sqrt، \فرمان، یا «/» کنارِ پرانتز)؛ عددِ تنها
     درونِ جملهٔ فارسی («۳۰ پله»، «۴۰ درصد»)، تاریخ («۱۴۰۲/۰۵/۱۲»)، نشانی و نامِ_فایل متن می‌مانند.
   • ایمنی: درخت با createElementNS/createTextNode ساخته می‌شود — هیچ innerHTML ای از ورودی نیست؛ ورودیِ ناشناخته یا بدشکل
     (فرمانِ ناشناخته، پرانتزِ ناجفت، حرفِ فارسی بیرونِ \text) متنِ دست‌نخورده می‌ماند.
   • راست‌به‌چپ: هر <math> درونِ <bdi dir="ltr"> (unicode-bidi:isolate) می‌نشیند تا ترتیبِ جملهٔ فارسیِ دورش به هم نریزد.
   به کار می‌رود در: حبابِ «💬 دستیار» (a26، A.MATH.nodes) و پیش‌نمایشِ زیرِ صورت/گامِ «🔭 مسئلهٔ حل‌نشدهٔ خودم» (a38، A.MATH.attach).
   دورِ ۱۸ (DECISIONS_R18 RM2 a–c، RM3، INF2/3/8/9):
   • A.MATH.toPlain(متن) — برای چاه‌هایی که MathML نمی‌گیرند (<option>، title، toast، «امروز»، ایمیل): TeX و ریاضیِ ASCII ⇒ یونیکدِ خوانا
     (x²، a₁، (a+1)/(b−2)، √(x+1)، y → 0، …)؛ نثر (قیمتِ $، ایمیل، نشانی، نامِ_فایل) نویسه‌به‌نویسه همان می‌ماند.
   • نشانه‌هایی که مردم واقعاً تایپ می‌کنند: رقمِ فارسی و ٫ (همان‌طور که تایپ شده نمایش)، × ÷ ² ³ − ⇒ ≤ ≥ √، «…/⋯» درونِ رشته، و حرفِ فارسی
     فقط درونِ رشته‌ای که عملگر/رابطه و رقم دارد («ع+۶ = ع²»)؛ پرانتزهای (10/n)^(n/2)، زیرنویسِ چندحرفی (g_EE، g_PV-E، a_max)، dV/dt همه‌جا
     کسر، منفیِ یکانی بی فاصلهٔ دوتایی، «،» ِ پس از فرمول در همان خانهٔ بی‌شکست.
   • خطِ «# فرمول» ِ دستیار از محتوا (صورتِ مسئلهٔ در کار یا گفت‌وگوی اخیر)، نه از نما؛ زمینه است، نه پرسشِ دوم.
   • پیش‌نمایش زیرِ همهٔ فیلدهای متنیِ مسئلهٔ زنده (شناسهٔ lp…) و ورودیِ گفت‌وگو، با نوارِ «∑ فرمول» — با یک ناظرِ DOM (بی دست زدن به منطقِ a38/a26).
   • زیرِ پیامِ گفت‌وگو: جدولِ دوستونیِ عددی یا رشتهٔ عدد ⇒ نمودارِ خطیِ کوچکِ SVG؛ FEN ⇒ صفحهٔ ۸×۸ ِ یونیکد. همه با createElement/textContent. */
(function (A) {
  var NS = "http://www.w3.org/1998/Math/MathML";
  var RTL = /[֐-ٟ٪-ۯۺ-ࣿיִ-﷿ﹰ-﻿]/;
  var RTLW = /[\u0590-\u065F\u066A\u066C-\u06EF\u06FA-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;   // همان، جز «٫» (جداکنندهٔ اعشارِ فارسی بخشی از عدد است)
  var FAL = "\u0620-\u064A\u0671-\u06D3", FA1 = new RegExp("[" + FAL + "]"), FA2 = new RegExp("[" + FAL + "]{2,}");
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
  var USUB = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };   // دورِ ۱۹ (RN4d): «a₁ + a₂ + …»
  var AOPS = [["<=", "≤"], [">=", "≥"], ["!=", "≠"], ["->", "→"], ["=>", "⇒"], ["+-", "±"], ["...", "…"]];
  var OPCH = "+-−=<>≤≥≠×·⋅÷±∓→←↔⇒⇐⇔≈≡∼∈∉⊂⊆∪∩,;:!/%…⋯∘|*∣∖∠⊥∥°";
  var CLOSE = { "(": ")", "[": "]", "{": "}" };

  function Bad() { }   // ورودیِ ناشناخته ⇒ تکه متن می‌ماند
  function fail() { throw new Bad(); }

  /* ---------- نشانه‌ها ---------- */
  function lex(s, ascii, fa) {
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
      if (USUB[c]) { var sb = ""; while (i < n && USUB[s[i]]) sb += USUB[s[i++]]; t.push({ y: "usub", v: sb }); continue; }
      if (c === "√") { t.push({ y: "cmd", v: "sqrt" }); i++; continue; }
      if (c === "∑" || c === "∏" || c === "∫") { t.push({ y: "cmd", v: c === "∑" ? "sum" : c === "∏" ? "prod" : "int" }); i++; continue; }
      if (c === "^") { t.push({ y: "sup" }); i++; continue; }
      if (c === "_") {
        t.push({ y: "sub" }); i++;
        /* دورِ ۱۸ (B·D8 s20): زیرنویسِ ASCII یک نام است — «g_EE»، «a_max»، «g_PV-E» (خط‌تیرهٔ میانِ دو رشتهٔ حرف، بی فاصله، بخشی از نام است نه منها) */
        if (ascii && (m = /^(?:[A-Za-z]{2,}(?:-[A-Za-z]+)*|[A-Za-z](?:-[A-Za-z]+)+)/.exec(s.slice(i)))) { t.push({ y: "id", v: m[0] }); i += m[0].length; }
        continue;
      }
      if (c === "'" || c === "′") { t.push({ y: "prime" }); i++; continue; }
      if (c === "(" || c === "[" || c === "{") { t.push({ y: "open", v: c }); i++; continue; }
      if (c === ")" || c === "]" || c === "}") { t.push({ y: "close", v: c }); i++; continue; }
      if (ascii) { var hit = null; AOPS.forEach(function (p) { if (!hit && rest.indexOf(p[0]) === 0) hit = p; }); if (hit) { t.push({ y: "op", v: hit[1] }); i += hit[0].length; continue; } }
      if (OPCH.indexOf(c) >= 0) { t.push({ y: "op", v: c === "-" ? "−" : c === "*" || c === "·" ? "⋅" : c }); i++; continue; }
      if (c === "." && !ascii) { t.push({ y: "op", v: "." }); i++; continue; }
      if (fa && FA1.test(c)) { t.push({ y: "id", v: c }); i++; continue; }   // دورِ ۱۸ (RM2b، s36): حرفِ فارسی متغیر است — فقط در رشتهٔ عملگردارِ رقم‌دار (asciiSegs)
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

  function parse(src, ascii, fa) {
    var T = lex(src, ascii, fa), i = 0;
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
      while (peek() && (peek().y === "sup" || peek().y === "sub" || peek().y === "usup" || peek().y === "usub")) {
        var k = next();
        if (k.y === "usub") { if (sub) fail(); sub = E("mn", [k.v]); continue; }
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
      /* دورِ ۱۸ (B·D10 s18): منفی/مثبتِ یکانی (آغازِ گروه یا پس از عملگرِ دیگر، «= −5») پیشوند است و فاصلهٔ عملگرِ دوتایی نمی‌گیرد */
      items.forEach(function (it, j) {
        if (it.k === "op" && it.n.localName === "mo" && /^[−+±∓]$/.test(it.n.textContent) && (j === 0 || items[j - 1].k === "op")) {
          it.n.setAttribute("form", "prefix"); it.n.setAttribute("lspace", "0"); it.n.setAttribute("rspace", "0");
        }
      });
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
  var MC = "A-Za-z0-9۰-۹٠-٩٫α-ωΑ-Ω∞π√∑∏∫^_()\\[\\]{}+\\-−=<>≤≥≠×·⋅÷±→⇒≈\\/*!'′.,|²³¹⁰⁴⁵⁶⁷⁸⁹ⁿ%\\\\:…⋯₀-₉";
  var MATHCH = new RegExp("^[" + MC + "]+$"), FACH = new RegExp("^[" + MC + FAL + "]+$");
  var OPW = /^[+\-−=<>≤≥≠×÷·⋅⇒→±\/^*]+$/;   // واژه‌ای که فقط عملگر/رابطه است
  var REL = /<=|>=|!=|=>|->|[=<>≤≥≠⇒⇔≈→]/g;
  var OPND = "A-Za-z0-9۰-۹٠-٩)\\]π" + FAL, OPND2 = "A-Za-z0-9۰-۹٠-٩(√π" + FAL;
  var ARITH = new RegExp("[" + OPND + "²³ⁿ]\\s*[+\\-−*·⋅\\/×÷^]\\s*[" + OPND2 + "−\\-]");
  var TIMES = new RegExp("[" + OPND + "²³₀-₉]\\s*[×÷]\\s*[" + OPND2 + "−\\-]|[" + OPND + "²³₀-₉][·⋅][" + OPND2 + "]");   // «·» فقط چسبیده («n·ln»، «1·2·3»)؛ «۵ · ۳» ِ جداکننده نه
  /* دورِ ۱۹ (RN4d، D·6 s31): ≈ میانِ دو عملوند («n≈3.7»، «e^x ≈ 1 + x»)، تابعِ نام‌دار با آرگومان («ln(10/n)»، «exp(-t/2)»، «sin x»؛ «فایل log» نه)،
     و حسابِ حرفِ لاتینِ تک با رقم یا اندیس («x+۴+۱+۲»، «a₁ + a₂ + …»؛ «Wi-Fi»، «A-B» نه) */
  var APPROX = new RegExp("[" + OPND + "²³₀-₉]\\s*≈\\s*[" + OPND2 + "−\\-]");
  var FNAPP = /(?:^|[^A-Za-z])(?:arcsin|arccos|arctan|sinh|cosh|tanh|sin|cos|tan|cot|sec|csc|log|ln|exp)(?:[²³₀-₉]*\s*\(|[²³₀-₉]*\s*[0-9۰-۹٠-٩]|[²³₀-₉]*\s*[A-Za-zα-ωπ](?![A-Za-z]))/;
  var LARITH = /(?:^|[^A-Za-z])[A-Za-z][₀-₉²³]*\s*[+\-−*·⋅×÷]\s*[A-Za-z0-9۰-۹٠-٩(](?![A-Za-z])|[0-9۰-۹٠-٩)₀-₉]\s*[+\-−*·⋅×÷]\s*[A-Za-z](?![A-Za-z])/;
  var SUPAFTER = new RegExp("[" + OPND + "α-ω][²³¹⁰⁴⁵⁶⁷⁸⁹ⁿ]");
  var COEF = new RegExp("[0-9۰-۹٠-٩][A-Za-z" + FAL + "]");
  function trigger(s) {
    if (/\^\s*[\w({\-۰-۹٠-٩]/.test(s) || /(?:^|[^A-Za-z0-9])[A-Za-zα-ωΑ-Ω]_(?:[A-Za-z0-9۰-۹٠-٩]|[({])/.test(s) ||
      /√|\bsqrt\s*\(/.test(s) || /\\[A-Za-z]+/.test(s) || /[\w)\]π۰-۹٠-٩]\s*\/\s*\(/.test(s) || /\)\s*\/\s*[\w(π۰-۹٠-٩]/.test(s) || /[∑∫∏]/.test(s)) return true;
    /* دورِ ۱۸ (RM2b/c): نشانه‌های تایپ‌شده — توانِ یونیکد پس از عملوند (x²، ع²)، ضرب/تقسیمِ ×÷ میانِ دو عملوند، مشتقِ dV/dt (همه‌جا یکسان، B·D10)،
       کسرِ عددیِ تنها (۳/۸ — تاریخِ ۱۴۰۵/۰۷/۲۵ با دو «/» نیست)، و رابطه با حساب یا رابطهٔ دوم یا ضریب («x+y+z=10»، «x ≤ ۵ ⇒ ۲x ≤ ۱۰»، «y = 2x»).
       «n = ۳۰» (یک رابطهٔ تنها، بی حساب)، تلفن، بازهٔ صفحه، ساعت و نسخه ریاضی نیستند. */
    if (SUPAFTER.test(s) || TIMES.test(s) || APPROX.test(s) || FNAPP.test(s)) return true;
    if (LARITH.test(s) && /[0-9۰-۹٠-٩₀-₉²³]/.test(s)) return true;
    if (/(?:^|[^A-Za-z])[d∂][A-Za-zα-ω]\s*\/\s*[d∂][A-Za-zα-ω](?![A-Za-z])/.test(s)) return true;
    if (/(?:^|[^0-9۰-۹٠-٩\/.٫])[0-9۰-۹٠-٩]+\s*\/\s*[0-9۰-۹٠-٩]+(?![0-9۰-۹٠-٩\/.٫:])/.test(s) && !/\d\s*:\s*\d/.test(s)) return true;
    var rel = (s.match(REL) || []).length;
    return rel > 0 && (ARITH.test(s) || rel > 1 || COEF.test(s));
  }
  var CODE = /^(?:[A-Z]+|[A-Za-z]{2,})-[0-9۰-۹٠-٩]+(?:[\/.\-:][0-9۰-۹٠-٩]+)*$/;
  function mathyWord(w) {
    if (!w || RTLW.test(w) || /:\/\/|^www\.|@/.test(w) || !MATHCH.test(w)) return false;
    if (CODE.test(w)) return false;   // دورِ ۱۹ (RN4b، C·X6 s26): کد، نه فرمول — «TR-2026/10»، «A-12»، «ISO-9001»
    // واژهٔ لاتینِ سه‌حرفی و بیشتر (جز نامِ تابع و \فرمان) یعنی متن است، نه فرمول («src=x»، «onerror=…»)
    var words = w.replace(/\\[A-Za-z]+/g, " ").match(/[A-Za-z]{3,}/g) || [];
    if (words.some(function (x) { return FUNCS.indexOf(x) < 0 && x !== "sqrt"; })) return false;
    var letters = w.replace(/[^A-Za-z]/g, "");
    if (/[0-9۰-۹٠-٩^_()\[\]{}+\-−=<>≤≥≠×·⋅÷±→⇒≈\/*!√∑∫∏π²³ⁿ\\…⋯]/.test(w)) return true;
    return letters.length <= 2 || FUNCS.indexOf(w) >= 0;
  }
  /* واژهٔ حرف‌فارسی‌دار که می‌تواند بخشی از فرمول باشد: هر حرفِ فارسی تنهاست (نه «حجم»، نه «دو-سه») و بقیه نشانهٔ ریاضی‌اند */
  function faWord(w) {
    if (!w || !FA1.test(w) || FA2.test(w) || !FACH.test(w) || w === "و") return 0;
    if (w.length === 1) return 1;
    return /[0-9۰-۹٠-٩+\-−=<>≤≥≠×÷·⋅^\/²³(]/.test(w) ? 2 : 0;
  }
  function count(s, ch) { return s.split(ch).length - 1; }
  function depth(s) { var d = 0, lo = 0; for (var k = 0; k < s.length; k++) { if (s[k] === "(") d++; else if (s[k] === ")") { d--; if (d < lo) lo = d; } } return { d: d, lo: lo }; }
  /* دورِ ۱۹ (RN4a، D·2 s37): عددِ تنهای چسبیده به واژهٔ فارسی که رابطه پس از آن می‌آید از آنِ جمله است — «بر ۸ ⇒ y=۲»: «۸» با «بر» می‌ماند
     (وگرنه جزیرهٔ LTR از «۸» آغاز می‌شود و در خطِ راست‌به‌چپ «بر ۳ ⇒ x=۲» به «بر ۲ = x ⇒ ۳» وارونه دیده می‌شود). */
  var LONENUM = /^[0-9۰-۹٠-٩]+(?:[.٫][0-9۰-۹٠-٩]+)?\s*(?:<=|>=|!=|=>|->|[=<>≤≥≠⇒⇔≈→])\s*/;
  /* دورِ ۱۹ (RN4a، بانکِ RN4.run): رابطهٔ تنها با متغیرِ لاتین («x=۲»، «y=۶»، «xy=۱۰۰») فقط در پیامی ریاضی است که شاهدِ دیگری از ریاضی دارد
     (فرمولِ دیگری در همان پیام، یا ضریبِ چسبیده «۴۷y»)؛ «n = ۳۰ و k = 2» ِ تنها متن می‌ماند (تصمیمِ دورِ ۱۸). */
  var WEAKREL = /(?:^|[^A-Za-z])[A-Za-z]{1,2}[₀-₉²³]*\s*(?:<=|>=|!=|[=<>≤≥≠≈])|(?:<=|>=|!=|[=<>≤≥≠≈])\s*[A-Za-z](?![A-Za-z]{2})/;
  var COEFW = /(?:^|[\s(«])[0-9۰-۹٠-٩]+[a-z](?=$|[\s).,،:؛!?؟»])/;
  function tryAscii(run, fa, faBefore, weakOK) {   // ⇒ [پیش، فرمول، پس، منبع] یا null
    var lead = (run.match(/^[«"“(]+/) || [""])[0], trail = (run.match(/[.,،:؛!?؟…»"”)]+$/) || [""])[0];
    var core = run.slice(lead.length, run.length - trail.length);
    /* دورِ ۱۹ (RN4c، C·X5 s25): «…» پس از عملگر بخشی از فرمول است («۱/(1·2·3) + ۱/(2·3·4) + …»)، حتی در پایانِ رشته پیش از متنِ فارسی */
    var el = /^(?:…|⋯|\.\.\.)/.exec(trail);
    if (el && /[+\-−=*·⋅×÷,<>≤≥]\s*$/.test(core)) { core += el[0]; trail = trail.slice(el[0].length); }
    if (faBefore && !lead) { var ln = LONENUM.exec(core); if (ln) { lead = ln[0]; core = core.slice(ln[0].length); } }
    /* دورِ ۱۸ (D·D5 s31): پرانتزِ دو سر به فرمول برمی‌گردد هر گاه فرمول بی آن ناجفت است — «(10/n)^(n/2)» (پیش‌تر: «10/n)^(n/2») */
    for (var guard = 0; guard < 8; guard++) {
      var dp = depth(core);
      if (dp.lo < 0 && lead && lead[lead.length - 1] === "(") { core = "(" + core; lead = lead.slice(0, -1); continue; }
      if (dp.d > 0 && trail && trail[0] === ")") { core += ")"; trail = trail.slice(1); continue; }
      break;
    }
    /* دورِ ۱۸ (D·D8 s38): رابطهٔ تنهای دو سرِ رشته («حجم = ۲ × …») از آنِ جملهٔ فارسی است، نه فرمول — وگرنه در خطِ راست‌به‌چپ کنارِ «!» ِ پایانِ
       جمله می‌نشیند و «!=» خوانده می‌شود */
    var lr = /^(?:=|≤|≥|<|>|≠|⇒|→)\s+/.exec(core); if (lr) { lead += lr[0]; core = core.slice(lr[0].length); }
    var tr = /\s+(?:=|≤|≥|<|>|≠|⇒|→)$/.exec(core); if (tr) { trail = tr[0] + trail; core = core.slice(0, core.length - tr[0].length); }
    if (!core || !/[A-Za-z0-9۰-۹٠-٩]/.test(core) || !(trigger(core) || (weakOK && !fa && WEAKREL.test(core)))) return null;
    if (fa && !(/[0-9۰-۹٠-٩]/.test(core) && /[+\-−=<>≤≥≠×÷·⋅\/^⇒²³]/.test(core))) return null;   // حرفِ فارسی فقط در رشتهٔ عملگردارِ رقم‌دار
    try { return [lead, parse(core, !/\\[A-Za-z]/.test(core), fa), trail, core]; } catch (e) { if (e instanceof Bad) return null; throw e; }
  }
  function asciiSegs(text, out, weakOK) {
    var parts = String(text).split(/(\s+)/).filter(function (x) { return x !== ""; });
    var bareOf = function (p) { return p.replace(/^[«"“(]+|[.,،:؛!?؟…»"”)]+$/g, ""); };
    // دسته: M ریاضیِ لاتین/رقم، P واژهٔ حرف‌فارسی‌دار، D «…/⋯» ِ تنها، s فاصله، T متن
    var cls = parts.map(function (p) {
      if (/^\s+$/.test(p)) return "s";
      if (/^(?:…|⋯|\.\.\.)[»"”).,،:؛!?؟]*$/.test(p)) return "D";   // دورِ ۱۹ (C·X5): «…»» ِ پایانِ نقل هم
      var bare = bareOf(p);
      if (mathyWord(bare)) return "M";
      var f = faWord(bare); return f === 2 ? "P" : f === 1 ? "P1" : "T";
    });
    var nb = function (k, dir) { for (k += dir; k >= 0 && k < parts.length; k += dir) if (cls[k] !== "s") return k; return -1; };
    cls = cls.map(function (c, k) {   // حرفِ فارسیِ تنها فقط میانِ دو عملگر (یا عملگر و لبه) متغیر است: «ع² − ع − ۶»؛ «الف و ب» نه
      if (c !== "P1") return c;
      var a = nb(k, -1), z = nb(k, 1), okA = a < 0 || OPW.test(bareOf(parts[a])), okZ = z < 0 || OPW.test(bareOf(parts[z]));
      return okA && okZ && (a >= 0 || z >= 0) ? "P" : "T";
    });
    var buf = "", run = [], fa = false, faB = false;
    function flush() {
      if (!run.length) return;
      var ws = /^\s+$/.test(run[run.length - 1]) ? run.pop() : "";
      flushRun(); buf += ws;
    }
    function flushRun() {
      var r = run.join(""), f = fa, fb = faB; run = []; fa = false; faB = false;
      var got = tryAscii(r, f, fb, weakOK);
      if (!got) { buf += r; return; }
      buf += got[0]; if (buf) out.push({ t: buf }); buf = got[2];
      out.push({ m: got[1], src: got[3] });
    }
    parts.forEach(function (p, k) {
      var c = cls[k];
      if (c === "s") { if (run.length) run.push(p); else buf += p; return; }
      if (c === "D" && run.length) { run.push(p); return; }   // «…» درونِ رشته (C·W1 s25) — رشته را نمی‌بُرد
      /* دورِ ۲۰ (RO9، D·14 s37): «(۳۵۲)» ِ تنها پس از فاصله برچسب است، نه ضریب — «y=۲ (۳۵۲)» ⇒ فرمولِ «y = ۲» و متنِ «(۳۵۲)» (نه «y = ۲(۳۵۲)») */
      if (c === "M" && run.length && /^\s+$/.test(parts[k - 1] || "") && /^\([0-9۰-۹٠-٩]+(?:[.٫][0-9۰-۹٠-٩]+)?\)[.,،:؛!?؟…»"”]*$/.test(p)) { flush(); buf += p; return; }
      if (c === "M" || c === "P") {
        if (/^[«"“]/.test(p) && run.length) flush();
        if (!run.length) { var pv = nb(k, -1); faB = pv >= 0 && cls[pv] === "T" && RTLW.test(parts[pv]) && !/[.,،:؛!?؟…»"”)]$/.test(parts[pv]); }
        run.push(p); if (c === "P") fa = true;
        if (/[.,،:؛!?؟…»"”]$/.test(p)) flush();
        return;
      }
      flush(); buf += p;
    });
    flush();
    if (buf) out.push({ t: buf });
  }
  var EXPL = /\$\$([^$]+?)\$\$|\$(?![\s$])([^$\n]*?[^\s$\\])\$(?!\d)|\\\(([\s\S]+?)\\\)/g;
  function segments(text, weak) {
    var s = String(text == null ? "" : text), out = [], last = 0, m;
    if (weak == null) { var first = segments(s, false); weak = first.some(function (x) { return !!x.m; }) || COEFW.test(s); if (!weak) return first; }
    EXPL.lastIndex = 0;
    while ((m = EXPL.exec(s))) {
      var tex = m[1] != null ? m[1] : m[2] != null ? m[2] : m[3], node = null;
      try { node = parse(tex.trim(), false); } catch (e) { if (!(e instanceof Bad)) throw e; }
      if (!node) continue;   // بدشکل ⇒ همان متن (با $ ها) در تکهٔ بعدی می‌ماند
      if (m.index > last) asciiSegs(s.slice(last, m.index), out, weak);
      out.push({ m: node, src: tex.trim(), tex: true });
      last = EXPL.lastIndex;
    }
    if (last < s.length) asciiSegs(s.slice(last), out, weak);
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
  /* متن ⇒ آرایهٔ گره‌ها؛ تکه‌های متنی از textFn می‌گذرند (مثلاً bidiNodes ِ دستیار)، بی آن رشتهٔ خام.
     دورِ ۱۸ (B·D10 s18): نشانه‌گذاریِ چسبیده به فرمول («dy/dt،») با خودِ فرمول در یک خانهٔ white-space:nowrap — خطِ تازه هرگز با «،» آغاز نمی‌شود */
  function toNodes(text, textFn) {
    var out = [], segs = segments(text);
    for (var k = 0; k < segs.length; k++) {
      var x = segs[k];
      if (x.m) {
        var w = wrap(x), nx = segs[k + 1], pm = nx && nx.t != null ? /^[،,.؛;:!?؟]+/.exec(nx.t) : null;
        if (pm) {
          var box = document.createElement("span"); box.className = "mx-nb"; box.setAttribute("style", "white-space:nowrap");
          box.appendChild(w); box.appendChild(document.createTextNode(pm[0])); out.push(box); nx.t = nx.t.slice(pm[0].length);
        } else out.push(w);
        continue;
      }
      if (!x.t) continue;
      var r = textFn ? textFn(x.t) : x.t;
      if (Array.isArray(r)) r.forEach(function (y) { out.push(y); }); else out.push(r);
    }
    return out;
  }
  function has(text) { return segments(text).some(function (x) { return !!x.m; }); }
  function html(text) {
    var d = document.createElement("div");
    toNodes(text).forEach(function (n) { d.appendChild(typeof n === "string" ? document.createTextNode(n) : n); });
    return d.innerHTML;
  }

  /* ---------- toPlain (INF2، RM2a): فرمول برای چاه‌های متنِ ساده ---------- */
  var SUPM = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "-": "⁻", "−": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",
    n: "ⁿ", i: "ⁱ", a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ", o: "ᵒ", p: "ᵖ", r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ" };
  var SUBM = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉", "+": "₊", "-": "₋", "−": "₋", "=": "₌", "(": "₍", ")": "₎",
    a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ", n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ" };
  var SCR = Object.keys(SUPM).map(function (k) { return SUPM[k]; }).concat(Object.keys(SUBM).map(function (k) { return SUBM[k]; })).join("");
  var SPDROP = new RegExp("([" + SCR + "]) +(?=[A-Za-z0-9α-ωΑ-Ω(√])", "g");   // «a^2 b» ⇒ «a²b» (فاصلهٔ TeX میانِ دو عامل معنا ندارد)
  var ACCP = { overline: "̅", bar: "̅", hat: "̂", vec: "⃗", tilde: "̃", dot: "̇" };
  var ATOM = /^(?:[A-Za-zα-ωΑ-Ωπ∞]|[0-9۰-۹٠-٩]+(?:[.٫][0-9۰-۹٠-٩]+)?)$/;
  function topHas(t, re) { var d = 0; for (var k = 0; k < t.length; k++) { var c = t[k]; if (c === "(" || c === "[" || c === "{") d++; else if (c === ")" || c === "]" || c === "}") d--; else if (!d && re.test(c)) return true; } return false; }
  function wrapN(t) { var b = /^[−-]/.test(t) ? t.slice(1) : t; return topHas(b, /[+\-−=<>≤≥≠±∓,]/) ? "(" + t + ")" : t; }
  function wrapD(t) {
    if (ATOM.test(t) || /^[A-Za-zα-ω]{1,2}$/.test(t) || /^[d∂][A-Za-zα-ω]$/.test(t) || new RegExp("^[A-Za-z0-9α-ω][" + SCR + "]+$").test(t)) return t;
    return "(" + t + ")";
  }
  function tp(src, ascii) {
    var s = String(src), i = 0, n = s.length;
    function skipSp() { while (i < n && /\s/.test(s[i])) i++; }
    function group(close) { var o = ""; while (i < n) { if (s[i] === close) { i++; break; } o += atom(); } return o.replace(SPDROP, "$1"); }
    function arg(isSub) {
      skipSp(); var c = s[i], m, r = s.slice(i);
      if (c === "{") { i++; return { t: group("}") }; }
      if (ascii && c === "(") { i++; return { t: group(")") }; }
      if (c === "\\") return { t: cmd() };
      if (ascii) {
        if ((m = /^[0-9۰-۹٠-٩]+(?:[.٫][0-9۰-۹٠-٩]+)?/.exec(r))) { i += m[0].length; return { t: m[0] }; }
        if (c === "-" || c === "−" || c === "+") { i++; var a = arg(isSub); return { t: (c === "+" ? "+" : "−") + a.t }; }
        if (isSub && (m = /^[A-Za-z]+(?:-[A-Za-z]+)*/.exec(r))) { i += m[0].length; return { t: m[0] }; }
      }
      i++; return { t: c == null ? "" : c };
    }
    function script(a, sup) {
      var M = sup ? SUPM : SUBM, t = a.t, o = "";
      for (var k = 0; k < t.length; k++) { var ch = M[t[k]]; if (!ch) { o = null; break; } o += ch; }
      if (o) return o;
      var simple = /^[A-Za-z0-9۰-۹٠-٩α-ωΑ-Ωؠ-ۓ]+(?:-[A-Za-z]+)*$/.test(t) && (!sup || t.length === 1 || /^[0-9۰-۹٠-٩]+$/.test(t));
      return (sup ? "^" : "_") + (simple ? t : "(" + t + ")");
    }
    function root(t) { return ATOM.test(t) ? t : "(" + t + ")"; }
    function cmd() {
      var m = /^\\([A-Za-z]+)/.exec(s.slice(i));
      if (!m) { var ch = s[i + 1]; i += 2; return ch == null ? "" : ch === "," || ch === ";" || ch === ":" || ch === " " || ch === "\\" ? " " : ch === "!" ? "" : ch; }
      var c = m[1]; i += m[0].length;
      if (GREEK[c]) { if (/^[A-Za-z0-9]/.test(s.slice(i).replace(/^ +/, "")) && / /.test(s[i] || "")) skipSp(); return GREEK[c]; }
      if (c === "cdot") return "·";
      if (OPS[c]) return OPS[c];
      if (BIG[c]) return BIG[c];
      if (FUNCS.indexOf(c) >= 0) return c;
      if (c === "frac" || c === "dfrac" || c === "tfrac") { var a = arg(), b = arg(); return wrapN(a.t) + "/" + wrapD(b.t); }
      if (c === "binom") { var p = arg(), q = arg(); return "C(" + p.t + "," + q.t + ")"; }
      if (c === "sqrt") { skipSp(); var ix = null; if (s[i] === "[") { i++; ix = group("]"); } var r = arg().t; return (ix === "3" ? "∛" : ix === "4" ? "∜" : ix ? script({ t: ix }, true) + "√" : "√") + root(r); }
      if (/^(text|mathrm|textrm|mbox|operatorname)$/.test(c)) return arg().t;
      if (c === "mathbb") { var bb = arg().t; return BB[bb] || bb; }
      if (ACCP[c]) return arg().t + ACCP[c];
      if (c === "left" || c === "right") { skipSp(); var d = s[i]; if (d === "\\") { var d2 = s[i + 1]; i += 2; return d2 === "{" || d2 === "}" ? d2 : d2 === "|" ? "‖" : ""; } i++; return d === "." || d == null ? "" : d; }
      if (c === "quad" || c === "qquad") return " ";
      return s[i] === "{" ? c + "(" + arg().t + ")" : c;   // فرمانِ ناشناخته: نامش، بی «\»
    }
    function atom() {
      var c = s[i], r = s.slice(i), m;
      if (c === "\\") return cmd();
      if (c === "{") { i++; return group("}"); }
      if (c === "^" || c === "_") { i++; return script(arg(c === "_"), c === "^"); }
      if (ascii) {
        if ((m = /^(<=|>=|!=|->|=>|\+-)/.exec(r))) { i += 2; return { "<=": "≤", ">=": "≥", "!=": "≠", "->": "→", "=>": "⇒", "+-": "±" }[m[1]]; }
        if (/^sqrt\s*\(/.test(r)) { i += 4; return "√" + root(arg().t); }
        if (/^pi(?![A-Za-z])/.test(r) && !/[A-Za-z]$/.test(s.slice(0, i))) { i += 2; return "π"; }
        if (c === "*") { i++; return "·"; }
      }
      i++; return c === "-" ? "−" : c;
    }
    var out = ""; while (i < n) out += atom();
    return out.replace(SPDROP, "$1");
  }
  function plainAscii(t, weak) {
    var segs = []; asciiSegs(t, segs, weak);
    return segs.map(function (x) { return x.m ? tp(x.src, !/\\[A-Za-z]/.test(x.src)) : x.t; }).join("");
  }
  function toPlain(text) {
    if (text == null) return "";
    var s = String(text), out = "", last = 0, m, re = new RegExp(EXPL.source, "g"), wk = has(s) || COEFW.test(s);
    while ((m = re.exec(s))) {
      var tex = (m[1] != null ? m[1] : m[2] != null ? m[2] : m[3]).trim(), ok = false;
      try { ok = !!parse(tex, false); } catch (e) { if (!(e instanceof Bad)) throw e; }
      // TeX ِ بدشکل که آشکارا TeX است (فرمانِ \، ^، _) و حرفِ فارسیِ بیرونِ \text ندارد ⇒ باز هم بی $ و بی \ (هرگز TeX ِ خام در <option>)
      if (!ok && !(/\\[A-Za-z]|[\^_]/.test(tex) && !RTL.test(tex.replace(/\\(?:text|mathrm|textrm|mbox|operatorname)\s*\{[^}]*\}/g, "")))) continue;
      out += plainAscii(s.slice(last, m.index), wk) + tp(tex, false); last = re.lastIndex;
    }
    return out + plainAscii(s.slice(last), wk);
  }

  /* ---------- پیش‌نمایشِ زنده و نوارِ «∑ فرمول» (INF3) ---------- */
  function attachInput(inp, host) {
    if (!inp || inp.getAttribute("data-mx")) return null;
    inp.setAttribute("data-mx", "1");
    var pv = document.createElement("div");
    pv.className = "mx-prev small"; pv.setAttribute("dir", "rtl"); pv.setAttribute("aria-live", "polite");
    if (inp.id) pv.setAttribute("data-for", inp.id);
    pv.setAttribute("style", "margin-top:4px;padding:4px 8px;border-radius:6px;background:rgba(127,127,127,.08);line-height:2;white-space:normal");
    function up() {
      var v = inp.value || "";
      while (pv.firstChild) pv.removeChild(pv.firstChild);
      typeDir(inp, v);
      if (!has(v)) { pv.hidden = true; return; }
      pv.hidden = false;
      var lb = document.createElement("span"); lb.className = "muted"; lb.textContent = "نمایشِ فرمول: "; pv.appendChild(lb);
      var tf = A.ASSIST && A.ASSIST.bidiNodes;
      toNodes(v, tf).forEach(function (n) { pv.appendChild(typeof n === "string" ? document.createTextNode(n) : n); });
    }
    inp.addEventListener("input", up); inp.addEventListener("change", up); up();
    if (host) host.appendChild(pv); else anchorOf(inp).insertAdjacentElement("afterend", pv);
    return pv;
  }
  /* دورِ ۱۹ (INF12، C s25): فیلدی که محتوایش ریاضی است چپ‌به‌راست تایپ می‌شود — هر سطر جهتِ خودش را از نخستین نویسهٔ قوی‌اش می‌گیرد
     (unicode-bidi:plaintext؛ سطرِ بی‌حرف مثلِ «۱/(1·2·3) + …» چپ‌به‌راست)، پس فرمولِ تایپ‌شده در خودِ فیلد به هم نمی‌ریزد؛ نثرِ فارسی همان راست‌به‌چپ. */
  function typeDir(inp, v) {
    var on = has(v);
    if (on === (inp.getAttribute("data-mxdir") === "1")) return;
    if (on) { inp.setAttribute("data-mxdir", "1"); inp.style.unicodeBidi = "plaintext"; inp.style.textAlign = "start"; }
    else { inp.removeAttribute("data-mxdir"); inp.style.unicodeBidi = ""; inp.style.textAlign = ""; }
  }
  function anchorOf(inp) { var par = inp.parentElement; return par && par.classList && (par.classList.contains("as-row") || par.classList.contains("row")) ? par : inp; }
  /* پیش‌نمایشِ زیرِ یک فیلد (فراخوانِ صریحِ a38 برای #lpNewS و #lpStep — همان رفتار) */
  function attach(wrapEl) {
    var inp = wrapEl && wrapEl.querySelector && wrapEl.querySelector("textarea,input");
    if (inp) attachInput(inp, wrapEl);
    return wrapEl;
  }
  function eligible(e) {
    if (!e || !e.tagName) return false;
    if (e.tagName === "TEXTAREA") return /^lp/.test(e.id || "") || (e.classList && e.classList.contains("as-in"));
    return e.tagName === "INPUT" && /^lp/.test(e.id || "") && (!e.getAttribute("type") || e.type === "text" || e.type === "search");
  }
  var SYMS = [["sq", "x²", "²", "", "توانِ دو"], ["sqrt", "√", "√(", ")", "رادیکال"], ["div", "÷", "÷", "", "تقسیم"], ["times", "×", "×", "", "ضرب"],
    ["le", "≤", "≤", "", "کوچک‌تر یا مساوی"], ["ge", "≥", "≥", "", "بزرگ‌تر یا مساوی"], ["imp", "⇒", "⇒", "", "نتیجه می‌دهد"], ["sub", "xₙ", "_", "", "زیرنویس"], ["frac", "a/b", "(", ")/()", "کسر"]];
  var BAR = null, barFor = null, barOpen = false;
  function insertAt(inp, before, after) {
    var v = inp.value || "", a = inp.selectionStart == null ? v.length : inp.selectionStart, z = inp.selectionEnd == null ? a : inp.selectionEnd;
    inp.value = v.slice(0, a) + before + v.slice(a, z) + after + v.slice(z);
    var c = a + before.length + (z - a);
    try { inp.setSelectionRange(c, c); } catch (e) { }
    inp.dispatchEvent(new Event("input", { bubbles: true }));
  }
  function bar() {
    if (BAR) return BAR;
    var b = document.createElement("div"); b.className = "mx-bar small"; b.setAttribute("dir", "rtl");
    b.setAttribute("style", "display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-top:3px;white-space:normal");
    var tog = document.createElement("button"); tog.type = "button"; tog.className = "linkish small mx-bar-tog"; tog.textContent = "∑ فرمول";
    tog.setAttribute("aria-label", "نوارِ نشانه‌های فرمول"); tog.setAttribute("aria-expanded", "false");
    var syms = document.createElement("span"); syms.className = "mx-syms"; syms.setAttribute("style", "display:inline-flex;flex-wrap:wrap;gap:3px"); syms.hidden = true;
    SYMS.forEach(function (k) {
      var x = document.createElement("button"); x.type = "button"; x.className = "btn ghost sm mx-sym"; x.textContent = k[1];
      x.setAttribute("data-k", k[0]); x.setAttribute("data-ins", k[2] + k[3]); x.setAttribute("aria-label", k[4]); x.title = k[4];
      x.addEventListener("click", function () { if (barFor && document.contains(barFor)) { insertAt(barFor, k[2], k[3]); barFor.focus(); } });
      syms.appendChild(x);
    });
    tog.addEventListener("click", function () { barOpen = !barOpen; syms.hidden = !barOpen; tog.setAttribute("aria-expanded", String(barOpen)); if (barFor && document.contains(barFor)) barFor.focus(); });
    b.addEventListener("mousedown", function (e) { if (e.target && e.target.closest && e.target.closest("button")) e.preventDefault(); });   // فوکوس و مکان‌نما در فیلد می‌مانند
    b.appendChild(tog); b.appendChild(syms); BAR = b; return b;
  }
  function placeBar(inp) {
    var b = bar(); barFor = inp;
    var syms = b.querySelector(".mx-syms"), tog = b.querySelector(".mx-bar-tog"); syms.hidden = !barOpen; tog.setAttribute("aria-expanded", String(barOpen));
    var an = anchorOf(inp); if (an.nextSibling !== b) an.insertAdjacentElement("afterend", b);
  }

  /* ---------- زیرِ پیامِ گفت‌وگو: نمودارِ کوچک (INF8) و صفحهٔ شطرنج (INF9) ---------- */
  var NUMRE = /[-−]?[0-9۰-۹٠-٩]+(?:[.٫][0-9۰-۹٠-٩]+)?/g;
  function num(t) { return parseFloat(String(t).replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 0x6F0); }).replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x660); }).replace("٫", ".").replace("−", "-")); }
  function msgSrc(node) {   // متنِ پیام همان‌طور که نوشته شد: فرمولِ نمایش‌داده با data-src ِ خودش
    var o = "";
    node.childNodes.forEach(function (c) {
      if (c.nodeType === 3) o += c.textContent;
      else if (c.nodeType === 1) { if (c.localName === "bdi" && c.classList.contains("mx")) o += c.getAttribute("data-src") || ""; else if (c.localName === "br") o += "\n"; else o += msgSrc(c); }
    });
    return o;
  }
  var FADIG = /[۰-۹٠-٩]/;
  function faDigits(s) { return String(s).replace(/[0-9]/g, function (d) { return String.fromCharCode(0x6F0 + +d); }); }
  /* دورِ ۱۹ (INF14، A s07، B s20): نامِ محورها از واژه‌های خودِ پیام — سرِ جدول («ساعت | ارتفاع»)، سرِ رشته پیش از «:» («وزن‌هام این هفته:»
     ⇒ «وزن‌هام»)، یا واحدِ پس از رشته («… ۱۰ ساعت» ⇒ «ساعت»، «… ۱۷ سانت» ⇒ «(سانت)»). واژهٔ ربط یا عدد نام نمی‌شود. */
  var STOPW = /^(?:و|یا|رو|را|تا|با|از|به|در|که|هم|هست|است|بود|شد|شدن|شده|and|or|the|to)$/;
  function cleanName(w) { w = String(w || "").replace(/^[\s«"“(]+|[\s.,،:؛!?؟»"”)]+$/g, ""); return w && !STOPW.test(w) && !/^[-−]?[0-9۰-۹٠-٩.٫]+$/.test(w) && w.length <= 24 ? w : ""; }
  function headCells(l) {
    var c = String(l || "").replace(/^\s*\|/, "").replace(/\|\s*$/, "").split(/\s*\|\s*|\t+|\s{2,}/).map(function (x) { return x.trim(); }).filter(Boolean);
    return c.length === 2 && c.every(function (x) { return !/^[-−]?[0-9۰-۹٠-٩.٫]+$/.test(x) && x.length <= 30; }) ? c : null;
  }
  function groupName(t, a, z) {   // a = آغازِ نخستین عدد، z = پایانِ آخرین عدد
    var before = t.slice(0, a), cut = Math.max(before.lastIndexOf("\n"), before.search(/[.!?؟][^.!?؟]*$/));
    var clause = before.slice(cut + 1), head = "";
    if (/:\s*$/.test(clause)) head = cleanName((clause.replace(/:\s*$/, "").trim().split(/\s+/) || [])[0]);
    var unit = cleanName((/^\s*([^\s.,،:؛!?؟0-9۰-۹٠-٩]+)/.exec(t.slice(z)) || [])[1]);
    return head ? head + (unit ? " (" + unit + ")" : "") : unit;
  }
  function series(t) {
    // ۱) جدولِ دوستونی: دست‌کم سه سطرِ پیاپی با دقیقاً دو عدد (و جز جداکننده/واحدِ کوتاه چیزی نه)؛ سطرِ پیش از آن اگر دو نام دارد ⇒ نامِ محورها
    t = String(t);
    var lines = t.split("\n"), rows = [], best = null, start = -1, bestStart = -1;
    function close() { if (rows.length >= 3 && (!best || rows.length > best.length)) { best = rows; bestStart = start; } rows = []; start = -1; }
    lines.forEach(function (l, li) {
      if (/^[\s|:\-–]+$/.test(l) && /-/.test(l)) return;   // خطِ جداکنندهٔ جدولِ markdown
      var ns = l.match(NUMRE) || [], rest = l.replace(NUMRE, "").replace(/[|,،:\t\s→\-–]/g, "");
      if (ns.length === 2 && rest.length <= 12 && !/[\/]/.test(rest)) { if (!rows.length) start = li; rows.push(ns); } else close();
    });
    close();
    if (best) {
      var hl = bestStart - 1; while (hl >= 0 && /^[\s|:\-–]+$/.test(lines[hl]) && /-/.test(lines[hl])) hl--;
      var hc = hl >= 0 ? headCells(lines[hl]) : null;
      return { xl: best.map(function (r) { return r[0]; }), yl: best.map(function (r) { return r[1]; }), xn: hc ? hc[0] : "", yn: hc ? hc[1] : "" };
    }
    // ۲) رشتهٔ عدد: دست‌کم چهار عدد که فقط با «،» / «,» / «و» از هم جدا شده‌اند؛ دو رشتهٔ هم‌طول ⇒ x و y
    var re = new RegExp(NUMRE.source, "g"), m, groups = [], cur = [], end = -1, a0 = -1;
    function push() { if (cur.length >= 4) groups.push({ v: cur, a: a0, z: end }); }
    while ((m = re.exec(t))) {
      var gap = end < 0 ? null : t.slice(end, m.index);
      if (cur.length && gap != null && /^\s*(?:[،,]|و)\s*$/.test(gap) && !/^[-−]/.test(m[0])) cur.push(m[0]); else { push(); cur = [m[0]]; a0 = m.index; }
      end = m.index + m[0].length;
      if (/^[\/:٫.]/.test(t.slice(end)) && /\d|[۰-۹]/.test(t.charAt(end + 1))) { cur = []; end = -1; }   // تاریخ، ساعت، نسخه
    }
    push();
    if (!groups.length) return null;
    for (var a = 0; a < groups.length; a++) for (var z = a + 1; z < groups.length; z++) if (groups[a].v.length === groups[z].v.length)
      return { xl: groups[a].v, yl: groups[z].v, xn: groupName(t, groups[a].a, groups[a].z), yn: groupName(t, groups[z].a, groups[z].z) };
    return { xl: null, yl: groups[0].v, xn: "", yn: groupName(t, groups[0].a, groups[0].z) };
  }
  function svgEl(tag, at, txt) { var e = document.createElementNS("http://www.w3.org/2000/svg", tag); Object.keys(at || {}).forEach(function (k) { e.setAttribute(k, at[k]); }); if (txt != null) e.textContent = txt; return e; }
  /* d = {xl, yl, xn, yn}؛ add = نقطه‌های افزودهٔ خودِ کاربر [[x، y]] (x تهی در رشتهٔ بی‌ستونِ x)؛ onAdd(x، y) ⇒ ذخیره و کشیدنِ دوباره */
  function plot(d, add, onAdd) {
    add = add || [];
    var fa = [].concat(d.yl, d.xl || []).some(function (v) { return FADIG.test(v); });   // دورِ ۱۹ (RN4e، A·D3 B·D8): رقمِ برچسب‌ها همان دستگاهِ پیام
    var idx = function (k) { var v = String(k + 1); return fa ? faDigits(v) : v; };
    var xl = d.xl ? d.xl.slice() : d.yl.map(function (_, k) { return idx(k); }), yl = d.yl.slice();
    add.forEach(function (p) { yl.push(p[1]); xl.push(d.xl ? p[0] : idx(xl.length)); });
    var ys = yl.map(num), xs = xl.map(num), n0 = d.yl.length;
    if (ys.some(isNaN) || xs.some(isNaN)) return null;
    var ord = xs.map(function (_, k) { return k; }); if (d.xl) ord.sort(function (a, b) { return xs[a] - xs[b] || a - b; });
    var Wd = 260, Ht = 130, L = 34, R = 10, T = 10, B = 24, x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var sx = function (v) { return L + (x1 === x0 ? 0.5 : (v - x0) / (x1 - x0)) * (Wd - L - R); }, sy = function (v) { return Ht - B - (y1 === y0 ? 0.5 : (v - y0) / (y1 - y0)) * (Ht - T - B); };
    var names = (d.xn ? "افقی: " + d.xn : "") + (d.xn && d.yn ? "، " : "") + (d.yn ? "عمودی: " + d.yn : "");
    var sv = svgEl("svg", { width: String(Wd), height: String(Ht), viewBox: "0 0 " + Wd + " " + Ht, role: "img", "aria-label": "نمودارِ خطیِ داده‌های همین پیام (" + ys.length + " نقطه)" + (names ? " — " + names : ""), style: "display:block;color:inherit;overflow:visible" });
    sv.appendChild(svgEl("title", {}, "نمودارِ خطیِ داده‌های همین پیام"));
    sv.appendChild(svgEl("line", { x1: String(L), y1: String(Ht - B), x2: String(Wd - R), y2: String(Ht - B), stroke: "currentColor", "stroke-opacity": "0.35" }));
    sv.appendChild(svgEl("line", { x1: String(L), y1: String(T), x2: String(L), y2: String(Ht - B), stroke: "currentColor", "stroke-opacity": "0.35" }));
    var pts = ord.map(function (k) { return sx(xs[k]).toFixed(1) + "," + sy(ys[k]).toFixed(1); });
    sv.appendChild(svgEl("polyline", { points: pts.join(" "), fill: "none", stroke: "currentColor", "stroke-width": "1.6" }));
    xs.forEach(function (x, k) { var mine = k >= n0; sv.appendChild(svgEl("circle", { cx: sx(x).toFixed(1), cy: sy(ys[k]).toFixed(1), r: mine ? "3.2" : "2.6", fill: mine ? "none" : "currentColor", stroke: "currentColor", "stroke-width": mine ? "1.4" : "0", "data-add": mine ? "1" : "0" })); });
    var lab = function (txt, x, y, anc, cls) { sv.appendChild(svgEl("text", { x: String(x), y: String(y), "text-anchor": anc, "font-size": "10", fill: "currentColor", "fill-opacity": "0.75", "class": cls }, txt)); };
    var iMin = ys.indexOf(y0), iMax = ys.indexOf(y1), xi0 = xs.indexOf(x0), xi1 = xs.indexOf(x1);
    lab(yl[iMax], L - 4, sy(y1) + 3, "end", "mx-ty"); if (iMin !== iMax) lab(yl[iMin], L - 4, sy(y0) + 3, "end", "mx-ty");
    lab(xl[xi0], sx(x0), Ht - B + 13, "middle", "mx-tx"); if (xi1 !== xi0) lab(xl[xi1], sx(x1), Ht - B + 13, "middle", "mx-tx");
    var box = document.createElement("div"); box.className = "mx-plot small"; box.setAttribute("dir", "rtl"); box.setAttribute("style", "margin-top:6px;white-space:normal");
    var cap = document.createElement("span"); cap.setAttribute("style", "opacity:.8"); cap.textContent = "📈 نمودارِ داده‌های همین پیام" + (d.xl ? "" : " (به ترتیب)") + (add.length ? " · " + (fa ? faDigits(add.length) : add.length) + " نقطهٔ افزوده" : ""); box.appendChild(cap);
    if (names) {   // نامِ محورها بیرونِ svg، در جملهٔ راست‌به‌چپ (واژهٔ فارسی در svg ِ چپ‌به‌راست به هم نمی‌ریزد)
      var nm = document.createElement("div"); nm.className = "mx-axes"; nm.setAttribute("dir", "rtl"); nm.setAttribute("style", "opacity:.8");
      if (d.xn) { var ax = document.createElement("span"); ax.className = "mx-xn"; ax.textContent = "↔ " + d.xn; nm.appendChild(ax); }
      if (d.xn && d.yn) nm.appendChild(document.createTextNode(" · "));
      if (d.yn) { var ay = document.createElement("span"); ay.className = "mx-yn"; ay.textContent = "↕ " + d.yn; nm.appendChild(ay); }
      box.appendChild(nm);
    }
    var hold = document.createElement("div"); hold.setAttribute("dir", "ltr"); hold.appendChild(sv); box.appendChild(hold);
    if (onAdd) box.appendChild(addForm(d, onAdd));
    return box;
  }
  /* دورِ ۱۹ (INF14، A s07 «۲۴ ساعت ⇒ ۱۱ سانت»، B s19 وزنِ تازه): «افزودنِ نقطه» به همان نمودار — نقطهٔ تازه کنارِ دادهٔ خودِ پیام، با رقمِ خودش */
  function addForm(d, onAdd) {
    var w = document.createElement("div"); w.className = "mx-addw"; w.setAttribute("dir", "rtl"); w.setAttribute("style", "margin-top:3px");
    var tog = document.createElement("button"); tog.type = "button"; tog.className = "linkish small mx-add-tog"; tog.textContent = "➕ افزودنِ نقطه";
    var f = document.createElement("span"); f.className = "mx-addf"; f.setAttribute("style", "gap:4px;align-items:center;flex-wrap:wrap;margin-inline-start:6px");
    /* دورِ ۲۰ (RO9، A·A15): display ِ درون‌خطی ویژگیِ hidden را بی‌اثر می‌کرد ⇒ فرمِ هر نمودار بی کلیک باز بود؛ حالا باز/بسته فقط با کلیدِ همان نمودار */
    var show = function (v) { f.hidden = !v; f.style.display = v ? "inline-flex" : "none"; tog.setAttribute("aria-expanded", v ? "true" : "false"); };
    show(false);
    var mk = function (cls, label) { var i = document.createElement("input"); i.type = "text"; i.className = cls; i.setAttribute("inputmode", "decimal"); i.setAttribute("aria-label", label); i.placeholder = label; i.setAttribute("style", "width:7em"); return i; };
    var ix = d.xl ? mk("mx-add-x", d.xn ? "مقدارِ " + d.xn + " (افقی)" : "مقدارِ افقی") : null, iy = mk("mx-add-y", d.yn ? "مقدارِ " + d.yn + " (عمودی)" : "مقدارِ عمودی");
    var ok = document.createElement("button"); ok.type = "button"; ok.className = "btn sm mx-add-ok"; ok.textContent = "افزودن";
    var msg = document.createElement("span"); msg.className = "mx-add-msg muted";
    ok.addEventListener("click", function () {
      var xv = ix ? ix.value.trim() : "", yv = iy.value.trim();
      if ((ix && isNaN(num(xv))) || !yv || isNaN(num(yv))) { msg.textContent = "عدد بنویس."; return; }
      onAdd(xv, yv);
    });
    tog.addEventListener("click", function () { show(f.hidden); if (!f.hidden) (ix || iy).focus(); });
    if (ix) f.appendChild(ix); f.appendChild(iy); f.appendChild(ok); f.appendChild(msg);
    w.appendChild(tog); w.appendChild(f); return w;
  }
  var PIECE = { K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙", k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
  function fenOf(t) {
    var m = /(?:^|[\s:«("“])((?:[pnbrqkPNBRQK1-8]{1,8}\/){7}[pnbrqkPNBRQK1-8]{1,8})(?:\s+([wb])\b)?(?=$|[\s.,،»")])/.exec(String(t));
    if (!m) return null;
    var ranks = m[1].split("/");
    var ok = ranks.length === 8 && ranks.every(function (r) { var n = 0; for (var k = 0; k < r.length; k++) n += /\d/.test(r[k]) ? +r[k] : 1; return n === 8; });
    return ok ? { ranks: ranks, side: m[2] || "" } : null;
  }
  function board(f) {
    var box = document.createElement("div"); box.className = "mx-board small"; box.setAttribute("dir", "ltr");
    box.setAttribute("role", "img"); box.setAttribute("aria-label", "صفحهٔ شطرنج از FEN ِ همین پیام"); box.setAttribute("style", "margin-top:6px;white-space:normal");
    var g = document.createElement("div"); g.setAttribute("style", "display:inline-grid;grid-template-columns:1.1em repeat(8,1.7em);line-height:1.7em;text-align:center;font-size:1.05rem;border:1px solid var(--line,#999)");
    f.ranks.forEach(function (r, ri) {
      var lb = document.createElement("span"); lb.setAttribute("style", "font-size:.7rem;opacity:.8"); lb.textContent = String(8 - ri); g.appendChild(lb);
      var file = 0;
      for (var k = 0; k < r.length; k++) {
        var c = r[k], n = /\d/.test(c) ? +c : 1;
        for (var z = 0; z < n; z++) {
          var sq = document.createElement("span"), dark = (file + ri) % 2 === 1;
          sq.setAttribute("data-sq", "abcdefgh"[file] + (8 - ri)); sq.setAttribute("style", "color:#111;background:" + (dark ? "#b58863" : "#f0d9b5"));
          sq.textContent = /\d/.test(c) ? "" : PIECE[c]; g.appendChild(sq); file++;
        }
      }
    });
    g.appendChild(document.createElement("span"));
    "abcdefgh".split("").forEach(function (c) { var s = document.createElement("span"); s.setAttribute("style", "font-size:.7rem;opacity:.8"); s.textContent = c; g.appendChild(s); });
    box.appendChild(g);
    if (f.side) { var p = document.createElement("div"); p.setAttribute("dir", "rtl"); p.setAttribute("style", "opacity:.85"); p.textContent = "نوبتِ " + (f.side === "w" ? "سفید" : "سیاه"); box.appendChild(p); }
    return box;
  }
  /* دورِ ۱۹ (RN4e، A·D4 s07): نمودار فقط زیرِ پیامی که داده نخستین بار در آن آمد — پاسخی که همان عددها را نقل می‌کند نمودارِ دوم نمی‌گیرد */
  function numKey(arr) { return arr.map(function (v) { return String(num(v)); }).join(","); }
  function seenBefore(msg, d) {
    var key = "," + numKey(d.yl) + ",", prev = msg.previousElementSibling;
    for (; prev; prev = prev.previousElementSibling) {
      if (!prev.classList || !prev.classList.contains("as-msg")) continue;
      var tx = prev.querySelector(".as-tx"); if (!tx) continue;
      var all = "," + numKey(msgSrc(tx).match(NUMRE) || []) + ",";
      if (all.indexOf(key) >= 0) return true;
    }
    return false;
  }
  function msgRec(msg) {   // رکوردِ همین پیام در سشنِ جاریِ دستیار (برای نگه داشتنِ نقطه‌های افزوده)
    try {
      var log = msg.parentElement, s = A.ASSIST && A.ASSIST.cur && A.ASSIST.cur(); if (!log || !s || !s.msgs) return null;
      var list = Array.prototype.filter.call(log.children, function (e) { return e.classList && e.classList.contains("as-msg") && !e.classList.contains("as-typing"); });
      var i = list.indexOf(msg), m = i >= 0 && list.length === s.msgs.length ? s.msgs[i] : null;
      return m && msg.classList.contains(m.role) ? { s: s, m: m } : null;
    } catch (e) { return null; }
  }
  function decorate(msg) {
    msg.setAttribute("data-mxv", "1");
    if (msg.classList.contains("as-typing")) return;
    var tx = msg.querySelector(".as-tx"); if (!tx) return;
    var t = msgSrc(tx), f = fenOf(t);
    try { if (f) tx.insertAdjacentElement("afterend", board(f)); } catch (e) { }
    try {
      /* دورِ ۲۱ (R9/R3h، B·s19): اندازه‌هایی که صفحه از پیامِ او رکورد کرد (m.pts) منبعِ نمودارند — اصلاحِ گفت‌وگو رکورد را عوض می‌کند و نمودار از نو کشیده می‌شود */
      var rec0 = msgRec(msg), P0 = rec0 && rec0.m && rec0.m.pts && rec0.m.pts.length >= 2 ? rec0.m.pts : null;
      var d = P0 ? { xl: null, yl: P0.map(function (p) { return String(p.y); }), xn: "", yn: "", rec: true } : !f && series(t); if (!d || (!d.rec && seenBefore(msg, d))) return;
      var rec = rec0, extra = (rec && rec.m.plotAdd) || [], pl;
      var draw = function () {
        var nw = plot(d, extra, function (x, y) {
          extra = extra.concat([[x, y]]);
          if (rec) { rec.m.plotAdd = extra; try { A.S.put(rec.s); } catch (e) { } }
          draw();
          var x1 = pl && pl.querySelector(".mx-add-tog"); if (x1) x1.focus();
        });
        if (!nw) return;
        if (pl && pl.parentNode) pl.parentNode.replaceChild(nw, pl); else msg.appendChild(nw);
        pl = nw;
      };
      draw();
    } catch (e) { }
  }
  /* یک ناظرِ DOM: فیلدهای تازهٔ مسئلهٔ زنده (شناسهٔ lp…) و ورودیِ گفت‌وگو پیش‌نمایش می‌گیرند؛ پیام‌های تازهٔ گفت‌وگو نمودار/صفحه */
  function scan() {
    try {
      Array.prototype.forEach.call(document.querySelectorAll('textarea[id^="lp"]:not([data-mx]),input[id^="lp"]:not([data-mx]),textarea.as-in:not([data-mx])'), function (e) { if (eligible(e)) attachInput(e); });
      Array.prototype.forEach.call(document.querySelectorAll(".as-msg:not([data-mxv])"), decorate);
    } catch (e) { }
  }
  if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
    var root = document.body || document.documentElement;
    try { new MutationObserver(scan).observe(root, { childList: true, subtree: true }); } catch (e) { }
    document.addEventListener("focusin", function (e) { var t = e.target; if (eligible(t)) { if (!t.getAttribute("data-mx")) attachInput(t); placeBar(t); } });
    scan();
  }

  /* دستیار: «می‌توانی فرمول را میانِ $…$ بنویسی». AS.SYS سقفِ ۲۰ هزار دارد و پر است (AGENTS.md قاعدهٔ ۸) ⇒ با promptHooks.
     دورِ ۱۸ (RM3، A·F1 ۳۹ از ۵۹ پرامپت، D·D1): فقط وقتی **محتوا** ریاضی است — پیامِ تازه، چهار پیامِ اخیر، یا صورتِ مسئلهٔ زندهٔ در کار (نما یا سشن) —
     با همان سنجهٔ نمایش‌گر (FEN، تاریخ، قیمت، نسخه، تلفن ریاضی نیستند)؛ در هر نما؛ و زمینه است، نه پرسشِ دوم (R12/R13). */
  function mathCtx(s, msg) {
    var texts = [String(msg || "")];
    ((s && s.msgs) || []).slice(-4).forEach(function (m) { texts.push(String(m && m.text || "")); });
    try {
      var st = A.state || {}, pid = (st.view === "lprob" || st.view === "e_prob") && A.liveRec && A.liveRec(st.arg) ? st.arg : (A.liveSessionPid && A.liveSessionPid(s)) || (s && s.lprob);
      var r = pid && A.liveRec ? A.liveRec(pid) : null; if (r && r.p) texts.push(String(r.p.title || "") + "\n" + String(r.p.statement || ""));
    } catch (e) { }
    return texts.some(function (t) { return t && has(t); });
  }
  var LINE = "# فرمول (زمینه، نه پرسشِ دوم)\n- زمینه (نه پرسشِ دوم): اگر فرمول می‌نویسی، میانِ $…$ بنویس (مثلاً $\\frac{1}{n(n+1)}$، $x^2$، $a_n$، $\\sqrt{2}$، $\\sum_{k=1}^{n} k$)؛ صفحه آن را درست نمایش می‌دهد. عدد درونِ جمله را بی $ بنویس.";
  function promptLine(s, msg) { return mathCtx(s, msg) ? LINE : ""; }
  if (A.ASSIST) (A.ASSIST.promptHooks = A.ASSIST.promptHooks || []).push(promptLine);
  A.MATH = { segments: segments, parse: function (src, ascii, fa) { try { return parse(String(src), !!ascii, !!fa); } catch (e) { if (e instanceof Bad) return null; throw e; } },
    nodes: toNodes, html: html, has: has, attach: attach, attachInput: attachInput, toPlain: toPlain, promptLine: promptLine, mathCtx: mathCtx, fen: fenOf, series: series };
})(APP);
