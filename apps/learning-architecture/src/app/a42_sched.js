/* ===== «⏱ زمان‌بندِ واحد» — A.SCHED (a42_sched.js — تورِ پولیا دورِ ۱۹c، LT1 + LT8؛ ممیزیِ طولی ۲۰۲۶-۱۰-۱۷) =====
   مشکل: حدودِ دوازده زمان‌بندِ جدا (کارت، چرخهٔ ۱-۳-۷، گرم‌کردنِ دوره، حرکت‌ها، ورزش و آزمایشِ گره، مسئلهٔ هم‌ساختار، بازبینیِ پروندهٔ معرفتی،
   گامِ مسئلهٔ زنده، 🌱، پیش‌بینی و زنجیرهٔ نگرانی، موعدها، تور) هر کدام نسخهٔ خودشان از [۱، ۳، ۷، ۲۱، ۶۰] را داشتند و هیچ تکنیکی نمی‌توانست
   یکی‌شان را قرض بگیرد؛ T42 در کد «۱ و ۳» بود در حالی که متنش «۱ روز، ۶ روز» می‌گوید.
   این ماژول تنها جای «چه چیزی، کی، چرا» است:
   • A.SCHED.POLICY — سیاستِ فاصله‌ها **از متنِ خودِ تکنیک** (فیلدِ dose با نقلِ عینی در src؛ آزمونِ دور ۱۹c وجودِ نقل را در متن می‌سنجد).
     نردبانِ عمومیِ سامانه (A.SCHED.LADDER) فقط برای بخش‌هایی است که متنِ تکنیکی ندارند و هرگز روی تکنیکی با متنِ خودش اعمال نمی‌شود.
   • A.SCHED.register(source|entry) / unregister(key) — هر چیزِ تاریخ‌دار این‌جا ثبت می‌شود: یک «منبع» ({kind, list(day), today, remind, types})
     یا یک قلمِ تکی ({kind, id, due, …}). زمان‌بندهای پیشین (حذف نشدند) با منبع‌های همین فایل ثبت شده‌اند و سطرِ «امروز» ِ خودشان را
     همچنان خودشان می‌سازند (رفتار عیناً همان)؛ منبعِ تازه (پروندهٔ تمرین، پیش‌بینی، زنجیره) سطرش را از A.SCHED.todayLines می‌گیرد.
   • A.SCHED.due(day) / all(day) / next(record) / plan(policy, rec, day) / remind(entry) — و یادآورِ میزبان (A.HOST.remind) برای منبع‌های remind.
   • A.SCHED.captureRemind() — جایگزینِ آزمونی برای A.HOST.remind: بارِ یادآورها ضبط می‌شود و هیچ پیامی واقعاً فرستاده نمی‌شود.
   قراردادِ کامل برای ماژول‌های دیگر (پروندهٔ تمرین a41، کارنامه a29): HANDBOOK «زمان‌بندِ واحد» و یادداشتِ دست‌به‌دستِ دورِ ۱۹c. */
