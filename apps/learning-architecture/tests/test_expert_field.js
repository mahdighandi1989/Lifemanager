// «جمعیتِ پژوهش» (x_field) — اعمالِ بخش‌های قضیه‌ایِ p_base_expert_method/amend-field (مالک ۲۰۲۶-۱۰-۱۵: «اگر بر اساسِ بدیهیاتِ قطعی است، اعمال کن»):
// ۱) طرح: x_field در st_expert با سه جمعیتِ سنجیده + «نامعلوم»؛ قضیهٔ T_pop با برهان از A3/A4/T_next؛ T_mix و «۶۰ برای همه» اعمال نشده.
// ۲) سنجش: هر موردِ قاب جمعیتِ قاب را به ارث می‌برد ⇒ ۶۰٫۰ (۱۱/۱۸)، ۳۶٫۴ (۳۵/۹۷)، ۶۰٫۹ (۱۳/۲۱) — عدد را ابزار می‌سازد.
// ۳) قاعده: سقفِ «تخصص دیگران + روشِ معتبر + صلاحیتِ احرازشده + تک‌منبع» = پایهٔ جمعیتش؛ نامعلوم ⇒ ۵۰؛ بی x_field ⇒ هیچ قاعدهٔ تازه‌ای فعال نیست (رفتارِ پیشین).
// ۴) ابزار: `field` فقط مقدارِ طرح، هرگز «نامعلوم» برای قاب، هرگز بازنویسیِ خاموش؛ audit تصدیقِ بی‌قاب را رد می‌کند.
// ۵) صفحه: کاربرگِ «استناد به تخصص» فیلدِ جمعیت (با راهنما) دارد و رمزگذاری از آن پر می‌شود؛ سقفِ صفحه همان پایهٔ سنجیده است.
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const errors = []; const chk = (c, m) => { if (!c) errors.push(m); };
const T = require(path.join(__dirname, '..', 'tools', 'epi_backtest.js'));
const F = global.EPI_FOUND, X = global.EPIX, FM = global.EPI_FM;
const V = FM.x_field && FM.x_field.v;
chk(V && V.length === 4 && FM.x_field.st === 'st_expert' && V[3] === 'نامعلوم', 'x_field feature in st_expert with 3 measured populations + unknown');
chk(F.TH.T_pop && F.TH.T_pop.proof && /T_next/.test(F.TH.T_pop.proof) && F.TH.T_pop.from.join() === 'A3,A4', 'T_pop proved from A3, A4 (the axioms of T_next)');
chk(!F.TH.T_mix, 'T_mix not applied (encoding cannot express «one of the measured three, unknown which»)');
chk(!F.BASE.p_expert_method, 'the single «60 for all» base was not applied');
const BASES = { p_expert_econ_lab: [V[0], 11, 18, 60], p_expert_psych08: [V[1], 35, 97, 36.4], p_expert_socsci_ns: [V[2], 13, 21, 60.9] };
const m = F.measure(T.loadSamples());
Object.keys(BASES).forEach(b => { const [v, k, n, p] = BASES[b];
  chk(F.BASE[b] && F.BASE[b].select.x_field === v, 'base selects its population ' + b);
  chk(m[b] && m[b].ok === k && m[b].n === n && m[b].p === p && m[b].frames === 1, 'measured ' + b + ' = ' + p + ' ' + JSON.stringify(m[b])); });
