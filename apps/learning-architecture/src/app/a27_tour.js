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
  var RESULT_RE = /رسید(?:م|یم)?\s*به\s*(?:[0-9۰-۹a-zA-Z(]|جواب|نتیجه|این\s*که|اینکه)|به\s*[0-9۰-۹][^\s]*\s*رسید(?:م|یم)|جواب(?:ش|م)?\s*(?:اینه|این است|می[‌\s]?شه|می[‌\s]?شود|شد(?!ه))|(?:^|[\s.!،؛])تموم\s*شد\s*(?:[.!…]|$)|(?:پس|و)\s*ثابت\s*شد(?!ه)|پیداش\s*کردم|(?:^|[\s.!،؛])حل\s*شد(?:ه)?\s*(?:[.!…]|$)|جواب(?:ش|م)?\s*[:：]?\s*[0-9۰-۹\-−]|(?:^|[\s.!،؛:])پس\s+[^\s=]{1,20}\s*=\s*[0-9۰-۹a-zA-Z(\-−]|رسید(?:م|یم)?\s*به\s*[^\s.،؟?]{1,15}\s*[0-9۰-۹]|تموم\s*شد\s*دیگه|پرونده\s*(?:رو|را)\s*بست(?:م|یم)|خودم\s*ساختمش|(?:[0-9۰-۹]+|دو|سه|چهار|پنج)\s*تا\s*جواب\s*(?:داره|دارد|درآمد|پیدا\s*کردم)|(?:^|[\s.!،؛:])پس\s+[^\s=]{1,20}\s+(?:یا\s+)?[0-9۰-۹]+(?:[.,٫/][0-9۰-۹]+)?(?:\s*یا\s*[0-9۰-۹]+(?:[.,٫/][0-9۰-۹]+)?)+/;
  /* دورِ ۴ (E1، پشتیبان): «جواب ۱.۳»، «پس حجم = …»، «رسید به عرض ۴»، «تموم شد دیگه»، «پرونده رو بستم»، «خودم ساختمش»، «سه تا جواب داره» هم نتیجه‌اند */
  /* بازنگریِ خودش (درس/وارسی/راهِ دیگر) — نشانهٔ «پس از حل» */
  var LOOK_RE = /درس(?:م|ش|ی\s*که\s*گرفتم)?\s*(?:اینه|این است|این بود)|وارسی\s*(?:هم\s*)?(?:کردم|کردیم)|از\s*راهِ?\s*دیگه?(?:‌ای|ی)?\s*هم\s*(?:رسیدم|حل|ثابت)/;
  /* تورِ پولیا دورِ ۵ (F1، عدم‌تقارنِ خطا): نتیجه فقط وقتی «گفته شد» که پس از آن دنباله‌ای نیامده باشد — «پس V = … حالا دیگه فقط y داره» گامِ میانی است (s18)،
     «باغچه تموم شد. حالا حوض…» مسئلهٔ تازه (s29). خواندنِ نادرستِ «نتیجه گفت» پرسشِ پولیا را بی‌صدا می‌پراند (زیان‌بار)؛ خواندنِ نادرستِ «هنوز نه» فقط دوباره می‌پرسد (بی‌زیان). */
  var CONT_RE = /(?:^|[\s.،؛!:])(?:حالا|بعد(?:ش)?(?=\s)|دیگه\s*فقط|فقط\s*مونده|مونده\s*(?:که|تا)|باید\s)/;
  function resultNow(t) { t = String(t || ""); var g = new RegExp(RESULT_RE.source, "g"), m, ok = false; while ((m = g.exec(t))) { if (!CONT_RE.test(t.slice(m.index + m[0].length))) ok = true; if (!m[0].length) g.lastIndex++; } return ok; }
  /* «ثابت شد» از چند شکل/نمونه، بی هیچ استدلالی ⇒ ادعا («برهانش؟»)، نه نتیجه (s03، s14؛ B162، C145) */
  var EVID_RE = /(?:شکل|مثال|حالت|نمونه)(?:‌ها|ها)?\s*(?:رو\s*|را\s*)?(?:کشیدم|امتحان\s*کردم|زدم|چک\s*کردم|دیدم)|برای\s*n\s*=|(?:چند|[0-9۰-۹]+|دو|سه|چهار|پنج|شش|هفت|هشت|نه|ده)\s*تا\s*(?:حالت|مثال|نمونه|شکل)|همیشه\s*[^.!؟?]{0,30}(?:بود|بودن|شد|شدن|درآمد|درست)|درست\s*بود(?:ن)?/;
  var CLAIM_RE = /ثابت\s*شد|اثبات\s*شد|ثابت(?:ش)?\s*کردم|پس\s*(?:درسته|درست\s*است|همیشه)/, ARG_RE = /چون|زیرا|بنابراین|به\s*دلیلِ?|طبقِ?\s|برهان|استقرا|خلف|لانه[‌\s]?کبوتر|اصلِ?\s/;
  function heurClaim(t) { t = faDigits(String(t || "")); return EVID_RE.test(t) && CLAIM_RE.test(t) && !ARG_RE.test(t); }
  AS.coachHeurClaim = heurClaim;
  function solvedSaid(t) { return (SOLVED_RE.test(t) || resultNow(t)) && !heurClaim(t); }
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
  var STUCK_RE = /نتونستم|نتوانستم|باز\s*(?:هم\s*)?نشد|حل\s*نشد|نشد\s*که\s*نشد|گیر\s*(?:کردم|افتادم|کرده‌?ام)|(?:شکست|ناکام)\s*خوردم|از\s*پسش\s*بر\s*نمیام|کم\s*آوردم|جور\s*نمی[‌\s]?(?:شه|شود|ده)|هیچی\s*جور|پس\s*راهی\s*نیست|هیچ\s*(?:کاری|راهی)\s*نمی[‌\s]?(?:شه|شود)(?:\s*کرد)?|گیرم(?!\s*که)(?=[\s.!،؛؟?…]|$)/;   // دورِ ۵ (F1، s38): «هنوز گیرم» (نه «گیرم که…» ِ فرض)
  var NOTKNOW_RE = /نمی[‌\s]?(?:دونم|دانم)|نمیدونم|ایده(?:‌ای)?\s*ندارم|هیچ\s*ایده(?:‌ای)?|یادم\s*(?:نمیاد|نمی[‌\s]?آید|نمی[‌\s]?آد|نیست)/;   // دورِ ۵ (F1، s38): «یادم نمیاد»
  /* B1: آنچه کاربر با حرفِ خودش از فهمِ مسئله گفته (بی آن‌که پرسیده شود) — تورِ پولیا دورِ ۴ (E1): فقط **پشتیبان** وقتی مدل وضع را گزارش نکرد،
     و سخت‌تر: «؟» ِ تنها، هر رقم، «فقط/باید/حداکثر» دیگر نشانهٔ مجهول/داده/شرط نیستند (s01، s02، s16، s30). برچسبِ صریح («مجهول…»، «داده‌ها…»، «شرط…»)
     همیشه؛ بیانِ ضعیف‌تر («می‌خوام بدونم…»، «داریم»، «طوری که») فقط وقتی پیام خودِ صورتِ چسبانده نیست (مسئله پیش‌تر آمده). */
  var ST_LAB = { u: /مجهول|(?:^|[\s،:«])حکم(?:\s|[:：،»]|$)|خواسته(?:‌ی|ِ|ٔ)?\s*(?:مسئله|اینه|این است)/, d: /داده(?:‌ها|ها|ٔ|‌ی)|داده\s*[:：]|(?:^|\s)فرض(?:‌ها|ها)?\s*(?:[:：]|اینه|این است)/, c: /شرط|(?:^|\s)قید/ };
  var ST_WEAK = { u: /می[‌\s]?خوا(?:م|یم|هم)\s*(?:بدونم|بدانم|بفهمم|پیدا\s*کنم|حساب\s*کنم|ثابت\s*کنم)|دنبالِ?\s*[^.؟?]{1,40}\s*(?:هستم|ام|‌ام)(?=\s|[.،؛]|$)|باید\s*(?:پیدا|حساب|ثابت)\s*کنم/,
    d: /(?:^|\s)داریم|می[‌\s]?(?:دونیم|دانیم)|معلومه\s*که/, c: /به\s*شرطی|طوری\s*که|به[‌\s]?طوری|(?:^|\s)نباید|هیچ\s*دو|نه\s*بیشتر\s*از/ };
  function statedParts(t, pasted) { t = faDigits(String(t || "")); var o = {}; ["u", "d", "c"].forEach(function (k) { o[k] = ST_LAB[k].test(t) || (!pasted && ST_WEAK[k].test(t)); }); return o; }
  /* B10: کاربرِ مربی/پدر/مادر (نه حل‌کننده) — قابِ «از یادگیرنده بپرس، حل نکن». دورِ ۴ (E1): «شاگردام…»، «تو شاگرد باش من معلم»، «دخترم یه مسئله داره… چطوری بهش بگم» (s15، s16) */
  var TEACH_RE = /(?:به|برای)\s*(?:بچه|پسر|دختر|شاگرد|دانش[‌\s]?آموز|فرزند)(?:م|ام|‌ام|ها|هام|هایم|‌هام|‌هایم|مون)?\s*(?:یاد\s*بد(?:م|هم)|درس\s*بد(?:م|هم)|توضیح\s*بد(?:م|هم)|کمک\s*کن(?:م)?)|(?:شاگرد|دانش[‌\s]?آموز)(?:م|ام|‌ام|ان|ها|‌هام|هام)\s*(?:گیر|نمی[‌\s]?فهم|نمی[‌\s]?تون)|معلم\s*(?:هستم|ام)|(?:بچه|پسر|دختر)(?:م|ام|‌ام)\s*(?:تو|در|سرِ?)\s*[^.؟?]{1,40}\s*گیر\s*کرده|(?:چطور|چطوری|چگونه)\s*(?:بهش|به\s*او|به\s*اون)\s*یاد\s*بد|شاگرد(?:ا|ها|‌ها)(?:م|ی\s*من)|تو\s*شاگرد\s*باش|(?:بچه|پسر|دختر|شاگرد|فرزند)(?:م|ام|‌ام)[^.؟?]{0,80}(?:چطور|چطوری|چگونه)\s*(?:بهش|به\s*او|به\s*اون)\s*(?:بگم|توضیح\s*بدم|یاد\s*بدم)|(?:بچه|پسر|دختر|شاگرد|فرزند)(?:م|ام|‌ام)\s*(?:یه|یک)\s*(?:مسئله|مساله|سؤال|سوال|تمرین)(?:ی)?\s*(?:داره|دارد)/;   // دورِ ۵ (s16): «دخترم یه مسئله داره: «…؟» … چطوری بهش بگم» — «؟» ِ درونِ صورت جمله را نمی‌بُرد
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
      "- پرسشِ لودهنده ممنوع: نامِ قضیه، حرکت، گزینهٔ درست یا گامِ بعد را نگو («فلان قضیه را به کار ببر» نه؛ «مسئلهٔ آشنایی با همین مجهول می‌شناسی؟» آری). اگر جواب خواست، یک پله کلی‌تر بپرس؛ فقط پس از تلاشِ خودش یک پله خاص‌تر.",
      "- هر جا چیزی توضیح دادی، انگیزهٔ همان گام را هم بگو: چرا حالا این کار، و به کدام بخشِ مجهول نزدیکمان می‌کند. سکوت و درنگ را تحمل کن؛ پرسش را کوتاه‌تر تکرار کن، جوابش را نده.",
      "- نه مکانیکی: پرسشِ پیشنهادی را فقط اگر با وضعِ همین لحظه می‌خواند بپرس؛ وگرنه پرسشِ دیگری از همین فهرست که می‌خواند — هیچ پرسشی بی‌دلیل یا از روی عادت. هدف را جلوی چشمش نگه دار (به پایان بنگر): اگر مسئلهٔ کمکی ساخت یا مجهول و داده هر دو عوض شد، بپرس از آن چطور به مسئلهٔ اصلی برمی‌گردد."];
    // توصیه‌های معلم که در کارتِ «پرسشِ همین لحظه» ِ شبیه‌ساز هم بی‌مدل اجرا می‌شوند (a36_solve.js: askCard / revealMotive)
    var lvNow = c.kind === "prob" && A.simState && A.simState.pid === c.pid ? A.simState.lv : null;
    L.push("- پیش از پرسیدن، از تجربهٔ حل‌کردنِ خودت بپرس: خودت کجای چنین مسئله‌ای گیر می‌کردی و کدام پرسش راهت را باز می‌کرد؟ همان را بپرس، نه پرسشی که فقط در فهرست است.");
    if (lvNow && lvNow <= 2) L.push("- هنوز در سطحِ آشنایی است (سطحِ " + fa(lvNow) + "): برهانِ صوری نخواه — «درستی‌اش را روشن می‌بینی؟» بس است؛ «می‌توانی ثابتش کنی؟» را برای وقتی بگذار که گام را روشن دید (از سطحِ ۳).");
    L.push("- اگر از جبر یا نمادگذاری بیزار است یا آن را بی‌معنا می‌داند، تحمیل نکن و سرزنش نکن: نشان بده همین نماد در همین گام چه کاری را آسان می‌کند (انگیزهٔ گام)، و استدلالِ شهودی‌اش را به رسمیت بشناس.");
    L.push("- طرحی که از بیرون (سرنخ، تو، کتاب) گرفته زود فراموش می‌شود: پس از هر سرنخ بخواه همان گام را به زبانِ خودش بازسازی کند؛ الگو گرفتن گامِ اول است، نه آخر.");
    if (ph === "exec") L.push("- راه‌حل را یکی‌یکی بنویسد: هر گام فقط آنچه برای گفتن دارد، به ترتیب؛ گامی که «روشن» نمی‌بیند علامت بزند.");
    if (ph === "und") L.push("- وقتی مجهول، داده و شرط را به زبانِ خودش گفت، ثبت کن: {\"do\":\"tutor_mark\",\"phase\":\"und\",\"q\":\"…\",\"text\":\"همان جمله‌های خودش\",\"self\":0|1|2} — self فقط اگر خودش گفت (۰ نه، ۱ تا حدی، ۲ کامل)؛ وگرنه بپرس.");
    if (ph === "back") L.push("- «حل شد» پایان نیست: **همیشه** یک پرسشِ بازنگری بپرس (همان پرسشِ پیشنهادی)؛ «حل شد» را تأیید یا رد نکن. پاسخش را با {\"do\":\"tutor_mark\",\"phase\":\"back\",\"q\":\"پرسش\",\"text\":\"پاسخِ خودش\",\"self\":0|1|2} ثبت کن (self فقط از خودارزیابیِ صریحِ خودش) — یک کارتِ مرور می‌سازد که روزهای بعد برمی‌گردد.");
    var od = c.kind === "prob" ? AS.levelOdds(c.pid) : null, sw = od && od.p < 0.5 && !od.last ? od : null;
    // دشواریِ متناسب و لذتِ کشف — از دادهٔ همین سطح، با همان (k+1)/(n+2) و ½ ِ «نمی‌دانیم» (بی آستانهٔ قراردادی)
    if (od && od.last) L.push("- همین حالا گامی را خودش درست زد: لذتِ کشف را کوتاه و دقیق نام ببر (چه چیزی را خودش دید)، بی تعارف." + (od.p > 0.5 ? " در این سطح موفقیت بر شکست می‌چربد؛ اگر سطح را تمام کرد، سطحِ دشوارترِ بعد را پیشنهاد کن — مسئله نه خیلی آسان باشد نه خیلی سخت." : ""));
    if (sw) L.push("- در همین سطح شکست‌ها از موفقیت‌ها بیشترند (" + fa(sw.k) + " درست از " + fa(sw.n) + " تلاش؛ احتمالِ درستیِ گامِ بعد (k+1)/(n+2) = " + fa(Math.round(100 * sw.p)) + "٪، کمتر از ½ ِ «نمی‌دانیم»): پیش از گامِ بعد یک «موفقیتِ کوچک» پیشنهاد کن — حالتِ خاص‌تر یا بخشی از مسئله، «تمرین‌های هم‌خانواده» یا سطحِ آسان با سرنخ — و یک پرسش دربارهٔ حالش (هیجان و انگیزه: دلسردی، ترس از اشتباه، کنجکاوی؟) یا باورش دربارهٔ خودش. امید را بی‌دلداریِ کلیشه‌ای به رسمیت بشناس: فقط به موفقیتِ واقعیِ خودش اشاره کن. اگر این حس در جاهای دیگر هم تکرار می‌شود، جایش گره‌گشاست (خانوادهٔ «هیجان و انگیزه»).");
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
  var GUESS_REF_RE = /حدس(?:م|مون|ش|ِ?\s*اولم)?\s*(?:غلط|اشتباه|رد|نادرست|درست\s*نبود)/;
  var GEN_RE = /کلی[‌\s]?تر|تعمیم|حالتِ?\s*کلی|برای\s*هر\s*n|n\s*(?:دلخواه|تایی|پله‌?ای)|عمومی[‌\s]?تر/;
  var ONLY_ANS_RE = /فقط\s*(?:جواب|پاسخ)|جواب(?:ش|شو)?\s*(?:رو|را)?\s*(?:فقط\s*)?بگو|جوابِ?\s*آخر(?:ش)?\s*(?:رو|را)?\s*بده/;
  var TASTE_RE = /لذت\s*(?:می[‌\s]?برم|بردم)|دوست\s*(?:دارم|داشتم)|خوشم\s*(?:میاد|اومد|می[‌\s]?آید)|سلیقه/;
  var NOTATION_AV_RE = /(?:بدون|بی)\s*(?:x|ایکس|حروف|حرف|متغیر|جبر|نماد)(?![آ-ی])|(?:x|ایکس|حروف|جبر|نماد)[^.؟?]{0,25}(?:بدم\s*میاد|متنفرم|خوشم\s*نمیاد|نمی[‌\s]?خوام)/i;
  var BACKWARD_RE = /(?:از|به)\s*(?:آخر|جواب|خواسته|هدف)\s*(?:به\s*)?عقب|عقب[‌\s]?عقب|برعکس\s*(?:رفتم|حل\s*کردم|اومدم)/;
  var COUNTER_RE = /مثال[‌\s]*نقض|نقض\s*(?:شد|کرد|می[‌\s]?کنه)|(?:با|به)\s*(?:حدس|قانون|فرضیه)[^.،؟?]{0,15}\s*نمی[‌\s]?خونه|خلافِ?\s*(?:حدس|قانون|فرضیه)/;
  var INDIRECT_RE = /چرا\s*(?:باید\s*)?فرض\s*کن(?:م|یم)|فرض\s*کن(?:م|یم)\s*(?:که\s*)?همه|برهانِ?\s*خلف|اثباتِ?\s*غیرمستقیم/;
  /* «چند مجهول»: بیش از یک پرسشِ جدا در یک پیام («…چقدر بسازم؟ … کدوم؟ … کجا؟») یا «هر سه رو با هم» — «؟» ِ درونِ رقم («؟۴۸۷؟») پرسش نیست */
  function manyUnknowns(t) { t = String(t || ""); return /هر\s*(?:دو|سه|چهار|پنج)\s*(?:تا\s*)?(?:رو|را)?\s*(?:با\s*هم|یکجا|یک[‌\s]?جا)/.test(t) || (t.match(/[آ-یa-zA-Z]\s*[؟?](?=\s|$|[»"])/g) || []).length > 1; }
  /* «صورتِ بلند»: بیش از یک جملهٔ معنادار (کل بیش از یک جزء دارد که پیش از جزئیات باید با هم دیده شود) — بی آستانهٔ طول */
  function longStmt(t) { return String(t || "").split(/[.!؟?؛\n]+/).filter(function (x) { return qToks(x).length >= 2; }).length > 1; }
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
      return { q: say, n: x.name_fa || x.name || "", ask: x.t && x.q ? x.q : "", id: x.id || "" };
    }).filter(function (x) { return x.q; });
  }
  AS.polyaProverbsFor = proverbs;
  var OBJ_K = { prove: 1, pod: 1, math: 1, proof: 1, puzzle: 1, objective: 1, homework: 1, exercise: 1, riddle: 1 }, PRACT_K = { practical: 1, decision: 1, project: 1, life: 1, real: 1 };
  /* داورِ مسئلهٔ زنده — یک منبع (ادغامِ G1/G2): A.liveKindInfo ِ بخشِ مسئله (r.p.nat، اثباتی/pod همیشه objective)؛ دیگر هیچ حدسی این‌جا */
  function liveKind(pid) { try { var ki = A.liveKindInfo ? A.liveKindInfo(pid) : null; return ki ? String(ki.kind || "") : ""; } catch (e) { return ""; } }
  /* ردهٔ مربی برای مسئلهٔ زندهٔ بسته‌شده، از همان داده: اثباتی/pod ⇒ prove؛ objective ⇒ obj؛ زندگی/عملی ⇒ pract */
  /* F4 (دورِ ۵، s05، s13، s19، s34): ردهٔ زندگی «life» است، نه «pract» — پرسش‌های عملی («با چه عدد یا واحدی…») برای تصمیمِ زندگی نیست؛ اثباتی فقط وقتی داور برهان است
     (فرضیهٔ زندگیِ «اثبات یا رد کن» برهان ندارد — داورش واقعیت است) */
  function liveClass(pid) { try { var ki = A.liveKindInfo ? A.liveKindInfo(pid) : null; if (!ki) return ""; return ki.kind === "objective" ? (ki.type === "prove" || ki.type === "pod" ? "prove" : "obj") : ki.kind === "life" ? "life" : "pract"; } catch (e) { return ""; } }
  function kindClass(k) { k = String(k || "").split(/[:|]/)[0]; return OBJ_K[k] ? "obj" : PRACT_K[k] ? "pract" : ""; }
  AS.liveKindOf = liveKind;
  AS.liveFrame = function (kind) {
    var c = kindClass(kind);
    if (c === "obj") return "- این مسئله پاسخِ عینی دارد (ریاضی، برهان، معما یا تمرین): پاسخ وجود دارد ولی تو نمی‌دانی — و جای او پیدایش نکن. داوری با برهان و وارسیِ هر گام است، نه با واقعیت: «روشن می‌بینی این گام درست است؟ می‌توانی ثابتش کنی؟». پاسخ یا گامِ بعد را لو نده و فیلدهای صفحه را پر نکن (data-own).";
    if (c === "pract") return "- پاسخِ این مسئله را هیچ‌کس از پیش نمی‌داند — نه تو نه صفحه؛ داور واقعیت است (پیش‌بینی ⇐ نتیجه در موعد) و داوریِ خودِ او. حلش نکن، تصمیم را جای او نگیر و دربارهٔ درستیِ تصمیمش حکم نده. فیلدهای صفحه را پر نکن (data-own).";
    return "- اگر پاسخِ عینی دارد (ریاضی، برهان، معما، تمرین): پاسخ وجود دارد ولی تو نمی‌دانی و لو نمی‌دهی؛ داوری با برهان و وارسیِ گام («روشن می‌بینی؟ می‌توانی ثابت کنی؟»)، نه با واقعیت. اگر تصمیم یا پروژهٔ زندگی است: پاسخ را هیچ‌کس از پیش نمی‌داند و داور واقعیت و داوریِ خودِ اوست. در هر دو: حلش نکن و فیلدهای صفحه را پر نکن (data-own).";
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
  function pickProverb(ph, s, cls, mt) {
    var pv = proverbs(ph, provKeys(ph, cls, mt)); if (!pv.length) return null;
    var used = (s && s.coach && s.coach.prov) || [], fresh = pv.filter(function (x) { return used.indexOf(x.id || x.q) < 0; });
    return (fresh.length ? fresh : pv)[0];
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
  function coachLines(o) {
    o = o || {}; var ph = PH_OF[o.ph] || "p", cls = o.cls || "any", s = o.s || null, mt = String(o.mt || "");
    var qs = (o.qs || []).filter(Boolean); if (!qs.length) qs = phaseQs(ph, cls, o.pid);
    var st0 = ph === "u" && s && s.coach && !o.live ? s.coach.st : null;
    var asked = s ? askedInChat(s) : [], ans = qs.filter(function (q) { return answeredQ(s, q, asked) || statedQ(q, st0); }), open = qs.filter(function (q) { return ans.indexOf(q) < 0; });
    /* D2: پیشنهاد به ترتیبِ کلی ⇐ خاص بر پایهٔ پلهٔ کاربر در همین مرحله (چند پرسشِ آن پاسخ گرفته) — نخستین پرسشِ پاسخ‌نگرفته؛ نه با شمارِ پیام.
       E3 (دورِ ۴، s08): در طرح، رو به جلو گیر کرده ⇒ «از خواسته به عقب» نخست (اگر هنوز پاسخ نگرفته) */
    var back = ph === "p" && o.stuck ? open.filter(function (q) { return /به\s*عقب/.test(q); })[0] : "";
    var sug = back ? back : o.sug && open.indexOf(o.sug) >= 0 ? o.sug : o.sug && !answeredQ(s, o.sug, asked) ? o.sug : open.length ? open[0] : "";
    /* E1: شناسهٔ هر پرسش (u1، p3، e2، b1 …) — مدل در گزارشِ وضع با همین شناسه می‌گوید کدام پرسش پاسخ گرفت */
    if (s && !o.live) { var C1 = s.coach = s.coach || {}; C1.qmap = {}; qs.forEach(function (q, i) { C1.qmap[QID[ph] + (i + 1)] = q; }); }
    /* F4 (دورِ ۵): سرواژه از نوع × داور — اثباتیِ عینی «اثباتی»، pod ِ عینی «اثبات یا رد (حدس)»، pod ِ زندگی/عملی «فرضیه»، زندگی «تصمیمِ زندگی» */
    var podLife = o.ptype === "pod" && (cls === "life" || cls === "pract");
    var L = ["# مربیِ حل (روحِ «چگونه آن را حل کنیم») — کمک نه خیلی کم، نه خیلی زیاد · مرحلهٔ محتمل: " + PH_FA[ph] + (podLife ? " · فرضیه (داور: واقعیت و داوریِ خودش، نه برهان)" : cls === "prove" ? (o.ptype === "pod" ? " · اثبات یا رد (حدس)" : " · اثباتی") : cls === "obj" ? " · پاسخِ عینی" : cls === "pract" ? " · تصمیم/کارِ واقعی (داور واقعیت)" : cls === "life" ? " · تصمیمِ زندگی (داور: واقعیت و داوریِ خودش)" : "") + (o.teach ? " · کاربر مربیِ یادگیرنده است" : "") +
      " — اگر این نوبت دربارهٔ حلِ مسئله، حدس یا ادعایی نیست، این بلوک را نادیده بگیر."];
    L.push("- قاعدهٔ سبک: هر پیام فقط **یک ایده** و حداکثر **یک پرسش**، از کلی به خاص؛ کوتاه. جواب، نامِ قضیه، گزینهٔ درست یا گامِ بعد را لو نده.");
    if (o.teach) L.push("- **قابِ مربی (B10):** کاربر می‌خواهد به یادگیرنده‌اش (فرزند/شاگرد) یاد بدهد — او حل‌کننده نیست. پرسش‌هایی پیشنهاد کن که **او از یادگیرنده بپرسد** (کلی ⇐ خاص، یکی‌یکی، با درنگ)، هرگز پاسخ یا راه‌حل برای گفتن به یادگیرنده؛ مرحله مرحلهٔ یادگیرنده است. «خودم حلش کردم» یعنی خودِ او — بپرس یادگیرنده کجاست و کدام پرسش را از او پرسید.");
    L.push("- پرسش‌ها را مکانیکی نخوان " + (srcQ("A164") || "") + ": فقط پرسشی که با وضعِ همین لحظه می‌خواند. هیچ قاعدهٔ خطاناپذیری برای کشف نیست " + (srcQ("B233") || "") + " — فهرست راه‌نماست، نه دستور.");
    /* مسئلهٔ زندهٔ بسته‌شده (o.live): پرسش و فهرست فقط از بلوکِ «مسئلهٔ زندهٔ این سشن» (A.liveCoach ِ بخشِ مسئله) — یک منبعِ پرسش در هر نوبت (ادغامِ G1/G2) */
    if (o.live) L.push("- پرسشِ این نوبت: **فقط** همان یک پرسشی که «مسئلهٔ زندهٔ این سشن» (بالا) می‌دهد، از همان فهرستِ «" + PH_FA[ph] + "» ِ صفحه — پرسشِ دیگری از فهرستِ دیگری نیاور. پرسشی را که در صفحه یا همین گفت‌وگو جواب داده دوباره نپرس." +
      (o.claim ? " **می‌گوید حل شد، ولی صفحه هنوز «" + PH_FA[ph] + "» است" + (o.claim !== true ? " (" + clip(o.claim, 90) + ")" : "") + ":** «حل شد» را تأیید نکن و جشن نگیر؛ او را به «✅ حل شد» و بازنگریِ خودِ صفحه ببر." : ""));
    else L.push("- پرسش‌های «" + PH_FA[ph] + "» (کلی ⇐ خاص): " + qs.map(function (q, i) { return QID[ph] + (i + 1) + ") " + q + (ans.indexOf(q) >= 0 ? " [در گفت‌وگو پاسخ گرفته — دوباره نپرس]" : ""); }).join(" ") +
      (sug ? " · پیشنهادِ این نوبت: «" + sug + "»" : " · همه در گفت‌وگو پاسخ گرفته‌اند: بپرس «الان از خودت چه می‌پرسی؟» یا به مرحلهٔ «" + PH_FA[PH_NEXT[ph]] + "» برو") +
      ". اگر حرف‌هایش نشان می‌دهد از این مرحله گذشته، از نخستین پرسشِ «" + PH_FA[PH_NEXT[ph]] + "» شروع کن. پرسشی را که در همین گفت‌وگو جواب داده دوباره نپرس.");
    L.push(STATE_RULE);
    L.push("- سکوت، «نمی‌دونم» یا پاسخِ بی‌ربط ⇒ همان پرسش را با **تغییرِ کوچک** تکرار کن (کوتاه‌تر، یا از زاویهٔ دیگر)، نه پرسشِ تازه و نه جواب.");
    L.push("- حلِ مسئله مهارتی عملی است، مثلِ شنا " + (srcQ("A088") || "") + ": او حل می‌کند و تو «معلمِ خیالی» ِ کنارش هستی " + (srcQ("A069") ? "(" + srcQ("A069") + ") " : "") + "— دعوتش کن بلند فکر کند و از خودش بپرسد «معلمِ خوب الان از من چه می‌پرسید؟». بلند فکر کردن را **الگو کن**: گاهی یک سطرِ کوتاهِ گفت‌وگوی درونی (مثلاً «از خودم می‌پرسم: دقیقاً چه می‌خواهم؟ …») " + (srcQ("B237") || "") + "، بعد نوبت را به او بده.");
    if (qs.length && A.qRung) {
      var own = A.Q_OWN_RUNG || 3, rg = qs.map(function (q) { var n = 0; try { n = A.qRung(q) || 0; } catch (e) { } return { q: q, n: n }; });
      L.push("- سطحِ استقلالِ کاربر در پرسش‌های همین مرحله (پلهٔ نردبانِ ۱/۳/۷/۲۱/۶۰ از کاربست‌های خودش): " + rg.map(function (x) { return "«" + clip(x.q, 40) + "» پلهٔ " + fa(x.n); }).join("؛ ") +
        ". کمک را به همین اندازه کم کن: پلهٔ ۰ ⇐ پرسش را کامل بپرس؛ پلهٔ ۱ تا " + fa(own - 1) + " ⇐ کوتاه‌تر و کلی‌تر؛ پلهٔ " + fa(own) + " به بالا ⇐ نپرس، بپرس «الان از خودت چه می‌پرسی؟».");
      /* F6 (دورِ ۵، s30): از پلهٔ استقلال به بالا (A.Q_OWN_RUNG، از نردبانِ خودِ پرسش) معلمِ خیالی **به نام** می‌آید و پاسخ از پیامِ خودِ او بلندتر نیست —
         کم کردنِ کمک نسبی است (به اندازهٔ حرفِ خودش)، نه با عددِ ثابت */
      var sr = 0; try { sr = sug ? A.qRung(sug) || 0 : 0; } catch (e) { }
      if (sug && sr >= own && mt) L.push("- از پلهٔ " + fa(own) + " به بالا (این پرسش پلهٔ " + fa(sr) + "): او حالا **معلمِ خیالیِ خودش** است " + cite("A069") + " — به‌جای پرسیدن بگو «معلمِ خیالی‌ات الان چه می‌پرسید؟» و منتظر بمان. پاسخت بلندتر از پیامِ خودش (" + fa(mt.length) + " نویسه) نباشد — کمک نه زیاد نه کم " + cite("A074") + ".");
    }
    L.push("- پایانِ نردبانِ سرنخ (" + (srcQ("C188") || "C188") + "): اگر جدی تلاش کرده" + (o.tries ? " (تا حالا " + fa(o.tries) + " پیام)" : "") + " و خاص‌ترین سرنخ را هم گرفته و هنوز گیر است — اگر نردبان تمام شد: ایدهٔ کلیدی را جدا کن و فقط گامِ بعد را بگو، سپس «کتاب را ببند و خودت دوباره حل کن»؛ و پس از بازسازیِ خودش، بازنگری.");
    L.push("- گامِ کوچک ارزش دارد " + (srcQ("B076") || "") + (srcQ("C153") ? " " + srcQ("C153") : "") + ": اگر گامش را ناچیز شمرد، دقیق بگو همان گام چه چیزی را جلو برد (بی تعارف). دلسردی، شرم، خشم، «وقتم هدر رفت»، «استعدادشو ندارم» یا میلِ رها کردن ⇒ 🌱 کوچک‌ترین گامِ بعد (حالتِ خاص، بخشی از شرط)، بی دلداریِ کلیشه‌ای و بی حکم دربارهٔ او.");
    L.push("- ادعای محلِ بحث («حق داره؟»، «درسته؟»، «همیشه برقراره؟») یا حدسِ تازه ⇒ داوری نکن: «ثابتش کن یا با مثالِ نقض ردش کن — کدام را اول امتحان می‌کنی؟»." + (/حق\s*(?:داره|دارد|با\s*(?:اون|او|کیه))|راست\s*می[‌\s]?گ|درسته\s*[؟?]|درست\s*می[‌\s]?گه/.test(mt) ? " **همین پیام چنین ادعایی است.**" : ""));
    if (ph === "u" || ph === "p") L.push("- شکل " + (srcQ("B139") || "") + ": اگر به کار می‌آید، بخواه شکل یا جدولی بکشد و در گفت‌وگو توصیفش کند (یا عکسش را پیوست کند) — حتی اگر مسئله هندسی نیست.");
    if (ph === "c" || ph === "p") L.push("- سلیقه و درنگ (B14): در مکثی طبیعی بپرس تا این‌جا کدام بخشش را دوست دارد و کدام را نه " + (srcQ("C120") || "") + " (C120؛ و پس از تلاشِ خودش، حلِ نویسندگانِ خوب — C117)؛ اگر خسته یا گیر است، ایدهٔ خوب پس از تلاشِ جدی می‌آید — «بگذار ته‌نشین شود، بعد برگرد» (کارِ ناخودآگاه، D009: فقط مسئله‌ای ته‌نشین می‌شود که جدی رویش کار شده — کنار گذاشتنِ آگاهانه، نه رها کردن؛ وقتی برگشت بپرس «چه چیزی به ذهنت رسید؟»). حلِ نویسنده‌ای خوب را فقط پس از تلاشِ خودش.");
    if (ph === "b") L.push("- بازنگری مهم‌ترین بخشِ کار است " + (srcQ("C115") || "") + " و هیچ مسئله‌ای کاملاً تمام نمی‌شود " + (srcQ("A138") || "") + ": «حل شد» را تأیید یا رد نکن؛ یک پرسشِ بازنگری بپرس. اگر بازنگری را بیهوده خواند، همین دو جمله را آرام بگو. سلیقه " + (srcQ("C120") || "") + ": کدام بخشش را دوست داشت؟ و " + (srcQ("C117") || "تقلید و تمرین") + " — حلِ نویسنده‌ای خوب را بخواند و بعد بی‌نگاه بازسازی کند.");
    /* E8 (دورِ ۴): سطرهای همان مرحله از دفترِ پوششِ منبع (sources/polya_how_to_solve_it: A038/B052، A263/B188–B189، B162، C168) */
    if (ph === "u" || ph === "p") L.push("- به تعریف‌ها برگرد " + (srcQ("A038") || "") + ": اگر واژهٔ کلیدیِ صورت یا شرط مبهم است — در مسئلهٔ زندگی هم («شریکِ جرم یعنی چه؟»، «موفق یعنی چه؟») — بپرس دقیقاً یعنی چه؛ بازگشت به تعریف خودش تغییرِ مسئله است " + (srcQ("B052") || "") + ".");
    /* F6 (دورِ ۵، s14، s20): پارادوکسِ مخترع هر جا حرف از کلی‌تر کردن است (حتی در فهم: «کلی‌تر که سخت‌تره!») و برچسبِ «ناتمام — اکتشافی» هر جا استدلالِ محتمل به‌جای برهان آمد */
    if (ph === "p" || GEN_RE.test(mt)) L.push("- پارادوکسِ مخترع " + cite("A263") + ": اگر مسئلهٔ خاص گیر است، مسئلهٔ کلی‌تر یا جاه‌طلبانه‌تر گاهی آسان‌تر است — به شرطِ بینش، نه ادعا " + (srcQ("B189") || "") + "." + (GEN_RE.test(mt) ? " **همین پیام دربارهٔ کلی‌تر کردن است:** اگر «کلی‌تر سخت‌تر است» گفت، رد نکن؛ بپرس در حالتِ کلی چه چیزی آشکار می‌شود که در عددِ خاص پنهان است." : ""));
    var hc = heurClaim(mt);
    if (((ph === "c" || ph === "b") || hc) && cls !== "pract" && cls !== "life") L.push("- استدلالِ اکتشافی (چند حالت، الگو، قیاس، شکل) راهنماست نه برهان " + cite("B162") + ": اگر نتیجه فقط از آن آمده، او را به برچسبِ «ناتمام — اکتشافی» برسان تا ثابت شود؛ «حل شد» نگو.");
    if (hc) L.push("- **این «ثابت شد» از چند نمونه/شکل آمده، نه از برهان** " + cite("C145") + ": به بازنگری نبر و «درست است» نگو؛ بپرس «برهانش؟ — چرا برای **هر** حالت، نه فقط این‌ها؟». نمونه‌ها حدس را محتمل‌تر می‌کنند، ثابتش نمی‌کنند.");
    /* F6 (دورِ ۵): سطرهای کتاب در لحظهٔ خودشان (نه بسته به مرحله)، هر یک با شناسهٔ موردِ دفترِ پوشش */
    if (GUESS_REF_RE.test(mt) || o.refuted) L.push("- حدسش رد شد: این همان اصلِ عام است — «حدس بزن، ولی حدست را بیازما» " + cite("B231") + ". کارِ درستش را نام ببر (حدس را آزمود، نه این‌که «اشتباه کرد») و بپرس از ردش چه آموخت و کدام فرضِ پنهان شکست.");
    if (o.teach) L.push("- **پرسشِ بد چرا بد است** (" + cite("A167") + "): پرسشی که جواب یا قضیه را لو می‌دهد («اینجا باید از تشابه استفاده کنیم، نه؟») (۱) خیلی خاص است و به یادگیرنده‌ای که دور است کمکی نمی‌کند، (۲) چیزی برای مسئلهٔ بعد یاد نمی‌دهد، (۳) مثلِ خرگوش از کلاه بیرون می‌آید " + cite("A169") + " — پرسشِ خوب کلی و طبیعی است و خودِ او هم می‌توانست از خودش بپرسد (A168). " +
      "و **طرحی که از اقتدارِ معلم/پدر پذیرفته شود زود فراموش می‌شود** " + cite("A129") + ": کمک کن یادگیرنده طرح را خودش بیابد، حتی اگر کندتر است.");
    if (manyUnknowns(mt)) L.push("- چند مجهول با هم خواست: همه را یک‌جا نگشا — بخواه خودش آن‌ها را زیرمسئله‌های جدا کند و **ترتیب را خودش بگذارد** (کدام اول؟ کدام به دیگری بسته است؟) " + cite("A044") + "؛ تجزیه به تدریج و نه بیش از نیاز " + cite("A293") + ".");
    if (o.intro && longStmt(mt)) L.push("- اول کل را ببین " + cite("A191") + ": پیش از هر جزئیات و پارامتر، بخواه مسئله را در **یک جمله** به زبانِ خودش بگوید؛ کار روی جزئیات پیش از فهمِ کل عادتِ بدی است " + cite("A294") + ".");
    if (ONLY_ANS_RE.test(mt)) L.push("- «فقط جواب» خواست: پیش از **نخستین** سرنخ بپرس خودش تا کجا رفته و کجا ماند — تلاشِ خودش را بشنو، بعد سرنخِ اول را بر همان بنا کن " + cite("A073") + "؛ کمکی بده که از ذهنِ خودش هم می‌توانست بگذرد " + cite("A076") + ". جواب را نده.");
    if (TASTE_RE.test(mt)) L.push("- از سلیقه‌اش گفت: جدی بگیرش — شناختنِ علایق، بیزاری‌ها و سلیقهٔ خود نخستین کشفِ مهم است " + cite("C120") + "؛ پیشنهاد کن حلِ نویسندگانِ خوب در همان خط را بخواند و تقلید و تمرین کند " + cite("C117") + ".");
    if (NOTATION_AV_RE.test(mt)) L.push("- از نماد/حروف بیزار است: تحمیل نکن و سرزنش نکن؛ بگذار سودش را خودش تجربه کند — مثلاً جمعِ دو عدد با ارقامِ رومی را با ارقامِ معمولی مقایسه کند " + cite("B241") + "؛ معادله‌نویسی ترجمه از زبانِ عادی به زبانِ نماد است " + cite("B243") + " — ستونِ «واژه | نماد» با واژه‌های خودش.");
    if (BACKWARD_RE.test(mt)) L.push("- کار به عقب شاخه می‌دهد: بخواه هر شاخه را جدا بنویسد و نشانه‌های هر کدام را نگه دارد؛ نبودِ نشانه هشدارِ بن‌بست است " + cite("C094") + " — شاخهٔ رقیب را پیش از رها کردنِ این یکی نام ببرد (" + "C169" + ").");
    if (ABANDON_RE.test(mt)) L.push("- می‌خواهد کلِ راه را دور بریزد: نشانه‌ها گاهی فریب می‌دهند " + cite("C095") + " — شاید فقط یک حلقه باید عوض شود؛ پیش از رها کردنِ مسیر کمی بیشتر پافشاری کن " + cite("C096") + ": بپرس کدام حلقه دقیقاً شکست.");
    if (COUNTER_RE.test(mt)) L.push("- مثالِ نقض آمد: یک استثنا برای ردِ گزارهٔ کلی بس است " + cite("C107") + " — ولی ادعا را دور نینداز: **دامنه‌اش را تنگ کن** (برای کجا هنوز درست است؟) و حدسِ تنگ‌شده را دوباره بیازما.");
    if (ph === "b" && cls === "prove") L.push("- فرع " + cite("A284") + ": از همین نتیجه چه نتیجهٔ آسانِ دیگری بی‌درنگ درمی‌آید (مثلاً n ⇐ ∞، یا حالتِ خاصِ مهم)؟ همین بازنگری است.");
    if (INDIRECT_RE.test(mt)) L.push("- «چرا فرض کنم همه برقرارند؟» (اثباتِ غیرمستقیم): رویهٔ ذهن‌باز — همهٔ بخش‌های شرط را **فرضاً** برقرار می‌گیریم تا ببینیم به کجا می‌رسد، نه چون باورشان داریم " + cite("C055") + "؛ با وضعِ فرضی ذهن‌باز روبه‌رو شو " + cite("C052") + " — اگر به تناقض رسید، همان فرض نادرست است.");
    if (ph === "b") L.push("- قارچ‌ها خوشه‌ای می‌رویند " + (srcQ("C168") || "") + ": پس از نخستین کشف اطراف را بنگر — همین روش یا نتیجه چه مسئلهٔ نزدیکِ دیگری را حل می‌کند؟");
    if (OWN_PROV_RE.test(mt)) L.push("- **کاربر ضرب‌المثل یا قاعدهٔ عامیانهٔ خودش را آورد:** جدی بگیر و رد نکن، ولی هر ضرب‌المثلی ضدی دارد (C150): بپرس ضدش چه می‌گوید و کدام به همین لحظه می‌خورد؛ اگر تقدیرگرایانه است («آب که از سر گذشت…»)، کوچک‌ترین گامی را بپرس که هنوز در دستِ خودش است.");
    var wk = weakPhase(); if (wk) L.push(wk);
    var pv = pickProverb(ph, s, cls, mt);
    if (pv) {
      var opp = PROV_OPP[pv.id] && provText(PROV_OPP[pv.id]);
      L.push("- ضرب‌المثلِ همین مرحله (پولیا، «حکمتِ ضرب‌المثل‌ها»): «" + clip(pv.q, 140) + "»" + (pv.ask ? " ⇐ همان پرسش: «" + clip(pv.ask, 120) + "»" : pv.n ? " — " + clip(pv.n, 60) : "") + ". فقط اگر به حالِ همین لحظه می‌خورد، یک بار و کوتاه؛ هر ضرب‌المثلی ضدی هم دارد" + (opp ? " («" + clip(opp, 90) + "»)" : "") + " و ضرب‌المثل‌ها قاعدهٔ خطاناپذیر نیستند (C150).");
      if (s && !o.dry) { var C0 = s.coach = s.coach || {}; C0.prov = (C0.prov || []).concat([pv.id || pv.q]).slice(-30); }
    }
    if (o.closed) L.push("- مسئلهٔ «" + clip(o.closed, 60) + "» بسته شده است؛ حدس یا ادعای تازه‌اش مسئلهٔ تازه است: همین مربی، از «فهم» — اثبات یا رد؛ اگر می‌خواهد نگهش دارد {\"do\":\"chat_invent\",\"statement\":\"عینِ حرفش\"}.");
    if (o.mid) L.push(o.mid);
    L.push("- حلی که در همین گفت‌وگو تمام شد بی بازنگری رها نشود: پس از بازنگریِ خودش {\"do\":\"chat_solved\",\"title\":\"…\",\"statement\":\"عینِ صورتِ مسئله\",\"kind\":\"find|prove|pod\",\"lesson\":\"درسِ خودش به قلمِ خودش\",\"check\":\"وارسیِ خودش\"} (همان مسئله دوباره ساخته نمی‌شود؛ به‌روز می‌شود). مسئلهٔ تازه‌ای که خودش ساخت و هنوز حل نکرده: {\"do\":\"chat_invent\",\"statement\":\"عینِ حرفش\",\"title\":\"…\",\"nat\":\"objective|practical|life\"} (nat: پاسخِ عینی ⇐ objective، کارِ واقعی با کمیت ⇐ practical، تصمیمِ زندگی ⇐ life)؛ اگر همین‌جا حلش کرد، chat_solved.");
    return L.join("\n");
  }
  AS.coachLines = coachLines;
  /* مرحلهٔ ضعیف‌ترِ همین کاربر — فقط به‌صورتِ احتمال از کارنامهٔ ذهن (A.MIND.phases ِ a29: (k+1)/(n+2) و «احتمالِ ضعیف‌ترین بودن»)؛
     هرگز برچسب («تو در طرح ضعیفی»)، بی آستانه؛ بی‌داده هیچ نمی‌گوید (هر چهار ¼ یعنی نمی‌دانیم) */
  function weakPhase() {
    var M0 = A.MIND; if (!M0 || typeof M0.phases !== "function") return "";
    var Q = null; try { Q = M0.phases(); } catch (e) { return ""; }
    if (!Q || !Q.n || !Q.rows || !Q.rows.length) return "";
    var pc = function (p) { return fa(Math.round(100 * p)) + "٪"; };
    return "- چهار مرحلهٔ حل در دادهٔ خودِ این کاربر (احتمال، نه برچسب؛ " + fa(Q.n) + " نمونه): " + Q.rows.map(function (X) { return X.fa + " — احتمالِ ضعیف‌ترین بودن " + pc(X.pWeak || 0); }).join("؛ ") +
      ". به او برچسب نزن و حکم نده؛ اگر به کار آمد، در همان مرحله‌ای که احتمالش بیشتر است کمی بیشتر مکث کن و پرسشِ همان مرحله را بپرس.";
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
  var LIVE_FALLBACK = "# مسئلهٔ واقعیِ حل‌نشده («🔭 مسئلهٔ حل‌نشدهٔ خودم»)\n- کاربر یک مسئله، تصمیم، انتخاب، قیمت یا جاشدنِ واقعیِ بازِ خودش را آورده: پاسخ را جای او نده. اگر می‌خواهد حلش کند، با {\"do\":\"live_new\",\"title\":\"…\",\"statement\":\"عینِ حرفِ خودش\"} ثبتش کن و او را به صفحه‌اش ببر (شناسه در نوبتِ بعد در «مسئلهٔ زندهٔ این سشن»)؛ هر نوبت یک پرسش از کلی به خاص — اول مجهول (دقیقاً چه می‌خواهد)، داده‌ها و شرط. هیچ فیلدِ فهم، داده، پیش‌بینی یا نتیجه را پر نکن (data-own).";
  /* «🌱» فقط پس از نشانهٔ واقعیِ شکست، بی‌پیشرفتی یا دلسردیِ خودِ کاربر (تورِ پولیا s13: «اخراج می‌شه» دربارهٔ همکار، در پیامِ نخست).
     دورِ ۲ (rerunA/C/D): واژه‌نامهٔ گسترده‌تر — «ولش کنم»، «پس راهی نیست»، «هیچ کاری نمیشه کرد»، «عصبانیم»، «وقتم هدر رفت»، «استعدادشو ندارم»، «انصراف بدم»، «خجالت کشیدم»؛
     و قاعدهٔ مدل‌محورِ مربی (هر نوع دلسردی/شرم/رها کردن ⇒ 🌱) کنارش، تا نشانه به یک فهرست بند نباشد. */
  var FAIL_ME = /(?:شکست|ناکام)\s*خوردم|ناامید(?:م|\s*شدم|\s*شده‌?ام)|دلسرد(?:م|\s*شدم)|ول\s*(?:می[‌\s]?)?(?:کنم|کردم)|ولش\s*(?:می[‌\s]?)?(?:کنم|کردم)|(?:بعد|پس)\s*از\s*(?:نقد|انتقاد|شکست|رد\s*شدن)(?:ِ|\s)|بی[‌\s]?خیال(?:ش)?\s*(?:می[‌\s]?)?شم|رها(?:ش)?\s*(?:می[‌\s]?)?(?:کنم|کردم)|نتونستم|نتوانستم|از\s*پسش\s*بر\s*نمیام|دیگه\s*نمی[‌\s]?(?:تونم|خوام\s*ادامه)|خسته\s*شدم|جا\s*زدم|کم\s*آوردم|(?:بهم|به\s*من|از\s*کارم|از\s*ایده‌?ام)\s*(?:ایراد|انتقاد)\s*(?:گرفت|کرد)|(?:ایده|طرح|کار|نوشته)(?:‌?ام|م)\s*(?:رو|را)\s*(?:رد|نقد|مسخره)\s*کرد|باز\s*(?:هم\s*)?نشد|حل\s*نشد|نشد\s*که\s*نشد|افتادم|رد\s*شدم|پس\s*راهی\s*نیست|هیچ\s*(?:کاری|راهی)\s*نمی[‌\s]?(?:شه|شود)(?:\s*کرد)?|عصبانی(?:م|ام|\s*شدم|\s*هستم)|اعصابم\s*(?:خورده?|خرده?|به\s*هم\s*ریخت)|وقتم\s*(?:هدر|تلف)\s*(?:رفت|شد)|استعداد(?:ش|شو|ش\s*رو)?\s*(?:رو\s*|را\s*)?ندارم|انصراف\s*(?:بدم|می[‌\s]?دم|دادم|بدهم)|خجالت\s*(?:کشیدم|می[‌\s]?کشم)|شرمنده(?:‌ام|م)|به\s*درد\s*نمی[‌\s]?خورم|من\s*(?:کودن|احمق|خنگ)(?:م|ی)?|خیلی\s*خسته(?:‌ام|ام|م|\s*هستم)|تو\s*رو\s*خدا/;   // دورِ ۴ (E1): التماسِ خستگی «خیلی خسته‌ام… تو رو خدا»
  AS.FAIL_ME = FAIL_ME;
  AS.willSignal = function (s, msg) {
    /* F3 (دورِ ۵، s28): «# پس از شکست» فقط در نوبتِ شکست و نوبتِ بعد — پیامِ همین نوبت و پیامِ پیش از آن (نه سه پیامِ آخر)؛ گامِ ناکامِ صفحه فقط اگر از نوبتِ پیش به این سو ثبت شد */
    var UM = ((s && s.msgs) || []).filter(function (m) { return m.role === "user"; }), cur = UM.length && mkey(UM[UM.length - 1].text) === mkey(msg) ? UM.length - 1 : UM.length, pv = UM[cur - 1];
    if (FAIL_ME.test([String(msg || ""), pv ? pv.text : ""].join(" \n "))) return "word";
    var since = UM[cur - 2] ? String(UM[cur - 2].at || "") : "";
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
  function compactLive(s, pid, nq, dataOk) {
    var r = A.liveRec(pid), ph = A.livePhase ? A.livePhase(pid) : "", kind = liveKind(pid), pg = S.get("eprog_" + pid) || {}, so = pg.solve || {}, u = (so.u && so.u[1] && so.u[1].done) ? so.u[1] : null, L = so.live || {};
    var out = ["# مسئلهٔ زندهٔ این سشن (" + pid + "): «" + clip(r.p.title, 80) + "» · مرحله: " + (PHN2[ph] || ph) + " · داور: " + (NATN[kind] || kind || "؟") + " — (فشرده؛ این سشن به همین مسئله بسته است، حتی بیرون از صفحه‌اش)",
      "- صورت (عینِ حرفِ خودش): «" + clip(r.p.statement, 220) + "»"];
    if (u) out.push("- فهمِ خودش: مجهول «" + clip(u.u || u.one || "", 100) + "»" + ((u.dl || []).length ? " · داده‌ها: " + u.dl.map(function (d) { return "«" + clip(d.t, 40) + "»"; }).join("، ") : "") + (u.c ? " · شرط «" + clip(u.c, 100) + "»" : ""));
    out.push(AS.liveFrame(kind));
    if (ph !== "u" && dataOk !== false) { var ul = unusedLine(pid); if (ul) out.push(ul); }
    var co = nq && nq.coach; if (co && co.condUnused && co.condUnused.length && (ph === "c" || ph === "b") && kind === "objective") out.push("- بخش‌هایی از شرط که هنوز در هیچ گامی نیامده‌اند: " + co.condUnused.map(function (x) { return "«" + clip(x, 50) + "»"; }).join("، "));
    if (co && co.closure && co.closure.state !== "open") out.push("- وضعِ بستن: " + co.closure.label + (co.closure.state === "incomplete" || co.closure.state === "closing" ? " — «حل شد» نگو و جشن نگیر." : ""));
    var rl = refutedLine(pid); if (rl) out.push(rl);
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
  function solvedBlock(pid, blind) {
    var r = A.liveRec(pid); if (!r) return "";
    var pg = S.get("eprog_" + pid) || {}, so = pg.solve || {}, L = so.live || {}, u = (so.u && so.u[1] && so.u[1].done) ? so.u[1] : {}, bk = (so.b && so.b[1] && so.b[1].done) ? so.b[1] : {};
    var cl = null; try { cl = A.liveClosure ? A.liveClosure(pid) : null; } catch (e) { }
    var last = (L.steps || []).filter(function (x) { return x.closed && x.out && !x.out.auto; }).pop();
    var res = bk.glance || (L.chat && L.chat.solution) || (last ? clip(last.text, 80) + (last.out.what ? " ⇒ " + clip(last.out.what, 80) : "") : "");
    var out = ["# مسئلهٔ حل‌شدهٔ مرتبط (" + pid + "): «" + clip(r.p.title, 80) + "» · " + (cl && cl.label ? cl.label : "بسته شده") + (L.stateAt ? " · " + String(L.stateAt).slice(0, 10) : "")];
    if (blind) out.push("- اول مرورِ بی‌نگاه: پیش از یادآوری بپرس «یادت هست مجهول و راهت چه بود؟» — بعد از این‌ها برای پیوند استفاده کن (مسئلهٔ مرتبطِ حل‌شده: «نتیجه‌اش را به کار می‌بری؟ روشش را؟»).");
    if (u.u || u.c) out.push("- مجهول «" + clip(u.u || u.one || "", 100) + "»" + (u.c ? " · شرط «" + clip(u.c, 100) + "»" : ""));
    if (L.plan && L.plan.t) out.push("- روش (طرحِ خودش): «" + clip(L.plan.t, 140) + "»");
    if (res) out.push("- نتیجه: «" + clip(res, 160) + "»");
    if (bk.use || bk.chkHow) out.push("- بازنگریِ " + (bk.own === false ? "ثبت‌شده (به قلمِ دستیار، نه خودش)" : "خودش") + ": " + (bk.use ? "درس «" + clip(bk.use, 120) + "»" : "") + (bk.chkHow ? (bk.use ? " · " : "") + "وارسی «" + clip(bk.chkHow, 100) + "»" : ""));
    out.push("- اگر حرفِ تازه‌اش مسئلهٔ تازه است، از «فهم» شروع کن (همین مربی)؛ نگه داشتنش: {\"do\":\"chat_invent\",\"statement\":\"عینِ حرفش\",\"from\":\"" + pid + "\"}.");
    return out.join("\n");
  }
  AS.solvedBlock = solvedBlock; AS.relatedDone = relatedDone;
  /* «دادهٔ به‌کاررفته» ِ صادق (R3): فقط از A.liveUnused ِ بخشِ مسئله — هرگز این‌جا دوباره ساخته نمی‌شود (ادغامِ G1/G2)؛ و حدسِ ردشده به مدل گفته می‌شود (rerunA S2.6) */
  function unusedLine(pid) {
    try {
      var un = A.liveUnused ? A.liveUnused(pid) || [] : [];
      return un.length ? "- داده‌هایی که هنوز در طرح/گام‌ها به کار نرفته یا با دلیل کنار نرفته‌اند (نام بردن در گفت‌وگو به کار بردن نیست): " + un.map(function (d) { return "«" + clip(d.t, 40) + "»"; }).join("، ") + " — اگر گیر است، اول کلی بپرس «همهٔ داده‌ها را به کار بردی؟»؛ فقط اگر باز نیافت، یکی را با نامش: «از … استفاده کردی؟»." : "";
    } catch (e) { return ""; }
  }
  function refutedLine(pid) { try { var pl = A.livePlausible ? A.livePlausible(pid) : null; return pl && pl.refuted ? "- حدسی که خودش با آزمون رد کرد: " + fa(pl.refuted) + " — آن را دوباره پیشنهاد نکن؛ بپرس از ردش چه آموخت و کدام فرضِ پنهان شکست؛ و همان را اصلِ عامِ «حدس بزن، ولی حدست را بیازما» بنام (B231) — کاری که همین حالا خودش کرد." : ""; } catch (e) { return ""; } }
  /* افزوده به بلوکِ a38: سطرِ داده‌های به‌کارنرفته را خودِ a38 از همان A.liveUnused می‌دهد — فقط اگر نداد؛ و حدسِ ردشده */
  var UNUSED_HEAD = /^- داده‌هایی که هنوز (?:در کارِ حل نیامده‌اند|به کار نرفته‌اند|در طرح\/گام‌ها به کار نرفته)/m;
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
    return nq.list.map(function (x, k) { var id = pre + (k + 1); if (C) C.qmap[id] = x; return id + ") «" + x + "»" + (ledgerAns(s, x, pk) ? " [در گفت‌وگو پاسخ گرفته — دوباره نپرس]" : ""); }).join(" · ");
  }
  function liveExtra(pid, block, dataOk) { var ph = A.livePhase ? A.livePhase(pid) : ""; return [ph !== "u" && dataOk !== false && !UNUSED_HEAD.test(block) ? unusedLine(pid) : "", /با آزمون رد کرد/.test(block) ? "" : refutedLine(pid)].filter(Boolean).join("\n"); }
  /* پرسشِ هم‌گام، با کنار گذاشتنِ پرسشِ پاسخ‌گرفته در گفت‌وگو (نه فقط در صفحه) */
  /* B3 (تورِ پولیا دورِ ۳، s02): گیر (گیر کردم/نمی‌دونم/جور نمی‌شه) و دادهٔ به‌کارنرفته ⇒ پرسشِ کلیِ «همهٔ داده‌ها را به کار بردی؟ کلِ شرط را؟» پیش از
     تکرارِ «پیش‌تر دیده‌ای؟» — و فقط اگر آن هم راه نبرد، نامِ داده (کلی ⇐ خاص) */
  var ALLDATA_RE = /همهٔ داده‌ها|همهٔ فرض|داده‌هایی که اثرِ محسوس/, ALLDATA_Q = "همهٔ داده‌ها را به کار بردی؟ کلِ شرط را؟";
  /* دورِ ۵ (F2): یک پرسش در نوبت، یک منبع — نشانه‌های همین نوبت (turn) و پرسش‌های پاسخ‌گرفتهٔ دفترِ همین مسئله (asked) به A.liveCoach می‌رود و q همان است که
     او می‌دهد (اولویت: کارِ همین نوبت ⇐ شکست ⇐ کارتِ صفحه ⇐ نردبان — DECISIONS_R5 F2، در بخشِ مسئله). تنها افزوده: B3 («همهٔ داده‌ها؟») وقتی طرح هست، گیر است
     و داده‌ای به کار نرفته (E3 ِ دورِ ۴) — و آن هم هرگز پیش از طرح. پیش‌تر این‌جا «از خواسته به عقب» و «پرسشِ دیگر» هم جایگزین می‌شد (منبعِ دوم). */
  function turnOf(s, pid, mt, auto) {
    var C = (s && s.coach) || {}, M = ((s && s.msgs) || []).filter(isUser), cur = M.length && mkey(M[M.length - 1].text) === mkey(mt) ? M.length - 1 : M.length, pv = M[cur - 1];
    var rep = C.rep && pv && C.rep.key === mkey(pv.text) ? C.rep : null, t = String(mt || ""), ph = A.livePhase ? A.livePhase(pid) : "";
    var resOpen = !!(C.resBy && C.resBy["l:" + pid]) && ph !== "b" && ph !== "done";
    return { analogy: !auto && CARRY_RE.test(faDigits(t).replace(/‌/g, " ")), result: (!auto && solvedSaid(t) && !unsolvedNow(t, "")) || resOpen, stuck: (!auto && (STUCK_RE.test(t) || NOTKNOW_RE.test(t))) || !!(rep && rep.stuck), fail: (!auto && unsolvedNow(t, "")) || !!(rep && rep.fail) };
  }
  AS.coachTurn = turnOf;
  function nextQFor(s, pid, mt, auto) {
    if (!s) return AS.liveNextQ(pid);
    var turn = turnOf(s, pid, mt, auto), askedL = AS.coachLedger(s, "l:" + pid);
    var nq = AS.liveNextQ(pid, { asked: askedL, stuck: turn.stuck, turn: turn }); if (!nq) return nq; nq.turn = turn;
    if ((nq.ph === "p" || nq.ph === "c") && nq.coach && (nq.coach.unused || []).length && turn.stuck && dataLineOk(pid)) {
      var qa = (nq.list || []).filter(function (q) { return ALLDATA_RE.test(q); })[0] || ALLDATA_Q;
      if (!ledgerAns(s, qa, "l:" + pid)) return Object.assign({}, nq, { q: qa, stuckData: true });
    }
    return nq;
  }
  /* «X هم ۲٫۸ برابر؟»، «به همان نسبت» — نسبتی که به کمیتِ تازه برده می‌شود (همان شکلِ CARRY_RE ِ بخشِ مسئله؛ s23) */
  var CARRY_RE = /(?:^|\s)(?:هم|نیز)\s+(?:[^.؟?!\n]{0,30}\s)?(?:برابر|نسبت|متناسب)|به\s*همان\s*نسبت|همان\s*نسبت|همین\s*نسبت|متناسب\s*(?:با|است|ه)|(?:[0-9]+(?:[.٫][0-9]+)?|دو|سه|چند)\s*برابر\s*(?:می\s*شه|می\s*شود|میشه|بشه)?\s*[?؟]/;
  /* سطرِ «یک پرسش» — «هم‌گام با صفحه» فقط اگر همان رشتهٔ کارتِ صفحه است (s30، s33، s35: ادعای نادرستِ «همان که صفحه می‌پرسد») */
  function oneQLine(nq) {
    if (!nq.q) return "- همهٔ پرسش‌های این مرحله در صفحه یا گفت‌وگو پاسخ گرفته‌اند: دوباره نپرس — بپرس «الان از خودت چه می‌پرسی؟» یا او را به ثبتِ طرح ببر.";
    var same = !!nq.pageQ && nq.q === nq.pageQ;
    return "- در این نوبت فقط **یک** پرسش" + (same ? "، هم‌گام با صفحه (همان که صفحه همین حالا می‌پرسد" : " (برای وضعِ همین نوبت" + (nq.pageQ ? "؛ کارتِ صفحه پرسشِ دیگری نشان می‌دهد — این را بپرس، نه آن را" : "")) +
      "؛ پرسشی را که کاربر در صفحه یا همین گفت‌وگو پاسخ داده دوباره نپرس): «" + nq.q + "». اگر با وضعِ همین لحظه نمی‌خواند، پرسشِ دیگری از همان فهرست که هنوز پاسخ نگرفته.";
  }
  AS.liveNextQFor = nextQFor;
  /* مرحلهٔ مربی برای سشن (مسئلهٔ فقط‌درگفت‌وگو یا پس از بستنِ مسئله): نگه‌داشته در s.coach، با گفته‌های خودِ کاربر جلو می‌رود */
  var PLAN_RE = /طرح(?:م)?\s*(?:اینه|این است)|نقشه(?:م)?\s*(?:اینه|این است)|ایده(?:‌ام|م)\s*(?:اینه|این است)|می[‌\s]?خوام\s+(?:اول|از)\s|(?:اول(?:ش)?|نخست)\s+[^.؟?\n]{2,60}?(?:،|\s(?:می[‌\s]?کنم|بعد|بعدش|سپس))|راهش\s*(?:اینه|این است)|فکر\s*کنم\s*باید|از\s*(?:آخر|جواب|خواسته|هدف)\s*(?:به\s*عقب|شروع\s*(?:می[‌\s]?کنم|کردم))|با\s*(?:استقرا|برهانِ?\s*خلف|خلف)\s*(?:ثابت|پیش|می[‌\s]?رم)/;
  var NEWPROB_RE = /تموم\s*شد(?:ه)?[.!،؛…\s]*(?:و\s*)?(?:حالا|بریم\s*سراغِ?|مسئله(?:ٔ|ی|‌ی)?\s*بعدی?)[\s:：،]+(.{8,})/;
  var BRUTE_RE = /یکی[‌\s]?یکی|تک[‌\s]?تک|همه(?:‌ی|ی|ٔ)?\s*حالت(?:‌ها|ها)?\s*(?:رو|را)?\s*امتحان|[0-9۰-۹]+\s*(?:تا\s*)?حالت\s*(?:رو|را)?\s*(?:یکی|امتحان)/;
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
  function sameStmt(a, b) { var ta = qToks(a), tb = qToks(b); if (ta.length < 3 || tb.length < 3) return false; var n = ta.filter(function (w) { return tb.indexOf(w) >= 0; }).length; return n * 5 >= Math.min(ta.length, tb.length) * 3; }
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
    var nw = C.stmt ? NEWPROB_RE.exec(mt) : null;
    if (nw && !AS.notProblem(nw[1])) { C.gen = (C.gen || 0) + 1; C.pk = "c:" + C.gen; C.ph = "u"; C.st = {}; C.stmt = clip(nw[1], 400); C.inh = C.inh || "new";
      C.prev = { key: mkey(mt), ph0: "u", st0: {}, pasted: true, intro: true, pk: C.pk }; return "u"; }
    if (!C.ph && !C.inh && !(b && b.done)) { var x0 = inheritPhase(s, mt); if (x0) { C.ph = x0.coach.ph; C.st = Object.assign({}, x0.coach.st || {}); C.cls = x0.coach.cls; C.inh = x0.id; } }
    var ph0 = C.ph || "", st0 = Object.assign({}, C.st || {}), teach = teachMode(s, mt);
    /* دورِ ۵ (F1، s31، s37): پیامِ نخستی که نتیجهٔ خودش را می‌گوید («حلش کردم! … ۵×۵=۲۵») صورتِ چسبانده نیست — said:result ِ آن می‌ماند */
    var said = solvedSaid(mt) && !(teach && SELF_SOLVED_RE.test(mt)), uns = unsolvedNow(mt, ph0), stuck = STUCK_RE.test(mt) || NOTKNOW_RE.test(mt);
    var intro = !C.stmt && !AS.notProblem(mt), pasted = (intro || pastedOf(mt, C.stmt)) && !(said && !uns);
    var ph = ph0, st = C.st = C.st || {}, sp = statedParts(mt, pasted);
    if (sp.u) st.u = 1; if (sp.d) st.d = 1; if (sp.c) st.c = 1;
    /* پرسشِ فهمی که پرسیده شد و جوابِ واقعی گرفت (دفتر یا پشتیبان) هم «گفته‌شده» است */
    var asked = askedInChat(s); phaseQs("u", C.cls || "any").forEach(function (q) { if (qParts(q).length && answeredQ(s, q, asked)) qParts(q).forEach(function (x) { st[x] = 1; }); });
    if (!C.stmt && !AS.notProblem(mt)) C.stmt = clip(mt, 400);
    if (said && !uns) ph = "b";
    else if (LOOK_RE.test(mt) && (ph === "c" || ph === "b" || ph === "p")) ph = "b";
    else if (uns && (ph === "b" || ph === "c")) ph = "c";
    else if (stuck) { }   // گیر ⇒ همین مرحله (نه «طرح گفت» از «اول … شروع کردم، … گیر کردم»)
    else if (EXEC_RE.test(mt) && ph !== "b" && !intro) ph = "c";
    /* دورِ ۵ (F1، s34، s37): «فکر کنم باید…» در گشایشی که دلسردی یا نیتِ زورِ خام است («انصراف بدم»، «۱۰۰ حالت رو یکی‌یکی امتحان کنم») طرح نیست */
    else if (PLAN_RE.test(mt) && ph !== "b" && ph !== "c" && !((intro || !ph0) && (FAIL_ME.test(mt) || GIVEUP_RE.test(mt) || BRUTE_RE.test(mt)))) ph = ph === "p" || (st.u && st.d && st.c) ? "c" : "p";
    if (!ph || (ph === "u" && st.u && st.d && st.c)) ph = st.u && st.d && st.c ? "p" : "u";
    /* خواندنِ پشتیبانِ همین پیام؛ گزارشِ مدل (اگر آمد) جایش را می‌گیرد — از همین وضعِ پیش از پیام؛ ولی نتیجهٔ بی‌ابهامِ خودش (strong) را به عقب برنمی‌گرداند */
    C.pk = "c:" + (C.gen || 0);
    C.prev = { key: mkey(mt), ph0: ph0 || "u", st0: st0, pasted: pasted, intro: intro, strong: said && !uns ? "b" : "", pk: C.pk };
    return ph;
  }
  AS.coachPhase = coachPhase;
  /* «میانهٔ راه» روی نردبانِ خودِ سامانه (۱/۳/۷/۲۱/۶۰): مسئلهٔ زندهٔ بازِ دیرپا ⇒ یک بار در هر پله «چه پیشرفتی کردی؟ دربارهٔ خودت چه آموختی؟» (rerunD s34) */
  function midCheck(s, b) {
    if (!b || b.done || !b.r) return "";
    var LAD = (A.solveUI && A.solveUI.LADDER) || [1, 3, 7, 21, 60], born = String(b.r.created || (b.r.p && b.r.p.created) || "").slice(0, 10); if (!born || !A.daysBetween) return "";
    var age = A.daysBetween(born, A.today()), rung = LAD.filter(function (d) { return d >= LAD[2] && age >= d; }).pop(); if (!rung) return "";
    var C = s.coach = s.coach || {}, M = C.mid = C.mid || {}; if (M[b.pid] === rung) return "";
    M[b.pid] = rung;
    /* E8 (دورِ ۴، s19): با قاعدهٔ «فقط یک پرسش در نوبت» نمی‌جنگد — این نوبت همین **به‌جای** پرسشِ مرحله است */
    return "- میانهٔ راه (این مسئله " + fa(age) + " روز است باز است؛ پلهٔ " + fa(rung) + " ِ نردبانِ مرور): در همین نوبت، **به‌جای** پرسشِ مرحله (همچنان فقط یک پرسش)، کوتاه بپرس «تا این‌جا چه پیشرفتی کردی و دربارهٔ خودت چه آموختی؟» — بی حکم؛ پرسشِ مرحله برای نوبتِ بعد.";
  }
  /* رویدادِ مرحله برای «🧩 چهار مرحلهٔ حل» (R7): گیر یا «حل نشد» ِ خودِ کاربر در گفت‌وگو ⇒ ناموفق در همان مرحله (موفق فقط از خودداوریِ صریحِ او: tutor_mark) */
  function coachEv(s, ph, src, mt) {
    var E = s.coachEv = s.coachEv || [], key = src + "|" + clip(mt, 80); if (E.some(function (e) { return e.key === key; })) return;
    E.push({ at: nowIso(), ph: ph, ok: false, src: src, key: key }); if (E.length > 200) s.coachEv = E.slice(-200);
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
      if (had && !auto) out.push("# مسئلهٔ واقعیِ تازه؟\n- این سشن به «" + clip(bOpen.r.p.title, 60) + "» بسته است: live_new فقط اگر کاربر صریحاً مسئلهٔ **دیگری** آورد و می‌خواهد جدا حلش کند؛ وگرنه همین مسئله را ادامه بده (دوباره نساز)."); }
    else if (!out.some(function (x) { return RULES_HEAD.test(x); }) && (LIVE_RE2.test(recent) || LIVE_ASK.test(recent)) && !auto) out.push(LIVE_FALLBACK);
    // ۳) «مسئلهٔ زندهٔ این سشن»: قابِ نوع‌دار، پرسشِ هم‌گام (بی پرسشِ پاسخ‌گرفته در صفحه **و** گفت‌وگو)، بی ضرب‌المثلِ تکراری؛ و اگر قلابِ بخشِ مسئله نیامد، بلوکِ فشرده
    var i = -1; out.forEach(function (x, j) { if (i < 0 && /^# مسئلهٔ زندهٔ این سشن \(/.test(x)) i = j; });
    var lc = liveCtx(s, msg), pid = i >= 0 ? ((/^# مسئلهٔ زندهٔ این سشن \(([^)]+)\)/.exec(out[i]) || [])[1]) : lc && lc.pid;
    if (pid && s) { var Ck = s.coach = s.coach || {}; Ck.pk = "l:" + pid; }   // F3: دفترِ همین مسئله
    var nq = pid && A.liveRec && A.liveRec(pid) ? nextQFor(s, pid, auto ? "" : mt, auto) : null, liveBlock = false;
    var stuckNow = !auto && (STUCK_RE.test(mt) || NOTKNOW_RE.test(mt)), dataOk = pid ? dataLineOk(pid) : false;
    /* F2: گیرِ این نوبت = گیرِ همین پیام یا گیرِ گزارش‌شده و سنجیدهٔ پیامِ پیشین (یک نوبت) */
    var stuckTurn = nq && nq.turn ? nq.turn.stuck : stuckNow || (function () { var C2 = (s && s.coach) || {}, M2 = ((s && s.msgs) || []).filter(isUser), pv2 = M2[M2.length - 2]; return !auto && !!(C2.rep && pv2 && C2.rep.key === mkey(pv2.text) && C2.rep.stuck); })();
    if (i >= 0 && pid) {
      var kind = liveKind(pid), asked0 = [];
      out[i] = out[i].split("\n").filter(function (ln) { return !/^- حکمتِ ضرب‌المثل‌ها برای همین مرحله/.test(ln) && !(/^- داده‌هایی که هنوز در کارِ حل نیامده‌اند/.test(ln) && !dataOk); }).map(function (ln) {
        if (/^- پاسخِ این مسئله را هیچ‌کس نمی‌داند/.test(ln) || /^- این مسئله پاسخِ عینی دارد/.test(ln)) return AS.liveFrame(kind) || ln;   // یک متنِ واحد برای قابِ نوع‌دار (ادغامِ تورِ ۱)
        /* یک پرسش در نوبت: همان A.liveCoach(pid).q (پرسشِ پاسخ‌گرفته در گفت‌وگو هم کنار) — سطرِ a38 جایگزین می‌شود، دو سطر نمی‌شود */
        if (nq && /^- در این نوبت فقط \*\*یک\*\* پرسش/.test(ln)) return oneQLine(nq);
        /* همان فهرستِ a38، با نشانِ «پاسخ‌گرفته در گفت‌وگو» (فهرستِ دوم در مربی نمی‌آید) */
        if (/^- داده‌هایی که هنوز در کارِ حل نیامده‌اند/.test(ln)) return ln.replace(/\(اگر به کار آمد، یکی را با نامش بپرس: «از … استفاده کردی؟»؛/, "(اگر گیر است، اول کلی بپرس «همهٔ داده‌ها را به کار بردی؟»؛ فقط اگر باز نیافت، یکی را با نامش: «از … استفاده کردی؟»؛");
        /* E3/E8 (دورِ ۴، s11، s25): فهرست بریده نمی‌شود (پرسشِ پیشنهادیِ هشتم هم دیده شود) و پرسش‌ها کامل‌اند (پرسشِ استقرا نیمه نماند)؛ E1: با شناسه */
        if (nq && nq.list && nq.list.length > 1 && /^- پرسش‌های همین مرحله/.test(ln)) return "- پرسش‌های همین مرحله (برای همین نوعِ مسئله): " + liveList(s, nq, asked0);
        return ln;
      }).join("\n");
      var extra = liveExtra(pid, out[i], dataOk); if (extra) out[i] = out[i] + "\n" + extra;
      liveBlock = !!nq;
    } else if (pid && lc) { out.push(compactLive(s, pid, nq, dataOk)); liveBlock = !!nq; }
    /* B4: مسئلهٔ حل‌شدهٔ مرتبط (بستهٔ همین سشن، یا در سشنِ تازه با دو واژهٔ معنادارِ مشترک) ⇒ نتیجه، روش و بازنگریِ خودش — نه فقط عنوان */
    if (!pid && !auto) { var dp = b && b.done ? b.pid : relatedDone(s, recent); if (dp) { var sb = solvedBlock(dp, !(b && b.done)); if (sb) out.push(sb); } }
    /* دورِ ۵ (F3، s24، s28): فرزندِ بسته به سشن ⇒ پدرِ بسته‌شده‌اش (حتی در همین سشن) همان «مسئلهٔ حل‌شدهٔ مرتبط» است — نتیجه، روش و بازنگریِ خودش */
    if (pid && !auto) { try { var rr = A.liveRec(pid), og = rr && rr.origin; if (og && og.type === "lprob" && og.id !== pid && A.liveRec(og.id) && A.livePhase(og.id) === "done" && !out.some(function (x) { return x.indexOf("# مسئلهٔ حل‌شدهٔ مرتبط (" + og.id + ")") >= 0; })) { var sb2 = solvedBlock(og.id, false); if (sb2) out.push(sb2); } } catch (e) { } }
    /* دورِ ۵ (F3، s34): سشنِ تازهٔ نابسته و دقیقاً یک مسئلهٔ زندهٔ باز ⇒ یک سطرِ پیشنهاد در نخستین نوبت — هرگز پیوندِ خودکار (کاربر خودش برمی‌گزیند) */
    if (!pid && !b && !auto && userTries(s) <= 1 && A.liveAll && A.livePhase) { try { var td = A.today(), opn = A.liveAll().filter(function (r) { return r && r.p && A.livePhase(r.p.id) !== "done" && !(r.dormant && String(r.dormant) > td); });
      if (opn.length === 1) out.push("# مسئلهٔ بازِ تو (پیشنهاد، نه پیوند)\n- مسئلهٔ بازِ تو: «" + clip(opn[0].p.title, 80) + "» — همین را ادامه می‌دهی؟ فقط یک بار و کوتاه بپرس؛ اگر گفت آری، او را با {\"do\":\"go\",\"view\":\"lprob\",\"arg\":\"" + opn[0].p.id + "\"} به صفحه‌اش ببر. این سشن خودبه‌خود به آن بسته نمی‌شود؛ اگر حرفش چیزِ دیگری است، همان را دنبال کن."); } catch (e) { } }
    // ۴) مربی: در **هر** نوبتِ کاربر که «نه-مسئله» نیست (فهرستِ منفی)، با مرحله و پرسش‌های نوع‌دار؛ معلمِ مسئلهٔ حل‌شده اگر خودش مربی را آورده، دوباره نه.
    //    مسئلهٔ زندهٔ باز ⇒ مرحله، رده و فهرست از A.liveCoach/A.liveKindInfo ِ بخشِ مسئله و پرسشِ نوبت فقط در بلوکِ زنده (o.live) — یک منبعِ پرسش
    var hasCoach = out.some(function (x) { return /^# مربیِ حل/.test(x) || /\n# مربیِ حل/.test(x); });
    var cpid = pid && A.liveRec && A.liveRec(pid) && nq ? pid : bOpen ? bOpen.pid : "";
    if (!hasCoach && (auto ? !!cpid : !AS.notProblem(mt))) {
      var bb = cpid ? { pid: cpid, r: A.liveRec(cpid), ph: A.livePhase ? A.livePhase(cpid) : "u", done: false } : b;
      var ph = auto ? (PH_OF[bb.ph] || "u") : coachPhase(s, mt, bb), cls = cpid ? liveClass(cpid) : natClass(s, recent) || qClass("", recent);
      /* F4 (دورِ ۵): نوعِ مسئله (find/prove/pod) برای سرواژه — زنده از رکورد، فقط‌درگفت‌وگو از حدسِ همان بخشِ مسئله (A.liveTypeGuess) */
      var ptype = ""; try { ptype = cpid ? ((A.liveKindInfo(cpid) || {}).type || "") : cls === "prove" && A.liveTypeGuess ? (A.liveTypeGuess(recent) || "prove") : ""; } catch (e) { }
      var Pv = s.coach && s.coach.prev && s.coach.prev.key === mkey(mt) ? s.coach.prev : null;
      var qs = cpid && nq && nq.list && nq.list.length ? nq.list : phaseQs(ph, cls, cpid);
      if (!cpid && !auto) { var C = s.coach = s.coach || {}; C.ph = ph; C.cls = cls; C.at = nowIso(); }
      /* R7/B7: رویدادِ «ناموفق» فقط گیرِ خودِ حل یا «حل نشد» ِ واقعی — نه خشم/شرم، نه حدسِ ردشده، نه تلاشِ کنارگذاشته‌ای که به جواب رسید */
      if (!auto && ((STUCK_RE.test(mt) && !solvedSaid(mt)) || unsolvedNow(mt, ph))) coachEv(s, ph, "chat", mt);
      var claim = cpid && !auto && solvedSaid(mt) && !unsolvedNow(mt, ph) ? ((nq && nq.coach && nq.coach.closure && nq.coach.closure.label) || true) : "";
      out.push(coachLines({ ph: ph, qs: qs, cls: cls, ptype: ptype, s: s, pid: cpid, mt: mt, dry: auto, stuck: stuckTurn, live: !!cpid && liveBlock, claim: claim, teach: teachMode(s, auto ? "" : mt), sug: cpid && nq ? nq.q : "", tries: cpid ? userTries(s, bb.r.created || "") : userTries(s), seed: userTries(s),
        closed: !cpid && b && b.done ? b.r.p.title : "", mid: cpid && !auto ? midCheck(s, bb) : "", intro: !auto && !!(Pv && Pv.intro), refuted: !!(cpid && refutedLine(cpid)) }));
    }
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
    var was = L.state; L.state = "solved"; L.stateAt = L.stateAt && was === "solved" ? L.stateAt : at; L.chat = { sess: (s && s.id) || "", at: at, solution: clip(a.solution || (L.chat && L.chat.solution) || "", 1500) };
    var les = clip(a.lesson || "", 600), own = les.length >= 5 && userWrote(s, les), info = "";
    if (les.length >= 5 && !(so.b && so.b[1] && so.b[1].done && so.b[1].use === les)) {
      so.b = so.b || {}; so.b[1] = { state: "solved", chkHow: clip(a.check || "", 400), chkRes: a.check ? "نتیجه سالم ماند" : "", glance: clip(a.glance || "", 300), use: les, newProb: clip(a.newProb || "", 600), at: at, done: true, from: "chat", own: own,
        /* حکمِ بستن (A.liveClosure): «وارسی شد» فقط وقتی درس و وارسی به قلمِ خودِ کاربر است؛ وگرنه «وارسی نشد» — بازنگریِ دستیار بازنگریِ او نیست (R5/R7) */
        verdict: own && a.check && userWrote(s, a.check) ? "verified" : "unverified" };
      so.lessons = so.lessons || []; var lo = { lv: 1, use: les, at: at, live: true, chat: true, own: own };
      if (A.newCard) { var cd = A.newCard("بازسازی — «" + clip(r.p.title, 70) + "»: بی‌نگاه دوباره حلش کن، بعد درست را ببین؛ درسش کجای دیگر به کار می‌آید؟", les + (a.check ? "\nوارسی: " + clip(a.check, 300) : ""), { pb: pid, due: A.addDays(A.today(), 1), src: "chat:solved:" + pid }); lo.card = cd && cd.id; }
      so.lessons.push(lo); so.rev = so.rev || {}; if (A.solveUI && A.solveUI.seed) try { A.solveUI.seed(so, "b"); } catch (e) { }
      info = "؛ درست ثبت شد و کارتِ «بازسازی» فردا (" + (A.fdate ? A.fdate(A.addDays(A.today(), 1)) : A.addDays(A.today(), 1)) + ") در «مرور» و «امروز» می‌آید";
    } else if (!(so.b && so.b[1] && so.b[1].done)) info = "؛ بازنگری هنوز نیست — صفحه‌اش (۴) بازنگری را از خودت می‌پرسد";
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
  AS.DO.chat_invent = function (a) {
    var s = AS._turnSession; if (!A.liveCreate) return "این نسخه «🔭 مسئلهٔ حل‌نشدهٔ خودم» را ندارد";
    var st = clip(a && a.statement, 1500); if (st.length < 10) return "ثبت نشد: «statement» (مسئلهٔ تازه به حرفِ خودِ کاربر) لازم است";
    if (a && (a.solved === true || a.solved === "true")) return AS.DO.chat_solved(a);   // همین‌جا حل شد ⇒ «حل شد»، نه «حل‌نشده» (rerunA s03)
    var blv = AS.boundLive(s), from = a && a.from && A.liveRec && A.liveRec(a.from) ? { type: "lprob", id: a.from, via: "chat" } : blv ? { type: "lprob", id: blv.pid, via: "chat" } : { type: "chat", id: (s && s.id) || "" };
    if (A.liveAll && A.liveAll().some(function (x) { return sameProblem(x, st, ""); })) return "✓ این مسئله پیش‌تر در «🔭 مسئله‌های من» ثبت شده بود؛ دوباره نساختم.";
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
      return "✓ همین مسئلهٔ تازه پیش‌تر ثبت شده بود («" + clip(twin.p.title, 60) + "»)؛ دوباره نساختم — صورتِ تازه‌ات کنارش ماند" + (ty && twin.p.kind === ty ? " (نوع: " + ((A.SOLVE_TYPES[ty] || {}).fa || ty) + ")" : "") + "."; }
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
    if (heurClaim(ut)) said = said.filter(function (k) { return k !== "result"; });   // دورِ ۵ (F1، s03): «ثابت شد» از چند شکل ادعاست، نه نتیجه
    /* نقش */
    if (a.role === "teacher") { var rec = M.filter(isUser).slice(-4).map(function (m) { return m.text; }).join(" "); if (LEARNER_RE.test(rec)) { C.teach = true; C.teachBy = "model"; } }
    else if (a.role === "self" && C.teach && C.teachBy === "re" && C.teachKey === key) { C.teach = false; C.teachBy = "model"; }
    if (/^(?:objective|practical|life)$/.test(String(a.nat || ""))) C.natSug = a.nat;
    /* پرسش‌های پاسخ‌گرفته (شناسه ⇐ متنِ پرسش از فهرستِ همان نوبت) */
    var qm = C.qmap || {}, ids = (Array.isArray(a.ans) ? a.ans : []).map(String), qs = ids.map(function (id) { return qm[id]; }).filter(Boolean);
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
    if (said.indexOf("result") >= 0) ph = "b";
    else if (fail) ph = cl && ORD[cl] < ORD[ph0] ? cl : (ph0 === "b" || ph0 === "c" ? "c" : ph0);
    else if (said.indexOf("plan") >= 0 && ORD[ph0] < ORD.c) ph = "c";
    else if (cl && ORD[cl] < ORD[ph0]) ph = stuck || said.length ? cl : ph0;          // عقب: فقط با گیر یا حرفِ تازه
    else if (cl === "p" && ORD[ph0] < ORD.p && (st.u || (!pasted && C.stmt))) ph = "p";   // جلو: فقط با شاهدِ خودش — صورتِ چسبانده‌ای که پس از آن خوانده و رویش کار کرده هم «مجهولِ گفته» است (s08)
    /* دورِ ۵ (F1، s31): نشانهٔ قوی‌ترِ پیشین (نتیجهٔ بی‌ابهامِ خودش) با گزارشِ مدل به عقب برنمی‌گردد، مگر مدل شکست گزارش کند */
    if (P && P.strong && !fail && ORD[ph] < ORD[P.strong]) ph = P.strong;
    if (!(P && P.live)) { C.ph = ph; C.st = st; }
    /* دورِ ۵ (F2): نشانه‌های همین پیام برای نوبتِ بعد (A.liveCoach(pid,{turn})): گیر/شکست یک نوبت؛ «نتیجه گفت» برای مسئلهٔ زنده تا صفحه ثبتش کند یا شکستی بیاید */
    C.rep = { key: key, stuck: stuck, fail: fail, result: said.indexOf("result") >= 0, pk: pk };
    var RB = C.resBy = C.resBy || {}; if (fail) delete RB[pk]; else if (C.rep.result && /^l:/.test(pk)) RB[pk] = key;
    /* رویدادِ مرحله (R7): خواندنِ مدل جای خواندنِ الگوی همان پیام */
    var ek = "chat|" + clip(ut, 80); s.coachEv = (s.coachEv || []).filter(function (e) { return !(e && e.src === "chat" && e.key === ek); });
    if ((fail || stuck) && !C.teach) coachEv(s, P && P.live ? (P.ph0 || "u") : (cl || ph0), "chat", ut);
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
      if (isNew) try { var cs = AS.busy && AS.busy() ? AS._turnSession : null; if (cs && cs.type === "achat" && r.sess === cs.id) sessLink(cs, r.p.id, false); } catch (e) { }
      return o;
    };
    S.put._lpLink = true;
  }
  /* کاربر صفحهٔ مسئلهٔ زندهٔ دیگری را باز کرد و همان‌جا با دستیار حرف می‌زند ⇒ خودش عوض کرد (force) */
  AS.promptHooks.push(function (s) { try { var st = A.state || {}; if (s && st.view === "lprob" && A.liveRec && A.liveRec(st.arg) && s.lprob !== st.arg) sessLink(s, st.arg, true); } catch (e) { } return ""; });
  /* ادغامِ G1/G2: «bindGuard» (پوششِ دوم روی A.liveBindSession) و «todayFix» (لایهٔ متنیِ «امروز» روی A.dueList) برداشته شدند — هر دو تکرارِ درونیِ
     کاری بودند که حالا فقط بخشِ مسئله (a38) می‌کند: liveBindSession ِ بی سشن از AS.cur() و بی force پیوندِ بازِ دیگر را نگه می‌دارد، و متنِ «امروز»
     (شمار با فهرست، «دیروز»/«n روز پیش»، «ساخته‌شده در گفت‌وگو») در خودِ A.dueList ِ a38 درست است. یک منبع، بی سطرِ تکراری. */

  AS.tourKinds = KIND;
  AS.tourSyncReminder = syncReminder;
})(APP);
