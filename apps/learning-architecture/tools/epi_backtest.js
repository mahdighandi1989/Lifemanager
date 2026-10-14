#!/usr/bin/env node
/* ===== بک‌تستِ پیوستهٔ کارخانهٔ معرفت‌شناسی — اجراکنندهٔ قطعی (بی هوش مصنوعی) =====
   مالک (۲۰۲۶-۱۰-۱۳): «بک‌تست باید همیشه ادامه داشته باشد … مثلِ بک‌تستِ ترید کوانتومی … هوش مصنوعی فقط سازنده است».
   مفهومِ انتزاع‌شده از ترید کوانتومی (نه تقلید): ساختار ثابت و نسخه‌دار است (جزوه ⇒ سالن/ایستگاه = «تونل»، قاعده = «باکس»،
   سقف = «وزن»)؛ ماده دائم بزرگ می‌شود و هرگز تکرار نمی‌شود (پیکرهٔ وقایع)؛ داوری قطعی است؛ هر دور یک ردیف در دفتر؛ هر نقص یک
   «یافته» با علت و سرانجام؛ اصلاح فقط با آزمونِ دوباره روی موادِ «تازه» (نه همان مورد) پذیرفته می‌شود؛ کنترلِ منفی و مثبت
   خودِ آزمون را می‌آزمایند.

     node tools/epi_backtest.js status            # پیکره، پوشش و شکاف‌ها (راهنمای گردآوریِ دورِ بعد)
     node tools/epi_backtest.js add <file.json>   # افزودنِ وقایعِ تازه (اعتبارسنجی + ردِ تکراری) به پیکره
     node tools/epi_backtest.js run [--note "…"]  # یک دور: اجرا، دفتر، یافته‌ها، جزوهٔ متقن
     node tools/epi_backtest.js check             # فقط می‌سنجد که خروجی‌ها با پیکره هم‌خوان‌اند (دروازهٔ ادغام)

   فایل‌ها (همه در git — تاریخچهٔ کامل):
     backtest/corpus/*.json    پیکرهٔ افزوده‌شده در دورها (وقایعِ واقعی و سناریوهای انتزاعیِ هم‌ریختِ آن‌ها)
     backtest/ledger.json      دفترِ دورها (روند)
     backtest/findings.json    یافته‌ها: هشدارِ سلامت، شکستِ دیده‌نشده، جای نادرست — با علت، اصلاح و آزمونِ دوباره
     backtest/results.json     حکمِ آخرین دور برای هر واقعه (صفحه نشانش می‌دهد)
     docs/VERIFIED_BOOKLET.md  «جزوهٔ متقن»: هر بخشِ جزوه با وضعِ آزموده‌شدنش، خطاها و اصلاح‌ها */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const APP = path.join(ROOT, "src", "app");
const BT = process.env.EPI_BT_DIR ? path.resolve(process.env.EPI_BT_DIR) : path.join(ROOT, "backtest");
const CORPUS = path.join(BT, "corpus");
const SAMPLES = path.join(BT, "samples");   // نمونه‌های بی‌گزینش برای سنجشِ مقدارهای پایه (گامِ ۲)
const P = { ledger: path.join(BT, "ledger.json"), findings: path.join(BT, "findings.json"), results: path.join(BT, "results.json"),
  foundation: path.join(BT, "foundation.json"), proposals: path.join(BT, "proposals.json"), territory: path.join(BT, "territory.json"),
  reviews: path.join(BT, "reviews"), territoryDoc: process.env.EPI_BT_DIR ? path.join(BT, "TERRITORY.md") : path.join(ROOT, "docs", "TERRITORY.md"),
  verified: process.env.EPI_BT_DIR ? path.join(BT, "VERIFIED_BOOKLET.md") : path.join(ROOT, "docs", "VERIFIED_BOOKLET.md") };

/* ---------- موتور (همان فایل‌هایی که صفحه اجرا می‌کند) ---------- */
global.window = global;
for (const f of ["epi_feat", "epi_rules", "epi_cases_a", "epi_cases_b", "epi_problems", "epi_problems_b", "epi_field", "epi_blind",
  "epi_engine", "epi_found", "epi_territory", "epi_bt_core", "epi_book", "epi_core", "epi_st_a", "epi_st_b", "epi_st_c", "epi_st_d"]) require(path.join(APP, f + ".js"));
const X = global.EPIX, FM = global.EPI_FM, PIPE = global.EPI_PIPE, BOOK = global.EPI_BOOK, RULES = global.EPI_RULES;
const ST = {}; (global.EPI_ST || []).forEach((s) => { ST[s.id] = s; });
const BOOKS = (global.EPI_BT.BOOKS || []).map((b) => b.id);
const ATTR = global.EPI_BT.ATTR;

