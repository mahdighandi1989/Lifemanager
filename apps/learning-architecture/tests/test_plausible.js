// استدلالِ معقول — T_plausible (p_plausible_reasoning، مالک ۲۰۲۶-۱۰-۱۵: «موافقم»):
// ۱) قضیه: برهان از A0–A4 با قضیه‌های موجود؛ عددها با انتگرالِ عددیِ مستقل از همان مدل وارسی می‌شوند ((n+1)/(n+2)، سقف بودن با لزومِ ناقص، (k+1)/(n+2)، k نامعلوم ⇒ ½).
// ۲) ویژگی‌ها: n، k، تازگی، عضویت در st_aql با قاعدهٔ رمزگذاریِ کور. ۳) قاعده‌ها: دو قاعدهٔ «فراتر از جزوه» (basis: beyond، proof: T_plausible) در انتهای فهرست،
//    اشتقاق در F.DER، هیچ عددِ قراردادی، audit تمیز، کنترلِ مثبت. ۴) سقف‌ها در موتور. ۵) پیکره: هیچ حکمی عوض نشده. ۶) پیشنهاد ثبت‌شده با سخنِ مالک.
// ۷) صفحه: کاربرگِ «راه عقل و برهان» فیلدهای برچسب‌دار با راهنمای فارسی (فقط برای صورتِ استقرائی/تمثیلی)، پرشدنِ رمزگذاری، برچسبِ «فراتر از جزوه»، ۳۹۰px.
const fs = require('fs'), path = require('path');
const errors = []; const chk = (c, m) => { if (!c) errors.push(m); };
const T = require(path.join(__dirname, '..', 'tools', 'epi_backtest.js'));
T.applyBase();
const F = global.EPI_FOUND, X = global.EPIX, FM = global.EPI_FM, RULES = global.EPI_RULES;
const AX = F.AX.map(a => a.id);
const info = {};
// ۱) قضیه
const TH = F.TH.T_plausible;
chk(TH && TH.proof && TH.from.join() === 'A0,A1,A2,A3,A4' && TH.from.every(a => AX.indexOf(a) >= 0), 'T_plausible proved from A0–A4');
chk(TH && TH.uses.every(t => F.TH[t]) && ['T_next', 'T_pop', 'T_unknown', 'T_weakest', 'T_null', 'T_conflict', 'T_below1'].every(t => TH.uses.indexOf(t) >= 0), 'proof names the existing theorems it uses');
chk(/\(n\+1\)\/\(n\+2\)/.test(TH.proof) && /\(k\+1\)\/\(n\+2\)/.test(TH.proof) && /qⁿ/.test(TH.proof) && /conflict_cert/.test(TH.proof) && /vazraf/.test(TH.proof) && /نه فقط موافق‌ها/.test(TH.proof), 'proof covers value, ceiling under partial entailment, analogy selection, refutation and vazraf limits');
// انتگرالِ عددی (مستقل از فرمول): پیشینِ یکنواخت روی θ
const integ = (g) => { let s = 0; const N = 20000; for (let i = 0; i < N; i++) { const t = (i + 0.5) / N; s += g(t); } return s / N; };
[0, 1, 2, 3, 5, 9].forEach(n => {
  const pNotH = integ(t => Math.pow(t, n));                       // P(C₁…Cₙ|¬H)
  const post = 0.5 / (0.5 + 0.5 * pNotH);                          // P(H)=½ (A4)
  chk(Math.abs(post - (n + 1) / (n + 2)) < 1e-4, 'posterior after ' + n + ' confirmed consequences = (n+1)/(n+2): ' + post);
  [0.5, 0.8, 0.95, 1].forEach(q => { const pq = 0.5 * Math.pow(q, n) / (0.5 * Math.pow(q, n) + 0.5 * pNotH); chk(pq <= (n + 1) / (n + 2) + 1e-9, 'partial entailment q=' + q + ' never exceeds the ceiling (n=' + n + ')'); });
  for (let k = 0; k <= n; k++) {
    const r = integ(t => Math.pow(t, k + 1) * Math.pow(1 - t, n - k)) / integ(t => Math.pow(t, k) * Math.pow(1 - t, n - k));
    chk(Math.abs(r - (k + 1) / (n + 2)) < 1e-4, 'analogy k=' + k + ' of n=' + n + ' ⇒ (k+1)/(n+2): ' + r);
  }
  let avg = 0; for (let k = 0; k <= n; k++) avg += (k + 1) / (n + 2) / (n + 1);
  chk(Math.abs(avg - 0.5) < 1e-12, 'unknown k (A4 over k) ⇒ ½ for n=' + n);
});
// ۲) ویژگی‌ها
const FK = ['x_conseq_n', 'x_conseq_new', 'x_analog_n', 'x_analog_k', 'x_analog_rel'];
chk(FK.every(k => FM[k] && FM[k].st === 'st_aql'), 'five features in st_aql');
chk(FM.x_conseq_n.t === 'num' && FM.x_analog_n.t === 'num' && FM.x_analog_k.t === 'num', 'n and k are counts');
chk(FM.x_conseq_new.v.length === 3 && /^تازه/.test(FM.x_conseq_new.v[0]) && FM.x_conseq_new.v[2] === 'نامعلوم', 'novelty: new / known before / unknown');
chk(FM.x_analog_rel.v.join() === 'احراز شد,فقط همانندیِ ظاهری,نامعلوم', 'membership: established / superficial / unknown');
const featSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'epi_feat.js'), 'utf8');
chk(/رمزگذاریِ کور: شمارها و وضع‌ها فقط از لفظِ تصدیق و داستان/.test(featSrc) && /هرگز از سرانجام/.test(featSrc) && /x_conseq_n را ننویس/.test(featSrc), 'blind-encoding rule written next to the features');
// ۳) قاعده‌ها
const RC = RULES.find(r => r.id === 'r_aql_conseq'), RA = RULES.find(r => r.id === 'r_aql_analogy');
chk(RC && RA && RC.st === 'st_aql' && RA.st === 'st_aql' && RC.eff === 'cap' && RA.eff === 'cap', 'two cap rules in st_aql');
chk([RC, RA].every(r => r.basis === 'beyond' && r.proof === 'T_plausible' && r.capf), 'basis beyond, proof T_plausible, formula cap');
// بعد از این دو فقط قاعده‌هایی که بعداً افزوده شده‌اند (p_matter_zanni، ۲۰۲۶-۱۰-۱۵) — ترتیبِ سناریوهای ساختگیِ پیشین دست نخورده
const iRC = RULES.indexOf(RC), LATER = ['r_aql_matter_zanni'];
chk(RULES[iRC + 1] === RA && RULES.slice(iRC + 2).every(r => LATER.indexOf(r.id) >= 0), 'appended at the end (earlier synthetic scenarios keep their order)');
chk(F.DER.r_aql_conseq.th === 'T_plausible' && F.DER.r_aql_conseq.cf === 'conseq' && F.DER.r_aql_analogy.th === 'T_plausible' && F.DER.r_aql_analogy.cf === 'analogy', 'derivations in F.DER');
const rep = F.report(RULES).filter(r => r.id === 'r_aql_conseq' || r.id === 'r_aql_analogy');
chk(rep.length === 2 && rep.every(r => r.consistent && !r.conventional), 'no conventional number ' + JSON.stringify(rep.map(r => [r.id, r.consistent, r.conventional])));
chk(RULES.find(r => r.id === 'r_aql_nondeductive') && F.DER.r_aql_nondeductive.th === 'T_below1', 'r_aql_nondeductive stays');
chk(!RULES.some(r => /رد/.test(r.id) || r.id === 'r_aql_conseq_refuted'), 'no separate «refuted ⇒ 0» rule');
chk(T.axiomAudit().length === 0, 'audit clean ' + JSON.stringify(T.axiomAudit()));
const syn = X.genSynth(X.seedCases(), 1, {}), cfg = X.DEFAULT_CFG('mesbah');
['r_aql_conseq', 'r_aql_analogy'].forEach(id => { const b = syn.filter(c => c.plant === id && c.truth.ok === false), g = syn.filter(c => c.plant === id && c.truth.ok === true);
  chk(b.length && b.every(c => X.runCase(c, cfg).flagged.indexOf('st_aql') >= 0) && g.every(c => X.runCase(c, cfg).healthy), 'positive control for ' + id); });
