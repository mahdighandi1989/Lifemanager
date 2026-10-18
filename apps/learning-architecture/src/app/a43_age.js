/* ===== سن: یک تاریخِ تولد، گروهِ سنیِ رشدی، و بلوکِ «# مخاطب» (مالک ۲۰۲۶-۱۰-۱۸؛ docs/decisions/2026-10-18-age-and-user-scope.md بندهای ۳ تا ۵) =====
   - **یک تاریخِ تولد.** در Lifemanager از پلِ میزبان (A.HOST.birth/setBirth ⇒ /api/me/date-of-birth، فضای خودِ کاربرِ واردشده؛ همان فیلدِ «تاریخ تولد» ِ «من که هستم»؛ سرورِ قدیمی ⇒ /api/identity-profile)؛
     پشتیبان همان settings.profile.birth ِ خودِ صفحه. همگام‌سازیِ خودکار فقط «پرکردنِ خالی» در هر دو سو است: هیچ‌کدام مقدارِ موجودِ دیگری را بی‌صدا
     نمی‌نویسد؛ اگر هر دو هستند و ناهم‌خوان، مقدارِ میزبان (حسابِ کاربر) خوانده می‌شود. ثبتِ صریحِ کاربر در صفحه (کارنامه، دستیار، کارت) به هر دو می‌رود.
     نسخهٔ مستقل و Apps Script فقط settings.profile.birth دارند.
   - **سن همیشه از تاریخ** حساب می‌شود (هرگز عددِ ذخیره‌شده).
   - **گروه‌ها** از مرزهای رشدیِ مستند، نه عددِ ساختگی — هر گروه منبعش را دارد (BANDS[].src؛ دفترچه §۱۰).
   - **«# مخاطب»:** فقط شیوهٔ گفتن (سطحِ زبان، طولِ جمله، مثال از دنیای خودِ شخص، اندازهٔ گام، تشویقِ بی چاپلوسی، ایمنیِ کم‌سال) — منطقِ پولیا،
     تونل‌ها و قراردادها دست نمی‌خورند. بزرگسال بی بلوک (همان قاعدهٔ ضمیرِ موجود).
   - **پرسیدن:** اگر تاریخ نیست، صفحه خودش (نه مدل) با یک کارت و یک جملهٔ «چرا» می‌پرسد — در نخستین نوبتِ هر سشنِ دستیار، یک بار در سشن تا داده شود؛
     کارِ دیگری را نمی‌بندد. کارنامه همان را پیش از مقایسه با هم‌سن‌ها می‌پرسد (a34_psy.js). */
