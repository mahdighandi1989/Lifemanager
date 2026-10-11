/* ===== موتور قطعی کارخانه، دادگاه بک‌تست، بهینه‌ساز، سناریوساز و چرخه دوره‌ای =====
   بدون هیچ فراخوانی هوش مصنوعی. هم در مرورگر و هم در Google Apps Script (سمت سرور) اجرا می‌شود.
   الگو: صفحه ترید کوانتومی (تونل = ایستگاه، باکس = قاعده، وزن = شدت؛ فقط شدت تنظیم می‌شود نه ماهیت). */
(function (W) {
  var X = W.EPIX = {};
  var PIPE = W.EPI_PIPE || [];
  var PIDX = {}; PIPE.forEach(function (s, i) { PIDX[s] = i; });

  /* ---------- قواعد دادگاه (از پیش اعلام‌شده؛ نرم نمی‌شوند) ---------- */
  X.COURT = {
    split: 0.7,              // ۷۰٪ قدیمی‌تر = درون‌نمونه (دوره قدیم)، ۳۰٪ جدیدتر = برون‌نمونه (دوره جدید)
    floor: 0.70,             // کف امتیاز درون‌نمونه
    oosFrac: 0.85,           // کف برون‌نمونه = ۰٫۸۵ × کف
    twoRulers: 0.60,         // حساسیت (یافتن و مکان‌یابی شکست) و ویژگی (عبور سالم‌ها) هر کدام جداگانه
    wilsonZ: 1.96,           // ۹۵٪
    chance: 0.50, cushion: 0.03,
    minIS: 30, perVar: 2.5, minOOSAbs: 15, minOOSFrac: 0.35,
    bumpPerDecade: 0.02, bumpCap: 0.08, bumpBase: 60,
    bookFidelity: 0.85,      // وفاداری به مثال‌های خود جزوه
    posCtrl: 0.95,           // کنترل مثبت (خطای کاشته‌شده)
    negCtrlMaxLB: 0.50,      // کنترل منفی (برچسب‌های جابه‌جا): کران پایین نباید از تصادف بالاتر باشد
    tol: 10,                 // تحمل بیش‌اطمینانی پیش‌فرض (واحد درصد)
    th: 0.5,                 // آستانه پرچم ایستگاه
    decayMin: 8              // کمینه پرونده تازه برای حکم فرسایش یک تنظیم قفل‌شده
  };
  X.DEFAULT_CFG = function (book) { return { w: {}, tol: X.COURT.tol, th: X.COURT.th, books: book ? [book] : null, name: "دستور منجمد جزوه (بدون تنظیم)" }; };

  /* ---------- زبان شرط ---------- */
  function has(f, k) { return f && Object.prototype.hasOwnProperty.call(f, k) && f[k] !== null && f[k] !== undefined && f[k] !== ""; }
  X.cond = function cond(c, f) {
    if (!c) return false;
    if (c.all) { for (var i = 0; i < c.all.length; i++) if (!cond(c.all[i], f)) return false; return true; }
    if (c.any) { for (var j = 0; j < c.any.length; j++) if (cond(c.any[j], f)) return true; return false; }
    if (c.not) return !cond(c.not, f);
    if (!has(f, c.f)) return false;
    var v = f[c.f];
    if ("eq" in c) return v === c.eq;
    if ("ne" in c) return v !== c.ne;
    if ("in" in c) return c["in"].indexOf(v) >= 0;
    if ("is" in c) return v === c.is;
    if ("gt" in c) return +v > c.gt;
    if ("gte" in c) return +v >= c.gte;
    if ("lt" in c) return +v < c.lt;
    if ("lte" in c) return +v <= c.lte;
    return false;
  };

  /* ---------- اجرای یک پرونده از لوله‌کشی ---------- */
  function rulesFor(cfg) { var R = W.EPI_RULES || []; return cfg && cfg.books ? R.filter(function (r) { return cfg.books.indexOf(r.book) >= 0; }) : R; }
  function wOf(cfg, r) { var w = cfg && cfg.w && cfg.w[r.id]; return w == null ? 1 : w; }
  X.runClaim = function (k, cfg, R) {
    R = R || rulesFor(cfg); var f = k.f || {};
    var ceil = 100, bind = null, fired = [], stScore = {};
    R.forEach(function (r) {
      if (!X.cond(r.when, f)) return;
      var w = wOf(cfg, r); fired.push(r.id);
      if (w <= 0) return;
      if (r.eff === "cap") { var c = 100 - w * (100 - r.cap); if (c < ceil) { ceil = c; bind = r; } }
      else if (r.eff === "flag") stScore[r.st] = (stScore[r.st] || 0) + w;
    });
    var flags = [];
    Object.keys(stScore).forEach(function (st) { if (stScore[st] >= ((cfg && cfg.th) || X.COURT.th)) flags.push({ st: st, kind: "flag", rules: fired.filter(function (id) { var r = X.RM[id]; return r.eff === "flag" && r.st === st && wOf(cfg, r) > 0; }) }); });
    var tol = cfg && cfg.tol != null ? cfg.tol : X.COURT.tol;
    var conf = has(f, "conf") ? +f.conf : null;
    var over = conf != null && conf > ceil + tol;
    if (over) flags.push({ st: bind ? bind.st : "st_grade", kind: "over", rules: bind ? [bind.id] : [], gap: Math.round(conf - ceil) });
    flags.sort(function (a, b) { return (PIDX[a.st] || 0) - (PIDX[b.st] || 0); });
    return { id: k.id, ceil: Math.round(ceil), bind: bind ? bind.id : null, fired: fired, flags: flags, over: over, conf: conf };
  };
  X.runCase = function (cs, cfg) {
    var R = rulesFor(cfg);
    var cl = (cs.claims || []).map(function (k) { return X.runClaim(k, cfg, R); });
    var sts = {}; cl.forEach(function (r) { r.flags.forEach(function (fl) { sts[fl.st] = 1; }); });
    var flagged = Object.keys(sts).sort(function (a, b) { return (PIDX[a] || 0) - (PIDX[b] || 0); });
    var fixes = []; cl.forEach(function (r) { r.flags.forEach(function (fl) { fl.rules.forEach(function (id) { var rr = X.RM[id]; if (rr && rr.fix && fixes.indexOf(rr.fix) < 0) fixes.push(rr.fix); }); }); });
    return { claims: cl, flagged: flagged, first: flagged[0] || null, healthy: !flagged.length, fixes: fixes };
  };

  /* ---------- سرنوشت صادقانه: داوری خروجی موتور در برابر حقیقت پرونده ---------- */
  X.fate = function (cs, res) {
    var t = cs.truth || {};
    if (t.ok === true) return { kind: "سالم", pass: res.healthy, score: res.healthy ? 1 : 0, why: res.healthy ? "بی‌پرچم عبور کرد" : "هشدار کاذب در " + res.flagged.join("، ") };
    var fail = t.fail || [];
    var hit = res.flagged.filter(function (s) { return fail.indexOf(s) >= 0; });
    var located = hit.length > 0;
    return { kind: "شکست", pass: located, detected: !res.healthy, located: located, score: located ? 1 : 0, extra: res.flagged.filter(function (s) { return fail.indexOf(s) < 0; }),
      why: res.healthy ? "شکست را ندید" : located ? "شکست را در ایستگاه درست یافت" : "پرچم زد ولی در ایستگاه نادرست (" + res.flagged.join("، ") + ")" };
  };

  /* ---------- آمار ---------- */
  X.wilson = function (p, n, z) { if (!n) return 0; z = z || X.COURT.wilsonZ; var d = 1 + z * z / n, c = p + z * z / (2 * n), m = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)); return Math.max(0, (c - m) / d); };
  /* هر گروه استقلال یک رأی است (مثل شمارش معاملات مستقل): امتیاز گروه = میانگین پرونده‌هایش */
  X.evaluate = function (cases, cfg, opt) {
    opt = opt || {};
    var rows = cases.map(function (cs) { var r = X.runCase(cs, cfg); return { cs: cs, res: r, fate: X.fate(cs, r) }; });
    var g = {}; rows.forEach(function (x) { var k = x.cs.grp || x.cs.id; (g[k] = g[k] || []).push(x.fate.score); });
    var gk = Object.keys(g), neff = gk.length;
    var p = neff ? gk.reduce(function (a, k) { var v = g[k]; return a + v.reduce(function (s, y) { return s + y; }, 0) / v.length; }, 0) / neff : 0;
    var H = rows.filter(function (x) { return x.fate.kind === "سالم"; }), F = rows.filter(function (x) { return x.fate.kind === "شکست"; });
    var spec = H.length ? H.filter(function (x) { return x.fate.pass; }).length / H.length : null;
    var sens = F.length ? F.filter(function (x) { return x.fate.located; }).length / F.length : null;
    var det = F.length ? F.filter(function (x) { return x.fate.detected; }).length / F.length : null;
    var bs = 0, bn = 0; rows.forEach(function (x) { (x.cs.claims || []).forEach(function (k, i) { if (k.truth === true || k.truth === false) { var c = x.res.claims[i].ceil / 100; bs += (c - (k.truth ? 1 : 0)) * (c - (k.truth ? 1 : 0)); bn++; } }); });
    var out = { n: rows.length, neff: neff, score: p, lb: X.wilson(p, neff), spec: spec, sens: sens, det: det, nH: H.length, nF: F.length, brier: bn ? bs / bn : null, bn: bn };
    if (opt.rows) out.rows = rows;
    return out;
  };

  /* ---------- تقسیم دو دوره (بدون دیدن آینده): گروه‌ها به ترتیب سال ---------- */
  X.split = function (cases) {
    var real = cases.filter(function (c) { return c.kind !== "booklet" && c.kind !== "synth"; });
    var gy = {}; real.forEach(function (c) { var k = c.grp || c.id; gy[k] = Math.max(gy[k] || -1e9, +c.year || 0); });
    var gs = Object.keys(gy).sort(function (a, b) { return gy[a] - gy[b] || (a < b ? -1 : 1); });
    var cut = Math.floor(gs.length * X.COURT.split), isG = {}; gs.slice(0, cut).forEach(function (k) { isG[k] = 1; });
    var IS = real.filter(function (c) { return isG[c.grp || c.id]; }), OOS = real.filter(function (c) { return !isG[c.grp || c.id]; });
    var y = gs[cut] != null ? gy[gs[cut]] : null;
    return { IS: IS, OOS: OOS, book: cases.filter(function (c) { return c.kind === "booklet"; }), cutYear: y };
  };

  /* ---------- سناریوساز: خطای کاشته‌شده (کنترل مثبت) و همزاد سالم ---------- */
  function rng(seed) { var s = (seed >>> 0) || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s >>> 0) / 4294967296; }; }
  X.hash = function (str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  function other(fk, v, R) { var f = W.EPI_FM[fk]; if (!f) return undefined; if (f.t === "bool") return !v; if (f.t === "enum") { var o = f.v.filter(function (x) { return x !== v; }); return o[Math.floor(R() * o.length)]; } return undefined; }
  /* یک مقداردهی کمینه که شرط را برقرار (want=true) یا نابرقرار (want=false) کند */
  function solve(c, want, R, acc) {
    acc = acc || {};
    if (c.all) { if (want) { c.all.forEach(function (x) { solve(x, true, R, acc); }); } else solve(c.all[Math.floor(R() * c.all.length)], false, R, acc); return acc; }
    if (c.any) { if (want) solve(c.any[Math.floor(R() * c.any.length)], true, R, acc); else c.any.forEach(function (x) { solve(x, false, R, acc); }); return acc; }
    if (c.not) return solve(c.not, !want, R, acc);
    var k = c.f, f = W.EPI_FM[k]; if (!f) return acc;
    var v;
    if ("eq" in c) v = want ? c.eq : other(k, c.eq, R);
    else if ("ne" in c) v = want ? other(k, c.ne, R) : c.ne;
    else if ("in" in c) { if (want) v = c["in"][Math.floor(R() * c["in"].length)]; else { var o = f.t === "enum" ? f.v.filter(function (x) { return c["in"].indexOf(x) < 0; }) : []; v = o.length ? o[Math.floor(R() * o.length)] : undefined; } }
    else if ("is" in c) v = want ? c.is : !c.is;
    else if ("gt" in c) v = want ? c.gt + 1 + Math.floor(R() * 10) : Math.max(0, c.gt - Math.floor(R() * 10));
    else if ("gte" in c) v = want ? c.gte + Math.floor(R() * 10) : Math.max(0, c.gte - 1 - Math.floor(R() * 10));
    else if ("lt" in c) v = want ? Math.max(0, c.lt - 1 - Math.floor(R() * 10)) : c.lt + Math.floor(R() * 10);
    else if ("lte" in c) v = want ? Math.max(0, c.lte - Math.floor(R() * 10)) : c.lte + 1 + Math.floor(R() * 10);
    if (k === "conf" || k === "mem_orig") v = Math.max(0, Math.min(100, v));
    if (v !== undefined && !(k in acc)) acc[k] = v;
    return acc;
  }
  function describe(f) {
    return Object.keys(f).map(function (k) { var d = W.EPI_FM[k]; if (!d) return ""; var v = f[k]; return d.fa + ": " + (v === true ? "بله" : v === false ? "خیر" : v); }).filter(Boolean).join(" · ");
  }
  /* seed مشخص؛ seen = امضاهای ساخته‌شده در دوره‌های پیشین تا سناریو تکرار نشود */
  X.genSynth = function (seed, perRule, seen, cfg) {
    var R = rng(seed), out = [], sig = seen || {}, rules = rulesFor(cfg || null);
    cfg = cfg || X.DEFAULT_CFG();
    rules.forEach(function (r) {
      for (var t = 0; t < (perRule || 2); t++) {
        var f = solve(r.when, true, R, {});
        if (!X.cond(r.when, f)) continue;
        var bad = JSON.parse(JSON.stringify(f)), good = JSON.parse(JSON.stringify(f));
        if (r.eff === "cap") {
          var eff = 100 - wOf(cfg, r) * (100 - r.cap);
          if (eff + cfg.tol + 1 > 100) break; /* این سقف با این تحمل نقض‌شدنی نیست؛ کنترل مثبت برایش معنا ندارد */
          var cn = "conf" in f ? f.conf : null;
          bad.conf = Math.min(100, Math.round(eff + cfg.tol + 3 + R() * 12));
          good.conf = Math.max(0, Math.round(eff - 3 - R() * 10));
          if (cn != null && !X.cond(r.when, bad)) continue;
          if (!X.cond(r.when, good)) continue;
        } else {
          good = solve({ not: r.when }, true, R, {});
          Object.keys(f).forEach(function (k) { if (!(k in good)) good[k] = f[k]; });
          if (X.cond(r.when, good)) continue;
        }
        var s1 = X.hash(r.id + JSON.stringify(bad)), s2 = X.hash(r.id + "+" + JSON.stringify(good));
        if (sig[s1]) continue; sig[s1] = 1;
        var cBad = { id: "sy_" + s1.toString(36), kind: "synth", plant: r.id, title: "خطای کاشته‌شده: " + r.fa, dom: "سناریوی ساختگی", year: 0, grp: "sy_" + s1.toString(36),
          story: "سناریوی ساختگی برای آزمودن سیم‌کشی قاعده «" + r.fa + "». " + describe(bad), claims: [{ id: "k1", txt: "تصدیق ساختگی", role: "اصلی", f: bad, truth: null }],
          truth: { ok: false, fail: [r.st], why: "خطای کاشته‌شده (" + (r.err || r.fa) + ")", right: r.fix || "" } };
        var resB = X.runCase(cBad, cfg); if (!resB.flagged.length && r.eff === "flag" && wOf(cfg, r) < cfg.th) continue;
        out.push(cBad);
        if (!sig[s2]) {
          sig[s2] = 1;
          var cGood = { id: "sy_" + s2.toString(36), kind: "synth", plant: r.id, twin: true, title: "همزاد سالم: " + r.fa, dom: "سناریوی ساختگی", year: 0, grp: "sy_" + s2.toString(36),
            story: "همزاد سالم همان سناریو (شرط خطا برداشته شده یا اطمینان هم‌اندازه سقف). " + describe(good), claims: [{ id: "k1", txt: "تصدیق ساختگی", role: "اصلی", f: good, truth: null }],
            truth: { ok: true, fail: [], why: "همزاد بدون خطای کاشته", right: "" } };
          if (X.runCase(cGood, X.DEFAULT_CFG()).healthy) out.push(cGood);
        }
      }
    });
    return out;
  };
  /* کنترل منفی: جابه‌جا کردن تصادفی برچسب‌های حقیقت میان پرونده‌ها */
  X.shuffleTruth = function (cases, seed) {
    var R = rng(seed), T = cases.map(function (c) { return c.truth; });
    for (var i = T.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)); var x = T[i]; T[i] = T[j]; T[j] = x; }
    return cases.map(function (c, i) { var o = {}; for (var k in c) o[k] = c[k]; o.truth = T[i]; return o; });
  };

  /* ---------- بهینه‌ساز: فقط شدت قاعده‌ها، فقط روی درون‌نمونه، هدف = کران پایین ویلسون ---------- */
  X.optimize = function (IS, base, opt) {
    opt = opt || {}; base = base || X.DEFAULT_CFG();
    var R = rng(opt.seed || 7), evals = 0;
    var active = {}; IS.forEach(function (cs) { (cs.claims || []).forEach(function (k) { rulesFor(base).forEach(function (r) { if (X.cond(r.when, k.f || {})) active[r.id] = (active[r.id] || 0) + 1; }); }); });
    var vars = Object.keys(active).sort(function (a, b) { return active[b] - active[a]; });
    var maxVars = Math.max(1, Math.floor(X.split.neffOf(IS) / X.COURT.perVar) - 1);
    vars = vars.slice(0, maxVars);
    var grid = [0, 0.25, 0.5, 0.75, 1], tolGrid = [0, 5, 10, 15, 20, 30];
    function clone(c) { return { w: JSON.parse(JSON.stringify(c.w || {})), tol: c.tol, th: c.th, books: c.books, name: c.name }; }
    function score(c) { evals++; var e = X.evaluate(IS, c); return e.lb + 1e-4 * e.score; }
    var best = clone(base), bestS = score(best);
    for (var rs = 0; rs < (opt.restarts || 3); rs++) {
      var cur = rs === 0 ? clone(best) : clone(base), curS = score(cur);
      if (rs > 0) vars.forEach(function (id) { if (R() < 0.3) cur.w[id] = grid[Math.floor(R() * grid.length)]; });
      curS = score(cur);
      for (var sw = 0; sw < (opt.sweeps || 3); sw++) {
        var improved = false;
        var order = vars.slice(); for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; }
        order.forEach(function (id) {
          var keep = cur.w[id];
          grid.forEach(function (g) { var old = cur.w[id]; cur.w[id] = g; var s = score(cur); if (s > curS + 1e-9) { curS = s; improved = true; } else cur.w[id] = old; });
          if (cur.w[id] === 1) delete cur.w[id]; else if (cur.w[id] == null) cur.w[id] = keep;
        });
        tolGrid.forEach(function (tv) { var old = cur.tol; cur.tol = tv; var s = score(cur); if (s > curS + 1e-9) { curS = s; improved = true; } else cur.tol = old; });
        if (!improved) break;
      }
      if (curS > bestS) { best = clone(cur); bestS = curS; }
    }
    best.name = "تنظیم بهینه‌شده روی دوره قدیم";
    return { cfg: best, evals: evals, vars: vars, nVars: vars.length + 1 };
  };
  X.split.neffOf = function (cases) { var g = {}; cases.forEach(function (c) { g[c.grp || c.id] = 1; }); return Object.keys(g).length; };

  /* ---------- دادگاه ---------- */
  X.court = function (cases, cfg, meta) {
    meta = meta || {}; var C = X.COURT;
    var sp = X.split(cases);
    var nVars = meta.nVars || 0, evals = meta.evals || 1;
    var bump = nVars ? Math.min(C.bumpCap, Math.max(0, C.bumpPerDecade * Math.log(evals / C.bumpBase) / Math.LN10)) : 0;
    var floor = C.floor + bump;
    var minIS = Math.max(C.minIS, Math.ceil(C.perVar * nVars)), minOOS = Math.max(C.minOOSAbs, Math.ceil(C.minOOSFrac * minIS));
    var eIS = X.evaluate(sp.IS, cfg, { rows: true }), eO = X.evaluate(sp.OOS, cfg, { rows: true }), eB = X.evaluate(sp.book, cfg, { rows: true });
    var syn = X.genSynth(meta.seed || 1, 2, {}, cfg), eP = X.evaluate(syn, cfg, { rows: true });
    var pH = eP.rows.filter(function (x) { return x.fate.kind === "سالم"; }), pF = eP.rows.filter(function (x) { return x.fate.kind === "شکست"; });
    var posF = pF.length ? pF.filter(function (x) { return x.fate.located; }).length / pF.length : 0, posH = pH.length ? pH.filter(function (x) { return x.fate.pass; }).length / pH.length : 0;
    var neg = X.evaluate(X.shuffleTruth(sp.IS.concat(sp.OOS), meta.seed || 3), cfg);
    var crit = [
      { k: "nIS", fa: "حجم دوره قدیم (گروه‌های مستقل)", v: eIS.neff, need: "≥ " + minIS, ok: eIS.neff >= minIS },
      { k: "nOOS", fa: "حجم دوره جدید (گروه‌های مستقل)", v: eO.neff, need: "≥ " + minOOS, ok: eO.neff >= minOOS },
      { k: "is", fa: "امتیاز دوره قدیم", v: eIS.score, need: "≥ " + floor.toFixed(2) + (bump ? " (با جریمه آزمون‌های متعدد +" + bump.toFixed(2) + ")" : ""), ok: eIS.score >= floor },
      { k: "oos", fa: "امتیاز دوره جدید (برون‌نمونه)", v: eO.score, need: "≥ " + (C.oosFrac * floor).toFixed(2), ok: eO.score >= C.oosFrac * floor },
      { k: "sens", fa: "حساسیت برون‌نمونه: شکست‌ها در ایستگاه درست", v: eO.sens, need: "≥ " + C.twoRulers, ok: eO.sens != null && eO.sens >= C.twoRulers },
      { k: "spec", fa: "ویژگی برون‌نمونه: سالم‌ها بی‌پرچم", v: eO.spec, need: "≥ " + C.twoRulers, ok: eO.spec != null && eO.spec >= C.twoRulers },
      { k: "lb", fa: "کران پایین ویلسون ۹۵٪ برون‌نمونه", v: eO.lb, need: "> " + (C.chance + C.cushion).toFixed(2), ok: eO.lb > C.chance + C.cushion },
      { k: "book", fa: "وفاداری به مثال‌های خود جزوه", v: eB.score, need: "≥ " + C.bookFidelity, ok: eB.n === 0 || eB.score >= C.bookFidelity },
      { k: "pos", fa: "کنترل مثبت: خطاهای کاشته‌شده در ایستگاه درست", v: posF, need: "≥ " + C.posCtrl, ok: posF >= C.posCtrl },
      { k: "posH", fa: "کنترل مثبت: همزادهای سالم بی‌پرچم", v: posH, need: "≥ " + C.posCtrl, ok: posH >= C.posCtrl },
      { k: "neg", fa: "کنترل منفی: با برچسب‌های جابه‌جا کران پایین", v: neg.lb, need: "< " + C.negCtrlMaxLB, ok: neg.lb < C.negCtrlMaxLB }
    ];
    var judgeOk = crit.filter(function (c) { return c.k === "pos" || c.k === "posH" || c.k === "neg"; }).every(function (c) { return c.ok; });
    var ok = crit.every(function (c) { return c.ok; });
    return { ok: ok, judgeOk: judgeOk, crit: crit, floor: floor, bump: bump, cutYear: sp.cutYear, IS: eIS, OOS: eO, book: eB, synth: { n: syn.length, posF: posF, posH: posH, rows: eP.rows }, neg: neg, cfg: cfg,
      verdict: !judgeOk ? "داور معتبر نیست: کنترل‌ها رد شدند؛ پیش از هر حکم، سیم‌کشی را درست کن" : ok ? "تأیید: این تنظیم در هر دو دوره و با کنترل‌ها پایدار است" : "رد: دست‌کم یک معیار برقرار نیست (جزئیات در جدول)" };
  };

  /* ---------- ضد نشت برچسب: حذف ویژگی‌های تشخیصی ---------- */
  X.factsOnly = function (cases) {
    return cases.map(function (c) { var o = {}; for (var k in c) o[k] = c[k];
      o.claims = (c.claims || []).map(function (k) { var f = {}; for (var x in (k.f || {})) if (!(W.EPI_FM[x] && W.EPI_FM[x].dx)) f[x] = k.f[x]; var kk = {}; for (var y in k) kk[y] = k[y]; kk.f = f; return kk; });
      return o; });
  };

  /* ---------- کالبدشکافی ---------- */
  X.autopsy = function (rows) {
    var items = [], rs = {};
    rows.forEach(function (x) {
      x.res.claims.forEach(function (r) { r.fired.forEach(function (id) { var s = rs[id] = rs[id] || { fireH: 0, fireF: 0, hit: 0, n: 0 }; s.n++; if (x.fate.kind === "سالم") s.fireH++; else { s.fireF++; if ((x.cs.truth.fail || []).indexOf(X.RM[id] && X.RM[id].st) >= 0) s.hit++; } }); });
      if (x.fate.pass) return;
      var cat, st = [];
      if (x.fate.kind === "سالم") { cat = "هشدار کاذب"; st = x.res.flagged; }
      else if (!x.fate.detected) { cat = "شکست دیده نشد"; st = x.cs.truth.fail || []; }
      else { cat = "مکان‌یابی نادرست"; st = (x.cs.truth.fail || []).concat(x.res.flagged); }
      var culprits = [];
      x.res.claims.forEach(function (r) { r.flags.forEach(function (fl) { fl.rules.forEach(function (id) { if (culprits.indexOf(id) < 0) culprits.push(id); }); }); });
      var gaps = cat === "شکست دیده نشد" ? (x.cs.truth.fail || []).filter(function (s) { return !(W.EPI_RULES || []).some(function (r) { return r.st === s; }); }) : [];
      items.push({ id: x.cs.id, title: x.cs.title, kind: x.cs.kind, cat: cat, st: st, culprits: culprits, gaps: gaps, truthFail: x.cs.truth.fail || [], flagged: x.res.flagged,
        hint: cat === "هشدار کاذب" ? "قاعده(های) " + culprits.join("، ") + " روی فرایندی سالم فعال شد: یا قاعده از حکم جزوه گسترده‌تر پیاده شده، یا جزوه در این مورد سخت‌گیر است، یا پرونده نادرست رمزگذاری شده."
          : cat === "شکست دیده نشد" ? (gaps.length ? "در ایستگاه(های) " + gaps.join("، ") + " هیچ قاعده‌ای نیست (خلأ پیاده‌سازی یا ویژگی رمزگذاری‌نشدنی)." : "قاعده‌های ایستگاه شکست فعال نشدند: یا ویژگی لازم رمزگذاری نشده، یا شرط قاعده تنگ‌تر از حکم جزوه است، یا سقف قاعده بالاتر از اطمینان کنشگر است.")
          : "خطا دیده شد ولی ایستگاهش با برچسب حقیقت نمی‌خواند: ترتیب خط تولید، سقف‌های رقیب یا برچسب پرونده را بررسی کن." });
    });
    return { items: items, rules: rs };
  };

  /* ---------- پاکت‌ها: اعتبار هر حوزه در هر دو دوره (فقط گزارش؛ هیچ پاکتی بی‌دادگاه مسلح نمی‌شود) ---------- */
  X.pockets = function (cases, cfg) {
    var sp = X.split(cases), doms = {};
    sp.IS.concat(sp.OOS).forEach(function (c) { doms[c.dom] = 1; });
    return Object.keys(doms).map(function (d) {
      var a = X.evaluate(sp.IS.filter(function (c) { return c.dom === d; }), cfg), b = X.evaluate(sp.OOS.filter(function (c) { return c.dom === d; }), cfg);
      var lab = a.neff < 6 || b.neff < 3 ? "نمونه ناکافی" : a.score >= X.COURT.floor && b.score >= X.COURT.oosFrac * X.COURT.floor ? "معتبر در هر دو دوره" : a.score < 0.5 && b.score < 0.5 ? "اجتناب: سامانه در این حوزه ضعیف است" : a.score >= X.COURT.floor ? "تله بیش‌برازش: فقط در دوره قدیم" : b.score >= X.COURT.oosFrac * X.COURT.floor ? "فقط دوره جدید (پذیرفته نیست)" : "ضعیف";
      return { dom: d, IS: a, OOS: b, label: lab };
    });
  };

  /* ---------- چرخه دوره‌ای (رادار): بدون جست‌وجو، دستور منجمد + تنظیم قفل‌شده روی پرونده‌های تازه ---------- */
  X.cycle = function (state, cases, nowISO) {
    state = state || {}; var C = X.COURT;
    var seed = X.hash(nowISO + ":" + (state.runs || 0));
    var seen = {}; (state.sigs || []).forEach(function (s) { seen[s] = 1; });
    var fresh = X.genSynth(seed, 1, seen, X.DEFAULT_CFG());
    var eFresh = X.evaluate(fresh, X.DEFAULT_CFG());
    var real = cases.filter(function (c) { return c.kind !== "synth" && c.status !== "pending"; });
    var t3 = X.three(real, X.DEFAULT_CFG(), seed);
    var rep = { at: nowISO, seed: seed, fresh: { n: fresh.length, score: eFresh.score },
      a: { ok: t3.a.ok && eFresh.score >= X.T.a.synth, book: t3.a.bookScore, nBad: t3.a.bad.length },
      b: { ok: t3.b.ok, agree: t3.b.agree, lb: t3.b.lb, sens: t3.b.sens, spec: t3.b.spec, nDis: t3.b.disagree.length, n: t3.b.neff },
      c: { n: t3.c.neff, agree: t3.c.agree, enough: t3.c.enough }, decay: null,
      recipe: { ok: t3.a.ok && t3.b.ok, is: t3.b.halves.old, oos: t3.b.halves.neu, lb: t3.b.lb, book: t3.a.bookScore } };
    if (state.locked && state.lockedCfg) {
      var since = real.filter(function (c) { return (c.addedAt || "") > (state.lockedAt || ""); });
      if (since.length >= C.decayMin) { var e = X.evaluate(since, state.lockedCfg); rep.decay = { n: since.length, score: e.score, lb: e.lb, fail: e.score < C.oosFrac * C.floor }; }
      else rep.decay = { n: since.length, wait: true };
    }
    var sigs = (state.sigs || []).concat(Object.keys(seen)).slice(-4000);
    return { report: rep, sigs: sigs };
  };

  /* ===================== سه آزمون (جایگزین دادگاه تک‌مرحله‌ای) =====================
     آزمون ۱ — وفاداری کارخانه به جزوه: محک = حکم‌های خود جزوه (مثال‌ها) + خطاهای کاشته. هر اختلاف = خطای سازنده.
     آزمون ۲ — جزوه در برابر تاریخ: محک مستقل از جزوه = سرانجام واقعی هر ادعا + داوری خود رشته درباره روش کنشگر.
               فقط وقتی معنا دارد که آزمون ۱ قبول شده باشد؛ آنگاه اختلاف‌ها «پرسش از جزوه» یا «خطای رمزگذاری»‌اند.
     آزمون ۳ — وقایع جاری: داوری پیش از معلوم شدن نتیجه، سنجش پس از آن (بی‌دانش پسینی). همیشه بر آزمون ۲ مقدم است.
     هیچ وزنی خودکار تنظیم نمی‌شود: قاعده‌ها همان‌اند که جزوه گفته. */
  X.T = { a: { book: 1.0, synth: 0.95 }, b: { agree: 0.75, rulers: 0.6, z: 1.96, minN: 30 }, c: { minN: 20 } };
  X.testA = function (cases, cfg, seed) {
    cfg = cfg || X.DEFAULT_CFG();
    var book = cases.filter(function (c) { return c.kind === "booklet"; });
    var eB = X.evaluate(book, cfg, { rows: true });
    var syn = X.genSynth(seed || 1, 2, {}, cfg), eS = X.evaluate(syn, cfg, { rows: true });
    var sF = eS.rows.filter(function (x) { return x.fate.kind === "شکست"; }), sH = eS.rows.filter(function (x) { return x.fate.kind === "سالم"; });
    var posF = sF.length ? sF.filter(function (x) { return x.fate.located; }).length / sF.length : 1, posH = sH.length ? sH.filter(function (x) { return x.fate.pass; }).length / sH.length : 1;
    var bad = eB.rows.filter(function (x) { return !x.fate.pass; }).concat(eS.rows.filter(function (x) { return !x.fate.pass; }));
    var ok = eB.score >= X.T.a.book && posF >= X.T.a.synth && posH >= X.T.a.synth;
    return { ok: ok, book: eB, nBook: book.length, bookScore: eB.score, synthN: syn.length, posF: posF, posH: posH, bad: bad };
  };
  function fieldOf(c) {
    var F = W.EPI_FIELD || {};
    if (c.field) { var o = c.out; if (!o) { o = {}; (c.claims || []).forEach(function (k) { o[k.id] = k.truth === true || k.truth === false ? k.truth : null; }); } return { field: c.field, out: o }; }
    return F[c.id] || null;
  }
  X.fieldOf = fieldOf;
  /* داوری موتور در برابر محک مستقل */
  X.testB = function (cases, cfg) {
    cfg = cfg || X.DEFAULT_CFG();
    var rows = [], claimsR = [];
    cases.filter(function (c) { return c.kind !== "booklet" && c.kind !== "synth" && c.kind !== "forward"; }).forEach(function (c) {
      var fl = fieldOf(c); if (!fl) return;
      var r = X.runCase(c, cfg);
      if (fl.field && (fl.field.ok === true || fl.field.ok === false)) rows.push({ cs: c, res: r, ok: fl.field.ok, basis: fl.field.basis, agree: r.healthy === fl.field.ok });
      (c.claims || []).forEach(function (k, i) { var o = fl.out ? fl.out[k.id] : null; if (o === true || o === false) claimsR.push({ cs: c, k: k, r: r.claims[i], out: o }); });
    });
    var g = {}; rows.forEach(function (x) { var k = x.cs.grp || x.cs.id; (g[k] = g[k] || []).push(x.agree ? 1 : 0); });
    var gk = Object.keys(g), neff = gk.length, p = neff ? gk.reduce(function (a, k) { return a + g[k].reduce(function (s, v) { return s + v; }, 0) / g[k].length; }, 0) / neff : 0;
    var flawed = rows.filter(function (x) { return !x.ok; }), sound = rows.filter(function (x) { return x.ok; });
    var sens = flawed.length ? flawed.filter(function (x) { return !x.res.healthy; }).length / flawed.length : null;
    var spec = sound.length ? sound.filter(function (x) { return x.res.healthy; }).length / sound.length : null;
    /* تمایز سرانجام: ادعایی که موتور پرچم زده، بیشتر نادرست درآمده؟ */
    var fl1 = claimsR.filter(function (x) { return x.r.flags.length; }), fl0 = claimsR.filter(function (x) { return !x.r.flags.length; });
    var pf1 = fl1.length ? fl1.filter(function (x) { return !x.out; }).length / fl1.length : null, pf0 = fl0.length ? fl0.filter(function (x) { return !x.out; }).length / fl0.length : null;
    var base = claimsR.length ? claimsR.filter(function (x) { return x.out; }).length / claimsR.length : 0;
    var bs = 0, bb = 0; claimsR.forEach(function (x) { var c = x.r.ceil / 100, o = x.out ? 1 : 0; bs += (c - o) * (c - o); bb += (base - o) * (base - o); });
    /* پایداری در دو نیمه زمانی */
    var ys = rows.map(function (x) { return +x.cs.year || 0; }).sort(function (a, b) { return a - b; }), mid = ys.length ? ys[Math.floor(ys.length / 2)] : 0;
    function agr(arr) { return arr.length ? arr.filter(function (x) { return x.agree; }).length / arr.length : null; }
    var old = rows.filter(function (x) { return (+x.cs.year || 0) < mid; }), neu = rows.filter(function (x) { return (+x.cs.year || 0) >= mid; });
    var lb = X.wilson(p, neff, X.T.b.z);
    var ok = neff >= X.T.b.minN && p >= X.T.b.agree && sens != null && sens >= X.T.b.rulers && spec != null && spec >= X.T.b.rulers && lb > 0.5;
    return { ok: ok, n: rows.length, neff: neff, agree: p, lb: lb, sens: sens, spec: spec, rows: rows,
      disagree: rows.filter(function (x) { return !x.agree; }),
      claims: { n: claimsR.length, pFalseFlagged: pf1, nFlagged: fl1.length, pFalseUnflagged: pf0, nUnflagged: fl0.length, brier: claimsR.length ? bs / claimsR.length : null, brierBase: claimsR.length ? bb / claimsR.length : null, base: base },
      halves: { mid: mid, old: agr(old), nOld: old.length, neu: agr(neu), nNew: neu.length } };
  };
  /* حساسیت هر قاعده: اگر این قاعده نبود، هم‌خوانی با محک مستقل چه می‌شد؟ (فقط گزارش؛ چیزی را عوض نمی‌کند) */
  X.ruleSensitivity = function (cases, cfg) {
    cfg = cfg || X.DEFAULT_CFG(); var base = X.testB(cases, cfg);
    return (W.EPI_RULES || []).map(function (r) {
      var c2 = { w: JSON.parse(JSON.stringify(cfg.w || {})), tol: cfg.tol, th: cfg.th, books: cfg.books }; c2.w[r.id] = 0;
      var t = X.testB(cases, c2);
      var fires = base.rows.filter(function (x) { return x.res.claims.some(function (k) { return k.fired.indexOf(r.id) >= 0; }); });
      var fpSound = fires.filter(function (x) { return x.ok; }).length, hitFlawed = fires.filter(function (x) { return !x.ok; }).length;
      return { id: r.id, dAgree: t.agree - base.agree, dSens: (t.sens || 0) - (base.sens || 0), dSpec: (t.spec || 0) - (base.spec || 0), fires: fires.length, onSound: fpSound, onFlawed: hitFlawed };
    }).sort(function (a, b) { return b.dAgree - a.dAgree; });
  };
  X.testC = function (cases, cfg) {
    var fw = cases.filter(function (c) { return c.kind === "forward" && c.status !== "pending"; });
    var t = X.testB(fw.map(function (c) { var o = {}; for (var k in c) o[k] = c[k]; o.kind = "real"; return o; }), cfg);
    /* محک آزمون ۳ فقط سرانجام واقعی ادعاهاست: آیا ادعای پرچم‌خورده بیشتر نادرست درآمد و سقف‌ها از نرخ پایه دقیق‌ترند؟ */
    var cl = t.claims; t.neff = cl.n; t.enough = cl.n >= X.T.c.minN;
    t.agree = cl.n ? 1 - cl.brier : null;
    t.ok = t.enough && cl.brier < cl.brierBase && (cl.pFalseFlagged == null || cl.pFalseUnflagged == null || cl.pFalseFlagged > cl.pFalseUnflagged);
    return t;
  };
  X.three = function (cases, cfg, seed) {
    var a = X.testA(cases, cfg, seed), b = X.testB(cases, cfg), c = X.testC(cases, cfg);
    return { a: a, b: b, c: c, at: new Date().toISOString() };
  };

  X.index = function () { X.RM = {}; (W.EPI_RULES || []).forEach(function (r) { X.RM[r.id] = r; }); };
  X.index();
  /* همه پرونده‌های بذر (وقایع، مثال‌های جزوه، مسائل) */
  X.seedCases = function () {
    var out = (W.EPI_CASES || []).slice();
    (W.EPI_PROBLEMS || []).forEach(function (p) { (p.cases || []).forEach(function (c) { if (!c.kind) c.kind = "problem"; out.push(c); }); });
    out.forEach(function (c) { if (!c.status) c.status = "approved"; });
    return out;
  };
})(typeof window !== "undefined" ? window : globalThis);
