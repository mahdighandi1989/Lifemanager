/* ===== پایه: ابزارها، ذخیره‌سازی، هوش مصنوعی، مرور فاصله‌دار، آمار ===== */
var APP = window.APP = {};
(function (A) {
  var C = window.CORE;
  var T = (window.T || []).slice().sort(function (a, b) { return a.id - b.id; });
  /* نام‌های فارسی به جای کدهای داخلی در متن‌ها */
  C.PNAME = { P1: "۵ خط دلتا", P2: "قرائت روز", P3: "برگه سفید ۱-۳-۷", P4: "برگه سفید هفتگی", P5: "تولید بازی کارآگاهی", P6: "شناسنامه علم", P7: "حل سه‌مسیره", P8: "استخراج عصاره دوره", P9: "ممیزی ماهانه", P10: "صف منابع", P11: "بیان دیگر" };
  function deCode(v) {
    if (typeof v === "string") { if (/^(P|c|t|S|R|L)\d+$/.test(v) || v.length < 5) return v; return v.replace(/\bP(\d{1,2})\b/g, function (m) { return C.PNAME[m] ? "«" + C.PNAME[m] + "»" : m; }).replace(/\bdocx\b/g, "سند Word").replace(/\bpptx\b/g, "پاورپوینت"); }
    if (Array.isArray(v)) { for (var i = 0; i < v.length; i++) v[i] = deCode(v[i]); return v; }
    if (v && typeof v === "object") { for (var k in v) if (k !== "id" && k !== "k" && k !== "ids") v[k] = deCode(v[k]); return v; }
    return v;
  }
  ["PROTOCOLS", "CONCERNS", "CURRICULUM", "ERRATA", "PILLARS", "ROOTS", "LAYERS", "PHASES", "PHASE_REF_NOTE", "FARM_MODEL", "PIPELINE", "QUICKSTART", "TRANSITION", "GROUPS", "PRIORITY_INFO"].forEach(function (k) { if (C[k]) deCode(C[k]); });
  T.forEach(deCode);
  var TM = {}; T.forEach(function (t) { TM[t.id] = t; });
  if (C.TAG_FIX) {
    Object.keys(C.TAG_FIX.add).forEach(function (id) { var t = TM[id]; if (!t) return; t.concerns = t.concerns || []; C.TAG_FIX.add[id].forEach(function (c) { if (t.concerns.indexOf(c) < 0) t.concerns.push(c); }); });
    Object.keys(C.TAG_FIX.remove).forEach(function (id) { var t = TM[id]; if (!t) return; t.concerns = (t.concerns || []).filter(function (c) { return C.TAG_FIX.remove[id].indexOf(c) < 0; }); });
  }
  var GOF = {}; C.GROUPS.forEach(function (g) { g.ids.forEach(function (id) { GOF[id] = g; }); });
  var PM = {}; C.PROTOCOLS.forEach(function (p) { PM[p.id] = p; });
  A.C = C; A.T = T; A.TM = TM; A.GOF = GOF; A.PM = PM;
  A.pn = function (pid) { return C.PNAME[pid] || (PM[pid] ? PM[pid].fa : pid); };
  A.phaseOf = function (id) { var o = C.PHASE_OVERRIDE || {}; return o[id] != null ? o[id] : GOF[id].phase; };

  /* ---------- ابزارها ---------- */
  var FD = "۰۱۲۳۴۵۶۷۸۹";
  A.fa = function (x) { return String(x == null ? "" : x).replace(/[0-9]/g, function (d) { return FD[+d]; }); };
  A.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  A.h = function (tag, attrs) {
    var el = document.createElement(tag), i, k, kids = Array.prototype.slice.call(arguments, 2);
    if (attrs) for (k in attrs) {
      var v = attrs[k]; if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k === "text") el.textContent = v;
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else if (k === "style" && typeof v === "object") { for (var s in v) { if (s.slice(0, 2) === "--") el.style.setProperty(s, v[s]); else el.style[s] = v[s]; } }
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (i = 0; i < kids.length; i++) add(el, kids[i]);
    return el;
    function add(p, c) {
      if (c == null || c === false) return;
      if (Array.isArray(c)) { c.forEach(function (x) { add(p, x); }); return; }
      p.appendChild(typeof c === "object" ? c : document.createTextNode(String(c)));
    }
  };
  var h = A.h;
  /* میزبان (مثلاً Lifemanager): اگر window.LLA_HOST هست، ذخیره، هوش مصنوعی و نشانی صفحه از میزبان می‌آید */
  A.HOST = window.LLA_HOST || null;
  A.layer = function () { return A.mountEl || document.body; };
  A.pad = function (n) { return n < 10 ? "0" + n : "" + n; };
  /* ---------- ساعتِ واحد (تورِ پولیا دورِ ۱۹c، LT8) ----------
     هر «اکنون» ِ صفحه (A.today، S.put، ساعت‌های خصوصیِ ماژول‌ها، دریچه‌های Date.now) از A.now() می‌گذرد. بی جابه‌جایی همان new Date() است
     (رفتار عیناً همان). جابه‌جاییِ روز فقط در حالتِ توسعه: ?dev=1 (یا localStorage «lla.dev»=1 یا window.LLA_DEV) و ?clock=YYYY-MM-DD
     یا APP.clock.advance(n)/set(day) — برای تورگردان‌هایی که Playwright ندارند؛ در کارِ عادی هرگز اعمال نمی‌شود. رکوردِ ساخته‌شده زیرِ
     ساعتِ آزمایشی برچسبِ simClock می‌گیرد و بی آن ساعت از S.all (یعنی «امروز» و کارنامه) بیرون می‌ماند. Playwright: page.clock کلِ Date را
     جابه‌جا می‌کند و همین مسیر را هم‌خوان نگه می‌دارد (راهنما: HANDBOOK «زمان‌بندِ واحد»). */
  var CLK = A.clock = { off: 0, dev: false, maxSeen: 0, stale: false };
  function ymd(d) { return d.getFullYear() + "-" + A.pad(d.getMonth() + 1) + "-" + A.pad(d.getDate()); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } }
  A.now = function () {
    var d = new Date();
    if (CLK.off) d.setDate(d.getDate() + CLK.off);
    var t = d.getTime(); if (t + 6e4 < CLK.maxSeen) CLK.stale = true; else if (t > CLK.maxSeen) CLK.maxSeen = t;
    return d;
  };
  A.nowMs = function () { return A.now().getTime(); };
  A.nowISO = function () { return A.now().toISOString(); };
  A.today = function () { return ymd(A.now()); };
  (function initClock() {
    var q = null; try { q = new URLSearchParams((window.location && window.location.search) || ""); } catch (e) { q = null; }
    CLK.dev = !!((q && q.get("dev") === "1") || lsGet("lla.dev") === "1" || window.LLA_DEV === true);
    if (!CLK.dev) return;   // کارِ عادی: هرگز جابه‌جایی
    var off = parseInt(lsGet("lla.clockOff") || "0", 10) || 0, c = q && q.get("clock");
    if (c && /^\d{4}-\d{2}-\d{2}$/.test(c) && lsGet("lla.clockParam") !== c) {
      var real = ymd(new Date()), pa = real.split("-"), pb = c.split("-");
      off = Math.round((new Date(+pb[0], +pb[1] - 1, +pb[2]) - new Date(+pa[0], +pa[1] - 1, +pa[2])) / 864e5);
      lsSet("lla.clockParam", c); lsSet("lla.clockOff", String(off));
    }
    CLK.off = off;
  })();
  /* تورگردان: APP.clock.advance(n) روی جابه‌جاییِ قبلی جمع می‌شود (هرگز به روزِ واقعی برنمی‌گردد)؛ پس از پرش، صفحه را دوباره بارگذاری کن */
  CLK.advance = function (n) { if (!CLK.dev) { console.warn("APP.clock: فقط در حالتِ توسعه (?dev=1)"); return null; } CLK.off += (+n || 0); lsSet("lla.clockOff", String(CLK.off)); return A.today(); };
  CLK.set = function (day) { if (!CLK.dev || !/^\d{4}-\d{2}-\d{2}$/.test(String(day))) return null; CLK.off = 0; var real = A.today(); CLK.off = A.daysBetween(real, day); lsSet("lla.clockOff", String(CLK.off)); return A.today(); };
  CLK.reset = function () { CLK.off = 0; CLK.maxSeen = 0; CLK.stale = false; lsSet("lla.clockOff", null); lsSet("lla.clockParam", null); return A.today(); };
  /* سلامتِ شبیه‌سازی: «mixed» = فقط A.today وصله شده (created هنوز ساعتِ واقعی است) ⇒ نتیجه بی‌اعتبار؛ «stale» = پرشِ رو به عقب بی بارگذاری */
  CLK.check = function () { var real = ymd(A.now()), td = A.today(); return { ok: td === real && !CLK.stale, mixed: td !== real, stale: CLK.stale, off: CLK.off, dev: CLK.dev, today: td }; };
  A.addDays = function (ds, n) { var p = ds.split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2]); d.setDate(d.getDate() + n); return d.getFullYear() + "-" + A.pad(d.getMonth() + 1) + "-" + A.pad(d.getDate()); };
  /* تاریخِ محلیِ یک زمانِ ISO (برای مقایسه با A.today() که محلی است). slice(0,10) روی ISO تاریخِ UTC را می‌دهد و
     در تهران بینِ ۰۰:۰۰ تا ۰۳:۳۰ یک روز عقب است (ممیزی ۲۰۲۶-۱۰-۱۳). رشتهٔ YYYY-MM-DD همان‌طور برمی‌گردد. */
  A.localDay = function (iso) {
    if (!iso) return "";
    var s = String(iso); if (s.length <= 10) return s;
    var d = new Date(s); if (isNaN(d.getTime())) return s.slice(0, 10);
    return d.getFullYear() + "-" + A.pad(d.getMonth() + 1) + "-" + A.pad(d.getDate());
  };
  A.daysBetween = function (a, b) { var pa = a.split("-"), pb = b.split("-"); return Math.round((new Date(+pb[0], +pb[1] - 1, +pb[2]) - new Date(+pa[0], +pa[1] - 1, +pa[2])) / 864e5); };
  A.uid = function (p) { return (p || "r") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
  A.fdate = function (iso) {
    if (!iso) return "";
    try { return new Date(iso.length <= 10 ? iso + "T12:00:00" : iso).toLocaleDateString("fa-IR", { year: "numeric", month: "short", day: "numeric" }); }
    catch (e) { return A.fa(iso.slice(0, 10)); }
  };
  A.debounce = function (fn, ms) { var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms); }; };
  A.shuffle = function (arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = arr[i]; arr[i] = arr[j]; arr[j] = x; } return arr; };
  A.toast = function (msg, kind, ms) {
    var box = document.getElementById("toasts");
    if (!box) { box = h("div", { id: "toasts", "aria-live": "polite" }); A.layer().appendChild(box); }
    var el = h("div", { class: "toast " + (kind || ""), role: "status" }, msg);
    box.appendChild(el);
    var stay = +ms > 2600 ? +ms : 2600;  /* ms: پیامِ بلند (مثلاً فهرستِ پیوست‌های نفرستاده) بیشتر بماند */
    setTimeout(function () { el.classList.add("out"); }, stay);
    setTimeout(function () { el.remove(); }, stay + 500);
  };
  /* سقفِ ۴۰ پیوست در هر درخواستِ هوش مصنوعی (بازبینی ۲۰۲۶-۱۰-۱۵): سقف همان می‌ماند، ولی بیش از آن هرگز بی‌صدا کنار نمی‌رود —
     هشدارِ فارسی با نامِ فایل‌های نفرستاده (toast ِ ماندگار + A.aiFileDrop برای کادرِ همان‌جا و آزمون). items: شناسه یا {id, name}. */
  A.AI_FILE_MAX = 40;
  A.fileNames = A.fileNames || {};
  A.aiFileName = function (x) { if (x && typeof x === "object") return x.name || ("پیوستِ #" + x.id); return A.fileNames[x] || ("پیوستِ #" + x); };
  A.aiFileDropMsg = function (names, total) {
    return "از " + A.fa(total) + " پیوست فقط " + A.fa(A.AI_FILE_MAX) + " تای اول برای هوش مصنوعی فرستاده و خوانده می‌شود (سقفِ هر درخواست). این " +
      A.fa(names.length) + " فایل فرستاده نشد: " + names.map(function (n) { return "«" + n + "»"; }).join("، ") + " — اگر لازم‌اند، در درخواستی جدا بفرست.";
  };
  A.aiFileCap = function (items, where) {
    items = (items || []).slice();
    if (items.length <= A.AI_FILE_MAX) return items;
    var dropped = items.slice(A.AI_FILE_MAX).map(A.aiFileName);
    var msg = A.aiFileDropMsg(dropped, items.length);
    A.aiFileDrop = { where: where || "", total: items.length, names: dropped, msg: msg };
    try { A.toast(msg, "bad", 15000); } catch (e) { }
    return items.slice(0, A.AI_FILE_MAX);
  };
  A.copy = function (text, btn) {
    function ok() { A.toast("کپی شد"); }
    try { navigator.clipboard.writeText(text).then(ok, fallback); } catch (e) { fallback(); }
    function fallback() { var ta = h("textarea", {}, text); A.layer().appendChild(ta); ta.select(); try { document.execCommand("copy"); ok(); } catch (e) { A.toast("متن انتخاب شد؛ دستی کپی کن"); } ta.remove(); }
  };
  A.filled = function (v) {
    if (v == null) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (typeof v === "number") return true;
    if (Array.isArray(v)) return v.some(function (x) { return typeof x === "object" && x ? Object.keys(x).some(function (k) { return A.filled(x[k]); }) : A.filled(x); });
    if (typeof v === "object") return v.sec > 0 || v.done || Object.keys(v).length > 0;
    return !!v;
  };

  /* ---------- ذخیره‌سازی (محلی یا گوگل اپس‌اسکریپت) ---------- */
  var LSKEY = "mla.records.v1";
  var S = A.S = { recs: {}, mode: "local", status: "", listeners: [] };
  S.isGAS = function () { return typeof google !== "undefined" && google.script && google.script.run; };
  S.setStatus = function (s) { S.status = s; var el = document.getElementById("syncState"); if (el) { el.textContent = s; el.dataset.s = s; } };
  S.init = function (cb) {
    if (A.HOST) {
      S.mode = "host"; S.setStatus("در حال بارگذاری…");
      // a FAILED load must never continue into the app: seed()/settings would then be written over the
      // owner's real data on the server. Show the error with a retry instead (2026-10-12 audit).
      S.loaded = false;
      // (a remount reloads; a change still queued for the server is newer than the server's copy — keep it)
      A.HOST.load().then(function (arr) { (arr || []).forEach(function (r) { if (r && r.id && !hostPending[r.id] && !hostDel[r.id]) S.recs[r.id] = r; }); S.loaded = true; S.setStatus("همگام"); cb(); pumpHost(); },
        function (e) {
          S.setStatus("خطای بارگذاری");
          var main = document.getElementById("main") || document.getElementById("app");
          var msg = (e && e.response && e.response.status === 401) ? "نشستِ ورود تمام شده — دوباره وارد شو." : "بارگذاریِ داده ناموفق بود: " + ((e && e.message) || e);
          if (main) {
            main.innerHTML = "";
            main.appendChild(A.h("section", { class: "card bad" }, A.h("h2", {}, "داده‌ها بارگذاری نشد"),
              A.h("p", {}, msg + " — تا داده‌ها نیامده‌اند چیزی ذخیره نمی‌شود تا روی اطلاعاتِ تو نوشته نشود."),
              A.h("button", { class: "btn", onclick: function () { S.init(cb); } }, "تلاشِ دوباره")));
          } else A.toast(msg, "bad");
        });
      return;
    }
    if (S.isGAS()) {
      S.mode = "gas"; S.setStatus("در حال بارگذاری از Google Sheets…");
      google.script.run.withSuccessHandler(function (txt) {
        try { (JSON.parse(txt || "[]")).forEach(function (r) { S.recs[r.id] = r; }); } catch (e) { console.error(e); }
        S.setStatus("همگام"); cb();
      }).withFailureHandler(function (err) { S.setStatus("خطای بارگذاری"); A.toast("بارگذاری از Sheets ناموفق بود: " + (err && err.message), "bad"); cb(); }).api_load();
    } else {
      S.mode = "local";
      try { var raw = localStorage.getItem(LSKEY); if (raw) S.recs = JSON.parse(raw) || {}; S.setStatus("ذخیره در همین مرورگر"); }
      catch (e) { S.setStatus("ذخیره موقت (حافظه مرورگر در دسترس نیست)"); }
      cb();
    }
  };
  var pending = {};
  var flushGAS = A.debounce(function () {
    var batch = Object.keys(pending).map(function (id) { return pending[id]; }); pending = {};
    if (!batch.length) return;
    S.setStatus("در حال ذخیره…");
    google.script.run.withSuccessHandler(function () { S.setStatus("همگام"); })
      .withFailureHandler(function (e) { S.setStatus("خطای ذخیره"); A.toast("ذخیره در Sheets ناموفق بود؛ دوباره تلاش می‌شود.", "bad"); batch.forEach(function (r) { if (!pending[r.id]) pending[r.id] = r; }); setTimeout(flushGAS, 4000); })
      .api_saveMany(JSON.stringify(batch));
  }, 700);
  /* ذخیرهٔ میزبان: دسته‌های کوچک (≤۱۰۰ رکورد، ≤~۳ میلیون نویسه)، یکی‌یکی؛ رکوردِ ردشده (شناسه/حجم) با پیام کنار
     گذاشته می‌شود و دیگر بی‌پایان تکرار نمی‌شود؛ خطای شبکه/سرور با فاصلهٔ فزاینده (۴ث تا ۲دقیقه) دوباره. */
  var hostPending = {}, hostDel = {}, hostBusy = false, hostWait = 4000, hostTimer = null;
  var MAX_CHUNK_CHARS = 3000000;
  function retryHost() { clearTimeout(hostTimer); hostTimer = setTimeout(function () { hostTimer = null; pumpHost(); }, hostWait); hostWait = Math.min(hostWait * 2, 120000); }
  function hostFailed(e) {
    var st = e && e.response && e.response.status;
    // a 4xx the same request will hit again (401 = session expired ⇒ kept and retried after re-login, never dropped)
    return st && st >= 400 && st < 500 && [401, 403, 408, 409, 429].indexOf(st) < 0 ? st : 0;
  }
  function pumpHost() {
    if (hostBusy || hostTimer || !S.loaded) return;
    var dels = Object.keys(hostDel);
    if (dels.length) {
      var id = dels[0]; hostBusy = true;
      A.HOST.del(id).then(function () { delete hostDel[id]; hostBusy = false; hostWait = 4000; pumpHost(); },
        function (e) { hostBusy = false; if (hostFailed(e)) { delete hostDel[id]; A.toast("حذف ناموفق بود (" + hostFailed(e) + ")", "bad"); pumpHost(); } else { S.setStatus("خطای حذف — دوباره تلاش می‌شود"); retryHost(); } });
      return;
    }
    var ids = Object.keys(hostPending);
    if (!ids.length) { S.setStatus("همگام"); return; }
    var batch = [], size = 0;
    for (var i = 0; i < ids.length && batch.length < 100; i++) {
      var r = hostPending[ids[i]], n = JSON.stringify(r).length;
      if (batch.length && size + n > MAX_CHUNK_CHARS) break;
      batch.push(r); size += n;
    }
    batch.forEach(function (r) { delete hostPending[r.id]; });
    hostBusy = true; S.setStatus("در حال ذخیره…");
    A.HOST.saveMany(batch).then(function (res) {
      hostBusy = false; hostWait = 4000;
      var rej = (res && res.rejected) || [];
      if (rej.length) A.toast("ذخیره نشد: " + rej.map(function (x) { return (x.id || "?") + " — " + x.reason; }).join("؛ "), "bad");
      pumpHost();
    }, function (e) {
      hostBusy = false;
      var bad = hostFailed(e);
      if (bad) { S.setStatus("خطای ذخیره"); A.toast("ذخیره رد شد (" + bad + ")؛ این دسته دوباره فرستاده نمی‌شود.", "bad"); pumpHost(); return; }
      batch.forEach(function (r) { if (!hostPending[r.id] && S.recs[r.id] === r) hostPending[r.id] = r; });
      var st = e && e.response && e.response.status;
      S.setStatus(st === 401 ? "نشستِ ورود تمام شده — دوباره وارد شو؛ تغییرها نگه داشته شده‌اند" : "خطای ذخیره — دوباره تلاش می‌شود"); retryHost();
    });
  }
  var flushHost = A.debounce(pumpHost, 700);
  /* حالتِ محلی: نوشتن با تأخیرِ ۳۰۰ms جمع می‌شود؛ اما اگر صفحه بسته/بازبارگذاری شود (pagehide، پنهان‌شدن، beforeunload)
     نوشتنِ معوق همان لحظه انجام می‌شود تا تغییرِ کمتر از ۳۰۰ms پیش از بارگذاری گم نشود (ممیزی ۲۰۲۶-۱۰-۱۳). */
  var localDirty = false, localTimer = null;
  function writeLocal() {
    if (localTimer) { clearTimeout(localTimer); localTimer = null; }
    if (!localDirty) return; localDirty = false;
    try { localStorage.setItem(LSKEY, JSON.stringify(S.recs)); S.setStatus("ذخیره در همین مرورگر"); }
    catch (e) { S.setStatus("ذخیره ناموفق (فضای مرورگر)"); }
  }
  function flushLocal() { localDirty = true; if (localTimer) clearTimeout(localTimer); localTimer = setTimeout(writeLocal, 300); }
  S.flushNow = function () { if (S.mode === "host") pumpHost(); else if (S.mode === "local") writeLocal(); };
  try {
    window.addEventListener("pagehide", function () { S.flushNow(); });
    window.addEventListener("beforeunload", function () { S.flushNow(); });
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") S.flushNow(); });
  } catch (e) { }
  /* o.keepTime: زمانِ «updated» ِ خودِ رکورد حفظ شود (ورودِ پشتیبان؛ ممیزی ۲۰۲۶-۱۰-۱۳) — وگرنه هر نوشتن زمانِ اکنون را می‌گیرد */
  S.put = function (r, o) {
    if (!(o && o.keepTime && r.updated)) r.updated = A.nowISO();
    if (!r.created) { r.created = r.updated; if (CLK.off) r.simClock = A.today(); }   // ساختهٔ ساعتِ آزمایشی (LT8)
    S.recs[r.id] = r;
    if (S.mode === "host") { delete hostDel[r.id]; hostPending[r.id] = r; flushHost(); }
    else if (S.mode === "gas") { pending[r.id] = r; flushGAS(); } else flushLocal();
    notify(r, "put");
    return r;
  };
  /* شنونده‌های نوشتن (S.listeners): نمای باز می‌تواند پس از S.put/S.del خودش را تازه کند — خطای شنونده هرگز ذخیره را نمی‌شکند */
  function notify(r, op) { (S.listeners || []).forEach(function (fn) { try { fn(r, op); } catch (e) { console.warn(e); } }); }
  S.del = function (id) {
    delete S.recs[id];
    if (S.mode === "host") { delete hostPending[id]; hostDel[id] = 1; flushHost(); notify({ id: id }, "del"); return; }  // a queued save must not resurrect it
    if (S.mode === "gas") { google.script.run.withFailureHandler(function () { A.toast("حذف در Sheets ناموفق بود", "bad"); }).api_delete(id); }
    else flushLocal();
    notify({ id: id }, "del");
  };
  S.get = function (id) { return S.recs[id]; };
  S.all = function (type, pred) {
    var out = [];
    for (var id in S.recs) { var r = S.recs[id]; if (r.simClock && !CLK.off) continue; if ((!type || r.type === type) && (!pred || pred(r))) out.push(r); }
    return out.sort(function (a, b) { return (b.updated || "").localeCompare(a.updated || ""); });
  };
  S.settings = function () { return S.recs.settings || { id: "settings", type: "set", ai: { provider: "gemini", model: "gemini-2.5-flash" }, jargon: [] }; };
  S.saveSettings = function (s) { s.id = "settings"; s.type = "set"; S.put(s); };

  /* ---------- هوش مصنوعی (فقط منتقد) ---------- */
  A.AI_SYS = "تو منتقد کارگاه تمرین در یک سامانه یادگیری عمیق هستی. کاربر فارسی‌زبان است و خودش تکنیک را اجرا کرده. قوانین سخت:\n" +
    "۱) کار را به جای کاربر انجام نده: پاسخ نهایی، استخراج کامل یا بازنویسی کامل نده؛ هدف این است که او خودش تولید کند (اثر تولید).\n" +
    "۲) کار را با روبریک تکنیک بسنج و برای هر معیار نمره ۰، ۱ یا ۲ با یک دلیل کوتاه و مشخص (با ارجاع به نوشته خودش) بده.\n" +
    "۳) ضعیف‌ترین گام اجرای تکنیک را نام ببر و بگو چرا ضعیف است.\n" +
    "۴) دو یا سه پرسش کاوشگر بپرس که او را به لایه عمیق‌تر ببرد.\n" +
    "۵) فقط یک سرنخ بده، نه راه‌حل.\n" +
    "۶) اگر خطای محتوایی (علمی، مالی، فنی) دیدی، دقیق بگو کجا و چرا نادرست است، بدون نوشتن متن جایگزین کامل.\n" +
    "۷) فارسی روشن و دقیق، بدون تعارف، بدون اغراق، بدون عبارت‌های کلیشه‌ای. حداکثر ۳۵۰ کلمه. ساختار: «نمره روبریک»، «ضعیف‌ترین گام»، «پرسش‌ها»، «یک سرنخ»، «خطای محتوایی (اگر هست)».";
  /* opts (اختیاری): {fileIds:[…]} — شناسهٔ پیوست‌های همین کاربر (عکس/PDF) که میزبان همراهِ درخواست به مدلِ بینا می‌دهد.
     فقط میزبان (Lifemanager) آن را می‌فهمد؛ نسخهٔ مستقل و Apps Script نادیده‌اش می‌گیرند (پیوست ندارند). */
  A.callAI = function (system, user, opts) {
    if (A.HOST && A.HOST.ai) return opts ? A.HOST.ai(system, user, opts) : A.HOST.ai(system, user);
    return new Promise(function (resolve, reject) {
      if (S.mode === "gas") {
        google.script.run.withSuccessHandler(function (r) { resolve(r); }).withFailureHandler(function (e) { reject(e); }).api_ai(system, user);
        return;
      }
      var st = S.settings().ai || {};
      if (!st.key) { reject(new Error("کلید API تنظیم نشده است. از بخش «تنظیمات» وارد کن.")); return; }
      var p;
      if (st.provider === "anthropic") {
        p = fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": st.key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
          body: JSON.stringify({ model: st.model || "claude-sonnet-5-5", max_tokens: 2000, system: system, messages: [{ role: "user", content: user }] }) })
          .then(function (r) { return r.json(); }).then(function (d) { if (d.error) throw new Error(d.error.message); return (d.content || []).map(function (c) { return c.text || ""; }).join(""); });
      } else {
        p = fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(st.model || "gemini-2.5-flash") + ":generateContent?key=" + encodeURIComponent(st.key), { method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: user }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 2500 } }) })
          .then(function (r) { return r.json(); }).then(function (d) { if (d.error) throw new Error(d.error.message); var c = d.candidates && d.candidates[0]; return c && c.content ? c.content.parts.map(function (x) { return x.text || ""; }).join("") : ""; });
      }
      p.then(resolve, function (e) { reject(new Error((e && e.message) || "اتصال برقرار نشد. اگر این صفحه به‌صورت Artifact باز شده، فراخوانی سرویس‌های بیرونی مسدود است؛ نسخه گوگل اپس‌اسکریپت را استفاده کن.")); });
    });
  };
  A.serializeWS = function (fields, data, claims) {
    var out = [];
    fields.forEach(function (f) {
      var v = data[f.k];
      if (f.t === "info" || f.t === "jargon" || f.t === "pareto" || f.t === "calib") return;
      if (f.t === "draw") { if (v) out.push("■ " + f.l + ": [طرح رسم‌شده]"); return; }
      if (f.t === "timer") { if (v && v.sec) out.push("■ " + f.l + ": " + Math.round(v.sec / 60) + " دقیقه"); return; }
      if (!A.filled(v)) { out.push("■ " + f.l + ": (خالی)"); return; }
      if (f.t === "table") out.push("■ " + f.l + ":\n" + v.map(function (row, i) { return "  " + (i + 1) + ". " + f.cols.map(function (c) { var x = row[c.k] == null ? "" : row[c.k]; if (c.t === "claim" && x !== "" && claims && claims[+x - 1]) x = "ادعای " + x + " («" + claims[+x - 1] + "»)"; return c.l + ": " + x; }).join(" | "); }).join("\n"));
      else if (Array.isArray(v)) out.push("■ " + f.l + ":\n" + v.filter(A.filled).map(function (x, i) { return "  " + (i + 1) + ". " + x; }).join("\n"));
      else out.push("■ " + f.l + ": " + v);
    });
    return out.join("\n");
  };

  /* ---------- مرور فاصله‌دار (SM-2 ساده‌شده) ---------- */
  A.srsGrade = function (card, g, conf) {
    card.ef = card.ef || 2.5; card.n = card.n || 0; card.iv = card.iv || 0;
    if (g < 3) { card.n = 0; card.iv = 1; }
    else {
      /* متنِ خودِ T42 (dose/how): «۱ روز، ۶ روز، سپس فاصلهٔ قبلی × ضریب سهولت» (پیش‌تر کد ۱ و ۳ می‌داد — ممیزیِ طولی §۳.۳؛ دورِ ۱۹c).
         پلهٔ نخست (۱ روز) از ساختِ کارت شمرده می‌شود: کارتی که دست‌کم یک روز پس از ساخت مرور شد، پلهٔ ۱ را گذرانده ⇒ ۶ روز؛ همان روزِ ساخت ⇒ ۱ روز.
         پس از نمرهٔ زیرِ ۳ (فاصله ۱) پلهٔ بعدی دوباره ۶ است («به ابتدا برمی‌گرداند»). جدولِ پله‌ها: A.SCHED.POLICY.T42 (یک نسخه). */
      var ST = (A.SCHED && A.SCHED.POLICY && A.SCHED.POLICY.T42 && A.SCHED.POLICY.T42.steps) || [1, 6];
      var prev = card.iv || 0, born = A.localDay(card.created || "") || A.today();
      card.n += 1;
      if (!prev) card.iv = A.daysBetween(born, A.today()) >= ST[0] ? ST[1] : ST[0];
      else if (prev < ST[1] && card.n <= 2) card.iv = ST[1];
      else card.iv = Math.round(prev * card.ef);
      if (g === 3) card.iv = Math.max(1, Math.round(card.iv * 0.8));
    }
    card.ef = Math.max(1.3, card.ef + (0.1 - (5 - g) * (0.08 + (5 - g) * 0.02)));
    card.due = A.addDays(A.today(), card.iv);
    (card.hist = card.hist || []).push({ d: A.today(), g: g, c: conf });
    return card;
  };
  A.newCard = function (q, a, extra) {
    var c = { id: A.uid("card"), type: "card", q: q, a: a, ef: 2.5, n: 0, iv: 0, due: A.today(), hist: [] };
    for (var k in (extra || {})) c[k] = extra[k];
    return S.put(c);
  };
  /* بازنشسته‌کردنِ کارت (ممیزیِ طولی §۳.۴: «susp» خوانده می‌شد ولی هیچ‌جا گذاشته نمی‌شد). کارتِ بازنشسته از صفِ موعد، «امروز» و یادآورِ
     «cards:review» بیرون می‌رود؛ تاریخچه‌اش می‌ماند و «بازگرداندن» آن را با همان زمان‌بندی برمی‌گرداند. */
  A.cardSuspend = function (card, on) {
    if (!card) return null;
    if (on) card.susp = A.today(); else delete card.susp;
    return S.put(card);
  };
  A.dueCards = function () { var t = A.today(); return S.all("card", function (c) { return !c.susp && (c.due || "") <= t; }); };
  /* دورِ ۲۰ (RO7، B·D16): کارتِ نمونهٔ ساختهٔ سامانه (روالِ آماده‌ای که خودش شروع نکرده) تا نخستین مرورِ خودش در «امروز» و یادآور نمی‌آید؛
     پروندهٔ تمرین (a41) کارتِ مسئله‌ای را که پرونده‌اش صاحبِ زمان‌بندی است هم بیرون می‌گذارد (یک سطر برای یک کار) */
  A.cardInToday = function (c) { return !!c && !(c.sample && !(c.hist || []).length); };

  /* ---------- آمار و کالیبراسیون ---------- */
  A.rubricPct = function (ex) {
    var t = TM[ex.tid]; var r = ex.rubric || [];
    var n = t ? t.rubric.length : r.length; if (!n) return null;
    var any = r.some(function (x) { return x != null; }); if (!any) return null;
    var s = 0; for (var i = 0; i < n; i++) s += (r[i] || 0);
    return Math.round(100 * s / (2 * n));
  };
  A.mastery = function (tid) {
    var exs = S.all("ex", function (e) { return e.tid === tid && e.status === "done" && !e.sample; });
    var pcts = exs.map(A.rubricPct).filter(function (x) { return x != null; });
    var avg = pcts.length ? Math.round(pcts.reduce(function (a, b) { return a + b; }, 0) / pcts.length) : null;
    var lvl = 0;
    if (exs.length >= 1) lvl = 1;
    if (exs.length >= 3 && (avg || 0) >= 50) lvl = 2;
    if (exs.length >= 6 && (avg || 0) >= 75) lvl = 3;
    return { n: exs.length, avg: avg, lvl: lvl, last: exs[0] ? exs[0].updated : null };
  };
  A.MLV = ["تمرین‌نشده", "آزموده", "در حال تسلط", "روان"];
  A.calibPoints = function () {
    var pts = [];
    S.all("card").forEach(function (c) { (c.hist || []).forEach(function (h) { if (h.c != null) pts.push({ p: h.c / 100, o: h.g >= 3 ? 1 : 0, src: "card" }); }); });
    S.all("ex", function (e) { return e.tid === 24 && !e.sample; }).forEach(function (e) {
      var t = TM[24]; if (!t) return;
      var cf = null; t.ws.forEach(function (f) { if (f.t === "calib") cf = f; });
      if (!cf) return;
      (e.data[cf.src] || []).forEach(function (row) {
        var o = row[cf.out]; var p = parseFloat(row[cf.conf]);
        if (isNaN(p) || (o !== "درست" && o !== "نادرست")) return;
        pts.push({ p: p / 100, o: o === "درست" ? 1 : 0, src: "pred" });
      });
    });
    S.all("case").forEach(function (cs) {
      var fin = cs.st && cs.st.st_final && cs.st.st_final.data && cs.st.st_final.data.final; if (!fin) return;
      fin.forEach(function (row) {
        var o = (cs.outcome || {})[row.c]; var p = parseFloat(row.p);
        if (isNaN(p) || (o !== "درست" && o !== "نادرست")) return;
        pts.push({ p: p / 100, o: o === "درست" ? 1 : 0, src: "case" });
      });
    });
    return pts;
  };
  A.brier = function (pts) { if (!pts.length) return null; var s = 0; pts.forEach(function (x) { s += (x.p - x.o) * (x.p - x.o); }); return s / pts.length; };
  A.recallTrend = function () {
    return S.all("pr", function (r) { return (r.pid === "P3" || r.pid === "P4") && r.status === "done" && r.data && r.data.pct != null; })
      .sort(function (a, b) { return a.created.localeCompare(b.created); }).map(function (r) { return { d: A.localDay(r.created), v: +r.data.pct }; });
  };
})(APP);