chk(m.p_thiqa.n === 0, 'other bases untouched by the expert frames');
// قاعده‌ها
const base = X.DEFAULT_CFG('mesbah');
const saved = global.EPI_BT_LEDGER; global.EPI_BT_LEDGER = { baseval: { p_expert_econ_lab: 60, p_expert_psych08: 36.4, p_expert_socsci_ns: 60.9 } };
const ex = (xf, conf, extra) => X.runClaim({ id: 'k', f: Object.assign({ way: 'تخصص دیگران', x_method: 'معتبر', x_comp: 'احراز شده', chain: 'تک‌منبع', conf }, xf == null ? {} : { x_field: xf }, extra || {}) }, base);
const capOf = (id, xf) => X.capOf(base, X.RM[id], { way: 'تخصص دیگران', x_method: 'معتبر', x_comp: 'احراز شده', chain: 'تک‌منبع', x_field: xf });
chk(capOf('r_expert_pop_econ', V[0]) === 60 && capOf('r_expert_pop_psych', V[1]) === 36.4 && capOf('r_expert_pop_socsci', V[2]) === 60.9 && capOf('r_expert_pop_unknown', V[3]) === 50, 'each population rule caps at its measured base');
V.forEach((v, i) => chk(ex(v, 70).fired.filter(r => /^r_expert_pop_/.test(r)).join() === ['r_expert_pop_econ', 'r_expert_pop_psych', 'r_expert_pop_socsci', 'r_expert_pop_unknown'][i], 'exactly its population rule fires ' + v));
// تک‌منبع ⇒ r_naql_ahad هم فعال است (سقفش پایهٔ سنجیده‌نشدهٔ p_thiqa = ½)؛ کمینه (T_weakest) ⇒ فعلاً فقط جمعیتِ زیرِ ½ (روان‌شناسی) سقف را پایین می‌آورد
chk(ex(V[1], 36).ceil === 36 && ex(V[1], 40).over && ex(V[1], 40).bind === 'r_expert_pop_psych', 'psychology ⇒ cap 36.4 (below ½) binds');
chk(ex(V[0], 50).ceil === 50 && ex(V[0], 51).over && ex(V[0], 51).fired.indexOf('r_naql_ahad') >= 0, 'econ: single-report cap (unmeasured p_thiqa = ½) is the weaker link today');
chk(ex(V[3], 50).ceil === 50 && !ex(V[3], 50).over && ex(V[3], 51).over && ex(V[3], 51).flags.some(f => f.st === 'st_expert'), 'unknown population ⇒ ½ (T_unknown), flagged at st_expert');
global.EPI_BT_LEDGER = { baseval: { p_expert_econ_lab: 60, p_expert_psych08: 36.4, p_expert_socsci_ns: 60.9, p_thiqa: 90 } };   // فرضی: اگر وثاقتِ ناقل روزی سنجیده و بالاتر شود
chk(ex(V[0], 60).ceil === 60 && !ex(V[0], 60).over && ex(V[0], 61).over && ex(V[0], 61).bind === 'r_expert_pop_econ', 'econ ⇒ cap 60 once it is the weakest link');
chk(!ex(V[2], 60).over && ex(V[2], 61).over && ex(V[2], 61).bind === 'r_expert_pop_socsci', 'Nature/Science ⇒ cap 60.9 once it is the weakest link');
chk(ex(null, 95).fired.every(r => !/^r_expert_pop_/.test(r)), 'no x_field ⇒ no new rule fires (previous behaviour)');
chk(ex(V[0], 61, { chain: 'زنجیره طولی' }).fired.every(r => !/^r_expert_pop_/.test(r)), 'population base only for the single-source claim it measures');
chk(ex(V[0], 61, { x_bias: true }).ceil === 50, 'bias rule still binds when lower');
global.EPI_BT_LEDGER = saved;
['r_expert_pop_econ', 'r_expert_pop_psych', 'r_expert_pop_socsci'].forEach(id => chk(F.DER[id] && F.DER[id].k === 'S' && F.DER[id].th === 'T_pop' && F.BASE[F.DER[id].base], 'derivation ' + id));
chk(F.DER.r_expert_pop_unknown && F.DER.r_expert_pop_unknown.th === 'T_unknown' && F.DER.r_expert_pop_unknown.bound === 50, 'derivation unknown ⇒ T_unknown 50');
chk(T.axiomAudit().length === 0, 'audit clean ' + JSON.stringify(T.axiomAudit()));
// پیکره: هیچ تصدیقی x_field ندارد ⇒ هیچ حکمی عوض نشده
chk(T.loadCorpus().every(c => (c.claims || []).every(k => !(k.f && k.f.x_field))), 'no corpus claim encoded with x_field yet');
// تصمیمِ مالک در proposals.json
const PR = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'backtest', 'proposals.json'))).proposals.find(p => p.id === 'p_base_expert_method');
chk(PR && PR.applied === '2026-10-15' && PR.appliedWhat && PR.decision && /بدیهیاتِ قطعی/.test(PR.decision.owner) && PR.decision.notApplied.length >= 2 && PR.decision.notApplied.some(x => /T_mix/.test(x.what)), 'proposal marked applied with the owner decision');
// ابزار در پوشهٔ موقت
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'epifield-'));
fs.mkdirSync(path.join(dir, 'samples')); fs.mkdirSync(path.join(dir, 'corpus'));
const TOOL = path.join(__dirname, '..', 'tools', 'epi_backtest.js');
const tool = (...a) => { try { return { code: 0, out: JSON.parse(execFileSync('node', [TOOL, ...a], { env: Object.assign({}, process.env, { EPI_BT_DIR: dir }), stdio: ['ignore', 'pipe', 'ignore'] }).toString()) }; } catch (e) { return { code: e.status, out: JSON.parse(String(e.stdout || '{}') || '{}') }; } };
const frame = { id: 'fx', frame: 'همهٔ پژوهش‌های یک مجلهٔ معین در یک سالِ معین، پیش از تکرار ثابت شده', src: ['s'], selected_by_outcome: false,
  items: [0, 1, 2, 3].map(i => ({ id: 'i' + i, txt: 't' + i, f: { way: 'تخصص دیگران', x_method: 'معتبر', x_comp: 'احراز شده', chain: 'تک‌منبع' }, truth: i < 3, verified_by: ['جدول'] })) };
