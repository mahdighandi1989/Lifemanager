/* ===== «🔍 غربالِ لایه‌ها» و «🧩 نقشهٔ پیش‌نیازها» (مالک ۲۰۲۶-۱۰-۱۴) =====
   مالک: «سیستم به هیچ چیز نه نمی‌گفت و همه را راه می‌داد … ولی نباید حرفِ به‌ظاهر بی‌ربط را هم سریع رد کند؛ با پرسش‌های دقیق و موشکافانه
   از خودش، با ریز شدن و شکاف دادن ببیند چه گره یا مسئله‌ای برای گوینده در آن هست، دسته‌بندی، ترتیب و اولویت دهد و تور بسازد … ریشه‌های ثابت
   را در چیزهای به‌ظاهر متفاوت ببیند … و اگر مسئله‌ای علمی را نفهمیدم، بفهمد کدام علمِ مقدماتی را دقیقاً نمی‌دانستم».
   ۱) غربال: فهرستِ لایه‌ها از ثبت‌گاه‌ها (لایه‌های پایه + **هر ۱۲ خانوادهٔ گره از A.KF** + معرفت + مسئله/پیش‌نیاز/یادگیری + ریشهٔ مشترک)؛
      مدل برای هر لایه حکم می‌دهد (پیدا شد با شاهد از حرفِ خودِ کاربر / رد شد / باید پرسید / بیرون از صفحه) و وجه‌های تور فقط از یافته‌ها
      و به **ریشه** ساخته می‌شوند. دیدنی در کشوی تور و در ایمیل.
   ۲) نقشهٔ پیش‌نیازها: برای مسئله/مطلبی که فهمیده نشد — هر مفهومِ لازم با علم، شاخه، «در کدام گامِ حل لازم است» و یک پرسشِ تشخیصی؛
      سنجش با خودِ کاربر (هوش مصنوعی فقط پیشنهاد می‌دهد)؛ هر پیش‌نیازِ نبوده ⇒ یک موضوعِ یادگیری با سفرِ ۱۱ گامی؛ در پایان بازگشت به مسئلهٔ اصلی. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, AS = A.ASSIST;
  if (!AS || !A.V) return;
  function clip(s, n) { s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function nowIso() { return new Date().toISOString(); }

  /* ---------- لایه‌ها (از ثبت‌گاه؛ خانواده‌های گره از خودِ A.KF) ---------- */
  var BASE = [
    { g: "پایه", id: "safety", fa: "ایمنی و حال", q: "نشانهٔ پریشانیِ جدی هست؟ اول حالش." },
    { g: "پایه", id: "want", fa: "خواستهٔ واقعیِ پشتِ حرف", q: "در واقع چه می‌خواهد؟ «حل‌شدن» برایش چه شکلی است؟ چه چیزی را نگفته؟" },
    { g: "پایه", id: "recur", fa: "تکرار و ریشهٔ مشترک", q: "این الگو پیش‌تر هم رخ داده؟ با گره‌ها و موقعیت‌های پیشینش (فهرستِ «# گره‌های پیشینِ کاربر») همان ریشه/ساختار را دارد؟" },
    { g: "معرفت", id: "claim", fa: "ادعا یا باورِ پنهان", q: "کدام جمله‌اش ادعایی است که اگر نادرست باشد همه‌چیز عوض می‌شود؟ (کارخانه)" },
    { g: "معرفت", id: "route", fa: "راهِ دانستن و خطای همان راه", q: "آن را از کجا می‌داند — حس، نقل، تجربه، استقراء، تخصصِ دیگران، شهود؟ خطای رایجِ همان راه اینجا هست؟ دانشِ «عملی/ضمنی» (چشم و بو، مهارتِ دست) هم راهِ خودش را دارد: تمرین با بازخوردِ فوری و دیدنِ کارِ استاد، نه فقط دستورِ نوشته." },
    { g: "مسئله و دانش", id: "problem", fa: "مسئلهٔ سختِ مشخص", q: "مسئله‌ای مشخص (حل‌شده یا نه) هست که باید تجزیه، شبیه‌سازی و با هم‌ساختارها تمرین شود؟" },
    { g: "مسئله و دانش", id: "prereq", fa: "دانشِ پیش‌نیازِ نبوده", q: "برای فهمیدن/حلِ آن کدام مفهوم از کدام علم و در کدام گامِ حل لازم است — و آیا آن را دارد؟ (🧩 نقشهٔ پیش‌نیازها)" },
    { g: "مسئله و دانش", id: "learn", fa: "یادگیری و ماندگاری", q: "چیزی هست که باید عمیق فهمیده و ماندگار شود (موضوع، سفرِ ۱۱ گامی، مرور)؟ «چطور این نوع چیز را یاد بگیرم» (مثلاً مهارتِ ضمنی با بازخورد) خودش درسی است که به چیزهای دیگرِ زندگی‌اش هم منتقل می‌شود؟" },
    { g: "پایه", id: "info", fa: "اطلاعاتِ ناموجود", q: "برای تشخیص چه چیزی را هنوز نمی‌دانیم و باید یکی‌یکی از او پرسید؟" },
    { g: "پایه", id: "territory", fa: "حوزه‌ای که هنوز نیست", q: "حوزه و ابزارش در قلمروها هست؟ گامِ ۰/۱ و او همین حالا لازم دارد ⇒ برگه." },
    { g: "پایه", id: "outside", fa: "بیرون از این صفحه", q: "کدام بخش واقعاً کارِ این صفحه نیست (درمان، حقوق، پولِ شخصی، تصمیمِ خودِ زندگی)؟ — فقط همان بخش، نه کلِ حرف." }
  ];
  var ST = { found: "پیدا شد", no: "رد شد", ask: "باید پرسید", out: "بیرون از صفحه" };
  AS.sieveLayers = function () {
    var fam = (A.KF || []).map(function (F) { return { g: "ریشه‌های گره (۱۲ خانواده)", id: F.id, fa: F.fa, q: F.blurb || "" }; });
    // ترتیب: پایه‌های اول، بعد خانواده‌ها، بعد معرفت و مسئله، و پایه‌های پایانی
    var head = BASE.slice(0, 3), rest = BASE.slice(3);
    return head.concat(fam, rest);
  };
  function layerOf(id) { id = String(id || "").replace(/^kf_/, ""); return AS.sieveLayers().filter(function (L) { return L.id === id; })[0]; }
  AS.sieveState = function (s) { return (s && s.tour && s.tour.diag) || {}; };

  var DO = AS.DO;
  DO.tour_diag = function (a) {
    var s = AS._turnSession; if (!s) return "سشن نیست";
    var list = Array.isArray(a.layers) ? a.layers : Array.isArray(a.diag) ? a.diag : a.id ? [a] : [], bad = [];
    // غربال پیش از طرحِ تور (در همان نوبت) نگه داشته و پس از tour_plan اعمال می‌شود (کارزارِ آزمون c03/c06: گم می‌شد)
    if (!s.tour) { s._diagPending = (s._diagPending || []).concat(list); return ""; }
    var d = s.tour.diag = s.tour.diag || {};
    list.forEach(function (x) {
      var L = x && layerOf(x.id); if (!L) { bad.push(String(x && x.id)); return; }
      var st = ST[x.st] ? x.st : "ask", why = String(x.why || "").replace(/^[\s—\-–.]+$/, "").trim();
      // «پیدا شد» فقط با شاهد از حرفِ خودِ کاربر؛ «رد شد» هم فقط با دلیل — «هنوز نگفته» یعنی «باید پرسید» (کارزارِ آزمون c09/c10: ۲۰ لایه پس از یک پاسخ رد شد)
      if ((st === "found" || st === "no") && why.length < 3) st = "ask";
      var prev = d[L.id];
      // یک لایه چند یافته می‌گیرد (کارزارِ آزمون c10: کالیبراسیون زیرِ نشخوار گم شد)
      if (prev && prev.st === "found" && st === "found" && prev.why && prev.why.indexOf(why) < 0) why = prev.why + " ؛ " + why;
      if (prev && prev.st === "found" && st === "no") { (prev.hist = prev.hist || []).push({ st: prev.st, why: prev.why, at: prev.at }); }
      d[L.id] = { st: st, why: clip(why, 500), facet: x.facet ? String(x.facet).slice(0, 12) : (prev && prev.facet) || "", at: nowIso(), hist: prev && prev.hist };
    });
    return bad.length ? "لایهٔ ناشناخته: " + bad.join("، ") : "";
  };
  // tour_plan می‌تواند غربال را هم‌زمان بیاورد
  var rawPlan = DO.tour_plan;
  DO.tour_plan = function (a) {
    var r = rawPlan.apply(this, arguments), s = AS._turnSession;
    if (a && (a.diag || a.layers)) { var r2 = DO.tour_diag(a); if (r2) r = (r ? r + " · " : "") + r2; }
    if (s && s.tour && s._diagPending) { var pend = s._diagPending; delete s._diagPending; var r3 = DO.tour_diag({ layers: pend }); if (r3) r = (r ? r + " · " : "") + r3; }
    return r;
  };

  /* ---------- برای مدل: وضعِ غربال + گره‌های پیشینِ کاربر ---------- */
  var rawText = AS.tourText;
  AS.tourText = function (s) {
    var t = rawText.apply(this, arguments); if (!t || !s || !s.tour) return t;
    var d = AS.sieveState(s), Ls = AS.sieveLayers(), done = [], open = [];
    Ls.forEach(function (L) { var x = d[L.id]; if (x) done.push("- [" + L.id + "] " + L.fa + ": " + ST[x.st] + (x.why ? " — " + x.why : "") + (x.facet ? " ⇒ " + x.facet : "")); else open.push(L.id + " " + L.fa); });
    // خانواده‌هایی که غربال پیدا کرد ⇒ در گره‌گشا (قدمِ ۱ و ۲) آزمون‌های همین‌ها جلو بیاید (کارزارِ آزمون c03/c06: رتبهٔ گره‌گشا یافته‌های غربال را نمی‌دید)
    var fams = (A.KF || []).filter(function (F) { return d[F.id] && d[F.id].st === "found"; }).map(function (F) { return F.id + " " + F.fa; });
    return t + "\n# غربالِ لایه‌ها (" + fa(done.length) + " از " + fa(Ls.length) + ")\n" + (done.join("\n") || "- هنوز هیچ لایه‌ای سنجیده نشده") +
      (open.length ? "\nسنجیده‌نشده: " + open.join("، ") : "") +
      (fams.length ? "\nخانواده‌هایی که غربال پیدا کرد: " + fams.join("، ") + " — در گره‌گشا (قدمِ ۱ و ۲) آزمون‌های تمایزدهندهٔ همین‌ها را هایلایت کن، هرچند رتبهٔ صفحه پایین‌تر باشد؛ اگر آزمون ردشان کرد، در غربال هم «رد شد» کن." : "");
  };
  AS.promptHooks = AS.promptHooks || [];
  AS.promptHooks.push(function () {
    var ks = S.all("knot").filter(function (k) { return !k.sample; }).slice(-15);
    if (!ks.length) return "";
    var KFM = {}; (A.KF || []).forEach(function (F) { KFM[F.id] = F.fa; });
    return "# گره‌های پیشینِ کاربر (برای ریشهٔ مشترک)\n" + ks.map(function (k) { return "- knot:" + k.id + " «" + clip(k.name || "گره", 50) + "» — " + (k.fam ? k.fam + " " + (KFM[k.fam] || "") : "") + " — " + (k.status || "open") + (k.deep ? " — ساختار: " + clip(k.deep, 80) : ""); }).join("\n");
  });

  AS.SYS += "\n" + [
    "# غربالِ لایه‌ها (پیش از هر طرحِ تور، و هر بار که حرفِ تازه‌ای آمد)",
    "- حرفِ کاربر را — حتی اگر به‌ظاهر بی‌ربط است (خرید، رابطه، کار، پول، سرگرمی) — نه سریع رد کن، نه پخش کن: لایه‌به‌لایه بشکاف. برای هر لایهٔ فهرستِ «# غربالِ لایه‌ها» پرسشِ همان لایه را از خودت بپرس و با {\"do\":\"tour_diag\",\"layers\":[{\"id\":\"F7\",\"st\":\"found|no|ask|out\",\"why\":\"شاهد با واژه‌های خودِ کاربر\",\"facet\":\"fN\"}]} حکم بده. found فقط با شاهد از حرفِ خودش؛ ask یعنی برای تشخیص باید چیزی را از او بپرسی (یکی‌یکی، دقیق، بی پیشنهادِ جواب)؛ out فقط برای همان بخشی که کارِ این صفحه نیست. هر ۱۲ خانوادهٔ گره را جدا بسنج.",
    "- وجه‌های تور فقط از لایه‌های found ساخته می‌شوند و به **ریشه** می‌روند، نه به سطح: چند یافته با یک ریشه = یک وجه؛ خودِ تصمیم یا موضوعِ بیرونی (ماشین، سرمایه‌گذاری، دعوا) وجه نیست — گره، خطای معرفتی، مسئلهٔ سخت، دانشِ پیش‌نیاز یا حوزه‌ای که پشتِ آن است وجه است. در why ِ هر وجه بگو از کدام یافته‌ها آمده.",
    "- ریشهٔ مشترک: «# گره‌های پیشینِ کاربر» را ببین؛ اگر همان خانواده و همان ساختارِ عمیق است، موقعیتِ تازه را به همان گره وصل کن (بازگشت/تکرار) نه گرهِ تازه، و این را صریح بگو — هنرِ این صفحه دیدنِ ریشهٔ ثابت در ظاهرهای متفاوت است.",
    "- برداشتِ خودِ کاربر دربارهٔ مسئله («باورش درست بود، دلیل هم داشت»، «سنگین‌تر یعنی زودتر») خودش یک **ادعا** است و راهِ دانستنش (شهود، تجربهٔ روزمره، نقل) لایهٔ **راه** — این دو را برای بدفهمیِ علمی رد نکن (کارزارِ آزمون c07).",
    "- مسئلهٔ علمی/هوشی/فلسفی که فهمیده یا حل نشده: دست‌کم سه لایه را جدا بسنج — گرهِ ذهنی (کدام خانواده: بازنمایی، راهبرد، پایش، …)، خطای معرفتی، و **دانشِ پیش‌نیاز** (کدام مفهوم، از کدام علم و شاخه، در کدام گامِ حل) ⇒ وجهِ kind=prereq با «🧩 نقشهٔ پیش‌نیازها» (نمای prereq). جوابِ مسئله را نگو؛ کاربر را تا خودِ حل ببر.",
    "- رتبهٔ خانواده‌ها در گره‌گشا «ترتیبِ بررسی» است نه احتمال؛ اگر با یافتهٔ غربال نمی‌خواند (مثلاً بازنمایی پایین آمد چون «صورت را درست بازگفت» ولی خطا در **مدلِ** مسئله بود — فضای نمونهٔ نادرست، شمردنِ جعبه به جای سکه)، صریح به کاربر بگو و آزمونِ همان خانواده را جلو بیاور؛ تصمیمِ ریشه با خودِ اوست.",
    "- لایهٔ «تکرار و ریشهٔ مشترک»: اگر گرهِ پیشینی ثبت نیست، «رد شد» نکن — «باید پرسید» بگذار و بپرس «پیش‌تر هم این حس/این نوع گیر را داشته‌ای؟». برای مسئله‌ای با پاسخِ معلوم، «🧪 شبیه‌سازِ همین مسئله» و «مسئله‌های هم‌ساختار» را هم پیشنهاد کن. فقط دربارهٔ چیزی که در پویشِ همین صفحه می‌بینی بگو «این‌جا بنویس/ببین»؛ رابطِ ناموجود را توصیف نکن.",
    "- غربال در یک نوبت بسته نمی‌شود: آنچه کاربر هنوز نگفته «باید پرسید» است نه «رد شد» (رد فقط با دلیل از حرفِ خودش). پرسش‌های «باید پرسید» را یکی‌یکی بپرس و با هر پاسخ غربال را به‌روز کن؛ تکرار در حوزه‌های **دیگرِ** زندگی‌اش را صریح بپرس («در یادگرفتنِ چیزهای دیگر هم همین‌طور بوده؟»). ترتیبِ وجه‌ها را با همان دلیلی که در why نوشتی هم‌خوان نگه دار.",
    "- پس از **هر** پیامِ کاربر غربال را با شاهدِ تازه بازبینی کن: لایه‌ای که «رد شد» بود و حالا شاهد دارد (مثلاً «همیشه دیدم برگ آروم‌تر میاد» ⇒ راهِ دانستن: تعمیمِ تجربهٔ روزمره) را با tour_diag «پیدا شد» کن.",
    "- «📧 گزارشِ تور» خودکار در حینِ تور به ایمیلِ کاربر می‌رود (و «الان بفرست» در کشوی تور هست)؛ اگر گزارش خواست، همین را بگو، نه «نمی‌توانم».",
    "- عددی یا واقعیتی را که کاربر نداده **فرض نکن** (مثلاً نرخِ مثبتِ کاذب، شیوع، اندازهٔ نمونه): بپرس «در برگهٔ آزمایش/مقاله این عدد آمده؟» و اگر نبود، صریح بگو با کدام فرض جلو می‌روی. تعریف‌ها (حساسیت، ویژگی، …) را دقیق بگو یا از دانسته‌های قلمرو بیاور.",
    "- خطای **معرفتی** که پیدا شد (مثلاً «بدیهیه»، «حس می‌کنم کلک داره»، «همه می‌گن») ریشهٔ جداست: وجهِ خودش را بگیرد (نوع claim)، در وجهِ پیش‌نیاز حل نشود. اگر کاربر در «🧩 نقشهٔ پیش‌نیازها» «بلدم» زد ولی پاسخِ نوشته‌اش همان ادعای بی دلیل است، پیش از «گامِ بعد» بخواه همان را با دلیل بنویسد؛ سنجش را خودش عوض کند.",
    "- لغزنده‌ای که «تکان نخورده» است مقدار ندارد: عددش را از کاربر بپرس؛ تا نگفته، «گامِ بعد»/«ثبت» نزن.",
    "- اولویت: ایمنی؛ ریشه‌ای که بقیه از آن می‌رویند (گره یا پیش‌نیاز)؛ آنچه زمان‌دار است؛ فهم پیش از تمرین.",
    "- نخستین پاسخ به هر مسئلهٔ تازه: جواب، حکم یا یافتهٔ نهایی را نگو — حتی اگر از «# دانسته‌های قلمرو» می‌دانی (کارزارِ آزمون c08: معنای درستِ p و تکرارنشدنِ پژوهش در همان پاسخِ اول لو رفت). اول یک یا دو پرسشِ دقیق برای لایه‌هایی که «باید پرسید» است (بی پیشنهادِ جواب)، بعد غربال؛ یافتهٔ قطعی را وقتی بگو که کاربر خودش به آن رسیده یا ایستگاهِ مربوط طی شده. لایهٔ «اطلاعاتِ ناموجود» را جدی بسنج: چه عددی، منبعی یا واقعیتی هنوز نیست؟",
    "- در reply هرگز کلید یا کد ننویس (f1، k12، F7، شناسهٔ حوزه یا رکورد) — نامِ فارسیِ وجه، خانواده یا حوزه را بگو."
  ].join("\n");

  /* ---------- کشوی تور: غربال دیدنی ---------- */
  function sieveRows(s) {
    var d = AS.sieveState(s), facets = (s.tour && s.tour.facets) || [];
    return AS.sieveLayers().map(function (L) {
      var x = d[L.id], f = x && x.facet && facets.filter(function (z) { return z.key === x.facet; })[0];
      return { g: L.g, id: L.id, fa: L.fa, st: x ? x.st : "", stFa: x ? ST[x.st] : "سنجیده نشده", why: x ? x.why : "", facet: f ? f.title : "" };
    });
  }
  AS.sieveRows = sieveRows;
  var rawDrawer = AS.tourDrawer;
  AS.tourDrawer = function (s) {
    var box = rawDrawer.apply(this, arguments);
    try {
      var rows = sieveRows(s), n = rows.filter(function (r) { return r.st; }).length, found = rows.filter(function (r) { return r.st === "found"; }).length;
      var det = h("details", { class: "as-sieve small" }, h("summary", {}, "🔍 غربالِ لایه‌ها · " + fa(n) + " از " + fa(rows.length) + " سنجیده · " + fa(found) + " یافته"));
      var g0 = "";
      rows.forEach(function (r) {
        if (r.g !== g0) { g0 = r.g; det.appendChild(h("div", { class: "muted mt" }, r.g)); }
        det.appendChild(h("div", { class: "as-sv as-sv-" + (r.st || "none") }, (r.st === "found" ? "● " : r.st === "no" ? "○ " : r.st === "ask" ? "？ " : r.st === "out" ? "↗ " : "· ") + r.fa + " — " + r.stFa +
          (r.why ? " — «" + clip(r.why, 90) + "»" : "") + (r.facet ? " ⇒ " + r.facet : "")));
      });
      box.appendChild(det);
    } catch (e) { }
    return box;
  };

  /* ---------- 🧩 نقشهٔ پیش‌نیازها ---------- */
  var SELF = ["", "بلدم", "نیمه", "بلد نیستم"];
  A.prereqState = function (p) {
    var it = (p && p.items) || [], rated = it.filter(function (x) { return x.self; }), miss = it.filter(function (x) { return x.self === "نیمه" || x.self === "بلد نیستم"; });
    return { n: it.length, sci: it.map(function (x) { return x.sci; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; }).length, rated: rated.length, miss: miss, topics: miss.filter(function (x) { return x.topic && S.get(x.topic); }) };
  };
  var SYS_PRE = "تو سازندهٔ «نقشهٔ پیش‌نیازها» هستی. مسئله یا مطلبی که کاربر نفهمیده یا حل نکرده را می‌گیری و فهرستِ **مفهوم‌های پیش‌نیاز** را می‌دهی که برای فهمیدن/حلِ همان لازم است — از پایه‌ای‌ترین تا نزدیک‌ترین به مسئله. برای هر کدام: علم (ریاضی، فیزیک، منطق، آمار، فلسفه، روان‌شناسی، …)، شاخه، نامِ دقیقِ مفهوم، «در کدام گامِ حل و چرا لازم است»، یک پرسشِ تشخیصیِ کوتاه که نشان دهد کاربر آن را دارد یا نه (پاسخِ خودِ مسئلهٔ اصلی را لو نده)، و پاسخِ مرجعِ همان پرسش. «why» فقط بگوید آن مفهوم در **کدام گام** به کار می‌آید، نه این‌که چطور به جواب می‌رسد — زنجیرهٔ استدلالِ حل را در why ها لو نده. ۴ تا ۱۰ مورد، بی تکرار، فقط آنچه واقعاً لازم است — و حتماً **خودِ مفهومِ محوریِ مسئله** (مثلاً «بختِ معرفتی» برای گتیه) و اصطلاح‌ها/پاسخ‌های استانداردِ آن رشته به همان مسئله. فقط JSON: [{\"sci\":\"…\",\"sub\":\"…\",\"concept\":\"…\",\"why\":\"…\",\"q\":\"…\",\"ref\":\"…\"}]";
  function parseArr(t) { try { var m = String(t || "").match(/\[[\s\S]*\]/); var a = JSON.parse(m ? m[0] : t); return Array.isArray(a) ? a : null; } catch (e) { return null; } }
  function mkTopic(p, x) {
    var tp = S.put({ id: A.uid("tp"), type: "topic", title: "«" + x.concept + "» (" + [x.sci, x.sub].filter(Boolean).join(" › ") + ") — پیش‌نیازِ «" + clip(p.title, 50) + "»", dom: x.sci || "", src: "🧩 نقشهٔ پیش‌نیازها", kind: "", prereq: p.id });
    if (A.toNursery) try { A.toNursery(tp.title, "concept", { t: "topic", id: tp.id }); } catch (e) { }
    x.topic = tp.id; S.put(p); return tp;
  }
  A.V.prereq = function (arg) {
    var root = h("div", { class: "page", dir: "rtl" });
    root.appendChild(A.head("حلِ مسئله و یادگیری", "🧩 نقشهٔ پیش‌نیازها", "مسئله یا مطلبی که نفهمیدی: کدام مفهوم، از کدام علم و شاخه، در کدام گامِ حل لازم بود — و کدام را واقعاً نداشتی. هر پیش‌نیازِ نبوده یک موضوعِ یادگیری می‌شود؛ بعد به خودِ مسئله برمی‌گردی."));
    var p = arg && S.get(arg);
    if (!p || p.type !== "prereq") {
      var ti = h("input", { type: "text", id: "prT", placeholder: "مثلاً «چرا در مسئلهٔ مونتی‌هال عوض‌کردن بهتر است؟» یا «اثباتِ قضیهٔ بِیز را نفهمیدم»" });
      var st = h("textarea", { id: "prS", rows: 4, placeholder: "صورتِ مسئله / مطلب، و کجا گیر کردی (اختیاری ولی مفید)" });
      root.appendChild(h("section", { class: "card" }, h("h2", {}, "نقشهٔ تازه"), h("label", { for: "prT" }, "مسئله یا مطلب"), ti, h("label", { for: "prS" }, "صورت و جای گیر"), st,
        h("button", { class: "btn", type: "button", onclick: function () {
          if (!ti.value.trim()) { A.toast("اول بنویس کدام مسئله یا مطلب.", "bad"); return; }
          var r = S.put({ id: A.uid("pq"), type: "prereq", title: ti.value.trim(), statement: st.value.trim(), items: [], kcase: "" }); A.go("prereq", r.id);
        } }, "ساختنِ نقشه")));
      var list = S.all("prereq").sort(function (a, b) { return String(b.created || "").localeCompare(String(a.created || "")); });
      root.appendChild(h("section", { class: "card" }, h("h2", {}, "نقشه‌های تو (" + fa(list.length) + ")"), list.length ? h("ul", {}, list.map(function (x) { var k = A.prereqState(x); return h("li", {}, h("button", { class: "linkish", type: "button", onclick: function () { A.go("prereq", x.id); } }, x.title), h("span", { class: "small muted" }, " — " + fa(k.n) + " مفهوم از " + fa(k.sci) + " علم · " + fa(k.miss.length) + " نبوده")); })) : h("p", { class: "small muted" }, "هنوز نقشه‌ای نساخته‌ای.")));
      return root;
    }
    function save() { S.put(p); A.render(); }
    var k = A.prereqState(p);
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "«" + p.title + "»"), p.statement ? h("p", { class: "small" }, p.statement) : null,
      h("p", { class: "small" }, fa(k.n) + " مفهوم از " + fa(k.sci) + " علم · " + fa(k.rated) + " سنجیده · " + fa(k.miss.length) + " نبوده/نیمه · " + fa(k.topics.length) + " موضوعِ یادگیری"),
      h("div", { class: "row gap wrap" },
        A.knotAIGate ? h("button", { class: "btn", type: "button", onclick: function () {
          A.knotAIGate({ purpose: "پیشنهادِ مفهوم‌های پیش‌نیازِ این مسئله", noPriv: true, system: SYS_PRE,
            build: function () { return "مسئله/مطلب: " + p.title + (p.statement ? "\nصورت و جای گیر: " + p.statement : "") + (p.items.length ? "\nاز پیش در فهرست: " + p.items.map(function (x) { return x.concept; }).join("، ") : ""); },
            onResult: function (txt) {
              var arr = parseArr(txt); if (!arr) { A.toast("پاسخِ هوش مصنوعی قالبِ درستی نداشت.", "bad"); return; }
              var have = p.items.map(function (x) { return String(x.concept || "").trim(); });
              arr.slice(0, 12).forEach(function (x) { if (!x || !x.concept || have.indexOf(String(x.concept).trim()) >= 0) return; p.items.push({ sci: clip(x.sci, 60), sub: clip(x.sub, 80), concept: clip(x.concept, 120), why: clip(x.why, 300), q: clip(x.q, 300), ref: clip(x.ref, 500), by: "ai", self: "", ans: "" }); });
              save(); A.toast("پیشنهادها افزوده شد — ساختهٔ هوش مصنوعی و وارسی‌نشده؛ سنجش با خودت است.");
            } });
        } }, "🤖 پیشنهادِ پیش‌نیازها") : null)));
    var rows = p.items.map(function (x, i) {
      var ans = h("textarea", { rows: 2, "aria-label": "پاسخِ تو به پرسشِ تشخیصیِ «" + clip(x.concept, 40) + "»", placeholder: "پاسخِ خودت، از حافظه", onchange: function (e) { x.ans = e.target.value; S.put(p); } }, x.ans || "");
      // سنجشِ خود و «حل شد» تصمیمِ خودِ کاربر است: دستیار فقط زرد می‌کند، پر نمی‌کند (data-own — کارزارِ آزمون c03)
      var sel = h("select", { "data-own": "1", "aria-label": "این پیش‌نیاز را داری؟ («" + clip(x.concept, 40) + "»)", onchange: function (e) { x.self = e.target.value; x.selfAt = nowIso(); save(); } }, SELF.map(function (o) { return h("option", { value: o, selected: (x.self || "") === o ? true : null }, o || "— خودت بسنج —"); }));
      return h("div", { class: "card soft pr-item" },
        h("div", { class: "row gap wrap" }, h("b", {}, fa(i + 1) + ") " + x.concept), h("span", { class: "chip" }, [x.sci, x.sub].filter(Boolean).join(" › ")), x.by === "ai" ? h("span", { class: "small muted" }, "پیشنهادِ هوش مصنوعی — وارسی‌نشده") : null),
        x.why ? h("p", { class: "small" }, "در کدام گام و چرا: " + x.why) : null,
        x.q ? h("p", {}, "پرسشِ تشخیصی: " + x.q) : null, x.q ? ans : null,
        // «بلدم» بی دلیلِ نوشته (کارزارِ آزمونِ دوم c12: «بدیهیه» با «بلدم» پذیرفته شد و موضوعِ زوجیت ساخته نشد) — فقط هشدار؛ سنجش با خودِ کاربر می‌ماند
        x.self === "بلدم" && x.q && String(x.ans || "").replace(/\s+/g, "").length < 15 ? h("p", { class: "small warn pr-thin" }, "«بلدم» گفتی ولی پاسخِ نوشته‌ات هنوز دلیل ندارد" + (x.ans ? " («" + clip(x.ans, 40) + "»)" : "") + ". پاسخِ مرجع را باز کن و مقایسه کن؛ اگر فقط «بدیهی است» یا «می‌دانم» بود، شاید «نیمه» درست‌تر باشد.") : null,
        h("div", { class: "row gap wrap" }, sel,
          x.self && x.ref ? h("details", { class: "small" }, h("summary", {}, "پاسخِ مرجع"), h("p", {}, x.ref)) : null,
          (x.self === "نیمه" || x.self === "بلد نیستم") && !(x.topic && S.get(x.topic)) ? h("button", { class: "btn sm", type: "button", onclick: function () { var tp = mkTopic(p, x); A.toast("موضوعِ یادگیری ساخته شد؛ سفرِ ۱۱ گامی‌اش را از همان‌جا شروع کن."); A.go("topic", tp.id); } }, "📚 موضوعِ یادگیری بساز") : null,
          x.topic && S.get(x.topic) ? h("button", { class: "linkish small", type: "button", onclick: function () { A.go("topic", x.topic); } }, "↗ موضوعِ یادگیری") : null,
          // زیرِ موضوعِ دیگرِ همین نقشه (کارزارِ آزمونِ دوم c02: ۶ موضوع برای یک معما زیاد بود؛ ادغامِ توافقی ثبت‌شدنی نبود)
          (x.self === "نیمه" || x.self === "بلد نیستم") && !(x.topic && S.get(x.topic)) && p.items.some(function (y) { return y !== x && y.topic && S.get(y.topic); }) ?
            h("select", { "aria-label": "زیرِ موضوعِ دیگر (برای «" + clip(x.concept, 30) + "»)", onchange: function (e) { if (e.target.value) { x.topic = e.target.value; x.merged = true; save(); } } },
              [h("option", { value: "" }, "— یا زیرِ موضوعِ دیگر —")].concat(p.items.filter(function (y) { return y !== x && y.topic && S.get(y.topic); }).map(function (y) { return h("option", { value: y.topic }, "زیرِ «" + clip(y.concept, 30) + "»"); }))) : null));
    });
    // یک‌جا برای همهٔ نبوده‌ها (کارزارِ آزمون c06/c07: ساختنِ یکی‌یکی چند نوبت می‌برد و کلیکِ اول صفحه را عوض می‌کرد)
    var todo = p.items.filter(function (x) { return (x.self === "نیمه" || x.self === "بلد نیستم") && !(x.topic && S.get(x.topic)); });
    if (todo.length > 1) root.appendChild(h("button", { class: "btn", type: "button", onclick: function () { todo.forEach(function (x) { mkTopic(p, x); }); A.toast(fa(todo.length) + " موضوعِ یادگیری ساخته شد؛ سفرِ هر کدام را از «موضوع‌ها» شروع کن."); A.render(); } }, "📚 برای همهٔ " + fa(todo.length) + " پیش‌نیازِ نبوده موضوع بساز"));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "مفهوم‌های پیش‌نیاز"), rows.length ? h("div", { class: "col gap" }, rows) : h("p", { class: "small muted" }, "هنوز موردی نیست — «🤖 پیشنهادِ پیش‌نیازها» یا پایین خودت بیفزا.")));
    var c1 = h("input", { type: "text", id: "prC", placeholder: "مفهوم" }), c2 = h("input", { type: "text", id: "prSci", placeholder: "علم › شاخه" }), c3 = h("input", { type: "text", id: "prW", placeholder: "در کدام گامِ حل لازم بود" });
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "افزودنِ دستی"), h("label", { for: "prC" }, "مفهوم"), c1, h("label", { for: "prSci" }, "علم › شاخه"), c2, h("label", { for: "prW" }, "در کدام گام"), c3,
      h("button", { class: "btn sm", type: "button", onclick: function () { if (!c1.value.trim()) return; var sp = c2.value.split("›"); p.items.push({ concept: c1.value.trim(), sci: (sp[0] || "").trim(), sub: (sp[1] || "").trim(), why: c3.value.trim(), q: "", ref: "", by: "user", self: "" }); save(); } }, "+ افزودن")));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "بازگشت به خودِ مسئله"),
      h("p", { class: "small muted" }, "پس از پیش‌نیازها، مسئلهٔ اصلی را دوباره، بی نگاه به راه‌حل، امتحان کن."),
      h("label", { for: "prBack" }, "پاسخ یا راهِ حلِ خودت (پس از پیش‌نیازها)"), h("textarea", { id: "prBack", rows: 3, onchange: function (e) { p.backAns = e.target.value; S.put(p); } }, p.backAns || ""),
      h("select", { "data-own": "1", "aria-label": "مسئلهٔ اصلی را دوباره امتحان کردی؟", onchange: function (e) { p.back = e.target.value; p.backAt = nowIso(); save(); } }, ["", "حل شد", "هنوز نه"].map(function (o) { return h("option", { value: o, selected: (p.back || "") === o ? true : null }, o || "— هنوز امتحان نکرده‌ام —"); }))));
    root.appendChild(h("button", { class: "linkish", type: "button", onclick: function () { A.go("prereq"); } }, "← همهٔ نقشه‌ها"));
    return root;
  };
  A.VIEW_META = A.VIEW_META || {};
  A.VIEW_META.prereq = { j: "understand", what: "نقشهٔ پیش‌نیازها: برای مسئله/مطلبی که فهمیده نشد، هر مفهومِ لازم با علم و شاخه، گامِ حل، پرسشِ تشخیصی و سنجشِ خودِ کاربر؛ پیش‌نیازِ نبوده ⇒ موضوعِ یادگیری؛ بازگشت به مسئله.", why: "تا دقیقاً بدانی کدام دانشِ مقدماتی را نداشتی، نه فقط «نفهمیدم»." };

  /* «امروز»: نقشه‌ای که هنوز سنجیده نشده */
  if (typeof A.dueList === "function" && !A.dueList._prereq) {
    var raw = A.dueList;
    A.dueList = function () {
      var items = raw.apply(this, arguments) || [];
      S.all("prereq", function (p) { var k = A.prereqState(p); return k.n && k.rated < k.n; }).forEach(function (p) { var k = A.prereqState(p); items.push({ k: "p", txt: "🧩 پیش‌نیازهای «" + clip(p.title, 40) + "» را بسنج", sub: fa(k.n - k.rated) + " مفهوم سنجیده نشده", go: function () { A.go("prereq", p.id); } }); });
      return items;
    };
    A.dueList._prereq = true;
  }
  /* منو: کنارِ ابزارهای ذهن */
  [A.NAV, A.EPI_NAV].forEach(function (arr) {
    if (!Array.isArray(arr) || arr.some(function (n) { return Array.isArray(n) && n[0] === "prereq"; })) return;
    var gi = arr.findIndex(function (n) { return n && n.g === "🧰 ابزارهای ذهن"; }); if (gi < 0) return;
    var end = gi + 1; while (end < arr.length && Array.isArray(arr[end])) end++;
    arr.splice(end, 0, ["prereq", "🧩 نقشهٔ پیش‌نیازها", "کدام دانشِ مقدماتی را برای این مسئله نداشتی"]);
  });
})(APP);
