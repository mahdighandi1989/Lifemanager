// T_measured_precedence (p_measured_precedence، مالک ۲۰۲۶-۱۰-۱۵: «آره اثر هر دو جواب بررسی کن و ببین کدوم از بدیهیات اون مد نظر باشه»):
// ۱) قضیه: برهان از A0–A4، با T_pop/T_unknown/T_complete/T_weakest؛ T_universal و پایهٔ سنجیده کنار نمی‌روند.
// ۲) ماشینی: فهرستِ تقدمِ هر پایهٔ جمعیتی را F.measure از خودِ قاب‌ها می‌سازد (بی فهرستِ دستی) — همان مجموعه‌ای که جست‌وجوی کامل می‌دهد؛
//    با سنجیده‌شدنِ پایهٔ دیگر یا عضوی بی‌شرط، خودبه‌خود عوض می‌شود؛ راهِ رسیدنِ ناهمسان در قاب ⇒ بی تقدم.
// ۳) موتور: خواندنِ مستقیم ⇒ نرخِ سنجیده (اقتصاد ۶۰، Nature/Science ۶۱)؛ از واسطه / نامعلوم / بی x_relay ⇒ همان ۵۰؛ روان‌شناسی همان ۰ (T_universal).
// ۴) پیکره: هیچ حکمی عوض نشده؛ audit تمیز. ۵) ابزار: `relay` همه یا هیچ، بی «نامعلوم» برای قاب، بی بازنویسیِ خاموش.
// ۶) صفحه: کاربرگِ «استناد به تخصص» فیلدِ «از کجا خوانده‌ای؟» (برچسب‌دار، با راهنما) دارد و رمزگذاری از آن پر می‌شود؛ زبانهٔ مبنا تقدم را نشان می‌دهد.
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const errors = []; const chk = (c, m) => { if (!c) errors.push(m); };
const T = require(path.join(__dirname, '..', 'tools', 'epi_backtest.js'));
const F = global.EPI_FOUND, X = global.EPIX, FM = global.EPI_FM, RULES = global.EPI_RULES;
const AX = F.AX.map(a => a.id);
const TH = F.TH.T_measured_precedence;
chk(TH && TH.proof && TH.from.join() === 'A0,A1,A2,A3,A4' && TH.from.every(a => AX.indexOf(a) >= 0), 'theorem proved from the axioms A0–A4');
chk(TH && TH.uses.every(t => F.TH[t]) && /T_unknown/.test(TH.proof) && /T_universal/.test(TH.proof) && /x_relay/.test(TH.proof), 'proof names the theorems it uses and its limits');
const RV = FM.x_relay && FM.x_relay.v;
chk(RV && RV.length === 3 && FM.x_relay.st === 'st_expert' && RV[2] === 'نامعلوم', 'x_relay feature in st_expert (direct / relayed / unknown)');
const DIRECT = RV[0], RELAYED = RV[1];
// ۲) ماشینی
const S = T.loadSamples(), m = T.applyBase();
const POP = ['p_expert_econ_lab', 'p_expert_psych08', 'p_expert_socsci_ns'];
chk(S.filter(s => s.x_field).every(s => s.x_relay === DIRECT && s.x_relay_set && s.x_relay_set.why), 'the three frames carry x_relay = direct, set by the tool with a reason');
/* جست‌وجوی کامل و مستقل: همهٔ قاعده‌های سقفی با T_unknown یا پایهٔ سنجیده‌نشده که روی همهٔ اعضای قاب فعال‌اند */
const brute = (b) => { const sel = F.BASE[b].select, its = [];
  S.forEach(s => s.items.forEach(it => { const f = F.frameItemF(s, it); if (Object.keys(sel).every(k => f[k] === sel[k]) && F.sampleItemOk(it)) its.push(f); }));
  return RULES.filter(r => { const d = F.DER[r.id]; return r.eff === 'cap' && d && d.th !== 'T_pop' && (d.th === 'T_unknown' || (d.k === 'S' && !m[d.base].measured)) && its.every(f => X.cond(r.when, f)); }).map(r => r.id); };
