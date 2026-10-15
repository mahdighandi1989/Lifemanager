/* ===== «💡 جایگاهِ ایده»: ایده خودش یک موضوع است، با قوت، فرض، مسئله، گره و آنچه بیرون است (مالک ۲۰۲۶-۱۰-۱۵) =====
   مالک: «ایده‌ای دادم که بخوام بفهمم در چه جایگاهیه … چه مسائل و گره‌هایی داخلش هست و چه نقاطِ قوتی … ابهاماتِ معرفت‌شناسی … همه رو
   تشخیص و تجزیه و تفکیک کنه و همه رو از جاهای مختلف و لازم خودش بگذرونه … نه اینکه به همه چیز بله بگه بلکه همه چیز رو هوشمندانه بررسی کنه».
   کارزارِ v07: ایده خوب شکسته شد (گره، ادعا، یادگیری، پیش‌نیاز) ولی خودِ ایده هیچ‌جا «جایگاه» نداشت — قوت‌ها فقط در گفت‌وگو ماند.
   این بخش:
   - رکوردِ «idea»: حرفِ خودِ کاربر؛ قوت‌ها هر کدام با شاهد از حرفِ خودش؛ فرض‌ها (هر کدام ⇒ پروندهٔ سنجش در کارخانه)؛ مسئله‌های طراحی
     («چطور کار می‌کند / چطور سنجیده می‌شود» ⇒ بخشِ مسئله)؛ گره‌ها؛ پیش‌نیازها؛ بخش‌های بیرون از صفحه.
   - «جایگاه» عدد نیست: درجهٔ هر فرض از پروندهٔ خودش (یقین/ظن/شک/وهم)، فرضِ سنجیده‌نشده = شک (½، اصلِ بی‌مرجح A4)، و
     سقفِ اعتبارِ ایده = ضعیف‌ترین فرضِ لازم (قضیهٔ T_weakest از A1: «کل از جزء بیشتر نیست»). قوت‌ها سقف را بالا نمی‌برند؛ فقط می‌گویند
     چه چیزی ارزشِ آزمودن دارد. */
