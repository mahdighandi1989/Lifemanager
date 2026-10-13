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
const P = { ledger: path.join(BT, "ledger.json"), findings: path.join(BT, "findings.json"), results: path.join(BT, "results.json"),
  verified: process.env.EPI_BT_DIR ? path.join(BT, "VERIFIED_BOOKLET.md") : path.join(ROOT, "docs", "VERIFIED_BOOKLET.md") };

/* ---------- موتور (همان فایل‌هایی که صفحه اجرا می‌کند) ---------- */
global.window = global;
for (const f of ["epi_feat", "epi_rules", "epi_cases_a", "epi_cases_b", "epi_problems", "epi_problems_b", "epi_field", "epi_blind",
  "epi_engine", "epi_bt_core", "epi_book", "epi_core", "epi_st_a", "epi_st_b", "epi_st_c", "epi_st_d"]) require(path.join(APP, f + ".js"));
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
  for (const f of corpusFiles()) for (const c of rd(path.join(CORPUS, f), [])) added.push(c);
  return seed.concat(added);
}

/* ---------- اعتبارسنجیِ واقعهٔ تازه ---------- */
function validate(c, seen) {
  const e = [];
  if (!c || typeof c !== "object") return ["ساختار نادرست"];
  for (const k of ["id", "title", "dom", "story", "claims", "truth", "tier"]) if (c[k] == null || c[k] === "") e.push("فیلدِ لازم: " + k);
  if (c.tier && ["real", "abstract"].indexOf(c.tier) < 0) e.push("tier باید real یا abstract باشد");
  if (c.tier === "real" && !(Array.isArray(c.src) && c.src.length)) e.push("واقعهٔ واقعی منبع می‌خواهد");
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

function run(note) {
  const cases = loadCorpus();
  const ledger = rd(P.ledger, { rounds: [] });
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
  fs.writeFileSync(P.verified, verifiedBooklet(byCase, findings, row));
  return row;
}

/* ---------- «جزوهٔ متقن»: هر بخشِ جزوه با وضعِ آزموده‌شدنش ---------- */
function verifiedBooklet(byCase, findings, row) {
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

/* ---------- وضع و شکاف‌ها (راهنمای گردآوری) ---------- */
function status() {
  const cases = loadCorpus(), cfg = X.DEFAULT_CFG("mesbah");
  const vs = cases.map((c) => verdict(c, cfg));
  const fired = {}; vs.forEach((v) => v.fired.forEach((r) => { fired[r] = (fired[r] || 0) + 1; }));
  const doms = {}; cases.forEach((c) => { doms[c.dom || "?"] = (doms[c.dom || "?"] || 0) + 1; });
  const untested = RULES.filter((r) => !fired[r.id]).map((r) => r.id + " (" + (r.sec || []).join(",") + ") " + r.fa);
  const sound = cases.filter((c) => c.truth && c.truth.ok === true).length;
  return { corpus: cases.length, files: corpusFiles(), sound, failures: cases.length - sound, domains: doms,
    weakDomains: Object.entries(doms).sort((a, b) => a[1] - b[1]).slice(0, 6).map((x) => x[0]), untestedRules: untested,
    soundShare: +(sound / cases.length).toFixed(2), note: "گردآوریِ دورِ بعد: اول قاعده‌های آزموده‌نشده و حوزه‌های کم‌شمار؛ وقایعِ «سالمِ کامل» کم‌اند — هر دور چندتا بیاور." };
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
  else if (cmd === "run") console.log(JSON.stringify(run(a1 === "--note" ? a2 : ""), null, 1));
  else { console.log("usage: status | add <file.json> | run [--note text]"); process.exit(1); }
}
module.exports = { validate, verdict, loadCorpus, status, run, add, sigOf };