POP.forEach(b => chk(m[b].precede && m[b].precede.relay === DIRECT && JSON.stringify(m[b].precede.rules) === JSON.stringify(brute(b)), 'precedence of ' + b + ' = exhaustive search ' + JSON.stringify(m[b].precede)));
chk(JSON.stringify(m.p_expert_econ_lab.precede.rules) === JSON.stringify(['r_aql_matter_unproven', 'r_naql_ahad', 'r_naql_no_qarina']), 'today: the three «no-reason» caps of the frames');
POP.forEach(b => chk(m[b].precede.rules.indexOf('r_istiqra_universal') < 0 && m[b].precede.rules.every(id => F.DER[id].th !== 'T_below1' || F.DER[id].k === 'S'), 'T_universal / ordinal caps never overridden ' + b));
chk(Object.keys(m).filter(b => m[b].precede).every(b => POP.indexOf(b) >= 0), 'only population (T_pop) bases get precedence');
const src = ['epi_engine.js', 'epi_found.js'].map(f => fs.readFileSync(path.join(__dirname, '..', 'src', 'app', f), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:[^"\\]|\\.)*"/g, '')).join('\n');
chk(!/r_naql_ahad|r_aql_matter_unproven|r_naql_no_qarina/.test(src.replace(/r_naql_ahad: S|r_naql_no_qarina: S|r_aql_matter_unproven: B/g, '')), 'no hand-maintained rule list in code');
// p_thiqa سنجیده شود ⇒ r_naql_ahad و r_naql_no_qarina خودبه‌خود از فهرست بیرون می‌روند
const thiqaFrame = { id: 'thq', frame: 'قابِ فرضیِ آزمون — همهٔ گزارش‌های یک ناقل', src: ['x'], selected_by_outcome: false,
  items: [0, 1, 2].map(i => ({ id: 'q' + i, txt: 't', f: { way: 'نقل', narrator: 'موثق' }, truth: true, verified_by: ['سند'] })) };
const m2 = F.measure(S.concat([thiqaFrame]));
chk(m2.p_thiqa.measured && JSON.stringify(m2.p_expert_econ_lab.precede.rules) === JSON.stringify(['r_aql_matter_unproven']), 'a measured base leaves the list by itself ' + JSON.stringify(m2.p_expert_econ_lab.precede));
// یک عضوِ بی‌شرط ⇒ آن قاعده بیرون؛ راهِ رسیدنِ ناهمسان ⇒ بی تقدم
const S3 = JSON.parse(JSON.stringify(S)); S3.find(s => s.id === 'camerer2016_eerp').items[0].f.matter = 'منتهی به بدیهی';
chk(F.measure(S3).p_expert_econ_lab.precede.rules.indexOf('r_aql_matter_unproven') < 0, 'a frame item without the condition ⇒ that cap is not overridden');
const S4 = JSON.parse(JSON.stringify(S)); S4.find(s => s.id === 'camerer2016_eerp').items[0].f.x_relay = RELAYED;
chk(F.measure(S4).p_expert_econ_lab.precede.relay === null && F.measure(S4).p_expert_econ_lab.precede.rules.length === 0, 'mixed relay in a frame ⇒ no precedence');
// ۳) موتور، روی همهٔ اعضای قاب‌ها
const base = X.DEFAULT_CFG('mesbah');
const ceilings = (frame, relay) => { const s = S.find(x => x.id === frame), out = {};
  s.items.forEach(it => { const f = Object.assign({}, F.frameItemF(s, it), { conf: 99 }); if (relay === undefined) delete f.x_relay; else f.x_relay = relay;
    const r = X.runClaim({ id: 'k', f }, base); const key = r.ceil + ' ' + r.bind; out[key] = (out[key] || 0) + 1; });
  return out; };
const one = (o) => Object.keys(o).length === 1 ? Object.keys(o)[0] : JSON.stringify(o);
const N = { camerer2016_eerp: 18, osc2015_rpp: 97, camerer2018_ssrp: 21 };
const EXP = { camerer2016_eerp: ['60 r_expert_pop_econ', '50 r_aql_matter_unproven'], camerer2018_ssrp: ['61 r_expert_pop_socsci', '50 r_aql_matter_unproven'], osc2015_rpp: ['0 r_istiqra_universal', '0 r_istiqra_universal'] };
const info = { engine: {} };
Object.keys(EXP).forEach(fr => { const d = ceilings(fr, DIRECT), rl = ceilings(fr, RELAYED), u = ceilings(fr, 'نامعلوم'), no = ceilings(fr, undefined);
  info.engine[fr] = { direct: one(d), relayed: one(rl), unknown: one(u), none: one(no) };
  chk(one(d) === EXP[fr][0] && d[EXP[fr][0]] === N[fr], fr + ' direct ⇒ ' + EXP[fr][0] + ' ' + JSON.stringify(d));
  [rl, u, no].forEach((o, i) => chk(one(o) === EXP[fr][1] && o[EXP[fr][1]] === N[fr], fr + ' ' + ['relayed', 'unknown', 'no x_relay'][i] + ' ⇒ ' + EXP[fr][1] + ' ' + JSON.stringify(o))); });
const fx = (relay, conf, extra) => X.runClaim({ id: 'k', f: Object.assign({ way: 'تخصص دیگران', x_method: 'معتبر', x_comp: 'احراز شده', chain: 'تک‌منبع', qarina: 'بی‌قرینه', matter: 'مقدمه اثبات‌نشده',
  x_field: FM.x_field.v[0], conf }, relay ? { x_relay: relay } : {}, extra || {}) }, base);
chk(!fx(DIRECT, 60).over && fx(DIRECT, 61).over && fx(DIRECT, 61).flags.every(f => f.st === 'st_expert') && fx(DIRECT, 61).yielded.length === 3, 'direct econ: over 60 flags only st_expert; three caps yielded');
chk(fx(RELAYED, 51).over && fx(RELAYED, 51).flags.some(f => f.st === 'st_aql') && !fx(RELAYED, 51).yielded, 'relayed econ: ½ caps stand and flag their stations');
chk(fx(DIRECT, 51, { x_bias: true }).ceil === 50 && fx(DIRECT, 51, { x_bias: true }).bind === 'r_expert_bias', 'a cap outside the frame condition (bias) still binds');
chk(fx(DIRECT, 99, { x_field: 'نامعلوم' }).ceil === 50 && !fx(DIRECT, 99, { x_field: 'نامعلوم' }).yielded, 'unknown population ⇒ no precedence (½)');
const w0 = Object.assign({}, base, { w: { r_expert_pop_econ: 0 } });
chk(X.runClaim({ id: 'k', f: { way: 'تخصص دیگران', x_method: 'معتبر', x_comp: 'احراز شده', chain: 'تک‌منبع', matter: 'مقدمه اثبات‌نشده', x_field: FM.x_field.v[0], x_relay: DIRECT, conf: 70 } }, w0).ceil === 50, 'population rule switched off ⇒ no precedence');
// ۴) پیکره
const cs = T.loadCorpus();
chk(cs.every(c => (c.claims || []).every(k => !(k.f && (k.f.x_relay || k.f.x_field)))), 'no corpus claim encoded with x_relay/x_field');
const saved = F.PRECEDE; F.PRECEDE = {}; const before = cs.map(c => T.verdict(c, base)); F.PRECEDE = saved; const after = cs.map(c => T.verdict(c, base));
chk(before.every((v, i) => v.kind === after[i].kind && v.flagged.join() === after[i].flagged.join()), 'no corpus verdict moved');
chk(T.axiomAudit().length === 0, 'audit clean ' + JSON.stringify(T.axiomAudit()));
const FJ = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'backtest', 'foundation.json')));
chk(POP.every(b => FJ.base[b].precede && JSON.stringify(FJ.base[b].precede) === JSON.stringify(m[b].precede)), 'foundation.json carries the tool-made precedence (run --rerun)');
const PR = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'backtest', 'proposals.json'))).proposals.find(p => p.id === 'p_measured_precedence');
chk(PR && PR.applied && PR.decision && /بدیهیات/.test(PR.decision.owner) && PR.answers && PR.answers.A && PR.answers.B && PR.answers.B2 && /۶۰/.test(PR.evidence) && PR.decision.notApplied.some(x => /T_universal/.test(x.what)), 'proposal recorded with owner words, answers A/B/B″, numbers');
// ۵) ابزار در پوشهٔ موقت
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'epirelay-'));
fs.mkdirSync(path.join(dir, 'samples')); fs.mkdirSync(path.join(dir, 'corpus'));
const TOOL = path.join(__dirname, '..', 'tools', 'epi_backtest.js');
const tool = (...a) => { try { return { code: 0, out: JSON.parse(execFileSync('node', [TOOL, ...a], { env: Object.assign({}, process.env, { EPI_BT_DIR: dir }), stdio: ['ignore', 'pipe', 'ignore'] }).toString()) }; } catch (e) { return { code: e.status, out: JSON.parse(String(e.stdout || '{}') || '{}') }; } };
const frame = { id: 'fx', frame: 'همهٔ پژوهش‌های یک مجلهٔ معین در یک سالِ معین، پیش از تکرار ثابت شده', src: ['s'], selected_by_outcome: false,
  items: [0, 1].map(i => ({ id: 'i' + i, txt: 't' + i, f: { way: 'تخصص دیگران' }, truth: true, verified_by: ['جدول'] })) };
