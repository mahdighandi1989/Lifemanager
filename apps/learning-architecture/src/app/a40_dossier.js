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
  /* دورِ ۲۱ (R4، D·11 «حکم: intuitive»): هر حکم با واژهٔ فارسی — کلیدِ ناشناخته هرگز خام */
  function verdFa(v) { return VERD_FA[v] || (A.LIVE_VERDICT_FA && A.LIVE_VERDICT_FA[v]) || "حکمِ ثبت‌شده"; }
  var WANT_FA = { more: "بیشتر می‌خواهم", same: "همان‌قدر", less: "کمتر", changed: "عوض شد — حالا چیزِ دیگری می‌خواهم" };
  var PH_FA = { u: "۱) فهمِ مسئله", p: "۲) طرحِ نقشه", c: "۳) اجرای طرح", b: "۴) بازنگری" };
  function sessionsOf(pid, r) { return S.all("achat", function (x) { return x && !isTest(x) && (x.lprob === pid || (r && r.sess === x.id) || (x.lprobLog || []).some(function (e) { return e && e.p === pid; })); }); }
  function srcOf(pid, obj) { try { return A.liveSrcMsg ? A.liveSrcMsg(pid, "", obj) : null; } catch (e) { return null; } }
  function histOf(owner, field) { return ((owner && owner.fixHist) || []).filter(function (x) { return !field || x.field === field; }).map(function (x) { return { at: x.at, old: x.old, new: x.new, why: x.why || "", by: x.by || "", src: x.src || "", sess: x.sess || "" }; }); }

  /* ---------- دورِ ۲۰ (RO6، DECISIONS_R20): یک دفترِ رویداد که پرونده از آن می‌خواند ----------
     هر کنش با زمانِ **رخ‌دادنش** (نه زمانِ ذخیره): زمانِ پیامی که از آن آمد (src.at)، وگرنه زمانِ ساختِ خودِ رکورد. منبع‌ها: رکوردهای مسئله (a38)، برنامه‌ها و
     اصلاح‌های گفت‌وگو (a27: s.plans، se.retracts، s.coach.retracts)، پاسخ به «این‌جا هم عوض شود؟»، مکث و بازگشت، میانهٔ راه، بیدار شدنِ مسئلهٔ خفته، جلسه‌های تمرین
     (a41 روی همین A.dossier از APP.PR.events(subject) — یک بار، همان‌جا؛ این فایل دوباره نمی‌خواندش) و هر چه بخش‌های دیگر با A.EVLOG.add می‌نویسند. وضع و مرحله‌ها از **یک** منبع (A.livePhase)؛ هر مقدار با رندرِ نوع‌دار (هرگز
     «[object Object]»)؛ نشانهٔ هر کنش همان نشانهٔ کارنامهٔ ذهن (A.MIND.phases().acts). */
  var EVL = A.EVLOG = A.EVLOG || {};
  function evOwner(scope) {
    if (scope && scope.pid) { var pg = S.get("eprog_" + scope.pid); if (!pg) return null; var so = pg.solve = pg.solve || {}, L = so.live = so.live || {}; return { arr: function () { return (L.evlog = L.evlog || []); }, put: function () { S.put(pg); } }; }
    if (scope && scope.sess) { var se = S.get(scope.sess); if (!se) return null; return { arr: function () { return (se.evlog = se.evlog || []); }, put: function () { S.put(se); } }; }
    return null;
  }
  /* A.EVLOG.add({pid|sess, k, at, title, lines, out, src, sign:[{row, sign}], by, id}) — at = زمانِ کنش (ISO)؛ id ⇒ دوباره‌نویسی همان رویداد را عوض می‌کند (نه رویدادِ دوم) */
  EVL.add = function (ev) {
    if (!ev || !ev.title || !ev.at) return null; var o = evOwner(ev); if (!o) return null; var L = o.arr(), id = ev.id || ("ev" + L.length + "_" + String(ev.at).replace(/\D/g, "").slice(-9));
    var e = { id: id, k: String(ev.k || "act"), at: String(ev.at), title: String(ev.title), lines: (ev.lines || []).map(String), out: ev.out ? String(ev.out) : "", src: ev.src || null, mind: ev.sign || ev.mind || [], by: ev.by || "", pid: ev.pid || "", sess: ev.sess || "" };
    var i = L.map(function (x) { return x.id; }).indexOf(id); if (i >= 0) { if (JSON.stringify(L[i]) === JSON.stringify(e)) return L[i]; L[i] = e; } else L.push(e);
    if (L.length > 500) L.splice(0, L.length - 500); o.put(); return e;
  };
  EVL.of = function (scope) { var o = evOwner(scope); return o ? o.arr().slice() : []; };
  /* رندرِ نوع‌دار: رشته، عدد، تاریخ، آرایه، شیء ({t|text|what|note|...}) — هرگز «[object Object]» */
  function val(x) {
    if (x == null || x === "") return "";
    if (typeof x === "number") return fa(x);
    if (typeof x === "boolean") return x ? "بله" : "نه";
    if (typeof x === "string") return /^\d{4}-\d{2}-\d{2}(?:T[\d:.]+Z?)?$/.test(x) ? A.fdate(day(x)) + (x.length > 10 && hm(x) ? " " + hm(x) : "") : x;
    if (Array.isArray(x)) return x.map(val).filter(Boolean).join("، ");
    if (typeof x === "object") { var t = x.text || x.t || x.what || x.note || x.answer || x.solution || x.label || ""; var d = x.d || (x.at ? day(x.at) : "");
      return [d ? A.fdate(d) : "", typeof t === "string" ? (t ? "«" + t + "»" : "") : val(t)].filter(Boolean).join(" — ") || ""; }
    return String(x);
  }
  A.dossierVal = val;
  function whenFa(w) { return !w ? "" : w === "next-session" ? "جلسهٔ بعد" : /^\d{4}-\d{2}-\d{2}/.test(w) ? A.fdate(day(w)) : String(w); }
  function srcAt(s) { return s && s.at ? String(s.at) : ""; }
  function evAt(obj, src) { var a = srcAt(src) || srcAt(obj && obj.src && obj.src.mid ? obj.src : null); return a || (obj && (obj.at0 || obj.at)) || ""; }
  var RANK = { stmt: 0, u: 1, udraft: 1, uold: 1, restate: 1, guess: 2, gold: 2, plan: 3, planold: 3, cplan: 3, step: 4, out: 5, stepold: 5, ans: 6, verdict: 7, state: 8, back: 9 };
  /* نشانهٔ کارنامهٔ ذهن برای یک کنش (همان act.ok ِ A.MIND.phases) */
  function mindActs(pid) { var o = {}; try { var R = A.MIND && A.MIND.phases ? A.MIND.phases({ pid: pid }) : null; ((R && R.rows) || []).forEach(function (row) { (row.acts || []).forEach(function (a) { o[a.id] = { row: row.fa, sign: a.ok ? "+" : "−", at: a.at, fa: a.fa }; }); }); } catch (e) { } return o; }
  function chatPlans(se) { return ((se && se.plans) || []).filter(function (q) { return q && q.text; }); }
  function addSessEvents(add, se, opt) {
    opt = opt || {}; var pid = opt.pid || "";
    chatPlans(se).forEach(function (q) {
      var lk = q.step || q.will; if (pid && lk && lk.pid && lk.pid !== pid) return;   // پیوندِ برنامه ⇄ گامِ زنده (a41: q.step / q.will)
      /* دورِ ۲۱ (ADDENDUM R4+، A21-14 s03): برنامهٔ یک مسئله هرگز در پروندهٔ مسئلهٔ دیگر — مسئلهٔ برنامه = پیوندش، وگرنه مسئله‌ای که سشن در زمانِ برنامه به آن بسته بود */
      if (pid && !(lk && lk.pid) && planPid(se, q) && planPid(se, q) !== pid) return;
      var sm = q.src ? msgRef(se.id, q.src) : null;
      add({ k: "cplan", at: (sm && sm.at) || q.at || "", title: "برنامهٔ خودت (از گفت‌وگو)", lines: [q.text].concat(q.when ? ["موعد: " + whenFa(q.when)] : []), from: "از گفت‌وگو", src: sm && sm.text ? sm : null,
        hist: (q.corr || []).map(function (c) { return { at: c.at, old: val(c.old) + (c.oldWhen && c.oldWhen !== q.when ? " (" + whenFa(c.oldWhen) + ")" : ""), new: val(c["new"]) + (c.oldWhen && c.oldWhen !== q.when ? " (" + whenFa(q.when) + ")" : ""), why: c.note || "" }; }) });
      if (q.done || q.state === "done" || q.state === "notdone") add({ k: "cplandone", at: q.doneAt || "", title: "برنامهٔ خودت — سرانجام", lines: [q.text], out: q.state === "notdone" || q.done === false ? "انجام نشد" : "انجام شد" });
    });
    var seen = {};
    (se.retracts || []).forEach(function (x) { if (x && x.copy) return;   // دورِ ۲۲: پاسخِ «بله/نه» رویدادِ «copyans» ِ خودش را دارد
      var key = x.at + "|" + x.mid; seen[key] = 1; var sm = msgRef(se.id, x.mid);
      if (pid && (x.changed || []).length && !(x.changed || []).some(function (c) { return !c.pid || c.pid === pid; })) return;
      add({ k: "retract", at: x.at, title: "اصلاحِ پیامِ پیشین", lines: ["«" + x.frag + "» ⇐ «" + x.fix + "»"].concat(x.refused ? ["صفحه نپذیرفت: " + (x.err || "")] : x.dup && !(x.changed || []).length ? ["پیش‌تر از همین پیام اصلاح شده بود؛ چیزِ تازه‌ای عوض نشد"] : (x.changed || []).length ? x.changed.map(function (c) { return c.label + (typeof c.old === "string" && (c.old || c.new) ? ": «" + clip(c.old, 80) + "» ⇐ «" + clip(typeof c.new === "string" ? c.new : val(c.new), 80) + "»" : ""); }) : ["از آن تکه رکوردی ساخته نشده بود"]),
        src: sm && sm.text ? sm : null, out: x.by === "user" ? "با ✏️ ِ خودت" : "از گفت‌وگو", rk: x.mid + "|" + x.frag + "|" + x.fix }); });
    /* دورِ ۲۱ (R4، C21-14، bank #96): اصلاح‌های گفت‌وگو همه — هم آن‌ها که چیزی را عوض کردند، هم بی‌اثر و ردشده (با همان سطرِ ساده)؛ یک بار برای هر اصلاح */
    var segot = {}; (se.retracts || []).forEach(function (x) { segot[nzk(x.mid) + "|" + nzk(x.fix)] = 1; segot["r|" + nzk(x.frag) + "|" + nzk(x.fix)] = 1; });
    (((se.coach || {}).retracts) || []).forEach(function (x) { if (!x || !x.at || seen[x.at + "|" + (x.from || x.srcId || "")]) return;
      /* دورِ ۲۲ (P3، D s30): اصلاحِ مسئلهٔ دیگرِ همان سشن در پروندهٔ این مسئله نمی‌آید — مالکِ اصلاح مسئله‌ای است که رکوردش از همان پیام عوض شد */
      if (pid && x.src) { var rp = retPids22(x.src); if (rp.length ? rp.indexOf(pid) < 0 : !chatScope(se, pid)) return; }
      var fr = x.frag || (x.x && x.x.msg) || x.msg || "", fx = x.fix || (x.x && x.x.fix) || "", ch = x.changes || x.ch || [];
      if (segot[nzk(x.src) + "|" + nzk(fx)] && !ch.length) return; if (segot["r|" + nzk(fr) + "|" + nzk(fx)] && !ch.length) return;
      add({ k: "retract", at: x.at, title: "اصلاحِ پیامِ پیشین", lines: [fr || fx ? "«" + val(fr) + "» ⇐ «" + val(fx) + "»" : "اصلاح"].concat(x.err ? ["صفحه نپذیرفت: " + val(x.err)] : ch.length ? ch.map(val) : ["چیزی عوض نشد — از آن تکه رکوردی ساخته نشده بود"]), out: x.edit ? "با ✏️ ِ خودت" : "از گفت‌وگو", src: x.src ? msgRef(se.id, x.src) : null }); });
    /* دورِ ۲۱ (R4، C21-13/C21-14، bank #93): حدس‌های گفت‌وگو و سرانجامشان (تأیید/رد/کنار رفت) */
    if (!pid || chatScope(se, pid)) (((se.coach || {}).guesses) || []).forEach(function (g) { if (!g || !g.text) return;
      var res = g.res === "confirmed" ? "تأیید شد" : g.res === "refuted" ? "رد شد" : g.resRecheck ? "سرانجامِ پیشین («" + (g.resRecheck.was === "confirmed" ? "تأیید شد" : "رد شد") + "») کنار رفت — با مقدارِ درست دوباره آزموده شود" : "هنوز آزموده نشده";
      add({ k: "guess", at: g.at || "", title: "حدس (از گفت‌وگو)", lines: [g.text], out: res, hist: (g.corr || []).map(function (c) { return { at: c.at, old: val(c.old), new: val(c["new"]), why: c.note || "" }; }),
        mind: g.res ? [{ row: "حدس/کالیبراسیون", sign: g.res === "confirmed" ? "+" : "−" }] : [] }); });
    (se.copyAsk || []).forEach(function (q) { if (pid && q.pid !== pid) return; if (q.state === "open") add({ k: "copyask", at: q.at, title: "پرسشِ صفحه: «این‌جا هم عوض شود؟»", lines: [q.label + ": «" + q.old + "» ⇐ «" + q.new + "»"], out: "هنوز جواب نداده‌ای — همان «" + q.old + "» مانده" }); });
    (se.evlog || []).forEach(function (e) { if (pid && e.pid && e.pid !== pid) return; add(Object.assign({}, e, { k: e.k || "act" })); });
  }

  function nzk(t) { return String(t == null ? "" : t).replace(/[۰-۹]/g, function (c) { return String(c.charCodeAt(0) - 1776); }).replace(/[\s\u200c]+/g, " ").trim(); }
  /* مسئله‌ای که سشن در زمانِ at به آن بسته بود (lprobLog)؛ نبودِ دفتر ⇒ lprob ِ سشن */
  function pidAt(se, at) { var L = (se && se.lprobLog) || [], o = ""; L.forEach(function (e) { if (e && e.p && String(e.at || "") <= String(at || "~")) o = e.p; }); return o || (L.length ? "" : (se && se.lprob) || ""); }
  function planPid(se, q) { if (q.pid) return q.pid; var sm = q.src ? msgRef(se.id, typeof q.src === "object" ? q.src.mid || q.src.msg : q.src) : null; return pidAt(se, (sm && sm.at) || q.at || ""); }
  /* حدس‌های گفت‌وگو در پروندهٔ یک مسئله فقط اگر سشن تنها همان مسئله را داشت (وگرنه پروندهٔ گفت‌وگو) */
  /* دورِ ۲۲ (P3، A22-20 s03، D s30/s34/s38): یک رویداد برای هر اصلاح — همان اصلاح که صفحه (L.retracts/se.retracts) و مربی (coach.retracts) هر دو نوشتند،
     یا ✏️ که دو بار ثبت شد، یک رویداد است (سطرهایش یکی می‌شوند؛ سطرِ «چیزی عوض نشد» کنارِ تغییرها نمی‌ماند) */
  function dedupRet22(ev) {
    var out = [], by = {};
    ev.forEach(function (e) { if (!e || e.k !== "retract") { out.push(e); return; }
      var k = nzk(String((e.lines || [])[0] || "")).replace(/[«»"]/g, ""), t = Date.parse(e.at || "") || 0, hit = (by[k] || []).filter(function (x) { return Math.abs((Date.parse(x.at || "") || 0) - t) <= 5 * 60e3; })[0];
      if (!hit) { (by[k] = by[k] || []).push(e); out.push(e); return; }
      var nothing = /چیزی عوض نشد|رکوردی ساخته نشده|ثبت نشده بود/, L0 = (hit.lines || []).concat((e.lines || []).slice(1)).filter(function (x, i, X) { return X.indexOf(x) === i; });
      if (L0.slice(1).some(function (x) { return !nothing.test(x); })) L0 = [L0[0]].concat(L0.slice(1).filter(function (x) { return !nothing.test(x); }));
      hit.lines = L0; if (!hit.src && e.src) hit.src = e.src; if (e.at && (!hit.at || e.at < hit.at)) hit.at = e.at; });
    return out;
  }
  A.dossierDedupRet = dedupRet22;
  /* کدام مسئله‌ها اصلاحی از این پیام را در دفترِ خودشان (L.retracts) دارند */
  function retPids22(mid) { var o = []; S.all("eprog", function (pg) { var L = pg && pg.solve && pg.solve.live; return !!(L && (L.retracts || []).some(function (x) { return x && x.mid === mid; })); }).forEach(function (pg) { o.push(String(pg.id).replace(/^eprog_/, "")); }); return o; }
  function chatScope(se, pid) { var ps = {}; if (se.lprob) ps[se.lprob] = 1; (se.lprobLog || []).forEach(function (e) { if (e && e.p) ps[e.p] = 1; }); var k = Object.keys(ps); return k.length === 1 && k[0] === pid; }
  /* ---------- مدلِ پرونده (یک منبع برای صفحه و برون‌بُرد) ---------- */
  A.dossier = function (pid) {
    var se0 = pid && S.get(pid); if (se0 && se0.type === "achat") return A.dossierSess(pid);
    var r = A.liveRec ? A.liveRec(pid) : null; if (!r) { var r0 = S.get("eprob_" + pid); r = r0 && r0.p ? r0 : null; } if (!r) return null;
    var so = prog(pid), L = liveOf(so), u1 = so.u && so.u[1], g = so.g && so.g[1], b = so.b && so.b[1], ev = [], MA = mindActs(pid);
    var ph = ""; try { ph = A.livePhase ? A.livePhase(pid) : ""; } catch (e) { }
    var add = function (o) { if (!o.at) o.at = ""; o.i = ev.length; ev.push(o); return o; };
    var born = r.created || (so.u && so.u[1] && so.u[1].at) || "";
    var sS = srcOf(pid, r.p); add({ k: "stmt", at: (sS && sS.at) || born, title: "صورتِ مسئله", lines: [r.p.statement], hist: histOf(r, "statement"), src: sS });
    var uPrev = "";
    (L.uHist || []).forEach(function (x) { var sig = JSON.stringify(uLines(x)); if (sig === uPrev) return; uPrev = sig; add({ k: "uold", at: x.at, title: "فرمِ فهم — نسخهٔ پیشین", lines: uLines(x), old: true }); });
    if (u1 && u1.done) { var sU = srcOf(pid, u1); add({ k: "u", at: u1.at, title: "فرمِ فهم (همان‌طور که پر شد)", lines: uLines(u1), hist: histOf(u1), src: sU, from: u1.from === "chat" ? "از گفت‌وگو" : "" }); }
    else if (L.uDraft) add({ k: "udraft", at: "", title: "فرمِ فهم — پیش‌نویسِ ثبت‌نشده", lines: uLines(L.uDraft), hist: histOf(L.uDraft), src: srcOf(pid, L.uDraft) });
    (L.restates || []).forEach(function (x) { add({ k: "restate", at: x.at, title: "بیانِ تازهٔ مسئله", lines: [val(x.why)] }); });
    (L.guessHist || []).forEach(function (x) { add({ k: "gold", at: x.at, title: "حدسِ پیشین", lines: [x.guess], out: x.refutedAt ? "رد شد" : "", mind: x.refutedAt ? [{ row: "حدس/کالیبراسیون", sign: "−" }] : [], old: true }); });
    if (g && (g.guess || g.withdrawn || (g.fixHist || []).length)) {
      /* دورِ ۲۰ (C20-10): «رد شد» فقط اگر نتیجهٔ گامی **همین** حدس را رد کرد (out.guess.g)، نه حدسِ پیشینِ همان خانه */
      var gt = String(g.guess || "").trim(), mineG = function (st) { var og = st.out && st.out.guess; return og && (!og.g || String(og.g).trim() === gt) && (!g.at || !st.out.at || String(st.out.at) >= String(g.at)); };
      var refuted = g.hit === "نادرست بود" || L.steps.some(function (st) { return mineG(st) && st.out.guess.rel === "refute"; }), conf = L.steps.some(function (st) { return mineG(st) && st.out.guess.rel === "confirm"; });
      var gout = g.withdrawn ? "پس گرفته شد" : g.outSup && !g.hit && !refuted && !conf ? "سرانجامِ پیشین کنار رفت (" + (g.outSup.why || "داده‌ای عوض شد") + ") — با مقدارِ درست دوباره آزموده شود" : g.hit ? "داوریِ خودت: " + g.hit : refuted ? "رد شد" : conf ? "پیامدی تأیید شد" : "هنوز آزموده نشده";
      var sG = srcOf(pid, g);
      add({ k: "guess", at: (sG && sG.at) || g.at, title: "حدس", lines: [g.guess || (g.withdrawn ? g.withdrawn.old : "")].concat(g.conf ? ["اطمینان: " + fa(g.conf) + "٪"] : []).concat(g.test ? ["آزمون: " + g.test] : []), out: gout, hist: histOf(g), src: sG,
        from: /^chat/.test(String(g.from || "")) || g.chatFrom ? "از گفت‌وگو" : "", withdrawn: !!g.withdrawn,
        mind: g.withdrawn ? [{ row: "حدس/کالیبراسیون", sign: "", withdrawn: true }] : g.hit || refuted ? [{ row: "حدس/کالیبراسیون", sign: g.hit === "درست بود" ? "+" : refuted || g.hit === "نادرست بود" ? "−" : "±" }] : [] });
    }
    (L.planHist || []).forEach(function (x) { add({ k: "planold", at: x.at, title: "طرح — نسخهٔ پیشین", lines: [x.t, x.t2].filter(Boolean), old: true }); });
    if (L.plan && L.plan.at) { var sP = srcOf(pid, L.plan); add({ k: "plan", at: (sP && sP.at) || L.plan.at0 || L.plan.at, title: "طرح", lines: [L.plan.t, L.plan.t2].filter(Boolean).concat(L.plan.due ? ["موعد: " + A.fdate(L.plan.due)] : []), hist: histOf(L.plan), src: sP }); }
    L.steps.forEach(function (st, i) {
      add({ k: "step", at: st.at, title: "گامِ " + fa(i + 1) + " (طرح‌ریزی)", lines: [st.text].concat(st.pred ? ["پیش‌بینی: " + st.pred + (st.conf ? " (" + fa(st.conf) + "٪)" : "")] : []).concat(st.due ? ["موعد: " + A.fdate(st.due)] : []).concat(st.proof ? ["برهان: " + st.proof] : []),
        hist: histOf(st, "due").concat(histOf(st, "text")), src: null, sid: st.id });
      var o = st.out, H = histOf(st, "out").concat(histOf(st, "what")), wSign = function (w) { return w.done === "yes" && w.prog !== "نه" ? "+" : "−"; };
      (st.fixHist || []).filter(function (x) { return x.field === "out" && x.old; }).forEach(function (x) {
        var w = x.old; add({ k: "stepold", at: w.at || x.at, title: "گامِ " + fa(i + 1) + " — نتیجهٔ پس‌گرفته", lines: [(DONE_FA[w.done] || w.done || "") + (w.what ? " — " + w.what : "")], out: "پس گرفته شد (" + (x.why || "اصلاح شد") + ")", old: true, withdrawn: true,
          mind: [{ row: "اجرا", sign: wSign(w), withdrawn: true }], sid: st.id }); });
      /* دورِ ۲۰ (D·15): نشانه همان کارنامه است (act ِ lstep) — نه قاعدهٔ جدای «با پیش‌بینی خواند» */
      var ma = MA["lstep:" + pid + ":" + st.id];
      if (o) add({ k: "out", at: o.at, title: "گامِ " + fa(i + 1) + " — نتیجه", lines: [(o.unk ? "نامعلوم" : DONE_FA[o.done] || o.done || "") + (o.match ? " · " + (MATCH_FA[o.match] || o.match) : "") + (o.what ? " — " + o.what : "")].concat(o.chatPrev ? ["گزارشِ گفت‌وگو پیش از اصلاحِ خودت در فرم: " + (DONE_FA[o.chatPrev.done] || o.chatPrev.done) + (o.chatPrev.what ? " — " + o.chatPrev.what : "")] : []),
        out: st.closed ? "بسته" : o.pending ? "هنوز در فرم تأیید نشده" : "", from: o.from === "chat" ? "از گفت‌وگو" : "", hist: H, src: srcOf(pid, st), sid: st.id,
        mind: ma ? [{ row: ma.row, sign: ma.sign }] : [] });
    });
    L.claims.forEach(function (c) { add({ k: "claim", at: c.at, title: "ادعای درونِ مسئله", lines: [val(c.t)], out: c.caseId ? "پرونده در کارخانه" : "" }); });
    L.aux.forEach(function (x) { add({ k: "aux", at: x.at, title: "مسئلهٔ کمکی", lines: [val(x.t), x.bridge ? "پل: " + val(x.bridge) : ""].filter(Boolean) }); });
    if (L.chat && L.chat.solution) { var sA = srcOf(pid, L.chat); add({ k: "ans", at: (sA && sA.at) || L.chat.at, title: "جوابی که در گفت‌وگو گفتی", lines: [L.chat.solution], hist: histOf(L.chat), src: sA, from: "از گفت‌وگو" }); }
    if (b && (b.verdict || (b.verdictHist || []).length || b.chkSup)) {
      /* دورِ ۲۰ (RO6، D·6/B·D7): «وارسی نشد» هرگز بی‌توضیح کنارِ «نتیجه سالم ماند» — گزارشِ گفت‌وگو جدا و پیوندِ «اصلاح شد ⇐» */
      var sup = b.superseded || b.chkSup, vl = [verdFa(b.verdict)];
      if (b.chkRes) vl.push(b.verdict === "verified" || b.verdict === "proved" ? "نتیجهٔ وارسی: " + b.chkRes : "گزارشِ گفت‌وگو: «" + b.chkRes + "» — " + (sup ? "حکمِ «وارسی شد» کنار رفت چون " + (sup.why || sup.note || "پیامی که بر آن بود اصلاح شد") : "از پیام‌های خودت سنجیده نشد"));
      add({ k: "verdict", at: (sup && sup.at) || b.at, title: "حکمِ وارسی", lines: vl.concat((b.chkMsgs || []).map(function (t) { return "پیامِ وارسی: «" + t + "»"; })),
        hist: (b.verdictHist || []).map(function (x) { return { at: x.at, old: verdFa(x.verdict), new: verdFa(b.verdict), why: "اصلاح شد ⇐ " + (x.why || "") }; }).concat(b.chkSup && !b.superseded ? [{ at: b.chkSup.at, old: verdFa(b.chkSup.verdictPrev), new: verdFa(b.verdict), why: b.chkSup.note || "" }] : []), out: sup ? "حکمِ پیشین کنار رفت" : "" });
    }
    if (L.state === "solved" || L.state === "abandoned") add({ k: "state", at: L.stateAt, title: L.state === "solved" ? "حل شد" : "آگاهانه کنار گذاشته شد", lines: [] });
    /* دورِ ۲۱ (R3d): «حل شد»ی که داده‌اش عوض شد کنار رفت و اجرا دوباره باز شد — همان رکورد، با دلیل */
    (L.stateHist || []).forEach(function (x) { if (x.state !== "solved") return; add({ k: "state", at: x.was || x.at, title: "حل شد", lines: [], out: "کنار رفت: " + (x.why || "") + " — اجرا دوباره باز شد", withdrawn: true }); });
    /* دورِ ۲۱ (R4، B·D5 s12/s18، bank #95): مسئله‌ای که در گفت‌وگو بسته شد کارِ گفت‌وگویش را نگه می‌دارد — پیام‌های کارِ خودش تا بستن (هر کدام با منبعِ خودش) */
    if (L.chat && L.chat.sess) { var seC = S.get(L.chat.sess), usedM = {}; ev.forEach(function (e) { if (e.src && e.src.mid) usedM[e.src.mid] = 1; });
      if (seC) (seC.msgs || []).filter(function (m) { return m && m.role === "user" && !sysTurn(m.text) && String(m.at || "") <= String(L.chat.at || L.stateAt || "~"); }).forEach(function (m) { var mid0 = A.liveMsgId ? A.liveMsgId(m) : ""; if (usedM[mid0]) return;
        add({ k: "chatwork", at: m.at || "", title: "کارِ تو در گفت‌وگو", lines: [clip(m.text, 400)], src: { sess: seC.id, mid: mid0, text: m.text, at: m.at || "", title: seC.title || "" } }); }); }
    if (b && b.done) add({ k: "back", at: b.at, title: "بازنگری", lines: [b.glance ? "در یک نگاه: " + val(b.glance) : "", b.use ? "درس: " + val(b.use) : "", b.chkHow ? "وارسی: " + val(b.chkHow) : "", b.bestQ ? "پرسشی که بیشتر کمک کرد: " + val(b.bestQ) : "", b.taste ? "این نوع مسئله برایت: " + val(b.taste) : ""].filter(Boolean), from: b.from === "chat" ? "از گفت‌وگو" : "", hist: histOf(b, "use"), src: b.src && b.src.use ? srcOf(pid, { src: b.src.use }) : null });
    /* دورِ ۲۱ (R9، D·s31، bank #184/#187): مسئله‌های تازه‌ای که در بازنگری ساختی — هر کدام با «باز کن» (فقط به انتخابِ خودت) */
    if (b && (b.newProbs || []).length) add({ k: "newprobs", at: b.newProbs[0].at || b.at || "", title: "مسئله‌های تازه‌ای که در بازنگری ساختی", lines: b.newProbs.map(function (x) { return "«" + x.t + "»" + (x.pid ? " — مسئلهٔ زنده شد" : ""); }), from: "از گفت‌وگو",
      btns: b.newProbs.filter(function (x) { return !x.pid; }).map(function (x) { return { label: "🔭 باز کن: «" + clip(x.title || x.t, 40) + "»", go: function () { var np = A.livePromoteNew ? A.livePromoteNew(pid, x.id) : ""; if (np) A.go("lprob", np); } }; }) });
    (L.retracts || []).forEach(function (x) { add({ k: "retract", at: x.at, title: "اصلاحِ پیامِ پیشین", lines: ["«" + x.frag + "» ⇐ «" + x.fix + "»"].concat(x.corr ? ["با پیامِ: «" + x.corr + "»"] : []).concat((x.changed || []).length ? x.changed.map(function (c) { return c.label + (c.old || c.new ? ": «" + clip(typeof c.old === "string" ? c.old : val(c.old), 80) + "» ⇐ «" + clip(typeof c.new === "string" ? c.new : val(c.new), 80) + "»" : ""); }) : ["چیزی از آن پیام ثبت نشده بود"]),
      src: x.sess ? msgRef(x.sess, x.mid) : null, out: x.by === "user" ? "با ✏️ ِ خودت" : "از گفت‌وگو", rk: x.mid + "|" + x.frag + "|" + x.fix }); });
    (L.copyLog || []).forEach(function (x) { add({ k: "copyans", at: x.at, title: "«این‌جا هم عوض شود؟» — پاسخِ تو", lines: [x.label + ": «" + x.old + "» ⇐ «" + x.new + "»"], out: x.yes ? "عوض شد (به تأییدِ خودت)" : "در صفحه نگه داشته شد («" + x.old + "»)" }); });
    var incs = (L.incubLog || []).slice(); if (L.incub && L.incub.at && !incs.some(function (x) { return x.at === L.incub.at; })) incs.push(L.incub);
    incs.forEach(function (x) { add({ k: "incub", at: x.at, title: "کنار گذاشته تا فردا (مکث)", lines: [x.back ? "بازگشت: " + val(x.back) : "هنوز برنگشته‌ای"] }); if (x.back && x.back.at) add({ k: "incubback", at: x.back.at, title: "بازگشت پس از مکث", lines: [val(x.back.t) || "—"] }); });
    (L.checkins || []).forEach(function (x) { add({ k: "checkin", at: x.at, title: "میانهٔ راه: چه آموختی؟", lines: [x.prob ? "دربارهٔ مسئله: " + val(x.prob) : "", x.self ? "دربارهٔ خودت: " + val(x.self) : "", x.want ? "هنوز همان را می‌خواهی؟ " + (WANT_FA[x.want] || val(x.want)) : ""].filter(Boolean) }); });
    if (r.woke) add({ k: "woke", at: r.woke, title: "برگشتی سراغِ مسئلهٔ خفته", lines: [r.dormant ? "موعدِ برگشت: " + A.fdate(r.dormant) : ""].filter(Boolean) });
    (L.evlog || []).forEach(function (e) { add(Object.assign({}, e, { k: e.k || "act" })); });
    /* گفت‌وگوهای همین مسئله: برنامه‌ها، اصلاح‌ها (یک بار — همان که در L.retracts هست تکرار نمی‌شود)، پرسش‌های باز و دفترِ رویدادِ سشن */
    var have = {}; ev.forEach(function (e) { if (e.rk) have[e.rk] = 1; });
    sessionsOf(pid, r).forEach(function (se) { addSessEvents(function (o) { if (o.rk && have[o.rk]) return; if (o.rk) have[o.rk] = 1; add(o); }, se, { pid: pid }); });
    /* رویدادهای کارنامهٔ ذهن (a29) که به همین مسئله مربوط‌اند — پس‌گرفته‌ها فعال شمرده نمی‌شوند */
    try { var M0 = A.MIND && A.MIND.model ? A.MIND.model() : null, tt = r.p.title;
      ((M0 && M0.events) || []).forEach(function (e) { var mine = e.pid === pid || (e.src && e.src.id === pid) || (tt && String(e.fa || "").indexOf("«" + tt + "»") >= 0); if (!mine) return;
        add({ k: "mind", at: e.at, title: "رویدادِ کارنامهٔ ذهن", lines: [e.fa], withdrawn: !!e.withdrawn, out: e.withdrawn ? "پس گرفته شد" : "" }); }); } catch (e) { }
    ev = dedupRet22(ev); ev.forEach(cleanEv); sortEv(ev);
    var last = ev.reduce(function (m, e) { return e.at && e.at > m ? e.at : m; }, String(r.updated || ""));
    /* دورِ ۲۰ (RO6، B·D7): یک منبعِ وضع — مرحله‌ها از همان A.livePhase که خطِ «وضع» می‌خواند (مرحلهٔ جاری «در جریان» است، نه «هنوز نرسیده») */
    var ORD = ["u", "p", "c", "b"], pi = ph === "done" ? 4 : Math.max(0, ORD.indexOf(ph));
    var state = L.state === "solved" ? "حل شد" : L.state === "abandoned" ? "آگاهانه کنار گذاشته" : L.incub && L.incub.at && !L.incub.back ? "مکث — کنار گذاشته تا فردا" : r.dormant && r.dormant > A.today() && !r.woke ? "خفته تا " + A.fdate(r.dormant) : ph === "done" ? "تمام شد" : "در جریان — " + (PH_FA[ph] || "");
    return { pid: pid, title: r.p.title, statement: r.p.statement, phase: ph, state: state, last: last, stages: ORD.map(function (k, j) { return { k: k, fa: PH_FA[k], reached: j <= pi || (L.state === "solved"), now: j === pi && ph !== "done" && L.state !== "solved" }; }),
      sessions: sessionsOf(pid, r).map(function (x) { return { id: x.id, title: x.title || clip(((x.msgs || [])[0] || {}).text, 50) || "گفت‌وگو", last: x.updated || "" }; }), events: ev };
  };
  /* دورِ ۲۰ (RO6): بی شناسهٔ خام (pl1، g2، lpNewS) و بی تاریخِ لاتینِ ISO در آنچه او می‌بیند */
  function clean(t) { if (typeof t !== "string") return val(t); return t.replace(/\b(\d{4}-\d{2}-\d{2})(?:T[\d:.]+Z?)?\b/g, function (m0, d0) { try { return A.fdate(d0); } catch (e) { return m0; } }).replace(/\b(?:برنامهٔ|حدسِ|درخواستِ)?\s*\b(?:pl|g|pr)\d+\b:?/g, function (m0) { return /^(برنامهٔ|حدسِ|درخواستِ)/.test(m0) ? m0.replace(/\s*\b(?:pl|g|pr)\d+\b/, "") : ""; }).replace(/«?\blpNew\w*\b»?/g, "فرمِ «ساختنِ مسئله»").replace(/\s{2,}/g, " ").trim(); }
  function cleanEv(e) { if (e.from && String(e.title || "").indexOf(e.from) >= 0) e.from = "";   // دورِ ۲۱ (A21-14): «از گفت‌وگو — از گفت‌وگو» نه
    e.lines = (e.lines || []).map(clean); if (e.out) e.out = clean(e.out); e.hist = (e.hist || []).map(function (x) { return Object.assign({}, x, { old: typeof x.old === "string" ? clean(x.old) : x.old, new: typeof x.new === "string" ? clean(x.new) : x.new }); }); }
  A.dossierClean = clean;
  function sortEv(ev) {
    ev.forEach(function (e) { e.at = String(e.at || ""); });
    ev.sort(function (a, b2) { var x = a.at || "9999", y = b2.at || "9999"; if (x !== y) return x < y ? -1 : 1; var ra = RANK[a.k] == null ? 5 : RANK[a.k], rb = RANK[b2.k] == null ? 5 : RANK[b2.k]; return ra !== rb ? ra - rb : a.i - b2.i; });
    ev.forEach(function (e, j) { e.i = j; });
  }
  /* پروندهٔ سشنی که مسئلهٔ زنده ندارد (تصمیم در گفت‌وگو، برنامه‌ها، میانهٔ راه) — همان مدل، از دفترِ رویدادهای همان سشن */
  A.dossierSess = function (sid) {
    var se = S.get(sid); if (!se || se.type !== "achat") return null; var ev = [], add = function (o) { if (!o.at) o.at = ""; o.i = ev.length; ev.push(o); return o; };
    var first = (se.msgs || []).filter(function (m) { return m && m.role === "user"; })[0];
    if (first) add({ k: "stmt", at: first.at || "", title: "آغازِ گفت‌وگو", lines: [clip(first.text, 400)] });
    addSessEvents(add, se, {});
    S.all("deadline", function (x) { return x && x.src && x.src.sess === sid; }).forEach(function (x) { var sm = msgRef(sid, x.src.mid); add({ k: "deadline", at: (sm && sm.at) || x.src.at || "", title: "موعد/یادآور", lines: [x.what, "موعد: " + val(x.date) + (x.time ? "، ساعت " + fa(x.time) : "")], out: x.done ? "انجام شد" : "", src: sm && sm.text ? sm : null,
      hist: (x.fixHist || []).map(function (y) { return { at: y.at, old: y.old, new: y.new, why: y.why }; }) }); });
    /* دورِ ۲۱ (R4، D·11/C21-13، bank #93/#107/#108): رویدادِ کارنامه با برچسبِ فارسی و پیامِ منبعش — هرگز کلیدِ خام («chat|»، «chatok|»، «rebook:»، «more») */
    var ROW = { u: "فهم", p: "طرح‌ریزی", c: "اجرا", b: "بازنگری" }, HOW = { selfcorr: "خود-اصلاح", plan: "برنامه", own: "به حرفِ خودت", guess: "حدس", check: "وارسی", result: "نتیجه", stuck: "گیر", restate: "بیانِ تازه" };
    ((se.coachEv || [])).forEach(function (e) { if (!e || !e.at) return; var sm = e.msg ? msgRef(sid, e.msg) : null, row = ROW[e.ph] || "";
      var line = e.fa && !/^(?:chat|chatok|rebook)\b|\|/.test(String(e.fa)) ? val(e.fa) : (row ? row + " " + (e.ok ? "+" : "−") : "") + (HOW[e.how] ? " — " + HOW[e.how] : "") + (e.rebook ? " — با مقدارِ درست دوباره ثبت شد" : "");
      add({ k: "mind", at: e.at, title: "رویدادِ کارنامهٔ ذهن", lines: [line].concat(sm && sm.text ? [] : []).filter(Boolean), src: sm && sm.text ? sm : null, withdrawn: !!e.wd, out: e.wd ? "پس گرفته شد" : !e.ok && e.cause === "prereq" ? "علت: نبودِ پیش‌نیازِ «" + (e.preC || "") + "» — ضعفِ مرحله شمرده نشد" : "", mind: !e.ok && e.cause === "prereq" ? [] : [{ row: row, sign: e.ok ? "+" : "−", withdrawn: !!e.wd }] }); });   // دورِ ۲۲ (P1)
    /* دورِ ۲۱ (R4، B·D5/C21-13، bank #97/#98/#105): تمرین‌هایی که در این گفت‌وگو گزارش شد (practice_log) و پیش‌بینی‌های 🎯 ِ همان پرونده‌ها — هر کدام یک بار */
    try { var PR = A.PR; if (PR && PR.events && PR.cases) { var cs = {};
        PR.events(null).forEach(function (e) { if (e && e.src && e.src.sess === sid) { cs[e.prc] = 1; } });
        PR.cases({}).forEach(function (c) { if (c && (c.sess === sid || (c.from && c.from.sess === sid))) cs[c.id] = 1; }); (se.prcs || []).forEach(function (id) { cs[id] = 1; });
        PR.events(null).forEach(function (e) { if (e && cs[e.prc]) add(Object.assign({}, e)); });
        S.all("fcast", function (f) { return f && f.prc && cs[f.prc]; }).forEach(function (f) { add({ k: "fcast", at: f.outcomeAt || f.created || "", title: "🎯 پیش‌بینی", lines: [f.q].concat(f.p != null ? ["اطمینان: " + fa(f.p) + "٪"] : []).concat(f.due ? ["موعدِ داوری: " + val(f.due)] : []),
          out: f.outcome === "yes" || f.outcome === "درست" ? "شد" : f.outcome === "no" || f.outcome === "نادرست" ? "نشد" : f.outcome ? val(f.outcome) : "هنوز داوری نشده" }); }); } } catch (e) { console.warn(e); }
    ev = dedupRet22(ev); ev.forEach(cleanEv); sortEv(ev);
    var title = se.title || (first ? clip(first.text, 60) : "گفت‌وگو");
    /* دورِ ۲۱ (R4، C21-13، bank #94): سشنی که مسئلهٔ زنده دارد ⇒ عنوانِ درست و پیوند به پروندهٔ همان مسئله */
    var lv = []; [se.lprob].concat((se.lprobLog || []).map(function (e) { return e && e.p; })).forEach(function (p) { var r = p && A.liveRec && A.liveRec(p); if (r && !lv.some(function (x) { return x.pid === p; })) lv.push({ pid: p, title: r.p.title }); });
    return { pid: sid, sess: true, title: title, statement: lv.length ? "پروندهٔ این گفت‌وگو — مسئلهٔ زنده: " + lv.map(function (x) { return "«" + x.title + "»"; }).join("، ") : "پروندهٔ این گفت‌وگو (بی مسئلهٔ زنده)", lives: lv, phase: "", state: "گفت‌وگو", last: ev.reduce(function (m, e) { return e.at > m ? e.at : m; }, ""), stages: [], sessions: [{ id: sid, title: title, last: se.updated || "" }], events: ev };
  };
  /* قرنطینه (دورِ ۲۰، RO6 — docs/overhaul/REMOVAL_CANDIDATES.md): پروندهٔ دورِ ۱۹b — ساخته از بخشی از رکوردها، به ترتیبِ زمانِ ذخیره، با دو منبعِ وضع؛ صدا زده نمی‌شود */
  function dossierR19b(pid) {
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
  }
  A.LIVE_R20_QUARANTINE = Object.assign(A.LIVE_R20_QUARANTINE || {}, { dossier: dossierR19b });
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
    S.all("achat", function (x) { return !isTest(x) && (x.msgs || []).length; }).forEach(function (x) { o.push({ type: "session", fa: "💬 سشنِ دستیار", id: x.id, title: x.title || clip(((x.msgs || [])[0] || {}).text, 50) || "گفت‌وگو", last: mx0(x.updated), sess: x.id, dossier: true }); });
    return o.sort(function (a, b) { return String(b.last).localeCompare(String(a.last)); });
  };

  /* ---------- برون‌بُرد ---------- */
  function evLines(e) { return (e.lines || []).filter(function (x) { return txt(x); }); }
  function stageFa(s) { return s.fa + (s.now ? " (در جریان)" : s.reached ? " ✓" : " (هنوز نرسیده)"); }
  A.dossierMd = function (pid) {
    var D = A.dossier(pid); if (!D) return ""; var o = ["# 📜 پروندهٔ کامل — " + plain(D.title), "", "صورت: " + plain(D.statement), "", "وضع: " + D.state + (D.stages.length ? " · مرحله‌ها: " + D.stages.map(stageFa).join("، ") : ""), ""];
    if (D.sessions.length) o.push("گفت‌وگوها: " + D.sessions.map(function (s) { return "«" + s.title + "» (" + s.id + ")"; }).join("، "), "");
    var cd = null;
    D.events.forEach(function (e) { var d0 = day(e.at); if (d0 !== cd) { cd = d0; o.push("## " + (d0 ? A.fdate(d0) : "بی تاریخ"), ""); }
      o.push("### " + (hm(e.at) ? hm(e.at) + " — " : "") + e.title + (e.from ? " (" + e.from + ")" : "") + (e.withdrawn ? " — پس گرفته شد" : ""));
      evLines(e).forEach(function (l) { o.push("- " + plain(l)); });
      if (e.out) o.push("- سرانجام: " + plain(e.out));
      (e.hist || []).forEach(function (x) { o.push("- اصلاح شد ⇐ «" + plain(typeof x.old === "string" ? x.old : A.dossierVal(x.old)) + "» → «" + plain(typeof x.new === "string" ? x.new : x.new == null ? "باز" : A.dossierVal(x.new)) + "»" + (x.at ? " (" + A.fdate(day(x.at)) + ")" : "")); });
      if (e.src && e.src.unknown) o.push("- منبع: نامعلوم");
      if (e.src && e.src.text) o.push("- از پیامِ گفت‌وگو: «" + plain(clip(e.src.text, 200)) + "» (سشن " + e.src.sess + ")");
      (e.mind || []).forEach(function (m) { o.push("- کارنامهٔ ذهن: " + m.row + " " + (m.sign || "") + (m.withdrawn ? " (پس گرفته شد)" : "")); });
      o.push(""); });
    return o.join("\n");
  };
  A.dossierHtml = function (pid) {
    var D = A.dossier(pid); if (!D) return ""; var o = [], cd = null;
    o.push("<!doctype html><html lang=\"fa\" dir=\"rtl\"><head><meta charset=\"utf-8\"><title>" + esc("پروندهٔ کامل — " + D.title) + "</title><style>body{font-family:Vazirmatn,Tahoma,sans-serif;max-width:860px;margin:24px auto;padding:0 16px;line-height:1.8}h3{margin:.8em 0 .2em}.w{color:#888;text-decoration:line-through}.h{color:#666;font-size:.9em}</style></head><body dir=\"rtl\">");
    o.push("<h1>📜 پروندهٔ کامل — " + htm(D.title) + "</h1><p>صورت: " + htm(D.statement) + "</p><p>وضع: " + esc(D.state) + " · " + D.stages.map(function (s) { return esc(stageFa(s)); }).join("، ") + "</p>");
    D.events.forEach(function (e) { var d0 = day(e.at); if (d0 !== cd) { cd = d0; o.push("<h2>" + esc(d0 ? A.fdate(d0) : "بی تاریخ") + "</h2>"); }
      o.push("<section data-ev=\"" + e.k + "\"><h3" + (e.withdrawn ? " class=\"w\"" : "") + ">" + esc((hm(e.at) ? hm(e.at) + " — " : "") + e.title + (e.from ? " (" + e.from + ")" : "") + (e.withdrawn ? " — پس گرفته شد" : "")) + "</h3><ul>");
      evLines(e).forEach(function (l) { o.push("<li>" + htm(l) + "</li>"); });
      if (e.out) o.push("<li>سرانجام: " + htm(e.out) + "</li>");
      (e.hist || []).forEach(function (x) { o.push("<li class=\"h\">اصلاح شد ⇐ «" + htm(typeof x.old === "string" ? x.old : A.dossierVal(x.old)) + "» → «" + htm(typeof x.new === "string" ? x.new : x.new == null ? "باز" : A.dossierVal(x.new)) + "»</li>"); });
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
      h("div", { class: "row gap wrap lp-dstages" }, D.stages.map(function (s) { return h("span", { class: "chip" + (s.reached ? " on" : ""), "data-ph": s.k, "data-now": s.now ? "1" : null }, s.fa + (s.now ? " — در جریان" : s.reached ? "" : " — هنوز نرسیده")); })),
      h("div", { class: "row gap wrap" },
        D.sess && (D.lives || []).length ? D.lives.map(function (x) { return h("button", { class: "btn ghost sm lp-dlive", type: "button", onclick: function () { A.go("dossier", x.pid); } }, "📜 پروندهٔ کاملِ «" + clip(x.title, 40) + "»"); }) : null,
        D.sess ? h("button", { class: "btn ghost sm", type: "button", onclick: function () { openSess(pid); } }, "💬 باز کردنِ گفت‌وگو") : h("button", { class: "btn ghost sm", type: "button", onclick: function () { A.go("lprob", pid); } }, "← صفحهٔ مسئله"),
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
        (e.hist || []).length ? h("ul", { class: "small muted lp-dhist" }, e.hist.map(function (x) { return h("li", {}, "اصلاح شد ⇐ «", mx(typeof x.old === "string" ? x.old : x.old && x.old.done ? (DONE_FA[x.old.done] || x.old.done) + (x.old.what ? " — " + x.old.what : "") : A.dossierVal(x.old)), "» → «", mx(typeof x.new === "string" ? x.new : x.new == null ? "باز" : x.new.done ? (DONE_FA[x.new.done] || x.new.done) : A.dossierVal(x.new)), "»" + (x.at ? " · " + A.fdate(day(x.at)) + " " + hm(x.at) : "")); })) : null,
        e.src && e.src.unknown ? h("p", { class: "small muted lp-dsrc" }, "منبع: نامعلوم (پیامی که این از آن آمد پیدا نشد)") : e.src && e.src.text ? h("p", { class: "small muted lp-dsrc" }, "از پیامِ گفت‌وگو: «", mx(clip(e.src.text, 200)), "» ", h("button", { class: "linkish small", type: "button", onclick: function () { openSess(e.src.sess); } }, "💬 باز کردنِ سشن")) : null,
        (e.btns || []).length ? h("p", { class: "row gap wrap small" }, e.btns.map(function (b0) { return h("button", { class: "btn ghost sm lp-dnewp", type: "button", onclick: b0.go }, b0.label); })) : null,
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
      var asks = A.liveCopyAsks ? A.liveCopyAsks(s.id) : [], umN = (s.msgs || []).filter(function (m) { return m && m.role === "user"; }).length;
      if (!ids.length && !asks.length && umN < 2) return null;
      /* دورِ ۲۰ (RO2): «این‌جا هم عوض شود؟» برای نسخه‌ای که خودش در صفحه نوشت — هر دو مقدار، یک بار؛ هرگز بازنویسیِ بی‌صدا */
      var askBox = asks.length ? h("div", { class: "card soft as-copyask", dir: "rtl", role: "group", "aria-label": "این‌جا هم عوض شود؟" }, asks.map(function (q) {
        return h("p", { class: "small", "data-ask": q.id }, "این‌جا هم عوض شود؟ ", h("strong", {}, q.label), ": «", mx(q.old), "» ⇐ «", mx(q.new), "» ",
          h("button", { class: "btn sm as-askyes", type: "button", onclick: function () { var r = A.liveCopyAnswer(s.id, q.id, true); A.toast(r.ok ? "عوض شد؛ «" + clip(q.old, 40) + "» در تاریخچه ماند." : r.err || "نشد", r.ok ? "" : "bad"); AS.paint(); try { A.render(); } catch (e) { } } }, "بله، این‌جا هم"),
          " ", h("button", { class: "btn ghost sm as-askno", type: "button", onclick: function () { A.liveCopyAnswer(s.id, q.id, false); A.toast("همان «" + clip(q.old, 40) + "» ماند؛ دوباره نمی‌پرسم."); AS.paint(); } }, "نه، همان بماند")); })) : null;
      return h("div", { class: "as-dos small", dir: "rtl" }, askBox, ids.slice(0, 3).map(function (p) { return h("button", { class: "linkish small as-doslink", type: "button", onclick: function () { A.go("dossier", p); } }, "📜 پروندهٔ کامل: «" + clip(A.liveRec(p).p.title, 40) + "»"); }),
        !ids.length && umN >= 2 ? h("button", { class: "linkish small as-doslink as-dossess", type: "button", onclick: function () { A.go("dossier", s.id); } }, "📜 پروندهٔ این گفت‌وگو") : null);
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
      /* دورِ ۲۰ (RO5، یک موتور): نوبتِ «[اصلاحِ پیامِ قبلی] …» پیامِ اصلاح‌کننده است؛ مربی (AS.retractApply) درست پیش از ساختنِ پرامپتِ **همان** نوبت می‌دود
         (پوششِ AS.prompt پایین) تا نتیجهٔ صفحه در همان نوبت به مدل برسد — نه در همان تیک کنارِ AS.send و وابسته به زمان‌بندی */
      /* دورِ ۲۱ (R3f، B·D4 s17، bank #68/#69): ✏️ ِ چندعددی ⇒ یک تکه برای هر span ِ عوض‌شده — هم در نوبتِ اصلاح و هم برای مربی (هر تکه یک اصلاح) */
      var PT = (res.parts || []).length ? res.parts : [{ frag: c.frag || "", fix: c.fix || "" }];
      var text = "[اصلاحِ پیامِ قبلی] " + PT.map(function (pt) { return "«" + clip(pt.frag, 120) + "» ⇐ «" + clip(pt.fix, 120) + "»"; }).join("، ") + " — متنِ درستِ پیامم: «" + clip(t, 400) + "»";
      var run = function (se) {
        var ch = []; if (typeof AS.retractApply === "function") PT.forEach(function (pt) { try { var r2 = AS.retractApply(se, { msg: pt.frag, what: res.what || "said", fix: pt.fix }); if (r2 && Array.isArray(r2.ch)) ch = ch.concat(r2.ch); } catch (e) { console.warn(e); } });
        A.liveEditCommit(s.id, mid, t, { ch: ch }); setTimeout(function () { try { AS.paint(); } catch (e) { } }, 0);
        /* دورِ ۲۰ (RO3/RO5): یک سطرِ راست پس از هر دو سو (صفحه و مربی) — نه پیش از آن */
        var parts = (res.changed || []).map(function (x) { return x.label; }).concat(ch.map(function (x) { return String(x).replace(/\s*\(اصلاح شد.*$/, ""); }));
        A.toast(parts.length ? "اصلاح شد: " + parts.slice(0, 4).join("؛ ") + ((res.ask || []).length ? " — و در گفت‌وگو پرسیدم «این‌جا هم عوض شود؟»" : "") : (res.ask || []).length ? "از آن تکه چیزی خودکار عوض نشد؛ در گفت‌وگو پرسیدم «این‌جا هم عوض شود؟»" : "متنِ پیام اصلاح شد؛ از آن تکه رکوردی ساخته نشده بود.");
      };
      var go = function () {
        EDIT_PEND[s.id] = { text: text, run: run };
        AS.send(text);
        /* اگر نوبت ساخته نشد (ارسال رد شد)، برگرداندنِ مربی و متنِ تازهٔ حباب باز هم انجام می‌شود */
        setTimeout(function () { var P = EDIT_PEND[s.id]; if (P && P.text === text) { delete EDIT_PEND[s.id]; P.run(S.get(s.id) || s); } }, 4000);
      };
      (function wait(n) { if (!AS.busy()) go(); else if (n < 120) setTimeout(function () { wait(n + 1); }, 500); })(0);
      return res;
    };
    var EDIT_PEND = {};
    var rawPrompt = AS.prompt;
    if (typeof rawPrompt === "function" && !rawPrompt._edit20) {
      AS.prompt = function (s, msg) { try { var P = s && EDIT_PEND[s.id]; if (P && String(msg) === P.text) { delete EDIT_PEND[s.id]; P.run(s); } } catch (e) { console.warn(e); } return rawPrompt.apply(this, arguments); };
      AS.prompt._edit20 = true;
    }
    AS.msgTools = function (s, m) {
      if (!s || !m || m.role !== "user" || sysTurn(m.text)) return null;
      var mid = A.liveMsgId ? A.liveMsgId(m) : "", wrap = h("div", { class: "as-mtools small", dir: "rtl", "data-mid": mid });
      /* دورِ ۲۱ (R3h، B·D13 s19): حبابی که در گفت‌وگو یا با ✏️ اصلاح شد نشان دارد — «پیشین ⇐ درست» */
      /* دورِ ۲۲ (P3، B·D16 s19): نشانِ حباب با نتیجهٔ صفحه یکی است — اصلاحِ گفت‌وگو که هیچ رکوردی را عوض نکرد «اصلاح شد» نمی‌خورد، فقط «گفتی … — رکوردی از آن ثبت نشده بود» */
      if ((m.corr || []).length) wrap.appendChild(h("span", { class: "muted as-corr" }, (m.corr || []).map(function (x, i) { var none = x.chat && !x.n && !(x.pids || []).length;
        return [i ? " · " : "", none ? "گفتی «" : "اصلاح شد ⇐ «", mx(x.frag), "» → «", mx(x.fix), "»", none ? " — رکوردی از آن ثبت نشده بود" : x.chat ? " (از گفت‌وگو)" : ""]; })));
      if (ED && ED.sid === s.id && ED.mid === mid) {
        var id = "asEd_" + String(mid).replace(/[^A-Za-z0-9]/g, "");
        var ta = h("textarea", { id: id, class: "as-edtx", rows: 2, dir: "auto", "aria-label": "متنِ درستِ این پیام" }); ta.value = ED.text; ta.addEventListener("input", function () { ED.text = ta.value; });
        wrap.appendChild(h("div", { class: "as-edit col gap" }, h("label", { for: id, class: "small" }, "متنِ درستِ این پیام (همهٔ رکوردهای ساخته از آن دنبالش می‌آیند؛ پیشین در تاریخچه می‌ماند)"), ta,
          h("div", { class: "row gap" },
            h("button", { class: "btn sm as-edsave", type: "button", onclick: function () { var r = AS.retractEdit(s, m, ta.value); if (!r.ok) { if (r.same) { ED = null; AS.paint(); } A.toast(r.err, r.same ? "" : "bad"); return; } ED = null; if (r.dup) A.toast("پیش‌تر همین اصلاح انجام شده بود؛ چیزِ تازه‌ای برنگشت."); AS.paint(); } }, "ذخیرهٔ اصلاح"),
            h("button", { class: "btn ghost sm as-edcancel", type: "button", onclick: function () { ED = null; AS.paint(); } }, "انصراف"))));
        setTimeout(function () { try { ta.focus(); } catch (e) { } }, 0);
      } else wrap.appendChild(h("button", { class: "linkish small as-editb", type: "button", "aria-label": "اصلاحِ این پیام", title: "این پیام را اصلاح کن — هر چه از آن ثبت شده دنبالش می‌آید", onclick: function () { ED = { sid: s.id, mid: mid, text: m.text }; AS.paint(); } }, "✏️ اصلاح"));
      return wrap;
    };
  }
})(APP);
