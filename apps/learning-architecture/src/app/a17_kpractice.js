/* ===== «گره‌گشا» — قدمِ ۵ و ۶: ورزیدگی و پیگیری (طرحِ مرجع: docs/specs/KNOTS.md، §۶، §۷، §۱۲ بندهای ۵ تا ۱۲، §۱۳) =====
   چه می‌کند:
   • A.KGEN — سازنده‌های برنامه‌وار با پاسخِ محاسبه‌شده در همین کد (درست به‌حکمِ ساخت؛ RNG ِ دانه‌دار ⇒ تکرارپذیر):
     کوزه‌های آب (Luchins 1942)، قاعدهٔ پنهانِ ۲-۴-۶ (Wason 1960)، گزینشِ واسون (Wason 1966؛ Evans & Lynch 1973)،
     نرخِ پایه (Tversky & Kahneman؛ Gigerenzer & Hoffrage 1995)، زنجیرهٔ حافظهٔ کاری با/بی بیرون‌ریزی (Cowan 2001)،
     حساب با قیدِ خودساخته (Kershaw & Ohlsson 2004). هر کدام نسخهٔ «بدلی» (ظاهرِ مشابه، بی‌گره) هم دارد.
   • نمونه‌سازیِ هوش مصنوعی برای هر گره: فقط JSON ِ ساختاری با پاسخِ محدود (عددِ صحیح / شناسهٔ گزینه) یا روبریک؛
     سه حلِ مستقل با سه دستورِ متفاوت (درِ A.callAI دما نمی‌گیرد)، پرسشِ «بیش از یک پاسخ؟» و «ساختارِ گره در آن هست؟»؛
     کنترلِ نشتِ پاسخ؛ ناسازگاری ⇒ «وارسی‌نشده» و پیش‌فرض پنهان. پیش از هر درخواست: اعلامِ ارائه‌دهندهٔ بیرونی + حذفِ نام‌ها،
     و بررسیِ کلیدواژه‌های آسیب به خود. بی‌هوش مصنوعی: قالبی که خودِ کاربر نمونه بسازد (اثرِ تولید).
   • جلسهٔ ورزشِ درهم‌تنیده (۴۳): اطمینان پیش از پاسخ (۲۴)، پاسخ ⇐ دیدنِ پاسخ و «ساختارِ عمیق/تله کجا بود» ⇐ «چرا؟» (۴۵)؛
     بدلی‌ها «چرا این گره این‌جا نیست؟». گره‌های اجتماعی/رفتاری: خودسنجیِ روبریک + آزمایشِ واقعی (پیش‌بینی ⇐ انجام ⇐ مشاهده ⇐ ثبت).
   • A.kmastery — معیارِ «ورزیده‌شده» دقیقاً طبقِ §۱۲.۶؛ وضعیت‌ها باز ⇐ در حالِ باز شدن ⇐ ورزیده‌شده ⇐ بازگشته.
   • یادآورها از راهِ A.HOST.remind/unremind؛ متنِ پیش‌فرض خنثی است (بی نامِ گره).
   قاعدهٔ ذخیره (مثلِ دوره): دیدن هیچ رکوردی نمی‌سازد؛ فقط کارِ واقعی (ساختنِ نمونه، پاسخ، «چرا»، آزمایش، تغییرِ وضعیت) می‌نویسد.
   صداقت (§۱۲.۷): این صفحه هیچ ادعایی دربارهٔ تقویتِ توانِ کلی یا ناپدید شدنِ همیشگیِ گره نمی‌کند. */
