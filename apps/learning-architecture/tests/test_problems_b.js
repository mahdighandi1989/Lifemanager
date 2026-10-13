// مسئله‌های بزرگ — دستهٔ دوم (src/app/epi_problems_b.js): آزمونِ طرح‌واره در Node (بی‌مرورگر)
// + اگر dist/learning-architecture.html ساخته شده و playwright در دسترس است: نمایشِ هر مسئلهٔ تازه در همهٔ زبانه‌ها بی‌خطا.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const APPD = path.join(ROOT, 'src', 'app');
const TECHD = path.join(ROOT, 'src', 'tech');
global.window = global;
function load(f) { (0, eval)(fs.readFileSync(f, 'utf8')); }

const errors = [];
const E = (c, m) => { if (!c) errors.push(m); };

// ایستگاه‌ها و تکنیک‌ها
fs.readdirSync(APPD).filter(f => /^epi_st_.*\.js$/.test(f)).sort().forEach(f => load(path.join(APPD, f)));
fs.readdirSync(TECHD).filter(f => /^t_.*\.js$/.test(f)).sort().forEach(f => load(path.join(TECHD, f)));
const ST = new Set((window.EPI_ST || []).map(s => s.id));
const TECH = new Set((window.T || []).map(t => t.id));
E(ST.size >= 25, 'EPI_ST not loaded: ' + ST.size);
E(TECH.size === 45, 'T not 45: ' + TECH.size);

// مسئله‌ها: اول دستهٔ اول، بعد دستهٔ دوم
load(path.join(APPD, 'epi_problems.js'));
const oldIds = new Set(window.EPI_PROBLEMS.map(p => p.id));
const oldCaseIds = new Set([].concat(...window.EPI_PROBLEMS.map(p => (p.cases || []).map(c => c.id))));
const nOld = window.EPI_PROBLEMS.length;
load(path.join(APPD, 'epi_problems_b.js'));
const NEW = window.EPI_PROBLEMS.slice(nOld);

const MV = new Set(['mv_special', 'mv_general', 'mv_extend', 'mv_represent', 'mv_invariant', 'mv_backward', 'mv_contra', 'mv_descent', 'mv_decompose', 'mv_analogy', 'mv_assume', 'mv_control', 'mv_measure', 'mv_anomaly', 'mv_impossible', 'mv_compute']);
const STR = v => typeof v === 'string' && v.trim().length > 0;
const EXPECT = ['pb_mercury', 'pb_blackbody', 'pb_zeno', 'pb_hans', 'pb_hpylori'];
E(NEW.length === 5, 'expected 5 new problems, got ' + NEW.length);
E(JSON.stringify(NEW.map(p => p.id)) === JSON.stringify(EXPECT), 'ids ' + NEW.map(p => p.id));