fs.writeFileSync(path.join(dir, 'fr.json'), JSON.stringify([frame]));
chk(tool('sample', path.join(dir, 'fr.json')).out.added === 1, 'frame added');
const W = (x) => { fs.writeFileSync(path.join(dir, 'r.json'), JSON.stringify(x)); return tool('relay', path.join(dir, 'r.json')); };
const why = 'تعریفِ خودِ قاب پیش از سرانجام';
chk(W([{ frame: 'fx', x_relay: 'نامعلوم', why }]).code === 3, 'a frame cannot be «unknown» relay');
chk(W([{ frame: 'fx', x_relay: 'چیزِ دیگر', why }]).code === 3, 'value outside the schema refused');
chk(W([{ frame: 'fx', x_relay: DIRECT, why: 'کوتاه' }]).code === 3, 'reason required');
chk(W([{ frame: 'fx', x_relay: DIRECT, why }]).code === 0, 'frame relay set');
chk(W([{ frame: 'fx', x_relay: RELAYED, why }]).code === 3, 'no silent overwrite');
const FR = JSON.parse(fs.readFileSync(path.join(dir, 'samples', fs.readdirSync(path.join(dir, 'samples'))[0])))[0];
chk(FR.x_relay === DIRECT && FR.x_relay_set && FR.x_relay_set.why === why, 'relay stored with its reason');

