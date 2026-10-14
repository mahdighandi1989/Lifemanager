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
  var TYPE = "achat", GROUP = "دستیار — گفت‌وگوها", MAX_MSGS = 400, HIST_CHARS = 24000, MAX_AUTO = 4, MAX_FILES = 40, MAX_FILE_MB = 100;
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
    var LG = window.EPI_BT_LEDGER || {}, OW = LG.ownership;
    if (OW && OW.areas) {
      L.push("## چه کسی مسئولِ چیست (docs/supervisor/ownership.json — همان نقشه‌ای که روتین‌ها از آن پیروی می‌کنند)");
      L.push("### کارِ جاریِ هر روتین (پیش از «کمبود» دانستنِ چیزی، ببین در همین کارها هست یا نه ⇒ اگر هست kind=priority و نه build)");
      Object.keys(OW.routines || {}).forEach(function (k) { var r = OW.routines[k]; (r.agenda || []).forEach(function (w) { L.push("- " + (r.fa || k) + " (" + (r.cadence || "") + "): " + w); }); });
      L.push("### قلمروها");
      OW.areas.forEach(function (a) {
        var os = [].concat(a.owner || []).map(function (o) { var r = (OW.routines || {})[o] || {}; return (r.fa || o) + (r.cadence ? " (" + r.cadence + ")" : ""); }).join(" + ");
        L.push("- area=" + a.id + " — " + a.fa + " — مالک: " + os + (a.executor ? " — اجراکنندهٔ پس از تصمیمِ مالک: " + a.executor : "") + (a.rule ? " — " + a.rule : ""));
      });
    }
    var TE = window.EPI_TERR, TL = (LG.territory || {}).areas || {};
    if (TE && TE.groups) {
      L.push("## قلمروِ معرفت‌شناسی — هر حوزه و گامِ پیشرفتش (۰ نقشه‌شده … ۵ تثبیت‌شده؛ روتینِ بک‌تست هر شب جلو می‌برد)");
      TE.groups.forEach(function (g) { L.push("- " + g.fa + ": " + g.areas.map(function (a) { var st = (TL[a.id] || {}).stage || 0; return a.id + "=" + a.fa + ":" + st; }).join("، ")); });
    }
    var PR = ((LG.proposals || {}).proposals || []).filter(function (p) { return !p.applied && !p.withdrawn && !p.supersededBy && !S.get("ebtp_" + p.id); });
    if (PR.length) L.push("## پیشنهادهای منتظرِ تصمیمِ مالک (view=e_bt): " + PR.map(function (p) { return p.id + " «" + clip(p.title, 60) + "»"; }).join("، "));
    var E = AS.entities();
    L.push("## دادهٔ خودِ کاربر (برای بازکردن: view و arg همین‌جا)");
    if (!E.length) L.push("- هنوز چیزی ثبت نکرده.");
    E.forEach(function (e) { L.push("- " + e.fa + " «" + e.title + "» → view=" + e.view + " arg=" + e.arg + (e.sub ? " sub=" + e.sub : "")); });
    return L.join("\n");
  };

  /* ---------- پویشِ صفحهٔ فعلی: هر فیلد/دکمهٔ دیدنی یک کلید (data-ai-k) ---------- */
  function visible(el) { if (el.type === "hidden" || el.disabled) return false; if (el.type === "file") return true; var r = el.getBoundingClientRect(); return !!(r.width || r.height || el.getClientRects().length); }
  /* فیلدی که در یک «details» ِ بسته است دیده نمی‌شود ولی بخشی از فرم است — پویش می‌شود و پیش از پرکردن، بخشش باز می‌شود */
  function inClosed(el) { var d = el.closest("details"); while (d) { if (!d.open) return true; d = d.parentElement && d.parentElement.closest("details"); } return false; }
  function reveal(el) { var d = el.closest("details"); while (d) { d.open = true; d = d.parentElement && d.parentElement.closest("details"); } }
  function labelFor(el) {
    var t = el.getAttribute("aria-label") || "";
    if (!t && el.id) { var lb = document.querySelector('label[for="' + (window.CSS && CSS.escape ? CSS.escape(el.id) : el.id) + '"]'); if (lb) { var lc = lb.cloneNode(true); lc.querySelectorAll("select,textarea,input,option,button").forEach(function (x) { x.remove(); }); t = lc.textContent; } }
    if (!t) { var pl = el.closest("label"); if (pl) { var c = pl.cloneNode(true); c.querySelectorAll("select,textarea,input,option,button").forEach(function (x) { x.remove(); }); t = c.textContent; } }
    if (!t && el.tagName === "BUTTON") {
      t = el.textContent;
      // دکمه‌ای که پاسخِ یک «پرسش» است (آزمون‌های گره‌گشا، ایستگاه‌ها): متنِ خودِ پرسش هم دیده شود — بی آن دستیار پرسش را حدس می‌زد (کارزارِ آزمون)
      var grp = el.closest("[role=group], fieldset, .kn-probe, .kn-q, .dopts, .row");
      if (grp && grp.parentElement) {
        var q = grp.querySelector("legend") || grp.previousElementSibling;
        var qt = q && !q.contains(el) && !/BUTTON|INPUT|SELECT|TEXTAREA/.test(q.tagName) ? clip(q.textContent, 90) : "";
        if (qt && qt.indexOf(clip(t, 30)) < 0) t = t + " ⟵ پرسش: " + qt;
      }
    }
    if (!t) t = el.getAttribute("placeholder") || el.getAttribute("title") || "";
    if (!t) { var p = el.parentElement, i = 0; while (p && i < 3 && !t) { var lab = p.querySelector("label,.fl,.lbl,h3,h4,b,strong"); if (lab && !lab.contains(el)) t = lab.textContent; p = p.parentElement; i++; } }
    return clip(t, 90);
  }
  var SCAN = {};
  /* همان پیمایش و همان پالایه برای «پویش» و برای «دوباره‌یابیِ کلیدِ کهنه» — تا امضاها (نوع|برچسب|چندمین) یکی باشند */
  function walk() {
    var main = document.getElementById("main"), out = [], seen = {}, nb = 0, nf = 0;
    if (!main) return out;
    main.querySelectorAll("input,textarea,select,button").forEach(function (el) {
      if (el.closest(".as-root")) return;
      // newer Chrome keeps a closed <details>' content laid out (content-visibility), so «closed» is asked directly
      var hid = inClosed(el) && !el.disabled && el.type !== "hidden";
      if (!visible(el) && !hid) return;
      var tag = el.tagName.toLowerCase(), type = tag === "input" ? (el.type || "text") : tag, lab = labelFor(el);
      if (tag === "button" && (!lab || hid || nb >= 80)) return;
      if (tag !== "button" && nf >= 150) return;
      if (tag === "button") nb++; else nf++;
      var sig = tag + "|" + lab; seen[sig] = (seen[sig] || 0) + 1;
      out.push({ el: el, tag: tag, type: type, label: lab, nth: seen[sig], hid: hid });
    });
    /* دکمه‌های هم‌نام (مثلاً چند «افزودن به فرضیه‌های این خانواده» زیرِ پیشنهادهای مختلف): سرتیترِ کارتِ خودش کنارش — وگرنه دستیار
       از روی ترتیب حدس می‌زد و ممکن بود فرضیهٔ اشتباه را بیفزاید (کارزارِ آزمون، sc02) */
    var cnt = {}; out.forEach(function (w) { if (w.tag === "button") cnt[w.label] = (cnt[w.label] || 0) + 1; });
    out.forEach(function (w) {
      if (w.tag !== "button" || cnt[w.label] < 2) return;
      var p = w.el.parentElement, ctx = "";
      for (var i = 0; i < 5 && p && !ctx; i++, p = p.parentElement) { var hd = p.querySelector("h2,h3,h4,b,strong,legend,.kn-fam"); if (hd && !hd.contains(w.el) && (hd.compareDocumentPosition(w.el) & 4)) ctx = clip(hd.textContent, 50); }
      if (ctx) w.label = w.label + " — «" + ctx + "»";
    });
    return out;
  }
  AS.scan = function () {
    var main = document.getElementById("main"), fields = [], buttons = [], heads = [];
    SCAN = {};
    if (!main) return { fields: fields, buttons: buttons, heads: heads };
    main.querySelectorAll("h1,h2,h3").forEach(function (x, i) { if (i < 12) heads.push(clip(x.textContent, 70)); });
    var n = 0;
    walk().forEach(function (w) {
      var el = w.el, tag = w.tag, type = w.type, lab = w.label;
      var k = "k" + (++n); el.setAttribute("data-ai-k", k);
      var sec = el.closest("[data-report-section-label]");
      SCAN[k] = { tag: tag, type: type, label: lab, nth: w.nth, node: el };
      if (tag === "button") { buttons.push({ k: k, label: lab }); return; }
      var f = { k: k, type: type, label: lab, section: sec ? clip(sec.getAttribute("data-report-section-label"), 40) : "" };
      if (type === "checkbox" || type === "radio") f.value = el.checked ? "✓" : "";
      else if (type !== "file") f.value = clip(el.value, 120);
      if (tag === "select") f.options = Array.prototype.slice.call(el.options, 0, 25).map(function (o) { return o.value + "=" + clip(o.textContent, 30); }).join(" | ");
      // بازهٔ عدد/لغزنده (کارزارِ آزمون sc01: «یکی کمتر از بیشینه» با بازهٔ حدسی پر شد)
      if ((type === "range" || type === "number") && (el.min !== "" || el.max !== "")) f.range = (el.min || "?") + "…" + (el.max || "?");
      if (el.required || el.getAttribute("aria-required") === "true") f.required = true;
      if (w.hid) f.closed = true;
      fields.push(f);
    });
    return { fields: fields, buttons: buttons, heads: heads };
  };
  function scanText(sc) {
    var L = ["نما: " + A.state.view + " (" + labelOf(A.state.view) + ")" + (A.state.arg != null ? " arg=" + A.state.arg : "") + (A.state.sub ? " sub=" + A.state.sub : "")];
    if (sc.heads.length) L.push("سرتیترها: " + sc.heads.join(" | "));
    L.push("فیلدها:"); if (!sc.fields.length) L.push("- (این صفحه فیلدی ندارد)");
    sc.fields.forEach(function (f) { L.push("- " + f.k + " | " + f.type + " | «" + f.label + "»" + (f.section ? " | بخش: " + f.section : "") + (f.range ? " | بازه: " + f.range : "") + (f.type === "file" ? " | (پیوست)" : " | مقدار: " + (f.value ? "«" + f.value + "»" : "خالی")) + (f.options ? " | گزینه‌ها: " + f.options : "") + (f.required ? " | لازم" : "") + (f.closed ? " | (در بخشِ بسته؛ با پرکردن باز می‌شود)" : "")); });
    L.push("دکمه‌ها: " + (sc.buttons.map(function (b) { return b.k + "=«" + b.label + "»"; }).join("، ") || "—"));
    // متنِ دیدنیِ صفحه (فشرده): پیشنهادهای هوش مصنوعی، عددها، پیام‌ها — کارزارِ آزمون (sc09/sc12): دستیار فقط فیلد و دکمه می‌دید و حدس می‌زد
    try {
      var main = document.getElementById("main"), c = main && main.cloneNode(true);
      if (c) { c.querySelectorAll("script,style,svg,select,textarea,input,option,button,[hidden],details:not([open]) > :not(summary)").forEach(function (x) { x.remove(); });
        var tx = String(c.textContent || "").replace(/\s+/g, " ").trim(); if (tx) L.push("متنِ صفحه (فشرده؛ فقط برای دیدن، نه کلید): " + clip(tx, 3000)); }
    } catch (e) { }
    return L.join("\n");
  }
  /* کلیدِ کهنه (نما دوباره رسم شد) ⇒ با همان برچسب و نوع و «چندمین» دوباره پیدا کن.
     نقشهٔ کلیدهای این نوبت (SCAN) هرگز بازنویسی نمی‌شود: پویشِ دوباره کلیدهای تازه نمی‌دهد، وگرنه «k40» ِ کهنه
     به فیلدِ دیگری می‌خورد (باگِ اجرای واقعی: پس از انتخابِ خانواده فرم جابه‌جا شد و دو فیلد اشتباه پر شد) */
  function el(k) {
    var sig = SCAN[k]; if (!sig) return null;
    if (sig.node && document.contains(sig.node)) return sig.node;
    var hit = walk().filter(function (w) { return w.tag === sig.tag && w.label === sig.label && w.nth === sig.nth; })[0];
    if (!hit) return null;
    sig.node = hit.el; return hit.el;
  }
  /* ---------- کارها روی صفحه ---------- */
  var DANGER = /حذف|پاک|برداشتن|بایگانی|delete|remove|reset|بازنشانی|ریختن|خروج/i;
  /* تصمیم‌هایی که فقط با خودِ مالک است (پذیرش/ردِ پیشنهادِ قاعده و سقف، تأییدِ مسئله یا واقعه برای ورود به آزمون‌ها):
     دستیار هرگز نمی‌زندشان — هایلایت می‌کند و می‌گوید «این تصمیم با خودت است» */
  var OWNER = /بپذیر|پذیرفتم|رد کن|ردّ|نپذیر|تأیید|تایید|قبول|approve|accept|reject/i;
  /* گزینه/جوابِ تمرین (شبیه‌ساز، ورزشِ گره، مسئلهٔ هم‌ساختار، دوره): دستیار نه پر می‌کند، نه می‌زند، نه زردش می‌کند —
     زردکردنِ یک گزینه خودش پاسخ را لو می‌دهد یا کاربر را به آن می‌کشد (تورِ زنده: گزینهٔ غلطِ «۱/۲» زرد شد) */
  var ANSWER = ".dopt, .dopts button, .pbs-ans input, .pbs-ans textarea, .pbs-ans button, .kp-opt, .kp-choices input, .kp-choices button, .kp-ans, .kp-ans input, .kp-ans textarea";
  function isAnswer(x) { try { return !!(x && x.closest && x.closest(ANSWER)); } catch (e) { return false; } }
  /* پیام‌های اخیرِ صفحه (toast) — حتی وقتی خودِ کاربر دکمه را زد — تا دستیار علتِ «نشد» را بداند و کاربر را مقصر نکند */
  var RECENT_TOASTS = [];
  (function () { var raw0 = A.toast; A.toast = function (m) { try { if (m) { RECENT_TOASTS.push({ at: Date.now(), t: clip(String(m), 200) }); if (RECENT_TOASTS.length > 8) RECENT_TOASTS.shift(); } } catch (e) { } return raw0.apply(this, arguments); }; })();
  AS.recentToasts = function () { var t0 = Date.now() - 4 * 60000; return RECENT_TOASTS.filter(function (x) { return x.at >= t0; }).map(function (x) { return x.t; }); };
  var ANSWER_NOTE = "جوابِ تمرین با خودِ توست — دستیار آن را نه پر می‌کند، نه نشان می‌دهد";
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
      if (isAnswer(x)) return ANSWER_NOTE;
      // بخشِ «به قلمِ خودت» (کارتِ گره): نوشتن خودش بخشی از یادگرفتن است — فقط زرد، نه پر (کارزارِ آزمون sc01/sc07)
      if (x.closest && x.closest("[data-own]")) { reveal(x); mark(x, a.why || "این را با جمله‌های خودت بنویس", "hl"); return "«" + clip(SCAN[a.k] && SCAN[a.k].label, 30) + "» به قلمِ خودِ توست — زردش کردم؛ می‌توانی همان جمله‌هایی را که گفتی این‌جا بنویسی"; }
      if (x.type === "file") return "پیوست با attach";
      reveal(x);
      if (x.tagName === "SELECT") {
        var want = String(a.value == null ? "" : a.value).trim(), opts = Array.prototype.slice.call(x.options);
        var o = opts.filter(function (op) { return op.value === want; })[0] || opts.filter(function (op) { return op.textContent.trim() === want; })[0] ||
          opts.filter(function (op) { return want && op.textContent.indexOf(want) >= 0; })[0];
        if (!o) return "گزینهٔ «" + clip(want, 30) + "» در «" + clip(SCAN[a.k] && SCAN[a.k].label, 30) + "» نیست";
        a = { k: a.k, value: o.value, why: a.why };
      }
      if (x.type === "checkbox" || x.type === "radio") { var on = a.value === true || /^(1|true|بله|✓|on)$/i.test(String(a.value)); if (x.checked !== on) x.click(); }
      else { setVal(x, String(a.value == null ? "" : a.value)); fire(x, "input"); fire(x, "change"); }
      mark(x, a.why || "دستیار از حرفِ تو پر کرد — اگر درست نیست عوضش کن", "fill");
      return "";
    },
    highlight: function (a) { var x = el(a.k); if (!x) return "فیلدِ " + a.k + " پیدا نشد"; if (isAnswer(x)) return ANSWER_NOTE; reveal(x); mark(x, a.why || "این را خودت پر کن", "hl"); return ""; },
    click: function (a) {
      var x = el(a.k); if (!x) return "دکمهٔ " + a.k + " پیدا نشد";
      if (isAnswer(x)) return ANSWER_NOTE;
      var bt = (x.textContent || "") + " " + (x.getAttribute("aria-label") || "");
      // زبانه (role=tab) فقط جابه‌جایی است، نه تصمیم و نه حذف: «در انتظار تأیید (۱)» را باز می‌کند، تأیید نمی‌کند (تورِ زنده)
      if (x.getAttribute("role") === "tab") bt = "";
      if (DANGER.test(bt)) { mark(x, "کارِ برگشت‌ناپذیر — اگر می‌خواهی، خودت بزن", "hl"); return "دکمهٔ «" + clip(x.textContent, 30) + "» را خودت بزن (کارِ برگشت‌ناپذیر)"; }
      if (OWNER.test(bt) && !/صف/.test(bt)) { mark(x, "این تصمیم با خودت است", "hl"); return "«" + clip(x.textContent, 30) + "» تصمیمِ خودت است؛ زردش کردم، اگر خواستی بزن"; }
      var before = document.querySelectorAll("#main input,#main textarea,#main select").length;
      x.click(); clicked.n++; clicked.changed = clicked.changed || before !== document.querySelectorAll("#main input,#main textarea,#main select").length; return "";
    },
    attach: function (a) {
      var x = el(a.k); if (!x || x.type !== "file") return "جای پیوست پیدا نشد";
      var fs = (a.fileIds || []).map(function (id) { return blobs[id]; }).filter(Boolean);
      if (!fs.length) return "فایل در این بارِ مرورگر نیست — خودت از «انتخابِ فایل» بگذار";
      reveal(x);
      try { var dt = new DataTransfer(); fs.forEach(function (f) { dt.items.add(f); }); x.files = dt.files; fire(x, "change"); mark(x, "دستیار پیوست کرد", "fill"); return ""; }
      catch (e) { return "مرورگر اجازهٔ پیوستِ خودکار نداد — خودت بگذار"; }
    }
  };
  AS.DO = DO;   // a27_tour.js adds the tour operations here
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  var clicked = { n: 0, changed: false };
  AS.run = function (actions) {
    var notes = [], moved = false, stale = false, chain = Promise.resolve(), skipped = 0, toasts = [];
    clicked = { n: 0, changed: false };
    // پیامی که صفحه پس از کارهای دستیار نشان داد (مثلاً «اول خودارزیابی را بزن») به خودِ دستیار هم می‌رسد — وگرنه حدس می‌زد
    var rawToast = A.toast;
    A.toast = function (m) { try { if (m) toasts.push(clip(String(m), 200)); } catch (e) { } return rawToast.apply(this, arguments); };
    (actions || []).slice(0, 40).forEach(function (a) {
      chain = chain.then(function () {
        if (!a || !DO[a.do]) return;
        // کلیدهای k… مالِ صفحهٔ پیشین‌اند: پس از رفتن به نمای تازه هرگز به کار نمی‌روند (پرکردنِ فیلدِ اشتباه) —
        // نوبتِ خودکارِ بعدی با فیلدهای همین صفحه پر می‌کند
        if ((moved || stale) && /^(fill|highlight|click|attach)$/.test(a.do)) { skipped++; return; }
        var at = A.state.view + "|" + A.state.arg + "|" + (A.state.sub || "");
        var nf = function () { return document.querySelectorAll("#main input,#main textarea,#main select").length; }, f0 = nf(), ch0 = clicked.changed;
        var r = ""; try { r = DO[a.do](a); } catch (e) { r = e.message; }
        if (r) notes.push(r);
        // پرکردنی که فیلدِ شرطیِ تازه آورد (مثلاً «تبیینِ رقیبِ بیرونی»): کلیدهای قدیمی با برچسب/ترتیب هنوز درست می‌نشینند (آزمونِ ۳)،
        // ولی فیلدِ تازه را مدل ندیده ⇒ «فرم تغییر کرد» تا نوبتِ خودکارِ بعد آن را ببیند و پیش از تأیید پر/هایلایت کند (کارزارِ آزمون sc04)
        if (a.do === "fill" && !r && nf() !== f0) clicked.changed = true;
        if (a.do === "go" && !r) { moved = true; return wait(350); }
        // کلیکی که نما/قدم را عوض کرد هم «رفتن» است: کلیدهای بعدیِ همین نوبت مالِ صفحهٔ پیشین‌اند
        // … و کلیکی که فیلدها را کم/زیاد کرد هم: کلیدهای بعدی جابه‌جا شده‌اند (کارزارِ آزمون sc04: «k45 پیدا نشد» و هایلایت روی فیلدِ اشتباه) — نوبتِ خودکارِ بعد با پویشِ تازه
        if (a.do === "click") return wait(250).then(function () { var grew = nf() !== f0; clicked.changed = ch0 || grew; if (!r && A.state.view + "|" + A.state.arg + "|" + (A.state.sub || "") !== at) moved = true; else if (!r && grew) stale = true; });
      });
    });
    return chain.then(function () { return wait(150); }).then(function () {
      if (A.toast !== rawToast) A.toast = rawToast;
      var first = document.querySelector(".as-hl") || document.querySelector(".as-filled");
      if (first && first.scrollIntoView) try { first.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) { }
      return { notes: notes, moved: moved, skipped: skipped, changed: clicked.changed, clicks: clicked.n, toasts: toasts };
    });
  };

  /* ---------- برگه‌های بازِ همین صفحه (تا برگهٔ تکراری ساخته نشود و دستیار بداند چه در صف است) ---------- */
  var sheetCache = { at: 0, list: [] };
  AS.openSheets = function () {
    if (!(A.HOST && A.HOST.sheets)) return Promise.resolve([]);
    if (Date.now() - sheetCache.at < 120000) { AS._sheets = sheetCache.list; return Promise.resolve(sheetCache.list); }
    return Promise.resolve(A.HOST.sheets()).then(function (l) { sheetCache = { at: Date.now(), list: (l || []).filter(function (x) { return x.status !== "filed"; }) }; AS._sheets = sheetCache.list; return sheetCache.list; }, function () { return []; });
  };
  function sheetsText(l) { return l.length ? l.slice(0, 60).map(function (x) { return "#" + x.number + " «" + clip(x.title, 90) + "» [" + x.status + (x.urgent ? "، فوری" : "") + "]"; }).join(" · ") : "(هیچ برگهٔ بازی نیست)"; }

  /* ---------- سشن‌ها ---------- */
  AS.sessions = function () { var c = store("cur"); return S.all(TYPE, function (x) { return (x.msgs || []).length || x.id === c; }).sort(function (a, b) { return String(b.updated || "").localeCompare(String(a.updated || "")); }); };
  AS.newSession = function () {
    var c = AS.cur(); if (c && !c.msgs.length) return c;   // «＋» روی سشنِ هنوز خالی ⇒ همان، نه یک سشنِ خالیِ دیگر در فهرست
    var s = { id: A.uid("achat"), type: TYPE, title: "", pinned: "", status: "", memory: "", msgs: [], steps: [], files: [], reports: [] }; S.put(s); store("cur", s.id); return s;
  };
  AS.cur = function () { var id = store("cur"), s = id && S.get(id); return s && s.type === TYPE ? s : null; };
  function provisional(s, text) { return s.title || clip(text, 50) || "گفت‌وگوی تازه"; }

  /* ---------- پیام به هوش ---------- */
  var SYS = [
    "تو «دستیار» ِ صفحهٔ «معماری یادگیری عمیق و کارخانهٔ معرفت‌شناسی» هستی: همراهی آرام و کوتاه‌گو که کاربر را بی‌دردسر به هدفش می‌رساند.",
    "کارت: (۱) بفهمی کاربر چه می‌خواهد؛ (۲) او را به نما/بخش/فرمِ درست ببری (یک یا چند بخش، به ترتیب)؛ (۳) فرم را فقط از حرف‌ها و فایل‌های خودِ او پر کنی و باقیِ فیلدهای لازم را هایلایت کنی با یک جملهٔ کوتاه که چه بنویسد — یا اگر خواست، یکی‌یکی بپرسی و خودت پر کنی؛ (۴) فایل/عکس را کوتاه بخوانی و اگر فرم جای پیوست دارد پیوستش کنی؛ (۵) قدم‌به‌قدم مثلِ خودِ او با فرم جلو بروی.",
    "قاعده‌های سخت:",
    "- کوتاه: پاسخ حداکثر ۳ جمله (حدود ۶۰ واژه)، فارسیِ ساده، بی تعارف، در هر نوبت حداکثر یک پرسش.",
    "- چیزی از خودت نساز: فیلدی را که کاربر چیزی برایش نگفته پر نکن؛ هایلایتش کن. در کاربرگِ تمرینِ تکنیک‌ها پاسخِ تمرین را ننویس (اثرِ تولید) — فقط جای نوشتن را نشان بده. در شبیه‌ساز، ورزشِ گره، مسئلهٔ هم‌ساختار، کارتِ مرور و دوره هیچ گزینه یا جوابی را پر، کلیک یا هایلایت نکن (زردکردنِ یک گزینه یعنی لو دادنش)؛ فقط بگو کجای صفحه است.",
    "- داوری نکن: حکم، نمره و سقفِ اطمینان کارِ خودِ صفحه و کاربر است؛ برای کارِ عمیق دکمهٔ هوشِ همان بخش را (با click) بزن یا نشانش بده.",
    "- فقط کلیدهایی (k…) را به کار ببر که در «صفحهٔ فعلی» آمده و فقط نماهایی که در «نقشهٔ سامانه» هست. دکمهٔ حذف/پاک‌کردن را هرگز نزن.",
    "- وقتی کاربر را به نمای دیگری می‌بری و هنوز فیلدهایش را نمی‌بینی، فقط go بده؛ سامانه پس از بازشدن فیلدها را برایت می‌فرستد تا پر کنی.",
    "- قدم‌به‌قدم مثلِ خودِ کاربر: وقتی فیلدهای لازمِ یک فرم از حرف‌ها و فایل‌های خودِ او پر شد، دکمهٔ ثبت/ساخت/بعدیِ همان فرم را click کن و بگو چه کردی؛ اگر چیزی مانده، هایلایت کن و یک پرسشِ کوتاه بپرس. تصمیم‌های مالک (بپذیر/رد کن/تأیید/ریشه را تأیید کن) و حذف را هرگز نزن — هایلایت کن.",
    "- پیوست‌ها: متنِ کاملِ هر فایل (Word، Excel، PDF، صوت/ویدیو با رونویسیِ کامل، ZIP…) و خودِ تصویرها همراهِ همان نوبت می‌آید؛ همه‌اش را بخوان و فقط از همان‌ها نقل کن. در نوبت‌های بعد اگر دوباره به محتوای فایلی لازم داری، reread:[id] بده. اگر فایلی «خوانده نشد»، صادقانه بگو.",
    "- حالِ کاربر: اگر از ترس، اضطراب، غم، شرم یا فشار گفت، در یک عبارتِ کوتاه و صادق به رسمیتش بشناس (بی تعارف و بی دلداریِ کلیشه‌ای)، بعد کار. اگر سامانه نوشت «نشانهٔ پریشانیِ جدی»، اول همان راهِ کمکِ انسانی را بگو و کاری را تحمیل نکن.",
    "- سوگ، فقدان، بیماریِ عزیز، تروما و غمِ تازه «مسئله‌ای برای حل» یا «گره‌ای برای ورزیدن» نیست: اول بشنو و بپرس چه می‌خواهد (فقط شنیده شدن؟ معنا و ارزش‌ها؟ گیرِ مشخصی که دوست دارد باز شود؟). گره‌گشا را فقط اگر خودش گیرِ مشخص و تکراری‌ای گفت پیشنهاد کن؛ برای معنا و ارزش‌ها وجهِ area در «خودشناسی، ارزش‌ها و معنا». حمایتِ سوگ/درمان را «بیرون از این صفحه» بگو.",
    "- know: اگر برای پاسخ به گزاره‌های یک حوزه از قلمروها (شناسه‌ها در «نقشهٔ سامانه»، مثلاً sc_negotiation یا a_disagreement) لازم داری، know:[شناسه‌ها] بده و در reply فعلاً فقط بگو «نگاه می‌کنم»؛ سامانه همان نوبت آن‌ها را در «# دانسته‌های قلمرو» می‌فرستد.",
    "- «داوری نکن» یعنی دربارهٔ پرونده و ادعای کاربر حکم نده؛ نه این‌که یافتهٔ تثبیت‌شدهٔ علمی را نگویی. وقتی کاربر دربارهٔ چیزی می‌پرسد که در «# دانسته‌های قلمرو» آمده، همان گزاره را با رده‌اش (قضیه / تجربی / بیرون) و حوزه‌اش بگو و به نمای همان حوزه یا ابزارش ببر.",
    "- از کاری که در همین پاسخ انجام می‌دهی به آینده بگو («می‌زنم»، «پر می‌کنم»)؛ سامانه نتیجه را می‌گوید. پیش از «همه پر است / کامل است»، فیلدهای خالیِ لازم و «# پیام‌های اخیرِ صفحه» را ببین؛ اگر صفحه خطا داد، علتش را از همان پیام بگو و کاربر را مقصر نکن.",
    "- نیمی مربوط: اگر بخشی از خواسته بیرون از این صفحه است (کاریابی، پول و بودجه، درمانِ پزشکی/روان‌پزشکی، کارهای حقوقی، …)، آن بخش را در outside بنویس و در reply یک جمله صادقانه بگو که این‌جا جایش نیست؛ برایش gap نزن. بقیه را مثلِ همیشه ببر.",
    "- چیزی که رویدادِ مشخص ندارد (نگرانیِ آینده، ترسِ کلی): یک بار بپرس «آخرین بار کِی و کجا آمد؟»؛ اگر نبود یا نگفت، همان جملهٔ خودش را موقعیت بگیر («احساس یا حالتی که مانع شد») و جلو برو.",
    "- پرسشی که دربارهٔ خودِ کاربر است (پاسخ را دیده‌ای؟ چقدر مطمئن بودی؟ دیگران هم؟ چند بار؟) را فقط از حرفِ صریحِ خودش پر کن؛ وگرنه بپرس. برای تصمیمِ کاربر یک گزینه را زرد نکن (جهت‌دادن است) — یا همهٔ گزینه‌ها را زرد کن یا فقط بپرس.",
    "- ساختنِ رکوردِ تازه تصمیم نیست: در نمای فهرستی (مثلاً kcases ⇐ «+ موقعیتِ تازه»، topics، e_prob ⇐ «افزودنِ مسئلهٔ تو») دکمهٔ ساختن را همان نوبت بزن و next:true بده.",
    "- حرفِ نامربوط (بیرون از یادگیری، معرفت‌شناسی/سنجشِ ادعا، گره‌گشایی/حلِ مسئله و کار با همین صفحه): status=\"unrelated\" و مؤدبانه بگو به این‌جا ربطی ندارد و در یک جمله بگو چه کمکی از این‌جا برمی‌آید.",
    "- کاربرِ تازه («چی کار می‌تونه بکنه؟»): کوتاه و از روی همین نقشه بگو و جای شروع را نشان بده — «از اینجا شروع کن» در منو، «🗺 نقشه‌ها» (قلمروِ سامانه‌ها، گرافِ مشترک)، «🧠 کارنامهٔ ذهن» و این‌که تور با خودِ تو مسئله را تا تسلط پیگیری می‌کند؛ بعد سرِ هدفِ خودش برو.",
    "- **تو پزشکِ عمومیِ این سامانه‌ای: پیش از هر ارجاع تشخیصِ افتراقی کن.** (۱) خواستهٔ واقعیِ کاربر را از ظاهرِ حرفش جدا کن؛ (۲) دست‌کم دو بخش/قلمروِ نامزد را از «نقشهٔ سامانه» نام ببر و برای هر کدام شاهد بیاور که هست یا نیست (نما، فرم، قلمروِ معرفت‌شناسی با گامش، پیشنهادِ منتظر، برگهٔ باز)؛ (۳) فقط بعد تصمیم بگیر. اشتباه در ارجاع، متخصص را به بیراهه می‌برد. پیش از هر gap از نوعِ fix («فلان کار نمی‌شود»): در پویشِ همین صفحه دنبالِ دکمه‌ای بگرد که همان کار را می‌کند (مثلاً در کارخانه ایستگاه فقط با «ثبت و ایستگاه بعد» ثبت می‌شود، نه با نوارِ مسیر) و اول آن را امتحان کن؛ اگر برگه‌ای را به‌اشتباه ثبت کردی، صریح بگو و شماره‌اش را بگو تا کاربر در «نظارت و سرکشی» ببندد.",
    "- اگر بخشی هست ⇒ کاربر را همان‌جا ببر (اگر به چند بخش مربوط است، ترتیب و دلیلِ هر کدام). اگر هست ولی هنوز کامل نیست یا در «کارِ جاریِ هر روتین» آمده است (مثلاً حوزهٔ قلمرو در گامِ ۱، یا خطایی که در مسیرِ ۲ ِ بک‌تست است) ⇒ صادقانه بگو کجای راه است و چه کسی و کِی جلو می‌برد؛ فقط اگر کاربر الان لازمش دارد، kind=\"priority\". اگر بخش هست ولی غلط کار می‌کند ⇒ kind=\"fix\". فقط اگر واقعاً نیست ⇒ kind=\"build\".",
    "- کمبودِ سامانه (status=\"gap\"): خواسته در قلمروِ همین صفحه است و تشخیصِ بالا نشان داد پوشش داده نمی‌شود. gap را کامل پر کن: area دقیقاً یکی از شناسه‌های «چه کسی مسئولِ چیست»؛ kind؛ abstract (نیازِ کلی — این دسته از خواسته‌ها و نمونه‌های مشابه، نه تکرارِ مسئلهٔ کاربر)؛ missing (دقیقاً چه کم است)؛ where؛ how؛ relations؛ docs؛ why_area (چرا همین قلمرو)؛ why_not (چرا نه نامزدهای دیگر)؛ evidence (چه در نقشه نشان می‌دهد نیست)؛ confidence (۰ تا ۱). اگر confidence کمتر از ۰٫۷۵ است برگه نخواه — یک پرسشِ روشن‌کننده از کاربر بپرس. اگر برگهٔ بازی همین را می‌گوید، برگهٔ تازه نخواه و شماره‌اش را بگو. ثبتِ نهایی پس از نظرِ دوم (مشاور) است؛ به کاربر بگو «برای ثبت بررسی می‌کنم».",
    "- حافظه: memory خلاصهٔ انباشتهٔ کلِ همین سشن است از اولین پیام تا حالا (هدف، از کجا آمدیم، تصمیم‌ها، آنچه پر و ثبت شد و کجا، نکته‌های کلیدیِ فایل‌ها، آنچه مانده) — هر بار کاملش را برگردان، چیزی را نینداز.",
    "- pinned: خواستهٔ اصلیِ سشن در یک جمله (نوبتِ اول بساز؛ بعداً فقط اگر خواستهٔ اصلی واقعاً عوض شد).",
    "- next: اگر در همین پاسخ گفتی «بعدش فلان دکمه را می‌زنم» و آن کار پس از کلیک‌های همین نوبت شدنی می‌شود، next:true بده تا سامانه صفحهٔ تازه را بفرستد و همان را انجام دهی؛ قولی نده که بی‌پیامِ کاربر عملی نشود.",
    "- steps: فهرستِ کاملِ مراحلِ رسیدن به خواستهٔ اصلی با وضعِ هر کدام (done/now/todo) و نمای هر کدام.",
    "خروجی فقط یک JSON (بی متنِ دیگر):",
    '{"reply":"…","title":"نامِ کوتاهِ سشن (۲ تا ۶ واژه؛ نوبتِ اول)","pinned":"…","memory":"…","status":"related|unrelated|gap","next":false,"outside":"","know":[],' +
    '"steps":[{"t":"…","s":"done|now|todo","view":"…"}],' +
    '"actions":[{"do":"go","view":"…","arg":"…","sub":"…"},{"do":"fill","k":"k3","value":"…"},{"do":"highlight","k":"k5","why":"…"},{"do":"click","k":"k9"},{"do":"attach","k":"k7","fileIds":[12]}],' +
    '"reread":[12],"gap":{"title":"…","area":"…","kind":"build|priority|fix","abstract":"…","missing":"…","where":"…","how":"…","relations":"…","docs":"…","why_area":"…","why_not":"…","evidence":"…","confidence":0.9}}'
  ].join("\n");
  AS.SYS = SYS;
  /* نسخهٔ مستقل (بی میزبان): فایلِ متنی را خودِ مرورگر کامل می‌خواند. در Lifemanager سرور هر قالبی را کامل می‌خواند (app_reading). */
  function readText(f) {
    if (!f || f.size > 2000000 || !(/^text\/|json|csv|xml|markdown/.test(f.type || "") || /\.(txt|md|csv|json|tsv|xml|html?)$/i.test(f.name || ""))) return Promise.resolve("");
    return new Promise(function (res) { try { var r = new FileReader(); r.onload = function () { res(String(r.result || "")); }; r.onerror = function () { res(""); }; r.readAsText(f); } catch (e) { res(""); } });
  }
  /* تاریخچه: هرچه از گفت‌وگو در بودجه جا شود، کامل (تازه‌ترین‌ها اول انتخاب و به ترتیبِ زمان چیده می‌شوند)؛
     آنچه جا نشود در «حافظهٔ سشن» (خلاصهٔ انباشته‌ای که مدل هر نوبت کامل برمی‌گرداند) هست — پس هیچ‌چیز از اول تا حالا گم نمی‌شود */
  function history(s, skipLast, budget) {
    var out = [], used = 0, all = skipLast ? s.msgs.slice(0, -1) : s.msgs, cap = budget == null ? HIST_CHARS : budget;
    for (var i = all.length - 1; i >= 0; i--) {
      var m = all[i];
      var line = (m.role === "user" ? "کاربر: " : m.role === "sys" ? "سامانه: " : "دستیار: ") + String(m.text || "").slice(0, 4000) +
        (m.files && m.files.length ? " [پیوست: " + m.files.map(function (f) { return (f.id != null ? f.id + "=" : "") + f.name; }).join("، ") + "]" : "");
      if (used + line.length > cap && (out.length || cap < 200)) { out.unshift("(" + fa(i + 1) + " پیامِ قدیمی‌تر در «حافظهٔ سشن» خلاصه شده است)"); break; }
      out.unshift(line); used += line.length;
    }
    return out;
  }
  function userPrompt(s, msg, sc, extra, skipLast, histBudget) {
    var L = ["# سشن", "نام: " + (s.title || "(هنوز بی‌نام)"), "خواستهٔ اصلی (سنجاق‌شده): " + (s.pinned || "(هنوز نیست)"), "حافظهٔ سشن: " + (s.memory || "(خالی)")];
    if (s.steps && s.steps.length) L.push("مراحل: " + s.steps.map(function (x, i) { return (i + 1) + ") " + x.t + " [" + (x.s || "todo") + "]" + (x.view ? " (" + x.view + ")" : ""); }).join(" "));
    if (s.files && s.files.length) L.push("پیوست‌های سشن (id=نام): " + s.files.map(function (f) { return f.id + "=" + f.name; }).join("، ") + " — اگر برای پاسخ دوباره به محتوای یکی لازم داری، reread بده.");
    if (AS.tourText) { var tt = AS.tourText(s); if (tt) L.push(tt); }
    if (s.reports && s.reports.length) L.push("برگه‌های ثبت‌شده در این سشن: " + s.reports.map(function (r) { return "#" + r.number + " " + r.title; }).join("، "));
    L.push("", "# برگه‌های بازِ «نظارت و سرکشی» روی همین صفحه", sheetsText(AS._sheets || []));
    (AS.promptHooks || []).forEach(function (fn) { try { var x = fn(s, msg); if (x) L.push("", x); } catch (e) { } });
    var rt = AS.recentToasts(); if (rt.length) L.push("", "# پیام‌های اخیرِ صفحه (۴ دقیقهٔ گذشته؛ مثلاً پس از دکمه‌ای که خودِ کاربر زد)", rt.map(function (x) { return "- " + x; }).join("\n"));
    L.push("", "# صفحهٔ فعلی", scanText(sc), "", "# گفت‌وگو تا این لحظه");
    var HP = L.length;
    L.push("", "# نوبتِ تازه", msg);
    if (extra) L.push(extra);
    if (histBudget === -1) return { head: L.slice(0, HP).join("\n"), tail: L.slice(HP).join("\n") };
    var hx = history(s, skipLast, histBudget);
    return L.slice(0, HP).concat(hx, L.slice(HP)).join("\n");
  }
  /* نقشهٔ سامانه در بخشِ «کاربر» می‌رود (سقفِ سرور ۶۰هزار نویسه؛ پیامِ سیستم ۲۰هزار) — اشراف که بزرگ شد، تماس نمی‌شکند */
  var MAX_USER = 58000;
  /* بودجه: نقشه + سشن + صفحه + پیامِ تازه + متنِ فایل همیشه کامل؛ تاریخچه هرچه جا بماند (بقیه در «حافظهٔ سشن»).
     اگر حتی بی تاریخچه جا نشود (فقط نسخهٔ مستقل با فایلِ متنیِ خیلی بزرگ)، متنِ فایل با **اعلامِ صریح** کوتاه می‌شود — هرگز بی‌صدا. */
  AS.prompt = function (s, msg, sc, extra, skipLast) {
    var man = "# نقشهٔ سامانه (خودکار از ثبت‌گاه‌ها)\n" + AS.manifest() + "\n\n";
    var parts = userPrompt(s, msg, sc, extra, skipLast, -1);
    /* پیامِ تازهٔ کاربر هرگز بریده نمی‌شود (کارزارِ آزمونِ دوم c11: در صفحه‌ای با فیلدهای بسیار، کل ورودی از ۵۸هزار گذشت و پیامِ کاربر
       از تهِ آن افتاد — دستیار بی دیدنِ حرف جواب داد). اول فهرستِ صفحه کوتاه می‌شود (با اعلامِ صریح)، بعد نقشهٔ سامانه. */
    var over = man.length + parts.head.length + parts.tail.length + 200 + Math.min(HIST_CHARS, 6000) - MAX_USER;
    if (over > 0) {
      var i0 = parts.head.indexOf("# صفحهٔ فعلی"), i1 = parts.head.lastIndexOf("# گفت‌وگو تا این لحظه");
      if (i0 >= 0 && i1 > i0) {
        var pg = parts.head.slice(i0, i1), cut = Math.min(pg.length - 400, over + 300);
        if (cut > 0) { parts.head = parts.head.slice(0, i0) + pg.slice(0, pg.length - cut) + "\n[سامانه: بقیهٔ فهرستِ این صفحه (" + cut + " نویسه) جا نشد — اگر فیلدی را نمی‌بینی، به کاربر بگو و نخستین کلیدهای بالا را به کار ببر]\n\n" + parts.head.slice(i1); over -= cut; }
      }
      if (over > 0) { man = man.slice(0, Math.max(3000, man.length - over - 200)) + "\n[سامانه: بقیهٔ نقشهٔ سامانه جا نشد]\n\n"; }
    }
    var room = MAX_USER - man.length - parts.head.length - parts.tail.length - 200;
    if (room < 0) {
      var keep = Math.max(2000, parts.tail.length + room - 400);
      parts.tail = parts.tail.slice(0, keep) + "\n[سامانه: متنِ فایل از این‌جا به بعد در این نسخه جا نشد — به کاربر صادقانه بگو کدام بخش را ندیدی؛ در Lifemanager سرور کلِ فایل را می‌خواند.]";
      room = 0;
    }
    var hx = history(s, skipLast, Math.min(HIST_CHARS, room));
    var body = man + parts.head + "\n" + hx.join("\n") + "\n";
    return body.slice(0, Math.max(0, MAX_USER - parts.tail.length)) + parts.tail;   // تهِ ورودی (پیامِ تازه) همیشه کامل
  };
  function parse(t) { var o = A.parseJSONLoose ? A.parseJSONLoose(t) : JSON.parse(t); if (!o || typeof o.reply !== "string") throw new Error("پاسخِ دستیار ناخوانا بود"); return o; }
  function unwrap(r) { return r && typeof r === "object" ? r : { text: r, files: [] }; }
  /* پاسخِ غیرِ JSON دو بار پشتِ هم ⇒ همان متن به‌عنوانِ پاسخ (بی کار روی صفحه)، نه خطا */
  function ask(sys, user, opts) {
    var o2 = Object.assign({}, opts, { withMeta: true });
    return A.callAI(sys, user, o2).then(function (r1) {
      r1 = unwrap(r1);
      try { var o = parse(r1.text); o._files = r1.files; return o; } catch (e) {
        return A.callAI(sys, user, o2).then(function (r2) {
          r2 = unwrap(r2);
          try { var o3 = parse(r2.text); o3._files = r2.files; return o3; } catch (e2) {
            var t = String(r2.text || r1.text || "").replace(/```[a-z]*|```/g, "").trim();
            return { reply: t.slice(0, 1200) || "پاسخ را نفهمیدم؛ دوباره بگو.", status: "related", actions: [], _files: r2.files || r1.files };
          }
        });
      }
    });
  }

  /* ---------- کمبود ⇒ برگهٔ فوری در «نظارت و سرکشی» ---------- */
  function norm(t) { return String(t || "").replace(/[\s‌«»"'.,،:؛!?؟()\-]+/g, "").slice(0, 60); }
  function areaInfo(id) {
    var OW = (window.EPI_BT_LEDGER || {}).ownership || { areas: [], routines: {} };
    var ar = OW.areas.filter(function (x) { return x.id === id; })[0];
    if (!ar) return null;
    var who = [].concat(ar.owner || []).map(function (o) { var r = OW.routines[o] || {}; return (r.fa || o) + (r.cadence ? " — " + r.cadence : "") + (r.prompt ? " — دستور: " + r.prompt : ""); }).join(" + ");
    return { ar: ar, who: who };
  }
  AS.areaInfo = areaInfo;
  var KIND_FA = { build: "ساختنِ چیزی که نیست", priority: "جلو انداختنِ کاری که در نقشهٔ کارِ روتینِ مالک هست", fix: "اصلاحِ بخشی که هست ولی درست کار نمی‌کند" };
  AS.reportText = function (s, g) {
    var sp = (A.state.view || "") + (A.state.arg != null ? " / " + A.state.arg : "");
    var ai = areaInfo(g.area) || areaInfo("lla-page") || { ar: { id: g.area || "?", fa: "؟" }, who: "؟" };
    return [
      "[دستیار · کمبودِ سامانه · قلمرو: " + ai.ar.id + " · " + (g.kind || "build") + "] " + clip(g.title || s.pinned || "کمبودِ سامانه", 100),
      "",
      "ثبت‌شده توسط «💬 دستیار» (نه مستقیمِ مالک) — سشن «" + (s.title || s.id) + "» (" + s.id + ")، هنگامِ کار روی نمای " + sp + ". روال‌های دیگر: برداشتِ دستیار را درست فرض نکنید؛ بسنجید و اگر نادرست است همین‌جا اصلاح کنید.",
      "",
      "■ قلمرو و مالک: «" + ai.ar.fa + "» (`" + ai.ar.id + "`) — مالک: " + ai.who + (ai.ar.rule ? " — " + ai.ar.rule : "") + (ai.ar.procedure ? " — بخشِ دستور: " + ai.ar.procedure : ""),
      "■ نوع: " + (KIND_FA[g.kind] || KIND_FA.build),
      "■ نیازِ انتزاعی (این دسته از خواسته‌ها، نه فقط مسئلهٔ مالک): " + (g.abstract || "—"),
      "■ دقیقاً چه کم است: " + (g.missing || "—"),
      "■ کجا افزوده شود: " + (g.where || "—"),
      "■ چطور: " + (g.how || "—"),
      "■ پیوند با بخش‌های دیگر: " + (g.relations || "—"),
      "■ تشخیصِ افتراقیِ دستیار: چرا این قلمرو — " + (g.why_area || "—") + " · چرا نه بقیه — " + (g.why_not || "—") + " · شاهد — " + (g.evidence || "—") +
        " · اطمینان " + (g.confidence != null ? g.confidence : "?") + " · نظرِ دوم (مدلِ استدلالی): " + (g.consult || "در دسترس نبود — با دقتِ بیشتر بسنجید"),
      "■ مستنداتی که باید به‌روز شوند: " + (g.docs || "WORKLOG، HANDBOOK، AGENTS.md") + " — به‌علاوهٔ همیشگی‌ها: ورودیِ VIEW_META/ثبت‌گاه برای هر نما یا قابلیتِ تازه (تا دستیار خودکار بشناسدش)، WORKLOG (n)، ردیفِ PROGRESS، بخش و §۱۰/§۱۲ ِ HANDBOOK، docs/overhaul/AUDIT_LOG.md.",
      "",
      "■ روالِ رسیدگی (بخشِ «هماهنگی میانِ روتین‌ها» در هر سه دستور): ۱) `python3 scripts/supervisor/handoff.py precheck --area " + ai.ar.id + " --sheet <شمارهٔ همین برگه>` — اگر روتینِ مالک همین را انجام داده، دوباره‌کاری نکنید؛ با ارجاع به دور/کامیتش جواب دهید و `--kind owner-did` ثبت کنید. ۲) اگر قلمرو مالِ روتینِ دیگری است: یا دقیقاً با دستورِ همان روتین (همان ابزار، همان نگهبان‌ها و بازبینیِ مستقل) و `handoff.py add --kind did`، یا اگر خط‌لولهٔ آن روتین لازم است `--kind request` تا خودش در دورِ بعدش انجام دهد و زیرِ همین برگه جواب بنویسد. ۳) قلمروِ تصمیمِ مالک (قاعده، سقف، ایستگاه، وزن، متنِ جزوه) ⇒ فقط پیشنهاد. ۴) در WORKLOG بنویسید «پاسخ به برگهٔ دستیار #n — دست‌به‌دست h…».",
      "",
      "■ حرفِ مالک در این سشن (برای زمینه): " + clip(s.pinned || "", 300)
    ].join("\n").slice(0, 7900);
  };
  AS.fileGap = function (s, g) {
    var key = norm(g.title || s.pinned);
    var since = Date.now() - 30 * 864e5;   // همان کمبود در ۳۰ روزِ اخیر ثبت شده ⇒ برگهٔ دوم نه (پس از آن، اگر هنوز هست، دوباره)
    var dup = AS.sessions().some(function (x) { return (x.reports || []).some(function (r) { return r.key === key && Date.parse(r.at || 0) > since; }); });
    if (dup) return Promise.resolve({ dup: true });
    var text = AS.reportText(s, g);
    if (!A.HOST || !A.HOST.report) { s.reports.push({ key: key, title: clip(g.title, 80), at: now(), local: true, text: text }); S.put(s); return Promise.resolve({ local: true }); }
    var q = "?tab=" + encodeURIComponent(A.state.view || "") + (A.state.arg != null ? "&a=" + encodeURIComponent(A.state.arg) : "") + (A.state.sub ? "&s=" + encodeURIComponent(A.state.sub) : "");
    var spot = { page: "/apps/learning-architecture", page_label: "معماری یادگیری عمیق", section_id: "assistant:" + (g.area || "lla-page"), section_label: "💬 دستیار — " + ((areaInfo(g.area) || {}).ar || {}).fa + " — " + labelOf(A.state.view),
      reopen: "/apps/learning-architecture" + q, dom_path: ".as-root", covered_text: clip(s.pinned || g.title, 400) };
    var files = (s.files || []).map(function (f) { return blobs[f.id]; }).filter(Boolean);
    return A.HOST.report({ text: text, spot: spot, urgent: true, files: files }).then(function (r) {
      s.reports.push({ key: key, id: r.id, number: r.number, title: clip(g.title, 80), area: g.area, kind: g.kind, facet: g.facet || "", at: now() }); S.put(s); return r;
    });
  };

  /* ---------- نظرِ دوم پیش از ارجاع (پزشکِ عمومی ⇒ مشاورِ ارشد): مدلِ استدلالیِ خودِ صفحه، فقط وقتی دستیار می‌خواهد برگه ثبت کند ---------- */
  var CONSULT_SYS = "تو مشاورِ ارشدِ ارجاع در سامانهٔ «معماری یادگیری عمیق و کارخانهٔ معرفت‌شناسی» هستی. دستیارِ گفت‌وگو (پزشکِ عمومی) می‌خواهد برای یک کمبود برگهٔ فوری در «نظارت و سرکشی» ثبت کند. با «نقشهٔ سامانه»، «چه کسی مسئولِ چیست»، قلمروِ معرفت‌شناسی (با گام‌ها)، پیشنهادهای منتظر و برگه‌های باز، تشخیصِ او را سخت‌گیرانه بسنج: آیا واقعاً نیست (یا بخشی هست که او ندیده)؟ آیا در نقشهٔ کارِ یک روتین است (priority) یا خراب است (fix)؟ قلمرو درست است؟ برگهٔ بازی همین را نمی‌گوید؟ ارجاعِ غلط متخصص را به بیراهه می‌برد. فقط JSON: {\"agree\":true|false,\"area\":\"…\",\"kind\":\"build|priority|fix\",\"dup_of\":null,\"reason\":\"یک تا سه جملهٔ فارسی\",\"fix\":{\"abstract\":\"…\",\"missing\":\"…\",\"where\":\"…\",\"how\":\"…\",\"relations\":\"…\"}} — در fix فقط آنچه را باید عوض شود بنویس.";
  AS.CONSULT_SYS = CONSULT_SYS;
  AS.consult = function (s, g) {
    var users = s.msgs.filter(function (m) { return m.role === "user"; }).slice(-6).map(function (m) { return "- " + clip(m.text, 800); }).join("\n");
    var u = "# نقشهٔ سامانه\n" + AS.manifest() + "\n\n# برگه‌های باز\n" + sheetsText(AS._sheets || []) +
      "\n\n# سشن\nخواستهٔ اصلی: " + (s.pinned || "") + "\nحافظه: " + (s.memory || "") + "\nپیام‌های اخیرِ کاربر:\n" + users +
      "\n\n# تشخیصِ دستیار\n" + JSON.stringify(g);
    return A.callAI(CONSULT_SYS, u, { task: "learning_architecture", maxTokens: 3000 }).then(function (t) {
      var o = (A.parseJSONLoose || JSON.parse)(typeof t === "object" ? t.text : t);
      if (!o || typeof o.agree !== "boolean") throw new Error("نظرِ دوم ناخوانا بود");
      return o;
    });
  };
  function validArea(id) { return !!areaInfo(id); }
  /* تصمیمِ نهایی برای یک «gap»: اطمینانِ کم ⇒ نه؛ برگهٔ باز ⇒ نه؛ نظرِ دوم مخالف ⇒ نه؛ موافق ⇒ با اصلاح‌های مشاور ثبت */
  function isDup(s, g) {
    var key = norm(g.title || s.pinned), since = Date.now() - 30 * 864e5;
    return AS.sessions().concat([s]).some(function (x) { return (x.reports || []).some(function (r) { return r.key === key && Date.parse(r.at || 0) > since; }); });
  }
  AS.triage = function (s, g) {
    if (isDup(s, g)) return Promise.resolve({ skip: "این کمبود پیش‌تر ثبت شده بود؛ برگهٔ تازه نساختم." });
    var conf = +g.confidence;
    if (!(conf >= 0.75)) return Promise.resolve({ skip: "اطمینانِ دستیار کم بود (" + (isNaN(conf) ? "?" : conf) + ")؛ برگه ثبت نشد — اول باید روشن شود." });
    return AS.consult(s, g).then(function (c) {
      if (c.dup_of) return { skip: "نظرِ دوم: همین در برگهٔ #" + fa(c.dup_of) + " هست؛ برگهٔ تازه ثبت نشد." };
      if (!c.agree) return { skip: "نظرِ دوم: برگه لازم نیست — " + (c.reason || "") };
      var out = Object.assign({}, g, c.fix || {});
      if (c.area && validArea(c.area)) out.area = c.area;
      if (c.kind) out.kind = c.kind;
      out.consult = "موافق" + (c.area && c.area !== g.area ? " (قلمرو اصلاح شد: " + g.area + " ⇒ " + c.area + ")" : "") + " — " + (c.reason || "");
      if (!validArea(out.area)) out.area = "lla-page";
      return { gap: out };
    }, function (e) {
      // مشاور در دسترس نیست: فقط تشخیصِ بسیار مطمئن، و با نشانِ «بی نظرِ دوم» تا روتین‌ها سخت‌گیرانه‌تر بسنجند
      if (conf >= 0.9 && validArea(g.area)) return { gap: Object.assign({}, g, { consult: "در دسترس نبود (" + errText(e) + ")" }) };
      return { skip: "نظرِ دوم در دسترس نبود و اطمینان برای ثبتِ بی‌مشاوره کافی نبود؛ برگه ثبت نشد (" + errText(e) + ")." };
    });
  };

  /* ---------- یک نوبت ---------- */
  function manifestNote(files) {
    if (!files || !files.length) return "";
    return "📖 " + files.map(function (f) {
      var ok = f.complete || f.status === "image";
      return "«" + f.name + "»: " + (f.status === "image" ? "تصویر دیده شد" : ok ? "کامل خوانده شد" + (f.chars ? " (" + fa(f.chars) + " نویسه" + (f.pages ? "، " + fa(f.pages) + " صفحه" : "") + ")" : "") :
        f.status === "unsupported" ? "خوانده نشد — " + (f.note || "قالب پشتیبانی نمی‌شود") : f.status === "missing" ? "پیدا نشد" : "ناقص/ناموفق — " + (f.note || f.status));
    }).join(" · ");
  }
  AS.busy = function () { return busy; };
  AS.send = function (text, files) {
    if (busy) return Promise.resolve();
    text = String(text || "").trim(); files = files || [];
    if (!text && !files.length) return Promise.resolve();
    var s = AS.cur() || AS.newSession();
    busy = true; paint();
    var m = { role: "user", text: text || "(فایل)", at: now(), files: [] };
    s.msgs.push(m); S.put(s); paint();
    if (files.length > MAX_FILES) { A.toast("در هر پیام حداکثر " + fa(MAX_FILES) + " فایل؛ بقیه را در پیامِ بعد بفرست", "bad"); files = files.slice(0, MAX_FILES); }
    var ups = Promise.resolve(), aiIds = [], texts = [];
    files.forEach(function (f) {
      ups = ups.then(function () {
        if (!A.HOST || !A.HOST.upload) {   // نسخهٔ مستقل: فقط متن‌ها، و صادقانه می‌گوید بقیه را نمی‌بیند
          return readText(f).then(function (t) { m.files.push({ name: f.name, mime: f.type || "" }); if (t) texts.push("— متنِ کاملِ «" + f.name + "»:\n" + t); else texts.push("— «" + f.name + "»: این نسخه (بی Lifemanager) فقط فایلِ متنی را می‌خواند؛ این یکی خوانده نشد."); });
        }
        if (f.size > MAX_FILE_MB * 1048576) { A.toast("«" + f.name + "» بزرگ‌تر از " + fa(MAX_FILE_MB) + " مگابایت است", "bad"); m.files.push({ name: f.name, mime: f.type || "", err: true }); return; }
        return A.HOST.upload(s.id, f, { group: GROUP, title: provisional(s, text) }).then(function (r) {
          var info = { id: r.id, name: r.name || f.name, mime: r.mime || f.type || "", link: r.link || "" };
          blobs[r.id] = f; m.files.push(info); s.files.push(info); aiIds.push(r.id);
        }, function (e) { m.files.push({ name: f.name, mime: f.type || "", err: true }); A.toast("«" + f.name + "» به درایو نرفت: " + errText(e), "bad"); });
      });
    });
    var auto = 0;
    function turn(msg, extra, ids, first) {
      // تور پیش از ساختنِ پرامپت هم هم‌گام می‌شود: کاری که کاربر بیرون از گفت‌وگو تمام کرد (مثلاً ایستگاهِ پایانی) همین نوبت دیده شود —
      // وگرنه مدل روی وضعِ کهنه جواب می‌داد (تورِ زندهٔ ۲۰۲۶-۱۰-۱۴)
      if (AS.tourAfterTurn && s.tour) { try { AS.tourAfterTurn(s); } catch (e) { console.error(e); } }
      var sc = AS.scan();
      return AS.openSheets().then(function (l) { AS._sheets = l; AS._turnSession = s; return ask(AS.SYS, AS.prompt(s, msg, sc, extra, first), { task: "lla_assistant", fileIds: ids || [], maxTokens: 6000 }); }).then(function (o) {
        if (o._files && o._files.length) { s.msgs.push({ role: "sys", at: now(), text: manifestNote(o._files) }); }
        // نامِ سشن: اگر پیامِ اول نامربوط بود (مثلاً «دستورِ پخت»)، با نخستین خواستهٔ مربوط دوباره ساخته می‌شود (کارزارِ آزمون)
        if (o.title && (!s.title || (s.titleUnrelated && o.status !== "unrelated"))) { s.title = clip(o.title, 80); s.titleUnrelated = o.status === "unrelated"; }
        if (o.pinned && (!s.pinned || o.pinned !== s.pinned)) s.pinned = clip(o.pinned, 300);
        if (o.memory) s.memory = clip(o.memory, 6000);
        if (Array.isArray(o.steps) && o.steps.length) s.steps = o.steps.slice(0, 20).map(function (x) { return { t: clip(x.t, 140), s: /^(done|now|todo)$/.test(x.s) ? x.s : "todo", view: A.V[x.view] ? x.view : "" }; });
        s.status = o.status || "related";
        var acts = s.status === "unrelated" ? [] : (Array.isArray(o.actions) ? o.actions : []);
        // عملیاتِ تور پیش از هر چیز (حتی پیش از ثبتِ برگه): برگه‌ای که برای وجهی از تور است باید آن وجه را پیدا کند
        // (شبیه‌سازیِ ۲۰۲۶-۱۰-۱۴: tour_plan و gap در یک پاسخ ⇒ برگه پیش از ساختِ تور ثبت شد و وجه «منتظر» نشد)
        var tnotes = [];
        acts.filter(function (x) { return x && /^tour_/.test(x.do) && DO[x.do]; }).forEach(function (x) { try { var m = DO[x.do](x); if (m) tnotes.push(m); } catch (e) { tnotes.push(e.message); } });
        acts = acts.filter(function (x) { return !(x && /^tour_/.test(x.do)); });
        if (tnotes.length) s.msgs.push({ role: "sys", at: now(), text: tnotes.join(" · ") });
        // شناسهٔ رکورد در متنِ پاسخ نمی‌ماند (کارزارِ آزمون c10: «fc_mv8l49yh0q1ge» در گفت‌وگو)
        o.reply = String(o.reply || "").replace(/\b(?:kc|kcase|knot|case|kexp|kitem|pbitem|fc|wc|vl|mn|tp|ex|eprob|pq|achat|rep)_[A-Za-z0-9]{6,}\b/g, "").replace(/\s{2,}/g, " ");
        var a = { role: "ai", text: o.reply, at: now(), actions: acts.map(function (x) { return x && x.do; }).filter(Boolean) };
        s.msgs.push(a);
        // بخشی که بیرون از این صفحه است: صادقانه و جدا گفته و در سشن نگه داشته می‌شود (نیمی‌مربوط ≠ نامربوط)
        if (o.outside && String(o.outside).trim()) { var outT = clip(String(o.outside), 400); s.outside = (s.outside || []).concat([{ at: now(), text: outT }]).slice(-20); s.msgs.push({ role: "sys", at: now(), text: "↗ بیرون از این صفحه: " + outT }); } if (s.msgs.length > MAX_MSGS) s.msgs = s.msgs.slice(-MAX_MSGS);
        S.put(s); paint();
        var gap = s.status === "gap" && o.gap ? AS.triage(s, o.gap).then(function (t) {
          if (t.skip) { s.msgs.push({ role: "sys", at: now(), text: t.skip }); S.put(s); paint(); return null; }
          sheetCache.at = 0;
          return AS.fileGap(s, t.gap).then(function (r) { if (r && !r.dup && AS.tourBlock && t.gap.facet) AS.tourBlock(s, t.gap.facet, r, t.gap); else if (r && !r.dup && s.tour && AS.tourAdoptSheet) AS.tourAdoptSheet(s, r, t.gap); return r; });
        }).then(function (r) {
          if (!r) return;
          s.msgs.push({ role: "sys", at: now(), text: r.dup ? "این کمبود پیش‌تر ثبت شده بود؛ برگهٔ تازه نساختم." : r.local ? "برگه ساخته شد ولی این نسخه به «نظارت و سرکشی» وصل نیست؛ متنش در سشن ماند." : "🛎 برگهٔ فوری #" + fa(r.number) + " در «نظارت و سرکشی» ثبت شد." });
          S.put(s); paint();
        }, function (e) { s.msgs.push({ role: "sys", at: now(), text: "ثبتِ برگهٔ فوری نشد: " + errText(e) }); S.put(s); paint(); }) : Promise.resolve();
        return gap.then(function () { return AS.run(acts); }).then(function (res) {
          if (AS.tourAfterTurn) { try { AS.tourAfterTurn(s); S.put(s); paint(); } catch (e) { console.error(e); } }
          if (res.notes.length) { s.msgs.push({ role: "sys", at: now(), text: res.notes.join(" · ") }); S.put(s); paint(); }
          // پنجره‌ای (تأییدِ فرستادن به هوش مصنوعی، پرسشِ ایمنی، …) باز شد: تصمیمِ خودِ کاربر است — دستیار کنار می‌رود و صریح می‌گوید
          var ov = Array.prototype.slice.call(document.querySelectorAll(".overlay, [role=dialog][aria-modal=true]")).filter(function (x) { return !x.closest(".as-root") && x.getClientRects().length > 0; })[0];
          if (ov) {
            var ot = (ov.querySelector("h2,h3") || {}).textContent || "یک پنجره";
            s.msgs.push({ role: "sys", at: now(), text: "🪟 پنجرهٔ «" + clip(ot, 80) + "» باز شد. آن را بخوان؛ اگر موافقی دکمه‌اش (مثلاً «بفرست») را **خودت** بزن — فرستادنِ متنت به هوش مصنوعی و حذفِ نام‌ها تصمیمِ خودِ توست. بعد برای ادامه 💬 را بزن." });
            S.put(s); if (ui && !ui.panel.hidden) AS.toggle(false);
            A.toast("پنجرهٔ تأیید باز شد — بررسی کن و خودت بزن؛ دستیار کنار رفت.");
            return;
          }
          var marked = !!document.querySelector("#main .as-hl, #main .as-filled");
          // know: حوزه‌هایی که مدل خواست ⇒ در سشن می‌ماند و همین حالا یک نوبت با «# دانسته‌های قلمرو»
          var know = (Array.isArray(o.know) ? o.know : []).map(String).filter(function (id) { return A.SYST && A.SYST.byId && A.SYST.byId(id) && (s.know || []).indexOf(id) < 0; }).slice(0, 4);
          if (know.length) { s.know = (s.know || []).concat(know).slice(-6); S.put(s); if (auto < MAX_AUTO) { auto++; return turn("[سامانه: گزاره‌های حوزه‌هایی که خواستی در «# دانسته‌های قلمرو» آمد؛ حالا پاسخ بده.]"); } }
          var reread = (Array.isArray(o.reread) ? o.reread : []).filter(function (id) { return s.files.some(function (f) { return f.id === id; }); }).slice(0, MAX_FILES);
          if (auto < MAX_AUTO && reread.length) { auto++; return turn("[سامانه: محتوای کاملِ پیوست‌هایی که خواستی دوباره همراه است؛ ادامه بده.]", "", reread); }
          // «next»: مدل گفته کارِ بعدی را در همین رشته انجام می‌دهد (مثلاً پس از «ثبتِ کارت»، دکمهٔ «ساختِ نمونه‌ها») —
          // بی آن، قولِ «بعدش می‌زنم» تا پیامِ بعدیِ کاربر معطل می‌ماند (یافتهٔ تورِ زنده)
          // کاری که مدل «انجام‌شده» گفت ولی نشد (کلید پیدا نشد، تصمیمِ مالک، جوابِ تمرین، …) ⇒ یک نوبتِ اصلاح تا پاسخ دروغ نماند
          var failed = res.notes.filter(function (n) { return !/^«.*» تصمیمِ خودت است؛ زردش کردم/.test(n) || /زدم|افزودم|پر کردم/.test(o.reply || ""); });
          if (auto < MAX_AUTO && failed.length && /زدم|افزودم|پر کردم|ثبت کردم|نوشتم|گذاشتم/.test(o.reply || "")) {
            auto++;
            return turn("[سامانه: این کارهای نوبتِ پیش انجام نشد: «" + res.notes.join("» · «") + "». پاسخِ قبلی‌ات گفته بود انجام شده — به کاربر کوتاه و درست بگو چه شد و چه نشد، و اگر راهِ درستی هست همین حالا انجام بده (کارِ تصمیمِ مالک را فقط زرد کن). reply خیلی کوتاه.]");
          }
          var promised = o.next === true && res.clicks > 0 && !res.notes.length, said = res.clicks > 0 && res.toasts && res.toasts.length;
          if (auto < MAX_AUTO && (res.moved || res.changed || promised || said)) {
            auto++;
            return turn("[سامانه: " + (res.moved ? "«" + labelOf(A.state.view) + "»" + (A.state.sub ? " (قدم/برگهٔ " + A.state.sub + ")" : "") + " باز شد" : res.changed ? "فرم تغییر کرد (فیلدهای تازه)" : "کارهایت انجام شد و صفحه دوباره خوانده شد — کارِ بعدی‌ای را که گفتی همین حالا انجام بده") +
              (said ? "؛ پیامِ صفحه پس از کارهایت: «" + res.toasts.join("» · «") + "» — بر پایهٔ همین پیام ادامه بده (حدس نزن)" : "") +
              (res.skipped ? "؛ " + res.skipped + " کارِ بعدیِ نوبتِ پیش اجرا نشد چون کلیدهایش مالِ صفحهٔ قبل بود — اگر هنوز لازم است با کلیدهای تازهٔ همین صفحه انجامش بده" : "") +
              ". حالا از روی همین گفت‌وگو فیلدهای این صفحه را پر کن و باقیِ لازم‌ها را هایلایت کن؛ اگر همه‌چیزِ لازم از حرف‌های کاربر پر شد، دکمهٔ ثبت/ساخت/بعدی را بزن؛ reply خیلی کوتاه.]");
          }
          // موبایل: پنجره روی فرم است ⇒ کنار برود تا زردها و سبزها دیده شوند
          if (marked && window.innerWidth <= 600 && ui && !ui.panel.hidden) { AS.toggle(false); A.toast("پر کردم؛ زردها با تو. برای ادامه دوباره 💬 را بزن."); }
        });
      });
    }
    // نشانهٔ پریشانیِ جدی (همان واژه‌نامهٔ ایمنیِ گره‌گشا): راهِ کمکِ انسانی پیش از هر کار، و مدل هم می‌داند
    var safe = "";
    try { if (text && A.knotSafetyHit && A.knotSafetyHit(text)) { safe = "\n[سامانه: نشانهٔ پریشانیِ جدی در پیامِ کاربر. اول همدلی و راهِ کمکِ انسانی؛ کاری را تحمیل نکن.]"; s.safetyAt = now(); s.msgs.push({ role: "sys", at: now(), text: "🤝 " + (A.KHELP || "اگر حالت خوب نیست، همین حالا با یک نفرِ مورد اعتماد یا یک متخصص حرف بزن.") }); } } catch (e) { }
    return ups.then(function () { S.put(s); return turn(text || "(فقط فایل فرستادم)", (texts.length ? "\n# متنِ فایل‌ها\n" + texts.join("\n\n") : "") + safe, aiIds, true); })
      .catch(function (e) {
        var fl = e && e.files && e.files.length ? " " + manifestNote(e.files) : "";
        s.msgs.push({ role: "sys", at: now(), text: "دستیار پاسخ نداد: " + errText(e) + fl + " — دوباره بفرست." }); S.put(s);
      })
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
  /* اندازه و جای پنجره (مالک ۲۰۲۶-۱۰-۱۴: «پنجره را بشود کشید و بزرگ‌تر و کوچک‌تر کرد»): با کشیدنِ سرتیتر جابه‌جا، با دو گوشهٔ پایین
     بزرگ/کوچک، ⤢ بیشینه/برگشت؛ همه به خاطر می‌ماند. تا کاربر جابه‌جایش نکرده، کنارِ دکمه باز می‌شود. موبایل: برگهٔ پایینِ صفحه. */
  var MINW = 300, MINH = 300;
  function clampG(g) {
    var W = window.innerWidth, H = window.innerHeight;
    var w = Math.min(Math.max(MINW, g.w || 400), W - 16), hh = Math.min(Math.max(MINH, g.h || 520), H - 16);
    return { x: Math.min(Math.max(8, g.x == null ? W - w - 18 : g.x), W - w - 8), y: Math.min(Math.max(8, g.y == null ? 60 : g.y), H - hh - 8), w: w, h: hh, max: !!g.max };
  }
  function setGeom(P, g) {
    var W = window.innerWidth, H = window.innerHeight;
    if (g.max) g = { x: Math.round(W * 0.04), y: Math.round(H * 0.05), w: Math.round(W * 0.92), h: Math.round(H * 0.88), max: true };
    else g = clampG(g);
    P.style.left = g.x + "px"; P.style.top = g.y + "px"; P.style.right = "auto"; P.style.bottom = "auto";
    P.style.width = g.w + "px"; P.style.height = g.h + "px"; P.style.maxHeight = "none";
    P.classList.toggle("as-max", !!g.max);
  }
  AS.geom = function () { return store("pgeom"); };
  function placePanel() {
    if (!ui || ui.panel.hidden) return;
    var P = ui.panel, r = ui.fab.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
    if (W <= 600) { P.style.left = P.style.top = P.style.right = P.style.bottom = P.style.width = P.style.height = ""; return; }
    var g = store("pgeom");
    if (g) { setGeom(P, g); return; }
    P.style.width = P.style.height = "";
    var w = Math.min(400, W - 16), right = Math.min(Math.max(8, W - r.right), W - w - 8);
    P.style.right = right + "px"; P.style.left = "auto";
    if (r.top > H / 2) { P.style.bottom = (H - r.top + 8) + "px"; P.style.top = "auto"; P.style.maxHeight = Math.max(240, r.top - 16) + "px"; }
    else { P.style.top = (r.bottom + 8) + "px"; P.style.bottom = "auto"; P.style.maxHeight = Math.max(240, H - r.bottom - 16) + "px"; }
  }
  window.addEventListener("resize", function () { if (ui) { place(ui.root); placePanel(); } });
  function panelDrag(handle, mode) {   // mode: "move" | "r" (گوشهٔ پایین‌راست) | "l" (گوشهٔ پایین‌چپ)
    var st = null;
    handle.addEventListener("pointerdown", function (e) {
      if (e.button || window.innerWidth <= 600 || (mode === "move" && e.target.closest("button"))) return;
      var r = ui.panel.getBoundingClientRect(); st = { x: e.clientX, y: e.clientY, l: r.left, t: r.top, w: r.width, h: r.height };
      try { handle.setPointerCapture(e.pointerId); } catch (x) { } e.preventDefault();
    });
    handle.addEventListener("pointermove", function (e) {
      if (!st) return; var dx = e.clientX - st.x, dy = e.clientY - st.y, g;
      if (mode === "move") g = { x: st.l + dx, y: st.t + dy, w: st.w, h: st.h };
      else if (mode === "r") g = { x: st.l, y: st.t, w: st.w + dx, h: st.h + dy };
      else g = { x: st.l + dx, y: st.t, w: st.w - dx, h: st.h + dy };
      if (mode === "l" && g.w < MINW) { g.x -= MINW - g.w; g.w = MINW; }
      setGeom(ui.panel, g);
    });
    handle.addEventListener("pointerup", function () {
      if (!st) return; st = null; var r = ui.panel.getBoundingClientRect();
      store("pgeom", { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), max: false });
    });
  }
  AS.toggleMax = function () {
    var g = store("pgeom") || (function () { var r = ui.panel.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })();
    g.max = !g.max; store("pgeom", g); placePanel();
  };
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
      h("button", { class: "as-ib as-maxb", type: "button", title: "بزرگ / اندازهٔ قبلی", "aria-label": "بیشینه یا برگشت", onclick: function () { AS.toggleMax(); } }, "⤢"),
      h("button", { class: "as-ib", type: "button", title: "بستن", "aria-label": "بستن", onclick: function () { AS.toggle(false); } }, "✕"));
    head.title = "برای جابه‌جاییِ پنجره بکش؛ دو بار بزن تا بزرگ شود";
    panelDrag(head, "move");
    head.addEventListener("dblclick", function (e) { if (!e.target.closest("button")) AS.toggleMax(); });
    P.appendChild(head);
    var gr = h("span", { class: "as-grip r", title: "بزرگ/کوچک کردن", "aria-hidden": "true" }), gl = h("span", { class: "as-grip l", title: "بزرگ/کوچک کردن", "aria-hidden": "true" });
    panelDrag(gr, "r"); panelDrag(gl, "l"); P.appendChild(gr); P.appendChild(gl);
    if (ui.view === "list") { P.appendChild(listView()); return; }
    if (s && s.pinned) P.appendChild(h("div", { class: "as-pin", title: "خواستهٔ اصلیِ این سشن" }, "📌 ", s.pinned));
    if (s && s.tour && AS.tourDrawer) P.appendChild(AS.tourDrawer(s));
    else if (s && s.steps && s.steps.length) {
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

  AS.paint = function () { paint(); };
  AS.store = store; AS.clip = clip; AS.errText = errText; AS.labelOf = labelOf;
  /* هر رسمِ صفحه: دستیار سرِ جایش بماند (بی‌آن‌که نما را عوض کند) */
  var rawRender = A.render;
  A.render = function () {
    rawRender.apply(this, arguments);
    try { if (!ui || !document.contains(ui.root)) { ui = null; build(); if (store("open")) AS.toggle(true); } } catch (e) { console.error(e); }
  };
})(APP);