(function (A) {
  var S = A.S, fa = A.fa, h = A.h, AS = A.ASSIST;
  var I = A.IDEA = {};
  function nowIso() { return new Date().toISOString(); }
  function clip(x, n) { x = String(x == null ? "" : x).replace(/\s+/g, " ").trim(); return x.length > n ? x.slice(0, n - 1) + "…" : x; }
  var PARTS = { strength: "قوت", assumption: "فرضِ لازم", problem: "مسئلهٔ طراحی", outside: "بیرون از این صفحه" };
  I.PARTS = PARTS;

  /* درجهٔ یک ادعا در پروندهٔ کارخانه (همان درجه‌های جزوه — مرزها قضیه‌اند: ½ از A4 و ۱ از A2).
     ممیزیِ ۲۰۲۶-۱۰-۱۵ (A3): رقمِ فارسی/عربی خوانده می‌شود؛ ستونِ «احتمال صدق نهایی ٪» درصد است، پس ۰٫۵ یعنی نیم درصد — کسرِ ۰..۱ فقط وقتی که
     فیلد خودش کسری اعلام شده (frac)؛ ناعدد ⇒ null (هرگز TypeError). */
  function degNum(p, frac) {
    var n = A.parseNum ? A.parseNum(p) : (p == null || p === "" ? null : +p);
    if (n == null || isNaN(n)) return null;
    if (frac && n <= 1) n = n * 100;
    return Math.max(0, Math.min(100, n));
  }
  function degOf(p, frac) {
    var n = degNum(p, frac); if (n == null) return null;
    var D = (window.EPI_FOUND && window.EPI_FOUND.DEG) || [];
    var d = D.filter(function (x) { return n >= x.lo && n <= x.hi; })[0];
    return { p: n, fa: d ? d.fa : fa(Math.round(n)) + "٪" };
  }
  I.degOf = degOf;
  /* عددِ درصد برای نمایش: یک رقمِ اعشار، و هرگز «۱۰۰» برای کمتر از ۱۰۰ */
  function pctTxt(c, latin) { if (c == null) return "—"; if (c < 100 && Math.round(c) >= 100) c = 99.9; else c = Math.round(c * 10) / 10; return latin ? String(c) : A.faNum ? A.faNum(c) : fa(c); }
  I.pctTxt = pctTxt;
  function caseClaims(cs) { return ((cs.st && cs.st.st_tasdiq && cs.st.st_tasdiq.data && cs.st.st_tasdiq.data.claims) || []).map(function (r) { return (r.txt || "").trim(); }); }
  /* سقفِ موتورِ قطعیِ کارخانه برای همین تصدیق (کاربرگ‌ها ⇒ رمزگذاری روی رونوشت؛ چیزی ذخیره نمی‌شود) */
  function engineOf(cs, n) {
    var X = window.EPIX; if (!X || !A.casePrefill || !A.caseClaims) return null;
    try {
      var cp = JSON.parse(JSON.stringify(cs)); A.casePrefill(cp);
      var k = A.caseClaims(cp)[+n - 1]; if (!k) return null;
      var r = X.runClaim(k, A.btCfg ? A.btCfg() : X.DEFAULT_CFG());
      return { ceil: r.ceilx != null ? r.ceilx : r.ceil, bind: r.bind, f: k.f };
    } catch (e) { console.warn(e); return null; }
  }
  /* یقین (۱۰۰) فقط از برهان یا بدیهی/حضوری (s40؛ T_below1 برای بقیه) — اگر موتور سقفی نگذاشته ولی راه برهانی/بدیهی نیست، «کمتر از یقین» */
  function certainOk(f) {
    f = f || {};
    return f.way === "بدیهی (بی‌نیاز از راه)" || f.badihi === "اولی" || f.badihi === "وجدانی" || f.core === "هسته حضوری ناب" || (f.form === "معتبر (قیاسی)" && f.matter === "منتهی به بدیهی");
  }
  /* نقدهای بازی که این فرض را می‌زنند (هنوز با شاهد جواب نگرفته‌اند) */
  function openCrits(r, a) {
    if (!r || !a) return [];
    var as = (r.parts || []).filter(function (x) { return x.k === "assumption"; }), pi = (r.parts || []).indexOf(a), ai = as.indexOf(a);
    return (r.crits || []).filter(function (c) { return !(c.ans && c.ans.ev) && ((c.pi != null && +c.pi === pi) || (c.pi == null && c.target !== "" && c.target !== "new" && +c.target === ai)); });
  }
  I.openCrits = openCrits;
  /* درجهٔ فرض (ممیزیِ ۲۰۲۶-۱۰-۱۵، A1): (۱) همان تصدیقی از پرونده که فرض است (a.claim؛ پرونده با چند تصدیق ⇒ می‌پرسد)، و درجه = کمینهٔ «سقفِ موتورِ قطعی»
     و «درجهٔ نهاییِ خودِ تو» (T_weakest)؛ (۲) نتیجهٔ واقعیِ «نادرست» ⇒ فرض با مشاهده رد شده (امتناعِ تناقض، A0) ⇒ ۰؛ (۳) ۱۰۰ فقط با برهان/بدیهی؛
     (۴) نقدِ بازی که این فرض را می‌زند ⇒ «زیرِ نقد» و حداکثر ½ (A4) تا با شاهد جواب بگیرد. */
  I.assumptionGrade = function (a, r) {
    var cs = a && a.caseId ? S.get(a.caseId) : null, crit = openCrits(r, a);
    var g = gradeOf(a, cs);
    if (crit.length && !g.refuted && g.p > 50) { g.p = 50; g.fa = "شک (½) — زیرِ نقد: «" + clip(crit[crit.length - 1].t, 60) + "» (تا با شاهد جواب بگیرد، بی‌مرجح — A4)"; g.crit = true; }
    else if (crit.length && !g.refuted) { g.fa += " · زیرِ نقد: «" + clip(crit[crit.length - 1].t, 60) + "»"; g.crit = true; }
    return g;
  };
  function gradeOf(a, cs) {
    if (!cs) return { p: 50, fa: "شک (درست ½) — هنوز پرونده‌ای ندارد", open: true, why: "بی‌دلیل هیچ طرف مرجح نیست (A4)" };
    var claims = caseClaims(cs), fin = cs.st && cs.st.st_final;
    var rows = ((fin && fin.data && fin.data.final) || []).filter(function (x) { return x && x.c && x.p != null && x.p !== ""; });
    var cs0 = rows.map(function (x) { return String(x.c); }).filter(function (v, i, arr) { return arr.indexOf(v) === i; });
    var n = a.claim ? String(a.claim) : claims.length === 1 ? "1" : !claims.length && cs0.length === 1 ? cs0[0] : "";
    if (!n && claims.length > 1) return { p: 50, fa: "شک (½) — پرونده " + fa(claims.length) + " تصدیق دارد؛ بگو کدام همین فرض است", open: true, ask: true, claims: claims, caseId: cs.id };
    var outc = n ? (cs.outcome || {})[n] : null;
    if (outc === "نادرست") return { p: 0, fa: "رد شد با مشاهده — نتیجهٔ واقعیِ ثبت‌شده «نادرست» (فرض و نقیضِ مشاهده‌شده‌اش با هم درست نیستند — A0)", open: false, refuted: true, caseId: cs.id, claim: n };
    if (!fin || !fin.done || !rows.length) return { p: 50, fa: "شک (درست ½) — پرونده هنوز به حکم نرسیده", open: true, why: "تا حکم، بی‌دلیل هیچ طرف مرجح نیست (A4)", caseId: cs.id, claim: n };
    var row = rows.filter(function (x) { return String(x.c) === n; })[0];
    if (!row) return { p: 50, fa: "شک (½) — «حکم نهایی» برای این تصدیق درجه ندارد", open: true, caseId: cs.id, claim: n };
    var own = degNum(row.p);
    if (own == null) return { p: 50, fa: "شک (½) — درجهٔ «حکم نهایی» عدد نیست («" + clip(row.p, 20) + "»)", open: true, caseId: cs.id, claim: n };
    var eng = engineOf(cs, n), p = own, why = [];
    if (eng && eng.ceil < p) { p = eng.ceil; why.push("سقفِ موتورِ قطعی " + pctTxt(eng.ceil) + "٪ (درجهٔ خودت " + pctTxt(own) + "٪)"); }
    if (p >= 100 && !certainOk(eng && eng.f)) { p = 100 - ((window.EPI_FOUND && window.EPI_FOUND.EPS) || 0.1); why.push("یقین فقط از برهان یا بدیهی — این راه «کمتر از یقین» است (T_below1)"); }
    var d = degOf(p) || { fa: "" };
    return { p: p, fa: d.fa + " (" + pctTxt(p) + "٪)" + (why.length ? " — " + why.join("؛ ") : "") + (outc ? " · نتیجهٔ واقعی: " + outc : ""), open: false, caseId: cs.id, claim: n, own: own, engine: eng && eng.ceil };
  }
  /* سقفِ اعتبارِ ایده = کمینهٔ درجهٔ فرض‌های لازم (T_weakest) */
  I.standing = function (r) {
    var as = (r.parts || []).filter(function (x) { return x.k === "assumption"; });
    if (!as.length) return { cap: null, why: "هنوز هیچ فرضِ لازمی ثبت نشده؛ بی فرضِ روشن، جایگاه معلوم نیست" };
    var g = as.map(function (a) { return { a: a, g: I.assumptionGrade(a, r) }; }), w = g.slice().sort(function (x, y) { return x.g.p - y.g.p; })[0];
    return { cap: w.g.p, weakest: w.a, weakG: w.g, refuted: !!w.g.refuted, grades: g, open: g.filter(function (x) { return x.g.open; }).length, crit: g.filter(function (x) { return x.g.crit; }).length,
      why: "ایده فقط وقتی کار می‌کند که همهٔ فرض‌های لازمش درست باشد؛ پس اعتبارش از ضعیف‌ترینِ آن‌ها بیشتر نیست (کل از جزء بیشتر نیست — A1)" };
  };

  /* A2: آیا شاهد از حرف‌های خودِ کاربر در سشن برآمده؟ نقلِ مستقیم، یا دست‌کم سه‌چهارمِ واژه‌هایش در حرفِ کاربر و هیچ عددی که کاربر نگفته */
  function norm(t) { return String(t || "").replace(/[‌‎‏]/g, " ").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[«»"'.,،:؛!?؟()\[\]\-—…]/g, " ").replace(/\s+/g, " ").trim(); }
  function digits(t) { return String(t).replace(/[۰-۹]/g, function (c) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(c); }).replace(/[٠-٩]/g, function (c) { return "٠١٢٣٤٥٦٧٨٩".indexOf(c); }); }
  I.evFromUser = function (ev, s) {
    var U = norm(digits(((s && s.msgs) || []).filter(function (m) { return m && m.role === "user"; }).map(function (m) { return m.text; }).join(" \n "))), E = norm(digits(ev));
    if (!E || !U) return false;
    if (U.indexOf(E) >= 0) return true;
    var nums = E.match(/\d+/g) || [];
    if (nums.some(function (d) { return !new RegExp("(^|\\D)" + d + "(\\D|$)").test(U); })) return false;
    var toks = E.split(" ").filter(function (w) { return w.length >= 2; }); if (!toks.length) return false;
    var Us = " " + U + " ", hit = toks.filter(function (w) { return Us.indexOf(" " + w + " ") >= 0; }).length;
    return hit / toks.length >= 0.75;
  };
  /* A5: قلّابِ پرامپت فقط برای حرفی که واقعاً ایده است — «مطرح کردم»، «محصولات لبنی»، «برنامه‌ای که دکتر داد»، «طرحِ درس» نه؛
     «راه بیندازم»، «کانال بزنم»، «یک فکری دارم» آری (واژه با مرزِ حرفِ فارسی، نه زیررشته) */
  I.ideaRe = /(?:^|[^؀-ۿ‌])(?:ایده|استارت[\s‌]?(?:آپ|اپ)|کسب[\s‌]?و[\s‌]?کار|اپلیکیشن)|راه[\s‌]?(?:بیندازم|بندازم|اندازی کنم)|(?:کانال|پیج|سایت|فروشگاه|کارگاه|مغازه|شرکت)[^.؟!?\n]{0,40}?(?:بزنم|بسازم|باز کنم|تأسیس کنم)|(?:یک|یه)?[\s‌]?فکری (?:دارم|به سرم زده)|طرحی دارم|(?:یک|یه) طرح(?:ی)? (?:دارم|برای کسب)|محصولی (?:بسازم|بفروشم|تولید کنم)/;
  /* ---------- کارهای دستیار (فقط از حرفِ خودِ کاربر) ---------- */
  if (AS && AS.DO) {
    AS.DO.idea_new = function (a) {
      var s = AS._turnSession, what = clip(a && a.what, 600);
      if (!what) return "ایده ثبت نشد: «what» (عینِ حرفِ کاربر) لازم است";
      var r = { id: A.uid("idea"), type: "idea", what: what, title: clip((a && a.title) || what, 80), parts: [], sess: (s && s.id) || "", created: nowIso() };
      S.put(r); if (s) s.idea = r.id; return "";
    };
    /* {"do":"idea_add","part":"strength|assumption|problem|outside","t":"…","ev":"شاهد از حرفِ کاربر"} */
    AS.DO.idea_add = function (a) {
      var s = AS._turnSession, r = S.get((a && a.id) || (s && s.idea) || "");
      if (!r || r.type !== "idea") return "اول ایده را با idea_new ثبت کن";
      var k = a && a.part, t = clip(a && a.t, 300);
      if (!PARTS[k] || !t) return "بخشِ ایده باید strength، assumption، problem یا outside باشد و متن داشته باشد";
      if (k === "strength" && !clip(a.ev, 300)) return "قوت بی شاهد ثبت نمی‌شود: «ev» = شاهد از حرفِ خودِ کاربر";
      if ((r.parts || []).some(function (x) { return x.k === k && x.t === t; })) return "";
      var part = { k: k, t: t, ev: clip(a.ev, 300), test: clip(a.test, 300), at: nowIso(), by: "assistant" };
      /* A2 (ممیزیِ ۲۰۲۶-۱۰-۱۵): شاهدِ قوت باید از حرف‌های خودِ کاربر در همین سشن برآمده باشد (نقل یا هم‌پوشانیِ واژه‌ها، و هیچ عددی که کاربر نگفته)؛
         وگرنه «از دستیار — تأییدِ تو لازم» تا خودِ کاربر تأیید کند */
      if (k === "strength") part.evSt = I.evFromUser(part.ev, s) ? "user" : "unconfirmed";
      (r.parts = r.parts || []).push(part); S.put(r);
      return part.evSt === "unconfirmed" ? "قوت ثبت شد ولی شاهدش در حرف‌های کاربر پیدا نشد؛ «از دستیار — تأییدِ تو لازم» ماند تا خودش تأیید کند (عینِ جملهٔ کاربر را در ev بیاور)" : "";
    };
    /* فرض ⇐ پروندهٔ کارخانه؛ مسئلهٔ طراحی ⇐ مسئله */
    AS.DO.idea_link = function (a) {
      var s = AS._turnSession, r = S.get((a && a.id) || (s && s.idea) || ""), i = +(a && a.i);
      if (!r || r.type !== "idea" || !(r.parts || [])[i]) return "پیوند ثبت نشد: شمارهٔ بخش (i) نادرست است";
      var x = r.parts[i], rec = S.get((a && a.rec) || "");
      if (!rec) return "پیوند ثبت نشد: رکورد پیدا نشد";
      if (x.k === "assumption" && rec.type === "case") {
        /* A1: کدام تصدیقِ پرونده همین فرض است (claim = شمارهٔ تصدیق، از ۱)؛ پروندهٔ چندتصدیقی بی آن ⇒ پیوند ثبت می‌شود ولی درجه «شک» می‌ماند تا کاربر بگوید */
        var cl = caseClaims(rec), cn = a && a.claim != null && a.claim !== "" ? (A.parseNum ? A.parseNum(a.claim) : +a.claim) : null, ci = cn == null ? "" : String(cn);
        if (ci && !(cn >= 1 && cn <= cl.length && cn === Math.round(cn))) return "پیوند ثبت نشد: پرونده تصدیقِ شمارهٔ " + ci + " ندارد";
        x.caseId = rec.id; if (ci) x.claim = ci; else delete x.claim;
        if (!ci && cl.length > 1) { S.put(r); return "پیوند ثبت شد، ولی پرونده " + cl.length + " تصدیق دارد؛ با «claim» بگو کدام همین فرض است (تا آن وقت درجه‌اش «شک» می‌ماند و صفحه از کاربر می‌پرسد)"; }
      }
      else if (x.k === "problem" && (rec.type === "eprob" || rec.type === "prereq")) x.recId = rec.id;
      else return "فرض فقط به پروندهٔ سنجش و مسئلهٔ طراحی فقط به مسئله یا نقشهٔ پیش‌نیاز وصل می‌شود";
      S.put(r); return "";
    };
    var RULES = [
      "# ایده («💡 جایگاهِ ایده»)",
      "- اگر کاربر «ایده» آورد (نه فقط گیر یا مسئله) و می‌خواهد بداند کجا ایستاده، آن را رد نکن و تأییدِ کور هم نکن: با {\"do\":\"idea_new\",\"what\":\"عینِ حرفش\"} ثبتش کن و بعد بخش‌هایش را یکی‌یکی با idea_add بگذار:",
      "  · strength (قوت) فقط با «ev» = عینِ جملهٔ خودِ کاربر در همین گفت‌وگو؛ تعریفِ خالی یا شاهدِ ساختگی قوت نیست (شاهدی که در حرفش نیست «تأییدنشده» می‌ماند).",
      "  · assumption = هر چیزی که باید درست باشد تا ایده کار کند («همه نیاز دارند»، «پول می‌دهند»، «بقیه مثلِ من‌اند») — هر فرضِ اصلی یک پروندهٔ سنجش در کارخانه می‌گیرد (وجهِ claim ِ تور) و با idea_link وصل می‌شود (اگر پرونده چند تصدیق دارد، «claim» = شمارهٔ همان تصدیق).",
      "  · problem = پرسشِ طراحیِ «چطور کار می‌کند / چطور سنجیده می‌شود / چطور ساخته می‌شود» — این «یادگیری» نیست، مسئله است: وجهِ problem (بخشِ مسئله) و اگر دانشی کم است، نقشهٔ پیش‌نیاز؛ با idea_link وصلش کن.",
      "  · outside = بازار، قانون، سرمایه، … — یک بار نام ببر، هر نوبت تکرار نکن.",
      "- گره‌هایی که جلوی ایده را می‌گیرند (مثلاً رها کردن پس از ایراد) وجهِ knot ِ تورند، مثلِ همیشه.",
      "- به ایده نمره نده. جایگاهش را صفحه از درجهٔ فرض‌ها می‌سازد: سقفِ اعتبار = ضعیف‌ترین فرضِ لازم؛ فرضِ سنجیده‌نشده = شک (½). اگر کاربر نمره خواست، همین را بگو و او را به «💡 جایگاهِ ایده» ببر."
    ].join("\n");
    /* فقط وقتی به کار است در پرامپت می‌آید — پرامپتِ سامانه سقفِ ۲۰ هزار نویسهٔ سرور را دارد (test_assist) */
    AS.promptHooks = AS.promptHooks || [];
    AS.promptHooks.push(function (s, msg) { var recent = [String(msg || "")].concat(((s && s.msgs) || []).filter(function (m) { return m.role === "user"; }).slice(-6).map(function (m) { return m.text; })).join(" "); return ((s && s.idea) || I.ideaRe.test(recent)) ? RULES : ""; });
    AS.promptHooks = AS.promptHooks || [];
    AS.promptHooks.push(function (s) {
      var r = s && s.idea ? S.get(s.idea) : null; if (!r) return "";
      var st = I.standing(r);
      return "# ایدهٔ این سشن (" + r.id + ")\n«" + clip(r.what, 200) + "»\n" + (r.parts || []).map(function (x, i) { return i + ") [" + x.k + "] " + clip(x.t, 120) + (x.ev ? " — شاهد: " + clip(x.ev, 80) + (x.evSt === "unconfirmed" ? " (تأییدنشده)" : x.evSt === "rejected" ? " (کاربر رد کرد)" : "") : "") + (x.caseId ? " — پرونده: " + x.caseId + (x.claim ? "/تصدیقِ " + x.claim : "") + " (" + I.assumptionGrade(x, r).fa + ")" : "") + (x.recId ? " — رکورد: " + x.recId : ""); }).join("\n") +
        "\nسقفِ اعتبار: " + (st.cap == null ? "— (" + st.why + ")" : pctTxt(st.cap, true) + "٪ (ضعیف‌ترین فرض: «" + clip(st.weakest.t, 60) + "»" + (st.refuted ? " — با مشاهده رد شد" : "") + ")");
    });
  }

  /* ---------- نما ---------- */
  A.V.idea = function () {
    var r = S.get(A.state.arg), root = h("div", { class: "page idea", dir: "rtl" });
    root.appendChild(A.head("نقشه‌ها", "💡 جایگاهِ ایده", "ایده‌ات تکه‌تکه: قوت‌ها با شاهد، فرض‌های لازم و درجهٔ هر کدام، مسئله‌های طراحی، و آنچه بیرون از این صفحه است."));
    var all = S.all("idea").sort(function (a, b) { return String(b.created).localeCompare(String(a.created)); });
    if (!r || r.type !== "idea") {
      root.appendChild(all.length ? h("ul", { class: "plain" }, all.map(function (x) { return h("li", {}, h("button", { class: "linkish", type: "button", onclick: function () { A.go("idea", x.id); } }, "💡 " + x.title)); })) :
        h("p", { class: "card soft" }, "هنوز ایده‌ای ثبت نشده. ایده‌ات را به «💬 دستیار» بگو؛ آن را تکه‌تکه می‌کند و هر تکه را به بخشِ خودش می‌برد."));
      return root;
    }
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "ایده"), h("p", {}, "«" + r.what + "»")));
    var st = I.standing(r);
    root.appendChild(h("section", { class: "card idea-standing" }, h("h2", {}, "جایگاه"),
      st.cap == null ? h("p", { class: "muted" }, st.why) : h("div", {},
        st.refuted ? h("p", { class: "bad idea-refuted" }, h("b", {}, "سقفِ اعتبارِ ایده: ۰ — "), "فرضِ لازمِ «" + st.weakest.t + "» با مشاهده رد شد (نتیجهٔ واقعیِ پرونده‌اش «نادرست» است). ایده به این شکل کار نمی‌کند؛ بپرس کدام تکه‌اش باید عوض شود.")
          : h("p", {}, h("b", {}, "سقفِ اعتبارِ ایده: "), (degOf(st.cap) || {}).fa + " (" + pctTxt(st.cap) + "٪) — از ضعیف‌ترین فرض: «" + st.weakest.t + "»."),
        h("p", { class: "small muted" }, st.why + ". " + (st.open ? fa(st.open) + " فرض هنوز سنجیده نشده و تا سنجیده نشود «شک» (½) شمرده می‌شود. " : "") + (st.crit ? fa(st.crit) + " فرض زیرِ نقد است و تا نقد با شاهد جواب نگیرد بیش از «شک» (½) شمرده نمی‌شود. " : "") + "درجهٔ هر فرض = کمینهٔ «سقفِ موتورِ قطعیِ کارخانه» و «درجهٔ نهاییِ خودت» برای همان تصدیق. قوت‌ها این سقف را بالا نمی‌برند؛ می‌گویند چه چیزی ارزشِ آزمودن دارد."))));
    Object.keys(PARTS).forEach(function (k) {
      var xs = (r.parts || []).map(function (x, i) { return { x: x, i: i }; }).filter(function (o) { return o.x.k === k; });
      root.appendChild(h("section", { class: "card idea-" + k }, h("h2", {}, PARTS[k] + " (" + fa(xs.length) + ")"), xs.length ? h("ul", {}, xs.map(function (o) {
        var x = o.x, g = k === "assumption" ? I.assumptionGrade(x, r) : null;
        return h("li", { class: x.evSt === "rejected" ? "muted idea-evrej" : null }, x.evSt === "rejected" ? h("s", {}, x.t) : x.t, x.ev ? h("div", { class: "small muted" }, "شاهد: «" + x.ev + "»") : null, k === "strength" ? evConfirm(r, x, o.i) : null, x.test ? h("div", { class: "small" }, "چه آن را می‌آزماید: " + x.test) : null,
          g ? h("div", { class: "small idea-grade" + (g.refuted ? " bad" : "") }, "درجه: " + g.fa, g.caseId ? h("button", { class: "linkish", type: "button", onclick: function () { A.go("e_case", g.caseId); } }, " ↗ پرونده") : null) : null,
          g && x.caseId && S.get(x.caseId) && caseClaims(S.get(x.caseId)).length > 1 ? claimPick(r, x, o.i, caseClaims(S.get(x.caseId)), g.ask) : null,
          x.recId ? h("button", { class: "linkish small", type: "button", onclick: function () { var q = S.get(x.recId); if (q && q.type === "eprob") A.go("e_prob", q.p && q.p.id); else if (q) A.go("prereq", q.id); } }, "↗ " + (S.get(x.recId) || {}).type) : null);
      })) : h("p", { class: "small muted" }, "—")));
    });
    /* R4 — تصمیمِ مالک (۲۰۲۶-۱۰-۱۵؛ «موافقم»): ایده پس از نخستین نقد رها نمی‌شود و کورکورانه هم تأیید نمی‌شود. نقد ⇐ کدام فرض را می‌زند ⇐
       «🌱 کوچک‌ترین گامِ بعد» که نقد را می‌آزماید (روزِ موعد برمی‌گردد؛ a36) ⇐ «حدس‌های رقیب» دربارهٔ سرنوشتِ ایده، هر کدام با آزمونش (کد). */
    root.appendChild(critSec(r));
    if (A.willCard) {
      var hs = A.willHost && A.willHost("idea", r.id);
      if (hs) {
        /* A4: گامِ 🌱 ثبت می‌کند کدام نقد/فرض را می‌آزماید (آخرین نقدِ بی‌پاسخ؛ وگرنه ضعیف‌ترین فرض) */
        var cr = (r.crits || []), ci = -1; for (var q = cr.length - 1; q >= 0; q--) if (!(cr[q].ans && cr[q].ans.ev)) { ci = q; break; }
        var c0 = ci >= 0 ? cr[ci] : null, ta = c0 ? critTarget(r, c0) : st.weakest;
        hs.tests = c0 ? { crit: ci, t: c0.t, target: ta ? ta.t : "", change: c0.change || "" } : ta ? { target: ta.t } : null;
        root.appendChild(A.willCard(hs, cr.length ? "crit" : "idea",
          c0 ? "نقد را شنیدی («" + clip(c0.t, 80) + "»" + (ta ? " ⇐ فرضِ «" + clip(ta.t, 60) + "»" : "") + "). رها کردن و پذیرفتنِ کور هر دو آسان‌اند؛ کوچک‌ترین گامی که همین نقد را می‌آزماید چیست؟"
            : cr.length ? "نقدها با شاهد جواب گرفته‌اند؛ کوچک‌ترین گامی که ضعیف‌ترین فرضِ مانده را می‌آزماید چیست؟" : "ایده با فکر کردن جلو نمی‌رود؛ کوچک‌ترین گامی که ضعیف‌ترین فرضش را می‌آزماید چیست؟"));
      }
    }
    if (A.solveKitUI) {
      r.kit = r.kit || A.solveBlankKit();
      root.appendChild(A.solveKitUI(r.kit, { idp: "ideaK", parts: ["rivals", "table", "ana"], noDim: true, title: "حدس‌های رقیب دربارهٔ این ایده (و نقدش)",
        intro: "دست‌کم دو حدس دربارهٔ این‌که چه پیش می‌آید یا چرا نقد درست/نادرست است — هر کدام با آزمونی که می‌تواند ردش کند — و این‌که کدام را اول بیازمایی. موردهایی که دیده‌ای (مثلاً هر گفت‌وگو و نتیجه‌اش) را در جدول بنویس.",
        rivTitle: "حدس‌های رقیب", rivHint: "مثلاً «مشتری برای این پول می‌دهد» در برابرِ «فقط تعریف می‌کنند و پول نمی‌دهند» — آزمونِ هر کدام چیست؟",
        tableTitle: "موردهایی که دیده‌ای", tableHint: "x = شمارهٔ مورد (۱، ۲، ۳ …)، y = نتیجه به عدد اگر هست (مثلاً «حاضر است بپردازد؟» ۱/۰، یا مبلغ). کد الگو و تفاضل‌ها را نشان می‌دهد.",
        anaLabel: "ایدهٔ آشنای مشابهی (از کارِ خودت یا دیگران) سراغ داری؟ چه شد؟",
        onCheck: function () { S.put(r); } }));
      root.lastChild.addEventListener("change", function () { S.put(r); });
    }
    return root;
  };
  /* فرضی که یک نقد می‌زند (پیوندِ تازه با شمارهٔ بخش pi؛ نقدهای پیشین با شمارهٔ فرض در فهرستِ فرض‌ها) */
  function critTarget(r, c) {
    var as = (r.parts || []).filter(function (x) { return x.k === "assumption"; });
    if (c.pi != null && (r.parts || [])[+c.pi] && r.parts[+c.pi].k === "assumption") return r.parts[+c.pi];
    return c.target !== "" && c.target !== "new" && as[+c.target] ? as[+c.target] : null;
  }
  /* A2: قوتی که دستیار ثبت کرده و شاهدش در حرفِ کاربر پیدا نشد — فقط خودِ کاربر تأییدش می‌کند (data-own: دستیار نمی‌زندش) */
  function evConfirm(r, x, i) {
    if (x.evSt !== "unconfirmed") return x.evSt === "rejected" ? h("div", { class: "small muted" }, "این شاهد را تو حرفِ خودت ندانستی (کنار رفت؛ در ایده نمی‌آید).") : null;
    return h("div", { class: "small idea-evask", "data-own": "1", dir: "rtl" }, h("span", { class: "chip warn" }, "از دستیار — تأییدِ تو لازم"), " ",
      h("button", { class: "btn sm idea-evok", type: "button", onclick: function () { x.evSt = "user"; x.evOkAt = nowIso(); S.put(r); A.render(); } }, "تأیید: این را خودم گفته‌ام"), " ",
      h("button", { class: "btn ghost sm idea-evno", type: "button", onclick: function () { x.evSt = "rejected"; x.evNoAt = nowIso(); S.put(r); A.render(); } }, "نه، این حرفِ من نیست"));
  }
  /* A1: پروندهٔ چندتصدیقی ⇒ کاربر می‌گوید کدام تصدیق همین فرض است */
  function claimPick(r, x, i, claims, ask) {
    var id = "ideaClaim_" + i;
    return h("div", { class: "col idea-claimpick", "data-own": "1", dir: "rtl" }, h("label", { for: id, class: "small" + (ask ? " bad" : "") }, "این فرض کدام تصدیقِ پرونده است؟"),
      h("select", { id: id, style: { maxWidth: "100%" }, onchange: function (e) { if (e.target.value) x.claim = e.target.value; else delete x.claim; S.put(r); A.render(); } }, h("option", { value: "" }, "— انتخاب کن —"),
        claims.map(function (t, j) { var v = String(j + 1); return h("option", { value: v, selected: String(x.claim || "") === v }, fa(j + 1) + ". " + clip(t, 70)); })));
  }
  /* نقد یا ایرادی که شنیدی ⇒ کدام فرض را می‌زند ⇒ اگر درست باشد چه چیزِ ایده عوض می‌شود (به قلمِ خودت).
     A4 (ممیزیِ ۲۰۲۶-۱۰-۱۵): «فرضی که هنوز ننوشته‌ام» همان فرض را می‌سازد (به قلمِ خودت)؛ نقدِ بی‌پاسخ فرضش را «زیرِ نقد» (حداکثر ½) نگه می‌دارد تا با شاهد جواب بگیرد. */
  function critSec(r) {
    var as = (r.parts || []).filter(function (x) { return x.k === "assumption"; }), d = { t: "", target: "", change: "", nt: "" };
    var sec = h("section", { class: "card idea-crit", dir: "rtl", "data-own": "1" }, h("h2", {}, "نقد و ایراد (" + fa((r.crits || []).length) + ")"),
      h("p", { class: "small" }, "نقدی که شنیدی یا ایرادی که خودت دیدی را بنویس. نقد نه حکمِ پایان است نه حمله؛ داده‌ای است دربارهٔ یکی از فرض‌ها — آن فرض را پیدا کن و بیازما. تا نقد با شاهد جواب نگرفته، فرضش «زیرِ نقد» است."));
    (r.crits || []).forEach(function (c, ci) {
      var ta = critTarget(r, c), row = h("div", { class: "small idea-critrow" }, "«" + c.t + "» ⇐ " + (ta ? "فرضِ «" + ta.t + "»" : c.target === "new" ? "فرضی که هنوز ننوشته بودی" : "—") + (c.change ? " · اگر درست باشد: " + c.change : "") + " · " + A.fdate(String(c.at).slice(0, 10)));
      if (c.ans && c.ans.ev) row.appendChild(h("div", { class: "good idea-critans" }, "جواب با شاهد: «" + c.ans.ev + "» (" + A.fdate(String(c.ans.at).slice(0, 10)) + ")"));
      else if (ta) {
        var aid = "ideaCritAns_" + ci, av = { ev: "" };
        row.appendChild(h("div", { class: "col idea-critansf" }, h("span", { class: "chip warn" }, "زیرِ نقد"),
          h("label", { for: aid }, "جوابِ این نقد با شاهد: چه دیدی یا آزمودی که آن را جواب داد؟"),
          h("input", { id: aid, type: "text", placeholder: "مثلاً «۳ نفر از ۵ نفر پیش‌پرداخت دادند»", oninput: function (e) { av.ev = e.target.value; } }),
          h("button", { class: "btn sm idea-critanssave", type: "button", onclick: function () {
            if (!String(av.ev).trim()) { A.toast("شاهد را بنویس — جوابِ بی‌شاهد نقد را نمی‌بندد.", "bad"); return; }
            c.ans = { ev: clip(av.ev, 300), at: nowIso() }; S.put(r); A.render();
          } }, "ثبتِ جواب")));
      }
      sec.appendChild(row);
    });
    var t = h("textarea", { id: "ideaCritT", rows: 2, placeholder: "مثلاً «کسی برای این پول نمی‌دهد»", oninput: function (e) { d.t = e.target.value; } });
    var nw = h("div", { class: "col hidden idea-critnew" });
    var sel = h("select", { id: "ideaCritA", style: { maxWidth: "100%" }, onchange: function (e) { d.target = e.target.value; nw.classList.toggle("hidden", d.target !== "new"); } }, h("option", { value: "" }, "—"), as.map(function (a, i) { return h("option", { value: String(i) }, a.t); }), h("option", { value: "new" }, "فرضی که هنوز ننوشته‌ام"));
    var ntI = h("input", { id: "ideaCritNew", type: "text", placeholder: "مثلاً «مشتری‌ها هر هفته وقتِ تحویل گرفتن دارند»", oninput: function (e) { d.nt = e.target.value; } });
    nw.appendChild(h("label", { for: "ideaCritNew" }, "آن فرض را بنویس (چه چیزی باید درست باشد تا ایده کار کند؟)")); nw.appendChild(ntI);
    var ch = h("input", { id: "ideaCritC", type: "text", placeholder: "چه چیزِ ایده باید عوض شود؟", oninput: function (e) { d.change = e.target.value; } });
    sec.appendChild(h("div", { class: "col" }, h("label", { for: "ideaCritT" }, "نقد یا ایرادی که شنیدی (یا دیدی)"), t));
    sec.appendChild(h("div", { class: "col" }, h("label", { for: "ideaCritA" }, "این نقد کدام فرضِ لازمِ ایده را می‌زند؟"), sel));
    sec.appendChild(nw);
    sec.appendChild(h("div", { class: "col" }, h("label", { for: "ideaCritC" }, "اگر نقد درست باشد، چه چیزِ ایده عوض می‌شود؟ (نه «همه‌اش»)"), ch));
    sec.appendChild(h("button", { class: "btn sm idea-critsave", type: "button", onclick: function () {
      if (!String(d.t).trim()) { A.toast("نقد را بنویس.", "bad"); return; }
      if (!d.target) { A.toast("بگو کدام فرض را می‌زند (یا «فرضی که هنوز ننوشته‌ام»).", "bad"); return; }
      if (d.target === "new" && !String(d.nt).trim()) { A.toast("فرضِ تازه را بنویس — نقد باید به فرضی برسد.", "bad"); return; }
      var c = { t: clip(d.t, 400), target: d.target, change: clip(d.change, 300), at: nowIso() };
      r.parts = r.parts || [];
      if (d.target === "new") {
        r.parts.push({ k: "assumption", t: clip(d.nt, 300), at: nowIso(), by: "user", from: "crit" });
        c.pi = r.parts.length - 1; c.target = String(r.parts.filter(function (x) { return x.k === "assumption"; }).length - 1); c.made = true;
      } else { var ta = as[+d.target]; if (ta) c.pi = r.parts.indexOf(ta); }
      (r.crits = r.crits || []).push(c); S.put(r); A.render();
    } }, "ثبتِ نقد"));
    return sec;
  }
  A.VIEW_META = A.VIEW_META || {};
  A.VIEW_META.idea = { j: "ws", what: "جایگاهِ ایده: قوت‌ها با شاهد، فرض‌های لازم (هر کدام با پروندهٔ سنجش و درجه‌اش)، مسئله‌های طراحی، بیرون از صفحه؛ سقفِ اعتبار = ضعیف‌ترین فرض (A1). نمره ندارد. نقد ⇐ فرضی که می‌زند ⇐ «🌱 کوچک‌ترین گامِ بعد» (وارسی در روزِ موعد) و «حدس‌های رقیب» با آزمون (کد)." };
  if (A.GRAPH && A.GRAPH.MAPS && !A.GRAPH.MAPS.some(function (x) { return x.v === "idea"; })) A.GRAPH.MAPS.push({ v: "idea", fa: "💡 جایگاهِ ایده", what: "ایده‌هایت تکه‌تکه، با سقفِ اعتبار از ضعیف‌ترین فرض" });
})(APP);