// ۴) سقف‌ها در موتور
const NEW = FM.x_conseq_new.v[0], OLD = FM.x_conseq_new.v[1];
const run = (f) => X.runClaim({ id: 'k', f: Object.assign({ form: 'غیرقیاسی (استقرا/تمثیل)' }, f) }, cfg);
const capOf = (id, f) => X.capOf(cfg, RULES.find(r => r.id === id), Object.assign({ form: 'غیرقیاسی (استقرا/تمثیل)' }, f));
info.conseq = [0, 1, 3, 9].map(n => run({ x_conseq_n: n, x_conseq_new: NEW, conf: 99 }).ceil);
chk(JSON.stringify(info.conseq) === '[50,67,80,91]', 'novel consequences: 0 ⇒ 50, 1 ⇒ 67, 3 ⇒ 80, 9 ⇒ 91 ' + JSON.stringify(info.conseq));
chk(run({ x_conseq_n: 3, x_conseq_new: NEW, conf: 99 }).bind === 'r_aql_conseq' && run({ x_conseq_n: 3, x_conseq_new: NEW, conf: 99 }).fired.indexOf('r_aql_nondeductive') >= 0, 'binds while r_aql_nondeductive still fires (T_weakest)');
chk([OLD, 'نامعلوم', undefined].every(v => capOf('r_aql_conseq', { x_conseq_n: 9, x_conseq_new: v }) === 50), 'known-before / unknown / missing novelty ⇒ n = 0 ⇒ 50');
chk(capOf('r_aql_conseq', { x_conseq_n: 100000, x_conseq_new: NEW }) < 100, 'never 100');
let mono = true; for (let n = 0; n < 50; n++) if (capOf('r_aql_conseq', { x_conseq_n: n + 1, x_conseq_new: NEW }) < capOf('r_aql_conseq', { x_conseq_n: n, x_conseq_new: NEW })) mono = false;
chk(mono, 'a confirmed new consequence never lowers the ceiling (A1+A3)');
chk(run({ x_conseq_n: 3, x_conseq_new: NEW, conf: 85 }).over && run({ x_conseq_n: 3, x_conseq_new: NEW, conf: 85 }).flags.some(f => f.st === 'st_aql') && !run({ x_conseq_n: 3, x_conseq_new: NEW, conf: 80 }).over, 'flags st_aql only above (n+1)/(n+2)');
chk(run({ x_conseq_n: 3, x_conseq_new: NEW, vazraf: true, conf: 99 }).fired.indexOf('r_aql_conseq') < 0, 'vazraf excluded');
chk(X.runClaim({ id: 'k', f: { form: 'معتبر (قیاسی)', x_conseq_n: 3, x_conseq_new: NEW } }, cfg).fired.indexOf('r_aql_conseq') < 0, 'deductive form excluded');
info.analogy = { k3n4: capOf('r_aql_analogy', { x_analog_n: 4, x_analog_k: 3, x_analog_rel: 'احراز شد' }), k0n4: capOf('r_aql_analogy', { x_analog_n: 4, x_analog_k: 0, x_analog_rel: 'احراز شد' }),
  k9n9: capOf('r_aql_analogy', { x_analog_n: 9, x_analog_k: 9, x_analog_rel: 'احراز شد' }), sup: capOf('r_aql_analogy', { x_analog_n: 9, x_analog_k: 9, x_analog_rel: 'فقط همانندیِ ظاهری' }),
  unk: capOf('r_aql_analogy', { x_analog_n: 9, x_analog_k: 9, x_analog_rel: 'نامعلوم' }), noRel: capOf('r_aql_analogy', { x_analog_n: 9, x_analog_k: 9 }), noK: capOf('r_aql_analogy', { x_analog_n: 9, x_analog_rel: 'احراز شد' }),
  kOver: capOf('r_aql_analogy', { x_analog_n: 2, x_analog_k: 5, x_analog_rel: 'احراز شد' }) };
