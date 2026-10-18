/* ===== لایهٔ پیش‌نیاز (P1) و «🧭 نقشهٔ مسیرِ مسئله» (P2) — دورِ ۲۲ ِ تورِ پولیا (DECISIONS_R22؛ نقشهٔ راهِ منبع‌ها §۱۵–§۱۶) — a44_route.js =====
   مالک (۲۰۲۶-۱۰-۱۸): «کمبودِ پیش‌نیاز ≠ گرهٔ ذهنی ≠ کم‌هوشی … دقیق، نه کلی … در همان حینِ حل … جای اصلی را گم نمی‌کند … نقشهٔ مسیر از مبدأ تا مقصد،
   انحراف‌ها نقطه‌چین، اصلاح‌ها پرشِ برگشت، موس روی هر نقطه، نوارِ جغرافیا در بخش‌های دیگر؛ داده از همان دفترِ رویدادها، نه نسخهٔ دوم».
   P1 — مدل گزارش می‌دهد، صفحه می‌سنجد (experiences/model-reports-state-page-validates.md):
     • coach_state.prereq {concept, step, quote, q?, topic?, parent?} (یا آرایه، به ترتیبِ اولویتِ همین حل) — صفحه می‌سنجد: نقل در آخرین پیامِ خودِ اوست،
       مفهوم دقیق است (نامِ یک رشته مثلِ «جبر» نیست)، مسئله باز است و گامِ نام‌برده بسته نیست. سپس پشته: مسئلهٔ اصلی ⇐ پیش‌نیاز ⇐ پیش‌نیازِ تو‌در‌تو؛
       چند پیش‌نیازِ یک گام پشتِ هم (wait) و برگشت به گام پس از همه. پیش‌نیازی که پیش‌تر آموخته شده دوباره درس داده نمی‌شود (فقط «کاربست»).
     • coach_state.prereq_res {id, diag: missing|had, quote} و {id, mastery: yes|no, quote}؛ coach_state.learned {concept, quote} (آموختنِ خودش، نقشِ «معلم» هم)؛
       coach_state.cause {kind: knot|skill, quote} برای گیرِ بی پیش‌نیاز — همه با نقلِ همان پیام.
     • هر مورد در «🧩 نقشهٔ پیش‌نیازها» ِ همان مسئله (با pid) می‌نشیند و پیش‌نیازِ نبوده یک موضوعِ یادگیری می‌گیرد؛ رویدادها با A.EVLOG در پروندهٔ همان مسئله.
     • گیرهایی که علتشان این پیش‌نیاز بود در کارنامه علتِ «پیش‌نیاز» می‌گیرند (a29 آن‌ها را در مرحله نمی‌شمارد)؛ «بود» ⇒ علت «مهارت» با شاهدِ آزمون.
   P2 — A.ROUTE.model(id) فقط از A.dossier(pid) / A.dossierSess(sid) (همان رویدادهای پرونده و A.EVLOG) و پشتهٔ همین لایه ساخته می‌شود؛ هیچ دفترِ دومی نیست. */
