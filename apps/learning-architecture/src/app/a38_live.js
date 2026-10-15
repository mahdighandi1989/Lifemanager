/* ===== «🔭 مسئلهٔ حل‌نشدهٔ خودم»: همان تونلِ حل، روی مسئله‌ای که پاسخش را هیچ‌کس از پیش نمی‌داند (a38_live.js) =====
   مالک (۲۰۲۶-۱۰-۱۵): «میخوام برسه که بگی دیگه چیزی نیست … همه چیز در ارتباط … جزیره‌ای نباشه» و سودِ واقعی برای زندگی. شکاف (سند:
   docs/decisions/2026-10-15-polya-strict-regrade.md، «کمبودِ ساختاری»): تونلِ گام‌به‌گامِ a36 فقط روی مسئلهٔ حل‌شده کار می‌کرد — شبیه‌ساز گامِ تو
   را با گامِ درستِ ذخیره‌شده می‌سنجد. برای تصمیم، پروژه یا پرسشِ فکریِ واقعی فقط گره‌گشا و قابِ عملی بود.
   این پرونده سامانهٔ تازه نیست؛ حالتی از همان تونل است:
   • همان نوعِ رکورد: eprob با mode: "live" (و live: true)؛ رکوردهای پیشین با «mode» ِ خالی یک بار mode: "solved" می‌گیرند (fill-empty، بی تغییرِ زمان).
   • همان رکوردِ پیشرفت (eprog_<pid>.solve): کارتِ فهم (u)، حدس (g)، بازنگری (b)، درس‌ها، نردبانِ مرورِ ۱/۳/۷/۲۱/۶۰ (rev) و «🌱 کوچک‌ترین گامِ بعد» (will)
     همان‌هایند؛ فقط آنچه این حالت تازه دارد زیرِ solve.live می‌نشیند: فهرستِ داده‌ها، طرح، گام‌های واقعی با پیش‌بینی، ادعاها، حرکت‌ها، پیوندها.
   • همان پرسش‌ها: A.solveAskList (PLAN_QS/نوعِ مسئله)، با «چرا این پرسش» و «پرسشِ بعد»؛ همان دروازهٔ «الان از خودت چه می‌پرسی؟» (A.solveSelfAskGate).
   • داور واقعیت است، نه پاسخِ ذخیره‌شده: هر گامِ واقعی پیش از انجام یک پیش‌بینی با احتمال و موعد دارد ⇒ رکوردِ «🎯 دفترِ پیش‌بینی» (fcast، dim: s_problem)
     ⇒ همان مسیرِ دادهٔ کالیبراسیونِ پیش‌بینیِ رویداد (P.forecastEst ِ a34، بُعدِ «حلِ مسئله» ِ کارنامه). هم‌خوانیِ پیش‌بینی و نتیجه را خودت داوری می‌کنی (data-own).
   • هوش مصنوعی داور نیست و جای تو نمی‌نویسد: هیچ فیلدِ این‌جا را دستیار پر نمی‌کند (data-own)؛ شباهت‌یابیِ «مسئلهٔ مرتبط» با کد است (واژه‌های مشترک، نه مدل). */
