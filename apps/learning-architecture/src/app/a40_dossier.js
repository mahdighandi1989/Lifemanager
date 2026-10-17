/* ===== «📜 پروندهٔ کامل» و «✏️ اصلاح» (دورِ ۱۹b ِ تورِ پولیا، DECISIONS_R19b: INF16 و سویِ صفحهٔ INF15) — a40_dossier.js =====
   مالک (۲۰۲۶-۱۰-۱۷): «یک جا که همهٔ مسیرِ یک مسئله را ببینم» و «اصلاحِ پیامِ قبلی باید همه‌چیز را دنبالش ببرد».
   • پرونده فقط‌خواندنی و **ساخته از خودِ رکوردهاست** (نسخهٔ دوم نمی‌سازد): صورت، فرمِ فهم همان‌طور که پر شد با تاریخچه‌اش (و اصلاح‌ها «اصلاح شد ⇐»)،
     حدس/طرح/گام‌ها با نتیجه، حکمِ وارسی، بازنگری، اصلاح‌ها، پیامِ گفت‌وگویی که هر رکورد از آن آمد (پیوند به سشن) و اثرِ هر کنش بر کارنامهٔ ذهن.
     فرمول‌ها با APP.MATH (a39)؛ برون‌بُرد Markdown/HTML با همان بخش‌ها و همان ترتیب. فهرستِ «همهٔ کارها» (مسئله، ایده، پروندهٔ کارخانه، سشن)
     به ترتیبِ آخرین فعالیت. ورودی‌ها: سرِ صفحهٔ مسئله (a38)، سشنِ دستیار (AS.sessTools)، خطِ زمانیِ کارنامهٔ ذهن (پوششِ همین فایل بر A.V.mind).
   • «✏️ اصلاح» روی حبابِ خودِ کاربر (AS.msgTools ِ a26): ویرایشگرِ کوچکِ برچسب‌دار؛ ذخیره ⇒ A.retractMsg (a38) همان دم برمی‌گرداند (کاربر داور است،
     بی مدل) و نوبتِ «[اصلاحِ پیامِ قبلی] …» فرستاده می‌شود. متنِ یکسان/خالی/انصراف ⇒ هیچ. */
