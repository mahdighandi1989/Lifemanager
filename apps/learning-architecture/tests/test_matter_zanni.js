// مقدمهٔ ظنی — p_matter_zanni (روتینِ بک‌تست ۲۰۲۶-۱۰-۱۵، به قاعدهٔ ثابتِ مالک «آنچه از بدیهیات برمی‌آید اعمال کن»؛ فقط بخشِ قضیه‌ای):
// ۱) طرح: matter «مقدمه ظنی» و prem_p (ثبت). ۲) قاعده: r_aql_matter_zanni ⇒ کمتر از یقین (۹۹٫۹، O از T_below1)؛ نه min(prem_p)، نه ½ (بازبینِ مستقل: قضیه نیستند).
// ۳) پیکره: هیچ حکمی جابه‌جا نشد؛ audit تمیز. ۴) پیشنهاد با سخنِ مالک و بخش‌های اعمال‌نشده. ۵) مسیرِ واقعی: جدولِ مقدماتِ کاربرگِ «راه عقل» ⇒ matter/prem_p ⇒ سقف ۹۹٫۹.
const fs = require('fs'), path = require('path');
const errors = []; const chk = (c, m) => { if (!c) errors.push(m); };
const T = require(path.join(__dirname, '..', 'tools', 'epi_backtest.js'));
T.applyBase();
const F = global.EPI_FOUND, X = global.EPIX, FM = global.EPI_FM, RULES = global.EPI_RULES;
const info = {};
// ۱) طرح
chk(FM.matter.v.indexOf('مقدمه ظنی') === 3 && FM.matter.v.slice(0, 3).join() === 'منتهی به بدیهی,مقدمه اثبات‌نشده,مقدمه کاذب', 'matter gains «مقدمه ظنی» at the end, old values unchanged');
chk(FM.prem_p && FM.prem_p.t === 'num' && FM.prem_p.st === 'st_aql', 'prem_p is a numeric st_aql feature');
// ۲) قاعده و اشتقاق
const R = RULES.find(r => r.id === 'r_aql_matter_zanni');
chk(R && R.st === 'st_aql' && R.eff === 'cap' && JSON.stringify(R.when) === JSON.stringify({ f: 'matter', eq: 'مقدمه ظنی' }), 'rule fires only on matter «مقدمه ظنی»');
chk(RULES[RULES.length - 1].id === 'r_aql_matter_zanni', 'appended at the end (positive-control order of earlier rules kept)');
const D = F.DER.r_aql_matter_zanni;
chk(D && D.k === 'O' && D.th === 'T_support' && D.cf === 'zanni', 'derivation (p_found_mixture): T_support with the weakest stated degree, < 1 always (T_below1); not T_weakest, not T_unknown');
chk(T.axiomAudit().length === 0, 'axiom audit clean');
const cfg = X.DEFAULT_CFG('mesbah');
const run = f => X.runClaim({ id: 'k', f: Object.assign({ way: 'عقل', form: 'معتبر (قیاسی)' }, f) }, cfg);
let r = run({ matter: 'مقدمه ظنی', prem_p: 99, conf: 100 });
chk(r.ceilx === 99.5 && r.bind === 'r_aql_matter_zanni' && r.flags.some(x => x.st === 'st_aql'), 'valid syllogism, probable premise 99, conf 100 ⇒ ceiling (100+99)/2 = 99.5 and st_aql flagged ' + JSON.stringify(r));
r = run({ matter: 'مقدمه ظنی', prem_p: 60, conf: 90 });
chk(r.ceilx === 80 && r.flags.some(x => x.st === 'st_aql') && run({ matter: 'مقدمه ظنی', prem_p: 60, conf: 80 }).flags.length === 0, 'prem_p 60 ⇒ (100+60)/2 = 80 (T_support), not min(prem_p) = 60 (T_weakest is not a theorem here) ' + JSON.stringify(r));
chk(run({ matter: 'مقدمه ظنی', prem_p: 60, conf: 61, x_about_route: true }).flags.length === 1, 'claim about the proof itself («ثابت شده با این برهان») ⇒ C ⊨ premise ⇒ T_weakest: prem_p (60)');
r = run({ matter: 'مقدمه ظنی', conf: 90 });
chk(r.ceilx === 99.9 && !r.flags.length, 'unstated degree ⇒ still «less than certain», not ½ ' + JSON.stringify(r));
r = run({ matter: 'منتهی به بدیهی', conf: 100 });
chk(r.ceilx === 100 && !r.flags.length, 'self-evident matter unchanged (100)');
chk(run({ matter: 'مقدمه اثبات‌نشده', conf: 90 }).ceilx === 75 && run({ matter: 'مقدمه اثبات‌نشده', conf: 75 }).flags.length === 0 && run({ matter: 'مقدمه اثبات‌نشده', conf: 51, x_about_route: true }).flags.length === 1, 'unproven matter (p_found_mixture): ¾ for the conclusion (T_support), ½ for «proven by this argument» (T_weakest)');
// ۳) پیکره
const cs = T.loadCorpus();
const without = Object.assign({}, cfg, { w: { r_aql_matter_zanni: 0 } });
const moved = cs.filter(c => { const a = T.verdict(c, without), b = T.verdict(c, cfg); return a.kind !== b.kind || a.flagged.join() !== b.flagged.join(); });
chk(moved.length === 0, 'no corpus verdict moved ' + moved.map(c => c.id).join());
// ۴) پیشنهاد
const PR = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'backtest', 'proposals.json'))).proposals;
const PZ = PR.find(p => p.id === 'p_matter_zanni'), PM = PR.find(p => p.id === 'p_found_mixture');
chk(PZ && PZ.applied && PZ.decision && /بدیهیاتِ قطعی/.test(PZ.decision.owner) && PZ.decision.notApplied.length === 3 && /T_below1/.test(PZ.theorem.id) && PZ.decision2 && /\(۱۰۰ \+ prem_p\)\/۲/.test(PZ.decision2.applied.join()), 'proposal applied with the owner\'s standing words; its third part applied after p_found_mixture');
chk(PM && PM.applied && PM.decision && /بی پرسش/.test(PM.decision.owner) && /آمیزه/.test(PM.title), 'mixture inconsistency decided by the owner\'s standing criteria and applied');

