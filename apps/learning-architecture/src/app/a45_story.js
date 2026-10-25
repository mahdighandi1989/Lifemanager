/* ===== «گفت‌وگو ⇄ صفحه یک داستان است» — دورِ ۲۳ ِ تورِ پولیا، سازوکارِ Q3 (DECISIONS_R23؛ C23-11، A23-35/A22-27، B·D5، B·D2، D23-20/21، A23-32، A23-8، C23-13/14، B·D17) — a45_story.js =====
   مالک (۲۰۲۶-۱۰-۱۸): «کسی که در گفت‌وگو زندگی می‌کند نیاز دارد نقشه و فرم آنچه گفته را بدانند» (نقشهٔ نیازِ oC1 p10–p12).
   ریشه: کارِ سنجیدهٔ گفت‌وگو (coach_state: said/ans/plan/step/result) فقط در s.coach می‌ماند؛ فرم‌های مسئلهٔ زنده، مرحلهٔ آن، «🧭» و نوارِ جغرافیا فقط از فرم می‌خواندند.
   پس پرسشِ «اول کل» تکرار می‌شد، 🧭 «فهمِ مسئله — طرح هنوز نیست» می‌گفت، و مسئلهٔ زنده‌ای که بعدتر ساخته می‌شد از صفر شروع می‌کرد.
   این لایه — مدل گزارش می‌دهد، صفحه می‌سنجد (experiences/model-reports-state-page-validates.md):
     • دفترِ داستان: هر قلمِ سنجیدهٔ همین پیام (کل در یک جمله، مجهول، داده، شرط، طرح با گام‌هایش به ترتیبِ خودش، گزارشِ گام، نتیجه، پاسخِ پرسشِ بازنگری) یک رویداد
       در A.EVLOG (همان دفترِ پرونده و نقشه؛ دفترِ دوم نیست) با پیامِ منبعش؛ said/ans همان سنجشِ a27 است (C.saidOk) — این‌جا دوباره حدس زده نمی‌شود.
     • فرم‌ها: فقط خانهٔ خالی پر می‌شود، با «از گفت‌وگو: «…» — درست است؟» (✓ درست است / ✏️ ویرایش)؛ نوشتهٔ خودش هرگز بی‌صدا عوض نمی‌شود و خانه‌ای که یک بار
       از گفت‌وگو پر شد دوباره پر نمی‌شود (ویرایشِ او می‌ماند).
     • مرحله: A.liveStoryPhase(pid) = مرحلهٔ فرم یا مرحله‌ای که داستانِ سنجیده نشان می‌دهد (هر کدام جلوتر) — پرونده، 🧭 و نوار همین یک منبع را می‌خوانند.
     • مسئلهٔ زندهٔ بعدی همان کارِ گفت‌وگو را می‌آورد (L.chatImp) و هر رویدادِ گفت‌وگو مالِ مسئلهٔ خودش است (A.STORY.owns). */