fs.writeFileSync(path.join(dir, 'fr.json'), JSON.stringify([frame]));
chk(tool('sample', path.join(dir, 'fr.json')).out.added === 1, 'frame added');
const W = (x) => { fs.writeFileSync(path.join(dir, 'f.json'), JSON.stringify(x)); return tool('field', path.join(dir, 'f.json')); };
chk(W([{ frame: 'fx', x_field: 'نامعلوم', why: 'تعریفِ خودِ قاب پیش از سرانجام' }]).code === 3, 'a frame cannot be «unknown»');
chk(W([{ frame: 'nope', x_field: V[0], why: 'تعریفِ خودِ قاب پیش از سرانجام' }]).code === 3, 'unknown frame refused');
chk(W([{ frame: 'fx', x_field: 'رشتهٔ ساختگی', why: 'تعریفِ خودِ قاب پیش از سرانجام' }]).code === 3, 'value outside the schema refused');
chk(W([{ frame: 'fx', x_field: V[0], why: 'کوتاه' }]).code === 3, 'reason required');
chk(W([{ frame: 'fx', x_field: V[0], why: 'تعریفِ خودِ قاب پیش از سرانجام' }]).code === 0, 'frame population set');
chk(W([{ frame: 'fx', x_field: V[1], why: 'تعریفِ خودِ قاب پیش از سرانجام' }]).code === 3, 'no silent overwrite');
const st = tool('status').out; chk(st.baseNeeds.some(x => /^p_expert_econ_lab .*4 موردِ سنجیده، مقدار 66\.7/.test(x)), 'tool measures the frame population (k+1)/(n+2) = 4/6 ' + st.baseNeeds.filter(x => /econ/.test(x)));
const bad = { id: 'xf_bad', tier: 'real', title: 'جمعیتِ بی‌قاب', dom: 'علم', year: 2020, src: ['x'], story: 's', actor: 'a',
  claims: [{ id: 'k1', txt: 'یافتهٔ یک پژوهش', role: 'اصلی', f: { way: 'تخصص دیگران', x_field: V[1], conf: 30 } }], truth: { ok: true, fail: [], why: 'w' } };
fs.writeFileSync(path.join(dir, 'c.json'), JSON.stringify([bad]));
chk(tool('add', path.join(dir, 'c.json')).out.added === 1, 'case with x_field added');
const au = tool('audit'); chk(au.code === 3 && au.out.violations.some(v => /xf_bad/.test(v)), 'audit refuses a claim whose population has no measured frame');