(async () => {
  const { chromium } = require('playwright');
  const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', mm => { if (mm.type() === 'error' && !/fonts|ERR_|net::/.test(mm.text())) errors.push('console: ' + mm.text()); });
  await p.route('**/fonts.googleapis.com/**', rr => rr.abort());
  await p.goto(FILE); await p.waitForSelector('.nav');
  const mk = (prem) => p.evaluate(pr => { const c = APP.newCase({ title: 'قیاسِ ظنی', input: 'خبرِ موثق: او در شهر است؛ هر کس در شهر است رأی می‌دهد' });
    c.st.st_tasdiq = { data: { claims: [{ txt: 'او رأی می‌دهد' }] }, done: true }; c.st.st_route = { data: { ways: [{ c: '1', w: 'عقل' }] }, done: true };
    c.st.st_aql = { data: { form: 'قیاس معتبر — نتیجه ضرورتاً لازم می‌آید', prem: pr }, done: true };
    c.st.st_final = { data: { final: [{ c: '1', p: '100' }] }, done: true }; APP.S.put(c); return c.id; }, prem);
  const feat = async (id) => { await p.evaluate(i => APP.go('e_case', i, 'engine'), id); await p.waitForTimeout(350);
    return p.evaluate(i => { const c = APP.S.get(i), k = APP.caseClaims(c)[0], r = EPIX.runClaim(k, APP.btCfg()); return { f: c.feat[1], ceilx: r.ceilx, bind: r.bind, fl: r.flags.map(x => x.st) }; }, id); };
  let id = await mk([{ txt: 'او در شهر است', st: 'ظنی (نقل، استقراء، حافظه، حدس...)', p: '۹۹' }, { txt: 'هر کس در شهر است رأی می‌دهد', st: 'نظریِ منتهی به بدیهی (زنجیره روشن)', p: '100' }]);
  info.a = await feat(id);
  chk(info.a.f && info.a.f.form === 'معتبر (قیاسی)' && info.a.f.matter === 'مقدمه ظنی' && info.a.f.prem_p === 99, 'premise table «ظنی» 99 ⇒ matter «مقدمه ظنی», prem_p 99 ' + JSON.stringify(info.a));
  chk(info.a.ceilx === 99.5 && info.a.bind === 'r_aql_matter_zanni' && info.a.fl.indexOf('st_aql') >= 0, 'real path: conf 100 on a probable-premise syllogism is flagged at st_aql (was 100, no flag) ' + JSON.stringify(info.a));
  chk(await p.evaluate(() => /مادهٔ استدلال ← مقدمه ظنی/.test((document.querySelector('main .feat-prefill') || {}).textContent || '')), 'prefill note names the matter');
  id = await mk([{ txt: 'الف', st: 'ظنی (نقل، استقراء، حافظه، حدس...)', p: '80' }, { txt: 'ب', st: 'ظنی (نقل، استقراء، حافظه، حدس...)', p: '' }]);
  info.b = await feat(id);
  chk(info.b.f.matter === 'مقدمه ظنی' && info.b.f.prem_p == null && info.b.ceilx === 99.9, 'a probable premise without a degree ⇒ no prem_p (the weakest is unknown), still 99.9 ' + JSON.stringify(info.b));
  id = await mk([{ txt: 'الف', st: 'ظنی (نقل، استقراء، حافظه، حدس...)', p: '80' }, { txt: 'ب', st: 'نامعلوم', p: '' }]);
  info.c = await feat(id);
  chk(info.c.f.matter === 'مقدمه اثبات‌نشده' && info.c.f.prem_p == null && info.c.ceilx === 75, 'an «نامعلوم» premise still wins ⇒ unproven, ¾ (T_support) ' + JSON.stringify(info.c));
  chk(await p.locator('#fe_c1_prem_p').count() === 1, 'feature editor shows prem_p');
  console.log(JSON.stringify(info));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.log('ERRORS ' + e.message); process.exit(1); });