const rd = (p, d) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { return d; } };
const wr = (p, o) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(o, null, 1) + "\n"); };
const norm = (s) => String(s || "").toLowerCase().replace(/[\s‌«»"'`.,،؛;:!?؟()\[\]{}\-–—]/g, "");
const sigOf = (c) => crypto.createHash("sha256").update(norm(c.title) + "|" + (c.year || "") + "|" + (c.claims || []).map((k) => norm(k.txt)).join("|")).digest("hex").slice(0, 16);

/* ---------- پیکره: بذر (۱۶۹ واقعه/مثال/مسئله) + افزوده‌های هر دور ---------- */
function corpusFiles() { try { return fs.readdirSync(CORPUS).filter((f) => /\.json$/.test(f)).sort(); } catch (e) { return []; } }
function loadCorpus() {
  const seed = X.seedCases().map((c) => Object.assign({}, c, { tier: c.kind === "booklet" ? "booklet" : c.kind === "problem" ? "problem" : "real", round: 0, books: c.books || ["mesbah"] }));
  const added = [];
  // مالک واقعه‌ای را «رد» کرده (excluded) ⇒ از هر دورِ بعد بیرون؛ خودِ مورد با دلیلش در فایل می‌ماند (تاریخچه)
  for (const f of corpusFiles()) for (const c of rd(path.join(CORPUS, f), [])) if (!c.excluded) added.push(c);
  return seed.concat(added);
}

/* ---------- نمونه‌های بی‌گزینش (گامِ ۲): هر «قاب» = یک مجموعهٔ از پیش معین، همه‌اش، بی‌توجه به سرانجام ---------- */
function sampleFiles() { try { return fs.readdirSync(SAMPLES).filter((f) => /\.json$/.test(f)).sort(); } catch (e) { return []; } }
function loadSamples() { const out = []; for (const f of sampleFiles()) for (const sm of rd(path.join(SAMPLES, f), [])) if (!sm.excluded) out.push(sm); return out; }
/* مقدارهای پایه را از نمونه‌ها می‌سازد و در موتور می‌گذارد (پیش از هر داوری) — فرمول قضیه است، داده واقعیت */
function applyBase() {
  const FD = global.EPI_FOUND, m = FD.measure(loadSamples()), v = {};
  Object.keys(m).forEach((b) => { v[b] = m[b].p; });
  FD.BASEVAL = v; return m;
}
function validateFrame(sm, seen) {
  const e = [];
  if (!sm || typeof sm !== "object") return ["ساختار نادرست"];
  if (!sm.id) e.push("id لازم است");
  if (!sm.frame || String(sm.frame).length < 20) e.push("frame: قابِ از پیش معین را دقیق بنویس (چه مجموعه‌ای، چه بازه‌ای، چرا همه‌اش)");
  if (!Array.isArray(sm.src) || !sm.src.length) e.push("src: منبعِ خودِ قاب لازم است");
  if (sm.selected_by_outcome !== false) e.push("selected_by_outcome باید صریحاً false باشد (قاب بی‌توجه به سرانجام برداشته شده)");
  if (!Array.isArray(sm.items) || !sm.items.length) e.push("دست‌کم یک مورد");
  const ids = new Set();
  (sm.items || []).forEach((it, i) => {
    if (!it.id || ids.has(it.id)) e.push("موردِ " + i + ": id یکتا لازم است"); ids.add(it.id);
    if (!it.txt) e.push("موردِ " + it.id + ": متن");
    if (typeof it.truth !== "boolean") e.push("موردِ " + it.id + ": truth باید true/false باشد (نامعلوم ⇒ کلاً کنار بگذار، نه حدس)");
    if (!Array.isArray(it.verified_by) || !it.verified_by.length) e.push("موردِ " + it.id + ": verified_by (سند/تواتر/حسِ کنترل‌شده‌ای که درستی را احراز کرد)");
    Object.keys(it.f || {}).forEach((key) => { const d = FM[key], v = it.f[key];
      if (!d) e.push("ویژگیِ ناشناخته: " + key); else if (d.t === "enum" && d.v.indexOf(v) < 0) e.push("مقدارِ نادرست " + key + "=" + v); });
  });
  if (seen && seen.has(sm.id)) e.push("قابِ تکراری: " + sm.id);
  return e;
}
function addSamples(file) {
  const items = rd(file, null); if (!Array.isArray(items)) { console.error("فایل باید آرایهٔ JSON باشد"); process.exit(2); }
  const seen = new Set(loadSamples().map((s) => s.id)), ok = [], bad = [];
  const ledger = rd(P.ledger, { rounds: [] }); const round = (ledger.rounds.length ? ledger.rounds[ledger.rounds.length - 1].round : 0) + 1;
  items.forEach((sm) => { const e = validateFrame(sm, seen); if (e.length) bad.push({ id: sm && sm.id, errors: e }); else { sm.round = round; ok.push(sm); seen.add(sm.id); } });
  if (ok.length) { const out = path.join(SAMPLES, "round-" + String(round).padStart(4, "0") + ".json"); wr(out, rd(out, []).concat(ok)); }
  return { round, added: ok.length, rejected: bad };
}
/* ---------- قلمرو: نقشهٔ کاملِ معرفت‌شناسی و پیشرفتِ گام‌به‌گامِ هر حوزه (مالک ۲۰۲۶-۱۰-۱۴) ----------
   گام‌ها (EPI_TERR.STAGES): ۰ نقشه‌شده ⇒ ۱ منابع ⇒ ۲ گزاره‌ها ⇒ ۳ رده‌بندی بر پایهٔ بدیهیات ⇒ ۴ قاعده یا مرز ⇒ ۵ تثبیت (فقط ابزار).
   هر به‌روزرسانی فقط یک گام جلو، با شاهد؛ اعتبارسنجی قطعی است و تاریخچه هرگز پاک نمی‌شود. */
function terrAreas() { const T = global.EPI_TERR || {}, out = []; (T.groups || []).forEach((g) => (g.areas || []).forEach((a) => out.push(Object.assign({ group: g.id, groupFa: g.fa }, a)))); return out; }
function terrState() { return rd(P.territory, { areas: {} }); }
/* حوزه‌هایی که جزوه پوشش داده: قاعده‌هایشان (روی همان بخش‌ها) و رده‌بندیِ قضیه‌ایِ هر قاعده (EPI_FOUND.DER) خودبه‌خود گامِ ۴ را می‌سازد */
function bookSeed(a) {
  const FD = global.EPI_FOUND, secs = a.book || []; if (!secs.length) return null;
  const rules = RULES.filter((r) => (r.sec || []).some((x) => secs.indexOf(x) >= 0));
  if (!rules.length) return null;
  const claims = rules.map((r) => { const d = FD.DER[r.id] || {};
    return { txt: r.fa, rule: r.id, kind: r.eff === "flag" ? "theorem" : d.k === "S" ? "base" : "theorem", th: r.eff === "flag" ? "A0" : d.th, base: d.base || undefined, src: "جزوه " + (r.sec || []).join(",") }; });
  return { stage: 4, claims, rules: rules.map((r) => r.id), sources: ["جزوهٔ معرفت‌شناسی (مصباح) " + secs.join("، ")], seeded: true, bookOnly: true };
}
function validateTerr(u, cur, round) {
  const e = [], FD = global.EPI_FOUND, T = global.EPI_TERR, area = terrAreas().find((a) => a.id === u.area);
  if (!area) return ["حوزهٔ ناشناخته: " + u.area];
  const st = (cur && cur.stage) || 0, to = u.stage;
  /* «گسترش»: حوزه‌ای که فقط بخشِ جزوه‌اش پوشش دارد، از ادبیاتِ بیرون از جزوه کامل می‌شود — همان شاهدهای گام‌های ۱ تا ۴ در یک بسته */
  if (u.widen) {
    if (!(cur && cur.bookOnly)) return ["گسترش فقط برای حوزهٔ «فقط بخشِ جزوه»"];
    if (!u.what || String(u.what).length < 15) e.push("what: چه کردی، دقیق");
    if (!((u.sources || []).length >= 2 && u.sources.every((x) => /\S{6,}/.test(String(x))))) e.push("گسترش: دست‌کم دو منبعِ واقعیِ بیرون از جزوه");
    const cl = u.claims || [];
    if (cl.length < 3) e.push("گسترش: دست‌کم سه گزارهٔ محوریِ تازه از ادبیات");
    cl.forEach((c, i) => {
      if (!c.txt || !c.src) e.push("گزارهٔ " + i + ": متن و منبع");
      if (["theorem", "base", "outside"].indexOf(c.kind) < 0) e.push("گزارهٔ " + i + ": kind");
      if (c.kind === "theorem" && !(FD.TH[c.th] || FD.AX.some((a) => a.id === c.th) || (c.proof && c.proof.text && (c.proof.from || []).length && c.proof.from.every((x) => FD.TH[x] || FD.AX.some((a) => a.id === x))))) e.push("گزارهٔ " + i + ": قضیهٔ موجود یا برهان از اصولِ موجود");
      if (c.kind === "base" && !(FD.BASE[c.base] || (c.base_new && c.base_new.fa && c.base_new.select))) e.push("گزارهٔ " + i + ": مقدارِ پایه");
      if (c.kind === "outside" && !(c.why && c.why.length >= 25)) e.push("گزارهٔ " + i + ": دلیلِ «بیرون از قلمرو»");
    });
    const P0 = rd(P.proposals, { proposals: [] }).proposals || [];
    if ((u.rules || []).some((id) => !X.RM[id] && !P0.some((p) => p.id === id))) e.push("گسترش: قاعدهٔ موجود یا پیشنهادِ ثبت‌شده");
    if (cl.some((c) => c.kind !== "outside") && !(u.rules || []).length) e.push("گسترش: گزاره‌های قضیه‌ای قاعده (موجود/پیشنهاد) می‌خواهند");
    return e;
  }
  if (to !== st + 1) e.push("فقط یک گام جلو: اکنون " + st + "، درخواست " + to);
  if (to >= 5) e.push("گامِ ۵ (تثبیت) را فقط خودِ ابزار با وقایعِ تازه می‌دهد");
  if (!u.what || String(u.what).length < 15) e.push("what: چه کردی، دقیق");
  if (to === 1 && !((u.sources || []).length >= 2 && u.sources.every((x) => /\S{6,}/.test(String(x))))) e.push("گامِ ۱: دست‌کم دو منبعِ واقعی (عنوان و پیوند/ارجاع)");
  if (to === 2 && !((u.claims || []).length >= 3 && u.claims.every((c) => c.txt && c.txt.length >= 10 && c.src))) e.push("گامِ ۲: دست‌کم سه گزارهٔ محوری، هر کدام با منبع (src)");
  if (to === 3) {
    const cl = u.claims || (cur && cur.claims) || [];
    if (!cl.length) e.push("گامِ ۳: گزاره‌ها لازم‌اند");
    cl.forEach((c, i) => {
      if (["theorem", "base", "outside"].indexOf(c.kind) < 0) e.push("گزارهٔ " + i + ": kind باید theorem|base|outside باشد");
      if (c.kind === "theorem" && !(FD.TH[c.th] || FD.AX.some((a) => a.id === c.th) || (c.proof && c.proof.from && c.proof.from.length && c.proof.text))) e.push("گزارهٔ " + i + ": قضیه باید یکی از EPI_FOUND.TH/AX باشد یا proof {text, from:[اصول/قضیه‌های موجود]} داشته باشد");
      if (c.kind === "theorem" && c.proof && (c.proof.from || []).some((x) => !FD.TH[x] && !FD.AX.some((a) => a.id === x))) e.push("گزارهٔ " + i + ": برهان فقط از اصول/قضیه‌های موجود");
      if (c.kind === "base" && !(FD.BASE[c.base] || (c.base_new && c.base_new.fa && c.base_new.select))) e.push("گزارهٔ " + i + ": مقدارِ پایه باید موجود باشد یا base_new {fa, select} بیاید");
      if (c.kind === "outside" && !(c.why && c.why.length >= 25)) e.push("گزارهٔ " + i + ": «بیرون از قلمروِ قطعی» دلیلِ روشن می‌خواهد (چرا به اصول برنمی‌گردد)");
    });
  }
  if (to === 4) {
    const cl = (cur && cur.claims) || [], th = cl.filter((c) => c.kind !== "outside");
    const P0 = rd(P.proposals, { proposals: [] }).proposals || [];
    const ok = (u.rules || []).every((id) => X.RM[id] || P0.some((p) => p.id === id));
    if (th.length && !(u.rules || []).length) e.push("گامِ ۴: برای گزاره‌های قضیه‌ای قاعده (موجود) یا شناسهٔ پیشنهادِ ثبت‌شده در proposals.json لازم است");
    if (!ok) e.push("گامِ ۴: هر شناسه باید قاعدهٔ موجود یا پیشنهادِ ثبت‌شده باشد");
    if (!th.length && !(u.boundary && u.boundary.length >= 30)) e.push("گامِ ۴: همهٔ گزاره‌ها بیرون‌اند ⇒ مرز (boundary) را روشن بنویس");
  }
  return e;
}
function applyTerritory(file) {
  const items = rd(file, null); if (!Array.isArray(items)) { console.error("فایل باید آرایهٔ JSON باشد"); process.exit(2); }
  const S0 = terrState(), ledger = rd(P.ledger, { rounds: [] }), round = (ledger.rounds.length ? ledger.rounds[ledger.rounds.length - 1].round : 0) + 1;
  const today = new Date().toISOString().slice(0, 10), ok = [], bad = [];
  items.forEach((u) => {
    const cur = S0.areas[u.area] || { stage: 0, history: [] }, e = validateTerr(u, cur, round);
    if (e.length) { bad.push({ area: u.area, errors: e }); return; }
    let nx;
    if (u.widen) {
      nx = Object.assign({}, cur, { bookOnly: false, sources: (cur.sources || []).concat(u.sources), claims: (cur.claims || []).concat(u.claims), rules: Array.from(new Set((cur.rules || []).concat(u.rules || []))) });
      nx.history = (cur.history || []).concat([{ round, at: today, stage: cur.stage, what: "گسترش از ادبیاتِ بیرون از جزوه: " + u.what, by: u.by || "ناظرِ بک‌تست" }]);
    } else {
      nx = Object.assign({}, cur, { stage: u.stage });
      if (u.sources) nx.sources = u.sources; if (u.claims) nx.claims = u.claims; if (u.rules) nx.rules = u.rules; if (u.boundary) nx.boundary = u.boundary;
      nx.history = (cur.history || []).concat([{ round, at: today, stage: u.stage, what: u.what, by: u.by || "ناظرِ بک‌تست" }]);
    }
    S0.areas[u.area] = nx; ok.push(u.area);
  });
  wr(P.territory, S0);
  return { round, advanced: ok, rejected: bad };
}
/* هر دور: بذرِ حوزه‌های جزوه، تثبیتِ خودکار (گامِ ۵)، آمار، و سندِ زندهٔ TERRITORY.md */
function territoryRound(byCase, round, today) {
  const S0 = terrState(), areas = terrAreas(), advanced = [];
  areas.forEach((a) => {
    let cur = S0.areas[a.id];
    if (!cur) { const sd = bookSeed(a); cur = sd ? Object.assign(sd, { history: [{ round, at: today, stage: 4, what: "پوششِ جزوه: " + sd.rules.length + " قاعدهٔ کارخانه روی بخش‌های " + (a.book || []).join("، ") + "؛ رده‌بندیِ هر قاعده از «مبنای درجه‌ها»", by: "ابزار" }] }) : { stage: 0, history: [] }; S0.areas[a.id] = cur; }
    if (cur.stage === 4 && !cur.bookOnly && (cur.rules || []).length) {
      const since = (cur.history.filter((h) => h.stage === 4).slice(-1)[0] || {}).round || 0;
      const fresh = Object.values(byCase).filter((v) => v.round > since && v.round > 0 && v.fired.some((r) => cur.rules.indexOf(r) >= 0));
      cur.verify = { since, fresh: fresh.length, ok: fresh.filter((v) => v.kind === "ok").length, ids: fresh.slice(0, 10).map((v) => v.id) };
      if (fresh.length >= 3 && cur.verify.ok === fresh.length) { cur.stage = 5; cur.history.push({ round, at: today, stage: 5, what: "تثبیت: " + fresh.length + " واقعهٔ تازه قاعده‌های این حوزه را به کار انداختند، همه درست", by: "ابزار" }); advanced.push(a.id); }
    }
  });
  S0.round = round; S0.updated = today; wr(P.territory, S0);
  const byStage = [0, 0, 0, 0, 0, 0]; areas.forEach((a) => { byStage[(S0.areas[a.id] || {}).stage || 0]++; });
  const movedThisRound = areas.filter((a) => ((S0.areas[a.id] || {}).history || []).some((h) => h.round === round && h.by !== "ابزار" || (h.round === round && h.stage === 5))).map((a) => a.id);
  fs.writeFileSync(P.territoryDoc, territoryMd(S0, areas, round, today));
  return { areas: areas.length, groups: (global.EPI_TERR.groups || []).length, byStage, bookOnly: areas.filter((a) => (S0.areas[a.id] || {}).bookOnly).length, score: areas.reduce((t, a) => t + ((S0.areas[a.id] || {}).stage || 0), 0), max: areas.length * 5, moved: movedThisRound };
}
function territoryMd(S0, areas, round, today) {
  const T = global.EPI_TERR, L = [], ST = T.STAGES;
  L.push("# قلمروِ معرفت‌شناسی — نقشهٔ کامل و پیشرفتِ هر حوزه", "");
  L.push("> این سند را `tools/epi_backtest.js` بعد از هر دور می‌سازد؛ دستی ویرایش نکن. نقشه: `src/app/epi_territory.js`؛ پیشرفت: `backtest/territory.json`.", "");
  const byStage = ST.map((s) => areas.filter((a) => ((S0.areas[a.id] || {}).stage || 0) === s.n).length);
  L.push("**دورِ " + round + " (" + today + "):** " + areas.length + " حوزه در " + (T.groups || []).length + " گروه · " + ST.map((s, i) => s.fa + " " + byStage[i]).join(" · "), "");
  L.push("**گام‌ها:** " + ST.map((s) => s.n + ") " + s.fa + " — " + s.need).join("؛ "), "");
  L.push("**مرزِ ثابت:** هر گسترش فقط با قضیه‌ای از پنج اصلِ ثابتِ «مبنای درجه‌ها»، یا مقدارِ پایه‌ای که با قابِ بی‌گزینش سنجیده می‌شود؛ آنچه به این‌ها برنمی‌گردد «بیرون از قلمروِ قطعی» علامت می‌خورد، نه ساخته.", "");
  if ((T.sources || []).length) L.push("**منابعِ نقشه:** " + T.sources.map((x) => x.title + (x.url ? " (" + x.url + ")" : "")).join("؛ "), "");
  (T.groups || []).forEach((g) => {
    L.push("## " + g.fa + (g.en ? " — " + g.en : ""), "");
    g.areas.forEach((a) => {
      const c = S0.areas[a.id] || { stage: 0 }, s = ST[c.stage || 0];
      L.push("### " + "▰".repeat(c.stage || 0) + "▱".repeat(5 - (c.stage || 0)) + " " + a.fa + (a.en ? " (" + a.en + ")" : "") + " — " + s.fa + (c.bookOnly ? " (فقط بخشِ جزوه — گسترش از ادبیات مانده)" : ""), "");
      if (a.desc_fa) L.push(a.desc_fa, "");
      if ((a.book || []).length) L.push("- جزوه: " + a.book.join("، "));
      if ((c.sources || []).length && !c.seeded) L.push("- منابع: " + c.sources.join("؛ "));
      (c.claims || []).forEach((x) => L.push("- " + ({ theorem: "قضیه", base: "قضیه × پایه", outside: "بیرون از قلمروِ قطعی" }[x.kind] || "گزاره") + ": " + x.txt + (x.th ? " — `" + x.th + "`" : "") + (x.base ? " — پایهٔ `" + x.base + "`" : "") + (x.why ? " — " + x.why : "")));
      if (c.boundary) L.push("- **مرز:** " + c.boundary);
      if (c.verify) L.push("- تثبیت: " + c.verify.ok + " از " + c.verify.fresh + " واقعهٔ تازه درست (لازم: ≥۳، همه درست)");
      (c.history || []).forEach((h) => L.push("- دورِ " + h.round + " (" + h.at + ") ⇒ گامِ " + h.stage + ": " + h.what + " — " + h.by));
      L.push("");
    });
  });
  return L.join("\n") + "\n";
}
/* ---------- ناظرِ ناظر: بازبینیِ مستقلِ هر دور (زیرعاملِ جدا) — ابزار نبودن یا ناتمامیِ آن را هشدار می‌دهد ---------- */
function reviewPath(round) { return path.join(P.reviews, "round-" + String(round).padStart(4, "0") + ".json"); }
function addReview(file) {
  const r = rd(file, null), e = [];
  if (!r || typeof r !== "object") { console.error("فایلِ بازبینی نامعتبر"); process.exit(2); }
  if (!(r.round > 0)) e.push("round");
  if (!r.reviewer || !/زیرعامل|subagent/i.test(r.reviewer)) e.push("reviewer: باید زیرعاملِ جدا باشد (نه خودِ ناظر)");
  const need = ["events_real", "encoding_blind", "frames_unselected", "verified_by_real", "proofs_from_axioms", "no_conventional", "territory_evidence", "findings_diagnosed"];
  need.forEach((k) => { if (!r.checked || typeof r.checked[k] !== "boolean") e.push("checked." + k + " (true/false) لازم است"); });
  (r.problems || []).forEach((p, i) => { if (!p.what || typeof p.fixed !== "boolean") e.push("problems[" + i + "]: {what, fix, fixed}"); });
  if (e.length) return { ok: false, errors: e };
  wr(reviewPath(r.round), r); return { ok: true, round: r.round, problems: (r.problems || []).length, unfixed: (r.problems || []).filter((p) => !p.fixed).length };
}

/* ---------- خوداصلاحیِ پیوندها: هر ارجاعِ میانِ ثبت‌گاه‌های کارخانه/جزوه/قلمرو/تکنیک‌ها باید به چیزِ موجود برسد ----------
   (همان پیوندهایی که گرافِ مشترکِ «🗺 نقشه‌ها» از آن‌ها ساخته می‌شود؛ ارجاعِ شکسته = تخلف ⇒ دروازهٔ ادغام سرخ) */
let TECH_IDS = null;
function techIds() {
  if (TECH_IDS) return TECH_IDS;
  const dir = path.join(ROOT, "src", "tech"); global.T = global.T || [];
  try { fs.readdirSync(dir).filter((f) => /^t_.*\.js$/.test(f)).forEach((f) => require(path.join(dir, f))); } catch (e) { }
  TECH_IDS = new Set((global.T || []).map((t) => t.id)); return TECH_IDS;
}
function integrity() {
  const v = [], w = [], STS = new Set((global.EPI_ST || []).map((s) => s.id)), SEC = new Set(Object.keys(BOOK.sec || {})), RID = new Set(RULES.map((r) => r.id)), TI = techIds();
  RULES.forEach((r) => { if (!STS.has(r.st)) v.push("قاعده به ایستگاهِ ناموجود: " + r.id + " ⇒ " + r.st); (r.sec || []).forEach((x) => { if (!SEC.has(x)) v.push("قاعده به بخشِ ناموجود: " + r.id + " ⇒ " + x); }); });
  (global.EPI_ST || []).forEach((s) => { (s.basis || []).forEach((b) => { if (!SEC.has(b.sec)) v.push("ایستگاه به بخشِ ناموجود: " + s.id + " ⇒ " + b.sec); });
    (s.tech || []).forEach((x) => { if (TI.size && !TI.has(x.id)) v.push("ایستگاه به تکنیکِ ناموجود: " + s.id + " ⇒ " + x.id); }); });
  const co = {}; (global.EPI_CO || []).forEach((c) => { if (co[c.id]) w.push("تعریفِ دوگانهٔ مفهوم: " + c.id); co[c.id] = 1;
    (c.st || []).forEach((x) => { if (!STS.has(x)) v.push("مفهوم به ایستگاهِ ناموجود: " + c.id + " ⇒ " + x); }); (c.secs || []).forEach((x) => { if (!SEC.has(x)) v.push("مفهوم به بخشِ ناموجود: " + c.id + " ⇒ " + x); }); });
  (global.EPI_DR || []).forEach((d) => { if (!STS.has(d.st)) v.push("تمرین به ایستگاهِ ناموجود: " + d.id); });
  (global.EPI_DOS || []).forEach((d) => (d.secs || []).forEach((x) => { if (!SEC.has(x)) v.push("پروندهٔ پشتوانه به بخشِ ناموجود: " + d.id + " ⇒ " + x); }));
  terrAreas().forEach((a) => (a.book || []).forEach((x) => { if (!SEC.has(x)) v.push("حوزهٔ قلمرو به بخشِ ناموجود: " + a.id + " ⇒ " + x); }));
  const TS = terrState().areas || {}; Object.keys(TS).forEach((id) => (TS[id].rules || []).forEach((r) => { if (!RID.has(r) && !((rd(P.proposals, { proposals: [] }).proposals || []).some((p) => p.id === r))) v.push("حوزهٔ قلمرو به قاعدهٔ ناموجود: " + id + " ⇒ " + r); }));
  (global.EPI_PROBLEMS || []).concat(global.EPI_PROBLEMS_B || []).forEach((p) => (p.stages || []).forEach((s) => { (s.st || []).forEach((x) => { if (!STS.has(x)) v.push("مرحلهٔ مسئله به ایستگاهِ ناموجود: " + p.id + "/" + s.id + " ⇒ " + x); });
    (s.tech || []).forEach((x) => { if (TI.size && !TI.has(x)) v.push("مرحلهٔ مسئله به تکنیکِ ناموجود: " + p.id + "/" + s.id + " ⇒ " + x); }); }));
  (rd(P.findings, { findings: [] }).findings || []).forEach((f) => (f.rules || []).forEach((r) => { if (!RID.has(r)) w.push("یافته به قاعدهٔ ناموجود (تاریخی): " + f.id + " ⇒ " + r); }));
  return { violations: v, warnings: w };
}

/* ---------- نگهبانِ مبنا: هر سقف به قضیه‌ای از اصولِ ثابت برمی‌گردد؛ هیچ عددِ قراردادی؛ هیچ قضیهٔ بی‌برهان ---------- */
function axiomAudit() {
  const FD = global.EPI_FOUND, v = [], AX = new Set(FD.AX.map((a) => a.id)), TH = FD.TH;
  Object.keys(TH).forEach((id) => { const t = TH[id];
    if (!t.proof || !(t.from || []).length) v.push("قضیهٔ بی‌برهان: " + id);
    (t.from || []).forEach((x) => { if (!AX.has(x) && !TH[x]) v.push("قضیهٔ " + id + " بر پایهٔ ناشناختهٔ " + x); }); });
  RULES.filter((r) => r.eff === "cap").forEach((r) => { const d = FD.DER[r.id];
    if (!d) v.push("سقفِ بی‌اشتقاق: " + r.id); else if (!TH[d.th]) v.push("اشتقاقِ " + r.id + " قضیهٔ ناشناخته دارد: " + d.th);
    if (d && d.base && !FD.BASE[d.base]) v.push("پایهٔ ناشناخته در " + r.id); });
  FD.report(RULES).filter((r) => r.conventional).forEach((r) => v.push("عددِ قراردادی: " + r.id + " = " + r.cap));
  RULES.filter((r) => r.basis === "beyond" && !(r.proof && TH[r.proof])).forEach((r) => v.push("قاعدهٔ فراتر از جزوه بی قضیه: " + r.id));
  return v.concat(integrity().violations);
}

/* ---------- اعتبارسنجیِ واقعهٔ تازه ---------- */
function validate(c, seen) {
  const e = [];
  if (!c || typeof c !== "object") return ["ساختار نادرست"];
  for (const k of ["id", "title", "dom", "story", "claims", "truth", "tier"]) if (c[k] == null || c[k] === "") e.push("فیلدِ لازم: " + k);
  if (c.tier && ["real", "abstract"].indexOf(c.tier) < 0) e.push("tier باید real یا abstract باشد");
  if (c.tier === "real" && !(Array.isArray(c.src) && c.src.length)) e.push("واقعهٔ واقعی منبع می‌خواهد");
  if (c.sample != null && ["unselected", "curated"].indexOf(c.sample) < 0) e.push("sample باید unselected یا curated باشد");
  if (c.tier === "abstract" && !c.from) e.push("سناریوی انتزاعی باید بگوید هم‌ریختِ کدام واقعه است (from)");
  if (!Array.isArray(c.claims) || !c.claims.length) e.push("دست‌کم یک تصدیق");
  (c.claims || []).forEach((k) => {
    if (!k.txt) e.push("تصدیقِ بی‌متن");
    Object.keys(k.f || {}).forEach((key) => {
      const d = FM[key]; const v = k.f[key];
      if (!d) e.push("ویژگیِ ناشناخته: " + key);
      else if (d.t === "enum" && d.v.indexOf(v) < 0) e.push("مقدارِ نادرست " + key + "=" + v);
      else if (d.t === "bool" && typeof v !== "boolean") e.push("بولیِ نادرست " + key);
      else if (d.t === "num" && typeof v !== "number") e.push("عددِ نادرست " + key);
    });
  });
  const t = c.truth || {};
  if (typeof t.ok !== "boolean") e.push("truth.ok باید true/false باشد");
  if (t.ok === false && !(t.fail || []).length) e.push("شکست بی ایستگاهِ شکست");
  (t.fail || []).forEach((s) => { if (PIPE.indexOf(s) < 0) e.push("ایستگاهِ ناشناخته: " + s); });
  if (!t.why) e.push("truth.why (چرا) لازم است");
  if (t.ok === false && !t.right) e.push("truth.right (راهِ درست) لازم است");
  if (seen) {
    const s = sigOf(c);
    if (seen.sig.has(s)) e.push("تکراری (همان عنوان/سال/تصدیق‌ها)");
    if (seen.id.has(c.id)) e.push("شناسهٔ تکراری: " + c.id);
    if (seen.title.has(norm(c.title) + "|" + (c.year || ""))) e.push("واقعهٔ تکراری (همان عنوان و سال)");
  }
  return e;
}
function seenSets(all) { return { sig: new Set(all.map(sigOf)), id: new Set(all.map((c) => c.id)), title: new Set(all.map((c) => norm(c.title) + "|" + (c.year || ""))) }; }

/* ---------- یک دور ---------- */
function verdict(c, cfg) {
  const res = X.runCase(c, cfg), fate = X.fate(c, res), t = c.truth || {};
  const fired = []; (res.claims || []).forEach((k) => (k.fired || []).forEach((r) => { if (fired.indexOf(r) < 0) fired.push(r); }));
  let kind = "ok";
  if (t.ok === true && !res.healthy) kind = "health_alarm";          // واقعهٔ سالم پرچم خورد ⇒ نقصِ سامانه (یا برچسب)
  else if (t.ok === false && res.healthy) kind = "missed";            // شکستِ واقعی دیده نشد
  else if (t.ok === false && !fate.located) kind = "mislocated";      // دید، ولی در جای نادرست
  const fail = t.fail || [];
  const full = t.ok === false ? fail.every((s) => res.flagged.indexOf(s) >= 0) : null;
  return { id: c.id, tier: c.tier, round: c.round || 0, dom: c.dom || "", title: c.title, ok: t.ok, expected: fail, flagged: res.flagged, first: res.first,
    kind, full, fired, fixes: res.fixes.slice(0, 3), why: fate.why };
}
function rulesOfStations(sts) { return RULES.filter((r) => sts.indexOf(r.st) >= 0).map((r) => r.id); }
function secsOfRules(ids) { const s = new Set(); ids.forEach((id) => ((X.RM[id] || {}).sec || []).forEach((x) => s.add(x))); return [...s].sort(); }

function controls(cases, cfg) {
  // منفی: برچسب‌ها جابه‌جا (بذرِ ثابت) ⇒ توافق باید به تصادف نزدیک شود؛ مثبت: خطای کاشته‌شده در هر قاعده ⇒ باید دیده شود
  const real = cases.filter((c) => c.tier === "real" || c.tier === "abstract");
  let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const labels = real.map((c) => c.truth); const sh = labels.slice();
  for (let i = sh.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = sh[i]; sh[i] = sh[j]; sh[j] = t; }
  const agree = (arr, lab) => arr.reduce((a, c, i) => { const f = X.fate(Object.assign({}, c, { truth: lab[i] }), X.runCase(c, cfg)); return a + (f.score || 0); }, 0) / (arr.length || 1);
  const real0 = agree(real, labels), neg = agree(real, sh);
  const syn = X.genSynth(X.seedCases(), 1, {}).filter((c) => c.truth && c.truth.ok === false);
  const pos = syn.length ? syn.filter((c) => !X.runCase(c, cfg).healthy).length / syn.length : null;
  return { agree: +real0.toFixed(3), negAgree: +neg.toFixed(3), negOk: neg < real0 - 0.15, posDetect: pos == null ? null : +pos.toFixed(3), posOk: pos == null || pos >= X.COURT.posCtrl };
}

/* ---------- مبنای عددها (EPI_FOUND): کدام سقف قضیه است، کدام به مقدارِ پایه بسته است، کدام ناسازگار ----------
   و اثرِ دو حالتِ آزمایشی بر حکم‌ها — فقط در حافظه؛ پیش‌فرضِ موتور عوض نمی‌شود (تصمیم با مالک) */
function foundation(cases) {
  const FD = global.EPI_FOUND, base = X.DEFAULT_CFG("mesbah");
  const modes = { num: base, deg: Object.assign({}, base, { deg: true }), derived: Object.assign({}, base, { derived: true }), both: Object.assign({}, base, { deg: true, derived: true }) };
  const ref = {}, M = {};
  Object.keys(modes).forEach((m) => {
    const kinds = { ok: 0, health_alarm: 0, missed: 0, mislocated: 0 }, changed = [];
    cases.forEach((c) => {
      const v = verdict(c, modes[m]); kinds[v.kind] = (kinds[v.kind] || 0) + 1;
      if (m === "num") ref[c.id] = v.kind; else if (ref[c.id] !== v.kind) changed.push({ id: c.id, t: c.title, from: ref[c.id], to: v.kind });
    });
    M[m] = { kinds, changed };
  });
  const rep = FD.report(RULES);
  /* اثرِ هر پیشنهادِ برآمده از اشتقاق، جدا جدا */
  const impacts = {};
  FD.PROPOSALS.forEach((p) => {
    if (!p.derived) { impacts[p.id] = null; return; }
    const ids = p.derived === "B" ? Object.keys(FD.DER).filter((k) => FD.DER[k].k === "B") : p.derived;
    const cfg = Object.assign({}, base, { derived: ids });
    const o = { rules: ids.length, ceilings: 0, fixed: [], broken: [], refined: [], extra: [], fullBefore: 0, fullAfter: 0 };
    cases.forEach((c) => {
      const a = verdict(c, base), b = verdict(c, cfg);
      (c.claims || []).forEach((k) => { if (X.runClaim(k, cfg).ceil !== X.runClaim(k, base).ceil) o.ceilings++; });
      if (a.full) o.fullBefore++; if (b.full) o.fullAfter++;
      if (a.kind !== "ok" && b.kind === "ok") o.fixed.push(c.title);
      else if (a.kind === "ok" && b.kind !== "ok") o.broken.push(c.title);
      else if (!a.full && b.full) o.refined.push(c.title);
      else if (a.flagged.join() !== b.flagged.join()) o.extra.push(c.title);
    });
    impacts[p.id] = o;
  });
  return { classes: FD.SUMMARY(rep), rules: rep, modes: M, base: FD.measure(loadSamples()), suff: FD.SUFF, impacts,
    conventional: rep.filter((r) => r.conventional).length, audit: axiomAudit(), samples: loadSamples().length };
}

function run(note, rerun) {
  const cases = loadCorpus();
  const ledger = rd(P.ledger, { rounds: [] });
  /* --rerun: اجرای دوباره پس از اصلاح‌ها همان دور است، نه دورِ تازهٔ «بی ماده» — ردیفِ آخر جایگزین می‌شود (موادِ همان دور شمرده می‌مانند) */
  if (rerun && ledger.rounds.length) { const lastR = ledger.rounds.pop(); note = note || lastR.note; }
  const prevBase = ((ledger.rounds[ledger.rounds.length - 1] || {}).foundation || {}).baseval || {};
  applyBase();
  const old = rd(P.findings, { findings: [] });
  const round = (ledger.rounds.length ? ledger.rounds[ledger.rounds.length - 1].round : 0) + 1;
  const per = {}, books = {};
  for (const b of BOOKS) {
    const cfg = X.DEFAULT_CFG(b);
    const inBook = cases.filter((c) => (c.books || ["mesbah"]).indexOf(b) >= 0);
    const vs = inBook.map((c) => verdict(c, cfg));
    vs.forEach((v) => { per[v.id] = per[v.id] || {}; per[v.id][b] = v; });
    const sound = vs.filter((v) => v.ok === true), failed = vs.filter((v) => v.ok === false);
    books[b] = { n: vs.length, sound: sound.length, healthAlarms: vs.filter((v) => v.kind === "health_alarm").length,
      failures: failed.length, detected: failed.filter((v) => v.kind !== "missed").length, located: failed.filter((v) => v.kind === "ok").length,
      fullyLocated: failed.filter((v) => v.full).length, controls: controls(inBook, cfg) };
  }
  /* ---------- یافته‌ها: هر نقص یک پرونده با سرانجام ---------- */
  const F = {}; (old.findings || []).forEach((f) => { F[f.id] = f; });
  const today = new Date().toISOString().slice(0, 10);
  const byCase = {};
  Object.keys(per).forEach((cid) => { const v = per[cid].mesbah || per[cid][Object.keys(per[cid])[0]]; byCase[cid] = v; });
  Object.values(byCase).forEach((v) => {
    if (v.kind === "ok") return;
    const id = "f_" + v.id;
    const rules = v.kind === "health_alarm" ? v.fired.filter((r) => v.flagged.indexOf((X.RM[r] || {}).st) >= 0) : rulesOfStations(v.expected);
    const f = F[id] || { id, case: v.id, opened: today, openedRound: round, status: "open", attribution: null, note: "", fix: null, retest: null };
    f.kind = v.kind; f.title = v.title; f.tier = v.tier; f.expected = v.expected; f.flagged = v.flagged; f.rules = rules; f.secs = secsOfRules(rules);
    f.lastSeenRound = round;
    if (f.status === "verified" || f.status === "resolved") { f.status = "reopened"; f.reopened = today; }
    F[id] = f;
  });
  /* بسته شدن فقط با ماده‌ی تازه: موردِ خود اکنون درست است + دست‌کم ۳ واقعهٔ افزوده‌شده پس از اصلاح که همان قاعده‌ها را
     می‌آزمایند، همه درست — وگرنه «اصلاح‌شده، در انتظارِ آزمونِ تازه» (همان اصلِ «فقط روی دادهٔ تازه» در ترید کوانتومی) */
  Object.values(F).forEach((f) => {
    const v = byCase[f.case];
    const nowOk = v && v.kind === "ok";
    if (!nowOk) {
      if (f.status === "resolved") f.status = "open";
      if (f.status === "fixed" || f.status === "verified") { f.status = "reopened"; f.reopened = today; f.reopenedNote = "اصلاحِ ثبت‌شده موردِ خودش را درست نکرد"; }
      return;
    }
    if (["open", "diagnosed", "reopened"].indexOf(f.status) >= 0 && !f.fix) { f.status = "resolved"; f.resolved = today; f.resolvedNote = "بدونِ اصلاحِ ثبت‌شده درست شد (احتمالاً با تغییرِ دیگری) — به آزمونِ تازه نیاز دارد"; }
    if (f.fix || f.status === "resolved") {
      const since = f.fix ? f.fix.round : f.lastSeenRound;
      const fresh = Object.values(byCase).filter((x) => x.round > since && x.id !== f.case && (x.fired.some((r) => f.rules.indexOf(r) >= 0) || x.expected.some((s) => (f.flagged || []).concat(f.expected || []).indexOf(s) >= 0)));
      f.retest = { since, fresh: fresh.length, freshOk: fresh.filter((x) => x.kind === "ok").length, ids: fresh.slice(0, 12).map((x) => x.id) };
      if (fresh.length >= 3 && f.retest.freshOk === fresh.length) { f.status = "verified"; f.verified = f.verified || today; }
      else if (f.status !== "resolved") f.status = "fixed";
    }
  });
  const findings = Object.values(F).sort((a, b) => a.id < b.id ? -1 : 1);
  /* ---------- پوشش ---------- */
  const firedAll = new Set(); Object.values(byCase).forEach((v) => v.fired.forEach((r) => firedAll.add(r)));
  const tested = RULES.filter((r) => firedAll.has(r.id)).length;
  const secs = new Set(); RULES.forEach((r) => { if (firedAll.has(r.id)) (r.sec || []).forEach((s) => secs.add(s)); });
  const doms = {}; cases.forEach((c) => { doms[c.dom || "?"] = (doms[c.dom || "?"] || 0) + 1; });
  const tiers = {}; cases.forEach((c) => { tiers[c.tier] = (tiers[c.tier] || 0) + 1; });
  const newCount = cases.filter((c) => (c.round || 0) === round).length;
  const row = { round, at: today, note: note || "", corpus: { n: cases.length, tiers, new: newCount, files: corpusFiles().length }, books,
    findings: { open: findings.filter((f) => ["open", "diagnosed", "reopened"].indexOf(f.status) >= 0).length, fixed: findings.filter((f) => f.status === "fixed").length,
      resolved: findings.filter((f) => f.status === "resolved").length, verified: findings.filter((f) => f.status === "verified").length },
    coverage: { rulesTested: tested, rules: RULES.length, sectionsTested: secs.size, sections: Object.keys(BOOK.sec).length, domains: Object.keys(doms).length,
      untested: RULES.filter((r) => !firedAll.has(r.id)).map((r) => r.id), byDomain: doms } };
  const fnd = foundation(cases), b0 = books.mesbah || Object.values(books)[0] || { controls: {} };
  row.foundation = { classes: fnd.classes, modes: Object.fromEntries(Object.entries(fnd.modes).map(([k, v]) => [k, Object.assign({}, v.kinds, { changed: v.changed.length })])),
    baseMeasured: Object.values(fnd.base).filter((b) => b.measured).length, baseTotal: Object.keys(fnd.base).length,
    baseval: Object.fromEntries(Object.entries(fnd.base).map(([k, v]) => [k, v.p])), samples: fnd.samples, conventional: fnd.conventional, audit: fnd.audit.length };
  /* خودبهبودی، ثبت‌شده: هر جابه‌جاییِ مقدارِ پایه (از دادهٔ تازه) با شاهدش در دفتر */
  row.foundation.baseChanges = Object.keys(row.foundation.baseval).filter((k) => prevBase[k] != null && prevBase[k] !== row.foundation.baseval[k])
    .map((k) => ({ base: k, from: prevBase[k], to: row.foundation.baseval[k], n: fnd.base[k].n, ok: fnd.base[k].ok }));
  row.territory = territoryRound(byCase, round, today);
  /* سلامتِ کارِ ناظر (قطعی، بی هوش مصنوعی): دورِ بی ماده، یافتهٔ بی‌تشخیص، تخلف از مبنا ⇒ هشدار در دفتر و صفحه */
  const newSamples = loadSamples().filter((x) => x.round === round).length;
  const stale = findings.filter((f) => f.status === "open" && (f.openedRound || round) < round - 1).map((f) => f.id);
  const alarms = [];
  if (!newCount && !newSamples) alarms.push("این دور نه واقعهٔ تازه داشت نه نمونهٔ بی‌گزینشِ تازه");
  if (stale.length) alarms.push("یافته‌های باز بی‌تشخیص بیش از یک دور: " + stale.join("، "));
  if (fnd.audit.length) alarms.push("تخلف از مبنا: " + fnd.audit.join("؛ "));
  if (!b0.controls.negOk) alarms.push("کنترلِ منفی: آزمون به برچسب حساس نیست");
  if (!b0.controls.posOk) alarms.push("کنترلِ مثبت: خطای کاشته دیده نشد");
  if (!row.territory.moved.length) alarms.push("در این دور هیچ حوزه‌ای از نقشهٔ قلمرو یک گام جلو نرفت");
  const prevRound = round - 1, rv = prevRound > 0 ? rd(reviewPath(prevRound), null) : null;
  if (prevRound > 0 && (ledger.rounds[ledger.rounds.length - 1] || {}).routine && !rv) alarms.push("بازبینیِ مستقلِ دورِ " + prevRound + " (ناظرِ ناظر) ثبت نشده");
  if (rv && (rv.problems || []).some((p) => !p.fixed)) alarms.push("بازبینیِ دورِ " + prevRound + " مشکلِ اصلاح‌نشده دارد");
  row.routine = { newEvents: newCount, newSamples, staleFindings: stale, alarms };
  wr(P.foundation, Object.assign({ round, at: today }, fnd));
  syncProposals(fnd, cases.length);
  ledger.rounds.push(row);
  wr(P.ledger, ledger);
  wr(P.findings, { updated: today, round, attributions: ATTR, findings });
  const CM = {}; cases.forEach((c) => { CM[c.id] = c; });
  wr(P.results, { round, at: today, cases: Object.values(byCase).map((v) => {
    const o = { id: v.id, t: v.title, tier: v.tier, r: v.round, d: v.dom, ok: v.ok, k: v.kind, fl: v.flagged, ex: v.expected, full: v.full };
    if (v.round > 0) {  // افزوده‌های دورها در کتابخانهٔ صفحه نیستند ⇒ تحلیلِ معرفتیِ خودِ واقعه همین‌جا
      const c = CM[v.id] || {}, t = c.truth || {};
      Object.assign(o, { y: c.year, from: c.from || undefined, story: String(c.story || "").slice(0, 600), why: String(t.why || "").slice(0, 500), right: String(t.right || "").slice(0, 400), fx: v.fixes, src: (c.src || []).slice(0, 3) });
    }
    return o; }) });
  fs.writeFileSync(P.verified, verifiedBooklet(byCase, findings, row, fnd));
  return row;
}

/* ---------- «جزوهٔ متقن»: هر بخشِ جزوه با وضعِ آزموده‌شدنش ---------- */
function verifiedBooklet(byCase, findings, row, fnd) {
  const secRules = {}; RULES.forEach((r) => (r.sec || []).forEach((s) => { (secRules[s] = secRules[s] || []).push(r); }));
  const L = [];
  L.push("# جزوهٔ متقن — معرفت‌شناسیِ مجتبی مصباح، آزموده با بک‌تستِ پیوسته", "");
  L.push("> این سند را `tools/epi_backtest.js` بعد از هر دور خودش می‌سازد؛ دستی ویرایش نکن. منبع: `backtest/`.", "");
  L.push("**دورِ " + row.round + " (" + row.at + "):** پیکره " + row.corpus.n + " مورد (" + Object.entries(row.corpus.tiers).map(([k, v]) => k + " " + v).join("، ") + ")؛ " +
    "قاعده‌های آزموده " + row.coverage.rulesTested + " از " + row.coverage.rules + "؛ بخش‌های آزمودهٔ جزوه " + row.coverage.sectionsTested + " از " + row.coverage.sections + ".", "");
  const b = row.books.mesbah || {};
  L.push("**سلامت:** " + b.sound + " واقعهٔ سالم، " + b.healthAlarms + " هشدارِ کاذب · **تشخیص:** " + b.detected + " از " + b.failures + " شکست دیده شد، " + b.located + " در جای درست، " + b.fullyLocated + " کاملاً · " +
    "**کنترل‌ها:** توافق " + b.controls.agree + "، با برچسبِ جابه‌جا " + b.controls.negAgree + (b.controls.negOk ? " (آزمون حساس است ✓)" : " (⚠ آزمون به برچسب حساس نیست)") +
    "، خطای کاشته‌شده " + b.controls.posDetect + (b.controls.posOk ? " ✓" : " ⚠"), "");
  L.push("**معنای وضع‌ها:** ✅ آزموده و درست (دست‌کم یک واقعه قاعده‌اش را به کار انداخت و یافتهٔ بازی ندارد) · ⚠ یافتهٔ باز · 🔧 اصلاح‌شده، در انتظارِ آزمونِ تازه · ⬜ هنوز هیچ واقعه‌ای این بخش را نیازموده.", "");
  if (fnd) L.push.apply(L, foundationMd(fnd));
  const chapters = {}; Object.keys(BOOK.sec).forEach((s) => { const c = BOOK.sec[s].ch || "?"; (chapters[c] = chapters[c] || []).push(s); });
  const chOrder = (BOOK.ch || []).map((x) => x.id).filter((id) => chapters[id]).concat(Object.keys(chapters).filter((id) => !(BOOK.ch || []).some((x) => x.id === id)));
  chOrder.forEach((ch) => {
    const chi = (BOOK.ch || []).filter((x) => x.id === ch)[0];
    L.push("## " + (chi ? "فصلِ " + chi.n + " — " + chi.title : ch), "");
    chapters[ch].forEach((s) => {
      const sec = BOOK.sec[s], rules = secRules[s] || [];
      const ids = rules.map((r) => r.id);
      const used = Object.values(byCase).filter((v) => v.fired.some((r) => ids.indexOf(r) >= 0));
      const fs_ = findings.filter((f) => (f.secs || []).indexOf(s) >= 0);
      const open = fs_.filter((f) => ["open", "diagnosed", "reopened"].indexOf(f.status) >= 0), fixed = fs_.filter((f) => f.status === "fixed");
      const mark = !rules.length ? "·" : open.length ? "⚠" : fixed.length ? "🔧" : used.length ? "✅" : "⬜";
      L.push("### " + mark + " " + s + " — " + (sec.title || ""), "");
      if (sec.abs) L.push(sec.abs, "");
      if (!rules.length) { L.push("_این بخش قاعده‌ای در کارخانه ندارد (روایی/تاریخی یا مقدمه)._", ""); return; }
      L.push("- قاعده‌ها: " + rules.map((r) => "`" + r.id + "` " + r.fa).join("؛ "));
      L.push("- وقایعی که این بخش را به کار انداختند: " + used.length + (used.length ? " (" + used.slice(0, 6).map((v) => v.title).join("، ") + (used.length > 6 ? "، …" : "") + ")" : ""));
      fs_.forEach((f) => {
        const st = { open: "⚠ باز", diagnosed: "⚠ تشخیص‌داده", reopened: "⚠ دوباره باز", fixed: "🔧 اصلاح‌شده، در انتظارِ آزمونِ تازه", resolved: "◌ درست شد بی اصلاحِ ثبت‌شده", verified: "✅ اصلاح‌شده و روی وقایعِ تازه تأییدشده" }[f.status] || f.status;
        L.push("- یافتهٔ «" + f.title + "» (" + ({ health_alarm: "هشدارِ کاذب روی واقعهٔ سالم", missed: "شکستِ دیده‌نشده", mislocated: "شکست در جای نادرست" }[f.kind] || f.kind) + "): " + st +
          (f.attribution ? " — علت: " + f.attribution + (f.note ? " — " + f.note : "") : " — علت هنوز تعیین نشده"));
      });
      L.push("");
    });
  });
  return L.join("\n") + "\n";
}

/* پیشنهادهای برآمده از اشتقاق (EPI_FOUND.PROPOSALS) را با شاهدِ همین دور در proposals.json می‌گذارد/تازه می‌کند — تصمیم با مالک */
function syncProposals(fnd, n) {
  const FD = global.EPI_FOUND, P0 = rd(P.proposals, { proposals: [] }), list = P0.proposals || [];
  FD.PROPOSALS.forEach((p) => {
    const im = fnd.impacts[p.id];
    const ev = im ? "سنجیده در حافظه روی همهٔ " + n + " موردِ پیکره: " + im.rules + " قاعده، سقفِ " + im.ceilings + " تصدیق عوض می‌شود؛ " +
      "شکستِ تازه‌دیده/درست‌شده " + im.fixed.length + (im.fixed.length ? " (" + im.fixed.join("، ") + ")" : "") + "؛ حکمِ درستِ خراب‌شده " + im.broken.length + (im.broken.length ? " (" + im.broken.join("، ") + ")" : "") +
      "؛ کاملاً در جای درست " + im.fullBefore + " ⇒ " + im.fullAfter + (im.refined.length ? " (" + im.refined.join("، ") + ")" : "") + (im.extra.length ? "؛ پرچمِ اضافه/کم بی تغییرِ حکم: " + im.extra.join("، ") : "") + "."
      : "اثر هنوز سنجیدنی نیست (ویژگیِ لازم در پرونده‌ها رمزگذاری نشده).";
    const o = { id: p.id, title: p.title, why: p.why, evidence: ev, source: "foundation" };
    const prev = list.find((x) => x.id === p.id);
    if (p.applied) {  // پذیرفته و اعمال‌شده: شاهدِ پیش از اعمال می‌ماند (بعد از اعمال، سنجش دیگر «تغییر» نمی‌بیند)
      o.applied = p.applied; o.appliedWhat = p.appliedWhat;
      if (prev && prev.evidence && !prev.applied) o.evidence = prev.evidence; else if (prev && prev.evidence) o.evidence = prev.evidence;
    }
    if (p.finding) o.finding = p.finding; if (p.supersedes) o.supersedes = p.supersedes;
    const i = list.findIndex((x) => x.id === p.id);
    if (i >= 0) list[i] = Object.assign({}, list[i], o); else list.push(o);
    if (p.supersedes) list.forEach((x) => { if (x.id === p.supersedes) x.supersededBy = p.id; });
  });
  wr(P.proposals, { proposals: list });
}

function foundationMd(fnd) {
  const FD = global.EPI_FOUND, L = [], K = { B: "بدیهی‌پایه (قضیه)", S: "قضیه × مقدارِ پایهٔ سنجیده (بی‌داده = ۵۰)", O: "ترتیبی (فقط «کمتر از یقین»)", X: "ناسازگار با قضیه" };
  const DG = {}; FD.DEG.forEach((d) => { DG[d.id] = d.fa; });
  L.push("## مبنای عددها — بازگشت به بدیهیات", "");
  L.push("جزوه (s40): تصدیقِ نظریِ غیرمنتهی به بدیهیات «مراتب‌دار و تشکیکی است که بر اساسِ حسابِ احتمالات تعیین می‌شود … بازه‌ای میانِ صفر تا یک». " +
    "پس هر عدد باید قضیه‌ای از حسابِ احتمالات باشد که اصولش به اولیات برمی‌گردد. اصول: " + FD.AX.map((a) => a.id + " " + a.fa + " (" + a.sec.join(",") + ")").join("؛ ") + ".", "");
  L.push("**" + fnd.rules.length + " سقفِ عددی:** " + Object.keys(K).map((k) => K[k] + " " + (fnd.classes[k] || 0)).join(" · ") + " · **عددِ قراردادی: " + fnd.conventional + "** · نگهبانِ مبنا: " + (fnd.audit.length ? "⚠ " + fnd.audit.join("؛ ") : "✓ بی‌تخلف") + ".", "");
  L.push("| قاعده | سقفِ فعلی | درجه | گونه | قضیه | کرانِ قضیه | توضیح |", "|---|---|---|---|---|---|---|");
  fnd.rules.forEach((r) => L.push("| `" + r.id + "` | " + (r.capText || r.cap) + " | " + (DG[r.capDeg] || "") + " | " + r.k + (r.stricterThanTheorem ? " (سخت‌گیرتر از قضیه، بی‌برهان)" : "") + " | " + r.th + " " + r.thFa +
    " | " + (r.bound == null ? (r.baseFa ? "پایه: " + r.baseFa : "") : r.bound) + " | " + String(r.note || "").replace(/\|/g, "/") + " |"));
  L.push("");
  const m = fnd.modes, line = (k, fa) => "- " + fa + ": درست " + m[k].kinds.ok + "، شکستِ دیده‌نشده " + m[k].kinds.missed + "، جای نادرست " + m[k].kinds.mislocated + "، هشدارِ کاذب " + m[k].kinds.health_alarm +
    (k === "num" ? "" : " — " + m[k].changed.length + " حکم عوض شد" + (m[k].changed.length ? " (" + m[k].changed.slice(0, 10).map((c) => c.t).join("، ") + ")" : ""));
  L.push("**اثرِ حالت‌های آزمایشی روی کلِ پیکره (در حافظه؛ پیش‌فرض عوض نشده):**", "", line("num", "فعلی"), line("deg", "مقایسهٔ درجه‌ها (یقین/ظن/شک/وهم)"),
    line("derived", "کرانِ قضیه به‌جای سقفِ قراردادی"), line("both", "هر دو"), "");
  L.push("**مقدارهای پایه** — از نمونه‌های بی‌گزینش با قضیهٔ (k+1)/(n+2)؛ بی‌داده = ۵۰ (T_unknown) · " + fnd.samples + " قاب:", "");
  Object.keys(fnd.base).forEach((b) => { const x = fnd.base[b];
    L.push("- `" + b + "` " + x.fa + ": **" + x.p + "**" + (x.measured ? " — " + x.ok + " درست از " + x.n + " موردِ احرازشده در " + x.frames + " قاب" : " — هنوز هیچ نمونهٔ بی‌گزینش (۵۰ = «نمی‌دانیم»)")); });
  L.push("");
  return L;
}

/* ---------- وضع و شکاف‌ها (راهنمای گردآوری) ---------- */
function status() {
  const base = applyBase();
  const cases = loadCorpus(), cfg = X.DEFAULT_CFG("mesbah");
  const vs = cases.map((c) => verdict(c, cfg));
  const fired = {}; vs.forEach((v) => v.fired.forEach((r) => { fired[r] = (fired[r] || 0) + 1; }));
  const doms = {}; cases.forEach((c) => { doms[c.dom || "?"] = (doms[c.dom || "?"] || 0) + 1; });
  const untested = RULES.filter((r) => !fired[r.id]).map((r) => r.id + " (" + (r.sec || []).join(",") + ") " + r.fa);
  const sound = cases.filter((c) => c.truth && c.truth.ok === true).length;
  return { corpus: cases.length, files: corpusFiles(), sound, failures: cases.length - sound, domains: doms,
    weakDomains: Object.entries(doms).sort((a, b) => a[1] - b[1]).slice(0, 6).map((x) => x[0]), untestedRules: untested,
    soundShare: +(sound / cases.length).toFixed(2), samples: loadSamples().length,
    baseNeeds: Object.entries(base).sort((a, b) => a[1].n - b[1].n).map(([k, v]) => k + " (" + v.fa + "): " + v.n + " موردِ سنجیده، مقدار " + v.p),
    audit: axiomAudit(),
    territoryFrontier: (() => { const S0 = terrState(); return terrAreas().map((a) => { const c = S0.areas[a.id] || {}; return { id: a.id, fa: a.fa, group: a.group, stage: c.stage || 0, bookOnly: !!c.bookOnly, next: c.bookOnly ? "widen" : "stage " + ((c.stage || 0) + 1) }; })
      .sort((x, y) => (x.bookOnly ? 2.5 : x.stage) - (y.bookOnly ? 2.5 : y.stage)).slice(0, 15); })(), note: "گردآوریِ دورِ بعد: اول قاعده‌های آزموده‌نشده و حوزه‌های کم‌شمار؛ وقایعِ «سالمِ کامل» کم‌اند — هر دور چندتا بیاور." };
}

function add(file) {
  const items = rd(file, null); if (!Array.isArray(items)) { console.error("فایل باید آرایهٔ JSON باشد"); process.exit(2); }
  const all = loadCorpus(), seen = seenSets(all);
  const ledger = rd(P.ledger, { rounds: [] });
  const round = (ledger.rounds.length ? ledger.rounds[ledger.rounds.length - 1].round : 0) + 1;
  const ok = [], bad = [];
  items.forEach((c) => {
    c.round = round; c.books = c.books || ["mesbah"]; c.added = new Date().toISOString().slice(0, 10); c.status = "approved"; c.by = c.by || "routine";
    c.grp = c.grp || c.id;
    const e = validate(c, seen);
    if (e.length) bad.push({ id: c.id, title: c.title, errors: e });
    else { ok.push(c); seen.sig.add(sigOf(c)); seen.id.add(c.id); seen.title.add(norm(c.title) + "|" + (c.year || "")); }
  });
  if (ok.length) { const out = path.join(CORPUS, "round-" + String(round).padStart(4, "0") + ".json"); const prev = rd(out, []); wr(out, prev.concat(ok)); }
  return { round, added: ok.length, rejected: bad };
}

if (require.main === module) {
  const [cmd, a1, a2] = process.argv.slice(2);
  if (cmd === "status") console.log(JSON.stringify(status(), null, 1));
  else if (cmd === "add") console.log(JSON.stringify(add(a1), null, 1));
  else if (cmd === "sample") console.log(JSON.stringify(addSamples(a1), null, 1));
  else if (cmd === "territory") console.log(JSON.stringify(applyTerritory(a1), null, 1));
  else if (cmd === "review") { const r = addReview(a1); console.log(JSON.stringify(r, null, 1)); if (!r.ok) process.exit(3); }
  else if (cmd === "audit") { const v = axiomAudit(); console.log(JSON.stringify({ violations: v, warnings: integrity().warnings }, null, 1)); if (v.length) process.exit(3); }
  else if (cmd === "run") { const args = process.argv.slice(3), ni = args.indexOf("--note"); console.log(JSON.stringify(run(ni >= 0 ? args[ni + 1] : "", args.indexOf("--rerun") >= 0), null, 1)); }
  else { console.log("usage: status | add <file.json> | sample <file.json> | territory <file.json> | review <file.json> | audit | run [--note text] [--rerun]"); process.exit(1); }
}
module.exports = { integrity, validate, verdict, loadCorpus, status, run, add, sigOf, foundation, addSamples, validateFrame, axiomAudit, applyBase, loadSamples,
  applyTerritory, validateTerr, terrAreas, terrState, addReview, territoryMd };
