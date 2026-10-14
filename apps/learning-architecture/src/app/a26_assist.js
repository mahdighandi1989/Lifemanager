/* ===== «💬 دستیار»: لایهٔ گفت‌وگوی شناور روی کلِ صفحه (مالک ۲۰۲۶-۱۰-۱۴) =====
   خواستهٔ مالک: «صفحه هنوز گیج‌کننده است … به‌جای ساده‌کردنِ دوباره، یک چت‌باتِ هوشمند که اشرافِ کامل دارد، فایل و عکس می‌خواند،
   همان قسمتی را که باید بروم باز می‌کند، فرم را از حرف‌هایم پر می‌کند و باقی را هایلایت می‌کند، سشن‌ها با نام و فولدرِ درایو دارد،
   حرفِ نامربوط را می‌گوید نامربوط است، و اگر سامانه کاری را بلد نیست یک برگهٔ فوری در «نظارت و سرکشی» ثبت می‌کند».
   ساختار — چت فقط «لایهٔ جلو» است؛ خودِ صفحه «پشتِ صحنه» می‌ماند و بی‌چت هم کامل کار می‌کند:
     • اشراف از خودِ ثبت‌گاه‌ها ساخته می‌شود، نه دستی: A.V (همهٔ نماها) + A.VIEW_META + منوها + سه مسیرِ کاری + واژه‌نامه + تکنیک‌ها،
       ایستگاه‌ها، خانواده‌های گره، حرکت‌ها + دادهٔ خودِ کاربر + فیلدهای همین لحظهٔ صفحه (پویشِ DOM). نمای تازه = اشرافِ تازه (آزمون: test_assist.js).
     • هوشِ چت (کارِ «lla_assistant»: سریع، ارزان، بینا) فقط راه می‌نماید، فرم پر می‌کند، فایل را کوتاه می‌خواند و پیوست می‌کند؛
       کارِ عمیق با همان دکمه‌های هوشِ خودِ بخش‌هاست. حکم و نمره کارِ صفحه و خودِ کاربر است (هوش هرگز داوری نمی‌کند).
     • هر اثر از راهِ خودِ فرم‌های صفحه است (مقدار + رویدادِ input/change) ⇒ همان ذخیره‌ای که دستی رخ می‌دهد.
     • سشن = رکوردِ «achat»؛ پیوست‌ها به فولدرِ همان سشن در درایو (…/دستیار — گفت‌وگوها/<نام · شناسه>/پیوست‌ها/) و آینه
       (a12_mirror BUILD.achat) متنِ گفت‌وگو و مراحل را در شیتِ همان فولدر می‌نویسد.
     • کمبودِ سامانه ⇒ HOST.report: برگهٔ فوری با انتزاع، جای افزودن، پیوندها، هماهنگی با روال‌ها و مستنداتی که باید به‌روز شوند. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S;
  var AS = A.ASSIST = {};
  var TYPE = "achat", GROUP = "دستیار — گفت‌وگوها", MAX_MSGS = 400, CTX_MSGS = 12, MAX_AUTO = 2;
  var blobs = {};            // شناسهٔ پیوست ⇒ File (فقط همین بارِ مرورگر؛ برای «پیوست به فرم»)
  var ui = null, busy = false;

  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem("lla.assist." + k) || "null"); localStorage.setItem("lla.assist." + k, JSON.stringify(v)); } catch (e) { return null; } }
  function now() { return new Date().toISOString(); }
  function clip(s, n) { s = String(s == null ? "" : s).replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; }

  /* ---------- اشراف: نقشهٔ سامانه از خودِ ثبت‌گاه‌ها ---------- */
  var JOB_FA = { understand: "فهمیدنِ عمیق", judge: "سنجیدنِ ادعا و تصمیم", untie: "گره‌گشایی و حلِ مسئله", ws: "کارگاه و مرجع" };
  function navAll() { return (A.NAV || []).concat(A.EPI_NAV || [], [A.NAV_SETTINGS, A.NAV_START, A.NAV_WHOLE, A.NAV_MAPS]).filter(function (n) { return n && n[0]; }); }
  function labelOf(v) {
    var n = navAll().filter(function (x) { return x[0] === v; })[0];
    return (n && n[1]) || (A.VIEW_FA || {})[v] || (A.viewLabel ? A.viewLabel(v) : v);
  }
  AS.views = function () {
    return Object.keys(A.V).filter(function (v) { return typeof A.V[v] === "function"; }).map(function (v) {
      var m = (A.VIEW_META || {})[v] || {};
      return { id: v, label: labelOf(v), job: m.j || "", what: m.what || "", why: m.why || "", inMenu: navAll().some(function (n) { return n[0] === v; }) };
    });
  };
  /* رکوردهای خودِ کاربر که با یک «go» باز می‌شوند (نوع ⇒ نما و آرگومان) */
  var OPEN = {
    topic: function (r) { return ["topic", r.id]; }, "case": function (r) { return ["e_case", r.id]; }, kcase: function (r) { return ["kcase", r.id]; },
    knot: function (r) { return ["knot", r.id]; }, eprob: function (r) { return r.p && r.p.id ? ["e_prob", r.p.id, "about"] : null; }
  };
  var TYPE_FA = { topic: "موضوع", "case": "پروندهٔ سنجش", kcase: "موقعیتِ گیر", knot: "گرهِ ذهنی", eprob: "مسئلهٔ من" };
  AS.entities = function () {
    var out = [];
    Object.keys(OPEN).forEach(function (t) {
      S.all(t, function (r) { return !r.sample; }).sort(function (a, b) { return String(b.updated || "").localeCompare(String(a.updated || "")); }).slice(0, 15).forEach(function (r) {
        var o = OPEN[t](r); if (!o) return;
        out.push({ type: t, fa: TYPE_FA[t], title: clip(r.title || (r.p && r.p.title) || r.fa || r.id, 70), view: o[0], arg: o[1], sub: o[2] || "" });
      });
    });
    return out;
  };
  function names(arr, k, f) { return (arr || []).map(function (x) { return x[k] + "=" + clip(x[f], 40); }).join("، "); }
  AS.manifest = function () {
    var L = [];
    L.push("## نماها (view — نام — کدام کار — چیست — به چه کار می‌آید)");
    AS.views().forEach(function (v) { L.push("- " + v.id + " — " + v.label + (v.job ? " — " + (JOB_FA[v.job] || v.job) : "") + (v.what ? " — " + v.what : "") + (v.why ? " — " + v.why : "")); });
    var F = A.ORIENT_FLOWS || {};
    L.push("## مسیرهای کاریِ قدم‌به‌قدم");
    Object.keys(F).forEach(function (k) { L.push("- " + F[k].fa + ": " + F[k].steps.map(function (s, i) { return (i + 1) + ") [" + s.v + "] " + s.t; }).join(" ")); });
    if (A.ORIENT_WORDS) { L.push("## واژه‌نامه"); A.ORIENT_WORDS.forEach(function (w) { L.push("- " + w[0] + ": " + w[1]); }); }
    L.push("## ثبت‌گاه‌ها (برای go: view=tech arg=شمارهٔ تکنیک؛ view=e_st ایستگاه‌ها؛ view=move arg=شناسهٔ حرکت)");
    if (A.T) L.push("- تکنیک‌های یادگیری: " + A.T.map(function (t) { return t.id + "=" + t.fa; }).join("، "));
    if (A.ESTL) L.push("- ایستگاه‌های کارخانه: " + names(A.ESTL, "id", "fa"));
    if (A.KF) L.push("- خانواده‌های گره: " + names(A.KF, "id", "fa"));
    if (A.MOVE_LIST) L.push("- حرکت‌های حلِ مسئله: " + names(A.MOVE_LIST, "id", "fa"));
    if (A.C && A.C.PROTOCOLS) L.push("- روال‌ها (view=proto arg=id): " + names(A.C.PROTOCOLS, "id", "fa"));
    var E = AS.entities();
    L.push("## دادهٔ خودِ کاربر (برای بازکردن: view و arg همین‌جا)");
    if (!E.length) L.push("- هنوز چیزی ثبت نکرده.");
    E.forEach(function (e) { L.push("- " + e.fa + " «" + e.title + "» → view=" + e.view + " arg=" + e.arg + (e.sub ? " sub=" + e.sub : "")); });
    return L.join("\n");
  };

  /* ---------- پویشِ صفحهٔ فعلی: هر فیلد/دکمهٔ دیدنی یک کلید (data-ai-k) ---------- */
  function visible(el) { if (el.type === "hidden" || el.disabled) return false; if (el.type === "file") return true; var r = el.getBoundingClientRect(); return !!(r.width || r.height || el.getClientRects().length); }
  function labelFor(el) {
    var t = el.getAttribute("aria-label") || "";
    if (!t && el.id) { var lb = document.querySelector('label[for="' + (window.CSS && CSS.escape ? CSS.escape(el.id) : el.id) + '"]'); if (lb) t = lb.textContent; }
    if (!t) { var pl = el.closest("label"); if (pl) t = pl.textContent; }
    if (!t && el.tagName === "BUTTON") t = el.textContent;
    if (!t) t = el.getAttribute("placeholder") || el.getAttribute("title") || "";
    if (!t) { var p = el.parentElement, i = 0; while (p && i < 3 && !t) { var lab = p.querySelector("label,.fl,.lbl,h3,h4,b,strong"); if (lab && !lab.contains(el)) t = lab.textContent; p = p.parentElement; i++; } }
    return clip(t, 90);
  }
  var SCAN = {};
  AS.scan = function () {
    var main = document.getElementById("main"), fields = [], buttons = [], heads = [];
    SCAN = {};
    if (!main) return { fields: fields, buttons: buttons, heads: heads };
    main.querySelectorAll("h1,h2,h3").forEach(function (x, i) { if (i < 12) heads.push(clip(x.textContent, 70)); });
    var n = 0;
    main.querySelectorAll("input,textarea,select,button").forEach(function (el) {
      if (!visible(el) || el.closest(".as-root")) return;
      var tag = el.tagName.toLowerCase(), type = tag === "input" ? (el.type || "text") : tag, lab = labelFor(el);
      if (tag === "button" && (!lab || buttons.length >= 60)) return;
      if (tag !== "button" && fields.length >= 80) return;
      var k = "k" + (++n); el.setAttribute("data-ai-k", k);
      var sec = el.closest("[data-report-section-label]");
      SCAN[k] = { tag: tag, type: type, label: lab };
      if (tag === "button") { buttons.push({ k: k, label: lab }); return; }
      var f = { k: k, type: type, label: lab, section: sec ? clip(sec.getAttribute("data-report-section-label"), 40) : "" };
      if (type === "checkbox" || type === "radio") f.value = el.checked ? "✓" : "";
      else if (type !== "file") f.value = clip(el.value, 120);
      if (tag === "select") f.options = Array.prototype.slice.call(el.options, 0, 25).map(function (o) { return o.value + "=" + clip(o.textContent, 30); }).join(" | ");
      if (el.required || el.getAttribute("aria-required") === "true") f.required = true;
      fields.push(f);
    });
    return { fields: fields, buttons: buttons, heads: heads };
  };
  function scanText(sc) {
    var L = ["نما: " + A.state.view + " (" + labelOf(A.state.view) + ")" + (A.state.arg != null ? " arg=" + A.state.arg : "") + (A.state.sub ? " sub=" + A.state.sub : "")];
    if (sc.heads.length) L.push("سرتیترها: " + sc.heads.join(" | "));
    L.push("فیلدها:"); if (!sc.fields.length) L.push("- (این صفحه فیلدی ندارد)");
    sc.fields.forEach(function (f) { L.push("- " + f.k + " | " + f.type + " | «" + f.label + "»" + (f.section ? " | بخش: " + f.section : "") + (f.type === "file" ? " | (پیوست)" : " | مقدار: " + (f.value ? "«" + f.value + "»" : "خالی")) + (f.options ? " | گزینه‌ها: " + f.options : "") + (f.required ? " | لازم" : "")); });
    L.push("دکمه‌ها: " + (sc.buttons.map(function (b) { return b.k + "=«" + b.label + "»"; }).join("، ") || "—"));
    return L.join("\n");
  }
  /* کلیدِ کهنه (نما دوباره رسم شد) ⇒ با همان برچسب و نوع دوباره پیدا کن */
  function el(k) {
    var x = document.querySelector('[data-ai-k="' + k + '"]'); if (x && document.contains(x)) return x;
    var sig = SCAN[k]; if (!sig) return null;
    AS.scan();
    var hit = Object.keys(SCAN).filter(function (j) { return SCAN[j].tag === sig.tag && SCAN[j].label === sig.label; })[0];
    return hit ? document.querySelector('[data-ai-k="' + hit + '"]') : null;
  }

  /* ---------- کارها روی صفحه ---------- */
  var DANGER = /حذف|پاک|برداشتن|بایگانی|delete|remove|reset|بازنشانی|ریختن|خروج/i;
  function fire(x, ev) { x.dispatchEvent(new Event(ev, { bubbles: true })); }
  function setVal(x, v) {
    var proto = x.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : x.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    var d = Object.getOwnPropertyDescriptor(proto, "value"); if (d && d.set) d.set.call(x, v); else x.value = v;
  }
  function mark(x, why, kind) {
    x.classList.add(kind === "fill" ? "as-filled" : "as-hl");
    if (why) { x.setAttribute("data-as-why", why); if (!x.title) x.title = why; }
    if (kind !== "fill") x.addEventListener("input", function off() { x.classList.remove("as-hl"); x.removeEventListener("input", off); });
  }
  AS.clearMarks = function () { document.querySelectorAll(".as-hl,.as-filled").forEach(function (x) { x.classList.remove("as-hl", "as-filled"); }); };
  var DO = {
    go: function (a) {
      if (!a.view || !A.V[a.view]) return "نمای «" + (a.view || "") + "» نیست";
      (A.goRoot && !a.arg ? A.goRoot : A.go)(a.view, a.arg == null || a.arg === "" ? null : a.arg, a.sub || null);
      return "";
    },
    fill: function (a) {
      var x = el(a.k); if (!x) return "فیلدِ " + a.k + " پیدا نشد";
      if (x.type === "file") return "پیوست با attach";
      if (x.type === "checkbox" || x.type === "radio") { var on = a.value === true || /^(1|true|بله|✓|on)$/i.test(String(a.value)); if (x.checked !== on) x.click(); }
      else { setVal(x, String(a.value == null ? "" : a.value)); fire(x, "input"); fire(x, "change"); }
      mark(x, a.why || "دستیار از حرفِ تو پر کرد — اگر درست نیست عوضش کن", "fill");
      return "";
    },
    highlight: function (a) { var x = el(a.k); if (!x) return "فیلدِ " + a.k + " پیدا نشد"; mark(x, a.why || "این را خودت پر کن", "hl"); return ""; },
    click: function (a) {
      var x = el(a.k); if (!x) return "دکمهٔ " + a.k + " پیدا نشد";
      if (DANGER.test(x.textContent || "") || DANGER.test(x.getAttribute("aria-label") || "")) return "دکمهٔ «" + clip(x.textContent, 30) + "» را خودت بزن (کارِ برگشت‌ناپذیر)";
      x.click(); return "";
    },
    attach: function (a) {
      var x = el(a.k); if (!x || x.type !== "file") return "جای پیوست پیدا نشد";
      var fs = (a.fileIds || []).map(function (id) { return blobs[id]; }).filter(Boolean);
      if (!fs.length) return "فایل در این بارِ مرورگر نیست — خودت از «انتخابِ فایل» بگذار";
      try { var dt = new DataTransfer(); fs.forEach(function (f) { dt.items.add(f); }); x.files = dt.files; fire(x, "change"); mark(x, "دستیار پیوست کرد", "fill"); return ""; }
      catch (e) { return "مرورگر اجازهٔ پیوستِ خودکار نداد — خودت بگذار"; }
    }
  };
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  AS.run = function (actions) {
    var notes = [], moved = false, chain = Promise.resolve();
    (actions || []).slice(0, 30).forEach(function (a) {
      chain = chain.then(function () {
        if (!a || !DO[a.do]) return;
        var r = ""; try { r = DO[a.do](a); } catch (e) { r = e.message; }
        if (r) notes.push(r);
        if (a.do === "go" && !r) { moved = true; return wait(350); }
        if (a.do === "click") return wait(250);
      });
    });
    return chain.then(function () {
      var first = document.querySelector(".as-hl") || document.querySelector(".as-filled");
      if (first && first.scrollIntoView) try { first.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) { }
      return { notes: notes, moved: moved };
    });
  };

  /* ---------- سشن‌ها ---------- */
  AS.sessions = function () { return S.all(TYPE).sort(function (a, b) { return String(b.updated || "").localeCompare(String(a.updated || "")); }); };
  AS.newSession = function () { var s = { id: A.uid("achat"), type: TYPE, title: "", pinned: "", status: "", memory: "", msgs: [], steps: [], files: [], reports: [] }; S.put(s); store("cur", s.id); return s; };
  AS.cur = function () { var id = store("cur"), s = id && S.get(id); return s && s.type === TYPE ? s : null; };
  function provisional(s, text) { return s.title || clip(text, 50) || "گفت‌وگوی تازه"; }

  /* ---------- پیام به هوش ---------- */
  var SYS = [
    "تو «دستیار» ِ صفحهٔ «معماری یادگیری عمیق و کارخانهٔ معرفت‌شناسی» هستی: همراهی آرام و کوتاه‌گو که کاربر را بی‌دردسر به هدفش می‌رساند.",
    "کارت: (۱) بفهمی کاربر چه می‌خواهد؛ (۲) او را به نما/بخش/فرمِ درست ببری (یک یا چند بخش، به ترتیب)؛ (۳) فرم را فقط از حرف‌ها و فایل‌های خودِ او پر کنی و باقیِ فیلدهای لازم را هایلایت کنی با یک جملهٔ کوتاه که چه بنویسد — یا اگر خواست، یکی‌یکی بپرسی و خودت پر کنی؛ (۴) فایل/عکس را کوتاه بخوانی و اگر فرم جای پیوست دارد پیوستش کنی؛ (۵) قدم‌به‌قدم مثلِ خودِ او با فرم جلو بروی.",
    "قاعده‌های سخت:",
    "- کوتاه: پاسخ حداکثر ۳ جمله (حدود ۶۰ واژه)، فارسیِ ساده، بی تعارف، در هر نوبت حداکثر یک پرسش.",
    "- چیزی از خودت نساز: فیلدی را که کاربر چیزی برایش نگفته پر نکن؛ هایلایتش کن. در کاربرگِ تمرینِ تکنیک‌ها پاسخِ تمرین را ننویس (اثرِ تولید) — فقط جای نوشتن را نشان بده.",
    "- داوری نکن: حکم، نمره و سقفِ اطمینان کارِ خودِ صفحه و کاربر است؛ برای کارِ عمیق دکمهٔ هوشِ همان بخش را (با click) بزن یا نشانش بده.",
    "- فقط کلیدهایی (k…) را به کار ببر که در «صفحهٔ فعلی» آمده و فقط نماهایی که در «نقشهٔ سامانه» هست. دکمهٔ حذف/پاک‌کردن را هرگز نزن.",
    "- وقتی کاربر را به نمای دیگری می‌بری و هنوز فیلدهایش را نمی‌بینی، فقط go بده؛ سامانه پس از بازشدن فیلدها را برایت می‌فرستد تا پر کنی.",
    "- حرفِ نامربوط (بیرون از یادگیری، معرفت‌شناسی/سنجشِ ادعا، گره‌گشایی/حلِ مسئله و کار با همین صفحه): status=\"unrelated\" و مؤدبانه بگو به این‌جا ربطی ندارد و در یک جمله بگو چه کمکی از این‌جا برمی‌آید.",
    "- کمبودِ سامانه: اگر خواسته در قلمروِ همین صفحه است ولی هیچ نما/فرمی آن را پوشش نمی‌دهد (یا ناقص است)، status=\"gap\" و gap را کامل پر کن: مسئلهٔ کاربر را تکرار نکن؛ نیاز را انتزاع کن (این دسته از خواسته‌ها و نمونه‌های مشابه)، دقیق بگو چه چیزی کم است، کجا (کدام نما/فایل/ثبت‌گاه)، چطور افزوده شود، و با کدام بخش‌ها پیوند دارد. به کاربر هم بگو برگهٔ فوری ثبت شد و تا آن موقع نزدیک‌ترین راهِ موجود چیست.",
    "- حافظه: memory خلاصهٔ انباشتهٔ کلِ همین سشن است (هدف، تصمیم‌ها، آنچه پر شد، آنچه مانده) — هر بار کاملش را برگردان.",
    "- pinned: خواستهٔ اصلیِ سشن در یک جمله (نوبتِ اول بساز؛ بعداً فقط اگر خواستهٔ اصلی واقعاً عوض شد).",
    "- steps: فهرستِ کاملِ مراحلِ رسیدن به خواستهٔ اصلی با وضعِ هر کدام (done/now/todo) و نمای هر کدام.",
    "خروجی فقط یک JSON (بی متنِ دیگر):",
    '{"reply":"…","title":"نامِ کوتاهِ سشن (۲ تا ۶ واژه؛ نوبتِ اول)","pinned":"…","memory":"…","status":"related|unrelated|gap",' +
    '"steps":[{"t":"…","s":"done|now|todo","view":"…"}],' +
    '"actions":[{"do":"go","view":"…","arg":"…","sub":"…"},{"do":"fill","k":"k3","value":"…"},{"do":"highlight","k":"k5","why":"…"},{"do":"click","k":"k9"},{"do":"attach","k":"k7","fileIds":[12]}],' +
    '"gap":{"title":"…","abstract":"…","missing":"…","where":"…","how":"…","relations":"…","docs":"…"}}'
  ].join("\n");
  AS.SYS = SYS;
  function readText(f) {
    if (!f || f.size > 300000 || !(/^text\/|json|csv|xml|markdown/.test(f.type || "") || /\.(txt|md|csv|json|tsv|xml|html?)$/i.test(f.name || ""))) return Promise.resolve("");
    return new Promise(function (res) { try { var r = new FileReader(); r.onload = function () { res(String(r.result || "").slice(0, 6000)); }; r.onerror = function () { res(""); }; r.readAsText(f); } catch (e) { res(""); } });
  }
  function userPrompt(s, msg, sc, extra) {
    var L = ["# سشن", "نام: " + (s.title || "(هنوز بی‌نام)"), "خواستهٔ اصلی (سنجاق‌شده): " + (s.pinned || "(هنوز نیست)"), "حافظهٔ سشن: " + (s.memory || "(خالی)")];
    if (s.steps && s.steps.length) L.push("مراحل: " + s.steps.map(function (x, i) { return (i + 1) + ") " + x.t + " [" + (x.s || "todo") + "]"; }).join(" "));
    if (s.files && s.files.length) L.push("پیوست‌های سشن (id=نام): " + s.files.map(function (f) { return f.id + "=" + f.name; }).join("، "));
    if (s.reports && s.reports.length) L.push("برگه‌های ثبت‌شده در این سشن: " + s.reports.map(function (r) { return "#" + r.number + " " + r.title; }).join("، "));
    L.push("", "# صفحهٔ فعلی", scanText(sc), "", "# گفت‌وگوی اخیر");
    s.msgs.slice(-CTX_MSGS).forEach(function (m) { L.push((m.role === "user" ? "کاربر: " : m.role === "sys" ? "سامانه: " : "دستیار: ") + clip(m.text, 600) + (m.files && m.files.length ? " [پیوست: " + m.files.map(function (f) { return f.name; }).join("، ") + "]" : "")); });
    L.push("", "# نوبتِ تازه", msg);
    if (extra) L.push(extra);
    return L.join("\n");
  }
  /* نقشهٔ سامانه در بخشِ «کاربر» می‌رود (سقفِ سرور ۶۰هزار نویسه؛ پیامِ سیستم ۲۰هزار) — اشراف که بزرگ شد، تماس نمی‌شکند */
  var MAX_USER = 58000;
  AS.prompt = function (s, msg, sc, extra) {
    var man = "# نقشهٔ سامانه (خودکار از ثبت‌گاه‌ها)\n" + AS.manifest() + "\n\n", rest = userPrompt(s, msg, sc, extra);
    if (man.length + rest.length > MAX_USER) rest = rest.slice(0, Math.max(4000, MAX_USER - man.length));
    return (man + rest).slice(0, MAX_USER);
  };
  function parse(t) { var o = A.parseJSONLoose ? A.parseJSONLoose(t) : JSON.parse(t); if (!o || typeof o.reply !== "string") throw new Error("پاسخِ دستیار ناخوانا بود"); return o; }
  function ask(sys, user, opts) {
    return A.callAI(sys, user, opts).then(function (t) { try { return parse(t); } catch (e) { return A.callAI(sys, user, opts).then(parse); } });
  }

  /* ---------- کمبود ⇒ برگهٔ فوری در «نظارت و سرکشی» ---------- */
  function norm(t) { return String(t || "").replace(/[\s‌«»"'.,،:؛!?؟()\-]+/g, "").slice(0, 60); }
  AS.reportText = function (s, g) {
    var sp = (A.state.view || "") + (A.state.arg != null ? " / " + A.state.arg : "");
    return [
      "[دستیار · کمبودِ سامانه] " + clip(g.title || s.pinned || "کمبودِ سامانه", 110),
      "",
      "ثبت‌شده توسط «💬 دستیار» (نه مستقیمِ مالک) — سشن «" + (s.title || s.id) + "» (" + s.id + ")، هنگامِ کار روی نمای " + sp + ". روال‌های دیگر: این را ببینید و اگر برداشتِ دستیار نادرست است، همین‌جا اصلاح کنید.",
      "",
      "■ نیازِ انتزاعی (این دسته از خواسته‌ها، نه فقط مسئلهٔ مالک): " + (g.abstract || "—"),
      "■ دقیقاً چه کم است: " + (g.missing || "—"),
      "■ کجا افزوده شود: " + (g.where || "—"),
      "■ چطور: " + (g.how || "—"),
      "■ پیوند با بخش‌های دیگر: " + (g.relations || "—"),
      "■ مستنداتی که باید به‌روز شوند: " + (g.docs || "WORKLOG، HANDBOOK، AGENTS.md") + " — به‌علاوهٔ همیشگی‌ها: ورودیِ VIEW_META/ثبت‌گاه برای هر نما یا قابلیتِ تازه (تا دستیار خودکار بشناسدش)، WORKLOG (n)، ردیفِ PROGRESS، بخش و §۱۰/§۱۲ ِ HANDBOOK، docs/overhaul/AUDIT_LOG.md.",
      "",
      "■ هماهنگی با روال‌ها: پیش از ساختن، کارِ در جریانِ روالِ بک‌تست (docs/supervisor/BACKTEST_PROMPT.md) و برگه‌های باز را ببینید تا دوباره‌کاری یا تعارض پیش نیاید؛ اگر به قاعده/سقف/ایستگاه/وزن دست می‌زند، فقط پیشنهاد بدهید (تصمیمِ مالک). پس از انجام، در WORKLOG بنویسید «پاسخ به برگهٔ دستیار» تا روالِ عمومی و بک‌تست ببینند و اگر خطایی بود اصلاح کنند.",
      "",
      "■ حرفِ مالک در این سشن (برای زمینه): " + clip(s.pinned || "", 300)
    ].join("\n").slice(0, 7900);
  };
  AS.fileGap = function (s, g) {
    var key = norm(g.title || s.pinned);
    var dup = AS.sessions().some(function (x) { return (x.reports || []).some(function (r) { return r.key === key; }); });
    if (dup) return Promise.resolve({ dup: true });
    var text = AS.reportText(s, g);
    if (!A.HOST || !A.HOST.report) { s.reports.push({ key: key, title: clip(g.title, 80), at: now(), local: true, text: text }); S.put(s); return Promise.resolve({ local: true }); }
    var q = "?tab=" + encodeURIComponent(A.state.view || "") + (A.state.arg != null ? "&a=" + encodeURIComponent(A.state.arg) : "") + (A.state.sub ? "&s=" + encodeURIComponent(A.state.sub) : "");
    var spot = { page: "/apps/learning-architecture", page_label: "معماری یادگیری عمیق", section_id: "assistant", section_label: "💬 دستیار — " + labelOf(A.state.view),
      reopen: "/apps/learning-architecture" + q, dom_path: ".as-root", covered_text: clip(s.pinned || g.title, 400) };
    var files = (s.files || []).map(function (f) { return blobs[f.id]; }).filter(Boolean);
    return A.HOST.report({ text: text, spot: spot, urgent: true, files: files }).then(function (r) {
      s.reports.push({ key: key, id: r.id, number: r.number, title: clip(g.title, 80), at: now() }); S.put(s); return r;
    });
  };

  /* ---------- یک نوبت ---------- */
  AS.send = function (text, files) {
    if (busy) return Promise.resolve();
    text = String(text || "").trim(); files = files || [];
    if (!text && !files.length) return Promise.resolve();
    var s = AS.cur() || AS.newSession();
    busy = true; paint();
    var m = { role: "user", text: text || "(فایل)", at: now(), files: [] };
    s.msgs.push(m); S.put(s); paint();
    var ups = Promise.resolve(), aiIds = [], texts = [];
    files.slice(0, 8).forEach(function (f) {
      ups = ups.then(function () {
        return readText(f).then(function (t) { if (t) texts.push("— متنِ «" + f.name + "»:\n" + t); }).then(function () {
          if (!A.HOST || !A.HOST.upload) { m.files.push({ name: f.name, mime: f.type || "" }); return; }
          if (f.size > 25 * 1048576) { A.toast("«" + f.name + "» بزرگ‌تر از ۲۵ مگابایت است", "bad"); return; }
          return A.HOST.upload(s.id, f, { group: GROUP, title: provisional(s, text) }).then(function (r) {
            var info = { id: r.id, name: r.name || f.name, mime: r.mime || f.type || "", link: r.link || "" };
            blobs[r.id] = f; m.files.push(info); s.files.push(info);
            if (/^image\/|application\/pdf/.test(info.mime) && aiIds.length < 4) aiIds.push(r.id);
          }, function (e) { m.files.push({ name: f.name, mime: f.type || "", err: true }); A.toast("«" + f.name + "» به درایو نرفت: " + errText(e), "bad"); });
        });
      });
    });
    var auto = 0;
    function turn(msg, extra) {
      var sc = AS.scan();
      return ask(SYS, AS.prompt(s, msg, sc, extra), { task: "lla_assistant", fileIds: auto ? [] : aiIds, maxTokens: 2500 }).then(function (o) {
        if (o.title && !s.title) s.title = clip(o.title, 80);
        if (o.pinned && (!s.pinned || o.pinned !== s.pinned)) s.pinned = clip(o.pinned, 300);
        if (o.memory) s.memory = clip(o.memory, 3000);
        if (Array.isArray(o.steps) && o.steps.length) s.steps = o.steps.slice(0, 20).map(function (x) { return { t: clip(x.t, 140), s: /^(done|now|todo)$/.test(x.s) ? x.s : "todo", view: A.V[x.view] ? x.view : "" }; });
        s.status = o.status || "related";
        var acts = s.status === "unrelated" ? [] : (o.actions || []);
        var a = { role: "ai", text: o.reply, at: now(), actions: acts.map(function (x) { return x && x.do; }).filter(Boolean) };
        s.msgs.push(a); if (s.msgs.length > MAX_MSGS) s.msgs = s.msgs.slice(-MAX_MSGS);
        S.put(s); paint();
        var gap = s.status === "gap" && o.gap ? AS.fileGap(s, o.gap).then(function (r) {
          if (!r) return;
          s.msgs.push({ role: "sys", at: now(), text: r.dup ? "این کمبود پیش‌تر ثبت شده بود؛ برگهٔ تازه نساختم." : r.local ? "برگه ساخته شد ولی این نسخه به «نظارت و سرکشی» وصل نیست؛ متنش در سشن ماند." : "🛎 برگهٔ فوری #" + fa(r.number) + " در «نظارت و سرکشی» ثبت شد." });
          S.put(s); paint();
        }, function (e) { s.msgs.push({ role: "sys", at: now(), text: "ثبتِ برگهٔ فوری نشد: " + errText(e) }); S.put(s); paint(); }) : Promise.resolve();
        return gap.then(function () { return AS.run(acts); }).then(function (res) {
          if (res.notes.length) { s.msgs.push({ role: "sys", at: now(), text: res.notes.join(" · ") }); S.put(s); paint(); }
          var filled = acts.some(function (x) { return x && /fill|highlight|attach/.test(x.do); });
          if (res.moved && !filled && auto < MAX_AUTO) { auto++; return turn("[سامانه: «" + labelOf(A.state.view) + "» باز شد. حالا از روی همین گفت‌وگو فیلدهای این صفحه را پر کن و باقیِ لازم‌ها را هایلایت کن؛ reply خیلی کوتاه.]"); }
        });
      });
    }
    return ups.then(function () { S.put(s); return turn(text || "(فقط فایل فرستادم)", texts.length ? "\n# متنِ فایل‌های متنی\n" + texts.join("\n\n") : ""); })
      .catch(function (e) { s.msgs.push({ role: "sys", at: now(), text: "دستیار پاسخ نداد: " + errText(e) + " — دوباره بفرست." }); S.put(s); })
      .then(function () { busy = false; paint(); });
  };
  function errText(e) { var d = e && e.response && e.response.data; return (d && (d.detail || d.error)) || (e && e.message) || "خطا"; }

  /* ---------- پنجرهٔ شناور ---------- */
  function pos() { return store("pos") || null; }
  function place(box) {
    var p = pos(); if (!p) return;
    var x = Math.min(Math.max(4, p.x), window.innerWidth - 60), y = Math.min(Math.max(4, p.y), window.innerHeight - 60);
    box.style.left = x + "px"; box.style.top = y + "px"; box.style.right = "auto"; box.style.bottom = "auto";
  }
  function draggable(handle, box, onTap) {
    var st = null;
    handle.addEventListener("pointerdown", function (e) { if (e.button) return; var r = box.getBoundingClientRect(); st = { x: e.clientX, y: e.clientY, l: r.left, t: r.top, moved: false }; try { handle.setPointerCapture(e.pointerId); } catch (x) { } });
    handle.addEventListener("pointermove", function (e) {
      if (!st) return; var dx = e.clientX - st.x, dy = e.clientY - st.y;
      if (!st.moved && Math.abs(dx) + Math.abs(dy) < 6) return; st.moved = true;
      box.style.left = Math.min(Math.max(4, st.l + dx), window.innerWidth - 60) + "px"; box.style.top = Math.min(Math.max(4, st.t + dy), window.innerHeight - 60) + "px";
      box.style.right = "auto"; box.style.bottom = "auto";
    });
    handle.addEventListener("pointerup", function () { if (!st) return; var m = st.moved; st = null; if (m) { var r = box.getBoundingClientRect(); store("pos", { x: Math.round(r.left), y: Math.round(r.top) }); placePanel(); } else if (onTap) onTap(); });
  }
  /* پنجره کنارِ دکمه باز می‌شود (بالا یا پایینِ آن، هر کدام جا دارد)؛ در موبایل برگهٔ پایینِ صفحه است (CSS) */
  function placePanel() {
    if (!ui || ui.panel.hidden) return;
    var P = ui.panel, r = ui.fab.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
    if (W <= 600) { P.style.left = P.style.top = P.style.right = P.style.bottom = ""; return; }
    var w = Math.min(400, W - 16), right = Math.min(Math.max(8, W - r.right), W - w - 8);
    P.style.right = right + "px"; P.style.left = "auto";
    if (r.top > H / 2) { P.style.bottom = (H - r.top + 8) + "px"; P.style.top = "auto"; P.style.maxHeight = Math.max(240, r.top - 16) + "px"; }
    else { P.style.top = (r.bottom + 8) + "px"; P.style.bottom = "auto"; P.style.maxHeight = Math.max(240, H - r.bottom - 16) + "px"; }
  }
  window.addEventListener("resize", function () { if (ui) { place(ui.root); placePanel(); } });
  var pend = [];
  function build() {
    var root = h("div", { class: "as-root", dir: "rtl", "data-report-section": "assistant", "data-report-section-label": "💬 دستیار" });
    var fab = h("button", { class: "as-fab", type: "button", "aria-label": "دستیار — گفت‌وگو با هوش مصنوعی", title: "دستیار: بگو چه می‌خواهی؛ می‌برمت و فرم را پر می‌کنم (بکش تا جابه‌جا شود)" }, "💬", h("span", { class: "as-fabt" }, "دستیار"));
    var panel = h("section", { class: "as-panel", role: "dialog", "aria-label": "دستیار", hidden: true });
    root.appendChild(fab); root.appendChild(panel);
    draggable(fab, root, function () { AS.toggle(); });
    ui = { root: root, fab: fab, panel: panel, view: "chat" };
    A.layer().appendChild(root); place(root);
    return ui;
  }
  AS.toggle = function (open) { if (!ui) build(); var o = open == null ? ui.panel.hidden : open; ui.panel.hidden = !o; ui.root.classList.toggle("open", o); store("open", o); if (o) { paint(); placePanel(); var t = ui.panel.querySelector(".as-in"); if (t) t.focus(); } };
  function paint() {
    if (!ui || ui.panel.hidden) return;
    var s = AS.cur(), P = ui.panel; P.innerHTML = "";
    var head = h("header", { class: "as-head" },
      h("b", { class: "as-ttl" }, ui.view === "list" ? "سشن‌ها" : (s && s.title) || "دستیار"),
      h("button", { class: "as-ib", type: "button", title: "سشن‌ها", "aria-label": "فهرستِ سشن‌ها", onclick: function () { ui.view = ui.view === "list" ? "chat" : "list"; paint(); } }, "☰"),
      h("button", { class: "as-ib", type: "button", title: "سشنِ تازه", "aria-label": "سشنِ تازه", onclick: function () { AS.newSession(); ui.view = "chat"; AS.clearMarks(); paint(); } }, "＋"),
      h("button", { class: "as-ib", type: "button", title: "بستن", "aria-label": "بستن", onclick: function () { AS.toggle(false); } }, "✕"));
    P.appendChild(head);
    if (ui.view === "list") { P.appendChild(listView()); return; }
    if (s && s.pinned) P.appendChild(h("div", { class: "as-pin", title: "خواستهٔ اصلیِ این سشن" }, "📌 ", s.pinned));
    if (s && s.steps && s.steps.length) {
      var done = s.steps.filter(function (x) { return x.s === "done"; }).length;
      P.appendChild(h("details", { class: "as-steps", open: store("stepsOpen") ? true : null, ontoggle: function (e) { store("stepsOpen", e.target.open); } },
        h("summary", {}, "مراحل · " + fa(done) + " از " + fa(s.steps.length), h("span", { class: "as-bar" }, h("i", { style: { width: Math.round(100 * done / s.steps.length) + "%" } }))),
        h("ol", { class: "as-tl" }, s.steps.map(function (x) {
          return h("li", { class: "as-st " + x.s }, h("span", { class: "as-dot", "aria-hidden": "true" }, x.s === "done" ? "✓" : x.s === "now" ? "●" : "○"), h("span", {}, x.t),
            x.view ? h("button", { class: "linkish small", type: "button", onclick: function () { A.go(x.view); } }, "بازکردن") : null);
        }))));
    }
    var log = h("div", { class: "as-log", "aria-live": "polite" });
    if (!s || !s.msgs.length) log.appendChild(h("div", { class: "as-hello" },
      h("p", {}, "سلام. بگو چه می‌خواهی — یک موضوع برای فهمیدن، ادعایی برای سنجیدن، یا جایی که گیر کرده‌ای."),
      h("p", { class: "small muted" }, "می‌برمت به جای درست، فرم را از حرف‌هایت پر می‌کنم و باقی را نشانت می‌دهم. عکس و فایل هم می‌خوانم (بچسبان یا 📎).")));
    (s ? s.msgs : []).forEach(function (m) {
      log.appendChild(h("div", { class: "as-msg " + m.role }, h("div", { class: "as-tx" }, m.text),
        m.files && m.files.length ? h("div", { class: "as-fl" }, m.files.map(function (f) { return f.link ? h("a", { href: f.link, target: "_blank", rel: "noopener" }, "📄 " + f.name) : h("span", { class: f.err ? "bad" : "" }, "📄 " + f.name); })) : null));
    });
    if (busy) log.appendChild(h("div", { class: "as-msg ai as-typing" }, h("div", { class: "as-tx" }, "…")));
    P.appendChild(log);
    var chips = h("div", { class: "as-chips" }, pend.map(function (f, i) { return h("span", { class: "chip" }, "📎 " + clip(f.name, 24), h("button", { class: "linkish", type: "button", "aria-label": "برداشتنِ " + f.name, onclick: function () { pend.splice(i, 1); paint(); } }, "✕")); }));
    var file = h("input", { type: "file", multiple: true, hidden: true, onchange: function () { pend = pend.concat(Array.prototype.slice.call(file.files || [])); file.value = ""; paint(); } });
    var ta = h("textarea", { class: "as-in", rows: 2, placeholder: busy ? "دستیار دارد کار می‌کند…" : "بنویس… (Enter می‌فرستد، Shift+Enter خطِ تازه)", "aria-label": "پیام به دستیار",
      onkeydown: function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(); } },
      onpaste: function (e) { var fs = e.clipboardData && e.clipboardData.files; if (fs && fs.length) { e.preventDefault(); pend = pend.concat(Array.prototype.slice.call(fs)); paint(); } } });
    ta.value = AS._draft || ""; ta.addEventListener("input", function () { AS._draft = ta.value; });
    function go() { var t = ta.value, f = pend; if (busy || (!t.trim() && !f.length)) return; AS._draft = ""; pend = []; AS.send(t, f); }
    P.appendChild(h("div", { class: "as-foot" }, chips, h("div", { class: "as-row" }, file,
      h("button", { class: "as-ib", type: "button", title: "پیوستِ فایل یا عکس", "aria-label": "پیوستِ فایل", onclick: function () { file.click(); } }, "📎"),
      ta, h("button", { class: "btn sm as-send", type: "button", disabled: busy, onclick: go }, "بفرست"))));
    log.scrollTop = log.scrollHeight;
  }
  function listView() {
    var all = AS.sessions(), cur = AS.cur();
    return h("div", { class: "as-list" },
      h("button", { class: "btn sm", type: "button", onclick: function () { AS.newSession(); ui.view = "chat"; paint(); } }, "＋ سشنِ تازه"),
      all.length ? h("ul", { class: "plain" }, all.map(function (s) {
        var d = (s.steps || []).filter(function (x) { return x.s === "done"; }).length;
        return h("li", { class: "as-li" + (cur && cur.id === s.id ? " on" : "") }, h("button", { class: "linkish", type: "button", onclick: function () { store("cur", s.id); ui.view = "chat"; AS.clearMarks(); paint(); } },
          h("b", {}, s.title || clip((s.msgs[0] || {}).text, 40) || "گفت‌وگوی تازه"),
          h("span", { class: "small muted" }, " · " + A.fdate(s.updated) + (s.steps && s.steps.length ? " · " + fa(d) + "/" + fa(s.steps.length) : "") + (s.reports && s.reports.length ? " · 🛎" + fa(s.reports.length) : ""))));
      })) : h("p", { class: "small muted" }, "هنوز سشنی نیست."));
  }

  /* هر رسمِ صفحه: دستیار سرِ جایش بماند (بی‌آن‌که نما را عوض کند) */
  var rawRender = A.render;
  A.render = function () {
    rawRender.apply(this, arguments);
    try { if (!ui || !document.contains(ui.root)) { ui = null; build(); if (store("open")) AS.toggle(true); } } catch (e) { console.error(e); }
  };
})(APP);