(function (A) {
  var S = A.S, h = A.h, fa = A.fa;
  var G = A.AGE = {};
  var RE = /^\d{4}-\d{2}-\d{2}$/;
  G.WHY = "تا گفت‌وگو به زبانِ مناسبِ سنت باشد و کارنامه تو را فقط با هم‌سن‌هایت مقایسه کند (سن هر بار از همین تاریخ حساب می‌شود و جای دیگری نمی‌رود).";

  /* گروه‌های سنی — مرزها از مرحله‌های مدرسه، رشدِ شناختی و تعریف‌های بین‌المللی (نه عددِ قراردادی) */
  G.BANDS = [
    { id: "early", lo: 0, hi: 5, fa: "کودکِ پیش‌دبستانی",
      src: "دورهٔ پیش‌دبستانی (آغازِ دبستان در ۶ سالگی در نظامِ ۶-۳-۳ ِ آموزش‌وپرورشِ ایران) و مرحلهٔ پیش‌عملیاتیِ پیاژه (۲ تا ۷ سالگی)" },
    { id: "child", lo: 6, hi: 11, fa: "کودکِ دبستانی",
      src: "دبستان، پایه‌های ۱ تا ۶ (۶ تا ۱۱ سالگی، نظامِ ۶-۳-۳ ِ ایران) — هم‌پوشان با مرحلهٔ عملیاتِ عینیِ پیاژه (۷ تا ۱۱ سالگی): استدلال روی چیزهای ملموس" },
    { id: "teen", lo: 12, hi: 17, fa: "نوجوان",
      src: "دورهٔ متوسطهٔ اول و دوم (۱۲ تا ۱۷ سالگی) — آغازِ مرحلهٔ عملیاتِ صوری پیاژه (از حدودِ ۱۱–۱۲ سالگی)؛ و «کودک» = زیرِ ۱۸ سال در پیمان‌نامهٔ حقوقِ کودکِ سازمانِ ملل (CRC، مادهٔ ۱) برای قاعده‌های ایمنی" },
    { id: "adult", lo: 18, hi: 59, fa: "بزرگسال",
      src: "۱۸ سال: پایانِ «کودکی» در CRC (مادهٔ ۱)؛ مرزِ بالا همان آغازِ «سالمندی» در تعریفِ سازمانِ جهانیِ بهداشت/سازمانِ ملل (۶۰ سال)" },
    { id: "elder", lo: 60, hi: null, fa: "سالمند",
      src: "سازمانِ جهانیِ بهداشت و سازمانِ ملل: «سالمندان» = ۶۰ سال و بیشتر (WHO, Ageing and health, 2024؛ UN World Population Ageing)" }
  ];
  G.band = function (age) {
    if (age == null || isNaN(age)) return null;
    return G.BANDS.filter(function (b) { return age >= b.lo && (b.hi == null || age <= b.hi); })[0] || null;
  };
  G.minor = function (age) { var b = G.band(age); return !!b && (b.id === "early" || b.id === "child" || b.id === "teen"); };

  /* ---------- یک تاریخِ تولد ---------- */
  /* رقمِ فارسی/عربی و جداکنندهٔ «/» یا «.» پذیرفته می‌شود (میلادی) */
  function norm(d) {
    var t = String(d == null ? "" : d).trim().replace(/[۰-۹]/g, function (c) { return String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)); }).replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 0x660); });
    var m = /^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/.exec(t); if (!m) return t.slice(0, 10);
    var y = +m[1], mo = +m[2], da = +m[3], dt = new Date(Date.UTC(y, mo - 1, da));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== da) return "";
    return m[1] + "-" + ("0" + mo).slice(-2) + "-" + ("0" + da).slice(-2);
  }
  function valid(d) { d = norm(d); return RE.test(d) && d >= "1900-01-01" && d < A.today() ? d : ""; }
  G.valid = valid;
  function localBirth() { var p = (S.settings().profile) || {}; return valid(p.birth); }
  function hasHost() { return !!(A.HOST && typeof A.HOST.birth === "function"); }
  G._host = "";   // آخرین مقدارِ معتبرِ میزبان (فقط در حافظه)
  G.birth = function () { return (hasHost() && G._host) || localBirth(); };
  G.age = function (on) {
    var b = G.birth(); if (!b) return null;
    var t = on || A.today(), y = +t.slice(0, 4) - +b.slice(0, 4); if (t.slice(5, 10) < b.slice(5, 10)) y--; return y;
  };
  function saveLocal(d) { var st = S.settings(); st.profile = st.profile || {}; st.profile.birth = d; S.saveSettings(st); }
  /* ثبتِ صریحِ کاربر ⇒ صفحه + میزبان. خروجی: "" یا متنِ خطا */
  G.setBirth = function (d) {
    var v = valid(d); if (!v) return "تاریخِ تولد ثبت نشد: تاریخِ میلادیِ درست (YYYY-MM-DD) و پیش از امروز لازم است";
    saveLocal(v);
    if (hasHost()) { G._host = v; if (typeof A.HOST.setBirth === "function") { try { Promise.resolve(A.HOST.setBirth(v)).catch(function (e) { console.warn("setBirth", e); }); } catch (e) { console.warn(e); } } }
    return "";
  };
  /* همگام‌سازی پس از بارِ داده: پرکردنِ خالی در هر دو سو */
  G.syncHost = function () {
    if (!hasHost()) { G._host = ""; return Promise.resolve(G.birth()); }
    var H = A.HOST;
    return Promise.resolve().then(function () { return H.birth(); }).then(function (hb) {
      var hv = valid(hb), lv = localBirth();
      G._host = hv;
      if (hv && !lv) saveLocal(hv);
      else if (!hv && lv && !(hb && String(hb).trim()) && typeof H.setBirth === "function") return Promise.resolve(H.setBirth(lv)).then(function () { G._host = lv; return G.birth(); }, function () { return G.birth(); });
      return G.birth();
    }, function (e) { G._host = ""; console.warn("host birth", e); return G.birth(); });
  };
  if (S && typeof S.init === "function" && !S.init._age) {
    var rawInit = S.init;
    S.init = function (cb) { return rawInit.call(S, function () { var r = cb && cb.apply(this, arguments); try { G.syncHost().then(function () { if (A.state && /^(mind|psy_item)$/.test(A.state.view)) A.render(); }); } catch (e) { } return r; }); };
    S.init._age = true;
  }

  /* ---------- «# مخاطب» — فقط شیوهٔ گفتن ---------- */
  var COMMON = "- منطقِ حل، پرسش‌های پولیا، تونل‌ها و قاعده‌های بالا همان است؛ فقط شیوهٔ گفتن عوض می‌شود. این دربارهٔ خودِ کاربر است — اگر مسئلهٔ کسِ دیگری را آورده (معلم/والد)، قابِ معلم برقرار است.";
  var SAFE_MINOR = [
    "- ایمنی (کم‌سال): نامِ کامل، نشانی، مدرسه، شمارهٔ تلفن، عکس یا هیچ دادهٔ شخصیِ دیگری نخواه؛ موضوعِ بزرگسالانه پیش نکش و اگر او پیش کشید، کوتاه و محترمانه به کارِ خودش برگرد.",
    "- اگر پای چیزِ واقعاً مهم در میان است (سلامت، ایمنی، پول، اختلافِ جدی، تصمیمِ بزرگ)، پیشنهاد کن با پدر یا مادر یا معلم (یا مشاورِ مدرسه) در میان بگذارد — بی این‌که تصمیم یا فکر کردن را از خودش بگیری."
  ];
  G.audience = function (age) {
    if (arguments.length === 0) age = G.age();
    var b = G.band(age), L;
    if (!b) return [
      "# مخاطب",
      "- سنِ کاربر نامعلوم است (تاریخِ تولد ثبت نشده). صفحه خودش یک بار با کارتی کوچک تاریخِ دقیقِ تولد را می‌پرسد — تو نپرس و کار را معطل نکن.",
      "- تا آن وقت: زبانِ روشن و ساده؛ و چون ممکن است کم‌سال باشد، هیچ دادهٔ شخصی (نشانی، مدرسه، شماره، عکس) نخواه و موضوعِ بزرگسالانه پیش نکش."
    ].join("\n");
    if (b.id === "adult") return "";
    var head = "- کاربر " + fa(age) + " ساله است (" + b.fa + "؛ از تاریخِ تولدِ ثبت‌شده). از سنش حرف نزن و او را با سنش خطاب نکن.";
    if (b.id === "early" || b.id === "child") {
      L = ["# مخاطب", head, COMMON,
        "- زبان: واژه‌های ساده و روزمرهٔ کودکِ " + (b.id === "early" ? "پیش‌دبستانی" : "دبستانی") + "؛ جمله‌های کوتاه (یک فکر در هر جمله)؛ اصطلاحِ فنی فقط با معنیِ ساده‌اش، کنارِ خودش.",
        "- مثال از دنیای خودش: مدرسه، بازی، خوراکی، خانواده، حیوان‌ها — چیزهای ملموسی که بشود شمرد، کشید یا با دست چید.",
        "- گام‌ها کوچک: هر بار یک کارِ کوچک؛ اگر گیر کرد، گامِ کوچک‌تر یا یک مثالِ ملموس‌تر — نه جواب.",
        "- تشویق بی چاپلوسی: کارِ درستِ مشخصش را نام ببر («این‌که شکلش را کشیدی کمک کرد»)؛ «نابغه‌ای»، «عالی‌ترینی» و تعریفِ کلی نه؛ اشتباه را آرام و بی سرزنش بگو.",
        "- ضمیر: همان قاعدهٔ ضمیرِ گفت‌وگو؛ اگر هنوز ضمیری جاری نیست، «تو» ِ گرم و ساده."].concat(SAFE_MINOR);
      if (b.id === "early") L.push("- احتمالاً بزرگ‌تری کنارش است یا برایش می‌نویسد: جمله‌ها خیلی کوتاه، و برای کارهای نوشتنی از همراهش کمک بخواه.");
      return L.join("\n");
    }
    if (b.id === "teen") return ["# مخاطب", head, COMMON,
      "- زبان: روزمره و روشن، نه کودکانه و نه رسمی؛ ایدهٔ انتزاعی را با یک مثالِ ملموس کنارش بگو؛ جمله‌ها متوسط.",
      "- مثال از دنیای نوجوان: مدرسه و امتحان، دوست‌ها، ورزش، بازی و گوشی، سرگرمی‌هایش.",
      "- گام‌ها: بگذار خودش جلو برود؛ گامِ بعد را او پیشنهاد کند و تو فقط بپرس؛ نصیحت و موعظه نه.",
      "- تشویق بی چاپلوسی: کارِ درستِ مشخص را نام ببر؛ تعریفِ کلی و اغراق نه.",
      "- ضمیر: همان قاعدهٔ ضمیرِ گفت‌وگو."].concat(SAFE_MINOR).join("\n");
    /* سالمند */
    return ["# مخاطب", head, COMMON,
      "- با حوصله: عجله نکن، یک چیز در هر نوبت، و اگر چیزی را دوباره پرسید بی هیچ نشانه‌ای از بی‌حوصلگی دوباره بگو.",
      "- زبان: روشن و آرام؛ پاراگراف‌های کوتاه؛ اصطلاحِ تازه (به‌ویژه فنی یا انگلیسی) را معنی کن.",
      "- مثال از تجربهٔ زندگیِ خودش (کار، خانواده، خانه، کارهای روزمره) — تجربه‌اش را به رسمیت بشناس.",
      "- اندازهٔ گام همان معمول؛ گام‌های بزرگ‌تر فقط وقتی که تسلطش را نشان داد.",
      "- بی تحقیر و از بالا نگاه کردن: ساده‌سازیِ کودکانه، توضیحِ چیزی که بلد است، یا خطاب‌هایی مثلِ «مادربزرگ/پدربزرگ» نه.",
      "- ضمیر: همان قاعدهٔ ضمیرِ گفت‌وگو."].join("\n");
  };

  /* ---------- قلاب‌های دستیار ---------- */
  var AS = A.ASSIST;
  if (AS) {
    AS.promptHooks = AS.promptHooks || [];
    AS.promptHooks.push(function () { try { return G.audience(); } catch (e) { return ""; } });
    /* کارتِ پرسشِ تاریخِ تولد: نخستین نوبتِ سشن (پس از نخستین پیامِ کاربر)، یک بار در سشن تا داده شود */
    G.askNode = function (s, onDone) {
      /* متنی، نه type=date: پنجرهٔ بومیِ تاریخ در پنجرهٔ شناورِ دستیار رویدادهای اشاره‌گر را می‌بلعید (کشیدنِ سرتیتر در test_tour از کار می‌افتاد) */
      var inp = h("input", { type: "text", inputmode: "numeric", class: "inp sm age-in", dir: "ltr", "data-own": "1", "aria-label": "تاریخِ دقیقِ تولد (میلادی)", placeholder: "YYYY-MM-DD" }), msg = h("span", { class: "small bad" });
      return h("div", { class: "card soft age-ask", dir: "rtl", role: "group", "aria-label": "تاریخِ دقیقِ تولد" },
        h("p", { class: "small" }, h("b", {}, "تاریخِ دقیقِ تولدت را بگو؟ "), h("span", { class: "age-why" }, G.WHY)),
        h("div", { class: "row gap wrap" }, inp,
          h("button", { class: "btn sm", type: "button", "data-own": "1", onclick: function () { var e = G.setBirth(inp.value); if (e) { msg.textContent = e; return; } if (s) { s.ageAsk = "given"; S.put(s); } if (onDone) onDone(); } }, "ثبت"),
          h("button", { class: "btn ghost sm", type: "button", "data-own": "1", onclick: function () { if (s) { s.ageAsk = "later"; S.put(s); } if (onDone) onDone(); } }, "بعداً"), msg));
    };
    AS.logHooks = AS.logHooks || [];
    AS.logHooks.push(function (s) {
      if (!s || s.ageAsk || G.birth()) return null;
      if (!(s.msgs || []).some(function (m) { return m.role === "user"; })) return null;
      return G.askNode(s, function () { try { if (AS.paint) AS.paint(); } catch (e) { } });
    });
  }
})(APP);