const seen = new Set();
const info = {};
NEW.forEach(p => {
  const P = p.id + ': ';
  E(!oldIds.has(p.id), P + 'duplicates an existing problem id');
  E(!seen.has(p.id), P + 'duplicate id in batch'); seen.add(p.id);
  ['id', 'title', 'field', 'open', 'statement', 'why_hard', 'answer'].forEach(k => E(STR(p[k]), P + 'missing ' + k));
  E(Array.isArray(p.src) && p.src.length >= 3 && p.src.every(STR), P + 'src');
  E(p.era && STR(p.era.known) && STR(p.era.assumed) && STR(p.era.tools), P + 'era {known, assumed, tools}');
  E(Array.isArray(p.stages) && p.stages.length >= 8, P + 'stages >= 8');
  const sids = new Set();
  (p.stages || []).forEach((s, i) => {
    const S = P + 'stage ' + (s.id || i) + ': ';
    E(STR(s.id) && !sids.has(s.id), S + 'id missing/duplicate'); sids.add(s.id);
    E(typeof s.year === 'number' || typeof s.year === 'string', S + 'year');
    ['who', 'ctx', 'q', 'move', 'idea', 'hint'].forEach(k => E(STR(s[k]), S + 'missing ' + k));
    E(Array.isArray(s.opts) && s.opts.length >= 3, S + 'opts >= 3 (a 2-option stage is a coin flip and invites length cues)');
    E((s.opts || []).filter(o => o.ok === true).length === 1, S + 'exactly one ok option');
    (s.opts || []).forEach((o, j) => { E(STR(o.t) && STR(o.why) && typeof o.ok === 'boolean' && typeof o.hist === 'string', S + 'opt ' + j + ' fields'); });
    E(Array.isArray(s.st) && s.st.length >= 1 && s.st.every(x => ST.has(x)), S + 'st ids ' + JSON.stringify(s.st));
    E(Array.isArray(s.tech) && s.tech.every(x => TECH.has(x)), S + 'tech ids ' + JSON.stringify(s.tech));
    E(Array.isArray(s.mv) && s.mv.length >= 1 && s.mv.length <= 2 && s.mv.every(x => MV.has(x)), S + 'mv ' + JSON.stringify(s.mv));
    E(Number.isInteger(s.lvl) && s.lvl >= 1 && s.lvl <= 5, S + 'lvl');
  });
  E(Array.isArray(p.dead) && p.dead.length >= 3, P + 'dead >= 3');
  (p.dead || []).forEach((d, i) => {
    E(STR(d.who) && STR(d.idea) && STR(d.flaw) && (typeof d.year === 'number' || typeof d.year === 'string'), P + 'dead ' + i + ' fields');
    E(Array.isArray(d.st) && d.st.every(x => ST.has(x)), P + 'dead ' + i + ' st ' + JSON.stringify(d.st));
  });
  E(Array.isArray(p.lessons) && p.lessons.length >= 5 && p.lessons.every(STR), P + 'lessons >= 5');
  E(Array.isArray(p.drills) && p.drills.length >= 8, P + 'drills >= 8');
  let prev = 0;
  (p.drills || []).forEach((d, i) => {
    const D = P + 'drill ' + i + ': ';
    E(STR(d.q) && STR(d.why), D + 'q/why');
    E(Array.isArray(d.opts) && d.opts.length >= 2 && d.opts.every(STR), D + 'opts');
    E(Number.isInteger(d.a) && d.a >= 0 && d.a < (d.opts || []).length, D + 'answer index');
    E(new Set(d.opts || []).size === (d.opts || []).length, D + 'duplicate options');
    E(Number.isInteger(d.lvl) && d.lvl >= 1 && d.lvl <= 5 && d.lvl >= prev, D + 'lvl easy→hard'); prev = d.lvl;
  });
  E(Array.isArray(p.cases), P + 'cases array');
  (p.cases || []).forEach(c => { E(!oldCaseIds.has(c.id), P + 'case id dup ' + c.id); E(c.kind === 'problem' && c.truth, P + 'case shape ' + c.id); });
  // متن‌ها نباید نشانهٔ "</script" یا "<?" داشته باشند (build.py رد می‌کند)
  const js = JSON.stringify(p); E(!/<\/script/i.test(js) && js.indexOf('<?') < 0, P + 'forbidden markup');
  info[p.id] = p.stages.length + ' stages / ' + p.dead.length + ' dead / ' + p.drills.length + ' drills / ' + p.lessons.length + ' lessons';
});
// ---------- سوگیریِ گزینه‌ها (ممیزی: «بلندترین گزینه برنده است») ----------
// - در هر مسئله، گزینهٔ درست در حداکثر ۳۵٪ ِ گام‌ها (و ۳۵٪ ِ تمرین‌ها) بلندترین باشد (تساوی = بلندترین، سخت‌گیرانه).
// - در دست‌کم ۸۰٪ ِ گام‌ها/تمرین‌ها: |طولِ درست − میانگینِ طولِ نادرست‌ها| ≤ ۰٫۳۵ × میانگینِ نادرست‌ها.
// - تمرین‌ها دقیقاً ۴ گزینه.
// - «ربات بلندترین گزینه» در سطحِ ۱ (همهٔ گام‌ها، بار اول) باید زیرِ ۸۰٪ بماند.
// - ctx نباید جوابِ گام را لو بدهد: هیچ دنبالهٔ ۴ واژه‌ایِ مشترک میانِ ctx و متنِ گزینهٔ درست.
// - نشانهٔ سطحی: واژه‌های «علامت‌دار» نباید به‌طورِ نظام‌مند فقط در گزینهٔ درست بیایند.
const norm = s => String(s).replace(/[ً-ْٔ‌]/g, '').replace(/[«»()،؛:.,؟?!"'\[\]\/…\-—]/g, ' ');
const toks = s => norm(s).split(/\s+/).filter(Boolean);
const grams = (s, n) => { const t = toks(s), g = new Set(); for (let i = 0; i + n <= t.length; i++) g.add(t.slice(i, i + n).join(' ')); return g; };
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const bias = {};
let botRight = 0, botTotal = 0;
const CUES = ['کنترل', 'هر دو', 'شاید', 'موقت', 'مستقل', 'فرضیه', 'دقیق', 'جدا'];
const cueOnlyOk = {}, cueOnlyWrong = {};
NEW.forEach(p => {
  const P = p.id + ': ';
  let longS = 0, closeS = 0, ratioS = [];
  (p.stages || []).forEach(s => {
    const L = s.opts.map(o => o.t.length), k = s.opts.findIndex(o => o.ok), W = L.filter((_, i) => i !== k), mw = mean(W);
    if (L[k] >= Math.max(...W)) longS++;
    if (Math.abs(L[k] - mw) <= 0.35 * mw) closeS++;
    ratioS.push(L[k] / mw);
    // ربات: بلندترین گزینه را می‌زند (در تساوی، نخستین بلندترین در ترتیبِ داده)
    const pick = L.indexOf(Math.max(...L)); botTotal++; if (s.opts[pick].ok) botRight++;
    // ctx ↔ گزینهٔ درست
    const cg = grams(s.ctx, 4), shared = [...grams(s.opts[k].t, 4)].filter(g => cg.has(g));
    E(!shared.length, P + 'stage ' + s.id + ': ctx gives away the correct option (shared 4-gram: ' + shared.join(' | ') + ')');
    CUES.forEach(c => {
      const inOk = norm(s.opts[k].t).includes(norm(c)), inW = s.opts.some((o, i) => i !== k && norm(o.t).includes(norm(c)));
      if (inOk && !inW) cueOnlyOk[c] = (cueOnlyOk[c] || 0) + 1;
      if (inW && !inOk) cueOnlyWrong[c] = (cueOnlyWrong[c] || 0) + 1;
    });
  });
  const nS = (p.stages || []).length;
  E(longS <= 0.35 * nS, P + 'correct option is the longest in ' + longS + '/' + nS + ' stages (max 35%)');
  E(closeS >= 0.8 * nS, P + 'length-comparable stages ' + closeS + '/' + nS + ' (min 80%)');
  let longD = 0, closeD = 0;
  (p.drills || []).forEach((d, i) => {
    E(d.opts.length === 4, P + 'drill ' + i + ': exactly 4 options');
    const L = d.opts.map(o => o.length), W = L.filter((_, j) => j !== d.a), mw = mean(W);
    if (L[d.a] >= Math.max(...W)) longD++;
    if (Math.abs(L[d.a] - mw) <= 0.35 * mw) closeD++;
  });
  const nD = (p.drills || []).length;
  E(longD <= 0.35 * nD, P + 'drill correct option is the longest in ' + longD + '/' + nD + ' (max 35%)');
  E(closeD >= 0.8 * nD, P + 'length-comparable drills ' + closeD + '/' + nD + ' (min 80%)');
  bias[p.id] = 'stages longest-correct ' + longS + '/' + nS + ', comparable ' + closeS + '/' + nS + ', mean len ratio ' + mean(ratioS).toFixed(2) + ' · drills longest-correct ' + longD + '/' + nD + ', comparable ' + closeD + '/' + nD;
});
E(botRight / botTotal < 0.8, 'longest-option bot scored ' + botRight + '/' + botTotal + ' on level 1 (must stay < 80%)');
CUES.forEach(c => { const a = cueOnlyOk[c] || 0, b = cueOnlyWrong[c] || 0; E(a <= 3 || a <= 2 * b, 'surface cue «' + c + '» appears only in the correct option in ' + a + ' stages (only in a wrong one: ' + b + ')'); });
console.log(JSON.stringify(bias, null, 1));
console.log('longest-option bot (level 1, data): ' + botRight + '/' + botTotal + ' = ' + Math.round(100 * botRight / botTotal) + '%');
console.log('cue only-in-correct / only-in-wrong: ' + CUES.map(c => c + ' ' + (cueOnlyOk[c] || 0) + '/' + (cueOnlyWrong[c] || 0)).join(' · '));

// build.py: فایل در btfiles بلافاصله پس از epi_problems.js
const build = fs.readFileSync(path.join(ROOT, 'build.py'), 'utf8');
E(/"epi_problems\.js",\s*"epi_problems_b\.js"/.test(build), 'build.py btfiles must list epi_problems_b.js right after epi_problems.js');

console.log(JSON.stringify(info, null, 1));

// ---------- مرورگر (اختیاری اگر dist و playwright هست) ----------
const DIST = path.join(ROOT, 'dist', 'learning-architecture.html');
let pw = null; try { pw = require('playwright'); } catch (e) { pw = null; }
(async () => {
  if (pw && fs.existsSync(DIST)) {
    const browser = await pw.chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
    await page.route('**/fonts.googleapis.com/**', r => r.abort());
    await page.goto('file://' + DIST); await page.waitForSelector('.nav'); await page.waitForTimeout(300);
    await page.evaluate(() => { const st = APP.S.settings(); st.samples = true; APP.S.saveSettings(st); });  // نمونه‌های آماده پیش‌فرض پنهان‌اند (۲۰۲۶-۱۰-۱۳)
    const ids = await page.evaluate(() => (window.EPI_PROBLEMS || []).map(p => p.id));
    EXPECT.forEach(id => E(ids.includes(id), 'built bundle lacks ' + id));
    await page.evaluate(() => APP.go('e_prob')); await page.waitForTimeout(150);
    const listTxt = await page.locator('main').innerText();
    EXPECT.forEach((id, k) => E(listTxt.includes(NEW[k].title), 'list missing title ' + NEW[k].title));
    for (const id of EXPECT) {
      for (const tb of ['sim', 'about', 'path', 'dead', 'drills', 'lessons', 'cases']) {
        await page.evaluate(([i, t]) => { APP.simState = null; APP.go('e_prob', i, t); }, [id, tb]); await page.waitForTimeout(60);
        const ok = await page.evaluate(() => !!document.querySelector('main .page') && !/پیدا نشد/.test(document.querySelector('main').innerText));
        E(ok, 'render ' + id + ' ' + tb);
      }
      // شبیه‌ساز: همهٔ گام‌ها در سطحِ ۱ با زدنِ گزینهٔ درست
      await page.evaluate(i => { APP.simState = { pid: i, lv: 1, order: 'hist', i: 0 }; APP.go('e_prob', i, 'sim'); }, id);
      const n = NEW[EXPECT.indexOf(id)].stages.length;
      for (let k = 0; k < n; k++) {
        const okText = await page.evaluate(([i, k2]) => { const p = window.EPI_PROBLEMS.find(x => x.id === i); const s = p.stages[k2]; return s.opts.find(o => o.ok).t; }, [id, k]);
        await page.locator('main .dopt', { hasText: okText }).first().click();
        await page.locator('main .btn', { hasText: k + 1 < n ? 'گام بعد' : 'پایان سطح' }).click(); await page.waitForTimeout(30);
      }
      const verdict = await page.locator('main .verdict h2').innerText().catch(() => '');
      E(/۱۰۰٪/.test(verdict), 'sim level-1 run ' + id + ': ' + verdict);
    }
    await browser.close();
    console.log('browser: rendered ' + EXPECT.length + ' problems × 7 tabs + full level-1 sim run');
  } else console.log('browser part skipped (no dist or no playwright)');
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  process.exit(errors.length ? 1 : 0);
})();