(function (A) {
  var AS = A.ASSIST, S = A.S, h = A.h, fa = A.fa;
  if (!AS || !S || !A.V) return;
  var PRE = A.PRE = A.PRE || {};
  function nowIso() { return A.nowISO(); }
  function txt(t) { return String(t == null ? "" : t).replace(/\s+/g, " ").trim(); }
  function clip(t, n) { var s = txt(t); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function noq(t) { return String(t == null ? "" : t).replace(/[«»]/g, ""); }
  function isUser(m) { return !!m && m.role === "user" && !/^\[(?:سامانه|اصلاحِ?[\s‌]*پیامِ?[\s‌]*قبلی)/.test(String(m.text || "")); }
  function lastUser(s) { var M = (s && s.msgs) || []; for (var i = M.length - 1; i >= 0; i--) if (isUser(M[i])) return M[i]; return null; }
  function mid(m) { try { return m && AS.msgId ? AS.msgId(m) : ""; } catch (e) { return ""; } }
  function nk(t) { return String(t || "").replace(/[ً-ٰٟ‌\s«»"'.,،؛:!؟?…()\[\]{}ِ]/g, "").toLowerCase(); }
  function quoteIn0(q, t) { try { return AS.quoteIn ? AS.quoteIn(q, t) : String(t || "").indexOf(String(q || "")) >= 0; } catch (e) { return false; } }
  /* نیم‌فاصله و کسرهٔ اضافه («معادله ی» ≡ «معادلهٔ» ≡ «معادله‌ی») هم همان نقل است؛ نقل با املای خودِ او نگه داشته می‌شود (herSpan) */
  function zn(t) { return String(t || "").replace(/ك/g, "ک").replace(/ي/g, "ی").replace(/ۀ/g, "ه").replace(/ه[\s‌]+ی(?=$|[\s.،؛!؟?])/g, "ه").replace(/هٔ/g, "ه"); }
  function quoteIn(q, t) { return !!txt(q) && (quoteIn0(q, t) || quoteIn0(zn(q), zn(t))); }
  function nmap(t) {
    var o = "", ix = [], T = String(t || ""), lastK = "", gap = false;
    for (var i = 0; i < T.length; i++) {
      var c = T[i];
      if (/[\s‌]/.test(c)) { gap = true; continue; }
      if (/[ً-ٰٟ«»"'.,،؛:!؟?…()\[\]{}]/.test(c)) continue;
      if (c === "ی" && lastK === "ه" && gap && (i + 1 >= T.length || /[\s.،؛!؟?]/.test(T[i + 1]))) { gap = false; continue; }
      c = c === "ك" ? "ک" : c === "ي" ? "ی" : c === "ۀ" ? "ه" : /[۰-۹]/.test(c) ? String(c.charCodeAt(0) - 1776) : c.toLowerCase();
      o += c; ix.push(i); lastK = c; gap = false;
    }
    return { s: o, ix: ix };
  }
  function herSpan(q, t) { var T = String(t || ""), Q = txt(q); if (!Q || T.indexOf(Q) >= 0) return Q; var a = nmap(T), b = nmap(Q); if (!b.s) return Q; var k = a.s.indexOf(b.s); if (k < 0) return Q; return T.slice(a.ix[k], a.ix[k + b.s.length - 1] + 1); }
  PRE.herSpan = herSpan; PRE.quoteIn = quoteIn;

  /* ---------- دامنه: مسئلهٔ زندهٔ بازِ این سشن، وگرنه مسئلهٔ گفت‌وگوی در کانون (سشن + pk) ---------- */
  PRE.scope = function (s) {
    try { var b = AS.boundLive ? AS.boundLive(s) : null; if (b && b.pid && !b.done) return { pid: b.pid }; } catch (e) { }
    try { if (s && AS.chatFocus && AS.chatFocus(s)) return { sess: s.id, pk: String((s.coach || {}).pk || "c:0"), s: s }; } catch (e) { }
    return null;
  };
  function store(sc) {
    if (!sc) return null;
    if (sc.pid) {
      var pg = S.get("eprog_" + sc.pid); if (!pg) { if (!(A.liveRec && A.liveRec(sc.pid))) return null; pg = S.put({ id: "eprog_" + sc.pid, type: "eprog" }); }
      var so = pg.solve = pg.solve || {}, L = so.live = so.live || {}, X = L.pre22 = L.pre22 || { st: [], n: 0 };
      return { X: X, put: function () { S.put(pg); } };
    }
    var se = sc.s || S.get(sc.sess); if (!se) return null;
    var C = se.coach = se.coach || {}, P = C.pre22 = C.pre22 || {}, Y = P[sc.pk] = P[sc.pk] || { st: [], n: 0 };
    return { X: Y, put: function () { S.put(se); } };
  }
  PRE.store = store;
  var OPEN = { diag: 1, teach: 1, wait: 1 };
  function openOf(X) { return ((X && X.st) || []).filter(function (e) { return e && OPEN[e.state]; }); }
  function topOf(X) { var o = openOf(X); return o.length ? o[o.length - 1] : null; }
  function byId(X, id) { return ((X && X.st) || []).filter(function (e) { return e && e.id === String(id || ""); })[0] || null; }
  PRE.stack = function (sc) { var R = store(sc); return R ? openOf(R.X) : []; };
  PRE.all = function (sc) { var R = store(sc); return R ? R.X.st.slice() : []; };
  function scTitle(sc) {
    if (sc.pid) { var r = A.liveRec && A.liveRec(sc.pid); return r ? r.p.title : ""; }
    var se = sc.s || S.get(sc.sess); return clip(((se && se.coach) || {}).stmt || (se && se.title) || "مسئلهٔ گفت‌وگو", 70);
  }
  function scStmt(sc) { if (sc.pid) { var r = A.liveRec && A.liveRec(sc.pid); return r ? r.p.statement : ""; } var se = sc.s || S.get(sc.sess); return clip(((se && se.coach) || {}).stmt || "", 1500); }
  function solved(sc) {
    if (sc.pid) { var pg = S.get("eprog_" + sc.pid), L = pg && pg.solve && pg.solve.live; if (L && L.state === "solved") return true; try { return A.livePhase && A.livePhase(sc.pid) === "done"; } catch (e) { return false; } }
    return false;
  }
  /* «گامِ باز»: گامی از مسئلهٔ زنده که با شماره/شناسه نام برده شد و با «انجام شد» بسته است، باز نیست */
  function stepClosed(sc, step) {
    if (!sc.pid) return false; var pg = S.get("eprog_" + sc.pid), L = (pg && pg.solve && pg.solve.live) || {}, ST = L.steps || [];
    var m = /(?:^|\s|گامِ?\s*)(?:s|S)?([0-9۰-۹]+)(?=\s|$|[.،:)])/.exec(String(step || "")); if (!m) return false;
    var n = +String(m[1]).replace(/[۰-۹]/g, function (c) { return String(c.charCodeAt(0) - 1776); }), st = ST[n - 1];
    return !!(st && st.closed && st.out && !st.out.auto && st.out.done === "yes");
  }
  /* «دقیق، نه کلی» (§۱۵): نامِ یک رشته یا شاخهٔ کامل پیش‌نیاز نیست */
  var BROAD = /^(?:ریاضی|ریاضیات|جبر|هندسه|حساب|حسابان|مثلثات|فیزیک|شیمی|آمار|احتمال|منطق|علوم|زیست|زیست‌شناسی|اقتصاد|ادبیات|اتحادها|فرمول‌ها|فرمولها|مفهوم|پایه|درس|همه‌چیز)$/;
  function broad(c) { var x = txt(c).replace(/^(?:مفهومِ?|علمِ?|درسِ?)\s+/, "").replace(/[ِ‌\s]+$/, ""); return BROAD.test(x.replace(/\s+/g, "")) || BROAD.test(x); }
  PRE.broad = broad;
  /* «پارسال یاد گرفتم» — کمبودِ گذشته که دیگر نیست، پیش‌نیازِ امروز نیست */
  var PASTLEARN = /(?:قبلاً|قبلا|پارسال|اون[\s‌]*موقع|آن[\s‌]*موقع|سابقاً|بچه[\s‌]*که[\s‌]*بودم)[^.؟?!]{0,40}(?:بلد[\s‌]*نبودم|نمی[‌\s]?(?:دونستم|دانستم))[^.؟?!]{0,50}(?:یاد[\s‌]*گرفتم|بلد[\s‌]*شدم|فهمیدم)/;
  function sameConcept(a, b) { var x = nk(a), y = nk(b); if (!x || !y) return false; if (x === y) return true; var s = x.length <= y.length ? x : y, l = s === x ? y : x; return s.length >= 5 && l.indexOf(s) >= 0; }
  PRE.sameConcept = sameConcept;

  /* ---------- «🧩 نقشهٔ پیش‌نیازها» ِ همان مسئله (یک رکورد برای هر مسئله، با pid) ---------- */
  PRE.rec = function (sc, make) {
    var L = S.all("prereq", function (p) { return p && (sc.pid ? p.pid === sc.pid : (p.sess === sc.sess && p.pk === sc.pk)); });
    if (L.length || !make) return L[0] || null;
    return S.put({ id: A.uid("pq"), type: "prereq", title: scTitle(sc) || "پیش‌نیازهای این مسئله", statement: scStmt(sc), items: [], kcase: "", pid: sc.pid || "", sess: sc.sess || "", pk: sc.pk || "", from: "coach" });
  };
  function itemOf(sc, e, make) {
    var p = PRE.rec(sc, make); if (!p) return null; p.items = p.items || [];
    var x = p.items.filter(function (y) { return y && y.eid === e.id; })[0];
    /* همان مفهوم دوباره در همین مسئله ⇒ همان مورد به‌روز می‌شود (بانکِ R22 #38) */
    if (!x) { x = p.items.filter(function (y) { return y && sameConcept(y.concept, e.concept); })[0]; if (x) { (x.eids = x.eids || []).push(x.eid || ""); x.eid = e.id; x.rediag = (x.rediag || 0) + 1; } }
    if (!x && make) { x = { concept: clip(e.concept, 120), sci: "", sub: clip(e.topic || "", 80), why: "گامِ «" + clip(e.step, 120) + "»", q: clip(e.q || "", 300), ref: "", by: "coach", self: "", ans: "", eid: e.id, step: clip(e.step, 200), quote: clip(e.quote, 300), state: e.state, at: e.at, parent: e.parent || "", depth: e.depth || 0 }; p.items.push(x); }
    return { p: p, x: x };
  }
  function syncItem(sc, e) {
    var o = itemOf(sc, e, true); if (!o || !o.x) return; var x = o.x;
    x.state = e.state; x.step = clip(e.step, 200); if (e.diagAns) x.ans = clip(e.diagAns, 400);
    if (e.state === "teach" || e.state === "learned") { if (!x.self) { x.self = "بلد نیستم"; x.selfAt = e.diagAt || nowIso(); x.selfBy = "diag"; } }
    if (e.state === "had" && !x.self) { x.self = "بلدم"; x.selfAt = e.diagAt || nowIso(); x.selfBy = "diag"; }
    if (e.state === "learned") { x.learned = e.learnedAt; x.mastery = clip(e.mastQuote || "", 300); if (e.selfMade) x.how = "خودش ساخت"; if (e.role) x.role = e.role; }
    /* پیش‌نیازِ نبوده ⇒ موضوعِ یادگیری برای موضوعِ بزرگ‌تر (سفر و مرور) — یک بار */
    if ((e.state === "teach" || e.state === "learned") && !(x.topic && S.get(x.topic)) && A.prereqMkTopic) { try { A.prereqMkTopic(o.p, x); } catch (er) { } }
    S.put(o.p);
  }
  /* پیش‌نیازی که در هر مسئله‌ای پیش‌تر آموخته شد (بانکِ R22 #35) */
  function learnedAnywhere(c) {
    var hit = null; S.all("prereq").forEach(function (p) { (p.items || []).forEach(function (x) { if (!hit && x && x.state === "learned" && sameConcept(x.concept, c)) hit = { p: p, x: x }; }); }); return hit;
  }

  /* ---------- دفترِ رویداد (A.EVLOG) — همان پرونده و همان نقشهٔ مسیر ---------- */
  function evScope(sc) { return sc.pid ? { pid: sc.pid } : { sess: sc.sess }; }
  function evlog(sc, e, k, title, lines, out, srcM, se) {
    if (!A.EVLOG || !A.EVLOG.add) return;
    var src = srcM ? { sess: (se && se.id) || sc.sess || "", mid: mid(srcM), text: srcM.text, at: srcM.at || "", title: (se && se.title) || "" } : null;
    try { A.EVLOG.add(Object.assign(evScope(sc), { id: "pre22_" + e.id + "_" + k, k: k, at: (srcM && srcM.at) || nowIso(), title: title, lines: lines, out: out || "", src: src, by: "coach" })); } catch (er) { }
  }
  PRE.evId = function (id) { var m = /^pre22_(pq\d+)_(\w+)$/.exec(String(id || "")); return m ? { eid: m[1], k: m[2] } : null; };

  /* ---------- علتِ گیر در کارنامه (a29 می‌خواند): گیرهای همین مسئله از آخرین موفقیت تا تشخیص ⇒ «پیش‌نیاز» ---------- */
  function causeMark(s, sc, e, um) {
    var E = (s && s.coachEv) || [], m0 = mid(um), lastOk = "";
    E.forEach(function (x) { if (x && x.ok && !x.wd && (sc.pid ? x.pid === sc.pid : !x.pid) && String(x.at || "") <= String(um.at || nowIso()) && x.msg !== m0) lastOk = String(x.at || "") > lastOk ? String(x.at || "") : lastOk; });
    E.forEach(function (x) {
      if (!x || x.ok || x.wd || x.src !== "chat" || x.cause === "prereq") return;
      if (sc.pid ? x.pid !== sc.pid : !!x.pid) return;
      if (x.msg !== m0 && !(String(x.at || "") >= lastOk && String(x.at || "") <= String(nowIso()))) return;
      x.cause = "prereq"; x.pre = e.id; x.preC = clip(e.concept, 80); x.preStep = clip(e.step, 80); x.preQ = clip(e.quote, 120); x.prePid = sc.pid || ""; x.preRec = (PRE.rec(sc) || {}).id || "";
    });
  }
  function causeUnmark(s, sc, e) {
    ((s && s.coachEv) || []).forEach(function (x) { if (x && x.pre === e.id && x.cause === "prereq") { x.cause = "skill"; x.causeWhy = "پرسشِ تشخیصی نشان داد «" + clip(e.concept, 60) + "» را داشت" + (e.diagAns ? ": «" + clip(e.diagAns, 80) + "»" : ""); } });
  }

  /* ---------- جای منتظر و بازگویی‌اش ---------- */
  function gotSoFar(sc) {
    if (sc.pid) {
      var pg = S.get("eprog_" + sc.pid), so = (pg && pg.solve) || {}, L = so.live || {}, u = (so.u && so.u[1]) || L.uDraft || {}, out = [];
      if (txt(u.u)) out.push("مجهول: «" + clip(u.u, 70) + "»");
      if (L.plan && txt(L.plan.t)) out.push("طرح: «" + clip(L.plan.t, 80) + "»");
      var done = (L.steps || []).filter(function (st) { return st && st.out && !st.out.auto && st.out.done === "yes"; }); if (done.length) out.push(fa(done.length) + " گامِ انجام‌شده (آخری: «" + clip(done[done.length - 1].text, 50) + "»)");
      return out.join("؛ ");
    }
    var se = sc.s || S.get(sc.sess), C = (se && se.coach) || {}; return C.stmt ? "صورت: «" + clip(C.stmt, 90) + "»" : "";
  }
  PRE.gotSoFar = gotSoFar;
  function placeOf(sc, X, e) {
    /* چند پیش‌نیازِ یک گام (بانکِ R22 #14): پس از یکی، سراغِ بعدیِ همان گام — برگشت به گام فقط پس از همه */
    var O = openOf(X), i = O.indexOf(e), sib = null; for (var j = i - 1; j >= 0; j--) { if (O[j].state === "wait" && (O[j].parent || "") === (e.parent || "")) { sib = O[j]; break; } }
    if (sib) return { to: "sib", id: sib.id, fa: "پیش‌نیازِ بعدیِ همین گام «" + clip(sib.concept, 60) + "»", step: sib.concept, sib: sib };
    var par = e.parent ? byId(X, e.parent) : null;
    if (par) return { to: "pre", id: par.id, fa: "پیش‌نیازِ «" + clip(par.concept, 60) + "» (همان‌جا که برای «" + clip(par.step, 50) + "» یادش می‌گرفتی)", step: par.concept };
    return { to: "main", fa: "مسئلهٔ اصلی «" + clip(scTitle(sc), 60) + "»، گامِ «" + clip(e.step, 70) + "»", step: e.step, got: gotSoFar(sc) };
  }
  PRE.placeOf = function (sc, eid) { var R = store(sc); if (!R) return null; var e = byId(R.X, eid); return e ? placeOf(sc, R.X, e) : null; };
  function restate(sc, X, e) {
    var pl = placeOf(sc, X, e);
    if (pl.to === "sib") return "«" + clip(e.concept, 60) + "» را داری؛ همین گامِ «" + clip(e.step, 60) + "» «" + clip(pl.sib.concept, 60) + "» را هم لازم دارد — " + (pl.sib.q ? "پرسشِ تشخیصی‌اش: «" + noq(pl.sib.q) + "»" : "اول ببینیم آن را داری یا نه (یک پرسشِ تشخیصیِ کوتاه)") + ".";
    return "برگردیم به " + pl.fa + (pl.got ? ". تا این‌جا داری: " + pl.got : "") + ". حالا که «" + clip(e.concept, 60) + "» را داری، همان " + (pl.to === "pre" ? "پیش‌نیاز" : "گام") + " را چطور برمی‌داری؟";
  }
  PRE.restate = function (sc, eid) { var R = store(sc); if (!R) return ""; var e = byId(R.X, eid); return e ? restate(sc, R.X, e) : ""; };

  /* ---------- سنجشِ گزارشِ مدل ---------- */
  function num(X) { X.n = (X.n || 0) + 1; return "pq" + X.n; }
  function learnedOne(s, sc, X, e, q, um, notes) {
    var pl = placeOf(sc, X, e); e.state = "learned"; e.learnedAt = nowIso(); e.mastQuote = q; e.back = { to: pl.to, id: pl.id || "", fa: pl.fa, at: nowIso() };
    if (pl.to === "sib" && pl.sib) pl.sib.state = "diag";   // پرسشِ تشخیصیِ بعدی همین نوبت پرسیده می‌شود (رهنمودِ همین نوبت)
    if (pl.to === "main") X.ret = { eid: e.id, key: mid(um), at: nowIso() };
    notes.push("«" + clip(e.concept, 40) + "» آموخته شد — برگشت به " + pl.fa);
    evlog(sc, e, "preok", "🧩 آموخته شد: «" + clip(e.concept, 60) + "»", ["وارسیِ تسلط: «" + clip(q, 200) + "»"].concat(e.selfMade ? ["خودش ساخت — از پرسشِ تشخیصی"] : []), "برگشت به " + pl.fa, um, s);
    try { s.msgs.push({ role: "sys", at: nowIso(), text: "🧩 «" + clip(e.concept, 60) + "» آموخته شد (پیشرفت، نه ضعف) — برگشت به " + pl.fa + "." }); } catch (er) { }
  }
  PRE.report = function (s, a) {
    var um = lastUser(s); if (!um || !a) return "";
    var ut = String(um.text || ""), sc = PRE.scope(s), notes = [];
    var raws = [].concat(Array.isArray(a.prereq) ? a.prereq : a.prereq ? [a.prereq] : []), ress = [].concat(Array.isArray(a.prereq_res) ? a.prereq_res : a.prereq_res ? [a.prereq_res] : []);
    var lrn = a.learned && typeof a.learned === "object" ? [].concat(a.learned) : [];
    if (!raws.length && !ress.length && !lrn.length) return "";
    if (!sc) { s.pre22note = { key: mid(um), lines: ["پیش‌نیاز ثبت نشد: مسئلهٔ بازی در کانون نیست"] }; return ""; }
    var R = store(sc); if (!R) return ""; var X = R.X, dirty = false;
    /* (۱) پاسخ‌ها (پرسشِ تشخیصی / تسلط) */
    ress.forEach(function (rs) {
      if (!rs || typeof rs !== "object") return; var e = rs.id ? byId(X, rs.id) : topOf(X);
      if (!e || !OPEN[e.state]) { notes.push("پاسخِ پیش‌نیاز رد شد: «" + (rs.id || "؟") + "» در پشته باز نیست"); return; }
      var q0 = txt(rs.quote); if (!q0 || !quoteIn(q0, ut)) { notes.push("پاسخِ پیش‌نیازِ «" + clip(e.concept, 40) + "» رد شد: نقل در پیامِ خودش نیست"); return; }
      var q = herSpan(q0, ut);
      if (e.state === "wait") e.state = "diag";
      if (rs.mastery === "yes" && e.state === "diag") e.selfMade = true;   // پاسخِ همان پرسشِ تشخیصی مفهوم را ساخت (بانکِ R22 #15)
      if (rs.diag && e.state === "diag") {
        e.diagAns = q; e.diagAt = nowIso();
        if (rs.diag === "had") { var plh = placeOf(sc, X, e); e.state = "had"; causeUnmark(s, sc, e); if (plh.to === "sib" && plh.sib) plh.sib.state = "diag"; notes.push("«" + clip(e.concept, 40) + "» را داشت — گیر از نبودنِ آن نبود؛ برگشت به " + plh.fa);
          evlog(sc, e, "prediag", "🧩 پرسشِ تشخیصی: «" + clip(e.concept, 60) + "»", ["پاسخِ تو: «" + clip(q, 200) + "»"], "بود — پیش‌نیاز کم نبود", um, s); }
        else if (rs.diag === "missing") { e.state = "teach"; notes.push("«" + clip(e.concept, 40) + "» واقعاً نبود — حالا فقط به اندازهٔ گامِ «" + clip(e.step, 40) + "» یاد بده و تسلط را بسنج");
          evlog(sc, e, "prediag", "🧩 پرسشِ تشخیصی: «" + clip(e.concept, 60) + "»", ["پاسخِ تو: «" + clip(q, 200) + "»"], "نبود — یاد گرفتنِ همین مفهوم به اندازهٔ همین گام", um, s); }
        syncItem(sc, e); dirty = true;
      }
      if (rs.mastery) {
        /* پاسخِ پرسشِ تشخیصی که خودش مفهوم را ساخت همان وارسیِ تسلط است (بانکِ R22 #15) */
        if (e.state === "diag" && rs.mastery === "yes") { e.state = "teach"; e.diagAns = e.diagAns || q; e.diagAt = e.diagAt || nowIso(); }
        if (e.state !== "teach") return;
        if (rs.mastery === "yes") learnedOne(s, sc, X, e, q, um, notes);
        else { e.tries = (e.tries || 0) + 1; notes.push("تسلط بر «" + clip(e.concept, 40) + "» هنوز نیست — همان سطح می‌ماند؛ از راهِ دیگری دوباره یاد بده"); }
        syncItem(sc, e); dirty = true;
      }
    });
    /* (۲) پیش‌نیازهای تازه — سنجش، ترتیب، پشته */
    if (raws.length) {
      if (solved(sc)) notes.push("پیش‌نیاز رد شد: این مسئله حل شده است");
      else {
        var top0 = topOf(X), ok = [];
        raws.forEach(function (x) {
          if (!x || typeof x !== "object") return; var c = clip(x.concept, 120), st = clip(x.step, 200), qt = txt(x.quote);
          var par = x.parent ? byId(X, x.parent) : null; if (x.parent && !(par && OPEN[par.state])) par = null;
          if (!par && top0 && !x.main) par = top0;   // تو‌در‌تو: پیش‌نیازی که هنگامِ یاد گرفتنِ پیش‌نیازِ باز پیدا شد زیرِ همان است
          if (!st && par) st = par.concept;
          if (c.length < 3) { notes.push("پیش‌نیاز رد شد: نامِ مفهوم نیامد"); return; }
          if (broad(c)) { notes.push("پیش‌نیاز رد شد: «" + c + "» نامِ یک رشته است، نه مفهومِ مشخص — بگو کدام مفهوم در کدام گام (مثلاً «تجزیهٔ x²−y² به (x−y)(x+y)»)"); return; }
          if (!st) { notes.push("پیش‌نیازِ «" + c + "» رد شد: گامی که آن را لازم دارد نیامد"); return; }
          if (!qt || !quoteIn(qt, ut)) { notes.push("پیش‌نیازِ «" + c + "» رد شد: نقل در آخرین پیامِ خودش نیست"); return; }
          if (PASTLEARN.test(ut)) { notes.push("پیش‌نیازِ «" + c + "» رد شد: گفت پیش‌تر یادش گرفته — کمبودِ امروز نیست"); return; }
          if (stepClosed(sc, st)) { notes.push("پیش‌نیازِ «" + c + "» رد شد: گامِ «" + clip(st, 40) + "» بسته است"); return; }
          if (openOf(X).some(function (e) { return sameConcept(e.concept, c); }) || ok.some(function (o) { return sameConcept(o.c, c); })) { notes.push("«" + c + "» همین حالا در پشته است"); return; }
          var la = learnedAnywhere(c);
          if (la) { (la.x.uses = la.x.uses || []).push({ pid: sc.pid || "", sess: sc.sess || s.id, at: nowIso(), step: st, quote: herSpan(qt, ut) }); S.put(la.p);
            notes.push("«" + c + "» را پیش‌تر آموخته (" + (la.x.learned ? A.fdate(String(la.x.learned).slice(0, 10)) : "پیش‌تر") + "، «" + clip(la.p.title, 40) + "») — دوباره درس نده؛ فقط یک یادآوریِ یک‌خطی و برو سرِ همین گام (کاربستش در این مسئله ثبت شد)"); return; }
          ok.push({ c: c, st: st, qt: herSpan(qt, ut), q: clip(x.q || "", 300), topic: clip(x.topic || x.subject || "", 80), par: par });
        });
        /* ترتیبِ اولویت: نخستینِ گزارش (آن‌که راه را زودتر بسته) بالای پشته و همین حالا «تشخیص»؛ بقیهٔ همان گام «در نوبت» (wait) */
        var n0 = ok.length;
        ok.slice().reverse().forEach(function (o, k) {
          var first = k === n0 - 1;
          var e = { id: num(X), concept: o.c, step: o.st, quote: o.qt, q: o.q, topic: o.topic, parent: o.par ? o.par.id : "", depth: o.par ? (o.par.depth || 0) + 1 : 0, state: first ? "diag" : "wait", at: nowIso(), msg: mid(um), sess: s.id };
          X.st.push(e); causeMark(s, sc, e, um); syncItem(sc, e);
          evlog(sc, e, "pre", "🧩 پیش‌نیاز تشخیص داده شد: «" + clip(e.concept, 60) + "»", ["گامِ منتظر: «" + clip(e.step, 120) + "»", "از حرفِ خودت: «" + clip(e.quote, 200) + "»"].concat(e.q ? ["پرسشِ تشخیصی: «" + noq(e.q) + "»"] : []).concat(o.par ? ["تو‌در‌تو، زیرِ «" + clip(o.par.concept, 60) + "»"] : []), first ? "" : "در نوبت — پس از پیش‌نیازِ قبلیِ همین گام", um, s);
          notes.push("پیش‌نیازِ «" + clip(e.concept, 50) + "» (" + e.id + ") برای گامِ «" + clip(e.step, 50) + "» در پشته نشست" + (o.par ? " — زیرِ «" + clip(o.par.concept, 40) + "»" : "") + (first ? "" : " (در نوبت)"));
          dirty = true;
        });
      }
    }
    /* (۳) آموختنِ خودش — نقشِ «معلم» هم (بانکِ R22 #11): «به داداشم یاد دادم … خودمم تازه فهمیدم» */
    lrn.forEach(function (x) {
      var c = clip(x.concept, 120), q0 = txt(x.quote); if (c.length < 3 || broad(c)) { notes.push("آموختنِ گزارش‌شده رد شد: مفهومِ مشخص نیامد"); return; }
      if (!q0 || !quoteIn(q0, ut)) { notes.push("آموختنِ «" + c + "» رد شد: نقل در پیامِ خودش نیست"); return; }
      var q = herSpan(q0, ut), e = openOf(X).filter(function (y) { return sameConcept(y.concept, c); })[0], teach = !!((s.coach || {}).teach) || /یاد[\s‌]*(?:دادم|میدم|می[‌\s]دهم)|درس[\s‌]*دادم|توضیح[\s‌]*دادم/.test(ut);
      if (e) { if (e.state === "diag" || e.state === "wait") { e.state = "teach"; } e.role = teach ? "teacher" : ""; learnedOne(s, sc, X, e, q, um, notes); syncItem(sc, e); dirty = true; return; }
      var la = learnedAnywhere(c); if (la) { (la.x.practised = la.x.practised || []).push({ at: nowIso(), quote: q, role: teach ? "teacher" : "self" }); S.put(la.p); notes.push("کاربستِ «" + c + "» ثبت شد" + (teach ? " (در نقشِ معلم)" : "")); return; }
      var e2 = { id: num(X), concept: c, step: clip(x.step || "", 200) || "یادگیریِ خودش", quote: q, q: "", topic: clip(x.topic || "", 80), parent: "", depth: 0, state: "teach", at: nowIso(), msg: mid(um), sess: s.id, role: teach ? "teacher" : "", self: true };
      X.st.push(e2); e2.state = "learned"; e2.learnedAt = nowIso(); e2.mastQuote = q; syncItem(sc, e2);
      evlog(sc, e2, "preok", "🧩 آموخت: «" + clip(c, 60) + "»" + (teach ? " (در نقشِ معلم)" : ""), ["از حرفِ خودت: «" + clip(q, 200) + "»"], "پیشرفت", um, s);
      notes.push("آموختنِ «" + c + "» ثبت شد" + (teach ? " (در نقشِ معلم — یادگیریِ خودِ اوست)" : "")); dirty = true;
    });
    X.note = { key: mid(um), at: nowIso(), lines: notes };
    if (dirty) R.put();
    try { S.put(s); } catch (e) { }
    return "";
  };
  /* علتِ گیرِ بی پیش‌نیاز: گره (مفهوم را دارد، راه/بازنمایی را نمی‌بیند) یا مهارت (روش را می‌داند و در اجرا لغزید) — با نقل */
  PRE.cause = function (s, a) {
    var um = lastUser(s), c = a && a.cause; if (!um || !c || typeof c !== "object" || !/^(?:knot|skill)$/.test(String(c.kind || ""))) return;
    var q = txt(c.quote); if (!q || !quoteIn(q, um.text)) return; var m0 = mid(um), sp = herSpan(q, um.text);
    ((s && s.coachEv) || []).forEach(function (x) { if (x && !x.ok && x.msg === m0 && x.cause !== "prereq") { x.cause = c.kind; x.causeWhy = (c.kind === "knot" ? "گره — مفهوم را دارد، راه را نمی‌بیند" : "مهارت — روش را می‌داند، در اجرا لغزید") + ": «" + clip(sp, 80) + "»"; } });
  };
  if (AS.DO && AS.DO.coach_state && !AS.DO.coach_state._r22pre) {
    var rawCS22 = AS.DO.coach_state;
    AS.DO.coach_state = function (a) {
      var r = rawCS22.apply(this, arguments);
      try { if (a && (a.prereq || a.prereq_res || a.learned)) PRE.report(AS._turnSession, a); } catch (e) { console.warn(e); }
      try { if (a && a.cause) { PRE.cause(AS._turnSession, a); S.put(AS._turnSession); } } catch (e) { }
      return r;
    };
    Object.keys(rawCS22).forEach(function (k) { AS.DO.coach_state[k] = rawCS22[k]; });
    AS.DO.coach_state._r22pre = true;
  }

  /* ---------- پرسشِ نوبت از پشته (a38 coachCore آن را بر هر پرسشِ دیگر مقدم می‌کند؛ یک منبع) ---------- */
  function curMsgKey() { var hc = AS._hookCtx, s = (hc && hc.s) || (AS.cur ? AS.cur() : null); return mid(lastUser(s)); }
  function turnQ(sc) {
    var R = store(sc); if (!R) return null; var X = R.X, e = topOf(X);
    if (!e) {
      /* نوبتِ پس از برگشت از آخرین پیش‌نیاز (بانکِ R22 #13): پرسشِ نوبت همان گامِ منتظر است، نه «گامِ بعدیِ تو» یا «کلِ مسئله» — فقط یک نوبت */
      var rt = X.ret, k = curMsgKey(); if (rt && !rt.used && k && k !== rt.key) { var er = byId(X, rt.eid); if (er) return { q: "با «" + clip(er.concept, 50) + "» که حالا داری، گامِ «" + clip(er.step, 70) + "» را چطور برمی‌داری؟", st: "back", e: er }; }
      return null;
    }
    if (e.state !== "teach") return { q: e.q || "«" + clip(e.concept, 60) + "» را می‌شناسی؟ با یک مثالِ کوچک (نه همین مسئله) نشان بده.", st: "diag", e: e };
    return { q: "«" + clip(e.concept, 60) + "» را حالا روی یک مثالِ تازه خودت به کار ببر.", st: e.tries ? "teach-again" : "teach", e: e };
  }
  A.prereqTurnQ = function (pid) { try { return pid ? turnQ({ pid: pid }) : null; } catch (e) { return null; } };
  PRE.turnQ = turnQ;

  /* ---------- پرامپت: قراردادِ گزارش (هر نوبتِ مربی) + پشته و یک پرسشِ نوبت (وقتی باز است) ---------- */
  var ABILITY = /(?:^|[\s،.!])(?:خنگ(?:م|ه|ی|یم)?|کودن(?:م|ه)?|بی[‌\s]?استعداد(?:م)?|نفهم(?:م)?)(?![آ-ی])|(?:ریاضی(?:م|ات(?:م)?)?|جبر(?:م)?|هندسه(?:‌ام|م)?|حساب(?:م)?|فیزیک(?:م)?|هوش(?:م)?|مغز(?:م)?|ذهن(?:م)?|استعداد(?:م)?)[\s‌]*(?:خیلی[\s‌]*)?(?:ضعیفه|ضعیف[\s‌]*(?:است|ـه|ه)|کمه|کم[\s‌]*است|خوب[\s‌]*نیست|نمی[‌\s]?کشه|نمی[‌\s]?کشد)|استعداد(?:ش)?[\s‌]*(?:رو|را)?[\s‌]*ندارم|(?:من|ما)[\s‌]*(?:آدمِ?[\s‌]*)?(?:ریاضی|درس)[\s‌]*نیستم|عقلم[\s‌]*نمی[‌\s]?رسه/;
  PRE.ability = function (t) { return ABILITY.test(String(t || "").replace(/«[^»]*»/g, " ")); };
  var CTX = "- زمینه (نه پرسشِ دوم): ";
  var RULE = CTX + "اگر حرفِ همین پیامش نشان می‌دهد **مفهومِ مشخصی** را که همین گام لازم دارد ندارد (مثلاً «از اتحادها فقط (a+b)² یادمه» وقتی گام تجزیهٔ a²−b² را می‌خواهد؛ «یادم نیست مساحتِ مثلث چطور بود»؛ «فیثاغورس رو بلد نیستم»؛ حدسِ نادرست دربارهٔ خودِ مفهوم)، آن را گرهِ ذهنی یا کم‌توانی نخوان: " +
    "{\"do\":\"coach_state\",\"prereq\":{\"concept\":\"نامِ دقیقِ مفهوم (نه «جبر»/«ریاضی»)\",\"step\":\"گامی از همین حل که آن را لازم دارد\",\"quote\":\"عینِ حرفش\",\"q\":\"یک پرسشِ تشخیصیِ کوتاه\",\"topic\":\"موضوعِ بزرگ‌ترش (اختیاری)\"}} بده؛ تنها پرسشِ همین پاسخ همان پرسشِ تشخیصی است. " +
    "چند پیش‌نیاز ⇒ آرایه به ترتیبِ اولویتِ همین حل (آن‌که راه را زودتر بسته اول)؛ پیش‌نیازی که هنگامِ یاد گرفتنِ پیش‌نیازِ دیگر پیدا شد ⇒ \"parent\":\"شناسهٔ آن\". گیرِ بی پیش‌نیاز ⇒ \"cause\":{\"kind\":\"knot|skill\",\"quote\":\"عینِ حرفش\"} (knot = مفهوم را دارد و راه را نمی‌بیند؛ skill = روش را می‌داند و در اجرا لغزید). " +
    "گفت مفهومی را آموخت (حتی وقتی به دیگری یاد می‌داد) ⇒ \"learned\":{\"concept\":\"…\",\"quote\":\"عینِ حرفش\"}. صفحه نقل را با پیامش می‌سنجد. " +
    "قاعدهٔ «نامِ قضیه را لو نده» فقط برای پیش‌نیازِ تشخیص‌داده‌شده برقرار نیست: آن‌جا نامِ دقیقِ مفهوم و گام را بگو (هرگز «جبر بلد نیستی»)؛ جاهای دیگر همان قاعده می‌ماند.";
  function stLabel(e) { return e.state === "diag" ? "پرسشِ تشخیصی" + (e.q ? " پرسیده شد" : "") : e.state === "wait" ? "در نوبت" : "در حالِ یاد گرفتن" + (e.tries ? "، تلاشِ " + fa(e.tries + 1) : ""); }
  function stackLines(sc, X) {
    var O = openOf(X); if (!O.length) return [];
    var main = O[0], L = ["- پشتهٔ جاهای منتظر (از پایین به بالا): ۰) مسئلهٔ اصلی «" + noq(clip(scTitle(sc), 60)) + "» — منتظر در گامِ «" + noq(clip(main.step, 80)) + "»" + (gotSoFar(sc) ? " (تا این‌جا: " + noq(gotSoFar(sc)) + ")" : "")];
    O.forEach(function (e, i) { L[0] += " ⇐ " + fa(i + 1) + ") «" + noq(clip(e.concept, 60)) + "» [" + e.id + "، " + stLabel(e) + "]"; });
    L.push(CTX + "پیش‌نیازِ تشخیص‌داده‌شده: " + O.map(function (e) { return "«" + noq(clip(e.concept, 60)) + "»"; }).join("، ") + " — نامش را صریح بگو؛ فقط به اندازه‌ای که همین گام لازم دارد (نه فرمول‌ها و برهان‌های دیگرِ همان موضوع).");
    return L;
  }
  function directive(sc, X) {
    var e = topOf(X); if (!e) return "";
    var back = restate(sc, X, e);
    if (e.state !== "teach") return "- **پرسشِ این نوبت همین است:** " + (e.q ? "پرسشِ تشخیصیِ «" + noq(clip(e.concept, 60)) + "» («" + noq(e.q) + "»)." : "پرسشِ تشخیصیِ کوتاهِ «" + noq(clip(e.concept, 60)) + "».") + " اگر همین پیام پاسخش است: {\"do\":\"coach_state\",\"prereq_res\":{\"id\":\"" + e.id + "\",\"diag\":\"missing|had\",\"quote\":\"عینِ پاسخش\"}} (اگر پاسخش نشان داد خودش ساختش، \"mastery\":\"yes\" هم بده). " +
      "missing ⇒ «" + noq(clip(e.concept, 60)) + "» را فقط به اندازهٔ گامِ «" + noq(clip(e.step, 60)) + "» یاد بده (کوتاه، با یک مثالِ کوچکِ غیرِ همین مسئله؛ نامش را صریح بگو) و **یک** پرسشِ تسلط با مثالِ تازه بپرس؛ had ⇒ «" + noq(back) + "». اگر پاسخ نداد، همان پرسشِ تشخیصی را کوتاه‌تر دوباره بپرس.";
    return "- **پرسشِ این نوبت همین است:** «" + noq(clip(e.concept, 60)) + "» را یاد دادی و پرسشِ تسلط پرسیدی. اگر همین پیام پاسخش است: {\"do\":\"coach_state\",\"prereq_res\":{\"id\":\"" + e.id + "\",\"mastery\":\"yes|no\",\"quote\":\"عینِ پاسخش\"}}. " +
      "yes ⇒ دقیقاً به جای منتظر برگرد و آن را بازگو کن: «" + noq(back) + "»؛ no ⇒ همین سطح می‌ماند: از راهِ دیگری (شکل، مثالِ عددی) دوباره یاد بده و **یک** پرسشِ تسلطِ تازه بپرس. پیش از تسلط به مسئلهٔ اصلی، بازنگری یا گامِ تازه نرو.";
  }
  PRE.block = function (s, msg) {
    var m = String(msg || ""); if (/^\s*\[/.test(m)) return "";
    var sc = PRE.scope(s); if (!sc) return "";
    var R = store(sc), X = R ? R.X : { st: [] }, L = ["# پیش‌نیاز (کمبودِ پیش‌نیاز ≠ گرهٔ ذهنی ≠ کم‌هوشی)", RULE];
    var nt = X.note, um = lastUser(s); if (nt && (nt.lines || []).length && nt.key !== mid(um) && !nt.shown) { L.push(CTX + "نتیجهٔ گزارشِ پیش‌نیازِ نوبتِ پیش: " + nt.lines.map(noq).join("؛ ") + "."); }
    var lr = X.st.filter(function (e) { return e && e.state === "learned"; }), O = openOf(X);
    if (lr.length) L.push(CTX + "پیش‌نیازهایی که در همین مسئله آموخت (پیشرفت): " + lr.map(function (e) { return "«" + noq(clip(e.concept, 50)) + "»"; }).join("، ") + ".");
    if (PRE.ability(m)) {
      var gap = O.length ? O[O.length - 1] : lr.length ? lr[lr.length - 1] : null;
      L.push(CTX + "خودش را کم‌توان خواند («" + noq(clip(m, 80)) + "»). دلداریِ کلی نده (نه «تو باهوشی/نگران نباش»)؛ " + (gap ? "با شاهد بگو گیر از کجا بود: نبودِ «" + noq(clip(gap.concept, 60)) + "» در گامِ «" + noq(clip(gap.step, 60)) + "» — کمبودِ یک پیش‌نیازِ مشخص، نه کم‌هوشی" + (gap.state === "learned" ? "، و همان را همین‌جا آموخت" : "") + "." : "گیر را دقیق کن: کدام مفهوم در کدام گام کم است، یا اگر همه را بلد است کجای کار گره خورده — همان یک پرسش؛ هرگز برچسبِ رشته («جبر بلد نیستی»)."));
    }
    if (O.length) { L = L.concat(stackLines(sc, X)); L.push(directive(sc, X)); }
    else { var tq = turnQ(sc); if (tq && tq.st === "back") L.push("- **پرسشِ این نوبت همین است:** (برگشت از پیش‌نیاز) اگر پیامش همین گام را برداشت، همان را دنبال کن؛ وگرنه: «" + noq(tq.q) + "» — «گامِ بعدیِ تو چیست» یا «کلِ مسئله» را این نوبت نپرس."); }
    return L.join("\n");
  };
  AS.promptHooks = AS.promptHooks || [];
  AS.promptHooks.push(function (s, msg) { try { return PRE.block(s, msg); } catch (e) { return ""; } });
  /* یک پرسشِ نوبت در کلِ پرامپت: وقتی پشته باز است، هر «پرسشِ این نوبت» ِ بلوک‌های دیگر زمینه می‌شود (همان الگوی R7 ِ a27) */
  AS.promptFilters = AS.promptFilters || [];
  AS.promptFilters.push(function (outs, s, msg) {
    var mine = (outs || []).filter(function (x) { return /^# پیش‌نیاز \(/.test(String(x || "")) && /\*\*پرسشِ این نوبت همین است:\*\*/.test(String(x || "")); })[0];
    if (!mine) return outs;
    var Z = "- زمینه (نه پرسشِ دوم؛ پرسشِ این نوبت همان «پیش‌نیاز» است): ";
    return outs.map(function (x) {
      if (x === mine) return x;
      return String(x || "").split("\n").map(function (l) {
        l = l.replace(/ · پیشنهادِ این نوبت: «[^»]*»\.?/, "");
        if (/\*\*پرسشِ این نوبت همین است:?\*\*/.test(l)) return Z + l.replace(/^-\s*/, "").replace(/\*\*پرسشِ این نوبت همین است:?\*\*\s*/, "");
        if (/^- در این نوبت فقط \*\*یک\*\* پرسش/.test(l)) return Z + l.replace(/^- در این نوبت فقط \*\*یک\*\* پرسش/, "پرسشِ صفحه برای پس از پیش‌نیاز");
        if (/پرسشِ (?:پیشنهادیِ )?این نوبت|پرسشِ نوبت(?:ِ صفحه)?:/.test(l) && !/^- زمینه/.test(l) && !/^#/.test(l)) return Z + l.replace(/^-\s*/, "");
        return l;
      }).join("\n");
    });
  });
  /* نتیجهٔ گزارش یک بار دیده می‌شود؛ نوبتِ «برگشت» یک بار مصرف می‌شود */
  AS.afterTurnHooks = AS.afterTurnHooks || [];
  AS.afterTurnHooks.push(function (s) {
    try { var sc = PRE.scope(s), R = sc && store(sc), k = mid(lastUser(s)); if (!R) return; var d = false;
      if (R.X.note && R.X.note.key !== k && !R.X.note.shown) { R.X.note.shown = true; d = true; }
      if (R.X.ret && !R.X.ret.used && R.X.ret.key !== k) { R.X.ret.used = true; d = true; }
      if (d) R.put(); } catch (e) { }
  });
  /* وارسیِ پیش از نمایش: تسلطِ «آری» ⇒ پاسخ باید به جای منتظر برگردد و آن را بازگو کند (نه بازنگری یا گامِ تازه) */
  if (typeof AS.replyCheck === "function" && !AS.replyCheck._r22pre) {
    var rawRC22 = AS.replyCheck;
    AS.replyCheck = function (o, opts) {
      var w = rawRC22.apply(this, arguments);
      try {
        var s = AS._turnSession, um = lastUser(s), acts = (o && Array.isArray(o.actions)) ? o.actions : [], sc = s && PRE.scope(s), R = sc && store(sc); if (!um || !R) return w;
        var add = [];
        acts.forEach(function (x) { if (!x || x.do !== "coach_state") return; [].concat(x.prereq_res || []).forEach(function (rs) {
          if (!rs || rs.mastery !== "yes" || !quoteIn(txt(rs.quote), um.text)) return; var e = rs.id ? byId(R.X, rs.id) : topOf(R.X); if (!e || !OPEN[e.state]) return;
          var pl = placeOf(sc, R.X, e), rp = String(o.reply || "");
          if (!quoteIn(pl.step, rp) && !(nk(pl.step).length >= 4 && nk(rp).indexOf(nk(pl.step).slice(0, Math.min(12, nk(pl.step).length))) >= 0)) add.push("«" + clip(e.concept, 40) + "» آموخته شد — دقیقاً به جای منتظر برگرد و آن را بازگو کن: " + restate(sc, R.X, e));
        }); });
        if (!add.length) return w;
        if (w) return w.replace(/\. همان پاسخ را/, "؛ " + add.join("؛ ") + ". همان پاسخ را");
        return "[سامانه — وارسیِ صفحه پیش از نشان دادنِ پاسخ؛ یک بار بازنویسی کن: " + add.join("؛ ") + ". همان پاسخ را با همان actions دوباره بده و فقط متنِ reply را درست کن.]";
      } catch (e) { return w; }
    };
    Object.keys(rawRC22).forEach(function (k) { AS.replyCheck[k] = rawRC22[k]; });
    AS.replyCheck._r22pre = true;
  }
  /* «خنگم / ریاضیم ضعیفه» با گیرِ شناخته ⇒ صفحه خودش با نامِ کمبود پاسخ می‌دهد (نه دلداری) */
  AS.afterTurnHooks.push(function (s) {
    try {
      var um = lastUser(s); if (!um || !PRE.ability(um.text)) return; var sc = PRE.scope(s), R = sc && store(sc); if (!R) return;
      var O = openOf(R.X), lr = R.X.st.filter(function (e) { return e && e.state === "learned"; }), gap = O.length ? O[O.length - 1] : lr.length ? lr[lr.length - 1] : null; if (!gap) return;
      var k = "ab|" + mid(um); if ((s.msgs || []).some(function (m) { return m && m.role === "sys" && m.k22 === k; })) return;
      s.msgs.push({ role: "sys", at: nowIso(), k22: k, text: "🧩 این کم‌هوشی نیست: گیر از نبودنِ «" + clip(gap.concept, 60) + "» در گامِ «" + clip(gap.step, 60) + "» بود — کمبودِ یک پیش‌نیازِ مشخص" + (gap.state === "learned" ? "، که همین‌جا آموختی (پیشرفت)." : "، که همین حالا با هم یادش می‌گیریم.") });
      S.put(s); try { AS.paint(); } catch (e) { }
    } catch (e) { }
  });

  /* =================== P2 — «🧭 نقشهٔ مسیرِ مسئله» =================== */
  var MAIN_K = { stmt: 1, u: 1, udraft: 1, restate: 1, plan: 1, step: 1, out: 1, ans: 1, verdict: 1, state: 1, back: 1, cplan: 1, cplandone: 1, checkin: 1, incub: 1, incubback: 1, woke: 1, claim: 1, newprobs: 1, deadline: 1, act: 1 };
  var DET_K = { aux: "aux", guess: "guess", gold: "guess", pre: "pre", prediag: "pre", preok: "pre" };
  var BACK_K = { retract: 1, copyans: 1, stepold: 1, uold: 1, planold: 1 };
  var SKIP_K = { mind: 1, chatwork: 1, copyask: 1, fcast: 1, practice: 1 };
  var DET_FA = { pre: "پیش‌نیاز", aux: "مسئلهٔ کمکی", guess: "آزمودنِ حدس" };
  var PH_FA = { u: "فهمِ مسئله", p: "طرحِ نقشه", c: "اجرای طرح", b: "بازنگری", done: "تمام شد" };
  var GUESS_DONE = /رد شد|تأیید شد|پیامدی تأیید شد|داوریِ خودت|درست بود|نادرست بود/;
  function routeId(id) { var x = id && S.get(id); if (x && x.type === "achat") return { sess: id }; if (A.liveRec && A.liveRec(id)) return { pid: id }; var r0 = S.get("eprob_" + id); return r0 && r0.p ? { pid: id } : null; }
  function stores(rid) {
    if (rid.pid) { var R = store({ pid: rid.pid }); return R ? [R.X] : []; }
    var se = S.get(rid.sess), P = (se && se.coach && se.coach.pre22) || {}; return Object.keys(P).map(function (k) { return P[k]; });
  }
  function destOf(rid) {
    if (rid.pid) { var pg = S.get("eprog_" + rid.pid), so = (pg && pg.solve) || {}, u = (so.u && so.u[1]) || (so.live && so.live.uDraft) || {}; if (txt(u.u)) return clip(u.u, 80); var r = A.liveRec && A.liveRec(rid.pid); return r ? "خواستهٔ «" + clip(r.p.title, 60) + "»" : "خواستهٔ مسئله"; }
    var se = S.get(rid.sess), C = (se && se.coach) || {}; return C.unkBy && C.pk && C.unkBy[C.pk] ? clip(C.unkBy[C.pk], 80) : "خواستهٔ مسئلهٔ گفت‌وگو";
  }
  /* «چقدر مانده» فقط از طرحِ خودش (گام‌های اعلام‌شده در برابرِ گام‌های انجام‌شده) — بی طرح «نامعلوم»، هرگز درصدِ ساختگی */
  function planLeft(rid) {
    if (!rid.pid) return null; var pg = S.get("eprog_" + rid.pid), L = (pg && pg.solve && pg.solve.live) || {};
    if (!(L.plan && txt(L.plan.t))) return { none: true };
    var pcs = String(L.plan.t).split(/\n|؛|،?\s(?:سپس|بعد|بعدش|آنگاه|آن‌گاه|و\s*بعد|و\s*سپس)\s|[.]\s|،\s*(?=(?:بعد|سپس|آخر|در\s*آخر))/).map(txt).filter(function (x) { return x.length >= 3; });
    var done = (L.steps || []).filter(function (st) { return st && st.out && !st.out.auto && st.out.done === "yes"; }).length;
    return { n: pcs.length, done: done };
  }
  function fragOf(e) { var m = /«([^»]{2,})»\s*⇐/.exec((e.lines || [])[0] || ""); return m ? m[1] : ""; }
  A.ROUTE = A.ROUTE || {};
  A.ROUTE.model = function (id) {
    var rid = routeId(id); if (!rid) return null;
    var D = rid.pid ? (A.dossier ? A.dossier(rid.pid) : null) : (A.dossierSess ? A.dossierSess(rid.sess) : null); if (!D) return null;
    var XS = stores(rid), E = {}; XS.forEach(function (X) { (X.st || []).forEach(function (e) { E[e.id] = e; }); });
    var pts = [], dets = [], backs = [], lastMain = -1, preDet = {}, originEv = null;
    function addPt(p) { p.i = pts.length; pts.push(p); return p; }
    (D.events || []).forEach(function (e) {
      if (SKIP_K[e.k] || /^prc:/.test(String(e.kind || ""))) return;
      if (e.k === "stmt") { originEv = { lines: (e.lines || []).slice(0, 4), hist: (e.hist || []).length }; return; }   // مبدأ خودش گره است؛ نقطهٔ دوم نمی‌گیرد
      var base = { k: e.k, at: e.at || "", title: e.title, lines: (e.lines || []).slice(0, 6), out: e.out || "", from: e.from || "" };
      var isBack = BACK_K[e.k] || (e.withdrawn && MAIN_K[e.k]);
      var dk = DET_K[e.k];
      var mainLike = false;
      if (dk === "guess" && !GUESS_DONE.test(e.out || "")) { base.title = (e.title || "حدس") + " · آزموده نشده"; dk = null; mainLike = true; }   // حدسِ نیازموده حلقهٔ انحراف با نتیجه نیست (بانکِ R22 #55)
      if (dk) {
        var pe = dk === "pre" ? PRE.evId(e.id) : null, ent = pe ? E[pe.eid] : null, key = dk === "pre" ? "pre:" + (pe ? pe.eid : e.id) : dk + ":" + pts.length;
        var d = dk === "pre" ? preDet[key] : null;
        if (!d) {
          var parD = ent && ent.parent ? preDet["pre:" + ent.parent] : null;
          d = { key: key, kind: dk, fa: DET_FA[dk], from: parD && parD.pts.length ? parD.pts[parD.pts.length - 1] : lastMain, fromDet: parD ? dets.indexOf(parD) : -1, pts: [], rejoin: null, depth: ent ? ent.depth || 0 : 0, open: dk === "pre" ? !!(ent && OPEN[ent.state]) : false, concept: ent ? ent.concept : "", state: ent ? ent.state : "", step: ent ? ent.step : "", parent: parD ? dets.indexOf(parD) : -1 };
          dets.push(d); if (dk === "pre") preDet[key] = d;
        }
        var p = addPt(Object.assign(base, { cls: "det", det: dets.indexOf(d), depth: d.depth })); d.pts.push(p.i);
        /* بستنِ پیش‌نیاز (آموخته/بود) ⇒ برگشت دقیقاً به جای منتظر: نقطهٔ «برگشت» روی خطِ اصلی یا ستونِ پیش‌نیازِ پدر (بانکِ R22 #43/#44) */
        if (dk === "pre" && ent && (e.k === "preok" || (e.k === "prediag" && ent.state === "had"))) {
          var par = d.parent >= 0 ? dets[d.parent] : null;
          var rp = addPt({ k: "rejoin", at: e.at || "", title: par ? "برگشت به پیش‌نیازِ «" + clip(par.concept, 50) + "»" : "برگشت به جای منتظر: «" + clip(d.step, 60) + "»", lines: [e.out || ""].filter(Boolean), out: "", cls: par ? "det" : "main", det: par ? dets.indexOf(par) : undefined, depth: par ? par.depth : 0, rejoinOf: dets.indexOf(d) });
          if (par) par.pts.push(rp.i); else lastMain = rp.i;
          d.rejoin = rp.i;
        }
        return;
      }
      if (!MAIN_K[e.k] && !isBack && !mainLike) return;
      var q = addPt(Object.assign(base, { cls: isBack ? "back" : (e.k === "stmt" ? "origin" : "main") }));
      if (isBack) {
        var fr = fragOf(e), t = -1;
        if (fr) for (var j = q.i - 1; j >= 0; j--) { var pj = pts[j]; if (pj.cls !== "back" && nk((pj.lines || []).join(" ") + " " + pj.title).indexOf(nk(fr)) >= 0) { t = j; break; } }
        if (t < 0 && fr && nk(D.statement).indexOf(nk(fr)) >= 0) t = -1.5;   // اصلاحِ صورت ⇒ پرش به مبدأ
        if (t === -1) for (var j2 = q.i - 1; j2 >= 0; j2--) if (pts[j2].cls === "main" || pts[j2].cls === "origin") { t = j2; break; }
        if (t === -1.5) t = -1; else if (t < 0) t = null;
        if (t != null) backs.push({ from: q.i, to: t, why: fr ? "«" + clip(fr, 40) + "» اصلاح شد" : q.title });
        return;
      }
      /* انحرافِ بسته‌ای که هنوز به خط برنگشته (کمکی، حدسِ آزموده) در نخستین نقطهٔ اصلیِ پس از خودش برمی‌گردد */
      dets.forEach(function (d) { if (d.rejoin == null && !d.open && d.kind !== "pre") d.rejoin = q.i; });
      lastMain = q.i;
    });
    var solvedNow = /^حل شد/.test(D.state || "") || D.phase === "done";
    var openD = dets.filter(function (d) { return d.open; }), nowI = solvedNow ? -2 : openD.length ? openD[openD.length - 1].pts.slice(-1)[0] : lastMain;
    var st = D.stages || [], left = st.filter(function (x) { return !x.reached; }).length, cur = st.filter(function (x) { return x.now; })[0];
    var phNow = rid.pid ? D.phase : String(((S.get(rid.sess) || {}).coach || {}).ph || "");
    var pl = planLeft(rid), planTx = !pl ? "" : pl.none ? "نامعلوم — طرح هنوز نیست" : fa(Math.max(0, pl.n - pl.done)) + " گام از " + fa(pl.n) + " گامِ طرحت";
    var remain = solvedNow ? "هیچ — به مقصد رسیدی" : [planTx, st.length ? fa(left) + " مرحله از " + fa(st.length) + (cur ? " (اکنون: " + cur.fa.replace(/^[۰-۹0-9]\)\s*/, "") + ")" : "") : PH_FA[phNow] ? "اکنون: " + PH_FA[phNow] : "", openD.length ? fa(openD.length) + " پیش‌نیازِ باز تا برگشت به خط" : ""].filter(Boolean).join(" · ");
    return { id: id, kind: rid.pid ? "live" : "sess", title: D.title, origin: clip(D.statement, 120), originEv: originEv, dest: solvedNow ? "حل شد ✓" : destOf(rid), reached: solvedNow, now: nowI, nowFa: solvedNow ? "مقصد — حل شد" : openD.length ? "پیش‌نیازِ «" + clip(openD[openD.length - 1].concept, 50) + "»" : (cur ? cur.fa.replace(/^[۰-۹0-9]\)\s*/, "") : PH_FA[phNow] || ""), remain: remain, pts: pts, dets: dets, backs: backs, state: D.state };
  };
  /* شکلِ عمودی: مبدأ بالا، مقصد پایین، خطِ اصلی راست (RTL)، انحراف‌ها نقطه‌چین به چپ و برگشت به خط، پرشِ برگشت قوسِ خط‌چین سمتِ راست */
  var SVGNS = "http://www.w3.org/2000/svg";
  function sv(tag, at, kids) { var n = document.createElementNS(SVGNS, tag); Object.keys(at || {}).forEach(function (k) { if (at[k] != null) n.setAttribute(k, at[k]); }); (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; }
  function hm(at) { var d = new Date(at); if (!at || isNaN(d)) return ""; return fa(String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0")); }
  function when(at) { return at ? A.fdate(String(at).slice(0, 10)) + (hm(at) ? " " + hm(at) : "") : ""; }
  A.ROUTE.svg = function (M, wrap) {
    var W = 360, X0 = 326, DX = 44, ROW = 40, top = 34, n = M.pts.length, H = top + (n + 1) * ROW + 30;
    var y = function (i) { return top + (i + 1) * ROW; }, xOf = function (p) { return p.cls === "det" ? X0 - DX * ((p.depth || 0) + 1) : X0; };
    var g = sv("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", class: "rt-svg", role: "img", "aria-label": "نقشهٔ مسیرِ مسئله: از صورت تا " + M.dest, preserveAspectRatio: "xMidYMin meet" });
    g.appendChild(sv("defs", {}, [sv("marker", { id: "rtArr", viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" }, [sv("path", { d: "M0 0 L10 5 L0 10 z", class: "rt-arrhead" })])]));
    var mains = M.pts.filter(function (p) { return p.cls !== "det"; }), lastY = mains.length ? y(mains[mains.length - 1].i) : top;
    g.appendChild(sv("line", { x1: X0, y1: top, x2: X0, y2: lastY, class: "rt-spine" }));
    g.appendChild(sv("line", { x1: X0, y1: lastY, x2: X0, y2: H - 22, class: "rt-spine rt-rest" + (M.reached ? " rt-done" : "") }));
    M.dets.forEach(function (d) {
      if (!d.pts.length) return; var own = d.pts.filter(function (pi) { return M.pts[pi].det === M.dets.indexOf(d); }); if (!own.length) return;
      var a = d.from, xa = a >= 0 ? xOf(M.pts[a]) : X0, ya = a >= 0 ? y(a) : top, p0 = M.pts[own[0]], x = xOf(p0);
      var dd = "M" + xa + " " + ya + " C" + (xa - 10) + " " + (ya + 10) + " " + (x + 10) + " " + (y(p0.i) - 14) + " " + x + " " + y(p0.i);
      own.slice(1).forEach(function (pi) { dd += " L" + x + " " + y(pi); });
      if (d.rejoin != null) { var rp = M.pts[d.rejoin], yl = y(own[own.length - 1]), yr = y(d.rejoin), xr = xOf(rp); dd += " C" + (x + 10) + " " + (yl + 14) + " " + (xr - 10) + " " + (yr - 10) + " " + xr + " " + yr; }
      g.appendChild(sv("path", { d: dd, class: "rt-det rt-det-" + d.kind + (d.open ? " rt-open" : ""), "data-kind": d.kind, "data-depth": String(d.depth || 0), "data-rejoin": d.rejoin != null ? "1" : "0", "data-concept": d.concept || null }));
    });
    M.backs.forEach(function (b) { var y1 = y(b.from), y2 = y(b.to), bx = Math.min(W - 6, X0 + 18 + Math.min(14, (y1 - y2) / 20));
      g.appendChild(sv("path", { d: "M" + X0 + " " + y1 + " C" + bx + " " + y1 + " " + bx + " " + y2 + " " + (X0 + 4) + " " + y2, class: "rt-backjump", "marker-end": "url(#rtArr)", "data-from": String(b.from), "data-to": String(b.to) }, [sv("title", {}, ["پرشِ برگشت: " + b.why])])); });
    function node(cls, x, yy, title, data, label) {
      var gg = sv("g", { class: "rt-pt " + cls, tabindex: "0", role: "button", "aria-label": title, "data-k": data.k || "", "data-i": data.i != null ? String(data.i) : "" }, [sv("title", {}, [title])]);
      gg.appendChild(sv("circle", { cx: x, cy: yy, r: cls.indexOf("rt-end") >= 0 ? 9 : cls.indexOf("rt-p-det") >= 0 ? 6 : 7 }));
      if (label) gg.appendChild(sv("text", { x: x - 13, y: yy + 4, "text-anchor": "start", direction: "rtl", class: "rt-lab" }, [label]));
      return gg;
    }
    g.appendChild(node("rt-end rt-origin", X0, top, "مبدأ — صورتِ مسئله: " + M.origin, { k: "origin" }, "مبدأ: " + clip(M.origin, 30)));
    M.pts.forEach(function (p) {
      var d = p.cls === "det" ? M.dets[p.det] : null, cls = "rt-p-" + p.cls + (d ? " rt-p-" + d.kind : "") + (p.k === "rejoin" ? " rt-p-rejoin" : "") + (p.i === M.now ? " rt-now" : "");
      var lab = (d && p.k !== "rejoin" ? DET_FA[d.kind] + ": " : p.k === "rejoin" ? "↩ " : "") + clip(String(p.title || "").replace(/^🧩\s*/, "").replace(/^برگشت به /, ""), d ? 26 : 32) + (d && d.kind === "guess" && p.out ? " — " + clip(p.out, 14) : "");
      g.appendChild(node(cls, xOf(p), y(p.i), p.title, p, lab));
      if (p.i === M.now) g.appendChild(sv("circle", { cx: xOf(p), cy: y(p.i), r: 12, class: "rt-nowring" }));
    });
    g.appendChild(node("rt-end rt-dest" + (M.reached ? " rt-reached rt-now" : ""), X0, H - 22, "مقصد — " + M.dest, { k: "dest" }, "مقصد: " + clip(M.dest, 30)));
    if (M.reached) g.appendChild(sv("circle", { cx: X0, cy: H - 22, r: 13, class: "rt-nowring" }));
    /* نگه داشتنِ موس / فوکوس ⇒ آن نقطه چه بود و چه شد */
    var tip = wrap.querySelector(".rt-tip");
    function show(gg) {
      var i = gg.getAttribute("data-i"), k = gg.getAttribute("data-k"), p = i !== "" && i != null ? M.pts[+i] : null; tip.innerHTML = "";
      if (p) { var d = p.cls === "det" ? M.dets[p.det] : null;
        tip.appendChild(h("strong", {}, p.title)); tip.appendChild(h("div", { class: "small muted" }, [when(p.at), d ? "انحراف (" + DET_FA[d.kind] + (d.depth ? "، تو‌در‌تو " + fa(d.depth) : "") + ")" : p.cls === "back" ? "اصلاح / پرشِ برگشت" : p.k === "rejoin" ? "برگشت به خط" : "خطِ اصلی", p.from].filter(Boolean).join(" · ")));
        if (p.lines.length) tip.appendChild(h("ul", { class: "small" }, p.lines.map(function (l) { return h("li", {}, l); })));
        if (p.out) tip.appendChild(h("p", { class: "small" }, "سرانجام: " + p.out)); }
      else { tip.appendChild(h("strong", {}, k === "origin" ? "مبدأ — صورتِ مسئله" : "مقصد: " + M.dest + (M.reached ? "" : " — مانده: " + M.remain)));
        if (k === "origin") tip.appendChild(h("p", { class: "small" }, M.origin + (M.originEv && M.originEv.hist ? " (" + fa(M.originEv.hist) + " بار اصلاح شد)" : ""))); }
      tip.hidden = false; var r0 = wrap.getBoundingClientRect(), r1 = gg.getBoundingClientRect();
      tip.style.top = Math.max(0, r1.bottom - r0.top + 6) + "px"; tip.style.right = "8px"; tip.style.left = "8px";
    }
    Array.prototype.forEach.call(g.querySelectorAll(".rt-pt"), function (gg) {
      gg.addEventListener("mouseenter", function () { show(gg); }); gg.addEventListener("focus", function () { show(gg); }); gg.addEventListener("click", function () { show(gg); });
      gg.addEventListener("mouseleave", function () { tip.hidden = true; }); gg.addEventListener("blur", function () { tip.hidden = true; });
    });
    return g;
  };
  A.ROUTE.box = function (id) {
    var M = A.ROUTE.model(id); if (!M) return null;
    var wrap = h("div", { class: "rt-wrap", dir: "rtl", "data-id": id, "data-n": String(M.pts.length), "data-det": String(M.dets.length), "data-back": String(M.backs.length) });
    wrap.appendChild(h("div", { class: "rt-tip card small", hidden: true, role: "status", "aria-live": "polite" }));
    wrap.insertBefore(A.ROUTE.svg(M, wrap), wrap.firstChild);
    return { M: M, el: wrap };
  };
  A.V.route = function (id) {
    var root = h("div", { class: "page rt-page", dir: "rtl" });
    var B = id ? A.ROUTE.box(id) : null;
    if (!B) {
      root.appendChild(A.head("🧭 نقشهٔ مسیرِ مسئله", "از صورت تا خواسته", "مسئله‌ای را باز کن تا مسیرش را ببینی: گام‌ها روی خط، انحراف‌ها (پیش‌نیاز، مسئلهٔ کمکی، آزمودنِ حدس) نقطه‌چین، اصلاح‌ها پرشِ برگشت."));
      var L = (A.liveAll ? A.liveAll() : []).filter(function (r) { return r && r.p && !r.sample; });
      root.appendChild(L.length ? h("ul", { class: "card" }, L.map(function (r) { return h("li", {}, h("button", { class: "linkish", type: "button", onclick: function () { A.go("route", r.p.id); } }, "🧭 «" + r.p.title + "»")); })) : A.empty("هنوز مسئلهٔ زنده‌ای نیست."));
      return root;
    }
    var M = B.M;
    root.appendChild(A.head("🧭 نقشهٔ مسیرِ مسئله", "«" + M.title + "»", "از مبدأ (صورت) تا مقصد (" + (M.reached ? "حل شد" : "خواسته") + "): کجا هستی، چقدر مانده، و هر نقطه چه بود — موس یا فوکوس روی نقطه.",
      h("div", { class: "row gap wrap" },
        M.kind === "live" ? h("button", { class: "btn ghost sm", type: "button", onclick: function () { A.go("lprob", id); } }, "← صفحهٔ مسئله") : null,
        A.V.dossier ? h("button", { class: "btn ghost sm", type: "button", onclick: function () { A.go("dossier", id); } }, "📜 پروندهٔ کامل") : null)));
    root.appendChild(h("section", { class: "card rt-summary", dir: "rtl" },
      h("p", { class: "small" }, h("strong", {}, "اکنون: "), M.nowFa || "—", " · ", h("strong", {}, "مانده: "), M.remain || "—", " · ", h("strong", {}, "مقصد: "), M.dest),
      h("p", { class: "small muted rt-legend" }, "خطِ پر = خطِ اصلیِ حل · نقطه‌چین = انحراف (پیش‌نیاز، مسئلهٔ کمکی، آزمودنِ حدس) که به خط برمی‌گردد · قوسِ خط‌چین ↶ = اصلاح و پرشِ برگشت · حلقه = جایی که الان هستی.")));
    root.appendChild(h("section", { class: "card rt-card" }, B.el));
    root.appendChild(h("details", { class: "card small rt-listbox" }, h("summary", {}, "همهٔ نقطه‌ها به ترتیب (" + fa(M.pts.length) + ")"),
      h("ol", { class: "rt-list" }, M.pts.map(function (p) { var d = p.cls === "det" ? M.dets[p.det] : null; return h("li", { "data-cls": p.cls }, (d ? "┈ " + DET_FA[d.kind] + " · " : p.cls === "back" ? "↶ " : p.k === "rejoin" ? "↩ " : "— ") + p.title + (p.at ? " · " + when(p.at) : "") + (p.out ? " — " + p.out : "")); }))));
    return root;
  };
  A.VIEW_META = A.VIEW_META || {};
  A.VIEW_META.route = { j: "untie", what: "نقشهٔ مسیرِ مسئله: خطِ زمانِ زنده از صورت (مبدأ) تا خواسته یا «حل شد» (مقصد) — گام‌ها روی خط، جایی که الان هستی و چقدر مانده؛ انحراف‌ها نقطه‌چین (پیش‌نیاز، مسئلهٔ کمکی، آزمودنِ حدس) با برگشت به خط؛ اصلاح‌ها پرشِ برگشت؛ موس روی هر نقطه نشان می‌دهد چه بود و چه شد. از همان دفترِ رویدادهای پرونده. «نقشهٔ مسیرم رو نشون بده» ⇒ همین نما با شناسهٔ مسئلهٔ زندهٔ سشن.",
    why: "تا وسطِ یک مسئلهٔ چندپیش‌نیازی جای اصلی گم نشود و ببینی از کجا آمدی و چقدر مانده.", next: [["dossier", "📜 پروندهٔ کامل"]] };
  A.SUB_VIEWS = A.SUB_VIEWS || {}; if (!A.SUB_VIEWS.route) A.SUB_VIEWS.route = "e_prob";

  /* ---------- نوارِ «جغرافیا» در نماهای دیگر، تا مسئله‌ای باز است ---------- */
  function openRouteId() {
    var s = null; try { s = AS.cur ? AS.cur() : null; } catch (e) { } if (!s) return "";
    try { var b = AS.boundLive ? AS.boundLive(s) : null; if (b && b.pid && !b.done) { var pg = S.get("eprog_" + b.pid), L = pg && pg.solve && pg.solve.live; return L && (L.state === "solved" || L.state === "abandoned") ? "" : b.pid; } } catch (e) { }
    try { if (AS.chatFocus && AS.chatFocus(s) && (s.msgs || []).filter(isUser).length >= 2) return s.id; } catch (e) { }
    return "";
  }
  A.ROUTE.openId = openRouteId;
  A.ROUTE.strip = function (id) {
    var M = A.ROUTE.model(id); if (!M) return null;
    return h("div", { class: "rt-geo small", dir: "rtl", role: "note", "aria-label": "جای تو در مسیرِ مسئله" },
      h("span", {}, "🧭 «" + clip(M.title, 40) + "» — مبدأ: صورت · اکنون: " + (M.nowFa || "—") + " · مانده: " + (M.remain || "—") + " · مقصد: " + clip(M.dest, 40) + " "),
      M.kind === "live" ? h("button", { class: "linkish small rt-geo-back", type: "button", onclick: function () { A.go("lprob", id); } }, "🔭 برگرد به مسئله") : null,
      h("button", { class: "linkish small rt-geo-go", type: "button", onclick: function () { A.go("route", id); } }, "نقشهٔ مسیر"));
  };
  function preCard(sc) {
    var R = store(sc); if (!R || !R.X.st.length) return null; var X = R.X, O = openOf(X), p = PRE.rec(sc);
    return h("section", { class: "card soft lp-precard", dir: "rtl" }, h("h4", {}, "🧩 پیش‌نیازهای همین مسئله"),
      O.length ? h("p", { class: "small" }, "جای منتظر: " + placeOf(sc, X, O[0]).fa + " — اکنون: «" + clip(O[O.length - 1].concept, 50) + "» (" + stLabel(O[O.length - 1]) + ")") : null,
      h("ul", { class: "small" }, X.st.map(function (e) { return h("li", { "data-state": e.state }, (e.depth ? "↳ ".repeat(e.depth) : "") + "«" + e.concept + "» — گامِ «" + clip(e.step, 50) + "» · " + ({ diag: "پرسشِ تشخیصی", wait: "در نوبت", teach: "در حالِ یاد گرفتن", learned: "آموخته شد ✓", had: "بود (کمبود نبود)" }[e.state] || e.state)); })),
      p ? h("button", { class: "linkish small", type: "button", onclick: function () { A.go("prereq", p.id); } }, "🧩 در نقشهٔ پیش‌نیازها") : null);
  }
  PRE.card = preCard;
  if (typeof A.render === "function" && !A.render._r22route) {
    var rawRenderR = A.render;
    A.render = function () {
      var out = rawRenderR.apply(this, arguments);
      try {
        var st = A.state || {}, id = openRouteId(), m = document.getElementById("main");
        if (m && id && st.view !== "route" && !(st.view === "lprob" && st.arg === id) && !m.querySelector(".rt-geo")) { var g0 = A.ROUTE.strip(id); if (g0) { var pg = m.querySelector(".page"); if (pg) pg.insertBefore(g0, pg.firstChild); else m.appendChild(g0); } }
        /* صفحهٔ مسئله: دکمهٔ نقشهٔ مسیر کنارِ «📜» و کارتِ پیش‌نیازهای همین مسئله (🧩 دیگر جزیره نیست) */
        if (m && st.view === "lprob" && st.arg && A.liveRec && A.liveRec(st.arg) && !m.querySelector(".lp-route")) {
          var dz = m.querySelector(".lp-dossier"); if (dz && dz.parentNode) dz.parentNode.insertBefore(h("button", { class: "btn ghost sm lp-route", type: "button", onclick: function () { A.go("route", st.arg); } }, "🧭 نقشهٔ مسیرِ مسئله"), dz.nextSibling);
          var pc = preCard({ pid: st.arg }); if (pc) { var hd = m.querySelector(".page .phead"); if (hd && hd.parentNode) hd.parentNode.insertBefore(pc, hd.nextSibling); }
        }
      } catch (e) { console.warn(e); }
      return out;
    };
    A.render._r22route = true;
  }
  /* دستیار: «🧭» کنارِ «📜» ِ مسئلهٔ سشن */
  if (typeof AS.sessTools === "function" && !AS.sessTools._r22route) {
    var rawST = AS.sessTools;
    AS.sessTools = function (s) {
      var box = rawST.apply(this, arguments), id = "";
      try { var b = AS.boundLive ? AS.boundLive(s) : null; id = b && b.pid ? b.pid : (s && s.lprob && A.liveRec && A.liveRec(s.lprob) ? s.lprob : (AS.chatFocus && AS.chatFocus(s) ? s.id : "")); } catch (e) { }
      if (!id) return box;
      var btn = h("button", { class: "linkish small as-route", type: "button", onclick: function () { A.go("route", id); } }, "🧭 نقشهٔ مسیرِ مسئله");
      if (box) { box.appendChild(btn); return box; }
      return h("div", { class: "as-dos small", dir: "rtl" }, btn);
    };
    Object.keys(rawST).forEach(function (k) { AS.sessTools[k] = rawST[k]; });
    AS.sessTools._r22route = true;
  }
})(APP);
