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
      add("ایستگاه‌ها گذرانده شد" + (cs ? " (" + fa(rt.length ? rt.length - left.length : stDone.length) + (rt.length ? " از " + fa(rt.length) : "") + ")" : ""), fin && fin.done && !left.length);
      add("تاریخِ بازبینی گذاشته شد (پیگیریِ نتیجهٔ واقعی)", fin && fin.data && fin.data.revdate);
      var rows = ((fin && fin.data && fin.data.final) || []).filter(function (r) { return r.c; });
      add("نتیجهٔ واقعی در بازبینی ثبت شد (درست بود یا نه)", cs && rows.length && rows.every(function (r) { return (cs.outcome || {})[r.c]; }), false);
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
    if (f.kind === "other") (f.steps || []).forEach(function (s) { add(s.t, s.done, false); });
    return m;
  }
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
  DO.tour_step = function (a) { var s = AS._turnSession, f = s && fac(s, a.facet); if (!f) return "وجه نیست"; var st = (f.steps || [])[+a.step - 1]; if (st) st.done = a.done !== false; return ""; };
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
    // وجهِ گره فقط از روی نشانه‌هایش «برپا» می‌شود، نه با دلیلِ دستیار (کارزارِ سوم v02: گره با همهٔ قدم‌های خالی «انجام شد»)
    if (!coreDone(f) && f.kind === "knot") { ev(s, "deny", f); return "«" + f.title + "» از روی داده‌ها هنوز برپا نیست (" + milestones(f).filter(function (m) { return m.core && !m.ok; }).map(function (m) { return m.t; }).join("، ") + ") — وجهِ گره فقط با نشانه‌هایش بسته می‌شود"; }
    if (!coreDone(f) && !a.why) return "«" + f.title + "» هنوز نشانه‌های پایانش کامل نیست — اگر واقعاً تمام است، دلیل بنویس";
    f.status = "done"; f.doneAt = nowIso(); f.doneBy = coreDone(f) ? "evidence" : "assistant: " + clip(a.why, 200); ev(s, "done", f); advance(s); return "";
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
    t.facets.forEach(function (f) {
      if (f.status === "done" && f.doneBy === "evidence" && f.kind !== "other" && !coreDone(f)) {
        f.status = "todo"; delete f.doneAt; delete f.doneBy; if (t.doneAt) { delete t.doneAt; delete t.doneSaid; delete t.masteredAt; }
        msgs.push("↩ وجهِ «" + f.title + "» دوباره باز شد — شاهدی که آن را برپا کرده بود مالِ وجهِ دیگری بود");
      }
    });
    t.facets.forEach(function (f) {
      if ((f.status === "now" || f.status === "todo") && f.kind !== "other" && coreDone(f)) {
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
  var rawRenderT = A.render;
  A.render = function () {
    rawRenderT.apply(this, arguments);
    try { if (A.HOST && A.HOST.sheet && A.S.loaded) AS.tourSweep(); } catch (e) { console.error(e); }
  };

  /* ---------- معلمِ حلِ مسئله: یک پرسش در هر نوبت، متناسب با مرحله، بی لودادن؛ بازنگری پس از «حل شد»؛ موفقیتِ کوچک ----------
     مالک (۲۰۲۶-۱۰-۱۵): «سیستم … حسبِ آن مسئله خودش از دلِ تونل‌های لازم بگذرد» — این بخش زیرسامانهٔ جدا نیست: فقط وقتی کاربر واقعاً
     دارد مسئله‌ای حل می‌کند (شبیه‌ساز/صفحهٔ یک مسئله، موقعیتِ گره‌گشا از نوعِ مسئله، «بیان دیگر» در حالتِ مسئله، یا وجهِ «مسئله» ِ تور
     همین حالا) قاعده‌ها را به نوبتِ دستیار می‌افزاید (AS.promptHooks؛ پرامپتِ سامانه دست نمی‌خورد). داده: فهم و بازنگری روی رکوردِ همان
     مسئله (eprog_<pid>.tut | kcase.tut | داده‌های «بیان دیگر») ثبت می‌شود و پاسخِ بازنگری یک کارتِ مرور می‌سازد (تکرارِ فاصله‌دار). */
  var TQ = {
    und: { fa: "فهمِ مسئله", qs: ["مجهول (یا حکمی که باید ثابت شود) چیست؟", "داده‌ها (یا فرض) چیست؟", "شرط چیست؟ می‌توانی بخش‌هایش را جدا بنویسی؟", "آیا شرط برای تعیینِ مجهول کافی است؟ زائد است؟ متناقض است؟", "شکلی بکش یا نام‌گذاریِ مناسبی بکن؛ مسئله را به زبانِ خودت دوباره بگو.", "چه؟ چرا؟ کجا؟ کی؟ چگونه؟ — کدام‌یک دربارهٔ این مسئله هنوز بی‌پاسخ است؟"] },
    plan: { fa: "طرح‌ریزی", qs: ["پیش‌تر همین را — یا همین را به شکلِ کمی دیگر — دیده‌ای؟", "به مجهول نگاه کن: مسئلهٔ آشنایی با همین مجهول، یا مجهولِ مشابه، می‌شناسی؟", "می‌توانی مسئله را به شکلِ دیگری بیان کنی؟ به تعریف‌ها برگرد.", "اگر نمی‌توانی همین را حل کنی، مسئلهٔ مرتبطِ ساده‌تری را حل کن: حالتِ خاص‌تر؟ کلی‌تر؟ فقط بخشی از شرط را نگه دار.", "همهٔ داده‌ها و کلِ شرط را به کار بردی؟ همهٔ مفهوم‌های اساسیِ مسئله را در نظر گرفتی؟"] },
    exec: { fa: "اجرای طرح", qs: ["هر گام را وارسی کن: روشن می‌بینی که این گام درست است؟", "می‌توانی ثابت کنی که درست است (کدام مقدمه آن را لازم می‌آورد)؟"] },
    back: { fa: "بازنگری", qs: ["می‌توانی نتیجه را وارسی کنی — در حالتی خاص یا حدی، با ابعاد یا تقارن؟ همهٔ داده‌ها در جواب آمده‌اند؟", "می‌توانی استدلال را در نقطه‌های حساسش وارسی کنی؟", "می‌توانی نتیجه را از راهِ دیگری به دست آوری؟ می‌توانی آن را در یک نگاه ببینی؟", "می‌توانی نتیجه یا روش را در مسئلهٔ دیگری به کار ببری؟ یک مسئلهٔ تازه بساز.", "این نوع مسئله برایت چطور بود — کدام بخشش را دوست داشتی و کدامش را نه؟ (شناختنِ نوعِ مسئله‌هایی که با سلیقه و توانت می‌خواند)"] }
  };
  AS.tutorQuestions = TQ;
  var SOLVED_RE = /حل[\s‌]*ش?[\s‌]*(?:شد(?!ه)|کردم)|جواب(?:ش)?[\s‌]*(?:رو|را)?[\s‌]*(?:پیدا[\s‌]*کردم|گرفتم|درآوردم)|ثابت(?:ش)?[\s‌]*کردم/;
  var UNSOLVED_RE = /حل[\s‌]*نشد|اشتباه[\s‌]*(?:بود|کردم|شد)|غلط[\s‌]*(?:بود|درآمد)|دوباره[\s‌]*(?:حل|امتحان|شروع)/;
  var EXEC_RE = /محاسبه|حساب\s*کردم|نوشتم که|گامِ?\s*بعد(?:ی)?\s*(?:اینه|این است)|دارم\s*(?:حل|ثابت)\s*می‌?کنم/;
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
    if (SOLVED_RE.test(String(msg || ""))) return "back";
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
    if (auto) ph = tu.ph || tutorPhase(c, msg);
    else {
      ph = tutorPhase(c, msg);
      if (UNSOLVED_RE.test(mtxt)) tu.solved = false;
      else if (ph === "back") tu.solved = true;
      else if (tu.solved) ph = "back";   // پس از «حل شد» تا خودش نگفته «حل نشد/اشتباه بود»، بازنگری می‌ماند
    }
    var T0 = TQ[ph];
    // پرسشِ این نوبت: همان فهرستِ ثابت، به ترتیب؛ فقط با پیامِ تازهٔ کاربر یک قدم جلو می‌رود (همان چند پرسش در همهٔ مسئله‌ها)
    if (!auto && tu.lastMsg !== msg) { tu.qi[ph] = tu.lastMsg == null || tu.ph !== ph ? (tu.qi[ph] || 0) : (tu.qi[ph] || 0) + 1; tu.lastMsg = msg; tu.ph = ph; }
    var qi = (tu.qi[ph] || 0) % T0.qs.length;
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
    return L.join("\n");
  });
  /* ثبتِ فهم/بازنگری از حرفِ خودِ کاربر روی رکوردِ همان مسئله؛ بازنگری ⇒ کارتِ مرور (فردا و بعد، در «مرور» و «امروز») */
  AS.DO.tutor_mark = function (a) {
    var s = AS._turnSession; if (!s) return "سشن نیست";
    var ph = a && a.phase === "back" ? "back" : a && a.phase === "und" ? "und" : ""; if (!ph) return "مرحله باید und یا back باشد";
    var text = clip(String(a.text || "").trim(), 1200); if (text.length < 3) return "متنِ پاسخِ خودِ کاربر لازم است";
    var self = a.self === 0 || a.self === 1 || a.self === 2 ? a.self : /^[012]$/.test(String(a.self)) ? +a.self : null;
    var c = AS.solvingCtx(s), rec = null;
    if (c && c.kind === "prob") rec = pgOf(c.pid) || { id: "eprog_" + c.pid, type: "eprog", lv: {} };
    else if (c && c.rec) rec = c.kind === "pappus" ? (c.rec.data = c.rec.data || {}) && c.rec : c.rec;
    var host = rec ? (rec.type === "pr" ? rec.data : rec) : s;
    var tut = host.tut = host.tut || {}, e = { at: nowIso(), q: clip(String(a.q || TQ[ph].qs[0]), 300), text: text };
    if (self != null) e.self = self;
    (tut[ph] = tut[ph] || []).push(e);
    if (ph === "back" && A.newCard) {
      var cd = A.newCard("بازنگری — «" + clip(c ? c.title : s.title || "مسئله", 80) + "»: " + e.q, text, { due: A.addDays(A.today(), 1), src: "tutor:back" + (c && c.pid ? ":" + c.pid : "") });
      if (cd) e.card = cd.id;
    }
    if (rec) S.put(rec); S.put(s);
    return "";
  };

  AS.tourKinds = KIND;
  AS.tourSyncReminder = syncReminder;
})(APP);