const A = info.analogy;
chk(Math.abs(A.k3n4 - 400 / 6) < 1e-9 && Math.abs(A.k0n4 - 100 / 6) < 1e-9 && Math.abs(A.k9n9 - 1000 / 11) < 1e-9, 'analogy (k+1)/(n+2) ' + JSON.stringify(A));
chk(A.sup === 50 && A.unk === 50 && A.noRel === 50 && A.noK === 50, 'superficial / unknown membership or unknown k ⇒ 50');
chk(Math.abs(A.kOver - 75) < 1e-9, 'k is clipped to n');
chk(run({ x_analog_n: 9, x_analog_k: 9, x_analog_rel: 'فقط همانندیِ ظاهری', conf: 85 }).flags.some(f => f.st === 'st_aql'), 'superficial analogy at 85 flags st_aql');
// ۵) پیکره
const cs = T.loadCorpus();
// روتینِ بک‌تست ۲۰۲۶-۱۰-۱۵: پیکره با رمزگذارِ کورِ جدا (دو رمزگذار + بازبینِ مستقل) این ویژگی‌ها را گرفت — هر مقدارِ آن‌ها باید در دفترِ همان کار باشد
const RCD = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'backtest', 'reviews', 'recode-2026-10-15-corpus.json'), 'utf8'));
const RCK = {}; RCD.applied.forEach(a => { RCK[a.case + '/' + a.claim + '/' + a.key] = a.value; });
chk(cs.every(c => (c.claims || []).every(k => FK.every(x => !(k.f && k.f[x] != null) || RCK[c.id + '/' + k.id + '/' + x] === k.f[x]))), 'every corpus value of the new features comes from the recorded blind re-encode');
info.corpusPlausible = Object.keys(RCK).filter(x => FK.indexOf(x.split('/')[2]) >= 0).length;
chk(info.corpusPlausible >= 10, 'the blind re-encode gave the corpus plausible-reasoning values ' + info.corpusPlausible);
const without = Object.assign({}, cfg, { w: { r_aql_conseq: 0, r_aql_analogy: 0 } });
const moved = cs.filter(c => { const a = T.verdict(c, without), b = T.verdict(c, cfg); return a.kind !== b.kind || a.flagged.join() !== b.flagged.join(); });
// پس از رمزگذاریِ کورِ پیکره (روتینِ بک‌تست ۲۰۲۶-۱۰-۱۵) این دو قاعده روی پیکره می‌تابند: هیچ حکمی (نوع) نباید جابه‌جا شود؛ پرچمِ افزوده فقط روی واقعهٔ شکست
const brokeKind = cs.filter(c => T.verdict(c, without).kind !== T.verdict(c, cfg).kind);
chk(brokeKind.length === 0, 'no corpus verdict moved ' + brokeKind.map(c => c.id).join());
chk(moved.every(c => c.truth && c.truth.ok === false), 'extra flags only on real failures ' + moved.map(c => c.id).join());
info.plausibleFlagged = moved.map(c => c.id);
info.nondeductiveOnly = cs.reduce((a, c) => a.concat((c.claims || []).filter(k => k.f && k.f.form === 'غیرقیاسی (استقرا/تمثیل)' && X.runClaim(k, cfg).bind === 'r_aql_nondeductive').map(k => c.id)), []);
chk(info.nondeductiveOnly.indexOf('cs_leverrier_vulcan') < 0, 'Le Verrier (analogy with Neptune, relation unknown) is now capped by r_aql_analogy, not only «less than certain» ' + info.nondeductiveOnly.join());
// ۶) پیشنهاد و جزوهٔ متقن
const PR = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'backtest', 'proposals.json'))).proposals.find(p => p.id === 'p_plausible_reasoning');
chk(PR && PR.applied && PR.appliedWhat && PR.decision && PR.decision.owner === '«موافقم»' && PR.decision.notApplied.some(x => /ردشده/.test(x.what)) && /هیچ حکم/.test(PR.decision.effect), 'proposal applied with owner word, not-applied parts and effect');
const VB = fs.readFileSync(path.join(__dirname, '..', 'docs', 'VERIFIED_BOOKLET.md'), 'utf8');
chk(/## فراتر از جزوه/.test(VB) && /`r_aql_conseq`/.test(VB) && /`r_aql_analogy`/.test(VB), 'verified booklet lists the beyond-the-booklet rules');

(async () => {
  const { chromium } = require('playwright');
  const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', mm => { if (mm.type() === 'error' && !/fonts|ERR_|net::/.test(mm.text())) errors.push('console: ' + mm.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav');
  const id = await p.evaluate(() => { const c = APP.newCase({ title: 'تمثیلِ آزمون', input: 'چند موردِ همانند' });
    c.st.st_tasdiq = { data: { claims: [{ txt: 'این دارو بر این بیمار هم اثر می‌کند' }] }, done: true }; c.st.st_route = { data: { ways: [{ c: '1', w: 'عقل' }] }, done: true }; APP.S.put(c); return c.id; });
  await p.evaluate(i => APP.go('e_case', i, 'st_aql'), id); await p.waitForTimeout(250);
  const K = ['conseq_n', 'conseq_new', 'analog_n', 'analog_k', 'analog_rel'];
  const vis = () => p.evaluate(K => K.map(k => { const e = document.querySelector('main [data-k="' + k + '"]'); return e ? (e.style.display === 'none' ? 0 : 1) : -1; }), K);
  info.hidden = await vis();
  chk(JSON.stringify(info.hidden) === '[0,0,0,0,0]', 'fields hidden until the form is inductive/analogical ' + JSON.stringify(info.hidden));
  await p.locator('main [data-k="form"] select').selectOption('تمثیلی (از شباهت)'); await p.waitForTimeout(200);
  info.shown = await vis();
  chk(JSON.stringify(info.shown) === '[1,1,1,1,1]', 'analogical form shows the five fields ' + JSON.stringify(info.shown));
  info.ws = await p.evaluate(K => K.map(k => { const e = document.querySelector('main [data-k="' + k + '"]'), l = e && e.querySelector('label'), c = l && document.getElementById(l.getAttribute('for')), hn = e && e.querySelector('.fhint');
    return { label: l ? l.textContent : '', ctl: !!c, hint: hn ? hn.textContent : '', opts: e ? e.querySelectorAll('option').length : 0 }; }), K);
  chk(info.ws.every(x => x.ctl && /[؀-ۿ]/.test(x.label) && /[؀-ۿ]/.test(x.hint)), 'labelled fields with Persian hints');
  chk(info.ws[1].opts === 4 && info.ws[4].opts === 4, 'selects carry the feature schema options');
  chk(/\(n\+1\)÷\(n\+2\)/.test(info.ws[0].hint) && /رد شد/.test(info.ws[0].hint) && /ظاهری/.test(info.ws[4].hint) && /موافق‌ها/.test(info.ws[2].hint), 'hints state the theorem and the encoding rule');
  await p.locator('main [data-k="analog_n"] input').fill('۴'); /* رقمِ فارسی (ممیزیِ دورِ ۴: type=number آن را خالی می‌گذاشت) */ await p.locator('main [data-k="analog_k"] input').fill('3');
  await p.locator('main [data-k="analog_rel"] select').selectOption('احراز شد'); await p.waitForTimeout(450);
  info.data = await p.evaluate(i => { const d = (APP.S.get(i).st.st_aql || {}).data || {}; return { n: d.analog_n, k: d.analog_k, rel: d.analog_rel }; }, id);
  chk(info.data.n === 4 && info.data.k === 3 && info.data.rel === 'احراز شد', 'worksheet values stored as numbers ' + JSON.stringify(info.data));
  await p.locator('main [data-k="form"] select').selectOption('قیاس معتبر — نتیجه ضرورتاً لازم می‌آید'); await p.waitForTimeout(150);
  chk(JSON.stringify(await vis()) === '[0,0,0,0,0]', 'deductive form hides them again');
  await p.locator('main [data-k="form"] select').selectOption('تمثیلی (از شباهت)'); await p.waitForTimeout(450);
  await p.evaluate(i => APP.go('e_case', i, 'engine'), id); await p.waitForTimeout(300);
  info.feat = await p.evaluate(i => (APP.S.get(i).feat || {})[1], id);
  chk(info.feat && info.feat.x_analog_n === 4 && info.feat.x_analog_k === 3 && info.feat.x_analog_rel === 'احراز شد' && info.feat.x_conseq_n == null, 'encoding prefilled from the worksheet ' + JSON.stringify(info.feat));
  // ممیزیِ دورِ ۴: «صورتِ استدلال» هم از کاربرگ پیش‌پر می‌شود ⇒ قاعده روی پروندهٔ واقعیِ کاربر می‌تابد (نه فقط با رمزگذاریِ دستی)
  chk(info.feat && info.feat.form === 'غیرقیاسی (استقرا/تمثیل)', 'argument form prefilled from the worksheet ' + JSON.stringify(info.feat));
  info.flow = await p.evaluate(i => { const f = Object.assign({ conf: 95 }, APP.S.get(i).feat[1]); return EPIX.runClaim({ id: 'k', f: f }, APP.btCfg()).ceil; }, id);
  chk(info.flow === 67, 'the user case itself is capped by T_plausible (67), not «no error · 100» ' + info.flow);
  chk(await p.evaluate(() => /صورتِ استدلال ← غیرقیاسی/.test((document.querySelector('main .feat-prefill') || {}).textContent || '')), 'prefill note names the argument form');
  chk(await p.locator('#fe_c1_x_analog_rel').count() === 1 && await p.locator('#fe_c1_x_conseq_n').count() === 1, 'feature editor shows the new features');
  info.page = await p.evaluate(() => { const cfg = EPIX.DEFAULT_CFG('mesbah'), f = { form: 'غیرقیاسی (استقرا/تمثیل)', conf: 99 };
    return [EPIX.runClaim({ id: 'k', f: Object.assign({ x_analog_n: 4, x_analog_k: 3, x_analog_rel: 'احراز شد' }, f) }, cfg).ceil, EPIX.runClaim({ id: 'k', f: Object.assign({ x_conseq_n: 3, x_conseq_new: EPI_FM.x_conseq_new.v[0] }, f) }, cfg).ceil]; });
  chk(JSON.stringify(info.page) === '[67,80]', 'page engine gives the theorem ceilings ' + JSON.stringify(info.page));
  await p.evaluate(() => APP.go('e_living', null, 'r_aql_conseq')); await p.waitForTimeout(400);
  info.chip = await p.evaluate(() => ['r_aql_conseq', 'r_aql_analogy'].map(id => { const e = document.querySelector('#lr-' + id + ' .chip.beyond'); return e ? e.textContent : ''; }));
  chk(info.chip.every(t => /فراتر از جزوه/.test(t) && /T_plausible/.test(t)), 'rule library marks them «beyond the booklet» ' + JSON.stringify(info.chip));
  await p.setViewportSize({ width: 390, height: 800 }); await p.evaluate(i => APP.go('e_case', i, 'st_aql'), id); await p.waitForTimeout(250);
  chk(await p.evaluate(() => document.documentElement.scrollWidth <= 392), 'no horizontal overflow at 390px');
  console.log(JSON.stringify(info));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.log('ERRORS ' + e.message); process.exit(1); });
