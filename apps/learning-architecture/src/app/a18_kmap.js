/* ===== گره‌گشا (۳): نقشهٔ ذهن، نمودارهای روند و کالیبراسیون، و شبیه‌سازهای گره — a18_kmap.js =====
   مرجع: docs/specs/KNOTS.md §8 و قراردادِ §13 (و §12 که برتر است).

   آنچه این ماژول صادر می‌کند:
   - A.V.kmap()            «🗺️ نقشهٔ ذهن»: گرافِ SVG ِ بی‌کتابخانه، چیدمانِ قطعی؛ زیرش نمودارِ روند و کالیبراسیون.
   - A.V.ksims(key?)       «🧪 شبیه‌سازهای گره»: فهرستِ شبیه‌سازها (یا فقط یکی، اگر key داده شود).
   - A.KSIM                ثبت‌گاهِ شبیه‌سازها {key: {title, fams[], note, draw()}} — جدا از A.COURSE_SIM (§12.11).
   - A.knotSimFor(fam)     کلیدهای شبیه‌سازهای مرتبط با یک خانواده ("F3") یا یک گره (knot.fam).
   - A.knotSetStatus(knot, status, opts)
                           **تنها** جایی که وضعیتِ گره عوض می‌شود و تاریخچه‌اش ثبت می‌شود. بقیهٔ ماژول‌ها (a16/a17) برای تغییرِ
                           وضعیت همین را صدا بزنند. status ∈ "open"|"working"|"practised"|"returned".
                           اثر: اگر وضعیت عوض شد، knot.hist.push({at, status, from}) (at = زمانِ ISO، from = وضعیتِ پیشین یا "open")،
                           knot.status = status؛ "practised" ⇒ knot.solvedAt = at؛ "returned" ⇒ knot.returnedAt = at؛ و یک S.put.
                           opts.noSave ⇒ بی‌ذخیره (صدازننده خودش یک بار ذخیره می‌کند)؛ opts.at ⇒ زمانِ ثبت (پیش‌فرض: اکنون).
                           برمی‌گرداند: true اگر چیزی عوض شد.
   - A.kmapLayout(knots)   چیدمانِ قطعیِ گره‌ها (برای آزمون و بازتولید): {pos: {id: {x, y, r, fam}}, box, R0, maxR}.
   - A.kmapTrend() / A.kmapCalib()   داده‌های دو نمودار (همان چیزی که رسم می‌شود).

   فیلدهایی که این ماژول **می‌نویسد** (فقط این‌ها):
   - knot.links = [{to, rel: "root-of"|"related"}]  (از کشوی نقشه؛ هر تغییر یک S.put)
   - knot.hist  = [{at, status, from}]               (فقط از راهِ A.knotSetStatus)
   - knot.status / knot.solvedAt / knot.returnedAt   (فقط از راهِ A.knotSetStatus)
   فیلدهایی که فقط **می‌خواند**: knot{id, name, fam, sub, principle, signals, counter, example, cases[], created, updated},
   kcase{id, title, root{primary, extra[]}, knots[]}, kitem{knot, bad, hist[{at, conf, ok}]}.

   قاعده‌ها: هیچ عدد و ادعای علمیِ جعلی؛ هر شبیه‌ساز «نمایشی» است و منبعش دقیقاً همان است که طرح نام برده؛ اگر a16/a17 نباشند
   (A.KF، A.knotCases، A.kmastery، A.V.knot، A.V.kpractice) چیزی نمی‌شکند — نام‌های خانواده از فهرستِ محلیِ همین طرح می‌آید. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, svg = A.svg;
  var PI = Math.PI;

  /* ---------------- وضعیت‌ها و خانواده‌ها ---------------- */
  var ST = ["open", "working", "practised", "returned"];
  var STFA = { open: "باز", working: "در حالِ باز شدن", practised: "ورزیده‌شده", returned: "بازگشته" };
  var STGLYPH = { open: "", working: "◐", practised: "✓", returned: "↺" };
  A.KSTATUS_LIST = ST; A.KSTATUS_FA = STFA;  // (A.KSTATUS is the {id: label} map owned by a16/a17 — never overwrite it)
  /* فقط وقتی A.KF (a16) نیست؛ نام‌ها عیناً از §۴ ِ طرح */
  var FALLBACK_KF = [
    { id: "F1", fa: "دانش و مفهوم", subs: [] }, { id: "F2", fa: "بازنماییِ مسئله", subs: [] },
    { id: "F3", fa: "راهبرد و گیرکردن", subs: [] }, { id: "F4", fa: "پایش و فراشناخت", subs: [] },
    { id: "F5", fa: "ظرفیت و حالتِ ذهنی", subs: [] }, { id: "F6", fa: "عادت و خودکاری", subs: [] },
    { id: "F7", fa: "هیجان و انگیزه", subs: [] }, { id: "F8", fa: "اجتماعی و ارتباطی", subs: [] },
    { id: "F9", fa: "باور دربارهٔ خود و اسناد", subs: [] }, { id: "F10", fa: "موقعیت و ساختار", subs: [] },
    { id: "F11", fa: "برداشت و نتیجه‌گیری", subs: [] }, { id: "F12", fa: "تصمیم و خودتنظیمی", subs: [] }
  ];
  function fams() { return (Array.isArray(A.KF) && A.KF.length) ? A.KF : FALLBACK_KF; }
  function famById(id) { var F = fams(); for (var i = 0; i < F.length; i++) if (F[i].id === id) return F[i]; return null; }
  function famName(id) { var f = famById(id); return f ? f.fa : "خانوادهٔ نامعلوم"; }
  function subName(k) {
    var f = famById(k.fam); if (!f || !k.sub) return "";
    var s = (f.subs || []).filter(function (x) { return x && (x.id === k.sub || x === k.sub); })[0];
    return s ? (s.fa || String(s)) : (typeof k.sub === "string" ? k.sub : "");
  }
  function kst(k) { return ST.indexOf(k && k.status) >= 0 ? k.status : "open"; }
  function kname(k) { return (k && (k.name || k.title)) || "گرهٔ بی‌نام"; }

  /* ---------------- تنها نویسندهٔ وضعیت ---------------- */
  A.knotSetStatus = function (knot, status, opts) {
    opts = opts || {};
    if (!knot || ST.indexOf(status) < 0) return false;
    if (knot.status === status) return false;
    var at = opts.at || new Date().toISOString();
    var from = ST.indexOf(knot.status) >= 0 ? knot.status : "open";
    (knot.hist = Array.isArray(knot.hist) ? knot.hist : []).push({ at: at, status: status, from: from });
    knot.status = status;
    if (status === "practised") knot.solvedAt = at;
    if (status === "returned") knot.returnedAt = at;
    if (!opts.noSave) S.put(knot);
    return true;
  };

  /* ---------------- خواندنِ داده ---------------- */
  function idOf(x) { return x == null || x === "" ? null : typeof x === "object" ? (x.knot || x.id || null) : String(x); }
  function byCreated(a, b) { return String(a.created || "").localeCompare(String(b.created || "")) || String(a.id).localeCompare(String(b.id)); }
  function allKnots() { return S.all("knot").sort(byCreated); }
  function allCases() { return S.all("kcase").sort(byCreated); }
  /* گره‌های ریشهٔ یک موقعیت (قدمِ ۳): root.primary + root.extra — منبعِ یال‌های هم‌رخداد */
  function rootKnots(c) {
    var r = (c && c.root) || {}, out = [];
    [r.primary].concat(Array.isArray(r.extra) ? r.extra : []).forEach(function (x) { var id = idOf(x); if (id && out.indexOf(id) < 0) out.push(id); });
    return out;
  }
  /* همهٔ گره‌هایی که یک موقعیت به آن‌ها اشاره می‌کند (ریشه + knots[]) */
  function caseKnotRefs(c) {
    var out = rootKnots(c);
    (Array.isArray(c.knots) ? c.knots : []).forEach(function (x) { var id = idOf(x); if (id && out.indexOf(id) < 0) out.push(id); });
    return out;
  }
  /* موقعیت‌های پیوندخوردهٔ یک گره: A.knotCases (a16) اگر هست، وگرنه knot.cases ∪ موقعیت‌هایی که به آن اشاره می‌کنند */
  function casesOf(k, cases) {
    if (typeof A.knotCases === "function") {
      try {
        var r = A.knotCases(k.id);
        if (Array.isArray(r)) return r.map(function (c) { return typeof c === "string" ? S.get(c) : c; }).filter(function (c) { return c && c.type === "kcase"; });
      } catch (e) { /* بازگشت به محاسبهٔ محلی */ }
    }
    var ids = {}, out = [];
    (Array.isArray(k.cases) ? k.cases : []).forEach(function (x) { var id = idOf(x); if (id) ids[id] = 1; });
    (cases || allCases()).forEach(function (c) { if (caseKnotRefs(c).indexOf(k.id) >= 0) ids[c.id] = 1; });
    Object.keys(ids).forEach(function (id) { var c = S.get(id); if (c && c.type === "kcase") out.push(c); });
    return out.sort(byCreated);
  }
  function kitemsOf(id) {
    if (typeof A.kitemsOf === "function") { try { var r = A.kitemsOf(id); if (Array.isArray(r)) return r; } catch (e) { } }
    return S.all("kitem", function (it) { return it.knot === id; });
  }
  function mastery(k) {
    if (typeof A.kmastery !== "function") return null;
    try { var m = A.kmastery(k); return m && typeof m === "object" ? m : null; } catch (e) { return null; }
  }
  // a17's kmastery returns why = [{ok, t}] (criterion met? + text); plain strings are accepted too
  function whyOne(x) { return x && typeof x === "object" ? (x.ok === true ? "✓ " : x.ok === false ? "✗ " : "") + (x.t || x.text || x.fa || "") : String(x); }
  function whyText(w) { return Array.isArray(w) ? w.filter(Boolean).map(whyOne).join("؛ ") : (w == null ? "" : whyOne(w)); }

  /* ---------------- چیدمانِ قطعی ----------------
     ۱۲ خانواده = ۱۲ برشِ ۳۰ درجه‌ای (F1 بالا، به ترتیب در جهتِ ساعت). گره‌های هر خانواده به ترتیبِ ساخت در «جای‌گاه»های
     حلقه‌های هم‌مرکز ِ برشِ خودشان می‌نشینند؛ فاصلهٔ دو جای‌گاه دست‌کم SLOT است، پس دو گره هرگز روی هم نمی‌افتند.
     گره با خانوادهٔ نامعلوم در دایرهٔ کوچکِ مرکز. موقعیت‌ها (اگر نمایش داده شوند) در میانگینِ گره‌هایشان، و یک دورِ
     دفعِ قطعی (بی‌تصادف) آن‌ها را از گره‌ها و از هم جدا می‌کند. */
  var R0 = 150, STEP = 76, SLOT = 84, RMAX_NODE = 24;
  function nodeR(nCases) { return Math.min(RMAX_NODE, 10 + 4 * Math.sqrt(nCases || 0)); }
  A.kmapLayout = function (knots, sizeOf) {
    var F = fams(), nF = F.length, sector = 2 * PI / nF, groups = {}, other = [], pos = {}, maxR = R0;
    F.forEach(function (f) { groups[f.id] = []; });
    knots.slice().sort(byCreated).forEach(function (k) { (groups[k.fam] || other).push(k); });
    F.forEach(function (f, i) {
      var list = groups[f.id], a0 = -PI / 2 + i * sector, placed = 0, ring = 0;
      while (placed < list.length) {
        var r = R0 + ring * STEP, n = Math.max(1, Math.floor(sector * r / SLOT) - 1), take = Math.min(n, list.length - placed);
        for (var j = 0; j < take; j++) {
          var a = a0 + sector * (j + 1) / (take + 1), k = list[placed + j];
          pos[k.id] = { x: r * Math.cos(a), y: r * Math.sin(a), r: nodeR(sizeOf ? sizeOf(k) : 0), fam: f.id, ring: ring, a: a };
        }
        placed += take; maxR = Math.max(maxR, r); ring++;
      }
    });
    other.forEach(function (k, j) {
      var a = -PI / 2 + 2 * PI * j / Math.max(1, other.length), r = other.length > 1 ? 52 : 0;
      pos[k.id] = { x: r * Math.cos(a), y: r * Math.sin(a), r: nodeR(sizeOf ? sizeOf(k) : 0), fam: null, ring: -1, a: a };
    });
    var hx = maxR + 210, hy = maxR + 70;
    return { pos: pos, box: { x: -hx, y: -hy, w: 2 * hx, h: 2 * hy }, R0: R0, maxR: maxR, sector: sector };
  };
  /* جای‌گذاریِ موقعیت‌ها: میانگینِ گره‌هایش + دفعِ قطعی */
  function placeCases(cases, pos) {
    var cp = {}, ids = [];
    cases.forEach(function (c, i) {
      var ks = caseKnotRefs(c).filter(function (id) { return pos[id]; }), x = 0, y = 0;
      if (ks.length) { ks.forEach(function (id) { x += pos[id].x; y += pos[id].y; }); x /= ks.length; y /= ks.length; }
      else { var a = -PI / 2 + i * 2.39996; x = 30 * Math.cos(a); y = 30 * Math.sin(a); }  // زاویهٔ طلایی: قطعی و پخش
      cp[c.id] = { x: x * 0.82, y: y * 0.82, r: 7 }; ids.push(c.id);
    });
    for (var it = 0; it < 40; it++) {
      ids.forEach(function (id, i) {
        var p = cp[id];
        Object.keys(pos).forEach(function (kid) { push(p, pos[kid], pos[kid].r + 14, 1); });
        for (var j = 0; j < ids.length; j++) if (j !== i) push(p, cp[ids[j]], 20, 0.5);
      });
    }
    function push(p, q, min, f) {
      var dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d >= min) return;
      if (d < 0.01) { dx = 1; dy = 0.5; d = Math.sqrt(1.25); }
      var m = (min - d) * f; p.x += dx / d * m; p.y += dy / d * m;
    }
    return cp;
  }

  /* ---------------- دادهٔ نمودارِ روند ----------------
     وضعیتِ هر گره در طولِ زمان از knot.hist (A.knotSetStatus). پیش از اولین ثبت = from ِ آن ثبت. گرهِ بی‌تاریخچه:
     وضعیتِ فعلی از روزِ ساخت فرض می‌شود (اگر «باز» نیست، تقریبی شمرده و اعلام می‌شود). اگر وضعیتِ فعلی با آخرین ثبت
     نخواند (کسی بی‌این تابع عوضش کرده)، در روزِ آخرین به‌روزرسانی اعمال و تقریبی شمرده می‌شود. */
  function dayOf(iso) {
    if (!iso) return A.today();
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
    var d = new Date(iso); if (isNaN(d)) return String(iso).slice(0, 10);
    return d.getFullYear() + "-" + A.pad(d.getMonth() + 1) + "-" + A.pad(d.getDate());
  }
  function timeline(k) {
    var hist = (Array.isArray(k.hist) ? k.hist : []).concat((Array.isArray(k.shist) ? k.shist : []).map(function (x) { return x && { at: x.at, status: x.to, from: x.from }; }))
      .filter(function (x) { return x && x.at && ST.indexOf(x.status) >= 0; })
      .slice().sort(function (a, b) { return String(a.at).localeCompare(String(b.at)); });
    var created = k.created || k.updated || new Date().toISOString(), pts = [], approx = false;
    if (!hist.length) { pts.push({ d: dayOf(created), s: kst(k) }); approx = kst(k) !== "open"; }
    else {
      var start = String(hist[0].at) < String(created) ? hist[0].at : created;
      pts.push({ d: dayOf(start), s: ST.indexOf(hist[0].from) >= 0 ? hist[0].from : "open" });
      hist.forEach(function (x) { pts.push({ d: dayOf(x.at), s: x.status }); });
      if (hist[hist.length - 1].status !== kst(k)) { pts.push({ d: dayOf(k.updated || new Date().toISOString()), s: kst(k) }); approx = true; }
    }
    return { pts: pts, approx: approx };
  }
  A.kmapTrend = function (knots) {
    knots = knots || allKnots();
    var tls = knots.map(timeline), days = {};
    tls.forEach(function (t) { t.pts.forEach(function (p) { days[p.d] = 1; }); });
    if (knots.length) days[A.today()] = 1;
    var D = Object.keys(days).sort(), rows = D.map(function (d) {
      var c = { d: d, open: 0, working: 0, practised: 0, returned: 0, total: 0 };
      tls.forEach(function (t) {
        var s = null; t.pts.forEach(function (p) { if (p.d <= d) s = p.s; });
        if (s) { c[s]++; c.total++; }
      });
      return c;
    });
    return { rows: rows, approx: tls.filter(function (t) { return t.approx; }).length };
  };

  /* ---------------- دادهٔ نمودارِ کالیبراسیون ----------------
     فقط از kitem.hist[{conf, ok}] (ورزش‌های گره؛ جدا از کالیبراسیونِ مشترک — §12.11). نمونهٔ «معیوب» (bad) بیرون است.
     conf درصد است (۰ تا ۱۰۰)؛ اگر همهٔ مقدارها ≤ ۱ باشند، کسری فرض و ×۱۰۰ می‌شوند. پاسخِ بی‌داوری (ok خالی) شمرده نمی‌شود.
     ده بازه: [۰،۱۰)، …، [۹۰،۱۰۰] (۱۰۰ در بازهٔ آخر). */
  A.kmapCalib = function () {
    var raw = [];
    S.all("kitem", function (it) { return !it.bad; }).forEach(function (it) {
      (Array.isArray(it.hist) ? it.hist : []).forEach(function (x) {
        if (!x || x.conf == null || x.conf === "" || x.ok == null || x.ok === "") return;
        var c = parseFloat(x.conf); if (isNaN(c)) return;
        raw.push({ c: c, ok: x.ok === true || x.ok === 1 || x.ok === "1" || x.ok === "true" });
      });
    });
    var frac = raw.length && raw.every(function (p) { return p.c <= 1; });
    var bins = []; for (var i = 0; i < 10; i++) bins.push({ i: i, lo: i * 10, hi: i * 10 + 10, n: 0, ok: 0, sum: 0 });
    raw.forEach(function (p) {
      var c = Math.max(0, Math.min(100, frac ? p.c * 100 : p.c)), b = bins[Math.min(9, Math.floor(c / 10))];
      b.n++; b.sum += c; if (p.ok) b.ok++;
    });
    bins.forEach(function (b) { b.conf = b.n ? b.sum / b.n : null; b.acc = b.n ? 100 * b.ok / b.n : null; });
    var n = raw.length, okN = raw.filter(function (p) { return p.ok; }).length;
    var meanC = n ? raw.reduce(function (s, p) { return s + Math.max(0, Math.min(100, frac ? p.c * 100 : p.c)); }, 0) / n : null;
    return { bins: bins, n: n, acc: n ? 100 * okN / n : null, conf: meanC, frac: !!frac };
  };

  /* ---------------- اجزای کوچک ---------------- */
  function chipSt(s) { return h("span", { class: "chip km-st km-st-" + s }, h("span", { class: "km-sw km-s-" + s, "aria-hidden": "true" }, STGLYPH[s] || ""), STFA[s]); }
  function fb(ok, txt) { return h("div", { class: "sim-fb " + (ok ? "ok" : "no"), role: "status" }, (ok ? "✓ " : "✗ ") + txt); }
  function info(txt) { return h("div", { class: "sim-fb ks-info", role: "status" }, txt); }
  function bdiNum(x) { return h("bdi", { dir: "ltr" }, fa(String(x).replace("-", "−"))); }
  function svgText(x, y, txt, attrs) {
    var a = { x: x, y: y, direction: "rtl" }; for (var k in (attrs || {})) a[k] = attrs[k];
    return svg("text", a, txt);
  }
  function trunc(s, n) { s = String(s || ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function tableToggle(label, mkTable) {
    var box = h("div", { class: "km-dt", hidden: true }), btn;
    btn = h("button", { type: "button", class: "btn ghost sm", "aria-expanded": "false", onclick: function () {
      var open = box.hidden; box.hidden = !open; btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "پنهان کردنِ جدولِ داده" : label;
      if (open && !box.firstChild) box.appendChild(mkTable());
    } }, label);
    return [btn, box];
  }

  /* ---------------- منو: «گره‌گشا» ---------------- */
  (function addNav() {
    var NAV = A.NAV; if (!Array.isArray(NAV)) return;
    var mine = [["kmap", "🗺️ نقشهٔ ذهن", "گره‌ها، پیوندهایشان و روندِ باز شدن؛ کالیبراسیونِ ورزش‌ها"],
      ["ksims", "🧪 شبیه‌سازهای گره", "کوزه‌های آب، ۲-۴-۶، نفرینِ دانش، حافظهٔ کاری، وضعیتِ پایانی، نردبانِ راهنمایی"]];
    var have = function (k) { return NAV.some(function (n) { return Array.isArray(n) && n[0] === k; }); };
    var gi = -1;
    NAV.forEach(function (n, i) { if (n && n.g && /گره/.test(n.g)) gi = i; });
    if (gi < 0) { NAV.push({ g: "گره‌گشا" }); gi = NAV.length - 1; }
    var at = gi + 1; while (at < NAV.length && Array.isArray(NAV[at])) at++;
    mine.forEach(function (m) { if (!have(m[0])) { NAV.splice(at, 0, m); at++; } });
  })();

  /* ======================= نمای نقشهٔ ذهن ======================= */
  var MAP = { z: 1, cx: null, cy: null, fam: "", st: { open: 1, working: 1, practised: 1, returned: 1 }, cases: false, sel: null };
  A.V.kmap = function () {
    var root = h("div", { class: "page km-page", dir: "rtl" });
    root.appendChild(A.head("گره‌گشا", "🗺️ نقشهٔ ذهن",
      "هر دایره یک گرهِ ذهنیِ تأییدشده است، در برشِ خانواده‌اش؛ رنگ = وضعیت، اندازه = تعدادِ موقعیت‌هایی که در آن دیده شده. خط‌ها: دو گره که در یک موقعیت با هم ریشه بوده‌اند، و پیوندهایی که خودت گذاشته‌ای."));
    var knots = allKnots(), cases = allCases();
    if (!knots.length) {
      root.appendChild(h("div", { class: "empty km-empty" },
        h("p", {}, "هنوز گره‌ای ثبت نشده، پس نقشه خالی است."),
        h("p", { class: "small" }, "نقشه از «گره‌گشا» پر می‌شود: یک «موقعیت» ثبت کن (جایی که گیر کردی، کاری کردی که نمی‌فهمی چرا، یا نتیجه‌ای گرفتی که نمی‌فهمی)، از تونل‌ها بگذر، و در قدمِ ۳ گرهِ ریشه را خودت تأیید کن. هر گرهِ تأییدشده این‌جا یک دایره می‌شود؛ گره‌هایی که در یک موقعیت با هم ریشه بوده‌اند به هم وصل می‌شوند."),
        h("div", { class: "row gap wrap", style: { justifyContent: "center" } },
          A.V.kcases ? h("button", { class: "btn", onclick: function () { A.go("kcases"); } }, "رفتن به «گره‌گشا»") : h("span", { class: "small muted" }, "(بخشِ ثبتِ موقعیت هنوز در این نسخه بارگذاری نشده.)"),
          h("button", { class: "btn ghost", onclick: function () { A.go("ksims"); } }, "🧪 شبیه‌سازهای گره"))));
      return root;
    }
    var byId = {}; knots.forEach(function (k) { byId[k.id] = k; });
    var nCases = {}, kcasesOf = {};
    knots.forEach(function (k) { var cs = casesOf(k, cases); kcasesOf[k.id] = cs; nCases[k.id] = cs.length; });
    if (MAP.sel && !byId[MAP.sel]) MAP.sel = null;

    /* ---- ابزار: پالایش، نمایشِ موقعیت‌ها، زوم ---- */
    var famSel = h("select", { "aria-label": "پالایش بر اساسِ خانواده", onchange: function (e) { MAP.fam = e.target.value; redraw(); } },
      h("option", { value: "" }, "همهٔ خانواده‌ها"),
      fams().map(function (f) { return h("option", { value: f.id, selected: MAP.fam === f.id }, f.fa); }));
    var stBtns = h("div", { class: "row gap wrap km-stf", role: "group", "aria-label": "پالایش بر اساسِ وضعیت" }, ST.map(function (s) {
      var b = h("button", { type: "button", class: "btn sm ghost km-stb", "data-st": s, "aria-pressed": MAP.st[s] ? "true" : "false", onclick: function () {
        MAP.st[s] = MAP.st[s] ? 0 : 1; b.setAttribute("aria-pressed", MAP.st[s] ? "true" : "false"); redraw();
      } }, h("span", { class: "km-sw km-s-" + s, "aria-hidden": "true" }, STGLYPH[s]), STFA[s]);
      return b;
    }));
    var caseBtn = h("button", { type: "button", class: "btn sm ghost", "aria-pressed": MAP.cases ? "true" : "false", onclick: function () {
      MAP.cases = !MAP.cases; caseBtn.setAttribute("aria-pressed", MAP.cases ? "true" : "false"); redraw();
    } }, "▫️ نمایشِ موقعیت‌ها");
    function zb(txt, label, fn) { return h("button", { type: "button", class: "btn sm ghost km-zb", "aria-label": label, title: label, onclick: fn }, txt); }
    var zoomBar = h("div", { class: "row gap wrap km-zoom", role: "group", "aria-label": "بزرگ‌نمایی و جابه‌جایی" },
      zb("+", "بزرگ‌نمایی", function () { zoom(1.3); }), zb("−", "کوچک‌نمایی", function () { zoom(1 / 1.3); }),
      zb("⟲", "اندازهٔ اصلی", function () { MAP.z = 1; MAP.cx = MAP.cy = null; applyView(); }),
      zb("→", "جابه‌جایی به راست", function () { pan(0.18, 0); }), zb("←", "جابه‌جایی به چپ", function () { pan(-0.18, 0); }),
      zb("↑", "جابه‌جایی به بالا", function () { pan(0, -0.18); }), zb("↓", "جابه‌جایی به پایین", function () { pan(0, 0.18); }));
    root.appendChild(h("div", { class: "card km-tools" },
      h("div", { class: "row gap wrap" }, h("label", { class: "small" }, "خانواده: ", famSel), caseBtn),
      stBtns, zoomBar));

    var holder = h("div", { class: "km-mapbox" }), drawer = h("aside", { class: "km-drawer card", hidden: true, role: "dialog", "aria-modal": "false", "aria-labelledby": "kmDrT" });
    var stage = h("div", { class: "km-stage" }, holder, drawer);
    var summary = h("p", { class: "small muted km-sum", "aria-live": "polite" });
    root.appendChild(stage);
    root.appendChild(h("div", { class: "row gap wrap small km-legend", "aria-label": "راهنمای نقشه" },
      ST.map(chipSt),
      h("span", { class: "km-lg" }, h("svg", { width: 28, height: 10, "aria-hidden": "true" }), "هم‌رخداد در یک موقعیت"),
      h("span", { class: "km-lg" }, "➝ «ریشهٔ … است» (تو تعیین کرده‌ای)"),
      h("span", { class: "km-lg" }, "┄ «مرتبط» (تو تعیین کرده‌ای)"),
      h("span", { class: "km-lg muted" }, "اندازهٔ دایره = تعدادِ موقعیت‌ها")));
    root.appendChild(summary);

    var svgEl = null, base = null, lay = null;
    function vis(k) { return (!MAP.fam || k.fam === MAP.fam) && !!MAP.st[kst(k)]; }
    function curView() {
      var w = base.w / MAP.z, hh = base.h / MAP.z;
      if (MAP.cx == null) { MAP.cx = base.x + base.w / 2; MAP.cy = base.y + base.h / 2; }
      MAP.cx = Math.max(base.x, Math.min(base.x + base.w, MAP.cx)); MAP.cy = Math.max(base.y, Math.min(base.y + base.h, MAP.cy));
      return { x: MAP.cx - w / 2, y: MAP.cy - hh / 2, w: w, h: hh };
    }
    function applyView() { if (!svgEl) return; var v = curView(); svgEl.setAttribute("viewBox", [v.x, v.y, v.w, v.h].map(function (n) { return Math.round(n * 10) / 10; }).join(" ")); }
    function zoom(f, px, py) {
      var old = curView(); MAP.z = Math.max(0.6, Math.min(6, MAP.z * f));
      if (px != null) { var nv = curView(); MAP.cx += (px - (old.x + old.w / 2)) * (1 - nv.w / old.w); MAP.cy += (py - (old.y + old.h / 2)) * (1 - nv.h / old.h); }
      applyView();
    }
    function pan(fx, fy) { var v = curView(); MAP.cx += v.w * fx; MAP.cy += v.h * fy; applyView(); }

    function redraw() {
      lay = A.kmapLayout(knots, function (k) { return nCases[k.id]; });
      base = lay.box;
      var pos = lay.pos, s = svg("svg", { class: "km-svg", role: "group", "aria-label": "نقشهٔ ذهن: " + fa(knots.length) + " گره", preserveAspectRatio: "xMidYMid meet" });
      svgEl = s;
      var defs = svg("defs", {});
      var mk = svg("marker", { id: "km-ar", viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" });
      mk.appendChild(svg("path", { d: "M0,0 L10,5 L0,10 z", class: "km-arh" })); defs.appendChild(mk); s.appendChild(defs);
      s.appendChild(svg("rect", { x: base.x, y: base.y, width: base.w, height: base.h, class: "km-bg" }));
      /* برش‌های خانواده‌ها: همیشه همه دیده می‌شوند (اصلِ ۲)، حتی خالی */
      var F = fams(), rIn = lay.R0 - STEP / 2, rOut = lay.maxR + STEP / 2;
      F.forEach(function (f, i) {
        var a0 = -PI / 2 + i * lay.sector, a1 = a0 + lay.sector, am = (a0 + a1) / 2;
        var p = "M" + xy(rIn, a0) + " L" + xy(rOut, a0) + " A" + rOut + "," + rOut + " 0 0,1 " + xy(rOut, a1) + " L" + xy(rIn, a1) + " A" + rIn + "," + rIn + " 0 0,0 " + xy(rIn, a0) + " Z";
        var dim = MAP.fam && MAP.fam !== f.id;
        s.appendChild(svg("path", { d: p, class: "km-sec" + (i % 2 ? " alt" : "") + (dim ? " dim" : ""), "data-fam": f.id }));
        var lr = rOut + 16, lx = lr * Math.cos(am), ly = lr * Math.sin(am) + 4, c = Math.cos(am);
        // direction=rtl ⇒ start = لبهٔ راستِ متن. سمتِ راستِ دایره متن رو به بیرون (به راست) ⇒ end؛ سمتِ چپ ⇒ start.
        var anchor = Math.abs(c) < 0.25 ? "middle" : c > 0 ? "end" : "start";
        var t = svgText(lx, ly, trunc(f.fa, 22), { class: "km-flab" + (dim ? " dim" : ""), "text-anchor": anchor });
        t.appendChild(svg("title", {}, f.id + " · " + f.fa)); s.appendChild(t);
      });
      function xy(r, a) { return (Math.round(r * Math.cos(a) * 10) / 10) + "," + (Math.round(r * Math.sin(a) * 10) / 10); }
      /* یال‌ها */
      var eg = svg("g", { class: "km-edges" }), co = {}, nCo = 0, nLk = 0;
      cases.forEach(function (c) {
        var ks = rootKnots(c).filter(function (id) { return byId[id]; });
        for (var i = 0; i < ks.length; i++) for (var j = i + 1; j < ks.length; j++) {
          var key = ks[i] < ks[j] ? ks[i] + "|" + ks[j] : ks[j] + "|" + ks[i];
          co[key] = (co[key] || 0) + 1;
        }
      });
      function curve(p, q, shrinkP, shrinkQ) {
        var mx = (p.x + q.x) / 2 * 0.72, my = (p.y + q.y) / 2 * 0.72;
        function towards(a, b, d) { var dx = b.x - a.x, dy = b.y - a.y, L = Math.sqrt(dx * dx + dy * dy) || 1; return { x: a.x + dx / L * d, y: a.y + dy / L * d }; }
        var c0 = { x: mx, y: my }, a = towards(p, c0, shrinkP || 0), b = towards(q, c0, shrinkQ || 0);
        return "M" + r1(a.x) + "," + r1(a.y) + " Q" + r1(mx) + "," + r1(my) + " " + r1(b.x) + "," + r1(b.y);
      }
      function r1(n) { return Math.round(n * 10) / 10; }
      Object.keys(co).sort().forEach(function (key) {
        var ab = key.split("|"), p = pos[ab[0]], q = pos[ab[1]]; if (!p || !q) return;
        var dim = !(vis(byId[ab[0]]) && vis(byId[ab[1]]));
        var e = svg("path", { d: curve(p, q), class: "km-e co" + (dim ? " dim" : ""), "stroke-width": 1.4 + 1.3 * (co[key] - 1), "data-a": ab[0], "data-b": ab[1], "data-w": co[key] });
        e.appendChild(svg("title", {}, kname(byId[ab[0]]) + " ↔ " + kname(byId[ab[1]]) + " — با هم در " + fa(co[key]) + " موقعیت"));
        eg.appendChild(e); nCo++;
      });
      knots.forEach(function (k) {
        (Array.isArray(k.links) ? k.links : []).forEach(function (l) {
          var to = byId[l && l.to], p = pos[k.id], q = to && pos[to.id]; if (!q || to.id === k.id) return;
          var root = l.rel === "root-of", dim = !(vis(k) && vis(to));
          var ea = { d: curve(p, q, p.r + 2, q.r + 4), class: "km-e " + (root ? "root" : "rel") + (dim ? " dim" : ""), "data-a": k.id, "data-b": to.id };
          if (root) ea["marker-end"] = "url(#km-ar)";
          var e = svg("path", ea);
          e.appendChild(svg("title", {}, root ? "«" + kname(k) + "» ریشهٔ «" + kname(to) + "» است" : "«" + kname(k) + "» مرتبط با «" + kname(to) + "»"));
          eg.appendChild(e); nLk++;
        });
      });
      s.appendChild(eg);
      /* موقعیت‌ها (اختیاری) */
      if (MAP.cases && cases.length) {
        var cp = placeCases(cases, pos), cg = svg("g", { class: "km-cases" });
        cases.forEach(function (c) {
          var p = cp[c.id];
          caseKnotRefs(c).forEach(function (id) { var q = pos[id]; if (q) cg.appendChild(svg("line", { x1: r1(p.x), y1: r1(p.y), x2: r1(q.x), y2: r1(q.y), class: "km-ce" })); });
        });
        cases.forEach(function (c) {
          var p = cp[c.id], title = c.title || "موقعیتِ بی‌عنوان";
          var g = svg("g", { class: "km-c", tabindex: "0", role: "button", "data-id": c.id, "aria-label": "موقعیت: " + title });
          g.appendChild(svg("rect", { x: r1(p.x - 7), y: r1(p.y - 7), width: 14, height: 14, rx: 3, class: "km-cbox" }));
          g.appendChild(svgText(r1(p.x), r1(p.y + 20), trunc(title, 14), { class: "km-clab", "text-anchor": "middle" }));
          g.appendChild(svg("title", {}, "موقعیت: " + title));
          function go() { if (A.V.kcase) A.go("kcase", c.id); else A.toast("نمای موقعیت در این نسخه در دسترس نیست"); }
          g.addEventListener("click", go);
          g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
          cg.appendChild(g);
        });
        s.appendChild(cg);
      }
      /* گره‌ها */
      var ng = svg("g", { class: "km-nodes" }), nVis = 0;
      knots.forEach(function (k) {
        var p = pos[k.id], st = kst(k), v = vis(k); if (v) nVis++;
        var lbl = "گره: " + kname(k) + " — وضعیت: " + STFA[st] + " — خانواده: " + famName(k.fam) + " — " + fa(nCases[k.id]) + " موقعیت";
        var ga = { class: "km-n km-s-" + st + (v ? "" : " dim") + (MAP.sel === k.id ? " sel" : ""), "data-id": k.id, "data-st": st, "data-fam": k.fam || "", "data-cases": nCases[k.id],
          tabindex: v ? "0" : "-1", role: "button", "aria-label": lbl };
        if (!v) ga["aria-hidden"] = "true";
        var g = svg("g", ga);
        g.appendChild(svg("circle", { cx: r1(p.x), cy: r1(p.y), r: r1(p.r + 5), class: "km-halo" }));
        g.appendChild(svg("circle", { cx: r1(p.x), cy: r1(p.y), r: r1(p.r), class: "km-dot" }));
        if (STGLYPH[st]) g.appendChild(svg("text", { x: r1(p.x), y: r1(p.y + 4.5), class: "km-gly", "text-anchor": "middle", "aria-hidden": "true" }, STGLYPH[st]));
        g.appendChild(svgText(r1(p.x), r1(p.y + p.r + 15), trunc(kname(k), 13), { class: "km-nlab", "text-anchor": "middle" }));
        g.appendChild(svg("title", {}, lbl));
        function pick() { if (!v) return; MAP.sel = k.id; openDrawer(k.id, true); markSel(); }
        g.addEventListener("click", pick);
        g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
        ng.appendChild(g);
      });
      s.appendChild(ng);
      /* زوم با چرخ و جابه‌جایی با کشیدن */
      s.addEventListener("wheel", function (e) {
        e.preventDefault();
        var rc = s.getBoundingClientRect(), v = curView(), px = v.x + (e.clientX - rc.left) / rc.width * v.w, py = v.y + (e.clientY - rc.top) / rc.height * v.h;
        zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, px, py);
      }, { passive: false });
      var drag = null;
      s.addEventListener("pointerdown", function (e) {
        if (e.target.closest && e.target.closest(".km-n,.km-c")) return;
        drag = { x: e.clientX, y: e.clientY, cx: MAP.cx, cy: MAP.cy, moved: false };
        try { s.setPointerCapture(e.pointerId); } catch (er) { }
      });
      s.addEventListener("pointermove", function (e) {
        if (!drag) return;
        var rc = s.getBoundingClientRect(), v = curView(), k = v.w / Math.max(1, rc.width);
        if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 3) drag.moved = true;
        MAP.cx = drag.cx - (e.clientX - drag.x) * k; MAP.cy = drag.cy - (e.clientY - drag.y) * k; applyView();
      });
      function endDrag() { drag = null; }
      s.addEventListener("pointerup", endDrag); s.addEventListener("pointercancel", endDrag);
      holder.innerHTML = ""; holder.appendChild(s); applyView();
      summary.textContent = fa(knots.length) + " گره (" + fa(nVis) + " پس از پالایش) · " + fa(cases.length) + " موقعیت · " + fa(nCo) + " یالِ هم‌رخداد · " + fa(nLk) + " پیوندِ تو";
      if (MAP.sel) openDrawer(MAP.sel, false);
    }
    function markSel() { holder.querySelectorAll(".km-n").forEach(function (g) { g.classList.toggle("sel", g.getAttribute("data-id") === MAP.sel); }); }
    function closeDrawer() {
      var id = MAP.sel; MAP.sel = null; drawer.hidden = true; stage.classList.remove("open"); markSel();
      var n = id && holder.querySelector('.km-n[data-id="' + id + '"]'); if (n) n.focus();
    }
    drawer.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.preventDefault(); closeDrawer(); } });

    function openDrawer(id, focus) {
      var k = byId[id]; if (!k) return;
      drawer.innerHTML = ""; drawer.hidden = false; stage.classList.add("open");
      var st = kst(k), m = mastery(k), cs = kcasesOf[id] || [], items = kitemsOf(id);
      var head = h("div", { class: "row between gap" }, h("h2", { id: "kmDrT", tabindex: "-1" }, kname(k)),
        h("button", { type: "button", class: "btn ghost sm", "aria-label": "بستنِ کشو", onclick: closeDrawer }, "✕"));
      drawer.appendChild(head);
      drawer.appendChild(h("div", { class: "row gap wrap" }, h("span", { class: "chip" }, famName(k.fam)), subName(k) ? h("span", { class: "chip" }, subName(k)) : null, chipSt(st)));
      /* دلیلِ وضعیت */
      var why;
      if (m) {
        var ms = ST.indexOf(m.status) >= 0 ? m.status : null;
        why = h("div", { class: "km-why small" }, h("b", {}, "دلیلِ وضعیت: "), whyText(m.why) || "—",
          ms && ms !== st ? h("div", { class: "muted" }, "وضعیتِ ثبت‌شده «" + STFA[st] + "» است؛ معیارِ ورزیدگی اکنون «" + STFA[ms] + "» می‌گوید.") : null);
      } else why = h("div", { class: "km-why small muted" }, "معیارِ ورزیدگی (بخشِ ورزش) در این نسخه بارگذاری نشده؛ وضعیتِ ثبت‌شده نشان داده می‌شود.");
      drawer.appendChild(why);
      /* کارتِ گره */
      var card = h("dl", { class: "km-card small" });
      [["principle", "ساختارِ عمیق"], ["signals", "نشانه‌های تشخیص"], ["counter", "حرکتِ مقابل"], ["example", "مثالِ خودت"]].forEach(function (f) {
        var v = k[f[0]]; if (Array.isArray(v)) v = v.filter(Boolean).join("؛ ");
        if (A.filled(v)) { card.appendChild(h("dt", {}, f[1])); card.appendChild(h("dd", {}, String(v))); }
      });
      drawer.appendChild(card.childNodes.length ? card : h("p", { class: "small muted" }, "کارتِ گره هنوز نوشته نشده (قدمِ ۴: نام، ساختارِ عمیق، نشانه‌ها، حرکتِ مقابل، مثال — به قلمِ خودت)."));
      /* موقعیت‌ها */
      drawer.appendChild(h("h3", {}, "موقعیت‌ها (" + fa(cs.length) + ")"));
      drawer.appendChild(cs.length ? h("ul", { class: "plain km-list" }, cs.map(function (c) {
        return h("li", {}, A.V.kcase ? h("button", { class: "linkish", onclick: function () { A.go("kcase", c.id); } }, c.title || "موقعیتِ بی‌عنوان") : h("span", {}, c.title || "موقعیتِ بی‌عنوان"),
          c.created ? h("span", { class: "muted" }, " · " + A.fdate(c.created)) : null);
      })) : h("p", { class: "small muted" }, "هنوز به موقعیتی وصل نیست."));
      /* پیوندها */
      drawer.appendChild(h("h3", {}, "پیوندها"));
      var lst = h("ul", { class: "plain km-list" });
      (Array.isArray(k.links) ? k.links : []).forEach(function (l, i) {
        var to = byId[l && l.to]; if (!to) return;
        lst.appendChild(h("li", { class: "row gap wrap" }, h("span", {}, l.rel === "root-of" ? "ریشهٔ ⟵ «" + kname(to) + "»" : "مرتبط با «" + kname(to) + "»"),
          h("button", { type: "button", class: "btn ghost sm", "aria-label": "برداشتنِ پیوند با " + kname(to), onclick: function () {
            k.links.splice(i, 1); S.put(k); A.toast("پیوند برداشته شد"); redraw(); focusDrawer();
          } }, "برداشتن")));
      });
      knots.forEach(function (o) {
        if (o.id === k.id) return;
        (Array.isArray(o.links) ? o.links : []).forEach(function (l) {
          if (!l || l.to !== k.id) return;
          lst.appendChild(h("li", { class: "muted" }, l.rel === "root-of" ? "«" + kname(o) + "» ریشهٔ این گره است" : "«" + kname(o) + "» این را مرتبط دانسته"));
        });
      });
      drawer.appendChild(lst.childNodes.length ? lst : h("p", { class: "small muted" }, "پیوندی ثبت نشده."));
      /* افزودنِ پیوند */
      var others = knots.filter(function (o) { return o.id !== k.id; });
      if (others.length) {
        var tSel = h("select", { "aria-label": "گرهِ مقصد" }, others.map(function (o) { return h("option", { value: o.id }, kname(o) + " — " + famName(o.fam)); }));
        var rSel = h("select", { "aria-label": "نوعِ پیوند" }, h("option", { value: "root-of" }, "این گره ریشهٔ آن است"), h("option", { value: "related" }, "مرتبط‌اند"));
        var msg = h("div", { "aria-live": "polite" });
        drawer.appendChild(h("div", { class: "col gap km-addlink" }, h("b", { class: "small" }, "پیوندِ تازه"), rSel, tSel,
          h("button", { type: "button", class: "btn sm", onclick: function () {
            var to = tSel.value, rel = rSel.value, o = byId[to]; msg.innerHTML = "";
            if (!o || to === k.id) return;
            var ls = Array.isArray(k.links) ? k.links : [];
            if (ls.some(function (l) { return l && l.to === to && l.rel === rel; })) { msg.appendChild(fb(false, "این پیوند از قبل هست.")); return; }
            if (rel === "root-of" && (o.links || []).some(function (l) { return l && l.to === k.id && l.rel === "root-of"; })) {
              msg.appendChild(fb(false, "«" + kname(o) + "» را قبلاً ریشهٔ همین گره گذاشته‌ای؛ هر دو جهت با هم ممکن نیست. اول آن یکی را بردار.")); return;
            }
            ls.push({ to: to, rel: rel }); k.links = ls; S.put(k);
            A.toast("پیوند ثبت شد"); redraw(); focusDrawer();
          } }, "پیوند بده"), msg));
      }
      /* شبیه‌سازهای مرتبط */
      var sims = A.knotSimFor(k.fam);
      if (sims.length) drawer.appendChild(h("div", { class: "row gap wrap small" }, h("span", { class: "muted" }, "شبیه‌سازِ مرتبط:"),
        sims.map(function (key) { return h("button", { type: "button", class: "linkish", onclick: function () { A.go("ksims", key); } }, A.KSIM[key].title); })));
      /* کارها */
      drawer.appendChild(h("div", { class: "row gap wrap km-acts" },
        h("button", { type: "button", class: "btn", disabled: A.V.knot ? null : true, title: A.V.knot ? null : "صفحهٔ گره در این نسخه در دسترس نیست", onclick: function () { A.go("knot", k.id); } }, "باز کن"),
        A.V.kpractice ? h("button", { type: "button", class: "btn ghost", onclick: function () { A.go("kpractice", k.id); } }, "ورزش" + (items.length ? " (" + fa(items.length) + " نمونه)" : "")) : null,
        h("button", { type: "button", class: "btn ghost", onclick: closeDrawer }, "بستن")));
      if (focus) focusDrawer();
    }
    function focusDrawer() { var t = drawer.querySelector("#kmDrT"); if (t) try { t.focus({ preventScroll: false }); } catch (e) { t.focus(); } }

    redraw();
    root.appendChild(trendCard(knots));
    root.appendChild(calibCard());
    root.appendChild(h("p", { class: "small muted" }, "نقشه «ترتیبِ بررسی» نیست و حکم هم نیست: گره‌ها فرضیه‌هایی‌اند که خودت تأیید کرده‌ای. «ورزیده‌شده» یعنی معیارِ ورزش برآورده شده، نه این‌که گره دیگر برنمی‌گردد — آزمونِ واقعی موقعیتِ واقعیِ بعدی است."));
    return root;
  };

  /* ---------------- نمودارِ روند ---------------- */
  function trendCard(knots) {
    var T = A.kmapTrend(knots), rows = T.rows, card = h("section", { class: "card km-chart km-trend", "aria-labelledby": "kmTrT" });
    card.appendChild(h("h2", { id: "kmTrT" }, "روندِ وضعیتِ گره‌ها"));
    if (!rows.length) { card.appendChild(h("p", { class: "small muted" }, "هنوز داده‌ای نیست.")); return card; }
    var W = 640, H = 240, L = 40, R = 16, Tp = 14, B = 34, last = rows[rows.length - 1];
    var maxY = Math.max(1, Math.max.apply(null, rows.map(function (r) { return Math.max(r.open, r.working, r.practised, r.returned); })));
    var d0 = rows[0].d, span = Math.max(1, A.daysBetween(d0, last.d));
    function X(d) { return L + (W - L - R) * A.daysBetween(d0, d) / span; }
    function Y(v) { return Tp + (H - Tp - B) * (1 - v / maxY); }
    var desc = "تعدادِ گره‌ها در هر وضعیت از " + A.fdate(d0) + " تا " + A.fdate(last.d) + "؛ اکنون: " + ST.map(function (s) { return STFA[s] + " " + fa(last[s]); }).join("، ");
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, class: "km-csvg", role: "img", "aria-label": desc });
    var step = Math.max(1, Math.ceil(maxY / 5));
    for (var v = 0; v <= maxY; v += step) {
      s.appendChild(svg("line", { x1: L, x2: W - R, y1: Y(v), y2: Y(v), class: "km-grid" }));
      s.appendChild(svg("text", { x: L - 6, y: Y(v) + 4, class: "km-ax", "text-anchor": "end" }, fa(v)));
    }
    // محورِ زمان مثلِ بقیهٔ نمودارهای برنامه از چپ به راست است. متن با direction=rtl: start = لبهٔ راستِ متن، end = لبهٔ چپ.
    s.appendChild(svgText(W - R, H - 8, A.fdate(last.d), { class: "km-ax", "text-anchor": "start" }));
    if (rows.length > 1) s.appendChild(svgText(L, H - 8, A.fdate(d0), { class: "km-ax", "text-anchor": "end" }));
    ST.forEach(function (st) {
      var d = "";
      rows.forEach(function (r, i) {
        var x = X(r.d), y = Y(r[st]);
        d += i === 0 ? "M" + x + "," + y : " H" + x + " V" + y;
      });
      d += " H" + (W - R);
      s.appendChild(svg("path", { d: d, class: "km-line km-l-" + st, "data-st": st }));
      rows.forEach(function (r) { s.appendChild(svg("circle", { cx: X(r.d), cy: Y(r[st]), r: 2.6, class: "km-pt km-s-" + st })); });
    });
    card.appendChild(s);
    card.appendChild(h("div", { class: "row gap wrap small" }, ST.map(chipSt)));
    if (T.approx) card.appendChild(h("p", { class: "small muted" }, "برای " + fa(T.approx) + " گره تاریخچهٔ کاملِ وضعیت ثبت نشده؛ وضعیتِ فعلی‌شان از روزِ ساخت (یا آخرین به‌روزرسانی) فرض شده — آن بخش از نمودار تقریبی است."));
    var tt = tableToggle("نمایشِ جدولِ داده", function () {
      return h("div", { class: "scrollx" }, h("table", { class: "dt km-trtab" },
        h("thead", {}, h("tr", {}, h("th", {}, "روز"), ST.map(function (s) { return h("th", {}, STFA[s]); }), h("th", {}, "همه"))),
        h("tbody", {}, rows.map(function (r) { return h("tr", { "data-d": r.d }, h("td", {}, A.fdate(r.d)), ST.map(function (s) { return h("td", { "data-st": s }, fa(r[s])); }), h("td", {}, fa(r.total))); }))));
    });
    card.appendChild(h("div", { class: "row gap" }, tt[0])); card.appendChild(tt[1]);
    return card;
  }

  /* ---------------- نمودارِ کالیبراسیون ---------------- */
  function calibCard() {
    var C = A.kmapCalib(), card = h("section", { class: "card km-chart km-calib", "aria-labelledby": "kmCaT" });
    card.appendChild(h("h2", { id: "kmCaT" }, "کالیبراسیونِ ورزش‌های گره"));
    card.appendChild(h("p", { class: "small muted" }, "اطمینانی که پیش از هر پاسخ در ورزشِ گره دادی، در برابرِ درصدِ پاسخ‌های درست — در ده بازهٔ ۱۰ درصدی. این نمودار جدا از کالیبراسیونِ مشترکِ برنامه است (دامنهٔ دیگری است) و نمونه‌های «معیوب» در آن نیستند."));
    if (!C.n) { card.appendChild(h("p", { class: "small muted km-cempty" }, "هنوز پاسخی با درصدِ اطمینان در ورزش‌های گره ثبت نشده.")); return card; }
    var W = 420, H = 320, L = 44, R = 14, Tp = 14, B = 44, w = W - L - R, hh = H - Tp - B;
    function X(c) { return L + w * c / 100; } function Y(a) { return Tp + hh * (1 - a / 100); }
    var desc = "کالیبراسیون: " + fa(C.n) + " پاسخ؛ میانگینِ اطمینان " + fa(Math.round(C.conf)) + "٪، درستی " + fa(Math.round(C.acc)) + "٪";
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, class: "km-csvg km-calsvg", role: "img", "aria-label": desc });
    for (var t = 0; t <= 100; t += 20) {
      s.appendChild(svg("line", { x1: X(t), x2: X(t), y1: Tp, y2: Tp + hh, class: "km-grid" }));
      s.appendChild(svg("line", { x1: L, x2: L + w, y1: Y(t), y2: Y(t), class: "km-grid" }));
      s.appendChild(svg("text", { x: X(t), y: Tp + hh + 14, class: "km-ax", "text-anchor": "middle" }, fa(t)));
      s.appendChild(svg("text", { x: L - 6, y: Y(t) + 4, class: "km-ax", "text-anchor": "end" }, fa(t)));
    }
    s.appendChild(svg("line", { x1: X(0), y1: Y(0), x2: X(100), y2: Y(100), class: "km-diag" }));
    s.appendChild(svgText(L + w / 2, H - 6, "اطمینان (٪)", { class: "km-ax", "text-anchor": "middle" }));
    s.appendChild(svgText(12, Tp + hh / 2, "درستی (٪)", { class: "km-ax", "text-anchor": "middle", transform: "rotate(-90 12 " + (Tp + hh / 2) + ")" }));
    C.bins.forEach(function (b) {
      if (!b.n) return;
      var x = X(b.conf), y = Y(b.acc), r = 4 + Math.min(10, 2 * Math.sqrt(b.n));
      var g = svg("g", { class: "km-cb" + (b.n < 5 ? " few" : ""), "data-bin": b.i, "data-n": b.n, "data-ok": b.ok });
      g.appendChild(svg("circle", { cx: x, cy: y, r: r, class: "km-cdot" }));
      g.appendChild(svg("text", { x: x, y: y - r - 3, class: "km-cn", "text-anchor": "middle" }, fa(b.n)));
      g.appendChild(svg("title", {}, "بازهٔ " + fa(b.lo) + "–" + fa(b.hi) + "٪: " + fa(b.n) + " پاسخ، " + fa(b.ok) + " درست (" + fa(Math.round(b.acc)) + "٪)"));
      s.appendChild(g);
    });
    card.appendChild(s);
    card.appendChild(h("p", { class: "small" }, fa(C.n) + " پاسخ · میانگینِ اطمینان " + fa(Math.round(C.conf)) + "٪ · درستی " + fa(Math.round(C.acc)) + "٪. نقطه زیرِ قطر = اطمینانِ بیش از درستی؛ بالای قطر = کم‌اطمینانی. عددِ بالای هر نقطه تعدادِ پاسخ‌های آن بازه است؛ نقطه‌های کم‌رنگ کمتر از ۵ پاسخ دارند و نباید جدی گرفته شوند."));
    if (C.frac) card.appendChild(h("p", { class: "small muted" }, "اطمینان‌ها به‌صورتِ کسر (۰ تا ۱) ثبت شده بودند و به درصد تبدیل شدند."));
    var tt = tableToggle("نمایشِ جدولِ داده", function () {
      return h("div", { class: "scrollx" }, h("table", { class: "dt km-catab" },
        h("thead", {}, h("tr", {}, h("th", {}, "بازهٔ اطمینان"), h("th", {}, "تعداد"), h("th", {}, "درست"), h("th", {}, "میانگینِ اطمینان"), h("th", {}, "درستی"))),
        h("tbody", {}, C.bins.map(function (b) {
          return h("tr", { "data-bin": b.i }, h("td", {}, fa(b.lo) + "–" + fa(b.hi) + "٪"), h("td", { class: "n" }, fa(b.n)), h("td", {}, fa(b.ok)),
            h("td", {}, b.n ? fa(Math.round(b.conf)) + "٪" : "—"), h("td", {}, b.n ? fa(Math.round(b.acc)) + "٪" : "—"));
        }))));
    });
    card.appendChild(h("div", { class: "row gap" }, tt[0])); card.appendChild(tt[1]);
    return card;
  }

  /* ======================= شبیه‌سازها ======================= */
  var KSIM = A.KSIM = A.KSIM || {};
  function reg(key, o) { if (!KSIM[key]) KSIM[key] = o; }
  A.knotSimFor = function (fam) {
    if (fam && typeof fam === "object") fam = fam.fam;
    return Object.keys(KSIM).filter(function (k) { return (KSIM[k].fams || []).indexOf(fam) >= 0; });
  };
  function choice(q, opts, onRight) {
    var done = false, wrap = h("div", { class: "col gap sim-q" }, h("p", { class: "small" }, h("b", {}, q)));
    A.shuffle(opts.slice()).forEach(function (o) {
      var b = h("button", { type: "button", class: "btn ghost crs-whyopt", onclick: function () {
        if (done) return;
        if (o[1]) { done = true; wrap.querySelectorAll("button").forEach(function (x) { x.disabled = true; }); b.classList.add("sim-right"); b.parentNode.insertBefore(fb(true, o[2]), b.nextSibling); if (onRight) onRight(); }
        else { b.classList.add("bad"); b.disabled = true; b.parentNode.insertBefore(fb(false, o[2]), b.nextSibling); }
      } }, o[0]);
      wrap.appendChild(b);
    });
    return wrap;
  }
  function ms(def) { return typeof A.KSIM_MS === "number" ? A.KSIM_MS : def; }
  function toNum(s) { return String(s == null ? "" : s).replace(/[۰-۹]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); }).replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).replace(/[−–]/g, "-").replace("٫", ".").trim(); }

  /* ---------- ۱. کوزه‌های آب (Luchins 1942) ---------- */
  reg("jars", {
    title: "کوزه‌های آب: آیا راهِ آشنا راهِ کوتاه‌تر را می‌پوشاند؟",
    fams: ["F3"],
    note: "نمایشی، به شیوهٔ آزمایشِ Luchins (1942) دربارهٔ «اثرِ آمادگیِ ذهنی» (Einstellung). مدلِ ساده‌شده: «ریختن» یعنی یک بار پرکردنِ آن کوزه و خالی‌کردنش در مخزن؛ «برداشتن» یعنی پرکردنِ آن کوزه از مخزن و دور ریختنش. هر راهی که دقیقاً به هدف برسد پذیرفته است؛ شبیه‌ساز فقط ثبت می‌کند کدام راه را رفتی. این یک اجرا روی یک نفر است: شاهدی دربارهٔ همین لحظه، نه تشخیص.",
    draw: function () {
      var P = [
        { a: 21, b: 127, c: 3, g: 100, k: "set" }, { a: 14, b: 163, c: 25, g: 99, k: "set" }, { a: 18, b: 43, c: 10, g: 5, k: "set" },
        { a: 9, b: 42, c: 6, g: 21, k: "set" }, { a: 20, b: 59, c: 4, g: 31, k: "set" },
        { a: 23, b: 49, c: 3, g: 20, k: "crit" }, { a: 15, b: 39, c: 3, g: 18, k: "crit" },
        { a: 28, b: 76, c: 3, g: 25, k: "ext" }, { a: 18, b: 48, c: 4, g: 22, k: "post" }];
      var KFA = { set: "تمرینی", crit: "بحرانی", ext: "خاموشی", post: "پس از آن" };
      var JN = { a: "الف", b: "ب", c: "ج" };
      var PATHFA = { long: "راهِ بلند (ب − الف − ۲×ج)", short: "راهِ کوتاه (الف ± ج)", other: "راهِ دیگر", skip: "پیدا نکردی (رد شدی)" };
      var box = h("div", { class: "col gap ks-jars" }), stage = h("div", { class: "col gap" }), res = [], idx = 0, ops = [], tries = 0, longTry = false;
      box.appendChild(h("p", { class: "small" }, "سه کوزه با گنجایشِ معلوم داری و یک مخزنِ خالی. باید دقیقاً به مقدارِ هدف برسی. نمونهٔ حل‌شده: الف = ۲۹، ب = ۳، هدف ۲۰ ⇐ الف را بریز، بعد سه بار با ب بردار: ",
        h("bdi", { dir: "ltr" }, "۲۹ − ۳ − ۳ − ۳ = ۲۰"), "."));
      box.appendChild(stage);
      function sig(list) {
        var n = { a: 0, b: 0, c: 0 }; list.forEach(function (o) { n[o.j] += o.s; });
        if (list.length === 4 && n.b === 1 && n.a === -1 && n.c === -2) return "long";
        if (list.length === 2 && n.b === 0 && Math.abs(n.a) === 1 && Math.abs(n.c) === 1 && n.a === 1) return "short";
        return "other";
      }
      function total() { var p = P[idx]; return ops.reduce(function (t, o) { return t + o.s * p[o.j]; }, 0); }
      function show() {
        stage.innerHTML = "";
        if (idx >= P.length) return summary();
        var p = P[idx], t = total();
        stage.appendChild(h("div", { class: "row gap wrap small" }, h("span", { class: "chip" }, "مسئلهٔ " + fa(idx + 1) + " از " + fa(P.length)), h("span", { class: "chip ks-kind", "data-kind": p.k }, KFA[p.k])));
        stage.appendChild(jarsSvg(p, t));
        stage.appendChild(h("p", {}, "هدف: دقیقاً ", h("b", {}, fa(p.g)), " لیتر · مخزنِ فعلی: ", h("b", { class: "ks-tot" }, fa(t)), " لیتر"));
        stage.appendChild(h("div", { class: "row gap wrap ks-ops", "aria-label": "گام‌های تو" }, ops.length ? ops.map(function (o) { return h("span", { class: "chip" }, (o.s > 0 ? "ریختنِ " : "برداشتنِ ") + JN[o.j]); }) : h("span", { class: "small muted" }, "هنوز گامی نزده‌ای.")));
        var msg = h("div", { "aria-live": "polite" });
        stage.appendChild(h("div", { class: "row gap wrap" }, ["a", "b", "c"].map(function (j) {
          return [h("button", { type: "button", class: "btn sm", "data-op": "+" + j, onclick: function () { ops.push({ j: j, s: 1 }); show(); } }, "ریختنِ " + JN[j] + " (" + fa(p[j]) + ")"),
            h("button", { type: "button", class: "btn sm ghost", "data-op": "-" + j, onclick: function () {
              if (total() < p[j]) { msg.innerHTML = ""; msg.appendChild(fb(false, "مخزن کمتر از " + fa(p[j]) + " لیتر دارد؛ نمی‌شود کوزهٔ " + JN[j] + " را از آن پر کرد.")); return; }
              ops.push({ j: j, s: -1 }); show();
            } }, "برداشتنِ " + JN[j])];
        })));
        stage.appendChild(h("div", { class: "row gap wrap" },
          h("button", { type: "button", class: "btn", "data-act": "done", onclick: function () {
            msg.innerHTML = "";
            if (total() !== p.g) {
              tries++; if (sig(ops) === "long") longTry = true;
              msg.appendChild(fb(false, sig(ops) === "long" && p.k === "ext" ? "این همان راهِ همیشگی است و این‌جا به " + fa(total()) + " می‌رسد، نه " + fa(p.g) + ". دوباره به سه کوزه نگاه کن." : "مخزن " + fa(total()) + " لیتر است، نه " + fa(p.g) + ". «از نو» بزن و دوباره امتحان کن."));
              return;
            }
            res.push({ p: p, path: sig(ops), tries: tries, longTry: longTry }); idx++; ops = []; tries = 0; longTry = false; show();
          } }, "رسیدم"),
          h("button", { type: "button", class: "btn ghost", onclick: function () { ops = []; show(); } }, "از نو"),
          p.k === "ext" ? h("button", { type: "button", class: "btn ghost", "data-act": "skip", onclick: function () { res.push({ p: p, path: "skip", tries: tries, longTry: longTry }); idx++; ops = []; tries = 0; longTry = false; show(); } }, "پیدا نکردم؛ رد شو") : null));
        stage.appendChild(msg);
      }
      function jarsSvg(p, t) {
        var W = 360, H = 120, s = svg("svg", { viewBox: "0 0 " + W + " " + H, class: "ks-jsvg", role: "img", "aria-label": "کوزهٔ الف " + fa(p.a) + "، ب " + fa(p.b) + "، ج " + fa(p.c) + " لیتر؛ مخزن " + fa(t) + " لیتر از هدفِ " + fa(p.g) });
        var mx = Math.max(p.a, p.b, p.c, p.g, t, 1);
        [["a", 300], ["b", 230], ["c", 160]].forEach(function (q) {
          var hh = 12 + 80 * p[q[0]] / mx;
          s.appendChild(svg("rect", { x: q[1] - 18, y: 98 - hh, width: 36, height: hh, rx: 5, class: "ks-jar" }));
          s.appendChild(svgText(q[1], 114, JN[q[0]] + " " + fa(p[q[0]]), { class: "km-ax", "text-anchor": "middle" }));
        });
        var th = 80 * Math.min(t, mx) / mx, gy = 98 - 80 * p.g / mx;
        s.appendChild(svg("rect", { x: 40, y: 18, width: 60, height: 80, class: "ks-tank" }));
        s.appendChild(svg("rect", { x: 40, y: 98 - th, width: 60, height: th, class: "ks-water" }));
        s.appendChild(svg("line", { x1: 34, x2: 106, y1: gy, y2: gy, class: "ks-goal" }));
        s.appendChild(svgText(70, 114, "مخزن", { class: "km-ax", "text-anchor": "middle" }));
        return s;
      }
      function summary() {
        var crit = res.filter(function (r) { return r.p.k === "crit"; }), ext = res.filter(function (r) { return r.p.k === "ext"; })[0], post = res.filter(function (r) { return r.p.k === "post"; })[0];
        var nLong = crit.filter(function (r) { return r.path === "long"; }).length;
        stage.appendChild(h("div", { class: "scrollx" }, h("table", { class: "dt ks-jtab" },
          h("thead", {}, h("tr", {}, h("th", {}, "مسئله"), h("th", {}, "نوع"), h("th", {}, "راهی که رفتی"))),
          h("tbody", {}, res.map(function (r, i) { return h("tr", { "data-kind": r.p.k, "data-path": r.path }, h("td", {}, fa(i + 1)), h("td", {}, KFA[r.p.k]), h("td", {}, PATHFA[r.path])); })))));
        stage.appendChild(fb(nLong === 0, nLong === 2 ? "روی هر دو مسئلهٔ بحرانی راهِ بلند را رفتی، با این‌که راهِ دوگامی هم بود: راهی که پنج بار جواب داده بود، راهِ ساده‌تر را از دید پنهان کرد — همان «اثرِ آمادگیِ ذهنی»."
          : nLong === 1 ? "روی یکی از دو مسئلهٔ بحرانی راهِ بلند را رفتی و روی دیگری راهِ کوتاه را دیدی: آمادگیِ ذهنی بود، ولی شکست." : "روی مسئله‌های بحرانی راهِ کوتاه را دیدی؛ این بار راهِ آشنا راهِ ساده‌تر را نپوشاند."));
        if (ext) stage.appendChild(fb(ext.path !== "skip" && !ext.longTry, ext.path === "skip" ? "در مسئلهٔ خاموشی (جایی که راهِ همیشگی دیگر کار نمی‌کند) راه را پیدا نکردی. راهِ دوگامی: الف − ج = ۲۸ − ۳ = ۲۵. گیرکردن در این‌جا همان چیزی است که اثرِ آمادگی پیش‌بینی می‌کند."
          : ext.longTry ? "در مسئلهٔ خاموشی اول راهِ همیشگی را امتحان کردی و بعد راهِ دیگر را یافتی (" + fa(ext.tries) + " تلاشِ ناموفق)." : "در مسئلهٔ خاموشی مستقیم به راهِ تازه رسیدی."));
        if (post) stage.appendChild(info("مسئلهٔ آخر (پس از خاموشی) را با «" + PATHFA[post.path] + "» حل کردی."));
        stage.appendChild(h("p", { class: "small muted" }, "در تونلِ «راهبرد و گیرکردن» (F3) همین را روی موقعیتِ خودت بپرس: «چند راهِ متفاوت امتحان کردی؟ نامشان را بنویس.» و «اگر از آخر شروع می‌کردی؟»"));
        stage.appendChild(h("button", { type: "button", class: "btn ghost sm", onclick: function () { res = []; idx = 0; ops = []; tries = 0; longTry = false; show(); } }, "از اول"));
      }
      show();
      return box;
    }
  });

  /* ---------- ۲. قاعدهٔ ۲-۴-۶ (Wason 1960؛ Klayman & Ha 1987) ---------- */
  var W246_MIN = 4, W246_NEG = 1;
  reg("w246", {
    title: "قاعدهٔ ۲-۴-۶: پیش از اعلام، آزمونی بده که انتظار داری رد شود",
    fams: ["F4", "F11"],
    note: "نمایشی، به شیوهٔ Wason (1960). قاعدهٔ پنهان ثابت است و شبیه‌ساز فقط می‌گوید هر سه‌تایی با آن «می‌خواند» یا «نمی‌خواند». پیش از اعلامِ قاعده باید دست‌کم " + fa(W246_MIN) + " سه‌تایی آزموده باشی و دست‌کم " + fa(W246_NEG) + " تا از آن‌ها سه‌تایی‌ای باشد که خودت انتظار داشتی نخواند (آزمونِ ابطالی). Klayman و Ha (1987) نشان دادند آزمودنِ نمونه‌هایی که انتظار داری بخوانند همیشه خطا نیست؛ وقتی گمراه می‌کند که فرضیهٔ تو تنگ‌تر از قاعدهٔ واقعی است — دقیقاً همین‌جا.",
    draw: function () {
      function fits(t) { return t[0] < t[1] && t[1] < t[2]; }
      var tests = [], box = h("div", { class: "col gap ks-246" });
      box.appendChild(h("p", { class: "small" }, "من قاعده‌ای دربارهٔ سه‌تایی‌های عدد در ذهن دارم. ", h("b", {}, "۲، ۴، ۶"), " با آن می‌خواند. سه‌تایی پیشنهاد کن، پیش از دیدنِ جواب بگو انتظار داری بخواند یا نه، و وقتی مطمئن شدی قاعده را اعلام کن."));
      var ins = [0, 1, 2].map(function (i) { return h("input", { type: "text", inputmode: "decimal", dir: "ltr", class: "ks-num", "aria-label": "عددِ " + ["اول", "دوم", "سوم"][i], size: 5 }); });
      var pred = null, pYes, pNo;
      function setPred(v) { pred = v; pYes.setAttribute("aria-pressed", v === true ? "true" : "false"); pNo.setAttribute("aria-pressed", v === false ? "true" : "false"); }
      pYes = h("button", { type: "button", class: "btn sm ghost ks-pred", "data-pred": "yes", "aria-pressed": "false", onclick: function () { setPred(true); } }, "انتظار دارم بخواند");
      pNo = h("button", { type: "button", class: "btn sm ghost ks-pred", "data-pred": "no", "aria-pressed": "false", onclick: function () { setPred(false); } }, "انتظار دارم نخواند");
      var msg = h("div", { "aria-live": "polite" }), log = h("ol", { class: "sim-list small ks-log" }), stat = h("p", { class: "small ks-stat" }), ann = h("div", { class: "col gap" });
      function upd() {
        var neg = tests.filter(function (t) { return t.pred === false; }).length, surprise = tests.filter(function (t) { return t.pred !== t.fit; }).length;
        stat.textContent = "آزمون‌ها: " + fa(tests.length) + " · آزمون‌هایی که انتظار داشتی نخواند: " + fa(neg) + " · نتیجه‌های غافل‌گیرکننده: " + fa(surprise);
      }
      box.appendChild(h("div", { class: "row gap wrap ks-in" }, ins[0], ins[1], ins[2]));
      box.appendChild(h("div", { class: "row gap wrap" }, pYes, pNo,
        h("button", { type: "button", class: "btn", "data-act": "test", onclick: function () {
          msg.innerHTML = "";
          var t = ins.map(function (x) { return parseFloat(toNum(x.value)); });
          if (t.some(function (x) { return isNaN(x); })) { msg.appendChild(fb(false, "هر سه خانه را با عدد پر کن.")); return; }
          if (pred === null) { msg.appendChild(fb(false, "اول بگو انتظار داری بخواند یا نه — پیش‌بینیِ ثبت‌شده همان چیزی است که آزمون را آزمون می‌کند.")); return; }
          var f = fits(t); tests.push({ t: t, pred: pred, fit: f });
          log.appendChild(h("li", { "data-fit": f ? "1" : "0", "data-pred": pred ? "1" : "0" },
            t.map(bdiNum).reduce(function (a, b, i) { if (i) a.push("، "); a.push(b); return a; }, []),
            " — پیش‌بینی: " + (pred ? "می‌خواند" : "نمی‌خواند") + " — ", h("b", {}, f ? "با قاعده می‌خواند" : "با قاعده نمی‌خواند"),
            pred === f ? " (مطابقِ انتظار)" : " (غافل‌گیری!)"));
          ins.forEach(function (x) { x.value = ""; }); setPred(null); upd();
        } }, "بیازما")));
      box.appendChild(msg); box.appendChild(stat); box.appendChild(log);
      box.appendChild(h("button", { type: "button", class: "btn ghost", "data-act": "announce", onclick: function () {
        ann.innerHTML = "";
        var neg = tests.filter(function (t) { return t.pred === false; }).length, need = [];
        if (tests.length < W246_MIN) need.push("دست‌کم " + fa(W246_MIN) + " سه‌تایی بیازما (تا حالا " + fa(tests.length) + ")");
        if (neg < W246_NEG) need.push("دست‌کم یک سه‌تایی بیازما که خودت انتظار داری با قاعده نخواند — آزمونی که می‌تواند فرضیه‌ات را باطل کند");
        if (need.length) { ann.appendChild(fb(false, "هنوز نه: " + need.join("؛ و ") + ".")); return; }
        var negFail = tests.filter(function (t) { return !t.fit; }).length;
        ann.appendChild(choice("قاعده کدام است؟", [
          ["سه عددِ زوج که هر کدام ۲ تا از قبلی بیشتر است", false, "نه: مثلاً ۱، ۵، ۹۰ هم با قاعده می‌خواند."],
          ["عددِ سوم جمعِ دو عددِ اول است", false, "نه: مثلاً ۱، ۲، ۱۰ هم می‌خواند، و ۵، ۳، ۸ (۵ + ۳ = ۸) نمی‌خواند."],
          ["هر سه عدد مثبت‌اند", false, "نه: مثلاً ۳، ۲، ۱ نمی‌خواند، و −۵، −۲، ۰ می‌خواند."],
          ["هر عدد بزرگ‌تر از عددِ قبلی است (صعودی)", true, "درست. قاعده فقط «صعودی» بود؛ ۲، ۴، ۶ یک نمونهٔ خیلی خاص از آن است."]
        ], function () {
          ann.appendChild(info("تو " + fa(tests.length) + " آزمون دادی؛ " + fa(neg) + " تا را انتظار داشتی نخواند و " + fa(negFail) + " تا واقعاً نخواند. فقط سه‌تایی‌هایی که «نمی‌خوانند» مرزِ قاعده را نشان می‌دهند؛ اگر فرضیه‌ات «زوج با فاصلهٔ ۲» بود، هر نمونه‌ای که برای تأییدش می‌ساختی با قاعدهٔ واقعی هم می‌خواند و هیچ‌وقت خطایت را نشان نمی‌داد."));
          ann.appendChild(h("p", { class: "small muted" }, "در تونلِ «پایش و فراشناخت» (F4) و «برداشت و نتیجه‌گیری» (F11) همین را روی ادعای خودت بپرس: «چه مشاهده‌ای این برداشت را باطل می‌کند؟»"));
        }));
      } }, "قاعده را اعلام کن"));
      box.appendChild(ann); upd();
      return box;
    }
  });

  /* ---------- ۳. نفرینِ دانش (Newton 1990) ---------- */
  reg("curse", {
    title: "نفرینِ دانش: آهنگ در ذهنِ توست، ضربه‌ها در گوشِ او",
    fams: ["F8"],
    note: "نمایشی. Newton (1990، رسالهٔ دکتریِ منتشرنشده): ضربه‌زن‌ها ریتمِ آهنگ‌های آشنا را روی میز می‌زدند و پیش‌بینی کردند حدودِ ۵۰٪ شنونده‌ها آهنگ را حدس بزنند؛ شنونده‌ها حدودِ ۲٫۵٪ درست حدس زدند. پژوهشی منتشرنشده است، نه قانون؛ اندازهٔ دقیقِ شکاف در موقعیت‌های دیگر معلوم نیست. ریتمی که این‌جا می‌زنی ذخیره نمی‌شود.",
    draw: function () {
      var box = h("div", { class: "col gap ks-curse" }), taps = [], stage = h("div", { class: "col gap" }), predV = null;
      box.appendChild(h("p", { class: "small" }, "۱) یک آهنگِ خیلی آشنا (مثلاً «تولدت مبارک») را در ذهن انتخاب کن و در ذهن بخوانش. ۲) با دکمهٔ «ضرب» ریتمش را بزن — فقط ضربه‌ها، بی‌صدا و بی‌کلمه."));
      var tl = h("div", { class: "ks-tl" }), cnt = h("span", { class: "small ks-cnt" }, "۰ ضربه");
      function drawTaps() {
        tl.innerHTML = "";
        var W = 360, H = 40, s = svg("svg", { viewBox: "0 0 " + W + " " + H, class: "ks-tsvg", role: "img", "aria-label": fa(taps.length) + " ضربه — همهٔ چیزی که شنونده می‌گیرد" });
        s.appendChild(svg("line", { x1: 8, x2: W - 8, y1: H / 2, y2: H / 2, class: "km-grid" }));
        if (taps.length) {
          var t0 = taps[0], span = Math.max(1, taps[taps.length - 1] - t0);
          // محورِ زمان مثلِ بقیهٔ نمودارهای برنامه از چپ به راست
          taps.forEach(function (t) { s.appendChild(svg("circle", { cx: 8 + (W - 16) * (t - t0) / span, cy: H / 2, r: 5, class: "ks-tap" })); });
        }
        tl.appendChild(s); cnt.textContent = fa(taps.length) + " ضربه";
      }
      var tapBtn = h("button", { type: "button", class: "btn ks-tapbtn", "aria-label": "ضرب", onclick: function () { taps.push(Date.now()); drawTaps(); } }, "ضرب");
      box.appendChild(h("div", { class: "row gap wrap" }, tapBtn, cnt, h("button", { type: "button", class: "btn ghost sm", onclick: function () { taps = []; drawTaps(); } }, "پاک کن")));
      box.appendChild(tl);
      box.appendChild(h("p", { class: "small muted" }, "این خط همهٔ چیزی است که یک شنونده از آهنگِ تو می‌گیرد: چند نقطه در زمان. ملودی، کلمه‌ها و حالِ آهنگ فقط در ذهنِ خودت است."));
      var inp = h("input", { type: "range", min: 0, max: 100, step: 1, value: 50, "aria-label": "پیش‌بینیِ تو: از هر ۱۰۰ شنونده چند نفر", class: "ks-range", oninput: function () { out.textContent = fa(inp.value) + "٪"; } });
      var out = h("output", { class: "ks-out" }, "۵۰٪"), msg = h("div", { "aria-live": "polite" });
      box.appendChild(h("p", { class: "small" }, "۳) اگر همین ضربه‌ها را برای ۱۰۰ نفر بزنی، فکر می‌کنی چند درصد آهنگ را درست حدس می‌زنند؟"));
      box.appendChild(h("div", { class: "row gap wrap" }, inp, out, h("button", { type: "button", class: "btn", "data-act": "reveal", onclick: function () {
        msg.innerHTML = "";
        if (taps.length < 4) { msg.appendChild(fb(false, "اول دست‌کم چند ضربه (۴ یا بیشتر) از ریتمِ آهنگ را بزن.")); return; }
        predV = +inp.value; reveal();
      } }, "پیش‌بینی‌ام را ثبت کن")));
      box.appendChild(msg); box.appendChild(stage);
      function reveal() {
        stage.innerHTML = "";
        stage.appendChild(h("div", { class: "ks-bars", role: "img", "aria-label": "پیش‌بینیِ تو " + fa(predV) + "٪، پیش‌بینیِ ضربه‌زن‌ها در پژوهش حدودِ ۵۰٪، حدسِ درستِ شنونده‌ها حدودِ ۲٫۵٪" },
          bar("پیش‌بینیِ تو", predV, fa(predV) + "٪", "me"), bar("ضربه‌زن‌ها پیش‌بینی کردند (Newton 1990)", 50, "حدودِ ۵۰٪", "tap"), bar("شنونده‌ها درست حدس زدند (Newton 1990)", 2.5, "حدودِ ۲٫۵٪", "lis")));
        var near = Math.abs(predV - 50) < Math.abs(predV - 2.5);
        stage.appendChild(fb(!near, near ? "پیش‌بینی‌ات به پیش‌بینیِ ضربه‌زن‌های آن پژوهش نزدیک‌تر است تا به نتیجهٔ شنونده‌ها: وقتی آهنگ را در ذهن می‌شنوی، تصورِ این‌که دیگری فقط ضربه‌ها را می‌شنود سخت است."
          : "پیش‌بینی‌ات به نتیجهٔ شنونده‌ها نزدیک‌تر است. شاید چون پیش از پیش‌بینی نامِ پدیده را در عنوانِ همین شبیه‌ساز دیده بودی — دانستنِ نامِ سوگیری لزوماً در موقعیتِ واقعی از آن محافظت نمی‌کند."));
        stage.appendChild(h("p", { class: "small" }, "سازوکار: آنچه تو می‌دانی (آهنگ) به‌طورِ خودکار در تجربه‌ات از پیام (ضربه‌ها) حاضر است و نمی‌توانی نادیده‌اش بگیری؛ برای همین وضوحِ پیامت را از جای خودت می‌سنجی، نه از جای شنونده. در موقعیتِ کاری هم «بیشتر دانستن» می‌تواند پیامی بسازد که برای تو روشن و برای مدیر فقط چند ضربه است."));
        stage.appendChild(h("p", { class: "small muted" }, "آزمونِ واقعیِ خودت: پیامت را به کسی بده و بخواه با کلماتِ خودش بازگو کند — نه این‌که بپرسی «فهمیدی؟». در تونلِ «اجتماعی و ارتباطی» (F8): «پیامت را در یک جمله و از زاویهٔ هدفِ مخاطب بنویس.»"));
      }
      function bar(lab, v, txt, cls) {
        return h("div", { class: "ks-bar" }, h("span", { class: "small" }, lab), h("div", { class: "ks-track" }, h("div", { class: "ks-fill " + cls, style: { width: Math.max(1, v) + "%" } })), h("b", { class: "small" }, txt));
      }
      drawTaps();
      return box;
    }
  });

  /* ---------- ۴. حافظهٔ کاری و بیرون‌ریزی ---------- */
  reg("wm", {
    title: "حافظهٔ کاری و بیرون‌ریزی: یک بار در ذهن، یک بار با کاغذ",
    fams: ["F5"],
    note: "نمایشی. ظرفیتِ حافظهٔ کاری محدود است (Sweller 1988؛ Cowan 2001) و نوشتنِ اقلام روی کاغذ نگه‌داشتنشان را از دوشِ ذهن برمی‌دارد (تکنیکِ ۳۷). دو عددی که می‌بینی فقط مالِ خودِ توست، از یک اجرا؛ با هیچ نرمی مقایسه نمی‌شود و چیزی دربارهٔ «ظرفیتِ» تو نمی‌گوید. هیچ‌چیز ذخیره نمی‌شود.",
    draw: function () {
      var box = h("div", { class: "col gap ks-wm" }), len = 7, scores = { head: null, paper: null };
      var lenSel = h("select", { "aria-label": "طولِ رشته", onchange: function () { len = +lenSel.value; } }, [5, 7, 9].map(function (n) { return h("option", { value: n, selected: n === 7 }, fa(n) + " رقم"); }));
      box.appendChild(h("p", { class: "small" }, "رقم‌ها یکی‌یکی نشان داده می‌شوند. پس از آخرین رقم، اول یک جمعِ کوچک را جواب بده (کارِ هم‌زمان، مثلِ وقتی وسطِ حلِ مسئله چیزی را نگه می‌داری)، بعد رقم‌ها را به ترتیب بنویس."));
      box.appendChild(h("label", { class: "small" }, "طول: ", lenSel));
      var rounds = h("div", { class: "col gap" }), result = h("div", { "aria-live": "polite" });
      box.appendChild(rounds); box.appendChild(result);
      ["head", "paper"].forEach(function (mode) { rounds.appendChild(round(mode)); });
      function round(mode) {
        var card = h("div", { class: "ks-round", "data-mode": mode });
        card.appendChild(h("h4", {}, mode === "head" ? "دورِ ۱: فقط در ذهن" : "دورِ ۲: با کاغذ (هرچه خواستی بنویس)"));
        var disp = h("div", { class: "ks-disp", "aria-live": "off", "aria-label": "نمایشِ رقم" }, "—"), body = h("div", { class: "col gap" });
        var pad = mode === "paper" ? h("textarea", { rows: 2, class: "ks-pad", "aria-label": "کاغذِ تو", placeholder: "کاغذِ تو: هرچه می‌خواهی این‌جا بنویس" }) : null;
        var start = h("button", { type: "button", class: "btn sm", "data-act": "start", onclick: run }, "شروع");
        card.appendChild(h("div", { class: "row gap wrap" }, start, disp)); if (pad) card.appendChild(pad); card.appendChild(body);
        function run() {
          start.disabled = true; body.innerHTML = ""; if (pad) pad.value = "";
          var seq = []; for (var i = 0; i < len; i++) seq.push(Math.floor(Math.random() * 10));
          var i2 = 0, step = ms(1000);
          (function tick() {
            if (!card.isConnected) return;
            if (i2 >= seq.length) { disp.textContent = "…"; return askSum(seq); }
            disp.textContent = fa(seq[i2]); i2++;
            setTimeout(function () { if (!card.isConnected) return; disp.textContent = " "; setTimeout(tick, Math.round(step * 0.25)); }, step);
          })();
        }
        function askSum(seq) {
          var x = 3 + Math.floor(Math.random() * 6), y = 3 + Math.floor(Math.random() * 6), si = h("input", { type: "text", inputmode: "numeric", dir: "ltr", class: "ks-num ks-sum", "aria-label": "پاسخِ جمع", size: 4 });
          body.appendChild(h("div", { class: "row gap wrap" }, h("span", {}, "اول این: ", h("bdi", { dir: "ltr" }, fa(x) + " + " + fa(y)), " = "), si,
            h("button", { type: "button", class: "btn sm", "data-act": "sum", onclick: function () { this.disabled = true; si.disabled = true; askRecall(seq, parseInt(toNum(si.value), 10) === x + y); } }, "بعدی")));
          try { si.focus(); } catch (e) { }
        }
        function askRecall(seq, sumOk) {
          var ri = h("input", { type: "text", inputmode: "numeric", dir: "ltr", class: "ks-recall", "aria-label": "رقم‌ها به ترتیب", size: 12 });
          body.appendChild(h("div", { class: "row gap wrap" }, h("span", {}, "حالا رقم‌ها را به ترتیب بنویس: "), ri,
            h("button", { type: "button", class: "btn sm", "data-act": "recall", onclick: function () {
              this.disabled = true; ri.disabled = true;
              var got = toNum(ri.value).replace(/\D/g, "").split(""), sc = 0;
              seq.forEach(function (d, i) { if (+got[i] === d && got[i] != null) sc++; });
              scores[mode] = sc; card.setAttribute("data-score", sc);
              body.appendChild(info("درست در جای خود: " + fa(sc) + " از " + fa(seq.length) + " · رشته: " + fa(seq.join("")) + " · جمع: " + (sumOk ? "درست" : "نادرست")));
              start.disabled = false; start.textContent = "دوباره";
              compare();
            } }, "ثبت")));
          try { ri.focus(); } catch (e) { }
        }
        return card;
      }
      function compare() {
        result.innerHTML = "";
        if (scores.head == null || scores.paper == null) return;
        var a = scores.head, b = scores.paper;
        result.appendChild(h("p", { class: "ks-two" }, "امتیازِ خودت — در ذهن: ", h("b", { "data-k": "head" }, fa(a)), " · با کاغذ: ", h("b", { "data-k": "paper" }, fa(b))));
        result.appendChild(fb(b >= a, b > a ? "با کاغذ بهتر بود: نوشتن، نگه‌داشتن را از دوشِ حافظهٔ کاری برداشت تا جا برای کارِ هم‌زمان بماند. اگر در موقعیتِ واقعی «چند چیز را هم‌زمان در ذهن» داشتی، این یک سرنخ برای F5 است — نه تشخیص."
          : b === a ? "این بار فرقی نکرد. شاید این طول برایت هنوز بار نبود؛ طولِ بیشتری انتخاب کن و دوباره هر دو دور را بزن." : "این بار در ذهن بهتر بود. یک اجرا شاهدِ ضعیفی است (رقم‌ها تصادفی‌اند و دورِ دوم پس از اولی است)؛ اگر می‌خواهی، دوباره امتحان کن."));
      }
      return box;
    }
  });

  /* ---------- ۵. راحتیِ وضعیتِ پایانی (Rosenbaum et al. 1990) ---------- */
  reg("endstate", {
    title: "راحتیِ وضعیتِ پایانی: دست برای پایانِ حرکت برنامه‌ریزی می‌کند",
    fams: ["F6"],
    note: "نمودارِ توضیحیِ نمایشی، نه داده. اثرِ «راحتیِ وضعیتِ پایانی» نامِ یافته‌ای است که در کارِ Rosenbaum و همکاران (1990) گزارش شد: هنگامِ گرفتنِ یک شیء برای کارِ بعدی، افراد اغلب گرفتنِ اولیهٔ ناراحت‌تری را برمی‌گزینند تا وضعیتِ پایانیِ دست راحت باشد.",
    draw: function () {
      var box = h("div", { class: "col gap ks-end" }), plan = "end";
      var PL = { start: ["برنامهٔ الف: شروعِ راحت", "شست رو به بالا ⇐ پس از چرخاندنِ میله، شست رو به پایین", "راحت", "ناراحت"],
        end: ["برنامهٔ ب: پایانِ راحت", "شست رو به پایین (ناراحت) ⇐ پس از چرخاندن، شست رو به بالا", "ناراحت", "راحت"] };
      box.appendChild(h("p", { class: "small" }, "کار: میلهٔ افقی را بردار و سرِ رنگی‌اش را عمودی روی هدف بگذار — حرکت میله را ۹۰ درجه می‌چرخاند. دو برنامه ممکن است:"));
      var pick = h("div", { class: "row gap wrap", role: "group", "aria-label": "برنامه" }), fig = h("div", { class: "ks-fig" }), cap = h("p", { class: "small ks-cap", "aria-live": "polite" });
      ["start", "end"].forEach(function (k) {
        pick.appendChild(h("button", { type: "button", class: "btn sm ghost", "data-plan": k, "aria-pressed": k === plan ? "true" : "false", onclick: function () {
          plan = k; pick.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-plan") === k ? "true" : "false"); }); drawFig();
        } }, PL[k][0]));
      });
      function hand(s, x, y, up, comfy) {
        // دستِ نمادین: کفِ گرد + نقطهٔ شست؛ رنگ = راحت/ناراحت
        s.appendChild(svg("rect", { x: x - 16, y: y - 12, width: 32, height: 24, rx: 10, class: "ks-hand " + (comfy ? "ok" : "no") }));
        s.appendChild(svg("circle", { cx: x - 10, cy: up ? y - 15 : y + 15, r: 5, class: "ks-thumb" }));
      }
      function drawFig() {
        var W = 420, H = 170, s = svg("svg", { viewBox: "0 0 " + W + " " + H, class: "ks-esvg", role: "img", "aria-label": PL[plan][0] + ": " + PL[plan][1] });
        var p = PL[plan], upStart = plan === "start";
        // شروع (راست): میلهٔ افقی
        s.appendChild(svg("rect", { x: 250, y: 74, width: 140, height: 10, rx: 4, class: "ks-bar0" }));
        s.appendChild(svg("rect", { x: 250, y: 74, width: 24, height: 10, rx: 4, class: "ks-barend" }));
        hand(s, 320, 79, upStart, plan === "start");
        s.appendChild(svgText(320, 140, "شروع: " + p[2], { class: "km-ax", "text-anchor": "middle" }));
        // پیکانِ چرخش
        s.appendChild(svg("path", { d: "M235,60 Q200,30 165,60", class: "ks-arrow", "marker-end": "url(#ks-ar)" }));
        var defs = svg("defs", {}), mk = svg("marker", { id: "ks-ar", viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" });
        mk.appendChild(svg("path", { d: "M0,0 L10,5 L0,10 z", class: "km-arh" })); defs.appendChild(mk); s.insertBefore(defs, s.firstChild);
        // پایان (چپ): میلهٔ عمودی روی هدف
        s.appendChild(svg("rect", { x: 60, y: 128, width: 60, height: 6, class: "ks-target" }));
        s.appendChild(svg("rect", { x: 85, y: 18, width: 10, height: 110, rx: 4, class: "ks-bar0" }));
        s.appendChild(svg("rect", { x: 85, y: 104, width: 10, height: 24, rx: 4, class: "ks-barend" }));
        hand(s, 90, 62, !upStart, plan === "end");
        s.appendChild(svgText(90, 158, "پایان: " + p[3], { class: "km-ax", "text-anchor": "middle" }));
        fig.innerHTML = ""; fig.appendChild(s);
        cap.textContent = p[1] + ".";
      }
      box.appendChild(pick); box.appendChild(fig); box.appendChild(cap);
      box.appendChild(h("div", { class: "row gap wrap small" }, h("span", { class: "chip ks-ok" }, "سبز = وضعیتِ راحت"), h("span", { class: "chip ks-no" }, "قرمز = وضعیتِ ناراحت"), h("span", { class: "chip" }, "نقطه = شست")));
      box.appendChild(choice("طبقِ این اثر، برنامه‌ریزیِ حرکت بیشتر به راحتیِ کدام لحظه حساس است؟", [
        ["لحظهٔ پایان، وقتی کارِ بعدی با شیء انجام می‌شود", true, "درست: گرفتن طوری انتخاب می‌شود که پایانِ حرکت راحت باشد، حتی به بهای شروعِ ناراحت (برنامهٔ ب)."],
        ["لحظهٔ شروع، وقتی شیء را برمی‌داری", false, "اگر چنین بود، همیشه برنامهٔ الف انتخاب می‌شد؛ یافته خلافِ این است."],
        ["هیچ‌کدام؛ گرفتن تصادفی است", false, "یافتهٔ این پژوهش‌ها دقیقاً یک الگوی نظام‌مند بود، نه تصادف."]
      ]));
      box.appendChild(h("div", { class: "ks-caveat", role: "note" }, h("b", {}, "هشدار — قیاسِ حدسی: "),
        "این اثر دربارهٔ گرفتنِ یک شیء برای کارِ بعدی است. به‌کار بردنش برای مثالِ «کفِ دست یا ناخن» (چطور به ناخن‌هایت نگاه می‌کنی) فقط یک قیاسِ حدسی است، نه شاهد؛ نگاه‌کردن به ناخن کارِ بعدی با یک شیء نیست. هر دو روشِ نگاه‌کردن متداول‌اند و «ساده‌تر» بودنِ یکی فرض است نه واقعیت. خودِ «آزمونِ ناخن» عامیانه است ⇐ اول قدمِ ۰ (آیا اصلاً گره است؟) و خانوادهٔ «برداشت و نتیجه‌گیری» (F11)."));
      drawFig();
      return box;
    }
  });

  /* ---------- ۶. نردبانِ راهنمایی ---------- */
  reg("ladder", {
    title: "نردبانِ راهنمایی: هر پله چه چیزی را (ضعیف) نشان می‌دهد",
    fams: ["F1", "F2", "F3", "F5"],
    note: "نمودارِ توضیحیِ نمایشی، بر پایهٔ «ارزیابیِ پویا» (Vygotsky/Feuerstein؛ Campione & Brown 1987): پله‌ای که در آن قفل باز می‌شود خودش شاهد است — ولی شاهدِ ضعیف (+۱)، چون هر پله پس از زمان و راهنمایی‌های پله‌های قبلی می‌آید. وزن‌ها همان وزن‌های ثابتِ طرحِ گره‌گشا هستند، نه برآورد.",
    draw: function () {
      var L = [
        ["۰", "۲ تا ۵ دقیقهٔ دیگر بی‌راهنمایی", null, "پلهٔ کنترل: اگر همین‌جا باز شد، فقط زمانِ بیشتری لازم بود؛ برای هیچ خانواده‌ای امتیاز نمی‌دهد."],
        ["۱", "صورت را دوباره و کلمه‌به‌کلمه بخوان", "F2", "+۱ (ضعیف) برای «بازنماییِ مسئله» — زیرنوعِ خواندن."],
        ["۲", "هدف و همهٔ قیدها را بازگو کن؛ کدام را خودت فرض کردی؟", "F2", "+۱ (ضعیف) برای «بازنماییِ مسئله» — زیرنوعِ بازنمایی/قیدِ خودساخته."],
        ["۳", "روی کاغذ رسم یا جدول کن", "F5", "+۱ (ضعیف) برای «ظرفیت و حالتِ ذهنی» — بارِ حافظهٔ کاری."],
        ["۴", "راهنماییِ راهبرد (از آخر، حالتِ خاص، قرینه)", "F3", "+۱ (ضعیف) برای «راهبرد و گیرکردن»."],
        ["۵", "نامِ مفهومِ کلیدی", "F1", "+۱ (ضعیف) برای «دانش و مفهوم»."],
        ["۶", "گامِ کلیدی", null, "پلهٔ ۶ تشخیصی نیست: گامِ کلیدی را دیدی، پس حل‌شدن دیگر چیزی دربارهٔ ریشه نمی‌گوید؛ امتیازی نمی‌دهد."]];
      var box = h("div", { class: "col gap ks-ladder" }), sel = null, out = h("div", { "aria-live": "polite" });
      box.appendChild(h("p", { class: "small" }, "فرض کن روی یک مسئله گیر کرده‌ای و پله‌به‌پله راهنمایی می‌گیری؛ پس از هر پله دوباره تلاش می‌کنی. روی پله‌ای بزن که در آن «باز شد»:"));
      var list = h("ol", { class: "ks-rungs", start: 0 });
      L.forEach(function (r, i) {
        list.appendChild(h("li", { class: "ks-rung", "data-step": i },
          h("button", { type: "button", class: "btn ghost sm ks-rb", "aria-pressed": "false", onclick: function () { sel = i; mark(); } },
            h("b", {}, "پلهٔ " + r[0] + ": "), r[1], r[2] ? h("span", { class: "chip" }, famName(r[2])) : h("span", { class: "chip" }, i === 0 ? "کنترل" : "تشخیصی نیست"))));
      });
      box.appendChild(list);
      box.appendChild(h("button", { type: "button", class: "btn ghost sm", "data-act": "none", onclick: function () { sel = -1; mark(); } }, "هیچ پله‌ای باز نکرد"));
      box.appendChild(out);
      function mark() {
        list.querySelectorAll(".ks-rung").forEach(function (li, i) {
          li.classList.toggle("tried", sel >= 0 && i < sel); li.classList.toggle("on", i === sel);
          li.querySelector("button").setAttribute("aria-pressed", i === sel ? "true" : "false");
        });
        out.innerHTML = "";
        if (sel === -1) { out.appendChild(info("هیچ پله‌ای باز نکرد: نردبان این‌جا چیزی دربارهٔ ریشه نمی‌گوید. سراغِ آزمون‌های تمایزدهندهٔ خانواده‌ها برو.")); return; }
        var r = L[sel];
        out.appendChild(r[2] ? fb(true, "شاهدِ ثبت‌شده: " + r[3]) : info(r[3]));
        if (sel > 0) out.appendChild(h("p", { class: "small muted" }, "چرا فقط ضعیف؟ پیش از پلهٔ " + r[0] + "، پله‌های " + fa(0) + " تا " + fa(sel - 1) + " را هم گذرانده بودی: زمانِ بیشتر و راهنمایی‌های قبلی هم در باز شدن سهم دارند و از سهمِ همین پله جدا نمی‌شوند."));
      }
      /* مقایسه روی هم‌ریخت‌ها */
      var CT = {
        F2: ["بازنمایی داده‌شده", "بی‌بازنمایی", "بازنماییِ مسئله"],
        F1: ["نامِ مفهوم گفته‌شده", "بی‌نامِ مفهوم", "دانش و مفهوم"],
        F5: ["بی‌زمان و بی‌بارِ اضافه", "زمان‌دار یا با بارِ اضافه", "ظرفیت و حالتِ ذهنی"] };
      var cbox = h("div", { class: "col gap ks-contrast" }), cf = "F2", res = { a: null, b: null }, cout = h("div", { "aria-live": "polite" });
      var csel = h("select", { "aria-label": "کدام مقایسه", onchange: function () { cf = csel.value; res = { a: null, b: null }; cdraw(); } },
        Object.keys(CT).map(function (k) { return h("option", { value: k }, CT[k][2] + ": " + CT[k][0] + " / " + CT[k][1]); }));
      box.appendChild(h("h4", {}, "چرا مقایسه روی هم‌ریخت‌ها قوی‌تر است"));
      box.appendChild(h("p", { class: "small" }, "دو مسئلهٔ «هم‌ریخت» (همان ساختار، ظاهرِ نو) را در دو حالت حل می‌کنی که فقط در یک چیز فرق دارند. چون بقیه ثابت مانده، فرقِ عملکرد را می‌شود به همان یک چیز نسبت داد — برای همین وزنش ±۳ است، در برابرِ +۱ ِ نردبان."));
      box.appendChild(h("label", { class: "small" }, "مقایسه: ", csel)); box.appendChild(cbox);
      function cdraw() {
        cbox.innerHTML = ""; cout.innerHTML = "";
        ["a", "b"].forEach(function (s, i) {
          cbox.appendChild(h("div", { class: "row gap wrap", "data-side": s }, h("span", { class: "small" }, "هم‌ریخت " + (i ? "۲" : "۱") + " — " + CT[cf][i] + ":"),
            ["حل شد", "حل نشد"].map(function (t, j) {
              return h("button", { type: "button", class: "btn sm ghost", "aria-pressed": res[s] === (j === 0) ? "true" : "false", onclick: function () { res[s] = j === 0; cdraw(); } }, t);
            })));
        });
        cbox.appendChild(cout);
        if (res.a == null || res.b == null) return;
        var fam = CT[cf][2];
        if (res.a && !res.b) cout.appendChild(fb(true, "+۳ برای «" + fam + "»: فقط وقتی «" + CT[cf][0] + "» بود حل شد — همان یک فرق کارساز بود."));
        else if (res.a === res.b) cout.appendChild(fb(false, "−۳ برای «" + fam + "»: " + (res.a ? "هر دو حل شد؛ پس «" + CT[cf][1] + "» مانع نبود." : "هر دو حل نشد؛ پس «" + CT[cf][0] + "» گره را باز نکرد.") + " ریشه احتمالاً جای دیگری است."));
        else cout.appendChild(info("نتیجهٔ وارونه (با کمک حل نشد، بی‌کمک حل شد): امتیازی نمی‌دهد؛ احتمالاً اثرِ ترتیب یا دشواریِ نابرابرِ دو هم‌ریخت است — جایشان را عوض کن و دوباره بیازما."));
        cout.appendChild(h("p", { class: "small muted" }, "نکته: هم‌ریختِ دوم از تمرینِ اولی سود می‌برد؛ ترتیبِ دو حالت را عوض کن یا هر کدام را روزِ جدا بیازما."));
      }
      cdraw();
      return box;
    }
  });

  /* ---------------- نمای شبیه‌سازها ---------------- */
  A.V.ksims = function (key) {
    var root = h("div", { class: "page ks-page", dir: "rtl" }), keys = Object.keys(KSIM);
    if (key && !KSIM[key]) key = null;
    root.appendChild(A.head("گره‌گشا", "🧪 شبیه‌سازهای گره", "هر شبیه‌ساز یک سازوکارِ شناخته‌شده را با یک تمرینِ کوتاه نشان می‌دهد. همه «نمایشی»اند: نتیجه‌شان شاهدی کوچک دربارهٔ همان لحظه است، نه تشخیص؛ و هیچ‌چیز از آن‌ها ذخیره نمی‌شود."));
    root.appendChild(h("nav", { class: "row gap wrap ks-index", "aria-label": "شبیه‌سازها" },
      key ? h("button", { type: "button", class: "btn ghost sm", onclick: function () { A.go("ksims"); } }, "همهٔ شبیه‌سازها") : null,
      keys.map(function (k) { return h("button", { type: "button", class: "btn sm " + (k === key ? "" : "ghost"), "aria-current": k === key ? "true" : null, onclick: function () { A.go("ksims", k); } }, KSIM[k].title.split(":")[0]); })));
    (key ? [key] : keys).forEach(function (k) {
      var o = KSIM[k], body;
      try { body = o.draw(); } catch (e) { console.error(e); body = h("p", { class: "small muted" }, "این شبیه‌ساز نمایش داده نشد: " + e.message); }
      root.appendChild(h("section", { class: "card ks-sim", id: "ksim-" + k, "data-ksim": k },
        h("div", { class: "row gap wrap" }, h("span", { class: "eyebrow" }, "شبیه‌سازِ گره"), h("span", { class: "chip ks-demo" }, "نمایشی"),
          (o.fams || []).map(function (f) { return h("span", { class: "chip", title: f }, famName(f)); })),
        h("h2", {}, o.title), body, h("p", { class: "small muted" }, o.note)));
    });
    return root;
  };
})(APP);