(function (A) {
  var AS = A.ASSIST, S = A.S, h = A.h, fa = A.fa;
  if (!AS || !S || !A.V) return;
  var ST = A.STORY = A.STORY || {};
  function nowIso() { return A.nowISO ? A.nowISO() : new Date().toISOString(); }
  function txt(t) { return String(t == null ? "" : t).replace(/\s+/g, " ").trim(); }
  function clip(t, n) { var s = txt(t); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function txtOf(x) { return x && typeof x === "object" ? txt(x.text || x.t || x.what || x.quote || "") : txt(x); }
  function nz(t) { return String(t == null ? "" : t).replace(/[۰-۹]/g, function (c) { return String(c.charCodeAt(0) - 1776); }).replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 1632); })
    .replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[ً-ْٰـ]/g, "").replace(/[‌‏‎]/g, " ").replace(/[«»"'.,،؛:!؟?…()\[\]]/g, " ").replace(/\s+/g, " ").trim().toLowerCase(); }
  var STOP = /^(?:و|به|از|در|که|را|رو|با|برای|این|اون|آن|یه|یک|هم|تا|یا|اگه|اگر|می|ها|ای|است|هست|بود|شد|کنم|کنه|میشه|می‌شه|چند|چه|چی|کدوم|کدام|تعداد|مقدار|چقدر|چطور|باید|بشه|کرد|کردم|دارم|داریم|ما|من|تو|شما)$/;
  function toks(t) { return nz(t).split(" ").filter(function (w) { return w.length >= 2 && !STOP.test(w); }); }
  function stem(w) { return w.replace(/(?:‌?ها|‌?های|‌?ای|‌?ی|ِ|ش|م|و)$/, ""); }
  function hit(w, T) { var a = stem(w); return T.some(function (x) { var b = stem(x); return a === b || (a.length >= 3 && b.length >= 3 && (a.indexOf(b) === 0 || b.indexOf(a) === 0)); }); }
  function isUser(m) { return !!m && m.role === "user" && !/^\s*\[(?:سامانه|اصلاحِ?[\s‌]*پیامِ?[\s‌]*قبلی)/.test(String(m.text || "")); }
  function lastUser(s) { var M = (s && s.msgs) || []; for (var i = M.length - 1; i >= 0; i--) if (isUser(M[i])) return M[i]; return null; }
  function mid(m) { try { return m && AS.msgId ? AS.msgId(m) : ""; } catch (e) { return ""; } }
  function quoteIn(q, t) { try { if (A.PRE && A.PRE.quoteIn) return A.PRE.quoteIn(q, t); return AS.quoteIn ? AS.quoteIn(q, t) : String(t || "").indexOf(String(q || "")) >= 0; } catch (e) { return false; } }
  var ORD = { u: 0, p: 1, c: 2, b: 3, done: 4 }, PH_FA = { u: "فهمِ مسئله", p: "طرح", c: "اجرا", b: "بازنگری", done: "تمام شد" };
  function maxPh(a, b) { if (!a) return b || ""; if (!b) return a; return ORD[b] > ORD[a] ? b : a; }

  /* ---------- خواندنِ حرفِ خودش (فقط متنِ پیامِ او؛ هیچ واژه‌ای از پاسخِ دستیار) ---------- */
  /* «کلش اینه: …»، «کلِ مسئله اینه که …»، «در یک جمله: …» — نشانهٔ صریحِ «کل»، با دست‌کم سه واژهٔ معنادار پس از آن */
  var WHOLE_RE = /(?:^|[\s.،!؟?:«])(?:(?:کلش|کلِش|کل‌ش|کلِ?\s*(?:مسئله|مساله|ماجرا|کار|قضیه|داستان)|خلاصه[‌\s]*(?:ا?ش)?)\s*(?:اینه|این\s*است|اینست)\s*(?:که)?\s*[:：،\-–]?|(?:کلش|کلِ?\s*(?:مسئله|مساله|ماجرا|قضیه))\s*[:：]|در\s*یک\s*جمله\s*[:：،\-–]?|به\s*(?:طورِ?|طور)\s*خلاصه\s*[:：،]?)\s*([^\n]{6,})/;
  function wholeSaid(t) {
    var T = String(t || ""), m = WHOLE_RE.exec(T); if (!m) return "";
    var body = m[1], end = body.search(/[.!؟?](?=\s|$)(?![^«]*»)/); if (end > 0) body = body.slice(0, end + (/[؟?]/.test(body[end]) ? 1 : 0));
    body = txt(body).replace(/^[:：،\-–\s]+/, "");
    return toks(body).length >= 3 ? clip(body, 300) : "";
  }
  ST.wholeSaid = wholeSaid; AS.wholeSaid = wholeSaid;
  function clauses(t) { return String(t || "").split(/[.!؟?؛;\n]+(?=\s|$)|،\s*|,\s+|\s+و\s+(?=(?:شرط|به\s*شرط))|\s+(?:ولی|اما)\s+/).map(txt).filter(Boolean); }
  var COND_RE = /(?:شرط(?:ش|ها|‌ها|مون)?\s*(?:اینه|این\s*است|اینست)\s*(?:که)?|به\s*شرطِ?\s*(?:این[‌\s]*که)?|شرط(?:ها|‌ها)?\s*[:：])\s*([^.!؟?\n]{3,})/;
  function condOf(t) { var m = COND_RE.exec(String(t || "")); return m ? clip(txt(m[1]).replace(/[،,]\s*$/, ""), 200) : ""; }
  function dataOf(t) {
    var c0 = condOf(t), out = [];
    clauses(t).forEach(function (c) {
      if (!/[0-9۰-۹]/.test(c) || /[؟?]\s*$/.test(c) || COND_RE.test(c) || (c0 && nz(c).indexOf(nz(c0)) >= 0)) return;
      var x = txt(c.replace(/^(?:فرض\s*(?:کنید|کن|کنیم)\s*(?:که)?|داده(?:م|ها|‌ها|‌ام)?\s*[:：]?|اینم\s*بگم\s*(?:که)?)\s*/, "").replace(/\s+و\s*$/, ""));
      if (toks(x).length && out.length < 4 && !out.some(function (y) { return nz(y) === nz(x); })) out.push(clip(x, 160));
    });
    return out;
  }
  /* گام‌های طرح به ترتیبِ خودش: «اول … ، بعد … ، آخرشم …» */
  function planPieces(t) {
    var T = txt(t).replace(/^(?:خب|پس|طرحم(?:\s*اینه)?|برنامه‌?م(?:\s*اینه)?)\s*[:：،]?\s*/, "").replace(/^(?:اول(?:ش|ا|اً)?|نخست|اولاً)\s+/, "");
    return T.split(/\s*(?:[،,؛;]|\.(?=\s))\s*(?:(?:و\s*)?(?:بعد(?:ش|شم|ش\s*هم)?|سپس|آخر(?:ش|شم|ش\s*هم|سر)?|در\s*آخر|آنگاه|آن‌گاه)\s+)?|\s+(?:و\s*)?(?:بعد(?:ش|شم)?|سپس|آخر(?:ش|شم)|در\s*آخر|آنگاه|آن‌گاه)\s+/)
      .map(function (x) { return txt(x).replace(/[.،,]+$/, ""); }).filter(function (x) { return toks(x).length >= 1 && x.length >= 2; }).slice(0, 8);
  }
  ST.planPieces = planPieces; ST.dataOf = dataOf; ST.condOf = condOf;
  function sentences(t) { return String(t || "").split(/(?<=[.!؟?…])\s+|\n+/).map(txt).filter(Boolean); }
  /* مجهول به حرفِ خودش: جمله‌ای از پیامش که بیشترین هم‌واژگی را با صورتِ همین مسئله دارد — نه جملهٔ کناری («ولی خب، ۵ منهای ۳ چرا نمیشه؟»)؛ بی صورت ⇒ همان unkPhrase ِ a27 */
  function unkOf(t, stmt, whole) {
    var base = toks(stmt), S0 = sentences(t).map(function (x) { return x.replace(/^(?:یعنی|پس|خب|خوب|آره|بله)\s*[:：،]?\s*/, ""); }).filter(function (x) { return toks(x).length >= 2 && !(whole && nz(whole).indexOf(nz(x)) >= 0) && !WHOLE_RE.test(" " + x); });
    var best = "", bn = 0; if (base.length) S0.forEach(function (x) { var n = toks(x).filter(function (w) { return hit(w, base); }).length; if (n > bn) { bn = n; best = x; } });
    if (best) return best.replace(/[.!…]+$/, "");
    if (whole) return "";
    var up = AS.unkPhrase ? AS.unkPhrase(t) : t; return !AS.unkOk21 || AS.unkOk21(up) ? up : "";
  }
  /* طرح به حرفِ خودش: جمله‌هایی از پیامش که گام می‌گویند («اول … بعد …»، «… می‌کنم/می‌ذارم») — نه حدس یا داده‌ای که کنارش گفت */
  var PLAN_MARK = /(?:^|\s)(?:اول|بعد|سپس|آخر|نخست|طرحم|برنامه‌?م)(?![آ-ی])|می[‌\s]?(?:کنم|ذارم|گذارم|شمارم|برم|خرم|نویسم|سنجم|پرسم|گیرم)(?![آ-ی])|میکنم|میذارم/;
  function planText(t) { var S0 = sentences(String(t || "").replace(/^(?:نه|آره|باشه)[،,\s]+/, "")), P = S0.filter(function (x) { return PLAN_MARK.test(x); }); return txt((P.length ? P : S0).join(" ")); }
  /* قصدِ آینده («می‌خوام … حساب کنم») گزارشِ گام نیست */
  var FUTURE = /(?:می[‌\s]?خوام|می[‌\s]?خواهم|قراره|باید)\s+[^.!؟?\n]{0,30}(?:کنم|بکنم|بگیرم|بزنم|بنویسم|بشمرم|حساب)/;

  /* ---------- دفترِ مسئله در سشن: pk ِ هر لحظه (C.pkLog) و مالکِ هر رویداد ---------- */
  function pkLog(s, at) {
    var C = (s && s.coach) || null; if (!C || !C.pk) return; var L = C.pkLog = C.pkLog || [];
    if (!L.length || L[L.length - 1].pk !== C.pk) L.push({ pk: C.pk, at: String(at || nowIso()) });
    if (L.length > 60) C.pkLog = L.slice(-60);
  }
  ST.pkAt = function (se, at) { var L = ((se && se.coach) || {}).pkLog || [], o = L.length ? L[0].pk : ""; L.forEach(function (e) { if (String(e.at) <= String(at || "~")) o = e.pk; }); return o; };
  function pkStart(se, pk) { var L = ((se && se.coach) || {}).pkLog || [], o = ""; L.forEach(function (e) { if (e.pk === pk && !o) o = e.at; }); if (o) return o; var f = ((se && se.msgs) || []).filter(isUser)[0]; return f ? String(f.at || "") : ""; }
  function pkEnd(se, pk) { var L = ((se && se.coach) || {}).pkLog || [], i = -1; L.forEach(function (e, j) { if (e.pk === pk) i = j; }); return i >= 0 && L[i + 1] ? String(L[i + 1].at) : "~"; }
  ST.pkWindow = function (se, pk) { return { from: pkStart(se, pk), to: pkEnd(se, pk) }; };
  function pidAt(se, at) { var L = (se && se.lprobLog) || [], o = ""; L.forEach(function (e) { if (e && e.p && String(e.at || "") <= String(at || "~")) o = e.p; }); return o || (L.length ? "" : (se && se.lprob) || ""); }
  /* رویدادِ گفت‌وگو در لحظهٔ at مالِ مسئلهٔ زندهٔ pid است اگر: سشن در آن لحظه به pid بسته بود، یا در پنجرهٔ مسئلهٔ گفت‌وگویی بود که بعدتر همین pid شد (chatImp) */
  ST.owns = function (se, pid, at) {
    if (!se || !pid) return true; var a = String(at || "");
    var pg = S.get("eprog_" + pid), I = (pg && pg.solve && pg.solve.live && pg.solve.live.chatImp) || null;
    if (I && I.sess === se.id && a >= String(I.from || "") && a <= String(I.to || "~")) return true;
    if (!a) return pidAt(se, "~") === pid;
    return pidAt(se, a) === pid;
  };
  /* زمانِ پیامِ خودش که تکهٔ اصلاح‌شده از آن بود (آخرین پیامِ او پیش از اصلاح که تکه را دارد) */
  ST.fragAt = function (se, frag, at) {
    var f = nz(frag), o = ""; if (!f) return String(at || "");
    ((se && se.msgs) || []).filter(isUser).forEach(function (m) { if (String(m.at || "") <= String(at || "~") && nz(m.text).indexOf(f) >= 0 && String(m.at || "") < String(at || "~")) o = String(m.at || ""); });
    return o || String(at || "");
  };

  /* ---------- دفترِ داستان: s.coach.story[key] (key = «L:pid» یا pk ِ مسئلهٔ گفت‌وگو) ---------- */
  function keyFor(s, pid) { return pid ? "L:" + pid : String(((s && s.coach) || {}).pk || "c:0"); }
  function storyOf(s, key, make) { var C = s.coach = s.coach || {}, T = C.story = C.story || {}; if (!T[key] && make) T[key] = { items: [] }; return T[key] || { items: [] }; }
  ST.items = function (s, key) { return storyOf(s, key).items.slice(); };
  /* مرحله‌ای که داستانِ سنجیده نشان می‌دهد: فهمِ تمام (کل، یا مجهول با داده/شرط) ⇐ طرح؛ طرح یا گزارشِ گام ⇐ اجرا؛ نتیجه ⇐ بازنگری */
  function phaseOfItems(I) {
    var has = {}; (I || []).forEach(function (x) { has[x.k] = 1; });
    if (has.res) return "b"; if (has.plan || has.step) return "c";
    if (has.whole || (has.u && (has.c || has.d))) return "p";
    return has.u || has.c || has.d ? "u" : "";
  }
  ST.phaseOfItems = phaseOfItems;
  var EV_T = { whole: "کل در یک جمله (از گفت‌وگو)", u: "مجهول (از گفت‌وگو)", c: "شرط (از گفت‌وگو)", d: "داده (از گفت‌وگو)", plan: "طرح (از گفت‌وگو)", step: "گام (از گفت‌وگو)", res: "نتیجه (از گفت‌وگو)", lb: "بازنگری (از گفت‌وگو)" };
  var EV_K = { whole: "cwhole", u: "cunk", c: "ccond", d: "cdata", plan: "cplan23", step: "cstep", res: "cres", lb: "clb" };
  ST.EV_K = EV_K;
  function logEv(s, pid, it, um, key) {
    if (!A.EVLOG || !A.EVLOG.add) return;
    var lines = [it.t].concat(it.k === "plan" && (it.pieces || []).length > 1 ? it.pieces.map(function (p, i) { return "گامِ " + fa(i + 1) + ": " + p; }) : []).concat(it.q ? ["پرسش: «" + clip(it.q, 120) + "»"] : []);
    var src = um ? { sess: s.id, mid: mid(um), text: um.text, at: um.at || "", title: s.title || "" } : null;
    try { A.EVLOG.add(Object.assign(pid ? { pid: pid } : { sess: s.id }, { id: "st23_" + key.replace(/[^\w]/g, "_") + "_" + it.k + "_" + it.n, k: EV_K[it.k], at: it.at, title: EV_T[it.k], lines: lines, out: "", src: src, by: "coach" })); } catch (e) { }
  }
  /* پرسشِ بازنگری ⇐ خانهٔ فرمِ بازنگری */
  function lbField(q) { var x = nz(q); return /راه\S*\s*دیگر/.test(x) ? "other" : /یک\s*نگاه/.test(x) ? "glance" : /وارسی|چک/.test(x) ? "chkHow" : /(?:کجای\s*دیگر|جای\s*دیگر|به\s*کار\s*(?:می|ببر))/.test(x) ? "use" : ""; }

  /* ---------- نوبت: پس از سنجشِ a27 (C.saidOk ِ همین پیام) ---------- */
  function onState(s, a) {
    var um = lastUser(s); if (!um || !a || typeof a !== "object") return;
    var C = s.coach = s.coach || {}, ut = String(um.text || ""); pkLog(s, um.at);
    var so = C.saidOk && C.saidOk.at === String(um.at || "") ? C.saidOk : null;
    if (AS.RECALL22 && AS.RECALL22.test(ut)) return;                     // گزارشِ تمرین/یادآوری کارِ این مسئله نیست (بانکِ R23 #85)
    var bl = null; try { bl = AS.boundLive ? AS.boundLive(s) : null; } catch (e) { }
    var pid = (so && so.live) || (bl && !bl.done && bl.pid) || "", key = keyFor(s, pid);
    /* said ِ سنجیدهٔ a27 (صورتِ چسبانده فقط با برچسبِ صریح)؛ «کل» با نشانهٔ صریحِ خودش («کلش اینه: …»، «در یک جمله: …») حتی در پیامِ نخست — مدل گزارشِ وضعِ همین پیام را داد */
    var said = so ? so.said : [], real = !!(so && so.real), I = [];
    var w = so ? wholeSaid(ut) : ""; if (w) I.push({ k: "whole", t: w });
    if (real && said.length) {
      if (said.indexOf("u") >= 0) { var up = unkOf(ut, stmtOf(s, pid), w); if (up) I.push({ k: "u", t: clip(up, 160) }); }
      if (said.indexOf("c") >= 0) { var c = condOf(ut); if (c) I.push({ k: "c", t: c }); }
      if (said.indexOf("d") >= 0) dataOf(ut).forEach(function (d) { I.push({ k: "d", t: d }); });
      if (said.indexOf("plan") >= 0) {
        var pt = txtOf(a.plan); pt = pt && quoteIn(pt, ut) ? (A.PRE && A.PRE.herSpan ? A.PRE.herSpan(pt, ut) : pt) : planText(ut);
        if (toks(pt).length >= 2) I.push({ k: "plan", t: clip(pt, 400), pieces: planPieces(pt) });
      }
      if (said.indexOf("result") >= 0) { var rt = txtOf(a.result); I.push({ k: "res", t: clip(rt && quoteIn(rt, ut) ? rt : ut, 300) }); }
    }
    /* گزارشِ گام (step) — نقلِ همین پیامِ خودش، نه قصدِ آینده؛ برای مسئلهٔ زنده a38 خودش گامِ باز را می‌بندد (A.liveStepReport) و این‌جا فقط داستان */
    var sp = a.step && typeof a.step === "object" ? a.step : null, sq = sp ? txt(sp.quote || sp.what || sp.text || "") : "";
    if (sp && sq && quoteIn(sq, ut) && !FUTURE.test(sq) && toks(sq).length >= 2 && sp.done !== "no") I.push({ k: "step", t: clip(A.PRE && A.PRE.herSpan ? A.PRE.herSpan(sq, ut) : sq, 200) });
    /* پاسخِ پرسشِ بازنگری (ans ِ سنجیده) */
    if (real && so) (so.ans || []).forEach(function (q) { var f = lbField(q); if (f && toks(ut).length >= 2) I.push({ k: "lb", t: clip(ut, 300), q: q, f: f }); });
    /* مجهولِ کوتاهِ مدل (coach_state.unknown) — فقط اگر هر واژهٔ معنادارش در صورت/کلِ همین مسئله هست (نه مجهولِ مسئلهٔ دیگر) */
    var uk = txtOf(a.unknown); if (uk) { var base = toks([stmtOf(s, pid), (storyOf(s, key).items.filter(function (x) { return x.k === "whole"; })[0] || {}).t].join(" ")), uw = toks(uk).filter(function (w) { return !/^(?:تعداد|مقدار|اندازه|قیمت|بهترین|کدوم|کدام)$/.test(stem(w)); });
      if (uw.length && uw.every(function (w0) { return hit(w0, base); })) { var E0 = storyOf(s, key, true); E0.unk = { t: clip(uk, 100), at: String(um.at || nowIso()) }; } }
    if (!I.length) { try { S.put(s); } catch (e) { } return; }
    var E = storyOf(s, key, true), m0 = mid(um), at = String(um.at || nowIso()), added = [];
    I.forEach(function (it) {
      if (E.items.some(function (x) { return x.k === it.k && x.mid === m0 && nz(x.t) === nz(it.t); })) return;
      it.at = at; it.mid = m0; it.n = E.items.length + 1; E.items.push(it); added.push(it); logEv(s, pid, it, um, key);
    });
    if (pid && added.length) feed(pid, s, added, um);
    try { S.put(s); } catch (e) { }
  }
  function stmtOf(s, pid) { if (pid) { var r = A.liveRec && A.liveRec(pid); return r ? r.p.statement : ""; } return ((s && s.coach) || {}).stmt || ""; }

  /* ---------- فرم‌های مسئلهٔ زنده: فقط خانهٔ خالی، با «از گفت‌وگو … درست است؟» ---------- */
  function newDraft(r) { return { type: (r && r.p && r.p.kind) || "find", nat: "", one: "", why: "", u: "", dl: [], c: "", rel: "", suff: "", suffWhy: "", suffChal: "", sat: "", fig: "", dead: "", prac: {}, nota: [], figc: {}, restate: "", restateWhy: "", guess: "", conf: "", test: "", testRes: "", ifRef: "", gWant: "", gContra: "", gChal: "" }; }
  function feed(pid, s, items, um) {
    var r = A.liveRec && A.liveRec(pid), pg = S.get("eprog_" + pid); if (!r || !pg) return;
    var so = pg.solve = pg.solve || {}, L = so.live = so.live || {}, uDone = !!(so.u && so.u[1] && so.u[1].done) && !L.reU;
    var srcOf = function (it, k) { try { var se = S.get(s.id) || s, m = (se.msgs || []).filter(function (x) { return mid(x) === it.mid; })[0] || um; return A.liveMkSrc && m ? A.liveMkSrc(s.id, m, k, it.t) : null; } catch (e) { return null; } };
    var dirty = false;
    if (!uDone && L.state !== "solved" && L.state !== "abandoned") {
      var d = L.uDraft ? L.uDraft : newDraft(r), ch = d.chat = d.chat || {}, uk = false;
      items.forEach(function (it) {
        var f = { whole: "one", u: "u", c: "c" }[it.k];
        if (f) { if (ch[f] || txt(d[f])) return; d[f] = it.t; ch[f] = { t: it.t, at: it.at, mid: it.mid, st: "ask" }; var sr = srcOf(it, f === "one" ? "stmt" : f === "c" ? "cond" : "unknown"); if (sr) { d.src = d.src || {}; d.src[f] = sr; } if (f === "one") d.wholeOk = true; uk = true; return; }
        if (it.k === "d") { d.dl = d.dl || []; if (d.dl.some(function (x) { return nz(x.t) === nz(it.t) || (x.chat && nz(x.chat.t) === nz(it.t)); })) return;
          var row = d.dl.filter(function (x) { return !txt(x.t) && !x.chat; })[0], mx = 0; d.dl.forEach(function (x) { var n = +String(x.id || "").replace(/\D/g, "") || 0; if (n > mx) mx = n; });
          if (!row) { row = { id: "d" + (mx + 1), t: "" }; d.dl.push(row); }
          row.t = it.t; row.chat = { t: it.t, at: it.at, mid: it.mid, st: "ask" }; var sr2 = srcOf(it, "datum:" + row.id); if (sr2) row.src = sr2; uk = true; }
      });
      if (uk) { if (d.wholeOk == null && txt(d.one) && ch.one) d.wholeOk = true; L.uDraft = d; dirty = true; }
    }
    items.forEach(function (it) {
      if (it.k === "plan" && !(L.plan && L.plan.at) && !txt(L.planDraft) && !L.planChat) { L.planDraft = it.t; L.planChat = { t: it.t, at: it.at, mid: it.mid, st: "ask", pieces: it.pieces || [] }; dirty = true; }
      if (it.k === "lb" && L.state === "solved") { var bd = L.bDraft = L.bDraft || {}, lc = L.lbChat = L.lbChat || {}; if (!lc[it.f] && !txt(bd[it.f])) { bd[it.f] = it.t; lc[it.f] = { t: it.t, at: it.at, mid: it.mid, st: "ask", q: it.q }; dirty = true; } }
    });
    var ph = phaseOfItems(storyOf(s, keyFor(s, pid)).items.concat(L.chatImpItems || []));
    if (ph && ph !== L.chatPh && maxPh(L.chatPh, ph) === ph) { L.chatPh = ph; L.chatPhAt = nowIso(); dirty = true; }
    if (dirty) { S.put(pg); try { if (A.liveDraftDrop) A.liveDraftDrop(pid); } catch (e) { } }
  }
  ST.feed = feed;
  /* مرحلهٔ یک منبع: فرم یا داستانِ سنجیده (هر کدام جلوتر)؛ حل‌شده/بازنگری/کنارگذاشته از فرم */
  A.liveStoryPhase = function (pid) {
    var ph = A.livePhase ? A.livePhase(pid) : ""; if (ph === "b" || ph === "done") return ph;
    var pg = S.get("eprog_" + pid), L = (pg && pg.solve && pg.solve.live) || {}; if (L.state === "solved" || L.state === "abandoned") return ph;
    return maxPh(ph, L.chatPh || "");
  };
  A.liveStoryAhead = function (pid) { var ph = A.livePhase ? A.livePhase(pid) : "", sp = A.liveStoryPhase(pid); return !!sp && ORD[sp] > ORD[ph || "u"]; };

  /* ---------- مسئلهٔ زنده‌ای که بعدتر از همین گفت‌وگو ساخته شد ⇐ همان کارِ گفت‌وگو (B·D5) ---------- */
  function importChat(s, pid) {
    var C = (s && s.coach) || {}, pk = String(C.pk || "c:0"), pg = S.get("eprog_" + pid); if (!pg) return;
    var so = pg.solve = pg.solve || {}, L = so.live = so.live || {}; if (L.chatImp) return;
    var um0 = lastUser(s); pkLog(s, um0 && um0.at);   // مسئلهٔ گفت‌وگویی که همین پیام آغاز کرد هم آغازش ثبت شود (پنجره از همان پیام، نه از آغازِ سشن)
    var E = storyOf(s, pk), win = ST.pkWindow(s, pk);
    /* دورِ ۲۴ (R7، A23-32): هر رویدادِ گفت‌وگو مالِ مسئلهٔ خودش — اگر pk ِ کنونی هنوز مسئلهٔ پیشینِ گفت‌وگوست (مسئلهٔ تازه وسطِ همان گفت‌وگو آمد و pk عوض نشد)،
       پنجرهٔ مسئلهٔ زنده از پیامی آغاز می‌شود که صورتِ خودِ این مسئله را گفت، نه از آغازِ مسئلهٔ پیشین (حدسِ «۱۰۰» و گام‌های «۳ نفر» ِ دست‌دادن مالِ «پیشنهادِ کار» نیست) */
    var from24 = win.from, cut24 = false;
    try { var lr = A.liveRec ? A.liveRec(pid) : null, stm = lr && lr.p ? txt(lr.p.statement || lr.p.title) : "", base = toks(stm).filter(function (w, i, X) { return X.indexOf(w) === i; });
      if (base.length >= 3) { var UM = (s.msgs || []).filter(function (m) { return isUser(m) && String(m.at || "") >= String(win.from || ""); }), sc = UM.map(function (m) { return toks(m.text).filter(function (w, i, X) { return X.indexOf(w) === i && hit(w, base); }).length; }), mx = Math.max.apply(null, sc.concat([0]));
        var si = sc.indexOf(mx); if (si > 0 && mx >= Math.max(2, Math.ceil(base.length * 0.4)) && sc[0] * 2 < mx) { from24 = String(UM[si].at || from24); cut24 = true; } } } catch (e) { }
    var items24 = cut24 ? E.items.filter(function (x) { return !x.at || String(x.at) >= from24; }) : E.items;
    L.chatImp = { sess: s.id, pk: pk, from: from24, to: nowIso(), n: items24.length };
    if (cut24) L.chatImp.cut = win.from;
    L.chatImpItems = items24.map(function (x) { return { k: x.k, t: x.t, at: x.at, mid: x.mid, pieces: x.pieces, n: x.n }; });
    if (E.unk && (!cut24 || items24.some(function (x) { return x.k === "u" || x.k === "whole"; }))) L.chatUnk = E.unk;
    /* پشتهٔ پیش‌نیازِ بازِ گفت‌وگو (اگر هست) با همان حالت به مسئلهٔ زنده می‌رود — جای منتظر گم نمی‌شود (پشتهٔ مسئلهٔ پیشینِ گفت‌وگو نه) */
    try { var P = cut24 ? null : (C.pre22 || {})[pk]; if (P && (P.st || []).length && A.PRE && A.PRE.store) { var R = A.PRE.store({ pid: pid }); if (R && !(R.X.st || []).length) { R.X.st = JSON.parse(JSON.stringify(P.st)); R.X.n = P.n || R.X.st.length; R.X.from = { sess: s.id, pk: pk }; } } } catch (e) { }
    S.put(pg);
    if (items24.length) feed(pid, s, items24, lastUser(s));
  }
  ST.importChat = importChat;
  /* هر راهِ ساختن (live_new، chat_solved، chat_invent، فرمِ صفحه با سشن) از A.liveCreate ِ a38 یا create ِ درونیِ آن می‌گذرد و رکوردِ تازهٔ eprob با sess می‌نویسد؛
     پس از نوشتنِ eprog ِ همان مسئله، کارِ گفت‌وگو وارد می‌شود (یک بار — L.chatImp) */
  var pendImp = {};
  if (!S.put._r23story) {
    var rawPut = S.put;
    S.put = function (r) {
      var nw = ""; try { if (r && r.type === "eprob" && r.live && r.sess && r.p && !S.get(r.id)) nw = r.p.id; } catch (e) { }
      var o = rawPut.apply(this, arguments);
      try {
        if (nw) pendImp[nw] = r.sess;
        if (r && r.type === "eprog") { var pid = String(r.id || "").replace(/^eprog_/, ""), sid = pendImp[pid]; if (sid) { delete pendImp[pid]; var se = S.get(sid); if (se && se.type === "achat") importChat(se, pid); } }
      } catch (e) { console.warn(e); }
      return o;
    };
    Object.keys(rawPut).forEach(function (k) { S.put[k] = rawPut[k]; });
    S.put._r23story = true;
  }
  if (AS.DO && AS.DO.coach_state && !AS.DO.coach_state._r23story) {
    var rawCS = AS.DO.coach_state;
    AS.DO.coach_state = function (a) {
      var r = rawCS.apply(this, arguments);
      try { onState(AS._turnSession, a); } catch (e) { console.warn(e); }
      return r;
    };
    Object.keys(rawCS).forEach(function (k) { AS.DO.coach_state[k] = rawCS[k]; });
    AS.DO.coach_state._r23story = true;
  }
  AS.promptHooks = AS.promptHooks || [];
  AS.promptHooks.push(function (s) { try { var um = lastUser(s); if (um) pkLog(s, um.at); } catch (e) { } return ""; });
  AS.afterTurnHooks = AS.afterTurnHooks || [];
  AS.afterTurnHooks.push(function (s) { try { var um = lastUser(s); if (um) { pkLog(s, um.at); S.put(s); } } catch (e) { } });

  /* ---------- مقصد، مبدأ، طرحِ همین مسئله (برای «🧭» و نوار) ---------- */
  function qSentence(t) { var L = String(t || "").match(/[^.!؟?\n]*[؟?]/g) || []; L = L.map(txt).filter(function (x) { return toks(x).length >= 1; }); return L.length ? L[L.length - 1] : ""; }
  ST.stmtOfSess = function (se) { var C = (se && se.coach) || {}; if (txt(C.stmt)) return txt(C.stmt); var f = ((se && se.msgs) || []).filter(isUser)[0]; return f ? txt(f.text) : ""; };
  ST.dest = function (rid) {
    if (rid.pid) {
      var pg = S.get("eprog_" + rid.pid), so = (pg && pg.solve) || {}, L = so.live || {}, u = (so.u && so.u[1]) || L.uDraft || {}, r = A.liveRec && A.liveRec(rid.pid);
      if (txt(u.u)) return clip(u.u, 100);
      if (L.chatUnk && txt(L.chatUnk.t)) return clip(L.chatUnk.t, 100);
      var q = r ? qSentence(r.p.statement) : ""; if (q) return clip(q, 100);
      return r ? "خواستهٔ «" + clip(r.p.title, 60) + "»" : "خواستهٔ مسئله";
    }
    var se = S.get(rid.sess), C = (se && se.coach) || {}, E = storyOf(se || {}, String(C.pk || "c:0")), st = ST.stmtOfSess(se);
    if (E.unk && txt(E.unk.t)) return clip(E.unk.t, 100);
    var q2 = qSentence(st); if (q2) return clip(q2, 100);
    /* مجهولِ به حرفِ خودش فقط اگر به صورتِ همین مسئله می‌خورد — جملهٔ کناری («ولی خب ۵ منهای ۳ چرا نمیشه») مقصد نیست */
    var ub = C.unkBy && C.pk ? txt(C.unkBy[C.pk]) : "", bt = toks(st); if (ub && toks(ub).filter(function (w) { return hit(w, bt); }).length >= Math.max(1, Math.ceil(toks(ub).length / 2))) return clip(ub, 100);
    return "خواستهٔ مسئله";
  };
  /* طرحِ همین مسئله: فرمِ صفحه، وگرنه طرحِ سنجیدهٔ گفت‌وگو (گام‌هایش به ترتیبِ خودش) و چند گامش انجام شد */
  ST.plan = function (rid) {
    var items = [];
    if (rid.pid) { var pg = S.get("eprog_" + rid.pid), L = (pg && pg.solve && pg.solve.live) || {};
      if (L.plan && txt(L.plan.t)) return { src: "page", t: L.plan.t };
      items = (L.chatImpItems || []).slice(); S.all("achat", function (x) { return x && x.coach && x.coach.story && x.coach.story["L:" + rid.pid]; }).forEach(function (se) { items = items.concat(se.coach.story["L:" + rid.pid].items); });
      var stDone = (L.steps || []).filter(function (x) { return x && x.out && !x.out.auto && x.out.done === "yes"; }).length;
      return planFrom(items, stDone);
    }
    var se = S.get(rid.sess), C = (se && se.coach) || {}; return planFrom(storyOf(se || {}, String(C.pk || "c:0")).items, 0);
  };
  function planFrom(items, extraDone) {
    var P = items.filter(function (x) { return x.k === "plan"; }).pop(); if (!P) return null;
    var pcs = (P.pieces && P.pieces.length ? P.pieces : planPieces(P.t)), done = items.filter(function (x) { return (x.k === "step" || x.k === "res") && String(x.at) >= String(P.at); }).length + (extraDone || 0);
    if (items.some(function (x) { return x.k === "res" && String(x.at) >= String(P.at); })) done = pcs.length;
    return { src: "chat", t: P.t, pieces: pcs, done: Math.min(done, pcs.length), cur: pcs[Math.min(done, pcs.length - 1)] || "", at: P.at };
  }
  ST.phaseSess = function (se) { var C = (se && se.coach) || {}; return maxPh(String(C.ph || ""), phaseOfItems(storyOf(se || {}, String(C.pk || "c:0")).items)); };
  /* مسئلهٔ گفت‌وگوی این pk مسئلهٔ زنده شد؟ (آن‌گاه نوار/نقشه مالِ همان مسئلهٔ زنده است، نه مرحلهٔ کهنهٔ گفت‌وگو) */
  ST.livedPk = function (se, pk) { var o = ""; S.all("eprog", function (pg) { var I = pg && pg.solve && pg.solve.live && pg.solve.live.chatImp; return !!(I && I.sess === (se && se.id) && I.pk === pk); }).forEach(function (pg) { o = String(pg.id).replace(/^eprog_/, ""); }); return o; };

  /* ---------- «از گفت‌وگو: «…» — درست است؟» روی فرم‌ها (پس از هر رسم) ---------- */
  function chip(t, onOk, onEdit, cls) {
    return h("div", { class: "lp-fromchat small " + (cls || ""), dir: "rtl", role: "group", "aria-label": "از گفت‌وگو" },
      h("span", {}, "از گفت‌وگو: «" + clip(t, 160) + "» — درست است؟ "),
      h("button", { class: "btn sm lp-fc-ok", type: "button", onclick: onOk }, "✓ درست است"),
      h("button", { class: "btn ghost sm lp-fc-edit", type: "button", onclick: onEdit }, "✏️ ویرایش"));
  }
  function after(el, node) { if (!el) return; var host = el.closest ? (el.closest("label, .field, .fld") || el) : el; if (host.parentNode) host.parentNode.insertBefore(node, host.nextSibling); }
  function paintChips(pid) {
    var m = document.getElementById("main"); if (!m || m.querySelector(".lp-fromchat[data-p23]")) return;
    var pg = S.get("eprog_" + pid); if (!pg || !pg.solve || !pg.solve.live) return; var L = pg.solve.live, d = L.uDraft, put = function () { S.put(pg); if (A.liveDraftDrop) A.liveDraftDrop(pid); A.render(); };
    /* خانه‌ای که هنوز روی صفحه نیست (جزءهای فهم پیش از «ثبتِ کل»، فرمِ طرح پیش از مرحلهٔ طرح) ⇒ همان «از گفت‌وگو … درست است؟» در جعبهٔ بالای صفحه — نه پنهان، نه دوباره پرسیده */
    var FB = { lpPlan: "طرح", lpUnk: "مجهول", lpCond: "شرط", lpBOther: "راهِ دیگر", lpBGlance: "در یک نگاه", lpBChk: "وارسی", lpBUse: "درس" }, fbox = null;
    function fbHost() { if (fbox) return fbox; fbox = h("section", { class: "card soft lp-fromchat-box", dir: "rtl" }, h("h4", {}, "از گفت‌وگو — هر کدام در فرمِ خودش می‌نشیند")); var at = m.querySelector(".lp-stmt") || m.querySelector(".page .phead"); if (at && at.parentNode) at.parentNode.insertBefore(fbox, at.nextSibling); else (m.querySelector(".page") || m).appendChild(fbox); return fbox; }
    function mk(rec, val, elId, onOk) { if (!rec || rec.st !== "ask") return; var el = document.getElementById(elId);
      if (!el) { if (!txt(val) || nz(val) !== nz(rec.t)) return; var lb = FB[elId] || (/^lpD_/.test(elId) ? "داده" : ""); if (!lb) return;
        var c0 = chip(lb + ": " + rec.t, function () { rec.st = "ok"; rec.okAt = nowIso(); if (onOk) onOk(); put(); }, function () { rec.st = "edit"; S.put(pg); if (A.liveDraftDrop) A.liveDraftDrop(pid); A.render(); }); c0.setAttribute("data-p23", elId); fbHost().appendChild(c0); return; }
      if (nz(el.value != null ? el.value : val) !== nz(rec.t)) return;
      /* ✏️: فقط خانه را به او می‌سپارد (پیش‌نویسِ صفحه نوشتهٔ او را نگه می‌دارد؛ نشان با مقدارِ متفاوت دیگر نمی‌آید و گفت‌وگو هرگز دوباره پرش نمی‌کند) */
      var c = chip(rec.t, function () { rec.st = "ok"; rec.okAt = nowIso(); if (onOk) onOk(); put(); }, function () { try { el.focus(); el.select && el.select(); } catch (e) { } var w = document.querySelector('.lp-fromchat[data-p23="' + elId + '"]'); if (w) w.remove(); });
      c.setAttribute("data-p23", elId); after(el, c); }
    if (d && d.chat) { mk(d.chat.one, d.one, "lpOne", function () { d.wholeOk = true; }); mk(d.chat.u, d.u, "lpUnk"); mk(d.chat.c, d.c, "lpCond"); (d.dl || []).forEach(function (x) { if (x.chat) mk(x.chat, x.t, "lpD_" + x.id); }); }
    if (L.planChat) mk(L.planChat, L.planDraft, "lpPlan");
    if (L.lbChat && L.bDraft) Object.keys(L.lbChat).forEach(function (f) { mk(L.lbChat[f], L.bDraft[f], { other: "lpBOther", glance: "lpBGlance", chkHow: "lpBChk", use: "lpBUse" }[f] || ""); });
    /* صورتِ مسئله‌ای که از گفت‌وگو آمد: «از گفت‌وگو … درست است؟» روی کارتِ «صورتِ خودت» (بانکِ R23 #57) */
    var r = A.liveRec && A.liveRec(pid), sc = m.querySelector(".lp-stmt");
    if (r && sc && L.chatImp && !(L.stmtChat && L.stmtChat.st !== "ask") && !sc.querySelector(".lp-fromchat")) {
      var sc0 = L.stmtChat = L.stmtChat || { t: r.p.statement, st: "ask", at: nowIso() };
      var c2 = chip(r.p.statement, function () { sc0.st = "ok"; sc0.okAt = nowIso(); put(); }, function () { sc0.st = "edit"; S.put(pg); var b = m.querySelector(".lp-stedit, .lp-edit-stmt, [data-edit=statement]"); if (b) b.click(); A.render(); }, "lp-fc-stmt");
      c2.setAttribute("data-p23", "stmt"); sc.appendChild(c2);
    }
  }
  ST.paintChips = paintChips;
  if (typeof A.render === "function" && !A.render._r23story) {
    var rawR = A.render;
    A.render = function () { var out = rawR.apply(this, arguments); try { var st = A.state || {}; if (st.view === "lprob" && st.arg && A.liveRec && A.liveRec(st.arg)) paintChips(st.arg); } catch (e) { console.warn(e); } return out; };
    Object.keys(rawR).forEach(function (k) { A.render[k] = rawR[k]; });
    A.render._r23story = true;
  }
  /* نوشتنِ او (ویرایش) ⇒ نشانِ «از گفت‌وگو» برمی‌خیزد؛ پیش‌نویسِ صفحه نوشتهٔ او را نگه می‌دارد و مقدارِ گفت‌وگو هرگز برنمی‌گردد (فقط خانهٔ خالیِ بی‌سابقه پر می‌شود — بانکِ R23 #79) */
  if (typeof document !== "undefined") document.addEventListener("input", function (e) {
    try { var id = e.target && e.target.id; if (!id || !/^lp(?:One|Unk|Cond|D_|Plan$|BOther|BGlance|BChk|BUse)/.test(id)) return; var w = document.querySelector('.lp-fromchat[data-p23="' + id + '"]'); if (w) w.remove(); } catch (er) { }
  }, true);

  /* ---------- مدل می‌تواند نقشهٔ مسیرِ همین مسئله را باز کند (B·D17) ---------- */
  ST.routeIdOf = function (s) {
    if (!s) return ""; try { var b = AS.boundLive ? AS.boundLive(s) : null; if (b && b.pid) return b.pid; } catch (e) { }
    if (s.lprob && A.liveRec && A.liveRec(s.lprob)) return s.lprob;
    return ST.stmtOfSess(s) ? s.id : "";
  };
  AS.promptHooks.push(function (s, msg) {
    try { if (/^\s*\[/.test(String(msg || ""))) return ""; var id = ST.routeIdOf(s); if (!id) return "";
      var r = A.liveRec && A.liveRec(id);
      return "# 🧭 نقشهٔ مسیرِ همین مسئله\n- زمینه (نه پرسشِ دوم): «نقشهٔ مسیرم رو نشون بده» ⇒ {\"do\":\"go\",\"view\":\"route\",\"arg\":\"" + id + "\"} — " + (r ? "مسئلهٔ زندهٔ «" + clip(r.p.title, 50) + "»" : "مسئلهٔ همین گفت‌وگو (شناسهٔ سشن)") + "؛ از مبدأ (صورت) تا مقصد (مجهول)، گام‌ها، انحراف‌ها و اصلاح‌ها.";
    } catch (e) { return ""; }
  });
  if (AS.DO && AS.DO.go && !AS.DO.go._r23story) {
    var rawGo = AS.DO.go;
    AS.DO.go = function (a) {
      try { if (a && a.view === "route" && (a.arg == null || a.arg === "")) { var id = ST.routeIdOf(AS._turnSession || (AS.cur ? AS.cur() : null)); if (id) a = Object.assign({}, a, { arg: id }); } } catch (e) { }
      return rawGo.call(this, a);
    };
    Object.keys(rawGo).forEach(function (k) { AS.DO.go[k] = rawGo[k]; });
    AS.DO.go._r23story = true;
  }
  A.VIEW_FA = A.VIEW_FA || {}; if (!A.VIEW_FA.route) A.VIEW_FA.route = "🧭 نقشهٔ مسیرِ مسئله";
})(APP);
