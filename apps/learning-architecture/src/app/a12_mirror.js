/* ===== آینهٔ درایو: برای هر پرونده، هر موضوع و دوره یک فولدر + یک شیتِ تب‌دار در درایو (مالک ۲۰۲۶-۱۰-۱۲) =====
   پایگاه‌دادهٔ Lifemanager منبعِ اصلی است؛ این‌جا فقط «سندِ خوانا» ِ هر مورد ساخته و برای میزبان فرستاده می‌شود
   (POST /api/app-records/learning-architecture/mirror). کارِ دوره‌ایِ سرور هر ۱۵ دقیقه (یا دکمهٔ «همگام‌سازیِ الان») آن را در
   LifeManagerData/learning-architecture/<گروه>/<عنوان · شناسه>/ به یک شیت با یک تب برای هر بخش می‌نویسد.
   برای افزودنِ نوعِ تازه فقط یک سازنده به BUILD اضافه کن؛ سرور و جدول عوض نمی‌شوند.
   فقط در حالتِ میزبان (Lifemanager) کار می‌کند؛ در نسخهٔ مستقل بی‌اثر است. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S;
  if (!A.HOST || !A.HOST.mirror) { A.mirrorInfo = function () { return null; }; return; }

  /* ---------- مقدار ⇐ متن ---------- */
  function txt(v) {
    if (v == null) return "";
    if (typeof v === "boolean") return v ? "بله" : "خیر";
    if (Array.isArray(v)) return v.map(function (x, i) { return (i + 1) + ". " + txt(x); }).join("\n");
    if (typeof v === "object") return Object.keys(v).filter(function (k) { return k.charAt(0) !== "_"; }).map(function (k) { return k + ": " + txt(v[k]); }).join(" | ");
    return String(v);
  }
  function fieldRows(fields, data, prefix) {
    var rows = [];
    (fields || []).forEach(function (f) {
      if (!f || !f.k || f.t === "info") return;
      var v = (data || {})[f.k];
      if (!A.filled(v)) return;
      if (f.t === "table" && Array.isArray(v)) {
        v.forEach(function (row, i) { rows.push((prefix || []).concat([f.l + " · ردیف " + (i + 1), (f.cols || []).map(function (c) { return c.l + ": " + txt(row[c.k]); }).join(" | ")])); });
      } else if (f.t === "draw") rows.push((prefix || []).concat([f.l, "[طرح رسم‌شده — فقط در برنامه]"]));
      else if (f.t === "timer") rows.push((prefix || []).concat([f.l, v && v.sec ? Math.round(v.sec / 60) + " دقیقه" : ""]));
      else rows.push((prefix || []).concat([f.l, txt(v)]));
    });
    return rows;
  }
  function link(tab, a, s) {
    var q = "tab=" + encodeURIComponent(tab) + (a ? "&a=" + encodeURIComponent(a) : "") + (s ? "&s=" + encodeURIComponent(s) : "");
    return location.origin + location.pathname + "?" + q;
  }
  function dt(iso) { return iso ? String(iso).slice(0, 16).replace("T", " ") : ""; }

  /* ---------- سازنده‌ها: نوعِ رکورد ⇐ سند ---------- */
  var BUILD = {};
  BUILD["case"] = function (cs) {
    var st = cs.st || {};
    var intake = (st.st_intake || {}).data || {};
    var claims = (((st.st_tasdiq || {}).data || {}).claims || []).map(function (c) { return typeof c === "string" ? { txt: c } : c; });
    var tabs = [];
    tabs.push({ name: "خلاصه", rows: [["فیلد", "مقدار"], ["عنوان", cs.title || ""], ["ورودی", intake.input || ""], ["نوع", intake.kind || ""],
      ["مسیر", cs.mode === "quick" ? "سریع" : "کامل"], ["وضعیت", cs.status || ""], ["ساخته‌شده", dt(cs.created)], ["آخرین تغییر", dt(cs.updated)],
      ["در برنامه", link("e_case", cs.id)]] });
    tabs.push({ name: "تصدیق‌ها", rows: [["#", "تصدیق"]].concat(claims.map(function (c, i) { return [i + 1, c.txt || txt(c)]; })) });
    var srows = [["سالن", "ایستگاه", "انجام‌شده", "پرسش/فیلد", "پاسخ"]];
    (A.ESTL || []).forEach(function (s) {
      var d = st[s.id]; if (!d || !d.data) return;
      var hall = (((window.EPI || {}).HALLS || [])[s.hall] || {}).fa || "";
      fieldRows(s.ws, d.data, [hall, s.fa, d.done ? "✓" : ""]).forEach(function (r) { srows.push(r); });
    });
    tabs.push({ name: "ایستگاه‌ها", rows: srows });
    var fin = (st.st_final || {}).data || {}, fs = (A.EST || {}).st_final;
    tabs.push({ name: "حکم و پیگیری", rows: [["پرسش/فیلد", "پاسخ"]].concat(fs ? fieldRows(fs.ws, fin) : Object.keys(fin).map(function (k) { return [k, txt(fin[k])]; })) });
    var out = cs.outcome || {};
    tabs.push({ name: "نتیجهٔ واقعی", rows: [["تصدیق", "نتیجه"]].concat(Object.keys(out).map(function (k) { var c = claims[+k - 1]; return [c ? (k + ". " + (c.txt || "")) : k, txt(out[k])]; })) });
    return { group: "پرونده‌ها", title: cs.title || "پرونده", tabs: tabs };
  };
  BUILD.topic = function (t) {
    var id = t.id, tabs = [];
    tabs.push({ name: "خلاصه", rows: [["فیلد", "مقدار"], ["عنوان", t.title || ""], ["حوزه", t.dom || ""], ["منبع", t.src || ""], ["نوع", t.kind || ""],
      ["موضوعِ دوره", (S.get("course") || {}).topic === id ? "بله" : ""], ["ساخته‌شده", dt(t.created)], ["آخرین تغییر", dt(t.updated)], ["در برنامه", link("topic", id)]] });
    var exs = S.all("ex", function (e) { return e.topic === id && !e.sample; });
    tabs.push({ name: "تمرین‌ها", rows: [["تکنیک", "فاز", "وضعیت", "نمرهٔ روبریک", "آخرین تغییر", "در برنامه"]].concat(exs.map(function (e) {
      var T = A.TM[e.tid] || {}; var p = A.rubricPct(e);
      return [e.tid + " · " + (T.fa || ""), (A.C.PHASES[A.phaseOf(e.tid)] || {}).short || "", e.status === "done" ? "کامل" : "پیش‌نویس", p == null ? "" : p + "٪", dt(e.updated), link("tech", e.tid, "ws:" + e.id)];
    })) });
    var det = [["تکنیک", "پرسش/فیلد", "پاسخ"]];
    exs.forEach(function (e) { var T = A.TM[e.tid]; if (T) fieldRows(T.ws, e.data, [e.tid + " · " + T.fa]).forEach(function (r) { det.push(r); }); });
    tabs.push({ name: "جزئیاتِ تمرین‌ها", rows: det });
    var prs = S.all("pr", function (r) { return r.topic === id; }), prow = [["پروتکل", "پرسش/فیلد", "پاسخ"]];
    prs.forEach(function (r) { var P = A.PM[r.pid]; fieldRows(P && P.ws, r.data, [P ? P.fa : r.pid]).forEach(function (x) { prow.push(x); }); });
    tabs.push({ name: "پروتکل‌ها", rows: prow });
    var sc = S.all("sched", function (s) { return s.topic === id; });
    tabs.push({ name: "چرخهٔ بازیابی", rows: [["نوبت", "موعد", "انجام‌شده"]].concat(sc.map(function (s) { return [s.label || "", s.due || "", s.done ? "✓" : ""]; })) });
    var cards = S.all("card", function (c) { return c.topic === id; });
    tabs.push({ name: "کارت‌های مرور", rows: [["پرسش", "پاسخ", "موعدِ بعدی", "تعدادِ مرور"]].concat(cards.map(function (c) { return [c.q || "", c.a || "", c.due || "", (c.hist || []).length]; })) });
    return { group: "موضوع‌ها", title: t.title || "موضوع", tabs: tabs };
  };
  BUILD.course = function (c) {
    var L = A.COURSE_LESSONS || [], tp = c.topic && S.get(c.topic);
    var rows = [["درس", "منزل", "تکنیک", "تمام‌شده", "گرم‌کردنِ بعدی", "آخرین پاسخِ گرم‌کردن"]];
    L.forEach(function (l, i) {
      var w = (c.warm || {})[l.tid] || {};
      rows.push([i + 1, l.w, l.tid + " · " + ((A.TM[l.tid] || {}).fa || ""), (c.done || {})[l.tid] || "", w.due || "", w.g == null ? "" : ["یادم نبود", "تا حدی", "یادم بود"][w.g]]);
    });
    return { group: "دوره", title: "دورهٔ گام‌به‌گام", tabs: [
      { name: "خلاصه", rows: [["فیلد", "مقدار"], ["موضوعِ دوره", tp ? tp.title : ""], ["شروع", c.started || ""], ["درس‌های تمام‌شده", Object.keys(c.done || {}).length + " از " + L.length], ["در برنامه", link("course")]] },
      { name: "پیشرفت", rows: rows }] };
  };
  /* گره‌گشا: «برای هر مسئله فولدر در درایو» (مالک ۲۰۲۶-۱۰-۱۲) ⇒ آینهٔ هر موقعیت و هر گره **پیش‌فرض روشن** است و فقط با
     `mirror === false` روی همان رکورد خاموش می‌شود (پیش‌تر طبقِ §۱۲.۹ ِ طرح انتخابی بود). احساس‌ها و یادداشت‌های F7/F9 همچنان
     فقط با انتخابِ جدا (`mirrorPrivate`). سازنده‌ای که null برگرداند ⇒ اگر قبلاً فولدری بوده، تغییرِ نام (نه حذف). */
  function mirrorOn(r) { return !!r && r.mirror !== false; }
  A.mirrorOn = mirrorOn;
  var PRIVFAM = { F7: 1, F9: 1 };
  /* خانواده‌هایی که یک موقعیت یا گره به آن‌ها مربوط است: اصلی + کمکی‌ها (و برای موقعیت، خانواده‌های گره‌های پیوندخورده؛
     برای گره، ریشهٔ موقعیت‌هایش). اگر F7 یا F9 در **هر کدام** باشد، موقعیت/گره «حساس» است (ممیزی ۲۰۲۶-۱۰-۱۲: پیش‌تر فقط اصلی دیده می‌شد). */
  function famsOfRoot(R) { R = R || {}; return [R.primary].concat((R.extra || []).map(function (x) { return x && (x.fam || x); })).filter(Boolean); }
  function famsOfKnot(k) { return k ? [].concat(Array.isArray(k.fam) ? k.fam : [k.fam]).concat((k.extra || []).map(function (x) { return x && (x.fam || x); })).filter(Boolean) : []; }
  function anyPriv(fams) { return fams.some(function (f) { return PRIVFAM[f]; }); }
  function kcaseSensitive(kc) {
    var fs = famsOfRoot(kc.root);
    (kc.knots || []).forEach(function (id) { fs = fs.concat(famsOfKnot(S.get(id))); });
    return anyPriv(fs);
  }
  function knotSensitive(k) {
    var fs = famsOfKnot(k);
    (k.cases || []).forEach(function (id) { var c = S.get(id); if (c) fs = fs.concat(famsOfRoot(c.root)); });
    return anyPriv(fs);
  }
  A.mirrorSensitive = function (r) { return r && r.type === "knot" ? knotSensitive(r) : r && r.type === "kcase" ? kcaseSensitive(r) : false; };
  var PRIV_TXT = "(خصوصی)";
  BUILD.kcase = function (kc) {
    if (!mirrorOn(kc)) return null;
    var it = kc.intake || {}, priv = !!kc.mirrorPrivate, R = kc.root || {}, sens = !priv && kcaseSensitive(kc);
    var famName = function (f) { var x = (A.KF || []).filter(function (y) { return y.id === f; })[0]; return x ? f + " · " + x.fa : (f || ""); };
    var kn = (kc.knots || []).map(function (id) { var k = S.get(id); return k ? (k.name || id) : id; }).join("، ");
    var tabs = [{ name: "خلاصه", rows: [["فیلد", "مقدار"], ["عنوان", kc.title || ""], ["نوع", (kc.kinds || it.kinds || []).join("، ")], ["وضعیت", kc.status || ""],
      ["گره‌ها", kn], ["گرهِ اصلی", famName(R.primary)], ["گره‌های کمکی", famsOfRoot(R).slice(1).map(famName).join("، ")], ["اطمینان", R.conf == null ? "" : R.conf + "٪"], ["ساخته‌شده", dt(kc.created)], ["آخرین تغییر", dt(kc.updated)], ["در برنامه", link("kcase", kc.id)]] }];
    var inRows = [["فیلد", "مقدار"]];
    [["what", "چه شد"], ["expected", "چه انتظار داشتم"], ["actual", "در واقع چه شد"], ["thoughts", "چه فکرهایی کردم/چه کردم"], ["statement", "صورتِ مسئله"],
     ["answer", "پاسخِ درست"], ["stuckAt", "کجا گیر کردم"], ["context", "زمینه"], ["claim", "نتیجه‌ای که دربارهٔ خودم گرفتم"], ["seen", "پاسخ را دیده بودم؟"],
     ["freq", "چند بار"], ["lag", "فاصله تا نوشتن"]].forEach(function (f) { if (A.filled(it[f[0]])) inRows.push([f[1], sens && f[0] === "claim" ? PRIV_TXT : txt(it[f[0]])]); });
    if (priv) [["emo", "شدتِ احساس"], ["emoName", "نامِ احساس"]].forEach(function (f) { if (A.filled(it[f[0]])) inRows.push([f[1], txt(it[f[0]])]); });
    tabs.push({ name: "ورودی", rows: inRows });
    var rk = []; try { rk = A.knotRank ? A.knotRank(kc) : []; } catch (e) { rk = []; }
    tabs.push({ name: "فرضیه‌ها", rows: [["خانواده", "امتیاز (ترتیبِ بررسی)", "چرا"]].concat(rk.map(function (r) { return [famName(r.fam), String(Math.round((r.score || 0) * 100) / 100), !priv && (sens || PRIVFAM[r.fam]) ? PRIV_TXT : txt((r.why || []).map(function (w) { return typeof w === "string" ? w : (w.t || w.fa || ""); }))]; })) });
    tabs.push({ name: "شواهد", rows: [["خانواده", "جهت", "شاهد", "منبع"]].concat((kc.ev || []).filter(function (e) { return priv || !PRIVFAM[e.fam]; }).map(function (e) { return [famName(e.fam), String(e.dir == null ? (e.w || "") : e.dir), e.text || "", e.src || ""]; })) });
    var why = (R.why5 || []).map(function (w, i) { return sens ? ["چرای " + (i + 1), PRIV_TXT, PRIV_TXT, PRIV_TXT] : ["چرای " + (i + 1), w.why || "", w.ev || "", w.rival || ""]; });
    tabs.push({ name: "ریشه", rows: [["", "پاسخ", "شاهد", "تبیینِ رقیبِ بیرونی"], ["گرهِ اصلی", famName(R.primary), "", ""]].concat(why).concat(R.loop2 ? [["متغیرِ حاکم", sens ? PRIV_TXT : R.loop2, "", ""]] : [])
      .concat(R.rival ? [["تبیینِ رقیبِ اصلی", sens ? PRIV_TXT : R.rival, "", ""]] : []).concat(R.disagree ? [["چرا با رتبه‌بندی مخالفم", sens ? PRIV_TXT : R.disagree, "", ""]] : []) });
    tabs.push({ name: "مداخله‌ها", rows: [["مداخله", "انجام‌شده"]].concat((kc.acts || []).map(function (a) { var T = a.tid && A.TM[a.tid]; return [T ? a.tid + " · " + T.fa : (a.ext || a.fa || ""), a.done ? "✓" : ""]; })) });
    return { group: "گره‌گشا — موقعیت‌ها", title: kc.title || "موقعیت", tabs: tabs };
  };
  BUILD.knot = function (k) {
    if (!mirrorOn(k)) return null;
    var priv = !!k.mirrorPrivate || !knotSensitive(k);
    var tabs = [{ name: "کارتِ گره", rows: [["فیلد", "مقدار"], ["نام", k.name || ""], ["خانواده", k.fam || ""], ["وضعیت", (A.KSTATUS || {})[k.status] || k.status || ""],
      ["ساختارِ عمیق", priv ? (k.principle || "") : "(خصوصی)"], ["نشانه‌ها", priv ? txt(k.signals) : "(خصوصی)"], ["حرکتِ مقابل", priv ? txt(k.counter) : "(خصوصی)"],
      ["مثال", priv ? txt(k.example) : "(خصوصی)"], ["در برنامه", link("knot", k.id)]] }];
    tabs.push({ name: "موقعیت‌ها", rows: [["موقعیت", "تاریخ"]].concat((k.cases || []).map(function (id) { var c = S.get(id); return [c ? c.title || id : id, c ? dt(c.created) : ""]; })) });
    tabs.push({ name: "ورزش", rows: [["تاریخ", "شکل", "اطمینان", "درست"]].concat((k.log || []).slice(-200).map(function (e) { return [e.d || dt(e.at), e.form || "", e.conf == null ? "" : e.conf + "٪", e.ok == null ? "" : (e.ok ? "✓" : "✗")]; })) });
    return { group: "گره‌گشا — گره‌ها", title: k.name || "گره", tabs: tabs };
  };
  /* مسئله‌های خودِ مالک (۲۰۲۶-۱۰-۱۳): هر مسئلهٔ واردشده یا «شبیه‌سازِ همین مسئله» یک فولدر + یک شیت — صورت و پاسخ، گام‌ها با گزینهٔ درست و
     نتیجهٔ وارسیِ سه‌حلی، بن‌بست‌ها، تمرین‌ها، مسئله‌های هم‌ساختار (pbitem) و پیشرفتِ شبیه‌ساز. نمونه‌های آمادهٔ سازنده رکورد ندارند ⇒ آینه نمی‌شوند.
     مسئلهٔ شخصی از گره‌گشا تابعِ همان انتخابِ درایوِ موقعیتش است. */
  BUILD.eprob = function (r) {
    if (!r || !r.p || r.status === "rejected") return null;
    var p = r.p, o = r.origin || p.origin;
    if (o && o.type === "kcase") { var kc = S.get(o.id); if (kc && !mirrorOn(kc)) return null; }
    var chk = r.check || {}, res = chk.res || {};
    var tabs = [{ name: "خلاصه", rows: [["فیلد", "مقدار"], ["عنوان", p.title || ""], ["رشته", p.field || ""], ["بازهٔ حل‌نشده", p.open || ""],
      ["وضعیت", r.status === "approved" ? "تأییدشده" : "در انتظارِ تأیید"], ["سازنده", r.personal ? "شبیه‌سازِ همین مسئله (از گره‌گشا)" : r.by === "ai" ? "تجزیهٔ هوش مصنوعی" : "دستی"],
      ["منابع", (p.src || []).join("\n") || (r.nosrc ? "بی‌منبع" : "")], ["وارسیِ پاسخ‌ها", chk.at ? dt(chk.at) + " — " + (chk.flags || []).length + " پرچم" : "اجرا نشده"],
      ["در برنامه", link("e_prob", p.id, "about")]] }];
    tabs.push({ name: "صورت و پاسخ", rows: [["فیلد", "مقدار"], ["صورت", p.statement || ""], ["پاسخِ نهایی", p.answer || ""], [r.personal ? "چرا گیرانداز است" : "چرا سال‌ها حل نشد", p.why_hard || ""], ["درس‌ها", txt(p.lessons || [])]] });
    tabs.push({ name: "گام‌ها", rows: [["#", "سال · شخص", "وضع تا این لحظه", "پرسش", "گزینهٔ درست", "حرکت", "حرکت‌ها", "سطح", "وارسی (هم‌نظر از ۳)"]].concat((p.stages || []).map(function (st, i) {
      var ok = (st.opts || []).filter(function (x) { return x && x.ok; })[0], c = res[st.id];
      return [i + 1, [st.year, st.who].filter(function (x) { return x != null && x !== ""; }).join(" · "), st.ctx || "", st.q || "", ok ? ok.t : "", st.move || "",
        (A.stageMoves ? A.stageMoves(p, st) : st.mv || []).map(function (m) { return A.MOVES && A.MOVES[m] ? A.MOVES[m].fa : m; }).join("، "), st.lvl || "", c ? c.agree + (c.multi ? " (دوپهلو)" : "") : ""];
    })) });
    tabs.push({ name: "بن‌بست‌ها", rows: [["سال · شخص", "ایده", "شکاف"]].concat((p.dead || []).map(function (d) { return [[d.year, d.who].filter(function (x) { return x != null && x !== ""; }).join(" · "), d.idea || "", d.flaw || ""]; })) });
    tabs.push({ name: "تمرین‌ها", rows: [["#", "پرسش", "پاسخِ درست", "وارسی (هم‌نظر از ۳)"]].concat((p.drills || []).map(function (d, i) { var c = res["drill" + (i + 1)]; return [i + 1, d.q || "", (d.opts || [])[d.a] || "", c ? String(c.agree) : ""]; })) });
    var its = S.all("pbitem", function (x) { return x.pid === p.id; });
    tabs.push({ name: "هم‌ساختار", rows: [["صورت", "پاسخ", "شکل", "بدلی", "وارسی", "پاسخ‌ها", "درست", "موعد"]].concat(its.map(function (x) {
      var ans = x.atype === "choice" ? ((x.choices || []).filter(function (c) { return c.id === x.answer; })[0] || {}).t || x.answer : x.answer, hh = x.hist || [];
      return [x.prompt || "", ans || "", x.form || "", x.decoy ? "بله" : "", x.bad ? "معیوب" : x.ver && x.ver.ok ? "۳ از ۳" : "وارسی‌نشده", hh.length, hh.filter(function (e) { return e.ok; }).length, x.due || ""];
    })) });
    var pg = S.get("eprog_" + p.id) || { lv: {} }, pr = [["سطح", "گام", "درست در بارِ اول", "خودسنجی", "حرکتِ خودم", "تاریخ"]];
    Object.keys(pg.lv || {}).forEach(function (lv) { var L = pg.lv[lv] || {}; Object.keys(L).forEach(function (sid) { var e = L[sid] || {}; pr.push([lv, sid, e.first === true ? "✓" : e.first === false ? "✗" : "", e.self == null ? "" : e.self, e.mine || "", dt(e.at)]); }); });
    tabs.push({ name: "پیشرفتِ شبیه‌ساز", rows: pr });
    return { group: "مسئله‌های من", title: p.title || "مسئله", tabs: tabs };
  };
  /* «💬 دستیار» (۲۰۲۶-۱۰-۱۴): هر سشن = یک مسئله ⇒ یک فولدر («دستیار — گفت‌وگوها/<نام · شناسه>») که پیوست‌هایش هم همان‌جاست؛
     شیت: خلاصه (خواستهٔ سنجاق‌شده، حافظه)، گفت‌وگوی کامل، مراحل، و برگه‌های «نظارت و سرکشی» که دستیار ثبت کرد. */
  BUILD.achat = function (s) {
    if (!s || !(s.msgs || []).length) return null;
    var who = { user: "من", ai: "دستیار", sys: "سامانه" };
    return { group: "دستیار — گفت‌وگوها", title: s.title || "گفت‌وگو", tabs: [
      { name: "خلاصه", rows: [["فیلد", "مقدار"], ["نام", s.title || ""], ["خواستهٔ اصلی", s.pinned || ""], ["حافظهٔ سشن", s.memory || ""], ["وضع", s.status || ""],
        ["مراحل", (s.steps || []).filter(function (x) { return x.s === "done"; }).length + " از " + (s.steps || []).length], ["ساخته‌شده", dt(s.created)], ["آخرین تغییر", dt(s.updated)]] },
      { name: "گفت‌وگو", rows: [["زمان", "گوینده", "متن", "پیوست‌ها", "کارها روی صفحه"]].concat((s.msgs || []).map(function (m) {
        return [dt(m.at), who[m.role] || m.role, m.text || "", (m.files || []).map(function (f) { return f.name + (f.link ? " — " + f.link : ""); }).join("\n"), (m.actions || []).join("، ")]; })) },
      { name: "مراحل", rows: [["#", "مرحله", "وضع", "نما"]].concat((s.steps || []).map(function (x, i) { return [i + 1, x.t || "", { done: "انجام شد", now: "در جریان", todo: "مانده" }[x.s] || x.s || "", x.view ? link(x.view) : ""]; })) },
      { name: "برگه‌های سرکشی", rows: [["شماره", "عنوان", "زمان"]].concat((s.reports || []).map(function (r) { return [r.number ? "#" + r.number : "(محلی)", r.title || "", dt(r.at)]; })) }] };
  };
  A.MIRROR_BUILD = BUILD;

  /* ---------- صف: چه چیزی دوباره ساخته شود ---------- */
  var dirty = {}, gone = {}, timer = null, busy = false, wait = 5000;
  var courseTopic = null;  // the course's topic last seen — when it changes, the OLD topic's sheet is rebuilt too
  function owners(r) {
    if (!r) return [];
    var out = [];
    if (BUILD[r.type]) out.push(r.id);
    if (r.type === "course") {
      if (r.topic) out.push(r.topic);
      if (courseTopic && courseTopic !== r.topic) out.push(courseTopic);
      courseTopic = r.topic || null;
      return out;
    }
    if (r.topic && (r.type === "ex" || r.type === "pr" || r.type === "sched" || r.type === "card")) out.push(r.topic);
    if ((r.type === "kitem" || r.type === "kexp") && r.knot) out.push(r.knot);
    if (r.type === "pbitem" && r.pid) out.push("eprob_" + r.pid);
    if (r.type === "eprog" && /^eprog_/.test(r.id)) out.push("eprob_" + r.id.slice(6));
    if (r.type === "kcase") (r.knots || []).forEach(function (id) { out.push(id); });
    if (r.type === "topic" || (r.type === "ex" && r.course)) out.push("course");
    return out;
  }
  function schedule(ms) { if (busy) return; clearTimeout(timer); timer = setTimeout(flush, ms || 2500); }
  /* every dirty id is sent — in chunks of ≤40 items / ~2.5 MB, one request at a time; a failed request puts its ids
     back and retries with a growing pause (5 s → 5 min); nothing is ever dropped (2026-10-12 audit). */
  function flush() {
    timer = null;
    if (busy) return;
    var ids = Object.keys(dirty), items = [], size = 0, sent = [];
    for (var i = 0; i < ids.length && items.length < 40; i++) {
      var id = ids[i], r = S.get(id); sent.push(id);
      if (!(r && BUILD[r.type] && !r.sample)) continue;
      try { var d = BUILD[r.type](r); if (!d) { gone[id] = 1; continue; } d.rec_id = id; var n = JSON.stringify(d).length; if (items.length && size + n > 2500000) { sent.pop(); break; } items.push(d); size += n; } catch (e) { console.error(e); }
    }
    var del = Object.keys(gone).slice(0, 200);
    sent.forEach(function (id) { delete dirty[id]; }); del.forEach(function (id) { delete gone[id]; });
    if (!items.length && !del.length) { if (Object.keys(dirty).length) schedule(50); return; }
    busy = true;
    A.HOST.mirror({ items: items, deleted: del }).then(function () {
      busy = false; wait = 5000; A._mirrorCache = null;
      if (Object.keys(dirty).length || Object.keys(gone).length) schedule(300);
    }, function (e) {
      busy = false;
      var st = e && e.response && e.response.status;
      if (st === 422 || st === 413) { console.warn("mirror rejected", st, e); return; }  // the same request would fail again
      sent.forEach(function (id) { dirty[id] = 1; }); del.forEach(function (id) { if (!S.get(id)) gone[id] = 1; });
      console.warn("mirror", e); schedule(wait); wait = Math.min(wait * 2, 300000);
    });
  }
  var rawPut = S.put, rawDel = S.del;
  S.put = function (r) { var out = rawPut.apply(this, arguments); try { owners(r).forEach(function (id) { dirty[id] = 1; delete gone[id]; }); schedule(); } catch (e) { } return out; };
  S.del = function (id) { var r = S.get(id); var out = rawDel.apply(this, arguments); try { if (r && BUILD[r.type]) { gone[id] = 1; delete dirty[id]; } owners(r).forEach(function (x) { if (x !== id) dirty[x] = 1; }); schedule(); } catch (e) { } return out; };
  try { window.addEventListener("pagehide", function () { if (Object.keys(dirty).length || Object.keys(gone).length) flush(); }); } catch (e) { }

  /* ---------- پرکردنِ اولیه: هر موردی که هنوز آینه ندارد ---------- */
  /* resolves once every queued change has been handed to the server (or after ~60 s) */
  A.mirrorDrain = function () {
    return new Promise(function (res) {
      var n = 0;
      (function tick() {
        if (!busy && !Object.keys(dirty).length && !Object.keys(gone).length) return res(true);
        if (!busy && !timer) flush();
        if (++n > 240) return res(false);
        setTimeout(tick, 250);
      })();
    });
  };
  A.mirrorBackfill = function () {
    return A.mirrorInfo(true).then(function (info) {
      if (!info) return 0;
      var known = {}; (info.items || []).forEach(function (i) { known[i.rec_id] = 1; });
      var n = 0;
      Object.keys(BUILD).forEach(function (t) { S.all(t, function (r) { return !r.sample && (t !== "kcase" && t !== "knot" || mirrorOn(r)); }).forEach(function (r) { if (!known[r.id]) { dirty[r.id] = 1; n++; } }); });
      if (n) schedule();
      return n;
    });
  };
  A.mirrorInfo = function (fresh) {
    if (!A.HOST.mirrorList) return Promise.resolve(null);
    if (A._mirrorCache && !fresh) return A._mirrorCache;
    A._mirrorCache = A.HOST.mirrorList().then(function (d) { var m = {}; (d.items || []).forEach(function (i) { m[i.rec_id] = i; }); d.map = m; return d; }, function () { A._mirrorCache = null; return null; });
    return A._mirrorCache;
  };
  // backfill only once the records have really loaded (S.loaded) — a fixed timer could run before a slow load and see nothing
  (function waitLoaded(n) { if (S.loaded) { courseTopic = (S.get("course") || {}).topic || null; setTimeout(function () { try { A.mirrorBackfill(); } catch (e) { } }, 2000); } else if (n < 120) setTimeout(function () { waitLoaded(n + 1); }, 1000); })(0);

  /* ---------- نشان‌دادنِ پیوند در خودِ صفحه ---------- */
  var REC_OF = { e_case: function () { return A.state.arg; }, topic: function () { return A.state.arg; }, course: function () { return "course"; }, lesson: function () { return "course"; },
    e_prob: function () { var id = A.state.arg ? "eprob_" + A.state.arg : null, r = id && S.get(id); return r && BUILD.eprob(r) ? id : null; },
    kcase: function () { var r = S.get(A.state.arg); return mirrorOn(r) ? A.state.arg : null; }, knot: function () { var r = S.get(A.state.arg); return mirrorOn(r) ? A.state.arg : null; } };
  function chip(info, rid) {
    var box = h("span", { class: "drv" });
    if (!info) return box;
    var it = info.map && info.map[rid];
    if (!info.connected) { box.appendChild(h("span", { class: "small muted" }, "📁 درایو وصل نیست")); return box; }
    if (!it) { box.appendChild(h("span", { class: "small muted", title: "حداکثر چند دقیقه دیگر ساخته می‌شود" }, "📁 در صفِ ساختِ فولدر…")); return box; }
    if (it.folder_url) box.appendChild(h("a", { class: "drvlink", href: it.folder_url, target: "_blank", rel: "noopener" }, "📁 فولدر در درایو"));
    if (it.sheet_url) box.appendChild(h("a", { class: "drvlink", href: it.sheet_url, target: "_blank", rel: "noopener" }, "📊 شیت"));
    if (it.pending) box.appendChild(h("span", { class: "small muted" }, it.folder_url ? " (تغییرهای تازه در صف)" : "📁 در صفِ ساختِ فولدر…"));
    if (it.error) box.appendChild(h("span", { class: "small bad", title: it.error }, " ⚠ " + it.error.slice(0, 80)));
    return box;
  }
  var rawRender = A.render;
  A.render = function () {
    try { wrapKnotViews(); } catch (e) { }
    rawRender();
    var f = REC_OF[A.state.view]; if (!f) return;
    var rid = f(); if (!rid) return;
    var bar = document.querySelector("#main nav.crumbs .where"); if (!bar) return;
    var slot = h("span", { class: "drvslot" }); bar.appendChild(slot);
    A.mirrorInfo().then(function (info) { slot.innerHTML = ""; slot.appendChild(chip(info, rid)); });
  };

  /* ---------- 📎 پیوست‌ها: خودِ فایل مستقیم در فولدرِ همان مورد در درایو؛ سرور فقط اشاره‌گر نگه می‌دارد ---------- */
  function fsize(n) { return n >= 1048576 ? fa((n / 1048576).toFixed(1)) + " مگابایت" : fa(Math.max(1, Math.round(n / 1024))) + " کیلوبایت"; }
  function attachSection(rid, meta, note) {
    var sec = h("section", { class: "card attach", "data-report-section": "attachments", "data-report-section-label": "پیوست‌ها" },
      h("h3", {}, "📎 پیوست‌ها"), h("p", { class: "small muted" }, "فایل (عکس، صوت، PDF، …) مستقیم در فولدرِ همین مورد در گوگل درایو نگه داشته می‌شود — نه در سرور؛ حداکثر ۲۵ مگابایت. حذف در این‌جا فایل را در درایو فقط تغییرِ نام می‌دهد."),
      note ? h("p", { class: "small warnline kn-attnote" }, note) : null);
    var list = h("ul", { class: "plain small" }, h("li", { class: "muted" }, "در حالِ خواندن…"));
    var inp = h("input", { type: "file", multiple: true, "aria-label": "انتخابِ فایل", onchange: function () { up(Array.prototype.slice.call(inp.files || [])); } });
    var st = h("span", { class: "small muted" });
    function load() {
      A.HOST.files(rid).then(function (fs) {
        list.innerHTML = "";
        if (!fs.length) list.appendChild(h("li", { class: "muted" }, "هنوز پیوستی نیست."));
        fs.forEach(function (f) {
          list.appendChild(h("li", { class: "row gap wrap" }, h("a", { href: f.link, target: "_blank", rel: "noopener" }, "📄 " + f.name), h("span", { class: "muted" }, fsize(f.size)),
            h("button", { class: "linkish", onclick: function () { if (!confirm("پیوستِ «" + f.name + "» از این‌جا برداشته شود؟ (در درایو فقط تغییرِ نام می‌دهد)")) return; A.HOST.delFile(f.id).then(load, function (e) { A.toast(errText(e), "bad"); }); } }, "برداشتن")));
        });
      }, function (e) { list.innerHTML = ""; list.appendChild(h("li", { class: "bad" }, errText(e))); });
    }
    function errText(e) { var d = e && e.response && e.response.data; return (d && d.detail) || (e && e.message) || "خطا"; }
    function up(files) {
      if (!files.length) return;
      var i = 0;
      (function next() {
        if (i >= files.length) { st.textContent = ""; inp.value = ""; load(); A._mirrorCache = null; return; }
        var f = files[i++];
        if (f.size > 25 * 1048576) { A.toast("«" + f.name + "» بزرگ‌تر از ۲۵ مگابایت است", "bad"); return next(); }
        st.textContent = "در حالِ فرستادنِ «" + f.name + "» به درایو…";
        A.HOST.upload(rid, f, meta).then(next, function (e) { A.toast(errText(e), "bad"); next(); });
      })();
    }
    sec.appendChild(h("div", { class: "row gap wrap" }, inp, st));
    sec.appendChild(list);
    load();
    return sec;
  }
  /* «📁 درایو» برای موقعیت و گرهِ گره‌گشا: پیش‌فرض روشن (خاموش‌کردنی)، با هشدارِ حریم */
  function driveToggles(r) {
    function cb(lab, key, hint, on) {
      return h("label", { class: "row gap small" }, h("input", { type: "checkbox", "data-key": key, checked: on, onchange: function (e) {
        r[key] = e.target.checked; S.put(r);
        if (key === "mirror") A.toast(e.target.checked ? "در فهرستِ آینهٔ درایو قرار گرفت." : "از آینه برداشته شد (فولدرِ موجود فقط تغییرِ نام می‌دهد، حذف نمی‌شود).");
        else A.toast(e.target.checked ? "یادداشت‌های خصوصی هم در شیت می‌آیند." : "یادداشت‌های خصوصی از شیت بیرون ماندند.");
      } }), lab, hint ? h("span", { class: "muted" }, " — " + hint) : null);
    }
    return h("section", { class: "card", dir: "rtl", "data-report-section": "kdrive", "data-report-section-label": "درایوِ گره‌گشا" },
      h("h3", {}, "📁 نسخه در گوگل درایو"),
      h("p", { class: "small muted" }, "برای هر موقعیت/گره یک فولدر و شیت در درایو ساخته می‌شود (خاموش‌کردنی)؛ احساس‌ها و یادداشت‌های هیجانی/باورِ خود فقط با انتخابِ جدا. جای فولدرها: «LifeManagerData › learning-architecture › گره‌گشا»."),
      cb("یک فولدر و شیت برای این مورد در درایو", "mirror", "پیش‌فرض: بله", mirrorOn(r)),
      cb("احساس‌ها و یادداشت‌های خصوصی (هیجانی/باور دربارهٔ خود) هم در شیت بیاید", "mirrorPrivate", "پیش‌فرض: نه", !!r.mirrorPrivate));
  }
  // a16 (which defines these views) loads AFTER this file ⇒ wrap lazily, once, on the first render
  function wrapKnotViews() { ["kcase", "knot"].forEach(function (v) {
    var raw = A.V[v]; if (!raw || raw._kdrive) return;
    A.V[v] = function (id) {
      var root = raw.apply(this, arguments), r = S.get(id);
      try { if (r && root && root.appendChild) { root.appendChild(driveToggles(r)); if (A.HOST.upload && v === "kcase") root.appendChild(attachSection(id, { group: "گره‌گشا — موقعیت‌ها", title: r.title || "موقعیت" },
        /* بارگذاری کاری صریح است و مجاز می‌ماند، ولی آینهٔ این موقعیت خاموش است ⇒ صادقانه بگو که فولدر ساخته می‌شود */
        mirrorOn(r) ? null : "آینهٔ درایوِ این موقعیت خاموش است؛ گذاشتنِ پیوست، فولدرِ این موقعیت را در درایو می‌سازد.")); } } catch (e) { console.error(e); }
      return root;
    };
    A.V[v]._kdrive = true;
  }); }
  A.attachSection = attachSection;   // a8 (فرمِ «افزودنِ مسئلهٔ تو») هم همین را به کار می‌برد
  /* مسئله‌های خودِ مالک (۲۰۲۶-۱۰-۱۳): صورت و حلِ مسئله اغلب عکسِ صفحهٔ کتاب، PDF ِ مقاله یا حلِ دست‌نویس است ⇒ پیوست در صفحهٔ
     همان مسئله، در همان فولدرِ «مسئله‌های من» که آینه‌اش می‌سازد. نمونه‌های آمادهٔ سازنده رکورد ندارند ⇒ پیوست ندارند. */
  if (A.HOST.upload && A.V.e_prob) {
    var rawProb = A.V.e_prob;
    A.V.e_prob = function (pid) {
      var root = rawProb.apply(this, arguments);
      try {
        var r = pid ? S.get("eprob_" + pid) : null;
        if (r && r.p && r.status !== "rejected" && root && root.appendChild) {
          var o = r.origin || r.p.origin, kc = o && o.type === "kcase" ? S.get(o.id) : null;
          root.appendChild(attachSection(r.id, { group: "مسئله‌های من", title: r.p.title || "مسئله" },
            kc && !mirrorOn(kc) ? "آینهٔ درایوِ موقعیتِ این مسئله خاموش است؛ گذاشتنِ پیوست، فولدرِ این مسئله را در درایو می‌سازد." : null));
        }
      } catch (e) { console.error(e); }
      return root;
    };
  }
  if (A.HOST.upload) {
    [["e_case", function (cs) { return { group: "پرونده‌ها", title: cs.title || "پرونده" }; }],
     ["topic", function (t) { return { group: "موضوع‌ها", title: t.title || "موضوع" }; }]].forEach(function (x) {
      var raw = A.V[x[0]]; if (!raw) return;
      A.V[x[0]] = function (id) {
        var root = raw.apply(this, arguments);
        var r = S.get(id);
        if (r && !r.sample && root && root.appendChild) root.appendChild(attachSection(id, x[1](r)));
        return root;
      };
    });
  }

  /* ---------- در «تنظیمات»: وضعیت و همگام‌سازیِ الان ---------- */
  var rawSettings = A.V.settings;
  A.V.settings = function () {
    var root = rawSettings.apply(this, arguments);
    var sec = h("section", { class: "card" }, h("h2", {}, "📁 گوگل درایو"), h("p", { class: "small muted" }, "در حالِ خواندنِ وضعیت…"));
    root.insertBefore(sec, root.children[1] || null);
    A.mirrorInfo(true).then(function (info) {
      sec.innerHTML = "";
      sec.appendChild(h("h2", {}, "📁 گوگل درایو"));
      if (!info) { sec.appendChild(h("p", { class: "small bad" }, "وضعیتِ درایو خوانده نشد.")); return; }
      var items = info.items || [], pend = items.filter(function (i) { return i.pending; }).length, err = items.filter(function (i) { return i.error; }).length;
      sec.appendChild(h("p", {}, "هر پرونده، هر موضوع و دوره یک فولدر با یک شیتِ تب‌دار در «LifeManagerData › learning-architecture» دارد. اصلِ داده در پایگاه‌دادهٔ برنامه است؛ درایو هر چند دقیقه خودکار به‌روز می‌شود."));
      sec.appendChild(h("p", { class: "small" }, (info.connected ? "✓ درایو وصل است" : "✗ درایو وصل نیست — در تنظیماتِ Lifemanager وصلش کن") + " · " + fa(items.length) + " مورد · " + fa(pend) + " در صف" + (err ? " · " + fa(err) + " خطا" : "")));
      sec.appendChild(h("div", { class: "row gap wrap" },
        info.root_url ? h("a", { class: "btn ghost sm", href: info.root_url, target: "_blank", rel: "noopener" }, "باز کردنِ LifeManagerData") : null,
        h("button", { class: "btn sm", onclick: function (e) {
          var b = e.target; b.disabled = true; b.textContent = "در حالِ نوشتن در درایو…";
          A.mirrorBackfill().then(function () { clearTimeout(timer); timer = null; return A.mirrorDrain(); }).then(function () { return A.HOST.mirrorSync(); })
            .then(function (r) { A.toast((r && r.skipped === "no_drive") ? "درایو وصل نیست؛ چیزی گم نمی‌شود و بعداً نوشته می‌شود." : (r && r.busy) ? "همگام‌سازی همین حالا در جریان است؛ چند دقیقهٔ دیگر نگاه کن." : (r && r.stopped === "quota") ? "سقفِ دقیقه‌ایِ گوگل پر شد؛ بقیه در نوبتِ بعدی (حداکثر ۱۵ دقیقه) نوشته می‌شود." : "نوشته شد: " + fa((r && r.written) || 0) + " مورد" + ((r && r.pending > r.written) ? " — بقیه در نوبت" : "")); A._mirrorCache = null; A.render(); },
              function (er) { A.toast((er && er.message) || "خطا", "bad"); b.disabled = false; });
        } }, "همگام‌سازیِ الان")));
      if (A.HOST.usage) {
        var us = h("div", { class: "small mt" }, "در حالِ خواندنِ حجم و مصرف…"); sec.appendChild(us);
        A.HOST.usage().then(function (u) {
          var s0 = u.storage || {}, ai = u.ai_30d || {};
          var kb = function (n) { return n >= 1048576 ? fa((n / 1048576).toFixed(1)) + " مگابایت" : fa(Math.round(n / 1024)) + " کیلوبایت"; };
          us.innerHTML = "";
          us.appendChild(h("h3", {}, "📦 حجم و هزینه"));
          us.appendChild(h("p", {}, "در پایگاه‌دادهٔ سرور: " + fa(s0.records || 0) + " رکورد (" + kb(s0.record_chars || 0) + ") + رونوشتِ خوانای آینه (" + kb(s0.mirror_chars || 0) + "). در درایو: " + fa(s0.files || 0) + " پیوست (" + kb(s0.file_bytes_in_drive || 0) + ") — پیوست‌ها جایی از سرور نمی‌گیرند."));
          var ms = ai.models || [];
          us.appendChild(h("p", {}, ms.length ? "هوش مصنوعیِ این صفحه در ۳۰ روزِ گذشته: " + ms.map(function (m) { return (m.model || "؟") + " · " + fa(m.calls) + " درخواست · حدودِ " + fa(m.est_tokens) + " توکن" + (m.est_cost_usd != null ? " · ≈ " + fa(m.est_cost_usd) + " دلار" : ""); }).join("؛ ") + "." : "هوش مصنوعیِ این صفحه در ۳۰ روزِ گذشته استفاده نشده است."));
          if (ms.length && !ai.all_priced) us.appendChild(h("p", { class: "small muted" }, "برای دیدنِ هزینهٔ تخمینی، قیمتِ مدل را در «تنظیماتِ AI ‹ 💲 قیمت» از صفحهٔ قیمتِ ارائه‌دهنده وارد کن (ارائه‌دهنده‌ها قیمت را از راهِ API نمی‌دهند). توکن ≈ نویسه÷۴ است؛ عددِ دقیق فقط در صورت‌حسابِ ارائه‌دهنده."));
        }, function () { us.textContent = "حجم و مصرف خوانده نشد."; });
      }
      /* خطاهای هم‌علت (مثلاً «API روشن نیست») یک بار با شمار، نه بیست بار */
      var byMsg = {}, order = [];
      items.filter(function (i) { return i.error; }).forEach(function (i) { if (!byMsg[i.error]) { byMsg[i.error] = []; order.push(i.error); } byMsg[i.error].push(i.title); });
      if (order.length) sec.appendChild(h("ul", { class: "small", dir: "rtl" }, order.slice(0, 5).map(function (m) { var t = byMsg[m]; return h("li", { class: "mirror-err" }, (t.length > 1 ? fa(t.length) + " مورد (" + t.slice(0, 3).join("، ") + (t.length > 3 ? "، …" : "") + ")" : t[0]) + ": ", h("span", { style: "overflow-wrap:anywhere" }, m)); })));
    });
    return root;
  };
})(APP);