(function (A) {
  /* ================= ۱) ابزارهای خالص (بی DOM؛ در Node هم بار می‌شوند) ================= */
  function mulberry(seed) {
    var a = (seed >>> 0) || 1;
    return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function ri(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function shuf(r, arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  var FD = "۰۱۲۳۴۵۶۷۸۹";
  function fa(x) { return String(x == null ? "" : x).replace(/[0-9]/g, function (d) { return FD[+d]; }); }
  function lat(s) { return String(s == null ? "" : s).replace(/[۰-۹]/g, function (d) { return String(FD.indexOf(d)); }).replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x660); }); }
  function norm(s) { return lat(s).replace(/[‌‏‎]/g, "").replace(/\s+/g, " ").trim().toLowerCase(); }
  function intOf(v) { var s = lat(v).replace(/[\s,٬]/g, "").replace(/[−–]/g, "-"); return /^-?\d+$/.test(s) ? parseInt(s, 10) : null; }
  function setOf(v) { var a = Array.isArray(v) ? v : String(v == null ? "" : v).split(","); return a.map(function (x) { return String(x).trim(); }).filter(Boolean).sort().join(","); }
  /* عبارتِ ریاضی/لاتین درونِ جملهٔ فارسی: «جداسازِ چپ‌به‌راست» تا مرورگر ترتیبش را به هم نریزد (A = ۱۲ ⇐ ۱۲ = A) */
  function ltr(s) { return "⁦" + String(s).replace(/ /g, " ") + "⁩"; }
  A.krng = mulberry;
  A.kfa = fa;
  A.kltr = ltr;
  /* «تقریباً همان مسئلهٔ اصلی؟» (۲۰۲۶-۱۰-۱۳): نمونهٔ ورزش باید ساختارِ مسئلهٔ کاربر را در ظاهری تازه داشته باشد، نه خودِ آن مسئله را
     با یکی‌دو عددِ عوض‌شده. سنجه: همپوشانیِ مجموعهٔ واژه‌ها (ژاکارد، واژه‌های ≥ ۲ نویسه، ارقام یکسان‌شده) ≥ ۰٫۶. */
  function wordSet(t) {
    var o = {}; norm(t).replace(/[يى]/g, "ی").replace(/ك/g, "ک").split(/[^\p{L}\p{N}]+/u).forEach(function (w) { if (w.length >= 2) o[w] = 1; }); return o;
  }
  A.kNearCopy = function (a, b) {
    var x = wordSet(a), y = wordSet(b), kx = Object.keys(x), ky = Object.keys(y);
    if (kx.length < 4 || ky.length < 4) return false;
    var inter = kx.filter(function (w) { return y[w]; }).length, uni = kx.length + ky.length - inter;
    return uni > 0 && inter / uni >= 0.6;
  };

  /* ---------- عددِ گویا (برای حسابِ دقیق، بی خطای اعشار) ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function Q(n, d) { if (d === 0) return null; if (d < 0) { n = -n; d = -d; } var g = gcd(n, d); return [n / g, d / g]; }
  function qadd(a, b) { return Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function qsub(a, b) { return Q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]); }
  function qmul(a, b) { return Q(a[0] * b[0], a[1] * b[1]); }
  function qdiv(a, b) { return b[0] === 0 ? null : Q(a[0] * b[1], a[1] * b[0]); }

  /* بررسیِ عبارتِ کاربر: فقط عدد، + − × ÷ و پرانتز؛ بی منفیِ تنها و بی چسباندنِ رقم؛ هر عددِ داده‌شده دقیقاً یک بار. */
  A.kexprCheck = function (ans, nums, target) {
    var s = lat(ans).replace(/[×xX*]/g, "*").replace(/[÷:]/g, "/").replace(/[−–—]/g, "-").replace(/\s+/g, "");
    if (!s) return { ok: false, why: "خالی است" };
    if (/[^0-9+\-*/()]/.test(s)) return { ok: false, why: "نویسهٔ نامجاز" };
    var i = 0, used = [];
    function peek() { return s[i]; }
    function factor() {
      if (peek() === "(") { i++; var v = expr(); if (peek() !== ")") throw new Error("پرانتز بسته نشده"); i++; return v; }
      var m = /^\d+/.exec(s.slice(i)); if (!m) throw new Error("عدد یا پرانتز لازم است");
      i += m[0].length; var n = parseInt(m[0], 10); used.push(n); return [n, 1];
    }
    function term() { var v = factor(); while (peek() === "*" || peek() === "/") { var op = s[i++], w = factor(); v = op === "*" ? qmul(v, w) : qdiv(v, w); if (!v) throw new Error("تقسیم بر صفر"); } return v; }
    function expr() { var v = term(); while (peek() === "+" || peek() === "-") { var op = s[i++], w = term(); v = op === "+" ? qadd(v, w) : qsub(v, w); } return v; }
    var val;
    try { val = expr(); if (i !== s.length) throw new Error("ساختارِ عبارت نادرست است"); } catch (e) { return { ok: false, why: e.message }; }
    var a = used.slice().sort(function (x, y) { return x - y; }).join(","), b = nums.slice().sort(function (x, y) { return x - y; }).join(",");
    if (a !== b) return { ok: false, why: "هر عدد باید دقیقاً یک بار به کار رود (به‌کاررفته: " + fa(used.join("، ")) + ")" };
    if (!(val[0] === target && val[1] === 1)) return { ok: false, why: "حاصل " + fa(val[1] === 1 ? val[0] : val[0] + "/" + val[1]) + " است، نه " + fa(target) };
    return { ok: true, why: "" };
  };

  /* بررسیِ پاسخ برای هر نمونه (کد، هوش مصنوعی یا کاربر) — فقط از داده‌های خودِ رکورد؛ null = خودکار نمره‌پذیر نیست */
  A.kcheck = function (it, ans) {
    if (!it || ans == null || ans === "") return false;
    if (it.atype === "int") { var n = intOf(ans), m = intOf(it.answer); return n != null && m != null && n === m; }
    if (it.atype === "choice") return it.multi ? setOf(ans) === setOf(it.answer) : String(ans).trim() === String(it.answer).trim();
    if (it.atype === "text" && it.exact === "expr" && it.params) return A.kexprCheck(ans, it.params.nums, it.params.target).ok;
    if (it.atype === "text" && it.exact === "jars" && it.params) { var jp = A.kjarsPath(it, ans); return jp === "short"; }
    return null;
  };
  /* «2A − B»، «a+c»، «C + A»، «۲C»… ⇒ بردارِ [A, B, C]؛ null اگر قالب نادرست است */
  A.kjarsVec = function (s) {
    var t = lat(s).toUpperCase().replace(/[−–—]/g, "-").replace(/[×*]/g, "").replace(/\s+/g, "");
    if (!t || !/^[+-]?\d*[ABC](?:[+-]\d*[ABC])*$/.test(t)) return null;
    var v = [0, 0, 0], re = /([+-]?)(\d*)([ABC])/g, m;
    while ((m = re.exec(t))) v["ABC".indexOf(m[3])] += (m[1] === "-" ? -1 : 1) * (m[2] ? parseInt(m[2], 10) : 1);
    return v;
  };
  /* مسیرِ پاسخِ کوزه‌ها: short = کوتاه‌ترین راه؛ set = همان فرمولِ گرم‌کردن (به T می‌رسد ولی کوتاه‌ترین نیست، یا در بدلی خودش کوتاه‌ترین است)؛
     long = راهِ درستِ بلندتر؛ wrong = به T نمی‌رسد یا خوانا نیست */
  A.kjarsPath = function (it, ans) {
    var p = it.params || {}, v = A.kjarsVec(ans); if (!v || !p.caps) return "wrong";
    if (v[0] * p.caps[0] + v[1] * p.caps[1] + v[2] * p.caps[2] !== p.T) return "wrong";
    var cost = vecCost(v), min = p.min != null ? p.min : cost;
    if (cost <= min) return "short";
    var sv = p.setv || SETV;
    return v[0] === sv[0] && v[1] === sv[1] && v[2] === sv[2] ? "set" : "long";
  };

  /* کنترلِ نشت: صورت، راهنماها و گام‌های نمایان نباید پاسخ را لو دهند. null = سالم؛ وگرنه دلیل. */
  A.kleak = function (it) {
    var txt = [it.prompt].concat(it.hints || [], it.steps || []).join("\n"), L = lat(txt);
    if (it.atype === "int") {
      var a = intOf(it.answer); if (a == null) return "پاسخِ عددی نامعتبر";
      var toks = L.match(/\d+/g) || [];
      for (var i = 0; i < toks.length; i++) if (parseInt(toks[i], 10) === Math.abs(a)) return "عددِ پاسخ («" + fa(a) + "») در صورت آمده است";
      return null;
    }
    if (it.atype === "choice") {
      if (it.multi) return null; // کارت‌های واسون ناگزیر در متنِ قاعده نام برده می‌شوند؛ پاسخ «مجموعه» است و در صورت نیست
      var nt = norm(txt), ch = it.choices || [], right = ch.filter(function (c) { return c.id === it.answer; })[0];
      if (!right) return "گزینهٔ درست پیدا نشد";
      var rt = norm(right.t), wrongIn = ch.some(function (c) { return c.id !== it.answer && norm(c.t).length >= 2 && nt.indexOf(norm(c.t)) >= 0; });
      if (rt.length >= 2 && nt.indexOf(rt) >= 0 && !wrongIn) return "متنِ گزینهٔ درست در صورت آمده است";
      if (/(پاسخ|جواب)\s*[:：]/.test(txt)) return "صورت حاویِ «پاسخ:» است";
      return null;
    }
    if (it.atype === "text" && it.answer) {
      var an = norm(it.answer).replace(/\s/g, ""); if (an.length >= 3 && norm(txt).replace(/\s/g, "").indexOf(an) >= 0) return "متنِ پاسخ در صورت آمده است";
    }
    return null;
  };

  /* ================= ۲) سازنده‌های برنامه‌وار ================= */
  var LADDER = [1, 3, 7, 21, 60];
  /* فاصله‌های تکرار (روز). نامش A.KSPACING است: A.KLADDER نامِ «نردبانِ راهنمایی» ِ a16 است و پیش‌تر این‌جا رونویسی می‌شد (۲۰۲۶-۱۰-۱۵). */
  A.KSPACING = LADDER;

  /* ---------- (الف) کوزه‌های آب ---------- */
  var JN = ["A", "B", "C"];
  function jarsSolve(caps, T) {
    // ضریب‌ها تا ±۴: هر راهِ با هزینهٔ ≤ ۴ را کامل می‌شمارد (|ضریب| ≤ هزینه) — یکتاییِ کوتاه‌ترین راه به همین بسته است
    var all = [], min = 99;
    for (var a = -4; a <= 4; a++) for (var b = -4; b <= 4; b++) for (var c = -4; c <= 4; c++) {
      if (!a && !b && !c) continue;
      if (a * caps[0] + b * caps[1] + c * caps[2] !== T) continue;
      var cost = Math.abs(a) + Math.abs(b) + Math.abs(c); all.push({ v: [a, b, c], cost: cost }); if (cost < min) min = cost;
    }
    return { min: min, minSet: all.filter(function (x) { return x.cost === min; }).map(function (x) { return x.v; }), all: all };
  }
  A._kjarsSolve = jarsSolve;
  function vecText(v) {
    var terms = [[v[1], "B"], [v[0], "A"], [v[2], "C"]].filter(function (t) { return t[0]; });
    terms.sort(function (x, y) { return (y[0] > 0) - (x[0] > 0); });
    return terms.map(function (t, i) { var k = Math.abs(t[0]), s = (k > 1 ? k : "") + t[1]; return i === 0 ? (t[0] < 0 ? "−" : "") + s : (t[0] < 0 ? " − " : " + ") + s; }).join("");
  }
  function vecCost(v) { return Math.abs(v[0]) + Math.abs(v[1]) + Math.abs(v[2]); }
  var SETV = [-1, 1, -2];
  function same(a, b) { return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]; }
  function setOnly(r, level) {
    for (var t = 0; t < 300; t++) {
      var a = ri(r, 3, level >= 2 ? 29 : 19), c = ri(r, 2, 9 + level * 3), b = ri(r, a + 2 * c + 5, a + 2 * c + 40 + level * 20), T = b - a - 2 * c;
      if (a === c || b > 160) continue;
      var s = jarsSolve([a, b, c], T);
      if (s.min === 4 && s.minSet.length === 1 && same(s.minSet[0], SETV)) return { caps: [a, b, c], T: T };
    }
    return null;
  }
  function jarsMake(level, r, o) {
    var decoy = !!o.decoy, form = o.form || pick(r, ["numeric", "real", "visual"]), core = null;
    for (var t = 0; t < 400 && !core; t++) {
      if (decoy) { core = setOnly(r, level); break; }
      var a = ri(r, 4, level >= 2 ? 29 : 19), c = ri(r, 2, 9 + level * 3), T = r() < 0.5 ? a + c : a - c;
      if (T <= 0 || a === c) continue;
      var b = T + a + 2 * c; if (b > 160) continue;
      var s = jarsSolve([a, b, c], T);
      if (s.min === 2 && s.minSet.length === 1 && !same(s.minSet[0], SETV)) core = { caps: [a, b, c], T: T, short: s.minSet[0] };
    }
    if (!core) throw new Error("jars: no problem");
    var warm = [setOnly(r, level), setOnly(r, level)];
    var best = decoy ? SETV : core.short, caps = core.caps, T = core.T, setv = SETV;
    /* سطحِ ۳ (ممیزی ۲۰۲۶-۱۰-۱۲): پاسخ دیگر «کمترین تعدادِ حرکت» نیست (که همیشه ۲ یا ۴ بود و بی‌حل حدس زده می‌شد)؛ خودِ کوتاه‌ترین راه
       را به شکلِ ترکیبِ کوزه‌ها می‌خواهد. نام‌گذاریِ کوزه‌ها هم در این سطح جابه‌جا می‌شود (همان جای‌گشت برای گرم‌کردن‌ها)، پس نه «B − A − 2C»
       ثابت است و نه «A ± C». ساختار دست نمی‌خورد: فقط برچسب‌ها و بردارها با یک جای‌گشت بازچیده می‌شوند. */
    if (level >= 3) {
      var perm = shuf(r, [0, 1, 2]), P = function (v) { return perm.map(function (i) { return v[i]; }); };
      caps = P(caps); best = P(best); setv = P(SETV);
      warm = warm.map(function (w) { return w && { caps: P(w.caps), T: w.T }; });
    }
    var unit = form === "real" ? "میلی‌لیتر" : "لیتر";
    var vessel = form === "real" ? "پیمانه" : "کوزه";
    var intro = form === "real"
      ? "در آشپزخانه سه پیمانه داری و یک ظرفِ بزرگِ خالی. باید دقیقاً " + fa(T) + " میلی‌لیتر آب در ظرفِ بزرگ داشته باشی."
      : "سه کوزه داری و یک مخزنِ بزرگِ خالی. باید دقیقاً " + fa(T) + " لیتر آب در مخزن داشته باشی.";
    var capsTxt = JN.map(function (n, i) { return vessel + "ٔ " + ltr(n + " = " + fa(caps[i])) + " " + unit; }).join("، ");
    var rule = "هر بار افزودن یا کم‌کردنِ پُریِ یک " + vessel + " یک «حرکت» است (مثلاً دو بار C یعنی دو حرکت).";
    var warmTxt = "پیش از این، دو مسئلهٔ گرم‌کردن را در ذهن حل کن: " + warm.map(function (w) { return "(" + ltr("A = " + fa(w.caps[0]) + ", B = " + fa(w.caps[1]) + ", C = " + fa(w.caps[2])) + "؛ هدف " + fa(w.T) + ")"; }).join(" و ") + ". بعد سراغِ مسئلهٔ اصلی برو.";
    var it = { form: form, level: level, decoy: decoy, params: { caps: caps, T: T, warm: warm, setv: setv, min: vecCost(best) } };
    var q;
    if (level >= 3) {
      it.atype = "text"; it.exact = "jars"; it.answer = vecText(best);
      q = "کوتاه‌ترین راه (کمترین حرکت) برای رسیدن به دقیقاً " + fa(T) + " " + unit + " را به شکلِ ترکیبِ " + (form === "real" ? "پیمانه‌ها" : "کوزه‌ها") + " بنویس — با حرف‌های لاتینِ همان " + vessel + "‌ها، علامتِ + و −، و ضریب پیشِ حرف (مثلاً دو بار یک " + vessel + " = ۲ پیشِ حرفش).";
    } else {
      var pool = [[1, 0, 1], [1, 0, -1], [0, 1, -1], [0, 1, -2], [-1, 1, -1], [-1, 1, 0], [2, 0, 1], [0, 1, -3], [1, 0, 2], [2, 0, -1], [-1, 1, -3]];
      var cands = [best]; if (!decoy) cands.push(SETV);
      shuf(r, pool).forEach(function (v) {
        if (cands.length >= 4) return;
        if (v[0] * caps[0] + v[1] * caps[1] + v[2] * caps[2] === T) return;
        if (cands.some(function (x) { return same(x, v) || vecText(x) === vecText(v); })) return;
        cands.push(v);
      });
      var ids = shuf(r, ["a", "b", "c", "d"]);
      it.atype = "choice"; it.paths = {};
      it.choices = cands.map(function (v, i) { var valid = v[0] * caps[0] + v[1] * caps[1] + v[2] * caps[2] === T; it.paths[ids[i]] = same(v, best) ? "short" : valid ? "set" : "wrong"; return { id: ids[i], t: vecText(v) }; })
        .sort(function (x, y) { return x.id < y.id ? -1 : 1; });
      it.answer = ids[0];
      q = "کدام راه با کمترین حرکت به دقیقاً " + fa(T) + " " + unit + " می‌رسد؟";
    }
    it.prompt = warmTxt + "\n" + intro + " " + capsTxt + ". " + rule + "\n" + q;
    if (form === "visual") it.svg = { type: "jars", caps: caps, target: T };
    function vt(v) { return ltr(vecText(v)); }
    var warmSol = "گرم‌کردن‌ها هر دو فقط با «" + vt(setv) + "» (۴ حرکت) حل می‌شدند.";
    var big = setv.indexOf(1), others = [0, 1, 2].filter(function (i) { return i !== big; });
    it.explain = decoy
      ? "این‌جا فقط راهِ چهارحرکتیِ «" + vt(setv) + "» به " + fa(T) + " می‌رسد؛ راه‌های کوتاه‌ترِ ظاهری («" + ltr(JN[others[0]] + " + " + JN[others[1]]) + "»، «" + ltr(JN[others[0]] + " − " + JN[others[1]]) + "») جواب نمی‌دهند. " + warmSol
      : "کوتاه‌ترین راه: «" + vt(best) + "» (۲ حرکت). راهِ گرم‌کردن، «" + vt(setv) + "»، این‌جا هم جواب می‌دهد ولی ۴ حرکت است. " + warmSol;
    it.deep = "وقتی یک روش چند بار پشتِ‌سرِهم جواب داده، پیش از اجرای دوباره‌اش بپرس: آیا این‌جا راهِ ساده‌تری هم هست؟ (اثرِ آمادگیِ ذهنی — Luchins 1942؛ Bilalić et al. 2008)";
    it.trap = decoy ? "این‌جا تله‌ای نیست: راهِ آشنا تنها راه است. «همیشه دنبالِ میان‌بر بگرد» هم اگر کور اجرا شود خودش یک قاعدهٔ خودکار است."
      : "تکرارِ خودکارِ فرمولِ گرم‌کردن، بی‌آنکه کوتاه‌تر بودنِ «" + vt(best) + "» دیده شود.";
    return it;
  }

  /* ---------- (ب) قاعدهٔ پنهانِ ۲-۴-۶ ---------- */
  var RULES = {
    stepk: { t: function (k) { return "هر عدد دقیقاً " + fa(k) + " تا از عددِ قبلی بیشتر است"; }, f: function (x, k) { return x[1] - x[0] === k && x[2] - x[1] === k; } },
    ap: { t: function () { return "سه عدد با گامِ ثابت و مثبت بالا می‌روند (گام هر اندازه‌ای می‌تواند باشد)"; }, f: function (x) { return x[1] - x[0] === x[2] - x[1] && x[1] > x[0]; } },
    mul: { t: function () { return "عددِ دوم دو برابر و عددِ سوم سه برابرِ عددِ اول است"; }, f: function (x) { return x[1] === 2 * x[0] && x[2] === 3 * x[0]; } },
    sum: { t: function () { return "عددِ سوم برابرِ مجموعِ دو عددِ اول است"; }, f: function (x) { return x[2] === x[0] + x[1]; } },
    inc: { t: function () { return "هر عدد از عددِ قبلی بزرگ‌تر است"; }, f: function (x) { return x[0] < x[1] && x[1] < x[2]; } },
    even: { t: function () { return "هر سه عدد زوج‌اند"; }, f: function (x) { return x[0] % 2 === 0 && x[1] % 2 === 0 && x[2] % 2 === 0; } },
    endsUp: { t: function () { return "عددِ سوم از عددِ اول بزرگ‌تر است (عددِ وسط هر چه باشد)"; }, f: function (x) { return x[2] > x[0]; } },
    distinct: { t: function () { return "سه عددِ متفاوت، به هر ترتیبی"; }, f: function (x) { return x[0] !== x[1] && x[1] !== x[2] && x[0] !== x[2]; } },
    maxLast: { t: function () { return "عددِ سوم از هر دو عددِ دیگر بزرگ‌تر است"; }, f: function (x) { return x[2] > x[0] && x[2] > x[1]; } }
  };
  A.KRULES = RULES;
  A.kprobe = function (it, triple) { var R = RULES[it.params.rule]; return !!(R && R.f(triple, it.params.k)); };
  function witness(r1, r2, k) {
    for (var a = -3; a <= 33; a++) for (var b = -3; b <= 33; b++) for (var c = -3; c <= 33; c++) { var x = [a, b, c]; if (RULES[r1].f(x, k) !== RULES[r2].f(x, k)) return x; }
    return null;
  }
  A._kwitness = witness;
  function r246Make(level, r, o) {
    var decoy = !!o.decoy, form = o.form || pick(r, ["abstract", "real"]);
    var k = level === 1 ? 2 : pick(r, [2, 3, 4, 5, 6, 8, 10]), seed = [k, 2 * k, 3 * k];
    var fits = Object.keys(RULES).filter(function (id) { return RULES[id].f(seed, k); });
    var hidden;
    if (decoy) hidden = "stepk";
    else hidden = pick(r, ({ 1: ["inc", "endsUp"], 2: ["inc", "distinct", "maxLast", "even"], 3: ["ap", "maxLast", "sum", "mul", "endsUp"] })[Math.min(3, level)].filter(function (id) { return fits.indexOf(id) >= 0; }));
    var cands = [hidden]; if (hidden !== "stepk") cands.push("stepk"); else cands.push(pick(r, ["mul", "sum"]));
    shuf(r, fits).forEach(function (id) {
      if (cands.length >= 4 || cands.indexOf(id) >= 0) return;
      if (cands.every(function (c) { return witness(c, id, k); })) cands.push(id);
    });
    var ids = shuf(r, ["a", "b", "c", "d"]).slice(0, cands.length), map = {};
    var it = { form: form, level: level, decoy: decoy, atype: "choice", params: { rule: hidden, k: k, seed: seed, salient: "stepk", cands: {} } };
    it.choices = cands.map(function (id, i) { map[ids[i]] = id; it.params.cands[ids[i]] = id; return { id: ids[i], t: RULES[id].t(k) }; }).sort(function (x, y) { return x.id < y.id ? -1 : 1; });
    it.answer = ids[0];
    it.minProbes = level === 1 ? 2 : 3;
    var st = fa(seed.join("، "));
    it.prompt = (form === "real"
      ? "یک فیلترِ پنهان در سامانهٔ بانک، سه تراکنشِ پیاپیِ یک مشتری را (به هزار درهم) با قاعده‌ای پنهان «عادی» می‌شناسد. این سه‌تایی عادی شناخته شده است: " + st + "."
      : "سه‌تاییِ «" + st + "» با یک قاعدهٔ پنهان می‌خواند.") +
      "\nسه‌تایی‌های خودت را بیازما (هر سه عددِ صحیح، حتی صفر یا منفی)؛ سیستم برای هر کدام می‌گوید «می‌خواند» یا «نمی‌خواند». دست‌کم " + fa(it.minProbes) + " آزمون بده، بعد قاعده را از میانِ گزینه‌ها انتخاب کن.";
    it.explain = (decoy ? "این بار حدسِ اولِ رایج درست بود: «" + RULES.stepk.t(k) + "». بدلی بود: «قاعده همیشه گسترده‌تر از حدسِ اول است» هم یک پیش‌فرض است، نه قانون. "
      : "قاعده: «" + RULES[hidden].t(k) + "». سه‌تاییِ اول با چند قاعده سازگار بود؛ آزمونی که فقط حدست را تأیید می‌کند (مثلِ «" + fa([k + 1, 2 * k + 1, 3 * k + 1].map(function (x) { return x; }).join("، ")) + "» برای حدسِ «گامِ ثابت»)، نمی‌تواند قاعدهٔ گسترده‌تر را نشان دهد. ") +
      "فقط سه‌تایی‌ای که حدست برایش «نمی‌خواند» پیش‌بینی می‌کند می‌تواند حدس را رد کند (Wason 1960؛ Klayman & Ha 1987: آزمونِ مثبت همیشه خطا نیست، ولی وقتی قاعدهٔ واقعی گسترده‌تر از حدس است، آزمون‌های مثبت هرگز خلاف را نشان نمی‌دهند).";
    it.deep = "برای سنجیدنِ یک حدس، آزمونی بده که اگر حدست غلط باشد نتیجه‌اش فرق کند — به‌ویژه موردی که حدست برایش «نه» پیش‌بینی می‌کند.";
    it.trap = decoy ? "این‌جا حدسِ اول درست بود؛ تله در این نمونه نیست — ولی فقط آزمون‌های ابطالی این را نشان می‌دادند."
      : "فقط سه‌تایی‌هایی آزمودن که با حدسِ اول جورند (تأییدجویی) و اعلامِ قاعده پیش از آزمونِ ابطالی.";
    return it;
  }

  /* ---------- (ج) گزینشِ واسون ---------- */
  var WS = {
    abstract: function (r) {
      var sh = pick(r, [["دایره", "مربع"], ["مثلث", "ستاره"]]), co = pick(r, [["سبز", "قرمز"], ["آبی", "زرد"]]);
      return { form: "abstract", intro: "هر کارت یک رو شکل دارد و روی دیگر رنگ. چهار کارت روی میز است.", p: sh, q: co, cardP: function (v) { return "کارتِ «" + v + "»"; },
        rule: { pq: "اگر یک روی کارت «" + sh[0] + "» باشد، روی دیگرش «" + co[0] + "» است.", pnq: "اگر یک روی کارت «" + sh[0] + "» باشد، روی دیگرش «" + co[0] + "» نیست.", npq: "اگر یک روی کارت «" + sh[0] + "» نباشد، روی دیگرش «" + co[0] + "» است." } };
    },
    real: function () {
      return { form: "real", intro: "هر کارت یک پروندهٔ وام است: یک رو مبلغِ وام، روی دیگر اینکه چه کسی امضا کرده. چهار پرونده روی میز است.",
        p: ["وامِ ۹۰۰ هزار درهمی", "وامِ ۱۲۰ هزار درهمی"], q: ["امضا: مدیر", "امضا: کارشناس"], cardP: function (v) { return "«" + v + "»"; },
        rule: { pq: "قاعده: هر پرونده‌ای که وامش بالای ۵۰۰ هزار درهم است، باید امضای مدیر داشته باشد.", pnq: "قاعده: هیچ پرونده‌ای که وامش بالای ۵۰۰ هزار درهم است نباید امضای مدیر داشته باشد (این پرونده‌ها مستقیم به کمیته می‌روند).", npq: "قاعده: هر پرونده‌ای که وامش بالای ۵۰۰ هزار درهم نیست، باید امضای مدیر داشته باشد." } };
    },
    verbal: function (r) {
      var city = pick(r, [["شیراز", "تبریز"], ["مشهد", "رشت"]]);
      return { form: "verbal", intro: "دوستت می‌گوید دربارهٔ سفرهایش قاعده‌ای دارد. چهار بلیت روی میز است: یک روی هر بلیت مقصد و روی دیگر وسیلهٔ سفر.",
        p: city, q: ["قطار", "هواپیما"], cardP: function (v) { return "بلیتِ «" + v + "»"; },
        rule: { pq: "«هر بار که به " + city[0] + " رفته‌ام، با قطار رفته‌ام.»", pnq: "«هر بار که به " + city[0] + " رفته‌ام، با قطار نرفته‌ام.»", npq: "«هر بار که به جایی جز " + city[0] + " رفته‌ام، با قطار رفته‌ام.»" } };
    }
  };
  var POL = { pq: { na: false, nc: false }, pnq: { na: false, nc: true }, npq: { na: true, nc: false } };
  /* کارت باید برگردد اگر و فقط اگر رویِ پنهانش بتواند قاعده را نقض کند (شمارشِ هر دو مقدارِ ممکن) */
  function wasonNeed(card, pol) {
    var need = false, viol = null;
    [0, 1].forEach(function (hv) {
      var av = card.side === "a" ? card.v : hv, cv = card.side === "c" ? card.v : hv;
      var ant = pol.na ? av === 1 : av === 0, cons = pol.nc ? cv === 1 : cv === 0;
      if (ant && !cons) { need = true; viol = hv; }
    });
    return { need: need, viol: viol };
  }
  A._kwasonNeed = wasonNeed;
  function wasonMake(level, r, o) {
    var decoy = !!o.decoy, form = o.form || pick(r, ["abstract", "real", "verbal"]), S0 = WS[form](r);
    var pk = decoy ? "pnq" : level >= 3 ? "npq" : "pq", pol = POL[pk];
    var cards = [{ side: "a", v: 0 }, { side: "a", v: 1 }, { side: "c", v: 0 }, { side: "c", v: 1 }];
    var ids = shuf(r, ["k1", "k2", "k3", "k4"]);
    cards.forEach(function (c, i) { c.id = ids[i]; c.t = (c.side === "a" ? S0.p : S0.q)[c.v]; });
    var need = cards.map(function (c) { return wasonNeed(c, pol); });
    var it = { form: S0.form, level: level, decoy: decoy, atype: "choice", multi: true, params: { pol: pk, cards: cards.map(function (c) { return { id: c.id, side: c.side, v: c.v }; }) } };
    it.choices = cards.map(function (c) { return { id: c.id, t: S0.cardP(c.t) }; }).sort(function (x, y) { return x.id < y.id ? -1 : 1; });
    it.answer = setOf(cards.filter(function (c, i) { return need[i].need; }).map(function (c) { return c.id; }));
    it.prompt = S0.intro + "\n" + S0.rule[pk] + "\nکدام کارت‌ها را باید برگردانی تا بفهمی این قاعده نقض شده یا نه؟ فقط همان‌هایی را که لازم است انتخاب کن (یک یا چند).";
    it.explain = cards.map(function (c, i) {
      var other = c.side === "a" ? S0.q : S0.p;
      return need[i].need ? S0.cardP(c.t) + ": برگردان — اگر پشتش «" + other[need[i].viol] + "» باشد، قاعده نقض شده است." : S0.cardP(c.t) + ": لازم نیست — هر چه پشتش باشد، قاعده نقض نمی‌شود.";
    }).join("\n");
    it.deep = "برای وارسیِ «اگر الف آن‌گاه ب» دنبالِ موردی بگرد که می‌تواند قاعده را بشکند (الف هست و ب نیست)، نه موردی که فقط با آن جور است (Wason 1966).";
    it.trap = decoy ? "در این نسخه، کارت‌هایی که نامشان در قاعده آمده اتفاقاً همان کارت‌های لازم‌اند (Evans & Lynch 1973)؛ گرایش به هم‌خوانی این‌جا گمراه نمی‌کند."
      : "برگرداندنِ کارت‌هایی که نامشان در قاعده آمده (هم‌خوانی، Evans & Lynch 1973) یا کارتی که فقط می‌تواند قاعده را تأیید کند.";
    return it;
  }

  /* ---------- (د) نرخِ پایه ---------- */
  var BS = {
    real: { form: "real", txt: function (b, s, f) { return "یک آزمایشِ غربالگری برای بیماری‌ای است که " + fa(b) + "٪ مردمِ این گروه آن را دارند. اگر کسی بیمار باشد، آزمایش در " + fa(s) + "٪ موارد مثبت می‌شود؛ اگر بیمار نباشد، باز هم در " + fa(f) + "٪ موارد مثبت می‌شود."; }, q: "یک نفر از همین گروه مثبت شده است. احتمالِ اینکه واقعاً بیمار باشد چند درصد است؟", nf: function (N, X, Y) { return "از " + fa(N) + " نفری که آزمایش شدند، " + fa(X) + " نفر مثبت شدند و پیگیری نشان داد " + fa(Y) + " نفر از همین مثبت‌ها واقعاً بیمار بودند."; }, nq: "اگر یکی از مثبت‌ها را تصادفی برداری، احتمالِ اینکه واقعاً بیمار باشد چند درصد است؟" },
    bank: { form: "real", txt: function (b, s, f) { return "در یک بانک، " + fa(b) + "٪ تراکنش‌های یک دسته واقعاً تقلب‌اند. سامانهٔ هشدار برای تراکنشِ تقلبی در " + fa(s) + "٪ موارد هشدار می‌دهد و برای تراکنشِ سالم در " + fa(f) + "٪ موارد."; }, q: "برای یک تراکنش هشدار آمده است. احتمالِ اینکه واقعاً تقلب باشد چند درصد است؟", nf: function (N, X, Y) { return "از " + fa(N) + " تراکنشِ این دسته، برای " + fa(X) + " تراکنش هشدار آمد و بررسی نشان داد " + fa(Y) + " تا از همین هشدارها واقعاً تقلب بودند."; }, nq: "اگر یکی از هشدارها را تصادفی برداری، احتمالِ اینکه واقعاً تقلب باشد چند درصد است؟" },
    verbal: { form: "verbal", sym: true, txt: function (b, s) { return "در شهری " + fa(b) + "٪ تاکسی‌ها آبی و بقیه سبزند. شبی تاکسی‌ای تصادف کرد و شاهدی گفت آبی بود. آزمون نشان داده این شاهد در همان نورِ شب رنگ را در " + fa(s) + "٪ مواقع درست تشخیص می‌دهد (برای هر دو رنگ)."; }, q: "احتمالِ اینکه تاکسی واقعاً آبی بوده باشد چند درصد است؟", nf: function (N, X, Y) { return "در آزمونی با " + fa(N) + " تاکسی، شاهد " + fa(X) + " تاکسی را «آبی» خواند و از این‌ها " + fa(Y) + " تا واقعاً آبی بودند."; }, nq: "اگر شاهد این بار گفته «آبی»، بر پایهٔ همین شمارش احتمالِ اینکه واقعاً آبی باشد چند درصد است؟" },
    abstract: { form: "abstract", txt: function (b, s, f) { return "در یک کیسه " + fa(b) + "٪ ژتون‌ها نشان‌دارند. حسگری ژتونِ نشان‌دار را با احتمالِ " + fa(s) + "٪ «مثبت» اعلام می‌کند و ژتونِ بی‌نشان را با احتمالِ " + fa(f) + "٪."; }, q: "حسگر برای یک ژتون «مثبت» گفته است. احتمالِ اینکه نشان‌دار باشد چند درصد است؟", nf: function (N, X, Y) { return "از " + fa(N) + " ژتون، حسگر " + fa(X) + " تا را «مثبت» اعلام کرد و " + fa(Y) + " تا از همین‌ها واقعاً نشان‌دار بودند."; }, nq: "اگر یکی از «مثبت»ها را برداری، احتمالِ اینکه نشان‌دار باشد چند درصد است؟" }
  };
  var BCOMBO = (function () {
    var out = [];
    [1000, 10000].forEach(function (N) {
      [1, 2, 5, 10, 15, 20, 25].forEach(function (b) {
        [70, 75, 80, 85, 90, 95, 99].forEach(function (s) {
          [1, 2, 4, 5, 10, 15, 20, 25, 30].forEach(function (f) {
            var sick = N * b / 100, tp = sick * s / 100, fp = (N - sick) * f / 100;
            if (sick % 1 || tp % 1 || fp % 1 || !tp) return;
            out.push({ N: N, b: b, s: s, f: f, sick: sick, tp: tp, fp: fp, post: 100 * tp / (tp + fp) });
          });
        });
      });
    });
    return out;
  })();
  A._kbayesCombos = BCOMBO;
  function bayesMake(level, r, o) {
    var decoy = !!o.decoy, keys = Object.keys(BS).filter(function (k) { return !o.form || BS[k].form === o.form; });
    var sk = o.surface || pick(r, keys.length ? keys : Object.keys(BS)), S0 = BS[sk];
    var asInt = level >= 2;
    var pool = BCOMBO.filter(function (c) {
      if (S0.sym && c.f !== 100 - c.s) return false;
      if (asInt && c.post % 1) return false;
      if (decoy) return true;
      return c.post <= c.s - 15;
    });
    for (var t = 0; t < 200; t++) {
      var c = pick(r, pool), it = { form: S0.form, level: level, decoy: decoy, params: { N: c.N, b: c.b, s: c.s, f: c.f, tp: c.tp, fp: c.fp } };
      var postR = Math.round(c.post);
      it.prompt = (decoy ? S0.nf(c.N, c.tp + c.fp, c.tp) + "\n" + S0.nq : S0.txt(c.b, c.s, c.f) + "\n" + S0.q) + (asInt ? " (پاسخ را به درصد و با عددِ صحیح بنویس.)" : " (نزدیک‌ترین گزینه را انتخاب کن.)");
      if (asInt) { it.atype = "int"; it.answer = String(c.post); }
      else {
        var dist = [c.s, 100 - c.f, c.b, Math.round(100 * c.tp / c.N), 50, Math.round((c.s + c.post) / 2)];
        var vals = [postR];
        shuf(r, dist).forEach(function (v) { if (vals.length < 4 && v > 0 && v <= 100 && vals.every(function (x) { return Math.abs(x - v) >= 5; })) vals.push(v); });
        if (vals.length < 4) continue;
        var ids = shuf(r, ["a", "b", "c", "d"]);
        it.atype = "choice"; it.choices = vals.map(function (v, i) { return { id: ids[i], t: "حدودِ " + fa(v) + "٪" }; }).sort(function (x, y) { return x.id < y.id ? -1 : 1; });
        it.answer = ids[0];
      }
      var pos = c.tp + c.fp;
      it.explain = (decoy ? "این‌جا شمارش‌ها مستقیم داده شده بود: از " + fa(pos) + " مثبت، " + fa(c.tp) + " مورد درست بود ⇒ " + fa(postR) + "٪. بدلی بود: وقتی داده‌ها به صورتِ «تعداد» می‌آیند، نرخِ پایه از پیش در آن‌ها هست و تله‌ای نمی‌ماند (Gigerenzer & Hoffrage 1995)."
        : "به تعداد تبدیل کن: از " + fa(c.N) + " مورد، " + fa(c.sick) + " مورد واقعی‌اند و " + fa(c.tp) + " تا از آن‌ها مثبت می‌شوند؛ از " + fa(c.N - c.sick) + " موردِ دیگر هم " + fa(c.fp) + " تا مثبت می‌شوند. پس از " + fa(pos) + " مثبت، فقط " + fa(c.tp) + " تا واقعی‌اند ≈ " + fa(postR) + "٪ — خیلی کمتر از " + fa(c.s) + "٪.");
      it.deep = "«مثبت، اگر واقعی باشد» با «واقعی، اگر مثبت باشد» یکی نیست؛ نرخِ پایه (چقدر این حالت در کل رایج است) تعیین می‌کند چند تا از مثبت‌ها کاذب‌اند. راهِ مطمئن: همه‌چیز را به تعدادِ موارد در یک جمعیتِ فرضی تبدیل کن.";
      it.trap = decoy ? "این‌جا نرخِ پایه در شمارش‌ها نهفته است؛ تلهٔ نادیده‌گرفتنِ آن وجود ندارد." : "پاسخ دادن با همان درصدِ حساسیت (" + fa(c.s) + "٪) و نادیده گرفتنِ اینکه حالتِ واقعی چقدر کمیاب است.";
      return it;
    }
    throw new Error("bayes: no problem");
  }

  /* ---------- (هـ) زنجیرهٔ حافظهٔ کاری ---------- */
  var DIRS = ["شمال", "شرق", "جنوب", "غرب"];
  function wmMake(level, r, o) {
    var decoy = !!o.decoy, form = o.form || pick(r, ["numeric", "real", "visual"]);
    var n = decoy ? 2 : 3 + level + ri(r, 0, 1);
    for (var t = 0; t < 200; t++) {
      var it = { form: form, level: level, decoy: decoy, steps: [], params: { ops: [] } }, i, v, ok = true;
      if (form === "visual") {
        var d0 = ri(r, 0, 3), d = d0;
        for (i = 0; i < n; i++) { var turn = pick(r, [1, 3, 2]); d = (d + turn) % 4; it.params.ops.push(turn); it.steps.push(turn === 1 ? "۹۰ درجه به راست بچرخ." : turn === 3 ? "۹۰ درجه به چپ بچرخ." : "پشتِ سرت را نگاه کن (۱۸۰ درجه بچرخ)."); }
        if (d === d0) continue;
        it.prompt = "رو به " + DIRS[d0] + " ایستاده‌ای. دستورها یکی‌یکی می‌آیند و هر دستور با آمدنِ بعدی پنهان می‌شود.\nدر پایان رو به کدام سمتی؟";
        var ids = shuf(r, ["a", "b", "c", "d"]);
        it.atype = "choice"; it.choices = DIRS.map(function (x, j) { return { id: ids[j], t: x }; }).sort(function (x, y) { return x.id < y.id ? -1 : 1; });
        it.answer = ids[d]; it.params.start = d0; it.params.end = d;
        it.explain = "از «" + DIRS[d0] + "»: " + it.params.ops.map(function (tn) { return tn === 1 ? "راست" : tn === 3 ? "چپ" : "۱۸۰"; }).join(" ← ") + " ⇒ «" + DIRS[d] + "».";
      } else {
        v = ri(r, 3, 9); var start = v, trace = [fa(v)];
        for (i = 0; i < n && ok; i++) {
          var op = form === "real" ? pick(r, ["+", "-"]) : pick(r, ["+", "-", "x2"]), a = ri(r, 2, 19);
          if (op === "x2" && v > 60) op = "-";
          if (op === "-" && v - a < 1) op = "+";
          if (op === "+") v += a; else if (op === "-") v -= a; else v *= 2;
          it.params.ops.push(op === "x2" ? ["x2"] : [op, a]);
          trace.push(ltr(op === "x2" ? "×۲ = " + fa(v) : (op === "+" ? "+" : "−") + fa(a) + " = " + fa(v)));
          it.steps.push(form === "real" ? (op === "+" ? "مشتری‌ای " + fa(a) + " درهم پرداخت کرد." : fa(a) + " درهم بقیهٔ پول دادی.") : (op === "+" ? fa(a) + " تا به آن اضافه کن." : op === "-" ? fa(a) + " تا از آن کم کن." : "دو برابرش کن."));
        }
        if (v > 400) continue;
        it.params.start = start;
        it.prompt = form === "real" ? "در صندوق " + fa(start) + " درهم است. رخدادها یکی‌یکی می‌آیند و هر کدام با آمدنِ بعدی پنهان می‌شود.\nدر پایان چند درهم در صندوق است؟" : "عددِ " + fa(start) + " را در ذهن نگه دار. دستورها یکی‌یکی می‌آیند و هر دستور با آمدنِ بعدی پنهان می‌شود.\nحاصلِ نهایی چند است؟";
        it.atype = "int"; it.answer = String(v);
        it.explain = trace.join(" ← ");
      }
      it.deep = "حافظهٔ کاری هم‌زمان فقط چند قلم را نگه می‌دارد (Cowan 2001: حدودِ ۳ تا ۵ قلم)؛ وقتی قلم‌ها بیشتر می‌شوند، آن‌ها را بیرون بیاور — روی کاغذ یا چرک‌نویس (تکنیکِ ۳۷).";
      it.trap = decoy ? "فقط دو گام؛ بار کم است و نگه‌داشتن در ذهن کافی است — بیرون‌ریزی ضرر ندارد ولی لازم هم نیست." : "نگه‌داشتنِ همه‌چیز در ذهن وقتی چرک‌نویس در دسترس است؛ خطا معمولاً در گام‌های میانی رخ می‌دهد.";
      if (!A.kleak(it)) return it;
    }
    throw new Error("wm: no problem");
  }

  /* ---------- (و) حساب با قیدِ خودساخته: «کسرِ میانی ممنوع نیست» ---------- */
  function solve24(nums) {
    var out = {};
    function rec(list) {
      if (list.length === 1) {
        var x = list[0]; if (x.v[1] !== 1) return;
        var o = out[x.v[0]] || (out[x.v[0]] = { i: null, f: null });
        if (x.frac) { if (!o.f) o.f = x.s; } else if (!o.i) o.i = x.s;
        return;
      }
      for (var i = 0; i < list.length; i++) for (var j = i + 1; j < list.length; j++) {
        var a = list[i], b = list[j], rest = list.filter(function (_, k) { return k !== i && k !== j; });
        [[qadd(a.v, b.v), a.s + "+" + b.s], [qmul(a.v, b.v), a.s + "*" + b.s], [qsub(a.v, b.v), a.s + "-" + b.s], [qsub(b.v, a.v), b.s + "-" + a.s],
          [qdiv(a.v, b.v), a.s + "/" + b.s], [qdiv(b.v, a.v), b.s + "/" + a.s]].forEach(function (p) {
          if (!p[0]) return;
          rec(rest.concat([{ v: p[0], s: "(" + p[1] + ")", frac: a.frac || b.frac || p[0][1] !== 1 }]));
        });
      }
    }
    rec(nums.map(function (n) { return { v: [n, 1], s: String(n), frac: false }; }));
    return out;
  }
  A._ksolve24 = solve24;
  /* پرانتزهای زائد را برای خوانایی برمی‌دارد و با بررسیِ دقیق تضمین می‌کند مقدار عوض نشده است */
  function tidy(s, nums, T) {
    var cur = s.replace(/^\((.*)\)$/, "$1");
    for (var pass = 0; pass < 12; pass++) {
      var changed = false, re = /\((\d+)\)/g;
      cur = cur.replace(re, "$1");
      for (var i = 0; i < cur.length; i++) {
        if (cur[i] !== "(") continue;
        var d = 0, j = i;
        for (; j < cur.length; j++) { if (cur[j] === "(") d++; else if (cur[j] === ")") { d--; if (!d) break; } }
        var cand = cur.slice(0, i) + cur.slice(i + 1, j) + cur.slice(j + 1);
        if (A.kexprCheck(cand, nums, T).ok && evalStr(cand) === evalStr(cur)) { cur = cand; changed = true; break; }
      }
      if (!changed) break;
    }
    return cur;
  }
  function evalStr(s) { /* رشتهٔ مقدار برای مقایسهٔ دقیق */
    var i = 0;
    function f() { if (s[i] === "(") { i++; var v = e(); i++; return v; } var m = /^\d+/.exec(s.slice(i)); i += m[0].length; return [parseInt(m[0], 10), 1]; }
    function t() { var v = f(); while (s[i] === "*" || s[i] === "/") { var op = s[i++], w = f(); v = op === "*" ? qmul(v, w) : qdiv(v, w); if (!v) return [NaN, 1]; } return v; }
    function e() { var v = t(); while (s[i] === "+" || s[i] === "-") { var op = s[i++], w = t(); v = op === "+" ? qadd(v, w) : qsub(v, w); } return v; }
    var v = e(); return v[0] + "/" + v[1];
  }
  var H24_FALLBACK = [[1, 5, 5, 5], [3, 3, 8, 8], [1, 3, 4, 6], [1, 4, 5, 6], [2, 5, 5, 10]];
  function h24Make(level, r, o) {
    var decoy = !!o.decoy, hi = level >= 3 ? 13 : 10;
    for (var t = 0; t < 120; t++) {
      var nums = t < 100 ? [ri(r, 1, hi), ri(r, 1, hi), ri(r, 1, hi), ri(r, 1, hi)] : pick(r, H24_FALLBACK).slice();
      nums.sort(function (a, b) { return a - b; });
      var sol = solve24(nums), targets = [];
      for (var T = 10; T <= 40; T++) { var x = sol[T]; if (!x) continue; if (decoy ? !!x.i : (!x.i && !!x.f)) targets.push(T); }
      if (!targets.length) continue;
      var T0 = targets.indexOf(24) >= 0 && r() < 0.6 ? 24 : pick(r, targets), raw = decoy ? sol[T0].i : sol[T0].f;
      var ans = tidy(raw, nums, T0);
      if (!A.kexprCheck(ans, nums, T0).ok) ans = raw;
      /* سه ظاهر برای یک ساختار (ممیزی ۲۰۲۶-۱۰-۱۲: F2 فقط یک شکلِ کدی داشت): انتزاعی، داستانِ کلامی، و کارت‌های تصویری */
      var form = o.form || pick(r, ["abstract", "verbal", "visual"]);
      var it = { form: form, level: level, decoy: decoy, atype: "text", exact: "expr", answer: ans, params: { nums: nums, target: T0 } };
      var rules = "(چسباندنِ رقم‌ها، مثلِ ساختنِ «" + fa(String(nums[0]) + String(nums[1])) + "» از دو عدد، و علامتِ منفیِ تنها مجاز نیست.)";
      if (form === "verbal") it.prompt = "دوستت چهار کارت با عددهای " + fa(nums.join("، ")) + " جلویت می‌گذارد و می‌گوید: «با همین چهار عدد — هر کدام دقیقاً یک بار — و جمع، تفریق، ضرب، تقسیم و پرانتز، به " + fa(T0) + " برس.» چطور؟\n" + rules;
      else if (form === "visual") { it.prompt = "چهار کارتِ شکل را ببین (روی آن‌ها: " + fa(nums.join("، ")) + "). با عددِ هر کارت دقیقاً یک بار، و «+ − × ÷» و پرانتز، عددِ " + fa(T0) + " را بساز.\n" + rules; it.svg = { type: "cards", nums: nums.slice(), target: T0 }; }
      else it.prompt = "با عددهای " + fa(nums.join("، ")) + " — هر کدام دقیقاً یک بار — و چهار عملِ «+ − × ÷» و پرانتز، عددِ " + fa(T0) + " را بساز.\n" + rules;
      it.explain = (decoy ? "یک راهِ تمام‌صحیح: " : "یک راه: ") + ltr(ans.replace(/\*/g, " × ").replace(/\//g, " ÷ ").replace(/\+/g, " + ").replace(/-/g, " − ") + " = " + T0) + "." +
        (decoy ? " این‌جا بی کسرِ میانی هم می‌شد؛ بدلی بود." : " در این مسئله هیچ راهی بدونِ عددِ کسریِ میانی وجود ندارد (همهٔ ترکیب‌ها با کد شمرده شده‌اند). اگر بی‌آنکه کسی گفته باشد فرض کردی نتیجه‌های میانی باید عددِ صحیح باشند، همان «قیدِ خودساخته» بود.");
      it.deep = "قیدهایی را که خودت به مسئله افزوده‌ای پیدا کن: صورت واقعاً چه چیزی را ممنوع کرده و چه چیزی را تو فرض کرده‌ای؟ (Kershaw & Ohlsson 2004؛ Knoblich et al. 1999)";
      it.trap = decoy ? "این‌جا راهِ ساده (فقط عددهای صحیح) هست؛ تله‌ای در کار نیست." : "فرضِ نانوشتهٔ «حاصل‌های میانی باید عددِ صحیح باشند».";
      return it;
    }
    throw new Error("h24: no problem");
  }

  /* ---------- (ز) بازخوانیِ صورت: مرزها (F2 ‹ «صورت را دقیق نخواندم/مدل نساختم») ----------
     جزئیِ کوچکی در صورت («هر دو سر»، «هر دو صفحه هم»، «اولی همین حالا») پاسخ را یکی عوض می‌کند؛ حسابِ خودکار (تقسیم/تفریق) بی بازخوانی
     یکی کم/زیاد می‌دهد. بدلی: همان ظاهر ولی این بار حسابِ ساده درست است. پاسخ عددِ صحیح و با کد محاسبه می‌شود؛ هرگز عددی از صورت نیست. */
  function rereadMake(level, r, o) {
    var decoy = !!o.decoy, form = o.form || pick(r, ["numeric", "verbal", "real"]);
    var lo = level === 1 ? 4 : level === 2 ? 8 : 14, hi = level === 1 ? 9 : level === 2 ? 16 : 30;
    for (var t = 0; t < 200; t++) {
      var it = { form: form, level: level, decoy: decoy, atype: "int", params: { kind: form } }, ans, naive;
      if (form === "verbal") {
        var d = pick(r, [2, 3, 4, 5, 6, 8, 10]), m = ri(r, lo, hi), L = d * m;
        it.params.d = d; it.params.L = L; naive = m;
        if (decoy) { ans = m; it.prompt = "دورِ یک باغچهٔ گرد به محیطِ " + fa(L) + " متر حصار می‌کشند و هر " + fa(d) + " متر یک تیرک می‌کوبند (دور تا دور، با فاصله‌های برابر). چند تیرک لازم است؟"; }
        else { ans = m + 1; it.prompt = "در امتدادِ یک دیوارِ صاف به طولِ " + fa(L) + " متر هر " + fa(d) + " متر یک تیرک می‌کوبند؛ در هر دو سرِ دیوار هم تیرک هست. چند تیرک لازم است؟"; }
        it.explain = decoy ? "دورِ بسته: تیرکِ آخر همان تیرکِ اول است، پس " + fa(L) + " ÷ " + fa(d) + " = " + fa(m) + " تیرک. این بار حسابِ ساده درست بود."
          : fa(L) + " ÷ " + fa(d) + " = " + fa(m) + " فاصله است؛ تیرک‌ها یکی بیشتر از فاصله‌ها هستند (هر دو سر): " + fa(m + 1) + ".";
      } else if (form === "numeric") {
        var a = ri(r, 10, 60 * level), k = ri(r, lo, hi * 2), b = a + k;
        it.params.a = a; it.params.b = b; naive = k;
        if (decoy) { ans = k; it.prompt = "از صفحهٔ " + fa(a) + " شروع کردی و درست پیش از صفحهٔ " + fa(b) + " دست کشیدی (خودِ صفحهٔ " + fa(b) + " را نخواندی). چند صفحه خواندی؟"; }
        else { ans = k + 1; it.prompt = "از صفحهٔ " + fa(a) + " تا صفحهٔ " + fa(b) + " را خواندی؛ هر دو صفحه هم خوانده شد. چند صفحه خواندی؟"; }
        it.explain = decoy ? "صفحه‌های " + fa(a) + " تا " + fa(b - 1) + ": " + fa(b) + " − " + fa(a) + " = " + fa(k) + ". این بار تفریقِ ساده درست بود."
          : "شمارشِ دو سرِ بسته: " + fa(b) + " − " + fa(a) + " + ۱ = " + fa(k + 1) + " (تفریق فقط فاصله‌ها را می‌شمارد).";
      } else {
        var hgap = pick(r, [2, 3, 4, 6, 8, 12]), n = ri(r, lo, hi);
        it.params.h = hgap; it.params.n = n; naive = n * hgap;
        if (decoy) { ans = n * hgap; it.prompt = fa(n) + " قرص داری و باید هر " + fa(hgap) + " ساعت یکی بخوری؛ اولی را " + fa(hgap) + " ساعتِ دیگر می‌خوری (نه الان). از الان چند ساعت دیگر آخرین قرص را می‌خوری؟"; }
        else { ans = (n - 1) * hgap; it.prompt = fa(n) + " قرص داری و باید هر " + fa(hgap) + " ساعت یکی بخوری؛ اولی را همین حالا می‌خوری. از الان چند ساعت دیگر آخرین قرص را می‌خوری؟"; }
        it.explain = decoy ? "اولی پس از " + fa(hgap) + " ساعت، پس آخری پس از " + fa(n) + " × " + fa(hgap) + " = " + fa(n * hgap) + " ساعت. این بار ضربِ ساده درست بود."
          : "اولی در لحظهٔ صفر است؛ " + fa(n) + " قرص یعنی " + fa(n - 1) + " فاصله: " + fa(n - 1) + " × " + fa(hgap) + " = " + fa((n - 1) * hgap) + " ساعت.";
      }
      it.answer = String(ans); it.params.naive = naive;
      it.deep = "پیش از حساب، صورت را کلمه‌به‌کلمه دوباره بخوان و مرزها را بشمار: «هر دو سر»، «شامل»، «اولی همین حالا» — شمردنِ فاصله‌ها با شمردنِ نقطه‌ها یکی نیست (خطای «یکی کم/یکی زیاد»).";
      it.trap = decoy ? "این‌جا تله‌ای نیست: حسابِ ساده درست است. «همیشه یکی اضافه کن» هم اگر کور اجرا شود خودش یک قاعدهٔ خودکار است."
        : "حسابِ خودکار (تقسیم، تفریق یا ضرب) بی بازخوانیِ اینکه دو سرِ بازه هم شمرده می‌شود.";
      if (!A.kleak(it)) return it;
    }
    throw new Error("reread: no problem");
  }

  /* ---------- (ح) نمادگذاری: نام‌گذاریِ خوب (F2 ‹ بازنمایی) ----------
     هر نام = [نشانِ نوع، نشانِ موجود، متن]. قاعده‌ها (پولیا، «نمادگذاری»؛ قابلِ وارسیِ مستقل در آزمون):
     (۱) بی‌ابهام: هیچ دو چیزی یک نام ندارند؛ (۲) نامِ رزرو‌شده (π، e) برای کمیتِ مسئله نیست؛ (۳) اگر چیزها مرتبط‌اند: هم‌نوع ⇔ نشانِ نوعِ یکسان،
     هم‌موجود (رأسِ A و ضلعِ روبه‌رویش) ⇔ نشانِ موجودِ یکسان. دقیقاً یک گزینه هر سه را دارد. بدلی: چیزها مرتبط نیستند ⇒ نام‌های عامِ x، y، z بس است. */
  var GREEK = { a: "α", b: "β", c: "γ" }, SUB = { 1: "₁", 2: "₂" }, ORD = { a: "اول", b: "دوم", c: "سوم" };
  function notationMake(level, r, o) {
    var decoy = !!o.decoy, form = o.form || pick(r, ["abstract", "real"]), objs, related = !decoy;
    if (decoy) objs = form === "abstract" ? [{ n: "طولِ یک پاره‌خط", g: "len", i: "1" }, { n: "مساحتِ یک دایرهٔ جدا", g: "area", i: "2" }, { n: "اندازهٔ یک زاویهٔ دیگر", g: "ang", i: "3" }]
      : [{ n: "قیمتِ یک کتاب", g: "price", i: "1" }, { n: "شمارِ صفحه‌های یک دفترِ دیگر", g: "pages", i: "2" }, { n: "زمانِ رفتن تا کتابخانه", g: "time", i: "3" }];
    else if (form === "abstract") {
      objs = []; ["a", "b", "c"].forEach(function (e) { objs.push({ n: "رأسِ " + ORD[e], g: "V", i: e }); });
      ["a", "b", "c"].forEach(function (e) { objs.push({ n: "ضلعِ روبه‌روی رأسِ " + ORD[e], g: "S", i: e }); });
      if (level >= 2) ["a", "b", "c"].forEach(function (e) { objs.push({ n: "زاویهٔ رأسِ " + ORD[e], g: "G", i: e }); });
    } else {
      objs = []; var kinds = level >= 2 ? [["v", "سرعتِ"], ["t", "زمانِ حرکتِ"], ["d", "مسافتِ"]] : [["v", "سرعتِ"], ["t", "زمانِ حرکتِ"]];
      ["1", "2"].forEach(function (e) { kinds.forEach(function (k) { objs.push({ n: k[1] + " قطارِ " + (e === "1" ? "اول" : "دوم"), g: k[0], i: e }); }); });
    }
    function good() {   // نام‌گذاریِ درست
      return objs.map(function (x) {
        if (decoy) return ["g" + x.i, x.i, ({ 1: "x", 2: "y", 3: "z" })[x.i]];
        if (form === "abstract") return [x.g, x.i, x.g === "V" ? x.i.toUpperCase() : x.g === "S" ? x.i : GREEK[x.i]];
        return [x.g, x.i, x.g + SUB[x.i]];
      });
    }
    var GEN = ["x", "y", "z", "u", "w", "s", "p", "q", "m"];
    function generic() { var g = shuf(r, GEN); return objs.map(function (x, k) { return ["k" + k, "e" + k, g[k]]; }); }
    function ambiguous() { var m = good().map(function (s) { return s.slice(); }), j = ri(r, 1, m.length - 1), i0 = ri(r, 0, j - 1); m[j] = [m[j][0], m[j][1], m[i0][2]]; return m; }
    function reserved() { var m = good().map(function (s) { return s.slice(); }), j = ri(r, 0, m.length - 1); m[j] = [m[j][0], m[j][1], pick(r, ["π", "e"])]; return m; }
    function mismatch() {   // دو موجود در یک نوع جابه‌جا: مثلاً ضلعِ روبه‌روی رأسِ اول «b» نامیده شود
      var m = good().map(function (s) { return s.slice(); }), g2 = objs.map(function (x, k) { return k; }).filter(function (k) { return objs[k].g !== objs[0].g; });
      var gg = objs[g2[0]].g, ks = g2.filter(function (k) { return objs[k].g === gg; }), a = ks[0], b = ks[1];
      var ta = m[a], tb = m[b]; m[a] = [ta[0], tb[1], tb[2]]; m[b] = [tb[0], ta[1], ta[2]]; return m;
    }
    var cands = decoy ? [good(), ambiguous(), reserved(), ambiguous()] : [good(), generic(), ambiguous(), mismatch()];
    function txtOf(m) { return objs.map(function (x, k) { return x.n + ": " + m[k][2]; }).join("؛ "); }
    var texts = cands.map(txtOf);
    for (var t = 0; t < 30 && new Set(texts).size < texts.length; t++) { cands[3] = decoy ? (t % 2 ? reserved() : ambiguous()) : generic(); texts = cands.map(txtOf); }
    if (new Set(texts).size < texts.length) throw new Error("notation: duplicate choices");
    var ids = shuf(r, ["a", "b", "c", "d"]), it = { form: form, level: level, decoy: decoy, atype: "choice", answer: ids[0] };
    it.choices = cands.map(function (m, k) { return { id: ids[k], t: texts[k] }; }).sort(function (x, y) { return x.id < y.id ? -1 : 1; });
    it.params = { related: related, objs: objs.map(function (x) { return { g: x.g, i: x.i }; }), cands: {} };
    cands.forEach(function (m, k) { it.params.cands[ids[k]] = m; });
    it.prompt = (decoy ? "در یک مسئله سه کمیتِ نامرتبط هست: " : form === "abstract" ? "در یک مسئلهٔ هندسه مثلثی داری و این‌ها را نام می‌گذاری: " : "در یک مسئلهٔ حرکت دو قطار داری و این‌ها را نام می‌گذاری: ") +
      objs.map(function (x) { return x.n; }).join("، ") + ".\nکدام نام‌گذاری برای این مسئله درست‌تر است؟";
    it.explain = decoy ? "این‌جا چیزها به هم مرتبط نیستند؛ کافی است نام‌ها یکتا باشند و با نمادهای ثابت (π، e) قاطی نشوند. گزینه‌های دیگر یا یک نام را برای دو چیز به کار برده‌اند یا نمادِ ثابتی را."
      : "نام‌گذاریِ خوب بی‌ابهام است و چیزهای مرتبط را با نام‌های مرتبط نشان می‌دهد: " + (form === "abstract" ? "رأسِ A روبه‌روی ضلعِ a (و زاویهٔ α)" : "کمیت‌های هر قطار با همان اندیس") + ". نام‌های عامِ x، y، z… بی‌ابهام‌اند ولی این پیوند را پنهان می‌کنند.";
    it.deep = "نماد را چنان بگذار که بی‌ابهام و به‌یادماندنی باشد و ترتیب و پیوندِ چیزها را بازتاب دهد؛ نمادِ خوب نیمی از ترجمهٔ شرط به معادله است (Pólya 1945).";
    it.trap = decoy ? "این‌جا تله‌ای نیست: نام‌های عام بس است. «همیشه نام‌های هم‌خانواده بگذار» هم وقتی چیزی به هم مرتبط نیست قاعدهٔ کور است."
      : "نام‌گذاریِ عامِ x، y، z… که بی‌ابهام است ولی پیوندِ رأس و ضلع یا اندیسِ هر قطار را گم می‌کند؛ یا جابه‌جاییِ یک حرف.";
    return it;
  }

  /* ---------- (ط) ترجمهٔ شرط به رابطه (F2 ‹ بازنمایی؛ خطای وارونه‌نویسی — Clement 1982) ----------
     جدولِ دوستونی «بیانِ کلامی ⇐ رابطه» با یک سطرِ خالی. رابطه‌ها = [p، q، c] برای p·X + q·Y = c ⇐ وارسیِ مستقل با جای‌گذاری.
     غیربدلی: جمله‌بندیِ «به‌ازای هر …، k …» (ترتیبِ واژه‌ها به رابطهٔ وارونه می‌کشد)؛ بدلی: «… k برابرِ … است» (ترتیبِ واژه همان رابطهٔ درست است). سطحِ ۳: عددِ صحیحِ مجهول. */
  var EQS = {
    verbal: { X: "S", Y: "P", xn: "دانشجو", yn: "استاد", place: "در یک دانشکده", per: function (k) { return "به‌ازای هر استاد " + fa(k) + " دانشجو هست"; }, times: function (k) { return "شمارِ دانشجوها " + fa(k) + " برابرِ شمارِ استادهاست"; } },
    real: { X: "A", Y: "B", xn: "سیب", yn: "جعبه", place: "در یک انبار", per: function (k) { return "در هر جعبه " + fa(k) + " سیب هست"; }, times: function (k) { return "شمارِ سیب‌ها " + fa(k) + " برابرِ شمارِ جعبه‌هاست"; } },
    abstract: { X: "x", Y: "y", xn: "x", yn: "y", place: "دربارهٔ دو عددِ مثبت", per: function (k) { return "نسبتِ x به y مثلِ " + fa(k) + " به ۱ است"; }, times: function (k) { return "x، " + fa(k) + " برابرِ y است"; } }
  };
  function relTxt(E, v) {   // [p, q, c] ⇐ متنِ ساده (p·X + q·Y = c)
    var p = v[0], q = v[1], c = v[2];
    if (p === 1 && q < 0 && c === 0) return E.X + " = " + (-q) + E.Y;
    if (q === 1 && p < 0 && c === 0) return E.Y + " = " + (-p) + E.X;
    if (p === 1 && q === -1 && c > 0) return E.X + " = " + E.Y + " + " + c;
    if (p === 1 && q === 1) return E.X + " + " + E.Y + " = " + c;
    return p + "·" + E.X + " + " + q + "·" + E.Y + " = " + c;
  }
  A.krelTxt = relTxt;
  function eqtransMake(level, r, o) {
    var decoy = !!o.decoy, form = o.form || pick(r, ["verbal", "real", "abstract"]), E = EQS[form];
    var k = ri(r, 2, level === 1 ? 6 : 12), clause = decoy ? E.times(k) : E.per(k);
    var it = { form: form, level: level, decoy: decoy, params: { form: form, k: k, X: E.X, Y: E.Y } };
    if (level >= 3) {
      var y = ri(r, 3, 40); if (y === k) y++;   // پاسخ نباید عددی از صورت باشد (k یا N؛ N = y(k + 1) هرگز برابرِ y نیست)
      var N = y * (k + 1);
      it.atype = "int"; it.answer = String(y); it.params.N = N;
      var row2 = form === "abstract" ? "«مجموعشان " + fa(N) + " است» ⇐ " + ltr(E.X + " + " + E.Y + " = " + N) : "«روی هم " + fa(N) + " تا» ⇐ " + ltr(E.X + " + " + E.Y + " = " + N);
      it.prompt = (form === "abstract" ? E.place + ": " + clause + "، و مجموعشان " + fa(N) + " است. جدولِ ترجمه را کامل کن و y را بیاب." :
        E.place + " " + clause + " و روی هم " + fa(N) + " " + E.xn + " و " + E.yn + " هست. جدولِ ترجمه را کامل کن و شمارِ " + E.yn + "‌ها را بیاب.") + "\n«" + clause + "» ⇐ ؟\n" + row2;
      it.explain = "سطرِ اول: " + ltr(E.X + " = " + k + E.Y) + " (با یک " + E.yn + " باید " + fa(k) + " " + E.xn + " باشد). جای‌گذاری در سطرِ دوم: " + ltr((k + 1) + E.Y + " = " + N) + " ⇒ " + fa(y) + ".";
    } else {
      var right = [1, -k, 0], cands = [right, [-k, 1, 0], [1, -1, k], [1, 1, k]];
      var ids = shuf(r, ["a", "b", "c", "d"]);
      it.atype = "choice"; it.answer = ids[0]; it.params.rels = {};
      it.choices = cands.map(function (v, j) { it.params.rels[ids[j]] = v; return { id: ids[j], t: ltr(relTxt(E, v)) }; }).sort(function (x, y2) { return x.id < y2.id ? -1 : 1; });
      var other = level === 2 ? "\n«" + (form === "abstract" ? "هر دو عدد مثبت‌اند" : "هیچ‌کدام صفر نیست") + "» ⇐ " + ltr(E.X + " > 0, " + E.Y + " > 0") : "";
      it.prompt = E.place + " " + clause + ". جدولِ ترجمه (بیانِ کلامی ⇐ رابطه) را کامل کن" + (form === "abstract" ? "." : "؛ " + ltr(E.X) + " برای شمارِ " + E.xn + "‌ها و " + ltr(E.Y) + " برای شمارِ " + E.yn + "‌ها.") + other + "\n«" + clause + "» ⇐ ؟";
      it.explain = "درست: " + ltr(relTxt(E, right)) + ". آزمونِ ساده: با یک " + E.yn + " (" + ltr(E.Y + " = 1") + ") باید " + fa(k) + " " + E.xn + " باشد. " + (decoy ? "این بار ترتیبِ واژه‌ها هم همین رابطه را می‌داد." : "رابطهٔ وارونه (" + ltr(relTxt(E, [-k, 1, 0])) + ") ترتیبِ واژه‌ها را دنبال می‌کند، نه موقعیت را.");
    }
    it.deep = "هر سطرِ شرط را جدا ترجمه کن و رابطه را با یک عددِ ساده بیازما (یک استاد ⇐ چند دانشجو؟)؛ جهتِ رابطه را موقعیت تعیین می‌کند، نه ترتیبِ واژه‌ها (Clement 1982؛ Pólya 1945).";
    it.trap = decoy ? "این‌جا تله‌ای نیست: ترتیبِ واژه‌ها و رابطهٔ درست یکی‌اند." : "نوشتنِ رابطه به ترتیبِ واژه‌ها (" + ltr(relTxt(E, [-k, 1, 0])) + ") به‌جای آزمودنش با یک عددِ ساده.";
    return it;
  }

  /* ---------- (ی) آزمونِ ابعاد (F4 ‹ پایش؛ وارسیِ نتیجه) ----------
     هر فرمول = جمعِ تک‌جمله‌ها؛ هر تک‌جمله = ضریب + توانِ نمادها. بُعد = Σ توان × بُعدِ نماد ([طول، زمان]). غیربدلی: دقیقاً یک فرمول ناهم‌بُعد است؛
     بدلی: همه هم‌بُعدند و پاسخ «هیچ‌کدام» است (آزمونِ ابعاد شرطِ لازم است نه کافی — گذشتن از آن درستی را ثابت نمی‌کند). */
  var DIMS = {
    abstract: { syms: { a: [1, 0], b: [1, 0], h: [1, 0] }, targets: [["مساحت", [2, 0], "S"], ["حجم", [3, 0], "V"]], intro: "a، b و h طول‌اند (مثلاً به متر)." },
    real: { syms: { v: [1, -1], t: [0, 1], g: [1, -2], d: [1, 0] }, targets: [["مسافت", [1, 0], "x"], ["زمان", [0, 1], "T"]], intro: "v سرعت است، t زمان، g شتاب و d طول." }
  };
  A.KDIMS = DIMS;
  function monoDim(D, m) { var L = 0, T = 0; Object.keys(m.p).forEach(function (s) { L += m.p[s] * D.syms[s][0]; T += m.p[s] * D.syms[s][1]; }); return [L, T]; }
  function monoTxt(m) {
    var num = [], den = [];
    Object.keys(m.p).sort().forEach(function (s) { var e = m.p[s]; if (!e) return; var t = s + (Math.abs(e) === 2 ? "²" : Math.abs(e) === 3 ? "³" : ""); (e > 0 ? num : den).push(t); });
    var head = (m.c || "") + num.join(""); if (!head) head = "1";
    return den.length ? head + "/" + den.join("") : head;
  }
  function randMono(D, r, want) {
    var ss = Object.keys(D.syms);
    for (var t = 0; t < 400; t++) {
      var m = { c: pick(r, ["", "", "2", "3", "½", "π"]), p: {} };
      ss.forEach(function (s) { var e = ri(r, -2, 3); if (r() < 0.45) e = 0; if (e) m.p[s] = e; });
      if (!Object.keys(m.p).length) continue;
      var d = monoDim(D, m);
      if (d[0] === want[0] && d[1] === want[1]) return m;
    }
    return null;
  }
  function dimtestMake(level, r, o) {
    var decoy = !!o.decoy, form = o.form || pick(r, ["abstract", "real"]), D = DIMS[form], tg = pick(r, D.targets), nm = level;
    var NONE = "هیچ‌کدام از آزمونِ ابعاد رد نمی‌شود";
    for (var tries = 0; tries < 80; tries++) {
      var forms = [], bad = decoy ? -1 : ri(r, 0, 2), fail = false;
      for (var f = 0; f < 3 && !fail; f++) {
        var ms = [];
        for (var j = 0; j < nm; j++) { var m = null; for (var u = 0; u < 20 && !m; u++) { m = randMono(D, r, tg[1]); if (m && ms.some(function (x) { return monoTxt(x) === monoTxt(m) || JSON.stringify(x.p) === JSON.stringify(m.p); })) m = null; } if (!m) { fail = true; break; } ms.push(m); }
        if (fail) break;
        if (f === bad) {   // یک تک‌جمله را ناهم‌بُعد کن: توانِ یک نماد را یکی بالا یا پایین ببر
          var mi = ri(r, 0, ms.length - 1), s = pick(r, Object.keys(D.syms)), m2 = { c: ms[mi].c, p: {} };
          Object.keys(ms[mi].p).forEach(function (x) { m2.p[x] = ms[mi].p[x]; });
          m2.p[s] = (m2.p[s] || 0) + (r() < 0.5 ? 1 : -1); if (!m2.p[s]) delete m2.p[s];
          if (!Object.keys(m2.p).length) { fail = true; break; }
          var d2 = monoDim(D, m2); if (d2[0] === tg[1][0] && d2[1] === tg[1][1]) { fail = true; break; }
          ms[mi] = m2;
        }
        forms.push(ms);
      }
      if (fail || forms.length < 3) continue;
      var texts = forms.map(function (ms2) { return tg[2] + " = " + ms2.map(monoTxt).join(" + "); });
      if (new Set(texts).size < 3) continue;
      var ids = shuf(r, ["a", "b", "c", "d"]), it = { form: form, level: level, decoy: decoy, atype: "choice" };
      it.params = { form: form, target: tg[1], name: tg[0], forms: {}, none: ids[3] };
      it.choices = texts.map(function (t2, j2) { it.params.forms[ids[j2]] = forms[j2]; return { id: ids[j2], t: ltr(t2) }; }).concat([{ id: ids[3], t: NONE }]).sort(function (x, y) { return x.id < y.id ? -1 : 1; });
      it.answer = decoy ? ids[3] : ids[bad];
      it.prompt = D.intro + " کدام فرمول برای «" + tg[0] + "» (" + ltr(tg[2]) + ") از آزمونِ ابعاد رد می‌شود — یعنی دو سوی برابری یا جمله‌هایش هم‌بُعد نیستند؟ (ضریب‌های عددی مثلِ ½ و π بی‌بُعدند.)";
      it.explain = decoy ? "هر سه فرمول هم‌بُعدند؛ آزمونِ ابعاد هیچ‌کدام را رد نمی‌کند. این یعنی هیچ‌کدام خطای ابعادی ندارد، نه این‌که درست‌اند."
        : "در «" + ltr(texts[bad]) + "» دست‌کم یک جمله بُعدِ «" + tg[0] + "» را ندارد؛ جمع یا برابریِ کمیت‌های ناهم‌بُعد بی‌معناست.";
      it.deep = "پیش از پذیرفتنِ هر فرمول، بُعدِ هر جمله را بسنج؛ آزمونِ ابعاد خطا را می‌گیرد ولی درستی را ثابت نمی‌کند — بعد سراغِ حالت‌های حدی برو (Pólya 1945).";
      it.trap = decoy ? "این‌جا تله‌ای نیست؛ وسوسهٔ «حتماً یکی غلط است» خودش پیش‌داوری است." : "پذیرفتنِ فرمولی که شکلِ آشنا دارد، بی‌سنجیدنِ بُعدِ تک‌تکِ جمله‌ها.";
      return it;
    }
    throw new Error("dimtest: no problem");
  }

  /* ---------- (ک) حدس را بیازما (F4 ‹ پایش؛ حدس و آزمونش) ----------
     یک حدسِ صریح + چهار «آزمون و نتیجه». پاسخ با کد حساب می‌شود (اول بودن، شمارِ ناحیه‌ها، توان‌ها، طولِ ضلع‌ها). غیربدلی: حدس نادرست است و
     درست‌ترین آزمون یک حالتِ خاص، مثالِ نقض یا حالتِ حدیِ مشخص با نتیجهٔ محاسبه‌شده است. بدلی: حدس درست است و پاسخ «هیچ حالتِ آزموده ردش
     نکرد — پشتیبانی شد ولی هنوز برهان می‌خواهد». درس: حدس را نه بی‌آزمون بپذیر، نه بی‌آزمون کنار بگذار؛ آزمونِ ابطالی بجوی. */
  function isPrime(n) { if (n < 2) return false; for (var d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; }
  function chooseN(n, k) { if (k < 0 || k > n) return 0; var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
  function circleRegions(n) { return chooseN(n, 4) + chooseN(n, 2) + 1; }
  A.kCircleRegions = circleRegions;
  function guessMake(level, r, o) {
    var decoy = !!o.decoy, form = o.form || pick(r, ["numeric", "geometric"]);
    var tpl = form === "numeric" ? pick(r, ["poly", "pow"]) : pick(r, ["circle", "tri"]);
    var prompt, right, wrongs, explain, params = { tpl: tpl };
    if (tpl === "poly") {
      var Q = level === 1 ? [5, 11] : [11, 17, 41], q = pick(r, Q); params.q = q;
      var small = [0, 1, 2, 3].map(function (n) { return n * n + n + q; });
      if (!decoy) {
        prompt = "حدس: «برای هر عددِ صحیحِ n ≥ ۰، عددِ " + ltr("n² + n + " + q) + " اول است.» کدام آزمون و نتیجه درست است؟";
        right = "n = " + fa(q - 1) + ": مقدار " + fa(q * q) + " = " + fa(q) + " × " + fa(q) + " است — مثالِ نقض؛ حدس نادرست است";
        wrongs = ["n = ۰ تا ۳: مقدارها " + small.map(fa).join("، ") + " همه اول‌اند — پس حدس ثابت شد", "n = " + fa(q - 1) + ": مقدار عددی اول است — حدس تقویت شد", "هیچ حالتِ تکی نمی‌تواند حکمی کلی دربارهٔ همهٔ n را رد کند"];
        explain = "با n = " + fa(q - 1) + " هر سه جمله مضربِ " + fa(q) + " می‌شوند: " + ltr("(q−1)² + (q−1) + q = q²") + ". چند حالتِ درست اثبات نیست؛ یک مثالِ نقض بس است.";
        params.claim = "prime"; params.n = q - 1;
      } else {
        prompt = "حدس: «برای هر عددِ صحیحِ n ≥ ۰، عددِ " + ltr("n² + n + " + q) + " فرد است.» کدام آزمون و نتیجه درست است؟";
        right = "n = ۰ تا ۳ و n = " + fa(q - 1) + " همه فردند — هیچ مثالِ نقضی نیست؛ حدس پشتیبانی شد ولی هنوز برهان می‌خواهد";
        wrongs = ["n = " + fa(q - 1) + ": مقدار " + fa(q * q) + " اول نیست — پس حدس رد شد", "n = ۰ تا ۳ همه فردند — پس حدس ثابت شد", "هیچ حالتِ تکی دربارهٔ حکمِ کلی خبری نمی‌دهد؛ آزمودن بی‌فایده است"];
        explain = "برهان: n² + n = n(n + 1) حاصل‌ضربِ دو عددِ پیاپی و زوج است، پس با " + fa(q) + " ِ فرد، فرد می‌شود. «اول نبودن» مثالِ نقضِ «فرد بودن» نیست.";
        params.claim = "odd"; params.n = q - 1;
      }
    } else if (tpl === "pow") {
      var k = level === 1 ? 2 : pick(r, [2, 3]), th = k === 2 ? 5 : 10;   // از th به بعد 2ⁿ > nᵏ (وارسیِ مستقل در آزمون)
      var n0 = decoy ? th : ri(r, k === 2 ? 2 : 2, th - 1);
      params.k = k; params.n0 = n0;
      prompt = "حدس: «برای هر عددِ صحیحِ n ≥ " + fa(n0) + "، " + ltr("2ⁿ > n" + (k === 2 ? "²" : "³")) + ".» کدام آزمون و نتیجه درست است؟";
      if (!decoy) {
        var bad = -1; for (var n = n0; n < th; n++) if (Math.pow(2, n) <= Math.pow(n, k)) { bad = n; break; }
        params.n = bad;
        right = "n = " + fa(bad) + ": " + ltr("2^" + bad) + " = " + fa(Math.pow(2, bad)) + " و " + ltr(bad + "^" + k) + " = " + fa(Math.pow(bad, k)) + " — نابرابری برقرار نیست؛ حدس نادرست است";
        wrongs = ["n = " + fa(th + 2) + ": " + fa(Math.pow(2, th + 2)) + " > " + fa(Math.pow(th + 2, k)) + " — پس حدس ثابت شد", "n = " + fa(bad) + ": نابرابری برقرار است — حدس تقویت شد", "حالت‌های کوچک مهم نیستند؛ فقط رفتارِ n بزرگ معنا دارد"];
        explain = "کوچک‌ترین حالت‌های بازه را بیازما: در n = " + fa(bad) + " دو طرف " + fa(Math.pow(2, bad)) + " و " + fa(Math.pow(bad, k)) + " است. درستی برای nِ بزرگ، حکمِ «برای هر n ≥ " + fa(n0) + "» را نجات نمی‌دهد.";
      } else {
        params.n = th;
        right = "n = " + fa(th) + " (کوچک‌ترین حالت) و چند n ِ بعدی همه برقرارند — مثالِ نقضی نیست؛ پشتیبانی شد ولی هنوز برهان (مثلاً استقرا) می‌خواهد";
        wrongs = ["n = " + fa(th - 1) + ": نابرابری برقرار نیست — پس حدس رد شد", "n = " + fa(th) + " تا " + fa(th + 3) + " برقرارند — پس حدس ثابت شد", "با چند حالت هیچ چیزی دربارهٔ حدس نمی‌شود گفت"];
        explain = "n = " + fa(th - 1) + " بیرون از گسترهٔ حدس (n ≥ " + fa(th) + ") است، پس آن را رد نمی‌کند. آزمون‌های درون گستره حدس را جدی‌تر می‌کنند؛ برهان با استقرا: اگر 2ⁿ > nᵏ آن‌گاه 2ⁿ⁺¹ > 2nᵏ ≥ (n + 1)ᵏ برای این nها.";
      }
    } else if (tpl === "circle") {
      params.R = [1, 2, 3, 4, 5, 6, 7].map(circleRegions);
      prompt = "n نقطه روی یک دایره (هیچ سه وتری از یک نقطهٔ درونی نمی‌گذرند) و همهٔ وترها را می‌کشی. برای n = ۱ تا ۵ شمارِ ناحیه‌ها " + [1, 2, 3, 4, 5].map(function (n) { return fa(circleRegions(n)); }).join("، ") + " است.\n" +
        (decoy ? "حدس: «شمارِ ناحیه‌ها برای هر n بیشتر از " + ltr("2^(n−1)") + " نیست.»" : "حدس: «شمارِ ناحیه‌ها برای هر n برابرِ " + ltr("2^(n−1)") + " است.»") + " کدام آزمون و نتیجه درست است؟";
      if (!decoy) {
        right = "n = ۶ را بشمار (یا با " + ltr("C(n,4) + C(n,2) + 1") + "): " + fa(circleRegions(6)) + " ناحیه، نه " + fa(32) + " — حدس نادرست است";
        wrongs = ["n = ۱ تا ۵ همه با الگو می‌خوانند — پس حدس ثابت شد", "n = ۶ را بشمار: " + fa(32) + " ناحیه — حدس تقویت شد", "حالتِ n = ۱ حالتِ حدی است و درباره‌اش چیزی نمی‌گوید"];
        explain = "شمارشِ دقیق " + ltr("C(n,4) + C(n,2) + 1") + " برای n = ۶ می‌دهد " + fa(circleRegions(6)) + ". پنج حالتِ جور با الگو، حدس را ثابت نکرده بود.";
      } else {
        right = "n = ۶ و ۷: " + fa(circleRegions(6)) + " ≤ " + fa(32) + " و " + fa(circleRegions(7)) + " ≤ " + fa(64) + " — مثالِ نقضی نیست؛ پشتیبانی شد ولی برهان می‌خواهد";
        wrongs = ["n = ۶: " + fa(circleRegions(6)) + " ناحیه، نه " + fa(32) + " — پس حدس رد شد", "n = ۱ تا ۵ برابرِ " + ltr("2^(n−1)") + " اند — پس حدس ثابت شد", "شمارش برای n بزرگ ممکن نیست؛ پس حدس را نمی‌شود آزمود"];
        explain = "کمتر بودن مثالِ نقضِ «بیشتر نبودن» نیست. برهان: شمار = " + ltr("C(n−1,0) + … + C(n−1,4)") + " که بخشی از جمعِ همهٔ " + ltr("C(n−1,j) = 2^(n−1)") + " است.";
      }
    } else {
      var a = ri(r, 3, 9);   // مثلث با ضلع‌های a، a و تقریباً 2a — حالتِ حدی (تقریباً تخت)
      params.a = a;
      if (!decoy) {
        prompt = "حدس: «در هر مثلث، بلندترین ضلع از یک‌سومِ محیط کوتاه‌تر است.» کدام آزمون و نتیجه درست است؟";
        var c = 2 * a - 1, P = 2 * a + c; params.sides = [a, a, c];
        right = "حالتِ حدیِ تقریباً تخت: ضلع‌های " + fa(a) + "، " + fa(a) + "، " + fa(c) + " (محیط " + fa(P) + ") — بلندترین ضلع از یک‌سومِ محیط بلندتر است؛ حدس نادرست است";
        wrongs = ["مثلثِ متساوی‌الاضلاع با ضلعِ " + fa(a) + ": بلندترین ضلع از یک‌سومِ محیط کوتاه‌تر است — حدس تقویت شد", "چند مثلثِ معمولی را آزمودم و برقرار بود — پس حدس ثابت شد", "مثلثِ تقریباً تخت مثلث نیست؛ پس آزمونِ حدی معنا ندارد"];
        explain = "در " + fa(a) + "، " + fa(a) + "، " + fa(c) + " (که مثلث است چون " + fa(a + a) + " > " + fa(c) + ") بلندترین ضلع " + fa(c) + " و یک‌سومِ محیط " + fa(P) + "/۳ است. حتی متساوی‌الاضلاع هم «برابر» است نه «کوتاه‌تر». حالتِ حدی جایی است که حدس می‌شکند.";
      } else {
        prompt = "حدس: «در هر مثلث، بلندترین ضلع از نصفِ محیط کوتاه‌تر است.» کدام آزمون و نتیجه درست است؟";
        var c2 = 2 * a - 1, P2 = 2 * a + c2; params.sides = [a, a, c2];
        right = "حالتِ حدیِ تقریباً تخت: ضلع‌های " + fa(a) + "، " + fa(a) + "، " + fa(c2) + " — بلندترین ضلع هنوز از نصفِ محیط (" + fa(P2) + "/۲) کوتاه‌تر است؛ مثالِ نقضی نیست، ولی برهان (نابرابریِ مثلث) لازم است";
        wrongs = ["حالتِ حدیِ تقریباً تخت: بلندترین ضلع از نصفِ محیط بلندتر می‌شود — حدس رد شد", "مثلثِ متساوی‌الاضلاع برقرار است — پس حدس ثابت شد", "حالتِ حدی را نمی‌شود آزمود چون مثلث نیست"];
        explain = "بلندترین ضلع < مجموعِ دو ضلعِ دیگر ⇔ از نصفِ محیط کوتاه‌تر — همان نابرابریِ مثلث. آزمونِ حدی سخت‌ترین آزمون بود و حدس از آن گذشت؛ برهانش همین نابرابری است.";
      }
    }
    var texts = [right].concat(wrongs);
    if (new Set(texts).size < 4) throw new Error("guesstest: duplicate choices");
    var ids = shuf(r, ["a", "b", "c", "d"]), it = { form: form, level: level, decoy: decoy, atype: "choice", answer: ids[0], params: params };
    it.choices = texts.map(function (t, j) { return { id: ids[j], t: t }; }).sort(function (x, y) { return x.id < y.id ? -1 : 1; });
    it.prompt = prompt; it.explain = explain;
    it.deep = "حدس را صریح بگو و بیازمای: حالتِ خاصِ هوشمند، مثالِ نقض و حالتِ حدی. پذیرفتنِ حدس بی‌آزمون ابلهانه است و نادیده گرفتنش هم؛ حدسی که از آزمون گذشت جدی‌تر شد ولی هنوز برهان می‌خواهد (Pólya 1945، «حدس بزن ولی بیازما»).";
    it.trap = decoy ? "مثالِ نقضِ ظاهری که بیرون از گسترهٔ حدس است یا ویژگیِ دیگری را می‌سنجد؛ یا «ثابت شد» از روی چند حالت." : "پذیرفتنِ حدس از روی چند حالتِ جور (یا «تقویت» با محاسبهٔ نادرست)، به‌جای جست‌وجوی آزمونی که می‌تواند ردش کند.";
    return it;
  }

  /* ---------- (ل) شکلِ قانون از تحلیلِ ابعادی (F4) ----------
     کمیتِ خواسته به چند کمیتِ داده بستگی دارد؛ فقط یک ترکیبِ توانی هم‌بُعد است (پاسخ با حلِ دستگاهِ توان‌ها در کد). بدلی: یکی از کمیت‌ها
     بی‌بُعد است (زاویه)، پس تحلیلِ ابعادی وابستگی به آن را تعیین نمی‌کند — پاسخ «c·…·f(θ)». درس: ابعاد شکلِ قانون را حدس می‌زند، نه ضریب
     و نه وابستگی به کمیت‌های بی‌بُعد. ابعاد = [جرم، طول، زمان]. */
  var LAWS = [
    { tgt: ["T", "دورهٔ تناوبِ آونگ", [0, 0, 1]], vars: [["l", "طولِ نخ", [0, 1, 0]], ["g", "شتابِ گرانش", [0, 1, -2]], ["m", "جرمِ وزنه", [1, 0, 0]]] },
    { tgt: ["t", "زمانِ سقوطِ آزاد", [0, 0, 1]], vars: [["h", "ارتفاع", [0, 1, 0]], ["g", "شتابِ گرانش", [0, 1, -2]]] },
    { tgt: ["v", "سرعتِ رسیدن به زمین", [0, 1, -1]], vars: [["h", "ارتفاع", [0, 1, 0]], ["g", "شتابِ گرانش", [0, 1, -2]]] },
    { tgt: ["a", "شتابِ مرکزگرا", [0, 1, -2]], vars: [["v", "سرعت", [0, 1, -1]], ["r", "شعاعِ مسیر", [0, 1, 0]]] },
    { tgt: ["T", "دورهٔ تناوبِ وزنه و فنر", [0, 0, 1]], vars: [["m", "جرم", [1, 0, 0]], ["k", "سختیِ فنر (نیرو بر طول)", [1, 0, -2]]] }
  ];
  A.KLAWS = LAWS;
  var HALF = [-2, -1, -0.5, 0, 0.5, 1, 2];
  function dimOf(vars, ex) { var d = [0, 0, 0]; vars.forEach(function (v, i) { for (var j = 0; j < 3; j++) d[j] += ex[i] * v[2][j]; }); return d; }
  function sameDim(a, b) { return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]; }
  function allEx(n) { var out = [[]]; for (var i = 0; i < n; i++) { var nx = []; out.forEach(function (e) { HALF.forEach(function (x) { nx.push(e.concat([x])); }); }); out = nx; } return out; }
  function lawTxt(L, ex, extra) {
    var num = [], den = [], rn = [], rd = [];
    L.vars.forEach(function (v, i) {
      var e = ex[i]; if (!e) return; var a = Math.abs(e), s = v[0];
      if (a === 0.5) (e > 0 ? rn : rd).push(s); else (e > 0 ? num : den).push(s + (a === 2 ? "²" : ""));
    });
    var rTop = rn.length && rd.length ? "√(" + rn.join("") + "/" + rd.join("") + ")" : rn.length ? "√(" + rn.join("") + ")" : "", rBot = !rn.length && rd.length ? "√(" + rd.join("") + ")" : "";
    var top = num.join("") + rTop || "1", bot = den.join("") + rBot;
    return L.tgt[0] + " = c·" + (bot ? (top.length > 1 && /^[^√]/.test(top) && num.length + (rTop ? 1 : 0) > 1 ? "(" + top + ")" : top) + "/" + (den.length + (rBot ? 1 : 0) > 1 ? "(" + bot + ")" : bot) : top) + (extra || "");
  }
  A.klawTxt = lawTxt;
  function dimformMake(level, r, o) {
    var decoy = !!o.decoy, form = o.form || pick(r, ["mechanics", "everyday"]);
    var pool = level === 1 ? LAWS.slice(1, 4) : LAWS, L = pick(r, pool);
    var sols = allEx(L.vars.length).filter(function (ex) { return sameDim(dimOf(L.vars, ex), L.tgt[2]); });
    if (sols.length !== 1) throw new Error("dimform: law not unique");
    var good = sols[0], bads = shuf(r, allEx(L.vars.length).filter(function (ex) { return ex.some(Boolean) && !sameDim(dimOf(L.vars, ex), L.tgt[2]) && ex.every(function (x) { return Math.abs(x) <= 1; }); }));
    var cands = [good], texts = [lawTxt(L, good, decoy ? "·f(θ)" : "")];
    for (var i = 0; i < bads.length && cands.length < 4; i++) { var t = lawTxt(L, bads[i], ""); if (texts.indexOf(t) < 0) { cands.push(bads[i]); texts.push(t); } }
    if (decoy) texts[1] = lawTxt(L, good, "");   // همان شکل بی f(θ): ادعای بی‌پایه که زاویه اثری ندارد
    if (new Set(texts).size < 4) throw new Error("dimform: duplicate choices");
    var ids = shuf(r, ["a", "b", "c", "d"]), it = { form: form, level: level, decoy: decoy, atype: "choice", answer: ids[0] };
    it.params = { law: LAWS.indexOf(L), ex: {}, decoy: decoy };
    it.choices = texts.map(function (t2, j) { it.params.ex[ids[j]] = cands[j] || good; return { id: ids[j], t: ltr(t2) }; }).sort(function (x, y) { return x.id < y.id ? -1 : 1; });
    var names = L.vars.map(function (v) { return v[0] + " (" + v[1] + ")"; });
    it.prompt = (form === "everyday" ? "بی‌آن‌که فرمولی به یاد داشته باشی، " : "") + L.tgt[1] + " (" + ltr(L.tgt[0]) + ") فقط به " + names.join("، ") + (decoy ? " و زاویهٔ آغازِ حرکت θ (بی‌بُعد)" : "") +
      " بستگی دارد. با تحلیلِ ابعاد (جرم، طول، زمان) شکلِ قانون کدام است؟ (c عددی بی‌بُعد است.)";
    it.explain = decoy ? "توان‌ها را فقط ابعاد تعیین می‌کند؛ θ بی‌بُعد است و هر تابعی از آن هم‌بُعد می‌ماند، پس تحلیلِ ابعادی وابستگی به θ را تعیین نمی‌کند: " + lawTxt(L, good, "·f(θ)") + "."
      : "توانِ هر کمیت را با برابر کردنِ ابعادِ دو طرف بیاب؛ فقط " + lawTxt(L, good, "") + " هم‌بُعد است. ضریبِ c را ابعاد نمی‌دهد.";
    it.deep = "تحلیلِ ابعادی شکلِ قانون را حدس می‌زند (آونگ: T ∝ √(l/g)، و جرم بی‌اثر)؛ ضریب و وابستگی به کمیت‌های بی‌بُعد را نه. حدس است تا آزمایش یا استدلال تأییدش کند (Pólya 1945).";
    it.trap = decoy ? "پنداشتنِ این‌که ابعاد همه‌چیز را تعیین می‌کند و زاویه بی‌اثر است." : "نوشتنِ شکلِ آشنا یا افزودنِ کمیتی که ابعاد کنارش می‌گذارد (مثلاً جرم در دورهٔ آونگ).";
    return it;
  }

  A.KGEN = {
    jars: { fa: "کوزه‌های آب", src: "Luchins 1942", fams: ["F3"], forms: ["numeric", "real", "visual"], what: "اثرِ آمادگیِ ذهنی: پس از گرم‌کردن با یک فرمول، آیا راهِ کوتاه‌تر را می‌بینی؟ کدام راه را رفتی ثبت می‌شود.", make: jarsMake },
    rule246: { fa: "قاعدهٔ پنهانِ ۲-۴-۶", src: "Wason 1960؛ Klayman & Ha 1987", fams: ["F4", "F11"], forms: ["abstract", "real"], what: "کشفِ قاعده با آزمودن: پیش از اعلام باید آزمون بدهی؛ شمارِ آزمون‌های ابطالی ثبت می‌شود.", make: r246Make },
    wason: { fa: "گزینشِ واسون", src: "Wason 1966؛ Evans & Lynch 1973", fams: ["F4", "F11"], forms: ["abstract", "real", "verbal"], what: "وارسیِ «اگر… آن‌گاه…» با جست‌وجوی موردِ ناقض، نه موردِ تأییدکننده.", make: wasonMake },
    bayes: { fa: "نرخِ پایه", src: "Tversky & Kahneman 1982؛ Gigerenzer & Hoffrage 1995", fams: ["F11", "F4"], forms: ["real", "verbal", "abstract"], what: "به حساب آوردنِ رایج‌بودنِ یک حالت پیش از نتیجه گرفتن از یک نشانه.", make: bayesMake },
    wmchain: { fa: "زنجیرهٔ حافظهٔ کاری", src: "Cowan 2001؛ Sweller 1988", fams: ["F5"], forms: ["numeric", "real", "visual"], what: "بارِ حافظهٔ کاری و بیرون‌ریزی: چرک‌نویس در دسترس است؛ استفاده‌کردن یا نکردنت ثبت می‌شود.", make: wmMake },
    hidden24: { fa: "حساب با قیدِ خودساخته", src: "Kershaw & Ohlsson 2004", fams: ["F2", "F3"], forms: ["abstract", "verbal", "visual"], what: "پیدا کردنِ قیدی که در صورت نبود و خودت فرض کردی (این‌جا: «حاصلِ میانی صحیح باشد»).", make: h24Make },
    reread: { fa: "بازخوانیِ صورت (مرزها)", src: "Kintsch 1998 (مدلِ موقعیت)", fams: ["F2"], forms: ["numeric", "verbal", "real"], what: "جزئیِ کوچکی در صورت («هر دو سر»، «شامل»، «اولی همین حالا») پاسخ را عوض می‌کند؛ پاسخِ عددیِ دقیق، با نسخهٔ بدلی که در آن حسابِ ساده درست است.", make: rereadMake },
    notation: { fa: "نمادگذاری (نام‌گذاریِ خوب)", src: "Pólya 1945 (Notation)", fams: ["F2"], forms: ["abstract", "real"], mv: ["mv_equation"], what: "نامی بی‌ابهام و به‌یادماندنی که پیوندِ چیزهای مرتبط (رأس و ضلعِ روبه‌رو، اندیسِ هر قطار) را نشان دهد.", make: notationMake },
    eqtrans: { fa: "ترجمهٔ شرط به رابطه (جدولِ دوستونی)", src: "Pólya 1945 (Setting up equations)؛ Clement 1982", fams: ["F2"], forms: ["verbal", "real", "abstract"], mv: ["mv_equation"], what: "سطرِ «بیانِ کلامی ⇐ رابطه» را کامل کن و جهتِ رابطه را با یک عددِ ساده بیازما (خطای وارونه‌نویسی).", make: eqtransMake },
    dimtest: { fa: "آزمونِ ابعاد", src: "Pólya 1945 (Test by dimension)", fams: ["F4"], forms: ["abstract", "real"], mv: ["mv_dimcheck"], what: "کدام فرمول ناهم‌بُعد است؟ — و این‌که گذشتن از آزمون درستی را ثابت نمی‌کند.", make: dimtestMake },
    guesstest: { fa: "حدس را بیازما", src: "Pólya 1945 (Guess and test؛ Induction)", fams: ["F4"], forms: ["numeric", "geometric"], mv: ["mv_special"], what: "حدسی صریح؛ کدام حالتِ خاص، مثالِ نقض یا حالتِ حدی ردش می‌کند — یا اگر از همهٔ آزمون‌ها گذشت، هنوز برهان می‌خواهد.", make: guessMake },
    dimform: { fa: "شکلِ قانون از ابعاد", src: "Pólya 1945 (Test by dimension)؛ Rayleigh 1915", fams: ["F4"], forms: ["mechanics", "everyday"], mv: ["mv_dimcheck"], what: "پیش از فرمول، شکلِ قانون را با ابعاد حدس بزن (آونگ: T = c·√(l/g))؛ ضریب و وابستگی به کمیتِ بی‌بُعد را ابعاد نمی‌دهد.", make: dimformMake }
  };
  /* ساختِ تکرارپذیر از روی دانه؛ اگر نمونه‌ای نشت داشت، با ادامهٔ همان دنباله دوباره می‌سازد */
  A.kgenMake = function (key, seed, level, decoy, form) {
    var G = A.KGEN[key]; if (!G) throw new Error("سازندهٔ ناشناخته: " + key);
    var r = mulberry(seed), lv = Math.max(1, Math.min(3, level || 1));
    for (var i = 0; i < 30; i++) {
      var it = G.make(lv, r, { decoy: !!decoy, form: form });
      if (A.kleak(it)) continue;
      it.key = key; it.seed = seed; it.fams = G.fams.slice();
      it.check = (function (x) { return function (ans) { return A.kcheck(x, ans); }; })(it);
      return it;
    }
    throw new Error("نمونهٔ بی‌نشت ساخته نشد (" + key + ")");
  };
  A.kgenFor = function (fam) { return Object.keys(A.KGEN).filter(function (k) { return A.KGEN[k].fams.indexOf(fam) >= 0; }); };
  /* گرهِ نمونه‌محوری که برای خانوادهٔ اصلی‌اش سازندهٔ کدی نیست (امروز: F1 «دانش و مفهوم» — ساختارش به محتوای خودِ کاربر وابسته است):
     صادقانه بگو که «ورزیده‌شده» فقط با نمونه‌های پاسخ‌دقیقِ وارسی‌شدهٔ هوش مصنوعی یا ساختهٔ خودِ کاربر (عددی/گزینه‌ای) ممکن است. */
  A.kcodeGap = function (k) {
    if (!(A.showSamples && A.showSamples())) return null;   // سازنده‌های کد «نمونهٔ آمادهٔ سازنده»اند و پنهان (۲۰۲۶-۱۰-۱۳)
    var f = k && (Array.isArray(k.fam) ? k.fam[0] : k.fam);
    if (!f || (A.kmode && A.kmode(k) !== "items") || A.kgenFor(f).length) return null;
    return "برای خانوادهٔ «" + (A.kfamName ? A.kfamName(f) : f) + "» سازندهٔ برنامه‌وار (پاسخِ محاسبه‌شده با کد) نداریم. برای رسیدن به «ورزیده‌شده» دست‌کم ۳ شکلِ متفاوت از نمونه‌های پاسخ‌دقیق لازم است: ساختهٔ هوش مصنوعی که از سه حلِ مستقل گذشته (وارسی‌شده)، یا ساختهٔ خودت با پاسخِ عددی یا گزینه‌ای. نمونه‌های «وارسی‌نشده» و خودسنجی‌ها به معیار نمی‌روند.";
  };

  /* ================= ۳) داده، معیار و وضعیت (به S نیاز دارد، نه به DOM) ================= */
  if (!A.S) return;
  var S = A.S;
  var EXP_FAMS = ["F6", "F7", "F8", "F9", "F10", "F12"];
  A.KEXP_FAMS = EXP_FAMS;
  A.KSTATUS = { open: "باز", working: "در حالِ باز شدن", practised: "ورزیده‌شده", returned: "بازگشته" };
  var FAM_FA = { F1: "دانش و مفهوم", F2: "بازنماییِ مسئله", F3: "راهبرد و گیرکردن", F4: "پایش و فراشناخت", F5: "ظرفیت و حالتِ ذهنی", F6: "عادت و خودکاری", F7: "هیجان و انگیزه", F8: "اجتماعی و ارتباطی", F9: "باور دربارهٔ خود و اسناد", F10: "موقعیت و ساختار", F11: "برداشت و نتیجه‌گیری", F12: "تصمیم و خودتنظیمی" };
  function famOf(k) { var f = k && k.fam; return Array.isArray(f) ? f[0] : f; }
  function famsOf(k) { var f = k && k.fam; return Array.isArray(f) ? f : f ? [f] : []; }
  A.kfamName = function (id) { var kf = (A.KF || []).filter(function (f) { return f.id === id; })[0]; return (kf && kf.fa) || FAM_FA[id] || id || "—"; };
  A.kmode = function (k) { return EXP_FAMS.indexOf(famOf(k)) >= 0 ? "exp" : "items"; };
  function txt(v) { return Array.isArray(v) ? v.filter(Boolean).join("؛ ") : v == null ? "" : typeof v === "object" ? Object.keys(v).map(function (x) { return v[x]; }).filter(function (x) { return typeof x === "string"; }).join("؛ ") : String(v); }
  function nowISO() { return new Date().toISOString(); }
  A.kitemsOf = function (knotId) { return S.all("kitem", function (r) { return r.knot === knotId; }).sort(function (a, b) { return (a.created || "").localeCompare(b.created || ""); }); };
  A.kexpsOf = function (knotId) { return S.all("kexp", function (r) { return r.knot === knotId; }).sort(function (a, b) { return (a.created || "").localeCompare(b.created || ""); }); };
  function kset() { var st = S.settings(); var k = st.knots || {}; var n = k.notify || {}; return { notify: { telegram: n.telegram !== false, email: n.email !== false, detail: !!n.detail, detailTg: n.detailTg !== false, detailEm: n.detailEm !== false, hour: n.hour == null ? 9 : +n.hour }, showUnverified: !!k.showUnverified, tz: k.tz || "" }; }
  A.kset = kset;
  /* نمونه به معیار می‌رود؟ کد = بله؛ هوش مصنوعی = فقط وارسی‌شده؛ کاربر = فقط پاسخِ دقیق (عدد/گزینه)؛ روبریک/متنِ آزاد = هرگز */
  A.kcountable = function (it) {
    if (!it || it.bad) return false;
    var by = (it.gen && it.gen.by) || "";
    if (/^code:/.test(by)) return true;
    if (it.atype !== "int" && it.atype !== "choice") return false;
    if (by === "ai") return !!(it.ver && it.ver.ok);
    return by === "user";
  };
  A.kservable = function (it) {
    if (!it || it.bad) return false;
    if (it.gen && it.gen.by === "ai" && !(it.ver && it.ver.ok)) return kset().showUnverified && !it.ver.leak;
    return true;
  };
  function casesOf(k) {
    var cs = [];
    try { if (A.knotCases) cs = A.knotCases(k.id) || []; } catch (e) { cs = []; }
    if (!cs.length) cs = (k.cases || []).map(function (id) { return typeof id === "object" ? id : S.get(id); }).filter(Boolean);
    return cs;
  }
  function expComplete(x) { return x && x.status === "done" && x.doneAt && (x.predict || "").trim() && (x.observe || "").trim() && x.outcome && (x.reflect || "").trim(); }

  /* معیارِ «ورزیده‌شده» (§۱۲.۶) — تابعِ خالص؛ چیزی نمی‌نویسد */
  A.kmastery = function (k) {
    var why = [], mode = A.kmode(k), status = k.status || "open", since = k.returnedAt || "";
    function ck(ok, t) { why.push({ ok: !!ok, t: t }); return !!ok; }
    // بازگشت: موقعیتِ تازه‌ای پس از ورزیده‌شدن به این گره پیوند خورده
    if (status === "practised" && k.solvedAt) {
      var newer = casesOf(k).filter(function (c) { return (c.created || c.at || "") > k.solvedAt; });
      if (newer.length) {
        return { status: "returned", mode: mode, returnedAt: newer.map(function (c) { return c.created || c.at; }).sort()[0], why: [{ ok: false, t: "موقعیتِ تازه‌ای پس از ورزیده‌شدن ثبت و به این گره پیوند خورده — آزمونِ واقعی همین است؛ ورزش دوباره از همین‌جا حساب می‌شود." }], crit: {} };
      }
    }
    var met, crit = {};
    if (mode === "exp") {
      var exps = S.all("kexp", function (x) { return x.knot === k.id; }), done = exps.filter(function (x) { return expComplete(x) && x.doneAt > since; })
        .sort(function (a, b) { return a.doneAt.localeCompare(b.doneAt); });
      var spanE = done.length >= 2 ? A.daysBetween(done[0].doneAt.slice(0, 10), done[done.length - 1].doneAt.slice(0, 10)) : 0;
      crit = { exps: done.length, span: spanE, planned: exps.length };
      met = ck(done.length >= 3, "دست‌کم ۳ آزمایشِ واقعیِ کامل (پیش‌بینی، مشاهده، نتیجه و درس) — اکنون " + fa(done.length)) &
        ck(spanE >= 14, "فاصلهٔ اولین تا آخرین آزمایش دست‌کم ۱۴ روز (دو هفته) — اکنون " + fa(spanE) + " روز");
      ck(true, "خودسنجی‌های روبریک ثبت می‌شوند ولی به معیار نمی‌روند (پاسخِ یکتا ندارند).");
      var anyAct = exps.length > 0 || (k.log || []).length > 0;
      met = !!met;
      if (!met && status === "practised") return lapsed(why, mode, crit);
      return { status: met ? "practised" : (status === "returned" ? "returned" : (anyAct || status === "working") ? "working" : "open"), mode: mode, why: why, crit: crit };
    }
    var items = {}; A.kitemsOf(k.id).forEach(function (it) { items[it.id] = it; });
    var log = (k.log || []).filter(function (e) { return e.at > since && e.el && !(items[e.itemId] && items[e.itemId].bad) && e.ok != null; });
    var streak = [];
    for (var i = log.length - 1; i >= 0; i--) { if (!log[i].ok) break; streak.unshift(log[i]); }
    var nd = streak.filter(function (e) { return !e.decoy; }), forms = {}, sess = {}, days = streak.map(function (e) { return e.d; }).sort();
    nd.forEach(function (e) { forms[e.form] = 1; }); streak.forEach(function (e) { sess[e.sess] = 1; });
    var span = days.length ? A.daysBetween(days[0], days[days.length - 1]) : 0;
    var dOk = streak.filter(function (e) { return e.decoy && e.conf >= 70; }).length;
    crit = { streak: streak.length, nonDecoy: nd.length, forms: Object.keys(forms).length, sessions: Object.keys(sess).length, span: span, decoys: dOk, logN: log.length };
    met = [ck(nd.length >= 3, "دست‌کم ۳ پاسخِ درستِ پیاپی (بی هیچ پاسخِ نادرست در میانه) — رشتهٔ فعلی: " + fa(nd.length)),
      ck(crit.forms >= 3, "روی دست‌کم ۳ شکلِ متفاوت (عددی، تصویری، کلامی، زندگیِ واقعی، انتزاعی) — اکنون " + fa(crit.forms)),
      ck(crit.sessions >= 2 && span >= 3, "در دست‌کم ۲ نوبتِ جدا با فاصلهٔ ≥ ۳ روز — اکنون " + fa(crit.sessions) + " نوبت، فاصلهٔ " + fa(span) + " روز"),
      ck(dOk >= 2, "دست‌کم ۲ نمونهٔ بدلیِ درست با اطمینانِ ≥ ۷۰٪ (در همین رشته) — اکنون " + fa(dOk))].every(Boolean);
    ck(true, "فقط نمونه‌های پاسخ‌دقیق حساب می‌شوند: ساختهٔ کد، هوش مصنوعیِ وارسی‌شده، یا ساختهٔ خودت با پاسخِ عددی/گزینه‌ای؛ «نمونهٔ معیوب» و «وارسی‌نشده» بیرون‌اند.");
    var act = (k.log || []).length > 0;
    if (!met && status === "practised") return lapsed(why, mode, crit);
    return { status: met ? "practised" : (status === "returned" ? "returned" : (act || status === "working") ? "working" : "open"), mode: mode, why: why, crit: crit };
  };
  /* تصمیم (ممیزی ۲۰۲۶-۱۰-۱۲، Minor 6): پاسخِ نادرست پس از «ورزیده‌شده» وضعیت را بی‌صدا پایین نمی‌آورد. «ورزیده‌شده» می‌ماند و
     یک یادداشتِ روشن نشان داده می‌شود؛ وضعیت فقط با «بازگشته» (پیوندِ یک موقعیتِ واقعیِ تازه) عوض می‌شود — §۱۲.۶: «آزمونِ واقعی،
     موقعیتِ واقعیِ بعدی است». رشتهٔ پاسخ‌ها و موعدِ نمونه‌ها مثلِ همیشه با پاسخِ نادرست از نو حساب می‌شود (فردا دوباره). */
  A.KLAPSE = "یک پاسخِ نادرست پس از ورزیدگی — مرورِ بیشتر پیشنهاد می‌شود.";
  function lapsed(why, mode, crit) {
    why.unshift({ ok: false, t: A.KLAPSE + " (وضعیت «ورزیده‌شده» می‌ماند؛ فقط موقعیتِ واقعیِ تازه آن را «بازگشته» می‌کند.)" });
    return { status: "practised", lapse: true, mode: mode, why: why, crit: crit };
  }

  /* وضعیت را با معیار هم‌گام می‌کند؛ فقط وقتی واقعاً عوض شود می‌نویسد */
  /* یک نویسندهٔ وضعیت (ممیزی ۲۰۲۶-۱۰-۱۲): A.knotSetStatus ِ a18 تاریخچه (hist)، solvedAt/returnedAt، ذخیره و یادآور را یک‌جا انجام
     می‌دهد. shist ِ قدیمی فقط خوانده می‌شود (نمودارِ روندِ a18 هر دو را می‌خواند)؛ این فایل دیگر در آن نمی‌نویسد. اگر a18 نباشد (آزمونِ
     تکی)، همین کار با همان فیلدها این‌جا انجام می‌شود. */
  function setStatus(k, st, at, noRemind) {
    if (typeof A.knotSetStatus === "function") return A.knotSetStatus(k, st, { at: at, noRemind: !!noRemind });
    if (!k || k.status === st) return false;
    var from = k.status || "open", when = at || nowISO();
    (k.hist = Array.isArray(k.hist) ? k.hist : []).push({ at: when, status: st, from: from });
    k.status = st; if (st === "practised") k.solvedAt = when; if (st === "returned") k.returnedAt = when;
    S.put(k); if (!noRemind) A.kremindSync(k); return true;
  }
  A.kstatusSync = function (k, noRemind) {
    if (!k) return k;
    var m = A.kmastery(k), was = k.status || "open";
    if (m.status === was) return k;
    setStatus(k, m.status, m.status === "returned" ? (m.returnedAt || nowISO()) : nowISO(), noRemind);
    return k;
  };
  /* برای a16: وقتی موقعیتِ تازه‌ای به گره پیوند می‌خورد */
  A.knotReturned = function (knotId, at) {
    var k = S.get(knotId); if (!k || k.status !== "practised") return false;
    return setStatus(k, "returned", at || nowISO(), false);
  };
  A.knotDeleted = function (knotId) { unremind(knotId); };

  function pushLog(k, e) {
    k.log = k.log || []; k.log.push(e);
    if (k.log.length > 200) {
      var old = k.log.splice(0, k.log.length - 200), s = k.logOld || { n: 0, ok: 0, decoys: 0, decoyOk: 0, from: old[0].d, to: old[0].d };
      old.forEach(function (x) { s.n++; if (x.ok) s.ok++; if (x.decoy) { s.decoys++; if (x.ok) s.decoyOk++; } if (x.d < s.from) s.from = x.d; if (x.d > s.to) s.to = x.d; });
      k.logOld = s;
    }
  }
  function nextIv(iv, ok) { if (!ok) return 1; for (var i = 0; i < LADDER.length; i++) if (LADDER[i] > (iv || 0)) return LADDER[i]; return LADDER[LADDER.length - 1]; }
  A.knextIv = nextIv;
  /* ثبتِ یک پاسخ: کارتِ نمونه (تاریخچه + موعد) و گره (دفتر + وضعیت) */
  A.krecord = function (it, res) {
    var k = S.get(it.knot), d = A.today(), at = nowISO();
    var ok = res.ok, el = A.kcountable(it) && ok != null && !res.self;
    var h0 = { at: at, d: d, conf: res.conf, ok: ok, ans: res.ans, saw: res.saw, sess: res.sess };
    if (res.path) h0.path = res.path; if (res.probe) h0.probe = res.probe; if (res.pad != null) h0.pad = res.pad; if (res.self) h0.self = res.self;
    (it.hist = it.hist || []).push(h0); if (it.hist.length > 50) it.hist = it.hist.slice(-50);
    it.iv = nextIv(it.iv, ok !== false); it.due = A.addDays(d, it.iv);
    S.put(it);
    if (k) {
      pushLog(k, { at: at, d: d, itemId: it.id, conf: res.conf, ok: ok, decoy: !!it.decoy, form: it.form, el: el, sess: res.sess, saw: res.saw });
      S.put(k);
      A.kstatusSync(k, true);
      remindSoon(k.id);
    }
    return h0;
  };
  A.kpracticeDue = function () {
    var t = A.today(), ks = {}; S.all("knot").forEach(function (k) { ks[k.id] = k; });
    return S.all("kitem", function (it) { return ks[it.knot] && A.kservable(it) && (it.due || t) <= t; })
      .sort(function (a, b) { return (a.due || "").localeCompare(b.due || ""); })
      .map(function (it) { return { knot: ks[it.knot], item: it }; });
  };
  /* آزمایش‌های واقعیِ موعد (ممیزی ۲۰۲۶-۱۰-۱۳): برای گره‌های رفتاری/اجتماعی تنها «ورزش» همین‌اند، ولی نه در «امروز» دیده می‌شدند نه در
     فهرستِ ورزش — در حالی که یادآور همان روز «یک ورزشِ گره موعد است» می‌فرستاد */
  A.kexpDue = function () {
    var t = A.today(), ks = {}; S.all("knot").forEach(function (k) { ks[k.id] = k; });
    return S.all("kexp", function (x) { return ks[x.knot] && x.status === "planned" && x.due && x.due <= t; }).map(function (x) { return { knot: ks[x.knot], exp: x }; });
  };
  A.knotNext = function (k) {
    var ds = A.kitemsOf(k.id).filter(A.kservable).map(function (it) { return it.due || A.today(); });
    A.kexpsOf(k.id).forEach(function (x) { if (x.status === "planned" && x.due) ds.push(x.due); });
    ds.sort(); return ds[0] || null;
  };
  A.kcalibPoints = function () {
    var pts = []; S.all("knot").forEach(function (k) { (k.log || []).forEach(function (e) { if (e.conf != null && e.ok != null) pts.push({ p: e.conf / 100, o: e.ok ? 1 : 0, knot: k.id }); }); });
    return pts;
  };

  /* ---------- یادآورها (§۷، §۱۲.۸–۹) ---------- */
  function tz() { var s = kset(); if (s.tz) return s.tz; try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dubai"; } catch (e) { return "Asia/Dubai"; } }
  function hostRemind() { return A.HOST && typeof A.HOST.remind === "function"; }
  function unremind(id) { if (typeof SENT !== "undefined") delete SENT[id]; if (A.HOST && typeof A.HOST.unremind === "function") { try { var p = A.HOST.unremind("knot:" + id); if (p && p.catch) p.catch(function () { }); } catch (e) { } } trackKey(id, null); }
  function trackKey(id, due) {
    var st = S.settings(); st.knots = st.knots || {}; var rk = st.knots.rk || {};
    if ((rk[id] || null) === (due || null)) return;
    if (due) rk[id] = due; else delete rk[id];
    st.knots.rk = rk; S.saveSettings(st);
  }
  A.KREMIND_BODY = "یک ورزشِ گره موعد است";
  /* §۱۲.۱۰ «هیچ محتوای F7/F9 در یادآورها»: اگر F7 یا F9 در خانوادهٔ اصلی، در خانواده‌های کمکیِ گره، یا در ریشهٔ (اصلی/کمکیِ) هر موقعیتِ
     پیوندخورده باشد، جزئیات هرگز فرستاده نمی‌شود (ممیزی ۲۰۲۶-۱۰-۱۲: پیش‌تر فقط خانوادهٔ اصلی دیده می‌شد). */
  var PRIV_FAMS = ["F7", "F9"];
  A.kprivateKnot = function (k) {
    var fs = famsOf(k).concat((k && k.extra || []).map(function (x) { return x && (x.fam || x); }));
    casesOf(k || {}).forEach(function (c) { var R = (c && c.root) || {}; fs.push(R.primary); (R.extra || []).forEach(function (x) { fs.push(x && (x.fam || x)); }); });
    return fs.some(function (f) { return PRIV_FAMS.indexOf(f) >= 0; });
  };
  /* پیام: پیش‌فرض خنثی؛ «جزئیات» فقط با روشن‌کردنِ جداگانه، و هرگز برای F7/F9 (§۱۲.۱۰)؛ پاسخ هرگز در پیام نمی‌آید */
  A.kremindPayload = function (k) {
    var s = kset(), next = A.knotNext(k); if (!next) return null;
    if (next < A.today()) next = A.today();
    /* پیوند: §۷ ِ طرح «?tab=knot&a=» را نام می‌برد؛ عمداً مستقیم به صفحهٔ ورزشِ همان گره می‌رود (یک کلیک کمتر، و یادآور دربارهٔ ورزش است).
       صفحهٔ گره هم دکمهٔ «ورزش» دارد؛ هر دو مسیر به همین‌جا می‌رسند. */
    var p = { key: "knot:" + k.id, due_date: next, tz: tz(), title: "گره‌گشا — ورزشِ موعد", body: A.KREMIND_BODY, link: "?tab=kpractice&a=" + k.id, detail: null,
      channels: { telegram: s.notify.telegram, email: s.notify.email }, hour: s.notify.hour };
    if (s.notify.detail && !A.kprivateKnot(k)) {
      var items = A.kitemsOf(k.id).filter(function (it) { return A.kservable(it) && it.atype !== "rubric" && !A.kleak(it); });
      var fresh = items.filter(function (it) { return !(it.hist || []).length; })[0] || items[0];
      /* جزئیات برای هر کانال جدا (مالک ۲۰۲۶-۱۰-۱۳): مثلاً در تلگرام آری، در ایمیل نه. هیچ کانالی ⇒ بی جزئیات. */
      var dch = [];
      if (s.notify.telegram && s.notify.detailTg) dch.push("telegram");
      if (s.notify.email && s.notify.detailEm) dch.push("email");
      if (dch.length) {
        p.detail = "گره: «" + (k.name || "بی‌نام") + "»" + (fresh ? "\nنمونهٔ تازه (فقط صورت): " + String(fresh.prompt).slice(0, 400) : "");
        p.detail_channels = dch;
      }
    }
    return p;
  };
  A.kremindSync = function (k) {
    if (!k || !hostRemind()) return null;
    var s = kset();
    if (k.status === "practised" || (!s.notify.telegram && !s.notify.email)) { unremind(k.id); return null; }
    var p = A.kremindPayload(k);
    if (!p) { unremind(k.id); return null; }
    // همان یادآور (همان کلید، موعد و متن) دوباره فرستاده نمی‌شود (کارزارِ سوم v06: «knot:…» چند بار با همان کلید)
    var sig = JSON.stringify(p); if (SENT[k.id] === sig) return p; SENT[k.id] = sig;
    try { var pr = A.HOST.remind(p); if (pr && pr.catch) pr.catch(function (e) { A.toast && A.toast("یادآور ثبت نشد: " + ((e && e.message) || e), "bad"); }); } catch (e) { }
    trackKey(k.id, p.due_date);
    return p;
  };
  var remindT = {}, SENT = {};
  function remindSoon(id) { clearTimeout(remindT[id]); remindT[id] = setTimeout(function () { delete remindT[id]; var k = S.get(id); if (k) A.kremindSync(k); }, 1200); }
  /* گره‌های پاک‌شده: یادآورشان لغو می‌شود (اگر a16 خودش A.knotDeleted را صدا نزده باشد) */
  /* «امروز»: یک سطر برای آزمایش‌های واقعیِ موعد (a3 فقط نمونه‌ها را می‌شمارد) */
  if (typeof A.dueList === "function" && !A.dueList._kexp) {
    var rawDueX = A.dueList;   // نامِ جدا: «rawDue» پایین‌تر در همین فایل هم هست و var مشترک می‌شود ⇒ بازگشتِ بی‌پایان
    A.dueList = function () {
      var items = rawDueX.apply(this, arguments) || [], ed = [];
      try { ed = A.kexpDue(); } catch (e) { ed = []; }
      if (ed.length) items.push({ k: "knot", txt: fa(ed.length) + " آزمایشِ واقعیِ گره موعد است", sub: "پیش‌بینی ⇐ انجام ⇐ مشاهده ⇐ ثبت", go: function () { A.go("kpractice", ed[0].knot.id, "exp"); } });
      return items;
    };
    A.dueList._kexp = true;
  }
  A.kremindSweep = function () {
    var rk = ((S.settings().knots || {}).rk) || {};
    Object.keys(rk).forEach(function (id) { if (!S.get(id)) unremind(id); });
  };

  /* ================= ۴) نمونه‌سازی (کد، هوش مصنوعی، کاربر) ================= */
  function baseItem(knotId, o, gen) {
    var it = { id: A.uid("kitem"), type: "kitem", knot: knotId, form: o.form || "verbal", prompt: o.prompt || "", answer: o.answer == null ? "" : String(o.answer), atype: o.atype || "text",
      deep: o.deep || "", trap: o.trap || "", explain: o.explain || "", level: o.level || 1, decoy: !!o.decoy, gen: gen, ver: null, bad: false, due: A.today(), iv: 0, hist: [] };
    ["choices", "rubric", "multi", "params", "steps", "svg", "minProbes", "exact", "paths", "hints"].forEach(function (f) { if (o[f] != null) it[f] = o[f]; });
    return it;
  }
  /* از سازندهٔ کد: n نمونه با شکل‌های چرخشی + بدلی‌ها؛ دانه‌ها تصادفی ولی ذخیره‌شده (تکرارپذیر) */
  A.kmakeCode = function (knotId, key, n, nDecoy, level) {
    var G = A.KGEN[key], out = [], at = nowISO();
    for (var i = 0; i < n + nDecoy; i++) {
      var dec = i >= n, form = G.forms[i % G.forms.length], seed = (Math.random() * 4294967295) >>> 0;
      var it = A.kgenMake(key, seed, level || 1, dec, form);
      out.push(S.put(baseItem(knotId, it, { by: "code:" + key, at: at, seed: seed, lv: level || 1, form: form })));
    }
    var k = S.get(knotId); if (k) remindSoon(k.id);
    return out;
  };

  /* ---------- ایمنی (§۱۰، §۱۲.۱۰) ---------- */
  var HARM = ["خودکشی", "خودکُشی", "خودزنی", "کشتنِ خودم", "کشتن خودم", "خودم را بکشم", "خودمو بکشم", "خودم رو بکشم", "آسیب به خودم", "آسیب زدن به خودم", "به خودم آسیب", "رگم را", "رگمو", "نمی‌خواهم زنده باشم", "نمیخوام زنده باشم",
    "بمیرم", "کاش نبودم", "از بین ببرم", "صدمه به خودم", "به خودم صدمه", "suicide", "self-harm", "self harm", "kill myself", "end my life", "hurt myself"];
  /* یک نرمال‌ساز و یک فهرست برای همهٔ گره‌گشا: A.knotSafetyMatch/A.knotSafetyHit ِ a16 (ممیزی ۲۰۲۶-۱۰-۱۲: پیش‌تر a17 فهرستِ کوتاه‌ترِ
     خودش را داشت و «دلم می‌خواد بمیرم» یا «خودكشي» را نمی‌دید). فهرستِ محلی فقط وقتی a16 بار نشده (آزمونِ تکیِ Node) به کار می‌رود. */
  A.kSafetyLocal = function (text) {
    if (typeof A.knotSafetyMatch === "function") { var ws = A.knotSafetyMatch(text); return { hit: ws.length > 0, words: ws }; }
    var t = String(text || "").replace(/[‌]/g, " ").replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/[\u064B-\u0652]/g, "").replace(/\s+/g, " ").toLowerCase();
    var hit = HARM.filter(function (w) { return t.indexOf(w.replace(/[‌]/g, " ").toLowerCase()) >= 0; });
    return { hit: hit.length > 0, words: hit };
  };
  function safetyHit(text) {
    if (typeof A.knotSafetyHit === "function") { try { return !!A.knotSafetyHit(text); } catch (e) { } }
    return A.kSafetyLocal(text).hit;
  }
  A.KHELP = "اگر به آسیب‌زدن به خودت فکر می‌کنی، همین حالا با یک نفر حرف بزن. امارات: پلیس ۹۹۹، آمبولانس ۹۹۸، خطِ حمایتِ روانی ۸۰۰۴۶۷۳ (800HOPE). ایران: اورژانس ۱۱۵، اورژانسِ اجتماعی ۱۲۳، صدای مشاورِ بهزیستی ۱۴۸۰. این برنامه درمان نیست و جای متخصص را نمی‌گیرد.";

  /* ---------- هوش مصنوعی: ساختن و سه حلِ مستقل ---------- */
  var FORMS = { numeric: "عددی", visual: "تصویری/فضایی", verbal: "کلامی", real: "موقعیتِ واقعیِ زندگی/کار", abstract: "انتزاعی/نمادین" };
  A.KFORMS = FORMS;
  A.KGEN_SYS = "تو طراحِ نمونه‌های تمرینی برای «گره‌گشا» هستی. کاربر یک «گرهِ ذهنی» (الگوی خطای تکرارشونده) را تشخیص داده و می‌خواهد ساختارِ عمیقِ آن را در ظاهرهای تازه بازشناسد. قواعدِ سخت:\n" +
    "۱) خروجی فقط یک شیء JSON به شکلِ {\"items\":[…]}؛ هیچ متنی بیرون از JSON.\n" +
    "۲) هر نمونه: {\"form\":\"numeric|visual|verbal|real|abstract\",\"decoy\":false,\"level\":1,\"prompt\":\"…\",\"atype\":\"int|choice|rubric\",\"choices\":[{\"id\":\"a\",\"t\":\"…\"}],\"answer\":\"…\",\"rubric\":[\"…\"],\"hints\":[],\"deep\":\"…\",\"trap\":\"…\",\"explain\":\"…\"}.\n" +
    "۳) نمونهٔ پاسخ‌دار فقط atype=int (answer یک عددِ صحیح با رقمِ لاتین) یا atype=choice (۳ تا ۵ گزینه با شناسه‌های a تا e؛ answer = شناسهٔ تنها گزینهٔ درست). موقعیت‌های اجتماعی/رفتاری: atype=rubric و rubric = ۳ تا ۵ معیارِ مشاهده‌پذیر.\n" +
    "۴) هر نمونه دقیقاً یک پاسخِ قابلِ‌دفاع داشته باشد. پاسخ یا متنِ گزینهٔ درست نباید در prompt یا hints بیاید.\n" +
    "۵) ظاهرها متنوع و ساختار هم‌ریشه با گره؛ نمونهٔ «بدلی» (decoy=true) ظاهرش شبیه است ولی ساختارِ گره در آن نیست.\n" +
    "۶) visual: شکل را با کلمات دقیق توصیف کن؛ اختیاری: \"svg\":{\"shapes\":[{\"t\":\"rect\",\"x\":0,\"y\":0,\"w\":10,\"h\":10},{\"t\":\"circle\",\"cx\":0,\"cy\":0,\"r\":5},{\"t\":\"line\",\"x1\":0,\"y1\":0,\"x2\":5,\"y2\":5},{\"t\":\"text\",\"x\":0,\"y\":0,\"s\":\"…\"}]} در کادرِ ۲۰۰ در ۱۲۰.\n" +
    "۷) فارسیِ روشن با نیم‌فاصلهٔ درست؛ نامِ آدمِ واقعی نیاور؛ دربارهٔ حالِ درونیِ شخصِ سوم حکم نکن؛ هیچ ادعای بالینی یا درمانی.\n" +
    "۸) «مسئله(های) اصلیِ کاربر» که آمده، دانه است: هر نمونه (جز بدلی) باید همان ساختارِ عمیق و همان تلهٔ آن مسئله را داشته باشد، در ظاهر، زمینه و عددهای کاملاً تازه. نسخهٔ کمی‌تغییریافتهٔ خودِ آن مسئله نساز، پاسخش را تکرار نکن و از مسئله‌های معروفِ کتاب‌ها (مثلِ کوزه‌های آب یا کارت‌های واسون) به‌جای آن استفاده نکن.";
  var SOLVERS = [
    "تو حل‌کنندهٔ دقیقی هستی. مسئله را مستقل و گام‌به‌گام حل کن.",
    "تو منتقدِ بدبینی هستی: اول دنبالِ ابهام، دو پاسخِ قابلِ‌دفاع یا ایراد در صورت بگرد، سپس مسئله را حل کن.",
    "مسئله را از راهی متفاوت حل کن (مثلاً از آخر به اول، با شمردنِ موردها یا با جانشانیِ عدد) و پاسخت را یک بار وارسی کن."
  ];
  var SOLVE_TAIL = "\nخروجی فقط JSON: {\"answer\":\"…\",\"multi\":false,\"deep\":true,\"why\":\"…\"}. answer برای پرسشِ عددی یک عددِ صحیح با رقمِ لاتین و برای پرسشِ چندگزینه‌ای شناسهٔ گزینه است. multi=true یعنی بیش از یک پاسخ قابلِ‌دفاع است یا صورت مبهم است. deep=true یعنی ساختارِ عمیقِ گرهی که توصیف شده واقعاً در این مسئله هست (نه فقط ظاهرِ مشابه).";
  var RUBRIC_TAIL = "\nخروجی فقط JSON: {\"coherent\":true,\"observable\":true,\"deep\":true,\"multi\":false,\"why\":\"…\"}. coherent = موقعیت روشن و بی‌تناقض است؛ observable = معیارهای روبریک مشاهده‌پذیرند؛ deep = ساختارِ عمیقِ گره واقعاً در موقعیت هست.";
  A.KSOLVERS = SOLVERS;
  function knotCard(k, strip) {
    var L = ["نامِ گره: " + (k.name || ""), "خانواده: " + A.kfamName(famOf(k)) + (k.sub ? " · " + txt(k.sub) : ""), "ساختارِ عمیق: " + txt(k.principle || k.deep),
      "نشانه‌های تشخیص: " + txt(k.signals), "حرکتِ مقابل: " + txt(k.counter), "یک مثالِ خودِ کاربر: " + txt(k.example)];
    return strip(L.join("\n"));
  }
  /* حذفِ نام: همان تابعِ a16 (A.kRedact — فقط واژهٔ کامل، ي/ك یکی‌شده، نشانِ «[شخص]»)؛ پیش‌نمایشِ درِ هوش مصنوعی دقیقاً همین را نشان می‌دهد.
     اگر a16 نباشد (آزمونِ تکیِ Node)، یک جایگزینِ کم‌دقت‌تر ولی هم‌قاعده (مرزِ واژه) به کار می‌رود. */
  function stripper(names) {
    var ns = (Array.isArray(names) ? names : String(names || "").split(/[،,;؛\n]/)).map(function (x) { return String(x).trim(); }).filter(function (x) { return x.length >= 2; });
    if (typeof A.kRedact === "function") return function (s) { return A.kRedact(s, ns); };
    var W = "A-Za-z0-9\u0621-\u063A\u0640-\u0669\u066E-\u06D3\u06D5-\u06FF\u200C";
    return function (s) {
      var out = String(s || "").replace(/ي/g, "ی").replace(/ك/g, "ک");
      ns.slice().sort(function (a, b) { return b.length - a.length; }).forEach(function (n) {
        out = out.replace(new RegExp("(^|[^" + W + "])" + n.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?=$|[^" + W + "])", "g"), function (m, pre) { return pre + "[شخص]"; });
      });
      return out;
    };
  }
  A.kstripNames = function (s, names) { return stripper(names)(s); };
  /* متنِ دقیقِ درخواستِ سازنده (همان که در پیش‌نمایشِ در دیده می‌شود؛ حذفِ نام روی کلِ همین متن اعمال می‌شود) */
  /* مسئله(های) اصلیِ خودِ کاربر — دانهٔ نمونه‌ها (مالک، ۲۰۲۶-۱۰-۱۳: «نمونه‌های بیشتری … مربوط به همون گره»؛ تا پیش از این فقط
     کارتِ گره فرستاده می‌شد و هوش مصنوعی مسئلهٔ واقعیِ کاربر را نمی‌دید). دو موقعیتِ تازه‌ترِ پیوندخورده؛ برای گره‌های خصوصی
     (هیجان/باور دربارهٔ خود) فقط صورت، پاسخ و «کجا گیر کردم» — نه روایت و فکرها. متن پیش از ارسال در دروازه دیده و نام‌ها حذف می‌شوند. */
  A.kSeedCases = function (k) {
    var ids = A.kattachCases ? A.kattachCases(k) : (k.cases || []);
    return ids.map(function (id) { return S.get(id); }).filter(function (c) { return c && c.type === "kcase"; }).slice(0, 2);
  };
  function seedText(k) {
    var priv = A.kprivateKnot ? A.kprivateKnot(k) : false;
    var F = [["statement", "صورتِ مسئله"], ["answer", "پاسخِ درست"], ["answerHow", "از کجا معلوم است"], ["stuckAt", "کجا گیر کرد"]];
    if (!priv) F = F.concat([["what", "چه شد"], ["expected", "چه انتظار داشت"], ["actual", "در واقع چه شد"], ["thoughts", "چه فکرهایی کرد/چه کرد"]]);
    return A.kSeedCases(k).map(function (c, i) {
      var it = c.intake || {}, L = [];
      F.forEach(function (f) { var v = String(it[f[0]] || "").trim(); if (v) L.push(f[1] + ": " + v); });
      return L.length ? "مسئلهٔ اصلیِ " + fa(i + 1) + " (" + (c.title || "موقعیت") + "):\n" + L.join("\n") : "";
    }).filter(Boolean).join("\n\n");
  }
  A.kSeedText = seedText;
  A.kAsk = function (k, n) {
    var mode = A.kmode(k), forms = mode === "exp" ? ["real", "verbal", "real"] : ["numeric", "visual", "verbal", "real", "abstract"];
    n = n || 4;
    var seed = seedText(k);
    return "کارتِ گره:\n" + knotCard(k, function (x) { return x; }) + (seed ? "\n\n" + seed + "\n(نمونه‌ها از روی همین مسئله(ها) ساخته شوند: همان ساختار و تله، ظاهرِ تازه؛ نه کپیِ آن.)" : "") + "\n\nخواسته: " + fa(n) + " نمونهٔ تازه با این شکل‌ها: " + forms.slice(0, n).map(function (f) { return f + " (" + FORMS[f] + ")"; }).join("، ") +
      " + یک نمونهٔ بدلی (decoy=true). " + (mode === "exp" ? "این گره اجتماعی/رفتاری است: atype=rubric (معیارهای مشاهده‌پذیر) یا choice فقط اگر پاسخ واقعاً یکتاست." : "فقط atype=int یا choice.") +
      " سطحِ دشواری را از ۱ تا ۳ متنوع کن.";
  };
  function validAI(o) {
    if (!o || typeof o !== "object") return "شیء نیست";
    if (!o.prompt || typeof o.prompt !== "string") return "صورت ندارد";
    if (["int", "choice", "rubric"].indexOf(o.atype) < 0) return "نوعِ پاسخِ نامجاز (" + o.atype + ")";
    if (!FORMS[o.form]) return "شکلِ نامعتبر";
    if (o.atype === "int" && intOf(o.answer) == null) return "پاسخِ عددی صحیح نیست";
    if (o.atype === "choice") {
      if (!Array.isArray(o.choices) || o.choices.length < 2 || o.choices.length > 6) return "گزینه‌ها نامعتبرند";
      var ids = {}; for (var i = 0; i < o.choices.length; i++) { var c = o.choices[i]; if (!c || !c.id || !c.t || ids[c.id]) return "شناسهٔ گزینه تکراری یا خالی"; ids[c.id] = 1; }
      if (!ids[String(o.answer)]) return "پاسخ میانِ گزینه‌ها نیست";
    }
    if (o.atype === "rubric" && (!Array.isArray(o.rubric) || o.rubric.length < 2)) return "روبریک ندارد";
    return null;
  }
  function parseLoose(t) { if (A.parseJSONLoose) return A.parseJSONLoose(t); var s = String(t || ""), i = s.indexOf("{"), j = s.lastIndexOf("}"); return JSON.parse(s.slice(i, j + 1)); }
  function solverUser(k, it, strip) {
    var s = "ساختارِ عمیقِ گره (برای داوریِ «deep»): " + txt(k.principle || k.deep) + "\n\nمسئله:\n" + it.prompt;
    if (it.atype === "choice") s += "\n\nگزینه‌ها:\n" + it.choices.map(function (c) { return c.id + ") " + c.t; }).join("\n");
    if (it.atype === "rubric") s += "\n\nروبریک:\n" + it.rubric.map(function (x, i) { return (i + 1) + ". " + x; }).join("\n");
    return strip(s);
  }
  /* سه حلِ مستقل؛ پذیرش فقط اگر هر سه با پاسخِ سازنده یکی باشند، هیچ‌کدام «چندپاسخی» نگوید و داوریِ «ساختارِ گره» با بدلی‌بودن بخواند */
  A.kverify = function (k, it, strip) {
    strip = strip || function (x) { return x; };
    var passes = [], chain = Promise.resolve();
    SOLVERS.forEach(function (sys, i) {
      chain = chain.then(function () {
        return A.callAI(sys + (it.atype === "rubric" ? RUBRIC_TAIL : SOLVE_TAIL), solverUser(k, it, strip)).then(function (t) {
          var o; try { o = parseLoose(t); } catch (e) { o = null; }
          passes.push(o ? { i: i, answer: o.answer == null ? null : String(o.answer), multi: !!o.multi, deep: o.deep !== false && o.deep != null ? !!o.deep : false, coherent: !!o.coherent, observable: !!o.observable, why: String(o.why || "").slice(0, 300) } : { i: i, err: "JSON نبود" });
        }, function (e) { passes.push({ i: i, err: (e && e.message) || "خطا" }); });
      });
    });
    return chain.then(function () {
      var want = !it.decoy, agree = 0, multi = false, deepOk = true, errs = 0;
      passes.forEach(function (p) {
        if (p.err) { errs++; deepOk = false; return; }
        if (p.multi) multi = true;
        if (p.deep !== want) deepOk = false;
        if (it.atype === "rubric") { if (p.coherent && p.observable) agree++; }
        else if (it.atype === "int" ? intOf(p.answer) === intOf(it.answer) : String(p.answer || "").trim().toLowerCase() === String(it.answer).trim().toLowerCase()) agree++;
      });
      var ok = !errs && agree === 3 && !multi && deepOk;
      var reason = ok ? "" : errs ? "یک حل‌کننده پاسخِ معتبر نداد" : agree < 3 ? "حل‌کننده‌ها با پاسخِ سازنده هم‌نظر نبودند (" + fa(agree) + " از ۳)" : multi ? "دست‌کم یک حل‌کننده بیش از یک پاسخِ قابلِ‌دفاع دید" : (it.decoy ? "حل‌کننده‌ها ساختارِ گره را در این «بدلی» دیدند" : "حل‌کننده‌ها ساختارِ گره را در آن ندیدند");
      return { n: 3, agree: agree, multi: multi, deepOk: deepOk, ok: ok, why: reason, at: nowISO(), passes: passes };
    });
  };
  A.kaiAvailable = function () { if (A.HOST && A.HOST.ai) return true; if (S.mode === "gas") return true; return !!((S.settings().ai || {}).key); };
  /* ساخت با هوش مصنوعی ⇒ بررسیِ ساختار ⇒ نشت ⇒ سه حل ⇒ ذخیره (وارسی‌شده یا «وارسی‌نشده»)؛ نشت و ساختارِ نادرست ذخیره نمی‌شوند */
  A.kmakeAI = function (k, opts) {
    opts = opts || {};
    var strip = stripper(opts.names), mode = A.kmode(k);
    var n = opts.n || 4;
    var ask = strip(A.kAsk(k, n));
    var rep = { accepted: [], unverified: [], rejected: [] };
    /* تصویرِ پیوستِ موقعیت (اگر کاربر در دروازه پذیرفت) فقط به **سازنده** می‌رود؛ سه حلِ وارسی (A.kverify) فقط متنِ نمونه را می‌بینند */
    var fids = A.aiFileCap(opts.fileIds || [], "ساختِ نمونه‌های گره");
    var call = A.callAIJson ? A.callAIJson(A.KGEN_SYS, ask, { fileIds: fids, maxTokens: 8192 }, function (t) { try { return parseLoose(t); } catch (e) { throw new Error("پاسخِ سازنده JSON ِ معتبر نبود"); } })
      : A.callAI(A.KGEN_SYS, ask, { fileIds: fids, maxTokens: 8192 }).then(function (t) { try { return parseLoose(t); } catch (e) { throw new Error("پاسخِ سازنده JSON ِ معتبر نبود"); } });
    return call.then(function (o) {
      var arr = Array.isArray(o) ? o : (o && o.items) || [];
      if (!arr.length) throw new Error("سازنده نمونه‌ای نداد");
      var chain = Promise.resolve();
      arr.slice(0, n + 2).forEach(function (raw) {
        chain = chain.then(function () {
          var bad = validAI(raw); if (bad) { rep.rejected.push({ prompt: raw && raw.prompt, why: "ساختار: " + bad }); return; }
          var orig = A.kSeedCases(k).map(function (c) { return (c.intake || {}).statement || ""; }).filter(function (x) { return String(x).trim(); });
          if (orig.some(function (o) { return A.kNearCopy(raw.prompt, o); })) { rep.rejected.push({ prompt: raw.prompt, why: "تقریباً همان مسئلهٔ اصلیِ خودت است، نه نمونه‌ای تازه با همان ساختار" }); return; }
          if (mode !== "exp" && raw.atype === "rubric") { rep.rejected.push({ prompt: raw.prompt, why: "برای این گره فقط نمونهٔ پاسخ‌دار پذیرفته است" }); return; }
          var it = baseItem(k.id, { form: raw.form, prompt: String(raw.prompt), answer: raw.atype === "rubric" ? "" : String(raw.answer).trim(), atype: raw.atype, choices: raw.atype === "choice" ? raw.choices.map(function (c) { return { id: String(c.id), t: String(c.t) }; }) : null,
            rubric: raw.atype === "rubric" ? raw.rubric.map(String) : null, hints: Array.isArray(raw.hints) ? raw.hints.map(String) : null, deep: String(raw.deep || ""), trap: String(raw.trap || ""), explain: String(raw.explain || ""),
            level: Math.max(1, Math.min(3, +raw.level || 1)), decoy: !!raw.decoy, svg: raw.svg && raw.svg.shapes ? { shapes: raw.svg.shapes.slice(0, 40) } : null }, { by: "ai", at: nowISO(), names: !!(opts.names && opts.names.length) });
          var leak = it.atype === "rubric" ? null : A.kleak(it);
          if (leak) { rep.rejected.push({ prompt: it.prompt, why: "نشتِ پاسخ: " + leak }); return; }
          return A.kverify(k, it, strip).then(function (ver) {
            it.ver = ver;
            S.put(it);
            (ver.ok ? rep.accepted : rep.unverified).push(it);
          });
        });
      });
      return chain.then(function () { remindSoon(k.id); return rep; });
    });
  };
  /* نمونهٔ ساختهٔ خودِ کاربر (اثرِ تولید): فقط پاسخِ عددی/گزینه‌ای به معیار می‌رود */
  A.kmakeUser = function (k, o) {
    var it = baseItem(k.id, o, { by: "user", at: nowISO() });
    if (it.atype === "choice" && !(it.choices || []).some(function (c) { return c.id === it.answer; })) throw new Error("گزینهٔ درست را مشخص کن");
    if (it.atype === "int" && intOf(it.answer) == null) throw new Error("پاسخ باید عددِ صحیح باشد");
    var lk = it.atype === "rubric" || it.atype === "text" ? null : A.kleak(it);
    if (lk) throw new Error("پاسخ در صورت پیداست: " + lk);
    S.put(it); remindSoon(k.id); return it;
  };

  /* ================= ۵) نماها ================= */
  if (!A.h || !A.V) return;
  var h = A.h;
  function famChip(k) { return h("span", { class: "chip kp-fam" }, A.kfamName(famOf(k))); }
  function stChip(s) { s = s || "open"; return h("span", { class: "chip kp-st kp-st-" + s }, A.KSTATUS[s] || s); }
  function provChip(it) {
    var by = (it.gen && it.gen.by) || "";
    if (/^code:/.test(by)) return h("span", { class: "chip good", title: "پاسخ با کد محاسبه شده — درست به‌حکمِ ساخت" }, "ساختهٔ کد · " + ((A.KGEN[by.slice(5)] || {}).fa || by.slice(5)));
    if (by === "ai") return it.ver && it.ver.ok ? h("span", { class: "chip good", title: "سه حلِ مستقل با پاسخِ سازنده یکی بودند" }, "هوش مصنوعی · وارسی‌شده ۳ از ۳")
      : h("span", { class: "chip bad", title: (it.ver && it.ver.why) || "" }, "هوش مصنوعی · وارسی‌نشده");
    return h("span", { class: "chip" }, "ساختهٔ خودت");
  }
  function knotName(k) { return (k && k.name) || "گرهِ بی‌نام"; }
  function transferNote() {
    return h("details", { class: "card soft kp-note" }, h("summary", {}, h("strong", {}, "دربارهٔ انتقال — این ورزش‌ها چه می‌کنند و چه نمی‌کنند")),
      h("p", { class: "small" }, "تمرین روی سؤال‌های شبیهِ آزمونِ هوش، آشنایی با همان نوع سؤال را بالا می‌برد و نمرهٔ همان نوع آزمون را — نه توانِ ذهنیِ کلی را (te Nijenhuis et al. 2007؛ Sala & Gobet 2017). انتقال به موقعیت‌های دور نادر است (Barnett & Ceci 2002)."),
      h("p", { class: "small" }, "هدفِ این‌جا محدودتر و واقعی‌تر است: همان ساختار را در ظاهرهای تازه بشناسی و در نمونه‌های بدلی بی‌جا نبینی. «ورزیده‌شده» یعنی معیارِ تمرین برآورده شده، نه اینکه این الگو دیگر هیچ‌وقت پیش نمی‌آید؛ آزمونِ واقعی موقعیتِ واقعیِ بعدی است و اگر پیش آمد، گره «بازگشته» علامت می‌خورد."),
      h("p", { class: "small" }, "فاصله‌های ۱، ۳، ۷، ۲۱ و ۶۰ روز یک انتخابِ طراحی است، نه عددِ اثبات‌شده: Cepeda et al. 2008 نشان دادند فاصلهٔ بهتر به مدتی بستگی دارد که می‌خواهی چیزی به یاد بماند. پاسخِ نادرست ⇒ همان نمونه فردا دوباره."));
  }
  function masteryList(m) {
    return h("ul", { class: "kp-crit" }, m.why.map(function (w) { return h("li", { class: w.ok ? "ok" : "no" }, h("span", { "aria-hidden": "true" }, w.ok ? "✓ " : "○ "), w.t); }));
  }
  function focusMark() { setTimeout(function () { var el = document.querySelector("main [data-kfocus]"); if (el && el.focus) try { el.focus({ preventScroll: false }); } catch (e) { el.focus(); } }, 0); }

  /* ---------- رسمِ ساده و امن (کوزه‌ها یا شکل‌های مجازِ AI؛ متن فقط با textContent) ---------- */
  function drawSvg(spec) {
    var s = A.svg; if (!s || !spec) return null;
    var svg;
    if (spec.type === "jars") {
      var mx = Math.max.apply(null, spec.caps), W = 300, H = 150;
      svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "kp-svg", role: "img", "aria-label": "سه کوزه با ظرفیت‌های " + spec.caps.join("، ") });
      spec.caps.forEach(function (c, i) {
        var hh = Math.max(14, Math.round(110 * c / mx)), x = 30 + i * 90;
        svg.appendChild(s("rect", { x: x, y: 125 - hh, width: 50, height: hh, rx: 6, fill: "var(--accent-soft)", stroke: "var(--accent)", "stroke-width": 2 }));
        var t1 = s("text", { x: x + 25, y: 143, "text-anchor": "middle", "font-size": 12, fill: "currentColor" }); t1.textContent = JN[i] + " = " + fa(c); svg.appendChild(t1);
      });
      return svg;
    }
    if (spec.type === "cards" && Array.isArray(spec.nums)) {
      svg = s("svg", { viewBox: "0 0 300 130", class: "kp-svg", role: "img", "aria-label": "چهار کارت با عددهای " + spec.nums.map(fa).join("، ") });
      spec.nums.forEach(function (v, i) {
        var x = 18 + i * 70;
        svg.appendChild(s("rect", { x: x, y: 18, width: 54, height: 84, rx: 7, fill: "var(--accent-soft)", stroke: "var(--accent)", "stroke-width": 2 }));
        var tx = s("text", { x: x + 27, y: 68, "text-anchor": "middle", "font-size": 24, "font-weight": 700, fill: "currentColor" }); tx.textContent = fa(v); svg.appendChild(tx);
      });
      return svg;
    }
    if (!Array.isArray(spec.shapes)) return null;
    function n(v, lo, hi) { v = +v; return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : lo; }
    svg = s("svg", { viewBox: "0 0 200 120", class: "kp-svg", role: "img", "aria-label": "شکلِ نمونه" });
    spec.shapes.slice(0, 40).forEach(function (o) {
      if (!o) return;
      if (o.t === "rect") svg.appendChild(s("rect", { x: n(o.x, 0, 200), y: n(o.y, 0, 120), width: n(o.w, 0, 200), height: n(o.h, 0, 120), fill: "none", stroke: "currentColor" }));
      else if (o.t === "circle") svg.appendChild(s("circle", { cx: n(o.cx, 0, 200), cy: n(o.cy, 0, 120), r: n(o.r, 0, 100), fill: "none", stroke: "currentColor" }));
      else if (o.t === "line") svg.appendChild(s("line", { x1: n(o.x1, 0, 200), y1: n(o.y1, 0, 120), x2: n(o.x2, 0, 200), y2: n(o.y2, 0, 120), stroke: "currentColor" }));
      else if (o.t === "text") { var t = s("text", { x: n(o.x, 0, 200), y: n(o.y, 0, 120), "font-size": 9, fill: "currentColor" }); t.textContent = String(o.s || "").slice(0, 40); svg.appendChild(t); }
    });
    return svg;
  }

  /* ---------- دروازهٔ هوش مصنوعی: پیش از **هر** درخواست (ممیزی ۲۰۲۶-۱۰-۱۲، نه «یک بار در هر نشست») ----------
     همان جزءِ a16 (A.knotAIGate): بررسیِ ایمنی ⇐ اعلامِ ارائه‌دهندهٔ بیرونی + پیش‌نمایشِ دقیقِ متن + حذفِ نام ⇐ تأیید. a17 فقط تأیید و
     نام‌ها را می‌گیرد و خودش درخواست‌ها (سازنده + سه حل) را با همان حذفِ نام می‌فرستد. اگر a16 نباشد، کارتِ ساده‌ترِ همین‌جا با پیش‌نمایش. */
  A._kaiReset = function () { };  // (سازگاری با آزمون‌های قدیمی؛ دیگر حافظهٔ نشستی در کار نیست)
  /* موقعیت‌های این گره، تازه‌ترین اول — دروازه اولین‌شان را که عکس/PDF ِ پیوست دارد پیشنهاد می‌کند
     (پیش‌فرض روشن فقط اگر آن موقعیت «مسئله» است). فقط در میزبان؛ نسخهٔ مستقل پیوست ندارد. */
  A.kattachCases = function (k) {
    var ids = {}, out = [];
    (k.cases || []).forEach(function (id) { ids[id] = 1; });
    S.all("kcase", function (c) { return (c.knots || []).indexOf(k.id) >= 0; }).forEach(function (c) { ids[c.id] = 1; });
    Object.keys(ids).forEach(function (id) { var c = S.get(id); if (c && c.type === "kcase") out.push(c); });
    return out.sort(function (a, b) { return String(b.created || "").localeCompare(String(a.created || "")); }).map(function (c) { return c.id; });
  };
  function aiGate(box, k) {
    var text = A.kAsk(k);
    return new Promise(function (resolve, reject) {
      if (typeof A.knotAIGate === "function") {
        var sent = false;
        var acs = A.kattachCases(k);
        A.knotAIGate({ purpose: "ساختنِ نمونه‌های ورزش برای این گره", noPriv: true, attach: acs.length ? { recIds: acs } : null,
          more: "پس از ساخت، هر نمونه سه بار جداگانه و بی پاسخ برای حل فرستاده می‌شود (ساختارِ عمیقِ گره + متنِ همان نمونه، با همین حذفِ نام؛ تصویرِ پیوست به این سه حل نمی‌رود).",
          build: function () { return text; },
          onSend: function (t, meta) { sent = true; resolve({ names: (meta && meta.names) || [], fileIds: (meta && meta.fileIds) || [] }); },
          onDone: function () { if (!sent) reject(new Error("لغو شد")); } });
        return;
      }
      function notice() {
        var cb = h("input", { type: "checkbox", id: "kpStrip", checked: true }), ni = h("input", { type: "text", id: "kpNames", placeholder: "نام‌ها را با «،» جدا کن" });
        var pre = h("textarea", { id: "kpAiPre", rows: 6, readonly: true, class: "kn-pre" });
        function names() { return cb.checked ? ni.value.split(/[،,\n]/).map(function (x) { return x.trim(); }).filter(Boolean) : []; }
        function upd() { pre.value = stripper(names())(text); }
        cb.addEventListener("change", function () { ni.disabled = !cb.checked; upd(); }); ni.addEventListener("input", upd);
        var card = h("div", { class: "card kp-gate", role: "dialog", "aria-label": "اعلامِ ارسال به ارائه‌دهندهٔ بیرونی", dir: "rtl" },
          h("h3", {}, "این متن برای ارائه‌دهندهٔ بیرونی فرستاده می‌شود"),
          h("label", { class: "chk", for: "kpStrip" }, cb, "نام‌ها را پیش از ارسال حذف کن (فقط واژهٔ کامل)"), ni,
          h("label", { for: "kpAiPre", class: "small muted" }, "دقیقاً همین فرستاده می‌شود:"), pre,
          h("div", { class: "row gap wrap mt" }, h("button", { class: "btn", type: "button", "data-kfocus": "1", onclick: function () { var nm = names(); card.remove(); resolve({ names: nm }); } }, "فهمیدم؛ بفرست"),
            h("button", { class: "btn ghost", type: "button", onclick: function () { card.remove(); reject(new Error("لغو شد")); } }, "نفرست")));
        upd(); box.appendChild(card); focusMark();
      }
      if (safetyHit(text)) {
        var sc = h("div", { class: "card bad kp-gate", role: "alertdialog", dir: "rtl" }, h("h3", {}, "پیش از ادامه"), h("p", {}, A.KHELP),
          h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost", type: "button", "data-kfocus": "1", onclick: function () { sc.remove(); reject(new Error("متوقف شد")); } }, "فعلاً نه"),
            h("button", { class: "btn", type: "button", onclick: function () { sc.remove(); notice(); } }, "خوبم؛ ادامه می‌دهم")));
        box.appendChild(sc); focusMark();
      } else notice();
    });
  }
  A._kaiGate = aiGate;

  /* ---------- ساختنِ نمونه‌ها (زبانهٔ «نمونه‌ها») ---------- */
  var BUILDING = {};
  function genMark(id, g) { var kk = S.get(id); if (!kk) return; kk.genLast = g; S.put(kk); }
  A.kgenMark = genMark;
  function genPanel(k) {
    var box = h("div", { class: "col gap" }), mode = A.kmode(k), fams = famsOf(k);
    var keys = []; fams.forEach(function (f) { A.kgenFor(f).forEach(function (x) { if (keys.indexOf(x) < 0) keys.push(x); }); });
    /* سازنده‌های کد مسئله‌های آمادهٔ کتاب‌ها را می‌سازند، نه مسئلهٔ مالک را ⇒ فقط با «نمونه‌های آمادهٔ سازنده» (۲۰۲۶-۱۰-۱۳) و پایینِ صفحه */
    var samples = !!(A.showSamples && A.showSamples());
    var c1 = h("section", { class: "card kp-samples" }, h("h2", {}, "ساختِ برنامه‌وار — نمونهٔ آمادهٔ سازنده (مسئلهٔ تو نیست)"));
    if (!samples) c1 = null;
    else if (keys.length) {
      c1.appendChild(h("p", { class: "small" }, "پاسخِ این نمونه‌ها با کد محاسبه می‌شود، نه با حدس؛ هر نمونه با یک «دانه» ذخیره می‌شود و دوباره همان ساخته می‌شود. هر دسته: ۳ نمونه در شکل‌های مختلف + ۱ بدلی."));
      var lv = h("select", { id: "kpLv", "aria-label": "سطحِ دشواری" }, [1, 2, 3].map(function (l) { return h("option", { value: l }, "سطحِ " + fa(l)); }));
      c1.appendChild(h("div", { class: "row gap wrap" }, h("label", { for: "kpLv", class: "small" }, "دشواری:"), lv));
      keys.forEach(function (key) {
        var G = A.KGEN[key];
        c1.appendChild(h("div", { class: "kp-gen" }, h("div", {}, h("strong", {}, G.fa), " ", h("span", { class: "small muted" }, "(" + G.src + ")"), h("div", { class: "small" }, G.what),
          h("div", { class: "small muted" }, "شکل‌ها: " + G.forms.map(function (f) { return FORMS[f]; }).join("، "))),
          h("button", { class: "btn sm", type: "button", "data-gen": key, onclick: function () {
            try { var arr = A.kmakeCode(k.id, key, 3, 1, +lv.value); A.toast(fa(arr.length) + " نمونه ساخته شد."); A.render(); } catch (e) { A.toast(e.message, "bad"); }
          } }, "ساختِ ۴ نمونه")));
      });
    } else c1.appendChild(h("p", { class: "small" }, "برای خانوادهٔ «" + A.kfamName(famOf(k)) + "» سازندهٔ برنامه‌وار نداریم: ساختارِ این گره به محتوای خودت وابسته است. با هوش مصنوعی (وارسی‌شده) یا با قالبِ پایین خودت نمونه بساز." + (mode === "exp" ? " این گره رفتاری/اجتماعی است و اصلش «آزمایشِ واقعی» است (زبانهٔ «آزمایش‌ها»)." : "")));
    var gap0 = c1 && A.kcodeGap(k); if (gap0) c1.appendChild(h("p", { class: "small warnline kp-codegap" }, gap0));

    var c2 = h("section", { class: "card" }, h("h2", {}, "نمونه‌های تازه از روی مسئلهٔ خودت (هوش مصنوعی + سه حلِ مستقل)"));
    /* پیامِ دانه دقیقاً همان است که فرستاده می‌شود (ممیزی ۲۰۲۶-۱۰-۱۳: برای گره‌های خصوصی چیزی فرستاده نمی‌شد ولی پیام «دانه: ۱ موقعیت» می‌گفت) */
    var seedTxt = A.kSeedText(k), seedN = (seedTxt.match(/مسئلهٔ اصلیِ /g) || []).length, privK = A.kprivateKnot ? A.kprivateKnot(k) : false;
    c2.appendChild(h("p", { class: "small" + (seedN ? "" : " warnline") }, seedN ? "دانه: " + fa(seedN) + " موقعیتِ خودت که به این گره پیوند خورده — " + (privK ? "چون این گره هیجانی/باورِ دربارهٔ خود است، فقط صورت، پاسخ و «کجا گیر کردم» فرستاده می‌شود (نه روایت و فکرها)." : "صورت، پاسخ، کجا گیر کردی، و روایت و فکرهایت.") + " متنِ دقیق را پیش از ارسال می‌بینی. نمونه‌ای که تقریباً همان مسئلهٔ اصلی باشد کنار می‌رود." :
      privK ? "این گره هیجانی/باورِ دربارهٔ خود است؛ از موقعیت‌هایش فقط صورت/پاسخ/«کجا گیر کردم» فرستاده می‌شود و این‌ها خالی‌اند ⇒ نمونه‌ها فقط از کارتِ گره ساخته می‌شوند. برای این گره‌ها «آزمایشِ واقعی» اصل است." : "هنوز موقعیتی با صورت یا شرحِ ماجرا به این گره پیوند نخورده؛ نمونه‌ها فقط از کارتِ گره ساخته می‌شوند."));
    c2.appendChild(h("p", { class: "small" }, "سازنده فقط JSON ِ ساختاری با پاسخِ محدود (عددِ صحیح یا شناسهٔ گزینه" + (mode === "exp" ? "، یا روبریک برای موقعیت‌های اجتماعی" : "") + ") می‌دهد. سپس هر نمونه سه بار، با سه دستورِ متفاوت و بی‌دیدنِ پاسخ، حل می‌شود (درِ هوش مصنوعیِ این صفحه دما نمی‌گیرد؛ تفاوت از دستورهاست). فقط اگر هر سه با پاسخِ سازنده یکی باشند، هیچ‌کدام دو پاسخ نبینند و داوریِ «ساختارِ گره هست/نیست» با بدلی‌بودن بخواند، نمونه «وارسی‌شده» است. وگرنه با برچسبِ «وارسی‌نشده» نگه داشته و به‌طورِ پیش‌فرض پنهان می‌شود. نمونه‌ای که پاسخش در صورت پیداست اصلاً نگه داشته نمی‌شود."));
    var out = h("div", { class: "col gap", "aria-live": "polite" });
    if (!(k.principle || k.deep)) c2.appendChild(h("p", { class: "small bad" }, "اول «ساختارِ عمیق» ِ کارتِ گره را بنویس (قدمِ ۴)؛ بی آن نمونه‌سازی معنا ندارد."));
    else if (!A.kaiAvailable()) c2.appendChild(h("p", { class: "small muted" }, "هوش مصنوعی در دسترس نیست (کلید یا میزبان). از قالبِ پایین استفاده کن."));
    /* ساختِ در جریان از رسمِ دوبارهٔ صفحه جان به در می‌برد: دکمه تا پایانش بسته می‌ماند (تورِ زندهٔ ۲۰۲۶-۱۰-۱۴: رسمِ دوباره دکمه را
       باز کرد و کلیکِ دوم ساختِ دوم و ۱۰ نمونهٔ تکراری داد) */
    else if (BUILDING[k.id]) c2.appendChild(h("button", { class: "btn", type: "button", id: "kpAI", disabled: true }, "در حالِ ساخت و سه حلِ مستقل…"));
    else c2.appendChild(h("button", { class: "btn", type: "button", id: "kpAI", onclick: function (e) {
      var b = e.target; if (BUILDING[k.id]) return; b.disabled = true;
      aiGate(out, k).then(function (pref) {
        BUILDING[k.id] = true;
        b.textContent = "در حالِ ساخت و سه حلِ مستقل…";
        // وضعِ آخرین ساخت روی خودِ گره (تور آن را «پیگیریِ بدهکار» می‌کند اگر در جریان ماند، شکست خورد یا چیزی نساخت — کارزارِ سوم v02)
        genMark(k.id, { st: "pending", at: nowISO() });
        return A.kmakeAI(k, { names: pref.names, fileIds: pref.fileIds || [] }).then(function (rep) {
          delete BUILDING[k.id]; genMark(k.id, { st: "ok", at: nowISO(), n: rep.accepted.length });
          A._klastRep = rep;
          A.toast("وارسی‌شده: " + fa(rep.accepted.length) + " · وارسی‌نشده: " + fa(rep.unverified.length) + " · کنار گذاشته: " + fa(rep.rejected.length));
          A.render();
        });
      }).catch(function (er) { var was = BUILDING[k.id]; delete BUILDING[k.id]; if (was) genMark(k.id, { st: "failed", at: nowISO(), err: String((er && er.message) || er).slice(0, 200) }); b.disabled = false; b.textContent = "ساختِ نمونه با هوش مصنوعی"; if (was) A.render(); if (er && er.message !== "لغو شد" && er.message !== "متوقف شد") A.toast(er.message || String(er), "bad"); });
    } }, "ساختِ نمونه با هوش مصنوعی"));
    if (A._klastRep && A._klastRep.rejected.length) out.appendChild(h("details", { class: "small" }, h("summary", {}, "کنار گذاشته‌شده‌های آخرین ساخت (" + fa(A._klastRep.rejected.length) + ")"),
      h("ul", {}, A._klastRep.rejected.map(function (x) { return h("li", {}, x.why + (x.prompt ? " — «" + String(x.prompt).slice(0, 80) + "…»" : "")); }))));
    c2.appendChild(out);
    box.appendChild(c2);
    box.appendChild(userTemplate(k));
    if (c1) box.appendChild(c1);
    return box;
  }
  function userTemplate(k) {
    var f = { form: "verbal", atype: "int", decoy: false };
    var sec = h("section", { class: "card" }, h("h2", {}, "خودت یک نمونه بساز (اثرِ تولید)"),
      h("p", { class: "small" }, "ساختنِ نمونه با همان ساختار در ظاهری تازه خودش ورزش است. فقط نمونه‌هایی با پاسخِ دقیق (عددِ صحیح یا یک گزینهٔ درست) به معیار می‌روند؛ متنِ آزاد و روبریک خودسنجی‌اند."));
    var form = h("select", { id: "kpUF" }, Object.keys(FORMS).map(function (x) { return h("option", { value: x }, FORMS[x]); }));
    var at = h("select", { id: "kpUA" }, [["int", "پاسخِ عددی (دقیق)"], ["choice", "چندگزینه‌ای (دقیق)"], ["text", "متنِ آزاد (خودسنجی)"], ["rubric", "روبریکِ رفتاری (خودسنجی)"]].map(function (x) { return h("option", { value: x[0] }, x[1]); }));
    var pr = h("textarea", { id: "kpUP", rows: 3, placeholder: "صورتِ نمونه — بی پاسخ" });
    var an = h("input", { id: "kpUAns", type: "text", placeholder: "پاسخ (برای عددی: عددِ صحیح)" });
    var ch = h("textarea", { id: "kpUC", rows: 3, placeholder: "گزینه‌ها، هر کدام در یک سطر" });
    var ci = h("input", { id: "kpUCI", type: "number", min: 1, placeholder: "شمارهٔ گزینهٔ درست" });
    var rb = h("textarea", { id: "kpUR", rows: 3, placeholder: "معیارهای مشاهده‌پذیر، هر کدام در یک سطر" });
    var dp = h("textarea", { id: "kpUD", rows: 2, placeholder: "ساختارِ عمیق کجای این نمونه است؟" });
    var tp = h("textarea", { id: "kpUT", rows: 2, placeholder: "تلهٔ گره کجاست؟" });
    var dc = h("input", { type: "checkbox", id: "kpUDec" });
    function vis() { var t = at.value; an.parentNode.hidden = !(t === "int" || t === "text"); ch.parentNode.hidden = ci.parentNode.hidden = t !== "choice"; rb.parentNode.hidden = t !== "rubric"; }
    at.addEventListener("change", vis);
    sec.appendChild(h("div", { class: "kp-ugrid" },
      h("div", { class: "frow" }, h("label", { for: "kpUF" }, "شکل"), form), h("div", { class: "frow" }, h("label", { for: "kpUA" }, "نوعِ پاسخ"), at),
      h("div", { class: "frow full" }, h("label", { for: "kpUP" }, "صورت"), pr),
      h("div", { class: "frow" }, h("label", { for: "kpUAns" }, "پاسخ"), an),
      h("div", { class: "frow" }, h("label", { for: "kpUC" }, "گزینه‌ها"), ch), h("div", { class: "frow" }, h("label", { for: "kpUCI" }, "گزینهٔ درست"), ci),
      h("div", { class: "frow full" }, h("label", { for: "kpUR" }, "روبریک"), rb),
      h("div", { class: "frow" }, h("label", { for: "kpUD" }, "ساختارِ عمیق"), dp), h("div", { class: "frow" }, h("label", { for: "kpUT" }, "تله"), tp),
      h("label", { class: "chk full", for: "kpUDec" }, dc, "این یک نمونهٔ بدلی است (ظاهرِ شبیه، بی‌گره)")));
    sec.appendChild(h("button", { class: "btn", type: "button", onclick: function () {
      try {
        var o = { form: form.value, atype: at.value, prompt: pr.value.trim(), deep: dp.value.trim(), trap: tp.value.trim(), decoy: dc.checked, level: 1 };
        if (!o.prompt) throw new Error("صورت را بنویس");
        if (o.atype === "int" || o.atype === "text") o.answer = an.value.trim();
        if (o.atype === "choice") { var lines = ch.value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean); if (lines.length < 2) throw new Error("دست‌کم دو گزینه"); o.choices = lines.map(function (t, i) { return { id: "c" + (i + 1), t: t }; }); o.answer = "c" + (+ci.value || 0); }
        if (o.atype === "rubric") { o.rubric = rb.value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean); if (o.rubric.length < 2) throw new Error("دست‌کم دو معیار"); }
        A.kmakeUser(k, o); A.toast("نمونه ذخیره شد."); A.render();
      } catch (e) { A.toast(e.message, "bad"); }
    } }, "ذخیرهٔ نمونه"));
    setTimeout(vis, 0);
    return sec;
  }
  function itemsList(k) {
    var items = A.kitemsOf(k.id), showU = kset().showUnverified;
    var good = items.filter(function (it) { return !(it.gen && it.gen.by === "ai" && !(it.ver && it.ver.ok)); }), unv = items.filter(function (it) { return it.gen && it.gen.by === "ai" && !(it.ver && it.ver.ok); });
    function row(it) {
      return h("li", { class: "kp-irow" + (it.bad ? " isbad" : "") }, h("div", { class: "row gap wrap" }, provChip(it), h("span", { class: "chip" }, FORMS[it.form] || it.form), it.decoy ? h("span", { class: "chip" }, "بدلی") : null,
        h("span", { class: "chip " + (A.kcountable(it) ? "good" : "") }, A.kcountable(it) ? "به معیار می‌رود" : "خودسنجی / بیرون از معیار"), it.bad ? h("span", { class: "chip bad" }, "معیوب") : null,
        h("span", { class: "small muted" }, "موعد " + A.fdate(it.due) + " · " + fa((it.hist || []).length) + " پاسخ")),
        h("p", { class: "small kp-iprompt" }, String(it.prompt).slice(0, 220) + (String(it.prompt).length > 220 ? "…" : "")),
        it.ver && !it.ver.ok ? h("p", { class: "small bad" }, "چرا وارسی‌نشده: " + it.ver.why) : null,
        h("button", { class: "btn ghost sm", type: "button", onclick: function () { it.bad = !it.bad; S.put(it); var kk = S.get(it.knot); if (kk) A.kstatusSync(kk); A.render(); } }, it.bad ? "برگرداندن (معیوب نیست)" : "نمونهٔ معیوب"));
    }
    var sec = h("section", { class: "card" }, h("h2", {}, "نمونه‌های این گره (" + fa(good.length) + ")"));
    if (!good.length) sec.appendChild(h("p", { class: "small muted" }, "هنوز نمونه‌ای نیست."));
    else sec.appendChild(h("ul", { class: "kp-ilist" }, good.map(row)));
    if (unv.length) sec.appendChild(h("details", {}, h("summary", {}, "نمونه‌های وارسی‌نشده (" + fa(unv.length) + ") — " + (showU ? "در جلسه با برچسب نشان داده می‌شوند" : "پیش‌فرض پنهان")),
      h("p", { class: "small" }, "این‌ها از سه حلِ مستقل نگذشتند. اگر بخواهی در جلسه ببینی‌شان، در «تنظیمات › یادآورِ ورزشِ گره‌ها» روشن کن؛ حتی آن‌وقت هم به معیار نمی‌روند."),
      h("ul", { class: "kp-ilist" }, unv.map(row))));
    return sec;
  }

  /* ---------- آزمایش‌های واقعی (گره‌های اجتماعی/رفتاری) ---------- */
  function expPanel(k) {
    var box = h("div", { class: "col gap" }), exps = A.kexpsOf(k.id);
    box.appendChild(h("section", { class: "card" }, h("h2", {}, "آزمایشِ واقعی: پیش‌بینی ⇐ انجام ⇐ مشاهده ⇐ ثبت"),
      h("p", { class: "small" }, "گره‌های رفتاری و اجتماعی با پاسخ‌دادن به سؤال ورزیده نمی‌شوند؛ با آزمودنِ یک رفتارِ تازه در موقعیتِ واقعی و ثبتِ آنچه واقعاً رخ داد (آزمایشِ رفتاری با پیش‌بینیِ ثبت‌شده — Bennett-Levy et al. 2004؛ بی هیچ ادعای درمانی). اشخاصِ دیگر را با نقش یا نامِ مستعار بنویس."),
      A.kmode(k) === "exp" ? h("p", { class: "small" }, "معیارِ «ورزیده‌شده» برای این گره: دست‌کم ۳ آزمایشِ کامل در بازهٔ دست‌کم دو هفته.") : h("p", { class: "small muted" }, "این گره از خانوادهٔ نمونه‌های پاسخ‌دار است؛ آزمایش‌ها ثبت می‌شوند ولی معیارش نمونه‌هاست.")));
    var plan = h("textarea", { id: "kpXPlan", rows: 2, placeholder: "چه کاری را، کجا و کِی متفاوت انجام می‌دهی؟ (مثلاً: در جلسهٔ بعد، پیامم را در یک جمله و از زاویهٔ هدفِ مدیر می‌گویم)" });
    var pred = h("textarea", { id: "kpXPred", rows: 2, placeholder: "پیش‌بینی: فکر می‌کنی دقیقاً چه رخ می‌دهد؟" });
    var conf = h("input", { id: "kpXConf", type: "number", min: 0, max: 100, step: 5, value: 60 });
    var due = h("input", { id: "kpXDue", type: "date", value: A.addDays(A.today(), 3) });
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "آزمایشِ تازه"),
      h("div", { class: "frow" }, h("label", { for: "kpXPlan" }, "چه می‌آزمایی؟"), plan), h("div", { class: "frow" }, h("label", { for: "kpXPred" }, "پیش‌بینی"), pred),
      h("div", { class: "row gap wrap" }, h("div", { class: "frow" }, h("label", { for: "kpXConf" }, "اطمینان به پیش‌بینی (٪)"), conf), h("div", { class: "frow" }, h("label", { for: "kpXDue" }, "تا کِی؟"), due)),
      h("button", { class: "btn", type: "button", onclick: function () {
        if (plan.value.trim().length < 5 || pred.value.trim().length < 5) { A.toast("کار و پیش‌بینی را بنویس.", "bad"); return; }
        S.put({ id: A.uid("kexp"), type: "kexp", knot: k.id, plan: plan.value.trim(), predict: pred.value.trim(), conf: +conf.value || 0, due: due.value || A.addDays(A.today(), 3), status: "planned" });
        A.kstatusSync(k, true); A.kremindSync(k); A.toast("آزمایش ثبت شد."); A.render();
      } }, "ثبتِ آزمایش")));
    if (exps.length) box.appendChild(h("section", { class: "card" }, h("h3", {}, "آزمایش‌ها (" + fa(exps.length) + ")"), h("ul", { class: "kp-ilist" }, exps.map(function (x) {
      var li = h("li", { class: "kp-irow" }, h("div", { class: "row gap wrap" }, h("span", { class: "chip " + (x.status === "done" ? "good" : "") }, x.status === "done" ? "انجام شد · " + A.fdate(x.doneAt) : "برنامه · تا " + A.fdate(x.due))),
        h("p", { class: "small" }, h("b", {}, "کار: "), x.plan), h("p", { class: "small" }, h("b", {}, "پیش‌بینی (" + fa(x.conf) + "٪): "), x.predict));
      if (x.status === "done") {
        li.appendChild(h("p", { class: "small" }, h("b", {}, "مشاهده: "), x.observe));
        li.appendChild(h("p", { class: "small" }, h("b", {}, "نتیجه: "), ({ same: "همان شد که پیش‌بینی کردم", diff: "متفاوت شد", mixed: "بخشی همان، بخشی متفاوت" })[x.outcome] || x.outcome));
        li.appendChild(h("p", { class: "small" }, h("b", {}, "درس: "), x.reflect));
      } else {
        var ob = h("textarea", { rows: 2, "aria-label": "چه دیدی؟", placeholder: "چه دیدی؟ (واقعیت، بی‌تفسیر)" });
        var oc = h("select", { "aria-label": "نتیجه در برابرِ پیش‌بینی" }, h("option", { value: "" }, "— نتیجه در برابرِ پیش‌بینی —"), h("option", { value: "same" }, "همان شد که پیش‌بینی کردم"), h("option", { value: "diff" }, "متفاوت شد"), h("option", { value: "mixed" }, "بخشی همان، بخشی متفاوت"));
        var rf = h("textarea", { rows: 2, "aria-label": "چه یاد گرفتی؟", placeholder: "چه یاد گرفتی؟ دفعهٔ بعد چه می‌کنی؟" });
        li.appendChild(h("div", { class: "col gap kp-xdone" }, ob, oc, rf, h("button", { class: "btn sm", type: "button", onclick: function () {
          if (ob.value.trim().length < 5 || !oc.value || rf.value.trim().length < 5) { A.toast("مشاهده، نتیجه و درس هر سه لازم‌اند.", "bad"); return; }
          x.observe = ob.value.trim(); x.outcome = oc.value; x.reflect = rf.value.trim(); x.status = "done"; x.doneAt = A.today() + "T" + nowISO().slice(11);
          S.put(x); A.kstatusSync(k, true); A.kremindSync(k); A.toast("ثبت شد."); A.render();
        } }, "انجام دادم — ثبت")));
      }
      return li;
    }))));
    return box;
  }

  /* ---------- جلسهٔ ورزش ---------- */
  var SESS = {};
  function sessKey(scope) { return scope || "_all"; }
  function interleave(pairs) {
    var by = {}, order = [];
    A.shuffle(pairs.slice()).forEach(function (p) { if (!by[p.knot.id]) { by[p.knot.id] = []; order.push(p.knot.id); } by[p.knot.id].push(p.item.id); });
    var out = [], more = true;
    while (more) { more = false; order.forEach(function (id) { var q = by[id]; if (q.length) { out.push(q.shift()); more = true; } }); }
    return out;
  }
  function newSession(scope) {
    var ids;
    if (scope) {
      var k = S.get(scope), t = A.today(), all = A.kitemsOf(scope).filter(A.kservable);
      var due = all.filter(function (it) { return (it.due || t) <= t; });
      ids = A.shuffle(due.map(function (it) { return it.id; }));
      if (ids.length < 6) all.filter(function (it) { return !(it.hist || []).length && ids.indexOf(it.id) < 0; }).forEach(function (it) { if (ids.length < 6) ids.push(it.id); });
      ids = ids.slice(0, 8);
      if (!k) ids = [];
    } else ids = interleave(A.kpracticeDue()).slice(0, 12);
    return { id: A.uid("ks"), scope: scope, q: ids, i: 0, res: [], cur: null, touched: {} };
  }
  function curOf(ss) {
    if (!ss.cur || ss.cur.id !== ss.q[ss.i]) ss.cur = { id: ss.q[ss.i], conf: 50, confSet: false, ans: null, saw: null, probes: [], pad: "", step: 0, done: false, ok: null, why: "", self: null };
    return ss.cur;
  }
  function rr() { A.render(); focusMark(); }
  function ansLabel(it) {
    if (it.atype === "choice") { var set = it.multi ? setOf(it.answer).split(",") : [it.answer]; return (it.choices || []).filter(function (c) { return set.indexOf(c.id) >= 0; }).map(function (c) { return c.t; }).join(" + "); }
    if (it.exact === "expr") return it.answer.replace(/\*/g, " × ").replace(/\//g, " ÷ ").replace(/\+/g, " + ").replace(/-/g, " − ") + " (یک راه از چند راهِ ممکن)";
    if (it.exact === "jars") return ltr(it.answer);
    return fa(it.answer);
  }
  function itemView(ss) {
    var c = curOf(ss), it = S.get(c.id);
    if (!it) { ss.i++; return h("div", {}, h("p", {}, "این نمونه دیگر نیست."), h("button", { class: "btn", type: "button", onclick: rr }, "بعدی")); }
    var k = S.get(it.knot), box = h("section", { class: "card kp-item", dir: "rtl" });
    box.appendChild(h("div", { class: "row between wrap" }, h("span", { class: "eyebrow" }, "نمونهٔ " + fa(ss.i + 1) + " از " + fa(ss.q.length)),
      h("span", { class: "row gap wrap" }, h("span", { class: "chip" }, FORMS[it.form] || it.form), it.gen && it.gen.by === "ai" && !(it.ver && it.ver.ok) ? h("span", { class: "chip bad" }, "وارسی‌نشده") : null,
        c.done ? h("span", { class: "chip" }, "گره: " + knotName(k)) : null)));
    box.appendChild(h("div", { class: "kp-prompt" }, String(it.prompt).split("\n").map(function (x) { return h("p", {}, x); })));
    if (it.svg) { var sv = drawSvg(it.svg); if (sv) box.appendChild(h("div", { class: "kp-fig" }, sv)); }
    var locked = c.done;
    // ۲-۴-۶: آزمودنِ سه‌تایی‌ها
    if (it.params && it.params.rule) {
      var pi = [0, 1, 2].map(function (j) { return h("input", { type: "text", inputmode: "numeric", class: "kp-num", dir: "ltr", "aria-label": "عددِ " + fa(j + 1), disabled: locked }); });
      var plist = h("ol", { class: "kp-probes", "aria-live": "polite" }, c.probes.map(function (p) { return h("li", { class: p.fit ? "ok" : "no" }, h("span", { dir: "ltr" }, fa(p.t.join(", "))), " — ", p.fit ? "می‌خواند" : "نمی‌خواند"); }));
      box.appendChild(h("div", { class: "kp-probe" }, h("div", { class: "row gap wrap" }, h("span", { class: "small" }, "سه‌تاییِ آزمون:"), h("span", { class: "row gap", dir: "ltr" }, pi),
        h("button", { class: "btn sm", type: "button", disabled: locked, "data-kfocus": !locked && !c.confSet && c.probes.length < it.minProbes ? "1" : null, onclick: function () {
          var t = pi.map(function (x) { return intOf(x.value); }); if (t.some(function (x) { return x == null; })) { A.toast("سه عددِ صحیح بنویس.", "bad"); return; }
          c.probes.push({ t: t, fit: A.kprobe(it, t), neg: !A.KRULES[it.params.salient].f(t, it.params.k) }); rr();
        } }, "آزمودن")), plist,
        h("p", { class: "small muted" }, fa(c.probes.length) + " آزمون" + (c.probes.length < (it.minProbes || 0) ? " — دست‌کم " + fa(it.minProbes) + " لازم است پیش از انتخابِ قاعده." : ""))));
    }
    // زنجیرهٔ حافظهٔ کاری: گام‌ها یکی‌یکی
    var stepsDone = true;
    if (it.steps && it.steps.length) {
      stepsDone = c.step >= it.steps.length;
      var pad = h("textarea", { rows: 3, class: "kp-pad", "aria-label": "چرک‌نویس (بیرون‌ریزی)", placeholder: "چرک‌نویس — اگر بخواهی این‌جا یادداشت کن (بیرون‌ریزی)", disabled: locked, oninput: function (e) { c.pad = e.target.value; } }); pad.value = c.pad;
      box.appendChild(h("div", { class: "kp-steps" },
        stepsDone ? h("p", { class: "small muted" }, "همهٔ " + fa(it.steps.length) + " دستور آمد و پنهان شد.") : h("p", { class: "kp-step", "aria-live": "polite" }, h("b", {}, "دستورِ " + fa(c.step + 1) + " از " + fa(it.steps.length) + ": "), it.steps[c.step]),
        !stepsDone ? h("button", { class: "btn sm", type: "button", "data-kfocus": "1", onclick: function () { c.step++; rr(); } }, c.step + 1 < it.steps.length ? "دستورِ بعد" : "تمام شد") : null, pad));
    }
    var probesOk = !(it.params && it.params.rule) || c.probes.length >= (it.minProbes || 0);
    // اطمینان — پیش از پاسخ
    if (stepsDone && probesOk) {
      if (!c.confSet) {
        var rng = h("input", { type: "range", id: "kpConf", min: 0, max: 100, step: 5, value: c.conf, "aria-label": "اطمینان به پاسخی که خواهی داد", oninput: function (e) { c.conf = +e.target.value; lab.textContent = "ثبتِ اطمینان: " + fa(c.conf) + "٪"; } });
        var lab = h("span", {}, "ثبتِ اطمینان: " + fa(c.conf) + "٪");
        box.appendChild(h("div", { class: "kp-conf" }, h("label", { for: "kpConf", class: "small" }, "پیش از پاسخ: چقدر مطمئنی که درست جواب می‌دهی؟ (۲۴)"), rng,
          h("button", { class: "btn sm", type: "button", "data-kfocus": "1", onclick: function () { c.confSet = true; rr(); } }, lab)));
      } else box.appendChild(h("p", { class: "small muted kp-confset" }, "اطمینانِ ثبت‌شده: " + fa(c.conf) + "٪"));
    }
    if (c.confSet) box.appendChild(answerArea(it, c, locked));
    if (c.confSet && !locked) {
      box.appendChild(h("fieldset", { class: "kp-saw" }, h("legend", { class: "small" }, "به نظرت ساختار/تلهٔ گره در این نمونه هست؟"),
        [[true, "بله، این‌جا هست"], [false, "نه، این‌جا نیست"]].map(function (o) {
          var id = "kpSaw" + (o[0] ? 1 : 0);
          return h("label", { class: "chk", for: id }, h("input", { type: "radio", name: "kpSaw", id: id, checked: c.saw === o[0], onchange: function () { c.saw = o[0]; } }), o[1]);
        })));
      box.appendChild(h("button", { class: "btn", type: "button", id: "kpSubmit", onclick: function () { submit(ss, it, c); } }, "ثبتِ پاسخ"));
    }
    if (locked) box.appendChild(reveal(ss, it, c, k));
    return box;
  }
  function answerArea(it, c, locked) {
    var w = h("div", { class: "kp-ans" });
    if (it.atype === "int") {
      var inp = h("input", { type: "text", inputmode: "numeric", id: "kpAns", dir: "ltr", class: "kp-num wide", disabled: locked, "data-kfocus": locked ? null : "1", "aria-label": "پاسخِ عددی", oninput: function (e) { c.ans = e.target.value; } });
      inp.value = c.ans || ""; w.appendChild(h("label", { for: "kpAns", class: "small" }, "پاسخ (عدد):")); w.appendChild(inp);
    } else if (it.atype === "choice") {
      var multi = !!it.multi, cur = multi ? (c.ans || []) : c.ans;
      w.appendChild(h("fieldset", { class: "kp-choices" }, h("legend", { class: "small" }, multi ? "یک یا چند گزینه:" : "یک گزینه:"), (it.choices || []).map(function (ch, j) {
        var id = "kpC_" + ch.id, inp2 = h("input", { type: multi ? "checkbox" : "radio", name: "kpC", id: id, value: ch.id, disabled: locked, "data-kfocus": !locked && j === 0 ? "1" : null,
          checked: multi ? cur.indexOf(ch.id) >= 0 : cur === ch.id, onchange: function (e) {
            if (multi) { var a = (c.ans || []).filter(function (x) { return x !== ch.id; }); if (e.target.checked) a.push(ch.id); c.ans = a; } else c.ans = ch.id;
          } });
        return h("label", { class: "kp-opt", for: id }, inp2, h("span", { dir: "auto" }, ch.t));
      })));
    } else if (it.atype === "text") {
      var ti = h("input", { type: "text", id: "kpAns", dir: it.exact ? "ltr" : "rtl", class: "wide", disabled: locked, "data-kfocus": locked ? null : "1", "aria-label": "پاسخ", placeholder: it.exact === "expr" ? "مثلاً (1+2)*3" : it.exact === "jars" ? "مثلاً A + 2B" : "", oninput: function (e) { c.ans = e.target.value; } });
      ti.value = c.ans || ""; w.appendChild(h("label", { for: "kpAns", class: "small" }, it.exact === "expr" ? "عبارت (با + − × ÷ یا + - * /):" : it.exact === "jars" ? "راه (حرف‌های A، B، C با + و −):" : "پاسخِ تو:")); w.appendChild(ti);
      if (!it.exact) w.appendChild(h("p", { class: "small muted" }, "این نمونه پاسخِ دقیقِ ماشینی ندارد؛ پس از دیدنِ پاسخ خودت می‌سنجی (به معیار نمی‌رود)."));
    } else if (it.atype === "rubric") {
      var ra = h("textarea", { id: "kpAns", rows: 3, disabled: locked, "data-kfocus": locked ? null : "1", "aria-label": "پاسخِ تو", placeholder: "در این موقعیت چه می‌کنی/می‌گویی؟", oninput: function (e) { c.ans = e.target.value; } });
      ra.value = c.ans || ""; w.appendChild(h("label", { for: "kpAns", class: "small" }, "پاسخِ تو:")); w.appendChild(ra);
    }
    return w;
  }
  function submit(ss, it, c) {
    var empty = c.ans == null || c.ans === "" || (Array.isArray(c.ans) && !c.ans.length);
    if (empty) { A.toast("اول پاسخ بده.", "bad"); return; }
    if (c.saw == null) { A.toast("بگو آیا گره این‌جا هست یا نه.", "bad"); return; }
    if (it.atype === "int" && intOf(c.ans) == null) { A.toast("یک عددِ صحیح بنویس.", "bad"); return; }
    var auto = A.kcheck(it, c.ans), ok;
    if (auto == null) { c.done = true; c.selfPending = true; rr(); return; }
    ok = auto && (!it.decoy || c.saw === false);
    finish(ss, it, c, ok);
  }
  function finish(ss, it, c, ok, self) {
    var res = { ok: ok, conf: c.conf, ans: Array.isArray(c.ans) ? setOf(c.ans) : String(c.ans).slice(0, 500), saw: c.saw, sess: ss.id, self: self || null };
    if (it.paths && it.paths[c.ans]) res.path = it.paths[c.ans];
    if (it.params && it.params.caps && it.atype === "int") res.path = intOf(c.ans) === 2 ? "short" : intOf(c.ans) === 4 ? "set" : "wrong";  // old level-3 items (minimum count) still answerable
    if (it.exact === "jars") res.path = A.kjarsPath(it, c.ans);
    if (it.params && it.params.rule) res.probe = { n: c.probes.length, neg: c.probes.filter(function (p) { return p.neg; }).length };
    if (it.steps) res.pad = (c.pad || "").trim().length > 0;
    c.ok = ok; c.done = true; c.selfPending = false;
    A.krecord(it, res);
    ss.res.push({ id: it.id, ok: ok, conf: c.conf, knot: it.knot, decoy: it.decoy }); ss.touched[it.knot] = 1;
    rr();
  }
  function reveal(ss, it, c, k) {
    var r = h("div", { class: "kp-reveal", "aria-live": "polite" });
    if (c.selfPending) {
      r.appendChild(h("p", {}, h("strong", {}, "نمونهٔ خودسنجی")));
      if (it.atype === "rubric") {
        var marks = (it.rubric || []).map(function () { return false; });
        r.appendChild(h("fieldset", {}, h("legend", { class: "small" }, "کدام معیارها در پاسخت بود؟"), (it.rubric || []).map(function (x, j) {
          var id = "kpR" + j; return h("label", { class: "chk", for: id }, h("input", { type: "checkbox", id: id, onchange: function (e) { marks[j] = e.target.checked; } }), x);
        })));
        r.appendChild(h("button", { class: "btn sm", type: "button", "data-kfocus": "1", onclick: function () { var n = marks.filter(Boolean).length; finish(ss, it, c, n === marks.length, { kind: "rubric", n: n, of: marks.length }); } }, "ثبتِ خودسنجی"));
      } else {
        r.appendChild(h("p", {}, "پاسخِ نمونه: ", h("b", {}, it.answer || "—")));
        r.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn sm", type: "button", "data-kfocus": "1", onclick: function () { finish(ss, it, c, true, { kind: "text" }); } }, "پاسخم معادل بود"),
          h("button", { class: "btn ghost sm", type: "button", onclick: function () { finish(ss, it, c, false, { kind: "text" }); } }, "نبود")));
      }
      return r;
    }
    var auto = A.kcheck(it, c.ans);
    r.appendChild(h("p", { class: "kp-verdict " + (c.ok ? "good" : "bad") }, c.ok ? "✓ درست" : "✗ نادرست"));
    if (it.decoy) r.appendChild(h("p", { class: "small" }, h("b", {}, "این نمونهٔ بدلی بود: "), "ظاهرش شبیه است ولی ساختارِ گره در آن نیست. " + (c.saw === false ? "تو هم درست گفتی «این‌جا نیست»." : "تو گفتی «هست» — دیدنِ گره در جایی که نیست هم خطاست (تعمیمِ افراطی).") + (auto ? "" : " پاسخِ خودِ مسئله هم درست نبود.")));
    else if (c.saw === false) r.appendChild(h("p", { class: "small" }, "تو گفتی گره این‌جا نیست؛ این نمونه گره را داشت. (نمره فقط بر پایهٔ پاسخ است.)"));
    if (it.atype !== "rubric") r.appendChild(h("p", {}, h("b", {}, "پاسخِ درست: "), h("span", { dir: it.exact === "expr" ? "ltr" : "auto" }, ansLabel(it))));
    if (it.exact === "expr" && !auto) { var why = A.kexprCheck(c.ans, it.params.nums, it.params.target).why; if (why) r.appendChild(h("p", { class: "small bad" }, "عبارتِ تو: " + why)); }
    if (it.exact === "jars" && !auto) { var jp = A.kjarsPath(it, c.ans); r.appendChild(h("p", { class: "small bad" }, jp === "wrong" ? (A.kjarsVec(c.ans) ? "راهِ تو به دقیقاً " + fa(it.params.T) + " نمی‌رسد." : "قالبِ راه خوانا نبود (مثلاً «A + 2B»).") : jp === "long" ? "راهِ تو درست است ولی کوتاه‌ترین نیست." : "")); }
    var last = (it.hist || [])[it.hist.length - 1] || {};
    if (last.path === "set" && !it.decoy) r.appendChild(h("p", { class: "small" }, "راهی که رفتی همان روشِ گرم‌کردن بود — کار می‌کند، ولی کوتاه‌ترین نیست. این همان چیزی است که این نمونه می‌سنجد."));
    if (last.probe) r.appendChild(h("p", { class: "small" }, "از " + fa(last.probe.n) + " آزمونت، " + fa(last.probe.neg) + " تا آزمونی بود که حدسِ اولِ رایج («گامِ ثابت») برایش «نمی‌خواند» پیش‌بینی می‌کرد — یعنی آزمونِ ابطالی."));
    if (it.steps) r.appendChild(h("p", { class: "small" }, last.pad ? "از چرک‌نویس استفاده کردی (بیرون‌ریزی)." : "چرک‌نویس خالی ماند — همه در ذهن نگه داشته شد."));
    if (it.explain) r.appendChild(h("div", { class: "small kp-explain" }, String(it.explain).split("\n").map(function (x) { return h("p", {}, x); })));
    r.appendChild(h("p", {}, h("b", {}, "ساختارِ عمیق کجا بود: "), it.deep || "—"));
    r.appendChild(h("p", {}, h("b", {}, "تله کجا بود: "), it.trap || "—"));
    if (!c.whySaved) {
      var wt = h("textarea", { id: "kpWhy", rows: 3, "data-kfocus": "1", placeholder: it.decoy ? "با کلماتِ خودت: چرا این گره این‌جا نیست؟" : "با کلماتِ خودت: چرا پاسخ این است؟ نشانه‌ای که باید می‌دیدی چه بود؟", oninput: function (e) { c.why = e.target.value; } });
      wt.value = c.why || "";
      r.appendChild(h("label", { for: "kpWhy" }, h("b", {}, it.decoy ? "چرا این گره این‌جا نیست؟ (۴۵)" : "چرا؟ (۴۵ — خودتوضیحی)")));
      r.appendChild(wt);
      r.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn", type: "button", id: "kpNext", onclick: function () {
        if ((c.why || "").trim().length < 5) { A.toast("یک جملهٔ کوتاه بنویس — توضیح‌دادن خودش بخشی از ورزش است.", "bad"); return; }
        var fresh = S.get(it.id); if (fresh && fresh.hist && fresh.hist.length) { fresh.hist[fresh.hist.length - 1].why = c.why.trim(); S.put(fresh); }
        c.whySaved = true; ss.i++; ss.cur = null; rr();
      } }, ss.i + 1 < ss.q.length ? "ذخیره و نمونهٔ بعد" : "ذخیره و پایانِ جلسه"),
        h("button", { class: "btn ghost sm", type: "button", title: "نمونه نادرست، مبهم یا بی‌ربط است — از معیار بیرون می‌رود", onclick: function () {
          var fresh = S.get(it.id); if (fresh) { fresh.bad = true; S.put(fresh); var kk = S.get(fresh.knot); if (kk) A.kstatusSync(kk); }
          A.toast("علامتِ «معیوب» خورد؛ از معیار بیرون رفت."); c.whySaved = true; ss.i++; ss.cur = null; rr();
        } }, "نمونهٔ معیوب")));
    }
    return r;
  }
  function summary(ss) {
    var n = ss.res.length, ok = ss.res.filter(function (x) { return x.ok; }).length;
    var mc = n ? Math.round(ss.res.reduce(function (a, x) { return a + x.conf; }, 0) / n) : 0;
    var box = h("section", { class: "card kp-sum" }, h("h2", {}, "پایانِ جلسه"),
      h("p", {}, fa(n) + " نمونه · " + fa(ok) + " درست" + (n ? " (" + fa(Math.round(100 * ok / n)) + "٪) · میانگینِ اطمینانِ پیش از پاسخ: " + fa(mc) + "٪" : "")),
      n ? h("p", { class: "small" }, mc - Math.round(100 * ok / n) > 10 ? "اطمینانت از درستی‌ات بیشتر بود (بیش‌اطمینانی در همین جلسه)." : Math.round(100 * ok / n) - mc > 10 ? "درستی‌ات از اطمینانت بیشتر بود (کم‌اطمینانی در همین جلسه)." : "اطمینان و درستی نزدیکِ هم بودند. (یک جلسه نمونهٔ کوچکی است؛ نمودارِ کالیبراسیون روی همهٔ جلسه‌هاست.)") : null);
    Object.keys(ss.touched).forEach(function (id) {
      var k = S.get(id); if (!k) return;
      A.kremindSync(k);
      var m = A.kmastery(k), nx = A.knotNext(k);
      box.appendChild(h("div", { class: "kp-sumk" }, h("div", { class: "row gap wrap" }, h("strong", {}, knotName(k)), stChip(k.status)), h("p", { class: "small" }, nx ? "نوبتِ بعد: " + A.fdate(nx) : "نمونهٔ موعدداری نمانده."), masteryList(m)));
    });
    box.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn", type: "button", "data-kfocus": "1", onclick: function () { delete SESS[sessKey(ss.scope)]; A.go("kpractice", ss.scope || null); } }, "برگشت")));
    return box;
  }
  function runView(scope) {
    var key = sessKey(scope), ss = SESS[key];
    if (!ss) ss = SESS[key] = newSession(scope);
    var root = h("div", { class: "page kp" });
    var k = scope ? S.get(scope) : null;
    root.appendChild(A.head("گره‌گشا · جلسهٔ ورزش", scope ? "ورزش: " + knotName(k) : "جلسهٔ درهم‌تنیده", scope ? null : "نمونه‌های موعدِ همهٔ گره‌ها درهم آمیخته‌اند (۴۳) و نامِ گره تا پس از پاسخ پنهان است — چون تشخیصِ اینکه کدام ساختار این‌جاست خودش بخشی از ورزش است."));
    if (!ss.q.length) {
      root.appendChild(A.empty(scope ? "نمونهٔ موعدی برای این گره نیست." : "امروز نمونهٔ موعدی نیست.", h("button", { class: "btn", type: "button", onclick: function () { delete SESS[key]; A.go("kpractice", scope || null, scope ? "items" : null); } }, scope ? "ساختنِ نمونه" : "برگشت")));
      delete SESS[key];
      return root;
    }
    if (ss.i >= ss.q.length) { root.appendChild(summary(ss)); return root; }
    root.appendChild(itemView(ss));
    root.appendChild(h("div", { class: "row gap wrap mt" }, h("button", { class: "btn ghost sm", type: "button", onclick: function () { ss.q = ss.q.slice(0, ss.i + (ss.cur && ss.cur.done ? 1 : 0)); if (!ss.cur || !ss.cur.done) { ss.i = ss.q.length; } rr(); } }, "پایانِ زودترِ جلسه")));
    return root;
  }

  /* ---------- صفحهٔ گره و صفحهٔ اصلی ---------- */
  function knotView(id, tab) {
    var k = S.get(id);
    if (!k || k.type !== "knot") return A.empty("این گره پیدا نشد.", h("button", { class: "btn", type: "button", onclick: function () { A.go("kpractice"); } }, "همهٔ گره‌ها"));
    A.kstatusSync(k);
    var root = h("div", { class: "page kp" }), mode = A.kmode(k), m = A.kmastery(k), nx = A.knotNext(k);
    root.appendChild(A.head("گره‌گشا · ورزیدگی", knotName(k), null, h("div", { class: "row gap wrap" }, famChip(k), stChip(k.status),
      h("button", { class: "btn ghost sm", type: "button", onclick: function () { A.go("kpractice"); } }, "همهٔ گره‌ها"),
      A.V.knot ? h("button", { class: "btn ghost sm", type: "button", onclick: function () { A.go("knot", k.id); } }, "کارتِ گره") : null)));
    tab = tab || "over";
    root.appendChild(A.tabs([["over", "پیشرفت"], ["items", "نمونه‌ها (" + fa(A.kitemsOf(k.id).filter(function (x) { return !x.bad; }).length) + ")"], ["exp", "آزمایش‌ها (" + fa(A.kexpsOf(k.id).length) + ")"]], tab, function (t) { A.go("kpractice", k.id, t); }));
    if (tab === "items") { root.appendChild(itemsList(k)); root.appendChild(genPanel(k)); return root; }
    if (tab === "exp") { root.appendChild(expPanel(k)); return root; }
    var due = A.kitemsOf(k.id).filter(function (it) { return A.kservable(it) && (it.due || A.today()) <= A.today(); }).length + A.kexpsOf(k.id).filter(function (x) { return x.status === "planned" && x.due && x.due <= A.today(); }).length;
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "وضعیت: " + A.KSTATUS[k.status || "open"]),
      h("p", { class: "small" }, mode === "exp" ? "این گره رفتاری/اجتماعی است: با آزمایش‌های واقعیِ ثبت‌شده ورزیده می‌شود؛ نمونه‌های روبریک فقط خودسنجی‌اند." : "این گره با نمونه‌های پاسخ‌دقیق در شکل‌های گوناگون و نمونه‌های بدلی ورزیده می‌شود."),
      m.lapse ? h("p", { class: "warnline kp-lapse" }, A.KLAPSE) : null,
      A.kcodeGap(k) ? h("p", { class: "small warnline kp-codegap" }, A.kcodeGap(k)) : null,
      masteryList(m),
      h("p", { class: "small muted" }, (nx ? "نوبتِ بعد: " + A.fdate(nx) : "هنوز نوبتی نیست") + " · " + fa(due) + " نمونهٔ موعد" + (k.logOld ? " · " + fa(k.logOld.n) + " پاسخِ قدیمی‌تر در خلاصه" : "")),
      h("div", { class: "row gap wrap" },
        h("button", { class: "btn", type: "button", disabled: !A.kitemsOf(k.id).some(A.kservable), onclick: function () { delete SESS[k.id]; A.go("kpractice", k.id, "run"); } }, "شروعِ جلسهٔ ورزش"),
        mode === "exp" ? h("button", { class: "btn ghost", type: "button", onclick: function () { A.go("kpractice", k.id, "exp"); } }, "آزمایشِ واقعی") : null,
        h("button", { class: "btn ghost", type: "button", onclick: function () { A.go("kpractice", k.id, "items"); } }, "ساختنِ نمونه"))));
    var log = (k.log || []).slice(-15).reverse();
    if (log.length) root.appendChild(h("section", { class: "card" }, h("h3", {}, "آخرین پاسخ‌ها"), h("div", { class: "kp-tablewrap" }, h("table", { class: "kp-log" },
      h("thead", {}, h("tr", {}, ["تاریخ", "شکل", "بدلی", "اطمینان", "نتیجه", "به معیار"].map(function (x) { return h("th", {}, x); }))),
      h("tbody", {}, log.map(function (e) { return h("tr", {}, h("td", {}, A.fdate(e.d)), h("td", {}, FORMS[e.form] || e.form || ""), h("td", {}, e.decoy ? "بله" : ""), h("td", {}, e.conf != null ? fa(e.conf) + "٪" : ""), h("td", {}, e.ok ? "✓" : e.ok === false ? "✗" : "—"), h("td", {}, e.el ? "بله" : "نه")); }))))));
    root.appendChild(transferNote());
    return root;
  }
  A.V.kpractice = function (arg, sub) {
    if (sub === "run") return runView(arg || null);
    if (arg) return knotView(arg, sub);
    A.kremindSweep();
    var root = h("div", { class: "page kp" }), knots = S.all("knot");
    knots.forEach(function (k) { A.kstatusSync(k); });
    var due = A.kpracticeDue(), edue = A.kexpDue();
    root.appendChild(A.head("گره‌گشا · ورزیدگی", "ورزشِ گره‌ها", "نمونه‌های تازه با همان ساختارِ عمیق در ظاهرهای گوناگون، به‌علاوهٔ نمونه‌های بدلی؛ پیش از پاسخ اطمینان، پس از پاسخ «چرا؟». گره‌های رفتاری و اجتماعی با آزمایشِ واقعی."));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, fa(due.length) + " نمونهٔ موعد"),
      h("p", { class: "small" }, due.length ? "از " + fa(Object.keys(due.reduce(function (a, d) { a[d.knot.id] = 1; return a; }, {})).length) + " گره، درهم‌آمیخته." : "امروز چیزی موعد نیست."),
      h("button", { class: "btn lg", type: "button", disabled: !due.length, onclick: function () { delete SESS._all; A.go("kpractice", null, "run"); } }, "شروعِ جلسهٔ درهم‌تنیده")));
    if (edue.length) root.appendChild(h("section", { class: "card kp-expdue" }, h("h2", {}, fa(edue.length) + " آزمایشِ واقعیِ موعد"),
      h("ul", { class: "small" }, edue.map(function (d) { return h("li", {}, h("button", { class: "linkish", type: "button", onclick: function () { A.go("kpractice", d.knot.id, "exp"); } }, knotName(d.knot)), " — " + (d.exp.what || d.exp.plan || d.exp.predict || "آزمایش") + " (موعد " + A.fdate(d.exp.due) + ")"); }))));
    if (!knots.length) root.appendChild(A.empty("هنوز گره‌ای ثبت نشده. گره پس از تشخیص در «گره‌گشا» (موقعیت ⇐ ریشه ⇐ کارتِ گره) ساخته می‌شود.", A.V.kcases ? h("button", { class: "btn", type: "button", onclick: function () { A.go("kcases"); } }, "رفتن به موقعیت‌ها") : null));
    else root.appendChild(h("section", { class: "card" }, h("h2", {}, "گره‌ها"), h("ul", { class: "kp-klist" }, knots.map(function (k) {
      var m = A.kmastery(k), nx = A.knotNext(k), okN = m.why.filter(function (w) { return w.ok; }).length;
      return h("li", { class: "kp-krow" }, h("div", { class: "row gap wrap" }, h("button", { class: "linkish", type: "button", onclick: function () { A.go("kpractice", k.id); } }, h("strong", {}, knotName(k))), famChip(k), stChip(k.status)),
        h("span", { class: "small muted" }, (A.kmode(k) === "exp" ? "آزمایش‌محور" : "نمونه‌محور") + " · " + fa(A.kitemsOf(k.id).length) + " نمونه · " + (nx ? "نوبت " + A.fdate(nx) : "بی نوبت") + " · معیار: " + fa(okN) + " از " + fa(m.why.length)));
    }))));
    root.appendChild(transferNote());
    return root;
  };
  /* برای a16: کارتِ کوچکِ ورزش که در صفحهٔ گره جا می‌گیرد */
  A.kpracticePanel = function (knotId) {
    var k = S.get(knotId); if (!k) return null;
    var m = A.kmastery(k), nx = A.knotNext(k);
    return h("section", { class: "card kp-panel" }, h("div", { class: "row between wrap" }, h("h3", {}, "ورزیدگی"), stChip(k.status)),
      m.lapse ? h("p", { class: "small warnline kp-lapse" }, A.KLAPSE) : null,
      h("p", { class: "small" }, fa(A.kitemsOf(k.id).length) + " نمونه · " + (nx ? "نوبتِ بعد " + A.fdate(nx) : "بی نوبت") + " · معیار: " + fa(m.why.filter(function (w) { return w.ok; }).length) + " از " + fa(m.why.length)),
      h("button", { class: "btn sm", type: "button", onclick: function () { A.go("kpractice", k.id); } }, "رفتن به ورزش"));
  };

  /* ---------- «امروز»: یک سطرِ ترکیبی (اگر a16 نساخته باشد) ---------- */
  if (A.dueList) {
    var rawDue = A.dueList;
    A.dueList = function () {
      var items = rawDue.apply(this, arguments);
      try {
        if (!items.some(function (x) { return x.k === "knot" || x.k === "kpractice"; })) {
          var n = A.kpracticeDue().length;
          if (n) items.push({ k: "kpractice", txt: fa(n) + " ورزشِ گرهِ موعد", sub: "گره‌گشا · درهم‌تنیده، با اطمینان پیش از پاسخ", go: function () { A.go("kpractice"); } });
        }
      } catch (e) { }
      return items;
    };
  }
  /* ---------- جای صفحه در منو (اگر a16 گروهِ گره‌گشا را ساخته، کنارِ آن) ---------- */
  if (A.NAV && !A.NAV.some(function (n) { return n[0] === "kpractice"; })) {
    var at = -1; A.NAV.forEach(function (n, i) { if (n[0] === "kcases" || n[0] === "knots") at = i; });
    var entry = ["kpractice", "🏋 ورزشِ گره‌ها", "نمونه‌های تازه برای هر گره، جلسهٔ درهم‌تنیده و آزمایش‌های واقعی"];
    if (at >= 0) A.NAV.splice(at + 1, 0, entry); else A.NAV.push({ g: "گره‌گشا" }, entry);
  }

  /* ---------- تنظیمات: یادآورها و نمایشِ وارسی‌نشده‌ها ---------- */
  if (A.V.settings) {
    var rawSettings = A.V.settings;
    A.V.settings = function () {
      var root = rawSettings.apply(this, arguments), s = kset();
      function save(mut) { var st = S.settings(); st.knots = st.knots || {}; st.knots.notify = st.knots.notify || {}; mut(st.knots); S.saveSettings(st); S.all("knot").forEach(function (k) { A.kremindSync(k); }); }
      function dcb(id, label, on, fn) { var x = cb(id, label, on, fn); x.style.display = "inline-flex"; x.style.marginInlineEnd = "1em"; if (!s.notify.detail) x.querySelector("input").disabled = true; return x; }
      function cb(id, label, on, fn) { return h("label", { class: "chk", for: id }, h("input", { type: "checkbox", id: id, checked: on, onchange: function (e) { var v = e.target.checked; save(function (kn) { fn(kn, v); }); } }), label); }
      var hour = h("select", { id: "kpHour", onchange: function (e) { var v = +e.target.value; save(function (kn) { kn.notify.hour = v; }); } }, [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 21].map(function (x) { return h("option", { value: x, selected: x === s.notify.hour }, fa(x) + ":۰۰"); }));
      var status = hostRemind()
        ? "تلگرام و ایمیل از سرور فرستاده می‌شوند (هر نوبتِ موعد یک یادآور، با همان کلید به‌روز یا لغو می‌شود). اگر سرور ایمیل یا تلگرام را تنظیم نکرده باشد، وضعیتِ آن پیام «تنظیم‌نشده» ثبت می‌شود، نه «فرستاده شد»."
        : "در این نسخه سرورِ یادآور وصل نیست؛ موعدها فقط در «امروز» و صفحهٔ «ورزشِ گره‌ها» دیده می‌شوند.";
      var live = h("p", { class: "small muted", id: "kpRemStatus" }, status);
      if (A.HOST && typeof A.HOST.remindStatus === "function") {
        try { A.HOST.remindStatus().then(function (r) { if (!r) return; var lab = function (v) { return v === "ok" || v === true ? "تنظیم‌شده" : v === "unconfigured" || v === false ? "تنظیم‌نشده" : String(v || "نامعلوم"); }; live.textContent = status + " — اکنون: تلگرام " + lab(r.telegram) + "، ایمیل " + lab(r.email) + "."; }, function () { }); } catch (e) { }
      }
      var sec = h("section", { class: "card", id: "kpNotify", dir: "rtl" }, h("h2", {}, "🔔 یادآورِ ورزشِ گره‌ها"),
        h("p", { class: "small" }, "متنِ پیش‌فرضِ پیام خنثی است: «" + A.KREMIND_BODY + "» و یک پیوند — بی نامِ گره و بی متنِ نمونه."),
        cb("kpTg", "تلگرام", s.notify.telegram, function (kn, v) { kn.notify.telegram = v; }),
        cb("kpEm", "ایمیل", s.notify.email, function (kn, v) { kn.notify.email = v; }),
        cb("kpDet", "جزئیات در پیام: نامِ گره و صورتِ یک نمونهٔ تازه (هرگز پاسخ؛ برای گره‌های هیجانی و باورِ دربارهٔ خود هیچ‌وقت)", s.notify.detail, function (kn, v) { kn.notify.detail = v; }),
        h("div", { class: "kp-detch small", dir: "rtl", style: "margin-inline-start:1.6em" + (s.notify.detail ? "" : ";opacity:.55") },
          h("span", { class: "muted" }, "جزئیات در کدام کانال:"), " ",
          dcb("kpDetTg", "تلگرام", s.notify.detailTg, function (kn, v) { kn.notify.detailTg = v; }),
          dcb("kpDetEm", "ایمیل", s.notify.detailEm, function (kn, v) { kn.notify.detailEm = v; })),
        h("div", { class: "row gap wrap" }, h("label", { for: "kpHour", class: "small" }, "ساعتِ ارسال:"), hour, h("span", { class: "small muted" }, "منطقهٔ زمانی: " + tz())),
        live,
        cb("kpUnv", "نمایشِ نمونه‌های «وارسی‌نشدهٔ» هوش مصنوعی در جلسه (با برچسب؛ به معیار نمی‌روند)", s.showUnverified, function (kn, v) { kn.showUnverified = v; }));
      var detIn = sec.querySelector("#kpDet"), detBox = sec.querySelector(".kp-detch");
      if (detIn && detBox) detIn.addEventListener("change", function () { detBox.style.opacity = detIn.checked ? "" : ".55"; [].forEach.call(detBox.querySelectorAll("input"), function (x) { x.disabled = !detIn.checked; }); });
      root.insertBefore(sec, root.children[1] || null);
      return root;
    };
  }
})(APP);