(function (A) {
  if (!A.S || !A.V || !A.solveUI) return;
  var h = A.h, fa = A.fa, S = A.S, U = A.solveUI;
  var field = U.field, selF = U.selF, own = U.own, txt = U.txt, clip = U.clip, LADDER = U.LADDER;
  function nowISO() { return new Date().toISOString(); }
  function rec(pid) { var r = pid ? S.get("eprob_" + pid) : null; return r && r.live && r.p && r.status !== "rejected" ? r : null; }
  function lives() { return S.all("eprob", function (r) { return r && r.live && r.p && r.status !== "rejected"; }); }
  A.liveRec = rec; A.liveAll = lives;
  function pgOf(pid) { return U.prog(pid); }
  function solOf(pg) { var s = U.sol(pg); var L = s.live = s.live || {}; ["steps", "claims", "moves", "related", "aux", "knots"].forEach(function (k) { L[k] = L[k] || []; }); seqFix(s); return s; }
  /* شناسهٔ داده‌ها هرگز دوباره به کار نمی‌رود (تیک‌ها و «به‌کارنرفته»ها به شناسه بسته‌اند): شمارندهٔ یک‌سویه روی solve.live؛ رکوردهای پیشین
     یک بار از بیشینهٔ شناسه‌هایی که جایی آمده‌اند (کارتِ فهم، نسخه‌های پیشینِ آن، پیش‌نویس، تیکِ گام‌ها و پاسخ‌ها، «به‌کارنرفته»ها) پر می‌شوند */
  function seqFix(s) {
    var L = s.live, mx = L.dSeq || 0;
    function see(id) { var m = /^d(\d+)$/.exec(String(id || "")); if (m && +m[1] > mx) mx = +m[1]; }
    [s.u && s.u[1]].concat(L.uHist || []).forEach(function (u) { ((u && u.dl) || []).forEach(function (x) { see(x.id); }); });
    L.steps.forEach(function (st) { (st.data || []).forEach(see); });
    if (L.plan) Object.keys(L.plan.unused || {}).forEach(see);
    L.dSeq = mx;
  }
  /* شناسهٔ تازه بی مصرفِ شمارنده: بیشینهٔ «ثبت‌شده» (dSeq) و آنچه در همین پیش‌نویس هست، به‌علاوهٔ یک؛ شمارنده فقط هنگامِ ثبتِ کارت جلو می‌رود
     (باز کردنِ کارت بی تایپ هیچ شناسه‌ای مصرف نمی‌کند — بازبینیِ دورِ ۶) */
  function idNum(id) { var m = /^d(\d+)$/.exec(String(id || "")); return m ? +m[1] : 0; }
  function nid(s, list) { var mx = s.live.dSeq || 0; (list || []).forEach(function (x) { mx = Math.max(mx, idNum(x.id)); }); return "d" + (mx + 1); }
  function live(s) { return s.live; }
  function T0(t) { return (A.SOLVE_TYPES || {})[t] || A.SOLVE_TYPES.find; }
  function typeOf(r, s) { var t = (s && s.type) || (r && r.p && r.p.kind); return A.SOLVE_TYPES && A.SOLVE_TYPES[t] ? t : "find"; }

  /* ---------- fill-empty: «mode» برای رکوردهای پیشینِ مسئله (یک بار، بی تغییرِ زمانِ رکورد) ---------- */
  var MIGRATED = false;
  A.liveMigrate = function () {
    if (MIGRATED) return 0; MIGRATED = true; var n = 0;
    S.all("eprob", function (r) { return r && !r.mode; }).forEach(function (r) { r.mode = r.live ? "live" : "solved"; S.put(r, { keepTime: true }); n++; });
    return n;
  };

  /* ---------- واژه‌ها (کد، نه مدل): «از این داده استفاده کردی؟» و «مسئلهٔ مرتبط» ---------- */
  var STOP = " و در به از که را رو با این آن اون برای یا تا هم اگر من تو او ما شما یک یه است هست بود شد شود می نمی ها های چه چرا کجا کی چطور چگونه باید نباید شاید خیلی کمی هر همه هیچ ولی اما پس بعد قبل حالا الان دارم داری دارد کنم کنی کند کرد کردم کنیم بکنم بشه بشود شده خواهد خواهم نه بله اینکه آیا را چون وقتی خودم خودت چیزی ای ام ";
  function norm(t) { return String(t == null ? "" : t).replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[ً-ْٔ]/g, "").replace(/ۀ/g, "ه").replace(/‌/g, " ")
    .replace(/[۰-۹]/g, function (c) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(c); }).toLowerCase(); }
  function stem(w) { return w.length > 4 ? w.replace(/(?:هایی|های|ها|ترین|تر|یم|ید|ند|ام|ات|اش|مان|تان|شان|ی)$/, "") : w; }
  function toks(t) { var o = []; norm(t).split(/[^0-9a-zء-يپچژکگی]+/).forEach(function (w) { if (!w || (w.length < 2 && !/\d/.test(w)) || STOP.indexOf(" " + w + " ") >= 0) return; w = stem(w); if (o.indexOf(w) < 0) o.push(w); }); return o; }
  function hit(w, tt) { return tt.some(function (x) { return x === w || (w.length >= 4 && x.length >= 4 && (x.indexOf(w) === 0 || w.indexOf(x) === 0)); }); }
  /* دادهٔ d در متنِ t آمده؟ دست‌کم نیمی از واژه‌های معنادارِ داده */
  /* دادهٔ d در متنِ t «به کار رفته»؟ در یک بند (جمله/سطر/پاره‌ای میانِ ، ؛ .) دست‌کم نیمی از واژه‌های معنادارِ داده آمده و همان بند آن را
     نفی نکرده («مهم نیست»، «اصلاً»، «نه»، «ربطی ندارد»، «لازم نیست»، «به کار نمی‌آید») — نام بردنِ داده برای کنار گذاشتنش، به کار بردنش نیست */
  var NEG = /(?:^|\s)(?:نه|اصلا|هیچ|بی‌ربط|بی ربط)(?:\s|$)|مهم\s*نیست|ربطی\s*ندار|لازم\s*نیست|اهمیتی\s*ندار|به\s*کار\s*نمی|کاری\s*ندار|نادیده/;
  function mentions(t, d) {
    var dt = toks(d); if (!dt.length) return false;
    return String(t == null ? "" : t).split(/[\n.،؛!?؟:]+|\s(?:ولی|اما)\s/).some(function (cl) {
      var tt = toks(cl); if (!tt.length) return false;
      return dt.filter(function (w) { return hit(w, tt); }).length >= Math.ceil(dt.length / 2) && !NEG.test(norm(cl).replace(/\s+/g, " "));
    });
  }
  A.liveMentions = mentions; A.liveToks = toks;

  /* ---------- داده‌ها: کدام به کار رفت؟ (تیکِ خودت ∪ آمدنِ واژه‌هایش در طرح و گام‌ها) ---------- */
  function uOf(s) { return s.u && s.u[1] && s.u[1].done ? s.u[1] : null; }
  function dataOf(s) { var u = uOf(s); return (u && u.dl) || []; }
  function usedMap(s, pg) {
    var dl = dataOf(s), L = live(s), used = {}, texts = [];
    ((pg.tut || {}).plan || []).forEach(function (e) { if (e && e.src === "live" && !e.skip) { (e.data || []).forEach(function (i) { used[i] = "tick"; }); texts.push(e.text); } });
    L.steps.forEach(function (st) { (st.data || []).forEach(function (i) { used[i] = "tick"; }); texts.push(st.text, st.prem); });
    if (L.back) texts.push(L.back.solved, L.back.before1, L.back.before2, L.back.have);
    L.aux.forEach(function (a) { texts.push(a.t, a.bridge); });
    L.moves.forEach(function (m) { texts.push(m.why); });
    if (L.plan) { texts.push(L.plan.t); Object.keys(L.plan.unused || {}).forEach(function (k) { if (L.plan.unused[k].ans === "use") used[k] = used[k] || "plan"; }); }
    var all = texts.filter(Boolean).join("\n");
    dl.forEach(function (d) { if (!used[d.id] && mentions(all, d.t)) used[d.id] = "text"; });
    return used;
  }
  A.liveUsed = function (pid) { var pg = pgOf(pid), s = solOf(pg); return usedMap(s, pg); };
  function unusedOf(s, pg) { var u = usedMap(s, pg); return dataOf(s).filter(function (d) { return !u[d.id]; }); }
  function dataTicks(s, idp, sel) {
    var dl = dataOf(s); if (!dl.length) return null;
    return h("fieldset", { class: "lp-ticks small" }, h("legend", {}, "از کدام داده‌ها استفاده می‌کند؟ (کد واژه‌هایش را هم در متنت می‌جوید)"),
      h("div", { class: "row gap wrap" }, dl.map(function (d) { var id = idp + d.id; return h("label", { class: "row gap", for: id }, h("input", { type: "checkbox", id: id, checked: sel.indexOf(d.id) >= 0 ? true : null, onchange: function (e) { var i = sel.indexOf(d.id); if (e.target.checked && i < 0) sel.push(d.id); if (!e.target.checked && i >= 0) sel.splice(i, 1); } }), clip(d.t, 60)); })));
  }
  var UNUSED_ANS = [["use", "حالا به کارش می‌برم"], ["skip", "لازم نیست — دلیلش را می‌نویسم"], ["unknown", "نمی‌دانم کجا به کار می‌آید"]];
  /* پولیا: «همهٔ داده‌ها را به کار بردی؟ هر داده را؟» — برای هر دادهٔ به‌کارنرفته با نامش؛ «نمی‌دانم» خودش سرنخ است (عنصرِ غایب) */
  function unusedAsk(list, store, idp) {
    if (!list.length) return null;
    var box = h("div", own({ class: "col gap lp-unused" }), h("h4", {}, "داده‌هایی که هنوز به کار نرفته‌اند"),
      h("p", { class: "small" }, "اگر داده‌ای را به کار نبرده‌ای، یا لازم نیست (بگو چرا)، یا همان‌جا سرنخی پنهان است: داده‌ای که بی‌کار مانده اغلب همان عنصرِ گمشدهٔ راه است."));
    list.forEach(function (d) {
      var a = store[d.id] = store[d.id] || { ans: "", why: "" };
      box.appendChild(h("div", { class: "card soft col gap lp-un", "data-d": d.id },
        selF(idp + "a_" + d.id, "از «" + clip(d.t, 80) + "» استفاده کردی؟ اگر نه، چرا؟", UNUSED_ANS, a.ans, function (v) { a.ans = v; }),
        field(idp + "w_" + d.id, "چرا؟ / کجا به کارش می‌بری؟ (یک جمله)", a.why, function (v) { a.why = v; }, 0)));
    });
    return box;
  }
  /* «لازم نیست» دلیل می‌خواهد: دست‌کم سه واژهٔ معنادار، و یک دلیلِ یکسان برای چند داده پذیرفته نیست (بازبینیِ دورِ ۶) */
  function unusedMiss(list, store) {
    var seen = {}, dup = [];
    list.forEach(function (d) { var a = store[d.id]; if (a && a.ans === "skip" && txt(a.why)) { var k = toks(a.why).join(" "); if (seen[k]) dup.push(d); seen[k] = 1; } });
    return list.filter(function (d) { var a = store[d.id]; return !a || !a.ans || (a.ans === "skip" ? toks(a.why).length < 3 || dup.indexOf(d) >= 0 : a.ans !== "use" && txt(a.why).length < 3); }).map(function (d) { return "«" + clip(d.t, 40) + "»"; }); }

  /* ---------- مرحله ---------- */
  var PHN = { u: "فهمِ مسئله", p: "طرح", c: "اجرا روی واقعیت", b: "بازنگری", done: "بسته" };
  function phaseOf(s) {
    var L = live(s);
    if (!uOf(s) || L.reU) return "u";
    if (L.state === "solved" || L.state === "abandoned") return s.b && s.b[1] && s.b[1].done ? "done" : "b";
    if (!(L.plan && L.plan.at)) return "p";
    return "c";
  }
  A.livePhase = function (pid) { var pg = pgOf(pid); return phaseOf(solOf(pg)); };
  function openStep(s) { var L = live(s); return L.steps.filter(function (x) { return !x.closed; }).pop() || null; }
  function lastClosed(s) { var L = live(s); var c = L.steps.filter(function (x) { return x.closed; }); return c[c.length - 1] || null; }

  /* ---------- ساختن (فرمِ برچسب‌دار — دستیار هم از همین فرم یا live_new می‌سازد) ---------- */
  function create(title, statement, kind, extra) {
    var pid = "pb_l_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    var k = A.SOLVE_TYPES && A.SOLVE_TYPES[kind] ? kind : "find";
    var r = { id: "eprob_" + pid, type: "eprob", status: "live", mode: "live", live: true, by: (extra && extra.by) || "user",
      p: { id: pid, title: clip(title, 120), statement: String(statement || "").trim(), kind: k, field: "مسئلهٔ زندهٔ من", live: true, stages: [], dead: [], drills: [], lessons: [] } };
    if (extra && extra.origin) r.origin = extra.origin;
    if (extra && extra.dormant) r.dormant = extra.dormant;
    if (extra && extra.sess) r.sess = extra.sess;
    S.put(r);
    var pg = pgOf(pid), s = solOf(pg); s.type = k; S.put(pg);
    return r;
  }
  A.liveCreate = create;
  var NEW = { title: "", statement: "", kind: "find" };
  A.liveNewPanel = function () {
    var box = h("section", { class: "card col gap lp-new", dir: "rtl" }, h("h2", {}, "🔭 مسئلهٔ حل‌نشدهٔ خودم"),
      h("p", { class: "small" }, "تصمیمی که باید بگیری، پروژه‌ای که گیر کرده، پرسشی فکری که جوابش را نمی‌دانی — پاسخ لازم نیست. همان تونلِ حل (فهم ⇐ طرح ⇐ اجرا ⇐ بازنگری) این بار روی واقعیت: هر گامِ واقعی پیش از انجام یک پیش‌بینی دارد و روزِ موعدش در «امروز» برمی‌گردد تا ببینی چه شد. داور نه صفحه است نه هوش مصنوعی: واقعیت و داوریِ خودت."));
    box.appendChild(field("lpNewT", "عنوانِ کوتاهِ مسئله", NEW.title, function (v) { NEW.title = v; }, 0, "مثلاً «پیشنهادِ کارِ دوم را بپذیرم یا نه؟»"));
    box.appendChild(field("lpNewS", "مسئله را همان‌طور که هست بنویس: چه می‌خواهی و چه چیزی آن را سخت می‌کند (پاسخ لازم نیست)", NEW.statement, function (v) { NEW.statement = v; }, 4));
    box.appendChild(U.typeSel("lpNewType", NEW.kind, function (v) { NEW.kind = v; }));
    var out = h("div", { "aria-live": "polite", class: "small" });
    box.appendChild(h("button", { class: "btn lp-create", type: "button", onclick: function () {
      if (txt(NEW.title).length < 3 || txt(NEW.statement).length < 10) { out.textContent = "عنوان و صورتِ مسئله را بنویس (صورت دست‌کم یک جملهٔ کامل)."; A.toast(out.textContent, "bad"); return; }
      var r = create(NEW.title, NEW.statement, NEW.kind); NEW = { title: "", statement: "", kind: "find" };
      A.toast("مسئله ساخته شد؛ اول بفهمیمش."); A.go("lprob", r.p.id, "u");
    } }, "ساختنِ مسئلهٔ حل‌نشده"));
    box.appendChild(out);
    var wrap = h("div", { class: "col gap" }, box);
    var ls = A.liveListSection(true); if (ls) wrap.appendChild(ls);
    return wrap;
  };
  A.liveInjectNote = function () {
    return h("p", { class: "card soft small lp-injnote", dir: "rtl" }, "پاسخش را هنوز نمی‌دانی (تصمیم، پروژه، پرسشِ باز)؟ این‌جا برای مسئلهٔ حل‌شده است. ",
      h("button", { class: "btn sm ghost", type: "button", onclick: function () { A.go("e_prob", null, "live"); } }, "🔭 مسئلهٔ حل‌نشدهٔ خودم"));
  };
  function nextInfo(r) {
    var pg = S.get("eprog_" + r.p.id), s = pg && pg.solve; if (!s) return "تازه";
    solOf(pg); var ph = phaseOf(s), o = openStep(s), t = A.today();
    return PHN[ph] + (o ? " · گامِ جاری: «" + clip(o.text, 40) + "» — وارسی " + (o.due <= t ? "امروز" : A.fdate(o.due)) : "");
  }
  A.liveListSection = function (always) {
    A.liveMigrate();
    var L = lives(); if (!L.length && !always) return h("p", { class: "small muted lp-listcta", dir: "rtl" }, "مسئلهٔ واقعیِ حل‌نشده‌ای داری؟ ", h("button", { class: "linkish", type: "button", onclick: function () { A.go("e_prob", null, "live"); } }, "🔭 مسئلهٔ حل‌نشدهٔ خودم"));
    if (!L.length) return null;
    var t = A.today();
    return h("section", { class: "card lp-list", dir: "rtl" }, h("h2", {}, "🔭 مسئله‌های حل‌نشدهٔ خودم (" + fa(L.length) + ")"),
      h("div", { class: "col gap" }, L.map(function (r) {
        var dorm = r.dormant && r.dormant > t && !r.woke;
        return h("div", { class: "card soft lp-item", "data-pid": r.p.id }, h("div", { class: "row between wrap" },
          h("button", { class: "linkish", type: "button", onclick: function () { A.go("lprob", r.p.id); } }, h("strong", {}, r.p.title)),
          h("span", { class: "row gap wrap" }, r.origin && r.origin.type === "lprob" ? h("span", { class: "chip" }, "ساختهٔ خودت در بازنگری") : null, dorm ? h("span", { class: "chip lp-dorm" }, "برمی‌گردد " + A.fdate(r.dormant)) : h("span", { class: "chip" }, nextInfo(r)))),
          h("p", { class: "small" }, clip(r.p.statement, 200)));
      })));
  };

  /* ---------- فهم (کارتِ فهمِ همان تونل، با فهرستِ داده‌ها) ---------- */
  function wholeWhy(d, r) {
    var o = [], one = txt(d.one), st = txt(r.p.statement);
    if (one.length < 3) o.push("«کلِ مسئله در یک جمله» را بنویس");
    else {
      if (A.kNearCopy && A.kNearCopy(one, st)) o.push("جملهٔ کل تقریباً رونوشتِ صورت است — آن را به زبانِ خودت و بی‌جزئیات بگو");
      if (one.length >= st.length) o.push("جملهٔ کل باید کوتاه‌تر از صورت باشد (بی‌جزئیات)");
      if (/[.!?؟]\s*\S/.test(one.replace(/[.!?؟\s]+$/, ""))) o.push("فقط یک جمله");
    }
    if (txt(d.why).length < 3) o.push("«چرا می‌خواهی حلش کنی» را بنویس");
    return o;
  }
  var UD = {};
  function uCard(r, pg, s) {
    var pid = r.p.id, prev = uOf(s) || {}, fresh = !s.g || !s.g[1];
    var L0 = live(s);
    /* پیش‌نویسِ کارتِ فهم با بارگذاریِ دوباره گم نمی‌شود (solve.live.uDraft؛ پس از ثبت پاک می‌شود) */
    var d = UD[pid] = UD[pid] || (L0.uDraft ? JSON.parse(JSON.stringify(L0.uDraft)) : { type: typeOf(r, s), one: prev.one || "", why: prev.why || "", u: prev.u || "", dl: (prev.dl || []).map(function (x) { return { id: x.id, t: x.t }; }), c: prev.c || "", rel: prev.rel || "", suff: prev.suff || "", suffWhy: prev.suffWhy || "", fig: prev.fig || "", dead: prev.deadTxt || "", guess: "", conf: "", test: "", testRes: "", ifRef: "" });
    if (!d.dl.length) { d.dl.push({ id: nid(s, d.dl), t: "" }); d.dl.push({ id: nid(s, d.dl), t: "" }); }
    if (d.wholeOk == null) d.wholeOk = !!prev.one;
    var dTimer = null;
    function saveDraft() { if (dTimer) clearTimeout(dTimer); dTimer = setTimeout(function () { dTimer = null; if (UD[pid] !== d) return; L0.uDraft = JSON.parse(JSON.stringify(d)); S.put(pg); }, 350); }
    var T = T0(d.type);
    var box = h("section", own({ class: "card lp-u" }), h("div", { class: "eyebrow" }, "فهمِ مسئله" + (live(s).reU ? " — دوباره" : "")),
      h("h3", {}, "اول کل، بعد جزءها"),
      h("p", { class: "small" }, "پیش از هر کاری مسئله را بفهم و بخواهی‌اش. اول کلِ مسئله را بی‌جزئیات در یک جمله ببین؛ بعد مجهول، هر داده جدا، و شرط. هر داده را جدا بنویس — بعداً صفحه دربارهٔ هر داده‌ای که به کار نبردی، با نامش، می‌پرسد."),
      h("div", { class: "card soft small lp-stmt" }, h("strong", {}, "صورتِ خودت: "), r.p.statement));
    box.appendChild(U.typeSel("lpType", d.type, function (v) { d.type = v; A.render(); }));
    box.appendChild(field("lpOne", "۱) کلِ مسئله در یک جملهٔ کامل — بی‌جزئیات", d.one, function (v) { d.one = v; }, 0, "«می‌خواهم … ، با داشتنِ … ، به شرطِ این‌که …»"));
    box.appendChild(field("lpWhy", "۲) چرا می‌خواهی حلش کنی؟ چه چیزی در آن برایت مهم است یا کنجکاوت می‌کند؟", d.why, function (v) { d.why = v; }, 0));
    /* «اول کل»: جزءها فقط پس از ثبتِ جملهٔ کل باز می‌شوند — جمله‌ای که رونوشتِ صورت نیست، یک جمله است و کوتاه‌تر از صورت */
    if (!d.wholeOk) {
      var wout = h("div", { class: "small", "aria-live": "polite" });
      box.appendChild(h("button", { class: "btn lp-onesave", type: "button", onclick: function () {
        var w = wholeWhy(d, r); wout.innerHTML = "";
        if (w.length) { wout.appendChild(h("p", { class: "bad lp-onemiss" }, "هنوز نه: " + w.join("؛ ") + ".")); return; }
        d.wholeOk = true; L0.uDraft = JSON.parse(JSON.stringify(d)); S.put(pg); A.render();
      } }, "ثبتِ کل — حالا جزءها"));
      box.appendChild(wout);
      box.addEventListener("input", saveDraft); box.addEventListener("change", saveDraft);
      return box;
    }
    box.appendChild(field("lpUnk", "۳) " + T.u, d.u, function (v) { d.u = v; }, 2));
    var dbox = h("fieldset", { class: "col gap lp-dl" }, h("legend", {}, "۴) " + (d.type === "find" ? "داده‌ها" : "بخش‌های فرض") + " — هر کدام جدا (چیزی که می‌دانی یا در دست داری: عدد، منبع، محدودیت، آدم، زمان)"));
    d.dl.forEach(function (x, i) { dbox.appendChild(field("lpD_" + x.id, (d.type === "find" ? "دادهٔ " : "فرضِ ") + fa(i + 1), x.t, function (v) { x.t = v; }, 0)); });
    dbox.appendChild(h("button", { class: "btn ghost sm lp-dadd", type: "button", onclick: function () { d.dl.push({ id: nid(s, d.dl), t: "" }); L0.uDraft = JSON.parse(JSON.stringify(d)); S.put(pg); A.render(); } }, "+ دادهٔ دیگر"));
    box.appendChild(dbox);
    box.appendChild(field("lpCond", "۵) " + T.c, d.c, function (v) { d.c = v; }, 3, "هر بخش در یک سطر"));
    box.appendChild(field("lpRel", "۶) پیوندِ جزءها: کدام داده به کدام بخشِ شرط یا به مجهول ربط دارد؟ (اختیاری)", d.rel, function (v) { d.rel = v; }, 0));
    box.appendChild(selF("lpSuff", T.suff, ["کافی است", "ناکافی است — چیزی کم است", "زائد دارد — بخشی لازم نیست", "متناقض است", "هنوز نمی‌دانم"], d.suff, function (v) { d.suff = v; }));
    box.appendChild(field("lpSuffW", "چرا؟ (یک جمله)", d.suffWhy, function (v) { d.suffWhy = v; }, 0));
    box.appendChild(field("lpDead", "مهلتِ خودِ مسئله، اگر هست — تا کی باید حل یا تصمیم شود؟ (اختیاری؛ گام‌ها پس از آن پذیرفته نمی‌شوند)", d.dead, function (v) { d.dead = v; }, 0, "مثلاً «۱۲ آذر» یا «۱۰ روزِ دیگر»"));
    box.appendChild(field("lpFig", "شکل، جدول یا نمودار — حتی برای مسئلهٔ غیرهندسی (ستون‌های جدولت، محورهای نمودارت، نام‌هایی که می‌گذاری)", d.fig, function (v) { d.fig = v; }, 0));
    if (fresh) {
      box.appendChild(h("h4", {}, "پیش از حل: حدس بزن"));
      box.appendChild(h("p", { class: "small" }, "حدسِ صریح، با اطمینان و آزمونی که می‌تواند ردش کند — نه پذیرفتنِ بی‌آزمون، نه کنار گذاشتن. در بازنگری با آنچه واقعاً شد مقایسه می‌شود."));
      box.appendChild(field("lpGuess", "حدست دربارهٔ پاسخ (یا تصمیمِ درست) چیست؟", d.guess, function (v) { d.guess = v; }, 2));
      box.appendChild(selF("lpConf", "چقدر به حدست مطمئنی؟", ["50", "60", "70", "80", "90", "100"].map(function (x) { return [x, fa(x) + "٪"]; }), d.conf, function (v) { d.conf = v; }));
      box.appendChild(field("lpTest", "آزمونِ حدس: چه چیزی (مشاهده، پرسش از کسی، حالتِ خاص) می‌تواند ردش کند؟", d.test, function (v) { d.test = v; }, 2));
      box.appendChild(selF("lpIfRef", "اگر آزمون حدس را رد کند، چه می‌کنی؟", ["حدس را کنار می‌گذارم یا اصلاحش می‌کنم", "آزمون را نادیده می‌گیرم چون حدسم قوی است", "حدس را بی‌تغییر نگه می‌دارم و دیگر نمی‌آزمایم"], d.ifRef, function (v) { d.ifRef = v; }));
      if (A.solveKitUI) { d.kit = d.kit || A.solveBlankKit(); box.appendChild(A.solveKitUI(d.kit, { idp: "lpGK", problem: r.p.statement, parts: ["ana", "rivals"], noDim: true, drills: false, title: "ابزارهای حدس: قیاس و حدس‌های رقیب",
        intro: "حدس را از کجا آوردی؟ موردِ آشنای مشابه (قیاس) و دست‌کم یک حدسِ رقیب با آزمونی که جدایشان می‌کند. کد می‌سنجد که رقیب و آزمون نوشته شده‌اند؛ درستیِ قیاس را خودت می‌آزمایی." })); }
    }
    box.appendChild(U.planList(d.type));
    var out = h("div", { "aria-live": "polite", class: "col gap" });
    box.appendChild(h("button", { class: "btn lp-usave", type: "button", onclick: function (e) {
      var items = d.dl.filter(function (x) { return txt(x.t); });
      var miss = wholeWhy(d, r).concat([[d.u, T.u], [d.c, T.c]].filter(function (x) { return txt(x[0]).length < 3; }).map(function (x) { return "«" + x[1] + "»"; }));
      if (!items.length) miss.push("«دست‌کم یک داده»");
      if (!d.suff) miss.push("«" + T.suff + "»");
      if (fresh && !txt(d.guess)) miss.push("«حدس»");
      if (fresh && txt(d.guess) && !txt(d.test)) miss.push("«آزمونِ حدس»");
      if (fresh && txt(d.guess) && !d.conf) miss.push("«اطمینان به حدس»");
      var DW = !txt(d.dead) ? null : prev.deadTxt === txt(d.dead) && prev.deadline ? { date: prev.deadline } : A.willWhen(d.dead);
      if (txt(d.dead) && !(DW && DW.date && !DW.past)) miss.push("«مهلت» (روزِ مشخص و نگذشته بنویس، یا خالی بگذار)");
      if (miss.length) { A.toast("اول این‌ها را بنویس: " + miss.join("، "), "bad"); out.innerHTML = ""; out.appendChild(h("p", { class: "bad small lp-umiss" }, "هنوز نه: " + miss.join("، "))); return; }
      e.currentTarget.disabled = true; out.innerHTML = "";
      out.appendChild(h("div", { class: "card soft small" }, h("p", {}, h("strong", {}, "صورتِ خودت: "), r.p.statement),
        h("p", {}, "۲ = مجهول، همهٔ داده‌ها و همهٔ بخش‌های شرط آمده و با صورت می‌خواند؛ ۱ = چیزی جا افتاد یا مبهم بود؛ ۰ = صورت چیزِ دیگری می‌گوید.")));
      out.appendChild(U.gradeBtns(function (v) {
        var L = live(s);
        if (uOf(s)) { L.uHist = L.uHist || []; L.uHist.push(JSON.parse(JSON.stringify(s.u[1]))); }
        s.type = d.type; r.p.kind = d.type;
        s.u[1] = { type: d.type, one: txt(d.one), why: txt(d.why), u: txt(d.u), d: items.map(function (x) { return txt(x.t); }).join(" · "), dl: items.map(function (x) { return { id: x.id, t: txt(x.t) }; }), c: txt(d.c), rel: txt(d.rel), suff: d.suff, suffWhy: txt(d.suffWhy), fig: txt(d.fig), deadTxt: txt(d.dead), deadline: DW && DW.date || null, self: v, at: nowISO(), done: true, from: "live" };
        U.seed(s, "u");
        if (fresh) {
          s.g[1] = { guess: txt(d.guess), conf: +d.conf || null, test: txt(d.test), testRes: "", ifRef: d.ifRef, before: true, seen: false, at: nowISO(), from: "live" };
          if (d.kit && A.solveKitEmpty && !A.solveKitEmpty(d.kit)) s.g[1].kit = U.kitCopy(d.kit);
          U.seed(s, "g");
        }
        items.forEach(function (x) { L.dSeq = Math.max(L.dSeq || 0, idNum(x.id)); });
        L.reU = false; delete L.uDraft; if (r.dormant && !r.woke) r.woke = nowISO(); S.put(r); S.put(pg); delete UD[pid]; if (dTimer) clearTimeout(dTimer);
        A.toast("فهمت ثبت شد؛ از فردا بی‌نگاه مرور می‌شود."); A.go("lprob", pid, "plan");
      }, "فهمت با صورتی که نوشتی چقدر می‌خواند؟"));
    } }, "ثبتِ فهم"));
    box.appendChild(out);
    box.addEventListener("input", saveDraft); box.addEventListener("change", saveDraft);
    return box;
  }
  function uSum(s) {
    var u = uOf(s); if (!u) return null; var T = T0(u.type);
    return h("div", { class: "small lp-usum" }, h("p", {}, h("strong", {}, "کل: "), u.one), h("p", {}, h("strong", {}, T.u + " "), u.u),
      h("ul", {}, (u.dl || []).map(function (x) { return h("li", {}, x.t); })), h("p", {}, h("strong", {}, "شرط: "), u.c), u.why ? h("p", { class: "muted" }, "چرا برایت مهم است: " + u.why) : null);
  }

  /* ---------- طرح: پرسشِ همین لحظه، یکی‌یکی، از کلی به خاص ---------- */
  var AD = {};
  function askCard(r, pg, s) {
    var pid = r.p.id, t = typeOf(r, s), Q = A.solveAskList ? A.solveAskList("p", 1, t) : [];
    if (!Q.length) return null;
    var tut = pg.tut = pg.tut || {}; tut.qi = tut.qi || {};
    /* هر مسئلهٔ تازه از پرسشی آغاز می‌کند که کمتر از همه ورزیده شده (پایین‌ترین پلهٔ نردبان؛ در برابری، کلی‌ترین) و از آن‌جا به ترتیبِ کلی ⇐ خاص
       جلو می‌رود — نه همیشه از پرسشِ ۱؛ پرسش‌هایی که از آنِ خودت شده‌اند در چرخه با «اول خودت بپرس» می‌آیند */
    if (tut.qi.lplan == null) { var best = 0, br = Infinity; Q.forEach(function (q, i) { var rg = A.qRung ? A.qRung(q) : 0; if (rg < br) { br = rg; best = i; } }); tut.qi.lplan = best; S.put(pg); }
    var qi = (tut.qi.lplan || 0) % Q.length, q = Q[qi], P = tut.plan = tut.plan || [];
    var cur = P.filter(function (e) { return e && e.src === "live" && e.qi === qi && e.q === q && !e.skip; }).pop();
    var box = h("section", own({ class: "card soft lp-ask", "data-qi": qi }), h("div", { class: "eyebrow" }, "❔ پرسشِ همین لحظه (طرح‌ریزی) · پرسشِ " + fa(qi + 1) + " از " + fa(Q.length) + " — از کلی به خاص"));
    function next() { tut.qi.lplan = qi + 1; S.put(pg); delete AD[pid]; A.render(); }
    var u = uOf(s); if (u && u.u) box.appendChild(h("p", { class: "small sv-goal" }, "🎯 هدف را گم نکن — " + (t === "find" ? "مجهول" : "حکم") + ": «" + clip(u.u, 140) + "»"));
    if (cur && cur.self == null) {
      box.appendChild(h("p", {}, h("strong", {}, "پرسش: "), q));
      box.appendChild(h("p", { class: "small" }, "پاسخت: «" + cur.text + "»"));
      box.appendChild(U.gradeBtns(function (v) { cur.self = v; cur.selfAt = nowISO(); cur.selfD = A.today(); S.put(pg); A.render(); }, "این پرسش راهی باز کرد؟"));
      return box;
    }
    if (cur) {
      box.appendChild(h("p", {}, h("strong", {}, "پرسش: "), q));
      box.appendChild(h("p", { class: "small" }, "پاسخت: «" + cur.text + "» · کمک کرد: " + ["نه", "تاحدی", "بله"][cur.self]));
      box.appendChild(h("button", { class: "btn sm lp-asknext", type: "button", onclick: next }, "پرسشِ بعد (کمی خاص‌تر)"));
      return box;
    }
    var gate = A.solveSelfAskGate ? A.solveSelfAskGate(pg, q, { lv: 1, sid: "live:" + qi, ph: "p", src: "live", onSkip: function () { P.push({ at: nowISO(), d: A.today(), q: q, qi: qi, skip: true, lv: 1, sid: "live:" + qi, ph: "p", src: "live" }); next(); } }) : null;
    if (gate && !gate.done) { box.appendChild(h("h4", {}, "اول خودت بپرس")); box.appendChild(gate.el); return box; }
    if (gate) box.appendChild(gate.el);
    var d = AD[pid] = AD[pid] || { a: "", data: [] };
    box.appendChild(h("p", { class: "lp-q" }, h("strong", {}, "پرسش: "), q));
    var rung = A.qRung ? A.qRung(q) : 0, nUse = A.qUses ? A.qUses(q).length : 0;
    box.appendChild(h("p", { class: "small muted" }, "چرا این پرسش؟ " + (t === "find" ? U.WHY.p : "طرحِ اثبات از پیوندِ فرض و حکم درمی‌آید؛ پرسش‌ها از آشنا به دور و از کل به جزء می‌روند.") + " اگر با وضعِ همین لحظه نمی‌خواند، نپرس — پرسشِ بعد را بگیر." + (nUse ? " این پرسش را " + fa(nUse) + " بار به کار برده‌ای (پلهٔ " + fa(rung) + " از نردبان؛ از پلهٔ " + fa(A.Q_OWN_RUNG) + " اول خودت می‌پرسی)." : "")));
    box.appendChild(field("lpAsk", "پاسخِ کوتاهِ تو (به قلمِ خودت)", d.a, function (v) { d.a = v; }, 2));
    var tk = dataTicks(s, "lpAD_", d.data); if (tk) box.appendChild(tk);
    box.appendChild(h("div", { class: "row gap wrap" },
      h("button", { class: "btn sm lp-askgo", type: "button", onclick: function () {
        if (!txt(d.a)) { A.toast("پاسخِ کوتاهت را بنویس — یا «پرسشِ بعد» اگر این پرسش حالا نمی‌خواند.", "bad"); return; }
        P.push({ at: nowISO(), d: A.today(), q: q, qi: qi, text: txt(d.a), data: d.data.slice(), lv: 1, sid: "live:" + qi, ph: "p", src: "live" }); S.put(pg); delete AD[pid]; A.render();
      } }, "ثبتِ پاسخ"),
      h("button", { class: "btn ghost sm lp-askskip", type: "button", onclick: function () { P.push({ at: nowISO(), d: A.today(), q: q, qi: qi, skip: true, lv: 1, sid: "live:" + qi, ph: "p", src: "live" }); next(); } }, "این پرسش حالا نمی‌خواند — پرسشِ بعد")));
    var done = P.filter(function (e) { return e && e.src === "live" && !e.skip && e.text; });
    if (done.length) box.appendChild(h("details", { class: "small lp-askhist" }, h("summary", {}, "پرسش‌هایی که تا حالا پرسیدی (" + fa(done.length) + ")"),
      h("ul", {}, done.map(function (e) { return h("li", {}, "«" + e.q + "» ⇐ «" + e.text + "»" + (e.self != null ? " · کمک: " + ["نه", "تاحدی", "بله"][e.self] : "")); }))));
    return box;
  }

  /* ---------- مسئلهٔ مرتبط: از مسئله‌ها، موقعیت‌ها، ایده‌ها و پرونده‌های خودت (شباهتِ واژه‌ها با کد) ---------- */
  function candidates(pid) {
    var o = [];
    lives().forEach(function (r) { if (r.p.id !== pid) o.push({ type: "eprob", id: r.id, fa: "🔭 " + r.p.title, t: [r.p.title, r.p.statement].join(" "), go: ["lprob", r.p.id] }); });
    (A.probsMine ? A.probsMine() : []).forEach(function (p) { o.push({ type: "eprob", id: "eprob_" + p.id, fa: "🧗 " + p.title, t: [p.title, p.statement, p.answer].join(" "), go: ["e_prob", p.id] }); });
    S.all("kcase").forEach(function (k) { var it = k.intake || {}; o.push({ type: "kcase", id: k.id, fa: "🪢 " + (k.title || "موقعیت"), t: [k.title, it.what, it.expected, it.actual, it.thoughts, it.claim, it.statement].join(" "), go: ["kcase", k.id] }); });
    S.all("idea").forEach(function (x) { o.push({ type: "idea", id: x.id, fa: "💡 " + (x.title || "ایده"), t: [x.title, x.what].concat((x.parts || []).map(function (p) { return p.t; })).join(" "), go: ["idea", x.id] }); });
    S.all("case", function (c) { return !c.sample; }).forEach(function (c) { var d = c.st && c.st.st_intake && c.st.st_intake.data || {}; o.push({ type: "case", id: c.id, fa: "🏭 " + (c.title || "پرونده"), t: [c.title, d.input].join(" "), go: ["e_case", c.id] }); });
    return o;
  }
  /* شباهتِ «مسئلهٔ مرتبط»: عدد و واژه‌های عامِ مقدار و زمان («دو»، «کم»، «ماهانه»، «روز»…) شباهت نمی‌سازند؛ دست‌کم دو واژهٔ معنادارِ مشترک (بازبینیِ دورِ ۶) */
  var SIMSTOP = " یک دو سه چهار پنج شش هفت هشت نه ده صد هزار میلیون میلیارد تومان کم زیاد بیش بیشتر کمتر خیلی کمی تا روز روزه روزانه هفته هفتگی ماه ماهانه سال سالانه ساعت دقیقه بار اول دوم آخر وقت زمان امروز فردا دیروز همیشه هرگز گاهی باید نباید خواهم خواستم کنم شد شده ";
  function toksSim(t) { return toks(t).filter(function (w) { return !/\d/.test(w) && SIMSTOP.indexOf(" " + w + " ") < 0 && w.length >= 3 && !/^[بن][ء-يپچژکگی]{2,}(?:م|یم|ی|د|ید|ند)$/.test(w); }); }   // فعلِ التزامی/منفی («بگیرم»، «نکنیم») موضوع نیست
  A.liveToksSim = toksSim;
  A.liveRelated = function (pid, n) {
    var r = rec(pid); if (!r) return [];
    var pg = pgOf(pid), s = solOf(pg), u = uOf(s) || {};
    var a = toksSim([r.p.title, r.p.statement, u.u, u.d, u.c].join(" "));
    return candidates(pid).map(function (c) { var b = toksSim(c.t), sh = a.filter(function (w) { return hit(w, b); }); return { c: c, sh: sh, s: sh.length / Math.sqrt((a.length || 1) * (b.length || 1)) }; })
      .filter(function (x) { return x.sh.length >= 2; }).sort(function (x, y) { return y.sh.length - x.sh.length || y.s - x.s; }).slice(0, n || 3);
  };
  var RD = {};
  function relatedCard(r, pg, s) {
    var pid = r.p.id, L = live(s), R = A.liveRelated(pid, 3), d = RD[pid] = RD[pid] || { ans: (L.seen && L.seen.ans) || "", where: (L.seen && L.seen.where) || "", fam: (L.seen && L.seen.fam) || "" };
    var box = h("section", own({ class: "card soft lp-rel" }), h("h4", {}, "به مجهول نگاه کن: مسئلهٔ مرتبط از کارهای خودت"),
      h("p", { class: "small" }, "سه موردِ نزدیک از مسئله‌ها، موقعیت‌های گره‌گشا، ایده‌ها و پرونده‌های خودت — شباهت با کد (واژه‌های مشترک)، نه مدل؛ ممکن است بی‌ربط باشد. اگر مرتبط است، نتیجه‌اش یا روشش به کار می‌آید؟"));
    if (!R.length) box.appendChild(h("p", { class: "small muted lp-relnone" }, "هنوز موردی با واژه‌های مشترک پیدا نشد."));
    R.forEach(function (x) {
      var linked = L.related.some(function (y) { return y.id === x.c.id; });
      box.appendChild(h("div", { class: "row between wrap lp-relrow", "data-id": x.c.id }, h("button", { class: "linkish", type: "button", onclick: function () { A.go.apply(A, x.c.go); } }, x.c.fa),
        h("span", { class: "small muted" }, "واژه‌های مشترک: " + x.sh.slice(0, 5).join("، ")),
        linked ? h("span", { class: "chip" }, "پیوند خورد") : h("button", { class: "btn ghost sm lp-rellink", type: "button", onclick: function () { L.related.push({ type: x.c.type, id: x.c.id, at: nowISO() }); S.put(pg); A.render(); } }, "مرتبط است — پیوندش بده")));
    });
    /* پیوند به‌تنهایی «به کار بردنِ ابزار» نیست: بنویس دقیقاً چه چیزی از آن مورد به این مسئله می‌آید (نتیجه، روش، عنصرِ کمکی) */
    L.related.forEach(function (x, i) {
      var c = candidates(pid).filter(function (y) { return y.id === x.id; })[0], k = "c" + i; d[k] = d[k] != null ? d[k] : x.carry || "";
      box.appendChild(h("div", { class: "col gap lp-relcarry", "data-id": x.id }, field("lpRelC_" + i, "از «" + clip(c ? c.fa : x.id, 60) + "» دقیقاً چه چیزی به این مسئله می‌آید — نتیجه‌اش، روشش یا عنصری کمکی؟", d[k], function (v) { d[k] = v; }, 0),
        h("button", { class: "btn ghost sm lp-relcsave", type: "button", onclick: function () { if (!spec(d[k])) { A.toast("دقیق‌تر بنویس چه چیزی به کار می‌آید (دست‌کم سه واژهٔ معنادار).", "bad"); return; } x.carry = txt(d[k]); x.carryAt = nowISO(); S.put(pg); A.render(); } }, x.carry ? "به‌روزکردن" : "ثبتِ آنچه به کار می‌آید")));
    });
    box.appendChild(selF("lpSeen", "همین مجهول (یا مجهولی شبیه) را جایی دیده‌ای — در زندگیِ خودت یا کارِ دیگران؟", [["yes", "بله"], ["no", "نه"]], d.ans, function (v) { d.ans = v; A.render(); }));
    if (d.ans === "yes") box.appendChild(field("lpSeenW", "کجا؟ چه چیزی از آن به کار می‌آید — نتیجه‌اش، روشش، یا عنصری کمکی؟", d.where, function (v) { d.where = v; }, 2));
    if (d.ans === "no") box.appendChild(field("lpSeenF", "پاسخِ «نه» هم دانش را بسیج می‌کند: پس چه چیزی در این مسئله برایت آشناست؟", d.fam, function (v) { d.fam = v; }, 2));
    box.appendChild(h("button", { class: "btn ghost sm lp-seensave", type: "button", onclick: function () {
      if (!d.ans || (d.ans === "yes" && txt(d.where).length < 3) || (d.ans === "no" && txt(d.fam).length < 3)) { A.toast("بگو دیده‌ای یا نه، و یک جمله دربارهٔ آن.", "bad"); return; }
      L.seen = { ans: d.ans, where: txt(d.where), fam: txt(d.fam), at: nowISO() }; S.put(pg); A.toast("ثبت شد."); A.render();
    } }, "ثبت"));
    if (L.seen) box.appendChild(h("p", { class: "small good lp-seenok" }, "ثبت شد: " + (L.seen.ans === "yes" ? "دیده‌ای — " + L.seen.where : "ندیده‌ای؛ آشنا: " + L.seen.fam)));
    return box;
  }

  /* ---------- فرض کن حل شده — از آخر به عقب ---------- */
  var BD = {};
  function backCard(r, pg, s) {
    var pid = r.p.id, L = live(s), b = L.back || {}, d = BD[pid] = BD[pid] || { solved: b.solved || "", before1: b.before1 || "", before2: b.before2 || "", have: b.have || "" };
    var box = h("section", own({ class: "card soft lp-bk" }), h("h4", {}, "فرض کن حل شده — از آخر به عقب"),
      h("p", { class: "small" }, "رو برگرداندن از هدف سخت است، ولی نبوغ نمی‌خواهد: وضعِ حل‌شده را دقیق تصور کن (فقط تصور — امکانش را با یقین اشتباه نگیر)، بعد بپرس درست یک گام پیش از آن چه باید برقرار باشد، و باز یک گام پیش‌تر، تا به چیزی برسی که همین حالا در دستِ توست. این زنجیره اندیشه است (طرح)؛ اجرا همان زنجیره است وارونه — نخستین گامِ واقعیِ تو آخرین حلقه‌ای است که این‌جا می‌نویسی."),
      field("lpBkS", "اگر حل شده بود، وضع دقیقاً چه شکلی داشت؟ (دیدنی و مشخص)", d.solved, function (v) { d.solved = v; }, 2),
      field("lpBk1", "درست یک گام پیش از آن، چه باید برقرار باشد؟", d.before1, function (v) { d.before1 = v; }, 2),
      field("lpBk2", "و یک گام پیش‌تر؟", d.before2, function (v) { d.before2 = v; }, 0),
      field("lpBkH", "کدام از این‌ها همین حالا در دستِ توست (کدام داده)؟", d.have, function (v) { d.have = v; }, 0));
    box.appendChild(h("button", { class: "btn ghost sm lp-bksave", type: "button", onclick: function () {
      if (txt(d.solved).length < 3 || txt(d.before1).length < 3) { A.toast("وضعِ حل‌شده و گامِ پیش از آن را بنویس.", "bad"); return; }
      L.back = { solved: txt(d.solved), before1: txt(d.before1), before2: txt(d.before2), have: txt(d.have), at: nowISO() }; S.put(pg); A.toast("ثبت شد."); A.render();
    } }, "ثبتِ کار به عقب"));
    if (L.back && L.back.at) box.appendChild(h("p", { class: "small good lp-bkok" }, "ثبت شد (" + A.fdate(A.localDay ? A.localDay(L.back.at) : String(L.back.at).slice(0, 10)) + ")."));
    return box;
  }

  /* ---------- مسئلهٔ کمکی ---------- */
  var XD = {};
  var AUX = [["special", "خاص‌تر/ساده‌تر (یک حالت، یک نمونهٔ کوچک)"], ["general", "کلی‌تر"], ["analog", "مشابه (قیاسی) — جای دیگری که همین ساختار را دارد"], ["part", "فقط بخشی از شرط را نگه دار"]];
  function auxCard(r, pg, s) {
    var pid = r.p.id, L = live(s), d = XD[pid] = XD[pid] || { k: "", t: "", bridge: "" };
    var box = h("section", own({ class: "card soft lp-aux" }), h("h4", {}, "مسئلهٔ کمکی"),
      h("p", { class: "small" }, "اگر همین را نمی‌توانی حل کنی، اول مسئلهٔ مرتبطی را حل کن. دلیلِ خوبِ انتخاب: دست‌یافتنی‌تر است، چیزی یادت می‌دهد، یا وقتی از اصلی خسته‌ای تازه است. پلِ برگشت را همین حالا بنویس — وگرنه مسئلهٔ اصلی گم می‌شود."),
      selF("lpAuxK", "چه نوع مسئلهٔ کمکی؟", AUX, d.k, function (v) { d.k = v; }),
      field("lpAuxT", "مسئلهٔ کمکی را بنویس", d.t, function (v) { d.t = v; }, 2),
      field("lpAuxB", "از آن چطور به مسئلهٔ اصلی برمی‌گردی؟", d.bridge, function (v) { d.bridge = v; }, 0));
    box.appendChild(h("button", { class: "btn ghost sm lp-auxsave", type: "button", onclick: function () {
      if (!d.k || txt(d.t).length < 3 || txt(d.bridge).length < 3) { A.toast("نوع، مسئلهٔ کمکی و پلِ برگشت لازم است.", "bad"); return; }
      L.aux.push({ k: d.k, t: txt(d.t), bridge: txt(d.bridge), at: nowISO() }); delete XD[pid]; S.put(pg); A.render();
    } }, "ثبتِ مسئلهٔ کمکی"));
    if (L.aux.length) box.appendChild(h("ul", { class: "small lp-auxlist" }, L.aux.map(function (a) { return h("li", {}, "«" + a.t + "» (" + ((AUX.filter(function (x) { return x[0] === a.k; })[0] || [])[1] || "") + ") — برگشت: " + a.bridge); })));
    return box;
  }

  /* ---------- حرکت‌ها: از ۲۷ حرکت، با دلیلِ یک‌خطیِ خودت ---------- */
  var MD = {};
  function movesCard(r, pg, s) {
    var pid = r.p.id, L = live(s), d = MD[pid] = MD[pid] || { mv: "", why: "" }, ML = A.MOVE_LIST || [];
    if (!ML.length) return null;
    var box = h("section", own({ class: "card soft lp-moves" }), h("h4", {}, "کدام حرکت‌ها؟"),
      h("p", { class: "small" }, "از حرکت‌های حلِ مسئله آن‌هایی را برگزین که این‌جا به کار می‌آیند — هر کدام با یک دلیلِ کوتاه. «همهٔ کلیدها را بیازما»: فهرستِ آزموده‌ها همین‌جا می‌ماند."),
      selF("lpMv", "حرکت", ML.map(function (m) { return [m.id, m.fa]; }), d.mv, function (v) { d.mv = v; }),
      field("lpMvWhy", "چرا این حرکت این‌جا؟ (یک خط)", d.why, function (v) { d.why = v; }, 0));
    box.appendChild(h("button", { class: "btn ghost sm lp-mvadd", type: "button", onclick: function () {
      if (!d.mv || txt(d.why).length < 3) { A.toast("حرکت و دلیلش را بنویس.", "bad"); return; }
      if (!L.moves.some(function (m) { return m.mv === d.mv; })) L.moves.push({ mv: d.mv, why: txt(d.why), at: nowISO() }); delete MD[pid]; S.put(pg); A.render();
    } }, "افزودنِ حرکت"));
    if (L.moves.length) box.appendChild(h("div", { class: "col gap lp-mvlist" }, L.moves.map(function (m) { return h("div", { class: "row gap wrap small" }, A.moveLink ? A.moveLink(m.mv) : m.mv, h("span", {}, m.why)); })));
    return box;
  }

  /* ---------- طرح در یک جمله + داده‌های به‌کارنرفته ---------- */
  /* پولیا، عمق: طرح دست‌کم یک ابزارِ طرح را واقعاً به کار گرفته باشد — کد فقط می‌سنجد ناخالی، مشخص (چند واژهٔ معنادار) و رونوشتِ صورت نیست */
  function near(a, b) { return !!(A.kNearCopy && txt(a) && txt(b) && A.kNearCopy(a, b)); }
  function spec(t, n) { return toks(t).length >= (n || 3); }
  function heurUsed(r, s) {
    var L = live(s), u = uOf(s) || {}, o = [], st = r.p.statement;
    if (L.back && spec(L.back.solved) && spec(L.back.before1, 2) && !near(L.back.solved, st) && !near(L.back.solved, u.one)) o.push("back");
    if (L.aux.some(function (a) { return spec(a.t) && spec(a.bridge, 2) && !near(a.t, st); })) o.push("aux");
    if (L.moves.some(function (m) { var mv = A.MOVES && A.MOVES[m.mv]; return spec(m.why) && !(mv && near(m.why, mv.fa + " " + (mv.d || ""))); })) o.push("move");
    if (L.related.some(function (x) { return spec(x.carry) && !near(x.carry, st); }) || (L.seen && L.seen.ans === "yes" && spec(L.seen.where) && !near(L.seen.where, st))) o.push("rel");
    return o;
  }
  A.liveHeur = function (pid) { var r = rec(pid); if (!r) return []; return heurUsed(r, solOf(pgOf(pid))); };
  var HEUR_FA = { back: "از آخر به عقب", aux: "مسئلهٔ کمکی", move: "حرکت با دلیل", rel: "مسئلهٔ مرتبط" };
  var PD = {};
  function planCard(r, pg, s) {
    var pid = r.p.id, L = live(s), d = PD[pid] = PD[pid] || { t: (L.plan && L.plan.t) || "", unused: {} };
    function still() { return unusedOf(s, pg).filter(function (x) { return !mentions(d.t, x.t); }); }   // داده‌ای که در خودِ جملهٔ طرح آمده، به کار رفته است
    var hu = heurUsed(r, s);
    var box = h("section", own({ class: "card lp-plan" }), h("h4", {}, "طرحت"),
      h("p", { class: "small" }, "طرح از پیوندِ داده و مجهول درمی‌آید. در یک یا دو جمله: نخست چه، سپس چه — و با کدام داده‌ها."),
      h("p", { class: "small lp-heur " + (hu.length ? "good" : "warnline") }, hu.length ? "ابزارِ طرح که به کار بردی: " + hu.map(function (k) { return HEUR_FA[k]; }).join("، ") + "." :
        "پیش از ثبتِ طرح، دست‌کم یکی از ابزارهای بالا را واقعاً به کار ببر: مسئلهٔ مرتبط، از آخر به عقب، مسئلهٔ کمکی، یا حرکتی با دلیلش."));
    var hold = h("div", { class: "lp-unhold" });
    function drawUn() { hold.innerHTML = ""; var un = still(), ua = unusedAsk(un, d.unused, "lpPU_"); if (ua) hold.appendChild(ua); else if (dataOf(s).length) hold.appendChild(h("p", { class: "small good lp-allused" }, "همهٔ داده‌ها جایی در پاسخ‌ها یا طرحت آمده‌اند.")); }
    var tmr = null;
    box.appendChild(field("lpPlan", "طرحت: نخست … ، سپس …", d.t, function (v) { d.t = v; if (tmr) clearTimeout(tmr); tmr = setTimeout(drawUn, 250); }, 2));
    drawUn(); box.appendChild(hold);
    box.appendChild(h("button", { class: "btn lp-plansave", type: "button", onclick: function () {
      var miss = []; if (txt(d.t).length < 5) miss.push("«طرحت»");
      if (!heurUsed(r, s).length) miss.push("«دست‌کم یک ابزارِ طرح که واقعاً به کار رفته باشد»");
      var un = still();
      unusedMiss(un, d.unused).forEach(function (x) { miss.push(x); });
      if (miss.length) { A.toast("اول این‌ها: " + miss.join("، "), "bad"); drawUn(); return; }
      var keep = {}; un.forEach(function (x) { keep[x.id] = { ans: d.unused[x.id].ans, why: txt(d.unused[x.id].why), t: x.t }; });
      L.plan = { t: txt(d.t), at: nowISO(), d: A.today(), unused: keep, heur: heurUsed(r, s) }; delete PD[pid];
      U.seed(s, "h");   // ابزارِ طرحی که به کار بردی از حافظه برمی‌گردد (نردبانِ همان تونل)
      S.put(pg);
      A.toast("طرح ثبت شد؛ حالا گامِ واقعیِ بعد — با پیش‌بینی."); A.go("lprob", pid, "exec");
    } }, L.plan && L.plan.at ? "به‌روزکردنِ طرح" : "ثبتِ طرح"));
    return box;
  }

  /* ---------- ادعاهای درونِ مسئله ⇐ پروندهٔ کارخانه (یک کلیک)، با سقفِ موتورِ قطعی کنارش ---------- */
  var CD = {};
  function claimsCard(r, pg, s) {
    var pid = r.p.id, L = live(s), d = CD[pid] = CD[pid] || { t: "" };
    var box = h("section", own({ class: "card soft lp-claims" }), h("h4", {}, "ادعاهایی که حلت به آن‌ها تکیه دارد"),
      h("p", { class: "small" }, "«فکر می‌کنم … درست است» — هر ادعایی که طرح یا تصمیمت بر آن بنا شده. با یک کلیک یک پروندهٔ سنجش در کارخانه می‌گیرد؛ درجه‌اش را موتورِ قطعیِ کارخانه از کاربرگ‌ها می‌دهد (پروندهٔ نیمه‌کاره ⇒ «شک»، ½) — هوش مصنوعی داوری نمی‌کند."));
    L.claims.forEach(function (c) {
      var g = A.IDEA && A.IDEA.assumptionGrade ? A.IDEA.assumptionGrade({ caseId: c.caseId, claim: c.claim }, null) : null;
      box.appendChild(h("div", { class: "row between wrap lp-claim", "data-case": c.caseId }, h("span", {}, "«" + c.t + "»"),
        h("span", { class: "small lp-grade" }, g ? g.fa : "—"),
        h("button", { class: "btn ghost sm", type: "button", onclick: function () { A.go("e_case", c.caseId); } }, "🏭 پرونده")));
    });
    box.appendChild(field("lpClaim", "ادعای تازه: فکر می‌کنم … درست است", d.t, function (v) { d.t = v; }, 0));
    box.appendChild(h("button", { class: "btn ghost sm lp-claimgo", type: "button", onclick: function () {
      var t = txt(d.t); if (t.length < 5) { A.toast("ادعا را بنویس.", "bad"); return; }
      if (!A.newCase) { A.toast("کارخانه در این نسخه بار نشده.", "bad"); return; }
      var cs = A.newCase({ title: clip(t, 70), input: t, src: { type: "lprob", id: pid } });
      L.claims.push({ t: t, caseId: cs.id, at: nowISO() }); delete CD[pid]; S.put(pg);
      A.go("e_case", cs.id);
    } }, "🏭 در کارخانه بسنج"));
    return box;
  }

  /* ---------- اجرا روی واقعیت: گامِ واقعی، پیش‌بینی پیش از انجام، نتیجه در موعد ---------- */
  var SD = {};
  var CONF = ["50", "60", "70", "80", "90", "95"];
  /* B089: داده‌ای که در طرح گفتی «نمی‌دانم کجا به کار می‌آید» و هنوز به کار نرفته — در گامِ بعد و در بازنگری با نامش برمی‌گردد */
  function unknownData(s, pg) { var L = live(s), un = (L.plan && L.plan.unused) || {}, used = usedMap(s, pg); return dataOf(s).filter(function (x) { return un[x.id] && un[x.id].ans === "unknown" && !used[x.id]; }); }
  var WANT = [["more", "بیشتر می‌خواهم"], ["same", "همان‌قدر"], ["less", "کمتر"], ["changed", "عوض شد — حالا چیزِ دیگری می‌خواهم"]];
  function stepForm(r, pg, s) {
    var pid = r.p.id, L = live(s), d = SD[pid] = SD[pid] || { text: "", clear: "", unclear: "", prem: "", pred: "", conf: "", when: "", far: false, data: [], unk: {} };
    var u = uOf(s) || {}, unk = unknownData(s, pg);
    var box = h("section", own({ class: "card lp-stepf" }), h("h4", {}, "گامِ واقعیِ بعد"),
      h("p", { class: "small" }, "اجرا یعنی هر گام را وارسی کنی، نه فقط بنویسی؛ و پیش از انجام بدانی تقریباً به چه می‌رسی. پیش‌بینی‌ات با احتمال در «🎯 دفترِ پیش‌بینی» می‌نشیند و در موعد، خودت می‌گویی چه شد — کالیبراسیونِ پیش‌بینی‌هایت در «🧠 کارنامهٔ ذهن» از همین‌ها ساخته می‌شود."),
      field("lpStep", "گامِ بعد — یک کارِ مشخص در دنیای واقعی (چه چیزی، با چه کسی یا با چه ابزاری)", d.text, function (v) { d.text = v; }, 2),
      selF("lpClear", "روشن می‌بینی که این گام درست است — به مجهول نزدیکت می‌کند؟", ["بله", "مطمئن نیستم", "نه"], d.clear, function (v) { if (v === "نه") d.was = { text: txt(d.text), at: nowISO() }; d.clear = v; A.render(); }));
    /* A130 (سنجیده، نه تیک): «نه» گام را می‌بندد. یا بنویس کدام بخش روشن نیست، یا گام را کوچک‌تر بازنویسی کن — و بعد «روشن می‌بینی؟» را دوباره
       پاسخ بده. گامِ پیشین و تازه کنارِ هم ثبت می‌شوند */
    if (d.was) box.appendChild(h("div", { class: "col gap lp-unclear" }, h("p", { class: "small warnline" }, "گفتی روشن نمی‌بینی‌اش: «" + clip(d.was.text, 120) + "». بنویس دقیقاً کدام بخش روشن نیست، یا گام را بالا کوچک‌تر بازنویسی کن؛ بعد «روشن می‌بینی؟» را دوباره پاسخ بده."),
      field("lpUnclear", "کدام بخشِ این گام روشن نیست؟", d.unclear, function (v) { d.unclear = v; }, 2)));
    box.appendChild(field("lpPrem", "به کدام داده یا دلیل تکیه دارد؟", d.prem, function (v) { d.prem = v; }, 0));
    unk.forEach(function (x) { box.appendChild(selF("lpSU_" + x.id, "در طرح گفتی نمی‌دانی «" + clip(x.t, 80) + "» کجا به کار می‌آید — در این گام به کار می‌آید؟", [["use", "بله — همین گام به کارش می‌برد"], ["notyet", "هنوز نه"]], d.unk[x.id] || "", function (v) { d.unk[x.id] = v; var i = d.data.indexOf(x.id); if (v === "use" && i < 0) d.data.push(x.id); if (v !== "use" && i >= 0) d.data.splice(i, 1); })); });
    box.appendChild(field("lpPred", "پیش از انجام: فکر می‌کنی چه می‌شود؟", d.pred, function (v) { d.pred = v; }, 2, "یک نتیجهٔ مشخص که بعداً بشود گفت شد یا نشد"));
    box.appendChild(selF("lpConf", "چقدر مطمئنی که همین می‌شود؟", CONF.map(function (x) { return [x, fa(x) + "٪"]; }), d.conf, function (v) { d.conf = v; }));
    box.appendChild(field("lpWhen", "کی انجامش می‌دهی؟ (روز — همان روز نتیجه را می‌پرسم)", d.when, function (v) { d.when = v; }, 0, "مثلاً «پنجشنبه»، «۳ روزِ دیگر»، «دهم آذر»، «آخرِ هفته»"));
    if (u.deadline) box.appendChild(h("p", { class: "small muted lp-deadnote" }, "مهلتِ خودِ مسئله: " + A.fdate(u.deadline)));
    var tk = dataTicks(s, "lpSD_", d.data); if (tk) box.appendChild(tk);
    var farBox = h("div", {}), out = h("div", { class: "small", "aria-live": "polite" });
    box.appendChild(farBox);
    box.appendChild(h("button", { class: "btn lp-stepsave", type: "button", onclick: function () {
      var why = [], st = txt(d.text), W = txt(d.when) ? A.willWhen(d.when) : null;
      if (!st) why.push("گامِ بعد را بنویس");
      else if (A.willConcrete && !A.willConcrete(st)) why.push("«" + st + "» گام نیست، آرزوست — یک کارِ مشخص بنویس");
      if (!d.clear) why.push("«روشن می‌بینی؟» را انتخاب کن");
      else if (d.clear === "نه") why.push("روشن نمی‌بینی‌اش: بنویس کدام بخش روشن نیست یا گام را کوچک‌تر بازنویسی کن، و «روشن می‌بینی؟» را دوباره پاسخ بده");
      else if (d.was && toks(d.unclear).length < 2 && !(txt(d.text) !== d.was.text && txt(d.text).length <= d.was.text.length)) why.push("پیش‌تر گفتی روشن نمی‌بینی‌اش: یا بنویس کدام بخش روشن نبود، یا گام را کوچک‌تر بازنویسی کن");
      unk.forEach(function (x) { if (!d.unk[x.id]) why.push("بگو «" + clip(x.t, 40) + "» در این گام به کار می‌آید یا نه"); });
      if (txt(d.pred).length < 3) why.push("پیش‌بینی‌ات را بنویس");
      if (!d.conf) why.push("اطمینانت را انتخاب کن");
      if (!txt(d.when)) why.push("کِی؟ را بنویس");
      else if (!W) why.push("«" + d.when + "» زمان نیست — روزِ مشخص بنویس");
      else if (!W.date) why.push("روزش را هم بنویس (فقط ساعت آمده)");
      else if (W.past) why.push("«" + d.when + "» گذشته است");
      else if (u.deadline && W.date > u.deadline) why.push("«" + d.when + "» (" + A.fdate(W.date) + ") پس از مهلتِ خودِ مسئله (" + A.fdate(u.deadline) + ") است");
      else if (A.daysBetween(A.today(), W.date) > 365 && !d.far) {
        why.push("«" + d.when + "» بیش از یک سال بعد است (" + A.fdate(W.date) + ") — اگر واقعاً همین است، پایین تأیید کن");
        farBox.innerHTML = ""; farBox.appendChild(h("label", { class: "row gap small lp-farok", for: "lpFarOk" }, h("input", { type: "checkbox", id: "lpFarOk", onchange: function (e) { d.far = e.target.checked; } }), "بله، این گام واقعاً " + A.fdate(W.date) + " است"));
      }
      out.innerHTML = "";
      if (why.length) { out.appendChild(h("p", { class: "bad lp-stepmiss" }, "هنوز نه: " + why.join("؛ ") + ".")); return; }
      var due = W.date < A.today() ? A.today() : W.date, id = "ls" + (L.steps.length + 1);
      var fc = { id: A.uid("fc"), type: "fcast", q: clip(txt(d.pred), 200) + " — گامِ «" + clip(st, 60) + "» در «" + clip(r.p.title, 50) + "»", p: +d.conf, due: due, dim: "s_problem", live: { pid: pid, step: id } };
      S.put(fc);
      var stp = { id: id, at: nowISO(), d: A.today(), text: st, clear: d.clear, prem: txt(d.prem), pred: txt(d.pred), conf: +d.conf, when: txt(d.when), due: due, data: d.data.slice(), fc: fc.id };
      if (d.was) stp.reclear = { before: d.was.text, unclear: txt(d.unclear), after: st, clear: d.clear, smaller: st !== d.was.text && st.length <= d.was.text.length };
      if (unk.length) stp.unknownAsk = JSON.parse(JSON.stringify(d.unk));
      L.steps.push(stp);
      delete SD[pid]; S.put(pg);
      A.toast("گام ثبت شد؛ " + (due === A.today() ? "امروز" : A.fdate(due)) + " در «امروز» می‌پرسد چه شد."); A.render();
    } }, "ثبتِ گام و پیش‌بینی"));
    box.appendChild(out);
    return box;
  }
  var OD = {};
  var MATCH = [["yes", "همان شد که پیش‌بینی کردم"], ["part", "تاحدی"], ["no", "پیش‌بینی‌ام درست درنیامد"]];
  var DONE = [["yes", "کامل انجامش دادم"], ["part", "تاحدی"], ["no", "نه"]];
  function lab(L0, k) { var x = L0.filter(function (y) { return y[0] === k; })[0]; return x ? x[1] : ""; }
  function outcomeCard(r, pg, s, st) {
    var pid = r.p.id, fc = st.fc ? S.get(st.fc) : null, u = uOf(s) || {}, d = OD[st.id + pid] = OD[st.id + pid] || { done: "", what: "", match: fc && fc.outcome === "شد" ? "yes" : fc && fc.outcome === "نشد" ? "no" : "", prog: "", want: "" };
    var box = h("section", own({ class: "card lp-out", "data-step": st.id }), h("h4", {}, "🔭 گامِ واقعی: انجامش دادی؟ چه شد؟"),
      h("p", { class: "small" }, "«" + st.text + "» — " + st.when + " · پیش‌بینی‌ات: «" + st.pred + "» (" + fa(st.conf) + "٪)"),
      selF("lpODone", "انجامش دادی؟", DONE, d.done, function (v) { d.done = v; A.render(); }),
      field("lpOWhat", "چه شد؟ (واقعیت، نه تفسیر — حتی «هیچ»)", d.what, function (v) { d.what = v; }, 2));
    if (d.done && d.done !== "no") box.appendChild(selF("lpOMatch", "با پیش‌بینی‌ات می‌خواند؟ (داوریِ خودت)", MATCH, d.match, function (v) { d.match = v; }));
    box.appendChild(selF("lpOProg", "به حلِ مسئله نزدیک‌تر شدی؟", ["بله، روشن", "کمی", "نه"], d.prog, function (v) { d.prog = v; }));
    /* خواستن در ایست‌ها: با آنچه در آغاز نوشتی */
    if (u.why) box.appendChild(h("p", { class: "small muted lp-owhy" }, "در آغاز نوشتی چرا می‌خواهی حلش کنی: «" + u.why + "»"));
    box.appendChild(selF("lpOWant", "حالا، پس از این گام، چقدر می‌خواهی حلش کنی — نسبت به آغاز؟", WANT, d.want, function (v) { d.want = v; }));
    box.appendChild(h("button", { class: "btn lp-outsave", type: "button", onclick: function () {
      var miss = []; if (!d.done) miss.push("«انجامش دادی؟»"); if (txt(d.what).length < 2) miss.push("«چه شد؟»"); if (d.done && d.done !== "no" && !d.match) miss.push("«با پیش‌بینی‌ات می‌خواند؟»"); if (!d.prog) miss.push("«نزدیک‌تر شدی؟»"); if (!d.want) miss.push("«چقدر می‌خواهی؟»");
      if (miss.length) { A.toast("اول این‌ها: " + miss.join("، "), "bad"); return; }
      st.out = { at: nowISO(), d: A.today(), done: d.done, what: txt(d.what), match: d.done === "no" ? "" : d.match, prog: d.prog, want: d.want }; st.closed = true;
      if (fc) { fc.outcome = d.done === "no" ? "انجام نشد" : d.match === "yes" ? "شد" : d.match === "no" ? "نشد" : "تاحدی"; fc.outcomeAt = nowISO(); S.put(fc); }
      delete OD[st.id + pid]; S.put(pg); A.render();
    } }, "ثبتِ نتیجه"));
    return box;
  }
  /* گامِ بازی که با «حل شد» یا «کنار گذاشتن» بسته می‌شود: پیش‌بینی‌اش هرگز آزموده نشد ⇒ «انجام نشد» (بیرون از کالیبراسیون و بی‌موعد در دفتر) */
  function closeOpen(s, why) {
    live(s).steps.forEach(function (st) { if (st.closed) return; st.closed = true; st.out = { at: nowISO(), d: A.today(), done: "no", what: "", match: "", prog: "", auto: why };
      var f = st.fc && S.get(st.fc); if (f && !f.outcome) { f.outcome = "انجام نشد"; f.outcomeAt = nowISO(); f.auto = why; S.put(f); } });
  }
  /* غافلگیری ⇒ داده است: گره‌گشا یا «دوباره فهمِ مسئله»؛ پیشرفتی نبود ⇒ «🌱 کوچک‌ترین گامِ بعد» */
  function afterCard(r, pg, s) {
    var st = lastClosed(s); if (!st || !st.out || openStep(s)) return null;
    var o = st.out, box = h("div", { class: "col gap lp-after" });
    if (o.match === "no") box.appendChild(h("section", own({ class: "card soft lp-surprise" }), h("h4", {}, "غافلگیر شدی — این داده است، نه شکست"),
      h("p", { class: "small" }, "پیش‌بینی: «" + st.pred + "» · آنچه شد: «" + o.what + "». فاصلهٔ این دو جایی است که فهمت از مسئله یا از خودت ناقص بود."),
      h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm lp-toknot", type: "button", onclick: function () { stuck(r, pg, s, st); } }, "🪢 همین غافلگیری را در گره‌گشا بشکاف"),
        h("button", { class: "btn ghost sm lp-reu", type: "button", onclick: function () { live(s).reU = true; S.put(pg); A.go("lprob", r.p.id, "u"); } }, "↺ دوباره فهمِ مسئله"))));
    if ((o.prog === "نه" || o.done === "no") && A.willHost && A.willCard) {
      var hs = A.willHost("prob", r.p.id);
      if (hs) box.appendChild(A.willCard(hs, "live:" + (o.done === "no" ? "notdone" : "noprog"), o.done === "no" ? "گام انجام نشد — اشکالی ندارد؛ داده است. چقدر می‌خواهی پیشش ببری و کوچک‌ترین گامِ بعد چیست؟" : "پیشرفتی نبود. نه رها کن نه وانمود کن چیزی نشده: کوچک‌ترین گامِ مشخص بعد چیست، کی و چند دقیقه؟"));
    }
    return box.children.length ? box : null;
  }
  /* گیر ⇒ گره‌گشا با همین مسئله (موقعیتِ ازپیش‌پرشده؛ یکی برای هر مسئله تا وقتی باز است) */
  function stuck(r, pg, s, st) {
    if (!A.knotNewCase) { A.toast("گره‌گشا در این نسخه بار نشده.", "bad"); return; }
    var L = live(s), pid = r.p.id;
    var ex = !st ? S.all("kcase", function (c) { return c.src && c.src.type === "eprob" && c.src.pid === pid && c.src.live && !c.src.step && c.status !== "closed" && c.status !== "done"; })[0] : null;
    if (ex) { A.go("kcase", ex.id, ex.step || "in"); return; }
    var kc = A.knotNewCase(), u = uOf(s) || {};
    kc.kinds = ["problem"]; kc.titleSet = true;
    kc.title = st ? "غافلگیری در «" + clip(r.p.title, 50) + "»" : "گیر در «" + clip(r.p.title, 60) + "»";
    kc.intake.statement = r.p.statement + (u.u ? "\nمجهول: " + u.u : "") + (u.d ? "\nداده‌ها: " + u.d : "") + (u.c ? "\nشرط: " + u.c : "");
    kc.intake.what = st ? "در مسئلهٔ حل‌نشدهٔ خودم «" + r.p.title + "» گامِ «" + st.text + "» را برداشتم." : "در مسئلهٔ حل‌نشدهٔ خودم «" + r.p.title + "» نمی‌دانم گامِ بعد چیست.";
    if (st) { kc.intake.expected = st.pred; kc.intake.actual = (st.out && st.out.what) || ""; }
    kc.intake.seen = "no";
    kc.src = { type: "eprob", pid: pid, live: true, step: st ? st.id : null };
    try { var rk = {}; (A.knotRank ? A.knotRank(kc) : []).forEach(function (x) { rk[x.fam] = { score: x.score, why: x.why }; }); kc.rank = rk; } catch (e) { }
    S.put(kc); if (L.knots.indexOf(kc.id) < 0) L.knots.push(kc.id); S.put(pg);
    A.go("kcase", kc.id, "in");
  }
  A.liveStuck = function (pid) { var r = rec(pid); if (!r) return; var pg = pgOf(pid); stuck(r, pg, solOf(pg), null); };
  function stepsList(s) {
    var L = live(s); if (!L.steps.length) return null;
    return h("details", { class: "small lp-steps", open: true }, h("summary", {}, "گام‌های واقعی (" + fa(L.steps.length) + ")"),
      h("ol", {}, L.steps.map(function (st) {
        var o = st.out;
        return h("li", { "data-step": st.id }, "«" + st.text + "» · پیش‌بینی: «" + st.pred + "» (" + fa(st.conf) + "٪) · " + (o ? lab(DONE, o.done) + (o.what ? " — «" + o.what + "»" : "") + (o.match ? " · " + lab(MATCH, o.match) : "") + " · پیشرفت: " + o.prog : "وارسی: " + A.fdate(st.due)));
      })));
  }

  /* ---------- بازنگری (حل شد یا آگاهانه کنار گذاشتی) ---------- */
  var BKD = {};
  var DROPSRC = (A.WILL && A.WILL.DROPSRC) || [["thing", "از خودِ مسئله — دلیلش را دیده‌ام و سنجیده‌ام"], ["crit", "از حسِ پس از نقد یا شکست"], ["tired", "از خستگی"]];
  function usedQs(pg) { var o = []; ((pg.tut || {}).plan || []).forEach(function (e) { if (e && e.src === "live" && !e.skip && e.text && o.indexOf(e.q) < 0) o.push(e.q); }); return o; }
  function lookBack(r, pg, s) {
    var pid = r.p.id, L = live(s), ab = L.state === "abandoned", g = s.g && s.g[1];
    var d = BKD[pid] = BKD[pid] || { chkHow: "", chkRes: "", other: "", glance: "", use: "", worked: "", best: "", newProb: "", hit: "", why: "", src: "", gain: "", unused: {} };
    var un = unusedOf(s, pg);
    var box = h("section", own({ class: "card lp-lb" }), h("div", { class: "eyebrow" }, ab ? "کنار گذاشتنِ آگاهانه" : "پس از حل"),
      h("h3", {}, ab ? "کنار می‌گذاری — با دلیل، بی شرم" : "بازنگری: نتیجه و راه را وارسی کن"),
      h("p", { class: "small" }, ab ? "رها کردنِ آگاهانه جایز است — مثلِ «🌱»: با دلیل، و یک بار بعدتر می‌پرسد «هنوز همان دلیل را قبول داری؟». آنچه تا این‌جا به دست آمد هم درس است." :
        "حل تمام نیست تا نگاهی به پشتِ سر نینداخته‌ای. درسِ تو یک کارتِ مرور می‌سازد، و مسئلهٔ تازه‌ای که از این می‌سازی چند روز بعد برای حل برمی‌گردد."));
    var u0 = uOf(s); if (u0 && u0.why) box.appendChild(h("p", { class: "small muted lp-bwhy0" }, "در آغاز نوشتی چرا می‌خواهی حلش کنی: «" + u0.why + "»"));
    box.appendChild(selF("lpBWant", "در پایان، آن خواستن نسبت به آغاز چطور است؟", WANT, d.want || "", function (v) { d.want = v; }));
    var unk0 = unknownData(s, pg); if (unk0.length) box.appendChild(h("p", { class: "small warnline lp-bunk" }, "در طرح گفتی نمی‌دانی این‌ها کجا به کار می‌آیند و هنوز به کار نرفته‌اند: " + unk0.map(function (x) { return "«" + clip(x.t, 50) + "»"; }).join("، ") + " — پایین بگو چرا."));
    if (ab) {
      box.appendChild(field("lpBWhy", "چرا کنارش می‌گذاری؟ (دلیلِ خودِ مسئله)", d.why, function (v) { d.why = v; }, 2));
      box.appendChild(selF("lpBSrc", "این دلیل از کجاست؟", DROPSRC, d.src, function (v) { d.src = v; }));
      box.appendChild(field("lpBGain", "تا این‌جا چه به دست آمد؟ (حتی «فهمیدم کدام راه کار نمی‌کند»)", d.gain, function (v) { d.gain = v; }, 0));
    } else {
      box.appendChild(field("lpBChk", "نتیجه را وارسی می‌کنی؟ چطور — با یک واقعیت، عدد، نظرِ کسی، یا حالتِ خاص؟", d.chkHow, function (v) { d.chkHow = v; }, 2));
      box.appendChild(selF("lpBRes", "نتیجهٔ وارسی", ["نتیجه سالم ماند", "ایرادی یافتم", "نتوانستم وارسی کنم"], d.chkRes, function (v) { d.chkRes = v; }));
      box.appendChild(field("lpBOther", "از راهِ دیگری هم به همین می‌رسیدی؟ چطور؟", d.other, function (v) { d.other = v; }, 0));
      box.appendChild(field("lpBGlance", "کلِ حل را در یک نگاه (یک جمله) ببین", d.glance, function (v) { d.glance = v; }, 0));
      box.appendChild(field("lpBWorked", "چه چیزی خوب کار کرد — و چطور دوباره همین‌قدر خوب عمل کنی؟", d.worked, function (v) { d.worked = v; }, 0));
    }
    var Qs = usedQs(pg);
    if (Qs.length) box.appendChild(selF("lpBBest", "کدام پرسش بیشتر از همه کمک کرد؟", Qs.map(function (q, i) { return [String(i), clip(q, 90)]; }).concat([["none", "هیچ‌کدام"]]), d.best, function (v) { d.best = v; }));
    box.appendChild(field("lpBUse", ab ? "درسِ تو به قلمِ خودت (اختیاری): کجای دیگر به کار می‌آید؟" : "درسِ تو به قلمِ خودت: این روش یا نتیجه کجای دیگر به کار می‌آید؟", d.use, function (v) { d.use = v; }, 2));
    box.appendChild(field("lpBNew", ab ? "مسئلهٔ تازه‌ای که از این ساختی (اختیاری) — چند روز بعد برای حل برمی‌گردد" : "مسئلهٔ تازه‌ای که از این ساختی (کمی متفاوت، یا همان روش جای دیگر) — چند روز بعد برای حل برمی‌گردد", d.newProb, function (v) { d.newProb = v; }, 2));
    if (g && g.guess && !ab) {
      box.appendChild(h("p", { class: "small" }, "حدسِ پیش از حلت: «" + g.guess + "»" + (g.conf ? " با اطمینانِ " + fa(g.conf) + "٪" : "")));
      box.appendChild(selF("lpBHit", "حدست با آنچه شد می‌خواند؟", ["درست بود", "تاحدی", "نادرست بود"], d.hit, function (v) { d.hit = v; }));
    }
    var ua = unusedAsk(un, d.unused, "lpBU_"); if (ua) box.appendChild(ua);
    box.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn lp-lbsave", type: "button", onclick: function () {
      var miss = [];
      if (ab) { if (txt(d.why).length < 3) miss.push("«چرا کنارش می‌گذاری؟»"); if (!d.src) miss.push("«این دلیل از کجاست؟»"); }
      else {
        if (txt(d.chkHow).length < 3) miss.push("«وارسیِ نتیجه»"); if (!d.chkRes) miss.push("«نتیجهٔ وارسی»");
        [["other", "راهِ دیگر"], ["glance", "در یک نگاه"], ["worked", "چه کار کرد"]].forEach(function (x) { if (toks(d[x[0]]).length < 2) miss.push("«" + x[1] + "»"); });
        if (txt(d.use).length < 5) miss.push("«درسِ تو»"); if (txt(d.newProb).length < 5) miss.push("«مسئلهٔ تازه»");
        if (g && g.guess && !d.hit) miss.push("«داوریِ حدس»");
      }
      if (Qs.length && !d.best) miss.push("«کدام پرسش کمک کرد؟»");
      if (!d.want) miss.push("«خواستن در پایان»");
      /* A157: مسئلهٔ تازه باید تازه باشد — نه تقریباً همان صورت (همان سنجهٔ رونوشتِ ورزشِ گره‌ها، A.kNearCopy) */
      if (txt(d.newProb) && (near(d.newProb, r.p.statement) || near(d.newProb, r.p.title) || near(d.newProb, (u0 || {}).one))) miss.push("«مسئلهٔ تازه» تقریباً همان مسئلهٔ اصلی است — چیزی را عوض کن (مجهول، داده یا شرط)");
      /* «نزدیک ولی متفاوت»: با اصلی دست‌کم یک واژهٔ معنادار (مجهول، داده یا موضوع) مشترک دارد */
      else if (txt(d.newProb)) { var orig = toksSim([r.p.title, r.p.statement, (u0 || {}).u, (u0 || {}).one, (u0 || {}).d].join(" ")), nw = toksSim(d.newProb); if (!nw.some(function (w) { return hit(w, orig); })) miss.push("«مسئلهٔ تازه» هیچ چیزِ مشترکی با این مسئله ندارد — همان مجهول، داده یا روش را در وضعِ دیگری بگذار"); }
      unusedMiss(un, d.unused).forEach(function (x) { miss.push(x); });
      if (miss.length) { A.toast("اول این‌ها: " + miss.join("، "), "bad"); return; }
      var at = nowISO(), keep = {}; un.forEach(function (x) { keep[x.id] = { ans: d.unused[x.id].ans, why: txt(d.unused[x.id].why), t: x.t }; });
      var b = { state: L.state, chkHow: txt(d.chkHow), chkRes: d.chkRes, other: txt(d.other), glance: txt(d.glance), worked: txt(d.worked), use: txt(d.use), newProb: txt(d.newProb), unused: keep, want: d.want, at: at, done: true, from: "live" };
      if (Qs.length) { b.bestQ = d.best === "none" ? "" : Qs[+d.best]; L.bestQ = b.bestQ; }
      if (ab) { b.why = txt(d.why); b.src = d.src; b.gain = txt(d.gain); }
      s.b[1] = b; U.seed(s, "b");
      if (g && g.guess && d.hit) { g.hit = d.hit; g.hitAt = at; }
      var les = { lv: 1, use: b.use, newProb: b.newProb, glance: b.glance, at: at, live: true };
      if (b.use && A.newCard) { var cd = A.newCard("در مسئلهٔ «" + r.p.title + "» چه درسی گرفتی و کجای دیگر به کارش می‌بری؟ (بی‌نگاه)", b.use + (b.newProb ? "\nمسئلهٔ تازه‌ای که ساختی: " + b.newProb : "") + (b.worked ? "\nچه خوب کار کرد: " + b.worked : ""), { pb: pid, due: A.addDays(A.today(), 1) }); les.card = cd && cd.id; }
      if (b.use) s.lessons.push(les);
      /* «مسئلهٔ تازه‌ای که خودت ساختی» ⇒ مسئلهٔ حل‌نشدهٔ تازه، خفته تا پلهٔ دومِ نردبان، و در «امروز» برای حل برمی‌گردد (پولیا: مسئله بساز و حلش کن) */
      if (b.newProb) { var nr = create(clip(b.newProb, 80), b.newProb, typeOf(r, s), { origin: { type: "lprob", id: pid }, dormant: A.addDays(A.today(), LADDER[1]) }); b.newPid = nr.p.id; L.made = (L.made || []).concat([nr.p.id]); }
      if (ab) {
        var w = s.will = s.will || {}; w.steps = w.steps || []; w.log = w.log || [];
        var riv = U.nextIv(LADDER[0], true);
        w.drop = { at: at, why: b.why, src: b.src, trig: "live:abandon", due: A.addDays(A.today(), riv), iv: riv };
        w.log.push({ at: at, kind: "commit", trig: "live:abandon", desire: "drop", hope: "", budget: "" });
      }
      closeOpen(s, L.state);
      L.closedAt = at; delete BKD[pid]; S.put(pg); S.put(r);
      A.toast(ab ? "کنار گذاشتنِ آگاهانه ثبت شد؛ " + A.fdate(s.will.drop.due) + " یک بار می‌پرسد." : "بازنگری ثبت شد: درس، کارتِ مرور، و مسئلهٔ تازه‌ات " + A.fdate(A.addDays(A.today(), LADDER[1])) + " برمی‌گردد.");
      A.render();
    } }, ab ? "ثبتِ کنار گذاشتن" : "ثبتِ بازنگری"),
      h("button", { class: "btn ghost sm lp-reopen", type: "button", onclick: function () { L.state = "open"; S.put(pg); A.go("lprob", pid, "exec"); } }, "برگرد — هنوز حل نشده")));
    return box;
  }
  function backSummary(s) {
    var b = s.b && s.b[1]; if (!b || !b.done) return null;
    return h("div", { class: "small lp-lbsum" }, h("p", {}, b.state === "abandoned" ? "کنار گذاشته شد: «" + (b.why || "") + "»" : "حل شد — وارسی: " + (b.chkRes || "")),
      b.use ? h("p", {}, "درس: " + b.use) : null, b.newProb ? h("p", {}, "مسئلهٔ تازه‌ات: " + b.newProb + (b.newPid && A.liveRec(b.newPid) ? "" : "")) : null,
      b.bestQ ? h("p", { class: "muted" }, "پرسشی که بیشتر کمک کرد: «" + b.bestQ + "»") : null,
      b.newPid && rec(b.newPid) ? h("button", { class: "linkish", type: "button", onclick: function () { A.go("lprob", b.newPid); } }, "🔭 مسئلهٔ تازه‌ات") : null);
  }

  /* ---------- صفحهٔ یک مسئلهٔ حل‌نشده ---------- */
  /* بخشی که خودت باز یا بسته کردی با بازسازیِ صفحه (مثلاً پس از انتخابِ یک گزینه) همان می‌ماند */
  var SECO = {};
  function sec(key, title, open, body, cls) {
    var sk = (A.state && A.state.arg) + "|" + key, op = SECO[sk] != null ? SECO[sk] : open;
    var det = h("details", { class: "card lp-sec " + (cls || ""), "data-sec": key, open: op ? true : null }, h("summary", {}, h("strong", {}, title)));
    det.addEventListener("toggle", function () { SECO[sk] = det.open; });
    (Array.isArray(body) ? body : [body]).forEach(function (b) { if (b) det.appendChild(b); });
    return det;
  }
  var LAST_NAV = "";
  A.V.lprob = function (pid, sub) {
    var nav = pid + "|" + (sub || ""); if (nav !== LAST_NAV) { LAST_NAV = nav; Object.keys(SECO).forEach(function (k) { if (k.indexOf(pid + "|") === 0) delete SECO[k]; }); }
    var r = rec(pid); if (!r) return A.empty("مسئله پیدا نشد.", h("button", { class: "btn", onclick: function () { A.go("e_prob", null, "live"); } }, "مسئله‌های حل‌نشده"));
    var pg = pgOf(pid), s = solOf(pg), L = live(s), t = A.today();
    /* «🌱» ِ رها کردن: «نه — دوباره پیش می‌برمش» ⇒ مسئله دوباره باز */
    if (L.state === "abandoned" && s.will && !s.will.drop && (s.will.log || []).some(function (x) { return x.kind === "drop-recheck" && x.keep === "back" && String(x.at) > String(L.stateAt || ""); })) { L.state = "open"; L.backAt = nowISO(); delete s.b[1]; S.put(pg); }
    var ph = phaseOf(s), want = sub === "u" || sub === "plan" || sub === "exec" || sub === "back" ? { u: "u", plan: "p", exec: "c", back: "b" }[sub] : ph;
    var root = h("div", { class: "page lp-page", dir: "rtl" });
    var strip = h("div", { class: "row gap wrap lp-strip" }, ["u", "p", "c", "b"].map(function (k) { return h("span", { class: "chip" + (k === ph ? " on" : ""), "data-ph": k }, PHN[k]); }));
    root.appendChild(A.head("🔭 مسئلهٔ حل‌نشدهٔ خودم · " + PHN[ph], r.p.title, r.p.statement, h("div", { class: "col gap" }, strip,
      h("div", { class: "row gap wrap" }, h("button", { class: "btn ghost sm", type: "button", onclick: function () { A.go("e_prob", null, "live"); } }, "← مسئله‌های حل‌نشده"),
        ph !== "u" && ph !== "done" ? h("button", { class: "btn ghost sm lp-stuck", type: "button", onclick: function () { stuck(r, pg, s, null); } }, "🪢 گیر کرده‌ام — گره‌گشا با همین مسئله") : null,
        r.origin && r.origin.type === "lprob" && rec(r.origin.id) ? h("button", { class: "linkish small", type: "button", onclick: function () { A.go("lprob", r.origin.id); } }, "از بازنگریِ «" + clip(rec(r.origin.id).p.title, 40) + "»") : null))));
    if (r.dormant && r.dormant > t && !r.woke) root.appendChild(h("p", { class: "card soft small lp-dormnote" }, "این مسئله را خودت در بازنگری ساختی؛ " + A.fdate(r.dormant) + " برای حل برمی‌گردد — می‌توانی همین حالا هم شروعش کنی."));
    /* برگشتِ مسئلهٔ ساختهٔ خودت: «شروع می‌کنم» یا «فعلاً نه» — «فعلاً نه» یک پله دورتر روی همان نردبان (۳ ⇐ ۷ ⇐ ۲۱ ⇐ ۶۰)، نه هر روز */
    if (r.dormant && r.dormant <= t && !r.woke) root.appendChild(h("section", { class: "card soft lp-wake" }, h("p", { class: "small" }, "مسئله‌ای که خودت در بازنگری ساختی برگشته است. حالا حلش می‌کنی؟"),
      h("div", { class: "row gap wrap" }, h("button", { class: "btn sm lp-wakego", type: "button", onclick: function () { r.woke = nowISO(); S.put(r); A.go("lprob", pid, "u"); } }, "شروع می‌کنم"),
        h("button", { class: "btn ghost sm lp-snooze", type: "button", onclick: function () { var iv = U.nextIv(r.dIv || LADDER[1], true); r.dIv = iv; r.snoozes = (r.snoozes || 0) + 1; r.dormant = A.addDays(t, iv); S.put(r); A.toast("باشد؛ " + A.fdate(r.dormant) + " دوباره می‌پرسد."); A.go("e_prob", null, "live"); } }, "فعلاً نه"))));
    try { var rv = U.reviewPanel(r.p, pg); if (rv) root.appendChild(rv); } catch (e) { console.warn(e); }
    try { var wd = A.willDue ? A.willDue().filter(function (x) { return x.kind === "prob" && x.id === pid; }) : []; if (wd.length) { var hs = A.willHost("prob", pid); if (hs) root.appendChild(A.willCard(hs, "due")); } } catch (e) { console.warn(e); }
    var os = openStep(s);
    if (os && os.due <= t && ph === "c") root.appendChild(outcomeCard(r, pg, s, os));
    /* فهم */
    root.appendChild(sec("u", "۱) فهمِ مسئله" + (uOf(s) && ph !== "u" ? " ✓" : ""), want === "u", ph === "u" ? uCard(r, pg, s) : [uSum(s),
      ph !== "done" ? h("button", { class: "btn ghost sm lp-reu2", type: "button", onclick: function () { L.reU = true; S.put(pg); A.go("lprob", pid, "u"); } }, "↺ دوباره فهمِ مسئله") : null]));
    if (ph === "u") return root;
    /* طرح */
    var planBody = [askCard(r, pg, s), relatedCard(r, pg, s), backCard(r, pg, s), auxCard(r, pg, s), movesCard(r, pg, s), planCard(r, pg, s)];
    root.appendChild(sec("p", "۲) طرح" + (L.plan && L.plan.at ? " ✓" : ""), want === "p", planBody));
    /* اجرا */
    var exBody = [];
    if (!(L.plan && L.plan.at)) exBody.push(h("p", { class: "small muted" }, "اول طرحت را ثبت کن (بخشِ ۲) — بعد گامِ واقعیِ بعد، با پیش‌بینی."));
    else if (ph === "c") {
      exBody.push(stepsList(s));
      if (os && os.due > t) exBody.push(h("div", { class: "card soft small lp-cur" }, "گامِ جاری: «" + os.text + "» — وارسی " + A.fdate(os.due) + " ",
        h("button", { class: "btn ghost sm lp-early", type: "button", onclick: function () { os.due = t; var f0 = os.fc && S.get(os.fc); if (f0) { f0.due = t; S.put(f0); } S.put(pg); A.render(); } }, "زودتر انجامش دادم — نتیجه را ثبت کنم")));
      if (!os) { exBody.push(afterCard(r, pg, s)); exBody.push(stepForm(r, pg, s)); }
      exBody.push(h("div", { class: "row gap wrap lp-endrow" },
        h("button", { class: "btn ghost sm lp-solved", type: "button", onclick: function () { L.state = "solved"; L.stateAt = nowISO(); S.put(pg); A.go("lprob", pid, "back"); } }, "✅ حل شد — بازنگری"),
        h("button", { class: "btn ghost sm lp-abandon", type: "button", onclick: function () { L.state = "abandoned"; L.stateAt = nowISO(); S.put(pg); A.go("lprob", pid, "back"); } }, "⏹ آگاهانه کنارش می‌گذارم")));
    } else exBody.push(stepsList(s));
    root.appendChild(sec("c", "۳) اجرا روی واقعیت", want === "c", exBody));
    root.appendChild(sec("claims", "ادعاهای درونِ مسئله" + (L.claims.length ? " (" + fa(L.claims.length) + ")" : ""), want === "p" || want === "c", claimsCard(r, pg, s), "lp-claimsec"));
    if (ph === "b" || ph === "done") root.appendChild(sec("b", "۴) بازنگری", true, ph === "b" ? lookBack(r, pg, s) : backSummary(s)));
    try { if (A.HOST && A.HOST.upload && A.attachSection) root.appendChild(A.attachSection(r.id, { group: "مسئله‌های من", title: r.p.title || "مسئله" })); } catch (e) { console.warn(e); }
    return root;
  };
  /* e_prob با شناسهٔ مسئلهٔ زنده (پیوندهای «امروز»، 🌱، مرورِ فاصله‌دار، آینهٔ درایو) ⇒ همین صفحه */
  var rawE = A.V.e_prob;
  if (rawE) A.V.e_prob = function (pid, tab) { if (pid && rec(pid)) return A.V.lprob(pid, tab === "sim" ? null : tab); return rawE.apply(this, arguments); };
  /* همهٔ خواننده‌های «مسئله» (🌱، مرورِ فاصله‌دار، کارنامه) این مسئله را هم بیابند — بی آن‌که در شبیه‌ساز، حرکت‌ها یا گرافِ «prob» بیاید (A.probs دست نمی‌خورد) */
  var rawG = A.getProb;
  if (rawG) A.getProb = function (id) { var p = rawG(id); if (p) return p; var r = rec(id); return r ? r.p : p; };

  /* ---------- «امروز»: یک سطر برای هر نوع ---------- */
  A.liveDue = function () {
    var t = A.today(), steps = [], back = [];
    lives().forEach(function (r) {
      if (r.dormant && r.dormant <= t && !r.woke) back.push(r);
      var pg = S.get("eprog_" + r.p.id); if (!pg || !pg.solve || !pg.solve.live) return;
      var s = solOf(pg), o = openStep(s); if (o && o.due <= t && phaseOf(s) === "c") steps.push({ r: r, st: o });
    });
    return { steps: steps, back: back };
  };
  if (typeof A.dueList === "function" && !A.dueList._live) {
    var rawDue = A.dueList;
    A.dueList = function () {
      var items = rawDue.apply(this, arguments) || [];
      try {
        var D = A.liveDue();
        if (D.steps.length === 1) { var x = D.steps[0]; items.push({ k: "knot", live: 1, txt: "🔭 گامِ واقعی: «" + clip(x.st.text, 70) + "» — انجامش دادی؟ چه شد؟", sub: "«" + clip(x.r.p.title, 50) + "» · پیش‌بینی‌ات: «" + clip(x.st.pred, 60) + "»", go: function () { A.go("lprob", x.r.p.id, "exec"); } }); }
        else if (D.steps.length > 1) items.push({ k: "knot", live: D.steps.length, txt: "🔭 " + fa(D.steps.length) + " گامِ واقعی موعدِ وارسی است — انجامش دادی؟ چه شد؟", sub: D.steps.slice(0, 3).map(function (y) { return "«" + clip(y.r.p.title, 40) + "»"; }).join(" · "), go: function () { A.go("lprob", D.steps[0].r.p.id, "exec"); } });
        if (D.back.length === 1) { var b = D.back[0]; items.push({ k: "knot", live: 1, txt: "🧩 مسئلهٔ تازه‌ای که خودت ساختی برگشت: «" + clip(b.p.title, 70) + "»", sub: "از بازنگریِ یک مسئلهٔ دیگر — حالا حلش کن", go: function () { A.go("lprob", b.p.id, "u"); } }); }
        else if (D.back.length > 1) items.push({ k: "knot", live: D.back.length, txt: "🧩 " + fa(D.back.length) + " مسئلهٔ تازه‌ای که خودت ساختی برگشت", sub: D.back.slice(0, 3).map(function (y) { return "«" + clip(y.p.title, 40) + "»"; }).join(" · "), go: function () { A.go("lprob", D.back[0].p.id, "u"); } });
      } catch (e) { console.warn(e); }
      return items;
    };
    A.dueList._live = true;
  }

  /* ---------- نما و منو ---------- */
  A.VIEW_META = A.VIEW_META || {};
  A.VIEW_META.lprob = { j: "untie", what: "یک مسئلهٔ حل‌نشدهٔ خودت (تصمیم، پروژه، پرسشِ فکری) در همان تونلِ حل: فهم با فهرستِ داده‌ها، طرح با یک پرسش در هر نوبت، گام‌های واقعی با پیش‌بینی و نتیجه در موعد، بازنگری.",
    why: "تا روشِ حلِ مسئله روی زندگیِ واقعی‌ات کار کند — داور واقعیت است، نه پاسخِ ذخیره‌شده؛ پیش‌بینی‌هایت کالیبره می‌شوند و درس‌ها برمی‌گردند.", next: [["e_prob", "مسئله‌های من"]] };
  A.SUB_VIEWS = A.SUB_VIEWS || {}; if (!A.SUB_VIEWS.lprob) A.SUB_VIEWS.lprob = "e_prob";

  /* ---------- دستیار: ساختن از حرفِ خودِ کاربر، و پرسشِ یکی‌یکی در مرحلهٔ همین مسئله (فقط وقتی به کار است) ---------- */
  var AS = A.ASSIST;
  if (AS) {
    AS.DO = AS.DO || {};
    /* {"do":"live_new","title":"…","statement":"عینِ حرفِ کاربر","kind":"find|prove|pod"} — فقط صورت؛ فهم، داده‌ها، پیش‌بینی و نتیجه را خودِ کاربر می‌نویسد */
    AS.DO.live_new = function (a) {
      var st = clip(a && a.statement, 1500), ti = clip((a && a.title) || st, 80);
      if (txt(st).length < 10) return "مسئله ثبت نشد: «statement» (عینِ حرفِ کاربر، دست‌کم یک جمله) لازم است";
      var s0 = AS._turnSession, r = create(ti, st, a && a.kind, { by: "assistant", sess: (s0 && s0.id) || "" });
      if (s0) s0.lprob = r.p.id;
      return "";
    };
    if (typeof AS.solvingCtx === "function") {
      /* معلمِ عامِ حل مرحله را از شبیه‌ساز می‌خواند؛ مسئلهٔ زنده قلابِ خودش را دارد (پایین) — دو معلم با دو مرحله هم‌زمان نه */
      var rawCtx = AS.solvingCtx;
      AS.solvingCtx = function (s) { var c = rawCtx.apply(this, arguments); if (c && c.p && c.p.live) return null; var st = A.state || {}; if (st.view === "lprob") return null; return c; };
    }
    var RULES = "# مسئلهٔ واقعیِ حل‌نشده («🔭 مسئلهٔ حل‌نشدهٔ خودم»)\n- اگر کاربر مسئلهٔ واقعیِ بازی آورد که پاسخش را نمی‌داند (تصمیم، پروژه، پرسشِ فکری) و می‌خواهد حلش کند، با {\"do\":\"live_new\",\"title\":\"…\",\"statement\":\"عینِ حرفِ خودش\"} ثبتش کن و او را با {\"do\":\"go\",\"view\":\"lprob\",\"arg\":\"<شناسه>\"} به صفحه‌اش ببر (شناسه را در نوبتِ بعد از «مسئلهٔ زندهٔ این سشن» بخوان) — یا او را به «مسئله‌های بزرگ › 🔭 مسئلهٔ حل‌نشدهٔ خودم» ببر.\n- حلش نکن و تصمیم را جای او نگیر؛ هیچ فیلدِ فهم، داده، پیش‌بینی، نتیجه یا بازنگری را پر نکن (data-own). هر نوبت فقط یک پرسش، از کلی به خاص.";
    /* فقط وقتی خودِ کاربر از یک تصمیم یا مسئلهٔ بازِ زندگی‌اش می‌گوید — نه «فونتِ صفحه ریز است»، نه «کارتِ مرور حل نشده» */
    var LIVE_RE = /نمی[‌\s]?(?:دونم|دانم)\s*(?:چی[‌\s]?کار|چه[‌\s]*کار|کدوم|کدام)\s*(?:کنم|رو|را|بکنم|انتخاب)|(?:باید|می[‌\s]?خوام|می[‌\s]?خواهم)\s*(?:یه|یک)?\s*تصمیم\s*(?:بگیرم|بگیریم)|بین\s+[^.؟?]{2,60}\s+(?:انتخاب\s*کنم|تصمیم\s*بگیرم)|(?:بپذیرم|قبول\s*کنم|برم|بمونم|بمانم)\s*یا\s*(?:نه|نپذیرم|بمونم|بمانم|برم)|مسئله(?:‌ای)?\s+(?:تو|در)\s+زندگی(?:‌ام|م)?|گیر\s*کرده‌?ام\s*(?:سرِ|سر|توی|در)\s*(?:تصمیم|انتخاب|پروژه)/;
    AS.promptHooks = AS.promptHooks || [];
    AS.promptHooks.push(function (s, msg) { var recent = [String(msg || "")].concat(((s && s.msgs) || []).filter(function (m) { return m.role === "user"; }).slice(-4).map(function (m) { return m.text; })).join(" "); return LIVE_RE.test(recent) ? RULES : ""; });
    var EXEC_Q = ["پیش از این گام: فکر می‌کنی چه می‌شود، و چقدر مطمئنی؟", "روشن می‌بینی که این گام به مجهول نزدیکت می‌کند — به کدام داده تکیه دارد؟", "کی انجامش می‌دهی؟ روزش را بگو تا همان روز بپرسم چه شد.", "آنچه شد با پیش‌بینی‌ات چه فاصله‌ای داشت — و این فاصله دربارهٔ فهمت از مسئله چه می‌گوید؟"];
    AS.promptHooks.push(function (s, msg) {
      var st = A.state || {}, onPage = st.view === "lprob" || (st.view === "e_prob" && rec(st.arg)), pid = onPage ? st.arg : (s && s.lprob), r = rec(pid); if (!r) return "";
      var pg = pgOf(pid), so = solOf(pg), ph = phaseOf(so), TQ = AS.tutorQuestions || {};
      if (ph === "done") return "";   // مسئلهٔ بسته‌شده دیگر «مسئلهٔ زندهٔ این سشن» نیست
      /* بیرون از صفحهٔ خودش فقط وقتی پیام دربارهٔ همین مسئله است (دست‌کم دو واژهٔ معنادارِ مشترک با عنوان/صورت/مجهول) */
      if (!onPage) { var mt0 = toks(msg), pt = toks([r.p.title, r.p.statement, (uOf(so) || {}).u].join(" ")); if (mt0.filter(function (w) { return hit(w, pt); }).length < 2) return ""; }
      var Q = ph === "u" ? ((TQ.und && TQ.und.qs) || []) : ph === "p" ? (A.solveAskList ? A.solveAskList("p", 1, typeOf(r, so)) : []) : ph === "c" ? EXEC_Q : ((TQ.back && TQ.back.qs) || []);
      var tu = (s && (s.lpTutor = s.lpTutor || {})) || {}, k = pid + "|" + ph, mt = String(msg || "").trim();
      if (mt && !/^\[سامانه/.test(mt) && tu.last !== mt) { tu[k] = tu.last == null || tu.ph !== k ? (tu[k] || 0) : (tu[k] || 0) + 1; tu.last = mt; tu.ph = k; }
      var qi = Q.length ? (tu[k] || 0) % Q.length : 0, un = unusedOf(so, pg), o = openStep(so);
      return ["# مسئلهٔ زندهٔ این سشن (" + pid + "): «" + clip(r.p.title, 80) + "» · مرحله: " + PHN[ph],
        "- پاسخِ این مسئله را هیچ‌کس نمی‌داند — نه تو نه صفحه. حلش نکن، تصمیم را جای او نگیر، و دربارهٔ درستیِ گام‌ها یا تصمیمش داوری نکن (داور واقعیت و داوریِ خودِ اوست). فیلدهای صفحه را پر نکن (data-own).",
        Q.length ? "- در این نوبت فقط **یک** پرسش، از همین فهرست و از کلی به خاص؛ پرسشِ پیشنهادیِ این نوبت: «" + Q[qi] + "». اگر با وضعِ همین لحظه نمی‌خواند، پرسشِ بعدیِ همین فهرست." : "",
        un.length && ph !== "u" ? "- داده‌هایی که هنوز به کار نرفته‌اند (اگر به کار آمد، یکی را با نامش بپرس: «از … استفاده کردی؟»): " + un.map(function (d) { return "«" + clip(d.t, 50) + "»"; }).join("، ") : "",
        o ? "- گامِ واقعیِ باز: «" + clip(o.text, 80) + "» · پیش‌بینی‌اش «" + clip(o.pred, 80) + "» · وارسی " + o.due + " — نتیجه را خودش در صفحه ثبت می‌کند." : ""].filter(Boolean).join("\n");
    });
  }
})(APP);