(function (A) {
  var S = A.S, fa = A.fa;
  if (A.SCHED && A.SCHED._one) return;   // یک بار (بارِ دوباره ثبت‌گاه را پاک می‌کرد)
  var SC = A.SCHED = { _one: true };

  /* ---------- ۱) نردبانِ عمومی: یک نسخه؛ کپی‌های پیشین قرنطینه ---------- */
  SC.LADDER = Object.freeze([1, 3, 7, 21, 60]);
  SC.users = {};
  SC.ladder = function (who) { if (who) SC.users[who] = 1; return SC.LADDER.slice(); };
  /* کپی‌های پیشینِ همان آرایه (حذف نشدند؛ جای‌شان با A.SCHED.ladder عوض شد) — docs/overhaul/REMOVAL_CANDIDATES.md */
  A.SCHED_QUARANTINE = [
    { where: "a11_course.js · var GAPS (گرم‌کردنِ دوره)", was: [1, 3, 7, 21, 60], now: "A.SCHED.ladder('a11_course')" },
    { where: "a13_epi_course.js · var GAPS (گرم‌کردنِ دورهٔ معرفت)", was: [1, 3, 7, 21, 60], now: "A.SCHED.ladder('a13_epi_course')" },
    { where: "a17_kpractice.js · var LADDER (ورزشِ گره)", was: [1, 3, 7, 21, 60], now: "A.SCHED.ladder('a17_kpractice') (پشتیبانِ بارِ تنها در node vm: همان آرایه)" },
    { where: "a19_moves.js · nextIv() پشتیبانِ L", was: [1, 3, 7, 21, 60], now: "A.SCHED.ladder('a19_moves')" },
    { where: "a27_tour.js · STALL_LADDER و دو LAD (پشتیبان)", was: [1, 3, 7, 21, 60], now: "A.SCHED.ladder('a27_tour')" },
    { where: "a36_solve.js · var LADDER (🌱 و مسئله)", was: [1, 3, 7, 21, 60], now: "A.SCHED.ladder('a36_solve')" },
    { where: "a4_views2.js · A.start137 [[1,«روز ۱»],[3,…],[7,…]]", was: [1, 3, 7], now: "A.SCHED.POLICY.T41.tracks[0].steps" },
    { where: "a1_base.js · A.srsGrade «n===2 ? 3»", was: [1, 3], now: "A.SCHED.POLICY.T42.steps = [1, 6] (متنِ T42)" }
  ];

  /* ---------- ۲) سیاست‌ها از متنِ خودِ تکنیک (src = نقلِ عینی از dose) ----------
     گونهٔ مسیرها (track):
       steps:[…]   روزهای پس از شروع (یا از ادامه پس از مکث)؛ هر نشستِ روزی تازه یک پله جلو می‌برد (نشستِ هم‌روز یک بار)
       every:n     تکرار هر n روز از آخرین نشستِ همان مسیر (یا از شروع)
       window:[a,b] یک بازگشت در پنجرهٔ a تا b روز؛ پیش از a دیده نمی‌شود؛ «عقب‌افتاده» فقط پس از b؛ یک یادآور در آغازِ پنجره
       after:n,of  n روز پس از هر نشستِ مسیرِ of (مثلاً بازآزمایی پس از آزمونک)
       cycles:n,of یک بازبینی پس از هر n نشستِ کامل‌شدهٔ مسیرِ of
       count:{n,of} وقتی شمارِ داوری‌شده‌ها (rec.counts[of]) به n برسد — نه با تقویم
       user        موعدی که خودِ کاربر گذاشته (rec.due یا rec.dues[track])  */
  SC.POLICY = {
    T42: { tid: 42, kind: "sm2", steps: [1, 6], ef: 2.5, src: "۱ روز، ۶ روز، سپس حدود ×۲٫۵" },
    T41: { tid: 41, src: "چرخه روز ۱، ۳ و ۷؛ برگه سفید هفتگی", tracks: [{ id: "cycle", steps: [1, 3, 7], label: "بازیابیِ برگهٔ سفید (چرخهٔ ۱، ۳، ۷)" }, { id: "weekly", every: 7, label: "برگهٔ سفیدِ هفتگی" }] },
    T31: { tid: 31, src: "بازگشت ۲ تا ۷ روز بعد برای سنجش نتیجه‌ی راهبرد تازه", tracks: [{ id: "result", window: [2, 7], label: "آیا راهبردِ تازه جواب داد؟" }] },
    T3: { tid: 3, src: "بازبینی ماهانه با داده واقعی", tracks: [{ id: "monthly", every: 30, label: "بازبینیِ ماهانه با داده واقعی" }] },
    T23: { tid: 23, src: "یک بازآزمایی یک روز بعد؛ هر ۳ تا ۵ چرخه یک بازبینی روند", tracks: [{ id: "retest", after: 1, of: "quiz", label: "بازآزمایی (یک روز پس از آزمونک)" }, { id: "trend", cycles: 3, of: "retest", label: "مرورِ روند (هر ۳ تا ۵ چرخه)" }] },
    T28: { tid: 28, src: "بازنویسی نهایی را ۱ روز و ۱ هفته بعد بدون منبع دوباره بنویس", tracks: [{ id: "rewrite", steps: [1, 7], label: "بازنویسیِ بی‌منبع (۱ روز و ۱ هفته بعد)" }] },
    T26: { tid: 26, src: "بازکشیدن آن از حافظه یک روز بعد", tracks: [{ id: "redraw", steps: [1], label: "بازکشیدنِ نمودار از حافظه" }] },
    T4: { tid: 4, src: "بازسازی از حافظه دوباره پس از ۳ و ۷ روز", tracks: [{ id: "redo", steps: [3, 7], label: "بازسازیِ نقشه از حافظه" }] },
    T22: { tid: 22, src: "هفته‌ای یک باور «مقدس» خود را به این آزمون بسپارید", tracks: [{ id: "weekly", every: 7, label: "باورِ «مقدس» ِ این هفته" }, { id: "obs", user: true, label: "مشاهدهٔ موعددارِ همین پرونده" }] },
    T21: { tid: 21, src: "اجرا از یک روز تا چهار هفته؛ هم‌زمان حداکثر دو آزمون باز", cap: 2, tracks: [{ id: "test", user: true, min: 1, max: 28, label: "نتیجهٔ آزمون" }] },
    T9: { tid: 9, src: "یک ژورنال تخمین‌ها که ماهانه با نتایج واقعی مقایسه می‌شود", tracks: [{ id: "monthly", every: 30, label: "مقایسهٔ ماهانهٔ تخمین‌ها با نتیجهٔ واقعی" }] },
    T24: { tid: 24, src: "بازبینی ماهانه وقتی دست‌کم ۵۰ مورد داوری‌شده دارید", tracks: [{ id: "review", count: { n: 50, of: "resolved" }, every: 30, label: "مرورِ ماهانهٔ کالیبراسیون (۵۰ موردِ داوری‌شده)" }] },
    T14: { tid: 14, src: "هر ماه یک بار برای برنامه یادگیری خودتان", tracks: [{ id: "monthly", every: 30, label: "قاب‌بندیِ دوبارهٔ برنامهٔ یادگیریِ خودت" }] },
    T37: { tid: 37, src: "بازبینی هفتگی فهرست دوره‌ها", tracks: [{ id: "weekly", every: 7, label: "بازبینیِ هفتگیِ فهرستِ دوره‌ها" }] }
  };
  /* سیاستِ تکنیکی که متنش فاصله‌ای نمی‌گوید ⇒ null (هرگز نردبانِ عمومی جایش نمی‌نشیند) */
  SC.policy = function (k) { if (k == null) return null; if (typeof k === "object") return k; var p = SC.POLICY[/^T/.test(String(k)) ? k : "T" + k] || SC.POLICY[k]; return p || null; };
  /* شاهدِ سیاست: نقلِ src باید در متنِ همان تکنیک باشد (dose یا هر متنِ دیگرش) — آزمون از همین می‌خواند */
  SC.policyEvidence = function () {
    return Object.keys(SC.POLICY).map(function (k) {
      var p = SC.POLICY[k], t = A.TM && A.TM[p.tid], txt = t ? JSON.stringify(t) : "";
      return { key: k, tid: p.tid, src: p.src, inText: !!(t && txt.indexOf(p.src) >= 0) };
    });
  };

  /* ---------- ۳) برنامه از سیاست: موعدِ هر مسیرِ یک پرونده در روزِ day ----------
     rec (قرارداد): { id, tid?, start:"YYYY-MM-DD", state:"open|stabilising|stable|paused|closed", resumed?:"YYYY-MM-DD",
                      sessions:[{ d:"YYYY-MM-DD", track?:"…" }], due?, dues?:{track:due}, counts?:{resolved:n}, countAt?:{resolved:"YYYY-MM-DD"} } */
  function days(list, base, track, single) {
    var seen = {}, out = [];
    (list || []).forEach(function (s) {
      if (!s || !s.d) return; var d = String(s.d).slice(0, 10);
      if (track && !(s.track === track || (single && !s.track))) return;
      if (base && d <= base) return;
      if (!seen[d]) { seen[d] = 1; out.push(d); }
    });
    return out.sort();
  }
  SC.plan = function (pol, rec, day) {
    pol = SC.policy(pol); day = day || A.today();
    if (!pol || !rec || !pol.tracks) return [];
    var st = rec.state || "open";
    if (st === "paused" || st === "closed" || st === "stable" || rec.paused) return [];
    var base = String(rec.resumed || rec.start || A.localDay(rec.created) || day).slice(0, 10), single = pol.tracks.length === 1, out = [];
    pol.tracks.forEach(function (tr) {
      var e = null, mine = days(rec.sessions, base, tr.id, single);
      if (tr.steps) { var k = mine.length; if (k < tr.steps.length) e = { due: A.addDays(base, tr.steps[k]), step: k + 1, of: tr.steps.length }; }
      else if (tr.window) { if (!mine.length) e = { due: A.addDays(base, tr.window[0]), until: A.addDays(base, tr.window[1]) }; }
      else if (tr.after) {
        var q = days(rec.sessions, "", tr.of).filter(function (d) { return d >= base; }), lq = q[q.length - 1];
        if (lq && !days(rec.sessions, lq, tr.id).length) e = { due: A.addDays(lq, tr.after) };
      } else if (tr.cycles) {
        var n = days(rec.sessions, base, tr.of).length, done = mine.length, need = tr.cycles * (done + 1);
        if (n >= need) { var ofd = days(rec.sessions, base, tr.of); e = { due: ofd[need - 1] }; }
      } else if (tr.count) {
        var c = ((rec.counts || {})[tr.count.of]) || 0, last = mine[mine.length - 1];
        if (c >= tr.count.n && (!last || A.daysBetween(last, day) >= (tr.every || 30))) e = { due: last ? A.addDays(last, tr.every || 30) : (((rec.countAt || {})[tr.count.of]) || day) };
      } else if (tr.every) { var lst = mine[mine.length - 1] || base; e = { due: A.addDays(lst, tr.every) }; }
      else if (tr.user) { var ud = (rec.dues || {})[tr.id] || (single ? rec.due : null); if (ud && !days(rec.sessions, "", tr.id).some(function (d) { return d >= ud; })) e = { due: String(ud).slice(0, 10) }; }
      if (e && e.due) { e.track = tr.id; e.label = tr.label; out.push(e); }
    });
    return out;
  };

  /* منبعِ سیاست‌محور (برای پروندهٔ تمرین و هر فهرستِ دوره‌ای): رکوردها ⇒ SC.plan ⇒ قلم‌ها؛ سطرِ «امروز» و یادآور خودکار.
     o = { kind, label, types:[recType], records:fn()→[rec], policyOf?:fn(rec)→"T41"|policy, txt?:fn(rec,p), sub?:fn(rec,p), go?:fn(rec,p)→fn, remind?:bool } */
  SC.planSource = function (o) {
    return SC.register({ kind: o.kind, label: o.label || o.kind, today: o.today !== false, remind: o.remind !== false, types: o.types || [o.kind],
      list: function (day) {
        var out = [];
        (o.records() || []).forEach(function (r) {
          var pk = o.policyOf ? o.policyOf(r) : r.tid, pol = SC.policy(pk);
          SC.plan(pol, r, day).forEach(function (p) {
            var t = o.txt ? o.txt(r, p) : p.label;
            out.push({ id: r.id, track: p.track, due: p.due, until: p.until, tid: pol && pol.tid, policy: pol && pol.tid ? "T" + pol.tid : null, txt: t, label: p.label,
              sub: o.sub ? o.sub(r, p) : null, go: o.go ? o.go(r, p) : null, body: t, title: p.label });
          });
        });
        return out;
      } });
  };

  /* ---------- ۴) ثبت‌گاه ---------- */
  var SRC = {}, ONE = {};
  function norm(e) {
    if (!e) return null;
    e.kind = e.kind || "misc"; e.key = e.key || (e.kind + ":" + e.id + (e.track ? ":" + e.track : ""));
    if (e.due) e.due = String(e.due).slice(0, 10);
    return e;
  }
  SC.register = function (x) {
    if (!x || !x.kind) return null;
    if (typeof x.list === "function") { SRC[x.kind] = x; return x.kind; }
    var e = norm(x); ONE[e.key] = e; return e.key;
  };
  /* k: کلید («kind:id[:track]»)، نوع (منبع)، یا شیءِ {kind, id, track?} (قراردادِ پروندهٔ تمرین) */
  SC.unregister = function (k) {
    if (k && typeof k === "object") k = k.kind + (k.id != null ? ":" + k.id : "") + (k.track ? ":" + k.track : "");
    if (!k) return false; var hit = false;
    if (ONE[k]) { delete ONE[k]; hit = true; }
    Object.keys(ONE).forEach(function (q) { if (q.indexOf(k + ":") === 0) { delete ONE[q]; hit = true; } });
    if (SRC[k]) { delete SRC[k]; hit = true; }
    return hit;
  };
  SC.sources = function () { return Object.keys(SRC).map(function (k) { var s = SRC[k]; return { kind: k, label: s.label || k, today: !!s.today, remind: !!s.remind, legacy: !!s.legacy }; }); };
  /* همهٔ قلم‌ها (موعدِ گذشته و آینده)، هر کلید یک بار؛ قلمِ dupOf وقتی صاحبِ اصلی هست بیرون می‌ماند (مثلاً پیش‌بینیِ گامِ مسئلهٔ زنده) */
  SC.all = function (day, o) {
    day = day || A.today(); o = o || {};
    var out = [], seen = {};
    Object.keys(SRC).forEach(function (k) {
      if (o.kind && o.kind !== k) return; var s = SRC[k], L = [];
      try { L = s.list(day) || []; } catch (e) { console.warn("SCHED " + k, e); L = []; }
      L.forEach(function (e) { e.kind = e.kind || k; norm(e); e.src = k; e.today = !!s.today; if (!seen[e.key]) { seen[e.key] = 1; out.push(e); } });
    });
    /* نوعی که منبعِ رکوردمحور دارد (مثلاً practice) از همان رکوردها خوانده می‌شود؛ قلمِ تکیِ درون‌حافظهٔ آن نوع کهنه می‌شود (رکوردِ پاک‌شده، داده‌ی تازه) ⇒ نادیده */
    Object.keys(ONE).forEach(function (q) { var e = ONE[q]; if (o.kind && o.kind !== e.kind) return; if (SRC[e.kind]) return; if (!seen[e.key]) { seen[e.key] = 1; if (e.today == null) e.today = true; out.push(e); } });
    return out.filter(function (e) { return !(e.dupOf && seen[e.dupOf]) && !e.done && e.open !== false; });
  };
  SC.due = function (day, o) {
    day = day || A.today();
    return SC.all(day, o).filter(function (e) { return e.due && e.due <= day; }).sort(function (a, b) { return a.due.localeCompare(b.due); });
  };
  /* موعدِ بعدیِ یک رکورد (کارت: موعدِ خودش؛ بازنشسته ⇒ null؛ بقیه: نزدیک‌ترین قلمِ همان شناسه) */
  SC.next = function (rec) {
    if (!rec) return null;
    if (rec.type === "card") return rec.susp ? null : (rec.due || null);
    var ds = SC.all(A.today()).filter(function (e) { return e.id === rec.id; }).map(function (e) { return e.due; }).filter(Boolean).sort();
    return ds[0] || null;
  };
  /* سقفِ هم‌زمانیِ متنِ تکنیک (T21: «حداکثر دو آزمون باز») — آزمون‌های باز از همهٔ مسیرها: پروندهٔ تکنیک + آزمایشِ گره */
  SC.openFor = function (tid) {
    var pol = SC.policy(tid), es = SC.all(A.today()).filter(function (e) { return e.tid === +tid || e.policy === "T" + tid || (+tid === 21 && e.kind === "kexp"); });
    return { cap: pol && pol.cap || null, open: es.length, keys: es.map(function (e) { return e.key; }), over: !!(pol && pol.cap && es.length > pol.cap) };
  };
  SC.overdueFrom = function (e) { return e.until || e.due; };
  SC.dueText = function (e, day) {
    day = day || A.today(); var od = SC.overdueFrom(e);
    if (day > od) return "عقب‌افتاده از " + A.fdate(od) + " (" + fa(A.daysBetween(od, day)) + " روز)";
    if (e.until && e.until !== e.due) return "پنجره: " + A.fdate(e.due) + " تا " + A.fdate(e.until);
    return e.due === day ? "موعد: امروز" : "موعد: " + A.fdate(e.due);
  };
  /* سطرهای «امروز» برای منبع‌هایی که سطرشان را از زمان‌بندِ واحد می‌گیرند (today:true). منبع می‌تواند خودش line(entries, day) بدهد. */
  SC.todayLines = function (day) {
    day = day || A.today(); var items = [], by = {};
    SC.due(day).forEach(function (e) { if (!e.today) return; (by[e.src || e.kind] = by[e.src || e.kind] || []).push(e); });
    Object.keys(by).forEach(function (k) {
      var s = SRC[k], es = by[k];
      if (s && typeof s.line === "function") { try { [].concat(s.line(es, day) || []).forEach(function (x) { if (x) items.push(x); }); } catch (err) { console.warn(err); } return; }
      es.forEach(function (e) {
        var go = e.go || (Array.isArray(e.open) && e.open[0] ? function () { A.go(e.open[0], e.open[1] == null ? null : e.open[1], e.open[2] == null ? null : e.open[2]); } : function () { });
        var it = { k: e.lk || "p", txt: e.txt || e.label || e.key, sub: (e.sub ? e.sub + " · " : "") + SC.dueText(e, day), go: go, acts: e.acts, sched: e.key, kind: e.kind, id: e.id };
        if (e.kind === "practice") it.prc = e.id;   // همان نشانی که سطرِ پشتیبانِ a41 داشت
        items.push(it);
      });
    });
    return items;
  };

  /* ---------- ۵) یادآور: یک کلید، یک موعد (نه یکی برای هر روزِ ازدست‌رفته) ---------- */
  function tzOf() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) { return "UTC"; } }
  function hourOf() { var n = (((S.settings() || {}).knots || {}).notify) || {}; return n.hour == null ? 9 : n.hour; }
  var SENT = {};
  try { SENT = JSON.parse(localStorage.getItem("lla.schedSent") || "{}") || {}; } catch (e) { SENT = {}; }
  function saveSent() { try { localStorage.setItem("lla.schedSent", JSON.stringify(SENT)); } catch (e) { } }
  function host() { return A.HOST && typeof A.HOST.remind === "function"; }
  SC.payload = function (e) {
    return { key: e.remindKey || e.key, due_date: e.due, tz: tzOf(), hour: hourOf(), title: "معماری یادگیری — " + (e.title || "موعد"),
      body: e.body || e.txt || e.label || "", link: e.link || "" };
  };
  SC.remind = function (e) {
    if (!host() || !e || !e.due) return null;
    var p = SC.payload(e), sig = p.due_date + "|" + p.body;
    if (SENT[p.key] === sig) return null; SENT[p.key] = sig; saveSent();
    try { Promise.resolve(A.HOST.remind(p)).catch(function () { }); } catch (err) { }
    return p;
  };
  SC.unremind = function (key) {
    if (!SENT[key]) return false; delete SENT[key]; saveSent();
    if (A.HOST && typeof A.HOST.unremind === "function") { try { Promise.resolve(A.HOST.unremind(key)).catch(function () { }); } catch (err) { } }
    return true;
  };
  /* همگام‌سازیِ همهٔ منبع‌های remind: قلمِ باز ⇒ یادآور در موعدِ خودش (پنجره ⇒ آغازِ پنجره)؛ قلمِ بسته/پاک ⇒ لغو */
  SC.syncReminders = function () {
    if (!host() || (S.mode === "host" && !S.loaded)) return 0;
    var live = {}, n = 0, kinds = Object.keys(SRC).filter(function (k) { return SRC[k].remind; });
    kinds.forEach(function (k) { SC.all(A.today(), { kind: k }).forEach(function (e) { if (!e.due) return; live[e.remindKey || e.key] = 1; if (SC.remind(e)) n++; }); });
    Object.keys(SENT).forEach(function (key) { var kind = key.split(":")[0]; if (kinds.indexOf(kind) >= 0 && !live[key]) { SC.unremind(key); n++; } });
    return n;
  };
  var syncT = null;
  function syncSoon() { clearTimeout(syncT); syncT = setTimeout(function () { syncT = null; try { SC.syncReminders(); } catch (e) { console.warn(e); } }, 400); }
  S.listeners.push(function (r) {
    if (!r) return;
    var t = r.type, hit = !t || Object.keys(SRC).some(function (k) { var s = SRC[k]; return s.remind && (s.types || [k]).indexOf(t) >= 0; });
    if (hit) syncSoon();
  });
  /* جایگزینِ آزمونی: هر بارِ یادآور ضبط می‌شود و هیچ پیامی بیرون نمی‌رود (تورگردان: ?dev=1&remind=capture) */
  SC.captured = [];
  SC.captureRemind = function () {
    A.HOST = A.HOST || {};
    /* بی میزبانِ واقعی، داده همان دم بار شده است (حالتِ محلی): بی این، نماها «منتظرِ بارِ میزبان» می‌مانند (a21) */
    if (S.mode !== "host") S.loaded = true;
    if (!A.HOST._schedCapture) {
      A.HOST.remind = function (p) { SC.captured.push(JSON.parse(JSON.stringify(p || {}))); return Promise.resolve({ ok: true, captured: true }); };
      A.HOST.unremind = function (k) { SC.captured.push({ unremind: k }); return Promise.resolve({ ok: true, captured: true }); };
      A.HOST._schedCapture = true;
    }
    return SC.captured;
  };
  /* از نشانی: پس از بارِ داده (S.init) نصب می‌شود — پیش از آن A.HOST ِ ساختگی صفحه را به «حالتِ میزبان» می‌برد */
  try {
    if (A.clock && A.clock.dev && /(?:^|[?&])remind=capture(?:&|$)/.test((window.location && window.location.search) || "")) {
      var rawInit = S.init; S.init = function (cb) { return rawInit.call(this, function () { SC.captureRemind(); return cb && cb.apply(this, arguments); }); };
    }
  } catch (e) { }

  /* ---------- ۶) منبع‌ها: زمان‌بندهای پیشین (پیچیده، نه حذف) ----------
     legacy:true ⇒ سطرِ «امروز» و یادآورش را هنوز خودِ ماژول می‌سازد (رفتار همان)؛ این‌جا فقط ثبت می‌شوند تا یک فهرست، یک «بعدی» و یک کلیدِ یادآور باشد. */
  function q(x, n) { x = String(x == null ? "" : x).replace(/\s+/g, " ").trim(); return x.length > n ? x.slice(0, n - 1) + "…" : x; }
  function reg(kind, label, list, more) { var s = { kind: kind, label: label, list: list, legacy: true }; for (var k in (more || {})) s[k] = more[k]; SC.register(s); }
  reg("card", "کارتِ مرور (T42، SM-2)", function () {
    return S.all("card", function (c) { return !c.susp && c.due && (!A.cardInToday || A.cardInToday(c)); }).map(function (c) { return { id: c.id, due: c.due, label: q(c.q, 60), remindKey: "cards:review", policy: "T42" }; });
  });
  reg("sched", "برگهٔ سفید ۱-۳-۷ (P3)", function () {
    return S.all("sched", function (s) { return !s.done && !s.hold && s.due; }).map(function (s) { return { id: s.id, due: s.due, label: "برگه سفید " + (s.label || ""), policy: "T41" }; });
  });
  /* دورِ ۲۰ (RO7، B·D16): روالِ آماده «شروع‌شده» است وقتی کاربر یک بار آن را باز/اجرا کرد — نشانی ماندگار در تنظیمات (پاک‌شدنِ اجرا آن را برنمی‌گرداند) */
  var ROUT = ["P2", "P4", "P5", "P9"];
  A.routineStarted = function (pid) {
    if (S.all("pr", function (y) { return y.pid === pid; }).length) return true;
    try { return !!(((S.settings() || {}).routinesStarted || {})[pid]); } catch (e) { return false; }
  };
  S.listeners.push(function (r, op) {
    if (op && op !== "put") return;
    if (!r || r.type !== "pr" || ROUT.indexOf(r.pid) < 0 || r.sample) return;
    try { var st = S.settings() || {}; st.routinesStarted = st.routinesStarted || {}; if (!st.routinesStarted[r.pid]) { st.routinesStarted[r.pid] = A.today(); S.saveSettings(st); } } catch (e) { }
  });
  reg("proto", "روال‌های دوره‌ای (P2 روزانه، P4/P5 هفتگی، P9 ماهانه)", function (day) {
    return [["P2", 1], ["P4", 7], ["P5", 7], ["P9", 30]].map(function (x) {
      var r = S.all("pr", function (y) { return y.pid === x[0] && y.status === "done"; })[0], l = r ? A.localDay(r.created) : null;
      if (!l && !A.routineStarted(x[0])) return null;   // دورِ ۲۰: روالِ آماده‌ای که هرگز شروع نشده موعدی ندارد
      return { id: x[0], due: l ? A.addDays(l, x[1]) : day, label: A.pn ? A.pn(x[0]) : x[0] };
    }).filter(Boolean);
  });
  reg("course", "گرم‌کردنِ دوره (نردبانِ سامانه)", function () {
    var c = S.get("course"); if (!c || !c.topic || !c.done) return [];
    return Object.keys(c.done).map(function (id) { var w = (c.warm || {})[id] || { due: A.addDays(c.done[id], 1) }; return { id: "T" + id, due: w.due, label: "گرم‌کردنِ درسِ " + fa(id) }; });
  });
  reg("ecourse", "گرم‌کردنِ دورهٔ معرفت (نردبانِ سامانه)", function () {
    var out = []; S.all("epi_course").forEach(function (c) { Object.keys(c.done || {}).forEach(function (id) { var w = (c.warm || {})[id] || { due: A.addDays(c.done[id], 1) }; out.push({ id: c.id + ":" + id, due: w.due, label: "گرم‌کردنِ «" + id + "»" }); }); });
    return out;
  });
  reg("move", "حرکت‌های حلِ مسئله (نردبانِ سامانه)", function () {
    var by = ((S.get("moves_prog") || {}).by) || {};
    return Object.keys(by).filter(function (k) { return by[k] && by[k].due; }).map(function (k) { return { id: k, due: by[k].due, label: k }; });
  });
  reg("sim", "گام‌های شبیه‌ساز", function () {
    var out = []; S.all("simsp").forEach(function (r) { Object.keys(r.by || {}).forEach(function (sid) { var b = r.by[sid]; if (b && b.due) out.push({ id: r.pid + ":" + sid, due: b.due, label: "گامِ شبیه‌ساز" }); }); });
    return out;
  });
  reg("kitem", "ورزشِ گره", function () {
    var ks = {}; S.all("knot").forEach(function (k) { ks[k.id] = k; });
    return S.all("kitem", function (it) { return ks[it.knot] && it.due && (!A.kservable || A.kservable(it)); }).map(function (it) { return { id: it.id, due: it.due, label: "ورزشِ «" + q(ks[it.knot].name, 40) + "»", remindKey: "knot:" + it.knot }; });
  });
  reg("kexp", "آزمایشِ واقعیِ گره", function () {
    var ks = {}; S.all("knot").forEach(function (k) { ks[k.id] = k; });
    return S.all("kexp", function (x) { return ks[x.knot] && x.status === "planned" && x.due; }).map(function (x) {
      return { id: x.id, due: x.due, label: "آزمایشِ «" + q(ks[x.knot].name, 40) + "»", reason: q(x.plan || x.what || x.pred || x.text || "", 80), knot: x.knot, remindKey: "knot:" + x.knot };
    });
  });
  reg("pbitem", "مسئلهٔ هم‌ساختار", function () {
    return S.all("pbitem", function (it) { return it.due && (!A.pbServable || A.pbServable(it)); }).map(function (it) { return { id: it.id, due: it.due, label: "مسئلهٔ هم‌ساختار" }; });
  });
  reg("case", "بازبینیِ پروندهٔ معرفتی (revdate)", function () {
    return S.all("case", function (cs) { return cs.st && cs.st.st_final && cs.st.st_final.data && cs.st.st_final.data.revdate; }).map(function (cs) {
      var d = cs.st.st_final.data, rd = A.epiRevDate ? A.epiRevDate(d.revdate) : d.revdate, open = (d.final || []).some(function (r) { return r.c && !(cs.outcome || {})[r.c]; });
      return open && rd ? { id: cs.id, due: rd, label: "بازبینیِ پروندهٔ «" + q(cs.title || cs.claim || "", 40) + "»" } : null;
    }).filter(Boolean);
  });
  reg("live", "گامِ مسئلهٔ زنده (موعدِ امروز)", function () {
    if (!A.liveDue) return []; var D = A.liveDue(), out = [];
    D.steps.forEach(function (x) { out.push({ id: x.r.p.id, track: "step", due: x.st.due, label: q(x.st.text, 60) }); });
    D.incub.forEach(function (r) { out.push({ id: r.p.id, track: "incub", due: A.today(), label: "کنار گذاشته — چه به ذهنت رسید؟" }); });
    return out;
  });
  reg("will", "🌱 گامِ اراده", function () {
    return A.willDue ? A.willDue().map(function (x) { return { id: x.kind + ":" + x.id, track: x.what, due: A.today(), label: q(x.txt, 60) }; }) : [];
  });
  reg("deadline", "⏰ موعدها", function () {
    return S.all("deadline", function (x) { return !x.done && x.date; }).map(function (r) { return { id: r.id, due: r.date, label: q(r.what, 60), remindKey: "deadline:" + r.id }; });
  });

  /* ---------- ۷) منبع‌های «امروز»: پیش‌بینی (🎯) و زنجیرهٔ نگرانی (⛓) — سطر و یادآور از همین‌جا ----------
     پیش‌بینیِ گامِ مسئلهٔ زنده (x.live) dupOf ِ همان گام است و سطرِ جدا نمی‌گیرد (یک سطر برای یک کار). */
  SC.register({ kind: "fcast", label: "🎯 پیش‌بینیِ زندگی", today: true, remind: true, types: ["fcast"],
    list: function () {
      return S.all("fcast", function (x) { return x.due && !x.outcome; }).map(function (x) {
        return { id: x.id, due: x.due, txt: x.q, label: x.q, title: "پیش‌بینی", body: "🎯 «" + q(x.q, 80) + "» به موعد رسید — شد یا نشد؟", link: "?tab=fcast",
          dupOf: x.live && x.live.pid ? "live:" + x.live.pid + ":step" : null, today: !(x.live && x.live.pid) };
      }).filter(function (e) { return e.today; });
    },
    line: function (es, day) {
      var od = es.map(function (e) { return e.due; }).sort()[0];
      return { k: "p", txt: "🎯 " + fa(es.length) + " پیش‌بینی به موعد رسیده — شد یا نشد؟", sub: es.slice(0, 2).map(function (e) { return e.txt; }).join(" · ") + " · " + SC.dueText({ due: od }, day),
        go: function () { A.go("fcast"); }, sched: es.map(function (e) { return e.key; }) };
    } });
  SC.register({ kind: "wchain", label: "⛓ زنجیرهٔ نگرانی", today: true, remind: true, types: ["wchain"],
    list: function () {
      return S.all("wchain", function (c) { return c.due && !c.outcome; }).map(function (c) {
        return { id: c.id, due: c.due, txt: c.title, feel: c.feel, title: "زنجیرهٔ نگرانی", body: "⛓ «" + q(c.title, 80) + "» — چه شد؟ نتیجهٔ واقعی را ثبت کن", link: "?tab=chain&a=" + c.id };
      });
    },
    line: function (es, day) {
      return es.map(function (e) { return { k: "p", txt: "⛓ نتیجهٔ واقعیِ «" + e.txt + "» را ثبت کن", sub: "حسِ اولت " + (e.feel == null ? "—" : fa(e.feel) + "٪") + " بود · " + SC.dueText(e, day), go: function () { A.go("chain", e.id); }, sched: e.key }; });
    } });

  /* ---------- ۷ب) پل به پروندهٔ تمرین (a41، سهمِ «practice»): پرونده‌ها با A.SCHED.register({kind:"practice", …}) ثبت می‌شوند، ولی آن ثبت
     درون‌حافظه است و پس از بارگذاریِ دوباره فقط با ذخیرهٔ بعدیِ پرونده برمی‌گردد. این منبع همان قلم‌ها را از خودِ رکوردها می‌خواند (A.PR.entries)
     تا «امروز» و یادآور پس از بارگذاری هم کامل باشند؛ کلیدِ یکسان (practice:<id>) ⇒ یک قلم، هرگز دو. */
  SC.register({ kind: "practice", label: "🧪 پروندهٔ تمرین (a41)", today: true, remind: true, types: ["practice"],
    list: function () {
      if (!(A.PR && typeof A.PR.entries === "function" && typeof A.PR.all === "function")) return [];
      var out = [];
      A.PR.all().forEach(function (c) { try { (A.PR.entries(c) || []).forEach(function (e) { if (e && e.due) out.push(Object.assign({}, e, { body: e.txt, title: "پروندهٔ تمرین" })); }); } catch (err) { } });
      return out;
    } });

  /* ---------- ۸) ساعتِ آزمایشی: نشانِ دیدنی (LT8) ---------- */
  function flag() {
    try {
      var on = A.clock && A.clock.off, el = document.getElementById("llaClockFlag");
      if (!on) { if (el) el.remove(); return; }
      if (!el) { el = A.h("div", { id: "llaClockFlag", class: "clock-flag", role: "status", dir: "rtl" }); A.layer().appendChild(el); }
      el.textContent = "⏱ ساعتِ آزمایشی: " + A.fdate(A.today()) + " (" + (A.clock.off > 0 ? "+" : "") + fa(A.clock.off) + " روز) — فقط برای آزمون";
    } catch (e) { }
  }
  SC.flag = flag;
  /* این فایل درست پس از a1_base بار می‌شود (تا A.SCHED.ladder پیش از همه باشد)؛ A.render را پس از بارِ همهٔ ماژول‌ها می‌پیچد:
     نشانِ ساعتِ آزمایشی + همگام‌سازیِ یادآورِ منبع‌های remind (حداکثر هر ۱۰ دقیقه؛ پیش از بارِ دادهٔ میزبان هرگز — وگرنه همه لغو می‌شد) */
  var lastSync = 0;
  setTimeout(function () {
    var rawRender = A.render; if (typeof rawRender !== "function" || rawRender._sched) return;
    A.render = function () {
      var r = rawRender.apply(this, arguments); flag();
      try { if (!(S.mode === "host" && !S.loaded) && A.nowMs() - lastSync > 600e3) { lastSync = A.nowMs(); syncSoon(); } } catch (e) { }
      return r;
    };
    A.render._sched = true; flag();
  }, 0);
})(APP);
