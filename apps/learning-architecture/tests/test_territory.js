// «🗺 قلمروِ معرفت‌شناسی» (مالک ۲۰۲۶-۱۰-۱۴): نقشهٔ کامل، پیشرفتِ گام‌به‌گامِ هر حوزه با شاهد، تثبیت فقط به دستِ ابزار، ناظرِ ناظر.
// ۱) نقشه: گروه‌ها/حوزه‌ها با شناسهٔ یکتا، فارسی، منبع؛ هر بخشِ جزوه که قاعده دارد به دست‌کم یک حوزه وصل است (هیچ پوششی بی‌حوزه نیست).
// ۲) ابزار (در پوشهٔ موقت): بذرِ حوزه‌های جزوه در گامِ ۴؛ پرش ممنوع؛ گام‌های ۱–۴ فقط با شاهد؛ «بیرون از قلمرو» بی‌دلیل رد؛ برهان فقط از اصول؛
//    گامِ ۵ به دستِ ناظر ممنوع؛ تاریخچه می‌ماند؛ TERRITORY.md ساخته می‌شود؛ هشدارِ «هیچ حوزه‌ای جلو نرفت» و «بازبینیِ دورِ قبل نیست».
// ۳) صفحه: زبانهٔ «🗺 قلمرو» همهٔ حوزه‌ها را با گام نشان می‌دهد؛ پالایه و جستجو؛ ۳۹۰px.
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const errors = []; const chk = (c, m) => { if (!c) errors.push(m); };
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'epiterr-'));
process.env.EPI_BT_DIR = dir;
const TOOL = path.join(__dirname, '..', 'tools', 'epi_backtest.js');
const T = require(TOOL), TERR = global.EPI_TERR, RULES = global.EPI_RULES;
const run = (...a) => { try { return JSON.parse(execFileSync('node', [TOOL, ...a], { env: Object.assign({}, process.env, { EPI_BT_DIR: dir }) }).toString()); } catch (e) { return JSON.parse(e.stdout.toString()); } };
// ۱) نقشه
const areas = T.terrAreas(), ids = areas.map(a => a.id);
chk(TERR.groups.length >= 8 && areas.length >= 50, 'map is broad: ' + TERR.groups.length + ' groups, ' + areas.length + ' areas');
chk(new Set(ids).size === ids.length && new Set(TERR.groups.map(g => g.id)).size === TERR.groups.length, 'unique ids');
chk(areas.every(a => a.fa && a.desc_fa && (a.src || []).length), 'every area has Persian name, description and a source');
chk((TERR.sources || []).length >= 4, 'map built from several authoritative sources');
const secsWithRules = new Set(); RULES.forEach(r => (r.sec || []).forEach(s => secsWithRules.add(s)));
const mapped = new Set(); areas.forEach(a => (a.book || []).forEach(s => mapped.add(s)));
const orphan = [...secsWithRules].filter(s => !mapped.has(s));
chk(orphan.length === 0, 'every booklet section that carries rules belongs to an area: ' + orphan);
// ۲) ابزار
const r1 = run('run', '--note', 'پایه');
const st = JSON.parse(fs.readFileSync(path.join(dir, 'territory.json')));
const seeded = areas.filter(a => (st.areas[a.id] || {}).seeded);
chk(seeded.length >= 5 && seeded.every(a => st.areas[a.id].stage === 4 && st.areas[a.id].claims.length && st.areas[a.id].bookOnly), 'booklet areas seeded at stage 4, marked «booklet part only»');
const bo = seeded[0].id, base3 = [1, 2, 3].map(i => ({ txt: 'گزارهٔ تازهٔ ادبیات شمارهٔ ' + i, src: 'SEP', kind: 'outside', why: 'به ارزش‌ها برمی‌گردد نه به صدق؛ از اصول بیرون نمی‌آید' }));
chk(r1.territory && r1.territory.areas === areas.length && r1.routine.alarms.some(a => /قلمرو/.test(a)), 'ledger has territory stats; «no area moved» alarm');
chk(fs.existsSync(path.join(dir, 'TERRITORY.md')) && /# قلمروِ معرفت‌شناسی/.test(fs.readFileSync(path.join(dir, 'TERRITORY.md'), 'utf8')), 'TERRITORY.md generated');
const open = areas.find(a => !(st.areas[a.id] || {}).seeded);
const W = (arr) => { const f = path.join(dir, 'u.json'); fs.writeFileSync(f, JSON.stringify(arr)); return run('territory', f); };
chk(W([{ area: open.id, stage: 2, what: 'پرش از روی گامِ یک آزمایشی' }]).rejected.length === 1, 'no skipping');
chk(W([{ area: open.id, stage: 1, what: 'خواندنِ منابعِ آزمایشی برای آزمون', sources: ['فقط یکی'] }]).rejected.length === 1, 'stage 1 needs two sources');
chk(W([{ area: open.id, stage: 1, what: 'خواندنِ منابعِ آزمایشی برای آزمون', sources: ['SEP: Testimony https://plato.stanford.edu/entries/testimony-episprob/', 'IEP: Epistemology of Testimony https://iep.utm.edu/ep-testi/'] }]).advanced.length === 1, 'stage 1 with evidence');
const cl = [{ txt: 'گزارهٔ نخستِ آزمایشیِ حوزه', src: 'SEP' }, { txt: 'گزارهٔ دومِ آزمایشیِ حوزه', src: 'SEP' }, { txt: 'گزارهٔ سومِ آزمایشیِ حوزه', src: 'IEP' }];
chk(W([{ area: open.id, stage: 2, what: 'فهرستِ گزاره‌های محوری', claims: cl }]).advanced.length === 1, 'stage 2');
chk(W([{ area: open.id, stage: 3, what: 'رده‌بندیِ آزمایشی', claims: cl.map(c => Object.assign({}, c, { kind: 'outside' })) }]).rejected.length === 1, '«outside» without a reason refused');
chk(W([{ area: open.id, stage: 3, what: 'رده‌بندیِ آزمایشی', claims: cl.map(c => Object.assign({}, c, { kind: 'theorem', proof: { text: 'برهان', from: ['A9'] } })) }]).rejected.length === 1, 'proofs only from existing axioms/theorems');
chk(W([{ area: open.id, stage: 3, what: 'رده‌بندیِ آزمایشی', claims: [Object.assign({}, cl[0], { kind: 'theorem', th: 'T_unknown' }), Object.assign({}, cl[1], { kind: 'base', base: 'p_thiqa' }), Object.assign({}, cl[2], { kind: 'outside', why: 'به ارزش‌ها و تکلیف برمی‌گردد نه به صدق؛ از اصول بیرون نمی‌آید' })] }]).advanced.length === 1, 'stage 3 honest classification');
chk(W([{ area: open.id, stage: 4, what: 'قاعدهٔ موجود', rules: ['r_nope'] }]).rejected.length === 1, 'stage 4 needs existing rule or recorded proposal');
chk(W([{ area: open.id, stage: 4, what: 'قاعده‌های موجود', rules: ['r_naql_ahad'] }]).advanced.length === 1, 'stage 4');
chk(W([{ area: open.id, stage: 5, what: 'تثبیتِ دستی' }]).rejected.length === 1, 'stage 5 only by the tool');
const st2 = JSON.parse(fs.readFileSync(path.join(dir, 'territory.json')));
chk(st2.areas[open.id].history.length === 4 && st2.areas[open.id].history.every(h => h.what && h.round), 'history kept, one entry per step');
chk(W([{ area: bo, widen: true, what: 'گسترشِ آزمایشی از ادبیات', sources: ['فقط یکی'], claims: base3 }]).rejected.length === 1, 'widen needs two outside sources');
chk(W([{ area: bo, widen: true, what: 'گسترشِ آزمایشی از ادبیات', sources: ['SEP: Testimony https://plato.stanford.edu/entries/testimony-episprob/', 'IEP https://iep.utm.edu/ep-testi/'], claims: base3 }]).advanced.length === 1, 'widen with evidence');
chk(JSON.parse(fs.readFileSync(path.join(dir, 'territory.json'))).areas[bo].bookOnly === false, 'widened area no longer «booklet part only»');
chk(W([{ area: open.id, widen: true, what: 'گسترشِ نابه‌جا', sources: ['a b c d e f', 'g h i j k l'], claims: base3 }]).rejected.length === 1, 'widen only for booklet-only areas');
const r2 = run('run');
chk(!r2.routine.alarms.some(a => /قلمرو/.test(a)) && r2.routine.alarms.some(a => /بازبینی/.test(a)), 'area moved ⇒ no territory alarm; missing review of previous round ⇒ alarm');
const rv = path.join(dir, 'rv.json');
fs.writeFileSync(rv, JSON.stringify({ round: 2, reviewer: 'خودم', checked: {} })); chk(run('review', rv).ok === false, 'review must be by a separate subagent with the full checklist');
fs.writeFileSync(rv, JSON.stringify({ round: 2, reviewer: 'زیرعاملِ جدا', checked: { events_real: true, encoding_blind: true, frames_unselected: true, verified_by_real: true, proofs_from_axioms: true, no_conventional: true, territory_evidence: true, findings_diagnosed: true }, problems: [{ what: 'منبعِ گامِ ۱ ساختگی بود', fix: 'برگشت', fixed: false }] }));
chk(run('review', rv).unfixed === 1, 'review stored');
const r3 = run('run'); chk(r3.routine.alarms.some(a => /اصلاح‌نشده/.test(a)), 'unfixed review problem ⇒ alarm next round');
fs.rmSync(dir, { recursive: true, force: true });
delete process.env.EPI_BT_DIR;
(async () => {
  const { chromium } = require('playwright');
  const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
  const b = await chromium.launch(); const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav');
  await p.evaluate(() => APP.go('e_bt', null, 'terr')); await p.waitForTimeout(300);
  info.n = await p.locator('main .terr-area').count();
  chk(info.n === areas.length, 'every area listed (' + info.n + '/' + areas.length + ')');
  chk(await p.locator('main .terr-group').count() === TERR.groups.length, 'every group listed');
  await p.selectOption('main .terr select', '4'); await p.waitForTimeout(120);
  info.s4 = await p.locator('main .terr-area').count();
  chk(info.s4 >= 1 && await p.locator('main .terr-area[data-stage="4"]').count() === info.s4, 'stage filter');
  await p.selectOption('main .terr select', ''); await p.fill('main .terr input[type=search]', TERR.groups[0].areas[0].fa); await p.waitForTimeout(120);
  chk(await p.locator('main .terr-area').count() >= 1, 'search');
  await p.setViewportSize({ width: 390, height: 800 }); await p.waitForTimeout(150);
  chk(await p.evaluate(() => document.documentElement.scrollWidth <= 392), 'no horizontal overflow at 390px');
  console.log(JSON.stringify(info));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
})();