(function (A) {
  if (!A.S || !A.V) return;
  var h = A.h, fa = A.fa, S = A.S;
  function txt(t) { return String(t == null ? "" : t).replace(/\s+/g, " ").trim(); }
  function clip(t, n) { var s = txt(t); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function sysTurn(t) { return /^\s*\[(?:سامانه|اصلاحِ پیامِ قبلی)/.test(String(t || "")); }
  function isTest(x) { return !!(x && (x.sample || x.test || x.seed || x.tourTest || x.runner)); }
  function day(at) { return String(at || "").slice(0, 10); }
  function hm(at) { var d = new Date(at); if (!at || isNaN(d)) return ""; return fa(String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0")); }
  /* فرمول: TeX ِ بی‌$ («\frac{n(n+1)}{2}») هم فرمول است — هرگز TeX ِ خام */
  function texWrap(t) { var s = String(t == null ? "" : t); if (!/\\[A-Za-z]{2,}/.test(s) || s.indexOf("$") >= 0) return s;
    return s.replace(/[^\u0600-\u06FF«»،؛؟\n]*\\[A-Za-z]{2,}[^\u0600-\u06FF«»،؛؟\n]*/g, function (m) { var a = m.match(/^\s*/)[0], z = m.match(/\s*$/)[0], c = m.trim(); return c ? a + "$" + c + "$" + z : m; }); }
  function mx(t) { var s = texWrap(t); try { if (s && A.MATH && A.MATH.has && A.MATH.has(s)) return A.MATH.nodes(s); } catch (e) { } return String(t == null ? "" : t); }
  function plain(t) { var s = texWrap(t); try { return A.MATH && A.MATH.toPlain ? A.MATH.toPlain(s) : s; } catch (e) { return s; } }
  function htm(t) { var s = texWrap(t); try { if (A.MATH && A.MATH.html && A.MATH.has(s)) return A.MATH.html(s); } catch (e) { } return esc(s); }
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function prog(pid) { var pg = S.get("eprog_" + pid); return (pg && pg.solve) || {}; }
  function liveOf(so) { var L = so.live || {}; ["steps", "claims", "aux"].forEach(function (k) { L[k] = L[k] || []; }); return L; }
  var DONE_FA = { yes: "انجام شد", part: "نیمه‌کاره", no: "انجام نشد" }, MATCH_FA = { yes: "با پیش‌بینی خواند", part: "تاحدی خواند", no: "با پیش‌بینی نخواند" };
  var VERD_FA = { verified: "وارسی شد — با پیام‌های خودت", maybe: "شاید — به گزارشِ گفت‌وگو، از پیام‌هایت سنجیده نشد", unverified: "وارسی نشد", proved: "اثبات شد", impossible: "ناممکن (اثبات شد)", range: "درست در دامنه", disproved: "رد شد" };
  var PH_FA = { u: "۱) فهمِ مسئله", p: "۲) طرحِ نقشه", c: "۳) اجرای طرح", b: "۴) بازنگری" };
  function sessionsOf(pid, r) { return S.all("achat", function (x) { return x && !isTest(x) && (x.lprob === pid || (r && r.sess === x.id) || (x.lprobLog || []).some(function (e) { return e && e.p === pid; })); }); }
  function srcOf(pid, obj) { try { return A.liveSrcMsg ? A.liveSrcMsg(pid, "", obj) : null; } catch (e) { return null; } }
  function histOf(owner, field) { return ((owner && owner.fixHist) || []).filter(function (x) { return !field || x.field === field; }).map(function (x) { return { at: x.at, old: x.old, new: x.new, why: x.why || "", by: x.by || "", src: x.src || "", sess: x.sess || "" }; }); }

  /* ---------- مدلِ پرونده (یک منبع برای صفحه و برون‌بُرد) ---------- */
  A.dossier = function (pid) {
    var r = A.liveRec ? A.liveRec(pid) : null; if (!r) { var r0 = S.get("eprob_" + pid); r = r0 && r0.p ? r0 : null; } if (!r) return null;
    var so = prog(pid), L = liveOf(so), u1 = so.u && so.u[1], g = so.g && so.g[1], b = so.b && so.b[1], ev = [];
    var ph = ""; try { ph = A.livePhase ? A.livePhase(pid) : ""; } catch (e) { }
    var add = function (o) { if (!o.at) o.at = ""; o.i = ev.length; ev.push(o); return o; };
    var born = r.created || (so.u && so.u[1] && so.u[1].at) || "";
    add({ k: "stmt", at: born, title: "صورتِ مسئله", lines: [r.p.statement], hist: histOf(r, "statement"), src: srcOf(pid, r.p) });
    (L.uHist || []).forEach(function (x, i) { add({ k: "uold", at: x.at, title: "فرمِ فهم — نسخهٔ پیشین " + fa(i + 1), lines: uLines(x), old: true }); });
    if (u1 && u1.done) add({ k: "u", at: u1.at, title: "فرمِ فهم (همان‌طور که پر شد)", lines: uLines(u1), hist: histOf(u1), src: srcOf(pid, u1), from: u1.from === "chat" ? "از گفت‌وگو" : "" });
    else if (L.uDraft) add({ k: "udraft", at: "", title: "فرمِ فهم — پیش‌نویسِ ثبت‌نشده", lines: uLines(L.uDraft), hist: histOf(L.uDraft), src: srcOf(pid, L.uDraft) });
    (L.restates || []).forEach(function (x) { add({ k: "restate", at: x.at, title: "بیانِ تازهٔ مسئله", lines: [x.why] }); });
    (L.guessHist || []).forEach(function (x) { add({ k: "gold", at: x.at, title: "حدسِ پیشین", lines: [x.guess], out: x.refutedAt ? "رد شد" : "", mind: [{ row: "حدس/کالیبراسیون", sign: x.refutedAt ? "−" : "" }], old: true }); });
    if (g && (g.guess || g.withdrawn || (g.fixHist || []).length)) {
      var refuted = g.hit === "نادرست بود" || L.steps.some(function (st) { return st.out && st.out.guess && st.out.guess.rel === "refute"; }), conf = L.steps.some(function (st) { return st.out && st.out.guess && st.out.guess.rel === "confirm"; });
      var gout = g.withdrawn ? "پس گرفته شد" : g.hit ? "داوریِ خودت: " + g.hit : refuted ? "رد شد" : conf ? "پیامدی تأیید شد" : "هنوز آزموده نشده";
      add({ k: "guess", at: g.at, title: "حدس", lines: [g.guess || (g.withdrawn ? g.withdrawn.old : "")].concat(g.conf ? ["اطمینان: " + fa(g.conf) + "٪"] : []).concat(g.test ? ["آزمون: " + g.test] : []), out: gout, hist: histOf(g), src: srcOf(pid, g),
        from: /^chat/.test(String(g.from || "")) || g.chatFrom ? "از گفت‌وگو" : "", withdrawn: !!g.withdrawn,
        mind: g.withdrawn ? [{ row: "حدس/کالیبراسیون", sign: "", withdrawn: true }] : g.hit || refuted ? [{ row: "حدس/کالیبراسیون", sign: g.hit === "درست بود" ? "+" : refuted || g.hit === "نادرست بود" ? "−" : "±" }] : [] });
    }
    if (L.plan && L.plan.at) add({ k: "plan", at: L.plan.at, title: "طرح", lines: [L.plan.t, L.plan.t2].filter(Boolean).concat(L.plan.due ? ["موعد: " + A.fdate(L.plan.due)] : []), hist: histOf(L.plan), src: srcOf(pid, L.plan) });
    L.steps.forEach(function (st, i) {
      add({ k: "step", at: st.at, title: "گامِ " + fa(i + 1) + " (طرح‌ریزی)", lines: [st.text].concat(st.pred ? ["پیش‌بینی: " + st.pred + (st.conf ? " (" + fa(st.conf) + "٪)" : "")] : []).concat(st.due ? ["موعد: " + A.fdate(st.due)] : []).concat(st.proof ? ["برهان: " + st.proof] : []),
        hist: histOf(st, "due").concat(histOf(st, "text")), src: null, sid: st.id });
      var o = st.out, H = histOf(st, "out").concat(histOf(st, "what"));
      (st.fixHist || []).filter(function (x) { return x.field === "out" && x.old; }).forEach(function (x) {
        var w = x.old; add({ k: "stepold", at: w.at || x.at, title: "گامِ " + fa(i + 1) + " — نتیجهٔ پس‌گرفته", lines: [(DONE_FA[w.done] || w.done || "") + (w.what ? " — " + w.what : "")], out: "پس گرفته شد (" + (x.why || "اصلاح شد") + ")", old: true, withdrawn: true,
          mind: [{ row: "اجرا", sign: w.done === "yes" && w.match !== "no" ? "+" : w.done === "no" || w.match === "no" ? "−" : "±", withdrawn: true }], sid: st.id }); });
      if (o) add({ k: "out", at: o.at, title: "گامِ " + fa(i + 1) + " — نتیجه", lines: [(o.unk ? "نامعلوم" : DONE_FA[o.done] || o.done || "") + (o.match ? " · " + (MATCH_FA[o.match] || o.match) : "") + (o.what ? " — " + o.what : "")].concat(o.chatPrev ? ["گزارشِ گفت‌وگو پیش از اصلاحِ خودت در فرم: " + (DONE_FA[o.chatPrev.done] || o.chatPrev.done) + (o.chatPrev.what ? " — " + o.chatPrev.what : "")] : []),
        out: st.closed ? "بسته" : o.pending ? "هنوز در فرم تأیید نشده" : "", from: o.from === "chat" ? "از گفت‌وگو" : "", hist: H, src: srcOf(pid, st), sid: st.id,
        mind: o.unk ? [] : [{ row: "اجرا", sign: o.done === "yes" && o.match !== "no" ? "+" : o.done === "no" || o.match === "no" ? "−" : "±" }] });
      else if (!st.closed && !(st.fixHist || []).length) { /* گامِ باز: همان سطرِ طرح‌ریزی بس است */ }
    });
    L.claims.forEach(function (c) { add({ k: "claim", at: c.at, title: "ادعای درونِ مسئله", lines: [c.t], out: c.caseId ? "پرونده در کارخانه" : "" }); });
    L.aux.forEach(function (x) { add({ k: "aux", at: x.at, title: "مسئلهٔ کمکی", lines: [x.t, x.bridge ? "پل: " + x.bridge : ""].filter(Boolean) }); });
    if (L.chat && L.chat.solution) add({ k: "ans", at: L.chat.at, title: "جوابی که در گفت‌وگو گفتی", lines: [L.chat.solution], hist: histOf(L.chat), src: srcOf(pid, L.chat), from: "از گفت‌وگو" });
    if (b && (b.verdict || (b.verdictHist || []).length)) add({ k: "verdict", at: (b.superseded && b.superseded.at) || b.at, title: "حکمِ وارسی", lines: [VERD_FA[b.verdict] || ("حکم: " + b.verdict)].concat(b.chkRes ? ["نتیجهٔ وارسی: " + b.chkRes] : []).concat((b.chkMsgs || []).map(function (t) { return "پیامِ وارسی: «" + t + "»"; })),
      hist: (b.verdictHist || []).map(function (x) { return { at: x.at, old: VERD_FA[x.verdict] || x.verdict, new: VERD_FA[b.verdict] || b.verdict, why: "کنار رفت ⇐ " + (x.why || "") }; }), out: b.superseded ? "حکمِ پیشین کنار رفت" : "" });
    if (b && b.done) add({ k: "back", at: b.at, title: "بازنگری", lines: [b.glance ? "در یک نگاه: " + b.glance : "", b.use ? "درس: " + b.use : "", b.chkHow ? "وارسی: " + b.chkHow : ""].filter(Boolean), from: b.from === "chat" ? "از گفت‌وگو" : "" });
    (L.retracts || []).forEach(function (x) { add({ k: "retract", at: x.at, title: "اصلاحِ پیامِ پیشین", lines: ["«" + x.frag + "» ⇐ «" + x.fix + "»"].concat(x.corr ? ["با پیامِ: «" + x.corr + "»"] : []).concat((x.changed || []).length ? x.changed.map(function (c) { return c.label + (c.old || c.new ? ": «" + clip(typeof c.old === "string" ? c.old : "", 80) + "» ⇐ «" + clip(typeof c.new === "string" ? c.new : "", 80) + "»" : ""); }) : ["چیزی از آن پیام ثبت نشده بود"]),
      src: x.sess ? msgRef(x.sess, x.mid) : null, out: x.by === "user" ? "با ✏️ ِ خودت" : "از گفت‌وگو" }); });
    if (L.state === "solved" || L.state === "abandoned") add({ k: "state", at: L.stateAt, title: L.state === "solved" ? "حل شد" : "آگاهانه کنار گذاشته شد", lines: [] });
    if (L.incub && L.incub.at) add({ k: "incub", at: L.incub.at, title: "کنار گذاشته تا فردا (مکث)", lines: [L.incub.back ? "بازگشت: " + L.incub.back : "هنوز برنگشته‌ای"] });
    /* رویدادهای کارنامهٔ ذهن (a29) که به همین مسئله مربوط‌اند — پس‌گرفته‌ها فعال شمرده نمی‌شوند */
    try { var M0 = A.MIND && A.MIND.model ? A.MIND.model() : null, tt = r.p.title;
      ((M0 && M0.events) || []).forEach(function (e) { var mine = e.pid === pid || (e.src && e.src.id === pid) || (tt && String(e.fa || "").indexOf("«" + tt + "»") >= 0); if (!mine) return;
        add({ k: "mind", at: e.at, title: "رویدادِ کارنامهٔ ذهن", lines: [e.fa], withdrawn: !!e.withdrawn, out: e.withdrawn ? "پس گرفته شد" : "" }); }); } catch (e) { }
    ev.sort(function (a, b2) { var x = String(a.at || "9999"), y = String(b2.at || "9999"); return x < y ? -1 : x > y ? 1 : a.i - b2.i; });
    var last = ev.reduce(function (m, e) { return e.at && e.at > m ? e.at : m; }, String(r.updated || ""));
    var stDone = ph === "done", reach = { u: !!(u1 && u1.done), p: !!(L.plan && L.plan.at), c: L.steps.some(function (x) { return x.out || x.closed; }) || L.steps.length > 0, b: !!(b && b.done) };
    var state = L.state === "solved" ? "حل شد" : L.state === "abandoned" ? "آگاهانه کنار گذاشته" : L.incub && L.incub.at && !L.incub.back ? "مکث — کنار گذاشته تا فردا" : r.dormant && r.dormant > A.today() && !r.woke ? "خفته تا " + A.fdate(r.dormant) : stDone ? "تمام شد" : "در جریان — " + (PH_FA[ph] || "");
    return { pid: pid, title: r.p.title, statement: r.p.statement, phase: ph, state: state, last: last, stages: ["u", "p", "c", "b"].map(function (k) { return { k: k, fa: PH_FA[k], reached: reach[k] }; }),
      sessions: sessionsOf(pid, r).map(function (x) { return { id: x.id, title: x.title || clip(((x.msgs || [])[0] || {}).text, 50) || "گفت‌وگو", last: x.updated || "" }; }), events: ev };
  };
  function uLines(u) { if (!u) return []; return [u.one ? "کل: " + u.one : "", u.u ? "مجهول/حکم: " + u.u : ""].concat((u.dl || []).filter(function (x) { return txt(x.t); }).map(function (x) { return "داده: " + x.t; })).concat([u.c ? "شرط: " + u.c : ""]).filter(Boolean); }
  function msgRef(sid, mid) { var se = S.get(sid); if (!se) return null; var m = (se.msgs || []).filter(function (x) { return x && A.liveMsgId && A.liveMsgId(x) === mid; })[0]; return m ? { sess: sid, mid: mid, text: m.text, at: m.at || "", title: se.title || "" } : { sess: sid, mid: mid, text: "", at: "" }; }
  function openSess(sid) { var AS = A.ASSIST; if (!AS) return; try { AS.store("cur", sid); AS.toggle(true); AS.paint(); } catch (e) { } }
  A.dossierLink = function (pid, label) { return h("button", { class: "linkish small lp-dlink", type: "button", "aria-label": "پروندهٔ کامل", onclick: function () { A.go("dossier", pid); } }, label || "📜 پروندهٔ کامل"); };

  /* ---------- همهٔ کارها، به ترتیبِ آخرین فعالیت ---------- */
  A.workIndex = function () {
    var o = [], mx0 = function () { var m = ""; for (var i = 0; i < arguments.length; i++) { var x = String(arguments[i] || ""); if (x > m) m = x; } return m; };
    S.all("eprob", function (r) { return r && r.p && !isTest(r) && r.status !== "rejected"; }).forEach(function (r) { var pg = S.get("eprog_" + r.p.id) || {}, live = !!(A.liveRec && A.liveRec(r.p.id));
      o.push({ type: "problem", fa: "🔭 مسئله", id: r.p.id, title: r.p.title || "مسئله", last: mx0(r.updated, pg.updated, r.created), go: live ? ["dossier", r.p.id] : ["e_prob", r.p.id], dossier: live }); });
    S.all("idea", function (x) { return !isTest(x); }).forEach(function (x) { o.push({ type: "idea", fa: "💡 ایده", id: x.id, title: x.title || "ایده", last: mx0(x.updated, x.created), go: ["idea", x.id] }); });
    S.all("case", function (x) { return !isTest(x); }).forEach(function (x) { o.push({ type: "case", fa: "⚖️ پروندهٔ کارخانه", id: x.id, title: x.title || "پرونده", last: mx0(x.updated, x.created), go: ["e_case", x.id] }); });
    S.all("achat", function (x) { return !isTest(x) && (x.msgs || []).length; }).forEach(function (x) { o.push({ type: "session", fa: "💬 سشنِ دستیار", id: x.id, title: x.title || clip(((x.msgs || [])[0] || {}).text, 50) || "گفت‌وگو", last: mx0(x.updated), sess: x.id }); });
    return o.sort(function (a, b) { return String(b.last).localeCompare(String(a.last)); });
  };

  /* ---------- برون‌بُرد ---------- */
  function evLines(e) { return (e.lines || []).filter(function (x) { return txt(x); }); }
  A.dossierMd = function (pid) {
    var D = A.dossier(pid); if (!D) return ""; var o = ["# 📜 پروندهٔ کامل — " + plain(D.title), "", "صورت: " + plain(D.statement), "", "وضع: " + D.state + " · مرحله‌ها: " + D.stages.map(function (s) { return s.fa + (s.reached ? " ✓" : " (هنوز نرسیده)"); }).join("، "), ""];
    if (D.sessions.length) o.push("گفت‌وگوها: " + D.sessions.map(function (s) { return "«" + s.title + "» (" + s.id + ")"; }).join("، "), "");
    var cd = null;
    D.events.forEach(function (e) { var d0 = day(e.at); if (d0 !== cd) { cd = d0; o.push("## " + (d0 ? A.fdate(d0) : "بی تاریخ"), ""); }
      o.push("### " + (hm(e.at) ? hm(e.at) + " — " : "") + e.title + (e.from ? " (" + e.from + ")" : "") + (e.withdrawn ? " — پس گرفته شد" : ""));
      evLines(e).forEach(function (l) { o.push("- " + plain(l)); });
      if (e.out) o.push("- سرانجام: " + plain(e.out));
      (e.hist || []).forEach(function (x) { o.push("- اصلاح شد ⇐ «" + plain(typeof x.old === "string" ? x.old : JSON.stringify(x.old)) + "» → «" + plain(typeof x.new === "string" ? x.new : x.new == null ? "باز" : JSON.stringify(x.new)) + "»" + (x.at ? " (" + A.fdate(day(x.at)) + ")" : "")); });
      if (e.src && e.src.text) o.push("- از پیامِ گفت‌وگو: «" + plain(clip(e.src.text, 200)) + "» (سشن " + e.src.sess + ")");
      (e.mind || []).forEach(function (m) { o.push("- کارنامهٔ ذهن: " + m.row + " " + (m.sign || "") + (m.withdrawn ? " (پس گرفته شد)" : "")); });
      o.push(""); });
    return o.join("\n");
  };
  A.dossierHtml = function (pid) {
    var D = A.dossier(pid); if (!D) return ""; var o = [], cd = null;
    o.push("<!doctype html><html lang=\"fa\" dir=\"rtl\"><head><meta charset=\"utf-8\"><title>" + esc("پروندهٔ کامل — " + D.title) + "</title><style>body{font-family:Vazirmatn,Tahoma,sans-serif;max-width:860px;margin:24px auto;padding:0 16px;line-height:1.8}h3{margin:.8em 0 .2em}.w{color:#888;text-decoration:line-through}.h{color:#666;font-size:.9em}</style></head><body dir=\"rtl\">");
    o.push("<h1>📜 پروندهٔ کامل — " + htm(D.title) + "</h1><p>صورت: " + htm(D.statement) + "</p><p>وضع: " + esc(D.state) + " · " + D.stages.map(function (s) { return esc(s.fa + (s.reached ? " ✓" : " (هنوز نرسیده)")); }).join("، ") + "</p>");
    D.events.forEach(function (e) { var d0 = day(e.at); if (d0 !== cd) { cd = d0; o.push("<h2>" + esc(d0 ? A.fdate(d0) : "بی تاریخ") + "</h2>"); }
      o.push("<section data-ev=\"" + e.k + "\"><h3" + (e.withdrawn ? " class=\"w\"" : "") + ">" + esc((hm(e.at) ? hm(e.at) + " — " : "") + e.title + (e.from ? " (" + e.from + ")" : "") + (e.withdrawn ? " — پس گرفته شد" : "")) + "</h3><ul>");
      evLines(e).forEach(function (l) { o.push("<li>" + htm(l) + "</li>"); });
      if (e.out) o.push("<li>سرانجام: " + htm(e.out) + "</li>");
      (e.hist || []).forEach(function (x) { o.push("<li class=\"h\">اصلاح شد ⇐ «" + htm(typeof x.old === "string" ? x.old : JSON.stringify(x.old)) + "» → «" + htm(typeof x.new === "string" ? x.new : x.new == null ? "باز" : JSON.stringify(x.new)) + "»</li>"); });
      if (e.src && e.src.text) o.push("<li class=\"h\">از پیامِ گفت‌وگو: «" + htm(clip(e.src.text, 200)) + "»</li>");
      (e.mind || []).forEach(function (m) { o.push("<li class=\"h\">کارنامهٔ ذهن: " + esc(m.row + " " + (m.sign || "") + (m.withdrawn ? " (پس گرفته شد)" : "")) + "</li>"); });
      o.push("</ul></section>"); });
    o.push("</body></html>"); return o.join("\n");
  };
  function download(name, mime, text) { try { var bl = new Blob([text], { type: mime + ";charset=utf-8" }), u = URL.createObjectURL(bl), a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 500); } catch (e) { A.toast("برون‌بُرد نشد: " + e.message, "bad"); } }

  /* ---------- نما ---------- */
  function indexView() {
    var L0 = A.workIndex();
    return h("div", { class: "page lp-dossier lp-windex", dir: "rtl" }, A.head("📚 همهٔ کارها", "به ترتیبِ آخرین فعالیت", "مسئله‌ها، ایده‌ها، پرونده‌های کارخانه و سشن‌های دستیار — هر کدام را باز کن؛ مسئلهٔ حل‌نشدهٔ خودت «📜 پروندهٔ کامل» دارد."),
      L0.length ? h("ol", { class: "card lp-wlist" }, L0.map(function (x) {
        return h("li", { "data-type": x.type, "data-id": x.id }, h("span", { class: "small muted" }, x.fa + " · " + (x.last ? A.fdate(day(x.last)) + " " + hm(x.last) : "") + " · "),
          h("button", { class: "linkish", type: "button", onclick: function () { if (x.sess) openSess(x.sess); else A.go(x.go[0], x.go[1]); } }, x.title), x.dossier ? [" ", A.dossierLink(x.id, "📜")] : null);
      })) : A.empty("هنوز کاری ثبت نشده."));
  }
  A.V.dossier = function (pid) {
    if (!pid) return indexView();
    var D = A.dossier(pid); if (!D) return A.empty("مسئله پیدا نشد.", h("button", { class: "btn", type: "button", onclick: function () { A.go("dossier"); } }, "📚 همهٔ کارها"));
    var safe = String(D.title || "dossier").replace(/[\\\/:*?"<>|]+/g, " ").slice(0, 60);
    var root = h("div", { class: "page lp-dossier", dir: "rtl", "data-pid": pid });
    root.appendChild(A.head("📜 پروندهٔ کامل · فقط‌خواندنی", mx(D.title), mx(D.statement), h("div", { class: "col gap" },
      h("p", { class: "small lp-dstate" }, "وضع: " + D.state),
      h("div", { class: "row gap wrap lp-dstages" }, D.stages.map(function (s) { return h("span", { class: "chip" + (s.reached ? " on" : ""), "data-ph": s.k }, s.fa + (s.reached ? "" : " — هنوز نرسیده")); })),
      h("div", { class: "row gap wrap" },
        h("button", { class: "btn ghost sm", type: "button", onclick: function () { A.go("lprob", pid); } }, "← صفحهٔ مسئله"),
        h("button", { class: "btn ghost sm", type: "button", onclick: function () { A.go("dossier"); } }, "📚 همهٔ کارها"),
        h("button", { class: "btn ghost sm lp-dmd", type: "button", onclick: function () { download(safe + ".md", "text/markdown", A.dossierMd(pid)); } }, "⬇️ Markdown"),
        h("button", { class: "btn ghost sm lp-dhtml", type: "button", onclick: function () { download(safe + ".html", "text/html", A.dossierHtml(pid)); } }, "⬇️ HTML"),
        h("button", { class: "btn ghost sm", type: "button", onclick: function () { try { window.print(); } catch (e) { } } }, "🖨 چاپ")))));
    if (D.sessions.length) root.appendChild(h("div", { class: "card soft small lp-dsess" }, h("strong", {}, "گفت‌وگوهای این مسئله: "), D.sessions.map(function (s, i) { return [i ? " · " : "", h("button", { class: "linkish", type: "button", onclick: function () { openSess(s.id); } }, "💬 " + s.title)]; })));
    var list = h("div", { class: "lp-devents" }), cd = null, box = null;
    D.events.forEach(function (e) {
      var d0 = day(e.at); if (d0 !== cd || !box) { cd = d0; list.appendChild(h("h3", { class: "lp-dday" }, d0 ? A.fdate(d0) : "بی تاریخ")); box = h("ol", { class: "lp-dlist" }); list.appendChild(box); }
      box.appendChild(h("li", { class: "card lp-dev" + (e.withdrawn ? " lp-dwd" : "") + (e.old ? " lp-dold" : ""), "data-ev": e.k, "data-title": e.title },
        h("p", {}, h("span", { class: "small muted" }, hm(e.at) ? hm(e.at) + " · " : ""), h("strong", {}, e.title), e.from ? h("span", { class: "small muted" }, " — " + e.from) : null, e.withdrawn ? h("span", { class: "small bad" }, " — پس گرفته شد") : null),
        evLines(e).length ? h("ul", { class: "small" }, evLines(e).map(function (l) { return h("li", {}, mx(l)); })) : null,
        e.out ? h("p", { class: "small lp-dout" }, "سرانجام: ", mx(e.out)) : null,
        (e.hist || []).length ? h("ul", { class: "small muted lp-dhist" }, e.hist.map(function (x) { return h("li", {}, "اصلاح شد ⇐ «", mx(typeof x.old === "string" ? x.old : x.old && x.old.what ? x.old.what : JSON.stringify(x.old)), "» → «", mx(typeof x.new === "string" ? x.new : x.new == null ? "باز" : x.new.done ? (DONE_FA[x.new.done] || x.new.done) : JSON.stringify(x.new)), "»" + (x.at ? " · " + A.fdate(day(x.at)) + " " + hm(x.at) : "")); })) : null,
        e.src && e.src.text ? h("p", { class: "small muted lp-dsrc" }, "از پیامِ گفت‌وگو: «", mx(clip(e.src.text, 200)), "» ", h("button", { class: "linkish small", type: "button", onclick: function () { openSess(e.src.sess); } }, "💬 باز کردنِ سشن")) : null,
        (e.mind || []).length ? h("p", { class: "small lp-dmind" }, "کارنامهٔ ذهن: ", e.mind.map(function (m) { return h("span", { class: "chip" + (m.withdrawn ? " lp-dwd" : ""), "data-row": m.row, "data-sign": m.sign || "" }, m.row + " " + (m.sign || "") + (m.withdrawn ? " (پس گرفته شد)" : "")); })) : null));
    });
    if (!D.events.length) list.appendChild(A.empty("هنوز رکوردی نیست."));
    root.appendChild(list);
    return root;
  };
  A.VIEW_META = A.VIEW_META || {};
  A.VIEW_META.dossier = { j: "untie", what: "پروندهٔ کامل: کلِ مسیرِ یک مسئله به ترتیبِ زمان و فقط‌خواندنی — صورت، فرمِ فهم همان‌طور که پر شد و اصلاح‌هایش، حدس/طرح/گام‌ها با نتیجه، حکمِ وارسی، بازنگری، پیامِ گفت‌وگویی که هر رکورد از آن آمد و اثرِ هر کنش بر کارنامهٔ ذهن؛ بی شناسه: «همهٔ کارها» به ترتیبِ آخرین فعالیت. برون‌بُرد Markdown/HTML.",
    why: "تا سفرِ کاملِ یک مسئله را در یک جا ببینی و بدانی هر چیز از کجا آمد و چه شد — بی نسخهٔ دوم؛ همه از خودِ رکوردها.", next: [["e_prob", "مسئله‌های من"]] };
  A.SUB_VIEWS = A.SUB_VIEWS || {}; if (!A.SUB_VIEWS.dossier) A.SUB_VIEWS.dossier = "e_prob";

  /* ---------- ورودی از خطِ زمانیِ کارنامهٔ ذهن ---------- */
  var rawMind = A.V.mind;
  if (rawMind && !rawMind._dossier) {
    A.V.mind = function () {
      var root = rawMind.apply(this, arguments);
      try {
        var lv = (A.liveAll ? A.liveAll() : []).filter(function (r) { return r && r.p && r.p.title && !isTest(r); });
        Array.prototype.slice.call(root.querySelectorAll("details")).forEach(function (d) {
          var sm = d.querySelector("summary"); if (!sm || !/خطِ زمانی/.test(sm.textContent)) return;
          Array.prototype.slice.call(d.querySelectorAll("li")).forEach(function (li) { var r = lv.filter(function (x) { return li.textContent.indexOf("«" + x.p.title + "»") >= 0; })[0]; if (r) { li.appendChild(document.createTextNode(" ")); li.appendChild(A.dossierLink(r.p.id, "📜")); } });
          d.appendChild(h("p", { class: "small lp-mindidx" }, A.dossierLinkAll ? A.dossierLinkAll() : h("button", { class: "linkish small", type: "button", onclick: function () { A.go("dossier"); } }, "📚 همهٔ کارها و پرونده‌های کامل")));
        });
      } catch (e) { console.warn(e); }
      return root;
    };
    A.V.mind._dossier = true;
  }

  /* ---------- دستیار: «📜» ِ مسئلهٔ سشن و «✏️ اصلاح» روی حبابِ خودِ کاربر ---------- */
  var AS = A.ASSIST;
  if (AS) {
    AS.sessTools = function (s) {
      var ids = []; var push = function (p) { if (p && A.liveRec && A.liveRec(p) && ids.indexOf(p) < 0) ids.push(p); };
      push(s.lprob); (s.lprobLog || []).slice().reverse().forEach(function (e) { push(e && e.p); });
      if (!ids.length) return null;
      return h("div", { class: "as-dos small", dir: "rtl" }, ids.slice(0, 3).map(function (p) { return h("button", { class: "linkish small as-doslink", type: "button", onclick: function () { A.go("dossier", p); } }, "📜 پروندهٔ کامل: «" + clip(A.liveRec(p).p.title, 40) + "»"); }));
    };
    var ED = null;   // { sid, mid, text }
    function nzq(t) { return String(t == null ? "" : t).replace(/[‌]/g, " ").replace(/\s+/g, " ").trim(); }
    /* ✏️: (۱) صفحه همان دم برمی‌گرداند (متنِ حباب هنوز پیشین) ⇐ (۲) نوبتِ «[اصلاحِ پیامِ قبلی] …» با مقدارِ درست ⇐ (۳) مربی انبارهای خودش را با
       AS.retractApply برمی‌گرداند (تکه هنوز در پیامِ پیشین است، نشانهٔ اصلاح و مقدارِ درست در نوبتِ تازه) ⇐ (۴) متنِ تازهٔ حباب (پیشین در textHist). */
    AS.retractEdit = function (s, m, newText) {
      if (!s || !m) return { ok: false, err: "پیام نیست" };
      var t = String(newText == null ? "" : newText);
      if (!t.trim()) return { ok: false, err: "متنِ خالی اصلاح نیست — پیام پاک نمی‌شود" };
      if (nzq(t) === nzq(m.text)) return { ok: false, same: true, err: "تغییری نکرد" };
      var res = A.retractMsg(s.id, m, t, { by: "user", keepText: true }); if (!res.ok) return res;
      var mid = A.liveMsgId(m);
      if (res.dup) { A.liveEditCommit(s.id, mid, t, { silent: true }); return res; }
      var c = (m.corr || [])[m.corr.length - 1] || {};
      var go = function () {
        var se = S.get(s.id) || s;
        AS.send("[اصلاحِ پیامِ قبلی] «" + clip(c.frag || "", 120) + "» ⇐ «" + clip(c.fix || "", 120) + "» — متنِ درستِ پیامم: «" + clip(t, 400) + "»");
        var ch = []; if (typeof AS.retractApply === "function") { try { var r2 = AS.retractApply(se, { msg: c.frag, what: res.what || "said", fix: c.fix }); if (r2 && Array.isArray(r2.ch)) ch = r2.ch; } catch (e) { console.warn(e); } }
        A.liveEditCommit(s.id, mid, t, { ch: ch }); try { AS.paint(); } catch (e) { }
      };
      (function wait(n) { if (!AS.busy()) go(); else if (n < 120) setTimeout(function () { wait(n + 1); }, 500); })(0);
      return res;
    };
    AS.msgTools = function (s, m) {
      if (!s || !m || m.role !== "user" || sysTurn(m.text)) return null;
      var mid = A.liveMsgId ? A.liveMsgId(m) : "", wrap = h("div", { class: "as-mtools small", dir: "rtl", "data-mid": mid });
      if ((m.corr || []).length) wrap.appendChild(h("span", { class: "muted as-corr" }, (m.corr || []).map(function (x, i) { return [i ? " · " : "", "اصلاح شد ⇐ «", mx(x.frag), "»"]; })));
      if (ED && ED.sid === s.id && ED.mid === mid) {
        var id = "asEd_" + String(mid).replace(/[^A-Za-z0-9]/g, "");
        var ta = h("textarea", { id: id, class: "as-edtx", rows: 2, dir: "auto", "aria-label": "متنِ درستِ این پیام" }); ta.value = ED.text; ta.addEventListener("input", function () { ED.text = ta.value; });
        wrap.appendChild(h("div", { class: "as-edit col gap" }, h("label", { for: id, class: "small" }, "متنِ درستِ این پیام (همهٔ رکوردهای ساخته از آن دنبالش می‌آیند؛ پیشین در تاریخچه می‌ماند)"), ta,
          h("div", { class: "row gap" },
            h("button", { class: "btn sm as-edsave", type: "button", onclick: function () { var r = AS.retractEdit(s, m, ta.value); if (!r.ok) { if (r.same) { ED = null; AS.paint(); } A.toast(r.err, r.same ? "" : "bad"); return; } ED = null; A.toast(r.dup ? "پیش‌تر همین اصلاح انجام شده بود؛ چیزِ تازه‌ای برنگشت." : r.note); AS.paint(); } }, "ذخیرهٔ اصلاح"),
            h("button", { class: "btn ghost sm as-edcancel", type: "button", onclick: function () { ED = null; AS.paint(); } }, "انصراف"))));
        setTimeout(function () { try { ta.focus(); } catch (e) { } }, 0);
      } else wrap.appendChild(h("button", { class: "linkish small as-editb", type: "button", "aria-label": "اصلاحِ این پیام", title: "این پیام را اصلاح کن — هر چه از آن ثبت شده دنبالش می‌آید", onclick: function () { ED = { sid: s.id, mid: mid, text: m.text }; AS.paint(); } }, "✏️ اصلاح"));
      return wrap;
    };
  }
})(APP);
