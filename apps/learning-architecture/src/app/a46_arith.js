/* ===== «حسابِ صفحه» — سنجشِ دقیقِ حساب و واحدِ نوشتهٔ خودِ کاربر — دورِ ۲۵ ِ تورِ پولیا، سازوکارِ P2 (DECISIONS_R25؛ D25-12 (S1)، C25-1، A25-8، B25·D5/D14، B_s D1) — a46_arith.js =====
   ریشه (a45_story.js arithChk ِ دورِ ۲۴): یک عبارتِ منظم «عبارت = یک عدد» با ممیزِ شناور. پس
     • سمتِ راستِ تساوی هرگز عبارت نبود: «4/2 = 1/1 + 1/2 + 1/2» ⇒ ۴/۲ با ۱/۱ سنجیده می‌شد (D25-12)؛ «a×b + … = 3.6 + 2.4 + … = 8.7» ⇒ با ۳٫۶ (B25·D5)؛
     • «با ۱/۲۰ میشه ۴/۵» (جمعِ پیاپی) ⇒ ۱/۲۰ = ۴/۵ (C25-1)؛ «۲ و خرده‌ای، یعنی ۲٫۵۷» ⇒ «۲» (A25-8)؛ «−۳ + ۴۲» ⇒ «۳ + ۴۲» (B_s D1)؛
     • تبدیلِ واحد فقط طول/جرم/زمان و فقط با عددِ رقمی («یه متر صد میلی‌متره» و کیلوژول ⇒ کیلووات‌ساعت دیده نمی‌شد — B25·D14).
   این لایه (مدل گزارش می‌دهد، صفحه می‌سنجد — experiences/model-reports-state-page-validates.md):
     • متن در هر «=» (و «میشه/می‌شود/شد») بریده می‌شود؛ از هر تکه «عبارتِ پایانی» و «عبارتِ آغازی» با یک تجزیه‌گرِ واقعی (پرانتز، توان، منهای یکانی) خوانده و هر دو سمت کامل
       حساب می‌شوند؛ زنجیرهٔ «a = b = c» حلقه‌به‌حلقه (هر حلقه با هر عضوِ پیشینِ همان زنجیره)؛
     • حساب با عددِ گویا (BigInt) است، نه ممیزِ شناور: جمعِ کسرها دقیق است. تنها رواداری از نوشتهٔ خودِ اوست — عددی که با n رقمِ اعشار نوشته نیم‌واحدِ همان رقم
       (و با «حدود/تقریباً» رتبهٔ آخرین رقمِ غیرِ صفر)؛ عددی که خودش گرد کرده («حدودِ ۰٫۲۹») در حسابِ بعدی همان بازه است، نه یک نقطه؛
     • «نادرست» فقط وقتی که هیچ خوانشِ طبیعیِ نوشته درست درنیاید: «/» ِ ممیز (۳/۵ = سه و نیم)، خارج‌قسمتِ صحیح («۱۴ تقسیم بر ۵ میشه ۲»)، شمارهٔ سطر («۱.۲+۳»)، «!» ِ تعجب؛
     • هر چه عبارتِ عددیِ محض نیست (حرفِ لاتین، پرانتزِ نمادین، «جذرِ …»، «نصفِ …»، «۳ تا ۵»، «۲ سوم») خوانده نمی‌شود — صفحه درباره‌اش چیزی نمی‌گوید؛
     • واحد: طول، سطح، حجم، جرم، زمان، انرژی، توان — تبدیل («۲۹۴٫۳ کیلوژول، یعنی حدودِ ۰٫۲۹ کیلووات‌ساعت»)، جمعِ ناهم‌واحد، و ضریبِ گفته («یه متر صد میلی‌متره»).
   قرارداد برای دیگران: A.STORY.arithChk(متن، زمینه؟) ⇒ [{expr, said, val, valT, ok, kind, unit?, conv?}]؛ A.STORY.arithNote(ck, حکم) ⇒ {chk, chkM, bad}؛ A.STORY.arithSaid(ck).
   مرزِ صادقانه: این فقط حسابِ نوشته‌شده را می‌سنجد؛ درستیِ خودِ گام داوریِ مربی است. نسخهٔ دورِ ۲۴ قرنطینه است: A.STORY.arithChkR24 (docs/overhaul/REMOVAL_CANDIDATES.md). */
