/* ===== «🧭 تور»: یک مسئلهٔ چندوجهی ⇒ چند بخش، به ترتیب، بی فراموشی، با تمرین و پیگیری (مالک ۲۰۲۶-۱۰-۱۴) =====
   خواستهٔ مالک: «اگر موضوعی که به دستیار می‌گویم به چند قسمت مربوط باشد — بخشی حلِ مسئلهٔ بزرگ، بخشی خطای معرفتی، بخشی گرهِ ذهنی، بخشی
   حوزه‌ای که هنوز در سامانه نیست — دستیار اولویت‌بندی و ترتیب‌بندی کند، مرحله‌به‌مرحله و بی‌فراموشی مرا از همهٔ ایستگاه‌ها عبور دهد،
   برای روزها و هفته‌های آینده تمرین برنامه‌ریزی و پیگیری کند، شبیه‌سازی‌ها ساخته شود؛ و برگه‌ای را که برای حوزهٔ نبوده ثبت کرده پیگیری کند:
   اگر ناقص ساخته شد، زیرِ همان برگه با دلیل راهنمایی کند تا درست شود، و بعد مرا از همان وجه هم عبور دهد».
   اصل: هیچ زیرساختِ موازی ساخته نمی‌شود. بخش‌ها خودشان تمرینِ فاصله‌دار دارند (کارت، ورزشِ گره، مسئلهٔ هم‌ساختار، تاریخِ بازبینیِ پرونده،
   چرخهٔ ۱-۳-۷) و همه در «امروز» می‌آیند. تور (۱) ترتیب و وضعِ هر وجه را **ماندگار** نگه می‌دارد (حافظهٔ مدل نیست)، (۲) پیشرفت را از **خودِ
   رکوردها** می‌سنجد، (۳) رکوردهای ساخته‌شده را به وجهِ خودش وصل می‌کند و تمرین‌های آینده‌شان را نشان می‌دهد، (۴) در «امروز» و با یادآور
   پیگیری می‌کند، (۵) برگهٔ حوزهٔ نبوده را تا درست‌شدن دنبال می‌کند و بعد همان وجه را باز می‌کند. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, AS = A.ASSIST;
  if (!AS) return;
  var clip = AS.clip, store = AS.store;

  var KIND = {
    knot: { fa: "گرهِ ذهنی", ic: "🪢", view: "kcases" },
    claim: { fa: "سنجشِ ادعا/باور", ic: "⚖️", view: "e_home" },
    problem: { fa: "مسئلهٔ بزرگ و شبیه‌ساز", ic: "🧩", view: "e_prob" },
    learn: { fa: "فهمیدنِ عمیق", ic: "🌱", view: "topics" },
    territory: { fa: "حوزه‌ای که هنوز نیست", ic: "🗺", view: "e_bt", sub: "terr" },
    area: { fa: "حوزهٔ قلمرو (تصمیم، ارتباط، خودشناسی، …)", ic: "🧭", view: "sterr" },
    prereq: { fa: "دانشِ پیش‌نیاز", ic: "🧩", view: "prereq" },
    other: { fa: "گامِ دیگر", ic: "•", view: "" }
  };
  var ROOT_TYPE = { knot: ["kcase"], claim: ["case"], problem: ["eprob"], learn: ["topic"], territory: ["topic", "case"], area: ["wchain", "fcast", "kexp", "ex", "topic", "case", "value", "meaning"], prereq: ["prereq"] };
  var ST_FA = { todo: "مانده", now: "در جریان", done: "پایه برپا شد", blocked: "منتظرِ ساختِ حوزه", skipped: "کنار گذاشته شد" };
  function nowIso() { return new Date().toISOString(); }
  function get(id) { return id ? S.get(id) : null; }

  /* ---------- رکوردهای هر وجه (ریشه + فرزندان، از پیوندهای خودِ رکوردها) ---------- */
  function refsOf(f) { return (f.refs || []).map(function (r) { return get(r.id); }).filter(Boolean); }
  function children(f) {
    var roots = refsOf(f), out = { kcase: [], knot: [], kitem: [], kexp: [], "case": [], eprob: [], pbitem: [], topic: [], card: [], sched: [], ex: [], wchain: [], fcast: [], value: [], meaning: [], prereq: [] };
    roots.forEach(function (r) { if (out[r.type]) out[r.type].push(r); });
    out.kexp = out.kexp.slice(); out.ex = out.ex.slice();
    out.kcase.forEach(function (kc) {
      (kc.knots || []).forEach(function (id) { var k = get(id); if (k && out.knot.indexOf(k) < 0) out.knot.push(k); });
      var ec = kc.premise && kc.premise.ecase && get(kc.premise.ecase); if (ec && out["case"].indexOf(ec) < 0) out["case"].push(ec);
    });
    var kid = out.knot.map(function (k) { return k.id; });
    if (kid.length) {
      out.kitem = S.all("kitem", function (x) { return kid.indexOf(x.knot) >= 0 && !x.bad; });
      out.kexp = S.all("kexp", function (x) { return kid.indexOf(x.knot) >= 0; });
    }
    var pids = out.eprob.map(function (r) { return r.p && r.p.id; }).filter(Boolean);
    if (pids.length) out.pbitem = S.all("pbitem", function (x) { return pids.indexOf(x.pid) >= 0; });
    // موضوع‌هایی که از نقشهٔ پیش‌نیازها ساخته شد ⇒ همان وجه (سفر و مرورشان پیگیری می‌شود)
    out.prereq.forEach(function (p) { (p.items || []).forEach(function (x) { var tp = x.topic && get(x.topic); if (tp && out.topic.indexOf(tp) < 0) out.topic.push(tp); }); });
    var tids = out.topic.map(function (t) { return t.id; });
    if (tids.length) {
      out.card = S.all("card", function (c) { return tids.indexOf(c.topic) >= 0 && !c.susp; });
      out.sched = S.all("sched", function (x) { return tids.indexOf(x.topic) >= 0; });
      out.ex = S.all("ex", function (x) { return tids.indexOf(x.topic) >= 0 && !x.sample; });
    }
    return out;
  }
  /* ---------- «واقعاً حل شد؟» — آزمون، نه حرفِ خودِ کاربر (مالک ۲۰۲۶-۱۰-۱۴) ----------
     ورزیدگی با معیارِ خودِ هر بخش (گره: A.kmastery؛ هم‌ساختار: همان شکلِ معیارِ گره) و **ماندگاری**: ۳۰ و ۹۰ روز پس از ورزیدگی، دست‌کم
     یک پاسخِ درستِ تازه (سرد) و هیچ بازگشتی. عددهای ۳۰/۹۰ و «۳ درستِ پیاپی در ۲ نوبت با ≥ ۳ روز فاصله» پیش‌فرض‌اند؛ تغییرشان تصمیمِ مالک است (HANDBOOK §۱۰). */
  var HOLD = [30, 90];
  function plusDays(iso, n) { return A.addDays(String(iso).slice(0, 10), n); }
  function heldAfter(since, log, n) {   // پس از since+n روز، دست‌کم یک پاسخِ درست
    if (!since) return false; var from = plusDays(since, n); if (A.today() < from) return false;
    return (log || []).some(function (e) { return e.ok && String(e.at || e.d || "").slice(0, 10) >= from; });
  }
  function knotSolved(k) { return k && k.status === "practised" && k.solvedAt; }
  function knotHeld(k, n) { return knotSolved(k) && !(k.returnedAt && k.returnedAt > k.solvedAt) && heldAfter(k.solvedAt, k.log, n); }
  /* هم‌ساختارهای یک مسئله: نخستین لحظه‌ای که ۳ پاسخِ درستِ پیاپی در ۲ نوبتِ جدا با ≥ ۳ روز فاصله رسید */
  function pbSolvedAt(items) {
    var log = []; items.forEach(function (it) { (it.hist || []).forEach(function (e) { log.push(e); }); });
    log.sort(function (a, b) { return String(a.at).localeCompare(String(b.at)); });
    var run = [];
    for (var i = 0; i < log.length; i++) {
      if (!log[i].ok) { run = []; continue; }
      run.push(log[i]); var days = run.map(function (e) { return String(e.at).slice(0, 10); });
      var uniq = days.filter(function (d, j) { return days.indexOf(d) === j; });
      if (run.length >= 3 && uniq.length >= 2 && A.daysBetween(uniq[0], uniq[uniq.length - 1]) >= 3) return { at: log[i].at, log: log };
    }
    return { at: "", log: log };
  }
  AS.tourHold = HOLD;

  /* ---------- نشانه‌های پیشرفت: از خودِ داده، نه از حرفِ مدل ---------- */
  function milestones(f) {
    var c = children(f), m = [];
    function add(t, ok, core, mine) { m.push({ t: t, ok: !!ok, core: core !== false, mine: !!mine }); }
    if (f.kind === "knot") {
      var kc = c.kcase[0];
      add("موقعیت ثبت شد (گره‌گشا)", kc);
      // موقعیتی که خودت بستی («بسته — احتمالاً گره نبود») وجه را می‌بندد؛ نشانه‌های گره دیگر بدهکار نیستند (تورِ پولیا، دستهٔ ۱)
      if (kc && kc.status === "closed" && !c.knot.length) { add("موقعیت را خودت بستی (احتمالاً گره نبود)", true, true, true); return m; }
      add("پله‌ها تا ریشه و «ریشه را تأیید کن» — تصمیمِ خودت", kc && kc.root && kc.root.confirmed, true, true);
      add("گرهِ ذهنی ساخته شد", c.knot.length);
      add("نمونه‌های ورزشِ فاصله‌دار ساخته شد", c.kitem.filter(function (x) { return A.kservable ? A.kservable(x) : true; }).length);
      add("آزمایشِ واقعی برنامه‌ریزی شد", c.kexp.length, false);
      var ks = c.knot;
      // بازگشت (موقعیتِ تازه پس از ورزیدگی) پایه را دوباره باز می‌کند تا گره دوباره ورزیده شود (کارزارِ سوم v04: پس از بازگشت «✓ پایه برپا شد» آمد)
      var back = ks.filter(function (k) { return k.status === "returned" || (k.returnedAt && !(k.solvedAt && k.solvedAt > k.returnedAt)); });
      if (back.length) add("پس از بازگشت: گره دوباره ورزیده شود", false);
      add("ورزیده شد — با معیارِ خودِ گره‌گشا", ks.length && ks.every(knotSolved), false);
      // تاریخِ هر وارسیِ ماندگاری دیده شود (کارزارِ آزمون sc17: تاریخِ ۹۰ روزه هیچ‌جا نبود)
      var sv = ks.length && ks.every(knotSolved) ? ks.map(function (k) { return String(k.solvedAt).slice(0, 10); }).sort().pop() : "";
      HOLD.forEach(function (n) { add("ماندگاری: " + fa(n) + " روز پس از ورزیدگی، بی‌بازگشت و هنوز درست" + (sv ? " (از " + (A.fdate ? A.fdate(plusDays(sv, n)) : plusDays(sv, n)) + ")" : ""), ks.length && ks.every(function (k) { return knotHeld(k, n); }), false); });
    } else if (f.kind === "claim") {
      var cs = c["case"][0], fin = cs && cs.st && cs.st.st_final;
      add("پروندهٔ سنجش در کارخانه ساخته شد", cs);
      // «گذرانده شد» یعنی همهٔ ایستگاه‌های مسیرِ همین پرونده، نه فقط حکمِ نهایی (کارزارِ آزمون c08: سه ایستگاهِ میانی جا ماند و ✓ خورد)
      var rt = cs && A.routeOf ? A.routeOf(cs).filter(function (o) { return o.inRoute; }).map(function (o) { return o.s.id; }) : [];
      var stDone = cs ? Object.keys(cs.st || {}).filter(function (k) { return (cs.st[k] || {}).done; }) : [];
      var left = rt.filter(function (id) { return stDone.indexOf(id) < 0; });
      // پرونده‌ای که با حکمِ نهایی بسته شد (مسیرِ کوتاه‌شدهٔ خودِ کاربر) وجه را می‌بندد (تورِ پولیا s32: پرونده بسته، وجه باز)
      var csClosed = cs && cs.status === "closed" && fin && fin.done;
      add("ایستگاه‌ها گذرانده شد" + (cs ? " (" + fa(rt.length ? rt.length - left.length : stDone.length) + (rt.length ? " از " + fa(rt.length) : "") + (csClosed && left.length ? "؛ پرونده را با حکمِ نهایی بستی" : "") + ")" : ""), fin && fin.done && (!left.length || csClosed));
      add("تاریخِ بازبینی گذاشته شد (پیگیریِ نتیجهٔ واقعی)", fin && fin.data && fin.data.revdate);
      var rows = ((fin && fin.data && fin.data.final) || []).filter(function (r) { return r.c; });
      add("نتیجهٔ واقعی در بازبینی ثبت شد (درست بود یا نه)", cs && rows.length && rows.every(function (r) { return (cs.outcome || {})[r.c]; }), false);
    } else if (f.kind === "problem" && c.eprob[0] && c.eprob[0].live) {
      liveMs(c.eprob[0], add);
    } else if (f.kind === "problem") {
      var pr = c.eprob[0];
      add("مسئله وارد و تجزیه شد", pr);
      add("تأییدِ مسئله پس از وارسی — تصمیمِ خودت", pr && pr.status === "approved", true, true);
      // فهم پیش از نخستین حرکت، و بازنگری پس از حل — هر دو از رکوردِ خودِ مسئله (AS.probPhaseOf)، نه از حرفِ مدل
      var pph = pr && pr.p && AS.probPhaseOf ? AS.probPhaseOf(pr.p.id) : {};
      add("فهمِ مسئله: مجهول، داده و شرط را به زبانِ خودت نوشتی", pph.und, false, true);
      // «تمرین شد» یعنی دست‌کم یک سطحِ کامل (همهٔ گام‌ها)، نه یک گام (کارزارِ آزمون sc04: پس از ۱ از ۶ گام تیک می‌خورد)
      var pg = pr && pr.p && S.get("eprog_" + pr.p.id), nst = pr && pr.p && (pr.p.stages || []).length;
      add("شبیه‌ساز تمرین شد (یک سطحِ کامل)", pg && nst && Object.keys(pg.lv || {}).some(function (l) { return Object.keys(pg.lv[l] || {}).length >= nst; }), false);
      add("بازنگری پس از حل: نتیجه یا روش را وارسی کردی (یک پرسشِ بازنگری، با کارتِ مرور)", pph.back, false, true);
      // فقط هم‌ساختارهای وارسی‌شده (همان که زبانهٔ هم‌ساختار نشان می‌دهد) — نه پیش‌نویس‌های ردشده
      var pbv = c.pbitem.filter(function (x) { return A.pbServable ? A.pbServable(x) : x.ver && x.ver.ok && !x.bad; });
      add("مسئله‌های هم‌ساختارِ فاصله‌دار ساخته شد" + (c.pbitem.length > pbv.length ? " (" + fa(pbv.length) + " وارسی‌شده از " + fa(c.pbitem.length) + ")" : ""), pbv.length);
      var ps = pbSolvedAt(pbv);
      add("هم‌ساختارها ورزیده شد: ۳ درستِ پیاپی در ۲ نوبت با ≥ ۳ روز فاصله", ps.at, false);
      HOLD.forEach(function (n) { add("ماندگاری: " + fa(n) + " روز پس از ورزیدگی هنوز درست", ps.at && heldAfter(ps.at, ps.log, n), false); });
    } else if (f.kind === "learn") {
      var tp = c.topic[0], jp = tp && A.journeyProgress ? A.journeyProgress(tp) : null;
      add("موضوع ساخته شد", tp);
      add("سفرِ گام‌به‌گام تا آخر" + (jp ? " (" + fa(jp.done) + " از " + fa(jp.all) + ")" : ""), jp && jp.all && jp.done >= jp.all, false);
      add("کارت‌های مرور یا چرخهٔ ۱-۳-۷ زمان‌بندی شد", c.card.length || c.sched.length);
      add("چرخهٔ ۱-۳-۷ تا آخر انجام شد", c.sched.length && c.sched.every(function (x) { return x.done; }), false);
    } else if (f.kind === "area") {
      // زنجیرهٔ نگرانیِ بی حلقهٔ نوشته «کاربست» نیست (کارزارِ سوم v04: «پایه برپا شد» با زنجیرهٔ خالی)
      var wcF = c.wchain.filter(function (x) { return (x.links || []).some(function (l) { return l && String(l.text || "").trim(); }); });
      var ar = A.SYST && f.area ? (A.SYST.byId ? A.SYST.byId(f.area) : A.SYST.find(f.area)) : null, used = wcF.length + c.fcast.length + c.kexp.length + c.ex.length + c.topic.length + c["case"].length + c.value.length + c.meaning.length;
      add("کاربستی از ابزارهای حوزهٔ «" + (ar ? ar.a.fa : (f.area || "قلمرو")) + "» ساخته و وصل شد", used);
      add("پیگیری یا تمرینِ آینده زمان‌بندی شد", practice(f).length || c.ex.some(function (x) { return x.status === "done"; }));
      add("نتیجهٔ واقعی ثبت شد (رخ داد/نداد، شد/نشد، آزمایشِ کامل یا کاربرگِ تمام‌شده)", c.meaning.length || c.value.some(function (v) { return (v.vs || []).some(function (x) { return (x.rule || "").trim(); }); }) || c.wchain.some(function (x) { return x.outcome; }) || c.fcast.some(function (x) { return x.outcome; }) || c.kexp.some(function (x) { return x.status === "done" || x.doneAt; }) || c.ex.some(function (x) { return x.status === "done"; }), false);
    } else if (f.kind === "prereq") {
      // «نفهمیدم» ⇒ دقیقاً کدام دانشِ مقدماتی نبود (مالک ۲۰۲۶-۱۰-۱۴) — از خودِ نقشه، سنجشِ کاربر و موضوع‌های ساخته‌شده
      var pq = c.prereq[0], pk = pq && A.prereqState ? A.prereqState(pq) : null;
      add("نقشهٔ پیش‌نیازها ساخته شد" + (pk ? " (" + fa(pk.n) + " مفهوم از " + fa(pk.sci) + " علم)" : ""), pk && pk.n);
      add("هر پیش‌نیاز را خودت سنجیدی (پرسشِ تشخیصی)", pk && pk.n && pk.rated === pk.n, true, true);
      add("برای هر پیش‌نیازِ نبوده یک موضوعِ یادگیری ساخته شد", pk && pk.n && pk.rated === pk.n && pk.topics.length === pk.miss.length);
      add("مرورِ فاصله‌دار (کارت یا چرخهٔ ۱-۳-۷) برای هر موضوعِ پیش‌نیاز", pk && pk.topics.length && pk.topics.every(function (x) { return S.all("card", function (c) { return c.topic === x.topic; }).length || S.all("sched", function (c) { return c.topic === x.topic; }).length; }), false);
      var jt = c.topic.map(function (tp) { return A.journeyProgress ? A.journeyProgress(tp) : null; }).filter(Boolean);
      add("سفرِ موضوع‌های پیش‌نیاز تا آخر", jt.length && jt.every(function (j) { return j.all && j.done >= j.all; }), false);
      // «حل‌شدن» هدفِ این وجه است، نه دنباله‌اش (کارزارِ آزمونِ دوم c04: وجه پیش از بازگشت به مسئله «انجام شد» شد و تور جلو رفت)
      add("بازگشت به خودِ مسئله: دوباره امتحان شد و حل شد", pq && pq.back === "حل شد", true, true);
    } else if (f.kind === "territory") {
      var b = f.blocked || {};
      add("برگهٔ ساختِ حوزه ثبت شد" + (b.number ? " (#" + fa(b.number) + ")" : ""), b.number);
      add("روتینِ مسئول ساخت و دستیار درستیِ آن را وارسی کرد", b.verified);
      // تورِ خودِ حوزهٔ تازه (خواستهٔ مالک: «بعد مرا از همان وجه هم عبور دهد، با برنامه‌ریزی و پیگیری»): دست‌کم یک موضوع/پرونده در آن، با تمرینِ زمان‌بندی‌شده
      add("گشت در حوزهٔ تازه و یک تمرینِ ماندگار از آن (موضوع یا پروندهٔ وصل‌شده با تمرینِ زمان‌بندی‌شده)", b.verified && (c.topic.length || c["case"].length) && (c.sched.length || c.card.length || c.ex.length || c["case"].some(function (cs) { var d = cs.st && cs.st.st_final && cs.st.st_final.data; return d && d.revdate; })));
    }
    // گام‌های نوشتهٔ مدل فقط برای وجه‌هایی که نشانهٔ داده‌محور ندارند (وگرنه تکرارِ همان نشانه‌ها می‌شد — شبیه‌سازیِ ۲۰۲۶-۱۰-۱۴)
    /* وجهِ «گامِ دیگر» (تورِ پولیا s26): حرفِ مدل هرگز ✓ نمی‌زند — هر گام فقط با تأییدِ خودِ کاربر (دکمهٔ «data-own» در کشوی تور) یا شاهدِ رکورد؛
       گامی که دستیار «انجام شد» گفته فقط «ادعای دستیار — تأییدِ تو لازم» است */
    if (f.kind === "other") {
      var sts = f.steps || [];
      sts.forEach(function (st) { add(st.t + (st.by !== "user" && (st.claimed || st.done) ? " (دستیار می‌گوید انجام شد — تأییدِ تو لازم)" : ""), st.done && st.by === "user", true, true); });
      if (!sts.length) add("این وجه را خودت انجام‌شده دانستی (تأییدِ خودت در کشوی تور)", f.userDone, true, true);
    }
    return m;
  }
  /* نشانه‌های «🔭 مسئلهٔ حل‌نشدهٔ خودم» (تورِ پولیا s21–s29): همان مراحلِ خودِ تونلِ زنده، نه نشانه‌های مسئلهٔ حل‌شده (تأیید، شبیه‌ساز، هم‌ساختار) */
  function liveParts(pr) {
    var pid = pr.p.id, pg = S.get("eprog_" + pid) || {}, so = pg.solve || {}, L = so.live || {}, u = so.u && so.u[1] && so.u[1].done ? so.u[1] : null;
    var steps = L.steps || [], real = steps.filter(function (st) { return st.closed && st.out && !st.out.auto && st.out.done && st.out.done !== "no"; });
    return { pid: pid, pg: pg, so: so, L: L, u: u, steps: steps, real: real, open: steps.filter(function (st) { return !st.closed; }).pop() || null };
  }
  function liveMs(pr, add) {
    var x = liveParts(pr), heur = (x.L.plan && x.L.plan.heur) || [];
    add("🔭 مسئلهٔ حل‌نشده ثبت شد", true);
    add("فهمِ مسئله: مجهول، داده‌ها و شرط به زبانِ خودت (کارتِ فهم)", x.u && !x.L.reU, true, true);
    add("طرح با دست‌کم یک ابزارِ طرح (مسئلهٔ مرتبط، از آخر به عقب، مسئلهٔ کمکی یا حرکت با دلیل)", x.L.plan && x.L.plan.at && heur.length, true, true);
    /* وجهِ عینی (ریاضی/برهان/معما) پیش‌بینی و نتیجهٔ واقعی ندارد — نشانه‌اش وارسیِ گام با برهان است (تورِ پولیا دورِ ۲، rerunC: وجهِ عینی گیر می‌کرد).
       ادغامِ G1/G2: داور فقط از بخشِ مسئله (A.liveKind) و گامِ برهانی فقط از دادهٔ خودِ آن (step.out.kind === "proof")؛ بستن از A.liveClosure
       (ناتمام ≠ حل شد؛ بازنگریِ ساختهٔ دستیار بازنگریِ کاربر نیست — R5/R7) */
    var obj = false; try { obj = (A.liveKind && A.liveKind(x.pid) === "objective") || x.real.some(function (st) { return st.out && st.out.kind === "proof"; }); } catch (e) { }
    var cl = null; try { cl = A.liveClosure ? A.liveClosure(x.pid) : null; } catch (e) { }
    var solved = cl ? cl.state === "solved" : x.L.state === "solved", ended = cl ? cl.state === "solved" || cl.state === "abandoned" : x.L.state === "solved" || x.L.state === "abandoned";
    if (obj) {
      add("یک گامِ اجرا نوشته شد (با «روشن می‌بینی؟»)", x.real.length || solved, true, true);
      add("گامی را ثابت کردی (برهان، نه فقط شهود)", x.real.some(function (st) { return st.out && st.out.kind === "proof" && !st.intuitive; }), false, true);
    } else {
      add("یک گامِ واقعی انجام شد و نتیجه‌اش ثبت شد (با پیش‌بینیِ پیش از آن)", x.real.length || solved, true, true);
      add("نتیجهٔ گام را با پیش‌بینی‌ات سنجیدی (داوریِ خودت)", x.real.some(function (st) { return st.out.match; }), false, true);
    }
    add("سرانجام: حل شد یا آگاهانه کنار رفت" + (cl && cl.state === "incomplete" ? " (هنوز نه: " + clip(cl.label, 80) + ")" : ""), ended, false, true);
    var b1 = x.so.b && x.so.b[1];
    add("بازنگری پس از حل (درس ⇒ کارتِ مرور)", b1 && b1.done && !(b1.from === "chat" && !b1.own), false, true);
  }
  AS.tourLiveParts = liveParts;
  /* رکوردِ ریشهٔ وجه بسته شد؟ (پرونده با حکمِ نهایی، موقعیتِ بسته، مسئلهٔ زندهٔ بسته‌شده) ⇒ وجه بسته می‌شود — از داده، نه از حرفِ مدل */
  function closedRoot(f) {
    var c = children(f);
    if (f.kind === "claim") { var cs = c["case"][0]; if (cs && cs.status === "closed") return "پروندهٔ «" + clip(cs.title || "", 40) + "» با حکمِ نهایی بسته شد"; }
    if (f.kind === "knot") { var kc = c.kcase[0]; if (kc && kc.status === "closed" && !c.knot.length) return "موقعیتِ «" + clip(kc.title || "", 40) + "» را بستی"; }
    if (f.kind === "problem") { var ep = c.eprob[0]; if (ep && ep.live && A.livePhase && A.livePhase(ep.p.id) === "done") return "مسئلهٔ «" + clip(ep.p.title || "", 40) + "» بسته شد (بازنگری ثبت شد)"; }
    return "";
  }
  AS.tourClosedRoot = closedRoot;
  /* «تا تسلطِ کامل» (خواستهٔ مالک): «انجام شد» یعنی پایه و تمرینِ فاصله‌دارِ این وجه برپاست و تور به وجهِ بعد می‌رود؛
     نشانه‌های پیگیری (سفر تا آخر، آزمایشِ واقعی، شبیه‌ساز…) باز می‌مانند و تور تا ✓ شدنِ همه در «امروز» و یادآور دنبالشان می‌کند */
  function followups(f) { return f.status === "skipped" ? [] : milestones(f).filter(function (m) { return !m.ok; }); }
  function mastered(t) { return t.facets.every(function (f) { return !followups(f).length; }); }
  AS.tourFollowups = followups;
  function coreDone(f) { var m = milestones(f).filter(function (x) { return x.core; }); return m.length > 0 && m.every(function (x) { return x.ok; }); }
  /* تمرین‌های آینده‌ای که همین بخش‌ها زمان‌بندی کرده‌اند */
  function practice(f) {
    var c = children(f), out = [], t = A.today();
    function first(arr, fld) { var d = arr.map(function (x) { return x[fld]; }).filter(Boolean).sort(); return d[0] || ""; }
    if (c.kitem.length) out.push({ t: fa(c.kitem.length) + " ورزشِ گره", due: first(c.kitem, "due"), view: "kpractice" });
    var ke = c.kexp.filter(function (x) { return x.status === "planned"; }); if (ke.length) out.push({ t: "آزمایشِ واقعی", due: first(ke, "due"), view: "kpractice", arg: ke[0].knot, sub: "exp" });
    var pbs = c.pbitem.filter(function (x) { return A.pbServable ? A.pbServable(x) : true; });
    if (pbs.length) out.push({ t: fa(pbs.length) + " مسئلهٔ هم‌ساختار", due: first(pbs, "due"), view: "e_prob", arg: (pbs[0] || {}).pid, sub: "similar" });
    if (c.card.length) out.push({ t: fa(c.card.length) + " کارتِ مرور", due: first(c.card, "due"), view: "review" });
    // مسئلهٔ زنده: موعدِ وارسیِ گامِ واقعیِ باز و نردبانِ مرورِ خودِ تونل (rev) — زمان‌بندِ موازی نه
    c.eprob.filter(function (r) { return r.live && r.p; }).forEach(function (r) {
      var x = liveParts(r);
      if (x.open && x.open.due) out.push({ t: "🔭 نتیجهٔ گامِ واقعیِ «" + clip(x.open.text, 30) + "»", due: x.open.due, view: "lprob", arg: x.pid, sub: "exec" });
      var rv = x.so.rev || {}, rd = Object.keys(rv).map(function (k) { return rv[k] && rv[k].due; }).filter(Boolean).sort()[0];
      if (rd) out.push({ t: "مرورِ حلِ «" + clip(r.p.title, 30) + "»", due: rd, view: "lprob", arg: x.pid });
    });
    c.wchain.filter(function (x) { return !x.outcome && x.due; }).forEach(function (x) { out.push({ t: "⛓ نتیجهٔ واقعیِ «" + clip(x.title, 30) + "»", due: x.due, view: "chain", arg: x.id }); });
    var fo = c.fcast.filter(function (x) { return !x.outcome && x.due; }); if (fo.length) out.push({ t: "🎯 " + fa(fo.length) + " پیش‌بینی", due: first(fo, "due"), view: "fcast" });
    var sc = c.sched.filter(function (x) { return !x.done; }); if (sc.length) out.push({ t: "چرخهٔ ۱-۳-۷ (برگهٔ سفید)", due: first(sc, "due"), view: "topic", arg: sc[0].topic });
    // سنجشِ ماندگاریِ ۳۰/۹۰ روزه هم موعدِ تمرین است تا یادآور و ایمیل تاریخش را بگویند (کارزارِ سوم v04: یادآورِ تور به بازبینیِ پرونده در اسفند رفت و آزمونِ ۳۰ روزه یادآور نداشت)
    if (f.kind === "knot") c.knot.forEach(function (k) { HOLD.forEach(function (n) { if (knotSolved(k) && !knotHeld(k, n)) out.push({ t: "🔁 سنجشِ ماندگاری (" + fa(n) + " روز) و دوباره‌سنجیِ همان موقعیتِ نخست", due: plusDays(k.solvedAt, n), view: "kpractice", arg: k.id }); }); });
    c["case"].forEach(function (cs) { var d = cs.st && cs.st.st_final && cs.st.st_final.data; var rd = d && d.revdate && A.epiRevDate ? A.epiRevDate(d.revdate) : ""; if (rd) out.push({ t: "بازبینیِ نتیجهٔ واقعیِ «" + clip(cs.title, 40) + "»", due: rd, view: "e_case", arg: cs.id }); });
    out.forEach(function (p) { p.overdue = p.due && p.due <= t; });
    return out.sort(function (a, b) { return String(a.due).localeCompare(String(b.due)); });
  }
  /* «رفتن به این بخش»: آخرین رکوردِ وصل‌شدهٔ وجه (نه نمای کهنهٔ طرح) */
  var VIEW_OF = { kcase: "kcase", knot: "knot", "case": "e_case", eprob: "e_prob", topic: "topic", wchain: "chain", fcast: "fcast", value: "vals", meaning: "vals", prereq: "prereq" };
  function viewOf(f) {
    var r = (f.refs || []).slice().reverse().filter(function (x) { return VIEW_OF[x.type] && get(x.id); })[0];
    if (!r) return { v: f.view, a: f.arg || null, s: f.sub || null };
    var rec = get(r.id); return r.type === "eprob" ? { v: "e_prob", a: rec.p && rec.p.id, s: null } : r.type === "fcast" || r.type === "value" || r.type === "meaning" ? { v: VIEW_OF[r.type], a: null, s: null } : { v: VIEW_OF[r.type], a: r.id, s: null };
  }
  AS.tourViewOf = viewOf;
  AS.tourMilestones = milestones; AS.tourPractice = practice; AS.tourChildren = children;

  /* ---------- عملیاتِ تور (از پاسخِ مدل) ---------- */
  function T(s) { return s.tour; }
  function fac(s, key) { return T(s) && T(s).facets.filter(function (f) { return f.key === key; })[0]; }
  function current(s) { var t = T(s); return t && t.facets.filter(function (f) { return f.status === "now"; })[0]; }
  /* رویدادهای تور با زمان (کارزارِ سوم v06: کشو نمودار و مسیرِ واقعی نداشت — «f1 ⇐ f3 ⇐ f1» هیچ ردی نمی‌گذاشت):
     start/switch/detour/done/reopen/skip برای وجه‌ها و ms (شمارِ نشانه‌های ✓ ِ همهٔ تور) — نمودار و مسیرِ کشو و ایمیل از همین است */
  function msTotal(t) { var ok = 0, all = 0; t.facets.forEach(function (f) { if (f.status === "skipped") return; milestones(f).forEach(function (m) { all++; if (m.ok) ok++; }); }); return { ok: ok, all: all }; }
  function ev(s, k, f, x) {
    var t = T(s); if (!t) return; var E = t.events = t.events || [];
    var e = { at: nowIso(), k: k }; if (f) e.f = f.key; if (x != null) e.n = x;
    var last = E[E.length - 1]; if (last && last.k === k && last.f === e.f && last.n === e.n && k !== "ms") return;
    E.push(e); if (E.length > 400) t.events = E.slice(-400);
  }
  AS.tourEvent = ev;
  function msMark(s) { var t = T(s); if (!t) return; var m = msTotal(t), E = (t.events || []).filter(function (e) { return e.k === "ms"; }), l = E[E.length - 1]; if (!l || l.n !== m.ok || l.all !== m.all) { ev(s, "ms", null, m.ok); t.events[t.events.length - 1].all = m.all; } }
  /* مسیرِ واقعی: توالیِ وجه‌هایی که «همین حالا» شدند (بی تکرارِ پشتِ‌هم) */
  AS.tourPath = function (s) {
    var t = T(s); if (!t) return []; var out = [];
    (t.events || []).forEach(function (e) { if (!/^(start|switch|detour)$/.test(e.k) || !e.f) return; if (out.length && out[out.length - 1].f === e.f) return; out.push({ f: e.f, at: e.at, k: e.k }); });
    return out;
  };
  /* مسیرِ واقعی به زبانِ آدم: نامِ وجه‌ها (نه کلید) با ←؛ «(انحراف)» برای جابه‌جاییِ میانِ کار */
  AS.tourPathText = function (s) {
    var t = T(s); if (!t) return ""; var p = AS.tourPath(s); if (!p.length) return "";
    return p.map(function (x) { var f = t.facets.filter(function (g) { return g.key === x.f; })[0]; return "«" + clip(f ? f.title : "؟", 28) + "»" + (x.k === "detour" ? " (انحراف)" : ""); }).join(" ← ");
  };
  /* نمودارِ کوچک: شمارِ نشانه‌های ✓ در طولِ زمان (پله‌ای)، با سقفِ همهٔ نشانه‌ها — SVG ِ خودبسنده (برای ایمیل هم PNG می‌شود) */
  AS.tourChart = function (s, opt) {
    var pts = AS.tourSeries(s); if (pts.length < 1) return null;
    var W = (opt && opt.w) || 300, H = (opt && opt.h) || 90, P = 18, NS = "http://www.w3.org/2000/svg";
    var t0 = Date.parse(pts[0].at), t1 = Math.max(Date.parse(pts[pts.length - 1].at), Date.now()), span = Math.max(1, t1 - t0), mx = Math.max.apply(null, pts.map(function (p) { return Math.max(p.all, p.n, 1); }));
    function X(at) { return P + (W - 2 * P) * (Date.parse(at) - t0) / span; } function Y(n) { return H - P - (H - 2 * P) * n / mx; }
    var d = "", last = null; pts.forEach(function (p) { var x = X(p.at), y = Y(p.n); d += (d ? " L" + x.toFixed(1) + " " + (last == null ? y : last).toFixed(1) + " L" : "M") + x.toFixed(1) + " " + y.toFixed(1); last = y; });
    d += " L" + (W - P).toFixed(1) + " " + last.toFixed(1);
    var svg = document.createElementNS(NS, "svg"); svg.setAttribute("width", W); svg.setAttribute("height", H); svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.setAttribute("role", "img");
    function el(n, at) { var e = document.createElementNS(NS, n); Object.keys(at).forEach(function (k) { e.setAttribute(k, at[k]); }); svg.appendChild(e); return e; }
    el("rect", { x: 0, y: 0, width: W, height: H, fill: "#ffffff" });
    el("line", { x1: P, y1: Y(mx), x2: W - P, y2: Y(mx), stroke: "#d1d5db", "stroke-dasharray": "3 3" });
    el("line", { x1: P, y1: H - P, x2: W - P, y2: H - P, stroke: "#9ca3af" });
    el("path", { d: d, fill: "none", stroke: "#0f766e", "stroke-width": 2 });
    var lp = pts[pts.length - 1]; el("circle", { cx: (W - P).toFixed(1), cy: Y(lp.n).toFixed(1), r: 3, fill: "#0f766e" });
    var tx = el("text", { x: W - P, y: 12, "font-size": 10, "text-anchor": "end", fill: "#374151", "font-family": "Tahoma, sans-serif" }); tx.textContent = "نشانه‌های ✓: " + fa(lp.n) + " از " + fa(lp.all || mx);
    var t2 = el("text", { x: P, y: H - 4, "font-size": 9, fill: "#6b7280", "font-family": "Tahoma, sans-serif" }); t2.textContent = (A.fdate ? A.fdate(String(pts[0].at).slice(0, 10)) : String(pts[0].at).slice(0, 10));
    var title = document.createElementNS(NS, "title"); title.textContent = "پیشرفتِ تور در طولِ زمان"; svg.insertBefore(title, svg.firstChild);
    return svg;
  };
  AS.tourSeries = function (s) { var t = T(s); return t ? (t.events || []).filter(function (e) { return e.k === "ms"; }).map(function (e) { return { at: e.at, n: e.n, all: e.all || 0 }; }) : []; };
  function advance(s) {
    var t = T(s); if (!t) return null;
    if (current(s)) return current(s);
    var n = t.facets.filter(function (f) { return f.status === "todo"; })[0];
    if (n) { n.status = "now"; n.startedAt = n.startedAt || nowIso(); ev(s, "start", n); }
    if (!n && t.facets.every(function (f) { return f.status === "done" || f.status === "skipped"; })) t.doneAt = t.doneAt || nowIso();
    return n || null;
  }
  var BAD_AREA = [];
  function normFacet(x, i) {
    var k = KIND[x.kind] ? x.kind : "other";
    // حوزه از قلمروِ سامانه‌ها یا قلمروِ معرفت‌شناسی (a_…) — کارزارِ آزمون sc08: a_testimony و a_evidence وجهِ area نمی‌شدند
    var ar = x.area && A.SYST ? (A.SYST.byId ? A.SYST.byId(String(x.area)) : A.SYST.find(String(x.area))) : null, epi = ar && ar.epi;
    if (x.area && !ar) BAD_AREA.push(String(x.area));
    if (ar && k === "other") k = "area";
    // حوزهٔ سامانه‌ها (نه معرفت‌شناسی) ⇒ نمای «🗺 قلمروِ سامانه‌ها»، حتی برای وجهِ territory (کارزارِ آزمون sc16: dc_* به قلمروِ معرفت‌شناسی می‌رفت)
    var dv = epi ? "e_bt" : ar ? "sterr" : KIND[k].view, ds = epi ? "terr" : ar ? "" : KIND[k].sub || "";
    return { key: String(x.key || "f" + (i + 1)).slice(0, 12), kind: k, area: ar ? ar.a.id : "", title: clip(x.title || x.name || x.t || (ar ? ar.a.fa : "") || KIND[k].fa, 120), why: clip(x.why || "", 300),
      view: A.V[x.view] ? x.view : dv, arg: x.arg == null || x.arg === "" ? (ar && !epi ? ar.sys.id : "") : String(x.arg).slice(0, 80), sub: x.sub ? String(x.sub).slice(0, 40) : (A.V[x.view] ? "" : ds),
      steps: (x.steps || []).slice(0, 12).map(function (st) { return { t: clip(typeof st === "string" ? st : st.t, 140), done: false }; }),
      status: "todo", refs: [], createdAt: nowIso() };
  }
  var DO = AS.DO;
  DO.tour_plan = function (a) {
    var s = AS._turnSession; if (!s || !Array.isArray(a.facets) || !a.facets.length) return "طرحِ تور خالی بود";
    BAD_AREA = []; var fs = a.facets.slice(0, 10).map(normFacet), bad = BAD_AREA.slice();
    if (!s.tour) {
      s.tour = { goal: clip(a.goal || s.pinned || "", 300), createdAt: nowIso(), facets: fs };
    } else {   // طرحِ تازه چیزی را بی‌صدا پاک یا بازنویسی نمی‌کند: وجه‌های موجود می‌مانند، تازه‌ها افزوده می‌شوند
      // (تورِ زنده: موضوعِ تازه در همان سشن با کلیدهای f1…f3 آمد و عنوانِ وجه‌های «انجام‌شده» را بازنویسی کرد — تاریخچه دروغ می‌شد)
      var t = s.tour, have = {}, added = 0;
      t.facets.forEach(function (f) { have[f.key] = f; });
      function freeKey() { var n = t.facets.length + 1; while (have["f" + n]) n++; return "f" + n; }
      fs.forEach(function (f) {
        var o = have[f.key];
        if (o && (o.status === "todo" || o.status === "now") && (o.kind === f.kind || o.title === f.title)) { o.title = f.title; o.why = f.why || o.why; if ((f.steps || []).length) o.steps = f.steps; return; }   // پالایشِ همان وجهِ باز
        if (o) f.key = freeKey();
        have[f.key] = f; t.facets.push(f); added++;
      });
      if (added) {
        var g = clip(a.goal || "", 300); if (g && (t.goal || "").indexOf(g) < 0) t.goal = clip((t.goal ? t.goal + " · " : "") + g, 600);
        if (t.doneAt) { delete t.doneAt; delete t.doneSaid; delete t.masteredAt; }   // تورِ تمام‌شده با وجهِ تازه دوباره باز است
      }
    }
    advance(s);
    // شناسهٔ حوزهٔ ناموجود بی‌صدا خالی نمی‌شود (کارزارِ آزمون sc17: md_catastrophizing نبود و وجه بی‌حوزه ماند)
    return bad.length ? "حوزهٔ «" + bad.join("، ") + "» در قلمروها نیست — وجه بی حوزه ساخته شد؛ شناسهٔ درست را از «# دانسته‌های قلمرو» بردار یا با know بخواه" : "";
  };
  DO.tour_add = function (a) {
    // هر سه شکل پذیرفته می‌شود: {"facet":{…}}، فیلدهای تخت، یا {"facets":[…]} — و وجهِ تهی ساخته نمی‌شود (کارزارِ آزمون sc08: وجهِ «گامِ دیگر» بی نما)
    var list = Array.isArray(a.facets) ? a.facets : [a.facet && typeof a.facet === "object" ? a.facet : a];
    list = list.filter(function (x) { return x && (String(x.title || "").trim() || x.area || x.view || (x.kind && x.kind !== "other")); });
    if (!list.length) return "وجهِ تازه عنوان یا نوع ندارد — شکل: {\"do\":\"tour_add\",\"facet\":{\"key\":\"f4\",\"kind\":\"area\",\"area\":\"…\",\"title\":\"…\"}}";
    return DO.tour_plan({ goal: a.goal, facets: list });
  };
  DO.tour_goal = function (a) { var s = AS._turnSession; if (!s || !s.tour || !a.goal) return "تور یا هدف نیست"; s.tour.goal = clip(a.goal, 600); return ""; };
  DO.tour_focus = function (a) {
    var s = AS._turnSession, f = s && fac(s, a.facet); if (!f) return "وجهِ «" + (a.facet || "") + "» در تور نیست";
    if (f.status === "blocked") return "وجهِ «" + f.title + "» منتظرِ ساختِ حوزه است";
    var c = current(s); if (c && c !== f) c.status = "todo";
    f.status = "now"; f.startedAt = f.startedAt || nowIso(); ev(s, c && c !== f ? "detour" : "switch", f); return "";
  };
  /* گفتهٔ دستیار فقط «ادعا» است (تورِ پولیا s26): گام ✓ نمی‌شود تا خودِ کاربر در کشوی تور تأیید کند */
  DO.tour_step = function (a) {
    var s = AS._turnSession, f = s && fac(s, a.facet); if (!f) return "وجه نیست"; var st = (f.steps || [])[+a.step - 1]; if (!st) return "گامِ " + (a.step || "") + " در این وجه نیست";
    if (a.done === false) { st.claimed = false; if (st.by !== "user") st.done = false; return ""; }
    if (st.done && st.by === "user") return "";
    st.claimed = true; st.claimAt = nowIso(); return "گامِ «" + clip(st.t, 40) + "» فقط به‌عنوانِ «دستیار می‌گوید انجام شد» علامت خورد؛ ✓ آن فقط با تأییدِ خودِ کاربر در کشوی تور است — از او بخواه اگر انجامش داده همان‌جا تأیید کند";
  };
  DO.tour_link = function (a) {
    // «topic:tp_…» یا «kcase:kc_…» هم پذیرفته می‌شود (کارزارِ آزمون c08: پیشوندِ نوع، شناسه را «برگهٔ #۸۸۴۷۰» خواند)
    var rid = String(a.id || "").replace(/^[a-z_]+:(?=[A-Za-z])/, "");
    var s = AS._turnSession, f = s && fac(s, a.facet), r = get(rid);
    // برگه (شمارهٔ «#101») ⇒ همان وجه منتظرِ همان برگه، تا پاسخِ روتین سنجیده شود (کارزارِ آزمون sc08: برگه به هیچ وجهی وصل نبود)
    var num = !r && f && /^#?\s*[0-9۰-۹]+$/.test(String(a.id || "").trim()) && String(a.id).replace(/[^0-9۰-۹]/g, "").replace(/[۰-۹]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); });
    if (num) {
      var rep = (s.reports || []).filter(function (x) { return String(x.number) === num; })[0] || (AS._sheets || []).filter(function (x) { return String(x.number) === num; })[0];
      if (!rep) return "برگهٔ #" + num + " پیدا نشد";
      if (f.status === "done" || f.status === "skipped") return "وجهِ «" + f.title + "» بسته است";
      rep.facet = f.key; f.status = "blocked"; f.blocked = { id: rep.id, number: rep.number, area: rep.area || "", title: rep.title || "", at: rep.at || nowIso(), checks: [], seenNote: "" };
      return "";
    }
    // شناسهٔ حوزهٔ قلمرو (ln_retrieval، md_habits، …) ⇒ وجه به آن حوزهٔ موجود وصل می‌شود (کارزارِ سوم v03)
    var arx = !r && f && A.SYST && (A.SYST.byId ? A.SYST.byId(rid) : A.SYST.find(rid));
    if (arx) { if (f.area === arx.a.id || (f.areas || []).indexOf(arx.a.id) >= 0) return ""; if (f.kind === "area" && !f.area) { f.area = arx.a.id; return ""; } f.areas = (f.areas || []).concat([arx.a.id]).slice(0, 6); return ""; }
    if (!f || !r) return "پیوند به رکوردِ ناموجود";
    // یک کار یک بار شمرده می‌شود: رکوردی که ریشهٔ وجهِ دیگری است دوباره وصل نمی‌شود (کارزارِ آزمون sc01: وجهِ تکراری با همان ۸ نشانه)
    var dup = s.tour.facets.filter(function (g) { return g !== f && g.status !== "skipped" && (g.refs || []).some(function (x) { return x.id === r.id; }); })[0];
    // پیوندِ خودکار (به وجهِ «همین حالا») جابه‌جا می‌شود — کارزارِ آزمون sc07: کاربرگ به وجهِ نادرست چسبیده بود؛ پیوندِ عمدی نه
    var dref = dup && dup.refs.filter(function (x) { return x.id === r.id; })[0];
    if (dref && dref.auto) { dup.refs = dup.refs.filter(function (x) { return x.id !== r.id; }); dup = null; }
    if (dup) return "«" + clip(r.title || r.name || r.id, 40) + "» از پیش در وجهِ «" + dup.title + "» شمرده می‌شود — یک کار دو بار شمرده نمی‌شود؛ اگر این وجه همان است، با tour_skip و دلیل کنارش بگذار";
    if (!(f.refs || []).some(function (x) { return x.id === r.id; })) f.refs.push({ id: r.id, type: r.type }); return "";
  };
  DO.tour_done = function (a) {
    var s = AS._turnSession, f = s && fac(s, a.facet); if (!f) return "وجه نیست";
    /* هیچ وجهی با حرفِ دستیار بسته نمی‌شود — حتی با دلیل (کارزارِ سوم v02 برای گره؛ تورِ پولیا s26 برای «گامِ دیگر»: «🎉 پایهٔ همهٔ وجه‌ها» از حرفِ مدل):
       فقط نشانه‌های داده‌محور یا تأییدِ خودِ کاربر در کشوی تور (data-own) */
    if (!coreDone(f) && !closedRoot(f)) { ev(s, "deny", f); return "«" + f.title + "» از روی داده‌ها هنوز برپا نیست (" + milestones(f).filter(function (m) { return m.core && !m.ok; }).map(function (m) { return m.t; }).join("، ") + ") — وجه فقط با نشانه‌هایش (داده) یا تأییدِ خودِ کاربر بسته می‌شود؛ حرفِ دستیار، حتی با دلیل، آن را نمی‌بندد؛ " + (f.kind === "other" ? "اگر کاربر انجامش داده، خودش در کشوی تور «✓ انجامش دادم» را بزند" : "کاربر کارِ همان بخش را در صفحه تمام کند"); }
    f.status = "done"; f.doneAt = nowIso(); f.doneBy = coreDone(f) ? "evidence" : "closed"; ev(s, "done", f); advance(s); return "";
  };
  /* «دیدم درست نشده»: برگه‌ای که «ساخته و وارسی شد» ولی دستیار بعداً در صفحه می‌بیند کار نمی‌کند ⇒ وارسی پس گرفته، برگه با دلیل
     دوباره باز و وجه دوباره منتظر (کارزارِ آزمونِ دوم c01: ایمیل‌ها تا آخر «ساخته و وارسی شد» گفتند، پس از آن‌که دستیار پس گرفته بود) */
  DO.tour_unverify = function (a) {
    var s = AS._turnSession, f = s && fac(s, a.facet); if (!f || !f.blocked) return "این وجه برگه‌ای ندارد";
    if (!String(a.why || "").trim()) return "پس‌گرفتنِ وارسی بی دلیل ممکن نیست";
    f.blocked.verified = false; f.status = "blocked"; delete f.doneAt;
    if (s.tour.doneAt) { delete s.tour.doneAt; delete s.tour.doneSaid; delete s.tour.masteredAt; }
    f.blocked.checks = f.blocked.checks || []; f.blocked.checks.push({ at: nowIso(), ok: false, reason: clip("پس از ✅ در صفحه دیده شد هنوز کار نمی‌کند: " + a.why, 500) });
    var note = "[دستیار · وارسیِ پس‌گرفته]\nپس از پذیرشِ قبلی، در خودِ صفحه دیده شد هنوز درست نشده:\n" + clip(a.why, 1500) + "\n\nاین یادداشت برگه را دوباره باز کرد.";
    if (A.HOST && A.HOST.note && f.blocked.id) Promise.resolve(A.HOST.note(f.blocked.id, note)).then(null, function () { });
    s.msgs.push({ role: "sys", at: nowIso(), text: "↩ وارسیِ برگهٔ #" + fa(f.blocked.number) + " پس گرفته شد و برگه دوباره باز شد: " + clip(a.why, 200) });
    return "";
  };
  DO.tour_skip = function (a) {
    var s = AS._turnSession, f = s && fac(s, a.facet); if (!f) return "وجه نیست";
    if (!a.why) return "کنار گذاشتنِ وجه بی دلیل ممکن نیست";
    f.status = "skipped"; f.skipWhy = clip(a.why, 300); ev(s, "skip", f); advance(s); return "";
  };

  /* برگه‌ای که در میانهٔ تور بی «facet» ثبت شد ⇒ وجهِ «حوزه‌ای که نیست» ِ خودش، تا پاسخِ روتین هم سنجیده شود
     (کارزارِ آزمون sc13/sc08: برگه به هیچ وجهی وصل نبود و پیگیری‌اش هرگز اجرا نشد) */
  AS.tourAdoptSheet = function (s, r, g) {
    if (!s || !s.tour || !r || !r.id) return;
    if (s.tour.facets.some(function (f) { return f.blocked && f.blocked.id === r.id; })) return;
    // خطای خودِ صفحه «حوزهٔ نبوده» نیست (کارزارِ آزمونِ دوم c01)
    var isFix = g && (g.kind === "fix" || /lla-page|engine|supervisor/.test(String(g.area || "")));
    var f = normFacet({ kind: isFix ? "other" : "territory", title: clip((isFix ? "🔧 رفعِ خطای صفحه: " : "") + ((g && g.title) || r.title || "حوزه‌ای که نیست"), 100), why: "برگهٔ #" + r.number + " — تا روتینِ مسئول بسازد و دستیار وارسی کند" }, s.tour.facets.length);
    var have = {}; s.tour.facets.forEach(function (x) { have[x.key] = 1; }); var n = s.tour.facets.length + 1; while (have["f" + n]) n++; f.key = "f" + n;
    s.tour.facets.push(f); if (s.tour.doneAt) { delete s.tour.doneAt; delete s.tour.doneSaid; delete s.tour.masteredAt; }
    AS.tourBlock(s, f.key, r, g || {});
  };
  /* برگهٔ «حوزه‌ای که نیست» ⇒ همان وجه منتظر می‌ماند؛ بقیهٔ تور ادامه دارد */
  AS.tourBlock = function (s, key, r, g) {
    var f = fac(s, key); if (!f || !r || !r.id) return;
    f.status = "blocked"; f.blocked = { id: r.id, number: r.number, area: g.area, title: g.title, at: nowIso(), checks: [], seenNote: "" };
    advance(s); S.put(s);
  };

  /* ---------- پس از هر نوبت: پیوندِ خودکار، پیشرفت، رفتن به وجهِ بعد ---------- */
  var VIEW_TYPES = { chain: ["wchain"], fcast: ["fcast"], vals: ["value", "meaning"] };
  function areaTypes(id) { var x = A.SYST && A.SYST.find ? A.SYST.find(id) : null, out = []; ((x && x.a.tools) || []).forEach(function (tl) { var m = /^view:(\w+)$/.exec(tl); if (m && VIEW_TYPES[m[1]]) out = out.concat(VIEW_TYPES[m[1]]); }); return out.length ? out : null; }
  // رکوردی که به ابزارِ همین حوزه می‌خورد (کارزارِ آزمون sc16: کاربرگِ یادگیریِ پایتون به وجهِ «تصمیمِ شغلی» چسبید و آن را «برپا» کرد)
  function fitsArea(r, id) {
    var x = A.SYST && A.SYST.find ? A.SYST.find(id) : null, tl = (x && x.a.tools) || [];
    if (r.type === "ex") return tl.indexOf("tech:" + r.tid) >= 0;
    var ty = areaTypes(id) || []; return ty.indexOf(r.type) >= 0;
  }
  AS.tourAfterTurn = function (s) {
    var t = T(s); if (!t) return;
    // خوداصلاحی: برگه‌ای که برای وجهی ثبت شده ولی وجه به آن وصل نشده (مثلاً برگه پیش از ساختِ تور) ⇒ همان وجه منتظرِ همان برگه
    (s.reports || []).forEach(function (r) {
      var f = r.facet && fac(s, r.facet);
      if (f && !f.blocked && r.id && f.status !== "done" && f.status !== "skipped") { f.status = "blocked"; f.blocked = { id: r.id, number: r.number, area: r.area, title: r.title, at: r.at, checks: [], seenNote: "" }; }
    });
    var c = current(s), msgs = [];
    if (c && ROOT_TYPE[c.kind]) {   // رکوردِ اصلیِ تازه‌ای که از آغازِ این وجه ساخته شد ⇒ به همین وجه
      var since = c.startedAt || c.createdAt;
      ROOT_TYPE[c.kind].forEach(function (typ) { S.all(typ, function (r) { return !r.sample && (r.created || "") >= since; }).forEach(function (r) {
        var taken = t.facets.some(function (f) { return (f.refs || []).some(function (x) { return x.id === r.id; }); });
        if (!taken && c.kind === "area" && !(c.area && fitsArea(r, c.area))) return;   // موضوع/پرونده/کاربرگِ نامربوط ⇒ مدل با tour_link وصل کند
        if (!taken) { c.refs.push({ id: r.id, type: r.type, auto: true }); msgs.push("«" + clip(r.title || (r.p && r.p.title) || r.id, 50) + "» به وجهِ «" + c.title + "» وصل شد"); }
      }); });
    }
    // وجهِ «حوزه» رکوردِ ابزارِ خودِ همان حوزه را می‌گیرد، حتی اگر وقتی ساخته شد وجه منتظرِ برگه یا در صف بود (کارزارِ آزمون sc14:
    // ارزش‌ها ساخته شد ولی وجهِ ارزش‌ها ۰ از ۳ ماند) — فقط رکوردهای پس از آغازِ تور و هنوز بی‌وجه
    // نوعِ رکورد از ابزارهای خودِ حوزه در ثبت‌گاه می‌آید (view:chain ⇒ زنجیره، view:fcast ⇒ پیش‌بینی، view:vals ⇒ ارزش/معنا) — نه فهرستِ دستی
    var t0 = t.createdAt || (t.facets[0] || {}).createdAt || "";
    t.facets.forEach(function (f) {
      var typs = f.kind === "area" && f.status !== "done" && f.status !== "skipped" && f.area && areaTypes(f.area); if (!typs) return;
      typs.forEach(function (typ) { S.all(typ, function (r) { return !r.sample && String(r.created || r.date || "") >= t0; }).forEach(function (r) {
        if (t.facets.some(function (g) { return (g.refs || []).some(function (x) { return x.id === r.id; }); })) return;
        f.refs.push({ id: r.id, type: r.type, auto: true }); msgs.push("«" + clip(r.title || r.q || r.note || r.id, 40) + "» به وجهِ «" + f.title + "» وصل شد");
      }); });
    });
    // گرهِ ورزیده بازگشت ⇒ صریح گفته می‌شود و «تسلطِ کامل» پس گرفته می‌شود (کارزارِ آزمون sc17: بازگشت در تور دیده نمی‌شد)
    t.facets.forEach(function (f) {
      if (f.kind !== "knot" || f.status === "skipped") return;
      children(f).knot.forEach(function (k) {
        if (!k.returnedAt || (f.retSeen || "") >= k.returnedAt) return;
        f.retSeen = k.returnedAt; if (t.masteredAt) { t.masteredAt = null; }
        var reo = f.status === "done";
        if (reo) { f.status = "todo"; delete f.doneAt; delete f.doneBy; f.reopenedAt = nowIso(); if (t.doneAt) { delete t.doneAt; delete t.doneSaid; } ev(s, "reopen", f); }
        msgs.push("↩ گرهِ «" + clip(k.name || "گره", 40) + "» بازگشت — ورزیدگی و ماندگاری دوباره از نو سنجیده می‌شود (این شکست نیست؛ نشان می‌دهد کجا هنوز کار دارد)" + (reo ? "؛ وجهِ «" + clip(f.title, 40) + "» دوباره باز شد" : ""));
      });
    });
    // پرونده‌ای که از دکمهٔ کارخانهٔ خودِ گره‌گشا ساخته شد (src = موقعیتِ همین تور) ⇒ به وجهِ ادعای همین تور
    var tourKc = {}; t.facets.forEach(function (f) { (f.refs || []).forEach(function (r) { if (r.type === "kcase") tourKc[r.id] = 1; }); });
    var claimF = t.facets.filter(function (f) { return f.kind === "claim" && f.status !== "skipped" && !(f.refs || []).some(function (r) { return r.type === "case"; }); })[0];
    if (claimF) S.all("case", function (cs) { return cs.src && cs.src.type === "kcase" && tourKc[cs.src.id]; }).forEach(function (cs) {
      if (t.facets.some(function (f) { return (f.refs || []).some(function (x) { return x.id === cs.id; }); })) return;
      if (claimF.refs.some(function (r) { return r.type === "case"; })) return;
      claimF.refs.push({ id: cs.id, type: "case" }); msgs.push("پروندهٔ «" + clip(cs.title, 50) + "» (از ریشهٔ گره) به وجهِ «" + claimF.title + "» وصل شد");
    });
    // وجهی که «از روی داده» برپا شده بود ولی شاهدش رفت (پیوندِ نادرست جابه‌جا شد) ⇒ صادقانه دوباره باز (کارزارِ آزمون sc13/sc15)
    // رکوردِ ریشه بسته شد ⇒ وجه بسته (و اگر دوباره باز شد، وجه هم دوباره باز)
    t.facets.forEach(function (f) {
      if ((f.status === "now" || f.status === "todo") && !coreDone(f)) { var cw = closedRoot(f); if (cw) { f.status = "done"; f.doneAt = nowIso(); f.doneBy = "closed"; ev(s, "done", f); msgs.push("✓ وجهِ «" + f.title + "» بسته شد: " + cw + (followups(f).length ? "؛ پیگیریِ مانده: ○ «" + followups(f)[0].t + "»" : "")); } }
      else if (f.status === "done" && f.doneBy === "closed" && !closedRoot(f) && !coreDone(f)) { f.status = "todo"; delete f.doneAt; delete f.doneBy; if (t.doneAt) { delete t.doneAt; delete t.doneSaid; delete t.masteredAt; } ev(s, "reopen", f); msgs.push("↩ وجهِ «" + f.title + "» دوباره باز شد — رکوردش دوباره باز شد"); }
    });
    t.facets.forEach(function (f) {
      if (f.status === "done" && f.doneBy === "evidence" && !coreDone(f)) {
        f.status = "todo"; delete f.doneAt; delete f.doneBy; if (t.doneAt) { delete t.doneAt; delete t.doneSaid; delete t.masteredAt; }
        msgs.push("↩ وجهِ «" + f.title + "» دوباره باز شد — شاهدی که آن را برپا کرده بود مالِ وجهِ دیگری بود");
      }
    });
    t.facets.forEach(function (f) {
      if ((f.status === "now" || f.status === "todo") && coreDone(f)) {
        f.status = "done"; f.doneAt = nowIso(); f.doneBy = "evidence"; ev(s, "done", f);
        var fu0 = followups(f);
        // نشانه‌های مانده با «○ … — مانده» گفته می‌شوند؛ عنوانِ نشانه («… برنامه‌ریزی شد») به‌تنهایی «انجام‌شده» خوانده می‌شد (کارزارِ سوم v01)
        msgs.push("✓ پایهٔ وجهِ «" + f.title + "» برپا شد (از روی خودِ داده‌ها)" + (practice(f).length ? "؛ تمرین‌هایش در «امروز» می‌آید" : "") + (fu0.length ? "؛ هنوز مانده تا تسلط: " + fu0.slice(0, 2).map(function (m) { return "○ «" + m.t + "»"; }).join("، ") : ""));
      }
    });
    var n = advance(s);
    if (msgs.length) s.msgs.push({ role: "sys", at: nowIso(), text: msgs.join(" · ") + (n && msgs.some(function (x) { return /^✓/.test(x); }) ? " — بعدی: «" + n.title + "»" : "") });
    if (t.doneAt && !t.doneSaid) {
      t.doneSaid = true;
      var fu = t.facets.filter(function (f) { return followups(f).length; });
      s.msgs.push({ role: "sys", at: nowIso(), text: "🎉 پایهٔ همهٔ وجه‌های تور به ترتیب برپا شد" + (mastered(t) ? "" : " — هنوز تمام نیست: نشانه‌های مانده تا تسلط پیگیری می‌شوند") + (function () { try { var Ls = AS.sieveLayers ? AS.sieveLayers() : [], d = t.diag || {}, o = Ls.filter(function (L) { return !d[L.id] || d[L.id].st === "ask"; }); return o.length ? " — و " + A.fa(o.length) + " لایهٔ غربال هنوز سنجیده یا پرسیده نشده (" + o.slice(0, 4).map(function (L) { return L.fa; }).join("، ") + (o.length > 4 ? "، …" : "") + ")" : ""; } catch (e) { return ""; } })() + "؛ تمرین‌های فاصله‌دارشان در «امروز» می‌آید." +
        (fu.length ? " تا تسلطِ کامل پیگیری می‌کنم — هنوز مانده: " + fu.map(function (f) { return "«" + clip(f.title, 40) + "» (" + followups(f).map(function (m) { return "○ " + clip(m.t, 40); }).join("، ") + ")"; }).join("؛ ") + "." : "") });
    }
    msMark(s);
    if (t.doneAt && !t.masteredAt && mastered(t)) { t.masteredAt = nowIso(); s.msgs.push({ role: "sys", at: nowIso(), text: "🏁 همهٔ نشانه‌های همهٔ وجه‌ها ✓ شد — تور کامل شد. مرورهای فاصله‌دار همچنان در «امروز» می‌آید." }); }
    syncReminder(s);
    try { AS.tourStallSync(s); } catch (e) { console.error(e); }
  };

  /* ---------- متنِ تور برای مدل (حافظهٔ ماندگار — مدل همین را دنبال می‌کند) ---------- */
  AS.tourText = function (s) {
    var t = T(s); if (!t) return "";
    var L = ["# تور (ماندگار؛ همین را دنبال کن، چیزی را از قلم نینداز) — هدف: " + (t.goal || s.pinned || "")];
    if (AS.safetyActive ? AS.safetyActive(s) : s.safetyAt) L.push("⚠ در این سشن نشانهٔ پریشانیِ جدی بود (" + String(s.safetyAt).slice(0, 10) + "): پیش از هر کار با یک جمله حالش را بپرس؛ هیچ کاری را تحمیل نکن؛ خطِ کمکِ انسانی را یادآوری کن اگر لازم شد.");
    t.facets.forEach(function (f, i) {
      var ms = milestones(f), pr = practice(f);
      L.push((i + 1) + ") [" + f.key + "] " + KIND[f.kind].fa + " — «" + f.title + "» — وضع: " + f.status + (f.status === "now" ? " ◀ همین حالا" : "") +
        (function () { var vv = viewOf(f); return " — نما: " + vv.v + (vv.a ? " arg=" + vv.a : "") + (vv.s ? " sub=" + vv.s : ""); })() + (f.area ? " — حوزه: " + f.area : "") + ((f.areas || []).length ? " — حوزه‌های وصل‌شده: " + f.areas.join("، ") : "") +
        " — نشانه‌ها: " + ms.map(function (m) { return (m.ok ? "✓" : "○") + m.t + (m.mine ? " (کارِ کاربر)" : ""); }).join("؛ ") +
        ((f.refs || []).length ? " — رکوردها: " + f.refs.map(function (r) { return r.type + ":" + r.id; }).join("، ") : "") +
        (pr.length ? " — تمرینِ زمان‌بندی‌شده: " + pr.map(function (p) { return p.t + " " + p.due; }).join("، ") : "") +
        (f.status === "done" && followups(f).length ? " — پیگیریِ باز: " + followups(f).map(function (m) { return m.t; }).join("؛ ") : "") +
        (f.blocked ? " — برگهٔ #" + f.blocked.number + (f.blocked.verified ? " (ساخته و وارسی شد)" : " (منتظر)") : "") + (f.why ? " — چرا: " + f.why : ""));
    });
    // رکوردهای تازهٔ کاربر که هنوز به هیچ وجهی وصل نیستند — تا مدل شناسه‌شان را برای tour_link داشته باشد (کارزارِ آزمون sc08: پیش‌بینی پیدا نمی‌شد)
    var linked = {}; t.facets.forEach(function (f) { (f.refs || []).forEach(function (r) { linked[r.id] = 1; }); });
    var from = A.addDays(A.today(), -14), fresh = [], s0 = String(((s.msgs || [])[0] || {}).at || t.createdAt || "");
    ["kcase", "case", "eprob", "topic", "wchain", "fcast", "kexp", "value", "meaning"].forEach(function (typ) { S.all(typ, function (r) { return !r.sample && !linked[r.id] && String(r.created || r.date || "") >= from; }).forEach(function (r) { fresh.push(r); }); });
    // فقط رکوردهای همین سشن؛ ساختهٔ سشنِ دیگر هرگز نامزدِ پیوند نیست؛ قدیمی‌تر از این سشن با برچسبِ «پیش از این سشن»
    fresh = fresh.filter(function (r) { return (s.made || []).indexOf(r.id) >= 0 || !madeElsewhere(s, r.id); });
    fresh.sort(function (a, b) { return String(b.created || "").localeCompare(String(a.created || "")); });
    if (fresh.length) L.push("رکوردهای تازهٔ وصل‌نشده (برای tour_link؛ ساختهٔ سشن‌های دیگر این‌جا نیستند): " + fresh.slice(0, 10).map(function (r) { var mine = (s.made || []).indexOf(r.id) >= 0, old = !mine && s0 && String(r.created || r.date || "") < s0; return r.type + ":" + r.id + " «" + clip(r.title || r.q || r.name || r.plan || r.statement || (r.intake && r.intake.what) || (r.p && r.p.title) || "", 40) + "»" + (old ? " (پیش از این سشن — فقط اگر کاربر گفت مربوط است)" : ""); }).join("، "));
    // ثبت‌های تازه از نوبتِ پیش (کارزارِ سوم v02: ذخیرهٔ آزمایش تأیید نشد) — مدل در یک جمله تأییدشان کند
    var ack = [], since = t.ackAt || "";
    t.facets.forEach(function (f) { if (f.status === "skipped") return; var c = children(f); ["kcase", "knot", "kexp", "kitem", "case", "eprob", "topic", "wchain", "fcast", "value", "meaning", "prereq"].forEach(function (ty) { (c[ty] || []).forEach(function (r) { var w = String(r.created || r.at || ""); if (since && w > since && ack.indexOf(r) < 0) ack.push(r); }); }); });
    if (ack.length) L.push("ثبت‌های تازه از نوبتِ پیش (در پاسخ در یک جمله ببین و تأییدشان کن — بی تکرارِ متنشان): " + ack.slice(0, 8).map(function (r) { return (({ kexp: "آزمایشِ واقعی", kitem: "نمونهٔ ورزش", knot: "گره", kcase: "موقعیت", "case": "پرونده", eprob: "مسئله", topic: "موضوع", wchain: "زنجیرهٔ نگرانی", fcast: "پیش‌بینی", value: "ارزش", meaning: "وارسیِ معنا", prereq: "نقشهٔ پیش‌نیاز" })[r.type] || r.type) + " «" + clip(r.title || r.name || r.plan || r.q || r.prompt || "", 40) + "»"; }).join("، "));
    t.ackAt = nowIso();
    // پیگیری‌های بدهکار (سازندهٔ تمرینِ در جریان/ناموفق)
    var owe = []; t.facets.forEach(function (f) { owedGen(f).forEach(function (x) { owe.push("[" + f.key + "] " + x); }); });
    if (owe.length) L.push("پیگیریِ بدهکار (پیش از رفتن به وجهِ دیگر به کاربر بگو و راهش را نشان بده): " + owe.join(" · "));
    // حوزه‌های قلمروِ هم‌خوان با هر وجه (برای {"do":"tour_link","facet":"fN","id":"<شناسهٔ حوزه>"})
    var ma = []; t.facets.forEach(function (f) { if (f.status === "skipped") return; var m = matchAreas(f); if (m.length) ma.push("[" + f.key + "] " + m.map(function (r) { return r.a.id + " «" + clip(r.a.fa, 40) + "» گامِ " + (A.SYST.stage ? A.SYST.stage(r.a) : "?"); }).join("، ")); });
    if (ma.length) L.push("حوزه‌های موجودِ قلمروِ سامانه‌ها که با وجه‌ها هم‌خوان‌اند (اگر واقعاً همان است با tour_link و شناسهٔ حوزه وصل کن؛ حوزهٔ تازه نساز): " + ma.join(" · "));
    L.push("بستنِ وجه فقط از داده یا تأییدِ خودِ کاربر است: tour_done و tour_step از تو فقط پیشنهاد است و ✓ نمی‌زند؛ «تمام شد/برپا شد» را فقط وقتی بگو که همین‌جا ✓ آمده — گامِ «گامِ دیگر» را کاربر خودش در کشوی تور تأیید می‌کند.");
    var pg = AS.progress(s); if (pg) L.push("پیشرفتِ رسمی (همان عددی که کاربر در کشو، فهرستِ سشن و «امروز» می‌بیند): " + pg.label + " " + pg.done + " از " + pg.all + " وجه — اگر از پیشرفت گفتی فقط همین عدد را بگو، نه شمارِ «مراحل».");
    var unl = (s.reports || []).filter(function (r) { return r.number && !r.facet; });
    if (unl.length) L.push("برگه‌های ثبت‌شده که به وجهی وصل نیستند: " + unl.map(function (r) { return "#" + r.number; }).join("، ") + " — با {\"do\":\"tour_link\",\"facet\":\"fN\",\"id\":\"#شماره\"} به وجهِ territory وصل کن تا پاسخِ روتین سنجیده شود.");
    return L.join("\n");
  };

  /* ---------- رکوردی که در کدام سشن ساخته شد (بازبینیِ اجرا v01: تورِ سشنِ ۱ موضوعِ واژگانِ سشنِ ۲ را برای tour_link پیشنهاد کرد) ----------
     رکوردِ تازه (نه ویرایش) از نوع‌های قابلِ پیوند ⇒ شناسه‌اش در s.made ِ سشنِ جاری؛ فهرستِ «وصل‌نشده‌ها» فقط از همین سشن است. */
  var FRESH_T = ["kcase", "case", "eprob", "topic", "wchain", "fcast", "kexp", "value", "meaning", "prereq"];
  AS.FRESH_TYPES = FRESH_T;
  if (!S.put._made) {
    var rawPutM = S.put;
    S.put = function (r) {
      var isNew = false; try { isNew = !!(r && r.id && FRESH_T.indexOf(r.type) >= 0 && !r.sample && !S.get(r.id)); } catch (e) { }
      var out = rawPutM.apply(this, arguments);
      if (isNew) try { var cs = AS.cur(); if (cs && cs.id !== r.id) { var mm = cs.made = cs.made || []; if (mm.indexOf(r.id) < 0) { mm.push(r.id); if (mm.length > 300) cs.made = mm.slice(-300); rawPutM.call(S, cs); } } } catch (e) { }
      return out;
    };
    S.put._made = true;
  }
  function madeElsewhere(s, id) { return S.all("achat", function (x) { return x.id !== s.id && (x.made || []).indexOf(id) >= 0; })[0] || null; }
  AS.tourMadeElsewhere = madeElsewhere;
  /* یک منبعِ پیشرفت برای همه‌جا (کارزارِ سوم v01: گفت‌وگو «مراحل ۱ از ۴»، کشو «تور ۱ از ۳»، فهرستِ سشن «۴/۷»):
     تور دارد ⇒ وجه‌های برپاشده از وجه‌های کنارگذاشته‌نشده؛ ندارد ⇒ مراحلِ نوشتهٔ مدل */
  AS.progress = function (s) {
    if (s && s.tour && (s.tour.facets || []).length) { var live = s.tour.facets.filter(function (f) { return f.status !== "skipped"; }); return { kind: "tour", done: live.filter(function (f) { return f.status === "done"; }).length, all: live.length, label: "تور" }; }
    var st = (s && s.steps) || []; return st.length ? { kind: "steps", done: st.filter(function (x) { return x.s === "done"; }).length, all: st.length, label: "مراحل" } : null;
  };
  AS.progressText = function (s) { var p = AS.progress(s); return p ? p.label + " " + fa(p.done) + " از " + fa(p.all) : ""; };
  /* حوزه‌های قلمروِ سامانه‌ها که با یک وجه هم‌خوان‌اند (کارزارِ سوم v03: وجه‌ها هرگز به حوزه‌های موجود — ln_retrieval، md_habits، … — وصل نشدند) */
  function matchAreas(f) {
    if (!A.SYST || !A.SYST.related) return [];
    return A.SYST.related(f.title + " " + (f.why || ""), 6).filter(function (r) { return !r.epi && r.a.id !== f.area && (f.areas || []).indexOf(r.a.id) < 0; }).slice(0, 3);
  }
  AS.tourMatchAreas = matchAreas;
  /* ساختِ نمونه‌های ورزشِ گره که در جریان است یا شکست خورد/چیزی نساخت ⇒ پیگیریِ بدهکار (کارزارِ سوم v02: خالی ماند و فراموش شد) */
  function owedGen(f) {
    if (f.kind !== "knot" || f.status === "skipped") return [];
    var c = children(f), out = [];
    c.knot.forEach(function (k) {
      var g = k.genLast; if (!g) return;
      var have = c.kitem.filter(function (x) { return x.knot === k.id && (A.kservable ? A.kservable(x) : true); }).length;
      if (g.st === "pending") out.push("ساختِ نمونه‌های ورزشِ «" + clip(k.name || "گره", 30) + "» هنوز در جریان است (" + String(g.at || "").slice(0, 16).replace("T", " ") + ") — نتیجه‌اش را وارسی کن");
      else if ((g.st === "failed" || !g.n) && !have) out.push("ساختِ نمونه‌های ورزشِ «" + clip(k.name || "گره", 30) + "» " + (g.st === "failed" ? "شکست خورد" + (g.err ? " (" + clip(g.err, 80) + ")" : "") : "هیچ نمونهٔ وارسی‌شده‌ای نساخت") + " — دوباره بساز یا «ساختِ ۴ نمونه»");
    });
    return out;
  }
  AS.tourOwedGen = owedGen;

  /* ---------- قاعده‌های تور برای مدل ---------- */
  AS.SYS += "\n" + [
    "# تور: مسئلهٔ چندوجهی",
    "- اگر حرفِ کاربر به بیش از یک بخش مربوط است (مثلاً هم گرهِ ذهنی، هم ادعایی برای سنجیدن، هم مسئلهٔ بزرگ، هم یادگیری، هم حوزه‌ای که نیست)، اول وجه‌ها را از هم جدا کن و یک بار {\"do\":\"tour_plan\",\"goal\":\"…\",\"facets\":[{\"key\":\"f1\",\"kind\":\"knot|claim|problem|learn|territory|other\",\"title\":\"…\",\"why\":\"چرا این وجه و چرا این‌جای ترتیب\",\"view\":\"…\",\"arg\":\"…\",\"sub\":\"…\",\"steps\":[\"…\"]}]} بده. وجه‌ها را به همان ترتیبی بچین که باید طی شود. اگر «# تور» از پیش هست و موضوعِ تازه‌ای آمد، فقط وجه‌های تازه را با کلیدهای تازه (پس از آخرین کلید) بده — وجهِ انجام‌شده هرگز عوض نمی‌شود.",
    "- پوشش از راهِ «غربالِ لایه‌ها» (پایین): هر لایهٔ found یک ریشه است و وجه‌ها از ریشه‌ها ساخته می‌شوند، نه از هر جنبهٔ سطحیِ حرف (کارزارِ آزمون: «هر جنبه یک وجه» تور را پخش کرد). تصمیمی که به حرف بند است ⇒ فقط اگر ریشه‌اش در قلمروِ تصمیم است، kind=area با حوزهٔ s_decision؛ دیگران درگیرند ⇒ ریشه‌اش (اغلب خانوادهٔ اجتماعی یا باور دربارهٔ خود) در گره‌گشا، و حوزهٔ s_social فقط برای ابزارِ خودش؛ «این نوع را یاد بگیرم» ⇒ learn؛ «نفهمیدم» ⇒ prereq و learn؛ معنا، ارزش، هویت ⇒ حوزهٔ s_self (ابزارش «🧭 ارزش‌ها و معنا»، نمای vals). kind=problem فقط برای یک مسئلهٔ مشخص که در «مسئله‌های بزرگ» وارد می‌شود؛ تمرینِ حرکت‌ها یا خانواده‌های گیر ⇒ learn یا other با گام‌های خودش. حرفِ کاربر دربارهٔ تمرینی که «کرد» را با صفحه بسنج. kind=learn فقط برای یک موضوع در «موضوع‌ها»؛ دوره‌های آماده ⇒ other با گام. حوزه‌های قلمروِ معرفت‌شناسی (a_…) هم kind=area با همان شناسه‌اند؛ kind=territory فقط برای حوزه‌ای که نیست یا گامش ۰/۱ است و برگه‌اش با «facet» ثبت می‌شود. ترسِ زنجیره‌ای ⇒ kind=area با md_worry_uncertainty یا md_anxiety_fear و «⛓ زنجیرهٔ نگرانی»؛ پیش‌بینیِ زمان‌دار ⇒ «🎯 دفترِ پیش‌بینی». در وجهِ area دست‌کم یکی از ابزارهای خودِ همان حوزه را به کار ببر. وقتی کاربر نظرش را عوض کرد: tour_goal، وجه‌های بی‌ربط را با tour_skip و دلیل، و وجه‌های باز را با همان key و tour_plan به‌روز کن. «دیدنِ» یک نما وجه نیست. وجهِ area با \"area\":\"<شناسهٔ حوزه>\" ساخته می‌شود. اگر یافته‌ای را وجه نمی‌کنی، یک جمله بگو چرا. حوزه‌ای که کاربر همین حالا مستقیم درباره‌اش می‌پرسد و گامش ۰ یا ۱ است = «الان لازم دارد» ⇒ gap با kind=priority، و تا آن وقت از «# دانسته‌های قلمرو» آنچه هست بگو.",
    "- آزمونی که چند روز وقت می‌خواهد (مقایسهٔ دو روش، صبر تا رخداد) را بی‌موعد رها نکن: «⏳ آزمایشِ واقعی» ِ گره‌گشا یا «🎯 دفترِ پیش‌بینی» با موعد بساز تا در «امروز» بیاید.",
    "- ترتیب، به همین اولویت: (۱) ایمنی و حالِ کاربر؛ (۲) وابستگی: وجهی که خروجی‌اش ورودیِ دیگری است اول (ریشهٔ گیر پیش از شبیه‌سازِ همان مسئله؛ ریشهٔ یک ترس پیش از سنجشِ پیش‌بینی‌ای که از آن برخاسته — مگر تصمیمی همین روزها به آن پیش‌بینی بند باشد، که آن‌گاه سنجشِ ادعا اول)؛ (۳) آنچه زمان‌دار است زودتر؛ (۴) فهمیدنِ عمیقِ مفهومِ مشترک پیش از تمرینِ تخصصی؛ (۵) وجهِ territory جلوی بقیه را نمی‌گیرد: برایش gap با \"facet\":\"fN\" بده و ادامه بده. اگر ادعا از ریشهٔ گره درمی‌آید، پرونده‌اش را با دکمهٔ «🏭 این برداشت را در کارخانه بسنج» ِ خودِ گره‌گشا بساز — سامانه آن را به وجهِ ادعا وصل می‌کند؛ از میزِ کار دوباره نساز.",
    "- هر نوبت «# تور» را بخوان: روی وجهِ «◀ همین حالا» کار کن (go به نمای آن، فرم را پر کن، دکمه‌های غیرِ تصمیمی را بزن). وقتی نشانه‌هایش ✓ شد سامانه خودش به بعدی می‌رود؛ اگر کاربر می‌خواهد وجهِ دیگری را جلو بیندازد tour_focus. هرگز وجهی را بی‌صدا رها نکن: کنار گذاشتن فقط با tour_skip و دلیل؛ وجهِ تازه با tour_add.",
    "- «کامل شد» نگو: وقتی پایهٔ وجهی برپا شد بگو «پایه‌اش برپا شد و تا تسلط پیگیری می‌شود». هدفِ تور اگر عوض شد (وجهی کنار رفت یا تازه آمد) {\"do\":\"tour_goal\",\"goal\":\"…\"}.",
    "- تمرین برای روزهای آینده را خودِ بخش‌ها می‌سازند — مطمئن شو ساخته شود: گره ⇒ «ساختِ ۴ نمونه» یا «ساختِ نمونه با هوش مصنوعی» و یک آزمایشِ واقعی؛ مسئلهٔ بزرگ ⇒ «ساختِ ۴ مسئلهٔ هم‌ساختار + ۱ بدلی» و شبیه‌ساز؛ یادگیری ⇒ کارتِ مرور و «شروع چرخه از امروز»؛ ادعا ⇒ تاریخِ بازبینی در ایستگاهِ پایانی. شبیه‌سازِ مسئلهٔ خودش از موقعیتِ گره با «ساختنِ شبیه‌سازِ همین مسئله». ترس یا نگرانی از آینده ⇒ «⛓ زنجیرهٔ نگرانی» (view=chain؛ حلقه‌ها، احتمال‌ها، حلقه‌های در دستِ کاربر، موعدِ نتیجه)؛ پیش‌بینیِ زندگی ⇒ «🎯 دفترِ پیش‌بینی» (view=fcast)؛ رکوردِ ساخته‌شده را با tour_link به وجه وصل کن.",
    "- تصمیم‌های کاربر (ریشه را تأیید کن، تأییدِ مسئله، بپذیر/رد کن) را نزن: هایلایت کن و یک جمله بگو چرا تصمیم با خودِ اوست.",
    "- وجهِ territory پس از «ساخته و وارسی شد»: کاربر را به همان حوزه ببر (view=e_bt sub=terr) و یک جمله بگو چه ساخته شد و به کارِ او چه ربطی دارد؛ بعد یک موضوعِ یادگیری (topics) یا پروندهٔ سنجش (e_home) در همان حوزه بساز تا تمرینِ فاصله‌دار بگیرد — تا آن نشود وجه تمام نیست.",
    "- در سنجشِ ماندگاری (۳۰/۹۰ روز) فقط به ورزش بسنده نکن: همان موقعیتِ نخستِ کاربر را دوباره بسنج (همان پرسش‌های آغاز: هنوز پیش می‌آید؟ چند بار؟ شدتِ احساس — با همان مقیاسِ فرمِ گره‌گشا — چند است؟) و اگر زنجیرهٔ نگرانی دارد، احتمال‌های آن را با او دوباره پر کن. اگر موقعیت برگشته، آن را موقعیتِ تازهٔ همان گره ثبت کن (بازگشت)، حتی اگر ورزش درست بود.",
    "- «حل شد» را هرگز خودت یا از حرفِ کاربر اعلام نکن: فقط وقتی نشانه‌های «ورزیده شد» و «ماندگاری ۳۰/۹۰ روز» ✓ است. تا آن وقت بگو «در راهِ حل‌شدن» و آزمونِ بعدی کِی است.",
    "- وجهِ done با «پیگیریِ باز» یعنی پایه‌اش برپاست ولی تسلط کامل نیست: وقتی وجهِ «◀ همین حالا» نیست یا کاربر «[ادامهٔ تور]» گفت، او را سرِ نخستین پیگیریِ باز ببر (سفر تا آخر، آزمایشِ واقعی، شبیه‌ساز) تا همه ✓ شود.",
    "- شکلِ عملیات: {\"do\":\"tour_add\",\"facet\":{\"key\":\"f4\",\"kind\":\"area\",\"area\":\"sf_values\",\"title\":\"…\",\"why\":\"…\"}} · {\"do\":\"tour_skip\",\"facet\":\"f1\",\"why\":\"…\"} · {\"do\":\"tour_focus\",\"facet\":\"f2\"} · {\"do\":\"tour_done\",\"facet\":\"f2\",\"why\":\"…\"} · {\"do\":\"tour_link\",\"facet\":\"f2\",\"id\":\"<شناسهٔ رکورد>\"} · {\"do\":\"tour_goal\",\"goal\":\"…\"}. هر وجه title ِ گویا دارد (هرگز «گامِ دیگر»).",
    "- اگر برگه‌ای «ساخته و وارسی شد» ولی بعداً در خودِ صفحه می‌بینی هنوز کار نمی‌کند: {\"do\":\"tour_unverify\",\"facet\":\"fN\",\"why\":\"…\"} — وارسی پس گرفته و برگه دوباره باز می‌شود؛ برگهٔ تکراری نساز. پیش از پذیرفتنِ «انجام شد» ِ روتین برای خطای خودِ صفحه، اگر می‌توانی همان کار را در صفحه امتحان کن.",
    "- رکوردِ کاربر یا حوزهٔ موجودِ هم‌خوانِ قلمرو را با {\"do\":\"tour_link\",\"facet\":\"f2\",\"id\":\"<شناسهٔ رکورد یا حوزه>\"} به وجه وصل کن (برای حوزهٔ موجود برگه نخواه). «ثبت‌های تازه» را در یک جمله تأیید کن؛ «پیگیریِ بدهکار» را پیش از کارِ دیگر بگو."
  ].join("\n");

  /* «موفقیتِ کوچک» در کشوی تور (وجهِ مسئله): وقتی در سطحِ کنونی شکست بر موفقیت پیشی گرفت (AS.smallWin) — یک گامِ آسان‌ترِ واقعی، و پیوند به
     گره‌گشا اگر حسِ دلسردی/ترس تکرار می‌شود (خانوادهٔ «هیجان و انگیزه»). بی آستانهٔ قراردادی؛ پایین‌تر در همین فایل. */
  function smallWinRow(f) {
    if (f.kind !== "problem" || f.status === "skipped" || !AS.smallWin) return null;
    var ep = children(f).eprob[0], pid = ep && ep.p && ep.p.id, sw = pid && AS.smallWin(pid); if (!sw) return null;
    return h("div", { class: "small as-win", dir: "rtl" }, "🌱 در این سطح " + fa(sw.n - sw.k) + " گام از " + fa(sw.n) + " نشد؛ پیش از گامِ بعد یک موفقیتِ کوچک: ",
      h("button", { class: "linkish", type: "button", onclick: function () { A.go("e_prob", pid, "drills"); } }, "تمرین‌های هم‌خانواده"), " · ",
      h("button", { class: "linkish", type: "button", onclick: function () { A.simState = { pid: pid, lv: 1, order: "e2h", i: 0 }; A.go("e_prob", pid, "sim"); } }, "سطحِ آسان، از آسان‌ترین گام"), " · ",
      A.V.kcases ? h("button", { class: "linkish", type: "button", onclick: function () { A.go("kcases"); } }, "🪢 اگر این دلسردی تکرار می‌شود: گره‌گشا (هیجان و انگیزه)") : null);
  }

  /* تأییدِ خودِ کاربر برای وجهِ «گامِ دیگر» (data-own: دستیار نمی‌زندش) — تنها راهِ ✓ ِ گامی که داده‌ای در صفحه ندارد */
  function ownConfirm(s, f) {
    if (f.kind !== "other" || f.status === "skipped" || f.status === "done") return null;
    var sts = f.steps || [], box = h("div", { class: "small as-own", "data-own": "1", dir: "rtl" });
    function save() { f.userAt = nowIso(); S.put(s); try { AS.tourAfterTurn(s); } catch (e) { } S.put(s); AS.paint(); }
    sts.forEach(function (st, i) { if (st.done && st.by === "user") return;
      box.appendChild(h("button", { class: "btn ghost sm as-own-step", type: "button", "data-step": String(i + 1), onclick: function () { st.done = true; st.by = "user"; st.at = nowIso(); save(); } }, "✓ «" + clip(st.t, 40) + "» را خودم انجام دادم")); });
    if (!sts.length && !f.userDone) box.appendChild(h("button", { class: "btn ghost sm as-own-facet", type: "button", onclick: function () { f.userDone = nowIso(); save(); } }, "✓ این وجه را خودم انجام دادم"));
    return box.childNodes.length ? box : null;
  }
  /* ---------- کشوی تور ---------- */
  AS.tourDrawer = function (s) {
    // همان شمارشِ ایمیل: کنارگذاشته‌ها نه پیشرفت‌اند نه در مخرج (کارزارِ آزمون sc09: «۰ از ۴» با نوارِ پر)
    var t = T(s), pg = AS.progress(s) || { done: 0, all: 0 }, all = pg.all, done = pg.done;   // یک منبع با فهرستِ سشن، «امروز» و ایمیل
    var box = h("details", { class: "as-steps as-tour", open: store("tourOpen") === false ? null : true, ontoggle: function (e) { store("tourOpen", e.target.open); } },
      h("summary", {}, "🧭 تور · " + fa(done) + " از " + fa(all), h("span", { class: "as-bar" }, h("i", { style: { width: Math.round(100 * done / Math.max(1, all)) + "%" } }))));
    var ol = h("ol", { class: "as-tl" });
    t.facets.forEach(function (f) {
      var ms = milestones(f), pr = practice(f), K = KIND[f.kind], okN = ms.filter(function (m) { return m.ok; }).length;
      var open = f.status === "now" || (f.status === "blocked" && !f.blocked.verified && (f.blocked.checks || []).length);
      ol.appendChild(h("li", { class: "as-st as-facet " + f.status, "data-facet": f.key },
        h("details", { open: open ? true : null },
          h("summary", {},
            h("span", { class: "as-dot", "aria-hidden": "true" }, f.status === "done" ? "✓" : f.status === "now" ? "●" : f.status === "blocked" ? "⏳" : f.status === "skipped" ? "–" : "○"),
            h("b", {}, K.ic + " " + f.title), " ", h("span", { class: "small muted" }, (ST_FA[f.status] || f.status) + (ms.length ? " · " + fa(okN) + "/" + fa(ms.length) : ""))),
          h("ul", { class: "plain small as-ms" }, ms.map(function (m) { return h("li", { class: m.ok ? "ok" : "" }, (m.ok ? "✓ " : "○ ") + m.t); })),
          ownConfirm(s, f),
          smallWinRow(f),
          pr.length ? h("div", { class: "small as-pr" }, "📅 ", pr.map(function (p) { return h("button", { class: "linkish" + (p.overdue ? " bad" : ""), type: "button", onclick: function () { A.go(p.view, p.arg || null, p.sub || null); } }, p.t + " · " + A.fdate(p.due)); })) : null,
          f.blocked ? h("div", { class: "small as-blk" }, "🛎 برگهٔ #" + fa(f.blocked.number) + " — " + (f.blocked.verified ? "حوزه ساخته و وارسی شد" : "منتظرِ روتینِ مسئول") +
            (f.blocked.checks && f.blocked.checks.length ? " · " + fa(f.blocked.checks.length) + " بار پیگیری" : ""),
            !f.blocked.verified ? h("button", { class: "linkish", type: "button", onclick: function () { AS.tourCheckSheets(s, true).then(function () { AS.paint(); }); } }, " بررسیِ دوباره") : null,
            /* پس از وارسیِ درست: تیکِ تأییدِ برگه تصمیمِ خودِ مالک است (دستیار نمی‌زند؛ data-own) — تا روتینِ مسئول بفهمد جوابش پذیرفته شد
               (کارزارِ سوم v02: پس از ✅ برگه «پاسخ‌داده» می‌ماند و روتین خبردار نمی‌شد). یادداشتِ مالک برگه را دوباره باز می‌کند، پس یادداشت نه، تیک. */
            f.blocked.verified && !f.blocked.approvedAt && A.HOST && A.HOST.status ? h("button", { class: "btn sm", type: "button", "data-own": "1", onclick: function () {
              Promise.resolve(A.HOST.status(f.blocked.id, "approved")).then(function () { f.blocked.approvedAt = nowIso(); s.msgs.push({ role: "sys", at: nowIso(), text: "✔ برگهٔ #" + fa(f.blocked.number) + " را تأیید کردی؛ روتینِ مسئول در دورِ بعدش می‌بیند که پذیرفته شد." }); S.put(s); AS.paint(); },
                function (e) { A.toast("تأیید نشد: " + (AS.errText ? AS.errText(e) : e), "bad"); });
            } }, "✅ تأییدِ برگهٔ #" + fa(f.blocked.number)) : null) : null,
          f.view && f.status !== "skipped" ? h("button", { class: "linkish small", type: "button", onclick: function () { var vv = viewOf(f); A.go(vv.v, vv.a, vv.s); } }, "↗ رفتن به این بخش") : null)));
    });
    box.appendChild(ol);
    // نمودارِ پیشرفت (نشانه‌های ✓ در طولِ زمان) و مسیرِ واقعیِ وجه‌ها (کارزارِ سوم v06)
    var chart = AS.tourChart(s), path = AS.tourPathText(s);
    // جمع‌شده (کشو بلند نشود و پنجره سرریز نکند)؛ باز/بسته‌بودنش به یاد می‌ماند
    if (chart || path) box.appendChild(h("details", { class: "small as-tprog", dir: "rtl", open: store("tprogOpen") ? true : null, ontoggle: function (e) { store("tprogOpen", e.target.open); } }, h("summary", {}, "📈 پیشرفت در زمان و مسیرِ واقعی"),
      chart ? h("div", { class: "as-tchart", "aria-label": "نمودارِ پیشرفتِ تور" }, chart) : null, path ? h("div", { class: "as-tpath" }, "🚶 مسیرِ واقعی: ", path) : null));
    if (!t.masteredAt) box.appendChild(h("button", { class: "btn sm", type: "button", onclick: function () { AS.send("[ادامهٔ تور]"); } }, t.doneAt ? "▶ پیگیری تا تسلط" : "▶ ادامهٔ تور"));
    return box;
  };

  /* ---------- پیگیریِ برگه‌ها: تا درست‌ساختن، بعد بازکردنِ همان وجه ---------- */
  var VERIFY_SYS = "تو وارسی‌کنندهٔ دستیارِ صفحه هستی. دستیار برای حوزه/بخشی که نبود برگه‌ای ثبت کرده بود و روتینِ مسئول زیرش جواب داده است. با نقشهٔ کنونیِ سامانه (همان نسخه‌ای که الان در صفحه است) بسنج که آنچه خواسته شده **واقعاً و متناسب** ساخته شده یا نه: هست؟ جایش درست است؟ با بخش‌های مرتبط پیوند دارد؟ برای وجهِ کاربر کافی است؟ اگر برگه ابزار/نما/کاربرگِ تازه خواسته بود، فقط وقتی ok که همان ابزار واقعاً در «نقشهٔ سامانه» (نماها، VIEW_META، ابزارهای حوزه در قلمرو) دیده شود — بالا رفتنِ عددِ گام یا خالی‌شدنِ «کمبود» بی ابزارِ واقعی کافی نیست. اگر روتین می‌گوید ساخته و کامیت داده ولی در نقشه هیچ اثری نیست، شاید نسخهٔ تازه هنوز منتشر نشده: lag=true. فقط JSON: {\"ok\":true|false,\"lag\":false,\"reason\":\"یک تا سه جمله\",\"followup\":\"اگر ok=false: یادداشتِ دقیق برای روتین زیرِ همان برگه — چه کم است، کجا، چطور، با چه شاهدی؛ مؤدب و فنی\"}";
  AS.VERIFY_SYS = VERIFY_SYS;
  var MAX_FOLLOW = 4, lastSweep = 0;
  function reviewerNotes(rep) { return (rep.notes || []).filter(function (n) { return n.by === "reviewer"; }); }
  AS.tourCheckSheets = function (s, force) {
    if (!(A.HOST && A.HOST.sheet)) return Promise.resolve();
    var t = T(s); if (!t) return Promise.resolve();
    var todo = t.facets.filter(function (f) { return f.status === "blocked" && f.blocked && f.blocked.id && !f.blocked.verified; });
    var chain = Promise.resolve();
    todo.forEach(function (f) {
      chain = chain.then(function () {
        return Promise.resolve(A.HOST.sheet(f.blocked.id)).then(function (rep) {
          if (!rep) return;
          var rv = reviewerNotes(rep), last = rv[rv.length - 1];
          if (!last || !(rep.status === "answered" || rep.status === "approved")) return;   // هنوز جوابی نیامده
          if (!force && last.id === f.blocked.seenNote) return;                            // همین جواب را دیده‌ایم
          if (!force && f.blocked.lagAt && A._loadedAt && A._loadedAt <= f.blocked.lagAt) return;     // «شاید منتشر نشده»: پس از تازه‌کردن
          if (A._loadedAt && Date.parse(last.at || 0) > A._loadedAt) {
            if (f.blocked.reloadAsked !== last.id) { f.blocked.reloadAsked = last.id; s.msgs.push({ role: "sys", at: nowIso(), text: "🛎 روتین زیرِ برگهٔ #" + fa(f.blocked.number) + " جواب داد. صفحه را یک بار تازه کن (نسخهٔ تازهٔ سامانه) تا ساخته‌شده را با خودِ سامانه بسنجم." }); S.put(s); }
            return;
          }
          f.blocked.seenNote = last.id;
          var u = "# نقشهٔ کنونیِ سامانه\n" + AS.manifest() + "\n\n" + (A.SYST && A.SYST.knowledge ? A.SYST.knowledge({ know: (f.area ? [f.area] : []).concat(String(f.blocked.title + " " + (rep.text || "")).match(/\b[a-z]{2}_[a-z_]+\b/g) || []).slice(0, 5) }, f.blocked.title) + "\n\n" : "") + "# برگه (کمبودی که دستیار ثبت کرد)\n" + (f.blocked.title || "") + "\nقلمرو: " + (f.blocked.area || "") +
            "\nوجهِ کاربر: " + f.title + (f.why ? " — " + f.why : "") + "\n\n# جواب‌های روتین زیرِ برگه\n" + rv.map(function (n) { return "- (" + (n.outcome || "") + ") " + clip(n.text, 2500) + ((n.commits || []).length ? " — کامیت‌ها: " + n.commits.join("، ") : ""); }).join("\n") +
            "\n\n# پیگیری‌های قبلیِ دستیار\n" + (f.blocked.checks || []).map(function (c) { return "- " + c.at.slice(0, 10) + " " + (c.ok ? "درست" : "ناقص") + ": " + clip(c.reason, 300); }).join("\n");
          return A.callAI(VERIFY_SYS, u, { task: "learning_architecture", maxTokens: 3000 }).then(function (txt) {
            var o = (A.parseJSONLoose || JSON.parse)(typeof txt === "object" ? txt.text : txt);
            var lagN = f.blocked.checks.filter(function (c) { return c.lag && c.note === last.id; }).length;
            if (!o.ok && o.lag === true && lagN < 2) {
              // شاید هنوز منتشر نشده: برگه را بی‌جهت دوباره باز نکن — دفعهٔ بعد (پس از تازه‌کردن) دوباره بسنج؛ حداکثر دو بار
              f.blocked.checks.push({ at: nowIso(), ok: false, lag: true, reason: clip(o.reason, 500), note: last.id });
              f.blocked.seenNote = ""; f.blocked.reloadAsked = "";
              s.msgs.push({ role: "sys", at: nowIso(), text: "⏳ روتین برای برگهٔ #" + fa(f.blocked.number) + " جواب داده ولی ساخته‌اش هنوز در سامانه دیده نمی‌شود — شاید نسخهٔ تازه هنوز منتشر نشده. کمی بعد صفحه را تازه کن؛ دوباره می‌سنجم." });
              f.blocked.lagAt = Date.now();   // تا تازه‌کردنِ بعدیِ صفحه دوباره نسنج
              return;
            }
            f.blocked.checks.push({ at: nowIso(), ok: !!o.ok, reason: clip(o.reason, 500), note: last.id });
            if (o.ok) {
              f.blocked.verified = true; f.status = f.status === "blocked" ? "todo" : f.status;
              var cur0 = current(s);
              s.msgs.push({ role: "sys", at: nowIso(), text: "✅ حوزهٔ برگهٔ #" + fa(f.blocked.number) + " ساخته شد و درستی‌اش را سنجیدم: " + clip(o.reason, 300) + (A.HOST && A.HOST.status ? " — اگر تو هم قبول داری، در کشوی تور «✅ تأییدِ برگه» را بزن تا روتینِ مسئول بداند پذیرفته شد." : "") +
                (cur0 && cur0 !== f ? " — وجهِ «" + f.title + "» دوباره در صفِ تور است و پس از «" + cur0.title + "» طی می‌شود؛ اگر می‌خواهی همین حالا، بگو «اول حوزهٔ تازه»." : " — حالا وجهِ «" + f.title + "» را با هم طی می‌کنیم.") });
              advance(s);
            } else if (f.blocked.checks.filter(function (c) { return !c.ok && !c.lag; }).length > MAX_FOLLOW) {
              s.msgs.push({ role: "sys", at: nowIso(), text: "⚠️ برگهٔ #" + fa(f.blocked.number) + " پس از " + fa(MAX_FOLLOW) + " بار پیگیری هنوز درست نشده — این را خودت ببین (" + clip(o.reason, 200) + ")." });
            } else {
              var note = "[دستیار · پیگیریِ برگه — بار " + fa(f.blocked.checks.length) + "]\nآنچه ساخته شد با خواسته و وجهِ کاربر نمی‌خواند:\n" + clip(o.reason, 1500) + "\n\n" + clip(o.followup || "", 4000) +
                "\n\nروال: همان بخشِ «هماهنگی میانِ روتین‌ها» (precheck ⇒ دستورِ روتینِ مالکِ قلمرو ⇒ دست‌به‌دست). این یادداشت برگه را دوباره باز کرد.";
              return Promise.resolve(A.HOST.note(f.blocked.id, note)).then(function () {
                s.msgs.push({ role: "sys", at: nowIso(), text: "↩ برگهٔ #" + fa(f.blocked.number) + " را با دلیل دوباره باز کردم: " + clip(o.reason, 200) });
              });
            }
          }, function (e) { f.blocked.seenNote = ""; s.msgs.push({ role: "sys", at: nowIso(), text: "وارسیِ برگهٔ #" + fa(f.blocked.number) + " نشد: " + AS.errText(e) }); });
        }, function () { });
      });
    });
    return chain.then(function () { S.put(s); });
  };
  /* جاروی دوره‌ای: هنگامِ رسمِ صفحه، حداکثر هر ۲۰ دقیقه، برای همهٔ سشن‌های تور‌دار */
  A._loadedAt = A._loadedAt || Date.now();
  AS.tourSweep = function (force) {
    if (!force && Date.now() - lastSweep < 20 * 60000) return Promise.resolve();
    lastSweep = Date.now();
    var ss = S.all("achat", function (x) { return x.tour && x.tour.facets.some(function (f) { return f.status === "blocked"; }); });
    return ss.reduce(function (p, s) { return p.then(function () { return AS.tourCheckSheets(s); }); }, Promise.resolve()).then(function () { if (ss.length) AS.paint(); });
  };

  /* ---------- «امروز»: ادامهٔ تور و خبرِ ساخته‌شدنِ حوزه ---------- */
  /* «امروز اینجا بودی؟» = آخرین پیامِ خودِ کاربر — نه s.updated (ذخیره‌های پس‌زمینه مثلِ گزارشِ ایمیلی آن را جلو می‌برند) */
  function lastUser(s) { var m = (s.msgs || []).filter(function (x) { return x.role === "user"; }).slice(-1)[0]; return (m && m.at) || s.created || ""; }
  function openTour(s, f) { store("cur", s.id); if (f && f.view) A.go(f.view, f.arg || null, f.sub || null); AS.toggle(true); }
  if (typeof A.dueList === "function" && !A.dueList._tour) {
    var rawDueT = A.dueList;
    A.dueList = function () {
      var items = rawDueT.apply(this, arguments) || [];
      S.all("achat", function (x) { return x.tour && !x.tour.doneAt; }).forEach(function (s) {
        var f = current(s) || s.tour.facets.filter(function (x) { return x.status === "todo"; })[0];
        var ready = s.tour.facets.filter(function (x) { return x.blocked && x.blocked.verified && x.status === "todo"; })[0];
        if (ready) items.unshift({ k: "warn", txt: "🛎 حوزهٔ «" + clip(ready.blocked.title || ready.title, 50) + "» ساخته شد — ادامهٔ تور", sub: "تورِ «" + clip(s.title || s.pinned || "دستیار", 40) + "»", go: function () { openTour(s, ready); } });
        else if (f && A.localDay(lastUser(s)) !== A.today()) items.push({ k: "p", txt: "🧭 ادامهٔ تورِ «" + clip(s.title || s.pinned || "دستیار", 40) + "» (" + AS.progressText(s) + ")", sub: "وجهِ بعد: " + clip(f.title, 60), go: function () { openTour(s, f); } });
      });
      // پس از نشانهٔ پریشانی: فردای آن (و تا ۷ روز، اگر کاربر برنگشته) یک پرسشِ آرامِ حال، با خطِ کمک
      // فقط وقتی نشانه هنوز فعال است (AS.safetyActive): پس از انکارِ صریحِ خودِ کاربر دیگر نمی‌پرسد (بازبینیِ متقابلِ ۲۰۲۶-۱۰-۱۵)
      S.all("achat", function (x) { return (AS.safetyActive ? AS.safetyActive(x) : x.safetyAt) && A.today() > String(x.safetyAt).slice(0, 10) && A.daysBetween(String(x.safetyAt).slice(0, 10), A.today()) <= 7 && A.localDay(lastUser(x)) !== A.today(); }).forEach(function (s) {
        items.unshift({ k: "warn", txt: "🤝 حالت امروز چطور است؟", sub: "اگر سخت است، همین حالا با یک نفر حرف بزن — " + clip(A.KHELP || "", 90), go: function () { openTour(s, null); } });
      });
      // سنجشِ ماندگاری (۳۰ و ۹۰ روز پس از ورزیدگی): یک ورزشِ سرد؛ پاسخِ درست ⇒ ✓، بازگشت ⇒ گره دوباره باز
      S.all("achat", function (x) { return x.tour && !x.tour.masteredAt; }).forEach(function (s) {
        s.tour.facets.forEach(function (f) {
          if (f.kind !== "knot" || f.status === "skipped") return;
          children(f).knot.forEach(function (k) {
            var n = HOLD.filter(function (d) { return knotSolved(k) && A.today() >= plusDays(k.solvedAt, d) && !knotHeld(k, d); })[0];
            if (n) items.push({ k: "warn", txt: "🔁 سنجشِ ماندگاریِ «" + clip(k.name || k.title || "گره", 40) + "» (" + fa(n) + " روز)", sub: "یک ورزشِ سرد، بی مرور — اگر درست بود، حل‌شدن تأیید می‌شود", go: function () { A.go("kpractice", k.id, null); } });
          });
        });
      });
      // پس از طیِ ترتیب: پیگیری تا تسلطِ کامل (نخستین نشانهٔ باز)
      S.all("achat", function (x) { return x.tour && x.tour.doneAt && !x.tour.masteredAt; }).forEach(function (s) {
        var f = s.tour.facets.filter(function (x) { return followups(x).length; })[0]; if (!f || A.localDay(lastUser(s)) === A.today()) return;
        items.push({ k: "p", txt: "🧭 پیگیریِ تورِ «" + clip(s.title || s.pinned || "دستیار", 40) + "» تا تسلط", sub: "«" + clip(f.title, 40) + "»: " + clip(followups(f)[0].t, 60), go: function () { openTour(s, f); } });
      });
      return items;
    };
    A.dueList._tour = true;
  }
  /* یادآور (همان کانال‌هایی که برای گره‌ها انتخاب کرده‌ای): فردا، اگر تور نیمه‌کاره است */
  function syncReminder(s) {
    if (!(A.HOST && A.HOST.remind)) return;
    // همان پیش‌فرضِ گره‌گشا (a17 kset): هر کانال روشن است مگر صریحاً خاموش شده باشد — پیش‌تر «تعریف‌نشده» خاموش شمرده می‌شد و یادآورِ تور هرگز نمی‌رفت
    var n0 = ((S.settings().knots || {}).notify) || {}, n = { telegram: n0.telegram !== false, email: n0.email !== false, hour: n0.hour }, key = "tour:" + s.id;
    var open = s.tour && ((!s.tour.doneAt && s.tour.facets.some(function (f) { return f.status === "now" || f.status === "todo"; })) || (s.tour.doneAt && !s.tour.masteredAt && !mastered(s.tour)));
    try {
      if (open && !n.telegram && !n.email && !s.remOffSaid) { s.remOffSaid = nowIso(); (s.msgs = s.msgs || []).push({ role: "sys", at: nowIso(), text: "🔕 یادآورها خاموش است (تلگرام و ایمیل، در تنظیماتِ گره‌گشا) — پیگیریِ این تور فقط در «امروز» می‌آید؛ اگر یادآور می‌خواهی، یکی را روشن کن." }); }
      if (!open || (!n.telegram && !n.email)) { if (A.HOST.unremind && s._rem) { A.HOST.unremind(key); s._rem = false; } return; }
      var f = current(s) || s.tour.facets.filter(function (x) { return x.status === "todo"; })[0] || s.tour.facets.filter(function (x) { return followups(x).length; })[0];
      // یادآور برای نزدیک‌ترین تمرین/موعدِ همین تور (بازبینیِ پرونده، آزمایشِ واقعی، زنجیره، پیش‌بینی، …) — نه فقط «فردا» (کارزارِ آزمون: موعدِ بازبینی یادآور نداشت)
      var tom = A.addDays(A.today(), 1), nx = [];
      s.tour.facets.forEach(function (x) { if (x.status !== "skipped") practice(x).forEach(function (p) { if (p.due && p.due >= tom) nx.push(p); }); });
      // موعدِ گذشته (مثلاً بازبینیِ پرونده که رسید و ثبت نشد) جلوتر از همه یادآوری می‌شود — فردا (کارزارِ v08: بازبینیِ پرونده رسید و رها شد)
      // بازبینیِ متقابلِ ۲۰۲۶-۱۰-۱۵: عقب‌افتاده‌ها جدا نگه داشته می‌شوند — مرتب به موعدِ اصلی (کهنه‌ترین اول)، همیشه در صدرِ متن، و وقتی
      // «فردا» یادآورِ گره دارد گم نمی‌شوند (پیش‌تر موعدشان «فردا» گذاشته می‌شد و با پوشیده‌بودنِ فردا از فهرست بیرون می‌افتادند)
      var od = [];
      s.tour.facets.forEach(function (x) { if (x.status !== "skipped") practice(x).forEach(function (p) { if (p.due && p.due < tom) od.push({ t: "عقب‌افتاده: " + p.t, due: tom, was: p.due, view: p.view, arg: p.arg }); }); });
      od.sort(function (a, b) { return String(a.was).localeCompare(String(b.was)); });
      nx.sort(function (a, b) { return String(a.due).localeCompare(String(b.due)); });
      // یک یادآور در روز (کارزارِ سوم v06: «ادامهٔ تور» و «knot:…» برای همان روز): روزی که یادآورِ ورزشِ گره دارد، یادآورِ تور نمی‌گیرد —
      // تور به نخستین موعدِ بی‌یادآورِ خودش می‌رود؛ اگر همه پوشیده‌اند، یادآورِ جدای تور برداشته می‌شود
      var covered = {}; try { var rk = ((S.settings().knots || {}).rk) || {}; Object.keys(rk).forEach(function (id) { if (rk[id]) covered[String(rk[id]).slice(0, 10)] = 1; }); } catch (e) { }
      // عقب‌افتاده هست ⇒ نخستین روزِ بی‌یادآور از فردا (نه موعدِ تمرینِ آیندهٔ بعدی که شاید ماه‌ها بعد باشد) — هرگز بی‌صدا نمی‌ماند
      var cands = [];
      if (od.length) for (var di = 1; di <= 14 && !cands.length; di++) { var dd = A.addDays(A.today(), di); if (!covered[dd]) cands.push(dd); }
      if (!cands.length) cands = (s.tour.doneAt && nx.length ? [] : [tom]).concat(nx.map(function (p) { return p.due; })).filter(function (d) { return d && !covered[d]; });
      if (!cands.length) { if (A.HOST.unremind && s._rem) { A.HOST.unremind(key); s._rem = false; } return; }
      nx = od.map(function (p) { p.due = cands[0]; return p; }).concat(nx.filter(function (p) { return p.due >= cands[0]; }));
      var due = cands[0], remKey = due + "|" + (f ? f.key : "") + "|" + (nx[0] ? nx[0].t : ""); if (s._rem === remKey) return;   // متنِ کهنه هم بازنویسی می‌شود (کارزارِ آزمون sc13)
      var nextTxt = nx[0] ? (nx[0].was ? " " + (od.length > 1 ? fa(od.length) + " تمرینِ عقب‌افتاده؛ کهنه‌ترین" : "تمرینِ عقب‌افتاده") + ": «" + clip(nx[0].t.replace(/^عقب‌افتاده: /, ""), 60) + "» (موعدش " + (A.fdate ? A.fdate(nx[0].was) : nx[0].was) + " گذشت)." :
        " نزدیک‌ترین موعد: «" + clip(nx[0].t, 60) + "» (" + (A.fdate ? A.fdate(nx[0].due) : nx[0].due) + ").") : "";
      var tz = "UTC"; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) { }
      var pr = A.HOST.remind({ key: key, due_date: due, tz: tz, hour: n.hour == null ? 9 : n.hour, title: "معماری یادگیری — ادامهٔ تور",
        body: nextTxt.replace(/^ /, "") + (nextTxt ? " " : "") + (s.tour.doneAt ? "تورِ «" + clip(s.title || s.pinned || "دستیار", 60) + "» تا تسلطِ کامل پیگیری دارد" + (f && followups(f).length ? ": «" + clip(f.title, 50) + "» — " + clip(followups(f)[0].t, 60) : "") + ". با «💬 دستیار» ادامه بده." :
          "تورِ «" + clip(s.title || s.pinned || "دستیار", 60) + "» نیمه‌کاره است" + (f ? "؛ وجهِ بعد: «" + clip(f.title, 60) + "»" : "") + ". با «💬 دستیار» ادامه بده."),
        // پیوند به خودِ رکوردِ وجه (پرونده، گره، …)، نه نمای عمومی (کارزارِ آزمون sc18: ?tab=e_home)
        link: (function () { var vv = f ? viewOf(f) : { v: "home" }; return "?tab=" + encodeURIComponent(vv.v || "home") + (vv.a ? "&a=" + encodeURIComponent(vv.a) : "") + (vv.s ? "&sub=" + encodeURIComponent(vv.s) : ""); })(), channels: { telegram: !!n.telegram, email: !!n.email } });
      if (pr && pr.catch) pr.catch(function () { });
      s._rem = remKey;
    } catch (e) { }
  }
  /* ---------- وجهِ ایستاده: یادآور روی نردبانِ خودِ سامانه (تورِ پولیا s14: ۹ روز بی پیشرفت و بی یادآور) ----------
     بی آستانهٔ تازه: از آخرین پیشرفتِ همین وجه (نشانهٔ ✓ ِ تازه یا آغازِ وجه) روی همان نردبانِ ۱/۳/۷/۲۱/۶۰ ِ مرورِ فاصله‌دار (A.solveUI.LADDER)؛
     روزی که تمرینِ زمان‌بندی‌شدهٔ خودِ وجه (practice) یا یادآورِ گره دارد، یادآورِ جدا نمی‌گیرد. هر پله یک یادآورِ یک‌باره (کلیدِ جدا) است
     تا حتی اگر کاربر صفحه را باز نکند، پله‌های بعد هم برسند؛ با نخستین پیشرفت همه برداشته و از نو چیده می‌شوند. */
  var STALL_LADDER = (A.solveUI && A.solveUI.LADDER) || [1, 3, 7, 21, 60];
  function facetProgAt(s, f) {
    var okN = milestones(f).filter(function (m) { return m.ok; }).length, P = f.prog = f.prog || {};
    if (P.n == null) { P.n = okN; P.at = f.startedAt || f.createdAt || nowIso(); }
    else if (P.n !== okN) { P.n = okN; P.at = A.today(); }
    return String(P.at || f.startedAt || f.createdAt || nowIso()).slice(0, 10);
  }
  AS.tourStallSync = function (s) {
    var t = s && s.tour; if (!t) return [];
    var f = current(s), old = (s._stall && s._stall.keys) || [], want = [];
    var n0 = ((S.settings().knots || {}).notify) || {}, ch = { telegram: n0.telegram !== false, email: n0.email !== false };
    if (f && !t.doneAt && (ch.telegram || ch.email)) {
      var base = facetProgAt(s, f), tom = A.addDays(A.today(), 1), own = {}, covered = {};
      practice(f).forEach(function (p) { if (p.due) own[p.due] = 1; });
      try { var rk = ((S.settings().knots || {}).rk) || {}; Object.keys(rk).forEach(function (id) { if (rk[id]) covered[String(rk[id]).slice(0, 10)] = 1; }); } catch (e) { }
      var next = followups(f).filter(function (m) { return m.core; })[0] || followups(f)[0];
      // موعدِ خودِ کاربر در همین سشن (آزمون، تحویل) سقف است: یادآورِ «ایستاده» پس از آن فقط نویز است (تورِ پولیا دورِ ۲، rerunB s14)
      var dls = S.all("deadline", function (x) { return x && x.sess === s.id && x.date; }).map(function (x) { return x.date; }).sort(), cap = dls.length ? dls[dls.length - 1] : "";
      STALL_LADDER.forEach(function (d) { var day = A.addDays(base, d); if (day >= tom && (!cap || day <= cap) && !own[day] && !covered[day] && want.length < 2) want.push({ day: day, d: d }); });
      want = want.map(function (w) { return { key: "tourstall:" + s.id + ":" + w.day, day: w.day, body: "وجهِ «" + clip(f.title, 60) + "» از " + (A.fdate ? A.fdate(base) : base) + " پیشرفتی نداشته" + (next ? "؛ گامِ بعدش: «" + clip(next.t, 70) + "»" : "") + ". یک گامِ کوچک بس است — با «💬 دستیار» ادامه بده." }; });
    }
    var keep = want.map(function (w) { return w.key; });
    if (A.HOST && A.HOST.unremind) old.forEach(function (k) { if (keep.indexOf(k) < 0) try { Promise.resolve(A.HOST.unremind(k)).catch(function () { }); } catch (e) { } });
    if (A.HOST && A.HOST.remind) {
      var tz = "UTC"; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) { }
      want.forEach(function (w) { if (old.indexOf(w.key) >= 0) return; var vv = viewOf(f);
        try { Promise.resolve(A.HOST.remind({ key: w.key, due_date: w.day, tz: tz, hour: n0.hour == null ? 9 : n0.hour, title: "معماری یادگیری — وجهی که ایستاده", body: w.body,
          link: "?tab=" + encodeURIComponent(vv.v || "home") + (vv.a ? "&a=" + encodeURIComponent(vv.a) : ""), channels: ch })).catch(function () { }); } catch (e) { } });
    }
    s._stall = { keys: keep, at: nowIso() };
    return want;
  };
  var lastStall = 0;
  var rawRenderT = A.render;
  A.render = function () {
    rawRenderT.apply(this, arguments);
    try { if (A.HOST && A.HOST.sheet && A.S.loaded) AS.tourSweep(); } catch (e) { console.error(e); }
    // یک بار در ساعت: یادآورهای وجه‌های ایستاده برای همهٔ تورهای باز
    try { if (A.HOST && A.HOST.remind && A.S.loaded && Date.now() - lastStall > 3600e3) { lastStall = Date.now(); S.all("achat", function (x) { return x.tour && !x.tour.doneAt; }).forEach(function (x) { AS.tourStallSync(x); S.put(x); }); } } catch (e) { console.error(e); }
  };

  /* ---------- معلمِ حلِ مسئله: یک پرسش در هر نوبت، متناسب با مرحله، بی لودادن؛ بازنگری پس از «حل شد»؛ موفقیتِ کوچک ----------
     مالک (۲۰۲۶-۱۰-۱۵): «سیستم … حسبِ آن مسئله خودش از دلِ تونل‌های لازم بگذرد» — این بخش زیرسامانهٔ جدا نیست: فقط وقتی کاربر واقعاً
     دارد مسئله‌ای حل می‌کند (شبیه‌ساز/صفحهٔ یک مسئله، موقعیتِ گره‌گشا از نوعِ مسئله، «بیان دیگر» در حالتِ مسئله، یا وجهِ «مسئله» ِ تور
     همین حالا) قاعده‌ها را به نوبتِ دستیار می‌افزاید (AS.promptHooks؛ پرامپتِ سامانه دست نمی‌خورد). داده: فهم و بازنگری روی رکوردِ همان
     مسئله (eprog_<pid>.tut | kcase.tut | داده‌های «بیان دیگر») ثبت می‌شود و پاسخِ بازنگری یک کارتِ مرور می‌سازد (تکرارِ فاصله‌دار). */
  var TQ = {
    und: { fa: "فهمِ مسئله", qs: ["مجهول (یا حکمی که باید ثابت شود) چیست؟", "داده‌ها (یا فرض) چیست؟", "شرط چیست؟ می‌توانی بخش‌هایش را جدا بنویسی؟", "آیا شرط برای تعیینِ مجهول کافی است؟ زائد است؟ متناقض است؟", "شکلی بکش یا نام‌گذاریِ مناسبی بکن؛ مسئله را به زبانِ خودت دوباره بگو.", "چه؟ چرا؟ کجا؟ کی؟ چگونه؟ — کدام‌یک دربارهٔ این مسئله هنوز بی‌پاسخ است؟"] },
    plan: { fa: "طرح‌ریزی", qs: ["پیش‌تر همین را — یا همین را به شکلِ کمی دیگر — دیده‌ای؟", "به مجهول نگاه کن: مسئلهٔ آشنایی با همین مجهول، یا مجهولِ مشابه، می‌شناسی؟", "می‌توانی مسئله را به شکلِ دیگری بیان کنی؟ به تعریف‌ها برگرد.", "از خواسته به عقب: فرض کن حل شده — یک گام مانده به آخر چه وضعی بود که از آن به خواسته می‌رسیدی؟ و آن وضع از کجا؟", "اگر نمی‌توانی همین را حل کنی، مسئلهٔ مرتبطِ ساده‌تری را حل کن: حالتِ خاص‌تر؟ کلی‌تر؟ فقط بخشی از شرط را نگه دار.", "همهٔ داده‌ها و کلِ شرط را به کار بردی؟ همهٔ مفهوم‌های اساسیِ مسئله را در نظر گرفتی؟"] },
    exec: { fa: "اجرای طرح", qs: ["هر گام را وارسی کن: روشن می‌بینی که این گام درست است؟", "می‌توانی ثابت کنی که درست است (کدام مقدمه آن را لازم می‌آورد)؟"] },
    back: { fa: "بازنگری", qs: ["می‌توانی نتیجه را وارسی کنی — در حالتی خاص یا حدی، با ابعاد یا تقارن؟ همهٔ داده‌ها در جواب آمده‌اند؟", "می‌توانی استدلال را در نقطه‌های حساسش وارسی کنی؟", "می‌توانی نتیجه را از راهِ دیگری به دست آوری؟ می‌توانی آن را در یک نگاه ببینی؟", "می‌توانی نتیجه یا روش را در مسئلهٔ دیگری به کار ببری؟ یک مسئلهٔ تازه بساز.", "این نوع مسئله برایت چطور بود — کدام بخشش را دوست داشتی و کدامش را نه؟ (شناختنِ نوعِ مسئله‌هایی که با سلیقه و توانت می‌خواند)"] }
  };
  AS.tutorQuestions = TQ;
  var SOLVED_RE = /حل[\s‌]*ش?[\s‌]*(?:شد(?!ه)|کردم)|جواب(?:ش)?[\s‌]*(?:رو|را)?[\s‌]*(?:پیدا[\s‌]*کردم|گرفتم|درآوردم)|ثابت(?:ش)?[\s‌]*کردم/;
  /* تورِ پولیا دورِ ۴ (E1، پشتیبان): «غلطه»، «اشتباهه»، «… نمی‌شه!» (s14) هم «حل نشد» اند */
  var UNSOLVED_RE = /حل[\s‌]*نشد|اشتباه[\s‌]*(?:بود|کردم|شد)|غلط[\s‌]*(?:بود|درآمد)|دوباره[\s‌]*(?:حل|امتحان|شروع)|غلطه|اشتباهه|نمی[‌\s]?شه\s*!/;
  var EXEC_RE = /محاسبه\s*(?:کردم|کردیم)|دارم\s*محاسبه|حساب\s*کردم|نوشتم(?:\s*که|\s*[:：]|:)|گامِ?\s*(?:بعد(?:ی)?\s*(?:اینه|این است)|(?:اول|۱|1)\s*[:،])|دارم\s*(?:حل|ثابت)\s*می‌?کنم/;
  /* تورِ پولیا دورِ ۳ (B6): «نتیجه را گفت» در شکل‌های گفتاری — «رسیدم به ۱۳»، «جواب اینه»، «تموم شد.» (پایانِ جمله، نه «۷ که تموم شد»)، «پس ثابت شد»، «پیداش کردم» ⇒ بازنگری، هرگز «گیر» */
  var RESULT_STRONG = /رسید(?:م|یم)?\s*به\s*(?:[0-9۰-۹a-zA-Z(]|جواب|نتیجه|این\s*که|اینکه)|به\s*[0-9۰-۹][^\s]*\s*رسید(?:م|یم)|جواب(?:ش|م)?\s*(?:اینه|این است|می[‌\s]?شه|می[‌\s]?شود|شد(?!ه))|(?:^|[\s.!،؛])تموم\s*شد\s*(?:[.!…]|$)|(?:پس|و)\s*ثابت\s*شد(?!ه)|پیداش\s*کردم|(?:^|[\s.!،؛])حل\s*شد(?:ه)?\s*(?:[.!…]|$)|جواب(?:ش|م)?\s*[:：]?\s*[0-9۰-۹\-−]|رسید(?:م|یم)?\s*به\s*[^\s.،؟?]{1,15}\s*[0-9۰-۹]|تموم\s*شد\s*دیگه|پرونده\s*(?:رو|را)\s*بست(?:م|یم)|خودم\s*ساختمش|(?:[0-9۰-۹]+|دو|سه|چهار|پنج)\s*تا\s*جواب\s*(?:داره|دارد|درآمد|پیدا\s*کردم)|(?:⇒|=>|→)\s*[0-9۰-۹]+(?:[/.,٫][0-9۰-۹]+)?\s*(?:[.!…]|$)|(?:^|[\s.!،؛:…])یعنی\s+[0-9۰-۹]+(?:[/.,٫][0-9۰-۹]+)?\s*!/;   // دورِ ۶ (G4، s28، s36): «⇒ ۱۳/۲۷»، «یعنی ۱/۳!»
  /* دورِ ۷ (H1، s28): «پس + عدد» («پس X = …»، «پس فقط ۳»، «پس ۵۵ دقیقه»، «پس ۱/۲») فقط وقتی نتیجه است که مسئله گفته و فهمیده شده (طرح/اجرا/بازنگری) —
     در گشایشی که مسئله را می‌سازد یا در فهم، همان ادعا/حدسِ اوست («… پس ۱/۲. ثبتش کن»)، نه نتیجهٔ حل */
  var RESULT_WEAK = /(?:^|[\s.!،؛:])پس\s+[^\s=]{1,20}\s*=\s*[0-9۰-۹a-zA-Z(\-−]|(?:^|[\s.!،؛:])پس\s+[^\s=]{1,20}\s+(?:یا\s+)?[0-9۰-۹]+(?:[.,٫/][0-9۰-۹]+)?(?:\s*یا\s*[0-9۰-۹]+(?:[.,٫/][0-9۰-۹]+)?)+|(?:^|[\s.!،؛:])پس\s+(?:فقط|تنها)\s+[\-−]?[0-9۰-۹]+(?:[/.,٫][0-9۰-۹]+)?\s*(?:[.!…]|$)|(?:^|[\s.!،؛:])پس\s+[0-9۰-۹]+(?:[/.,٫][0-9۰-۹]+)?\s*[^\s.،؛!؟?=]{0,12}\s*(?:[.!،…]|$)/;
  var RESULT_RE = new RegExp(RESULT_STRONG.source + "|" + RESULT_WEAK.source);
  /* دورِ ۴ (E1، پشتیبان): «جواب ۱.۳»، «پس حجم = …»، «رسید به عرض ۴»، «تموم شد دیگه»، «پرونده رو بستم»، «خودم ساختمش»، «سه تا جواب داره» هم نتیجه‌اند */
  /* بازنگریِ خودش (درس/وارسی/راهِ دیگر) — نشانهٔ «پس از حل» */
  var LOOK_RE = /درس(?:م|ش|ی\s*که\s*گرفتم)?\s*(?:اینه|این است|این بود)|وارسی\s*(?:هم\s*)?(?:کردم|کردیم)|از\s*راهِ?\s*دیگه?(?:‌ای|ی)?\s*هم\s*(?:رسیدم|حل|ثابت)/;
  /* تورِ پولیا دورِ ۵ (F1، عدم‌تقارنِ خطا): نتیجه فقط وقتی «گفته شد» که پس از آن دنباله‌ای نیامده باشد — «پس V = … حالا دیگه فقط y داره» گامِ میانی است (s18)،
     «باغچه تموم شد. حالا حوض…» مسئلهٔ تازه (s29). خواندنِ نادرستِ «نتیجه گفت» پرسشِ پولیا را بی‌صدا می‌پراند (زیان‌بار)؛ خواندنِ نادرستِ «هنوز نه» فقط دوباره می‌پرسد (بی‌زیان). */
  var CONT_RE = /(?:^|[\s.،؛!:])(?:حالا|بعد(?:ش)?(?=\s)|دیگه\s*فقط|فقط\s*مونده|مونده\s*(?:که|تا)|باید\s)/;
  /* دورِ ۶ (G4، s32): بستنِ پرونده/«حل شد/تموم شد» میانی نیست — «… پرونده رو بستم. حالا متنِ گزارش…» کارِ تازه است، نه ادامهٔ همان حساب (دنباله فقط «پس X = …» را میانی می‌کند) */
  var CLOSE_RE = /پرونده\s*(?:رو|را)\s*بست|حل\s*شد|تموم\s*شد|ثابت\s*شد|پیداش\s*کردم/;
  function resultNow(t, weakOk) { t = String(t || ""); var g = new RegExp((weakOk === false ? RESULT_STRONG : RESULT_RE).source, "g"), m, ok = false; while ((m = g.exec(t))) { if (CLOSE_RE.test(m[0]) || !CONT_RE.test(t.slice(m.index + m[0].length))) ok = true; if (!m[0].length) g.lastIndex++; } return ok; }
  /* «ثابت شد» از چند شکل/نمونه، بی هیچ استدلالی ⇒ ادعا («برهانش؟»)، نه نتیجه (s03، s14؛ B162، C145) */
  var EVID_RE = /(?:شکل|مثال|حالت|نمونه)(?:‌ها|ها)?\s*(?:رو\s*|را\s*)?(?:کشیدم|امتحان\s*کردم|زدم|چک\s*کردم|دیدم)|برای\s*n\s*=|(?:چند|[0-9۰-۹]+|دو|سه|چهار|پنج|شش|هفت|هشت|نه|ده)\s*تا\s*(?:حالت|مثال|نمونه|شکل)|همیشه\s*[^.!؟?]{0,30}(?:بود|بودن|شد|شدن|درآمد|درست)|درست\s*بود(?:ن)?|[0-9]+\s*تا(?:شو|ش|شون|یی)?\s*(?:رو\s*|را\s*)?(?:چک|امتحان|بررسی|حساب)\s*(?:کردم|کردیم)|مقاله|تفاضل|الگو(?:ش|ی)?\s|شبیهِ?\s/;   // دورِ ۶ (G3، s25، s07): «۱۰ تاشو چک کردم»، شاهدِ قیاسی/استقرایی (مقاله، تفاضل‌ها، الگو)
  var CLAIM_RE = /ثابت\s*شد|اثبات\s*شد|اثباته|ثابت(?:ش)?\s*کردم|پس\s*(?:درسته|درست\s*است|همیشه)/, ARG_RE = /چون|زیرا|بنابراین|به\s*دلیلِ?|طبقِ?\s|برهان|استقرا|خلف|لانه[‌\s]?کبوتر|اصلِ?\s/;
  function heurClaim(t) { t = faDigits(String(t || "")); return EVID_RE.test(t) && CLAIM_RE.test(t) && !ARG_RE.test(t); }
  AS.coachHeurClaim = heurClaim;
  /* ctx = {intro}: «پس + عدد» نتیجه نیست در پیامی که مسئله را می‌سازد — گشایش (intro) یا «… ثبتش کن» (s28 «… پس ۱/۲. باشه ثبتش کن» — ادعای او
     پیش از فهمِ مسئله)؛ پس از آن، حاصلِ کارِ خودش نتیجه است (s37 «پس قیمت یا ۱۸۰۲ یا ۶۹۱ ریاله»، «پس x = ۱۰ لیتر»). بی ctx همان رفتارِ پیشین */
  var CREATE_RE = /ثبت(?:ش)?\s*(?:کن|کنیم|می[‌\s]?کنم)(?![آ-ی])/;
  /* RM6c: جوابِ دیگری (معلم، کتاب، صورتِ مسئله) نتیجهٔ او نیست — نه با الگوی قوی، نه ضعیف */
  var OTHER18_RE = /(?:معلم|استاد|کتاب|جزوه|مامان|بابا|دوستم|رفیقم|همکارم|صورت)\S*\s*(?:سؤال\S*|سوال\S*|مسئله\S*)?\s*(?:گفت|گفته|نوشته|میگه|می[‌\s]گه|می[‌\s]?گوید)(?![آ-ی‌])/;
  var CLAIM18_RE = new RegExp("مطمئنم|حتماً|حتما(?![آ-ی])|قطعاً|بی[‌\\s]?شک|معلومه|واضحه|" + OTHER18_RE.source);
  function weakOk(t, ctx) { return !ctx || !(ctx.intro || CREATE_RE.test(String(t || ""))); }
  function solvedSaid(t, ctx) { return (SOLVED_RE.test(t) || resultNow(t, weakOk(t, ctx))) && !heurClaim(t); }
  function lastAt(re, t) { var g = new RegExp(re.source, "g"), m, i = -1; while ((m = g.exec(t))) { i = m.index; if (!m[0].length) g.lastIndex++; } return i; }
  /* B7: «غلط بود» فقط وقتی «حل نشد» است که (۱) دربارهٔ حدس نباشد — حدسِ ردشده داده است، نه شکست، (۲) پس از آن نتیجه‌ای نیامده باشد
     (تلاشِ کنارگذاشته‌ای که بعدش به جواب رسید)، و (۳) پس از حل (بازنگری) فقط اگر خودِ جواب/برهان را غلط بخواند */
  function unsolvedNow(t, ph) {
    t = String(t || ""); var i = lastAt(UNSOLVED_RE, t); if (i < 0) return false;
    var clause = t.slice(0, i).split(/[.!؟?؛\n]|،\s*(?:ولی|اما)/).pop();
    if (/حدس/.test(clause) && !/حل\s*نشد/.test(t.slice(i, i + 12))) return false;
    if (Math.max(lastAt(SOLVED_RE, t), lastAt(RESULT_RE, t), lastAt(LOOK_RE, t)) > i) return false;
    if (ph === "b" && !/حل\s*نشد|(?:جواب|حل|برهان|اثبات|نتیجه|راه[‌\s]?حل)(?:م|ش)?\s*(?:هم\s*)?(?:غلط|اشتباه)|غلطه|اشتباهه|نمی[‌\s]?شه\s*!/.test(t)) return false;   // زمانِ حال («غلطه»، «… نمی‌شه!») دربارهٔ همین جواب است (s14)
    return true;
  }
  /* «گیر»ِ حلِ مسئله (زیرمجموعهٔ FAIL_ME که دربارهٔ خودِ حل است؛ خشم/شرم/دلسردی رویدادِ مرحله نیست — R7، B7) */
  var STUCK_RE = /نتونستم|نتوانستم|باز\s*(?:هم\s*)?نشد|حل\s*نشد|نشد\s*که\s*نشد|گیر\s*(?:کردم|افتادم|کرده‌?ام)|(?:شکست|ناکام)\s*خوردم|از\s*پسش\s*بر\s*نمیام|کم\s*آوردم|جور\s*نمی[‌\s]?(?:شه|شود|ده)|هیچی\s*جور|پس\s*راهی\s*نیست|هیچ\s*(?:کاری|راهی)\s*نمی[‌\s]?(?:شه|شود)(?:\s*کرد)?|(?:^|[\s.!،؛…])گیرم(?!\s*که)(?=[\s.!،؛؟?…]|$)/;   // دورِ ۵ (F1، s38): «هنوز گیرم» (نه «گیرم که…» ِ فرض)
  var NOTKNOW_RE = /نمی[‌\s]?(?:دونم|دانم)|نمیدونم|ایده(?:‌ای)?\s*ندارم|هیچ\s*ایده(?:‌ای)?|یادم\s*(?:نمیاد|نمی[‌\s]?آید|نمی[‌\s]?آد|نیست)/;   // دورِ ۵ (F1، s38): «یادم نمیاد»
  /* B1: آنچه کاربر با حرفِ خودش از فهمِ مسئله گفته (بی آن‌که پرسیده شود) — تورِ پولیا دورِ ۴ (E1): فقط **پشتیبان** وقتی مدل وضع را گزارش نکرد،
     و سخت‌تر: «؟» ِ تنها، هر رقم، «فقط/باید/حداکثر» دیگر نشانهٔ مجهول/داده/شرط نیستند (s01، s02، s16، s30). برچسبِ صریح («مجهول…»، «داده‌ها…»، «شرط…»)
     همیشه؛ بیانِ ضعیف‌تر («می‌خوام بدونم…»، «داریم»، «طوری که») فقط وقتی پیام خودِ صورتِ چسبانده نیست (مسئله پیش‌تر آمده). */
  var ST_LAB = { u: /مجهول|(?:^|[\s،:«])حکم(?:\s|[:：،»]|$)|خواسته(?:‌ی|ِ|ٔ)?\s*(?:مسئله|اینه|این است)/, d: /داده(?:‌ها|ها|ٔ|‌ی)|داده\s*[:：]|(?:^|\s)فرض(?:‌ها|ها)?\s*(?:[:：]|اینه|این است)/, c: /(?<!(?:این|همین|اون|آن|همون)\s*)شرط|(?:^|\s)قید/ };   // دورِ ۷ (H1، s27): «این شرط» اشاره است، نه گفتنِ شرط
  var ST_WEAK = { u: /می[‌\s]?خوا(?:م|یم|هم)\s*(?:بدونم|بدانم|بفهمم|پیدا\s*کنم|حساب\s*کنم|ثابت\s*کنم)|دنبالِ?\s*[^.؟?]{1,40}\s*(?:هستم|ام|‌ام)(?=\s|[.،؛]|$)|باید\s*(?:پیدا|حساب|ثابت)\s*کنم/,
    d: /(?:^|\s)داریم|می[‌\s]?(?:دونیم|دانیم)|معلومه\s*که/, c: /به\s*شرطی|طوری\s*که|به[‌\s]?طوری|(?:^|\s)نباید|هیچ\s*دو|نه\s*بیشتر\s*از/ };
  function statedParts(t, pasted) { t = faDigits(String(t || "")); var o = {}; ["u", "d", "c"].forEach(function (k) { o[k] = ST_LAB[k].test(t) || (!pasted && ST_WEAK[k].test(t)); }); return o; }
  /* B10: کاربرِ مربی/پدر/مادر (نه حل‌کننده) — قابِ «از یادگیرنده بپرس، حل نکن». دورِ ۴ (E1): «شاگردام…»، «تو شاگرد باش من معلم»، «دخترم یه مسئله داره… چطوری بهش بگم» (s15، s16) */
  var TEACH_RE = /(?:به|برای)\s*(?:بچه|پسر|دختر|شاگرد|دانش[‌\s]?آموز|فرزند)(?:م|ام|‌ام|ها|هام|هایم|‌هام|‌هایم|مون)?\s*(?:یاد\s*بد(?:م|هم)|درس\s*بد(?:م|هم)|توضیح\s*بد(?:م|هم)|کمک\s*کن(?:م)?)|(?:شاگرد|دانش[‌\s]?آموز)(?:م|ام|‌ام|ان|ها|‌هام|هام)\s*(?:گیر|نمی[‌\s]?فهم|نمی[‌\s]?تون)|معلم\s*(?:هستم|ام)|(?:بچه|پسر|دختر)(?:م|ام|‌ام)\s*(?:تو|در|سرِ?)\s*[^.؟?]{1,40}\s*گیر\s*کرده|(?:چطور|چطوری|چگونه)\s*(?:بهش|به\s*او|به\s*اون)\s*یاد\s*بد|شاگرد(?:ا|ها|‌ها)(?:م|ی\s*من)|تو\s*شاگرد\s*باش|(?:بچه|پسر|دختر|شاگرد|فرزند)(?:م|ام|‌ام)[^.؟?]{0,80}(?:چطور|چطوری|چگونه)\s*(?:بهش|به\s*او|به\s*اون)\s*(?:بگم|توضیح\s*بدم|یاد\s*بدم)|(?:بچه|پسر|دختر|شاگرد|فرزند)(?:م|ام|‌ام)\s*(?:یه|یک)\s*(?:مسئله|مساله|سؤال|سوال|تمرین)(?:ی)?\s*(?:داره|دارد)/;   // دورِ ۵ (s16): «دخترم یه مسئله داره: «…؟» … چطوری بهش بگم» — «؟» ِ درونِ صورت جمله را نمی‌بُرد
  /* دورِ ۶ (G3): لحظه‌های قابِ معلم — پرسشی که پرسید/نوشت/لو داد (TQ) و حرکتِ اقتدار یا فراموشیِ آنچه گفته شد (TA) */
  var TQ_RE = /پرسیدم|بپرسم|می[‌\s]?پرسم|(?:سؤال|سوال|پرسش)(?:‌ها|ها)?(?:م|‌?های\s*من|\s*هام|ی\s*که\s*(?:پرسیدم|می[‌\s]?پرسم))|گفتم\s*[:：]?\s*[«"]|لو\s*(?:داد|می[‌\s]?ده|میده|دادم|بدم)/;
  var TA_RE = /گفته\s*بودم|بهش\s*گفتم|خودم\s*(?:حل|توضیح|گفتم|نشون)|روی\s*تخته|یادش\s*(?:رفت|رفته|نموند|نمونده)|فراموش\s*(?:کرد|کرده)|(?:بهش|به\s*او)\s*(?:بگم|بگو|توضیح\s*بدم)|زود\s*تموم|(?:^|[\s،.…])من\s*(?:گفتم|گفته\s*بودم)|قبول\s*(?:کرد|کرده)\s*(?:فقط\s*)?چون\s*(?:من\s*)?(?:بابا|پدر|مامان|مادر|معلم)(?:ش)?(?:م|ام|‌ام|هستم)?(?![آ-ی])/;   // دورِ ۷ (H1، s16)
  /* دورِ ۶ (G3، s14): استدلالِ محتملِ خودش («حدسم … پس …») — برچسبِ «ناتمام — اکتشافی» (B162) در هر مرحله */
  var PLAUS_RE = /(?:حدسم|حدس\s*می[‌\s]?زنم)[^؟?]{0,200}?(?:^|[\s.،؛!…])پس\s/;
  /* دورِ ۷ (H1، s20): شاهدِ شمارشی به‌جای برهان — «۳۸ تاش جور درمیاد»، «نشونه‌ها خیلی زیاده» */
  var EVCOUNT_RE = /[0-9]+\s*تا(?:ش|شون|یی)?\s*(?:جور\s*(?:درمیاد|درمی[‌\s]?آید|در\s*میاد|درآمد)|درست\s*(?:درمیاد|درآمد|بود|بودن)|می[‌\s]?خونه|می[‌\s]?خوانَ?د|تأیید)|(?:نشونه|نشانه|شاهد|شواهد)(?:‌ها|ها)?\s*(?:خیلی\s*)?(?:زیاده|زیادن|زیاد\s*است|فراوان)/;
  var GUESS_Q = "چطور می‌آزمایی‌اش؟ — با کدام وارسی یا حالتِ خاص؟";
  var SELF_SOLVED_RE = /خودم\s*(?:حلش|حل\s*ش|ثابتش|حل|ثابت)\s*(?:کردم|می[‌\s]?کنم)|خودم\s*(?:جوابش|جواب)\s*(?:رو|را)?\s*(?:بلدم|می[‌\s]?دونم)|خودم\s*بلدم/;
  function pgOf(pid) { return pid ? S.get("eprog_" + pid) : null; }
  function arrN(x) { return Array.isArray(x) ? x.length : x ? 1 : 0; }
  /* شاهدِ فهم و بازنگری برای یک مسئله — هر شکلی که بخش‌های دیگر ثبت کنند (کارتِ فهم/بازنگریِ شبیه‌ساز) یا همین دستیار (tut) */
  /* یک خواننده برای همهٔ شکل‌ها: کارتِ فهم/بازنگریِ شبیه‌ساز (eprog.solve.u[lv] / solve.b[lv] با done — و فهمِ «افزودنِ مسئلهٔ تو» در u[0])،
     پرسشِ همان لحظه در کارتِ گام (eprog.tut.und/back با src: "sim")، tutor_mark ِ دستیار (eprog.tut)، و شکل‌های قدیمیِ und/lb/… */
  function doneIn(o) { return !!o && typeof o === "object" && Object.keys(o).some(function (k) { var x = o[k]; return x && !x.skipped && (x.done || x.from === "inject"); }); }
  AS.probPhaseOf = function (pid) {
    var pg = pgOf(pid) || {}, t = pg.tut || {}, sv = pg.solve || {};
    return { und: !!(doneIn(sv.u) || arrN(pg.und) || arrN(pg.understand) || arrN(t.und)), back: !!(doneIn(sv.b) || arrN(pg.lb) || arrN(pg.lookback) || arrN(pg.review) || arrN(t.back)) };
  };
  /* «موفقیتِ کوچک» — بی آستانهٔ قراردادی: در سطحِ کنونیِ شبیه‌ساز، با k درست از n تلاش، احتمالِ درستیِ گامِ بعد (k+1)/(n+2) است
     (T_next/T_pop، از A3+A4 — همان «سنجشِ استاندارد»)؛ وقتی این از ½ ِ «نمی‌دانیم» (A4) کمتر شد و آخرین تلاش هم غلط بود، یعنی شکست
     بر موفقیت پیشی گرفته ⇒ پیش از گامِ بعد، یک موفقیتِ کوچک (حالتِ خاص یا بخشی از مسئله) و یک پرسشِ هیجان/انگیزه یا باور دربارهٔ خود. */
  AS.levelOdds = function (pid) {
    var pg = pgOf(pid); if (!pg || !pg.lv) return null;
    var lv = A.simState && A.simState.pid === pid ? A.simState.lv : Object.keys(pg.lv).sort(function (a, b) {
      var la = Object.keys(pg.lv[a] || {}).map(function (k) { return String(pg.lv[a][k].at || ""); }).sort().pop() || "", lb = Object.keys(pg.lv[b] || {}).map(function (k) { return String(pg.lv[b][k].at || ""); }).sort().pop() || "";
      return la.localeCompare(lb); }).pop();
    var L = pg.lv[lv] || {}, es = Object.keys(L).map(function (k) { return L[k]; }).filter(function (e) { return e && e.at; }).sort(function (a, b) { return String(a.at).localeCompare(String(b.at)); });
    if (!es.length) return null;
    var okOf = function (e) { return e.first === true || e.self === 2; }, k = es.filter(okOf).length, n = es.length;
    return { lv: +lv, k: k, n: n, p: (k + 1) / (n + 2), last: okOf(es[es.length - 1]) };
  };
  AS.smallWin = function (pid) { var o = AS.levelOdds(pid); return o && o.p < 0.5 && !o.last ? o : null; };
  /* آیا کاربر همین حالا دارد مسئله‌ای حل می‌کند؟ (null ⇒ قلاب خاموش است) */
  AS.solvingCtx = function (s) {
    var st = A.state || {}, v = st.view, arg = st.arg;
    if (v === "e_prob" && arg && A.getProb) { var p = A.getProb(arg); if (p && !/^(era|cases|path|dead|lessons)$/.test(st.sub || "")) return { kind: "prob", pid: p.id, title: p.title, p: p }; }
    if (v === "kcase" && arg) { var kc = S.get(arg); if (kc && kc.type === "kcase" && ((kc.kinds || []).indexOf("problem") >= 0 || (kc.src && kc.src.type === "eprob"))) return { kind: "kcase", rec: kc, title: kc.title || "موقعیت" }; }
    if (v === "journey" && arg && /^S(4|8)$/.test(st.sub || "")) { var pr = S.all("pr", function (r) { return r.pid === "P11" && r.topic === arg; })[0]; if (pr && /^مسئله/.test((pr.data || {}).pmode || "")) return { kind: "pappus", rec: pr, title: pr.data.fruit || "مسئله" }; }
    var cur = s && s.tour && s.tour.facets.filter(function (f) { return f.status === "now" && f.kind === "problem"; })[0];
    if (cur) { var ep = children(cur).eprob[0]; if (ep && ep.p) return { kind: "prob", pid: ep.p.id, title: ep.p.title, p: ep.p, facet: cur.key }; }
    return null;
  };
  function tutorPhase(c, msg) {
    if (solvedSaid(String(msg || "")) && !unsolvedNow(msg, "")) return "back";
    if (c.kind === "prob") {
      var pg = pgOf(c.pid), ph = AS.probPhaseOf(c.pid), stx = A.simState && A.simState.pid === c.pid ? A.simState : null;
      if (stx && c.p && stx.i >= (c.p.stages || []).length) return "back";
      var tried = pg && pg.lv && Object.keys(pg.lv).some(function (l) { return Object.keys(pg.lv[l] || {}).length; });
      if (!ph.und && !tried) return "und";
    }
    if (c.kind === "kcase" && !arrN((c.rec.tut || {}).und)) return "und";
    if (EXEC_RE.test(String(msg || ""))) return "exec";
    return "plan";
  }
  AS.tutorPhase = tutorPhase;
  AS.promptHooks = AS.promptHooks || [];
  AS.promptHooks.push(function (s, msg) {
    var c = AS.solvingCtx(s); if (!c) return "";
    // شمارهٔ پرسش و مرحله برای **هر مسئله** جدا (بازبینیِ متقابلِ ۲۰۲۶-۱۰-۱۵: پیش‌تر برای کلِ سشن بود و مسئلهٔ دوم از وسطِ فهرست شروع می‌شد)؛
    // نوبتِ خودکارِ «[سامانه: …]» حرفِ کاربر نیست: مرحله را عوض نمی‌کند و پرسش را جلو نمی‌برد — پس از «حل شد» بازنگری می‌ماند
    var root = s.tutor = s.tutor || {}, by = root.by = root.by || {}, key = c.pid ? "p:" + c.pid : c.rec && c.rec.id ? "r:" + c.rec.id : "t:" + clip(c.title, 60);
    var tu = by[key] = by[key] || { qi: {} }, mtxt = String(msg || "").trim(), auto = /^\[سامانه/.test(mtxt), ph;
    var Ct = s.coach = s.coach || {}; Ct.pk = "t:" + key;   // F3 (دورِ ۵): دفترِ پاسخِ همین مسئلهٔ شبیه‌ساز
    if (auto) ph = tu.ph || tutorPhase(c, msg);
    else {
      ph = tutorPhase(c, msg);
      if (unsolvedNow(mtxt, tu.solved ? "b" : "")) tu.solved = false;
      else if (ph === "back") tu.solved = true;
      else if (tu.solved) ph = "back";   // پس از «حل شد» تا خودش نگفته «حل نشد/اشتباه بود»، بازنگری می‌ماند
    }
    var T0 = TQ[ph];
    /* پرسشِ این نوبت (D2، تورِ پولیا دورِ ۳): همان فهرستِ ثابت، از کلی به خاص، بر پایهٔ پلهٔ کاربر در همین مسئله — نخستین پرسشی که هنوز نه در
       گفت‌وگوی همین مسئله پرسیده و پاسخ گرفته، نه در کارتِ «پرسشِ همین لحظه» ِ صفحه پاسخ داده شده؛ نه با شمارِ پیام (سکوت ⇒ همان پرسش با تغییرِ کوچک) */
    if (!tu.since) tu.since = nowIso();
    if (!auto && tu.lastMsg !== msg) { tu.lastMsg = msg; tu.ph = ph; }
    var pgT = c.kind === "prob" ? ((pgOf(c.pid) || {}).tut || {}) : ((c.rec && (c.rec.tut || (c.rec.data || {}).tut)) || {}), askedP = askedInChat(s, tu.since);
    var qi = -1; T0.qs.forEach(function (q, i) { if (qi < 0 && !answeredQ(s, q, askedP) && !(pgT[ph] || []).some(function (e) { return e && !e.skip && e.q === q && e.text; })) qi = i; });
    if (qi < 0) qi = T0.qs.length - 1;
    var L = ["# معلمِ حلِ مسئله — کاربر همین حالا دارد «" + clip(c.title, 80) + "» را حل می‌کند · مرحله: " + T0.fa,
      "- در این نوبت فقط **یک** پرسش بپرس، از همین فهرستِ ثابت و از کلی به خاص؛ پرسشِ پیشنهادیِ این نوبت: «" + T0.qs[qi] + "». فهرستِ این مرحله: " + T0.qs.map(function (q, i) { return (i + 1) + ") " + q; }).join(" "),
      "- پرسشِ لودهنده ممنوع: نامِ قضیه، حرکت، گزینهٔ درست یا گامِ بعد را نگو («فلان قضیه را به کار ببر» نه؛ «مسئلهٔ آشنایی با همین مجهول می‌شناسی؟» آری). اگر جواب خواست، پرسشِ نوبت یک پله کلی‌تر می‌شود؛ فقط پس از تلاشِ خودش یک پله خاص‌تر.",
      "- هر جا چیزی توضیح دادی، انگیزهٔ همان گام را هم بگو: چرا حالا این کار، و به کدام بخشِ مجهول نزدیکمان می‌کند. سکوت و درنگ را تحمل کن؛ پرسش را کوتاه‌تر تکرار کن، جوابش را نده.",
      "- نه مکانیکی: پرسشِ پیشنهادی فقط اگر با وضعِ همین لحظه می‌خواند؛ وگرنه پرسشِ دیگری از همین فهرست که می‌خواند — هیچ پرسشی بی‌دلیل یا از روی عادت. هدف را جلوی چشمش نگه دار (به پایان بنگر): اگر مسئلهٔ کمکی ساخت یا مجهول و داده هر دو عوض شد، راهِ برگشت از آن به مسئلهٔ اصلی همان یک پرسشِ نوبت است، نه پرسشی کنارش."];
    // توصیه‌های معلم که در کارتِ «پرسشِ همین لحظه» ِ شبیه‌ساز هم بی‌مدل اجرا می‌شوند (a36_solve.js: askCard / revealMotive)
    var lvNow = c.kind === "prob" && A.simState && A.simState.pid === c.pid ? A.simState.lv : null;
    L.push("- پیش از پرسیدن، از تجربهٔ حل‌کردنِ خودت کمک بگیر — خودت کجای چنین مسئله‌ای گیر می‌کردی و کدام پرسش راهت را باز می‌کرد — و همان یک پرسشِ نوبت را از همین‌جا برگزین، نه پرسشی که فقط در فهرست است.");
    if (lvNow && lvNow <= 2) L.push("- هنوز در سطحِ آشنایی است (سطحِ " + fa(lvNow) + "): برهانِ صوری نخواه — «درستی‌اش را روشن می‌بینی؟» بس است؛ «می‌توانی ثابتش کنی؟» را برای وقتی بگذار که گام را روشن دید (از سطحِ ۳).");
    L.push("- اگر از جبر یا نمادگذاری بیزار است یا آن را بی‌معنا می‌داند، تحمیل نکن و سرزنش نکن: نشان بده همین نماد در همین گام چه کاری را آسان می‌کند (انگیزهٔ گام)، و استدلالِ شهودی‌اش را به رسمیت بشناس.");
    L.push("- طرحی که از بیرون (سرنخ، تو، کتاب) گرفته زود فراموش می‌شود: پس از هر سرنخ بخواه همان گام را به زبانِ خودش بازسازی کند؛ الگو گرفتن گامِ اول است، نه آخر.");
    if (ph === "exec") L.push("- راه‌حل را یکی‌یکی بنویسد: هر گام فقط آنچه برای گفتن دارد، به ترتیب؛ گامی که «روشن» نمی‌بیند علامت بزند.");
    if (ph === "und") L.push("- وقتی مجهول، داده و شرط را به زبانِ خودش گفت، ثبت کن: {\"do\":\"tutor_mark\",\"phase\":\"und\",\"q\":\"…\",\"text\":\"همان جمله‌های خودش\",\"self\":0|1|2} — self فقط اگر خودش گفت (۰ نه، ۱ تا حدی، ۲ کامل)؛ وگرنه ثبت نکن.");
    if (ph === "back") L.push("- «حل شد» پایان نیست: پرسشِ نوبت **همیشه** یک پرسشِ بازنگری است (همان پرسشِ پیشنهادی)؛ «حل شد» را تأیید یا رد نکن. پاسخش را با {\"do\":\"tutor_mark\",\"phase\":\"back\",\"q\":\"پرسش\",\"text\":\"پاسخِ خودش\",\"self\":0|1|2} ثبت کن (self فقط از خودارزیابیِ صریحِ خودش) — یک کارتِ مرور می‌سازد که روزهای بعد برمی‌گردد.");
    var od = c.kind === "prob" ? AS.levelOdds(c.pid) : null, sw = od && od.p < 0.5 && !od.last ? od : null;
    // دشواریِ متناسب و لذتِ کشف — از دادهٔ همین سطح، با همان (k+1)/(n+2) و ½ ِ «نمی‌دانیم» (بی آستانهٔ قراردادی)
    if (od && od.last) L.push("- همین حالا گامی را خودش درست زد: لذتِ کشف را کوتاه و دقیق نام ببر (چه چیزی را خودش دید)، بی تعارف." + (od.p > 0.5 ? " در این سطح موفقیت بر شکست می‌چربد؛ اگر سطح را تمام کرد، سطحِ دشوارترِ بعد را پیشنهاد کن — مسئله نه خیلی آسان باشد نه خیلی سخت." : ""));
    if (sw) L.push("- در همین سطح شکست‌ها از موفقیت‌ها بیشترند (" + fa(sw.k) + " درست از " + fa(sw.n) + " تلاش؛ احتمالِ درستیِ گامِ بعد (k+1)/(n+2) = " + fa(Math.round(100 * sw.p)) + "٪، کمتر از ½ ِ «نمی‌دانیم»): پیش از گامِ بعد یک «موفقیتِ کوچک» پیشنهاد کن — حالتِ خاص‌تر یا بخشی از مسئله، «تمرین‌های هم‌خانواده» یا سطحِ آسان با سرنخ — و حالش (هیجان و انگیزه: دلسردی، ترس از اشتباه، کنجکاوی) یا باورش دربارهٔ خودش را در نظر بگیر؛ اگر همین لحظه از پرسشِ فهرست مهم‌تر است، همان پرسشِ نوبت می‌شود، نه کنارش. امید را بی‌دلداریِ کلیشه‌ای به رسمیت بشناس: فقط به موفقیتِ واقعیِ خودش اشاره کن. اگر این حس در جاهای دیگر هم تکرار می‌شود، جایش گره‌گشاست (خانوادهٔ «هیجان و انگیزه»).");
    // روحِ کتاب و پلهٔ استقلالِ کاربر در همین فهرست (تورِ پولیا، دستهٔ ۱) — همان مربی که برای مسئلهٔ زنده و گفت‌وگو هم می‌آید
    if (AS.coachLines) L.push(AS.coachLines({ ph: ph, qs: T0.qs, tries: ((s && s.msgs) || []).filter(function (m) { return m.role === "user"; }).length, sug: T0.qs[qi], s: s, mt: mtxt, dry: auto }));
    return L.join("\n");
  });
  /* ثبتِ فهم/بازنگری از حرفِ خودِ کاربر روی رکوردِ همان مسئله؛ بازنگری ⇒ کارتِ مرور (فردا و بعد، در «مرور» و «امروز») */
  AS.DO.tutor_mark = function (a) {
    var s = AS._turnSession; if (!s) return "سشن نیست";
    var PHM = { und: "und", u: "und", plan: "plan", p: "plan", exec: "exec", c: "exec", back: "back", b: "back" }, ph = PHM[a && a.phase] || ""; if (!ph) return "مرحله باید und، plan، exec یا back باشد";
    var text = clip(String(a.text || "").trim(), 1200); if (text.length < 3) return "متنِ پاسخِ خودِ کاربر لازم است";
    var self = a.self === 0 || a.self === 1 || a.self === 2 ? a.self : /^[012]$/.test(String(a.self)) ? +a.self : null;
    var c = AS.solvingCtx(s), rec = null;
    if (c && c.kind === "prob") rec = pgOf(c.pid) || { id: "eprog_" + c.pid, type: "eprog", lv: {} };
    else if (c && c.rec) rec = c.kind === "pappus" ? (c.rec.data = c.rec.data || {}) && c.rec : c.rec;
    var host = rec ? (rec.type === "pr" ? rec.data : rec) : s;
    var tut = host.tut = host.tut || {}, e = { at: nowIso(), q: clip(String(a.q || TQ[ph].qs[0]), 300), text: text };
    if (self != null) e.self = self;
    if (!userWrote(s, text)) e.by = "assistant";   // پاسخی که در پیام‌های خودِ کاربر نیست، بازگفتِ دستیار است (R7)
    (tut[ph] = tut[ph] || []).push(e);
    if (host === s && ph === "und") { var Cm = s.coach = s.coach || {}; if (!Cm.ph || Cm.ph === "u") Cm.ph = "p"; }   // فهمِ ثبت‌شده ⇒ مربیِ گفت‌وگو به طرح می‌رود
    if (ph === "back" && A.newCard) {
      var cd = A.newCard("بازنگری — «" + clip(c ? c.title : s.title || "مسئله", 80) + "»: " + e.q, text, { due: A.addDays(A.today(), 1), src: "tutor:back" + (c && c.pid ? ":" + c.pid : "") });
      if (cd) e.card = cd.id;
    }
    if (rec) S.put(rec); S.put(s);
    return "";
  };

  /* ---------- مربیِ پولیا: روحِ کتاب در هر نوبتِ حلِ مسئله (زنده، حل‌شده یا فقط در گفت‌وگو) — تورِ پولیا، دستهٔ ۱ (۲۰۲۶-۱۰-۱۵) ----------
     همه از داده و از متنِ خودِ منبع (window.SRC_COV ⇐ sources/polya_how_to_solve_it): پرسش‌ها مکانیکی نه (A164)، قاعدهٔ خطاناپذیر نیست (B233/C075)،
     مهارتِ عملی مثلِ شنا (A088)، معلمِ خیالی (A069)، ضرب‌المثلِ همان مرحله (C151–C164)، پلهٔ استقلال از نردبانِ خودِ پرسش‌ها (A.qRung)،
     و پایانِ نردبانِ سرنخ: فقط گامِ بعد، بعد بازسازی و بازنگری. پرامپتِ سامانه دست نمی‌خورد (سقفِ ۲۰ هزار)؛ همه قلاب است. */
  function srcItems() { var S0 = (window.SRC_COV || []).filter(function (x) { return x && x.id === "polya_how_to_solve_it"; })[0]; return (S0 && S0.items) || []; }
  function srcQ(id) { var x = srcItems().filter(function (y) { return y.id === id; })[0]; return x && x.quote ? "«" + clip(x.quote, 110) + "» (پولیا)" : ""; }
  /* دورِ ۵ (F6): همان، با شناسهٔ موردِ دفترِ پوشش (sources/polya_how_to_solve_it/coverage.json) — هر سطرِ کتاب می‌گوید از کدام مورد آمده */
  function cite(id) { var x = srcItems().filter(function (y) { return y.id === id; })[0]; return x && x.quote ? "«" + clip(x.quote, 110) + "» (پولیا، " + id + ")" : "(" + id + ")"; }
  var PROV_SEC = { u: "§۱", p: "§۲", c: "§۳", b: "§۴" };
  /* ضرب‌المثلِ همان مرحله: اول ثبت‌گاهِ «حکمتِ ضرب‌المثل‌ها» که بخشِ مسئلهٔ زنده صادر می‌کند (A.POLYA_PROVERBS: {id, ph, t = گفته, q = پرسشی که پشتیبانی می‌کند})،
     وگرنه همان موردهای «حکمتِ ضرب‌المثل‌ها» ِ منبع. جاهای ثبت‌گاه به چهار مرحله نگاشته می‌شوند (goal/five ⇐ فهم، p2/switch ⇐ طرح، cobj/want/back ⇐ اجرا، new ⇐ بازنگری). */
  var PROV_PH = { u: ["u", "goal", "five"], p: ["p", "rel", "p2", "switch"], c: ["c", "cobj", "back", "want"], b: ["b", "new"] };
  /* تورِ پولیا دورِ ۳ (B14): ضرب‌المثلِ نوع‌دار و هم‌جا — «پله به پله… می‌توانی ثابت کنی؟» (cobj) فقط برای پاسخِ عینی، «تأخیرِ عاقلانه» و «به‌زودی آنچه
     می‌خواهیم باور می‌کنیم» برای کارِ واقعی؛ «ترتیبِ اجرا برعکسِ اختراع» فقط پس از کار به عقب؛ «هدفِ ماهیگیری…» (switch) فقط وقتی طرح را عوض می‌کند،
     نه در آغازِ طرح؛ «سخت‌کوشی مادرِ خوش‌شانسی» (incub) وقتی خسته/گیر است و کنار می‌گذارد؛ «جایی که اراده هست» (will) پس از دلسردی. */
  var GIVEUP_RE = /(?:^|[\s،.])ول(?:ش)?\s*(?:می[‌\s]?)?(?:کنم|کردم)|رها(?:ش)?\s*(?:می[‌\s]?)?(?:کنم|کردم)|انصراف|بی[‌\s]?خیال(?:ش)?\s*(?:می[‌\s]?)?شم|دیگه\s*نمی[‌\s]?(?:تونم|خوام\s*ادامه)|جا\s*زدم/;
  /* E8 (دورِ ۴، s35): ضرب‌المثل یا قاعدهٔ عامیانهٔ خودِ کاربر («آب که از سر گذشت…»، «می‌گن…») — جدی، ولی هر ضرب‌المثلی ضدی دارد (C150) */
  /* دورِ ۵ (F6): لحظه‌هایی که سطرِ کتاب را می‌آورند — از حرفِ همین نوبت، نه از مرحله (هر کدام با شناسهٔ موردِ پوشش در coachLines) */
  var ABANDON_RE = /بندازم\s*دور|دور\s*(?:بندازم|بریزم)|کل(?:ش|ِ?\s*\S+)?\s*(?:رو|را)?\s*(?:بذارم\s*کنار|ول\s*کنم|دور\s*بریزم)|از\s*صفر\s*شروع\s*کنم/;
  /* دورِ ۶ (G3، s12): نامزدِ ردشده بی واژهٔ «حدس» هم حدسِ آزموده است — «رمهب‌ستان؟ نه. اشتباه بود»؛ دورِ ۷ (H1، s01): «حدسم که X … غلط درآمد» */
  var GUESS_REF_RE = /حدس(?:م|مون|ش|ِ?\s*اولم)?\s*(?:که\s+[^.؟?!\n]*?\s)?(?:غلط|اشتباه|رد|نادرست|درست\s*نبود)|[؟?]\s*(?:نه|نخیر)[.!…،\s]+(?:اشتباه|غلط)\s*(?:بود|درآمد|شد)/;
  var GEN_RE = /کلی[‌\s]?تر|تعمیم|برای\s*هر\s*n|n\s*(?:دلخواه|تایی|پله‌?ای)|عمومی[‌\s]?تر/;
  /* دورِ ۷ (H1، s38): «حالتِ کلی» فقط وقتی حرف از کلی کردنِ مسئله است — نه «برای حالت کلی نمی‌دونم چطور ثابت کنم» (حالتِ عامِ همان حکم، در جملهٔ گیر) */
  function genTalk(t) { t = String(t || ""); if (GEN_RE.test(t)) return true; return t.split(/[.!؟?؛\n]/).some(function (cl) { return /حالتِ?\s*کلی/.test(cl) && !STUCK_RE.test(cl) && !NOTKNOW_RE.test(cl); }); }
  /* دورِ ۶ (G3، s12، s14): «شما که ماشینی، بگو» (بی واژهٔ «جواب») هم «فقط جواب» است؛ «چرا X؟» ⇒ اول حدسِ خودش (WHY_RE) */
  /* دورِ ۱۱ (K3، s01، s02، s04، s05): خانوادهٔ «فقط جواب» — «زود بگو»، «یه راه‌حل بده»، «فقط بگو X یا Y؟» (پرسشِ تصمیمِ دوگزینه‌ای با «فقط بگو») */
  var ONLY_ANS_RE = /زود\s*(?:بگو|جواب\s*بده)|(?:یه|یک)\s*راه[‌\s]?حل(?:ی)?\s*(?:بهم\s*)?(?:بده|بگو)|فقط\s*بگو[^.؟?!\n]{0,60}?\sیا\s[^.؟?!\n]{0,40}[؟?]|فقط\s*(?:جواب|پاسخ)|جواب(?:ش|شو)?\s*(?:رو|را)?\s*(?:فقط\s*)?بگو|جوابِ?\s*آخر(?:ش)?\s*(?:رو|را)?\s*بده|(?:تو|شما)\s*(?:خودت\s*|خودتون\s*)?که\s*(?:ماشینی|ماشین\s*هستی|هوش\s*مصنوعی|کامپیوتری)[^.؟?]{0,25}?بگو|خودت\s*بگو/;
  var WHY_RE = /(?:^|[\s.!،؛:«])چرا\s+[^؟?]{3,140}[؟?]/;
  /* دورِ ۷ (H1، s31، s14): «چرا X؟» فقط وقتی توضیحی می‌خواهد که خودش نیازموده — نه وقتی همان‌جا پاسخش را داد («… چرا مساوی بهتره؟ از نابرابری حسابی-هندسی.»)
     و نه در پیامی که حدسِ خودش پیش از آن آمده («حدسم… پس … ولی چرا دقیقاً یکی کمتر؟») */
  function whyAsk(t) {
    var o = ownText(t), m = WHY_RE.exec(o); if (!m) return false;
    if (OWNGUESS_RE.test(o.slice(0, m.index)) || PLAUS_RE.test(o)) return false;
    return !/^\s*(?:چون|چونکه|زیرا|از|به\s*خاطرِ?|بخاطرِ?|به\s*دلیلِ?|طبقِ?|برای\s*این)(?![آ-ی])/.test(o.slice(m.index + m[0].length));
  }
  var TASTE_RE = /لذت\s*(?:می[‌\s]?برم|بردم)|دوست\s*(?:دارم|داشتم)|خوشم\s*(?:میاد|اومد|می[‌\s]?آید)|سلیقه/;
  var NOTATION_AV_RE = /(?:بدون|بی)\s*(?:x|ایکس|حروف|حرف|متغیر|جبر|نماد)(?![آ-ی])|(?:x|ایکس|حروف|جبر|نماد)[^.؟?]{0,25}(?:بدم\s*میاد|متنفرم|خوشم\s*نمیاد|نمی[‌\s]?خوام)/i;
  var BACKWARD_RE = /(?:از|به)\s*(?:آخر|جواب|خواسته|هدف)\s*(?:به\s*)?عقب|عقب[‌\s]?عقب|برعکس\s*(?:رفتم|حل\s*کردم|اومدم)/;
  /* دورِ ۶ (G3، s07، s20): زبانِ طبیعیِ استثنا — «کل قانونم خراب شد»، «استثناست، نادیده بگیرم؟» */
  var COUNTER_RE = /مثال[‌\s]*نقض|نقض\s*(?:شد|کرد|می[‌\s]?کنه)|(?:با|به)\s*(?:حدس|قانون|فرضیه)[^.،؟?]{0,15}\s*نمی[‌\s]?خونه|خلافِ?\s*(?:حدس|قانون|فرضیه)|(?:قانون|حدس|فرضیه|نظریه|قاعده)(?:م|مون|ش)?\s*(?:کلاً\s*)?(?:خراب|باطل|نقض)\s*(?:شد|شده)|استثنا(?:ست|ئه|یی|\s*است)|نادیده\s*(?:بگیرم|بگیریم)/;
  var INDIRECT_RE = /چرا\s*(?:باید\s*)?فرض\s*کن(?:م|یم)|فرض\s*کن(?:م|یم)\s*(?:که\s*)?همه|برهانِ?\s*خلف|اثباتِ?\s*غیرمستقیم/;
  /* «چند مجهول»: بیش از یک پرسشِ جدا در یک پیام («…چقدر بسازم؟ … کدوم؟ … کجا؟») یا «هر سه رو با هم» — «؟» ِ درونِ رقم («؟۴۸۷؟») پرسش نیست */
  /* دورِ ۶ (G3): «چند مجهول» فقط وقتی دو کمیتِ مجهولِ **متفاوت** خواسته شده — دو بندِ پرسشی با واژهٔ پرسشیِ کمیت (چقدر، چند، کجا، کدام، کِی، چه اندازه…)
     که با هم فرق دارند؛ نه شمارِ «؟» (فهرستِ نامزدها «لنج؟ نه… ناوبان؟»، دو معنای یک واژه، «… درسته؟»، پرسشِ نقل‌شده دو بار، «یعنی چی؟ کجا اشتباه کردم؟»)؛
     «هر سه رو با هم بگو» فقط همراهِ دست‌کم یک پرسشِ کمیت (نه «هر دو رو با هم برمی‌گردونم») */
  var QW_RE = /(?:^|[\s«"(،؛:])(چقدر|چه\s*قدر|چند(?:تا)?|کجا(?!ش?\s*(?:رو\s*|را\s*)?(?:اشتباه|غلط))|کدوم|کدام|کِی|کی(?=\s*(?:باید|بذارم|بسازم|شروع|انجام|تموم))|چه\s*(?:وقت|زمانی|اندازه|شکلی|نوعی|جنسی|رنگی|سرعتی)(?:ه)?|چطور(?:ی)?|چگونه|چه\s*جوری|چجوری)(?=[\s؟?»"،]|$)/g;   // دورِ ۷ (H1، s29): «چطوری…؟»، «چه شکلیه؟»
  /* دورِ ۸ (I-coach 3، s37): «؟» ِ جای رقم («؟۴۸۷؟»، «دو رقمِ آخر ۷؟» در سخن از رقم) و «؟!» ِ شگفتی پرسش نیستند */
  function qMarksOnly(t) {
    t = String(t || "").replace(/[؟?]+!+/g, "!");
    var dg = "[0-9۰-۹٠-٩]";
    t = t.replace(new RegExp("[؟?](?=" + dg + ")|(" + dg + ")[؟?](?=" + dg + "|[؟?])", "g"), function (m, d) { return (d || "") + "#"; });
    return t.split(/([.!؛\n…])/).map(function (cl) { return /رقم|ارقام/.test(cl) ? cl.replace(new RegExp("(" + dg + ")[؟?]", "g"), "$1#") : cl; }).join("");
  }
  /* دورِ ۹ (s17 در برابرِ s23، s29): open ⇒ فقط مجهول‌های **باز** (واژهٔ پرسشیِ چقدر/کجا/چطور…) — پرسشِ بله/نهِ مقدارِ خودش («یعنی ۱۰۰ دقیقه؟») مجهولِ باز نیست، پیشنهادِ خودش است */
  function manyUnknowns(t, open) {
    t = qMarksOnly(t); var seen = [];
    t.split(/[؟?]/).slice(0, -1).forEach(function (seg) {
      var cl = seg.split(/[.!؛\n…]/).pop(), m, w = ""; QW_RE.lastIndex = 0; while ((m = QW_RE.exec(cl))) w = m[1];
      /* دورِ ۷ (H1، s23): پرسشِ بله/نهِ کمیت («یعنی ۱۰۰ دقیقه؟»، «۸ تا … یا ۹ بهتر بود؟») — نه حسابِ خودش (فرمول) و نه «…درسته؟» */
      if (!w && /[0-9]/.test(faDigits(cl)) && !formulas(cl).length && !/(?:درسته|درست\s*(?:است|ه)|صحیحه|همینه|(?:^|\s)نه)\s*(?:دیگه)?\s*$/.test(cl.trim())) w = "qty";
      if (!w) return; w = w.replace(/\s+/g, "").replace("چهقدر", "چقدر").replace("کدام", "کدوم").replace("چندتا", "چند").replace("کِی", "کی");
      var tk = qToks(cl);
      if (!seen.some(function (x) { return x.w === w && tk.filter(function (y) { return x.tk.indexOf(y) >= 0; }).length * 2 >= Math.min(tk.length, x.tk.length); })) seen.push({ w: w, tk: tk });
    });
    var req = /هر\s*(?:دو|سه|چهار|پنج)\s*(?:تا\s*)?(?:رو|را)?\s*(?:با\s*هم|یکجا|یک[‌\s]?جا)\s*(?:بگو|بده|حساب\s*کن|حل\s*کن|جواب\s*بده)/.test(t);
    if (open) seen = seen.filter(function (x) { return x.w !== "qty"; });
    return seen.length > 1 || (req && seen.length > 0);
  }
  /* دورِ ۹ (s29): خودش ترتیب را گذاشته («اول باغچه …»، «بعد هم …») یا برای یکی حدس زده («به نظرم …») ⇒ پرسشِ A044 («کدام را اول؟») پاسخ گرفته است */
  var OWN_ORDER_RE = /(?:^|[\s.،؛!…])(?:اول|نخست|سپس|بعدش|بعد\s*هم)(?![آ-ی‌])|به\s*نظرم|فکر\s*(?:کنم|می[‌\s]?کنم)|حدس(?:م|\s*می[‌\s]?زنم)/;
  /* «صورتِ بلند»: بیش از یک جملهٔ معنادار (کل بیش از یک جزء دارد که پیش از جزئیات باید با هم دیده شود) — بی آستانهٔ طول */
  function longStmt(t) { return String(t || "").split(/[.!؟?؛\n]+/).filter(function (x) { return qToks(x).length >= 2; }).length > 1; }
  /* دورِ ۶ (G3): «اول کل را ببین» (A191) فقط پیامی که مسئله را **معرفی** می‌کند و هنوز کل را ندیده: نه گشایشِ نتیجه («حلش کردم!»)، نه دلسردی/رها کردن،
     نه بازگشت («سلام دوباره»، «چند روز نبودم»)، نه درخواستِ چک‌لیست/چارچوب/جزوه، نه پیامی که مجهول را خودش نام برده («اول مجهول: …»)، و نه گشایشی که
     حدس یا تلاشِ خودش را دارد («فکر کنم خطیه»، «۷+۷=۱۴ …») — آن‌جا پرسشِ دیگری لحظهٔ اوست. یک بار برای هر مسئله (C.whole[pk]). */
  var RETURN_RE = /سلام\s*دوباره|دوباره\s*(?:سلام|اومدم|برگشتم)|برگشتم|چند\s*(?:روز|هفته|وقت)\s*(?:نبودم|پیش|گذشت)|یادته|(?:دو|سه|چند)\s*(?:شب|روز|هفته)\s*گذشت/;
  var META_RE = /چک[‌\s]?لیست|چارچوب|جزوه|خلاصه(?:‌ی|ی)?\s*(?:فرمول|درس|نکات)|(?:یه|یک)\s*(?:روش|قاعده|فرمول)(?:‌ی|ی)?\s*(?:کلی|عمومی|همیشگی)/;
  var OWNGUESS_RE = /(?:فکر\s*کنم|فکر\s*می[‌\s]?کنم|به\s*نظرم|حدسم|حدس\s*می[‌\s]?زنم|معلومه)(?!\s*(?:باید|بهتره|لازمه))/;
  var TRIED_RE = /امتحان\s*(?:کردم|کردیم)|دارم\s*(?:امتحان|حساب)|حساب\s*کردم|جمع\s*(?:زدم|کردم)/;
  /* دورِ ۸ (I-coach 4، s21): تلاش/حدس/فرمول فقط وقتی A191 را کنار می‌گذارد که خودش مجهول را پرسیده («قانونش چیه؟ فکر کنم…»، «چطوری؟ دارم امتحان می‌کنم…»)؛
     پیامی که صورت را می‌آورد و بی هیچ پرسشی یک‌راست به جزئیات/تلاش می‌پرد («مسئله: … FEN … من کیش با وزیر رو زدم…») همان لحظهٔ A191 است */
  /* دورِ ۱۰ (J2): A191 فقط پیامی که مسئله‌ای را معرفی می‌کند — نه ادامهٔ گیرِ پیشین («هنوز نمی‌دونم. گیرم…» در سشنِ تازه، s26 p5)، و نه صورتی که کامل
     نقل شده («…») و خودش گزارش می‌دهد رویش کار کرده (s38 p6: «یک ساعت و نیمه روش کار کردم… امتحان کردم») — کل را دیده است */
  var CONTMSG_RE = /^\s*(?:هنوز|هنوزم|بازم|باز\s*هم|همچنان|همون\s*(?:مسئله|سؤال|سوال))(?![آ-ی])/, WORKED_RE = /روش\s*کار\s*(?:کردم|می[‌\s]?کنم)|کار\s*کردم|روشم(?![آ-ی])/;
  function wholeMoment(t) { t = String(t || ""); var asked = /[؟?]/.test(ownText(t));
    if (CONTMSG_RE.test(t) || (/«[^»]{20,}»/.test(t) && (TRIED_RE.test(ownText(t)) || WORKED_RE.test(ownText(t))))) return false;
    return !solvedSaid(t) && !FAIL_ME.test(t) && !GIVEUP_RE.test(t) && !RETURN_RE.test(t) && !META_RE.test(t) && !ST_LAB.u.test(faDigits(t)) && !TASTE_RE.test(t) && (!asked || (!OWNGUESS_RE.test(t) && !TRIED_RE.test(t) && !ownFormulas(t).length)); }
  /* دورِ ۸ (I-coach 4، s15): در قابِ معلم/پدر، گلایه از یاد دادن («شاگردام ساکت می‌مونن… چیکار کنم؟») معرفیِ مسئله نیست — مگر صورتِ مسئلهٔ یادگیرنده را نقل کند */
  var TEACH_PROB_RE = /«[^»]*(?:[؟?]|[0-9۰-۹])[^»]*»/;
  /* دورِ ۷ (H1، s11، s13): ابعاد و بازه‌ها («۱۰×۱۰»، «۱×۲»، «۵۰-۱۰۰») دادهٔ صورت‌اند، نه حساب یا فرمولِ خودش */
  function ownFormulas(t) { return formulas(t).filter(function (x) { return !/^\d+(?:[.,٫]\d+)?[×x*\-−–]\d+(?:[.,٫]\d+)?$/.test(x); }); }
  var OWN_PROV_RE = /ضرب[‌\s]?المثل|مثلِ?\s*معروف|(?:به\s*قولِ?|قدیمیا|قدیمی‌ها)\s|(?:^|\s)می[‌\s]?(?:گن|گویند)\s*(?:که\s*)?«|آب\s*که\s*از\s*سر\s*گذشت|کار\s*از\s*کار\s*گذشته|هر\s*چه\s*پیش\s*آید\s*خوش\s*آید/;
  function provKeys(ph, cls, mt) {
    mt = String(mt || "");
    var k = ph === "c" ? (cls === "obj" || cls === "prove" ? ["cobj", "c"] : cls === "pract" || cls === "life" ? ["c", "want"] : ["c", "cobj"]) : (PROV_PH[ph] || [ph]).slice(), front = [];
    k = k.filter(function (x) { return x !== "switch"; });
    if (ph === "p" && /عوض|طرحِ?\s*(?:دیگه|دیگر|تازه|دوم)|دوباره\s*طرح|کنار\s*بذارم\s*این\s*طرح/.test(mt)) front.push("switch");
    if (ph === "c" && /(?:از|به)\s*(?:آخر|جواب|خواسته)\s*(?:به\s*)?عقب|برعکس/.test(mt)) front.push("back");
    /* E8 (دورِ ۴، s19): رها کردنِ صریح («ول می‌کنم»، «انصراف») ⇒ ضرب‌المثلِ اراده پیش از ته‌نشینی */
    if (GIVEUP_RE.test(mt) || ABANDON_RE.test(mt)) front.push("will");
    else if (STUCK_RE.test(mt) || /خسته|کنار\s*(?:بذارم|بگذارم|گذاشتم)|ذهنم\s*کار\s*نمی/.test(mt)) front.push("incub");
    else if (FAIL_ME.test(mt)) front.push("will");
    return front.concat(k.filter(function (x) { return front.indexOf(x) < 0; }));
  }
  function proverbs(ph, keys0) {
    var L = null, R = A.POLYA_PROVERBS || A.HEUR_WISDOM || A.PROVERBS, keys = keys0 || PROV_PH[ph] || [ph];
    try { if (typeof A.polyaProverbs === "function") L = A.polyaProverbs(ph); } catch (e) { L = null; }
    if ((!L || !L.length) && R) L = Array.isArray(R) ? [].concat.apply([], keys.map(function (k) { return R.filter(function (x) { return x && (x.ph || x.phase) === k; }); })) : [].concat.apply([], keys.map(function (k) { return R[k] || []; }));
    if (!L || !L.length) L = srcItems().filter(function (x) { return x.quote && String(x.section || "").indexOf("حکمت ضرب‌المثل‌ها " + PROV_SEC[ph]) >= 0; });
    return (L || []).map(function (x) {
      if (typeof x === "string") return { q: x, n: "" };
      var say = x.quote || (x.t && x.q ? x.t : (x.t || x.q)) || x.fa || "";
      return { q: say, n: x.name_fa || x.name || "", ask: x.t && x.q ? x.q : "", askp: x.t && x.qp ? x.qp : "", id: x.id || "" };
    }).filter(function (x) { return x.q; });
  }
  AS.polyaProverbsFor = proverbs;
  var OBJ_K = { prove: 1, pod: 1, math: 1, proof: 1, puzzle: 1, objective: 1, homework: 1, exercise: 1, riddle: 1 }, PRACT_K = { practical: 1, decision: 1, project: 1, life: 1, real: 1 };
  /* داورِ مسئلهٔ زنده — یک منبع (ادغامِ G1/G2): A.liveKindInfo ِ بخشِ مسئله (r.p.nat، اثباتی/pod همیشه objective)؛ دیگر هیچ حدسی این‌جا */
  function liveKind(pid) { try { var ki = A.liveKindInfo ? A.liveKindInfo(pid) : null; return ki ? String(ki.kind || "") : ""; } catch (e) { return ""; } }
  /* ردهٔ مربی برای مسئلهٔ زندهٔ بسته‌شده، از همان داده: اثباتی/pod ⇒ prove؛ objective ⇒ obj؛ زندگی/عملی ⇒ pract */
  /* F4 (دورِ ۵، s05، s13، s19، s34): ردهٔ زندگی «life» است، نه «pract» — پرسش‌های عملی («با چه عدد یا واحدی…») برای تصمیمِ زندگی نیست؛ اثباتی فقط وقتی داور برهان است
     (فرضیهٔ زندگیِ «اثبات یا رد کن» برهان ندارد — داورش واقعیت است) */
  /* دورِ ۱۱ (K5، s22 p4): داورِ هنوز انتخاب‌نشده (liveKindInfo.set === false، نه اثباتی/pod از نوع) ⇒ ردهٔ خنثی — سرواژهٔ مربی قابی را نام نمی‌برد که هنوز نیست */
  function kindUnset(pid) { try { var ki = A.liveKindInfo ? A.liveKindInfo(pid) : null; return !!ki && ki.set === false && ki.by !== "type"; } catch (e) { return false; } }
  function liveClass(pid) { try { var ki = A.liveKindInfo ? A.liveKindInfo(pid) : null; if (!ki || kindUnset(pid)) return ""; return ki.kind === "objective" ? (ki.type === "prove" || ki.type === "pod" ? "prove" : "obj") : ki.kind === "life" ? "life" : "pract"; } catch (e) { return ""; } }
  function kindClass(k) { k = String(k || "").split(/[:|]/)[0]; return OBJ_K[k] ? "obj" : PRACT_K[k] ? "pract" : ""; }
  AS.liveKindOf = liveKind;
  AS.liveFrame = function (kind) {
    var c = kindClass(kind);
    if (c === "obj") return "- این مسئله پاسخِ عینی دارد (ریاضی، برهان، معما یا تمرین): پاسخ وجود دارد ولی تو نمی‌دانی — و جای او پیدایش نکن. داوری با برهان و وارسیِ هر گام است، نه با واقعیت (معیارِ هر گام: روشن دیدن و ثابت کردن — همان پرسش‌های فهرستِ «اجرا»، فقط وقتی پرسشِ نوبت‌اند). پاسخ یا گامِ بعد را لو نده و فیلدهای صفحه را پر نکن (data-own).";
    if (c === "pract") return "- پاسخِ این مسئله را هیچ‌کس از پیش نمی‌داند — نه تو نه صفحه؛ داور واقعیت است (پیش‌بینی ⇐ نتیجه در موعد) و داوریِ خودِ او. حلش نکن، تصمیم را جای او نگیر و دربارهٔ درستیِ تصمیمش حکم نده. فیلدهای صفحه را پر نکن (data-own).";
    return "- اگر پاسخِ عینی دارد (ریاضی، برهان، معما، تمرین): پاسخ وجود دارد ولی تو نمی‌دانی و لو نمی‌دهی؛ داوری با برهان و وارسیِ گام (روشن دیدن و ثابت کردن)، نه با واقعیت. اگر تصمیم یا پروژهٔ زندگی است: پاسخ را هیچ‌کس از پیش نمی‌داند و داور واقعیت و داوریِ خودِ اوست. در هر دو: حلش نکن و فیلدهای صفحه را پر نکن (data-own).";
  };
  /* پرسشِ هم‌گام با صفحه — یک منبع (ادغامِ G1/G2): A.liveCoach(pid) ِ بخشِ مسئله (مرحله، پرسشِ همین حالا، فهرستِ نوع‌دار، بستن، داده و بخشِ شرطِ به‌کارنرفته).
     پیش‌تر a27 فهرست و پرسشِ خودش را می‌ساخت (برای مسئلهٔ عینی هم «پیش‌بینی») و با قلابِ a38 دو پرسشِ متفاوت در یک نوبت می‌شد. */
  /* دورِ ۵ (F2): opts = {asked, stuck, turn:{analogy, result, stuck, fail}} — نشانه‌های همین نوبت؛ اولویت را خودِ A.liveCoach (بخشِ مسئله) می‌گذارد.
     pageQ = پرسشِ کارتِ صفحه (همان تابع، بی نشانهٔ نوبت) — فقط وقتی q همان رشته است می‌گوییم «همان که صفحه می‌پرسد». */
  AS.liveNextQ = function (pid, opts) {
    var co = null; try { co = A.liveCoach ? A.liveCoach(pid, opts) : null; } catch (e) { co = null; }
    if (!co || co.ph === "done") return null;
    var pg0 = co; if (opts) { try { pg0 = A.liveCoach(pid) || co; } catch (e) { pg0 = co; } }
    return { ph: co.ph, q: co.q || "", list: (co.list || []).slice(), all: !co.q, coach: co, pageQ: co.card || pg0.card || pg0.q || "" };
  };
  var PH_OF = { und: "u", plan: "p", exec: "c", back: "b", u: "u", p: "p", c: "c", b: "b" };
  var PH_FA = { u: "فهمِ مسئله", p: "طرح‌ریزی", c: "اجرای طرح", b: "بازنگری" }, PH_NEXT = { u: "p", p: "c", c: "b", b: "b" };
  /* ---------- پرسش‌های مرحله، نوع‌دار (تورِ پولیا دورِ ۲، R1/R2): مربی هرگز «qs: []» نمی‌گیرد ----------
     همان پرسش‌های خودِ کتاب (TQ)، با شکلِ هر داور: «obj» (پاسخِ عینی؛ ‌«prove» اثباتی: فرض/حکم، حالتِ پایه، هر بخشِ فرض کجا به کار رفت، تعریف به‌جای نام (پاسکال)،
     هم‌ارزیِ پس از تبدیل) و «pract» (تصمیم/کارِ زندگی: داور واقعیت — پیش‌بینی، موعد، سنجش). نوعِ ناشناخته ⇒ همان فهرستِ کلیِ کتاب. */
  var QK = {
    prove: {
      u: ["فرض چیست؟ حکم (آنچه باید ثابت شود) چیست؟", "فرض را بخش‌بخش جدا بنویس — هر بخش چه می‌گوید؟", "شکلی بکش یا نماد بگذار؛ حکم را به زبانِ خودت بگو.", "حالتِ خاصی را امتحان کن: حکم در آن درست است؟"],
      p: ["قضیه‌ای با همین حکم (یا حکمِ مشابه) می‌شناسی؟", "به تعریف‌ها برگرد: هر واژهٔ حکم را با تعریفش جایگزین کن (پاسکال) — چه می‌شود؟", "از حکم به عقب: حکم از چه چیزی نتیجه می‌شد — و آن از چه؟ تا به فرض برسی.", "اگر نمی‌توانی همین را ثابت کنی، بخشی از فرض را نگه دار یا حالتِ خاص‌تری را ثابت کن.", "همهٔ فرض را به کار بردی؟"],
      c: ["هر گام را وارسی کن: روشن می‌بینی که درست است؟", "می‌توانی ثابتش کنی — کدام مقدمه آن را لازم می‌آورد؟", "برای «n ≥ k» یا استقرا: حالت‌های پایه را وارسی کردی؟", "کدام بخشِ شرط/فرض را این گام به کار می‌برد؟"],
      b: ["هر بخشِ فرض کجای برهان به کار رفت؟ بخشی ماند که به کار نرفت؟", "استدلال کجا از تعریف استفاده کرد؟", "پس از تبدیل‌ها (توان، ضرب در عبارتِ شاید صفر) شرطِ تازه هم‌ارزِ شرطِ اصلی است؟", "نتیجه دقیقاً همان حکم است؟ از راهِ دیگری هم به دست می‌آید؟", "همین روش را در کدام حکمِ دیگری به کار می‌بری؟"] },
    obj: {
      u: TQ.und.qs.slice(0, 5),
      p: TQ.plan.qs,
      c: TQ.exec.qs.concat(["کدام بخشِ شرط را این گام به کار می‌برد؟ اگر معادله نوشتی، شمارِ معادله‌ها با مجهول‌ها می‌خواند؟", "واحدها در دو سوی رابطه یکی است؟"]),
      b: TQ.back.qs },
    pract: {
      u: ["دقیقاً چه می‌خواهی — «حل‌شدن» چه شکلی است (مجهول)؟", "چه داری — دانسته‌ها، منابع، امکان‌ها (داده‌ها)؟", "کدام قیدها (زمان، پول، آدم‌ها) واقعی‌اند و کدام فرضی (شرط)؟", "کدام داده اثرِ محسوس دارد و کدام را با دلیل کنار می‌گذاری؟", "کدام تقریب بس است — جوابِ «به‌اندازهٔ کافی خوب» چیست؟"],
      p: ["پیش‌تر مسئله‌ای شبیه این — در زندگیِ خودت یا دیگران — دیده‌ای؟ از آن چه به کار می‌آید؟", "از آخر به عقب: اگر حل شده بود، گامِ پیش از آخر چه بود؟", "کوچک‌ترین نسخهٔ این مسئله (فقط بخشی از شرط) چیست که همین هفته بیازمایی؟", "داده‌هایی که اثرِ محسوس دارند همه در طرح آمده‌اند؟"],
      c: ["پیش از گامِ واقعی: چه پیش‌بینی می‌کنی و چقدر مطمئنی؟", "کی انجامش می‌دهی؟ روزش را بگو.", "آنچه شد با پیش‌بینی‌ات چه فاصله‌ای داشت — و این فاصله دربارهٔ فهمت چه می‌گوید؟"],
      b: ["نتیجه را با واقعیت سنجیدی — کدام پیش‌بینی درست درآمد و کدام نه؟", "اگر از نو شروع می‌کردی، کدام گام را عوض می‌کردی؟", "دربارهٔ خودت (راهِ فکرکردن، حال، عادت) چه آموختی؟", "همین روش را کجای دیگرِ زندگی‌ات به کار می‌بری؟"] },
    any: { u: TQ.und.qs, p: TQ.plan.qs, c: TQ.exec.qs, b: TQ.back.qs }
  };
  /* صورتِ ثابت‌کردنی (برای مسئلهٔ فقط‌درگفت‌وگو) — پیشنهاد، نه حکم */
  /* F4 (دورِ ۵، s14، s27، s05): خودِ واژهٔ «اثبات» («اثبات‌ها به چه درد می‌خورن؟») مسئله را اثباتی نمی‌کند — فقط خواستِ اثبات («ثابت کن»، «نشان بده که…») */
  var PROVE_RE = /ثابت\s*(?:کن|کنید|کنیم|کنم)(?![آ-ی])|اثبات\s*(?:کن|کنید|کنیم)(?![آ-ی])|نشان\s*(?:بده|بدهید|دهید)\s*که|برهان\s*(?:بیاور|بده)|حکم\s*(?:را|رو)?\s*ثابت|با\s*استقرا\s*(?:ثابت|نشان)/;
  function faDigits(t) { return String(t || "").replace(/[۰-۹]/g, function (d) { return String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)); }).replace(/[٠-٩]/g, function (d) { return String("٠١٢٣٤٥٦٧٨٩".indexOf(d)); }); }
  function qClass(kind, text) {
    var k = String(kind || "").split(/[:|]/)[0];
    if (k === "prove" || k === "pod" || (k !== "pract" && PROVE_RE.test(String(text || "")) && kindClass(k) !== "pract")) return "prove";
    if (k === "life") return "life";
    var c = kindClass(k); if (c) return c === "obj" ? "obj" : "pract";
    var g = ""; try { if (A.liveNatGuess) g = A.liveNatGuess(faDigits(text)) || ""; } catch (e) { }
    return g === "objective" ? "obj" : g === "life" ? "life" : g === "practical" ? "pract" : LIVE_RE2.test(String(text || "")) ? "pract" : "any";
  }
  /* پرسش‌های مرحله: مسئلهٔ زندهٔ بسته‌شده ⇒ فقط فهرستِ نوع‌دارِ خودِ بخشِ مسئله (A.livePhaseQs) — یک منبع؛ QK فقط برای مسئلهٔ فقط‌درگفت‌وگو */
  function phaseQs(ph, cls, pid) {
    if (pid && A.liveRec && A.liveRec(pid) && typeof A.livePhaseQs === "function") { try { var L0 = A.livePhaseQs(pid, ph); if (Array.isArray(L0) && L0.length) return L0.slice(); } catch (e) { } }
    var L1 = ((QK[cls] || QK.any)[ph] || QK.any[ph] || []).slice();
    /* E3 (دورِ ۴): محتوای فهرستِ هر داور از a38 (A.liveKindQs — بازنویسیِ کاملِ فهرستِ پولیا، نه زیرمجموعه)؛ ترتیب و پیشنهاد همین‌جا */
    if (typeof A.liveKindQs === "function") { try { var K1 = A.liveKindQs(cls, ph, L1); if (Array.isArray(K1) && K1.length) return K1; } catch (e) { } }
    return L1;
  }
  AS.coachQs = phaseQs; AS.coachClass = qClass;
  /* E1: حدسِ نوعِ مدل (coach_state.nat) برای مربیِ فقط‌درگفت‌وگو — فقط پیشنهاد (روی مسئلهٔ ثبت‌شده انتخابِ صریحِ کاربر برنده است) و بر حدسِ الگو مقدم */
  function natClass(s, text) {
    var n = s && s.coach && s.coach.natSug; if (!n) return "";
    return n === "objective" ? (PROVE_RE.test(String(text || "")) ? "prove" : "obj") : n === "life" ? "life" : "pract";
  }
  /* پرسشی که دستیار در همین سشن پرسید و کاربر پس از آن پاسخ داد ⇒ «پاسخ‌گرفته در گفت‌وگو» — دوباره پیشنهاد نمی‌شود (rerunC/D) */
  function qToks(t) { return String(t || "").replace(/[ً-ٰٟ‌]/g, "").replace(/[^؀-ۿa-zA-Z0-9 ]+/g, " ").split(/\s+/).filter(function (w) { return w.length >= 3 && !/^(که|را|از|به|با|در|این|آن|است|هست|می|یک|هم|چه|کدام|چیست|کنی|کرد|بود|شد|همین|برای)$/.test(w); }); }
  /* ---------- تورِ پولیا دورِ ۴ (E1): مدل وضعِ نوبت را **گزارش** می‌کند، صفحه **می‌سنجد** و دفتر را نگه می‌دارد ----------
     پیش‌تر «پاسخ داد/گفت/گیر است» فقط از الگوهای متنی خوانده می‌شد و در هر دو سو غلط بود (هر پیامِ بعدی «پاسخ»، هر «؟» «مجهول»). حالا پایانِ هر پاسخِ
     مربی کنشِ {"do":"coach_state",…} دربارهٔ **آخرین پیامِ کاربر** است؛ این ادعاست و با متنِ خودِ کاربر سنجیده می‌شود (AS.DO.coach_state، پایین).
     الگوها فقط پشتیبان‌اند: برای پیامی که مدل گزارشش را نداد (یا هنوز نداده — پیامِ همین نوبت). */
  var NOTKNOW_G = new RegExp(NOTKNOW_RE.source, "g"), STUCK_G = new RegExp(STUCK_RE.source, "g");
  var FILLER = /^(?:خب|خوب|باشه|اوه|هوم|اوکی|مرسی|ممنون|ممنونم|ادامه|بگو|شاید|واقعا|واقعاً|راستش|اصلا|اصلاً|هیچی|چیزی|دیگه|الان|فعلا|فعلاً|هنوز|یه|یک|رو|را|که|و|هم|من|تو|این|اینو|اون|آن|از|به|با|در)$/, YESNO = /^(?:نه|آره|اره|بله|خیر)$/;
  /* «پاسخِ واقعی» = جز «نمی‌دونم/گیر کردم» و واژه‌های پرکننده چیزی دارد (ناتهی — بی آستانهٔ عددی؛ «۷» یا «نه» ِ تنها پاسخ است، «نه… نمی‌دونم» نه) */
  function realReply(t) {
    t = String(t || ""); var dk = NOTKNOW_RE.test(t) || STUCK_RE.test(t);
    var w = t.replace(NOTKNOW_G, " ").replace(STUCK_G, " ").replace(/[ً-ٰٟ]/g, "").replace(/[،؛؟«»٪٫٬]/g, " ").replace(/[^؀-ۿa-zA-Z0-9۰-۹‌]+/g, " ").split(/\s+/).filter(Boolean);
    return w.filter(function (z) { return !FILLER.test(z) && !(dk && YESNO.test(z)); }).length > 0;
  }
  AS.coachRealReply = realReply;
  function mkey(t) { return clip(String(t || "").replace(/\s+/g, " ").trim(), 160); }
  function isUser(m) { return !!m && m.role === "user" && !/^\[سامانه/.test(String(m.text || "")); }
  /* پیامِ کاربرِ بعد از نمایهٔ i و این‌که پاسخِ مدل به آن پیام گزارشِ وضع داشت (پس الگو دربارهٔ آن پیام تصمیم نمی‌گیرد) */
  function replyAfter(M, i) { for (var j = i + 1; j < M.length; j++) if (isUser(M[j])) return j; return -1; }
  function reported(M, j) { for (var k = j + 1; k < M.length; k++) { var m = M[k]; if (!m) continue; if (isUser(m)) return false; if (m.role === "ai") return (m.actions || []).indexOf("coach_state") >= 0; } return false; }
  function aiQs(m) { var out = []; String((m && m.text) || "").split(/(?<=[؟?])\s+|\n+/).forEach(function (t) { t = String(t).trim(); if (/[؟?]$/.test(t) && t.length >= 6) out.push(t); }); return out; }
  /* تورِ پولیا دورِ ۵ (F1، عدم‌تقارنِ خطا): پشتیبانِ الگویی **هرگز** پرسشی را «پاسخ‌گرفته» نمی‌کند. پیش‌تر پرسشِ پیشینِ دستیار با هر پیامِ واقعیِ بعدی
     پاسخ‌گرفته می‌شد و قلابِ همین نوبت (پیش از رسیدنِ گزارشِ مدل) به مدل می‌گفت «دوباره نپرس» — پرسشِ پولیا بی‌صدا می‌پرید (s01، s31، s38). «پاسخ‌گرفته» فقط از
     (الف) گزارشِ سنجیدهٔ مدل (دفترِ همان مسئله)، (ب) پاسخِ صفحه؛ و «گفته‌شده» از برچسبِ صریحِ خودش («مجهول…»). نامِ تابع برای سازگاری می‌ماند. */
  function askedInChat() { return []; }
  function answeredIn(q, asked) {
    var a = qToks(q); if (a.length < 2) return false;
    return asked.some(function (x) { var b = qToks(x), n = a.filter(function (w) { return b.indexOf(w) >= 0; }).length; return n * 5 >= a.length * 3; });   // سه‌پنجمِ واژه‌های پرسش در پرسشِ پاسخ‌گرفته (پشتیبان)
  }
  /* دفترِ صفحه: پرسشی که ادعای «ans» ِ مدل درباره‌اش از سنجش گذشت — دورِ ۵ (F3): **برای هر مسئله** (C.ansBy[pk])، نه برای کلِ سشن؛
     پاسخِ «مجهول چیست؟» ِ مسئلهٔ پدر روی فرزندِ همان سشن «پاسخ‌گرفته» نیست (s24، s28). pk = «l:<pid>» برای مسئلهٔ زنده، «c:<n>» برای مسئلهٔ فقط‌درگفت‌وگو
     (n با هر مسئلهٔ تازهٔ گفت‌وگو جلو می‌رود)، «t:<کلید>» برای شبیه‌ساز. دفترِ کهنهٔ C.ans (بی ansBy) همان مسئلهٔ جاری است (رفتارِ پیشین). */
  function ledgerOf(s, pk) {
    var C = s && s.coach; if (!C) return null; pk = pk || C.pk || "c:0";
    if (!C.ansBy) { if (!C.ans) return null; C.ansBy = {}; C.ansBy[pk] = C.ans; delete C.ans; }
    return C.ansBy[pk] || null;
  }
  function ledgerAns(s, q, pk) { var L = ledgerOf(s, pk); return !!(L && q && L[q]); }
  AS.coachLedger = function (s, pk) { return Object.keys(ledgerOf(s, pk) || {}); };
  function answeredQ(s, q, asked) { return ledgerAns(s, q) || answeredIn(q, asked); }
  AS.coachAnswered = function (s, q) { return answeredQ(s, q, askedInChat(s)); };
  /* B11 (s12): کاربستِ پرسش در گفت‌وگو هم پلهٔ نردبانِ همان پرسش است (A.qUses ِ a36 می‌خواند) — نه فقط پاسخ‌های صفحه:
     دورِ ۴ (E1): از دفترِ سنجیده (ansLog: فقط پاسخِ واقعی؛ ownLog: بخشِ فهمی که خودش ناپرسیده گفت ۲)؛ برای پیامِ گزارش‌نشده، پشتیبان:
     پرسشِ دستیار و **پیامِ بعدیِ** کاربر اگر پاسخِ واقعی است («نمی‌دونم» کاربست نیست)، و صورتِ کاملِ خودش با برچسبِ صریح (نه صورتِ چسبانده با «؟» و رقم).
     روزِ کاربست = روزِ پیامِ کاربر؛ چند کاربست در یک روز یک پله‌اند (همان قاعدهٔ A.qRung). */
  function dayOf(at) { return A.localDay ? A.localDay(at) : String(at || "").slice(0, 10); }
  AS.chatUses = function (q) {
    var out = [], ps = qParts(q);
    S.all("achat", function (x) { return x && (x.msgs || []).length; }).forEach(function (se) {
      var M = se.msgs, seenDay = {}, C = se.coach || {};
      (C.ansLog || []).forEach(function (e) { if (!e || e.q !== q) return; var d = dayOf(e.at); if (seenDay[d]) return; seenDay[d] = 1; out.push({ q: q, at: e.at, d: d, self: e.self, src: "chat", sess: se.id }); });
      /* دورِ ۵ (F1): «پیامِ بعدی پاسخ است» دیگر کاربست شمرده نمی‌شود — کاربستِ نادرست پله را زود بالا می‌برد و کمک را زود کم می‌کند (زیان‌بار) */
      if (!ps.length) return;
      (C.ownLog || []).forEach(function (e) { if (!e || !ps.every(function (k) { return (e.p || []).indexOf(k) >= 0; })) return; var d = dayOf(e.at); if (seenDay[d]) return; seenDay[d] = 1; out.push({ q: q, at: e.at, d: d, self: 2, src: "chat-own", sess: se.id }); });
      var intro = -1; M.forEach(function (m, i) { if (intro < 0 && isUser(m) && !AS.notProblem(m.text)) intro = i; });
      M.forEach(function (m, i) {
        if (!isUser(m) || reported(M, i)) return;
        var sp = statedParts(m.text, i === intro), d = dayOf(m.at); if (seenDay[d] || !(sp.u && sp.d && sp.c)) return;   // صورتِ کاملِ خودش (مجهول، داده و شرط با هم)، نه یک «؟» ِ تنها
        var askedBefore = M.slice(0, i).some(function (x) { return x && x.role === "ai" && answeredIn(q, [String(x.text || "")]); }); if (askedBefore) return;
        seenDay[d] = 1; out.push({ q: q, at: m.at, d: d, self: 2, src: "chat-own", sess: se.id });
      });
    });
    return out;
  };
  /* ضرب‌المثلِ مرحله، بی تکرار در یک سشن، با ضدِ آن (خودِ کتاب: «همهٔ کلیدها» ⇄ «زیاده‌روی در تعویضِ طرح»؛ «باور به آنچه می‌خواهیم» ⇄ «فقط به آنچه ارزشِ شک دارد شک کن») */
  var PROV_OPP = { C155: "C158", C158: "C155", C157: "C158", C161: "C167", C167: "C161", C153: "C154", C154: "C153" };
  function provText(id) { var x = srcItems().filter(function (y) { return y.id === id; })[0]; return x && x.quote ? x.quote : (((A.HEUR_WISDOM || []).filter(function (y) { return y.id === id; })[0]) || {}).t || ""; }
  /* به ترتیبِ جای خودش در مرحله (هم‌جا‌ترین اول)، نه با شمارِ پیام؛ تکراری نه */
  /* دورِ ۱۱ (K7): ضرب‌المثلی که متنش همین حالا در همین بلوک آمده (قارچ‌ها در سطرِ بازنگری، «جایی که اراده‌ای هست…» در «گامِ کوچک») دوباره نمی‌آید */
  function provNorm(t) { return String(t || "").replace(/[\s‌«»"'.،,؛:!…—\-()]+/g, ""); }
  function pickProverb(ph, s, cls, mt, avoid) {
    var av = provNorm(avoid), seenIn = function (x) { return [x.q, x.id ? provText(x.id) : ""].some(function (t) { var k = provNorm(t).slice(0, 18); return k.length >= 8 && av.indexOf(k) >= 0; }); };
    var pv = proverbs(ph, provKeys(ph, cls, mt)).filter(function (x) { return !av || !seenIn(x); }); if (!pv.length) return null;
    /* دورِ ۱۲ (L6، s25 p6، s26 p4): ضدِ ضرب‌المثل (PROV_OPP) هم نباید نقلی باشد که همین حالا در بلوک آمده — آن‌گاه ضرب‌المثل بی ضد می‌آید */
    var oppIn = function (x) { var o = x.id && PROV_OPP[x.id]; if (!o || !av) return false; var k = provNorm(provText(o)).slice(0, 18); return k.length >= 8 && av.indexOf(k) >= 0; };
    var used = (s && s.coach && s.coach.prov) || [], fresh = pv.filter(function (x) { return used.indexOf(x.id || x.q) < 0; }), pool = fresh.length ? fresh : pv;
    var pick = pool[0];   // ضرب‌المثلِ لحظه (مثلاً ته‌نشینی پس از گیر — B14) عوض نمی‌شود؛ فقط ضدِ تکراری‌اش نمی‌آید
    return oppIn(pick) ? Object.assign({}, pick, { noOpp: true }) : pick;
  }
  /* B2/D2: «پاسخ‌گرفته» = پرسشی که دستیار پرسید و کاربر جواب داد، **یا** بخشی از فهم که کاربر خودش (ناپرسیده) گفت — مجهول/داده/شرط */
  function qParts(q) {
    q = String(q || "");
    if (/^فرض چیست؟ حکم/.test(q)) return ["u", "d"];
    if (/^(?:مجهول|دقیقاً چه می‌خواهی)/.test(q)) return ["u"];
    if (/^(?:داده‌ها|چه داری)/.test(q)) return ["d"];
    if (/^(?:شرط چیست|کدام قیدها)/.test(q)) return ["c"];
    return [];
  }
  function statedQ(q, st) { var ps = qParts(q); return !!st && ps.length > 0 && ps.every(function (k) { return st[k]; }); }
  /* خطوطِ مشترکِ مربی. o: { ph, qs, tries, seed, cls, s, pid, closed, mt, answered } — بی qs ⇒ پرسش‌های نوع‌دارِ همان مرحله */
  var QID = { u: "u", p: "p", c: "e", b: "b" };
  /* E1: دستورِ گزارشِ وضع — در قلاب (نه SYS)، به زبانی که مدلِ «میانگینِ لفظی» هم بفرستدش */
  var STATE_RULE = "- **گزارشِ وضع (در پایانِ هر پاسخِ مربی، در actions):** {\"do\":\"coach_state\",\"ph\":\"u|p|e|b\",\"said\":[],\"ans\":[],\"stuck\":false,\"fail\":false,\"role\":\"self|teacher\",\"nat\":\"objective|practical|life|?\"} — " +
    "فقط دربارهٔ **آخرین پیامِ کاربر** (نه پاسخِ خودت): ph = مرحله‌ای که حرفش در آن است (u فهم، p طرح، e اجرا، b بازنگری)؛ said = آنچه خودش با حرفِ خودش گفت: u مجهول، d داده، c شرط، plan طرح، result نتیجه/جواب ([] اگر هیچ؛ صورتِ مسئله را که فقط آورد «گفتنِ مجهول» نشمار)؛ " +
    "ans = شناسهٔ پرسش‌هایی از فهرستِ همین مرحله (مثلِ u1، p4) که همین پیام **واقعاً** جوابشان داد ([] اگر «نمی‌دونم»، بی‌ربط یا پرسشِ متقابل)؛ stuck = گیر است؛ fail = گفت جواب/راهش غلط درآمد یا حل نشد؛ role = teacher فقط اگر می‌خواهد به یادگیرنده‌ای (بچه، شاگرد) یاد بدهد؛ nat = حدسِ نوع (? اگر نمی‌دانی). " +
    "صفحه این را با حرفِ خودِ کاربر می‌سنجد؛ چیزی را که نگفته ادعا نکن.";
  AS.COACH_STATE_RULE = STATE_RULE;
  /* ---------- دورِ ۱۰ (J1): «لحظه»های پولیا در یک تابع، با اولویتِ صریح ----------
     پولیا: به حرکتِ واقعیِ همین پیامِ او پاسخ بده — «فقط جواب» بی هیچ تلاشِ دیدنی (s38 p1) > آزمودنِ حدس > ادعای «ثابت شد» از چند نمونه (C145) >
     «مطمئنی درسته؟» دربارهٔ گزینه‌ای که خودش برگزید (نتیجه را با شرط بسنج، A058/B003) > ادعای محلِ بحث > ردِ حدس (B231) > رها کردنِ کلِ راه (C095) >
     «اقتدار ⇐ فراموشی» ِ معلم (A129) > چند مجهول با هم (A044) > مثالِ نقض ⇐ تنگ کردنِ دامنه (C107) > کلی‌تر کردن (A263) > «چرا X؟» ⇐ حدسِ خودش اول (A073) >
     کل را ببین (A191) > ضرب‌المثلِ خودش (C150) > پیشنهادِ فهرست. نخستینِ این فهرست که همین نوبت رخ داد پرسشِ نوبت است؛ هر سطرِ لحظهٔ دیگر زمینه.
     تلاشِ دیدنی = کارِ خودش در متنِ خودش (فرمول، رابطه با متغیر، طرح، حدس، حدسِ ردشده، یافته) — «گیر کردم»/«نیم ساعته موندم» تلاش را نشان نمی‌دهد. */
  var ONLY_Q = "خودت تا کجا رفتی و کجا ماندی؟", OPT_Q = "گزینه‌ات را با تک‌تکِ بخش‌های شرط بسنج — هر بخش را برآورده می‌کند؟",
    CLAIM_Q = "ثابتش می‌کنی یا با مثالِ نقض ردش می‌کنی — کدام را اول امتحان می‌کنی؟",
    REL_Q = "از نتیجه یا روشِ همان که بلدی، این‌جا می‌توانی استفاده کنی؟",
    PROOF_Q = "در حالت‌هایی که امتحان کردی، چه چیزی هست که نشدن را لازم می‌آورد — و برای هر حالتی، نه فقط این‌ها، برقرار می‌ماند؟",
    /* دورِ ۱۳ (M4، s38 p6 در برابرِ s11 p3): پرسشِ برهان تابعِ آن است که حالت‌های آزموده چه نشان دادند — «امتحان کردم درسته … چطور ثابت کنم» (حالت‌ها جواب دادند)
       ⇒ همان ویژگیِ کارساز برای حالتِ کلی؛ «امتحان کردم، نشد … نمیشه» (حالت‌ها شکست خوردند، ادعای ناممکن بودن) ⇒ PROOF_Q ِ بالا (چه چیزی نشدن را لازم می‌آورد) */
    PROOF_OK_Q = "چرا برای هر حالت؟ در حالت‌هایی که امتحان کردی، کدام ویژگی کار را درست کرد — همان را برای حالتِ کلی نشان بده",
    DEF_Q = function (w) { return "به تعریف‌ها برگرد: «" + (w || "واژهٔ کلیدی") + "» در همین مسئله دقیقاً یعنی کدام — کدام معنا را برمی‌گزینی؟"; },
    TEACH_Q = "یادگیرنده‌ات الان کجای کار است، و پیش از آن کدام پرسش را از او پرسیدی؟";
  /* دورِ ۱۲ (L6، s28 p1): «معلومه»، «واضحه»، «بدیهیه»، «شکی نیست» هم یقینِ بی‌آزمون است (B107) */
  var CERT_RE = /مطمئنم(?![آ-ی])|(?:^|[\s،.!…])(?:معلومه|واضحه|بدیهیه|بدیهی\s*است|واضح\s*است|شکی\s*(?:نیست|نداره|ندارد))(?![آ-ی])(?!\s*(?:دیگه|دیگر)(?![آ-ی]))|صد\s*در\s*صد|(?:۱۰۰|100)\s*(?:٪|%|درصد)|شک\s*ندارم|همیشه\s*(?:درست|جواب\s*داده|کار\s*کرده|همین\s*(?:بوده|شده))|هیچ\s*وقت\s*(?:غلط|اشتباه)\s*(?:نبوده|نشده|درنیومده)/;
  /* دورِ ۱۱ (K8): ثبت‌گاهِ پیوندِ لحظه ⇐ حوزهٔ قلمرو = شناسه‌های «terr:» در دفترِ پوششِ منبع (sources/polya_how_to_solve_it/coverage.json ⇒ window.SRC_COV) —
     همان داده‌ای که «📚 منبع‌ها» و یالِ «پوشش» ِ «🗺 نقشه‌ها» می‌خوانند؛ این‌جا هیچ فهرستِ دستی نیست */
  function itemAreas(items) {
    var S0 = (window.SRC_COV || []).filter(function (x) { return x && x.id === "polya_how_to_solve_it"; })[0], V = (S0 && S0.coverage && S0.coverage.verdicts) || {}, out = [];
    (items || []).forEach(function (id) { ((V[id] || {}).system || []).forEach(function (sid) { var m = /^terr:\s*([A-Za-z0-9_]+)/.exec(String(sid)); if (m && out.indexOf(m[1]) < 0) out.push(m[1]); }); });
    return out;
  }
  AS.coachItemAreas = itemAreas;
  var SELF_DONE_T =/(?:آخرش|بعد(?:ش)?|خب)?\s*خودم\s*(?:حلش|حل\s*ش|حل)\s*(?:کردم|کرده‌?ام)|آخرش\s*خودم\s*(?:گفتم|جواب\s*(?:رو|را)\s*گفتم)/;
  var DISPUTE_RE = /حق\s*(?:داره|دارد|با\s*(?:اون|او|کیه))|راست\s*می[‌\s]?گ(?:ه|ن|ی|ید|ین)?\s*[؟?]|درسته\s*[؟?]|درست\s*می[‌\s]?گه/;
  /* دورِ ۱۰ (J2، s13): «مطمئنی (این) درسته؟» دربارهٔ گزینه/راهی که خودش برگزید ⇒ وارسیِ نتیجه با بخش‌های شرط، نه «درست است/نه» */
  var OPTCHK_RE = /مطمئن(?:ی|ید|\s*(?:هستی|هستید|باشم))\s*(?:که\s*)?(?:این|اون|همین)?\s*(?:کار\s*)?(?:درسته|درست\s*(?:است|ه)|جواب\s*می[‌\s]?ده|کار\s*می[‌\s]?کنه)|(?:این|همین)\s*(?:گزینه|انتخاب|راه)\s*(?:درسته|درست\s*است)\s*[؟?]/,
    OPT_RE = /گزینه|انتخاب|تصمیم|راه[‌\s]?حل|(?:یه|یک)\s*راه/;
  function optCheck(t) { t = ownText(t); return OPTCHK_RE.test(t) && OPT_RE.test(t); }
  /* دورِ ۱۰ (ادغام): کارِ خودش به اول‌شخص — «تا اینجا … حساب کردم/گرفتم/نوشتم/کشیدم/امتحان کردم/به دست آوردم» — تلاشِ دیدنی است */
  var OWNWORK_RE = /(?:تا\s*(?:این\s*جا|اینجا)[^.؟?!\n]{0,80})?(?:حساب|امتحان|رسم|فرض|جایگذاری|جای‌گذاری)\s*کردم|(?:^|[\s،؛])(?:گرفتم|نوشتم|کشیدم|به\s*دست\s*آوردم|بدست\s*آوردم|رسیدم)(?=$|[\s.،؛!؟])/;
  function attemptIn(t, teach) { var w = ownText(t); return formulas(w).length > 0 || OWNWORK_RE.test(w) || varEq(w) || PLAN_RE.test(w) || GUESS_REF_RE.test(w) || FOUND_RE.test(w) || AHA_RE.test(w) || guessNow(t, teach); }
  /* پیامِ معرفیِ مسئله فقط خودش؛ وگرنه پیام‌های پیشینِ همین سشن هم (تلاشی که پیش‌تر گفت) */
  function attemptSeen(s, mt, teach, intro) {
    if (attemptIn(mt, teach)) return true; if (intro) return false;
    return ((s && s.msgs) || []).some(function (m) { return isUser(m) && mkey(m.text) !== mkey(mt) && attemptIn(m.text, teach); });
  }
  AS.coachAttemptSeen = attemptSeen;
  function turnMoments(o, mt, x) {
    var teach = !!o.teach, has = {}, list = [];
    var add = function (id, on, q) { if (!on) return; var m = { id: id, q: q }; has[id] = m; list.push(m); };
    var attempt = attemptSeen(x.s, mt, teach, !!o.isIntro), only = ONLY_ANS_RE.test(mt) && !attempt;
    var opt = !o.guess && optCheck(mt), claim = !o.guess && !opt && DISPUTE_RE.test(mt);
    add("A073", only, ONLY_Q);
    add("guess", !!o.guess, GUESS_Q);
    add("C145", !!x.hc && !o.guess, "برهانش؟ — چرا برای هر حالت، نه فقط این‌ها؟");
    /* دورِ ۱۲ (L1، s11 p3): خودش آزمود («امتحان کردم، نشد») و برهان می‌خواهد ⇒ پرسشِ برهان (خانوادهٔ C145)، نه «چطور می‌آزمایی‌اش؟» */
    add("C145p", !x.hc && !o.guess && testedProof(mt), proofQ(mt));
    /* دورِ ۱۲ (L1، s13 p3، s27 p2): معنای واژهٔ کلیدی را می‌جوید (نامزدها/تردید) ⇒ «به تعریف‌ها برگرد» (A038) پرسشِ نوبت است */
    add("A038", !o.guess && defAsk(mt), DEF_Q(defWord(mt)));
    add("check", opt, OPT_Q);
    add("claim", claim, CLAIM_Q);
    add("B231", !!x.refTurn, "از ردش چه آموختی و کدام فرضِ پنهان شکست؟");
    add("C095", ABANDON_RE.test(mt), "کدام حلقه دقیقاً شکست؟");
    /* دورِ ۱۱ (K10، s38 p7): نتیجهٔ حل‌شده‌ای را که بلد است آورد و نمی‌داند به کار ببرد ⇒ «این‌جا مسئلهٔ مرتبطی هست که پیش‌تر حل شده: می‌توانی از آن استفاده کنی؟» (A032/B100) */
    add("related", RELATED_RE.test(mt), REL_Q);
    /* دورِ ۱۱ (K11، s15 p2، s16 p1): قابِ معلم — «خودم حلش کردم» یعنی خودِ او؛ لحظه‌اش فقط وقتی همین را گفت و نگفت کدام پرسش را از یادگیرنده پرسید (TQ_RE)؛
       پیش از A129 (همان گفتهٔ «خودم حل…» را TA_RE هم می‌گیرد، ولی کارِ همین پیام دانستنِ جای یادگیرنده است) */
    add("A167t", teach && SELF_DONE_T.test(mt) && !TQ_RE.test(mt), TEACH_Q);
    add("A129", !!x.a129, "");
    add("A044", !!x.multiNow, "چند چیز را با هم خواستی — آن‌ها را زیرمسئله‌های جدا کن: کدام را اول می‌گشایی و چرا؟");
    add("C107", COUNTER_RE.test(mt) || !!(o.refuted && o.refGen), "برای کجا هنوز درست است؟");
    add("A263", genTalk(mt), "در حالتِ کلی چه چیزی آشکار می‌شود که در حالتِ خاص پنهان است؟");
    add("A073w", whyAsk(mt) && !INDIRECT_RE.test(mt) && !ONLY_ANS_RE.test(mt) && !(teach && TA_RE.test(mt)), "خودت فکر می‌کنی چرا؟");
    add("A191", !!o.intro && longStmt(mt), "کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی؟");
    add("C150", OWN_PROV_RE.test(mt), "ضدِ این ضرب‌المثل چه می‌گوید، و کدام به همین لحظه می‌خورد؟");
    /* دورِ ۱۱ (K1): مرورِ بی‌نگاهِ مسئلهٔ حل‌شدهٔ مرتبط و ادامهٔ مسئلهٔ بازِ تنها — لحظه‌های همین تابع، زیرِ کارِ خودِ این پیام (پیش‌تر سطرهای «بپرس» ِ بلوک‌های جدا) */
    if (o.recall) add("recall", true, RECALL_Q(o.recall.title));
    /* دورِ ۱۲ (L6، s26 p5): پس از بستنِ مسئله در همین سشن، «نمی‌دونم/گیرم» ِ کوتاه دربارهٔ همان ⇒ درسِ بازنگریِ خودش (بلوکِ «مسئلهٔ حل‌شدهٔ مرتبط») پرسشِ نوبت است، نه u1 */
    if (o.lesson) add("lesson", true, o.lesson.q);
    /* دورِ ۱۶ (N1، s08، s31): مسئله‌ای که در همین سشن در گفت‌وگو بسته شد و بازنگری‌اش «کدام پرسش کمک کرد؟» یا «سلیقه» را کم دارد — پیش از مسئلهٔ بعد، یکی در هر نوبت؛ زیرِ کارِ خودِ همین پیام (حدس، «فقط جواب»، درسِ بازنگری، مرورِ بی‌نگاه) */
    if (o.lbRest) add("lbRest", true, o.lbRest.q);
    if (o.openProb) add(o.openProb.on ? "openOn" : "open", !o.openProb.on || !!o.openProb.q, o.openProb.on ? o.openProb.q : OPEN_Q(o.openProb.title));
    return { list: list, has: has, attempt: attempt, only: only,
      ptr: o.live ? "پرسشِ این نوبت همان یکیِ «مسئلهٔ زندهٔ این سشن» است" : "پرسشِ این نوبت همان یکی است که بالا آمده («پیشنهادِ این نوبت» یا سطرِ «پرسشِ این نوبت همین است»)" };
  }
  AS.coachMoments = turnMoments;
  function coachLines(o) {
    o = o || {}; var ph = PH_OF[o.ph] || "p", cls = o.cls || "any", s = o.s || null, mt = String(o.mt || "");
    /* H3 (دورِ ۷، s25/s12): سرواژه و فهرست از یک مرحله — حدسِ تازه پس از مسئلهٔ بسته‌شده ⇒ «فهم»؛ نوبتِ ردِ حدس ⇒ «طرح» (نه فهرستِ بازنگری زیرِ سرواژهٔ دیگر) */
    /* دورِ ۸ (I-coach 1، s25 p8، s12 p5): همین جابه‌جایی وقتی فهرستِ پیش‌فرضِ مرحله از بیرون آمده (o.qsDef — فهرستِ بازنگریِ مسئلهٔ بسته‌شده) هم؛
       و نوبتِ ردِ حدس وقتی مرحله «فهم» است ⇒ «طرح» (مجهول را گفته؛ «مجهول چیست؟» دوباره نه). فهرستِ ویژهٔ تور (o.qs بی qsDef) دست نمی‌خورد. */
    /* دورِ ۸ (I-coach 6، s16): نوبتِ تأملیِ پدر/معلم دربارهٔ اقتدار و فراموشی (A129) — پرسشِ بازنگریِ فهرست («نتیجه را وارسی کن») لحظهٔ او نیست */
    /* دورِ ۹ (s15، s16): لحظهٔ A129 بازنگریِ یاد دادن است — نه پیامِ آغازِ گفت‌وگو («خودم بلدم، فقط بگو چطوری بهش بگم») */
    /* دورِ ۱۰ (J2، s15 p2): معلمی که پرسش/سرنخِ خودش را گزارش می‌کند («گفتم: «… نه؟»» … «بعد خودم حل کردم») لحظهٔ A167 (پرسشِ بد) است، نه A129 */
    var a129 = !!o.teach && TA_RE.test(mt) && !TQ_RE.test(mt) && !!s && (s.msgs || []).filter(function (m) { return m && m.role === "user"; }).length > 1;
    var swPh = "", refTurn = !!o.refuted || GUESS_REF_RE.test(mt);
    if (!o.phShow && !o.live) { if (ph === "b" && o.closed && (o.guess || /حدس(?:م|\s*می[‌\s]?زنم)|فکر\s*(?:کنم|می[‌\s]?کنم)/.test(mt))) swPh = "u"; else if ((ph === "b" || ph === "u") && refTurn) swPh = "p"; }
    var qsFollow = !(o.qs || []).length || !!o.qsDef;
    if (swPh && qsFollow) ph = swPh;
    var qs = qsFollow && swPh ? [] : (o.qs || []).filter(Boolean); if (!qs.length) qs = phaseQs(ph, cls, o.pid);
    /* دورِ ۶ (G1، s01 روزِ ۲۰): «گفته‌شده» ِ الگو (statedParts) فقط مرحله را جلو می‌برد؛ هرگز پرسشی را «[پاسخ گرفته]» نمی‌کند — فقط دفترِ سنجیده/صفحه */
    var asked = s ? askedInChat(s) : [], ans = qs.filter(function (q) { return answeredQ(s, q, asked); }), open = qs.filter(function (q) { return ans.indexOf(q) < 0; });
    /* D2: پیشنهاد به ترتیبِ کلی ⇐ خاص بر پایهٔ پلهٔ کاربر در همین مرحله (چند پرسشِ آن پاسخ گرفته) — نخستین پرسشِ پاسخ‌نگرفته؛ نه با شمارِ پیام.
       E3 (دورِ ۴، s08): در طرح، رو به جلو گیر کرده ⇒ «از خواسته به عقب» نخست (اگر هنوز پاسخ نگرفته) */
    var back = ph === "p" && o.stuck ? open.filter(function (q) { return /به\s*عقب/.test(q); })[0] : "";
    var sug = back ? back : o.sug && open.indexOf(o.sug) >= 0 ? o.sug : o.sug && !answeredQ(s, o.sug, asked) ? o.sug : open.length ? open[0] : "";
    /* دورِ ۹ (s17): وقتی **همین پیام** چند مجهول را با هم خواسته (لحظهٔ A044) و بلوکِ زنده یا آزمودنِ حدس پرسشِ نوبت را نمی‌دهد، پرسشِ نوبت همان A044 است
       (زیرمسئله‌ها و ترتیبشان را خودش بگوید) — نه پرسشِ عمومیِ فهرست؛ وگرنه A044 هرگز به نوبت نمی‌رسید */
    var multiNow = !o.live && !o.guess && !o.dry && manyUnknowns(mt, true) && !OWN_ORDER_RE.test(ownText(mt));
    /* دورِ ۱۰ (J1): یک پرسشِ نوبت در هر بلوک — همهٔ «لحظه»ها از یک تابع (turnMoments) با اولویتِ صریح؛ بالاترین لحظه‌ای که همین نوبت رخ داد
       پرسشِ نوبت است (به‌جای پیشنهادِ فهرست) و هر سطرِ لحظهٔ دیگر «زمینه (نه پرسشِ دوم)» و بی «بپرس». با مسئلهٔ زنده پرسشِ نوبت از بلوکِ زنده است
       (همهٔ لحظه‌ها زمینه؛ «فقط جواب» ِ بی تلاش به A.liveCoach به‌صورتِ turn.onlyAns می‌رود). */
    var hc = heurClaim(mt);
    var MO = turnMoments(o, mt, { refTurn: refTurn, multiNow: multiNow, hc: hc, a129: a129, s: s });
    var win = !o.live && !o.dry ? MO.list[0] || null : null, isWin = function (id) { return !!win && win.id === id; };
    var sugList = sug;   // پلهٔ استقلالِ همین مرحله (معلمِ خیالی) از پرسشِ فهرست سنجیده می‌شود، نه از پرسشِ لحظه
    if (win && win.id !== "B231" && win.id !== "A129") sug = win.q;
    /* E1: شناسهٔ هر پرسش (u1، p3، e2، b1 …) — مدل در گزارشِ وضع با همین شناسه می‌گوید کدام پرسش پاسخ گرفت */
    if (s && !o.live) { var C1 = s.coach = s.coach || {}; C1.qmap = {}; qs.forEach(function (q, i) { C1.qmap[QID[ph] + (i + 1)] = q; }); }
    /* F4 (دورِ ۵): سرواژه از نوع × داور — اثباتیِ عینی «اثباتی»، pod ِ عینی «اثبات یا رد (حدس)»، pod ِ زندگی/عملی «فرضیه»، زندگی «تصمیمِ زندگی» */
    var podLife = o.ptype === "pod" && (cls === "life" || cls === "pract");
    /* G4 (دورِ ۶، s28): سرواژه با پرسشِ نوبت هم‌خوان — وقتی پرسشِ نوبت پرسشِ بازنگریِ «نتیجه‌ای گفتی» است (src turn-result ِ بخشِ مسئله) ⇒ «بازنگری»، با یادِ مرحلهٔ صفحه؛ ادعای «حل شد» که صفحه پرسشِ دیگری برایش دارد مرحله را عوض نمی‌کند (W3) */
    /* H3 (دورِ ۷، s22؛ سهمِ «live»): نامِ مرحلهٔ اجرا هم‌خوان با بلوکِ مسئله — عملی/زندگی «اجرا روی واقعیت» */
    var phF = function (k) { return k === "c" && (cls === "pract" || cls === "life") ? "اجرا روی واقعیت" : PH_FA[k]; };
    /* H3 (دورِ ۷، s25/s12؛ سهمِ «live»): حدسِ تازه پس از مسئلهٔ بسته‌شده مسئلهٔ تازه است (سرواژه «فهم»)؛ نوبتِ ردِ حدس بازنگری نیست — کار ادامه دارد («طرح») */
    var phHead = o.phShow || ph;
    if (swPh && (swPh !== "p" || qsFollow || ph === "b")) phHead = swPh;
    var L = ["# مربیِ حل (روحِ «چگونه آن را حل کنیم») — کمک نه خیلی کم، نه خیلی زیاد · مرحلهٔ محتمل: " + phF(phHead) + (o.phShow ? " (نتیجه‌ای گفت؛ صفحه هنوز «" + phF(ph) + "»)" : "") + (podLife ? " · فرضیه (داور: واقعیت و داوریِ خودش، نه برهان)" : cls === "prove" ? (o.ptype === "pod" ? " · اثبات یا رد (حدس)" : " · اثباتی") : cls === "obj" ? " · پاسخِ عینی" : cls === "pract" ? " · تصمیم/کارِ واقعی (داور واقعیت)" : cls === "life" ? " · تصمیمِ زندگی (داور: واقعیت و داوریِ خودش)" : "") + (o.teach ? " · کاربر مربیِ یادگیرنده است" : "") +
      " — اگر این نوبت دربارهٔ حلِ مسئله، حدس یا ادعایی نیست، این بلوک را نادیده بگیر."];
    L.push("- قاعدهٔ سبک: هر پیام فقط **یک ایده** و حداکثر **یک پرسش**، از کلی به خاص؛ کوتاه. جواب، نامِ قضیه، گزینهٔ درست یا گامِ بعد را لو نده.");
    if (o.teach) L.push("- **قابِ مربی (B10):** کاربر می‌خواهد به یادگیرنده‌اش (فرزند/شاگرد) یاد بدهد — او حل‌کننده نیست. پرسش‌هایی پیشنهاد کن که **او از یادگیرنده بپرسد** (کلی ⇐ خاص، یکی‌یکی، با درنگ)، هرگز پاسخ یا راه‌حل برای گفتن به یادگیرنده؛ مرحله مرحلهٔ یادگیرنده است.");
    /* دورِ ۱۱ (K11): «خودم حلش کردم» ِ قابِ معلم لحظه است (A167t در turnMoments)، نه سطرِ آزادِ «بپرس…» کنارِ پرسشِ نوبت */
    if (MO.has.A167t) L.push(isWin("A167t") ? "- **پرسشِ این نوبت همین است:** «خودم حلش کردم» یعنی خودِ او حل کرد، نه یادگیرنده " + cite("A167") + ": بپرس «" + MO.has.A167t.q + "» — جای یادگیرنده و پرسشِ خودش را بشنو، بعد پرسشِ کلی‌تری پیشنهاد کن."
      : "- زمینه (نه پرسشِ دوم): «خودم حلش کردم» یعنی خودِ او حل کرد، نه یادگیرنده — جای یادگیرنده و پرسشی که از او پرسید پس از پرسشِ این نوبت.");
    L.push("- پرسش‌ها را مکانیکی نخوان " + (srcQ("A164") || "") + ": فقط پرسشی که با وضعِ همین لحظه می‌خواند. هیچ قاعدهٔ خطاناپذیری برای کشف نیست " + (srcQ("B233") || "") + " — فهرست راه‌نماست، نه دستور.");
    /* مسئلهٔ زندهٔ بسته‌شده (o.live): پرسش و فهرست فقط از بلوکِ «مسئلهٔ زندهٔ این سشن» (A.liveCoach ِ بخشِ مسئله) — یک منبعِ پرسش در هر نوبت (ادغامِ G1/G2) */
    /* دورِ ۱۱ (K5، s22 p4): داور هنوز انتخاب نشده ⇒ پرسشِ بلوکِ زنده پرسشِ داور است، نه از فهرستِ مرحله — اشاره بی نامِ فهرست */
    if (o.live) L.push("- پرسشِ این نوبت: **فقط** همان یک پرسشی که «مسئلهٔ زندهٔ این سشن» (بالا) می‌دهد" + (o.kindUnset ? " — همان پرسشِ بلوکِ زنده؛ پرسشِ دیگری نیاور." : "، از همان فهرستِ «" + phF(ph) + "» ِ صفحه — پرسشِ دیگری از فهرستِ دیگری نیاور.") + " پرسشی را که در صفحه یا همین گفت‌وگو جواب داده دوباره نپرس." +
      (o.claim ? " **می‌گوید حل شد، ولی صفحه هنوز «" + phF(ph) + "» است" + (o.claim !== true ? " (" + clip(o.claim, 90) + ")" : "") + ":** «حل شد» را تأیید نکن و جشن نگیر؛ او را به «✅ حل شد» و بازنگریِ خودِ صفحه ببر." : ""));
    else L.push("- پرسش‌های «" + PH_FA[ph] + "» (کلی ⇐ خاص): " + qs.map(function (q, i) { return QID[ph] + (i + 1) + ") " + q + (ans.indexOf(q) >= 0 ? " [در گفت‌وگو پاسخ گرفته — دوباره نپرس]" : ""); }).join(" ") +
      (isWin("A129") ? " · این نوبت پیشنهادی از این فهرست نیست: لحظهٔ «اقتدار ⇐ فراموشی» (A129، پایین) خودش کارِ همین نوبت است — بازنگریِ او دربارهٔ یاد دادن، نه وارسیِ نتیجهٔ مسئله"
        : isWin("B231") ? " · پس از پرسشِ ردِ حدس (پایین)، نوبتِ بعد: «" + sug + "»" : sug ? " · پیشنهادِ این نوبت: «" + sug + "»" : " · همه در گفت‌وگو پاسخ گرفته‌اند: بپرس «الان از خودت چه می‌پرسی؟» یا به مرحلهٔ «" + PH_FA[PH_NEXT[ph]] + "» برو") +
      ". اگر حرف‌هایش نشان می‌دهد از این مرحله گذشته، از نخستین پرسشِ «" + PH_FA[PH_NEXT[ph]] + "» شروع کن. پرسشی را که در همین گفت‌وگو جواب داده دوباره نپرس." +
      (win && win.id !== "B231" && win.id !== "A129" ? " (پیشنهادِ این نوبت از لحظهٔ همین پیام است، نه از فهرست — همان سطرِ «پرسشِ این نوبت همین است» ِ پایین؛ فهرست برای نوبت‌های بعد.)" : ""));
    L.push(STATE_RULE);
    /* H2 (دورِ ۷، s02): با مسئلهٔ زندهٔ بسته‌شده، گیرِ پیاپی را دنبالهٔ «کلی ⇐ خاص» ِ صفحه می‌دهد (پرسشِ نوبتِ بالا) — این‌جا تکرارِ همان پرسش را نخواه */
    /* دورِ ۱۲ (L2، s26 p5): قاعدهٔ سکوت به **پرسشِ همین نوبت** اشاره می‌کند، هرگز «پرسشِ پیشین» — زمینه، نه پرسشِ دوم */
    L.push(o.live ? "- زمینه (نه پرسشِ دوم): سکوت، «نمی‌دونم» یا پاسخِ بی‌ربط ⇒ پرسش همان «پرسشِ این نوبت» ِ بالا می‌ماند (صفحه پس از گیرِ پیاپی خودش پرسشِ خاص‌تری می‌دهد)، نه پرسشِ دیگر و نه جواب."
      : "- زمینه (نه پرسشِ دوم): سکوت، «نمی‌دونم» یا پاسخِ بی‌ربط ⇒ **پرسشِ همین نوبت** (همان بالا، نه پرسشِ نوبتِ پیشین) را با **تغییرِ کوچک** بگو (کوتاه‌تر، یا از زاویهٔ دیگر)، نه پرسشِ تازه و نه جواب؛ اگر پیاپی گیر ماند، یک پلهٔ خاص‌تر از همین فهرست.");
    /* دورِ ۱۲ (L2، G1): «معلمِ خیالی» نمونهٔ پرسشِ ثابت ندارد — گفت‌وگوی درونی با همان پرسشِ این نوبت، یا هیچ */
    L.push("- زمینه (نه پرسشِ دوم) — شیوهٔ همان یک پرسشِ نوبت: حلِ مسئله مهارتی عملی است، مثلِ شنا " + (srcQ("A088") || "") + ": او حل می‌کند و تو «معلمِ خیالی» ِ کنارش هستی " + (srcQ("A069") ? "(" + srcQ("A069") + ") " : "") + "— دعوتش کن بلند فکر کند و پرسشِ «معلمِ خوب» را کم‌کم خودش از خودش داشته باشد. بلند فکر کردن را **الگو کن** " + (srcQ("B237") || "") + ": گاهی یک سطرِ کوتاهِ گفت‌وگوی درونی که **همان** پرسشِ این نوبت را از زبانِ خودت می‌گوید — نه پرسشی دیگر — بعد نوبت را به او بده.");
    if (qs.length && A.qRung) {
      var own = A.Q_OWN_RUNG || 3, rg = qs.map(function (q) { var n = 0; try { n = A.qRung(q) || 0; } catch (e) { } return { q: q, n: n }; });
      /* دورِ ۱۱ (K1): شیوهٔ همان یک پرسشِ نوبت است، نه پرسشِ دوم — بی «بپرس» و بی پرسشِ خودش */
      L.push("- زمینه (نه پرسشِ دوم) — شیوهٔ همان یک پرسشِ نوبت: سطحِ استقلالِ کاربر در پرسش‌های همین مرحله (پلهٔ نردبانِ ۱/۳/۷/۲۱/۶۰ از کاربست‌های خودش): " + rg.map(function (x) { return "«" + clip(x.q, 40) + "» پلهٔ " + fa(x.n); }).join("؛ ") +
        ". کمک را به همین اندازه کم کن: پلهٔ ۰ ⇐ پرسشِ نوبت کامل؛ پلهٔ ۱ تا " + fa(own - 1) + " ⇐ کوتاه‌تر و کلی‌تر؛ پلهٔ " + fa(own) + " به بالا ⇐ به‌جای خودِ پرسش، دعوت به این‌که بگوید الان از خودش چه می‌پرسد.");
      /* F6 (دورِ ۵، s30): از پلهٔ استقلال به بالا (A.Q_OWN_RUNG، از نردبانِ خودِ پرسش) معلمِ خیالی **به نام** می‌آید و پاسخ از پیامِ خودِ او بلندتر نیست —
         کم کردنِ کمک نسبی است (به اندازهٔ حرفِ خودش)، نه با عددِ ثابت */
      var sr = 0; try { sr = sugList ? A.qRung(sugList) || 0 : 0; } catch (e) { }
      /* دورِ ۱۰ (J1، s30): این سطر پرسشِ دوم نیست — شیوهٔ پرسیدنِ همان یک پرسشِ نوبت است (زمینه) */
      if (sug && sr >= own && mt) L.push("- زمینه (نه پرسشِ دوم) — شیوهٔ همان یک پرسشِ نوبت: از پلهٔ " + fa(own) + " به بالا (این پرسش پلهٔ " + fa(sr) + "): او حالا **معلمِ خیالیِ خودش** است " + cite("A069") + " — همان پرسشِ نوبت را نپرس؛ به‌جایش فقط بگو «معلمِ خیالی‌ات الان چه می‌پرسید؟» و منتظر بمان. پاسخت بلندتر از پیامِ خودش (" + fa(mt.length) + " نویسه) نباشد — کمک نه زیاد نه کم " + cite("A074") + ".");
    }
    L.push("- پایانِ نردبانِ سرنخ (" + (srcQ("C188") || "C188") + "): اگر جدی تلاش کرده" + (o.tries ? " (تا حالا " + fa(o.tries) + " پیام)" : "") + " و خاص‌ترین سرنخ را هم گرفته و هنوز گیر است — اگر نردبان تمام شد: ایدهٔ کلیدی را جدا کن و فقط گامِ بعد را بگو، سپس «کتاب را ببند و خودت دوباره حل کن»؛ و پس از بازسازیِ خودش، بازنگری.");
    L.push("- گامِ کوچک ارزش دارد " + (srcQ("B076") || "") + (srcQ("C153") ? " " + srcQ("C153") : "") + ": اگر گامش را ناچیز شمرد، دقیق بگو همان گام چه چیزی را جلو برد (بی تعارف). دلسردی، شرم، خشم، «وقتم هدر رفت»، «استعدادشو ندارم» یا میلِ رها کردن ⇒ 🌱 کوچک‌ترین گامِ بعد (حالتِ خاص، بخشی از شرط)، بی دلداریِ کلیشه‌ای و بی حکم دربارهٔ او.");
    /* دورِ ۱۱ (K1): قاعدهٔ عامِ ادعا خودش پرسشی ندارد — یا همین سطر حاملِ پرسشِ نوبت است (حدس/وارسیِ گزینه/ادعای همین پیام برنده است) یا زمینه */
    var claimTurn = (o.guess && isWin("guess")) || (!!MO.has.check && isWin("check")) || (!!MO.has.claim && isWin("claim"));
    L.push((claimTurn ? "- **پرسشِ این نوبت همین است:** " : "- زمینه (نه پرسشِ دوم): ") + "ادعای محلِ بحث («حق داره؟»، «درسته؟»، «همیشه برقراره؟») یا حدسِ تازه ⇒ داوری نکن — راهش «ثابتش کن یا با مثالِ نقض ردش کن» است." + (o.guess ? " **همین پیام حدس است، نه نتیجه** (" + (guessWhy(mt, !!o.teach) || "«…درسته؟» پس از مقدار") + "): «درست است/نه» نگو؛ " + (isWin("guess") ? "پرسشِ این نوبت همین است: «" + GUESS_Q + "»." : MO.ptr + ".")
      : MO.has.check ? " **همین پیام درستیِ گزینه‌ای را می‌پرسد که خودش برگزید:** «درست است/نه» نگو؛ " + (isWin("check") ? "پرسشِ این نوبت همین است — نتیجه را با شرط بسنجد " + cite("A058") + "، بخش به بخش " + cite("B003") + ": «" + MO.has.check.q + "»." : MO.ptr + ".")
      : MO.has.claim ? " **همین پیام چنین ادعایی است.**" + (isWin("claim") ? " پرسشِ این نوبت همین است: «" + MO.has.claim.q + "»." : " (" + MO.ptr + ")") : ""));
    /* G4 (دورِ ۶، s11): مسئلهٔ پیشین را حل کرد و از آن مسئلهٔ تازه ساخت — همین بازنگریِ آن است؛ مرحلهٔ این بلوک برای مسئلهٔ تازه */
    if (o.made) L.push("- **مسئلهٔ پیشین را خودش حل کرد و از آن مسئلهٔ تازه‌ای ساخت** — ساختنِ مسئلهٔ تازه از حل‌شده خودش کارِ بازنگری است " + cite("C168") + ": یک جمله نامش ببر (بی پرسشِ دوم)؛ مرحلهٔ این بلوک و پرسشِ این نوبت برای **مسئلهٔ تازه** است، از «فهم».");
    if (o.goal && o.goalCtx) L.push("- زمینه (نه پرسشِ دوم): 🎯 مجهول هنوز «" + o.goal + "» است — هدف را گم نکن؛ ولی پرسشِ این نوبت همان «پیشنهادِ این نوبت» است (داده‌ای از صورت هنوز به کار نرفته).");
    else if (o.goal) L.push(win ? "- زمینه (نه پرسشِ دوم): 🎯 مجهول هنوز «" + o.goal + "» است — هدف را گم نکن؛ پس از پرسشِ این نوبت." : "- 🎯 مجهول هنوز «" + o.goal + "» است — این گام به آن نزدیک‌ترت کرد؟ (همان پیشنهادِ این نوبت؛ میانهٔ کار با کمیت‌های تازه: هدف را گم نکن — همتای «🎯 هدف را گم نکن» ِ صفحه؛ داده‌ها را همین حالا به کار برد، «داده‌ها چیست؟» را نپرس)");
    /* دورِ ۱۰ (J1): شکل و تعریف سطرهای فهرستِ مرحله‌اند — بی لحظهٔ برنده «به‌جای» پیشنهادِ این نوبت (نه کنارش)؛ با لحظهٔ برنده یا بلوکِ زنده زمینه */
    /* دورِ ۱۱ (K1): همیشه زمینه — «به‌جای» پیشنهادِ نوبت پرسشِ دومی بود که مدلِ لفظی کنارِ اولی می‌پرسید؛ حالا فقط شیوهٔ همان یک پرسش */
    var altOr = function (t, alt) { return "- زمینه (نه پرسشِ دوم): " + t + (win || o.live ? "" : alt); };
    if (ph === "u" || ph === "p") L.push(altOr("شکل " + (srcQ("B139") || "") + ": شکل یا جدولی که در گفت‌وگو توصیف شود (یا عکسش پیوست شود) — حتی اگر مسئله هندسی نیست.", " اگر همین حالا به کار می‌آید، همان پرسشِ نوبت را با شکل یا جدول همراه کن (نه پرسشی کنارش)."));
    if (ph === "c" || ph === "p") L.push("- زمینه (نه پرسشِ دوم): سلیقه و درنگ (B14): در مکثی طبیعی، نه کنارِ پرسشِ این نوبت، جا دارد بداند تا این‌جا کدام بخشش را دوست دارد و کدام را نه " + (srcQ("C120") || "") + " (C120؛ و پس از تلاشِ خودش، حلِ نویسندگانِ خوب — C117)؛ اگر خسته یا گیر است، ایدهٔ خوب پس از تلاشِ جدی می‌آید — «بگذار ته‌نشین شود، بعد برگرد» (کارِ ناخودآگاه، D009: فقط مسئله‌ای ته‌نشین می‌شود که جدی رویش کار شده — کنار گذاشتنِ آگاهانه، نه رها کردن؛ وقتی برگشت، نخست همان «چه چیزی به ذهنت رسید») . حلِ نویسنده‌ای خوب را فقط پس از تلاشِ خودش.");
    if (ph === "b" && !a129) L.push("- بازنگری مهم‌ترین بخشِ کار است " + (srcQ("C115") || "") + " و هیچ مسئله‌ای کاملاً تمام نمی‌شود " + (srcQ("A138") || "") + ": «حل شد» را تأیید یا رد نکن؛ پرسشِ این نوبت یک پرسشِ بازنگری است (همان بالا). اگر بازنگری را بیهوده خواند، همین دو جمله را آرام بگو. زمینه (نه پرسشِ دوم): سلیقه " + (srcQ("C120") || "") + " — این‌که کدام بخشش را دوست داشت — و " + (srcQ("C117") || "تقلید و تمرین") + " — حلِ نویسنده‌ای خوب را بخواند و بعد بی‌نگاه بازسازی کند.");
    /* E8 (دورِ ۴): سطرهای همان مرحله از دفترِ پوششِ منبع (sources/polya_how_to_solve_it: A038/B052، A263/B188–B189، B162، C168) */
    if (MO.has.A038) L.push(isWin("A038") ? "- **پرسشِ این نوبت همین است:** معنای واژهٔ کلیدی را می‌جوید (نامزدها یا تردید) — این حدس نیست؛ به تعریف‌ها برگرد " + cite("A038") + "، بازگشت به تعریف خودش تغییرِ مسئله است " + cite("B052") + ": «" + MO.has.A038.q + "» — «درست است/نه» نگو و معنایی را جای او برنگزین."
      : "- زمینه (نه پرسشِ دوم): معنای واژهٔ کلیدی را می‌جوید — به تعریف‌ها برگرد " + cite("A038") + "؛ " + MO.ptr + ".");
    else if (ph === "u" || ph === "p") L.push(altOr("به تعریف‌ها برگرد " + (srcQ("A038") || "") + ": واژهٔ کلیدیِ مبهمِ صورت یا شرط — در مسئلهٔ زندگی هم («شریکِ جرم یعنی چه»، «موفق یعنی چه») — دقیقاً یعنی چه؛ بازگشت به تعریف خودش تغییرِ مسئله است " + (srcQ("B052") || "") + ".", " اگر واژه‌ای همین حالا مبهم است، همان پرسشِ نوبت را با معنای دقیقِ آن واژه همراه کن (نه پرسشی کنارش)."));
    /* F6 (دورِ ۵، s14، s20): پارادوکسِ مخترع هر جا حرف از کلی‌تر کردن است (حتی در فهم: «کلی‌تر که سخت‌تره!») و برچسبِ «ناتمام — اکتشافی» هر جا استدلالِ محتمل به‌جای برهان آمد */
    /* G3 (دورِ ۶، s21): فقط وقتی حرف از کلی‌تر کردن است، نه هر نوبتِ طرح */
    if (genTalk(mt)) L.push(isWin("A263") ? "- **پرسشِ این نوبت همین است:** پارادوکسِ مخترع " + cite("A263") + ": اگر مسئلهٔ خاص گیر است، مسئلهٔ کلی‌تر یا جاه‌طلبانه‌تر گاهی آسان‌تر است — به شرطِ بینش، نه ادعا " + (srcQ("B189") || "") + ". **همین پیام دربارهٔ کلی‌تر کردن است:** اگر «کلی‌تر سخت‌تر است» گفت، رد نکن؛ بپرس «" + MO.has.A263.q + "»"
      : "- زمینه (نه پرسشِ دوم): پارادوکسِ مخترع " + cite("A263") + ": اگر مسئلهٔ خاص گیر است، مسئلهٔ کلی‌تر یا جاه‌طلبانه‌تر گاهی آسان‌تر است — به شرطِ بینش، نه ادعا " + (srcQ("B189") || "") + ". همین پیام دربارهٔ کلی‌تر کردن است: اگر «کلی‌تر سخت‌تر است» گفت، رد نکن.");
    /* G3 (دورِ ۶، s07، s14، s38): B162 در لحظهٔ خودش — استدلالِ محتمل (نمونه‌ها، قیاس، الگو، «حدسم … پس …») به‌جای برهان، در هر مرحله و هر رده؛ نه به‌صرفِ مرحلهٔ اجرا/بازنگری (برهانِ واقعی) */
    /* (hc بالاتر در turnMoments ساخته شد) */
    if (hc || PLAUS_RE.test(mt) || EVCOUNT_RE.test(faDigits(mt))) L.push("- استدلالِ اکتشافی (چند حالت، الگو، قیاس، شکل) راهنماست نه برهان " + cite("B162") + ": اگر نتیجه فقط از آن آمده، او را به برچسبِ «ناتمام — اکتشافی» برسان تا ثابت شود؛ «حل شد» نگو.");
    /* H2 (دورِ ۷، s25؛ سهمِ «live»): وقتی پرسشِ نوبت آزمودنِ حدس است، C145 زمینه است نه پرسشِ دوم */
    if (hc) L.push(isWin("C145") ? "- **پرسشِ این نوبت همین است:** این «ثابت شد» از چند نمونه/شکل آمده، نه از برهان " + cite("C145") + ": به بازنگری نبر و «درست است» نگو؛ بپرس «" + MO.has.C145.q + "». نمونه‌ها حدس را محتمل‌تر می‌کنند، ثابتش نمی‌کنند."
      : "- زمینه (نه پرسشِ دوم) " + cite("C145") + ": این «ثابت شد» از چند نمونه آمده، نه از برهان — به بازنگری نبر و «درست است» نگو؛ " + MO.ptr + " و «برهانش؟» پس از آن.");
    if (MO.has.C145p) L.push(isWin("C145p") ? "- **پرسشِ این نوبت همین است:** خودش آزمود و برهان می‌خواهد — این حدسِ نیازموده نیست؛ نمونه‌ها حدس را محتمل‌تر می‌کنند، ثابتش نمی‌کنند " + cite("C145") + ": «درست است/نه» نگو و برهان را لو نده؛ «" + MO.has.C145p.q + "»."
      : "- زمینه (نه پرسشِ دوم) " + cite("C145") + ": خودش آزمود و برهان می‌خواهد — نمونه‌ها برهان نیستند؛ " + MO.ptr + ".");
    /* F6 (دورِ ۵): سطرهای کتاب در لحظهٔ خودشان (نه بسته به مرحله)، هر یک با شناسهٔ موردِ دفترِ پوشش */
    /* دورِ ۸ (I-coach 2، s22): یک سطرِ «از ردش چه آموخت» در کلِ پرامپت — با مسئلهٔ زنده آن سطر در بلوکِ زنده است (a27 refutedLine یا سطرِ a38) و این‌جا
       فقط زمینهٔ B231؛ بی مسئلهٔ زنده (s12 p5) همین پرسشِ این نوبت است و پیشنهادِ فهرست برای نوبتِ بعد */
    if (refTurn) L.push(!isWin("B231") ? "- زمینه (نه پرسشِ دوم) " + cite("B231") + ": حدسش رد شد — این همان اصلِ عامِ «حدس بزن، ولی حدست را بیازما» است؛ کارِ درستش را نام ببر (حدس را آزمود، نه این‌که «اشتباه کرد»). " + MO.ptr + "."
      : "- حدسش رد شد: این همان اصلِ عام است — «حدس بزن، ولی حدست را بیازما» " + cite("B231") + ". کارِ درستش را نام ببر (حدس را آزمود، نه این‌که «اشتباه کرد») و بپرس از ردش چه آموخت و کدام فرضِ پنهان شکست — **پرسشِ این نوبت همین است**؛ پیشنهادِ فهرستِ بالا برای نوبتِ بعد.");
    /* G3 (دورِ ۶، s15، s16): سطرهای معلم در لحظهٔ خودشان — پرسشی که پرسید/می‌خواهد بپرسد (A167/A169) و حرکتِ اقتدار/فراموشی (A129) — نه هر نوبتِ معلم */
    if (o.teach && TQ_RE.test(mt)) L.push("- **پرسشِ بد چرا بد است** (" + cite("A167") + "): پرسشی که جواب یا قضیه را لو می‌دهد («اینجا باید از تشابه استفاده کنیم، نه؟») (۱) خیلی خاص است و به یادگیرنده‌ای که دور است کمکی نمی‌کند، (۲) چیزی برای مسئلهٔ بعد یاد نمی‌دهد، (۳) مثلِ خرگوش از کلاه بیرون می‌آید " + cite("A169") + " — پرسشِ خوب کلی و طبیعی است و خودِ او هم می‌توانست از خودش بپرسد (A168).");
    if (o.teach && TA_RE.test(mt)) L.push("- **طرحی که از اقتدارِ معلم/پدر پذیرفته شود زود فراموش می‌شود** " + cite("A129") + ": کمک کن یادگیرنده طرح را خودش بیابد، حتی اگر کندتر است.");
    /* دورِ ۸ (I-coach 3، s23، s29، s37): بلوکی که پرسشِ نوبت دارد (بلوکِ زنده، پیشنهادِ فهرست، آزمودنِ حدس) ⇒ A044 زمینه است، نه پرسشِ دوم */
    if (manyUnknowns(mt)) L.push(isWin("A044") ? "- **پرسشِ این نوبت همین است:** چند مجهول با هم خواست: همه را یک‌جا نگشا — بپرس «" + MO.has.A044.q + "» تا خودش آن‌ها را زیرمسئله‌های جدا کند و **ترتیب را خودش بگذارد** " + cite("A044") + "؛ تجزیه به تدریج و نه بیش از نیاز " + cite("A293") + "."
      : "- زمینه (نه پرسشِ دوم): چند مجهول با هم خواست: همه را یک‌جا نگشا — تجزیه به زیرمسئله‌ها و ترتیبشان کارِ خودِ اوست " + cite("A044") + "؛ تجزیه به تدریج و نه بیش از نیاز " + cite("A293") + ".");
    if (o.intro && longStmt(mt)) L.push(isWin("A191") ? "- **پرسشِ این نوبت همین است:** اول کل را ببین " + cite("A191") + ": پیش از هر جزئیات و پارامتر بپرس «" + MO.has.A191.q + "»؛ کار روی جزئیات پیش از فهمِ کل عادتِ بدی است " + cite("A294") + "."
      : "- زمینه (نه پرسشِ دوم): اول کل را ببین " + cite("A191") + ": کلِ مسئله پیش از جزئیات و پارامترها؛ کار روی جزئیات پیش از فهمِ کل عادتِ بدی است " + cite("A294") + ".");
    /* دورِ ۷ (H1، s16): در قابِ پدر/معلم لحظهٔ «اقتدار ⇐ فراموشی» (A129) بر «اول حدسش را بپرس» (A073) مقدم است */
    if (MO.has.A073w) L.push(isWin("A073w") ? "- **پرسشِ این نوبت همین است:** «چرا …؟» پرسید: پیش از توضیح، **حدسِ خودش** را بپرس — «" + MO.has.A073w.q + "» — حدس و تلاشِ خودش را بشنو، بعد سرنخ را بر همان بنا کن " + cite("A073") + "؛ توضیحِ آماده را نده."
      : "- زمینه (نه پرسشِ دوم): «چرا …؟» پرسید: پیش از توضیح، حدس و تلاشِ خودش را بشنو و سرنخ را بر همان بنا کن " + cite("A073") + "؛ توضیحِ آماده را نده.");
    /* دورِ ۱۰ (J1، s38 p1): «فقط جواب» بی هیچ تلاشِ دیدنی ⇒ همین پرسشِ نوبت است (بالاترین اولویت: نخستین سرنخ پس از شنیدنِ تلاشِ خودش)؛ با تلاشِ دیدنی یا بلوکِ زنده زمینه */
    if (ONLY_ANS_RE.test(mt)) L.push(isWin("A073") ? "- **پرسشِ این نوبت همین است:** «فقط جواب» خواست و هنوز تلاشی از خودش نشان نداده: پیش از **نخستین** سرنخ بپرس «" + MO.has.A073.q + "» — تلاشِ خودش را بشنو، بعد سرنخِ اول را بر همان بنا کن " + cite("A073") + "؛ کمکی بده که از ذهنِ خودش هم می‌توانست بگذرد " + cite("A076") + ". جواب را نده."
      : "- زمینه (نه پرسشِ دوم): «فقط جواب» خواست: " + (MO.attempt ? "تلاشش را در گفت‌وگو آورده — " : "") + "نخستین سرنخ فقط پس از شنیدنِ تلاشِ خودش و بر همان بنا " + cite("A073") + "؛ کمکی بده که از ذهنِ خودش هم می‌توانست بگذرد " + cite("A076") + ". جواب را نده." + (o.live && MO.only ? " (پرسشِ این نوبت در «مسئلهٔ زندهٔ این سشن» همین را می‌پرسد.)" : ""));
    if (TASTE_RE.test(mt)) L.push("- زمینه (نه پرسشِ دوم): اگر از سلیقه‌اش گفت (نه «نمی‌دانم/مطمئن نیستم»، نه آرزو، نیاز یا گفتهٔ دیگری — این را تو داوری کن): جدی بگیرش — شناختنِ علایق، بیزاری‌ها و سلیقهٔ خود نخستین کشفِ مهم است " + cite("C120") + "؛ پیشنهاد کن حلِ نویسندگانِ خوب در همان خط را بخواند و تقلید و تمرین کند " + cite("C117") + ".");
    if (NOTATION_AV_RE.test(mt)) L.push("- از نماد/حروف بیزار است: تحمیل نکن و سرزنش نکن؛ بگذار سودش را خودش تجربه کند — مثلاً جمعِ دو عدد با ارقامِ رومی را با ارقامِ معمولی مقایسه کند " + cite("B241") + "؛ معادله‌نویسی ترجمه از زبانِ عادی به زبانِ نماد است " + cite("B243") + " — ستونِ «واژه | نماد» با واژه‌های خودش.");
    if (BACKWARD_RE.test(mt)) L.push("- زمینه (نه پرسشِ دوم): کار به عقب شاخه می‌دهد: هر شاخه جدا نوشته شود و نشانه‌های هر کدام بماند؛ نبودِ نشانه هشدارِ بن‌بست است " + cite("C094") + " — شاخهٔ رقیب را پیش از رها کردنِ این یکی نام ببرد (" + "C169" + ").");
    if (ABANDON_RE.test(mt)) L.push((isWin("C095") ? "- **پرسشِ این نوبت همین است:** " : "- زمینه (نه پرسشِ دوم): ") + "می‌خواهد کلِ راه را دور بریزد: نشانه‌ها گاهی فریب می‌دهند " + cite("C095") + " — شاید فقط یک حلقه باید عوض شود؛ پیش از رها کردنِ مسیر کمی بیشتر پافشاری کن " + cite("C096") +
      (isWin("C095") ? ": بپرس «" + MO.has.C095.q + "»" : " (" + MO.ptr + " — یک پرسش در هر بلوک)."));
    /* دورِ ۷ (H1، s05): «دامنه‌اش را تنگ کن» برای گزارهٔ کلی است — نه فرضیهٔ یک‌بارهٔ زندگی («مدیرم عمداً…») که صفحه ردش کرد */
    /* دورِ ۸ (I-coach 2، s22، s05): «دامنه‌اش را تنگ کن» فقط برای گزارهٔ **کلی** (همیشه/هر/همه/قانون…) — ردِ صفحه فقط اگر خودِ حدسِ ردشده کلی بود (o.refGen)؛ فرضیهٔ یک‌باره از هر رده‌ای نه */
    if (MO.has.C107) L.push(isWin("C107") ? "- **پرسشِ این نوبت همین است:** مثالِ نقض آمد: یک استثنا برای ردِ گزارهٔ کلی بس است " + cite("C107") + " — ولی ادعا را دور نینداز: **دامنه‌اش را تنگ کن** — بپرس «" + MO.has.C107.q + "» و حدسِ تنگ‌شده را دوباره بیازماید."
      : "- زمینه (نه پرسشِ دوم): مثالِ نقض آمد: یک استثنا برای ردِ گزارهٔ کلی بس است " + cite("C107") + " — ولی ادعا دور انداخته نشود: **دامنه‌اش را تنگ کن** (کجا هنوز درست است) — پس از پرسشِ این نوبت.");
    if (ph === "b" && cls === "prove") L.push("- زمینه (نه پرسشِ دوم): فرع " + cite("A284") + ": از همین نتیجه چه نتیجهٔ آسانِ دیگری بی‌درنگ درمی‌آید (مثلاً n ⇐ ∞، یا حالتِ خاصِ مهم) — همین بازنگری است؛ پس از پرسشِ این نوبت.");
    if (INDIRECT_RE.test(mt)) L.push("- «چرا فرض کنم همه برقرارند؟» (اثباتِ غیرمستقیم): رویهٔ ذهن‌باز — همهٔ بخش‌های شرط را **فرضاً** برقرار می‌گیریم تا ببینیم به کجا می‌رسد، نه چون باورشان داریم " + cite("C055") + "؛ با وضعِ فرضی ذهن‌باز روبه‌رو شو " + cite("C052") + " — اگر به تناقض رسید، همان فرض نادرست است.");
    if (ph === "b") L.push("- زمینه (نه پرسشِ دوم): قارچ‌ها خوشه‌ای می‌رویند " + (srcQ("C168") || "") + ": پس از نخستین کشف اطراف را بنگر — همین روش یا نتیجه کدام مسئلهٔ نزدیکِ دیگری را هم حل می‌کند (پس از پرسشِ این نوبت).");
    if (OWN_PROV_RE.test(mt)) L.push(isWin("C150") ? "- **پرسشِ این نوبت همین است:** **کاربر ضرب‌المثل یا قاعدهٔ عامیانهٔ خودش را آورد:** جدی بگیر و رد نکن، ولی هر ضرب‌المثلی ضدی دارد (C150): بپرس «" + MO.has.C150.q + "»؛ اگر تقدیرگرایانه است («آب که از سر گذشت…»)، کوچک‌ترین گامی که هنوز در دستِ خودش است پس از آن."
      : "- زمینه (نه پرسشِ دوم): **کاربر ضرب‌المثل یا قاعدهٔ عامیانهٔ خودش را آورد:** جدی بگیر و رد نکن؛ هر ضرب‌المثلی ضدی دارد (C150) و تقدیرگرایانه‌اش («آب که از سر گذشت…») کوچک‌ترین گامِ در دستِ خودش را پنهان می‌کند — " + MO.ptr + ".");
    /* دورِ ۱۱ (K10، K1): مسئلهٔ مرتبطِ حل‌شده‌ای که خودش آورد؛ مرورِ بی‌نگاه؛ ادامهٔ مسئلهٔ بازِ تنها — هر کدام یا پرسشِ نوبت یا زمینه */
    if (MO.has.related) L.push(isWin("related") ? "- **پرسشِ این نوبت همین است:** نتیجه‌ای حل‌شده را که بلد است آورد و نمی‌داند به کار ببرد — این‌جا مسئلهٔ مرتبطی هست که پیش‌تر حل شده " + cite("A032") + "؛ سود از حل‌شده‌ها از نتیجه، روش یا تجربهٔ آن‌هاست " + cite("B100") + ": بپرس «" + MO.has.related.q + "» — ربط را خودش بیابد، تو نگو."
      : "- زمینه (نه پرسشِ دوم): نتیجه‌ای حل‌شده را که بلد است آورد و نمی‌داند به کار ببرد — سود از حل‌شده‌ها از نتیجه، روش یا تجربهٔ آن‌هاست " + cite("B100") + "؛ " + MO.ptr + ".");
    if (MO.has.lbRest) { var lbo = o.lbRest, lbAct = "{\"do\":\"chat_lookback\",\"pid\":\"" + lbo.pid + "\",\"" + (lbo.k === "best" ? "bestQ\":\"همان پرسشی که خودش گفت" : "taste\":\"عینِ حرفش") + "\"}";
      if (isWin("lbRest") && s && !o.dry) lbMark(s, lbo, mt);
      L.push(isWin("lbRest") ? "- **پرسشِ این نوبت همین است:** بازنگریِ «" + clip(lbo.title, 70) + "» (در همین گفت‌وگو بسته شد) هنوز " + (lbo.k === "best" ? "«کدام پرسش کمک کرد؟»" : "«سلیقه»") + " را کم دارد " + cite(lbo.k === "best" ? "B100" : "C120") + " — پیش از مسئلهٔ بعد، کوتاه بپرس «" + lbo.q + "»؛ پاسخش را با " + lbAct + " نگه دار."
        : "- زمینه (نه پرسشِ دوم): بازنگریِ «" + clip(lbo.title, 70) + "» هنوز " + (lbo.k === "best" ? "«کدام پرسش کمک کرد؟»" : "«سلیقه»") + " را کم دارد — " + MO.ptr + "؛ اگر خودش گفت، با " + lbAct + " نگه دار."); }
    if (MO.has.recall) L.push(isWin("recall") ? "- **پرسشِ این نوبت همین است:** مرورِ بی‌نگاه — پیش از یادآوریِ جزئیاتِ «مسئلهٔ حل‌شدهٔ مرتبط» (بلوکِ جدا) بپرس «" + MO.has.recall.q + "»؛ جزئیاتِ آن بلوک پس از پاسخِ خودش، برای پیوند (نتیجه یا روشش)."
      : "- زمینه (نه پرسشِ دوم): مرورِ بی‌نگاهِ «مسئلهٔ حل‌شدهٔ مرتبط» (بلوکِ جدا) — جزئیاتش را پیش از یادآوریِ خودش نگو؛ " + MO.ptr + ".");
    if (MO.has.open) L.push(isWin("open") ? "- **پرسشِ این نوبت همین است:** یک مسئلهٔ بازِ دیگر دارد (بلوکِ «مسئلهٔ بازِ تو») — فقط یک بار و کوتاه بپرس «" + MO.has.open.q + "»؛ اگر گفت آری، او را به صفحه‌اش ببر (همان بلوک)."
      : "- زمینه (نه پرسشِ دوم): یک مسئلهٔ بازِ دیگر دارد (بلوکِ «مسئلهٔ بازِ تو») — " + MO.ptr + ".");
    if (MO.has.lesson) L.push(isWin("lesson") ? "- **پرسشِ این نوبت همین است:** مسئله‌ای که در همین سشن بست («" + clip(o.lesson.title, 70) + "») هنوز برایش روشن نیست — نه مسئلهٔ تازه؛ پاسخ را از درسِ بازنگریِ خودش بیرون بکشد (بلوکِ «مسئلهٔ حل‌شدهٔ مرتبط») " + cite("B100") + "، جواب را لو نده: «" + MO.has.lesson.q + "»."
      : "- زمینه (نه پرسشِ دوم): درسِ بازنگریِ خودش دربارهٔ مسئلهٔ بسته‌شده (بلوکِ «مسئلهٔ حل‌شدهٔ مرتبط») — " + MO.ptr + ".");
    if (MO.has.openOn) L.push(isWin("openOn") ? "- **پرسشِ این نوبت همین است:** حرفش دربارهٔ مسئلهٔ بازِ خودش «" + clip(o.openProb.title, 70) + "» است — پرسشِ مرحلهٔ صفحه‌اش: «" + MO.has.openOn.q + "»؛ برای ثبت، او را به صفحه‌اش ببر (بلوکِ «مسئلهٔ بازِ تو»)."
      : "- زمینه (نه پرسشِ دوم): حرفش دربارهٔ مسئلهٔ بازِ خودش «" + clip(o.openProb.title, 70) + "» است (بلوکِ «مسئلهٔ بازِ تو») — " + MO.ptr + ".");
    /* دورِ ۱۱ (K8، s05): یقینِ بی‌آزمون («مطمئنم»، «صد در صد»، «همیشه درست بوده») — B107؛ زمینه، پرسشِ نوبت همان یکی */
    var cert = CERT_RE.test(ownText(mt));
    if (cert) L.push("- زمینه (نه پرسشِ دوم): یقینِ بی‌آزمون " + cite("B107") + ": «مطمئنم»، «صد در صد» یا «همیشه درست بوده» خودش حدس است تا آزموده شود — نشانهٔ مخالف هم دیدنی است؛ " + MO.ptr + ".");
    o.winId = win ? win.id : "";
    /* دورِ ۱۱ (K8): موردهای منبع که همین نوبت رخ دادند (لحظه‌ها + سطرهای B162/B107) — حوزه‌های قلمروشان از ثبت‌گاهِ پوشش (terr:) به «دانسته‌های قلمرو» می‌رود */
    var IT = { guess: "B231", related: "A032", recall: "B100", C145p: "C145", lesson: "B100" };
    o.items = MO.list.map(function (m) { return IT[m.id] || m.id; }).concat(hc || EVCOUNT_RE.test(faDigits(mt)) ? ["B162"] : [], cert ? ["B107"] : []);
    /* دورِ ۱۲ (L7، s14 p9): B162 ⇒ حوزه‌اش (a_induction) فقط وقتی استدلال **استقرا از نمونه‌ها**ست (چند حالت/شاهدِ شمرده) — نه «حدسم … پس …» ِ توضیحِ یک فرمول؛ سطرِ B162 ِ بلوک همان می‌ماند */
    var wk = weakPhase(); if (wk) L.push(wk);
    var pv = pickProverb(ph, s, cls, mt, L.join("\n"));
    if (pv) {
      var opp = !pv.noOpp && PROV_OPP[pv.id] && provText(PROV_OPP[pv.id]);
      /* دورِ ۱۰ (J1): ضرب‌المثل هرگز «⇐ همان پرسش» ندارد — پرسشِ نوبت فقط یکی است */
      L.push("- ضرب‌المثلِ همین مرحله (پولیا، «حکمتِ ضرب‌المثل‌ها»): «" + clip(pv.q, 140) + "»" + (pv.n ? " — " + clip(pv.n, 60) : "") + ". فقط اگر به حالِ همین لحظه می‌خورد، یک بار و کوتاه، کنارِ همان پرسشِ نوبت (نه پرسشی تازه)؛ هر ضرب‌المثلی ضدی هم دارد" + (opp ? " («" + clip(opp, 90) + "»)" : "") + " و ضرب‌المثل‌ها قاعدهٔ خطاناپذیر نیستند (C150).");
      if (s && !o.dry) { var C0 = s.coach = s.coach || {}; C0.prov = (C0.prov || []).concat([pv.id || pv.q]).slice(-30); }
    }
    if (o.closed) L.push("- مسئلهٔ «" + clip(o.closed, 60) + "» بسته شده است؛ حدس یا ادعای تازه‌اش مسئلهٔ تازه است: همین مربی، از «فهم» — اثبات یا رد؛ اگر می‌خواهد نگهش دارد {\"do\":\"chat_invent\",\"statement\":\"عینِ حرفش\",\"kind\":\"find|prove|pod\"}.");
    if (o.mid) L.push(o.mid);
    L.push("- حلی که در همین گفت‌وگو تمام شد بی بازنگری رها نشود: پس از بازنگریِ خودش {\"do\":\"chat_solved\",\"title\":\"…\",\"statement\":\"عینِ صورتِ مسئله\",\"kind\":\"find|prove|pod\",\"lesson\":\"درسِ خودش به قلمِ خودش\",\"check\":\"وارسیِ خودش\",\"bestQ\":\"پرسشی که به گفتهٔ خودش بیشتر کمک کرد\",\"taste\":\"سلیقه‌اش به حرفِ خودش\"} (همان مسئله دوباره ساخته نمی‌شود؛ به‌روز می‌شود). بازنگریِ صفحه دو پرسشِ دیگر هم دارد — «کدام پرسش بیشتر کمک کرد؟» و «این نوع مسئله برایت چطور بود؟»: در همان نوبت یا نوبتِ بعد، یکی در هر نوبت؛ آنچه هنوز نیامده بعداً با {\"do\":\"chat_lookback\",\"pid\":\"…\",\"bestQ|taste\":\"…\"}. مسئلهٔ تازه‌ای که خودش ساخت و هنوز حل نکرده: {\"do\":\"chat_invent\",\"statement\":\"عینِ حرفش\",\"title\":\"…\",\"nat\":\"objective|practical|life\",\"kind\":\"find|prove|pod\"} (nat: پاسخِ عینی ⇐ objective، کارِ واقعی با کمیت ⇐ practical، تصمیمِ زندگی ⇐ life؛ kind: یافتنی ⇐ find، اثباتِ حکمِ داده‌شده ⇐ prove، حدس/«درسته؟» ⇐ pod)؛ اگر همین‌جا حلش کرد، chat_solved.");
    return L.join("\n");
  }
  AS.coachLines = coachLines;
  /* مرحلهٔ ضعیف‌ترِ همین کاربر — فقط به‌صورتِ احتمال از کارنامهٔ ذهن (A.MIND.phases ِ a29: (k+1)/(n+2) و «احتمالِ ضعیف‌ترین بودن»)؛
     هرگز برچسب («تو در طرح ضعیفی»)، بی آستانه؛ بی‌داده هیچ نمی‌گوید (هر چهار ¼ یعنی نمی‌دانیم) */
  /* RN3a: «ضعیف‌ترین» فقط وقتی کارنامه نامش را برد (شکستی هست و آن مرحله به‌روشنی پایین‌تر از همه است)؛ وگرنه «هنوز تمایزی دیده نشده» — بی رتبه */
  function weakPhase() {
    var M0 = A.MIND; if (!M0 || typeof M0.phases !== "function") return "";
    var Q = null; try { Q = M0.phases(); } catch (e) { return ""; }
    if (!Q || !Q.n || !Q.rows || !Q.rows.length) return "";
    var rk = Q.rows.filter(function (X) { return X && X.n > 0 && !X.none; }); if (rk.length < 2) return "";
    var cnt = function (X) { return X.fa + " " + fa(X.k) + "/" + fa(X.n); };
    if (!Q.weakest) return "- زمینه (نه پرسشِ دوم): چهار مرحلهٔ حل در دادهٔ خودِ این کاربر (" + fa(Q.n) + " رویداد؛ " + rk.map(cnt).join("؛ ") + "): هنوز تمایزی دیده نشده — هیچ مرحله‌ای ضعیف‌تر نیست؛ برچسب نزن و مکثِ ویژه‌ای لازم نیست.";
    var pc = function (p) { return fa(Math.round(100 * p)) + "٪"; };
    return "- زمینه (نه پرسشِ دوم): چهار مرحلهٔ حل در دادهٔ خودِ این کاربر (احتمال، نه برچسب؛ " + fa(Q.n) + " نمونه؛ فقط مرحله‌های دارای داده): " + rk.map(function (X) { return cnt(X) + " — احتمالِ ضعیف‌ترین بودن " + pc(X.pWeak || 0); }).join("؛ ") +
      ". تنها مرحله‌ای که شکست دارد و از همه پایین‌تر است: «" + Q.weakest.fa + "». به او برچسب نزن و حکم نده؛ اگر به کار آمد، در همان مرحله کمی بیشتر مکث کن — با همان یک پرسشِ نوبت، نه پرسشی دیگر.";
  }
  /* قرنطینه (RN3a — REMOVAL_CANDIDATES): هر دو مرحلهٔ دارای داده را با «احتمالِ ضعیف‌ترین بودن» رتبه می‌داد، حتی بی هیچ شکستی یا با برابری */
  function weakPhaseR18() {
    var M0 = A.MIND; if (!M0 || typeof M0.phases !== "function") return "";
    var Q = null; try { Q = M0.phases(); } catch (e) { return ""; }
    if (!Q || !Q.n || !Q.rows || !Q.rows.length) return "";
    var rk = Q.rows.filter(function (X) { return X && X.n > 0 && !X.none; }); if (rk.length < 2) return "";   // RM1c: مرحلهٔ بی‌داده رتبه نمی‌گیرد
    var pc = function (p) { return fa(Math.round(100 * p)) + "٪"; };
    return "- زمینه (نه پرسشِ دوم): چهار مرحلهٔ حل در دادهٔ خودِ این کاربر (احتمال، نه برچسب؛ " + fa(Q.n) + " نمونه؛ فقط مرحله‌های دارای داده): " + rk.map(function (X) { return X.fa + " — احتمالِ ضعیف‌ترین بودن " + pc(X.pWeak || 0); }).join("؛ ") +
      ". به او برچسب نزن و حکم نده؛ اگر به کار آمد، در همان مرحله‌ای که احتمالش بیشتر است کمی بیشتر مکث کن — با همان یک پرسشِ نوبت، نه پرسشی دیگر.";
  }
  AS.weakPhaseLine = weakPhase;
  function userTries(s, since) { return ((s && s.msgs) || []).filter(function (m) { return m.role === "user" && (!since || String(m.at || "") >= since); }).length; }
  /* ---------- سشن ⇄ مسئلهٔ زنده (R1): سشنی که مسئله‌ای را ساخت یا باز کرد به آن **بسته** است تا خودِ کاربر عوض کند ---------- */
  /* خواندنِ پیوند فقط از بخشِ مسئله (ادغامِ G1/G2): A.liveSessionPid(s) = مسئلهٔ **بازِ** بسته به سشن. مسئلهٔ بسته‌شده (done) دیگر «مسئلهٔ زندهٔ این سشن» نیست،
     ولی مربی هنوز می‌داند کدام مسئله همین حالا بسته شد (حدسِ تازه ⇒ مسئلهٔ تازه) — همان s.lprob ِ ماندهٔ رکورد، فقط وقتی بسته‌شده است. */
  AS.boundLive = function (s) {
    var pid = null; try { pid = A.liveSessionPid ? A.liveSessionPid(s) : null; } catch (e) { pid = null; }
    if (pid) return { pid: pid, r: A.liveRec(pid), ph: A.livePhase ? A.livePhase(pid) : "", done: false };
    var p0 = s && s.lprob, r0 = p0 && A.liveRec ? A.liveRec(p0) : null; if (!r0) return null;
    var ph0 = A.livePhase ? A.livePhase(p0) : ""; return ph0 === "done" ? { pid: p0, r: r0, ph: ph0, done: true } : null;
  };
  /* مسئلهٔ زندهٔ فعال: صفحهٔ خودش، یا مسئلهٔ بسته‌شده به این سشن (A.liveSessionPid) — **همیشه** (بی شرطِ هم‌واژگی؛ rerunA S2.1، rerunB S2.4) */
  function liveCtx(s, msg) {
    if (!A.liveRec) return null;
    var st = A.state || {}, onPage = st.view === "lprob" || (st.view === "e_prob" && A.liveRec(st.arg)), bp = A.liveSessionPid ? A.liveSessionPid(s) : null, pid = onPage ? st.arg : bp, r = pid ? A.liveRec(pid) : null; if (!r) return null;
    var ph = A.livePhase ? A.livePhase(pid) : ""; if (ph === "done") return null;
    return { pid: pid, r: r, ph: ph, onPage: onPage, bound: bp === pid };
  }
  AS.liveCtx = liveCtx;
  /* قابِ «🔭» وقتی کاربر از تصمیم/قیمت/جا شدن/انتخاب می‌پرسد — گسترده‌تر از الگوی پیشین (بخرم یا نه؟ جا میشه یا نه؟ چند بفروشم؟ بزنم یا برم) */
  var LIVE_RE2 = new RegExp([
    "(?:^|[\\s«،])(?:(?:ب|ن|نمی[\\u200c\\s]?|می[\\u200c\\s]?)[آ-ی]{1,12}(?:م|یم)|کنم|بکنم|نکنم|کنیم|بشم|نشم|بدم|ندم)\\s+یا\\s+[^؟?\\n]{0,40}(?:[؟?!.]|$)",
    "(?:جا\\s*)?(?:میشه|می[\\u200c\\s]شه|می[\\u200c\\s]?شود|میاد|می[\\u200c\\s]?آید|می[\\u200c\\s]?ره|جا\\s*داره)\\s*یا\\s*نه",
    "چند\\s*(?:تومن\\s*|تومان\\s*)?(?:بفروشم|بخرم|بدم|بدهم|بذارم|بگذارم|بگیرم|حساب\\s*کنم)",
    "(?:چقدر|چه\\s*قیمتی)\\s*(?:بفروشم|بذارم|بگذارم|بگیرم|قیمت\\s*بذارم)",
    "(?:کدوم|کدام)(?:ش|یکی|و)?\\s*(?:بهتره|بهتر\\s*است|رو\\s*انتخاب\\s*کنم|را\\s*انتخاب\\s*کنم)"].join("|"));
  AS.LIVE_RE2 = LIVE_RE2;
  /* B12: گفتنِ صریحِ «مسئله‌ای دارم/می‌خوام حلش کنم/گیر کردم توی…/ثبتش کن» هم قاعدهٔ «🔭» را می‌آورد (ثبت فقط با live_new ِ صریح؛ ردهٔ مربی از این الگو عوض نمی‌شود) */
  var LIVE_ASK = /(?:یه|یک)\s*(?:مسئله|مشکل)(?:‌ای|ی)?\s*(?:دارم|داریم)|می[‌\s]?خوا(?:م|یم)\s*(?:حلش\s*کنم|حل\s*کنم|حلش\s*کنیم)|گیر\s*کرد(?:م|ه‌?ام|یم)\s*(?:توی|تو|در|سرِ?)\s|نمی[‌\s]?(?:دونم|دانم)\s*چی\s*(?:رو|را)\s*امتحان\s*کنم|راه[‌\s]?حلی?\s*بده\s*که|(?:به[‌\s]?عنوانِ?|بعنوان)\s*مسئله(?:ٔ|ی|‌ی)?\s*(?:خودم|من)\s*ثبت|(?:یه|یک)\s*(?:مسئله|مشکل)(?:ٔ|ی|‌ی)?\s*واقعی\s*(?:دارم|داریم)|با\s*هم\s*حلش\s*کنیم|مسئله(?:ٔ|ی|‌ی)?\s*حل[‌\s]?نشده(?:ٔ|ی|‌ی)?\s*(?:خودم|من)|(?:یه|یک)\s*برنامه(?:ٔ|ی|‌ی)?\s*دقیق\s*می[‌\s]?خوا(?:م|یم)/;   // دورِ ۴ (E1): s13، s19، s37
  AS.LIVE_ASK = LIVE_ASK;
  /* دورِ ۱۶ (N2، s20 مریم): گیرِ طولانی روی کار/پرسشِ خودش — «۸ ماهه / ماه‌هاست / سه ساله»، «فکرم کار نمی‌کنه»، «گیر کردم روش»، «می‌خوام نشون بدم … یا نه» ِ پژوهشِ خودش —
     هم قاعدهٔ کاملِ «🔭» را می‌آورد (فقط پیشنهاد؛ ثبت با live_new ِ صریح). قاعدهٔ کوتاه همیشه هست (پایین‌تر، LIVE_COMPACT). */
  var LIVE_STUCK = /(?:^|[\s«،(])(?:[0-9۰-۹]+|چند|یک|یه|دو|سه|چهار|پنج|شش|هفت|هشت|نه|ده)\s*(?:ماه|سال)(?:ه|\s*است|\s*هست)\s*(?:که\s*)?(?:دارم|روش|روی|گیر|درگیر|می[‌\s]?خوا(?:م|هم)|سرِ?|کار)(?![آ-ی‌])|(?:ماه|سال|هفته)[‌\s]?هاست(?![آ-ی])|فکرم\s*(?:دیگه\s*|دیگر\s*)?کار\s*نمی[‌\s]?(?:کنه|کند)|گیر\s*کرد(?:م|ه[‌\s]?ام|یم)\s*(?:روش|روی\s*(?:این|اون|آن|ش))|می[‌\s]?خوا(?:م|هم)\s*(?:نشون|نشان)\s*بد(?:م|هم)[^.؟?!\n]{2,160}?یا\s*نه/;
  AS.LIVE_STUCK = LIVE_STUCK;
  var LIVE_FALLBACK = "# مسئلهٔ واقعیِ حل‌نشده («🔭 مسئلهٔ حل‌نشدهٔ خودم»)\n- کاربر یک مسئله، تصمیم، انتخاب، قیمت یا جاشدنِ واقعیِ بازِ خودش را آورده: پاسخ را جای او نده. اگر می‌خواهد حلش کند، ساختنش (live_new) فقط طبقِ «🔭 مسئلهٔ حل‌نشدهٔ خودم (قاعدهٔ کوتاه)» است (nat: پاسخِ عینی ⇐ objective، کارِ واقعی با کمیت ⇐ practical، تصمیمِ زندگی ⇐ life)؛ پس از ساختن، او را به صفحه‌اش ببر (شناسه در نوبتِ بعد در «مسئلهٔ زندهٔ این سشن»)؛ هر نوبت یک پرسش از کلی به خاص — اول مجهول (دقیقاً چه می‌خواهد)، داده‌ها و شرط. هیچ فیلدِ فهم، داده، پیش‌بینی یا نتیجه را پر نکن (data-own).";
  /* «🌱» فقط پس از نشانهٔ واقعیِ شکست، بی‌پیشرفتی یا دلسردیِ خودِ کاربر (تورِ پولیا s13: «اخراج می‌شه» دربارهٔ همکار، در پیامِ نخست).
     دورِ ۲ (rerunA/C/D): واژه‌نامهٔ گسترده‌تر — «ولش کنم»، «پس راهی نیست»، «هیچ کاری نمیشه کرد»، «عصبانیم»، «وقتم هدر رفت»، «استعدادشو ندارم»، «انصراف بدم»، «خجالت کشیدم»؛
     و قاعدهٔ مدل‌محورِ مربی (هر نوع دلسردی/شرم/رها کردن ⇒ 🌱) کنارش، تا نشانه به یک فهرست بند نباشد. */
  var FAIL_ME = /(?:شکست|ناکام)\s*خوردم|ناامید(?:م|\s*شدم|\s*شده‌?ام)|دلسرد(?:م|\s*شدم)|ول\s*(?:می[‌\s]?)?(?:کنم|کردم)|ولش\s*(?:می[‌\s]?)?(?:کنم|کردم)|(?:بعد|پس)\s*از\s*(?:نقد|انتقاد|شکست|رد\s*شدن)(?:ِ|\s)|بی[‌\s]?خیال(?:ش)?\s*(?:می[‌\s]?)?شم|رها(?:ش)?\s*(?:می[‌\s]?)?(?:کنم|کردم)|نتونستم|نتوانستم|از\s*پسش\s*بر\s*نمیام|دیگه\s*نمی[‌\s]?(?:تونم|خوام\s*ادامه)|خسته\s*شدم|جا\s*زدم|کم\s*آوردم|(?:بهم|به\s*من|از\s*کارم|از\s*ایده‌?ام)\s*(?:ایراد|انتقاد)\s*(?:گرفت|کرد)|(?:ایده|طرح|کار|نوشته)(?:‌?ام|م)\s*(?:رو|را)\s*(?:رد|نقد|مسخره)\s*کرد|باز\s*(?:هم\s*)?نشد|حل\s*نشد|نشد\s*که\s*نشد|افتادم|رد\s*شدم|پس\s*راهی\s*نیست|هیچ\s*(?:کاری|راهی)\s*نمی[‌\s]?(?:شه|شود)(?:\s*کرد)?|عصبانی(?:م|ام|\s*شدم|\s*هستم)|اعصابم\s*(?:خورده?|خرده?|به\s*هم\s*ریخت)|وقتم\s*(?:هدر|تلف)\s*(?:رفت|شد)|استعداد(?:ش|شو|ش\s*رو)?\s*(?:رو\s*|را\s*)?ندارم|انصراف\s*(?:بدم|می[‌\s]?دم|دادم|بدهم)|خجالت\s*(?:کشیدم|می[‌\s]?کشم)|شرمنده(?:‌ام|م)|به\s*درد\s*نمی[‌\s]?خورم|من\s*(?:کودن|احمق|خنگ)(?:م|ی)?|خیلی\s*خسته(?:‌ام|ام|م|\s*هستم)|تو\s*رو\s*خدا/;   // دورِ ۴ (E1): التماسِ خستگی «خیلی خسته‌ام… تو رو خدا»
  AS.FAIL_ME = FAIL_ME;
  AS.willSignal = function (s, msg) {
    /* F3 (دورِ ۵، s28): «# پس از شکست» فقط در نوبتِ شکست و نوبتِ بعد — پیامِ همین نوبت و پیامِ پیش از آن (نه سه پیامِ آخر)؛ گامِ ناکامِ صفحه فقط اگر از نوبتِ پیش به این سو ثبت شد */
    var UM = ((s && s.msgs) || []).filter(function (m) { return m.role === "user"; }), cur = UM.length && mkey(UM[UM.length - 1].text) === mkey(msg) ? UM.length - 1 : UM.length, pv = UM[cur - 1];
    /* پیگیریِ دورِ ۶ (s19 هفتهٔ ۸): شکستِ پیامِ پیشین فقط اگر همان روز است (پیامِ هفته‌ها پیش «نوبتِ پیش» نیست) و دربارهٔ همان مسئله (گزارشِ سنجیدهٔ آن پیام، اگر هست)؛
       گامِ ناکامِ صفحه فقط اگر از پیامِ پیش‌ازپیشینِ **همان روز** به این سو ثبت شد — پس از یک نوبت و میانِ روزها منقضی */
    var curAt = UM[cur] && UM[cur].at ? String(UM[cur].at) : nowIso(), today = dayOf(curAt), sameDay = function (m) { return !!m && (!m.at || dayOf(m.at) === today); };
    /* دورِ ۷ (H1، s12): پیامِ همین نوبت موفقیتِ تازهٔ خودش است («آهان! پیدا شد… خودم حلش کردم») و خودش شکستی نمی‌گوید ⇒ شکستِ پیامِ پیشین گذشته است */
    var mt0 = String(msg || ""); if (!FAIL_ME.test(mt0) && !STUCK_RE.test(mt0) && ((solvedSaid(mt0) && !unsolvedNow(mt0, "")) || AHA_RE.test(mt0))) return "";
    var C0 = (s && s.coach) || {}, lp0 = (liveCtx(s, msg) || {}).pid || (s && s.lprob) || "", pvOk = pv && sameDay(pv) && !(C0.rep && C0.rep.key === mkey(pv.text) && C0.rep.pk && lp0 && C0.rep.pk !== "l:" + lp0);
    if (FAIL_ME.test([String(msg || ""), pvOk ? pv.text : ""].join(" \n "))) return "word";
    var since = UM[cur - 2] && sameDay(UM[cur - 2]) ? String(UM[cur - 2].at || "") : pv && sameDay(pv) ? String(pv.at || "") : curAt.slice(0, 10);
    try { var lp = (liveCtx(s, msg) || {}).pid || (s && s.lprob), lr = lp && A.liveRec && A.liveRec(lp);
      if (lr && AS.tourLiveParts) { var x = AS.tourLiveParts(lr), last = x.steps.filter(function (st) { return st.closed && st.out && !st.out.auto; }).pop(); if (last && (last.out.prog === "نه" || last.out.done === "no") && (!since || !last.out.at || String(last.out.at) >= since)) return "data"; } } catch (e) { }
    try { var c = AS.solvingCtx && AS.solvingCtx(s); if (c && c.pid && AS.smallWin && AS.smallWin(c.pid)) return "data"; } catch (e) { }
    try { var idr = s && s.idea && S.get(s.idea); if (idr && (idr.crits || []).some(function (c0) { return !(c0.ans && c0.ans.ev); })) return "data"; } catch (e) { }
    return "";
  };
  /* مسئله‌ای فقط در گفت‌وگو — دیگر **دروازه** نیست (R1: مربی با فهرستِ کوتاهِ منفی می‌آید)؛ فقط برای «حدسِ» نوعِ مسئله و آزمون‌های پیشین نگه داشته شد */
  var CHAT_PROB = /معما|ثابت\s*کن|اثبات\s*کن|حل\s*کن|حلش\s*کن|حلش\s*کردم|مسئله(?:‌ی|ی)?\s*(?:ریاضی|هندسه|احتمال|فیزیک|بعدی|دیگه)|تمرین(?:‌های)?\s*(?:ریاضی|کتاب)|[0-9۰-۹a-zA-Z]\s*[=<>≤≥]\s*[0-9۰-۹a-zA-Z(]|معادله|نامساوی|نابرابری|بیشینه|کمینه|ماکزیمم|مینیمم/;
  AS.CHAT_PROB = CHAT_PROB;
  /* ---------- «این نوبت مسئله نیست»: فهرستِ کوتاهِ منفی (سلام/سپاس، راهنمای صفحه، تنظیمات، رفتن) — نه شناختنِ هر شکلِ مسئله (R1) ---------- */
  var NOT_PROB = [
    /^(?:سلام|درود|سلام\s*علیکم|صبح\s*بخیر|عصر\s*بخیر|شب\s*بخیر|وقت\s*بخیر|خداحافظ|خدانگهدار|مرسی|ممنون(?:م)?|متشکر(?:م)?|سپاس(?:گزارم)?|دمت\s*گرم|عالی(?:ه)?|باشه|اوکی|ok|okay|thanks?|thank\s*you|hi|hello)(?:\s*(?:خیلی|زیاد|جان|عزیز|دستیار))*[\s!.،,؟?😊🙏👍]*$/i,
    /(?:این|اون|آن)\s*(?:صفحه|دکمه|بخش|نما|منو|زبانه|تب|نمودار|فرم)\s*(?:چی(?:ه)?|چیست|برای\s*چی(?:ه)?|چه\s*کار|چیکار|کجا)|(?:دکمه|منو|زبانه)(?:ی|ِ)?\s*[^\s]{0,20}\s*کجا(?:ست)?|کجا(?:ی\s*صفحه)?\s*(?:ثبتش|پیداش|ذخیره‌?ش|بازش)\s*(?:کنم|می[‌\s]?کنم)|(?:چطور|چطوری|چگونه)\s*(?:با|از)\s*(?:این\s*)?(?:صفحه|سامانه|دستیار|برنامه)\s*(?:کار|استفاده)|فونت|اندازهٔ?\s*(?:متن|نوشته)|حالتِ?\s*(?:تاریک|شب)|تنظیمات|(?:یادآور|ایمیل|تلگرام|اعلان)(?:ها)?\s*(?:را|رو)?\s*(?:خاموش|روشن|قطع|وصل)|پشتیبان\s*(?:بگیرم|گیری)|بک[‌\s]?آپ|خروجی\s*(?:بگیرم|گرفتن)|راهنمای\s*(?:صفحه|سامانه)|دفترچهٔ?\s*راهنما|^(?:برو(?:یم)?|ببرم|منو\s*ببر|بازش\s*کن)\s+(?:به\s*)?(?:صفحه|بخش|نمای|امروز|خانه|مرور|کارنامه|تنظیمات)/
  ];
  var PROB_HINT = /[=<>≤≥]|ثابت\s*کن|اثبات|معما|حل\s*(?:کن|ش)|مسئله/;
  AS.notProblem = function (msg) {
    var t = String(msg || "").replace(/[‏‎]/g, "").trim(); if (!t || /^\[سامانه/.test(t)) return true;
    if (NOT_PROB[0].test(t)) return true;
    return NOT_PROB[1].test(t) && !PROB_HINT.test(t);
  };
  /* بلوکِ فشردهٔ مسئلهٔ زنده (همیشه، برای سشنِ بسته) — اگر قلابِ خودِ بخشِ مسئله آن را نیاورده باشد (مثلاً بیرون از صفحه‌اش) */
  var PHN2 = { u: "فهمِ مسئله", p: "طرح", c: "اجرا", b: "بازنگری" }, NATN = { objective: "برهان/وارسیِ گام (پاسخِ عینی)", practical: "واقعیت (مسئلهٔ عملی با کمیت)", life: "واقعیت و داوریِ خودش" };
  function compactLive(s, pid, nq, dataOk, fresh) {
    var r = A.liveRec(pid), ph = A.livePhase ? A.livePhase(pid) : "", kind = liveKind(pid), pg = S.get("eprog_" + pid) || {}, so = pg.solve || {}, u = (so.u && so.u[1] && so.u[1].done) ? so.u[1] : null, L = so.live || {};
    var out = ["# مسئلهٔ زندهٔ این سشن (" + pid + "): «" + clip(r.p.title, 80) + "» · مرحله: " + (PHN2[ph] || ph) + " · داور: " + (NATN[kind] || kind || "؟") + " — (فشرده؛ این سشن به همین مسئله بسته است، حتی بیرون از صفحه‌اش)",
      "- صورت (عینِ حرفِ خودش): «" + clip(r.p.statement, 220) + "»"];
    if (u) out.push("- فهمِ خودش: مجهول «" + clip(u.u || u.one || "", 100) + "»" + ((u.dl || []).length ? " · داده‌ها: " + u.dl.map(function (d) { return "«" + clip(d.t, 40) + "»"; }).join("، ") : "") + (u.c ? " · شرط «" + clip(u.c, 100) + "»" : ""));
    out.push(AS.liveFrame(kind));
    if (ph !== "u" && dataOk !== false) { var ul = unusedLine(pid); if (ul) out.push(ul); }
    var co = nq && nq.coach; if (co && co.condUnused && co.condUnused.length && (ph === "c" || ph === "b") && kind === "objective") out.push("- بخش‌هایی از شرط که هنوز در هیچ گامی نیامده‌اند: " + co.condUnused.map(function (x) { return "«" + clip(x, 50) + "»"; }).join("، "));
    if (co && co.closure && co.closure.state !== "open") out.push("- وضعِ بستن: " + co.closure.label + (co.closure.state === "incomplete" || co.closure.state === "closing" ? " — «حل شد» نگو و جشن نگیر." : ""));
    var rl = refutedLine(pid, fresh, nq && nq.q); if (rl) out.push(rl);
    var o = (L.steps || []).filter(function (x) { return !x.closed; }).pop();
    if (o) out.push("- گامِ بازِ واقعی: «" + clip(o.text, 80) + "»" + (o.pred ? " · پیش‌بینی «" + clip(o.pred, 60) + "»" : "") + (o.due ? " · وارسی " + o.due : "") + " — نتیجه را خودش در صفحه ثبت می‌کند.");
    if (nq && nq.list && nq.list.length > 1) out.push("- پرسش‌های همین مرحله (برای همین نوعِ مسئله): " + liveList(s, nq, askedInChat(s)));
    if (nq) out.push(oneQLine(nq));
    out.push("- فیلدهای صفحه را پر نکن (data-own)؛ اگر لازم است او را با {\"do\":\"go\",\"view\":\"lprob\",\"arg\":\"" + pid + "\"} به صفحه‌اش ببر.");
    return out.join("\n");
  }
  /* B4 (تورِ پولیا دورِ ۳، s01 روزِ ۲۰): «پیش‌تر حل شد» — مجهول/شرط، روش (طرح)، نتیجه (یک نگاه، جوابِ گفت‌وگو یا آخرین گام)، درس و وارسیِ خودش، حکمِ بستن.
     ربط در سشنِ نابسته: دست‌کم دو واژهٔ معنادارِ متفاوتِ مشترک با عنوان/صورت/مجهول (همان قاعدهٔ «دو واژه» ِ R6)، پس از هم‌سان‌کردنِ گفتاریِ «ـونه» ⇐ «ـانه». */
  function tokN(t) { return qToks(t).map(function (w) { return w.replace(/ونه$/, "انه").replace(/(?:های|ها|ای|ی)$/, ""); }).filter(function (w) { return w.length >= 3; }); }
  function relatedDone(s, text) {
    if (!A.liveAll || !A.livePhase) return null; var mt = tokN(text), best = null, bn = 1;
    A.liveAll().forEach(function (r) {
      var pid = r.p && r.p.id; if (!pid || A.livePhase(pid) !== "done") return;
      var pg = S.get("eprog_" + pid) || {}, u = (pg.solve && pg.solve.u && pg.solve.u[1]) || {}, pt = tokN([r.p.title, r.p.statement, u.u || ""].join(" ")), seen = {};
      mt.forEach(function (w) { if (pt.indexOf(w) >= 0) seen[w] = 1; });
      var n = Object.keys(seen).length; if (n > bn) { bn = n; best = pid; }
    });
    return best;
  }
  /* دورِ ۱۱ (K1): مرورِ بی‌نگاه لحظه‌ای در تابعِ اولویتِ مربی است (recall) — این‌جا فقط زمینه؛ blind === "turn" یعنی بلوکِ مربی نیست و همین سطر پرسشِ نوبت است */
  var RECALL_Q = function (title) { return "یادت هست مجهول و راهت در همان مسئلهٔ حل‌شده (" + clip(title, 60) + ") چه بود؟"; };
  var OPEN_Q = function (title) { return "همان مسئلهٔ بازت (" + clip(title, 80) + ") را ادامه می‌دهی؟"; };
  /* پاسخِ خودش به مرورِ بی‌نگاه در همین پیام: «مثل دیروز/قبل…»، «همون روش»، «مجهولم/راهم … بود» */
  var RECALL_DONE_RE = /مثل\s*(?:دیروز|قبل|قبلی|اون\s*(?:دفعه|بار|روز)|همون|همان|دفعه(?:ٔ|ی)?\s*قبل)|همون\s*(?:روش|راه|کار|طرح)|(?:مجهول|راه|روش|طرح)(?:م|ِ?\s*من)(?![آ-ی])[^.؟?!\n]{0,120}?(?:بود|بوده)(?![آ-ی])|(?:دفعه|بار)(?:ٔ|ی)?\s*(?:قبل|پیش)/;
  function recallFresh(s, pid, mt) {
    var C = s.coach = s.coach || {}, R = C.recall = C.recall || {}, k = mkey(mt);
    if (R[pid] && R[pid] !== k) return false;
    if (RECALL_DONE_RE.test(ownText(mt))) { R[pid] = k; return false; }
    R[pid] = k; return true;
  }
  /* حرفش آشکارا دربارهٔ همان مسئلهٔ باز است: دو واژهٔ معنادارِ متفاوتِ مشترک با عنوان/صورت/مجهولِ خودش (همان قاعدهٔ relatedDone) */
  function onOpen(r, text) {
    try { var pg = S.get("eprog_" + r.p.id) || {}, u = (pg.solve && pg.solve.u && pg.solve.u[1]) || {}, pt = tokN([r.p.title, r.p.statement, u.u || ""].join(" ")), seen = {};
      tokN(text).forEach(function (w) { if (pt.indexOf(w) >= 0) seen[w] = 1; }); return Object.keys(seen).length >= 2; } catch (e) { return false; }
  }
  function solvedBlock(pid, blind) {
    var r = A.liveRec(pid); if (!r) return "";
    var pg = S.get("eprog_" + pid) || {}, so = pg.solve || {}, L = so.live || {}, u = (so.u && so.u[1] && so.u[1].done) ? so.u[1] : {}, bk = (so.b && so.b[1] && so.b[1].done) ? so.b[1] : {};
    var cl = null; try { cl = A.liveClosure ? A.liveClosure(pid) : null; } catch (e) { }
    var last = (L.steps || []).filter(function (x) { return x.closed && x.out && !x.out.auto; }).pop();
    var res = (A.liveResult && A.liveResult(pid)) || bk.glance || (L.chat && L.chat.solution) || (last ? clip(last.text, 80) + (last.out.what ? " ⇒ " + clip(last.out.what, 80) : "") : "");   // G5 (دورِ ۶، s01): جوابِ خودِ مسئله (a38)، نه «در یک نگاه»
    var out = ["# مسئلهٔ حل‌شدهٔ مرتبط (" + pid + "): «" + clip(r.p.title, 80) + "» · " + (cl && cl.label ? cl.label : "بسته شده") + (L.stateAt ? " · " + (L.stateD || String(L.stateAt).slice(0, 10)) : "")];
    if (blind === "turn") out.push("- **پرسشِ این نوبت همین است:** مرورِ بی‌نگاه — پیش از یادآوریِ جزئیاتِ پایین بپرس «" + RECALL_Q(r.p.title) + "»؛ جزئیات پس از پاسخِ خودش، برای پیوند (نتیجه یا روشش).");
    else if (blind) out.push("- زمینه (نه پرسشِ دوم): مرورِ بی‌نگاه — جزئیاتِ پایین را پیش از آن‌که خودش مجهول و راهش را به یاد آورد نگو؛ پس از آن برای پیوند به کار ببر (نتیجه یا روشِ همان مسئلهٔ مرتبطِ حل‌شده).");
    if (u.u || u.c) out.push("- مجهول «" + clip(u.u || u.one || "", 100) + "»" + (u.c ? " · شرط «" + clip(u.c, 100) + "»" : ""));
    if (L.plan && L.plan.t) out.push("- روش (طرحِ خودش): «" + clip(L.plan.t, 140) + "»");
    if (res) out.push("- نتیجه: «" + clip(res, 160) + "»");
    if (bk.use || bk.chkHow) out.push("- بازنگریِ " + (bk.own === false ? "ثبت‌شده (به قلمِ دستیار، نه خودش)" : "خودش") + ": " + (bk.use ? "درس «" + clip(bk.use, 120) + "»" : "") + (bk.chkHow ? (bk.use ? " · " : "") + "وارسی «" + clip(bk.chkHow, 100) + "»" : ""));
    out.push("- اگر حرفِ تازه‌اش مسئلهٔ تازه است، از «فهم» شروع کن (همین مربی)؛ نگه داشتنش: {\"do\":\"chat_invent\",\"statement\":\"عینِ حرفش\",\"from\":\"" + pid + "\",\"kind\":\"find|prove|pod\"}.");
    return out.join("\n");
  }
  AS.solvedBlock = solvedBlock; AS.relatedDone = relatedDone;
  /* دورِ ۱۲ (L6): درسِ بازنگریِ خودش (همان «درس» ِ بلوکِ مسئلهٔ حل‌شدهٔ مرتبط) — فقط به قلمِ خودش، نه ثبت‌شده به قلمِ دستیار */
  /* «دربارهٔ همان» = دست‌کم یک واژهٔ معنادارِ مشترک با عنوان/صورت/مجهول/طرح/درسِ همان مسئلهٔ بسته‌شده (شاهدِ مثبت؛ پیامِ مسئلهٔ تازه با NEWINTRO جداست) */
  function aboutDone(pid, text) {
    try { var r = A.liveRec(pid), so = (S.get("eprog_" + pid) || {}).solve || {}, u = (so.u && so.u[1]) || {}, L0 = so.live || {}, bk = (so.b && so.b[1]) || {};
      var pt = tokN([r.p.title, r.p.statement, u.u || "", (L0.plan && L0.plan.t) || "", bk.use || ""].join(" ")); return tokN(text).some(function (w) { return pt.indexOf(w) >= 0; }); } catch (e) { return false; }
  }
  function lessonOf(pid) { try { var so = (S.get("eprog_" + pid) || {}).solve || {}, bk = (so.b && so.b[1] && so.b[1].done) ? so.b[1] : {}; return bk.own === false ? "" : String(bk.use || "").trim(); } catch (e) { return ""; } }
  var LESSON_Q = function (l) { return "درسِ خودت در بازنگریِ همین مسئله: «" + clip(l, 120) + "» — همین را این‌جا چطور به کار می‌بری؟"; };
  /* «دادهٔ به‌کاررفته» ِ صادق (R3): فقط از A.liveUnused ِ بخشِ مسئله — هرگز این‌جا دوباره ساخته نمی‌شود (ادغامِ G1/G2)؛ و حدسِ ردشده به مدل گفته می‌شود (rerunA S2.6) */
  function unusedLine(pid) {
    try {
      var un = A.liveUnused ? A.liveUnused(pid) || [] : [];
      return un.length ? "- داده‌هایی که هنوز در طرح/گام‌ها به کار نرفته یا با دلیل کنار نرفته‌اند (نام بردن در گفت‌وگو به کار بردن نیست): " + un.map(function (d) { return "«" + clip(d.t, 40) + "»"; }).join("، ") + " — زمینه (نه پرسشِ دوم): گیر که شد، اول پرسشِ کلیِ «همهٔ داده‌ها را به کار بردی؟» و فقط اگر باز نیافت نامِ یکی («از … استفاده کردی؟») — آن هم فقط وقتی همین پرسشِ نوبت است." : "";
    } catch (e) { return ""; }
  }
  /* دورِ ۶ (G1/G3، s19): «آن را دوباره پیشنهاد نکن» زمینهٔ همیشگی است؛ ولی نام بردنِ B231 (و C107 در مربی) لحظهٔ خودش را دارد: نخستین نوبتِ گفت‌وگو پس از
     ثبتِ ردی تازه در صفحه (شمارِ ردها از A.livePlausible بالا رفت) — نه هر نوبت تا شش هفته بعد */
  /* دورِ ۸ (I-coach 2، s22): وقتی بلوکِ زنده پرسشِ نوبتِ دیگری دارد (کارتِ پیش‌فرض، …)، همین سطر زمینه است — «از ردش چه آموخت» پس از آن، نه پرسشِ دوم */
  function refutedLine(pid, fresh, tq) { try { var pl = A.livePlausible ? A.livePlausible(pid) : null; if (!(pl && pl.refuted)) return "";
    if (fresh && tq) return "- زمینه (نه پرسشِ دوم): حدسی که خودش با آزمون رد کرد: " + fa(pl.refuted) + " — آن را دوباره پیشنهاد نکن؛ کارِ درستش را اصلِ عامِ «حدس بزن، ولی حدست را بیازما» بنام (B231)؛ «از ردش چه آموخت و کدام فرضِ پنهان شکست؟» برای پس از پرسشِ این نوبت است، اگر خودش به آن نرسید.";
    return "- حدسی که خودش با آزمون رد کرد: " + fa(pl.refuted) + " — آن را دوباره پیشنهاد نکن" + (fresh ? "؛ بپرس از ردش چه آموخت و کدام فرضِ پنهان شکست؛ و همان را اصلِ عامِ «حدس بزن، ولی حدست را بیازما» بنام (B231) — کاری که همین حالا خودش کرد." : "."); } catch (e) { return ""; } }
  /* دورِ ۸ (I-coach 2): حدسِ ردشده‌ای که خودش گزاره‌ای کلی است (همیشه/هر/همه/قانون…) — فقط آن «دامنه‌اش را تنگ کن» (C107) دارد */
  /* دورِ ۹ (s22): «قانون/قاعده» فقط واژهٔ کامل («قانونیِ» صفت است، ادعای کلی نیست) */
  var GENCLAIM_RE = /همیشه|همه|(?:^|[\s«،(])هر(?=[\s‌])|(?:^|[\s«،(])(?:قانون|قاعده)(?=$|[\s.،؛!؟»)])|هیچ[‌\s]?(?:وقت|کس|کدام|جا)|هرگز|برای\s*هر/;
  function refGeneral(pid) { try { var so = ((S.get("eprog_" + pid) || {}).solve) || {}, g = so.g && so.g[1], pl = A.livePlausible ? A.livePlausible(pid) : null;
    /* دورِ ۹ (s22): فقط حدس‌های **ردشده** (refutedG) — حدسِ کنونی پس از رد، حدسِ تازه است نه آنچه رد شد */
    /* … و حدسِ کنونی وقتی خودش (پس از ثبتش) رد شده و حدسِ تازه‌ای جایش ننشسته (refutedNow ِ a38) */
    var T = ((pl && pl.refutedG) || []).slice(); if (g && g.prev) T = T.concat([].concat(g.prev).map(function (x) { return x && (x.guess || x); })); if (g && g.guess && pl && pl.refutedNow > 0) T.push(g.guess); T = T.filter(function (t) { return typeof t === "string" && t; }); return T.some(function (t) { return GENCLAIM_RE.test(String(t)); }); } catch (e) { return false; } }
  /* هم‌توان در یک نوبت: پرامپت ممکن است برای بودجه چند بار ساخته شود (AS.prompt ⇒ userPrompt تا ۴ بار) — همان پیام همان پاسخ را می‌گیرد */
  /* دورِ ۷ (H1، s19): «تازه» فقط در همان روزِ رد — نخستین گفت‌وگو شش هفته پس از رد لحظهٔ «از ردش چه آموختی؟» نیست (روزِ ردِ گام: out.d ِ صفحه) */
  function refDay(pid) { try { var L = ((S.get("eprog_" + pid) || {}).solve || {}).live || {}; return (L.steps || []).filter(function (x) { return x && x.out && x.out.guess && x.out.guess.rel === "refute"; }).map(function (x) { return String(x.out.d || dayOf(x.out.at) || ""); }).sort().pop() || ""; } catch (e) { return ""; } }
  function refFresh(s, pid, mt) { try { var pl = A.livePlausible ? A.livePlausible(pid) : null, n = (pl && pl.refuted) || 0, C = s.coach = s.coach || {}, R = C.refSeen = C.refSeen || {}, k = mkey(mt), was = R[pid];
    if (was && typeof was === "object" && was.k === k) return !!was.f; var w0 = was && typeof was === "object" ? was.n : (was || 0), rd = refDay(pid), f = n > w0 && (!rd || rd === A.today()); R[pid] = { n: n, k: k, f: f }; return f; } catch (e) { return false; } }
  /* افزوده به بلوکِ a38: سطرِ داده‌های به‌کارنرفته را خودِ a38 از همان A.liveUnused می‌دهد — فقط اگر نداد؛ و حدسِ ردشده */
  var UNUSED_HEAD = /^- (?:زمینه \(نه پرسشِ دوم\): )?داده‌هایی که هنوز (?:در کارِ حل نیامده‌اند|به کار نرفته‌اند|در طرح\/گام‌ها به کار نرفته)/m;
  /* E3 (دورِ ۴، s30، s33، s35): «همهٔ داده‌ها را به کار بردی؟» فقط وقتی طرحی هست یا کاربر گیر است — در آغازِ طرح هر داده‌ای «به‌کارنرفته» است و پرسیدنش زود است */
  /* دورِ ۵ (F2، s30، s33، s35): «همهٔ داده‌ها؟» **هرگز** پیش از طرح — گیر بودن هم آن را زودتر نمی‌آورد (گیرِ بی‌طرح ⇒ «از خواسته به عقب» ِ A.liveCoach) */
  function dataLineOk(pid) {
    var ph = A.livePhase ? A.livePhase(pid) : ""; if (ph === "c" || ph === "b") return true;
    var L = (((S.get("eprog_" + pid) || {}).solve || {}).live) || {}; return !!(L.plan && (L.plan.t || L.plan.text)) || (L.steps || []).length > 0;
  }
  /* فهرستِ پرسش‌های مرحلهٔ مسئلهٔ زنده با شناسه (E1) و نشانِ «پاسخ‌گرفته»؛ نقشهٔ شناسه ⇐ پرسش برای گزارشِ وضعِ همین نوبت */
  function liveList(s, nq, asked) {
    var C = s ? (s.coach = s.coach || {}) : null, pre = QID[nq.ph] || "u"; if (C) C.qmap = {};
    var pk = nq.coach && nq.coach.pid ? "l:" + nq.coach.pid : "";
    /* دورِ ۱۳ (M3، s01 p2→p3): تا کارتِ «اول کل، بعد جزءها» باز است، پرسشِ کل‌اول (A191 / A.liveWholeQ) هم شناسه دارد (u0) — مدل با coach_state پاسخ‌گرفتنش را
       گزارش می‌کند، دفترِ سنجیده (WHOLE_OK) تکرارش را در نوبتِ بعد می‌گیرد؛ کارتِ صفحه تا «ثبتِ کل» می‌ماند */
    var WQ = A.liveWholeQ, w0 = nq.ph === "u" && WQ && nq.coach && nq.coach.pageQ === WQ && nq.list.indexOf(WQ) < 0;
    if (C && w0) C.qmap.u0 = WQ;
    return (w0 ? ["u0) «" + WQ + "»" + (ledgerAns(s, WQ, pk) ? " [در گفت‌وگو پاسخ گرفته — دوباره نپرس]" : "")] : []).concat(nq.list.map(function (x, k) { var id = pre + (k + 1); if (C) C.qmap[id] = x; return id + ") «" + x + "»" + (ledgerAns(s, x, pk) ? " [در گفت‌وگو پاسخ گرفته — دوباره نپرس]" : ""); })).join(" · ");
  }
  function liveExtra(pid, block, dataOk, fresh, tq) { var ph = A.livePhase ? A.livePhase(pid) : ""; return [ph !== "u" && dataOk !== false && !UNUSED_HEAD.test(block) ? unusedLine(pid) : "", /با آزمون رد کرد/.test(block) ? "" : refutedLine(pid, fresh, tq)].filter(Boolean).join("\n"); }
  /* پرسشِ هم‌گام، با کنار گذاشتنِ پرسشِ پاسخ‌گرفته در گفت‌وگو (نه فقط در صفحه) */
  /* B3 (تورِ پولیا دورِ ۳، s02): گیر (گیر کردم/نمی‌دونم/جور نمی‌شه) و دادهٔ به‌کارنرفته ⇒ پرسشِ کلیِ «همهٔ داده‌ها را به کار بردی؟ کلِ شرط را؟» پیش از
     تکرارِ «پیش‌تر دیده‌ای؟» — و فقط اگر آن هم راه نبرد، نامِ داده (کلی ⇐ خاص) */
  var ALLDATA_RE = /همهٔ داده‌ها|همهٔ فرض|داده‌هایی که اثرِ محسوس/, ALLDATA_Q = "همهٔ داده‌ها را به کار بردی؟ کلِ شرط را؟";
  /* دورِ ۵ (F2): یک پرسش در نوبت، یک منبع — نشانه‌های همین نوبت (turn) و پرسش‌های پاسخ‌گرفتهٔ دفترِ همین مسئله (asked) به A.liveCoach می‌رود و q همان است که
     او می‌دهد (اولویت: کارِ همین نوبت ⇐ شکست ⇐ کارتِ صفحه ⇐ نردبان — DECISIONS_R5 F2، در بخشِ مسئله). تنها افزوده: B3 («همهٔ داده‌ها؟») وقتی طرح هست، گیر است
     و داده‌ای به کار نرفته (E3 ِ دورِ ۴) — و آن هم هرگز پیش از طرح. پیش‌تر این‌جا «از خواسته به عقب» و «پرسشِ دیگر» هم جایگزین می‌شد (منبعِ دوم). */
  /* دورِ ۶ (G1): نشانه‌های نوبت برای (مسئله، پیامِ بعدیِ کاربر) — گزارشِ سنجیدهٔ پیامِ پیشین فقط اگر **همان پیام و همان مسئله** است (C.rep.pk؛ نه با کلیدِ پیام
     به‌تنهایی: «گیر کردم» ِ مسئلهٔ ۱ به پیامِ مسئلهٔ ۲ نمی‌رسد، s30) و فقط همان یک نوبت. «نتیجه» دیگر تا ثبتِ صفحه نمی‌ماند (C.resBy برداشته شد، s02، s07، s09):
     فقط برای پیامِ بعد، و همان‌جا هم با گیر، پرسش یا حدسِ تازه پاک می‌شود. «…درسته؟» پس از مقدار **حدس** است (guess ⇒ «چطور می‌آزمایی‌اش؟»)، نه نتیجه.
     کشفِ تازهٔ همین پیام («آها!»، نتیجه، حدس) گیر/شکستِ گزارش‌شدهٔ پیامِ پیشین را پاک می‌کند (s21، s33، s36). «یادم اومد X… نمی‌دونم چطور از اون استفاده کنم»
     نشانهٔ «مسئلهٔ مرتبط» است (related)، نه گیر (s35). a38 اگر guess/related را نشناسد نادیده می‌گیرد (امضا همان است). */
  /* دورِ ۷ (H1): نشانه‌ای که پرسشِ نوبت را **جایگزین** می‌کند (حدس، رها کردن) شاهدِ مثبتِ همان کار از خودِ کاربر در همین پیام می‌خواهد — متنِ نقل‌شده
     («…»، "…"، “…» — خطِ نقش‌آفرینی، حرفِ دیگری) شاهدِ کارِ خودش نیست. حدس = مقدار/ادعای نامزدی که خودش می‌گوید و درستی‌اش را می‌پرسد («X درسته؟»،
     «فکر کنم X … درسته؟»، «… X، نه؟») یا خبری می‌گوید («فکر کنم آخرش «ستان» باشه»، «حدسم…»)؛ نه پرسشِ تصمیمِ خودش («… بخرم یا نه؟»، «جا میشه یا نه؟» — s01، s02)
     و نه در قابِ معلم بازخواهیِ سرنخِ خودش («باز لو دادم نه؟» — s15). */
  function ownText(t) { return String(t || "").replace(/«[^»]*»|"[^"\n]*"|“[^”]*”/g, " «» "); }
  var GUESSQ_RE = /(?:درسته|درست\s*(?:است|ه)|صحیحه|همینه|مگه\s*نه|(?:^|[\s،,.…])نه)\s*(?:دیگه|دیگر)?\s*[؟?]/g;
  var GUESS_MARK = /(?:^|[\s.،؛!…])(?:پس|فکر\s*کنم|فکر\s*می[‌\s]?کنم|به\s*نظرم|حدسم|حدس\s*می[‌\s]?زنم)(?![آ-ی])/;
  /* دورِ ۱۰ (J2، s20 p3): حدسِ خبری بی «؟» هم — «شاید X مهمه/باشه»، «به نظرم X باشه» (کنارِ «فکر کنم/حدس می‌زنم … باشه») و «حس می‌کنم درسته» پس از نامزدِ خودش */
  var GUESS_DECL = /(?:^|[\s.،؛!…:：])(?:فکر\s*(?:کنم|می[‌\s]?کنم)|حدس\s*می[‌\s]?زنم|به\s*نظرم|شاید)\s+(?!(?:باید|بهتره|لازمه|نمی)(?![آ-ی]))[^.؟?!\n]*?\s(?:باشه|باشد|باشن|باشند|مهمه|مهم\s*است|مهم\s*باشه)(?=[\s.!،…]|$)/;
  var GUESS_FEEL = /(?:^|[\s.،؛!…])حس\s*می[‌\s]?کنم\s*(?:که\s*)?(?:درسته|درست\s*(?:است|ه)|همینه|همین\s*است)(?=[\s.!،…]|$)/;
  var GUESS_MINE = /(?:^|[\s.،؛!…])حدس(?:م|\s*من)(?![آ-ی])\s*(?:اینه|این\s*است)?\s*(?:که\s*)?[.…:：]*\s*([^؟?!\n]+)/;
  /* دورِ ۱۱ (K2، s21 p2، s22 p1، s23 p1، s26 p1، s29 p1/p7): ادعای خبری با «به نظرم/شاید/فکر کنم/حدس می‌زنم» دربارهٔ موضوعِ مسئله حدس است — با **هر**
     پایانی («به نظرم کار سرایداره چون…»، «شاید ۳۵ تقسیم بر ۲۰…»، «به نظرم نه، …»، «فکر کنم مرکز … است»). نه وقتی بندِ پس از نشانه دربارهٔ خودِ اوست
     (فعلِ اول‌شخصِ مفرد: «شاید فردا برم کوه»، «فکر کنم استعدادشو ندارم») و نه پیشنهاد/نیت/داوریِ دشواری («فکر کنم باید…»، «به نظرم بهتره…»، «به نظرم سخته»). */
  var GUESS_OPIN = /(?:^|[\s.،؛!…:：])((?:گفتم\s*)?شاید|به\s*نظرم|فکر\s*(?:کنم|می[‌\s]?کنم)|حدس\s*می[‌\s]?زنم)(?![آ-ی‌])\s*[،,:：]?\s*([^.؟?!\n،؛]{1,160})/g;
  var OPIN_LEAD = /^(?:باید|بهتره|بهتر|لازمه|لازم|خوبه|خوب\s*باشه|سخت|سخته|آسون|آسونه|آسان|دشوار|ساده|پیچیده|اول|بعدش|بعد|یه\s*کم|کمی)(?![آ-ی])/;
  var OPIN_SELF = /(?:^|\s)(?:من|خودم|منو|مرا|منم)(?![آ-ی‌])|(?:^|\s)(?:یادم|حواسم|ذهنم|حالم|دلم|استعداد[آ-ی]*)(?![آ-ی‌])|(?:^|\s)(?:می|نمی)[‌\s]?[آ-ی]{0,12}[^ی\s]م(?![آ-ی‌])|(?:^|\s)[بن][آ-ی]{0,8}[^ی\s]م(?![آ-ی‌])|(?:^|\s)(?:دارم|ندارم|هستم|نیستم|بلدم|بودم|شدم|کردم|رفتم|گرفتم|تونستم|نتونستم)(?![آ-ی‌])/;
  /* «… ⇒ ۱۳/۲۷. فکر کنم درسته.» — قیدِ درستی پشتِ نتیجهٔ کارِ خودش، نه ادعای تازه (R6 G4، s28؛ همان قاعده‌های GUESSQ/GUESS_FEEL ِ پیشین داوری‌اش می‌کنند) */
  var OPIN_BARE = /^(?:درسته|درست\s*(?:است|ه|باشه|باشد)|همینه|همین\s*(?:است|باشه))$/;
  /* دورِ ۱۲ (L1): حدس = یک ادعای نامزد دربارهٔ موضوعِ مسئله، با تردید، که هنوز نیازموده. هزینه‌ها نامتقارن‌اند — حدسِ دروغین پرسشِ پولیا را **جایگزین** می‌کند
     (گران)، حدسِ ازدست‌رفته فقط سطرِ عامِ ادعا را زمینه می‌گذارد (ارزان) ⇒ شاهدِ مثبت لازم است. پس نه وقتی:
     (۱) نشانه شرطی است «اگه فکر کنم، …» (s01 p3)؛ (۲) خودش همان را در همان جمله لغو می‌کند «شاید X ولی … ربط ندارن» (s01 p6)؛
     (۳) داوری پشتِ نتیجه/وارسیِ خودش است «فکر کنم حل شد»، «به نظرم منطقیه»، «درسته» (s03 p5، s38 p5 ⇒ راهِ نتیجه/بازنگری)؛
     (۴) بند گامِ برگزیدهٔ خودش است — بی فعل و با زمانِ انجام «شاید یه اسکیس… فردا صبح ۲۰ دقیقه» (s34 p2 ⇒ راهِ گام/🌱)؛
     (۵) معنای واژه را می‌جوید — «X یعنی…» با نامزدها یا تردید، «یه بار… یه بار…، نمی‌دونم کدوم» (s13 p3، s27 p2 ⇒ A038)؛
     (۶) پیش‌تر خودش آزموده و برهان می‌خواهد «امتحان کردم، نشد… چطور ثابتش کنم؟» (s11 p3 ⇒ پرسشِ برهان). */
  var OPIN_BARE2 = /^(?:حل\s*شد(?:ه)?|منطقی(?:ه|\s*(?:است|ه|باشه|باشد))?|معقول(?:ه|\s*(?:است|ه))?|جور\s*در\s*(?:میاد|می[‌\s]?آید|اومد|آمد)|درست\s*در\s*(?:میاد|می[‌\s]?آید|اومد|آمد)|(?:درسته|درست\s*است|حل\s*شد)\s*(?:دیگه|دیگر))$/;
  var OPIN_CANCEL = /ربط(?:ی)?\s*(?:ندار|نداره|ندارن|ندارد)|بی[‌\s]?ربط|مهم\s*نیست|فرقی\s*(?:نمی|ندار)|(?:اثری|تأثیری|تاثیری)\s*ندار/;
  var PLAN_TIME = /(?:^|[\s،,])(?:فردا|پس[‌\s]?فردا|امشب|امروز|هفته[‌\s]?ی?\s*(?:بعد|دیگه)|[0-9۰-۹]+\s*(?:دقیقه|ساعت\s*در\s*روز))(?![آ-ی])/;
  var VERB_IN = /(?:^|\s)(?:می|نمی)[‌\s]?[آ-ی]|(?:^|\s)[بن][آ-ی]{1,8}(?:ه|د|ن|ند)(?![آ-ی‌])|(?:است|ست|هست|نیست|بود|باشه|باشد|میشه|نمیشه|شد|داره|دارن|ندارن?|هستن)(?![آ-ی‌])/;
  var COND_BEFORE = /(?:^|[\s،,])(?:اگه|اگر)\s*$/;
  var DEF_HEAD = /(?:«»|[آ-ی‌]{2,}(?:\s[آ-ی‌]{2,})?)\s*یعنی\s*(?:\.{2,}|…|(?:چی|چه)\s*[؟?])/;
  var DEF_DOUBT = /نمی[‌\s]?(?:دونم|دانم)\s*(?:دقیقاً|دقیقا|کدوم|کدام)|[؟?]\s*یا\s|یه\s*بار[^]{0,200}?یه\s*بار|(?:یعنی\s*(?:چی|چه)\s*[؟?])/;
  var WHICH_DOUBT = /نمی[‌\s]?(?:دونم|دانم)\s*(?:کدوم|کدام)(?:ش|یکی|ه)?(?![آ-ی])/, ENUM_RE = /یه\s*بار[^]{0,200}?یه\s*بار|[؟?،]\s*یا\s/;
  var TESTED_RE = /(?:امتحان|آزمایش|تست|چک|وارسی)\s*کردم|آزمودم/, PROOF_ASK = /(?:چطور|چطوری|چگونه|چجوری)\s*ثابت(?:ش)?\s*(?:کنم|کنیم|می[‌\s]?شه)|اثبات(?:ش)?\s*(?:چیه|کو|چطور)|برهان(?:ش)?\s*(?:چیه|کو)/;
  function defAsk(t) { t = ownText(t); return DEF_HEAD.test(t) && DEF_DOUBT.test(t); }
  function defWord(t) { var m = /«([^»]{1,30})»\s*یعنی/.exec(String(t || "")) || /([آ-ی‌]{2,}(?:\s[آ-ی‌]{2,})?)\s*یعنی\s*(?:\.{2,}|…|(?:چی|چه)\s*[؟?])/.exec(String(t || "")); return m ? m[1].replace(/^(?:خب|خوب|پس|اما|ولی|راستش)\s+/, "") : ""; }
  function testedProof(t) { t = ownText(t); return TESTED_RE.test(t) && PROOF_ASK.test(t); }
  /* M4 (دورِ ۱۳): شکستِ حالت‌های آزموده («نشد»، «نمیشه»، «جور نشد»، «غلط درومد»، «ناممکن») بر «درسته» مقدم است — ادعای ناممکن بودن همان پرسشِ «چه چیزی نشدن را
     لازم می‌آورد»؛ حالت‌هایی که جواب دادند («درسته»، «جواب داد»، «برقرار بود») ⇒ ویژگیِ کارساز برای حالتِ کلی؛ هیچ‌کدام ⇒ همان پرسشِ پیشین (رفتارِ دورِ ۱۲) */
  var CASES_FAIL = /(?:^|[\s،,.])(?:نشد|نمی[‌\s]?(?:شه|شود)|نمیشه|جور\s*(?:نشد|نمیشه|درنمیاد|درنیومد)|درنیومد|درنیامد|غلط\s*(?:شد|درومد|درآمد|بود)|ناممکن|غیر\s*ممکن|محال)(?![آ-ی])/,
    CASES_OK = /(?:^|[\s،,.])(?:درست(?:ه|\s*(?:بود|است|درومد|درآمد|شد))|جواب\s*(?:داد|می[‌\s]?ده)|کار\s*(?:کرد|می[‌\s]?کنه)|برقرار(?:ه|\s*(?:بود|است|شد))|درمیاد|درمی‌آید|درومد|درآمد)(?![آ-ی])/;
  function proofQ(t) { t = ownText(t); var cut = t.split(PROOF_ASK)[0]; return CASES_FAIL.test(cut) || !CASES_OK.test(cut) ? PROOF_Q : PROOF_OK_Q; }
  function notGuessMsg(t) { return defAsk(t) || (WHICH_DOUBT.test(ownText(t)) && ENUM_RE.test(ownText(t))) || testedProof(t); }
  AS.coachDefAsk = defAsk; AS.coachTestedProof = testedProof;
  function opinionGuess(t) {
    var g = new RegExp(GUESS_OPIN.source, "g"), m;
    while ((m = g.exec(t))) {
      var parts = m[2].split(/\s(?:ولی|اما|منتها|چون|چونکه|زیرا)(?![آ-ی‌])/), cl = parts[0].trim(), at = m.index + m[0].indexOf(m[1]);
      if (!cl || OPIN_LEAD.test(cl) || OPIN_SELF.test(" " + cl) || OPIN_BARE.test(cl) || OPIN_BARE2.test(cl)) continue;
      if (COND_BEFORE.test(t.slice(0, at)) || /^یعنی(?![آ-ی])/.test(cl)) continue;
      if (parts.length > 1 && /\s(?:ولی|اما|منتها)(?![آ-ی‌])/.test(m[2]) && OPIN_CANCEL.test(parts.slice(1).join(" "))) continue;
      var nxt = t.slice(m.index + m[0].length).split(/[.!؟?\n]/).slice(0, 2).join(" ");
      if (!VERB_IN.test(" " + cl) && PLAN_TIME.test(cl + " " + nxt)) continue;
      return { mk: m[1].replace(/^گفتم\s*/, "").replace(/\s+/g, " "), w: cl.split(/\s+/).slice(0, 3).join(" ") };
    }
    return null;
  }
  /* دورِ ۸ (I-coach 5، s07): guessWhy همان داوری است با نامِ نشانه‌ای که واقعاً حدس را ساخت (برای یادداشتِ «همین پیام حدس است») */
  function guessWhy(t, teach) {
    if (notGuessMsg(t)) return "";   // دورِ ۱۲ (L1): معنای واژه / نامزدهای شمرده با «نمی‌دونم کدوم» / آزموده و برهان‌خواه — حدس نیست
    t = faDigits(ownText(t)); var g = new RegExp(GUESSQ_RE.source, "g"), m;
    while ((m = g.exec(t))) {
      var w = m[0].replace(/^[\s،,.…]+/, ""), pre = t.slice(0, m.index + m[0].length - m[0].replace(/^[\s،,.…]+/, "").length);
      if (/^نه/.test(w) && (/(?:^|\s)یا\s*$/.test(pre) || teach)) continue;   // «…یا نه؟» پرسشِ تصمیم است؛ «… نه؟» ِ معلم بازخواهیِ سرنخِ خودش
      var span = pre.split(/[؟?]/).pop();
      if (/[0-9]/.test(span)) return "«…" + w.trim() + "» پس از مقدار";
      var gm = GUESS_MARK.exec(span); if (gm) return "«" + gm[0].replace(/^[\s.،؛!…]+/, "") + " … " + w.trim() + "»";
    }
    var d = GUESS_DECL.exec(t); if (d && COND_BEFORE.test(t.slice(0, d.index + d[0].length - d[0].replace(/^[\s.،؛!…:：]+/, "").length))) d = null;
    if (d) { var mk0 = (/حدس/.test(d[0]) ? "حدس می‌زنم" : /شاید/.test(d[0].slice(0, 12)) ? "شاید" : /نظرم/.test(d[0].slice(0, 14)) ? "به نظرم" : "فکر کنم"); return "«" + mk0 + " … " + d[0].trim().split(/\s+/).pop() + "»"; }
    var fl = GUESS_FEEL.exec(t); if (fl && qToks(t.slice(0, fl.index)).length >= 2) return "«… " + fl[0].replace(/^[\s.،؛!…]+/, "").trim() + "»";
    var op = opinionGuess(t); if (op) return "«" + op.mk + " " + op.w + " …»";
    var x = GUESS_MINE.exec(t); return x && !/غلط|اشتباه|رد\s*شد|نادرست|درست\s*نبود/.test(x[1]) ? "«حدسم …»" : "";
  }
  function guessNow(t, teach) { return !!guessWhy(t, teach); }
  AS.coachGuess = guessNow;
  /* دورِ ۷ (H1، s04، s06): میلِ رها کردنِ کلِ راه از حرفِ خودش (نه نقل‌شده، نه منفی: «نمی‌خوام ولش کنم») ⇒ turn.abandon برای A.liveCoach */
  var ABANDON_OWN = /بندازم\s*دور|دور\s*(?:بندازم|بریزم)|کل(?:ش|ِ?\s*\S+)?\s*(?:رو|را)?\s*(?:بذارم\s*کنار|ول\s*کنم|دور\s*بریزم)|از\s*صفر\s*شروع\s*کنم|(?:^|[\s،.…])ول(?:ش)?\s*(?:می[‌\s]?)?کنم|رها(?:ش)?\s*(?:می[‌\s]?)?کنم|بی[‌\s]?خیال(?:ش)?\s*(?:می[‌\s]?)?شم|انصراف\s*(?:بدم|می[‌\s]?دم|بدهم)|راهی\s*نیست/;
  function abandonNow(t) { t = ownText(t); var m = ABANDON_OWN.exec(t); if (!m) return false; return !/(?:^|[\s،])(?:نمی[‌\s]?(?:خوام|خواهم)|نباید|نمی[‌\s]?تونم)(?![آ-ی])/.test(t.slice(0, m.index).split(/[.!؟?؛\n]|،\s*(?:ولی|اما)/).pop()); }
  /* دورِ ۱۱ (K10، s38 p7): «X رو بلدم ولی نمی‌دونم ربطش چیه»، «فرمولِ X رو بلدم … ربطش؟» — نتیجه‌ای حل‌شده که دارد و نمی‌داند به کار ببرد (A032/B100) */
  var RELATED_RE = /(?:بلدم|می[‌\s]?دونم|می[‌\s]?دانم|یادمه|حفظم)[^.؟?!\n]{0,40}?(?:ولی|اما|منتها)\s*نمی[‌\s]?(?:دونم|دانم)\s*(?:ربطش|ربطِ?\s*(?:اون|آن|این|ش)|چه\s*ربطی|چطور(?:ی)?\s*(?:به\s*کار|استفاده|ربط))|(?:بلدم|می[‌\s]?دونم|یادمه)[^؟?!\n]{0,80}?ربطش\s*(?:چیه|چیست)?\s*[؟?]|(?:یادم\s*(?:اومد|آمد|افتاد)|(?:مسئله|مورد|نمونه|طرح)(?:‌ای|ی)?\s*(?:مشابه|شبیه)|قبلاً\s*(?:دیده|حل\s*کرده))[^]{0,160}?نمی[‌\s]?(?:دونم|دانم)\s*(?:چطور|چطوری|چگونه|چجوری)\s*(?:از\s*(?:اون|آن|این|او|اونا|آن‌ها|آنها)|ازش|ازشون)\s*(?:استفاده|کمک)/;
  var AHA_RE = /(?:^|[\s.!،؛…])(?:آها|آهان|فهمیدم|پیداش\s*کردم|پیدا\s*شد|یافتم)(?=[!\s.،]|$)/;
  /* دورِ ۷ (H1، s33): یافتهٔ تازهٔ خودش با «پس … !» («پس ادعای صاحبخونه از بخش … هیچ‌جا استفاده نکرده!») — نه دلسردی («پس این همه وقت هدر رفت!») */
  var FOUND_RE = /(?:^|[\s.!،؛…])پس\s+[^.؟?!\n]{2,}!/;
  function carried(s, mt, pk) {
    var C = (s && s.coach) || {}, M = ((s && s.msgs) || []).filter(isUser), cur = M.length && mkey(M[M.length - 1].text) === mkey(mt) ? M.length - 1 : M.length, pv = M[cur - 1];
    return C.rep && pv && C.rep.key === mkey(pv.text) && C.rep.pk === pk ? C.rep : null;
  }
  function turnSig(rep, mt, auto, teach, ctx) {
    var t = String(mt || ""), now = !auto, stuckNow = now && (STUCK_RE.test(t) || NOTKNOW_RE.test(t)), guess = now && guessNow(t, teach), related = now && RELATED_RE.test(t), asks = now && /[؟?]/.test(t);
    var found = now && !FAIL_ME.test(t) && !stuckNow && FOUND_RE.test(ownText(t));
    var resNow = now && !guess && solvedSaid(t, { intro: true }) && !OTHER18_RE.test(t) && !unsolvedNow(t, ""), fresh = resNow || guess || found || (now && AHA_RE.test(t));
    return { analogy: now && CARRY_RE.test(faDigits(t).replace(/‌/g, " ")), result: resNow || !!(rep && rep.result && !stuckNow && !asks && !guess),
      stuck: !related && (stuckNow || !!(rep && rep.stuck && !fresh)), fail: (now && unsolvedNow(t, "")) || !!(rep && rep.fail && !fresh), guess: guess, related: related,
      abandon: now && abandonNow(t), text: now ? ownText(t) : "" };   // دورِ ۷ (H1): a38 «turn-abandon» و الگوهای متنیِ خودش از حرفِ خودِ کاربر
  }
  function turnOf(s, pid, mt, auto) { var st = ""; try { var r0 = A.liveRec(pid); st = (r0 && r0.p && r0.p.statement) || ""; } catch (e) { }
    var teach = !!s && !auto && teachMode(s, mt), t = turnSig(carried(s, mt, "l:" + pid), mt, auto, teach, { stmt: st });
    /* دورِ ۱۰ (J1، s38 p1): «فقط جواب» بی هیچ تلاشِ دیدنی کارِ همین نوبت است (A073) — به A.liveCoach می‌رود؛ (J2، s13) «مطمئنی (این گزینه) درسته؟» هم */
    /* a38 (دورِ ۱۰) A.liveOnlyAns(text) را صادر می‌کند — همان داوری؛ تلاشِ دیدنی در پیام‌های پیشینِ سشن را این‌جا می‌سنجیم */
    /* دورِ ۱۱ (K3): داوریِ مربی (ONLY_ANS_RE) و بخشِ مسئله (A.liveOnlyAns) با «یا» — یک خانوادهٔ «فقط جواب» در هر دو مسیر */
    if (!auto) { var oa = ONLY_ANS_RE.test(mt); try { oa = oa || (typeof A.liveOnlyAns === "function" && !!A.liveOnlyAns(mt)); } catch (e) { }
      t.onlyAns = oa && !attemptSeen(s, mt, teach, false); t.optCheck = !t.guess && optCheck(mt); }
    return t; }
  AS.coachTurn = turnOf;
  function nextQFor(s, pid, mt, auto) {
    if (!s) return AS.liveNextQ(pid);
    var turn = turnOf(s, pid, mt, auto), askedL = AS.coachLedger(s, "l:" + pid);
    var nq = AS.liveNextQ(pid, { asked: askedL, stuck: turn.stuck, turn: turn }); if (!nq) return nq; nq.turn = turn;
    /* دورِ ۱۰ (J1/J2): کارِ همین نوبت — اگر بخشِ مسئله خودش آن را پرسشِ نوبت نکرد (src ِ «turn-…» ندارد)، همین‌جا: «فقط جواب» ِ بی تلاش ⇒ «تا کجا رفتی؟»
       (پیش از نخستین سرنخ، A073)؛ «مطمئنی این گزینه درسته؟» ⇒ گزینه را با تک‌تکِ بخش‌های شرط بسنجد (A058/B003). فراخوانیِ دفاعی: نسخهٔ بخشِ مسئله‌ای که turn.onlyAns را
       می‌شناسد همان را با src ِ خودش می‌دهد و این‌جا دست نمی‌خورد. */
    var src0 = String((nq.coach && nq.coach.src) || ""), tq0 = turn.onlyAns ? ONLY_Q : turn.optCheck ? OPT_Q : "";
    if (tq0 && !/^turn-/.test(src0) && !ledgerAns(s, tq0, "l:" + pid)) { nq = Object.assign({}, nq, { q: tq0, coach: Object.assign({}, nq.coach || {}, { src: turn.onlyAns ? "turn-onlyAns" : "turn-check" }) }); return nq; }
    /* پیگیریِ دورِ ۶ (s26): فقط روی منبعِ گیرِ عامِ بخشِ مسئله (stuck-…) — هرگز روی کارتِ خاصِ صفحه (card-… یا fail-…) یا کارِ همین نوبت (turn-…) */
    /* H2 (دورِ ۷، s02): از گیرِ دومِ پیاپی، دنبالهٔ «کلی ⇐ خاص» ِ بخشِ مسئله (stuckN) خودش پلهٔ بعد را می‌دهد — «همهٔ داده‌ها؟» دوباره رویش نمی‌نشیند */
    if ((nq.ph === "p" || nq.ph === "c") && nq.coach && /^stuck-/.test(String(nq.coach.src || "")) && !(nq.coach.stuckN > 1) && (nq.coach.unused || []).length && turn.stuck && dataLineOk(pid)) {
      var qa = (nq.list || []).filter(function (q) { return ALLDATA_RE.test(q); })[0] || ALLDATA_Q;
      if (!ledgerAns(s, qa, "l:" + pid)) return Object.assign({}, nq, { q: qa, stuckData: true });
    }
    return nq;
  }
  /* «X هم ۲٫۸ برابر؟»، «به همان نسبت» — نسبتی که به کمیتِ تازه برده می‌شود (همان شکلِ CARRY_RE ِ بخشِ مسئله؛ s23) */
  var CARRY_RE = /(?:^|\s)(?:هم|نیز)\s+(?:[^.؟?!\n]{0,30}\s)?(?:برابر|نسبت|متناسب)|به\s*همان\s*نسبت|همان\s*نسبت|همین\s*نسبت|متناسب\s*(?:با|است|ه)|(?:[0-9]+(?:[.٫][0-9]+)?|دو|سه|چند)\s*برابر\s*(?:می\s*شه|می\s*شود|میشه|بشه)?\s*[?؟]/;
  /* سطرِ «یک پرسش» — «هم‌گام با صفحه» فقط اگر همان رشتهٔ کارتِ صفحه است (s30، s33، s35: ادعای نادرستِ «همان که صفحه می‌پرسد») */
  /* سطری از بلوکِ زنده که «لحظه» است و بی شرط «بپرس» دارد (نه فهرست، نه «یک پرسش»، نه زمینه، نه «اگر …، … بپرس») */
  function liveMomentLine(ln) {
    if (!/^- /.test(ln) || /^- زمینه/.test(ln) || /^- در این نوبت فقط \*\*یک\*\* پرسش/.test(ln) || /^- پرسش‌های همین مرحله/.test(ln) || /^- داورِ این مسئله هنوز انتخاب نشده/.test(ln)) return false;
    var i = ln.search(/بپرس(?![آ-ی])/); if (i < 0) return false;
    var clause = ln.slice(0, i).split(/[.؛:]|—/).pop();
    return !/(?:^|[\s(،])اگر(?![آ-ی])/.test(clause);
  }
  function oneQLine(nq) {
    if (nq.midLine) return nq.midLine;   // دورِ ۱۰ (J1): «میانهٔ راه» ِ مربی همین نوبت پرسشِ نوبت است
    if (!nq.q) return "- همهٔ پرسش‌های این مرحله در صفحه یا گفت‌وگو پاسخ گرفته‌اند: دوباره نپرس — بپرس «الان از خودت چه می‌پرسی؟» یا او را به ثبتِ طرح ببر.";
    var same = !!nq.pageQ && nq.q === nq.pageQ;
    return "- در این نوبت فقط **یک** پرسش" + (same ? "، هم‌گام با صفحه (همان که صفحه همین حالا می‌پرسد" : " (برای وضعِ همین نوبت" + (nq.pageQ ? "؛ کارتِ صفحه پرسشِ دیگری نشان می‌دهد — این را بپرس، نه آن را" : "")) +
      "؛ پرسشی را که کاربر در صفحه یا همین گفت‌وگو پاسخ داده دوباره نپرس): «" + nq.q + "». اگر با وضعِ همین لحظه نمی‌خواند، پرسشِ دیگری از همان فهرست که هنوز پاسخ نگرفته.";
  }
  AS.liveNextQFor = nextQFor;
  /* مرحلهٔ مربی برای سشن (مسئلهٔ فقط‌درگفت‌وگو یا پس از بستنِ مسئله): نگه‌داشته در s.coach، با گفته‌های خودِ کاربر جلو می‌رود */
  var PLAN_RE = /طرح(?:م)?\s*(?:اینه|این است)|نقشه(?:م)?\s*(?:اینه|این است)|ایده(?:‌ام|م)\s*(?:اینه|این است)|می[‌\s]?خوام\s+(?:اول|از)\s|(?:اول(?:ش)?|نخست)\s+[^.؟?\n]{2,60}?(?:،|\s(?:می[‌\s]?کنم|بعد|بعدش|سپس))|راهش\s*(?:اینه|این است)|فکر\s*کنم\s*باید|از\s*(?:آخر|جواب|خواسته|هدف)\s*(?:به\s*عقب|شروع\s*(?:می[‌\s]?کنم|کردم))|با\s*(?:استقرا|برهانِ?\s*خلف|خلف)\s*(?:ثابت|پیش|می[‌\s]?رم)/;
  var NEWPROB_RE = /(?:تموم\s*شد(?:ه)?|پیداش\s*کردم|پیدا\s*شد)(?:[^.!؟?\n]*[.!…])?[.!،؛…\s]*(?:و\s*)?(?:حالا|بریم\s*سراغِ?|مسئله(?:ٔ|ی|‌ی)?\s*بعدی?)[\s:：،.]+(?!(?:بازنگری|وارسی|مرور|درسش)(?![آ-ی]))(.{8,})/;   // دورِ ۷ (H1، s12): «پیداش کردم، … . حالا Y»
  var NEWINTRO_RE = /(?:یه|یک)\s*(?:مسئله|مشکل|سؤال|سوال)(?:ٔ|ی|‌ی)?\s*(?:واقعی|تازه|جدید|دیگه|دیگر|کاری|عملی)?\s*(?:هم\s*)?(?:دارم|داریم)\s*[:：،.]\s*(.{8,})/;
  /* دورِ ۶ (G4، s11): «X رو حل کردم و یه مسئلهٔ تازه ساختم: Y» (حتی در سشنِ تازه) ⇒ Y از «فهم» با دفترِ خودش، و X بازنگری‌شده نام برده می‌شود */
  var MADEPROB_RE = /(?:حل\s*(?:ش\s*)?کردم|حلش\s*کردم|تموم\s*شد|ثابت(?:ش)?\s*کردم)[^.؟?!]{0,40}?(?:و\s*|،\s*)?(?:یه|یک)\s*مسئله(?:‌ی|ی|ٔ)?\s*(?:تازه|جدید|دیگه)(?:‌ای|ای)?\s*(?:ساختم|درست\s*کردم|طرح\s*کردم)[\s:：،]+(.{8,})/;
  /* کارِ خودش روی صورتِ چسبانده (G1، s08): «دارم امتحان می‌کنم: ۷+۷=۱۴…»، «هیچی جور نمیشه» */
  var WORK_RE = /امتحان\s*(?:می[‌\s]?)?(?:کنم|کردم|کردیم)|دارم\s*(?:امتحان|حساب|فکر|کلنجار)|حساب\s*کردم|جمع\s*(?:زدم|کردم)|سعی\s*کردم|تلاش\s*کردم|اعصابم|کلنجار|به\s*جایی\s*نمی[‌\s]?رسم/;
  function workIn(t) { return STUCK_RE.test(t) || WORK_RE.test(t) || formulas(t).length > 0; }
  /* رابطهٔ تازه با متغیر («r = y/3»، «V = πy³/27») = کارِ اجرا (G4، s18) */
  function varEq(t) { t = faDigits(String(t || "")); return /[a-zA-Z]\s*[=＝]/.test(t) && (formulas(t).length > 0 || /[a-zA-Z]\s*[=＝]\s*[^\s=]*[a-zA-Zπ⅓½¼²³√]/.test(t)); }   // دورِ ۷ (H1، s18): «V = ⅓πr²y» (بی رقمِ لاتین) هم رابطه است
  var BRUTE_RE = /یکی[‌\s]?یکی|تک[‌\s]?تک|همه(?:‌ی|ی|ٔ)?\s*حالت(?:‌ها|ها)?\s*(?:رو|را)?\s*امتحان|[0-9۰-۹]+\s*(?:تا\s*)?حالت\s*(?:رو|را)?\s*(?:یکی|امتحان)|همه(?:‌ی|ی|ٔ)?\s*[^\s.،؟?]{2,20}?(?:‌ها|ها)\s*(?:رو|را)?\s*(?:یکی[‌\s]?یکی\s*)?امتحان/;   // دورِ ۶ (G3، s21): «همه‌ی کیش‌ها رو امتحان می‌کنم»
  /* تورِ پولیا دورِ ۳ (B1/B6/B7/B10/B11): مرحله از حرفِ خودِ کاربر جلو می‌رود — فهم ⇐ طرح وقتی مجهول، داده و شرط را خودش گفته (در هر پیامِ همین مسئله)؛
     طرح ⇐ اجرا وقتی طرحی گفت؛ اجرا ⇐ بازنگری وقتی نتیجه‌ای گفت («رسیدم به…»، «جواب اینه»، «پس ثابت شد») یا درس/وارسیِ خودش را. «غلط بود» ِ تلاشِ
     کنارگذاشته یا حدسِ ردشده «حل نشد» نیست. در قابِ مربی (معلم/پدر/مادر) «خودم حلش کردم» یعنی خودِ او — یادگیرنده هنوز نه. سشنِ تازه دربارهٔ همان
     مسئلهٔ فقط‌درگفت‌وگو مرحله را از سشنِ پیشین می‌گیرد (همان صورت). */
  function teachMode(s, mt) {
    var C = s.coach = s.coach || {};
    /* E1: وقتی مدل گزارش می‌دهد (C.model)، الگو فقط پیامِ همین نوبت را می‌خواند — پیام‌های پیشین را گزارشِ سنجیدهٔ مدل تعیین کرده است */
    if (!C.teach && (TEACH_RE.test(String(mt || "")) || (!C.model && TEACH_RE.test(((s.msgs || []).filter(function (m) { return m.role === "user"; }).slice(-4).map(function (m) { return m.text; }).join(" ")))))) { C.teach = true; C.teachBy = "re"; C.teachKey = mkey(mt); }
    if (!C.teach) { try { var bl = AS.boundLive(s); if (bl && bl.r && bl.r.coach) return true; } catch (e) { } }
    return !!C.teach;
  }
  AS.coachTeach = teachMode;
  /* تورِ پولیا (RM6e، D·D3 s31): واژه‌های متمایز شمرده می‌شوند — تکرارِ یک واژه در متنِ کوتاه‌تر «همان صورت» را نمی‌سازد */
  function uniqT(L) { return L.filter(function (w, i) { return L.indexOf(w) === i; }); }
  function sameStmt(a, b) { var ta = uniqT(qToks(a)), tb = uniqT(qToks(b)); if (ta.length < 3 || tb.length < 3) return false; var n = ta.filter(function (w) { return tb.indexOf(w) >= 0; }).length; return n * 5 >= Math.min(ta.length, tb.length) * 3; }
  function inheritPhase(s, mt) {
    var best = null;
    S.all("achat", function (x) { return x && x.id !== s.id && x.coach && x.coach.ph && x.coach.stmt; }).forEach(function (x) {
      if (sameStmt(x.coach.stmt, mt) && (!best || String(x.coach.at || "") > String(best.coach.at || ""))) best = x; });
    return best;
  }
  /* پیامی که خودِ صورتِ مسئله است (نخستین پیامِ مسئله در سشن، یا رونوشتِ صورت) — «گفتنِ مجهول/داده/شرط» به حرفِ خودش نیست (E1) */
  function pastedOf(mt, stmt) { var a = nrmSt(mt), b0 = nrmSt(stmt); return !!(a && b0 && (a === b0 || (a.length >= 12 && b0.indexOf(a) >= 0) || (b0.length >= 12 && a.indexOf(b0) >= 0))); }
  function coachPhase(s, mt, b) {
    var C = s.coach = s.coach || {};
    /* مسئلهٔ زندهٔ باز ⇒ مرحله فقط از صفحه (A.liveCoach): «حل شد» ِ گفت‌وگو مرحله را عوض نمی‌کند (R5 — بستن فقط با «✅ حل شد» و بازنگریِ صفحه) */
    if (b && !b.done) { var co = null; try { co = A.liveCoach ? A.liveCoach(b.pid) : null; } catch (e) { } var p0 = co ? co.ph : b.ph, phL = p0 === "done" ? "b" : (PH_OF[p0] || "u");
      var pz = pastedOf(mt, b.r && b.r.p && b.r.p.statement); C.pk = "l:" + b.pid;
      C.prev = { key: mkey(mt), live: b.pid, ph0: phL, pasted: pz && !(solvedSaid(mt) && !unsolvedNow(mt, phL)), intro: pz, pk: C.pk }; return phL; }
    if (b && b.done && C.closedPid !== b.pid) { C.closedPid = b.pid; C.ph = ""; C.st = {}; C.stmt = ""; C.gen = (C.gen || 0) + 1; }   // مسئله بسته شد ⇒ حرفِ تازه از «فهم» (حدسِ تازه = مسئلهٔ تازه)
    /* دورِ ۵ (F1، s29): «X تموم شد. حالا Y…» ⇒ مسئلهٔ تازهٔ Y از «فهم»، با دفترِ پاسخِ خودش (F3) — نه بازنگریِ X */
    var nw = C.stmt || (b && b.done) ? NEWPROB_RE.exec(mt) : null, mk2 = nw ? null : MADEPROB_RE.exec(mt);   // دورِ ۷ (H1، s29): پس از بستنِ مسئلهٔ زنده هم
    if ((nw && !AS.notProblem(nw[1])) || mk2) { C.gen = (C.gen || 0) + 1; C.pk = "c:" + C.gen; C.ph = "u"; C.st = {}; C.stmt = clip((nw || mk2)[1], 400); C.inh = C.inh || "new";
      C.prev = { key: mkey(mt), ph0: "u", st0: {}, pasted: true, intro: !mk2, made: !!mk2, pk: C.pk }; return "u"; }
    /* دورِ ۱۱ (K9، s30 p2): «یه مسئلهٔ واقعی/تازه/دیگه دارم: Y» پس از پیامِ نخستِ دیگری (درخواستِ چک‌لیست، پرسشِ کلی…) معرفیِ مسئلهٔ تازه است —
       Y از «فهم» با دفترِ خودش و لحظهٔ «اول کل را ببین» (A191)؛ پیش‌تر پیامِ نخست صورتِ مسئله ثبت شده بود و این پیام «معرفی» شمرده نمی‌شد */
    var ni = C.stmt && !(b && !b.done) ? NEWINTRO_RE.exec(mt) : null;
    if (ni && !AS.notProblem(ni[1]) && !sameStmt(C.stmt, ni[1])) { C.gen = (C.gen || 0) + 1; C.pk = "c:" + C.gen; C.ph = "u"; C.st = {}; C.stmt = clip(ni[1], 400); C.inh = C.inh || "new";
      C.prev = { key: mkey(mt), ph0: "u", st0: {}, pasted: true, intro: true, pk: C.pk }; return "u"; }
    /* تورِ پولیا (RM6f، D·D4 s31 p13): پس از بستنِ مسئله در گفت‌وگو و بی مسئلهٔ بازی در کار، پیامِ کوتاهِ بعدی (پاسخِ بازنگری، «بعدی؟»، تشکر) مسئلهٔ تازه
       نیست — صورتِ مسئله از آن ساخته نمی‌شود و کارتِ مرحله‌ای («فهم»: «مجهول … چیست؟») پیشنهاد نمی‌شود (C.prev.noPh). مسئلهٔ تازه (صورتِ چندجمله‌ای، پرسش،
       حدس، یا «یه مسئلهٔ تازه دارم: …») همان راهِ پیشین است. */
    /* RN6a (D·4 s31): «بعدی؟»، «خب؟»، «ادامه؟» ِ پایانی پرسشِ مسئله نیست — نشانهٔ پرسشِ همان نوبتِ کوتاه پیش از سنجش کنار می‌رود */
    if (b && b.done && !C.stmt && !AS.notProblem(mt) && !guessNow(mt, teachMode(s, mt)) && !/[؟?]/.test(ownText(mt).replace(META_Q19, "")) && !longStmt(mt) && qToks(mt).length <= 8 && !/حدس|ادعا|فرضیه|فکر\s*(?:کنم|می[‌\s]?کنم)|به\s*نظرم|مسئله|معما/.test(mt)) {
      C.prev = { key: mkey(mt), ph0: "u", st0: {}, noPh: true, pk: C.pk }; return "u"; }
    if (!C.ph && !C.inh && !(b && b.done)) { var x0 = inheritPhase(s, mt); if (x0) { C.ph = x0.coach.ph; C.st = Object.assign({}, x0.coach.st || {}); C.cls = x0.coach.cls; C.inh = x0.id; } }
    var ph0 = C.ph || "", st0 = Object.assign({}, C.st || {}), teach = teachMode(s, mt);
    /* دورِ ۵ (F1، s31، s37): پیامِ نخستی که نتیجهٔ خودش را می‌گوید («حلش کردم! … ۵×۵=۲۵») صورتِ چسبانده نیست — said:result ِ آن می‌ماند */
    var intro = !C.stmt && !AS.notProblem(mt);
    /* تورِ پولیا (RM6c، B·D1 s11): «پس X = n» ِ الگو (RESULT_WEAK) به‌تنهایی مرحله را به بازنگری نمی‌برد — فرمول/عدد درونِ ادعا یا هنگامِ گفتنِ
       صورت نتیجه نیست؛ مرحله فقط با گزارشِ مدل (said:result) یا نتیجهٔ ثبت‌شده؛ الگو فقط پیشنهاد می‌کند (C.prev.weakRes ⇒ سطرِ زمینه) */
    var said = solvedSaid(mt, { intro: true }) && !OTHER18_RE.test(mt) && !guessNow(mt, teach) && !(teach && SELF_SOLVED_RE.test(mt)), uns = unsolvedNow(mt, ph0), stuck = STUCK_RE.test(mt) || NOTKNOW_RE.test(mt);
    var weakRes = !said && !intro && solvedSaid(mt, { stmt: C.stmt }) && !guessNow(mt, teach) && !uns && !/[؟?]/.test(ownText(mt)) && !CLAIM18_RE.test(mt);
    var pasted = (intro || pastedOf(mt, C.stmt)) && !(said && !uns);
    var ph = ph0, st = C.st = C.st || {}, sp = statedParts(mt, pasted);
    if (sp.u) st.u = 1; if (sp.d) st.d = 1; if (sp.c) st.c = 1;
    /* پرسشِ فهمی که پرسیده شد و جوابِ واقعی گرفت (دفتر یا پشتیبان) هم «گفته‌شده» است */
    var asked = askedInChat(s); phaseQs("u", C.cls || "any").forEach(function (q) { if (qParts(q).length && answeredQ(s, q, asked)) qParts(q).forEach(function (x) { st[x] = 1; }); });
    if (!C.stmt && !AS.notProblem(mt)) C.stmt = clip(mt, 400);
    if (said && !uns) ph = "b";
    else if (LOOK_RE.test(mt) && (ph === "c" || ph === "b" || ph === "p")) ph = "b";
    else if (uns && (ph === "b" || ph === "c")) ph = "c";
    else if (varEq(mt) && ph !== "b" && !intro) ph = "c";   // دورِ ۷ (H1، s18): رابطهٔ تازه با متغیرها همان‌دم اجراست — حتی اگر در ادامه «r رو نمی‌دونم» بگوید
    else if (stuck) { }   // گیر ⇒ همین مرحله (نه «طرح گفت» از «اول … شروع کردم، … گیر کردم»)
    else if ((EXEC_RE.test(mt) || varEq(mt)) && ph !== "b" && !intro) ph = "c";   // دورِ ۶ (G4، s18): رابطهٔ تازه با متغیرها کارِ اجراست
    /* دورِ ۵ (F1، s34، s37): «فکر کنم باید…» در گشایشی که دلسردی یا نیتِ زورِ خام است («انصراف بدم»، «۱۰۰ حالت رو یکی‌یکی امتحان کنم») طرح نیست؛
       دورِ ۶ (G3، s21): نیتِ زورِ خام («اول همه‌ی کیش‌ها رو امتحان می‌کنم») تا مجهول گفته نشده هرگز طرح نیست، گشایش باشد یا نه */
    else if (PLAN_RE.test(mt) && ph !== "b" && ph !== "c" && !((intro || !ph0) && (FAIL_ME.test(mt) || GIVEUP_RE.test(mt))) && !((intro || !ph0 || ph0 === "u") && BRUTE_RE.test(mt))) ph = ph === "p" || (st.u && st.d && st.c) ? "c" : "p";
    if (!ph || (ph === "u" && st.u && st.d && st.c)) ph = st.u && st.d && st.c ? "p" : "u";
    /* خواندنِ پشتیبانِ همین پیام؛ گزارشِ مدل (اگر آمد) جایش را می‌گیرد — از همین وضعِ پیش از پیام؛ ولی نتیجهٔ بی‌ابهامِ خودش (strong) را به عقب برنمی‌گرداند */
    C.pk = "c:" + (C.gen || 0);
    C.prev = { key: mkey(mt), ph0: ph0 || "u", st0: st0, pasted: pasted, intro: intro, work: pasted && workIn(mt), strong: said && !uns ? "b" : "", pk: C.pk, weakRes: weakRes || undefined };
    return ph;
  }
  AS.coachPhase = coachPhase;
  /* «میانهٔ راه» روی نردبانِ خودِ سامانه (۱/۳/۷/۲۱/۶۰): مسئلهٔ زندهٔ بازِ دیرپا ⇒ یک بار در هر پله «چه پیشرفتی کردی؟ دربارهٔ خودت چه آموختی؟» (rerunD s34) */
  function midCheck(s, b, mt) {
    if (!b || b.done || !b.r) return null;
    var LAD = (A.solveUI && A.solveUI.LADDER) || [1, 3, 7, 21, 60], born = String(b.r.created || (b.r.p && b.r.p.created) || "").slice(0, 10); if (!born || !A.daysBetween) return null;
    var age = A.daysBetween(born, A.today()), rung = LAD.filter(function (d) { return d >= LAD[2] && age >= d; }).pop(); if (!rung) return null;
    /* دورِ ۸ (I-coach 7): هم‌توان در ساختِ چندبارهٔ پرامپتِ همان نوبت (AS.prompt ⇒ userPrompt تا ۴ بار) — پیش‌تر ساختِ نخست پله را مصرف می‌کرد و
       پرامپتِ نهایی سطر را نداشت؛ حالا همان پیام همان سطر را می‌گیرد و پله فقط یک نوبت را می‌گیرد */
    var C = s.coach = s.coach || {}, M = C.mid = C.mid || {}, w = M[b.pid], k = mkey(mt || "");
    if (w && typeof w === "object") { if (w.r === rung && w.k !== k) return null; } else if (w === rung) return null;
    M[b.pid] = { r: rung, k: k };
    /* E8 (دورِ ۴، s19): با قاعدهٔ «فقط یک پرسش در نوبت» نمی‌جنگد — این نوبت همین **به‌جای** پرسشِ مرحله است */
    return { age: age, rung: rung };
  }
  /* رویدادِ مرحله برای «🧩 چهار مرحلهٔ حل» (R7): گیر یا «حل نشد» ِ خودِ کاربر در گفت‌وگو ⇒ ناموفق در همان مرحله (موفق فقط از خودداوریِ صریحِ او: tutor_mark) */
  /* تورِ پولیا (RM1a): موفقیتِ سنجیده هم رویداد است (ok = true، src «chatok»: پاسخِ پذیرفته‌شده، گذر از مرحله، «حل شد») — هر کدام یک رویداد، بی وزن؛
     کلیدِ موفقیت مرحله را هم دارد (یک پیام می‌تواند در دو مرحله شاهد باشد) */
  /* RN3c: «غلط بود/نه» ِ الگو درباره‌ی حدس یا آزمونِ خودش است وقتی همین پیام حدس دارد، پیش از آن واژه‌ای آزمایشی با «؟» آمد («رمهب‌ستان؟ نه. اشتباه بود»)،
     یا پیامِ پیشینش حدسِ سنجیده بود — حدسِ ردشده داده است، نه شکستِ مرحله */
  function guessRefPat(s, mt) {
    var t = String(mt || ""), i = lastAt(UNSOLVED_RE, t); if (guessNow(t, false)) return true;
    if (i > 0 && /[؟?]/.test(t.slice(0, i))) return true;
    var C = (s && s.coach) || {}, pu = prevUserMsg(s); return !!(C.guess && pu && C.guess.key === mkey(pu.text));
  }
  var META_Q19 =/(?:^|[\s.،!؛…])(?:بعدی|بعدیش|خب|خوب|ادامه|ادامه\s*بدیم|دیگه|بعدش|و\s*بعد|حالا\s*چی|حالا)\s*[؟?]+[\s!.…]*$/;
  function coachEv(s, ph, src, mt, ok, x) {
    var E = s.coachEv = s.coachEv || [], key = src + (ok ? "|" + ph : "") + "|" + clip(mt, 80); if (E.some(function (e) { return e.key === key; })) return;
    /* تورِ پولیا (INF15/INF17، دورِ ۱۹b): هر رویداد شناسهٔ پیامِ منبعش (msg) و مسئله‌اش (pid) را دارد — تا اصلاحِ آن پیام رویدادهایش را پس بگیرد و «از کجا؟» ِ کارنامه منبع را نشان دهد */
    var um19b = evSrc19b(s, mt), pid19b = evPid19b(s);
    E.push(Object.assign({ at: nowIso(), ph: ph, ok: !!ok, src: src, key: key, msg: um19b ? msgId19b(um19b) : undefined, pid: pid19b || undefined }, x || {})); if (E.length > 200) s.coachEv = E.slice(-200);
  }
  AS.coachEvent = coachEv;
  var RULES_HEAD = /^# مسئلهٔ واقعیِ حل‌نشده/;
  AS.promptFilters = AS.promptFilters || [];
  AS.promptFilters.push(function (outs, s, msg) {
    var out = outs.slice(), mt = String(msg || "").trim(), auto = /^\[سامانه/.test(mt);
    var recent = [mt].concat(((s && s.msgs) || []).filter(function (m) { return m.role === "user"; }).slice(-4).map(function (m) { return m.text; })).join(" ");
    var b = AS.boundLive(s), bOpen = b && !b.done ? b : null;
    // ۱) «🌱» بی نشانهٔ واقعی ⇒ بیرون
    if (!AS.willSignal(s, msg)) out = out.filter(function (x) { return !/^# پس از شکست، نقد یا میلِ رها کردن/.test(x); });
    // ۲) قابِ «🔭»: سشنِ بسته به مسئلهٔ باز ⇒ قاعدهٔ «live_new» دوباره نمی‌آید (rerunB S2.1/rerunC: فرمِ ساختن دوباره و تکراری)؛ فقط یک سطر
    if (bOpen) { var had = out.some(function (x) { return RULES_HEAD.test(x); }); out = out.filter(function (x) { return !RULES_HEAD.test(x); });
      if (had && !auto) out.push("# مسئلهٔ واقعیِ تازه (فقط اگر صریحاً مسئلهٔ دیگری آورد)\n- این سشن به «" + clip(bOpen.r.p.title, 60) + "» بسته است: live_new فقط اگر کاربر صریحاً مسئلهٔ **دیگری** آورد و می‌خواهد جدا حلش کند؛ وگرنه همین مسئله را ادامه بده (دوباره نساز)."); }
    else if (!out.some(function (x) { return RULES_HEAD.test(x); }) && (LIVE_RE2.test(recent) || LIVE_ASK.test(recent) || LIVE_STUCK.test(faDigits(recent))) && !auto) out.push(LIVE_FALLBACK);
    // ۳) «مسئلهٔ زندهٔ این سشن»: قابِ نوع‌دار، پرسشِ هم‌گام (بی پرسشِ پاسخ‌گرفته در صفحه **و** گفت‌وگو)، بی ضرب‌المثلِ تکراری؛ و اگر قلابِ بخشِ مسئله نیامد، بلوکِ فشرده
    var i = -1; out.forEach(function (x, j) { if (i < 0 && /^# مسئلهٔ زندهٔ این سشن \(/.test(x)) i = j; });
    var lc = liveCtx(s, msg), pid = i >= 0 ? ((/^# مسئلهٔ زندهٔ این سشن \(([^)]+)\)/.exec(out[i]) || [])[1]) : lc && lc.pid;
    if (pid && s) { var Ck = s.coach = s.coach || {}; Ck.pk = "l:" + pid; }   // F3: دفترِ همین مسئله
    var nq = pid && A.liveRec && A.liveRec(pid) ? nextQFor(s, pid, auto ? "" : mt, auto) : null, liveBlock = false;
    var stuckNow = !auto && (STUCK_RE.test(mt) || NOTKNOW_RE.test(mt)), dataOk = pid ? dataLineOk(pid) : false;
    /* F2: گیرِ این نوبت = گیرِ همین پیام یا گیرِ گزارش‌شده و سنجیدهٔ پیامِ پیشین (یک نوبت) */
    /* G1 (دورِ ۶): بی مسئلهٔ زنده، نشانهٔ پیامِ پیشین فقط برای همان مسئلهٔ گفت‌وگو (pk ِ این پیام، پس از coachPhase) */
    var sigOf = function () { if (nq && nq.turn) return nq.turn; var C1 = (s && s.coach) || {}, P1 = C1.prev && C1.prev.key === mkey(mt) ? C1.prev : null;
      return turnSig(auto ? null : carried(s, mt, C1.pk || ""), auto ? "" : mt, auto, !!s && !auto && teachMode(s, mt), { intro: !!(P1 && P1.intro), stmt: C1.stmt }); };
    var refNew = pid && !auto ? refFresh(s, pid, mt) : false;
    /* دورِ ۱۰ (J1): «میانهٔ راه» ِ مربی با مسئلهٔ زنده خودِ پرسشِ نوبت است ⇒ همان در سطرِ «یک پرسش» ِ بلوکِ زنده می‌نشیند (پرسشِ مرحله برای نوبتِ بعد) و سطرِ مربی
       فقط زمینه — نه دو سطرِ پرسش‌دار در دو بلوک. شرط‌ها همان پیشین‌اند (کارت/رد/کارِ همین نوبت ِ صفحه، مسئلهٔ گذشته از «باز»، نگه‌داشتِ کارتِ صفحه ⇒ نه). */
    var hasCoach = out.some(function (x) { return /^# مربیِ حل/.test(x) || /\n# مربیِ حل/.test(x); }), coachMade = false;
    var cpid = pid && A.liveRec && A.liveRec(pid) && nq ? pid : bOpen ? bOpen.pid : "";
    var cardQ = !!(nq && nq.q && nq.coach && /^(?:card|fail|turn)-/.test(String(nq.coach.src || "")));
    /* دورِ ۹ (s06 p5): «میانهٔ راه» فقط برای مسئلهٔ باز — در «review/closing/incomplete» (پس از «✅ حل شد») پرسشِ نوبت پرسشِ بازنگری/وارسی ِ صفحه است، نه «به‌جای» آن */
    if (!cardQ && cpid && A.liveClosure) { try { var stC = (A.liveClosure(cpid) || {}).state; if (stC && stC !== "open") cardQ = true; } catch (e) { } }
    /* … و وقتی کارتِ «میانهٔ راه» ِ خودِ صفحه همین موعد را یک نوبت پرسیده (L.ckHold ِ a38) — همان پرسش دو نوبتِ پیاپی نه */
    if (!cardQ && cpid) { try { var ckH = ((((S.get("eprog_" + cpid) || {}).solve || {}).live) || {}).ckHold; if (ckH && ckH.due && String(ckH.due) <= A.today()) cardQ = true; } catch (e) { } }
    /* … و نه وقتی همین نوبت کارِ خودش را دارد (گیر، شکست، نتیجه، حدس): پاسخ به حرکتِ همین پیام مقدم است؛ «میانهٔ راه» مصرف نمی‌شود و نوبتِ بعد می‌آید */
    var tnow = (nq && nq.turn) || {}, busyTurn = !!(tnow.stuck || tnow.fail || tnow.result || tnow.guess || tnow.abandon || tnow.related || (nq && nq.stuckData));
    var midI = !hasCoach && cpid && !auto && !cardQ && !busyTurn && !AS.notProblem(mt) ? midCheck(s, { pid: cpid, r: A.liveRec(cpid), done: false }, mt) : null;
    var MID_Q = "تا این‌جا چه پیشرفتی کردی و دربارهٔ خودت چه آموختی؟", midHead = midI ? "میانهٔ راه (این مسئله " + fa(midI.age) + " روز است باز است؛ پلهٔ " + fa(midI.rung) + " ِ نردبانِ مرور)" : "";
    if (midI && nq) nq = Object.assign({}, nq, { midLine: "- در این نوبت فقط **یک** پرسش (" + midHead + "، **به‌جای** پرسشِ مرحله — کوتاه و بی حکم؛ پرسشِ مرحله برای نوبتِ بعد؛ پرسشی را که کاربر در صفحه یا همین گفت‌وگو پاسخ داده دوباره نپرس): «" + MID_Q + "». اگر با وضعِ همین لحظه نمی‌خواند، پرسشِ مرحله را بپرس." });
    var midL = !midI ? "" : nq ? "- زمینه (نه پرسشِ دوم): " + midHead + " — پرسشِ این نوبت در «مسئلهٔ زندهٔ این سشن» همین است، بی حکم."
      : "- **پرسشِ این نوبت همین است:** " + midHead + " — **به‌جای** پرسشِ مرحله (همچنان فقط یک پرسش)، کوتاه بپرس «" + MID_Q + "» — بی حکم؛ پرسشِ مرحله برای نوبتِ بعد.";
    if (i >= 0 && pid) {
      var kind = liveKind(pid), asked0 = [];
      out[i] = out[i].split("\n").filter(function (ln) { return !/^- حکمتِ ضرب‌المثل‌ها برای همین مرحله/.test(ln) && !(/^- (?:زمینه \(نه پرسشِ دوم\): )?داده‌هایی که هنوز در کارِ حل نیامده‌اند/.test(ln) && !dataOk); }).map(function (ln) {
        if (/^- پاسخِ این مسئله را هیچ‌کس نمی‌داند/.test(ln) || /^- این مسئله پاسخِ عینی دارد/.test(ln)) return AS.liveFrame(kind) || ln;   // یک متنِ واحد برای قابِ نوع‌دار (ادغامِ تورِ ۱)
        /* یک پرسش در نوبت: همان A.liveCoach(pid).q (پرسشِ پاسخ‌گرفته در گفت‌وگو هم کنار) — سطرِ a38 جایگزین می‌شود، دو سطر نمی‌شود */
        if (nq && /^- در این نوبت فقط \*\*یک\*\* پرسش/.test(ln)) return oneQLine(nq);
        /* دورِ ۸ (I-coach 2، s22): سطرِ ردِ a38 کنارِ پرسشِ نوبتِ دیگر زمینه است — «از ردش چه آموخت» پس از آن، نه پرسشِ دوم */
        if (nq && nq.q && /^- (?:زمینه \(نه پرسشِ دوم\): )?حدسی که خودش با آزمون رد کرد/.test(ln) && !/^- زمینه/.test(ln) && /بپرس از ردش چه آموخت/.test(ln)) return "- زمینه (نه پرسشِ دوم): " + ln.slice(2).replace(/بپرس از ردش چه آموخت و کدام فرضِ پنهان شکست\.?/, "«از ردش چه آموخت و کدام فرضِ پنهان شکست؟» برای پس از پرسشِ این نوبت است، اگر خودش به آن نرسید.");
        /* دورِ ۱۰ (J1): کنارِ پرسشِ نوبتِ بلوکِ زنده، هر سطرِ «لحظه»ی دیگرِ a38 که بی شرط «بپرس…» دارد (ضرب‌المثلِ خودش، پرسش‌های مکانیکی، شرطِ متناقض،
           قابِ مسئلهٔ عملی) زمینه است — سطرهای شرطی («اگر … بپرس») و فهرست دست نمی‌خورند */
        if (nq && nq.q && liveMomentLine(ln)) return "- زمینه (نه پرسشِ دوم): " + ln.slice(2).replace(/بپرس(?![آ-ی])/g, "در نظر داشته باش") + " (" + "پرسشِ این نوبت همان «یک پرسش» ِ بالاست)";
        /* همان فهرستِ a38، با نشانِ «پاسخ‌گرفته در گفت‌وگو» (فهرستِ دوم در مربی نمی‌آید) */
        if (/^- (?:زمینه \(نه پرسشِ دوم\): )?داده‌هایی که هنوز در کارِ حل نیامده‌اند/.test(ln)) return ln.replace(/\(اگر به کار آمد، یکی را با نامش بپرس: «از … استفاده کردی؟»؛/, "(زمینه، نه پرسشِ دوم: گیر که شد، اول پرسشِ کلیِ «همهٔ داده‌ها را به کار بردی؟» و فقط اگر باز نیافت نامِ یکی («از … استفاده کردی؟») — آن هم فقط وقتی همین پرسشِ نوبت است؛");
        /* E3/E8 (دورِ ۴، s11، s25): فهرست بریده نمی‌شود (پرسشِ پیشنهادیِ هشتم هم دیده شود) و پرسش‌ها کامل‌اند (پرسشِ استقرا نیمه نماند)؛ E1: با شناسه */
        if (nq && nq.list && nq.list.length > 1 && /^- پرسش‌های همین مرحله/.test(ln)) return "- پرسش‌های همین مرحله (برای همین نوعِ مسئله): " + liveList(s, nq, asked0);
        return ln;
      }).join("\n");
      var extra = liveExtra(pid, out[i], dataOk, refNew, nq && nq.q); if (extra) out[i] = out[i] + "\n" + extra;
      liveBlock = !!nq;
    } else if (pid && lc) { out.push(compactLive(s, pid, nq, dataOk, refNew)); liveBlock = !!nq; }
    /* B4: مسئلهٔ حل‌شدهٔ مرتبط (بستهٔ همین سشن، یا در سشنِ تازه با دو واژهٔ معنادارِ مشترک) ⇒ نتیجه، روش و بازنگریِ خودش — نه فقط عنوان */
    /* دورِ ۱۱ (K1): مرورِ بی‌نگاه و ادامهٔ مسئلهٔ بازِ تنها لحظه‌های تابعِ اولویتِ مربی‌اند (recall/open، زیرِ کارِ خودِ همین پیام)؛ بلوک‌هایشان پس از
       داوریِ مربی ساخته می‌شوند — سطرشان زمینه است، مگر بلوکِ مربی نباشد (آن‌گاه خودشان پرسشِ نوبت‌اند). مرورِ بی‌نگاه یک بار در سشن و نه وقتی پیامش
       خودش مجهول/راهِ پیشین را گفت («مثل دیروز…»، «مجهولم … بود»)؛ پیشنهادِ ادامه نه وقتی حرفش آشکارا دربارهٔ همان مسئله است (آن‌گاه پرسشِ مرحلهٔ صفحه‌اش) */
    var recO = null, openO = null, lesO = null, blockAt = out.length;
    if (!pid && !auto) { var dp = b && b.done ? b.pid : relatedDone(s, recent); if (dp) { var blind0 = !(b && b.done), rp = A.liveRec(dp); recO = { pid: dp, title: (rp && rp.p && rp.p.title) || "", blind: blind0, fire: blind0 && recallFresh(s, dp, mt) }; } }
    if (recO && !recO.blind && !auto && (STUCK_RE.test(mt) || NOTKNOW_RE.test(mt)) && !NEWINTRO_RE.test(mt) && aboutDone(recO.pid, mt)) { var ls0 = lessonOf(recO.pid); if (ls0) lesO = { title: recO.title, q: LESSON_Q(ls0) }; }
    /* دورِ ۵ (F3، s24، s28): فرزندِ بسته به سشن ⇒ پدرِ بسته‌شده‌اش (حتی در همین سشن) همان «مسئلهٔ حل‌شدهٔ مرتبط» است — نتیجه، روش و بازنگریِ خودش */
    if (pid && !auto) { try { var rr = A.liveRec(pid), og = rr && rr.origin; if (og && og.type === "lprob" && og.id !== pid && A.liveRec(og.id) && A.livePhase(og.id) === "done" && !out.some(function (x) { return x.indexOf("# مسئلهٔ حل‌شدهٔ مرتبط (" + og.id + ")") >= 0; })) { var sb2 = solvedBlock(og.id, false); if (sb2) out.push(sb2); } } catch (e) { } }
    /* دورِ ۵ (F3، s34): سشنِ تازهٔ نابسته و دقیقاً یک مسئلهٔ زندهٔ باز ⇒ یک سطرِ پیشنهاد در نخستین نوبت — هرگز پیوندِ خودکار (کاربر خودش برمی‌گزیند) */
    if (!pid && !b && !auto && userTries(s) <= 1 && A.liveAll && A.livePhase) { try { var td = A.today(), opn = A.liveAll().filter(function (r) { return r && r.p && A.livePhase(r.p.id) !== "done" && !(r.dormant && String(r.dormant) > td); });
      if (opn.length === 1) { var r1 = opn[0]; openO = { pid: r1.p.id, title: r1.p.title, on: onOpen(r1, recent) };
        if (openO.on) { var nqO = null; try { nqO = AS.liveNextQ(r1.p.id); } catch (e) { } openO.q = (nqO && nqO.q) || ""; openO.ph = (nqO && nqO.ph) || ""; } } } catch (e) { } }
    // ۴) مربی: در **هر** نوبتِ کاربر که «نه-مسئله» نیست (فهرستِ منفی)، با مرحله و پرسش‌های نوع‌دار؛ معلمِ مسئلهٔ حل‌شده اگر خودش مربی را آورده، دوباره نه.
    //    مسئلهٔ زندهٔ باز ⇒ مرحله، رده و فهرست از A.liveCoach/A.liveKindInfo ِ بخشِ مسئله و پرسشِ نوبت فقط در بلوکِ زنده (o.live) — یک منبعِ پرسش
    if (!hasCoach && (auto ? !!cpid : !AS.notProblem(mt))) {
      var bb = cpid ? { pid: cpid, r: A.liveRec(cpid), ph: A.livePhase ? A.livePhase(cpid) : "u", done: false } : b;
      var ph = auto ? (PH_OF[bb.ph] || "u") : coachPhase(s, mt, bb), cls = cpid ? liveClass(cpid) : natClass(s, recent) || qClass("", recent);
      /* دورِ ۱۲ (هماهنگی با «live»): بیرون از صفحه، حرفش آشکارا دربارهٔ همان مسئلهٔ بازِ تنها (openOn) ⇒ مرحله و فهرستِ مربی همان مرحلهٔ صفحهٔ آن مسئله‌اند
         (نه «فهم» ِ گفت‌وگو کنارِ پرسشِ «طرح» ِ صفحه) */
      if (!cpid && !auto && openO && openO.on && openO.q && PH_OF[openO.ph]) { ph = PH_OF[openO.ph]; var oc = liveClass(openO.pid); if (oc) cls = oc; }
      /* F4 (دورِ ۵): نوعِ مسئله (find/prove/pod) برای سرواژه — زنده از رکورد، فقط‌درگفت‌وگو از حدسِ همان بخشِ مسئله (A.liveTypeGuess) */
      var ptype = ""; try { ptype = cpid ? ((A.liveKindInfo(cpid) || {}).type || "") : cls === "prove" && A.liveTypeGuess ? (A.liveTypeGuess(recent) || "prove") : ""; } catch (e) { }
      var Pv = s.coach && s.coach.prev && s.coach.prev.key === mkey(mt) ? s.coach.prev : null;
      var qs = cpid && nq && nq.list && nq.list.length ? nq.list : phaseQs(ph, cls, cpid);
      if (!cpid && !auto) { var C = s.coach = s.coach || {}; C.ph = ph; C.cls = cls; C.at = nowIso(); }
      /* R7/B7: رویدادِ «ناموفق» فقط گیرِ خودِ حل یا «حل نشد» ِ واقعی — نه خشم/شرم، نه حدسِ ردشده، نه تلاشِ کنارگذاشته‌ای که به جواب رسید */
      /* تورِ پولیا (RN3c، B·D3 s12): «حل نشد/اشتباه بود» ِ الگو (بی گزارشِ مدل) به مرحله‌ای ثبت نمی‌شود — فقط «در انتظار» (pend) تا گزارشِ وضعِ همین نوبت
         جایش را بگیرد؛ حدسِ ردشده در نوبتِ بی گزارش هرگز شکستِ مرحله نیست (نامتقارن). گیرِ صریحِ خودش («گیر کردم») همان رویدادِ پیشین است. */
      if (!auto && !CORR19b.test(ownText(mt)) && ((STUCK_RE.test(mt) && !solvedSaid(mt)) || unsolvedNow(mt, ph))) coachEv(s, ph, "chat", mt, false, STUCK_RE.test(mt) && !solvedSaid(mt) ? undefined : (guessRefPat(s, mt) || actErrOnly19b(mt)) ? { pend: true } : undefined);
      var sig = sigOf(), claim = cpid && !auto && solvedSaid(mt, { stmt: bb.r && bb.r.p && bb.r.p.statement }) && !unsolvedNow(mt, ph) && !sig.guess ? ((nq && nq.coach && nq.coach.closure && nq.coach.closure.label) || true) : "";
      /* G4 (دورِ ۶، s18): مسئلهٔ فقط‌درگفت‌وگو در میانهٔ کار (رابطهٔ تازه با متغیرها) ⇒ پرسشِ هدف — همتای «🎯 هدف را گم نکن» ِ صفحه؛ مجهول به حرفِ خودش، وگرنه بندِ پرسشیِ صورت */
      var Cg = s.coach || {}, goal = !cpid && !auto && ph === "c" && varEq(mt) && !solvedSaid(mt) ? clip((Cg.unkBy && Cg.unkBy[Cg.pk]) || (String(Cg.stmt || "").match(/[^.!؟?\n]*[؟?]/g) || []).pop() || "", 110).trim() : "";
      /* G3 (دورِ ۶): A191 یک بار برای هر مسئله و فقط در لحظهٔ معرفی */
      /* R8 (I-live 4، s18): گیر با دادهٔ به‌کارنرفته ⇒ پرسشِ داده‌ها (a38) پرسشِ نوبت است و سطرِ 🎯 زمینه */
      var gStk = goal && (sig.stuck || stuckNow) && A.liveChatStuckQ ? A.liveChatStuckQ(Cg.stmt, (s.msgs || []).filter(function (m) { return m && m.role === "user"; }).map(function (m) { return m.text; }).concat([mt]), ((s.msgs || []).filter(function (m) { return m && m.role === "ai"; }).pop() || {}).text) : "";
      var a191 = !auto && !!(Pv && Pv.intro) && wholeMoment(mt) && longStmt(mt) && !(teachMode(s, mt) && !TEACH_PROB_RE.test(mt)) && (function () { var W0 = Cg.whole = Cg.whole || {}, k = Cg.pk || "c:0", mk0 = mkey(mt); if (W0[k] && W0[k] !== mk0) return false; W0[k] = mk0; return true; })();   // هم‌توان در ساختِ چندبارهٔ همان نوبت
      var coO = { ph: ph, qs: qs, qsDef: !(cpid && nq && nq.list && nq.list.length), cls: cls, ptype: ptype, s: s, pid: cpid, mt: mt, dry: auto, stuck: sig.stuck, live: !!cpid && liveBlock, kindUnset: !!cpid && kindUnset(cpid), claim: claim, teach: teachMode(s, auto ? "" : mt),
        sug: cpid && nq ? (nq.midLine ? MID_Q : nq.q) : midI ? MID_Q : !auto && sig.guess ? GUESS_Q : gStk ? gStk : goal ? "🎯 مجهول هنوز «" + goal + "» است — این گام به آن نزدیک‌ترت کرد؟" : "", tries: cpid ? userTries(s, bb.r.created || "") : userTries(s), seed: userTries(s),
        closed: !cpid && b && b.done ? b.r.p.title : "", mid: midL, intro: a191, isIntro: !!(Pv && Pv.intro), refuted: !!refNew, refGen: !!refNew && refGeneral(pid), guess: !auto && sig.guess, goal: goal, goalCtx: !!gStk, made: !auto && !!(Pv && Pv.made),
        phShow: cpid && nq && nq.coach && nq.coach.src === "turn-result" && ph !== "b" ? "b" : "", recall: recO && recO.fire ? recO : null, openProb: openO, lesson: lesO, lbRest: !auto && !cpid ? lbRestOf(s, mt) : null };
      out.push(coachLines(coO)); coachMade = true;
      /* دورِ ۱۱ (K8، s04، s05، s07): حوزه‌های قلمروِ لحظه‌های همین نوبت با پیوندِ صریح (نه هم‌واژگی) — بلوکِ «دانسته‌های قلمرو» با همان سازندهٔ a28 */
      var exA = !auto ? itemAreas(coO.items) : [];
      if (exA.length && A.SYST && A.SYST.knowledge) { try { var kb = A.SYST.knowledge(s, msg, exA), kI = -1; out.forEach(function (x, j) { if (kI < 0 && /^# دانسته‌های قلمرو/.test(x)) kI = j; });
        if (kb) { if (kI >= 0) out[kI] = kb; else out.push(kb); } } catch (e) { } }
    }
    if (recO || openO) {
      var add0 = [];
      if (recO) { var sb = solvedBlock(recO.pid, recO.fire ? (coachMade ? true : "turn") : false); if (sb) add0.push(sb); }
      if (openO) { var goO = "{\"do\":\"go\",\"view\":\"lprob\",\"arg\":\"" + openO.pid + "\"}", tail = " این سشن خودبه‌خود به آن بسته نمی‌شود؛ اگر حرفش چیزِ دیگری است، همان را دنبال کن.";
        add0.push("# مسئلهٔ بازِ تو (پیشنهاد، نه پیوند)\n" + (!coachMade && (!openO.on || openO.q)
          ? "- **پرسشِ این نوبت همین است:** «" + (openO.on ? openO.q : OPEN_Q(openO.title)) + "» — فقط یک بار و کوتاه؛ اگر گفت آری یا حرفش دربارهٔ همان است، او را با " + goO + " به صفحه‌اش ببر." + tail
          : "- زمینه (نه پرسشِ دوم): مسئلهٔ بازِ تو «" + clip(openO.title, 80) + "» — " + (openO.on ? "حرفش دربارهٔ همین مسئله است؛ پرسشِ این نوبت (در «مربیِ حل») از مرحلهٔ صفحه‌اش آمده. برای ثبت در صفحه، او را با " + goO + " به صفحه‌اش ببر."
            : "پیشنهادِ ادامه‌اش لحظه‌ای در «مربیِ حل» است (اگر پرسشِ این نوبت همان شد، یک بار و کوتاه)؛ اگر گفت آری، او را با " + goO + " به صفحه‌اش ببر.") + tail)); }
      out.splice.apply(out, [blockAt, 0].concat(add0));
    }
    /* پیگیریِ دورِ ۶ (یک پرسش در هر بلوک، s04، s06، s21): وقتی بلوکِ زنده پرسشِ نوبت را می‌دهد، «🌱 # پس از شکست» زمینه است — «بپرس…» ِ آن پرسشِ رقیب نمی‌شود */
    /* دورِ ۱۰ (J1): همین برای هر نوبتی که بلوکِ مربی پرسشِ نوبت را می‌دهد (بی مسئلهٔ زنده هم) — 🌱 زمینه است، نه پرسشِ دوم */
    var tqLive = !!(liveBlock && nq && nq.q), tqCoach = out.some(function (x) { return /^# مربیِ حل/.test(x) || /\n# مربیِ حل/.test(x); });
    if (tqLive || tqCoach) out = out.map(function (x) { return /^# پس از شکست، نقد یا میلِ رها کردن/.test(x) ? x.replace(/^([^\n]*)/, "$1\n- (زمینه، نه پرسشِ دوم: " + (tqLive ? "پرسشِ این نوبت همان یکیِ «مسئلهٔ زندهٔ این سشن» است" : "پرسشِ این نوبت همان یکیِ «مربیِ حل» است") + "؛ این‌ها را در نظر داشته باش، جدا نپرس.)").replace(/بپرس(?![آ-ی])/g, "در نظر داشته باش") : x; });
    return out;
  });

  /* ---------- مسئله‌ای که در گفت‌وگو حل یا ساخته شد ⇒ همان تونلِ «🔭» (تورِ پولیا s18/s31؛ دورِ ۲: به‌روزرسانی نه تکرار، تأیید در گفت‌وگو) ---------- */
  /* سشن ⇄ مسئله: هرگز سشنی را که به مسئلهٔ بازِ دیگری بسته است بی‌صدا جابه‌جا نکن (rerunC: «ساختنِ مسئلهٔ دوم پیوندِ سشنِ قبلی را عوض کرد») */
  /* ادغامِ G1/G2: پیوند فقط با A.liveBindSession ِ بخشِ مسئله (یک منطق: سشنی که مسئلهٔ بازِ دیگری دارد بی force جابه‌جا نمی‌شود)؛ برگشتِ false محترم است */
  function sessLink(s, pid, force) {
    if (!s || !pid || typeof A.liveBindSession !== "function") return false;
    try { return !!A.liveBindSession(pid, s, { force: !!force }); } catch (e) { return false; }
  }
  AS.sessLink = sessLink;
  function nrmSt(t) { return String(t || "").replace(/[ً-ٰٟ‌\s«»"'.,،:؛!?؟()\-]+/g, ""); }
  /* E7 (دورِ ۴، s31): «دادهٔ عوض‌شده مسئلهٔ تازه است» (پولیا) — عددِ داده (نه عددِ درونِ فرمول مثلِ «۱/(1·2·3)») که در هر دو سو عددی دارد که دیگری ندارد */
  var FORM_ADJ = /[()\/·*^+\-−=×÷<>≤≥a-zA-Z]/;
  function dataNums(t) { t = faDigits(String(t || "")).replace(/٫/g, "."); var out = [], re = /\d+(?:\.\d+)?/g, m; while ((m = re.exec(t))) { var b0 = t.charAt(m.index - 1), a0 = t.charAt(m.index + m[0].length); if ((b0 && FORM_ADJ.test(b0)) || (a0 && FORM_ADJ.test(a0))) continue; out.push(m[0]); } return out; }
  function numConflict(a, b) { var A0 = dataNums(a), B0 = dataNums(b); return A0.some(function (x) { return B0.indexOf(x) < 0; }) && B0.some(function (x) { return A0.indexOf(x) < 0; }); }
  AS.numConflict = numConflict;
  function sameProblem(r, st, ti) {
    if (!r || !r.p) return false; if (numConflict(st, r.p.statement)) return false;
    var a = nrmSt(st), b0 = nrmSt(r.p.statement);
    if (a && b0 && (a === b0 || (a.length >= 12 && b0.indexOf(a) >= 0) || (b0.length >= 12 && a.indexOf(b0) >= 0))) return true;
    var ta = qToks(st), tb = qToks(r.p.statement); if (ta.length >= 3 && tb.length >= 3) { var n = ta.filter(function (w) { return tb.indexOf(w) >= 0; }).length; if (n * 5 >= Math.max(ta.length, tb.length) * 4) return true; }
    return !!ti && nrmSt(ti) === nrmSt(r.p.title) && nrmSt(ti).length >= 6;
  }
  /* درسی که «به قلمِ خودِ کاربر» است؟ در یکی از پیام‌های خودش (نیم‌فاصله/نشانه‌گذاری نادیده) یا سه‌پنجمِ واژه‌هایش — وگرنه بازنگریِ دستیار، نه موفقیتِ او (R7) */
  function userWrote(s, t) {
    var n = nrmSt(t), tk = qToks(t); if (!n) return false;
    return ((s && s.msgs) || []).some(function (m) { if (!m || m.role !== "user") return false; var u = nrmSt(m.text); if (n.length >= 8 && u.indexOf(n) >= 0) return true; var ut = qToks(m.text); return tk.length >= 3 && tk.filter(function (w) { return ut.indexOf(w) >= 0; }).length * 5 >= tk.length * 3; });
  }
  AS.userWrote = userWrote;
  AS.DO.chat_solved = function (a) {
    var s = AS._turnSession; if (!A.liveCreate) return "این نسخه «🔭 مسئلهٔ حل‌نشدهٔ خودم» را ندارد";
    var st = clip(a && a.statement, 1500), ti = clip((a && a.title) || st, 80);
    // همان مسئله دوباره ساخته نمی‌شود (rerunD): مسئلهٔ بستهٔ همین سشن یا هر مسئلهٔ زنده با همان صورت ⇒ به‌روزرسانی
    var bl0 = AS.boundLive(s), bnd = bl0 && bl0.r, r = null;
    if (bnd && (!st || sameProblem(bnd, st, ti))) r = bnd;
    if (!r && st && A.liveAll) r = A.liveAll().filter(function (x) { return sameProblem(x, st, ti); }).pop() || null;
    if (!r && st.length < 10) return "ثبت نشد: «statement» (صورتِ مسئله به حرفِ خودِ کاربر) لازم است";
    var made = !r;
    if (made) { r = A.liveCreate(ti, st, a && a.kind, { by: "assistant", sess: (s && s.id) || "", origin: { type: "chat", id: (s && s.id) || "" }, nat: a && a.nat, natBy: "assistant" }); }
    var pid = r.p.id, pg = S.get("eprog_" + pid), so = pg.solve = pg.solve || {}, L = so.live = so.live || {}, at = nowIso();
    so.u = so.u || {}; if (!(so.u[1] && so.u[1].done)) so.u[1] = { done: true, from: "chat", at: at, one: st || r.p.statement, u: clip(a.unknown || "", 300), dl: [], c: "", type: so.type || r.p.kind };
    var was = L.state; L.state = "solved"; L.stateAt = L.stateAt && was === "solved" ? L.stateAt : at; L.stateD = L.stateD && was === "solved" ? L.stateD : A.today(); L.chat = { sess: (s && s.id) || "", at: at, solution: clip(a.solution || (L.chat && L.chat.solution) || "", 1500) };
    var les = clip(a.lesson || "", 600), own = les.length >= 5 && userWrote(s, les), info = "";
    if (les.length >= 5 && !(so.b && so.b[1] && so.b[1].done && so.b[1].use === les)) {
      so.b = so.b || {}; so.b[1] = { state: "solved", chkHow: clip(a.check || "", 400), chkRes: a.check ? "نتیجه سالم ماند" : "", glance: clip(a.glance || "", 300), use: les, newProb: clip(a.newProb || "", 600), at: at, done: true, from: "chat", own: own,
        /* حکمِ بستن (A.liveClosure) — دورِ ۱۷ (RC4): «وارسی شد» فقط از پیام‌های خودِ کاربر که مدل نشان داد (checkMsgs یا coach_state.check)، سنجیده (chkVerdict)؛
           هم‌پوشانیِ واژه فقط «شاید» (maybe)، هرگز «وارسی نشد». verdictR16 (هم‌پوشانیِ ۶۰٪) قرنطینه است، نه حذف */
        verdict: "unverified" };
      chkVerdict(s, so.b[1], a, st || r.p.statement);
      so.lessons = so.lessons || []; var lo = { lv: 1, use: les, at: at, live: true, chat: true, own: own };
      if (A.newCard) { var cd = A.newCard("بازسازی — «" + clip(r.p.title, 70) + "»: بی‌نگاه دوباره حلش کن، بعد درست را ببین؛ درسش کجای دیگر به کار می‌آید؟", les + (a.check ? "\nوارسی: " + clip(a.check, 300) : ""), { pb: pid, due: A.addDays(A.today(), 1), src: "chat:solved:" + pid }); lo.card = cd && cd.id; }
      so.lessons.push(lo); so.rev = so.rev || {}; if (A.solveUI && A.solveUI.seed) try { A.solveUI.seed(so, "b"); } catch (e) { }
      info = "؛ درست ثبت شد و کارتِ «بازسازی» فردا (" + (A.fdate ? A.fdate(A.addDays(A.today(), 1)) : A.addDays(A.today(), 1)) + ") در «مرور» و «امروز» می‌آید";
    } else if (!(so.b && so.b[1] && so.b[1].done)) info = "؛ بازنگری هنوز نیست — صفحه‌اش (۴) بازنگری را از خودت می‌پرسد";
    /* دورِ ۱۶ (N1، s08، s31): بستن در گفت‌وگو بازنگری را کامل می‌کند — «کدام پرسش بیشتر کمک کرد؟» (bestQ) و «این نوع مسئله برایت چطور بود؟» (taste) روی همان
       بازنگری (solve.b[1]) که صفحه هم می‌نویسد؛ آنچه نیامد در نوبتِ بعد پرسیده می‌شود (لحظهٔ lbRest) و کارتِ «بازنگری: دو پرسشِ باقی‌مانده» در صفحه‌اش می‌ماند */
    if (so.b && so.b[1] && so.b[1].done) { var lbN = lbApply(so.b[1], L, a, s); if (lbN.length) info += "؛ " + lbN.join(" و ") + " هم ثبت شد"; }
    S.put(pg); S.put(r); sessLink(s, pid);
    if (a.newProb && String(a.newProb).trim().length >= 10) AS.DO.chat_invent({ statement: a.newProb, from: pid });
    return "✓ «" + clip(r.p.title, 60) + "» در «🔭 مسئله‌های من» " + (made ? "ثبت شد و" : "(همان مسئله، به‌روز شد)") + " «حل شد» خورد" + info + ".";
  };
  /* B13 (s31): بی پدر و بی nat ِ مدل ⇒ داور از حدسِ همان بخشِ مسئله (A.liveNatGuess، D4) و ردهٔ مربیِ همین گفت‌وگو (اثباتی/عینی ⇒ objective) — پیشنهاد، کاربر عوضش می‌کند */
  function chatNat(s, st) {
    var n0 = s && s.coach && s.coach.natSug; if (n0) return n0;   // E1: حدسِ نوعِ مدل در گزارشِ وضع (پیشنهاد؛ کاربر عوضش می‌کند)
    var g = ""; try { g = A.liveNatGuess ? A.liveNatGuess(faDigits(st)) || "" : ""; } catch (e) { }
    if (g) return g; var c = s && s.coach && s.coach.cls; if (!c) try { c = qClass("", st); } catch (e) { }
    return c === "prove" || c === "obj" ? "objective" : "";
  }
  /* فرمولِ مشترک (همان شیءِ ریاضی: «۱/(1·2·3) + …» در هر دو) — بی فاصله و با رقمِ لاتین؛ فرمول باید عملگر و رقم داشته باشد */
  function formulas(t) { return (faDigits(String(t || "")).replace(/…|\.\.\./g, "~").match(/[0-9a-zA-Z()\/·*^+\-−=×÷~ ]{3,}/g) || []).map(function (x) { return x.replace(/\s+/g, "").replace(/~/g, "").replace(/^[+\-−·*×÷=]+|[+\-−·*×÷=]+$/g, ""); }).filter(function (x) { return /[\/·*^+\-−=×÷]/.test(x) && /\d/.test(x) && /[()\/·*^+\-−=×÷]\d|\d[()\/·*^+\-−=×÷]/.test(x); }); }
  function sameFormula(a, b) { var A0 = formulas(a), B0 = formulas(b); return A0.some(function (x) { return B0.some(function (y) { return x.indexOf(y) >= 0 || y.indexOf(x) >= 0; }); }); }
  function nTok(t) { return tokN(t).map(function (w) { return /^می(?:شه|شود|شد)$/.test(w) ? "میشود" : w; }); }
  function paraphraseOf(t, x) { var a0 = nTok(t), b0 = nTok(x.p.title + " " + x.p.statement + " " + ((x.p.restated || []).join(" "))), uniq = a0.filter(function (w, i) { return a0.indexOf(w) === i; });
    if (uniq.length < 2) return false; var n = uniq.filter(function (w) { return b0.indexOf(w) >= 0; }).length; return n >= 2 && n * 2 > uniq.length; }
  /* دورِ ۱۶ (N3): پیوندِ سشن به مسئلهٔ موجود + حدسِ کاربر (از پیامِ خودش در همین سشن، با نشانهٔ صریحِ حدس) ⇒ solve.g[1] — فقط اگر هنوز حدسی ندارد (حدسِ صفحه‌اش دست نمی‌خورد) */
  var GUESS_CL = /(?:^|[\s.،؛!…:：])(?:فکر\s*(?:کنم|می[‌\s]?کنم)|حدس\s*می[‌\s]?زنم|حدس(?:م|\s*من)(?:\s*(?:اینه|این\s*است))?|به\s*نظرم)(?![آ-ی‌])\s*(?:که\s*)?[،,:：]?\s*([^.؟?!\n]{4,240})/;
  /* دورِ ۱۷ (RC1، C·V2 s25): حدس را مدل گزارش می‌دهد (coach_state.guess، سنجیده با پیامِ کاربر — عدد و فرمول هم)؛ الگوی GUESS_CL دیگر ذخیره نمی‌کند.
     dupLink ِ تازه: پیوندِ سشن + حدسِ گزارش‌شدهٔ همین پیام (اگر coach_state پیش از chat_invent آمد) یا نشانِ انتظار (اگر پس از آن می‌آید). */
  function dupLink(s, r, st) {
    var pid = r && r.p && r.p.id, out = ""; if (!pid) return "";
    if (s && sessLink(s, pid)) out = " — این گفت‌وگو هم به همان مسئله وصل شد";
    try { var C = s && (s.coach = s.coach || {}), um = ((s && s.msgs) || []).filter(isUser).pop(), key = um ? mkey(um.text) : "";
      if (C) { C.dupPend = { pid: pid, key: key };
        if (C.guess && C.guess.key === key) { var n = guessToProblem(s, pid, C.guess.text); if (n) out += n; } }
    } catch (e) { }
    return out;
  }
  /* قرنطینه (دورِ ۱۷، RC1 — در docs/overhaul/REMOVAL_CANDIDATES.md): مسیرِ دورِ ۱۶ که حدس را با الگوی GUESS_CL و qToks≥2 می‌خواند و ذخیره می‌کرد */
  function dupLinkR16(s, r, st) {
    var pid = r && r.p && r.p.id, out = ""; if (!pid) return "";
    if (s && sessLink(s, pid)) out = " — این گفت‌وگو هم به همان مسئله وصل شد";
    try {
      var um = ((s && s.msgs) || []).filter(isUser).pop(), src = um ? ownText(um.text) : "", m = GUESS_CL.exec(src) || GUESS_CL.exec(ownText(st)), g = m ? m[1].replace(/\s*(?:درسته|درست\s*(?:است|ه)|نه)\s*$/, "").trim() : "";
      if (g && qToks(g).length >= 2) {
        var pg = S.get("eprog_" + pid); if (pg) { var so = pg.solve = pg.solve || {}; so.g = so.g || {};
          if (!(so.g[1] && so.g[1].guess)) { so.g[1] = { guess: clip(g, 300), conf: null, test: "", testRes: "", ifRef: "", before: true, seen: false, at: nowIso(), from: "chat", sess: (s && s.id) || "" }; S.put(pg); out += "؛ حدست («" + clip(g, 60) + "») حدسِ همان مسئله ثبت شد — هنوز حدس است تا بیازمایی‌اش"; } }
      }
    } catch (e) { }
    return out;
  }
  AS.DO.chat_invent = function (a) {
    var s = AS._turnSession; if (!A.liveCreate) return "این نسخه «🔭 مسئلهٔ حل‌نشدهٔ خودم» را ندارد";
    var st = clip(a && a.statement, 1500); if (st.length < 10) return "ثبت نشد: «statement» (مسئلهٔ تازه به حرفِ خودِ کاربر) لازم است";
    if (a && (a.solved === true || a.solved === "true")) return AS.DO.chat_solved(a);   // همین‌جا حل شد ⇒ «حل شد»، نه «حل‌نشده» (rerunA s03)
    var blv = AS.boundLive(s), from = a && a.from && A.liveRec && A.liveRec(a.from) ? { type: "lprob", id: a.from, via: "chat" } : blv ? { type: "lprob", id: blv.pid, via: "chat" } : { type: "chat", id: (s && s.id) || "" };
    /* دورِ ۱۶ (N3، s11 روزِ ۱۰-۲۱): مسئلهٔ تکراری ⇒ سشن به همان مسئله بسته می‌شود (sessLink ⇒ lprobLog، مثلِ live_new) و حدسِ کاربر حدسِ همان مسئله است، نه فقط بازگفت */
    var dupS = A.liveAll ? A.liveAll().filter(function (x) { return sameProblem(x, st, ""); }).pop() : null;
    if (dupS) { var lkS = dupLink(s, dupS, st); return "✓ این مسئله پیش‌تر در «🔭 مسئله‌های من» ثبت شده بود («" + clip(dupS.p.title, 60) + "»)؛ دوباره نساختم" + lkS + "."; }
    /* B13 (s25): مسئلهٔ تازهٔ بازنگری (فرزندِ همان پدر) و chat_invent ِ همان حدس دو مسئله نمی‌شوند — هم‌خانواده (فرزندِ همان پدر یا ساختهٔ همین سشن) با عنوانِ
       نزدیک‌به‌رونوشت یا سه‌پنجمِ واژه‌های صورت ⇒ همان مسئله؛ صورتِ تازه کنارش می‌ماند (r.p.restated)، نه مسئلهٔ دوم */
    var kin = A.liveAll ? A.liveAll().filter(function (x) { return x && x.p && ((from.type === "lprob" && x.origin && x.origin.id === from.id) || (s && (x.sess === s.id || (s.invented || []).indexOf(x.p.id) >= 0))); }) : [];
    /* E7 (دورِ ۴، s11، s25، s31): هم‌خانواده‌ای که دادهٔ دیگری دارد («جمعِ ۱۰۰۰» در برابرِ «جمعِ ۱۰») مسئلهٔ تازه است؛ بازگفتِ فرزندِ بازنگری (همان پدر،
       بی دادهٔ ناسازگار) با بیش از نیمِ واژه‌های معنادارِ عنوان یا صورتِ تازه در آن (A4 > ½؛ دست‌کم دو واژه)، یا با همان فرمول («۱/(1·2·3) + …»)، همان مسئله است */
    var ti0 = clip((a && a.title) || st, 80), twin = kin.filter(function (x) {
      if (from.type === "lprob" && x.p.id === from.id) return false;   // خودِ پدر هرگز «همان مسئلهٔ تازه» نیست
      if (numConflict(ti0 + " " + st, x.p.title + " " + x.p.statement)) return false;
      var t1 = nrmSt(ti0), t2 = nrmSt(x.p.title), sib = from.type === "lprob" && x.origin && x.origin.id === from.id;
      return (t1.length >= 6 && t2.length >= 6 && (t1 === t2 || t1.indexOf(t2) >= 0 || t2.indexOf(t1) >= 0)) || sameStmt(st, x.p.statement) ||
        (sib && (paraphraseOf(ti0, x) || paraphraseOf(st, x) || sameFormula(ti0 + " " + st, x.p.title + " " + x.p.statement))); })[0];   // بازگفت فقط برای فرزندِ همان پدر
    if (twin) { var rs = twin.p.restated = (twin.p.restated || []); if (rs.indexOf(st) < 0 && nrmSt(st) !== nrmSt(twin.p.statement)) { rs.push(st); if (rs.length > 5) twin.p.restated = rs.slice(-5); S.put(twin); }
      /* F4 (دورِ ۵، s25): صورتِ تازه نوع را دوباره حدس می‌زند («آیا … همیشه …؟» ⇒ اثبات یا رد کن) — فقط پیشنهاد، و فقط تا خودش در کارتِ فهم نوع را نگذاشته؛
         نوعِ صریحِ مدل (a.kind) بر حدس مقدم است */
      var ty = A.SOLVE_TYPES && A.SOLVE_TYPES[a && a.kind] ? a.kind : ""; if (!ty) try { ty = A.liveTypeGuess ? A.liveTypeGuess(st) || "" : ""; } catch (e) { }
      var pgT = S.get("eprog_" + twin.p.id), soT = pgT && pgT.solve, uT = soT && soT.u && soT.u[1];
      if (ty && ty !== twin.p.kind && !(uT && uT.done && uT.from !== "chat")) { twin.p.kind = ty; S.put(twin); if (soT) { soT.type = ty; S.put(pgT); } }
      var lkT = dupLink(s, twin, st);
      return "✓ همین مسئلهٔ تازه پیش‌تر ثبت شده بود («" + clip(twin.p.title, 60) + "»)؛ دوباره نساختم — صورتِ تازه‌ات کنارش ماند" + (ty && twin.p.kind === ty ? " (نوع: " + ((A.SOLVE_TYPES[ty] || {}).fa || ty) + ")" : "") + lkT + "."; }
    var LAD = (A.solveUI && A.solveUI.LADDER) || [1, 3, 7, 21, 60], due = A.addDays(A.today(), LAD[1]);
    /* فرزند داور، نوع و فضایی بودنِ پدر را به ارث می‌برد (R2) — درونِ خودِ A.liveCreate از origin {type:"lprob", id} (ادغامِ G1/G2: یک منطقِ ارث؛ این‌جا حدسی نیست).
       نوعِ صریحِ مدل (find/prove/pod، مثلاً «اثبات یا رد کن» برای حدس) پذیرفته است؛ بی پدر (ساخته در گفت‌وگو): داورِ صریحِ مدل با natBy: "assistant" */
    var r = A.liveCreate(clip((a && a.title) || st, 80), st, (a && a.kind) || "", from.type === "lprob" ? { by: "user", sess: (s && s.id) || "", origin: from, dormant: due }
      : { by: "user", sess: (s && s.id) || "", origin: from, dormant: due, nat: (a && a.nat) || chatNat(s, st), natBy: a && a.nat ? "assistant" : "guess" });
    if (from.type === "lprob") { var pg0 = S.get("eprog_" + from.id); if (pg0 && pg0.solve && pg0.solve.live) { var L0 = pg0.solve.live; L0.made = (L0.made || []).concat([r.p.id]); S.put(pg0); } }
    if (s) s.invented = (s.invented || []).concat([r.p.id]).slice(-50);
    return "✓ مسئلهٔ تازه‌ات «" + clip(r.p.title, 60) + "» در «🔭 مسئله‌های من» ثبت شد (" + (from.type === "lprob" ? "ساخته از «" + clip(A.liveRec(from.id).p.title, 40) + "»" : "ساخته در همین گفت‌وگو") + ")؛ " + (A.fdate ? A.fdate(due) : due) + " در «امروز» برمی‌گردد.";
  };
  /* ---------- E1: AS.DO.coach_state — ادعای مدل دربارهٔ آخرین پیامِ کاربر، سنجیده با متنِ خودِ او؛ دفتر در s.coach ----------
     ans: فقط اگر پیامِ کاربر پاسخِ واقعی است (نه «نمی‌دونم»/گیر/پرکننده) و شناسه در فهرستِ همان نوبت بود؛ said: فقط از متنِ خودِ کاربر — پیامِ
     چسبانده‌ای که خودِ صورت است فقط با برچسبِ صریح («مجهول…»)؛ مرحله: جلو رفتن فقط با شاهدِ خودش (مجهول ⇐ طرح، طرح ⇐ اجرا، نتیجه ⇐ بازنگری)،
     عقب رفتن فقط با گیر/شکست/حرفِ تازه؛ fail/stuck ⇒ رویدادِ مرحله (R7) به جای خواندنِ الگوی همان پیام؛ role=teacher فقط اگر خودش از یادگیرنده‌ای گفت؛
     nat فقط پیشنهاد (انتخابِ صریحِ کاربر در صفحه برنده است — این‌جا هرگز روی مسئلهٔ ثبت‌شده نوشته نمی‌شود). پاسخِ کنش تهی است (بی پیام در گفت‌وگو). */
  /* دورِ ۷ (H1، s18): مجهول به حرفِ خودش = **آخرین** بازگویی‌اش («مجهول؟ «…». به زبون دیگه … پس نرخ تغییر عمق، dy/dt» ⇒ «نرخ تغییر عمق، dy/dt») */
  function unkPhrase(t) {
    var L = String(t || "").split(/[.!؟?\n…]+/).map(function (x) { return x.replace(/^[\s«»"،:：]+|[\s«»"،:：]+$/g, ""); }).filter(function (x) { return qToks(x).length || /[a-zA-Z]/.test(x); });
    var x = L.length ? L[L.length - 1] : String(t || ""), y;
    do { y = x; x = x.replace(/^(?:پس|یعنی|خب|به\s*(?:زبون|زبان)\s*(?:دیگه|دیگر)|به\s*عبارتِ?\s*(?:دیگه|دیگر)|مجهول(?:م|ش)?(?:\s*(?:اینه|این\s*است))?)(?![آ-ی])[\s،:：«»"]*/, ""); } while (x !== y && x);
    return x || String(t || "");
  }
  var LEARNER_RE = /بچه|پسر(?:م|ام|‌ام)|دختر(?:م|ام|‌ام)|فرزند|شاگرد|دانش[‌\s]?آموز|یادگیرنده|کلاس(?:م|ام|‌ام|مون)|(?:به|برای)\s*(?:کلاس|بچه‌ها)/;
  var ORD = { u: 0, p: 1, c: 2, b: 3 };
  AS.DO.coach_state = function (a) {
    var s = AS._turnSession; if (!s || !a || typeof a !== "object") return "";
    var M = s.msgs || [], um = null; for (var i = M.length - 1; i >= 0; i--) if (isUser(M[i])) { um = M[i]; break; } if (!um) return "";
    var ut = String(um.text || ""), key = mkey(ut), C = s.coach = s.coach || {}, P = C.prev && C.prev.key === key ? C.prev : null, at = um.at || nowIso();
    C.model = nowIso();
    var real = realReply(ut), pasted = P ? !!P.pasted : false, lab = statedParts(ut, true), teach = !!C.teach;
    var said = (Array.isArray(a.said) ? a.said : []).map(String).filter(function (k, j, L) { return /^(?:u|d|c|plan|result)$/.test(k) && L.indexOf(k) === j; });
    said = said.filter(function (k) { return real && (!pasted || (k in lab && lab[k])); });
    if (teach && SELF_SOLVED_RE.test(ut)) said = said.filter(function (k) { return k !== "result"; });   // مربی خودش حل کرد؛ یادگیرنده نه
    if (heurClaim(ut) || guessNow(ut, teach)) said = said.filter(function (k) { return k !== "result"; });
    var stB = ""; try { stB = P && P.live ? (A.liveRec(P.live) || { p: {} }).p.statement : C.stmt; } catch (e) { }   // دورِ ۷ (H1، s28): تنها شاهدِ «نتیجه» «پس + عدد» ِ سازندهٔ مسئله/بازگوییِ ادعا ⇒ ادعا، نه نتیجه
    /* تورِ پولیا (RN6b، D·7 s38): گزارشِ said:result با متنِ نتیجه (result) که عیناً در پیامِ خودش هست سنجیده است و مرحله را می‌برد، حتی اگر الگو فقط «ضعیف» دیدش؛
       متنی که در پیامش نیست ⇒ رد. بی متن ⇒ همان سنجشِ پیشین. */
    var rTx19 = txtOf(a.result), resOk19 = !!rTx19 && quoteIn(rTx19, ut);
    if (rTx19 && !resOk19) said = said.filter(function (k) { return k !== "result"; });
    if (!resOk19 && resultNow(ut) && !resultNow(ut, false) && !SOLVED_RE.test(ut) && !weakOk(ut, { intro: !!(P && P.intro), stmt: stB })) said = said.filter(function (k) { return k !== "result"; });   // دورِ ۵ (F1، s03): «ثابت شد» از چند شکل ادعاست، نه نتیجه؛ دورِ ۶ (G1): «…درسته؟» حدس است
    /* نقش */
    if (a.role === "teacher") { var rec = M.filter(isUser).slice(-4).map(function (m) { return m.text; }).join(" "); if (LEARNER_RE.test(rec)) { C.teach = true; C.teachBy = "model"; } }
    else if (a.role === "self" && C.teach && C.teachBy === "re" && C.teachKey === key) { C.teach = false; C.teachBy = "model"; }
    if (/^(?:objective|practical|life)$/.test(String(a.nat || ""))) C.natSug = a.nat;
    /* پرسش‌های پاسخ‌گرفته (شناسه ⇐ متنِ پرسش از فهرستِ همان نوبت) */
    var qm = C.qmap || {}, ids = (Array.isArray(a.ans) ? a.ans : []).map(String), qs = ids.map(function (id) { return qm[id]; }).filter(Boolean);
    /* M3 (دورِ ۱۳): «کل» (u0) پاسخ گرفته فقط وقتی همین پیام بخش‌های اصلیِ مسئله را با هم گفت (پولیا: مجهول و داده/شرط — said ِ سنجیدهٔ همین پیام)؛
       ادعای بی آن (مثلاً فقط مجهول) پرسشِ کل‌اول را نمی‌پراند */
    if (A.liveWholeQ) qs = qs.filter(function (q) { return q !== A.liveWholeQ || (said.indexOf("u") >= 0 && (said.indexOf("c") >= 0 || said.indexOf("d") >= 0)); });
    /* F3 (دورِ ۵): دفترِ همان مسئله‌ای که این پیام درباره‌اش بود (pk ِ نوبت) */
    var pk = (P && P.pk) || C.pk || "c:0"; ledgerOf(s, pk); var AB = C.ansBy = C.ansBy || {}, A0 = AB[pk] = AB[pk] || {}, AL = C.ansLog = C.ansLog || [];
    qs.forEach(function (q) {
      if (!real || AL.some(function (e) { return e.q === q && e.key === key; })) return;   // «نمی‌دونم»/گیر پاسخ نیست ⇒ نه پاسخ‌گرفته، نه کاربست
      AL.push({ q: q, at: at, self: 2, key: key, pk: pk }); A0[q] = at;
    });
    if (AL.length > 300) C.ansLog = AL.slice(-300);
    /* مرحله (مسئلهٔ فقط‌درگفت‌وگو؛ مسئلهٔ زندهٔ باز مرحله‌اش را از صفحه می‌گیرد) */
    var st = P && !P.live ? Object.assign({}, P.st0 || {}) : Object.assign({}, C.st || {});
    said.forEach(function (k) { if (k === "u" || k === "d" || k === "c") st[k] = 1; });
    if (real) qs.forEach(function (q) { qParts(q).forEach(function (k) { st[k] = 1; }); });
    var parts = said.filter(function (k) { return k === "u" || k === "d" || k === "c"; });
    if (parts.length) { var OL = C.ownLog = C.ownLog || []; if (!OL.some(function (e) { return e.key === key; })) OL.push({ p: parts, at: at, key: key }); if (OL.length > 200) C.ownLog = OL.slice(-200); }
    /* دورِ ۵ (F2، s08): گیر/شکستِ گزارش‌شده برای پیامِ چسبانده هم دور ریخته نمی‌شود (گیرِ واقعیِ اوست، نه «گفتنِ مجهول») */
    var fail = a.fail === true, stuck = a.stuck === true, cl = { u: "u", p: "p", e: "c", c: "c", b: "b" }[String(a.ph || "")] || "";
    var ph0 = P ? (P.ph0 || "u") : (C.ph || "u"), ph = ph0;
    /* جلو به طرح فقط با شاهدِ خودش — صورتِ چسبانده‌ای که پس از آن خوانده و رویش کار کرده هم «مجهولِ گفته» است (s08)؛ دورِ ۶ (G1): همچنین وقتی همان پیامِ چسبانده
       کارِ خودش را می‌گوید («دارم امتحان می‌کنم: ۷+۷=۱۴… هیچی جور نمیشه») و مدل گیر/شکست گزارش کرد — نه پیامی که فقط صورت را آورد */
    var fwd = cl === "p" && ORD[ph0] < ORD.p && (st.u || (!pasted && C.stmt) || (P && P.work && (stuck || fail)));
    if (said.indexOf("result") >= 0) ph = "b";
    else if (fail) ph = fwd ? "p" : cl && ORD[cl] < ORD[ph0] ? cl : (ph0 === "b" || ph0 === "c" ? "c" : ph0);
    else if (said.indexOf("plan") >= 0 && ORD[ph0] < ORD.c) ph = "c";
    else if (cl && ORD[cl] < ORD[ph0]) ph = stuck || said.length ? cl : ph0;          // عقب: فقط با گیر یا حرفِ تازه
    else if (fwd) ph = "p";
    /* دورِ ۵ (F1، s31): نشانهٔ قوی‌ترِ پیشین (نتیجهٔ بی‌ابهامِ خودش) با گزارشِ مدل به عقب برنمی‌گردد، مگر مدل شکست گزارش کند */
    if (P && P.strong && !fail && ORD[ph] < ORD[P.strong]) ph = P.strong;
    if (!(P && P.live)) { C.ph = ph; C.st = st; }
    /* دورِ ۵ (F2): نشانه‌های همین پیام برای نوبتِ بعد (A.liveCoach(pid,{turn})): گیر/شکست یک نوبت؛ «نتیجه گفت» برای مسئلهٔ زنده تا صفحه ثبتش کند یا شکستی بیاید */
    C.rep = { key: key, stuck: stuck, fail: fail, result: said.indexOf("result") >= 0, pk: pk };
    if (C.resBy) delete C.resBy;   // دورِ ۶ (G1): «نتیجه» دیگر تا ثبتِ صفحه نمی‌ماند — فقط C.rep برای پیامِ بعد
    if (said.indexOf("u") >= 0 && !pasted) { var UB = C.unkBy = C.unkBy || {}; UB[pk] = clip(unkPhrase(ut), 160); }   // مجهول به حرفِ خودش (برای سطرِ 🎯 ِ میانهٔ کار)
    /* رویدادِ مرحله (R7): خواندنِ مدل جای خواندنِ الگوی همان پیام */
    var ek = "chat|" + clip(ut, 80); s.coachEv = (s.coachEv || []).filter(function (e) { return !(e && e.src === "chat" && e.key === ek); });
    /* تورِ پولیا (RN2e): همان نوبت گامی از مسئلهٔ زنده را گزارش کرد ⇒ رویدادِ اجرای این نوبت شناسهٔ همان کار را دارد (کارنامه یک بار می‌شمارد) */
    var act19 = C.stepRep && C.stepRep.key === key && C.stepRep.act ? C.stepRep.act : "";
    if ((fail || stuck) && !C.teach) { var fph = P && P.live ? (P.ph0 || "u") : (cl || ph0); coachEv(s, fph, "chat", ut, false, act19 && (fph === "c" || fail) ? { act: act19 } : undefined); }
    /* تورِ پولیا (RM1a): موفقیتِ سنجیدهٔ گفت‌وگو ⇒ ok:true برای همان مرحله — پاسخِ پذیرفته‌شده به پرسشِ یک مرحله (شناسهٔ u/p/e/b)، گذر از مرحله
       با شاهدِ خودش (فهم ⇐ طرح، طرح ⇐ اجرا)، و نتیجه‌ای که گفت (اجرا). گیر/شکست هرگز موفقیت نیست؛ شکستِ پس از «نتیجه» همان موفقیتِ نتیجه را پس می‌گیرد
       (نتیجه غلط بود — یک رویداد، نه دو). */
    if (!C.teach) {
      if (fail || stuck) {
        var EV = s.coachEv || [], ri = -1; EV.forEach(function (e, j) { if (e && e.src === "chatok" && e.res && e.pk === pk) ri = j; });
        if (fail && ri >= 0) EV.splice(ri, 1);
      } else {
        var okSt = {}, ST4 = { u: "u", p: "p", e: "c", b: "b" };
        if (real) ids.forEach(function (id) { var q = qm[id]; if (q && qs.indexOf(q) >= 0 && ST4[String(id).charAt(0)]) okSt[ST4[String(id).charAt(0)]] = "ans"; });
        /* تورِ پولیا (RN3c): نتیجه و طرحِ سنجیده هر کدام شاهدِ مرحلهٔ خودند — در یک نوبت هر دو (طرح + نتیجه ⇒ طرح و اجرا)، و در سشنِ بسته به مسئلهٔ زنده هم؛
           بازگوییِ خودش (said u/c ِ سنجیده، نه صورتِ چسبانده، نه «آره») ⇒ موفقیتِ فهم. گذر از مرحله فقط وقتی هیچ‌کدام نبود (یک موفقیت برای مرحلهٔ تمام‌شده). */
        var hasRes = said.indexOf("result") >= 0 && (P && P.live ? true : ph === "b"), hasPlan = said.indexOf("plan") >= 0;
        if (hasRes) okSt.c = "res";
        if (hasPlan) okSt.p = "plan";
        if (!hasRes && !hasPlan && !(P && P.live) && ORD[ph] > ORD[ph0]) okSt[ph0] = "pass";
        if ((said.indexOf("u") >= 0 || said.indexOf("c") >= 0) && !pasted && tokN(ownText(ut)).length >= 2 && !okSt.u) okSt.u = "own";
        Object.keys(okSt).forEach(function (k) { coachEv(s, k, "chatok", ut, true, Object.assign({ pk: pk, how: okSt[k], res: okSt[k] === "res" || undefined }, act19 && k === "c" ? { act: act19 } : {})); });
      }
    }
    try { S.put(s); } catch (e) { }
    return "";
  };
  /* سشن ⇄ مسئله: مسئلهٔ زنده‌ای که دستیار در نوبتِ **همین** سشن ساخت (r.sess) ⇒ «مسئلهٔ زندهٔ این سشن» — نه سشنِ کهنه (AS._turnSession ِ مانده) و نه سشنی که به مسئلهٔ بازِ دیگری بسته است */
  if (!S.put._lpLink) {
    var rawPutL = S.put;
    S.put = function (r) {
      var isNew = false; try { isNew = !!(r && r.type === "eprob" && r.live && r.p && !r.dormant && !S.get(r.id)); } catch (e) { }
      var o = rawPutL.apply(this, arguments);
      /* ادغامِ G1/G2: از راهِ A.liveBindSession (بی force) — سشنی که مسئلهٔ بازِ دیگری دارد جابه‌جا نمی‌شود؛ برگشتِ false یعنی پیوندِ پیشین می‌ماند */
      if (isNew) try { var cs = AS.busy && AS.busy() ? AS._turnSession : null; if (cs && cs.type === "achat" && r.sess === cs.id) { sessLink(cs, r.p.id, false);
        /* دورِ ۱۰ (J4): مسئله‌ای که دستیار از گفت‌وگو ساخت (live_new: by دستیار، بی origin — chat_solved/chat_invent پیامِ ✓ ِ خودشان را دارند) ⇒ پس از کارهای همین نوبت تأیید و رفتن */
        if (r.by === "assistant" && !r.origin) cs.lpNew = (cs.lpNew || []).concat([r.p.id]).slice(-5); } } catch (e) { }
      return o;
    };
    S.put._lpLink = true;
  }
  /* ---------- دورِ ۱۰ (J4، s13، s17، s19): «🔭 مسئله ثبت شد — باز کن» ----------
     live_new ِ گفت‌وگو پیش‌تر بی‌صدا ثبت می‌کرد و کاربر نمی‌دانست مسئله کجاست. حالا پس از کارهای همان نوبت (AS.run): یک پیامِ سامانه در گفت‌وگو با دکمهٔ
     «🔭 باز کن» (همیشه) و — اگر کاربر روی فرمی نیست (فیلدِ متنیِ پرشده در صفحه، یا صفحهٔ مسئلهٔ دیگری) و همین نوبت جای دیگری نرفت — رفتن به صفحهٔ مسئله
     (بی نوبتِ خودکارِ دیگر). */
  function onForm() {
    try { var st = A.state || {}; if (st.view === "lprob") return true;
      return Array.prototype.some.call(document.querySelectorAll("#main textarea, #main input[type=text], #main input:not([type])"), function (x) { return !x.disabled && !x.readOnly && String(x.value || "").trim().length > 0; });
    } catch (e) { return false; }
  }
  AS.lpOnForm = onForm;
  if (typeof AS.run === "function" && !AS.run._lpNew) {
    var rawRunL = AS.run;
    AS.run = function () {
      var s0 = AS._turnSession;
      return rawRunL.apply(this, arguments).then(function (res) {
        try {
          var s = AS._turnSession || s0, q = (s && s.lpNew) || [];
          if (q.length) {
            s.lpNew = []; var last = "", moved = !!(res && res.moved), form = onForm();
            q.forEach(function (pid) { var r = A.liveRec && A.liveRec(pid); if (!r) return; last = pid;
              s.msgs.push({ role: "sys", at: nowIso(), text: "🔭 مسئله ثبت شد — «" + clip(r.p.title, 70) + "» در «🔭 مسئله‌های من»" + (moved || form ? "؛ برای رفتن به صفحه‌اش «باز کن» را بزن." : "؛ صفحه‌اش باز شد."), go: { view: "lprob", arg: pid } }); });
            /* بی نوبتِ خودکارِ «… باز شد» (res.moved دست نمی‌خورد): فیلدهای صفحه به قلمِ خودِ کاربرند (data-own) و پاسخِ همین نوبت پیش‌تر داده شده */
            if (last && !moved && !form && A.go && !window.__noNav) A.go("lprob", last);
            S.put(s);
          }
        } catch (e) { console.error(e); }
        return res;
      });
    };
    AS.run._lpNew = true;
  }
  /* دکمهٔ «🔭 باز کن» کنارِ همان پیامِ سامانه (msg.go) — نقاشیِ گفت‌وگو در دستیار است؛ این‌جا فقط پس از هر نقاشی دکمه افزوده می‌شود */
  function goChips() {
    var s = AS.cur && AS.cur(); if (!s || !(s.msgs || []).some(function (m) { return m && m.go; })) return;
    var nodes = document.querySelectorAll(".as-log > .as-msg:not(.as-typing)"); if (nodes.length !== s.msgs.length) return;
    s.msgs.forEach(function (m, i) { var nd = nodes[i]; if (!m || !m.go || !nd || nd.querySelector(".as-go")) return;
      var bt = document.createElement("button"); bt.type = "button"; bt.className = "linkish small as-go"; bt.textContent = "🔭 باز کن";
      bt.setAttribute("aria-label", "بازکردنِ صفحهٔ مسئله"); bt.addEventListener("click", function () { if (A.go) A.go(m.go.view, m.go.arg); });
      nd.appendChild(bt); });
  }
  AS.goChips = goChips;
  if (typeof MutationObserver === "function" && !AS._goChipsObs) {
    var gcBusy = false;
    AS._goChipsObs = new MutationObserver(function () { if (gcBusy) return; gcBusy = true; try { goChips(); } catch (e) { } gcBusy = false; });
    var startObs = function () { if (document.body) AS._goChipsObs.observe(document.body, { childList: true, subtree: true }); };
    if (document.body) startObs(); else document.addEventListener("DOMContentLoaded", startObs);
  }
  /* کاربر صفحهٔ مسئلهٔ زندهٔ دیگری را باز کرد و همان‌جا با دستیار حرف می‌زند ⇒ خودش عوض کرد (force) */
  AS.promptHooks.push(function (s) { try { var st = A.state || {}; if (s && st.view === "lprob" && A.liveRec && A.liveRec(st.arg) && s.lprob !== st.arg) sessLink(s, st.arg, true); } catch (e) { } return ""; });
  /* ادغامِ G1/G2: «bindGuard» (پوششِ دوم روی A.liveBindSession) و «todayFix» (لایهٔ متنیِ «امروز» روی A.dueList) برداشته شدند — هر دو تکرارِ درونیِ
     کاری بودند که حالا فقط بخشِ مسئله (a38) می‌کند: liveBindSession ِ بی سشن از AS.cur() و بی force پیوندِ بازِ دیگر را نگه می‌دارد، و متنِ «امروز»
     (شمار با فهرست، «دیروز»/«n روز پیش»، «ساخته‌شده در گفت‌وگو») در خودِ A.dueList ِ a38 درست است. یک منبع، بی سطرِ تکراری. */

  /* ================= دورِ ۱۶ ِ تورِ پولیا (سهمِ «coach»، DECISIONS_R16 N1–N6) ================= */
  /* ---------- N1: بستن در گفت‌وگو بازنگری را کامل می‌کند — «کدام پرسش بیشتر کمک کرد؟» و «این نوع مسئله برایت چطور بود؟» ----------
     همان دو فیلدِ بازنگریِ صفحه (b.bestQ/bestKind، b.taste ِ a38) روی همان رکورد؛ پس خلاصهٔ بازنگری («سلیقه‌ات»، «پرسشی که بیشتر کمک کرد») و هر
     خوانندهٔ دیگرِ solve.b[1] آن را همان‌طور می‌خوانند که از بازنگریِ صفحه. پرسشی که در گفت‌وگو پرسیده نشد، کارتِ «بازنگری: دو پرسشِ باقی‌مانده» در صفحه‌اش می‌ماند. */
  var LB_BEST_Q = "کدام پرسش بیشتر از همه کمک کرد؟", LB_TASTE_Q = "این نوع مسئله برایت چطور بود — کدام بخشش را دوست داشتی و کدامش را نه؟";
  function txt0(t) { return String(t || "").trim(); }
  function lbApply(b, L, o, s) {
    var n = []; if (!b || !o) return n;
    var bq = clip(o.bestQ || "", 400), ts = clip(o.taste || "", 400);
    if (bq) { b.bestQ = bq; b.bestKind = "chat"; delete b.bestNone; if (L) L.bestQ = bq; n.push("«پرسشی که بیشتر کمک کرد»"); }
    else if (o.bestNone === true || o.bestNone === "true") { b.bestNone = true; b.bestQ = ""; n.push("«هیچ پرسشی بیشتر از بقیه کمک نکرد»"); }
    if (ts && /^(?:unknown|نامعلوم|نمی‌دانم|\?)$/i.test(ts.trim())) ts = "";   // دورِ ۱۷ (RC1): «نمی‌دانم» هرگز سلیقه ثبت نمی‌شود
    if (ts) { b.taste = ts; b.tasteOwn = !!(s && userWrote(s, ts)); n.push("«سلیقه‌ات»"); }
    if (n.length) b.lbRestAt = nowIso();
    return n;
  }
  function lbRec(pid) {
    var r = pid && A.liveRec ? A.liveRec(pid) : null; if (!r) return null;
    var pg = S.get("eprog_" + pid), so = pg && pg.solve, b = so && so.b && so.b[1];
    return b && b.done ? { r: r, pg: pg, so: so, b: b, L: so.live || {} } : null;
  }
  function lbOpts(pid) { try { return (A.liveChatQItems ? A.liveChatQItems(pid) : []).map(function (x) { return x && x.t && (A.MATH && A.MATH.toPlain ? A.MATH.toPlain(x.t) : x.t); }).filter(Boolean); } catch (e) { return []; } }   // دورِ ۱۸ (RM2a، D·D7 s38): <option> MathML نمی‌گیرد ⇒ متنِ ساده
  /* آنچه از بازنگریِ «حل شد» ِ گفت‌وگو مانده: best فقط اگر گزینه‌ای هست (پرسشی دربارهٔ همین مسئله پرسیده شده)، taste همیشه — همان قاعدهٔ بازنگریِ صفحه */
  function lbMissing(pid) {
    var x = lbRec(pid); if (!x || x.b.from !== "chat" || x.b.state === "abandoned") return null;
    var m = []; if (!x.b.bestQ && !x.b.bestNone && lbOpts(pid).length) m.push("best"); if (!txt0(x.b.taste)) m.push("taste");
    return m.length ? { x: x, miss: m } : null;
  }
  A.chatLookMissing = function (pid) { var m = lbMissing(pid); return m ? m.miss.slice() : []; };
  function chatClosed() {
    return (A.liveAll ? A.liveAll() : []).map(function (r) { var x = lbRec(r && r.p && r.p.id); return x && x.b.from === "chat" ? x : null; }).filter(Boolean)
      .sort(function (a, b) { return String((a.L.chat || {}).at || a.b.at || "").localeCompare(String((b.L.chat || {}).at || b.b.at || "")); });
  }
  /* {"do":"chat_lookback","pid":"…","bestQ":"…","taste":"…"} — پاسخِ خودِ کاربر به یکی از دو پرسشِ باقی‌مانده؛ بی pid: مسئلهٔ بسته‌شدهٔ همین سشن */
  AS.DO.chat_lookback = function (a) {
    var s = AS._turnSession, pid = a && a.pid && A.liveRec && A.liveRec(a.pid) ? a.pid : "";
    if (!pid) { var bl = AS.boundLive(s); if (bl && bl.done) pid = bl.pid; }
    if (!pid) { var mine = chatClosed().filter(function (x) { return s && (x.L.chat || {}).sess === s.id; }).pop(); if (mine) pid = mine.r.p.id; }
    var x = pid ? lbRec(pid) : null; if (!x) return "ثبت نشد: «pid» ِ مسئله‌ای که بازنگری‌اش تمام شده لازم است";
    var n = lbApply(x.b, x.L, a || {}, s); if (!n.length) return "ثبت نشد: «bestQ» یا «taste» (به حرفِ خودِ کاربر) لازم است";
    S.put(x.pg);
    return "✓ در بازنگریِ «" + clip(x.r.p.title, 60) + "» " + n.join(" و ") + " ثبت شد.";
  };
  /* لحظهٔ «بازنگریِ ناتمام» در سشنی که مسئله را بست: پرسشِ باقی‌مانده یکی‌یکی (اول best، بعد taste)، هر کدام فقط یک بار پرسشِ نوبت؛ بعد کارتِ صفحه نگهش می‌دارد */
  function lbRestOf(s, mt) {
    if (!s) return null; var C = s.coach || {}, ask = C.lbAsk || {}, k0 = mkey(mt);
    var mine = chatClosed().filter(function (x) { return (x.L.chat || {}).sess === s.id; }).reverse();
    for (var i = 0; i < mine.length; i++) {
      var pid = mine[i].r.p.id, m = lbMissing(pid); if (!m) continue;
      /* دورِ ۱۷ (RC5، A·D4 s08، D·3 s31): «پرسیده» = پرسشِ خودِ صفحه **یا** هر صورتی از آن در پیامِ دستیار پس از بستن، یا «نمی‌دانم» ِ گزارش‌شده؛
         پیامی که خودش پاسخِ «کدام پرسش کمک کرد؟» است، همان را پرسشِ نوبت نمی‌کند (سطرِ «اگر پاسخ است، نگه دار» در پالایهٔ دورِ ۱۷) */
      var unk = C.lbUnk || {}, selfBest = USER_BEST.test(String(mt || ""));
      var free = function (k) { var v = ask[pid + "|" + k]; if (v && v !== k0) return false; if (unk[pid + "|" + k]) return false; if (k === "best" && selfBest) return false; return !askedByAi(s, pid, k); };
      var k = m.miss.indexOf("best") >= 0 && free("best") ? "best" : m.miss.indexOf("taste") >= 0 && free("taste") ? "taste" : "";
      if (k) return { pid: pid, title: mine[i].r.p.title, k: k, q: k === "best" ? LB_BEST_Q : LB_TASTE_Q };
    }
    return null;
  }
  AS.lbRestOf = lbRestOf;
  function lbMark(s, o, mt) { if (!s || !o) return; var C = s.coach = s.coach || {}; C.lbAsk = C.lbAsk || {}; if (!C.lbAsk[o.pid + "|" + o.k]) C.lbAsk[o.pid + "|" + o.k] = mkey(mt); }
  AS.lbMark = lbMark;
  /* کارتِ کوچکِ صفحه: پس از هر نقاشیِ صفحهٔ مسئلهٔ بسته‌شده (کنارِ خلاصهٔ بازنگری) — نما و فیلدهای بخشِ مسئله دست نمی‌خورند */
  function lbCard(pid) {
    var m = lbMissing(pid); if (!m) return null; var x = m.x, both = m.miss.length > 1, opts = m.miss.indexOf("best") >= 0 ? lbOpts(pid) : [];
    var sel = opts.length ? h("select", { id: "lpRBest", "aria-label": LB_BEST_Q }, h("option", { value: "" }, "— انتخاب کن —"), opts.map(function (t, i) { return h("option", { value: String(i) }, clip(t, 160)); }), h("option", { value: "none" }, "هیچ‌کدام بیشتر از بقیه")) : null;
    var ta = m.miss.indexOf("taste") >= 0 ? h("textarea", { id: "lpRTaste", rows: "2", placeholder: "به حرفِ خودت" }) : null;
    /* INF7 (A ارتقای ۳ s01): «پیامِ کامل» کنارِ فهرست — پیامِ کاملِ دستیار که گزینهٔ برگزیده از آن آمد (همان منبعِ a38: A.liveChatQItems(pid)[i].src) */
    var full = sel ? h("div", { class: "card soft small lp-rfull", dir: "rtl", hidden: true }) : null;
    var showFull = function () { if (!full) return; var v = sel.value, I = []; try { I = A.liveChatQItems ? A.liveChatQItems(pid) : []; } catch (e) { }
      var e0 = /^\d+$/.test(v) ? I.filter(function (x) { return x && x.t; })[+v] : null; full.innerHTML = "";
      if (!e0 || !e0.src || !String(e0.src.text || "").trim()) { full.appendChild(h("p", {}, "اول یکی از پرسش‌ها را از فهرست برگزین — پیامِ کاملش این‌جا می‌آید.")); full.hidden = false; return; }
      var body = h("div", { class: "lp-rfulltext", style: { whiteSpace: "pre-wrap" } });
      (A.MATH && A.MATH.nodes ? A.MATH.nodes(e0.src.text) : [e0.src.text]).forEach(function (n) { body.appendChild(typeof n === "string" ? document.createTextNode(n) : n); });
      full.appendChild(h("p", { class: "muted" }, "پیامِ کاملِ دستیار" + (e0.src.at && A.fdate ? " (" + A.fdate(String(e0.src.at).slice(0, 10)) + ")" : "") + ":")); full.appendChild(body); full.hidden = false; };
    if (sel) sel.addEventListener("change", function () { if (!full.hidden) showFull(); });
    return h("div", { class: "card soft lp-lbrest", dir: "rtl" },
      h("strong", {}, both ? "بازنگری: دو پرسشِ باقی‌مانده" : "بازنگری: یک پرسشِ باقی‌مانده"),
      h("p", { class: "small muted" }, "این مسئله در گفت‌وگو بسته شد؛ " + (both ? "این دو پرسشِ بازنگری" : "این پرسشِ بازنگری") + " هنوز پاسخ نگرفته — " + (both ? "همان‌ها که" : "همان که") + " بازنگریِ صفحه هم می‌پرسد."),
      sel ? h("label", { for: "lpRBest", class: "small" }, LB_BEST_Q) : null, sel,
      sel ? h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm lp-rfullbtn", type: "button", onclick: function () { if (!full.hidden && full.getAttribute("data-for") === sel.value) { full.hidden = true; return; } full.setAttribute("data-for", sel.value); showFull(); } }, "پیامِ کامل")) : null, full,
      ta ? h("label", { for: "lpRTaste", class: "small" }, LB_TASTE_Q + " (سلیقه و خطِ کارِ خودت را بشناس، C120)") : null, ta,
      h("button", { class: "btn sm lp-lbrest-save", type: "button", onclick: function () {
        var o = {}, bad = [];
        if (sel) { var v = sel.value; if (v === "none") o.bestNone = true; else if (v !== "") o.bestQ = opts[+v]; }
        if (ta) { var t = txt0(ta.value); if (t && t.split(/\s+/).filter(Boolean).length < 2) bad.push("«" + LB_TASTE_Q.split(" — ")[0] + "» (دست‌کم دو واژه)"); else if (t) o.taste = t; }
        if (bad.length) { if (A.toast) A.toast("کامل نیست: " + bad.join("، "), "bad"); return; }
        var n = lbApply(x.b, x.L, o, null); if (!n.length) { if (A.toast) A.toast("پاسخی ننوشتی.", "bad"); return; }
        S.put(x.pg); if (A.toast) A.toast(n.join(" و ") + " ثبت شد."); A.render(); } }, "ثبتِ پاسخ‌های بازنگری"));
  }
  A.chatLookCard = lbCard;
  if (typeof A.render === "function" && !A.render._lbRest) {
    var rawRenderLB = A.render;
    A.render = function () {
      var out = rawRenderLB.apply(this, arguments);
      try { var st = A.state || {}; if ((st.view === "lprob" || st.view === "e_prob") && st.arg && A.liveRec && A.liveRec(st.arg) && !document.querySelector("#main .lp-lbrest")) {
        var sum = document.querySelector("#main .lp-lbsum"), cd = sum ? lbCard(st.arg) : null; if (cd) sum.parentNode.insertBefore(cd, sum.nextSibling); } } catch (e) { console.warn(e); }
      return out;
    };
    A.render._lbRest = true;
  }

  /* ---------- N2: قاعدهٔ کوتاهِ «🔭» همیشه (جز سشنِ بسته به مسئلهٔ باز) — پیشنهاد به معنا، نه به واژه؛ ساختن فقط با «آری» ِ خودش ---------- */
  var LIVE_COMPACT = "# 🔭 مسئلهٔ حل‌نشدهٔ خودم (قاعدهٔ کوتاه)\n- زمینه (نه پرسشِ دوم): «🔭 مسئلهٔ حل‌نشدهٔ خودم» جای مسئلهٔ واقعیِ بازِ خودِ کاربر است که پاسخش را نمی‌داند و رویش گیر کرده — پروژه یا پرسشِ پژوهشی/فکریِ طولانی، تصمیم، کارِ عملی — تا فهم، طرح، گام‌ها، مرور و بازنگری‌اش بماند و در «امروز» برگردد. اگر حرفش (به معنا، نه به واژه) از چنین چیزی است، یک بار در یک جملهٔ خبری پیشنهاد کن آن‌جا ثبتش کند؛ ساختن فقط با «آری» ِ خودش: {\"do\":\"live_new\",\"title\":\"…\",\"statement\":\"عینِ حرفِ خودش\",\"nat\":\"objective|practical|life\"} — هرگز خودکار.";

  /* ---------- N4: ضمیرِ گفت‌وگو (شما/تو) — از پیام‌های کاربر و دستیار؛ سشنِ تازهٔ بی‌نشانه از سشن‌های پیشینِ همین کاربر ---------- */
  var REG_SH_U = /(?:^|[\s«(،])(?:شما|خودتان|خودتون)(?![آ-ی‌])/;
  var PAST_ST = "کرد|برد|گفت|داشت|رسید|دید|آموخت|رفت|ماند|پرسید|یافت|نوشت|آزمود|دانست|توانست|خواست|گذاشت|ساخت|گرفت|خواند|سنجید|فهمید|کشید|شمرد|بود|آورد|انداخت|شنید|برگزید";
  var REG_SH_AI = new RegExp("(?:^|[\\s«(،])(?:ن?می[‌\\s][آ-ی]{2,10}ید|ن?(?:" + PAST_ST + ")ید|(?:" + PAST_ST + ")ه[‌\\s]?اید|دارید|هستید|شما|خودتان|کنارتان|یادتان|راهتان|حدستان|جوابتان|برایتان|[آ-ی]{2,}‌تان)(?![آ-ی‌])", "g");
  var REG_TO_AI = new RegExp("(?:^|[\\s«(،])(?:ن?می[‌\\s][آ-ی]{2,10}ی|ن?(?:" + PAST_ST + ")ی|(?:" + PAST_ST + ")ه[‌\\s]?ای|داری|هستی|خودت|کنارت|یادت|راهت|حدست|جوابت|برایت|[آ-ی]{2,}‌ات)(?![آ-ی‌])", "g");
  /* دورِ ۱۷ (RC1، C·V4 s27): ضمیرِ کاربر را مدل گزارش می‌دهد (coach_state.register، سنجیده با نشانه‌های خودِ پیام ⇒ s.coach.reg)؛ یک «شما» در پیامِ کاربر دیگر
     گفت‌وگو را «شما» نمی‌کند — پشتیبان فقط صورت‌های خودِ دستیار است (آنچه در گفت‌وگو جاری است). مسیرِ دورِ ۱۶: regInR16/regOfR16 (قرنطینه) */
  /* قرنطینه (تورِ پولیا RN6c، B·D7 s16o — REMOVAL_CANDIDATES): پشتیبان فقط صورت‌های خودِ دستیار را می‌شمرد — یک «می‌پرسید» ِ دستیار گفت‌وگو را «شما» می‌کرد */
  function regInR18(se) {
    var M = (se && se.msgs) || [], cr = se && se.coach && se.coach.reg; if (cr === "shoma" || cr === "to") return cr;
    var sh = 0, to = 0; M.forEach(function (m) { if (!m || m.role !== "ai") return; var t = ownText(m.text); sh += (t.match(REG_SH_AI) || []).length; to += (t.match(REG_TO_AI) || []).length; });
    return sh > to ? "shoma" : to > sh ? "to" : "";
  }
  /* شاهدِ ضمیرِ یک پیامِ کاربر برای پشتیبان (نه برای سنجشِ گزارشِ مدل): گفتهٔ نقل‌شده به دیگران («گفتم شما برید»)، فعلِ اول‌شخص («بکشم»، «بذارم») و «تو» ِ تنها
     (که بیشتر حرفِ اضافه است: «تو دریا») کنار می‌روند؛ ضمیرِ صریحِ «شما» کنارِ امرِ محاوره‌ای («شما که ماشینی، بگو») «شما» است، ولی کنارِ «خودت»/فعلِ «می…ی» نه */
  function fbSigns(t0) {
    var o = unq18(t0).replace(/(?:^|[\s،])(?:گفتم|گفت|گفتش|گفتن|گفته|میگه|می[‌\s]گه|می[‌\s]?گفت|بهش\s*گفتم|نوشته)(?![آ-ی‌])[^.!؟?\n]*/g, " ")
      .replace(/(?:^|[\s،])[آ-ی‌]{1,14}(?:م|یم|مون)(?![آ-ی‌])/g, " ").replace(/(?:^|[^آ-ی‌])تو(?![آ-ی‌])/g, " ");
    var sh = /(?:^|[^آ-ی‌])(?:شما|خودتان|خودتون|جنابعالی|حضرتعالی)(?![آ-ی‌])/.test(o) || SIGN_SH18.test(o), to = SIGN_TO18.test(o);
    var toStrong = to && /(?:^|[^آ-ی‌])(?:خودت|نظرت|برات|بهت|ن?می[‌\s]?[آ-ی]{1,10}ی|[آ-ی]{2,}(?:‌ات|ت)\s+(?:ن?می|چیه|رو\s|را\s))(?![آ-ی‌])/.test(o);
    return sh && (!to || !toStrong) ? "shoma" : to && !sh ? "to" : "";
  }
  /* RN6c: بی گزارشِ مدل، پشتیبان فقط صورت‌های خودِ کاربر را می‌خواند (همان شاهدهای ساختِ واژهٔ regSigns: «نگو»، «بپرس»، «صبر کن»، «باورت»، «بفرمایید»)؛
     حرفِ دستیار هرگز شاهد نیست. برابر یا بی‌شاهد ⇒ «» (همان که جاری است). */
  function regIn(se) {
    var M = (se && se.msgs) || [], cr = se && se.coach && se.coach.reg; if (cr === "shoma" || cr === "to") return cr;
    /* گفتهٔ نقل‌شده به دیگران («به بچه‌ها گفتم شما برید») شاهدِ ضمیرِ او با دستیار نیست — تا پایانِ همان جمله کنار می‌رود */
    var sh = 0, to = 0; M.forEach(function (m) { if (!isUser(m)) return; var g = fbSigns(m.text); if (g === "shoma") sh++; else if (g === "to") to++; });
    return sh > to ? "shoma" : to > sh ? "to" : "";
  }
  /* سشنِ تازهٔ بی‌نشانه: فقط سشن‌های پیشینی که به مسئله‌های همین پرامپت پیوند دارند (مسئلهٔ حل‌شدهٔ مرتبط در مرورِ بی‌نگاه، مسئلهٔ باز) — همان گفت‌وگویی که به آن ارجاع می‌شود */
  function regOfR16(s, mt) { return mt && REG_SH_U.test(ownText(mt)) ? "shoma" : ""; }   // قرنطینه (دورِ ۱۷): «شما» ِ تنها در پیامِ کاربر ⇒ «شما»
  function regOf(s, mt, pids) {
    var r0 = regIn(s); if (r0) return r0;
    pids = pids || []; if (!pids.length) return "";
    var last = function (x) { var M = x.msgs || []; return String((M[M.length - 1] || {}).at || x.at || ""); };
    var lsess = {}; pids.forEach(function (pid) { var r = A.liveRec && A.liveRec(pid); if (r && r.sess) lsess[r.sess] = 1; var L0 = ((S.get("eprog_" + pid) || {}).solve || {}).live || {}; if (L0.chat && L0.chat.sess) lsess[L0.chat.sess] = 1; });
    var prev = S.all("achat", function (x) { return x && (!s || x.id !== s.id) && (x.msgs || []).length && (lsess[x.id] || pids.indexOf(x.lprob) >= 0 || (x.lprobLog || []).some(function (e) { return e && pids.indexOf(e.p) >= 0; })); }).sort(function (a, b) { return last(b).localeCompare(last(a)); });
    for (var i = 0; i < prev.length; i++) { var r1 = regIn(prev[i]); if (r1) return r1; }
    return "";
  }
  AS.convRegister = regOf;
  var SH_IMP = { "بسنج": "بسنجید", "بگو": "بگویید", "بنویس": "بنویسید", "ببین": "ببینید", "بیازما": "بیازمایید", "بکش": "بکشید", "بخوان": "بخوانید", "بشمار": "بشمارید", "بساز": "بسازید", "برگرد": "برگردید", "بده": "بدهید", "بیندیش": "بیندیشید", "بپرس": "بپرسید", "کن": "کنید", "بکن": "بکنید" };
  var SH_POS = { "خودت": "خودتان", "یادت": "یادتان", "راهت": "راهتان", "حدست": "حدستان", "جوابت": "جوابتان", "طرحت": "طرحتان", "بازت": "بازتان", "حلت": "حلتان", "ذهنت": "ذهنتان", "برایت": "برایتان", "تو": "شما", "داری": "دارید", "هستی": "هستید", "نیستی": "نیستید", "کنی": "کنید" };
  /* دورِ ۱۷ (B·D5): ستاک‌های حالِ فعل — یک فهرست برای التزامی («بزنی» ⇒ «بزنید») و امری («بزن» ⇒ «بزنید»، «نزن»، «بزنش») — نه واژه‌به‌واژه */
  var STEMS = "زن|کن|گو|گوی|بین|دان|نویس|سنج|یاب|یازما|یازمای|پرس|شمار|ساز|گیر|خواه|کش|بر|ده|آور|یاور|رس|خوان|گرد|یندیش|گذار|ذار|فرست|یاموز|کوش|گشا|شنو|پوش|ریز|پذیر|ران|بند|چین|یفزا|توان|رو|خور|شو|یا|ینداز|نشان|سپار|بخش|پرداز|شناس";
  var SUBJ = STEMS;
  function impSh(w, pre, st, cl) { return pre + st + (/ا$/.test(st) || st === "گو" ? "یید" : "ید") + (cl || ""); }
  var B0 = "(?<![آ-ی‌])", E0 = "(?![آ-ی‌])";
  var SH_RX = [
    [new RegExp(B0 + "((?:بر|در|باز|فرا)?ن?می)([‌ ])([آ-ی]{2,12})ی‌(?:اش|ش)" + E0, "g"), "$1$2$3یدش"],
    [new RegExp(B0 + "((?:بر|در|باز|فرا)?ن?می)([‌ ])([آ-ی]{2,12})ی" + E0, "g"), "$1$2$3ید"],
    [new RegExp(B0 + "(ن?)(" + PAST_ST + ")ی" + E0, "g"), "$1$2ید"],
    [new RegExp(B0 + "(" + PAST_ST + ")ه([‌ ]?)ای" + E0, "g"), "$1ه$2اید"],
    [new RegExp(B0 + "([بن])(" + SUBJ + ")ی" + E0, "g"), "$1$2ید"],
    [new RegExp(B0 + "([بن])(" + STEMS + ")(ش)?" + E0, "g"), impSh],
    [new RegExp("([آ-ی])‌ات" + E0, "g"), "$1‌تان"],
    [new RegExp(B0 + "(" + Object.keys(SH_POS).join("|") + ")" + E0, "g"), function (w) { return SH_POS[w]; }],
    [new RegExp(B0 + "(" + Object.keys(SH_IMP).join("|") + ")" + E0, "g"), function (w) { return SH_IMP[w]; }]
  ];
  function toShoma(t) { var x = String(t || ""); SH_RX.forEach(function (p) { x = x.replace(p[0], p[1]); }); return x; }
  AS.toShoma = toShoma;
  /* فقط متنِ گیومهٔ سطحِ اول (پرسشِ صفحه)؛ گیومهٔ درونی (حرفِ خودِ کاربر، عنوانِ مسئله‌اش) دست نمی‌خورد */
  function quoteMap(l, fn) {
    var out = "", d = 0, buf = "";
    for (var i = 0; i < l.length; i++) { var ch = l.charAt(i);
      if (ch === "«") { if (d === 1) { out += fn(buf); buf = ""; } d++; out += ch; continue; }
      if (ch === "»" && d > 0) { if (d === 1) { out += fn(buf); buf = ""; } d--; out += ch; continue; }
      if (d === 1) buf += ch; else out += ch; }
    return out + (d === 1 ? fn(buf) : buf);
  }
  var REG_LINE = /\*\*پرسشِ این نوبت همین است|در این نوبت فقط \*\*یک\*\* پرسش|پیشنهادِ این نوبت|پرسشِ پیشنهادیِ این نوبت|(?:^|[^آ-ی])بپرس(?![آ-ی])/;
  var REG_RULE = "ضمیرِ گفت‌وگو (شما/تو) را عوض نکن";

  /* ---------- N5: درخواستِ صریحی که دستیار عقب انداخت («رد نمی‌کنم، ولی اول …»، «بعداً») قولی در سشن است تا داده شود یا خودِ کاربر ردش کند ---------- */
  var REQ_RE = /(?:^|[\s،])(?:بده|بدید|بدین|بدهید|بنویس|بنویسید|بنویسین|بساز|بسازید|بفرست|بفرستید|آماده\s*کن|درست\s*کن|خلاصه\s*کن|تهیه\s*کن)(?![آ-ی‌])/;
  var ANSREQ_RE = /جواب|پاسخ|راه[‌\s]?حل/;
  var DEFER_STRONG = /رد\s*نمی[‌\s]?کنم|بعداً|(?:^|[\s،])بعدا(?![آ-ی])|بگذار(?:یم)?\s*برای\s*(?:وقتی|بعد)|به\s*وقتش|سراغش\s*می[‌\s]?(?:رویم|ریم|آییم)/;
  var DEFER_WEAK = /(?:ولی|اما)\s*اول(?![آ-ی])|(?:^|[\s.،])اول\s+[^.؟?!\n]{2,80}?[\s،](?:بعد|سپس)(?![آ-ی])/;
  var DECLINE_RE = /نمی[‌\s]?خوا(?:م|هم)(?:ش)?(?![آ-ی])|لازم\s*نیست|نیازی\s*نیست|بی[‌\s]?خیال/;
  /* جمله‌ها — مرزِ جمله درونِ گیومه («چی رو می‌خوایم پیدا کنیم؟») نیست */
  /* قرنطینه (تورِ پولیا RN1 — REMOVAL_CANDIDATES): جمله را در نقطهٔ اعشار هم می‌برید («باز ۳.۶۷ میشه.» ⇒ «۶۷ میشه.») */
  function sentsOfR18(t) { var x = String(t || ""), out = [], cur = "", d = 0;
    for (var i = 0; i < x.length; i++) { var ch = x.charAt(i); cur += ch; if (ch === "«") d++; else if (ch === "»" && d > 0) d--; else if (!d && /[.!؟?\n]/.test(ch)) { out.push(cur); cur = ""; } }
    if (cur) out.push(cur); return out.map(function (y) { return y.trim(); }).filter(Boolean); }
  /* RN1: نقطهٔ میانِ دو رقم («۳.۶۷»، «3.67») اعشار است، نه مرزِ جمله */
  function sentsOf(t) { var x = String(t || ""), out = [], cur = "", d = 0, DG = /[0-9۰-۹٠-٩]/;
    for (var i = 0; i < x.length; i++) { var ch = x.charAt(i); cur += ch; if (ch === "«") d++; else if (ch === "»" && d > 0) d--;
      else if (!d && /[.!؟?\n]/.test(ch)) { if (ch === "." && i > 0 && DG.test(x.charAt(i - 1)) && DG.test(x.charAt(i + 1))) continue; out.push(cur); cur = ""; } }
    if (cur) out.push(cur); return out.map(function (y) { return y.trim(); }).filter(Boolean); }
  /* دورِ ۱۷ (RC1، D·6 s32، B pr2): «درخواستی که عقب افتاد» را مدل گزارش می‌دهد (coach_state.defer {what}، سنجیده با پیام‌های کاربر ⇒ s.promises)؛
     الگوی «بعداً/ولی اول» + فعلِ امری فقط **می‌پرسد** (promAsk، بی ذخیره). promScanR16 = مسیرِ ذخیره‌کنندهٔ دورِ ۱۶ (قرنطینه). */
  function promScan(s, mt) {
    if (!s) return []; var M = s.msgs || [], P = s.promises = s.promises || [];
    var later = M.filter(isUser).map(function (m) { return { at: String(m.at || ""), t: String(m.text || "") }; }).concat(mt ? [{ at: "~", t: String(mt) }] : []);
    P.forEach(function (pr) { if (pr.done) return; var tk = tokN(pr.ask);
      if (later.some(function (m) { return m.at > pr.at && DECLINE_RE.test(ownText(m.t)) && tokN(m.t).some(function (w) { return tk.indexOf(w) >= 0; }); })) { pr.done = true; pr.how = "declined"; pr.doneAt = nowIso(); } });
    return P.filter(function (x) { return !x.done; });
  }
  /* پشتیبانِ پرسنده: فقط آخرین پاسخِ دستیار؛ اگر آن نوبت گزارشِ defer داشت، خاموش */
  function promAsk(s) {
    var M = (s && s.msgs) || [], ai = -1; for (var i = M.length - 1; i >= 0; i--) { if (M[i] && M[i].role === "ai") { ai = i; break; } if (isUser(M[i])) break; }
    if (ai < 0) return ""; var m = M[ai], at = String(m.text || ""); if ((s.promises || []).some(function (x) { return x.at === String(m.at || ""); })) return "";
    var strong = DEFER_STRONG.test(at), weak = !strong && DEFER_WEAK.test(at); if (!strong && !weak) return "";
    var u = null; for (var j = ai - 1; j >= 0; j--) if (isUser(M[j])) { u = M[j]; break; } if (!u) return "";
    return sentsOf(u.text).filter(function (x) { var o = ownText(x); return REQ_RE.test(o) && !ANSREQ_RE.test(o) && !ONLY_ANS_RE.test(o); })[0] || "";
  }
  function promScanR16(s, mt) {
    if (!s) return []; var M = s.msgs || [], P = s.promises = s.promises || [], seen = String(s.promSeen || "");
    for (var i = 0; i < M.length; i++) { var m = M[i]; if (!m || m.role !== "ai" || !(String(m.at || "") > seen)) continue; seen = String(m.at || "");
      var at = String(m.text || ""), strong = DEFER_STRONG.test(at), weak = !strong && DEFER_WEAK.test(at); if (!strong && !weak) continue;
      var u = null; for (var j = i - 1; j >= 0; j--) if (isUser(M[j])) { u = M[j]; break; } if (!u) continue;
      var ask = sentsOf(u.text).filter(function (x) { var o = ownText(x); return REQ_RE.test(o) && !ANSREQ_RE.test(o) && !ONLY_ANS_RE.test(o); })[0] || (strong ? sentsOf(u.text).filter(function (x) { return /[؟?]\s*$/.test(x) && !ONLY_ANS_RE.test(x); }).pop() : "");
      if (!ask) continue;
      if (!P.some(function (x) { return nrmSt(x.ask) === nrmSt(ask); })) P.push({ id: "pr" + (P.length + 1), ask: clip(ask, 200), at: String(m.at || ""), done: false });
    }
    s.promSeen = seen;
    var later = M.filter(isUser).map(function (m) { return { at: String(m.at || ""), t: String(m.text || "") }; }).concat(mt ? [{ at: "~", t: String(mt) }] : []);
    P.forEach(function (pr) { if (pr.done) return; var tk = tokN(pr.ask);
      if (later.some(function (m) { return m.at > pr.at && DECLINE_RE.test(ownText(m.t)) && tokN(m.t).some(function (w) { return tk.indexOf(w) >= 0; }); })) { pr.done = true; pr.how = "declined"; pr.doneAt = nowIso(); } });
    return P.filter(function (x) { return !x.done; });
  }
  AS.promises = promScan;
  /* {"do":"promise_done","id":"pr1"} — درخواستِ عقب‌افتاده داده شد (یا خودش گفت نمی‌خواهد) */
  AS.DO.promise_done = function (a) {
    var s = AS._turnSession, P = (s && s.promises) || [], id = a && (a.id || a.what), pr = P.filter(function (x) { return !x.done && (x.id === id || (id && nrmSt(x.ask).indexOf(nrmSt(id)) >= 0)); })[0];
    if (!pr) return "درخواستِ بازِ «" + clip(id || "", 40) + "» در این سشن نیست";
    pr.done = true; pr.how = (a && a.how) || "honoured"; pr.doneAt = nowIso(); return "";
  };

  /* ---------- N6: برنامه/آزمایشِ تاریخ‌دار یا تکراریِ خودش ⇒ پیشنهادِ پیگیری با همان کنشِ deadline («امروز» و یادآور همان موعدهاست) ---------- */
  var WD = "شنبه|یکشنبه|دوشنبه|سه[‌\\s]?شنبه|چهارشنبه|پنج[‌\\s]?شنبه|جمعه";
  var PLAN_WHEN = new RegExp("هر\\s*(?:روز|هفته|جلسه|بار|شب|صبح|ماه|" + WD + ")(?![آ-ی‌])|(?:^|[\\s،])(?:" + WD + "|فردا|پس[‌\\s]?فردا)(?![آ-ی‌])|هفته(?:ٔ|ی|‌ی)?\\s*(?:بعد|دیگه|دیگر|آینده)(?![آ-ی‌])|از\\s*این\\s*هفته");
  var PLAN_ME = /(?:^|[\s،])(?:می[‌\s][آ-ی]{2,12}م|ب[آ-ی]{2,12}م|قراره|تصمیم\s*گرفتم)(?![آ-ی‌])/;
  var WD_N = { "شنبه": 6, "یکشنبه": 0, "دوشنبه": 1, "سهشنبه": 2, "چهارشنبه": 3, "پنجشنبه": 4, "جمعه": 5 };
  function planDate(t) {
    var td = A.today(), x = String(t || "").replace(/[‌\s]+(?=شنبه)/g, "");
    if (/پس[‌\s]?فردا/.test(t)) return A.addDays(td, 2);
    if (/هر\s*(?:روز|شب|صبح)(?![آ-ی‌])|(?:^|[\s،])فردا(?![آ-ی‌])/.test(t)) return A.addDays(td, 1);
    var m = /(یکشنبه|دوشنبه|سهشنبه|چهارشنبه|پنجشنبه|جمعه|شنبه)(?![آ-ی‌])/.exec(x);
    if (m) { var p = td.split("-"), d0 = new Date(+p[0], +p[1] - 1, +p[2]).getDay(), k = (WD_N[m[1]] - d0 + 7) % 7; return A.addDays(td, k === 0 ? 7 : k); }
    return A.addDays(td, 7);
  }
  function planOf(s, mt) {
    var t = ownText(String(mt || "")); if (!t || /^\[سامانه/.test(t)) return null;
    var sent = sentsOf(mt).filter(function (x) { var o = ownText(x); return !/[؟?]\s*$/.test(x) && PLAN_WHEN.test(o) && PLAN_ME.test(o); })[0];
    if (!sent) return null;
    if (S.all("deadline", function (x) { return !x.done && /^پیگیری/.test(String(x.what || "")) && s && x.sess === s.id; }).length) return null;
    return { sent: sent.replace(/[«»]/g, ""), date: planDate(ownText(sent)) };
  }

  /* ---------- پالایهٔ دورِ ۱۶ (پس از پالایهٔ اصلی): قاعدهٔ کوتاهِ 🔭، سلیقهٔ بازنگریِ ناتمام، قول‌ها، پیگیریِ برنامه، و ضمیرِ گفت‌وگو ---------- */
  AS.promptFilters.push(function (outs, s, msg) {
    var out = outs.slice(), mt = String(msg || "").trim(), auto = /^\[سامانه/.test(mt), CTX = "- زمینه (نه پرسشِ دوم): ";
    var b = AS.boundLive(s), bOpen = b && !b.done;
    if (!bOpen && !auto) out.push(LIVE_COMPACT);
    if (!auto && TASTE_RE.test(ownText(mt))) {
      var noT = chatClosed().filter(function (x) { var m = lbMissing(x.r.p.id); return m && m.miss.indexOf("taste") >= 0; });
      var pick = noT.filter(function (x) { return s && (x.L.chat || {}).sess === s.id; }); if (!pick.length && noT.length) pick = [noT[noT.length - 1]];
      if (pick.length) out.push("# سلیقه برای بازنگریِ ناتمام (C120)\n" + pick.map(function (x) { var id = x.r.p.id;
        return CTX + "شاید از سلیقه‌اش گفت و بازنگریِ «" + clip(x.r.p.title, 70) + "» (" + id + "، در گفت‌وگو بسته شد) هنوز «سلیقه» ندارد — اگر حرفش واقعاً سلیقهٔ خودش دربارهٔ نوعِ مسئله است (نه «نمی‌دانم»، آرزو، نیاز یا گفتهٔ دیگری)، عینِ حرفش را با {\"do\":\"chat_lookback\",\"pid\":\"" + id + "\",\"taste\":\"عینِ حرفش\"} نگه دار (همان «سلیقه‌ات» ِ بازنگریِ صفحه)؛ «نمی‌دانم» ⇒ {\"do\":\"coach_state\",\"taste\":\"unknown\"} (ثبت نمی‌شود)."; }).join("\n"));
    }
    var P = !auto ? promScan(s, mt) : [];
    if (P.length) out.push("# درخواست‌های عقب‌افتادهٔ کاربر (قولِ همین سشن)\n" + P.map(function (pr) {
      return CTX + "خودش خواست «" + clip(pr.ask, 160).replace(/[«»]/g, "") + "» و تو آن را عقب انداختی — گم نشود: وقتی کارِ پیش از آن تمام شد همان را بده، یا اگر دیگر به کارش نمی‌آید صادقانه بگو چرا؛ پس از دادنش یا اگر خودش گفت نمی‌خواهد {\"do\":\"promise_done\",\"id\":\"" + pr.id + "\"}."; }).join("\n"));
    /* دورِ ۱۷ (RC1): درخواستِ عقب‌افتاده‌ای که مدل گزارش نکرد — فقط پرسشِ شرطی، بی ذخیره */
    var pa = !auto ? promAsk(s) : "";
    if (pa) out.push("# درخواستِ عقب‌افتاده (پشتیبان، شاید)\n" + CTX + "پاسخِ قبلی‌ات شاید چیزی را که خودش خواست («" + clip(pa, 140).replace(/[«»]/g, "") + "») عقب انداخت — اگر چنین است و هنوز نداده‌ای، گم نشود: {\"do\":\"coach_state\",\"defer\":{\"what\":\"عینِ خواسته‌اش\"}} را گزارش کن و به وقتش بده؛ اگر همان‌جا دادی یا خواسته‌ای نبود، این سطر را نادیده بگیر.");
    /* دورِ ۱۷ (RC1، A·D1 s01، D·5 s32/s34): «برنامهٔ خودش» را مدل گزارش می‌دهد (coach_state.plan) و صفحه می‌سنجد (planSeen ⇐ s.plans)؛ الگوی زمان + فعلِ
       اول‌شخص فقط می‌پرسد «اگر برنامهٔ خودش است…» — نه ادعا، نه ذخیره. پیگیری موعدی نیست که خودش گفته باشد؛ با «آری» ِ او موعدِ خودش می‌شود (قاعدهٔ deadline). */
    var pr = !auto ? planSeen(s) : null, pl = !auto && !pr ? planOf(s, mt) : null;
    var prG = pr && !pr.onGuess && s && s.coach && s.coach.guess && s.coach.guess.key === pr.key ? s.coach.guess.text : "";
    /* RM5c (C·W5 s22): برنامه‌ای که بر حدسِ هنوز نیازموده تکیه دارد ⇒ پیشنهادِ «اول حدس را بیازما»، نه پیگیریِ همان کار (on_guess ِ مدل)؛ حدس و برنامه در یک پیام
       بی گزارشِ on_guess ⇒ همان، شرطی (پیشنهاد/پرسش، نه حکم) */
    if (pr && pr.onGuess) out.push("# پیگیریِ برنامهٔ خودش\n" + CTX + "کاری که گفت (" + pr.id + ": «" + clip(pr.text, 160).replace(/[«»]/g, "") + "») بر حدسی تکیه دارد که هنوز نیازموده" + (s.coach && s.coach.guess && s.coach.guess.text ? " («" + clip(s.coach.guess.text, 80).replace(/[«»]/g, "") + "»)" : "") + " — پیگیریِ همان کار را پیشنهاد نکن؛ به‌جایش یک بار در یک جملهٔ خبری پیشنهاد کن «اول حدس را بیازما» (کدام مشاهدهٔ ارزان حدس را رد یا تأیید می‌کند)؛ این پیشنهاد پرسشِ دوم نیست.");
    else if (pr && prG) out.push("# پیگیریِ برنامهٔ خودش\n" + CTX + "برنامه‌اش (" + pr.id + ": «" + clip(pr.text, 160).replace(/[«»]/g, "") + "») و حدسش («" + clip(prG, 80).replace(/[«»]/g, "") + "») در یک پیام آمدند — اگر آن کار بر همین حدس تکیه دارد، پیگیری را پیشنهاد نکن و به‌جایش «اول حدس را بیازما» را یک بار در یک جملهٔ خبری پیشنهاد کن؛ وگرنه پیگیری را یک بار پیشنهاد کن (نخستین بار " + pr.when + ")؛ «آری» ِ او موعدِ خودش است: {\"do\":\"deadline\",\"what\":\"پیگیری: …\",\"date\":\"" + pr.when + "\"}؛ این پرسشِ دوم نیست.");
    else if (pr) out.push("# پیگیریِ برنامهٔ خودش\n" + CTX + "برنامهٔ خودش را گفت (" + pr.id + ": «" + clip(pr.text, 160).replace(/[«»]/g, "") + "» — با گزارشِ تو و سنجیده با حرفِ خودش): اگر پیگیری‌اش را هنوز یک بار در یک جملهٔ خبری پیشنهاد نکرده‌ای، پیشنهاد کن در «امروز» بیاید (نخستین بار " + pr.when + (A.fdate ? "، " + A.fdate(pr.when) : "") + ")؛ «آری» ِ او موعدِ خودش است: {\"do\":\"deadline\",\"what\":\"پیگیری: …\",\"date\":\"" + pr.when + "\"}؛ این پیشنهاد پرسشِ دوم نیست.");
    else if (pl) out.push("# پیگیریِ برنامهٔ خودش (پشتیبان، شاید)\n" + CTX + "در پیامش زمان و فعلِ اول‌شخص هست («" + clip(pl.sent, 160) + "») — فقط اگر کاری است که خودش از این پس قصد دارد بکند (نه گلایه از عادت یا شکستِ تکراری، نه موعدی که زیرِ آن است، نه گفتهٔ دیگری یا آرزوی مبهم — این را تو داوری کن): {\"do\":\"coach_state\",\"plan\":{\"text\":\"عینِ حرفش\",\"when\":\"YYYY-MM-DD\"}} را گزارش کن و پیگیری را یک بار در یک جملهٔ خبری پیشنهاد کن (نخستین بار " + pl.date + (A.fdate ? "، " + A.fdate(pl.date) : "") + ")؛ «آری» ِ او موعدِ خودش است: {\"do\":\"deadline\",\"what\":\"پیگیری: …\",\"date\":\"" + pl.date + "\"}. وگرنه دربارهٔ پیگیری چیزی نگو؛ این پرسشِ دوم نیست.");
    if (!auto && s) {
      var pidsIn = (out.join("\n").match(/\((pb_[A-Za-z0-9_]+)\)/g) || []).map(function (x) { return x.slice(1, -1); });
      var rg = regOf(s, mt, pidsIn), ci = -1; out.forEach(function (x, j) { if (ci < 0 && /(?:^|\n)# مربیِ حل/.test(x)) ci = j; });
      if (rg === "shoma") out = out.map(function (x) { return x.split("\n").map(function (l) { return REG_LINE.test(l) ? quoteMap(l, toShoma) : l; }).join("\n"); });
      var rl = CTX + REG_RULE + (rg === "shoma" ? " — این گفت‌وگو با «شما» است؛ پرسش‌های صفحه را هم با «شما» بگو (یادتان، راهتان، می‌گویید)." : rg === "to" ? " — این گفت‌وگو با «تو» است." : " — همان که در گفت‌وگو جاری است.");
      if (ci >= 0) out[ci] = out[ci] + "\n" + rl; else if (rg) out.push("# ضمیرِ گفت‌وگو\n" + rl);
    }
    return out;
  });

  /* ================= دورِ ۱۷ ِ تورِ پولیا (سهمِ «coach»، DECISIONS_R17 RC1/RC3/RC4/RC5) — ریشه، نه نشانه =================
     داوری‌های معنایی («برنامهٔ خودش» یا گلایه؟ درخواستِ عقب‌افتاده یا پرسش؟ سلیقه یا «نمی‌دانم»؟ ضمیرِ او؟ حدس؟ وارسی در کدام پیام‌ها؟) دیگر کارِ الگو نیست:
     مدل در coach_state گزارش می‌دهد، صفحه با متنِ خودِ کاربر می‌سنجد و فقط آن‌گاه عمل می‌کند (experiences/model-reports-state-page-validates.md).
     الگوها فقط پشتیبانِ پرسنده‌اند (سطرِ شرطیِ «اگر…»)، هرگز ذخیره نمی‌کنند. */
  var CTX17 = "- زمینه (نه پرسشِ دوم): ";
  /* نقل در متن: پس از یکسان‌سازی (رقمِ فارسی، نیم‌فاصله، فاصله، نشانه‌ها) زیررشته، یا همهٔ واژه‌های معنادارش (دست‌کم دو) در همان پیام */
  function qNorm(t) { return faDigits(String(t || "")).replace(/ك/g, "ک").replace(/ي/g, "ی").replace(/[−–—]/g, "-").replace(/[ً-ٰٟ‌\s«»"“”'.,،؛:!؟?…()\[\]{}]/g, "").toLowerCase(); }
  function quoteIn(q, t) {
    var a = qNorm(q); if (!a) return false; if (qNorm(t).indexOf(a) >= 0) return true;
    var qa = tokN(q), tb = tokN(t); return qa.length >= 2 && qa.every(function (w) { return tb.indexOf(w) >= 0; });
  }
  AS.quoteIn = quoteIn;
  function lastUserMsg(s) { var M = (s && s.msgs) || []; for (var i = M.length - 1; i >= 0; i--) if (isUser(M[i])) return M[i]; return null; }
  function prevUserMsg(s) { var M = (s && s.msgs) || [], n = 0; for (var i = M.length - 1; i >= 0; i--) if (isUser(M[i]) && ++n === 2) return M[i]; return null; }
  function realDate(d) { if (!/^\d{4}-\d{2}-\d{2}$/.test(String(d || ""))) return false; var p = d.split("-"), x = new Date(+p[0], +p[1] - 1, +p[2]); return x.getFullYear() === +p[0] && x.getMonth() === +p[1] - 1 && x.getDate() === +p[2]; }
  function txtOf(v) { return typeof v === "string" ? v : v && typeof v === "object" ? String(v.text || v.what || v.g || "") : ""; }
  /* ضمیرِ خودِ پیام (بی متنِ نقل‌شده): «شما» ⇐ شما/خودتان/جنابعالی یا فعلِ دومِ‌شخصِ جمع؛ «تو» ⇐ تو (نه «تو این…» ِ حرفِ اضافه)، خودت، فعلِ دومِ‌شخصِ مفرد، امر */
  var SIGN_SH = /(?:^|[^آ-ی‌])(?:شما|خودتان|خودتون|جنابعالی|حضرتعالی|سرکار|(?:ن?می[‌\s][آ-ی]{2,10}|[بن][آ-ی]{1,10}|[آ-ی]{2,10}[دت])(?:ید|ین))(?![آ-ی‌])/;
  /* قرنطینه (تورِ پولیا RM6a — docs/overhaul/REMOVAL_CANDIDATES.md): فهرستِ بستهٔ دورِ ۱۷ ِ نشانه‌های «تو» (فقط امرِ پیشونددار؛ «ثبت کن»، «کمک کن»،
     «باورت»، «میگی» بی نیم‌فاصله و «مطمئنی» را نمی‌شناخت و گزارشِ درستِ مدل را رد می‌کرد) */
  var SIGN_TO = /(?:^|[^آ-ی‌])(?:تو(?!\s*(?:این|اون|آن|همین|همون|کتاب|خونه|کلاس|ذهنم|دلم))|خودت|نظرت|راهت|حدست|جوابت|برات|بهت|ازت|باهات|داری|هستی|ن?می[‌\s][آ-ی]{2,10}ی|[بن](?:گو|بین|کن|زن|ده|یا|رو|خوان|نویس|گیر|شین)|وایسا)(?![آ-ی‌])/;
  function unq18(t) { return String(t || "").replace(/«[^»]*»|"[^"\n]*"|“[^”]*”/g, " "); }
  function regSignsR17(t) { var o = unq18(t); return { sh: SIGN_SH.test(o), to: SIGN_TO.test(o) }; }
  /* RM6a: نشانه‌های ضمیر از ساختِ واژه، نه فهرستِ بسته — «تو»: فعلِ دومِ‌شخصِ مفرد (می‌…ی، «میگی» بی نیم‌فاصله)، صفت/اسم + «ی» ِ پرسشی («مطمئنی؟»)،
     ضمیرِ پیوستهٔ «ـت/ـات» پیش از فعل («باورت میشه»)، امرِ بی «ـید» از ستاکِ فعل (همان ستاک‌های مبدلِ «شما»)، امرِ مرکب («ثبتش کن»، «کمک کن»)؛
     «شما»: «ـید/ـین» ِ دومِ‌شخصِ جمع (بی پیشوند هم: «ثبت کنید»، «کمکم کنین»). متنِ نقل‌شده («…») و حرفِ خودِ دستیار هرگز شاهد نیست. */
  var IMP_V = "کن|بکن|بده|بزن|بگیر|بگو|بنویس|بفرست|بساز|بخون|بخوان|بیار|بذار|بگذار|ببین|بکش|بپرس|بیا|برو|بمون|بچین";
  var SIGN_TO18 = new RegExp("(?:^|[^آ-ی‌])(?:ن?می[‌\\s]?[آ-ی]{1,10}ی|[آ-ی]{2,}ی(?=\\s*[؟?])|[آ-ی]{2,}(?:‌ات|ت)(?=\\s+(?:ن?می[‌\\s]?شه|ن?می[‌\\s]?شود|چیه|چیست|کجاست|رو\\s|را\\s))|[بن](?:" + STEMS + "|نداز)(?:ش|م|مون|شون)?|[آ-ی]{2,}(?:ش|م|مون)?\\s+(?:" + IMP_V + ")(?:ش)?)(?![آ-ی‌])");
  var SIGN_SH18 = /(?:^|[^آ-ی‌])(?:(?:ن?می[‌\s]?|[بن])?(?:کن|ده|گ|زن|گیر|بین|خوان|نویس|فرما|فرمای|دار|کش|ساز|فرست|گذار|ذار|یار)(?:ید|ین))(?![آ-ی‌])/;
  function regSigns(t) { var o = unq18(t), r = regSignsR17(t); return { sh: r.sh || SIGN_SH18.test(o), to: r.to || SIGN_TO18.test(o) }; }
  AS.regSigns = regSigns;
  /* حدس روی مسئلهٔ تکراری‌ای که همین نوبت به آن پیوند خورد (فقط اگر هنوز حدسی ندارد — حدسِ صفحه‌اش دست نمی‌خورد) */
  function guessToProblem(s, pid, g) {
    var pg = S.get("eprog_" + pid); if (!pg || !g) return ""; var so = pg.solve = pg.solve || {}; so.g = so.g || {};
    if (so.g[1] && so.g[1].guess) return "";
    so.g[1] = { guess: clip(g, 300), conf: null, test: "", testRes: "", ifRef: "", before: true, seen: false, at: nowIso(), from: "chat", sess: (s && s.id) || "", by: "model" }; S.put(pg);
    return "؛ حدست («" + clip(g, 60) + "») حدسِ همان مسئله ثبت شد — هنوز حدس است تا بیازمایی‌اش";
  }
  /* RC4: پیام‌های وارسی — فقط پیام‌های کاربر در همین سشن، از پیامی که صورتِ همین مسئله را آورد به بعد؛ پیامی که «جواب» ِ دیگری را وارسی کرد پذیرفته نیست */
  /* قرنطینه (RM6e — REMOVAL_CANDIDATES): پنجره از **آخرین** پیامی که شبیهِ صورت بود — پیامِ بعدیِ «سه تا ساختم…» با گونه‌های مسئله پنجره را پس از پیام‌های وارسی برد (s31) */
  function chkWindowR17(s, st) {
    var M = ((s && s.msgs) || []).filter(isUser), i0 = 0;
    if (st) for (var i = M.length - 1; i >= 0; i--) { var t = M[i].text; if (quoteIn(st, t) || sameStmt(t, st)) { i0 = i; break; } }
    return M.slice(i0);
  }
  /* RM6e: پنجره از پیامی که مسئله را آورد (نخستین پیامِ کاربر با همین صورت؛ اگر نبود، از ساختِ رکوردِ مسئله در همین سشن) */
  function chkWindow(s, st, rec) {
    var M = ((s && s.msgs) || []).filter(isUser), i0 = -1;
    if (st) for (var i = 0; i < M.length; i++) if (quoteIn(st, M[i].text)) { i0 = i; break; }   // پیامی که خودِ صورت را آورد
    if (st && i0 < 0) for (var k = M.length - 1; k >= 0; k--) if (sameStmt(M[k].text, st)) { i0 = k; break; }   // وگرنه بازگوییِ آن (واژه‌های متمایز)
    if (i0 < 0 && rec && rec.created && s && rec.sess === s.id) { var c0 = String(rec.created); for (var j = 0; j < M.length; j++) if (String(M[j].at || "") >= c0) { i0 = j; break; } }
    return M.slice(Math.max(0, i0));
  }
  function chkMsgsOk(s, msgs, st, sol) {
    var W = chkWindow(s, st), all = ((s && s.msgs) || []).filter(isUser), out = [];
    (Array.isArray(msgs) ? msgs : []).forEach(function (x) {
      var m = null;
      if (typeof x === "number" || /^\d+$/.test(String(x))) { var u = all[+x - 1]; m = u && W.indexOf(u) >= 0 ? u : null; }
      else if (String(x || "").trim().length >= 2) m = W.filter(function (u) { return quoteIn(String(x), u.text); })[0] || null;
      if (!m) return;
      var ans = /(?:جواب|پاسخ)[^0-9۰-۹.؟?!\n]{0,12}([0-9۰-۹]+(?:[.٫][0-9۰-۹]+)?)/.exec(String(m.text || ""));
      if (ans && sol && dataNums(sol).length && dataNums(sol).indexOf(faDigits(ans[1]).replace("٫", ".")) < 0) return;   // وارسیِ جوابِ رهاشده
      if (out.indexOf(m) < 0) out.push(m);
    });
    return out;
  }
  var LIGHT = /^(?:کرد|کن|شد|بود|هست|دار|دیگه|دیگر|خیلی|بعد|اون|همون|هم|چیز)/;
  function chkVerdict(s, b, a, st) {
    if (!b) return; var C = (s && s.coach) || {}, um = lastUserMsg(s), key = um ? mkey(um.text) : "";
    var msgs = a && (a.checkMsgs || a.check_msgs), rep = C.checkRep && C.checkRep.key === key ? C.checkRep : null;
    var ok = msgs ? chkMsgsOk(s, msgs, st, a.solution) : rep ? chkMsgsOk(s, rep.msgs, st, a.solution) : null;
    if (ok && ok.length) { b.verdict = "verified"; b.chkRes = "نتیجه سالم ماند"; b.chkBy = "msgs"; b.chkMsgs = ok.map(function (m) { return clip(m.text, 160); }); return; }
    if (!(a && a.check)) { b.verdict = "unverified"; b.chkBy = "none"; return; }
    /* پشتیبان: هم‌پوشانی فقط «شاید» — هیچ واژهٔ معنادارِ مشترکی در پیام‌های همین مسئله ⇒ «وارسی نشد» (چیزی برای سنجیدن نیست، نه داوریِ هم‌پوشانی) */
    var tk = tokN(a.check).filter(function (w) { return !LIGHT.test(w); }), any = chkWindow(s, st).some(function (m) { var u = tokN(m.text); return tk.some(function (w) { return u.indexOf(w) >= 0; }); });
    if (any) { b.verdict = "maybe"; b.chkBy = "overlap"; b.chkRes = "نتیجه سالم ماند — به گزارشِ گفت‌وگو؛ از پیام‌های خودت هنوز سنجیده نشد"; }
    else { b.verdict = "unverified"; b.chkBy = "none"; }
  }
  function verdictR16(s, own, a) { return own && a.check && userWrote(s, a.check) ? "verified" : "unverified"; }   // قرنطینه (دورِ ۱۷، RC4)
  /* coach_state.check که پس از chat_solved ِ همین نوبت (یا دیرتر) می‌رسد: حکمِ مسئلهٔ بسته‌شدهٔ همین سشن به‌روز می‌شود */
  function chkLate(s, ok) {
    var mine = chatClosed().filter(function (x) { return (x.L.chat || {}).sess === s.id; }).pop(); if (!mine || !ok.length) return;
    var b = mine.b; if (b.verdict === "verified") return;
    var W = chkWindow(s, mine.r.p.statement, mine.r), ok2 = ok.filter(function (m) { return W.indexOf(m) >= 0; }); if (!ok2.length) return;
    b.verdict = "verified"; b.chkRes = "نتیجه سالم ماند"; b.chkBy = "msgs"; b.chkMsgs = ok2.map(function (m) { return clip(m.text, 160); }); S.put(mine.pg);
  }
  /* RC5: پرسش‌های بازنگری که خودِ دستیار پرسید (هر صورتی از آن) — جملهٔ پرسشی (با «؟») در پیامِ دستیار */
  var LB_ASK = {
    best: /(?:کدام|کدوم)[^؟?.!\n]{0,30}(?:پرسش|سؤال|سوال)[^؟?.!\n]{0,40}(?:کمک|راهگشا|یاری|به\s*کار|به\s*درد|مفید)|(?:پرسش|سؤال|سوال)[^؟?.!\n]{0,40}(?:کدام|کدوم)[^؟?.!\n]{0,30}(?:کمک|راهگشا|یاری|به\s*کار|به\s*درد|مفید)/,
    taste: /(?:چه\s*(?:جور|نوع|مدل)|(?:کدام|کدوم)\s*(?:نوع|مدل|جور)|این\s*(?:نوع|جور|مدل))[^؟?.!\n]{0,50}(?:دوست|خوش|به\s*دل|لذت|چطور\s*بود|جذاب)|سلیقه/ };
  function aiAsked(t, k) { return String(t || "").split(/(?<=[؟?])|\n+/).some(function (x) { return /[؟?]\s*$/.test(x.trim()) && LB_ASK[k].test(x); }); }
  AS.lbAiAsked = aiAsked;
  /* پنجرهٔ هر مسئله: از پاسخِ دستیار که بستنش را آورد تا بستنِ مسئلهٔ بعدی در همین سشن */
  function closeAt(s, x) { var C = (s && s.coach) || {}, c = C.lbClose && C.lbClose[x.r.p.id]; if (c) return c; var ca = String((x.L.chat || {}).at || ""), M = s.msgs || [], v = "";
    M.forEach(function (m) { if (m && m.role === "ai" && (m.actions || []).indexOf("chat_solved") >= 0 && String(m.at || "") <= ca) v = String(m.at || ""); }); return v || ca; }
  function askedByAi(s, pid, k) {
    var mine = chatClosed().filter(function (x) { return (x.L.chat || {}).sess === s.id; }), me = mine.filter(function (x) { return x.r.p.id === pid; })[0]; if (!me) return false;
    var a0 = closeAt(s, me), a1 = mine.map(function (x) { return closeAt(s, x); }).filter(function (t) { return t > a0; }).sort()[0] || "~";
    return (s.msgs || []).some(function (m) { var t = String((m && m.at) || ""); return m && m.role === "ai" && t >= a0 && t < a1 && aiAsked(m.text, k); });
  }
  AS.lbAskedByAi = askedByAi;
  /* پیامِ کاربر خودش پاسخِ «کدام پرسش کمک کرد؟» است؟ (پشتیبانِ پرسنده — فقط پرسشِ نوبت را جابه‌جا می‌کند و سطرِ «اگر… نگه دار» می‌آورد؛ ذخیره با گزارشِ مدل) */
  var USER_BEST = /(?:پرسش|سؤال|سوال|همون|همان)[^.؟?!\n]{0,60}(?:کمک(?:م)?\s*(?:کرد|کردی)|به\s*کارم|به\s*دردم|راهگشا)/;
  /* «برنامهٔ خودش» ِ گزارش‌شده برای پیامِ پیشینِ کاربر (همان نوبتی که مدل گزارشش را داد) */
  /* قرنطینه (تورِ پولیا RM5b — REMOVAL_CANDIDATES): برنامه را با پیامِ پیشینِ کاربر جفت می‌کرد هر چقدر هم گذشته بود (s34: پیشنهادِ «۲۰۲۶-۱۰-۱۸» در روزِ ۱۰-۲۱) */
  function planSeenR17(s) { var pu = prevUserMsg(s); if (!pu) return null; var k = mkey(pu.text); return ((s && s.plans) || []).filter(function (x) { return x && !x.done && x.key === k; }).pop() || null; }
  /* RM5a/b: پیشنهادِ پیگیری فقط برای برنامهٔ باز، گزارش‌شده همین امروز، با موعدِ امروز یا آینده (نه «سشنِ بعد») — و فقط در نوبتِ پس از گزارش */
  function planSeen(s) { var pu = prevUserMsg(s); if (!pu) return null; var k = mkey(pu.text), td = A.today();
    return ((s && s.plans) || []).filter(function (x) { return x && planOpen(x) && x.key === k && (x.d || td) === td && x.when !== "next-session" && String(x.when) >= td; }).pop() || null; }
  /* اعتبارسنجی و کارِ فیلدهای تازه */
  function csExtra(s, a) {
    var um = lastUserMsg(s); if (!um) return; var ut = String(um.text || ""), key = mkey(ut), C = s.coach = s.coach || {}, at = String(um.at || nowIso());
    // plan {text, when}
    var pt = txtOf(a.plan);
    if (pt && quoteIn(pt, ut)) plan19(s, a.plan, pt, key, at);   // تورِ پولیا (RM5 + RN2d پیوندِ گام): plan18 درونش؛ RM5): چرخهٔ عمرِ برنامه — planR17 (قرنطینه) مسیرِ پیشین است
    if (a.plan_done) planDone18(s, a.plan_done);
    // defer {what} — خواستهٔ خودِ کاربر در همین سشن، عقب‌افتاده در همین پاسخ
    var dw = txtOf(a.defer);
    if (dw && ((s.msgs || []).filter(isUser).slice(-6).some(function (m) { return quoteIn(dw, m.text); }))) {
      var ai = null; for (var i = (s.msgs || []).length - 1; i >= 0; i--) if (s.msgs[i] && s.msgs[i].role === "ai") { ai = s.msgs[i]; break; }
      var P = s.promises = s.promises || []; if (!P.some(function (x) { return !x.done && qNorm(x.ask) === qNorm(dw); })) P.push({ id: "pr" + (P.length + 1), ask: clip(dw, 200), at: String((ai && ai.at) || at), done: false, by: "model" }); }
    // taste {text} | "unknown"
    if (a.taste !== undefined && a.taste !== null && a.taste !== "") {
      var tt = txtOf(a.taste), unk = /^(?:unknown|نامعلوم|نمی‌دانم|\?)$/i.test(String(tt).trim());
      var noT = chatClosed().filter(function (x) { var m = lbMissing(x.r.p.id); return m && m.miss.indexOf("taste") >= 0; });
      var pick = noT.filter(function (x) { return (x.L.chat || {}).sess === s.id; }).pop() || noT[noT.length - 1];
      if (pick && unk) { C.lbUnk = C.lbUnk || {}; C.lbUnk[pick.r.p.id + "|taste"] = key; }
      else if (pick && tt && quoteIn(tt, ut)) { var n = lbApply(pick.b, pick.L, { taste: tt }, s); if (n.length) S.put(pick.pg); }
    }
    // register «تو»|«شما» — فقط اگر نشانه‌اش در خودِ پیام هست
    var rv = String(a.register || ""), rk = /^(?:شما|shoma)$/i.test(rv) ? "shoma" : /^(?:تو|to)$/i.test(rv) ? "to" : "";
    /* RM6a: گزارشِ مدل پذیرفته است وقتی پیامِ خودش شاهدِ همان ضمیر را دارد؛ شاهدِ ضمیرِ دیگر به‌تنهایی ردش می‌کند؛ بی هیچ شاهدی ضمیرِ جاری عوض نمی‌شود */
    if (rk) { var sg = regSigns(ut), own = rk === "shoma" ? sg.sh : sg.to; if (own) { C.reg = rk; C.regAt = at; } }
    // guess {text}
    var gt = txtOf(a.guess);
    if (gt && quoteIn(gt, ut)) { C.guess = { text: clip(gt, 300), key: key, at: at }; guessReg(s, gt, key, at);   // RN2d: شناسهٔ حدس برای پیوندِ on_guess
      /* تورِ پولیا (RM4b): حدس روی پیامِ دستیارِ همین نوبت (m.guess) با «q» — همان پرسشی از همین پیام که حدس را می‌آزماید، عیناً زیررشتهٔ آن پیام؛
         «(حدسِ تو: …)» فقط روی گزینه‌ای که از همان q ساخته شد می‌نشیند (سمتِ a38). q ِ ناموجود یا ساختگی ⇒ m.guess بی q (هیچ یادداشتی). guessMsgR17 = مسیرِ پیشین */
      var gq = a.guess && typeof a.guess === "object" ? String(a.guess.q || "").trim() : "";
      for (var gi = (s.msgs || []).length - 1; gi >= 0; gi--) if (s.msgs[gi] && s.msgs[gi].role === "ai") { var mg = { text: clip(gt, 300) }; if (gq && qInMsg18(gq, s.msgs[gi].text)) mg.q = clip(gq, 400); s.msgs[gi].guess = mg; break; }
      if (C.dupPend && C.dupPend.key === key) guessToProblem(s, C.dupPend.pid, gt);
      /* RM4c (C·W6 s24): حدسِ سنجیده دربارهٔ مسئلهٔ زندهٔ بازی که سشن به آن بسته است ⇒ حدسِ همان مسئله (solve.g)، مثلِ مسیرِ chat_invent؛ حدسِ موجودِ صفحه دست نمی‌خورد */
      else { var bl18 = AS.boundLive(s); if (bl18 && !bl18.done && bl18.pid) guessToProblem(s, bl18.pid, gt); } }
    /* step {step, done, what?, match?} — نتیجهٔ گامِ مسئلهٔ زنده‌ای که در گفت‌وگو گزارش کرد ⇒ A.liveStepReport (a38 می‌سنجد: گامِ باز از همین مسئله، پیامِ خودِ کاربر،
       نه قصدِ آینده)؛ پیام = همین پیامِ کاربر (شمارهٔ ۱‌پایه) مگر مدل نقلِ عینیِ پیامِ دیگری را داد */
    if (a.step && typeof a.step === "object" && A.liveStepReport) { var bl19 = AS.boundLive(s), spid = (bl19 && bl19.pid) || s.lprob || "";
      if (spid) { var nU = (s.msgs || []).filter(function (m) { return m && m.role === "user"; }).length, so19 = Object.assign({}, a.step); if (so19.msg == null || so19.msg === "") so19.msg = nU;
        try { var t19 = nowIso(); C.stepRep = { key: key, res: String(A.liveStepReport(spid, so19, s.id) || "") };
          if (/^✓/.test(C.stepRep.res)) { var st19 = stepTouched(spid, t19); if (st19) C.stepRep.act = "lstep:" + spid + ":" + st19.id; } } catch (e) { } } }
    /* RN2d: guess_res {id|text, res: refuted|confirmed} — سرانجامِ حدسی که پیش‌تر گفت، وقتی همین پیامش نتیجهٔ آزمودنش را می‌گوید (حدسِ ثبت‌شدهٔ همین سشن؛ پیامِ واقعی، نه «آره») */
    var gr = a.guess_res && typeof a.guess_res === "object" ? a.guess_res : null, grr = gr && /^(?:refuted|confirmed)$/.test(String(gr.res || "")) ? String(gr.res) : "";
    if (grr && realReply(ut) && tokN(ownText(ut)).length >= 2) { var G19 = C.guesses || [], gx = G19.filter(function (g) { return g.id === String(gr.id || ""); })[0] || G19.filter(function (g) { return gr.text && (quoteIn(String(gr.text), g.text) || quoteIn(g.text, String(gr.text))); })[0];
      if (gx && gx.key !== key) { gx.res = grr; gx.resAt = at; gx.resKey = key; } }
    // check {msgs:[…]}
    var ck = a.check && typeof a.check === "object" ? a.check.msgs : null;
    if (Array.isArray(ck)) { var mine = chatClosed().filter(function (x) { return (x.L.chat || {}).sess === s.id; }).pop();
      C.checkRep = { key: key, msgs: ck.slice(0, 12) }; if (mine) chkLate(s, chkMsgsOk(s, ck, mine.r.p.statement, (mine.L.chat || {}).solution || "")); }
    try { S.put(s); } catch (e) { }
  }
  AS.coachStateExtra = csExtra;
  if (!AS.DO.coach_state._r17) {
    var rawCS17 = AS.DO.coach_state;
    AS.DO.coach_state = function (a) {
      var s = AS._turnSession; if (!s || !a || typeof a !== "object") return "";
      try { csExtra(s, a); } catch (e) { console.warn(e); }
      var core = ["ph", "said", "ans", "stuck", "fail", "role", "nat"].some(function (k) { return k in a; });
      if (!core) return "";
      var a2 = Object.assign({}, a); if (a2.check && typeof a2.check === "object") delete a2.check;
      return rawCS17.call(this, a2);
    };
    AS.DO.coach_state._r17 = true;
  }
  /* بستن در گفت‌وگو: لحظهٔ بستن (پاسخِ دستیارِ همان نوبت) برای پنجرهٔ پرسش‌های بازنگری */
  if (!AS.DO.chat_solved._r17) {
    var rawSolved17 = AS.DO.chat_solved;
    AS.DO.chat_solved = function (a) {
      var s = AS._turnSession, out = rawSolved17.apply(this, arguments);
      try { if (s && a) { var st = clip(a.statement, 1500), r = A.liveAll ? A.liveAll().filter(function (x) { return sameProblem(x, st, clip(a.title || st, 80)); }).pop() : null;
        var ai = null; for (var i = (s.msgs || []).length - 1; i >= 0; i--) if (s.msgs[i] && s.msgs[i].role === "ai") { ai = s.msgs[i]; break; }
        if (r && ai) { var C = s.coach = s.coach || {}; C.lbClose = C.lbClose || {}; if (!C.lbClose[r.p.id]) C.lbClose[r.p.id] = String(ai.at || ""); S.put(s); } } } catch (e) { }
      return out;
    };
    AS.DO.chat_solved._r17 = true;
  }
  /* RC3: یک منبعِ راستی برای وجهِ هر کنش — قاعدهٔ بلندِ «🔭» (بخشِ مسئله یا پشتیبانِ این‌جا) خودش «ثبتش کن» نمی‌گوید و به قاعدهٔ کوتاه ارجاع می‌دهد */
  var LIVE_REF = "ساختنش (live_new) فقط طبقِ «🔭 مسئلهٔ حل‌نشدهٔ خودم (قاعدهٔ کوتاه)» است";
  function liveRef(x) {
    if (!/^# مسئلهٔ واقعیِ حل‌نشده/.test(x)) return x;
    return x.split("\n").map(function (l) {
      if (!/live_new/.test(l) || l.indexOf(LIVE_REF) >= 0) return l;
      return l.replace(/،?\s*با\s*\{\\?"do\\?":\\?"live_new\\?"[^}]*\}\s*ثبتش\s*کن(?:\s*و\s*)?/, "، " + LIVE_REF + "؛ پس از ساختن، ").replace(/ثبتش\s*کن(?![آ-ی])/g, "طبقِ قاعدهٔ کوتاه ثبت شود");
    }).join("\n");
  }
  AS.liveRuleRef = liveRef;
  AS.R16_QUARANTINE = { dupLink: dupLinkR16, promScan: promScanR16, regOf: regOfR16, verdict: verdictR16 };
  /* سطرِ «گزارشِ وضع ِ همه‌جا»: فیلدهای تازهٔ coach_state در هر نوبت (نه فقط مربی) — در قلاب، نه SYS */
  var STATE_X = "# گزارشِ وضع (همهٔ نوبت‌ها)\n" + CTX17 + "در actions یک {\"do\":\"coach_state\",…} با این فیلدها بده — هر کدام **فقط** وقتی در آخرین پیامِ کاربر هست، و متن را عیناً از حرفِ خودش نقل کن (صفحه با پیامش می‌سنجد؛ نقلِ ساختگی رد می‌شود): " +
    "plan {\"text\":\"…\",\"when\":\"YYYY-MM-DD\"} = کاری که خودش از این پس قصد دارد بکند با زمانش (نه گلایه از عادت، نه موعدی که زیرش است، نه گفتهٔ دیگری)؛ قولِ بی‌تاریخ به خودش («دیگه … نمی‌کنم»، «از این به بعد …») ⇒ \"when\":\"next-session\"؛ اگر همان برنامهٔ پیشین را دوباره گفت ⇒ \"same\":\"plN\"؛ اگر آن کار بر حدسی تکیه دارد که هنوز نیازموده ⇒ \"on_guess\":true؛ اگر همان گامی از مسئلهٔ زنده‌اش است ⇒ \"step\":\"شمارهٔ ۱‌پایهٔ گام\"؛ plan_done {\"id\":\"plN\",\"done\":true|false} = وقتی خودش گفت برنامه‌اش را انجام داد یا نداد؛ defer {\"what\":\"…\"} = آنچه خودش از تو خواست و تو در همین پاسخ عقب انداختی (نه پرسشِ خودت، نه آنچه همین حالا دادی)؛ " +
    "taste {\"text\":\"…\"} = سلیقه‌اش دربارهٔ نوعِ مسئله، یا \"unknown\" اگر گفت نمی‌داند؛ register \"تو\"|\"شما\" = ضمیری که خودش با تو به کار برد؛ guess {\"text\":\"…\",\"q\":\"…\"} = مقدار/فرمول/ادعایی که به‌عنوانِ شاید درست پیش گذاشت، و q = همان جمله‌ای از همین پاسخِ خودت که این حدس را می‌آزماید، عیناً (اگر چنین جمله‌ای نیست، q نده)؛ check {\"msgs\":[\"تکه‌ای عینی از هر پیامِ خودش که وارسی در آن است\"]} = هنگامِ بستن؛ step {\"step\":\"شمارهٔ ۱‌پایه یا متنِ گام\",\"done\":\"yes|part|no\",\"what\":\"…\",\"match\":\"yes|part|no\"} = وقتی گفت گامی از مسئلهٔ زنده‌اش را انجام داد، تاحدی، یا نداد (نه قصدِ آینده)؛ result \"…\" = همراهِ said:[\"result\"]، عینِ نتیجه‌ای که در همین پیامش گفت (نتیجه‌ای که در پیامش نیست رد می‌شود)؛ guess_res {\"id\":\"gN\",\"res\":\"refuted|confirmed\"} = وقتی همین پیامش نتیجهٔ آزمودنِ حدسی را می‌گوید که پیش‌تر گفته بود؛ " +
    "retract {\"msg\":\"تکه‌ای عینی از پیامِ پیشینِ خودش که اصلاح می‌کند\",\"what\":\"guess|plan|step|ans|said|fact|form\",\"fix\":\"عینِ مقدارِ درست از همین پیامش\",\"old\":\"(اختیاری) همان بخشِ نادرست درونِ msg\"} = فقط وقتی خودش حرفِ پیشینِ خودش را اصلاح می‌کند («اشتباه گفتم/نوشتم»، «منظورم … بود»، «نه، … درسته»، «اون … رو اصلاح کن») — نه کارِ بیرونی که اشتباه کرد، نه ایده‌ای تازه، نه اشتباهِ دیگری یا تو؛ صفحه می‌سنجد و هر چه از آن پیام ثبت شده بود برمی‌گرداند و درست را می‌نشاند (پیشین در تاریخچه می‌ماند).";
  AS.COACH_STATE_X = STATE_X;
  AS.promptFilters.push(function (outs, s, msg) {
    var out = outs.slice(), mt = String(msg || "").trim(), auto = /^\[سامانه/.test(mt);
    var hasRules = false; out = out.map(function (x) { if (/^# مسئلهٔ واقعیِ حل‌نشده/.test(x)) { hasRules = true; return liveRef(x); } return x; });
    if (hasRules && out.indexOf(LIVE_COMPACT) < 0) out.push(LIVE_COMPACT);
    if (auto || !s) return out;
    out.push(STATE_X);
    /* RC5: پرسشِ بازنگری‌ای که دستیار در پاسخِ پیشین پرسید و او حالا پاسخ می‌دهد ⇒ «اگر پاسخ است، نگه دار» (ثبت با گزارشِ مدل) */
    try { var M = s.msgs || [], lastAi = null; for (var i = M.length - 1; i >= 0; i--) { if (M[i] && M[i].role === "ai") { lastAi = M[i]; break; } }
      var Lr = [];
      chatClosed().filter(function (x) { return (x.L.chat || {}).sess === s.id; }).forEach(function (x) { var pid = x.r.p.id, m = lbMissing(pid); if (!m) return;
        ["best", "taste"].forEach(function (k) { if (m.miss.indexOf(k) < 0) return;
          var asked = !!lastAi && aiAsked(lastAi.text, k) && askedByAi(s, pid, k), self = k === "best" && USER_BEST.test(mt);
          if ((asked && realReply(mt)) || self) Lr.push(CTX17 + (asked ? "پرسیده بودی " + (k === "best" ? "«کدام پرسش کمک کرد؟»" : "«سلیقه»") : "شاید گفت کدام پرسش کمکش کرد") + " (بازنگریِ «" + clip(x.r.p.title, 60) + "»، " + pid + ") — اگر همین پیام پاسخش است، با {\"do\":\"chat_lookback\",\"pid\":\"" + pid + "\",\"" + (k === "best" ? "bestQ\":\"همان پرسشی که خودش گفت" : "taste\":\"عینِ حرفش") + "\"} نگه دار" + (k === "taste" ? "؛ «نمی‌دانم» ⇒ {\"do\":\"coach_state\",\"taste\":\"unknown\"} (ثبت نمی‌شود)" : "") + "؛ دوباره پرسیدنش لازم نیست."); }); });
      if (Lr.length) out.push("# پاسخ به پرسشِ بازنگری (شاید)\n" + Lr.join("\n"));
    } catch (e) { }
    return out;
  });

  /* ================= تورِ پولیا، دستهٔ ۱ — سازوکارهای ریشه‌ای (سهمِ «coach»: RM1 a b c e، RM4 b c، RM5، RM6 a c f g، RM2 d؛ INF4، INF5) =================
     همان اصل: مدل گزارش می‌دهد، صفحه با دادهٔ خودِ کاربر می‌سنجد؛ الگو فقط پیشنهاد می‌کند یا می‌پرسد، هرگز ذخیره نمی‌کند. */
  var CTX18 = "- زمینه (نه پرسشِ دوم): ";
  function plainTx(x) { return A.MATH && A.MATH.toPlain ? A.MATH.toPlain(String(x == null ? "" : x)) : String(x == null ? "" : x); }
  /* q ِ حدس: عیناً زیررشتهٔ همان پیامِ دستیار (پس از یکسان‌سازیِ فاصله/نیم‌فاصله؛ نشانهٔ پرسشِ پایانی اختیاری) */
  function wsN(t) { return String(t || "").replace(/[‌\s]+/g, " ").replace(/[؟?.!]+\s*$/, "").trim(); }
  function qInMsg18(q, t) { var a = wsN(q); if (a.length < 4) return false; return wsN(t).indexOf(a) >= 0 || (qNorm(a).length >= 6 && qNorm(t).indexOf(qNorm(a)) >= 0); }
  AS.guessQInMsg = qInMsg18;
  /* ---------- RM5: چرخهٔ عمرِ برنامه — open | done | notdone | expired ---------- */
  function planOpen(x) { return !!x && !x.done && (x.state || "open") === "open"; }
  function plansAll(s) { var out = [], seen = {};
    var add = function (x) { if (!x || seen[x.id]) return; seen[x.id] = 1; (x.plans || []).forEach(function (pl) { if (pl) out.push({ p: pl, s: x }); }); };
    if (s) add(s); S.all("achat").forEach(add); return out; }
  AS.plansAll = plansAll;
  function planDate18(t) { var x = String(t || ""), td = A.today();
    if (/(?:^|[\s،])(?:امروز|امشب|همین\s*الان)(?![آ-ی‌])/.test(x)) return td;
    if (/آخرِ?\s*(?:همین\s*)?هفته/.test(x)) { var p0 = td.split("-"), d0 = new Date(+p0[0], +p0[1] - 1, +p0[2]).getDay(); return A.addDays(td, (5 - d0 + 7) % 7); }
    return planDate(x); }
  function plan18(s, o, pt, key, at) {
    var td = A.today(), w = String((o && typeof o === "object" && o.when) || "");
    var when = /^next[-_ ]?session$/i.test(w) ? "next-session" : realDate(w) ? (w >= td ? w : "") : planDate18(pt);
    if (!when) return;   // تاریخِ گذشته هرگز پیشنهاد نمی‌شود
    var AP = plansAll(s), sm = o && o.same ? AP.filter(function (x) { return x.p.id === String(o.same); })[0] : null;
    if (sm) return;   // همان برنامه که دوباره گفت — نه برنامهٔ دوم، نه پیشنهادِ دوباره
    if (AP.some(function (x) { var q = x.p; return (q.d || "") === td && (qNorm(q.text) === qNorm(pt) || (x.s === s && (quoteIn(q.text, pt) || quoteIn(pt, q.text)))); })) return;   // همان متن در همان روز (در همین سشن: هر کدام درونِ دیگری)
    var PL = s.plans = s.plans || [], og = o && typeof o === "object" && (o.on_guess === true || o.on_guess === "true");
    PL.push({ id: "pl" + (AP.length + 1), text: clip(pt, 300), when: when, at: at, d: td, key: key, done: false, state: "open", sess: s.id, onGuess: og || undefined });
  }
  function planDoneR18(s, pd) {
    var id = typeof pd === "string" ? pd : pd && (pd.id || pd.plan), ok = !(pd && typeof pd === "object" && (pd.done === false || pd.done === "false"));
    var x = plansAll(s).filter(function (y) { return y.p.id === String(id || "") && !(y.p.state === "done" || y.p.state === "notdone"); })[0]; if (!x) return;
    x.p.done = true; x.p.state = ok ? "done" : "notdone"; x.p.doneAt = nowIso(); if (x.s !== s) try { S.put(x.s); } catch (e) { }
  }
  /* برنامه‌ای که موعدش گذشت (یا قولِ بی‌تاریخِ سشنِ پیش): یک بار «انجام شد؟»؛ پرسیده و بی پاسخ در نوبتِ بعد ⇒ expired (دیگر پرسیده نمی‌شود) */
  function plansDueR18(s, mt) {
    var td = A.today(), k0 = mkey(mt), out = [];
    plansAll(s).forEach(function (x) { var q = x.p; if (!planOpen(q)) return;
      if (q.askKey && q.askKey !== k0) { q.state = "expired"; q.expiredAt = nowIso(); if (x.s !== s) try { S.put(x.s); } catch (e) { } return; }
      var due = q.when === "next-session" ? q.sess && q.sess !== s.id : String(q.when) < td;
      if (!due) return;
      if (!q.askKey) { q.askKey = k0; q.askD = td; q.askSess = s.id; if (x.s !== s) try { S.put(x.s); } catch (e) { } }
      out.push(q); });
    return out;
  }
  /* ---------- RN2d (تورِ پولیا، دورِ ۱۹): یک کار، یک وضع — برنامه ⇄ گامِ زنده و برنامه ⇄ حدس ----------
     برنامه‌ای که مدل گفت همان گامِ مسئلهٔ زنده است (plan.step، یا plan.same با شناسه/شمارهٔ گام؛ یا متنِ عیناً همان گام) وضعش را از همان گام می‌گیرد (دادهٔ a38، خوانده
     نه نوشته)؛ برنامه‌ای که بر حدسی تکیه دارد (on_guess) با رد یا تأییدِ همان حدس «برای بازنگری بسته» است (نه «انجام شد؟»). «انجام شد؟» هرگز برای کاری که ثبت شده. */
  function lsteps(pid) { var L = ((((S.get("eprog_" + pid) || {}).solve) || {}).live) || {}; return L.steps || []; }
  function stepRef(pid, ref) {
    var St = lsteps(pid), k = String(ref == null ? "" : ref).trim(); if (!k) return null;
    var byId = St.filter(function (x) { return x && x.id === k; })[0]; if (byId) return byId;
    var m = /^(?:s|step|گام\s*)?([0-9۰-۹]+)$/i.exec(k); if (m) return St[+faDigits(m[1]) - 1] || null;
    if (k.length >= 3) { var nk = qNorm(k); return St.filter(function (x) { var nx = qNorm(x && x.text); return nx && (nx === nk || (nk.length >= 6 && (nx.indexOf(nk) >= 0 || nk.indexOf(nx) >= 0))); })[0] || null; }
    return null;
  }
  function stepTouched(pid, since) { var best = null, bt = ""; lsteps(pid).forEach(function (st) { var t = [String((st.chatRep || {}).at || ""), String((st.out || {}).at || "")].sort().pop(); if (t && t >= since && t > bt) { bt = t; best = st; } }); return best; }
  function stepDone(st) { var o = st && st.out && !st.out.auto && st.out.done ? st.out : st && st.chatRep && st.chatRep.done ? st.chatRep : null; return o ? o.done : ""; }
  function sessPid(s) { try { var bl = AS.boundLive(s); if (bl && bl.pid) return bl.pid; } catch (e) { } return (s && s.lprob) || ""; }
  /* حدس‌های سنجیدهٔ سشن با شناسه (g1، g2…) — برای پیوندِ on_guess */
  function guessReg(s, gt, key, at) { var C = s.coach = s.coach || {}, G = C.guesses = C.guesses || [], ex = G.filter(function (g) { return qNorm(g.text) === qNorm(gt); })[0];
    if (ex) return ex; var g = { id: "g" + (G.length + 1), text: clip(gt, 300), key: key, at: at }; G.push(g); return g; }
  function guessOfPlan(x) { var q = x.p, G = ((x.s.coach || {}).guesses) || []; if (q.guessId) return G.filter(function (g) { return g.id === q.guessId; })[0] || null;
    var same = G.filter(function (g) { return g.key === q.key; }).pop(); if (same) return same;
    return G.filter(function (g) { return String(g.at || "") <= String(q.at || "~"); }).pop() || null; }
  function guessFate(x, g) {
    if (!g) return ""; if (g.res) return g.res;
    var s = x.s, pids = {}; [sessPid(s), s.lprob].concat((s.lprobLog || []).map(function (e) { return e && e.p; })).forEach(function (p) { if (p) pids[p] = 1; });
    try { (A.liveAll ? A.liveAll() : []).forEach(function (r) { if (r && r.sess === s.id) pids[r.p.id] = 1; }); } catch (e) { }
    var out = "";
    Object.keys(pids).some(function (pid) { var so = (S.get("eprog_" + pid) || {}).solve || {}, L = so.live || {}, g1 = so.g && so.g[1];
      return [g1].concat(L.guessHist || []).some(function (c) { if (!c || !c.guess || !(quoteIn(g.text, c.guess) || quoteIn(c.guess, g.text))) return false;
        if (c.refutedAt || c.refuted || c.hit === "نادرست بود") { out = "refuted"; return true; }
        if (c.proved || c.hit === "درست بود") { out = "confirmed"; return true; }
        if (c === g1) { var rel = ""; (L.steps || []).forEach(function (st) { var gg = st && st.out && st.out.guess; if (gg && (!c.since || String(st.out.at) > c.since) && (gg.rel === "refute" || gg.rel === "confirm")) rel = gg.rel; });
          if (rel) { out = rel === "refute" ? "refuted" : "confirmed"; return true; } }
        return false; }); });
    return out;
  }
  /* وضعِ مؤثرِ برنامه از پیوندهایش (یک بار نوشته می‌شود تا «امروز»، پرامپت و کارنامه یکی بخوانند) */
  function planSync(x) {
    var q = x.p; if (!planOpen(q)) return q.state || "open";
    if (q.step && q.step.pid) { var d = stepDone(stepRef(q.step.pid, q.step.id)); if (d) { q.done = true; q.state = d === "no" ? "notdone" : "done"; q.doneAt = nowIso(); q.via = "step"; if (x.s) try { S.put(x.s); } catch (e) { } return q.state; } }
    if (q.onGuess) { var f = guessFate(x, guessOfPlan(x)); if (f) { q.state = "review"; q.guessFate = f; q.reviewAt = nowIso(); if (x.s) try { S.put(x.s); } catch (e) { } return q.state; } }
    return "open";
  }
  AS.planSync = planSync;
  function plan19(s, o, pt, key, at) {
    var n0 = (s.plans || []).length; plan18(s, o, pt, key, at);
    var AP = plansAll(s), q = (s.plans || []).length > n0 ? s.plans[s.plans.length - 1] : (o && o.same ? (AP.filter(function (x) { return x.p.id === String(o.same); })[0] || {}).p : null);
    var pid = sessPid(s), ref = o && typeof o === "object" ? (o.step != null && o.step !== "" ? o.step : (o.same && !/^pl\d+$/i.test(String(o.same)) ? o.same : null)) : null;
    if (!q && ref != null && pid) {   // «same» = شناسهٔ گام (نه برنامه): برنامه همان گام است — برنامهٔ تازه با پیوند
      var st0 = stepRef(pid, ref); if (st0) { var PL = s.plans = s.plans || []; q = { id: "pl" + (AP.length + 1), text: clip(pt, 300), when: "", at: at, d: A.today(), key: key, done: false, state: "open", sess: s.id, step: { pid: pid, id: st0.id } }; PL.push(q); }
    }
    if (!q || !pid) return;
    if (!q.step) { var st = ref != null ? stepRef(pid, ref) : lsteps(pid).filter(function (x) { return x && qNorm(x.text) && qNorm(x.text) === qNorm(q.text); })[0]; if (st) q.step = { pid: pid, id: st.id }; }
  }
  function planDone18(s, pd) {
    var id = typeof pd === "string" ? pd : pd && (pd.id || pd.plan), ok = !(pd && typeof pd === "object" && (pd.done === false || pd.done === "false"));
    var x = plansAll(s).filter(function (y) { return y.p.id === String(id || "") && !(y.p.state === "done" || y.p.state === "notdone"); })[0]; if (!x) return;
    x.p.done = true; x.p.state = ok ? "done" : "notdone"; x.p.doneAt = nowIso(); if (x.s !== s) try { S.put(x.s); } catch (e) { }
    /* RN2d/RN3c: همان کار ⇒ گامِ پیوسته هم همین وضع (از راهِ a38، با پیامِ خودش)؛ انجام‌شده ⇒ یک موفقیتِ اجرا با شناسهٔ همان کار */
    var um = lastUserMsg(s), act = x.p.step ? "lstep:" + x.p.step.pid + ":" + x.p.step.id : "pl:" + x.p.id;
    if (x.p.step && A.liveStepReport && um) { try { var nU = (s.msgs || []).filter(function (m) { return m && m.role === "user"; }).length; A.liveStepReport(x.p.step.pid, { step: x.p.step.id, done: ok ? "yes" : "no", msg: nU }, s.id); } catch (e) { } }
    if (ok && um && !(s.coach && s.coach.teach)) coachEv(s, "c", "chatok", String(um.text || ""), true, { how: "plan_done", act: act });
  }
  /* «انجام شد؟» فقط برای برنامهٔ بازِ بی‌پیوندِ حل‌شده؛ برنامهٔ on_guess با حدسِ هنوز نیازموده ⇒ «اول حدس را بیازما» (نه «انجام شد؟») */
  function plansDue(s, mt) {
    var td = A.today(), k0 = mkey(mt), out = [];
    plansAll(s).forEach(function (x) { var q = x.p; if (planSync(x) !== "open") return;
      if (q.snooze && String(q.snooze) > td) return;
      if (q.askKey && q.askKey !== k0) { q.state = "expired"; q.expiredAt = nowIso(); if (x.s !== s) try { S.put(x.s); } catch (e) { } return; }
      var due = q.when === "next-session" ? q.sess && q.sess !== s.id : !!q.when && String(q.when) < td;
      if (!due) return;
      if (q.onGuess) { if (q.gAskKey && q.gAskKey !== k0) return; if (!q.gAskKey) { q.gAskKey = k0; if (x.s !== s) try { S.put(x.s); } catch (e) { } } var g = guessOfPlan(x); out.push(Object.assign({}, q, { guessWait: g ? g.id + ": «" + clip(g.text, 80).replace(/[«»]/g, "") + "»" : "—" })); return; }
      if (!q.askKey) { q.askKey = k0; q.askD = td; q.askSess = s.id; if (x.s !== s) try { S.put(x.s); } catch (e) { } }
      out.push(q); });
    return out;
  }
  AS.plansDue = plansDue;
  /* یک تپِ «امروز» (INF10): همان وضعِ برنامه که plan_done ِ گفت‌وگو می‌نویسد؛ «هنوز نه» ⇒ باز می‌ماند، تا فردا پنهان، و دست‌کم یک بارِ دیگر پرسیده می‌شود (نه بیشتر) */
  function planTap(pid, v) {
    var x = plansAll(null).filter(function (y) { return y.p.id === pid; })[0]; if (!x || !planOpen(x.p)) return false; var q = x.p;
    if (v === "notyet") { q.notYet = (q.notYet || 0) + 1; delete q.askKey; delete q.askD; delete q.askSess; q.snooze = A.addDays(A.today(), 1); q.notYetAt = nowIso(); }
    else { q.done = true; q.state = v === "done" ? "done" : "notdone"; q.doneAt = nowIso(); q.by = "today"; }
    try { S.put(x.s); } catch (e) { } return true;
  }
  AS.planTap = planTap;
  /* ---------- RM5d: درخواستِ عقب‌افتاده‌ای که گزارشِ وضعش نیامد — نامزد فقط پرسیده می‌شود («اگر هنوز پاسخش نداده‌ای…»)، هرگز ذخیره ---------- */
  var REQ18_IMP = new RegExp("(?:^|[\\s،])(?:[بن](?:" + STEMS + "|نداز|فرمایید|فرما)(?:ید|ین|ش)?|(?:معرفی|آماده|درست|خلاصه|تهیه|کمک|توضیح)\\s*(?:کن|کنید|کنین|بکن|بده|بدید|بدین|بفرمایید))(?![آ-ی‌])");
  var REQ18_WANT = /(?:^|[\s،])(?:لطفاً|لطفا|میشه|می[‌\s]شه|می[‌\s]?شود|ممکنه|ممکن\s*است|می[‌\s]?خوام\s*(?:بدونم|بفهمم|یاد\s*بگیرم)|یادم\s*بنداز)(?![آ-ی‌])/;
  var ANS18 = /(?:جواب|پاسخ|راه[‌\s]?حل)\S*\s*(?:نهایی\s*)?(?:رو|را)?\s*(?:هم\s*)?(?:بگو|بده|بنویس|بفرست)(?![آ-ی‌])/;
  var RHET18 = /^(?:آخه|مگه|کی\s*حوصله)|حوصله\s*داره\s*[؟?]/;
  /* قرنطینه (تورِ پولیا RN1 — REMOVAL_CANDIDATES): آشکارسازی که تنها داوری می‌کرد — آخرین پیامِ دستیار (اغلب پاسخِ نوبتِ «[سامانه: …]») را با پیامِ کاربر جفت
     می‌کرد، «می‌شه» ِ رابط را درخواست می‌خواند و «پوشش» را با هم‌پوشانیِ واژه می‌سنجید */
  function deferCandR18(s) {
    var M = (s && s.msgs) || [], ai = -1; for (var i = M.length - 1; i >= 0; i--) if (M[i] && M[i].role === "ai") { ai = i; break; }
    if (ai < 0) return ""; var m = M[ai];
    if ((m.actions || []).indexOf("coach_state") >= 0) return "";   // مدل گزارش داد (با defer یا بی آن) ⇒ داوریِ خودش
    if ((s.promises || []).some(function (x) { return x.at === String(m.at || ""); })) return "";
    var u = null; for (var j = ai - 1; j >= 0; j--) if (isUser(M[j])) { u = M[j]; break; } if (!u) return "";
    var aTok = tokN(m.text);
    return sentsOfR18(ownText(u.text)).filter(function (x) { var o = x.replace(/«»/g, " ").trim(), oq = o.replace(/^[\s،:]+/, "");
      if (!oq || RHET18.test(oq) || ANS18.test(oq) || ONLY_ANS_RE.test(oq)) return false;   // خواستنِ خودِ جواب درخواستی نیست که مربی بدهکارش باشد
      var req = REQ18_IMP.test(oq) || REQ18_WANT.test(oq) || /[؟?]\s*$/.test(oq); if (!req) return false;
      var tk = tokN(oq); return !(tk.length && tk.filter(function (w) { return aTok.indexOf(w) >= 0; }).length * 2 >= tk.length);   // همان پاسخ به آن پرداخت ⇒ نامزد نیست
    }).map(function (x) { return x.replace(/«»/g, "").trim(); })[0] || "";
  }
  /* ---------- RN1 (تورِ پولیا، دورِ ۱۹): نامزدِ درخواستِ عقب‌افتاده — هر پیامِ کاربر با **پاسخِ خودش** (نخستین پیامِ دستیار پس از آن، پیش از پیامِ بعدیِ کاربر؛
     پاسخِ نوبت‌های «[سامانه: …]» پاسخِ او نیست) جفت می‌شود؛ نامزد فقط وقتی هست که همان پاسخ گزارشِ وضع نداشت؛ و فقط درخواستی رو به دستیار:
     امر («بگو»، «توضیح بده»، «یادم بده»، «بزنید»)، «لطفاً…»، «یادم بنداز»، یا «میشه/می‌شه … ؟» با فعل یا ضمیرِ خطاب («بهم بدی؟»، «بگی…؟») — نه «میشه» ِ رابط
     («۲.۵ برابر میشه»، «جمعشون می‌شه ۱۲۰»)، نه «میشه … حلش کرد؟» ِ بی‌خطاب، نه حدس، نه پرسشِ خودِ مسئله، نه شرطِ شیوهٔ پاسخ («جوابو نگو، فقط راهنمایی کن»)،
     نه درخواستی که کارِ صفحه همان‌جا انجامش داد («بیا ثبتش کنیم» ⇐ «[سامانه: … ثبت شد]»)، نه قولی که هست یا بسته شد. هم‌پوشانیِ واژه با پاسخ «پوشش» نیست
     (پاسخی که درخواست را نقل کرد و عقب انداخت همان عقب‌انداختن است). همچنان فقط می‌پرسد («اگر هنوز پاسخش نداده‌ای…»)، هرگز ذخیره نمی‌کند. */
  var REQ19_IMP = new RegExp("(?:^|[\\s،‌])(?:ب(?:" + STEMS + "|نداز|فرمایید|فرما|زن|ده)(?:ید|ین|ش|م|مون)?|(?:معرفی|آماده|درست|خلاصه|تهیه|کمک|توضیح|یاد|نشون|نشان|راهنمایی|مثال|ثبت)(?:م|ش|مون)?\\s*(?:کن|کنید|کنین|بکن|بده|بدید|بدین|بدهید|بفرمایید|بزن|بزنید|بزنین))(?![آ-ی‌])");
  var REQ19_WANT = /(?:^|[\s،])(?:لطفاً|لطفا|خواهشاً|خواهشا|می[‌\s]?خوام\s*(?:بدونم|بفهمم|یاد\s*بگیرم)|یادم\s*بنداز)(?![آ-ی‌])/;
  var REQ19_MAY = /(?:^|[\s،])(?:می[‌\s]?شه|میشه|می[‌\s]?شود|ممکنه|امکانش\s*هست)(?![آ-ی‌])/;
  var ADDR19 = /(?:^|[\s‌])(?:ب[آ-ی]{1,8}(?:ی|ید|ین)|(?:کنی|کنید|کنین|بدی|بدید|بگی|بگید))(?![آ-ی‌])|(?:^|[\s‌])(?:برام|بهم|واسم|بهمون|برامون|برایم|برایمان|به\s*من)(?![آ-ی‌])/;
  var NEG_IMP19 = new RegExp("(?:^|[\\s،‌])ن(?:" + STEMS + ")(?:ید|ین|ش)?(?![آ-ی‌])");
  var PAGE_ACT19 = /(?:ثبت|ذخیره|بساز|ساخت|بازش|باز\s*کن)/;
  /* پرسشِ اطلاعیِ رو به دستیار (چرا/چطور/از کجا/به چه درد…؟) هم خواسته‌ای است که می‌تواند عقب بیفتد (بانکِ دورِ ۱۸ همچنان سبز)؛ پرسشِ بله/نه («میشه … حلش کرد؟»)،
     واژهٔ آزمایشی («رمهب‌ستان؟»)، حدس («شاید…؟»، «فکر کنم…؟») و پژواکِ پرسشِ خودِ دستیار نه */
  var WHQ19 = /(?:^|[\s،:‌])(?:چه|چی|چیه|چرا|چطور|چطوری|چگونه|کجا|کجاست|کی|کدام|کدوم|چند|چقدر)(?![آ-ی‌])/;
  var GUESSQ19 = /^(?:(?:خب|پس|آهان)\s*)*(?:فکر\s*(?:کنم|می[‌\s]?کنم)|شاید|به\s*نظرم|یعنی|احتمالاً|احتمالا|گمونم|گمانم)(?![آ-ی‌])/;
  function isReq19(o) {
    if (REQ19_IMP.test(o) || REQ19_WANT.test(o)) return true;
    return REQ19_MAY.test(o) && /[؟?]\s*$/.test(o) && ADDR19.test(o);
  }
  function isAsk19(o) { return /[؟?]\s*$/.test(o) && WHQ19.test(o) && !REQ19_MAY.test(o) && !GUESSQ19.test(o.replace(/^[^:]{0,20}:\s*/, "")) && tokN(o).length >= 3; }
  function pairPrev(s, mt) {
    var M = (s && s.msgs) || [], ui = []; M.forEach(function (m, i) { if (isUser(m)) ui.push(i); });
    if (!ui.length) return null; var last = ui[ui.length - 1];
    var pu = mt != null && String(M[last].text || "").trim() === String(mt).trim() ? ui[ui.length - 2] : last;
    if (pu == null || pu < 0) return null;
    var rep = null, after = [], before = null;
    for (var j = pu + 1; j < M.length; j++) { var x = M[j]; if (!x) continue; if (isUser(x)) break; if (!rep && x.role === "ai") { rep = x; continue; } if (rep) after.push(x); }
    for (var k = pu - 1; k >= 0; k--) { if (M[k] && M[k].role === "ai") { before = M[k]; break; } if (isUser(M[k])) break; }
    return rep ? { u: M[pu], rep: rep, after: after, before: before } : null;
  }
  function deferCand(s, mt) {
    var pp = pairPrev(s, mt); if (!pp) return "";
    if ((pp.rep.actions || []).indexOf("coach_state") >= 0) return "";   // پاسخِ خودِ آن پیام گزارش داد (با defer یا بی آن) ⇒ داوریِ مدل
    /* صورتِ مسئلهٔ زندهٔ ثبت‌شده (نه C.stmt ِ گفت‌وگو — آن نخستین پیامِ هر سشن است، حتی وقتی خودش یک درخواست است) */
    var stm = []; try { var bl = AS.boundLive(s); if (bl && bl.r && bl.r.p) stm.push(bl.r.p.statement || ""); var C0 = s.coach || {}; if (C0.stmt && C0.stmt !== clip(pp.u.text, 400)) stm.push(C0.stmt); } catch (e) { }
    var bTok = pp.before ? tokN(ownText(pp.before.text)) : [];
    var afterT = pp.after.map(function (x) { return String(x.text || ""); }).join("\n");
    var PR = (s.promises || []), teach = false; try { teach = teachMode(s, pp.u.text); } catch (e) { }
    var outs = [];
    sentsOf(ownText(pp.u.text)).forEach(function (x) {
      var o = x.replace(/«»/g, " ").trim(); if (!o) return;
      if (NEG_IMP19.test(o) || RHET18.test(o) || ANS18.test(o) || ONLY_ANS_RE.test(o)) return;   // شرطِ شیوهٔ پاسخ یا خواستنِ خودِ جواب
      var parts = o.split(/،\s*/), k = -1; parts.forEach(function (p, i) { if (k < 0 && isReq19(p.trim())) k = i; });
      if (k < 0) { if (!isReq19(o) && !isAsk19(o)) return; k = 0; }
      var c = parts.slice(k).join("، ").replace(/^[\s،:]+/, "").trim(); if (!c) return;
      if (!isReq19(c)) { var ct = tokN(c); if (ct.length && ct.every(function (w) { return bTok.indexOf(w) >= 0; })) return;   // پژواکِ پرسشِ خودِ دستیار
        /* پرسشِ اطلاعی: پاسخی که با همان واژه‌ها به آن پرداخت و عقبش نینداخت ⇒ داده شد؛ پاسخی که نقلش کرد و عقب انداخت («بگذار برای وقتی…») ⇒ همچنان نامزد */
        var rt = String(pp.rep.text || ""), rTok = tokN(rt); if (!DEFER_STRONG.test(rt) && !DEFER_WEAK.test(rt) && ct.length && ct.filter(function (w) { return rTok.indexOf(w) >= 0; }).length * 2 >= ct.length) return; }
      if (guessNow(c, teach)) return;
      if (stm.some(function (t) { return t && (quoteIn(c, t) || sameStmt(c, t)); })) return;   // پرسشِ خودِ مسئله
      if (PR.some(function (p) { return p && p.ask && (quoteIn(p.ask, c) || quoteIn(c, p.ask)); })) return;   // قولی که هست یا بسته شد
      var pa = PAGE_ACT19.exec(c); if (pa && afterT.indexOf(pa[0].replace(/ش$/, "")) >= 0 && /شد|انجام/.test(afterT)) return;   // کارِ صفحه همان‌جا انجامش داد
      outs.push(c);
    });
    return outs[0] || "";
  }
  AS.deferCandidate = deferCand;
  /* ---------- پالایهٔ این دور ---------- */
  AS.promptFilters.push(function (outs, s, msg) {
    var out = outs.slice(), mt = String(msg || "").trim(), auto = /^\[سامانه/.test(mt); if (auto || !s) return out;
    var C = s.coach || {}, Pv = C.prev && C.prev.key === mkey(mt) ? C.prev : null, ci = -1;
    out.forEach(function (x, j) { if (ci < 0 && /(?:^|\n)# مربیِ حل/.test(x)) ci = j; });
    /* RM6f: پس از بستن و بی مسئلهٔ باز، کارتِ مرحله نه — سرواژه بی مرحله، فهرست و «پیشنهادِ این نوبت» ِ فهرست بیرون؛ لحظه‌های دیگر (بازنگریِ ناتمام) می‌مانند */
    if (ci >= 0 && Pv && Pv.noPh) {
      out[ci] = out[ci].split("\n").filter(function (l) { return !/^- پرسش‌های «/.test(l); }).map(function (l) {
        return /^# مربیِ حل/.test(l) ? l.replace(/ · مرحلهٔ محتمل: [^—·]*?(?=\s*(?:·|—))/, " · مرحله: — (مسئلهٔ این گفت‌وگو بسته شد و مسئلهٔ بازی در کار نیست؛ اگر مسئلهٔ تازه‌ای آورد، از فهم)") : l; }).join("\n");
      if (s.coach) s.coach.qmap = {};
    }
    /* RM6c: نتیجهٔ احتمالیِ الگو (پس X = n در طرح/اجرا) فقط پیشنهاد است — مرحله با گزارشِ مدل عوض می‌شود */
    if (ci >= 0 && Pv && Pv.weakRes) out[ci] = out[ci] + "\n" + CTX18 + "شاید نتیجه‌ای گفت — اگر حاصلِ کارِ خودش است (نه ادعا، نه بخشی از صورت یا گفتهٔ دیگری)، در گزارشِ وضع said:[\"result\"] بده تا بازنگری از نوبتِ بعد بیاید؛ مرحله با همین نشانه عوض نمی‌شود.";
    /* RM5a/e: برنامه‌ای که موعدش گذشت، یا قولِ بی‌تاریخِ سشنِ پیش — یک بار «انجام شد؟» */
    try { var due = plansDue(s, mt);
      if (due.length) out.push("# برنامهٔ خودش که موعدش رسید\n" + due.map(function (q) {
        if (q.guessWait) return CTX18 + q.id + ": برنامه‌اش «" + clip(q.text, 160).replace(/[«»]/g, "") + "» بر حدسِ " + q.guessWait + " تکیه دارد که هنوز آزموده نشده — پیگیریِ انجامش را پیش نکش؛ اگر به کار آمد، یک بار در یک جملهٔ خبری پیشنهاد کن «اول حدس را بیازما»؛ وقتی نتیجهٔ آزمودنش را گفت ⇒ {\"do\":\"coach_state\",\"guess_res\":{\"id\":\"" + (/^g\d+/.exec(q.guessWait) || ["gN"])[0] + "\",\"res\":\"refuted|confirmed\"}}.";
        return CTX18 + q.id + ": " + (q.when === "next-session" ? "در سشنِ پیش به خودش گفت «" + clip(q.text, 160).replace(/[«»]/g, "") + "»" : "برنامهٔ خودش «" + clip(q.text, 160).replace(/[«»]/g, "") + "» (موعد " + q.when + (A.fdate ? "، " + A.fdate(q.when) : "") + ") گذشته است") +
          " — اگر هنوز جویا نشده‌ای، یک بار و کوتاه، در یک جملهٔ خبری‌پرسشی کنارِ همان یک پرسشِ نوبت، جویا شو انجام شد یا نه؛ پاسخش ⇒ {\"do\":\"coach_state\",\"plan_done\":{\"id\":\"" + q.id + "\",\"done\":true|false}}؛ اگر نگفت، دیگر پیگیرش نشو."; }).join("\n"));
    } catch (e) { }
    /* RN6d: برنامه‌های بازِ خودش با شناسه — تا same / plan_done / step بی حدس گزارش شود (هر سطرِ برنامه شناسه دارد) */
    try { var OP = plansAll(s).filter(function (x) { return planSync(x) === "open"; }).slice(-6);
      if (OP.length) out.push("# برنامه‌های بازِ خودش (شناسه‌ها)\n" + CTX18 + OP.map(function (x) { var q = x.p; return q.id + ": «" + clip(plainTx(q.text), 100).replace(/[«»]/g, "") + "»" + (q.when === "next-session" ? " (قولِ بی‌تاریخ)" : q.when ? " (موعد " + q.when + ")" : "") + (q.step ? " = گامِ مسئلهٔ زنده" : "") + (q.onGuess ? " (بر حدس)" : ""); }).join(" · ") +
        " — اگر یکی را دوباره گفت ⇒ plan.same همان شناسه؛ اگر گفت انجامش داد یا نداد ⇒ plan_done با همان شناسه؛ اگر همان گامِ مسئلهٔ زنده است ⇒ plan.step شمارهٔ گام.");
    } catch (e) { }
    /* RM5d: نامزدِ درخواستِ عقب‌افتاده (گزارشِ وضع نیامد) */
    try { if (!out.some(function (x) { return /^# درخواستِ عقب‌افتاده/.test(x); })) { var dc = deferCand(s, mt);
      if (dc) out.push("# درخواستِ عقب‌افتاده (نامزد، شاید)\n" + CTX18 + "در پیامِ پیشینش خواسته یا پرسشی بود («" + clip(dc, 140).replace(/[«»]/g, "") + "») و گزارشِ وضعِ آن نوبت نیامد — اگر هنوز پاسخش نداده‌ای، گم نشود: {\"do\":\"coach_state\",\"defer\":{\"what\":\"عینِ خواسته‌اش\"}} را گزارش کن و به وقتش بده؛ اگر همان‌جا دادی یا خواسته‌ای نبود، این سطر را نادیده بگیر."); } } catch (e) { }
    return out;
  });
  /* ---------- RM1a: «حل شد» در گفت‌وگو ⇒ یک موفقیتِ اجرا (کلیدِ همان پیامِ کاربر؛ نتیجه‌ای که مدل همان نوبت گزارش داد دوباره شمرده نمی‌شود) ---------- */
  if (!AS.DO.chat_solved._r18) {
    var rawSolved18 = AS.DO.chat_solved;
    AS.DO.chat_solved = function (a) {
      var s = AS._turnSession, out = rawSolved18.apply(this, arguments);
      try { if (s && a && /^✓/.test(String(out || "")) && !(s.coach && s.coach.teach)) { var um = lastUserMsg(s); if (um) coachEv(s, "c", "chatok", String(um.text || ""), true, { how: "solved" }); S.put(s); } } catch (e) { }
      return out;
    };
    AS.DO.chat_solved._r18 = true;
  }
  /* ---------- INF4: یک سطرِ «امروز» برای هر برنامهٔ بازِ خودش که موعدش رسیده (یا قولِ بی‌تاریخ) ---------- */
  if (typeof A.dueList === "function" && !A.dueList._plans18) {
    var rawDueP = A.dueList;
    A.dueList = function () {
      var items = rawDueP.apply(this, arguments) || [], td = A.today();
      /* RN2d: وضعِ مؤثر (گامِ پیوسته، سرانجامِ حدس) پیش از نمایش؛ INF10: یک‌تپ «انجام دادم / انجام ندادم / هنوز نه» — همان وضعِ plan_done (AS.planTap) */
      try { plansAll(null).forEach(function (x) { var q = x.p; if (planSync(x) !== "open") return; if (q.when !== "next-session" && (!q.when || String(q.when) > td)) return; if (q.snooze && String(q.snooze) > td) return;
        var rer = function () { if (A.state && A.state.view === "home" && A.render) A.render(); };
        var acts = [{ t: "انجام دادم", v: "done" }, { t: "انجام ندادم", v: "notdone" }].concat(q.notYet ? [] : [{ t: "هنوز نه", v: "notyet" }]).map(function (b) {
          return { t: b.t, cls: "dopt plan-tap plan-" + b.v, fn: function () { if (planTap(q.id, b.v)) { A.toast(b.v === "notyet" ? "باشد — فردا دوباره می‌آید." : "ثبت شد: «" + clip(plainTx(q.text), 40) + "» — " + b.t + "."); rer(); } } }; });
        items.push({ k: "p", pid: q.id, txt: "📌 برنامهٔ خودت (" + q.id + "): «" + clip(plainTx(q.text), 90) + "»", sub: q.onGuess ? "بر حدسی تکیه دارد که هنوز آزموده نشده — اول حدس را بیازما" : q.when === "next-session" ? "قولِ بی‌تاریخ به خودت — چطور پیش رفت؟" : "موعد: " + (A.fdate ? A.fdate(q.when) : q.when) + " — انجام شد؟",
          acts: acts, go: function () { try { localStorage.setItem("lla.assist.cur", x.s.id); } catch (e) { } if (AS.toggle) AS.toggle(true); } }); }); } catch (e) { }
      return items;
    };
    A.dueList._plans18 = true;
  }
  /* قرنطینه‌های این دور (REMOVAL_CANDIDATES): مسیرهای جایگزین‌شده، دست‌یافتنی برای مقایسه/بازگرداندن */
  function guessMsgR17(s, gt) { for (var gi = (s.msgs || []).length - 1; gi >= 0; gi--) if (s.msgs[gi] && s.msgs[gi].role === "ai") { s.msgs[gi].guess = { text: clip(gt, 300) }; break; } }
  function planR17(s, a, ut, key, at) { var pt = txtOf(a.plan); if (pt && quoteIn(pt, ut)) { var w = a.plan && a.plan.when, td = A.today(), when = realDate(w) && w >= td ? w : planDate(pt);
    var PL = s.plans = s.plans || []; if (!PL.some(function (x) { return qNorm(x.text) === qNorm(pt); })) PL.push({ id: "pl" + (PL.length + 1), text: clip(pt, 300), when: when, at: at, key: key, done: false }); } }
  AS.R17_QUARANTINE = { planSeen: planSeenR17, plan: planR17, regSigns: regSignsR17, guessMsg: guessMsgR17, chkWindow: chkWindowR17 };
  /* قرنطینه‌های دورِ ۱۹ (تورِ پولیا RN1، RN2d، RN3a، RN6c — REMOVAL_CANDIDATES) */
  AS.R18_QUARANTINE = { deferCand: deferCandR18, sentsOf: sentsOfR18, regIn: regInR18, planDone: planDoneR18, plansDue: plansDueR18, weakPhase: weakPhaseR18 };

  /* ================= دورِ ۱۹b ِ تورِ پولیا (INF15، سهمِ «coach»، DECISIONS_R19b) — اصلاحِ پیامِ پیشین، به هر فاصله =================
     مدل گزارش می‌دهد (coach_state.retract {msg, what, fix, old?})، صفحه می‌سنجد: تکه در پیامِ **پیشینِ خودِ کاربر** در همین سشن هست، پیامِ کنونی نشانهٔ
     اصلاحِ حرفِ خودش را دارد (نه کارِ بیرونی، نه اشتباهِ دستیار یا دیگری) و مقدارِ درست را در خودش دارد، و درست ≠ نادرست. آن‌گاه هر رکوردِ لایهٔ مربی که
     از آن پیام آمده بود (حدس، برنامه، قول، شاهدِ said/ans، فرمی که کنشِ دستیار در آن نوبت پر کرد، رویدادهای کارنامه) برگردانده و درست نشانده می‌شود —
     هیچ رکوردی پاک نمی‌شود: مقدارِ پیشین با «اصلاح شد ⇐» در تاریخچه می‌ماند؛ رکوردهای مسئلهٔ زنده (صورت، داده، حدس، گام) با A.liveRetract ِ بخشِ مسئله.
     پشتیبانِ بی‌گزارش فقط می‌پرسد «کدام را اصلاح کنم؟» و هرگز خودش برنمی‌گرداند (experiences/model-reports-state-page-validates.md). */
  var CORR19b = /^\[اصلاحِ?[\s‌]*پیامِ?[\s‌]*قبلی\]|اشتباه[\s‌]*(?:گفتم|نوشتم|زدم|تایپ|حساب[\s‌]*کردم)(?![آ-ی])|غلط[\s‌]*(?:گفتم|نوشتم)(?![آ-ی])|(?:گفتم|نوشتم)(?![آ-ی])[^.!؟?\n]{0,40}(?:اشتباه|غلط)[\s‌]*(?:بود|ه)(?![آ-ی])|منظورم[\s‌]+[^.!؟?\n]{1,80}?[\s‌]*بود(?![آ-ی])|(?:اصلاح|اصلاحش|درستش)[\s‌]*(?:کن|کنید|کنین)(?![آ-ی])|(?:^|[\s،,.])نه[،,\s]+[^.!؟?\n]{1,60}?[\s‌]*درست(?:ه|ش|ست|\s*است)(?![آ-ی])|درستش[\s‌]*(?:اینه|این\s*است|هست)|صحیح[\s‌]*(?:آن|اش|ش)(?![آ-ی])|اشتباهِ?[\s‌]*تایپی|(?:نوشتم|گفتم)(?![آ-ی])[^.!؟?\n]{1,30}[،,]?[\s‌]*(?:ولی|اما)(?![آ-ی])/;
  /* اشتباهِ دستیار یا دیگری («تو اشتباه گفتی»، «دوستم گفت اشتباه گفتی») اصلاحِ حرفِ خودش نیست */
  var OTHER_ERR19b = /(?:^|[\s،])(?:تو|شما)[\s‌]+اشتباه|اشتباه[\s‌]*(?:گفتی|نوشتی|کردی|خوندی|فهمیدی|گفتید|نوشتید|کردید|خوندید)(?![آ-ی])|(?:گفت|نوشت|نوشته\s*بود)(?![آ-یم])[^.!؟?\n]{0,12}اشتباه/;
  AS.CORR_RE = CORR19b;
  /* بانکِ R19b (INF15 #15، #16): «اشتباه کردم» ِ تنها (کلید را جا گذاشتم، سرِ امتحان علامت را انداختم) اغلب کارِ بیرونی است، نه شکستِ مرحلهٔ همین حل —
     الگو آن را فقط «در انتظار» (pend) نگه می‌دارد تا گزارشِ مدل داوری کند (نامتقارن: شکستِ دروغ گران‌تر است)؛ «حل نشد/غلط بود» ِ دیگر مثلِ پیش */
  function actErrOnly19b(t) { var x = String(t || ""); return /اشتباه[\s‌]*کردم/.test(x) && !UNSOLVED_RE.test(x.replace(/اشتباه[\s‌]*کردم/g, " ")); }
  function msgId19b(m) { if (!m) return ""; if (m.id) return String(m.id); if (m.seq != null) return "u" + m.seq; return "t" + String(m.at || ""); }
  AS.msgId = msgId19b;
  /* پیامِ کاربرِ منبعِ یک رویداد: آخرین پیامِ کاربر با همین متن */
  function evSrc19b(s, mt) { var M = (s && s.msgs) || [], t = String(mt || "").trim(); if (!t) return null; for (var i = M.length - 1; i >= 0; i--) if (isUser(M[i]) && String(M[i].text || "").trim() === t) return M[i]; return null; }
  function evPid19b(s) { try { var b = AS.boundLive(s); if (b && b.pid) return b.pid; } catch (e) { } var pk = ((s && s.coach) || {}).pk || ""; return /^l:/.test(pk) ? pk.slice(2) : ""; }
  AS.msgOf = function (s, id) { return ((s && s.msgs) || []).filter(function (m) { return isUser(m) && msgId19b(m) === id; })[0] || null; };
  /* ---------- یکسان‌سازیِ تکه برای جست‌وجو در متن: رقمِ فارسی/لاتین، فاصله/نیم‌فاصله، ی/ي ---------- */
  function rxEsc(c) { return c.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&"); }
  var DIG19b = ["0۰٠", "1۱١", "2۲٢", "3۳٣", "4۴٤", "5۵٥", "6۶٦", "7۷٧", "8۸٨", "9۹٩"];
  function fragRe(y) {
    var t = String(y || "").trim(); if (!t) return null; var out = "", sp = false;
    for (var i = 0; i < t.length; i++) { var c = t.charAt(i), d = faDigits(c);
      if (/[\s‌]/.test(c)) { if (!sp) out += "[\\s‌]*"; sp = true; continue; } sp = false;
      if (/^[0-9]$/.test(d)) out += "[" + DIG19b[+d] + "]";
      else if (/[یي]/.test(c)) out += "[یي]"; else if (/[کك]/.test(c)) out += "[کك]"; else out += rxEsc(c); }
    try { return new RegExp(out); } catch (e) { return null; }
  }
  function hasFrag(T, y) { var r = fragRe(y); return !!r && r.test(String(T || "")); }
  function repFrag(T, y, x) { var r = fragRe(y); return r ? String(T).replace(r, function () { return x; }) : T; }
  function numRe19b(n) { var rf = fragRe(n); return rf ? new RegExp("(^|[^0-9۰-۹٠-٩.٫])" + rf.source + "(?![0-9۰-۹٠-٩]|[.٫][0-9۰-۹٠-٩])") : null; }
  function nums19b(t) { return (faDigits(String(t || "")).replace(/٫/g, ".").match(/\d+(?:\.\d+)?/g) || []); }
  function rawNums(t) { return String(t || "").match(/[0-9۰-۹٠-٩]+(?:[.٫][0-9۰-۹٠-٩]+)?/g) || []; }
  var WD19b = /(?:سه[‌\s]?شنبه|پنج[‌\s]?شنبه|یک[‌\s]?شنبه|دو[‌\s]?شنبه|چهار[‌\s]?شنبه|شنبه|جمعه|پس[‌\s]?فردا|فردا|امروز|امشب)(?:[‌\s]?ی[\s‌]+(?:بعد|دیگه|آینده))?/;
  /* مقدارِ درست را در متنِ رکورد بنشان: (الف) «old» ِ مدل یا «نه Y»/«به‌جای Y» ِ پیامِ کنونی، (ب) تنها عددِ عوض‌شده، (پ) روزِ هفته، (ت) پنجره‌ای از تکه که
     با واژهٔ مشترکِ درست هم‌تراز است، (ث) خودِ تکه درونِ متن؛ متنی که درونِ تکه است ⇒ خودِ درست. هیچ‌کدام ⇒ null (رکورد دست نمی‌خورد، مگر نوعش همان what باشد). */
  function subst19b(T, frag, fix, cur, old) {
    T = String(T || ""); var F = String(frag || "").trim(), X = String(fix || "").trim(); if (!X) return null;
    var Ys = []; if (old && String(old).trim()) Ys.push(String(old).trim());
    var re = /(?:^|[\s،,.])(?:نه|به[\s‌]*جای|بجای)[\s‌]+([^،,.!؟?\n]{1,50})/g, m, cu = String(cur || "");
    while ((m = re.exec(cu))) { var w = m[1].replace(/[\s‌]+(?:بود|است|نبود)$/, "").trim().split(/[\s‌]+/); for (var k = w.length; k >= 1; k--) Ys.push(w.slice(0, k).join(" ")); }
    for (var i = 0; i < Ys.length; i++) { var y = Ys[i]; if (!y || hasFrag(X, y) || !(!F || hasFrag(F, y) || !!old)) continue;
      if (/^[0-9۰-۹٠-٩]+(?:[.٫][0-9۰-۹٠-٩]+)?$/.test(y)) { var ry = numRe19b(y); if (ry.test(T)) return T.replace(ry, function (a0, p0) { return p0 + X; }); continue; }   // عدد فقط به‌تمامی («۵» درونِ «۱۵» نه)
      var wy = fragRe(y), ry2 = wy ? new RegExp("(^|[^آ-یa-zA-Z0-9۰-۹‌])" + wy.source + "(?![آ-یa-zA-Z0-9۰-۹‌])") : null;   // واژه به‌تمامی («خسته» درونِ «خسته‌ام» نه)
      if (ry2 && ry2.test(T)) return T.replace(ry2, function (a1, p1) { return p1 + X; }); }
    var fo = nums19b(F).filter(function (n) { return nums19b(X).indexOf(n) < 0; }), xo = rawNums(X).filter(function (n) { return nums19b(F).indexOf(faDigits(n).replace(/٫/g, ".")) < 0; });
    if (fo.length === 1 && xo.length === 1) { var r2 = numRe19b(fo[0]); if (r2 && r2.test(T)) return T.replace(r2, function (a, p) { return p + xo[0]; }); }
    var wf = WD19b.exec(F), wx = WD19b.exec(X); if (wf && wx && hasFrag(T, wf[0]) && X.split(/\s+/).length <= 4) return repFrag(T, wf[0], X);
    var ft = F.split(/\s+/).filter(Boolean), xt = X.split(/\s+/).filter(Boolean);
    for (var xi = 0; xi < xt.length; xi++) { if (xt[xi].length < 2 || /^[0-9۰-۹٠-٩=+\-−×*\/^.,]+$/.test(xt[xi])) continue; var fi = ft.indexOf(xt[xi]); if (fi < 0) continue;
      var s0 = Math.max(0, fi - xi), win = ft.slice(s0, s0 + xt.length).join(" "); if (win && win !== X && hasFrag(T, win)) return repFrag(T, win, X); break; }
    if (F && hasFrag(T, F)) return repFrag(T, F, X);
    if (F && T.trim() && hasFrag(F, T.trim())) return X;
    return null;
  }
  AS.retractSubst = subst19b;
  function rel19b(T, F) { if (!T || !F) return false; if (hasFrag(T, F) || hasFrag(F, String(T).trim())) return true; var a = tokN(T), b = tokN(F); if (a.some(function (w) { return b.indexOf(w) >= 0; })) return true; var na = nums19b(T), nb = nums19b(F); return na.some(function (n) { return nb.indexOf(n) >= 0; }); }
  function corrPush(r, old, nw, ctx) { r.corr = (r.corr || []).concat([Object.assign({ at: nowIso(), old: old, "new": nw, note: "اصلاح شد ⇐ «" + clip(String(old == null ? "" : old), 120) + "»" }, ctx || {})]); }
  /* ---------- فرم‌هایی که کنشِ دستیار پر کرد: دفترِ هر پر کردن با شناسهٔ پیامِ کاربرِ آن نوبت (برای برگرداندن) ---------- */
  function fieldSig(x) { return x ? (x.id || x.name || x.getAttribute("aria-label") || x.placeholder || "") : ""; }
  function fieldBySig(sg) { if (!sg) return null; var L = document.querySelectorAll("#main input, #main textarea, #main select"); for (var i = 0; i < L.length; i++) if (fieldSig(L[i]) === sg) return L[i]; return null; }
  if (AS.DO && AS.DO.fill && !AS.DO.fill._r19b) {
    var rawFill19b = AS.DO.fill;
    AS.DO.fill = function (a) {
      var x = null, old = null; try { x = a && a.k ? document.querySelector('#main [data-ai-k="' + a.k + '"]') : null; if (x) old = String(x.value == null ? "" : x.value); } catch (e) { }
      var r = rawFill19b.apply(this, arguments);
      try { var s = AS._turnSession; if (!r && x && s && x.type !== "checkbox" && x.type !== "radio" && x.type !== "file") { var um = lastUserMsg(s), st = A.state || {};
        if (um && String(x.value) !== old) { var F = s.fills = s.fills || []; F.push({ src: msgId19b(um), key: mkey(um.text), at: nowIso(), view: st.view || "", arg: st.arg == null ? null : st.arg, sub: st.sub || null, sig: fieldSig(x), label: clip(x.getAttribute("aria-label") || x.placeholder || x.id || "", 80), old: old, val: String(x.value) }); if (F.length > 120) s.fills = F.slice(-120); S.put(s); } } } catch (e) { }
      return r;
    };
    AS.DO.fill._r19b = true;
  }
  function setField19b(x, v) {
    var proto = x.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : x.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype, d = Object.getOwnPropertyDescriptor(proto, "value");
    if (d && d.set) d.set.call(x, v); else x.value = v; x.dispatchEvent(new Event("input", { bubbles: true })); x.dispatchEvent(new Event("change", { bubbles: true }));
  }
  /* ---------- سنجشِ retract ---------- */
  var WHAT19b = /^(?:guess|plan|step|ans|said|fact|form)$/;
  function retractCheck(s, x, um) {
    if (!x || typeof x !== "object") return { err: "retract شیء نیست" };
    var frag = txtOf(x.msg || x.frag).trim(), what = String(x.what || "").trim(), fix = txtOf(x.fix).trim(), ut = String((um && um.text) || "");
    if (!um || !isUser(um)) return { err: "پیامِ کاربر نیست" };
    if (!WHAT19b.test(what)) return { err: "what نامعتبر" };
    if (frag.length < 1) return { err: "تکهٔ پیامِ پیشین نیامد" };
    var own = ownText(ut);
    if (!CORR19b.test(own)) return { err: "پیامِ کنونی نشانهٔ اصلاحِ حرفِ خودش را ندارد" };
    if (OTHER_ERR19b.test(own) && !/(?:اشتباه|غلط)[\s‌]*(?:گفتم|نوشتم)/.test(own)) return { err: "اصلاحِ اشتباهِ دستیار یا دیگری است، نه حرفِ خودش" };
    if (!fix || !(quoteIn(fix, ut) || hasFrag(ut, fix))) return { err: "مقدارِ درست در همین پیامِ او نیست" };
    var M = s.msgs || [], ui = M.indexOf(um), src = null, n = 0;
    for (var i = ui - 1; i >= 0; i--) if (isUser(M[i]) && (hasFrag(M[i].text, frag) || (frag.length >= 4 && quoteIn(frag, M[i].text)))) { src = M[i]; break; }
    if (!src) return { err: "تکه در هیچ پیامِ پیشینِ خودِ او در این سشن نیست" };
    if (hasFrag(frag, fix)) return { err: "مقدارِ «درست» همان مقدارِ پیشین است — اصلاحی نیست" };
    for (var j = 0; j <= M.indexOf(src); j++) if (M[j] && M[j].role === "user") n++;
    return { src: src, srcId: msgId19b(src), n: n, frag: frag, what: what, fix: fix, old: txtOf(x.old).trim(), cur: um, curId: msgId19b(um) };
  }
  AS.retractCheck = function (s, x) { return retractCheck(s, x, lastUserMsg(s)); };
  function fromMsg(r, R) { return !!r && (r.src === R.srcId || (!r.src && !!r.key && r.key === mkey(R.src.text))); }
  /* ---------- برگرداندن و نشاندنِ درست ---------- */
  function retractApply(s, R) {
    var C = s.coach = s.coach || {}, ch = [], pend = [], ctx = { by: R.curId, from: R.srcId, what: R.what }, cu = String(R.cur.text || "");
    var sub = function (T, typed) { var v = subst19b(T, R.frag, R.fix, cu, R.old); if (v == null && typed) v = R.fix; return v; };
    var hit = function (typed, T) { return typed || rel19b(T, R.frag); };
    /* حدس‌ها (شناسه‌دار) و حدسِ جاریِ مربی */
    (C.guesses || []).forEach(function (g) { if (!fromMsg(g, R) || !hit(R.what === "guess", g.text)) return; var v = sub(g.text, R.what === "guess"); if (v == null || v === g.text) return;
      corrPush(g, g.text, v, ctx); ch.push("حدسِ " + g.id + ": «" + clip(v, 60) + "» (اصلاح شد ⇐ «" + clip(g.text, 50) + "»)"); var o = g.text; g.text = clip(v, 300);
      if (C.guess && qNorm(C.guess.text) === qNorm(o)) { corrPush(C.guess, C.guess.text, g.text, ctx); C.guess.text = g.text; }
      (s.msgs || []).forEach(function (m) { if (m && m.role === "ai" && m.guess && qNorm(m.guess.text) === qNorm(o)) { corrPush(m.guess, m.guess.text, g.text, ctx); m.guess.text = g.text; } }); });
    if (C.guess && fromMsg(C.guess, R) && !(C.guesses || []).some(function (g) { return qNorm(g.text) === qNorm(C.guess.text); }) && hit(R.what === "guess", C.guess.text)) { var gv = sub(C.guess.text, R.what === "guess"); if (gv != null && gv !== C.guess.text) { corrPush(C.guess, C.guess.text, gv, ctx); ch.push("حدس: «" + clip(gv, 60) + "» (اصلاح شد ⇐ «" + clip(C.guess.text, 50) + "»)"); C.guess.text = clip(gv, 300); } }
    /* برنامه‌ها (+ موعد و یادآورِ پیگیری‌اش) */
    (s.plans || []).forEach(function (q) { if (!fromMsg(q, R) || !hit(R.what === "plan", q.text)) return; var v = sub(q.text, R.what === "plan"); if (v == null || v === q.text) return;
      var ow = q.when, nw = ow; if (ow && ow !== "next-session" && WD19b.test(String(v))) { var d = planDate18(v); if (d && d >= A.today() && d !== planDate18(q.text)) nw = d; }
      corrPush(q, q.text, v, Object.assign({ oldWhen: ow }, ctx)); var oT = q.text; q.text = clip(v, 300);
      if (nw !== ow) { q.when = nw; delete q.askKey; delete q.gAskKey;
        try { S.all("deadline", function (x) { return x && !x.done && x.date === ow && (x.sess === s.id || quoteIn(clip(oT, 40), String(x.what || ""))); }).forEach(function (dl) { corrPush(dl, dl.date, nw, ctx); dl.date = nw; S.put(dl); }); } catch (e) { } }
      ch.push("برنامهٔ " + q.id + ": «" + clip(plainTx(v), 60) + "»" + (nw !== ow ? " (موعد " + nw + ")" : "") + " (اصلاح شد ⇐ «" + clip(plainTx(oT), 50) + "»" + (nw !== ow ? "، " + ow : "") + ")"); });
    /* قول‌ها (درخواستِ عقب‌افتاده‌ای که از آن پیام آمد) */
    (s.promises || []).forEach(function (p) { if (p.done || !(p.src === R.srcId || quoteIn(p.ask, R.src.text)) || !rel19b(p.ask, R.frag)) return; var v = sub(p.ask, false); if (v == null || v === p.ask) return;
      corrPush(p, p.ask, v, ctx); ch.push("درخواستِ " + p.id + ": «" + clip(v, 60) + "» (اصلاح شد ⇐ «" + clip(p.ask, 50) + "»)"); p.ask = clip(v, 200); });
    /* صورتِ مسئلهٔ گفت‌وگو و مجهول به حرفِ خودش */
    /* صورتِ گفت‌وگو همیشه پیرو می‌شود (تاریخچه می‌ماند)؛ فقط وقتی واقعاً مسئله است «تغییر» خوانده می‌شود (سلام و حال‌واحوال رکوردی نیست که بگوییم عوض شد) */
    if (C.stmt && hasFrag(R.src.text, String(C.stmt).slice(0, 40)) && rel19b(C.stmt, R.frag)) { var sv = sub(C.stmt, false); if (sv != null && sv !== C.stmt) { var stP = false; try { stP = !AS.notProblem(C.stmt) && (/[؟?0-9۰-۹=]/.test(C.stmt) || qToks(C.stmt).length >= 6); } catch (e) { }
      C.stmtHist = (C.stmtHist || []).concat([{ at: nowIso(), old: C.stmt, note: "اصلاح شد ⇐ «" + clip(C.stmt, 120) + "»", by: R.curId }]); if (stP) ch.push("صورتِ مسئلهٔ گفت‌وگو: «" + clip(sv, 70) + "»"); C.stmt = clip(sv, 400); } }
    Object.keys(C.unkBy || {}).forEach(function (k) { var u = C.unkBy[k]; if (!u || !hasFrag(R.src.text, u) || !rel19b(u, R.frag)) return; var v = sub(u, R.what === "said"); if (v == null || v === u) return; C.unkHist = (C.unkHist || []).concat([{ at: nowIso(), pk: k, old: u, note: "اصلاح شد ⇐ «" + clip(u, 120) + "»" }]); C.unkBy[k] = clip(v, 160); ch.push("مجهول به حرفِ خودت: «" + clip(v, 60) + "»"); });
    /* شاهدِ پاسخ (ans/said): پاسخ‌دادن می‌ماند، محتوایش اصلاح می‌شود؛ حکمِ وارسی‌ای که روی پیامِ نادرست بنا شد «وارسی‌نشده» می‌شود (حکمِ پیشین در تاریخچه) */
    if (/^(?:ans|said|fact)$/.test(R.what)) { var nA = 0; (C.ansLog || []).forEach(function (e) { if (!fromMsg(e, R)) return; corrPush(e, R.frag, R.fix, ctx); nA++; }); var nO = 0, PN = { u: "مجهول", d: "داده", c: "شرط" }, pn = []; (C.ownLog || []).forEach(function (e) { if (!fromMsg(e, R)) return; corrPush(e, R.frag, R.fix, ctx); nO++; (e.p || []).forEach(function (k) { if (PN[k] && pn.indexOf(PN[k]) < 0) pn.push(PN[k]); }); });
      if (nO) ch.push((pn.join("/") || "آنچه از مسئله گفتی") + " به حرفِ خودت: «" + clip(R.fix, 60) + "» (اصلاح شد ⇐ «" + clip(R.frag, 50) + "»)");
      if (nA) ch.push("پاسخ به " + fa(nA) + " پرسش: «" + clip(R.fix, 50) + "» (اصلاح شد ⇐ «" + clip(R.frag, 50) + "»)"); }
    try { chatClosed().forEach(function (x) { var b = x.b; if (!b || b.verdict !== "verified" || !(b.chkMsgs || []).some(function (t) { return qNorm(t) && qNorm(clip(R.src.text, 160)) === qNorm(t); })) return;
      b.chkSup = { at: nowIso(), by: R.curId, from: R.srcId, verdictPrev: b.verdict, note: "اصلاح شد ⇐ حکمِ «وارسی شد» روی پیامی بود که خودش اصلاح کرد" }; b.verdict = "unverified"; b.chkBy = "superseded"; S.put(x.pg); ch.push("حکمِ وارسیِ «" + clip(x.r.p.title, 40) + "» دیگر «وارسی شد» نیست (روی پیامِ اصلاح‌شده بود)"); }); } catch (e) { }
    /* فرم‌هایی که کنشِ دستیار در آن نوبت پر کرد */
    (s.fills || []).forEach(function (f) { if (!fromMsg(f, R)) return; if (!(R.what === "form" || rel19b(f.val, R.frag))) return; var v = sub(f.val, R.what === "form"); if (v == null || v === f.val) return;
      var st = A.state || {}, here = st.view === f.view && String(st.arg) === String(f.arg), x = here ? fieldBySig(f.sig) : null, o = f.val;
      corrPush(f, o, v, ctx);
      if (x && String(x.value) === o) { setField19b(x, v); f.val = v; delete f.pending; ch.push("فیلدِ «" + clip(f.label, 40) + "»: «" + clip(v, 50) + "» (اصلاح شد ⇐ «" + clip(o, 40) + "»)"); }
      else { f.pending = v; pend.push("فیلدِ «" + clip(f.label, 40) + "» در «" + f.view + (f.arg != null ? " " + f.arg : "") + "» هنوز «" + clip(o, 40) + "» است ⇒ «" + clip(v, 50) + "»"); } });
    /* رویدادهای کارنامه که از آن پیام آمدند ⇒ پس گرفته (wd)، نه پاک */
    var nE = 0, tail = clip(String(R.src.text || ""), 80); (s.coachEv || []).forEach(function (e) { if (!e || e.wd || e.how === "selfcorr") return; var fromE = e.msg ? e.msg === R.srcId : /^chat/.test(String(e.src || "")) && String(e.key || "").slice(-tail.length) === tail;
      if (fromE) { e.wd = { at: nowIso(), by: R.curId, why: "اصلاحِ پیامِ منبع" }; nE++; } });
    if (nE) ch.push(fa(nE) + " رویدادِ کارنامه از آن پیام پس گرفته شد");
    /* رکوردهای مسئلهٔ زنده (صورت، داده، حدس، گام، فیلدها) ⇐ بخشِ مسئله (A.liveRetract) */
    var pids = {}; try { var bl = AS.boundLive(s); if (bl && bl.pid) pids[bl.pid] = 1; } catch (e) { } if (s.lprob) pids[s.lprob] = 1; (s.lprobLog || []).forEach(function (e) { if (e && e.p) pids[e.p] = 1; });
    Object.keys(pids).forEach(function (pid) { if (typeof A.liveRetract !== "function") return; try { var lr = A.liveRetract(pid, R.srcId, { what: R.what, fix: R.fix, frag: R.frag, old: R.old, msg: clip(R.src.text, 300), n: R.n, at: R.src.at, sess: s.id, by: R.curId });
      var lt = typeof lr === "string" ? lr : lr && typeof lr === "object" ? (Array.isArray(lr.changes) ? lr.changes.join("؛ ") : String(lr.text || lr.msg || "")) : "";
      if (lt && !/^(?:ثبت نشد|چیزی|هیچ)/.test(lt)) ch.push(lt.replace(/^✓\s*/, "")); } catch (e) { console.warn(e); } });
    if (Object.keys(pids).length && typeof A.liveRetract !== "function") pend.push("رکوردهای مسئلهٔ زنده در این نسخه راهِ برگرداندن ندارند — خودش در صفحهٔ مسئله اصلاح کند");
    return { ch: ch, pend: pend, nEv: nE };
  }
  AS.retractApply = function (s, x) { var R = retractCheck(s, x, lastUserMsg(s)); return R.err ? R : retractApply(s, R); };
  /* coach_state.retract — پیش از بقیهٔ گزارش (تا حدسِ درستِ همین پیام تکرار نشود)؛ رکوردهای تازهٔ این نوبت شناسهٔ پیامِ منبع را می‌گیرند */
  function recs19b(s) { var C = s.coach || {}; return [].concat(s.plans || [], C.guesses || [], s.promises || [], s.coachEv || [], C.ansLog || [], C.ownLog || [], C.guess ? [C.guess] : []); }
  if (!AS.DO.coach_state._r19b) {
    var rawCS19b = AS.DO.coach_state;
    AS.DO.coach_state = function (a) {
      var s = AS._turnSession; if (!s || !a || typeof a !== "object") return rawCS19b.apply(this, arguments);
      var um = lastUserMsg(s), mid = msgId19b(um), before = recs19b(s), C = s.coach = s.coach || {}, info = "", res = null;
      if (a.retract && um) { var L = Array.isArray(a.retract) ? a.retract.slice(0, 3) : [a.retract];
        L.forEach(function (x) { var R = retractCheck(s, x, um), RL = C.retracts = C.retracts || [];
          if (R.err) { RL.push({ at: nowIso(), key: mkey(um.text), cur: mid, ok: false, err: R.err, x: { msg: clip(txtOf(x && x.msg), 120), what: String((x && x.what) || ""), fix: clip(txtOf(x && x.fix), 120) } }); return; }
          var o = retractApply(s, R); res = res || { ch: [], pend: [], R: R }; res.ch = res.ch.concat(o.ch); res.pend = res.pend.concat(o.pend);
          RL.push({ at: nowIso(), key: mkey(um.text), cur: mid, src: R.srcId, n: R.n, ok: true, what: R.what, frag: clip(R.frag, 160), fix: clip(R.fix, 160), changes: o.ch, pending: o.pend }); });
        if ((C.retracts || []).length > 60) C.retracts = C.retracts.slice(-60); }
      var a2 = a; if (a.retract) { a2 = Object.assign({}, a); delete a2.retract; }
      var out = rawCS19b.call(this, a2);
      try { recs19b(s).forEach(function (r) { if (r && typeof r === "object" && before.indexOf(r) < 0 && !r.src && mid) r.src = mid; });
        if (res) {
          /* خود-اصلاح بازنگری است، هرگز شکست: شکست/گیرِ همین پیام پس گرفته می‌شود؛ و اگر چیزی واقعاً برگشت، یک شاهدِ «بازنگری» */
          (s.coachEv || []).forEach(function (e) { if (e && !e.wd && !e.ok && e.msg === mid) e.wd = { at: nowIso(), by: mid, why: "خود-اصلاح، نه شکست" }; });
          if (res.ch.length && !C.teach) coachEv(s, "b", "chatok", String(um.text || ""), true, { how: "selfcorr", from: res.R.srcId, pk: C.pk || "" });
          C.retNote = { key: mkey(um.text), cur: mid, frag: clip(res.R.frag, 120), fix: clip(res.R.fix, 120), ch: res.ch.slice(0, 8), pend: res.pend.slice(0, 4), shown: "" };
          if (res.ch.length) info = "✓ اصلاح شد: " + res.ch.slice(0, 4).join(" · ");
        }
        S.put(s); } catch (e) { console.warn(e); }
      return info || out;
    };
    AS.DO.coach_state._r19b = true;
  }
  /* نامزدهای اصلاح (برای پرسشِ «کدام را اصلاح کنم؟»): رکوردهای منبع‌دارِ همین سشن، تازه‌ترین اول */
  function corrCands(s) {
    var C = (s && s.coach) || {}, out = [];
    (C.guesses || []).forEach(function (g) { out.push({ at: g.at, t: "حدسِ " + g.id + " «" + clip(plainTx(g.text), 60).replace(/[«»]/g, "") + "»" }); });
    (s.plans || []).forEach(function (q) { if (planOpen(q)) out.push({ at: q.at, t: "برنامهٔ " + q.id + " «" + clip(plainTx(q.text), 60).replace(/[«»]/g, "") + "»" }); });
    (s.fills || []).forEach(function (f) { out.push({ at: f.at, t: "فیلدِ «" + clip(f.label, 30).replace(/[«»]/g, "") + "» = «" + clip(f.val, 40).replace(/[«»]/g, "") + "»" }); });
    try { var pid = sessPid(s); if (pid) lsteps(pid).forEach(function (st, i) { var o = st && (st.chatRep || (st.out && st.out.from === "chat" ? st.out : null)); if (o) out.push({ at: String(o.at || ""), t: "نتیجهٔ گامِ " + fa(i + 1) + " «" + clip(plainTx(st.text), 40).replace(/[«»]/g, "") + "»" }); }); } catch (e) { }
    return out.sort(function (a, b) { return String(b.at || "").localeCompare(String(a.at || "")); }).slice(0, 6).map(function (x) { return x.t; });
  }
  AS.corrCands = corrCands;
  AS.promptFilters.push(function (outs, s, msg) {
    var out = outs.slice(), mt = String(msg || "").trim(), auto = /^\[سامانه/.test(mt); if (auto || !s) return out;
    var C = s.coach || {}, k = mkey(mt);
    /* ۱) اصلاحی که صفحه نوبتِ پیش انجام داد — زمینه، یک بار: دقیقاً چه عوض شد (و چه نشد) */
    var N = C.retNote; if (N && N.key !== k && (!N.shown || N.shown === k)) { N.shown = k;
      out.push("# اصلاحی که صفحه انجام داد (نوبتِ پیش)\n" + CTX18 + (N.ch.length ? "پیامِ پیشینش را اصلاح کرد («" + N.frag.replace(/[«»]/g, "") + "» ⇐ «" + N.fix.replace(/[«»]/g, "") + "») و صفحه این‌ها را عوض کرد: " + N.ch.join("؛ ") + "." : "پیامِ پیشینش را اصلاح کرد، ولی از آن پیام هیچ رکوردی ثبت نشده بود — چیزی عوض نشد؛ نگو که چیزی را عوض کردی.") +
        (N.pend.length ? " مانده: " + N.pend.join("؛ ") + " (اگر به آن‌جا رفتید، همان را درست کن)." : "") + " اگر در پاسخِ پیشین نگفتی، در یک جمله بگو چه عوض شد؛ چیزِ دیگری را عوض‌شده نخوان.");
      try { S.put(s); } catch (e) { } }
    var own = ownText(mt);
    /* ۲) همین پیام نشانهٔ اصلاحِ حرفِ خودش را دارد ⇒ نامزدها و راهِ گزارش (مدل داوری می‌کند؛ صفحه پیش از گزارش چیزی برنمی‌گرداند) */
    if (CORR19b.test(own) && !OTHER_ERR19b.test(own)) { var cc = corrCands(s);
      out.push("# اصلاحِ پیامِ پیشین (شاید)\n" + CTX18 + "این پیام شاید حرفِ پیشینِ خودش را اصلاح می‌کند. اگر چنین است و روشن است کدام، {\"do\":\"coach_state\",\"retract\":{\"msg\":\"تکهٔ عینیِ پیامِ پیشینش\",\"what\":\"guess|plan|step|ans|said|fact|form\",\"fix\":\"عینِ مقدارِ درست از همین پیام\"}} بده — صفحه همه را برمی‌گرداند و درست را می‌نشاند؛ " +
        "اگر روشن نیست کدام یا مقدارِ درست را نگفته، فقط با پرسشِ «کدام را اصلاح کنم؟»" + (cc.length ? " این نامزدها را پیش بگذار: " + cc.join("، ") : " همان را جویا شو") + " و retract نده؛ اگر دربارهٔ کارِ بیرونی، ایدهٔ تازه یا اشتباهِ تو یا دیگری است، retract نده."); }
    /* ۳) پشتیبان: پیامِ پیشینش نشانهٔ اصلاح داشت و پاسخِ آن گزارشِ وضع نداشت ⇒ فقط پرسش (هرگز برگرداندن) */
    try { var pp = pairPrev(s, mt); if (pp && CORR19b.test(ownText(pp.u.text)) && !OTHER_ERR19b.test(ownText(pp.u.text)) && (pp.rep.actions || []).indexOf("coach_state") < 0 && !CORR19b.test(own)) { var c2 = corrCands(s);
      out.push("# اصلاحِ پیامِ پیشین (پشتیبان، فقط پرسش)\n" + CTX18 + "پیامِ پیشینش نشانهٔ اصلاح داشت («" + clip(pp.u.text, 120).replace(/[«»]/g, "") + "») و گزارشِ وضعِ آن نوبت نیامد — صفحه چیزی را برنگرداند. اگر هنوز روشن نشده، فقط با پرسشِ «کدام را اصلاح کنم؟»" + (c2.length ? " این نامزدها را پیش بگذار: " + c2.join("، ") : "") + "؛ وقتی گفت، retract را گزارش کن."); } } catch (e) { }
    return out;
  });

  AS.tourKinds = KIND;
  AS.tourSyncReminder = syncReminder;
})(APP);
