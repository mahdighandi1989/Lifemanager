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
  /* دورِ ۲۳ (Q1، A23-1، B·D6، C23-8، D23-25): تاریخ همان‌طور که شخص می‌داند — شمسی یا میلادی، رقمِ فارسی/عربی/لاتین، «/ - .»، نامِ ماهِ شمسی
     («۲۰ اردیبهشت ۱۳۳۸»، «اردی‌بهشت ماهِ»، سالِ دورقمیِ «۸۹»)، نامِ ماهِ میلادی («16 March 1959»، «مارس»). سالِ کمتر از ۱۷۰۰ ⇒ شمسی. تبدیل با الگوریتمِ
     جاافتادهٔ jalaali-js (Borkowski؛ آزمون با جفت‌های شناخته: ۱ فروردین ۱۴۰۵ = 2026-03-21) و درستیِ روز با رفت‌وبرگشت (۳۱ مهر، ۳۰ اسفندِ ناکبیسه ⇒ رد).
     خطا جملهٔ انسانی است، نه «YYYY-MM-DD». قرنطینهٔ مسیرِ پیشین (فقط میلادی): G.R23_QUARANTINE.norm22. */
  var JM = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
  var GM = [["january", "jan", "ژانویه", "ژانویهٔ"], ["february", "feb", "فوریه", "فوریهٔ"], ["march", "mar", "مارس"], ["april", "apr", "آوریل"], ["may", "مه", "مهٔ", "می"], ["june", "jun", "ژوئن"],
    ["july", "jul", "ژوئیه", "ژوئیهٔ", "جولای"], ["august", "aug", "اوت", "آگوست"], ["september", "sep", "sept", "سپتامبر"], ["october", "oct", "اکتبر"], ["november", "nov", "نوامبر"], ["december", "dec", "دسامبر"]];
  function digits(t) { return String(t == null ? "" : t).replace(/[۰-۹]/g, function (c) { return String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)); }).replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 0x660); }); }
  function div(a, b) { return ~~(a / b); }
  /* jalaali-js (jalCal / j2d / d2g / g2d / d2j) */
  var BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  function jalCal(jy) { var bl = BREAKS.length, gy = jy + 621, leapJ = -14, jp = BREAKS[0], jm, jump = 0, leap, n, i;
    if (jy < jp || jy >= BREAKS[bl - 1]) return null;
    for (i = 1; i < bl; i += 1) { jm = BREAKS[i]; jump = jm - jp; if (jy < jm) break; leapJ = leapJ + div(jump, 33) * 8 + div(jump % 33, 4); jp = jm; }
    n = jy - jp; leapJ = leapJ + div(n, 33) * 8 + div((n % 33) + 3, 4); if ((jump % 33) === 4 && jump - n === 4) leapJ += 1;
    var leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150, march = 20 + leapJ - leapG;
    if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
    leap = ((((n + 1) % 33) - 1) % 4); if (leap === -1) leap = 4;
    return { leap: leap, gy: gy, march: march }; }
  function g2d(gy, gm, gd) { var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * ((gm + 9) % 12) + 2, 5) + gd - 34840408; return d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752; }
  function d2g(jdn) { var j = 4 * jdn + 139361631; j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908; var i = div((j % 1461), 4) * 5 + 308, gd = div((i % 153), 5) + 1, gm = ((div(i, 153)) % 12) + 1, gy = div(j, 1461) - 100100 + div(8 - gm, 6); return [gy, gm, gd]; }
  function j2d(jy, jm, jd) { var r = jalCal(jy); return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1; }
  function d2j(jdn) { var gy = d2g(jdn)[0], jy = gy - 621, r = jalCal(jy), jdn1f = g2d(gy, 3, r.march), jd, jm, k = jdn - jdn1f;
    if (k >= 0) { if (k <= 185) { jm = 1 + div(k, 31); jd = (k % 31) + 1; return [jy, jm, jd]; } else k -= 186; } else { jy -= 1; k += 179; if (r.leap === 1) k += 1; }
    jm = 7 + div(k, 30); jd = (k % 30) + 1; return [jy, jm, jd]; }
  function pad(n) { return ("0" + n).slice(-2); }
  function iso3(g) { return g[0] + "-" + pad(g[1]) + "-" + pad(g[2]); }
  G.j2g = function (jy, jm, jd) { if (!jalCal(jy)) return null; return iso3(d2g(j2d(jy, jm, jd))); };
  G.g2j = function (iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || "")); if (!m) return null; return d2j(g2d(+m[1], +m[2], +m[3])); };
  function jalMonthLen(jy, jm) { if (jm <= 6) return 31; if (jm <= 11) return 30; var r = jalCal(jy); return r && r.leap === 0 ? 30 : 29; }
  G.faJal = function (j) { return j ? fa(j[2]) + " " + JM[j[1] - 1] + " " + fa(j[0]) : ""; };
  /* قرنطینه (دورِ ۲۴، R5، B24·D6/D24-5/A24-20 — REMOVAL_CANDIDATES): «۱۷ اسفند ۱۳۸۸ (2010-03-08 میلادی)» — تاریخِ ISO به آدم نمی‌رسد. فقط برای سازگاری صادر می‌ماند. */
  function faBothR23(isoD) { var j = G.g2j(isoD); return j ? G.faJal(j) + " (" + isoD + " میلادی)" : isoD; }
  G.faBoth = faBothR23;
  /* دورِ ۲۴ (R5): تاریخی که به آدم نشان داده می‌شود فقط شمسی و با رقمِ فارسی است («۱۷ اسفند ۱۳۸۸») — هرگز «YYYY-MM-DD» */
  G.faDate = function (isoD) { var j = G.g2j(isoD); return j ? G.faJal(j) : String(isoD || ""); };
  /* هر «YYYY-MM-DD» (رقمِ لاتین یا فارسی) در متنی که به آدم می‌رسد ⇒ تاریخِ شمسیِ فارسی (D24-6 «موعد ۲۰۲۶-۱۰-۲۱»)؛ بیرون از «…» (حرفِ خودش دست نمی‌خورد) */
  var ISO_ANY = /(^|[^0-9۰-۹\-])([12۱۲][0-9۰-۹]{3})-([0-9۰-۹]{2})-([0-9۰-۹]{2})(?![0-9۰-۹])/g;
  function faDatesRaw(t) { return String(t == null ? "" : t).replace(ISO_ANY, function (all, pre, y, m, d) { var iso = digits(y) + "-" + digits(m) + "-" + digits(d), j = G.g2j(iso);
    return j && G.j2g(j[0], j[1], j[2]) === iso && iso >= "1800-01-01" ? pre + G.faJal(j) : all; }); }
  G.faDates = function (t) { var l = String(t == null ? "" : t), out = "", d = 0, buf = "";
    for (var i = 0; i < l.length; i++) { var ch = l.charAt(i);
      if (ch === "«") { if (d === 0) { out += faDatesRaw(buf); buf = ""; } d++; out += ch; continue; }
      if (ch === "»" && d > 0) { d--; out += ch; continue; }
      if (d === 0) buf += ch; else out += ch; }
    return out + faDatesRaw(buf); };
  A.faDates = G.faDates;
  function todayJ() { return G.g2j(A.today()); }
  var JMRE = "(" + JM.join("|") + ")";
  function normTx(t) { return digits(t).replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/اردی[\s‌]*بهشت/g, "اردیبهشت").replace(/امرداد/g, "مرداد").replace(/[ًٌٍَُِّْ]/g, "").replace(/\s+/g, " ").trim(); }
  /* دورِ ۲۴ (R5، B24·D1): نامِ ماهِ شمسی به خطِ لاتین («17 Esfand 1388») */
  var FING = [["farvardin|farvardeen|farvadin", 0], ["ordibehesht|ordibehesh?t|ordibehest", 1], ["khordad|khordaad|xordad|khordat", 2], ["tir|teer", 3], ["mordad|amordad|mordaad", 4],
    ["shahrivar|shahrivar|sharivar|shahrivaar", 5], ["mehr|mehre", 6], ["aban|aaban|abaan", 7], ["azar|aazar|azaar", 8], ["dey|dei", 9], ["bahman|bahmaan", 10], ["esfand|esfan|isfand|esfand", 11]];
  function fing(x) { if (!/[a-z]/i.test(x) || !/\d/.test(x)) return x; var o = x.toLowerCase();
    FING.forEach(function (f) { o = o.replace(new RegExp("(^|[^a-z])(?:" + f[0] + ")(?![a-z])", "g"), function (a, pre) { return pre + " " + JM[f[1]] + " "; }); });
    return o.replace(/\s+/g, " ").trim(); }
  /* دورِ ۲۴ (R5، A24-10): سنِ به حروف («هشتاد و یک سالمه») ⇒ رقم؛ فقط عددی که پیش از «سال…» آمده */
  var NW = { "یک": 1, "یه": 1, "دو": 2, "سه": 3, "چهار": 4, "پنج": 5, "شش": 6, "شیش": 6, "هفت": 7, "هشت": 8, "نه": 9, "ده": 10, "یازده": 11, "دوازده": 12, "سیزده": 13, "چهارده": 14,
    "پانزده": 15, "پونزده": 15, "شانزده": 16, "شونزده": 16, "هفده": 17, "هیفده": 17, "هجده": 18, "هیجده": 18, "نوزده": 19, "بیست": 20, "سی": 30, "چهل": 40, "پنجاه": 50,
    "شصت": 60, "هفتاد": 70, "هشتاد": 80, "نود": 90, "صد": 100, "یکصد": 100 };
  var NWK = Object.keys(NW).sort(function (a, b) { return b.length - a.length; }).join("|");
  var NW_RE = new RegExp("(^|[^آ-ی‌])((?:" + NWK + ")(?:[\\s‌]+و[\\s‌]+(?:" + NWK + "))*)(?=[\\s‌]*سال)", "g");
  G.numWords = function (t) { return String(t == null ? "" : t).replace(NW_RE, function (all, pre, ph) { var n = 0, ok = true;
    ph.split(/[\s‌]+و[\s‌]+/).forEach(function (w) { if (NW[w] == null) ok = false; else n += NW[w]; }); return ok && n >= 1 && n <= 120 ? pre + n : all; }); };
  function yy(y, jal) { y = +y; if (String(y).length > 2) return y; var t = todayJ(), c = t ? t[0] % 100 : 5; return jal ? (y <= c ? 1400 + y : 1300 + y) : (y <= (+A.today().slice(2, 4)) ? 2000 + y : 1900 + y); }
  /* سنی که خودش در همین متن گفت («۶۷ سالمه»، «۹ سالم شد»، «۱۵ ساله‌ام») */
  var AGE_SAID = /(?:^|[^\d])(\d{1,3})[\s‌]*(?:سالمه|سالم[\s‌]*(?:شد|است|هست)|ساله[\s‌]*(?:ام|هستم|شدم)|ساله‌ام|سالم(?![آ-ی])|سال[\s‌]*دارم|سالمه)(?![آ-ی])/;
  G.ageSaid = function (t) { var m = AGE_SAID.exec(G.numWords(normTx(t))); var n = m ? +m[1] : NaN; return n >= 1 && n <= 120 ? n : null; };
  /* parse(text, {age}) ⇒ {iso, j, cal} | {need:"year", jm, jd} | {err} | null (تاریخی نیست) */
  G.parse = function (text, o) {
    o = o || {}; var x = fing(normTx(text)), m, cal = "", y = null, mo = null, d = null, rel = null;
    if (!x) return null;
    if ((m = /(\d{4})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{1,2})/.exec(x))) { y = +m[1]; mo = +m[2]; d = +m[3]; cal = y < 1700 ? "j" : "g"; }
    else if ((m = /(?:^|[^\d])(\d{1,2})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{4})(?!\d)/.exec(x))) { y = +m[3]; mo = +m[2]; d = +m[1]; cal = y < 1700 ? "j" : "g"; }
    /* دورِ ۲۴ (R5، B24·D1 «96/2/30»): سالِ دورقمی با رقم — شیوهٔ ایرانی سال/ماه/روز، پس شمسی */
    else if ((m = /(?:^|[^\d])(\d{2})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{1,2})(?![\d\/\-.])/.exec(x))) { if (+m[3] > 31 && +m[1] <= 31) { y = yy(m[3], true); d = +m[1]; } else { y = yy(m[1], true); d = +m[3]; } mo = +m[2]; cal = "j"; }
    else if ((m = new RegExp("(?:^|[^\\d])(\\d{1,2})\\s*(?:ام|م|ِ)?\\s*" + JMRE + "(?:ه|ست|‌ست|است|م|ام|ِ)?(?![آ-ی])(?:\\s*(?:ماهِ|ماه))?(?:\\s*(?:سالِ|سال)?\\s*(\\d{4}|\\d{2})(?!\\d))?").exec(x))) { d = +m[1]; mo = JM.indexOf(m[2]) + 1; y = m[3] ? yy(m[3], true) : null; cal = "j"; }
    else { var lx = x.toLowerCase(); GM.some(function (g, i) { var re = new RegExp("(?:(\\d{1,2})\\s*(?:" + g.join("|") + ")|(?:" + g.join("|") + ")\\s*(\\d{1,2}))(?![a-zآ-ی])(?:\\s*,?\\s*(\\d{4}))?"), mm = re.exec(lx);
        if (!mm || (!mm[3] && g[0] === "may")) return false; d = +(mm[1] || mm[2]); mo = i + 1; y = mm[3] ? +mm[3] : null; cal = "g"; return true; }); }
    if (!cal) {
      if (/امروز[\s‌]*(?:تولدمه|تولدم[\s‌]*(?:است|هست|ه))|تولدم[\s‌]*امروز(?:ه|ست|است)/.test(x)) rel = 0;
      else if (/فردا[\s‌]*(?:تولدمه|تولدم[\s‌]*(?:است|هست|ه))|تولدم[\s‌]*فردا(?:ست|است|ه)/.test(x)) rel = 1;
      else if (/دیروز[\s‌]*تولدم[\s‌]*بود|تولدم[\s‌]*دیروز[\s‌]*بود/.test(x)) rel = -1;
      if (rel == null) return null;
      var tj = G.g2j(A.addDays(A.today(), rel)); cal = "j"; mo = tj[1]; d = tj[2]; y = null;
    }
    if (mo < 1 || mo > 12) return { err: "ماهِ «" + fa(mo) + "» در تقویم نیست — ماه عددی بینِ ۱ تا ۱۲ است؛ دوباره ببین." };
    if (cal === "g") {
      if (y == null) return { err: "سالِ تولد را هم بنویس." };
      var dt = new Date(Date.UTC(y, mo - 1, d)); if (d < 1 || dt.getUTCMonth() !== mo - 1) return { err: "این روز در آن ماه نیست — روز را دوباره ببین." };
      return fin(iso3([y, mo, d]), "g");
    }
    var age = o.age != null ? o.age : G.ageSaid(text);
    if (y == null) {
      if (age == null) return { need: "year", jm: mo, jd: d };
      var t = todayJ(), passed = (t[1] > mo) || (t[1] === mo && t[2] >= d); y = t[0] - age - (passed ? 0 : 1);
    }
    if (!jalCal(y)) return { err: "سالِ «" + fa(y) + "» درست به نظر نمی‌رسد — سالِ تولد را دوباره ببین." };
    var ml = jalMonthLen(y, mo);
    if (d < 1 || d > ml) return { err: mo === 12 && d === 30 ? "اسفندِ " + fa(y) + " ۲۹ روز دارد (آن سال کبیسه نبود) — روز را دوباره ببین." : "«" + JM[mo - 1] + "» " + fa(ml) + " روز دارد — روز را دوباره ببین." };
    return fin(G.j2g(y, mo, d), "j");
    function fin(v, c) {
      if (v < "1900-01-01") return { err: "این سال خیلی دور است — سالِ تولد را دوباره ببین." };
      if (v >= A.today()) return { err: "این تاریخ هنوز نیامده — سالِ تولد را دوباره ببین." };
      return { iso: v, j: G.g2j(v), cal: c };
    }
  };
  /* مسیرِ پیشین (فقط میلادی، رقمِ فارسی) — قرنطینه، نه حذف */
  function norm22(d) {
    var t = digits(d).trim();
    var m = /^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/.exec(t); if (!m) return t.slice(0, 10);
    var y = +m[1], mo = +m[2], da = +m[3], dt = new Date(Date.UTC(y, mo - 1, da));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== da) return "";
    return m[1] + "-" + ("0" + mo).slice(-2) + "-" + ("0" + da).slice(-2);
  }
  G.R23_QUARANTINE = { norm22: norm22 };
  function valid(d) { var r = G.parse(d); return r && r.iso && RE.test(r.iso) ? r.iso : ""; }
  G.valid = valid;
  function localBirth() { var p = (S.settings().profile) || {}; return valid(p.birth); }
  function hasHost() { return !!(A.HOST && typeof A.HOST.birth === "function"); }
  G._host = "";   // آخرین مقدارِ معتبرِ میزبان (فقط در حافظه)
  G.birth = function () { return (hasHost() && G._host) || localBirth(); };
  /* سن از تاریخ؛ بی تاریخ، سنی که خودش گفت («۱۵ سالمه»، روزش نگه داشته می‌شود) فقط برای گروهِ سنی — تاریخ همچنان پرسیده می‌شود (بانکِ R23 #20) */
  G.age = function (on) {
    var b = G.birth(), t = on || A.today();
    if (!b) { var p = (S.settings().profile) || {}, a = p.ageSaid; if (!a || !(a.age >= 1) || !/^\d{4}-\d{2}-\d{2}$/.test(a.on || "")) return null; var k = +t.slice(0, 4) - +a.on.slice(0, 4); if (t.slice(5, 10) < a.on.slice(5, 10)) k--; return a.age + Math.max(0, k); }
    var y = +t.slice(0, 4) - +b.slice(0, 4); if (t.slice(5, 10) < b.slice(5, 10)) y--; return y;
  };
  function saveLocal(d) { var st = S.settings(); st.profile = st.profile || {}; st.profile.birth = d; delete st.profile.birthMD; S.saveSettings(st); }
  /* ثبتِ صریحِ کاربر ⇒ صفحه + میزبان. setBirthInfo ⇒ {iso, j, cal} | {err} | {need}؛ setBirth ⇒ "" یا جملهٔ خطا (انسانی، بی «YYYY-MM-DD») */
  G.setBirthInfo = function (d, o) {
    var r = G.parse(d, o);
    if (!r) return { err: "تاریخ را نشناختم — مثلاً «۲۰ اردیبهشت ۱۳۳۸» یا «۱۳۳۸/۰۲/۲۰» (شمسی) یا «1959-05-10» (میلادی) بنویس." };
    if (r.need) return { need: r.need, jm: r.jm, jd: r.jd, err: "روزِ تولد (" + fa(r.jd) + " " + JM[r.jm - 1] + ") را گفتی — سالش را هم بنویس." };
    if (r.err) return r;
    var v = r.iso; saveLocal(v);
    if (hasHost()) { G._host = v; if (typeof A.HOST.setBirth === "function") { try { Promise.resolve(A.HOST.setBirth(v)).catch(function (e) { console.warn("setBirth", e); }); } catch (e) { console.warn(e); } } }
    return r;
  };
  G.setBirth = function (d) { var r = G.setBirthInfo(d); return r.iso ? "" : "تاریخِ تولد ثبت نشد: " + r.err; };
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

  /* دانستهٔ سامانه دربارهٔ سن (Q1، A23-28/A23-38، بانکِ R23 #17/#37) — برای بزرگسال هم در «# نقشهٔ سامانه» (a26 از A.SELF_FACTS) */
  (A.SELF_FACTS = A.SELF_FACTS || []).push({ id: "age", fa: "سن و تاریخِ تولد",
    use: "فقط شیوهٔ گفتن («# مخاطب» برای کودک/نوجوان/سالمند؛ منطقِ حل همان) و مقایسه با هم‌سن‌ها در «📐 سنجشِ استاندارد» (بی هنجارِ معتبر، همین را می‌گوید)",
    where: function () { return "فقط تاریخ، نه عددِ سن — " + (A.HOST && typeof A.HOST.birth === "function" ? "حسابِ خودِ کاربر در Lifemanager («من که هستم») و تنظیماتِ صفحه" : "تنظیماتِ صفحه"); },
    offline: "حسابِ سن و گروه کارِ خودِ صفحه است، بی شبکه",
    model: "مستقل از مدل؛ با عوض شدنِ مدل همان می‌ماند" });

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
    /* دورِ ۲۴ (R5، B24·D8): «از تاریخِ تولدِ ثبت‌شده» فقط وقتی تاریخی ثبت است؛ وگرنه از سنی که خودش گفت */
    var head = "- کاربر " + fa(age) + " ساله است (" + b.fa + "؛ " + (G.birth() ? "از تاریخِ تولدِ ثبت‌شده" : "از سنی که خودش گفت؛ تاریخِ تولد هنوز ثبت نشده") + "). از سنش حرف نزن و او را با سنش خطاب نکن.";
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
      /* دورِ ۲۳ (Q1، A23-9/B·D8/D23-26): بی فعلِ «بپرس» — گذرِ یک‌پرسشی (a27 oneTurnQ22) آن را دستورِ پرسشِ دوم می‌خواند و جمله را می‌شکست */
      "- گام‌ها: بگذار خودش جلو برود؛ گامِ بعد را خودش پیشنهاد کند — سهمِ تو پرسیدن است، نه گفتنِ گام؛ نصیحت و موعظه نه.",
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

  /* ---------- دورِ ۲۴ (R5، B aB1): نامِ مدرسهٔ کم‌سال در پرونده عینی نگه داشته نمی‌شود ----------
     پرونده (📜، متن و HTML ِ دانلودی) خلاصه‌ای است که می‌ماند و جابه‌جا می‌شود؛ نامِ مدرسه دادهٔ شناسایی است (همان که «# مخاطب» از کم‌سال نمی‌خواهد).
     خودِ پیام در سشن دست نمی‌خورد (حرفِ خودش است)؛ فقط آنچه پرونده نقل می‌کند. */
  var SCH = "(?:دبستانِ?|دبیرستانِ?|هنرستانِ?|مدرسه(?:‌ی|ی|ٔ|ِ)?|مهدکودکِ?|مهدِ?|پیش[\\s‌]?دبستانیِ?|آموزشگاهِ?)";
  var SCH_STOP = /^(?:ما|من|مون|مان|اسمش|نامش|اسم|نام|رو|را|که|هم|و|می[\s‌]?رم|میرم|می[\s‌]?رفتم|امروز|فردا|دیروز|بود|هست|است|خیلی|توی|تو|از|به|با|بودم|رفتم|نرفتم|معلم|معلممون|کلاس|خانم|آقا|امسال|پارسال|شون|شان|تون|تان|ش|م|یه|یک|این|اون|آن|همون|همین|دولتی|غیرانتفاعی|نمونه|تیزهوشان|ابتدایی|متوسطه|دخترانه|پسرانه|بعد|قبل|سر|سرِ|برای|اول|دوم|سوم|گفت|گفته|گفتن|داد|داده|دادن|داره|دارم|داریم|دارن|میره|می‌ره|میرن|رفت|میاد|میان|شد|شده|نیست|نبود|بودیم|هستیم|هستم|خوندم|خوندیم)$/;
  G.privText = function (t) {
    var x = String(t == null ? "" : t), ag = G.age(); if (ag == null || !G.minor(ag)) return x;
    return x.replace(new RegExp("(" + SCH + ")((?:[\\s‌]+(?:ما|مون|مان|من|شون))?(?:[\\s‌]+(?:اسمش|نامش)(?:[\\s‌]+(?:" + SCH + "))?)?)([\\s‌]+)([^\\s.،,!؟?؛:«»()]+(?:[\\s‌]+[^\\s.،,!؟?؛:«»()]+){0,2})", "g"), function (all, w, mid, sp, name) {
      /* «مدرسه/مهد» ِ بی کسره و بی «اسمش» اسمِ عام است («تو مدرسه گفت»)؛ «دبستان/دبیرستان/هنرستان …» و «… اسمش …» نام می‌گیرند */
      if (/^(?:مدرسه|مهدکودک|مهد|آموزشگاه)$/.test(w) && !/(?:اسمش|نامش)/.test(mid)) return all;
      var ws = name.split(/[\s‌]+/), keep = [];
      for (var i = 0; i < ws.length; i++) { var bare = ws[i].replace(/(?:‌ه|ه|است|‌است|ست)$/, ""); if (SCH_STOP.test(ws[i]) || SCH_STOP.test(bare) || /^[0-9۰-۹]/.test(ws[i])) break; keep.push(ws[i]); }
      if (!keep.length) return all;
      var rest = ws.slice(keep.length).join(" "), tail = /(?:‌ه|‌است|‌ام|‌ایم)$/.exec(keep[keep.length - 1]);
      return w + mid + sp + "[نامِ مدرسه]" + (tail ? tail[0] : "") + (rest ? " " + rest : "");
    });
  };
  G.privDossier = function (D) {
    try { var ag = G.age(); if (!D || ag == null || !G.minor(ag)) return D;
      (D.events || []).forEach(function (e) { if (!e) return; if (e.src && typeof e.src.text === "string") e.src = Object.assign({}, e.src, { text: G.privText(e.src.text) });
        if (Array.isArray(e.lines)) e.lines = e.lines.map(function (l) { return typeof l === "string" ? G.privText(l) : l; }); if (typeof e.out === "string") e.out = G.privText(e.out); });
      if (typeof D.statement === "string") D.statement = G.privText(D.statement); if (typeof D.title === "string") D.title = G.privText(D.title);
    } catch (e) { } return D;
  };
  if (typeof A.dossier === "function" && !A.dossier._priv24) { var rawDos = A.dossier; A.dossier = function () { return G.privDossier(rawDos.apply(this, arguments)); }; A.dossier._priv24 = true; }

  /* ---------- قلاب‌های دستیار ---------- */
  var AS = A.ASSIST;
  if (AS) {
    /* سطرهای خودِ صفحه به ضمیرِ گفت‌وگو (Q1، A23-14، B·D9): AS.regSys ِ a27 — «شما» ⇒ «تولدتان»، «بنویسید» */
    var say = function (s, t) { try { return AS.regSys ? AS.regSys(s, t) : t; } catch (e) { return t; } };
    G.say = say;
    /* تاریخِ تولدِ خودش در گفت‌وگو (Q1، بانکِ R23 #2/#7/#8/#10/#12): فقط جمله‌ای که تولدِ خودِ او را می‌گوید («تولدم …»، «متولدِ … ام»، «… به دنیا اومدم»،
       «امروز تولدمه»)؛ تولدِ دیگری («تولدِ مامانم»)، موعد یا رویدادِ گذشته نه. صفحه خودش تبدیل و ثبت می‌کند (بی نیاز به گزارشِ مدل)؛ روز بی سال و بی سن ⇒
       فقط کارت سال را می‌پرسد. «X سالمه» ِ تنها ⇒ گروهِ سنی تا تاریخ داده شود. */
    var OWN_BIRTH = /تولدم(?![آ-ی‌]*\s*(?:رو|را)\s*(?:جشن|گرفت))|متولدِ?[\s‌][^.؟?!\n]{1,30}?(?:ام|هستم|م)(?![آ-ی])|(?:به|ب)[\s‌]*دنیا[\s‌]*(?:اومدم|آمدم)/;
    /* دورِ ۲۴ (R5، B24·D6، D24-5، A24-20، C): یک سطرِ تأیید برای هر تاریخ در هر سشن (صفحه از گفت‌وگو، کارت یا کنشِ birth ِ مدل — هر کدام زودتر)، فقط شمسی؛
       ضمیرش را AS.regSys هنگامِ نقش بستن می‌گذارد («تولدتان» برای «شما» و سالمند). */
    G.confirmLine = function (iso) { return "✓ تاریخِ تولدت ثبت شد: " + G.faDate(iso) + " — سن هر بار از همین تاریخ حساب می‌شود."; };
    G.confirmed = function (s, iso) { return !!s && (s.msgs || []).some(function (m) { return m && m.role === "sys" && m.birth === iso; }); };
    G.confirmOnce = function (s, iso) { if (!s || !iso || G.confirmed(s, iso)) return false; s.msgs = s.msgs || []; s.msgs.push({ role: "sys", at: new Date().toISOString(), birth: iso, text: G.confirmLine(iso) }); s.ageAsk = "given"; try { S.put(s); } catch (e) { } return true; };
    /* تاریخی که صفحه خودش از آخرین پیامِ او خواند (همان OWN_BIRTH ِ fromChat) — کنشِ مدل هرگز آن را بازنویسی نمی‌کند (B24·D7) */
    G.pageParse = function (s) { var M = (s && s.msgs) || [], u = null; for (var i = M.length - 1; i >= 0; i--) { if (M[i] && M[i].role === "user") { u = M[i]; break; } }
      var t = u ? String(u.text || "").trim() : ""; if (!t || /^\[/.test(t) || !OWN_BIRTH.test(normTx(t))) return "";
      var r = G.parse(t, { age: G.ageSaid(t) }); return r && r.iso ? r.iso : ""; };
    /* کنشِ birth ِ مدل (a34 AS.DO.birth): تاریخ همان‌طور که گفت؛ صفحه تبدیل و وارسی می‌کند؛ اگر صفحه همان پیام را خوانده، خواندنِ صفحه می‌ماند */
    G.fromModel = function (a, s) {
      var d = String((a && (a.date || a.text)) || "").trim(), ag = a && a.age != null && +a.age >= 1 ? +a.age : null;
      var r = G.parse(d, { age: ag }), pg = G.pageParse(s);
      if (r && r.iso && pg && r.iso !== pg) { console.warn("birth: model date " + r.iso + " ignored; the page read " + pg + " from her message"); r = { iso: pg }; }
      else if ((!r || !r.iso) && pg) r = { iso: pg };
      if (!r) return "تاریخِ تولد ثبت نشد: تاریخ را نشناختم — همان‌طور که گفت بفرست (مثلاً «۲۰ اردیبهشت ۱۳۳۸»).";
      if (r.need) return "تاریخِ تولد ثبت نشد: روز (" + fa(r.jd) + " " + JM[r.jm - 1] + ") هست، سال نیست — سنی که گفت را با \"age\" بفرست.";
      if (r.err) return "تاریخِ تولد ثبت نشد: " + r.err;
      if (G.birth() !== r.iso) { var w = G.setBirthInfo(r.iso); if (!w.iso) return "تاریخِ تولد ثبت نشد: " + (w.err || ""); }
      if (s) { G.confirmOnce(s, r.iso); return ""; }
      return RE.test(d) ? "" : G.confirmLine(r.iso);   // بی سشن: قراردادِ پیشین — ISO ⇒ "" (test_age_sync)؛ تاریخِ گفته‌شده ⇒ همان یک سطرِ شمسی
    };
    G.fromChat = function (s, msg) {
      var t = String(msg || "").trim(); if (!t || /^\[/.test(t)) return null;
      var x = normTx(t), age = G.ageSaid(t), st = S.settings(), pr = st.profile = st.profile || {}, out = null;
      if (OWN_BIRTH.test(x)) {
        var r = G.parse(t, { age: age });
        if (r && r.iso) { var w = G.setBirthInfo(t, { age: age }); if (w.iso) out = { saved: w.iso }; }
        else if (r && r.need && !G.birth()) { pr.birthMD = { jm: r.jm, jd: r.jd, at: A.today() }; S.saveSettings(st); out = { need: true }; }
      }
      if (!out && age != null && !G.birth()) {
        var md = pr.birthMD; if (md && md.jm) { var w2 = G.setBirthInfo(fa(md.jd) + " " + JM[md.jm - 1], { age: age }); if (w2.iso) out = { saved: w2.iso }; }
        if (!out) { pr.ageSaid = { age: age, on: A.today() }; S.saveSettings(st); out = { age: age }; }
      }
      if (out && out.saved && s) G.confirmOnce(s, out.saved);
      return out;
    };
    AS.promptHooks = AS.promptHooks || [];
    AS.promptHooks.push(function (s, msg) { try { G.fromChat(s, msg); } catch (e) { } try { return G.audience(); } catch (e) { return ""; } });
    /* کارتِ پرسشِ تاریخِ تولد: نخستین نوبتِ سشن (پس از نخستین پیامِ کاربر)، یک بار در سشن تا داده شود */
    G.askNode = function (s, onDone) {
      /* متنی، نه type=date: پنجرهٔ بومیِ تاریخ در پنجرهٔ شناورِ دستیار رویدادهای اشاره‌گر را می‌بلعید (کشیدنِ سرتیتر در test_tour از کار می‌افتاد) */
      var md = ((S.settings().profile) || {}).birthMD, mdTx = md && md.jm ? fa(md.jd) + " " + JM[md.jm - 1] : "", qb = null;
      var inp = h("input", { type: "text", class: "inp sm age-in", dir: "rtl", "data-own": "1", "aria-label": mdTx ? "سالِ تولد" : "تاریخِ دقیقِ تولد (شمسی یا میلادی)", placeholder: mdTx ? "مثلاً ۱۳۸۵" : "مثلاً ۲۰ تیر ۱۳۸۵ یا ۱۳۸۵/۰۴/۲۰" }), msg = h("p", { class: "small bad age-err", role: "alert" });
      var go = function () {
        var v = String(inp.value || "").trim(); if (mdTx && /^[0-9۰-۹٠-٩]{2,4}$/.test(v)) v = mdTx + " " + v;
        var r = G.setBirthInfo(v);
        /* دورِ ۲۴ (R5، B24·D1): روزی که در خودِ کارت نوشت نگه داشته می‌شود؛ پرسشِ کارت همان‌جا «سالش را هم…» می‌شود و «۸۸» ِ بعدی همان روز را کامل می‌کند */
        if (r.need && r.jm) { var st0 = S.settings(); st0.profile = st0.profile || {}; st0.profile.birthMD = { jm: r.jm, jd: r.jd, at: A.today() }; S.saveSettings(st0);
          mdTx = fa(r.jd) + " " + JM[r.jm - 1]; inp.value = ""; inp.setAttribute("aria-label", "سالِ تولد"); inp.setAttribute("placeholder", "مثلاً ۱۳۸۵ یا ۸۵");
          if (qb) qb.textContent = say(s, "روزِ تولدت را گفتی (" + mdTx + ") — سالش را هم بنویس؟ "); msg.textContent = ""; return; }
        if (!r.iso) { msg.textContent = say(s, r.err); return; }
        if (s) G.confirmOnce(s, r.iso);
        if (onDone) onDone(); };
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); go(); } });
      return h("div", { class: "card soft age-ask", dir: "rtl", role: "group", "aria-label": "تاریخِ دقیقِ تولد" },
        h("p", { class: "small" }, (qb = h("b", {}, say(s, mdTx ? "روزِ تولدت را گفتی (" + mdTx + ") — سالش را هم بنویس؟ " : "تاریخِ دقیقِ تولدت را بنویس؟ (شمسی یا میلادی) "))), h("span", { class: "age-why" }, say(s, G.WHY))),
        h("div", { class: "row gap wrap" }, inp,
          h("button", { class: "btn sm", type: "button", "data-own": "1", onclick: go }, "ثبت"),
          h("button", { class: "btn ghost sm", type: "button", "data-own": "1", onclick: function () { if (s) { s.ageAsk = "later"; S.put(s); } if (onDone) onDone(); } }, "بعداً")), msg);
    };
    /* «امروز» به ضمیرِ او (بانکِ R23 #14): هر سطرِ متنیِ «امروز» از AS.regPage می‌گذرد — آخرین پوشش، پس از همهٔ بخش‌ها */
    if (typeof A.dueList === "function" && !A.dueList._reg23) { var rawDue = A.dueList;
      A.dueList = function () { var it = rawDue.apply(this, arguments) || []; if (!AS.regPage) return it;
        try { return it.map(function (x) { if (!x || typeof x !== "object") return x; var y = Object.assign({}, x); ["txt", "sub", "act"].forEach(function (k) { if (typeof y[k] === "string") y[k] = AS.regPage(y[k]); }); return y; }); } catch (e) { return it; } };
      A.dueList._reg23 = true; }
    AS.logHooks = AS.logHooks || [];
    AS.logHooks.push(function (s) {
      if (!s || s.ageAsk || G.birth()) return null;
      if (!(s.msgs || []).some(function (m) { return m.role === "user"; })) return null;
      return G.askNode(s, function () { try { if (AS.paint) AS.paint(); } catch (e) { } });
    });
  }
})(APP);