(function (A) {
  var ST = A.STORY, AS = A.ASSIST; if (!ST || typeof BigInt !== "function") return;
  var fa = A.fa || function (x) { return String(x); };
  var B = BigInt, Z = B(0), ONE = B(1), TEN = B(10);

  /* ---------- عددِ گویا و بازه ---------- */
  function gcd(a, b) { if (a < Z) a = -a; if (b < Z) b = -b; while (b) { var t = a % b; a = b; b = t; } return a; }
  function F(n, d) { if (d == null) d = ONE; if (d === Z) return null; if (d < Z) { n = -n; d = -d; } var g = gcd(n, d) || ONE; return { n: n / g, d: d / g }; }
  function p10(k) { var r = ONE; for (var i = 0; i < k; i++) r *= TEN; return r; }
  function dec(s) { var m = /^(\d+)(?:\.(\d+))?$/.exec(String(s)); if (!m) return null; var fr = m[2] || ""; return F(B(m[1] + fr), p10(fr.length)); }
  function add(a, b) { return F(a.n * b.d + b.n * a.d, a.d * b.d); }
  function sub(a, b) { return F(a.n * b.d - b.n * a.d, a.d * b.d); }
  function mul(a, b) { return F(a.n * b.n, a.d * b.d); }
  function div(a, b) { return b.n === Z ? null : F(a.n * b.d, a.d * b.n); }
  function cmp(a, b) { var x = a.n * b.d - b.n * a.d; return x < Z ? -1 : x > Z ? 1 : 0; }
  function mn(a, b) { return cmp(a, b) <= 0 ? a : b; }
  function mx(a, b) { return cmp(a, b) >= 0 ? a : b; }
  function num(a) { var s = a.n < Z ? -1 : 1, n = a.n < Z ? -a.n : a.n, q = n / a.d, r = n % a.d; return s * (Number(q) + Number(r) / Number(a.d)); }
  var HALF = F(ONE, B(2));
  function iv(lo, hi) { return { lo: lo, hi: hi == null ? lo : hi }; }
  function pt(v) { return cmp(v.lo, v.hi) === 0; }
  function iAdd(a, b) { return iv(add(a.lo, b.lo), add(a.hi, b.hi)); }
  function iSub(a, b) { return iv(sub(a.lo, b.hi), sub(a.hi, b.lo)); }
  function iMul(a, b) { var P = [mul(a.lo, b.lo), mul(a.lo, b.hi), mul(a.hi, b.lo), mul(a.hi, b.hi)]; return iv(P.reduce(mn), P.reduce(mx)); }
  function iDiv(a, b) { if (cmp(b.lo, F(Z)) <= 0 && cmp(b.hi, F(Z)) >= 0) return null; var P = [div(a.lo, b.lo), div(a.lo, b.hi), div(a.hi, b.lo), div(a.hi, b.hi)]; return iv(P.reduce(mn), P.reduce(mx)); }
  function iNeg(a) { return iv(sub(F(Z), a.hi), sub(F(Z), a.lo)); }
  function iScale(a, f) { return iMul(a, iv(f)); }
  function meet(a, b) { return cmp(a.lo, b.hi) <= 0 && cmp(b.lo, a.hi) <= 0; }
  function hull(a, b) { return iv(mn(a.lo, b.lo), mx(a.hi, b.hi)); }
  /* C9 (DECISIONS_R25): عددِ نوشته‌اش پذیرفته است اگر مقدارِ دقیق در همان تعداد رقمی که خودش نوشته به آن گرد یا بریده شود — s − ½u ≤ v < s + u؛ با «حدود/تقریباً» بازهٔ دوطرفهٔ t */
  function near(v, s, t, sym) {
    if (sym) return meet(v, wide(iv(s), t));
    var t2 = add(t, t);
    return s.n < Z ? cmp(v.hi, sub(s, t2)) > 0 && cmp(v.lo, add(s, t)) <= 0 : cmp(v.hi, sub(s, t)) >= 0 && cmp(v.lo, add(s, t2)) < 0;
  }
  function wide(v, t) { return iv(sub(v.lo, t), add(v.hi, t)); }
  /* نمایش: عددِ صحیح، اعشارِ پایان‌پذیر، وگرنه کسر */
  function fmtF(a) {
    if (a.d === ONE) return fa(String(a.n));
    var d = a.d, k = 0; while (d % B(2) === Z) { d /= B(2); k++; } var j = 0; while (d % B(5) === Z) { d /= B(5); j++; }
    var e = Math.max(k, j);
    if (d === ONE && e <= 6) { var s = a.n < Z ? "-" : "", n = (a.n < Z ? -a.n : a.n) * p10(e) / a.d, t = String(n); while (t.length <= e) t = "0" + t; return fa(s + t.slice(0, t.length - e) + "٫" + t.slice(t.length - e)); }
    if (String(a.n).length <= 9 && String(a.d).length <= 9) return fa(String(a.n) + "/" + String(a.d));
    return "≈ " + fa(String(Math.round(num(a) * 1e6) / 1e6).replace(".", "٫"));
  }
  function fmtV(v) { return pt(v) ? fmtF(v.lo) : "میانِ " + fmtF(v.lo) + " و " + fmtF(v.hi); }

  /* ---------- یکدست‌سازیِ متن ---------- */
  var APX = "(?:حدود(?:ِ|اً|ا)?|تقریباً|تقریبا|نزدیک(?:ِ|\\s*به)?)";
  function digs(t) { return String(t == null ? "" : t).replace(/[۰-۹]/g, function (c) { return String(c.charCodeAt(0) - 1776); }).replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 1632); }).replace(/٫/g, ".").replace(/(\d)٬(?=\d)/g, "$1"); }
  function norm(q) {
    var t = digs(q).replace(/\r/g, "").replace(/−/g, "-")
      .replace(/(^|[^\d.,])(\d{1,3}(?:,\d{3})+)(?![\d,])/g, function (m, a, b) { return a + b.replace(/,/g, ""); })
      .replace(/(\d)\s+–\s+(?=\d)/g, "$1 - ")                                   // خطِ تیرهٔ فاصله\u200cدار میانِ دو عدد = منها؛ بی\u200cفاصله («۱۰–۲۰») بازه است
      .replace(/(\d)\s*(?:درصد(?:ِ)?|٪|%)/g, "$1%").replace(/%\s*از\s*(?=\d)/g, "% * ")
      .replace(/منفی(?:ِ)?\s*(?=\d)/g, "-")
      .replace(/ضرب\s*در|ضربدر/g, " * ").replace(/تقسیم\s*بر/g, " / ").replace(/منهای/g, " ~ ")
      .replace(/به[\u200c\s]?علاوه[ٔۀ]?(?:\u200c?ی)?|بعلاوه[ٔۀ]?(?:\u200c?ی)?|به[\u200c\s]?اضافه[ٔۀ]?(?:\u200c?ی)?/g, " + ")
      .replace(/[×⋅·∙]/g, "*").replace(/÷/g, "/")
      .replace(/(\d%?)\s*[xX]\s*(?=\d)/g, "$1 * ").replace(/(\d%?)\s+در\s+(?=\d)/g, "$1 * ")
      .replace(/(^|[\s،,.؛:])(?:میشه|می[\u200c\s]?شه|می[\u200c\s]?شود|میشود|می[\u200c\s]?شد|شد)(?=$|[\s،,.؛:!؟?]|\d)/g, "$1 = ")
      .replace(/[≃≅]/g, "≈");
    return t.replace(new RegExp("=\\s*" + APX + "\\s*", "g"), "≈ ");
  }

  /* ---------- نشانه‌ها ---------- */
  var FA_L = /[ء-غف-ٰٕپچژکگۀیے\u200cـ]/, LAT = /[A-Za-zÀ-ɏͰ-Ͽ]/;
  var MAG = [[/^\s*میلیارد(?![آ-ی])/, 9], [/^\s*میلیون(?![آ-ی])/, 6], [/^\s*هزار(?![آ-ی])/, 3]];
  function tokens(s) {
    var T = [], i = 0, sp = true, n = s.length;
    while (i < n) {
      var c = s[i];
      if (c === "\n") { T.push({ k: "p", t: "\n", a: i, b: i + 1, sp: true }); i++; sp = true; continue; }
      if (/\s/.test(c)) { i++; sp = true; continue; }
      var m, tk;
      if ((m = /^\d+(?:\.\d+)?/.exec(s.slice(i)))) {
        var raw = m[0], e = i + raw.length, v = dec(raw), pct = false, mag = 0, mm;
        if (s[e] === "%") { pct = true; e++; }
        for (var g = 0; g < MAG.length; g++) if ((mm = MAG[g][0].exec(s.slice(e)))) { mag += MAG[g][1]; e += mm[0].length; g = -1; }
        if (mag) v = mul(v, F(p10(mag))); if (pct) v = div(v, F(B(100)));
        tk = { k: "n", raw: raw, v: v, pct: pct, mag: mag, int: raw.indexOf(".") < 0 && !pct && !mag, a: i, b: e, sp: sp };
      } else if ("+-*/~^".indexOf(c) >= 0) tk = { k: "o", t: c, a: i, b: i + 1, sp: sp, spA: /\s/.test(s[i + 1] || " ") };
      else if (c === "²" || c === "³") tk = { k: "w2", t: c === "²" ? 2 : 3, a: i, b: i + 1, sp: sp };
      else if (c === "(") tk = { k: "(", a: i, b: i + 1, sp: sp };
      else if (c === ")") tk = { k: ")", a: i, b: i + 1, sp: sp };
      else if (FA_L.test(c)) { var j = i; while (j < n && FA_L.test(s[j])) j++; tk = { k: "w", t: s.slice(i, j), a: i, b: j, sp: sp }; }
      else if (LAT.test(c)) { var j2 = i; while (j2 < n && (LAT.test(s[j2]) || s[j2] === "_")) j2++; tk = { k: "L", t: s.slice(i, j2), a: i, b: j2, sp: sp }; }
      else tk = { k: "p", t: c, a: i, b: i + 1, sp: sp };
      T.push(tk); i = tk.b; sp = false;
    }
    /* پرانتزِ بسته‌ای که جفت ندارد («۲)») نشانهٔ شمارهٔ فهرست است، نه عبارت */
    var st = []; T.forEach(function (x) { if (x.k === "(") st.push(x); else if (x.k === ")") { if (st.length) { st.pop().ok = true; x.ok = true; } } });
    return T;
  }
  /* خوانشِ دوم: «/» ِ میانِ دو عددِ صحیحِ چسبیده ممیز است (۳/۵ = سه و نیم) */
  function slashDec(T) {
    var o = [], ch = false;
    for (var i = 0; i < T.length; i++) {
      var a = T[i], s = T[i + 1], b = T[i + 2], pv = o[o.length - 1], nx = T[i + 3];
      if (a.k === "n" && a.int && s && s.k === "o" && s.t === "/" && !s.sp && !s.spA && b && b.k === "n" && b.int && !(pv && pv.k === "o" && pv.t === "/" && !a.sp) && !(nx && nx.k === "o" && nx.t === "/" && !nx.sp)) {
        o.push({ k: "n", raw: a.raw + "." + b.raw, v: dec(a.raw + "." + b.raw), pct: false, mag: 0, int: false, a: a.a, b: b.b, sp: a.sp }); i += 2; ch = true;
      } else o.push(a);
    }
    return ch ? o : null;
  }

  /* ---------- تجزیه‌گر: expr := term (± term)* ؛ term := factor (×÷ factor)* ؛ factor := [−] atom [^k | ² | ³] ---------- */
  function halfUlp(tk) { var d = (tk.raw.split(".")[1] || "").length, t = F(ONE, B(2) * p10(d)); if (tk.mag) t = mul(t, F(p10(tk.mag))); if (tk.pct) t = div(t, F(B(100))); return t; }
  function parser(T, o) {
    o = o || {}; var reg = o.reg || null, wd = !!o.wide;
    function lit(tk, X) {
      X.lits.push(tk); var v = iv(tk.v);
      if (reg && reg[tk.raw] && !tk.mag && !tk.pct) v = hull(v, reg[tk.raw]);
      else if (wd && tk.raw.indexOf(".") >= 0) v = wide(v, halfUlp(tk));
      return v;
    }
    function atom(i, X) {
      var t = T[i]; if (!t) return null;
      if (t.k === "n") return { v: lit(t, X), e: i + 1 };
      if (t.k === "(") { var r = expr(i + 1, X, true); if (!r || !T[r.e] || T[r.e].k !== ")") return null; X.par++; return { v: r.v, e: r.e + 1 }; }
      return null;
    }
    function pow(v, k) { var r = iv(F(ONE)); for (var q = 0; q < k; q++) r = iMul(r, v); return r; }
    function factor(i, X) {
      var t = T[i], neg = false;
      if (t && t.k === "o" && (t.t === "-" || t.t === "+") && !t.spA && T[i + 1] && (T[i + 1].k === "n" || T[i + 1].k === "(")) { neg = t.t === "-"; i++; X.un++; }
      var a = atom(i, X); if (!a) return null; var e = a.e, v = a.v, nx = T[e];
      if (nx && nx.k === "w2" && !nx.sp) { v = pow(v, nx.t); e++; X.ops++; }
      else if (nx && nx.k === "o" && nx.t === "^" && T[e + 1] && T[e + 1].k === "n" && T[e + 1].int && T[e + 1].raw.length <= 3) { v = pow(v, +T[e + 1].raw); e += 2; X.ops++; }
      return { v: neg ? iNeg(v) : v, e: e };
    }
    function term(i, X) {
      var a = factor(i, X); if (!a) return null; var v = a.v, e = a.e;
      for (;;) { var t = T[e]; if (!t || t.k !== "o" || (t.t !== "*" && t.t !== "/")) break; var s0 = { l: X.lits.length, o: X.ops, u: X.un, p: X.par }, b = factor(e + 1, X);
        if (!b) { X.lits.length = s0.l; X.ops = s0.o; X.un = s0.u; X.par = s0.p; break; }
        var r = t.t === "*" ? iMul(v, b.v) : iDiv(v, b.v); if (!r) return null; v = r; e = b.e; X.ops++; X.mops.push(t.t); if (t.t === "/") X.divs++; else X.muls++; }
      return { v: v, e: e };
    }
    function expr(i, X, inner) {
      var a = term(i, X); if (!a) return null; var v = a.v, e = a.e, terms = [a.v];
      for (;;) { var t = T[e]; if (!t || t.k !== "o" || (t.t !== "+" && t.t !== "-" && t.t !== "~")) break;
        /* «۲۴ −۳ + ۴۲»: منهایِ چسبیده به عددِ بعد و جدا از عددِ پیش، علامتِ عددِ تازه است — عبارت همین‌جا تمام می‌شود */
        if (t.t === "-" && t.sp && !t.spA) break;
        var s0 = { l: X.lits.length, o: X.ops, u: X.un, p: X.par }, b = term(e + 1, X);
        if (!b) { X.lits.length = s0.l; X.ops = s0.o; X.un = s0.u; X.par = s0.p; break; }
        var bv = t.t === "+" ? b.v : iNeg(b.v); v = iAdd(v, bv); terms.push(bv); e = b.e; X.ops++; X.adds++; }
      if (!inner) X.terms = terms;
      return { v: v, e: e };
    }
    return function (i) {
      var X = { lits: [], ops: 0, un: 0, par: 0, divs: 0, muls: 0, adds: 0, terms: [], mops: [] }, r = expr(i, X, false); if (!r) return null;
      X.v = r.v; X.s = i; X.e = r.e; X.a = T[i].a; X.b = T[r.e - 1].b;
      X.single = X.lits.length === 1 && !X.ops && !X.par;
      X.div2 = X.lits.length === 2 && X.ops === 1 && X.divs === 1 && !X.par && !X.un && X.lits[0].int && X.lits[1].int;
      X.prod = X.lits.length >= 2 && !X.adds && !X.par && !X.un && X.mops.length === X.lits.length - 1 && X.ops === X.mops.length;
      X.pctMix = X.adds > 0 && X.lits.some(function (l) { return l.pct; }) && !X.lits.every(function (l) { return l.pct; }); /* «۱۰۰ − ۲۰٪»: درصدِ چه؟ */
      X.pctSum = X.lits.length >= 2 && X.lits.every(function (l) { return l.pct; }) && !X.muls && !X.divs;
      return X;
    };
  }
  var FUNC_FA = /^(?:جذر|رادیکال|ریشه|توان|لگاریتم|لگ|سینوس|کسینوس|تانژانت|کتانژانت|فاکتوریل|مطلق|مجذور|مربع|مکعب|نصف|نیم|ثلث|ربع|خمس|برابر|معکوس|وارون|میانگین|معدل|متوسط|باقی\u200c?مانده|مشتق|انتگرال|حد|ممیز|مضرب|دو\u200c?سوم|یک\u200c?سوم|یک\u200c?چهارم|سه\u200c?چهارم)(?:ِ|ٔ|ی|\u200cی|ش)?$/;
  var FUNC_EN = /^(?:sin|cos|tan|cot|sec|csc|log|ln|lg|exp|sqrt|mod|max|min|gcd|lcm|det|abs|arc\w*|pi)$/i;
  var MATH = /[√∛∑∫∏π^_|±∓<>≤≥≠≡∈∞∂∆∇]/;
  /* آنچه پس از عددِ گفته آن را عددِ دیگری می‌کند («۲ برابرِ …»، «۳ به ۲»، «۲ سوم»، «۳ تا ۵»، «۲ و ۵۷ صدم») ⇒ خوانده نمی‌شود */
  var AFTER_BAD = /^\s*(?:برابر|به(?![آ-ی\u200c])|توان|ممیز|دوم(?![آ-ی])|سوم(?![آ-ی])|چهارم(?![آ-ی])|پنجم(?![آ-ی])|ششم(?![آ-ی])|هفتم(?![آ-ی])|هشتم(?![آ-ی])|نهم(?![آ-ی])|دهم(?![آ-ی])|صدم(?![آ-ی])|هزارم(?![آ-ی])|رادیکال|جذر|تا\s*\d|و\s*\d+(?:\.\d+)?\s*(?:صدم|دهم|هزارم|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم|نهم)|:\s*\d)/;
  var MIXED = /^\s*و\s*(\d+)\/(\d+)(?![\d.\/])(?!\s*[+\-*\/~^(=≈])/;
  var FLOOR = new RegExp("^\\s*و\\s*(?:خرده\\u200c?\\s?ای|خورده\\u200c?\\s?ای|خرده(?![آ-ی])|خورده(?![آ-ی])|اندی|کمی|یه\\s*چیزی|یک\\s*چیزی|یه\\s*کم(?![آ-ی])|یه\\s*ذره)(?:\\s*[،,]?\\s*(?:یعنی|دقیق\\u200c?تر(?:ش)?)\\s*(" + APX + ")?\\s*(\\d+(?:\\.\\d+)?)(?![\\d.\\/]))?");
  var HALFW = /^\s*و\s*نیم(?![آ-ی])/;
  var REM = /^\s*(?:[،,]\s*|و\s*|با\s*)?(?:باقی[\u200c\s]?مانده(?:ٔ|ی|\u200cی|ش|\u200cاش)?|باقیش)\s*(\d+)(?![\d.\/])|^\s*(?:[،,]\s*|و\s*)(\d+)\s*(?:تا\s*)?(?:هم\s*)?(?:باقی\s*)?(?:می[\u200c\s]?مونه|می[\u200c\s]?ماند|اضافه\s*میاد)/;
  function okNext(T, e) {   // پس از عبارت: عملگر، پرانتز، حرفِ لاتینِ چسبیده یا نمادِ ریاضی ⇒ عبارتِ عددیِ محض نیست
    var nx = T[e]; if (!nx) return true;
    if (nx.k === "o" || nx.k === "(" || nx.k === "w2") return false;
    if (nx.k === ")" && nx.ok) return false;
    if (nx.k === "L") return nx.sp && nx.t.length > 1 && !FUNC_EN.test(nx.t);
    if (nx.k === "p" && MATH.test(nx.t)) return false;
    return true;
  }
  function okPrev(T, s) {
    var pv = T[s - 1]; if (!pv) return true;
    if (pv.k === "o" || pv.k === "(" || pv.k === "w2") return false;
    if (pv.k === ")" && pv.ok) return false;
    if (pv.k === "n" && T[s].k === "(" && !T[s].sp) return false;                 // «۲(۱+۲)»: ضربِ ضمنی
    if (pv.k === "L") return T[s].sp && pv.t.length > 1 && !FUNC_EN.test(pv.t);
    if (pv.k === "p" && MATH.test(pv.t)) return false;
    if (pv.k === "w" && FUNC_FA.test(pv.t)) return false;
    return true;
  }
  function textOf(seg, X) { return seg.slice(X.a, X.b).replace(/\s+/g, " ").replace(/\*/g, "×").replace(/\s*~\s*/g, " − ").replace(/-/g, "−").replace(/%/g, "٪").trim(); }

  /* ---------- یک تکه: عبارتِ آغازی (گفته) و عبارتِ پایانی (حساب) ---------- */
  function leadOf(seg, T, o) {
    if (!T.length || (T[0].k !== "n" && T[0].k !== "(" && T[0].k !== "o")) return null;
    var X = parser(T, o)(0); if (!X || !okNext(T, X.e)) return null;
    var rest = seg.slice(X.b), m;
    X.t = textOf(seg, X); X.end = X.e;
    if (X.single && !X.un && X.lits[0].int) {
      if ((m = FLOOR.exec(rest))) { X.floor = true; X.t = textOf(seg, X) + " و خرده‌ای"; if (m[2]) { X.ref = { raw: m[2], apx: !!m[1] }; X.t = m[2]; } X.b += m[0].length; return X; }
      if ((m = REM.exec(rest))) { X.rem = B(m[1] || m[2]); X.t = textOf(seg, X) + " و باقی‌ماندهٔ " + (m[1] || m[2]); X.b += m[0].length; return X; }
    }
    if (X.single && !X.un && X.lits[0].int && (m = HALFW.exec(rest))) { var l0 = X.lits[0], hv = add(l0.v, HALF); X.v = iv(hv); X.lits = [{ k: "n", raw: l0.raw + ".5", v: hv, pct: false, mag: 0, int: false }]; X.t = textOf(seg, X) + " و نیم"; X.b += m[0].length; return X; }
    if (AFTER_BAD.test(rest)) return null;
    if (X.single && X.lits[0].mag && /^\s*و\s*\d/.test(rest)) return null;                                  // «۲ هزار و ۵۰۰»
    if (X.single && !X.un && X.lits[0].int && (m = MIXED.exec(rest)) && B(m[1]) < B(m[2])) {                 // عددِ مخلوط «۱ و ۳/۴»
      var mv = add(X.lits[0].v, F(B(m[1]), B(m[2]))); X.v = iv(mv); X.mixed = true; X.t = textOf(seg, X) + " و " + m[1] + "/" + m[2]; X.b += m[0].length; return X; }
    if (X.single && !X.un && !X.lits[0].pct) {                                                               // «۵ متر و ۸۵ سانت»
      var u1 = unitAt(rest), m2 = u1 && /^\s*و\s*(\d+(?:\.\d+)?)/.exec(rest.slice(u1.len)), u2 = m2 && unitAt(rest.slice(u1.len + m2[0].length));
      if (u2 && u2.dim === u1.dim && cmp(u2.f, u1.f) < 0 && cmp(mul(dec(m2[1]), u2.f), u1.f) < 0) { var c2 = div(mul(dec(m2[1]), u2.f), u1.f); X.v = iv(add(X.lits[0].v, c2)); X.comp = div(mul(tolSaid({ raw: m2[1], mag: 0, pct: false }, false), u2.f), u1.f);
        X.t = textOf(seg, X) + " " + u1.w + " و " + m2[1] + " " + u2.w; X.b += u1.len + m2[0].length + u2.len; return X; }
      if (u1 && m2) return null;
    }
    if (X.single && X.lits[0].int && rest[0] === "!") X.bang = true;
    return X;
  }
  function trailOf(seg, T, o, lead) {
    var P = parser(T, o), n = T.length;
    for (var i = 0; i < n; i++) {
      var t = T[i]; if (t.k !== "n" && t.k !== "(" && !(t.k === "o" && (t.t === "-" || t.t === "+"))) continue;
      if (t.k === "o" && T[i - 1] && T[i - 1].k === "n" && !(t.sp && !t.spA)) continue;   // منهای دوتایی آغازِ عبارت نیست
      var X = P(i); if (!X || X.e !== n) continue;
      X.t = textOf(seg, X);
      /* جمعِ پیاپی: «… = ۳/۴. با ۱/۲۰ میشه ۴/۵» و «… میشه ۲۸٫۵، ضربدر ۲ میشه ۵۷» — فقط وقتی عددِ پیشین درست پیش از آن است (جز نشانهٔ نگارشی چیزی میانشان نیست) */
      var pv = T[i - 1], run = pv && ((pv.k === "w" && pv.t === "با") ? "با" : (pv.k === "o" && "*/+~".indexOf(pv.t) >= 0) ? pv.t : "");
      if (run) {
        var k = i - 2; while (k >= 0 && T[k].k === "p" && /[.،,؛:!\n]/.test(T[k].t)) k--;
        var pe = lead && !lead.floor && lead.rem == null && lead.end === k + 1 ? lead : null;
        if (!pe && run === "با" && k === i - 2 && T[k].k === "n") {   // «۳۸ با ۲۷ میشه ۶۵»: عددِ درست پیش از «با»
          var Tp = T.slice(0, k + 1), Pp = parser(Tp, o);
          for (var j = 0; j <= k && !pe; j++) { if (Tp[j].k !== "n" && Tp[j].k !== "(") continue; var Y = Pp(j); if (Y && Y.e === k + 1) { if (!okPrev(Tp, j)) break; Y.t = textOf(seg, Y); pe = Y; } }
        }
        if (!pe) return null; lead = pe;
        var pvv = lead.single && o.reg && o.reg[lead.lits[0].raw] ? hull(lead.v, o.reg[lead.lits[0].raw]) : lead.v, alts = [];
        if (run === "با" || run === "+") alts.push(iAdd(pvv, X.v)); if (run === "با" || run === "*") alts.push(iMul(pvv, X.v));
        if (run === "~") alts.push(iSub(pvv, X.v)); if (run === "/") { var dv = iDiv(pvv, X.v); if (dv) alts.push(dv); }
        if (!alts.length) return null;
        return { run: true, alts: alts, v: alts[0], t: lead.t + (run === "با" ? " با " : " " + (run === "*" ? "×" : run === "~" ? "−" : run) + " ") + X.t, lits: X.lits, ops: 1, terms: [], a: lead.a != null && lead.a < X.a ? lead.a : X.a, b: X.b };
      }
      if (!okPrev(T, i)) return null;
      /* عددِ تنها پس از حرفِ اضافه («با ۱/۲۰ …»، «از ۴۸ …») حسابِ کامل نیست */
      if (pv && pv.k === "w" && /^(?:با|از|به|تا|بر)$/.test(pv.t) && (X.single || X.div2)) return null;
      X.lineStart = !pv || (pv.k === "p" && /[\n.:؛]/.test(pv.t));
      return X;
    }
    return null;
  }
  function tolSaid(tk, apx) {
    var d = (tk.raw.split(".")[1] || "").length, t;
    if (d) t = F(ONE, B(2) * p10(d)); else if (!apx) t = HALF; else { var z = (tk.raw.match(/0+$/) || [""])[0].length; if (z >= tk.raw.length) z = tk.raw.length - 1; t = mul(HALF, F(p10(z))); }
    if (tk.mag) t = mul(t, F(p10(tk.mag))); if (tk.pct) t = div(t, F(B(100)));
    return t;
  }
  function floorF(a) { var q = a.n / a.d; if (a.n < Z && a.n % a.d !== Z) q -= ONE; return q; }
  function factB(n) { var r = ONE; for (var i = B(2); i <= n; i += ONE) r *= i; return r; }
  /* آیا «حساب» (L) با «گفته» (R) می‌خواند؟ — گفتهٔ تک‌عددی با دقتِ نوشتهٔ خودش؛ عبارت در برابرِ عبارت جمله‌به‌جمله یا دقیق */
  function agree(L, R, apx, Rw) {
    var Ls = L.alts || [L.v], hit = function (f) { return Ls.some(f); };
    if (R.floor) {
      var okF = hit(function (v) { return pt(v) && v.lo.d !== ONE && floorF(v.lo) === R.lits[0].v.n; });
      if (okF && R.ref) { var rt = { raw: R.ref.raw, mag: 0, pct: false }, rv = dec(R.ref.raw), tl = tolSaid(rt, R.ref.apx); okF = hit(function (v) { return near(v, rv, tl, R.ref.apx); }); }
      return okF ? "floor" : "";
    }
    if (R.rem != null) return L.div2 && L.lits[0].v.n === R.lits[0].v.n * L.lits[1].v.n + R.rem && R.rem >= Z && R.rem < L.lits[1].v.n ? "rem" : "";
    if (R.single) {
      var tk = R.lits[0], t = R.mixed ? F(Z) : R.comp || tolSaid(tk, apx), sym = apx || R.mixed, sv = R.v.lo;
      if (hit(function (v) { return near(v, sv, t, sym); })) return "eq";
      if (L.div2 && tk.int && !R.un && !R.mixed && !R.comp && floorF(L.v.lo) === tk.v.n) return "quot";                       // خارج‌قسمتِ صحیح
      if (L.pctSum && !tk.pct && near(iScale(L.v, F(B(100))), sv, t, sym)) return "eq";                          // «۴۰٪ + ۳۰٪ = ۷۰»
      if (R.bang && tk.v.n >= Z && tk.v.n <= B(60) && hit(function (v) { return meet(v, iv(F(factB(tk.v.n)))); })) return "eq";   // «= ۵!»
      return "";
    }
    if (L.single && !L.alts) return agree(R, L, apx, null) ? "eq" : "";                                  // «۷/۱۴۶۰ = ۱/۲۱۰ + ۱/۳۰۶۶۰»، «۳۳٫۳ = ۳۰۰۰/۹۰»
    if (hit(function (v) { return meet(v, R.v); })) return "eq";
    /* جمله‌به‌جمله: «۰٫۴×۹ + ۰٫۳×۸ = ۳٫۶ + ۲٫۴» — هر جمله با دقتِ نوشتهٔ همان عدد */
    if (!L.alts && L.terms.length >= 2 && L.terms.length === R.terms.length && R.lits.length === R.terms.length && !R.par && !R.muls && !R.divs && !R.un &&
      L.terms.every(function (v, k) { return near(v, R.lits[k].v, tolSaid(R.lits[k], false), false); })) return "eq";
    /* مجموعی که در دقتِ نوشتهٔ او نوشتنی نیست (۱۰/۳ + ۵ = ۵ + ۳٫۳۳): عددهای اعشاریِ سمتِ راست گردشده‌اند */
    if (Rw && !L.alts && pt(L.v)) { var dm = 0; R.lits.forEach(function (l) { dm = Math.max(dm, (l.raw.split(".")[1] || "").length); });
      if (dm && mul(L.v.lo, F(p10(dm))).d !== ONE && meet(L.v, Rw.v)) return "eq"; }
    return "";
  }

  /* ---------- زنجیره‌های تساوی ---------- */
  /* خودش آن حساب را نادرست یا مالِ دیگری خوانده («دوستم نوشته بود ۷×۸ = ۵۴ که غلطه»، «قبلاً نوشته بودم … که غلط بود») ⇒ خطای تازهٔ او نیست */
  function disowned(t, a, b) {
    var bf = t.slice(0, a).split(/[.!؟?\n؛]/).pop(), af = t.slice(b).split(/[.!؟?\n؛]/)[0];
    return /غلط|اشتباه|نادرست|درست\s*نیست|درست\s*نبود/.test(af) || /نوشته\s*بود|گفته\s*بود|می[\u200c\s]?گفت|قبلاً|قبلا(?![آ-ی])|اشتباهی|به\s*اشتباه|غلط/.test(bf);
  }
  var EXK = ["L", "T", "M", "P"];
  function chains(t, reg, out, note, CU) {
    var re = /(?<![<>!=:≠])=(?![=>])|≈/g, m, cuts = [], last = 0, segs = [];
    while ((m = re.exec(t))) { segs.push({ s: t.slice(last, m.index), at: last }); cuts.push(m[0] === "≈"); last = m.index + m[0].length; }
    segs.push({ s: t.slice(last), at: last }); if (segs.length < 2) return;
    function read(i, alt) {
      var sg = segs[i], T = tokens(sg.s); if (alt) { T = slashDec(T); if (!T) return null; }
      var ld = i > 0 ? leadOf(sg.s, T, {}) : null;
      return { lead: ld, leadW: ld && !ld.single ? leadOf(sg.s, T, { wide: true }) : null, trail: i < segs.length - 1 ? trailOf(sg.s, T, { reg: reg }, ld) : null, n: T.length };
    }
    var Rd = segs.map(function (_, i) { return read(i, false); }), members = [];
    for (var i = 1; i < segs.length; i++) {
      var L = Rd[i - 1].trail, R = Rd[i].lead;
      if (!L || !R || L.pctMix || R.pctMix) { members = []; continue; }
      /* زنجیره: تکهٔ پیشین سراسر یک عبارت بود و خودش حلقهٔ پیشین را داشت */
      var pure = Rd[i - 1].lead && !L.run && Rd[i - 1].lead.end === Rd[i - 1].n && L.s === 0;
      members = pure && members.length ? members.concat([L]) : [L];
      if (R.single && !R.floor && R.rem == null && members.every(function (x) { return x.single && !x.run; })) continue;   // «x = ۵ = ۵»: عدد در برابرِ عدد حرفی ندارد
      var apx = cuts[i - 1], how = "";
      for (var k = members.length - 1; k >= 0 && !how; k--) how = agree(members[k], R, apx, Rd[i].leadW);
      if (!how) {   // خوانش‌های طبیعیِ دیگرِ همان نوشته
        var a1 = read(i - 1, true) || Rd[i - 1], a2 = read(i, true) || Rd[i];
        /* خوانشِ دیگری درست درمی‌آید ولی همان نوشته با خوانشِ نخست نادرست است («۱/۲ + ۱/۳ = ۲/۵»: کسر یا ممیز؟) ⇒ صفحه چیزی نمی‌گوید — نه «درست»، نه «نادرست» */
        if ((a1 !== Rd[i - 1] || a2 !== Rd[i]) && a1.trail && a2.lead && agree(a1.trail, a2.lead, apx, a2.leadW)) continue;
        if (!how && !L.run && L.lineStart && L.lits[0] && L.lits[0].raw.indexOf(".") > 0 && L.lits[0].a === L.a) {   // «۱.۲ + ۳ = ۵» = سطرِ ۱: ۲ + ۳ = ۵
          var s2 = segs[i - 1].s, cut = L.a + L.lits[0].raw.indexOf(".") + 1, T2 = tokens(s2.slice(cut)), L2 = trailOf(s2.slice(cut), T2, { reg: reg }, null);
          if (L2 && L2.s === 0 && agree(L2, R, apx, Rd[i].leadW)) continue;
        }
      }
      var L0 = members[members.length - 1], said = R.t, c = { expr: L0.t, said: R.single && !R.floor && R.rem == null && !R.mixed && !R.comp && R.lits[0] ? R.lits[0].raw : said, saidT: said, val: num(L0.v.lo), valT: /\//.test(said) && pt(L0.v) && L0.v.lo.d !== ONE && String(L0.v.lo.d).length <= 9 ? fa(String(L0.v.lo.n) + "/" + String(L0.v.lo.d)) : fmtV(L0.v), ok: !!how, kind: L0.run ? "run" : how === "quot" ? "quot" : R.floor ? "floor" : "chain", pos: segs[i - 1].at + L0.a, pe: segs[i].at + R.b, sx: !R.single || !!R.floor || R.rem != null || !!R.mixed || !!R.comp };
      /* «۲/۳ = ۱/۲ + ۱/۵»: حساب سمتِ راست است و عددِ نوشته سمتِ چپ */
      if (!R.single && !L0.run && L0.lits.length < R.lits.length && pt(R.v)) { c.expr = R.t; c.said = c.saidT = L0.t; c.val = num(R.v.lo); c.valT = /\//.test(L0.t) && R.v.lo.d !== ONE && String(R.v.lo.d).length <= 9 ? fa(String(R.v.lo.n) + "/" + String(R.v.lo.d)) : fmtV(R.v); }
      if (L0.div2 && (how === "quot" || how === "floor" || how === "rem" || (!how && R.single && R.lits[0].int))) { var qn = L0.lits[0].v.n / L0.lits[1].v.n, rn = L0.lits[0].v.n % L0.lits[1].v.n; c.valT = fa(String(qn)) + (rn ? " با باقی‌ماندهٔ " + fa(String(rn)) : ""); }
      /* واحد در ضرب/تقسیمِ بی‌واحد («سقف ۶۰ مترمربع، بارش ۳۲۰ میلی‌متر، پس ۶۰ × ۳۲۰ = ۱۹۲۰۰ مترمکعب»): واحدِ هر عدد از نوشتهٔ خودش در همین پیام؛
         خواناست ⇒ با ضریب‌ها سنجیده می‌شود؛ ناخوانا ⇒ «واحد نسنجیده» — نه «درست»، نه «نادرست» (C10) */
      if (R.single && !R.floor && R.rem == null && !R.mixed && !R.comp && L0.prod && CU) {
        var us = unitAt(segs[i].s.slice(R.b)), ou = L0.lits.map(function (l) { return l.mag || l.pct ? null : CU[l.raw] || null; });
        if (us && ou.some(Boolean)) {
          var all = ou.every(Boolean), dm = {}, si = F(ONE);
          if (all) { ou.forEach(function (u, k2) { var inv = k2 > 0 && L0.mops[k2 - 1] === "/"; EXK.forEach(function (x) { dm[x] = (dm[x] || 0) + (inv ? -1 : 1) * (u.ex[x] || 0); }); var q = mul(L0.lits[k2].v, u.si); si = inv ? div(si, q) : mul(si, q); });
            all = !!si && EXK.every(function (x) { return (dm[x] || 0) === (us.ex[x] || 0); }); }
          if (!all) { if (ou.filter(Boolean).length >= 2) c.unitUnread = true; }   // یک عددِ واحددار کنارِ عددِ بی‌واحد (ضریب، تعداد) حسابِ عددی است؛ دو واحدِ ناخوانا با هم ⇒ «واحد نسنجیده»
          else { var inU = div(si, us.si), okU = near(iv(inU), R.lits[0].v, tolSaid(R.lits[0], apx), apx);
            if (okU) { c.ok = true; c.unitOk = true; }
            else { c.ok = false; c.kind = "dim"; c.val = num(inU); c.valT = fmtF(inU) + " " + us.w; c.unit = (L0.mops.indexOf("/") >= 0 ? "تقسیمِ " : "ضربِ ") + ou.map(function (u) { return u.w; }).join(L0.mops.indexOf("/") >= 0 ? " بر " : " در ") + " بی تبدیل به " + us.w; } }
        }
      }
      if (!c.ok && disowned(t, c.pos, segs[i].at + R.b)) continue;
      out.push(c);
      /* عددی که خودش گرد کرد، در حسابِ بعدی همان بازه است */
      if (note && c.ok && R.single && !R.lits[0].mag && !R.lits[0].pct && pt(L0.v) && cmp(L0.v.lo, R.lits[0].v) !== 0 && how === "eq") note(R.lits[0].raw, hull(iv(R.lits[0].v), L0.v));
    }
  }

  /* ---------- واحد ---------- */
  var SUF = "(?:\u200c?(?:هاست|ها|ست|ئه|ای|اس|ه|ی)|ِ|\u0654)?", NOL = "(?![\u0621-\u063A\u0641-\u064A\u067E\u0686\u0698\u06A9\u06AF\u06CC\u200c])";
  /* [الگو، جنس، صورت، مخرج، نما] — ضریب نسبت به واحدِ پایهٔ همان جنس؛ «نما» بُعد است (L طول، T زمان، M جرم، P توان) برای ضرب/تقسیمِ کمیت‌ها */
  var UNITS = [
    ["کیلو[\\s\\u200c]*متر[\\s\\u200c]*(?:بر|در)[\\s\\u200c]*ساعت", "سرعت", 5, 18, { L: 1, T: -1 }], ["متر[\\s\\u200c]*بر[\\s\\u200c]*ثانیه", "سرعت", 1, 1, { L: 1, T: -1 }],
    ["کیلو[\\s\\u200c]*وات[\\s\\u200c]*ساعت", "انرژی", 3600000, 1, { P: 1, T: 1 }], ["مگا[\\s\\u200c]*وات[\\s\\u200c]*ساعت", "انرژی", 3600000000, 1, { P: 1, T: 1 }], ["وات[\\s\\u200c]*ساعت", "انرژی", 3600, 1, { P: 1, T: 1 }],
    ["مگا[\\s\\u200c]*ژول", "انرژی", 1000000, 1, { P: 1, T: 1 }], ["کیلو[\\s\\u200c]*ژول", "انرژی", 1000, 1, { P: 1, T: 1 }], ["ژول", "انرژی", 1, 1, { P: 1, T: 1 }],
    ["مگا[\\s\\u200c]*وات", "توان", 1000000, 1, { P: 1 }], ["کیلو[\\s\\u200c]*وات", "توان", 1000, 1, { P: 1 }], ["وات", "توان", 1, 1, { P: 1 }],
    ["متر[\\s\\u200c]*مکعب", "حجم", 1000, 1, { L: 3 }], ["میلی[\\s\\u200c]*لیتر", "حجم", 1, 1000, { L: 3 }], ["سی[\\s\\u200c]*سی", "حجم", 1, 1000, { L: 3 }], ["لیتر", "حجم", 1, 1, { L: 3 }],
    ["کیلو[\\s\\u200c]*متر[\\s\\u200c]*مربع", "سطح", 1000000, 1, { L: 2 }], ["سانتی?[\\s\\u200c]*متر[\\s\\u200c]*مربع", "سطح", 1, 10000, { L: 2 }], ["متر[\\s\\u200c]*مربع", "سطح", 1, 1, { L: 2 }], ["هکتار", "سطح", 10000, 1, { L: 2 }],
    ["کیلو[\\s\\u200c]*متر", "طول", 1000, 1, { L: 1 }], ["سانتی[\\s\\u200c]*متر", "طول", 1, 100, { L: 1 }], ["سانت", "طول", 1, 100, { L: 1 }], ["میلی[\\s\\u200c]*متر", "طول", 1, 1000, { L: 1 }], ["متر", "طول", 1, 1, { L: 1 }],
    ["میلی[\\s\\u200c]*گرم", "جرم", 1, 1000, { M: 1 }], ["کیلو[\\s\\u200c]*گرم", "جرم", 1000, 1, { M: 1 }], ["کیلو", "جرم", 1000, 1, { M: 1 }], ["گرم", "جرم", 1, 1, { M: 1 }], ["تن", "جرم", 1000000, 1, { M: 1 }],
    ["ساعت", "زمان", 3600, 1, { T: 1 }], ["دقیقه", "زمان", 60, 1, { T: 1 }], ["ثانیه", "زمان", 1, 1, { T: 1 }]
  ].map(function (u) { var f = F(B(u[2]), B(u[3])); return { re: new RegExp("^(\\s*)(" + u[0] + ")(" + SUF + ")" + NOL), dim: u[1], f: f, ex: u[4], si: u[1] === "حجم" ? div(f, F(B(1000))) : f }; });
  /* واحدِ مرکب («متر بر ثانیه»، «لیتر در دقیقه»، «تومن بر کیلو») که در فهرست نیست خوانده نمی‌شود (C10) */
  function unitAt(s) { for (var k = 0; k < UNITS.length; k++) { var m = UNITS[k].re.exec(s); if (m) { if (/^\s*(?:بر(?![آ-ی])|\/|در\s+(?:ساعت|دقیقه|ثانیه|روز|متر))/.test(s.slice(m[0].length))) return null; return { dim: UNITS[k].dim, f: UNITS[k].f, ex: UNITS[k].ex, si: UNITS[k].si, len: m[0].length, w: m[2].replace(/[\s\u200c]+/g, " "), suf: m[3] || "" }; } } return null; }
  ST.unitAt = unitAt;
  var WNUM = { "ده": 10, "شصت": 60, "صد": 100, "هزار": 1000, "ده هزار": 10000, "صد هزار": 100000, "یک میلیون": 1000000 };
  function quants(t) {
    var Q = [], re = /\d+(?:\.\d+)?/g, m;
    while ((m = re.exec(t))) {
      var a = m.index, e = a + m[0].length, pc = t[a - 1] || "", nc = t[e] || "";
      if (/[\d.\/]/.test(pc) || LAT.test(pc) || nc === "/" || nc === "%") continue;
      var v = dec(m[0]), mag = 0, mm, e2 = e; for (var g = 0; g < MAG.length; g++) if ((mm = MAG[g][0].exec(t.slice(e2)))) { mag += MAG[g][1]; e2 += mm[0].length; g = -1; }
      var u = unitAt(t.slice(e2)); if (!u) continue; if (mag) v = mul(v, F(p10(mag)));
      Q.push({ a: a, e: e2 + u.len, raw: m[0], mag: mag, v: v, u: u });
    }
    return Q;
  }
  function units(t, out, note) {
    var Q = quants(t);
    var skip = {}, CONN = new RegExp("^\\s*(?:بود|است|هست|بوده)?\\s*[،,]?\\s*(?:=|≈|یعنی|" + APX + ")\\s*" + APX + "?\\s*$");
    for (var k = 0; k + 1 < Q.length; k++) {
      var q1 = Q[k], q2 = Q[k + 1], bt = t.slice(q1.e, q2.a);
      /* تبدیل: «۱۷۰۰ ثانیه یعنی ۱۷ دقیقه»، «۵۸۵ سانت، یعنی ۵ متر و ۸۵ سانت» */
      if (skip[k]) continue;
      if (q1.u.dim === q2.u.dim && cmp(q1.u.f, q2.u.f) !== 0 && CONN.test(bt)) {
        var apx = /≈|حدود|تقریب|نزدیک/.test(bt), exp = div(mul(q1.v, q1.u.f), q2.u.f), said = q2.v, tl = tolSaid({ raw: q2.raw, mag: q2.mag, pct: false }, apx), saidT = q2.raw, q3 = Q[k + 2];
        if (q3 && q3.u.dim === q2.u.dim && cmp(q3.u.f, q2.u.f) < 0 && cmp(mul(q3.v, q3.u.f), q2.u.f) < 0 && /^\s*و\s*$/.test(t.slice(q2.e, q3.a))) { /* «۵ متر و ۸۵ سانت»: جزءِ دوم کمتر از یک واحدِ اول */ said = add(said, div(mul(q3.v, q3.u.f), q2.u.f)); tl = div(mul(tolSaid({ raw: q3.raw, mag: q3.mag, pct: false }, false), q3.u.f), q2.u.f); saidT = q2.raw + " " + q2.u.w + " و " + q3.raw + " " + q3.u.w; }
        var ok = near(iv(exp), said, tl, apx);
        if (!ok && disowned(t, q1.a, (q3 && saidT !== q2.raw ? q3 : q2).e)) continue;
        out.push({ expr: q1.raw + (q1.mag ? " × ۱۰^" + q1.mag : "") + " " + q1.u.w, said: saidT, saidT: saidT, val: num(exp), valT: fmtF(exp) + " " + q2.u.w, ok: ok, conv: true, kind: "conv", unit: ok ? "" : "تبدیلِ " + q1.u.w + " به " + q2.u.w, pos: q1.a, pe: (q3 && saidT !== q2.raw ? q3 : q2).e });
        if (note && !q2.mag) { if (ok && cmp(exp, q2.v) !== 0 && saidT === q2.raw) note(q2.raw, hull(iv(q2.v), iv(exp))); else if (apx) note(q2.raw, wide(iv(q2.v), tolSaid({ raw: q2.raw, mag: 0, pct: false }, false))); }
        continue;
      }
      /* جمع/تفریقِ دو کمیتِ هم‌جنس: «۱.۸ متر + ۲۰ سانت = ۲۱.۸» */
      var op = /^\s*([+\-~])\s*$/.exec(bt);
      if (op && q1.u.dim === q2.u.dim) {
        var sm = /^\s*(=|≈)\s*(\d+(?:\.\d+)?)(?![\d.\/])/.exec(t.slice(q2.e)); if (!sm) continue;
        if (Q[k + 2] && Q[k + 2].a === q2.e + sm[0].length - sm[2].length) skip[k + 1] = true;
        var sraw = sm[2], sv = dec(sraw), u3 = unitAt(t.slice(q2.e + sm[0].length)); if (u3 && u3.dim !== q1.u.dim) continue;
        var base = op[1] === "+" ? add(mul(q1.v, q1.u.f), mul(q2.v, q2.u.f)) : sub(mul(q1.v, q1.u.f), mul(q2.v, q2.u.f)), tl2 = tolSaid({ raw: sraw, mag: 0, pct: false }, sm[1] === "≈");
        var cand = u3 ? [u3] : [q1.u, q2.u], okU = cand.some(function (u) { return near(iv(div(base, u.f)), sv, tl2, sm[1] === "≈"); });
        var rawSum = op[1] === "+" ? add(q1.v, q2.v) : sub(q1.v, q2.v), slip = !okU && cmp(q1.u.f, q2.u.f) !== 0 && meet(iv(rawSum), wide(iv(sv), tl2)), cu = cand[0];
        out.push({ expr: q1.raw + " " + q1.u.w + " " + (op[1] === "+" ? "+" : "−") + " " + q2.raw + " " + q2.u.w, said: sraw, saidT: sraw, val: num(div(base, cu.f)), valT: fmtF(div(base, cu.f)) + " " + cu.w, ok: okU, kind: "mix", unit: okU ? "" : slip ? q1.u.w + "/" + q2.u.w + " بی تبدیل" : cmp(q1.u.f, q2.u.f) !== 0 ? "جمعِ " + q1.u.w + " و " + q2.u.w : "", pos: q1.a, pe: q2.e + sm[0].length });
      }
    }
    /* ضریبِ گفته: «یه متر صد میلی‌متره»، «هر متر مکعب هزار لیتره» — فقط با فعلِ ربطی (نرخ نیست: «هر ساعت ۴۵ دقیقه درس می‌خوانم») */
    var fr = /(?:^|[\s،؛.(:])(یه|یک|هر)\s+/g, fm;
    while ((fm = fr.exec(t))) {
      var p0 = fm.index + fm[0].length, u1 = unitAt(t.slice(p0)); if (!u1) continue;
      var r1 = t.slice(p0 + u1.len), nm = /^\s*(=|≈|،)?\s*(\d+(?:\.\d+)?|یک\s*میلیون|صد\s*هزار|ده\s*هزار|هزار|صد|شصت|ده)\s*(?:تا\s*)?/.exec(r1); if (!nm) continue;
      var u2 = unitAt(r1.slice(nm[0].length)); if (!u2 || u2.dim !== u1.dim || cmp(u1.f, u2.f) === 0) continue;
      var tail = r1.slice(nm[0].length + u2.len), cop = !!nm[1] && nm[1] !== "،" || /^(?:\u200c?ه|\u200c?ست|\u200c?ئه|\u200c?اس|هاست)$/.test(u2.suf) || /^\s*(?:است|هست|=)/.test(tail); if (!cop) continue;
      var w = nm[2].replace(/\s+/g, " "), nv = WNUM[w] != null ? F(B(WNUM[w])) : dec(w), ex = div(u1.f, u2.f), okF = cmp(ex, nv) === 0;
      out.push({ expr: "هر " + u1.w, said: w, saidT: w + " " + u2.w, val: num(ex), valT: fmtF(ex) + " " + u2.w, ok: okF, conv: true, kind: "factor", unit: okF ? "" : "تبدیلِ " + u1.w + " به " + u2.w, pos: p0, pe: p0 + u1.len + nm[0].length + u2.len });
    }
  }

  /* ---------- درگاه ---------- */
  function run(t, reg, note, CU) { var out = []; try { chains(t, reg, out, note, CU); } catch (e) { console.warn(e); } try { units(t, out, note); } catch (e2) { console.warn(e2); } return out.sort(function (a, b) { return a.pos - b.pos; }); }
  function arithChk(q, ctx) {
    var reg = {}, note = function (raw, v) { reg[raw] = reg[raw] ? hull(reg[raw], v) : v; };
    /* عددهایی که خودش «حدود/تقریباً» نوشته یا گرد کرده (در همهٔ پیام، نه فقط همین نقل) */
    var t0 = norm(ctx || q), ra = new RegExp("(?:≈|" + APX + ")\\s*(\\d+(?:\\.\\d+)?)(?![\\d.\\/%])", "g"), m;
    while ((m = ra.exec(t0))) { var tk = { raw: m[1], mag: 0, pct: false }; note(m[1], wide(iv(dec(m[1])), tolSaid(tk, false))); }
    run(t0, {}, note, null);
    /* واحدِ هر عدد از نوشتهٔ خودش (یک واحد برای یک عدد؛ دو واحدِ ناهم‌سان ⇒ ناخوانا) */
    var CU = {}; quants(t0).forEach(function (x) { if (x.mag) return; var o = CU[x.raw]; CU[x.raw] = o === undefined || (o && o.dim === x.u.dim && cmp(o.f, x.u.f) === 0) ? x.u : null; });
    /* نقلِ یک گام درونِ پیامش: همان پیام سنجیده می‌شود و فقط حساب‌هایی که در همین نقل تمام می‌شوند برمی‌گردند — جمعِ پیاپی («با ۱/۲۰ میشه ۴/۵») عددِ پیشینش را از پیام می‌گیرد */
    var tq = norm(q).trim(), at = ctx && tq ? t0.indexOf(tq) : -1;
    if (at >= 0 && ctx) return run(t0, reg, null, CU).filter(function (c) { return c.pe > at && c.pe <= at + tq.length && (c.kind === "run" || c.pos >= at); });
    return run(norm(q), reg, null, CU);
  }
  ST.arithChk = arithChk;
  /* عددهای نتیجه برای ردگیریِ وابستگیِ گام‌ها (نه تبدیل، نه سمتِ راستِ عبارتی) */
  ST.arithSaid = function (ck) {
    var N = function (c) { return /^\d+(?:\.\d+)?$/.test(String(c.said)); }, bad = (ck || []).filter(function (c) { return !c.ok && N(c); });
    /* گامی که صفحه حسابش را نادرست خواند: فقط همان عددِ نادرست وابستگی می‌آورد (نه عددهای درستِ همان گام — B25·D7)؛ وگرنه نتیجه‌های عددیِ گام */
    return (bad.length ? bad : (ck || []).filter(function (c) { return !c.conv && !c.sx && N(c); })).map(function (c) { return c.said; });
  };
  /* سطرِ کنارِ حکمِ هر گام: chk برای خودش (عددِ درست لو نمی‌رود)، chkM برای مربی. کنارِ «✗» هرگز «درست» نمی‌آید (DECISIONS_R25 P2). */
  function sideT(c) { return c.unit ? "" : "«" + fa(c.expr) + " = " + fa(c.saidT || c.said) + "»"; }
  ST.arithNote = function (ck, verdict) {
    ck = ck || []; var bad = ck.filter(function (c) { return !c.ok; });
    if (bad.length) return { bad: true,
      chk: bad.map(function (c) { return c.unit ? "واحد (" + c.unit + ") با عددِ نوشته‌شده نمی‌خواند" : "حسابِ «" + fa(c.expr) + "» با عددِ نوشته‌شده («" + fa(c.saidT || c.said) + "») نمی‌خواند"; }).join("؛ "),
      chkM: bad.map(function (c) { return c.unit ? "واحد: " + c.unit + " — با تبدیل " + c.valT + " می‌شود، نه " + fa(c.saidT || c.said) : "حسابِ صفحه: " + fa(c.expr) + " = " + c.valT + "، نه " + fa(c.saidT || c.said); }).join("؛ ") + " (عددِ درست را لو نده)" };
    if (!ck.length) return { bad: false, chk: "", chkM: "" };
    var unread = ck.some(function (c) { return c.unitUnread; });
    if (verdict !== "wrong" && !unread) { var o = "حسابِ عددی‌اش را صفحه سنجید: درست"; return { bad: false, chk: o, chkM: o }; }
    if (verdict !== "wrong") { var u0 = "عددهای این گام را صفحه سنجید و می‌خواند؛ واحدش را صفحه نسنجیده"; return { bad: false, chk: u0, chkM: u0 + " (واحد داوریِ مربی)" }; }
    var L = ck.map(sideT).filter(Boolean), w = (L.length ? "حسابِ " + L.join("، ") : "واحد و حسابِ نوشته‌شده") + " را صفحه سنجید و می‌خواند؛ ایرادِ این گام در خودِ این حساب نیست" + (unread ? " (واحدش را صفحه نسنجیده)" : "");
    return { bad: false, chk: w, chkM: w + " (داوریِ مربی)" };
  };
  /* سطرهای «حسابِ صفحه» برای پرامپت — هر پیامِ او، نه فقط نخستین (B_s) */
  ST.arithLines = function (ck) {
    return (ck || []).map(function (c) {
      if (c.ok) return "✓ «" + fa(c.expr) + " = " + fa(c.saidT || c.said) + "» می‌خواند" + (c.unitUnread ? " (فقط عدد؛ واحدش نسنجیده)" : "") + (c.kind === "quot" ? " (خارج‌قسمتِ صحیح؛ " + c.valT + ")" : "");
      return "✗ " + (c.unit ? "واحد (" + c.unit + "): «" + fa(c.expr) + "» را «" + fa(c.saidT || c.said) + "» نوشته — با تبدیل " + c.valT + " می‌شود" : "«" + fa(c.expr) + "» را «" + fa(c.saidT || c.said) + "» نوشته — حسابِ صفحه: " + c.valT);
    });
  };
  if (AS && AS.promptHooks) AS.promptHooks.push(function (s, msg) {
    try { var mt = String(msg || ""); if (/^\s*\[/.test(mt)) return "";
      var ck = arithChk(mt); if (!ck.length) return "";
      var bl = AS.boundLive ? AS.boundLive(s) : null, pid = bl && !bl.done ? bl.pid : "", pr = ST.priorFor ? ST.priorFor(s, pid) : null, bad = ck.filter(function (c) { return !c.ok; });
      if (!pr && !bad.length && !(ST.workMsg && ST.workMsg(mt))) return "";
      var out = ["# حسابِ صفحه روی همین پیام (دقیق، با عددِ گویا؛ فقط حساب و واحدی که خودش نوشته)"];
      ST.arithLines(pr || (ST.workMsg && ST.workMsg(mt)) ? ck : bad).forEach(function (l) { out.push("- زمینه (نه پرسشِ دوم): " + l); });
      out.push("- زمینه (نه پرسشِ دوم): حسابی را که صفحه «می‌خواند» نادرست نخوان" + (bad.length ? "؛ دربارهٔ «✗» عددِ درست را لو نده — بگذار خودش دوباره حساب کند و جای لغزش را بیابد" : "") + ". این سنجش فقط حساب و واحدِ نوشته است، نه درستیِ خودِ گام.");
      return out.join("\n");
    } catch (e) { return ""; }
  });
})(APP);
