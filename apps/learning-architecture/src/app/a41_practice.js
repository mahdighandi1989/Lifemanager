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
  function nowISO() { return new Date().toISOString(); }
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
    function role(s, r, x) { R.roles[s.d] = r; if (x != null) R.late[s.d] = x; }
    function resetTo(d) { anchor = d; i = 0; R.ev = []; }
    tl.forEach(function (it) {
      if (it.e) { if (it.e.ev === "pause") R.paused = it.e; else { R.paused = null; if (anchor != null) resetTo(it.d); } return; }
      var s = it.s;
      if (R.stable) {
        if (s.ok === false) { R.withdrawn.push({ d: s.d, was: R.stable.d, why: s.why || "وارسیِ " + fdate(s.d) + " شکست خورد" }); R.stable = null; role(s, "decay"); resetTo(s.d); R.progress = true; return; }
        if (s.d >= R.stable.next) { R.stable.checks.push(s.d); R.stable.next = add(s.d, ck); role(s, "checkin"); } else role(s, "extra");
        return;
      }
      if (pol.shape === "steps") {
        if (anchor == null || (s.d === anchor && i === 0)) { anchor = s.d; i = 0; role(s, "start"); return; }
        var due = add(anchor, steps[i]), w = steps[i] - (i ? steps[i - 1] : 0), until = add(due, w);
        if (s.d < due) { role(s, "early"); return; }
        if (s.d >= until) { role(s, "late", gap(due, s.d)); resetTo(s.d); return; }
        if (s.ok === false) { role(s, "fail"); resetTo(s.d); R.progress = true; return; }
        role(s, "step"); R.ev.push({ d: s.d, step: steps[i], why: s.why || "", meas: s.meas || null }); i++; R.progress = true;
        if (i >= steps.length && pol.crit === "steps") R.stable = { d: s.d, ev: R.ev.slice(), checks: [], next: add(s.d, ck), crit: "steps" };
        return;
      }
      if (pol.shape === "window") {
        if (anchor == null || s.ok == null) { anchor = s.d; role(s, "start"); return; }
        var wd = add(anchor, pol.win[0]), wu = add(anchor, pol.win[1]);
        if (s.d > wu) role(s, "late", gap(wu, s.d)); else if (s.d < wd) role(s, "early"); else role(s, s.ok ? "step" : "fail");
        anchor = s.d; R.progress = true;
        if (s.ok) R.ev.push({ d: s.d, problem: (s.meas || {}).problem || "", why: s.why || "" }); else if (s.ok === false) R.ev = [];
        return;
      }
      if (pol.shape === "every") {
        if (anchor == null) { anchor = s.d; role(s, "start"); R.ev = s.ok === false ? [] : [{ d: s.d }]; return; }
        if (gap(anchor, s.d) > pol.every) { role(s, "late", gap(add(anchor, pol.every), s.d)); R.ev = []; } else role(s, s.ok === false ? "fail" : "step");
        anchor = s.d; if (s.ok === false) R.ev = []; else { R.ev.push({ d: s.d }); R.progress = true; }
        return;
      }
      role(s, "session"); anchor = s.d; if (pol.shape !== "once" && pol.shape !== "habit") R.progress = true;
    });
    R.anchor = anchor;
    if (pol.shape === "steps" && anchor != null && !R.stable) R.next = add(anchor, steps[i]);   /* گامِ بعدِ چرخه (برای T41 همان را P3 در «امروز» می‌دهد) */
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
    else if (pol.shape === "steps" && anchor != null && !pol.p3) { R.due = add(anchor, steps[i]); R.until = add(R.due, steps[i] - (i ? steps[i - 1] : 0)); R.reason = stepReason(c, steps[i], i); }
    else if (pol.shape === "steps" && pol.p3 && anchor != null && R.withdrawn.length && !R.stable) { R.due = add(anchor, steps[i]); R.reason = stepReason(c, steps[i], i); }
    else if (pol.shape === "window" && anchor != null) { R.due = add(anchor, pol.win[0]); R.until = add(anchor, pol.win[1]); R.reason = "بازگشت برای سنجشِ نتیجهٔ راهبرد (" + pol.cite + ")"; }
    else if (pol.shape === "every" && anchor != null) { R.due = add(anchor, pol.every); R.reason = "نوبتِ بعد (" + pol.cite + ")"; }
    else if (!sess.length && !c.closed && /^(steps|window|every|exp|calib)$/.test(pol.shape) && !pol.p3) { R.due = c.start; R.reason = "جلسهٔ نخست (" + pol.cite + ")"; }
    else if (pol.shape === "exp" && c.udue && !R.stable) { R.due = c.udue; R.reason = "دیدنِ نتیجهٔ آزمون (موعدِ خودت)"; }
    if (R.state === "stable" && pol.shape === "verdict" && !R.due) R.due = null;
    R.overdue = R.due && R.due < t ? gap(R.due, t) : 0;
    return R;
  };
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
    R.crit = [{ ok: inBand, t: "اطمینانِ اعلام‌شده (" + fa(R.calib.conf) + "٪) درونِ بازهٔ نرخِ درستی (" + fa(R.calib.est) + "٪ ± " + fa(R.calib.sd) + ")" }, { ok: PR.spaced(days) && days.length >= 3, t: "پیش‌بینی‌ها در دست‌کم ۳ روزِ جدا (نوبت‌های فاصله‌دار، قاعدهٔ گره) — اکنون " + fa(days.length) + " روز" }];
    if (n) R.progress = true;
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
  PR.save = function (c, quiet) {
    if (c.kind === "list") return listSave(c);
    var R = PR.eval(c), prev = c.state;
    if (R.state !== prev) (c.hist = c.hist || []).push({ d: today(), at: nowISO(), ev: "state", from: prev, to: R.state, why: R.state === "stable" ? "شاهد: " + (R.stable.ev || []).map(function (e) { return fdate(e.d); }).join("، ") : R.withdrawn.length && prev === "stable" ? R.withdrawn[R.withdrawn.length - 1].why : "" });
    (R.withdrawn || []).forEach(function (w) { var hs = c.hist = c.hist || []; if (!hs.some(function (e) { return e.ev === "withdraw" && e.d === w.d; })) hs.push({ d: w.d, at: nowISO(), ev: "withdraw", from: "stable", why: "«تثبیت شد» (" + fdate(w.was) + ") پس گرفته شد: " + w.why }); });
    c.state = R.state; c.due = R.due || ""; c.until = R.until || ""; c.reason = R.reason || "";
    c.stable = R.stable ? { d: R.stable.d, crit: R.stable.crit, ev: R.stable.ev, next: R.stable.next || "", checks: R.stable.checks } : null;
    c.withdrawn = R.withdrawn; c.roles = R.roles; c.late = R.late;
    S.put(c); PR.sync(c, R);
    return R;
  };

  /* ---------- موعدها از راهِ A.SCHED (یا سطرِ «امروز» ِ همین فایل اگر نبود) ---------- */
  PR.entries = function (c, R) {
    if (!own(c)) return [];
    if (c.kind === "list") return listEntries(c);
    R = R || PR.eval(c); if (!R.due) return [];
    var pol = P[c.tid] || {};
    return [{ kind: "practice", id: c.id, due: R.due, until: R.until || "", reason: "🧪 " + R.reason + " — " + fa(c.tid) + " · " + (A.TM[c.tid] || {}).fa + " · " + PR.subjLabel(c.subj),
      policy: { tid: c.tid, shape: pol.shape, cite: pol.cite }, open: ["practice", c.id], txt: "🧪 " + (A.TM[c.tid] || {}).fa + " — " + PR.subjTitle(c.subj), sub: R.reason + (R.until ? " · تا " + fdate(R.until) : "") }];
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
    if (pol.shape === "list") { var lc = listFromEx(ex); if (lc) { if (ex.prc !== lc.id) ex.prc = lc.id; (lc.sess = lc.sess || []).filter(function (x) { return x.d === today(); }).length || lc.sess.push({ d: today(), ex: ex.id }); listSave(lc); } return lc; }
    var subj = subjOfEx(ex), c = (ex.prc && S.get(ex.prc)) || PR.start(tid, subj, { src: srcOfEx(ex), sample: !!ex.sample });
    if (!c) return null;
    if (ex.prc !== c.id) ex.prc = c.id;   /* پیوندِ اصلی sessions[].ex ِ پرونده است؛ کاربرگ دوباره نوشته نمی‌شود (یک نوشتن برای هر ثبت — test_journey) */
    var m = measOf(ex), sess = { d: o.d, what: summary(ex), self: A.rubricPct ? A.rubricPct(ex) : null, meas: m, ex: ex.id, src: srcOfEx(ex) };
    if (tid === 24) t24Sync(ex, c);
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
  function parseWhen(t, from) {
    var s = dg(t).trim(); if (!s) return "";
    var m = /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/.exec(s); if (m) { var r = A.epiRevDate ? A.epiRevDate(m[0]) : m[0]; return r || ""; }
    m = /(\d+)\s*(روز|هفته|ماه)/.exec(s); if (m) return add(from || today(), +m[1] * (m[2] === "هفته" ? 7 : m[2] === "ماه" ? 30 : 1));
    if (/فردا/.test(s)) return add(from || today(), 1);
    return "";
  }
  PR.parseWhen = parseWhen;
  var O2F = { "درست": "شد", "نادرست": "نشد" }, F2O = { "شد": "درست", "نشد": "نادرست" };
  function sameQ(a, b) { return norm(a) && norm(a) === norm(b); }
  PR.dupFcast = function (q, sample) { return S.all("fcast", function (x) { return !!x.sample === !!sample && sameQ(x.q, q); })[0] || null; };
  /* ردیف‌های T24 ⇒ 🎯 (یک رکورد): ردیف شناسهٔ fcast را نگه می‌دارد؛ نتیجه از هر سو، آخرین تغییر برنده */
  function t24Sync(ex, c) {
    var rows = (ex.data && ex.data.preds) || [], ch = false, base = A.localDay(ex.created) || today();
    rows.forEach(function (row, i) {
      if (!row) return; var q = clip(row.st, 200), p = num(row.conf); if (!q || p == null) return;
      var fc = row.fc && S.get(row.fc);
      if (!fc) { fc = PR.dupFcast(q, ex.sample); if (!fc) { fc = { id: A.uid("fc"), type: "fcast", q: q, p: p, due: parseWhen(row.due, base) || "", dim: "s_decision", tid: 24, src: { ex: ex.id, row: i }, prc: c.id }; if (ex.sample) fc.sample = true; S.put(fc); } else if (!fc.src) { fc.src = { ex: ex.id, row: i }; fc.prc = fc.prc || c.id; fc.tid = fc.tid || 24; S.put(fc); } row.fc = fc.id; row._fo = fc.outcome || ""; row._ro = ""; ch = true; }
      var dd = parseWhen(row.due, base); if (dd && fc.due !== dd) { fc.due = dd; S.put(fc); }
      if (fc.p !== p) { fc.p = p; S.put(fc); }
      if ((row.out || "") !== (row._ro || "")) { var o = O2F[row.out] || (row.out ? "نامعلوم" : ""); if (o !== (fc.outcome || "")) { fc.outcome = o; fc.outcomeAt = nowISO(); S.put(fc); } row._ro = row.out || ""; row._fo = fc.outcome || ""; ch = true; }
      else if ((fc.outcome || "") !== (row._fo || "")) { row.out = F2O[fc.outcome] || (fc.outcome ? "نامعلوم" : ""); row._ro = row.out; row._fo = fc.outcome || ""; ch = true; }
    });
    if (ch) S.put(ex);
  }
  PR.t24Sync = function (ex) { var c = ex.prc && S.get(ex.prc); if (c) t24Sync(ex, c); };
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
  PR.guessStatus = function (pid) {
    var G = liveGuess(pid); if (!G || !G.g) return null; var T = G.g.prcTests || [];
    var conf = T.filter(function (x) { return x.res === "confirm"; }), ref = T.filter(function (x) { return x.res === "refute"; });
    return { text: G.g.guess, tests: T, label: ref.length ? "حدس رد شد (" + fdate(ref[0].d) + ")" : conf.length ? "تأیید در " + fa(conf.length) + " آزمون (" + conf.map(function (x) { return fdate(x.d); }).join("، ") + ") — تأیید، اثبات نیست" : "هنوز آزموده نشده", refuted: !!ref.length, confirms: conf.length };
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
  PR.setDue = function (c, d) { if (typeof c === "string") c = S.get(c); if (!c) return; c.udue = d || ""; PR.save(c); return c; };
  /* کاربرگِ تازه برای همین پرونده (پیش‌نویسِ بازِ همین پرونده دوباره به کار می‌رود، نه یکی دیگر) */
  PR.openWS = function (c) {
    if (typeof c === "string") c = S.get(c); if (!c) return;
    var ex = S.all("ex", function (e) { return e.prc === c.id && e.status === "draft"; })[0];
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
    if (!x) { x = { id: "it" + (c.items.length + 1) + "_" + Math.random().toString(36).slice(2, 6), d: today(), hist: [] }; c.items.push(x); }
    ["text", "name", "claim", "driver", "load", "from", "prc", "mistake"].forEach(function (f) { if (it[f] != null && (x[f] == null || f === "load" || f === "mistake")) x[f] = it[f]; });
    if (it.from) { x.froms = x.froms || []; if (x.froms.indexOf(it.from) < 0) x.froms.push(it.from); }
    if (it.p != null && x.p == null) { x.p = it.p; x.hist.push({ d: today(), p: it.p, why: "ثبتِ نخست" }); }
    if (it.recheck != null) { x.recheck = it.recheck || ""; x.needDate = !x.recheck; }
    if (name === "claims" && x.recheck == null) { x.recheck = ""; x.needDate = true; }
    if (it.share != null) { x.shares = x.shares || []; x.shares.push({ d: today(), v: num(it.share) }); }
    if (it.conf != null) { x.hist.push({ d: today(), conf: num(it.conf), verdict: it.verdict || "" }); }
    if (name === "beliefs" && it.mistake) PR.listAdd("mistakes", { text: x.text, from: 34 }, o);
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
    if (!x.uses.some(function (y) { return y.d + "|" + norm(y.where || "") === key || (y.d === d && !u.where); })) x.uses.push({ d: d, where: clip(u.where, 120), real: u.real !== false, link: u.link || null, at: nowISO() });
    modelStatus(x); listSave(c); return x;
  };
  function modelDays(x) { var o = {}; (x.uses || []).forEach(function (u) { if (u.real) o[u.d] = 1; }); return Object.keys(o).sort(); }
  /* شمارِ کاربست = روزهای جدا (دو بار در یک روز/یک تصمیم یک بار)؛ «پذیرفته» فقط با کاربستِ واقعی در سه روزِ جدا (متنِ T16) */
  function modelStatus(x) { var dd = modelDays(x), all = {}, was = x.status; (x.uses || []).forEach(function (u) { all[u.d] = 1; }); x.status = dd.length >= LISTS.models.admit ? "پذیرفته" : "نامزد"; if (x.status === "پذیرفته" && was !== "پذیرفته") x.admitted = dd[LISTS.models.admit - 1]; x.count = Object.keys(all).length; x.realDays = dd.length; }
  PR.modelDays = modelDays;
  /* ابهام (T35): هر تغییرِ احتمال با تاریخ و دلیل؛ پیشین پاک نمی‌شود */
  PR.ambUpdate = function (k, p, why, o) { var c = PR.list("ambiguities", o), x = PR.listItem("ambiguities", k, o); if (!x) return null; x.hist.push({ d: today(), p: num(p), from: x.p, why: clip(why, 160) }); x.p = num(p); listSave(c); return x; };
  PR.itemClose = function (name, k, how, o) { var c = PR.list(name, o), x = PR.listItem(name, k, o); if (!x) return null; x.closed = { d: today(), how: clip(how, 160) }; listSave(c); return x; };
  /* ادعا (T10): نتیجهٔ دادهٔ خارج از نمونه ⇒ حکم؛ یادآورِ ادعای حکم‌خورده برداشته می‌شود */
  PR.claimResult = function (k, result, verdict, o) { var c = PR.list("claims", o), x = PR.listItem("claims", k, o); if (!x) return null; x.result = clip(result, 200); x.verdict = verdict || ""; x.decidedAt = today(); listSave(c); return x; };
  PR.paretoShare = function (driver, v, o) { return PR.listAdd("pareto", { driver: driver, text: driver, share: v }, o); };
  PR.beliefRevise = function (k, conf, verdict, mistake, o) { var c = PR.list("beliefs", o), x = PR.listItem("beliefs", k, o); if (!x) return null; x.hist.push({ d: today(), conf: num(conf), verdict: verdict || "" }); if (mistake) { x.mistake = true; var m = PR.listAdd("mistakes", { text: x.text, from: 34 }, o); x.mistakeId = m && m.id; } listSave(c); return x; };
  PR.listLink = function (name, k, prcId, o) { var c = PR.list(name, o), x = PR.listItem(name, k, o); if (!x) return null; x.prc = prcId; listSave(c); return x; };
  function listFromEx(ex) {
    var d = ex.data || {}, o = { sample: !!ex.sample }, t = ex.tid;
    if (t === 15) (d.assum || []).forEach(function (r) { if (r && String(r.a || "").trim()) PR.listAdd("assumptions", { text: r.a, load: /فرو می‌ریزد/.test(r.load || "") }, o); });
    if (t === 16) (d.models || []).forEach(function (r) { if (r && String(r.m || "").trim()) PR.modelUse(r.m, { where: clip(d.event, 120), real: true }, o); });
    if (t === 34) { if (String(d.belief || "").trim()) PR.listAdd("beliefs", { text: d.belief, conf: d.conf1 != null && d.conf1 !== "" ? d.conf1 : d.conf0 }, o); if (String(d.log || "").trim()) PR.listAdd("mistakes", { text: d.log, from: 34 }, o); }
    if (t === 35) { var p0 = ((d.hyp || [])[0] || {}).p; if (String(d.problem || "").trim()) PR.listAdd("ambiguities", { text: d.problem, p: num(p0) }, o); }
    if (t === 3) (d.drivers || []).forEach(function (r) { if (r && String(r.name || "").trim()) PR.paretoShare(r.name, r.val, o); });
    if (t === 10) { if (String(d.claim || "").trim()) { var x = PR.listAdd("claims", { claim: d.claim, text: d.claim, recheck: parseWhen(d.action, today()) }, o); if (x && d.verdict && String(d.oos || "").trim()) PR.claimResult(x.id, d.oos, d.verdict, o); } }
    var nm = { 15: "assumptions", 16: "models", 34: "beliefs", 35: "ambiguities", 3: "pareto", 10: "claims" }[t];
    return nm ? PR.list(nm, o) : null;
  }
  /* موعدهای فهرست: مرورِ دوره‌ای به آهنگِ تکنیک؛ رویدادِ مهم ⇒ بازبینیِ فوری؛ ادعا ⇒ تاریخی که خودِ کاربر نوشت (بی تاریخِ ساختگی) */
  function listEval(c) {
    var L = LISTS[c.list] || {}, open = (c.items || []).filter(function (x) { return !x.closed; }), out = [];
    var last = (c.reviews || []).slice().sort().pop() || c.start;
    if (L.every && open.length) out.push({ id: c.id, due: add(last, L.every), reason: "مرورِ " + L.fa + " (" + L.cite + ")" });
    if (c.list === "assumptions" && c.event && open.some(function (x) { return x.load; })) out.push({ id: c.id + ":ev", due: c.event.d, reason: "رویدادِ مهم «" + clip(c.event.what, 60) + "» — بازبینیِ فرض‌های باربر" });
    if (c.list === "claims") open.forEach(function (x) { if (x.recheck && !x.decidedAt) out.push({ id: c.id + ":" + x.id, due: x.recheck, reason: "بررسیِ دوبارهٔ ادعای «" + clip(x.claim || x.text, 60) + "» با دادهٔ خارج از نمونه (تاریخِ خودت)" }); });
    return out;
  }
  PR.listEval = listEval;
  function listEntries(c) { var L = LISTS[c.list] || {}; return listEval(c).map(function (e) { return { kind: "practice", id: e.id, due: e.due, reason: "🧪 " + e.reason, policy: { tid: L.tid, shape: "list", cite: L.cite }, open: ["practice", c.id], txt: "🧪 " + L.fa, sub: e.reason }; }); }
  function listSave(c) { var E = listEval(c); c.due = E.length ? E.map(function (e) { return e.due; }).sort()[0] : ""; S.put(c); PR.sync(c); return E; }

  /* ---------- بازتابِ رکوردهای پیوسته: تغییرِ 🎯 / آزمایشِ گره / پرونده ⇒ پروندهٔ تمرین هم‌گام (یک رکورد، نه رونوشت) ---------- */
  var busy = false;
  S.listeners = S.listeners || [];
  S.listeners.push(function (r, op) {
    if (busy || op !== "put" || !r) return;
    busy = true;
    try {
      if (r.type === "fcast" && r.src && r.src.ex) { var ex = S.get(r.src.ex); if (ex && ex.tid === 24) { var c = ex.prc && S.get(ex.prc); if (c) { t24Sync(ex, c); PR.save(c); } } }
      else if (r.type === "fcast" && r.prc) { var c2 = S.get(r.prc); if (c2) PR.save(c2); }
      else if (r.type === "kexp") { PR.all(function (c) { return c.tid === 21 && c.kind !== "list" && ((r.prc === c.id) || (c.subj.k === "knot" && c.subj.id === r.knot)); }).forEach(function (c) { PR.save(c); }); }
      else if (r.type === "ex" && r.tid === 24 && r.prc && r.status === "done") { var c3 = S.get(r.prc); if (c3) t24Sync(r, c3); }
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
  PR.dueText = function (c) { if (!c.due) return c.state === "stable" ? "بی موعد (تثبیت شد)" : "موعدی ندارد"; var od = c.due < today() ? gap(c.due, today()) : 0; return "موعدِ بعد: " + fdate(c.due) + (c.until ? " تا " + fdate(c.until) : "") + (od ? " (" + fa(od) + " روز گذشته)" : "") + " — " + (c.reason || ""); };
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
    var RF = { start: "آغاز", step: "گامِ به‌موقع", early: "زودتر از موعد", late: "دیرتر از موعد", fail: "نشد — چرخه از نو", decay: "وارسی شکست خورد", checkin: "وارسیِ ماندگاری", extra: "جلسهٔ افزوده", lapse: "لغزش", session: "جلسه" };
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
    (c.withdrawn || []).forEach(function (w) { box.appendChild(h("p", { class: "small warnline" }, "«تثبیت شد» (" + fdate(w.was) + ") در " + fdate(w.d) + " پس گرفته شد: " + w.why)); });
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
    if (tid === 41) S.all("sched", function (s) { return s.proto === "P3" && (c ? ((c.links || {}).p3 || []).indexOf(s.id) >= 0 : true); }).sort(function (a, b) { return a.due.localeCompare(b.due); }).forEach(function (s) { out.push({ kind: "sched", id: s.id, t: "برگه سفید " + s.label + " — " + (s.title || (S.get(s.topic) || {}).title || ""), out: s.done ? "✓ انجام شد" : "موعد " + fdate(s.due), go: function () { A.startProto && A.startProto("P3", { sched: s.id, topic: s.topic }); } }); });
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
  function listView(c) {
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
  A.V.practice = function (id) {
    var c = id && S.get(id);
    if (c && c.type === "practice" && c.kind === "list") return listView(c);
    if (!c || c.type !== "practice") {
      var root0 = h("div", { class: "page prc", dir: "rtl" });
      root0.appendChild(A.head("یادگیری", "🧪 پرونده‌های تمرینِ باز", "هر تکنیکی که با برگشتن در روزها و هفته‌ها کار می‌کند، برای هر موضوع یک پرونده دارد تا شاهدِ تاریخ‌دار نشان دهد مهارت یا باور تثبیت شد."));
      var L0 = PR.cases(), Ls = PR.all(function (x) { return x.kind === "list" && own(x); });
      root0.appendChild(h("section", { class: "card" }, h("h2", {}, "پرونده‌ها (" + fa(L0.length) + ")"), L0.length ? h("ul", { class: "plain" }, L0.map(caseRow)) : h("p", { class: "small muted" }, "هنوز پرونده‌ای نیست؛ از صفحهٔ هر تکنیک، مسئله، پرونده یا گره شروع کن.")));
      root0.appendChild(h("section", { class: "card" }, h("h2", {}, "فهرست‌های جاری"), h("ul", { class: "plain" }, Object.keys(LISTS).map(function (k) { var lc = Ls.filter(function (x) { return x.list === k; })[0]; return h("li", {}, h("button", { class: "linkish", type: "button", onclick: function () { A.go("practice", (lc || PR.list(k)).id); } }, LISTS[k].fa), h("span", { class: "small muted" }, " — " + fa(lc ? lc.items.filter(function (x) { return !x.closed; }).length : 0) + " مورد · تکنیکِ " + fa(LISTS[k].tid))); }))));
      return root0;
    }
    var R = PR.eval(c), t = A.TM[c.tid], root = h("div", { class: "page prc", dir: "rtl" }), go = PR.subjGo(c.subj);
    root.appendChild(A.head("🧪 پروندهٔ تمرینِ باز", fa(c.tid) + " · " + t.fa, null, h("div", { class: "row gap wrap" }, stChip(c), chip("از «" + (SRC_FA[c.src] || c.src) + "»"), c.sample ? chip("نمونه/تور") : null)));
    root.appendChild(h("p", { class: "prc-subj" }, "موضوع: ", go ? h("button", { class: "linkish", type: "button", onclick: go }, PR.subjLabel(c.subj)) : h("b", {}, PR.subjLabel(c.subj)), " · آغاز " + fdate(c.start)));
    root.appendChild(h("p", { class: "prc-due", dir: "rtl" }, PR.dueText(c)));
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
    root.appendChild(h("details", { class: "card" }, h("summary", {}, "تاریخچه (" + fa(hs.length) + ")"), h("ul", { class: "small prc-hist" }, hs.map(function (e) { return h("li", {}, fdate(e.d) + " — " + ({ start: "آغاز", state: "وضع: " + (ST_FA[e.from] || e.from || "") + " ← " + (ST_FA[e.to] || e.to || ""), pause: "مکث", resume: "ادامه", close: "بسته شد", reopen: "دوباره باز شد", claim: "ادعای «تثبیت شد»", withdraw: "«تثبیت شد» پس گرفته شد" })[e.ev] + (e.why ? " — " + e.why : "")); }))));
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
    box.appendChild(h("div", { class: "row gap wrap", "data-own": "1" }, mi, h("button", { class: "btn sm ghost", type: "button", onclick: function () { if (!mi.value.trim()) return; PR.modelUse(mi.value.trim(), { where: "مسئلهٔ «" + PR.subjTitle(PR.subj("live", pid)) + "»", real: true, link: { k: "live", id: pid } }); A.toast("در قفسهٔ مدل‌ها شمرده شد."); A.render(); } }, "کاربستِ مدل")));
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
          ev.push({ k: "practice", at: (c.hist && c.hist[0] && c.hist[0].at) || "", i: ev.length, title: "🧪 پروندهٔ تمرین — " + nm, lines: [ST_FA[c.state] + " · " + PR.dueText(c)].concat(gs && gs.tests.length ? ["حدس: «" + gs.text + "» — " + gs.label] : []), prc: c.id });
          (c.sessions || []).filter(function (x) { return !x.draft; }).sort(byD).forEach(function (x) { ev.push({ k: "practice", at: x.at || x.d, i: ev.length, title: "🧪 جلسهٔ تمرین (" + nm + ")", lines: [x.what || "جلسه"], out: x.ok === true ? "شد" : x.ok === false ? "نشد" : "", prc: c.id }); });
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
        var check = function () { var d = PR.dupFcast(q.value); note.classList.toggle("hidden", !d); note.textContent = d ? "این پیش‌بینی پیش‌تر ثبت شده" + (d.tid === 24 ? " (از کاربرگِ ۲۴)" : "") + ": «" + d.q + "» — " + (d.p != null ? fa(d.p) + "٪ · " : "") + "موعد " + fdate(d.due) + (d.outcome ? " · نتیجه: " + d.outcome : "") + ". همان رکورد را به‌روز کن، دومی ساخته نمی‌شود." : ""; return d; };
        q.addEventListener("input", check);
        btn.addEventListener("click", function (e) { if (check()) { e.stopImmediatePropagation(); e.preventDefault(); A.toast("این پیش‌بینی پیش‌تر ثبت شده؛ دومی ساخته نشد.", "bad"); } }, true);
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
  PR.consent = function (txt) { var t = String(txt || "").trim(); if (/^\s*(نه|نخیر|بعدا|بعداً|فعلا نه|فعلاً نه|الان نه|نمی‌خوام|نمیخوام)/.test(t)) return false; return YES.test(t) || ASKV.test(t); };
  if (AS && AS.DO) {
    /* {"do":"start_practice","tid":41,"pid"|"knot"|"case"|"topic":"…"} */
    AS.DO.start_practice = function (a) {
      var s = AS._turnSession, U = ((s && s.msgs) || []).filter(function (m) { return m.role === "user" && !/^\[سامانه/.test(m.text || ""); }), last = U[U.length - 1];
      if (!last || !PR.consent(last.text)) return "پرونده ساخته نشد: فقط پس از «آری» یا خواستهٔ صریحِ خودِ کاربر — پیشنهاد را در یک جمله بده و منتظرِ پاسخش بمان";
      var tid = +(a && a.tid); if (!A.TM[tid]) return "شمارهٔ تکنیک (۱ تا ۴۵) لازم است";
      var subj = a.pid && A.liveRec && A.liveRec(a.pid) ? PR.subj("live", a.pid) : a.knot && S.get(a.knot) ? PR.subj("knot", a.knot) : a["case"] && S.get(a["case"]) ? PR.subj("case", a["case"]) :
        a.topic ? (S.get(a.topic) && S.get(a.topic).type === "topic" ? PR.subj("topic", a.topic) : PR.subj("topic", "", clip(a.topic, 80))) : (A.liveSessionPid && A.liveSessionPid(s)) ? PR.subj("live", A.liveSessionPid(s)) : PR.subj("free", "", clip(a.title || "", 80));
      var had = PR.find(tid, subj), c = PR.start(tid, subj, { src: "assistant" });
      if (!c) return "پرونده ساخته نشد";
      if (s) { s.prcs = s.prcs || []; if (s.prcs.indexOf(c.id) < 0) s.prcs.push(c.id); }
      AS._prcNote = (had ? "پروندهٔ باز ادامه یافت: " : "پروندهٔ تمرین باز شد: ") + fa(tid) + " · " + A.TM[tid].fa + " — " + PR.subjLabel(c.subj) + (c.due ? " · موعدِ بعد " + fdate(c.due) : "");
      return "";
    };
    AS.promptHooks = AS.promptHooks || [];
    AS.promptHooks.push(function (s, msg) {
      var recent = [String(msg || "")].concat(((s && s.msgs) || []).filter(function (m) { return m.role === "user"; }).slice(-3).map(function (m) { return m.text; })).join(" ");
      /* فقط وقتی حرفِ کاربر دربارهٔ تمرین/برگشتن است — پرامپت سقف دارد و سشن‌های دیگر نباید این بلوک را بگیرند */
      if (!/(تمرین|چرخه|بازیابی|یادم می‌ره|یادم میره|فراموش می‌کنم|آزمون بذار|فاینمن|تثبیت|برگه سفید)/.test(recent)) return "";
      var open = PR.cases().filter(function (c) { return c.state !== "closed"; }).slice(0, 6);
      return "# پرونده‌های تمرینِ باز (یک پرونده برای هر تکنیک × موضوع)\n" + (open.length ? open.map(function (c) { return "- " + c.id + ": تکنیکِ " + c.tid + " «" + A.TM[c.tid].fa + "» روی «" + PR.subjTitle(c.subj) + "» (" + c.subj.k + (c.subj.id ? ":" + c.subj.id : "") + ") · " + ST_FA[c.state] + (c.due ? " · موعد " + c.due : ""); }).join("\n") + "\n" : "") +
        "- برای شروع یا ادامهٔ پرونده فقط پس از «آری» یا خواستهٔ صریحِ خودش: {\"do\":\"start_practice\",\"tid\":41,\"topic\":\"عنوانِ موضوع\"} (یا \"pid\" مسئلهٔ زنده، \"knot\"، \"case\"). پرونده‌ی باز همان ادامه می‌یابد؛ زمان‌بندی را خودِ پرونده از متنِ تکنیک می‌گیرد — عدد نساز.";
    });
  }

  /* ---------- ثبت برای دستیار و منو ---------- */
  A.VIEW_META = A.VIEW_META || {};
  A.VIEW_META.practice = { j: "ws", what: "پرونده‌های تمرینِ باز: برای هر تکنیک × موضوع یک پرونده با جلسه‌های تاریخ‌دار، نتیجهٔ سنجیده، موعدِ بعد از متنِ خودِ تکنیک، «تثبیت شد» با شاهد و وارسیِ ماندگاری؛ و فهرست‌های جاری (فرض‌ها، مدل‌ها، اشتباهات، ابهام‌ها، پارتو، سیگنال/نویز).", why: "تا تکنیک‌هایی که با برگشتن کار می‌کنند واقعاً برگردند و بدانی کِی مهارت یا باور تثبیت شد — نه با شمردنِ تلاش‌های یک روز." };
  A.SUB_VIEWS = A.SUB_VIEWS || {}; A.SUB_VIEWS.practice = "lib";
})(window.APP);