(async () => {
  const { chromium } = require('playwright');
  const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
  const b = await chromium.launch(); const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav');
  const id = await p.evaluate(() => { const c = APP.newCase({ title: 'یافتهٔ پژوهش', input: 'یک پژوهشِ منتشرشده' });
    c.st.st_tasdiq = { data: { claims: [{ txt: 'اثرِ X بر Y' }] }, done: true }; c.st.st_route = { data: { ways: [{ c: '1', w: 'تخصص دیگران' }] }, done: true }; APP.S.put(c); return c.id; });
  await p.evaluate(i => APP.go('e_case', i, 'st_expert'), id); await p.waitForTimeout(200);
  const fld = p.locator('main [data-k="field"]');
  info.station = { has: await fld.count(), opts: await fld.locator('option').count(), hint: await fld.locator('.fhint').count() ? await fld.locator('.fhint').innerText() : '' };
  chk(info.station.has === 1 && info.station.opts === 5 && /نامعلوم/.test(info.station.hint), 'st_expert worksheet shows the population select with a hint ' + JSON.stringify(info.station));
  chk(await p.evaluate(() => { const l = document.querySelector('main [data-k="field"] label'); return !!(l && l.getAttribute('for') && document.getElementById(l.getAttribute('for'))); }), 'population select is labelled');
  await fld.locator('select').selectOption(V[0]); await p.waitForTimeout(450);
  chk(await p.evaluate(i => ((APP.S.get(i).st.st_expert || {}).data || {}).field, id) === V[0], 'worksheet value stored');
  await p.evaluate(i => APP.go('e_case', i, 'engine'), id); await p.waitForTimeout(250);
  info.feat = await p.evaluate(i => (APP.S.get(i).feat || {})[1], id);
  chk(info.feat && info.feat.x_field === V[0] && info.feat.way === 'تخصص دیگران', 'encoding prefilled from the worksheet ' + JSON.stringify(info.feat));
  chk(await p.locator('#fe_c1_x_field').count() === 1 && await p.locator('#fe_c1_x_field').inputValue() === V[0], 'feature editor shows x_field');
  info.ceil = await p.evaluate(() => { const f = { way: 'تخصص دیگران', x_method: 'معتبر', x_comp: 'احراز شده', chain: 'تک‌منبع', conf: 70 }, cfg = EPIX.DEFAULT_CFG('mesbah');
    const ids = ['r_expert_pop_econ', 'r_expert_pop_psych', 'r_expert_pop_socsci', 'r_expert_pop_unknown'];
    return { cap: ids.map((id, i) => EPIX.capOf(cfg, EPIX.RM[id], Object.assign({ x_field: EPI_FM.x_field.v[i] }, f))),
      ceil: [0, 1, 2, 3].map(i => EPIX.runClaim({ id: 'k', f: Object.assign({ x_field: EPI_FM.x_field.v[i] }, f) }, cfg).ceil) }; });
  chk(JSON.stringify(info.ceil.cap) === JSON.stringify([60, 36.4, 60.9, 50]) && JSON.stringify(info.ceil.ceil) === JSON.stringify([50, 36, 50, 50]), 'page caps = measured population bases (bundle ledger) ' + JSON.stringify(info.ceil));
  await p.evaluate(() => APP.go('e_bt', null, 'found')); await p.waitForTimeout(300);
  info.found = await p.evaluate(() => ({ base: document.querySelectorAll('main .found-base tbody tr').length, txt: (document.querySelector('main .found-base') || {}).innerText || '' }));
  chk(info.found.base === Object.keys(F.BASE).length && /۶۰/.test(info.found.txt) && /۳۶/.test(info.found.txt), 'foundation tab lists the measured population bases ' + info.found.base);
  await p.setViewportSize({ width: 390, height: 800 }); await p.evaluate(i => APP.go('e_case', i, 'st_expert'), id); await p.waitForTimeout(200);
  chk(await p.evaluate(() => document.documentElement.scrollWidth <= 392), 'no horizontal overflow at 390px');
  console.log(JSON.stringify(info));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
  process.exit(errors.length ? 1 : 0);
})();
