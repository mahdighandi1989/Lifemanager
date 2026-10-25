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
  /* دورِ ۲۴ (R2، B24·D3): «در یک جمله» / «به طورِ خلاصه» نشانهٔ «کل» است فقط در آغازِ جمله یا پس از نامِ خودِ مسئله — «کارکرد در یک جمله: …» (گامِ ۳ ِ طرحش) کلِ مسئله نیست */
  var WHOLE_PRE_OK = /^(?:کل|کلش|کلِ|مسئله|مساله|مسئلهٔ|ماجرا|قضیه|خلاصه|یعنی|پس|خب|خوب|آره|بله|باشه|کن|بگم|بگویم)$/;
  function wholeSaid(t) {
    var T = String(t || ""), m = WHOLE_RE.exec(T); if (!m) return "";
    var j = m[0].search(/در\s*یک\s*جمله|به\s*(?:طورِ?|طور)\s*خلاصه/);
    if (j >= 0 && !/^(?:کلش|کلِ?\s*(?:مسئله|مساله|ماجرا|کار|قضیه|داستان))/.test(m[0].replace(/^[\s.،!؟?:«]+/, ""))) {
      var pre = T.slice(0, m.index + j).replace(/\s+$/, ""), lw = (pre.split(/\s+/).pop() || "");
      if (pre && !/[.!؟?:：،,«\-–—]$/.test(pre) && !WHOLE_PRE_OK.test(lw.replace(/[ِ‌]+$/, ""))) return "";
    }
    var body = m[1], end = body.search(/[.!؟?](?=\s|$)(?![^«]*»)/); if (end > 0) body = body.slice(0, end + (/[؟?]/.test(body[end]) ? 1 : 0));
    body = txt(body).replace(/^[:：،\-–\s]+/, "");
    return toks(body).length >= 3 ? clip(body, 300) : "";
  }
  ST.wholeSaid = wholeSaid; AS.wholeSaid = wholeSaid;
  function clauses(t) { return String(t || "").split(/[.!؟?؛;\n]+(?=\s|$)|،\s*|,\s+|\s+و\s+(?=(?:شرط|به\s*شرط))|\s+(?:ولی|اما)\s+/).map(txt).filter(Boolean); }
  var COND_RE = /(?:شرط(?:ش|ها|‌ها|مون)?\s*(?:اینه|این\s*است|اینست)\s*(?:که)?|به\s*شرطِ?\s*(?:این[‌\s]*که)?|شرط(?:ها|‌ها)?\s*[:：])\s*([^.!؟?\n]{3,})/;
  function condOf(t) { var m = COND_RE.exec(String(t || "")); return m ? clip(txt(m[1]).replace(/[،,]\s*$/, ""), 200) : ""; }
  /* دورِ ۲۴ (R2، A24-7، B24·D22): دادهٔ مسئله نه تلاشِ ردشده‌اش است («اولی را امتحان کردم: ساعت ۸ صبح …»)، نه پیامِ اصلاحش («یه اشتباه کردم: حقوقم ۱۸ نیست»)،
     نه بندِ منفی یا شرطی («اگه مستقل باشن …»). پیامِ اصلاح را سازوکارِ اصلاح می‌برد؛ این‌جا داده نمی‌شود. */
  var ATTEMPT24 = /امتحان\s*(?:ش\s*)?(?:کردم|کنم|کردیم)|آزمودم|آزمایش\s*کردم|حدس(?:م|\s*زدم|\s*می[‌\s]?زنم)|فرض\s*کردم|فکر\s*کردم/;
  var CORRMSG24 = /(?:یه|یک)?\s*اشتباه\s*(?:کردم|گفتم|نوشتم|زدم)|اشتباه\s*شد|ببخشید[،,\s]+(?:یه|یک|اشتباه|اصلاح)|(?:^|[\s،,])اصلاح(?:ش)?\s*(?:می[‌\s]?کنم|کنم)|(?:^|[\s،,])(?:نه|نخیر)\s*[،,]\s*[0-9۰-۹]/;
  var NEG24 = /(?:^|\s)(?:نیست|نبود|نیستن|نبودن|نمیشه|نمی[‌\s]?شه|نشد)(?=$|[\s.،,!؟?…])|(?:^|\s)نه(?=$|[\s.،,!؟?…])/;
  var COND24 = /^(?:اگه|اگر|فرض\s*کنیم\s*که|در\s*صورتی\s*که)\s/;
  function triedOf(t, fail) {
    var S1 = sentences(String(t || "")), out = [], on = false;
    S1.forEach(function (x) { var at = ATTEMPT24.test(x), rj = NEG24.test(x) || /(?:غلط|اشتباه)\s*(?:بود|درومد|درآمد)|خواب(?:م|یم)(?![آ-ی])/.test(x);
      if (at && (rj || fail)) on = true; if ((at && (rj || fail)) || (on && rj && /[0-9۰-۹]/.test(x))) { if (toks(x).length && /[0-9۰-۹]/.test(x)) out.push(clip(x, 160)); } else on = false; });
    return out;
  }
  ST.triedOf = triedOf;
  ST.corrMsg = function (t) { return CORRMSG24.test(String(t || "")); };
  function dataOf(t, fail) {
    var c0 = condOf(t), out = [], T0 = String(t || "");
    /* تلاشی که شکست گزارش شد (fail ِ coach_state): هر چه از نشانهٔ تلاش به بعد آمد خودِ تلاش است، نه داده */
    if (fail) { var ai = T0.search(ATTEMPT24); if (ai >= 0) T0 = T0.slice(0, ai); }
    T0 = sentences(T0).filter(function (x) { return !ATTEMPT24.test(x) && !CORRMSG24.test(x); }).join(" ");
    clauses(T0).forEach(function (c) {
      if (!/[0-9۰-۹]/.test(c) || /[؟?]\s*$/.test(c) || COND_RE.test(c) || (c0 && nz(c).indexOf(nz(c0)) >= 0)) return;
      if (NEG24.test(c) || COND24.test(c) || /…\s*$/.test(c)) return;
      var x = txt(c.replace(/^(?:فرض\s*(?:کنید|کن|کنیم)\s*(?:که)?|داده(?:م|ها|‌ها|‌ام)?\s*[:：]?|اینم\s*بگم\s*(?:که)?)\s*/, "").replace(/\s+و\s*$/, ""));
      if (toks(x).length && out.length < 4 && !out.some(function (y) { return nz(y) === nz(x); })) out.push(clip(x, 160));
    });
    return out;
  }
  /* گام‌های طرح به ترتیبِ خودش: «اول … ، بعد … ، آخرشم …» */
  /* دورِ ۲۴ (R2، B24·D3، D24-9): گام‌های طرح فقط از نشانه‌گذاریِ خودِ او — فهرستِ شماره‌دار/نشانه‌دار («۱) …»، «- …») — یا از طرحِ سنجیدهٔ مدل
     (coach_state.plan.steps، هر گام با نقلِ عینی از پیامش). پیام هرگز در ویرگول یا نقطه به گام بریده نمی‌شود؛ بی نشانه ⇒ یک گام (همهٔ طرح). */
  var LIST24 = /(?:^|\n)\s*(?:[0-9۰-۹]{1,2}\s*[).\-–:]|[-•*●▪])\s+|(?:^|[\s:：،,])\(?[0-9۰-۹]{1,2}\)\s+/g;
  function planPieces(t) {
    var T0 = String(t == null ? "" : t), L = [], m, ix = [];
    LIST24.lastIndex = 0; while ((m = LIST24.exec(T0))) ix.push({ i: m.index, j: m.index + m[0].length });
    if (ix.length >= 2) { ix.forEach(function (x, k) { /* فهرستِ خودش: هر قلم یک گام (سرِ «plan:»/«طرحم اینه:» گام نیست) */ var seg = txt(T0.slice(x.j, k + 1 < ix.length ? ix[k + 1].i : T0.length)).replace(/[.،,؛;]+$/, ""); if (toks(seg).length) L.push(seg); }); if (L.length >= 2) return L; L = []; }
    /* «اول …، بعد …» در یک جمله یک طرح است (بانکِ R24 #31) — گام‌ها را مدل با نقلِ هر گام (coach_state.plan.steps) می‌دهد و صفحه هر نقل را می‌سنجد (stepsOf) */
    var one = txt(T0).replace(/^(?:plan|طرح|برنامه)\s*[:：]\s*/i, "").replace(/[.،,؛;]+$/, ""); return one && toks(one).length ? [one] : [];
  }
  ST.planPiecesR23 = function (t) {   // قرنطینهٔ دورِ ۲۴ (REMOVAL_CANDIDATES): بُرشِ پیشین در هر ویرگول/نقطه — فقط برای مقایسه
    var T = txt(t).replace(/^(?:خب|پس|طرحم(?:\s*اینه)?|برنامه‌?م(?:\s*اینه)?)\s*[:：،]?\s*/, "").replace(/^(?:اول(?:ش|ا|اً)?|نخست|اولاً)\s+/, "");
    return T.split(/\s*(?:[،,؛;]|\.(?=\s))\s*(?:(?:و\s*)?(?:بعد(?:ش|شم|ش\s*هم)?|سپس|آخر(?:ش|شم|ش\s*هم|سر)?|در\s*آخر|آنگاه|آن‌گاه)\s+)?|\s+(?:و\s*)?(?:بعد(?:ش|شم)?|سپس|آخر(?:ش|شم)|در\s*آخر|آنگاه|آن‌گاه)\s+/)
      .map(function (x) { return txt(x).replace(/[.،,]+$/, ""); }).filter(function (x) { return toks(x).length >= 1 && x.length >= 2; }).slice(0, 8);
  };
  ST.planPieces = planPieces; ST.dataOf = dataOf; ST.condOf = condOf;
  function sentences(t) { return String(t || "").split(/(?<=[.!؟?…])\s+|\n+/).map(txt).filter(Boolean); }
  /* مجهول به حرفِ خودش: جمله‌ای از پیامش که بیشترین هم‌واژگی را با صورتِ همین مسئله دارد — نه جملهٔ کناری («ولی خب، ۵ منهای ۳ چرا نمیشه؟»)؛ بی صورت ⇒ همان unkPhrase ِ a27 */
  /* دورِ ۲۴ (R2، C24-11، D24-12): مجهول هرگز پرسشِ متا دربارهٔ سامانه/دستیار («… از کجا آوردی؟ یه قاعده‌ست تو سامانه؟»)، تلاش/طرح («فکر کردم دورش سه تا مثلث…»)،
     کمبودِ دانسته («مساحتِ مثلث رو نمی‌دونم») یا ترتیبِ کار («اول می‌خوام بفهمم…») نیست. نشانهٔ صریحِ مجهول («دنبالِ اینم که…»، «می‌خوام بدونم…»، «یعنی: …») مقدم است؛
     نقلِ داخلِ گیومه («یه جمله؟ «…»») خودش نامزد است. */
  var METAQ24 = /(?:گفتی|آوردی|ساختی|می[‌\s]?دونی|می[‌\s]?دانی|می[‌\s]?کنی|می[‌\s]?سنجی|داری|هستی|تویی|خودت|سامانه|برنامه\s*(?:است|ه)|قاعده|مدل|فرم|صفحه|ذخیره|دکمه|کجای\s*کار|نقشه|پرونده|کارنامه)[^.!؟?]*[؟?]\s*$/;
  var NOTUNK24 = /فکر\s*(?:کردم|می[‌\s]?کردم)|امتحان\s*(?:ش\s*)?(?:کردم|کنم)|حساب\s*کردم|(?:رو|را)\s*نمی[‌\s]?(?:دونم|دانم)|بلد\s*نیستم|خنگ|^(?:اول|بعد|سپس)\s|ثبتش\s*کن/;
  var UNKMARK24 = /دنبالِ?\s*(?:اینم|این‌ام|این\s*هستم)|می[‌\s]?خوا(?:م|هم)\s*(?:بدونم|بدانم|ببینم|بفهمم)\s|مجهول(?:م|ش|مون)?\s+(?!چیست|چیه|چی\s)\S|حکم(?:ش|م)?\s*(?:اینه|این\s*است)|سو[اؤ]ال(?:م|ش)?\s*(?:اینه|این\s*است)/;
  var OWNQ_S24 = /(?:چند|چقدر|کدوم|کدام|چطور|چطوری|چگونه|کِی)[^.!؟?\n]{0,80}?(?:بخرم|بچینم|بذارم|بگذارم|بدم|بدهم|بسازم|بگیرم|بفروشم|ببرم|بخوابم|بخورم|بپوشم|برم|بمونم|انتخاب\s*کنم|تقسیم\s*کنم|خرج\s*کنم)\s*[؟?]/;
  function unkOf(t, stmt, whole) {
    var Qs = (String(t || "").match(/«[^»]{6,}»/g) || []).map(function (x) { return txt(x.slice(1, -1)); });
    var base = toks(stmt), S0 = sentences(t).concat(Qs).map(function (x) { return x.replace(/^(?:یعنی|پس|خب|خوب|آره|بله)\s*[:：،]?\s*/, ""); }).filter(function (x) { return toks(x).length >= 2 && !(whole && nz(whole).indexOf(nz(x)) >= 0) && !WHOLE_RE.test(" " + x) && !METAQ24.test(x) && !NOTUNK24.test(x); });
    var mk = S0.filter(function (x) { return UNKMARK24.test(x); })[0] || sentences(t).filter(function (x) { return OWNQ_S24.test(x) && !METAQ24.test(x); }).pop(); if (mk) return mk.replace(/[.!…]+$/, "");   // پرسشِ اول‌شخصِ خودش («چند تا بخرم؟») هم نشانهٔ مجهول است
    var best = "", bn = 0; if (base.length) S0.forEach(function (x) { var n = toks(x).filter(function (w) { return hit(w, base); }).length; if (n > bn) { bn = n; best = x; } });
    if (best) return best.replace(/[.!…]+$/, "");
    if (whole) return "";
    var up = AS.unkPhrase ? AS.unkPhrase(t) : t; if (METAQ24.test(up) || (/[؟?]/.test(String(t || "")) && METAQ24.test(up + "؟")) || NOTUNK24.test(up)) return "";
    return !AS.unkOk21 || AS.unkOk21(up) ? up : "";
  }
  /* طرح به حرفِ خودش: جمله‌هایی از پیامش که گام می‌گویند («اول … بعد …»، «… می‌کنم/می‌ذارم») — نه حدس یا داده‌ای که کنارش گفت */
  var PLAN_MARK = /(?:^|\s)(?:اول|بعد|سپس|آخر|نخست|طرحم|برنامه‌?م)(?![آ-ی])|می[‌\s]?(?:کنم|ذارم|گذارم|شمارم|برم|خرم|نویسم|سنجم|پرسم|گیرم)(?![آ-ی])|میکنم|میذارم/;
  /* دورِ ۲۴ (R2، D24-9): بی نقلِ سنجیدهٔ مدل، طرح فقط جمله‌هایی از پیامش است که گام/قصد می‌گویند (یا با «طرحم این است…»/فهرست نشانه خورده‌اند) —
     جملهٔ کارت و تاریخِ تولد، گزارشِ وارسی یا داده هرگز «طرح» نمی‌شود؛ هیچ جمله‌ای ⇒ هیچ طرحی (نه کلِ پیام) */
  var PLAN_DECL24 = /(?:طرح|برنامه|نقشه)(?:م|ِ?\s*من|مون)?\s*(?:اینه|این\s*است|اینست)\s*(?:که)?\s*[:：]?\s*([\s\S]{4,})/;
  var ASKOK24 = /(?:خوبه|خوب\s*است|خوبه\s*یا\s*نه|درسته|درست\s*است|چطوره|موافقی|موافقید|بهتره|بهتر\s*است|نظرت\s*چیه|نظرتون\s*چیه)\s*[؟?]+\s*$/;
  function planText(t) {
    var T = String(t || "").replace(/^(?:نه|آره|باشه)[،,\s]+/, "");
    if (ASKOK24.test(T)) return "";   // «کتاب‌ها رو به ترتیب بخونم. خوبه؟» پیشنهادِ پرسشی است، نه طرحِ او (بانکِ R24 #47)
    var d = PLAN_DECL24.exec(T); if (d) return txt(d[1]);
    var lh = /(?:^|\n)\s*(?:plan|طرح|برنامه)\s*[:：]\s*/i.exec(T); LIST24.lastIndex = 0; var li = [], m0; while ((m0 = LIST24.exec(T))) li.push(m0.index);
    if (li.length >= 2) return String(T.slice(lh ? lh.index : li[0])).trim();   // سطرها می‌مانند تا هر قلمِ فهرست یک گام شود
    var P = sentences(T).filter(function (x) { return PLAN_MARK.test(x) && !/تاریخ|تولد|کارت|به\s*دنیا/.test(x); }); return txt(P.join(" "));
  }
  function stepsOf(p, ut) {
    var L = Array.isArray(p) ? p : p && typeof p === "object" && Array.isArray(p.steps) ? p.steps : [];
    return L.map(function (x) { return txt(x && typeof x === "object" ? (x.quote || x.text || x.t || "") : x); }).filter(function (q) { return q && toks(q).length && quoteIn(q, ut); })
      .map(function (q) { return clip(A.PRE && A.PRE.herSpan ? A.PRE.herSpan(q, ut) : q, 200); });
  }
  ST.stepsOf = stepsOf;
  ST.planTextR23 = function (t) { var S0 = sentences(String(t || "").replace(/^(?:نه|آره|باشه)[،,\s]+/, "")), P = S0.filter(function (x) { return PLAN_MARK.test(x); }); return txt((P.length ? P : S0).join(" ")); };   // قرنطینه
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
  /* دورِ ۲۴ (R2، D24-3): نتیجهٔ یک زیرمسئله («۰٫۳ تقسیم بر ۰٫۰۵ میشه ۶ برابر») کلِ مسئله را به «بازنگری» نمی‌برد — فقط نتیجهٔ کل (fin: «جوابش … شد»، یا نتیجه
     پس از آخرین گامِ طرحش) ⇒ «بازنگری»؛ نتیجهٔ میانی کارِ «اجرا» است. کارِ پیشینِ سنجیده (R8) مرحله را از حکم‌هایش می‌دهد (priorPh). */
  var FIN24 = /(?:^|[\s،.:])(?:جواب(?:ش|م|مون)?|پاسخ(?:ش)?|نتیجه(?:ش|م)?|جوابِ?\s*(?:آخر|نهایی|مسئله|کل))\s*(?:[^.!؟?\n]{0,40}?)(?:شد|میشه|می[‌\s]?شود|می[‌\s]?شه|اینه|این\s*است|درومد|درآمد|دراومد)(?![آ-ی])|(?:^|[\s،.])(?:پس|بنابراین)\s+(?:جواب|کل|در\s*کل|روی\s*هم)|حل\s*شد(?![آ-ی])/;
  ST.finRes = function (t) { return FIN24.test(String(t || "")); };
  function phaseOfItems(I) {
    var has = {}, pr = ""; (I || []).forEach(function (x) { has[x.k === "res" && x.fin === false ? "resMid" : x.k] = 1; if (x.k === "prior" && x.ph) pr = maxPh(pr, x.ph); });
    if (has.res) return "b"; if (has.plan || has.step || has.resMid) return maxPh("c", pr);
    if (pr) return pr;
    if (has.whole || (has.u && (has.c || has.d))) return "p";
    return has.u || has.c || has.d ? "u" : "";
  }
  ST.phaseOfItems = phaseOfItems;
  var EV_T = { whole: "کل در یک جمله (از گفت‌وگو)", u: "مجهول (از گفت‌وگو)", c: "شرط (از گفت‌وگو)", d: "داده (از گفت‌وگو)", plan: "طرح (از گفت‌وگو)", step: "گام (از گفت‌وگو)", res: "نتیجه (از گفت‌وگو)", lb: "بازنگری (از گفت‌وگو)", prior: "کارِ پیشینِ تو (از گفت‌وگو)", tried: "امتحانِ ردشده (از گفت‌وگو)" };
  var EV_K = { whole: "cwhole", u: "cunk", c: "ccond", d: "cdata", plan: "cplan23", step: "cstep", res: "cres", lb: "clb", prior: "cprior", tried: "ctried" };
  ST.EV_K = EV_K;
  function logEv(s, pid, it, um, key) {
    if (!A.EVLOG || !A.EVLOG.add) return;
    var lines = it.k === "prior" ? priorLines(it.prior) : [it.t].concat(it.k === "plan" && (it.pieces || []).length > 1 ? it.pieces.map(function (p, i) { return "گامِ " + fa(i + 1) + ": " + p; }) : []).concat(it.q ? ["پرسش: «" + clip(it.q, 120) + "»"] : []);
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
    priorReply(s, key, pid, ut, um);   // دورِ ۲۴ (R8): پاسخِ او به «درست است؟» ِ حکم‌ها
    /* said ِ سنجیدهٔ a27 (صورتِ چسبانده فقط با برچسبِ صریح)؛ «کل» با نشانهٔ صریحِ خودش («کلش اینه: …»، «در یک جمله: …») حتی در پیامِ نخست — مدل گزارشِ وضعِ همین پیام را داد */
    var said = so ? so.said.slice() : [], real = !!(so && so.real), I = [];
    /* دورِ ۲۴ (R2، بانکِ R24 #27، A24-7): پیامِ نخستِ خودش با نشانهٔ صریحِ مجهولِ خودش («می‌خوام بدونم چند تا … بخرم»، «ساعت‌ها را چطور بچینم؟») صورتِ چسبانده نیست —
       مجهول/داده/شرطی که مدل گزارش داد برای دفترِ داستان پذیرفته می‌شود (سنجشِ پرسش‌های a27 همان می‌ماند) */
    if (so && so.pasted && real && (UNKMARK24.test(ut) || OWNQ_S24.test(ut))) (Array.isArray(a.said) ? a.said : []).forEach(function (k) { if (/^(?:u|d|c)$/.test(k) && said.indexOf(k) < 0) said.push(k); });
    /* دورِ ۲۴ (R2، B24·D22): پیامِ اصلاح (retract ِ مدل یا نشانهٔ صریحِ خودش) کارِ سازوکارِ اصلاح است — نه دادهٔ تازه، نه مجهول، نه «کل» */
    var corr = !!(a.retract && typeof a.retract === "object") || CORRMSG24.test(ut);
    var w = so && !corr ? wholeSaid(ut) : ""; if (w) I.push({ k: "whole", t: w });
    if (real && said.length) {
      if (said.indexOf("u") >= 0 && !corr) { var up = unkOf(ut, stmtOf(s, pid), w); if (up) I.push({ k: "u", t: clip(up, 160) }); }
      if (said.indexOf("c") >= 0 && !corr) { var c = condOf(ut); if (c) I.push({ k: "c", t: c }); }
      if (said.indexOf("d") >= 0 && !corr) dataOf(ut, a.fail === true).forEach(function (d) { I.push({ k: "d", t: d }); });
      /* امتحان‌های ردشده‌اش (بانکِ R24 #35): در تاریخچهٔ «امتحانِ ردشده»، نه «داده» */
      if ((said.indexOf("d") >= 0 || a.fail === true) && !corr) triedOf(ut, a.fail === true).forEach(function (x) { I.push({ k: "tried", t: x }); });
      if (said.indexOf("plan") >= 0 && !ASKOK24.test(ut)) {
        var pt = txtOf(a.plan); pt = pt && quoteIn(pt, ut) ? (A.PRE && A.PRE.herSpan ? A.PRE.herSpan(pt, ut) : pt) : planText(ut);
        var ms = stepsOf(a.plan, ut);   // دورِ ۲۴: گام‌های سنجیدهٔ مدل (هر نقل در پیامش) — نقلِ ناپیدا کنار می‌رود
        if (!toks(pt).length && ms.length >= 2) pt = ms.join(" · ");
        if (toks(pt).length >= 2) I.push({ k: "plan", t: clip(pt, 400), pieces: ms.length >= 2 ? ms : planPieces(pt) });
      }
      if (said.indexOf("result") >= 0) { var rt = txtOf(a.result), rx = clip(rt && quoteIn(rt, ut) ? rt : ut, 300);
        /* نتیجه‌ای که فقط پرسش است («پس اصلاً تموم نمیشه؟») نتیجه نیست؛ نتیجهٔ کل (fin) یا میانی */
        if (!/[؟?]\s*$/.test(rx) || (rt && quoteIn(rt, ut) && !/[؟?]\s*$/.test(rt))) {
          var E1 = storyOf(s, key), P1 = E1.items.filter(function (x) { return x.k === "plan"; }).pop(), stN = P1 ? E1.items.filter(function (x) { return x.k === "step" && String(x.at) >= String(P1.at); }).length : 0;
          I.push({ k: "res", t: rx, fin: FIN24.test(rx) || FIN24.test(ut) || !!(P1 && (P1.pieces || []).length > 1 && stN >= P1.pieces.length - 1) });
        }
      }
    }
    /* گزارشِ گام (step) — نقلِ همین پیامِ خودش، نه قصدِ آینده؛ برای مسئلهٔ زنده a38 خودش گامِ باز را می‌بندد (A.liveStepReport) و این‌جا فقط داستان */
    var sp = a.step && typeof a.step === "object" ? a.step : null, sq = sp ? txt(sp.quote || sp.what || sp.text || "") : "";
    if (sp && sq && quoteIn(sq, ut) && !FUTURE.test(sq) && toks(sq).length >= 2 && sp.done !== "no") I.push({ k: "step", t: clip(A.PRE && A.PRE.herSpan ? A.PRE.herSpan(sq, ut) : sq, 200) });
    /* پاسخِ پرسشِ بازنگری (ans ِ سنجیده) */
    if (real && so) (so.ans || []).forEach(function (q) { var f = lbField(q); if (f && toks(ut).length >= 2) I.push({ k: "lb", t: clip(ut, 300), q: q, f: f }); });
    /* مجهولِ کوتاهِ مدل (coach_state.unknown) — فقط اگر هر واژهٔ معنادارش در صورت/کلِ همین مسئله هست (نه مجهولِ مسئلهٔ دیگر) */
    var uk = txtOf(a.unknown); if (uk) { var base = toks([stmtOf(s, pid), (storyOf(s, key).items.filter(function (x) { return x.k === "whole"; })[0] || {}).t].join(" ")), uw = toks(uk).filter(function (w) { return !/^(?:تعداد|مقدار|اندازه|قیمت|بهترین|کدوم|کدام)$/.test(stem(w)); });
      if (uw.length && uw.every(function (w0) { return hit(w0, base); })) { var E0 = storyOf(s, key, true); E0.unk = { t: clip(uk, 100), at: String(um.at || nowIso()) }; } }
    /* دورِ ۲۴ (R8 «کارِ پیشینِ من»، نقشهٔ راهِ منبع‌ها §۲۱): حکمِ گام‌به‌گامِ کارِ پیشینش (coach_state.prior) — صفحه نقل و عدد/واحد را می‌سنجد */
    var pr24 = priorOf(s, a, um); if (pr24) { var E2 = storyOf(s, key, true); E2.prior = pr24; I.push({ k: "prior", t: pr24.sum, ph: pr24.ph, prior: pr24 });
      /* کارنامه: گامِ درستِ پیشینش به حسابِ خودش (نه «گیر»)؛ گامِ نادرست/ناقص با علتِ خودش (پیش‌نیاز، گره، مهارت، نامعلوم) — بانکِ R24 #170/#183 */
      try { if (AS.coachEvent) pr24.steps.forEach(function (x) { if (x.verdict === "unchecked") return; AS.coachEvent(s, "c", "prior", x.quote, x.verdict === "ok", x.verdict === "ok" ? { prior: x.n } : { prior: x.n, cause: x.cause || "unknown" }); }); } catch (e) { }
      /* مسئلهٔ زنده: حکم‌های تازه جای پیشین را می‌گیرند (سنجشِ دوباره پس از ردِ او)؛ تأییدِ او روی همان گام با همان حکم می‌ماند */
      if (pid) { try { var pgP = S.get("eprog_" + pid); if (pgP && pgP.solve) { var LP = pgP.solve.live = pgP.solve.live || {}, old = LP.prior; var cp = JSON.parse(JSON.stringify(pr24)); if (old) cp.steps.forEach(function (x) { var o0 = old.steps.filter(function (y) { return nz(y.quote) === nz(x.quote); })[0]; if (o0 && o0.her === "ok" && o0.verdict === x.verdict) { x.her = "ok"; x.herAt = o0.herAt; } }); LP.prior = cp; S.put(pgP); } } catch (e) { } } }
    if (!I.length) { try { S.put(s); } catch (e) { } return; }
    var E = storyOf(s, key, true), m0 = mid(um), at = String(um.at || nowIso()), added = [];
    I.forEach(function (it) {
      if (E.items.some(function (x) { return x.k === it.k && x.mid === m0 && nz(x.t) === nz(it.t); })) return;
      it.at = at; it.mid = m0; it.n = E.items.length + 1; E.items.push(it); added.push(it); logEv(s, pid, it, um, key);
    });
    if (pid && added.length) feed(pid, s, added, um);
    /* دورِ ۲۴ (B24·D2، بانکِ R24 #40): مسئلهٔ گفت‌وگویی که همین حالا مسئلهٔ زنده شد (chat_solved/live_new در همین نوبت) کارِ همین پیام را هم می‌گیرد */
    else if (!pid && added.length) { var lp24 = ""; try { lp24 = ST.livedPk(s, key); } catch (e) { } if (lp24) feed(lp24, s, added, um); }
    try { S.put(s); } catch (e) { }
  }
  function stmtOf(s, pid) { if (pid) { var r = A.liveRec && A.liveRec(pid); return r ? r.p.statement : ""; } return ((s && s.coach) || {}).stmt || ""; }

  /* ---------- دورِ ۲۴ (R8 «کارِ پیشینِ من»، §۲۱ ِ نقشهٔ راهِ منبع‌ها): متنِ بلندی با مسئله، ایده و بخشی از حل ----------
     ریشه در پولیا: «وارسیِ هر گام» (اجرا)، «آیا می‌توانی درستیِ استدلال را وارسی کنی؟» (بازنگری)، «بخشی از شرط را نگه دار» (کارِ نیمه‌تمام).
     قرارداد: coach_state.prior = [{step, quote, verdict: ok|incomplete|wrong|unchecked, why, fix?, dep?}]. صفحه:
       • هر نقل را در پیام‌های خودِ او می‌جوید (نقلِ ساختگی ⇒ آن گام کنار می‌رود و «رد شد» می‌خورد)؛
       • حساب و واحد را جایی که حساب‌پذیر است خودش می‌سنجد («۲۵۰ ضربدر ۲۳ درصد میشه ۵۷.۵»، «۱.۸ متر + ۲۰ سانت = ۲۲») — دقت از نوشتهٔ خودش، نه عددِ قراردادی؛
       • گام‌هایی که به گامِ نادرست تکیه دارند (dep، یا عددِ نتیجهٔ همان گام در نقلشان) «وابسته به گامِ n» می‌خورند؛
       • نقطهٔ ازسرگیری = نخستین گامی که «درست» نیست؛ گامِ درست دوباره پرسیده نمی‌شود؛ مرحله از حکم‌ها (نه از آخرین جمله)؛
       • هر حکم با «درست است؟» به او نشان داده می‌شود؛ هیچ گامی از او بی «آری» ِ خودش بازنویسی نمی‌شود؛ ردِ حکم ⇒ سنجشِ دوباره با دلیل.
     مرزِ صادقانه: درستیِ گامِ غیرعددی را مدلِ ردهٔ مربی داوری می‌کند؛ صفحه فقط ساختار، نقل، عدد و واحد را تضمین می‌کند. */
  var VERD = { ok: "✓ درست", incomplete: "⚠️ ناقص", wrong: "✗ نادرست", unchecked: "؟ نسنجیده" };
  function digs(t) { return String(t == null ? "" : t).replace(/[۰-۹]/g, function (c) { return String(c.charCodeAt(0) - 1776); }).replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 1632); }).replace(/٫/g, ".").replace(/(\d)٬(\d)/g, "$1$2"); }
  function evalChain(e) {   // فقط + − × ÷ با تقدمِ ضرب/تقسیم
    var T0 = e.match(/\d+(?:\.\d+)?|[*\/+\-]/g) || [], T = [];   // منهای یکانی فقط در آغاز یا پس از عملگر
    T0.forEach(function (x, k) { if (x === "-" && (k === 0 || /^[*\/+\-]$/.test(T0[k - 1])) && /^\d/.test(T0[k + 1] || "")) { T0[k + 1] = "-" + T0[k + 1]; return; } T.push(x); });
    var v = [], ops = [], i = 0, num = function () { var x = parseFloat(T[i++]); return isNaN(x) ? null : x; };
    var a = num(); if (a == null) return null; v.push(a);
    while (i < T.length) { var op = T[i++], b = num(); if (b == null) return null; if (op === "*") v[v.length - 1] *= b; else if (op === "/") { if (!b) return null; v[v.length - 1] /= b; } else { ops.push(op); v.push(b); } }
    var r = v[0]; ops.forEach(function (op, k) { r = op === "+" ? r + v[k + 1] : r - v[k + 1]; }); return r;
  }
  /* دقتِ مقایسه از نوشتهٔ خودش: رقم‌های پس از ممیز؛ با «حدود/تقریباً» رتبهٔ آخرین رقمِ غیرِ صفر */
  function tolOf(rs, approx) { var d = (rs.split(".")[1] || "").length; if (d) return 0.5 * Math.pow(10, -d); if (!approx) return 0.5; var z = (rs.replace(/^-/, "").match(/0+$/) || [""])[0].length; return 0.5 * Math.pow(10, z); }
  var UNIT = [[/کیلو\s*متر/, "len", 1000], [/سانتی?\s*‌?\s*متر|سانت(?![آ-ی])/, "len", 0.01], [/میلی\s*‌?\s*متر/, "len", 0.001], [/متر/, "len", 1], [/کیلو\s*گرم|کیلو(?![آ-ی])/, "mass", 1000], [/گرم/, "mass", 1], [/ساعت/, "time", 3600], [/دقیقه/, "time", 60], [/ثانیه/, "time", 1]];
  function unitOf(w) { for (var k = 0; k < UNIT.length; k++) if (UNIT[k][0].test(w)) return { dim: UNIT[k][1], f: UNIT[k][2], w: w }; return null; }
  function arithChk(q) {
    var t = digs(q).replace(/(\d+(?:\.\d+)?)\s*(?:درصد|٪|%)/g, function (m, n) { return String(parseFloat(n) / 100); })
      .replace(/(\d)\s*(?:ضرب\s*در|ضربدر|×|\*|x)\s*(?=-?\d)/gi, "$1 * ").replace(/(\d)\s+در\s+(?=\d)/g, "$1 * ").replace(/(\d)\s*(?:تقسیم\s*بر|÷|\/)\s*(?=\d)/g, "$1 / ")
      .replace(/(\d)\s*(?:منهای|−|–)\s*(?=\d)/g, "$1 - ").replace(/(\d)\s*(?:به[‌\s]?علاوه|بعلاوه|\+)\s*(?=\d)/g, "$1 + ");
    var re = /(-?\d+(?:\.\d+)?(?:\s*[*\/+\-]\s*-?\d+(?:\.\d+)?)+)\s*(?:=|میشه|می[‌\s]?شه|می[‌\s]?شود|شد)\s*(حدود|تقریباً|تقریبا|حدوداً|حدودا)?\s*(-?\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)?)(?![0-9.])/g, m, out = [];
    while ((m = re.exec(t))) { var v = evalChain(m[1]); if (v == null) continue; var fr = /\//.test(m[3]), r = fr ? evalChain(m[3]) : parseFloat(m[3]); if (r == null) continue; var tol = fr ? Math.abs(r) * 1e-9 : tolOf(m[3], !!m[2]);
      out.push({ expr: m[1].replace(/\s+/g, " "), said: m[3], val: v, ok: Math.abs(v - r) <= tol + 1e-9 }); }
    /* واحد: دو کمیتِ هم‌جنس با واحدِ ناهم‌اندازه که بی تبدیل جمع/تفریق شده‌اند («۱.۸ متر + ۲۰ سانت = ۲۱.۸») */
    var ure = /(\d+(?:\.\d+)?)\s*([آ-ی‌\s]{2,14}?)\s*([+\-])\s*(\d+(?:\.\d+)?)\s*([آ-ی‌\s]{2,14}?)\s*(?:=|میشه|می[‌\s]?شه|می[‌\s]?شود|شد)\s*(\d+(?:\.\d+)?)\s*([آ-ی‌]{2,12})?/g, mu;
    while ((mu = ure.exec(t))) { var u1 = unitOf(mu[2]), u2 = unitOf(mu[5]); if (!u1 || !u2 || u1.dim !== u2.dim || u1.f === u2.f) continue;
      var a1 = parseFloat(mu[1]), b1 = parseFloat(mu[4]), rr = parseFloat(mu[6]), raw = mu[3] === "+" ? a1 + b1 : a1 - b1, u3 = unitOf(mu[7] || "") || u1, conv = (mu[3] === "+" ? a1 * u1.f + b1 * u2.f : a1 * u1.f - b1 * u2.f) / u3.f, tl = tolOf(mu[6], false);
      if (Math.abs(raw - rr) <= tl && Math.abs(conv - rr) > tl) out.push({ expr: mu[1] + " " + txt(mu[2]) + " " + mu[3] + " " + mu[4] + " " + txt(mu[5]), said: mu[6], val: conv, ok: false, unit: txt(u1.w) + "/" + txt(u2.w) + " بی تبدیل" }); }
    /* تبدیلِ واحد («۱۵۰ سانت = ۱.۵ متر») — درستش هرگز نادرست خوانده نمی‌شود (بانکِ R24 #186)؛ نادرستش با مقدارِ تبدیل */
    var cre = /(\d+(?:\.\d+)?)\s*([آ-ی‌]{2,12}(?:\s*[آ-ی‌]{2,8})?)\s*(?:=|یعنی|میشه|می[‌\s]?شود)\s*(\d+(?:\.\d+)?)\s*([آ-ی‌]{2,12}(?:\s*[آ-ی‌]{2,8})?)/g, mc;
    while ((mc = cre.exec(t))) { var c1 = unitOf(mc[2]), c2 = unitOf(mc[4]); if (!c1 || !c2 || c1.dim !== c2.dim || c1.f === c2.f) continue;
      var cv = parseFloat(mc[1]) * c1.f / c2.f, ct = tolOf(mc[3], false); out.push({ expr: mc[1] + " " + txt(mc[2]), said: mc[3], val: cv, ok: Math.abs(cv - parseFloat(mc[3])) <= ct + 1e-9, conv: true, unit: Math.abs(cv - parseFloat(mc[3])) <= ct + 1e-9 ? "" : "تبدیلِ " + txt(mc[2]) + " به " + txt(mc[4]) }); }
    return out;
  }
  ST.arithChk = arithChk;
  function fmtN(v) { var x = Math.round(v * 1000) / 1000; return fa(String(x).replace(".", "٫")); }
  function herMsgs(s, um) { return ((s && s.msgs) || []).filter(isUser).map(function (m) { return String(m.text || ""); }).concat(um ? [String(um.text || "")] : []); }
  function priorOf(s, a, um) {
    var P = Array.isArray(a && a.prior) ? a.prior : null; if (!P || !P.length) return null;
    var H = herMsgs(s, um), steps = [], rej = 0;
    P.forEach(function (x, i) {
      if (!x || typeof x !== "object") return; var q = txt(x.quote || ""), st = clip(txt(x.step || x.what || ""), 160);
      if (!q || !H.some(function (t) { return quoteIn(q, t); })) { rej++; return; }   // نقلِ ساختگی ⇒ کنار
      var hm = H.filter(function (t) { return quoteIn(q, t); }).pop(), span = A.PRE && A.PRE.herSpan ? A.PRE.herSpan(q, hm) : q;
      var v = /^(?:ok|incomplete|wrong|unchecked)$/.test(String(x.verdict)) ? String(x.verdict) : "unchecked", why = clip(txt(x.why || ""), 220), fix = clip(txt(x.fix || ""), 220);
      var ck = arithChk(span), bad = ck.filter(function (c) { return !c.ok; }), chk = "";
      /* chk برای خودش (عددِ درست لو نمی‌رود — بانکِ R24 #164)؛ chkM برای مربی (با مقدار، «لو نده») */
      var chkM = "";
      if (bad.length) { v = "wrong"; chk = bad.map(function (c) { return c.unit ? "واحد (" + c.unit + ") با عددِ نوشته‌شده نمی‌خواند" : "حسابِ «" + fa(c.expr) + "» با عددِ نوشته‌شده («" + fa(c.said) + "») نمی‌خواند"; }).join("؛ ");
        chkM = bad.map(function (c) { return c.unit ? "واحد: " + c.unit + " — با تبدیل " + fmtN(c.val) + " می‌شود، نه " + fa(c.said) : "حسابِ صفحه: " + fa(c.expr) + " = " + fmtN(c.val) + "، نه " + fa(c.said); }).join("؛ ") + " (عددِ درست را لو نده)"; }
      else if (ck.length) chk = chkM = "حسابِ عددی‌اش را صفحه سنجید: درست" + (v === "wrong" ? " — پس نادرستیِ این گام (اگر هست) از جای دیگری است (داوریِ مربی)" : "");
      var dep = (Array.isArray(x.dep) ? x.dep : x.dep != null ? [x.dep] : []).map(function (n) { return +digs(n) || 0; }).filter(function (n) { return n > 0; });
      var cause = /^(?:prereq|knot|skill|unknown)$/.test(String(x.cause || "")) ? String(x.cause) : "";
      steps.push({ n: steps.length + 1, step: st || clip(span, 80), quote: clip(span, 300), verdict: v, why: why, fix: fix, chk: chk, chkM: chkM, dep: dep, said: ck.filter(function (c) { return !c.conv; }).map(function (c) { return c.said; }), cause: cause, her: "" });
    });
    if (!steps.length) return null;
    /* وابستگی: dep ِ مدل، یا عددِ نتیجهٔ گامِ نادرست در نقلِ گامِ بعد */
    steps.forEach(function (x) { if (x.verdict !== "wrong") return; steps.forEach(function (y) { if (y.n <= x.n || y.dep.indexOf(x.n) >= 0) return; if (x.said.some(function (n) { return n && new RegExp("(?:^|[^0-9.])" + n.replace(".", "\\.") + "(?![0-9])").test(digs(y.quote)); })) y.dep.push(x.n); }); });
    steps.forEach(function (y) { y.depWrong = y.dep.filter(function (n) { var z = steps[n - 1]; return z && z.verdict === "wrong"; }); });
    /* مرحله از حکم‌ها: همه درست و گامِ آخر جوابِ کل («پس x = 5»، «جوابم …») ⇒ بازنگری؛ گامِ درستی هست ⇒ اجرا؛ هیچ ⇒ طرح (ایده‌اش) */
    var rs = steps.filter(function (x) { return x.verdict !== "ok"; })[0], lastQ = digs(steps[steps.length - 1].quote), fin = !rs && (FIN24.test(lastQ) || /(?:^|\s)(?:پس|بنابراین)\s+[^.!؟?]{0,30}=\s*-?\d/.test(lastQ) || /جواب(?:م|ش)?\s*[0-9]/.test(lastQ));
    var ph = fin ? "b" : steps.some(function (x) { return x.verdict === "ok"; }) ? "c" : "p";
    return { at: String((um && um.at) || nowIso()), mid: mid(um), steps: steps, resume: rs ? rs.n : 0, ph: ph, fin: fin, rej: rej, st: "ask",
      sum: "کارِ پیشینِ تو: " + fa(steps.length) + " گام — " + ["ok", "incomplete", "wrong", "unchecked"].map(function (k) { var n = steps.filter(function (x) { return x.verdict === k; }).length; return n ? fa(n) + " " + VERD[k].replace(/^\S+\s/, "") : ""; }).filter(Boolean).join("، ") + (rs ? " · ازسرگیری از گامِ " + fa(rs.n) : " · همه درست") };
  }
  ST.priorOf = priorOf;
  var YES24 = /^\s*(?:آره|آری|اره|بله|بلی|درسته|درست\s*است|درست\s*میگی|درست\s*می[‌\s]?گید|باشه|قبول(?:ه)?|موافقم|اوهوم|اوکی|ok|yes)(?:[\s،,.!]+(?:درسته|درست\s*است|قبول(?:ه)?|همینه|ممنون|مرسی|باشه|اصلاحش\s*کن|بنویس))*[\s.!]*$/i;
  var NO24 = /^\s*(?:نه|نخیر|اشتباه\s*نکردم|غلط\s*نیست|قبول\s*ندارم|درست\s*نیست)/;
  /* پاسخِ «درست است؟»: آری ⇒ حکم‌ها پذیرفته و گامِ نادرستی که پیشنهادِ اصلاح دارد با تاریخچه («اصلاح شد ⇐») نوشته می‌شود — پیش از آری هیچ؛
     نه ⇒ حکمِ همان گام (یا همهٔ گام‌های نه‌درست) «رد شد» و دوباره سنجیده می‌شود — بی دلیل کوتاه آمدن یا پافشاری هیچ‌کدام کارِ صفحه نیست */
  function priorReply(s, key, pid, ut, um) {
    var pg = pid ? S.get("eprog_" + pid) : null, L = pg && pg.solve && pg.solve.live, E = storyOf(s, key), prs = [L && L.prior, E.prior].filter(Boolean); if (!prs.length) return;
    var at = String((um && um.at) || nowIso()), t = String(ut || ""), yes = YES24.test(t), no = !yes && NO24.test(t); if (!yes && !no) return;
    prs.forEach(function (pr) {
      if (pr.st !== "ask" || !(at > String(pr.at))) return;
      if (yes) { pr.steps.forEach(function (x) { x.her = "ok"; x.herAt = at; if (x.verdict !== "ok" && x.fix && !x.fixed) x.fixed = { t: x.fix, was: x.quote, at: at }; });
        pr.steps.forEach(function (y) { y.depWrong = (y.dep || []).filter(function (n) { var z = pr.steps[n - 1]; return z && z.verdict === "wrong" && !z.fixed; }); }); pr.st = "ok"; }
      else { var ns = (digs(t).match(/گام\s*ِ?\s*(\d+)/g) || []).map(function (g) { return +g.replace(/\D/g, ""); }), why = /(?:چون|زیرا|چرا\s*که|به\s*خاطرِ?|برای\s*این‌?\s*که)/.test(t) ? clip(t, 240) : "";
        pr.steps.forEach(function (x) { if (ns.length ? ns.indexOf(x.n) >= 0 : x.verdict !== "ok") { x.her = "no"; x.herAt = at; if (why) x.herWhy = why; } }); pr.st = "no"; }
    });
    if (pg && L && L.prior) S.put(pg);
  }
  ST.priorReply = priorReply;
  function priorLines(pr) {
    if (!pr) return []; return [pr.sum].concat(pr.steps.map(function (x) {
      return "گامِ " + fa(x.n) + " · " + VERD[x.verdict] + ": «" + clip(x.quote, 90) + "»" + (x.fixed ? " ⇒ «" + clip(x.fixed.t, 90) + "» (اصلاح شد ⇐ «" + clip(x.fixed.was, 60) + "»، با «آری» ِ خودش)" : "") + (x.why ? " — " + x.why : "") + ((x.chkM || x.chk) ? " (" + (x.chkM || x.chk) + ")" : "") + (x.fix ? " · پیشنهاد (بی «آری» ِ تو بازنویسی نمی‌شود): " + x.fix : "") + (x.depWrong.length ? " · وابسته به گامِ " + x.depWrong.map(fa).join("، ") : "") + (x.her === "ok" ? " · تأییدِ تو ✓" : x.her === "no" ? " · حکم را رد کردی — دوباره سنجیده می‌شود" : "");
    })).concat(pr.rej ? ["(" + fa(pr.rej) + " نقل در حرف‌هایت پیدا نشد و کنار رفت)"] : []);
  }
  ST.priorLines = priorLines;
  /* پرسشِ نوبت از نقطهٔ ازسرگیری — گامِ درست هرگز؛ حکمِ ردشده ⇒ دلیلش */
  function priorQ(pr) {
    if (!pr) return ""; var no = pr.steps.filter(function (x) { return x.her === "no" && !x.reAt; })[0];
    if (no) return no.herWhy ? "دلیلِ تازه‌ات برای گامِ " + fa(no.n) + " («" + clip(no.herWhy, 70) + "»): همین دلیل گام را کامل ثابت می‌کند — هر حالتی را می‌پوشاند؟"
      : "حکمِ گامِ " + fa(no.n) + " («" + clip(no.quote, 60) + "») را رد کردی — به چه دلیل درست است؟ با همان شاهد دوباره می‌سنجیم.";
    var x = pr.resume ? pr.steps[pr.resume - 1] : null;
    if (!x) return pr.fin ? "همهٔ گام‌هایت درست است و به جواب رسیدی — می‌توانی نتیجه را از راهِ دیگری وارسی کنی؟" : "همهٔ گام‌های پیشینت درست درآمد — گامِ بعدیِ تو چیست، و پیش از برداشتنش فکر می‌کنی چه می‌شود؟";
    if (x.verdict === "wrong") return "گامِ " + fa(x.n) + " («" + clip(x.quote, 60) + "») جای درنگ است" + (x.chk ? " (" + x.chk + ")" : x.why ? " — " + clip(x.why, 90) : "") + ": خودت این گام را دوباره وارسی می‌کنی — کجایش می‌لنگد؟";
    if (x.verdict === "incomplete") return "گامِ " + fa(x.n) + " («" + clip(x.quote, 60) + "») ناقص مانده" + (x.why ? " — " + clip(x.why, 90) : "") + ": چه چیزی کم دارد تا کامل شود؟";
    return "گامِ " + fa(x.n) + " («" + clip(x.quote, 60) + "») را چطور وارسی می‌کنی — روشن می‌بینی که درست است؟";
  }
  ST.priorQ = priorQ;
  /* کارِ پیشینِ مسئلهٔ زنده یا گفت‌وگو: L.prior (از import) یا story ِ کلیدِ همین لحظه */
  /* پرسشِ ازسرگیری پرسشِ نوبت است تا وقتی کارِ تازه‌ای (طرح/گام/نتیجه) پس از آن حکم‌ها در داستان نیامده، یا حکمی را تأیید/رد نکرده که هنوز جواب نگرفته */
  ST.priorTurnQ = function (s, pid) {
    var pr = ST.priorFor(s, pid); if (!pr) return "";
    if (pr.steps.some(function (x) { return x.her === "no" && !x.reAt; })) return priorQ(pr);
    var its = []; if (pid) { var pg = S.get("eprog_" + pid), L = (pg && pg.solve && pg.solve.live) || {}; its = (L.chatImpItems || []).slice(); S.all("achat", function (x) { return x && x.coach && x.coach.story && x.coach.story["L:" + pid]; }).forEach(function (se) { its = its.concat(se.coach.story["L:" + pid].items); }); if ((L.steps || []).some(function (x) { return String(x.at || "") > String(pr.at); })) return ""; }
    else { var C = (s && s.coach) || {}; its = storyOf(s || {}, String(C.pk || "c:0")).items; }
    if (its.some(function (x) { return (x.k === "plan" || x.k === "step" || x.k === "res") && String(x.at) > String(pr.at); })) return "";
    return priorQ(pr);
  };
  ST.priorFor = function (s, pid) {
    if (pid) { var pg = S.get("eprog_" + pid), L = (pg && pg.solve && pg.solve.live) || {}; if (L.prior) return L.prior; var se0 = null; S.all("achat", function (x) { return x && x.coach && x.coach.story && x.coach.story["L:" + pid] && x.coach.story["L:" + pid].prior; }).forEach(function (x) { se0 = x; }); return se0 ? se0.coach.story["L:" + pid].prior : null; }
    var C = (s && s.coach) || {}, E = storyOf(s || {}, String(C.pk || "c:0")); return E.prior || null;
  };

  /* ---------- فرم‌های مسئلهٔ زنده: فقط خانهٔ خالی، با «از گفت‌وگو … درست است؟» ---------- */
  function newDraft(r) { return { type: (r && r.p && r.p.kind) || "find", nat: "", one: "", why: "", u: "", dl: [], c: "", rel: "", suff: "", suffWhy: "", suffChal: "", sat: "", fig: "", dead: "", prac: {}, nota: [], figc: {}, restate: "", restateWhy: "", guess: "", conf: "", test: "", testRes: "", ifRef: "", gWant: "", gContra: "", gChal: "" }; }
  function solvedAsk(so, items) {
    var u1 = so.u && so.u[1]; if (!(u1 && u1.done && u1.from === "chat")) return false;
    var CA = u1.chatAsk = u1.chatAsk || {}, ca = false;
    (items || []).forEach(function (it) {
      var f = { u: "u", c: "c" }[it.k];
      if (f && !txt(u1[f]) && !CA[f]) { CA[f] = { t: it.t, at: it.at, mid: it.mid, st: "ask" }; ca = true; }
      if (it.k === "res" && it.fin !== false && !(so.live && so.live.chat && txt(so.live.chat.solution)) && !CA.sol) { CA.sol = { t: it.t, at: it.at, mid: it.mid, st: "ask" }; ca = true; }   // جواب (بانکِ R24 #40)
      if (it.k === "d") { var DL = CA.dl = CA.dl || []; if (!DL.some(function (x) { return nz(x.t) === nz(it.t); }) && !(u1.dl || []).some(function (x) { return nz(x.t) === nz(it.t); })) { DL.push({ t: it.t, at: it.at, mid: it.mid, st: "ask" }); ca = true; } }
    });
    return ca;
  }
  ST.solvedAsk = solvedAsk;
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
    /* دورِ ۲۴ (R2، B24·D2 aB4، A24-7): مسئله‌ای که با chat_solved بسته شد فرمِ فهمِ «ثبت‌شده» از گفت‌وگو دارد (u[1].from = chat) ولی مجهول/داده/شرطش خالی ماند —
       کارِ سنجیدهٔ گفت‌وگو همان‌جا با «از گفت‌وگو: … درست است؟» پیشنهاد می‌شود (u1.chatAsk)؛ تا «✓» نزده، چیزی در رکوردِ ثبت‌شده نوشته نمی‌شود */
    if (solvedAsk(so, (so.u && so.u[1] && !so.u[1].chatAsk ? (L.chatImpItems || []) : []).concat(items))) dirty = true;
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
    L.chatImpItems = items24.map(function (x) { return { k: x.k, t: x.t, at: x.at, mid: x.mid, pieces: x.pieces, n: x.n, fin: x.fin, ph: x.ph }; });
    if (E.unk && (!cut24 || items24.some(function (x) { return x.k === "u" || x.k === "whole"; }))) L.chatUnk = E.unk;
    if (E.prior && !L.prior && !cut24) L.prior = JSON.parse(JSON.stringify(E.prior));   // دورِ ۲۴ (R8): کارِ پیشینِ سنجیده با همان حکم‌ها به مسئلهٔ زنده می‌رود (مالِ مسئلهٔ پیشینِ گفت‌وگو نه)
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
    if (items.some(function (x) { return x.k === "res" && x.fin !== false && String(x.at) >= String(P.at); })) done = pcs.length;   // دورِ ۲۴ (D24-3): فقط نتیجهٔ کل همهٔ طرح را تمام می‌کند
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
    if (d && d.chat && !(pg.solve.u && pg.solve.u[1] && pg.solve.u[1].done)) { mk(d.chat.one, d.one, "lpOne", function () { d.wholeOk = true; }); mk(d.chat.u, d.u, "lpUnk"); mk(d.chat.c, d.c, "lpCond"); (d.dl || []).forEach(function (x) { if (x.chat) mk(x.chat, x.t, "lpD_" + x.id); }); }
    /* دورِ ۲۴ (B24·D2): مسئلهٔ بسته‌شده در گفت‌وگو — مجهول/داده/شرطِ سنجیدهٔ گفت‌وگو «درست است؟»؛ ✓ همان را در فرمِ فهمِ ثبت‌شده می‌نویسد، ✏️ (نه) چیزی نمی‌نویسد */
    var so0 = pg.solve, u1 = so0.u && so0.u[1];
    if (u1 && u1.done && u1.from === "chat") {
      if (!u1.chatAsk) { var its = (L.chatImpItems || []).slice(); S.all("achat", function (x) { return x && x.coach && x.coach.story && x.coach.story["L:" + pid]; }).forEach(function (se) { its = its.concat(se.coach.story["L:" + pid].items); }); if (solvedAsk(so0, its)) S.put(pg); }
      var CA = u1.chatAsk || {}, LB = { u: "مجهول", c: "شرط" };
      var mk1 = function (rec, lb, onOk) { if (!rec || rec.st !== "ask") return; var c1 = chip(lb + ": " + rec.t, function () { rec.st = "ok"; rec.okAt = nowIso(); onOk(); put(); }, function () { rec.st = "no"; rec.noAt = nowIso(); S.put(pg); A.render(); }); c1.setAttribute("data-p23", "u1:" + lb); fbHost().appendChild(c1); };
      ["u", "c"].forEach(function (f) { mk1(CA[f], LB[f], function () { if (!txt(u1[f])) { u1[f] = CA[f].t; u1.src = u1.src || {}; u1.src[f] = { chat: true, at: CA[f].at, mid: CA[f].mid }; } }); });
      mk1(CA.sol, "جواب", function () { var Lc = so0.live = so0.live || {}; Lc.chat = Lc.chat || {}; if (!txt(Lc.chat.solution)) { Lc.chat.solution = CA.sol.t; Lc.chat.solFrom = "chat-ok"; } });
      (CA.dl || []).forEach(function (x) { mk1(x, "داده", function () { u1.dl = u1.dl || []; var mx = 0; u1.dl.forEach(function (y) { var n = +String(y.id || "").replace(/\D/g, "") || 0; if (n > mx) mx = n; }); u1.dl.push({ id: "d" + (mx + 1), t: x.t, chat: { t: x.t, at: x.at, mid: x.mid, st: "ok" } }); }); });
    }
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
  /* دورِ ۲۴ (R2، A24-18، B24·D2): نوارِ مرحله‌های 🔭 همان داستان را نشان می‌دهد — مرحله‌هایی که گفت‌وگو از آن‌ها گذشت «✓ (از گفت‌وگو)»، مرحلهٔ کنونیِ گفت‌وگو
     نشان‌دار، و یک سطر که فرم‌های پیشین منتظرِ تأییدند (فرم عقب‌تر بماند هم، «فهمِ مسئله» تنها مرحلهٔ دیده‌شده نیست) */
  function paintStrip(pid) {
    var m = document.getElementById("main"); if (!m || m.querySelector(".lp-storynote")) return;
    var fp = A.livePhase ? A.livePhase(pid) : "", sp = A.liveStoryPhase ? A.liveStoryPhase(pid) : ""; if (!sp || !(ORD[sp] > ORD[fp || "u"])) return;
    var chs = m.querySelectorAll(".lp-strip .chip[data-ph]"); if (!chs.length) return;
    [].forEach.call(chs, function (c) { var k = c.getAttribute("data-ph"); if (ORD[k] < ORD[sp] && ORD[k] >= ORD[fp || "u"]) { c.classList.add("lp-story-done"); c.setAttribute("data-story", "done"); c.textContent = "✓ " + c.textContent; c.title = "در گفت‌وگو انجام شد — فرمش منتظرِ تأیید است"; }
      else if (k === sp) { c.classList.add("lp-story-now"); c.setAttribute("data-story", "now"); c.textContent = c.textContent + " (گفت‌وگو)"; } });
    var strip = m.querySelector(".lp-strip"); if (strip && strip.parentNode) strip.parentNode.insertBefore(h("p", { class: "small muted lp-storynote", dir: "rtl" }, "گفت‌وگو تا «" + PH_FA[sp] + "» جلو رفته است؛ فرم‌های پیش از آن با «از گفت‌وگو: … درست است؟» منتظرِ تأییدند."), strip.nextSibling);
  }
  ST.paintStrip = paintStrip;
  if (typeof A.render === "function" && !A.render._r23story) {
    var rawR = A.render;
    A.render = function () { var out = rawR.apply(this, arguments); try { var st = A.state || {}; if (st.view === "lprob" && st.arg && A.liveRec && A.liveRec(st.arg)) { paintStrip(st.arg); paintChips(st.arg); paintPrior(st.arg); } } catch (e) { console.warn(e); } return out; };
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

  /* ---------- دورِ ۲۴ (R8): «کارِ پیشینِ تو» در پرامپت، و قراردادِ گزارشش وقتی پیامش کارِ خودش را دارد ---------- */
  /* «کارِ خودش در پیام»: دست‌کم دو جمله با نشانهٔ گامِ خودش (حسابِ نوشته، «=»، «پس …»، «گامِ …»، «اول … بعد …»، «فرض/ثابت/امتحان/حساب کردم») — «چند گام» یعنی بیش از یکی */
  var WORK24 = /[0-9۰-۹]\s*(?:[=×*÷\/+−\-]|ضربدر|ضرب\s*در|تقسیم\s*بر|منهای|میشه|می[‌\s]?شود)\s*[0-9۰-۹]|(?:^|\s)(?:پس|بنابراین)\s|گام(?:ِ)?\s*(?:[0-9۰-۹]|اول|دوم|سوم)|(?:^|\s)(?:اول|بعد|سپس)\s|فرض\s*(?:کردم|کنیم)|ثابت\s*(?:کردم|می[‌\s]?شه)|امتحان\s*کردم|حساب\s*کردم|ایده(?:م|‌ام)?\s*(?:اینه|این\s*است)/;
  function workMsg(t) { return sentences(String(t || "")).filter(function (x) { return WORK24.test(x); }).length >= 2; }
  ST.workMsg = workMsg;
  AS.promptHooks.push(function (s, msg) {
    try { if (/^\s*\[/.test(String(msg || ""))) return "";
      var bl = AS.boundLive ? AS.boundLive(s) : null, pid = bl && !bl.done ? bl.pid : "", pr = ST.priorFor(s, pid), out = [];
      if (pr) {
        out.push("# کارِ پیشینِ تو (حکمِ هر گام؛ نقل و عدد/واحد را صفحه سنجید)");
        priorLines(pr).forEach(function (l) { out.push("- زمینه (نه پرسشِ دوم): " + l); });
        out.push("- زمینه (نه پرسشِ دوم): نقطهٔ ازسرگیری " + (pr.resume ? "گامِ " + fa(pr.resume) : "پس از آخرین گام (همه درست)") + " — گام‌های «✓ درست» را دوباره نپرس و از نو حل نکن؛ گامی که «وابسته به گامِ n» است پس از درست شدنِ همان گام دوباره سنجیده می‌شود.");
        out.push("- زمینه (نه پرسشِ دوم): حکم‌ها را با «درست است؟» نشانش بده؛ هیچ چیزی از گام‌هایش را بی «آری» ِ خودش بازنویسی نکن. گامِ نادرست را با دلیل و شاهد بگو، نه با تعارف؛ اگر حکمی را رد کرد، دوباره بسنج — نه کوتاه آمدنِ بی‌دلیل، نه پافشاریِ بی‌دلیل.");
        out.push("- زمینه (نه پرسشِ دوم): مرزِ صادقانه — صفحه فقط نقل، عدد و واحد را تضمین می‌کند؛ درستیِ گامِ غیرعددی داوریِ توست. همین مرز را اگر پرسید یا لازم شد به او بگو.");
      }
      if (workMsg(msg)) out.push((pr ? "" : "# کارِ پیشینِ تو\n") + "- زمینه (نه پرسشِ دوم): پیامش کارِ پیشینِ خودش را دارد (گام‌هایی که خودش برداشته). کاملش را بخوان و در همان coach_state گزارش کن: " +
        "\"prior\":[{\"step\":\"نامِ کوتاهِ گام\",\"quote\":\"عینِ حرفِ خودش برای همان گام\",\"verdict\":\"ok|incomplete|wrong|unchecked\",\"why\":\"چرا (برای ناقص/نادرست: چه کم است یا از کجا غلط شد)\",\"fix\":\"اختیاری\",\"dep\":[شمارهٔ گامی که این گام بر آن تکیه دارد]}] — یک قلم برای هر گام، به ترتیبِ خودش؛ " +
        "صفحه هر نقل را در پیامش می‌جوید و حساب/واحد را خودش می‌سنجد. پاسخت: تا کجا رفته را تأیید کن و از نخستین گامی که درست نیست ادامه بده؛ گامِ درست را دوباره نپرس؛ اگر چند وجه دارد (حلِ مسئله، گرهٔ ذهنی، ادعای خبری)، ترتیبشان را بپرس.");
      /* دورِ ۲۴ (R2): گام‌های طرح فقط با نقلِ هر گام از مدل (یا فهرستِ خودش) — صفحه پیام را در ویرگول نمی‌بُرد */
      var mt0 = String(msg || ""); LIST24.lastIndex = 0;
      if (!ASKOK24.test(mt0) && (PLAN_DECL24.test(mt0) || sentences(mt0).some(function (x) { return PLAN_MARK.test(x); }))) out.push("- زمینه (نه پرسشِ دوم): اگر این پیام طرحِ همین مسئله با چند گام است، در coach_state بده \"plan\":{\"text\":\"…\",\"steps\":[\"عینِ حرفِ خودش برای گامِ ۱\",\"…\"]} — صفحه هر گام را در پیامش می‌جوید و پیام را خودش در ویرگول‌ها نمی‌بُرد؛ گامی که نگفته ننویس.");
      return out.join("\n");
    } catch (e) { return ""; }
  });
  /* دورِ ۲۴ (R8): بخشِ «کارِ پیشینِ تو» روی 🔭 — هر حکم با «درست است؟» (✓ / ✗ دوباره بسنج)؛ گامِ او بازنویسی نمی‌شود */
  function paintPrior(pid) {
    var m = document.getElementById("main"); if (!m || m.querySelector(".lp-prior")) return;
    var pg = S.get("eprog_" + pid); if (!pg || !pg.solve || !pg.solve.live) return; var L = pg.solve.live;
    if (!L.prior) { var p0 = ST.priorFor(null, pid); if (!p0) return; L.prior = JSON.parse(JSON.stringify(p0)); S.put(pg); }
    var r0 = A.liveRec && A.liveRec(pid), se0 = (r0 && r0.sess && S.get(r0.sess)) || S.all("achat", function (x) { return x && x.lprob === pid; }).pop() || null, R = function (t) { try { return AS.regSys ? AS.regSys(se0, t) : t; } catch (e) { return t; } };   // «شما» برای سالمند/کاربرِ «شما» (R5)
    var pr = L.prior, sec = h("section", { class: "card soft lp-prior", dir: "rtl" }, h("h4", {}, R("کارِ پیشینِ تو — حکمِ هر گام")), h("p", { class: "small muted" }, R(pr.sum) + " · صفحه فقط نقل، عدد و واحد را سنجید؛ درستیِ گامِ غیرعددی داوریِ مربی است."));
    pr.steps.forEach(function (x) {
      var row = h("div", { class: "lp-prior-step small", "data-v": x.verdict, "data-n": String(x.n) }, h("span", {}, "گامِ " + fa(x.n) + " · " + VERD[x.verdict] + ": «" + clip(x.quote, 140) + "»" + (x.why ? " — " + x.why : "") + (x.chk ? " (" + x.chk + ")" : "") + (x.depWrong.length ? " · وابسته به گامِ " + x.depWrong.map(fa).join("، ") : "") + (x.n === pr.resume ? " · ⟵ ازسرگیری از این‌جا" : "")));
      if (!x.her) row.appendChild(h("span", { class: "lp-prior-ask" }, " درست است؟ ",
        h("button", { class: "btn sm lp-prior-ok", type: "button", onclick: function () { x.her = "ok"; x.herAt = nowIso(); S.put(pg); A.render(); } }, "✓ درست است"),
        h("button", { class: "btn ghost sm lp-prior-no", type: "button", onclick: function () { x.her = "no"; x.herAt = nowIso(); S.put(pg); A.render(); } }, "✗ نه — دوباره بسنج")));
      else row.appendChild(h("span", { class: "muted" }, x.her === "ok" ? " · تأیید شد ✓" : R(" · رد کردی — در گفت‌وگو دوباره سنجیده می‌شود")));
      sec.appendChild(row);
    });
    var at = m.querySelector(".lp-strip"); at = at && at.closest ? (at.closest(".phead") || at.parentNode) : null;
    if (at && at.parentNode) at.parentNode.insertBefore(sec, at.nextSibling); else (m.querySelector(".page") || m).appendChild(sec);
  }
  ST.paintPrior = paintPrior;
})(APP);