(async () => {
  const { chromium } = require('playwright');
  const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', mm => { if (mm.type() === 'error' && !/fonts|ERR_|net::/.test(mm.text())) errors.push('console: ' + mm.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav');
  const id = await p.evaluate(() => { const c = APP.newCase({ title: 'یافتهٔ پژوهش', input: 'یک پژوهشِ منتشرشده' });
    c.st.st_tasdiq = { data: { claims: [{ txt: 'اثرِ X بر Y' }] }, done: true }; c.st.st_route = { data: { ways: [{ c: '1', w: 'تخصص دیگران' }] }, done: true }; APP.S.put(c); return c.id; });
  await p.evaluate(i => APP.go('e_case', i, 'st_expert'), id); await p.waitForTimeout(200);
  const fld = p.locator('main [data-k="relay"]');
  info.station = { has: await fld.count(), opts: await fld.locator('option').count(), hint: await fld.locator('.fhint').count() ? await fld.locator('.fhint').innerText() : '' };
  chk(info.station.has === 1 && info.station.opts === 4 && /مستقیم/.test(info.station.hint) && /بازگو/.test(info.station.hint) && /نامعلوم/.test(info.station.hint), 'st_expert worksheet shows the relay select with a Persian hint ' + JSON.stringify(info.station));
  chk(await p.evaluate(() => { const l = document.querySelector('main [data-k="relay"] label'); return !!(l && l.getAttribute('for') && document.getElementById(l.getAttribute('for'))); }), 'relay select is labelled');
  await fld.locator('select').selectOption(DIRECT); await p.waitForTimeout(450);
  chk(await p.evaluate(i => ((APP.S.get(i).st.st_expert || {}).data || {}).relay, id) === DIRECT, 'worksheet value stored');
  await p.evaluate(i => APP.go('e_case', i, 'engine'), id); await p.waitForTimeout(250);
  info.feat = await p.evaluate(i => (APP.S.get(i).feat || {})[1], id);
  chk(info.feat && info.feat.x_relay === DIRECT, 'encoding prefilled from the worksheet ' + JSON.stringify(info.feat));
  chk(await p.locator('#fe_c1_x_relay').count() === 1, 'feature editor shows x_relay');
  info.page = await p.evaluate(() => { const V = EPI_FM.x_field.v, R = EPI_FM.x_relay.v, cfg = EPIX.DEFAULT_CFG('mesbah');
    const f = (i, r) => Object.assign({ way: 'تخصص دیگران', x_method: 'معتبر', x_comp: 'احراز شده', chain: 'تک‌منبع', qarina: 'بی‌قرینه', matter: 'مقدمه اثبات‌نشده', x_field: V[i], conf: 99 }, r == null ? {} : { x_relay: R[r] });
    return { direct: [0, 2].map(i => EPIX.runClaim({ id: 'k', f: f(i, 0) }, cfg).ceil), relayed: [0, 2].map(i => EPIX.runClaim({ id: 'k', f: f(i, 1) }, cfg).ceil) }; });
  chk(JSON.stringify(info.page) === JSON.stringify({ direct: [60, 61], relayed: [50, 50] }), 'page engine reads the tool-made precedence from the ledger ' + JSON.stringify(info.page));
  await p.evaluate(() => APP.go('e_bt', null, 'found')); await p.waitForTimeout(300);
  info.found = await p.locator('main .found-precede').count();
  chk(info.found === 3, 'foundation tab shows the precedence of the three population bases ' + info.found);
  await p.setViewportSize({ width: 390, height: 800 }); await p.evaluate(i => APP.go('e_case', i, 'st_expert'), id); await p.waitForTimeout(200);
  chk(await p.evaluate(() => document.documentElement.scrollWidth <= 392), 'no horizontal overflow at 390px');
  console.log(JSON.stringify(info));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.log('ERRORS ' + e.message); process.exit(1); });
