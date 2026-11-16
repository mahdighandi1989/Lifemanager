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
    var body = m[1], end = body.search(/(?:[.؟?]|(?<![A-Za-z)])!)(?=\s|$)(?![^«]*»)/);   /* دورِ ۲۵ (classify P6، A25-12-b): «… تو n! حداکثر …» — فاکتوریل پایانِ جمله نیست */ if (end > 0) body = body.slice(0, end + (/[؟?]/.test(body[end]) ? 1 : 0));
    body = txt(body).replace(/^[:：،\-–\s]+/, "");
    return toks(body).length >= 3 ? clip(body, 300) : "";
  }
  ST.wholeSaid = wholeSaid; AS.wholeSaid = wholeSaid;
  /* دورِ ۲۵ (classify P6، A25-12-b pwA1 «کل» بریده در «n!»): «!» ِ چسبیده به متغیرِ لاتین/پرانتز فاکتوریل است، نه پایانِ جمله (همان AS.FACT25 ِ a26) */
  function clauses(t) { return String(t || "").split(/(?:(?<![A-Za-z)])!|[.؟?؛;\n])+(?=\s|$)|،\s*|,\s+|\s+و\s+(?=(?:شرط|به\s*شرط))|\s+(?:ولی|اما)\s+/).map(txt).filter(Boolean); }
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
    /* دورِ ۲۶ (Q3، A26-41 oA1 p7 «… قبلش بگو: اون اصلاحِ ۱۲ نفر واقعاً همه جا نشست؟ اون ۴۵ چی شد، و خواستهٔ سنجاق‌شدهٔ سشن که هنوز ۱۰ نوشته؟»): جملهٔ پرسشی داده نیست.
       ریشه: بُرشِ بند (clauses) نشانِ پرسش را می‌انداخت و بندِ پرسش با عددش «داده» می‌شد. حالا جمله‌به‌جمله: از جملهٔ پرسشی فقط بندی می‌ماند که خودش پرسش نیست
       (نه بندِ آخر، نه بندی با واژهٔ پرسش) — «۵ تا دارم، بسه؟» هنوز «۵ تا دارم» را می‌دهد. */
    var QW26 = /(?:^|\s)(?:چی|چه|چرا|چطور|چطوری|چگونه|چند|چقدر|کدوم|کدام|کجا|کِی|آیا|مگه|مگر|واقعاً|واقعا)(?=$|\s)/, CL = [];
    sentences(T0).filter(function (x) { return !ATTEMPT24.test(x) && !CORRMSG24.test(x); }).forEach(function (x) {
      var cs = clauses(x); if (/[؟?]\s*$/.test(x)) cs = cs.slice(0, -1).filter(function (c) { return !QW26.test(nz(c)) && !/[؟?]/.test(c); }); CL = CL.concat(cs); });
    CL.forEach(function (c) {
      if (!/[0-9۰-۹]/.test(c) || /[؟?]\s*$/.test(c) || COND_RE.test(c) || (c0 && nz(c).indexOf(nz(c0)) >= 0)) return;
      if (NEG24.test(c) || COND24.test(c) || /…\s*$/.test(c)) return;
      /* دورِ ۲۶ (Q6، B26·D33 oB1 s35 دادهٔ بریده «م اینه: شام ساعت ۱۰ شب»): «داده‌هام اینه: …» سرِ جمله است، نه بخشی از داده */
      var x = txt(c.replace(/^(?:فرض\s*(?:کنید|کن|کنیم)\s*(?:که)?|داده(?:‌?ها)?(?:م|‌ام|یم|مون|ی\s*من)?\s*(?:اینه|این‌هاست|ایناست|اینان|این\s*است|این‌ها\s*هستند)?\s*[:：]?|اینم\s*بگم\s*(?:که)?)\s*/, "").replace(/\s+و\s*$/, ""));
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
  function sentences(t) { return String(t || "").split(/(?<=[.؟?…]|(?<![A-Za-z)])!)\s+|\n+/).map(txt).filter(Boolean); }   // دورِ ۲۵ (classify P6، A25-12-b): «n! حداکثر …» یک جمله است
  /* مجهول به حرفِ خودش: جمله‌ای از پیامش که بیشترین هم‌واژگی را با صورتِ همین مسئله دارد — نه جملهٔ کناری («ولی خب، ۵ منهای ۳ چرا نمیشه؟»)؛ بی صورت ⇒ همان unkPhrase ِ a27 */
  /* دورِ ۲۴ (R2، C24-11، D24-12): مجهول هرگز پرسشِ متا دربارهٔ سامانه/دستیار («… از کجا آوردی؟ یه قاعده‌ست تو سامانه؟»)، تلاش/طرح («فکر کردم دورش سه تا مثلث…»)،
     کمبودِ دانسته («مساحتِ مثلث رو نمی‌دونم») یا ترتیبِ کار («اول می‌خوام بفهمم…») نیست. نشانهٔ صریحِ مجهول («دنبالِ اینم که…»، «می‌خوام بدونم…»، «یعنی: …») مقدم است؛
     نقلِ داخلِ گیومه («یه جمله؟ «…»») خودش نامزد است. */
  var METAQ24 = /(?:گفتی|آوردی|ساختی|می[‌\s]?دونی|می[‌\s]?دانی|می[‌\s]?کنی|می[‌\s]?سنجی|داری|هستی|تویی|خودت|سامانه|برنامه\s*(?:است|ه)|قاعده|مدل|فرم|صفحه|ذخیره|دکمه|کجای\s*کار|نقشه|پرونده|کارنامه)[^.!؟?]*[؟?]\s*$/;
  var NOTUNK24 = /فکر\s*(?:کردم|می[‌\s]?کردم)|امتحان\s*(?:ش\s*)?(?:کردم|کنم)|حساب\s*کردم|(?:رو|را)\s*نمی[‌\s]?(?:دونم|دانم)|بلد\s*نیستم|خنگ|^(?:اول|بعد|سپس)\s|ثبتش\s*کن|^برای\s*این[‌\s]*که\s/;   // دورِ ۲۶ (Q6، B26·D33): «برای این‌که مطمئن شم می‌خوام ساعتِ هوشمندم …» وسیله است، نه خواسته
  var UNKMARK24 = /حل[‌\s]?شدن\s*یعنی|هدف(?:م|مون)?\s*(?:اینه|این\s*است)|مقصد(?:م)?\s*(?:اینه|این\s*است)|دنبالِ?\s*(?:اینم|این‌ام|این\s*هستم)|می[‌\s]?خوا(?:م|هم)\s*(?:بدونم|بدانم|ببینم|بفهمم)\s|مجهول(?:م|ش|مون)?\s*[:：]?\s+(?!چیست|چیه|چی\s)\S|حکم(?:ش|م)?\s*(?:اینه|این\s*است)|سو[اؤ]ال(?:م|ش)?\s*(?:اینه|این\s*است)/;
  var OWNQ_S24 = /(?:چند|چقدر|کدوم|کدام|چطور|چطوری|چگونه|کِی)[^.!؟?\n]{0,80}?(?:بخرم|بچینم|بذارم|بگذارم|بدم|بدهم|بسازم|بگیرم|بفروشم|ببرم|بخوابم|بخورم|بپوشم|برم|بمونم|انتخاب\s*کنم|تقسیم\s*کنم|خرج\s*کنم)\s*[؟?]/;
  /* دورِ ۲۶ (Q9، U54 — B26·D38 aB4 p2 «مجهول: تعداد مرغ‌ها و تعداد خرگوش‌ها. داده‌ها: ۳۵ تا سر و ۹۴ تا پا. شرط: …» ⇒ «مجهول (از گفت‌وگو)» = جملهٔ «داده‌ها: …»؛ سهمِ classify):
     برچسبِ خودِ او («مجهول:»، «داده‌ها:»، «شرط:») خوانده نمی‌شد — «مجهول:» با دونقطه نشانهٔ مجهول نبود و جمله‌ای که بیشترین واژهٔ مشترک با صورت داشت (همان «داده‌ها») برنده می‌شد.
     جملهٔ برچسب‌خوردهٔ «داده/شرط/فرض» هرگز مجهول نیست؛ «مجهول: X» خودِ X است. */
  var LABELD26 = /^\s*(?:داده(?:‌ها)?|شرط(?:‌ها)?|فرض(?:‌ها)?|معلوم(?:‌ها)?)\s*[:：]/;
  function unkOf(t, stmt, whole) {
    var Qs = (String(t || "").match(/«[^»]{6,}»/g) || []).map(function (x) { return txt(x.slice(1, -1)); });
    var base = toks(stmt), S0 = sentences(t).concat(Qs).map(function (x) { return x.replace(/^(?:یعنی|پس|خب|خوب|آره|بله)\s*[:：،]?\s*/, ""); }).filter(function (x) { return toks(x).length >= 2 && !(whole && nz(whole).indexOf(nz(x)) >= 0) && !WHOLE_RE.test(" " + x) && !METAQ24.test(x) && !NOTUNK24.test(x) && !LABELD26.test(x); });
    var mk = S0.filter(function (x) { return UNKMARK24.test(x); })[0] || sentences(t).filter(function (x) { return OWNQ_S24.test(x) && !METAQ24.test(x); }).pop(); if (mk) return mk.replace(/^\s*مجهول(?:م|ش|مون)?\s*[:：]\s*/, "").replace(/[.!…]+$/, "");   // پرسشِ اول‌شخصِ خودش («چند تا بخرم؟») هم نشانهٔ مجهول است
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
  /* ---------- دورِ ۲۶ (Q3، C26-1 «مسئلهٔ ۲ از ۲» برای یک مسئله — ۱۶ سناریو از ۲۰): پروندهٔ گفت‌وگو مسئله‌ها را می‌شمارد، نه شماره‌های داخلی ----------
     ریشه: شمارش از C.pkLog بود و pk با هر چیزی عوض می‌شود که مسئلهٔ تازه نیست — ثبتِ همان مسئله در 🔭 («c:0» ⇒ «l:pid»)، بسته شدنش، سلام یا پرسشی که صورت نداشت،
     گزارشِ روزِ دوم، جملهٔ تولد. حالا هر pk به «مسئلهٔ خودش» نگاشته می‌شود: l:pid ⇒ همان مسئلهٔ زنده؛ c:N ⇒ مسئلهٔ زنده‌ای که از آن ساخته شد، وگرنه مسئلهٔ گفت‌وگویی که
     صورتِ خودش را دارد؛ pk ِ بی‌مسئله به مسئلهٔ پیش از خودش (یا پس از خودش) می‌پیوندد. خروجی به ترتیبِ آمدن: [{ pk: نمایندهٔ گروه, pks: [...], id }] */
  ST.probGroups = function (se) {
    var C = (se && se.coach) || {}, L = (C.pkLog || []).map(function (e) { return e.pk; }).filter(function (x, i, X) { return x && X.indexOf(x) === i; });
    var U = ((se && se.msgs) || []).filter(isUser), ident = function (pk) {
      var m = /^l:(.+)$/.exec(pk); if (m) return "L:" + m[1];
      var lv = ""; try { lv = ST.lived26 ? ST.lived26(se, pk) : ""; } catch (e) { } if (lv) return "L:" + lv;
      var P = (C.probs26 || {})[pk];
      if (P && txt(P.stmt)) { var same = ""; try { (A.liveAll ? A.liveAll() : []).forEach(function (r) { if (!same && r && r.sess === se.id && sameProb26(P.stmt, r.p.statement)) same = r.p.id; }); } catch (e) { } return same ? "L:" + same : pk; }   // همان صورت که بعدتر در 🔭 ثبت شد (حتی اگر pk در این میان عوض شد)
      if (pk === String(C.pk || "") && txt(C.stmt)) { try { if (!(AS.notProblem && AS.notProblem(String(C.stmtRaw24 || C.stmt)))) return pk; } catch (e) { return pk; } return ""; }
      if (!C.probs26) { var w = ST.pkWindow(se, pk), f = U.filter(function (x) { return String(x.at || "") >= String(w.from || "") && String(x.at || "") < String(w.to || "~"); })[0];   // سشنِ پیش از دورِ ۲۶ (بی فهرست): نخستین پیامِ پنجره مسئله‌ای می‌گوید؟
        try { if (f && AS.notProblem && !AS.notProblem(String(f.text || "")) && storyOf(se, pk).items.length) return pk; } catch (e) { } }
      return "";
    };
    var G = [], by = {}, pend = [];
    L.forEach(function (pk) { var id = ident(pk); if (!id) { if (G.length) G[G.length - 1].pks.push(pk); else pend.push(pk); return; }
      if (by[id]) { by[id].pks.push(pk); return; } var g = { id: id, pk: pk, pks: pend.concat([pk]) }; pend = []; by[id] = g; G.push(g); });
    if (!G.length && L.length) G.push({ id: L[L.length - 1], pk: L[L.length - 1], pks: L.slice() });
    return G;
  };
  ST.probAt = function (se, at) { var pk = ST.pkAt(se, at), G = ST.probGroups(se), g = G.filter(function (x) { return x.pks.indexOf(pk) >= 0; })[0]; return g ? g.pk : pk; };
  ST.probOf = function (se, pk) { var G = ST.probGroups(se), g = G.filter(function (x) { return x.pks.indexOf(pk) >= 0; })[0]; return g ? g.pk : pk; };
  function pidAt(se, at) { var L = (se && se.lprobLog) || [], o = ""; L.forEach(function (e) { if (e && e.p && String(e.at || "") <= String(at || "~")) o = e.p; else if (e && !e.p && e.s25 && String(e.at || "") <= String(at || "~")) o = ""; /* دورِ ۲۵ (P5): جدا شدن برای مسئلهٔ تازه (s25) مالکیتِ مسئلهٔ پیشین را از همان پیام می‌بُرد */ }); return o || (L.length ? "" : (se && se.lprob) || ""); }
  /* رویدادِ گفت‌وگو در لحظهٔ at مالِ مسئلهٔ زندهٔ pid است اگر: سشن در آن لحظه به pid بسته بود، یا در پنجرهٔ مسئلهٔ گفت‌وگویی بود که بعدتر همین pid شد (chatImp) */
  ST.owns = function (se, pid, at, ev) {
    if (!se || !pid) return true; var a = String(at || "");
    if (ev && ev.not25 && ev.not25.indexOf(pid) >= 0) return false;   // دورِ ۲۵ (P5، A25-16): تکه‌ای از پیامِ مرزی که مالِ مسئلهٔ پیشینِ همان گفت‌وگوست
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
    var has = {}, pr = ""; (I || []).filter(function (x) { return x && !x.mv27; }).forEach(function (x) { has[x.k === "res" && x.fin === false ? "resMid" : x.k === "plan" && x.idea ? "idea" : x.k] = 1; if (x.k === "prior" && x.ph) pr = maxPh(pr, x.ph); });
    if (has.idea && !has.res && !has.plan && !has.step) return maxPh("p", pr);   // دورِ ۲۵: ایده/طرحِ پرسیده ⇒ «طرح»
    /* دورِ ۲۵ (P5، C25-10 aC4 p4، A25-16 oA1): نتیجهٔ میانی به‌تنهایی مرحله را جابه‌جا نمی‌کند — «اجرا» فقط با طرح یا گامِ سنجیده (پیش‌تر: has.resMid ⇒ «اجرا»،
       و مسئله‌ای که هنوز طرحی نداشت با آزمودنِ حدسِ نخستش «اجرای طرح» می‌شد). قاعدهٔ دورِ ۲۴: ST.phaseOfItemsR24 (REMOVAL_CANDIDATES). */
    if (has.res) return "b"; if (has.plan || has.step) return maxPh("c", pr);
    if (pr) return pr;
    if (has.whole || (has.u && (has.c || has.d))) return "p";
    return has.u || has.c || has.d ? "u" : "";
  }
  ST.phaseOfItems = phaseOfItems;
  ST.phaseOfItemsR24 = function (I) {   // قرنطینهٔ دورِ ۲۵ (REMOVAL_CANDIDATES): نتیجهٔ میانی ⇒ «اجرا» حتی بی طرح و گام — دیگر صدا زده نمی‌شود
    var has = {}, pr = ""; (I || []).forEach(function (x) { has[x.k === "res" && x.fin === false ? "resMid" : x.k] = 1; if (x.k === "prior" && x.ph) pr = maxPh(pr, x.ph); });
    if (has.res) return "b"; if (has.plan || has.step || has.resMid) return maxPh("c", pr);
    if (pr) return pr; if (has.whole || (has.u && (has.c || has.d))) return "p"; return has.u || has.c || has.d ? "u" : "";
  };
  /* ---------- دورِ ۲۵ (P5 «یک مرحله، یک مسئله»، DECISIONS_R25؛ B25·D9 = U10 bp2 p5/p7 و pwB1 p4، A23-35 aA4 p5): نتیجهٔ کل یا نتیجهٔ میانی — یک داوری برای همه ----------
     نتیجهٔ میانی (sub) = نتیجه‌ای که خودِ او یا دفترِ همین مسئله نشان می‌دهد هنوز کار مانده است:
       (۱) در همان پیام می‌گوید چه چیزی را هنوز نمی‌داند یا بخشِ بعدی را می‌پرسد («ولی متر مکعب رو نمی‌دونم چند لیتره»، «حالا این چند لیتره؟»)؛
       (۲) دفترِ «کارِ پیشینِ تو» هنوز گامی دارد که ✓ نیست و خودش درستش نکرده؛ (۳) طرحِ چندگامی‌اش هنوز گامِ مانده دارد.
     نتیجهٔ کل (fin) = میانی نیست و: «جوابش … شد / حل شد» (FIN24)، یا پس از آخرین گامِ طرح، یا با فعلِ خودِ مجهولش جواب می‌دهد («چند متر پارچه بخرم؟» ⇐ «۵ متر می‌خرم»).
     هیچ آستانهٔ عددی در کار نیست: فقط حرفِ خودش و دفترِ خودِ مسئله. */
  var OPENLEFT25 = /(?:(?:رو|را|و)\s+|(?:^|[\s،.!؟?]))(?:دیگه\s+)?(?:واقعاً\s+|واقعا\s+|هنوز\s+)?نمی[‌\s]?(?:دونم|دانم)(?![آ-ی])|بلد\s*نیستم|یادم\s*نیست|(?:هنوز|فقط)\s[^.!؟?\n]{0,40}(?:مونده|مانده)(?![آ-ی])|(?:^|[.!؟?\n…]\s*)(?:خب\s*)?(?:حالا|بعدش)\s[^.!؟?\n]{0,60}(?:چند|چقدر|چطور|چجور|چگونه|کدوم|کدام|چی|چه)[^.!؟?\n]{0,40}[؟?]|(?:^|[.!؟?\n…،]\s*)(?:خب\s*)?(?:حالا|بعدش|بعد)\s+باید(?![آ-ی])/;
  var AUX25 = /^(?:شه|شد|شود|میشه|بشه|بشود|کنم|بکنم|کرد|کنه|کند|بود|هست|است|باشه|باشد|داره|دارم|دارد|بدونم|بدانم|ببینم|بفهمم|برسم|بیارم|درمیاد|میاد|میشن|بشن)$/;
  function vcore(w) { return String(w || "").replace(/^(?:ب|ن)(?=[آ-ی]{3,})/, ""); }
  function verbOf(q) { var T = toks(String(q || "")), v = T[T.length - 1] || ""; if (AUX25.test(v)) return ""; v = vcore(v); return v.length >= 3 && !AUX25.test(v) ? v : ""; }
  function unkTexts(s, pid) {
    var o = [], C = (s && s.coach) || {};
    try { if (pid) { var pg = S.get("eprog_" + pid), so = (pg && pg.solve) || {}, L = so.live || {}, u = (so.u && so.u[1]) || L.uDraft || {}, r = A.liveRec && A.liveRec(pid);
        o.push(u.u, L.chatUnk && L.chatUnk.t); (r ? String(r.p.statement || "").match(/[^.!؟?\n]*[؟?]/g) || [] : []).forEach(function (x) { o.push(x); }); }
      var E = storyOf(s || {}, keyFor(s, pid)); o.push(E.unk && E.unk.t); E.items.forEach(function (x) { if (x.k === "u") o.push(x.t); });
      if (!pid) { (String(C.stmtRaw24 || C.stmt || "").match(/[^.!؟?\n]*[؟?]/g) || []).forEach(function (x) { o.push(x); }); if (C.unkBy && C.pk) o.push(C.unkBy[C.pk]); } } catch (e) { }
    return o.map(txt).filter(Boolean);
  }
  /* دورِ ۲۷b (history، B27·D2 pwB3 p2، بانکِ R27 #167): «ابعاد» ِ یک شکل یعنی همان اندازه‌هایش (طول، عرض، ارتفاع/عمق) — واژه‌نامه، نه قرارداد.
     مجهولِ «ابعادش چند میشه؟» با نتیجه‌ای که برای دست‌کم دو اندازهٔ جدا عدد می‌دهد («عرض = ۶ سانت و طول = ۱۲ سانت») جواب گرفته است؛ یک اندازهٔ تنها («عرض ۶») هنوز میانی است. */
  var DIMQ27 = /(?:^|\s)(?:ابعاد|اندازه[‌\s]?ها)/, DIMW27 = ["طول", "عرض", "ارتفاع", "عمق", "قطر", "ضلع"];
  function dimAns27(q, N) { if (!DIMQ27.test(nz(q))) return false; var W = N.split(" "), got = {};
    W.forEach(function (w, i) { var d = DIMW27.filter(function (x) { return w === x || w === x + "ش" || w.indexOf(x + "ِ") === 0; })[0]; if (!d) return;
      for (var j = i + 1; j <= i + 3 && j < W.length; j++) if (/^[0-9]+(?:[.٫\/][0-9]+)?$/.test(W[j])) { got[d] = 1; break; } });
    return Object.keys(got).length >= 2; }
  function ansUnk(s, pid, rx) {
    var N = nz(rx); if (!/[0-9]/.test(N)) return false; var R = toks(rx).map(vcore), W = N.split(" ");
    return unkTexts(s, pid).some(function (q) { var v = verbOf(q); if (v && R.indexOf(v) >= 0) return true; if (dimAns27(q, N)) return true;
      /* کمیتِ پرسیده: «چند X» در مجهول ⇐ «عدد X» در نتیجه («پمپ چند ساعته پر می‌کنه؟» ⇐ «۴ ساعته») */
      /* دورِ ۲۶ (Q6، U11 — aB1 p3 «۱۰ تا! … خب اون ده تا... پیاده میان؟» پس از «چند تا اتوبوس لازمه»): واژهٔ شمارش («تا»، «عدد»، «دونه») خودِ کمیتِ پرسیده نیست —
         «چند تا اتوبوس» ⇐ «۵ تا اتوبوس»، نه هر «N تا»؛ کمیتِ پرسیده نامِ پس از واژهٔ شمارش است (پیش‌تر «۱۰ تا» ِ باقی‌مانده جوابِ «چند تا اتوبوس» شمرده و مرحله «بازنگری» شد) */
      var Q = nz(q).split(" "), ok = false; Q.forEach(function (w, i) { var x = Q[i + 1]; if (w !== "چند") return; if (x && CLS26.test(x)) x = Q[i + 2]; if (!x || x.length < 2 || STOP.test(x) || AUX25.test(x)) return;
        W.forEach(function (y, j) { var k = j - 1; if (k >= 0 && CLS26.test(W[k])) k--; if (k >= 0 && /^[0-9]+(?:[.٫\/][0-9]+)?$/.test(W[k]) && !CLS26.test(y) && stem(y) === stem(x)) ok = true; }); });
      return ok; });
  }
  var CLS26 = /^(?:تا|عدد|دونه|دانه|تایی|فقره)$/;
  var CLOSE25 = /(?:^|[\s.!،؛])(?:همینه|همین\s*شد|همین\s*است|تموم\s*شد|تمام\s*شد)(?![آ-ی])/;
  ST.openLeft = function (t) { return OPENLEFT25.test(String(t || "")); };
  ST.subRes = function (s, pid, ut, hard) {   // hard (دورِ ۲۶): فقط دو نشانهٔ سخت — حرفِ خودش و دفترِ کارِ پیشین — بی شمارشِ گام‌های طرح
    if (OPENLEFT25.test(String(ut || ""))) return true;
    try { var E = storyOf(s || {}, keyFor(s, pid)), pr = E.prior || null;
      if (pid) { var pg = S.get("eprog_" + pid), L = (pg && pg.solve && pg.solve.live) || {}; if (L.prior) pr = L.prior; }
      if (pr && (pr.steps || []).some(function (x) { return x.verdict !== "ok" && !x.fixed; })) return true;
      if (hard) return false;
      var P1 = E.items.filter(function (x) { return x.k === "plan"; }).pop(), stN = P1 ? E.items.filter(function (x) { return x.k === "step" && String(x.at) >= String(P1.at); }).length : 0;
      if (P1 && (P1.pieces || []).length > 1 && stN < P1.pieces.length - 1) return true; } catch (e) { }
    return false;
  };
  ST.finOf = function (s, pid, ut, rx) {
    /* دورِ ۲۶ (Q6، A26-29 aA4 p6 «… با ۵ متر کم می‌آوردم! ۶ متر می‌خرم»): جوابی که با فعل/کمیتِ خودِ مجهول داده می‌شود جوابِ کل است حتی اگر شمارشِ گام‌های طرحش
       هنوز «مانده» نشان دهد (گام‌ها را در همان پیامِ طرح حساب کرده بود) — فقط حرفِ خودش («هنوز … نمی‌دونم») یا دفترِ کارِ پیشینِ نادرست جلوی آن را می‌گیرد.
       پیش‌تر جوابِ دومش «میانی» ماند و کارتِ «در گفت‌وگو به نتیجه رسیدی» تا پایان همان جوابِ نخستِ ردشده («۵ متر می‌خرم») را نشان داد. */
    if (ST.subRes(s, pid, ut, true)) return false;
    if (ansUnk(s, pid, rx) || ansUnk(s, pid, ut)) return true;
    if (ST.subRes(s, pid, ut)) return false;
    var E = storyOf(s || {}, keyFor(s, pid)), P1 = E.items.filter(function (x) { return x.k === "plan"; }).pop(), stN = P1 ? E.items.filter(function (x) { return x.k === "step" && String(x.at) >= String(P1.at); }).length : 0;
    return FIN24.test(String(rx || "")) || FIN24.test(String(ut || "")) || !!(P1 && (P1.pieces || []).length > 1 && stN >= P1.pieces.length - 1) || CLOSE25.test(String(ut || ""));
  };
  /* ---------- دورِ ۲۶ (Q6 «مرحله و بستن از صفحه پیروی می‌کند»، DECISIONS_R26؛ U11 = B25·D9 STILL — tB1 p6، aB1 p3، aB3 p5، pwB1 p8؛ C26-4) ----------
     ریشه: دفترِ داستان نتیجهٔ کل را با شاهدِ مثبت می‌شناخت (ST.finOf) ولی مرحلهٔ گفت‌وگو (a27 coach_state) هر «نتیجه»‌ای را که «میانی» بودنش ثابت نمی‌شد «بازنگری» می‌کرد —
     دو داوری برای یک چیز. حالا یک داوری برای هر دو: «نتیجه» فقط وقتی مسئله را به «بازنگری» می‌برد که جوابِ کل باشد (ST.wholeRes = همان ST.finOf روی نقلِ سنجیدهٔ همان پیام)؛
     نتیجه‌ای که همان پیام شکستش را گزارش می‌کند (fail: آزمونی که حدس را رد کرد) یا فقط پرسش است هرگز جوابِ کل نیست.
     «مدل گزارش می‌دهد، صفحه می‌سنجد» (experiences/model-reports-state-page-validates.md): جوابِ کل = شاهدِ خودِ صفحه (فعل/کمیتِ مجهول، «جوابش … شد»، پایانِ طرح، «همینه»)،
     یا گزارشِ مدل که مرحله را «بازنگری» خوانده (ph:"b") و هیچ نشانهٔ میانی‌بودنِ صفحه ردش نمی‌کند (حرفِ خودش، دفترِ کارِ پیشین، گامِ ماندهٔ طرح). در هر چهار نمونهٔ U11 مدل خودش
     مرحله را «بازنگری» نخوانده بود (p/u/e) و صفحه با این حال جلو برده بود. */
  ST.wholeRes = function (s, pid, ut, a) {
    if (!a || a.fail === true) return false;
    var rt = txtOf(a.result), q = rt && quoteIn(rt, ut), rx = q ? rt : String(ut || "");
    if (/[؟?]\s*$/.test(txt(rx))) return false;
    /* بانکِ R26 #164 («۲٫۴ × ۳ = ۶، پس ۶ متر می‌خرم» — نخستین نتیجه، و حسابِ خودِ صفحه آن را ✗ می‌خواند): نتیجه‌ای که صفحه خودش نادرست خوانده جوابِ کل نیست؛ لغزش کارِ همین نوبت است */
    try { if (ST.arithChk && ST.arithChk(String(ut || ""), String(ut || "")).some(function (c) { return c && c.ok === false; })) return false; } catch (e) { }
    if (ST.finOf(s, pid, ut, rx)) return true;
    return String(a.ph || "") === "b" && !ST.subRes(s, pid, ut);
  };
  /* ایدهٔ هنوز شکل‌نگرفته («فقط یه فکر دارم: شاید بشه …») یا طرحی که پرسیده می‌شود («اول … بعد …؟») طرحِ در دستِ اجرا نیست ⇒ مرحله «طرح» می‌ماند (بانکِ R25 #173، #183) */
  var IDEA25 = /شاید(?![آ-ی])|(?:یه|یک)\s*(?:فکر|ایده)(?:ی|‌ای)?\s*(?:دارم|به\s*ذهنم)|به\s*ذهنم\s*(?:رسید|می[‌\s]?رسه)|ممکنه(?![آ-ی])|نمی[‌\s]?دونم\s*(?:بشه|میشه|درسته)/;
  ST.planIdea = function (ut, pt) { var T = String(ut || ""), P = txt(pt); if (IDEA25.test(P) || /[؟?]\s*$/.test(P)) return true;
    var S0 = sentences(T).filter(function (x) { return P && nz(x).indexOf(nz(P).slice(0, 24)) >= 0; })[0] || ""; if (S0 && (/[؟?]\s*$/.test(S0) || IDEA25.test(S0))) return true;
    var i = P ? T.indexOf(P.slice(0, 16)) : -1; return i > 0 && IDEA25.test(T.slice(Math.max(0, i - 60), i)); };
  /* تعهدِ زمانی («تا پس‌فردا انجامش میدم»، D24-9 oD1 c40) طرح نیست: «کِی» دارد و «چه» ندارد — پس از برداشتنِ زمان و فعلِ جانشین («انجامش می‌دهم») واژهٔ معناداری نمی‌ماند */
  var WHEN25 = /(?:^|\s)(?:تا|از|برای|همین|این|اون|آن|هر)?\s*(?:پس[‌\s]?فردا|فردا(?:\s*(?:صبح|ظهر|عصر|شب))?|امروز|امشب|امسال|آخرِ?\s*هفته|هفته(?:‌ی|ی|ٔ)?\s*(?:بعد|دیگه|دیگر|آینده)|ماهِ?\s*(?:بعد|دیگه|دیگر|آینده)|(?:یک|دو|سه|پنج|چهار)?[‌\s]?شنبه|جمعه|[0-9۰-۹]+\s*(?:روز|هفته|ماه|ساعت)\s*(?:دیگه|دیگر|بعد)?|بعداً|بعدا|زود)(?![آ-ی])/g;
  var PROVERB25 = /(?:انجام(?:ش|شون)?|تموم(?:ش)?|تمام(?:ش)?|این\s*کار(?:و|\s*را|\s*رو)?|همین\s*کار(?:و|\s*را|\s*رو)?)\s*(?:می[‌\s]?(?:دم|دهم|کنم)|میدم|میکنم|بدم|بدهم|کنم)|بر[‌\s]?می[‌\s]?گردم|خبر(?:ت|تون)?\s*می[‌\s]?(?:دم|دهم)/g;
  function planHasWhat(t) { return toks(String(t || "").replace(PROVERB25, " ").replace(WHEN25, " ")).length >= 1; }
  ST.planHasWhat = planHasWhat;
  var EV_T = { whole: "کل در یک جمله (از گفت‌وگو)", u: "مجهول (از گفت‌وگو)", c: "شرط (از گفت‌وگو)", d: "داده (از گفت‌وگو)", plan: "طرح (از گفت‌وگو)", step: "گام (از گفت‌وگو)", res: "نتیجه (از گفت‌وگو)", other: "کارِ دیگری (از گفت‌وگو) — نه نتیجهٔ تو", lb: "بازنگری (از گفت‌وگو)", prior: "کارِ پیشینِ تو (از گفت‌وگو)", tried: "امتحانِ ردشده (از گفت‌وگو)" };
  var EV_K = { whole: "cwhole", u: "cunk", c: "ccond", d: "cdata", plan: "cplan23", step: "cstep", res: "cres", other: "cother", lb: "clb", prior: "cprior", tried: "ctried" };
  ST.EV_K = EV_K;
  var MARK27 = { d: 1, res: 1, step: 1, other: 1, whole: 1, tried: 1 };
  function markOf27(it, um) {
    if (!it || !MARK27[it.k] || !ST.arithChk || !ST.arithNote || !/[0-9۰-۹]/.test(String(it.t || ""))) return "";
    try { var ut = String((um && um.text) || it.t), q = String(it.t || "").replace(/…$/, ""), ck = ST.arithChk(q, ut.indexOf(q) >= 0 ? ut : q);
      if (!ck.length && !(ck.unread || []).length) return ""; var N = ST.arithNote(ck, ""); if (!N || !N.chk) return "";
      return "حسابِ صفحه: " + (N.bad ? "✗ " : N.ask ? "؟ " : N.unread && !ck.some(function (c) { return c.ok && !c.ask; }) ? "— " : "✓ ") + N.chk; } catch (e) { return ""; }
  }
  ST.markOf27 = markOf27;
  /* دورِ ۲۷b (history، D27-10 arD1 «چهار نقطهٔ یکسانِ کارِ پیشینِ تو (از گفت‌وگو) برای یک گام»): رویدادِ به‌روزرسانیِ دفترِ «کارِ پیشین» نامِ خودش را دارد —
     کدام گام و چه شد («کارِ پیشین — به‌روز شد: گامِ ۲ حکم رد شد») — تا در 🧭 و 📜 هر رخداد از دیگری جدا خوانده شود */
  function title27(it) { var t = String(it && it.t || ""); if (it && it.k === "prior" && /^کارِ پیشینِ تو — به‌روز شد:/.test(t)) return clip(t.replace(/^کارِ پیشینِ تو/, "کارِ پیشین").replace(/\s*·\s*(?:ازسرگیری از گامِ \S+|بقیه درست|همه درست)\s*$/, ""), 110); return EV_T[it.k]; }
  function logEv(s, pid, it, um, key) {
    if (!A.EVLOG || !A.EVLOG.add) return;
    var lines = it.k === "prior" ? (it.lines || priorLines(it.prior)) : it.k === "other" ? [it.t, "از زبانِ «" + it.who + "» — صفحه می‌سنجد و نشان می‌دهد، ولی نتیجه یا گامِ تو شمرده نمی‌شود (C57)"] : [it.t].concat(it.k === "plan" && (it.pieces || []).length > 1 ? it.pieces.map(function (p, i) { return "گامِ " + fa(i + 1) + ": " + p; }) : []).concat(it.q ? ["پرسش: «" + clip(it.q, 120) + "»"] : []);
    /* دورِ ۲۷b (history، A27-4، بانکِ R27 #230): نشانِ صفحه (✓/✗/؟/—) کنارِ سطرِ خودش در 📜 — همان سنجشِ a46 که مربی در همین نوبت دید (ST.arithChk بر همین تکه در همین پیام)،
       با همان جملهٔ «برای خودش» ِ ST.arithNote (عددِ درستِ ✗ لو نمی‌رود)؛ سطری که حسابی ندارد نشانی نمی‌گیرد */
    var mk27 = markOf27(it, um); if (mk27) lines = lines.concat([mk27]);
    var src = um ? { sess: s.id, mid: mid(um), text: um.text, at: um.at || "", title: s.title || "" } : null;
    try { A.EVLOG.add(Object.assign(pid ? { pid: pid } : { sess: s.id }, { id: "st23_" + key.replace(/[^\w]/g, "_") + "_" + it.k + "_" + it.n, k: EV_K[it.k], at: it.at, title: title27(it), lines: lines, out: "", src: src, by: "coach" })); } catch (e) { }
  }
  /* پرسشِ بازنگری ⇐ خانهٔ فرمِ بازنگری */
  function lbField(q) { var x = nz(q); return /راه\S*\s*دیگر/.test(x) ? "other" : /یک\s*نگاه/.test(x) ? "glance" : /وارسی|چک/.test(x) ? "chkHow" : /(?:کجای\s*دیگر|جای\s*دیگر|به\s*کار\s*(?:می|ببر))/.test(x) ? "use" : ""; }

  /* ---------- دورِ ۲۷ (story R6، C57؛ D27-8 arD1 p13): حساب یا نتیجه‌ای که از کسِ دیگری نقل کرد «کارِ دیگری» است ----------
     «نسخهٔ دومِ همین حساب‌ها رو برادرم نوشته بود، اینا رو هم ببین: …»، «داداشم حساب کرد …»: از جملهٔ نسبت‌دادن تا پایانِ پیام (یا تا جمله‌ای که دوباره کارِ خودش است:
     «ولی خودم/من … حساب کردم») مالِ آن دیگری است — سنجیده و نشان داده می‌شود (a46)، ولی هرگز نتیجه، گام یا «اجرا +» ِ او نیست. نامِ کوچکِ آدم‌ها این‌جا خوانده نمی‌شود (C22/C38)؛
     فقط نسبت («برادرم»، «همکارم») که نامِ شخص نیست. */
  var WHO27 = "(?:برادر|داداش|خواهر|آبجی|پدر|بابا|مادر|مامان|همسر|شوهر|دوست|رفیق|همکار|همسایه|پسر|دختر|معلم|استاد|عمو|دایی|خاله|عمه|هم[‌\\s]?کلاسی|مربی|فروشنده|بنگاهی|مکانیک|دکتر)(?:‌?(?:م|مون|ش|مان))?ِ?";
  var OTHER27 = new RegExp("(?:^|[\\s،,.:«(])(" + WHO27 + ")(?:\\s+[^\\s.!؟?،:]{1,14}){0,4}?\\s+(?:حساب\\s*(?:کرد|کرده)|نوشت|نوشته|درآورد|دراورد|درآورده|حل\\s*(?:کرد|کرده)|گفت|گفته|رسید|رسیده|می[‌\\s]?گه|میگه|می[‌\\s]?گوید|می[‌\\s]?گفت)(?![آ-ی])");
  var MINE27 = /(?:^|[\s،,.])(?:(?:ولی|اما)\s+)?(?:من|خودم)(?![آ-ی])/;   /* «… ولی من خودم دوباره شمردم شد ۱۲» (بانکِ R27 #248): از «من/خودم» به بعد دوباره کارِ خودش است */
  ST.otherWork27 = function (ut) {
    var T = String(ut || ""), m = OTHER27.exec(T); if (!m) return null;
    var S0 = T.slice(0, m.index + 1), from = Math.max(S0.lastIndexOf(". "), S0.lastIndexOf("! "), S0.lastIndexOf("؟ "), S0.lastIndexOf("\n")) + 1, to = T.length;
    var rest = T.slice(m.index + m[0].length), mm = MINE27.exec(rest); if (mm) to = m.index + m[0].length + mm.index;
    return { who: m[1], from: from, to: to, text: txt(T.slice(from, to)) };
  };
  /* q (نقلِ نتیجهٔ مدل) درونِ تکهٔ دیگری است؛ بی q: هیچ عددی بیرون از آن تکه نیست */
  ST.otherOwns27 = function (ut, q) {
    var O = ST.otherWork27(ut); if (!O) return false; var T = String(ut || "");
    if (q) { var i = T.indexOf(String(q).replace(/…$/, "").slice(0, 24)); if (i >= 0) return i >= O.from && i < O.to; }
    return /[0-9۰-۹]/.test(T.slice(O.from, O.to)) && !/[0-9۰-۹]/.test(T.slice(0, O.from) + " " + T.slice(O.to));
  };
  /* ---------- نوبت: پس از سنجشِ a27 (C.saidOk ِ همین پیام) ---------- */
  function onState(s, a) {
    var um = lastUser(s); if (!um || !a || typeof a !== "object") return;
    var C = s.coach = s.coach || {}, ut = String(um.text || ""); pkLog(s, um.at);
    var so = C.saidOk && C.saidOk.at === String(um.at || "") ? C.saidOk : null;
    /* دورِ ۲۵ (P1، B25·D8): «یادم رفته بود …» کنارِ کارِ همین مسئله داستانِ نوبت را نمی‌اندازد — فقط پیامی که جز جملهٔ یادآوری حرفی ندارد کنار می‌رود */
    if (AS.RECALL22 && AS.RECALL22.test(ut) && !recallWork25(ut, a)) return;                     // گزارشِ تمرین/یادآوری کارِ این مسئله نیست (بانکِ R23 #85)
    /* دورِ ۲۶ (C21): صفحه برای همین پیام پرسید «کدام مسئله؟» ⇒ تا جوابِ او چیزی از این پیام در داستانِ هیچ مسئله‌ای نمی‌نشیند */
    if (C.ask26 && C.ask26.open && C.ask26.key === nz(ut).slice(0, 80)) { try { S.put(s); } catch (e) { } return; }
    var bl = null; try { bl = AS.boundLive ? AS.boundLive(s) : null; } catch (e) { }
    var pid = (so && so.live) || (bl && !bl.done && bl.pid) || "", key = keyFor(s, pid);
    /* دورِ ۲۵ (P5، بانکِ R25 #168): پیامِ مرزی — «اولی حل شد، جواب ۱۲ مترمکعبه. یه مسئلهٔ دیگه: …» — نتیجه‌ای که پیش از معرفیِ مسئلهٔ تازه گفت مالِ مسئلهٔ پیشین است */
    try { var X25 = (C.split25 || []).slice().pop(), rq25 = txtOf(a.result); if (X25 && X25.pre) X25 = Object.assign({}, X25, { from: X25.pre, _raw: X25 });   // دورِ ۲۶ (بانک #87): نتیجه‌ای که پیش از معرفیِ مسئلهٔ تازه با نامِ مسئلهٔ دیگری گفت مالِ همان است
      if (X25 && X25.key === nz(ut).slice(0, 80) && !X25.carried) { var pre25 = ut.slice(0, Math.max(0, X25.off)), rx25 = !pre25 ? "" : rq25 && quoteIn(rq25, pre25) ? rq25 : (Array.isArray(a.said) && a.said.indexOf("result") >= 0 && /[0-9۰-۹]/.test(pre25) ? txt(pre25) : "");
        X25.carried = true; if (X25._raw) X25._raw.carried = true;
        /* لحظهٔ جدا شدن = لحظهٔ همین پیام (نه لحظهٔ ساختِ پرامپت): رویدادهای مسئلهٔ تازه در همین پیام مالِ مسئلهٔ پیشین شمرده نشوند (ST.owns با lprobLog) */
        (s.lprobLog || []).forEach(function (e) { if (e && !e.p && String(e.at || "") >= String(um.at || "") && String(e.at || "") <= nowIso() && !e.s25) { e.at = String(um.at || e.at); e.s25 = 1; } });
        if (rx25 && A.liveRec && A.liveRec(X25.from)) { var kO = "L:" + X25.from, EO = storyOf(s, kO, true), itO = { k: "res", t: clip(rx25, 300), fin: ST.finOf(s, X25.from, pre25, rx25), at: String(um.at || nowIso()), mid: mid(um), n: EO.items.length + 1 };
          EO.items.push(itO); logEv(s, X25.from, itO, um, kO); feed(X25.from, s, [itO], um); } } } catch (e) { }
    var rs25 = 0; try { var g25 = ledger(s, key, pid).pr; rs25 = g25 ? g25.resume : 0; } catch (e) { }   // گامی که پرسشِ نوبتِ پیش درباره‌اش بود (نقطهٔ ازسرگیری پیش از این پیام)
    var ppid27 = pid || priorPid27(s, ut), pkey27 = ppid27 === pid ? key : keyFor(s, ppid27);   // دورِ ۲۷ (C56): دفترِ مسئلهٔ بسته
    var prCh25 = priorReply(s, pkey27, ppid27, ut, um);   // دورِ ۲۴ (R8): پاسخِ او به «درست است؟» ِ حکم‌ها — دورِ ۲۵: با معنا، هر گام جدا
    /* said ِ سنجیدهٔ a27 (صورتِ چسبانده فقط با برچسبِ صریح)؛ «کل» با نشانهٔ صریحِ خودش («کلش اینه: …»، «در یک جمله: …») حتی در پیامِ نخست — مدل گزارشِ وضعِ همین پیام را داد */
    var said = so ? so.said.slice() : [], real = !!(so && so.real), I = [];
    /* دورِ ۲۷ (C57): پیامی که همهٔ عددهایش کارِ کسِ دیگری است داده/نتیجهٔ او نیست (a27 نتیجه را پیش‌تر برداشت) */
    var OW27 = null; try { OW27 = ST.otherWork27(ut); } catch (e) { } var allOther27 = !!OW27 && ST.otherOwns27(ut, "");
    if (allOther27) said = said.filter(function (k) { return k !== "d" && k !== "result"; });
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
        if (toks(pt).length >= 2 && planHasWhat(pt)) { var pi25 = { k: "plan", t: clip(pt, 400), pieces: ms.length >= 2 ? ms : planPieces(pt) }; if (ms.length < 2 && ST.planIdea(ut, pt)) pi25.idea = true; I.push(pi25); }   // دورِ ۲۵ (D24-9): تعهدِ زمانیِ بی «چه» طرح نیست
      }
      if (said.indexOf("result") >= 0) { var rt = txtOf(a.result), rx = clip(rt && quoteIn(rt, ut) ? rt : ut, 300);
        /* نتیجه‌ای که فقط پرسش است («پس اصلاً تموم نمیشه؟») نتیجه نیست؛ نتیجهٔ کل (fin) یا میانی */
        if (!/[؟?]\s*$/.test(rx) || (rt && quoteIn(rt, ut) && !/[؟?]\s*$/.test(rt))) {
          if (!(ST.splitOff(s, ut) > 0)) I.push({ k: "res", t: rx, fin: ST.wholeRes(s, pid, ut, a) });   // دورِ ۲۶ (Q6): همان یک داوریِ مرحله (ST.wholeRes) — نتیجهٔ آزمونی که شکست خورد یا مدل «بازنگری» نخواندش جوابِ کل نیست   // دورِ ۲۵ (P5): یک داوری (ST.finOf) — نتیجهٔ میانی هرگز fin نیست؛ جواب با فعلِ خودِ مجهول fin است
        }
      }
    }
    /* دورِ ۲۵ (P1، D25-7 — pwD1 «… به نظرم این دیگه حل شد»): پیامی که هم جوابِ کل را می‌گوید و هم «حل شد»؛ a27 «نتیجه» را به‌خاطرِ ادعای «حل شد» از said برمی‌دارد،
       ولی نقلِ نتیجهٔ مدل در همین پیام هست و نشانهٔ جوابِ کل دارد ⇒ در داستان می‌ماند (وگرنه صفحه نمی‌داند در گفت‌وگو حل شده و قابِ فهم را دوباره می‌خواهد) */
    if (so && real && !corr && said.indexOf("result") < 0 && !I.some(function (x) { return x.k === "res"; })) { var rt5 = txtOf(a.result);
      if (rt5 && quoteIn(rt5, ut) && FIN24.test(rt5) && !/[؟?]\s*$/.test(rt5) && /حل\s*شد(?![آ-ی])/.test(ut)) I.push({ k: "res", t: clip(rt5, 300), fin: true }); }
    /* گزارشِ گام (step) — نقلِ همین پیامِ خودش، نه قصدِ آینده؛ برای مسئلهٔ زنده a38 خودش گامِ باز را می‌بندد (A.liveStepReport) و این‌جا فقط داستان */
    var sp = a.step && typeof a.step === "object" ? a.step : null, sq = sp ? txt(sp.quote || sp.what || sp.text || "") : "";
    if (sp && sq && quoteIn(sq, ut) && !FUTURE.test(sq) && toks(sq).length >= 2 && sp.done !== "no") I.push({ k: "step", t: clip(A.PRE && A.PRE.herSpan ? A.PRE.herSpan(sq, ut) : sq, 200) });
    /* پاسخِ پرسشِ بازنگری (ans ِ سنجیده) */
    if (real && so) (so.ans || []).forEach(function (q) { var f = lbField(q); if (f && toks(ut).length >= 2) I.push({ k: "lb", t: clip(ut, 300), q: q, f: f }); });
    /* مجهولِ کوتاهِ مدل (coach_state.unknown) — فقط اگر هر واژهٔ معنادارش در صورت/کلِ همین مسئله هست (نه مجهولِ مسئلهٔ دیگر) */
    var uk = txtOf(a.unknown); if (uk) { var base = toks([stmtOf(s, pid), (storyOf(s, key).items.filter(function (x) { return x.k === "whole"; })[0] || {}).t].join(" ")), uw = toks(uk).filter(function (w) { return !/^(?:تعداد|مقدار|اندازه|قیمت|بهترین|کدوم|کدام)$/.test(stem(w)); });
      if (uw.length && uw.every(function (w0) { return hit(w0, base); })) { var E0 = storyOf(s, key, true); E0.unk = { t: clip(uk, 100), at: String(um.at || nowIso()) }; } }
    /* دورِ ۲۴ (R8 «کارِ پیشینِ من»، نقشهٔ راهِ منبع‌ها §۲۱): حکمِ گام‌به‌گامِ کارِ پیشینش (coach_state.prior) — صفحه نقل و عدد/واحد را می‌سنجد */
    /* دورِ ۲۵ (P1): یک دفتر — گزارشِ تازه ادغام می‌شود، اصلاحِ خودش در همان گام می‌نشیند، اصلاحِ داده گام را کهنه می‌کند (priorTurn25) */
    if (OW27 && /[0-9۰-۹]/.test(OW27.text) && !(storyOf(s, key).items || []).some(function (x) { return x.k === "other" && x.mid === mid(um); })) I.push({ k: "other", t: clip(OW27.text, 300), who: OW27.who });
    try { priorTurn25(s, allOther27 ? Object.assign({}, a, { prior: undefined }) : a, um, pkey27, ppid27, I, prCh25 || [], rs25); } catch (e) { console.warn(e); }
    if (!I.length) { try { S.put(s); } catch (e) { } return; }
    var E = storyOf(s, key, true), m0 = mid(um), at = String(um.at || nowIso()), added = [];
    /* دورِ ۲۶ (Q3، D26-6 pwD2 p6 «… پس خودِ حدس برای 73 درسته … حالا یه حدس به ذهنم رسید: … می‌خوام این رو مثلِ یه مسئلهٔ واقعی … اول برای 97 و 193 امتحانش می‌کنم»):
       مسئلهٔ تازه‌ای که همین نوبت از جمله‌ای وسطِ همین پیام ساخته شد (chat_invent/live_new) مالکِ هر چیزی است که او از همان جمله به بعد گفت؛ آنچه پیش از آن گفت مالِ
       مسئلهٔ پیشین می‌ماند (پیش‌تر طرحِ مسئلهٔ تازه «گامِ کنونی» ِ مسئلهٔ پیشین شد). */
    var B26 = null; try { B26 = bornFrom26(s, um) || movedTo26(s, um, pid); } catch (e) { B26 = null; }
    if (B26 && B26.pid !== pid && B26.off > 0) { var kB = "L:" + B26.pid, EB = storyOf(s, kB, true), movedB = [];
      I = I.filter(function (it) { if (it.k === "prior") return true; var ix = ut.indexOf(String(it.t || "").replace(/…$/, "").slice(0, 16)); if (ix < B26.off) return true;
        if (!EB.items.some(function (x) { return x.k === it.k && x.mid === m0 && nz(x.t) === nz(it.t); })) { it.at = at; it.mid = m0; it.n = EB.items.length + 1; EB.items.push(it); movedB.push(it); logEv(s, B26.pid, it, um, kB); } return false; });
      if (movedB.length) feed(B26.pid, s, movedB, um); }
    I.forEach(function (it) {
      if (E.items.some(function (x) { return x.k === it.k && x.mid === m0 && nz(x.t) === nz(it.t); })) return;
      it.at = at; it.mid = m0; it.n = E.items.length + 1; E.items.push(it); added.push(it); logEv(s, pid, it, um, key);
    });
    if (pid && added.length) feed(pid, s, added, um);
    /* دورِ ۲۴ (B24·D2، بانکِ R24 #40): مسئلهٔ گفت‌وگویی که همین حالا مسئلهٔ زنده شد (chat_solved/live_new در همین نوبت) کارِ همین پیام را هم می‌گیرد */
    else if (!pid && added.length) { var lp24 = ""; try { lp24 = ST.livedPk(s, key); } catch (e) { } if (lp24) feed(lp24, s, added, um); }
    try { S.put(s); } catch (e) { }
  }
  function recallWork25(ut, a) {
    if (Array.isArray(a && a.prior) && a.prior.length) return true;
    var rest = sentences(String(ut || "")).filter(function (x) { return !(AS.RECALL22 && AS.RECALL22.test(x)); });
    return rest.some(function (x) { return toks(x).length >= 3 && (WORK24.test(x) || /گام/.test(x) || /[0-9۰-۹]/.test(x)); });
  }
  /* نوبتِ دفترِ کارِ پیشین پس از پاسخِ مدل: ادغامِ گزارش ⇒ اصلاحِ خوانای صفحه ⇒ retract ⇒ گام/نتیجهٔ سنجیدهٔ مدل؛ سپس یک رویداد در 📜/🧭 و اعتبار در کارنامه */
  function priorTurn25(s, a, um, key, pid, I, ch0, rs0) {
    var ut = String(um.text || ""), at = String(um.at || nowIso()), G = ledger(s, key, pid), old = G.pr, rep = priorOf(s, a, um), ch = (ch0 || []).slice(), isNew = false;
    var open = false, open0 = false; try { open0 = (priorOpenAt(s, pid, um) || CALLS25.test(ut)) && !(OTHER26.test(ut) && !MINE26.test(ut)); open = open0 || (MINE26.test(ut) && !OTHER26.test(ut)); } catch (e) { }   // دورِ ۲۷ (C56): «یه چیزِ دیگه هم حساب کرده بودم: …» گامِ تازهٔ همان دفتر است
    var C = s.coach = s.coach || {}, asked = { n: rs0 || 0 };
    /* دورِ ۲۸ (C98): گامی که نقلش در جملهٔ «پرسشِ خالی» ِ حساب است («راستی ۷ × ۸ = ۵۶ بود دیگه؟») گامِ هیچ دفتری نیست — نه دفترِ تازه، نه گامِ افزوده */
    var own28 = OWNSTEP27.test(ut) || MINE26.test(ut) || STUCK27.test(ut);
    if (rep && !own28) { var BQ = sentences(ut).filter(bareQ28); if (BQ.length) { rep.steps = rep.steps.filter(function (x) { var q = String(x.quote || ""); return !q || !BQ.some(function (b) { return quoteIn(q, b); }); }); if (!rep.steps.length) rep = null; else if (!old) rep.steps.forEach(function (x, i) { x.n = i + 1; }); } }
    if (bareMsg28(ut, own28)) open0 = false;
    /* دورِ ۲۷: دفترِ تازه فقط با آغازِ مسئله یا درخواستِ خودش (A26-7)؛ «حساب کرده بودم» فقط به دفترِ موجود گام می‌افزاید (open) */
    if (!old) { if (!rep || !open0) return; var real = rep.steps.filter(function (x) { return !x.test; }); if (!real.length) return;   // حالت‌های آزموده دفتر نیستند (A25-4)
      old = rep; isNew = true; rep.steps.forEach(function (x) { delete x.mn; }); if (G.L) G.L.prior = old; else storyOf(s, key, true).prior = old; }
    else {
      if (rep) ch = ch.concat(priorMerge(old, rep, { open: open }));
      ch = ch.concat(pageFix(old, ut, at));
      /* retract ِ همین نوبت (پذیرفته یا ردشدهٔ موتورِ اصلاح): تکه در گامِ نادرست ⇒ اصلاحِ خودش؛ در گامِ درست ⇒ آن گام و وابسته‌هایش «کهنه» */
      var RX = []; (Array.isArray(a.retract) ? a.retract : a.retract ? [a.retract] : []).forEach(function (x) { if (x && typeof x === "object") RX.push({ frag: txt(x.msg || x.span || x.frag || x.old || ""), fix: txt(x.fix || x["new"] || ""), old: txt(x.old || ""), ok: false }); });
      (C.retracts || []).forEach(function (r) { if (r.cur !== mid(um) || !r.ok) return; var hitR = RX.filter(function (x) { return nz(x.fix) === nz(r.fix); })[0]; if (hitR) { hitR.ok = true; if (r.frag) hitR.frag2 = r.frag; } else RX.push({ frag: r.frag, fix: r.fix, ok: true }); });
      RX.forEach(function (r) { if (!r.frag || !r.fix || !quoteIn(r.fix, ut) && numsOf(r.fix).some(function (n) { return !numRe(n).test(digs(ut)); })) return;
        var fn = numsOf(r.frag), fw = toks(String(r.frag).replace(/[0-9۰-۹.٫]/g, " ")), inStep = function (x) { var T = curText(x), d = digs(T); return fn.length > 0 && fn.every(function (n) { return numRe(n).test(d); }) && (fw.length ? fw.some(function (w) { return hit(w, toks(T)); }) : true); };
        var cand = old.steps.filter(inStep); if (!fw.length && cand.length !== 1) cand = [];
        /* دورِ ۲۶ (Q2، U4/U5 pwB1 «ارتفاع ۱۵ ⇐ ۱۸ متر»: گامِ کابلِ «۱۵ متری» کهنه شد و گام‌های ۲ تا ۵ و ۱۰ تا ۱۲ نه؛ C25-15): گامِ درستی که کهنه می‌شود را موتورِ اصلاحِ صفحه می‌گوید
           (a38 A.livePriorStale — وابستگیِ نوشتهٔ خودش، زنجیره‌ای)، نه «عددِ تکه در متنِ گام هست». null ⇒ اصلاحِ غیرِ عددی: همان سنجهٔ پیشین. */
        var EN26 = null; if (r.ok && typeof A.livePriorStale === "function") { try { EN26 = A.livePriorStale({ pid: pid, sid: s.id, steps: old.steps.map(function (x) { return { n: x.n, t: curText(x), q: x.fixed ? x.quote : "", dep: x.dep || [] }; }), frag: r.frag2 || r.frag, fix: r.fix, old: r.old || "", cur: ut, stmt: C.stmt || "", msgs: (s.msgs || []).filter(function (m) { return m && m.role === "user" && !/^\[(?:سامانه|اصلاحِ پیامِ قبلی)/.test(String(m.text || "")); }).map(function (m) { return String(m.text || ""); }) }); } catch (e) { EN26 = null; } }
        if (EN26) { old.steps.forEach(function (x) { if (!EN26[x.n] || !okNow(x) || ch.some(function (c) { return c.n === x.n && (c.k === "fix" || c.k === "stale"); })) return; x.stale = { frag: clip(r.old || r.frag, 60), fix: clip(r.fix, 60), at: at, nums: EN26[x.n] }; x.her = ""; ch.push({ n: x.n, k: "stale" });
            /* همان پیوندِ «وابسته» ِ راهِ پیشین (C25-15): گامِ بعدی که عددِ نتیجهٔ این گام را به کار برده وابستهٔ آن است — حتی اگر موتور خودش را هم کهنه خوانده باشد */
            old.steps.forEach(function (y) { y.dep = y.dep || []; if (y.n > x.n && y.dep.indexOf(x.n) < 0 && (x.said || []).concat(resNums(curText(x))).some(function (n) { return n && numRe(n).test(digs(curText(y))); })) y.dep.push(x.n); }); });
          cand = cand.filter(function (x) { return !okNow(x); }); }
        cand.forEach(function (x) { if (ch.some(function (c) { return c.n === x.n && (c.k === "fix" || c.k === "stale"); }) || (x.depWrong || []).length || (x.depStale || []).length) return;   // گامِ وابسته با تکهٔ گامِ دیگر بازنویسی نمی‌شود — باید با عددِ تازه دوباره حساب شود
          var nt = subFrag(curText(x), r.frag, r.fix) || (fn.length === 1 && numsOf(r.fix).length === 1 ? subNum(curText(x), fn[0], numsOf(r.fix)[0]) : "");
          if (!okNow(x)) { if (nt) { var w = x.verdict; ch.push({ n: x.n, k: tryFix(x, nt, at, "her") ? "fix" : "retry", was: w }); } }
          else if (r.ok) { x.stale = { frag: clip(r.frag, 60), fix: clip(r.fix, 60), at: at }; x.her = ""; ch.push({ n: x.n, k: "stale" });
            /* هر گامِ بعدی که عددِ نتیجهٔ این گام را به کار برده وابستهٔ آن است */
            old.steps.forEach(function (y) { if (y.n > x.n && y.dep.indexOf(x.n) < 0 && (x.said || []).concat(resNums(curText(x))).some(function (n) { return n && numRe(n).test(digs(curText(y))); })) y.dep.push(x.n); }); } }); });
      relink(old);
      /* گام/نتیجهٔ سنجیدهٔ مدل در پاسخ به پرسشِ ازسرگیریِ همان گام (یا با نامِ خودِ گام) ⇒ اصلاحِ خودش — فقط اگر حسابِ صفحه بخواند (C8) */
      var its = I.filter(function (x) { return x.k === "step" || (x.k === "res" && !/[؟?]\s*$/.test(x.t)); });
      if (its.length && !ch.some(function (c) { return /^(?:fix|retry|flip|re|say|rework|restate|drop)$/.test(c.k); }) && a.fail !== true && !STUCK25.test(ut)) {   // دورِ ۲۶: گامی که مدل همین نوبت با شماره‌اش گزارش کرد (هر حکمی) از راهِ step/result دوباره «اصلاح» نمی‌شود
        var ns = stepNs(ut), tn = ns.length === 1 ? ns[0] : (asked.n || 0), x0 = tn ? old.steps[tn - 1] : null;
        /* دورِ ۲۶ (A26-14): نتیجهٔ میانی یا بی‌ربط «اصلاحِ خودش» ِ گامِ ازسرگیری نیست. بی نامِ گام، فقط وقتی می‌نشیند که (۱) همین نوبت حدس/پرسشِ باز دربارهٔ آن ندارد،
           و (۲) به خودِ آن گام می‌خورد (گامِ حسابی: همان حساب یا مقدارِ درستِ صفحه، یا جمله‌ای بی حسابِ دیگر با واژهٔ مشترک؛ گامِ غیرعددی: واژهٔ مشترک با نقل/نامِ گام). وگرنه چیزی ثبت نمی‌شود و پرسشِ ازسرگیری می‌ماند. */
        var rel26 = function (x, itm) { var T = [x.quote, curText(x), x.step].join(" "), W = toks(T.replace(/[0-9۰-۹.٫]/g, " ")).filter(function (w) { return w.length >= 3; }), IW = toks(String(itm.t).replace(/[0-9۰-۹.٫]/g, " ")).filter(function (w) { return w.length >= 3; }), ic = calcs(itm.t), B0 = x.badC || [];
          if (B0.length) { if (ic.some(function (k) { return B0.some(function (b0) { return b0.key === k.key; }); }) || numsOf(itm.t).some(function (n) { return B0.some(function (b0) { return Math.abs(parseFloat(n) - b0.val) <= tolOf(n, false) + 1e-9; }); })) return true;
            return !ic.length && IW.some(function (w) { return hit(w, W); }); }   // حسابِ دیگری با کلیدِ دیگر («۸۰ × ۰٫۰۲ = ۱٫۶») کارِ همان گام نیست
          return IW.some(function (w) { return hit(w, W); }); };
        var it0 = its[0]; if (x0 && ns.length !== 1) { it0 = its.filter(function (i0) { return rel26(x0, i0); })[0] || null; if (a.guess || /[؟?]\s*$/.test(ut.trim()) || !it0) x0 = null; }
        if (x0 && !okNow(x0) && !x0.wait && !(x0.her === "no" && !x0.reAt)) { var w0 = x0.verdict; ch.push({ n: x0.n, k: tryFix(x0, it0.t, at, "her") ? "fix" : "retry", was: w0 }); if (ch[ch.length - 1].k === "fix") ch = ch.concat(pageFix(relink(old), ut, at)); } }
      if (!ch.length) { if (G.pg) S.put(G.pg); return; }
      relink(old); old.upAt = at; old.turns = 0;
    }
    markWait(s, pid, old);
    if (pid && G.pg) { G.L.prior = old; S.put(G.pg); }
    /* کارنامه: گامِ درستِ پیشینش به حسابِ خودش (نه «گیر»)؛ گامِ نادرست/ناقص با علتِ خودش؛ اصلاحِ خودش یک موفقیت؛ حکمی که برگشت رویدادِ منفی‌اش را پس می‌گیرد */
    try { if (AS.coachEvent) { var EV = s.coachEv = s.coachEv || [];
      (isNew ? old.steps.map(function (x) { return { n: x.n, k: "new" }; }) : ch).forEach(function (c) { var x = old.steps[c.n - 1]; if (!x || x.test) return;
        if (c.k === "new" || c.k === "flip" || c.k === "re") { if (x.verdict === "unchecked") return;
          if (x.verdict === "ok") EV.forEach(function (e) { if (e.src === "prior" && e.prior === x.n && !e.ok && !e.wd && (!pid || e.pid === pid)) e.wd = { at: at, why: "دوباره‌سنجی: حکم برگشت" }; });
          AS.coachEvent(s, "c", "prior", x.quote, x.verdict === "ok", x.verdict === "ok" ? { prior: x.n } : { prior: x.n, cause: x.cause || "unknown", causeWhy: x.why || x.chk || "" }); }
        else if (c.k === "fix") AS.coachEvent(s, "c", "prior", x.fixed.t, true, { prior: x.n, how: "priorfix" }); }); } } catch (e) { }
    if (isNew) I.push({ k: "prior", t: old.sum, ph: old.ph, prior: old });
    else { var KF = { fix: "اصلاح شد", retry: "متنِ تازه هنوز نمی‌خواند", flip: "حکم عوض شد", re: "دوباره سنجیده شد", "new": "افزوده شد", stale: "کهنه پس از اصلاحِ خودت", no: "حکم رد شد", ack: "حکم پذیرفته شد", undo: "رد پس گرفته شد", restate: "بازنویسی شد", rework: "بازنویسی شد — هنوز «درست» نیست", say: "حرفِ تازه‌ات ثبت شد — حکم ماند", drop: "کنار گذاشته شد (به گفتهٔ خودت)" }, seen = {};
      var cl = ch.filter(function (c) { var k = c.n + c.k; if (seen[k]) return false; seen[k] = 1; return true; });
      var st26 = cl.filter(function (c) { return c.k === "stale"; }), stT26 = st26.length > 1 ? "گام‌های " + st26.map(function (c) { return fa(c.n); }).join("، ") + " کهنه شدند (با عددِ پیشین حساب شده بودند) — با «" + clip(old.steps[st26[0].n - 1].stale.fix, 30) + "» دوباره حساب شوند" : "";   // دورِ ۲۶ (Q2): چند گامِ وابسته در یک سطر
      C.prLast25 = { at: at, fix: cl.some(function (c) { return c.k === "fix" || c.k === "stale"; }), t: cl.filter(function (c) { return c.k === "fix" || (c.k === "stale" && !stT26); }).map(function (c) { var x = old.steps[c.n - 1]; return "گامِ " + fa(c.n) + (c.k === "fix" ? " «" + clip(x.fixed.t, 60) + "» (اصلاح شد ⇐ «" + clip(x.fixed.was, 40) + "»)" : " کهنه شد — با «" + clip(x.stale.fix, 30) + "» دوباره حساب شود"); }).concat(stT26 ? [stT26] : []).join("؛ ") };
      I.push({ k: "prior", t: "کارِ پیشینِ تو — به‌روز شد: " + cl.map(function (c) { return "گامِ " + fa(c.n) + " " + KF[c.k]; }).join("؛ ") + (old.resume ? " · ازسرگیری از گامِ " + fa(old.resume) : old.steps.some(function (x) { return x.drop; }) ? " · بقیه درست" : " · همه درست"), ph: old.ph,
        lines: ["کارِ پیشینِ تو — به‌روز شد (" + old.sum.replace(/^کارِ پیشینِ تو:\s*/, "") + ")"].concat(cl.map(function (c) { return stepLine(old.steps[c.n - 1], false); }).filter(function (l, i0, X) { return X.indexOf(l) === i0; })) }); }
  }
  ST.priorTurn25 = priorTurn25;
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
  /* دورِ ۲۵ (P2): این نسخه قرنطینه است (A.STORY.arithChkR24 — REMOVAL_CANDIDATES)؛ حسابِ صفحه را a46_arith.js با عددِ گویا و خواندنِ هر دو سمتِ تساوی می‌سنجد و A.STORY.arithChk را جایگزین می‌کند */
  ST.arithChkR24 = arithChk; ST.arithChk = arithChk;
  function fmtN(v) { var x = Math.round(v * 1000) / 1000; return fa(String(x).replace(".", "٫")); }
  function herMsgs(s, um) { return ((s && s.msgs) || []).filter(isUser).map(function (m) { return String(m.text || ""); }).concat(um ? [String(um.text || "")] : []); }
  /* ---------- دورِ ۲۵ (P1 «قراردادِ دفترِ کارِ پیشین»، DECISIONS_R25؛ نقشهٔ راهِ منبع‌ها §۲۱) ----------
     یک دفتر برای هر مسئله (مسئلهٔ زنده: L.prior؛ گفت‌وگو: story[key].prior) که هرگز جایگزین نمی‌شود:
       • گزارشِ تازهٔ prior ادغام می‌شود (شمارهٔ گام n، یا همان نقل)؛ گامِ منتظر/داوری‌شده سرِ جایش می‌ماند (A25-3، B25·D4، C25-9، D25-4)؛
       • بلوکِ «گزارش کن» فقط برای پیامِ آغازینِ مسئله یا پیامی که خودش «کارِ پیشینم» می‌خواندش — حسابِ میانهٔ کار هرگز (A25-5، C25-9، D25-24، B25·D13)؛
       • حالت‌های آزموده («امتحان کردم: …») دفتر نیستند (A25-4)؛ وابستگی فقط با عددِ نادرستِ همان گام، نه هر عددِ مشترک (B25·D7)؛
       • پاسخِ او با معنا خوانده می‌شود، هر گام جدا: «گامِ ۳ را قبول ندارم … ولی گامِ ۴ را قبول دارم» (D25-1)، «چرا میگی …؟» (C25-13، B25·D3)، «نه، بس نیست!» رد نیست (A25-7)؛
       • اصلاحِ خودِ او روی گامِ داوری‌شده (گزارشِ prior با n، گام/نتیجهٔ سنجیدهٔ مدل، retract، یا «X، نه Y» ِ خودش) در همان گام می‌نشیند و نقطهٔ ازسرگیری جلو می‌رود
         (C25-14، D25-2، B25·D15، A25-2)؛ اصلاحِ داده‌ای که گامِ درست بر آن بنا بود آن گام و وابسته‌هایش را «کهنه» می‌کند (C25-15)؛
       • ردِ حکم ⇒ دوباره‌سنجی با شاهد، و نتیجه‌اش روی صفحه (x.re) — پرسشِ «به چه دلیل؟» فقط یک نوبت (A25-7، D25-5)؛
       • سطرِ ویژهٔ مربی (chkM، «عددِ درست را لو نده») فقط در پرامپت؛ 🧭 و 📜 و صفحه سطرِ خودش (chk) را می‌گیرند (B25·D6، D25-3). */
  var TEST25 = /امتحان(?:ش)?\s*(?:کردم|کردیم|می[‌\s]?کنم)|آزمودم|آزمایش\s*کردم|تست\s*کردم|چک\s*کردم/;
  /* دورِ ۲۶ (Q4 — U3، C26-7، A26-7، C25-9): «کارِ پیشینِ خودم» یعنی کاری که **پیش‌تر/بیرون از این گفت‌وگو** کرده و برای داوری می‌آورد — نشانهٔ زمانِ گذشته (قبلاً/دیشب/…)،
     ماضیِ بعید یا «تا یه جایی» با «خودم»، نامِ خودِ کار («اینم کارِ خودمه»، «ادامهٔ کارِ خودم»، «یه گزارشِ دوم از کارِ خودم»)، یا فهرستِ شماره‌دارِ گام‌های خودش (هر دو شمارهٔ پیاپی، نه فقط ۱ و ۲).
     «خودم حساب کردم: …» و «نشستم حساب کردم» وسطِ کار روایتِ همین لحظه است (step/result و «# حسابِ صفحه»)، نه دفترِ کارِ پیشین. نسخهٔ دورِ ۲۵: ST.R25_QUARANTINE.CALLS25 (REMOVAL_CANDIDATES). */
  var CALLS25_R25 = /(?:خودم|قبلاً|قبلا|پیش[‌\s]*تر|دیروز|دیشب|پریروز)[^.!؟?\n]{0,40}(?:تا\s*(?:یه|یک)\s*جایی|تا\s*این[‌\s]*جا|حل(?:ش)?\s*کرده\s*بودم|جلو\s*(?:برد|رفت)(?:م|مش|ه\s*بودم)|حساب(?:ش)?\s*(?:رو|را)?\s*کرد(?:م|ه\s*بودم)|نوشت(?:م|ه\s*بودم))|این[‌\s]*(?:جوری|طوری|طور)\s*(?:حل(?:ش)?\s*کردم|رفتم|حساب\s*کردم)|کاری(?:ه)?\s*که[^.!؟?\n]{0,30}کرد(?:م|ه\s*بودم|ه[‌\s]*ام)|کارِ?\s*(?:قبلی|پیشین|نیمه[‌\s]*کاره)\s*(?:م|‌ام|ام|ِ\s*من|ی\s*من|ِ?\s*خودم)|گام[‌\s]*ها(?:ی)?\s*(?:م|‌ام|یم|ی\s*من|ی\s*خودم)|نیمه[‌\s]*کاره|تا\s*کجا(?:ش)?\s*درست|گام(?:ِ)?\s*(?:۱|1|اول)\s*[:：][^]*گام(?:ِ)?\s*(?:۲|2|دوم)\s*[:：]/;   // آخری: خودش گام‌هایش را شماره‌دار فهرست کرده («گام ۱: … گام ۲: …»)
  var CALLS25 = /(?:قبلاً|قبلا|پیش[‌\s]*تر|دیروز|دیشب|پریروز)[^.!؟?\n]{0,40}(?:تا\s*(?:یه|یک)\s*جایی|تا\s*این[‌\s]*جا|حل(?:ش)?\s*کرده\s*بودم|جلو\s*(?:برد|رفت)(?:م|مش|ه\s*بودم)|حساب(?:ش)?\s*(?:رو|را)?\s*کرد(?:م|ه\s*بودم)|نوشت(?:م|ه\s*بودم))|خودم[^.!؟?\n]{0,40}(?:تا\s*(?:یه|یک)\s*جایی|تا\s*این[‌\s]*جا|حل(?:ش)?\s*کرده\s*بودم|جلو\s*(?:برد|رفت)(?:م|مش|ه\s*بودم)|حساب(?:ش)?\s*(?:رو|را)?\s*کرده\s*بودم|نوشته\s*بودم)|این[‌\s]*(?:جوری|طوری|طور)\s*(?:حل(?:ش)?\s*کردم|رفتم|حساب\s*کردم)|کاری(?:ه)?\s*که[^.!؟?\n]{0,30}کرد(?:م|ه\s*بودم|ه[‌\s]*ام)|کارِ?\s*(?:قبلی|پیشین|نیمه[‌\s]*کاره)\s*(?:م|‌ام|ام|ِ\s*من|ی\s*من|ِ?\s*خودم)|(?:این(?:م|ا|[‌\s]*ها)?|ادامه(?:‌ی|ٔ|ی|ِ)?|از)\s*(?:هم\s*)?(?:ادامه(?:‌ی|ٔ|ی|ِ)?\s*)?کارِ?\s*خودم(?![آ-ی])|کارِ?\s*خودم(?:ه|ـه)(?![آ-ی])|گام[‌\s]*ها(?:ی)?\s*(?:م|‌ام|یم|ی\s*من|ی\s*خودم)|نیمه[‌\s]*کاره|تا\s*کجا(?:ش)?\s*درست|گام(?:ِ)?\s*(?:۱|1|اول)\s*[:：][^]*گام(?:ِ)?\s*(?:۲|2|دوم)\s*[:：]|گام(?:ِ)?\s*[0-9۰-۹]+\s*[:：—–][^]*?گام(?:ِ)?\s*[0-9۰-۹]+\s*[:：—–]/;
  var STUCK25 = /بلد\s*نیستم|نمی[‌\s]?دونم|نمی[‌\s]?دانم|گیر\s*کردم|گیرم(?![آ-ی])|به\s*ذهنم\s*نمی[‌\s]?رسه|نمی[‌\s]?تونم|نمی[‌\s]?توانم/;
  function kNorm(e) { return digs(e).replace(/\s+/g, "").replace(/[×x]/g, "*").replace(/÷/g, "/").replace(/[−–]/g, "-"); }   // کلیدِ حسابِ موتور (× ÷ −) به خطِ خوانندهٔ سبک (* / -)
  function curText(x) { return x && x.fixed ? x.fixed.t : (x ? x.quote : ""); }
  function okNow(x) { return !!x && x.verdict === "ok" && !x.stale && !((x.depStale || []).length); }
  /* حساب‌های نوشته‌شدهٔ یک متن (برای جور کردنِ «همان حساب، عددِ تازه») — همان عملگرهای arithChk، با «یعنی/است» هم؛ ارزیابی با evalChain */
  /* دورِ ۲۶ (Q4 — U18/B26·D22، C26-8): این خوانندهٔ سبک زنجیره را حلقه‌به‌حلقه می‌خواند («A = B = N»: هر حلقه با بعدی‌اش، و A با N فقط اگر همهٔ حلقه‌های میان درست باشند)،
     «≈» را رابط می‌داند و هرگز عددی را که به عبارت چسبیده «نتیجه» نمی‌گیرد («۱۳۶۰ ÷ ۰٫۵۵ ≈ ۲۴۷۰» دیگر «۱۳۶۰/۰٫۵ = ۵» خوانده نمی‌شود). نسخهٔ دورِ ۲۵: ST.R25_QUARANTINE.calcs. */
  function calcsR25(t) {
    var d = digs(t).replace(/(\d)\s*(?:ضرب\s*در|ضربدر|×|\*)\s*(?=-?\d)/g, "$1 * ").replace(/(\d)\s+در\s+(?=\d)/g, "$1 * ").replace(/(\d)\s*(?:تقسیم\s*بر|÷|\/)\s*(?=\d)/g, "$1 / ").replace(/(\d)\s*(?:منهای|−|–)\s*(?=\d)/g, "$1 - ").replace(/(\d)\s*(?:به[‌\s]?علاوهٔ?|بعلاوهٔ?|\+)\s*(?=\d)/g, "$1 + ");
    var re = /(\d+(?:\.\d+)?(?:\s*[*\/+\-]\s*\d+(?:\.\d+)?)+)\s*(?:=|میشه|می[‌\s]?شه|می[‌\s]?شود|شد|یعنی|است|هست)?\s*(?:حدود(?:ِ)?|تقریباً|تقریبا)?\s*(\d+(?:\.\d+)?)(?![0-9]|\.[0-9])/g, m, o = [];
    while ((m = re.exec(d))) { var v = evalChain(m[1]); if (v == null) continue; o.push({ key: m[1].replace(/\s+/g, ""), said: m[2], val: v, ok: Math.abs(v - parseFloat(m[2])) <= tolOf(m[2], /حدود|تقریب/.test(m[0])) + 1e-9 }); }
    return o;
  }
  function calcs(t) {
    var d = digs(t).replace(/(\d)\s*(?:ضرب\s*در|ضربدر|×|\*)\s*(?=-?\d)/g, "$1 * ").replace(/(\d)\s+در\s+(?=\d)/g, "$1 * ").replace(/(\d)\s*(?:تقسیم\s*بر|÷|\/)\s*(?=\d)/g, "$1 / ").replace(/(\d)\s*(?:منهای|−|–)\s*(?=\d)/g, "$1 - ").replace(/(\d)\s*(?:به[‌\s]?علاوهٔ?|بعلاوهٔ?|\+)\s*(?=\d)/g, "$1 + ");
    var NUM = "\\d+(?:\\.\\d+)?", EX = NUM + "(?:\\s*[*\\/+\\-]\\s*" + NUM + ")+", CONN = "(?:=|≈|≃|~|میشه|می[‌\\s]?شه|می[‌\\s]?شود|شد|یعنی|است|هست)", APX = "(?:حدود(?:ِ)?|حدوداً|حدودا|تقریباً|تقریبا)";
    var LINK = "\\s*(" + CONN + ")\\s*(" + APX + ")?\\s*(" + EX + "|" + NUM + ")(?![0-9]|\\.[0-9])";
    var re = new RegExp("(?:^|[^0-9.])(" + EX + ")((?:" + LINK + ")+)", "g"), m, o = [];
    while ((m = re.exec(d))) {
      var segs = [{ t: m[1], apx: false }], lr = new RegExp(LINK, "g"), l;
      while ((l = lr.exec(m[2]))) segs.push({ t: l[3], apx: !!l[2] || /[≈≃~]/.test(l[1]) });
      var V = segs.map(function (g) { return evalChain(g.t); }), isEx = function (g) { return /[*\/+\-]/.test(g.t); };
      /* حلقهٔ i ⇒ i+1: عددِ تنها با دقتِ نوشتهٔ خودش؛ عبارت با عبارت دقیق */
      var link = segs.map(function (g, i) { if (i === segs.length - 1) return true; var nx = segs[i + 1]; if (V[i] == null || V[i + 1] == null) return false;
        return isEx(nx) ? Math.abs(V[i] - V[i + 1]) <= 1e-9 * Math.max(1, Math.abs(V[i])) : Math.abs(V[i] - parseFloat(nx.t)) <= tolOf(nx.t, nx.apx) + 1e-9; });
      var last = segs[segs.length - 1], fin = isEx(last) ? "" : last.t;
      segs.forEach(function (g, i) { if (i === segs.length - 1 || !isEx(g) || V[i] == null) return; var ok = true; for (var j = i; j < segs.length - 1; j++) ok = ok && link[j];
        o.push({ key: g.t.replace(/\s+/g, ""), said: fin || segs[i + 1].t.replace(/\s+/g, ""), val: V[i], ok: ok, mid: !fin }); });
    }
    return o;
  }
  ST.calcs25 = calcs;
  /* واژهٔ شمرده‌شده پس از عدد («۱۲ جعبه»، «۱۲ ماهه») — برای این‌که هم‌عددیِ اتفاقی وابستگی نشود (بانکِ R25) */
  function unitAfter(t, n) { var m = new RegExp("(?:^|[^0-9.])" + String(n).replace(".", "\\.") + "(?![0-9.])\\s*([آ-ی‌]{2,})").exec(digs(t)); var w = m ? m[1].replace(/‌/g, "") : ""; return /^(?:میشه|میشود|شد|است|هست|یعنی|و|یا|به|در|از|تا|که|رو|را|هم|پس|منهای|ضربدر|ضرب|تقسیم|بعلاوه|بهعلاوه|تا)$/.test(w) ? "" : w; }
  function sameUnit(a, b) { return !a || !b || hit(a, [b]); }
  function numRe(n) { return new RegExp("(?:^|[^0-9.])" + String(n).replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&") + "(?![0-9])"); }
  function resNums(t) { var o = [], re = /(?:=|میشه|می[‌\s]?شه|می[‌\s]?شود|شد|یعنی)\s*(?:حدود(?:ِ)?\s*)?(\d+(?:\.\d+)?)/g, m, d = digs(t); while ((m = re.exec(d))) o.push(m[1]); return o; }   // عددهای نتیجه («= ۱۰۰»، «میشه ۴۵»)
  function numsOf(t) { return (digs(t).match(/\d+(?:\.\d+)?/g) || []); }
  /* کدام پیامِ او «آغازِ» این مسئله است: هنوز کاری درونِ نشست روی آن نشده و پیش از آن پیامی که مسئله را آورده باشد نیست */
  function usersBefore(s, um) {
    var M = ((s && s.msgs) || []).filter(isUser), i = um ? M.indexOf(um) : -1;
    if (i < 0 && um && M.length && nz(M[M.length - 1].text) === nz(um.text)) i = M.length - 1;
    return i < 0 ? M : M.slice(0, i);
  }
  /* دورِ ۲۶ (Q4 — C25-9، D25-24، A26-7): «آغازِ مسئله» سه شرطِ دیگر هم دارد —
       • پیش‌نیازی باز نیست (پاسخِ پرسشِ تشخیصی/تسلط کارِ پیشین نیست)؛
       • پیام‌های همان مسئله پیش از ثبت‌شدنش در «مسئلهٔ من» هم شمرده می‌شوند (مسئله‌ای که وسطِ گفت‌وگو زنده شد «تازه‌آغاز» نیست)؛
       • پس از مسئلهٔ دیگری در همین نشست، پیامِ بی پرسش (گزارشِ حساب، پاسخِ آزمون) آغازِ مسئله نیست — مگر خودش آن را کارِ پیشینش بخواند (priorAsk). */
  var ASKS26 = /[؟?]|می[‌\s]?خوا(?:م|یم|هم)\s*(?:بدونم|بدانم|ببینم|بفهمم|ببینی|بسنجی|ببینید|بسنجید)|ببین(?:ید)?\s*(?:درست|تا\s*کجا|کجاش)|درست\s*(?:رفتم|حساب\s*کردم)/;
  function priorOpenAt(s, pid, um) {
    if (!s || !um) return false; var key = keyFor(s, pid), k0 = mid(um) || "";
    if (storyOf(s, key).items.some(function (x) { return (x.k === "plan" || x.k === "step" || x.k === "res" || x.k === "prior") && x.mid !== k0; })) return false;
    try { if (A.PRE && A.PRE.scope && A.PRE.stack && A.PRE.stack(A.PRE.scope(s)).length) return false; } catch (e) { }
    var all = usersBefore(s, um), B = all, isP = function (m) { try { return AS.notProblem ? !AS.notProblem(String(m.text || "")) : true; } catch (e) { return true; } };
    if (pid) { var pg = S.get("eprog_" + pid), L = (pg && pg.solve && pg.solve.live) || {};
      if ((L.steps || []).length || (L.plan && txt(L.plan.t)) || (L.chatImpItems || []).some(function (x) { return x.k === "plan" || x.k === "step" || x.k === "res"; })) return false;
      var wins = []; try { (((s.coach || {}).pkLog) || []).forEach(function (e) { if (ST.livedPk(s, e.pk) === pid) wins.push(ST.pkWindow(s, e.pk)); }); } catch (e) { wins = []; }
      B = B.filter(function (m) { var at = String(m.at || ""); return pidAt(s, m.at) === pid || wins.some(function (w) { return at >= String(w.from || "") && at < String(w.to || "~"); }); }); }
    else { var win = ST.pkWindow(s, String(((s && s.coach) || {}).pk || "c:0")); B = B.filter(function (m) { return String(m.at || "") >= String(win.from || ""); }); }
    if (B.some(isP)) return false;
    if (all.some(function (m) { return B.indexOf(m) < 0 && isP(m); }) && !ASKS26.test(String(um.text || ""))) return false;
    return true;
  }
  ST.priorOpenAt = priorOpenAt;
  function isTestStep(span, hm, x) {
    if (x && (x.test === true || x.test === "true")) return true;
    if (TEST25.test(span) || /(?:^|\s)(?:امتحان|آزمون|آزمایش|نمونه(?:‌ها)?|تست)(?:\s|$)/.test(txt((x && (x.step || x.what)) || ""))) return true;
    return sentences(String(hm || "")).some(function (st) { if (!quoteIn(span, st)) return false; var i = st.search(TEST25); return i >= 0 && nz(st.slice(i)).indexOf(nz(span).slice(0, 24)) >= 0; });
  }
  /* پیوندها و نقطهٔ ازسرگیری از وضعِ کنونیِ دفتر (پس از هر گزارش، پاسخ یا اصلاح) */
  function relink(pr) {
    var steps = pr.steps;
    /* گامِ اصلاح‌شده‌ای که عددِ پیشینش (دیگر در متنِ تازه نیست) در گامِ بعدی به کار رفته ⇒ آن گام وابستهٔ همین است */
    steps.forEach(function (z) { if (!z.fixed || !(z.oldNums || []).length) return; steps.forEach(function (y) { y.dep = y.dep || []; if (y.n <= z.n || y.dep.indexOf(z.n) >= 0) return;
      if (z.oldNums.some(function (m) { return numRe(m).test(digs(y.quote)) && sameUnit(unitAfter(z.fixed.was, m), unitAfter(y.quote, m)); })) y.dep.push(z.n); }); });
    steps.forEach(function (y) { y.dep = y.dep || [];
      y.depWrong = y.dep.filter(function (n) { var z = steps[n - 1]; return z && z.verdict === "wrong" && !z.fixed; });
      y.depStale = y.dep.filter(function (n) { var z = steps[n - 1]; if (!z) return false; var zt = z.stale ? String(z.stale.at) : z.fixed ? String(z.fixed.at) : ""; if (!zt) return false;
        if (y.fixed && String(y.fixed.at) >= zt) return false; if (y.reAt && String(y.reAt) >= zt) return false;
        return z.stale ? true : (z.oldNums || []).some(function (m) { return numRe(m).test(digs(curText(y))); }); }); });
    /* دورِ ۲۶ (A26-31): گامی که نادرستی‌اش را خودش پذیرفت، گامِ وابسته‌اش را از آن جدا کرد (rerouted: وابستگیِ تازهٔ همان گام دیگر این را ندارد) و همهٔ گام‌های بعدی بی آن درست‌اند «کنار گذاشته» است — همچنین گامی که خودش گفت کنار گذاشته (x.drop.by = her) —
       نقطهٔ ازسرگیری و پرسشِ نوبت روی آن نمی‌نشیند. گامِ بعدی‌ای که هنوز بر آن بناست، یا هنوز درست نیست ⇒ کنار گذاشته نیست. */
    steps.forEach(function (x) { var later = steps.filter(function (y) { return y.n > x.n && !y.test; });
      if (x.drop && x.drop.by === "her") { if (okNow(x)) delete x.drop; return; }
      if (!okNow(x) && !x.stale && !x.fixed && x.her === "ok" && x.rerouted && (x.verdict === "wrong" || x.verdict === "incomplete") && later.length && later.every(function (y) { return okNow(y) && (y.dep || []).indexOf(x.n) < 0; })) x.drop = x.drop || { at: String(x.herAt || "") };
      else delete x.drop; });
    var rs = steps.filter(function (x) { return !okNow(x) && !x.wait && !x.drop; })[0], real = steps.filter(function (x) { return !x.test; }), lastQ = digs(curText(real[real.length - 1] || steps[steps.length - 1]));
    var fin = !rs && (FIN24.test(lastQ) || /(?:^|\s)(?:پس|بنابراین)\s+[^.!؟?]{0,30}=\s*-?\d/.test(lastQ) || /جواب(?:م|ش)?\s*[0-9]/.test(lastQ));
    pr.resume = rs ? rs.n : 0; pr.fin = fin; pr.ph = fin ? "b" : real.some(function (x) { return x.verdict === "ok"; }) ? "c" : "p";
    var nSt = steps.filter(function (x) { return x.stale || (x.depStale || []).length; }).length, nDr = steps.filter(function (x) { return x.drop; }).length;
    pr.sum = "کارِ پیشینِ تو: " + fa(steps.length) + " گام — " + ["ok", "incomplete", "wrong", "unchecked"].map(function (k) { var n = steps.filter(function (x) { return x.verdict === k; }).length; return n ? fa(n) + " " + VERD[k].replace(/^\S+\s/, "") : ""; }).filter(Boolean).join("، ") +
      (nSt ? " · " + fa(nSt) + " گام پس از اصلاحِ خودت باید دوباره حساب شود" : "") + (nDr ? " · " + fa(nDr) + " گام کنار گذاشته شد" : "") + (rs ? " · ازسرگیری از گامِ " + fa(rs.n) : nDr ? " · بقیه درست" : " · همه درست");
    return pr;
  }
  function priorOf(s, a, um) {
    var P = Array.isArray(a && a.prior) ? a.prior : null; if (!P || !P.length) return null;
    var H = herMsgs(s, um), steps = [], rej = 0;
    P.forEach(function (x, i) {
      if (!x || typeof x !== "object") return; var q = txt(x.quote || ""), st = clip(txt(x.step || x.what || ""), 160);
      if (!q || !H.some(function (t) { return quoteIn(q, t); })) { rej++; return; }   // نقلِ ساختگی ⇒ کنار
      var hm = H.filter(function (t) { return quoteIn(q, t); }).pop(), span = A.PRE && A.PRE.herSpan ? A.PRE.herSpan(q, hm) : q;
      var v = /^(?:ok|incomplete|wrong|unchecked)$/.test(String(x.verdict)) ? String(x.verdict) : "unchecked", why = clip(txt(x.why || ""), 220), fix = clip(txt(x.fix || ""), 220);
      /* دورِ ۲۵ (P2، a46_arith.js): حساب با زمینهٔ همهٔ پیامش (عددی که خودش گرد کرده، واحدِ هر عدد)؛ chk برای خودش (عددِ درست لو نمی‌رود — بانکِ R24 #164)، chkM برای مربی؛ کنارِ «✗» هرگز «درست» */
      var ck = ST.arithChk(span, hm), nt = ST.arithNote ? ST.arithNote(ck, v) : { bad: false, chk: "", chkM: "" }, chk = nt.chk, chkM = nt.chkM;
      if (nt.bad) v = "wrong";
      var dep = (Array.isArray(x.dep) ? x.dep : x.dep != null ? [x.dep] : []).map(function (n) { return +digs(n) || 0; }).filter(function (n) { return n > 0; });
      var cause = /^(?:prereq|knot|skill|unknown)$/.test(String(x.cause || "")) ? String(x.cause) : "";
      /* ادغامِ دورِ ۲۵ (P1 + P2): «bad» = حساب‌هایی که موتورِ a46 نادرست خواند (فقط وقتی یادداشتِ همان موتور گام را نادرست دانست) */
      var bad = nt.bad ? ck.filter(function (c) { return !c.ok; }) : [];
      steps.push({ n: steps.length + 1, step: st || clip(span, 80), quote: clip(span, 300), verdict: v, why: why, fix: fix, chk: chk, chkM: chkM, dep: dep, said: ST.arithSaid ? ST.arithSaid(ck) : ck.filter(function (c) { return !c.conv; }).map(function (c) { return c.said; }),
        bad: bad.map(function (c) { return String(c.said); }), badC: bad.map(function (c) { return { key: kNorm(c.expr), val: c.val, said: String(c.said) }; }), pageBad: bad.length > 0, test: isTestStep(span, hm, x), mn: x.n != null ? (+digs(x.n) || 0) : 0, lab: LAB27(span), cause: cause, her: "" });
    });
    if (!steps.length) return null;
    /* وابستگی: dep ِ مدل، یا عددِ **نادرستِ** همان گام (نتیجهٔ حسابی که صفحه ناهم‌خوان یافت) در نقلِ گامِ بعد — عددِ درستِ مشترک وابستگی نیست (B25·D7) */
    steps.forEach(function (x) { if (x.verdict !== "wrong") return; steps.forEach(function (y) { if (y.n <= x.n || y.dep.indexOf(x.n) >= 0) return; if (x.bad.some(function (n) { return n && numRe(n).test(digs(y.quote)) && sameUnit(unitAfter(x.quote, n), unitAfter(y.quote, n)); })) y.dep.push(x.n); }); });
    /* مرحله از حکم‌ها: همه درست و گامِ آخر جوابِ کل («پس x = 5»، «جوابم …») ⇒ بازنگری؛ گامِ درستی هست ⇒ اجرا؛ هیچ ⇒ طرح (ایده‌اش) */
    return relink({ at: String((um && um.at) || nowIso()), mid: mid(um), src: clip(nz((um && um.text) || ""), 200), steps: steps, rej: rej, st: "ask" });
  }
  ST.priorOf = priorOf;
  /* متنِ تازهٔ یک گام (اصلاحِ خودِ او، یا پیشنهادِ مدل با «آری» ِ او): حسابِ متنِ تازه را صفحه دوباره می‌سنجد؛ عددهای پیشین که دیگر در متن نیستند «کهنه» می‌شوند */
  function applyFix(x, t, at, by, v, kind) {
    var was = curText(x), ck = ST.arithChk(t), bad = [], nw = numsOf(t);
    x.v0 = x.v0 || x.verdict; x.oldNums = (x.oldNums || []).concat((x.bad || []).concat(x.said || []).map(String)).filter(function (m, i, X) { return m && X.indexOf(m) === i && nw.indexOf(String(m)) < 0; });
    x.fixed = { t: clip(t, 300), was: clip(was, 300), at: at, by: by }; if (kind) x.fixed.kind = kind; delete x.stale; delete x.say; delete x.drop;
    /* دورِ ۲۶ (U44، A26-33): متنِ تازه دلیلِ ردِ کهنه و «دوباره سنجیده شد — حکم ماند» ِ متنِ پیشین را با خود نمی‌برد — به تاریخچه می‌رود */
    if (x.re) { (x.reHist = x.reHist || []).push(Object.assign({ of: clip(was, 80) }, x.re)); delete x.re; delete x.reAt; } delete x.herWhy;
    x.said = ck.filter(function (c) { return !c.conv; }).map(function (c) { return c.said; }); x.bad = bad.map(function (c) { return String(c.said); }); x.pageBad = bad.length > 0;
    x.badC = []; x.verdict = v || "ok"; x.chk = x.chkM = ck.length && ck.every(function (c) { return c.ok; }) ? "حسابِ عددیِ متنِ تازه را صفحه سنجید: درست" : ""; delete x.retry;
    if (x.verdict === "ok") { x.her = "ok"; x.herAt = at; delete x.reAt; } else { x.her = ""; delete x.ackT; }
    return x;
  }
  /* C8 (DECISIONS_R25): اصلاحِ خودِ او فقط وقتی می‌نشیند که حسابِ خودِ صفحه — هر جا گام حساب‌پذیر است — با آن بخواند. مدل «درست» گفت و صفحه چیزِ دیگری حساب کرد ⇒
     نمی‌نشیند؛ صفحه ناهم‌خوانی را (بی عددِ درست) نشان می‌دهد و همان گام پرسیده می‌ماند */
  function tryFix(x, t, at, by, v) {
    /* دورِ ۲۶ (U18، C26-8): داورِ C8 موتورِ حسابِ صفحه است (ST.arithChk)؛ خوانندهٔ سبک فقط جایی که موتور چیزی نخواند — «درستِ موتور» با خوانشِ سبک ✗ نمی‌شود */
    var E0 = ST.arithChk(t), bad = E0.filter(function (c) { return c.ok === false; }), cs = calcs(t), nums = numsOf(t), ok = !bad.length && (E0.some(function (c) { return c.ok === true; }) || !cs.some(function (c) { return !c.ok; }));   // «نسنجیده» ِ موتور (ok نه true نه false) نه تأیید است نه رد
    if (ok && (x.badC || []).length && !x.fixed) ok = x.badC.every(function (b) { var same = cs.filter(function (c) { return c.key === b.key; }); if (same.length) return same.every(function (c) { return c.ok; });
      return nums.some(function (n) { return Math.abs(parseFloat(n) - b.val) <= tolOf(n, false) + 1e-9; }); });
    if (!ok) { x.retry = { t: clip(t, 200), at: at, page: true }; return false; }
    applyFix(x, t, at, by, v, okNow(x) ? "restate" : ""); return true;
  }
  ST.priorTryFix = tryFix;
  /* آخرین عددِ هم‌ارزِ oldN در متن ⇒ newN با همان خطِ رقم */
  function subNum(text, oldN, newN) {
    var re = /[0-9۰-۹٠-٩]+(?:[.٫][0-9۰-۹٠-٩]+)?/g, m, hitM = null, T = String(text || ""); while ((m = re.exec(T))) if (digs(m[0]) === String(oldN)) hitM = m;
    if (!hitM) return ""; var nn = /[۰-۹]/.test(hitM[0]) ? fa(String(newN)).replace(".", "٫") : String(newN);
    return T.slice(0, hitM.index) + nn + T.slice(hitM.index + hitM[0].length);
  }
  function subFrag(text, frag, fix) {
    var T = String(text || ""), f = txt(frag), i = T.indexOf(f); if (!f) return "";
    if (i < 0) { var dT = digs(T), dF = digs(f); if (dT.length === T.length) i = dT.indexOf(dF); }
    if (i >= 0 && (!/^\d/.test(digs(f)) || !/[0-9۰-۹.٫]/.test(T.charAt(i - 1) || " ")) && (!/\d$/.test(digs(f)) || !/[0-9۰-۹]/.test(T.charAt(i + f.length) || " "))) return T.slice(0, i) + txt(fix) + T.slice(i + f.length);
    var a = numsOf(f), b = numsOf(fix); return a.length === 1 && b.length === 1 && toks(f.replace(/[0-9۰-۹.٫]/g, " ")).every(function (w) { return hit(w, toks(T)); }) ? subNum(T, a[0], b[0]) : "";
  }
  /* ادغامِ گزارشِ تازه در دفتر — هرگز جایگزینی. o.open: پیام آغازِ مسئله است یا خودش آن را کارِ پیشین خواند (فقط آن‌وقت گامِ تازه افزوده می‌شود) */
  /* وابستگیِ تازهٔ یک گام: گامی که پیش‌تر پایه‌اش بود و دیگر نیست «rerouted» می‌خورد (A26-31) */
  function reDep(pr, x, dep, at) { var nd = (dep || []).filter(function (n) { return n !== x.n; }); (x.dep || []).forEach(function (n) { var z = pr.steps[n - 1]; if (z && nd.indexOf(n) < 0) z.rerouted = at; }); x.dep = nd; }
  /* دورِ ۲۷ (C56، A27-21): «گام ۳: …» در گزارشِ بعدی شمارهٔ خودِ اوست — همان گامِ دفتر، اگر دست‌کم یک واژه یا تکهٔ ریاضیِ مشترک دارد (نه گامِ تازه) */
  function LAB27(q) { var m = /^\s*گام(?:ِ|‌ِ)?\s*([0-9۰-۹]+)\s*[:：—\-–]/.exec(String(q || "")); return m ? (+digs(m[1]) || 0) : 0; }
  function near27(z, q) { var b = String(q || "").replace(/^\s*گام(?:ِ|‌ِ)?\s*[0-9۰-۹]+\s*[:：—\-–]\s*/, ""), T = [z.quote, z.fixed ? z.fixed.t : "", z.step].join(" "),
      W = toks(T.replace(/[0-9۰-۹.٫]/g, " ")).filter(function (w) { return w.length >= 3; }), M = function (x) { return (digs(x).match(/[A-Za-z0-9][A-Za-z0-9\/\^\[\]()]{2,}/g) || []); }, MT = M(T);
    return toks(b.replace(/[0-9۰-۹.٫]/g, " ")).some(function (w) { return w.length >= 3 && hit(w, W); }) || M(b).some(function (f) { return MT.indexOf(f) >= 0; }); }
  var REF27B = /(?:^|[\s‌،,])(?:(?:همون|همان)(?![آ-ی])|(?:اون|آن|همین)[\s‌]*(?:مقدار|عدد|اندازه|حاصل|جواب|نتیجه)(?:ِ|‌ی|ی)?(?![آ-ی]))/;
  function priorMerge(old, rep, o) {
    var at = rep.at, ch = [], hold = function (a, b) { var x = nz(a), y = nz(b); return !!x && !!y && (x === y || (x.length >= 8 && y.indexOf(x) >= 0) || (y.length >= 8 && x.indexOf(y) >= 0)); }, used27 = {};
    rep.steps.forEach(function (y) {
      var x = y.mn && old.steps[y.mn - 1] ? old.steps[y.mn - 1] : null;
      if (!x) x = old.steps.filter(function (z) { return nz(z.quote) === nz(y.quote) || (z.fixed && nz(z.fixed.t) === nz(y.quote)); })[0] || old.steps.filter(function (z) { return hold(z.quote, y.quote) || (z.fixed && hold(z.fixed.t, y.quote)); })[0] || null;
      if (!x && y.lab && old.steps[y.lab - 1] && !used27[y.lab] && near27(old.steps[y.lab - 1], y.quote)) x = old.steps[y.lab - 1];
      if (x) used27[x.n] = 1;
      if (!x) { if (!o.open || y.test) return; y.n = old.steps.length + 1; delete y.mn;
        /* دورِ ۲۷ب (leftovers؛ بانکِ R27 #84، C47): گامِ تازه‌ای که فقط با واژه به گامِ پیشین تکیه دارد («مساحت همون مقدارِ قبل بود …، پس سود رو هم با همون بگیر») — بی رقم،
           با واژهٔ ارجاع («همون/همان/اون مقدار/قبلی»). وابستگی: dep ِ مدل (فقط وقتی همین واژهٔ ارجاع در گام هست — مدل گزارش می‌دهد، صفحه می‌سنجد)، وگرنه تنها گامی که اسمِ
           کمیتِ پس از «همون» را دارد. گامِ تازه‌ای که به گامِ «کهنه» تکیه دارد خودش هم کهنه است — بی عددِ پیشنهادی (پرسش)، مثلِ هر وابسته */
        try { var q27 = String(y.quote || ""); if (!/[0-9۰-۹]/.test(q27) && REF27B.test(q27)) {
            if (!(y.dep || []).length) { var nn27 = toks(q27.replace(REF27B, " ")).filter(function (w) { return w.length >= 3; }), c27 = old.steps.filter(function (z) { return nn27.some(function (w) { return hit(w, toks(curText(z))); }); }); if (c27.length === 1) y.dep = [c27[0].n]; }
            var st27 = (y.dep || []).map(function (d) { return old.steps[d - 1]; }).filter(function (z) { return z && z.stale; })[0];
            if (st27) { y.stale = { frag: st27.stale.frag, fix: st27.stale.fix, at: at, nums: [], via: st27.n }; y.her = ""; } }
        } catch (e27) { }
        old.steps.push(y); ch.push({ n: y.n, k: "new" }); return; }
      var was = x.verdict, same = hold(curText(x), y.quote) || hold(x.quote, y.quote);
      if (same) {
        var flip = was !== y.verdict;
        if (x.her === "no" || flip || (y.why && y.why !== x.why) || (y.fix && y.fix !== x.fix)) {
          if (x.her === "no") { x.re = { at: at, by: "coach", was: was, to: y.verdict, why: y.why || x.why || "", her: x.herWhy || "" }; x.reAt = at; x.her = ""; }
          else if (flip && x.her === "ok") x.her = "";
          x.verdict = y.verdict; if (y.why || flip) x.why = y.why; x.fix = y.fix || (flip ? "" : x.fix); if (!x.fixed) { x.chk = y.chk; x.chkM = y.chkM; x.bad = y.bad; x.said = y.said; x.pageBad = y.pageBad; }
          if (y.cause) x.cause = y.cause; if (y.dep.length) x.dep = y.dep; if (x.verdict === "ok") delete x.stale;
          if (x.stale || (x.depStale || []).length) x.reAt = at;
          ch.push({ n: x.n, k: flip ? "flip" : "re", was: was });
        }
      } else if (y.verdict === "ok") {
        /* دورِ ۲۶: بازنویسیِ گامی که خودش درست بود «اصلاح» و اعتبارِ تازه نیست (A26-33)؛ وابستگیِ تازهٔ مدل با همان اصلاح می‌نشیند (A26-31) */
        var wasOk = okNow(x);
        /* جمله‌ای بی حساب دربارهٔ گامِ درستی که حساب دارد («۲۷۰ هزار با قبض جور درمیاد») وارسیِ اوست، نه بازنویسیِ گام — متنِ حساب‌شدهٔ گام سرِ جایش می‌ماند (pC2 p8) */
        if (wasOk && ST.arithChk(curText(x)).length && !ST.arithChk(y.quote).length && !calcs(y.quote).length) return;
        if (tryFix(x, y.quote, at, "her", "ok")) { x.fix = ""; if (y.dep.length) reDep(old, x, y.dep, at); ch.push({ n: x.n, k: wasOk ? "restate" : "fix", was: was }); }
        else ch.push({ n: x.n, k: "retry", was: was });
      }
      /* دورِ ۲۶ (U43، D26-3، C26-8): متنِ تازهٔ او که مربی هنوز «درست» ندانست —
           • حسابِ خودِ صفحه در متنِ تازه نمی‌خواند ⇒ «retry» با همان دلیل (نه «یا حکم»)؛
           • ردِ حکمِ در جریان ⇒ این دوباره‌سنجی است: متنِ گام سرِ جایش، دلیلِ او و شاهدِ مربی ثبت می‌شود؛
           • «ناقص/نسنجیده» ⇒ بازنویسیِ خودِ اوست: متنِ گام همان متنِ تازه می‌شود (با تاریخچه) و حکم و دلیلِ تازه می‌گیرد؛
           • «نادرست» ⇒ متنِ گام می‌ماند و حرفِ تازه‌اش با داوریِ مربی کنارش ثبت می‌شود (تأییدِ نادرستی یا تلاشِ دوباره — هیچ‌کدام «نمی‌خواند» نیست). */
      else if (y.pageBad) { x.retry = { t: clip(y.quote, 200), at: at, page: true, chk: y.chk }; ch.push({ n: x.n, k: "retry", was: was }); }
      else if (x.her === "no") { x.re = { at: at, by: "coach", was: was, to: y.verdict, why: y.why || x.why || "", her: x.herWhy || clip(y.quote, 160) }; x.reAt = at; x.her = ""; delete x.retry;
        if (was !== y.verdict) { x.verdict = y.verdict; if (y.why) x.why = y.why; } ch.push({ n: x.n, k: was !== y.verdict ? "flip" : "re", was: was }); }
      else if (y.verdict === "wrong") { x.say = { t: clip(y.quote, 200), at: at, v: y.verdict, why: y.why || "" }; delete x.retry; ch.push({ n: x.n, k: "say", was: was }); }
      else { applyFix(x, y.quote, at, "her", y.verdict, "rework"); x.why = y.why || ""; x.fix = y.fix || ""; x.chk = y.chk; x.chkM = y.chkM; if (y.cause) x.cause = y.cause; if (y.dep.length) reDep(old, x, y.dep, at); ch.push({ n: x.n, k: "rework", was: was }); }
    });
    if (ch.length) { old.upAt = at; old.turns = 0; if (ch.some(function (c) { return c.k !== "fix" || old.steps[c.n - 1].verdict !== "ok"; })) old.st = "ask"; relink(old); }
    return ch;
  }
  ST.priorMerge = priorMerge;
  var YES24 = /^\s*(?:آره|آری|اره|بله|بلی|درسته|درست\s*است|درست\s*میگی|درست\s*می[‌\s]?گید|باشه|قبول(?:ه)?|موافقم|اوهوم|اوکی|ok|yes)(?:[\s،,.!]+(?:درسته|درست\s*است|قبول(?:ه)?|همینه|ممنون|مرسی|باشه|اصلاحش\s*کن|بنویس))*[\s.!]*$/i;
  var NO24 = /^\s*(?:نه|نخیر|اشتباه\s*نکردم|غلط\s*نیست|قبول\s*ندارم|درست\s*نیست)/;   // قرنطینهٔ دورِ ۲۵ (REMOVAL_CANDIDATES): ردِ حکم فقط با «نه» ِ آغازِ پیام — جانشین: readReply (معنا، هر گام جدا)
  ST.R25_QUARANTINE = { NO24: NO24, CALLS25: CALLS25_R25, calcs: calcsR25 };   // دورِ ۲۶: CALLS25 و calcs ِ دورِ ۲۵ هم (REMOVAL_CANDIDATES)؛ ACC25 و UNDO25 پایین‌تر افزوده می‌شوند
  var ORDN25 = { "اول": 1, "یک": 1, "دوم": 2, "دو": 2, "سوم": 3, "سه": 3, "چهارم": 4, "چهار": 4, "پنجم": 5, "پنج": 5, "ششم": 6, "شش": 6, "هفتم": 7, "هفت": 7, "هشتم": 8, "نهم": 9, "دهم": 10 };
  var REJ25 = /قبول\s*ندار[مه]|اشتباه\s*می[‌\s]?کن(?:ی|ید)|اشتباه\s*نکرد(?:م|ه[‌\s]*ام)|غلط\s*نیست|نادرست\s*نیست|ناقص\s*نیست|چرا[^.!؟?\n]{0,40}(?:غلط|نادرست|اشتباه|ناقص|رد\s*کرد)|(?:گام(?:م|ِ?\s*[0-9۰-۹]+|ِ?\s*(?:اول|دوم|سوم|چهارم|پنجم|ششم|هفتم))?|حساب(?:م)?|جواب(?:م)?|راه(?:م)?)\s*(?:رو|را)?\s*(?:هم\s*)?(?:که\s*)?درست(?:ه|\s*است)(?![^.!؟?\n]{0,8}[؟?])/;
  var ACC25 = /قبول\s*(?:دار[مه]|کرد(?:م|ه\s*بودم))|(?:^|[\s،.…])قبول(?:ه)?(?=$|[\s،.!…])|حق\s*با\s*(?:تو|شما|توئه|شماست)|(?:راست|درست)\s*می[‌\s]?(?:گی|گید|گویی|گویید)|(?:اشتباه|غلط)\s*(?:زدم|کردم|بود|نوشتم|گرفتم|رفتم|حساب\s*کردم)|دور\s*بود/;
  var UNDO25 = /اشتباهی\s*(?:زدم|کلیک|خورد|دکمه)|دستم\s*خورد|(?:رد|«نه»)\s*(?:رو|را)?\s*پس\s*می[‌\s]?گیرم/;
  ST.R25_QUARANTINE.ACC25 = ACC25; ST.R25_QUARANTINE.UNDO25 = UNDO25;   // قرنطینهٔ دورِ ۲۶: جانشین EXA26/SAYW26 (داوری نسبت به حکمِ همان گام) و UNDO26 (پس گرفتن با معنا)
  var WHYSAY25 = /چرا\s*(?:می[‌\s]?گی|می[‌\s]?گید|می[‌\s]?گویی|گفتی|نوشتی|زدی)/;
  function stepNs(c) { var o = [], re = /گام(?:ِ|‌ِ)?\s*(?:شمارهٔ?\s*)?([0-9]+|اول|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم|نهم|دهم)/g, m, d = digs(c); while ((m = re.exec(d))) { var n = +m[1] || ORDN25[m[1]] || 0; if (n && o.indexOf(n) < 0) o.push(n); var tail = /^(?:\s*(?:و|،)\s*(?:گام(?:ِ)?\s*)?([0-9]+))+/.exec(d.slice(m.index + m[0].length)); if (tail) (tail[0].match(/[0-9]+/g) || []).forEach(function (k) { if (o.indexOf(+k) < 0) o.push(+k); }); } return o; }
  /* ---------- دورِ ۲۷ (C46، D27-2 S1): پرسشِ فرضی دربارهٔ کارِ خودش نه اعتراض است نه اصلاح ----------
     «اگه یه روز صفحه حسابِ درستِ منو غلط بخونه، از کجا بفهمم خطا از صفحه‌ست؟»، «اگه ۸ ثانیه بود چی؟»، «یعنی اینم درسته؟» — دفتر عوض نمی‌شود، مربی جواب می‌دهد.
     جمله‌ای که با شرط («اگه/اگر/فرض کن …») آغاز می‌شود و پرسش است همه‌اش کنار می‌رود؛ شرطِ بی پرسش فقط تا نخستین «،» (مقدم؛ «اگه اشتباه نکنم، گامِ ۴ غلطه» ردِ واقعی می‌ماند)؛
     جملهٔ پرسشیِ «یعنی … ؟» هم کنار می‌رود. هم‌طول: هر حرفِ کنارگذاشته فاصله می‌شود (جای متن برای خواننده‌های دیگر عوض نمی‌شود). */
  var HYPO27 = /^(?:\s|و|ولی|اما|حالا|راستی|خب|خوب|یه\s*سؤال|سؤالم\s*اینه(?:\s*که)?|[:،,])*(?:اگه|اگر|فرض\s*کن(?:یم|ید)?|فرضاً|فرضا|مثلاً\s*اگه|چی\s*می[\u200c\s]?شه\s*اگه|چه\s*می[\u200c\s]?شود\s*اگر|در\s*صورتی\s*که)(?![آ-ی])/;
  var HYPOQ27 = /^(?:\s|و|ولی|اما|حالا|[:،,])*یعنی(?![آ-ی])[^؟?]*[؟?]\s*$/;
  function hypoCut(t) {
    t = String(t || ""); var out = "", re = /[^.!؟?؛\n]*(?:[.!؟?؛\n]+|$)/g, m;
    while ((m = re.exec(t)) && m[0]) { var sn = m[0], q = /[؟?]/.test(sn);
      if (HYPO27.test(sn) && q) sn = sn.replace(/[^\n]/g, " ");
      else if (HYPOQ27.test(sn)) sn = sn.replace(/[^\n]/g, " ");
      else if (HYPO27.test(sn)) { var k = sn.search(/[،,]/); sn = k > 0 ? sn.slice(0, k + 1).replace(/[^\n]/g, " ") + sn.slice(k + 1) : sn.replace(/[^\n]/g, " "); }
      out += sn; }
    return out;
  }
  ST.hypoCut = hypoCut;
  function splitCl(t) { return String(t || "").split(/(?<=[.!؟?…])\s+|\n+|؛\s*|\s+(?=(?:ولی|اما|ولیکن)\s)/).map(txt).filter(Boolean); }
  /* خواندنِ پاسخِ او به حکم‌ها با معنا، هر گام جدا. خروجی: { yes, acts: [{ n, act: ok|no|undo, why, pair }] } — فقط خوانش؛ چیزی نمی‌نویسد */
  /* ---------- دورِ ۲۶ (Q4 «خواندنِ پاسخ به حکم‌ها»، DECISIONS_R26) ----------
     • داوریِ او دربارهٔ یک گام نسبت به حکمِ همان گام خوانده می‌شود: «گامِ ۴ به نظرم غلطه» روی حکمِ «✓ درست» ردِ حکم است و روی حکمِ «✗» پذیرفتنش؛ «گامم درسته» برعکس (D26-11، A26-32)؛
     • هر گامِ نام‌برده حالتِ خودش را می‌گیرد، حتی درونِ یک بند: «گامِ ۴ رو قبول کردم و گامِ ۳ رو نه» (D26-9)؛
     • واژه‌ای که درونِ گیومه نقل شده («اون «قبول ندارم» که گفتم …») ذکر است، نه کاربرد؛ پس گرفتنِ رد با معنا خوانده می‌شود («اشتباهی بود»، «حرفم رو پس می‌گیرم») و
       «حکمِ اولت درست بود» پذیرفتنِ همان گام است (U9)؛
     • «چرا میگی …؟» که واژه‌هایش به دو گام می‌خورد: گامِ ازسرگیری (همان که پرسیده شده)؛ اگر آن هم نبود صفحه می‌پرسد کدام گام (U8). */
  var EXR26 = /قبول(?:ش)?\s*ندار[مه]|قبول\s*نمی[‌\s]?کنم|نمی[‌\s]?پذیرم|اشتباه\s*می[‌\s]?کن(?:ی|ید)|چرا[^.!؟?\n]{0,40}(?:غلط|نادرست|اشتباه|ناقص|رد\s*کرد)/;
  var NOOBJ26 = /(?:رو|را)\s*نه(?![آ-ی‌])(?!\s*هنوز)/;   // «… و گامِ ۳ رو نه» — فقط کنارِ گامی که نام برده
  var SAYR26 = /اشتباه\s*نکرد(?:م|ه[‌\s]*ام)|غلط\s*نیست|نادرست\s*نیست|ناقص\s*نیست|اشتباه\s*نیست|(?:گام(?:م|ِ?\s*[0-9۰-۹]+|ِ?\s*(?:اول|دوم|سوم|چهارم|پنجم|ششم|هفتم))?|حساب(?:م)?|جواب(?:م)?|راه(?:م)?)\s*(?:رو|را)?\s*(?:(?:هم|که|همون|همان|به\s*نظرم)\s*){0,2}درست(?:ه|\s*است|\s*بود)(?![^.!؟?\n]{0,8}[؟?])|سرِ?\s*جاش(?:ه|\s*است)(?![آ-ی])/;
  var EXA26 = /قبول\s*(?:دار[مه]|کرد(?:م|ه\s*بودم))|(?:^|[\s،.…])(?:می[‌\s]?پذیرم|پذیرفتم)(?![آ-ی])|(?:^|[\s،.…])قبول(?:ه)?(?=$|[\s،.!…])|حق\s*با\s*(?:تو|شما|توئه|شماست)|(?:راست|درست)\s*می[‌\s]?(?:گی|گید|گویی|گویید)|حکم(?:ت|تون|ِ?\s*(?:اول|قبلی|پیشین|نخست)(?:ت|ِ?\s*تو)?|ِ?\s*تو)\s*(?:هم\s*)?درست\s*(?:بود|است|ه(?![آ-ی]))/;
  var SAYW26 = /(?:اشتباه|غلط)\s*(?:زدم|کردم|بود|نوشتم|گرفتم|رفتم|حساب\s*کردم)|دور\s*بود/;
  var SAYWN26 = /گام[^.!؟?\n]{0,24}?(?:غلط|نادرست|اشتباه)(?:ه|ـه|ست|\s*است)(?![آ-ی])|گام[^.!؟?\n]{0,24}?درست\s*نیست|گام[^.!؟?\n]{0,30}?(?:می[‌\s]?لنگه|ایراد\s*دار(?:ه|د)|مشکل\s*دار(?:ه|د))/;   // داوریِ حال دربارهٔ گامی که نام برده («گامِ ۴ به نظرم غلطه»، «گامِ اول یه جاش می‌لنگه»)
  var PASTN26 = /وقتی|حس\s*کردم|فکر\s*(?:می[‌\s]?)?کردم|(?:اون|آن)\s*موقع|قبلاً|قبلا/;   // … نه خاطره («وقتی گامِ ۴ رو نوشتم حس کردم یه جاش می‌لنگه»)
  var MINE26 = /خودم|من\s*هم|(?:حل(?:ش)?|حساب(?:ش)?(?:\s*(?:رو|را))?)\s*کرد(?:م|ه\s*بودم)(?![آ-ی])|نوشت(?:م|ه\s*بودم)(?![آ-ی])|(?:^|\s)رفتم(?![آ-ی])|کارِ?\s*من(?![آ-ی])/;
  /* «گامِ ۴ رو کلاً گذاشتم کنار» — خودش گام را بی‌نیاز کرد (نگه داشتن برای بعد کنار گذاشتن نیست) */
  var DROP26 = /(?:گذاشتم(?:ش)?\s*کنار|کنار(?:ش)?\s*گذاشتم|کنار\s*می[‌\s]?(?:ذارم|گذارم)(?:ش)?|حذف(?:ش)?\s*(?:کردم|می[‌\s]?کنم)|بی[‌\s]?خیال(?:ش|ِ)?[^.!؟?\n]{0,12}شدم|دیگه?\s*لازم(?:ش)?\s*(?:نیست|ندارم))/;
  /* کارِ کسِ دیگر («همکارم این‌طوری حساب کرده بود: …») کارِ پیشینِ خودش نیست */
  /* دورِ ۲۷ (C57 سمتِ دفتر): «داداشم حساب کرد …»، «معلممون گفت ۲ × ۳۶ = ۷۲» — حسابِ کسِ دیگر کارِ پیشینِ او نیست (داداش/آبجی/… و «گفت» افزوده شد) */
  var OTHER26 = /(?:همکار|دوست|رفیق|معلم|استاد|برادر|داداش|آبجی|خواهر|عمو|دایی|خاله|عمه|شریک|رئیس|پدر|بابا|مادر|مامان|هم[‌\s]?کلاسی|هم[‌\s]?اتاقی|شوهر|خانم|همسر|پسر|دختر|بچه|مشاور|فروشنده)(?:م|ِ?\s*من|مون|مان|ش|ه)?\s[^.!؟?\n]{0,30}(?:حساب(?:ش)?\s*(?:رو|را)?\s*کرد(?:ه(?:\s*بود)?)?|حل(?:ش)?\s*کرد(?:ه(?:\s*بود)?)?|نوشت(?:ه(?:\s*بود)?)?|رفت(?:ه(?:\s*بود)?)?|گفت(?:ه(?:\s*بود)?)?)(?![‌\s]*ام)(?![آ-ی])/;
  var UNDO26 = /اشتباهی\s*(?:زدم|کلیک|خورد|دکمه|گفتم|بود|نوشتم|رد\s*کردم)|دستم\s*خورد|(?:رد|«نه»|حرفم|حرفمو|«قبول\s*ندارم»)\s*(?:رو|را)?\s*پس\s*می[‌\s]?گیرم/;
  var STEPW26 = /گام(?:ِ|‌ِ)?\s*(?:شمارهٔ?\s*)?(?:[0-9۰-۹]+|اول|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم|نهم|دهم)/g;
  function stepSegs(c) { var ix = [], m; STEPW26.lastIndex = 0; while ((m = STEPW26.exec(c))) ix.push(m.index); if (ix.length < 2) return [c]; return ix.map(function (k, i) { return c.slice(i ? k : 0, i + 1 < ix.length ? ix[i + 1] : c.length); }); }
  function noQuote(c) { return String(c || "").replace(/«[^»]*»/g, " "); }
  /* ردی که هنوز پس گرفته نشده: «نه» ِ در جریان، یا آخرین ردِ تاریخچه که undo نخورده */
  function openNo(x) { if (!x) return null; if (x.her === "no") return { noAt: String(x.herAt || "") }; var H = x.herHist || [], e = null; H.forEach(function (h) { if (h.noAt) e = h; else if (h.undoAt) e = null; }); return e && !e.undone ? e : null; }
  /* خواندنِ پاسخِ او به حکم‌ها با معنا، هر گام جدا. خروجی: { yes, acts: [{ n, act: ok|no|undo|undo-ok, why, pair }], which?: [n…], again? } — فقط خوانش؛ چیزی نمی‌نویسد */
  function readReply(pr, ut, o) {
    var t = hypoCut(ut), R = { yes: false, acts: [] }; if (!pr || !t.trim() || /^\s*\[/.test(t)) return R;
    if (YES24.test(t)) { R.yes = true; return R; }
    var S0 = pr.steps, pend = S0.filter(function (x) { return x.her === "no" && !x.reAt; })[0], rs = pr.resume ? S0[pr.resume - 1] : null, CL = splitCl(t), lastNs = [];
    var isOk = function (n) { var x = S0[n - 1]; return !!x && x.verdict === "ok" && !x.stale; };
    var put = function (n, act, why, pair) { var x = S0[n - 1]; if (!x) return; var e = R.acts.filter(function (a) { return a.n === n; })[0];
      if (e) { if (e.act === "undo" && act === "ok") e.act = "undo-ok"; return; } R.acts.push({ n: n, act: act, why: why || "", pair: pair || null }); };
    if (/^\s*(?:نه|نخیر)[\s.!،]*$/.test(t)) { if (o && o.first && pr.st === "ask" && rs && rs.verdict !== "ok") put(rs.n, "no", ""); return R; }
    CL.forEach(function (c, ci) {
      var SG = stepSegs(c), P = SG.map(function (g) { var u = noQuote(g), q = /[؟?]/.test(g);
        return (DROP26.test(u) && stepNs(g).length > 0 && !q) ? "drop" : EXR26.test(u) || (NOOBJ26.test(u) && stepNs(g).length > 0) ? "no" : SAYR26.test(u) ? "right" : (EXA26.test(u) && !(q && !/قبول/.test(u)) && !/کجا/.test(u)) ? "ok" : (SAYW26.test(u) && !q && !/کجا/.test(u)) ? "wrong" : (SAYWN26.test(u) && !PASTN26.test(u) && !q && stepNs(g).length) ? "wrong" : ""; });
      var UN = SG.map(function (g) { return UNDO26.test(g); });
      /* بندی که خودش قطبی ندارد، قطبِ بندِ بعدی (وگرنه پیشین) را می‌گیرد: «گامِ ۳ و گامِ ۴ رو قبول دارم» */
      P = P.map(function (p0, i) { if (p0) return p0; for (var j = i + 1; j < P.length; j++) if (P[j]) return P[j]; for (var k = i - 1; k >= 0; k--) if (P[k]) return P[k]; return ""; });
      SG.forEach(function (g, gi) {
        var ns = stepNs(g), q = /[؟?]/.test(c), pol = P[gi], u = noQuote(g), und = UN[gi];
        if (!pol && WHYSAY25.test(c)) {   // «چرا میگی …؟» ردِ حکمی است که واژه‌های دلیلش را نام می‌برد
          var cw = toks(c).filter(function (w) { return !/^(?:چرا|میگی|می|گی|گفتی|نوشتی|زدی)$/.test(w); }), best = null, bn = 0, tied = [];
          S0.forEach(function (x) { if (x.verdict === "ok") return; var W = toks([x.why, x.step].join(" ")), n0 = cw.filter(function (w) { return hit(w, W); }).length; if (n0 > bn) { bn = n0; best = x; tied = [x.n]; } else if (n0 && n0 === bn) tied.push(x.n); });
          if (best && tied.length === 1) { ns = [best.n]; pol = "no"; }
          else if (ns.length) pol = "no";
          else if (tied.length > 1) { if (rs && tied.indexOf(rs.n) >= 0) { ns = [rs.n]; pol = "no"; } else { R.which = tied.slice(); return; } }
        }
        /* دورِ ۲۷ (D26-11، بانکِ R27 #162): ردِ به معنا — «ولی پدر و مادرم رو تو همون «فاصله» حساب کرده بودم» می‌گوید آنچه دلیلِ حکم کم‌دار می‌خواند در گامش هست:
           بندِ «ولی/اما» با فعلِ «حساب/لحاظ/در نظر … کرده بودم» که واژه‌ای از دلیلِ حکمِ دقیقاً یک گامِ «نه درست» را نام می‌برد ⇒ ردِ همان گام (بی واژهٔ «اشتباه») */
        if (!pol && !q && /^\s*(?:ولی|اما|ولیکن)\s/.test(c) && /(?:حساب|لحاظ|در\s*نظر|آورده|گذاشته)\s*(?:کرده|گرفته)?\s*(?:بودم|ام|‌ام)|حساب(?:شون|ش)?\s*کردم/.test(c)) {
          var cw27 = toks(noQuote(c).replace(/[«»]/g, " ")).concat(toks((c.match(/«([^»]*)»/g) || []).join(" ").replace(/[«»]/g, " "))).filter(function (w) { return w.length >= 3; }), hit27 = S0.filter(function (x) { return x.verdict !== "ok" && x.why && cw27.some(function (w) { return hit(w, toks(x.why).filter(function (z) { return z.length >= 3; })); }); });
          if (hit27.length === 1) { ns = [hit27[0].n]; pol = "no"; } }
        if (!pol && /(?:من\s*)?درست\s*می[‌\s]?گم|حق\s*با\s*منه/.test(u)) { var rx = S0.filter(function (x) { return x.re && x.verdict !== "ok"; }).pop(); if (rx) R.again = rx.n; return; }
        if (!pol && !und) return;
        if (!ns.length) {
          var tg = null;
          if (und) { var cand = (lastNs.length ? lastNs.map(function (n) { return S0[n - 1]; }) : S0).filter(function (x) { return x && openNo(x); });
            /* بی نامِ گام و بی اشاره به «رد/حرفم»: فقط ردی که هنوز تازه است (در جریان، یا دوباره‌سنجی‌اش آخرین رویدادِ دفتر است) — «اشتباهی گفتم ۲ هکتار» اصلاحِ داده است، نه پس گرفتنِ رد */
            if (!lastNs.length && !/رد|«نه»|«قبول\s*ندارم»|حرفم|حکم/.test(c)) cand = cand.filter(function (x) { return x.her === "no" || (x.reAt && String(x.reAt) >= String(pr.upAt || pr.at || "")); });
            tg = cand.sort(function (a1, b1) { return String(openNo(a1).noAt) < String(openNo(b1).noAt) ? -1 : 1; }).pop() || null; }
          else if (pol === "ok" && lastNs.length && /حکم/.test(u)) { lastNs.forEach(function (n) { put(n, "ok", "", null); }); return; }   // «حکمِ اولت درست بود» دربارهٔ همان گامی است که بندِ پیشین نام برد
          else if (pol === "right" || pol === "wrong") tg = pend || (rs && rs.verdict !== "ok" ? rs : null);
          else tg = pend || (rs && rs.verdict !== "ok" ? rs : null);
          if (!tg) return; ns = [tg.n];
        }
        lastNs = ns.slice();
        ns.forEach(function (n) {
          var act = pol === "right" ? (isOk(n) ? "ok" : "no") : pol === "wrong" ? (isOk(n) ? "no" : "ok") : pol, why = "", pair = null, x7 = S0[n - 1];
          /* پس گرفتن: فقط ردِ خودش پس‌گرفتنی است. ردی باز است ⇒ undo (با «حکمت درست بود» ⇒ undo-ok)؛ ردی نیست و آنچه پس می‌گیرد پذیرفتن بود ⇒ ردِ تازه (بانکِ R26 #122) */
          if (und) { if (x7 && openNo(x7) && act !== "no") act = act === "ok" ? "undo-ok" : "undo"; else if (act !== "no" && act !== "ok") act = ""; }
          else if (act === "ok" && x7 && x7.her === "no") act = "undo-ok";   // پذیرفتن پس از ردِ خودش = پس گرفتنِ همان رد («نه نه اشتباه زدم، گامِ ۱ همون درست بود»)
          if (!act) return;
          if (act === "no") { var m = /(?:چون|زیرا|چرا\s*که|به\s*خاطرِ?|برای\s*این[‌\s]*که)\s*(.+)/.exec(c); why = m ? clip(c.slice(m.index), 240) : "";
            if (!why) { var rest = CL.filter(function (y, j) { return j !== ci && !stepNs(y).some(function (k) { return ns.indexOf(k) < 0; }) && !EXA26.test(noQuote(y)) && !SAYW26.test(noQuote(y)); }).join(" "), own = (SG.length > 1 ? g : c).replace(/^\s*(?:نه|نخیر)[،,\s]*/, "");
              var body = txt([toks(own.replace(EXR26, " ").replace(SAYR26, " ").replace(SAYWN26, " ").replace(/گام(?:ِ|‌ِ)?\s*\S+/g, " ")).length >= 3 ? own : "", rest].join(" ")); if (toks(body).length >= 2) why = clip(body, 240); } }
          if (act === "ok") { var pm = /(\d+(?:\.\d+)?)[^0-9]{0,24}[،,]?\s*نه\s+(\d+(?:\.\d+)?)/.exec(digs(c)); if (pm && pm[1] !== pm[2]) pair = { nw: pm[1], old: pm[2] }; }
          put(n, act, why, pair);
        });
      });
    });
    return R;
  }
  ST.priorRead = readReply;
  /* ردِ حکمی که حسابِ خودِ صفحه پشتش است همان لحظه دوباره حساب می‌شود (گفت‌وگو و دکمهٔ 🔭 یکی): حکمِ «نادرست» ِ صفحه، و — دورِ ۲۶ (D26-11) — حکمِ «درست» ی که حسابش را صفحه خوانده */
  function pageRe(x, at, why) {
    var ck = ST.arithChk(curText(x)), bad = ck.filter(function (c) { return c.ok === false; });
    if (x.pageBad) { x.re = { at: at, by: "page", was: x.verdict, to: bad.length ? "wrong" : x.verdict, why: bad.length ? x.chk : "", her: why || "" }; if (bad.length) x.reAt = at; }
    else if (x.verdict === "ok" && ck.length && ck.every(function (c) { return c.ok === true; })) { x.re = { at: at, by: "page", was: "ok", to: "ok", why: "حسابِ صفحه همان را می‌خواند: " + ck.map(function (c) { return "«" + fa(String(c.expr)) + " = " + fa(String(c.said)) + "»"; }).join("، "), her: why || "" }; x.reAt = at; }
  }
  function ledger(s, key, pid) {
    var pg = pid ? S.get("eprog_" + pid) : null, L = pg && pg.solve && pg.solve.live, E = storyOf(s || {}, key);
    if (L) { if (!L.prior) { var p0 = E.prior || ST.priorFor(null, pid); if (p0) L.prior = JSON.parse(JSON.stringify(p0)); } return { pr: L.prior || null, pg: pg, L: L, E: E }; }
    return { pr: E.prior || null, pg: null, L: null, E: E };
  }
  /* پاسخِ «درست است؟»: «آره» ِ تنها ⇒ همهٔ حکم‌ها پذیرفته و گامِ نادرستی که پیشنهادِ اصلاح دارد با تاریخچه نوشته می‌شود — پیش از آری هیچ؛
     وگرنه هر گام حالتِ خودش: پذیرفتن (با «X، نه Y» ِ خودش ⇒ اصلاحِ همان گام)، رد (دلیلش نگه داشته می‌شود؛ حسابِ صفحه همان لحظه دوباره سنجیده می‌شود)، پس گرفتنِ «نه» */
  function priorReply(s, key, pid, ut, um) {
    var G = ledger(s, key, pid), pr = G.pr; if (!pr) return [];
    var at = String((um && um.at) || nowIso()), base = String(pr.upAt || pr.at), ch = [];
    if (at > base) pr.turns = (pr.turns || 0) + 1;
    pr.steps.forEach(function (x) { if (x.her === "no" && !x.reAt && String(x.herAt || "") < at) x.turns = (x.turns || 0) + 1; if (x.her === "ok" && !okNow(x) && String(x.herAt || "") < at) x.ackT = (x.ackT || 0) + 1; });
    var R = readReply(pr, ut, { first: (pr.turns || 0) <= 1 });
    if (R.yes) { if (pr.st === "ask" && at > base) {
      pr.steps.forEach(function (x) { if (x.her === "no" && !x.reAt) return; x.her = "ok"; x.herAt = at; if (x.verdict !== "ok" && x.fix && !x.fixed) { var w0 = x.verdict; applyFix(x, x.fix, at, "yes"); x.fix = ""; ch.push({ n: x.n, k: "fix", was: w0 }); } });
      pr.st = "ok"; relink(pr); } }
    else R.acts.forEach(function (a) { var x = pr.steps[a.n - 1]; if (!x) return;
      if (/^undo/.test(a.act)) {
        /* دورِ ۲۶ (U9، C5 برای حکم‌ها): پس گرفتنِ رد حالتِ پیش از رد را با تاریخچه برمی‌گرداند — حتی اگر در این میان دوباره‌سنجی حکم را عوض کرده باشد */
        var on = openNo(x); if (!on && a.act !== "undo-ok") return;
        var H = x.herHist = x.herHist || [], e0 = null; H.forEach(function (h) { if (h.noAt && !h.undone) e0 = h; });
        var back = false; if (e0 && x.re && x.re.by === "coach" && String(x.re.at) >= String(e0.noAt) && e0.v && e0.v !== x.verdict && !x.fixed) { x.verdict = e0.v; x.why = e0.why || ""; back = true; }
        if (x.re) { (x.reHist = x.reHist || []).push(Object.assign({ undone: at }, x.re)); delete x.re; } delete x.reAt;
        if (e0) e0.undone = at;
        H.push({ her: "no", at: e0 ? e0.noAt : (x.herAt || ""), undoAt: at, back: back });
        x.her = a.act === "undo-ok" ? "ok" : (e0 && e0.her) || ""; x.herAt = at; delete x.herWhy; delete x.turns; x.ackT = 1; ch.push({ n: x.n, k: "undo" }); return; }
      /* دورِ ۲۶ (A26-31، بانکِ R26 #113): گامی که خودش کنار گذاشت — با تاریخچه؛ نقطهٔ ازسرگیری دیگر روی آن نمی‌نشیند */
      if (a.act === "drop") { if (!okNow(x) && !(x.drop && x.drop.by === "her")) { x.drop = { at: at, by: "her", t: clip(nz(ut), 120) }; ch.push({ n: x.n, k: "drop" }); } return; }
      if (a.act === "ok") { if (x.her !== "ok") { x.her = "ok"; x.herAt = at; delete x.herWhy; delete x.turns; x.ackT = 0; ch.push({ n: x.n, k: "ack" }); }
        if (a.pair && !okNow(x)) { var nt = subNum(curText(x), a.pair.old, a.pair.nw); if (nt) { var w1 = x.verdict; ch.push({ n: x.n, k: tryFix(x, nt, at, "her") ? "fix" : "retry", was: w1 }); } }
        else if (!okNow(x) && x.fix && !x.fixed && stepNs(String(ut)).indexOf(x.n) >= 0) { var w2 = x.verdict; applyFix(x, x.fix, at, "yes"); x.fix = ""; ch.push({ n: x.n, k: "fix", was: w2 }); }   // «گامِ n را قبول دارم» = «آری» ِ او به پیشنهادِ همان گام
        return; }
      if (x.re && x.reAt && !a.why) return;   // پس از دوباره‌سنجی، تکرارِ بی‌دلیل ردِ تازه نیست (بانکِ R25)
      /* دورِ ۲۶ (D26-11، A26-32): حکمِ «✓ درست» هم ردشدنی است — همان دوباره‌سنجی، همان «رد کردی»، همان راهِ پس گرفتن. (دورِ ۲۵: «حکمِ درست را رد نمی‌کند» — جایگزین شد) */
      (x.herHist = x.herHist || []).push({ her: x.her || "", at: x.herAt || "", noAt: at, v: x.verdict, why: x.why || "" }); x.her = "no"; x.herAt = at; x.turns = 0; delete x.reAt; if (x.re) { (x.reHist = x.reHist || []).push(x.re); delete x.re; } if (a.why) x.herWhy = a.why; else delete x.herWhy; pr.st = "no"; ch.push({ n: x.n, k: "no" });
      /* حکمی که حسابِ خودِ صفحه پشتش است همین حالا دوباره حساب می‌شود — نتیجه با شاهد روی صفحه: حکمِ «نادرست» ِ صفحه، و حکمِ «درست» ی که حسابش را صفحه خوانده */
      pageRe(x, at, a.why || ""); });
    if (ch.length) { relink(pr); pr.upAt2 = at; }
    if (G.pg) S.put(G.pg);
    return ch;
  }
  ST.priorReply = priorReply;
  /* اصلاحِ خودِ او که صفحه خودش می‌تواند بخواند و بسنجد (بی گزارشِ مدل): (۱) بندی که گام را نام می‌برد و حسابِ درستی دارد؛ (۲) «X، نه Y» که Y عددِ نادرستِ یک گام است؛
     (۳) همان حسابِ گام با نتیجهٔ درست؛ (۴) گامِ وابسته که با عددِ تازه دوباره نوشته شده. هر کدام فقط با همان سنجشِ C8. */
  function pageFix(pr, ut, at) {
    var ch = [], t = hypoCut(ut), done = {}, fx = function (x, nt, k) { if (!nt || done[x.n] || okNow(x)) return; var w = x.verdict; var ok = tryFix(x, nt, at, "her"); done[x.n] = 1; ch.push({ n: x.n, k: ok ? "fix" : "retry", was: w }); if (ok) relink(pr); };
    var newOf = function (x, c) { var b = (x.badC || []).filter(function (b0) { return b0.key === c.key; })[0]; return b ? subNum(curText(x), b.said, c.said) : ""; };
    splitCl(t).forEach(function (c) { var ns = stepNs(c); if (!ns.length || REJ25.test(c)) return; var C = calcs(c).filter(function (k) { return k.ok; });
      /* دورِ ۲۶ (بانکِ R26 #112): «گامِ ۲ رو درست کردم شد ۲۸» — بندی که گام را نام می‌برد و همان مقدارِ حسابِ صفحه را می‌گوید (بی نوشتنِ خودِ حساب) */
      if (!C.length) { if (ns.length === 1 && /درست(?:ش)?\s*کردم|اصلاح(?:ش)?\s*کردم|عوض(?:ش)?\s*کردم/.test(c)) { var xv = pr.steps[ns[0] - 1], B1 = xv && !okNow(xv) ? (xv.badC || []) : [];
          if (B1.length === 1) { var nv = numsOf(c.replace(STEPW26, " ")).filter(function (n) { return Math.abs(parseFloat(n) - B1[0].val) <= tolOf(n, false) + 1e-9; })[0]; if (nv) fx(xv, subNum(curText(xv), B1[0].said, nv)); } } return; }
      ns.forEach(function (n) { var x = pr.steps[n - 1]; if (!x || okNow(x)) return; var nt = ""; C.some(function (k) { nt = newOf(x, k); return !!nt; }); fx(x, nt || c.replace(/^[^:：]{0,40}(?:درست|اصلاح)\s*(?:ش\s*)?کردم\s*[:：]\s*/, "")); }); });
    /* دورِ ۲۷ (بانکِ R27 #165): «درستش ۳۰ دقیقه‌ست» بی نامِ گام — فقط اگر دقیقاً یک گامِ نادرست مقدارِ دقیقِ صفحه‌اش همین عدد است (C8)؛ عددِ دیگر («۲۵») هیچ */
    splitCl(t).forEach(function (c) { if (stepNs(c).length || !/(?:^|\s)درست(?:ش|ه|ِش)?\s*(?:اینه\s*[:：]?\s*)?[0-9۰-۹]/.test(c)) return; var N = numsOf(c);
      var cand = pr.steps.filter(function (x) { return !okNow(x) && (x.badC || []).length === 1 && N.some(function (n) { return Math.abs(parseFloat(n) - x.badC[0].val) <= tolOf(n, false) + 1e-9; }); });
      if (cand.length === 1) { var xb = cand[0], nv = N.filter(function (n) { return Math.abs(parseFloat(n) - xb.badC[0].val) <= tolOf(n, false) + 1e-9; })[0]; fx(xb, subNum(curText(xb), xb.badC[0].said, nv)); } });
    var pm, pre = /(\d+(?:\.\d+)?)[^0-9]{0,24}[،,]?\s*نه\s+(\d+(?:\.\d+)?)/g, d = digs(t);
    while ((pm = pre.exec(d))) { if (pm[1] === pm[2]) continue; var cand = pr.steps.filter(function (x) { return !okNow(x) && (x.bad || []).indexOf(pm[2]) >= 0; }); if (cand.length === 1) fx(cand[0], subNum(curText(cand[0]), pm[2], pm[1])); }
    calcs(t).filter(function (k) { return k.ok; }).forEach(function (k) { pr.steps.forEach(function (x) { if (!okNow(x) && (x.badC || []).some(function (b) { return b.key === k.key; })) fx(x, newOf(x, k)); }); });
    /* گامِ وابسته: همان حسابِ خودش با عددِ تازهٔ گامِ اصلاح‌شده، در همین پیام */
    for (var guard = 0; guard < pr.steps.length; guard++) { var moved = false;
      pr.steps.forEach(function (y) { if (done[y.n] || !(y.depStale || []).length) return; var z = pr.steps[y.depStale[0] - 1]; if (!z || !z.fixed) return;
        var nw = numsOf(z.fixed.t).filter(function (m) { return numsOf(z.fixed.was).indexOf(m) < 0; }), keys = [];
        calcs(curText(y)).forEach(function (k) { (z.oldNums || []).forEach(function (o) { nw.forEach(function (m) { var kk = ("#" + k.key + "#").replace(new RegExp("([^0-9.])" + String(o).replace(".", "\\.") + "(?=[^0-9.])", "g"), "$1" + m).slice(1, -1); if (kk !== k.key) keys.push(kk); }); }); });
        var st = sentences(t).filter(function (se) { return calcs(se).some(function (k) { return k.ok && keys.indexOf(k.key) >= 0; }); })[0];
        if (st) { fx(y, st); moved = true; }
        /* دورِ ۲۶ (بانکِ R26 #112): همان حسابِ گامِ وابسته با عددِ تازه ولی نتیجهٔ نادرست ⇒ گام درست نمی‌شود و صفحه همین را می‌گوید (retry با دلیلِ حساب) */
        else { var sb = sentences(t).filter(function (se) { return calcs(se).some(function (k) { return !k.ok && keys.indexOf(k.key) >= 0; }); })[0];
          if (sb && !done[y.n]) { done[y.n] = 1; var nb = ""; try { nb = ST.arithNote ? (ST.arithNote(ST.arithChk(sb), "wrong").chk || "") : ""; } catch (e) { nb = ""; } y.retry = { t: clip(sb, 200), at: at, page: true, chk: nb }; ch.push({ n: y.n, k: "retry", was: y.verdict }); } } });
      if (!moved) break; }
    return ch;
  }
  ST.priorPageFix = pageFix;
  /* گامِ منتظرِ برگهٔ قلمرو (a44 sys) در دفتر می‌ماند و «منتظر» نام می‌گیرد — نقطهٔ ازسرگیری از آن می‌گذرد */
  function markWait(s, pid, pr) {
    if (!pr) return pr; var W = []; try { if (A.PRE && A.PRE.sysAll) W = A.PRE.sysAll().filter(function (o) { return o.e && o.e.state === "wait" && (pid ? o.sc && o.sc.pid === pid : o.sc && s && o.sc.sess === s.id); }).map(function (o) { return o.e; }); } catch (e) { W = []; }
    var dirty = false; pr.steps.forEach(function (x) { var w = W.filter(function (e) { var st = String(e.step || ""); return stepNs(st).indexOf(x.n) >= 0 || new RegExp("^\\s*[(（]?\\s*" + x.n + "\\s*[)）.:：\\-–—]").test(digs(st)) || (nz(st).length >= 8 && (nz(x.quote).indexOf(nz(st)) >= 0 || nz(st).indexOf(nz(x.step)) >= 0 && nz(x.step).length >= 6)); })[0];
      var nwv = w ? { sheet: w.number || "" } : null; if (JSON.stringify(x.wait || null) !== JSON.stringify(nwv)) { dirty = true; if (nwv) x.wait = nwv; else delete x.wait; } });
    if (dirty) relink(pr); return pr;
  }
  ST.priorMarkWait = markWait;
  /* سطرهای دفتر. coach = true فقط برای پرامپت (chkM با مقدار و «لو نده»)؛ صفحه، 🧭 و 📜 سطرِ خودِ او را می‌گیرند (chk) — B25·D6، D25-3 */
  var STUCKL27 = /(?:^|[\s،,.:])گیر(?:ِ|\u200cِ)?\s*(?:من|اصلی|دقیق\S*|کار)(?![آ-ی])|(?:^|[\s،,.:])(?:گیر\s*(?:کردم|کرده[\u200c\s]?ام|افتادم)|گیرم)(?![آ-ی])/;
  function stepLine(x, coach, w) {
    var ck = coach ? (x.chkM || x.chk) : x.chk, by = x.fixed ? (x.fixed.by === "yes" ? "با «آری» ِ خودش" : "به دستِ خودش") : "";
    /* دورِ ۲۷b (history، D27-15، بانکِ R27 #168): جملهٔ گیرِ خودش («گیرِ من اینجاست که …») در 📜 ِ او «گیر» است، نه «گامِ N» (و هرگز «حدس») — پرامپتِ مربی همان «گامِ N» را می‌بیند */
    return (!coach && STUCKL27.test(String(x.quote || "")) ? "گیر (گامِ " + fa(x.n) + ")" : "گامِ " + fa(x.n)) + " · " + VERD[x.verdict] + (x.test ? " (آزمون، نه برهان)" : "") + ": «" + clip(x.fixed ? x.fixed.t : x.quote, w || 90) + "»" + (x.fixed ? " (" + (x.fixed.kind === "rework" ? "بازنویسیِ خودش — هنوز «درست» نیست" : x.fixed.kind === "restate" ? "بازنویسی شد" : "اصلاح شد") + " ⇐ «" + clip(x.fixed.was, 60) + "»، " + by + ")" : "") +
      (x.stale ? " · ⟳ کهنه: «" + clip(x.stale.frag, 30) + "» را خودش به «" + clip(x.stale.fix, 30) + "» اصلاح کرد — این گام باید دوباره حساب شود" : "") + (x.why && !(x.fixed && x.verdict === "ok") ? " — " + x.why : "") + (ck ? " (" + ck + ")" : "") +
      (x.fix && !x.fixed ? " · پیشنهاد (بی «آری» ِ تو بازنویسی نمی‌شود): " + x.fix : "") + ((x.depWrong || []).length ? " · وابسته به گامِ " + x.depWrong.map(fa).join("، ") : "") +
      ((x.depStale || []).length ? " · وابسته به گامِ " + x.depStale.map(fa).join("، ") + " که اصلاح شد — با عددِ تازه دوباره حساب شود" : "") +
      (x.re ? " · دوباره سنجیده شد (" + (x.re.by === "page" ? "حسابِ صفحه" : "مربی") + "): " + (x.re.was === x.re.to ? "حکم ماند" : "حکم عوض شد: " + VERD[x.re.was] + " ⇐ " + VERD[x.re.to]) + (x.re.why ? " — " + clip(x.re.why, 120) : "") : "") +
      /* دورِ ۲۶ (U43): «retry» فقط وقتی حسابِ خودِ صفحه در متنِ تازه نمی‌خواند — و همین را می‌گوید */
      (x.retry && !(x.fixed && String(x.fixed.at) >= String(x.retry.at)) ? " · حسابِ متنِ تازه‌ات («" + clip(x.retry.t, 60) + "») با حسابِ صفحه نمی‌خواند" + (x.retry.chk ? " (" + x.retry.chk + ")" : "") + " — گام همان می‌ماند" : "") +
      (x.say ? " · حرفِ تازه‌ات دربارهٔ این گام («" + clip(x.say.t, 70) + "») — داوریِ مربی: " + VERD[x.say.v] + " می‌ماند" + (x.say.why ? " — " + clip(x.say.why, 120) : "") : "") +
      (x.drop ? (x.drop.by === "her" ? " · کنار گذاشته شد — به گفتهٔ خودت" + (x.drop.t ? " («" + clip(x.drop.t, 70) + "»)" : "") : " · کنار گذاشته شد — نادرستی‌اش را پذیرفتی و گام‌های بعدی‌ات دیگر بر آن بنا نیست") : "") + (x.wait ? " · ⏸ منتظرِ برگهٔ " + (x.wait.sheet ? "#" + fa(x.wait.sheet) : "محلی") : "") +
      ((x.herHist || []).some(function (e) { return e.undoAt; }) ? " · رد ⇒ پس گرفته شد" + ((x.herHist || []).some(function (e) { return e.undoAt && e.back; }) ? " (حکمِ پیش از رد برگشت)" : "") : "") +
      (x.her === "ok" ? " · تأییدِ تو ✓" : x.her === "no" ? (x.reAt ? " · حکم را رد کردی" : " · حکم را رد کردی — دوباره سنجیده می‌شود") : "");
  }
  function priorLines(pr, coach) {
    if (!pr) return []; return [pr.sum].concat(pr.steps.map(function (x) { return stepLine(x, coach); })).concat(pr.rej ? ["(" + fa(pr.rej) + " نقل در حرف‌هایت پیدا نشد و کنار رفت)"] : []);
  }
  ST.priorLines = priorLines;
  /* پرسشِ نوبت از نقطهٔ ازسرگیری — گامِ درست هرگز؛ حکمِ ردشده ⇒ دلیلش */
  /* دورِ ۲۷ (C27-21، C27-24؛ بانکِ R27 #168، #169): دلیلِ حکمِ یک گام از لحظهٔ داوری است — بندی از آن که (۱) بر گامی دیگر تکیه دارد که از آن پس درست شد
     («بر ۱۳۶۰ واتِ ناقصِ گامِ ۲ بنا شده» پس از اصلاحِ گامِ ۲)، یا (۲) «هنوز …» ِ تکه‌ای را می‌گوید که گامِ ✓ ِ بعدی آورده («افتِ فشار هنوز حساب نشده» پس از گامِ «افتِ فشار … ۱۲ متر») —
     در پرسشِ نوبت نمی‌آید (در تاریخچه و 📜 می‌ماند). */
  function whyNow27(pr, x) {
    var w = String((x && x.why) || ""); if (!w) return "";
    var parts = w.split(/\s*[؛،,]\s*|\s+و\s+/).filter(Boolean), S0 = pr.steps;
    var keep = parts.filter(function (c) {
      var named = (c.match(/گام(?:ِ|‌ِ)?\s*([0-9۰-۹]+)/g) || []).map(function (g) { return +digs(g).replace(/\D/g, "") || 0; });
      if (named.some(function (n) { var z = S0[n - 1]; return z && z.n !== x.n && z.fixed && okNow(z); })) return false;
      if (/هنوز/.test(c)) { var W = toks(c.replace(/[0-9۰-۹.٫]/g, " ")).filter(function (t) { return t.length >= 3 && !/^(?:هنوز|نشده|نکرده|حساب|معلوم|نیست|خودش|گفته)$/.test(t); });
        if (W.length && S0.some(function (z) { return z.n > x.n && okNow(z) && W.filter(function (t) { return hit(t, toks(curText(z))); }).length >= Math.min(2, W.length); })) return false; }
      return true; });
    return keep.join("، ");
  }
  ST.whyNow27 = whyNow27;
  function priorQ(pr) {
    if (!pr) return ""; var no = pr.steps.filter(function (x) { return x.her === "no" && !x.reAt; })[0];
    if (no) return no.herWhy ? "دلیلِ تازه‌ات برای گامِ " + fa(no.n) + " («" + clip(no.herWhy, 70) + "»): همین دلیل گام را کامل ثابت می‌کند — هر حالتی را می‌پوشاند؟"
      : "حکمِ گامِ " + fa(no.n) + " («" + clip(curText(no), 60) + "») را رد کردی — به چه دلیل " + (no.verdict === "ok" ? "نادرست" : "درست") + " است؟ با همان شاهد دوباره می‌سنجیم.";
    var x = pr.resume ? pr.steps[pr.resume - 1] : null;
    if (!x) { var dr = pr.steps.filter(function (y) { return y.drop; }).length ? "گام‌هایی که نگه داشتی" : "همهٔ گام‌های پیشینت";
      return pr.fin ? (dr === "همهٔ گام‌های پیشینت" ? "همهٔ گام‌هایت" : dr) + " درست است و به جواب رسیدی — می‌توانی نتیجه را از راهِ دیگری وارسی کنی؟" : dr + " درست درآمد — گامِ بعدیِ تو چیست، و پیش از برداشتنش فکر می‌کنی چه می‌شود؟"; }
    if (x.stale) return "گامِ " + fa(x.n) + " («" + clip(curText(x), 60) + "») بر «" + clip(x.stale.frag, 30) + "» بنا بود که خودت به «" + clip(x.stale.fix, 30) + "» اصلاحش کردی: با مقدارِ تازه این گام چه می‌شود؟";
    if (x.verdict === "ok" && (x.depStale || []).length) return "گامِ " + fa(x.n) + " («" + clip(curText(x), 60) + "») هنوز با عددِ پیشینِ گامِ " + x.depStale.map(fa).join("، ") + " نوشته شده: با عددِ اصلاح‌شده این گام چه می‌شود؟";
    if (x.her === "ok" && !x.fixed) return "حکمِ گامِ " + fa(x.n) + " («" + clip(curText(x), 60) + "») را پذیرفتی — حالا درستِ همین گام را خودت چطور می‌نویسی؟";
    /* دورِ ۲۶ (D25-5، D26-3): پرسش از وضعِ همین لحظهٔ گام — حرفِ تازه‌اش یا بازنویسی‌اش، نه متنِ کهنه */
    if (x.say) return "گامِ " + fa(x.n) + ": حرفِ تازه‌ات («" + clip(x.say.t, 60) + "») هم هنوز گام را درست نمی‌کند" + (x.say.why ? " — " + clip(x.say.why, 90) : "") + ": حالا درستِ همین گام را خودت چطور می‌نویسی؟";
    if (x.verdict === "wrong") return "گامِ " + fa(x.n) + " («" + clip(curText(x), 60) + "») جای درنگ است" + (x.chk ? " (" + x.chk + ")" : whyNow27(pr, x) ? " — " + clip(whyNow27(pr, x), 90) : "") + ": خودت این گام را دوباره وارسی می‌کنی — کجایش می‌لنگد؟";
    if (x.verdict === "incomplete") return "گامِ " + fa(x.n) + " («" + clip(curText(x), 60) + "») ناقص مانده" + (whyNow27(pr, x) ? " — " + clip(whyNow27(pr, x), 90) : "") + ": چه چیزی کم دارد تا کامل شود؟";
    return "گامِ " + fa(x.n) + " («" + clip(curText(x), 60) + "») را چطور وارسی می‌کنی — روشن می‌بینی که درست است؟";
  }
  ST.priorQ = priorQ;
  /* دورِ ۲۶ (Q6، C26-2): «بسته شد» فقط از بستنِ خودِ صفحه (A.liveClosure) — «در بازنگری — هنوز بسته نشده» بسته نیست */
  function priorReview26(pid) { try { var c = A.liveClosure ? A.liveClosure(pid) : null; return !!(c && c.state === "review"); } catch (e) { return false; } }
  /* دورِ ۲۷ (C56، A27-21): هر گزارشِ بعدی — پیش یا پس از بستن — در همان دفتر ادغام می‌شود، هرگز جایش را نمی‌گیرد.
     ریشه: پس از «✅ حل شد» گفت‌وگو دیگر به مسئلهٔ زنده بسته نیست (boundLive.done)، pid = "" و دفترِ مسئلهٔ بسته دیده نمی‌شد؛ گزارشِ سوم دفترِ تازه‌ای در داستانِ نشست می‌ساخت
     (شماره‌ها از نو، تاریخچه صفر). حالا تا وقتی نشست دفترِ خودش را ندارد و پیام مسئلهٔ تازه‌ای نمی‌آورد، دفترِ کارِ پیشین همان دفترِ مسئلهٔ بسته است. */
  function priorPid27(s, t) {
    try { var bl = AS.boundLive ? AS.boundLive(s) : null; if (!bl || !bl.pid || !bl.done) return "";
      if (NEWP27.test(String(t || ""))) return "";
      var pg = S.get("eprog_" + bl.pid), L = (pg && pg.solve && pg.solve.live) || {}; if (!L.prior) return "";
      var C = (s && s.coach) || {}; if (storyOf(s, String(C.pk || "c:0")).prior) return "";
      return bl.pid; } catch (e) { return ""; }
  }
  ST.priorPid = function (s, t) { var bl = null; try { bl = AS.boundLive ? AS.boundLive(s) : null; } catch (e) { } return (bl && !bl.done && bl.pid) || priorPid27(s, t); };
  function priorClosed(pid) { if (!pid) return false; try { var pg = S.get("eprog_" + pid), L = (pg && pg.solve && pg.solve.live) || {}; return L.state === "solved" || L.state === "dropped" || (A.livePhase && A.livePhase(pid) === "done"); } catch (e) { return false; } }
  /* کارِ پیشینِ مسئلهٔ زنده یا گفت‌وگو: L.prior (از import) یا story ِ کلیدِ همین لحظه */
  /* پرسشِ ازسرگیری پرسشِ نوبت است تا وقتی کارِ تازه‌ای (طرح/گام/نتیجه) پس از آخرین به‌روزشدنِ دفتر در داستان نیامده.
     دورِ ۲۵: «همه درست — گامِ بعدی؟»، ردِ حکم («به چه دلیل؟») و «پذیرفتی — درستش؟» هر کدام فقط یک نوبت (A25-4، D25-5)؛ مسئلهٔ بسته پرسشِ ازسرگیری ندارد (A25-20) */
  ST.priorTurnQ = function (s, pid) {
    var pr = ST.priorFor(s, pid); if (!pr || priorClosed(pid)) return "";
    var no = pr.steps.filter(function (x) { return x.her === "no" && !x.reAt; })[0]; if (no && (no.turns || 0) < 1) return priorQ(pr);
    var base = String(pr.upAt || pr.at), its = []; if (pid) { var pg = S.get("eprog_" + pid), L = (pg && pg.solve && pg.solve.live) || {}; its = (L.chatImpItems || []).slice(); S.all("achat", function (x) { return x && x.coach && x.coach.story && x.coach.story["L:" + pid]; }).forEach(function (se) { its = its.concat(se.coach.story["L:" + pid].items); }); if ((L.steps || []).some(function (x) { return String(x.at || "") > base; })) return ""; }
    else { var C = (s && s.coach) || {}; its = storyOf(s || {}, String(C.pk || "c:0")).items; }
    if (its.some(function (x) { return (x.k === "plan" || x.k === "step" || x.k === "res") && String(x.at) > base; })) return "";
    var x = pr.resume ? pr.steps[pr.resume - 1] : null;
    if (!x && (pr.turns || 0) >= 1) return "";
    if (x && x.her === "ok" && !x.fixed && !x.stale && !(x.depStale || []).length && (x.ackT || 0) >= 1) return "";
    var P = no ? Object.assign({}, pr, { steps: pr.steps.map(function (y) { return y === no ? Object.assign({}, y, { reAt: "skip" }) : y; }) }) : pr;
    return priorQ(P);
  };
  ST.priorFor = function (s, pid) {
    if (pid) { var pg = S.get("eprog_" + pid), L = (pg && pg.solve && pg.solve.live) || {}; if (L.prior) return L.prior; var se0 = null; S.all("achat", function (x) { return x && x.coach && x.coach.story && x.coach.story["L:" + pid] && x.coach.story["L:" + pid].prior; }).forEach(function (x) { se0 = x; }); return se0 ? se0.coach.story["L:" + pid].prior : null; }
    var C = (s && s.coach) || {}, E = storyOf(s || {}, String(C.pk || "c:0")); return E.prior || null;
  };
  /* این پیام درخواستِ «گزارشِ کارِ پیشین» می‌گیرد؟ — فقط آغازِ مسئله (یا همان پیامی که دفتر از آن آمد)، یا پیامی که خودش کارِ پیشینش می‌خواند */
  function ownWorkN(t) { return sentences(String(t || "")).filter(function (x) { return WORK24.test(x) && !TEST25.test(x); }).length; }
  var STRONG25 = /[0-9۰-۹]\s*(?:[=×*÷\/+−\-]|ضربدر|ضرب\s*در|تقسیم\s*بر|منهای|به[‌\s]?علاوه)\s*[0-9۰-۹][^.!؟?\n]{0,60}(?:=|میشه|می[‌\s]?شود|می[‌\s]?شه|شد)\s*(?:حدود(?:ِ)?\s*)?[0-9۰-۹]|حساب(?:ش)?\s*(?:رو|را)?\s*کرد(?:م|ه[‌\s]*ام|ه\s*بودم)[^.!؟?\n]*[0-9۰-۹]|[0-9۰-۹][^.!؟?\n]*حساب(?:ش)?\s*(?:رو|را)?\s*کرد(?:م|ه[‌\s]*ام|ه\s*بودم)|گام(?:ِ)?\s*(?:[0-9۰-۹]+|اول)\s*[:：—\-–]|(?:^|\s)(?:[0-9۰-۹]+|x|y|n|[a-zA-Z])\s*(?:رو|را)\s*[^.!؟?\n]{0,12}گرفتم|(?:وزن|نمره)\s*دادم|=[^.!؟?\n]{0,40}(?:پس|یعنی|بنابراین)|(?:پس|یعنی|بنابراین)[^.!؟?\n]{0,40}=|تصمیم\s*گرفت(?:م|ه[‌\s]*ام)[^.!؟?\n]*(?:چون|زیرا)|پس\s+[^.!؟?\n]{0,24}[0-9۰-۹][^.!؟?\n]{0,12}می[‌\s]?مونه|[0-9۰-۹]\s*[^.!؟?\n0-9۰-۹]{0,14}(?:میشه|می[‌\s]?شود|شد)\s*(?:حدود(?:ِ)?\s*)?[0-9۰-۹]/;
  /* ---------- دورِ ۲۷ (C56؛ A27-13، B27·D3، C25-7) — گامِ کارشده در آغاز، حتی تنها یک رابطه با مقدارِ حساب‌شده ----------
     ریشه: STRONG25 فقط «عدد عملگر عدد» ِ چسبیده را می‌شناخت — «۲۰۰ پیام در ثانیه × ۳۶۰۰ = ۷۲۰۰۰۰»، «۴۰ میلیون × ۱٫۲ = ۴۸ میلیون» (واحد میانِ عدد و عملگر) را نه؛
     جملهٔ «امتحان کردم: … میشه 16−1=15» را TEST25 کنار می‌گذاشت هرچند حسابِ نوشته‌شده دارد؛ «طول + عرض = ۱۸» (رابطهٔ نمادین با مقدار) و «… ۱۳ تا ⇒ ۱۳/۲۷» (استنتاج با پیکان) هم نه.
     حالا: (۱) حسابی که موتورِ خودِ صفحه (a46 ST.arithChk) در جمله می‌خواند و عملگر دارد — درست یا نادرست — گامِ کارشده است، با «امتحان کردم» هم؛
     (۲) رابطهٔ نمادینِ دو واژه با مقدار، فقط با نشانهٔ «خودم/رفتم/گام» در همان پیام (صورتِ مسئله «x² − y² = 15» گام نیست)؛ (۳) عدد … «⇒» عدد.
     «خودم یه گام رفتم» / «گامِ اول رو خودم رفتم» نشانهٔ صریحِ کارِ خودش است؛ پیامی که مسئلهٔ تازه‌ای را با گامِ خودش می‌آورد («یه سؤالِ تازه: … خودم یه گام رفتم») آغازِ همان مسئله است. */
  var OWNSTEP27 = /خودم[^.!؟?\n]{0,30}(?:(?:یه|یک|اولین|نخستین)\s*)?گام(?:ش|ی)?\s*(?:رو\s*|را\s*)?(?:رفتم|برداشتم|جلو\s*رفتم)|گام(?:ِ|‌ِ)?\s*(?:اول|نخست|۱|1)(?:ش)?\s*(?:رو|را)\s*خودم\s*(?:رفتم|برداشتم|حساب\s*کردم)/;
  var NEWP27 = /(?:یه|یک)\s*(?:سؤال|سوال|مسئله|مساله|مشکل)(?:ِ|ٔ|‌ی|ی)?\s*(?:تازه|جدید|دیگه|دیگر)/;
  var SYMREL27 = /(?:[آ-ی]{2,}|[a-zA-Z])\s*[+×*÷\/−-]\s*(?:[آ-ی]{2,}|[a-zA-Z])\s*(?:=|میشه|می[‌\s]?شه)\s*[0-9۰-۹]/, ARROW27 = /[0-9۰-۹][^.!؟?\n]{0,80}(?:⇒|=>|→)\s*[0-9۰-۹]/;
  function worked27(x, own) {
    if (ARROW27.test(x) && !TEST25.test(x)) return true;   // «امتحان کردم: p=5 ⇒ ۲۴» حالتِ آزموده است، نه گام (A25-4)؛ حسابِ با عملگر («16−1=15») هنوز گام است
    if (own && SYMREL27.test(x)) return true;
    try { return ST.arithChk(x).some(function (c) { return /[+\-−*×÷\/^]/.test(String(c.expr)) && /^\d/.test(String(c.said)); }); } catch (e) { return false; }
  }
  ST.worked27 = worked27;
  /* ادغامِ دورِ ۲۷ (arith × prior): بی نشانهٔ کارِ خودش، حسابِ درست در گپِ روزمره («امروز ۲ × ۳ = ۶ تا تخم‌مرغ خریدیم، خوش گذشت») گامِ کارشده نیست —
     فقط وقتی پیام نشانهٔ مسئله دارد (پرسش، «مسئله/سؤال»، «نمی‌دونم»، «می‌خوام بدونم»، «چقدر/چطور/چند/چرا»، گیر). */
  var PROB27 = /[؟?]|مسئله|مساله|سؤال|سوال|مشکل|نمی[‌\s]?دونم|نمی[‌\s]?دانم|می[‌\s]?خوام\s*بدونم|چطور|چقدر|چند|چرا|کمک/;
  function probSig27(t) { return PROB27.test(String(t || "")) || STUCK27.test(String(t || "")); }
  var TESTOK27 = /درسته|درست\s*(?:است|بود|درمیاد|درومد|در\s*میاد)|جور\s*(?:در)?(?:میاد|اومد|درآمد)/;
  var STUCK27 = /گیر\s*کردم|موندم|تا\s*این[‌\s]*جا\s*(?:رفتم|رسیدم|اومدم)|از\s*این[‌\s]*جا\s*(?:به\s*بعد|گیر)/;
  /* ---------- دورِ ۲۸ (C98؛ A28-37 pwA1 p19، D28-30 tD2 p25، nB1 p7) — پرسشِ خالی دربارهٔ یک حساب کارِ پیشین نیست ----------
     ریشه: STRONG25 «۷ × ۸ = ۵۶» را در هر جمله‌ای گامِ کارشده می‌خواند — حتی وقتی جمله فقط پرسشِ وارسیِ همان حساب است («… بود دیگه؟»، «… میشه دیگه، نه؟»،
     «یه سؤال: ۲۵۰ ÷ ۵ = ۵۰ درسته؟»). پیامِ آغازین با این شکل بلوکِ «# کارِ پیشینِ تو» و پرسشِ نقطهٔ ازسرگیری می‌گرفت. قاعدهٔ C56 در workMsg بود، نه در priorAsk.
     حالا: جمله‌ای که پرسش است و جز رابطهٔ حساب و واژه‌های پرسشِ وارسی («بود/میشه/درسته/دیگه/نه/مگه/یه سؤال/راستی …») هیچ واژهٔ دیگری ندارد «پرسشِ خالی» است؛
     پیامی که همهٔ جمله‌های حسابی‌اش پرسشِ خالی‌اند و نشانهٔ کارِ خودش («خودم/حساب کردم/گام …») ندارد دفتری نمی‌سازد و به دفتری گام نمی‌افزاید.
     شبیهِ منفی: «خودم حساب کردم: … = ۲۰ …، پس … ۲۰۰ متر. درسته؟» و مسئله با دو رابطهٔ کارشده هنوز کارِ پیشین‌اند. */
  var BAREW28 = /^(?:یه|یک|سؤال|سوال|کوچیک|کوچک|کوچولو|راستی|ببخشید|فقط|بود|بوده|دیگه|دیگر|درسته|درست|است|هست|میشه|میشود|نه|مگه|مگر|آره|بله|همون|همان|ضربدر|ضرب|در|تقسیم|بر|منهای|بهعلاوه|بعلاوه|علاوه|جمع|با|اینو|این|که|واقعاً|واقعا|حتماً|حتما|آیا|میشد|سلام|جان)$/;
  function bareQ28(x) {
    var y = String(x || ""); if (!/[؟?]/.test(y) && !/(?:دیگه|نه|مگه)\s*$/.test(y.trim())) return false;
    var rest = y.replace(/[0-9۰-۹][0-9۰-۹.,٫٬\/]*/g, " ").replace(/[=×*÷\/+−\-–^²³√()\[\]:：،,.!؟?«»"'…]/g, " ").split(/\s+/).filter(function (w) { return w && w.length >= 2; });
    return rest.every(function (w) { var v = w.replace(/[‌ً-ْٔ]/g, ""); return BAREW28.test(v) || BAREW28.test(w); });
  }
  function bareMsg28(t, own) {
    if (own) return false; var S0 = sentences(String(t || "")).filter(function (x) { return STRONG25.test(x) || worked27(x, false); });
    return S0.length >= 1 && S0.every(bareQ28);
  }
  ST.bareQ28 = bareQ28; ST.bareMsg28 = bareMsg28;
  function priorAsk(s, pid, msg) {
    var t = String(msg || ""); if (!t.trim() || /^\s*\[/.test(t)) return false;
    /* C7: «بلند» طول نیست — گامِ کارشدهٔ خودش (حساب با نتیجه، استنتاج، تصمیمِ گرفته با دلیل) حتی یکی؛ «اول/بعد/پس» ِ تنها (خاطره، پرسش، بلندفکری) نه */
    var own27 = OWNSTEP27.test(t) || MINE26.test(t) || STUCK27.test(t);
    if (bareMsg28(t, own27)) return false;   // دورِ ۲۸ (C98): «۷ × ۸ = ۵۶ بود دیگه؟» — در آغاز یا وسطِ گفت‌وگو
    /* حالتِ آزموده («دارم امتحان می‌کنم: ۷+۷=۱۴، ۱۱+۷=۱۸ … جور نمیشه») گام نیست؛ آزمونی که خودش «درسته» خواند («امتحان کردم: … 16−1=15 درسته») گامِ اوست (C25-7) */
    if (!sentences(t).some(function (x) { return (STRONG25.test(x) && !TEST25.test(x)) || (worked27(x, own27) && (own27 || probSig27(t)) && (!TEST25.test(x) || TESTOK27.test(x))); })) return false;
    if (OTHER26.test(t) && !MINE26.test(t)) return false;   // دورِ ۲۶ (بانکِ R26 #127): کارِ کسِ دیگر — مگر کارِ خودش هم در همان پیام باشد
    /* «حلش کردم!»، «اثبات کردم …» بی این‌که خودش آن را کارِ پیشین بخواند یا گام‌هایش را بشمارد، ادعای حل است (بازنگری)، نه کارِ پیشین برای داوری */
    if (DONE25.test(t) && !CALLS25.test(t)) return false;
    var pr = ST.priorFor(s, pid); if (pr) return (!!pr.src && pr.src === clip(nz(t), 200)) || CALLS25.test(t);
    if (CALLS25.test(t)) return true;
    /* دورِ ۲۷ (C56): «خودم یه گام رفتم» در پیامی که مسئلهٔ تازه‌ای می‌آورد ⇒ آغازِ همان مسئله (پس از مسئلهٔ دیگری در همین نشست هم) */
    if (OWNSTEP27.test(t) && NEWP27.test(t)) return true;
    return priorOpenAt(s, pid, { text: t, at: "~" });
  }
  ST.priorAsk = priorAsk;
  var DONE25 = /حل(?:ش)?\s*کردم|(?:اثبات|ثابت)(?:ش)?\s*کردم|حل\s*شد(?![آ-ی])|ولش\s*کنم|رهاش\s*کنم/;
  var OPEN_Q25 = "نخستین گامِ کارِ پیشینت که هنوز درست نیست را خودت دوباره وارسی می‌کنی — کجایش می‌لنگد یا چه کم دارد؟";
  /* پرسشِ نوبت پیش از پاسخِ مدل (همان خوانشِ readReply؛ چیزی نمی‌نویسد جز یادِ «کدام گام پرسیده شد»):
       open    — پیامِ آغازینِ کارِ پیشین ⇒ نقطهٔ ازسرگیری، نه «اول کل»، نه آزمونِ حدس (A25-1، B25·D2، C25-12، D25-6)؛
       dispute — همین پیام حکمی را رد کرد ⇒ دوباره‌سنجی با شاهد، نه «خودت فکر می‌کنی چرا؟»، نه «درست است/نه نگو» (A25-7، B25·D3، C25-13)؛
       resume  — نقطهٔ ازسرگیریِ دفتر؛ اگر همین پیام همان گام را دوباره نوشته، هر دو شاخه گفته می‌شود (A25-2). */
  ST.priorTurn = function (s, pid, mt) {
    var t = String(mt || ""); if (!t.trim() || /^\s*\[/.test(t)) return null;
    if (!pid && s) pid = priorPid27(s, t);   // دورِ ۲۷ (C56): پس از بستن، دفترِ همان مسئله
    var pr = ST.priorFor(s, pid);
    if (!pr) { if (!priorAsk(s, pid, t)) return null;
      return { id: "open", q: OPEN_Q25, line: "پیامش کارِ پیشینِ خودش را دارد (مسئله، ایده و گام‌هایی که خودش برداشته) — پرسشِ این نوبت **نقطهٔ ازسرگیری** است: حکمِ هر گام را بده (قراردادِ «# کارِ پیشینِ تو»)، سپس نخستین گامی را که «✓ درست» نیست با شماره و نقلِ خودش نام ببر و فقط همان را بپرس؛ اگر همه درست بود، گامِ بعدیِ خودش را بپرس. کلِ مسئله در یک جمله، مجهول و راهِ آزمودنِ حدس را نپرس — پرسشِ «درست است» ِ او جوابش همان حکمِ گام‌هاست. پرسشِ این نوبت: «" + OPEN_Q25 + "»" }; }
    /* دورِ ۲۷ (D26-11 پس از بستن، C56): مسئلهٔ بسته پرسشِ ازسرگیری ندارد (A25-20) — ولی ردِ حکم، پس گرفتنش، «کدام گام؟» و «دوباره» پس از بستن هم شنیده می‌شوند */
    var closed27 = priorClosed(pid);
    var R = readReply(pr, t, { first: (pr.turns || 0) < 1 }), no = R.acts.filter(function (a) { var x9 = pr.steps[a.n - 1]; return a.act === "no" && !!x9; })[0];
    if (closed27 && !no && !(R.which && R.which.length > 1) && !R.again && !R.acts.some(function (a) { return /^undo/.test(a.act); })) return null;
    /* دورِ ۲۶ (U8): «چرا میگی …؟» که به دو گام می‌خورد و هیچ‌کدام گامِ ازسرگیری نیست ⇒ صفحه می‌پرسد کدام گام — حدس نمی‌زند، «خودت فکر می‌کنی چرا؟» هم نه */
    if (!no && R.which && R.which.length > 1) { var qw = "حکمِ کدام گام را می‌گویی — " + R.which.map(function (n) { return "گامِ " + fa(n); }).join(" یا ") + "؟";
      return { id: "which", ns: R.which, q: qw, fixed: true, line: "پیامش حکمِ یکی از گام‌ها را زیرِ پرسش می‌برد ولی روشن نیست کدام (" + R.which.map(function (n) { return "گامِ " + fa(n) + " «" + clip(curText(pr.steps[n - 1]), 40) + "»"; }).join("؛ ") + "). حدس نزن و «چرا» را به خودش برنگردان؛ فقط همین یک پرسش: «" + qw + "»" }; }
    /* دورِ ۲۶ (U9): پس گرفتنِ رد ⇒ ردِ تازه نیست؛ حالتِ پیش از رد برمی‌گردد و پرسشِ نوبت همان نقطهٔ ازسرگیری است */
    var un26 = R.acts.filter(function (a) { return /^undo/.test(a.act) && (openNo(pr.steps[a.n - 1]) || a.act === "undo-ok"); })[0];
    if (!no && un26) { var xu = pr.steps[un26.n - 1], simU = JSON.parse(JSON.stringify(pr)), qu = ""; try { var yu = simU.steps[un26.n - 1], eu = null; (yu.herHist || []).forEach(function (h) { if (h.noAt && !h.undone) eu = h; });
        if (eu && yu.re && yu.re.by === "coach" && eu.v && eu.v !== yu.verdict && !yu.fixed) { yu.verdict = eu.v; yu.why = eu.why || ""; } delete yu.re; delete yu.reAt; yu.her = un26.act === "undo-ok" ? "ok" : (eu && eu.her) || ""; yu.ackT = 1; relink(simU); simU.turns = 0; qu = priorQ(simU); } catch (e) { qu = ""; }
      return { id: "undo", n: xu.n, q: closed27 ? "" : qu, fixed: !closed27, line: "همین پیام ردِ خودش بر حکمِ گامِ " + fa(xu.n) + " را **پس می‌گیرد** — این ردِ تازه نیست و دوباره‌سنجی نمی‌خواهد. صفحه حالتِ پیش از رد را با تاریخچه برمی‌گرداند؛ در یک جمله همین را تأیید کن (بی سرزنش) و دوباره داوری نکن" + (qu && !closed27 ? "؛ سپس فقط همین یک پرسش: «" + qu + "»" : "") + "." }; }
    if (no) { var x = pr.steps[no.n - 1], okV = x.verdict === "ok" && !x.stale, ckD = okV ? ST.arithChk(curText(x)) : [], pgOk = okV && ckD.length > 0 && ckD.every(function (c) { return c.ok === true; }),
        q = no.why ? "دلیلت برای گامِ " + fa(x.n) + " («" + clip(no.why, 70) + "»): همین دلیل " + (okV ? "نشان می‌دهد گام نادرست است — کدام بخشش را می‌شکند؟" : "گام را کامل ثابت می‌کند — هر حالتی را می‌پوشاند؟") : "حکمِ گامِ " + fa(x.n) + " («" + clip(curText(x), 60) + "») را رد کردی — به چه دلیل " + (okV ? "نادرست" : "درست") + " است؟";
      return { id: "dispute", n: x.n, q: q, line: "همین پیام حکمِ گامِ " + fa(x.n) + " («" + clip(curText(x), 60) + "» — " + VERD[x.verdict] + ") را رد می‌کند" + (no.why ? "؛ دلیلِ خودش: «" + clip(no.why, 120) + "»" : "") + ". نخست همان گام را **با شاهد دوباره بسنج** (" + (x.pageBad ? "حسابِ صفحه: " + (x.chkM || x.chk) : pgOk ? "حسابِ صفحه همان را می‌خواند: " + ckD.map(function (c) { return String(c.expr) + " = " + String(c.said); }).join("؛ ") : "دلیلِ حکم: " + (x.why || "—")) + ") — نه کوتاه آمدنِ بی‌دلیل، نه پافشاریِ بی‌دلیل؛ نتیجه را در coach_state بده: \"prior\":[{\"n\":" + x.n + ",\"quote\":\"همان نقل\",\"verdict\":\"…\",\"why\":\"شاهدِ دوباره‌سنجی\"}] تا روی صفحه بنشیند. این ردِ حکم است، نه حدسِ تازه و نه «چرا» ِ توضیح‌خواه: «چرا» را به خودش برنگردان و آزمونِ حدس نخواه. سپس فقط همین یک پرسش: «" + q + "»" }; }
    if (R.again) { var xa = pr.steps[R.again - 1], qa = "به کدام بخشِ شاهدِ دوباره‌سنجیِ گامِ " + fa(xa.n) + " شک داری؟"; return { id: "again", n: xa.n, q: qa, line: "حکمِ گامِ " + fa(xa.n) + " پیش‌تر با شاهد دوباره سنجیده شد و ماند؛ این پیام دلیلِ تازه‌ای ندارد — حکم را پس نگیر و بحث را از نو نکن؛ همان شاهد («" + clip(xa.re.why || xa.why || xa.chk, 160) + "») را یک بار دیگر نشان بده و فقط همین یک پرسش را بپرس: «" + qa + "»" }; }
    if (STUCK25.test(t) || R.yes) return null;
    /* اصلاحی که صفحه خودش می‌خواند و می‌سنجد ⇒ پرسشِ نوبت از دفترِ پس از همان اصلاح (روی رونوشت؛ چیزی نوشته نمی‌شود) */
    var simP = JSON.parse(JSON.stringify(pr)), chP = []; try { R.acts.forEach(function (a) { var x1 = simP.steps[a.n - 1]; if (x1 && a.act === "drop" && !okNow(x1)) { x1.drop = { at: "~", by: "her" }; chP.push(1); }
        if (x1 && a.act === "ok" && a.pair && !okNow(x1)) { var nt1 = subNum(curText(x1), a.pair.old, a.pair.nw); if (nt1 && tryFix(x1, nt1, "~", "her")) chP.push(1); } }); relink(simP); chP = chP.concat(pageFix(simP, t, "~").filter(function (c) { return c.k === "fix"; })); } catch (e) { chP = []; }
    if (chP.length) { relink(simP); simP.turns = 0; simP.upAt = "~"; var qf = priorQ(simP); return { id: "resume", n: simP.resume, q: qf, fixed: true }; }
    var q0 = ST.priorTurnQ(s, pid); if (!q0) return null;
    var rs = pr.resume ? pr.steps[pr.resume - 1] : null;
    /* دورِ ۲۶ (A26-5): «همهٔ گام‌های پیشینت درست درآمد» هرگز در نوبتی که حسابِ همین پیام را صفحه ✗ خوانده — آن نوبت مالِ همان حساب است («# حسابِ صفحه») */
    if (!rs) { var badNow = []; try { badNow = ST.arithChk(t).filter(function (c) { return c.ok === false; }); } catch (e) { badNow = []; } if (badNow.length) return null; }
    /* همین پیام همان گام را دوباره نوشته (کارِ تازه یا نامِ همان گام) ⇒ هر دو شاخه: اگر با این پیام درست شد، پرسشِ گامِ بعد؛ وگرنه همان */
    if (rs && !(rs.her === "no" && !rs.reAt) && (R.acts.some(function (a) { return a.n === rs.n && a.act === "ok"; }) || ownWorkN(t) >= 1 || stepNs(t).indexOf(rs.n) >= 0)) {
      var sim = JSON.parse(JSON.stringify(pr)), y = sim.steps[rs.n - 1]; y.verdict = "ok"; y.fixed = { t: y.quote, was: y.quote, at: "~", by: "her" }; delete y.stale; y.oldNums = []; relink(sim); sim.turns = 0;
      var qn = priorQ(sim);
      return { id: "resume", n: rs.n, q: q0, alt: qn, line: "اگر همین پیام گامِ " + fa(rs.n) + " را درست کرد (آن‌وقت همان را با \"prior\":[{\"n\":" + rs.n + ",…}] گزارش کن)، پرسشِ این نوبت از دفترِ پس از همان اصلاح است — " + qn.replace(/[«»]/g, "").replace(/[؟?]/g, "") + "؛ اگر هنوز درست نشده، همان پرسشِ این نوبت دربارهٔ گامِ " + fa(rs.n) + "." };
    }
    return { id: "resume", n: rs ? rs.n : 0, q: q0 };
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
    var I27 = storyOf(s, keyFor(s, pid)).items, ph = phaseOfItems(I27.concat(L.chatImpItems || []));
    if (ph && ph !== L.chatPh && maxPh(L.chatPh, ph) === ph) { L.chatPh = ph; L.chatPhAt = nowIso(); dirty = true; }
    /* دورِ ۲۷b (A27-5): پس از «حل شد — کنار رفت، اجرا دوباره باز شد» (a38 L.reopened)، جوابِ کلِ تازه‌ای که پس از بازشدن گفت دوباره «بازنگری» است */
    else if (ph === "b" && L.chatPh === "b" && L.reopened && String(L.reopened.at || "") > String(L.chatPhAt || "") && I27.some(function (x) { return x.k === "res" && x.fin !== false && String(x.at || "") > String(L.reopened.at || ""); })) { L.chatPhAt = nowIso(); dirty = true; }
    if (dirty) { S.put(pg); try { if (A.liveDraftDrop) A.liveDraftDrop(pid); } catch (e) { } }
  }
  ST.feed = feed;
  /* مرحلهٔ یک منبع: فرم یا داستانِ سنجیده (هر کدام جلوتر)؛ حل‌شده/بازنگری/کنارگذاشته از فرم */
  A.liveStoryPhase = function (pid) {
    var ph = A.livePhase ? A.livePhase(pid) : ""; if (ph === "b" || ph === "done") return ph;
    var pg = S.get("eprog_" + pid), L = (pg && pg.solve && pg.solve.live) || {}; if (L.state === "solved" || L.state === "abandoned") return ph;
    /* دورِ ۲۷b (history، A27-5 s02 p10–p14): «حل شد» که با اصلاحِ یک داده کنار رفت (a38 setAsideDeps ⇒ L.reopened) اجرا را دوباره باز می‌کند؛ «بازنگری» ِ داستان که پیش از
       بازشدن رسیده بود دیگر مرحله نیست — مرحله «اجرا» است تا جوابِ کلِ تازه‌ای پس از بازشدن (feed همان لحظه L.chatPhAt را تازه می‌کند) */
    if (L.chatPh === "b" && L.reopened && String(L.reopened.at || "") > String(L.chatPhAt || "")) return maxPh(ph, "c");
    return maxPh(ph, L.chatPh || "");
  };
  A.liveStoryAhead = function (pid) { var ph = A.livePhase ? A.livePhase(pid) : "", sp = A.liveStoryPhase(pid); return !!sp && ORD[sp] > ORD[ph || "u"]; };

  /* دورِ ۲۶ (Q3): جای آغازِ صورتِ یک مسئله در پیامِ او (نقلِ عینی، وگرنه نخستین جمله‌ای که بیشترِ واژه‌های صورت را دارد)؛ ۱- = در این پیام نیست */
  function stmtOff26(t, stmt) {
    var T = String(t || ""), q = txt(stmt); if (!q || !T) return -1;
    var i = T.indexOf(q.slice(0, 24)); if (i >= 0) return i;
    var base = toks(q).filter(function (w, k, X) { return X.indexOf(w) === k; }); if (base.length < 3) return -1;
    var S0 = sentences(T), pos = 0, best = -1, bn = 0;
    S0.forEach(function (x) { var ix = T.indexOf(x.slice(0, 12), pos); if (ix < 0) ix = pos; pos = ix; var n = toks(x).filter(function (w, k, X) { return X.indexOf(w) === k && hit(w, base); }).length; if (n > bn) { bn = n; best = ix; } });
    return bn * 2 >= base.length ? best : -1;
  }
  function bornFrom26(se, m) {
    var k = mid(m), o = null; if (!se || !k) return null;
    S.all("eprog", function (pg) { var I = pg && pg.solve && pg.solve.live && pg.solve.live.chatImp; return !!(I && I.sess === se.id && I.bmid === k && I.boff > 0); }).forEach(function (pg) { o = { pid: String(pg.id).replace(/^eprog_/, ""), off: pg.solve.live.chatImp.boff }; });
    return o;
  }
  ST.bornFrom26 = bornFrom26;
  /* بانکِ R26 #84: کنشِ همین نوبت (chat_invent/live_new) صورتی را از وسطِ همین پیام برداشت و آن را مسئلهٔ **موجودِ** دیگری شناخت («پیش‌تر ثبت شده بود؛ دوباره نساختم») ⇒ همان مرز:
     از همان جمله به بعد مالِ همان مسئله است. C.moved26 = [{ mid, pid, off }] — هم برای دفترِ داستان (onState) و هم مالکِ «برنامهٔ خودت» (ST.planOwner). */
  function movedTo26(se, um, pid) {
    var k = mid(um), M = (((se && se.coach) || {}).moved26 || []).filter(function (x) { return x && x.mid === k && x.pid !== pid && x.off > 0; }).pop();
    return M ? { pid: M.pid, off: M.off } : null;
  }
  ["chat_invent", "live_new"].forEach(function (nm) {
    if (!AS.DO || typeof AS.DO[nm] !== "function" || AS.DO[nm]._r26story) return; var raw = AS.DO[nm];
    AS.DO[nm] = function (a) {
      var s0 = AS._turnSession, um = s0 ? lastUser(s0) : null, ids0 = {}; try { (A.liveAll ? A.liveAll() : []).forEach(function (r) { ids0[r.p.id] = 1; }); } catch (e) { }
      var out = raw.apply(this, arguments);
      try { var stA = txt(a && a.statement), off = um && stA ? stmtOff26(String(um.text || ""), stA) : -1;
        if (off > 0) { var all = A.liveAll ? A.liveAll() : [], nw = all.filter(function (r) { return !ids0[r.p.id]; })[0], tg = nw ? nw.p.id : ((all.filter(function (r) { return sameProb26(stA, r.p.statement) || (a.title && nz(r.p.title) === nz(a.title)); })[0] || { p: {} }).p.id || "");
          if (tg) { var C0 = s0.coach = s0.coach || {}; (C0.moved26 = C0.moved26 || []).push({ mid: mid(um), pid: tg, off: off }); if (C0.moved26.length > 30) C0.moved26 = C0.moved26.slice(-30); } } } catch (e) { }
      return out;
    };
    Object.keys(raw).forEach(function (k) { AS.DO[nm][k] = raw[k]; }); AS.DO[nm]._r26story = true;
  });
  /* مالکِ یک «برنامهٔ خودت» ِ گفت‌وگو (se.plans): پیوندِ خودش ⇒ مرزِ پیامی که مسئلهٔ تازه از آن زاده شد ⇒ مسئله‌ای که سشن آن لحظه به آن بسته بود ⇒ مسئلهٔ گفت‌وگویی که
     بعدتر همان مسئلهٔ زنده شد (ST.owns). «» = هیچ مسئلهٔ ثبت‌شده‌ای (فقط پروندهٔ گفت‌وگو).
     دورِ ۲۶ (Q3، U13 = B26x·D33 oB1: «برنامهٔ خودت — از امشب یک هفته گوشی …» ِ مسئلهٔ بیداری در 📜 ِ شام و ورزش؛ D26-6): پیش‌تر برنامه‌ای که هنگامِ گفتنش سشن به
     هیچ مسئلهٔ زنده‌ای بسته نبود (مسئلهٔ گفت‌وگو، بعدتر ثبت شد) «بی‌مالک» می‌ماند و در پروندهٔ **هر** مسئلهٔ همان سشن می‌آمد. */
  ST.planOwner = function (se, q, sm) {
    if (!se || !q) return ""; if (q.pid) return String(q.pid);
    var at = String((sm && sm.at) || q.at || "");
    try { var bp = null;
      if (sm && sm.mid) S.all("eprog", function (pg) { var I = pg && pg.solve && pg.solve.live && pg.solve.live.chatImp; return !!(I && I.sess === se.id && I.bmid === sm.mid && I.boff > 0); }).forEach(function (pg) { bp = { pid: String(pg.id).replace(/^eprog_/, ""), off: pg.solve.live.chatImp.boff }; });
      if (!bp && sm && sm.mid) { var mv = (((se && se.coach) || {}).moved26 || []).filter(function (x) { return x && x.mid === sm.mid && x.off > 0; }).pop(); if (mv) bp = { pid: mv.pid, off: mv.off }; }
      if (bp) { var ix = String(sm.text || "").indexOf(String(q.text || "").replace(/…$/, "").slice(0, 16)); if (ix >= bp.off) return bp.pid; } } catch (e) { }
    var o = pidAt(se, at); if (o) return o;
    var own = ""; try { (A.liveAll ? A.liveAll() : []).forEach(function (r) { if (!own && r && r.p && ST.owns(se, r.p.id, at)) own = r.p.id; }); } catch (e) { }
    return own;
  };

  /* ---------- مسئلهٔ زنده‌ای که بعدتر از همین گفت‌وگو ساخته شد ⇐ همان کارِ گفت‌وگو (B·D5) ---------- */
  function importChat(s, pid) {
    var C = (s && s.coach) || {}, pk = String(C.pk || "c:0"), pg = S.get("eprog_" + pid); if (!pg) return;
    var so = pg.solve = pg.solve || {}, L = so.live = so.live || {}; if (L.chatImp) return;
    var um0 = lastUser(s); pkLog(s, um0 && um0.at);   // مسئلهٔ گفت‌وگویی که همین پیام آغاز کرد هم آغازش ثبت شود (پنجره از همان پیام، نه از آغازِ سشن)
    var E = storyOf(s, pk), win = ST.pkWindow(s, pk);
    /* دورِ ۲۴ (R7، A23-32): هر رویدادِ گفت‌وگو مالِ مسئلهٔ خودش — اگر pk ِ کنونی هنوز مسئلهٔ پیشینِ گفت‌وگوست (مسئلهٔ تازه وسطِ همان گفت‌وگو آمد و pk عوض نشد)،
       پنجرهٔ مسئلهٔ زنده از پیامی آغاز می‌شود که صورتِ خودِ این مسئله را گفت، نه از آغازِ مسئلهٔ پیشین (حدسِ «۱۰۰» و گام‌های «۳ نفر» ِ دست‌دادن مالِ «پیشنهادِ کار» نیست) */
    var from24 = win.from, cut24 = false, other27 = false;
    try { var lr = A.liveRec ? A.liveRec(pid) : null, stm = lr && lr.p ? txt(lr.p.statement || lr.p.title) : "", base = toks(stm).filter(function (w, i, X) { return X.indexOf(w) === i; });
      if (base.length >= 3) { var UM = (s.msgs || []).filter(function (m) { return isUser(m) && String(m.at || "") >= String(win.from || ""); }), sc = UM.map(function (m) { return toks(m.text).filter(function (w, i, X) { return X.indexOf(w) === i && hit(w, base); }).length; }), mx = Math.max.apply(null, sc.concat([0]));
        var si = sc.indexOf(mx); if (si > 0 && mx >= Math.max(2, Math.ceil(base.length * 0.4)) && sc[0] * 2 < mx) { from24 = String(UM[si].at || from24); cut24 = true; }
        /* دورِ ۲۷b (history، aB2 «📜 ِ B نُه سطرِ A را داشت»، بانکِ R27 #223): مسئلهٔ زنده‌ای که هیچ پیامِ پنجرهٔ گفت‌وگو صورتش را نمی‌گوید (هیچ پیامی دو واژهٔ صورت
           را ندارد و همهٔ پیام‌ها روی هم کمتر از دو واژه) مسئلهٔ گفت‌وگوی جاری نیست — مسئلهٔ دیگری است که تازه ثبت شد؛ کارِ گفت‌وگوی پیشین (مالِ مسئلهٔ دیگر) واردش نمی‌شود
           و پنجره‌اش از همین لحظه آغاز می‌شود (پیش‌تر همهٔ داده/نتیجه/برنامهٔ A به 📜 و فرمِ فهمِ B می‌رفت). */
        var any27 = {}; UM.forEach(function (m) { toks(m.text).forEach(function (w) { if (hit(w, base)) any27[w] = 1; }); });
        if (UM.length && mx < 2 && Object.keys(any27).length < 2) other27 = true; } } catch (e) { }
    var items24 = other27 ? [] : cut24 ? E.items.filter(function (x) { return !x.at || String(x.at) >= from24; }) : E.items; if (other27) from24 = nowIso();
    /* دورِ ۲۵ (P5، A25-16 oA1 p6–p18، A23-32): پیامِ مرزی هر دو مسئله را دارد («برای n نفر: n(n−1)/2. ولی … یه پیشنهادِ کار دارم …») — کارِ سنجیدهٔ آن پیام که پیش از
       نخستین جملهٔ مسئلهٔ تازه آمده مالِ مسئلهٔ پیشین است، نه دادهٔ این یکی (پیش‌تر نتیجهٔ دست‌دادن‌ها نقطهٔ نقشهٔ «پیشنهادِ کار» شد و مرحله‌اش را جلو برد) */
    if (cut24) { try { var bm = UM[si], bt = String(bm.text || ""), bmid = mid(bm), S25 = sentences(bt), off25 = -1, pos25 = 0;
        for (var q25 = 0; q25 < S25.length; q25++) { var ix25 = bt.indexOf(S25[q25].slice(0, 12), pos25); if (ix25 < 0) ix25 = pos25; pos25 = ix25;
          if (toks(S25[q25]).some(function (w) { return hit(w, base); })) { off25 = ix25; break; } }
        if (off25 > 0) { var all25 = items24; items24 = items24.filter(function (x) { if (x.mid !== bmid && String(x.at) !== String(bm.at || "")) return true; var ix = bt.indexOf(String(x.t || "").replace(/…$/, "").slice(0, 16)); return ix < 0 ? toks(x.t).some(function (w) { return hit(w, base); }) : ix >= off25; });
          /* رویدادِ همان تکه‌های کنارگذاشته در دفترِ رویدادِ سشن نشان می‌خورد (not25) تا 📜 و 🧭 ِ این مسئله هم آن را از خودشان ندانند (ST.owns با خودِ رویداد) */
          var kx = pk.replace(/[^\w]/g, "_"), dr25 = all25.filter(function (x) { return items24.indexOf(x) < 0; }).map(function (x) { return "st23_" + kx + "_" + x.k + "_" + x.n; });
          if (dr25.length) (s.evlog || []).forEach(function (e) { if (e && dr25.indexOf(e.id) >= 0) { e.not25 = (e.not25 || []).concat([pid]); } }); if (dr25.length) { try { S.put(s); } catch (e2) { } } } } catch (e) { } }
    L.chatImp = { sess: s.id, pk: pk, from: from24, to: nowIso(), n: items24.length };
    /* دورِ ۲۶ (Q3، D26-6): پیامی که این مسئله از جمله‌ای وسطِ آن زاده شد و جای همان جمله (bmid/boff) — مرزِ مالکیتِ همان پیام (bornFrom26، ST.planOwner) */
    try { var lr26 = A.liveRec ? A.liveRec(pid) : null; if (um0 && lr26 && lr26.p) { var bx = stmtOff26(String(um0.text || ""), String(lr26.p.statement || lr26.p.title || "")); if (bx > 0) { L.chatImp.bmid = mid(um0); L.chatImp.boff = bx; } } } catch (e) { }
    if (cut24) L.chatImp.cut = win.from; if (other27) L.chatImp.other27 = true;
    L.chatImpItems = items24.map(function (x) { return { k: x.k, t: x.t, at: x.at, mid: x.mid, pieces: x.pieces, n: x.n, fin: x.fin, ph: x.ph }; });
    if (E.unk && !other27 && (!cut24 || items24.some(function (x) { return x.k === "u" || x.k === "whole"; }))) L.chatUnk = E.unk;
    if (E.prior && !L.prior && !cut24 && !other27) L.prior = JSON.parse(JSON.stringify(E.prior));   // دورِ ۲۴ (R8): کارِ پیشینِ سنجیده با همان حکم‌ها به مسئلهٔ زنده می‌رود (مالِ مسئلهٔ پیشینِ گفت‌وگو نه)
    /* پشتهٔ پیش‌نیازِ بازِ گفت‌وگو (اگر هست) با همان حالت به مسئلهٔ زنده می‌رود — جای منتظر گم نمی‌شود (پشتهٔ مسئلهٔ پیشینِ گفت‌وگو نه) */
    try { var P = cut24 || other27 ? null : (C.pre22 || {})[pk]; if (P && (P.st || []).length && A.PRE && A.PRE.store) { var R = A.PRE.store({ pid: pid }); if (R && !(R.X.st || []).length) { R.X.st = JSON.parse(JSON.stringify(P.st)); R.X.n = P.n || R.X.st.length; R.X.from = { sess: s.id, pk: pk }; } } } catch (e) { }
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
      /* دورِ ۲۵ (P1، D25-2/B25·D15): اصلاحی که در دفترِ «کارِ پیشین» نشست «چیزی برای عوض کردن نبود» نیست — سطرِ صفحه همان را می‌گوید */
      try { var s5 = AS._turnSession, C5 = (s5 && s5.coach) || {}, um5 = lastUser(s5), L5 = C5.prLast25;
        if (a && a.retract && L5 && um5 && L5.at === String(um5.at || "") && L5.fix) { var note5 = "✓ در «کارِ پیشینِ تو» نشست: " + L5.t;
          if (typeof r === "string" && /چیزی\s*(?:در\s*صفحه\s*ثبت\s*نشده\s*بود|برای\s*عوض\s*کردن\s*نبود)|این\s*اصلاح\s*انجام\s*نشد/.test(r)) r = note5; else if (typeof r === "string" && r && r.indexOf("کارِ پیشینِ تو") < 0) r = r + " · " + note5; else if (!r) r = note5;
          /* دورِ ۲۶ (Q2، D26-8 pwD1 p9⇒p10: به او «✓ … گامِ ۲ کهنه شد»، به مدل changed:[] + «چیزی عوض نشد»): همان سطر در «نتیجهٔ صفحه» ِ مدل هم می‌نشیند — یک صدا */
          var N5 = C5.retNote; if (N5 && N5.cur === (AS.msgId ? AS.msgId(um5) : N5.cur)) { N5.res = N5.res || { changed: [], ask: [], note: "" }; if (!(N5.res.changed || []).some(function (c) { return c.rec === "دفترِ «کارِ پیشینِ تو»"; })) { N5.res.changed = (N5.res.changed || []).concat([{ rec: "دفترِ «کارِ پیشینِ تو»", old: "", "new": L5.t, why: "اصلاحِ خودش به دفتر رسید" }]); N5.ch = (N5.ch || []).concat(["دفترِ «کارِ پیشینِ تو»: " + L5.t]); }
            if (/رکوردی\s*ساخته\s*نشده|ثبت\s*نشده\s*بود|چیزی\s*(?:دیگری\s*)?عوض\s*نشد/.test(String(N5.res.note || ""))) N5.res.note = ""; delete N5.refused; N5.shown = ""; try { S.put(s5); } catch (e5) { } } } } catch (e) { }
      return r;
    };
    Object.keys(rawCS).forEach(function (k) { AS.DO.coach_state[k] = rawCS[k]; });
    AS.DO.coach_state._r23story = true;
  }
  AS.promptHooks = AS.promptHooks || [];
  /* ---------- دورِ ۲۵ (P5 «یک مرحله، یک مسئله»، B25·D12 = U13 oB1 p22، بانکِ مالک #16): مسئلهٔ تازه وسطِ گفت‌وگوی یک مسئلهٔ زندهٔ باز ----------
     ریشه: تا سشن به مسئلهٔ زندهٔ بازی بسته بود، هیچ پیامی «مسئلهٔ تازه» شمرده نمی‌شد (coachPhase0 ِ a27 همان اول برمی‌گشت) ⇒ «یه مسئله‌ی دیگه هم دارم … شام … خوابم
     نمی‌بره» دادهٔ مسئلهٔ بیداری شد و «# وضعِ کنونی» همان مسئلهٔ کهنه را نشان داد. حالا: پیامی که خودش می‌گوید مسئلهٔ دیگری دارد سشن را از مسئلهٔ زنده باز می‌کند
     (آن مسئله با نقشه، پرونده و مرحلهٔ خودش در 🔭 باز می‌ماند) و مسئلهٔ تازه با pk ِ خودش از «فهم» آغاز می‌شود — پیش از هر قلابِ دیگر (unshift)، تا همهٔ بلوک‌های
     همین نوبت یک مسئله ببینند. */
  /* «مشکل» این‌جا نیست: «یه مشکلِ دیگه هم هست: پمپ سه‌فاز می‌خواد» مانعِ همان مسئله است (بانکِ R25 #178)؛ «یه چیزِ دیگه / یه سؤالِ دیگه» هم نه (پرسش دربارهٔ همان یا خودِ سامانه) */
  /* دورِ ۲۶ (Q3، C26-12 pwC2 p23 «یه مسئلهٔ دیگه هم از همون دوره دارم: …»، p24 «و یه سومی: …»؛ oB1 p28 «یه مسئله‌ی سوم هم دارم که کلاً جداست: …»): میانِ «مسئلهٔ دیگه» و
     «دارم» چند واژه می‌آید و مسئلهٔ سوم با شماره‌اش معرفی می‌شود — همان معرفی است. («مشکل» و «چیز/سؤالِ دیگه» همچنان نه؛ بانکِ R25 #178) */
  var NEWPROB25 = /(?:یه|یک)\s*(?:مسئله|مساله)(?:ٔ|ی|‌ی)?\s*(?:دیگه|دیگر|تازه|جدید|جدا|دوم|سوم|چهارم|پنجم)(?:‌ای|ای)?\s*(?:(?:هم\s*)?(?:[^.!؟?\n:：،]{0,30}?\s)?(?:دارم|داریم|هست|پیش\s*اومده|پیش\s*آمده)(?![آ-ی])|[:：])|(?:^|[\s.!؟?،])(?:یه|یک)\s*(?:چیزِ?|موضوعِ?)\s*(?:تازه|جدید)\s*[:：]|(?:^|[\s.!؟?،])(?:یه|یک)\s*(?:دومی|سومی|چهارمی|پنجمی)\s*(?:هم\s*)?(?:دارم\s*)?[:：]/;
  ST.R26_QUARANTINE = { NEWPROB25: /(?:یه|یک)\s*(?:مسئله|مساله)(?:ٔ|ی|‌ی)?\s*(?:دیگه|دیگر|تازه|جدید|جدا)(?:‌ای|ای)?\s*(?:(?:هم\s*)?(?:دارم|داریم|پیش\s*اومده|پیش\s*آمده)(?![آ-ی])|[:：])|(?:^|[\s.!؟?،])(?:یه|یک)\s*(?:چیزِ?|موضوعِ?)\s*(?:تازه|جدید)\s*[:：]/ };   // قرنطینه (REMOVAL_CANDIDATES): الگوی دورِ ۲۵
  function newProbAt(t) {
    var T = String(t || ""), m = NEWPROB25.exec(T); if (!m) return -1;
    var st = T.lastIndexOf("\n", m.index), sb = Math.max(st, T.slice(0, m.index).search(/[.!؟?…][^.!؟?…]*$/)), pre = T.slice(sb + 1, m.index);
    if (/(?:^|\s)(?:اگه|اگر|وقتی|هر\s*وقت)\s/.test(pre)) return -1;   // «اگه یه مسئلهٔ دیگه هم بیارم/داشته باشم …؟» پرسش است، نه مسئلهٔ تازه
    var rest = T.slice(m.index + m[0].length); if (toks(rest).length < 2) return -1;
    return m.index;
  }
  ST.newProbIntro = function (t) { return newProbAt(t) >= 0; };
  /* پیامِ مرزی: جای آغازِ مسئلهٔ تازه در همین پیام (۰ یا منفی = مرزی نیست) — آنچه پیش از آن گفت مالِ مسئلهٔ پیشین است */
  /* پس از جدا شدن، تا خودش نام نبرد («برگردیم به مسئلهٔ اول»)، کانون همان مسئلهٔ تازهٔ گفت‌وگوست — حتی اگر صفحهٔ مسئلهٔ پیشین هنوز باز باشد.
     دورِ ۲۶ (C21): همین برای هر مسئله‌ای که از آن جدا شد (نه فقط آخرین) و برای کانونی که خودش با نام برگزید (C.focus26) تا وقتی صفحهٔ دیگری باز نکرده است. */
  ST.keepSplit = function (s, pid) { var C = (s && s.coach) || {}, F = C.focus26;
    if (F && F.id !== pid && F.page === pid) return true;
    return !!((C.split25 || []).some(function (X) { return X.from === pid; }) && !s.lprob && String(C.stmt || "")); };
  ST.splitOff = function (s, t) { var X = (((s && s.coach) || {}).split25 || []).slice().pop(); return X && X.key === nz(t).slice(0, 80) ? (X.off || 0) : -1; };

  /* ---------- دورِ ۲۶ (Q3 «یک مسئله، یک رکورد»، DECISIONS_R26 + C21؛ U12 = B26·D30 oB1 p29، B26x·D33 oB1 p23/p25، A26-51 oA1 p31، C26-12 pwC2 p23–p25) ----------
     ریشه: صفحه فقط «آخرین جدا شدن» را می‌شناخت (C.split25 ِ آخر، آن هم فقط اگر مسئلهٔ پیشین زنده و باز بود) و مسئلهٔ گفت‌وگوییِ پیشین را با مسئلهٔ تازه جایگزین می‌کرد.
     پس «برگردیم به مسئله‌ی بیداری» (مسئلهٔ بسته)، «برگردیم سرِ همون مسئله‌ی شام» (مسئلهٔ دوم از سه)، «برگردیم به مسئلهٔ تاس» (مسئلهٔ گفت‌وگویی) شنیده نمی‌شد و هر چه در
     همان پیام گفت زیرِ مسئله‌ای نشست که فقط «زنده» بود. حالا:
       • فهرستِ مسئله‌های همین گفت‌وگو (probs26): مسئله‌های زنده‌ای که این سشن ساخت یا به آن‌ها بسته بود (باز یا بسته) + مسئله‌های گفت‌وگویی، هر کدام با صورت/مرحله/دفترِ خودش
         (C.probs26[pk] — مسئلهٔ گفت‌وگوییِ پیشین دیگر با آمدنِ بعدی گم نمی‌شود)؛
       • نام‌بردن = قابِ صریحِ خودش («برگردیم به/سرِ …»، «… مسئلهٔ X»، «مسئلهٔ اول/دوم/قبلی»، یا سرِ پیام «… برای X:») + واژهٔ عنوان/صورتِ همان مسئله؛ واژهٔ مشترکِ بی‌قاب
         («صبح بیداری راحت بود» وسطِ مسئلهٔ شام) نام‌بردن نیست؛
       • یک نامزدِ یگانه ⇒ همان نوبت به آن بسته می‌شود (مسئلهٔ بسته هم: اصلاح و نتیجهٔ دیرآمده‌اش زیرِ خودش می‌نشیند)؛ دو نامزدِ هم‌تراز ⇒ صفحه می‌پرسد «کدام؟» و در آن نوبت
         چیزی از داستان ثبت نمی‌شود (C.ask26)؛ جوابِ او با نامِ یکی، همان را می‌بندد. */
  var CH_FA = function (t) { return clip(String(t || "").replace(/[«»]/g, ""), 50); };
  /* دو صورت یک مسئله‌اند؟ — بیشترِ واژه‌های معنادارِ صورتِ کوتاه‌تر در دیگری هست (همان نسبتِ sameStmt ِ a27: سه‌پنجم) */
  function sameProb26(a, b) { var ta = toks(a).filter(function (w, i, X) { return X.indexOf(w) === i; }), tb = toks(b).filter(function (w, i, X) { return X.indexOf(w) === i; }); if (!ta.length || !tb.length) return false;
    var sm = ta.length <= tb.length ? ta : tb, lg = sm === ta ? tb : ta, n = sm.filter(function (w) { return hit(w, lg); }).length; return n * 5 >= sm.length * 3; }
  /* مسئلهٔ گفت‌وگوییِ pk همان مسئلهٔ زنده شد؟ پنجرهٔ بریده (chatImp.cut) دو معنا دارد: مسئلهٔ زنده وسطِ پنجرهٔ مسئلهٔ دیگری آمد (oA1: «پیشنهادِ کار» وسطِ «دست‌دادن») — نه؛
     یا پنجره با سلام/پرسشی آغاز شده بود که مسئله نبود — آری. داور: صورتِ خودِ همان pk با صورتِ مسئلهٔ زنده یکی است یا نه. */
  function lived26(se, pk) { var o = "", C = (se && se.coach) || {}, P = (C.probs26 || {})[pk], st0 = P ? P.stmt : (String(C.pk || "") === pk ? C.stmt : "");
    S.all("eprog", function (pg) { var I = pg && pg.solve && pg.solve.live && pg.solve.live.chatImp; return !!(I && I.sess === (se && se.id) && I.pk === pk); }).forEach(function (pg) { var pid = String(pg.id).replace(/^eprog_/, ""), I = pg.solve.live.chatImp;
      /* بریده: یا صورت‌ها یکی‌اند، یا این pk پیش از آغازِ همان مسئله هیچ کارِ سنجیده‌ای از خودش نداشت (سلام، پرسشِ کلی) — وگرنه مسئلهٔ دیگری است */
      if (I.cut) { var r = A.liveRec && A.liveRec(pid), own = storyOf(se, pk).items.some(function (x) { return x.at && String(x.at) < String(I.from || ""); }); if (!r || (own && !(txt(st0) && sameProb26(st0, r.p.statement)))) return; } o = pid; });
    return o; }
  ST.lived26 = lived26;
  function snap26(s) {   // مسئلهٔ گفت‌وگوییِ کنونی در فهرست می‌ماند (صورت، مرحله، دفترِ پاسخ‌ها)
    var C = (s && s.coach) || null; if (!C || !/^c:/.test(String(C.pk || "")) || !txt(C.stmt)) return;
    try { if (AS.notProblem && AS.notProblem(String(C.stmtRaw24 || C.stmt))) return; } catch (e) { }
    var P = C.probs26 = C.probs26 || {}, o = P[C.pk] || { at: nowIso() };
    o.stmt = String(C.stmt); o.raw = String(C.stmtRaw24 || ""); o.ph = String(C.ph || "u"); o.st = Object.assign({}, C.st || {}); P[C.pk] = o;
  }
  function probs26(s) {
    var C = (s && s.coach) || {}, out = [], seen = {};
    var addL = function (pid, at) { if (!pid || seen[pid]) return; var r = A.liveRec && A.liveRec(pid); if (!r) return; seen[pid] = 1; var done = false; try { done = A.livePhase(pid) === "done"; } catch (e) { }
      out.push({ id: pid, kind: "live", title: String(r.p.title || ""), stmt: String(r.p.statement || ""), done: done, at: String(at || r.created || "") }); };
    try { (A.liveAll ? A.liveAll() : []).forEach(function (r) { if (r && r.sess === s.id) { var pg = S.get("eprog_" + r.p.id), I = pg && pg.solve && pg.solve.live && pg.solve.live.chatImp; addL(r.p.id, (I && I.from) || r.created); } }); } catch (e) { }
    (s.lprobLog || []).forEach(function (e) { if (e && e.p) addL(e.p, e.at); }); addL(s.lprob, s.lprobAt); (C.split25 || []).forEach(function (X) { addL(X.from, X.at); });
    Object.keys(C.probs26 || {}).forEach(function (pk) { var o = C.probs26[pk]; if (!o || !txt(o.stmt) || lived26(s, pk)) return;
      if (out.some(function (x) { return x.kind === "live" && sameProb26(x.stmt, o.stmt); })) return;   // همان مسئله که بعدتر در 🔭 ثبت شد
      out.push({ id: pk, kind: "chat", title: CH_FA(o.stmt), stmt: String(o.stmt), done: o.ph === "done", at: String(o.at || "") }); });
    out = out.filter(function (x, i) { return x.kind !== "chat" || !out.some(function (y, j) { return j !== i && y.kind === "chat" && nz(y.stmt) === nz(x.stmt) && (+String(y.id).replace(/^c:/, "") > +String(x.id).replace(/^c:/, "")); }); });   // همان صورت با دو شماره (a27 هم شماره داد) ⇒ یک مسئله
    out.sort(function (a, b) { return a.at < b.at ? -1 : a.at > b.at ? 1 : 0; });
    return out;
  }
  ST.probs26 = probs26;
  /* بستن/باز کردنِ سشن هنگامِ ساختِ پرامپت کمی پس از لحظهٔ پیامِ اوست؛ هر چیزِ همان پیام که با لحظهٔ پیام مهر می‌خورد (برنامهٔ خودت، پیش‌بینی) باید مالِ کانونِ تازه باشد ⇒
     ثبتِ دفترِ موضوع به لحظهٔ همان پیام برمی‌گردد (همان کارِ دورِ ۲۵ برای جدا شدن: e.s25) */
  function backdate26(s, key) { try { var um = lastUser(s); if (!um || !um.at || nz(um.text).slice(0, 80) !== key) return; (s.lprobLog || []).forEach(function (e) { if (e && String(e.at || "") > String(um.at) && String(e.at || "") <= nowIso()) { e.at = String(um.at); if (!e.p) e.s25 = 1; } }); if (s.lprob && s.lprobAt && String(s.lprobAt) > String(um.at)) s.lprobAt = String(um.at); } catch (e) { } }
  function focus26(s) {   // مسئله‌ای که این نوبت دربارهٔ آن است
    var C = (s && s.coach) || {}, b = null; try { b = AS.boundLive ? AS.boundLive(s) : null; } catch (e) { }
    if (b && !b.done) return b.pid; if (/^c:/.test(String(C.pk || "")) && txt(C.stmt) && !lived26(s, C.pk)) return String(C.pk);
    return b ? b.pid : "";
  }
  ST.focus26 = focus26;
  /* کانونِ این گفت‌وگو مسئلهٔ بسته‌ای است که خودش با نام به آن برگشت (تا وقتی مسئلهٔ دیگری نیاورد یا نام نبرد) */
  ST.namedClosed = function (s) { var C = (s && s.coach) || {}, F = C.focus26, b = null; try { b = AS.boundLive ? AS.boundLive(s) : null; } catch (e) { } return !!(F && F.why === "named" && b && b.done && b.pid === F.id) ? b.pid : ""; };
  var ORD26 = [[/اول(?:ی)?|نخست|یکم/, 0], [/دوم(?:ی)?/, 1], [/سوم(?:ی)?/, 2], [/چهارم(?:ی)?/, 3], [/پنجم(?:ی)?/, 4]];
  var DEIC26 = /^(?:این|همین|بالا|فعلی|کنونی|من|خودم|ما|حاضر|زنده|حل[‌\s]?نشده|واقعی|ریاضی|هندسه|احتمال|فیزیک|کتاب|درسی)$/;
  /* قاب‌های نام‌بردن؛ خروجی: [{ tail: واژه‌های پس از قاب, ord: شمارهٔ ترتیبی یا "prev"/"last", strong: قابِ «برگردیم» }] */
  function frames26(mt) {
    var T = String(mt || ""), out = [], m, re;
    var tailOf = function (x) { return txt(String(x || "").replace(/^[«"'\s]+/, "").split(/[.!؟?\n:：»]/)[0]); };
    re = /برگرد(?:یم|م|ید)?\s*(?:به|سرِ?|سراغِ?)\s+((?:همون|همان|اون|آن)\s+)?(مسئله(?:ٔ|ی|‌ی)?\s*)?([^\n]{0,70})/g;
    while ((m = re.exec(T))) out.push({ tail: tailOf(m[3]), prob: !!m[2], strong: true });
    re = /(?:^|[\s،؛(])(?:(?:اون|آن|همون|همان)\s+|(?:توی?|در|درباره(?:ٔ|ی|‌ی)?|در\s*موردِ?|راجع\s*به|برای|سرِ?)\s+(?:(?:اون|آن|همون|همان)\s+)?)مسئله(?:ٔ|ی|‌ی)?\s+([^\n]{2,70})/g;
    while ((m = re.exec(T))) out.push({ tail: tailOf(m[1]), prob: true });
    re = /(?:^|[\s،؛(])مسئله(?:ٔ|ی|‌ی)?\s*((?:اول(?:ی)?|قبلی|قبل|پیشین|دوم(?:ی)?|سوم(?:ی)?|چهارم(?:ی)?|تازه|جدید|بعدی))(?![آ-ی])/g;
    while ((m = re.exec(T))) if (!/(?:یه|یک)\s*$/.test(T.slice(0, m.index + 1))) out.push({ tail: m[1], prob: true });
    /* سرِ پیام، پیش از «:» — «یه پیش‌بینیِ تازه برای بیداری: …» (موضوعِ پیام را خودش اعلام می‌کند) */
    var head = T.split(/[:：]/)[0]; if (head.length < T.length && head.length <= 90 && !/[.!؟?\n]/.test(head)) { m = /(?:برای|واسه(?:ٔ|ی|‌ی)?|درباره(?:ٔ|ی|‌ی)?|در\s*موردِ?|راجع\s*به)\s+((?:همون|همان|اون|آن)\s+)?(?:مسئله(?:ٔ|ی|‌ی)?\s*)?([^:：]{2,40})$/.exec(head); if (m) out.push({ tail: txt(m[2]), head: true }); }
    /* بانکِ R26 #74 «واسه همون قفسه‌ها، پنجشنبه میرم چوب بخرم»: آغازِ پیام با «برای/واسه همون X،» — اشارهٔ «همون/اون» یعنی چیزی که پیش‌تر درباره‌اش حرف زده‌اند */
    m = /^[\s«]*(?:راستی[،,\s]+)?(?:برای|واسه(?:ٔ|ی|‌ی)?)\s+(?:همون|همان|اون|آن)\s+(?:مسئله(?:ٔ|ی|‌ی)?\s*)?([^،,:：.!؟?\n]{2,40})[،,]/.exec(T); if (m) out.push({ tail: txt(m[1]), head: true });
    /* بانکِ R26 #75 «حدسم دربارهٔ قبضِ آب اینه که …»: «دربارهٔ / در موردِ / راجع به X» هر جای پیام موضوع را خودش می‌گوید (برخلافِ «برای X» که هدفِ کار هم هست) */
    re = /(?:درباره(?:ٔ|ی|‌ی)?|در\s*موردِ?|راجع\s*به)\s+(?:(?:همون|همان|اون|آن)\s+)?(?!مسئله)([^\n]{2,50})/g;
    while ((m = re.exec(T))) out.push({ tail: tailOf(m[1]).split(/\s+/).slice(0, 4).join(" "), about: true });
    /* بانکِ R26 #87 «مسئلهٔ قفسه‌ها تموم شد، …»: «مسئلهٔ X» ِ بی‌پیشوند — فقط با واژهٔ عنوانِ همان مسئله (پایین: title) */
    re = /(?:^|[\s،؛(.!؟?])مسئله(?:ٔ|ی|‌ی)\s+(?!(?:اول|قبلی|قبل|پیشین|دوم|سوم|چهارم|تازه|جدید|بعدی|دیگه|دیگر|من|خودم|ما)(?![آ-ی]))([^\n]{2,50})/g;
    while ((m = re.exec(T))) { var pre0 = T.slice(Math.max(0, m.index - 14), m.index + 1); if (/(?:یه|یک|این|همین|اون|آن|همون|همان|توی?|در|برای|سرِ?|به|درباره(?:ٔ|ی|‌ی)?)\s*$/.test(pre0.replace(/[\s،؛(.!؟?]$/, " "))) continue; out.push({ tail: tailOf(m[1]).split(/\s+/).slice(0, 3).join(" "), bare: true }); }
    /* دورِ ۲۶ (C31 ِ DECISIONS_R26، ابهامِ ۹ ِ بانک — #89 «این هم مثلِ همون قفسه‌هاست …»): مسئله‌ای که فقط به تشبیه نام برده شد («مثلِ/شبیهِ/عینِ همون X») قابِ برگشت نیست؛
       قابِ دیگری که همان واژه‌ها را در دلِ تشبیه گرفته («… مثلِ همون مسئلهٔ قفسه‌ها») هم کنار می‌رود. داوری‌اش در named26FromList (like). */
    var LK = [], reL = /(?:^|[\s،؛(])(?:مثلِ?|مثل|شبیهِ?|عینِ?|مانندِ?|همانندِ?|نظیرِ?)\s+(?:(?:همون|همان|اون|آن)\s+)?(مسئله(?:ٔ|ی|‌ی)?\s*)?([^\n،,.!؟?؛:]{2,50})/g;
    while ((m = reL.exec(T))) LK.push({ tail: tailOf(m[2]), prob: !!m[1], like: true, at: m.index, end: m.index + m[0].length });
    if (LK.length) out = out.filter(function (f) { var q = T.indexOf(String(f.tail || "").slice(0, 12)); return !(q >= 0 && LK.some(function (l) { return q >= l.at && q <= l.end; })); }).concat(LK);
    /* دورِ ۲۷ (story R6، C30؛ C27-18 pwC2 «مهره‌ها رو حساب کردم: …»، B27·D15 oB1 «نتیجه‌ی آزمون شام: …»): نامِ کوتاهِ مسئله در سرِ پیام — بندِ پیش از «:» یا «X رو/را» ِ آغازِ پیام —
       فقط با واژه‌ای که یکتا مالِ یک مسئلهٔ دیگرِ همین گفت‌وگوست (داوری در run26: subj). پیش‌تر بی قابِ «برگردیم/مسئلهٔ …» نوبت سرِ مسئلهٔ پیشین می‌ماند و نتیجه زیرِ آن می‌نشست. */
    var hd27 = T.split(/[:：]/)[0]; if (hd27.length < T.length) { var cl27 = txt(hd27.split(/[.!؟?\n،,؛]/).pop()); if (cl27 && toks(cl27).length && toks(cl27).length <= 4 && !/(?:^|\s)(?:می[‌\s]?\S+|\S+(?:یدم|ید|اد|ادم|ردم|رد|فتم|فت|ستم|شتم|شت|شد|شدم|گذشت|دارم|داره|هستم|بودم|بود))(?=\s|$)/.test(cl27)) out.push({ tail: cl27, subj: true }); }
    m = /^[\s«]*(?:سلام[،,!.\s]+)?((?:[^\s،,.:：!؟?]{2,}\s+){0,2}[^\s،,.:：!؟?]{2,})\s+(?:رو|را)(?![آ-ی])/.exec(T); if (m && !/(?:برگرد|مسئله)/.test(m[1])) out.push({ tail: txt(m[1]), subj: true, strict: true });
    /* «حالا مهره‌ها» (بانکِ R27 #254): پیامِ کوتاهی که جز نامِ مسئله چیزی ندارد */
    var sh27 = txt(T.replace(/^[\s«]*(?:خب|خوب|پس|حالا|بریم|بریم\s*سراغِ?|سراغِ?)\s*/g, "").replace(/[.!؟?»]+$/, "")); if (sh27 && !/[0-9۰-۹:：]/.test(sh27) && toks(sh27).length && toks(sh27).length <= 2) out.push({ tail: sh27, subj: true, strict: true });
    out.forEach(function (f) { var w0 = nz(f.tail).split(" ")[0] || ""; if (f.prob || f.strong) { ORD26.forEach(function (o) { if (new RegExp("^(?:" + o[0].source + ")$").test(w0)) f.ord = o[1]; }); if (/^(?:قبلی|قبل|پیشین)$/.test(w0)) f.ord = "prev"; if (/^(?:تازه|جدید|بعدی|آخر|آخری)$/.test(w0)) f.ord = "last"; } f.deic = DEIC26.test(w0); });
    return out.filter(function (f) { return !f.deic && (f.ord != null || toks(f.tail).length); });
  }
  /* هم‌واژگیِ نام: همان ریشه، یا پیشوندِ دست‌کم چهارحرفی — «خواب» با «می‌خوام» یکی نیست (hit ِ عمومی با ریشهٔ سه‌حرفیِ «خوا» یکی می‌گرفت) */
  /* واژه‌های زمان/شمار/کلی نامِ مسئله نیستند («یه هفته گذشت:» ≠ «ورزشِ … هفته‌ای دو بار») */
  var GEN27 = /^(?:هفته|روز|ساعت|دقیقه|ماه|سال|امروز|دیروز|فردا|دیشب|امشب|شب|صبح|ظهر|عصر|بار|نفر|دفعه|نتیجه|جواب|حساب|آزمون|داده|مسئله|سؤال|سوال|پرسش|چیز|کار|برنامه|طرح|حدس|پیش‌بینی|پیش|بینی|خبر|گزارش|مهم|ترین|اول|دوم|سوم|آخر|بعد|قبل|همه|کل)$/;
  function hit26(w, T) { var a = stem(w); return T.some(function (x) { var b = stem(x); return a === b || (a.length >= 4 && b.length >= 4 && (a.indexOf(b) === 0 || b.indexOf(a) === 0)); }); }
  /* کدام مسئلهٔ این گفت‌وگو را نام برد؟ { to: مسئله } | { ask: [مسئله‌ها] } | null (نام نبرد، یا همان مسئلهٔ کنونی را گفت) */
  function named26(s, mt) { return named26FromList(probs26(s), focus26(s), mt, s); }
  function named26FromList(P, cur, mt, s) {
    var FR0 = frames26(mt); if (!FR0.length) return null;
    var C = (s && s.coach) || {}; if (P.length < 2 && !(P.length === 1 && P[0].id !== cur)) return null;
    var LK = FR0.filter(function (f) { return f.like; }), r = run26(FR0.filter(function (f) { return !f.like; }));
    if (r || !LK.length) return r;
    /* C31: تشبیه نوبت را جابه‌جا نمی‌کند. فقط اگر همان پیام (بیرون از بندِ تشبیه) داده یا نتیجه‌ای دارد که متن نمی‌گوید مالِ کدام است ⇒ صفحه می‌پرسد (کنونی + نام‌برده) */
    var L = run26(LK.map(function (f) { return Object.assign({}, f, { strong: false }); })); if (!L || !(L.to || (L.ask && L.ask.length))) return null;
    var rest = String(mt || ""); LK.slice().reverse().forEach(function (l) { var e = rest.slice(l.end).search(/[\n،,.!؟?؛:]/); rest = rest.slice(0, l.at) + " " + (e < 0 ? "" : rest.slice(l.end + e)); });
    if (!/[0-9۰-۹]/.test(rest) && !/(?:^|\s)(?:جواب|نتیجه)/.test(rest)) return null;
    var tg = L.to ? [L.to] : L.ask, cp = P.filter(function (x) { return x.id === cur; })[0], RW = toks(rest).filter(function (w) { return w.length >= 3; });
    var hitsOf = function (x) { var X = toks(x.title + " " + x.stmt); return RW.some(function (w) { return hit26(w, X) && !tg.some(function (y) { return y !== x && hit26(w, toks(y.title + " " + y.stmt)); }) && !(cp && x !== cp && hit26(w, toks(cp.title + " " + cp.stmt))); }); };
    if (cp && hitsOf(cp)) return null;   // بندِ داده خودش واژهٔ مسئلهٔ کنونی را دارد ⇒ همان
    return { ask: (cp ? [cp] : []).concat(tg.filter(function (x) { return x !== cp; })), frame: LK[0], like: true };
    function run26(FR) {
    for (var i = 0; i < FR.length; i++) { var f = FR[i], c = null;
      /* C30 (دورِ ۲۷): نامِ کوتاه در سرِ پیام — واژه‌ای (≥ ۳ حرف) که فقط به یک مسئلهٔ این گفت‌وگو می‌خورد و آن مسئلهٔ کنونی نیست ⇒ همان؛ وگرنه این قاب چیزی نمی‌گوید */
      if (f.subj) { var Ws = toks(f.tail).filter(function (w) { return w.length >= 3 && !GEN27.test(stem(w)); }), TX = P.map(function (x) { return toks(String(x.title || "").replace(/\s*\S*…$/, "")).filter(function (w) { return w.length >= 3; }); });   /* واژهٔ بریدهٔ آخرِ عنوان («… یه مه…») نام نیست */   /* فقط واژهٔ عنوان (نام)، نه هر واژهٔ صورت: «مهم‌ترین داده:» نامِ مسئلهٔ «… دست داده» نیست */
        var hs = P.filter(function (x, k) { return Ws.some(function (w) { return hit26(w, TX[k]) && !TX.some(function (o, j) { return j !== k && hit26(w, o); }); }); });
        /* «X رو …»: همهٔ واژه‌های X نامِ همان مسئله‌اند («مهره‌ها رو»)، نه «قفسهٔ کتابام رو» (بانکِ R26 #97) */
        if (f.strict && hs.length === 1) { var hk = P.indexOf(hs[0]); if (!Ws.every(function (w) { return hit26(w, TX[hk]); })) hs = []; }
        if (hs.length === 1 && hs[0].id !== cur && !(cur && Ws.some(function (w) { var ci = P.map(function (x) { return x.id; }).indexOf(cur); return ci >= 0 && hit26(w, TX[ci]); }))) return { to: hs[0], frame: f };
        continue; }
      /* بانکِ R26 #85 «برگردیم به اون مسئلهٔ قبلی» با چند مسئلهٔ پیشین: صفحه حدس نمی‌زند — یک مسئلهٔ دیگر ⇒ همان؛ بیشتر ⇒ می‌پرسد */
      if (f.ord === "prev") { var O0 = P.filter(function (x) { return x.id !== cur; }); if (O0.length === 1) c = O0[0]; else if (O0.length > 1) return { ask: O0, frame: f }; }
      else if (f.ord === "last") c = P[P.length - 1] || null;
      else if (f.ord != null) c = P[f.ord] || null;
      if (c) { if (c.id === cur) return null; return { to: c, frame: f }; }
      var W = toks(f.tail).slice(0, 6), sc = P.map(function (x) { var X = toks(x.title + " " + x.stmt); return { p: x, n: W.filter(function (w) { return w.length >= 3 && hit26(w, X); }).length }; });
      var others = sc.filter(function (z) { return z.p.id !== cur; }), mx = Math.max.apply(null, [0].concat(others.map(function (z) { return z.n; }))), me = (sc.filter(function (z) { return z.p.id === cur; })[0] || { n: 0 }).n;
      /* بانکِ R26 #99 «برگردیم به مسئلهٔ ماشین» (رکوردی به این نام نیست): نه بستن به رکوردی، نه نشستن زیرِ مسئلهٔ زنده — صفحه می‌پرسد کدام، یا مسئلهٔ تازه است */
      if (!mx) { if (f.strong && f.prob && !me && toks(f.tail).length) return { ask: [], unknown: clip(f.tail, 40), frame: f }; continue; }
      if (!f.strong && me >= mx) continue;
      /* دورِ ۲۷ (story R6، C30؛ B27·D15 oB1 «برگردیم به مسئله‌ی بیداری ساعت ۶» وقتی کانون همان بیداری بود ⇒ صفحه به «شام» بست): نامی که به مسئلهٔ کنونی بیشتر می‌خورد
         جابه‌جایی نیست؛ برابر ⇒ صفحه می‌پرسد (کنونی + بهترینِ دیگر)، هرگز حدس نمی‌زند */
      if (f.strong && me > mx) return null;
      if (f.strong && me && me === mx) { var cpe = P.filter(function (x) { return x.id === cur; })[0]; return { ask: (cpe ? [cpe] : []).concat(others.filter(function (z) { return z.n === mx; }).map(function (z) { return z.p; })), frame: f }; }
      if (f.bare || f.about) { var byT0 = others.filter(function (z) { var X = toks(z.p.title); return W.some(function (w) { return w.length >= 3 && hit26(w, X); }); }); if (!byT0.length) continue; }   // بی قابِ صریح، فقط واژهٔ عنوان   // بی «برگردیم»، واژه‌ای که به مسئلهٔ کنونی هم می‌خورد نام‌بردنِ دیگری نیست
      var best = others.filter(function (z) { return z.n === mx; }).map(function (z) { return z.p; });
      if (best.length === 1) return { to: best[0], frame: f };
      /* عنوان مقدم بر صورت: «مسئلهٔ تاس» ⇐ مسئله‌ای که عنوانش تاس دارد، نه هر صورتی که تاس را نام برد */
      var byT = best.filter(function (x) { var X = toks(x.title); return W.some(function (w) { return w.length >= 3 && hit26(w, X); }); }); if (byT.length === 1) return { to: byT[0], frame: f };
      return { ask: best, frame: f };
    }
    return null;
    }
  }
  ST.named26 = named26;
  function focusTo26(s, c, why) {
    var C = s.coach = s.coach || {}, b = null; try { b = AS.boundLive ? AS.boundLive(s) : null; } catch (e) { }
    var cur = focus26(s); snap26(s);
    (C.focusLog26 = C.focusLog26 || []).push(cur); if (C.focusLog26.length > 40) C.focusLog26 = C.focusLog26.slice(-40);
    var st = A.state || {};
    C.focus26 = { id: c.id, at: nowIso(), why: why || "named", page: st.view === "lprob" && st.arg && st.arg !== c.id ? st.arg : "" };
    if (c.kind === "live") { if (A.liveBindSession) A.liveBindSession(c.id, s, { force: true });
      if (c.done) { C.closedPid = c.id; C.ph = ""; C.st = {}; C.stmt = ""; C.stmtRaw24 = ""; C.gen = pkMax26(C) + 1; C.pk = "c:" + C.gen; } }
    else { if (s.lprob && A.liveUnbindSession) A.liveUnbindSession(s);
      var o = (C.probs26 || {})[c.id] || {}; C.gen = +String(c.id).replace(/^c:/, "") || 0; C.pk = c.id; C.stmt = String(o.stmt || ""); C.stmtRaw24 = String(o.raw || ""); C.ph = String(o.ph || "u"); C.st = Object.assign({}, o.st || {}); delete C.prev; }
    try { S.put(s); } catch (e) { }
  }
  function pkMax26(C) { var mx = +C.gen || 0; Object.keys(C.probs26 || {}).concat(Object.keys(C.story || {})).concat((C.pkLog || []).map(function (e) { return e.pk; })).forEach(function (k) { var m = /^c:(\d+)$/.exec(String(k)); if (m && +m[1] > mx) mx = +m[1]; }); return mx; }
  /* برگشتن میانِ مسئله‌های همین گفت‌وگو — قاعدهٔ دورِ ۲۵ (فقط آخرین جدا شدن، فقط مسئلهٔ زندهٔ باز) قرنطینه است: ST.R26_QUARANTINE.switchTo (REMOVAL_CANDIDATES) */
  var BACK25 = /برگرد(?:یم|م|ید)?\s*(?:به|سرِ?|سراغِ?)|مسئله(?:ٔ|ی|‌ی)?\s*(?:اول(?:ی)?|قبلی|قبل|پیشین|دوم(?:ی)?|تازه|جدید|بعدی)(?![آ-ی])|(?:اون|آن|همون|همان)\s*مسئله(?:ٔ|ی|‌ی)?(?![آ-ی])/;
  function switchTo(s, mt) {
    var C = (s && s.coach) || {}, X = (C.split25 || []).slice().pop(); if (!X || !BACK25.test(mt)) return "";
    var r = A.liveRec && A.liveRec(X.from); if (!r || (A.livePhase && A.livePhase(X.from) === "done")) return "";
    var T = toks(mt), a = toks(r.p.title + " " + r.p.statement), b2 = toks(String(C.stmt || ""));
    var ha = T.filter(function (w) { return hit(w, a) && !hit(w, b2); }).length, hb = T.filter(function (w) { return hit(w, b2) && !hit(w, a); }).length;
    var first = /مسئله(?:ٔ|ی|‌ی)?\s*(?:اول(?:ی)?|قبلی|قبل|پیشین)(?![آ-ی])/.test(mt), second = /مسئله(?:ٔ|ی|‌ی)?\s*(?:دوم(?:ی)?|تازه|جدید|بعدی)(?![آ-ی])/.test(mt);
    if (first && !second) return "live"; if (second && !first) return "chat";
    return ha > hb ? "live" : hb > ha ? "chat" : "";
  }
  ST.R26_QUARANTINE.switchTo = switchTo;
  function nameFa26(x) { return "«" + CH_FA(x.title || x.stmt) + "»" + (x.kind === "live" ? (x.done ? " (ثبت‌شده در 🔭 — بسته)" : " (ثبت‌شده در 🔭)") : " (مسئلهٔ همین گفت‌وگو)"); }
  function splitNote(s) {
    var C = (s && s.coach) || {}, P = probs26(s), cur = focus26(s), out = [];
    var X = (C.split25 || []).slice().pop(), r = X && X.from && A.liveRec ? A.liveRec(X.from) : null;
    var multi = P.length >= 2 && ((C.split25 || []).length || C.focus26 || C.ask26 || P.filter(function (x) { return !x.done; }).length >= 2);
    if (!multi) return "";
    out.push((P.length === 2 ? "# دو مسئله در این گفت‌وگو" : "# چند مسئله در این گفت‌وگو (" + fa(P.length) + ")") + " (صفحه جدا نگهشان می‌دارد)");
    if (r && !s.lprob && String(C.stmt || "")) out.push("- زمینه (نه پرسشِ دوم): مسئلهٔ زندهٔ «" + clip(r.p.title, 60).replace(/[«»]/g, "") + "» سرِ جای خودش باز است — نقشهٔ مسیر، پرونده و مرحلهٔ خودش را دارد ({\"do\":\"go\",\"view\":\"route\",\"arg\":\"" + X.from + "\"}) و چیزی از مسئلهٔ تازه در آن نوشته نمی‌شود. "
      + "مسئلهٔ تازه‌ای که آورد مسئلهٔ همین گفت‌وگوست و از «فهم» آغاز می‌شود؛ نقشه و پرونده‌اش مالِ همین گفت‌وگوست ({\"do\":\"go\",\"view\":\"route\",\"arg\":\"" + s.id + "\"}) و اگر خواست در 🔭 جدا ثبت می‌شود. کارنامهٔ ذهن یکی است و هر رویدادش نشانیِ مسئلهٔ خودش را دارد. هرگز دادهٔ یکی را به دیگری نسبت نده.");
    out.push("- زمینه (نه پرسشِ دوم): مسئله‌های این گفت‌وگو به ترتیبِ آمدن: " + P.map(function (x, i) { return fa(i + 1) + ") " + nameFa26(x) + (x.id === cur ? " ⟵ کانونِ همین نوبت" : ""); }).join("؛ ") + ". هر نتیجه، طرح، حدس، پیش‌بینی یا اصلاحِ این نوبت فقط به کانونِ همین نوبت نسبت داده می‌شود؛ او با نام‌بردنِ هر کدام («برگردیم به مسئلهٔ …») کانون را عوض می‌کند.");
    var F = C.focus26, um = lastUser(s);
    if (F && F.why === "named" && F.id === cur) { var c = P.filter(function (x) { return x.id === cur; })[0]; if (c) out.push("- زمینه (نه پرسشِ دوم): او " + (F.key === nz((um && um.text) || "").slice(0, 80) ? "در همین پیام " : "") + "با نام به " + nameFa26(c) + " برگشت — صفحه همین نوبت را به آن بست" + (c.kind === "live" && c.done ? "؛ این مسئله بسته است: اصلاح، نتیجهٔ دیرآمده یا سرانجامِ پیش‌بینی‌اش زیرِ همان می‌نشیند و پرسشِ فهم/طرح ندارد" : "") + ". دربارهٔ مسئلهٔ دیگری پرسش نکن.");
      /* بانکِ R26 #88 (پرسش دربارهٔ مسئلهٔ بستهٔ نام‌برده): صورت، داده‌ها و جوابِ همان مسئله در پرامپتِ همین نوبت — جواب از دادهٔ مسئلهٔ زندهٔ دیگر ساخته نمی‌شود */
      if (c && c.kind === "live" && c.done) { try { var pgc = S.get("eprog_" + c.id), soc = (pgc && pgc.solve) || {}, Lc = soc.live || {}, u1c = (soc.u && soc.u[1]) || {}, dlc = (u1c.dl || []).map(function (x) { return txt(x.t); }).filter(Boolean), solc = txt((Lc.chat && Lc.chat.solution) || (soc.b && soc.b[1] && soc.b[1].ans) || "");
          out.push("- زمینه (نه پرسشِ دوم): رکوردِ همان مسئله — صورت: «" + clip(c.stmt, 240) + "»" + (dlc.length ? " · داده‌ها: " + dlc.slice(0, 6).map(function (x) { return "«" + clip(x, 80) + "»"; }).join("، ") : "") + (solc ? " · جوابِ ثبت‌شده: «" + clip(solc, 200) + "»" : "") + "."); } catch (e) { } } }
    var Q = C.ask26; if (Q && Q.open && Q.unknown) out.push("- **پرسشِ این نوبت همین است:** او مسئله‌ای را نام برد («" + Q.unknown + "») که در این گفت‌وگو رکوردی به این نام ندارد. فقط بپرس منظورش کدام‌یک از مسئله‌های بالاست یا مسئلهٔ تازه‌ای است — و در این نوبت هیچ نتیجه، طرح، حدس، گام یا اصلاحی گزارش نکن و چیزی نساز (coach_state با said: [] و بی result/plan/guess/retract؛ بی live_new)؛ پس از جوابش همان حرف زیرِ مسئلهٔ درست می‌نشیند.");
    else if (Q && Q.open) { var cs = P.filter(function (x) { return Q.cands.indexOf(x.id) >= 0; });
      out.push("- **پرسشِ این نوبت همین است:** او مسئله‌ای را نام برد که به " + fa(cs.length) + " مسئلهٔ این گفت‌وگو می‌خورد (" + cs.map(nameFa26).join("، ") + ") و صفحه نمی‌تواند یکی را برگزیند. فقط بپرس «منظورت کدام است؟» با نامِ همین‌ها — و در این نوبت هیچ نتیجه، طرح، حدس، گام یا اصلاحی گزارش نکن (coach_state با said: [] و بی result/plan/guess/retract)؛ پس از جوابش همان حرف زیرِ مسئلهٔ درست می‌نشیند."); }
    return out.join("\n");
  }
  ST.splitNote26 = splitNote;
  var PK0 = {};
  AS.promptHooks.unshift(function (s, msg) {
    try { var mt = String(msg || ""); if (!s || /^\s*\[/.test(mt)) return "";
      var b = AS.boundLive ? AS.boundLive(s) : null, C = s.coach = s.coach || {}, np = newProbAt(mt), key = nz(mt).slice(0, 80);
      snap26(s); PK0[s.id] = String(C.pk || "");
      /* پرسشِ «کدام؟» ِ نوبتِ پیش: جوابِ او با نامِ یکی از همان‌ها (بی قاب) همان را می‌بندد؛ وگرنه پرسش کنار می‌رود */
      var Q = C.ask26; if (Q && Q.open && Q.key !== key) { Q.open = false; var PA = probs26(s).filter(function (x) { return Q.cands.indexOf(x.id) >= 0; }), TW = toks(mt);
        var scA = PA.map(function (x) { var X = toks(x.title + " " + x.stmt), O = toks(PA.filter(function (y) { return y !== x; }).map(function (y) { return y.title + " " + y.stmt; }).join(" ")); return { p: x, n: TW.filter(function (w) { return w.length >= 3 && hit26(w, X) && !hit26(w, O); }).length }; }), mxA = Math.max.apply(null, [0].concat(scA.map(function (z) { return z.n; }))), bA = scA.filter(function (z) { return z.n === mxA && mxA > 0; });
        var fo = frames26("برگردیم به مسئلهٔ " + mt.replace(/^[\s«]*(?:همون|همان|اون|آن)?\s*/, ""))[0], oi = fo && typeof fo.ord === "number" ? PA[fo.ord] : null;
        if (bA.length === 1 || oi) { focusTo26(s, oi || bA[0].p, "named"); C.focus26.key = key; C.focus26.ans = true; backdate26(s, key); b = AS.boundLive ? AS.boundLive(s) : null; } try { S.put(s); } catch (e) { } }
      if (np >= 0 && ((b && !b.done && b.pid) || (/^c:/.test(String(C.pk || "")) && txt(C.stmt) && !lived26(s, C.pk) && !(C.split25 || []).some(function (X) { return X.key === key; })))) {
        var from = b && !b.done ? b.pid : "", fromPk = from ? "" : String(C.pk), PL0 = probs26(s), cur0 = focus26(s);
        if (from && A.liveUnbindSession) A.liveUnbindSession(s);
        var m25 = NEWPROB25.exec(mt), rest25 = txt(mt.slice(np + m25[0].length).replace(/^(?:\s*که\s[^:：.!؟?\n]{0,90})?\s*[:：،.]\s*/, ""));
        (C.focusLog26 = C.focusLog26 || []).push(from || fromPk);
        C.gen = pkMax26(C) + 1; C.pk = "c:" + C.gen; C.ph = "u"; C.st = {}; C.stmt = clip(rest25, 400); C.stmtRaw24 = clip(rest25, 400); C.inh = C.inh || "new"; delete C.prev;
        var pre26 = ""; try { var Np = np > 0 ? named26FromList(PL0, cur0, mt.slice(0, np)) : null; if (Np && Np.to && Np.to.kind === "live") pre26 = Np.to.id; } catch (e) { }
        (C.split25 = C.split25 || []).push({ from: from, fromPk: fromPk, pk: C.pk, at: nowIso(), key: key, off: np, pre: pre26 }); C.focus26 = { id: C.pk, at: nowIso(), why: "new", page: "" }; snap26(s); try { S.put(s); } catch (e) { }
      } else if (np < 0 && !(C.focus26 && C.focus26.key === key) && !(C.ask26 && C.ask26.key === key)) {   // همان پیام دو بار سنجیده نمی‌شود (پرامپتِ بازنویسی/وارسی همان نوبت است)
        var N = named26(s, mt);
        if (N && N.to) { focusTo26(s, N.to, "named"); C.focus26.key = key; backdate26(s, key); try { S.put(s); } catch (e) { } }
        else if (N && N.ask) { C.ask26 = { open: true, key: key, at: nowIso(), cands: (N.ask.length ? N.ask : probs26(s)).map(function (x) { return x.id; }), unknown: N.unknown || "" }; try { S.put(s); } catch (e) { } }
      }
      return splitNote(s);
    } catch (e) { try { console.warn(e); } catch (e2) { } return ""; }
  });
  /* پس از هر قلابِ دیگر (coachPhase0 ِ a27 مسئلهٔ گفت‌وگوییِ تازه را خودش هم می‌شناسد و شماره می‌دهد): شمارهٔ مسئلهٔ تازه هرگز روی شمارهٔ مسئلهٔ دیگری نمی‌نشیند، و مسئلهٔ کنونی در فهرست ثبت می‌شود */
  AS.promptHooks.push(function (s) { try { var C = (s && s.coach) || null; if (!C) return "";
      var o = (C.probs26 || {})[C.pk], p0 = PK0[s.id]; delete PK0[s.id];
      if (o && p0 != null && p0 !== String(C.pk) && /^c:/.test(String(C.pk)) && txt(C.stmt) && nz(o.stmt) !== nz(C.stmt)) { var old = String(C.pk); C.gen = pkMax26(C) + 1; C.pk = "c:" + C.gen; if (C.prev && C.prev.pk === old) C.prev.pk = C.pk; }
      snap26(s); } catch (e) { } return ""; });
  AS.afterTurnHooks = AS.afterTurnHooks || [];
  AS.afterTurnHooks.push(function (s) { try { snap26(s); } catch (e) { } });
  AS.promptHooks.push(function (s) { try { var um = lastUser(s); if (um) pkLog(s, um.at); } catch (e) { } return ""; });
  /* دورِ ۲۶ (Q3 «با دو پیش‌بینیِ باز، سرانجامِ گزارش‌شده پیش‌بینیِ خودش را نام می‌برد یا صفحه می‌پرسد»؛ بانکِ R26 #79 «پیش‌بینیم درست درومد!» با دو 🎯 ِ باز):
     حرفِ او سرانجامِ یک پیش‌بینی را می‌گوید، بیش از یک پیش‌بینیِ بازِ همین گفت‌وگو هست و نه اطمینانی که گفت نه واژه‌هایش یکی را نشان نمی‌دهد ⇒ پرسشِ این نوبت «کدام؟» با نامِ هر دو؛ تا جوابش هیچ‌کدام داوری نمی‌شود (داوریِ بی‌نشانه را a41 PR.predFor خودش نمی‌کند). */
  AS.promptHooks.push(function (s, msg) { try { var mt = String(msg || ""), PR0 = A.PR; if (!s || /^\s*\[/.test(mt) || !PR0 || !PR0.predVerdictIn || !PR0.predFor) return "";
      var v = PR0.predVerdictIn(mt); if (!v) return ""; var C = s.coach || {}, um = lastUser(s), at = um ? String(um.at || "") : "";
      var PD = (C.preds || []).filter(function (x) { return x && x.text && !x.out && String(x.at || "") !== at; }); if (PD.length < 2) return "";
      var pc = PR0.pctOf25 ? PR0.pctOf25(v.sent || mt) : null, keep = C.preds; C.preds = PD; var one = null; try { one = PR0.predFor(s, mt, pc, false); } finally { C.preds = keep; } if (one) return "";
      if (pc != null && PD.some(function (x) { var xp = x.p != null ? x.p : (PR0.pctOf25 ? PR0.pctOf25(x.text) : null); return xp === pc; })) return "";
      return "# کدام پیش‌بینی؟\n- **پرسشِ این نوبت همین است:** او سرانجامِ یک پیش‌بینی را گفت ولی " + fa(PD.length) + " پیش‌بینیِ باز در این گفت‌وگو هست (" + PD.slice(0, 4).map(function (x) { var xp = x.p != null ? x.p : (PR0.pctOf25 ? PR0.pctOf25(x.text) : null); return "«" + clip(x.text, 70) + "»" + (xp != null ? " — " + fa(xp) + "٪" : ""); }).join("، ") + ") و صفحه نمی‌تواند یکی را برگزیند. فقط بپرس «کدام پیش‌بینی را می‌گویی؟» با نامِ همین‌ها؛ تا جوابش هیچ پیش‌بینی‌ای داوری نمی‌شود — در این نوبت practice_log یا داوریِ 🎯 نفرست.";
    } catch (e) { return ""; } });
  AS.afterTurnHooks = AS.afterTurnHooks || [];
  AS.afterTurnHooks.push(function (s) { try { var um = lastUser(s); if (um) { pkLog(s, um.at); S.put(s); } } catch (e) { } });

  /* ---------- مقصد، مبدأ، طرحِ همین مسئله (برای «🧭» و نوار) ---------- */
  /* دورِ ۲۶ (Q6، U32 s15 «مقصد: چیکار کنم؟»، D25-25 aD4 «مقصد: چطور شروع کنم؟»، B26x tB1x «از کجا شروع کنم؟»): پرسشِ روش («چطور شروع کنم؟»، «چیکار کنم؟»، «میشه؟») مقصدِ مسئله
     نیست — مقصد خواستهٔ اوست. آخرین جملهٔ پرسشیِ صورت که پرسشِ روش نیست؛ اگر جز پرسشِ روش پرسشی نبود ⇒ هیچ (فراخواننده «خواستهٔ …» می‌گوید). */
  var METHODQ26 = /^(?:خب|پس|حالا|الان|من|باید|\s)*(?:(?:از\s*کجا|چطور(?:ی)?|چجور(?:ی)?|چه[‌\s]?جوری|چگونه)\s*(?:باید\s*)?(?:شروع(?:ش)?\s*کنم|برم\s*جلو|پیش\s*برم|حلش\s*کنم|ادامه\s*بدم)|(?:چیکار|چی\s*کار|چه\s*کار(?:ی)?)\s*(?:باید\s*)?(?:کنم|بکنم|کنیم)|می[‌\s]?شه|میشه|درسته|خوبه)\s*[؟?]*$/;
  ST.methodQ26 = function (t) { return METHODQ26.test(txt(t)); };
  /* بانکِ R26 #167/#168: صورتی که جز پرسشِ روش پرسشی ندارد ⇒ مقصد از خودِ مسئله: جملهٔ خواسته («می‌خوام …»)، وگرنه نخستین جمله‌ای که پرسشِ روش و سلام نیست */
  function goalSentence26(t) { var S0 = sentences(String(t || "")).map(function (x) { return txt(x).replace(/[.!…]+$/, ""); }).filter(function (x) { return toks(x).length >= 2 && !METHODQ26.test(x) && !/^(?:سلام|درود|وقت\s*بخیر)(?![آ-ی])/.test(x) && !/^برای\s*این[‌\s]*که\s/.test(x); });
    return S0.filter(function (x) { return UNKMARK24.test(x) || /می[‌\s]?خوا(?:م|هم|یم)(?![آ-ی])/.test(x); })[0] || S0[0] || ""; }
  /* دورِ ۲۷b (history، C27-6 pC2 p13): پرسشِ دربارهٔ خودِ صفحه/سامانه («سامانه روشی برای این داره؟») خواستهٔ مسئله نیست — مقصدِ 🧭 نمی‌شود (پرسش‌های صفحه هم مسئله نیستند، R6) */
  var METAQ27 = /(?:^|[\s،])(?:سامانه|صفحه|این\s*(?:برنامه|اپ|سایت|ابزار))(?![آ-ی])[^؟?]{0,50}(?:(?:روش|راه|ابزار|امکان|بخش)\S*\s*(?:ی\s*)?[^؟?]{0,25}(?:داره|داری|دارد|هست)|می[‌\s]?تونه|بلده)\s*[؟?]\s*$/;
  ST.metaQ27 = function (t) { return METAQ27.test(txt(t)); };
  function qSentence(t) { var L = String(t || "").match(/[^.!؟?\n]*[؟?]/g) || []; L = L.map(txt).filter(function (x) { return toks(x).length >= 1 && !METHODQ26.test(x) && !METAQ27.test(x); }); return L.length ? L[L.length - 1] : ""; }
  ST.R26_QUARANTINE.qSentence = function (t) { var L = String(t || "").match(/[^.!؟?\n]*[؟?]/g) || []; L = L.map(txt).filter(function (x) { return toks(x).length >= 1; }); return L.length ? L[L.length - 1] : ""; };   // قرنطینه: آخرین جملهٔ پرسشی، هر چه باشد
  ST.stmtOfSess = function (se) { var C = (se && se.coach) || {}; if (txt(C.stmt)) return txt(C.stmt); var f = ((se && se.msgs) || []).filter(isUser)[0]; return f ? txt(f.text) : ""; };
  ST.dest = function (rid) {
    if (rid.pid) {
      var pg = S.get("eprog_" + rid.pid), so = (pg && pg.solve) || {}, L = so.live || {}, u = (so.u && so.u[1]) || L.uDraft || {}, r = A.liveRec && A.liveRec(rid.pid);
      if (txt(u.u)) return clip(u.u, 100);
      if (L.chatUnk && txt(L.chatUnk.t)) return clip(L.chatUnk.t, 100);
      var q = r ? qSentence(r.p.statement) : ""; if (q) return clip(q, 100);
      return r ? "خواستهٔ «" + clip(r.p.title, 60) + "»" : "خواستهٔ مسئله";   // مسئلهٔ ثبت‌شده عنوانِ خودش را دارد
    }
    var se = S.get(rid.sess), C = (se && se.coach) || {}, E = storyOf(se || {}, String(C.pk || "c:0")), st = ST.stmtOfSess(se);
    if (E.unk && txt(E.unk.t)) return clip(E.unk.t, 100);
    /* دورِ ۲۶ (Q6): خواسته‌ای که خودش با نشانهٔ صریح گفت («دنبالِ اینم که …»، «حل‌شدن یعنی …») مقدم بر جملهٔ پرسشیِ صورت است */
    var iu26 = E.items.filter(function (x) { return x.k === "u" && UNKMARK24.test(x.t); }).pop(); if (iu26) return clip(iu26.t, 100);
    var q2 = qSentence(st); if (q2) return clip(q2, 100);
    /* مجهولِ به حرفِ خودش فقط اگر به صورتِ همین مسئله می‌خورد — جملهٔ کناری («ولی خب ۵ منهای ۳ چرا نمیشه») مقصد نیست */
    var ub = C.unkBy && C.pk ? txt(C.unkBy[C.pk]) : "", bt = toks(st); if (ub && toks(ub).filter(function (w) { return hit(w, bt); }).length >= Math.max(1, Math.ceil(toks(ub).length / 2))) return clip(ub, 100);
    var iu = E.items.filter(function (x) { return x.k === "u"; }).pop(); if (iu && !METHODQ26.test(iu.t)) return clip(iu.t, 100);
    var g26 = /[؟?]/.test(st) ? goalSentence26(String(C.stmtRaw24 || st)) : ""; if (g26) return clip(g26, 100);   // فقط وقتی صورت پرسشی داشت که پرسشِ روش بود و کنار رفت
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
  /* دورِ ۲۷ (C56، C25-7 pC1 p1): پیامی که گامِ کارشدهٔ خودش را دارد («من امتحان کردم: x=4 و y=1 میشه 16−1=15») کارِ اوست حتی با یک جمله — حسابِ صفحه سطرهای «می‌خواند» را هم نشان می‌دهد */
  function workMsg(t) { var S0 = sentences(String(t || "")), own = OWNSTEP27.test(t) || MINE26.test(t) || TEST25.test(t);
    return S0.filter(function (x) { return WORK24.test(x); }).length >= 2 || S0.some(function (x) { return worked27(x, own) && (own || (!/[؟?]/.test(x) && probSig27(t))); }); }   // بی نشانهٔ کارِ خودش، جملهٔ پرسشیِ حساب («۷ × ۸ = ۵۶ بود دیگه؟») کارِ او نیست
  ST.workMsg = workMsg;
  AS.promptHooks.push(function (s, msg) {
    try { if (/^\s*\[/.test(String(msg || ""))) return "";
      var bl = AS.boundLive ? AS.boundLive(s) : null, pid = (bl && !bl.done ? bl.pid : "") || priorPid27(s, msg), pr = markWait(s, pid, ST.priorFor(s, pid)), out = [], PT = null;
      try { PT = ST.priorTurn(s, pid, String(msg || "")); } catch (e) { PT = null; }
      if (pr) {
        out.push("# کارِ پیشینِ تو (حکمِ هر گام؛ نقل و عدد/واحد را صفحه سنجید)");
        priorLines(pr, true).forEach(function (l) { out.push("- زمینه (نه پرسشِ دوم): " + l); });
        var wt = pr.steps.filter(function (x) { return x.wait; });
        out.push("- زمینه (نه پرسشِ دوم): نقطهٔ ازسرگیری " + (pr.resume ? "گامِ " + fa(pr.resume) : "پس از آخرین گام (همه درست)") + (wt.length ? " (گامِ " + wt.map(function (x) { return fa(x.n); }).join("، ") + " منتظرِ برگه است و سرِ جایش می‌ماند)" : "") + " — گام‌های «✓ درست» را دوباره نپرس و از نو حل نکن؛ گامی که «وابسته به گامِ n» است پس از درست شدنِ همان گام دوباره سنجیده می‌شود.");
        out.push("- زمینه (نه پرسشِ دوم): حکم‌ها را با «درست است؟» نشانش بده؛ هیچ چیزی از گام‌هایش را بی «آری» ِ خودش بازنویسی نکن. گامِ نادرست را با دلیل و شاهد بگو، نه با تعارف؛ اگر حکمی را رد کرد، دوباره بسنج — نه کوتاه آمدنِ بی‌دلیل، نه پافشاریِ بی‌دلیل.");
        out.push("- زمینه (نه پرسشِ دوم): مرزِ صادقانه — صفحه فقط نقل، عدد و واحد را تضمین می‌کند؛ درستیِ گامِ غیرعددی داوریِ توست. همین مرز را اگر پرسید یا لازم شد به او بگو.");
        /* دورِ ۲۵ (P1): دفتر ادغام می‌شود — مدل فقط همان گام را با شماره‌اش می‌فرستد؛ حسابِ میانهٔ کار prior نیست */
        out.push("- زمینه (نه پرسشِ دوم): این دفتر **ادغام** می‌شود، جایگزین نه. اگر همین پیام گامی از دفتر را درست کرد، حکمی را رد کرد یا دلیلِ تازه آورد، **فقط همان گام** را با شماره‌اش در coach_state بده: \"prior\":[{\"n\":شمارهٔ گام,\"quote\":\"عینِ حرفِ تازهٔ خودش برای همان گام (یا همان نقلِ پیشین، اگر فقط دوباره سنجیدی)\",\"verdict\":\"ok|incomplete|wrong|unchecked\",\"why\":\"شاهد\"}] — گام‌های دیگر را دوباره نفرست؛ حساب و گزارشِ گامِ میانهٔ کار prior نیست (همان step/result). اصلاحِ خودش فقط وقتی می‌نشیند که حسابِ صفحه هم بخواند.");
        var un = pr.steps.filter(function (x) { return x.her === "no" && !x.reAt; });
        if (PT && PT.id === "dispute") out.push("- زمینه (نه پرسشِ دوم): " + PT.line);
        else if (PT && /^(?:again|undo|which)$/.test(PT.id)) out.push("- زمینه (نه پرسشِ دوم): " + PT.line);
        else if (un.length) out.push("- زمینه (نه پرسشِ دوم): حکمِ گامِ " + un.map(function (x) { return fa(x.n); }).join("، ") + " را رد کرده و هنوز دوباره سنجیده نشده — هر وقت سنجیدی، نتیجه را با \"prior\":[{\"n\":…}] بده تا روی صفحه بنشیند.");
      }
      if (ST.priorAsk(s, pid, String(msg || ""))) out.push((pr ? "" : "# کارِ پیشینِ تو\n") + "- زمینه (نه پرسشِ دوم): پیامش کارِ پیشینِ خودش را دارد (گام‌هایی که خودش برداشته). کاملش را بخوان و در همان coach_state گزارش کن: " +
        "\"prior\":[{\"step\":\"نامِ کوتاهِ گام\",\"quote\":\"عینِ حرفِ خودش برای همان گام\",\"verdict\":\"ok|incomplete|wrong|unchecked\",\"why\":\"چرا (برای ناقص/نادرست: چه کم است یا از کجا غلط شد)\",\"fix\":\"اختیاری\",\"dep\":[شمارهٔ گامی که این گام بر آن تکیه دارد]}] — یک قلم برای هر گام، به ترتیبِ خودش؛ " +
        "صفحه هر نقل را در پیامش می‌جوید و حساب/واحد را خودش می‌سنجد. پاسخت: تا کجا رفته را تأیید کن و از نخستین گامی که درست نیست ادامه بده؛ گامِ درست را دوباره نپرس؛ حالت‌هایی که فقط آزموده (امتحان کردم …) آزمون‌اند، نه گام؛ اگر چند وجه دارد (حلِ مسئله، گرهٔ ذهنی، ادعای خبری)، ترتیبشان را بپرس.");
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
    var pr = markWait(null, pid, L.prior), closed = priorClosed(pid), sec = h("section", { class: "card soft lp-prior", dir: "rtl" }, h("h4", {}, R("کارِ پیشینِ تو — حکمِ هر گام")), h("p", { class: "small muted" }, R(closed ? pr.sum.replace(/\s*·\s*ازسرگیری از گامِ\s*[۰-۹]+/, "") + (priorReview26(pid) ? " · «✅ حل شد» زده‌ای و بازنگری هنوز ثبت نشده — این دفتر تا بستنِ مسئله همین‌طور می‌ماند" : " · مسئله بسته شد — این دفتر تاریخچه است") : pr.sum) + " · صفحه فقط نقل، عدد و واحد را سنجید؛ درستیِ گامِ غیرعددی داوریِ مربی است."));
    var set = function (x, v) { var t0 = nowIso(), h0 = { her: x.her || "", at: x.herAt || "", undoAt: v ? "" : t0 }; if (v === "no") { h0.noAt = t0; h0.v = x.verdict; h0.why = x.why || ""; } (x.herHist = x.herHist || []).forEach(function (e) { if (!v && e.noAt && !e.undone) e.undone = t0; }); x.herHist.push(h0); x.her = v; x.herAt = t0;
      if (v === "no") { x.turns = 0; delete x.reAt; delete x.re; pageRe(x, t0, ""); pr.st = "no"; }   // دورِ ۲۶ (D26-11): ردِ حکمِ ✓ هم همین‌جا دوباره حساب می‌شود
      else { delete x.herWhy; delete x.turns; if (!v && x.re) { (x.reHist = x.reHist || []).push(Object.assign({ undone: t0 }, x.re)); delete x.re; delete x.reAt; } } S.put(pg); A.render(); };
    pr.steps.forEach(function (x) {
      var row = h("div", { class: "lp-prior-step small", "data-v": x.verdict, "data-n": String(x.n), "data-fixed": x.fixed ? "1" : "", "data-stale": x.stale || (x.depStale || []).length ? "1" : "" }, h("span", {}, R(stepLine(Object.assign({}, x, { her: "" }), false, 140)) + (x.n === pr.resume && !closed ? " · ⟵ ازسرگیری از این‌جا" : "")));
      if (closed) row.appendChild(h("span", { class: "muted" }, x.her === "ok" ? " · تأیید شد ✓" : ""));
      else if (!x.her) row.appendChild(h("span", { class: "lp-prior-ask" }, " درست است؟ ",
        h("button", { class: "btn sm lp-prior-ok", type: "button", onclick: function () { set(x, "ok"); } }, "✓ درست است"),
        h("button", { class: "btn ghost sm lp-prior-no", type: "button", onclick: function () { set(x, "no"); } }, "✗ نه — دوباره بسنج")));
      else row.appendChild(h("span", { class: "muted" }, x.her === "ok" ? " · تأیید شد ✓ " : R(x.reAt ? " · رد کردی — دوباره سنجیده شد (بالا) " : " · رد کردی — در گفت‌وگو دوباره سنجیده می‌شود "),
        /* C5 (مالک، پرسشِ ۳۸): «نه» یا «✓» ِ اشتباهی برگشت‌پذیر است — با تاریخچه */
        h("button", { class: "btn ghost sm lp-prior-undo", type: "button", title: "انتخابم را پس می‌گیرم", onclick: function () { set(x, ""); } }, "↩ پس می‌گیرم")));
      sec.appendChild(row);
    });
    var at = m.querySelector(".lp-strip"); at = at && at.closest ? (at.closest(".phead") || at.parentNode) : null;
    if (at && at.parentNode) at.parentNode.insertBefore(sec, at.nextSibling); else (m.querySelector(".page") || m).appendChild(sec);
  }
  ST.paintPrior = paintPrior;
  /* ---------- دورِ ۲۵ (P1، D25-7): مسئلهٔ زنده‌ای که در گفت‌وگو به نتیجهٔ کل رسید، بی دوباره‌پرسیدنِ قابِ فهم/طرح بسته می‌شود ----------
     پیش‌تر «✅ حل شد» فقط در فازِ اجرای فرم بود: دروازهٔ «جملهٔ کل» جملهٔ خودش را «رونوشتِ صورت» رد می‌کرد و هفت فیلدِ قاب دوباره خواسته می‌شد، در حالی که پرامپت
     به مربی می‌گفت «او را به ✅ حل شد ببر». حالا همان کاری که chat_solved می‌کند با دکمهٔ خودِ او: فهم «از گفت‌وگو» بسته می‌شود (مجهول/داده/شرطِ گفت‌وگو با
     «از گفت‌وگو … درست است؟»)، حالت «حل شد»، و فقط بازنگری — که واقعاً نگفته — در صفحه پرسیده می‌شود. */
  function chatItems(pid) { var pg = S.get("eprog_" + pid), L = (pg && pg.solve && pg.solve.live) || {}, its = (L.chatImpItems || []).slice(); S.all("achat", function (x) { return x && x.coach && x.coach.story && x.coach.story["L:" + pid]; }).forEach(function (se) { its = its.concat(se.coach.story["L:" + pid].items); }); return its; }
  ST.chatSolvedReady = function (pid) {
    try { var pg = S.get("eprog_" + pid), L = pg && pg.solve && pg.solve.live; if (!L || L.state === "solved" || L.state === "dropped") return null;
      var ph = A.livePhase ? A.livePhase(pid) : ""; if (ph !== "u" && ph !== "p") return null;
      var pr = L.prior; if (pr && pr.resume) return null;   // دفترِ کارِ پیشین هنوز گامِ نادرست دارد
      var res = chatItems(pid).filter(function (x) { return x.k === "res" && x.fin !== false; }).pop(); return res ? { t: res.t, at: res.at } : null; } catch (e) { return null; }
  };
  ST.chatSolvedClose = function (pid) {
    var rdy = ST.chatSolvedReady(pid), r = A.liveRec && A.liveRec(pid), pg = S.get("eprog_" + pid); if (!rdy || !r || !pg) return false;
    var so = pg.solve = pg.solve || {}, L = so.live = so.live || {}, at = nowIso(), its = chatItems(pid), w = its.filter(function (x) { return x.k === "whole"; }).pop();
    so.u = so.u || {}; if (!(so.u[1] && so.u[1].done)) so.u[1] = { done: true, from: "chat", at: at, one: w ? w.t : r.p.statement, u: "", dl: [], c: "", type: so.type || r.p.kind };
    try { solvedAsk(so, its); } catch (e) { }
    L.state = "solved"; L.stateAt = at; L.stateD = A.today(); L.chat = { sess: (r.sess || (L.chatImp && L.chatImp.sess) || ""), at: at, solution: clip(rdy.t, 1500), by: "user" };
    S.put(pg); try { if (A.EVLOG && A.EVLOG.add) A.EVLOG.add({ pid: pid, id: "st25_close_" + pid, k: "cres", at: at, title: "حل شد — به گفتهٔ خودش، از گفت‌وگو", lines: ["نتیجه: «" + clip(rdy.t, 200) + "»", "فهم و طرح از گفت‌وگو بسته شد؛ بازنگری در صفحه"], out: "", by: "user" }); } catch (e) { }
    return true;
  };
  function paintChatSolved(pid) {
    var m = document.getElementById("main"); if (!m || m.querySelector(".lp-chatsolved")) return; var rdy = ST.chatSolvedReady(pid); if (!rdy) return;
    var sec = h("section", { class: "card soft lp-chatsolved", dir: "rtl" }, h("h4", {}, "در گفت‌وگو به نتیجه رسیدی"), h("p", { class: "small" }, "نتیجه‌ات (از گفت‌وگو): «" + clip(rdy.t, 200) + "»"),
      h("p", { class: "small muted" }, "لازم نیست آنچه را در گفت‌وگو گفتی دوباره در فرم بنویسی: فهم و طرح از همان گفت‌وگو بسته می‌شود (هر تکه با «از گفت‌وگو … درست است؟»)؛ فقط بازنگری — که هنوز نگفته‌ای — پرسیده می‌شود."),
      h("button", { class: "btn sm lp-chatsolved-ok", type: "button", onclick: function () { if (ST.chatSolvedClose(pid)) A.render(); } }, "✅ حل شد — بازنگری"));
    var at = m.querySelector(".lp-prior") || m.querySelector(".lp-strip"); at = at && at.classList && at.classList.contains("lp-strip") && at.closest ? (at.closest(".phead") || at.parentNode) : at;
    if (at && at.parentNode) at.parentNode.insertBefore(sec, at.nextSibling); else (m.querySelector(".page") || m).appendChild(sec);
  }
  ST.paintChatSolved = paintChatSolved;
  if (typeof A.render === "function" && !A.render._r25prior) {
    var rawR25 = A.render;
    A.render = function () { var out = rawR25.apply(this, arguments); try { var st = A.state || {}; if (st.view === "lprob" && st.arg && A.liveRec && A.liveRec(st.arg)) paintChatSolved(st.arg); } catch (e) { console.warn(e); } return out; };
    Object.keys(rawR25).forEach(function (k) { A.render[k] = rawR25[k]; });
    A.render._r25prior = true;
  }
  AS.promptHooks.push(function (s, msg) {
    try { if (/^\s*\[/.test(String(msg || ""))) return ""; var bl = AS.boundLive ? AS.boundLive(s) : null, pid = bl && !bl.done ? bl.pid : "", rdy = pid ? ST.chatSolvedReady(pid) : null; if (!rdy) return "";
      return "# بستنِ مسئله‌ای که در گفت‌وگو حل شد\n- زمینه (نه پرسشِ دوم): حلِ این مسئله در گفت‌وگو به نتیجه رسیده («" + clip(rdy.t, 120) + "»). در صفحهٔ 🔭 کارتِ «در گفت‌وگو به نتیجه رسیدی» با دکمهٔ «✅ حل شد — بازنگری» هست که فهم و طرح را از همین گفت‌وگو می‌بندد — از او نخواه فرم‌های فهم/طرح را دوباره پر کند و فیلدی را که در گفت‌وگو گفته دوباره نپرس؛ فقط بازنگری‌اش (درس، وارسی) اگر هنوز نگفته.";
    } catch (e) { return ""; }
  });
  /* ---------- دورِ ۲۶ (Q3، U15 = B26·D32 oB1 p31 «گفته بودم ۵ روز با ۶۰ درصد اطمینان، شد ۴» ⇒ 🎯 ِ شام (۹۰٪، پیش از موعد) «نشد» خورد) ----------
     ریشه (a41 t24Judge ← PR.fcMatch/PR.fcNarrow): میانِ پیش‌بینی‌های باز، عددِ مشترکِ اتفاقی («۴» در «هر ۴ شب …») نامزد می‌ساخت حتی وقتی اطمینانی که خودش همین حالا گفت
     (۶۰٪) با اطمینانِ آن پیش‌بینی (۹۰٪) نمی‌خواند — و پیش‌بینیِ درست (۶۰٪، پیش‌تر داوری‌شده) هرگز دیده نمی‌شد چون نامزدِ باز «پیدا» شده بود.
     قاعده (فقط از دادهٔ خودش): وقتی او اطمینانش را می‌گوید، پیش‌بینی‌ای که اطمینانِ دیگری دارد نامزدِ آن گزارش نیست. هیچ نامزدی نماند ⇒ t24Judge خودش سراغِ پیش‌بینیِ
     داوری‌شدهٔ هم‌اطمینان می‌رود (همان رکورد) یا می‌پرسد. این دو پوشش این‌جاست (نه در a41) تا با کارِ هم‌زمانِ «today» روی همان تابع برخورد نکند. */
  try { var PR26 = A.PR; if (PR26 && PR26.fcMatch && !PR26.fcMatch._r26story) {
      var same26 = function (L, pc) { return pc == null ? L : (L || []).filter(function (f) { return f.p == null || f.p === pc; }); };
      var rawM26 = PR26.fcMatch, rawN26 = PR26.fcNarrow;
      PR26.fcMatch = function (L, said, pc) { return rawM26.call(this, same26(L, pc), said, pc); }; PR26.fcMatch._r26story = true;
      PR26.fcNarrow = function (L, said, pc) { var x = same26(L, pc); return x.length ? rawN26.call(this, x, said, pc) : []; };
      ST.R26_QUARANTINE.fcMatch = rawM26; ST.R26_QUARANTINE.fcNarrow = rawN26;
      /* همان قاعده برای «تنها پیش‌بینیِ بازِ گفت‌وگو» (PR.predFor ← PR.predVerdict: «پس پیش‌بینیم غلط درومده: گفته بودم ۵ روز با ۶۰ درصد …»): اطمینانی که گفت با اطمینانِ آن
         پیش‌بینی نمی‌خواند ⇒ دربارهٔ آن نیست (پیش‌تر «تنها پیش‌بینیِ باز» — شامِ ۹۰٪ — بی هیچ نشانه‌ای «نشد» می‌خورد) */
      if (PR26.predFor) { var rawPF26 = PR26.predFor; PR26.predFor = function (s0, said, pc, noFc) { var x = rawPF26.apply(this, arguments);
          if (x && pc != null) { var xp = x.p != null ? x.p : (PR26.pctOf25 ? PR26.pctOf25(x.text) : null); if (xp != null && xp !== pc) return null; } return x; }; ST.R26_QUARANTINE.predFor = rawPF26; } } } catch (e) { }

  /* ---------- دورِ ۲۷b (history، C37 ⇐ C53؛ بانکِ R27 #200): پیش‌بینیِ مبهم دربارهٔ خواستهٔ خودِ مسئله ----------
     «فکر کنم قبول شم» زیرِ مسئلهٔ «می‌خوام کنکور قبول شم» پیش‌بینیِ پیامدِ همان خواسته است (واژهٔ «قبول» از جملهٔ خواستهٔ خودش در صورت، فعلِ آینده/التزامی، بی عدد و بی پرسش).
     صفحه آن را پیش‌بینی می‌شناسد (PR.bookPred) و — چون عدد ندارد — یک بار عددش را می‌پرسد (C37، همان سطرِ a41)؛ هیچ عددی ساخته نمی‌شود. هر «فکر کنم …» پیش‌بینی نیست:
     فقط وقتی جملهٔ پس از واژهٔ مبهم واژهٔ خواستهٔ صورت را دارد. پاسخِ کوتاهِ عددی («شصت»، «۶۰») به همان پرسش اطمینانِ همان پیش‌بینی است (C60: عدد به واژه هم عدد است). */
  var HEDGE27 = /(?:^|[\s،.])(?:فکر\s*(?:کنم|می[‌\s]?کنم)|احتمالاً|احتمالا|به\s*نظرم|حدس\s*می[‌\s]?زنم)\s+([^.!؟?\n،]{2,60})/;
  var FUTV27 = /(?:^|[\s‌])(?:ب|ن|می[‌\s]?|نمی[‌\s]?)?[آ-ی]{1,8}(?:م|ی|ه|یم|ید|ن|شم|شی|شه|بشم|کنم|کنه|میشم|نمیشم)$|(?:^|\s)(?:شم|بشم|می[‌\s]?شم|میشه|می[‌\s]?شه|بشه|نشم|نمی[‌\s]?شم|میاد|میام|می[‌\s]?گیرم|بگیرم)$/;
  var TENS27 = { "ده": 10, "بیست": 20, "سی": 30, "چهل": 40, "پنجاه": 50, "شصت": 60, "هفتاد": 70, "هشتاد": 80, "نود": 90, "صد": 100 }, ONES27 = { "یک": 1, "دو": 2, "سه": 3, "چهار": 4, "پنج": 5, "شش": 6, "هفت": 7, "هشت": 8, "نه": 9 };
  function bareNum27(t) { var x = txt(String(t || "").replace(/[.!،]+$/, "")).replace(/\s*(?:٪|%|درصد)\s*$/, ""), d = nz(x);
    if (/^\d{1,3}$/.test(d)) return +d <= 100 ? +d : null; var m = /^(ده|بیست|سی|چهل|پنجاه|شصت|هفتاد|هشتاد|نود|صد)(?:\s*و\s*(یک|دو|سه|چهار|پنج|شش|هفت|هشت|نه))?$/.exec(x); if (!m) return null; var v = TENS27[m[1]] + (m[2] ? ONES27[m[2]] : 0); return v <= 100 ? v : null; }
  ST.bareNum27 = bareNum27;
  function goalW27(stmt) { var T = String(stmt || ""), m = /(?:می[‌\s]?خوا(?:م|هم)|بتونم|بتوانم|قراره|باید)\s+([^.!؟?\n]{2,80})/.exec(T); if (!m) return [];
    return toks(m[1]).map(stem).filter(function (w) { return w.length >= 3 && !/^(?:بشم|شم|کنم|بکنم|برم|بدم|بیام|ببینم|بفهمم|بدونم|بشه|کنه)$/.test(w); }); }
  ST.vagueGoal27 = function (s0) {
    var PR27 = A.PR; if (!PR27 || !PR27.bookPred || !s0) return null; var U = (s0.msgs || []).filter(isUser), m = U[U.length - 1]; if (!m) return null;
    var t = String(m.text || ""), at = String(m.at || ""), C0 = s0.coach || {};
    /* (۲) پاسخِ کوتاهِ عددی به پرسشِ عددِ همان پیش‌بینی */
    var pu = U[U.length - 2], lp = pu ? (C0.preds || []).filter(function (y) { return y && y.pAsk && y.p == null && !y.out && String(y.at) === String(pu.at || ""); }).pop() : null, pv = lp ? bareNum27(t) : null;
    if (lp && pv != null) { lp.p = pv; var lf = PR27.predFc ? PR27.predFc(lp) : null; if (!lf && PR27.fc27) { lf = PR27.fc27(s0, lp, ""); if (lf && !lp.fc) lp.fc0 = lf.id; } if (lf && !lf.outcome) { lf.p = pv; delete lf.est; S.put(lf); }
      (s0.msgs = s0.msgs || []).push({ role: "sys", at: nowIso(), text: "🎯 «" + clip(lp.text, 50) + "» — اطمینان: " + fa(pv) + "٪ (به گفتهٔ خودت)." }); return lp; }
    /* (۱) پیش‌بینیِ مبهم دربارهٔ خواستهٔ همین مسئله */
    if (/[0-9۰-۹٪%]/.test(t) || (C0.preds || []).some(function (y) { return y && String(y.at) === at; })) return null;
    var h = HEDGE27.exec(t); if (!h || /[؟?]/.test(h[1])) return null; var cl = txt(h[1]); if (toks(cl).length > 8 || !FUTV27.test(nz(cl))) return null;
    var bl = null; try { bl = AS.boundLive ? AS.boundLive(s0) : null; } catch (e) { } var pid = bl && !bl.done ? bl.pid : ""; if (!pid) return null;
    var G = goalW27(stmtOf(s0, pid)), W = toks(cl).map(stem); if (!G.length || !W.some(function (w) { return G.indexOf(w) >= 0; })) return null;
    return PR27.bookPred(s0, txt(h[0]).replace(/^[\s،.]+/, ""), at, "", "page");
  };
  AS.afterTurnHooks = AS.afterTurnHooks || [];
  AS.afterTurnHooks.push(function (s) { try { if (ST.vagueGoal27(s)) S.put(s); } catch (e) { console.warn(e); } });

  /* ---------- دورِ ۲۷b (history، C78؛ مالک بانکِ ۴۲، بانکِ R27 #234/#235/#250): جابه‌جاییِ سطرِ 📜 ِ بدجا ----------
     سطری از 📜 ِ یک مسئله که مالِ مسئلهٔ دیگری است، با رکوردِ داستانی‌اش (دادهٔ/نتیجهٔ/گامِ گفت‌وگو) به آن مسئله می‌رود. هیچ چیز پاک نمی‌شود: قلمِ اصلی در مسئلهٔ نخست
     با نشانِ mv27 می‌ماند (در مرحله شمرده نمی‌شود) و رونوشتش در مسئلهٔ دوم با mvFrom می‌نشیند؛ برگرداندن نشان‌ها را برعکس می‌کند. مرحلهٔ گفت‌وگوی هر دو مسئله از قلم‌های
     ماندهٔ خودش دوباره خوانده می‌شود (نتیجهٔ بدجا مسئلهٔ نخست را در «بازنگری» نگه نمی‌دارد). */
  function evItem27(evId) { var o = null; S.all("achat").forEach(function (s) { if (o) return; var T = ((s.coach || {}).story) || {};
      Object.keys(T).forEach(function (key) { if (o) return; (T[key].items || []).forEach(function (x) { if (!o && x && ("st23_" + key.replace(/[^\w]/g, "_") + "_" + x.k + "_" + x.n) === evId) o = { s: s, key: key, it: x }; }); }); }); return o; }
  function rePh27(pid, s) { var pg = S.get("eprog_" + pid); if (!pg || !pg.solve || !pg.solve.live) return; var L = pg.solve.live, ph = phaseOfItems(storyOf(s, "L:" + pid).items.concat(L.chatImpItems || []));
    if ((ph || "") !== (L.chatPh || "")) { L.chatPh = ph || ""; L.chatPhAt = nowIso(); S.put(pg); } }
  ST.moveItem27 = function (evId, toPid, back) {
    var o = evItem27(evId); if (!o || !toPid) return null; var s = o.s, from = /^L:(.+)$/.exec(o.key), at = nowIso(), kB = "L:" + toPid, EB = storyOf(s, kB, true);
    if (back) { var orig = (storyOf(s, o.it.mvFrom || "").items || []).filter(function (x) { return x && x.mv27 && x.mv27.copy === evId; })[0];
      o.it.mv27 = { to: o.it.mvFrom, at: at, back: true }; if (orig) { (orig.mvHist = orig.mvHist || []).push({ to: orig.mv27.to, at: orig.mv27.at }, { back: true, at: at }); delete orig.mv27; }
      var home = /^L:(.+)$/.exec(o.it.mvFrom || ""); S.put(s); rePh27(toPid, s); if (home) rePh27(home[1], s); return { item: orig }; }
    var cp = Object.assign({}, o.it, { n: EB.items.length + 1, mvFrom: o.key, at: o.it.at }); delete cp.mv27; EB.items.push(cp);
    var cpId = "st23_" + kB.replace(/[^\w]/g, "_") + "_" + cp.k + "_" + cp.n; o.it.mv27 = { to: kB, at: at, copy: cpId };
    S.put(s); if (from) rePh27(from[1], s); try { var um = (s.msgs || []).filter(function (m) { return isUser(m) && mid(m) === cp.mid; })[0]; feed(toPid, s, [cp], um || null); } catch (e) { } rePh27(toPid, s);
    return { item: cp, id: cpId };
  };

  /* ---------- دورِ ۲۷b (history، D27-17 s30؛ بانکِ R27 #224): «برنامهٔ تمرین: …» مالِ پروندهٔ تمرینِ همین گفت‌وگوست ----------
     برچسبِ خودش («برنامهٔ تمرین») و یک پروندهٔ تمرینِ بازِ همین گفت‌وگو ⇒ برنامهٔ همین پیام به همان پرونده می‌پیوندد (a41 PR.planLink، همان پیوندِ «همان پرونده؟»)؛
     طرحِ داستانیِ همان جمله دیگر مرحلهٔ مسئلهٔ زنده را جلو نمی‌برد. دو پروندهٔ باز ⇒ صفحه حدس نمی‌زند (پیوند با کلیکِ خودش در «همان پرونده؟» ِ a41). */
  var PRCPLAN27 = /^\s*(?:برنامه(?:ٔ|‌ی|ی|\s*ی)?\s*(?:ی\s*)?تمرین|تمرین(?:م)?\s*:)/;
  ST.prcPlan27 = function (s0) {
    var PR27 = A.PR; if (!PR27 || !PR27.planLink || !PR27.cases || !s0) return false; var m = lastUser(s0); if (!m || !PRCPLAN27.test(String(m.text || ""))) return false;
    var ids = {}; (s0.prcs || []).forEach(function (id) { ids[id] = 1; });
    var C = PR27.cases({}).filter(function (c) { return c && c.state !== "closed" && !c.closed && (ids[c.id] || c.sess === s0.id || (c.from && c.from.sess === s0.id)); }); if (C.length !== 1) return false;
    var T = nz(m.text), done = false;
    (s0.plans || []).forEach(function (q) { if (!q || q.prc || !q.text) return; var qt = nz(q.text); if (!(String(q.at || "") === String(m.at || "") || (qt.length >= 8 && T.indexOf(qt.slice(0, 24)) >= 0))) return;
      if (PR27.planLink({ x: { p: q, s: s0 }, kind: "prc", item: C[0], pid: "", exact: true, txt: "" }, true)) done = true; });
    var E = ((s0.coach || {}).story) || {}; Object.keys(E).forEach(function (k) { (E[k].items || []).forEach(function (x) { if (x && x.k === "plan" && x.mid === mid(m) && !x.mv27) { x.mv27 = { prc: C[0].id, at: nowIso() }; done = true; var p0 = /^L:(.+)$/.exec(k); if (p0) rePh27(p0[1], s0); } }); });
    return done;
  };
  AS.afterTurnHooks = AS.afterTurnHooks || [];
  AS.afterTurnHooks.push(function (s) { try { if (ST.prcPlan27(s)) S.put(s); } catch (e) { console.warn(e); } });
})(APP);
