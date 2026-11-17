/* ===== «🧪 پروندهٔ تمرینِ باز» — یک پرونده برای هر (تکنیک × موضوع)، پایداری از شاهدِ تاریخ‌دارِ خودِ تکنیک (دورِ ۱۹c؛ LT2 LT3 LT5 LT6 LT7) =====
   مالک (۲۰۲۶-۱۰-۱۷، نقشهٔ راه §۱۳): «خیلی از تکنیک‌ها فقط با برگشتن در روزها و هفته‌ها کار می‌کنند و پرونده تا تثبیتِ مهارت یا باور باز می‌ماند».
   ممیزیِ طولی (۴۵ تکنیک): هر کاربرگ رکوردی تازه و بی‌پیوند بود (ex)، «تسلط» تلاش‌های همان روز را می‌شمرد و هیچ تکنیکی معیارِ خروج نداشت.
   این فایل سامانهٔ موازی نیست؛ پرونده‌ای است که همان رکوردهای موجود را به هم می‌دوزد:
   • LT2 رکوردِ «practice» برای هر (تکنیک × موضوع: مسئلهٔ زنده / پروندهٔ معرفتی / گره / موضوع / آزاد) با جلسه‌های تاریخ‌دار، نتیجهٔ سنجیده، وضع
     open|stabilising|stable|paused|closed و تاریخچه. ذخیرهٔ هر کاربرگ (کتابخانه، دوره، سفر، گره) از همان قلابِ A.onExDone پرونده را می‌سازد یا ادامه می‌دهد
     (هرگز دوتا؛ تکرارِ همان روز یک جلسه است). شروع از صفحهٔ مسئله، پرونده، گره (هر ۴۵ تکنیک، از جمله ۱۵ تکنیکی که پیش‌تر از گره نمی‌آمدند)، دوره و
     کنشِ دستیار start_practice (فقط پس از «آری» یا خواستهٔ صریحِ خودِ کاربر).
   • LT3 پایداری از شاهدِ خودِ تکنیک: فاصله‌ها از متنِ خودِ تکنیک (PR.POLICY — هر سطر نقلِ عینیِ dose/ws دارد و آزمون می‌سنجد که در متن هست)؛
     قاعدهٔ فاصله‌گذاریِ گره (A.kmastery: ≥۲ نوبت با فاصلهٔ ≥۳ روز، ≥۳ شکل، بدلی؛ آزمایش: ≥۳ آزمایشِ کامل در ≥۱۴ روز) دوباره به کار رفته؛
     کالیبراسیون در روزهای جدا؛ بازیابی در فاصلهٔ بلندتر. سنجیده بر خودارزیابی مقدم است. «تثبیت شد» با شاهدهای تاریخ‌دار و وارسیِ ماندگاری در پلهٔ بعد؛
     شکست در وارسی «تثبیت شد» را با تاریخ و دلیل پس می‌گیرد. «تثبیت شد» ِ بی‌شاهد فقط «ادعای خودت» است. A.mastery دیگر تکرارِ یک روز را نمی‌شمرد؛
     راهِ شمارشیِ قدیم قرنطینه است (A.masteryCountOnly).
   • LT5 یک رکورد برای هر کار: ردیفِ T24 ⇄ 🎯 fcast (و اطمینانِ کارت در دفترِ کالیبراسیون یک بار)، T21 ⇄ آزمایشِ گره (kexp) و گامِ مسئلهٔ زنده،
     T22 ⇄ پروندهٔ معرفتی (revdate و نتیجه)، T9 ⇄ fcast، T41 ⇄ چرخهٔ ۱-۳-۷ ِ P3. صفحهٔ تکنیک خودِ رکوردِ تاریخ‌دار را باز می‌کند، نه رونوشت.
   • LT6 پیوند به مسئله/پرونده/گره (با شناسه؛ نامِ تازه همان لحظه)، در صفحهٔ مسئلهٔ زنده (و «📜 پرونده» اگر هست)، و نتیجه به خودِ مسئله برمی‌گردد
     («حدس رد شد» / «تأیید در n آزمون» — تأیید اثبات نیست؛ مسئله باز می‌ماند).
   • LT7 فهرست‌های جاری به‌شکلِ پرونده با kind: "list": فرض‌ها (T15)، قفسهٔ مدل‌ها با شمارِ کاربست (T16)، «اشتباهاتِ فکری من» (T31/T34، یکی)،
     باورها (T34)، ابهام‌های باز (T35)، پارتو (T3)، سیگنال/نویز (T10) — با مرورِ دوره‌ای به آهنگِ خودِ تکنیک.
   موعدها از A.SCHED می‌گذرند (a40_sched.js: register/unregister/due)؛ اگر نبود، همین فایل سطرهای «امروز» را خودش می‌دهد (یک بار، نه دو). */
(function (A) {
  if (!A.S || !A.V) return;
  var h = A.h, fa = A.fa, S = A.S, PR = A.PR = A.PR || {};
  function nowISO() { return A.nowISO ? A.nowISO() : new Date().toISOString(); }   /* دورِ ۲۰ (RO7، A11): ساعتِ صفحه (A.now)، نه ساعتِ واقعی */
  function today() { return A.today(); }
  function clip(x, n) { x = String(x == null ? "" : x).replace(/\s+/g, " ").trim(); return x.length > n ? x.slice(0, n - 1) + "…" : x; }
  function dg(s) { return String(s == null ? "" : s).replace(/[۰-۹]/g, function (c) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(c); }).replace(/[٠-٩]/g, function (c) { return c.charCodeAt(0) - 0x660; }); }
  function norm(s) { return dg(s).replace(/[ي]/g, "ی").replace(/[ك]/g, "ک").replace(/[‌‏‎]/g, " ").replace(/[«»"'.,،!؟?:؛;()\-–—]/g, " ").replace(/\s+/g, " ").trim().toLowerCase(); }
  function num(v) { if (v == null || v === "") return null; var x = parseFloat(dg(v).replace(/[٪%,]/g, "").trim()); return isNaN(x) ? null : x; }
  function add(d, n) { return A.addDays(d, n); }
  function gap(a, b) { return A.daysBetween(a, b); }
  function byD(a, b) { return String(a.d || "").localeCompare(String(b.d || "")) || String(a.at || "").localeCompare(String(b.at || "")); }
  function own(r) { return r && !r.sample && !r.tourRun; }
  function fdate(d) { return d ? (A.fdate ? A.fdate(d) : d) : ""; }

  /* ---------- آهنگِ هر تکنیک — از متنِ خودِ آن (cite = نقلِ عینی از dose یا برچسبِ کاربرگ؛ tests/test_tour1_r19c_practice.js می‌سنجد) ----------
     shape: steps (بازسازی در روزهای ثابت از آغاز) · window (بازگشت در بازه) · every (آهنگِ تکرار) · exp (آزمون/آزمایش) · calib (پیش‌بینی‌های داوری‌شده)
            verdict (حکم و بازبینی پس از نتیجه) · cards (کارت‌های SM-2) · fcast (تخمینِ تاریخ‌دار در 🎯) · recur (تکرارِ مشکل) · list (فهرستِ جاری)
            once (یک‌باره برای هر نمونه) · habit (عادتِ هر جلسه، بی موعدِ جدا)
     checkin: فاصلهٔ وارسیِ ماندگاری پس از «تثبیت شد» — از متنِ تکنیک اگر گفته (T41 «برگه سفید هفتگی»، T28 «۱ هفته»)، وگرنه پلهٔ بعدیِ نردبانِ خودِ صفحه
     (A.knextIv ِ گره‌گشا: ۱، ۳، ۷، ۲۱، ۶۰) پس از آخرین فاصله — عددِ تازه‌ای ساخته نمی‌شود. */
  var P = PR.POLICY = {
    1: { shape: "every", every: 7, crit: "rep", cite: "هفته‌ای ۱ تا ۲ بار" },
    2: { shape: "habit", cite: "بازنگری درخت تجزیه پس از هر ۳–۵ جلسه" },
    3: { shape: "list", list: "pareto", cite: "بازبینی ماهانه با داده واقعی" },
    4: { shape: "steps", steps: [3, 7], crit: "steps", cite: "پس از ۳ و ۷ روز" },
    5: { shape: "habit", cite: "در هر جلسه یادگیری" },
    6: { shape: "once", cite: "برای هر مفهوم دشوار" },
    7: { shape: "every", every: 3, crit: "rep", cite: "۲ تا ۳ بار در هفته" },
    8: { shape: "every", every: 7, crit: "rep", cite: "هفته‌ای یک موقعیت واقعی" },
    9: { shape: "fcast", after: 30, cite: "ماهانه با نتایج واقعی" },
    10: { shape: "list", list: "claims", cite: "چه زمانی دوباره بررسی‌اش می‌کنم" },
    11: { shape: "once", cite: "پس از هر شکست بزرگ" },
    12: { shape: "once", cite: "هر خطای تکرارشونده" },
    13: { shape: "every", every: 3, crit: "rep", cite: "هفته‌ای ۲–۳ ادعای مهم" },
    14: { shape: "once", cite: "هر ماه یک بار برای برنامه یادگیری خودتان" },
    15: { shape: "list", list: "assumptions", cite: "هر ماه یا با هر رویداد مهم" },
    16: { shape: "list", list: "models", cite: "دست‌کم سه بار در موقعیت واقعی" },
    17: { shape: "every", every: 7, crit: "rep", cite: "دست‌کم هفته‌ای یک اصل" },
    18: { shape: "once", cite: "ماهی یک یا دو بار" },
    19: { shape: "every", every: 7, crit: "rep", cite: "هفته‌ای یک جلسه" },
    20: { shape: "once", cite: "برای هر مسئله" },
    21: { shape: "exp", crit: "exp", cite: "اجرا از یک روز تا چهار هفته" },
    22: { shape: "verdict", every: 7, cite: "هفته‌ای یک باور" },
    23: { shape: "steps", steps: [1], crit: "knot", cite: "یک بازآزمایی یک روز بعد" },
    24: { shape: "calib", crit: "calib", cite: "روزانه ۳ تا ۵ پیش‌بینی" },
    25: { shape: "once", cite: "برای هر خروجی مهم" },
    26: { shape: "steps", steps: [1], crit: "steps", cite: "بازکشیدن آن از حافظه یک روز بعد" },
    27: { shape: "once", cite: "برای هر قاعده یا فرمول مهم یک بار" },
    28: { shape: "steps", steps: [1, 7], checkin: 7, crit: "steps", cite: "۱ روز و ۱ هفته بعد" },
    29: { shape: "every", every: 7, crit: "rep", cite: "هفته‌ای ۱ جلسه" },
    30: { shape: "every", every: 7, crit: "rep", cite: "هفته‌ای یک بار ۲۰ دقیقه گشت‌وگذار" },
    31: { shape: "window", win: [2, 7], crit: "transfer", list: "mistakes", cite: "بازگشت ۲ تا ۷ روز بعد" },
    32: { shape: "every", every: 7, crit: "rep", cite: "هفته‌ای ۱–۲ بار" },
    33: { shape: "habit", cite: "پیش از هر جلسه‌ی مطالعه" },
    34: { shape: "list", list: "beliefs", cite: "یک باور مهم در هفته", cite2: "بازخوانی ماهانه‌ی پوشه" },
    35: { shape: "list", list: "ambiguities", cite: "هفته‌ای یک بار مرور می‌شود" },
    36: { shape: "every", every: 3, crit: "rep", cite: "هفته‌ای ۲–۳ متن کلیدی" },
    37: { shape: "every", every: 7, crit: "rep", cite: "بازبینی هفتگی فهرست دوره‌ها" },
    38: { shape: "steps", steps: [1], crit: "steps", cite: "یک روز بعد ۵ دقیقه بازسازی" },
    39: { shape: "recur", every: 30, cite: "سه بار با اصلاح‌های مختلف تکرار شد", cite2: "بازبینی ماهانه یک متغیر حاکم" },
    40: { shape: "every", every: 7, crit: "rep", cite: "در هفته با هم‌تا" },
    41: { shape: "steps", steps: [1, 3, 7], checkin: 7, crit: "steps", p3: true, cite: "چرخه روز ۱، ۳ و ۷", cite2: "برگه سفید هفتگی" },
    42: { shape: "cards", crit: "cards", cite: "زمان‌بندی SM-2" },
    43: { shape: "every", every: 3, crit: "rep", cite: "هفته‌ای ۲–۳ بار" },
    44: { shape: "once", cite: "برای هر مسئله مفهومی" },
    45: { shape: "habit", cite: "هر جلسه" }
  };
  /* فهرست‌های جاری (LT7): آهنگِ مرور از متنِ همان تکنیک */
  var LISTS = PR.LISTS = {
    assumptions: { tid: 15, fa: "فهرستِ فرض‌ها", every: 30, cite: "هر ماه یا با هر رویداد مهم" },
    models: { tid: 16, fa: "قفسهٔ مدل‌های ذهنی", every: 7, cite: "یک تمرین ۲۰–۳۰ دقیقه‌ای در هفته", admit: 3 },
    mistakes: { tid: 34, also: 31, fa: "پوشهٔ «اشتباهاتِ فکری من»", every: 30, cite: "بازخوانی ماهانه‌ی پوشه" },
    beliefs: { tid: 34, fa: "باورهای زیرِ آزمون", every: 7, cite: "یک باور مهم در هفته" },
    ambiguities: { tid: 35, fa: "فهرستِ ابهام‌های باز", every: 7, cite: "هفته‌ای یک بار مرور می‌شود" },
    pareto: { tid: 3, fa: "ردیابِ پارتو (چند عاملِ اصلی)", every: 30, cite: "بازبینی ماهانه با داده واقعی" },
    claims: { tid: 10, fa: "دفترِ سیگنال و نویز", every: null, cite: "چه زمانی دوباره بررسی‌اش می‌کنم" }
  };
  var ST_FA = PR.ST_FA = { open: "باز", stabilising: "در حالِ تثبیت", stable: "تثبیت شد", paused: "مکث", closed: "بسته" };
  var SK_FA = PR.SK_FA = { live: "مسئلهٔ زنده", "case": "پروندهٔ معرفتی", knot: "گره", kcase: "موقعیتِ گره‌گشا", topic: "موضوع", free: "آزاد" };
  var SRC_FA = { library: "کتابخانه", live: "صفحهٔ مسئله", "case": "پروندهٔ معرفتی", knot: "گره", course: "دوره", journey: "سفر", assistant: "دستیار", card: "کارتِ مرور", p3: "چرخهٔ ۱-۳-۷", page: "صفحهٔ پرونده" };
  PR.citeOk = function (tid) { var t = A.TM[tid], p = P[tid]; if (!t || !p) return false; var txt = [t.dose].concat((t.ws || []).map(function (f) { return f.l || ""; })).join(" \n "); return txt.indexOf(p.cite) >= 0 && (!p.cite2 || txt.indexOf(p.cite2) >= 0); };
  /* پلهٔ بعدیِ نردبانِ خودِ صفحه (همان A.knextIv ِ گره‌گشا) */
  function ladderNext(iv) { if (A.knextIv) return A.knextIv(iv, true); var L = [1, 3, 7, 21, 60]; for (var i = 0; i < L.length; i++) if (L[i] > iv) return L[i]; return 60; }
  function checkinOf(pol) { if (pol.checkin) return pol.checkin; var st = pol.steps || []; return ladderNext(st.length ? st[st.length - 1] : (pol.every || 1)); }

  /* ---------- موضوع (subject) ---------- */
  function topicByTitle(t) { var n = norm(t); return n ? S.all("topic", function (x) { return norm(x.title) === n; })[0] : null; }
  PR.subj = function (k, id, t) {
    if (k === "topic" && !id && t) { var tp = topicByTitle(t); if (tp) id = tp.id; }
    return { k: k || "free", id: id || "", t: t || "" };
  };
  function subjKey(s) { s = s || {}; return (s.k || "free") + ":" + (s.id || ("t:" + norm(s.t))); }
  PR.subjTitle = function (s) {
    s = s || {}; var r;
    if (s.k === "live") { r = A.liveRec && A.liveRec(s.id); return r ? r.p.title : (s.t || "مسئلهٔ زنده"); }
    if (s.k === "case") { r = S.get(s.id); return r ? r.title : (s.t || "پرونده"); }
    if (s.k === "knot") { r = S.get(s.id); return r ? (r.name || s.t || "گره") : (s.t || "گره"); }
    if (s.k === "kcase") { r = S.get(s.id); return r ? (r.title || "موقعیت") : (s.t || "موقعیت"); }
    if (s.k === "topic") { r = s.id && S.get(s.id); return r ? r.title : (s.t || "موضوع"); }
    return s.t || "آزاد";
  };
  PR.subjLabel = function (s) { s = s || {}; return (s.k === "free" ? "«آزاد»" : SK_FA[s.k] || "") + (s.k === "free" ? (s.t ? " · " + s.t : "") : " «" + PR.subjTitle(s) + "»"); };
  PR.subjGo = function (s) {
    s = s || {};
    if (s.k === "live" && A.V.lprob) return function () { A.go("lprob", s.id); };
    if (s.k === "case") return function () { A.go("e_case", s.id); };
    if (s.k === "knot" && A.V.knot) return function () { A.go("knot", s.id); };
    if (s.k === "kcase" && A.V.kcase) return function () { A.go("kcase", s.id); };
    if (s.k === "topic" && s.id && A.V.topic) return function () { A.go("topic", s.id); };
    return null;
  };
  function knotOfKcase(kcId) { var kc = kcId && S.get(kcId); return kc && (kc.knots || [])[0] || ""; }
  function subjOfEx(ex) {
    var c = ex.prc && S.get(ex.prc); if (c && c.type === "practice") return c.subj;
    if (ex.knot) return PR.subj("knot", ex.knot);
    if (ex.kcase) { var k = knotOfKcase(ex.kcase); return k ? PR.subj("knot", k) : PR.subj("kcase", ex.kcase); }
    if (ex.lprob) return PR.subj("live", ex.lprob);
    if (ex.ecase) return PR.subj("case", ex.ecase);
    if (ex.topic) return PR.subj("topic", ex.topic);
    return PR.subj("free", "", ex.freeT || "");
  }
  function srcOfEx(ex) { return ex.prcSrc || (ex.course ? "course" : ex.kcase || ex.knot ? "knot" : ex.lprob ? "live" : ex.ecase ? "case" : ex.journey ? "journey" : "library"); }

  /* ---------- پرونده ---------- */
  PR.all = function (pred) { return S.all("practice", function (c) { return (!pred || pred(c)); }); };
  PR.cases = function (o) { o = o || {}; return PR.all(function (c) { return c.kind !== "list" && (o.sample ? !!c.sample : own(c)) && (o.tid == null || c.tid === o.tid) && (!o.subj || subjKey(c.subj) === subjKey(o.subj)); }); };
  PR.find = function (tid, subj, o) {
    var key = +tid + "|" + subjKey(subj), smp = !!(o && o.sample);
    return PR.all(function (c) { return c.kind !== "list" && c.key === key && !!c.sample === smp; })[0] || null;
  };
  PR.start = function (tid, subj, o) {
    o = o || {}; tid = +tid; if (!A.TM[tid]) return null;
    subj = subj || PR.subj("free");
    var c = PR.find(tid, subj, o);
    if (c) return c;
    c = { id: A.uid("prc"), type: "practice", kind: "case", tid: tid, subj: { k: subj.k, id: subj.id || "", t: subj.t || PR.subjTitle(subj) }, key: tid + "|" + subjKey(subj),
      src: o.src || "library", start: today(), sessions: [], state: "open", hist: [{ d: today(), at: nowISO(), ev: "start", to: "open", why: "شروع از «" + (SRC_FA[o.src] || o.src || "کتابخانه") + "»" }], links: {} };
    if (o.sample) c.sample = true;
    if (o.udue) c.udue = o.udue;
    S.put(c);
    if (P[tid] && P[tid].p3 && !c.sample) p3Link(c);
    PR.save(c, true);
    return c;
  };
  function lastSess(c) { var L = (c.sessions || []).filter(function (s) { return !s.draft; }).sort(byD); return L[L.length - 1] || null; }
  /* جلسه: o = {d, what, ok, self, meas, ex, src, note}. همان روز ⇒ همان جلسه به‌روز می‌شود (تکرارِ یک روز یک بار شمرده می‌شود). پیش‌نویس جلسه نیست. */
  PR.session = function (c, o) {
    o = o || {}; if (typeof c === "string") c = S.get(c); if (!c || o.draft) return null;
    var d = o.d || today(), L = c.sessions = c.sessions || [], s = L.filter(function (x) { return x.d === d; })[0], fresh = !s;
    if (!s) { s = { d: d, at: nowISO(), ex: [] }; L.push(s); } else s.upd = nowISO();
    if (o.what != null) s.what = clip(o.what, 300);
    if (o.self != null) s.self = o.self;
    if (o.ok != null) s.ok = !!o.ok; else if (fresh) s.ok = null;
    if (o.meas) { s.meas = s.meas || {}; for (var k in o.meas) s.meas[k] = o.meas[k]; }
    if (o.ex && s.ex.indexOf(o.ex) < 0) s.ex.push(o.ex);
    if (o.src) s.src = o.src;
    if (o.note) s.note = clip(o.note, 300);
    if (c.state === "closed") { c.closed = null; (c.hist = c.hist || []).push({ d: d, at: nowISO(), ev: "reopen", why: "جلسهٔ تازه روی پروندهٔ بسته" }); }
    judge(c, s);
    PR.save(c);
    return s;
  };
  /* داوریِ یک جلسه از سنجیدهٔ خودِ تکنیک؛ سنجیده بر خودارزیابی مقدم است (بانکِ LT3 #53) */
  function judge(c, s) {
    var m = s.meas || {}, tid = c.tid, prev = (c.sessions || []).filter(function (x) { return x !== s && x.d < s.d; }).sort(byD);
    if (s.okSet) return;
    if (tid === 41 && m.pct != null) { s.ok = m.pct > 50; s.why = "بازیابیِ سنجیده " + fa(m.pct) + "٪" + (m.pct > 50 ? " — بیش از نیم" : " — کمتر از نیم"); return; }
    if (tid === 28 && m.jargon != null) {
      if (!prev.length) { s.ok = null; s.why = "نسخهٔ نخست (پایه)"; return; }
      var base = prev.filter(function (x) { return x.meas && x.meas.jargon != null; }).map(function (x) { return x.meas.jargon; }), best = base.length ? Math.min.apply(null, base) : m.jargon;
      var stuck = (m.stuck || []).filter(Boolean);
      s.ok = !stuck.length && m.jargon <= best; s.why = "اصطلاحِ فنی " + fa(m.jargon) + (base.length ? " (بهترینِ پیشین " + fa(best) + ")" : "") + (stuck.length ? " · گیر در «" + stuck.join("»، «") + "»" : ""); return;
    }
    if (tid === 23 && m.correct != null) { s.ok = m.correct >= 3; return; }
    if (tid === 21 && m.complete != null) { s.ok = !!m.complete; return; }
    if (s.ok == null && s.self != null && prev.length) { s.ok = s.self >= 50; s.why = "خودارزیابی " + fa(s.self) + "٪ (سنجیده‌ای نیست)"; }
  }

  /* ---------- بازپخشِ جلسه‌ها: موعد، نقشِ هر جلسه، وضع، شاهدِ پایداری (تابعِ خالص) ---------- */
  PR.eval = function (c) {
    var pol = P[c.tid] || { shape: "once" }, sess = (c.sessions || []).filter(function (s) { return !s.draft; }).sort(byD);
    var evs = (c.hist || []).filter(function (e) { return e.ev === "pause" || e.ev === "resume"; });
    var tl = sess.map(function (s) { return { s: s, d: s.d, o: 1 }; }).concat(evs.map(function (e) { return { e: e, d: e.d, o: e.ev === "pause" ? 2 : 0 }; }))
      .sort(function (a, b) { return a.d.localeCompare(b.d) || a.o - b.o; });
    var R = { roles: {}, ev: [], stable: null, withdrawn: [], due: null, until: null, reason: "", progress: false, paused: null, crit: [], late: {} };
    var anchor = pol.p3 ? (c.start || null) : null, i = 0, ck = checkinOf(pol), steps = pol.steps || [];   /* T41: چرخهٔ ۱-۳-۷ از روزِ آغازِ پرونده (همان روزی که P3 زمان‌بندی شد) */
    /* دورِ ۲۱ (R5، C21-11 B·D15 D·10): شاهدِ پایداری فقط از «دنباله»ٔ خودِ تکنیک پس از آخرین شکست — cnt = شمارِ بازیابی‌های موفقِ پس از آخرین
       شکست (یا آغاز)؛ «تثبیت شد» فقط وقتی cnt به شمارِ پله‌های خودِ تکنیک رسید (T41: «چرخه روز ۱، ۳ و ۷» ⇒ سه بازیابیِ موفق با فاصلهٔ رو به افزایش).
       بازیابیِ دیرِ موفق هنوز فاصلهٔ بلندتر را می‌گیرد (دورِ ۲۰، زمان‌بندی) ولی فقط یک موفقیت شمرده می‌شود — پیش‌تر پله‌های جاافتاده را هم
       «گذرانده» می‌شمرد و یک جلسه پس از پسرفت «تثبیت شد» می‌داد. پس از پله‌های تکنیک (دیرِ موفق، یا T23 با معیارِ گره) نوبتِ بعد پلهٔ بعدیِ
       نردبانِ خودِ صفحه پس از آخرین فاصله است (هرگز موعدِ NaN). */
    var cnt = 0, lastD = anchor, lastGap = 0;
    function uEvery(s) { var u = c.urhythm; return u && u.every && s.d > String(u.from || u.d || "") ? u.every : 0; }
    function role(s, r, x) { R.roles[s.d] = r; if (x != null) R.late[s.d] = x; }
    function resetTo(d) { anchor = d; i = 0; R.ev = []; cnt = 0; lastD = d; lastGap = 0; }
    /* دورِ ۲۶ (Q10، C26-42 s29 p6 / s23 p9، C39، بانکِ R26 #255 — سهمِ classify): پس از یک شکست، یک بازیابیِ دیرِ موفق «۱ از ۳» است، ولی موعدِ بعد به پلهٔ بلندِ نردبانِ صفحه
       («۲۱ روز») می‌پرید — فاصلهٔ پس از تثبیت، در حالی که دو موفقیتِ دیگر لازم بود. تا دنبالهٔ خودِ تکنیک کامل نشده (cnt < شمارِ پله‌ها، معیارِ «steps»)، فاصلهٔ بعد از بلندترین پلهٔ
       **چرخهٔ خودِ تکنیک** بلندتر نمی‌شود (دیرِ موفق هنوز بلندترین فاصله‌ای را که چرخه دارد می‌گیرد — قاعدهٔ دورِ ۲۰ می‌ماند). هیچ عددِ تازه‌ای نیست: سقف همان آخرین پلهٔ steps است.
       پس از «تثبیت شد» فاصلهٔ بلند مثلِ پیش. رفتارِ پیشین: PR.R26_QUARANTINE.extGap25. */
    function capped26() { return pol.crit === "steps" && steps.length > 0 && cnt < steps.length; }
    function extGap() { var g = lastGap || steps[steps.length - 1] || 1, nx = ladderNext(g); return capped26() ? Math.min(nx, steps[steps.length - 1]) : nx; }
    function stepDue() { return i < steps.length ? add(anchor, steps[i]) : add(lastD, extGap()); }
    function stepW() { return i < steps.length ? steps[i] - (i ? steps[i - 1] : 0) : Math.max(1, extGap() - (lastGap || steps[steps.length - 1] || 1)); }
    tl.forEach(function (it) {
      if (it.e) { if (it.e.ev === "pause") R.paused = it.e; else { R.paused = null; if (anchor != null) resetTo(it.d); } return; }
      var s = it.s;
      if (R.stable) {
        if (s.ok === false) { R.withdrawn.push({ d: s.d, was: R.stable.d, why: s.why || "وارسیِ " + fdate(s.d) + " شکست خورد" }); R.stable = null; role(s, "decay"); resetTo(s.d); R.progress = true; return; }
        if (s.d >= R.stable.next) { R.stable.checks.push(s.d); R.stable.next = add(s.d, ck); role(s, "checkin"); } else role(s, "extra");
        return;
      }
      if (pol.shape === "steps") {
        if (anchor == null || (s.d === anchor && i === 0 && !cnt)) { if (anchor == null) resetTo(s.d); role(s, "start"); return; }
        var due = stepDue(), w = stepW(), until = add(due, w), stepNo = i < steps.length ? steps[i] : null;
        /* دورِ ۲۱ (R5): شکست هر وقت باشد (زودتر از موعد هم) شکست است و دنباله را از همان روز از نو می‌چیند — «زودتر از موعد» هرگز برچسبِ شکست نیست */
        if (s.ok === false) { if (s.d >= until) role(s, "late", gap(due, s.d)); else { role(s, "fail"); R.progress = true; } resetTo(s.d); return; }
        if (s.d < due) { role(s, "early"); return; }
        var el = gap(lastD, s.d), lateOk = false, elA = gap(anchor, s.d);
        if (s.d >= until) {
          /* دورِ ۲۰ (RO7): بازیابیِ دیرِ موفق فاصلهٔ بلندتر را به دست می‌آورد (زمان‌بندی: پله‌های کوتاه‌تر از فاصلهٔ ازسرگذشته پشتِ سر می‌مانند
             و پلهٔ بعد دست‌کم پلهٔ بعدیِ نردبانِ خودِ صفحه است)؛ دورِ ۲۱: ولی شاهد فقط یک موفقیت است (cnt++). دیرِ ناموفق/بی‌نتیجه از نو. */
          if (s.ok !== true) { role(s, "late", gap(due, s.d)); resetTo(s.d); return; }
          role(s, "lateok", gap(due, s.d)); lateOk = true;
          if (i < steps.length) { while (i < steps.length && steps[i] <= elA) i++; } else el = elA = gap(lastD, s.d);
        } else { role(s, "step"); i++; }
        R.ev.push(lateOk ? { d: s.d, step: stepNo, late: gap(due, s.d), el: el, why: s.why || "", meas: s.meas || null } : { d: s.d, step: stepNo, why: s.why || "", meas: s.meas || null });
        cnt++; R.progress = true; lastGap = lateOk ? elA : el; lastD = s.d;
        if (cnt >= steps.length && i >= steps.length && pol.crit === "steps") { R.stable = { d: s.d, ev: R.ev.slice(), checks: [], next: add(s.d, lateOk ? Math.max(ck, ladderNext(elA)) : ck), crit: "steps" }; return; }
        if (lateOk && i < steps.length) anchor = add(s.d, ladderNext(elA) - steps[i]);
        return;
      }
      if (pol.shape === "window") {
        if (anchor == null || s.ok == null) { anchor = s.d; role(s, "start"); return; }
        var wd = add(anchor, pol.win[0]), wu = add(anchor, pol.win[1]);
        if (s.d > wu) role(s, "late", gap(wu, s.d)); else if (s.ok === false) role(s, "fail"); else if (s.d < wd) role(s, "early"); else role(s, "step");   /* دورِ ۲۱: شکستِ زودتر از پنجره «شکست» است */
        anchor = s.d; R.progress = true;
        if (s.ok) R.ev.push({ d: s.d, problem: (s.meas || {}).problem || "", why: s.why || "" }); else if (s.ok === false) R.ev = [];
        return;
      }
      if (pol.shape === "every") {
        if (anchor == null) { anchor = s.d; role(s, "start"); R.ev = s.ok === false ? [] : [{ d: s.d }]; return; }
        var evr = uEvery(s) || pol.every;   /* دورِ ۲۲: آهنگِ خودِ او (اگر برای این جلسه گفته بود) همان موعدی است که به او گفته شد */
        if (gap(anchor, s.d) > evr) { role(s, "late", gap(add(anchor, evr), s.d)); R.ev = []; } else role(s, s.ok === false ? "fail" : "step");
        anchor = s.d; if (s.ok === false) R.ev = []; else { R.ev.push({ d: s.d }); R.progress = true; }
        return;
      }
      /* دورِ ۲۲ (P6، D·s35): شکل‌های بی‌نوبت (فهرست، یک‌باره، …) فقط موعدِ آهنگِ خودِ او را دارند — جلسهٔ پس از آن موعد «دیرتر از موعد» است */
      var ue = uEvery(s), ud = ue ? add(anchor != null && anchor > (c.urhythm.from || c.urhythm.d || "") ? anchor : (c.urhythm.from || c.urhythm.d || c.start), ue) : "";
      if (ud && s.d > ud) role(s, "late", gap(ud, s.d)); else role(s, "session");
      anchor = s.d; if (pol.shape !== "once" && pol.shape !== "habit") R.progress = true;
    });
    R.anchor = anchor; R.stepIdx = i; R.run = cnt;
    if (pol.shape === "steps" && anchor != null && !R.stable) R.next = stepDue();   /* گامِ بعدِ چرخه (برای T41 همان را P3 در «امروز» می‌دهد) */
    /* معیارهایی که از خودِ رکوردهای پیوسته حساب می‌شوند */
    var cr = pol.crit;
    if (cr === "rep" && !R.stable) { var dd = uniqDays(R.ev); if (dd.length >= 3 && gap(dd[0], dd[dd.length - 1]) >= 3) R.stable = { d: dd[dd.length - 1], ev: R.ev.slice(), checks: [], next: add(dd[dd.length - 1], ck), crit: "rep" }; }
    if (cr === "transfer" && !R.stable) transferCrit(R, ck);
    if (cr === "knot") knotCrit(c, sess, R, ck);
    if (cr === "exp") expCrit(c, sess, R);
    if (cr === "calib") calibCrit(c, R);
    if (cr === "cards") cardsCrit(c, sess, R, ck);
    if (pol.shape === "verdict") verdictEval(c, sess, R, pol);
    if (pol.shape === "recur") recurEval(c, sess, R, pol);
    /* موعد */
    var t = today();
    if (c.closed) R.state = "closed";
    else if (R.paused) R.state = "paused";
    else if (R.stable) R.state = "stable";
    else R.state = R.progress ? "stabilising" : "open";
    if (R.state === "closed" || R.state === "paused") { R.due = null; }
    else if (R.stable && R.stable.next) { R.due = R.stable.next; R.reason = "وارسیِ ماندگاری پس از «تثبیت شد» (" + fdate(R.stable.d) + ")"; }
    else if (R.due) { /* verdict/recur خودش گذاشت */ }
    else if (pol.shape === "steps" && anchor != null) { R.due = stepDue(); R.until = add(R.due, stepW()); R.reason = i < steps.length ? stepReason(c, steps[i], i) : capped26() ? capReason26(c, extGap(), cnt, steps.length, pol) : extReason(c, lastGap || steps[steps.length - 1], cnt, steps.length, pol); }
    else if (pol.shape === "window" && anchor != null) { R.due = add(anchor, pol.win[0]); R.until = add(anchor, pol.win[1]); R.reason = "بازگشت برای سنجشِ نتیجهٔ راهبرد (" + pol.cite + ")"; }
    else if (pol.shape === "every" && anchor != null) { R.due = add(anchor, pol.every); R.reason = "نوبتِ بعد (" + pol.cite + ")"; }
    else if (pol.shape === "calib" && R.calibNext) { var oc = (R.crit || []).filter(function (x) { return !x.ok; })[0]; R.due = R.calibNext; R.reason = "نوبتِ بعدِ کالیبراسیون: پیش‌بینی‌های تازه در روزی جدا (" + pol.cite + ")" + (oc ? " — معیارِ باز: " + oc.t : ""); }
    else if (!sess.length && !c.closed && /^(steps|window|every|exp|calib)$/.test(pol.shape) && !pol.p3) { R.due = c.start; R.reason = "جلسهٔ نخست (" + pol.cite + ")"; }
    else if (pol.shape === "exp" && c.udue && !R.stable) { R.due = c.udue; R.reason = "دیدنِ نتیجهٔ آزمون (موعدِ خودت)"; }
    if (R.state === "stable" && pol.shape === "verdict" && !R.due) R.due = null;
    /* دورِ ۲۱ (R5، D·s35): آهنگِ خودِ او («هر دو هفته یه بار») موعدِ همین پرونده را می‌گذارد (udue) — از آخرین جلسه (یا آغاز)، نه پیش‌فرضِ تکنیک؛
       متنِ تکنیک کنارش گفته می‌شود تا تفاوت پنهان نماند. شاهدِ پایداری همان قاعدهٔ خودِ تکنیک است. */
    if (c.urhythm && c.urhythm.every && (R.state === "open" || R.state === "stabilising")) {
      var lsd = sess.length ? sess[sess.length - 1].d : (c.urhythm.from || c.start);
      R.due = add(lsd, c.urhythm.every); R.until = ""; R.reason = "آهنگِ خودت: «" + clip(c.urhythm.quote, 60) + "» — هر " + fa(c.urhythm.every) + " روز" + (pol.cite ? " (متنِ تکنیک: «" + pol.cite + "»)" : ""); R.rhythm = true;
    }
    R.overdue = R.due && R.due < t ? gap(R.due, t) : 0;
    return R;
  };
  /* دورِ ۲۱: پس از پله‌های خودِ تکنیک و پیش از کامل‌شدنِ دنباله (دیرِ موفق، یا معیارِ گره در T23) — فاصلهٔ بعد پلهٔ بعدیِ نردبانِ صفحه */
  PR.R26_QUARANTINE = { extGap25: function (lastGap, steps) { return ladderNext(lastGap || steps[steps.length - 1] || 1); } };
  function capReason26(c, g, n, need, pol) { return (c.tid === 23 ? "بازآزمایی" : c.tid === 41 ? "بازیابی" : "نوبتِ بعد") + " پس از " + fa(g) + " روز (بلندترین پلهٔ چرخهٔ خودِ تکنیک — تا دنباله کامل نشده فاصله از آن بلندتر نمی‌شود) · " + fa(n) + " از " + fa(need) + " بازیابیِ موفق پس از آخرین شکست (" + pol.cite + ")"; }
  function extReason(c, g, n, need, pol) { return (c.tid === 23 ? "بازآزمایی" : c.tid === 41 ? "بازیابی" : "نوبتِ بعد") + " پس از " + fa(ladderNext(g)) + " روز (فاصله‌ای بلندتر از " + fa(g) + " روزِ پیشین — پلهٔ بعدیِ نردبانِ صفحه)" + (pol.crit === "steps" ? " · " + fa(n) + " از " + fa(need) + " بازیابیِ موفق پس از آخرین شکست (" + pol.cite + ")" : ""); }
  function uniqDays(ev) { var o = {}; (ev || []).forEach(function (e) { o[e.d] = 1; }); return Object.keys(o).sort(); }
  function stepReason(c, st, i) { var nm = c.tid === 41 ? "بازیابی" : c.tid === 28 ? "بازنویسیِ بی‌منبع" : c.tid === 4 ? "بازکشیدنِ نقشه از حافظه" : c.tid === 26 ? "بازکشیدنِ نمودار از حافظه" : c.tid === 38 ? "بازسازیِ متن از تصویرِ ذهنی" : c.tid === 23 ? "بازآزمایی" : "نوبتِ بعد"; return nm + " — روزِ " + fa(st) + " (" + (P[c.tid] || {}).cite + ")"; }
  /* قاعدهٔ فاصله‌گذاریِ گره (A.kmastery ِ a17): ≥۲ نوبت با فاصلهٔ ≥۳ روز */
  PR.spaced = function (days) { var d = (days || []).slice().sort(); var u = d.filter(function (x, j) { return d.indexOf(x) === j; }); return u.length >= 2 && gap(u[0], u[u.length - 1]) >= 3; };
  function transferCrit(R, ck) {
    var ev = R.ev.filter(function (e) { return e.problem; });
    for (var j = 1; j < ev.length; j++) for (var k = 0; k < j; k++) if (norm(ev[j].problem) !== norm(ev[k].problem) && gap(ev[k].d, ev[j].d) >= 3) { R.stable = { d: ev[j].d, ev: [ev[k], ev[j]], checks: [], next: add(ev[j].d, ck), crit: "transfer" }; return; }
  }
  function knotCrit(c, sess, R, ck) {
    var after = [], lastFail = null; sess.forEach(function (s) { if (s.ok === false) { lastFail = s.d; after = []; } else if (s.meas && s.meas.correct != null) after.push(s); });
    var forms = {}, dec = 0; after.forEach(function (s) { (s.meas.forms || []).forEach(function (f) { forms[norm(f)] = 1; }); dec += +(s.meas.decoys || 0); });
    var days = after.map(function (s) { return s.d; }), ok = after.length && after.every(function (s) { return s.meas.correct >= 3; });
    R.crit = [{ ok: ok, t: "هر نوبت دست‌کم ۳ پاسخِ درستِ پیاپی" }, { ok: Object.keys(forms).length >= 3, t: "دست‌کم ۳ شکلِ متفاوت — اکنون " + fa(Object.keys(forms).length) }, { ok: PR.spaced(days), t: "دست‌کم ۲ نوبت با فاصلهٔ ≥ ۳ روز" }, { ok: dec >= 2, t: "دست‌کم ۲ نمونهٔ بدلیِ درست — اکنون " + fa(dec) }];
    if (R.stable && R.stable.crit !== "knot") R.stable = null;
    if (R.crit.every(function (x) { return x.ok; })) { var dl = days[days.length - 1]; R.stable = R.stable || { d: dl, ev: after.map(function (s) { return { d: s.d, meas: s.meas }; }), checks: [], next: add(dl, ck), crit: "knot" }; R.progress = true; }
    else if (after.length) R.progress = true;
    /* دورِ ۲۲ (P6، D·s34): این معیارها (پاسخِ درستِ پیاپی، شکلِ متفاوت، نمونهٔ بدلی) سنجه‌های ورزشِ گره‌اند؛ روی موضوعی که جلسه‌هایش چنین
       اندازه‌ای ندارد (مثلاً یک پروژه) پرونده هرگز «تثبیت شد» نمی‌شود — به‌جای سکوت گفته می‌شود، با نشانه‌های خودِ تکنیک از متنش */
    if (!/^(knot|kcase)$/.test((c.subj || {}).k || "") && !sess.some(function (s) { return s.meas && s.meas.correct != null; })) {
      var sg = ((A.TM[c.tid] || {}).signals || []).slice(0, 2);
      R.misfit = { crit: "knot", t: "معیارهای تثبیتِ این پرونده (پاسخِ درستِ پیاپی، شکل‌های متفاوت، نمونهٔ بدلی — سنجه‌های ورزشِ گره) با این موضوع («" + PR.subjTitle(c.subj) + "») جور نیست: جلسه‌هایش چنین اندازه‌ای ندارند، پس «تثبیت شد» هرگز نمی‌آید" + (sg.length ? ". نشانه‌های خودِ تکنیک: «" + sg.join("»؛ «") + "»" : "") + " — آهنگ و جلسه‌ها ثبت می‌شوند." };
    }
  }
  /* آزمایش (T21): ≥۳ آزمایشِ کامل در ≥۱۴ روز — همان معیارِ آزمایشِ گره (A.kmastery، حالتِ exp) */
  function expCrit(c, sess, R) {
    var L = [];
    sess.forEach(function (s) { if (s.meas && s.meas.complete) L.push({ d: s.d, src: "کاربرگ", id: (s.ex || [])[0] || "" }); });
    PR.linkedKexp(c).forEach(function (x) { if (x.status === "done" && x.doneAt && x.observe && x.outcome && !L.some(function (y) { return y.id === x.ex; })) L.push({ d: A.localDay(x.doneAt), src: "آزمایشِ گره", id: x.id }); });
    L.sort(byD); var span = L.length >= 2 ? gap(L[0].d, L[L.length - 1].d) : 0;
    R.crit = [{ ok: L.length >= 3, t: "دست‌کم ۳ آزمایشِ کامل (پیش‌بینی، مشاهده، نتیجه) — اکنون " + fa(L.length) }, { ok: span >= 14, t: "فاصلهٔ اولین تا آخرین دست‌کم ۱۴ روز — اکنون " + fa(span) + " روز" }];
    if (L.length) R.progress = true;
    if (L.length >= 3 && span >= 14) R.stable = { d: L[L.length - 1].d, ev: L, checks: [], next: null, crit: "exp" };
  }
  /* کالیبراسیون (T24): پیش‌بینی‌های داوری‌شدهٔ همین پرونده در روزهای جدا (قاعدهٔ فاصلهٔ گره)، و اطمینانِ اعلام‌شده درونِ بازهٔ نرخِ درستی:
     برآوردِ (k+1)/(n+2) (A4) با انحرافِ پسینِ √(p(1−p)/(n+3)) — اطمینانِ میانگین باید در یک انحراف از آن باشد. */
  function calibCrit(c, R) {
    var F = PR.linkedFcasts(c).filter(function (x) { return x.p != null && (x.outcome === "شد" || x.outcome === "نشد"); });
    var byDay = {}; F.forEach(function (x) { var d = A.localDay(x.created); (byDay[d] = byDay[d] || { n: 0, k: 0 }); byDay[d].n++; if (x.outcome === "شد") byDay[d].k++; });
    var n = F.length, k = F.filter(function (x) { return x.outcome === "شد"; }).length, conf = n ? F.reduce(function (t, x) { return t + x.p; }, 0) / n / 100 : 0;
    var p = (k + 1) / (n + 2), sd = Math.sqrt(p * (1 - p) / (n + 3)), inBand = n > 0 && Math.abs(p - conf) <= sd, days = Object.keys(byDay).sort();
    R.calib = { n: n, k: k, hit: n ? Math.round(100 * k / n) : null, conf: Math.round(conf * 100), est: Math.round(p * 100), sd: Math.round(sd * 100), days: days.map(function (d) { return { d: d, n: byDay[d].n, k: byDay[d].k }; }) };
    /* دورِ ۲۱ (R5، B·D11): بی هیچ پیش‌بینیِ داوری‌شده، معیار عددی ندارد که نشان دهد — «۰٪ … ۵۰٪ ± ۲۹» ساختگی بود؛ تا داده نیامده چیزی نشان داده نمی‌شود */
    /* دورِ ۲۲ (P6، D·s31): متنِ معیار به متنِ خودِ تکنیک استناد می‌کند («روزانه ۳ تا ۵ پیش‌بینی»)، نه به «قاعدهٔ گره» */
    R.crit = n ? [{ ok: inBand, t: "اطمینانِ اعلام‌شده (" + fa(R.calib.conf) + "٪) درونِ بازهٔ نرخِ درستی (" + fa(R.calib.est) + "٪ ± " + fa(R.calib.sd) + ")" }, { ok: PR.spaced(days) && days.length >= 3, t: "پیش‌بینی‌ها در دست‌کم ۳ روزِ جدا (متنِ خودِ تکنیک: «" + P[24].cite + "» — روزانه، نه همه در یک روز) — اکنون " + fa(days.length) + " روز" }] : [];
    if (!n) R.calib = null;
    if (n) R.progress = true;
    /* دورِ ۲۰ (RO7، D·7): نوبتِ بعد از معیارِ باز — پیش‌بینی‌های هنوز داوری‌نشده موعدِ خودشان را در 🎯 دارند (همان رکورد)؛ پرونده روزِ پس از
       آخرین موعدِ باز (یا آخرین کار: نوشتن/داوری) نوبتِ تازه می‌گیرد — هرگز «موعدی ندارد» تا معیار باز است */
    var all = PR.linkedFcasts(c), pend = all.filter(function (x) { return !x.outcome; }), pd = pend.map(function (x) { return x.due; }).filter(Boolean).sort();
    var acts = all.map(function (x) { return A.localDay(x.created); }).concat(all.map(function (x) { return x.outcomeAt ? A.localDay(x.outcomeAt) : ""; })).filter(Boolean).sort();
    R.calibNoDate = pend.filter(function (x) { return !x.due; }).length;
    if (all.length) R.calibNext = pd.length ? add(pd[pd.length - 1], 1) : add(acts[acts.length - 1], 1);
    if (inBand && PR.spaced(days) && days.length >= 3) { var last = F.map(function (x) { return A.localDay(x.outcomeAt || x.due); }).sort().pop(); R.stable = { d: last, ev: R.calib.days, checks: [], next: null, crit: "calib" }; }
  }
  /* کارت‌ها (T42): موفقیت در فاصلهٔ بلندتر از پیشین، پس از آخرین لغزش، در روزهای فاصله‌دار؛ لغزش پس می‌گیرد */
  function cardsCrit(c, sess, R, ck) {
    var after = [], prevEl = 0, wd = null;
    sess.forEach(function (s) {
      var m = s.meas || {};
      if (s.ok === false) { if (R.stable) { R.withdrawn.push({ d: s.d, was: R.stable.d, why: "«یادم نبود» در " + fdate(s.d) + " — فاصله به ۱ روز برگشت" }); R.stable = null; } after = []; prevEl = 0; R.roles[s.d] = "lapse"; return; }
      if (m.el != null && m.el > prevEl) { after.push({ d: s.d, el: m.el }); prevEl = m.el; R.roles[s.d] = "step"; R.progress = true; } else R.roles[s.d] = "extra";
      if (!R.stable && after.length >= 2 && PR.spaced(after.map(function (x) { return x.d; }))) R.stable = { d: s.d, ev: after.slice(), checks: [], next: null, crit: "cards" };
    });
  }
  /* ابطال‌گرایی (T22): حکم با مشاهدهٔ تاریخ‌دار، سپس بازبینی پس از نتیجه به آهنگِ خودِ تکنیک (هفته‌ای) */
  var VERD = { "باطل شد": "رد شد", "تضعیف شد": "تضعیف شد", "از آزمون جان سالم به در برد": "جان سالم به در برد" };
  function verdictEval(c, sess, R, pol) {
    var v = null, rr = null;
    sess.forEach(function (s) { var st = s.meas && s.meas.status; if (!v && st && VERD[st]) v = { d: s.d, status: st, fa: VERD[st], obs: s.meas.obs || s.what || "" }; else if (v && !rr && s.d >= add(v.d, pol.every)) rr = s.d; });
    R.verdict = v;
    if (v) { R.progress = true; if (rr) { R.stable = { d: rr, ev: [{ d: v.d, t: "حکم: " + v.fa + (v.obs ? " — " + clip(v.obs, 80) : "") }, { d: rr, t: "بازبینی پس از نتیجه" }], checks: [], next: null, crit: "verdict" }; } else { R.due = add(v.d, pol.every); R.reason = "بازبینی پس از نتیجه («" + v.fa + "» در " + fdate(v.d) + ")"; } }
    else if (c.udue) { R.due = c.udue; R.reason = "دیدنِ نتیجهٔ آزمونِ باور"; }
  }
  /* یادگیریِ دوحلقه‌ای (T39): سومین تکرارِ مشکل ⇒ پیشنهادِ حلقهٔ دوم با سه تاریخ؛ پس از جلسه، بازبینیِ ماهانهٔ متغیرِ حاکم */
  function recurEval(c, sess, R, pol) {
    var occ = (c.occ || []).slice().sort(); R.occ = occ;
    var last = sess.length ? sess[sess.length - 1].d : null;
    if (last && occ.length >= 3 && last >= occ[2]) { R.due = add(last, pol.every); R.reason = "بازبینیِ ماهانهٔ متغیرِ حاکم (" + pol.cite2 + ")"; R.progress = true; }
    else if (last && occ.length < 3) { R.due = add(last, pol.every); R.reason = "بازبینیِ ماهانهٔ متغیرِ حاکم (" + pol.cite2 + ")"; R.progress = true; }
    else if (occ.length >= 3) { R.due = occ[2]; R.reason = "مشکل سه بار تکرار شد (" + occ.map(fdate).join("، ") + ") — وقتِ یادگیریِ دوحلقه‌ای"; R.suggest = { d: occ[2], dates: occ.slice(0, 3) }; }
  }

  /* ذخیره: وضع، موعد و شاهد روی خودِ رکورد (دیگر بخش‌ها — کارنامه، دستیار — همین را می‌خوانند)، تاریخچهٔ گذارها، و ثبت در A.SCHED */
  /* دورِ ۲۲ (P6، A22-10 B·D22): پروندهٔ کالیبراسیون — هر داوریِ 🎯 ِ پیوسته (از صفحهٔ 🎯/«امروز»، از ردیفِ کاربرگ، یا از گفت‌وگو) جلسهٔ همان روزِ
     پرونده است؛ پیش‌تر فقط داوریِ گفت‌وگو جلسه می‌ساخت و «۹۰٪ ⇐ نشد» ِ صفحه در پرونده و کارنامه دیده نمی‌شد («۲ نشست»، «۰ جلسه» با وضعِ
     «در حالِ تثبیت»). یک جلسه برای هر روزِ داوری (همان قاعدهٔ «همان روز ⇒ همان جلسه»)؛ meas همهٔ 🎯 ِ آن روز (fcs) و آخرین داوری {p, ok} را دارد.
     جلسه‌ای که فقط از داوری ساخته شد (calibAuto) با برداشتنِ داوری (اصلاح/کنار رفتن) برداشته می‌شود؛ جلسهٔ گفت‌وگو/صفحه هرگز. */
  function calibBook(c) {
    if ((P[c.tid] || {}).shape !== "calib") return false;
    var by = {}, ch = false, L = c.sessions = c.sessions || [];
    PR.linkedFcasts(c).filter(function (x) { return x.p != null && (x.outcome === "شد" || x.outcome === "نشد"); }).forEach(function (f) {
      var j = f.judgedBy || {}, d = (j.d && /^\d{4}-\d\d-\d\d$/.test(j.d) ? j.d : "") || (f.outcomeAt ? A.localDay(f.outcomeAt) : "") || f.due; if (d) (by[d] = by[d] || []).push(f); });
    Object.keys(by).forEach(function (d) {
      var fs = by[d].sort(function (a, b) { return String(a.outcomeAt || "").localeCompare(String(b.outcomeAt || "")); }), last = fs[fs.length - 1], ids = fs.map(function (f) { return f.id; });
      var s = L.filter(function (x) { return x.d === d && !x.draft; })[0], jk = (last.judgedBy || {}).kind;
      if (!s) { s = { d: d, at: last.outcomeAt || nowISO(), ex: [], src: jk === "chat" ? "assistant" : "page", calibAuto: true }; L.push(s); ch = true; }
      var m = s.meas = s.meas || {};
      if (String(m.fcs || "") !== String(ids)) { m.fcs = ids; m.n = ids.length; ch = true; }
      if (!m.fc || ids.indexOf(m.fc) < 0 || s.calibAuto) { var o = last.outcome === "شد"; if (m.fc !== last.id || m.p !== last.p || m.ok !== o) { m.fc = last.id; m.p = last.p; m.ok = o; m.out = o ? "درست" : "نادرست"; ch = true; } }
      if (s.calibAuto) { var w = "داوریِ " + (ids.length > 1 ? fa(ids.length) + " پیش‌بینی، آخرین " : "") + "🎯 «" + clip(last.q, 60) + "» (" + fa(last.p) + "٪) ⇐ " + last.outcome + (jk === "plan" ? " — از همان برنامه" : jk === "chat" ? " — از گفت‌وگو" : " — در صفحه");
        if (s.what !== w || s.ok !== (last.outcome === "شد")) { s.what = w; s.ok = last.outcome === "شد"; ch = true; } }
    });
    for (var i = L.length - 1; i >= 0; i--) if (L[i] && L[i].calibAuto && !by[L[i].d]) { L.splice(i, 1); ch = true; }
    return ch;
  }
  PR.calibBook = calibBook;
  PR.save = function (c, quiet) {
    if (c.kind === "list") return listSave(c);
    try { calibBook(c); } catch (e) { console.warn(e); }
    var R = PR.eval(c), prev = c.state;
    if (R.state !== prev) (c.hist = c.hist || []).push({ d: today(), at: nowISO(), ev: "state", from: prev, to: R.state, why: R.state === "stable" ? "شاهد: " + (R.stable.ev || []).map(function (e) { return fdate(e.d); }).join("، ") : R.withdrawn.length && prev === "stable" ? R.withdrawn[R.withdrawn.length - 1].why : "" });
    (R.withdrawn || []).forEach(function (w) { var hs = c.hist = c.hist || []; if (!hs.some(function (e) { return e.ev === "withdraw" && e.d === w.d; })) hs.push({ d: w.d, at: nowISO(), ev: "withdraw", from: "stable", why: "«تثبیت شد» (" + fdate(w.was) + ") پس گرفته شد: " + w.why }); });
    c.state = R.state; c.due = R.due || ""; c.until = R.until || ""; c.reason = R.reason || ""; if (R.misfit) c.misfit = R.misfit.t; else if (c.misfit) delete c.misfit;
    c.stable = R.stable ? { d: R.stable.d, crit: R.stable.crit, ev: R.stable.ev, next: R.stable.next || "", checks: R.stable.checks } : null;
    /* دورِ ۲۰ (RO7، B·D9): «withdrawn» در همهٔ رکوردها یعنی «خودِ رکورد پس گرفته شد» (اصلاح)؛ پس‌گرفتنِ «تثبیت شد» نامِ خودش را دارد —
       آرایهٔ خالی دیگر رکورد را از کارنامه بیرون نمی‌اندازد */
    c.stableOff = R.withdrawn; if (Object.prototype.hasOwnProperty.call(c, "withdrawn") && Array.isArray(c.withdrawn)) delete c.withdrawn; c.roles = R.roles; c.late = R.late;
    S.put(c); try { p3Sync(c, R); } catch (e) { console.warn(e); } PR.sync(c, R);
    return R;
  };
  /* دورِ ۲۰ (RO7، A8 B·D10 C20-13): پرونده صاحبِ زمان‌بندیِ چرخهٔ ۱-۳-۷ ِ پیوسته است — همیشه دقیقاً یک برگهٔ بازِ P3 برای گامِ جاریِ پرونده
     (با موعدِ همان پرونده؛ همان سطرِ «امروز» که روالِ P3 را باز می‌کند)؛ پله‌های گذشته یا چرخهٔ ازنوچیده بسته می‌شوند (پاک نه: done با دلیل)؛
     پروندهٔ تثبیت‌شده/مکث/بسته برگهٔ بازی ندارد (وارسیِ ماندگاری سطرِ خودِ پرونده است). */
  function p3Label(st) { return "روز " + fa(st); }
  function p3Sync(c, R) {
    var pol = P[c.tid]; if (!pol || !pol.p3 || c.sample || c.kind === "list") return null;
    var ids = ((c.links || {}).p3 || []).slice(), L = ids.map(function (x) { return S.get(x); }).filter(function (x) { return x && x.type === "sched"; }), steps = pol.steps;
    var active = R.state !== "closed" && R.state !== "paused" && !R.stable && R.anchor != null && R.stepIdx != null && R.stepIdx < steps.length;
    var put = function (x) { S.put(x); }, cur = null, keep = [];
    if (active) {
      for (var j = R.stepIdx; j < steps.length; j++) {
        var lab = p3Label(steps[j]), due = add(R.anchor, steps[j]), x = L.filter(function (y) { return !y.done && y.label === lab && keep.indexOf(y) < 0; })[0];
        if (!x) { x = S.put({ id: A.uid("sc"), type: "sched", proto: "P3", topic: c.subj.k === "topic" ? c.subj.id : "", title: PR.subjTitle(c.subj), due: due, label: lab, done: false, prc: c.id }); ids.push(x.id); L.push(x); }
        var ch = false; if (j === R.stepIdx) { due = R.due; cur = x; if (x.hold) { delete x.hold; ch = true; } } else if (x.hold !== c.id) { x.hold = c.id; ch = true; }
        if (x.due !== due) { x.due = due; ch = true; } if (!x.prc) { x.prc = c.id; ch = true; } if (ch) put(x); keep.push(x);
      }
    }
    L.forEach(function (x) {
      if (x.done || keep.indexOf(x) >= 0) return;
      if (R.state === "paused") { if (x.hold !== c.id) { x.hold = c.id; put(x); } return; }
      var did = (c.sessions || []).some(function (s0) { return !s0.draft && s0.d >= x.due; });
      delete x.hold; x.done = true; x.closedBy = "practice"; x.closedAt = nowISO();
      if (!did || R.state === "closed" || R.stable) { x.superseded = true; x.why = R.stable ? "تثبیت شد — وارسیِ ماندگاری با خودِ پرونده" : R.state === "closed" ? "پرونده بسته شد" : "گامِ پرونده جلو رفت"; } else x.why = "گامِ پرونده ثبت شد";
      put(x);
    });
    if (String(ids) !== String((c.links || {}).p3 || [])) { (c.links = c.links || {}).p3 = ids; S.put(c); }
    return cur;
  }
  PR.p3Sync = function (c) { if (typeof c === "string") c = S.get(c); return c ? p3Sync(c, PR.eval(c)) : null; };
  function p3Current(c, R) { var pol = P[c.tid]; if (!pol || !pol.p3 || R.stable) return null; return ((c.links || {}).p3 || []).map(function (x) { return S.get(x); }).filter(function (x) { return x && !x.done && x.due === R.due; })[0] || null; }

  /* ---------- موعدها از راهِ A.SCHED (یا سطرِ «امروز» ِ همین فایل اگر نبود) ---------- */
  PR.entries = function (c, R) {
    if (!own(c)) return [];
    if (c.kind === "list") return listEntries(c);
    R = R || PR.eval(c); if (!R.due) return [];
    var p3c = p3Current(c, R);   /* همان برگهٔ P3 ِ گامِ جاری سطرِ «امروز» است — قلمِ پرونده dupOf ِ آن (یک سطر برای یک کار؛ PR.due هنوز می‌بیندش) */
    var pol = P[c.tid] || {};
    /* دورِ ۲۱ (R5، C21-12): «until» ِ شکلِ steps در داوری انحصاری است (جلسه در روزِ until «دیر» است)؛ زمان‌بندِ واحد آن را آخرین روزِ به‌موقع
       می‌خواند (عقب‌افتاده = روزِ پس از آن) ⇒ همان روزی که جلسه «دیر» شمرده می‌شود سطرِ «امروز» هم «عقب‌افتاده» می‌گوید */
    var untilIn = R.until ? (pol.shape === "steps" ? add(R.until, -1) : R.until) : ""; if (untilIn && untilIn <= R.due) untilIn = "";
    return [{ kind: "practice", id: c.id, due: R.due, until: untilIn, reason: "🧪 " + R.reason + " — " + fa(c.tid) + " · " + (A.TM[c.tid] || {}).fa + " · " + PR.subjLabel(c.subj),
      policy: { tid: c.tid, shape: pol.shape, cite: pol.cite }, open: ["practice", c.id], txt: "🧪 " + (A.TM[c.tid] || {}).fa + " — " + PR.subjTitle(c.subj), sub: R.reason + (untilIn ? " · تا " + fdate(untilIn) : ""), dupOf: p3c ? "sched:" + p3c.id : null }];
  };
  PR.sync = function (c, R) {
    var E = PR.entries(c, R), ids = E.map(function (e) { return e.id; }), was = c._reg || [];
    if (A.SCHED && typeof A.SCHED.register === "function") {
      was.forEach(function (id) { if (ids.indexOf(id) < 0) try { A.SCHED.unregister({ kind: "practice", id: id }); } catch (e) { } });
      E.forEach(function (e) { try { A.SCHED.register(e); } catch (x) { } });
    }
    if (String(was) !== String(ids)) { c._reg = ids; S.put(c); }
    return E;
  };
  /* سطرهای موعدِ امروز (برای «امروز» وقتی A.SCHED نیست، و برای آزمون/دستیار) */
  PR.due = function (day) {
    day = day || today(); var out = [];
    PR.all(own).forEach(function (c) { PR.entries(c).forEach(function (e) { if (e.due <= day) out.push(e); }); });
    return out.sort(function (a, b) { return a.due.localeCompare(b.due); });
  };
  var rawDue = A.dueList;
  if (rawDue && !rawDue._prc) {
    A.dueList = function () {
      var items = rawDue.apply(this, arguments) || [];
      if (A.SCHED && typeof A.SCHED.due === "function") return items;   // A.SCHED خودش سطرها را به «امروز» می‌دهد — دو بار نه
      PR.due().forEach(function (e) {
        var od = e.due < today() ? gap(e.due, today()) : 0, win = e.until && e.until < today();
        items.push({ k: "prc", txt: e.txt, sub: e.sub + (od ? " · " + (win ? "بازه گذشت؛ هنوز برگرد" : fa(od) + " روز از موعد گذشته") : ""), go: function () { A.go(e.open[0], e.open[1]); }, prc: e.id });
      });
      return items;
    };
    A.dueList._prc = true;
  }

  /* ---------- کاربرگ ⇒ پرونده (همهٔ راه‌ها از A.onExDone می‌گذرند: کتابخانه، دوره، سفر، گره) ---------- */
  var rawDone = A.onExDone;
  A.onExDone = function (ex) {
    var r; try { r = rawDone ? rawDone.apply(this, arguments) : undefined; } catch (e) { console.error(e); }
    try { PR.fromEx(ex); } catch (e) { console.error(e); }
    return r;
  };
  PR.fromEx = function (ex, o) {
    o = o || {}; if (!ex || !ex.tid || !A.TM[ex.tid] || ex.status !== "done") return null;
    var tid = ex.tid, pol = P[tid] || {};
    /* دورِ ۲۲ (P6، D·s35): کاربرگِ فهرست‌شکلی که جلسهٔ یک پرونده است (T15 ِ پروندهٔ باز) ⇒ موردها با پیوندِ همان پرونده و مسئله، و جلسهٔ همان پرونده؛
       کاربرگِ بی‌پرونده مثلِ پیش به خودِ فهرست می‌پیوندد */
    if (pol.shape === "list") { var pc0 = ex.prc && S.get(ex.prc), cs0 = pc0 && pc0.type === "practice" && pc0.kind !== "list" ? pc0 : null;
      var lc = listFromEx(ex, cs0); if (lc) { if (!cs0 && ex.prc !== lc.id) ex.prc = lc.id; (lc.sess = lc.sess || []).filter(function (x) { return x.d === today(); }).length || lc.sess.push({ d: today(), ex: ex.id }); listSave(lc); }
      if (cs0) PR.session(cs0, { d: o.d, what: summary(ex), meas: {}, ex: ex.id, src: srcOfEx(ex) });
      return lc; }
    var subj = subjOfEx(ex), c = (ex.prc && S.get(ex.prc)) || PR.start(tid, subj, { src: srcOfEx(ex), sample: !!ex.sample });
    if (!c) return null;
    if (ex.prc !== c.id) ex.prc = c.id;   /* پیوندِ اصلی sessions[].ex ِ پرونده است؛ کاربرگ دوباره نوشته نمی‌شود (یک نوشتن برای هر ثبت — test_journey) */
    var m = measOf(ex), sess = { d: o.d, what: summary(ex), self: A.rubricPct ? A.rubricPct(ex) : null, meas: m, ex: ex.id, src: srcOfEx(ex) };
    if (tid === 24) { t24Sync(ex, c); var jf = PR.linkedFcasts(c).filter(function (x) { return x.p != null && (x.outcome === "شد" || x.outcome === "نشد") && A.localDay(x.outcomeAt || "") === (o.d || today()); }).sort(function (a, b) { return String(a.outcomeAt).localeCompare(String(b.outcomeAt)); }).pop();
      if (jf) { m.p = jf.p; m.ok = jf.outcome === "شد"; m.out = F2O[jf.outcome]; m.fc = jf.id; m.n = PR.linkedFcasts(c).filter(function (x) { return x.outcome && A.localDay(x.outcomeAt || "") === (o.d || today()); }).length; } }   /* A21-11: نشستِ داوری اندازهٔ کالیبراسیون دارد */
    if (tid === 9) t9Sync(ex, c);
    if (tid === 21) t21Sync(ex, c, m);
    if (tid === 22) t22Sync(ex, c, m);
    if (tid === 31) { (ex.data.errors || []).forEach(function (r) { if (r && String(r.err || "").trim()) PR.listAdd("mistakes", { text: r.err, from: 31, prc: c.id }, { sample: c.sample }); }); }
    if (tid === 41 && !c.sample) p3Link(c);
    PR.session(c, sess);
    return c;
  };
  function summary(ex) { var t = A.TM[ex.tid], out = ""; (t.ws || []).forEach(function (f) { if (!out && (f.t === "text" || f.t === "area") && A.filled(ex.data[f.k])) out = String(ex.data[f.k]); }); return clip(out, 200); }
  function measOf(ex) {
    var d = ex.data || {}, m = {};
    if (ex.tid === 41) { var pc = num(d.actual); if (pc != null) m.pct = pc; }
    if (ex.tid === 28) { var tx = d.rewrite || d.explain || ""; if (tx && A.analyzeJargon) { var r = A.analyzeJargon(tx); m.jargon = r.jar.length + r.latin.length; m.len = r.words; } m.stuck = (d.gaps || []).filter(function (x) { return String(x || "").trim(); }); }
    if (ex.tid === 4 || ex.tid === 26 || ex.tid === 2) { var g = String((ex.tid === 4 ? d.map1 : ex.tid === 26 ? d.edges : d.reassemble) || ""); m.items = g.split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean); }
    if (ex.tid === 21) { m.complete = !!(String(d.hyp || "").trim() && String(d.criteria || "").trim() && String(d.result || "").trim() && d.verdict); m.verdict = d.verdict || ""; }
    if (ex.tid === 22) { if (d.status) m.status = d.status; if (String(d.found || "").trim()) m.obs = clip(d.found, 200); }
    if (ex.tid === 31) { m.problem = String(d.task || "").trim(); }
    return m;
  }
  /* نسخه‌ها (T28 فاینمن، T4/T26 نقشه و نمودار): هر بازنویسی/بازکشیدن با نسخهٔ پیشین و نسخهٔ نخست مقایسه می‌شود */
  PR.versions = function (c) {
    var L = (c.sessions || []).filter(function (s) { return !s.draft && s.meas && (s.meas.jargon != null || s.meas.items); }).sort(byD), first = L[0];
    return L.map(function (s, j) {
      var p = L[j - 1], m = s.meas, o = { d: s.d, n: j + 1 };
      if (m.jargon != null) { o.jargon = m.jargon; o.len = m.len; if (p && p.meas.jargon != null) { o.dJargon = m.jargon - p.meas.jargon; o.dLen = (m.len || 0) - (p.meas.len || 0); } }
      if (m.items && first && first.meas.items) { var f0 = first.meas.items.map(norm), mi = m.items.map(norm); o.added = mi.filter(function (x) { return f0.indexOf(x) < 0; }).length; o.removed = f0.filter(function (x) { return mi.indexOf(x) < 0; }).length; o.items = m.items.length; }
      return o;
    });
  };

  /* ---------- LT5: یک رکورد برای هر کار ---------- */
  /* دورِ ۲۱ (A21-9): یک خوانندهٔ تاریخ برای هر «موعد» — همان A.willWhen ِ صفحه («۱۵ آبان»، «پنجشنبه»، «هفتهٔ بعد»، ISO، «N روز دیگر»، «فردا»)؛
     خوانندهٔ کوتاهِ پیشین (فقط ISO، «N روز/هفته/ماه»، «فردا») پشتیبانِ بی A.willWhen است */
  function parseWhen(t, from) {
    var s = dg(t).trim(); if (!s) return "";
    var m = /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/.exec(s); if (m) { var r = A.epiRevDate ? A.epiRevDate(m[0]) : m[0]; return r || ""; }
    if (A.willWhen) { var W = A.willWhen(s, from || today()); if (W && W.date) return W.date; }
    m = /(\d+)\s*(روز|هفته|ماه)/.exec(s); if (m) return add(from || today(), +m[1] * (m[2] === "هفته" ? 7 : m[2] === "ماه" ? 30 : 1));
    if (/فردا/.test(s)) return add(from || today(), 1);
    return "";
  }
  PR.parseWhen = parseWhen;
  var O2F = { "درست": "شد", "نادرست": "نشد" }, F2O = { "شد": "درست", "نشد": "نادرست" };
  function sameQ(a, b) { return norm(a) && norm(a) === norm(b); }
  /* دورِ ۲۴ (R7، D24-14): پیش‌بینیِ بازِ گفت‌وگو (by:"chat"، بی نتیجه) که متنش درونِ متنِ تازه است یا برعکس — همان پیش‌بینی با جمله‌بندیِ دیگر */
  PR.chatFcastOf = function (q) { var nq = norm(q); if (nq.length < 6) return null; return S.all("fcast", function (x) { return !x.sample && !x.outcome && (x.by === "chat" || (x.src && x.src.chat)) && norm(x.q).length >= 6 && (nq.indexOf(norm(x.q)) >= 0 || norm(x.q).indexOf(nq) >= 0); }).slice(-1)[0] || null; };
  PR.dupFcast = function (q, sample) { return S.all("fcast", function (x) { return !!x.sample === !!sample && sameQ(x.q, q); })[0] || null; };
  /* ردیف‌های T24 ⇒ 🎯 (یک رکورد): ردیف شناسهٔ fcast را نگه می‌دارد؛ نتیجه از هر سو، آخرین تغییر برنده */
  /* دورِ ۲۰ (RO7، D·7): دو مرحله — هر ردیف همان لحظه که گزاره، اطمینان و موعدِ داوری دارد (پیش‌نویس هم) 🎯 ِ تاریخ‌دار می‌شود (روزِ نوشتن)؛
     ردیفِ بی‌موعد در پیش‌نویس 🎯 نمی‌سازد (تاریخ ساخته نمی‌شود — صفحه موعد را می‌خواهد)؛ تأمل‌ها پس از نتیجه */
  function t24Sync(ex, c, opt) {
    opt = opt || {}; var rows = (ex.data && ex.data.preds) || [], ch = false, base0 = A.localDay(ex.created) || today();
    rows.forEach(function (row, i) {
      if (!row) return; var q = clip(row.st, 200), p = num(row.conf); if (!q || p == null) return;
      var fc = row.fc && S.get(row.fc), base = row._d || (fc && A.localDay(fc.created)) || (opt.draft ? today() : base0);
      if (!fc && opt.draft && !parseWhen(row.due, base)) return;
      if (fc && !fc.outcome && fc.q !== q) { fc.q = q; S.put(fc); }
      if (!fc) { row._d = base; fc = PR.dupFcast(q, ex.sample); if (!fc) { fc = { id: A.uid("fc"), type: "fcast", q: q, p: p, due: parseWhen(row.due, base) || "", dim: "s_decision", tid: 24, src: { ex: ex.id, row: i }, prc: c.id }; if (ex.sample) fc.sample = true; S.put(fc); } else if (!fc.src) { fc.src = { ex: ex.id, row: i }; fc.prc = fc.prc || c.id; fc.tid = fc.tid || 24; S.put(fc); } row.fc = fc.id; row._fo = fc.outcome || ""; row._ro = ""; ch = true; }
      var dd = parseWhen(row.due, base); if (dd && fc.due !== dd) { fc.due = dd; S.put(fc); }
      if (fc.p !== p) { fc.p = p; S.put(fc); }
      if ((row.out || "") !== (row._ro || "")) { var o = O2F[row.out] || (row.out ? "نامعلوم" : ""); if (o !== (fc.outcome || "")) { fc.outcome = o; fc.outcomeAt = nowISO(); S.put(fc); } row._ro = row.out || ""; row._fo = fc.outcome || ""; ch = true; }
      else if ((fc.outcome || "") !== (row._fo || "")) { row.out = F2O[fc.outcome] || (fc.outcome ? "نامعلوم" : ""); row._ro = row.out; row._fo = fc.outcome || ""; ch = true; }
    });
    if (ch) S.put(ex);
  }
  PR.t24Sync = function (ex) { var c = ex.prc && S.get(ex.prc); if (c) t24Sync(ex, c, { draft: ex.status !== "done" }); };
  /* ردیف‌هایی که هنوز 🎯 نشده‌اند چون موعد ندارند (برای پرسیدنِ تاریخ) */
  PR.t24NoDate = function (ex) { var out = []; (((ex && ex.data) || {}).preds || []).forEach(function (row, i) { if (row && !row.fc && clip(row.st, 200) && num(row.conf) != null && !parseWhen(row.due, today())) out.push(i); }); return out; };
  /* T9: برآوردِ نهایی ⇒ یک fcast با موعدِ «ماهانه» ِ خودِ تکنیک؛ فاصلهٔ برآوردِ درونی و نرخِ پایه همان‌جا امتیاز می‌گیرد */
  function t9Sync(ex, c) {
    var d = ex.data || {}, q = clip(d.final || d.q, 200); if (!q) return;
    var fc = ex.fc && S.get(ex.fc);
    if (!fc) { fc = { id: A.uid("fc"), type: "fcast", q: q, p: null, est: true, due: add(today(), P[9].after), dim: "s_decision", tid: 9, src: { ex: ex.id }, prc: c.id, t9: { inside: clip(d.inside, 200), base: clip(d.base, 200), final: q } }; if (ex.sample) fc.sample = true; S.put(fc); ex.fc = fc.id; S.put(ex); }
    var pp = /(\d+(?:\.\d+)?)\s*[٪%]/.exec(dg(d.final || "")); if (pp && fc.p == null) { fc.p = +pp[1]; S.put(fc); }
    (c.links = c.links || {}).fc = fc.id;
  }
  /* امتیازِ T9 در موعد: |برآوردِ درونی − واقعی| در برابرِ |نرخِ پایه − واقعی| */
  PR.t9Score = function (fcId, actual) {
    var fc = S.get(fcId); if (!fc || !fc.t9) return null; var a = num(actual), i = num(fc.t9.inside), b = num(fc.t9.base), f = num(fc.t9.final);
    fc.t9.actual = a; fc.t9.at = today();
    if (a != null && i != null && b != null) { fc.t9.gapIn = Math.abs(i - a); fc.t9.gapBase = Math.abs(b - a); fc.t9.closer = fc.t9.gapBase < fc.t9.gapIn ? "base" : fc.t9.gapBase > fc.t9.gapIn ? "inside" : "tie"; }
    if (a != null && f != null) fc.t9.gapFinal = Math.abs(f - a);
    fc.outcome = fc.outcome || "سنجیده شد"; fc.outcomeAt = nowISO(); S.put(fc);
    var c = fc.prc && S.get(fc.prc); if (c) PR.session(c, { what: "مقایسهٔ ماهانه با نتیجهٔ واقعی: " + fa(actual), meas: { t9: fc.t9 } });
    return fc.t9;
  };
  /* T21 از گره ⇒ همان آزمایشِ گره (kexp)؛ از مسئلهٔ زنده ⇒ گامِ همان مسئله خودش رکورد است */
  var V2O = { "تأیید شد": "same", "رد شد": "diff", "نامعلوم": "mixed" };
  function t21Sync(ex, c, m) {
    var d = ex.data || {}; if (c.subj.k !== "knot") return;
    var x = ex.kexp && S.get(ex.kexp);
    if (!x) { x = { id: A.uid("kexp"), type: "kexp", knot: c.subj.id, plan: clip(d.hyp || d.belief, 300), predict: clip(d.criteria, 300), conf: 0, due: c.udue || A.addDays(today(), 3), status: "planned", prc: c.id, ex: ex.id }; if (ex.sample) x.sample = true; ex.kexp = x.id; S.put(ex); }
    if (m.complete && x.status !== "done") { x.observe = clip(d.result, 300); x.outcome = V2O[d.verdict] || "mixed"; x.reflect = clip(d.update || d.verdict, 300); x.status = "done"; x.doneAt = today() + "T" + nowISO().slice(11); }
    S.put(x);
    try { var k = S.get(c.subj.id); if (k && A.kstatusSync) A.kstatusSync(k, true); } catch (e) { }
  }
  PR.linkedKexp = function (c) { return S.all("kexp", function (x) { return x.prc === c.id || (c.subj && c.subj.k === "knot" && x.knot === c.subj.id && c.tid === 21); }).sort(function (a, b) { return String(a.created).localeCompare(String(b.created)); }); };
  PR.linkedFcasts = function (c) { return S.all("fcast", function (x) { return x.prc === c.id; }); };
  /* T22 ⇄ پروندهٔ معرفتی: کاربرگ از کتابخانه پرونده می‌سازد (یا به همان می‌پیوندد) با revdate؛ حکم و بازبینی روی خودِ پرونده می‌نشیند */
  function ecaseOf(c) { var id = c.subj.k === "case" ? c.subj.id : (c.links || {}).ecase; return id && S.get(id); }
  PR.ecaseOf = ecaseOf;
  function t22Sync(ex, c, m) {
    var d = ex.data || {}, cs = ecaseOf(c);
    if (!cs && !c.sample && A.newCase) {
      var same = S.all("case", function (x) { return !x.sample && sameQ(x.title, d.belief); })[0];
      cs = same || A.newCase({ title: clip(d.belief || "باور", 70), input: d.belief || "", src: { type: "practice", id: c.id } });
      (c.links = c.links || {}).ecase = cs.id;
    }
    if (!cs) return;
    cs.prc = cs.prc || c.id; cs.st = cs.st || {};
    if (!cs.st.st_tasdiq) cs.st.st_tasdiq = { data: { claims: [{ txt: d.belief || cs.title }] }, done: false, rubric: [] };
    var fin = cs.st.st_final = cs.st.st_final || { data: {}, done: false, rubric: [] }; fin.data = fin.data || {};
    if (!(fin.data.final || []).length) fin.data.final = [{ c: "1", p: "" }];
    var v = m.status && VERD[m.status];
    if (v) {
      var o = m.status === "باطل شد" ? "نادرست" : m.status === "از آزمون جان سالم به در برد" ? "درست" : "نامعلوم";
      cs.outcome = cs.outcome || {}; cs.outcome["1"] = o; if (!cs.outcomeAt) cs.outcomeAt = nowISO();
      var rr = add(today(), P[22].every); fin.data.revdate = rr;
      var H = cs.prcHist = cs.prcHist || []; if (!H.some(function (e) { return e.d === today() && e.v === v; })) H.push({ d: today(), v: v, obs: m.obs || "", prc: c.id });
    } else if (!fin.data.revdate) fin.data.revdate = add(today(), P[22].every);
    S.put(cs);
  }
  /* T41 ⇄ P3: همان چرخهٔ ۱-۳-۷ ِ موضوع (یکی)؛ موعدهایش را خودِ P3 در «امروز» می‌دهد */
  function p3Link(c) {
    var tp = c.subj.k === "topic" ? c.subj.id : "", title = PR.subjTitle(c.subj);
    var open = S.all("sched", function (s) { return s.proto === "P3" && !s.done && ((tp && s.topic === tp) || (!tp && sameQ(s.title, title))); });
    if (!open.length && !(c.links || {}).p3) {
      [[1, "روز ۱"], [3, "روز ۳"], [7, "روز ۷"]].forEach(function (x) { S.put({ id: A.uid("sc"), type: "sched", proto: "P3", topic: tp, title: title, due: add(today(), x[0]), label: x[1], done: false, prc: c.id }); });
      open = S.all("sched", function (s) { return s.prc === c.id; });
    }
    (c.links = c.links || {}).p3 = open.map(function (s) { return s.id; }).concat(((c.links || {}).p3 || [])).filter(function (x, j, a) { return a.indexOf(x) === j; });
    S.put(c);
  }
  /* P3/P4 ِ همان موضوع ⇒ جلسهٔ پروندهٔ T41 با درصدِ سنجیده */
  var rawProto = A.onProtoDone;
  if (rawProto) A.onProtoDone = function (r) {
    var out = rawProto.apply(this, arguments);
    try {
      if (r && (r.pid === "P3" || r.pid === "P4") && r.status === "done") {
        var sc = r.sched && S.get(r.sched), c = sc && sc.prc && S.get(sc.prc);
        if (!c) c = PR.all(function (x) { return x.tid === 41 && x.kind !== "list" && own(x) && ((r.topic && x.subj.id === r.topic) || (sc && (x.links || {}).p3 && x.links.p3.indexOf(sc.id) >= 0)); })[0];
        if (c && r.data && r.data.pct != null) PR.session(c, { what: (r.pid === "P4" ? "برگهٔ سفیدِ هفتگی" : "برگهٔ سفید " + (sc ? sc.label : "")), meas: { pct: num(r.data.pct) }, src: "p3" });
      }
    } catch (e) { console.error(e); }
    return out;
  };
  /* T42: هر نمره‌دادنِ کارتِ T42 جلسهٔ پروندهٔ (T42 × موضوعِ کارت)؛ «یادم نبود» پایداری را پس می‌گیرد (فاصله را خودِ SM-2 به ۱ برمی‌گرداند) */
  var rawGrade = A.srsGrade;
  A.srsGrade = function (card, g, conf) {
    var lastD = card && (card.hist || []).length ? card.hist[card.hist.length - 1].d : (card && card.created ? A.localDay(card.created) : null), wasDue = card && card.due;
    var out = rawGrade.apply(this, arguments);
    try {
      if (card && +card.tid === 42 && !card.sample) {
        var subj = card.knot ? PR.subj("knot", card.knot) : card.topic ? PR.subj("topic", card.topic) : PR.subj("free", "", clip(card.q, 60));
        var c = (card.prc && S.get(card.prc)) || PR.start(42, subj, { src: "card" }); if (card.prc !== c.id) { card.prc = c.id; S.put(card); }
        var el = lastD ? gap(lastD, today()) : null, late = wasDue && wasDue < today() ? gap(wasDue, today()) : 0;
        var s = PR.session(c, { what: "مرورِ کارت «" + clip(card.q, 50) + "»", ok: g >= 3, meas: { g: g, el: el, late: late, card: card.id, iv: card.iv }, src: "card" });
        if (s) s.okSet = true;
      }
    } catch (e) { console.error(e); }
    return out;
  };

  /* دفترِ کالیبراسیون — هر کار یک بار: 🎯 (از جمله گام‌های مسئلهٔ زنده و ردیف‌های T24 ِ پیوسته)، ردیفِ قدیمیِ T24 بی پیوند، اطمینانِ کارت («مرور کارت»)، پرونده */
  PR.calib = function () {
    var pts = [];
    S.all("fcast", function (x) { return own(x) && x.p != null && (x.outcome === "شد" || x.outcome === "نشد"); }).forEach(function (x) { pts.push({ p: x.p / 100, o: x.outcome === "شد" ? 1 : 0, src: x.live ? "گامِ مسئلهٔ زنده" : x.tid === 24 ? "کاربرگِ ۲۴" : "🎯 دفترِ پیش‌بینی", id: "fcast:" + x.id, q: x.q }); });
    S.all("ex", function (e) { return e.tid === 24 && !e.sample; }).forEach(function (e) { ((e.data || {}).preds || []).forEach(function (row, i) { if (!row || row.fc) return; var p = num(row.conf); if (p == null || !O2F[row.out]) return; pts.push({ p: p / 100, o: row.out === "درست" ? 1 : 0, src: "کاربرگِ ۲۴", id: "ex:" + e.id + ":" + i, q: row.st }); }); });
    S.all("card", function (c) { return !c.sample; }).forEach(function (c) { (c.hist || []).forEach(function (hh, i) { if (hh.c != null) pts.push({ p: hh.c / 100, o: hh.g >= 3 ? 1 : 0, src: "مرور کارت", id: "card:" + c.id + ":" + i, q: c.q }); }); });
    return pts;
  };

  /* ---------- LT6: نتیجه به خودِ مسئله برمی‌گردد ---------- */
  function liveGuess(pid) { try { var U = A.solveUI; if (!U || !A.liveRec || !A.liveRec(pid)) return null; var pg = U.prog(pid), s = U.sol(pg); return { pg: pg, s: s, g: s.g && s.g[1] }; } catch (e) { return null; } }
  /* آزمونِ حدسِ مسئله از پروندهٔ تمرین: confirm | refute — تأیید هرگز «اثبات» نیست و مسئله را نمی‌بندد */
  PR.guessTest = function (c, res, what, d) {
    if (typeof c === "string") c = S.get(c); if (!c || c.subj.k !== "live" || !own(c)) return null;
    var G = liveGuess(c.subj.id); if (!G || !G.g) return null; d = d || today();
    var T = G.g.prcTests = G.g.prcTests || [];
    if (!T.some(function (x) { return x.d === d && x.res === res && x.prc === c.id; })) T.push({ d: d, res: res, what: clip(what, 160), prc: c.id, at: nowISO() });
    var conf = T.filter(function (x) { return x.res === "confirm"; }), ref = T.filter(function (x) { return x.res === "refute"; });
    if (ref.length) { G.g.refuted = { d: ref[0].d, prc: c.id, by: "practice" }; G.g.testRes = "حدس رد شد"; }
    else G.g.testRes = "تأیید در " + fa(conf.length) + " آزمون";
    S.put(G.pg);
    PR.session(c, { d: d, what: what, ok: res === "confirm", meas: { guess: res }, src: "live" });
    return PR.guessStatus(c.subj.id);
  };
  /* دورِ ۲۰ (RO7، A10 B·D12 C20-11): وضعِ حدس از رکوردهای حدسِ خودِ مسئله — داوریِ بازنگری (hit)، رد/اثبات (refuted/proved)، رابطهٔ نتیجهٔ گام‌ها
     با حدس (rel)، حدس‌های پیشینِ ردشده (guessHist) و آزمون‌های پروندهٔ تمرین (prcTests) — نه فقط آخری. «هنوز آزموده نشده» فقط وقتی هیچ‌کدام نیست. */
  function gDay(x) { return x ? A.localDay(String(x)) || String(x).slice(0, 10) : ""; }
  PR.guessStatus = function (pid) {
    var G = liveGuess(pid); if (!G) return null; var g = G.g || {}, L = (G.s && G.s.live) || {}, T = g.prcTests || [];
    var conf = T.filter(function (x) { return x.res === "confirm"; }), ref = T.filter(function (x) { return x.res === "refute"; });
    var stR = null, stC = [];
    (L.steps || []).forEach(function (st) { var gg = st && st.out && st.out.guess; if (!gg || (g.since && String(st.out.at || "") <= g.since)) return; if (gg.rel === "refute" && !stR) stR = st.out.at || st.at; if (gg.rel === "confirm") stC.push(st.out.at || st.at); });
    var hist = (L.guessHist || []).filter(function (x) { return x && x.refutedAt; });
    var text = g.guess || (g.withdrawn && g.withdrawn.old) || (hist.length ? hist[hist.length - 1].guess : "");
    if (!text) return null;
    var st = "untested", label = "هنوز آزموده نشده", d = "";
    if (g.withdrawn && !g.guess) { st = "withdrawn"; label = "پس گرفته شد"; }
    else if (g.refuted || g.refutedAt || g.hit === "نادرست بود" || stR || ref.length || (!g.guess && hist.length)) {
      st = "refuted"; d = gDay(g.refutedAt || (typeof g.refuted === "string" ? g.refuted : g.refuted && g.refuted.d) || "" || g.hitAt || stR || (ref[0] && ref[0].d) || (hist.length && hist[hist.length - 1].refutedAt));
      label = "حدس رد شد" + (d ? " (" + fdate(d) + ")" : "") + (g.hit === "نادرست بود" ? " — داوریِ خودت در بازنگری" : stR ? " — نتیجهٔ یک گام" : ref.length ? " — آزمونِ پروندهٔ تمرین" : "");
    } else if (g.proved || g.hit === "درست بود") { st = g.proved ? "proved" : "confirmed"; d = gDay(g.proved || g.hitAt); label = (g.proved ? "درست درآمد — حل/اثبات شد" : "درست بود — داوریِ خودت در بازنگری") + (d ? " (" + fdate(d) + ")" : ""); }
    else if (g.hit === "تاحدی") { st = "partial"; label = "تا حدی درست — داوریِ خودت"; }
    else if (conf.length || stC.length) { st = "confirmed"; var n = conf.length + stC.length; label = "تأیید در " + fa(n) + " آزمون (" + conf.map(function (x) { return fdate(x.d); }).concat(stC.map(function (x) { return fdate(gDay(x)); })).join("، ") + ") — تأیید، اثبات نیست"; }
    return { text: text, tests: T, status: st, label: label, refuted: st === "refuted", proved: st === "proved", confirms: conf.length + stC.length, d: d };
  };

  /* تکرارِ مشکل (T39) — هر بار با تاریخ؛ سومین بار پیشنهادِ حلقهٔ دوم */
  PR.recur = function (subj, d, note) {
    var c = PR.start(39, subj, { src: "page" }); d = d || today(); c.occ = c.occ || []; if (c.occ.indexOf(d) < 0) c.occ.push(d); c.occ.sort();
    if (note) (c.occN = c.occN || {})[d] = clip(note, 160); PR.save(c); return c;
  };
  PR.knotSuggest = function (knotId) {
    var k = S.get(knotId); if (!k) return null; var c = PR.find(39, PR.subj("knot", knotId));
    if ((k.status || "") === "returned") return { tid: 39, prc: c ? c.id : null, why: "گره دوباره پیش آمد (" + fdate(A.localDay(k.returnedAt || "")) + ") — مشکلی که با اصلاح‌ها برمی‌گردد، وقتِ یادگیریِ دوحلقه‌ای است (T39)." };
    return null;
  };

  /* ---------- کنش‌های کاربر روی پرونده ---------- */
  PR.pause = function (c, why) { if (typeof c === "string") c = S.get(c); if (!c || c.closed) return; (c.hist = c.hist || []).push({ d: today(), at: nowISO(), ev: "pause", why: clip(why, 160) }); PR.save(c); return c; };
  PR.resume = function (c) { if (typeof c === "string") c = S.get(c); if (!c) return; (c.hist = c.hist || []).push({ d: today(), at: nowISO(), ev: "resume" }); PR.save(c); return c; };
  PR.close = function (c, why) { if (typeof c === "string") c = S.get(c); if (!c) return; c.closed = { d: today(), why: clip(why, 160) }; (c.hist = c.hist || []).push({ d: today(), at: nowISO(), ev: "close", why: clip(why, 160) }); PR.save(c); return c; };
  /* «تثبیت شد» ِ بی‌شاهد فقط ادعای خودِ کاربر است — وضع و موعد عوض نمی‌شود */
  PR.claim = function (c) { if (typeof c === "string") c = S.get(c); if (!c) return; c.claim = { d: today(), at: nowISO() }; (c.hist = c.hist || []).push({ d: today(), at: nowISO(), ev: "claim", why: "خودت گفتی «تثبیت شد»" + (c.state === "stable" ? "" : " — شاهدِ تاریخ‌دار هنوز کامل نیست") }); PR.save(c); return c; };
  /* آهنگِ خودِ او از حرفِ خودش: «هر دو هفته»، «هر ۱۰ روز»، «ماهی یه بار»، «هفته‌ای دو بار»، «یه روز در میون» ⇒ فاصله به روز (عددِ خودِ او؛ بی پیش‌فرض) */
  var NW = { "یک": 1, "یه": 1, "دو": 2, "سه": 3, "چهار": 4, "پنج": 5, "شش": 6, "شیش": 6, "هفت": 7, "هشت": 8, "نه": 9, "ده": 10 };
  PR.rhythmIn = function (t) {
    var x = norm(t), m, NEG = function (mm) { return /^ ?(نه|نمیشه|نمی شه|نخیر)( |$)/.test(x.slice(mm.index + mm[0].length)) || /(^| )نه $/.test(x.slice(0, mm.index + (mm[0].charAt(0) === " " ? 1 : 0))); }, U = function (u) { return /روز/.test(u) ? 1 : /هفته/.test(u) ? 7 : 30; }, N = function (w) { return w == null || w === "" ? 1 : /\d/.test(w) ? +w : NW[w]; };
    if (/روز در (میون|میان)/.test(x)) return 2;
    /* دورِ ۲۲ (bank R22 #153): «هر روز نه، فقط امروز…» نفیِ آهنگ است، نه آهنگ */
    if ((m = /(?:^| )هر (\d+|یک|یه|دو|سه|چهار|پنج|شش|شیش|هفت|هشت|نه|ده)? ?(روز|هفته|ماه)/.exec(x))) { if (NEG(m)) return null; var n = N(m[1]); return n ? n * U(m[2]) : null; }
    if ((m = /(روزی|هفته ای|ماهی) (\d+|یک|یه|دو|سه|چهار|پنج) ?(بار|دفعه|جلسه)/.exec(x))) { var k = N(m[2]); return k ? Math.max(1, Math.round(U(m[1]) / k)) : null; }
    /* دورِ ۲۲ (P6، D·s36): «دو هفته یه بار» (بی «هر») و «یه ماه دیگه» / «سه روز بعد» (نوبتِ بعدی که خودش گفت) همان فاصلهٔ خودِ اوست */
    if ((m = /(?:^| )(\d+|یک|یه|دو|سه|چهار|پنج|شش|شیش|هفت|هشت|نه|ده) ?(روز|هفته|ماه) (?:یه|یک) ?(?:بار|دفعه|جلسه)/.exec(x))) { var n2 = N(m[1]); return n2 ? n2 * U(m[2]) : null; }
    if ((m = /(?:^| )(\d+|یک|یه|دو|سه|چهار|پنج|شش|شیش|هفت|هشت|نه|ده)? ?(روز|هفته|ماه) (?:دیگه|دیگر|بعد)(?: |$)/.exec(x))) { var n3 = N(m[1]); return n3 ? n3 * U(m[2]) : null; }
    return null;
  };
  PR.rhythm = function (c, quote) {
    if (typeof c === "string") c = S.get(c); if (!c) return null; var n = PR.rhythmIn(quote); if (!n) return null;
    var was = c.urhythm; c.urhythm = { every: n, quote: clip(quote, 160), d: today(), from: today() };
    (c.hist = c.hist || []).push({ d: today(), at: nowISO(), ev: "rhythm", why: "آهنگِ خودت: «" + clip(quote, 80) + "» — هر " + fa(n) + " روز" + (was ? " (پیش‌تر هر " + fa(was.every) + " روز)" : "") });
    var R = PR.save(c); c.udue = R.due || ""; S.put(c); return c;
  };
  PR.setDue = function (c, d) { if (typeof c === "string") c = S.get(c); if (!c) return; c.udue = d || ""; PR.save(c); return c; };
  /* کاربرگِ تازه برای همین پرونده (پیش‌نویسِ بازِ همین پرونده دوباره به کار می‌رود، نه یکی دیگر) */
  /* دورِ ۲۱ (R5، D·9 s31): کاربرگِ کالیبراسیون (T24) یک دفترِ جاری است — هر ردیفش همان 🎯 است؛ «ادامه با کاربرگ» همان کاربرگی را باز می‌کند که
     پیش‌بینی‌های بازش در آن است (تا نتیجه در همان ردیف = همان 🎯 بنشیند)، نه کاربرگِ خالیِ تازه که نتیجه‌ها را در ردیف‌های بی‌گزاره می‌گرفت */
  function wsOfCase(c) {
    var L = S.all("ex", function (e) { return e.prc === c.id; }), dr = L.filter(function (e) { return e.status === "draft"; })[0];
    if (dr || (P[c.tid] || {}).shape !== "calib") return dr || null;
    return L.filter(function (e) { return ((e.data || {}).preds || []).some(function (r) { return r && r.fc; }); }).sort(function (a, b) { return String(b.created || "").localeCompare(String(a.created || "")); })[0] || null;
  }
  PR.wsOfCase = wsOfCase;
  PR.openWS = function (c) {
    if (typeof c === "string") c = S.get(c); if (!c) return;
    var ex = wsOfCase(c);
    if (!ex) { ex = A.newEx(c.tid, c.subj.k === "topic" ? c.subj.id : ""); ex.prc = c.id; if (c.subj.k === "knot") ex.knot = c.subj.id; if (c.subj.k === "live") ex.lprob = c.subj.id; if (c.subj.k === "case") ex.ecase = c.subj.id; if (c.subj.k === "free") ex.freeT = c.subj.t; if (c.sample) ex.sample = true; S.put(ex); }
    A.go("tech", c.tid, "ws:" + ex.id); return ex;
  };
  /* شروع از یک صفحه (مسئله، پرونده، گره، دستیار): پرونده و کاربرگ */
  PR.startFrom = function (tid, subj, src, go) { var c = PR.start(tid, subj, { src: src }); if (c && go !== false) PR.openWS(c); return c; };
  /* کاربرگِ تازه از کتابخانه روی موضوعی که پرونده‌اش باز است ⇒ همان پرونده (بانکِ LT2 #30) */
  var rawNewEx = A.newEx;
  A.newEx = function (tid, topic) {
    var ex = rawNewEx.apply(this, arguments);
    try { if (!ex.prc && topic) { var c = PR.find(tid, PR.subj("topic", topic)); if (c) { ex.prc = c.id; S.put(ex); } } } catch (e) { }
    return ex;
  };

  /* ---------- LT7: فهرست‌های جاری ---------- */
  PR.list = function (name, o) {
    o = o || {}; var L = LISTS[name]; if (!L) return null; var smp = !!o.sample;
    var c = PR.all(function (x) { return x.kind === "list" && x.list === name && !!x.sample === smp; })[0];
    if (!c) { c = { id: A.uid("prl"), type: "practice", kind: "list", list: name, tid: L.tid, start: today(), items: [], reviews: [], hist: [{ d: today(), at: nowISO(), ev: "start" }], state: "open" }; if (smp) c.sample = true; S.put(c); listSave(c); }
    return c;
  };
  function itemKey(name, it) { return norm(it.text || it.name || it.claim || it.driver || ""); }
  PR.listAdd = function (name, it, o) {
    var c = PR.list(name, o); if (!c) return null; it = it || {}; var k = itemKey(name, it); if (!k) return null;
    var x = c.items.filter(function (y) { return itemKey(name, y) === k; })[0];
    if (!x) { x = { id: "it" + (c.items.length + 1) + "_" + Math.random().toString(36).slice(2, 6), d: today(), at: nowISO(), hist: [] }; c.items.push(x); }
    /* دورِ ۲۲ (P7): هر مورد پیوندِ مسئله (pid، یا مسئلهٔ گفت‌وگو chatProb) و سشنش (sess) را دارد و نقلِ حرفِ خودش (quote) را — تا در 🔭 و 📜 و کارنامه بیاید */
    ["text", "name", "claim", "driver", "load", "from", "prc", "mistake", "pid", "sess", "quote", "chatProb", "ex"].forEach(function (f) { if (it[f] != null && it[f] !== "" && (x[f] == null || f === "load" || f === "mistake")) x[f] = it[f]; });
    if (it.load != null && x.hist) { var lh = x.hist.filter(function (e) { return e.load != null; }).pop(); if (!lh ? !!it.load : lh.load !== !!it.load) x.hist.push({ d: today(), load: !!it.load, why: it.loadWhy || "" }); }
    if (it.from) { x.froms = x.froms || []; if (x.froms.indexOf(it.from) < 0) x.froms.push(it.from); }
    if (it.p != null && x.p == null) { x.p = it.p; x.hist.push({ d: today(), p: it.p, why: "ثبتِ نخست" }); }
    if (it.recheck != null) { x.recheck = it.recheck || ""; x.needDate = !x.recheck; }
    if (name === "claims" && x.recheck == null) { x.recheck = ""; x.needDate = true; }
    if (it.share != null) { x.shares = x.shares || []; x.shares.push({ d: today(), v: num(it.share) }); }
    if (it.conf != null) { x.hist.push({ d: today(), conf: num(it.conf), verdict: it.verdict || "" }); }
    if (name === "beliefs" && it.mistake) PR.listAdd("mistakes", { text: x.text, from: 34 }, o);
    (it.hyps || []).forEach(function (hy) { if (hy && String(hy.t || hy.h || "").trim()) hypSet(x, hy.t || hy.h, hy.p, hy.why || "ثبتِ نخست"); });
    listSave(c); return x;
  };
  PR.listItem = function (name, k, o) { var c = PR.list(name, o); var n = norm(k); return c.items.filter(function (y) { return y.id === k || itemKey(name, y) === n; })[0] || null; };
  PR.listReview = function (name, note, o) { var c = PR.list(name, o); var d = today(); if (c.reviews.indexOf(d) < 0) c.reviews.push(d); (c.hist = c.hist || []).push({ d: d, at: nowISO(), ev: "review", why: clip(note, 160) }); c.event = null; listSave(c); return c; };
  /* رویدادِ مهم (T15): بازبینیِ فوریِ فرض‌های باربر */
  PR.listEvent = function (name, what, o) { var c = PR.list(name, o); c.event = { d: today(), what: clip(what, 160) }; (c.hist = c.hist || []).push({ d: today(), at: nowISO(), ev: "event", why: clip(what, 160) }); listSave(c); return c; };
  /* کاربستِ مدل (T16): هر روز/تصمیم یک بار؛ «پذیرفته» با سه کاربستِ واقعی در سه روزِ جدا */
  PR.modelUse = function (name, u, o) {
    u = u || {}; var c = PR.list("models", o), x = PR.listAdd("models", { name: name, text: name }, o); if (!x) return null;
    var d = u.d || today(); x.uses = x.uses || [];
    var key = d + "|" + norm(u.where || "");
    if (!x.uses.some(function (y) { return y.d + "|" + norm(y.where || "") === key || (y.d === d && !u.where); })) x.uses.push({ d: d, where: clip(u.where, 120), real: u.real !== false, link: u.link || (u.pid ? { k: "live", id: u.pid } : null), sess: u.sess || "", quote: u.quote ? clip(u.quote, 200) : "", at: nowISO() });
    modelStatus(x); listSave(c); return x;
  };
  function modelDays(x) { var o = {}; (x.uses || []).forEach(function (u) { if (u.real) o[u.d] = 1; }); return Object.keys(o).sort(); }
  /* شمارِ کاربست = روزهای جدا (دو بار در یک روز/یک تصمیم یک بار)؛ «پذیرفته» فقط با کاربستِ واقعی در سه روزِ جدا (متنِ T16) */
  function modelStatus(x) { var dd = modelDays(x), all = {}, was = x.status; (x.uses || []).forEach(function (u) { all[u.d] = 1; }); x.status = dd.length >= LISTS.models.admit ? "پذیرفته" : "نامزد"; if (x.status === "پذیرفته" && was !== "پذیرفته") x.admitted = dd[LISTS.models.admit - 1]; x.count = Object.keys(all).length; x.realDays = dd.length; }
  PR.modelDays = modelDays;
  /* ابهام (T35): هر تغییرِ احتمال با تاریخ و دلیل؛ پیشین پاک نمی‌شود */
  PR.ambUpdate = function (k, p, why, o) { var c = PR.list("ambiguities", o), x = PR.listItem("ambiguities", k, o); if (!x) return null; x.hist.push({ d: today(), p: num(p), from: x.p, why: clip(why, 160) }); x.p = num(p); listSave(c); return x; };
  /* بستن با نوع (دورِ ۲۲، P7): resolved «حل/روشن شد» · refuted «رد شد» · closed «بسته»؛ تاریخچه می‌ماند، مرورِ بعد دیگر برش نمی‌گرداند */
  var CLOSE_FA = PR.CLOSE_FA = { resolved: "حل/روشن شد", refuted: "رد شد", closed: "بسته شد" };
  PR.itemClose = function (name, k, how, o, kind) { var c = PR.list(name, o), x = PR.listItem(name, k, o); if (!x) return null; kind = CLOSE_FA[kind] ? kind : "closed";
    x.closed = { d: today(), at: nowISO(), how: clip(how, 160), kind: kind }; (x.hist = x.hist || []).push({ d: today(), ev: "close", kind: kind, why: clip(how, 160) }); listSave(c); return x; };
  PR.itemReopen = function (name, k, why, o) { var c = PR.list(name, o), x = PR.listItem(name, k, o); if (!x || !x.closed) return null; (x.hist = x.hist || []).push({ d: today(), ev: "reopen", why: clip(why, 160), was: x.closed.kind }); x.closed = null; listSave(c); return x; };
  /* ابهام (T35): چند فرضیه هر کدام با احتمال؛ هر تغییر با تاریخ و دلیل، پیشین پاک نمی‌شود */
  function hypSet(x, t, p, why) {
    var H = x.hyps = x.hyps || [], n = norm(t), hy = H.filter(function (y) { return norm(y.t) === n || y.id === t; })[0], v = num(p);
    if (!hy) { if (!n) return null; hy = { id: "h" + (H.length + 1), t: clip(t, 160), p: v, d: today(), hist: [{ d: today(), p: v, why: clip(why || "ثبتِ نخست", 160) }] }; H.push(hy); return hy; }
    if (v != null && v !== hy.p) { hy.hist.push({ d: today(), p: v, from: hy.p, why: clip(why, 160) }); hy.p = v; }
    return hy;
  }
  PR.hypSet = function (k, t, p, why, o) { var c = PR.list("ambiguities", o), x = PR.listItem("ambiguities", k, o); if (!x) return null; var hy = hypSet(x, t, p, why); listSave(c); return hy; };
  PR.loadSet = function (k, v, why, o) { return PR.listAdd("assumptions", { text: (PR.listItem("assumptions", k, o) || {}).text || k, load: !!v, loadWhy: why || "" }, o); };
  /* ادعا (T10): نتیجهٔ دادهٔ خارج از نمونه ⇒ حکم؛ یادآورِ ادعای حکم‌خورده برداشته می‌شود */
  /* دورِ ۲۲ (P7، D·s32): حکم می‌تواند تاریخِ بررسیِ دوبارهٔ خودش را داشته باشد («یه ماه دیگه دوباره نگاه می‌کنم») ⇒ موعد؛ بی آن، یادآورِ پیشین برداشته می‌شود و تاریخ پرسیده می‌شود */
  PR.claimResult = function (k, result, verdict, o, recheck) { var c = PR.list("claims", o), x = PR.listItem("claims", k, o); if (!x) return null; x.result = clip(result, 200); x.verdict = verdict || ""; x.decidedAt = today();
    (x.hist = x.hist || []).push({ d: today(), verdict: x.verdict, why: clip(result, 160) });
    if (recheck) { x.recheck = recheck; x.recheck2 = true; x.needDate = false; } else { x.recheck2 = false; x.needDate = true; }
    listSave(c); return x; };
  PR.paretoShare = function (driver, v, o) { return PR.listAdd("pareto", { driver: driver, text: driver, share: v }, o); };
  /* دورِ ۲۲ (P7، bank #167): جمعِ آخرین سهمِ عامل‌های باز — بیش از ۱۰۰٪ ناممکن است و بی‌صدا پذیرفته نمی‌شود (نشان داده می‌شود تا خودش درستش کند) */
  PR.paretoSum = function (o) { var c = PR.list("pareto", o), t = 0, n = 0; (c.items || []).forEach(function (x) { if (x.closed) return; var L = (x.shares || []).filter(function (y) { return y.v != null; }); if (L.length) { t += L[L.length - 1].v; n++; } }); return { sum: t, n: n, over: t > 100 }; };
  PR.beliefRevise = function (k, conf, verdict, mistake, o) { var c = PR.list("beliefs", o), x = PR.listItem("beliefs", k, o); if (!x) return null; x.hist.push({ d: today(), conf: num(conf), verdict: verdict || "" }); if (mistake) { x.mistake = true; var m = PR.listAdd("mistakes", { text: x.text, from: 34 }, o); x.mistakeId = m && m.id; } listSave(c); return x; };
  PR.listLink = function (name, k, prcId, o) { var c = PR.list(name, o), x = PR.listItem(name, k, o); if (!x) return null; x.prc = prcId; listSave(c); return x; };
  function listFromEx(ex, cs0) {
    var d = ex.data || {}, o = { sample: !!ex.sample }, t = ex.tid, L0 = function (it) { var lp = ex.lprob || (cs0 && cs0.subj && cs0.subj.k === "live" ? cs0.subj.id : ""); if (lp && !it.pid) it.pid = lp; if (cs0 && !it.prc) it.prc = cs0.id; it.ex = ex.id; return it; };   /* دورِ ۲۲: موردِ کاربرگ به مسئلهٔ همان کاربرگ پیوند دارد */
    if (t === 15) (d.assum || []).forEach(function (r) { if (r && String(r.a || "").trim()) PR.listAdd("assumptions", L0({ text: r.a, load: /فرو می‌ریزد/.test(r.load || "") }), o); });
    if (t === 16) (d.models || []).forEach(function (r) { if (r && String(r.m || "").trim()) PR.modelUse(r.m, { where: clip(d.event, 120), real: true, link: ex.lprob ? { k: "live", id: ex.lprob } : null }, o); });
    if (t === 34) { if (String(d.belief || "").trim()) PR.listAdd("beliefs", L0({ text: d.belief, conf: d.conf1 != null && d.conf1 !== "" ? d.conf1 : d.conf0 }), o); if (String(d.log || "").trim()) PR.listAdd("mistakes", L0({ text: d.log, from: 34 }), o); }
    if (t === 35) { var p0 = ((d.hyp || [])[0] || {}).p; if (String(d.problem || "").trim()) PR.listAdd("ambiguities", L0({ text: d.problem, p: num(p0), hyps: (d.hyp || []).map(function (y) { return y && { t: y.h || y.t || y.hyp || "", p: y.p }; }).filter(Boolean) }), o); }
    if (t === 3) (d.drivers || []).forEach(function (r) { if (r && String(r.name || "").trim()) PR.paretoShare(r.name, r.val, o); });
    if (t === 10) { if (String(d.claim || "").trim()) { var x = PR.listAdd("claims", L0({ claim: d.claim, text: d.claim, recheck: parseWhen(d.action, today()) }), o); if (x && d.verdict && String(d.oos || "").trim()) PR.claimResult(x.id, d.oos, d.verdict, o); } }
    var nm = { 15: "assumptions", 16: "models", 34: "beliefs", 35: "ambiguities", 3: "pareto", 10: "claims" }[t];
    return nm ? PR.list(nm, o) : null;
  }
  /* موعدهای فهرست: مرورِ دوره‌ای به آهنگِ تکنیک؛ رویدادِ مهم ⇒ بازبینیِ فوری؛ ادعا ⇒ تاریخی که خودِ کاربر نوشت (بی تاریخِ ساختگی) */
  function listEval(c) {
    var L = LISTS[c.list] || {}, open = (c.items || []).filter(function (x) { return !x.closed; }), out = [];
    var last = (c.reviews || []).slice().sort().pop() || c.start;
    if (L.every && open.length) out.push({ id: c.id, due: add(last, L.every), reason: "مرورِ " + L.fa + " (" + L.cite + ")" });
    if (c.list === "assumptions" && c.event && open.some(function (x) { return x.load; })) out.push({ id: c.id + ":ev", due: c.event.d, reason: "رویدادِ مهم «" + clip(c.event.what, 60) + "» — بازبینیِ فرض‌های باربر" });
    if (c.list === "claims") open.forEach(function (x) { if (x.recheck && (!x.decidedAt || x.recheck2)) out.push({ id: c.id + ":" + x.id, due: x.recheck, reason: "بررسیِ دوبارهٔ ادعای «" + clip(x.claim || x.text, 60) + "» با دادهٔ خارج از نمونه (تاریخِ خودت)" }); });
    return out;
  }
  PR.listEval = listEval;
  /* دورِ ۲۲: پروندهٔ فهرست‌شکلِ پیوسته با آهنگِ خودِ او (T15 «هر دو هفته») صاحبِ مرورِ همین فهرست است — یک کار، یک سطر (dupOf) */
  function listOwnerCase(c) { return (c.cases || []).map(function (id) { return S.get(id); }).filter(function (k) { return k && k.urhythm && k.due && k.state !== "closed" && !k.closed && k.state !== "paused"; })[0] || null; }
  function listEntries(c) { var L = LISTS[c.list] || {}, oc = listOwnerCase(c); return listEval(c).map(function (e) { return { kind: "practice", id: e.id, due: e.due, reason: "🧪 " + e.reason, policy: { tid: L.tid, shape: "list", cite: L.cite }, open: ["practice", c.id], txt: "🧪 " + L.fa, sub: e.reason, dupOf: oc && e.id === c.id ? "practice:" + oc.id : null }; }); }
  function listSave(c) { var E = listEval(c); c.due = E.length ? E.map(function (e) { return e.due; }).sort()[0] : ""; S.put(c); PR.sync(c); return E; }

  /* ---------- بازتابِ رکوردهای پیوسته: تغییرِ 🎯 / آزمایشِ گره / پرونده ⇒ پروندهٔ تمرین هم‌گام (یک رکورد، نه رونوشت) ---------- */
  var busy = false;
  S.listeners = S.listeners || [];
  S.listeners.push(function (r, op) {
    if (busy || op !== "put" || !r) return;
    busy = true;
    try {
      if (r.type === "fcast" && r.src && r.src.ex) { var ex = S.get(r.src.ex); if (ex && ex.tid === 24) { var c = ex.prc && S.get(ex.prc); if (c) { t24Sync(ex, c, { draft: ex.status !== "done" }); PR.save(c); } } }
      else if (r.type === "fcast" && r.prc) { var c2 = S.get(r.prc); if (c2) PR.save(c2); }
      else if (r.type === "kexp") { PR.all(function (c) { return c.tid === 21 && c.kind !== "list" && ((r.prc === c.id) || (c.subj.k === "knot" && c.subj.id === r.knot)); }).forEach(function (c) { PR.save(c); }); }
      else if (r.type === "ex" && r.tid === 24 && r.prc && r.status === "done") { var c3 = S.get(r.prc); if (c3) { t24Sync(r, c3); PR.save(c3); } }   /* دورِ ۲۱: داوریِ ردیف ⇒ موعدِ پرونده جلو می‌رود */
      else if (r.type === "ex" && r.tid === 24 && r.status === "draft" && ((r.data || {}).preds || []).some(function (row) { return row && clip(row.st, 200) && num(row.conf) != null && (row.fc || parseWhen(row.due, today())); })) {
        /* دورِ ۲۰: پیش‌نویسِ T24 با ردیفِ کامل ⇒ پرونده (بی جلسه — پیش‌نویس جلسه نیست) و 🎯 ِ همان ردیف */
        var c4 = (r.prc && S.get(r.prc)) || PR.start(24, subjOfEx(r), { src: srcOfEx(r), sample: !!r.sample });
        if (c4) { if (r.prc !== c4.id) { r.prc = c4.id; S.put(r); } t24Sync(r, c4, { draft: true }); PR.save(c4); }
      }
    } catch (e) { console.warn(e); }
    busy = false;
  });

  /* ---------- 🧪 تسلط بی شمارشِ همان روز (LT3) — راهِ شمارشیِ قدیم قرنطینه، نه حذف ---------- */
  A.masteryCountOnly = A.mastery;   // قرنطینه: «n ≥ ۶ با میانگینِ ≥ ۷۵ ⇒ روان» بی نگاه به تاریخ — فقط برای مقایسه/بازگشت نگه داشته شد
  A.mastery = function (tid) {
    var exs = S.all("ex", function (e) { return e.tid === tid && e.status === "done" && !e.sample; });
    var pcts = exs.map(A.rubricPct).filter(function (x) { return x != null; });
    var avg = pcts.length ? Math.round(pcts.reduce(function (a, b) { return a + b; }, 0) / pcts.length) : null;
    var days = {}; exs.forEach(function (e) { days[A.localDay(e.updated || e.created)] = 1; });
    var n = Object.keys(days).length, stable = PR.cases({ tid: tid }).filter(function (c) { return c.state === "stable"; });
    var lvl = 0; if (n >= 1) lvl = 1; if (n >= 3 && (avg || 0) >= 50) lvl = 2; if (stable.length) lvl = 3;
    return { n: n, nEx: exs.length, avg: avg, lvl: lvl, last: exs[0] ? exs[0].updated : null, stable: stable.length };
  };
  A.MLV[3] = "تثبیت‌شده (با شاهدِ تاریخ‌دار)";

  /* ---------- نماها ---------- */
  function chip(t, cls) { return h("span", { class: "chip " + (cls || "") }, t); }
  function stChip(c) { return chip(ST_FA[c.state] || c.state, c.state === "stable" ? "good" : c.state === "paused" || c.state === "closed" ? "" : "warn"); }
  /* دورِ ۲۳ (Q7، A23-12): پایانِ پنجره یک جا خوانده می‌شود — همان «آخرین روزِ به‌موقع» که «امروز» (PR.entries) نشان می‌دهد؛ «until» ِ شکلِ steps انحصاری است.
     پیش‌تر پرونده و گفت‌وگو «۲۷ تا ۲۹» و «امروز» «۲۷ تا ۲۸» می‌گفتند. */
  PR.lastOnTime = function (c) { if (!c || !c.until) return ""; var pol = P[c.tid] || {}, u = pol.shape === "steps" ? add(c.until, -1) : c.until; return u && c.due && u > c.due ? u : ""; };
  PR.dueText = function (c) { if (!c.due) return c.state === "stable" ? "بی موعد (تثبیت شد)" : "موعدی ندارد"; var od = c.due < today() ? gap(c.due, today()) : 0, lu = PR.lastOnTime(c); return "موعدِ بعد: " + fdate(c.due) + (lu ? " تا " + fdate(lu) : "") + (od ? " (" + fa(od) + " روز گذشته)" : "") + " — " + (c.reason || ""); };
  function caseRow(c) {
    return h("li", { class: "prc-row", "data-prc": c.id }, h("div", { class: "row gap wrap" },
      h("button", { class: "linkish", type: "button", onclick: function () { A.go("practice", c.id); } }, fa(c.tid) + " · " + (A.TM[c.tid] || {}).fa + " — " + PR.subjLabel(c.subj)), stChip(c),
      chip(fa((c.sessions || []).filter(function (s) { return !s.draft; }).length) + " جلسه")),
      h("div", { class: "small muted", dir: "rtl" }, PR.dueText(c)));
  }
  PR.section = function (subj, title) {
    var L = PR.cases({ subj: subj }), box = h("section", { class: "card prc-sec", dir: "rtl" }, h("h3", {}, title || "🧪 پرونده‌های تمرینِ باز روی همین‌جا"));
    if (L.length) box.appendChild(h("ul", { class: "plain" }, L.map(function (c) {
      var li = caseRow(c), ss = (c.sessions || []).filter(function (s) { return !s.draft; }).sort(byD);
      if (ss.length) li.appendChild(h("ul", { class: "small prc-sess" }, ss.map(function (s) { return h("li", {}, fdate(s.d) + " — " + (s.what || "جلسه") + (s.ok === true ? " ✓" : s.ok === false ? " ✗" : "")); })));
      return li;
    }))); else box.appendChild(h("p", { class: "small muted" }, "هنوز پرونده‌ای نیست."));
    var sel = h("select", { "aria-label": "تکنیک برای پروندهٔ تمرینِ تازه", class: "prc-tsel" }, A.T.map(function (t) { return h("option", { value: t.id }, fa(t.id) + " · " + t.fa); }));
    box.appendChild(h("div", { class: "row gap wrap" }, h("label", { class: "small" }, "تمرین با تکنیک:"), sel,
      h("button", { class: "btn sm prc-start", type: "button", onclick: function () { PR.startFrom(+sel.value, subj, subj.k === "live" ? "live" : subj.k === "case" ? "case" : subj.k === "knot" ? "knot" : "page"); } }, "شروع / ادامهٔ پرونده")));
    return box;
  };
  function sessTable(c) {
    var ss = (c.sessions || []).filter(function (s) { return !s.draft; }).sort(byD), V = {}; PR.versions(c).forEach(function (v) { V[v.d] = v; });
    var RF = { start: "آغاز", step: "گامِ به‌موقع", early: "زودتر از موعد", late: "دیرتر از موعد", lateok: "دیرتر از موعد ولی درست — فاصلهٔ بلندتر", fail: "نشد — چرخه از نو", decay: "وارسی شکست خورد", checkin: "وارسیِ ماندگاری", extra: "جلسهٔ افزوده", lapse: "لغزش", session: "جلسه" };
    if (!ss.length) return h("p", { class: "small muted" }, "هنوز جلسه‌ای ثبت نشده (پیش‌نویس جلسه نیست).");
    return h("table", { class: "dt prc-tbl" }, h("thead", {}, h("tr", {}, ["تاریخ", "چه شد", "سنجیده", "خودارزیابی", "نقش", "نسخه"].map(function (x) { return h("th", {}, x); }))),
      h("tbody", {}, ss.map(function (s) {
        var m = s.meas || {}, v = V[s.d], r = (c.roles || {})[s.d], lt = (c.late || {})[s.d];
        var meas = m.pct != null ? fa(m.pct) + "٪ بازیابی" : m.jargon != null ? fa(m.jargon) + " اصطلاح · " + fa(m.len || 0) + " واژه" + ((m.stuck || []).length ? " · گیر: " + m.stuck.join("، ") : "") : m.correct != null ? fa(m.correct) + " درست · " + fa((m.forms || []).length) + " شکل" + (m.decoys ? " · " + fa(m.decoys) + " بدلی" : "") : m.g != null ? "نمره " + fa(m.g) + (m.el != null ? " پس از " + fa(m.el) + " روز" : "") : m.status ? m.status : m.complete != null ? (m.complete ? "آزمایشِ کامل" : "ناتمام") : m.problem ? "مسئله: " + m.problem : "—";
        return h("tr", {}, h("td", {}, fdate(s.d)), h("td", {}, s.what || "—"), h("td", {}, meas + (s.ok === true ? " ✓" : s.ok === false ? " ✗" : "")), h("td", {}, s.self == null ? "—" : fa(s.self) + "٪"),
          h("td", {}, (RF[r] || r || "—") + (lt ? " (" + fa(lt) + " روز دیرتر از موعد)" : "")),
          h("td", {}, v ? (v.jargon != null ? "نسخهٔ " + fa(v.n) + (v.dJargon != null ? " · اصطلاح " + (v.dJargon > 0 ? "+" : "") + fa(v.dJargon) + " · طول " + (v.dLen > 0 ? "+" : "") + fa(v.dLen) : "") : "") + (v.items != null ? " · نسبت به نسخهٔ ۱: +" + fa(v.added) + " / −" + fa(v.removed) : "") : "—"));
      })));
  }
  function evidence(c, R) {
    var box = h("div", { class: "prc-ev" });
    if (c.stable) box.appendChild(h("div", { class: "card soft" }, h("b", {}, "✓ تثبیت شد — " + fdate(c.stable.d)), h("ul", { class: "small" }, (c.stable.ev || []).map(function (e) { return h("li", {}, fdate(e.d) + (e.t ? " — " + e.t : e.why ? " — " + e.why : e.n != null ? " — " + fa(e.k) + " از " + fa(e.n) + " درست" : e.problem ? " — «" + e.problem + "»" : e.el != null ? " — درست پس از " + fa(e.el) + " روز" : e.src ? " — " + e.src : "")); })),
      c.stable.next ? h("p", { class: "small" }, "وارسیِ ماندگاری: " + fdate(c.stable.next)) : null));
    (c.stableOff || []).forEach(function (w) { box.appendChild(h("p", { class: "small warnline" }, "«تثبیت شد» (" + fdate(w.was) + ") در " + fdate(w.d) + " پس گرفته شد: " + w.why)); });
    if (R.misfit) box.appendChild(h("p", { class: "small warnline prc-misfit", dir: "rtl" }, "⚠ " + R.misfit.t));
    if (R.crit && R.crit.length && !c.stable) box.appendChild(h("ul", { class: "small prc-crit" }, R.crit.map(function (x) { return h("li", { class: x.ok ? "good" : "" }, (x.ok ? "✓ " : "○ ") + x.t); })));
    if (R.calib) box.appendChild(h("p", { class: "small" }, "کالیبراسیون: " + (R.calib.hit == null ? "—" : fa(R.calib.k) + " از " + fa(R.calib.n) + " درست (" + fa(R.calib.hit) + "٪) در برابرِ اطمینانِ " + fa(R.calib.conf) + "٪") + " · روزها: " + R.calib.days.map(function (x) { return fdate(x.d) + " " + fa(x.k) + "/" + fa(x.n); }).join("، ")));
    if (c.claim && c.state !== "stable") box.appendChild(h("p", { class: "small muted" }, "ادعای خودت: «تثبیت شد» (" + fdate(c.claim.d) + ") — شاهدِ تاریخ‌دار هنوز کامل نیست؛ پرونده باز می‌ماند."));
    if (R.verdict) box.appendChild(h("p", { class: "small" }, "حکم: «" + R.verdict.fa + "» در " + fdate(R.verdict.d) + (R.verdict.obs ? " — " + R.verdict.obs : "")));
    if (R.suggest) box.appendChild(h("p", { class: "small warnline" }, "سه تکرار: " + R.suggest.dates.map(fdate).join("، ") + " — یادگیریِ دوحلقه‌ای (T39) پیشنهاد می‌شود."));
    return box;
  }
  /* رکوردهای تاریخ‌دارِ پیوسته (LT5) — از خودِ رکورد خوانده می‌شوند */
  PR.linked = function (tid, c) {
    var out = [];
    if (tid === 24 || tid === 9) S.all("fcast", function (x) { return own(x) && (c ? x.prc === c.id : x.tid === tid || (x.prc && (S.get(x.prc) || {}).tid === tid)); }).forEach(function (x) { out.push({ kind: "fcast", id: x.id, t: "🎯 " + x.q + (x.p != null ? " — " + fa(x.p) + "٪" : "") + " · موعد " + fdate(x.due), out: x.outcome || "— هنوز —", t9: x.t9 || null, go: function () { A.go("fcast"); } }); });
    if (tid === 21) {
      S.all("kexp", function (x) { return own(x) && (c ? PR.linkedKexp(c).indexOf(x) >= 0 : !!x.prc || PR.cases({ tid: 21 }).some(function (cc) { return cc.subj.k === "knot" && cc.subj.id === x.knot; })); }).forEach(function (x) { out.push({ kind: "kexp", id: x.id, t: "🧪 آزمایشِ گره: " + x.plan + " · پیش‌بینی: " + (x.predict || "—"), out: x.status === "done" ? "مشاهده: " + (x.observe || "") + " · نتیجه: " + (({ same: "همان شد", diff: "متفاوت شد", mixed: "بخشی همان" })[x.outcome] || x.outcome) : "برنامه · تا " + fdate(x.due), go: function () { A.go("knot", x.knot); } }); });
      (A.liveAll ? A.liveAll() : []).forEach(function (r) { if (!own(r)) return; if (c && !(c.subj.k === "live" && c.subj.id === r.p.id)) return; var G = liveGuess(r.p.id); ((G && G.s.live && G.s.live.steps) || []).forEach(function (st) { if (!st.pred) return; var fc = st.fc && S.get(st.fc); out.push({ kind: "step", id: st.id, pid: r.p.id, t: "🔭 گامِ «" + clip(st.text, 60) + "» در «" + clip(r.p.title, 40) + "» · پیش‌بینی: " + st.pred + (st.conf ? " (" + fa(st.conf) + "٪)" : ""), out: (st.out ? (st.out.what || st.out.done) : "") || (fc && fc.outcome) || "— هنوز —", go: function () { A.go("lprob", r.p.id, "exec"); } }); }); });
    }
    if (tid === 22) S.all("case", function (x) { return own(x) && (c ? x.id === (ecaseOf(c) || {}).id : !!x.prc); }).forEach(function (x) { var d = (x.st && x.st.st_final && x.st.st_final.data) || {}; out.push({ kind: "case", id: x.id, t: "🏭 پرونده: " + x.title + " · بازبینی " + fdate(A.epiRevDate ? A.epiRevDate(d.revdate) : d.revdate), out: ((x.prcHist || []).map(function (e) { return fdate(e.d) + " «" + e.v + "»"; }).join("، ")) || ((x.outcome || {})["1"]) || "— هنوز —", go: function () { A.go("e_case", x.id); } }); });
    if (tid === 41) S.all("sched", function (s) { return s.proto === "P3" && (c ? ((c.links || {}).p3 || []).indexOf(s.id) >= 0 : true); }).sort(function (a, b) { return a.due.localeCompare(b.due); }).forEach(function (s) { out.push({ kind: "sched", id: s.id, t: "برگه سفید " + s.label + " — " + (s.title || (S.get(s.topic) || {}).title || ""), out: s.done ? (s.superseded ? "بسته — " + (s.why || "چرخه از نو چیده شد") : "✓ انجام شد") : "موعد " + fdate(s.due), go: function () { A.startProto && A.startProto("P3", { sched: s.id, topic: s.topic }); } }); });
    return out;
  };
  function linkedBox(tid, c) {
    var L = PR.linked(tid, c); if (!L.length) return null;
    return h("div", { class: "card soft prc-linked" }, h("h4", {}, "رکوردهای تاریخ‌دار (همان رکورد، نه رونوشت)"), h("ul", { class: "plain small" }, L.map(function (x) { return h("li", { "data-kind": x.kind, "data-id": x.id }, x.t, " — ", h("b", {}, x.out), " ", h("button", { class: "linkish", type: "button", onclick: x.go }, "باز کردن")); })));
  }
  function quickForm(c) {
    var what = h("input", { type: "text", "aria-label": "جلسهٔ امروز: چه کردی؟", placeholder: "چه کردی؟ (مثلاً «از حافظه بازکشیدم»)" });
    var meas = h("input", { type: "text", "aria-label": c.tid === 41 ? "درصدِ بازیابیِ سنجیده" : "نتیجهٔ سنجیده (اگر هست)", placeholder: c.tid === 41 ? "درصدِ بازیابی" : "نتیجهٔ سنجیده (اختیاری)" });
    var ok = h("select", { "aria-label": "نتیجهٔ جلسه" }, [["", "— نتیجه —"], ["1", "شد / درست بود"], ["0", "نشد / گیر کردم"]].map(function (x) { return h("option", { value: x[0] }, x[1]); }));
    return h("div", { class: "row gap wrap prc-quick", "data-own": "1" }, what, meas, ok, h("button", { class: "btn sm", type: "button", onclick: function () {
      if (!what.value.trim()) { A.toast("بنویس امروز چه کردی.", "bad"); return; }
      var m = {}; if (c.tid === 41 && num(meas.value) != null) m.pct = num(meas.value); else if (meas.value.trim()) m.note = meas.value.trim();
      PR.session(c, { what: what.value.trim(), meas: m, ok: ok.value === "" ? null : ok.value === "1", src: "page" }); A.render();
    } }, "ثبتِ جلسهٔ امروز"));
  }
  /* قرنطینه (دورِ ۲۲، P7 — REMOVAL_CANDIDATES): نمای دورِ ۲۱ ِ فهرست (فقط «افزودن» و «مرور کردم»)؛ جایش listView با چرخهٔ عمرِ هر مورد — صدا زده نمی‌شود */
  function listViewR21(c) {
    var L = LISTS[c.list] || {}, root = h("div", { class: "page prc", dir: "rtl" });
    root.appendChild(A.head("🧪 پروندهٔ تمرینِ باز · فهرستِ جاری", L.fa, "تکنیکِ " + fa(L.tid) + " · " + (A.TM[L.tid] || {}).fa + " — مرور به آهنگِ خودِ تکنیک: «" + L.cite + "»."));
    var E = listEval(c);
    root.appendChild(h("p", { class: "small" }, E.length ? E.map(function (e) { return "موعد " + fdate(e.due) + ": " + e.reason; }).join(" · ") : (c.list === "claims" ? "موعدی نیست؛ برای هر ادعا تاریخِ بررسیِ دوباره را خودت بنویس." : "موعدی نیست.")));
    var open = (c.items || []).filter(function (x) { return !x.closed; }), closed = (c.items || []).filter(function (x) { return x.closed; });
    root.appendChild(h("section", { class: "card" }, h("h3", {}, "باز (" + fa(open.length) + ")"), h("ul", { class: "plain prc-items" }, open.map(function (x) {
      var extra = c.list === "models" ? " · کاربست: " + fa(x.count || 0) + " (" + modelDays(x).map(fdate).join("، ") + ") · " + (x.status || "نامزد") :
        c.list === "ambiguities" ? " · احتمال: " + (x.p == null ? "—" : fa(x.p) + "٪") + (x.hist.length > 1 ? " · تاریخچه: " + x.hist.map(function (e) { return fdate(e.d) + " " + (e.p == null ? "—" : fa(e.p) + "٪") + (e.why ? " (" + e.why + ")" : ""); }).join(" ← ") : "") :
        c.list === "pareto" ? " · سهم‌ها: " + (x.shares || []).map(function (s) { return fdate(s.d) + " " + fa(s.v); }).join(" ← ") :
        c.list === "claims" ? (x.decidedAt ? " · حکم: " + x.verdict + " (" + fdate(x.decidedAt) + ")" : x.recheck ? " · بررسیِ دوباره: " + fdate(x.recheck) : " · «چه زمانی دوباره بررسی‌اش می‌کنم؟» — تاریخ را بنویس") :
        c.list === "assumptions" ? (x.load ? " · باربر" : "") : c.list === "beliefs" ? " · " + x.hist.map(function (e) { return fdate(e.d) + (e.conf != null ? " " + fa(e.conf) + "٪" : "") + (e.verdict ? " «" + e.verdict + "»" : ""); }).join(" ← ") : c.list === "mistakes" && x.prc ? " · راهبرد: پروندهٔ تمرین" : "";
      return h("li", { "data-item": x.id }, h("b", {}, x.text || x.name || x.claim || x.driver), h("span", { class: "small muted" }, " — " + fdate(x.d) + extra));
    }))), closed.length ? h("details", {}, h("summary", {}, "بسته‌شده (" + fa(closed.length) + ")"), h("ul", { class: "small" }, closed.map(function (x) { return h("li", {}, (x.text || x.name) + " — " + fdate(x.closed.d) + ": " + (x.closed.how || "")); }))) : null);
    var inp = h("input", { type: "text", "aria-label": "مورد تازه برای " + L.fa, placeholder: c.list === "models" ? "نامِ مدل" : c.list === "claims" ? "ادعا" : "مورد تازه" });
    var when = c.list === "claims" ? h("input", { type: "date", "aria-label": "تاریخِ بررسیِ دوباره" }) : null;
    root.appendChild(h("section", { class: "card", "data-own": "1" }, h("div", { class: "row gap wrap" }, inp, when, h("button", { class: "btn sm", type: "button", onclick: function () { if (!inp.value.trim()) return; var it = { text: inp.value.trim() }; if (c.list === "models") it.name = it.text; if (c.list === "claims") { it.claim = it.text; it.recheck = when.value || ""; } PR.listAdd(c.list, it, { sample: c.sample }); A.render(); } }, "افزودن"),
      h("button", { class: "btn sm ghost", type: "button", onclick: function () { PR.listReview(c.list, "مرورِ دوره‌ای", { sample: c.sample }); A.render(); } }, "مرور کردم"))));
    return root;
  }
  PR.listViewR21 = listViewR21;
  /* ---------- دورِ ۲۲ (P7، A22-28 B·D8 C22-15/16 D·s32/s36): چرخهٔ عمرِ هر مورد در خودِ صفحهٔ فهرست ----------
     هر مورد: پیوندِ مسئله و سشن، نقلِ حرفِ خودش، و بستن با نوع (حل/روشن شد · رد شد · بسته)؛ فرض «باربر»؛ ابهام با چند فرضیه و احتمالِ هر کدام
     (تاریخچه پاک نمی‌شود)؛ پارتو با سهم؛ ادعا با حکم و تاریخِ بررسیِ دوباره. عددی از خودمان ساخته نمی‌شود — هر عدد همان است که خودش می‌نویسد. */
  function itemTitle(x) { return x.text || x.name || x.claim || x.driver || ""; }
  PR.itemTitle = itemTitle;
  function liveTitle(pid) { var r = pid && A.liveRec && A.liveRec(pid); return r ? r.p.title : ""; }
  PR.liveTitle = liveTitle;
  function liveOpts(sel) {
    var L = (A.liveAll ? A.liveAll() : []).filter(own).sort(function (a, b) { return String(b.updated || b.created || "").localeCompare(String(a.updated || a.created || "")); }).slice(0, 25);
    return h("select", { "aria-label": "مسئلهٔ همین مورد", class: "prc-lpid" }, [h("option", { value: "" }, "— مسئله (اختیاری) —")].concat(L.map(function (r) { var o = h("option", { value: r.p.id }, clip(r.p.title, 50)); if (r.p.id === sel) o.selected = true; return o; })));
  }
  function itemLinks(c, x) {
    var out = h("span", { class: "small prc-ilinks", dir: "rtl" });
    var lt = liveTitle(x.pid);
    if (lt) out.appendChild(h("button", { class: "linkish prc-ilive", type: "button", "data-pid": x.pid, onclick: function () { A.go("lprob", x.pid); } }, " · مسئله: «" + clip(lt, 40) + "»"));
    else if (x.chatProb) out.appendChild(h("span", { class: "muted" }, " · مسئلهٔ گفت‌وگو: «" + clip(x.chatProb, 40) + "»"));
    if (x.sess && S.get(x.sess)) out.appendChild(h("button", { class: "linkish prc-isess", type: "button", onclick: function () { try { A.go("dossier", x.sess); } catch (e) { } } }, " · گفت‌وگو"));
    if (x.quote) out.appendChild(h("span", { class: "muted" }, " · از حرفِ خودت: «" + clip(x.quote, 70) + "»"));
    var pc = x.prc && S.get(x.prc);
    if (pc && pc.kind !== "list") out.appendChild(h("button", { class: "linkish", type: "button", onclick: function () { A.go("practice", x.prc); } }, " · پروندهٔ تمرین"));
    return out;
  }
  function itemExtra(c, x) {
    if (c.list === "models") return " · کاربست: " + fa(x.count || 0) + " (" + modelDays(x).map(fdate).join("، ") + ") · " + (x.status || "نامزد") + ((x.uses || []).length ? " · " + x.uses.slice(-3).map(function (u) { return fdate(u.d) + (u.where ? " «" + clip(u.where, 40) + "»" : ""); }).join("، ") : "");
    if (c.list === "ambiguities") return (x.hyps || []).length ? "" : " · احتمال: " + (x.p == null ? "—" : fa(x.p) + "٪");
    if (c.list === "pareto") return " · سهم‌ها: " + ((x.shares || []).length ? x.shares.map(function (s0) { return fdate(s0.d) + " " + (s0.v == null ? "—" : fa(s0.v) + "٪"); }).join(" ← ") : "— (سهم را بنویس تا مرورِ ماهانه با دادهٔ واقعی چیزی برای مقایسه داشته باشد)");
    if (c.list === "claims") return x.decidedAt ? " · حکم: " + x.verdict + " (" + fdate(x.decidedAt) + ")" + (x.recheck2 && x.recheck ? " · بررسیِ دوباره: " + fdate(x.recheck) : " · تاریخِ بررسیِ دوباره را بنویس") : x.recheck ? " · بررسیِ دوباره: " + fdate(x.recheck) : " · «چه زمانی دوباره بررسی‌اش می‌کنم؟» — تاریخ را بنویس";
    if (c.list === "assumptions") return x.load ? " · باربر" : "";
    if (c.list === "beliefs") return " · " + (x.hist || []).filter(function (e) { return e.conf != null || e.verdict; }).map(function (e) { return fdate(e.d) + (e.conf != null ? " " + fa(e.conf) + "٪" : "") + (e.verdict ? " «" + e.verdict + "»" : ""); }).join(" ← ");
    if (c.list === "mistakes" && x.prc) return " · راهبرد: پروندهٔ تمرین";
    return "";
  }
  function itemControls(c, x) {
    var o = { sample: c.sample }, why = h("input", { type: "text", class: "prc-iwhy", "aria-label": "چرا؟ (برای «" + clip(itemTitle(x), 30) + "»)", placeholder: "چرا؟ (اختیاری)" });
    var box = h("div", { class: "row gap wrap prc-ictl", "data-own": "1" });
    if (c.list === "assumptions") {
      var lb = h("input", { type: "checkbox", "aria-label": "باربر: اگر غلط باشد نقشه فرو می‌ریزد", class: "prc-iload" }); lb.checked = !!x.load;
      lb.onchange = function () { PR.loadSet(x.id, lb.checked, why.value.trim(), o); A.render(); };
      box.appendChild(h("label", { class: "small" }, lb, " باربر"));
    }
    if (c.list === "ambiguities") {
      var ht = h("input", { type: "text", class: "prc-hypt", "aria-label": "فرضیه (تازه یا یکی از همین‌ها)", placeholder: "فرضیه" }), hp = h("input", { type: "number", min: "0", max: "100", class: "prc-hypp", "aria-label": "احتمالِ این فرضیه (درصد)", placeholder: "احتمال ٪" });
      box.appendChild(ht); box.appendChild(hp);
      box.appendChild(h("button", { class: "btn sm prc-hypb", type: "button", onclick: function () { if (!ht.value.trim() || hp.value === "") { A.toast("فرضیه و احتمالش را بنویس.", "bad"); return; } PR.hypSet(x.id, ht.value.trim(), hp.value, why.value.trim() || "به‌روزرسانی", o); A.render(); } }, "ثبتِ فرضیه / احتمال"));
    }
    if (c.list === "pareto") {
      var sh = h("input", { type: "number", min: "0", max: "100", class: "prc-ishare", "aria-label": "سهمِ این عامل (درصد)", placeholder: "سهم ٪" });
      box.appendChild(sh); box.appendChild(h("button", { class: "btn sm prc-isb", type: "button", onclick: function () { if (sh.value === "") return; PR.paretoShare(itemTitle(x), sh.value, o); var ps = PR.paretoSum(o); if (ps.over) A.toast("سهم‌ها روی هم " + fa(ps.sum) + "٪ شد — بیش از ۱۰۰٪؛ یکی را درست کن.", "bad"); A.render(); } }, "ثبتِ سهم"));
    }
    if (c.list === "claims") {
      var vs = h("select", { class: "prc-iverd", "aria-label": "حکمِ ادعا" }, [["", "— حکم —"], ["سیگنال", "سیگنال"], ["نویز", "نویز"], ["نامعلوم", "نامعلوم"]].map(function (y) { return h("option", { value: y[0] }, y[1]); }));
      var rs = h("input", { type: "text", class: "prc-ires", "aria-label": "نتیجهٔ دادهٔ خارج از نمونه", placeholder: "نتیجهٔ دادهٔ تازه" }), rc = h("input", { type: "date", class: "prc-irc", "aria-label": "تاریخِ بررسیِ دوباره" });
      box.appendChild(vs); box.appendChild(rs); box.appendChild(rc);
      box.appendChild(h("button", { class: "btn sm prc-ivb", type: "button", onclick: function () { if (!vs.value) { A.toast("حکم را انتخاب کن.", "bad"); return; } PR.claimResult(x.id, rs.value.trim(), vs.value, o, rc.value || ""); A.render(); } }, "ثبتِ حکم"));
    }
    if (c.list === "models") {
      var wh = h("input", { type: "text", class: "prc-iwhere", "aria-label": "کجا به کارش بردی؟", placeholder: "کجا به کارش بردی؟" }), lp = liveOpts("");
      box.appendChild(wh); box.appendChild(lp);
      box.appendChild(h("button", { class: "btn sm prc-iuse", type: "button", onclick: function () { var pid = lp.value; if (!wh.value.trim() && !pid) return; PR.modelUse(itemTitle(x), { where: wh.value.trim() || ("مسئلهٔ «" + liveTitle(pid) + "»"), real: true, link: pid ? { k: "live", id: pid } : null, pid: pid }, o); A.render(); } }, "کاربستِ تازه"));
    }
    box.appendChild(why);
    [["resolved", c.list === "ambiguities" ? "روشن شد" : c.list === "assumptions" ? "درست درآمد" : "حل شد"], ["refuted", "رد شد"], ["closed", "بستن"]].forEach(function (k) {
      box.appendChild(h("button", { class: "btn sm ghost prc-iclose", type: "button", "data-kind": k[0], onclick: function () { PR.itemClose(c.list, x.id, why.value.trim() || k[1], o, k[0]); A.render(); } }, k[1]));
    });
    return box;
  }
  function listView(c) {
    var L = LISTS[c.list] || {}, root = h("div", { class: "page prc", dir: "rtl" });
    root.appendChild(A.head("🧪 پروندهٔ تمرینِ باز · فهرستِ جاری", L.fa, "تکنیکِ " + fa(L.tid) + " · " + (A.TM[L.tid] || {}).fa + " — مرور به آهنگِ خودِ تکنیک: «" + L.cite + "»."));
    var E = listEval(c);
    root.appendChild(h("p", { class: "small" }, E.length ? E.map(function (e) { return "موعد " + fdate(e.due) + ": " + e.reason; }).join(" · ") : (c.list === "claims" ? "موعدی نیست؛ برای هر ادعا تاریخِ بررسیِ دوباره را خودت بنویس." : "موعدی نیست.")));
    if (c.list === "pareto") { var ps = PR.paretoSum({ sample: c.sample }); if (ps.over) root.appendChild(h("p", { class: "small warnline prc-pover", dir: "rtl" }, "⚠ سهم‌های عامل‌های باز روی هم " + fa(ps.sum) + "٪ است — بیش از ۱۰۰٪ نمی‌شود؛ یکی را درست کن (سهمِ تازه، یا بستنِ عاملی که دیگر نیست).")); }
    var cs = PR.cases().filter(function (k) { return k.tid === L.tid && k.state !== "closed"; });
    if (cs.length) root.appendChild(h("p", { class: "small prc-lcases" }, "پرونده‌های تمرینِ همین تکنیک: ", cs.map(function (k) { return h("button", { class: "linkish", type: "button", onclick: function () { A.go("practice", k.id); } }, "«" + PR.subjTitle(k.subj) + "» "); })));
    var open = (c.items || []).filter(function (x) { return !x.closed; }), closed = (c.items || []).filter(function (x) { return x.closed; });
    root.appendChild(h("section", { class: "card" }, h("h3", {}, "باز (" + fa(open.length) + ")"), h("ul", { class: "plain prc-items" }, open.map(function (x) {
      var li = h("li", { "data-item": x.id, dir: "rtl" }, h("div", {}, h("b", {}, itemTitle(x)), h("span", { class: "small muted" }, " — " + fdate(x.d) + itemExtra(c, x)), itemLinks(c, x)));
      if (c.list === "ambiguities" && (x.hyps || []).length) li.appendChild(h("ul", { class: "small prc-hyps" }, x.hyps.map(function (hy) { return h("li", { "data-hyp": hy.id }, "«" + hy.t + "» — " + (hy.p == null ? "—" : fa(hy.p) + "٪") + (hy.hist.length > 1 ? " · تاریخچه: " + hy.hist.map(function (e) { return fdate(e.d) + " " + (e.p == null ? "—" : fa(e.p) + "٪") + (e.why ? " (" + e.why + ")" : ""); }).join(" ← ") : "")); })));
      li.appendChild(itemControls(c, x));
      return li;
    })), closed.length ? h("details", {}, h("summary", {}, "بسته‌شده (" + fa(closed.length) + ")"), h("ul", { class: "small prc-closed" }, closed.map(function (x) {
      return h("li", { "data-item": x.id, "data-kind": x.closed.kind || "closed" }, itemTitle(x) + " — " + (CLOSE_FA[x.closed.kind] || "بسته شد") + " · " + fdate(x.closed.d) + (x.closed.how ? ": " + x.closed.how : ""), itemLinks(c, x),
        h("button", { class: "linkish prc-ireopen", type: "button", "data-own": "1", onclick: function () { PR.itemReopen(c.list, x.id, "دوباره باز شد", { sample: c.sample }); A.render(); } }, " · بازگشایی"));
    }))) : null));
    var inp = h("input", { type: "text", "aria-label": "مورد تازه برای " + L.fa, placeholder: c.list === "models" ? "نامِ مدل" : c.list === "claims" ? "ادعا" : c.list === "pareto" ? "عامل" : c.list === "ambiguities" ? "ابهام (پرسشِ باز)" : "مورد تازه" });
    var when = c.list === "claims" ? h("input", { type: "date", "aria-label": "تاریخِ بررسیِ دوباره" }) : null;
    var share = c.list === "pareto" ? h("input", { type: "number", min: "0", max: "100", "aria-label": "سهمِ این عامل (درصد)", placeholder: "سهم ٪", class: "prc-addshare" }) : null;
    var ld = c.list === "assumptions" ? h("input", { type: "checkbox", "aria-label": "باربر", class: "prc-addload" }) : null;
    var ht = c.list === "ambiguities" ? h("input", { type: "text", "aria-label": "نخستین فرضیه", placeholder: "یک فرضیه (اختیاری)", class: "prc-addhyp" }) : null;
    var hp = c.list === "ambiguities" ? h("input", { type: "number", min: "0", max: "100", "aria-label": "احتمالِ آن فرضیه (درصد)", placeholder: "احتمال ٪", class: "prc-addhp" }) : null;
    var lp = liveOpts("");
    root.appendChild(h("section", { class: "card", "data-own": "1" }, h("div", { class: "row gap wrap" }, inp, share, when, ld ? h("label", { class: "small" }, ld, " باربر") : null, ht, hp, lp,
      h("button", { class: "btn sm prc-add", type: "button", onclick: function () {
        if (!inp.value.trim()) return; var it = { text: inp.value.trim() };
        if (c.list === "models") it.name = it.text;
        if (c.list === "claims") { it.claim = it.text; it.recheck = when.value || ""; }
        if (c.list === "pareto") { it.driver = it.text; if (share.value !== "") it.share = share.value; }
        if (ld) it.load = ld.checked;
        if (ht && ht.value.trim()) it.hyps = [{ t: ht.value.trim(), p: hp.value }];
        if (lp.value) it.pid = lp.value;
        PR.listAdd(c.list, it, { sample: c.sample });
        if (c.list === "pareto") { var ps = PR.paretoSum({ sample: c.sample }); if (ps.over) A.toast("سهم‌ها روی هم " + fa(ps.sum) + "٪ شد — بیش از ۱۰۰٪؛ یکی را درست کن.", "bad"); }
        A.render();
      } }, "افزودن"),
      h("button", { class: "btn sm ghost", type: "button", onclick: function () { PR.listReview(c.list, "مرورِ دوره‌ای", { sample: c.sample }); A.render(); } }, "مرور کردم"))));
    return root;
  }
  /* دورِ ۲۱ (R2، C21-2): «شروعِ تمرین» در خودِ نمای «🧪» — تکنیک (همهٔ ۴۵) و موضوع (اختیاری)؛ بی تکنیک پرونده‌ای ساخته نمی‌شود و می‌پرسد کدام */
  function startBox() {
    var sel = h("select", { "aria-label": "تکنیکِ پروندهٔ تمرینِ تازه", class: "prc-tsel0" }, [h("option", { value: "" }, "— کدام تکنیک؟ —")].concat((A.T || []).map(function (t) { return h("option", { value: t.id }, fa(t.id) + " · " + t.fa); })));
    var tp = h("input", { type: "text", "aria-label": "موضوعِ پروندهٔ تمرینِ تازه (اختیاری)", placeholder: "موضوع (مثلاً «فرمول‌های مثلثات») — اختیاری", class: "prc-tp0" });
    return h("section", { class: "card prc-startbox", dir: "rtl" }, h("h2", {}, "شروعِ تمرین"),
      h("p", { class: "small muted" }, "یک پرونده برای هر تکنیک × موضوع؛ پروندهٔ بازِ همان تکنیک و موضوع دوباره ساخته نمی‌شود، ادامه می‌یابد. آهنگ از متنِ خودِ تکنیک است."),
      h("div", { class: "row gap wrap", "data-own": "1" }, sel, tp, h("button", { class: "btn sm prc-start0", type: "button", onclick: function () {
        if (!sel.value) { A.toast("کدام تکنیک را می‌خواهی تمرین کنی؟ اول از فهرست انتخابش کن — پرونده‌ی بی‌تکنیک ساخته نمی‌شود.", "bad"); try { sel.focus(); } catch (e) { } return; }
        var t = tp.value.trim(), subj = t ? PR.subj("topic", "", clip(t, 80)) : PR.subj("free");
        PR.startFrom(+sel.value, subj, "page");
      } }, "شروعِ تمرین")));
  }
  PR.startBox = startBox;
  A.V.practice = function (id) {
    var c = id && S.get(id);
    if (c && c.type === "practice" && c.kind === "list") return listView(c);
    if (!c || c.type !== "practice") {
      var root0 = h("div", { class: "page prc", dir: "rtl" });
      root0.appendChild(A.head("یادگیری", "🧪 پرونده‌های تمرینِ باز", "هر تکنیکی که با برگشتن در روزها و هفته‌ها کار می‌کند، برای هر موضوع یک پرونده دارد تا شاهدِ تاریخ‌دار نشان دهد مهارت یا باور تثبیت شد."));
      var L0 = PR.cases(), Ls = PR.all(function (x) { return x.kind === "list" && own(x); });
      root0.appendChild(startBox());
      root0.appendChild(h("section", { class: "card" }, h("h2", {}, "پرونده‌ها (" + fa(L0.length) + ")"), L0.length ? h("ul", { class: "plain" }, L0.map(caseRow)) : h("p", { class: "small muted" }, "هنوز پرونده‌ای نیست؛ همین بالا شروع کن، یا از صفحهٔ هر تکنیک، مسئله، پرونده یا گره.")));
      root0.appendChild(h("section", { class: "card" }, h("h2", {}, "فهرست‌های جاری"), h("ul", { class: "plain" }, Object.keys(LISTS).map(function (k) { var lc = Ls.filter(function (x) { return x.list === k; })[0]; return h("li", {}, h("button", { class: "linkish", type: "button", onclick: function () { A.go("practice", (lc || PR.list(k)).id); } }, LISTS[k].fa), h("span", { class: "small muted" }, " — " + fa(lc ? lc.items.filter(function (x) { return !x.closed; }).length : 0) + " مورد · تکنیکِ " + fa(LISTS[k].tid))); }))));
      return root0;
    }
    var R = PR.eval(c), t = A.TM[c.tid], root = h("div", { class: "page prc", dir: "rtl" }), go = PR.subjGo(c.subj);
    root.appendChild(A.head("🧪 پروندهٔ تمرینِ باز", fa(c.tid) + " · " + t.fa, null, h("div", { class: "row gap wrap" }, stChip(c), chip("از «" + (SRC_FA[c.src] || c.src) + "»"), c.sample ? chip("نمونه/تور") : null)));
    root.appendChild(h("p", { class: "prc-subj" }, "موضوع: ", go ? h("button", { class: "linkish", type: "button", onclick: go }, PR.subjLabel(c.subj)) : h("b", {}, PR.subjLabel(c.subj)), " · آغاز " + fdate(c.start)));
    root.appendChild(h("p", { class: "prc-due", dir: "rtl" }, PR.dueText(c)));
    (c.plans || []).forEach(function (pl) { root.appendChild(h("p", { class: "small prc-plan", dir: "rtl" }, "📌 برنامهٔ خودت در گفت‌وگو: «" + clip(pl.text, 120) + "»" + (pl.when && /^\d/.test(pl.when) ? " (تا " + fdate(pl.when) + ")" : "") + " — همان کارِ همین پرونده؛ جلسه‌هایش همین‌جا ثبت می‌شوند.")); });
    root.appendChild(h("p", { class: "small muted" }, "آهنگ از متنِ خودِ تکنیک: «" + ((P[c.tid] || {}).cite || "") + "»"));
    root.appendChild(evidence(c, R));
    root.appendChild(h("section", { class: "card" }, h("h3", {}, "جلسه‌ها"), sessTable(c)));
    var lb = linkedBox(c.tid, c); if (lb) root.appendChild(lb);
    var due = h("input", { type: "date", "aria-label": "موعدِ دیدنِ نتیجه (خودت)", value: c.udue || "", onchange: function (e) { PR.setDue(c, e.target.value); A.render(); } });
    var pw = h("input", { type: "text", "aria-label": "دلیلِ مکث", placeholder: "دلیلِ مکث (اختیاری)" });
    root.appendChild(h("section", { class: "card" }, quickForm(c),
      h("div", { class: "row gap wrap mt" },
        h("button", { class: "btn sm", type: "button", onclick: function () { PR.openWS(c); } }, "ادامه با کاربرگِ تکنیک"),
        c.state === "paused" ? h("button", { class: "btn sm ghost", type: "button", onclick: function () { PR.resume(c); A.render(); } }, "ادامه (پایانِ مکث)") : h("span", { class: "row gap" }, pw, h("button", { class: "btn sm ghost", type: "button", onclick: function () { PR.pause(c, pw.value); A.render(); } }, "مکث")),
        h("button", { class: "btn sm ghost", type: "button", "data-own": "1", onclick: function () { PR.claim(c); A.render(); } }, "به نظرم تثبیت شد"),
        c.state !== "closed" ? h("button", { class: "btn sm ghost", type: "button", "data-own": "1", onclick: function () { PR.close(c, "خودت بستی"); A.render(); } }, "بستنِ پرونده") : null),
      (P[c.tid] || {}).shape === "exp" || (P[c.tid] || {}).shape === "verdict" ? h("div", { class: "row gap wrap" }, h("label", { class: "small" }, "کی نتیجه را می‌بینی؟"), due) : null));
    var hs = (c.hist || []).slice().reverse();
    root.appendChild(h("details", { class: "card" }, h("summary", {}, "تاریخچه (" + fa(hs.length) + ")"), h("ul", { class: "small prc-hist" }, hs.map(function (e) { return h("li", {}, fdate(e.d) + " — " + ({ start: "آغاز", state: "وضع: " + (ST_FA[e.from] || e.from || "") + " ← " + (ST_FA[e.to] || e.to || ""), pause: "مکث", resume: "ادامه", close: "بسته شد", reopen: "دوباره باز شد", claim: "ادعای «تثبیت شد»", withdraw: "«تثبیت شد» پس گرفته شد", rhythm: "آهنگِ خودت" })[e.ev] + (e.why ? " — " + e.why : "")); }))));
    return root;
  };
  /* زبانهٔ «🧪 پرونده‌ها» در صفحهٔ هر تکنیک (a3_views) */
  A.practiceTab = function (t) {
    var box = h("div", { class: "prc-tab", dir: "rtl" }), pol = P[t.id] || {};
    box.appendChild(h("p", { class: "small" }, "آهنگِ این تکنیک از متنِ خودش: «" + (pol.cite || "—") + "» — " + ({ steps: "بازسازی در روزهای ثابت", window: "بازگشت در بازه", every: "تکرار به آهنگِ ثابت", exp: "آزمون تا نتیجه", calib: "پیش‌بینی‌های داوری‌شده", verdict: "حکم و بازبینی پس از نتیجه", cards: "کارت‌های مرور", fcast: "تخمینِ تاریخ‌دار", recur: "تکرارِ مشکل", list: "فهرستِ جاری", once: "یک‌باره برای هر نمونه", habit: "عادتِ هر جلسه" })[pol.shape] + "."));
    var L = PR.cases({ tid: t.id });
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "پرونده‌ها (" + fa(L.length) + ")"), L.length ? h("ul", { class: "plain" }, L.map(caseRow)) : h("p", { class: "small muted" }, "هنوز پرونده‌ای نیست؛ کاربرگ را که ثبت کنی پرونده باز می‌شود.")));
    var lb = linkedBox(t.id, null); if (lb) box.appendChild(lb);
    if (t.id === 24) { var pts = PR.calib(), bys = {}; pts.forEach(function (x) { bys[x.src] = (bys[x.src] || 0) + 1; }); box.appendChild(h("div", { class: "card soft prc-calib" }, h("h4", {}, "دفترِ کالیبراسیون (هر کار یک بار)"), h("ul", { class: "plain small" }, Object.keys(bys).map(function (k) { return h("li", { "data-src": k }, k + ": " + fa(bys[k])); })))); }
    Object.keys(LISTS).forEach(function (k) { if (LISTS[k].tid === t.id || LISTS[k].also === t.id) { var lc = PR.all(function (x) { return x.kind === "list" && x.list === k && own(x); })[0]; box.appendChild(h("p", {}, h("button", { class: "btn sm ghost", type: "button", onclick: function () { A.go("practice", (lc || PR.list(k)).id); } }, LISTS[k].fa + " (" + fa(lc ? lc.items.filter(function (x) { return !x.closed; }).length : 0) + ")"))); } });
    return box;
  };
  /* کاربرگی که جلسهٔ یک پرونده است، این را بالای خودش می‌گوید */
  var rawWS = A.workshop;
  if (rawWS) A.workshop = function (t, exId) {
    var el = rawWS.apply(this, arguments), ex = exId && S.get(exId), c = ex && ex.prc && S.get(ex.prc);
    try { if (c && el.firstChild) el.insertBefore(h("div", { class: "card soft prc-banner", dir: "rtl" }, "این کاربرگ جلسهٔ پروندهٔ تمرینِ «" + PR.subjLabel(c.subj) + "» است (" + ST_FA[c.state] + " · " + fa((c.sessions || []).length) + " جلسه) ", h("button", { class: "linkish", type: "button", onclick: function () { A.go("practice", c.id); } }, "پرونده")), el.firstChild); } catch (e) { }
    return el;
  };
  /* صفحه‌های موضوع: مسئلهٔ زنده (+ پروندهٔ 📜 اگر هست)، پروندهٔ معرفتی، گره */
  function wrapView(name, mk) { var raw = A.V[name]; if (!raw || raw._prc) return; A.V[name] = function () { var el = raw.apply(this, arguments); try { var s = mk.apply(null, arguments); if (s && el && el.appendChild) el.appendChild(s); } catch (e) { console.warn(e); } return el; }; A.V[name]._prc = true; }
  function liveSection(pid) {
    if (!pid || !A.liveRec || !A.liveRec(pid)) return null;
    var box = PR.section(PR.subj("live", pid), "🧪 پرونده‌های تمرین روی این مسئله"), gs = PR.guessStatus(pid);
    if (gs && gs.text) box.insertBefore(h("p", { class: "prc-guess" }, "حدس: «" + gs.text + "» — " + gs.label), box.children[1] || null);
    var mi = h("input", { type: "text", "aria-label": "مدلِ ذهنی که در این مسئله به کار بردی", placeholder: "مدلِ ذهنی که این‌جا به کار بردی (قفسهٔ مدل‌ها)" });
    var mrow = h("div", { class: "row gap wrap", "data-own": "1" }, mi, h("button", { class: "btn sm ghost", type: "button", onclick: function () { if (!mi.value.trim()) return; PR.modelUseAsk(mi.value.trim(), { where: "مسئلهٔ «" + PR.subjTitle(PR.subj("live", pid)) + "»", real: true, link: { k: "live", id: pid } }, mrow); } }, "کاربستِ مدل"));
    box.appendChild(mrow);
    return box;
  }
  PR.liveSection = liveSection;
  function installViews() {
    wrapView("lprob", function (pid) { return liveSection(pid); });
    /* «📜 پروندهٔ کامل» (a40_dossier.js، فقط‌خواندنی و ساخته از خودِ رکوردها): هر پروندهٔ تمرینِ همین مسئله و هر جلسه‌اش یک رویدادِ تاریخ‌دار
       (در نما، Markdown و HTML یکسان)؛ پرونده‌ی نمونه/تور هرگز. */
    var rawDos = A.dossier;
    if (rawDos && !rawDos._prc) { A.dossier = function (pid) {
      var D = rawDos.apply(this, arguments); if (!D || !D.events) return D;
      try {
        PR.cases({ subj: PR.subj("live", pid) }).forEach(function (c) {
          var nm = fa(c.tid) + " · " + (A.TM[c.tid] || {}).fa, ev = D.events, gs = c.tid === 21 ? PR.guessStatus(pid) : null;
          ev.push({ k: "practice", at: (c.hist && c.hist[0] && (A.localDay(c.hist[0].at) === c.hist[0].d ? c.hist[0].at : c.hist[0].d + "T08:00:00.000Z")) || "", i: ev.length, title: "🧪 پروندهٔ تمرین — " + nm, lines: [ST_FA[c.state] + " · " + PR.dueText(c)].concat(gs && gs.tests.length ? ["حدس: «" + gs.text + "» — " + gs.label] : []), prc: c.id });
        });
        /* دورِ ۲۰ (RO6/RO7، A11): جلسه‌ها و گذارها با زمانِ خودِ رویداد (روزِ جلسه، زیرِ ساعتِ صفحه) — همان PR.events */
        PR.events(PR.subj("live", pid)).filter(function (e) { return e.kind !== "prc:start"; }).forEach(function (e) { e.i = D.events.length; D.events.push(e); });
        /* دورِ ۲۱ (bank #98 #105): ردیفِ T24 همان 🎯 است ⇒ هر پیش‌بینیِ پروندهٔ کالیبراسیونِ این مسئله یک رویداد (داوری با تاریخش، از کاربرگ یا گفت‌وگو — یک بار) */
        PR.cases({ subj: PR.subj("live", pid) }).filter(function (c) { return (P[c.tid] || {}).shape === "calib"; }).forEach(function (c) {
          PR.linkedFcasts(c).forEach(function (f) { var j = f.judgedBy || {};
            D.events.push({ k: "practice", kind: "prc:fcast", i: D.events.length, at: f.outcomeAt || f.created || "", d: f.outcomeAt ? A.localDay(f.outcomeAt) : "", title: "🎯 پیش‌بینیِ کاربرگِ ۲۴" + (f.outcome ? " — داوری شد" : ""),
              lines: [f.q].concat(f.p != null ? ["اطمینان: " + fa(f.p) + "٪"] : []).concat(f.due ? ["موعدِ داوری: " + fdate(f.due)] : []).concat(j.kind === "chat" && j.quote ? ["از گفت‌وگو: «" + j.quote + "»"] : j.kind === "plan" ? ["از همان برنامه"] : []),
              out: f.outcome === "شد" ? "شد" : f.outcome === "نشد" ? "نشد" : f.outcome || "هنوز داوری نشده", prc: c.id, fc: f.id, src: { kind: "practice", id: c.id } }); });
        });
        D.events.sort(function (a, b2) { var x = String(a.at || "9999"), y = String(b2.at || "9999"); return x < y ? -1 : x > y ? 1 : a.i - b2.i; });   /* همان ترتیبِ خودِ a40 */
      } catch (e) { console.warn(e); }
      return D;
    }; A.dossier._prc = true; }
    wrapView("e_case", function (id, sub) { var cs = id && S.get(id); if (!cs || cs.type !== "case" || sub) return null; return PR.section(PR.subj("case", id), "🧪 پرونده‌های تمرین روی این پرونده"); });
    wrapView("knot", function (id) {
      var k = id && S.get(id); if (!k || k.type !== "knot") return null; var box = PR.section(PR.subj("knot", id), "🧪 پرونده‌های تمرین روی این گره (هر ۴۵ تکنیک)"), sg = PR.knotSuggest(id);
      if (sg) box.insertBefore(h("p", { class: "warnline prc-sug" }, sg.why, " ", h("button", { class: "linkish", type: "button", onclick: function () { if (sg.prc) A.go("practice", sg.prc); else PR.startFrom(39, PR.subj("knot", id), "knot"); } }, sg.prc ? "پروندهٔ T39" : "شروعِ T39")), box.children[1] || null);
      return box;
    });
  }
  installViews();
  PR.installViews = installViews;   // اگر نمایی پس از این فایل ساخته شد (مثلاً «📜 پرونده»)، دوباره صدا بزن

  /* یک چرخهٔ ۱-۳-۷ برای هر موضوع (بانکِ LT5 #88): چرخهٔ بازِ همان موضوع دوباره ساخته نمی‌شود */
  var raw137 = A.start137;
  if (raw137) A.start137 = function (topicId, title) {
    var open = S.all("sched", function (s) { return s.proto === "P3" && !s.done && ((topicId && s.topic === topicId) || (!topicId && title && sameQ(s.title, title))); });
    if (open.length) { A.toast("چرخهٔ ۱-۳-۷ ِ همین موضوع از پیش باز است (موعدِ بعد " + fdate(open.map(function (s) { return s.due; }).sort()[0]) + ")."); return; }
    return raw137.apply(this, arguments);
  };
  /* 🎯: پیش‌بینیِ تکراری دومی نمی‌سازد — همان رکورد پیشنهاد می‌شود (بانکِ LT5 #82)؛ تخمینِ T9 (بی احتمال) در Brier شمرده نمی‌شود */
  var rawBrier = A.fcastBrier;
  if (rawBrier) A.fcastBrier = function (list) { return rawBrier.call(this, (list || S.all("fcast")).filter(function (x) { return x.p != null && !x.est; })); };
  wrapView("fcast", function () { return null; });
  var rawFc = A.V.fcast;
  if (rawFc) A.V.fcast = function () {
    var el = rawFc.apply(this, arguments);
    try {
      var q = el.querySelector && el.querySelector("#fcQ"), btn = q && q.closest("section") && q.closest("section").querySelector("button.btn");
      if (q && btn) {
        var note = h("p", { class: "small warnline prc-dupfc hidden", dir: "rtl" }); q.parentNode.insertBefore(note, q.nextSibling);
        var check = function () { var d = PR.dupFcast(q.value) || PR.chatFcastOf(q.value); note.classList.toggle("hidden", !d); note.textContent = d ? "این پیش‌بینی پیش‌تر ثبت شده" + (d.tid === 24 ? " (از کاربرگِ ۲۴)" : "") + ": «" + d.q + "» — " + (d.p != null ? fa(d.p) + "٪ · " : "") + (d.due ? "موعد " + fdate(d.due) : "بی موعد") + (d.outcome ? " · نتیجه: " + d.outcome : "") + ". همان رکورد را به‌روز کن، دومی ساخته نمی‌شود." : ""; return d; };
        q.addEventListener("input", check);
        btn.addEventListener("click", function (e) { var d = check(); if (d) { e.stopImmediatePropagation(); e.preventDefault();
          /* دورِ ۲۴ (R7، D24-14): همان پیش‌بینیِ گفت‌وگو ⇒ همان رکورد؛ اطمینان/موعدی که این فرم دارد و آن رکورد نداشت روی همان می‌نشیند (یک پیش‌بینی، یک 🎯، یک بار در کالیبراسیون) */
          var sec = q.closest("section"), pIn = sec && sec.querySelector("input[type=number]"), dIn = sec && sec.querySelector("input[type=date]"), pv = pIn && pIn.value !== "" ? +pIn.value : null, upd = [];
          if (!d.outcome && d.p == null && pv != null && pv >= 0 && pv <= 100) { d.p = pv; delete d.est; upd.push("اطمینان " + fa(pv) + "٪"); }
          if (!d.outcome && !d.due && dIn && dIn.value) { d.due = dIn.value; upd.push("موعد " + fdate(d.due)); }
          if (upd.length) { S.put(d); A.toast("همان پیش‌بینی پیش‌تر ثبت شده بود؛ " + upd.join(" و ") + " روی همان نشست — دومی ساخته نشد."); A.render(); }
          else A.toast("این پیش‌بینی پیش‌تر ثبت شده؛ دومی ساخته نشد.", "bad"); } }, true);
      }
      /* تخمینِ T9: به‌جای «شد/نشد»، مقدارِ واقعی و فاصلهٔ برآوردِ درونی و نرخِ پایه */
      S.all("fcast", function (x) { return x.est && own(x); }).forEach(function (x) {
        var inp = h("input", { type: "text", "aria-label": "مقدارِ واقعیِ «" + clip(x.q, 40) + "»", placeholder: "مقدارِ واقعی (عدد)", value: x.t9 && x.t9.actual != null ? x.t9.actual : "" });
        el.appendChild(h("section", { class: "card soft prc-t9", dir: "rtl" }, h("p", {}, "تخمینِ کلاسِ مرجع (T9): «" + x.q + "» · موعد " + fdate(x.due) + (x.t9 ? " · درونی: " + x.t9.inside + " · نرخِ پایه: " + x.t9.base : "")),
          x.t9 && x.t9.closer ? h("p", { class: "small" }, "فاصله با واقعیت — برآوردِ درونی: " + fa(x.t9.gapIn) + " · نرخِ پایه: " + fa(x.t9.gapBase) + " ⇒ " + (x.t9.closer === "base" ? "نرخِ پایه نزدیک‌تر بود" : x.t9.closer === "inside" ? "برآوردِ درونی نزدیک‌تر بود" : "برابر")) : null,
          h("div", { class: "row gap wrap", "data-own": "1" }, inp, h("button", { class: "btn sm", type: "button", onclick: function () { PR.t9Score(x.id, inp.value); A.render(); } }, "ثبتِ مقدارِ واقعی"))));
      });
    } catch (e) { console.warn(e); }
    return el;
  };
  /* صفحهٔ آغازِ کارگاه: پرونده‌های بازِ همین تکنیک — «ادامه» همان پرونده را ادامه می‌دهد (بانکِ LT2 #21) */
  var rawWS2 = A.workshop;
  A.workshop = function (t, exId) {
    var el = rawWS2.apply(this, arguments);
    try {
      if (!exId || !S.get(exId)) {
        var L = PR.cases({ tid: t.id }).filter(function (c) { return c.state !== "closed"; });
        if (L.length) el.insertBefore(h("div", { class: "card prc-cont", dir: "rtl" }, h("h3", {}, "ادامهٔ پرونده‌ی باز"), h("ul", { class: "plain" }, L.map(function (c) { return h("li", {}, h("button", { class: "btn sm ghost prc-contb", type: "button", "data-prc": c.id, onclick: function () { PR.openWS(c); } }, "ادامه: " + PR.subjLabel(c.subj)), h("span", { class: "small muted" }, " — " + ST_FA[c.state] + " · " + PR.dueText(c))); }))), el.firstChild);
      }
    } catch (e) { }
    return el;
  };

  /* ---------- 💬 دستیار: کنشِ start_practice (فقط پس از «آری» یا خواستهٔ صریحِ کاربر؛ پرونده‌ی باز ادامه می‌یابد، دوتا نمی‌شود) ---------- */
  var AS = A.ASSIST;
  var YES = /^\s*(آره|آری|اره|بله|بلی|باشه|حتما|حتماً|اوکی|ok|okay|چشم|موافقم|بزن|بریم|شروع کن|آره لطفا|ممنون می‌شم)/i, ASKV = /(بذار|بگذار|بچین|بساز|شروع کن|راه بنداز|درست کن|ثبت کن)/;
  /* قرنطینه (دورِ ۲۰، RO7، B·D8 — REMOVAL_CANDIDATES): آشکارسازِ کلیدواژه‌ای رضایت؛ جایش PR.consentOk (گزارشِ رضایتِ مدل، سنجیده با پیامِ خودِ او) */
  PR.consentKwR19c = function (txt) { var t = String(txt || "").trim(); if (/^\s*(نه|نخیر|بعدا|بعداً|فعلا نه|فعلاً نه|الان نه|نمی‌خوام|نمیخوام)/.test(t)) return false; return YES.test(t) || ASKV.test(t); };
  if (AS && AS.DO) {
    /* {"do":"start_practice","tid":41,"pid"|"knot"|"case"|"topic":"…"} */
    AS.DO.start_practice = function (a) {
      var s = AS._turnSession, cv = PR.consentOk(a, s);
      if (!cv.ok) return "پرونده ساخته نشد: " + cv.why;
      var tid = +(a && a.tid); if (!A.TM[tid]) return "شمارهٔ تکنیک (۱ تا ۴۵) لازم است";
      var subj = a.pid && A.liveRec && A.liveRec(a.pid) ? PR.subj("live", a.pid) : a.knot && S.get(a.knot) ? PR.subj("knot", a.knot) : a["case"] && S.get(a["case"]) ? PR.subj("case", a["case"]) :
        a.topic ? (S.get(a.topic) && S.get(a.topic).type === "topic" ? PR.subj("topic", a.topic) : PR.subj("topic", "", clip(a.topic, 80))) : (A.liveSessionPid && A.liveSessionPid(s)) ? PR.subj("live", A.liveSessionPid(s)) : (!a.title && s && s.coach && s.coach.stmt) ? PR.subj("topic", "", clip(s.coach.stmt, 80)) : (sessPids(s)[0] ? PR.subj("live", sessPids(s)[0]) : PR.subj("free", "", clip(a.title || (s && (s.pinned || s.title)) || "", 80)));   /* A21: پیشنهادِ دستیار به مسئله/سشنِ خودش می‌پیوندد، نه «آزاد» ِ بی‌نام */
      var had = PR.find(tid, subj), c = PR.start(tid, subj, { src: "assistant" });
      if (!c) return "پرونده ساخته نشد";
      if (a.rhythm && PR.quoteIn(a.rhythm, (turnMsgs(s).last || {}).text || "") && PR.rhythmIn(a.rhythm)) PR.rhythm(c, a.rhythm);   /* دورِ ۲۱: آهنگِ خودش هنگامِ شروع */
      if (s) { s.prcs = s.prcs || []; if (s.prcs.indexOf(c.id) < 0) s.prcs.push(c.id); if (!c.sess) { c.sess = s.id; S.put(c); } }
      AS._prcNote = (had ? "پروندهٔ باز ادامه یافت: " : "پروندهٔ تمرین باز شد: ") + fa(tid) + " · " + A.TM[tid].fa + " — " + PR.subjLabel(c.subj) + (c.due ? " · موعدِ بعد " + fdate(c.due) : "") + (c.misfit ? " · ⚠ " + c.misfit : "");
      return "✓ " + AS._prcNote;   /* دورِ ۲۰ (RO3): نتیجهٔ صفحه به گفت‌وگو و نوبتِ بعدِ مدل می‌رسد */
    };
    AS.promptHooks = AS.promptHooks || [];
    PR.R19C_QUARANTINE = { promptHook: function (s, msg) {
      var recent = [String(msg || "")].concat(((s && s.msgs) || []).filter(function (m) { return m.role === "user"; }).slice(-3).map(function (m) { return m.text; })).join(" ");
      /* فقط وقتی حرفِ کاربر دربارهٔ تمرین/برگشتن است — پرامپت سقف دارد و سشن‌های دیگر نباید این بلوک را بگیرند */
      if (!/(تمرین|چرخه|بازیابی|یادم می‌ره|یادم میره|فراموش می‌کنم|آزمون بذار|فاینمن|تثبیت|برگه سفید)/.test(recent)) return "";
      var open = PR.cases().filter(function (c) { return c.state !== "closed"; }).slice(0, 6);
      return "# پرونده‌های تمرینِ باز (یک پرونده برای هر تکنیک × موضوع)\n" + (open.length ? open.map(function (c) { return "- " + c.id + ": تکنیکِ " + c.tid + " «" + A.TM[c.tid].fa + "» روی «" + PR.subjTitle(c.subj) + "» (" + c.subj.k + (c.subj.id ? ":" + c.subj.id : "") + ") · " + ST_FA[c.state] + (c.due ? " · موعد " + c.due : ""); }).join("\n") + "\n" : "") +
        "- برای شروع یا ادامهٔ پرونده فقط پس از «آری» یا خواستهٔ صریحِ خودش: {\"do\":\"start_practice\",\"tid\":41,\"topic\":\"عنوانِ موضوع\"} (یا \"pid\" مسئلهٔ زنده، \"knot\"، \"case\"). پرونده‌ی باز همان ادامه می‌یابد؛ زمان‌بندی را خودِ پرونده از متنِ تکنیک می‌گیرد — عدد نساز.";
    } };
  }

  /* ===== دورِ ۲۰ ِ تورِ پولیا (RO7، DECISIONS_R20) — یک کار، یک رکورد، یک سطرِ «امروز» =====
     • پروندهٔ بازیابی (شکلِ steps: T41، T28، T4، T26، T38، T23) روی یک مسئلهٔ زنده صاحبِ زمان‌بندیِ همان مسئله است: جلسهٔ پرونده مرورهای موعدِ «🔭 مرورِ
       حلِ مسئله» (a36) و کارت‌های بازسازیِ همان مسئله (pb) را با همان نتیجه جلو می‌برد، و تا پرونده باز است آن‌ها سطرِ جدا در «امروز» نمی‌گیرند.
     • کنشِ دستیار practice_log (ثبتِ جلسه از گزارشِ خودِ او، با نقلِ عینی) و رضایتِ start_practice از گزارشِ مدل (consent) — بی فهرستِ کلیدواژه.
     • بلوکِ پرونده‌ها در پرامپت فقط وقتی پرونده‌ای باز برای همین موضوع (یا سشن) هست یا موعدش رسیده — نه با واژه‌ها (PR.promptBlock).
     • رویدادهای پرونده برای «📜 پرونده» (PR.events) با زمانِ خودِ رویداد. */
  function retr(c) { var p = P[c.tid]; return !!p && p.shape === "steps" && c.kind !== "list"; }
  function openC(c) { return c && c.state !== "closed" && c.state !== "paused" && !c.closed; }
  PR.ownerOfLive = function (pid) { return pid ? PR.cases({ subj: PR.subj("live", pid) }).filter(function (c) { return retr(c) && openC(c); })[0] || null : null; };
  function ownLive(c, s0) {
    var pid = c.subj.id, U = A.solveUI; if (!U || !A.liveRec || !A.liveRec(pid)) return 0;
    var pg = U.prog(pid), so = U.sol(pg), n = 0, ok = s0.ok === true;
    Object.keys(so.rev || {}).forEach(function (k) {
      var r = so.rev[k]; if (!r || !r.due || r.due > s0.d || (r.hist || []).some(function (x) { return x.prc === c.id && x.d === s0.d; })) return;
      if (A.solveGrade) { A.solveGrade(so, k, ok ? 2 : 0); var hh = so.rev[k].hist; if (hh && hh.length) { hh[hh.length - 1].prc = c.id; hh[hh.length - 1].via = "practice"; } n++; }
    });
    if (n) S.put(pg);
    S.all("card", function (x) { return PR.cardPid(x) === pid && !x.susp && x.due && x.due <= s0.d && !x.sample; }).forEach(function (cd) {
      if ((cd.hist || []).some(function (x) { return x.prc === c.id && x.d === s0.d; })) return;
      A.srsGrade(cd, ok ? 4 : 1); var hh = cd.hist; if (hh && hh.length) { hh[hh.length - 1].prc = c.id; hh[hh.length - 1].via = "practice"; } S.put(cd); n++;
    });
    return n;
  }
  PR.ownLive = ownLive;
  var rawSession = PR.session;
  PR.session = function (c, o) {
    if (typeof c === "string") c = S.get(c);
    var s0 = rawSession.call(this, c, o);
    try { if (s0 && c && c.subj && c.subj.k === "live" && retr(c) && own(c) && s0.ok != null) ownLive(c, s0); } catch (e) { console.warn(e); }
    return s0;
  };
  /* «امروز»: مرورِ حلِ مسئله‌ای که پروندهٔ بازیابیِ باز دارد سطرِ جدا نمی‌گیرد (پرونده همان کار را می‌آورد) */
  var rawSolveDue = A.solveDue;
  if (rawSolveDue && !rawSolveDue._prc) { A.solveDue = function () { return (rawSolveDue.apply(this, arguments) || []).filter(function (x) { return !(x && x.p && !x.aside && PR.ownerOfLive(x.p.id)); }); }; A.solveDue._prc = true; }
  /* دورِ ۲۱ (R5، C21-17): مسئلهٔ یک کارت — هم کارتِ بازسازی/درسِ صفحه (pb) هم کارتِ درسِ بازنگریِ گفت‌وگو («tutor:back:<pid>»، «chat:solved:<pid>»)؛
     پیش‌تر کارتِ درسِ بازنگری (مثلاً T28) زیرِ پرونده نمی‌رفت و کنارِ سطرِ پرونده هر روز «عقب‌افتاده» می‌ماند */
  /* A21-16: کارتِ قابِ مسئلهٔ عملی («lprob:practical») هم مالِ همان مسئله است — پیوندش در فرمِ فهمِ خودِ مسئله (u[1].pracCard) */
  PR.cardPid = function (cd) {
    if (!cd) return ""; if (cd.pb) return cd.pb; var m = /^(?:tutor:back|chat:solved):(.+)$/.exec(String(cd.src || "")); if (m) return A.liveRec && A.liveRec(m[1]) ? m[1] : "";
    if (cd.src === "lprob:practical") { var pg = S.all("eprog", function (r) { var u = r && r.solve && r.solve.u; return !!(u && Object.keys(u).some(function (k) { return u[k] && u[k].pracCard === cd.id; })); })[0]; if (pg) return String(pg.id).replace(/^eprog_/, ""); }
    return "";
  };
  var rawCardIn = A.cardInToday || function () { return true; };
  A.cardInToday = function (cd) { if (!rawCardIn(cd)) return false; var pid = PR.cardPid(cd); return !(pid && PR.ownerOfLive(pid)); };

  /* ---------- رضایت و ثبتِ جلسه از گفت‌وگو: مدل گزارش می‌دهد، صفحه با پیامِ خودِ او می‌سنجد ---------- */
  function sysT(t) { return /^\s*\[(?:سامانه|اصلاحِ پیامِ قبلی)/.test(String(t || "")); }
  function turnMsgs(s) {
    var M = (s && s.msgs) || [], li = -1; for (var i = M.length - 1; i >= 0; i--) if (M[i] && M[i].role === "user" && !sysT(M[i].text)) { li = i; break; }
    /* دورِ ۲۱: سطرِ «sys» ِ صفحه (مثلاً ردِ یک کنش) پیامِ دستیار نیست — پیشنهادِ نوبتِ پیش از پیامِ خودِ دستیار خوانده می‌شود */
    var prevAi = null; if (li > 0) for (var j = li - 1; j >= 0; j--) if (M[j] && M[j].role !== "user" && M[j].role !== "sys") { prevAi = M[j]; break; }
    return { last: li >= 0 ? M[li] : null, prevAi: prevAi };
  }
  PR.quoteIn = function (q, t) { var a = norm(q), b = norm(t); return a.length >= 2 && b.indexOf(a) >= 0; };
  /* consent: {quote: «عینِ حرفِ او در همین پیام», kind: "yes" (پاسخِ آری به پیشنهادِ نوبتِ پیش) | "request" (خواستهٔ خودش)}؛ رشته ⇒ همان نقل */
  PR.consentOk = function (a, s) {
    var T = turnMsgs(s), cv = a && a.consent, asked = !!(T.prevAi && /[؟?]/.test(T.prevAi.text || ""));
    if (!T.last) return { ok: false, why: "پیامی از او در این نوبت نیست" };
    if (!cv) return { ok: false, why: "رضایتش گزارش نشد — فقط پس از «آری» به پیشنهادت یا خواستهٔ خودش، با consent:{\"quote\":\"عینِ حرفش در همین پیام\",\"kind\":\"yes\"|\"request\"}" };
    if (typeof cv === "string") cv = { quote: cv };
    var kind = cv.kind || (asked ? "yes" : "request");
    if (kind !== "yes" && kind !== "request") return { ok: false, why: "رضایت فقط «yes» یا «request» است" };
    if (!PR.quoteIn(cv.quote, T.last.text)) return { ok: false, why: "نقلِ رضایت («" + clip(cv.quote, 60) + "») در پیامِ همین نوبتِ او نیست" };
    if (kind === "yes" && !asked) return { ok: false, why: "«آری» بی پیشنهادی در نوبتِ پیش — اول پیشنهاد را در یک جمله بده" };
    return { ok: true, kind: kind, quote: cv.quote };
  };
  /* پروندهٔ مقصدِ یک کنش: prc، یا tid + موضوع (pid/topic)، یا تنها پروندهٔ بازِ موضوعِ سشن */
  function sessPids(s) {
    var o = {}; try { var p0 = A.liveSessionPid && A.liveSessionPid(s); if (p0) o[p0] = 1; } catch (e) { }
    if (s && s.lprob) o[s.lprob] = 1; try { (A.liveAll ? A.liveAll() : []).forEach(function (r) { if (r && s && r.sess === s.id) o[r.p.id] = 1; }); } catch (e) { }
    return Object.keys(o);
  }
  PR.sessCases = function (s) {
    var out = [], seen = {}, add1 = function (c) { if (c && !seen[c.id] && own(c) && c.kind !== "list" && c.state !== "closed") { seen[c.id] = 1; out.push(c); } };
    if (s) { sessPids(s).forEach(function (pid) { PR.cases({ subj: PR.subj("live", pid) }).forEach(add1); }); (s.prcs || []).forEach(function (id) { add1(S.get(id)); }); }
    var t = today(); PR.cases().forEach(function (c) { if (c.due && c.due <= t && c.state !== "paused") add1(c); });
    return out;
  };
  function caseOfAction(a, s) {
    if (a.prc) { var c0 = S.get(a.prc); return c0 && c0.type === "practice" && c0.kind !== "list" ? c0 : null; }
    var L = PR.sessCases(s), tid = +(a.tid || 0);
    if (a.pid) L = L.concat(PR.cases({ subj: PR.subj("live", a.pid) }));
    if (a.topic) { var tp = S.get(a.topic); L = L.concat(PR.cases({ subj: tp && tp.type === "topic" ? PR.subj("topic", a.topic) : PR.subj("topic", "", a.topic) })); }
    if (tid) L = L.filter(function (c) { return c.tid === tid; });
    if (a.pid) L = L.filter(function (c) { return c.subj.k === "live" && c.subj.id === a.pid; });
    var u = L.filter(function (c, i) { return L.indexOf(c) === i && c.state !== "closed"; });
    return u.length === 1 ? u[0] : null;
  }
  if (AS && AS.DO) {
    /* {"do":"practice_log","prc":"…" (یا "tid" + "pid"/"topic"),"what":"چه کرد","pct":40,"ok":true|false,"quote":"عینِ گزارشِ او در همین پیام"} */
    AS.DO.practice_log = function (a) {
      a = a || {}; var s = AS._turnSession, T = turnMsgs(s);
      if (!T.last) return "جلسه ثبت نشد: پیامی از او در این نوبت نیست";
      if (!PR.quoteIn(a.quote, T.last.text)) return "جلسه ثبت نشد: نقلِ گزارشِ او («" + clip(a.quote || "", 60) + "») در پیامِ همین نوبت نیست — فقط کاری که خودش گفت انجام داد ثبت می‌شود";
      var said = String(T.last.text || ""), dd = PR.sessDay(a, said);
      if (dd.future) return "جلسه ثبت نشد: «" + clip(a.quote, 60) + "» برنامهٔ آینده است، نه جلسهٔ انجام‌شده — جلسه وقتی ثبت می‌شود که خودش بگوید انجامش داد";
      if (dd.bad) return "جلسه ثبت نشد: روزِ جلسه (" + dd.bad + ") پس از امروز است";
      var c = caseOfAction(a, s); if (!c) return "جلسه ثبت نشد: پروندهٔ بازِ یگانه‌ای پیدا نشد — شناسهٔ پرونده (prc) را از فهرستِ «پرونده‌های تمرینِ باز» بده";
      var ok = a.ok === true || a.ok === "true" ? true : a.ok === false || a.ok === "false" ? false : null;
      /* دورِ ۲۱ (R5): عددِ خودِ او از همان پیام (درصد) اگر مدل نداد؛ روزِ جلسه از حرفِ خودش («دیروز»، «پریروز»، «۳ روز پیش») */
      var pc = num(a.pct); if (pc == null) pc = PR.pctIn(a.quote) != null ? PR.pctIn(a.quote) : PR.pctIn(said);
      /* T24: گزارشِ سرانجامِ یک پیش‌بینی همان 🎯 (و ردیفِ کاربرگ) را داوری می‌کند — یک رکورد؛ درصدِ گفته‌شده اطمینان است، نه اندازه */
      var jn = "", j = null; if ((P[c.tid] || {}).shape === "calib") { j = t24Judge(c, a, ok, pc, dd.d, s); if (j && j.err) return "جلسه ثبت نشد: " + j.err; if (j && j.note) jn = j.note; }
      var m = {}; if (pc != null && (P[c.tid] || {}).shape !== "calib") { if (c.tid === 41) m.pct = pc; else m.v = pc; }
      if (j && j.fc && j.fc.p != null) { m = { p: j.fc.p, ok: j.fc.outcome === "شد", out: F2O[j.fc.outcome], fc: j.fc.id, at: nowISO() }; ok = j.fc.outcome === "شد"; }   /* A21-10/11: داوریِ کالیبراسیون اندازه است (اطمینانِ خودش + سرانجام) */
      var sx = PR.session(c, { d: dd.d, what: clip(a.what || a.quote, 200), meas: m, ok: c.tid === 41 && m.pct != null ? null : ok, src: "assistant", note: "از گفت‌وگو: «" + clip(a.quote, 120) + "»" });
      if (!sx) return "جلسه ثبت نشد";
      sx.chat = { sess: s && s.id, quote: clip(a.quote, 200), at: nowISO() }; S.put(c);
      if ((P[c.tid] || {}).shape === "calib") PR.save(c);
      if (s) { s.prcs = s.prcs || []; if (s.prcs.indexOf(c.id) < 0) s.prcs.push(c.id); }
      return "✓ جلسهٔ " + fdate(sx.d) + (sx.d !== today() ? " (روزی که خودش گفت)" : "") + " در پروندهٔ «" + (A.TM[c.tid] || {}).fa + " — " + PR.subjTitle(c.subj) + "» ثبت شد" + (sx.ok === true ? " (درست)" : sx.ok === false ? " (نشد)" : "") + (jn ? " · " + jn : "") + " · " + PR.dueText(c);
    };
  }
  if (AS && AS.DO) {
    /* {"do":"practice_rhythm","prc":"…" (یا tid + pid/topic),"quote":"عینِ حرفش"} — فقط همان پرونده؛ فاصله از حرفِ خودِ او */
    AS.DO.practice_rhythm = function (a) {
      a = a || {}; var s = AS._turnSession, T = turnMsgs(s);
      if (!T.last || !PR.quoteIn(a.quote, T.last.text)) return "آهنگ ثبت نشد: نقلِ حرفش («" + clip(a.quote || "", 60) + "») در پیامِ همین نوبت نیست";
      if (!PR.rhythmIn(a.quote)) return "آهنگ ثبت نشد: در «" + clip(a.quote, 60) + "» فاصله‌ای خوانده نشد — عدد از خودمان نمی‌سازیم";
      var c = caseOfAction(a, s); if (!c) return "آهنگ ثبت نشد: پروندهٔ بازِ یگانه‌ای پیدا نشد — شناسهٔ پرونده (prc) را بده";
      PR.rhythm(c, a.quote);
      return "✓ آهنگِ خودت برای پروندهٔ «" + (A.TM[c.tid] || {}).fa + " — " + PR.subjTitle(c.subj) + "»: هر " + fa(c.urhythm.every) + " روز · " + PR.dueText(c);
    };
  }
  /* روزِ جلسه: a.d (YYYY-MM-DD) یا از حرفِ خودش؛ «فردا …» بی روزِ گذشته ⇒ برنامه، نه جلسه */
  var NUMW2 = { "یک": 1, "یه": 1, "دو": 2, "سه": 3, "چهار": 4, "پنج": 5, "شش": 6, "شیش": 6, "هفت": 7 };
  PR.pastDay = function (t) {
    var x = norm(t); if (!x) return null;
    if (/(^| )پریروز( |$)/.test(x)) return -2;
    if (/(^| )دیروز( |$)/.test(x)) return -1;
    var m = /(^| )(\d+|یک|یه|دو|سه|چهار|پنج|شش|شیش|هفت) (روز|شب) (پیش|قبل)( |$)/.exec(x); if (m) { var n = /\d/.test(m[2]) ? +m[2] : NUMW2[m[2]]; if (n) return -n; }
    if (/(^| )(امروز|امشب|الان)( |$)/.test(x)) return 0;
    return null;
  };
  PR.sessDay = function (a, said) {
    var t = today(), d0 = a && a.d && /^\d{4}-\d{2}-\d{2}$/.test(String(a.d)) ? String(a.d) : "";
    if (d0) return d0 > t ? { bad: fdate(d0) } : { d: d0 };
    var off = PR.pastDay(a && a.quote); if (off == null) off = PR.pastDay(said);
    if (off == null && /(^| )(فردا|پس ?فردا|بعدا|هفته ی? ?(بعد|دیگه|آینده))( |$)/.test(norm(said))) return { future: true };
    return { d: off ? add(t, off) : t };
  };
  PR.pctIn = function (t) { var m = /(\d+(?:[.٫]\d+)?)\s*(?:٪|%|درصد)/.exec(dg(t || "")); return m ? +m[1].replace("٫", ".") : null; };
  /* سرانجامِ پیش‌بینیِ T24 از گفت‌وگو: 🎯 ِ بازِ همین پرونده که حرفش با گزارش هم‌پوشان است (یا تنها 🎯 ِ موعدرسیده) داوری می‌شود؛
     پیش‌بینیِ تازه‌ای که همین حالا با اطمینان و سرانجامش گفت ⇒ یک 🎯 ِ داوری‌شده (هرگز دو رکورد برای یک کار) */
  function numsOf(t) { var o = []; dg(t || "").replace(/(\d+(?:[.٫]\d+)?)\s*(?:٪|%|درصد)/g, " ").replace(/\d+(?:[.٫]\d+)?/g, function (x) { var v = +x.replace("٫", "."); if (o.indexOf(v) < 0) o.push(v); return " "; }); return o; }
  PR.numsOf = numsOf;
  PR.fcNarrow = function (L, said, pc) {
    var x = L;
    if (pc != null) { var byP = x.filter(function (f) { return f.p === pc; }); if (byP.length) x = byP; }
    if (x.length > 1) { var N = numsOf(said); if (N.length) { var sc = x.map(function (f) { var q = numsOf(f.q); return { f: f, n: q.filter(function (v) { return N.indexOf(v) >= 0; }).length }; }), mx = Math.max.apply(null, sc.map(function (z) { return z.n; }));
      if (mx > 0) x = sc.filter(function (z) { return z.n === mx; }).map(function (z) { return z.f; }); } }
    return x;
  };
  /* زیرمجموعه‌ای که عددهای خودش به آن می‌خورد: اطمینانِ گفته‌شده = p ِ پیش‌بینی، یا عددی از متنِ پیش‌بینی در حرفش؛ بیشترین امتیاز، وگرنه هیچ */
  PR.fcMatch = function (L, said, pc) {
    var N = numsOf(said), sc = L.map(function (f) { var q = numsOf(f.q); return { f: f, n: (pc != null && f.p === pc ? 1 : 0) + q.filter(function (v) { return N.indexOf(v) >= 0; }).length }; }), mx = Math.max.apply(null, [0].concat(sc.map(function (z) { return z.n; })));
    return mx > 0 ? sc.filter(function (z) { return z.n === mx; }).map(function (z) { return z.f; }) : [];
  };
  function t24Judge(c, a, ok, pc, d, s) {
    if (ok == null) return null;
    /* دورِ ۲۵ (P7، A25-14 oA1 p24): پیش‌بینیِ خودش در گفت‌وگو («پیش‌بینیم: تا جمعه … ۴۰٪») که هنوز به هیچ پرونده‌ای بسته نیست هم نامزدِ همین داوری است —
       پیش‌تر فقط 🎯 های خودِ پرونده دیده می‌شد و داوریِ practice_log یک «🎯 تازه» می‌ساخت و همان پیش‌بینی در «امروز» باز می‌ماند (یک پیش‌بینی، دو 🎯).
       داوری‌شده ⇒ همان رکورد به همین پرونده بسته می‌شود (prc) تا کالیبراسیون یک بار بشمارد. */
    var chatFc = function (judged) { return S.all("fcast", function (x) { return x && !x.sample && !x.prc && !x.live && (x.by === "chat" || (x.src && x.src.chat)) && (judged ? (x.outcome === "شد" || x.outcome === "نشد") : !x.outcome); }); };
    var bind = function (f) { if (f && !f.prc) { f.prc = c.id; if (f.tid == null) f.tid = 24; } return f; };
    var open = PR.linkedFcasts(c).filter(function (x) { return !x.outcome; }).concat(chatFc(false)), txt = (a.what || "") + " " + (a.quote || ""), out = ok ? "شد" : "نشد";
    /* دورِ ۲۶ (Q8، B26·D32 oB1 s28): درصدی که گزارش می‌گوید همان اطمینانِ پیش‌بینی است — 🎯 ِ بازی که اطمینانِ دیگری دارد نامزدِ این داوری نیست
       (پیش‌تر «گفته بودم ۵ روز با ۶۰ درصد اطمینان، شد ۴» روی 🎯 ِ ۹۰ درصدیِ بازِ مسئلهٔ دیگر «نشد» نشست) */
    var openP = pc != null ? open.filter(function (x) { return x.p == null || x.p === pc; }) : open;
    var hit = openP.filter(function (x) { return PR.sameAct(x.q, txt); }), due = open.filter(function (x) { return x.due && x.due <= today(); });
    /* دورِ ۲۲ (P6، A22-15): چند 🎯 ِ هم‌واژه («گلدانِ ۲۴ ساعت…»، «گلدانِ ۸ ساعت…») ⇒ با عددهای خودِ او: درصدی که گفت همان اطمینانِ
       پیش‌بینی است («اون پیش‌بینیِ ۶۰ درصدیم»)، و عددهای دیگرِ حرفش («۲۴ ساعت») در متنِ همان پیش‌بینی؛ هنوز چندتا ⇒ همان «کدام؟» */
    var said = (a.quote || "") + " " + (a.what || "");
    if (hit.length > 1) hit = PR.fcNarrow(hit, said, pc);
    /* هیچ هم‌واژه‌ای («گلدون» ≠ «گلدان»، «اون که ۶۰٪ گفته بودم») ⇒ باز با عددهای خودش: اطمینانِ همان پیش‌بینی، یا عددی از متنش */
    if (!hit.length) hit = PR.fcMatch(openP, said, pc);
    /* همان 🎯 که پیش‌تر (در صفحه یا همین امروز) داوری شده ⇒ همان رکورد، نه 🎯 ِ تازه (bank R22 #146) */
    if (!hit.length && pc != null) { var J = PR.linkedFcasts(c).filter(function (x) { return x.outcome === "شد" || x.outcome === "نشد"; }).concat(chatFc(true)), jh = J.filter(function (x) { return PR.sameAct(x.q, txt); }); jh = jh.length > 1 ? PR.fcNarrow(jh, said, pc) : jh.length ? jh : PR.fcMatch(J, said, pc);
      if (jh.length === 1 && jh[0].p === pc) { var jf = bind(jh[0]); S.put(jf); var was26 = jf.outcome; if (jf.outcome !== out) { if (PR.reverdict26) { PR.reverdict26(jf, out, a.quote, s, "chat"); jf.judgedBy.d = d; S.put(jf); } else { jf.outcome = out; jf.outcomeAt = nowISO(); jf.judgedBy = { kind: "chat", sess: s && s.id, quote: clip(a.quote, 200), d: d }; S.put(jf); } }
        return { fc: jf, note: "🎯 «" + clip(jf.q, 50) + "» (" + fa(jf.p) + "٪) ⇐ " + out + " — همان پیش‌بینی (یک رکورد)" + (was26 !== out ? "؛ داوریِ پیشین «" + was26 + "» در تاریخچه ماند" : "") }; } }
    var fc = hit.length === 1 ? hit[0] : !hit.length && due.length === 1 && pc == null ? due[0] : null;
    if (!fc && hit.length > 1) return { err: "چند پیش‌بینیِ باز با این گزارش جور است («" + hit.slice(0, 3).map(function (x) { return clip(x.q, 40) + (x.p != null ? " — " + fa(x.p) + "٪" : ""); }).join("»، «") + "») — کدام؟" };
    if (fc) { bind(fc); fc.outcome = out; fc.outcomeAt = nowISO(); fc.judgedBy = { kind: "chat", sess: s && s.id, quote: clip(a.quote, 200), d: d }; S.put(fc); PR.predMark(s, fc, out, a.quote); return { fc: fc, note: "🎯 «" + clip(fc.q, 50) + "» (" + fa(fc.p) + "٪) ⇐ " + out }; }
    if (pc != null) {
      /* پیش‌بینیِ بی‌موعدِ همین گفت‌وگو (🎯 نداشت) با همان اطمینان ⇒ 🎯 ِ داوری‌شده متنِ خودِ او را دارد، نه برچسبِ مدل */
      var hp = PR.predFor(s, said, pc, true);
      var q = clip(hp ? hp.text : (a.what || a.quote), 200), dup = PR.dupFcast(q);
      if (dup && dup.outcome) return null;
      fc = dup || { id: A.uid("fc"), type: "fcast", q: q, p: pc, due: d, dim: "s_decision", tid: 24, prc: c.id, src: { chat: s && s.id, quote: clip(a.quote, 200) } };
      fc.outcome = out; fc.outcomeAt = nowISO(); fc.judgedBy = { kind: "chat", sess: s && s.id, quote: clip(a.quote, 200), d: d }; S.put(fc); if (hp) { hp.fc = fc.id; PR.predMark(s, fc, out, a.quote); } return { fc: fc, note: "🎯 تازه «" + clip(fc.q, 50) + "» (" + fa(pc) + "٪) ⇐ " + out };
    }
    if (open.length) return { err: "کدام پیش‌بینی؟ — «" + open.slice(0, 3).map(function (x) { return clip(x.q, 40); }).join("»، «") + "»" };
    return null;
  }
  /* ---------- دورِ ۲۱ (R2، B·D2 C21-2 D·2): شروعِ پرونده از گفت‌وگو ----------
     «موضوعِ» سشن از خودِ صفحه: مسئلهٔ زندهٔ سشن، مسئلهٔ گفت‌وگو (همان شرطی که «مسئلهٔ گفت‌وگو» را در «# وضعِ کنونی» می‌نویسد)، تکنیک یا
     حرکتی که نامش (از ثبت‌گاهِ خودش) در حرفِ او آمده، یا صفحهٔ تکنیکی که باز است. موضوع هست ⇒ start_practice در پرامپت (حتی بی پروندهٔ باز)
     با فهرستِ کاملِ تکنیک‌ها (بی برشِ ۱ تا ۲۵)؛ در بازنگری یک بار به‌صورتِ پیشنهاد. رضایتِ دورِ ۲۰ (consent) همان است. */
  var ETSTOP = "تمرین تکنیک روش کن کنم کنی کنید بکنم میخوام خوام خواهم بده بدید باز پرونده برام براش برای".split(" ");
  function etoks(t) {
    return dg(String(t || "")).replace(/[ً-ْٰ]/g, "").replace(/[ي]/g, "ی").replace(/[ك]/g, "ک").replace(/[‌‏‎]/g, " ").replace(/[«»"'.,،!؟?:؛;()\/\-–—+]/g, " ").toLowerCase()
      .split(/\s+/).filter(function (w, k, a) { return w.length >= 2 && !/^\d+$/.test(w) && STOPW.indexOf(w) < 0 && ETSTOP.indexOf(w) < 0 && a.indexOf(w) === k; });
  }
  function nameHit(name, M) { var N = etoks(name); if (!N.length) return false; var com = N.filter(function (w) { return M.indexOf(w) >= 0; }).length; return com >= 2 || (N.length === 1 && com === 1 && N[0].length >= 4); }
  PR.namedIn = function (text) {
    var M = etoks(text), techs = [], moves = []; if (!M.length) return { techs: techs, moves: moves };
    (A.T || []).forEach(function (t) { if ([t.fa].concat(t.aka || []).some(function (nm) { return nameHit(nm, M); })) techs.push(t.id); });
    (A.MOVE_LIST || []).forEach(function (m) { if (nameHit(m.fa, M)) moves.push({ id: m.id, fa: m.fa, tech: (m.tech || []).map(function (x) { return x[0]; }).filter(function (x) { return A.TM[x]; }) }); });
    return { techs: techs, moves: moves };
  };
  function solvedPid(pid) { try { var L = (((S.get("eprog_" + pid) || {}).solve) || {}).live || {}; return L.state === "solved"; } catch (e) { return false; } }
  PR.sessSubject = function (s, msg) {
    var o = { pids: [], chat: "", techs: [], moves: [], view: null, back: false };
    if (s) { o.pids = sessPids(s); if (s.lprob && A.liveRec && A.liveRec(s.lprob) && o.pids.indexOf(s.lprob) < 0) o.pids.push(s.lprob); }
    var C = (s && s.coach) || {};
    if (C.stmt && !(AS && AS.notProblem && AS.notProblem(C.stmt))) o.chat = clip(C.stmt, 120);
    var said = [String(msg || "")].concat(((s && s.msgs) || []).filter(function (m) { return m && m.role === "user" && !sysT(m.text); }).slice(-2).map(function (m) { return m.text; })).join(" \n ");
    var nm = PR.namedIn(said); o.techs = nm.techs; o.moves = nm.moves;
    try { if (A.state && A.state.view === "tech" && A.TM[+A.state.arg]) o.view = +A.state.arg; } catch (e) { }
    o.back = C.ph === "b" || !!C.closedPid || o.pids.some(solvedPid);
    o.any = !!(o.pids.length || o.chat || o.techs.length || o.moves.length || o.view);
    return o;
  };
  function techList() { return (A.T || []).map(function (t) { return t.id + " " + t.fa; }).join(" · "); }
  /* بلوکِ پرامپت: پرونده‌های بازِ موضوع/سشن + (اگر سشن موضوع دارد) start_practice با فهرستِ کاملِ تکنیک‌ها — APP.PR.promptBlock(subject, session, msg) برای لایهٔ مربی هم */
  PR.promptBlock = function (subj, s, msg) {
    if (subj && typeof subj === "object" && subj.msgs) { msg = s; s = subj; subj = null; }
    if (typeof subj === "string") subj = PR.subj("live", subj);
    var L = subj ? PR.cases({ subj: subj }).filter(function (c) { return c.state !== "closed"; }) : [];
    /* دورِ ۲۱ (هماهنگی با routing، HANDBOOK §12 ردیفِ ۵۰): فقط پرونده‌های موضوعِ همین سشن (مسئلهٔ سشن، پروندهٔ ساخته/ثبت‌شده در همین سشن) زیرِ
       سرِ «# پرونده‌های تمرینِ باز» می‌آیند — همان نشانهٔ مربی‌گریِ AS.chatTask؛ پروندهٔ «سررسیده» ِ جای دیگر فقط شناسه‌اش را برای گزارشِ خودش می‌دهد،
       پس از سطرِ «- اگر …» (نشانه نیست؛ جایش سطرِ «امروز» است) */
    var own = function (c) { return !!s && ((c.sess && c.sess === s.id) || (s.prcs || []).indexOf(c.id) >= 0 || (c.subj && c.subj.k === "live" && sessPids(s).indexOf(c.subj.id) >= 0)); };
    var O = [];
    PR.sessCases(s).forEach(function (c) { if (L.indexOf(c) >= 0) return; if (own(c)) L.push(c); else O.push(c); });
    if (!subj && !s) { L = []; O = []; }
    var SB = s ? PR.sessSubject(s, msg) : { any: !!subj, pids: [], chat: "", techs: [], moves: [] };
    if (subj && subj.k === "live" && SB.pids.indexOf(subj.id) < 0) { SB.pids.push(subj.id); SB.any = true; }
    if (!L.length && !O.length && !SB.any) return "";
    var line = function (c) { var lst = lastSess(c);
      return "- " + c.id + ": تکنیکِ " + c.tid + " «" + (A.TM[c.tid] || {}).fa + "» روی «" + PR.subjTitle(c.subj) + "» · " + ST_FA[c.state] + " · " + fa((c.sessions || []).filter(function (x) { return !x.draft; }).length) + " جلسه" + (lst ? " (آخرین " + lst.d + (lst.meas && lst.meas.pct != null ? "، " + lst.meas.pct + "٪" : "") + ")" : "") + (c.due ? " · موعد " + c.due + (c.due < today() ? " (گذشته)" : "") : "") + (c.urhythm ? " · آهنگِ خودش: هر " + fa(c.urhythm.every) + " روز" : "") + (c.misfit ? " · زمینه: " + c.misfit : ""); };
    var out = [L.length || O.length ? "# پرونده‌های تمرینِ باز (یک پرونده برای هر تکنیک × موضوع)" : "# پرونده‌های تمرینِ باز: هنوز هیچ (یک پرونده برای هر تکنیک × موضوع؛ سرِ یکسان تا لایهٔ مربی دوباره نیاوردش — سطرِ بعد «پروندهٔ تازه» است، نه پرونده)"];
    if (L.length) out.push(L.slice(0, 6).map(line).join("\n"));
    if (O.length) out.push("- اگر خودش گزارشِ جلسهٔ یکی از این پرونده‌های سررسیده (موضوعِ سشن‌های دیگر، نه این گفت‌وگو) را داد، با همان شناسه ثبت کن؛ وگرنه پیششان نکش:\n" + O.slice(0, 6).map(line).join("\n"));
    if (L.length || O.length) out.push("- اگر گفت جلسهٔ یکی را انجام داد (مثلاً نتیجهٔ بازیابی‌اش را گفت): {\"do\":\"practice_log\",\"prc\":\"شناسه\",\"what\":\"چه کرد\",\"pct\":عدد اگر گفت,\"ok\":true|false اگر گفت,\"quote\":\"عینِ حرفش\"} — روزِ جلسه را صفحه از حرفش می‌خواند («دیروز» ⇒ دیروز)؛ «فردا می‌کنم» جلسه نیست؛ در کالیبراسیون (۲۴) همان پیش‌بینی را داوری می‌کند و درصد اطمینان است؛ موعد را صفحه از متنِ تکنیک می‌چیند؛ تا نتیجهٔ صفحه نیامده نگو «ثبت شد».\n" +
      "- اگر آهنگِ خودش را گفت («هر دو هفته یه بار»): {\"do\":\"practice_rhythm\",\"prc\":\"شناسه\",\"quote\":\"عینِ حرفش\"} — فاصله را صفحه از همان حرف می‌خواند، فقط برای همان پرونده.");
    var subjTxt = [].concat(SB.pids.map(function (p) { return "مسئلهٔ زنده «" + PR.subjTitle(PR.subj("live", p)) + "» (pid " + p + ")"; }), SB.chat ? ["مسئلهٔ گفت‌وگو «" + SB.chat + "» (topic: همان عنوان)"] : [],
      (SB.techs || []).map(function (t) { return "تکنیکِ " + t + " «" + A.TM[t].fa + "»"; }), (SB.moves || []).map(function (m) { return "حرکتِ «" + m.fa + "»" + (m.tech.length ? " — در تکنیک‌های " + m.tech.join("، ") : ""); }), SB.view ? ["صفحهٔ بازِ تکنیکِ " + SB.view] : []).join("؛ ");
    out.push("- پروندهٔ تازه" + (subjTxt ? " (موضوعِ همین سشن: " + subjTxt + ")" : "") + " فقط پس از «آری» به پیشنهادت یا خواستهٔ صریحِ خودش: {\"do\":\"start_practice\",\"tid\":شمارهٔ تکنیک,\"pid\"|\"topic\"|\"knot\"|\"case\":\"…\",\"consent\":{\"quote\":\"عینِ حرفش\",\"kind\":\"yes\"|\"request\"}} — پروندهٔ بازِ همان تکنیک × موضوع دوباره ساخته نمی‌شود؛ «پرونده» ِ کارخانه/معرفتی پروندهٔ تمرین نیست؛ «تمرین‌هام کجان؟» راهنمایی است، نه ساختن.\n- همهٔ تکنیک‌ها (شماره نام): " + techList());
    if (s && SB.back) {
      var k0 = "b:" + (SB.pids[0] || SB.chat || ""), nU = (s.msgs || []).filter(function (m) { return m && m.role === "user" && !sysT(m.text); }).length, of = s.prcOffer = s.prcOffer || {};
      if (of[k0] == null || of[k0] === nU) { of[k0] = nU; out.push("- زمینه (نه پرسشِ دوم): بازنگری: اگر درسی گفت که با برگشتن در روزها تثبیت می‌شود، پیشنهادِ تمرین («می‌خواهی تمرینش کنیم؟») فقط وقتی جای پرسشِ این نوبت است که پرسشِ دیگری نیست؛ وگرنه نوبتِ بعد — تا «آری» نگفته باز نکن؛ «نه» ⇒ دوباره پیشنهاد نده."); /* دورِ ۲۲ (C22-3، B·D11): زمینه، نه پرسشِ دوم */ }
    }
    return out.join("\n");
  };
  /* A21-18: خواستِ تمرینِ یک تکنیک (موضوعِ تمرین در همین نوبت نامِ تکنیک/حرکت دارد، یا پروندهٔ همین سشن) «عادت و برنامه» نیست — بلوکِ عادت کنار می‌رود */
  if (AS) {
    AS.promptFilters = AS.promptFilters || [];
    AS.promptFilters.push(function (outs, s, msg) {
      try { if (!outs.some(function (x) { return /^# عادت و برنامه/.test(String(x)); })) return outs; var N = PR.namedIn(msg); var pr = (N.techs.length || N.moves.length) && /تمرین|پرونده/.test(norm(msg));
        if (!pr) return outs; return outs.filter(function (x) { return !/^# عادت و برنامه/.test(String(x)); }); } catch (e) { return outs; }
    });
  }
  if (AS) {
    PR.promptHookActive = true;   // لایهٔ مربی اگر خودش PR.promptBlock را جای دیگری گذاشت، با AS._prcBlockDone = true این قلاب را خاموش کند
    AS.promptHooks = AS.promptHooks || [];
    AS.promptHooks.push(function (s, msg) { return AS._prcBlockDone ? "" : PR.promptBlock(null, s || null, msg); });
  }

  /* ---------- رویدادهای پرونده برای «📜 پرونده» (با زمانِ خودِ رویداد) ---------- */
  function evAt(d, at) { return at && A.localDay(at) === d ? at : d + "T08:30:00.000Z"; }
  var EVFA = { start: "پروندهٔ تمرین باز شد", withdraw: "«تثبیت شد» پس گرفته شد", pause: "مکثِ پروندهٔ تمرین", resume: "ادامهٔ پروندهٔ تمرین", close: "پروندهٔ تمرین بسته شد", reopen: "پروندهٔ تمرین دوباره باز شد", rhythm: "آهنگِ خودت برای پروندهٔ تمرین" };
  PR.events = function (subj) {
    if (typeof subj === "string") subj = PR.subj("live", subj);
    var out = [];
    PR.cases(subj ? { subj: subj } : {}).forEach(function (c) {
      var nm = fa(c.tid) + " · " + (A.TM[c.tid] || {}).fa;
      (c.hist || []).forEach(function (e) {
        var t = e.ev === "state" ? "پروندهٔ تمرین: " + (ST_FA[e.from] || e.from || "") + " ← " + (ST_FA[e.to] || e.to || "") : EVFA[e.ev]; if (!t) return;
        out.push({ k: "practice", kind: "prc:" + e.ev, at: evAt(e.d, e.at), d: e.d, title: "🧪 " + t + " — " + nm, lines: e.why ? [e.why] : [], prc: c.id, src: { kind: "practice", id: c.id } });
      });
      (c.sessions || []).filter(function (x) { return !x.draft && !(x.meas && x.meas.fc && (x.src === "assistant" || x.calibAuto)); }).forEach(function (x) {   /* دورِ ۲۱ (bank #105): داوریِ 🎯 از گفت‌وگو خودِ همان 🎯 است — یک سطر (سطرِ 🎯)، نه دو */
        var m = x.meas || {}, r = (c.roles || {})[x.d], lt = (c.late || {})[x.d];
        out.push({ k: "practice", kind: "prc:session", at: evAt(x.d, x.at), d: x.d, title: "🧪 جلسهٔ تمرین (" + nm + ")", lines: [x.what || "جلسه"].concat(m.pct != null ? ["بازیابیِ سنجیده: " + fa(m.pct) + "٪"] : []).concat(r === "late" || r === "lateok" ? [fa(lt || 0) + " روز دیرتر از موعد"] : []).concat(x.chat ? ["از گفت‌وگو: «" + x.chat.quote + "»"] : []),
          out: x.ok === true ? "شد" : x.ok === false ? "نشد" : "", prc: c.id, src: x.chat ? { kind: "practice", id: c.id, sess: x.chat.sess } : { kind: "practice", id: c.id } });
      });
    });
    return out.sort(function (a, b) { return String(a.at).localeCompare(String(b.at)); });
  };

  /* ---------- T24 دو مرحله‌ای در خودِ کاربرگ: تأمل‌ها (حدسِ منحنی، الگو، قاعده) فقط پس از نخستین نتیجه پرسیده می‌شوند ---------- */
  (function () {
    var t = A.TM[24]; if (!t || !t.ws) return;
    var hasOut = function (d) { return ((d && d.preds) || []).some(function (r) { return r && (r.out === "درست" || r.out === "نادرست"); }); };
    t.ws.forEach(function (f) { if (f.k === "selfguess" || f.k === "pattern" || f.k === "rule") f.whenFn = hasOut; });
  })();
  var rawWS3 = A.workshop;
  A.workshop = function (t, exId) {
    var el = rawWS3.apply(this, arguments);
    try {
      var ex = exId && S.get(exId);
      if (ex && ex.tid === 24 && el && el.firstChild) {
        var rows = ((ex.data || {}).preds || []), nfc = rows.filter(function (r) { return r && r.fc; }).length, nd = PR.t24NoDate(ex);
        el.insertBefore(h("div", { class: "card soft prc-t24", dir: "rtl", role: "status" },
          h("p", { class: "small" }, "دو مرحله: هر پیش‌بینی همان لحظه که گزاره، اطمینان و «موعد داوری» دارد در 🎯 ثبت می‌شود و موعدش به «امروز» می‌آید" + (nfc ? " (اکنون " + fa(nfc) + " پیش‌بینی در 🎯)" : "") + "؛ پرسش‌های تأمل (الگو، قاعده) پس از نخستین نتیجه پیدا می‌شوند."),
          nd.length ? h("p", { class: "small warnline prc-t24nd" }, "ردیف " + nd.map(function (i) { return fa(i + 1); }).join("، ") + ": «موعد داوری» را بنویس (تاریخ، یا «۵ روز دیگر») تا در 🎯 تاریخ‌دار شود — تاریخی از خودمان نمی‌سازیم.") : null), el.firstChild);
      }
    } catch (e) { console.warn(e); }
    return el;
  };
  /* ---------- کاربرگِ پرونده‌ای که موضوعش مسئلهٔ زنده است: موضوع از پیش با نامِ همان مسئله (نه «بی‌موضوع») ---------- */
  function topicForLive(pid) {
    var title = PR.subjTitle(PR.subj("live", pid)); if (!title) return null;
    var tp = S.all("topic", function (x) { return x.lprob === pid; })[0] || topicByTitle(title);
    if (!tp) tp = S.put({ id: A.uid("tp"), type: "topic", title: title, lprob: pid, src: "مسئلهٔ زنده" });
    return tp;
  }
  PR.topicForLive = topicForLive;
  var rawOpenWS = PR.openWS;
  PR.openWS = function (c) {
    if (typeof c === "string") c = S.get(c);
    if (c && c.subj && c.subj.k === "live" && !c.sample) {
      var dr = wsOfCase(c);
      if (!dr) {
        var tp = topicForLive(c.subj.id), ex = A.newEx(c.tid, tp ? tp.id : ""); ex.prc = c.id; ex.lprob = c.subj.id;
        var t = A.TM[c.tid], ttl = PR.subjTitle(c.subj); ex.data = ex.data || {};
        (t.ws || []).forEach(function (f) { if ((f.k === "topic" || f.k === "concept" || f.k === "focus" || f.k === "task") && (f.t === "text" || f.t === "area") && !A.filled(ex.data[f.k])) ex.data[f.k] = ttl; });
        S.put(ex);
      }
    }
    return rawOpenWS.apply(this, arguments);
  };

  /* ---------- برنامهٔ گفت‌وگو ⇄ گامِ زنده ⇄ 🌱: یک کار، یک وضع، یک سطر (دورِ ۲۰، RO7، D·11 D·12) ----------
     برنامه (pl… ِ لایهٔ مربی، a27) و گامی که بعداً روی همان مسئله ساخته شد (گامِ زنده یا 🌱) تا امروز فقط وقتی پیوند می‌خوردند که برنامه گفته می‌شد.
     اکنون: گامِ تازه‌ای که محتوایش با برنامه‌ای بازِ همان مسئله هم‌پوشان است ⇒ یک کلیک «همان برنامه؟» (متنِ عیناً همان ⇒ خودکار)؛ پس از پیوند
     وضعِ برنامه از همان گام/🌱 خوانده می‌شود (planSync ِ مربی برای گام؛ این‌جا برای 🌱)، سطرِ «📌» در «امروز» جای خود را به سطرِ همان گام می‌دهد،
     و گامِ زنده‌ای که پیوندِ 🌱 هم دارد سطرِ دومِ 🌱 نمی‌گیرد. محتوای ناهم‌پوشان هرگز پیشنهاد نمی‌شود (پیوندِ اجباری نه). */
  var STOPW = ("را رو به از که و با در تا برای یه یک هم این اون آن من می خودم فردا پسفردا پس امروز امشب صبح ظهر عصر شب ساعت دقیقه بعد قبل هر روز هفته دیگه دیگر کنم کنیم میکنم انجام بدم").split(" ");
  function toks(t) { var x = A.MATH && A.MATH.toPlain ? A.MATH.toPlain(String(t || "")) : String(t || ""); return norm(x).split(" ").filter(function (w, i, a) { return w.length >= 2 && !/^\d+$/.test(w) && STOPW.indexOf(w) < 0 && a.indexOf(w) === i; }); }
  PR.sameAct = function (a, b) {
    if (norm(a) && norm(a) === norm(b)) return 2;
    var A1 = toks(a), B1 = toks(b), com = A1.filter(function (w) { return B1.indexOf(w) >= 0; }).length, mn = Math.min(A1.length, B1.length);
    return com >= 2 || (com >= 1 && mn > 0 && com / mn >= 0.5) ? 1 : 0;
  };
  function planList() { try { return AS && AS.plansAll ? AS.plansAll(null) : []; } catch (e) { return []; } }
  function planOpenX(x) { try { return AS.planSync ? AS.planSync(x) === "open" : !x.p.done; } catch (e) { return !x.p.done; } }
  function liveStepsOf(pid) { var L = ((((S.get("eprog_" + pid) || {}).solve) || {}).live) || {}; return L.steps || []; }
  function willOfPid(pid) { try { var U = A.solveUI, pg = U.prog(pid), so = U.sol(pg); return so.will ? { w: so.will, pg: pg } : null; } catch (e) { return null; } }
  PR.planCands = function (pid) {
    var out = [];
    planList().forEach(function (x) {
      var q = x.p; if (!q || !planOpenX(x)) return; var pids = sessPids(x.s); if (q.step && q.step.pid && pids.indexOf(q.step.pid) < 0) pids.push(q.step.pid);
      pids.forEach(function (p0) {
        if (pid && p0 !== pid) return; var no = q.notSame || [];
        if (!q.step) liveStepsOf(p0).forEach(function (st) { if (!st || st.plan || no.indexOf(st.id) >= 0 || String(st.at || "") < String(q.at || "")) return; var m = PR.sameAct(q.text, st.text); if (m) out.push({ x: x, kind: "step", item: st, pid: p0, exact: m === 2, txt: st.text }); });
        if (!q.will) { var W = willOfPid(p0); ((W && W.w.steps) || []).forEach(function (ws) { if (!ws || ws.closed || ws.plan || no.indexOf(ws.id) >= 0 || String(ws.at || "") < String(q.at || "")) return; var m = PR.sameAct(q.text, ws.step); if (m) out.push({ x: x, kind: "will", item: ws, pid: p0, exact: m === 2, txt: ws.step }); }); }
      });
      /* دورِ ۲۱ (R5، B·D6): برنامه ⇄ 🎯 — پیش‌بینیِ بازی که همان کار است (یک کار، یک سطر). خودکار فقط با متنِ یکسان، یا هم‌پوشانیِ دست‌کم دو
         واژهٔ معنادار و همان روز (برنامه «سه‌شنبه باشگاه» و 🎯 ِ «باشگاه … سه‌شنبه»)؛ وگرنه یک کلیک «همان 🎯؟» (پیوندِ اجباری نه) */
      /* دورِ ۲۲ (P6، B·D18): برنامه‌ای که خودِ کارِ پروندهٔ تمرین است («تا میان‌ترم … با برگه‌ی سفید … تمرین کنم» کنارِ پروندهٔ T41) — همان کار؛
         خودکار وقتی متنِ برنامه نامِ تکنیکِ همان پرونده (یا حرکتی از آن) را دارد و پرونده مالِ همان سشن/مسئله است؛ وگرنه یک کلیک «همان پرونده؟» */
      if (!pid && !q.prc && !q.step && !q.will && !q.fc) PR.cases().filter(function (c) { return c.state !== "closed" && !c.closed && (q.notSame || []).indexOf(c.id) < 0; }).forEach(function (c) {
        var N = PR.namedIn(q.text), named = N.techs.indexOf(c.tid) >= 0 || N.moves.some(function (m) { return m.tech.indexOf(c.tid) >= 0; }) || techNums(q.text).indexOf(c.tid) >= 0;
        var only = PR.cases({ tid: c.tid }).filter(function (k) { return k.state !== "closed" && !k.closed; }).length === 1;
        var mine = !!x.s && (c.sess === x.s.id || (x.s.prcs || []).indexOf(c.id) >= 0 || (c.subj.k === "live" && sessPids(x.s).indexOf(c.subj.id) >= 0));
        var same = PR.sameAct(q.text, PR.subjTitle(c.subj)) && /تمرین|مرور|بازیابی/.test(norm(q.text));
        if (named && (mine || only)) out.push({ x: x, kind: "prc", item: c, pid: "", exact: true, txt: (A.TM[c.tid] || {}).fa + " — " + PR.subjTitle(c.subj) });
        else if ((named || same) && (mine || same)) out.push({ x: x, kind: "prc", item: c, pid: "", exact: false, txt: (A.TM[c.tid] || {}).fa + " — " + PR.subjTitle(c.subj) });
      });
      if (!pid && !q.fc) S.all("fcast", function (f) { return own(f) && !f.outcome && !f.plan && !f.live && f.q; }).forEach(function (f) {
        if ((q.notSame || []).indexOf(f.id) >= 0) return; var m = PR.sameAct(q.text, f.q); if (!m) return;
        var com = toks(q.text).filter(function (w) { return toks(f.q).indexOf(w) >= 0; }).length, sameDay = !!(q.when && f.due && String(q.when).slice(0, 10) === f.due);
        out.push({ x: x, kind: "fc", item: f, pid: "", exact: m === 2 || (com >= 2 && sameDay), txt: f.q });
      });
    });
    return out;
  };
  PR.planLink = function (cd, yes) {
    var q = cd.x.p, pg = S.get("eprog_" + cd.pid);
    if (!yes) { (q.notSame = q.notSame || []).push(cd.item.id); try { S.put(cd.x.s); } catch (e) { } return false; }
    if (cd.kind === "step") q.step = { pid: cd.pid, id: cd.item.id }; else if (cd.kind === "fc") q.fc = cd.item.id; else if (cd.kind === "prc") q.prc = cd.item.id; else q.will = { pid: cd.pid, id: cd.item.id };
    q.linkAt = nowISO(); q.linkBy = cd.exact ? (cd.kind === "prc" ? "named-technique" : "same-text") : "user";
    if (cd.kind === "prc") { var pp = cd.item.plans = cd.item.plans || []; if (!pp.some(function (y) { return y.id === q.id && y.sess === cd.x.s.id; })) pp.push({ sess: cd.x.s.id, id: q.id, text: clip(q.text, 160), when: q.when || "", d: today() }); S.put(cd.item); }
    else cd.item.plan = { sess: cd.x.s.id, id: q.id };
    try { S.put(cd.x.s); } catch (e) { } if (pg) S.put(pg); if (cd.kind === "fc") S.put(cd.item);
    PR.planStateSync();
    return true;
  };
  /* یک وضع: 🌱 ِ بسته ⇒ برنامه؛ برنامهٔ بسته (گفت‌وگو، «امروز» یا گامِ زندهٔ پیوسته) ⇒ همان 🌱 بسته با همان نتیجه */
  var syncing = false;
  PR.planStateSync = function () {
    if (syncing) return 0; syncing = true; var n = 0;
    try {
      planList().forEach(function (x) {
        var q = x.p; if (!q) return;
        if (planOpenX(x)) { PR.planCands().filter(function (c0) { return c0.x.p === x.p && c0.exact; }).slice(0, 1).forEach(function (c0) { PR.planLink(c0, true); n++; }); }
        /* برنامه ⇄ 🎯: سرانجامِ پیش‌بینی ⇒ برنامه؛ برنامهٔ بسته ⇒ همان پیش‌بینی (یک وضع) */
        if (q.fc) { var fc = S.get(q.fc), op = planOpenX(x);
          if (fc && (fc.outcome === "شد" || fc.outcome === "نشد") && op && AS.planTap) { AS.planTap(q.id, fc.outcome === "شد" ? "done" : "notdone"); n++; }
          else if (fc && !fc.outcome && !op && (q.state === "done" || q.state === "notdone")) { fc.outcome = q.state === "done" ? "شد" : "نشد"; fc.outcomeAt = nowISO(); fc.judgedBy = { kind: "plan", id: q.id, sess: x.s && x.s.id }; S.put(fc); n++; } }
        /* برنامه ⇄ پروندهٔ تمرین: موعدِ برنامه رسید و پرونده در بازهٔ برنامه (از روزِ گفتن تا موعد) جلسه دارد ⇒ برنامه «انجام شد» (یک وضع) */
        if (q.prc && planOpenX(x) && AS.planTap) { var pc0 = S.get(q.prc), wd = /^\d{4}-\d\d-\d\d$/.test(String(q.when || "")) ? q.when : "";
          if (pc0 && wd && wd <= today() && prcDidIn(pc0, q.d || "", wd)) { AS.planTap(q.id, "done"); n++; } }
        if (!q.will) return;
        var W = willOfPid(q.will.pid), ws = W && (W.w.steps || []).filter(function (y) { return y.id === q.will.id; })[0]; if (!ws) return;
        var open = planOpenX(x);
        if (ws.closed && open) { var lc = (ws.checks || [])[ws.checks.length - 1]; if (lc && AS.planTap) { AS.planTap(q.id, lc.done === "yes" ? "done" : "notdone"); n++; } }
        else if (!ws.closed && !open && (q.state === "done" || q.state === "notdone")) {
          var at = nowISO(); (ws.checks = ws.checks || []).push({ at: at, done: q.state === "done" ? "yes" : "no", what: "همان برنامهٔ گفت‌وگو (" + q.id + ")" + (q.via === "step" ? " — از نتیجهٔ گامِ زنده" : ""), by: "plan" }); ws.closed = true;
          (W.w.log = W.w.log || []).push({ at: at, kind: "check", step: ws.id, done: q.state === "done" ? "yes" : "no", by: "plan" }); S.put(W.pg); n++;
        }
      });
    } catch (e) { console.warn(e); }
    syncing = false; return n;
  };
  /* شمارهٔ تکنیک در متن («T41»، «تکنیکِ ۴۱») — همان شمارهٔ ثبت‌گاه */
  function techNums(t) { var o = [], x = dg(t || ""); x.replace(/(?:^|[^A-Za-z0-9])T\s?(\d{1,2})(?!\d)/g, function (m0, n) { if (A.TM[+n]) o.push(+n); return m0; }); x.replace(/تکنیک[ِ]?\s*(\d{1,2})(?!\d)/g, function (m0, n) { if (A.TM[+n]) o.push(+n); return m0; }); return o; }
  PR.techNums = techNums;
  function prcDidIn(c, from, to) { return (c.sessions || []).some(function (s0) { return !s0.draft && s0.d >= String(from || "") && s0.d <= to; }); }
  PR.prcDidIn = prcDidIn;
  function linkedWillToStep(pid, wsId) { return planList().some(function (x) { var q = x.p; return q && q.will && q.will.pid === pid && q.will.id === wsId && q.step && planOpenX(x); }); }
  var rawWillDue = A.willDue;
  if (rawWillDue && !rawWillDue._prc) {
    A.willDue = function () { return (rawWillDue.apply(this, arguments) || []).filter(function (e) { if (!e || e.kind !== "prob" || e.what !== "step") return true; var W = willOfPid(e.id), o = W && (W.w.steps || []).filter(function (y) { return !y.closed; }).pop(); return !(o && linkedWillToStep(e.id, o.id)); }); };
    A.willDue._prc = true;
  }
  /* 🎯 ِ پیوسته به برنامه‌ای که 🌱 ِ بازِ همان کار را هم دارد ⇒ سطرِ 🌱 همان کار است (A.SCHED: dupOf کلیدِ 🌱) */
  PR.fcDup = function (f) {
    if (!f || !f.plan) return null; var x = planList().filter(function (y) { return y.p && y.p.id === f.plan.id && y.s && y.s.id === f.plan.sess; })[0];
    if (!x || !x.p.will || !planOpenX(x)) return null; return "will:prob:" + x.p.will.pid + ":step";
  };
  /* «امروز»: سطرِ «📌 برنامهٔ خودت» ِ برنامهٔ پیوسته حذف (سطرِ همان گام/🌱 می‌ماند)؛ برنامهٔ بی‌پیوند با نامزدِ هم‌پوشان یک دکمهٔ «همان …» می‌گیرد */
  var rawDuePlan = A.dueList;
  A.dueList = function () {
    try { PR.planStateSync(); } catch (e) { }
    var items = rawDuePlan.apply(this, arguments) || [], P0 = {}, C0 = PR.planCands();
    planList().forEach(function (x) { if (x.p) P0[x.p.id] = x; });
    return items.filter(function (it) {
      var x = it && it.pid && P0[it.pid]; if (!x || !/^📌/.test(String(it.txt || ""))) return true;
      if (x.p.step || x.p.will || x.p.fc) return false;
      if (x.p.prc) { var pc1 = S.get(x.p.prc); if (pc1 && !pc1.closed && pc1.state !== "closed" && pc1.due && pc1.due <= today()) return false; }   /* دورِ ۲۲: سطرِ پرونده در «امروز» همان کار است (یک سطر)؛ پرونده‌ای که امروز سطر ندارد ⇒ «📌» تنها یادآور است و می‌ماند */
      C0.filter(function (c0) { return c0.x.p === x.p; }).slice(0, 2).forEach(function (c0) {
        var nm = c0.kind === "step" ? "گام" : c0.kind === "fc" ? "🎯" : c0.kind === "prc" ? "پروندهٔ تمرین" : "🌱";
        it.acts = (it.acts || []).concat([{ t: c0.kind === "step" ? "همان گامِ «" + clip(c0.txt, 30) + "»" : "همان " + nm + " «" + clip(c0.txt, 30) + "»", cls: "dopt plan-same", fn: function () { PR.planLink(c0, true); A.toast("یکی شد: برنامه و همان " + nm + " — یک وضع، یک سطر."); if (A.render) A.render(); } }]);
      });
      return true;
    });
  };
  /* صفحهٔ مسئله: «همان برنامه؟» یک‌کلیکی برای گامِ تازه‌ای که با برنامهٔ بازِ همین مسئله هم‌پوشان است */
  var rawLp = A.V.lprob;
  if (rawLp && !rawLp._plan) {
    A.V.lprob = function (pid) {
      try { PR.planStateSync(); } catch (e) { }
      var el = rawLp.apply(this, arguments);
      try {
        var C1 = PR.planCands(pid);
        if (C1.length && el && el.firstChild) {
          var box = h("section", { class: "card soft prc-same", dir: "rtl", role: "group", "aria-label": "همان برنامه؟" }, h("h4", {}, "📌 همان برنامه؟"));
          C1.slice(0, 3).forEach(function (c0) {
            box.appendChild(h("div", { class: "row gap wrap" }, h("span", { class: "small" }, (c0.kind === "step" ? "گامِ «" : "🌱 «") + clip(c0.txt, 70) + "» همان برنامه‌ای است که در گفت‌وگو گفتی: «" + clip(c0.x.p.text, 70) + "»؟"),
              h("button", { class: "btn sm plan-same-yes", type: "button", onclick: function () { PR.planLink(c0, true); A.toast("یکی شد — یک وضع و یک سطر در «امروز»."); A.render(); } }, "بله، همان"),
              h("button", { class: "btn sm ghost plan-same-no", type: "button", onclick: function () { PR.planLink(c0, false); A.render(); } }, "نه، جداست")));
          });
          el.insertBefore(box, el.children[1] || null);
        }
      } catch (e) { console.warn(e); }
      return el;
    };
    A.V.lprob._plan = true; A.V.lprob._prc = true;
  }

  /* ---------- دورِ ۲۱ (R5، C21-12): «روند درصد بازیابی برگه سفید» از جلسه‌های سنجیدهٔ پرونده‌های T41 هم (نه فقط اجراهای P3/P4) ----------
     جلسه‌ای که از اجرای P3/P4 آمده (src: "p3") همان اجراست و دو بار شمرده نمی‌شود. */
  var rawTrend = A.recallTrend;
  if (rawTrend && !rawTrend._prc) {
    A.recallTrend = function () {
      var out = (rawTrend.apply(this, arguments) || []).slice();
      PR.cases({ tid: 41 }).forEach(function (c) { (c.sessions || []).forEach(function (x) { if (!x.draft && x.src !== "p3" && x.meas && x.meas.pct != null) out.push({ d: x.d, v: +x.meas.pct, prc: c.id }); }); });
      return out.sort(function (a, b) { return String(a.d).localeCompare(String(b.d)); });
    };
    A.recallTrend._prc = true;
  }

  /* ===== دورِ ۲۲ ِ تورِ پولیا (P6/P7/P8، DECISIONS_R22) — فهرست‌های جاری دیگر جزیره نیستند =====
     • هر مورد به مسئله و سشنش پیوند دارد و در صفحهٔ 🔭 ِ همان مسئله، «📜 پرونده» (مسئله و گفت‌وگو) و «🏋 کارِ تکنیک‌ها» ِ کارنامه می‌آید.
     • کنش‌های دستیار list_add و list_update (مدل گزارش می‌دهد، صفحه با پیامِ خودِ او می‌سنجد: نقل در همین پیام، متنِ مورد از حرفش، هر عدد
       در حرفش، تاریخِ بررسی از حرفش). یک سطرِ پرامپت جای هر نیاز را می‌گوید (فرض ⇒ فرض‌ها، …).
     • جلسهٔ پروندهٔ تکنیکی که شکلِ «فهرست» دارد (T15 …) همان مرورِ فهرستِ خودش است، و پرونده و فهرست به هم پیوند دارند.
     • «امروز»: موعدِ گذشته (⏰) ⇒ «تحویل دادی؟» با دو پاسخِ یک‌تپی. */
  var LIST_USE = PR.LIST_USE = { assumptions: "فرضی که نقشه رویش بنا شده (باربر = اگر غلط باشد همه فرو می‌ریزد)", models: "مدلِ ذهنی که در یک موقعیتِ واقعی به کار برد", mistakes: "اشتباهِ فکری‌ای که نمی‌خواهد تکرار شود", beliefs: "باوری که زیرِ آزمون است", ambiguities: "پرسشِ باز با چند فرضیهٔ رقیب و احتمالِ هر کدام", pareto: "چند عاملِ اصلی با سهمِ هر کدام", claims: "ادعایی که باید با دادهٔ تازه دوباره سنجیده شود (سیگنال یا نویز) با تاریخِ بررسی" };
  function itemLinked(x, pid) { return !!pid && (x.pid === pid || (x.uses || []).some(function (u) { return u && u.link && u.link.k === "live" && u.link.id === pid; })); }
  PR.itemsOf = function (pid, o) { o = o || {}; var out = []; PR.all(function (c) { return c.kind === "list" && own(c); }).forEach(function (c) { (c.items || []).forEach(function (x) { if ((pid && itemLinked(x, pid)) || (o.sess && x.sess === o.sess)) out.push({ c: c, x: x }); }); }); return out; };
  function itemEvents(c, x, pid) {
    var L = LISTS[c.list] || {}, key = c.id + ":" + x.id, src = { kind: "list", id: c.id, item: x.id, sess: x.sess || "" }, nm = L.fa, t = clip(itemTitle(x), 120), out = [];
    var ev = function (kind, at, d, title, lines, outc) { if (!d || !/^\d{4}-\d\d-\d\d$/.test(String(d))) return; out.push({ k: "practice", kind: kind, at: at || evAt(d), d: d, title: "📋 " + nm + " — " + title, lines: lines.filter(Boolean), out: outc || "", prc: key, src: src, list: c.list, item: x.id }); };
    if (!pid || x.pid === pid) ev("list:add", x.at && A.localDay(x.at) === x.d ? x.at : "", x.d, "مورد تازه", ["«" + t + "»", x.quote && x.quote !== itemTitle(x) ? "از حرفِ خودت: «" + clip(x.quote, 120) + "»" : "", x.load ? "باربر" : "", x.p != null && !(x.hyps || []).length ? "احتمال: " + fa(x.p) + "٪" : "", liveTitle(x.pid) ? "مسئله: «" + clip(liveTitle(x.pid), 60) + "»" : x.chatProb ? "مسئلهٔ گفت‌وگو: «" + clip(x.chatProb, 60) + "»" : ""]);
    if (!pid || x.pid === pid) {
      (x.hist || []).forEach(function (e) {
        if (!e || !e.d || e.why === "ثبتِ نخست") return;
        if (e.ev === "close") ev("list:close", "", e.d, CLOSE_FA[e.kind] || "بسته شد", ["«" + t + "»", e.why && e.why !== CLOSE_FA[e.kind] ? e.why : ""], CLOSE_FA[e.kind] || "بسته شد");
        else if (e.ev === "reopen") ev("list:reopen", "", e.d, "دوباره باز شد", ["«" + t + "»"]);
        else if (e.load != null) ev("list:load", "", e.d, e.load ? "باربر شد" : "دیگر باربر نیست", ["«" + t + "»", e.why || ""]);
        else if (e.p != null) ev("list:p", "", e.d, "احتمالِ تازه", ["«" + t + "»", (e.from != null ? fa(e.from) + "٪ ← " : "") + fa(e.p) + "٪", e.why || ""]);
        else if (e.verdict) ev("list:verdict", "", e.d, "حکم: " + e.verdict, ["«" + t + "»", e.why || "", x.recheck2 && x.recheck ? "بررسیِ دوباره: " + fdate(x.recheck) : ""], e.verdict);
        else if (e.conf != null) ev("list:conf", "", e.d, "اطمینان: " + fa(e.conf) + "٪", ["«" + t + "»"]);
      });
      (x.hyps || []).forEach(function (hy) { (hy.hist || []).forEach(function (e, j) { ev("list:hyp", "", e.d, j ? "احتمالِ فرضیه عوض شد" : "فرضیه", ["«" + t + "»", "فرضیه: «" + clip(hy.t, 80) + "» — " + (j && e.from != null ? fa(e.from) + "٪ ← " : "") + (e.p == null ? "—" : fa(e.p) + "٪"), j ? e.why || "" : ""]); }); });
      (x.shares || []).forEach(function (sh) { ev("list:share", "", sh.d, "سهم", ["«" + t + "»", sh.v == null ? "—" : fa(sh.v) + "٪"]); });
    }
    (x.uses || []).forEach(function (u) { if (pid && !(u.link && u.link.k === "live" && u.link.id === pid)) return; ev("list:use", u.at && A.localDay(u.at) === u.d ? u.at : "", u.d, "کاربستِ مدل", ["«" + t + "»", u.where ? "کجا: " + u.where : "", u.quote ? "از حرفِ خودت: «" + clip(u.quote, 100) + "»" : ""]); });
    return out;
  }
  PR.itemEvents = itemEvents;
  var rawEvents = PR.events;
  PR.events = function (subj) {
    var out = rawEvents.apply(this, arguments);
    try {
      var sj = typeof subj === "string" ? PR.subj("live", subj) : subj, pid = sj && sj.k === "live" ? sj.id : "";
      if (!sj || pid) PR.all(function (c) { return c.kind === "list" && own(c); }).forEach(function (c) { (c.items || []).forEach(function (x) { if (!pid || itemLinked(x, pid)) itemEvents(c, x, pid).forEach(function (e) { out.push(e); }); }); });
      out.sort(function (a, b) { return String(a.at).localeCompare(String(b.at)); });
    } catch (e) { console.warn(e); }
    return out;
  };
  /* 🔭: موردهای فهرست‌های جاریِ همین مسئله (یک جا، با پیوند به فهرست) — دیگر جزیره نیست */
  var rawLiveSection = liveSection;
  liveSection = function (pid) {
    var box = rawLiveSection(pid); if (!box) return box;
    try {
      var IT = PR.itemsOf(pid);
      box.appendChild(h("div", { class: "prc-lists", dir: "rtl" }, h("h4", {}, "📋 فهرست‌های جاریِ همین مسئله"),
        IT.length ? h("ul", { class: "plain small" }, IT.map(function (y) { var x = y.x, L = LISTS[y.c.list] || {};
          return h("li", { "data-item": x.id, "data-list": y.c.list }, h("button", { class: "linkish", type: "button", onclick: function () { A.go("practice", y.c.id); } }, L.fa), " — «" + clip(itemTitle(x), 80) + "»" + (x.closed ? " · " + (CLOSE_FA[x.closed.kind] || "بسته شد") : "") + (x.load ? " · باربر" : "") + ((x.hyps || []).length ? " · " + x.hyps.map(function (hy) { return "«" + clip(hy.t, 30) + "» " + (hy.p == null ? "—" : fa(hy.p) + "٪"); }).join("، ") : "") + ((x.shares || []).length ? " · سهم " + fa(x.shares[x.shares.length - 1].v) + "٪" : "") + (x.verdict ? " · حکم: " + x.verdict : "")); }))
          : h("p", { class: "small muted" }, "هنوز موردی از این مسئله در فهرست‌ها نیست (فرض، ابهام، اشتباه، مدل، عامل یا ادعا — از صفحهٔ فهرست با انتخابِ همین مسئله، یا در گفت‌وگو).")));
    } catch (e) { console.warn(e); }
    return box;
  };
  PR.liveSection = liveSection;

  /* ---------- کنش‌های دستیار: list_add / list_update ---------- */
  function allNums(t) { var o = []; dg(t || "").replace(/\d+(?:[.٫]\d+)?/g, function (x) { o.push(+x.replace("٫", ".")); return x; }); return o; }
  function numOk(v, said) { var n = num(v); return n != null && allNums(said).indexOf(n) >= 0 ? n : null; }
  function textOf(a) { return String(a.text || a.name || a.claim || a.driver || "").trim(); }
  /* تاریخِ بررسی فقط از حرفِ خودش: نقلی از پیامش («یه ماه دیگه»، «۱۵ آذر»)، یا تاریخی که با همان حرف یکی است */
  function recheckOf(r, said) {
    if (!r) return { d: "" }; var t = String(r).trim(), iso = /^\d{4}-\d\d-\d\d$/.test(t), fromSaid = PR.parseWhen(said) || (PR.rhythmIn(said) ? add(today(), PR.rhythmIn(said)) : "");
    if (iso) return t === fromSaid ? { d: t } : { err: "تاریخِ بررسی («" + t + "») از حرفِ او خوانده نشد" };
    if (!PR.quoteIn(t, said)) return { err: "زمانِ بررسی («" + clip(t, 40) + "») در پیامِ همین نوبت نیست" };
    var d = PR.parseWhen(t) || (PR.rhythmIn(t) ? add(today(), PR.rhythmIn(t)) : ""); return d && d >= today() ? { d: d } : { err: "از «" + clip(t, 40) + "» تاریخی خوانده نشد" };
  }
  function sessLink(a, s) {
    var pids = sessPids(s), pid = a.pid && A.liveRec && A.liveRec(a.pid) ? a.pid : pids[0] || "", C = (s && s.coach) || {};
    var chat = !pid && C.stmt && !(AS && AS.notProblem && AS.notProblem(C.stmt)) ? clip(C.stmt, 120) : "";
    return { pid: pid, chatProb: chat, sess: s ? s.id : "" };
  }
  function caseForList(name, s, pid) { var tid = (LISTS[name] || {}).tid; return PR.cases().filter(function (c) { return c.tid === tid && c.state !== "closed" && !c.closed && ((s && (c.sess === s.id || (s.prcs || []).indexOf(c.id) >= 0)) || (pid && c.subj.k === "live" && c.subj.id === pid)); })[0] || null; }
  function findItem(name, k, quote) {
    var c = PR.list(name); if (!c) return { err: "فهرستِ «" + name + "» نیست" };
    var x = k ? PR.listItem(name, k) : null; if (x) return { x: x, c: c };
    var L = (c.items || []).filter(function (y) { return (k && PR.sameAct(itemTitle(y), k)) || (!k && quote && PR.sameAct(itemTitle(y), quote)); });
    if (L.length === 1) return { x: L[0], c: c };
    return { err: L.length ? "چند مورد جور است («" + L.slice(0, 3).map(function (y) { return clip(itemTitle(y), 30) + "» " + y.id; }).join("، «") + ") — شناسه را بده" : "موردِ «" + clip(k || quote || "", 40) + "» در «" + (LISTS[name] || {}).fa + "» پیدا نشد" };
  }
  PR.findItem = findItem;
  if (AS && AS.DO) {
    /* {"do":"list_add","list":"assumptions|models|mistakes|beliefs|ambiguities|pareto|claims","text":"عینِ حرفش","quote":"عینِ حرفش","p":عدد,"share":عدد,"load":true,"hyps":[{"t":"…","p":عدد}],"recheck":"…","use":true,"pid":"…"} */
    AS.DO.list_add = function (a) {
      a = a || {}; var s = AS._turnSession, T = turnMsgs(s), L = LISTS[a.list];
      if (!L) return "در فهرست نگه داشته نشد: فهرستِ «" + clip(a.list || "", 20) + "» نیست — یکی از: " + Object.keys(LISTS).join("، ");
      /* دورِ ۲۳ (Q7، C23-7): نقلی که از دو پیامِ پیاپیِ خودش ساخته شده (متنِ ادعا در پیامِ پیش، تاریخِ سنجش در همین پیام) پذیرفته است — هر تکه عیناً در یکی از
         همان دو پیام؛ رضایت همچنان فقط از پیامِ همین نوبت (PR.consentOk) */
      var HQ = T.last ? PR.herQuote(a.quote, s) : null;
      if (!HQ) return "در فهرست نگه داشته نشد: نقلِ حرفش («" + clip(a.quote || "", 60) + "») در پیامِ همین نوبت (یا پیامِ پیش از آن) نیست — فقط آنچه خودش گفت نگه داشته می‌شود";
      /* نگه داشتن فقط با خواستهٔ خودش یا «آری» به پیشنهاد (همان سنجشِ رضایتِ start_practice) — «شاید…، نمی‌دونم» یا «فرض کن…» ِ ریاضی نگه داشتن نیست */
      var cv = PR.consentOk(a, s); if (!cv.ok) return "در فهرست نگه داشته نشد: " + cv.why;
      var said = HQ.said, t = textOf(a);
      /* دورِ ۲۳ (Q7، C23-20): مدلی که همین حالا به کار برد و نامش در قفسه هست («همون تلسکوپی رو به کار بردم» ⇐ «روش تلسکوپی») همان مورد است — کاربستِ دوم، نه موردِ تازه با کلِ جمله */
      if (t && a.list === "models" && !(PR.quoteIn(t, said) || PR.quoteIn(t, a.quote))) { var mx = PR.modelNamed(t, said); if (mx) t = itemTitle(mx); }
      if (!t || !(PR.quoteIn(t, said) || PR.quoteIn(t, a.quote) || (a.list === "models" && PR.modelNamed(t, said)))) t = String(a.quote).trim();
      var lk = sessLink(a, s), it = { text: t, quote: clip(a.quote, 200), pid: lk.pid, chatProb: lk.chatProb, sess: lk.sess }, notes = [];
      var pc = caseForList(a.list, s, lk.pid); if (pc) it.prc = pc.id;
      if (a.list === "models") it.name = t; if (a.list === "claims") it.claim = t; if (a.list === "pareto") it.driver = t;
      if (a.load != null) it.load = a.load === true || a.load === "true";
      if (a.p != null) { var pv = numOk(a.p, said); if (pv != null) it.p = pv; else notes.push("احتمال در حرفش نبود — ثبت نشد"); }
      if (a.share != null) { var sv = numOk(a.share, said); if (sv != null) it.share = sv; else notes.push("سهم در حرفش نبود — ثبت نشد"); }
      if (Array.isArray(a.hyps)) it.hyps = a.hyps.filter(function (y) { return y && String(y.t || y.h || "").trim(); }).map(function (y) { var ht = String(y.t || y.h).trim(), hp = y.p == null ? null : numOk(y.p, said); if (y.p != null && hp == null) notes.push("احتمالِ «" + clip(ht, 20) + "» در حرفش نبود"); return { t: ht, p: hp, why: "از گفت‌وگو" }; });
      if (a.list === "claims" && a.recheck) { var rc = recheckOf(a.recheck, said); if (rc.err) notes.push(rc.err); else it.recheck = rc.d; }
      var x = a.list === "models" && (a.use === true || a.use === "true") ? PR.modelUse(t, { where: lk.pid ? "مسئلهٔ «" + liveTitle(lk.pid) + "»" : lk.chatProb ? "مسئلهٔ گفت‌وگو «" + lk.chatProb + "»" : "گفت‌وگو", real: true, pid: lk.pid, sess: lk.sess, quote: a.quote }) : null;
      if (x) { ["pid", "sess", "quote", "chatProb", "prc"].forEach(function (f) { if (it[f] && x[f] == null) x[f] = it[f]; }); listSave(PR.list("models")); }
      else x = PR.listAdd(a.list, it);
      if (!x) return "در فهرست نگه داشته نشد";
      if (s) { s.lists = s.lists || []; var kk = a.list + ":" + x.id; if (s.lists.indexOf(kk) < 0) s.lists.push(kk); }
      return "✓ در «" + L.fa + "» نگه داشته شد: «" + clip(itemTitle(x), 60) + "» (" + x.id + ")" + (lk.pid ? " · مسئله: «" + clip(liveTitle(lk.pid), 40) + "»" : lk.chatProb ? " · مسئلهٔ گفت‌وگو" : "") + (x.load ? " · باربر" : "") + (x.recheck ? " · بررسیِ دوباره: " + fdate(x.recheck) : "") + (a.list === "models" && x.uses ? " · کاربست: " + fa(x.count || 0) + " روز" : "") + (a.list === "pareto" && PR.paretoSum().over ? " · ⚠ سهم‌ها روی هم " + fa(PR.paretoSum().sum) + "٪ شد — بیش از ۱۰۰٪؛ از خودش بپرس کدام را درست کند" : "") + (notes.length ? " · " + notes.join("؛ ") : "");
    };
    /* {"do":"list_update","list":"…","item":"شناسه یا متن","quote":"عینِ حرفش","how":"resolved|refuted|closed|reopen","why":"…","p":عدد,"hyp":"…","verdict":"سیگنال|نویز|نامعلوم","result":"…","load":true|false,"share":عدد,"recheck":"…"} */
    AS.DO.list_update = function (a) {
      a = a || {}; var s = AS._turnSession, T = turnMsgs(s), L = LISTS[a.list];
      if (!L) return "مورد به‌روز نشد: فهرستِ «" + clip(a.list || "", 20) + "» نیست";
      if (!T.last || !PR.quoteIn(a.quote, T.last.text)) return "مورد به‌روز نشد: نقلِ حرفش («" + clip(a.quote || "", 60) + "») در پیامِ همین نوبت نیست";
      var said = String(T.last.text || ""), F = findItem(a.list, a.item, a.quote); if (F.err) return "مورد به‌روز نشد: " + F.err;
      var x = F.x, did = [], why = clip(a.why || a.quote, 160);
      if (a.load != null && a.list === "assumptions") { PR.loadSet(x.id, a.load === true || a.load === "true", why); did.push(x.load ? "باربر" : "نه باربر"); }
      if (a.hyp && a.list === "ambiguities") { var hp = a.p == null ? null : numOk(a.p, said); if (a.p != null && hp == null) return "مورد به‌روز نشد: احتمالِ «" + a.p + "» در حرفش نبود — عدد از خودمان نمی‌سازیم"; PR.hypSet(x.id, a.hyp, hp, why); did.push("فرضیهٔ «" + clip(a.hyp, 30) + "»" + (hp != null ? " " + fa(hp) + "٪" : "")); }
      else if (a.p != null && a.list === "ambiguities") { var pv = numOk(a.p, said); if (pv == null) return "مورد به‌روز نشد: احتمالِ «" + a.p + "» در حرفش نبود"; PR.ambUpdate(x.id, pv, why); did.push("احتمال " + fa(pv) + "٪"); }
      if (a.share != null && a.list === "pareto") { var sv = numOk(a.share, said); if (sv == null) return "مورد به‌روز نشد: سهمِ «" + a.share + "» در حرفش نبود"; PR.paretoShare(itemTitle(x), sv); did.push("سهم " + fa(sv) + "٪" + (PR.paretoSum().over ? " (⚠ سهم‌ها روی هم " + fa(PR.paretoSum().sum) + "٪ — بیش از ۱۰۰٪)" : "")); }
      if (a.verdict && a.list === "claims") { var rc = a.recheck ? recheckOf(a.recheck, said) : { d: "" }; if (rc.err) return "مورد به‌روز نشد: " + rc.err; PR.claimResult(x.id, a.result || a.quote, a.verdict, null, rc.d); did.push("حکم: " + a.verdict + (rc.d ? " · بررسیِ دوباره " + fdate(rc.d) : " · تاریخِ بررسیِ دوباره را بپرس")); }
      else if (a.recheck && a.list === "claims") { var rc2 = recheckOf(a.recheck, said); if (rc2.err) return "مورد به‌روز نشد: " + rc2.err; x.recheck = rc2.d; x.needDate = false; if (x.decidedAt) x.recheck2 = true; listSave(F.c); did.push("بررسیِ دوباره " + fdate(rc2.d)); }
      if (a.how === "reopen") { PR.itemReopen(a.list, x.id, why); did.push("دوباره باز شد"); }
      else if (a.how && CLOSE_FA[a.how]) { PR.itemClose(a.list, x.id, why, null, a.how); did.push(CLOSE_FA[a.how]); }
      if (!did.length) return "مورد به‌روز نشد: تغییری گفته نشد (how، p/hyp، load، share، verdict یا recheck)";
      if (s && !x.sess) { x.sess = s.id; listSave(F.c); }
      return "✓ «" + clip(itemTitle(x), 50) + "» در «" + L.fa + "»: " + did.join(" · ");
    };
  }
  /* پرامپت: جای هر نیاز و موردهای همین مسئله/سشن — زمینه، نه پرسش؛ فقط وقتی سشن موضوع دارد یا موردی از همین سشن هست */
  PR.listPromptBlock = function (s, msg) {
    if (!s) return ""; var SB = PR.sessSubject(s, msg), mine = [];
    PR.all(function (c) { return c.kind === "list" && own(c); }).forEach(function (c) { (c.items || []).forEach(function (x) { if (!x.closed && (x.sess === s.id || SB.pids.some(function (p) { return itemLinked(x, p); }))) mine.push({ c: c, x: x }); }); });
    if (!SB.any && !mine.length) return "";
    var out = ["# فهرست‌های جاری (زمینه، نه پرسش؛ هر مورد با مسئله و سشنش؛ مرور به آهنگِ خودِ هر تکنیک)",
      "- جای هر نیاز: " + Object.keys(LISTS).map(function (k) { return k + " = «" + LISTS[k].fa + "» (" + LIST_USE[k] + ")"; }).join(" · "),
      "- اگر خودش خواست چیزی را نگه دارد («یه جا نگهش دار»، «یادم بمونه که…») یا فرض/ابهام/اشتباه/مدل/عامل/ادعایش را گفت و نگه‌داشتن را پذیرفت: {\"do\":\"list_add\",\"list\":\"…\",\"text\":\"عینِ حرفش\",\"quote\":\"عینِ حرفش\",\"consent\":{\"quote\":\"عینِ خواسته‌اش\",\"kind\":\"request\"|\"yes\"}} — و فقط اگر خودش گفت: \"p\" یا \"share\" (عددِ خودش)، \"load\":true (اگر غلط باشد همه فرو می‌ریزد)، \"hyps\":[{\"t\":\"…\",\"p\":عدد}] برای ابهام، \"recheck\":\"عینِ حرفش دربارهٔ زمانِ بررسی\" برای ادعا، \"use\":true برای مدلی که همین‌جا به کار برد. مسئله و سشن را صفحه می‌گذارد؛ تا نتیجهٔ صفحه نیامده نگو «نگه داشتم».",
      "- تغییرِ یک مورد از حرفِ خودش: {\"do\":\"list_update\",\"list\":\"…\",\"item\":\"شناسه\",\"quote\":\"عینِ حرفش\",\"how\":\"resolved|refuted|closed\"} یا با \"hyp\"+\"p\" (احتمالِ تازهٔ یک فرضیه)، \"load\"، \"share\"، \"verdict\":\"سیگنال|نویز|نامعلوم\" (+\"recheck\")."];
    if (mine.length) out.push("- موردهای بازِ همین مسئله/سشن: " + mine.slice(0, 10).map(function (y) { var x = y.x; return x.id + " (" + y.c.list + ") «" + clip(itemTitle(x), 50) + "»" + (x.load ? " باربر" : "") + ((x.hyps || []).length ? " — " + x.hyps.map(function (hy) { return "«" + clip(hy.t, 25) + "» " + (hy.p == null ? "—" : hy.p + "٪"); }).join("، ") : x.p != null ? " " + x.p + "٪" : "") + (x.verdict ? " حکم " + x.verdict : ""); }).join(" · "));
    return out.join("\n");
  };
  if (AS) { AS.promptHooks = AS.promptHooks || []; AS.promptHooks.push(function (s, msg) { return PR.listPromptBlock(s || null, msg); }); }

  /* جلسهٔ پروندهٔ تکنیکی که شکلِ «فهرست» دارد (T15، T16، T34، T35، T3، T10) همان مرورِ فهرستِ خودش است (D·s35): پرونده و فهرست به هم پیوند دارند */
  var rawSession22 = PR.session;
  PR.session = function (c, o) {
    if (typeof c === "string") c = S.get(c);
    var s0 = rawSession22.call(this, c, o);
    try {
      var pl = c && P[c.tid];
      if (s0 && pl && pl.shape === "list" && LISTS[pl.list] && c.kind !== "list") {
        var lo = { sample: !!c.sample }, lc = PR.list(pl.list, lo);
        if ((c.links = c.links || {}).list !== lc.id) { c.links.list = lc.id; S.put(c); }
        lc.cases = lc.cases || []; if (lc.cases.indexOf(c.id) < 0) lc.cases.push(c.id);
        if ((lc.reviews || []).indexOf(s0.d) < 0) PR.listReview(pl.list, "جلسهٔ پروندهٔ تمرینِ «" + PR.subjTitle(c.subj) + "»" + (s0.what ? ": " + clip(s0.what, 80) : ""), lo);
        else S.put(lc);
      }
    } catch (e) { console.warn(e); }
    return s0;
  };

  /* «امروز»: موعدی (⏰) که گذشت و «انجام شد» نخورد ⇒ «تحویل دادی؟» (C22-14) — پاسخِ «بله» همان deadline_done است؛ «هنوز نه» تا فردا */
  var rawDueDl = A.dueList;
  if (rawDueDl && !rawDueDl._dl22) {
    A.dueList = function () {
      var items = rawDueDl.apply(this, arguments) || [];
      try {
        S.all("deadline", function (x) { return x && !x.done && x.date && x.date < today() && !(x.askSnooze && x.askSnooze > today()); }).sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); }).forEach(function (r) {
          /* دورِ ۲۳ (Q7، B·D15): فعلِ پرسش از نوعِ کار — امتحان «دادی؟»، تحویل «تحویل دادی؟»، بقیه «انجام شد؟» (PR.dlVerb) */
          var vb = PR.dlVerb(r.what);
          items.unshift({ k: "warn", dl: r.id, txt: "⏰ «" + clip(r.what, 60) + "» — موعدش (" + fdate(r.date) + ") گذشت؛ " + vb.q, sub: fa(gap(r.date, today())) + " روز از موعد گذشته",
            go: function () { A.toast(vb.q + " یکی از دو دکمهٔ کنارش را بزن."); },
            acts: [{ t: vb.yes, cls: "dopt dl-done", fn: function () { try { AS.DO.deadline_done({ what: r.id }); } catch (e) { r.done = true; r.doneAt = nowISO(); S.put(r); } A.toast("«" + clip(r.what, 40) + "» " + vb.done + " علامت خورد."); A.render(); } },
              { t: "هنوز نه", cls: "dopt dl-notyet", fn: function () { r.askSnooze = add(today(), 1); (r.asks = r.asks || []).push({ d: today(), ans: "notyet" }); S.put(r); A.render(); } }] });
        });
      } catch (e) { console.warn(e); }
      return items;
    };
    A.dueList._dl22 = true;
  }

  /* 🏋 کارنامه: هر فهرستِ جاری که موردی دارد یک سطر — افزودن، احتمال، حکم، باربر، سهم، کاربست و بستن، هر کدام با تاریخ و منبع (بی‌نگاشت به بُعدها) */
  if (A.MIND && typeof A.MIND.techWork === "function" && !A.MIND.techWork._lists) {
    var rawTW = A.MIND.techWork;
    A.MIND.techWork = function () {
      var W = rawTW.apply(this, arguments);
      try {
        PR.all(function (c) { return c.kind === "list" && own(c) && (c.items || []).length; }).forEach(function (c) {
          var L = LISTS[c.list] || {}, acts = [];
          (c.items || []).forEach(function (x) { itemEvents(c, x, "").forEach(function (e) { acts.push({ id: "list:" + c.id + ":" + x.id + ":" + e.kind + ":" + e.d + ":" + acts.length, at: e.at, src: "list", kind: "list", rid: c.id, go: ["practice", c.id], ok: e.kind === "list:close" && (x.closed || {}).kind === "refuted" ? (c.list === "assumptions" ? true : false) /* دورِ ۲۶ (Q9، U30 s13، بانکِ R26 #238 — سهمِ classify): فرضی که خودش آزمود و رد شد کارِ خودِ تکنیکِ «فهرستِ فرض‌ها» است، نه شکست */ : null, fa: e.title + " — " + e.lines.join(" · "), day: e.d }); }); });
          if (!acts.length) return;
          acts.sort(function (a, b) { return String(a.at).localeCompare(String(b.at)); });
          var days = {}; acts.forEach(function (a) { days[a.day] = 1; });
          W.rows.push({ key: "list:" + c.id, tech: String(L.tid || ""), subj: L.fa, rid: c.id, src: "list", state: "", base: "📋 " + L.fa + " (T" + (L.tid || "") + ")", acts: acts, ev: [], fcs: {}, pending: 0, off: [], days: Object.keys(days).length, nm: 0, last: null, first: null, dim: null, dimHow: (A.MIND.UNMAPPED || "بی‌نگاشت"), go: ["practice", c.id] });
          W.acts = W.acts.concat(acts);
        });
      } catch (e) { console.warn(e); }
      return W;
    };
    A.MIND.techWork._lists = true;
  }

  /* ===== دورِ ۲۳ ِ تورِ پولیا (Q7، DECISIONS_R23 — سهمِ «today») — «امروز»، پرونده، فهرست‌ها، تمرین و قول‌ها =====
     مدل گزارش می‌دهد، صفحه می‌سنجد (experiences/model-reports-state-page-validates.md)؛ «یک کار، یک صاحب» (one-clock-one-scheduler … Update 2026-10-18):
     • یک سطرِ «امروز» برای هر کار (A23-11، D23-31): برنامه ⇄ پیگیری (⏰) ⇄ پیش‌بینی (🎯) ⇄ پرونده/کارت/مرورِ حلِ همان مسئله. «همان کار» فقط با شاهد:
       پیوندِ ثبت‌شده (q.fc، q.prc، f.plan)، یا همان روزِ موعد + هم‌پوشانیِ محتوا (متن با متن، یا متن با پیامِ منبعِ دیگری)، یا عنوانِ همان مسئله برای بازیابی.
       سطرِ صاحب می‌ماند (برنامه > موعد > 🎯 > پرونده > کارت > مرور) و بقیه در «همان کار: …» ِ آن؛ هیچ رکوردی پاک نمی‌شود (it.merged).
       پاسخِ «انجام دادم/ندادم» ِ برنامه همان موعدِ پیوسته را هم می‌بندد (یک وضع).
     • موعدی که خودش گفت انجام شد («میان‌ترم رو ۱۴ گرفتم») بسته می‌شود، حتی اگر مدل deadline_done نفرستاد (B·D15)؛ فعلِ پرسش از نوعِ کار (امتحان/تحویل/انجام).
     • حدسِ گفت‌وگو سرانجامش را از آزمودنِ خودش در پیام‌های بعد می‌گیرد («n=1 … ✓ … پس درسته!») — C22-11، B·D23.
     • خواستهٔ خودش «… ولی بعداً» قول می‌شود (s.promises، by: "user") و برمی‌گردد — در پرامپتِ هر سشن و در «امروز» (D23-33).
     • مسئله‌های تازه‌ای که در بازنگریِ مسئلهٔ گفت‌وگو ساخت، پیش از آن‌که آن مسئله رکورد شود، در بازنگریِ همان مسئله می‌مانند و روی نردبان به «امروز» برمی‌گردند (D23-40).
     • قفسهٔ مدل‌ها: یک مدل با کاربست‌هایش، نه دو مورد (C23-20، B·D21). */
  function stoks(t) { return toks(t).map(function (w) { return w.replace(/[ً-ٰٟ]/g, "").replace(/(?:های|ها)$/, ""); }).filter(function (w, i, X) { return w.length >= 2 && X.indexOf(w) === i; }); }
  /* «امتحانو» ≡ «امتحان»، «داروخانهٔ» ≡ «داروخانه»: پسوندِ گفتاری/اضافه (تا دو حرف) واژه را دیگر نمی‌کند */
  function sameW(a, b) { if (a === b) return true; var s1 = a.length <= b.length ? a : b, l1 = s1 === a ? b : a; return s1.length >= 3 && l1.length - s1.length <= 2 && l1.indexOf(s1) === 0; }
  function ovS(a, b) { if (!a || !b) return 0; var B1 = stoks(b); return stoks(a).filter(function (w) { return B1.some(function (v) { return sameW(w, v); }); }).length; }
  PR.ovS = ovS;
  function sessRec(id) { var s0 = id && S.get(id); return s0 && s0.type === "achat" ? s0 : null; }
  function msgText(s0, ref) { if (!s0 || !ref) return ""; var M = s0.msgs || []; for (var i = 0; i < M.length; i++) { var m = M[i]; if (m && ((ref.mid && m.id === ref.mid) || (ref.at && String(m.at || "") === String(ref.at)))) return String(m.text || ""); } return ""; }
  function userMsgs(s0) { return ((s0 && s0.msgs) || []).filter(function (m) { return m && m.role === "user" && !/^\[سامانه/.test(String(m.text || "").trim()); }); }
  /* نقلِ حرفِ خودش: عیناً در پیامِ همین نوبت، یا ساخته از دو پیامِ پیاپیِ خودش (پیامِ پیش + همین) — هر تکه عیناً در یکی */
  PR.herQuote = function (q, s0) {
    var U = userMsgs(s0), last = U[U.length - 1], prev = U[U.length - 2]; q = String(q || "").trim(); if (!last || norm(q).length < 2) return null;
    if (PR.quoteIn(q, last.text)) return { said: String(last.text || ""), parts: 1 };
    if (!prev) return null;
    var W = q.replace(/[«»"“”]/g, " ").split(/\s+/).filter(Boolean);
    for (var k = 1; k < W.length; k++) { var a1 = W.slice(0, k).join(" ").replace(/[\s.…،,—–-]+$/, ""), b1 = W.slice(k).join(" ").replace(/^[\s.…،,—–-]+/, "");
      if (norm(a1).length >= 2 && norm(b1).length >= 2 && ((PR.quoteIn(a1, prev.text) && PR.quoteIn(b1, last.text)) || (PR.quoteIn(a1, last.text) && PR.quoteIn(b1, prev.text)))) return { said: String(prev.text || "") + "\n" + String(last.text || ""), parts: 2 }; }
    return null;
  };
  /* مدلِ ثبت‌شده‌ای که نامش همین است و حرفِ او دست‌کم یک واژهٔ معنادارش را دارد */
  PR.modelNamed = function (name, said) {
    var c = PR.list("models"); if (!c) return null; var n = norm(name);
    return (c.items || []).filter(function (y) { return !y.closed && norm(itemTitle(y)) === n && ovS(itemTitle(y), said) >= 1; })[0] || null;
  };
  /* نامزدِ «همان مدل» برای نامِ تازه (هم‌پوشانیِ محتوا — PR.sameAct؛ عینِ همان نام خودکار است) */
  PR.modelLike = function (name) {
    var c = PR.list("models"); if (!c) return null; var n = norm(name);
    if ((c.items || []).some(function (y) { return norm(itemTitle(y)) === n; })) return null;
    return (c.items || []).filter(function (y) { return !y.closed && PR.sameAct(itemTitle(y), name) >= 1; })[0] || null;
  };
  /* صفحه: «کاربستِ مدل» با نامی که با مدلی در قفسه هم‌پوشان است ⇒ یک کلیک «همان مدل؟» (پیوندِ اجباری نه؛ عینِ نام ⇒ همان، خودکار) */
  PR.modelUseAsk = function (name, u, host) {
    var like = PR.modelLike(name), done = function (nm) { PR.modelUse(nm, u); A.toast("در قفسهٔ مدل‌ها شمرده شد."); A.render(); };
    if (!like || !host) { done(name); return; }
    var old = host.querySelector(".prc-msame"); if (old) old.remove();
    host.appendChild(h("div", { class: "prc-msame row gap wrap", dir: "rtl", role: "group", "aria-label": "همان مدل؟" },
      h("span", { class: "small" }, "همان مدلِ «" + clip(itemTitle(like), 60) + "» در قفسه است؟"),
      h("button", { class: "btn sm prc-msame-yes", type: "button", onclick: function () { done(itemTitle(like)); } }, "بله، همان"),
      h("button", { class: "btn sm ghost prc-msame-no", type: "button", onclick: function () { done(name); } }, "نه، مدلِ دیگری است")));
  };

  /* ---------- «امروز»: یک سطر برای هر کار ---------- */
  function recallKey(title) { var n = norm(title || ""); return n.length >= 4 ? "recall:" + n : ""; }
  function liveTitleOf(pid) { try { var r = A.liveRec && A.liveRec(pid); if (r && r.p) return r.p.title; var p = A.getProb && A.getProb(pid); return p ? p.title : ""; } catch (e) { return ""; } }
  function actOf(it, P0) {
    if (!it) return null; var o = { it: it, keys: [], date: "", text: "", src: "", sess: "", kind: "", rank: 9 };
    var x = it.pid && P0[it.pid];
    if (x && /^📌/.test(String(it.txt || ""))) { var q = x.p; o.kind = "plan"; o.rank = 0; o.rec = q; o.x = x; o.sess = x.s ? x.s.id : ""; o.text = q.text; o.date = /^\d{4}-\d\d-\d\d$/.test(String(q.when || "")) ? q.when : "";
      o.src = msgText(x.s, { at: q.at }); o.keys.push("plan:" + o.sess + ":" + q.id); if (q.fc) o.keys.push("fc:" + q.fc); if (q.prc) o.keys.push("prc:" + q.prc); return o; }
    if (it.prom && it.psess) { var ps = sessRec(it.psess), pr0 = ps && (ps.promises || []).filter(function (z) { return z.id === it.prom; })[0]; if (!pr0) return null;
      o.kind = "prom"; o.rank = 1.5; o.rec = pr0; o.sess = ps.id; o.text = pr0.ask; o.date = pr0.due || ""; o.src = msgText(ps, { at: pr0.at }); o.keys.push("prom:" + ps.id + ":" + pr0.id); return o; }
    if (it.dl) { var r = S.get(it.dl); if (!r) return null; o.kind = "dl"; o.rank = 1; o.rec = r; o.sess = r.sess || (r.src && r.src.sess) || ""; o.text = r.what; o.date = r.date || ""; o.src = r.src ? msgText(sessRec(r.src.sess), { mid: r.src.mid }) : ""; o.keys.push("dl:" + r.id); return o; }
    var sk = Array.isArray(it.sched) ? it.sched : it.sched ? [it.sched] : [];
    if (sk.length === 1 && /^fcast:/.test(sk[0])) { var f = S.get(sk[0].slice(6)); if (!f) return null; o.kind = "fc"; o.rank = 2; o.rec = f; o.text = f.q; o.date = f.due || ""; o.sess = (f.src && f.src.chat) || (f.plan && f.plan.sess) || "";
      o.src = f.src && f.src.quote ? String(f.src.quote) : ""; o.keys.push("fc:" + f.id); if (f.prc) o.keys.push("prc:" + f.prc); if (f.plan) o.keys.push("plan:" + f.plan.sess + ":" + f.plan.id); return o; }
    if (it.prc && !it.dl) { var c = S.get(it.prc); if (!c || c.type !== "practice") return null; o.kind = "prc"; o.rank = 3; o.rec = c; o.keys.push("prc:" + c.id); var rk = recallKey(PR.subjTitle(c.subj)); if (rk) o.keys.push(rk); return o; }
    if (it.sid) { var sc = S.get(it.sid); if (!sc) return null; o.kind = "sched"; o.rank = 3; o.rec = sc; o.keys.push("sched:" + sc.id); if (sc.prc) o.keys.push("prc:" + sc.prc);
      var pc = sc.prc && S.get(sc.prc), tp = sc.topic && S.get(sc.topic), rk2 = recallKey(pc ? PR.subjTitle(pc.subj) : tp ? tp.title : sc.title); if (rk2) o.keys.push(rk2); return o; }
    if (it.k === "review") { var cards = []; try { cards = A.dueCards().filter(function (cd) { return !A.cardInToday || A.cardInToday(cd); }); } catch (e) { }
      var pbs = cards.map(function (cd) { return cd.pb || ""; }); if (!cards.length || pbs.some(function (p) { return !p || p !== pbs[0]; })) return null;
      o.kind = "card"; o.rank = 4; var rk3 = recallKey(liveTitleOf(pbs[0])); if (rk3) o.keys.push(rk3); return o.keys.length ? o : null; }
    if (Array.isArray(it.pids) && it.pids.length === 1) { o.kind = "solve"; o.rank = 5; var rk4 = recallKey(liveTitleOf(it.pids[0]) || it.ptitle); if (rk4) o.keys.push(rk4); return o.keys.length ? o : null; }
    return null;
  }
  PR.actOf = function (it) { var P0 = {}; planList().forEach(function (x) { if (x.p) P0[x.p.id] = x; }); var o = actOf(it, P0); return o ? { kind: o.kind, keys: o.keys, date: o.date } : null; };
  /* همان کار؟ — پیوندِ ثبت‌شده (کلیدِ مشترک) یا برای برنامه/موعد/🎯: همان روزِ موعد و هم‌پوشانیِ محتوا */
  function sameAct23(a, b) {
    if (a.keys.some(function (k) { return b.keys.indexOf(k) >= 0; })) return true;
    var C = { plan: 1, dl: 1, fc: 1, prom: 1 }; if (!C[a.kind] || !C[b.kind] || a.kind === b.kind || !a.date || a.date !== b.date) return false;
    var tt = ovS(a.text, b.text);
    return tt >= 2 || (tt >= 1 && !!a.sess && a.sess === b.sess) || ovS(a.text, b.src) >= 2 || ovS(a.src, b.text) >= 2;
  }
  var ACT_GO = { card: "کارتِ مرور ›", solve: "مرورِ حل ›", fc: "🎯 شد یا نشد؟ ›", prc: "پرونده ›", sched: "برگهٔ سفید ›" };
  function actLabel(a, it) {
    if (a.kind === "plan") return "📌 «" + clip(a.text, 60) + "»"; if (a.kind === "prom") return "↩ «" + clip(a.text, 60) + "»"; if (a.kind === "dl") return "⏰ «" + clip(a.text, 60) + "»"; if (a.kind === "fc") return "🎯 «" + clip(a.text, 60) + "»";
    if (a.kind === "card") return "کارتِ مرورِ همین مسئله"; if (a.kind === "solve") return "مرورِ حلِ همین مسئله"; return clip(String(it.txt || ""), 70);
  }
  /* سطرِ جمعیِ «🎯 n پیش‌بینی به موعد رسیده»: پیش‌بینی‌ای که همان کارِ یک برنامه/موعد است از آن بیرون می‌آید و در سطرِ همان کار می‌نشیند */
  function splitFc(items, P0) {
    var heads = items.map(function (it) { try { var o = actOf(it, P0); return o && (o.kind === "plan" || o.kind === "dl") ? o : null; } catch (e) { return null; } });
    items.forEach(function (it, i) {
      var sk = Array.isArray(it.sched) ? it.sched.filter(function (k) { return /^fcast:/.test(k); }) : []; if (sk.length < 2) return;
      var keep = [];
      sk.forEach(function (k) { var f = S.get(k.slice(6)); if (!f) { keep.push(k); return; }
        var fo = { kind: "fc", rank: 2, rec: f, text: f.q, date: f.due || "", sess: (f.src && f.src.chat) || (f.plan && f.plan.sess) || "", src: f.src && f.src.quote ? String(f.src.quote) : "", keys: ["fc:" + f.id].concat(f.prc ? ["prc:" + f.prc] : []).concat(f.plan ? ["plan:" + f.plan.sess + ":" + f.plan.id] : []) };
        var hi = heads.map(function (h0, j) { return h0 && sameAct23(h0, fo) ? j : -1; }).filter(function (j) { return j >= 0; })[0];
        if (hi == null) { keep.push(k); return; }
        var H = items[hi]; (H.merged = H.merged || []).push({ kind: "fc", txt: "🎯 " + f.q }); H.sub = (H.sub ? H.sub + " · " : "") + "همان کار: " + actLabel(fo, {});
        H.acts = (H.acts || []).concat([{ t: ACT_GO.fc, cls: "dopt act-same", fn: function () { A.go("fcast"); } }]); });
      if (keep.length === sk.length) return;
      it.sched = keep; var fs = keep.map(function (k) { return S.get(k.slice(6)); }).filter(Boolean);
      if (!fs.length) { it._drop23 = true; return; }
      it.txt = fs.length === 1 ? "🎯 «" + clip(fs[0].q, 80) + "» به موعد رسید — شد یا نشد؟" : "🎯 " + fa(fs.length) + " پیش‌بینی به موعد رسیده — شد یا نشد؟";
      it.sub = fs.slice(0, 2).map(function (f) { return f.q; }).join(" · ") + (A.SCHED && A.SCHED.dueText ? " · " + A.SCHED.dueText({ due: fs.map(function (f) { return f.due; }).sort()[0] }, today()) : "");
    });
    return items.filter(function (it) { return !it._drop23; });
  }
  PR.actMerge = function (items) {
    var P0 = {}; planList().forEach(function (x) { if (x.p) P0[x.p.id] = x; });
    items = splitFc(items, P0);
    var acts = items.map(function (it) { try { return actOf(it, P0); } catch (e) { return null; } }), par = items.map(function (_, i) { return i; });
    function root(i) { while (par[i] !== i) i = par[i] = par[par[i]]; return i; }
    for (var i = 0; i < acts.length; i++) for (var j = i + 1; j < acts.length; j++) if (acts[i] && acts[j] && sameAct23(acts[i], acts[j])) par[root(j)] = root(i);
    var groups = {}; acts.forEach(function (a, i) { if (a) (groups[root(i)] = groups[root(i)] || []).push(i); });
    var drop = {};
    Object.keys(groups).forEach(function (g) {
      var G = groups[g]; if (G.length < 2) return;
      G.sort(function (p, q) { return acts[p].rank - acts[q].rank || p - q; });
      var pi = G[0], P = acts[pi], it = items[pi], rest = G.slice(1);
      it.merged = rest.map(function (k) { drop[k] = 1; return { kind: acts[k].kind, txt: items[k].txt, sub: items[k].sub }; });
      it.sub = (it.sub ? it.sub + " · " : "") + "همان کار: " + rest.map(function (k) { return actLabel(acts[k], items[k]); }).join(" · ");
      rest.forEach(function (k) { var a0 = acts[k], g0 = items[k].go; if (!g0 || a0.kind === "dl" || a0.kind === "plan" || (items[k].acts || []).length) return; it.acts = (it.acts || []).concat([{ t: ACT_GO[a0.kind] || "باز کن ›", cls: "dopt act-same", fn: g0 }]); });
      var dls = rest.filter(function (k) { return acts[k].kind === "dl"; }).map(function (k) { return acts[k].rec; });
      if (P.kind === "plan" && dls.length && it.acts) it.acts = it.acts.map(function (b) {
        var v = /plan-done/.test(b.cls || "") ? "done" : /plan-notdone/.test(b.cls || "") ? "notdone" : ""; if (!v) return b; var f0 = b.fn;
        return Object.assign({}, b, { fn: function () { f0.apply(this, arguments); var q = P.rec; if (q && (q.state === "done" || q.state === "notdone")) dls.forEach(function (r) { if (!r.done) { r.done = true; r.doneAt = nowISO(); r.doneBy = { kind: "plan", id: q.id, sess: P.sess, state: q.state }; S.put(r); try { AS.DO.deadline_done && AS.DO.deadline_done({ what: r.id }); } catch (e) { } } }); } }); });
      else if (!it.acts || !it.acts.length) { var gk = rest.filter(function (k) { return items[k].acts && items[k].acts.length; })[0]; if (gk != null) it.acts = items[gk].acts; }
    });
    return items.filter(function (_, i) { return !drop[i]; });
  };

  /* ---------- موعد: «انجام شد» از حرفِ خودش، و فعلِ پرسش از نوعِ کار ---------- */
  var DL_EXAM = /امتحان|آزمون|میان[‌\s]?ترم|کنکور|فاینال|کوییز|کوئیز/, DL_SEND = /تحویل|ارسال|فرستادن|پروژه|گزارش|تکلیف|مقاله|پایان[‌\s]?نامه|پرداخت|قسط/;
  PR.dlVerb = function (what) { var w = String(what || ""); return DL_EXAM.test(w) ? { q: "امتحانش را دادی؟ چطور شد؟", yes: "بله، دادم", done: "داده‌شده" } : DL_SEND.test(w) ? { q: "تحویل دادی؟", yes: "بله، تحویل دادم", done: "تحویل‌شده" } : { q: "انجام شد؟", yes: "بله، انجام شد", done: "انجام‌شده" }; };
  /* گزارشِ انجام به اول‌شخصِ گذشته («گرفتم»، «دادم»، «انجامش دادم»، «رفتم»، «تموم شد») — نه قصد («می‌دم»، «فردا میرم») و نه نفی («ندادم»، «نشد») */
  var DONE_ME = /(?:^|[\s‌،.])(?:گرفتم|دادم|دادمش|انجام[\s‌]*دادم|انجامش[\s‌]*دادم|تحویل[\s‌]*دادم|فرستادم|رفتم|زدم|کردم|خریدم|پرداختم|نوشتم|تموم[\s‌]*شد|تمام[\s‌]*شد|برگزار[\s‌]*شد)(?![آ-ی‌])/;
  var NOT_DONE = /(?:^|[\s‌،.])(?:ن(?:دادم|گرفتم|رفتم|کردم|فرستادم|زدم|نوشتم)|نشد|نتونستم|هنوز\s*(?:نه|ن[آ-ی]+م))(?![آ-ی‌])/;
  PR.dlDoneFromHer = function (s0) {
    var U = userMsgs(s0), m = U[U.length - 1]; if (!m) return []; var t0 = String(m.text || ""), out = [];
    /* دورِ ۲۴ (R7، B24·D13 = B23·D15): گزارش و نفی جمله‌به‌جمله — «میان‌ترم رو ۱۴ گرفتم، سر جلسه قفل نکردم» گزارشِ انجام است؛ «نکردم» ِ جملهٔ دیگر آن را نفی نمی‌کند.
       فقط تکه‌ای که خودش گزارشِ انجام است (بی نفی، نه پرسش) با موعد سنجیده می‌شود */
    var t = String(t0).split(/(?<=[.!؟?\n؛])|[،,]|\s(?:ولی|اما|ولیکن|منتها)\s/).filter(function (x) { return x && !/[؟?]\s*$/.test(x.trim()) && DONE_ME.test(x) && !NOT_DONE.test(x); }).join(" ");
    if (!t) return out;
    /* فقط یک موعد: بیشترین هم‌پوشانی، و اگر دو موعد هم‌تراز بودند (دو امتحان) هیچ‌کدام — صفحه حدس نمی‌زند کدام */
    var C0 = S.all("deadline", function (x) { return x && !x.done && x.date && x.date <= add(today(), 1); }).map(function (r) { return { r: r, n: ovS(r.what, t) }; }).filter(function (y) { return y.n >= (stoks(y.r.what).length <= 2 ? 1 : 2); });
    /* دورِ ۲۴ (بانکِ R24 #142): «میان‌ترم رو ۱۴ گرفتم» برای موعدِ «امتحانِ آمار» — هم‌واژه نیست ولی هم‌نوع است: اگر تکهٔ گزارش از امتحان می‌گوید و فقط یک امتحانِ بازِ رسیده هست، همان */
    if (!C0.length && DL_EXAM.test(t)) { var EX = S.all("deadline", function (x) { return x && !x.done && x.date && x.date <= add(today(), 1) && DL_EXAM.test(String(x.what || "")); }); if (EX.length === 1) C0 = [{ r: EX[0], n: 1 }]; }
    var top = C0.reduce(function (m, y) { return Math.max(m, y.n); }, 0), best = C0.filter(function (y) { return y.n === top; });
    (best.length === 1 ? [best[0].r] : []).forEach(function (r) {
      r.done = true; r.doneAt = nowISO(); r.doneBy = { kind: "her-words", sess: s0 && s0.id, at: String(m.at || ""), quote: clip(t0, 200) }; S.put(r);
      try { AS.DO.deadline_done && AS.DO.deadline_done({ what: r.id }); } catch (e) { } out.push(r.id); });
    return out;
  };

  /* ---------- حدسِ گفت‌وگو: سرانجام از آزمودنِ خودش ---------- */
  var TEST_OK = /✓|✔|(?:^|[\s‌،.!])(?:درسته|درست\s*(?:است|بود|درمیاد|درآمد|درومد)|ثابت(?:ش)?\s*کردم|برقراره|جور\s*درمیاد|درمیاد|تایید\s*شد|تأیید\s*شد)(?![آ-ی‌])/, TEST_NO = /✗|✘|(?:^|[\s‌،.!])(?:غلطه|غلط\s*(?:بود|است|درومد|درآمد)|درست\s*نیست|درست\s*نبود|نمیشه|نمی‌شه|رد\s*شد|جور\s*درنمیاد)(?![آ-ی‌])/;
  var TEST_DID = /(?:امتحان|حساب|چک|وارسی|بررسی)(?:ش)?\s*کردم|شمردم|اندازه\s*گرفتم/, RES_SAID = /\d+\s*(?:شد|میشه|می‌شه|درومد|درآمد|درمیاد|بود)(?![آ-ی‌])/;
  /* دورِ ۲۴ (R7، D24-11): عددِ واژه‌ای پیش از «تا» («چهار تا بسه»، «پنج تا تخته») همان عدد است */
  var WNUM = { "دو": 2, "سه": 3, "چهار": 4, "پنج": 5, "شش": 6, "شیش": 6, "هفت": 7, "هشت": 8, "ده": 10, "یازده": 11, "دوازده": 12, "سیزده": 13, "چهارده": 14, "پانزده": 15, "پونزده": 15, "شانزده": 16, "بیست": 20, "سی": 30, "چهل": 40, "پنجاه": 50, "صد": 100 };
  function wnum(t) { return String(t || "").replace(/(^|[\s‌،(«])(دوازده|یازده|سیزده|چهارده|پانزده|پونزده|شانزده|بیست|پنجاه|چهل|چهار|پنج|شیش|شش|هفت|هشت|سه|دو|ده|سی|صد)(?=\s*(?:تا|عدد|نفر|بار|روز|تخته)(?![آ-ی]))/g, function (_, a, w) { return a + WNUM[w]; }); }
  function exprs(t) { var x = dg(wnum(String(t || ""))).replace(/[\s‌]+/g, ""); return (x.match(/[a-zA-Z0-9]+(?:\([^()]{1,20}\))+(?:[\^²³][0-9a-zA-Z]+)?|[a-zA-Z]\^?[0-9²³]|[0-9]+(?:\.[0-9]+)?/g) || []).filter(function (e, i, X) { return (e.length >= 2 || /[a-zA-Z(]/.test(e)) && X.indexOf(e) === i; }); }
  /* عددهای یک‌رقمی هم — فقط برای حدسِ کمّی («چهار تا بسه») */
  function nums24(t) { return (dg(wnum(String(t || ""))).replace(/٫/g, ".").match(/\d+(?:\.\d+)?/g) || []).map(function (x) { return String(+x); }); }
  /* دورِ ۲۴ (R7، B24·D14 = B23·D23، D24-11): سرانجامِ حدس به حرفِ خودش در چهار شکلِ دیگر هم —
     (۱) همان پیامِ حدس پس از خودِ حدس آزمودش و رد شد («۲۰ مرغ و ۱۵ خرگوش … = ۱۰۰. زیاد شد، ما ۹۴ می‌خوایم»)؛
     (۲) حدسِ بی عدد («فکر کنم کافیه») و پیامِ بلافاصله بعدش آزمونِ خودش است («امتحان کردم: … از معیارم بیشتره»)؛
     (۳) دلیلِ خودش که به همان عدد می‌رسد («چون … پس … ۵۰² = ۲۵۰۰») ⇒ تأیید؛
     (۴) حدسِ کمّیِ تک‌عدد («چهار تا بسه») و نتیجه‌گیریِ خودش با عددِ دیگر و نشانهٔ رد («از یه تختهٔ ۲۴۰ درنمیاد … پس … پنج تا تخته») ⇒ رد.
     صفحه حکمِ بی‌شاهد نمی‌دهد: هر حکم نقلِ همان جمله‌اش را در g.resFrom دارد. */
  var OVER24 = /(?:^|[\s‌،.!])(?:زیاد|کم|بیشتر|کمتر)\s*(?:شد|اومد|آمد|درومد|درآمد)(?![آ-ی‌])|از\s*معیار\S*\s*(?:بیشتر|بالاتر|کمتر|پایین)|(?:کافی|بس)\s*نیست|(?:^|[\s‌،.!])(?:درنمیاد|درنمی‌آید|نمی‌خونه|نمیخونه)(?![آ-ی‌])/;
  var DERIV24 = /(?:^|[\s‌،.!])چون\s[\s\S]*?(?:(?:^|[\s‌،.!])(?:پس|بنابراین|میشه|می‌شه)(?![آ-ی‌])|=)/;
  var CONTRA24 = /^\s*(?:ولی|اما|نه[\s،,!])/, RESME24 = /[0-9۰-۹]+\s*(?:از\s*[0-9۰-۹]+\s*)?(?:گرفتم|شد|درومد|درآمد|آوردم)(?![آ-ی‌])/;
  var CONCL24 = /(?:^|[\s‌،.!])(?:پس|بنابراین|در\s*نتیجه)\s+([^.!؟?\n]{3,})$/;
  /* بخشی از پیامِ حدس که پس از خودِ حدس آمد */
  function guessTail(t, g) { var T = String(t || ""), q = String(g || "").trim(); if (!q) return ""; var k = T.indexOf(q); if (k >= 0) return T.slice(k + q.length);
    var n = nums24(q); if (!n.length) return ""; var re = new RegExp("(?:^|[^0-9])" + n[n.length - 1].replace(".", "\\.") + "(?![0-9])"), D = dg(wnum(T)), mm = re.exec(D); return mm ? D.slice(mm.index + mm[0].length) : ""; }
  /* دورِ ۲۵ (P7، C22-11 STILL: s21 «رخ اصلاً بی‌فایده نبود!»، s28 «فهرست کردم … یعنی ۱/۳!» و «… ⇒ ۱۳/۲۷»؛ A23-8: pwA1 «… ✓ … ✓» و «پس حدسم درسته»، pA2 «به یک میلیون برنمی‌گرده»):
     ریشه — سرانجام فقط از «عددِ حدس + نشانهٔ آزمون» خوانده می‌شد؛ پنج شکلِ دیگرِ حرفِ خودش هم سرانجام است (هر کدام با نقلِ همان جمله در g.resFrom):
     (۵) حدسِ مقداری که در همان پیام از آزمونِ خودش درآمد («فهرست کردم … ⇒ ۱۳/۲۷») ⇒ تأیید؛ (۱ب) همان پیام پس از حدس نمونه‌هایش را با «✓» آزمود ⇒ تأیید؛
     (۶) جملهٔ بعدیِ خودش همان گزارهٔ حدس را نفی می‌کند (فعلِ همان حدس با «ن»: «بی‌فایده‌ست» ⇐ «بی‌فایده نبود»، «برمی‌گرده» ⇐ «برنمی‌گرده») ⇒ رد؛
     (۷) حدسِ کسری و آزمونِ خودش با کسرِ دیگر («۱/۲» ⇐ «فهرست کردم … یعنی ۱/۳») ⇒ رد؛ (۸) داوریِ صریحِ خودش («پس حدسم درسته»، «حدسم غلط بود») ⇒ همان.
     حدسی که فقط دلیلِ همان پیام را دارد («هر پله یه خونه‌ی نوار … پس …») سرانجام نمی‌گیرد؛ دلیلش در g.ground می‌ماند تا 📜 «هنوز آزموده نشده — دلیلِ خودت: …» بگوید. */
  var TEST_DID25 = new RegExp(TEST_DID.source + "|فهرست(?:ش)?\\s*کردم|شمارش\\s*کردم|(?:همه|تک[\\s‌]*تک)\\S*\\s*(?:رو\\s*|را\\s*)?نوشتم");
  var LINK25 = /⇒|=>|(?:^|[\s‌،.!…])(?:پس|یعنی|بنابراین|در\s*نتیجه)(?![آ-ی‌])/;
  var GV_ME = "حدس(?:م|‌ام|ِ\\s*من|ِ\\s*(?:اول|قبلی)(?:م|‌ام)?)";
  var GV_OK = new RegExp(GV_ME + "(?:\\s+[^\\s.!؟?،]+){0,2}?\\s+(?:درست(?:ه|\\s*(?:بود|است|درومد|درآمد|دراومد|از\\s*آب\\s*در(?:ومد|آمد|اومد)))|ثابت\\s*شد|تأیید\\s*شد|تایید\\s*شد)(?![آ-ی‌])");
  var GV_NO = new RegExp(GV_ME + "(?:\\s+[^\\s.!؟?،]+){0,2}?\\s+(?:غلط(?:ه|\\s*(?:بود|است|درومد|درآمد|دراومد))|اشتباه(?:ه|\\s*بود)|درست\\s*(?:نبود|نیست)|رد\\s*شد)(?![آ-ی‌])");
  var ACT25 = /(?:^|[\s‌،.!:])(?:چیدم|گذاشتم|ساختم|کشیدم|وزن\s*کردم|آزمودم|پر\s*کردم|ریختم|بریدم)(?![آ-ی‌])/, RES25 = /(\d+(?:\.\d+)?)\s*(?:تا|عدد|نفر|بار)?\s*(?:شد|درومد|درآمد|دراومد|بود|جا\s*شد|کافی\s*بود)(?![آ-ی‌])/;
  function fracs25(t) { return (dg(wnum(String(t || ""))).replace(/\s*\/\s*/g, "/").match(/\d+\/\d+/g) || []).filter(function (x, i, X) { return X.indexOf(x) === i; }); }
  function words25(t) { return norm(t).split(" ").filter(Boolean); }
  var NEGCOP = { "ست": 1, "است": 1, "هست": 1, "بود": 1, "هستش": 1 }, NEGC2 = { "نیست": 1, "نبود": 1, "نبوده": 1, "نیستش": 1 }, HASNEG25 = /(?:^| )(?:ن(?:می|بود|یست|داره|دارم|شد|کرد)[^ ]*|برنمی|درنمی|نه)(?: |$)/;
  /* گزارهٔ حدس در جملهٔ بعدی نفی شد؟ — همان واژهٔ پیش از فعلِ ربط، یا همان فعلِ «می…» با «ن» */
  function negOf25(gt, sent) {
    var G = words25(gt), W = words25(sent); if (!G.length || !W.length || HASNEG25.test(G.join(" "))) return false;
    for (var i = 0; i < G.length; i++) {
      var w = G[i], nx = G[i + 1] || "";
      if (NEGCOP[nx] && w.length >= 3) { for (var j = 0; j + 1 < W.length; j++) if (W[j] === w && NEGC2[W[j + 1]]) return true; }
      /* «مشکل از کم‌خوابیه» ⇐ «کم‌خوابی نبود»: «ـه» ِ ربطیِ گفتاری */
      if (w.length >= 4 && /ه$/.test(w)) { var b0 = w.slice(0, -1); for (var j2 = 0; j2 + 1 < W.length; j2++) if (W[j2] === b0 && NEGC2[W[j2 + 1]]) return true; }
      var m = /^(بر|در|ور|وا)?می$/.exec(w);
      if (m && nx.length >= 2) { var ng = (m[1] || "") + "نمی"; for (var k = 0; k + 1 < W.length; k++) if (W[k] === ng && W[k + 1] === nx) return true; }
      var m2 = /^(بر|در|ور|وا)?می([آ-ی]{2,})$/.exec(w);
      if (m2) { var n2 = (m2[1] || "") + "نمی" + m2[2]; if (W.indexOf(n2) >= 0) return true; }
      var m3 = /^(بر|در|ور|وا)([آ-ی]{3,})$/.exec(w);   // «برگرده» ⇐ «برنمی‌گرده» / «برنگرده»
      if (m3) { if (W.indexOf(m3[1] + "ن" + m3[2]) >= 0) return true; for (var q = 0; q + 1 < W.length; q++) if (W[q] === m3[1] + "نمی" && W[q + 1] === m3[2]) return true; }
    }
    return false;
  }
  PR.guessOwnTest = function (s0) {
    var C = (s0 && s0.coach) || {}, G = (C.guesses || []).filter(function (g) { return g && g.text && !g.res && !g.withdrawn && !g.resRecheck; }); if (!G.length) return false;
    var U = userMsgs(s0), dirty = false, ALLG = (C.guesses || []).filter(function (g) { return g && g.text && g.at; });
    function put(g, res, t, m) { g.res = res; g.resAt = nowISO(); g.resBy = "her-test"; g.resFrom = clip(t, 160); g.resKey = String(m.at); dirty = true; }
    G.forEach(function (g) {
      var ge = exprs(g.text), gn = nums24(g.text);
      /* (۱) همان پیام: پس از حدس، حسابِ خودش و نشانهٔ رد */
      var own = U.filter(function (m) { return m.at && g.at && String(m.at) === String(g.at); })[0];
      if (own && gn.length) { var tail = guessTail(own.text, g.text), tn = nums24(tail);
        /* حسابِ خودش پس از حدس، یا (حدسِ تک‌عدد) عددِ دیگری که جایش گذاشت — با نشانهٔ رد */
        if (tail && (TEST_NO.test(tail) || OVER24.test(tail)) && (/[=×÷+*\/]|میشه|می‌شه/.test(tail) || (gn.length === 1 && tn.length && tn.indexOf(gn[0]) < 0))) { put(g, "refuted", tail.replace(/^[\s.،,…]+/, ""), own); return; } }
      if (own) { var oT = String(own.text || ""), kq = oT.indexOf(String(g.text).trim()), head25 = kq >= 0 ? oT.slice(0, kq) : "", tail25 = kq >= 0 ? oT.slice(kq + String(g.text).trim().length) : guessTail(oT, g.text), pre25 = kq >= 0 ? oT.slice(0, kq + String(g.text).trim().length) : "";
        var bad25 = TEST_NO.test(tail25) || OVER24.test(tail25), ask25 = /[؟?]/.test(tail25);
        /* (۱ب) نمونه‌های خودش پس از حدس، هر کدام با «✓» */
        if (tail25 && !bad25 && !ask25 && /[✓✔]/.test(tail25) && /[=×]/.test(tail25)) { put(g, "confirmed", tail25.replace(/^[\s.،,…]+/, ""), own); return; }
        /* (۵) مقدارِ حدس از آزمونِ خودش در همان پیام درآمد */
        if (pre25 && (gn.length || fracs25(g.text).length) && !bad25 && !ask25) { var dm = TEST_DID25.exec(pre25); if (dm && LINK25.test(pre25.slice(dm.index))) { put(g, "confirmed", pre25, own); return; } }
        /* فقط دلیلِ همان پیام («… پس …») — سرانجام نیست، ولی دلیلش گم نمی‌شود */
        if (!g.ground && kq >= 0 && toks(head25).length >= 4 && (LINK25.test(head25.slice(-12)) || /^\s*(?:پس|یعنی|بنابراین)(?![آ-ی‌])/.test(String(g.text)))) { g.ground = { from: clip(head25.replace(/[\s،,:]*(?:پس|یعنی|بنابراین)?\s*$/, ""), 160), key: String(own.at) }; dirty = true; } }
      var later = U.filter(function (m) { return m.at && g.at && String(m.at) > String(g.at); });
      later.forEach(function (m, idx) { if (g.res || /[؟?]\s*$/.test(String(m.text || "").trim())) return;
        var t = String(m.text || ""), me = exprs(t), hit = ge.filter(function (e) { return me.indexOf(e) >= 0; }).length, did = TEST_DID.test(t), ok = TEST_OK.test(t), no = TEST_NO.test(t) || OVER24.test(t), res = "";
        if (ge.length && hit === ge.length) { if (TEST_NO.test(t)) res = "refuted"; else if (ok || did || DERIV24.test(t)) res = "confirmed"; }   /* «۱۲ نمیشه، ۱۴ درمیاد» ⇒ رد: نشانهٔ رد بر «درمیاد» ِ مقدارِ دیگر مقدم است؛ (۳) دلیلِ خودش */
        else if (ge.length && !hit && did && ge.length === 1 && /^\d/.test(ge[0]) && me.some(function (e) { return /^\d/.test(e); }) && (/^\s*نه[\s،,]/.test(t) || RES_SAID.test(dg(t)))) res = "refuted";   /* «نه، امتحان کردم ۱۵ شد» برای حدسِ «۱۲» (بانکِ R23 #173) */
        else if (!ge.length && gn.length === 1 && no) { var cs = t.split(/(?<=[.!])\s+/).map(function (x) { return x.replace(/[.!\s]+$/, ""); }).filter(function (x) { return CONCL24.test(x); }).pop() || "", cm = CONCL24.exec(cs), cn = cm ? nums24(cm[1]) : []; if (cn.length && cn.indexOf(gn[0]) < 0 && nums24(t).indexOf(gn[0]) < 0) res = "refuted"; }   /* (۴) */
        else if (!ge.length && !gn.length && idx === 0 && did) { if (no) res = "refuted"; else if (ok) res = "confirmed"; }   /* (۲) فقط پیامِ بلافاصله بعد */
        else if (!ge.length && !gn.length && idx === 0 && CONTRA24.test(t) && RESME24.test(t)) res = "refuted";   /* (۲) «ولی ۱۹ از ۲۰ گرفتم وقتی دو بار خوندم» — شاهدِ اندازه‌گرفتهٔ خودش در برابرِ حدس */
        /* دورِ ۲۵ — شکل‌های (۶)، (۷)، (۸) */
        var from25 = "";
        if (!res) { var S25 = sentsOf25(t).filter(function (x) { return !/[؟?]\s*$/.test(x) && !/(?:^|[\s،])(?:اگه|اگر|شاید|کاش)(?![آ-ی])/.test(x); });
          /* (۸) داوریِ صریحِ خودش دربارهٔ «حدسم» — آخرین حدسِ پیش از این پیام (و حدس‌های هم‌واژه‌اش) */
          var lastG = ALLG.filter(function (y) { return String(y.at) < String(m.at); }).sort(function (a, b) { return String(a.at).localeCompare(String(b.at)); }).pop();
          if (lastG && (lastG === g || ovS(lastG.text, g.text) >= 2)) S25.forEach(function (x) { if (res) return; var d0 = dg(x); if (GV_NO.test(d0)) { res = "refuted"; from25 = x; } else if (GV_OK.test(d0)) { res = "confirmed"; from25 = x; } });
          /* (۷) حدسِ کسری و آزمونِ خودش با کسرِ دیگر (یا همان) */
          var Fg = fracs25(g.text);
          if (!res && Fg.length === 1 && TEST_DID25.test(t)) { var cf = /(?:یعنی|پس|میشه|می‌شه|=|⇒)\s*(\d+\/\d+)/.exec(dg(wnum(t)).replace(/\s*\/\s*/g, "/")), Ft = fracs25(t);
            if (cf && cf[1] !== Fg[0]) res = "refuted"; else if (cf && cf[1] === Fg[0] && Ft.length === 1) res = "confirmed"; }
          /* (۹) حدسِ تک‌عدد («با ۵ تا کاشی پر میشه») و کارِ خودش با نتیجه («چیدم، با ۵ تا شد») ⇒ همان عدد: تأیید؛ عددِ دیگر: رد (بانکِ R25 #222) */
          if (!res && !ge.length && gn.length === 1 && (TEST_DID25.test(t) || ACT25.test(t)) && !CONTRA24.test(t)) { var d9 = dg(wnum(t)).replace(/٫/g, "."), rm = RES25.exec(d9), mn9 = nums24(t);
            if (rm && String(+rm[1]) === gn[0] && !no) res = "confirmed"; else if (rm && String(+rm[1]) !== gn[0] && mn9.indexOf(gn[0]) < 0) res = "refuted"; }
          /* (۶) همان گزاره، نفی‌شده — با دست‌کم دو واژهٔ مشترک */
          if (!res) S25.forEach(function (x) { if (res) return; if (ovS(g.text, x) >= 2 && negOf25(g.text, x)) { res = "refuted"; from25 = x; } }); }
        if (res) put(g, res, from25 || t, m); });
    });
    return dirty;
  };

  /* ---------- خواستهٔ عقب‌افتادهٔ خودش («آره جدا ثبتش کن ولی بعداً») ⇒ قول ---------- */
  var LATER_ME = /(?:^|[\s‌،.])(?:بعداً|بعدا|یه\s*وقتِ?\s*دیگه|یه\s*روزِ?\s*دیگه|سرِ?\s*فرصت|فعلاً\s*نه|فعلا\s*نه|فردا|پس[‌\s]?فردا|هفته[‌\s]?(?:ی|ٔ)?\s*(?:بعد|دیگه)|(?:یک|دو|سه)?\s*شنبه|پنج[‌\s]?شنبه|چهارشنبه|جمعه)(?![آ-ی‌])/;
  var ASK_ME = /(?:ثبت|یادداشت|اضافه|ذخیره|نگه|درست|حساب|بررسی|پیگیری)(?:ش|اش|شون)?\s*(?:کن|بکن|کنیم|دار)(?![آ-ی‌])|(?:بنویس|بساز|نشون\s*بده|بفرست)(?:ش|اش)?(?![آ-ی‌])|یاد(?:م|مون)\s*(?:بنداز|بیار)|یادآوری\s*کن/;
  /* دورِ ۲۴ (R7، B24·D9): قول فقط وقتی همان نوبت خواسته را برنیاورد — کنشِ نوشتنی (list_add، chat_solved، live_new، …) یعنی همین حالا انجام شد؛
     و «پاسخ به …» (پرسشِ دستیار) فقط وقتی پیامش واقعاً پاسخ است («آره/نه/باشه …»)، وگرنه متنِ قول همان خواستهٔ خودش است */
  var NOT_FULFIL = /^(?:coach_state|go|ask|steps|promise_done|plan_done|deadline_done|highlight|register|tour_\w+)$/;
  PR.turnFulfilled = function (acts) { return (acts || []).some(function (x) { var d = String((x && x.do) || x || ""); return !!d && !NOT_FULFIL.test(d); }); };
  PR.herLater = function (s0, acts) {
    var U = userMsgs(s0), m = U[U.length - 1]; if (!s0 || !m) return null; var sents = String(m.text || "").split(/[.!؟?\n]+/);
    if (acts && PR.turnFulfilled(acts)) return null;
    var sent = sents.filter(function (x) { return ASK_ME.test(x) && LATER_ME.test(x) && !/^\s*نه[\s،]/.test(x); })[0]; if (!sent) return null;
    var P = s0.promises = s0.promises || [], ask = clip(sent.trim(), 200);
    if (P.some(function (x) { return !x.done && (x.at === String(m.at || "") || norm(x.ask) === norm(ask)); })) return null;
    var M = s0.msgs || [], ai = null; for (var i = M.indexOf(m) - 1; i >= 0; i--) if (M[i] && M[i].role === "ai") { ai = M[i]; break; }
    var ctx = ai && /^\s*(?:آره|آری|بله|نه|باشه|اوکی|حتماً|حتما|چشم)(?![آ-ی])/.test(String(m.text || "")) ? (String(ai.text || "").split(/(?:[.!؟?])\s+/).filter(function (x) { return x.trim(); }).pop() || "") : "";
    var due = PR.parseWhen(sent); if (due && due < today()) due = "";
    var pr = { id: "pr" + (P.length + 1), ask: ask, ctx: clip(ctx, 200), at: String(m.at || ""), d: today(), due: due || "", done: false, by: "user" }; P.push(pr); return pr;
  };
  PR.openUserPromises = function (exceptSess) {
    var out = []; S.all("achat").forEach(function (s0) { if (exceptSess && s0.id === exceptSess) return; (s0.promises || []).forEach(function (pr) { if (pr && !pr.done && pr.by === "user") out.push({ s: s0, pr: pr }); }); });
    return out.sort(function (a, b) { return String(a.pr.at).localeCompare(String(b.pr.at)); });
  };
  if (AS && AS.promptHooks) AS.promptHooks.push(function (s0) {
    var L = PR.openUserPromises(s0 && s0.id).slice(-3); if (!L.length) return "";
    return "# خواسته‌های عقب‌افتادهٔ خودش از سشن‌های دیگر (قول؛ زمینه، نه پرسش)\n" + L.map(function (y) { return "- زمینه (نه پرسشِ دوم): " + fdate(y.pr.d) + " در سشنِ «" + clip(y.s.title || y.s.pinned || "گفت‌وگو", 40) + "» خودش خواست «" + clip(y.pr.ask, 120).replace(/[«»]/g, "") + "»" + (y.pr.ctx ? " (پاسخ به «" + clip(y.pr.ctx, 90).replace(/[«»]/g, "") + "»)" : "") + " — برای بعد؛ گم نشود: به وقتش همان را پیشنهاد بده یا انجام بده (با کنشِ همان کار)؛ پس از انجام یا اگر خودش گفت نمی‌خواهد، در همان سشن {\"do\":\"promise_done\",\"id\":\"" + y.pr.id + "\"}."; }).join("\n");
  });

  /* ---------- مسئله‌های تازهٔ بازنگری پیش از رکوردِ مسئلهٔ گفت‌وگو (D23-40) ---------- */
  /* دورِ ۲۴ (R7، D24-4): همان تصمیم یک جا — دروازهٔ chat_invent ِ a38 (اجرا و پیش‌سنجیِ پاسخ) از همین دو تابع می‌پرسد، پس صفحه به مدل «ثبت نمی‌شود» نمی‌گوید وقتی خودش نگهش می‌دارد */
  PR.backPendOk = function (s0, a) { var C = (s0 && s0.coach) || {}, bound = AS && AS.boundLive ? AS.boundLive(s0) : null; return !!s0 && C.ph === "b" && !(bound && bound.pid) && String((a && a.statement) || "").trim().length >= 10; };
  PR.backPendAdd = function (s0, a) {
    var B = s0.backPend = s0.backPend || [], st = clip(a.statement, 600);
    if (!B.some(function (x) { return norm(x.t) === norm(st); })) B.push({ t: st, title: clip((a && a.title) || st, 80), at: nowISO() });
    try { S.put(s0); } catch (e) { }
    return { info: "🔭 نگه داشتم: «" + clip((a && a.title) || st, 60) + "» — با ثبتِ همین مسئله در بازنگری‌اش می‌ماند و روی نردبان به «امروز» برمی‌گردد (مسئلهٔ زنده ساخته نشد؛ هر وقت خواستی «باز کن»)." };
  };
  if (AS && AS.DO && typeof AS.DO.chat_invent === "function" && !AS.DO.chat_invent._r23) {
    var rawInv23 = AS.DO.chat_invent;
    AS.DO.chat_invent = function (a) {
      var s0 = AS._turnSession, C = (s0 && s0.coach) || {}, r = rawInv23.apply(this, arguments);
      try {
        var refused = r && typeof r === "object" && /ثبت نکردم، چون نخواسته بودی/.test(String(r.info || ""));
        var bound = AS.boundLive ? AS.boundLive(s0) : null;
        if (refused && PR.backPendOk(s0, a)) return PR.backPendAdd(s0, a);   // مسیرِ دورِ ۲۳ (اکنون دروازهٔ a38 همین را پیش‌تر می‌گیرد)
      } catch (e) { console.warn(e); }
      return r;
    };
    Object.keys(rawInv23).forEach(function (k) { AS.DO.chat_invent[k] = rawInv23[k]; }); AS.DO.chat_invent._r23 = true;
  }
  if (AS && AS.DO && typeof AS.DO.chat_solved === "function" && !AS.DO.chat_solved._r23) {
    var rawSol23 = AS.DO.chat_solved;
    AS.DO.chat_solved = function () {
      var r = rawSol23.apply(this, arguments);
      try { var s0 = AS._turnSession, B = s0 && s0.backPend;
        if (B && B.length && A.liveKeepBackNew) { var bl = AS.boundLive ? AS.boundLive(s0) : null, pid = (bl && bl.pid) || s0.lprob || "";
          if (pid && A.liveRec && A.liveRec(pid)) { var kept = B.splice(0, B.length).map(function (x) { var o = A.liveKeepBackNew(pid, x.t, x.title, s0.id); return o && o.info ? x.title : ""; }).filter(Boolean);
            S.put(s0); if (kept.length && typeof r === "string") r += " · مسئله‌های تازه‌ات در بازنگریِ همین مسئله ماندند: «" + kept.map(function (t) { return clip(t, 40); }).join("»، «") + "» — روی نردبان به «امروز» برمی‌گردند."; } } } catch (e) { console.warn(e); }
      return r;
    };
    Object.keys(rawSol23).forEach(function (k) { AS.DO.chat_solved[k] = rawSol23[k]; }); AS.DO.chat_solved._r23 = true;
  }

  /* ---------- پیش‌بینیِ خودش (A23-15، بانکِ R23 #168/#179): پیش‌بینی ثبت می‌شود، نه حدس؛ با موعد ⇒ 🎯 ِ تاریخ‌دار (یک رکورد) ----------
     موعد از حرفِ خودش («تا جمعه»)، وگرنه روزِ برنامهٔ بازِ همین سشن که پیش‌بینی درباره‌اش است (پیوندِ f.plan — «انجام شد» ِ برنامه سرانجامِ پیش‌بینی نیست). */
  var PRED_EXPL = /پیش[‌\s]?بینی(?:م|ام)?\s*(?:می[‌\s]?کنم|اینه|این\s*است|:)|پیش[‌\s]?بینیم(?![آ-ی])/;
  /* دورِ ۲۵ (P7، A25-14/A25-15 oA1): سه ریشه —
     (۱) جملهٔ داوری («پس پیش‌بینیم غلط بود»، «اون پیش‌بینیِ ۴۰ درصدیم درست درومد») پیش‌بینیِ تازه نیست: سرانجامِ همان پیش‌بینیِ بازِ خودش است (PR.predVerdict)؛
     (۲) موعد از حرفِ خودِ او در همان جمله («تا جمعه …») حتی وقتی نقلِ مدل آن را انداخته («مدیرم … ترفیع می‌ده») — پیش‌تر موعد به روزِ برنامهٔ بی‌ربطِ همان سشن می‌افتاد؛
     (۳) روزِ برنامه فقط وقتی موعدِ پیش‌بینی است که برنامه از همان پیام باشد یا واژهٔ مشترک با آن داشته باشد («پیش‌بینی درباره‌اش است»). */
  /* دورِ ۲۸ (forecast R4، C91؛ C28-18، B28·D3، D28-8): پنجره تا ۸ واژه («پیش‌بینیم که ۸۰ درصد مطمئن بودم غلط درومد»، «پیش‌بینیم ۴ از ۴ با ۹۰ درصد بود، پس غلط درومد»)؛
     «شد/نشد» ِ پیش از عدد («پیش‌بینیم ۱ بود، شد ۳») گزارشِ مقدار است، نه داوری — آن را خوانندهٔ عددیِ PR.verdict28 می‌سنجد */
  var PV_NO = /پیش[‌\s]?بینی[^\s.!؟?،]*(?:\s+[^\s.!؟?]+){0,8}?\s+(?:(?:غلط|اشتباه|نادرست)\s*(?:بود|درومد|درآمد|دراومد|از\s*آب\s*در(?:ومد|آمد|اومد)|شد)|درست\s*(?:نبود|درنیومد|درنیامد|نشد)|نشد(?!\s*[0-9۰-۹])|رد\s*شد)ه?(?![آ-ی‌])/;
  var PV_OK = /پیش[‌\s]?بینی[^\s.!؟?،]*(?:\s+[^\s.!؟?]+){0,8}?\s+(?:درست\s*(?:بود|درومد|درآمد|دراومد|شد|از\s*آب\s*در(?:ومد|آمد|اومد))|شد(?!\s*[0-9۰-۹])|تأیید\s*شد|تایید\s*شد)ه?(?![آ-ی‌])/;
  var CONF25 = /(\d{1,3})\s*(?:٪|%|درصد)\s*(?:مطمئنم|مطمئن[‌\s]*ام|احتمال\s*(?:میدم|می[‌\s]?دم|داره)|اطمینان\s*دارم)/;
  function sentsOf25(t) { return String(t || "").split(/(?<=[.!؟?\n])\s*|\s+—\s+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  /* جملهٔ داوریِ خودش: { ok, sent } — پرسش، شرط («اگه …») و آرزو نه */
  /* دورِ ۲۶ (Q8؛ A26-28 aA4، D26-14 pwD1، B26·D32 oB1): داوری با ارجاع — «درست همان که پیش‌بینی کرده بودم»، «برخلافِ پیش‌بینیم» —
     و ارجاعِ بی داوری («از پیش‌بینیم خیلی بیشتر»، «گفته بودم … شد ۴»): پیش‌بینیِ تازه نیست؛ صفحه یک بار می‌پرسد «شد یا نشد؟» */
  var PV_SAME26 = /(?:همان|همون|همونی|همانی|همون[‌\s]?طور|همان[‌\s]?طور|مثلِ?|طبقِ?|عینِ?)\s*(?:که\s*|چیزی\s*که\s*|اون\s*چیزی\s*که\s*)?(?:من\s*)?پیش[‌\s]?بینی/, PV_AGAINST26 = /(?:برخلافِ?|خلافِ?)\s*(?:اون\s*)?پیش[‌\s]?بینی/;
  var PV_REF26 = /(?:از|با)\s*(?:اون\s*)?پیش[‌\s]?بینی[^\s.!؟?،]*\s*(?:خیلی\s*|کمی\s*|یه\s*کم\s*|یک\s*کم\s*)?(?:بیشتر|کمتر|بهتر|بدتر|بالاتر|پایین[‌\s]?تر|زودتر|دیرتر|فرق|فاصله)|پیش[‌\s]?بینی\s*(?:کرده\s*بودم|کرده\s*بودیم)|پیش[‌\s]?بینی[^\s.!؟?،]*\s*(?:این\s*)?بود(?![آ-ی])/;
  var PV_SAID26 = /(?:همون|همان)[‌\s]?طور(?:ی)?\s*که\s*(?:گفته\s*بودم|گفتم|فکر\s*می[‌\s]?کردم|حدس\s*زده\s*بودم)/, HEDGE26 = /(?:^|[\s،])(?:داره|دارن|دارد|فکر\s*کنم|فکر\s*می[‌\s]?کنم|انگار|شاید|ظاهراً|ظاهرا|احتمالاً|احتمالا)(?![آ-ی])/;
  PR.predVerdictIn = function (t) {
    var hit = null; sentsOf25(t).forEach(function (x) { if (hit || /[؟?]\s*$/.test(x) || /(?:^|[\s،])(?:اگه|اگر|شاید|کاش)(?![آ-ی])/.test(x)) return; var d = dg(x);
      if (PV_NO.test(d) || PV_AGAINST26.test(d)) hit = { ok: false, sent: x }; else if (PV_OK.test(d)) hit = { ok: true, sent: x };
      else if (PV_SAME26.test(d)) hit = { ok: !/(?:^|[\s‌])(?:نشد|نبود|نیست|نه)(?![آ-ی])/.test(d), sent: x };
      /* «سفارش رسید، همون‌طور که گفته بودم» — بی واژهٔ «پیش‌بینی»: داوریِ ضعیف (فقط برای پیش‌بینیِ بازِ هم‌واژه؛ PR.predVerdict) */
      else if (PV_SAID26.test(d) && !HEDGE26.test(d)) hit = { ok: !/(?:^|[\s‌])(?:نشد|نبود|نیست)(?![آ-ی])/.test(d), sent: x, weak: true }; });
    return hit;
  };
  /* جمله‌ای که به پیش‌بینیِ پیشینش برمی‌گردد ولی داوری‌اش روشن نیست */
  PR.predRefIn = function (t) {
    var hit = null; sentsOf25(t).forEach(function (x) { if (hit || /[؟?]\s*$/.test(x) || /(?:^|[\s،])(?:اگه|اگر|شاید|کاش)(?![آ-ی])/.test(x) || PR.predVerdictIn(x)) return; var d = dg(x); if (PV_REF26.test(d) || PV_SAID26.test(d) || /(?:اون|آن|همون|همان)\s*(?:چیزی\s*)?که\s*گفته\s*بودم/.test(d)) hit = { sent: x }; });
    return hit;
  };
  /* «هفتاد درصد»، «شصت و پنج درصد» ⇒ رقم (فقط پیش از «درصد/٪») */
  var TENS25 = { "ده": 10, "بیست": 20, "سی": 30, "چهل": 40, "پنجاه": 50, "شصت": 60, "هفتاد": 70, "هشتاد": 80, "نود": 90, "صد": 100 }, ONES25 = { "یک": 1, "دو": 2, "سه": 3, "چهار": 4, "پنج": 5, "شش": 6, "هفت": 7, "هشت": 8, "نه": 9 };
  /* دورِ ۲۶ C37: «پنجاه‌پنجاه» عددی به واژه است (۵۰٪)؛ «احتمالاً/فکر کنم» عدد نمی‌سازد — صفحه یک بار عددش را می‌پرسد (PR.bookPred) */
  var FIFTY37 = /پنجاه[‌\s\-]*(?:،\s*)?پنجاه(?!\s*(?:٪|%|درصد))|فیفتی[‌\s\-]*فیفتی/g, VAGUE37 = /(?:^|[\s،])(?:احتمالاً|احتمالا|به\s*احتمال\s*زیاد|احتمالش\s*زیاده|فکر\s*کنم|فکر\s*می[‌\s]?کنم|به\s*نظرم|بعیده|بعید\s*(?:نیست|می[‌\s]?دونم))(?![آ-ی])/;
  function wpct(t) { return dg(String(t || "")).replace(FIFTY37, " با احتمال 50 درصد ").replace(/(ده|بیست|سی|چهل|پنجاه|شصت|هفتاد|هشتاد|نود|صد)(?:\s*و\s*(یک|دو|سه|چهار|پنج|شش|هفت|هشت|نه))?(?=\s*(?:٪|%|درصد))/g, function (_, a, b) { return String(TENS25[a] + (b ? ONES25[b] : 0)); }); }
  function pctOf(t) { var m = /(\d{1,3})\s*(?:٪|%|درصد)/.exec(wpct(t)); return m && +m[1] <= 100 ? +m[1] : null; }
  PR.pctOf25 = pctOf;
  function predPct(x) { if (x.p != null) return x.p; return confPct26(x.text); }
  /* پیش‌بینیِ داوری‌نشدهٔ همین گفت‌وگو که این حرف درباره‌اش است: اطمینانِ گفته‌شده = اطمینانِ همان پیش‌بینی؛ وگرنه واژهٔ مشترک (یکتا)؛ وگرنه تنها پیش‌بینیِ باز.
     noFc ⇒ فقط پیش‌بینی‌ای که هنوز 🎯 ندارد، و فقط با همان اطمینان */
  PR.predFor = function (s0, said, pc, noFc) {
    var PD = (((s0 && s0.coach) || {}).preds || []).filter(function (x) { return x && x.text && !x.out && (!noFc || !x.fc); }); if (!PD.length) return null;
    if (pc != null) { var byP = PD.filter(function (x) { return predPct(x) === pc; }); if (byP.length === 1) return byP[0]; if (byP.length > 1) PD = byP; else if (noFc) return null;
      /* دورِ ۲۶ (B26·D32): اطمینانی که گفت مالِ هیچ پیش‌بینیِ بازی نیست ⇒ پیش‌بینیِ بازی که اطمینانِ دیگری دارد نامزد نیست */
      else PD = PD.filter(function (x) { return predPct(x) == null; }); if (!PD.length) return null; }
    else if (noFc) return null;
    if (PD.length > 1) { var sc = PD.map(function (x) { return { x: x, n: ovS(x.text, said) }; }), mx = Math.max.apply(null, sc.map(function (z) { return z.n; })), top = sc.filter(function (z) { return z.n === mx && mx >= 2; }); return top.length === 1 ? top[0].x : null; }
    return PD[0];
  };
  /* سرانجامِ پیش‌بینیِ گفت‌وگو روی رکوردِ خودِ سشن (برای 📜) — هر جا 🎯 اش داوری شد */
  PR.predMark = function (s0, fc, out, quote) {
    var hitP = false; S.all("achat", function (x) { return x && x.coach && (x.coach.preds || []).length; }).forEach(function (se) { var ch = false, me = s0 && se.id === s0.id ? s0 : se;
      (me.coach.preds || []).forEach(function (x) { if (x && (x.fc === fc.id || x.fc0 === fc.id) && !x.out) { x.out = { res: out, at: nowISO(), quote: clip(quote, 200), sess: s0 && s0.id }; ch = true; hitP = true; } });
      if (ch && me !== s0) S.put(me); });
    return hitP;
  };
  function predDue(s0, text, at, own28) {
    var I = PR.whenInfo(text), pl = null, hm = at ? userMsgs(s0).filter(function (m) { return String(m.at || "") === String(at); })[0] : null;
    /* (۲) همان جملهٔ خودش که پیش‌بینی را دارد */
    /* دورِ ۲۸ (A28-23): بندی از چند پیش‌بینیِ یک پیام موعدش را فقط از واژه‌های خودش می‌گیرد — نه از جملهٔ بندِ دیگر */
    if (!I && hm && !own28) { var nt = norm(text), st = sentsOf25(hm.text).filter(function (x) { var nx = norm(x); return nt.length >= 4 && nx.length >= 4 && (nx.indexOf(nt) >= 0 || nt.indexOf(nx) >= 0); })[0]; if (st) I = PR.whenInfo(st); }
    /* C1: «تا جمعه» در خودِ جمعه ⇒ صفحه حدس نمی‌زند؛ PR.datePend یک بار می‌پرسد */
    if (I && I.amb) return { due: "", pl: null, amb: { date: I.date, wd: I.wd, opts: I.opts || undefined } };
    var due = I ? I.date : "";
    if (due && due < today()) due = "";
    /* (۳) برنامهٔ بازِ مرتبط */
    if (!due) { pl = ((s0.plans || []).filter(function (q) { return q && !q.done && q.state !== "done" && q.state !== "notdone" && /^\d{4}-\d\d-\d\d$/.test(String(q.when || "")) && q.when >= today() && ((at && String(q.at || "") === String(at) && !own28) || ovS(q.text, text) >= 2); }).slice(-1))[0] || null; if (pl) due = pl.when; }
    return { due: due || "", pl: pl, own: !!(I && due && !pl) };
  }
  /* دورِ ۲۷ (story R5، C53): مسئلهٔ همان نوبت (کانونِ a45: مسئلهٔ زنده یا مسئلهٔ گفت‌وگو) — 🎯 زیرِ همان مسئله می‌نشیند */
  function probOf27(s0, tx) { var f = ""; try { f = A.STORY && A.STORY.focus26 ? A.STORY.focus26(s0) : ""; } catch (e) { }
    /* پیش‌بینی‌ای که با واژهٔ خودش مسئلهٔ دیگرِ همین گفت‌وگو را نام می‌برد («احتمالِ دو قرمز …» در نوبتی که کانون «تاس» است) ⇒ همان مسئله — فقط با واژه‌ای یکتا */
    try { var P = tx && A.STORY && A.STORY.probs26 ? A.STORY.probs26(s0) : []; if (P.length >= 2) { var ws = stoks(tx).filter(function (w) { return w.length >= 3; }), T = P.map(function (z) { return stoks(z.title + " " + z.stmt); });
        /* دورِ ۲۹ (forecast R5، C121؛ B29·D7 nB2 p13 «بودجه‌ی اسباب‌کشی برای رنگ کافی میشه» زیرِ مسئلهٔ میز، C28-19): فعل و واژهٔ دستوری («میشه»، «باید») نشانِ مسئله نیست؛
           هر مسئله با شمارِ واژه‌های یکتای خودش سنجیده می‌شود و فقط بیشترینِ یکتا برنده است (پیش‌تر «میشه» ِ صورتِ میز هم «یکتا» بود و دو مسئله برابر می‌شدند) */
        ws = ws.filter(function (w) { return !FUT28.test(" " + w + " ") && !/^(?:باید|است|هست|نیست|داره|دارم|برای|اینکه|این‌که|کنم|کنه|بشه|میشه|نمیشه|حدودِ?|درصد|مطمئنم)$/.test(w); });
        var Hn = P.map(function (z, i) { return ws.filter(function (w) { return T[i].some(function (v) { return sameW(w, v); }) && !T.some(function (o, j) { return j !== i && o.some(function (v) { return sameW(w, v); }); }); }).length; }), mx = Math.max.apply(null, Hn);
        var H = mx > 0 && Hn.filter(function (n) { return n === mx; }).length === 1 ? [P[Hn.indexOf(mx)]] : [];
        if (H.length === 1) f = H[0].id;
        /* C121: «مسئلهٔ زنده فقط وقتی هیچ‌کدام نخواند» — پیش‌بینی‌ای که دربارهٔ هیچ مسئلهٔ این گفت‌وگو نیست زیرِ مسئلهٔ زندهٔ بسته‌شده می‌نشیند، نه زیرِ مسئلهٔ گفت‌وگوییِ کانونِ همان نوبت (C28-19 pwC2) */
        else { var LV29 = P.filter(function (z) { return z.kind === "live" && !z.done; }); if (s0 && s0.lprob && LV29.some(function (z) { return z.id === s0.lprob; })) f = s0.lprob; else if (LV29.length === 1) f = LV29[0].id; } } } catch (e) { }
    if (!f) { if (s0 && s0.lprob) f = s0.lprob; else return null; } return /^c:/.test(String(f)) ? { sess: s0.id, pk: String(f) } : { sess: s0.id, pid: String(f) }; }
  PR.probOf27 = probOf27;
  /* یک پیش‌بینی، یک 🎯: رکوردِ بی‌موعدی که پیش‌تر ساخته شد (x.fc0) همان است که موعد می‌گیرد — هرگز رکوردِ دوم */
  function fc27(s0, x, due, tx) {
    var f = (x.fc && S.get(x.fc)) || (x.fc0 && S.get(x.fc0)) || null, q = clip(tx || x.text, 200);
    if (!f) { f = { id: A.uid("fc"), type: "fcast", q: q, p: x.p != null ? x.p : null, due: due || "", dim: "s_decision", created: nowISO(), src: { chat: s0.id, quote: q }, by: "chat" }; if (f.p == null) f.est = true; if (x.prob) f.prob = x.prob; }
    else { if (due && !f.outcome && !f.due) f.due = due; if (x.p != null && f.p == null && !f.outcome) { f.p = x.p; delete f.est; } }
    S.put(f); return f;
  }
  PR.fc27 = fc27;
  /* 🎯 ِ یک پیش‌بینیِ گفت‌وگو: موعددار (x.fc) یا بی‌موعد (x.fc0) */
  function fcOf27(x) { return x ? ((x.fc && S.get(x.fc)) || (x.fc0 && S.get(x.fc0)) || null) : null; }
  PR.predFc = fcOf27;
  /* دورِ ۲۹ (C152؛ C29-7 «🎯 بی موعد»، بانکِ R29 #182): موعدی که از حرفِ خودش خوانده شد و تأییدش هنوز باز است — دفترِ 🎯 آن را «منتظرِ تأیید» نشان می‌دهد، نه «بی موعد» */
  PR.predPendDue29 = function (fid) { var out = ""; if (!fid) return out;
    S.all("achat", function (x) { return x && x.coach && (x.coach.preds || []).length; }).forEach(function (se) { if (out) return; (se.coach.preds || []).forEach(function (y) { if (out || !y || y.out || y.fc || y.fc0 !== fid) return;
      var d = y.duePend || (y.dueAmb && y.dueAmb.date) || ""; if (d && pends26(se).some(function (P) { return (P.items || []).some(function (z) { return z.pred === y.at && (z.pk || "") === (y.key || ""); }); })) out = d; }); });
    return out; };
  /* دورِ ۲۸ (forecast R4): o28 = { p, raw, notP, upd, vague } از read28 — اطمینانِ همین بند (نه نخستین درصدِ پیام)، و «همان پیامد با عددِ تازه» با same28 */
  PR.bookPred = function (s0, text, at, key, by, o28) {
    if (!s0 || !text) return null; var C = s0.coach = s0.coach || {}, PD = C.preds = C.preds || [];
    /* کلیدِ «…#n» = یکی از چند پیش‌بینیِ یک پیام (بانکِ R25 #230): با زمانِ پیام یکی نمی‌شود */
    var multi = /#\d+$/.test(String(key || ""));
    var ex = PD.filter(function (x) { return (key && x.key === key) || (!multi && at && x.at === at && !/#\d+$/.test(String(x.key || ""))) || norm(x.text) === norm(text); })[0];
    /* دورِ ۲۹ (forecast R5؛ C29-8 pwC2 p27/p28 پس‌رفت): همان پیامد از همان پیام دو بار می‌رسید — یک بار با نقلِ مدل («guess»: «… درمیاد، ۶۰ درصد مطمئنم») و یک بار
       با بندِ خودش از read28 («… درمیاد»، کلیدِ «#n») — و دو 🎯 می‌ساخت. یک پیام، یک پیامد، یک 🎯: ادعای پاک‌شدهٔ دو متن (clean28) یکی است ⇒ همان رکورد؛ متنِ بندِ خودش جای نقل می‌نشیند */
    if (!ex && at) { var cm29 = norm(clean28(text)); ex = cm29.length >= 4 ? PD.filter(function (x) { return x && String(x.at || "") === String(at) && norm(clean28(x.text)) === cm29; })[0] : null;
      if (ex && o28 && ex.text !== text && !ex.out) { ex.text = clip(text, 300); if (multi) ex.key = key; var ef29 = fcOf27(ex); if (ef29 && !ef29.outcome) { ef29.q = clip(text, 200); if (ef29.src) ef29.src.quote = ef29.q; S.put(ef29); } } }
    /* همان پیش‌بینی که پیش‌تر بی موعد ثبت شد (نقلِ مدل پیش از برنامهٔ همان پیام رسید) ⇒ موعدش همین‌جا کامل می‌شود، نه رکوردِ دوم */
    /* دورِ ۲۷ (C77؛ بانکِ R27 #217): همان پیش‌بینی با عددِ تازه ⇒ همان 🎯 عددِ تازه را می‌گیرد و عددِ پیشین در تاریخچه می‌ماند — هرگز دو 🎯 ِ باز برای یک پیش‌بینی */
    /* دورِ ۲۸ (C90؛ A28-21 s05 p25، C28-17 pwC2 p36، B28·D4 nB1 p16/dB1 p13، D28-24 tD2 p15): همان پیامد با عددِ تازه ⇒ همان 🎯 با تاریخچه — «الان ۸۰ درصد»، «… رو ۵۰ درصد می‌دم»، «نه ۷۰» */
    if (o28 && o28.p != null) { var sm28 = ex && !ex.out ? ex : !ex ? same28(PD, o28, at) : null;
      /* دورِ ۲۹ (dB2 p14 «۶۰ درصد مطمئنم آزمایشیِ شنبه‌ی بعد حدودِ ۶٫۵ میشه» در «همان» 🎯 ِ «آزمایشیِ شنبه» ادغام شد): همان پیامد در روزی دیگر رویدادِ دیگری است — روزِ بندِ تازه
         با موعدِ (یا موعدِ پیشنهادیِ) 🎯 ِ باز فرق دارد ⇒ 🎯 ِ تازه، نه به‌روزرسانی */
      if (sm28 && sm28 !== ex) { var od29 = sm28.due || sm28.duePend || (sm28.dueAmb && sm28.dueAmb.date) || "", nI29 = null; try { if (/(?:شنبه|جمعه|فردا|هفته|ماه|سال|[0-9۰-۹]{1,2}\s*(?:فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند))/.test(String(o28.raw || text))) nI29 = PR.whenInfo(o28.raw || text); } catch (e) { }
        if (od29 && nI29 && nI29.date && ((!nI29.amb && nI29.date !== od29) || (od29 <= today() && nI29.date > today()))) sm28 = null; }
      /* همان پیام (نقلِ مدل پیش‌تر ثبتش کرد، a27): عددِ بندِ خودش جای عددِ خوانده‌شده از نقل می‌نشیند — تاریخچه نیست، چون او عددِ دیگری نگفته بود (B28·D3: ۹۰ ِ داداش هرگز عددِ او نبود) */
      if (sm28 && sm28 === ex && String(ex.at || "") === String(at || "") && sm28.p !== o28.p) { sm28.p = o28.p; var sf0 = fcOf27(sm28); if (sf0 && !sf0.outcome) { sf0.p = o28.p; delete sf0.est; S.put(sf0); } }
      if (sm28 && sm28.p !== o28.p && (sm28 !== ex || sm28.p != null)) { var was28 = sm28.p; (sm28.pHist = sm28.pHist || []).push({ p: sm28.p, at: nowISO(), why: clip(o28.raw || text, 120) }); sm28.p = o28.p;
        var sf28 = fcOf27(sm28); if (sf28 && !sf28.outcome) { (sf28.pHist = sf28.pHist || []).push({ p: sf28.p, at: nowISO() }); sf28.p = o28.p; delete sf28.est; S.put(sf28); } else if (!sf28) { var nf28 = fc27(s0, sm28, ""); sm28.fc0 = nf28.id; }
        sysLine25(s0, "🎯 «" + clip(sm28.text, 60) + "» — اطمینان: " + fa(o28.p) + "٪ (" + (was28 != null ? "پیش‌تر " + fa(was28) + "٪" : "پیش‌تر بی عدد") + "؛ همان پیش‌بینی به‌روز شد و عددِ پیشین در تاریخچه‌اش ماند — رکوردِ دوم ساخته نشد).");
        return sm28; }
      if (sm28 && !ex) return sm28; }
    if (!ex && !multi && !o28) { var cn27 = claimN27(text), sm27 = cn27.length >= 6 ? PD.filter(function (y) { return y && !y.out && claimN27(y.text) === cn27; })[0] : null;
      if (sm27) { var np27 = confPct26(text); if (np27 != null && np27 <= 100 && np27 !== sm27.p) { (sm27.pHist = sm27.pHist || []).push({ p: sm27.p, at: nowISO(), why: clip(text, 120) }); var was27 = sm27.p; sm27.p = np27;
          var sf27 = fcOf27(sm27); if (sf27 && !sf27.outcome) { (sf27.pHist = sf27.pHist || []).push({ p: sf27.p, at: nowISO() }); sf27.p = np27; delete sf27.est; S.put(sf27); } else if (!sf27) { var nf27 = fc27(s0, sm27, ""); sm27.fc0 = nf27.id; }
          sysLine25(s0, "🎯 «" + clip(sm27.text, 60) + "» — اطمینان: " + fa(np27) + "٪ (اصلاح شد ⇐ " + (was27 != null ? fa(was27) + "٪" : "بی عدد") + "؛ همان پیش‌بینی، رکوردِ دوم ساخته نشد)."); }
        return sm27; } }
    if (ex && (ex.due || ex.fc || ex.out)) return ex;
    var tx = ex ? ex.text : text, D = predDue(s0, tx, at, multi && !!o28), due = D.due, pl = D.pl; if (ex && D.amb && !ex.dueAmb) ex.dueAmb = D.amb; if (ex && (!due || (D.own && ex.duePend))) return ex;
    var pc = o28 && "p" in o28 ? o28.p : confPct26(tx);   /* دورِ ۲۶ (D26-14): اطمینان = درصدِ کنارِ «مطمئنم/احتمال/اطمینان»، نه نخستین درصدِ خودِ ادعا («حدودِ ۸ درصد درمیاد، ۶۰ درصد مطمئنم») */
    /* دورِ ۲۴ (R7، D24-14): اطمینانِ خودش در همان پیام («… ۸۰ درصد مطمئنم») هم مالِ همین پیش‌بینی است — نه فقط در متنِ حدس */
    if (pc == null && at && !o28) { var hm = userMsgs(s0).filter(function (m) { return String(m.at || "") === String(at); })[0], pm2 = hm && !multi ? /(\d{1,3})\s*(?:٪|%|درصد)\s*(?:مطمئن|اطمینان|احتمال)/.exec(wpct(hm.text)) : null; if (pm2 && +pm2[1] <= 100) pc = +pm2[1]; }
    var x = ex || { text: clip(text, 300), key: key || "", at: at || nowISO(), due: "", by: by || "page" };
    /* دورِ ۲۶ (C12 بر هر دو مسیر؛ بانکِ R26 #203): روزی که صفحه از جملهٔ خودش خواند اول «… درست است؟» می‌گیرد (PR.datePend)؛ روزِ برنامه‌ای که خودش تأیید کرده، یا خودِ امروز، نه */
    if (due && D.own && due !== today()) { x.duePend = due; due = ""; }
    x.due = due || ""; if (pc != null && pc <= 100) x.p = pc; if (D.amb) x.dueAmb = D.amb;
    if (!ex) { var pb27 = probOf27(s0, tx); if (pb27) x.prob = pb27; }
    if (due && PR.dupFcast(clip(tx, 200), false)) { var dp27 = PR.dupFcast(clip(tx, 200), false); if (!dp27.due && !dp27.outcome) { dp27.due = due; if (pl) dp27.plan = { sess: s0.id, id: pl.id }; S.put(dp27); } x.fc = dp27.id; delete x.fc0; due = ""; }
    if (due) { var f = fc27(s0, x, due, tx); if (pl) f.plan = { sess: s0.id, id: pl.id }; S.put(f); x.fc = f.id; delete x.fc0; }
    /* دورِ ۲۷ (story R5، C53؛ C27-20 pwC2، U49 aB3/bp2/oB1، A27-12 s05): اطمینانِ عددی کنارِ پیامدی در آینده همان لحظه یک 🎯 می‌سازد — زیرِ مسئلهٔ همان نوبت (x.prob)،
       حتی بی موعد (موعد بعدتر روی همان رکورد می‌نشیند: fc27). پیش‌تر 🎯 فقط با موعد ساخته می‌شد و پیش‌بینیِ بی‌موعد هیچ‌جا جز پروندهٔ گفت‌وگو نبود. واژهٔ مبهم بی عدد (C37) 🎯 نمی‌سازد. */
    else if (!x.fc && !x.fc0 && x.p != null) { var f0 = fc27(s0, x, "", tx); x.fc0 = f0.id; }
    if (!ex) { PD.push(x);
      /* C37: پیش‌بینیِ تازه با واژهٔ مبهم و بی عدد ⇒ یک بار عددش پرسیده می‌شود (پاسخِ «… درصد» در پیامِ بعد کنارِ همین می‌نشیند — PR.predExplicit) */
      /* دورِ ۲۸ (C90؛ A28-19 s05 p23، C28-25 pwC2 p33، B28·D5 dB1 p12، tD2 p12): «تقریباً/خیلی مطمئنم …» بی عدد ⇒ همان یک بار عدد پرسیده می‌شود */
      if (x.p == null && o28 && o28.vague && !x.pAsk) { x.pAsk = true; sysLine25(s0, "🎯 «" + clip(tx, 60) + "» — چند درصد مطمئنی؟ «" + o28.vague + "» عدد نیست؛ عددِ خودت را بگو («… درصد») تا کنارِ همین پیش‌بینی بنشیند — بی آن، پیش‌بینی بی اطمینان ثبت می‌ماند."); }
      if (x.p == null && VAGUE37.test(dg(tx)) && !x.pAsk) { x.pAsk = true; sysLine25(s0, "🎯 «" + clip(tx, 60) + "» — چند درصد مطمئنی؟ «احتمالاً» یا «فکر کنم» عدد نیست؛ عددِ خودت را بگو («… درصد») تا کنارِ همین پیش‌بینی بنشیند — بی آن، پیش‌بینی بی اطمینان ثبت می‌ماند."); } }
    return x;
  };
  /* دورِ ۲۶ (Q8؛ A26-28 aA3/aA4، U49 aB3، D26-14 pwD1): سه ریشه —
     (۱) اطمینانِ گفته‌شده («هفتاد درصد مطمئنم»، «۷۰ درصد مطمئنم …») خودش نشانهٔ پیش‌بینی است — پیش‌تر فقط با واژهٔ «پیش‌بینی» یا تاریخ در همان جمله ثبت می‌شد؛
     (۲) درصدی که درونِ خودِ ادعاست («حدودِ ۸ درصد درمیاد») اطمینان نیست و تکه‌ای که فقط اطمینان است («۶۰ درصد مطمئنم») پیش‌بینیِ جدا نیست — یک پیش‌بینی، یک 🎯؛
     (۳) جمله‌ای که به پیش‌بینیِ پیشین برمی‌گردد («از پیش‌بینیم خیلی بیشتر»، «درست همان که پیش‌بینی کرده بودم») پیش‌بینیِ تازه نیست: داوری است یا پرسشِ «شد یا نشد؟». */
  var CONFX26 = /\d{1,3}\s*(?:٪|%|درصد)\s*(?:مطمئنم|مطمئن[‌\s]*(?:ام|هستم)|احتمال\s*(?:میدم|می[‌\s]?دم|می[‌\s]?دهم|داره|دارد)|اطمینان(?:\s*دارم)?)|(?:با|به)\s*(?:احتمالِ?|اطمینانِ?)\s*\d{1,3}\s*(?:٪|%|درصد)|احتمالش\s*\d{1,3}\s*(?:٪|%|درصد)|\(\s*\d{1,3}\s*(?:٪|%)\s*\)|مطمئنم[،,\s]+\d{1,3}\s*(?:٪|%|درصد)|(?<=احتمالِ?[^.!؟?\n]{0,60}?)\d{1,3}\s*(?:٪|%|درصد)\s*می[‌\s]?د(?:و|ا)نم/;   /* دورِ ۲۷ (بانکِ R27 #192 «مطمئنم، نود درصد، که …»، #202 «احتمالِ … رو ۲۰ درصد می‌دونم») */
  function confPct26(t) { var w = wpct(t), m = CONFX26.exec(w), n = m ? /\d{1,3}/.exec(m[0]) : null; if (n) return +n[0] <= 100 ? +n[0] : null; return pctOf(t); }
  function pureConf26(x) { var w = wpct(x); return CONFX26.test(w) && toks(w.replace(CONFX26, " ")).length < 2; }
  /* تکه‌ها: جمله‌ها، «—»، «؛» و «،»؛ هر تکهٔ اطمینان (CONFX26) پیش‌بینیِ خودش است — اگر فقط اطمینان است، ادعایش تکهٔ پیش از آن است. شمارنده‌ها («یک،» «دو،» «اولی:») و
     سرِ پیام تا «پیش‌بینی …:» جزوِ متن نیستند؛ پرسش نیست. خروجی فقط وقتی به کار می‌رود که دست‌کم دو پیش‌بینی بدهد (یک پیش‌بینی همان راهِ پیشین است). */
  var ENUM27 = /^(?:و\s+)?(?:یک|یکی|دو|دومی|سه|سومی|اول(?:ی|ش)?|دوم(?:ی|ش)?|سوم(?:ی|ش)?|[0-9۰-۹]{1,2}\s*[).\-–])\s*(?:[،,:)\-–]\s*|$)/;
  function multi27(t) {
    var w = String(t || ""), ii = /پیش[‌\s]?بینی[^:.!؟?\n]{0,30}:\s*/.exec(w), body = ii ? w.slice(ii.index + ii[0].length) : w;
    var ch = body.split(/(?<=[.!؟?])\s+|\n+|\s+[—–-]\s+|\s*[؛،,]\s*/).map(function (x) { return x.replace(/^[\s.]+|[\s.!]+$/g, "").replace(ENUM27, "").replace(/^و\s+/, "").trim(); }).filter(function (x) { return x && !ENUM27.test(x + "،"); });
    var out = [], used = -1;
    var anyC27 = ch.some(function (x) { return CONFX26.test(wpct(x)); });
    ch.forEach(function (x, i) { var wx = wpct(x); /* «… شصت درصد» ِ خالی پس از ادعا، در پیامی که اطمینان را با «مطمئنم» گفته (بانکِ R27 #194) */ if (anyC27 && /^\s*\d{1,3}\s*(?:٪|%|درصد)\s*$/.test(wx) && i > 0) x = x + " مطمئنم", wx = wx + " مطمئنم"; if (!CONFX26.test(wx) || /[؟?]\s*$/.test(x)) return;
      if (pureConf26(x)) { var j = i - 1; if (j <= used || j < 0) return; var c0 = ch[j]; if (CONFX26.test(wpct(c0)) || /[؟?]\s*$/.test(c0) || toks(c0).length < 2) return; out.push(c0 + "؛ " + x); used = i; }
      else { out.push(x); used = i; } });
    return out.filter(function (x) { return !past27(x); });
  }
  PR.multi27 = multi27;
  PR.predExplicit = function (s0) {
    var U = userMsgs(s0), m = U[U.length - 1]; if (!m) return null; var t = String(m.text || ""), at = String(m.at || "");
    /* دورِ ۲۷ (C75): اطمینانی که از کسِ دیگری نقل کرد («مربی گفت ۷۰ درصد») پیش‌بینیِ او نیست — تکهٔ «کارِ دیگری» (a45 ST.otherWork27) خوانده نمی‌شود */
    try { var OW75 = A.STORY && A.STORY.otherWork27 ? A.STORY.otherWork27(t) : null; if (OW75) t = t.slice(0, OW75.from) + " " + t.slice(OW75.to); } catch (e) { }
    /* دورِ ۲۷ (story R5، C53؛ C27-20 pwC2 p27، D27-31 arD2 p7): چند اطمینانِ عددی در یک پیام، هر کدام کنارِ ادعای خودش ⇒ هر کدام یک پیش‌بینی (یک 🎯).
       پیش‌تر بُرش در «،» با تکه‌ای که فقط اطمینان است («۶۰ درصد مطمئنم») کنار گذاشته می‌شد و همهٔ پیام یک پیش‌بینی می‌شد، یا شمارندهٔ بعدی («… مطمئنم. دو») به متن می‌چسبید. */
    /* دورِ ۲۸ (forecast R4، C90): خوانندهٔ یکپارچهٔ بندها — هر اطمینانِ عددیِ خودش در هر جای بند یک 🎯؛ گذشته/دیگری هیچ؛ «تقریباً مطمئنم» ⇒ پرسشِ عدد؛ «N درصد.» ِ تنها ⇒ پاسخِ همان پرسش */
    /* دورِ ۲۹ (B29·D5، بانکِ R29 #215): گیومه‌ای که خودش اطمینان دارد نقلِ واژه است — در هیچ‌یک از راه‌های زیر اطمینان شمرده نمی‌شود */
    t = t.replace(/«[^«»]*»/g, function (q) { return confAll28(wpct(q)).length || CONFX26.test(wpct(q)) ? "«…»" : q; });
    var r28 = apply28(s0, read28(t, /پیش[‌\s]?بینی/.test(t)), at, U); if (r28 !== undefined) return r28;
    var M27 = multi27(t); if (M27.length >= 2) { var last27 = null; M27.forEach(function (x, i) { last27 = PR.bookPred(s0, x, at, at + "#" + (i + 1), "page") || last27; }); return last27; }
    /* چند پیش‌بینی در یک پیام («دو تا پیش‌بینی دارم: … (۶۰٪)، و … (۳۰٪)») ⇒ هر کدام رکوردِ خودش (قاعدهٔ «یک 🎯» برای هر پیش‌بینی است) */
    var intro =/پیش[‌\s]?بینی[^:.!؟?\n]{0,24}:\s*/.exec(t);
    if (intro) { var raw = t.slice(intro.index + intro[0].length).split(/\s*[،؛]\s*(?:و\s+)?|\s+و\s+(?=تا\s)/).map(function (x) { return x.replace(/[.!\s]+$/, "").trim(); }).filter(Boolean);
      var parts = raw.some(pureConf26) ? [] : raw.filter(function (x) { return pctOf(x) != null && toks(x).length >= 2; });
      if (parts.length >= 2) { var last = null; parts.forEach(function (x, i) { last = PR.bookPred(s0, x, at, at + "#" + (i + 1), "page") || last; }); return last; } }
    /* (۱) جملهٔ داوری («پس پیش‌بینیم غلط بود») و ارجاع («از پیش‌بینیم خیلی بیشتر») پیش‌بینیِ تازه نیست */
    var sent = PRED_EXPL.test(t) ? t.split(/[.!؟?\n]+/).filter(function (x) { return PRED_EXPL.test(x) && !PR.predVerdictIn(x) && !PR.predRefIn(x) && !past27(x); })[0] : "";   /* دورِ ۲۸ (D28-8 oD1 p13 «پیش‌بینیم ۱ بود، شد ۳»؛ B28·D3): گزارشِ گذشته پیش‌بینیِ تازه نیست */
    /* دورِ ۲۸ (C90، A28-17): متنِ 🎯 خودِ پیامد است — نه سرِ پیام تا «پیش‌بینیم اینه که» */
    if (sent) { var pe28 = /پیش[‌\s]?بینی(?:م|ام)?\s*(?:اینه|این\s*است|:)\s*(?:که\s*)?/.exec(sent), st28 = pe28 ? sent.slice(pe28.index + pe28[0].length).trim() : ""; if (toks(st28).length >= 2) sent = st28;
      return PR.bookPred(s0, sent.replace(/^[\s«"]*(?:من\s*)?/, "").trim(), at, "", "page"); }
    if (PR.predVerdictIn(t) || PR.predRefIn(t)) return null;
    /* پیش‌بینیِ بی واژهٔ «پیش‌بینی»: جملهٔ خودش با اطمینانِ خودش (بانکِ R25 #219؛ دورِ ۲۶: بی تاریخ هم) — جمله‌ای که فقط اطمینان است ادعایش جملهٔ پیشینِ همان پیام است */
    /* C37: پاسخِ کوتاهِ «۷۰ درصد» به پرسشِ عددِ صفحه (پیامِ پیشین) = اطمینانِ همان پیش‌بینی */
    var pu37 = U[U.length - 2], lp37 = pu37 ? (((s0.coach || {}).preds || []).filter(function (y) { return y && y.pAsk && y.p == null && !y.out && String(y.at) === String(pu37.at || ""); }).pop()) : null, pv37 = lp37 && toks(t).length <= 4 ? pctOf(t) : null;
    if (lp37 && pv37 != null) { lp37.p = pv37; if (lp37.duePend || lp37.dueAmb) lp37.dueAskAt = at; var lf37 = fcOf27(lp37) || (lp37.p != null ? fc27(s0, lp37, "") : null); if (lf37 && !lp37.fc) lp37.fc0 = lf37.id; if (lf37 && !lf37.outcome) { lf37.p = pv37; delete lf37.est; S.put(lf37); } sysLine25(s0, "🎯 «" + clip(lp37.text, 50) + "» — اطمینان: " + fa(pv37) + "٪ (به گفتهٔ خودت)."); return lp37; }
    var S0 = sentsOf25(t), ci = -1; S0.forEach(function (x, i) { if (ci < 0 && !/[؟?]\s*$/.test(x) && !/(?:^|[\s،])(?:اگه|اگر|شاید|کاش)(?![آ-ی])/.test(x) && CONFX26.test(wpct(x))) ci = i; });
    if (ci < 0) return null;
    var cs = S0[ci].replace(/[.!\s]+$/, "");
    if (pureConf26(cs)) {
      /* پیامی که فقط اطمینان است («هشتاد درصد مطمئنم») اطمینانِ پیش‌بینیِ پیامِ پیشینِ خودش است — نه پیش‌بینیِ دوم (بانکِ R26 #205) */
      if (!ci) { var pu = U[U.length - 2], lp = pu ? (((s0.coach || {}).preds || []).filter(function (y) { return y && String(y.at) === String(pu.at || "") && y.p == null && !y.out; }).pop()) : null, pv = pctOf(cs);
        if (lp && pv != null) { lp.p = pv; var lf = fcOf27(lp) || (lp.p != null ? fc27(s0, lp, "") : null); if (lf && !lp.fc) lp.fc0 = lf.id; if (lf && !lf.outcome) { lf.p = pv; delete lf.est; S.put(lf); } return lp; } return null; }
      if (/[؟?]\s*$/.test(S0[ci - 1])) return null; cs = S0[ci - 1].replace(/[.!\s]+$/, "") + "؛ " + cs; }
    if (past27(cs)) return null;   /* دورِ ۲۷ (C53؛ بانکِ R27 #210/#220): اطمینان دربارهٔ گذشته («… دیروز قفل کردم»، «… کرده بودم … درست بود») پیش‌بینی نیست */
    return PR.bookPred(s0, cs, at, "", "page");
  };
  function apply28(s0, R, at, U) {
    var PD = ((s0.coach || {}).preds) || [], conf = R.filter(function (x) { return x.p != null; }), own = conf.filter(function (x) { return x.kind === "own" && !x.pure; }), bare = R.filter(function (x) { return x.bare != null; }), vg = R.filter(function (x) { return x.vague; }), did = null;
    var pu = U[U.length - 2], lp = pu ? PD.filter(function (y) { return y && y.pAsk && y.p == null && !y.out && String(y.at) === String(pu.at || ""); }).pop() : null;
    if (lp && !bare.length) { var bn28 = /^\s*(\d{1,3})\s*[.!]?\s*$/.exec(dg(U[U.length - 1] ? U[U.length - 1].text : "")); if (bn28 && +bn28[1] <= 100) bare = [{ bare: +bn28[1] }]; }   /* C122: «۶۰» ِ تنها */
    /* بانکِ R28 #144/#176: عددِ تنها در پاسخِ «چقدر/چند درصد مطمئنی که X؟» ِ مربی ⇒ 🎯 ِ X (از زبانِ خودش: «…ی» ⇒ «…م»)؛ پرسشِ بی پیامد ⇒ صفحه می‌پرسد «کدام پیامد؟» — عدد کورکورانه 🎯 نمی‌شود */
    if (!lp && !own.length && !vg.length) { var um28 = U[U.length - 1], bn = um28 ? /^\s*(?:حدودِ?\s*)?(\d{1,3})\s*(?:٪|%|درصد)?\s*[.!]?\s*$/.exec(dg(um28.text)) : null;
      if (bn && +bn[1] <= 100) { var M0 = s0.msgs || [], ai28 = null; for (var q = M0.indexOf(um28) - 1; q >= 0; q--) { if (M0[q] && M0[q].role === "ai") { ai28 = M0[q]; break; } if (M0[q] && M0[q].role === "user") break; }
        var am28 = ai28 ? /(?:چقدر|چند\s*درصد)\s*مطمئنی\s*(?:که\s*)?([^؟?]*)[؟?]/.exec(String(ai28.text || "")) : null;
        if (am28) { var cl28 = clean28(am28[1]).replace(/(?:^|\s)((?:ن?می[‌\s]?|ب|ن)?[آ-ی]{2,})ی(?=\s*$)/, function (m0, w0) { return m0.replace(/ی$/, "م"); });
          if (cnt28(cl28) >= 2) return PR.bookPred(s0, cl28, String(um28.at || ""), "", "page", { p: +bn[1], raw: cl28 });
          sysLine25(s0, "🎯 «" + fa(bn[1]) + " درصد» — اطمینانِ کدام پیامد؟ پیامدش را در یک جمله بگو تا کنارش بنشیند — تا نگویی چیزی ثبت نمی‌شود."); return null; } } }
    if (lp && bare.length) { var pv = bare[0].bare; lp.p = pv; if (lp.duePend || lp.dueAmb) lp.dueAskAt = at;   /* C152: موعدِ پیش‌بینیِ مبهم پس از پاسخِ عدد */ var lf = fcOf27(lp) || fc27(s0, lp, ""); if (lf && !lp.fc) lp.fc0 = lf.id; if (lf && !lf.outcome) { lf.p = pv; delete lf.est; S.put(lf); }
      sysLine25(s0, "🎯 «" + clip(lp.text, 50) + "» — اطمینان: " + fa(pv) + "٪ (به گفتهٔ خودت)."); did = lp; }
    /* دورِ ۲۹ (بانکِ R29 #192 «الان دیگه ۸۵ درصد مطمئنم، نه ۷۰»، C77): اطمینانِ تنها با نشانهٔ تازه‌کردن («نه ۷۰»، «الان») عددِ تازهٔ همان 🎯 ِ باز است — اگر فقط یک 🎯 ِ بازِ پیشین
       با آن عدد (یا، بی «نه N»، فقط یک 🎯 ِ باز) هست؛ وگرنه راهِ پیشین (اطمینانِ پیامِ قبلی) */
    if (!own.length && !vg.length) { var pu29 = conf.filter(function (x) { return x.kind === "own" && x.pure && (x.notP != null || x.upd); })[0];
      if (pu29 && !did) { var op29 = PD.filter(function (y) { return y && !y.out && y.text && String(y.at || "") !== String(at) && (pu29.notP == null || y.p === pu29.notP); });
        if (op29.length === 1 && op29[0].p !== pu29.p) return PR.bookPred(s0, op29[0].text, at, "", "page", { p: pu29.p, raw: op29[0].text, notP: pu29.notP, upd: true }); } }
    if (!own.length && !vg.length) { if (conf.some(function (x) { return x.kind === "own" && x.pure; })) return did || undefined; return conf.length ? did : (did || undefined); }
    var L = own.concat(vg).sort(function (a, b) { return a.si - b.si; }), many = L.length >= 2;
    L.forEach(function (x, i) { did = PR.bookPred(s0, x.claim || clip(x.raw, 300), at, many ? at + "#" + (i + 1) : "", "page", x.vague ? { p: null, vague: x.vague, raw: x.raw } : { p: x.p, raw: x.raw, notP: x.notP, upd: x.upd }) || did; });
    return did;
  }
  function claimN27(x) { return norm(wpct(String(x || "")).replace(new RegExp(CONFX26.source, "g"), " ").replace(/(?:^|\s)(?:مطمئنم|که|پیش‌بینیم|پیش بینیم)(?=\s|$)/g, " ").replace(/^پیش[‌\s]?بینی[^:]{0,20}:/, " ")); }
  function past27(x) { var d = dg(String(x || "").replace(CONFX26, " ").replace(/مطمئن\s*بودم/g, " بود ")); return PAST27.test(d) && !FUT27.test(d) || /کرده\s*بودم|بودم(?![آ-ی])/.test(d); }
  /* داوریِ یک 🎯 عوض می‌شود (یا باز می‌شود: out = "") و داوریِ پیشین در تاریخچه می‌ماند — رکوردِ 🎯 و پیش‌بینی‌های گفت‌وگو که به آن بسته‌اند */
  PR.reverdict26 = function (fc, out, quote, s0, kind) {
    if (!fc) return false; var was = fc.outcome || ""; if (was === out) return false;
    (fc.verdictHist = fc.verdictHist || []).push({ was: was, wasAt: fc.outcomeAt || "", at: nowISO(), why: clip(quote, 200), sess: (s0 && s0.id) || "" });
    if (out) { fc.outcome = out; fc.outcomeAt = nowISO(); fc.judgedBy = { kind: kind || "her-words", sess: s0 && s0.id, quote: clip(quote, 200), d: today() }; } else { delete fc.outcome; delete fc.outcomeAt; delete fc.judgedBy; }
    S.put(fc);
    S.all("achat", function (x) { return x && x.coach && (x.coach.preds || []).length; }).forEach(function (se) { var me = s0 && se.id === s0.id ? s0 : se, ch = false;
      (me.coach.preds || []).forEach(function (y) { if (y && (y.fc === fc.id || y.fc0 === fc.id)) { (y.outHist = y.outHist || []).push(y.out || { res: "" }); if (out) y.out = { res: out, at: nowISO(), quote: clip(quote, 200), sess: s0 && s0.id }; else delete y.out; ch = true; } });
      if (ch && me !== s0) S.put(me); });
    return true;
  };
  function predApply26(s0, x, out, quote) {
    var fc = fcOf27(x);
    if (fc && fc.outcome) { if (!x.out) x.out = { res: fc.outcome, at: fc.outcomeAt || nowISO(), quote: clip(quote, 200), sess: s0.id }; return x; }
    if (!fc && predPct(x) != null) { fc = { id: A.uid("fc"), type: "fcast", q: clip(x.text, 200), p: predPct(x), due: today(), dim: "s_decision", created: x.at || nowISO(), src: { chat: s0.id, quote: clip(x.text, 200) }, by: "chat" }; x.fc = fc.id; }
    if (fc && !fc.due) fc.due = today();   /* دورِ ۲۷ (C53): 🎯 ِ بی‌موعد روزِ داوری را موعد می‌گیرد — همان که پیش‌تر 🎯 ِ ساخته‌شده هنگامِ داوری داشت */
    if (fc) { fc.outcome = out; fc.outcomeAt = nowISO(); fc.judgedBy = { kind: "her-words", sess: s0.id, quote: clip(quote, 200), d: today() }; S.put(fc); PR.predMark(s0, fc, out, quote); }
    if (!x.out) x.out = { res: out, at: nowISO(), quote: clip(quote, 200), sess: s0.id };
    return x;
  }
  function predLab26(x) { return "«" + clip(x.text, 50) + "»" + (predPct(x) != null ? " (" + fa(predPct(x)) + "٪)" : ""); }
  /* داوریِ پیش‌بینی به حرفِ خودش، بی پروندهٔ تمرین: همان پیش‌بینیِ بازِ گفت‌وگو (و 🎯 اش) سرانجام می‌گیرد و از «امروز» می‌رود؛
     پیش‌بینیِ بی‌موعدی که اطمینان داشت ⇒ یک 🎯 ِ داوری‌شده (دادهٔ کالیبراسیون: اطمینانِ خودش + سرانجام)؛ بی اطمینان ⇒ فقط سرانجام در 📜. صفحه حدس نمی‌زند.
     دورِ ۲۶ (Q8؛ B26·D32، D26-14، پرسشِ ۴۴ ِ بانکِ مالک): اطمینانی که گفت همان پیش‌بینی را نام می‌برد — هرگز روی پیش‌بینیِ بازی با اطمینانِ دیگر نمی‌نشیند؛ اگر مالِ پیش‌بینیِ
     داوری‌شده است، همان داوری با تاریخچه عوض می‌شود. چند پیش‌بینیِ باز و بی نشانه ⇒ صفحه یک بار می‌پرسد «کدام؟»؛ ارجاعِ بی داوری ⇒ یک بار «شد یا نشد؟». */
  /* دورِ ۲۷ (story R5، C53): «گزارشی روشن از سرانجام که با دقیقاً یک 🎯 ِ باز جور است آن را می‌بندد؛ اگر دو تا جور است صفحه می‌پرسد».
     جمله‌ای از پیامِ او (نه پرسش، نه شرط، نه آینده) که دست‌کم دو واژهٔ محتوایی با یک پیش‌بینیِ باز دارد (بیشینهٔ یکتا) و گزارشِ گذشته است:
       • «درست درومد/بود» ⇒ شد؛ «درست درنیومد/غلط بود» ⇒ نشد؛
       • فعلِ گذشتهٔ همان کار («تأیید کرد»، «ثبت‌نام کرد») ⇒ شد؛ منفی‌اش («تأیید نکرد») ⇒ نشد؛
       • عددِ دیگری جز عددِ تقریبیِ پیش‌بینی («حدودِ ۱۰ بار» ⇐ «۱۱ بار») ⇒ صفحه قاعده‌ای برای «حدود» ندارد ⇒ یک بار می‌پرسد «شد یا نشد؟»؛
       • «حل شد/تموم شد/ثبت شد» فقط سرانجامِ پیش‌بینی‌ای است که دربارهٔ همان کار است.
     after = پس از پاسخِ پرسشِ «کدام؟» در همان پیام: فقط یک پیش‌بینیِ بازِ دیگر و نامِ آن با «شد/نشد» ِ صریح (واژهٔ مشترکِ یکتا بس است). */
  var LIGHT27 = "(?:کرد|کردن|کردند|کردم|کردیم|شد|شدن|شدند|شدم|داد|دادن|دادند|دادم|گرفت|گرفتن|گرفتم|زد|زدم|رسید|رسیدم|اومد|اومدن|اومدم|آمد|آمدند|آمدم|موند|موندم|ماند)";
  var PAST27 = new RegExp("(?:^|[\\s‌])ن?" + LIGHT27 + "(?=$|[\\s.!،؛:)»])|(?:^|[\\s‌])ن?(?:انداختم|خریدم|خرید|فروخت|نوشتم|نوشت|پذیرفت|آورد|آوردم|درومد|دراومد|درآمد|درنیومد|درنیامد|بود|نبود)(?=$|[\\s.!،؛:)»])");
  var FUT27 = /(?:^|[\s‌])(?:می[‌\s]?(?:کنه|کند|کنن|کنند|شه|شود|ده|دهد|گیره|گیرد|یاد|آید|رسه|رسد|مونه|ماند|زنه|زند|خوره|زنم|کنم|شم|دم)|میشه|میاد|میده|خواهد|قراره)(?=$|[\s.!،؛:)»])/;
  var DONEW27 = /(?:^|[\s،«])(حل|تموم|تمام|بسته|باز|ثبت|عوض|اصلاح|انجام|معلوم|روشن|شروع|پیدا|قطعی|تعطیل)\s*(?:هم\s*)?(ن?شد)(?![آ-ی])/g;
  /* کارِ پیش‌بینی‌شده: واژهٔ پیش از فعلِ سبکِ آینده («تأیید می‌کنه» ⇐ «تأیید»، «تموم میشه» ⇐ «تموم»، «ثبت‌نام می‌کنه» ⇐ «ثبت‌نام») */
  function act27(py) { var m = /([آ-ی‌]{2,})\s+(?:می[‌\s]?(?:کنه|کند|کنن|کنند|کنم|شه|شود|شم|ده|دهد|دم|گیره|گیرد|گیرم|زنه|زند)|میشه|میشم|میده|میدم)(?=$|[\s.!،؛:)»(])/.exec(py); return m ? m[1].replace(/‌/g, "") : ""; }
  /* فعلِ آیندهٔ پیش‌بینی ⇐ گذشتهٔ همان («میاد» ⇐ «اومد/آمد»، «میشم» ⇐ «شدم») — ستاک‌های گذشته، با «ن» ِ منفی */
  var FV27 = [[/می[‌\s]?(?:یاد|آید|یان|آیند)|میاد|(?:^|\s)بی(?:اد|ان)(?![آ-ی])/, "(?:اومد|آمد)"], [/می[‌\s]?(?:ره|رود|رم)|میره|میرم/, "(?:رفت)"], [/می[‌\s]?(?:شه|شود|شم|شیم)|میشه|میشم|(?:^|\s)ب(?:شه|شن|شم)(?![آ-ی])/, "(?:شد)"], [/می[‌\s]?(?:کنه|کند|کنم|کنیم|کنن)/, "(?:کرد)"],
    [/می[‌\s]?(?:ده|دهد|دم|دن)|میده|میدم/, "(?:داد)"], [/می[‌\s]?(?:گیره|گیرد|گیرم|گیریم)/, "(?:گرفت)"], [/می[‌\s]?(?:دوم|دود|دوه)/, "(?:دوید)"], [/می[‌\s]?(?:رسه|رسد|رسم)/, "(?:رسید)"], [/می[‌\s]?(?:مونه|ماند|مونم)|می[‌\s]?مونه|(?:^|\s)بمون(?:ه|ن)(?![آ-ی])/, "(?:موند|ماند)"], [/(?:می[‌\s]?|ب)شکن/, "(?:شکست)"], [/می[‌\s]?(?:خوابم|خوابه)/, "(?:خوابید)"], [/می[‌\s]?(?:خورم|خوره)/, "(?:خورد)"], [/می[‌\s]?(?:فروشیم|فروشه|فروشم)/, "(?:فروخت)"]];
  function fv27(py, x) { for (var k = 0; k < FV27.length; k++) if (FV27[k][0].test(py)) { var m = new RegExp("(?:^|[\\s‌])(ن?)" + FV27[k][1] + "(?:م|ی|یم|ید|ن|ند)?(?=$|[\\s.!،؛:)»])").exec(x); if (m) return m[1] ? "no" : "yes"; } return ""; }
  /* «بیشتر از / بالای / دست‌کم N» و «کمتر از / زیرِ N» ⇐ عددِ گزارش (یک عدد) — مقایسهٔ حسابی، نه قرارداد */
  function cmp27(py, x) { var m = /(بیشتر\s*از|بالای|بالاتر\s*از|دست[‌\s]?کم|حداقل|کمتر\s*از|زیرِ?|پایین[‌\s]?ترِ?\s*از|حداکثر)\s*(\d+(?:\.\d+)?)/.exec(py); if (!m) return ""; var nx = nums27(x).filter(function (k) { return k !== m[2]; }).map(Number); if (nx.length !== 1) return "";
    var v = nx[0], N = +m[2], up = /بیشتر|بالا|دست|حداقل/.test(m[1]); return up ? (/دست|حداقل/.test(m[1]) ? v >= N : v > N) ? "شد" : "نشد" : (/حداکثر/.test(m[1]) ? v <= N : v < N) ? "شد" : "نشد"; }
  var GPAST27 = /(?:^|[\s‌])ن?[آ-ی]{2,}(?:یدم|یدیم|یدن|ادم|ادیم|ردم|ردیم|فتم|فتیم|ستم|ستیم|شتم|ندم|ودم|ختم|ختیم|اومد|آمد|رسید|شدم|شدیم|شد|کرد|گرفت|داد)(?=$|[\s.!،؛:)»])/;
  function nums27(t) { return (dg(t).match(/\d+(?:[.٫/]\d+)?/g) || []).map(function (n) { return n.replace("٫", "."); }); }
  function probHit27(y, x) { try { var pb = y.prob; if (!pb || !A.STORY || !A.STORY.probs26) return 0; var se = S.get(pb.sess); if (!se) return 0; var P = A.STORY.probs26(se), me = P.filter(function (z) { return z.id === (pb.pid || pb.pk); })[0]; if (!me) return 0;
      var ws = stoks(x), mine = stoks(me.title + " " + me.stmt), oth = stoks(P.filter(function (z) { return z !== me; }).map(function (z) { return z.title + " " + z.stmt; }).join(" "));
      return ws.some(function (w) { return w.length >= 3 && mine.some(function (v) { return sameW(w, v); }) && !oth.some(function (v) { return sameW(w, v); }); }) ? 1 : 0; } catch (e) { return 0; } }
  function outcome27(s0, t, open, after) {
    if (!open.length) return null; var best = null, tie = false, bestN = 0, S0 = sentsOf25(t), units = S0.length > 1 ? S0.concat([S0.join(" ")]) : S0;
    units.forEach(function (x) { if (/[؟?]\s*$/.test(x) || /(?:^|[\s،])(?:اگه|اگر|شاید|کاش)(?![آ-ی])/.test(x)) return;
      var d = dg(x); if (!PAST27.test(d) && !GPAST27.test(d) && !/(?:^|[\s،«])ن?شد(?![آ-ی])/.test(d)) return; if (FUT27.test(d) && !PAST27.test(d) && !GPAST27.test(d)) return;
      open.forEach(function (y) { var py = y.text.replace(CONFX26, " "), nP = nums27(py), n = ovS(py, x) + nums27(x).filter(function (k) { return nP.indexOf(k) >= 0; }).length + probHit27(y, x) + (fv27(dg(py), d) ? 1 : 0) + (ovS(py, x) && cmp27(dg(py), d) ? 1 : 0);
        if (after ? n < 1 : n < 2) return; if (n > bestN) { bestN = n; best = { y: y, x: x }; tie = false; } else if (n === bestN && best && best.y !== y) tie = true; else if (n === bestN && best && best.y === y) best.x = x; }); });   /* هم‌امتیاز برای همان پیش‌بینی ⇒ واحدِ بزرگ‌تر (کلِ پیام: «… ۳۰٪. درست درومد.») */
    /* «خبرِ خوب: درست درومد!» بی واژه‌ای از هیچ‌کدام (بانکِ R27 #196): یک پیش‌بینیِ باز ⇒ همان؛ چند تا ⇒ «کدام؟» */
    if (!best && !after) { var xv = sentsOf25(t).filter(function (x) { return !/[؟?]\s*$/.test(x) && /(?:^|[\s،:!])(?:درست\s*(?:درومد|دراومد|درآمد|درنیومد|درنیامد)|غلط\s*(?:بود|درومد|دراومد))(?![آ-ی])/.test(dg(x)); })[0];
      if (xv) { var ov27 = /درنیومد|درنیامد|غلط/.test(xv) ? "نشد" : "شد";
        if (open.length === 1) { predApply26(s0, open[0], ov27, xv); sysLine25(s0, "🎯 " + predLab26(open[0]) + " ⇐ " + ov27 + " — به گفتهٔ خودت: «" + clip(xv, 80) + "»."); return open[0]; }
        s0.predAsk = { kind: "which", msg: String((userMsgs(s0).slice(-1)[0] || {}).at || ""), out: ov27, sent: clip(xv, 200), state: "open" };
        sysLine25(s0, "🎯 کدام پیش‌بینی؟ — " + open.slice(0, 4).map(predLab26).join(" · ") + ". درصدش یا چند واژه‌اش را بگو تا «" + ov27 + "» روی همان بنشیند — تا نگویی چیزی داوری نمی‌شود."); return s0.predAsk; } }
    if (!best) return null;
    if (after && open.length !== 1) return null;
    var lastAt = String((userMsgs(s0).slice(-1)[0] || {}).at || "");
    if (tie) { if (after) return null; s0.predAsk = { kind: "which", msg: lastAt, out: "", sent: clip(best.x, 200), state: "open" };
      sysLine25(s0, "🎯 کدام پیش‌بینی؟ — " + open.slice(0, 4).map(predLab26).join(" · ") + ". درصدش یا چند واژه‌اش را بگو تا نتیجه روی همان بنشیند — تا نگویی چیزی داوری نمی‌شود."); return s0.predAsk; }
    var y = best.y, py = dg(y.text.replace(CONFX26, " ")), x = dg(best.x).replace(DONEW27, function (m0, w0) { return new RegExp(w0).test(py) ? m0 : " "; });
    var out = "", ask = false;
    if (/درست\s*(?:درنیومد|درنیامد|نبود|نشد)|غلط\s*(?:بود|درومد|دراومد|درآمد|از\s*آب)|اشتباه\s*(?:بود|درومد|دراومد)/.test(x)) out = "نشد";
    else if (/درست\s*(?:درومد|دراومد|درآمد|بود|از\s*آب)|(?:همین|همون|همان)\s*شد(?![آ-ی])/.test(x)) out = "شد";
    else if (after && /(?:^|[\s،«])نشد(?![آ-ی])/.test(x)) out = "نشد"; else if (after && /(?:^|[\s،«])شد(?![آ-ی])/.test(x)) out = "شد";
    else { var nP = nums27(py), nX = nums27(x), ac = act27(py), cp27 = cmp27(py, x), fv = fv27(py, x), ng27 = /(?:^|[\s‌])ن(?:کرد|شد|داد|گرفت|اومد|آمد|رسید|زد|رفت|دوید|خرید|فروخت|موند|ماند|خوابید)/.test(x);
      if (cp27) out = cp27;   /* «بیشتر از ۱۲» ⇐ «۱۴ کیلو» ⇒ شد؛ «بالای ۳۰۰» ⇐ «۲۸۰» ⇒ نشد */
      /* عددِ دیگر (نه همان عددِ پیش‌بینی) ⇒ «حدود»/تفاوت را صفحه داوری نمی‌کند — می‌پرسد */
      else if (nP.length && nX.some(function (k) { return nP.indexOf(k) < 0; }) && nP.some(function (k) { return nX.indexOf(k) < 0; })) ask = true;
      else if (fv) out = fv === "no" ? "نشد" : "شد";   /* «لوله‌کش تا شنبه میاد» ⇐ «لوله‌کش اومد»؛ «قبول میشم» ⇐ «قبول نشدم» */
      else if (nP.length && nP.every(function (k) { return nX.indexOf(k) >= 0; }) && GPAST27.test(x)) out = ng27 ? "نشد" : "شد";   /* همان عددها، گزارشِ گذشته («۵ کیلومتر رو دویدم») */
      else if (ac) { var xs = x.replace(/‌/g, ""), at0 = xs.indexOf(ac);
        if (at0 >= 0) { var tail = xs.slice(at0 + ac.length, at0 + ac.length + 14); if (new RegExp("^\\s*ن" + LIGHT27).test(tail)) out = "نشد"; else if (new RegExp("^\\s*" + LIGHT27).test(tail)) out = "شد"; else ask = true; } else ask = true; }
      else ask = true; }
    if (ask || !out) { if (after) return null; s0.predAsk = { kind: "res", msg: lastAt, pred: String(y.at), sent: clip(best.x, 200), state: "open" };
      sysLine25(s0, "🎯 " + predLab26(y) + " — از حرفت («" + clip(best.x, 60) + "») برمی‌آید نتیجه‌اش معلوم شده: شد یا نشد؟"); return s0.predAsk; }
    predApply26(s0, y, out, best.x); sysLine25(s0, "🎯 " + predLab26(y) + " ⇐ " + out + " — به گفتهٔ خودت: «" + clip(best.x, 80) + "»."); return y;
  }
  PR.outcome27 = outcome27;

  /* ---------- دورِ ۲۸ (forecast R4؛ DECISIONS_R28 C90، C91؛ خانوادهٔ F4) ----------
     ریشه‌ها (نه وصلهٔ جمله‌ها):
     (۱) اطمینان فقط در چند قالبِ ثابت خوانده می‌شد (CONFX26) و جمله فقط با «،» بُریده می‌شد: «فکر کنم ۷۰ درصد …»، «… رو ۵۰ درصد می‌دم»، «…؛ ۷۰ درصد.»،
         «۸۰ درصد مطمئنم A و ۶۰ درصد مطمئنم B» بی 🎯 یا یک 🎯 ِ دوتکه می‌شدند؛ «تقریباً مطمئنم …» هیچ نمی‌ساخت. read28 هر جمله را می‌خواند: هر اطمینانِ عددی در هر جای بند،
         اطمینانِ تنها ⇒ ادعای بندِ پیشین، اطمینانِ گذشته («مطمئن بودم») یا کسِ دیگر («گفت»، «مطمئنه») ⇒ هیچ 🎯. متنِ 🎯 همان پیامد است: بی شمارنده، بی پیش‌واژه، بی خودِ اطمینان.
     (۲) «همان پیش‌بینی با عددِ تازه» فقط با متنِ یکسان شناخته می‌شد (claimN27)؛ same28 پیامدِ مشترک را با واژه‌ها و عددهای خودِ ادعا و نشانهٔ تازه‌کردن («الان»، «نه ۷۰») می‌شناسد.
     (۳) سرانجام با «یک بهترین» برای کلِ پیام و هم‌پوشانیِ واژه‌های عام (درصد، مطمئن …) داوری می‌شد: اصلاحِ داده، اطمینانِ پارسال و گلایه از صفحه «شد یا نشد؟» می‌گرفتند،
         «شد ۳» «شد» خوانده می‌شد و چند سرانجامِ یک پیام فقط یکی را می‌بست. outcome28 هر بند را جدا می‌سنجد، فقط با واژه/عددِ خودِ ادعا، و عددها را با عدد داوری می‌کند
         (verdict28: «بالای ۱۷» ⇐ ۱۸ ⇒ شد؛ ۴ ⇐ «شد ۳ تا» ⇒ نشد؛ «حداکثر ۱» ⇐ ۳ ⇒ نشد؛ «حدودِ ۸» ⇐ ۱۵ ⇒ می‌پرسد مگر خودش بگوید «خیلی بیشتر»). */
  var CONF28 = [new RegExp(CONFX26.source, "g"),
    /فکر\s*(?:می[‌\s]?)?کنم\s*(?:که\s*)?(\d{1,3})\s*(?:٪|%|درصد)(?!\s*(?:بشه|میشه|می[‌\s]?شه|درمیاد|درمی[‌\s]?آد|باشه|است|هست|ه(?![آ-ی])))(?:\s*که)?/g,
    /(?:(?:رو|را)\s+)?(\d{1,3})\s*(?:٪|%|درصد)\s*می[‌\s]?د(?:م|هم)(?![آ-ی])/g,
    /شانس(?:ش|ِ?\s*این\s*?که)?\s*(\d{1,3})\s*(?:٪|%|درصد)ه?|(\d{1,3})\s*(?:٪|%|درصد)\s*شانس\s*(?:دارم|داره|می[‌\s]?دم)?/g,
    /احتمال\s*می[‌\s]?د(?:م|هم)\s*(\d{1,3})\s*(?:٪|%|درصد)(?:\s*که)?/g, /(\d{1,3})\s*(?:٪|%|درصد)\s*(?:هم|رو|را)\s*(?:مطمئنم|مطمئن\s*(?:هستم|ام))/g,
    /* دورِ ۲۹ (forecast R5، C148 ⇐ C118؛ A29-4 «با ۲۲٪ افزایش میشه»، B29·D6 «با ۲۰٪ اصطکاک»، C29-9 «با ۵۵٪ میشه ۱۳۶۰ ÷ ۰٫۵۵»، D29-3 «با ۱۰ درصد پرت»،
       «۲۰ لیتر با ۱۰٪ یعنی ۲ لیتر نمک»، «با ده درصد برای درز»): «با N٪» فقط وقتی اطمینان است که اطمینان/احتمال پس از آن بیاید یا بند همان‌جا تمام شود
       («گفته بودم ۴ تا با ۷۰ درصد، شد ۳ تا»، «۶ روز با ۷۰ درصد؛»، «۴ از ۴ با ۹۰ درصد بود»، «همون‌طور که با ۹۰ درصد گفته بودم») — درصدی که نامِ کمیتی، فعلی یا «یعنی» پس از خودش دارد داده است */
    /(?:^|\s)با\s*(\d{1,3})\s*(?:٪|%|درصد)(?:\s*(?:اطمینان|احتمال)|(?=\s*(?:$|[.!،,؛:؟?»"()\-–—]|(?:گفته|گفتم|بود|بودم|پیش[‌\s]?بینی)(?![آ-ی]))))/g, /(\d{1,3})\s*(?:٪|%|درصد)\s*مطمئن\s*بودم/g, /(\d{1,3})\s*(?:٪|%|درصد)\s*مطمئن(?:ه|ن|است|اند)(?![آ-ی])/g];
  function confAll28(w) { var out = [];
    CONF28.forEach(function (re) { re.lastIndex = 0; var m; while ((m = re.exec(w))) { var n = /\d{1,3}/.exec(m[0]); if (n && +n[0] <= 100) out.push({ i: m.index, j: m.index + m[0].length, p: +n[0] }); if (!m[0].length) re.lastIndex++; } });
    out.sort(function (a, b) { return a.i - b.i || b.j - a.j; }); var keep = []; out.forEach(function (c) { if (!keep.some(function (k) { return c.i < k.j && c.j > k.i; })) keep.push(c); }); return keep; }
  var FUT28 = /(?:^|[\s‌])(?:ن?می[‌\s]?[آ-ی]{2,}|ن?میشه|ن?میاد|ن?میده|ن?میره|ن?میرم|خواهد|خواهم|قراره|ن?(?:بشه|بشن|بشم|بکنه|بکنم|بگیرم|بگیره|بره|برم|بیاد|بیان|بده|بدم|بمونه|بمونن|بشکنن|بشکنه|بخوره|برسه|برسم|باشه|باشن|کنه|کنن|شه|شن|بگیرن))(?=$|[\s.!،؛:)»])/;
  var OTH28 = /(?:^|[\s،])(?:گفت|گفتش|میگه|می[‌\s]?گه|می[‌\s]?گوید|می[‌\s]?گفت)(?![آ-ی])|مطمئن(?:ه|ن|است|اند)(?![آ-ی])/;
  /* C90 + C119: «تقریباً/خیلی مطمئنم» و «مطمئنم» ِ ساده، بی عدد، کنارِ پیامدی در آینده ⇒ یک بار پرسشِ عدد */
  var VAGUE28 = /(?:^|[\s،])((?:(?:تقریباً|تقریبا|خیلی|نسبتاً|نسبتا|کاملاً|کاملا|تا\s*حدی|حدوداً|حدودا)\s+)?مطمئنم)\s*(?:که\s*)?/;
  var LEAD28 = /^[^:]{0,50}پیش[‌\s]?بینی[^:]{0,30}:\s*/;
  var BARE28 = /^\s*(?:حدودِ?\s*)?(\d{1,3})\s*(?:٪|%|درصد)\s*[.!]?\s*$/, TAIL28 = /[؛،—–]\s*(?:حدودِ?\s*)?(\d{1,3})\s*(?:٪|%|درصد)\s*[.!]?\s*$/;
  function sents28(t) { return String(t || "").split(/(?<=[.!؟?])\s+|\n+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function qc28(x) { return /[؟?]\s*$/.test(x) || /(?:^|[\s،])(?:اگه|اگر|کاش)(?![آ-ی])/.test(x); }
  /* بندِ ادعا: اطمینان، شمارنده، پیش‌واژه و نشانهٔ تازه‌کردن از متن می‌روند — اطمینان کنارِ 🎯 جدا نشان داده می‌شود */
  function strip28(s) { var w = wpct(s); CONF28.forEach(function (re) { w = w.replace(new RegExp(re.source, "g"), " "); }); w = w.replace(/(?:^|\s)شاید\s*\d{1,3}\s*(?:٪|%|درصد)(?=\s)/g, " ");   /* C170 */
    return w.replace(/احتمال(?:ش|ِ?\s*این(?:\s*که|که)?)\s*(?:ه\s*)?(?:که)?/g, " ").replace(/(?:^|\s)ه\s*که(?=\s)/g, " ").replace(/\(\s*\)/g, " ").replace(/[،,]\s*نه\s*\d{1,3}\s*(?:٪|%|درصد)?\s*[.!]?\s*$/, " ").replace(/[؛،—–]\s*(?:حدودِ?\s*)?\d{1,3}\s*(?:٪|%|درصد)\s*[.!]?\s*$/, " ").replace(/(?:^|\s)ه(?=\s|$|[.!،؛])/g, " ").replace(/\s+/g, " ").trim(); }
  function clean28(s) { var x = strip28(s).replace(LEAD28, ""), k = 0, prev = null;
    while (prev !== x && k++ < 8) { prev = x; x = x.replace(/^[\s:،,؛.\-–—]+/, "").replace(ENUM27, "").replace(/^(?:و|ولی|اما|پس|یعنی|راستش|خب|حالا\s*که\s*فکر\s*می[‌\s]?کنم|حالا|الان(?:\s*دیگه)?|دیگه|هم)(?:[\s:،,]+|$)/, "")
      .replace(/^(?:دربارهٔ|درباره‌ی|دربارهٔ|درباره|برای)\s+[^:،]{1,30}?(?:\s*هم)?\s*:\s*/, "").replace(/^(?:[^\s:\d]+\s+){0,3}[^\s:\d]+\s*:\s+(?=\S+\s+\S+)/, "").replace(/^(?:فکر\s*(?:می[‌\s]?)?کنم|به\s*نظرم|حدس\s*می[‌\s]?زنم)(?:\s*که)?\s+/, "").replace(/^(?:باشه|آره|اوکی)(?:[\s،,]+|$)/, "").replace(/^[^.!؟?«»]{0,60}?(?:حدسم|حدسِ\s*من)\s*(?:اینه|این\s*است|:)\s*(?:که\s+)?(?=\S+\s+\S+)/, "").replace(VAGUE28, " ").replace(/^که\s+/, "").replace(/^به\s*این\s*(?:که|که)\s*/, "").replace(/^[‌\s]*ه\s+که\s+/, ""); }
    x = x.replace(/^پیش[‌\s]?بینی(?:م|ام)?(?:\s*(?:اینه|این\s*است))?\s*(?:که\s+)?(?=\S+\s+\S+)/, "").replace(/\s*ـ\s*ه\s*[.!]?\s*$/, "").replace(/[\s،,]*(?:حدودِ?|حدوداً|حدودا|تقریباً|تقریبا|با)\s*[.!]?\s*$/, "").replace(/\s*(?:رو|را)\s*$/, "").replace(/[\s،,؛:\-–—.!]+$/, "").replace(/\s+/g, " ").trim();
    return x.replace(/\d+(?:\.\d+)?/g, function (n) { return fa(n); }); }
  /* پیامِ او ⇒ بندهای پیش‌بینی: { raw (برای سنجش)، claim (متنِ 🎯)، p، kind: own|past|other، pure (فقط اطمینان، بی ادعا) }، پاسخ‌های عددیِ تنها { bare } و اطمینانِ بی‌عدد { vague } */
  function cnt28(x) { return norm(x).split(" ").filter(function (w) { return w && (/^\d+$/.test(w) || (w.length >= 2 && STOPW.indexOf(w) < 0)) && !/^(?:ـه|ه|ـ)$/.test(w); }).length; }
  function read28(t, msgPred) {
    var out = [], S = sents28(t);
    var claimOk = function (x) { return x && !qc28(x) && cnt28(strip28(x).replace(LEAD28, "")) >= 2 && !confAll28(wpct(x)).length; };
    /* دورِ ۲۹ (C170): 🎯 پیامدِ آینده و سنجیدنی است — احتمال برای فرضی دربارهٔ اکنون/گذشته («۷۰ درصد مطمئنم مدیرم … جلوی ترفیع منو گرفته»: فعلِ ماضیِ نقلی در پایانِ ادعا) 🎯 نمی‌سازد */
    var perf29 = function (raw) { var d = dg(strip28(raw)).replace(/[\s.!،؛]+$/, ""); return !FUT28.test(d) && /(?:^|\s)ن?[آ-ی]{1,8}(?:فته|شته|خته|سته|رده|یده|اده|وده|ته|ده)(?:\s*(?:است|ه|ان|اند))?$/.test(d) && !/(?:^|\s)(?:ن?می|ب)[آ-ی]*ده$/.test(d); };
    var item = function (raw, c, sIdx) { var cl = clean28(raw), k = past27(raw) || /مطمئن\s*بودم|بودم(?![آ-ی])/.test(raw) || perf29(raw) ? "past" : OTH28.test(dg(raw)) ? "other" : "own";
      var w = wpct(raw), np = /[،,]\s*نه\s*(\d{1,3})\s*(?:٪|%|درصد)?\s*[.!]?\s*$/.exec(w);
      out.push({ raw: raw, claim: cl, p: c.p, kind: k, pure: cnt28(cl) < 2, si: sIdx, notP: np ? +np[1] : null, upd: /(?:^|[\s،])(?:الان|حالا|دیگه|راستش|دیگر)(?![آ-ی])|[،,]\s*نه\s*\d/.test(dg(raw)) }); };
    S.forEach(function (s0, si) { var s = s0.replace(LEAD28, ""); if (/[؟?]\s*$/.test(s)) return;
      var w = wpct(s), C = confAll28(w);
      /* دورِ ۲۹ (forecast R5؛ B29·D17 dB2 p3 «۷۰ درصد مطمئنم ریدینگ ۷ میشه و ۵۰ درصد که لیسنینگ ۷٫۵ بشه»، C90): «و N درصد که <پیامدِ آینده>» پس از اطمینانِ خودش در همان
         جمله اطمینانِ دوم است — همان قالبِ «N درصد مطمئنم (که) …» با فعلِ اطمینانِ حذف‌شده — پس دو 🎯، هر کدام با عدد و متنِ خودش. بی اطمینانِ پیشین در همان جمله هرگز (C148: «۴۰ درصد که خیلی کمه» داده است) */
      /* دورِ ۲۹ (B29·D5 s19 c70، بانکِ R29 #215): اطمینانی که درونِ «…» نقل شده («مثل همون «۷۰ درصد مطمئنم» برای جلسه») نقلِ واژه است، نه اطمینانِ تازه — 🎯 نمی‌سازد
         (ادعای نقل‌شده با اطمینانِ بیرونِ گیومه — «"…" با ۶۵٪ اطمینان» — همچنان 🎯 است) */
      var QS29 = [], qm29, qre29 = /«[^«»]*»|"[^"]*"/g; while ((qm29 = qre29.exec(w))) QS29.push([qm29.index, qm29.index + qm29[0].length]);
      if (QS29.length) C = C.filter(function (c) { return !QS29.some(function (q) { return c.i > q[0] && c.j < q[1]; }); });
      var AND29 = /^(\d{1,3})\s*(?:٪|%|درصد)\s*(?:هم\s*)?که\s+/, and29 = false;
      /* دورِ ۲۹ (C170): «شاید N٪ <پیامدِ آینده>» (شاید + N٪ = باور) اطمینانِ خودش است — «شاید ۴۰٪ یادم بمونه»؛ «… یادم رفته بود — شاید ۴۰ درصد» (گذشته) نه */
      if (!C.length) { var sh29 = /(?:^|\s)شاید\s*(\d{1,3})\s*(?:٪|%|درصد)/.exec(w); if (sh29 && +sh29[1] <= 100 && FUT28.test(w.slice(sh29.index + sh29[0].length).split(/[.!؛،]/)[0]) && !past27(s)) C.push({ i: sh29.index, j: sh29.index + sh29[0].length, p: +sh29[1] }); }
      if (C.length) { var re29 = /\sو\s+(\d{1,3})\s*(?:٪|%|درصد)\s*(?:هم\s*)?که\s+/g, m29; while ((m29 = re29.exec(w))) { var i29 = m29.index, j29 = i29 + m29[0].length;
        if (+m29[1] <= 100 && C.some(function (c) { return c.j <= i29; }) && !C.some(function (c) { return i29 < c.j && j29 > c.i; }) && FUT28.test(w.slice(j29).split(/[.!؛،]/)[0])) { C.push({ i: i29, j: j29, p: +m29[1] }); and29 = true; } } }
      if (!C.length && qc28(s)) return;   /* شرط («اگه تاس رو ۶۰ بار بندازم … ۷۰ درصد مطمئنم») با اطمینانِ خودش پیش‌بینی است؛ بی اطمینان نه */
      /* «داداشم ۹۰ درصد مطمئنه ۲۳ تا بسه، من ۷۰ درصد» (بانکِ R28 #158): اطمینانِ دیگری مالِ او نیست؛ «من N درصد» ِ پایانی اطمینانِ خودش برای همان پیامد است */
      var mine = /[،,]?\s*(?:من|خودم)\s*(?:هم\s*)?(\d{1,3})\s*(?:٪|%|درصد)\s*[.!]?\s*$/.exec(w);
      if (mine && C.length === 1 && OTH28.test(dg(s))) { var oc = C[0], rest = w.slice(oc.j, mine.index); if (cnt28(rest) >= 2) { item(rest, { p: +mine[1] }, si); out[out.length - 1].kind = "own"; return; } }
      /* «احتمالِ قبولی تو دانشگاهِ اول ۷۰٪ و تو دومی ۹۵٪ ـه» (بانکِ R28 #148): برآوردِ خودش برای یک یا دو پیامد، هر کدام 🎯 ِ خودش */
      var ph = !C.length && !/مطمئن/.test(w) ? /^احتمالِ?\s+(\S+)\s+(.+?)\s*(\d{1,3})\s*(?:٪|%|درصد)(?:\s+و\s+(.+?)\s*(\d{1,3})\s*(?:٪|%|درصد))?\s*(?:ـ?\s*ه|است|هست)?\s*[.!]?$/.exec(w) : null;
      if (ph && !/(?:حدودِ?|تقریباً|تقریبا)\s*$/.test(ph[2]) && +ph[3] <= 100 && (!ph[5] || +ph[5] <= 100)) { item(ph[1] + " " + ph[2], { p: +ph[3] }, si); if (ph[4]) item(ph[1] + " " + ph[4], { p: +ph[5] }, si); return; }
      if (C.length >= 2) {
        /* چند اطمینان در یک جمله ⇒ تکه‌ها؛ تکه‌ای که فقط اطمینان است ادعایش تکهٔ بی‌اطمینانِ پیش از خودش است */
        var ch = s.split(/\s*[؛]\s*|\s*[،,]\s*|\s+[—–]\s+|\s+-\s+|\s+و\s+(?=[^\s]+(?:\s+و\s+[^\s]+)?\s*(?:٪|%|درصد)|احتمال|شانس|فکر\s*(?:می[‌\s]?)?کنم)/).map(function (x) { return x.replace(/^و\s+/, "").trim(); }).filter(Boolean), used = -1;
        ch.forEach(function (x, i) { var cc = confAll28(wpct(x)), a29 = and29 && !cc.length ? AND29.exec(wpct(x)) : null;
          if (a29 && +a29[1] <= 100 && !qc28(x)) { var r29 = wpct(x).slice(a29[0].length); if (cnt28(clean28(r29)) >= 2) { item(r29, { p: +a29[1] }, si); used = i; } return; }
          if (!cc.length || qc28(x)) return;
          if (cnt28(clean28(x)) < 2) { var j = i - 1; if (j <= used || j < 0 || !claimOk(ch[j])) return; item(ch[j] + "؛ " + x, cc[0], si); used = i; }
          else { item(x, cc[0], si); used = i; } });
        return; }
      if (C.length === 1) { if (cnt28(clean28(s)) < 2 && si > 0 && claimOk(S[si - 1])) { item(S[si - 1] + "؛ " + s, C[0], si); return; } item(s, C[0], si); return; }
      var tl = TAIL28.exec(w); if (tl && (msgPred || FUT28.test(s.slice(0, s.length - tl[0].length))) && FUT28.test(s) && toks(s.slice(0, s.length - tl[0].length)).length >= 2) { item(s, { p: +tl[1] }, si); return; }
      var bm = BARE28.exec(w); if (bm && +bm[1] <= 100) { if (si > 0 && claimOk(S[si - 1]) && FUT28.test(S[si - 1]) && !past27(S[si - 1]) && !out.some(function (z) { return z.si === si - 1; })) { item(S[si - 1] + "؛ " + s, { p: +bm[1] }, si); return; } out.push({ bare: +bm[1], si: si }); return; }
      var vm = VAGUE28.exec(s); if (vm && !/[٪%]|درصد/.test(w) && (FUT28.test(s.slice(vm.index + vm[0].length)) || (/\s/.test(vm[1]) && /(?:^|\s)(?:ن?یست|هست|است|ه)(?=$|[\s.!،؛])/.test(s.slice(vm.index + vm[0].length)))) && !past27(s) && cnt28(s.slice(vm.index + vm[0].length)) >= 2) out.push({ vague: vm[1], raw: s, claim: clean28(s), si: si }); });
    return out;
  }
  PR.read28 = read28;
  /* همان پیامد با عددِ تازه (C90/C77): پیش‌بینیِ بازی که ادعایش همین است — واژه‌ها و عددهای ادعا (نه اطمینان) — با نشانهٔ تازه‌کردن («الان»، «نه ۷۰») یا متنی تقریباً یکسان؛ فقط یک نامزد */
  /* دورِ ۲۹ (A29-16 s05 p27): «یعنی: …» بازگفتنِ همان پیش‌بینی است — واژهٔ پیامد نیست */
  var UPDW28 = /^(?:درباره|دربارهٔ|درباره‌ی|الان|حالا|دیگه|دیگر|راستش|پیش|بینی|بینیم|بینیِ|پیش‌بینی|پیش‌بینیِ|مطمئنم|مطمئن|درصد|احتمالش|احتمال|برای|نه|رو|را|تو|توی|هم|که|یعنی|و)$/;
  function stm28(w) { return w.replace(/^(?:ن?می|ب)(?=[آ-ی]{2})/, ""); }
  function same28(PD, o, at) {
    var mt = strip28(o.raw || "").replace(LEAD28, ""), A1 = stoks(mt).filter(function (w) { return !UPDW28.test(w); }), nN = nums27(mt).filter(function (k) { return o.notP == null || +k !== o.notP; });
    var sc = PD.filter(function (y) { return y && y.text && !y.out && String(y.at || "") !== String(at || ""); }).map(function (y) {
      var yc = strip28(y.text), B1 = stoks(yc), oN = nums27(yc), sh = A1.filter(function (w) { return B1.some(function (v) { return sameW(w, v) || sameW(stm28(w), stm28(v)) || (stm28(w) === stm28(v) && stm28(w).length >= 2); }); }).length, nsh = nN.filter(function (k) { return oN.indexOf(k) >= 0; }).length;
      if (claimN27(y.text) === claimN27(o.raw) && claimN27(y.text).length >= 6) return { y: y, n: 99 };
      if (nN.some(function (k) { return oN.indexOf(k) < 0; })) return { y: y, n: 0 };
      var miss = A1.length - sh, n = sh + nsh + (o.notP != null && predPct(y) === o.notP ? 2 : 0);
      var ok = (o.upd && (sh + nsh) >= 1 && n >= 2 && miss <= Math.max(1, Math.floor(A1.length * 0.3))) || (A1.length >= 2 && miss === 0 && sh >= 2);
      return { y: y, n: ok ? n : 0 }; }).filter(function (z) { return z.n > 0; }).sort(function (a, b) { return b.n - a.n; });
    return sc.length && (sc.length === 1 || sc[0].n > sc[1].n) ? sc[0].y : null;
  }
  PR.same28 = same28;
  /* ---- سرانجام (C91) ---- */
  var GEN28 = /^(?:شد|نشد|شدم|نشدم|بود|بودم|درصد|درصدی|درصدیم|مطمئن|مطمئنم|احتمال|احتمالش|پیش|بینی|بینیم|بینیِ|گفته|گفتم|درست|غلط|درومد|اومد|گرفتم|حدود|حدودِ|الان|خب|سلام|امروز|دیروز|اون|همون|همان|یکی|پس|ولی|اما|خبر|خوب)$/;
  function kt28(t) { return stoks(strip28(t)).filter(function (w) { return !GEN28.test(w); }); }
  /* بندی که هرگز سرانجامِ 🎯 نیست: اصلاحِ حرفِ پیشین، اطمینانِ زمانی پیش از این پیش‌بینی، «هنوز … نه» */
  /* دورِ ۲۹ (forecast R5؛ بانکِ R29 #216، C142): «X نیست، Y» / «X نبود، Y بود» / «X نمیشه، Y میشه» اصلاحِ داده است — هرگز سرانجامِ 🎯 نیست و «شد یا نشد؟» نمی‌سازد */
  var EXC28 = /(?:^|[\s،])\d+(?:[.٫]\d+)?(?:\s*[آ-ی]{1,12})?\s*(?:نیست|نبود|نمیشه|نمی[‌\s]?شه)\s*[،,؛]\s*(?:[آ-ی]{1,12}\s*)?\d|(?:اشتباه|غلط)\s*(?:کردم|گفتم|نوشتم|زدم)|اصلاح\s*(?:کنم|می[‌\s]?کنم)|اولش\s*گفتم|(?:^|[\s،])(?:پارسال|پیرارسال)(?![آ-ی])|سالِ?\s*(?:پیش|قبل|گذشته)|دفعهٔ?\s*(?:پیش|قبل)|هنوز\s*[^.!؟?،]{0,30}ن(?:گرفتم|کردم|شده|اومده|رسیده|دادم|زدم)/;
  function refN28(d) { var r = [], re = /(?:پیش[‌\s]?بینی(?:ِ|ی|م|ام)?(?:\s*(?:اولم|دومم|من))?\s*(?:که\s*)?|گفته\s*بودم\s*)(\d+(?:[.٫]\d+)?)/g, m; while ((m = re.exec(d))) r.push(m[1].replace("٫", ".")); return r; }
  function score28(y, u, solo) {
    var yc = strip28(y.text), d = dg(u), K = kt28(yc), U1 = kt28(u), sh = K.filter(function (w) { return U1.some(function (v) { return sameW(w, v); }); }).length;
    var ny = nums27(yc), nu = nums27(strip28(u)), nsh = nu.filter(function (k) { return ny.indexOf(k) >= 0; }).length, rf = refN28(d);
    if (rf.length && ny.length && !rf.some(function (k) { return ny.indexOf(k) >= 0; })) return 0;   /* «پیش‌بینیِ اولم که ۲۲ کارتن …» ⇐ پیش‌بینیِ ۲۳ نیست */
    var pc = predPct(y), pr = pc != null && new RegExp("(?:^|[^\\d])" + pc + "\\s*(?:٪|%|درصد)").test(wpct(u)) ? 2 : 0;
    var rh = rf.length && rf.some(function (k) { return ny.indexOf(k) >= 0; }) ? 2 : 0;   /* «پیش‌بینیم ۱ بود» عددِ خودِ همین ادعا را نام می‌برد */
    var vd = /درست\s*(?:درومد|دراومد|درآمد|بود|درنیومد|نبود)|(?:غلط|اشتباه)\s*(?:بود|درومد|دراومد)/.test(d) ? 1 : 0;
    var dw = /(?:^|[\s،«])(حل|تموم|تمام|ثبت|انجام|قبول|رد|تحویل|تأیید|تایید)\s*(?:هم\s*)?ن?(?:شد|شدم|کردم|کرد|دادم|داد)(?![آ-ی])/.exec(d), dn = dw && new RegExp("(?:^|[\\s‌])" + dw[1] + "(?![آ-ی])").test(dg(yc)) ? 1 : 0;
    var sv = 0; if (solo) { var v0 = val28(d); if (v0 && (cmp28(dg(yc)) || (v0.u && ny.some(function (k) { return new RegExp(k.replace(".", "\\.") + "\\s*" + v0.u).test(dg(yc)); })))) sv = 2; }
    var n = sh + nsh + pr + rh + vd + dn + sv + probHit27(y, u) + (sh && fv27(dg(yc), d) ? 1 : 0);
    return (sh + nsh >= 1 || pr || rh || sv) && (n >= 2 || (solo && sh >= 1)) ? n : 0;   /* تنها پیش‌بینیِ باز: یک واژهٔ خودِ ادعا بس است */
  }
  var RES28 = "(?:شد|شدم|شدیم|شده|گرفتم|گرفت|گرفتیم|گرفتن|اومد|آمد|درومد|دراومد|درآمد|رسید|رسیدم|داد|دادن|دادم|موند|ماند|بود)";
  function val28(d) { var x = dg(d).replace(/٫/g, ".").replace(/(\d+)\s*و\s*نیم(?![آ-ی])/g, "$1.5").replace(/(\d+)\s*و\s*ربع(?![آ-ی])/g, "$1.25").replace(/(?:پیش[‌\s]?بینی(?:ِ|ی|م|ام)?|گفته\s*بودم|فکر\s*می[‌\s]?کردم)[^،؛.!]{0,30}/g, " ");
    CONF28.forEach(function (re) { x = x.replace(new RegExp(re.source, "g"), " "); }); x = x.replace(/\d+\s*(?:٪|%|درصد)ی(?:م|ه)?/g, " ");
    var V = [], m, b = new RegExp("(?:^|[\\s‌:،])" + RES28 + "\\s*:?\\s*(\\d+(?:\\.\\d+)?)", "g"), a = new RegExp("(\\d+(?:\\.\\d+)?)\\s*(?:[آ-ی‌]{1,10}\\s+){0,3}?" + RES28 + "(?![آ-ی])", "g");
    while ((m = b.exec(x))) V.push({ v: m[1], u: (/^\s*([آ-ی]{1,8})/.exec(x.slice(m.index + m[0].length)) || [])[1] || "" });
    if (!V.length) while ((m = a.exec(x))) V.push({ v: m[1], u: (/^\s*([آ-ی]{1,8})/.exec(x.slice(m.index + m[1].length)) || [])[1] || "" });
    var dv = V.filter(function (z, i) { return V.map(function (q) { return q.v; }).indexOf(z.v) === i; }); return dv.length === 1 ? dv[0] : null; }
  function cmp28(py) { var m = /(بیشتر\s*از|بیش\s*از|بالای|بالاتر\s*از|دست[‌\s]?کم|حداقل|کمتر\s*از|زیرِ?|پایین[‌\s]?ترِ?\s*از|حداکثر|نهایتاً|نهایتا)\s*(\d+(?:\.\d+)?)/.exec(py);
    if (m && !/زیر/.test(m[1]) || m && !/(?:^|[\s‌])ن(?:گیره|گیرن|شه|کنه|یاد)(?![آ-ی])/.test(py)) return m ? { op: /بیشتر|بیش|بالا/.test(m[1]) ? ">" : /دست|حداقل/.test(m[1]) ? ">=" : /حداکثر|نهایت/.test(m[1]) ? "<=" : "<", n: +m[2] } : null;
    var r = /به\s*(\d+(?:\.\d+)?)\s*(?:[آ-ی‌]{1,8}\s*)?(?:می[‌\s]?)?(?:رسه|رسد|رسیم|رسن)(?![آ-ی])|(\d+(?:\.\d+)?)\s*(?:[آ-ی‌]{1,8}\s*)?یا\s*بیشتر/.exec(py); if (r) return { op: ">=", n: +(r[1] || r[2]) };
    return null; }
  var APPROX28 = /(?:^|[\s‌])(?:حدودِ?|حدوداً|حدودا|تقریباً|تقریبا|نزدیکِ?|کمابیش|اینا)(?![آ-ی])/;
  function verdict28(y, x) {
    var py = dg(strip28(y.text)).replace(/٫/g, ".");
    /* «حل شد / تموم شد / ثبت شد» سرانجامِ کارِ دیگری است مگر خودِ ادعا دربارهٔ همان کار باشد (C53، بانکِ R27 #218) */
    var d = dg(x).replace(DONEW27, function (m0, w0) { return new RegExp(w0).test(py) ? m0 : " "; });
    if (/درست\s*(?:درنیومد|درنیامد|نبود|نشد)|(?:غلط|اشتباه|نادرست)\s*(?:بود|درومد|دراومد|درآمد|از\s*آب)/.test(d)) return "نشد";
    if (/درست\s*(?:درومد|دراومد|درآمد|بود|از\s*آب)|(?:همین|همون|همان)\s*شد(?![آ-ی])|پیش[‌\s]?بینی[^.!؟?،]{0,40}\s+(?:درست\s*)?شد(?![آ-ی]|\s*[0-9۰-۹])/.test(d)) return "شد";
    var v = val28(d), c = cmp28(py), NP = nums27(py);
    /* یکای مقدار باید یکای عددِ ادعا باشد («۸ ثانیه بود» گزارشِ «حدودِ ۸ درصد» نیست) — وگرنه عددِ هم‌یکا از همان گزارش */
    var pu28 = NP.length ? (/^\s*([آ-ی]{2,10})/.exec(py.slice(py.indexOf(NP[0]) + NP[0].length)) || [])[1] || "" : "";
    var verb28 = function (w) { return !w || new RegExp("^" + RES28 + "$").test(w) || /^(?:ن?می|ب|ن)[آ-ی]{3,}$/.test(w) || /^(?:شدم|شده|میشم|میشه|بشم|بشه|گرفتم|بگیرم|درمیاد)$/.test(w); };
    if (v && v.u && pu28 && !verb28(v.u) && !verb28(pu28) && !/^(?:تا|عدد|دونه|دانه)$/.test(pu28) && !/^(?:تا|عدد|دونه|دانه)$/.test(v.u) && v.u !== pu28 && !sameW(v.u, pu28)) { var uu = (d.replace(/٫/g, ".").match(new RegExp("\\d+(?:\\.\\d+)?\\s*" + pu28, "g")) || []).map(function (z) { return /\d+(?:\.\d+)?/.exec(z)[0]; }); v = uu.length === 1 ? { v: uu[0], u: pu28 } : null; }
    if (!v && c) { var nx28 = nums27(strip28(d)).filter(function (k) { return +k !== c.n && NP.indexOf(k) < 0; }); if (nx28.length === 1) v = { v: nx28[0], u: "" }; }   /* «۲۸۰ تا فروختیم» ⇐ «بالای ۳۰۰» */
    if (v && c) { var a = +v.v; return (c.op === ">" ? a > c.n : c.op === ">=" ? a >= c.n : c.op === "<=" ? a <= c.n : a < c.n) ? "شد" : "نشد"; }
    /* C120: «حدودِ N» تلورانسِ ساختگی نمی‌گیرد — برابر ⇒ شد؛ هر مقدارِ دیگر ⇒ صفحه می‌پرسد «این حدودِ N حساب می‌شود؟» (approx28) */
    if (v && NP.length && !c) { if (APPROX28.test(py)) { var am = new RegExp("(?:حدودِ?|حدوداً|حدودا|تقریباً|تقریبا|نزدیکِ?)\\s*(\\d+(?:\\.\\d+)?)").exec(py); return am && +am[1] === +v.v ? "شد" : ""; }
      var tg = null; if (v.u) { var um = new RegExp("(\\d+(?:\\.\\d+)?)\\s*" + v.u.replace(/[^آ-ی]/g, "")).exec(py); if (um) tg = um[1]; } if (tg == null && NP.length === 1) tg = NP[0]; if (tg == null) { var rf29 = refN28(d).filter(function (k) { return NP.indexOf(k) >= 0; }); if (rf29.length === 1) tg = rf29[0]; }   /* دورِ ۲۹ (pwC2 p? «کوییزِ فصلِ ۵ رو دادم: پیش‌بینیم ۱ بود، شد ۳»): عددی که خودش «پیش‌بینیم N» نامید */
      if (tg != null) return +v.v === +tg ? "شد" : "نشد"; }
    var fv = fv27(py, d); if (fv) return fv === "no" ? "نشد" : "شد";
    var dw = /(?:^|[\s،«])(حل|تموم|تمام|ثبت|انجام|قبول|تحویل|تأیید|تایید)\s*(?:هم\s*)?(ن?)(?:شد|شدم|کردم|کرد|دادم|داد)(?![آ-ی])/.exec(d); if (dw && new RegExp("(?:^|[\\s‌])" + dw[1] + "(?![آ-ی])").test(py)) return dw[2] ? "نشد" : "شد";
    return "";
  }
  PR.verdict28 = verdict28;
  /* دورِ ۲۹ (بانکِ R29 #187 «ریاضی ۱۸ شدم، فیزیک ۱۵»): تکهٔ عددیِ بی‌فعل در جمله‌ای که فعلِ سرانجام دارد — فقط عدد با عدد داوری می‌شود
     (بالای/کمتر از ⇒ مقایسه؛ «حدودِ N» ⇒ برابر شد وگرنه پرسشِ C120؛ یک عددِ ادعا ⇒ برابری)؛ هرگز از واژه‌ای که فعلش را تکهٔ دیگر داشت */
  function vb29(y, x) { var py = dg(strip28(y.text)).replace(/٫/g, "."), NP = nums27(py), V = nums27(strip28(dg(x)).replace(/٫/g, ".")).filter(function (k) { return true; }); if (V.length !== 1 || !NP.length) return "";
    var v = +V[0], c = cmp28(py); if (c) return (c.op === ">" ? v > c.n : c.op === ">=" ? v >= c.n : c.op === "<=" ? v <= c.n : v < c.n) ? "شد" : "نشد";
    if (APPROX28.test(py)) { var am = /(?:حدودِ?|حدوداً|حدودا|تقریباً|تقریبا|نزدیکِ?)\s*(\d+(?:\.\d+)?)/.exec(py); return am && +am[1] === v ? "شد" : ""; }
    return NP.length === 1 ? (+NP[0] === v ? "شد" : "نشد") : ""; }
  /* «حدودِ N» با مقدارِ دیگری در گزارش ⇒ متنِ پرسشِ C120 (وگرنه «شد یا نشد؟» ِ همیشگی) */
  function approx28(y, x) { var py = dg(strip28(y.text)).replace(/٫/g, "."), v = val28(dg(x)), am = /(?:حدودِ?|حدوداً|حدودا|تقریباً|تقریبا|نزدیکِ?)\s*(\d+(?:\.\d+)?)/.exec(py);
    if (!am) return ""; var un = (/^\s*([آ-ی]{2,10})/.exec(py.slice(am.index + am[0].length)) || [])[1] || ""; if (un && (FUT28.test(" " + un + " ") || new RegExp("^" + RES28 + "$").test(un))) un = "";   /* دورِ ۲۹ (dB2 p13 «حدودِ ۶٫۵ میشه» ⇐ «رایتینگ ۶ شد»): فعل یکا نیست */
    var vv = v && (!un || !v.u || v.u === un || sameW(v.u, un)) ? v.v : "";
    if (!vv && un) { var um = (dg(x).replace(/٫/g, ".").match(new RegExp("\\d+(?:\\.\\d+)?\\s*" + un, "g")) || []).map(function (z) { return /\d+(?:\.\d+)?/.exec(z)[0]; }).filter(function (k) { return +k !== +am[1]; }); if (um.length === 1) vv = um[0]; } if (!vv) return ""; return "این " + fa(vv) + " «حدودِ " + fa(am[1]) + "» حساب می‌شود؟ (آره ⇒ شد · نه ⇒ نشد)"; }
  PR.approx28 = approx28;
  function chunks28(s) { return s.split(/\s*[؛]\s*|\s*[،,]\s*|\s+(?:ولی|اما)\s+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  /* دورِ ۲۹ (بانکِ R29 #215 «برگردیم به کارتن‌های پارکت»): «برگردیم/بگردیم/بریم» پیشنهادِ رفتن است، نه گزارشِ گذشته (GPAST27 «…ردیم» را گذشته می‌خواند) */
  /* دورِ ۲۹ (dB2 p5 «شنبه آزمونِ آزمایشیه و فقط نمره‌ش رو پیش‌بینی کردم» ⇒ «شد یا نشد؟»): «پیش‌بینی کردم / کرده بودم» ارجاع به خودِ پیش‌بینی است، نه گزارشِ سرانجام */
  function isRep28(x) { var d = dg(x).replace(/پیش[‌\s]?بینی(?:ش|اش)?\s*(?:(?:رو|را)\s*)?(?:کردم|کرده\s*بودم|کرده\s*بودیم|کردیم)(?![آ-ی])/g, " ").replace(/(?:^|[\s‌])(?:بر)?(?:ب|ن)?گردیم(?![آ-ی])|(?:^|[\s‌])بریم(?![آ-ی])/g, " "); if (qc28(x) || EXC28.test(d)) return false; if (!PAST27.test(d) && !GPAST27.test(d) && !/(?:^|[\s‌])ن?[آ-ی]{2,}(?:ست|شت|خت|فت|رد|ید|اد)(?=$|[\s.!،؛])/.test(d) && !/(?:^|[\s،«])ن?شد(?![آ-ی])/.test(d) && !/درست\s*(?:درومد|دراومد|درآمد|بود)|غلط\s*(?:بود|درومد)/.test(d)) return false;
    if (FUT28.test(d) && !PAST27.test(d) && !GPAST27.test(d)) return false; if (/مطمئن\s*بودم/.test(d) && !confAll28(wpct(x)).length) return false; return true; }
  /* هر جمله (و در صورتِ دو نامزد، هر تکه) جدا: یک نامزد ⇒ داوریِ همان؛ چند نامزدِ برابر ⇒ «کدام؟» فقط میانِ همان‌ها؛ داوری‌نشدنی ⇒ یک بار «شد یا نشد؟» */
  function outcome28(s0, t, open, after) {
    /* دورِ ۲۹ (dB2 p11 ✏️ «[اصلاحِ پیامِ قبلی] … متنِ درستِ پیامم: «…»» ⇒ «شد یا نشد؟»؛ C91/C144): پیامِ ✏️ متنِ کهنه را نقل می‌کند و هرگز سرانجامِ 🎯 نیست */
    if (/^\s*\[اصلاحِ/.test(String(t || ""))) return null;
    /* دورِ ۲۹ (B29·D4، dB2 p21): سرانجام فقط برای 🎯 — پیش‌بینیِ بی‌عددی که 🎯 نشد (پرسشِ عددش بی‌جواب ماند) نامزدِ داوری نیست */
    open = open.filter(function (y) { return y && (y.p != null || y.fc || y.fc0); });
    if (!open.length) return null; var hits = [], tie = null;
    var add = function (y, u) { var h = hits.filter(function (z) { return z.y === y; })[0]; if (h) h.u.push(u); else hits.push({ y: y, u: [u] }); };
    /* دورِ ۲۹ (A29-24 pA3 c60 «۷٫۲ متر مربع = ۷۲۰۰۰ سانتی‌متر مربع»؛ بانکِ R29 #216): تبدیلِ واحد (عدد و واحد = عدد و واحد، بی عملگر) گزارشِ سرانجام نیست — از جمله کنار می‌رود */
    var CONV29 = /(?:^|[\s:،])[0-9۰-۹]+(?:[.٫][0-9۰-۹]+)?\s*(?:[آ-ی][آ-ی‌]*\s*){1,3}=\s*[0-9۰-۹]+(?:[.٫,][0-9۰-۹]+)*\s*(?:[آ-ی][آ-ی‌]*\s*){0,3}(?=$|[.!،؛])/g;
    sents28(t).forEach(function (s) { s = s.replace(CONV29, " ").trim(); if (!s || !isRep28(s)) return;
      var sc = open.map(function (y) { return { y: y, n: score28(y, s, open.length === 1) }; }).filter(function (z) { return z.n > 0; }).sort(function (a, b) { return b.n - a.n; });
      var VD28 = /درست\s*(?:درومد|دراومد|درآمد|بود|درنیومد|نبود)|(?:غلط|اشتباه)\s*(?:بود|درومد|دراومد)/g, nv = (dg(s).match(VD28) || []).length;
      if (nv >= 2) { chunks28(s).forEach(function (c) { var cs = open.map(function (y) { return { y: y, n: score28(y, c, false) }; }).filter(function (z) { return z.n > 0; }).sort(function (a, b) { return b.n - a.n; }); if (cs.length && (cs.length === 1 || cs[0].n > cs[1].n)) add(cs[0].y, c); }); return; }
      /* دورِ ۲۹ (B29·D17 dB2 p21 «ریدینگ ۷ شد، لیسنینگ ۷ شد»؛ بانکِ ۶۷): یک جمله با سرانجامِ چند 🎯 — هر نامزدی که واژهٔ یکتای خودش (در هیچ نامزدِ دیگری نیست) در جمله
         آمده است سرانجامِ خودش را از تکهٔ خودش می‌گیرد؛ «بهترین نامزد» برای کلِ جمله نامزدِ دیگر را بی‌داوری می‌گذاشت */
      var uq29 = sc.filter(function (z) { var K = kt28(z.y.text), U1 = kt28(s); return K.some(function (w) { return !/^\d/.test(dg(w)) && U1.some(function (v) { return sameW(w, v); }) && !open.some(function (o) { return o !== z.y && kt28(o.text).some(function (v) { return sameW(w, v); }); }); }); });
      var multi29 = uq29.length >= 2;
      if (!sc.length) return; if (!multi29 && (sc.length === 1 || (sc[0].n >= 2 * sc[1].n && sc[0].n - sc[1].n >= 2))) { add(sc[0].y, s); return; }
      var cand = sc.map(function (z) { return z.y; }), last = null, got = [];
      chunks28(s).forEach(function (c) { var cs = cand.map(function (y) { return { y: y, n: score28(y, c, multi29 && uq29.some(function (z) { return z.y === y; })) }; }).filter(function (z) { return z.n > 0; }).sort(function (a, b) { return b.n - a.n; });
        if (cs.length && (cs.length === 1 || cs[0].n > cs[1].n)) { last = cs[0].y; got.push([last, c]); } else if (!cs.length && last) got.push([last, c]); else if (cs.length) last = null; });
      var gy = got.map(function (g) { return g[0]; }).filter(function (y, i, X) { return X.indexOf(y) === i; });
      if (gy.length >= 1 && got.length) got.forEach(function (g) { add(g[0], g[1]); if (multi29 && /(?:^|[\s،])ن?(?:شد|شدم|شدیم|شدن|گرفتم|گرفت|اومد|آمد)(?![آ-ی])/.test(dg(s))) hits.filter(function (h) { return h.y === g[0]; })[0].vs = true; }); else if (!tie) tie = { c: cand.filter(function (y) { return sc.filter(function (z) { return z.y === y && z.n === sc[0].n; }).length; }), s: s }; });
    var lastAt = String((userMsgs(s0).slice(-1)[0] || {}).at || ""), done = null, askRes = null;
    hits.forEach(function (h) { var x = h.u.join(" "), out = verdict28(h.y, x) || (hits.length === 1 && !tie ? verdict28(h.y, t) : "") || (h.vs && /\d/.test(dg(x)) && !/(?:^|[\s،])ن?(?:شد|شدم|شدیم|شدن|گرفتم|گرفت|اومد|آمد)(?![آ-ی])/.test(dg(x)) ? vb29(h.y, x) : "");   /* دورِ ۲۹ (بانکِ R29 #187 «ریاضی ۱۸ شدم، فیزیک ۱۵»): فعلِ تکهٔ همسایه برای تکهٔ عددیِ بی‌فعل */   /* «… ۳۰٪. درست درومد.» — داوریِ جملهٔ بعد مالِ همان تنها نامزد */
      if (out) { predApply26(s0, h.y, out, x); sysLine25(s0, "🎯 " + predLab26(h.y) + " ⇐ " + out + " — به گفتهٔ خودت: «" + clip(x, 80) + "»."); done = h.y; } else if (!askRes) askRes = h; });
    if (askRes && !after) { s0.predAsk = { kind: "res", msg: lastAt, pred: String(askRes.y.at), pkey: String(askRes.y.key || ""), sent: clip(askRes.u.join(" "), 200), state: "open" };
      var ax28 = approx28(askRes.y, askRes.u.join(" ")); if (ax28) s0.predAsk.approx = true;
      sysLine25(s0, "🎯 " + predLab26(askRes.y) + " — از حرفت («" + clip(askRes.u.join(" "), 60) + "») برمی‌آید نتیجه‌اش معلوم شده: " + (ax28 || "شد یا نشد؟")); return s0.predAsk; }
    if (!done && tie && !after) { var tv = verdict28({ text: "" }, tie.s); s0.predAsk = { kind: "which", msg: lastAt, out: tv, sent: clip(tie.s, 200), state: "open", cand: tie.c.map(function (y) { return String(y.at) + "|" + (y.key || ""); }) };
      sysLine25(s0, "🎯 کدام پیش‌بینی؟ — " + tie.c.slice(0, 4).map(predLab26).join(" · ") + ". درصدش یا چند واژه‌اش را بگو تا " + (tv ? "«" + tv + "»" : "نتیجه") + " روی همان بنشیند — تا نگویی چیزی داوری نمی‌شود."); return s0.predAsk; }
    if (done) return done;
    /* «خبرِ خوب: درست درومد!» بی واژه‌ای از هیچ‌کدام (بانکِ R27 #196) — همان راهِ outcome27 */
    if (!hits.length && !tie) return genVerdict28(s0, t, open, after);
    return null;
  }
  function genVerdict28(s0, t, open, after) { if (after) return null;
    var xv = sents28(t).filter(function (x) { return !qc28(x) && !EXC28.test(dg(x)) && /(?:^|[\s،:!])(?:درست\s*(?:درومد|دراومد|درآمد|درنیومد|درنیامد)|غلط\s*(?:بود|درومد|دراومد))(?![آ-ی])/.test(dg(x)); })[0]; if (!xv) return null;
    var ov = /درنیومد|درنیامد|غلط/.test(xv) ? "نشد" : "شد", pc = pctOf(xv), C = pc != null ? open.filter(function (y) { return predPct(y) === pc; }) : open; if (!C.length) C = open;
    if (C.length === 1) { predApply26(s0, C[0], ov, xv); sysLine25(s0, "🎯 " + predLab26(C[0]) + " ⇐ " + ov + " — به گفتهٔ خودت: «" + clip(xv, 80) + "»."); return C[0]; }
    s0.predAsk = { kind: "which", msg: String((userMsgs(s0).slice(-1)[0] || {}).at || ""), out: ov, sent: clip(xv, 200), state: "open", cand: C.map(function (y) { return String(y.at) + "|" + (y.key || ""); }) };
    sysLine25(s0, "🎯 کدام پیش‌بینی؟ — " + C.slice(0, 4).map(predLab26).join(" · ") + ". درصدش یا چند واژه‌اش را بگو تا «" + ov + "» روی همان بنشیند — تا نگویی چیزی داوری نمی‌شود."); return s0.predAsk; }
  PR.outcome28 = outcome28;
  /* پاسخ به پرسشِ پیشینِ صفحه (C91): «شد یا نشد؟» فقط با داوریِ صریح در آغازِ پیام یا گزارشِ همان پیامد پاسخ می‌گیرد؛ «کدام؟» فقط با درصد، نام یا ارجاع —
     جملهٔ تازهٔ بی‌ربط (برنامهٔ تازه، اصلاح، گلایه از صفحه) پاسخ نیست و هیچ‌چیز را داوری نمی‌کند (D28-3، D28-9، B28·D2) */
  function ansRes28(y, t) { var d = dg(t).trim(), m = /^(?:(?:آره|بله|آری|نه)[\s،,!]*)?(نشد|شد|درست\s*(?:درومد|دراومد|درآمد|بود)|غلط\s*(?:بود|درومد|دراومد)|درست\s*(?:درنیومد|درنیامد|نبود))(?=\s*(?:[.!،؛]|$|\s+(?:و|ولی|اما|چون)\s))/.exec(d);
    if (m) return /نشد|غلط|درنیومد|درنیامد|نبود/.test(m[1]) ? "نشد" : "شد";
    if (EXC28.test(d)) return ""; if (score28(y, t) > 0 || ovS(strip28(y.text), t) >= 2) return verdict28(y, t); return ""; }
  PR.ansRes28 = ansRes28;
  function ansWhich28(t, C) { var d = dg(t), pc = pctOf(t); if (pc != null && C.some(function (y) { return predPct(y) === pc; })) return true;
    if (EXC28.test(d)) return false; var ref = /(?:^|[\s،])(?:مالِ?|منظورم|رو\s*میگم|را\s*می[‌\s]?گویم|همون\s*که|اون\s*که|پیش[‌\s]?بینیِ)(?![آ-ی])/.test(d);
    if (!ref && FUT28.test(d)) return false;   /* بانکِ R28 #168، D28-3: برنامهٔ تازه («قسطِ آخرِ حصار رو سرِ برج میدم») پاسخِ «کدام؟» نیست */
    if (toks(t).length <= 6) return true;
    return /(?:^|[\s،])(?:مالِ?|منظورم|رو\s*میگم|را\s*می[‌\s]?گویم|همون\s*که|اون\s*که|پیش[‌\s]?بینیِ)(?![آ-ی])/.test(d) && !FUT28.test(d.replace(/پیش[‌\s]?بینی[^\s]*/g, " ")); }
  PR.ansWhich28 = ansWhich28;
  PR.predVerdict = function (s0) {
    var U = userMsgs(s0), m = U[U.length - 1]; if (!m) return null; var t = String(m.text || ""), at = String(m.at || ""), C = (s0 && s0.coach) || {};
    var all = (C.preds || []).filter(function (y) { return y && y.text && String(y.at || "") !== at; }), Q = s0.predAsk, did = null;
    var pick = function (said, pc) { var keep = C.preds; C.preds = all; var r = null; try { r = PR.predFor(s0, said, pc, false); } catch (e) { } C.preds = keep; return r; };
    /* پاسخ به پرسشِ پیشینِ صفحه */
    if (Q && Q.state === "open" && Q.msg !== at) { Q.state = "closed"; did = Q;
      /* دورِ ۲۷ (story R5، C53؛ D27-13 pwD1 p7): «… حل شد» / «تموم شد» / «ثبت شد» سرانجامِ کارِ دیگری است، نه «شد» ِ این پیش‌بینی — مگر خودِ پیش‌بینی دربارهٔ همان کار باشد
         (پیش‌تر «به نظرم این دیگه حل شد» 🎯 ِ «درصدِ فراموشی حدودِ ۸ درصد» را «شد» بست؛ واقعیت ۱۵٪ بود) */
      var qx27 = Q.kind === "res" ? (all.filter(function (y) { return String(y.at) === String(Q.pred); })[0] || {}).text || "" : all.map(function (y) { return y.text; }).join(" ");
      var t27 = dg(t).replace(/(?:^|[\s،«])(حل|تموم|تمام|بسته|باز|ثبت|عوض|اصلاح|انجام|حساب|معلوم|روشن|شروع|خراب|پیدا|قطعی|تعطیل)\s*(?:هم\s*)?(ن?شد)(?![آ-ی])/g, function (m0, w0) { return new RegExp(w0).test(dg(qx27)) ? m0 : " "; });
      var d0 = t27, no =/(?:^|[\s،«])(?:نشد|غلط|اشتباه|نادرست|رد\s*شد|درست\s*(?:نبود|درنیومد|درنیامد|نشد))(?![آ-ی])/.test(d0), ok = !no && /(?:^|[\s،«])(?:شد|درست|تأیید|تایید)(?![آ-ی])/.test(d0);
      /* دورِ ۲۸ (forecast R4، C91؛ D28-3 arD2 p10، D28-8 oD1 p13، B28·D2 oB1 c31، B28·D2 dB1 p14): پاسخ فقط وقتی پاسخ است — «شد یا نشد؟» با داوریِ صریحِ آغازِ پیام
         یا گزارشِ همان پیامد (عدد با عدد: «شد ۳» ⇐ «حداکثر ۱» ⇒ نشد)؛ «کدام؟» با درصد، نام یا ارجاع، فقط میانِ نامزدهای همان پرسش. پیشِ‌تر هر «شد/درست» در هر جای پیامِ بعدی
         («میانگین شد ۱۳٫۲»، «دیدم، الان درست شد»، «قسطِ آخرِ حصار …») پاسخ خوانده می‌شد. */
      var k28 = function (y) { return String(y.at) + "|" + (y.key || ""); }, L28 = Q.kind === "which" ? all.filter(function (y) { return !y.out && (!Q.cand || Q.cand.indexOf(k28(y)) >= 0); }) : [];
      var pick28 = function (L, said, pc) { var keep = C.preds; C.preds = L; var r = null; try { r = PR.predFor(s0, said, pc, false); } catch (e) { } C.preds = keep; return r; };
      var px = Q.kind === "res" ? all.filter(function (y) { return String(y.at) === String(Q.pred) && (Q.pkey == null || String(y.key || "") === Q.pkey) && !y.out; })[0] : (L28.length && ansWhich28(t, L28) ? pick28(L28, t, pctOf(t)) : null);
      var res = !px ? "" : Q.kind === "res" ? (Q.approx && /^\s*(?:آره|بله|آری|حساب\s*می[‌\s]?شه|میشه)(?![آ-ی])/.test(t) ? "شد" : Q.approx && /^\s*(?:نه|نخیر|حساب\s*نمی[‌\s]?شه|نمیشه)(?![آ-ی])/.test(t) ? "نشد" : ansRes28(px, t)) : Q.out || verdict28(px, Q.sent || "") || ansRes28(px, t);
      if (px && res) { predApply26(s0, px, res, Q.kind === "res" ? t : Q.sent); sysLine25(s0, "🎯 " + predLab26(px) + " ⇐ " + res + " — به گفتهٔ خودت.");
        /* دورِ ۲۷ (C53؛ A27-11 s05 p19 «رضا رو میگم، ۴۰ درصدیه. مال مدیر هم که گفتم شد.»): سرانجامِ روشنِ پیش‌بینیِ دیگری در همان پیام هم می‌نشیند */
        try { outcome28(s0, t, all.filter(function (y) { return !y.out && y !== px; }), true); } catch (e) { console.warn(e); } return px; }
      if (!PR.predVerdictIn(t) && !PR.predRefIn(t)) { sysLine25(s0, "🎯 پرسشِ داوری بی‌جواب ماند — چیزی داوری نشد؛ هر وقت گفتی «پیش‌بینیِ … شد/نشد» یا در «🎯 دفترِ پیش‌بینی» زدی، همان می‌نشیند.");
        /* دورِ ۲۷ (C53؛ C27-20 pwC2 p29): پیامی که پاسخِ آن پرسش نبود ممکن است سرانجامِ روشنِ پیش‌بینیِ دیگری باشد («تاس رو ۶۰ بار انداختم، ۱۱ بار …») */
        var oc27 = null; try { oc27 = outcome28(s0, t, all.filter(function (y) { return !y.out && !(Q.kind === "res" && String(y.at) === String(Q.pred)); }), false); } catch (e) { console.warn(e); } return oc27 || Q; } }
    /* (۷) پس‌گرفتنِ داوری‌ای که همین حالا به حرفِ خودش نشست: «اشتباه گفتم، در واقع شد» ⇒ همان 🎯، با تاریخچه (بانکِ R26 #208؛ «نه، همون نشد درست بود» ⇒ هیچ: #220) */
    var pu7 = U[U.length - 2], lastJ = all.filter(function (y) { return y.out && y.out.sess === s0.id && pu7 && String(y.out.at || "") >= String(pu7.at || ""); }).sort(function (a, b) { return String(a.out.at).localeCompare(String(b.out.at)); }).pop();
    if (lastJ && /(?:^|[\s،])(?:اشتباه\s*(?:گفتم|کردم|زدم)|در\s*واقع|راستش|اتفاقاً|برعکس)(?![آ-ی])/.test(t) && !PR.predVerdictIn(t)) { var d7 = dg(t), no7 = /(?:^|[\s،«])نشد(?![آ-ی])/.test(d7), ok7 = !no7 && (/(?:در\s*واقع|راستش|اتفاقاً|برعکس)\s*(?:هم\s*)?شد(?![آ-ی])|(?:^|[\s،«])شد\s*[.!؛»]/.test(d7)), want = no7 ? "نشد" : ok7 ? "شد" : "";
      if (want && want !== lastJ.out.res) { var was7 = lastJ.out.res, f7 = fcOf27(lastJ); if (f7) PR.reverdict26(f7, want, t, s0); else { (lastJ.outHist = lastJ.outHist || []).push(lastJ.out); lastJ.out = { res: want, at: nowISO(), quote: clip(t, 200), sess: s0.id }; }
        sysLine25(s0, "↩ داوریِ 🎯 " + predLab26(lastJ) + " به گفتهٔ خودت عوض شد: «" + was7 + "» ⇒ «" + want + "» (داوریِ پیشین در تاریخچه می‌ماند)."); return lastJ; } }
    var v = PR.predVerdictIn(t), ref = v ? null : PR.predRefIn(t);
    /* دورِ ۲۸ (بانکِ R28 #156، nB1 p18): چند داوری در یک پیام («۲۳ … درست درومد، ۲۲ تا غلط بود») ⇒ هر بند جدا (outcome28)، نه یک داوری برای کلِ پیام */
    if ((dg(t).match(/درست\s*(?:درومد|دراومد|درآمد|بود|درنیومد|نبود)|(?:غلط|اشتباه)\s*(?:بود|درومد|دراومد)/g) || []).length >= 2) { v = null; ref = null; }
    /* دورِ ۲۷ (story R5، C53؛ A27-11 s05 p17، C27-20 pwC2 p28/p29): سرانجامِ روشن بی واژهٔ «پیش‌بینی» («مدیرم امروز درخواستم رو تأیید کرد!»، «… ۳۰٪. درست درومد») */
    if (!v && !ref) { if (did) return did; return outcome28(s0, t, all.filter(function (y) { return !y.out; }), false) || did; }
    /* داوریِ ضعیف (بی واژهٔ «پیش‌بینی») فقط با واژهٔ مشترک با یک پیش‌بینیِ باز داوری است؛ وگرنه ارجاع است (صفحه می‌پرسد) */
    if (v && v.weak) { var ow = all.filter(function (y) { return !y.out; }); if (!ow.length) return did; if (!(ow.length === 1 && ovS(ow[0].text, t) >= 1)) { ref = { sent: v.sent }; v = null; } }
    var sent = (v || ref).sent, out = v ? (v.ok ? "شد" : "نشد") : "", pc = pctOf(sent);
    if (pc != null && !all.some(function (y) { return predPct(y) === pc; })) pc = null;   /* درصدِ درونِ خودِ گزارش («۱۵ درصد شد») اطمینان نیست */
    var x = pick(t, pc), open = all.filter(function (y) { return !y.out; });
    /* اطمینانِ گفته‌شده مالِ پیش‌بینیِ داوری‌شده است ⇒ بازنگریِ همان داوری، با تاریخچه */
    /* دورِ ۲۸ (C91؛ A28-26 s05 p30 «یکی از پیش‌بینی‌های ۷۰ درصدیم درست شد»؛ dB1 p16 «پیش‌بینیِ ۱۳ درست درومد» پس از داوری): عددی که پیش‌بینیِ داوری‌شده‌ای را نام می‌برد
       ⇒ همان (همان داوری ⇒ کاری نیست)؛ درصدی که پیش‌بینیِ بازی هم دارد بازنگریِ داوری‌شده نیست — «کدام؟» فقط میانِ بازهای همان درصد */
    var rf28 = refN28(dg(sent)), Jn = rf28.length ? all.filter(function (y) { return y.out && nums27(strip28(y.text)).some(function (k) { return rf28.indexOf(k) >= 0; }); }) : [];
    if (!x && v && Jn.length === 1 && !open.some(function (y) { return score28(y, sent) > 0; })) { if (Jn[0].out.res === out) return did; }
    if (!x && v && pc != null && !open.some(function (y) { return predPct(y) === pc; })) { var J = all.filter(function (y) { return y.out && predPct(y) === pc; });
      if (J.length === 1) { var jf = fcOf27(J[0]), was = J[0].out.res;
        if (was !== out) { if (jf) PR.reverdict26(jf, out, sent, s0); else { (J[0].outHist = J[0].outHist || []).push(J[0].out); J[0].out = { res: out, at: nowISO(), quote: clip(sent, 200), sess: s0.id }; }
          sysLine25(s0, "↩ داوریِ 🎯 " + predLab26(J[0]) + " به گفتهٔ خودت عوض شد: «" + was + "» ⇒ «" + out + "» (داوریِ پیشین در تاریخچه می‌ماند)."); }
        return J[0]; } }
    if (!x && v && !open.length) { /* پیش‌بینیِ بازِ گفت‌وگوی دیگر با همان اطمینان/عدد (یکتا) */
      var L = S.all("fcast", function (f) { return f && !f.sample && !f.outcome && !f.live && (f.by === "chat" || (f.src && f.src.chat)); }), h2 = PR.fcMatch(L, t, pc); if (h2.length !== 1) return did; var fc2 = h2[0];
      fc2.outcome = out; fc2.outcomeAt = nowISO(); fc2.judgedBy = { kind: "her-words", sess: s0.id, quote: clip(sent, 200), d: today() }; S.put(fc2); PR.predMark(s0, fc2, out, sent); return fc2; }
    if (!x) { var C28 = pc != null && open.some(function (y) { return predPct(y) === pc; }) ? open.filter(function (y) { return predPct(y) === pc; }) : open.filter(function (y) { return score28(y, sent) > 0; }); if (!C28.length) C28 = open;
      if (C28.length === 1 && out) { predApply26(s0, C28[0], out, sent); sysLine25(s0, "🎯 " + predLab26(C28[0]) + " ⇐ " + out + " — به گفتهٔ خودت: «" + clip(sent, 80) + "»."); return C28[0]; }
      if (open.length > 1) { s0.predAsk = { kind: "which", msg: at, out: out, sent: clip(sent, 200), state: "open", cand: C28.map(function (y) { return String(y.at) + "|" + (y.key || ""); }) };
        sysLine25(s0, "🎯 کدام پیش‌بینی؟ — " + C28.slice(0, 4).map(predLab26).join(" · ") + ". درصدش یا چند واژه‌اش را بگو تا " + (out ? "«" + out + "»" : "نتیجه") + " روی همان بنشیند — تا نگویی چیزی داوری نمی‌شود."); return s0.predAsk; }
      return did; }
    /* دورِ ۲۸ (C91؛ D28-2 pwD1 p6 «۱۵ درصد — از پیش‌بینیم خیلی بیشتر» ⇐ «حدودِ ۸ درصد»): ارجاعی که عددش یا حرفِ خودش داوری را روشن می‌کند داوری است، نه پرسش */
    if (!v && !x.out) { var vr28 = verdict28(x, t); if (vr28) { predApply26(s0, x, vr28, sent); sysLine25(s0, "🎯 " + predLab26(x) + " ⇐ " + vr28 + " — به گفتهٔ خودت: «" + clip(sent, 80) + "»."); return x; } }
    if (!v) { if (x.out) return did; var ax28r = approx28(x, t); s0.predAsk = { kind: "res", msg: at, pred: String(x.at), pkey: String(x.key || ""), sent: clip(sent, 200), state: "open", approx: !!ax28r };
      if (ax28r) { sysLine25(s0, "🎯 " + predLab26(x) + " — از حرفت («" + clip(sent, 60) + "») برمی‌آید نتیجه‌اش معلوم شده: " + ax28r); return s0.predAsk; }
      sysLine25(s0, "🎯 " + predLab26(x) + " — از حرفت («" + clip(sent, 60) + "») برمی‌آید نتیجه‌اش معلوم شده: شد یا نشد؟"); return s0.predAsk; }
    return predApply26(s0, x, out, sent);
  };
  /* {"do":"fcast_verdict","id":"fc…","res":"open|شد|نشد","quote":"عینِ حرفش"} — برگرداندنِ داوریِ نشسته به حرفِ خودش (B26·D32: «هیچ کنشی در گفت‌وگو داوری را برنمی‌گرداند») */
  if (AS && AS.DO && !AS.DO.fcast_verdict) AS.DO.fcast_verdict = function (a) {
    var s0 = AS._turnSession, U = userMsgs(s0), m = U[U.length - 1]; if (!s0 || !m) return "این کنش فقط در نوبتِ گفت‌وگو کار می‌کند";
    var res = String((a && a.res) || "").trim(), out = /^(?:open|باز|هنوز)$/i.test(res) ? "" : /^(?:شد|ok|true|درست)$/i.test(res) ? "شد" : /^(?:نشد|no|false|نادرست)$/i.test(res) ? "نشد" : null;
    if (out == null) return "res باید «open»، «شد» یا «نشد» باشد — داوری عوض نشد";
    var q = String((a && a.quote) || ""); if (norm(q).length < 4 || norm(m.text).indexOf(norm(q)) < 0) return "quote باید عینِ حرفِ خودش در همین پیام باشد — داوری عوض نشد";
    var L = S.all("fcast", function (f) { return f && !f.sample && ((f.src && f.src.chat === s0.id) || (f.judgedBy && f.judgedBy.sess === s0.id)); });
    var fc = L.filter(function (f) { return f.id === String((a && a.id) || ""); })[0]; if (!fc && a && a.pct != null) { var byP = L.filter(function (f) { return f.p === +a.pct; }); if (byP.length === 1) fc = byP[0]; }
    if (!fc) return "این 🎯 در پیش‌بینی‌های این گفت‌وگو نیست — شناسه‌اش را از بلوکِ «🎯 داوری‌های این گفت‌وگو» بده؛ داوری عوض نشد";
    var was = fc.outcome || "", lab = "«" + clip(fc.q, 50) + "»" + (fc.p != null ? " (" + fa(fc.p) + "٪)" : "");
    if (!PR.reverdict26(fc, out, q, s0)) return { info: "🎯 " + lab + " همان «" + (was || "هنوز باز") + "» بود — چیزی عوض نشد." };
    S.put(s0);
    return { info: "↩ داوریِ 🎯 " + lab + " به گفتهٔ خودت برگشت: «" + (was || "هنوز باز") + "» ⇒ «" + (out || "هنوز باز") + "» (داوریِ پیشین در تاریخچه می‌ماند)" + (!out && fc.due ? " — سرِ موعدش (" + fdate(fc.due) + ") در «امروز» می‌آید." : ".") };
  };
  if (AS && AS.promptHooks) AS.promptHooks.push(function (s0, msg) {
    var t = String(msg || ""); if (!s0 || !/پیش[‌\s]?بینی/.test(t) || !/اشتباه|درستش\s*کن|برگردون|برش\s*گردون|پس\s*بگیر|هنوز|زده(?![آ-ی])|نزن|غلط\s*(?:زد|نشست|ثبت)/.test(t)) return "";
    var L = S.all("fcast", function (f) { return f && !f.sample && f.outcome && ((f.src && f.src.chat === s0.id) || (f.judgedBy && f.judgedBy.sess === s0.id)); }); if (!L.length) return "";
    return "# 🎯 داوری‌های این گفت‌وگو (زمینه، نه پرسشِ دوم)\n- زمینه (نه پرسشِ دوم): اگر خودش گفت داوریِ یکی از این پیش‌بینی‌ها اشتباه نشسته یا هنوز وقتش نرسیده، همان را با {\"do\":\"fcast_verdict\",\"id\":\"…\",\"res\":\"open|شد|نشد\",\"quote\":\"عینِ حرفش در همین پیام\"} برگردان — صفحه نقل را می‌سنجد، داوریِ پیشین را در تاریخچه نگه می‌دارد و نتیجه را خودش زیرِ پیام می‌گوید؛ تا آن نتیجه نیامده نگو «درست شد»: " +
      L.slice(-6).map(function (f) { return f.id + " «" + clip(f.q, 60).replace(/[«»]/g, "") + "»" + (f.p != null ? " (" + fa(f.p) + "٪)" : "") + " ⇐ " + f.outcome; }).join(" · ");
  });

  /* ---------- دورِ ۲۵ (P7؛ DECISIONS_R25 C1 و C12؛ B_s·D7 = U15؛ بانکِ R25 #219–#220، #228–#229، #232–#233، #240): تاریخِ خودش به «امروز» می‌رسد ----------
     ریشه: تاریخی که خودش گفت فقط وقتی به «امروز» می‌رسید که مدل کنشی برایش می‌داد؛ و برنامهٔ بی‌زمان تاریخِ ساختگیِ «هفت روز بعد» می‌گرفت.
     • PR.whenInfo(متن) تاریخ را از جملهٔ خودش می‌خواند: «جمعهٔ هفتهٔ بعد» = جمعهٔ هفتهٔ (شنبه تا جمعه) پس از هفتهٔ امروز؛ نامِ همین روزِ هفته در خودِ همان روز
       («تا جمعه» در جمعه) دوپهلوست (amb) — صفحه حدس نمی‌زند، یک بار می‌پرسد «همین امروز یا …ِ بعد؟» (C1)؛ روزِ دیگر = نخستین همان روز پس از امروز.
     • تعهدِ تاریخ‌دارِ خودش که رکوردی نگرفت (نه موعد، نه برنامه، نه 🎯) ⇒ صفحه همان جمله و تاریخِ خوانده را نشان می‌دهد و «درست است؟» می‌پرسد؛ با «آره» ِ او موعد می‌شود (C12).
       عادت («جمعه‌ها معمولاً …»)، پرسش، شرط، گذشته و «یه روزی» تاریخ نیستند. هر پرسش یک بار؛ بی جواب ⇒ کنار می‌رود (چیزی ثبت نمی‌شود). */
  /* ---------- دورِ ۲۶ (Q5؛ DECISIONS_R26 C12 «بر هر دو مسیر» و C19؛ U10، U19–U22، A26-6/-12/-13/-21/-49، B26·D1/D3/D11/D14/D24/D25، C26-5/-19/-28/-41، D26-37/-41/-51) ----------
     سه ریشه، نه وصلهٔ جمله‌ها:
     (۱) خواننده واژه‌مرز نداشت: «جلسه شنبه» ⇒ «سه‌شنبه»؛ «۲۰ آبانه» خوانده نمی‌شد؛ «جمعهٔ بعد»، «هفتهٔ بعد، جمعه»، «آخرِ هفتهٔ بعد» نه؛ مدت («۸ ماهه»، «یه روز دیگه») تاریخ می‌شد.
     (۲) «تعهد» در سطحِ جمله سنجیده می‌شد (هر «ب…م» — حتی «برادرم» — کافی بود): حالا خودِ همان بندِ تاریخ‌دار باید کارِ آیندهٔ خودش باشد (C19):
         گذشته، گفتهٔ دیگری، برنامهٔ دیگری، روزِ نفی‌شده، روزِ درونِ صورتِ مسئله، مدتِ سپری‌شده و جملهٔ تولد پرسش نمی‌گیرند.
     (۳) فقط تاریخی پرسیده می‌شد که مدل برایش رکوردی نساخته بود؛ تاریخِ گزارشِ مدل (plan.when، کنشِ deadline) بی «… درست است؟» به «امروز» می‌رفت و «باشه» خوانده نمی‌شد.
         حالا هر تاریخ — از حرفِ او یا از گزارشِ مدل — پرسشِ صفحه و «آره/باشه» ِ او را می‌خواهد؛ پرسشِ بی‌جواب بی‌صدا نمی‌افتد (یک سطر + ردیفِ پاسخ‌دادنی در «امروز»). */
  var WDFA25 = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
  var JM26 = "فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند", NEXT26 = "(?:بعد|بعدی|دیگه|دیگر|آینده)", NUM26 = "(?:\\d+|یک|یه|دو|سه|چهار|پنج|شش|شیش|هفت|هشت|نه|ده)";
  var WDN26 = { "": 6, "یک": 0, "دو": 1, "سه": 2, "چهار": 3, "پنج": 4 };
  function dowOf(d) { var p = String(d).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]).getDay(); }
  function nrm26(t) { return dg(String(t || "")).replace(/[ً-ْٔ]/g, "").replace(/ۀ/g, "ه").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[‌‎‏]/g, " ").replace(/\s+/g, " ").trim(); }
  /* نامِ روزِ هفته با واژه‌مرز: پیشوندِ «یک/دو/سه/چهار/پنج» فقط وقتی خودش آغازِ واژه است («جلسه شنبه» = شنبه، نه سه‌شنبه) */
  function wdToks26(x) {
    var re = /(?:^|[^آ-ی])(?:(یک|دو|سه|چهار|پنج) ?)?(شنبه)(?![آ-ی])|(?:^|[^آ-ی])(جمعه)(?![آ-ی])/g, out = [], m;
    while ((m = re.exec(x))) { var lead = /^[آ-ی]/.test(m[0]) ? 0 : 1, dow = m[3] ? 5 : WDN26[m[1] || ""]; out.push({ dow: dow, name: WDFA25[dow], start: m.index + lead, end: m.index + m[0].length }); re.lastIndex = m.index + m[0].length; }
    return out;
  }
  /* آخرین روزِ ماهِ شمسی: ماهِ همین روز، یا ماهِ نام‌برده (نخستین بار که هنوز نگذشته) — روزِ پیش از یکمِ ماهِ بعد */
  function monthEnd26(base, named) {
    try { var f = dg(fdate(base)), m = new RegExp("(\\d{1,2}) (" + JM26 + ") (\\d{4})").exec(nrm26(f)); if (!m || !A.epiRevDate) return "";
      var jm = JM26.split("|").indexOf(m[2]) + 1, jy = +m[3]; if (named) { if (named < jm) jy += 1; jm = named; }
      var nm = jm === 12 ? 1 : jm + 1, ny = jm === 12 ? jy + 1 : jy, first = A.epiRevDate(ny + "-" + nm + "-1"); return first ? add(first, -1) : ""; } catch (e) { return ""; }
  }
  var DUR26 = new RegExp("(?:^| )" + NUM26 + " ?(روز|هفته|ماه)(?![آ-ی])"), DUR_OK26 = new RegExp("(?:^| )(?:تا|ظرف|عرض|طی) (?:ی ?)?" + NUM26 + " ?(?:روز|هفته|ماه)(?![آ-ی])|(?:^| )" + NUM26 + " ?(?:روز|هفته|ماه) ?(?:ی ?)?(?:" + NEXT26 + "|پیش|قبل|وقت|فرصت|مهلت)(?![آ-ی])");
  var REL_DAY27 = /پس ?فردا|(?:^|[^آ-ی])فردا(?![آ-ی])|آخر ?(?:ی ?)?هفته/;
  var REL_FIX26 = /پس ?فردا|(?:^|[^آ-ی])فردا(?![آ-ی])|آخر ?(?:ی ?)?هفته|امروز|امشب|همین حالا|همین الان|الان/;
  /* دورِ ۲۶ C34: شمارهٔ ترتیبیِ روزِ ماه */
  var ORDW26 = { "یکم": 1, "دوم": 2, "سوم": 3, "چهارم": 4, "پنجم": 5, "ششم": 6, "شیشم": 6, "هفتم": 7, "هشتم": 8, "نهم": 9, "دهم": 10, "یازدهم": 11, "دوازدهم": 12, "سیزدهم": 13, "چهاردهم": 14, "پانزدهم": 15, "پونزدهم": 15, "شانزدهم": 16, "شونزدهم": 16, "هفدهم": 17, "هیفدهم": 17, "هجدهم": 18, "هیجدهم": 18, "نوزدهم": 19, "بیستم": 20, "سی ام": 30, "سیام": 30 };
  var ORD26 = new RegExp("(?:^| )(?:(\\d{1,2}) ?(?:ام|م)|(بیست|سی) ?و ?(یکم|دوم|سوم|چهارم|پنجم|ششم|شیشم|هفتم|هشتم|نهم)|(" + Object.keys(ORDW26).join("|") + "))(?:ه|ه ست|ست)?(?![آ-ی])(?! ?(?:" + JM26 + "))");
  var ORDCTX26 = /(?:^| )(?:تا|مهلت|موعد|سررسید|تحویل|قبل از|پیش از|تاریخ|ددلاین)(?![آ-ی])/;
  function ordDay26(x) {
    var m = ORD26.exec(x); if (!m) return 0;
    var n = m[1] ? +m[1] : m[2] ? (m[2] === "بیست" ? 20 : 30) + ORDW26[m[3]] : ORDW26[m[4]];
    if (!n || n > 31) return 0;
    var pre34 = x.slice(0, m.index).trim().split(" "), l1 = pre34.slice(-1).join(" "), l2 = pre34.slice(-3).join(" ");
    if (!(/^(?:تا|مهلت|موعد|سررسید|تحویل|تاریخ|ددلاین)$/.test(l1) || /(?:قبل|پیش) از$/.test(l2) || /(?:^| )(?:مهلت|موعد|سررسید|ددلاین)(?![آ-ی])/.test(pre34.slice(-3, -1).join(" "))) && !/^ ?(?:ی ?)?(?:(?:همین|این) ?)?ماه(?![آ-ی])/.test(x.slice(m.index + m[0].length).replace(/^ ?(?:ه|ست)(?![آ-ی])/, ""))) return 0;
    return n;
  }
  function jParts26(d) { var m = new RegExp("(\\d{1,2}) (" + JM26 + ") (\\d{4})").exec(nrm26(dg(fdate(d)))); return m ? { d: +m[1], m: JM26.split("|").indexOf(m[2]) + 1, y: +m[3] } : null; }
  function monthDay26(base, n, thisM) {
    try { var J = jParts26(base); if (!J || !A.epiRevDate) return ""; var jm = J.m, jy = J.y; if (n < J.d) { if (thisM) return ""; jm += 1; if (jm > 12) { jm = 1; jy += 1; } }
      var d = A.epiRevDate(jy + "-" + jm + "-" + n), K = d ? jParts26(d) : null; return K && K.d === n && K.m === jm ? d : ""; } catch (e) { return ""; }
  }
  /* دورِ ۲۷ (C50): یکمِ فروردینِ پیشِ رو (اگر امروز خودش ۱ فروردین است، همین امروز) و آخرین روزِ اسفندِ سالِ شمسیِ همین روز */
  function farv27(base) { try { var J = jParts26(base); if (!J || !A.epiRevDate) return ""; if (J.m === 1 && J.d === 1) return base; return A.epiRevDate((J.y + 1) + "-1-1") || ""; } catch (e) { return ""; } }
  function idiom27(x, base) {
    var PASTW = "(?! ?(?:ی ?)?(?:پیش|قبل|گذشته|پارسال)(?![آ-ی]))", J = jParts26(base), fq = function (lab, d) { return lab + (d ? " (از " + fdate(d) + " به بعد)" : "") + " — کدام روز؟"; };
    /* C70: «وسطِ ماه» و «آخرِ سالِ تحصیلی» واقعیتِ تقویم نیستند ⇒ صفحه روز را می‌پرسد و عددی پیشنهاد نمی‌کند */
    if (/(?:^| )(?:وسط|اواسط|نیمه) ?(?:ی ?)?(?:ماه|برج)(?![آ-ی])/.test(x)) return { date: add(base, 1), amb: true, free: true, wd: "", src: "idiom", idiom: "وسطِ ماه", fq: fq("وسطِ ماه", "") };
    /* دورِ ۲۸ (بانکِ R28 #5، D28-20 tD2 «ماهِ دیگه باید اسباب‌کشی کنم» ⇒ «چهارشنبه ۲۵ آذر»): «ماهِ دیگه/بعد/آینده» بی عدد و بی «اول/آخر/وسط» یک روز نیست ⇒ «کدام روز؟» */
    if (/(?<!(?:\d|یه|یک|دو|سه|چهار|پنج|شش|چند|اول|آخر|وسط|اواسط|ابتدای|ابتدا|اوایل|اواخر|نیمه|سر|همین|این) ?(?:ی ?)?)(?:^| )ماه ?(?:ی ?)?(?:دیگه|دیگر|بعد|آینده)(?![آ-ی])/.test(x)) return { date: add(base, 1), amb: true, free: true, wd: "", src: "idiom", idiom: "ماهِ بعد", fq: fq("ماهِ بعد", "") };
    if (/آخر ?(?:ی ?)?سال ?(?:ی ?)?(?:تحصیلی|مدرسه|دانشگاه|کاری)(?![آ-ی])/.test(x)) return { date: add(base, 1), amb: true, free: true, wd: "", src: "idiom", idiom: "آخرِ سالِ تحصیلی", fq: fq("آخرِ سالِ تحصیلی", "") };
    /* «سرِ برج» / «اولِ ماه» = یکمِ ماهِ شمسیِ بعد؛ در خودِ روزِ یکم ⇒ «امروز یا یکمِ ماهِ بعد؟» (C70). «سرِ برجِ میلاد/آزادی» برج است، نه روز */
    if (new RegExp("(?:^| )(?:سر ?(?:ی ?)?برج(?! ?(?:ی ?)?(?:میلاد|آزادی|ایفل|مخابرات|ساعت|دیده ?بانی))|اول ?(?:ی ?)?(?:ماه|برج)(?! ?(?:ی ?)?" + NEXT26 + "(?![آ-ی])))" + PASTW + "(?![آ-ی])").test(x)) { var e0 = monthEnd26(base); if (!e0) return null;
      return J && J.d === 1 ? { date: base, amb: true, wd: "", opts: [base, add(e0, 1)], src: "idiom", idiom: "سرِ برج" } : { date: add(e0, 1), src: "idiom", idiom: "سرِ برج" }; }
    if (/(?:^| )(?:سر|اول) ?(?:ی ?)?(?:برج|ماه) ?(?:ی ?)?(?:پیش|قبل|گذشته)(?![آ-ی])/.test(x)) return { none: true };
    /* «آخرِ سال/امسال» = آخرین روزِ اسفندِ همین سالِ شمسی؛ در خودِ آن روز ⇒ امروز (C70) */
    if (new RegExp("آخر ?(?:ی ?)?(?:سال|امسال)(?! ?(?:ی ?)?(?:بعد|دیگه|دیگر|آینده|پیش|قبل|گذشته|پارسال)(?![آ-ی]))(?![آ-ی])").test(x)) { var f1 = farv27(add(base, 1)); return f1 ? { date: add(f1, -1), src: "idiom", idiom: "آخرِ سال" } : null; }
    var ae = /(?:^| )(?:بعد|پس) ?(?:ی ?)?(?:از ?)?(?:ی ?)?(?:عید|نوروز)(?! ?(?:فطر|قربان|غدیر|مبعث))(?![آ-ی])/.exec(x);
    if (ae) { var f2 = farv27(base); return f2 ? { date: f2, amb: true, free: true, wd: "", src: "idiom", idiom: "بعد از عید", fq: fq("بعد از عید", f2) } : null; }
    /* «عید» = ۱ فروردینِ پیشِ رو؛ پس از ۱ فروردینِ امسال همان پرسشِ «… درست است؟» تاریخِ سالِ بعد را نام می‌برد (C70) */
    if (new RegExp("(?:^| )(?:عید|نوروز)(?! ?(?:فطر|قربان|غدیر|مبعث))" + PASTW + "(?![آ-ی])").test(x) && !/(?:^| )(?:پیش|قبل) ?(?:از ?)?(?:عید|نوروز)(?![آ-ی])/.test(x)) { var f3 = farv27(base); return f3 ? { date: f3, src: "idiom", idiom: "عید" } : null; }
    if (/(?:^| )(?:عید|نوروز) ?(?:ی ?)?(?:پارسال|پیش|قبل|گذشته)(?![آ-ی])/.test(x)) return { none: true };
    return null;
  }
  /* دورِ ۲۸ (dates، C92؛ F5 = A28-4، B28·D6، C28-9، D28-22): ریشهٔ «امروز خودش جمعه است» برای «بعد از عید / وسطِ ماه»: whenInfo برای اصطلاحِ بی‌روز free می‌دهد،
     ولی هر راهی که روزِ دوپهلو را روی برنامه (q.whenAsk/whenAskO) یا پرسشِ جایگزین می‌نشاند (planWhen26 ⇐ a27 plan18، rebook27، بازخوانیِ متنِ ✏️شده) فقط wd و opts
     را نگه می‌داشت و wd ِ خالی را «جمعه» می‌کرد؛ datePend سپس از برنامه پرسشی بی free می‌ساخت که در قالبِ «همین امروز یا جمعهٔ بعد» می‌افتاد. حالا شکلِ پرسش
     (opts/free/fq) یک‌جا از whenInfo برداشته و همه‌جا با برنامه می‌رود؛ و جملهٔ «امروز خودش X است» فقط وقتی گفته می‌شود که امروز واقعاً X باشد — وگرنه «کدام روز؟» بی روزِ پیشنهادی. */
  function askO28(I) { return I && (I.opts || I.free) ? { date: I.date, opts: I.opts || undefined, free: I.free || undefined, fq: I.fq || undefined } : undefined; }
  function wdToday28(z, d) { try { var w = wdToks26(nrm26(String((z && z.wd) || ""))); return !!(w.length && w[0].dow === dowOf(d || today())); } catch (e) { return false; } }
  function free28(z, d) { if (z && z.amb && !z.free && !(z.opts && z.opts.length === 2) && !wdToday28(z, d)) { z.free = true; z.wd = ""; delete z.opts; } return z; }
  PR.askO28 = askO28; PR.free28 = free28;
  PR.whenInfo = function (t, from) {
    var base = from || today(), bd = dowOf(base), x = nrm26(String(t || "").replace(/«\s*امروز\s*»/g, " ")).replace(/آخر ?(?:ی ?)?(?:همین|این) ?هفته/g, "آخر هفته");
    /* دورِ ۲۸ (بانکِ R28 #7 «پنجم فروردین»): روزِ ماه به واژهٔ ترتیبی پیش از نامِ ماه = همان عدد */
    x = x.replace(new RegExp("(^| )((?:بیست|بیس) ?و ?)?(یکم|اول|دوم|سوم|چهارم|پنجم|ششم|شیشم|هفتم|هشتم|نهم|دهم|یازدهم|دوازدهم|سیزدهم|چهاردهم|پانزدهم|پونزدهم|شانزدهم|شونزدهم|هفدهم|هیفدهم|هجدهم|هیجدهم|نوزدهم|بیستم|سی ?ام|سی ?و ?یکم)(?: ?(?:ی ?)?)(?=(?:" + JM26 + ")(?![آ-ی]))", "g"), function (a, l, tw, w) { var N = { "یکم": 1, "اول": 1, "دوم": 2, "سوم": 3, "چهارم": 4, "پنجم": 5, "ششم": 6, "شیشم": 6, "هفتم": 7, "هشتم": 8, "نهم": 9, "دهم": 10, "یازدهم": 11, "دوازدهم": 12, "سیزدهم": 13, "چهاردهم": 14, "پانزدهم": 15, "پونزدهم": 15, "شانزدهم": 16, "شونزدهم": 16, "هفدهم": 17, "هیفدهم": 17, "هجدهم": 18, "هیجدهم": 18, "نوزدهم": 19, "بیستم": 20 }[w.replace(/ /g, "")]; if (/^سی ?ام$/.test(w)) N = 30; if (/^سی ?و ?یکم$/.test(w)) N = 31; if (!N) return a; if (tw) { if (N > 9) return a; N += 20; } return l + N + " "; });
    x = x.replace(new RegExp("(\\d{1,2} ?(?:ام|م)? ?(?:" + JM26 + "))(?:ه|ست)(?![آ-ی])", "g"), "$1").replace(/(\d{4})(?:ام|م)(?![آ-ی])/g, "$1");
    /* «دوازده روزِ دیگه» — عددِ واژه‌ایِ بالای ده فقط پیش از واحدِ زمان رقم می‌شود (نه «سه» ِ «سه‌شنبه») */
    x = x.replace(/(?:^| )(یازده|دوازده|سیزده|چهارده|پانزده|پونزده|شانزده|شونزده|هفده|هیفده|هجده|هیجده|نوزده|بیست|سی|چهل) ?(?=(?:روز|هفته|ماه)(?![آ-ی]))/g, function (all, n) { return " " + ({ "یازده": 11, "دوازده": 12, "سیزده": 13, "چهارده": 14, "پانزده": 15, "پونزده": 15, "شانزده": 16, "شونزده": 16, "هفده": 17, "هیفده": 17, "هجده": 18, "هیجده": 18, "نوزده": 19, "بیست": 20, "سی": 30, "چهل": 40 })[n] + " "; }).trim();
    /* بازه: «از امشب تا جمعه …» — موعد پایانِ بازه است، نه آغازش */
    var rg = /(?:^| )از (.{1,40}?) تا (.+)$/.exec(x); if (rg) { var a0 = PR.whenInfo(rg[1], base), b0 = a0 ? PR.whenInfo(rg[2], base) : null; if (a0 && b0) return b0; }
    var W0 = wdToks26(x), sat = add(base, 7 - ((bd + 1) % 7)), i, w;
    /* «سه‌شنبه‌ی پیش/قبل/گذشته» روزی گذشته است، نه سه‌شنبهٔ پیشِ رو (بانکِ RM5 #13 ِ دورِ ۱۸) */
    var Wp26 = W0.filter(function (z) { return /^ ?(?:ی ?)?(?:پیش(?! ?(?:نویس|بینی|نهاد|فرض|پرداخت|خرید|ثبت|زمینه|شرط|نیاز|رو|دستی|غذا|دبستان|دانشگاه|کش|قدم|تر))|قبل|گذشته)(?![آ-ی])/.test(x.slice(z.end)); }); if (Wp26.length) { W0 = W0.filter(function (z) { return Wp26.indexOf(z) < 0; }); if (!W0.length) return null; }
    /* «آخرِ ماه» / «آخرِ همین ماه» = آخرین روزِ ماهِ شمسیِ همین روز (روزِ پیش از یکمِ ماهِ بعد) */
    if (/آخر ?(?:ی ?)?(?:همین ?|این ?)?ماه(?![آ-ی])/.test(x) && !new RegExp("ماه ?(?:ی ?)?" + NEXT26).test(x)) { var em = monthEnd26(base); if (em) return { date: em, src: "monthend" }; }
    /* «ابتدای/اولِ ماهِ آینده» = یکمِ ماهِ شمسیِ بعد (نه «سی روز بعد») */
    if (new RegExp("(?:ابتدا|اول|اوایل|آغاز|شروع) ?(?:ی ?)?ماه ?(?:ی ?)?" + NEXT26 + "(?![آ-ی])").test(x)) { var e0 = monthEnd26(base); if (e0) return { date: add(e0, 1), src: "monthstart" }; }
    /* دورِ ۲۷ (DECISIONS_R27 C50، D27-32): تاریخ‌های اصطلاحی واقعیتِ تقویم‌اند — «سرِ برج» = یکمِ ماهِ شمسیِ بعد؛ «آخرِ سال/امسال» = آخرین روزِ اسفندِ
       همین سالِ شمسی؛ «عید» (نوروز) = ۱ فروردینِ پیشِ رو؛ «بعد از عید» روزِ معینی نیست ⇒ free: صفحه با لنگرِ ۱ فروردین می‌پرسد «کدام روز؟». «… ِ پیش/قبل/گذشته» گذشته است */
    var id27 = idiom27(x, base);
    /* دورِ ۲۸ (C92، B28·D6 dB1 p10 «وسطِ ماه یعنی حدودِ ۱۵ دی»): روزِ صریحِ همان جمله («۱۵ دی»، «۵ فروردین»، «۱۴۰۵/۱۰/۱۵») بر اصطلاحِ بی‌روز مقدم است —
       پیش‌تر اصطلاح (free) پیش از روزِ صریح برمی‌گشت و همان روزی که برای پاسخ به «کدام روز؟» نوشت هرگز خوانده نمی‌شد */
    if (id27 && id27.free && new RegExp("\\d{4} ?[\\/\\-.] ?\\d{1,2} ?[\\/\\-.] ?\\d{1,2}|\\d{1,2} ?(?:ام|م)? ?(?:" + JM26 + ")(?![آ-ی])").test(x)) id27 = null;
    if (id27) return id27.none ? null : id27;
    var en = new RegExp("آخر(?:ای)? ?(?:ی ?)?(?:ماه ?(?:ی ?)?)?(" + JM26 + ")(?: ?(?:ماه)?)(?![آ-ی])").exec(x); if (en) { var e2 = monthEnd26(base, JM26.split("|").indexOf(en[1]) + 1); if (e2) return { date: e2, src: "monthend" }; }
    /* «آخرِ هفتهٔ بعد» = آخرِ هفتهٔ (شنبه تا جمعهٔ) پس از هفتهٔ امروز. دورِ ۲۶ C33: «آخرِ هفته» یک روز نیست — صفحه می‌پرسد پنجشنبه یا جمعه (opts)؛
       date = جمعه فقط برای سازگاری (روزِ دوپهلو هرگز بی پاسخِ او ثبت نمی‌شود) */
    if (new RegExp("آخر ?(?:ی ?)?هفته ?(?:ی ?)?" + NEXT26 + "(?![آ-ی])").test(x)) return { date: add(sat, 6), amb: true, wd: "جمعه", opts: [add(sat, 5), add(sat, 6)], src: "nextweek" };
    if (/آخر ?(?:ی ?)?هفته(?! ?ها(?![آ-ی]))(?! ?(?:ی ?)?(?:پیش|قبل|گذشته)(?![آ-ی]))/.test(x)) { var th33 = add(sat, -2), fr33 = add(sat, -1);
      if (th33 < base) return { date: fr33, src: "rel" };
      return { date: fr33, amb: true, wd: "جمعه", opts: [th33, fr33], src: "weekend" }; }
    /* «جمعهٔ هفتهٔ بعد» و «هفتهٔ بعد، جمعه» = همان روز در هفتهٔ بعد */
    var nw = new RegExp("هفته ?(?:ی ?)?" + NEXT26 + "(?![آ-ی])").exec(x);
    if (nw) for (i = 0; i < W0.length; i++) { w = W0[i];
      if ((w.end <= nw.index && /^ ?(?:ی ?)?$/.test(x.slice(w.end, nw.index))) || (w.start >= nw.index + nw[0].length && /^[ ،,]{0,3}(?:روز ?(?:ی ?)?)?$/.test(x.slice(nw.index + nw[0].length, w.start)))) return { date: add(sat, (w.dow + 1) % 7), src: "nextweek", wd: w.name }; }
    /* «جمعهٔ بعد» = نخستین همان روز پس از امروز (در خودِ جمعه: هفت روز بعد — دوپهلو نیست، خودش «بعد» گفته) */
    /* دورِ ۲۶ C32: «جمعهٔ بعد» در روزی جز جمعه دوپهلوست (همین جمعهٔ پیشِ رو یا جمعهٔ پس از آن) ⇒ صفحه با هر دو تاریخ می‌پرسد */
    for (i = 0; i < W0.length; i++) { w = W0[i]; if (new RegExp("^ ?(?:ی ?)?" + NEXT26 + "(?![آ-ی])").test(x.slice(w.end))) { var k32 = (w.dow - bd + 7) % 7;
      return k32 ? { date: add(base, k32), amb: true, wd: w.name, opts: [add(base, k32), add(base, k32 + 7)], src: "weekday-next" } : { date: add(base, 7), src: "weekday-next", wd: w.name }; } }
    /* دورِ ۲۶ C34: روزِ ماه بی نامِ ماه («تا بیستم باید تحویل بدهم») = نخستین «بیستمِ» پیشِ رو در تقویمِ شمسی — فقط کنارِ واژهٔ موعد («تا/مهلت/موعد/تحویل/…»)
       یا «… (همین/این) ماه»؛ «جلسهٔ دوم» و «ظرفِ اول» روزِ ماه نیستند */
    var od34 = ordDay26(x); if (od34) { var dd34 = monthDay26(base, od34, /(?:همین|این) ?ماه(?![آ-ی])/.test(x)); if (dd34) return { date: dd34, src: "monthday" }; }
    var d = parseWhen(x, base), W = d && A.willWhen ? A.willWhen(x, base) : null, src = (W && W.src) || "";
    /* روزِ هفته را خودِ این خواننده با واژه‌مرز می‌خواند: A.willWhen «تا شنبه» را نمی‌خواند («تا» + «شنبه» را پیشوندِ «…شنبه» می‌گیرد) و «جلسه شنبه» را سه‌شنبه می‌خواند */
    if (src === "weekday" || (!d && W0.length) || ((!src || src === "time") && W0.length && !/\d{4} ?[\/\-.] ?\d{1,2} ?[\/\-.] ?\d{1,2}/.test(x))) { if (!W0.length) return null; w = W0[0]; var k = (w.dow - bd + 7) % 7;
      return k ? { date: add(base, k), src: "weekday", wd: w.name } : { date: add(base, 7), amb: true, wd: w.name, src: "weekday" }; }
    if (!d) return null;
    /* مدت تاریخ نیست («۸ ماهه می‌خوام…»، «دو هفته تمرین می‌کنم»، «یه روز دیگه» ِ نامعین) مگر «… دیگه/بعد»، «تا/ظرفِ …» یا «… وقت دارم» */
    /* دورِ ۲۷ (B27·D1 oB1 «ولی الان فقط دو روز موفق می‌شم»): «الان/امروز» فقط وقتی مدت را بی‌اثر می‌کند که خودِ تاریخ همان امروز باشد */
    if (src === "rel" && !(REL_DAY27.test(x) || (REL_FIX26.test(x) && d === base)) && DUR26.test(x)) { if (!DUR_OK26.test(x) || /(?:^| )(?:یه|یک) ?روز ?(?:ی ?)?(?:دیگه|دیگر)(?![آ-ی])/.test(x)) return null; }
    /* روزی که خوانندهٔ صفحه (A.willWhen) نخواند تاریخ نیست — مگر تاریخِ عددیِ کامل («۱۴۰۵/۹/۱۲»)؛ «۸ ماهه …» از پشتیبانِ کوتاهِ parseWhen می‌آمد */
    if ((!src || src === "time") && !/\d{4} ?[\/\-.] ?\d{1,2} ?[\/\-.] ?\d{1,2}/.test(x)) return null;
    return { date: d, src: src || "date" };
  };
  /* روزِ یک برنامهٔ گزارش‌شده (a27 plan18): { when, amb?, pend?: { date, src: her|model } } — حرفِ خودش مقدم؛ هر روزی جز خودِ امروز پرسیده می‌شود */
  PR.planWhen26 = function (pt, w, td, legacy, ut) {
    /* دورِ ۲۷ (C49؛ B27·D5 pwB2/oB1، D27-22 s35، C27-11): گزارشِ دوبارهٔ مدل از برنامه‌ای که روزِ دیگری گفته شده و در همین گفت‌وگو هست، برنامهٔ تازه و پرسشِ تازه نمی‌سازد —
       روزِ نسبی‌اش («یکشنبه»، «فردا») به روزِ گفتن لنگر است و با «امروزِ» تازه دوباره خوانده نمی‌شود (پیش‌تر هر روز با تاریخی تازه — یا سالِ بعد — پرسیده می‌شد) */
    try { var s27 = AS && AS._turnSession, np27 = norm(pt); if (s27 && np27.length >= 6 && !(ut && norm(ut).indexOf(np27) >= 0) && (s27.plans || []).some(function (q) { var nq = q && norm(q.text); return !!nq && (q.d || "") < td && (nq === np27 || (nq.length >= 8 && (nq.indexOf(np27) >= 0 || np27.indexOf(nq) >= 0))); })) return { when: "" }; } catch (e) { }
    var ns = /^next[-_ ]?session$/i.test(String(w || "")), real = /^\d{4}-\d\d-\d\d$/.test(String(w || "")), I = null; try { I = PR.whenInfo(pt, td); } catch (e) { }
    /* نقلِ مدل روز را انداخته («ورزش صبح» از «از فردا ورزش صبح می‌کنم») ⇒ روز از همان جملهٔ خودش که برنامه را دارد */
    if (!I && ut) { try { var np = norm(pt), hs = sentsOf25(ut).filter(function (x) { return np.length >= 4 && norm(x).indexOf(np) >= 0 && !/[؟?]\s*$/.test(x); })[0]; if (hs) I = PR.whenInfo(hs, td); } catch (e) { } }
    /* چند روز در یک برنامه («رباتیک سه‌شنبه، ریاضی پنجشنبه، و آخرِ آبان نمره‌ها …»): مدل می‌گوید کدام، صفحه می‌سنجد که همان روز در حرفِ خودش هست */
    if (real && w >= td && !(I && (I.date === w || I.src === "nextweek" || I.src === "weekday-next"))) { try { String(pt || "").replace(/(هفته[‌\s]*(?:ی|ٔ)?\s*(?:بعد|دیگه|دیگر|آینده))\s*[،,]\s*/g, "$1 ").split(/\s*[،؛]\s*|\s+و\s+/).forEach(function (c) { var J = PR.whenInfo(c, td); if (J && !J.amb && J.date === w) I = J; }); } catch (e) { } }
    if (I && I.amb) return { when: "next-session", amb: I.wd || "جمعه", ambO: askO28(I) || null };   /* دورِ ۲۸ (F5): free/fq با برنامه می‌رود */
    if (I && I.date) return I.date < td ? { when: "" } : I.date === td ? { when: td } : { when: "next-session", pend: { date: I.date, src: "her" } };
    if (ns) return { when: "next-session" };
    /* تاریخی که در حرفِ خودش نیست (تاریخِ مدل، یا «هفت روز بعد» ِ ساختگیِ یک عادت) به «امروز» نمی‌رسد و پرسیده هم نمی‌شود (C12؛ بانکِ R26 #161) */
    if (real && w < td) return { when: "" };
    return { when: "next-session" };
  };
  var HABIT25 = /شنبه[‌\s]*ها|جمعه[‌\s]*ها|(?:^|[\s،])(?:معمولاً|معمولا|همیشه|اغلب|بیشترِ?\s*وقت‌?ها|به\s*خودم\s*می[‌\s]?گم|هر\s*(?:هفته|روز|ماه|سال|شب|بار|دفعه|صبح|شنبه|یکشنبه|دوشنبه|سه[‌\s]?شنبه|چهارشنبه|پنج[‌\s]?شنبه|جمعه))(?![آ-ی])/;
  var PAST25 = /(?:^|[\s،])(?:دیروز|پریروز|پیش|قبل|پارسال|قبلاً|قبلا|گفتم|گفته\s*بودم|هفتهٔ?\s*(?:پیش|قبل|گذشته))(?![آ-ی])/;
  /* C19 — روی متنِ هنجارشده (nrm26: نیم‌فاصله ⇒ فاصله) */
  var PAST26 = /(?:^| )(?:ن?می ?|ن)?(?:کرد|داد|آورد|اورد|برد|خورد|زد|اومد|آمد|دید|خرید|رسید|پرسید|کشید|شنید|فهمید|نوشت|گفت|رفت|گرفت|گذاشت|ذاشت|ساخت|فروخت|خوند|خواند|موند|ماند|تونست|خواست|فرستاد|افتاد|نشست|بست|شکست|دونست|سپرد|شمرد|پرداخت|انداخت|برگشت)(?:م|یم|ه بودم|ه بودیم|ه ام)(?![آ-ی])|(?:^| )بود(?:م|یم)?(?![آ-ی])/;
  var OTHER26 = /(?:^| )(?:گفت|گفته|گفتن|گفتند|میگه|می گه|میگن|می گن|می گوید|می گویند|نوشته|اعلام کرد(?:ه|ن|ند)?|خبر داد(?:ه|ن|ند)?|قول داد(?:ه|ن|ند)?)(?![آ-ی])/;
  var THIRD26 = /(?:^| )(?:برادر|داداش|خواهر|آبجی|مادر|مامان|پدر|بابا|مدیر|رئیس|استاد|معلم|همکار|دوست|رفیق|خانم|همسر|شوهر|زن|دختر|پسر|بچه|نوه|مربی|دکتر|صاحب ?خونه|صاحب ?خانه|مشتری|همسایه)(?: ?ها)?(?:م|مون|مان| ام| م| مون|ی ?م)(?![آ-ی])/;   /* دورِ ۲۸: «نوه‌م» (نیم‌فاصله ⇒ فاصله) */
  var FIRST26 = /(?:^| )(?:(?:بر|در|ور|وا|باز|فرا)?ن?می ?(?!ز(?:م|مون)(?![آ-ی])|ل(?:م|مون)(?![آ-ی])|وه)[آ-ی]{1,12}م(?:ش|شون|ت|تون)?|ب(?!رادرم|ابام|چه|اغم|دنم|یستم|ازم|عدم|عدیم|هم|اهم|ارم|انکم|رگم|رنامه|لیتم|لیطم|یمارم|خشم|حثم|دهیم)[آ-ی]{2,12}م(?:ش|شون|ت|تون)?|باید|قراره|قرار است|دارم|داریم|هستم)(?![آ-ی])/;
  /* دورِ ۲۷ (D27-29): فعلِ سومِ شخصِ ماضیِ نقلی («گذاشته»، «نوشته»، «تعیین کرده») — کارِ صفحه یا دیگری، نه «ـه‌ام/ـه‌ایم» ِ خودش */
  /* دورِ ۲۷ (بانکِ R27 #104): «امضا رو جمعهٔ بعد بذار» — فرمانِ او به صفحه دربارهٔ کارِ خودش، مثلِ فعلِ اول‌شخص */
  var IMPER27 = /(?:^| )(?:بذار|بگذار|بذارش|بگذارش|بنویس|بنویسش|ثبت کن|ثبتش کن|یادم بنداز|یادم بینداز|یادم بنداز)(?![آ-ی])/;
  var OTHERN27 = /(?:مهلت|موعد|امتحان(?:ا|ا ?ت)?|آزمون|جلسه|کلاس|قرار|تحویل|کنکور|مصاحبه|نوبت)(?: ?(?:ای|ها|های|ات))? ?(?:ی ?)?(?:بچه|بچه ها|پسر|دختر|برادر|داداش|خواهر|آبجی|مادر|مامان|پدر|بابا|همسر|شوهر|خانم|دوست|همکار|مدیر|استاد|معلم|نوه|همسایه)(?![آ-ی])(?! ?(?:م|ام|مون|مان|ها ?م)(?![آ-ی]))/;
  var PERF3_27 = /(?:^| )ن?(?:گذاشته|ذاشته|نوشته|گفته|داده|کرده|زده|فرستاده|ساخته|انداخته|تعیین کرده|برنامه ریزی کرده|گذاشتی|گذاشتید|ذاشتی|نوشتی|دادی|کردی|زدی|فرستادی)(?![آ-ی])(?! ?(?:ام|ایم|ای|اید|م|یم)(?![آ-ی]))/;
  var COMMITN26 = /(?:^| )(?:مهلت|موعد|نوبت|امتحان|آزمون|تحویل|جلسه|قرار|کنکور|مصاحبه|ددلاین|سررسید|پرواز|ارائه|دفاع|میان ?ترم|پایان ?ترم|وقت دارم)/;
  var BIRTH26 = /متولد|به\s*دنیا|تولد|زاده[‌\s]*(?:ی|ٔ)|سالمه|سالم\s*(?:است|هست)|ساله[‌\s]*(?:م|ام)(?![آ-ی])/;
  var DT26 = new RegExp("\\d{4} ?[\\/\\-.] ?\\d{1,2} ?[\\/\\-.] ?\\d{1,2}|\\d{1,2} ?(?:ام|م)? ?(?:" + JM26 + ")(?: ?(?:ماه)? ?\\d{4})?|پس ?فردا|فردا|آخر ?(?:ی ?)?هفته(?: ?(?:ی ?)?" + NEXT26 + ")?|هفته ?(?:ی ?)?" + NEXT26 + "|ماه ?(?:ی ?)?" + NEXT26 + "|" + NUM26 + " ?(?:روز|هفته|ماه) ?(?:ی ?)?" + NEXT26 + "|سر ?(?:ی ?)?برج|آخر ?(?:ی ?)?(?:سال|امسال)|(?:بعد|پس) ?(?:ی ?)?(?:از ?)?(?:ی ?)?عید|عید|نوروز");
  function dateSpan26(x) { var m = DT26.exec(x); if (!m && ordDay26(x)) { var o26 = ORD26.exec(x); if (o26) { var l26 = /^ /.test(o26[0]) ? 1 : 0, t26 = o26[0].replace(/(?:ه|ه ست|ست)$/, ""); m = { index: o26.index + l26, 0: t26.slice(l26) }; } } var W = wdToks26(x)[0], a = m ? { i: m.index, j: m.index + m[0].length } : null, b = W ? { i: W.start, j: W.end } : null; return a && b ? (a.i <= b.i ? a : b) : a || b; }
  function pieceAt26(x, i) { var re = / (?:و|ولی|اما|چون|که) /g, m, a = 0, b = x.length; while ((m = re.exec(x))) { if (m.index + m[0].length <= i) a = m.index + m[0].length; else if (m.index >= i) { b = m.index; break; } } return x.slice(a, b); }
  function probText26(s0) { var t = ""; try { var C = (s0 && s0.coach) || {}; t += " " + String(C.stmt || ""); var bl = AS && AS.boundLive ? AS.boundLive(s0) : null, p = bl && bl.r && bl.r.p; if (p) t += " " + String(p.statement || p.text || "") + " " + String(p.title || ""); } catch (e) { } return nrm26(t); }
  /* بندِ تاریخ‌دار کارِ آیندهٔ خودِ اوست؟ ⇒ { first } یا null؛ روزِ نفی‌شده ⇒ { neg: true } */
  function clauseOk26(c, st, I, stmt) {
    var x = nrm26(c), sp = dateSpan26(x); if (!sp) sp = { i: 0, j: 0 };
    if (/(?:^|[ ،])نه[،,]? ?$/.test(x.slice(0, sp.i)) || /^ ?(?:ی ?)?(?:هم ?)?(?:نه|نیست|نبود|نمیشه|نمی شه)(?![آ-ی])/.test(x.slice(sp.j))) return { neg: true };
    var piece = pieceAt26(x, sp.i), ev = /^ ?(?:ـ ?)?(?:ه|هست|است|ست)(?![آ-ی])/.test(x.slice(sp.j));
    if (PAST26.test(piece) || PAST25.test(c) || OTHER26.test(piece)) return null;
    var first = FIRST26.test(piece) || IMPER27.test(piece), cn = COMMITN26.test(x), third = THIRD26.test(piece);
    /* دورِ ۲۷ (بانکِ R27 #131): «امتحانای بچه‌ها هفته‌ی بعده» — واژهٔ تعهد مالِ کسِ دیگری است (بی «ـم» ِ خودش) */
    if (!first && OTHERN27.test(piece)) return null;
    /* دورِ ۲۷ (C19/C35 دوباره؛ A27-15 s09 p6، D27-29 s34 p17، B27·D1 s15، A27-17 s10 p9) — سه نشانهٔ دستوری که بندِ تاریخ‌دار را از «کارِ آیندهٔ خودش» بیرون می‌برد:
       (۱) گروهِ زمانی مفعول است («قیمتِ ماهِ بعد رو …» — «را/رو» پس از آن): نامِ چیزی است، نه زمانِ کار؛
       (۲) فعلِ سومِ شخصِ ماضیِ نقلی («موعدِ بعدی رو سه هفته بعد گذاشته» — کارِ صفحه یا دیگری)، بی فعلِ اول‌شخص؛
       (۳) نامِ روز یا مدت با «ـه/است» و هیچ چیزِ دیگر («سلام، هفته‌ی بعده»، «پنجشنبه‌ست.») — گفتنِ زمانِ حال یا روایتِ گذشتِ زمان، نه کاری */
    if (/^ ?(?:ی ?)?(?:رو|را)(?![آ-ی])/.test(x.slice(sp.j))) return null;
    if (!first && PERF3_27.test(piece)) return null;
    if (ev && !first && !cn && !COMMITN26.test(nrm26(st))) { var rest27 = (x.slice(0, sp.i) + " " + x.slice(sp.j).replace(/^ ?(?:ـ ?)?(?:ه|هست|است|ست)(?![آ-ی])/, "")).replace(/(?:^| )(?:سلام|خب|خوب|آره|اره|بله|ولی|اما|الان|دیگه|دیگر|امروز|پس|که|تا|هم|یعنی|خلاصه|راستی)(?![آ-ی])/g, " ");
      if (!toks(rest27).length) return null; }
    if (third && !first) return null;   /* برنامهٔ دیگری («جلسه‌های خواهرم سه‌شنبه عصره») — حتی با واژهٔ قرار/جلسه */
    /* دورِ ۲۷ (D27-32): شمارِ واژه‌های بند بی خودِ گروهِ زمانی سنجیده می‌شود («نصبِ چراغ بمونه برای بعد از عید») */
    if (!(first || cn || ev)) { var xs = nrm26(st), pz = piece.replace(x.slice(sp.i, sp.j), " "); if (third || toks(pz).length > 4 || !(FIRST26.test(xs) || COMMITN26.test(xs)) || OTHER26.test(xs)) return null; }
    /* روزِ هفته‌ای که جزوِ صورتِ مسئله است («پسرِ سه‌شنبه») — مگر خودش کارِ اول‌شخص بگوید */
    if (!first && !ev && I.wd && stmt && wdToks26(stmt).some(function (w) { return w.name === I.wd; })) return null;
    return { first: first };
  }
  /* تعهدهای تاریخ‌دارِ یک پیام: [{ what, date, amb, wd, first }]؛ .neg = روزهایی که خودش نفی کرد */
  PR.herDates = function (text, s0) {
    var out = [], neg = [], stmt = s0 ? probText26(s0) : "";
    sentsOf25(text).forEach(function (st) {
      if (/[؟?]\s*$/.test(st) || /(?:^|[\s،])(?:اگه|اگر|شاید|کاش)(?![آ-ی])/.test(st) || HABIT25.test(st) || PRED_EXPL.test(st) || PR.predVerdictIn(st) || /پیش[‌\s]?بینی|(?:٪|%|درصد)\s*(?:مطمئن|احتمال|اطمینان)/.test(st) || BIRTH26.test(st)) return;
      /* دورِ ۲۸ (بانکِ R28 #30، B28·D14 nB1 p16): «احتمالش ۴۰ درصده که جمعه بارون بیاد» — جملهٔ درصد‌دار با احتمال/اطمینان/شانس، به هر ترتیب، پیش‌بینی است (🎯 ِ R4)، نه کارِ تاریخ‌دارِ او */
      if (/(?:٪|%|درصد)/.test(st) && /(?:مطمئن|احتمال|اطمینان|شانس)/.test(st)) return;
      /* دورِ ۲۸ (C19/C35؛ A28-34 oA1 p33 «تو «امروز» هنوز از من می‌پرسه «پنج‌شنبه رسماً جواب می‌دم»»): نقلِ سطرِ صفحه یا حرفِ پیشین در گلایه تعهدِ تازه نیست — روزِ درونِ «…» خوانده نمی‌شود */
      if (/«/.test(st) && /(?:^|[\s،])(?:می[‌\s]?پرسه|می[‌\s]?پرسی|پرسیدی|پرسید|نوشتی|نوشته|نوشتین|گفتی|میگه|می[‌\s]?گه|نشون[‌\s]?میده|نشون[‌\s]?می[‌\s]?ده|آوردی|زدی|اومده|آمده)(?![آ-ی])/.test(st)) st = st.replace(/«[^»]*(?:»|$)/g, " ");
      /* «هفتهٔ بعد، جمعه، …» یک تاریخ است — ویرگولش بند نمی‌شکند */
      var st2 = st.replace(/(هفته[‌\s]*(?:ی|ٔ)?\s*(?:بعد|دیگه|دیگر|آینده))\s*[،,]\s*(?=(?:روزِ?\s*)?(?:(?:یک|دو|سه|چهار|پنج)[‌\s]?)?(?:شنبه|جمعه))/g, "$1 ");
      var parts = st2.split(/\s*[،؛]\s*|:\s+|\s+—\s+|\s+و\s+(?=(?:[^\s]+\s+){0,2}?(?:[0-9۰-۹]{1,2}\s*(?:فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند)|(?:یک|دو|سه[‌\s]?|چهار|پنج[‌\s]?)?شنبه|جمعه|فردا|پس[‌\s]?فردا|سر[ِ‌\s]*برج|آخر[ِ‌\s]*(?:سال|امسال)|(?:بعد|پس)[ِ‌\s]*(?:از[‌\s]*)?(?:عید|نوروز)|عید|نوروز))/);
      var got = [];
      parts.forEach(function (c) { var I = PR.whenInfo(c); if (!I || !I.date) return; var ok = clauseOk26(c, st2, I, stmt); if (ok && ok.neg) { neg.push(I.date); return; }
        if (!ok || I.date < today() || (I.date === today() && !I.amb && I.src !== "idiom")) return; got.push({ c: c.trim(), I: I, first: ok.first }); });
      if (!got.length && parts.length > 1 && !parts.some(function (c) { return PR.whenInfo(c); })) { var I0 = PR.whenInfo(st2), ok0 = I0 && I0.date > today() ? clauseOk26(st2, st2, I0, stmt) : null; if (ok0 && !ok0.neg) got = [{ c: st2.trim(), I: I0, first: ok0.first }]; }
      got.forEach(function (g) { var lab = toks(g.c).length >= 3 ? g.c : st; out.push({ what: clip(lab.replace(/[.!\s]+$/, ""), 120), date: g.I.date, amb: !!g.I.amb, wd: g.I.wd || "", opts: g.I.opts || undefined, free: g.I.free || undefined, fq: g.I.fq || undefined, first: !!g.first }); });
    });
    out = out.filter(function (x, i, X) { return X.findIndex(function (y) { return y.date === x.date && y.what === x.what; }) === i; });
    out.neg = neg; return out;
  };
  function sysLine25(s0, t) { (s0.msgs = s0.msgs || []).push({ role: "sys", at: nowISO(), text: t }); }
  var rawDl26 = AS && AS.DO && AS.DO.deadline;
  /* ثبتِ موعد پس از «آره» ِ او — مستقیم (نه از کنشِ خامِ a33: آن کنش روزِ نسبیِ «آخرین پیامِ او» را جای تاریخ می‌گذارد، و این‌جا آخرین پیام «آره» یا هر چیزِ دیگری است) */
  function dlBook25(s0, it, m) {
    var what = clip(it.dl ? it.dl.what : it.what, 120), r = S.all("deadline", function (x) { return x && !x.done && x.what === what; })[0] || { id: A.uid("dl"), type: "deadline", what: what, done: false };
    r.date = it.date; r.date0 = it.date; r.sess = r.sess || s0.id;   /* date0: روزی که با «آره» ِ او ثبت شد (دورِ ۲۷، C58: ✏️ ِ روز آن را «جایگزین» می‌کند، نه جابه‌جا) */ r.by = it.dl ? "her-yes" : "her-words"; r.src = { sess: s0.id, mid: m && A.liveMsgId ? A.liveMsgId(m) : "", at: String((m && m.at) || "") }; r.quote = clip(it.what, 200);
    /* منبعِ کاملِ a38 (span = بندِ خودِ او در پیامِ تعهد — قراردادِ دورِ ۲۱ برای اصلاحِ بعدی)، وقتی در دسترس است */
    try { if (m && A.liveSrc && A.liveMsgId) { var ls = A.liveSrc(s0.id, A.liveMsgId(m), "deadline", it.what); if (ls && ls.sess) r.src = Object.assign({ at: String(m.at || "") }, ls); } } catch (e) { }
    if (it.dl && /^\d{1,2}:\d{2}$/.test(String(it.dl.time || ""))) r.time = it.dl.time;
    if (!r.src20 && m && AS.msgId) r.src20 = { sess: s0.id, msg: AS.msgId(m), span: clip(it.what, 200), key: "deadline:" + r.id };   /* منبع = پیامِ خودِ تعهد، نه «آره» */
    S.put(r); try { if (AS.deadlineSync) AS.deadlineSync(r); } catch (e) { } return r;
  }
  function covered25(s0, it, m) {
    var at = String(m.at || "");
    if (S.all("deadline", function (x) { return x && !x.done && x.date === it.date && (x.sess === s0.id || (x.src && x.src.sess === s0.id)); }).length) return true;
    if ((s0.plans || []).some(function (q) { return q && q.when === it.date && (String(q.at || "") === at || ovS(q.text, it.what) >= 1); })) return true;
    if (S.all("fcast", function (f) { return f && f.due === it.date && f.src && f.src.chat === s0.id && !f.outcome; }).some(function (f) { return ovS(f.q, it.what) >= 2; })) return true;
    return false;
  }
  var NO25 = /^\s*(?:نه|نخیر|غلطه|اشتباهه)(?![آ-ی])/, YES25 = /^\s*(?:آره|آری|اره|بله|بلی|درسته|درست\s*است|همینه|دقیقاً|دقیقا)(?![آ-ی])/;
  /* دورِ ۲۶ (U19، B26·D25، D26-51): «باشه» پاسخِ «آره» به پرسشِ بازِ خودِ صفحه است (قاعدهٔ دورِ ۲۵ — «باشه پذیرفتنِ حرفِ دستیار است» — با DECISIONS_R26 Q5 عوض شد) */
  var OK26 = /^\s*(?:باشه|باشد|اوکی|اوکیه|چشم|حتماً|حتما|قبوله|خوبه|موافقم)(?![آ-ی])/;
  function pends26(s0) { var L = []; if (!s0) return L; (s0.dateWait || []).forEach(function (P) { if (P && P.state === "waiting") L.push(P); }); var P0 = s0.datePend; if (P0 && (P0.state === "open" || P0.state === "waiting") && L.indexOf(P0) < 0) L.push(P0); return L; }
  PR.datePends = pends26;
  /* روزِ دوپهلو: دو گزینه — پیش‌فرض «همان روز / همان روزِ هفتهٔ بعد» (C1)؛ با opts دو تاریخِ خوانده (C32 «جمعهٔ بعد» در روزِ دیگر، C33 «آخرِ هفته» = پنجشنبه یا جمعه) */
  function ambO26(it, d0) { return it && it.opts && it.opts.length === 2 ? it.opts : [d0, add(d0, 7)]; }
  function ambLab26(it, d0, k) { var o = ambO26(it, d0); if (it && it.opts && it.opts.length === 2) return WDFA25[dowOf(o[k])] + " " + fdate(o[k]); return k ? it.wd + (/ه$/.test(it.wd) ? "ٔ" : "ِ") + " بعد (" + fdate(o[1]) + ")" : "همان روز (" + fdate(o[0]) + ")"; }
  /* پاسخِ او کدام گزینه را برگزید؟ ⇒ ۰ / ۱ / −۱ (نامعلوم: صفحه حدس نمی‌زند) */
  function ambPick26(it, d0, x0, same, next, pos) {
    if (!(it && it.opts && it.opts.length === 2)) return same !== next ? (same ? 0 : 1) : -1;
    var o = it.opts, h = [0, 1].filter(function (k) { return (pos || []).indexOf(o[k]) >= 0; }); if (h.length === 1) return h[0];
    if (dowOf(o[0]) !== dowOf(o[1])) { var ds = wdToks26(x0).map(function (w) { return w.dow; }), h2 = [0, 1].filter(function (k) { return ds.indexOf(dowOf(o[k])) >= 0; }); if (h2.length === 1) return h2[0];
      return /(?:^|[ ،])اولی(?![آ-ی])/.test(x0) ? 0 : /(?:^|[ ،])دومی(?![آ-ی])/.test(x0) ? 1 : -1; }
    return same !== next ? (same ? 0 : 1) : -1;
  }
  function ambHint26(it) { return it.opts && it.opts.length === 2 && dowOf(it.opts[0]) !== dowOf(it.opts[1]) ? "«" + WDFA25[dowOf(it.opts[0])] + "» یا «" + WDFA25[dowOf(it.opts[1])] + "»" : it.opts ? "«همین " + it.wd + "» یا «" + it.wd + (/ه$/.test(it.wd) ? "ٔ" : "ِ") + " بعد»" : "«همین امروز» یا «" + it.wd + (/ه$/.test(it.wd) ? "ٔ" : "ِ") + " بعد»"; }
  function itemLine26(it, d0) { if (it.free) return "«" + clip(it.what, 70) + "» — " + (it.fq || "کدام روز؟"); return it.amb ? "«" + clip(it.what, 70) + "» — " + ambLab26(it, d0, 0) + " یا " + ambLab26(it, d0, 1) : "«" + clip(it.what, 70) + "» — " + WDFA25[dowOf(it.date)] + " " + fdate(it.date); }
  /* ثبتِ یک قلمِ پرسیده‌شده با تاریخِ قطعی ⇒ متنِ سطرِ تأیید */
  var REM28 = /یاد ?(?:م|مون|ت|ش)? ?(?:بنداز|بیانداز|بنداختن|بندازی|بندازید|بیندازید|بیار|بیاری|بیارید|بیاورید|بده|بدید)(?![آ-ی])|یادآور|یاد ?آوری|خبرم کن|بهم خبر بده/;
  function bookItem26(s0, P0, it) {
    var U = userMsgs(s0), src = U.filter(function (y) { return String(y.at) === String(P0.msg); })[0] || U[U.length - 1];
    if (it.pred) { var px = ((s0.coach || {}).preds || []).filter(function (y) { return y && String(y.at) === String(it.pred) && (!it.pk || y.key === it.pk); })[0];
      if (px && !px.fc && !px.out) { px.due = it.date; delete px.duePend; var f = fc27(s0, px, it.date); px.fc = f.id; delete px.fc0; return "🎯 «" + clip(px.text, 60) + "» — موعدِ داوری: " + fdate(it.date); }   /* دورِ ۲۷ (C53): همان 🎯 ِ بی‌موعد موعد می‌گیرد */
      return ""; }
    if (it.plan) { var q = (s0.plans || []).filter(function (y) { return y && y.id === it.plan; })[0]; if (!q) return "";
      if (it.past && /^\d{4}-\d\d-\d\d$/.test(String(q.when || "")) && q.when !== it.date) (q.whenHist = q.whenHist || []).push({ was: q.when, now: it.date, at: nowISO(), why: "✏️ ِ خودش به روزِ گذشته — روزِ تازه به گفتهٔ خودش", msg: String(P0.msg || "") });   /* دورِ ۲۸ (C93) */
      q.when = it.date; q.date0 = it.date; delete q.whenAsk; delete q.whenPend; q.dateBy = "her-yes";
      /* پیش‌بینیِ همان پیام که موعدش روزِ همین برنامه است ⇒ حالا 🎯 می‌گیرد */
      try { ((s0.coach || {}).preds || []).forEach(function (y) { if (y && !y.due && !y.fc && !y.out && String(y.at) === String(q.at || "")) PR.bookPred(s0, y.text, y.at, y.key, y.by); }); } catch (e) { console.warn(e); }
      var ex26 = "";
      if (it.dl) { try { var rp = dlBook25(s0, { dl: it.dl, date: it.date, what: q.text }, src); if (rp) { rp.plan = { sess: s0.id, id: q.id }; S.put(rp); ex26 = " (با یادآورِ «" + clip(rp.what, 40) + "»)"; } } catch (e) { console.warn(e); } }
      return "📌 «" + clip(q.text, 60) + "» — " + fdate(it.date) + ex26; }
    var r = dlBook25(s0, it, src);
    /* دورِ ۲۸ (C93): پاسخ به «این روز گذشته — کدام روز؟» ⇒ ثبتِ پیشین همین‌جا «جایگزین شد» (تا پاسخ نداده بود، ماند) */
    if (r && it.old) { try { var o28 = S.get(it.old); if (o28 && !o28.done && o28.id !== r.id) { (o28.fixHist = o28.fixHist || []).push({ at: nowISO(), field: "deadline", old: o28.date, new: it.date, why: "✏️ ِ خودش به روزِ گذشته — روزِ تازه به گفتهٔ خودش", msg: String(P0.msg || "") }); o28.done = true; o28.doneAt = nowISO(); o28.doneBy = { kind: "replaced", why: "edit" }; S.put(o28); } } catch (e) { } }
    try { var one = (s0.plans || []).filter(function (q) { return q && q.when === it.date && q.state !== "done" && q.state !== "notdone"; }); if (r && one.length === 1) { r.plan = { sess: s0.id, id: one[0].id }; S.put(r); } } catch (e) { }
    /* دورِ ۲۷ (C73): یادآوری در روزی جز روزِ برنامه («پنجشنبه یادم بنداز» برای امضای جمعه) یک رکورد با دو تاریخ است — به همان 📌 می‌پیوندد (r.plan، q.remind) و با بسته‌شدنِ برنامه بسته می‌شود */
    /* دورِ ۲۸ (F6؛ D28-4 «قسطِ آخرِ حصار رو سرِ برج میدم»، B28·D7 pwB2 «۲۵ آبان با صاحب‌خونه قرار دارم»، dB1 «عید هم یه برنامهٔ تمرین … می‌دم»): پیوند فقط برای
       یادآور است (C73: «یادم بنداز / یادآور …») — کارِ تازه‌ای که یک واژه با برنامهٔ دیگری مشترک دارد («حصار»، «می‌دم») کارِ خودش است و رکوردِ خودش را دارد (C94) */
    try { if (r && !r.plan && REM28.test(nrm26(String(it.what || "") + " " + String((it.dl && it.dl.what) || "") + " " + String(r.what || "")))) { var rel73 = (s0.plans || []).filter(function (q) { return q && /^\d{4}-\d\d-\d\d$/.test(String(q.when || "")) && q.when !== it.date && q.state !== "done" && q.state !== "notdone" && (ovD27(q.text, (it.dl && it.dl.what) || it.what) >= 1 || ovD27(q.text, r.what) >= 1); });
      if (rel73.length === 1) { r.plan = { sess: s0.id, id: rel73[0].id }; S.put(r); rel73[0].remind = it.date; return "⏰ یادآورِ «" + clip(rel73[0].text, 50) + "» — " + fdate(it.date) + " (همان 📌 ِ " + fdate(rel73[0].when) + "؛ یک کار، دو تاریخ)"; } } } catch (e) { }
    return "⏰ «" + clip(r ? r.what : it.what, 60) + "» — " + fdate(it.date);
  }
  /* الف) پاسخِ او به پرسش‌های بازِ صفحه — هر پیام یک بار (از کنشِ deadline ِ همان نوبت هم صدا زده می‌شود، پیش از قلابِ پس از نوبت) */
  /* ---------- دورِ ۲۷ (DECISIONS_R27 R3؛ C49، C51، C58، C69، C71، C72) — پاسخ به پرسشِ تاریخ ----------
     ریشه‌ها (نه وصلهٔ جمله): (۱) «آره» به هر پرسشِ بازِ «بی‌جواب‌مانده» هم می‌خورد (`plain && /ثبت/` روی پرسش‌های کهنه) و «آره، …» با متنِ بیشتر خوانده نمی‌شد؛
     (۲) روزِ هم‌تاریخ در هر بندی از پیامش («فردا صبح کلاس دارم») پرسشِ برنامهٔ دیگری را ثبت می‌کرد؛ (۳) روزی که نفی کرد («اول گفتم … پنجشنبه — اشتباه گفتم»،
     «این جمعه … نیست») خوانده نمی‌شد و پاسخِ پرسشِ دیگری می‌شد؛ (۴) نوبتِ ✏️ ِ خودش، با نقلِ متنِ کهنه، پاسخ گرفته می‌شد (روزِ کهنه بی «آره» ثبت می‌شد).
     حالا: «آره/بله/باشه/ثبتش کن» (تنها یا با متنِ بیشتر، در هر جملهٔ پیام) فقط تازه‌ترین پرسشِ زیرِ پاسخِ پیشینِ صفحه را جواب می‌دهد؛ پرسشِ کهنه فقط با
     «تاریخ درسته/نه» (تازه‌ترینِ مانده‌ها)، با دکمهٔ «امروز» یا با بازگفتنِ همان کار در همان روز؛ روزِ نفی‌شده نه ثبت، نه پیشنهاد، نه پاسخِ پرسشِ دیگر؛ نوبتِ ✏️ پاسخ نیست
     (PR.datePend روزش را دوباره می‌خواند و یک بار می‌پرسد). */
  var YES27 = /^\s*(?:آره|آری|اره|بله|بلی|درسته|درست\s*است|همینه|دقیقاً|دقیقا|باشه|باشد|اوکی|اوکیه|چشم|حتماً|حتما|قبوله|موافقم|ثبتش\s*کن|ثبت\s*کن)(?![آ-ی])/;
  var YESW27 = /^\s*(?:(?:آره|آری|اره|بله|بلی|درسته|درست\s*است|همینه|دقیقاً|دقیقا|باشه|باشد|اوکی|اوکیه|چشم|حتماً|حتما|قبوله|موافقم)(?![آ-ی])[\s،,.!]*)+/;
  var CORRW27 = /اشتباه (?:گفتم|نوشتم|کردم)|غلط (?:گفتم|نوشتم)|منظورم|یه اصلاح|یک اصلاح|اصلاح کنم/;
  var NEGV27 = /(?:^| )(?:نیست|نیستم|نیستیم|نیستن|نمیشه|نمی شه|نمی شود|نمی تونم|نمیتونم|نمی رسم|نمیرسم|نمیام|نمی ام|نمیاد|نمی آد|نمی آید|وقت ندارم|نمی تونیم|نمیتونیم)(?![آ-ی])/;
  var DATEW27 = new RegExp("(?:^| )(?:(?:یک|دو|سه|چهار|پنج) ?)?(?:شنبه|جمعه)(?: ?ها)?(?![آ-ی])|(?:^| )(?:" + JM26 + "|برج|عید|نوروز|سال|امسال|اول|آخر|همین|این|بعدی|نه)(?![آ-ی])", "g");
  /* هم‌پوشانیِ «کار» بی واژه‌های روز (روزِ هفته، ماه، «این/همین/نه») — «فردا صبح کلاس دارم» با «فردا صبح … اسکیس می‌زنم» هم‌کار نیست */
  function ovD27(a, b) { return ovS(nrm26(a).replace(DATEW27, " "), nrm26(b).replace(DATEW27, " ")); }
  PR.ovD27 = ovD27;
  /* روزهای پیامِ او: pos = روزهایی که پیش می‌گذارد، neg = روزهایی که نفی می‌کند، yes = جملهٔ پذیرش (هر جا که باشد) و روزهای همان جمله */
  function herDays27(t) {
    var R = { pos: [], neg: [], posC: {}, negC: {}, amb: [], ok: [], corr: CORRW27.test(nrm26(t)), yes: false, yesRest: "", yesDates: [], generic: false }, td = today();
    String(t || "").split(/\s*[،؛.!:؟?\n]\s*|\s+—\s+|\s+(?:ولی|اما)\s+/).forEach(function (c) {
      var I = null; try { I = PR.whenInfo(c); } catch (e) { } if (!I || !I.date || I.free) return;
      var xc = nrm26(c), sp = dateSpan26(xc) || { i: 0, j: 0 }, after = xc.slice(sp.j);
      var neg = /(?:^|[ ،])نه[،,]? ?$/.test(xc.slice(0, sp.i)) || /^ ?(?:ی ?)?(?:هم ?)?(?:نه|نیست|نبود|نمیشه|نمی شه)(?![آ-ی])/.test(after) || NEGV27.test(after) ||
        (R.corr && /(?:^| )(?:گفتم|نوشتم|گفته بودم|نوشته بودم)(?![آ-ی])/.test(xc) && !/منظورم/.test(xc));
      if (I.amb) { if (!neg) R.amb.push(I); else if (!I.opts) R.neg.push(I.date); return; }
      if (neg) { R.neg.push(I.date); if (!R.negC[I.date]) R.negC[I.date] = (String(t || "").split(/[.!؟?\n]+/).filter(function (z) { return z.indexOf(c.trim()) >= 0; })[0] || c).trim(); return; }
      /* دورِ ۲۸ (C92، B28·D7 dB1 p11 «عید درسته»): بازگفتنِ روزِ پرسیده با واژهٔ پذیرش، در هر جای پیام، پاسخِ همان پرسش است (هر پرسشِ مانده با همان روز) */
      if (I.date >= td && /(?:^| )(?:درسته|درست است|درسته دیگه|همینه|اوکیه|خوبه)$/.test(xc.replace(/[\s.!]+$/, ""))) R.ok.push(I.date);
      if (I.date < td || (PAST26.test(xc) && !/منظورم/.test(xc)) || ((THIRD26.test(xc) || OTHER26.test(xc)) && !FIRST26.test(xc))) return;
      R.pos.push(I.date); if (!R.posC[I.date]) R.posC[I.date] = c.trim();
    });
    /* «جمعهٔ بعد … این جمعه نه» ⇒ از دو جمعه فقط یکی می‌ماند */
    R.amb.forEach(function (I) { var o = I.opts || [I.date, add(I.date, 7)], left = o.filter(function (d) { return R.neg.indexOf(d) < 0 && d >= td; }); if (left.length === 1 && o.some(function (d) { return R.neg.indexOf(d) >= 0; })) { R.pos.push(left[0]); R.posC[left[0]] = R.posC[left[0]] || ""; } });
    R.pos = R.pos.filter(function (d, i, X) { return R.neg.indexOf(d) < 0 && X.indexOf(d) === i; });
    var ys = sentsOf25(t).filter(function (z) { return YES27.test(z); })[0];
    /* دورِ ۲۸ (C113؛ D28-16 tD1 p16 «یه مسئلهٔ دیگه هم دارم: ماشینم … ثبتش کن»): «ثبتش کن» با مفعولِ نام‌برده (مسئله/سؤالِ تازه، یا «ثبتش کن: …») همان را می‌خواهد، نه پرسشِ تاریخ */
    if (ys && /^\s*ثبت/.test(ys) && (/ثبت ?(?:ش)? ?کن\s*[:：]\s*\S/.test(nrm26(t)) || /(?:مسئله|مساله|سؤال|سوال|مشکل|موضوع)\S* ?(?:ی ?)?(?:دیگه|دیگر|جدید|تازه)|(?:یه|یک) (?:مسئله|مساله|سؤال|سوال|مشکل)\S* (?:دیگه|دیگر|جدید|تازه)/.test(nrm26(t)))) ys = null;
    if (ys) { R.yes = true; R.yesRest = ys.replace(YESW27, ""); var rx = nrm26(R.yesRest);
      R.yesRest.split(/\s*[،؛:]\s*/).forEach(function (c) { var I = null; try { I = PR.whenInfo(c); } catch (e) { } if (I && I.date && !I.amb && I.date >= td && R.neg.indexOf(I.date) < 0) R.yesDates.push(I.date); });
      R.generic = toks(R.yesRest).length <= 2 || /درست|همینه|همین (?:روز|تاریخ)|تاریخ|ثبت|بذار|بگذار|یاد|پیگیری|لطف/.test(rx); }
    return R;
  }
  PR.herDays27 = herDays27;
  PR.dateAnswer = function (s0) {
    var U = userMsgs(s0), m = U[U.length - 1]; if (!m || !s0) return false; var t = String(m.text || ""), at = String(m.at || ""), x0 = nrm26(t), dirty = false;
    /* C58: نوبتِ ✏️ پاسخِ پرسش نیست — متنِ کهنهٔ نقل‌شده در آن روزِ تازه‌ای نمی‌گوید (B27·D10) */
    if (/^\s*\[اصلاحِ پیامِ قبلی\]/.test(t)) return false;
    var L = pends26(s0).filter(function (P) { return String(P.msg) !== at && P.seen !== at; }); if (!L.length) return false;
    var R = herDays27(t), short = toks(t).length <= 6, td = today();
    /* «شنبه.» / «نه، پنجشنبه» — پیامی که جز روز چیزی نمی‌گوید؛ «امروز خسته‌ام» روزی برای آن کار نمی‌گذارد */
    var bare27 = !toks(x0.replace(DATEW27, " ").replace(/(?:^| )(?:یکم|اول|دوم|سوم|چهارم|پنجم|ششم|شیشم|هفتم|هشتم|نهم|دهم|یازدهم|دوازدهم|سیزدهم|چهاردهم|پانزدهم|پونزدهم|شانزدهم|شونزدهم|هفدهم|هجدهم|نوزدهم|بیستم|بیست|سی ?ام|ام|حدود|حدودا|حدوداً|تقریبا|تقریباً)(?![آ-ی])/g, " ").replace(/(?:^| )(?:نه|آره|بله|باشه|پس|بذار|بگذار|بعدش|بعدی|همون|همان)(?![آ-ی])/g, " ")).length;
    var same = /همین ?امروز|(?:^|[ ،])امروز(?![آ-ی])|همین ?(?:(?:یک|دو|سه|چهار|پنج) ?)?(?:شنبه|جمعه)|(?:^|[ ،])اولی(?![آ-ی])/.test(x0), next = new RegExp("(?:شنبه|جمعه) ?(?:ی ?)?" + NEXT26 + "|هفته ?(?:ی ?)?" + NEXT26 + "|(?:^|[ ،])(?:بعدی|دومی|اون یکی|آن یکی)(?![آ-ی])|^ ?(?:بعد|بعدش)[ .!]*$").test(x0);
    var nSame = /(?:^|[ ،])(?:همین ?)?امروز ?(?:که ?)?(?:نه|نیست|نمیشه|نمی شه|نمی تونم|نمیتونم|وقت ندارم)(?![آ-ی])|(?:^|[ ،])نه ?،? ?(?:همین ?)?امروز(?![آ-ی])/.test(x0), nNext = new RegExp("(?:شنبه|جمعه|هفته) ?(?:ی ?)?" + NEXT26 + " ?(?:نه|نیست|نمیشه|نمی شه)(?![آ-ی])").test(x0);
    if (nSame) { same = false; next = true; } else if (nNext) { next = false; same = true; }
    /* روزهای نفی‌شده از نامِ روزهای این پیام بیرون می‌روند (C51: «پنجشنبه نه، شنبه» پاسخِ «پنجشنبه» به پرسشِ دیگری نیست) */
    var xA = x0; wdToks26(x0).forEach(function (w) { var I = null; try { I = PR.whenInfo(w.name); } catch (e) { } if (I && R.neg.indexOf(I.date) >= 0) xA = xA.slice(0, w.start) + new Array(w.end - w.start + 1).join(" ") + xA.slice(w.end); });
    var mine = []; try { mine = PR.herDates(t, s0).filter(function (o) { return !o.amb && R.neg.indexOf(o.date) < 0; }); } catch (e) { }
    var mineFor = function (it) { return mine.some(function (o) { return o.date === it.date && ovD27(o.what, it.what) >= 1 && sameAct28(o.what, it.what); }); };   /* دورِ ۲۸: کارِ دیگری با همان روز و یک واژهٔ مشترک («خونه») بازگفتنِ این کار نیست */
    var open = L.filter(function (P) { return P.state === "open"; }).slice(-1)[0] || null;
    var newest = open || L.slice().sort(function (a, b) { return String(a.at || "").localeCompare(String(b.at || "")); }).slice(-1)[0];
    var exYes = /(?:^|[ ،])تاریخ\S* ?(?:هم ?)?(?:درسته|درست است|همینه|اوکیه|خوبه)/.test(x0), exNo = /(?:^|[ ،])تاریخ\S* ?(?:نه|غلطه|اشتباهه|درست نیست)|ثبت(?:ش)? ?نکن/.test(x0);
    var re27 = [];
    var planOf = function (it) { return it.plan ? (s0.plans || []).filter(function (y) { return y && y.id === it.plan; })[0] || null : null; };
    var unpend = function (it) { var q = planOf(it); if (q) { delete q.whenPend; delete q.whenAsk; } };
    var altFor = function (it, negd) { var c = R.pos.filter(function (d) { return d !== it.date && d >= td; });
      /* دورِ ۲۸ (بانکِ R28 #8): «پنجشنبه نه، چهارشنبه» در خودِ چهارشنبه — روزِ جایگزینی که نامِ امروز است، امروز نیست (برای امروز «امروز» می‌گفت) ⇒ همان روزِ هفتهٔ بعد */
      if (!c.length && negd) c = R.amb.filter(function (I) { return !I.opts && I.date > it.date; }).map(function (I) { return I.date; });
      if (c.length === 1) return c[0]; var c2 = c.filter(function (d) { return ovD27(R.posC[d] || "", it.what) >= 1; }); return c2.length === 1 ? c2[0] : ""; };
    var whatFor = function (it, d) { var q = planOf(it); if (q) return q.text; var c = R.posC[d] || ""; return toks(c).length >= 2 ? clip(c.replace(/[.!\s]+$/, ""), 120) : it.what; };
    L.forEach(function (P0) {
      var first = P0 === open, isNew = P0 === newest, done = [], left = [], said = false, quiet = false, lap = [], noAlt = [];
      (P0.items || []).forEach(function (it) {
        var ds = it.free ? [] : it.amb ? ambO26(it, P0.d0) : [it.date];
        /* C49/C69: پرسشی که روزش گذشته با هیچ پاسخی ثبت نمی‌شود و تاریخِ تازه‌ای هم از آن ساخته نمی‌شود */
        if (ds.length && ds.every(function (d) { return d < td; })) { lap.push(it); return; }
        /* C51: روزِ پرسیده را نفی کرد ⇒ کنار؛ روزی که به جایش گفت (اگر یکی است) برای همان کار یک بار پرسیده می‌شود؛ وگرنه «کدام روز؟» (C71) */
        /* دورِ ۲۸ (C92، A28-1 s01 p23 «برای ودیعه هم باید برم بانک؛ پنجشنبه نه، شنبه می‌رم» پرسشِ «فردا به بنگاه زنگ می‌زنم» را جابه‌جا کرد): «X نه، Y» فقط کارِ جملهٔ خودش را
           جابه‌جا می‌کند — جمله‌ای که جز روز و واژه‌های قاب («مهلت»، «نیست») چیزی ندارد، یا همان کار را می‌گوید */
        if (!it.amb && R.neg.indexOf(it.date) >= 0 && negBound28(R, it.date, it.what, bare27)) { said = true; quiet = true; (s0.dateNo = s0.dateNo || []).push(it.date); var a1 = altFor(it, true);
          if (a1) re27.push(Object.assign({}, it, { date: a1, what: whatFor(it, a1), amb: false, opts: undefined, wd: "", was: it.date }));
          else { noAlt.push(it); re27.push(Object.assign({}, it, { date: add(td, 1), amb: true, free: true, opts: undefined, wd: "", was: it.date, why: "neg" })); }
          return; }
        /* دورِ ۲۸ (C92): «عید درسته» ⇒ همان پرسشی که روزش عید است، هر کجا که مانده باشد */
        if (!it.amb && !it.free && R.ok.indexOf(it.date) >= 0) { var l9 = bookItem26(s0, P0, it); if (l9) done.push(l9); said = true; return; }
        /* دورِ ۲۸ (C92؛ B28·D6 dB1 p10، D28-22 tD2 p7): ردیفِ «کدام روز؟» فقط با روزی جواب می‌گیرد که برای همان کار نوشت — پیامی که جز روز چیزی نمی‌گوید، یا جمله‌ای
           که همان کار را می‌گوید؛ روزِ کارِ دیگری در همان پیام («عید هم یه برنامهٔ تمرین …»، «عید که شد میریم خونهٔ مادرم») پاسخِ آن نیست */
        if (it.free) { var cand = R.pos.filter(function (d) { return d >= it.date && (bare27 || (ovD27(R.posC[d] || "", it.what) >= 1 && sameAct28(R.posC[d] || "", it.what))); });
          if (isNew && cand.length === 1) { it.date = cand[0]; it.amb = false; delete it.free; var l0 = bookItem26(s0, P0, it); if (l0) done.push(l0); said = true; s0._ans28 = { at: at, d: cand.slice() }; }
          else if (isNew && (first ? NO25.test(t) : exNo)) { said = true; }
          else left.push(it); return; }
        if (it.amb) {
          /* دورِ ۲۷ (C49): نامِ روز («جمعهٔ بعد»، «همین امروز») فقط تازه‌ترین پرسش را جواب می‌دهد — پرسشِ باز، یا اگر پرسشِ بازی نیست تنها/تازه‌ترینِ مانده‌ها */
          if (!first && !(isNew && !open)) { var mw = it.opts ? mine.filter(function (o) { return it.opts.indexOf(o.date) >= 0 && ovD27(o.what, it.what) >= 1; })[0] : null;
            if (mw) { it.date = mw.date; it.amb = false; delete it.opts; var lw = bookItem26(s0, P0, it); if (lw) done.push(lw); said = true; } else left.push(it); return; }
          /* دورِ ۲۸ (C134 ← C92/C49؛ بانکِ R22 #80 در یک سه‌شنبه): پرسشِ دوپهلویی که دیگر زیرِ آخرین پاسخِ صفحه باز نیست («بی‌جواب ماند») فقط با پیامی جواب می‌گیرد
             که جز روز چیزی نمی‌گوید یا همان کار را نام می‌برد — «امروز وقت ندارم» سه پیام بعد، «نه امروز» ِ آن موعد نیست و «سه‌شنبهٔ بعد» را ثبت نمی‌کند */
          if (!first && !bare27 && !(ovD27(t, it.what) >= 1 && sameAct28(t, it.what))) { left.push(it); return; }
          var k26 = ambPick26(it, P0.d0, xA, same, next, R.pos), od = k26 >= 0 ? ambO26(it, P0.d0)[k26] : "";
          if (od && od < td) { left.push(it); return; }   /* دورِ ۲۸ (F6، B28·D7 dB1 p11): گزینهٔ «همان روز» ِ پرسشی که روزش گذشته ثبت نمی‌شود (۲ آذر در ۶ آذر) */
          if (od && R.neg.indexOf(od) < 0) { it.date = od; it.amb = false; delete it.opts; var l1 = bookItem26(s0, P0, it); if (l1) done.push(l1); said = true; }
          else if (first && (NO25.test(t) || exNo) && !same && !next) { said = true; Array.prototype.push.apply((s0.dateNo = s0.dateNo || []), ambO26(it, P0.d0)); }
          else left.push(it);
          return; }
        var other = R.yesDates.filter(function (d) { return d !== it.date; });
        if (first && R.yes && (R.yesDates.indexOf(it.date) >= 0 || (R.generic && !other.length))) { var l2 = bookItem26(s0, P0, it); if (l2) done.push(l2); said = true; }
        /* C72: «بله، پس‌فردا» به پرسشِ «فردا» ⇒ روزِ خودش؛ یک بار با تاریخش تأیید می‌شود */
        else if (first && R.yes && other.length === 1) { said = true; quiet = true; re27.push(Object.assign({}, it, { date: other[0], what: whatFor(it, other[0]), was: it.date })); }
        else if (isNew && exYes) { var l3 = bookItem26(s0, P0, it); if (l3) done.push(l3); said = true; }
        /* دورِ ۲۸ (C92، A28-3 s01 p29 «قبضِ آب رو هم اولِ ماه می‌دم» پرسشِ «اجاره … سرِ برج» را ثبت کرد): همان روز برای کارِ دیگری پاسخِ این پرسش نیست */
        else if ((first && short && R.pos.indexOf(it.date) >= 0 && (bare27 || (ovD27(R.posC[it.date] || "", it.what) >= 1 && sameAct28(R.posC[it.date] || "", it.what)))) || mineFor(it)) { var l4 = bookItem26(s0, P0, it); if (l4) done.push(l4); said = true; }
        /* روزِ دیگری برای همین کار گذاشت («منظورم پس‌فردا صبح بود»؛ «نه، شنبه») ⇒ روزِ پیشین کنار، روزِ تازه یک بار پرسیده می‌شود */
        else if (first && altFor(it) && (R.corr || NO25.test(t) || (AS.CORR_RE && AS.CORR_RE.test(t)) || (short && (bare27 || (ovD27(R.posC[altFor(it)] || "", it.what) >= 1 && sameAct28(R.posC[altFor(it)] || "", it.what)))))) { var a2 = altFor(it); said = true; quiet = true; (s0.dateNo = s0.dateNo || []).push(it.date); re27.push(Object.assign({}, it, { date: a2, what: whatFor(it, a2), was: it.date })); }
        else if (isNew && (first ? NO25.test(t) : exNo)) { said = true; (s0.dateNo = s0.dateNo || []).push(it.date); unpend(it); }
        else left.push(it);
      });
      if (lap.length) { P0.lapsed = (P0.lapsed || []).concat(lap.map(function (z) { return { what: z.what, date: z.date, at: at, why: "date" }; }));
        if (isNew && (R.yes || exYes)) sysLine25(s0, "📅 روزِ «" + clip(lap[0].what, 60) + "» (" + fdate(lap[0].date) + ") گذشته بود — پرسشش بسته شد و چیزی ثبت نشد."); dirty = true; }
      if (!said && !first && !lap.length) return;
      P0.seen = at; dirty = true;
      if (done.length) sysLine25(s0, "✓ به گفتهٔ خودت ثبت شد و در «امروز» می‌آید: " + done.join(" · "));
      else if (said && !quiet) sysLine25(s0, "باشد — تاریخی ثبت نشد.");
      if (noAlt.length) sysLine25(s0, "📅 «" + clip(noAlt[0].what, 60) + "» — آن روز را کنار گذاشتی و چیزی ثبت نشد؛ کدام روز؟ خودِ روز را بنویس.");
      if (!left.length) { P0.state = done.length ? "booked" : lap.length && !said ? "lapsed" : "dropped"; P0.answeredAt = at; return; }
      P0.items = left; P0.state = "waiting"; if (said) P0.answeredAt = at;
      if (first) {
        var ambL = left.filter(function (z) { return z.amb && !z.free; });
        /* پرسشِ دوپهلو دوباره زیرِ همین پاسخ پرسیده شد ⇒ هنوز تازه‌ترین پرسش است (پاسخِ بعدی‌اش، مثلاً «جمعهٔ بعد»، همین را جواب می‌دهد) */
        if (ambL.length && R.yes && R.generic && short) { sysLine25(s0, "📅 «" + clip(t, 30) + "» را به یکی از دو روز نتوانستم بخوانم — " + ambL.map(function (z) { return itemLine26(z, P0.d0); }).join(" · ") + "؟ یکی را بنویس (" + ambHint26(ambL[0]) + ")."); P0.state = "open"; }
        else sysLine25(s0, "📅 پرسشِ تاریخ بی‌جواب ماند و چیزی ثبت نشد: " + left.map(function (z) { return itemLine26(z, P0.d0); }).join(" · ") + ". با «تاریخ درسته» ثبت می‌شود و با «تاریخ نه» کنار می‌رود" + (ambL.length ? " (برای روزِ دوپهلو خودِ روز را بنویس)" : "") + "؛ تا آن وقت در «امروز» به‌شکلِ پرسش می‌ماند.");
      }
    });
    if (re27.length) s0._re26 = (s0._re26 || []).concat(re27);
    return dirty;
  };
  /* دورِ ۲۶ — خوانندهٔ پیشینِ پاسخ (قرنطینه؛ DECISIONS_R27 C49 جایش را گرفت: «آره» به همهٔ پرسش‌های مانده می‌خورد). صدا زده نمی‌شود. */
  PR.R27_QUARANTINE = PR.R27_QUARANTINE || {};
  PR.R27_QUARANTINE.dateAnswer26 = function (s0) {
    var U = userMsgs(s0), m = U[U.length - 1]; if (!m || !s0) return false; var t = String(m.text || ""), at = String(m.at || ""), x0 = nrm26(t), dirty = false;
    var same = /همین ?امروز|(?:^|[ ،])امروز(?![آ-ی])|همین ?(?:(?:یک|دو|سه|چهار|پنج) ?)?(?:شنبه|جمعه)|(?:^|[ ،])اولی(?![آ-ی])/.test(x0), next = new RegExp("(?:شنبه|جمعه) ?(?:ی ?)?" + NEXT26 + "|هفته ?(?:ی ?)?" + NEXT26 + "|(?:^|[ ،])(?:بعدی|دومی|اون یکی|آن یکی)(?![آ-ی])|^ ?(?:بعد|بعدش)[ .!]*$").test(x0);
    /* روزی که نفی کرد دوباره پیشنهاد نمی‌شود: «امروز نه» ⇒ آن دیگری */
    var nSame = /(?:^|[ ،])(?:همین ?)?امروز ?(?:که ?)?(?:نه|نیست|نمیشه|نمی شه|نمی تونم|نمیتونم|وقت ندارم)(?![آ-ی])|(?:^|[ ،])نه ?،? ?(?:همین ?)?امروز(?![آ-ی])/.test(x0), nNext = new RegExp("(?:شنبه|جمعه|هفته) ?(?:ی ?)?" + NEXT26 + " ?(?:نه|نیست|نمیشه|نمی شه)(?![آ-ی])").test(x0);
    if (nSame) { same = false; next = true; } else if (nNext) { next = false; same = true; }
    var yes0 = YES25.test(t) || OK26.test(t), short = toks(t).length <= 6;
    /* «آره» ِ ساده: پس از واژهٔ تأیید چیزِ دیگری نمی‌گوید («آره، ثبتش کن»، «باشه.») — «آره همون فصلِ ۲ رو میگم» جوابِ دستیار است، نه تأییدِ تاریخ (بانکِ R26 #136) */
    var rest0 = t.replace(/^\s*(?:(?:آره|آری|اره|بله|بلی|درسته|درست\s*است|همینه|دقیقاً|دقیقا|باشه|باشد|اوکی|اوکیه|چشم|حتماً|حتما|قبوله|خوبه|موافقم)[\s،,.!]*)+/, ""), rx = nrm26(rest0);
    var RD = { neg: [], pos: [] };   /* روزهایی که همین پاسخ نفی کرد / پیش گذاشت («باشه ولی شنبه نه، یکشنبه») */
    try { t.split(/\s*[،؛.!:]\s*|\s+—\s+|\s+(?:ولی|اما)\s+/).forEach(function (c) { var I = PR.whenInfo(c); if (!I || !I.date || I.amb) return; var xc = nrm26(c), sp = dateSpan26(xc) || { i: 0, j: 0 };
        if (/(?:^|[ ،])نه[،,]? ?$/.test(xc.slice(0, sp.i)) || /^ ?(?:ی ?)?(?:هم ?)?(?:نه|نیست|نبود|نمیشه|نمی شه)(?![آ-ی])/.test(xc.slice(sp.j))) RD.neg.push(I.date); else if (I.date >= today() && !PAST26.test(xc)) RD.pos.push(I.date); }); } catch (e) { }
    var rs1 = rest0.split(/[.!؟?\n]/)[0], rx1 = nrm26(rs1);
    var plain = yes0 && !RD.neg.length && (toks(rs1).length <= 2 || (toks(rs1).length <= 6 && /درست|همینه|همین (?:روز|تاریخ)|تاریخ|ثبت|بذار|بگذار/.test(rx1)));
    var mine = []; try { mine = PR.herDates(t, s0).filter(function (o) { return !o.amb; }).map(function (o) { return o.date; }); } catch (e) { }
    var re26 = [];
    pends26(s0).forEach(function (P0) {
      if (String(P0.msg) === at || P0.seen === at) return;
      var first = P0.state === "open", done = [], left = [], said = false, quiet = false;
      var yes = first ? plain : (/(?:^|[ ،])تاریخ\S* ?(?:هم ?)?(?:درسته|درست است|همینه|اوکیه|خوبه)/.test(x0) || (plain && /درست|همینه|ثبت/.test(x0)));
      var no = first ? NO25.test(t) : /(?:^|[ ،])تاریخ\S* ?(?:نه|غلطه|اشتباهه|درست نیست)|ثبت(?:ش)? ?نکن/.test(x0);
      (P0.items || []).forEach(function (it) {
        if (it.amb) { var k26 = ambPick26(it, P0.d0, x0, same, next, RD.pos);
          if (k26 >= 0) { it.date = ambO26(it, P0.d0)[k26]; it.amb = false; delete it.opts; var l1 = bookItem26(s0, P0, it); if (l1) done.push(l1); said = true; }
          else if (no && !same && !next) { said = true; Array.prototype.push.apply((s0.dateNo = s0.dateNo || []), ambO26(it, P0.d0)); }
          else left.push(it); }
        else if ((yes && (!RD.pos.length || RD.pos.indexOf(it.date) >= 0)) || (first && RD.pos.indexOf(it.date) >= 0 && RD.neg.indexOf(it.date) < 0 && short) || (mine.indexOf(it.date) >= 0 && RD.neg.indexOf(it.date) < 0)) { var l2 = bookItem26(s0, P0, it); if (l2) done.push(l2); said = true; }
        /* روزِ پرسیده را نفی کرد یا روزِ دیگری گذاشت ⇒ آن روز دیگر پیشنهاد نمی‌شود؛ روزِ تازه (اگر یکی است) برای همان کار پرسیده می‌شود (بانکِ R26 #146) */
        else if (first && (RD.neg.indexOf(it.date) >= 0 || (RD.pos.length && (yes0 || NO25.test(t) || short || (AS.CORR_RE && AS.CORR_RE.test(t)))))) { said = true; quiet = true; (s0.dateNo = s0.dateNo || []).push(it.date);
          var alt = RD.pos.filter(function (d, i, X) { return RD.neg.indexOf(d) < 0 && X.indexOf(d) === i; }); if (alt.length === 1) re26.push(Object.assign({}, it, { date: alt[0] })); else { quiet = false; if (it.plan) { var q0 = (s0.plans || []).filter(function (y) { return y && y.id === it.plan; })[0]; if (q0) { delete q0.whenPend; delete q0.whenAsk; } } } }
        else if (no) { said = true; (s0.dateNo = s0.dateNo || []).push(it.date); if (it.plan) { var q = (s0.plans || []).filter(function (y) { return y && y.id === it.plan; })[0]; if (q) { delete q.whenPend; delete q.whenAsk; } } }
        else left.push(it);
      });
      if (!said && !first) return;
      P0.seen = at; dirty = true;
      if (done.length) sysLine25(s0, "✓ به گفتهٔ خودت ثبت شد و در «امروز» می‌آید: " + done.join(" · "));
      else if (said && !quiet) sysLine25(s0, "باشد — تاریخی ثبت نشد.");
      if (!left.length) { P0.state = done.length ? "booked" : "dropped"; P0.answeredAt = at; return; }
      P0.items = left; P0.state = "waiting"; if (said) P0.answeredAt = at;
      if (first) {
        var ambL = left.filter(function (z) { return z.amb; });
        if (ambL.length && (plain || no) && short) sysLine25(s0, "📅 «" + clip(t, 30) + "» را به یکی از دو روز نتوانستم بخوانم — " + ambL.map(function (z) { return itemLine26(z, P0.d0); }).join(" · ") + "؟ یکی را بنویس (" + ambHint26(ambL[0]) + ").");
        else sysLine25(s0, "📅 پرسشِ تاریخ بی‌جواب ماند و چیزی ثبت نشد: " + left.map(function (z) { return itemLine26(z, P0.d0); }).join(" · ") + ". با «تاریخ درسته» ثبت می‌شود و با «تاریخ نه» کنار می‌رود" + (ambL.length ? " (برای روزِ دوپهلو خودِ روز را بنویس)" : "") + "؛ تا آن وقت در «امروز» به‌شکلِ پرسش می‌ماند.");
      }
    });
    if (re26.length) s0._re26 = (s0._re26 || []).concat(re26);
    return dirty;
  };
  /* پاسخ از «امروز» (دکمه‌های ردیفِ پرسش): v = "yes" | "no" | تاریخ (برای روزِ دوپهلو) */
  PR.dateResolve = function (sid, pi, ii, v) {
    var s0 = S.get(sid); if (!s0) return false; var P0 = pends26(s0)[pi], it = P0 && (P0.items || [])[ii]; if (!it) return false;
    if (v === "no") { (s0.dateNo = s0.dateNo || []).push(it.date); if (it.plan) { var q = (s0.plans || []).filter(function (y) { return y && y.id === it.plan; })[0]; if (q) { delete q.whenPend; delete q.whenAsk; } } sysLine25(s0, "باشد — تاریخی ثبت نشد (از «امروز»)."); }
    else { if (/^\d{4}-\d\d-\d\d$/.test(String(v))) { it.date = v; it.amb = false; } if (it.amb) return false; var l = bookItem26(s0, P0, it); if (l) sysLine25(s0, "✓ به گفتهٔ خودت (از «امروز») ثبت شد: " + l); }
    P0.items.splice(ii, 1); if (!P0.items.length) P0.state = v === "no" ? "dropped" : "booked"; S.put(s0); return true;
  };
  /* «آره» به همهٔ پرسش‌های بازِ بی‌ابهامِ یک سشن — همان راهِ دکمهٔ «آره، همین» ِ «امروز» (برای آزمون‌ها و کارِ دسته‌ای) */
  PR.dateYes = function (sid, reportedOnly) {   /* reportedOnly: فقط پرسش‌هایی که رکوردِ گزارش‌شدهٔ مدل (برنامه یا کنشِ deadline) پشتشان است */
    var s0 = sid ? S.get(sid) : (AS && AS.cur ? AS.cur() : null); if (!s0) return 0; var n = 0, guard = 0;
    while (guard++ < 50) { var L = pends26(s0), hit = false;
      for (var pi = 0; pi < L.length && !hit; pi++) for (var ii = 0; ii < (L[pi].items || []).length && !hit; ii++) if (!L[pi].items[ii].amb && (!reportedOnly || L[pi].items[ii].plan || L[pi].items[ii].dl) && PR.dateResolve(s0.id, pi, ii, "yes")) { n++; hit = true; }
      if (!hit) break; }
    return n;
  };
  /* ---------- دورِ ۲۷ (C49، C51، C58، C69): سرآمدن، ✏️، روزِ نفی‌شدهٔ برنامهٔ ثبت‌شده ---------- */
  /* پرسشِ سرآمده؟ ⇒ دلیل («date» | «done») یا "" — روزش تمام شده (C69: در خودِ روزش هنوز باز است)، برنامه‌اش بسته شد، پیگیری‌اش انجام شد */
  function lapsed27(s0, it, d0) {
    if (!it) return ""; var td = today();
    if (!it.free) { var ds = it.amb ? ambO26(it, d0 || td) : [it.date]; if (ds.every(function (d) { return d < td; })) return "date"; }
    if (it.plan) { var q = (s0.plans || []).filter(function (y) { return y && y.id === it.plan; })[0]; if (q && (q.done || q.state === "done" || q.state === "notdone" || q.state === "expired")) return "done"; }
    if (it.dl && it.dl.what) { try { if (S.all("deadline", function (r) { return r && r.done && r.what === it.dl.what && (r.sess === s0.id || (r.src && r.src.sess === s0.id)); }).length) return "done"; } catch (e) { } }
    return "";
  }
  PR.lapsed27 = lapsed27;
  /* «زنگ زدم»، «خریدیم!» — گزارشِ انجامِ همان کار در پیامِ تازه: بندِ گذشته با هم‌پوشانیِ کار، یا گزارشِ کوتاهِ گذشته زیرِ تازه‌ترین پرسش */
  function didIt27(t, it, newest) {
    var x = nrm26(t); if (!PAST26.test(x) || CORRW27.test(x)) return false;   /* «اول گفتم … اشتباه گفتم» گزارشِ انجام نیست */
    var hit = sentsOf25(t).some(function (c) { var xc = nrm26(c); return PAST26.test(xc.replace(/(?:^| )(?:گفتم|نوشتم|گفته بودم|نوشته بودم|گفتیم)(?![آ-ی])/g, " ")) && !THIRD26.test(xc) && ovD27(c, it.what) >= 1; });
    if (hit) return true;
    var stem = function (w) { return w.replace(/^(?:ن?می ?|ب)/, "").replace(/(?:یم|ید|ند|م|ی|ه)$/, ""); };
    var vb = (x.match(/[آ-ی]{2,}(?:م|یم)(?![آ-ی])/g) || []).map(stem).filter(function (w) { return w.length >= 2; });
    if (vb.some(function (v) { return nrm26(it.what).split(" ").some(function (w) { var s = stem(w); return s.length >= 2 && (v.indexOf(s) === 0 || s.indexOf(v) === 0); }); })) return true;
    return !!newest && toks(t).length <= 1;
  }
  /* دورِ ۲۸ (dates، C94؛ B28·D14 dB1 p2 «نمرهٔ آزمونِ مهر میانگین ۱۲ بود» پرسشِ «پنجشنبه یه آزمونِ کوتاه می‌گیرم» را بست، A27-19 aA3 p8 «زنگ زدم»):
     ریشه: didIt27 هر فعلِ گذشته‌ای (حتی رابطِ «بود») را با یک واژهٔ مشترک گزارشِ انجام می‌گرفت. حالا گزارشِ انجام = گذشتهٔ اول‌شخصِ **همان فعلِ کار**
     («می‌گیرم» ⇐ «گرفتم»، «زنگ می‌زنم» ⇐ «زنگ زدم»، «می‌خرم» ⇐ «خریدم»، «تصحیح می‌کنم» ⇐ «تصحیح کردم»)؛ فعلِ سبک (کن/زن/ده/گیر/خور/کش) جزءِ همراهش را هم می‌خواهد.
     کاری که فعلش خوانده نشد ⇒ همان قاعدهٔ پیشین بی رابطِ «بود/بودم». نفی («نخریدم») گزارشِ انجام نیست. بدنهٔ پیشین: PR.R28_QUARANTINE.didIt27. */
  var STEM28 = { "گیر": ["گرفت"], "زن": ["زد"], "د": ["داد"], "ده": ["داد"], "خر": ["خرید"], "ر": ["رفت"], "رو": ["رفت"], "کن": ["کرد"], "گو": ["گفت"], "گ": ["گفت"], "خون": ["خوند", "خواند"], "خوان": ["خواند", "خوند"],
    "نویس": ["نوشت"], "بر": ["برد"], "یار": ["آورد", "اورد"], "آر": ["آورد"], "بین": ["دید"], "پرس": ["پرسید"], "فرست": ["فرستاد"], "ساز": ["ساخت"], "فروش": ["فروخت"], "ذار": ["ذاشت", "گذاشت"],
    "گذار": ["گذاشت"], "رس": ["رسید"], "خور": ["خورد"], "کش": ["کشید"], "بند": ["بست"], "پز": ["پخت"], "شور": ["شست"], "شمار": ["شمرد"], "پرداز": ["پرداخت"], "انداز": ["انداخت"], "ریز": ["ریخت"],
    "پوش": ["پوشید"], "چین": ["چید"], "سپار": ["سپرد"], "دوز": ["دوخت"], "شکن": ["شکست"], "برگرد": ["برگشت"], "گرد": ["گشت"], "آ": ["اومد", "آمد"], "یا": ["اومد", "آمد"], "شنو": ["شنید"], "فهم": ["فهمید"],
    "خواب": ["خوابید"], "دو": ["دوید"], "کار": ["کاشت"], "بخش": ["بخشید"], "چرخ": ["چرخید"], "تمرین": ["تمرین"], "رسون": ["رسوند"], "رسان": ["رساند"], "گذرون": ["گذروند"], "مون": ["موند"], "مان": ["ماند"] };
  var LIGHT28 = /^(?:کن|زن|د|ده|گیر|خور|کش|بر|یار|آر|ذار|گذار)$/;
  function verbs28(what) {
    var x = nrm26(what), out = [], re = /(?:^| )(?:ن?می) ([آ-ی]+?)(?:م|یم)(?![آ-ی])/g, m;
    while ((m = re.exec(x))) { var st = m[1], P = STEM28[st] || STEM28[st.replace(/^ب/, "")]; if (!P) continue; var pre = x.slice(0, m.index).trim().split(" ").pop() || "";
      out.push({ past: P, pre: LIGHT28.test(st) && pre && !/^(?:رو|را|هم|تا|که|و|به|با|از)$/.test(pre) ? pre : "" }); }
    return out;
  }
  PR.verbs28 = verbs28;
  /* ستاکِ فعل‌های مضارعِ یک جمله («میریم» ⇐ ر، «قطع می‌کنم» ⇐ کن) — برای این‌که روزِ جملهٔ کارِ دیگری پاسخِ ردیفِ «کدام روز؟» ِ این کار نشود */
  function pres28(t) { var x = nrm26(t), re = /(?:^| )ن?می ?([آ-ی]{1,8}?)(?:یم|ید|ند|ن|م|ه|ی|د)(?![آ-ی])/g, m, out = []; while ((m = re.exec(x))) out.push(m[1].replace(/^ی(?=[اآ])/, "")); return out; }
  function sameAct28(c, what) {
    var a = pres28(c), b = pres28(what); if (!a.length) return true;
    if (!b.length) return a.every(function (v) { return LIGHT28.test(v); });   /* «رنگ‌کاری رو ۵ فروردین می‌کنم» برای «رنگ‌کاری … بعد از عید» */
    return a.some(function (v) { return b.indexOf(v) >= 0; });                  /* «قبضِ آب … می‌دم» با «اجاره … واریز می‌کنم» کارِ دیگری است */
  }
  PR.sameAct28 = sameAct28;
  /* «X نه، Y» دربارهٔ این کار است؟ — جملهٔ نفی (R.negC) جز روز و واژه‌های قاب چیزی ندارد، یا همان کار را می‌گوید (C92؛ A28-1) */
  function negBound28(R, d, what, bare) {
    var c = (R.negC || {})[d] || ""; if (bare || !c) return true; if (ovD27(c, what) >= 1 && sameAct28(c, what)) return true;
    return !toks(nrm26(c).replace(DATEW27, " ").replace(/(?:^| )(?:نه|نیست|نیس|مهلت|موعد|روزش|تاریخش|قرار|قرارش|ولی|اما|بلکه|پس|که|ست|است|هست|ه|منظورم|اشتباه|گفتم|نوشتم|بود|بذار|بگذار|باشه|آره|بله)(?![آ-ی])/g, " ")).length;
  }
  PR.negBound28 = negBound28;
  /* ۰ = گزارشِ انجامِ این کار نیست؛ ۱ = فقط فعلِ همان کار، بی هیچ واژهٔ دیگر («زنگ زدم»)؛ ۲ = فعلِ همان کار با همان چیز («به مادربزرگ زنگ زدم») —
     فعلِ همان کار با چیزِ دیگری («به تعمیرکار زنگ زدم») ۰ است (C94 ِ منفی؛ بانکِ R28 #36) */
  function did28(t, what) {
    var x = nrm26(t); if (CORRW27.test(x)) return 0;
    var V = verbs28(what), best = 0;
    if (!V.length) return 0;
    /* بند به بند («زنگ زدم، گفت پس‌فردا میاد» — بندِ دوم حرفِ دیگری است، نه چیزِ دیگری برای همان زنگ) */
    var CL = []; sentsOf25(t).forEach(function (c) { String(c).split(/\s*[،,؛]\s*/).forEach(function (z) { if (z.trim()) CL.push(z); }); });
    CL.forEach(function (c) { if (best === 2) return; var xc = nrm26(c); if (THIRD26.test(xc) && !FIRST26.test(xc)) return;
      V.forEach(function (v) { v.past.forEach(function (ps) { if (best === 2) return;
        var pe = v.pre ? v.pre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "", r = new RegExp("(?:^| )" + (pe ? "(?:" + pe + "(?:ش)?) (?:[آ-ی]+ ){0,2}" : "") + ps + "(?:م|یم|مش|یمش)(?![آ-ی])"), m = r.exec(xc); if (!m) return;
        var rest = (xc.slice(0, m.index) + " " + xc.slice(m.index + m[0].length)).replace(DATEW27, " ").replace(/(?:^| )(?:امروز|دیروز|پریروز|بالاخره|الان|همین|هم|رو|را|به|با|که|و|بهش|باهاش|اونو|اینو|اون|این|دیگه|آره|بله|سلام|خب|خوب|راستی|صبح|عصر|ظهر|شب|امشب|امروزصبح)(?![آ-ی])/g, " ");
        var rt = toks(rest).filter(function (w) { return w !== pe; });
        if (!rt.length) { best = Math.max(best, 1); return; }
        var w0 = nrm26(what); if (pe) w0 = w0.replace(new RegExp("(?:^| )" + pe + "(?![آ-ی])", "g"), " ");
        if (ovD27(rest, w0) >= 1) best = 2; }); }); });
    return best;
  }
  PR.did28 = did28;
  function didIt28(t, it, newest) {
    var x = nrm26(t); if (CORRW27.test(x)) return false;
    var V = verbs28(it.what);
    if (V.length) { var k = did28(t, it.what); return k === 2 || (k === 1 && (!!newest || toks(t).length <= 3)); }
    var COP = /(?:^| )بود(?:م|یم)?(?![آ-ی])/g, PAST = new RegExp(PAST26.source.replace("(?:ن?می ?|ن)?", ""));   /* «نگرفتم» / «می‌خریدم» گزارشِ انجام نیست */
    var hit = sentsOf25(t).some(function (c) { var xc = nrm26(c).replace(COP, " "); return PAST.test(xc.replace(/(?:^| )(?:گفتم|نوشتم|گفته بودم|نوشته بودم|گفتیم)(?![آ-ی])/g, " ")) && !THIRD26.test(xc) && ovD27(c, it.what) >= 1; });
    if (hit) return true;
    return !!newest && toks(t).length <= 1 && PAST.test(x.replace(COP, " "));
  }
  PR.didIt28 = didIt28;
  /* دورِ ۲۸ (C94، C117؛ A27-19 aA3 p8 «زنگ زدم» و «انجام شد؟» ماند؛ بانکِ R28 #16–#18، #36–#37): گزارشِ انجامِ کارِ ثبت‌شده (📌 باز یا ⏰ ِ خودش) با گذشتهٔ فعلِ همان کار
     آن را می‌بندد — نه فقط پرسشِ روزِ باز. برنامهٔ همین پیام هرگز در تولدش بسته نمی‌شود (D28-7). فعلِ تنها («زنگ زدم») با دو کارِ بازِ همان فعل ⇒ «کدام؟» و هیچ‌کدام بسته نمی‌شود. */
  PR.doneFromHer28 = function (s0) {
    var U = userMsgs(s0), m = U[U.length - 1]; if (!m || !s0) return false; var t = String(m.text || ""), at = String(m.at || ""); if (/^\s*\[/.test(t) || s0._dn28 === at) return false; s0._dn28 = at;
    var td = today(), C = [];
    (s0.plans || []).forEach(function (q) { if (!q || q.done || (q.state && q.state !== "open") || String(q.at || "") === at) return; var w = String(q.when || ""); if (/^\d{4}-\d\d-\d\d$/.test(w) && w > add(td, 7)) return;
      var k = did28(t, q.text); if (k) C.push({ k: k, q: q, what: q.text }); });
    S.all("deadline", function (r) { return r && !r.done && !r.plan && (r.sess === s0.id || (r.src && r.src.sess === s0.id)) && /^her/.test(String(r.by || "")) && r.date && r.date <= add(td, 7) && String((r.src && r.src.at) || "") !== at; }).forEach(function (r) {
      var k = did28(t, r.quote || r.what); if (k) C.push({ k: k, r: r, what: r.quote || r.what }); });
    if (!C.length) return false;
    var strong = C.filter(function (c) { return c.k === 2; }), pick = strong.length ? strong : C;
    if (!strong.length && C.length > 1) { sysLine25(s0, "📅 «" + clip(t, 40) + "» — کدام؟ " + C.map(function (c) { return "«" + clip(c.what, 50) + "»"; }).join(" یا ") + " — بگو کدام را انجام دادی تا همان بسته شود؛ تا نگویی چیزی بسته نمی‌شود."); return true; }
    pick.forEach(function (c) { if (c.q) { c.q.done = true; c.q.state = "done"; c.q.doneAt = nowISO(); c.q.doneBy = { kind: "her-words", at: at, quote: clip(t, 200) }; }
      else { c.r.done = true; c.r.doneAt = nowISO(); c.r.doneBy = { kind: "her-words", sess: s0.id, at: at, quote: clip(t, 200) }; S.put(c.r); try { AS.DO.deadline_done && AS.DO.deadline_done({ what: c.r.id }); } catch (e) { } } });
    try { PR.planDlSync(s0); } catch (e) { }
    return true;
  };
  function lapse27(s0, t, doneOnly) {
    var n = 0, td = today(), L = pends26(s0), newest = s0.datePend && L.indexOf(s0.datePend) >= 0 ? s0.datePend : L[L.length - 1];
    L.forEach(function (P) { var keep = []; (P.items || []).forEach(function (it) {
      var why = lapsed27(s0, it, P.d0); if (doneOnly && why === "date") why = "";
      if (!why && !it.amb && !it.free && !it.pred && it.date <= add(td, 7) && !/^\s*\[اصلاحِ/.test(String(t || "")) && didIt28(t, it, P === newest)) why = "done";   /* ✏️ گزارشِ تازه نیست (C28-10: روزش را datePend می‌پرسد) */   /* دورِ ۲۸ (C94) */
      if (why) { (P.lapsed = P.lapsed || []).push({ what: it.what, date: it.date, why: why, at: nowISO() }); n++;
        if (it.plan) { var q = (s0.plans || []).filter(function (y) { return y && y.id === it.plan; })[0]; if (q) { delete q.whenPend; delete q.whenAsk; } } }
      else keep.push(it); });
      if (keep.length !== (P.items || []).length) { P.items = keep; if (!keep.length) P.state = "lapsed"; } });
    return n;
  }
  PR.lapse27 = lapse27;
  PR.R28_QUARANTINE = PR.R28_QUARANTINE || {}; PR.R28_QUARANTINE.didIt27 = didIt27;   /* دورِ ۲۸ — خوانندهٔ پیشینِ گزارشِ انجام (صدا زده نمی‌شود) */
  /* نوبتِ ✏️ ⇒ { text: متنِ درستِ پیام، at: زمانِ همان پیامِ ✏️شده، apply(x): جفت‌های «پیشین ⇐ درست» روی x } یا null */
  function editOf27(s0, t) {
    if (!/^\s*\[اصلاحِ پیامِ قبلی\]/.test(String(t || ""))) return null;
    var mm = /متنِ درستِ پیامم: «([\s\S]*)»\s*$/.exec(String(t)); if (!mm) return null; var nt = mm[1], pairs = [], re = /«([^«»]*)» ⇐ «([^«»]*)»/g, g;
    while ((g = re.exec(String(t).slice(0, mm.index)))) pairs.push([g[1], g[2]]);
    var em = userMsgs(s0).filter(function (u) { return !/^\s*\[/.test(String(u.text || "")) && nrm26(u.text) === nrm26(nt); }).slice(-1)[0] || null;
    return { text: nt, at: em ? String(em.at || "") : "", apply: function (x) { var y = String(x || ""); pairs.forEach(function (p) { if (p[0] && y.indexOf(p[0]) >= 0) y = y.split(p[0]).join(p[1]); }); return y; },
      /* دورِ ۲۸ (C134): متنِ پیشین از متنی که راهِ دیگری (a27) پیش‌تر بازنوشته بود — تا «فقط چه عوض شد» دیده شود */
      unapply: function (x) { var y = String(x || ""); pairs.slice().reverse().forEach(function (p) { if (p[1] && y.indexOf(p[1]) >= 0) y = y.split(p[1]).join(p[0]); }); return y; } };
  }
  PR.editOf27 = editOf27;
  /* برنامهٔ ثبت‌شدهٔ همین گفت‌وگو که روزش را حالا نفی کرد ⇒ ثبت کنار (q.whenHist)، روزِ تازه (اگر یکی است) یک بار پرسیده می‌شود؛ بی روزِ تازه ⇒ «کدام روز؟» (C71) */
  function negBooked27(s0, t, at) {
    var R = herDays27(t), out = [], td = today(); if (!R.neg.length) return out;
    (s0.plans || []).forEach(function (q) { if (!q || !/^\d{4}-\d\d-\d\d$/.test(String(q.when || "")) || R.neg.indexOf(q.when) < 0 || q.done || (q.state && q.state !== "open")) return;
      var rel = ((s0.plans || []).filter(function (y) { return y && y.when === q.when && y.state === "open"; }).length === 1 || sentsOf25(t).some(function (c) { return ovD27(c, q.text) >= 1; })) && negBound28(R, q.when, q.text, false); if (!rel) return;   /* دورِ ۲۸ (C92، A28-1) */
      var c = R.pos.filter(function (d) { return d !== q.when && d >= td; }), alt = c.length === 1 ? c[0] : (c.filter(function (d) { return ovD27(R.posC[d] || "", q.text) >= 1; }).length === 1 ? c.filter(function (d) { return ovD27(R.posC[d] || "", q.text) >= 1; })[0] : "");
      (q.whenHist = q.whenHist || []).push({ was: q.when, at: nowISO(), why: "روزش را نفی کرد", msg: at }); (s0.dateNo = s0.dateNo || []).push(q.when);
      try { S.all("deadline", function (r) { return r && !r.done && r.plan && r.plan.id === q.id && r.date === q.when; }).forEach(function (r) { r.done = true; r.doneAt = nowISO(); r.doneBy = { kind: "replaced", plan: q.id }; S.put(r); }); } catch (e) { }
      q.when = "next-session"; delete q.dateBy; q.dateAsk = true;
      if (alt) { q.whenPend = { date: alt, src: "her" }; out.push({ what: q.text, date: alt, plan: q.id, src: "her", was: q.whenHist[q.whenHist.length - 1].was }); }
      else { out.push({ what: q.text, date: add(td, 1), amb: true, free: true, wd: "", plan: q.id, why: "neg", was: q.whenHist[q.whenHist.length - 1].was }); sysLine25(s0, "📅 «" + clip(q.text, 60) + "» — آن روز را کنار گذاشتی و ثبتش برداشته شد؛ کدام روز؟ خودِ روز را بنویس."); } });
    return out;
  }
  PR.negBooked27 = negBooked27;
  /* موعدِ ثبت‌شدهٔ «حرفِ خودش» که روزش را حالا نفی کرد (بانکِ R27 #108: «فردا نه، پس‌فردا») ⇒ رکورد «جایگزین شد» (بسته، با تاریخچه) و روزِ تازه یک بار پرسیده می‌شود */
  function negBookedDl27(s0, t, at) {
    var R = herDays27(t), out = [], td = today(); if (!R.neg.length) return out;
    var mineDl = S.all("deadline", function (r) { return r && !r.done && R.neg.indexOf(r.date) >= 0 && (r.sess === s0.id || (r.src && r.src.sess === s0.id)) && /^her/.test(String(r.by || "")); });
    mineDl.forEach(function (r) { var rel = (mineDl.length === 1 || sentsOf25(t).some(function (c) { return ovD27(c, r.quote || r.what) >= 1; })) && negBound28(R, r.date, r.quote || r.what, false); if (!rel) return;   /* دورِ ۲۸ (C92، A28-1) */
      var c = R.pos.filter(function (d) { return d !== r.date && d >= td; }), alt = c.length === 1 ? c[0] : "";
      (r.fixHist = r.fixHist || []).push({ at: nowISO(), field: "deadline", old: r.date, new: alt || "", why: "روزش را نفی کرد", msg: at }); (s0.dateNo = s0.dateNo || []).push(r.date);
      r.done = true; r.doneAt = nowISO(); r.doneBy = { kind: "replaced", why: "neg" }; S.put(r);
      out.push(alt ? { what: r.quote || r.what, date: alt, src: "her", was: r.date } : { what: r.quote || r.what, date: add(td, 1), amb: true, free: true, wd: "", why: "neg", was: r.date }); });
    return out;
  }
  /* دورِ ۲۷ب (leftovers؛ C58 «یک راه»): اصلاحِ روزِ رکوردی که با «آره» ِ او ثبت شده بود — برنامه (📌) یا موعد (⏰) — از همین یک تابع می‌گذرد، از هر راهی که آمده باشد:
     ✏️ ِ خودش (a41 editBooked27، a27 retractApply با R.edit، a38 retractSess ِ ✏️) یا اصلاحِ گفت‌وگو («تا ۲۰ آذره»، گزارشِ retract ِ مدل: a27 retractApply / a38 retractSess).
     پیش‌تر هر راه روز را جدا جابه‌جا می‌کرد و تاریخچهٔ خودش را می‌نوشت (corr در a27، fixHist در a38) و در ✏️ سپس editBooked27 همان رکورد را می‌بست و دوباره می‌پرسید —
     دو یا سه سطرِ تاریخچه برای یک اصلاح. حالا یک تابع، یک سطرِ تاریخچه:
       • ✏️ (C58): ثبتِ پیشین «جایگزین شد» (بسته) و روزِ تازه **یک** بار پرسیده می‌شود — هرگز بی «آره» ِ او ثبت نمی‌شود؛
       • اصلاحِ گفت‌وگو (o.move — حرفِ خودش روزِ تازه را گفته و تعهد پیش‌تر «آره» گرفته بود؛ بانک‌های R22 #69/#73/#87، R25 A25-21): همان رکورد به روزِ تازه می‌رود.
     راهِ دوم که پس از راهِ نخست می‌رسد چیزی نمی‌بیند (رکورد بسته است یا روزش همان است). x: برنامه (o.kind = "plan") یا موعد؛
     o = {src: متنِ تازه، date?: روزِ تازه اگر اصلاحگر آن را دانسته، base: روزِ گفتن، at: پیامِ اصلاح، why, by, move, time?, queue: پرسش در صفِ s0._re26 (راهِ بیرون از datePend)} */
  /* دورِ ۲۸ (dates، C93): روزِ ماهِ بی‌سالی که پیش از روزِ گفتن است («۲۴ آبان» در ۲۵ آبان) — whenInfo آن را به سالِ بعد می‌برد؛ در ✏️ این «روزِ گذشته» است، نه سالِ بعد */
  function pastDay28(src, base) {
    try { var x = nrm26(String(src || "")); if (/\d{4}/.test(x) || new RegExp("(?:سال|ماه) ?(?:ی ?)?" + NEXT26 + "(?![آ-ی])").test(x)) return "";
      var m = new RegExp("(?:^|[^\\d])(\\d{1,2}) ?(?:ام|م)? ?(" + JM26 + ")(?![آ-ی])").exec(x), J = jParts26(base); if (!m || !J || !A.epiRevDate) return "";
      var d0 = A.epiRevDate(J.y + "-" + (JM26.split("|").indexOf(m[2]) + 1) + "-" + (+m[1])); return d0 && d0 < base ? d0 : ""; } catch (e) { return ""; }
  }
  PR.pastDay28 = pastDay28;
  /* دورِ ۲۸ (C134): دو متن روزِ یکسانی می‌گویند؟ (هر دو با یک پایه؛ هیچ‌کدام روزی نگوید هم «یکسان» است) */
  function sameDay134(a, b, base) { var r = function (t) { var I = null; try { I = PR.whenInfo(String(t || ""), base); } catch (e) { } return I && I.date ? [I.date, !!I.amb, !!I.free, (I.opts || []).join(",")].join("|") : ""; };
    var x = nrm26(String(a || "")), y = nrm26(String(b || "")), pa = /(?:^| )(دیروز|پریروز)(?![آ-ی])/.exec(x), pb = /(?:^| )(دیروز|پریروز)(?![آ-ی])/.exec(y);
    if ((pa ? pa[1] : "") !== (pb ? pb[1] : "")) return false; return r(a) === r(b); }
  PR.sameDay134 = sameDay134;
  function rebook27(s0, x, o) {
    if (!s0 || !x || !o) return null; var td = today(), isPl = o.kind === "plan";
    if (isPl ? (!/^\d{4}-\d\d-\d\d$/.test(String(x.when || "")) || x.done || (x.state && x.state !== "open")) : (x.done || !x.date)) return null;
    var cur = isPl ? x.when : x.date, I = null;
    /* دورِ ۲۸ (C134): اصلاحی که فقط «چه» را عوض می‌کند هرگز روز را جابه‌جا نمی‌کند — حتی وقتی جملهٔ اصلاح‌شده نامِ روزی دارد («باید سه‌شنبه طرحش ⇐ بودجه‌ش …»).
       وقتی فراخوان روزِ تازه را نداده و روز فقط از بازخوانیِ متنِ تازه درمی‌آید، متنِ پیشین و تازه با یک پایه خوانده می‌شوند؛ خوانشِ یکسان ⇒ روز دست نمی‌خورد
       (پیش‌تر متنِ تازه از نو خوانده می‌شد و در خودِ روزِ نام‌برده دوپهلو یا «گذشته» درمی‌آمد ⇒ ثبت کنار می‌رفت و دوباره پرسیده می‌شد) */
    if (!(o.date && /^\d{4}-\d\d-\d\d$/.test(String(o.date))) && o.src != null) {
      var oS134 = o.old != null ? String(o.old) : String((isPl ? x.text : (x.quote || x.what)) || ""), b134 = o.base && o.base <= td ? o.base : td;
      if (oS134 && nrm26(oS134) !== nrm26(String(o.src)) && sameDay134(oS134, String(o.src), b134)) return null; }
    if (o.date && /^\d{4}-\d\d-\d\d$/.test(String(o.date))) I = { date: o.date };
    else { try { I = PR.whenInfo(String(o.src || ""), o.base && o.base <= td ? o.base : td); } catch (e) { I = null; } }
    /* دورِ ۲۸ (dates، C93؛ D28-27 tD2 p20، B28·D14 dB1 p15، D28-28 tD2 p21، A28-2 s01 p27، C28-10 aC3 p28): نوبتِ ✏️ ِ خودش — روزِ نسبیِ جملهٔ اصلاح‌شده از روزی
       خوانده می‌شود که آن جمله گفته شد (نه روزِ ✏️ — a27 retractApply و a38 روزِ تازه را از امروز می‌ساختند)، و روزی که گذشته است («دیروز»، «۲۴ آبان» در ۲۵ آبان)
       ثبتِ پیشین را نگه می‌دارد و فقط می‌پرسد «این روز گذشته — کدام روز؟» (پیش‌تر: بی‌صدا رها، یا سالِ بعد) */
    var lu28 = userMsgs(s0).slice(-1)[0], ed28 = !!(lu28 && /^\s*\[اصلاحِ/.test(String(lu28.text || ""))) && !o.move, past28 = "";
    if (ed28 && x.pastAsk28 && (x.pastAsk28 === String(lu28.at || "") || x.pastAsk28 === norm(String(o.src || "")))) return null;   /* همان ✏️ از راهِ دوم (a27 سپس editBooked27) — یک پرسش */
    if (ed28 && o.src) { var said28 = isPl ? String(x.d || "") : ((x.src && x.src.at && A.localDay) ? A.localDay(x.src.at) : (x.created && A.localDay ? A.localDay(x.created) : ""));
      if (/^\d{4}-\d\d-\d\d$/.test(said28) && said28 <= td) { var Ie28 = null; try { Ie28 = PR.whenInfo(String(o.src), said28); } catch (e) { } if (Ie28 && Ie28.date && (said28 < td || !I)) I = Ie28; past28 = pastDay28(o.src, said28);   /* همان روز ⇒ خوانشِ فراخوان (بانکِ R20 #68) */
        /* «دیروز / پریروز» را whenInfo روزِ کار نمی‌خواند (گذشته است) — در ✏️ همان روزِ گذشته است */
        var pr28 = /(?:^| )(دیروز|پریروز)(?![آ-ی])/.exec(nrm26(String(o.src))); if (!past28 && pr28 && !(Ie28 && Ie28.date)) past28 = add(said28, pr28[1] === "دیروز" ? -1 : -2); }
      if ((past28 || (I && I.date && !I.amb && I.date < td)) && (past28 || I.date) !== cur) {
        var pq28 = { what: String(o.src), date: td, amb: true, free: true, wd: "", fq: "این روز (" + fdate(past28 || I.date) + ") گذشته — کدام روز؟", past: past28 || I.date, was: cur, keep: true };
        if (isPl) pq28.plan = x.id; else pq28.old = x.id; x.pastAsk28 = norm(String(o.src || "")); if (!isPl) S.put(x);
        if (o.queue) s0._re26 = (s0._re26 || []).concat([pq28]);
        return { it: pq28, was: cur, date: "", amb: true, past: true }; } }
    if (!I || !I.date || (!I.amb && I.date === cur)) return null;
    var why = o.why || (o.move ? "اصلاحِ خودش" : "اصلاحِ خودش — جایگزین شد؛ روزِ تازه پرسیده شد"), what = String(o.src || (isPl ? x.text : (x.quote || x.what)) || "");
    if (o.move) { if (I.amb) return null;   // روزِ دوپهلو را صفحه حدس نمی‌زند
      if (isPl) { if (o.hist !== false) (x.whenHist = x.whenHist || []).push({ was: cur, now: I.date, at: nowISO(), why: why, msg: o.at || "" }); x.when = I.date;   // hist:false ⇒ سطرِ تاریخچه همان corr ِ فراخوان است (oldWhen، که 📜 می‌خواند) delete x.askKey; delete x.gAskKey;
        try { S.all("deadline", function (r) { return r && !r.done && r.plan && r.plan.id === x.id && r.date === cur; }).forEach(function (r) { r.date = I.date; S.put(r); try { if (A.ASSIST && A.ASSIST.deadlineSync) A.ASSIST.deadlineSync(r); } catch (e) { } }); } catch (e) { } }
      else { var oT = (A.fdate ? A.fdate(cur) : cur) + (x.time ? "، ساعت " + fa(String(x.time).replace(/^0/, "").replace(/:00$/, "")) : ""), oW = x.what; x.date = I.date; if (o.time) x.time = o.time;
        if (typeof o.what === "string" && o.what.trim() && o.what !== x.what) { x.what = String(o.what).slice(0, 120); oT += " — " + oW; }   // «چه» ِ همان اصلاح در همان یک سطر
        (x.fixHist = x.fixHist || []).push({ at: nowISO(), field: "deadline", old: o.oldT || oT, new: (A.fdate ? A.fdate(x.date) : x.date) + (x.time ? "، ساعت " + fa(String(x.time).replace(/^0/, "").replace(/:00$/, "")) : ""), why: why, msg: o.at || "", src: o.src20 || "", d: o.d || "" });
        S.put(x); try { if (A.ASSIST && A.ASSIST.deadlineSync) A.ASSIST.deadlineSync(x); } catch (e) { } }
      return { moved: true, was: cur, date: I.date }; }
    if (!I.amb && I.date < td) return null;   // روزِ گذشته پرسیدنی نیست — ثبتِ پیشین دست نمی‌خورد
    if (isPl) {
      (x.whenHist = x.whenHist || []).push({ was: cur, at: nowISO(), why: why, msg: o.at || "" }); x.when = "next-session"; delete x.dateBy; delete x.askKey; delete x.gAskKey; x.dateAsk = true;
      /* یک تعهد، یک رکورد (C52): ⏰ ِ پیوسته به همین 📌 هم با آن بسته می‌شود — سطرِ تاریخچهٔ جدا نمی‌گیرد */
      try { S.all("deadline", function (r) { return r && !r.done && r.plan && r.plan.id === x.id && r.date === cur; }).forEach(function (r) { r.done = true; r.doneAt = nowISO(); r.doneBy = { kind: "replaced", plan: x.id }; S.put(r); }); } catch (e) { }
      if (I.amb) { x.whenAsk = I.wd || "جمعه"; x.whenAskO = askO28(I); } else x.whenPend = { date: I.date, src: "her" };
    } else { (x.fixHist = x.fixHist || []).push({ at: nowISO(), field: "deadline", old: cur, new: "", why: why, msg: o.at || "" }); x.done = true; x.doneAt = nowISO(); x.doneBy = { kind: "replaced", why: o.by || "edit" }; S.put(x); }
    var it = I.amb ? { what: what, date: I.date, amb: true, wd: I.free ? "" : (I.wd || ""), opts: I.opts || undefined, free: I.free || undefined, fq: I.fq || undefined, was: cur } : { what: what, date: I.date, src: "her", was: cur };
    if (isPl) it.plan = x.id;
    if (o.queue) s0._re26 = (s0._re26 || []).concat([it]);
    return { it: it, was: cur, date: I.date, amb: !!I.amb };
  }
  PR.rebook27 = rebook27;
  /* C58 بر ثبت‌شده‌ها (بانکِ R27 #107، B27·D10): ✏️ ِ روزِ پیامی که برنامه یا موعدش با «آره» ثبت شده بود ⇒ همان یک راه (rebook27). بدنهٔ پیشین (که خودش می‌بست و
     پس از جابه‌جاییِ اصلاحگر سطرِ دومِ تاریخچه می‌ساخت) قرنطینه است: PR.R27_QUARANTINE.editBooked27a (docs/overhaul/REMOVAL_CANDIDATES.md) */
  function editBooked27(s0, ed, at) {
    var out = []; if (!ed || !ed.at) return out; var td = today(), b0 = (A.localDay ? A.localDay(ed.at) : "") || td, base = b0 <= td ? b0 : td, why = "✏️ ِ خودش — جایگزین شد؛ روزِ تازه پرسیده شد";
    (s0.plans || []).forEach(function (q) { if (!q || String(q.at || "") !== String(ed.at)) return;
      var r = rebook27(s0, q, { kind: "plan", src: ed.apply(q.text), old: ed.unapply ? ed.unapply(q.text) : undefined, base: q.d && q.d <= td ? q.d : base, at: at, why: why, by: "edit" }); if (r && r.it) out.push(r.it); });
    S.all("deadline", function (r) { return r && !r.done && /^her/.test(String(r.by || "")) && r.src && String(r.src.at || "") === String(ed.at); }).forEach(function (r) {
      var z = rebook27(s0, r, { kind: "deadline", src: ed.apply(r.quote || r.what), old: ed.unapply ? ed.unapply(r.quote || r.what) : undefined, base: base, at: at, why: why, by: "edit" }); if (z && z.it) out.push(z.it); });
    return out;
  }
  PR.editBooked27 = editBooked27;
  PR.R27_QUARANTINE = PR.R27_QUARANTINE || {};
  /* دورِ ۲۷ (dates) — بدنهٔ پیشینِ editBooked27 (قرنطینه، صدا زده نمی‌شود؛ دورِ ۲۷ب C58 «یک راه» جایش را گرفت) */
  PR.R27_QUARANTINE.editBooked27a = function editBooked27a(s0, ed, at) {
    var out = []; if (!ed || !ed.at) return out; var td = today(), b0 = (A.localDay ? A.localDay(ed.at) : "") || td, base = b0 <= td ? b0 : td;
    var nd = function (src, b1) { var I = null; try { I = PR.whenInfo(src, b1 && b1 <= td ? b1 : base); } catch (e) { } return I && I.date ? I : null; };
    (s0.plans || []).forEach(function (q) { if (!q || String(q.at || "") !== String(ed.at) || !/^\d{4}-\d\d-\d\d$/.test(String(q.when || "")) || q.done || (q.state && q.state !== "open")) return;
      var src = ed.apply(q.text), I = nd(src, q.d), orig = q.date0 || q.when; if (!I || (!I.amb && I.date === orig)) return;
      (q.whenHist = q.whenHist || []).push({ was: orig, at: nowISO(), why: "✏️ ِ خودش — جایگزین شد", msg: at }); q.when = "next-session"; delete q.dateBy; q.dateAsk = true;
      if (I.amb) { q.whenAsk = I.wd || "جمعه"; q.whenAskO = I.opts ? { date: I.date, opts: I.opts } : undefined; out.push({ what: src, date: I.date, amb: true, wd: I.wd || "", opts: I.opts || undefined, plan: q.id, was: orig }); }
      else if (I.date >= td) { q.whenPend = { date: I.date, src: "her" }; out.push({ what: src, date: I.date, plan: q.id, src: "her", was: orig }); } });
    S.all("deadline", function (r) { return r && !r.done && /^her/.test(String(r.by || "")) && r.src && String(r.src.at || "") === String(ed.at); }).forEach(function (r) {
      var src = ed.apply(r.quote || r.what), I = nd(src), orig = r.date0 || r.date; if (!I || (!I.amb && I.date === orig)) return;
      (r.fixHist = r.fixHist || []).push({ at: nowISO(), field: "deadline", old: orig, new: "", why: "✏️ ِ خودش — جایگزین شد؛ روزِ تازه پرسیده شد", msg: at });
      r.date = orig; r.done = true; r.doneAt = nowISO(); r.doneBy = { kind: "replaced", why: "edit" }; S.put(r);
      if (I.amb) out.push({ what: src, date: I.date, amb: true, wd: I.wd || "", opts: I.opts || undefined, was: orig }); else if (I.date >= td) out.push({ what: src, date: I.date, src: "her", was: orig }); });
    return out;
  };
  /* ب) تاریخ‌های تازهٔ همین نوبت: حرفِ خودش، برنامهٔ گزارش‌شده (a27 plan18 ⇒ q.whenPend)، کنشِ deadline ِ مدل (s0._dq26) — یک کار، یک پرسش */
  PR.datePend = function (s0) {
    var U = userMsgs(s0), m = U[U.length - 1]; if (!m || !s0) return false; var t = String(m.text || ""), at = String(m.at || ""), dirty = false;
    /* دورِ ۲۷: سرآمدن پیش از خواندنِ پاسخ — «زنگ زدم، گفت پس‌فردا میاد» نخست پرسشِ «زنگ می‌زنم» را می‌بندد (بانکِ R27 #111) */
    try { if (s0._lpAt27 !== at) { s0._lpAt27 = at; if (lapse27(s0, t, true)) dirty = true; } } catch (e) { console.warn(e); }
    try { if (PR.dateAnswer(s0)) dirty = true; } catch (e) { console.warn(e); }
    if (s0._dpAt26 === at) return dirty; s0._dpAt26 = at;
    var items = (s0._re26 || []).slice(), own = []; delete s0._re26;
    /* دورِ ۲۷ (A27-7): پرسشِ روزِ جایگزین متنِ کنونیِ همان برنامه را دارد (پس از اصلاحِ همین نوبت)، نه نقلِ روزِ نفی‌شده */
    items.forEach(function (z) { if (!z.plan) return; var q = (s0.plans || []).filter(function (y) { return y && y.id === z.plan; })[0]; if (!q) return; z.what = q.text; if (!z.free) { if (z.amb) q.whenAsk = q.whenAsk || z.wd || "جمعه"; else q.whenPend = { date: z.date, src: "her" }; } q.dateAsk = true; });
    /* (۹) پرسشِ روزِ پیش‌بینی‌ای که دیگر داوری شده یا 🎯 گرفته کنار می‌رود */
    pends26(s0).forEach(function (P) { var n0 = (P.items || []).length; P.items = (P.items || []).filter(function (z) { if (!z.pred) return true; var py = ((s0.coach || {}).preds || []).filter(function (y) { return y && String(y.at) === String(z.pred) && (!z.pk || y.key === z.pk); })[0]; return !!py && !py.fc && !py.out; }); if (P.items.length !== n0) { dirty = true; if (!P.items.length) P.state = "dropped"; } });
    /* دورِ ۲۷ (C49/C69؛ A27-19، C27-5، C27-11، B27·D5، D27-22): پرسش سر می‌آید — روزش تمام شد، برنامه‌اش «انجام شد/نشد» گرفت، پیگیری‌اش بسته شد،
       یا خودش در همین پیام گزارش داد که کار را کرد («زنگ زدم»، «خریدیم!»). پرسشِ سرآمده بسته می‌شود (P.lapsed، تاریخچه) و هرگز با روزِ تازه یا سالِ بعد برنمی‌گردد. */
    try { var lapN = lapse27(s0, t); if (lapN) dirty = true; } catch (e) { console.warn(e); }   /* دوباره: پاسخِ همین پیام ممکن است برنامه‌ای را بسته باشد */
    /* دورِ ۲۷ (C58): نوبتِ ✏️ — فقط «متنِ درستِ پیامم» حرفِ اوست؛ نقلِ متنِ کهنه تعهدی نیست */
    var ed27 = editOf27(s0, t);
    try { own = PR.herDates(ed27 ? ed27.text : t, s0); (own.neg || []).forEach(function (d) { (s0.dateNo = s0.dateNo || []).push(d); }); } catch (e) { console.warn(e); own = []; }
    /* دورِ ۲۷ (C51، بانکِ R27 #104): «جمعهٔ بعد … این جمعه نه» — از دو جمعه یکی می‌ماند؛ روزِ نفی‌شده خودش پرسیده نمی‌شود */
    try { var RD27 = herDays27(ed27 ? ed27.text : t); own = own.filter(function (o) { return o.amb || RD27.neg.indexOf(o.date) < 0; }); own.forEach(function (o) { if (!o.amb || o.free || !o.opts) return; var lf = o.opts.filter(function (d) { return RD27.neg.indexOf(d) < 0; }); if (lf.length === 1 && lf.length < o.opts.length) { o.date = lf[0]; o.amb = false; delete o.opts; } }); } catch (e) { }
    /* دورِ ۲۷ (C51، A27-2، بانکِ R27 #108): روزِ برنامهٔ ثبت‌شده‌ای که حالا نفی کرد ⇒ ثبت کنار می‌رود (تاریخچه) و روزی که به جایش گفت یک بار پرسیده می‌شود */
    if (!ed27) { try { negBooked27(s0, t, at).concat(negBookedDl27(s0, t, at)).forEach(function (z) { items.push(z); dirty = true; }); } catch (e) { console.warn(e); } }
    else { try { editBooked27(s0, ed27, at).forEach(function (z) { items.push(z); dirty = true; }); } catch (e) { console.warn(e); } }
    /* پیامی که همین نوبت موعد یا برنامهٔ ثبت‌شده‌ای را اصلاح کرد («تحویل ۸ آبان نیست، ۱۰ آبانه» ⇒ همان رکورد جابه‌جا شد): روزِ درونِ آن، روزِ همان رکورد است — تعهدِ تازه نیست */
    try { var R26 = (((s0.coach || {}).retracts) || []).slice(-1)[0]; if (R26 && R26.ok && norm(R26.key || "") === norm(t) && (R26.changes || []).some(function (c) { return /^(?:یادآور|برنامه|موعد)/.test(String(c)); })) own = []; } catch (e) { }
    /* برنامه‌ای که روزش هنوز پرسیده است و متنش اصلاح شد («منظورم پنج‌شنبه بود») ⇒ پرسشِ روزِ پیشین کنار می‌رود و روزِ متنِ تازه پرسیده می‌شود */
    /* برنامه‌ای که روزش هنوز پرسیده است و متنش اصلاح شد («منظورم پنج‌شنبه بود»)، یا پرسشی که از پیامِ ✏️شده آمده ⇒ پرسشِ روزِ پیشین «جایگزین شد» و روزِ متنِ تازه
       یک بار پرسیده می‌شود (C58). دورِ ۲۷ (A27-19، C27-11، D27-22): فقط وقتی متن واقعاً عوض شد — و روزِ نسبی به روزِ گفتن (P.d0) لنگر است؛ پیش‌تر هر نوبت متنِ کهنه را
       با «امروزِ» تازه دوباره می‌خواند («فردا» ⇒ یک روز جلوتر، «۱ آبان» ⇒ سالِ بعد) */
    pends26(s0).forEach(function (P) { (P.items || []).slice().forEach(function (z) { if (z.free || z.pred) return; var q = z.plan ? (s0.plans || []).filter(function (y) { return y && y.id === z.plan; })[0] : null; if (z.plan && !q) return;
      var fromEd = !!(ed27 && (String(P.msg) === String(ed27.at) || (q && String(q.at || "") === String(ed27.at))));
      if (!fromEd && !(q && (q.whenPend || q.whenAsk))) return;
      var src = q ? q.text : z.what; if (fromEd) src = ed27.apply(src);
      if (norm(src) === norm(z.what)) return;
      var I = null; try { I = PR.whenInfo(src, P.d0 || today()); } catch (e) { }
      var ds = z.amb ? ambO26(z, P.d0) : [z.date];
      if (I && I.date && !I.amb && ds.indexOf(I.date) >= 0 && !z.amb) { z.what = src; return; }
      if (!I && !fromEd) return;
      P.items.splice(P.items.indexOf(z), 1); if (!P.items.length) P.state = "replaced"; (P.replaced = P.replaced || []).push({ what: z.what, date: z.date, at: at, by: fromEd ? "✏️" : "text" }); dirty = true;
      if (q) { delete q.whenPend; delete q.whenAsk; }
      /* دورِ ۲۸ (C93): ✏️ ِ روزِ پرسیده به روزی گذشته ⇒ «این روز گذشته — کدام روز؟» (پیش‌تر بی‌صدا رها می‌شد یا «۲۴ آبان» سالِ بعد پرسیده می‌شد) */
      var pd28 = fromEd ? (pastDay28(src, P.d0 || today()) || (I && I.date && !I.amb && I.date < today() ? I.date : "")) : "";
      if (pd28) { var pz28 = { what: src, date: today(), amb: true, free: true, wd: "", fq: "این روز (" + fdate(pd28) + ") گذشته — کدام روز؟", past: pd28, was: z.date }; if (z.plan) pz28.plan = z.plan; if (q) q.dateAsk = true; items.push(pz28); return; }
      if (!I || !I.date || (!I.amb && I.date < today())) return;
      var nz = Object.assign({}, z, { what: src, date: I.date, amb: !!I.amb, opts: I.opts || undefined, wd: I.wd || "", free: I.free || undefined, fq: I.fq || undefined, src: "her", was: z.date });
      if (q) { if (I.amb) { q.whenAsk = I.wd || "جمعه"; q.whenAskO = askO28(I); } else q.whenPend = { date: I.date, src: "her" }; q.dateAsk = true; }
      items.push(nz); }); });
    var noD = s0.dateNo || [], askedD = [], askedZ = [];
    pends26(s0).forEach(function (P) { (P.items || []).forEach(function (z) { askedD.push(z.date); askedZ.push(z); }); });
    /* دورِ ۲۸ (C92، B28·D6 dB1 p10): جمله‌ای که روزِ ردیفِ «کدام روز؟» را داد («وسطِ ماه یعنی حدودِ ۱۵ دی») پاسخ است، نه کارِ تازه — برنامه‌ای که مدل از همان
       پاسخ گزارش کرد (همین نوبت، همان روز) برنامهٔ دوم و پرسشِ دوم نمی‌سازد (یک کار، یک پرسش) */
    var ans28 = s0._ans28 && s0._ans28.at === at ? s0._ans28.d : []; delete s0._ans28;
    if (ans28.length) { s0.plans = (s0.plans || []).filter(function (q) { return !(q && String(q.at || "") === at && q.whenPend && ans28.indexOf(q.whenPend.date) >= 0); }); own = own.filter(function (o) { return ans28.indexOf(o.date) < 0; }); }
    /* برنامهٔ همین پیام با روزِ خوانده/گزارش‌شده */
    (s0.plans || []).forEach(function (q) { if (!q || String(q.at || "") !== at) return;
      if (q.whenAsk) { var O28 = q.whenAskO || {}; items.push(free28({ what: q.text, date: O28.date || add(today(), 7), amb: true, wd: O28.free ? "" : q.whenAsk, opts: O28.opts || undefined, free: O28.free || undefined, fq: O28.fq || undefined, plan: q.id })); }
      else if (q.whenPend && q.whenPend.date) items.push({ what: q.text, date: q.whenPend.date, plan: q.id, src: q.whenPend.src || "her" });
      if (q.whenAsk || q.whenPend) q.dateAsk = true; });
    /* پیش‌بینیِ همین پیام با روزِ دوپهلو (C1) */
    /* دورِ ۲۹ (forecast R5، C152/C132؛ B29·D8 dB1 c25، dB2 p4/p14، C29-7 pwC2 p32/p37/p41/p45): خوانندهٔ پیش‌بینی پیش از خوانندهٔ تاریخ — روزی که در بندِ یک پیش‌بینی آمده موعدِ
       همان 🎯 است و فقط با یک تأییدِ «موعدِ این پیش‌بینی …» پرسیده می‌شود؛ پیش‌بینی‌ای که عددش هنوز پرسیده است (C119) موعدش را پس از پاسخِ عدد می‌پرسد (y.dueAskAt)؛
       خوانندهٔ تاریخ (حرفِ خودش و برنامهٔ گزارش‌شدهٔ مدل) همان بند را دوباره نمی‌پرسد */
    var fcW29 = ((s0.coach || {}).preds || []).filter(function (y) { return y && !y.out && (String(y.at) === at || String(y.dueAskAt || "") === at); });
    var inFc29 = function (w0, d0) { return fcW29.some(function (y) { var nw = norm(String(w0 || "")), ny = norm(y.text || ""); return (d0 && (y.duePend === d0 || (y.dueAmb && y.dueAmb.date === d0))) || (ny.length >= 4 && nw.length >= 4 && (nw.indexOf(ny) >= 0 || ny.indexOf(nw) >= 0)) || ovS(String(w0 || ""), y.text || "") >= 2; }); };
    own = own.filter(function (o) { return !inFc29(o.what, o.date); });
    items = items.filter(function (z) { if (!z.plan || !fcW29.length) return true; var q = (s0.plans || []).filter(function (y) { return y && y.id === z.plan; })[0]; if (!q || String(q.at || "") !== at || !inFc29(q.text, z.date)) return true;
      delete q.whenPend; delete q.whenAsk; delete q.dateAsk; q.fcast29 = true; return false; });
    ((s0.coach || {}).preds || []).forEach(function (y) { if (!y || y.fc || y.out || (String(y.at) !== at && String(y.dueAskAt || "") !== at) || (y.pAsk && y.p == null) || items.some(function (z) { return z.pred === y.at && (z.pk || "") === (y.key || ""); })) return;
      if (y.dueAmb) items.push({ what: y.text, date: y.dueAmb.date, amb: true, wd: y.dueAmb.wd, opts: y.dueAmb.opts || undefined, pred: y.at, pk: y.key || "" });
      else if (y.duePend) items.push({ what: y.text, date: y.duePend, pred: y.at, pk: y.key || "" }); });
    /* کنشِ deadline ِ مدل که هنوز «آره» ِ او را ندارد */
    (s0._dq26 || []).forEach(function (z) { if (z.at !== at) return; var h = own.filter(function (o) { return o.date === z.date; })[0];
      /* دورِ ۲۷ (D27-4 arD1 p9): تاریخی که در حرفِ خودش نوشته شده («قبضِ بعدی ۱۴۰۵/۹/۱۵ میاد») «از حرفِ خودت» است، حتی اگر تعهدِ خودش نباشد */
      if (!h) { try { if (sentsOf25(ed27 ? ed27.text : t).some(function (c) { return c.split(/\s*[،؛:]\s*/).some(function (c2) { var I = PR.whenInfo(c2); return !!(I && !I.amb && I.date === z.date); }); })) h = { what: z.what }; } catch (e) { } }
      /* پیگیریِ برنامه‌ای که صفحه روزش را می‌پرسد (همین نوبت یا پیش‌تر) ⇒ به همان یک پرسش می‌پیوندد و با «آره» ِ او کنارِ برنامه می‌نشیند (یک کار، یک پرسش؛ U50) */
      var tgt = items.filter(function (i2) { return i2.plan && !i2.amb && i2.date === z.date; })[0] || null;
      if (!tgt) pends26(s0).forEach(function (P) { (P.items || []).forEach(function (i2) { if (!tgt && i2.plan && !i2.amb && i2.date === z.date) tgt = i2; }); });
      if (!tgt) tgt = items.filter(function (i2) { return i2.plan && i2.amb; })[0] || null;
      if (tgt) { if (!tgt.dl) { tgt.dl = { what: z.what, time: z.time || "" }; dirty = true; } return; }
      if (items.some(function (i2) { return i2.date === z.date && (i2.plan || i2.dl); })) return;
      items.push({ what: h ? h.what : z.what, date: z.date, dl: { what: z.what, time: z.time || "" }, src: h ? "her" : "model" }); });
    delete s0._dq26;
    /* حرفِ خودش که هیچ‌کدام از بالایی‌ها نبود */
    own.forEach(function (it) { if (items.some(function (z) { return (z.date === it.date && !z.amb) || (z.amb && it.amb); })) return;
      if ((s0.plans || []).some(function (q) { return q && String(q.at || "") === at && q.when === it.date; })) return; if (!it.amb && covered25(s0, it, m)) return; if (noD.indexOf(it.date) >= 0 && !it.first) return; items.push(it); });
    /* دورِ ۲۸ (C92، D28-22 tD2 p7 «اولِ ماه هم گاز رو قطع می‌کنم» کنارِ پرسشِ «قسطِ … سرِ برج» با همان ۱ آذر): پرسش‌ها برای هر کار جدا — کارِ دیگری در همان روز
       پرسیده می‌شود؛ فقط همان کار با همان روز دوباره پرسیده نمی‌شود (پیش‌تر همان «روز» هر کارِ تازه‌ای را بی‌صدا می‌انداخت) */
    items = items.filter(function (it) { return it.amb || it.plan || it.dl || it.pred || !askedZ.some(function (z) { return z.date === it.date && (norm(z.what) === norm(it.what) || (ovD27(z.what, it.what) >= 1 && sameAct28(it.what, z.what) && sameAct28(z.what, it.what))); }); });
    /* یک پرسش برای یک کار در همین نوبت (دو راهِ ✏️ همان پرسشِ «روزِ گذشته» را دو بار می‌ساختند) */
    items = items.filter(function (it, i, X) { return !it.past || X.findIndex(function (z) { return z.past === it.past && norm(z.what) === norm(it.what); }) === i; });
    /* یک کار، یک پرسش: تعهدِ دوپهلویی که همان پیش‌بینی/برنامه است جدا پرسیده نمی‌شود */
    items = items.filter(function (it) { return it.pred || it.plan || !items.some(function (z) { return (z.pred || z.plan) && z.amb && it.amb; }); });
    if (items.length) {
      items.forEach(function (z) { free28(z); });   /* دورِ ۲۸ (C92): «امروز خودش X است» فقط وقتی امروز X است */
      var old = s0.datePend; if (old && (old.state === "open" || old.state === "waiting") && (old.items || []).length) { old.state = "waiting"; (s0.dateWait = s0.dateWait || []).push(old); }
      s0.datePend = { at: nowISO(), msg: at, d0: today(), state: "open", items: items }; dirty = true;
      var amb = items.filter(function (z) { return z.amb; }), sure = items.filter(function (z) { return !z.amb && z.src !== "model" && !z.pred; }), mod = items.filter(function (z) { return !z.amb && z.src === "model" && !z.pred; }), L = [];
      var fcS29 = items.filter(function (z) { return !z.amb && z.pred; });
      var was27 = function (z) { return z.was && z.was !== z.date ? " (به‌جای " + fdate(z.was) + ")" : ""; };
      amb.forEach(function (z) { if (z.free) { L.push("«" + clip(z.what, 70) + "» — " + (z.fq || "کدام روز؟") + " خودِ روز را بنویس" + was27(z).replace("به‌جای", "نه")); return; } L.push(z.opts ?"«" + clip(z.what, 70) + "» — کدام روز: " + ambLab26(z, today(), 0) + " یا " + ambLab26(z, today(), 1) + "؟" : "«" + clip(z.what, 70) + "» — امروز خودش " + z.wd + " است: همین امروز یا " + z.wd + (/ه$/.test(z.wd) ? "ٔ" : "ِ") + " بعد (" + fdate(add(today(), 7)) + ")؟"); });
      if (sure.length) L.push("از حرفِ خودت: " + sure.map(function (z) { return "«" + clip(z.what, 70) + "» — " + (WDFA25[dowOf(z.date)]) + " " + fdate(z.date) + was27(z); }).join(" · ") + " — در «امروز» بیاید؛ درست است؟");
      if (mod.length) L.push("از گزارشِ دستیار (در حرفِ خودت تاریخی نخواندم): " + mod.map(function (z) { return "«" + clip(z.what, 70) + "» — " + (WDFA25[dowOf(z.date)]) + " " + fdate(z.date); }).join(" · ") + " — در «امروز» بیاید؛ درست است؟");
      /* C152/C132: تأییدِ موعدِ پیش‌بینی جملهٔ خودش را دارد — نه «در «امروز» بیاید» ِ برنامه */
      var fl29 = fcS29.map(function (z) { return "🎯 موعدِ این پیش‌بینی «" + clip(z.what, 70) + "» — " + WDFA25[dowOf(z.date)] + " " + fdate(z.date) + " (از حرفِ خودت) است؟ «آره» ⇒ همان روز داوری‌اش را می‌پرسم · «نه» ⇒ بی موعد می‌ماند"; });
      L = L.map(function (x) { return fcW29.some(function (y) { return x.indexOf("«" + clip(y.text, 70) + "»") === 0; }) ? "🎯 موعدِ این پیش‌بینی: " + x : x; });
      if (L.length) sysLine25(s0, "📅 " + L.join(" · ")); fl29.forEach(function (x) { sysLine25(s0, x); });
    }
    return dirty;
  };
  if (AS && AS.promptHooks) AS.promptHooks.push(function (s0) {
    var L = pends26(s0); if (!L.length) return "";
    var P0 = s0.datePend, open = P0 && P0.state === "open" ? P0 : null, wait = L.filter(function (P) { return P.state === "waiting" && !P.told; });
    var say = function (P) { return (P.items || []).map(function (z) { return "«" + clip(z.what, 60) + "» (" + (z.free ? "روزش را هنوز نگفته — کدام روز؟" : z.amb ? (z.opts ? ambLab26(z, P.d0, 0) + " یا " + ambLab26(z, P.d0, 1) : "همین امروز یا " + z.wd + (/ه$/.test(z.wd) ? "ٔ" : "ِ") + " بعد") : fdate(z.date)) + ")"; }).join(" · "); };
    var out = [];
    if (open) out.push("- زمینه (نه پرسشِ دوم): صفحه همین حالا زیرِ پیامِ پیشینش تاریخِ این حرف را از خودِ او خواسته است: " + say(open) + ". پاسخش را خودِ صفحه می‌خواند و ثبت می‌کند؛ تو این را دوباره طرح نکن، برای همین تاریخ کنشِ deadline نده و نگو «ثبت شد».");
    if (wait.length) { wait.forEach(function (P) { P.told = true; }); out.push("- زمینه (نه پرسشِ دوم): پرسشِ تاریخِ صفحه هنوز بی‌جواب است و **ثبت نشده**: " + wait.map(say).join(" · ") + " — نگو ثبت شد؛ صفحه خودش یک سطر گفته و در «امروز» به‌شکلِ پرسش مانده است."); }
    return out.length ? "# تاریخِ خودش — صفحه خودش پرسیده است (زمینه، نه پرسشِ دوم)\n" + out.join("\n") : "";
  });
  /* همین پیام تاریخِ کارِ خودش را دارد ⇒ مدل پیش از پاسخ می‌داند که صفحه خودش می‌پرسد (تا نگوید «یادآور گذاشتم») — بلوکِ ساختهٔ صفحه، نه AS.SYS */
  if (AS && AS.promptHooks) AS.promptHooks.push(function (s0, msg) {
    var t = String(msg || ""); if (!s0 || !t || /^\[سامانه/.test(t.trim())) return ""; var H = []; try { H = PR.herDates(t, s0); } catch (e) { H = []; } if (!H.length) return "";
    return "# تاریخ در همین پیام (زمینه، نه پرسشِ دوم)\n- زمینه (نه پرسشِ دوم): در همین پیام روزِ کارِ خودش هست (" + H.slice(0, 3).map(function (z) { return "«" + clip(z.what, 50).replace(/[«»]/g, "") + "»"; }).join("، ") + "). صفحه خودش زیرِ پاسخِ تو آن را با «… درست است؟» از او می‌پرسد و فقط با «آره» ِ او به «امروز» می‌برد — نگو «ثبت شد / یادآور گذاشتم»؛ اگر برنامهٔ خودش است همان را گزارش کن (plan) و بس.";
  });
  /* کنشِ deadline ِ مدل در نوبتِ گفت‌وگو (C12، مسیرِ دوم): تاریخ فقط با «آره» ِ او به «امروز» می‌رسد —
     (۱) همان کار که همین نوبت با «آره» ِ او ثبت شد ⇒ رکوردِ دوم نه (U50)؛ (۲) روزِ برنامه‌ای که خودش تأیید کرده ⇒ پیگیریِ همان برنامه (پیوند)؛
     (۳) «باشه/آره» ِ او به پیشنهادِ دستیار که همین تاریخ را داشت ⇒ ثبت، با یک سطر (D26-37)؛ (۴) وگرنه صفحه می‌پرسد «… درست است؟». بیرون از نوبتِ گفت‌وگو: همان که بود. */
  function aiOffered26(s0, m, D) {
    var M = s0.msgs || [], i = M.indexOf(m), ai = null; for (var j = i - 1; j >= 0; j--) { if (M[j] && M[j].role === "ai") { ai = M[j]; break; } if (M[j] && M[j].role === "user") break; }
    if (!ai) return false; var tx = String(ai.text || ""), base = (A.localDay && ai.at ? A.localDay(ai.at) : "") || today();
    if (nrm26(tx).indexOf(nrm26(fdate(D))) >= 0) return true;
    return tx.split(/[.!؟?\n؛،:]+|\s+—\s+/).some(function (c) { return [base, today()].some(function (b1) { var I = null; try { I = PR.whenInfo(c, b1); } catch (e) { } return !!(I && !I.amb && I.date === D); }); });
  }
  if (rawDl26 && !rawDl26._r26) {
    AS.DO.deadline = function (a) {
      var s0 = AS._turnSession; if (!s0 || PR._dlRaw26) return rawDl26.apply(this, arguments);
      var U = userMsgs(s0), m = U[U.length - 1]; if (!m) return rawDl26.apply(this, arguments);
      var what = clip(a && a.what, 120), date = String((a && a.date) || "").trim(), at = String(m.at || "");
      /* همان موعدِ باز دوباره (هم‌گام‌سازیِ اصلاح — a27 retractApply / a38 retractSess همین کنش را صدا می‌زنند) ⇒ راهِ پیشین، با همان تاریخِ فراخوان */
      if (S.all("deadline", function (x) { return x && !x.done && x.what === what; }).length) return rawDl26.apply(this, arguments);
      try { var hd = AS.herDay24 ? AS.herDay24(m.text) : ""; if (hd && hd !== date) date = hd; } catch (e) { }
      /* تاریخی که خودِ صفحه در پیامش می‌خواند بر تاریخِ مدل مقدم است (یک تاریخِ یکتا) */
      try { var own = PR.herDates(m.text, s0).filter(function (o) { return !o.amb; }); if (own.length === 1 && own[0].date !== date && !own.some(function (o) { return o.date === date; })) date = own[0].date; } catch (e) { }
      var a2 = Object.assign({}, a, { date: date });
      if (AS.deadlineRefusal && AS.deadlineRefusal(a2)) return rawDl26.call(this, a2);
      try { PR.dateAnswer(s0); } catch (e) { console.warn(e); }
      var mine = S.all("deadline", function (x) { return x && !x.done && x.date === date && (x.sess === s0.id || (x.src && x.src.sess === s0.id)); });
      /* (۱) همان کار، همین نوبت با «آره» ِ او ثبت شد (یا هم‌واژه است) */
      if (mine.some(function (x) { return x.what !== what && ((x.src && x.src.at && (s0.datePend || {}).answeredAt === at) || ovS(x.what, what) >= 1); })) return "";
      var say = function (why) { sysLine25(s0, "✓ ثبت شد و در «امروز» می‌آید: ⏰ «" + clip(what, 60) + "» — " + WDFA25[dowOf(date)] + " " + fdate(date) + why); };
      var link = function () { try { var r = S.all("deadline", function (x) { return x && !x.done && x.what === what && x.date === date; })[0], one = (s0.plans || []).filter(function (q) { return q && q.when === date && q.state !== "done" && q.state !== "notdone"; }); if (r && one.length === 1 && !r.plan) { r.plan = { sess: s0.id, id: one[0].id }; S.put(r); } } catch (e) { } };
      /* دورِ ۲۷ (C51، بانکِ R27 #128): روزی که خودش نفی کرد، برای همین کار یا پیگیری‌اش پیشنهاد و ثبت نمی‌شود (مگر همین پیام دوباره خودش بگذاردش) */
      try { if ((s0.dateNo || []).indexOf(date) >= 0 && herDays27(String(m.text || "")).pos.indexOf(date) < 0) return "یادآور ثبت نشد: روزِ " + fdate(date) + " را خودش نفی کرده بود — آن روز دوباره پیشنهاد نمی‌شود؛ اگر روزِ دیگری گفت همان را بده."; } catch (e) { }
      /* (۲) روزِ برنامه‌ای که خودش تأیید کرده (یا همین امروز) */
      /* دورِ ۲۷ (C52/C73؛ C27-17، U50): پیگیریِ برنامه‌ای که روزش ثبت است رکوردِ دوم نیست — به همان 📌 می‌چسبد (پیوند r.plan) و یک سطر می‌گوید که پیوست، نه «ثبت شد ⏰» ِ تازه */
      if ((s0.plans || []).some(function (q) { return q && q.when === date; })) { var o2 = rawDl26.call(this, a2); if (!o2) { link(); var pq = (s0.plans || []).filter(function (q) { return q && q.when === date && q.state !== "done" && q.state !== "notdone"; });
          if (pq.length === 1) sysLine25(s0, "↳ پیگیری به همان 📌 «" + clip(pq[0].text, 60) + "» پیوست — یک کار، یک سطر در «امروز»."); else say(""); } return o2; }
      /* برنامهٔ همین نوبت که صفحه دارد روزش را می‌پرسد ⇒ همان یک پرسش */
      if ((s0.plans || []).some(function (q) { return q && String(q.at || "") === at && ((q.whenPend && q.whenPend.date === date) || q.whenAsk); }) ||
          pends26(s0).some(function (P) { return (P.items || []).some(function (i2) { return i2.plan && !i2.amb && i2.date === date; }); })) { (s0._dq26 = s0._dq26 || []).push({ at: at, what: what, date: date, time: (a && a.time) || "" }); return ""; }
      /* (۳) «باشه» ِ او به پیشنهادِ تاریخ‌دارِ دستیار */
      if ((YES25.test(String(m.text || "")) || OK26.test(String(m.text || ""))) && aiOffered26(s0, m, date)) { var o3 = rawDl26.call(this, a2); if (!o3) { link(); say(" (پیشنهادِ دستیار که خودت پذیرفتی)"); } return o3; }
      /* (۴) پرسشِ صفحه — فقط اگر این روز در حرفِ خودِ او هست (همین پیام یا دو پیامِ پیشینش)؛ تاریخی که او نگفته نه ثبت می‌شود نه پرسیده (C12، بانکِ R26 #161) */
      var said26 = U.slice(-3).some(function (um) { var b0 = (A.localDay && um.at ? A.localDay(um.at) : "") || today(); return String(um.text || "").split(/[.!؟?\n؛،:]+|\s+—\s+/).some(function (c) { return (b0 && b0 < today() ? [b0] : [b0, today()]).some(function (b1) {   /* دورِ ۲۷ (C49): روزِ نسبیِ پیامِ روزهای پیش به روزِ همان پیام لنگر است، نه به امروز */ var I = null; try { I = PR.whenInfo(c, b1); } catch (e) { } return !!(I && I.date === date); }); }); });
      if (!said26) return "یادآور ثبت نشد: تاریخِ " + fdate(date) + " در حرفِ خودش نیست — صفحه روزی را که او نگفته به «امروز» نمی‌برد. اگر خودش روزی گفت همان را بده؛ وگرنه روزش را از خودش جویا شو.";
      (s0._dq26 = s0._dq26 || []).push({ at: at, what: what, date: date, time: (a && a.time) || "" });
      return "";
    };
    Object.keys(rawDl26).forEach(function (k) { AS.DO.deadline[k] = rawDl26[k]; }); AS.DO.deadline._r26 = true;
  }
  /* برنامه‌ای که صفحه روزش را پرسیده (یا تأییدش را گرفته) پیشنهادِ پیگیریِ دوم نمی‌گیرد: همان پرسشِ صفحه «در «امروز» بیاید؟» است (یک کار، یک پرسش) */
  if (AS && AS.promptFilters) AS.promptFilters.push(function (outs, s0) {
    try { outs = outs.map(function (b) { return /^# پیگیریِ برنامهٔ خودش \(پشتیبان، شاید\)\n/.test(String(b)) ? String(b).replace(/ را گزارش کن و پیگیری را[\s\S]*$/, " را گزارش کن (when فقط اگر روزش در حرفِ خودِ اوست). روزش را خودِ صفحه از حرفِ او می‌خواند و با «… درست است؟» از خودش می‌پرسد — پیگیری را جدا پیشنهاد نکن و برایش کنشِ deadline نده؛ وگرنه دربارهٔ پیگیری چیزی نگو. این پرسشِ دوم نیست.") : b; });
      return outs.filter(function (b) { if (!/^# پیگیریِ برنامهٔ خودش\n/.test(String(b)) || !/نخستین بار/.test(String(b))) return true; var mm = /\((pl\d+): «/.exec(String(b)); if (!mm) return true;
      var q = AS.plansAll ? AS.plansAll(s0).map(function (y) { return y.p; }).filter(function (p) { return p.id === mm[1]; })[0] : null; return !(q && q.dateAsk); }); } catch (e) { return outs; }
  });
  /* برنامه‌ای که بسته شد پیگیریِ خودش را هم می‌بندد (U50: «⏰ … موعدش گذشت؛ انجام شد؟» پس از «انجام دادم») */
  PR.planDlSync = function (s0) {
    var ch = false; (s0.plans || []).forEach(function (q) { if (!q || !(q.state === "done" || q.state === "notdone")) return;
      S.all("deadline", function (r) { return r && !r.done && ((r.plan && r.plan.sess === s0.id && r.plan.id === q.id) || (!r.plan && r.sess === s0.id && /^پیگیری/.test(String(r.what || "")) && r.date === q.when && (s0.plans || []).filter(function (z) { return z && z.when === q.when; }).length === 1)); }).forEach(function (r) {
        r.done = true; r.doneAt = nowISO(); r.doneBy = { kind: "plan", id: q.id, sess: s0.id, state: q.state }; S.put(r); try { AS.DO.deadline_done && AS.DO.deadline_done({ what: r.id }); } catch (e) { } ch = true; }); });
    return ch;
  };

  /* ---------- پس از هر نوبت: موعدِ گزارش‌شده، حدسِ آزموده، خواستهٔ عقب‌افتاده ---------- */
  if (AS && AS.afterTurnHooks) AS.afterTurnHooks.push(function (s0, o, acts) {
    var d = false;
    try { if (PR.dlDoneFromHer(s0).length) d = true; } catch (e) { console.warn(e); }
    try { if (PR.doneFromHer28(s0)) d = true; } catch (e) { console.warn(e); }
    try { if (PR.guessOwnTest(s0)) d = true; } catch (e) { console.warn(e); }
    try { if (PR.herLater(s0, acts || [])) d = true; } catch (e) { console.warn(e); }
    try { if (PR.predVerdict(s0)) d = true; } catch (e) { console.warn(e); }
    try { var C0 = (s0 && s0.coach) || {}, n0 = (C0.preds || []).length; PR.predExplicit(s0); if (((s0 && s0.coach && s0.coach.preds) || []).length > n0) d = true; } catch (e) { console.warn(e); }
    try { if (PR.datePend(s0)) d = true; } catch (e) { console.warn(e); }
    try { if (PR.planDlSync(s0)) d = true; } catch (e) { console.warn(e); }
    if (d && s0) S.put(s0);
  });

  /* «امروز» (لایهٔ آخر): قول‌های عقب‌افتادهٔ خودش از روزهای پیش، سپس ادغامِ «یک کار، یک سطر» */
  var rawDue23 = A.dueList;
  if (rawDue23 && !rawDue23._r23) {
    A.dueList = function () {
      var items = rawDue23.apply(this, arguments) || [];
      try { PR.openUserPromises("").forEach(function (y) { if (y.pr.due ? y.pr.due > today() : !(y.pr.d && y.pr.d < today())) return;
        items.push({ k: "p", prom: y.pr.id, psess: y.s.id, txt: "↩ خواسته‌ای که گذاشتی برای بعد: «" + clip(y.pr.ask, 80) + "»", sub: "سشنِ «" + clip(y.s.title || y.s.pinned || "گفت‌وگو", 40) + "» · " + fdate(y.pr.d) + (y.pr.ctx ? " · دربارهٔ «" + clip(y.pr.ctx, 60) + "»" : ""),
          go: function () { try { localStorage.setItem("lla.assist.cur", y.s.id); } catch (e) { } if (AS.toggle) AS.toggle(true); } }); }); } catch (e) { console.warn(e); }
      /* دورِ ۲۶ (Q5): پرسشِ تاریخی که هنوز «آره/نه» نگرفته در «امروز» به‌شکلِ پرسش می‌ماند و همان‌جا پاسخ می‌گیرد؛
         برنامه‌ای که روزش پرسیده شده تا پاسخ نگرفته سطرِ «قولِ بی‌تاریخ» نمی‌گیرد (همان یک پرسش) */
      try { var rer26 = function () { if (A.state && A.state.view === "home" && A.render) A.render(); }, askPl = {};
        S.all("achat").forEach(function (se) { pends26(se).forEach(function (P, pi) { (P.items || []).forEach(function (it, ii) {
          if (it.plan) askPl[se.id + ":" + it.plan] = 1;
          var tap = function (v, msg) { return function () { if (PR.dateResolve(se.id, pi, ii, v)) { if (A.toast) A.toast(msg); rer26(); } }; };
          /* دورِ ۲۷ (C49/C69): پرسشِ سرآمده (روزش گذشت، کارش انجام شد) بسته است — در «امروز» نه پرسش می‌ماند نه سطرِ «گذشت» (سطرِ «گذشت» ِ دورِ ۲۶ همین زیر مانده و فقط برای قلمی می‌آید که این قاعده سرآمده نداند) */
          if (lapsed27(se, it, P.d0)) return;
          if (it.free) { items.push({ k: "dq", dq: se.id, txt: "📅 " + itemLine26(it, P.d0), sub: "روزش را خودت بنویس — تا ننویسی چیزی ثبت نمی‌شود · سشنِ «" + clip(se.title || se.pinned || "گفت‌وگو", 40) + "»", acts: [{ t: "کنار بگذار", cls: "dopt dq-no", fn: tap("no", "کنار رفت.") }], go: function () { try { localStorage.setItem("lla.assist.cur", se.id); } catch (e) { } if (AS.toggle) AS.toggle(true); } }); return; }
          if (!it.amb && it.date < today()) { items.push({ k: "dq", dq: se.id, txt: "📅 «" + clip(it.what, 70) + "» — " + fdate(it.date) + " گذشت و تأیید نشده بود؛ ثبت نشد.", sub: "پرسشِ تاریخِ بی‌جواب · سشنِ «" + clip(se.title || se.pinned || "گفت‌وگو", 40) + "»", acts: [{ t: "کنار بگذار", cls: "dopt dq-no", fn: tap("no", "کنار رفت.") }] }); return; }
          var acts = it.amb ? [{ t: ambLab26(it, P.d0, 0), cls: "dopt dq-same", fn: tap(ambO26(it, P.d0)[0], "ثبت شد.") }, { t: ambLab26(it, P.d0, 1), cls: "dopt dq-next", fn: tap(ambO26(it, P.d0)[1], "ثبت شد.") }, { t: "هیچ‌کدام", cls: "dopt dq-no", fn: tap("no", "باشد — ثبت نشد.") }]
            : [{ t: "آره، همین", cls: "dopt dq-yes", fn: tap("yes", "ثبت شد.") }, { t: "نه", cls: "dopt dq-no", fn: tap("no", "باشد — ثبت نشد.") }];
          items.push({ k: "dq", dq: se.id, txt: "📅 " + itemLine26(it, P.d0) + (it.amb ? "؟" : " — هنوز تأیید نشده؛ درست است؟"), sub: "تاریخی که صفحه از حرفِ خودِ گفت‌وگو خواند · تا تأیید نشود ثبت نمی‌شود · سشنِ «" + clip(se.title || se.pinned || "گفت‌وگو", 40) + "»", acts: acts,
            go: function () { try { localStorage.setItem("lla.assist.cur", se.id); } catch (e) { } if (AS.toggle) AS.toggle(true); } }); }); }); });
        items = items.filter(function (it) { if (it.k !== "p" || !it.pid) return true; return !Object.keys(askPl).some(function (k) { return k.split(":").pop() === it.pid; }); }); } catch (e) { console.warn(e); }
      try { return PR.actMerge(items); } catch (e) { console.warn(e); return items; }
    };
    A.dueList._r23 = true;
  }

  /* ---------- ثبت برای دستیار و منو ---------- */
  A.VIEW_META = A.VIEW_META || {};
  /* دورِ ۲۲ (P8، B·D20): نامِ نما همان سرِ صفحه است («🧪 پرونده‌های تمرینِ باز»)، نه «۴۵ تکنیک ›» ِ پدرش */
  A.VIEW_META.practice = { fa: "🧪 پرونده‌های تمرینِ باز", j: "ws", what: "پرونده‌های تمرینِ باز: برای هر تکنیک × موضوع یک پرونده با جلسه‌های تاریخ‌دار، نتیجهٔ سنجیده، موعدِ بعد از متنِ خودِ تکنیک، «تثبیت شد» با شاهد و وارسیِ ماندگاری؛ و فهرست‌های جاری (فرض‌ها، مدل‌ها، اشتباهات، ابهام‌ها، پارتو، سیگنال/نویز).", why: "تا تکنیک‌هایی که با برگشتن کار می‌کنند واقعاً برگردند و بدانی کِی مهارت یا باور تثبیت شد — نه با شمردنِ تلاش‌های یک روز." };
  A.SUB_VIEWS = A.SUB_VIEWS || {}; A.SUB_VIEWS.practice = "lib";
})(window.APP);
