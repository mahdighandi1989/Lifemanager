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
  var PI = { lo: F(B("3141592653589793"), p10(15)), hi: F(B("3141592653589794"), p10(15)) };
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
  function fmtV(v) { return pt(v) ? fmtF(v.lo) : narrow(v) ? "≈ " + fmtD(v.lo, 4) : "میانِ " + fmtF(v.lo) + " و " + fmtF(v.hi); }
  /* دورِ ۲۶ (Q1): مقدارِ صفحه به شکلِ نوشتهٔ خودِ او — درصد، اعشار، با همان واژهٔ مقیاس — نه کسرِ خام («-۱/۱۴۶»، D26-52). اعشارِ پایان‌ناپذیر با یک رقم بیش از رقم‌های خودش گرد می‌شود (همان رقمی که نشان می‌دهد چرا گردشده‌اش نمی‌خواند) */
  function narrow(v) { var w = sub(v.hi, v.lo), m = mx(v.hi, sub(F(Z), v.lo)); return m.n !== Z && cmp(mul(w, F(p10(9))), m.n < Z ? sub(F(Z), m) : m) < 0; }
  function term10(a) { var d = a.d, k = 0, j = 0; while (d % B(2) === Z) { d /= B(2); k++; } while (d % B(5) === Z) { d /= B(5); j++; } return d === ONE && Math.max(k, j) <= 6; }   // اعشارِ پایان‌پذیرِ کوتاه (همان مرزِ fmtF)
  function fmtD(a, k) {   // گرد به k رقمِ اعشار
    var neg = a.n < Z, n = neg ? -a.n : a.n, q = (n * p10(k) * B(2) + a.d) / (B(2) * a.d), t = String(q); while (t.length <= k) t = "0" + t;
    return fa((neg && q !== Z ? "-" : "") + t.slice(0, t.length - k) + (k ? "٫" + t.slice(t.length - k) : ""));
  }
  function fmtLike(v, tk, magW) {
    var d = tk ? (tk.raw.split(".")[1] || "").length : 0, sc = F(ONE), suf = "";
    if (tk && tk.pct) { sc = F(B(100)); suf = "٪"; } else if (tk && tk.mag) { sc = F(ONE, p10(tk.mag)); suf = magW ? " " + magW : ""; }
    var one = function (a) { a = mul(a, sc); return term10(a) ? fmtF(a) : "≈ " + fmtD(a, d + 1); };
    if (pt(v)) return one(v.lo) + suf;
    return (narrow(v) ? "≈ " + fmtD(mul(v.lo, sc), d + 1) : "میانِ " + one(v.lo) + " و " + one(v.hi)) + suf;
  }

  /* C45 (دورِ ۲۷؛ D27-7): مقدارِ صفحه در مقیاسِ خودِ او وقتی بخشِ صحیحش در آن مقیاس ۱ تا ۹۹۹ است («۳۵۳٫۱۶ هزار»)؛ وگرنه بزرگ‌ترین واژهٔ مقیاسی که بخشِ صحیح را ≥ ۱ نگه دارد («۶ میلیون»، هرگز «۶۰۰۰ هزار») */
  function fmtSc(v, tk, magW) {
    if (tk && !tk.pct && !tk.mag && tk.cm && pt(v)) { tk = { raw: "0", mag: tk.cm, pct: false }; magW = MAGW[tk.mag] || ""; }   // «۸ میلیون و ۲۵۰ هزار» (عددِ مرکب) ⇒ «۹ میلیون»
    if (!tk || tk.pct || !tk.mag || !pt(v)) return fmtLike(v, tk, magW);
    var ab = v.lo.n < Z ? sub(F(Z), v.lo) : v.lo, inS = div(ab, F(p10(tk.mag)));
    if (cmp(inS, F(ONE)) >= 0 && cmp(inS, F(B(1000))) < 0) return fmtLike(v, tk, magW);
    var g2 = 0; [9, 6, 3].some(function (x) { if (cmp(ab, F(p10(x))) >= 0) { g2 = x; return true; } return false; });
    var w2 = String(magW || "").replace(/^\S+/, MAGW[g2] || "").trim();
    return fmtLike(v, { raw: tk.raw, mag: g2, pct: false }, g2 ? w2 : String(magW || "").replace(/^\S+\s*/, ""));
  }
  /* ---------- یکدست‌سازیِ متن ---------- */
  var APX = "(?:حدود(?:ِ|اً|ا)?|تقریباً|تقریبا|نزدیک(?:ِ|\\s*به)?)";
  function digs(t) { return String(t == null ? "" : t).replace(/[۰-۹]/g, function (c) { return String(c.charCodeAt(0) - 1776); }).replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 1632); }).replace(/٫/g, ".").replace(/(\d)٬(?=\d)/g, "$1"); }
  /* دورِ ۲۷ب (leftovers؛ WORKLOG 137، «Update 2026-11-15»): بازنویسی‌های قدیمیِ norm («درصد ⇒ %»، «میشه ⇒ ＝»، «ضرب در»، «تقسیم بر»، «منفی»، جداکنندهٔ هزارگان، «…»، «حدود =»)
     طولِ متن را عوض می‌کردند و pos/pe ِ هر سنجش در متنِ او جابه‌جا می‌شد. حالا هر بازنویسی نقشهٔ جای‌ها را نگه می‌دارد (normM ⇒ {t, m}: m[i] = جای نویسهٔ i در متنِ خودِ او)
     و arithChk جای‌ها را پیش از بازگرداندن به متنِ خودِ او برمی‌گرداند — هیچ بازنویسی‌ای دیگر روی مسیرِ جای‌ها نیست. متنِ یکدست‌شده (norm) همان است که بود. */
  function rpM(st, re, rep) {
    var t = st.t, M = st.m, out = "", OM = [], last = 0, k, mm; re.lastIndex = 0; var g = re.global;
    while ((mm = re.exec(t))) { var a = mm.index, mt = mm[0], args = mm.slice(); args.push(a, t);
      var r = typeof rep === "function" ? rep.apply(null, args) : rep.replace(/\$(\d)/g, function (z, j) { return mm[+j] == null ? "" : mm[+j]; });
      out += t.slice(last, a); for (k = last; k < a; k++) OM.push(M[k]);
      out += r; for (k = 0; k < r.length; k++) OM.push(mt.length ? M[a + Math.min(k, mt.length - 1)] : (a < M.length ? M[a] : (M.length ? M[M.length - 1] + 1 : 0)));
      last = a + mt.length; if (!g) break; if (!mt.length) re.lastIndex++; }
    out += t.slice(last); for (k = last; k < t.length; k++) OM.push(M[k]);
    return { t: out, m: OM };
  }
  function normM(q) {
    var s0 = String(q == null ? "" : q), st = { t: s0, m: [] }; for (var k = 0; k < s0.length; k++) st.m.push(k);
    var R = function (re, rep) { st = rpM(st, re, rep); };
    R(/[۰-۹]/g, function (c) { return String(c.charCodeAt(0) - 1776); }); R(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 1632); }); R(/٫/g, "."); R(/(\d)٬(?=\d)/g, "$1");
    R(/\r/g, ""); R(/−/g, "-"); R(/\.{3,}/g, "…");
    R(/(^|[^\d.,])(\d{1,3}(?:,\d{3})+)(?![\d,])/g, function (m, a, b) { return a + b.replace(/,/g, ""); });
    R(/(\d)\s+–\s+(?=\d)/g, "$1 - ");                                   // خطِ تیرهٔ فاصله\u200cدار میانِ دو عدد = منها؛ بی\u200cفاصله («۱۰–۲۰») بازه است
    R(/(\d)(\s*در\s+صد)(?![آ-ی])/g, function (m, d, w) { return d + new Array(w.length - 3).join(" ") + "درصد"; });   /* دورِ ۲۷ (بانکِ R27 #50): «۸ در صد» = «۸ درصد» — هم‌طول */
    R(/(\d)\s*درصدِ\s*(?=\d)/g, "$1%ِ "); R(/(\d)\s*(?:درصد(?:ِ)?|٪|%)/g, "$1%"); R(/%\s*از\s*(?=\d)/g, "% * "); R(/(\d)%ِ\s*(?=\d)/g, "$1% * ");
    R(/منفی(?:ِ)?\s*(?=\d)/g, "-");
    R(/ضرب\s*در|ضربدر/g, " * "); R(/تقسیم\s*بر/g, " / "); R(/منهای/g, " ~ ");
    R(/به[\u200c\s]?علاوه[ٔۀ]?(?:\u200c?ی)?|بعلاوه[ٔۀ]?(?:\u200c?ی)?|به[\u200c\s]?اضافه[ٔۀ]?(?:\u200c?ی)?/g, " + ");
    R(/[×⋅·∙]/g, "*");   /* C26: «÷» تقسیم است، هرگز «/» ِ کسرِ چسبیده یا ممیز — در متن می‌ماند و توکن‌ساز آن را «/» ِ فاصله‌دار می‌خواند */
    R(/(\d%?)\s*[xX]\s*(?=\d)/g, "$1 * "); R(/(\d%?)\s+در\s+(?=\d)/g, "$1 * ");
    R(/(^|[\s،,.؛:])(?:میشه|می[\u200c\s]?شه|می[\u200c\s]?شود|میشود|می[\u200c\s]?شد|شد)(?=$|[\s،,.؛:!؟?]|\d)/g, "$1 ＝ ");   /* «＝» = برشی که از واژه آمده («میشه»): دورِ ۲۶ (C18) */
    R(/[≃≅]/g, "≈");
    R(/\s+در\s+(?=\d)/g, darProdF);
    R(new RegExp(APX + "\\s*[=＝]\\s*", "g"), "≈ "); R(new RegExp("[=＝]\\s*" + APX + "\\s*", "g"), "≈ ");
    /* «۴ از ۲۶ میشه ۱۵٪»: «از» پیش از نتیجهٔ درصدی، نسبت است (D26-24) — هم‌طول؛ دورِ ۲۷ (بانکِ R27 #35) */
    R(/(\d)(\s+از\s+)(\d+(?:\.\d+)?)(?=(?:\s+[^\d\s=＝≈.؟?!]+){0,4}\s*[،,]?\s*[=＝≈]\s*\d+(?:\.\d+)?%)/g, function (m, a, w, b) { return a + " ∕" + new Array(w.length - 1).join(" ") + b; });
    return st;
  }
  function norm(q) { return normM(q).t; }
  /* جای‌های یک سنجش (در متنِ یکدست‌شده) ⇒ جای‌ها در متنِ خودِ او */
  function backPos(M, list) { var f = function (x) { return x < 0 ? x : x < M.length ? M[x] : (M.length ? M[M.length - 1] + 1 : 0); }, fe = function (x) { return x <= 0 ? x : x - 1 < M.length ? M[x - 1] + 1 : (M.length ? M[M.length - 1] + 1 : 0); };
    (list || []).concat((list && list.unread) || []).forEach(function (c) { if (!c || c.bp27) return; c.bp27 = true; if (c.pos != null) c.pos = f(c.pos); if (c.pe != null) c.pe = fe(c.pe); if (c.cut != null) c.cut = f(c.cut); }); return list; }
  ST.arithNormM = normM;
  /* دورِ ۲۷ (C41؛ D27-5، A27-3، B27·D9، C27-25): «۳ متر در ۴ متر» ضرب است، مثلِ «ضربدر» — فقط وقتی هر دو سو عدد با واحدِ طول‌اند (پیش از «در» واحدِ کاملِ طول، پس از آن عدد).
     «۱۲۰ کیلومتر در ۲ ساعت» («در» = ظرفِ زمان) ضرب نیست و دست نمی‌خورد. جایگزینی هم‌طول است (« در » ⇒ « *  ») تا pos/pe ِ هر سنجش همان جای متنِ او بماند. */
  function darProd(t) { return t.replace(/\s+در\s+(?=\d)/g, darProdF); }
  function darProdF(m, at, all) {
    return (function () {
      var bf = all.slice(Math.max(0, at - 40), at), mm = /(\d+(?:\.\d+)?)(\s*[^\d\s][^\d]*)$/.exec(bf); if (!mm) return m;
      var u1 = unitAt(mm[2]); if (!u1 || u1.len !== mm[2].length || u1.dim !== "طول") return m;
      var af = all.slice(at + m.length), mn = /^\d+(?:\.\d+)?(?:\/\d+)?/.exec(af), u2 = mn ? unitAt(af.slice(mn[0].length)) : null; if (!u2 || u2.dim !== "طول") return m;
      return " *" + new Array(m.length - 1).join(" ");
    })();
  }
  /* ---------- نشانه‌ها ---------- */
  var FA_L = /[ء-غف-ٰٕپچژکگۀیے\u200cـ]/, LAT = /[A-Za-zÀ-ɏͰ-Ͽ]/;
  var MAG = [[/^\s*میلیارد(?![آ-ی])/, 9], [/^\s*میلیون(?![آ-ی])/, 6], [/^\s*هزار(?![آ-ی])/, 3]];
  /* C60 (دورِ ۲۷): عملوندهای به حروف («پنج و شش میشه سی») عددند. «نه» (هم «۹» و هم «نه») هرگز. دهگان + «و» + یکان («بیست و پنج») یک عدد است، نه جمع */
  var NUMW_U = { "یک": 1, "دو": 2, "سه": 3, "چهار": 4, "پنج": 5, "شش": 6, "شیش": 6, "هفت": 7, "هشت": 8 }, NUMW_T = { "ده": 10, "یازده": 11, "دوازده": 12, "سیزده": 13, "چهارده": 14, "پانزده": 15, "پونزده": 15, "شانزده": 16, "شونزده": 16, "هفده": 17, "هیفده": 17, "هجده": 18, "هیجده": 18, "نوزده": 19, "بیست": 20, "سی": 30, "چهل": 40, "پنجاه": 50, "شصت": 60, "هفتاد": 70, "هشتاد": 80, "نود": 90, "صد": 100 };
  function nwV(w) { return NUMW_U.hasOwnProperty(w) ? NUMW_U[w] : NUMW_T.hasOwnProperty(w) ? NUMW_T[w] : null; }
  var NUMW_C = { "یک": 1, "یه": 1, "دو": 2, "سه": 3, "چهار": 4, "پنج": 5, "شش": 6, "شیش": 6, "هفت": 7, "هشت": 8, "ده": 10, "یازده": 11, "دوازده": 12 };
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
      } else if (c === "π") { tk = { k: "n", raw: "π", v: PI.lo, ivl: PI, cst: true, pct: false, mag: 0, int: false, a: i, b: i + 1, sp: sp };   /* دورِ ۲۶ (C17، B26·D8): π ثابت است، نه مجهول — بازهٔ گویا */
      } else if (c === "÷") { tk = { k: "o", t: "/", a: i, b: i + 1, sp: true, spA: true };
      } else if (c === "∕") { tk = { k: "o", t: "/", of: true, a: i, b: i + 1, sp: sp, spA: /\s/.test(s[i + 1] || " ") };
      } else if ("+-*/~^".indexOf(c) >= 0) tk = { k: "o", t: c, a: i, b: i + 1, sp: sp, spA: /\s/.test(s[i + 1] || " ") };
      else if (c === "√") tk = { k: "f", t: "sqrt", a: i, b: i + 1, sp: sp };   /* C67 (دورِ ۲۷ب): «√(۱۵² + ۸²)» خوانده می‌شود — جذرِ دقیق یا بازهٔ گویای بسیار تنگ */
      else if (c === "²" || c === "³") tk = { k: "w2", t: c === "²" ? 2 : 3, a: i, b: i + 1, sp: sp };
      else if (c === "(") tk = { k: "(", a: i, b: i + 1, sp: sp };
      else if (c === ")") tk = { k: ")", a: i, b: i + 1, sp: sp };
      else if (FA_L.test(c)) { var j = i; while (j < n && FA_L.test(s[j])) j++; tk = { k: "w", t: s.slice(i, j), a: i, b: j, sp: sp }; }
      else if (LAT.test(c)) { var j2 = i; while (j2 < n && (LAT.test(s[j2]) || s[j2] === "_")) j2++; tk = { k: "L", t: s.slice(i, j2), a: i, b: j2, sp: sp }; }
      else tk = { k: "p", t: c, a: i, b: i + 1, sp: sp };
      T.push(tk); i = tk.b; sp = false;
    }
    /* دورِ ۲۶: «۲ هزار و ۵۰۰»، «۳ میلیون و ۲۰۰ هزار» یک عددند (جزءِ دوم کوچک‌تر از یک واحدِ مقیاسِ جزءِ اول) — پیش‌تر «۵۰۰ + ۵۰۰» از میانش خوانده می‌شد */
    for (var q = 0; q + 2 < T.length; q++) { var n1 = T[q], w0 = T[q + 1], n2 = T[q + 2];
      if (n1.k === "n" && n1.mag && !n1.pct && !n1.cst && w0.k === "w" && w0.t === "و" && n2.k === "n" && !n2.pct && !n2.cst && n2.v.d === ONE && cmp(n2.v, F(p10(n1.mag))) < 0 && !(T[q + 3] && T[q + 3].k === "o" && T[q + 3].t === "/" && !T[q + 3].sp)) {
        var sm = add(n1.v, n2.v); if (sm.d !== ONE) continue;
        var nt = { k: "n", raw: String(sm.n), v: sm, pct: false, mag: 0, cm: n1.cm || n1.mag, int: true, a: n1.a, b: n2.b, sp: n1.sp };
        if (!n2.mag && !n1.cm && n1.mag >= 6 && n1.mag % 3 === 0 && cmp(n2.v, F(B(1000))) < 0) nt.alt = add(n1.v, mul(n2.v, F(p10(n1.mag - 3))));
        T.splice(q, 3, nt); q--; } }
    /* دورِ ۲۷ (C41؛ D26-24 aD4): «سه تا ۸۰ میشه ۲۴۰» — واژهٔ شمارشیِ کوچک فقط درست پیش از «تا» و وقتی پس از «تا» (در حداکثر سه واژه) عدد آمده، عدد است. «نه» (هم «۹» و هم «نه») خوانده نمی‌شود */
    for (var q2 = 0; q2 + 1 < T.length; q2++) { var wq = T[q2];
      if (wq.k !== "w" || !NUMW_C.hasOwnProperty(wq.t) || T[q2 + 1].k !== "w" || T[q2 + 1].t !== "تا") continue;
      var hn = false; for (var q3 = q2 + 2; q3 < T.length && q3 <= q2 + 5; q3++) { if (T[q3].k === "n") { hn = true; break; } if (T[q3].k !== "w") break; }
      if (hn) T[q2] = { k: "n", raw: String(NUMW_C[wq.t]), v: F(B(NUMW_C[wq.t])), pct: false, mag: 0, int: true, wn: true, a: wq.a, b: wq.b, sp: wq.sp };
    }
    var nwTok = function (x, v, b) { return { k: "n", raw: String(v), v: F(B(v)), pct: false, mag: 0, int: true, wn: true, a: x.a, b: b || x.b, sp: x.sp }; };
    for (var q4 = 0; q4 < T.length; q4++) { var w4 = T[q4]; if (w4.k !== "w" || nwV(w4.t) == null) continue;
      var w5 = T[q4 + 1], w6 = T[q4 + 2];
      /* دهگان و یکان: یک عدد */
      if (w5 && w5.k === "w" && w5.t === "و" && w6 && w6.k === "w" && NUMW_T[w4.t] >= 20 && NUMW_T[w4.t] % 10 === 0 && NUMW_U.hasOwnProperty(w6.t)) { T.splice(q4, 3, nwTok(w4, NUMW_T[w4.t] + NUMW_U[w6.t], w6.b)); continue; }
      var pre = T[q4 - 1], pre2 = T[q4 - 2], adjN = function (y) { return y && (y.k === "n" || (y.k === "w" && nwV(y.t) != null)); };
      if ((w5 && w5.k === "w" && w5.t === "و" && adjN(w6)) || (pre && pre.k === "w" && pre.t === "و" && adjN(pre2)) || (q4 === 0 && (!w5 || w5.k === "p"))) T[q4] = nwTok(w4, nwV(w4.t));
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
      X.lits.push(tk); if (tk.ivl) return tk.ivl; var v = iv(tk.v);
      if (reg && reg[tk.raw] && !tk.mag && !tk.pct) v = hull(v, reg[tk.raw]);
      else if (wd && tk.raw.indexOf(".") >= 0) v = wide(v, halfUlp(tk));
      return v;
    }
    function atom(i, X) {
      var t = T[i]; if (!t) return null;
      if (t.k === "n") return { v: lit(t, X), e: i + 1 };
      if (t.k === "(") { var r = expr(i + 1, X, true); if (!r || !T[r.e] || T[r.e].k !== ")") return null; X.par++; return { v: r.v, e: r.e + 1 }; }
      if (t.k === "f" && T[i + 1] && (T[i + 1].k === "n" || T[i + 1].k === "(") && !(T[i + 1].k === "n" && (T[i + 1].pct || T[i + 1].mag || T[i + 1].cst))) {   // C67
        var ra = atom(i + 1, X); if (!ra) return null; var sq = isqrtIv(ra.v); if (!sq) return null; X.ops++; X.sqrt = (X.sqrt || 0) + 1; if (!pt(sq)) X.irr = true; X.rad = ra.v; X.radE = ra.e; return { v: sq, e: ra.e }; }
      return null;
    }
    /* C67: جذرِ گویا — دقیق وقتی صورت×مخرج مربعِ کامل است؛ وگرنه بازهٔ [⌊√⌋، ⌈√⌉] با ۱۵ رقمِ اعشار (گنگ: «≈» در شکلِ نوشتهٔ او) */
    function isqrtB(n) { if (n < Z) return null; if (n < B(2)) return n; var x = n, y = (x + ONE) / B(2); while (y < x) { x = y; y = (x + n / x) / B(2); } return x; }
    function isqrtIv(v) {
      if (!pt(v)) { var a = isqrtIv(iv(v.lo)), b = isqrtIv(iv(v.hi)); return a && b ? iv(a.lo, b.hi) : null; }
      var q = v.lo; if (q.n < Z) return null; var nd = q.n * q.d, r = isqrtB(nd); if (r * r === nd) return iv(F(r, q.d));
      var S = p10(15), r2 = isqrtB(nd * S * S); return iv(F(r2, q.d * S), F(r2 + ONE, q.d * S));
    }
    function pow(v, k) { var r = iv(F(ONE)); for (var q = 0; q < k; q++) r = iMul(r, v); return r; }
    function factor(i, X) {
      var t = T[i], neg = false;
      if (t && t.k === "o" && (t.t === "-" || t.t === "+") && !t.spA && T[i + 1] && (T[i + 1].k === "n" || T[i + 1].k === "(")) { neg = t.t === "-"; i++; X.un++; }
      var a = atom(i, X); if (!a) return null; var e = a.e, v = a.v, nx;
      while (T[e] && T[e].k === "n" && T[e].cst && !T[e].sp && !(T[e - 1] && T[e - 1].cst)) { v = iMul(v, lit(T[e], X)); e++; X.ops++; X.muls++; X.mops.push("*"); }   // «۱۴۴π»: ضربِ ضمنی در ثابت
      nx = T[e];
      if (nx && nx.k === "w2" && !nx.sp) { v = pow(v, nx.t); e++; X.ops++; }
      else if (nx && nx.k === "o" && nx.t === "^" && T[e + 1] && T[e + 1].k === "n" && T[e + 1].int && T[e + 1].raw.length <= 3) { v = pow(v, +T[e + 1].raw); e += 2; X.ops++; }
      return { v: neg ? iNeg(v) : v, e: e };
    }
    function term(i, X) {
      var a = factor(i, X); if (!a) return null; var v = a.v, e = a.e;
      for (;;) { var t = T[e]; if (!t || t.k !== "o" || (t.t !== "*" && t.t !== "/")) break; if (t.of && o.noOf) break; var s0 = { l: X.lits.length, o: X.ops, u: X.un, p: X.par }, b = factor(e + 1, X);
        if (!b) { X.lits.length = s0.l; X.ops = s0.o; X.un = s0.u; X.par = s0.p; break; }
        var r = t.t === "*" ? iMul(v, b.v) : iDiv(v, b.v); if (!r) return null; v = r; e = b.e; X.ops++; X.mops.push(t.t); if (t.t === "/") { X.divs++; if (!t.of && !t.sp && !t.spA) X.tsl++; } else X.muls++; }
      return { v: v, e: e };
    }
    function expr(i, X, inner) {
      var tl = [X.lits.length], a = term(i, X); if (!a) return null; var v = a.v, e = a.e, terms = [a.v];
      for (;;) { var t = T[e]; if (!t || t.k !== "o" || (t.t !== "+" && t.t !== "-" && t.t !== "~")) break;
        /* «۲۴ −۳ + ۴۲»: منهایِ چسبیده به عددِ بعد و جدا از عددِ پیش، علامتِ عددِ تازه است — عبارت همین‌جا تمام می‌شود */
        if (t.t === "-" && t.sp && !t.spA) break;
        var s0 = { l: X.lits.length, o: X.ops, u: X.un, p: X.par }, b = term(e + 1, X);
        if (!b) { X.lits.length = s0.l; X.ops = s0.o; X.un = s0.u; X.par = s0.p; break; }
        var bv = t.t === "+" ? b.v : iNeg(b.v); v = iAdd(v, bv); terms.push(bv); tl.push(s0.l); e = b.e; X.ops++; X.adds++; }
      if (!inner) { X.terms = terms; X.tl = tl; }
      return { v: v, e: e };
    }
    return function (i) {
      var X = { lits: [], ops: 0, un: 0, par: 0, divs: 0, muls: 0, adds: 0, tsl: 0, terms: [], mops: [] }, r = expr(i, X, false); if (!r) return null;
      X.v = r.v; X.s = i; X.e = r.e; X.a = T[i].a; X.b = T[r.e - 1].b; X.sqrtTop = T[i].k === "f" && X.sqrt === 1 && X.radE === r.e;
      X.single = X.lits.length === 1 && !X.ops && !X.par;
      X.mags = X.lits.filter(function (l) { return l.mag; }).map(function (l) { return l.mag; });
      X.frac = X.adds > 0 && X.divs > 0 && !X.muls && X.lits.every(function (l) { return l.int; });   /* جمع/تفریقِ کسرها: تساویِ عددهای گویای دقیق (C16) */
      X.div2 = X.lits.length === 2 && X.ops === 1 && X.divs === 1 && !X.par && !X.un && X.lits[0].int && X.lits[1].int;
      X.fr1 = X.div2 && X.tsl === 1;   /* C26: «۱۳/۱۲» ِ چسبیده نمادِ کسر است — تساویِ عددِ گویا، نه خارج‌قسمت («÷»، «تقسیم بر» ⇒ C25) */
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
  var AFTER_BAD = /^\s*(?:برابر(?=ِ?\s*[\d(])|به(?![آ-ی\u200c])|توان|ممیز|دوم(?![آ-ی])|سوم(?![آ-ی])|چهارم(?![آ-ی])|پنجم(?![آ-ی])|ششم(?![آ-ی])|هفتم(?![آ-ی])|هشتم(?![آ-ی])|نهم(?![آ-ی])|دهم(?![آ-ی])|صدم(?![آ-ی])|هزارم(?![آ-ی])|رادیکال|جذر|تا\s*\d+(?:\.\d+)?(?!\s*تا(?![آ-ی]))|و\s*\d+(?:\.\d+)?\s*(?:صدم|دهم|هزارم|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم|نهم)|:\s*\d)/;
  /* دورِ ۲۷ (C41): واژهٔ شمارش پیش از عددِ دوم («۴ تکه‌ی ۳ متری»، «۳ تا ۸۰»)؛ فعلِ عملگر پس از عدد («۵ تا رو کم میکنم») */
  var CNT = /^(?:تا|تکه|تیکه|قطعه|دونه|دانه|بسته|کیسه|جعبه|شاخه)(?:ِ|ٔ|ی|‌ی|‌ای|ای)?$/;
  var WOP = /^(?:تا\s+|عدد\s+|دونه\s+)?(?:(?:رو|را|ش|شو)\s+)?(?:(کم|کسر)|(اضافه|زیاد))\s*(?:می)?[‌\s]?(?:کنم|کنیم|کردم|کردیم|کنی|کنه|کرد|کن)$/;
  var MIXED = /^\s*و\s*(\d+)\/(\d+)(?!\d|\.\d|\/)(?!\s*[+\-*\/÷~^(=≈])/;
  var FLOOR = new RegExp("^\\s*و\\s*(?:خرده\\u200c?\\s?ای|خورده\\u200c?\\s?ای|خرده(?![آ-ی])|خورده(?![آ-ی])|اندی|کمی|یه\\s*چیزی|یک\\s*چیزی|یه\\s*کم(?![آ-ی])|یه\\s*ذره)(?:\\s*[،,]?\\s*(?:یعنی|دقیق\\u200c?تر(?:ش)?)\\s*(" + APX + ")?\\s*(\\d+(?:\\.\\d+)?)(?!\\d|\\.\\d|\\/))?");
  var HALFW = /^\s*و\s*نیم(?![آ-ی])/;
  var REM = /^\s*(?:[،,]\s*|و\s*|با\s*)?(?:باقی[\u200c\s]?مانده(?:ٔ|ی|\u200cی|ش|\u200cاش)?|باقیش)\s*(\d+)(?![\d.\/])|^\s*(?:[،,]\s*|و\s*)(\d+)\s*(?:تا\s*)?(?:هم\s*)?(?:باقی\s*)?(?:می[\u200c\s]?مونه|می[\u200c\s]?ماند|اضافه\s*میاد)/;
  function okNext(T, e) {   // پس از عبارت: عملگر، پرانتز، حرفِ لاتینِ چسبیده یا نمادِ ریاضی ⇒ عبارتِ عددیِ محض نیست
    var nx = T[e]; if (!nx) return true;
    if (nx.k === "w" && !nx.sp && nx.t.length === 1 && nx.t !== "و") return false;      // «۰٫۲۵ح»: ضریبِ یک مجهول
    if (nx.k === "o" && nx.of) return true;                                           // «… = ۳٫۲۵ از ۲۵ میشه ۱۳٪»: عددِ پیش از «از» نتیجهٔ همان تساوی است
    if (nx.k === "(" && nx.sp && T[e + 1] && (T[e + 1].k === "w" || T[e + 1].k === "L") && !FUNC_EN.test(T[e + 1].t || "")) return true;   // «… + ۱/۶ (پمپ …)»: پرانتزِ توضیح، نه ضرب
    if (nx.k === "o" || nx.k === "(" || nx.k === "w2" || nx.k === "f") return false;
    if (nx.k === ")" && nx.ok) return false;
    if (nx.k === "L") return nx.sp && nx.t.length > 1 && !FUNC_EN.test(nx.t);
    if (nx.k === "p" && MATH.test(nx.t)) return false;
    return true;
  }
  function okPrev(T, s) {
    var pv = T[s - 1]; if (!pv) return true;
    if (pv.k === "o" || pv.k === "(" || pv.k === "w2" || pv.k === "f") return false;
    if (pv.k === ")" && pv.ok) return false;
    if (pv.k === "n" && T[s].k === "(" && !T[s].sp) return false;                 // «۲(۱+۲)»: ضربِ ضمنی
    if (pv.k === "n" && T[s].k === "f") return false;                               // C67: «۲√۳» ضربِ ضمنی است — خوانده نمی‌شود (نسنجیده)
    if (pv.k === "L") return T[s].sp && pv.t.length > 1 && !FUNC_EN.test(pv.t);
    if (pv.k === "p" && (MATH.test(pv.t) || (pv.t === "…" && T[s].k === "o"))) return false;   // «… + ۲۰»: دنبالهٔ یک جمعِ سه‌نقطه‌ای، نه عبارتِ کامل
    if (pv.k === "w" && FUNC_FA.test(pv.t) && !(/^توان/.test(pv.t) && !(T[s - 2] && T[s - 2].k === "w" && T[s - 2].t === "به"))) return false;
    return true;
  }
  function textOf(seg, X) { return seg.slice(X.a, X.b).replace(/\s*÷\s*/g, " / ").replace(/\s*∕\s*/g, " از ").replace(/\s+/g, " ").replace(/\*/g, "×").replace(/\s*~\s*/g, " − ").replace(/-/g, "−").replace(/%/g, "٪").trim(); }

  /* دورِ ۲۷ (C42؛ A27-6، C27-13، U26): جمعِ سه‌نقطه‌ای فقط وقتی دنبالهٔ حسابی است که دو جملهٔ نخست و جملهٔ آخر آن را تعیین کنند («۱ + ۲ + … + ۲۰»، «۱ + ۳ + … + ۱۹»):
     تعداد = (آخر − اول) ÷ گام + ۱ (صحیح و بیش از جمله‌های نوشته)، جمع = تعداد × (اول + آخر) ÷ ۲ — حسابِ دقیق، نه قرارداد. هر سه‌نقطهٔ دیگر (گامِ ناجور، جملهٔ نوشتهٔ ناهم‌خوان، توان، کسر) ⇒ null (نسنجیده، C17) */
  function apAt(T, i, seg) {
    var nums = [], j = i, ell = -1;
    for (;;) { var t = T[j];
      /* C64: جملهٔ منفی («−۳ + −۱ + … + ۷») — منهای چسبیده به عدد */
      if (t && t.k === "o" && t.t === "-" && !t.spA && T[j + 1] && T[j + 1].k === "n" && !T[j + 1].pct && !T[j + 1].cst && !T[j + 1].mag && !T[j + 1].uw && !(T[j + 2] && (T[j + 2].k === "w2" || (T[j + 2].k === "o" && /[\/*^]/.test(T[j + 2].t))))) { nums.push({ k: "n", raw: "-" + T[j + 1].raw, v: sub(F(Z), T[j + 1].v), a: t.a, b: T[j + 1].b, int: T[j + 1].int }); j += 2; }
      else if (t && t.k === "n" && !t.pct && !t.cst && !t.mag && !t.uw && !(T[j + 1] && (T[j + 1].k === "w2" || (T[j + 1].k === "o" && /[\/*^]/.test(T[j + 1].t))))) { nums.push(t); j++; }
      else if (t && t.k === "p" && t.t === "…" && ell < 0 && nums.length >= 2) { ell = nums.length; j++; }
      else return null;
      if (!T[j] || T[j].k !== "o" || T[j].t !== "+") break; j++; }
    if (ell < 2 || ell >= nums.length || (T[i - 1] && T[i - 1].k === "o")) return null;
    var a = nums[0].v, d = sub(nums[1].v, a), c = nums[nums.length - 1].v; if (d.n === Z) return null;
    var cnt = div(sub(c, a), d); if (!cnt || cnt.d !== ONE || cnt.n < B(nums.length)) return null; cnt = add(cnt, F(ONE));
    for (var k = 0; k < ell; k++) if (cmp(nums[k].v, add(a, mul(F(B(k)), d))) !== 0) return null;
    for (var k2 = ell; k2 < nums.length; k2++) if (cmp(nums[k2].v, sub(c, mul(F(B(nums.length - 1 - k2)), d))) !== 0) return null;
    var sm = iv(div(mul(cnt, add(a, c)), F(B(2)))), X = { v: sm, lits: nums, ops: nums.length, adds: nums.length, terms: [sm], tl: [0], mags: [], mops: [], par: 0, un: 0, divs: 0, muls: 0, s: i, e: j, end: j, a: T[i].a, b: T[j - 1].b, ap: true, apN: cnt };
    X.t = textOf(seg, X); return X;
  }
  /* ---------- یک تکه: عبارتِ آغازی (گفته) و عبارتِ پایانی (حساب) ---------- */
  function leadOf(seg, T, o) {
    /* دورِ ۲۷ (D26-24 aD4): «سه تا ۸۰ میشه درست ۲۴۰» — قیدِ «درست/دقیقاً/همون» پیش از عددِ نتیجه بخشی از عدد نیست */
    var s0 = T.length > 1 && T[0].k === "w" && /^(?:درست|دقیقاً|دقیقا|همون|همان|کلاً|کلا|جمعاً|جمعا)$/.test(T[0].t) && T[1].k === "n" ? 1 : 0;
    if (!T.length || (T[s0].k !== "n" && T[s0].k !== "(" && T[s0].k !== "o" && T[s0].k !== "f")) return null;   // (apAt پایین منهای آغازین را هم می‌خواند — C64)
    var Xa = apAt(T, s0, seg); if (Xa) return okNext(T, Xa.e) ? Xa : null;   // C42: «۵۵ = ۱ + ۲ + … + ۱۰»
    var X = parser(T, Object.assign({}, o, { noOf: true }))(s0); if (!X || !okNext(T, X.e)) return null;
    var rest = seg.slice(X.b), m;
    X.t = textOf(seg, X); X.end = X.e;
    if (X.single && !X.un && X.lits[0].int) {
      if ((m = FLOOR.exec(rest))) { X.floor = true; X.t = textOf(seg, X) + " و خرده‌ای"; if (m[2]) { X.ref = { raw: m[2], apx: !!m[1] }; X.t = m[2]; } X.b += m[0].length; return X; }
      if ((m = REM.exec(rest))) { X.rem = B(m[1] || m[2]); X.t = textOf(seg, X) + " و باقی‌ماندهٔ " + (m[1] || m[2]); X.b += m[0].length; return X; }
    }
    if (X.single && !X.un && X.lits[0].int && (m = HALFW.exec(rest))) { var l0 = X.lits[0], hv = add(l0.v, HALF); X.v = iv(hv); X.lits = [{ k: "n", raw: l0.raw + ".5", v: hv, pct: false, mag: 0, int: false }]; X.t = textOf(seg, X) + " و نیم"; X.b += m[0].length; return X; }
    if (AFTER_BAD.test(rest)) return null;
    if ((m = /^\s*برابر(?:ِ)?(?![آ-ی])/.exec(rest))) { X.b += m[0].length; rest = seg.slice(X.b); }   /* «میشه ۵ برابر»: واژهٔ نسبت، مثلِ واحد (D26-24) */
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
      var t = T[i]; if (t.k !== "n" && t.k !== "(" && t.k !== "f" && !(t.k === "o" && (t.t === "-" || t.t === "+"))) continue;
      if (t.k === "o" && T[i - 1] && T[i - 1].k === "n" && !(t.sp && !t.spA)) continue;   // منهای دوتایی آغازِ عبارت نیست
      if (t.k === "n" || (t.k === "o" && t.t === "-")) { var Xa = apAt(T, i, seg); if (Xa && Xa.e === n) { if (!okPrev(T, i)) return null; return Xa; } }
      var X = P(i); if (!X || X.e !== n) continue;
      X.t = textOf(seg, X);
      /* C28 (دورِ ۲۶): «N تا M … میشه K» ضرب است («۳ تا بستهٔ ۸۰ تومنی میشه ۲۴۰») — فقط پیش از «میشه»، N صحیح، حداکثر سه واژه میانِ «تا» و M؛
         «بین/از/حدودِ/یا N تا M» بازه است، نه ضرب */
      /* دورِ ۲۷ (C41): همان ضرب با واژهٔ شمارشِ دیگر («۴ تکه‌ی ۳ متری = ۱۲ متر») و «N تا M تا میشه K» / «سه تا ۸۰» — واژهٔ شمارشِ غیرِ «تا» بازه نمی‌سازد، پس با «=» هم خوانده می‌شود */
      var xu = X.single && X.lits[0].uw ? String(X.lits[0].uw.text).trim().split(/[\s‌]+/) : [], tt2 = xu.length === 1 && xu[0] === "تا";
      if (X.single && !X.lits[0].pct && !X.lits[0].cst) {
        var kt = i - 1, nw = 0; while (kt >= 0 && T[kt].k === "w" && !(CNT.test(T[kt].t) && T[kt - 1] && T[kt - 1].k === "n")) { kt--; nw++; }
        var tN = kt >= 1 ? T[kt - 1] : null, tB = kt >= 2 ? T[kt - 2] : null, isTa = kt >= 0 && T[kt].k === "w" && T[kt].t === "تا";
        if (tN && nw <= 3 && T[kt].k === "w" && CNT.test(T[kt].t) && (o.wcut || !isTa || tt2) && tN.k === "n" && tN.int && !tN.pct && !tN.cst && !(tB && (tB.k === "o" || tB.k === "n" || (tB.k === "w" && /^(?:بین|از|حدود|حدودِ|حدوداً|یا|تا)$/.test(tB.t))))) {
          var Yn = parser(T, o)(kt - 1);
          /* «N تا M» ِ چسبیده بازه هم هست («۲ تا ۳ روز دیگه»): فقط بی‌واژه یا با صفتِ قیمت/اندازه پس از M («۴ تومنی»، «۲ کیلویی») یا با «تا» ِ دوم («۳ تا ۸ تا») ضرب است */
          var tight = isTa && nw === 0 && !(xu.length === 1 && /ی$/.test(xu[0]) || !xu.length || tt2);
          if (Yn && Yn.single && Yn.e === kt && okPrev(T, kt - 1) && !tight) { var pm = iMul(Yn.v, X.v);
            return { run: true, alts: [pm], v: pm, scaled: function (g) { return [iMul(pm, iv(F(p10(g))))]; }, t: textOf(seg, { a: Yn.a, b: X.b }), lits: Yn.lits.concat(X.lits), llits: [], ops: 1, terms: [], a: Yn.a, b: X.b, mags: (Yn.mags || []).concat(X.mags || []), times: true }; }
        }
      }
      /* دورِ ۲۷ (A27-18): عملگرِ فعلی روی نتیجهٔ پیشین — «… میشه ۲۴. بعد ۵ تا رو کم میکنم میشه ۱۹» (کم/کسر ⇒ منها؛ اضافه ⇒ جمع). فقط با «میشه» و فقط وقتی عددِ پیشین نتیجهٔ همین تکه است (میانشان جز ربط و نشانه نیست) */
      if (o.wcut && X.single && !X.lits[0].pct && !X.lits[0].cst && X.lits[0].uw && lead && lead.single && !lead.floor && lead.rem == null && i >= lead.end) {
        var wop = WOP.exec(String(X.lits[0].uw.text).trim()), mid = T.slice(lead.end, i).every(function (z) { return (z.k === "p" && /[،,.؛:]/.test(z.t)) || (z.k === "w" && /^(?:بعد|بعدش|حالا|پس|و|که|هم)$/.test(z.t)); });
        if (wop && mid) { var sgn = !!wop[2], wv = sgn ? iAdd(lead.v, X.v) : iSub(lead.v, X.v);
          return { run: true, alts: [wv], v: wv, scaled: function (g) { return [iMul(wv, iv(F(p10(g))))]; }, t: lead.t + (sgn ? " + " : " − ") + textOf(seg, { a: X.lits[0].a, b: X.lits[0].a + X.lits[0].raw.length }), lits: lead.lits.concat(X.lits), llits: [], ops: 1, terms: [], a: lead.a, b: X.b, mags: (lead.mags || []).concat(X.mags || []), wop: true }; }
      }
      /* جمعِ پیاپی: «… = ۳/۴. با ۱/۲۰ میشه ۴/۵» و «… میشه ۲۸٫۵، ضربدر ۲ میشه ۵۷» — فقط وقتی عددِ پیشین درست پیش از آن است (جز نشانهٔ نگارشی چیزی میانشان نیست) */
      /* دورِ ۲۷ (C27-22): «با پمپ ۳۸ میلیون میشه ۹۲» — یک یا دو واژهٔ نام میانِ «با» و عدد (فقط پیش از «میشه»)؛ آن واژه‌ها نامِ قلم‌اند، نه واحد: ضربِ «با» را نمی‌سازند */
      var bwN = 0; if (o.wcut && X.single && T[i - 1] && T[i - 1].k === "w" && !NOSTRIP.test(T[i - 1].t) && T[i - 1].t !== "تا") { for (var bq = 1; bq <= 2; bq++) { var tb = T[i - 1 - bq]; if (!tb || tb.k !== "w") break; if (tb.t === "با") { bwN = bq; break; } if (NOSTRIP.test(tb.t)) break; }
        /* فقط وقتی «با» درست پس از عددِ پیشین (یا ویرگولِ پس از آن) آمده و واژه‌ها نامِ قلم‌اند، نه صفتِ اضافه («با شعاعِ ۲» ⇒ نه) */
        var tb0 = bwN ? T[i - 2 - bwN] : null; if (bwN && (!tb0 || !(tb0.k === "n" || (tb0.k === "p" && /[،,]/.test(tb0.t))) || T.slice(i - bwN, i).some(function (z) { return /ِ$/.test(z.t); }))) bwN = 0; }
      var pv = bwN ? T[i - 1 - bwN] : T[i - 1], run = pv && ((pv.k === "w" && pv.t === "با") ? "با" : (pv.k === "w" && pv.t === "و" && o.wcut && X.single && T[i - 2] && T[i - 2].k === "n") ? "و" : (pv.k === "o" && "*/+~".indexOf(pv.t) >= 0) ? pv.t : "");   /* «۱۶ و ۱۲ میشه ۲۸» (D26-24): «و» پیش از «میشه» جمع است — فقط «می‌خواند» گفتنی است، ناهم‌خوانی‌اش «نسنجیده» */
      if (run) {
        /* دورِ ۲۶ (C17؛ B_x D6، D26-16/18): میانِ عددِ پیشین و «با/عملگر» واژه هم می‌تواند باشد («۱۲۰ هزار تومن دادم، با ۸۵ …»، «۲۱٫۶ مترمکعب، با ۲ مترمکعبِ آبِ چاه …») — ولی واژه از مرزِ جمله نمی‌گذرد */
        var k = i - 2 - bwN, gw = [], hard = false;
        while (k >= 0) { var g0 = T[k];
          if (g0.k === "p" && /[،,؛:]/.test(g0.t)) { k--; continue; }
          if (g0.k === "p" && /[.!\n]/.test(g0.t)) { if (gw.length) break; hard = true; k--; continue; }
          if (g0.k === "w" && !hard) { gw.unshift(g0.t); k--; continue; }
          break; }
        var pe = k >= 0 && lead && !lead.floor && lead.rem == null && lead.end === k + 1 ? lead : null;
        if (!pe && (run === "با" || run === "و" || (hard && !gw.length)) && k >= 0 && (T[k].k === "n" || (T[k].k === ")" && T[k].ok))) {   // «۳۸ با ۲۷ میشه ۶۵»: عددِ پیش از «با»
          var Tp = T.slice(0, k + 1), Pp = parser(Tp, o);
          for (var j = 0; j <= k && !pe; j++) { if (Tp[j].k !== "n" && Tp[j].k !== "(") continue; var Y = Pp(j); if (Y && Y.e === k + 1) { if (!okPrev(Tp, j)) break; Y.t = textOf(seg, Y); pe = Y; } }
        }
        if (!pe) return null; lead = pe;
        var andV = null, andA = null, andM = null;
        if (run === "و" && lead.single) { var k2 = lead.s != null ? lead.s : k; if (pe.e === k + 1) k2 = k;
          while (k2 >= 2 && T[k2 - 1].k === "w" && T[k2 - 1].t === "و" && T[k2 - 2].k === "n" && !T[k2 - 2].pct) { andV = iAdd(andV || iv(F(Z)), iv(T[k2 - 2].v)); andM = iMul(andM || iv(F(ONE)), iv(T[k2 - 2].v)); andA = T[k2 - 2].a; k2 -= 2; } }
        /* C40 (دورِ ۲۷؛ D27-18): «A و B میشه C» دو خوانش دارد — جمع (C28، خوانشِ نخست) و ضرب؛ حاصل‌ضرب کنارِ رکورد می‌ماند تا اگر جمع نخواند و ضرب خواند، صفحه بپرسد «ضرب کردی؟» (هرگز ✗) */
        var mulAlt = run === "و" && lead.single && !lead.lits[0].pct && !X.lits[0].pct ? iMul(andM ? iMul(lead.v, andM) : lead.v, X.v) : null;
        var pvv = lead.single && o.reg && o.reg[lead.lits[0].raw] ? hull(lead.v, o.reg[lead.lits[0].raw]) : lead.v, alts = [];
        if (andV) { pvv = iAdd(pvv, andV); lead = Object.assign({}, lead, { t: textOf(seg, { a: andA, b: lead.b }), a: andA }); }
        var lm = (lead.mags || []).length > 0, xm = (X.mags || []).length > 0, xl = X.lits[X.lits.length - 1], xw = xl && xl.uw ? xl.uw.text : "", gap = gw.length > 0 || !!xw || bwN > 0;
        if (run === "با" || run === "+" || run === "و") alts.push(iAdd(pvv, X.v)); if ((run === "با" && !gap) || run === "*") alts.push(iMul(pvv, X.v));   // «با» ِ ضرب فقط میانِ دو عددِ چسبیده (دورِ ۲۵)
        if (run === "~") alts.push(iSub(pvv, X.v)); if (run === "/") { var dv = iDiv(pvv, X.v); if (dv) alts.push(dv); }
        if (!alts.length) return null;
        var w1 = function (z) { return String(z || "").split(/[\s\u200c]+/)[0].replace(/[ِٔ]+$/, ""); };
        /* واژه میانِ عددها: حکم (✓ یا ✗) فقط وقتی هر دو عدد یک چیز را می‌شمارند (عددِ دوم بی‌واژه، یا همان واژهٔ عددِ پیشین) — وگرنه «نسنجیده» («۳ نفر بودیم، با ۲ ماشین میشه ۶ ساعت») */
        var pw = gw.filter(function (z) { return !/^(?:و|که|هم|بعد|بعدش|حالا|پس|تازه|یعنی)$/.test(z); })[0] || "";   // واژهٔ ربط واحدِ عددِ پیشین نیست («۱۳۵ و با ۲۰ تا میشه ۱۵۵»)
        var softNo = gap && (X.lits.some(function (l) { return l.pct; }) || (!!xw && !!pw && w1(xw) !== w1(pw)));
        var scaled = function (g) { var f = iv(F(p10(g))), Pv = lm ? pvv : iMul(pvv, f), Xs = xm ? X.v : iMul(X.v, f), a = [];
          if (run === "با" || run === "+" || run === "و") a.push(iAdd(Pv, Xs)); if (((run === "با" && !gap) || run === "*") && !xm) a.push(iMul(Pv, X.v));
          if (run === "~") a.push(iSub(Pv, Xs)); if (run === "/" && !xm) { var d2 = iDiv(Pv, X.v); if (d2) a.push(d2); }
          return a.length ? a : null; };
        return { run: true, alts: alts, v: alts[0], t: lead.t + (run === "با" ? " با " : run === "و" ? " و " : " " + (run === "*" ? "×" : run === "~" ? "−" : run) + " ") + X.t, lits: X.lits, ops: 1, terms: [], a: lead.a != null && lead.a < X.a ? lead.a : X.a, b: X.b,
          scaled: scaled, mags: (lead.mags || []).concat(X.mags || []), llits: lm ? [] : lead.lits, xlits: xm ? [] : X.lits, never: softNo, soft: run === "و", mulAlt: mulAlt, frac: "با+~".indexOf(run) >= 0 && (lead.divs > 0 || X.divs > 0) && lead.lits.concat(X.lits).every(function (l) { return l.int; }) };
      }
      if (!okPrev(T, i)) return null;
      /* عددِ تنها پس از حرفِ اضافه («با ۱/۲۰ …»، «از ۴۸ …») حسابِ کامل نیست */
      if (pv && pv.k === "w" && /^(?:با|از|به|تا|بر)$/.test(pv.t) && (X.single || X.div2)) return null;
      X.lineStart = !pv || (pv.k === "p" && /[\n.:؛]/.test(pv.t));
      return X;
    }
    return null;
  }
  /* دورِ ۲۶ (C15/C17؛ بانکِ R26 #35، #38): خوانشِ دوم — واژه‌های میانِ یک عدد و عملگرِ بعدی (یا پایانِ تکه) «واحد/نامِ» همان عددند: «۲۵ کیلووات‌ساعت × ۳٫۶»، «۱۲ ذرع × ۱٫۰۴»، «با ۲ مترمکعبِ آبِ چاه».
     عددها سنجیده می‌شوند؛ واحدِ ناشناخته هرگز «نادرست» نمی‌سازد (نسنجیده). */
  var NOSTRIP = /^(?:و|یا|که|با|از|به|بر|در|را|رو|هم|نه|برابر|توان|ممیز|منهای|ضرب|تقسیم|جمع|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم|نهم|دهم|صدم|هزارم|نیم|خرده|خورده|اندی)(?:ِ|ٔ)?$/;
  function stripUW(T, seg) {
    var o = [], ch = false;
    for (var i = 0; i < T.length; i++) {
      var a = T[i]; o.push(a); if (a.k !== "n" || a.cst) continue;
      var j = i + 1; while (j < T.length && T[j].k === "w") j++;
      if (j === i + 1) continue; var nx = T[j];
      var tcm = nx && nx.k === "p" && /[،,]/.test(nx.t) && j === T.length - 1;   // «… ۲۲ نفر قبول شدن، میشه …»: ویرگولِ پایانِ تکه
      if (nx && nx.k !== "o" && !tcm) continue;
      if (NOSTRIP.test(T[i + 1].t) || FUNC_FA.test(T[i + 1].t) || T[i + 1].t.length === 1) continue;   // یک حرفِ تنها («۰٫۲۵ح») مجهول است، نه واحد
      var u = unitAt(seg.slice(a.b, T[j - 1].b)), whole = !!u && a.b + u.len >= T[j - 1].b;
      if (u && !whole && !nx && /^(?:\s*(?:بگیر(?:م|یم|ی|ه)|باش(?:ه|د|م)|بش(?:ه|ود)|بود|است|هست))+\s*$/.test(seg.slice(a.b + u.len, T[j - 1].b))) whole = true;   // دورِ ۲۷ (B27·D9): «۲٫۵ متر در ۴ متر بگیرم = …»: فعل پس از واحد
      o[o.length - 1] = Object.assign({}, a, { uw: { u: whole ? u : null, text: seg.slice(T[i + 1].a, T[j - 1].b) } }); i = tcm ? j : j - 1; ch = true;
    }
    return ch ? o : null;
  }
  /* C15: واژهٔ مقیاس واحد است. خوانشِ «یک مقیاس»: جمله‌ای که واژهٔ مقیاس ندارد در همان مقیاس است («۳۰۰ + ۲۰ میلیون ÷ ۴۰ = ۸۰۰ هزار»: ۳۰۰ هزار)؛ جمله‌ای با دو واژهٔ مقیاس این خوانش را ندارد */
  /* C24: عددهایی که خوانشِ «یک مقیاس» به مقیاس می‌برد (همان جمله‌هایی که scaledV / scaled ضرب می‌کند) */
  function rdNums(X) {
    if (X.run) return (X.llits || []).concat(X.xlits || []);
    var o = []; if (!X.tl) return o;
    for (var k = 0; k < X.tl.length; k++) { var ls = X.lits.slice(X.tl[k], k + 1 < X.tl.length ? X.tl[k + 1] : X.lits.length); if (!ls.some(function (l) { return l.mag; })) o = o.concat(ls); }
    return o;
  }
  function scaledV(X, g) {
    if (!X.tl || !X.terms || X.terms.length !== X.tl.length) return null;
    var f = iv(F(p10(g))), v = null;
    for (var k = 0; k < X.terms.length; k++) {
      var ls = X.lits.slice(X.tl[k], k + 1 < X.tl.length ? X.tl[k + 1] : X.lits.length), nm = ls.filter(function (l) { return l.mag; }).length;
      if (nm > 1 || (!nm && ls.length && ls.every(function (l) { return l.pct; }))) return null;
      var tv = nm ? X.terms[k] : iMul(X.terms[k], f); v = v ? iAdd(v, tv) : tv;
    }
    return v ? [v] : null;
  }
  function tolSaid(tk, apx) {
    var d = (tk.raw.split(".")[1] || "").length, t;
    if (d) t = F(ONE, B(apx ? 1 : 2) * p10(d)); else if (!apx) t = HALF; else { var z = (tk.raw.match(/0+$/) || [""])[0].length; if (z >= tk.raw.length) z = tk.raw.length - 1; t = mul(HALF, F(p10(z))); }
    if (tk.mag) t = mul(t, F(p10(tk.mag))); if (tk.pct) t = div(t, F(B(100)));
    return t;
  }
  function truncF(a) { return a.n < Z ? -floorF({ n: -a.n, d: a.d }) : floorF(a); }
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
      var tk = R.lits[0];
      if (tk.cst) return hit(function (v) { return meet(v, R.v); }) ? "eq" : "";
      var t = R.mixed ? F(Z) : R.comp || tolSaid(tk, apx), sym = apx || R.mixed, sv = R.v.lo, plain = !R.mixed && !R.comp && !R.un;
      /* خوانش‌ها: نوشتهٔ عینی؛ و (C15) واژهٔ مقیاس به‌عنوانِ واحد */
      var cands = [{ A: Ls, s: sv, t: t }], Lm = L.mags || [], g = tk.mag || (Lm.length && Lm.every(function (x) { return x === Lm[0]; }) ? Lm[0] : 0);
      if (tk.alt) cands.push({ A: Ls, s: tk.alt, t: t });
      var GS = !plain || tk.pct ? [] : tk.cm ? [tk.cm, tk.cm - 3].filter(function (x) { return x > 0; }) : g ? [g] : [], SV = tk.alt ? [sv, tk.alt] : [sv];
      GS.forEach(function (g1) { var A2 = L.alts ? (L.scaled ? L.scaled(g1) : null) : scaledV(L, g1), f10 = F(p10(g1)); if (!A2) return;
        SV.forEach(function (s1) { cands.push({ A: A2, s: tk.mag || tk.cm ? s1 : mul(s1, f10), t: tk.mag || tk.cm ? t : mul(t, f10), g: g1 }); }); });
      /* C24: دو واژهٔ مقیاسِ گوناگون در یک سطر (عملوندها و نتیجه) ⇒ خوانشِ «یک مقیاس» خوانشِ معمول نیست: فقط نشان داده و پرسیده می‌شود. یک واژهٔ مقیاس با عددهای بی‌واژه همان یک خوانشِ سازگار است (C15) */
      var SW = {}; Lm.concat(tk.mag ? [tk.mag] : tk.cm ? [tk.cm] : []).forEach(function (x) { SW[x] = 1; }); var mixS = Object.keys(SW).length > 1;
      /* C16: رواداریِ C9 جایی است که خودش رقمِ اعشار یا واژهٔ تقریب نوشته. عددِ صحیح برای مقدارِ ناصحیحِ دقیق: جمعِ کسرها ⇒ نادرست (۱۳/۱۲ یک نیست)؛ وگرنه ⇒ نه ✓ نه ✗، صفحه می‌پرسد */
      var exact = plain && !apx && tk.raw.indexOf(".") < 0 && !R.bang, best = "", fracNo = false;   /* C44 (دورِ ۲۷؛ D27-23): درصدِ صحیح بی واژهٔ تقریب («۴ از ۲۶ میشه ۱۵٪») هم همین پرسش را دارد */
      for (var ci = 0; ci < cands.length; ci++) { var c0 = cands[ci];
        if (!c0.A.some(function (v) { return near(v, c0.s, c0.t, sym); })) continue;
        if (exact && (c0.A.every(pt) || L.irr) && !c0.A.some(function (v) { return pt(v) && cmp(v.lo, c0.s) === 0; })) { if (L.frac || L.fr1) fracNo = true; else best = best || "ask"; continue; }
        if (c0.g && mixS) { best = best || "reading" + c0.g; continue; }
        return "eq"; }
      if (best) return best; if (fracNo) return "";
      /* C25: عددِ صحیحی که بریدهٔ مقدارِ دقیق است (۱۰۰ ÷ ۷ = ۱۴، ۲٫۹ × ۳ = ۸) همان پرسش را دارد؛ عددِ صحیحِ دیگر ⇒ نادرست */
      if (exact && tk.int && !R.un && !L.frac && !L.fr1 && Ls.some(function (v) { return pt(v) && v.lo.d !== ONE && truncF(v.lo) === tk.v.n; })) return "ask";
      if (L.pctSum && !tk.pct && near(iScale(L.v, F(B(100))), sv, t, sym)) return "eq";                          // «۴۰٪ + ۳۰٪ = ۷۰»
      if (R.bang && tk.v.n >= Z && tk.v.n <= B(60) && hit(function (v) { return meet(v, iv(F(factB(tk.v.n)))); })) return "eq";   // «= ۵!»
      /* عددها می‌خوانند و فقط توانِ هزار فرق دارد ⇒ مقیاس را صفحه نمی‌تواند داوری کند (C15: هرگز ✗ به‌خاطرِ واژه) */
      /* C23: وقتی عملوندها هم واژهٔ مقیاس دارند، مقیاس جزوِ حساب است — «۲ میلیون × ۳ = ۶ هزار» نادرست است؛ پرسشِ مقیاس فقط برای واژه‌ای است که تنها کنارِ نتیجه یا تنها کنارِ عملوندهاست */
      var LmC = Lm.length || (L.lits || []).some(function (l) { return l.cm || l.cm2; });   // دورِ ۲۷ب (C15/C63): عددِ مرکبِ «N میلیون و M» هم واژهٔ مقیاسِ عملوند است
      if (plain && (tk.mag || tk.cm || LmC) && !(LmC && (tk.mag || tk.cm))) for (var cj = 0; cj < cands.length; cj++) for (var kk = 3; kk <= 12; kk += 3) { var up = F(p10(kk)), dn = F(ONE, p10(kk)), cc = cands[cj];
        if (cc.A.some(function (v) { return near(iScale(v, up), cc.s, cc.t, sym) || near(iScale(v, dn), cc.s, cc.t, sym); })) return "scale"; }
      return "";
    }
    if (L.single && !L.alts) return agree(R, L, apx, null);                                  // «۷/۱۴۶۰ = ۱/۲۱۰ + ۱/۳۰۶۶۰»، «۳۳٫۳ = ۳۰۰۰/۹۰»
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
    if (/غلط|اشتباه|نادرست|درست\s*نیست|درست\s*نبود/.test(af) || /اشتباهی|به\s*اشتباه|غلط/.test(bf)) return true;
    if (OTHER.test(bf)) return false;   /* C57 (دورِ ۲۷؛ D27-6): حسابِ نقل‌شده از کسِ دیگر سنجیده و نشان داده می‌شود («کارِ دیگری»)، نه پنهان — فقط وقتی خودش آن را نادرست نخوانده */
    return /نوشته\s*بود|گفته\s*بود|می[\u200c\s]?گفت|قبلاً|قبلا(?![آ-ی])/.test(bf);
  }
  /* C57 (دورِ ۲۷): «برادرم نوشته بود: …»، «اینا رو نوه‌م نوشته: …»، «داداشم حساب کرد …» — از آغازِ همان جمله تا پایانِ پیام (یا تا جمله‌ای که با «من/خودم» برمی‌گردد) کارِ دیگری است.
     فعلِ اول‌شخص («برای برادرم نوشتم»، «به داداشم گفتم») نسبت نیست. */
  var OTHER_N = "(?:برادر|داداش|خواهر|آبجی|دوست|رفیق|همکار|همکلاسی|هم\u200cکلاسی|بابا|پدر|مامان|مادر|نوه|پسر|دختر|همسر|شوهر|معلم|استاد|همسایه|عمو|دایی|خاله|عمه|پدربزرگ|مادربزرگ)";
  var OTHER = new RegExp("(?:^|[\\s،,:«(])(" + OTHER_N + "(?:\u200c?(?:م|ش|ت|مون|تون|شون|ه\u200c?م|ه\u200c?ش|ه\u200c?ت)|ِ\\s*[^\\s،,.:]+)?)\\s+(?:هم\\s+)?(?:[^\\s،,.:]+\\s+){0,3}?(?:(نوشت(?!م|یم|ی(?![آ-ی]))|حساب[\u200c\\s]*(?:ش\\s*)?کرد(?!م|یم|ی(?![آ-ی]))|درآورد(?!م|یم))|گفت(?!م|یم|ی(?![آ-ی]))|زد(?!م|یم))");
  var RECLAIM = /^\s*(?:(?:ولی|اما|و)\s+)?(?:من|خودم)(?![آ-ی])/;
  /* دامنه: همان جمله؛ اگر جمله فهرست را پیش می‌کشد («…: »، «اینا/این حساب‌ها/نسخه») تا پایانِ پیام یا تا جمله‌ای که با «من/خودم» برمی‌گردد. «گفت/زد» (فعلِ سست) فقط وقتی عدد پس از آن در همان جمله آمده —
     «مادرم اولش نه گفت … پس نمره میشه ۷» نسبتِ حساب نیست (pwB2 p9) */
  function otherSpans(t) {
    var S = [], re = /[.!؟?\n](?!\d)/g, m, last = 0, cut = [];
    while ((m = re.exec(t))) { cut.push([last, m.index + 1]); last = m.index + 1; } cut.push([last, t.length]);
    var open = null;
    cut.forEach(function (c) { var x = t.slice(c[0], c[1]), mm = OTHER.exec(x);
      if (open && RECLAIM.test(x)) { open.b = c[0]; S.push(open); open = null; }
      if (!mm || open) return;
      var after = x.slice(mm.index + mm[0].length), lst = /:/.test(after) || /(?:^|[\s«])(?:اینا|این[\u200c\s]?ها|این\s+حساب|همین\s+حساب|حساب[\u200c]?ها|نسخه)/.test(x);
      if (!mm[2] && !/\d/.test(after)) return;
      if (lst) open = { a: c[0], b: t.length, who: mm[1] }; else S.push({ a: c[0], b: c[1], who: mm[1] }); });
    if (open) S.push(open);
    return S;
  }
  var EXK = ["L", "T", "M", "P"];
  /* دورِ ۲۶ (C17): سطری که عملگر و نتیجه دارد ولی خواننده نمی‌تواند بخواندش «نسنجیده» است — نه سکوت، نه ✓. «عددی» یعنی: هر دو سمتِ برش عدد دارد، یکی عملگر دارد، و هیچ مجهولِ لاتینی
     در آن نیست (جبر داوریِ مربی است، مثلِ پیش)؛ ساعت («۸:۴۵») حساب نیست. جملهٔ بی‌عملگر («سه تا هشتاد تومن، دویست و چهل دادم») مثلِ پیش بیرون از خواننده است. */
  var SENT_P = /[.؛!?؟\n:،,—–]/;
  function tailStart(T) { for (var k = T.length - 1; k >= 0; k--) if (T[k].k === "p" && SENT_P.test(T[k].t)) return k + 1; return 0; }
  function headEnd(T) { for (var k = 0; k < T.length; k++) if (T[k].k === "p" && /[.؛!?؟\n،,]/.test(T[k].t)) return k; return T.length; }
  function hasNum(A) { return A.some(function (x) { return x.k === "n"; }); }
  function hasOp(A) {
    for (var j = 0; j < A.length; j++) { var x = A[j], bf = A.slice(0, j).some(function (y) { return y.k === "n" || y.k === ")"; });
      if (x.k === "o" && bf) return true; if (x.k === "w2" || x.k === "f" || (x.k === "p" && MATH.test(x.t))) return true;
      if (x.k === "w" && (FUNC_FA.test(x.t) || (x.t === "با" && A[j + 1] && A[j + 1].k === "n" && !A[j + 1].pct && bf === false))) return true;
      if (x.k === "L" && FUNC_EN.test(x.t)) return true; }
    return false;
  }
  /* مجهول: حرفِ لاتین، یا یک حرفِ فارسیِ تنها چسبیده به عدد/توان («۰٫۲۵ح»، «ع²») */
  function algebra(A) { return A.some(function (x, j) { return (x.k === "L" && !FUNC_EN.test(x.t)) || (x.k === "w" && x.t.length === 1 && x.t !== "و" && ((!x.sp && A[j - 1] && A[j - 1].k === "n") || (A[j + 1] && (A[j + 1].k === "w2" || (A[j + 1].k === "o" && A[j + 1].t === "^")) && !A[j + 1].sp))); }); }
  function dateLike(A) { for (var j = 0; j + 4 < A.length; j++) if (A[j].k === "n" && A[j].int && A[j + 1].k === "o" && A[j + 1].t === "/" && !A[j + 1].sp && A[j + 2].k === "n" && A[j + 2].int && !A[j + 2].sp && A[j + 3].k === "o" && A[j + 3].t === "/" && !A[j + 3].sp && A[j + 4].k === "n" && !A[j + 4].sp) return true; return false; }
  /* سمتِ چپِ برش به عدد (یا واحدِ همان عدد) ختم می‌شود — «… و تهران = ۱٫۲ + …» نام است، نه حساب */
  function endsNum(A) { var j = A.length - 1; while (j >= 0 && A[j].k === "w" && !NOSTRIP.test(A[j].t)) j--; return j >= 0 && (A[j].k === "n" || A[j].k === "w2" || (A[j].k === ")" && A[j].ok)); }
  function clock(A) { for (var j = 1; j + 1 < A.length; j++) if (A[j].k === "p" && A[j].t === ":" && A[j - 1].k === "n" && A[j + 1].k === "n" && !A[j + 1].sp) return true; return false; }
  function pretty(x) { return String(x).replace(/\s*÷\s*/g, " / ").replace(/\s*∕\s*/g, " از ").replace(/\s+/g, " ").replace(/＝/g, "میشه").replace(/\*/g, "×").replace(/\s*~\s*/g, " − ").replace(/-/g, "−").replace(/%/g, "٪").trim(); }
  function chains(t, reg, out, note, CU, U) {
    var re = /(?<![<>!=:≠])=(?![=>])|≈|＝/g, m, cuts = [], cutW = [], cutAt = [], last = 0, segs = [];
    while ((m = re.exec(t))) { segs.push({ s: t.slice(last, m.index), at: last }); cuts.push(m[0] === "≈"); cutW.push(m[0] === "＝"); cutAt.push(m.index); last = m.index + m[0].length; }
    segs.push({ s: t.slice(last), at: last }); if (segs.length < 2) return;
    function read(i, alt) {
      var sg = segs[i], T0 = tokens(sg.s), T = T0; if (alt) { T = slashDec(T0); if (!T) return null; }
      var mk = function (TT) { var ld = i > 0 ? leadOf(sg.s, TT, {}) : null;
        return { lead: ld, leadW: ld && !ld.single ? leadOf(sg.s, TT, { wide: true }) : null, trail: i < segs.length - 1 ? trailOf(sg.s, TT, { reg: reg, wcut: cutW[i] }, ld) : null, n: TT.length, leadN: TT.length, T: T0 }; };
      var r = mk(T);
      if ((i < segs.length - 1 && !r.trail) || (i > 0 && !r.lead)) {   // خوانشِ دوم: واژهٔ واحد میانِ عدد و عملگر
        var Ts = stripUW(T, sg.s), r2 = Ts ? mk(Ts) : null;
        if (r2 && !r.trail && r2.trail) { if (!r.lead && r2.lead) { r.lead = r2.lead; r.leadW = r2.leadW; r.leadN = r2.n; } r.trail = r2.trail; r.n = r2.n; }
        else if (r2 && !r.lead && r2.lead) { r.lead = r2.lead; r.leadW = r2.leadW; r.leadN = r2.n; }
      }
      return r;
    }
    var Rd = segs.map(function (_, i) { return read(i, false); }), members = [], MG = null;
    function unread(i, why) {
      if (!U) return; var a = segs[i - 1], b = segs[i], TL = Rd[i - 1].T, TR = Rd[i].T, s0 = tailStart(TL), e0 = headEnd(TR);
      if (hasOp(TL.slice(s0))) for (var q = 0; q < e0; q++) if (TR[q].k === "n") { e0 = q + 1; break; }   // حساب سمتِ چپ است: سمتِ راست تا همان عددِ نتیجه
      var ldU = Rd[i].lead; if (ldU && ldU.b != null) { var eL = 0; while (eL < TR.length && TR[eL].b <= ldU.b) eL++; if (eL > 0) e0 = eL; }
      var pos = a.at + (TL[s0] ? TL[s0].a : a.s.length), pe = b.at + (e0 > 0 ? TR[e0 - 1].b : 0);
      if (disowned(t, pos, pe)) return;
      U.push({ text: pretty(t.slice(pos, pe)), why: why || "", pos: pos, pe: pe, cut: cutAt[i - 1] });
    }
    function numeric(i) {
      var TL = Rd[i - 1].T, TR = Rd[i].T, A = TL.slice(tailStart(TL)), Bk = TR.slice(0, headEnd(TR));
      if (hasNum(A) && hasNum(Bk) && algebra(A) && A.some(function (x) { return x.k === "p" && x.t === "…"; }) && !algebra(Bk)) return true;   // C64: «۱ + ۲ + … + n = ۵۵» ⇒ نسنجیده
      if (!hasNum(A) || !hasNum(Bk) || algebra(A) || algebra(Bk) || clock(A) || clock(Bk) || dateLike(A) || dateLike(Bk)) return false;
      if (hasOp(A)) return endsNum(A) || A[A.length - 1].k === "p";
      return !cutW[i - 1] && hasOp(Bk) && endsNum(A);   // عددِ تنها پیش از «میشه ⟨عبارت⟩» شرط یا شماره است (C18)
    }
    var uwMix = function (X) { if (!X || !X.adds || !X.lits) return false; var W = {}; X.lits.forEach(function (l) { if (l.uw) W[l.uw.text.replace(/[ِٔ]+$/, "")] = 1; }); return Object.keys(W).length > 1; };
    for (var i = 1; i < segs.length; i++) {
      var L = Rd[i - 1].trail, R = Rd[i].lead;
      if (!L || !R) { members = []; if (numeric(i)) unread(i, ""); continue; }
      if (L.pctMix || R.pctMix) { members = []; unread(i, "درصدِ چه؟"); continue; }
      if (uwMix(L) || uwMix(R)) { members = []; unread(i, "واحدهای ناهم‌سان"); continue; }
      if (L.never) { members = []; unread(i, "واژه میانِ عددها"); continue; }
      /* زنجیره: تکهٔ پیشین سراسر یک عبارت بود و خودش حلقهٔ پیشین را داشت */
      var pure = Rd[i - 1].lead && !L.run && Rd[i - 1].lead.end === Rd[i - 1].leadN && L.s === 0;
      members = pure && members.length ? members.concat([L]) : [L];
      /* دورِ ۲۷ (A26-20 «ذرع»): «۵ ذرع = ۵٫۲ متر» — تبدیل از واحدی که صفحه نمی‌شناسد به واحدی که می‌شناسد ⇒ «نسنجیده» (C17)، نه سکوت */
      if (R.single && members.length === 1 && L.single && !L.run && L.lits[0].uw && !L.lits[0].uw.u && !/\s/.test(String(L.lits[0].uw.text).trim()) && unitAt(segs[i].s.slice(R.b)) && cmp(L.v.lo, R.v.lo) !== 0) { members = []; unread(i, "واحدِ ناشناخته"); continue; }
      if (R.single && !R.floor && R.rem == null && members.every(function (x) { return x.single && !x.run; })) continue;   // «x = ۵ = ۵»: عدد در برابرِ عدد حرفی ندارد
      var apx = cuts[i - 1], how = "";
      for (var k = members.length - 1; k >= 0 && !how; k--) how = agree(members[k], R, apx, Rd[i].leadW);
      var rdG = 0; if (/^reading/.test(how)) { rdG = +how.slice(7); how = "reading";
        /* همان عددها را خودش جای دیگری از همین پیام با همین واژهٔ مقیاس نوشته («۳۰۰ هزار تومن … ۳۰۰ + ۲۰ میلیون ÷ ۴۰ = ۸۰۰ هزار»، A26-1 s09) ⇒ خوانش از خودِ اوست: ✓ */
        if (!MG) { MG = {}; tokens(t).forEach(function (x) { if (x.k === "n" && x.mag && !x.pct) (MG[x.raw] = MG[x.raw] || {})[x.mag] = 1; }); }
        var rn0 = rdNums(members[members.length - 1]); if (rn0.length && rn0.every(function (l) { return MG[l.raw] && MG[l.raw][rdG]; })) how = "eq"; }
      if (!how && L.mulAlt && members.length === 1 && agree({ alts: [L.mulAlt], v: L.mulAlt, lits: L.lits, mags: L.mags, run: true }, R, apx, null)) how = "andmul";   // C40
      /* C63 (دورِ ۲۷ب، leftovers): «N میلیون و M» با M ِ بی‌بزرگی دو خوانش دارد (M واحد یا M هزار). عملوند: اگر فقط خوانشِ «هزار» حاصلِ او را درست کند همان خوانش است (✓)؛
         نتیجه: همین، در agree (tk.alt). اگر حکم به خوانش بسته است (خوانشِ «هزار» فقط تا مقیاس یا گرد کردن می‌خواند) صفحه نه ✓ می‌دهد نه ✗ — «کدام را نوشتی؟» (قاعدهٔ C24)؛
         اگر با هیچ خوانشی نمی‌خواند حکم روشن است (✗ در هر خوانش؛ بانکِ R26 s09 p15) و مقدارِ صفحه برای هر دو خوانش گفته می‌شود */
      var m2L = null, m2V = null, m2H = ""; if (!how && members.length === 1) { m2L = (L.lits || []).filter(function (l) { return l.alt && !l.cm2; })[0] || null;
        if (m2L) { var Tm2 = Rd[i - 1].T, hit2 = Tm2.indexOf(m2L) >= 0;
          var L2 = hit2 ? trailOf(segs[i - 1].s, Tm2.map(function (x) { return x === m2L ? Object.assign({}, x, { v: x.alt, alt: null, cm2: true, raw: String(x.alt.n) }) : x; }), { reg: reg, wcut: cutW[i - 1] }, Rd[i - 1].lead) : null;
          if (L2 && L2.a === L.a) { m2H = agree(L2, R, apx, Rd[i].leadW); if (m2H === "eq") { how = "eq"; L = L2; members = [L2]; m2L = null; } else m2V = L2.v; } else m2L = null; } }
      if (!how) {   // خوانش‌های طبیعیِ دیگرِ همان نوشته
        var a1 = read(i - 1, true) || Rd[i - 1], a2 = read(i, true) || Rd[i];
        /* خوانشِ دیگری درست درمی‌آید ولی همان نوشته با خوانشِ نخست نادرست است («۱/۲ + ۱/۳ = ۲/۵»: کسر یا ممیز؟) ⇒ نه «درست»، نه «نادرست»: به مربی «نسنجیده» (دورِ ۲۶، C17) */
        if ((a1 !== Rd[i - 1] || a2 !== Rd[i]) && a1.trail && a2.lead && agree(a1.trail, a2.lead, apx, a2.leadW)) { unread(i, "دو خوانش دارد (کسر یا ممیز؟)"); continue; }
        if (!L.run && L.lineStart && L.lits[0] && L.lits[0].raw.indexOf(".") > 0 && L.lits[0].a === L.a) {   // «۱.۲ + ۳ = ۵» = سطرِ ۱: ۲ + ۳ = ۵
          var s2 = segs[i - 1].s, cut = L.a + L.lits[0].raw.indexOf(".") + 1, T2 = tokens(s2.slice(cut)), L2 = trailOf(s2.slice(cut), T2, { reg: reg }, null);
          if (L2 && L2.s === 0 && agree(L2, R, apx, Rd[i].leadW)) continue;
        }
        /* C18 (دورِ ۲۶؛ C26-26، C26-31، A26-26): «میشه» تساوی نمی‌سازد مگر میانِ یک حساب و عددی که پس از آن آمده. عددِ تنها پیش از «میشه ⟨عبارت⟩» عددِ شرط است («با n = 4 میشه 1+3+5+7 = 16»)، نه مقدارِ ادعاشده؛
           «⟨عبارت⟩ میشه ⟨عبارت⟩» «می‌شود/تبدیل می‌شود» است («۱×۲ می‌شه ۲×۳») ⇒ نسنجیده، هرگز ✗ */
        if (cutW[i - 1] && !R.single) { members = []; if (!(L.single && !L.run)) unread(i, "«میشه» میانِ دو عبارت"); continue; }
        /* C28 (دورِ ۲۶): «A و B میشه R» جمع است — عملگرِ واژه‌ای، مثلِ «ضربدر»؛ ناهم‌خوانی‌اش «✗» است (پیش‌تر «نسنجیده»). واژه‌های ناهم‌جنس میانِ عددها همچنان «نسنجیده»‌اند (L.never) */
      }
      var L0 = members[members.length - 1], said = R.t, plainR = R.single && !R.floor && R.rem == null && !R.mixed && !R.comp, tkS = plainR ? R.lits[0] : null;
      var magW = tkS && tkS.mag ? segs[i].s.slice(tkS.a + tkS.raw.length, tkS.b).replace(/%/g, "").trim() : "";
      /* مقدارِ صفحه به شکلِ نوشتهٔ او: با واژهٔ مقیاس همان خوانشِ «یک مقیاس» نشان داده می‌شود («۳۰ میلیون»، نه «۳۰») */
      var Lm0 = L0.mags || [], g0 = tkS && !tkS.pct ? (tkS.mag || (Lm0.length && Lm0.every(function (x) { return x === Lm0[0]; }) ? Lm0[0] : 0)) : 0, sc0 = g0 ? (L0.alts ? (L0.scaled ? L0.scaled(g0) : null) : scaledV(L0, g0)) : null;
      /* C45 (دورِ ۲۷؛ B27·D13): وقتی خوانشِ عینی (واژهٔ مقیاس فقط کنارِ نتیجه) می‌خواند، مقدارِ صفحه همان است — «۳۵۳٫۱۶ هزار»، نه «۳۵۳۱۶۰ هزار» ِ خوانشِ «یک مقیاس» */
      var lgD = function (v) { var x = Math.abs(num(v.lo)), y = Math.abs(num(tkS.v)); return x && y ? Math.abs(Math.log(x / y)) : Infinity; };
      if (sc0 && tkS && tkS.mag && ((!how && lgD(L0.v) < lgD(sc0[0])) || (L0.alts || [L0.v]).some(function (v) { return near(v, tkS.v, tolSaid(tkS, apx), apx); }))) sc0 = null;   // C62: ✗ ⇒ مقدارِ عینی، بی واژهٔ مقیاسی که او ننوشته (۴۵۰ × ۱۲۰۰ ⇒ «۵۴۰ هزار»)
      var dv0 = sc0 ? sc0[0] : L0.v, dtk = tkS ? (tkS.mag || !sc0 ? tkS : { raw: tkS.raw, mag: g0, pct: false }) : null;
      var inForm = function (v) { var f = F(ONE); if (dtk && dtk.pct) f = F(B(100)); else if (dtk && dtk.mag) f = F(ONE, p10(dtk.mag)); return num(mul(v.lo, f)); };
      var c = { expr: L0.t, said: plainR && R.lits[0] ? R.lits[0].raw : said, saidT: said, val: tkS ? inForm(dv0) : num(L0.v.lo),
        valT: (/\//.test(said) || ((L0.frac || L0.fr1) && tkS && tkS.int)) && pt(L0.v) && L0.v.lo.d !== ONE && String(L0.v.lo.d).length <= 9 ? fa(String(L0.v.lo.n) + "/" + String(L0.v.lo.d)) : tkS ? fmtSc(dv0, dtk, magW) : fmtV(L0.v),
        ok: !!how, kind: L0.run ? "run" : R.floor ? "floor" : "chain", pos: segs[i - 1].at + L0.a, pe: segs[i].at + R.b, sx: !R.single || !!R.floor || R.rem != null || !!R.mixed || !!R.comp };
      if (how === "ask" || how === "scale") { c.ask = true; c.kind = how === "scale" ? "scale" : "round"; }
      if (!how && m2V) { c.m2T = pretty(segs[i - 1].s.slice(m2L.a, m2L.b)); c.m2W = MAGW[m2L.cm - 3] || "هزار"; c.m2A = [c.valT, tkS ? fmtSc(m2V, dtk, magW) : fmtV(m2V)];   // C63
        if (m2H) { c.ok = true; c.ask = true; c.kind = "m2"; } else c.valT = c.m2A[0] + " (با «" + fa(c.m2T) + " " + c.m2W + "»: " + c.m2A[1] + ")"; }
      if (how === "andmul") { c.ask = true; c.kind = "andmul"; c.mulT = tkS ? fmtLike(L0.mulAlt, tkS, magW) : fmtV(L0.mulAlt); }   // C40: نه ✓ نه ✗ — «ضرب کردی؟»
      if (how === "reading") {   // C24: خوانشِ معمول (هر مقیاس روی عددِ کنارش) نمی‌خواند و خوانشِ «همه در یک مقیاس» می‌خواند ⇒ همان خوانش نشان داده و پرسیده می‌شود
        c.ask = true; c.kind = "reading"; c.rdW = MAGW[rdG] || ""; c.rdN = rdNums(L0).map(function (l) { return l.raw; });
        c.valT = fmtLike(L0.v, tkS, magW); }
      if (L0.lits && L0.lits.some(function (l) { return l.uw; })) c.uw = true;
      /* C59 (دورِ ۲۷): «۸ و ۳ میشه ۱۱ متر مربع» — جمع می‌خواند و ✓ است؛ فقط مربی یک سطر می‌گیرد که واحدِ نتیجه (سطح/حجم) شاید ضرب را می‌خواست. صفحه پرچم نمی‌گذارد */
      if (how === "eq" && L0.soft && plainR) { var uq = unitAt(segs[i].s.slice(R.b)); if (uq && (uq.ex.L || 0) >= 2) c.unitQ = uq.w; }
      /* «۲/۳ = ۱/۲ + ۱/۵»: حساب سمتِ راست است و عددِ نوشته سمتِ چپ */
      if (!R.single && !L0.run && L0.lits.length < R.lits.length && pt(R.v)) { c.expr = R.t; c.said = c.saidT = L0.t; c.val = num(R.v.lo); c.valT = (/\//.test(L0.t) || (R.frac && L0.single && L0.lits[0].int)) && R.v.lo.d !== ONE && String(R.v.lo.d).length <= 9 ? fa(String(R.v.lo.n) + "/" + String(R.v.lo.d)) : L0.single && !L0.lits[0].cst ? fmtLike(R.v, L0.lits[0], "") : fmtV(R.v); }
      if (L0.div2 && !L0.fr1 && L0.lits[0].v.d === ONE && L0.lits[1].v.d === ONE && L0.lits[1].v.n > Z && L0.lits[0].v.n >= Z) { var qn = L0.lits[0].v.n / L0.lits[1].v.n, rn = L0.lits[0].v.n % L0.lits[1].v.n, remT = fa(String(qn)) + (rn ? " با باقی‌ماندهٔ " + fa(String(rn)) : "");
        if (how === "floor" || how === "rem" || (!how && R.single && R.lits[0].int && !(R.floor && R.ref))) c.valT = remT; else if (c.ask && c.kind === "round" && !(tkS && tkS.pct)) c.remT = remT; }
      if (!how && R.floor && R.ref && pt(L0.v)) c.valT = fmtLike(L0.v, { raw: R.ref.raw, mag: 0, pct: false }, "");                                   // ناهم‌خوانی در «یعنی ۲٫۹» است: مقدار به شکلِ همان اعشار
      if (c.ask && c.kind === "round" && tkS) c.valT = fmtSc(dv0, { raw: tkS.raw + ".0", mag: dtk.mag, pct: !!tkS.pct }, magW);
      /* C67 (دورِ ۲۷ب): بازحسابِ گنگ در شکلِ او — دقیق و تقریبی («√۲۰۸ ≈ ۱۴٫۴۲»)، با همان رقم‌های اعشارِ خودش (کمینه دو) */
      if (L0.sqrtTop && L0.irr && L0.rad && pt(L0.rad) && tkS && !tkS.pct && !tkS.mag) { c.valT = "√" + fmtF(L0.rad.lo) + " ≈ " + fmtD(L0.v.lo, Math.max(2, (tkS.raw.split(".")[1] || "").length)); c.irr = true; }                  // C16: مقدارِ دقیق به اعشار (یک رقم بیش از «یک رقمِ اعشار»)
      /* واحد (C10/C15): واحدِ هر عدد از واژهٔ کنارِ خودش یا از نوشتهٔ خودش در همین پیام. همه خوانا و هم‌بُعد با واحدِ نتیجه ⇒ با ضریب‌ها سنجیده می‌شود؛ عددها می‌خوانند و واحد ناخواناست ⇒ «فقط عدد»؛
         عددها نمی‌خوانند ⇒ خوانشِ پیشوندِ واحدِ نتیجه («۲۴۷۰ × ۸ ≈ ۱۹٫۸ کیلووات‌ساعت»، C26-9)؛ واحدِ ناشناخته کنارِ عددِ ناهم‌خوان ⇒ نسنجیده. برچسبِ «واحد» فقط وقتی عددِ بی‌تبدیل همان نوشتهٔ اوست (B_x D15) */
      if (plainR && !L0.run && !c.ask) {
        var us = unitAt(segs[i].s.slice(R.b)), ou = L0.lits.map(function (l) { return l.mag || l.pct || l.cst ? null : l.uw ? l.uw.u : (CU && CU[l.raw]) || null; }), unk = L0.lits.some(function (l) { return l.uw && !l.uw.u; }), dimDone = false;
        if (us && L0.prod && ou.some(Boolean)) {
          var all = ou.every(Boolean), dm = {}, si = F(ONE);
          if (all) { ou.forEach(function (u, k2) { var inv = k2 > 0 && L0.mops[k2 - 1] === "/"; EXK.forEach(function (x) { dm[x] = (dm[x] || 0) + (inv ? -1 : 1) * (u.ex[x] || 0); }); var q = mul(L0.lits[k2].v, u.si); si = inv ? div(si, q) : mul(si, q); });
            all = !!si && EXK.every(function (x) { return (dm[x] || 0) === (us.ex[x] || 0); }); }
          if (!all) { if (c.ok && (ou.filter(Boolean).length >= 2 || unk)) c.unitUnread = true; }   // یک عددِ واحددار کنارِ عددِ بی‌واحد (ضریب، تعداد) حسابِ عددی است؛ دو واحدِ ناخوانا با هم ⇒ «واحد نسنجیده»
          else { var inU = div(si, us.si), okU = near(iv(inU), R.lits[0].v, tolSaid(R.lits[0], apx), apx); dimDone = true;
            if (okU) { c.ok = true; c.unitOk = true; }
            else { var same = cmp(inU, L0.v.lo) === 0; c.val = num(inU); c.valT = fmtLike(iv(inU), R.lits[0], "") + " " + us.w;
              if (c.ok && !same) { c.kind = "dim"; c.unit = (L0.mops.indexOf("/") >= 0 ? "تقسیمِ " : "ضربِ ") + ou.map(function (u) { return u.w; }).join(L0.mops.indexOf("/") >= 0 ? " بر " : " در ") + " بی تبدیل به " + us.w; }
              c.ok = false; } }
        } else if (c.ok && unk) c.unitUnread = true;
        if (!c.ok && !dimDone && us) {   // واحدِ نتیجه با پیشوند: حساب در واحدِ هم‌جنسِ دیگری نوشته شده
          for (var ui = 0; ui < UNITS.length && !c.ok; ui++) { var u2 = UNITS[ui]; if (u2.dim !== us.dim || cmp(u2.f, us.f) === 0) continue;
            if (near(iScale(L0.v, div(u2.f, us.f)), R.lits[0].v, tolSaid(R.lits[0], apx), apx)) { c.ok = true; c.unitRead = us.w; } }
          if (!c.ok && pt(L0.v) && R.lits[0].v.n !== Z && L0.v.lo.n !== Z) {   // ✗ از عددهاست: مقدارِ صفحه در نزدیک‌ترین خوانشِ واحدِ خودش نشان داده می‌شود («۱۹٫۷۶ کیلووات ساعت»، نه «۱۹۷۶۰»)
            var sN = Math.abs(num(R.lits[0].v)), bestD = Math.abs(Math.log(Math.abs(num(L0.v.lo)) / sN)), bestV = null;
            UNITS.forEach(function (u3) { if (u3.dim !== us.dim || cmp(u3.f, us.f) === 0) return; var v3 = mul(L0.v.lo, div(u3.f, us.f)), d3 = Math.abs(Math.log(Math.abs(num(v3)) / sN)); if (d3 < bestD) { bestD = d3; bestV = v3; } });
            if (bestV) { c.val = num(bestV); c.valT = fmtLike(iv(bestV), R.lits[0], "") + " " + us.w; } }
        }
        if (!c.ok && !dimDone && unk) { unread(i, "واحدِ ناشناخته"); continue; }
      }
      if (!c.ok && disowned(t, c.pos, segs[i].at + R.b)) continue;
      out.push(c);
      /* عددی که خودش گرد کرد، در حسابِ بعدی همان بازه است */
      if (note && c.ok && !c.ask && !Lm0.length && !c.unitRead && R.single && !R.lits[0].mag && !R.lits[0].pct && pt(L0.v) && cmp(L0.v.lo, R.lits[0].v) !== 0 && how === "eq") note(R.lits[0].raw, hull(iv(R.lits[0].v), L0.v));
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
    var skip = {}, CONN = new RegExp("^\\s*(?:هم\\s*)?(?:بود|است|هست|بوده)?\\s*[،,]?\\s*(?:=|≈|یعنی|" + APX + ")\\s*" + APX + "?\\s*$");
    for (var k = 0; k + 1 < Q.length; k++) {
      var q1 = Q[k], q2 = Q[k + 1], bt = t.slice(q1.e, q2.a);
      /* تبدیل: «۱۷۰۰ ثانیه یعنی ۱۷ دقیقه»، «۵۸۵ سانت، یعنی ۵ متر و ۸۵ سانت» */
      if (skip[k]) continue;
      if (q1.u.dim === q2.u.dim && cmp(q1.u.f, q2.u.f) !== 0 && CONN.test(bt)) {
        var apx = /≈|حدود|تقریب|نزدیک/.test(bt), exp = div(mul(q1.v, q1.u.f), q2.u.f), said = q2.v, tl = tolSaid({ raw: q2.raw, mag: q2.mag, pct: false }, apx), saidT = q2.raw, q3 = Q[k + 2];
        if (q3 && q3.u.dim === q2.u.dim && cmp(q3.u.f, q2.u.f) < 0 && cmp(mul(q3.v, q3.u.f), q2.u.f) < 0 && /^\s*و\s*$/.test(t.slice(q2.e, q3.a))) { /* «۵ متر و ۸۵ سانت»: جزءِ دوم کمتر از یک واحدِ اول */ said = add(said, div(mul(q3.v, q3.u.f), q2.u.f)); tl = div(mul(tolSaid({ raw: q3.raw, mag: q3.mag, pct: false }, false), q3.u.f), q2.u.f); saidT = q2.raw + " " + q2.u.w + " و " + q3.raw + " " + q3.u.w; }
        var ok = near(iv(exp), said, tl, apx);
        if (!ok && disowned(t, q1.a, (q3 && saidT !== q2.raw ? q3 : q2).e)) continue;
        out.push({ expr: q1.raw + (q1.mag ? " × ۱۰^" + q1.mag : "") + " " + q1.u.w, said: saidT, saidT: saidT, val: num(exp), valT: fmtLike(iv(exp), { raw: q2.raw, mag: 0, pct: false }, "") + " " + q2.u.w, ok: ok, conv: true, kind: "conv", unit: ok ? "" : "تبدیلِ " + q1.u.w + " به " + q2.u.w, pos: q1.a, pe: (q3 && saidT !== q2.raw ? q3 : q2).e });
        if (note && !q2.mag) { if (ok && cmp(exp, q2.v) !== 0 && saidT === q2.raw) note(q2.raw, hull(iv(q2.v), iv(exp))); else if (apx) note(q2.raw, wide(iv(q2.v), tolSaid({ raw: q2.raw, mag: 0, pct: false }, false))); }
        continue;
      }
      /* جمع/تفریقِ دو کمیتِ هم‌جنس: «۱.۸ متر + ۲۰ سانت = ۲۱.۸» */
      var op = /^\s*([+\-~])\s*$/.exec(bt);
      if (op && q1.u.dim === q2.u.dim) {
        var sm = /^\s*(=|≈)\s*(\d+(?:\.\d+)?)(?!\d|\.\d|\/)/.exec(t.slice(q2.e)); if (!sm) continue;
        if (Q[k + 2] && Q[k + 2].a === q2.e + sm[0].length - sm[2].length) skip[k + 1] = true;
        var sraw = sm[2], sv = dec(sraw), u3 = unitAt(t.slice(q2.e + sm[0].length)); if (u3 && u3.dim !== q1.u.dim) continue;
        var base = op[1] === "+" ? add(mul(q1.v, q1.u.f), mul(q2.v, q2.u.f)) : sub(mul(q1.v, q1.u.f), mul(q2.v, q2.u.f)), tl2 = tolSaid({ raw: sraw, mag: 0, pct: false }, sm[1] === "≈");
        var cand = u3 ? [u3] : [q1.u, q2.u], okU = cand.some(function (u) { return near(iv(div(base, u.f)), sv, tl2, sm[1] === "≈"); });
        var rawSum = op[1] === "+" ? add(q1.v, q2.v) : sub(q1.v, q2.v), slip = !okU && cmp(q1.u.f, q2.u.f) !== 0 && meet(iv(rawSum), wide(iv(sv), tl2)), cu = cand[0];
        out.push({ expr: q1.raw + " " + q1.u.w + " " + (op[1] === "+" ? "+" : "−") + " " + q2.raw + " " + q2.u.w, said: sraw, saidT: sraw, val: num(div(base, cu.f)), valT: fmtLike(iv(div(base, cu.f)), { raw: sraw, mag: 0, pct: false }, "") + " " + cu.w, ok: okU, kind: "mix", unit: okU ? "" : slip ? q1.u.w + "/" + q2.u.w + " بی تبدیل" : cmp(q1.u.f, q2.u.f) !== 0 ? "جمعِ " + q1.u.w + " و " + q2.u.w : "", pos: q1.a, pe: q2.e + sm[0].length });
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
  function run(t, reg, note, CU) {
    var out = [], un = [], U = [];
    try { chains(t, reg, out, note, CU, U); } catch (e) { console.warn(e); }
    try { units(t.replace(/＝/g, "="), un, note); } catch (e2) { console.warn(e2); }
    /* خواننده‌ٔ واحد (تبدیل، جمعِ ناهم‌واحد) بر خوانشِ «فقط عدد» ِ همان سطر مقدم است */
    out = out.filter(function (c) { return !(c.uw && un.some(function (u) { return u.pos < c.pe && c.pos < u.pe; })); }).concat(un).sort(function (a, b) { return a.pos - b.pos; });
    out.unread = U.filter(function (u) { return !out.some(function (c) { return c.pos <= u.cut && u.cut < c.pe; }); });
    /* C57 (دورِ ۲۷): سطرِ کسِ دیگر نشان‌دار — سنجیده و نشان داده می‌شود، ولی نه به نامِ او ثبت می‌شود و نه «آره، گرد کردم» ِ او به آن می‌خورد (C43) */
    try { var OS = otherSpans(t); if (OS.length) out.concat(out.unread).forEach(function (c) { var o = OS.filter(function (x) { return c.pos >= x.a && c.pos < x.b; })[0]; if (o) c.other = o.who; }); } catch (e3) { }
    return out;
  }
  function arithChk(q, ctx) {
    var reg = {}, note = function (raw, v) { reg[raw] = reg[raw] ? hull(reg[raw], v) : v; };
    /* عددهایی که خودش «حدود/تقریباً» نوشته یا گرد کرده (در همهٔ پیام، نه فقط همین نقل) */
    var N0 = normM(ctx || q), t0 = N0.t, ra = new RegExp("(?:≈|" + APX + ")\\s*(\\d+(?:\\.\\d+)?)(?!\\d|\\.\\d|[\\/%])", "g"), m;
    while ((m = ra.exec(t0))) { var tk = { raw: m[1], mag: 0, pct: false }; note(m[1], wide(iv(dec(m[1])), tolSaid(tk, false))); }
    run(t0, {}, note, null);
    /* واحدِ هر عدد از نوشتهٔ خودش (یک واحد برای یک عدد؛ دو واحدِ ناهم‌سان ⇒ ناخوانا) */
    var CU = {}; quants(t0).forEach(function (x) { if (x.mag) return; var o = CU[x.raw]; CU[x.raw] = o === undefined || (o && o.dim === x.u.dim && cmp(o.f, x.u.f) === 0) ? x.u : null; });
    /* نقلِ یک گام درونِ پیامش: همان پیام سنجیده می‌شود و فقط حساب‌هایی که در همین نقل تمام می‌شوند برمی‌گردند — جمعِ پیاپی («با ۱/۲۰ میشه ۴/۵») عددِ پیشینش را از پیام می‌گیرد */
    var tq = norm(q).trim(), at = ctx && tq ? t0.indexOf(tq) : -1;
    if (at >= 0 && ctx) { var all = run(t0, reg, null, CU), In = function (c) { return c.pe > at && c.pe <= at + tq.length && (c.kind === "run" || c.pos >= at); }, part = all.filter(In); part.unread = (all.unread || []).filter(In); return backPos(N0.m, part); }
    var Nq = ctx ? normM(q) : N0; return backPos(Nq.m, run(Nq.t, reg, null, CU));
  }
  ST.arithChk = arithChk;
  /* عددهای نتیجه برای ردگیریِ وابستگیِ گام‌ها (نه تبدیل، نه سمتِ راستِ عبارتی) */
  ST.arithSaid = function (ck) {
    var N = function (c) { return /^\d+(?:\.\d+)?$/.test(String(c.said)); }, bad = (ck || []).filter(function (c) { return !c.ok && N(c); });
    /* گامی که صفحه حسابش را نادرست خواند: فقط همان عددِ نادرست وابستگی می‌آورد (نه عددهای درستِ همان گام — B25·D7)؛ وگرنه نتیجه‌های عددیِ گام */
    return (bad.length ? bad : (ck || []).filter(function (c) { return !c.conv && !c.sx && N(c); })).filter(function (c) { return !c.other; }).map(function (c) { return c.said; });   // C57: عددِ کسِ دیگر وابستگیِ گامِ او نیست
  };
  /* دورِ ۲۶: سه حالتِ هر سنجش — ✓ (ok)، ✗ (ok:false)، «؟» (ok:true + ask: نه ✓ نه ✗ — C16 گرد کردن، C15 مقیاس). سطرهای «نسنجیده» (C17) در آرایه نیستند: ck.unread = [{text, why, pos, pe}] */
  function askT(c, coach) {
    if (c.kind === "reading") return "با خوانشِ معمول (هر مقیاس روی عددِ کنارِ خودش) «" + fa(c.expr) + "» " + (coach ? c.valT + " می‌شود، نه «" + fa(c.saidT || c.said) + "»" : "با «" + fa(c.saidT || c.said) + "» نمی‌خواند") +
      "؛ اگر «" + c.rdN.map(fa).join("»، «") + "» را هم «" + c.rdW + "» بخوانی می‌خواند" + (coach ? " — نه ✓ و نه ✗؛ همین خوانش را نشانش بده و بپرس «این‌طور حساب کردی؟»" : " — این‌طور حساب کردی؟");
    if (c.kind === "andmul") return "«" + fa(c.expr) + "» را جمع بخوانی " + c.valT + " می‌شود و با «" + fa(c.saidT || c.said) + "» نمی‌خواند؛ ضرب بخوانی می‌خواند" + (coach ? " — «و» دو خوانش دارد: نه ✓ و نه ✗؛ از خودش بپرس «ضرب کردی؟»" : " — ضرب کردی؟");
    if (c.kind === "m2") return "«" + fa(c.m2T) + "» دو خوانش دارد («" + fa(c.m2T) + "» ِ واحد، یا «" + fa(c.m2T) + " " + c.m2W + "») — «" + fa(c.expr) + "» به ترتیب " + c.m2A[0] + " یا " + c.m2A[1] + " می‌شود؛ با خوانشِ دوم «" + fa(c.saidT || c.said) + "» فقط تا مقیاس/گرد کردن می‌خواند" +
      (coach ? " — نه ✓ و نه ✗ (حکم به خوانش بسته است)؛ از خودش بپرس کدام را نوشت" : " — کدام را نوشتی؟");
    if (c.kind === "scale") return "عددهای «" + fa(c.expr) + " = " + fa(c.saidT || c.said) + "» می‌خوانند، ولی مقیاسش (هزار/میلیون/میلیارد) را صفحه نسنجیده" + (coach ? " — نه ✓ و نه ✗؛ از خودش بپرس کدام مقیاس را می‌خواست" : "");
    return "«" + fa(c.expr) + "» " + (/^≈/.test(c.valT) ? "" : "دقیقاً ") + c.valT + " می‌شود" + (c.remT ? " (خارج‌قسمتِ صحیح " + c.remT + ")" : "") + " و «" + fa(c.saidT || c.said) + "» نوشته شده" + (coach ? " — نه ✓ و نه ✗؛ مقدارِ دقیق را بگو و بپرس گرد کرده یا همین را می‌خواست" : " — گرد شده؟");
  }
  var MAGW = { 3: "هزار", 6: "میلیون", 9: "میلیارد" };
  function unreadT(u) { return "حسابِ «" + fa(u.text) + "» را صفحه نسنجیده" + (u.why ? " (" + u.why + ")" : ""); }
  /* سطرِ کنارِ حکمِ هر گام: chk برای خودش (عددِ درست لو نمی‌رود)، chkM برای مربی. کنارِ «✗» هرگز «درست» نمی‌آید (DECISIONS_R25 P2). */
  function sideT(c) { return c.unit ? "" : "«" + fa(c.expr) + " = " + fa(c.saidT || c.said) + "»"; }
  ST.arithNote = function (ck, verdict) {
    ck = ck || []; var bad = ck.filter(function (c) { return !c.ok; }), asks = ck.filter(function (c) { return c.ask; }), UR = ck.unread || [], sure = ck.filter(function (c) { return c.ok && !c.ask; });
    var extra = asks.map(function (c) { return askT(c, false); }).concat(UR.map(unreadT)).join("؛ "), extraM = asks.map(function (c) { return askT(c, true); }).concat(UR.map(unreadT)).join("؛ ");
    if (bad.length) return { bad: true, ask: asks.length > 0, unread: UR.length > 0,
      chk: bad.map(function (c) { return c.unit ? "واحد (" + c.unit + ") با عددِ نوشته‌شده نمی‌خواند" : "حسابِ «" + fa(c.expr) + "» با عددِ نوشته‌شده («" + fa(c.saidT || c.said) + "») نمی‌خواند"; }).join("؛ "),
      chkM: bad.map(function (c) { return c.unit ? "واحد: " + c.unit + " — با تبدیل " + c.valT + " می‌شود، نه " + fa(c.saidT || c.said) : "حسابِ صفحه: " + fa(c.expr) + " = " + c.valT + "، نه " + fa(c.saidT || c.said); }).join("؛ ") + " (عددِ درست را لو نده)" };
    if (!ck.length && !UR.length) return { bad: false, chk: "", chkM: "" };
    var R0 = { bad: false, ask: asks.length > 0, unread: UR.length > 0 }, add = function (x, e) { return x && e ? x + "؛ " + e : (x || e); };
    if (!sure.length) { R0.chk = extra; R0.chkM = extraM ? extraM + " (داوریِ مربی)" : ""; return R0; }
    var unread = sure.some(function (c) { return c.unitUnread; });
    if (verdict !== "wrong" && !unread) { var o = asks.length || UR.length ? "حسابِ " + sure.map(sideT).filter(Boolean).join("، ") + " را صفحه سنجید و می‌خواند" : "حسابِ عددی‌اش را صفحه سنجید: درست"; R0.chk = add(o, extra); R0.chkM = add(o, extraM); return R0; }
    if (verdict !== "wrong") { var u0 = "عددهای این گام را صفحه سنجید و می‌خواند؛ واحدش را صفحه نسنجیده"; R0.chk = add(u0, extra); R0.chkM = add(u0 + " (واحد داوریِ مربی)", extraM); return R0; }
    var L = sure.map(sideT).filter(Boolean), w = (L.length ? "حسابِ " + L.join("، ") : "واحد و حسابِ نوشته‌شده") + " را صفحه سنجید و می‌خواند؛ ایرادِ این گام در خودِ این حساب نیست" + (unread ? " (واحدش را صفحه نسنجیده)" : "");
    R0.chk = add(w, extra); R0.chkM = add(w + " (داوریِ مربی)", extraM); return R0;
  };
  /* سطرهای «حسابِ صفحه» برای پرامپت — هر پیامِ او، نه فقط نخستین (B_s)؛ دورِ ۲۶: «؟» و «نسنجیده» هم سطر دارند (C16، C17) */
  function whoT(c) { return c.other ? "(کارِ دیگری — «" + c.other + "»؛ سنجیده شد ولی کارِ خودِ او یا نتیجهٔ او ثبت نمی‌شود) " : ""; }
  ST.arithLines = function (ck) {
    var L = (ck || []).map(function (c) { var l = lineOf(c); return c.other ? l.replace(/^(\S+ )/, function (m) { return m + whoT(c); }) : l; });
    function lineOf(c) {
      if (c.ask) return "؟ " + askT(c, true);
      if (c.ok) return "✓ «" + fa(c.expr) + " = " + fa(c.saidT || c.said) + "» می‌خواند" + (c.unitUnread ? " (فقط عدد؛ واحدش نسنجیده)" : c.unitRead ? " (با واحدِ " + c.unitRead + ")" : "") +
        (c.unitQ ? " — فقط برای تو (مربی): حساب جمع است و می‌خواند، ولی واحدِ نتیجه «" + c.unitQ + "» است؛ اگر به کار می‌آید یک بار بپرس منظورش ضربِ دو اندازه بود؟ (این ✗ نیست)" : "");
      return "✗ " + (c.unit ? "واحد (" + c.unit + "): «" + fa(c.expr) + "» را «" + fa(c.saidT || c.said) + "» نوشته — با تبدیل " + c.valT + " می‌شود" : "«" + fa(c.expr) + "» را «" + fa(c.saidT || c.said) + "» نوشته — حسابِ صفحه: " + c.valT);
    }
    ((ck && ck.unread) || []).forEach(function (u) { L.push("— " + whoT(u) + unreadT(u) + " — نه ✓ و نه ✗؛ خودت بسنج و اگر روشن نیست از خودش بپرس"); });
    return L;
  };
  ST.arithUnread = function (ck) { return ((ck && ck.unread) || []).slice(); };
  /* ---------- اعتراض به «✗» ِ صفحه (پرسشِ ۳۶ ِ مالک؛ A26-2، A26-3؛ بانکِ R26 #25، #41، #42) ----------
     وقتی «✗» ِ حسابِ صفحه روی میز است (گامِ دفترِ «کارِ پیشین» با pageBad، یا «✗» ِ پیامِ پیشینِ همین گفت‌وگو) و او می‌گوید حسابش درست است، صفحه همان نوشته را **یک بار** دوباره می‌سنجد و هر دو حساب را
     نشان می‌دهد. خواند ⇒ «✗» همه‌جا برداشته می‌شود (دفتر از راهِ خودِ ادغامِ a45 — ST.priorOf + ST.priorMerge —، کارنامه، 📜) با تاریخچه؛ نخواند ⇒ حکم می‌ماند، با حسابِ صفحه به‌عنوانِ شاهد، و دوباره پرسیده نمی‌شود.
     بی «✗» ِ روی میز هیچ کاری نمی‌شود («درست حساب کردم که دیرم میشه»). */
  var CONTEST = /درست\s*حساب\s*کرد|حساب(?:م|ش|ِ\s*من)?\s*(?:رو\s*|را\s*)?درست(?![\u200c\s]*(?:کرد|می[\u200c\s]?کن|ش\s*کرد))|غلط\s*نیست|اشتباه\s*(?:نکرد|نیست)|دوباره\s*(?:نگاه|حساب|بسنج|چک|ببین|بشمار)|ماشین[‌\s]?حساب|(?:خطا|اشتباه)\s*از\s*(?:تو|صفحه|شما|خودت)|تو\s*اشتباه|همون\s*[0-9۰-۹.٫]+\s*(?:میشه|می[‌\s]?شه|می[‌\s]?شود|درمیاد|در\s*میاد)|چرا\s*(?:غلط|نادرست|ایراد)|درست(?:ه|\s*است|\s*بود)\s*دیگه/;
  var clip = function (x, n) { x = String(x || "").replace(/\s+/g, " ").trim(); return x.length > n ? x.slice(0, n - 1) + "…" : x; };
  function nowIso() { try { return new Date().toISOString(); } catch (e) { return ""; } }
  function lastUser(s) { var M = (s && s.msgs) || []; for (var i = M.length - 1; i >= 0; i--) if (M[i] && M[i].role === "user" && !/^\s*\[/.test(String(M[i].text || ""))) return M[i]; return null; }
  function ledgerOf(s) {
    var bl = AS && AS.boundLive ? AS.boundLive(s) : null, pid = bl && !bl.done ? bl.pid : "", pr = ST.priorFor ? ST.priorFor(s, pid) : null;
    return { pid: pid, pr: pr, save: function () { try { var S = A.S, pg = pid && S ? S.get("eprog_" + pid) : null; if (pg && pg.solve && pg.solve.live && pg.solve.live.prior === pr) S.put(pg); else if (S && s && s.id) S.put(s); } catch (e) { } } };
  }
  /* C29 (دورِ ۲۶): اعتراضی که حق با او نیست — حکم می‌ماند، صفحه می‌گوید یک بار دوباره سنجید و تکه‌ای را که نمی‌خواند نشان می‌دهد؛ عددِ درست هرگز گفته نمی‌شود (نه به او، نه در دفتر و 📜) */
  function bothT(c) { return "نوشتهٔ خودش: «" + fa(c.expr) + " = " + fa(c.saidT || c.said) + "» · بازسنجیِ صفحه: همین تکه — «" + fa(c.expr) + "» در برابرِ «" + fa(c.saidT || c.said) + "» — نمی‌خواند"; }
  function keyOf(x) { return norm(String(x)).replace(/÷/g, "/").replace(/＝/g, "=").replace(/∕/g, "/").replace(/[\s×*]+/g, function (m) { return /[×*]/.test(m) ? "*" : ""; }); }
  /* ST.arithContest(s, msg) ⇒ null یا { cleared: [...], kept: [...], lines: [سطرهای مربی], note: سطرِ خودِ او } — یک بار برای هر پیام (s.seq) */
  ST.arithContest = function (s, msg) {
    var mt = String(msg || ""); if (!s || !mt.trim() || /^\s*\[/.test(mt)) return null;
    var key = String(s.id || "") + ":" + String(s.seq || 0), C = s.coach = s.coach || {};
    if (C.arithRe && C.arithRe.key === key) return C.arithRe.out;
    var G = ledgerOf(s), um = lastUser(s), at = String((um && um.at) || nowIso()), out = { cleared: [], kept: [], lines: [], note: "" };
    var steps = G.pr ? G.pr.steps.filter(function (x) { return x.pageBad && x.verdict === "wrong" && !x.fixed && !(x.re && x.re.by === "page" && x.reAt); }) : [];
    /* «✗» ِ پیامِ پیشین که همان گامِ دفتر است و یک بار بازسنجی شده، دوباره روی میز نیست */
    var doneK = G.pr ? G.pr.steps.filter(function (x) { return x.re && x.re.by === "page"; }).map(function (x) { return keyOf(x.fixed ? x.fixed.t : x.quote); }) : [];
    /* دورِ ۲۷ (D27-2): «✗» ای که خودش همان گام را درست کرد (اصلاحِ خودش در دفتر) دیگر روی میز نیست — متنِ پیشینِ گام */
    if (G.pr) G.pr.steps.forEach(function (x) { if (x.fixed && x.quote) doneK.push(keyOf(x.quote)); });
    var mem = (C.arithBad || []).filter(function (b) { return !b.re && b.seq !== (s.seq || 0) && !doneK.some(function (k) { return k.indexOf(keyOf(b.expr)) >= 0; }); });
    if (!steps.length && !mem.length) return null;
    /* اعتراض: واژهٔ خودش، یا بازنویسیِ همان حساب با همان نتیجه */
    /* دورِ ۲۷ (C46، D27-2 S1): بندِ فرضی («اگه یه روز صفحه حسابِ درستم رو غلط بخونه، از کجا بفهمم خطا از صفحه‌ست؟») اعتراض نیست — ST.hypoCut (a45، سهمِ «prior») آن را هم‌طول کنار می‌گذارد */
    var mh = ST.hypoCut ? ST.hypoCut(mt) : mt;
    var mk = keyOf(mh), restates = function (e, v) { return mk.indexOf(keyOf(String(e) + "=" + String(v))) >= 0; }, said = CONTEST.test(mh);
    /* همان حساب با نتیجهٔ دیگر در همین پیام = اصلاحِ خودش (کارِ دفتر، C8)، نه اعتراض */
    var mine = arithChk(mt), fixes = function (e, v) { var k = keyOf(e); return mine.some(function (c) { return keyOf(c.expr) === k && String(c.said) !== String(v); }); };
    steps.forEach(function (x) {
      var txt0 = x.fixed ? x.fixed.t : x.quote, ck = arithChk(txt0), bad = ck.filter(function (c) { return !c.ok; });
      if (!said && !bad.some(function (c) { return restates(c.expr, c.said); }) && !ck.some(function (c) { return (x.bad || []).indexOf(String(c.said)) >= 0 && restates(c.expr, c.said); })) return;
      if (bad.some(function (c) { return fixes(c.expr, c.said); })) return;
      /* دورِ ۲۷ (C46): بی هیچ حسابِ خوانده‌شده بازسنجی «درست» نمی‌گوید — نسنجیده می‌ماند */
      if (!bad.length && !ck.some(function (c) { return c.ok === true && !c.ask; })) { out.open = (out.open || []).concat([{ n: x.n, t: clip(txt0, 120) }]); return; }
      if (!bad.length) {   // صفحه حالا می‌خواند: «✗» ِ پیشین خطای خوانشِ خودِ صفحه بود
        var was = x.verdict, rep = null, ch = [];
        try { rep = ST.priorOf(s, { prior: [{ n: x.n, step: x.step, quote: x.quote, verdict: x.why ? "unchecked" : "ok", why: x.why || "" }] }, um); } catch (e) { rep = null; }
        if (rep && rep.steps[0] && !rep.steps[0].pageBad) { try { ch = ST.priorMerge(G.pr, rep, {}); } catch (e2) { ch = []; } }
        if (!ch.length) { x.verdict = x.why ? "unchecked" : "ok"; x.pageBad = false; x.bad = []; var nt = ST.arithNote(ck, x.verdict); x.chk = nt.chk; x.chkM = nt.chkM; }
        x.badC = []; x.re = { at: at, by: "page", was: was, to: x.verdict, why: "بازسنجیِ صفحه: حساب می‌خواند — «✗» ِ پیشین از خوانشِ خودِ صفحه بود", her: clip(mt, 160) }; x.reAt = at; if (x.her === "no") x.her = "";
        /* کارنامه: رویدادِ منفیِ همان گام پس گرفته می‌شود و گامِ درست به حسابِ خودش می‌نشیند */
        try { (s.coachEv || []).forEach(function (e) { if (e && e.src === "prior" && e.prior === x.n && !e.ok && !e.wd && (!G.pid || e.pid === G.pid)) e.wd = { at: at, why: "بازسنجیِ حسابِ صفحه: حکم برگشت" }; });
          if (x.verdict === "ok" && AS.coachEvent && !x.test) AS.coachEvent(s, "c", "prior", x.quote, true, { prior: x.n }); } catch (e3) { }
        out.cleared.push({ n: x.n, t: clip(txt0, 120), was: was, to: x.verdict, ck: ck });
      } else {
        x.re = { at: at, by: "page", was: x.verdict, to: x.verdict, why: bad.map(bothT).join("؛ "), her: clip(mt, 160) }; x.reAt = at;
        out.kept.push({ n: x.n, t: clip(txt0, 120), bad: bad });
      }
    });
    if (G.pr && (out.cleared.length || out.kept.length)) G.save();
    /* «✗» ِ پیامِ پیشین (بی دفتر) */
    if (!out.cleared.length && !out.kept.length) mem.forEach(function (b) {
      if ((!said && !restates(b.expr, b.said)) || fixes(b.expr, b.said)) return;
      /* دورِ ۲۷ (D27-2 S1، C46 «بازسنجی همیشه بازحساب است»): متنِ نگه‌داشته بریده است (۶۰۰ نویسه) — بازسنجی روی پیامِ کاملِ خودش؛ «درست» فقط وقتی همان حساب دوباره خوانده شد و ✓ است.
         نیافتنِ همان حساب «درست» نیست: ✗ سرِ جایش می‌ماند و صفحه می‌گوید دوباره نتوانست بخواند (نسنجیده) — هرگز اعتماد به جای بازحساب. */
      var full = b.text; if (/…$/.test(String(b.text || ""))) (s.msgs || []).some(function (m) { if (m && m.role === "user" && clip(m.text, 600) === b.text) { full = String(m.text); return true; } return false; });
      var ck = arithChk(full), same = ck.filter(function (c) { return String(c.expr) === String(b.expr); }), mine = same.filter(function (c) { return !c.ok || (b.ask && c.ask); });   // ✗ ای که از «نه، گرد نکردم» آمد (C26) با بازسنجی پاک نمی‌شود
      var reads = same.filter(function (c) { return c.ok === true && !c.ask; });
      if (!mine.length && !reads.length) { b.re = { at: at, to: "unread" }; out.open = (out.open || []).concat([{ n: 0, t: fa(b.expr) + " = " + fa(b.saidT) }]); return; }
      b.re = { at: at, to: mine.length ? "wrong" : "ok" };
      if (mine.length) out.kept.push({ n: 0, t: fa(b.expr) + " = " + fa(b.saidT), bad: mine }); else out.cleared.push({ n: 0, t: fa(b.expr) + " = " + fa(b.saidT), was: "wrong", to: "ok", ck: reads });
    });
    if (!out.cleared.length && !out.kept.length && !(out.open || []).length) return null;
    var who = function (o) { return o.n ? "گامِ " + fa(o.n) + " («" + o.t + "»)" : "«" + o.t + "»"; };
    out.cleared.forEach(function (o) { var okL = ST.arithLines((o.ck || []).filter(function (c) { return c.ok && !c.ask; })); out.lines.push("✓ بازسنجی شد ⇒ درست: " + who(o) + " — حسابِ صفحه هم همان را می‌دهد" + (okL.length ? " (" + okL.join("؛ ") + ")" : "") + ". «✗» ِ پیشین از خوانشِ خودِ صفحه بود و همه‌جا برداشته شد (دفتر، 🧭، 📜، کارنامه)."); });
    (out.open || []).forEach(function (o) { out.lines.push("؟ بازسنجی: صفحه حسابِ " + who(o) + " را دوباره نتوانست بخواند — نسنجیده؛ «✗» ِ پیشین نه برداشته شد نه تأیید؛ «درست» نخوانش و با خودش همان تکه را حساب کن."); });
    out.kept.forEach(function (o) { out.lines.push("✗ بازسنجی شد (یک بار) ⇒ حکم ماند: " + who(o) + " — " + o.bad.map(bothT).join("؛ ") + " (عددِ درست را لو نده)."); });
    out.note = "🧮 بازسنجیِ حسابِ صفحه (به درخواستِ خودت): " + out.cleared.map(function (o) { return who(o) + " می‌خواند — بازسنجی شد ⇒ درست؛ «✗» ِ پیشین خطای خوانشِ صفحه بود و برداشته شد"; }).concat(out.kept.map(function (o) { return who(o) + " — " + o.bad.map(bothT).join("؛ ").replace(/نوشتهٔ خودش/g, "نوشتهٔ تو") + " — یک بار دوباره سنجیده شد و حکم ماند؛ همین تکه را خودت دوباره حساب کن"; }))
      .concat((out.open || []).map(function (o) { return who(o) + " — صفحه دوباره نتوانست بخواندش (نسنجیده)؛ حکمِ پیشین نه برداشته شد نه تأیید — همین تکه را خودت دوباره حساب کن"; })).join(" · ");
    /* 📜: یک رویداد برای همین بازسنجی */
    try { if (A.EVLOG && A.EVLOG.add) A.EVLOG.add(Object.assign(G.pid ? { pid: G.pid } : { sess: s.id }, { id: "ar26_" + key.replace(/[^\w]/g, "_"), k: (ST.EV_K && ST.EV_K.prior) || "cprior", at: at, title: "بازسنجیِ حسابِ صفحه (اعتراضِ خودت)",
      lines: out.cleared.map(function (o) { return who(o) + ": بازسنجی شد ⇒ درست («✗» ِ پیشین از خوانشِ صفحه بود)"; }).concat(out.kept.map(function (o) { return who(o) + ": بازسنجی شد ⇒ حکم ماند — " + o.bad.map(bothT).join("؛ ").replace(/نوشتهٔ خودش/g, "نوشتهٔ تو"); })).concat((out.open || []).map(function (o) { return who(o) + ": دوباره خوانده نشد ⇒ نسنجیده"; })),
      out: "", src: um ? { sess: s.id, mid: AS.msgId ? AS.msgId(um) : "", text: um.text, at: um.at || "", title: s.title || "" } : null, by: "page" })); } catch (e4) { }
    C.arithRe = { key: key, out: out, said: false };
    return out;
  };
  /* ---------- جوابِ او به «؟» ِ صفحه (C26، دورِ ۲۶) ----------
     «؟» ِ پیامِ پیشین (گرد کردن، C25/C27؛ خوانشِ مقیاس، C24) در پیامِ بعدی جواب می‌گیرد: «آره، گرد کردم» ⇒ آن سطر تقریبی و ✓ ثبت می‌شود؛ «نه» ⇒ ✗ (روی میز برای
     اعتراض، مثلِ هر ✗ ِ دیگر). جوابی که هیچ‌کدام نیست ⇒ پرسش باز می‌ماند و چیزی ثبت نمی‌شود. */
  var ANS_NO = /گرد\s*نکرد|نه[،,\s]*(?:همین(?:و|ه)?|دقیقاً|دقیقا)\s*(?:رو\s*)?(?:می[‌\s]?خواستم|بود|درسته)|این[‌\s]?طور\s*(?:حساب\s*)?نکرد|ضرب\s*نکرد|جمع\s*کرد/;
  var ANS_YES = /گرد\s*کرد|تقریب|سرراست\s*کرد|همین[‌\s]?طور\s*حساب\s*کرد|آره[،,\s]*(?:همین[‌\s]?طور|این[‌\s]?طور)|ضرب\s*کرد/;
  var ANS_Y0 = /^\s*(?:آره|اره|بله|آری|اوهوم|آهان|درسته|دقیقاً|همینه)(?![آ-ی])/, ANS_N0 = /^\s*(?:نه|نخیر|خیر)(?![آ-ی])/;
  /* C43 (دورِ ۲۷؛ D27-1، S1-b): جواب فقط به سطری می‌خورد که در حالتِ «؟» منتظر است —
       • سطرِ کسِ دیگر (C57) و اتحادِ کسری (C26، که ✗ است نه «؟») هرگز منتظرِ جوابِ او نیستند؛
       • عددی که خودش نام می‌برد («اون ۱۴ رو گرد کردم») سطر را تعیین می‌کند — هر «؟» ِ بازِ همین گفت‌وگو، نه فقط پیامِ پیشین؛
       • «آره/بله» ِ تنها (بی «گرد کردم/ضرب کردم») فقط به «؟» ِ پیامِ درست پیشین می‌خورد؛
       • اگر بیش از یک سطر منتظر است و جواب یکی را تعیین نمی‌کند (نه عدد، نه «هر دو/همه») ⇒ هیچ‌کدام ثبت نمی‌شود و صفحه می‌پرسد «کدام؟». */
  var ANS_ALL = /هر\s*(?:دو|سه|چهار)|همه|همش|دوتاش|دو\s*تاش|هردوش|هر\s*دوش/;
  ST.arithAnswer = function (s, msg) {
    var mt = String(msg || ""); if (!s || !mt.trim() || /^\s*\[/.test(mt)) return null;
    var C = s.coach = s.coach || {}, key = String(s.id || "") + ":" + String(s.seq || 0), sq = s.seq || 0;
    if (C.arithAn && C.arithAn.key === key) return C.arithAn.out;
    var yes = !ANS_NO.test(mt) && (ANS_YES.test(mt) || ANS_Y0.test(mt)), no = !yes && (ANS_NO.test(mt) || ANS_N0.test(mt)); if (!yes && !no) return null;
    var named = ANS_YES.test(mt) || ANS_NO.test(mt);
    var open = (C.arithAsk || []).filter(function (a) { return !a.re && !a.other && !a.fr1 && a.seq < sq && (named || a.seq === sq - 1); });
    if (!open.length) {
      /* بانکِ R27 #60/#61: «گرد کردم» وقتی هیچ سطرِ خودش در «؟» منتظر نیست ولی پیامِ پیشین ✗ ِ اتحاد/کسر یا سطرِ کسِ دیگر داشت ⇒ هیچ چیز ثبت نمی‌شود و صفحه یک بار همین را می‌گوید */
      var near0 = named && yes ? (C.arithBad || []).filter(function (b) { return b.seq === sq - 1 && !b.ask; }).concat((C.arithAsk || []).filter(function (a) { return a.seq === sq - 1 && a.other && !a.re; })) : [];
      if (!near0.length) return null;
      var o0 = { yes: [], no: [], lines: ["— جوابِ او («" + clip(mt, 80) + "») به هیچ «؟» ِ بازی از خودش نمی‌خورد: " + near0.map(function (b) { return "«" + fa(b.expr) + " = " + fa(b.saidT || b.said) + "»" + (b.other ? " کارِ «" + b.other + "» است" : " ✗ است (حسابِ دقیق، گرد کردن ندارد)"); }).join("؛ ") + " — صفحه چیزی را «تقریبی و درست» ثبت نکرد؛ همین را یک بار روشن بگو"], which: [] };
      C.arithAn = { key: key, out: o0 }; return o0;
    }
    /* عددی که نام برده (فقط عددهای بیرون از حسابِ تازه‌ای که در همین پیام نوشته) */
    var nums = (digs(mt).replace(/\d+(?:\.\d+)?\s*[+\-×*÷\/=]\s*\d+(?:\.\d+)?(?:\s*[=]\s*\d+(?:\.\d+)?)?/g, " ").match(/\d+(?:\.\d+)?/g) || []);
    var hitS = open.filter(function (a) { return nums.indexOf(digs(a.said)) >= 0; }), hitE = hitS.length ? hitS : nums.length ? open.filter(function (a) { var en = digs(a.expr).match(/\d+(?:\.\d+)?/g) || []; return nums.every(function (n) { return en.indexOf(n) >= 0; }); }) : [];
    var pick = hitE.length ? hitE : open, at = nowIso(), out = { yes: [], no: [], lines: [], which: [] };
    if (pick.length > 1 && !ANS_ALL.test(mt)) {
      out.which = pick.slice();
      out.lines.push("؟ جوابِ او («" + clip(mt, 80) + "») به بیش از یک «؟» ِ باز می‌خورد: " + pick.map(function (a) { return "«" + fa(a.expr) + " = " + fa(a.saidT || a.said) + "»"; }).join("، ") +
        " — صفحه هیچ‌کدام را ثبت نکرد؛ در همان یک پرسشِ این پاسخ بپرس «کدام؟» (کدام را " + (yes ? "گرد کرده/این‌طور حساب کرده" : "گرد نکرده") + ")");
      C.arithAn = { key: key, out: out }; return out;
    }
    pick.forEach(function (a) {
      a.re = { at: at, to: yes ? "ok" : "wrong", apx: yes, her: clip(mt, 160) };
      var ln = "«" + fa(a.expr) + (yes && a.kind !== "andmul" ? " ≈ " : " = ") + fa(a.saidT || a.said) + "»";
      if (yes) { out.yes.push(a); out.lines.push("✓ " + (a.kind === "reading" ? "به گفتهٔ خودش همین‌طور حساب کرده بود: " : a.kind === "andmul" ? "به گفتهٔ خودش ضرب کرده بود («و» = ضرب): " : "به گفتهٔ خودش گرد کرده بود: ") + ln + " — صفحه آن را " + (a.kind === "reading" ? "با همان خوانش" : a.kind === "andmul" ? "با خوانشِ ضرب" : "تقریبی") + " و درست ثبت کرد؛ دوباره نپرس"); }
      else { out.no.push(a); out.lines.push("✗ به گفتهٔ خودش " + (a.kind === "reading" ? "این‌طور حساب نکرده بود" : a.kind === "andmul" ? "ضرب نکرده بود (جمع)" : "گرد نکرده بود") + ": " + ln + " نمی‌خواند (عددِ درست را لو نده؛ بگذار خودش همین تکه را دوباره حساب کند)");
        C.arithBad = (C.arithBad || []).concat([{ seq: a.seq, text: a.text, expr: a.expr, said: a.said, saidT: a.saidT, ask: true, at: sq }]).slice(-12); }
    });
    C.arithAn = { key: key, out: out };
    return out;
  };
  /* دورِ ۲۷ (A27-13، سمتِ مربی): «خودم یه گامش رو رفتم: …»، «حساب کردم: …» — کارِ خودِ اوست، پس سطرهای «می‌خواند» هم به مربی می‌رسند (حتی در آغازِ گفت‌وگوی تازه) */
  var MINE = /خودم\s+(?:[^\s،,.:]+\s+){0,3}?(?:رفتم|حساب\s*کردم|نوشتم|درآوردم)|حساب\s*کردم|حساب[\u200c]?ش\s*کردم|گام(?:ش|ی)?\s*(?:رو\s*|را\s*)?رفتم/;
  if (AS && AS.promptHooks) {
    /* پیش از همهٔ قلاب‌ها: دفتر پیش از ساختِ بلوک‌های دیگر به‌روز است (پرسشِ نوبتِ «کارِ پیشین» از دفترِ پس از بازسنجی) */
    AS.promptHooks.unshift(function (s, msg) {
      var an = ""; try { var ra = ST.arithAnswer(s, msg); if (ra && ra.lines.length) an = ["# جوابِ او به «؟» ِ صفحه (پرسشِ گرد کردن / خوانشِ مقیاس در پیامِ پیشین)"].concat(ra.lines.map(function (l) { return "- زمینه (نه پرسشِ دوم): " + l; })).join("\n"); } catch (e0) { an = ""; }
      try { var r = ST.arithContest(s, msg); if (!r) return an;
        return (an ? an + "\n" : "") + ["# بازسنجیِ حسابِ صفحه (او به «✗» ِ صفحه اعتراض کرد؛ صفحه همان نوشته را یک بار دوباره سنجید)"].concat(r.lines.map(function (l) { return "- زمینه (نه پرسشِ دوم): " + l; }))
          .concat(["- زمینه (نه پرسشِ دوم): " + (r.cleared.length ? "برای آنچه «درست» شد: روشن بگو حق با او بود و خطا از خوانشِ صفحه؛ دوباره از او نخواه لغزش بجوید. " : "") + ((r.open || []).length ? "برای آنچه «نسنجیده» ماند: نه «درست» بگو نه «غلط»؛ بگو صفحه دوباره نتوانست بخواندش و با خودش همان تکه را حساب کن. " : "") + (r.kept.length ? "برای آنچه «ماند»: بگو صفحه یک بار دوباره سنجید و حکم ماند، و همان تکه‌ای را که نمی‌خواند نشانش بده؛ عددِ درست را نگو — بگذار خودش همان تکه را دوباره حساب کند؛ نه کوتاه بیا و نه بحث را از نو کن؛ همین بازسنجی یک بار است. " : "") + "صفحه همین را به خودش هم نوشته است."]).join("\n");
      } catch (e) { return an; }
    });
    AS.promptHooks.push(function (s, msg) {
      try { var mt = String(msg || ""); if (/^\s*\[/.test(mt)) return "";
        var ck = arithChk(mt), UR = ck.unread || []; if (!ck.length && !UR.length) return "";
        var bl = AS.boundLive ? AS.boundLive(s) : null, pid = bl && !bl.done ? bl.pid : "", pr = ST.priorFor ? ST.priorFor(s, pid) : null, bad = ck.filter(function (c) { return !c.ok; }), asks = ck.filter(function (c) { return c.ask; });
        /* «✗» ِ این پیام روی میز می‌ماند تا اگر اعتراض کرد صفحه همان را دوباره بسنجد (پرسشِ ۳۶) */
        if (bad.length && s) { var C = s.coach = s.coach || {}, sq = s.seq || 0; C.arithBad = (C.arithBad || []).filter(function (b) { return b.seq !== sq; }).concat(bad.map(function (c) { var b0 = { seq: sq, text: clip(mt, 600), expr: String(c.expr), said: String(c.said), saidT: String(c.saidT || c.said) }; if (c.other) b0.other = c.other; return b0; })).slice(-12); }
        if (s) { var Ca = s.coach = s.coach || {}, sa = s.seq || 0, aq = asks.filter(function (c) { return c.kind === "round" || c.kind === "reading" || c.kind === "andmul"; });
          /* C43 (دورِ ۲۷؛ D27-1): «؟» ِ بازِ پیامِ پیشین با «؟» ِ تازه پاک نمی‌شود — تا جواب نگرفته منتظر می‌ماند؛ سطرِ کسِ دیگر نشان‌دار است (C57) و جوابِ او به آن نمی‌خورد */
          Ca.arithAsk = (Ca.arithAsk || []).filter(function (a) { return a.seq !== sa; }).concat(aq.map(function (c) { var a0 = { seq: sa, text: clip(mt, 600), expr: String(c.expr), said: String(c.said), saidT: String(c.saidT || c.said), kind: c.kind }; if (c.other) a0.other = c.other; return a0; })).slice(-12); }
        /* دورِ ۲۶ (B26·D10/D35، A26-45): مسئله‌ای در کار است — گفت‌وگوی بسته به مسئلهٔ زنده (با دفتر یا بی دفتر)، یا مسئلهٔ گفت‌وگویی که صورتش پیش از این پیام ثبت شده — ⇒ سطرهای «می‌خواند» هم می‌آیند */
        var C0 = (s && s.coach) || {}, work = !!(ST.workMsg && ST.workMsg(mt)) || MINE.test(mt), full = !!pr || work || !!bl || (!!C0.stmt && (s.seq || 0) > 1);
        if (!full && !bad.length && !asks.length && !UR.length) return "";
        var show = full ? ck : ck.filter(function (c) { return !c.ok || c.ask; }); show.unread = UR;
        var out = ["# حسابِ صفحه روی همین پیام (دقیق، با عددِ گویا؛ فقط حساب و واحدی که خودش نوشته)"];
        ST.arithLines(show).forEach(function (l) { out.push("- زمینه (نه پرسشِ دوم): " + l); });
        out.push("- زمینه (نه پرسشِ دوم): حسابی را که صفحه «می‌خواند» نادرست نخوان" + (bad.length ? "؛ دربارهٔ «✗» عددِ درست را لو نده — بگذار خودش دوباره حساب کند و جای لغزش را بیابد" : "") + (asks.length || UR.length ? "؛ «؟» و «—» نه درست‌اند نه نادرست (صفحه داوری نکرده) — آن‌ها را «درست» یا «غلط» اعلام نکن مگر خودت سنجیده باشی" : "") + ". این سنجش فقط حساب و واحدِ نوشته است، نه درستیِ خودِ گام.");
        return out.join("\n");
      } catch (e) { return ""; }
    });
    /* سطرِ خودِ او: صفحه ساکت نمی‌ماند (A26-2) */
    if (AS.afterTurnHooks) AS.afterTurnHooks.push(function (s) {
      try { var C = (s && s.coach) || {}, R = C.arithRe; if (!R || R.said || !R.out || !R.out.note || R.key !== String(s.id || "") + ":" + String(s.seq || 0)) return;
        R.said = true; s.msgs.push({ role: "sys", at: nowIso(), text: R.out.note }); if (A.S) A.S.put(s);
      } catch (e) { }
    });
  }
})(APP);
