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
    function extGap() { var g = lastGap || steps[steps.length - 1] || 1; return ladderNext(g); }
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
    else if (pol.shape === "steps" && anchor != null) { R.due = stepDue(); R.until = add(R.due, stepW()); R.reason = i < steps.length ? stepReason(c, steps[i], i) : extReason(c, lastGap || steps[steps.length - 1], cnt, steps.length, pol); }
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
    var open = PR.linkedFcasts(c).filter(function (x) { return !x.outcome; }), txt = (a.what || "") + " " + (a.quote || ""), out = ok ? "شد" : "نشد";
    var hit = open.filter(function (x) { return PR.sameAct(x.q, txt); }), due = open.filter(function (x) { return x.due && x.due <= today(); });
    /* دورِ ۲۲ (P6، A22-15): چند 🎯 ِ هم‌واژه («گلدانِ ۲۴ ساعت…»، «گلدانِ ۸ ساعت…») ⇒ با عددهای خودِ او: درصدی که گفت همان اطمینانِ
       پیش‌بینی است («اون پیش‌بینیِ ۶۰ درصدیم»)، و عددهای دیگرِ حرفش («۲۴ ساعت») در متنِ همان پیش‌بینی؛ هنوز چندتا ⇒ همان «کدام؟» */
    var said = (a.quote || "") + " " + (a.what || "");
    if (hit.length > 1) hit = PR.fcNarrow(hit, said, pc);
    /* هیچ هم‌واژه‌ای («گلدون» ≠ «گلدان»، «اون که ۶۰٪ گفته بودم») ⇒ باز با عددهای خودش: اطمینانِ همان پیش‌بینی، یا عددی از متنش */
    if (!hit.length) hit = PR.fcMatch(open, said, pc);
    /* همان 🎯 که پیش‌تر (در صفحه یا همین امروز) داوری شده ⇒ همان رکورد، نه 🎯 ِ تازه (bank R22 #146) */
    if (!hit.length && pc != null) { var J = PR.linkedFcasts(c).filter(function (x) { return x.outcome === "شد" || x.outcome === "نشد"; }), jh = J.filter(function (x) { return PR.sameAct(x.q, txt); }); jh = jh.length > 1 ? PR.fcNarrow(jh, said, pc) : jh.length ? jh : PR.fcMatch(J, said, pc);
      if (jh.length === 1 && jh[0].p === pc) { var jf = jh[0]; if (jf.outcome !== out) { jf.outcome = out; jf.outcomeAt = nowISO(); jf.judgedBy = { kind: "chat", sess: s && s.id, quote: clip(a.quote, 200), d: d }; S.put(jf); } return { fc: jf, note: "🎯 «" + clip(jf.q, 50) + "» (" + fa(jf.p) + "٪) ⇐ " + out + " — همان پیش‌بینی (یک رکورد)" }; } }
    var fc = hit.length === 1 ? hit[0] : !hit.length && due.length === 1 && pc == null ? due[0] : null;
    if (!fc && hit.length > 1) return { err: "چند پیش‌بینیِ باز با این گزارش جور است («" + hit.slice(0, 3).map(function (x) { return clip(x.q, 40) + (x.p != null ? " — " + fa(x.p) + "٪" : ""); }).join("»، «") + "») — کدام؟" };
    if (fc) { fc.outcome = out; fc.outcomeAt = nowISO(); fc.judgedBy = { kind: "chat", sess: s && s.id, quote: clip(a.quote, 200), d: d }; S.put(fc); return { fc: fc, note: "🎯 «" + clip(fc.q, 50) + "» (" + fa(fc.p) + "٪) ⇐ " + out }; }
    if (pc != null) {
      var q = clip(a.what || a.quote, 200), dup = PR.dupFcast(q);
      if (dup && dup.outcome) return null;
      fc = dup || { id: A.uid("fc"), type: "fcast", q: q, p: pc, due: d, dim: "s_decision", tid: 24, prc: c.id, src: { chat: s && s.id, quote: clip(a.quote, 200) } };
      fc.outcome = out; fc.outcomeAt = nowISO(); fc.judgedBy = { kind: "chat", sess: s && s.id, quote: clip(a.quote, 200), d: d }; S.put(fc); return { fc: fc, note: "🎯 تازه «" + clip(fc.q, 50) + "» (" + fa(pc) + "٪) ⇐ " + out };
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
      if (of[k0] == null || of[k0] === nU) { of[k0] = nU; out.push("- بازنگری: اگر درسی گفت که با برگشتن در روزها تثبیت می‌شود، یک بار در یک جمله پیشنهاد بده («می‌خواهی تمرینش کنیم؟») — تا «آری» نگفته باز نکن؛ «نه» ⇒ دوباره پیشنهاد نده."); }
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
      if (!T.last || !PR.quoteIn(a.quote, T.last.text)) return "در فهرست نگه داشته نشد: نقلِ حرفش («" + clip(a.quote || "", 60) + "») در پیامِ همین نوبت نیست — فقط آنچه خودش گفت نگه داشته می‌شود";
      /* نگه داشتن فقط با خواستهٔ خودش یا «آری» به پیشنهاد (همان سنجشِ رضایتِ start_practice) — «شاید…، نمی‌دونم» یا «فرض کن…» ِ ریاضی نگه داشتن نیست */
      var cv = PR.consentOk(a, s); if (!cv.ok) return "در فهرست نگه داشته نشد: " + cv.why;
      var said = String(T.last.text || ""), t = textOf(a); if (!t || !(PR.quoteIn(t, said) || PR.quoteIn(t, a.quote))) t = String(a.quote).trim();
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
          items.unshift({ k: "warn", dl: r.id, txt: "⏰ «" + clip(r.what, 60) + "» — موعدش (" + fdate(r.date) + ") گذشت؛ تحویل دادی؟", sub: fa(gap(r.date, today())) + " روز از موعد گذشته",
            go: function () { A.toast("تحویل دادی؟ یکی از دو دکمهٔ کنارش را بزن."); },
            acts: [{ t: "بله، تحویل دادم", cls: "dopt dl-done", fn: function () { try { AS.DO.deadline_done({ what: r.id }); } catch (e) { r.done = true; r.doneAt = nowISO(); S.put(r); } A.toast("«" + clip(r.what, 40) + "» تحویل‌شده علامت خورد."); A.render(); } },
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
          (c.items || []).forEach(function (x) { itemEvents(c, x, "").forEach(function (e) { acts.push({ id: "list:" + c.id + ":" + x.id + ":" + e.kind + ":" + e.d + ":" + acts.length, at: e.at, src: "list", kind: "list", rid: c.id, go: ["practice", c.id], ok: e.kind === "list:close" && (x.closed || {}).kind === "refuted" ? false : null, fa: e.title + " — " + e.lines.join(" · "), day: e.d }); }); });
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

  /* ---------- ثبت برای دستیار و منو ---------- */
  A.VIEW_META = A.VIEW_META || {};
  /* دورِ ۲۲ (P8، B·D20): نامِ نما همان سرِ صفحه است («🧪 پرونده‌های تمرینِ باز»)، نه «۴۵ تکنیک ›» ِ پدرش */
  A.VIEW_META.practice = { fa: "🧪 پرونده‌های تمرینِ باز", j: "ws", what: "پرونده‌های تمرینِ باز: برای هر تکنیک × موضوع یک پرونده با جلسه‌های تاریخ‌دار، نتیجهٔ سنجیده، موعدِ بعد از متنِ خودِ تکنیک، «تثبیت شد» با شاهد و وارسیِ ماندگاری؛ و فهرست‌های جاری (فرض‌ها، مدل‌ها، اشتباهات، ابهام‌ها، پارتو، سیگنال/نویز).", why: "تا تکنیک‌هایی که با برگشتن کار می‌کنند واقعاً برگردند و بدانی کِی مهارت یا باور تثبیت شد — نه با شمردنِ تلاش‌های یک روز." };
  A.SUB_VIEWS = A.SUB_VIEWS || {}; A.SUB_VIEWS.practice = "lib";
})(window.APP);
