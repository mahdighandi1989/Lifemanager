// تورِ پولیا (دستهٔ ۱، دورِ ۱۹c — تکنیک‌های زمان‌دار، سهمِ «mind» — ۲۰۲۶-۱۰-۱۷) — DECISIONS_R19c، LT4:
//  کارنامهٔ ذهن کارِ تکنیک‌ها را می‌خواند: پرونده‌های تمرین (`practice`، قراردادِ a41) و نشست‌هایشان، روبریکِ برگه‌ها (خودسنجی)، جدول‌های کالیبراسیونِ
//  T24/T32/T33، درصدِ بازیابیِ چرخهٔ ۱-۳-۷ (P3) و برگهٔ سفیدِ هفتگی (P4)؛ هر نشست یک بار، تکرارِ همان روز یک سطر، پس‌گرفته/پیش‌نویس/داوری‌نشده بیرون،
//  هر سطر زیرِ «از کجا؟» (INF17) با منبع و تاریخ و پیوند به رکورد؛ نگاشت به بُعد فقط از راهِ منبعی که کارنامه از پیش می‌نگارد، وگرنه «بی‌نگاشت»؛
//  رکوردِ نمونه/آزمون/تور هرگز.
//  unit    خودِ مدل و نما (بی‌دادهٔ تکنیک: بخشِ خالی؛ برگهٔ T24 عددهای بُعدها را جابه‌جا نمی‌کند)
//  bank    همهٔ موردهای LT4.mind ِ بانکِ مستقل (tests/variants/VARIANTS_R19c.json)
// LLA_FILE = ساختِ دیگر؛ ONLY=unit,bank
// a41_practice.js (سازندهٔ پرونده‌های تمرین) در این دور موازی ساخته می‌شود؛ اگر نیست، رکوردهای practice همین‌جا با همان قرارداد ساخته می‌شوند.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = require('./variants/VARIANTS_R19c.json');

(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0]); } };
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__day = '2026-10-17'; APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    window.D = (n, hh) => { const d = new Date(2026, 9, 17 + n, hh == null ? 10 : hh, 0, 0); return d.toISOString(); };
    window.__wipe = () => { ['practice', 'ex', 'pr', 'fcast', 'case', 'card', 'sched', 'topic', 'kitem', 'pbitem', 'wchain', 'eprog', 'knot'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); };
    window.__put = (r) => APP.S.put(JSON.parse(JSON.stringify(r)), { keepTime: true });
    window.__W = () => { const W = APP.MIND.techWork(); return { rows: W.rows.map(R => ({ key: R.key, tech: R.tech, base: R.base, dim: R.dim, dimHow: R.dimHow, days: R.days, nm: R.nm, first: R.first, last: R.last, pending: R.pending, decline: R.decline || null, stableAt: R.stableAt,
      acts: R.acts.map(a => ({ id: a.id, at: a.at, day: a.day, ok: a.ok, fa: a.fa, v: a.v, kind: a.kind, rep: a.rep, gap: a.gap, go: a.go, src: a.src })) })), cal: { n: W.cal.n, brier: W.cal.brier, hit: W.cal.hit, acts: W.cal.acts.map(c => ({ id: c.id, at: c.at, ok: c.ok, p: c.p, fa: c.fa })) },
      gaps: W.gaps.map(a => ({ id: a.id, day: a.day, gap: a.gap, fa: a.fa })), pending: W.pending }; };
    window.__dimsCal = () => { const m = APP.MIND.model(), o = {}; m.dims.forEach(d => { o[d.id] = { cal: d.cal.map(c => (c.src && c.src.id) || ''), ans: d.ans.length, acts: (APP.MIND.dimActs ? APP.MIND.dimActs(d) : []).map(a => ({ id: a.id, at: a.at, fa: a.fa })) }; }); return o; };
    window.__dom = async () => { APP.go('mind'); await new Promise(r => setTimeout(r, 120)); const sec = document.querySelector('#main section.mind-tech');
      return sec ? { n: sec.getAttribute('data-n'), cal: sec.getAttribute('data-cal'), text: sec.textContent, empty: !!sec.querySelector('.mind-tech-empty'),
        decl: [...sec.querySelectorAll('.mind-tech-decline')].map(x => ({ at: x.getAttribute('data-at'), t: x.textContent })),
        rows: [...sec.querySelectorAll('tr[data-row]')].map(tr => ({ row: tr.getAttribute('data-row'), dim: tr.getAttribute('data-dim'), dimTxt: (tr.querySelector('.mind-tech-dim') || {}).textContent || '' })),
        lis: [...sec.querySelectorAll('li.mind-act')].map(li => ({ act: li.getAttribute('data-act'), at: li.getAttribute('data-at'), ok: li.getAttribute('data-ok'), go: li.getAttribute('data-go'), kind: li.getAttribute('data-kind'), t: li.textContent, btn: !!li.querySelector('.mind-act-go'), list: li.closest('details').getAttribute('data-row') })) } : null; };
  });
  const W = () => p.evaluate(() => __W());
  const dom = () => p.evaluate(() => __dom());
  const wipe = () => p.evaluate(() => __wipe());
  const put = (r) => p.evaluate(r => __put(r), r);
  const prac = (id, tech, subject, sessions, extra) => put(Object.assign({ id, type: 'practice', tech, subject, sessions, state: 'open' }, extra || {}));
  const D = (n, hh) => p.evaluate(([n, hh]) => D(n, hh), [n, hh == null ? null : hh]);
  const t24rows = (k, ok, pend) => Array.from({ length: k }, (_, i) => ({ st: 'گزارهٔ ' + i, conf: String(60 + 5 * (i % 5)), why: '', due: '', out: pend ? '' : (i < ok ? 'درست' : 'نادرست') }));

  // ================= unit =================
  await section('unit', async () => {
    await wipe();
    let d0 = await dom(); chk(d0 && d0.empty, 'unit: بی‌دادهٔ تکنیک بخشِ «🏋 کارِ تکنیک‌ها» با پیامِ خالی دیده نمی‌شود :: ' + JSON.stringify(d0).slice(0, 200));
    const before = await p.evaluate(() => __dimsCal());
    await put({ id: 'ex_u24', type: 'ex', tid: 24, topic: '', status: 'done', data: { preds: t24rows(6, 4) }, rubric: [2, 1, 2, 1, 2, 1], created: await D(0), updated: await D(0) });
    const after = await p.evaluate(() => __dimsCal());
    const sum = o => Object.values(o).reduce((t, x) => t + x.cal.length + x.ans, 0);
    chk(sum(before) === sum(after), 'unit: برگهٔ T24 به عددهای بُعدها افزوده شد (نگاشتِ ساختگی) :: ' + sum(before) + ' → ' + sum(after));
    const w = await W(); const r = w.rows.find(x => x.key.startsWith('ex:24'));
    chk(r && r.dim === null && r.dimHow === 'بی‌نگاشت', 'unit: برگهٔ T24 باید «بی‌نگاشت» باشد :: ' + JSON.stringify(r).slice(0, 200));
    chk(w.cal.n === 6, 'unit: ۶ ردیفِ داوری‌شدهٔ T24 در کالیبراسیونِ برگه‌ها نیامد :: ' + w.cal.n);
    const dd = await dom(); chk(dd && dd.rows.some(x => /بی‌نگاشت/.test(x.dimTxt)) && dd.cal === '6', 'unit: DOM ِ بی‌نگاشت/کالیبراسیون :: ' + JSON.stringify(dd && dd.rows));
    /* دستیار همان را می‌بیند (فقط وقتی نمای کارنامه باز است) */
    const hook = await p.evaluate(() => (APP.ASSIST && APP.ASSIST.promptHooks || []).map(f => { try { return f({}, '') || ''; } catch (e) { return ''; } }).join('\n'));
    chk(/کارِ تکنیک‌ها/.test(hook) && /T24/.test(hook), 'unit: زمینهٔ دستیار در نمای کارنامه از کارِ تکنیک‌ها چیزی ندارد');
    info.unit = 'ok';
  });

  // ================= bank =================
  await section('bank', async () => {
    const E = BANK.filter(e => e.rc === 'LT4.mind'); const r = info.bank = { res: [] };
    const base = BANK.indexOf(E[0]);
    const T = (j, ok, x) => { r.res.push([base + j, !!ok]); chk(ok, 'bank#' + (base + j) + ' «' + E[j].text.slice(0, 70) + '» → ' + E[j].expect.slice(0, 100) + ' :: ' + JSON.stringify(x).slice(0, 700)); };
    chk(E.length === 17, 'bank: باید ۱۷ موردِ LT4.mind باشد، ' + E.length);
    let w, d, R;

    // 57 — T41 retrieval 80/85/90 on days 1, 3, 7 ⇒ three dated lines, source = practice case T41
    await wipe(); await prac('prc_k41', 41, 'قضیهٔ چینی', [{ at: await D(1), done: 'بازیابی', measured: 80 }, { at: await D(3), done: 'بازیابی', measured: 85 }, { at: await D(7), done: 'بازیابی', measured: 90 }]);
    w = await W(); d = await dom(); R = w.rows.find(x => x.key === 'prac:prc_k41');
    let lis = d.lis.filter(x => x.list === 'tech:prac:prc_k41');
    T(0, R && R.acts.length === 3 && R.acts.map(a => a.day).join(',') === '2026-10-18,2026-10-20,2026-10-24' && R.acts.map(a => a.v).join(',') === '80,85,90' && R.last === 90 &&
      lis.length === 3 && lis.every(l => /تمرینِ T41/.test(l.t) && /قضیهٔ چینی/.test(l.t) && l.at && l.btn) && lis.map(l => l.at).sort().join(',') === '2026-10-18,2026-10-20,2026-10-24', { R, lis });

    // 58 — 15 T24 predictions over three days, all resolved ⇒ calibration includes T24 rows (Brier/hit) and names T24 sessions by date, alongside fcast
    await wipe();
    for (const [n, i] of [[0, 1], [4, 2], [9, 3]]) await put({ id: 'ex_a24_' + i, type: 'ex', tid: 24, topic: '', status: 'done', data: { preds: t24rows(5, 3).map(x => Object.assign(x, { st: x.st + ' روز ' + n })) }, rubric: [], created: await D(n), updated: await D(n) });
    await put({ id: 'fc_a1', type: 'fcast', q: 'قراردادِ تازه امضا می‌شود', p: 70, due: '2026-10-25', dim: 's_decision', outcome: 'شد', outcomeAt: await D(8) });
    w = await W(); d = await dom(); let dc = await p.evaluate(() => __dimsCal());
    let s24 = (w.rows.find(x => x.key.startsWith('ex:24')) || { acts: [] }).acts;
    T(1, w.cal.n === 15 && w.cal.brier != null && Math.abs(w.cal.hit - 9 / 15) < 1e-9 && s24.length === 3 && s24.map(a => a.day).join(',') === '2026-10-17,2026-10-21,2026-10-26' &&
      /Brier/.test(d.text) && d.lis.filter(l => l.list === 'techcal').length === 15 && dc.s_decision.cal.includes('fcast:fc_a1'), { cal: w.cal.n, hit: w.cal.hit, s24: s24.map(a => a.day), dec: dc.s_decision.cal });

    // 59 — T32 judgement-of-learning: «8/10 tomorrow» on day 0, 5/10 on day 1 ⇒ resolved day 1, over-confidence +30, «از کجا؟» → T32 2026-10-18
    await wipe(); await prac('prc_l32', 32, 'واژه‌های آلمانی', [{ at: await D(0), done: 'پیش‌بینیِ یادگیری', measured: { pred: 8, of: 10 } }]);
    let w0 = await W();
    await prac('prc_l32', 32, 'واژه‌های آلمانی', [{ at: await D(0), done: 'پیش‌بینیِ یادگیری', measured: { pred: 8, of: 10, actual: 5, resolvedAt: await D(1) } }]);
    w = await W(); d = await dom();
    let g = w.gaps[0], gl = d.lis.filter(l => l.list === 'techgap');
    T(2, w0.gaps.length === 0 && w0.pending === 1 && w.gaps.length === 1 && g.gap === 30 && g.day === '2026-10-18' && /T32/.test(g.fa) && /بیش‌اطمینانی/.test(g.fa) && /\+۳۰/.test(g.fa) && gl.length === 1 && gl[0].at === '2026-10-18', { w0: w0.gaps, g, gl });

    // 60 — weekly blank page on days 7 and 14 ⇒ both recall % with dates 10-24 and 10-31
    await wipe(); await put({ id: 'tp_nt', type: 'topic', title: 'نظریهٔ اعداد' });
    await put({ id: 'pr_w1', type: 'pr', pid: 'P4', topic: 'tp_nt', status: 'done', data: { pct: 60 }, created: await D(7) });
    await put({ id: 'pr_w2', type: 'pr', pid: 'P4', topic: 'tp_nt', status: 'done', data: { pct: 75 }, created: await D(14) });
    w = await W(); d = await dom(); R = w.rows.find(x => x.key.startsWith('P4:'));
    lis = d.lis.filter(x => x.list === 'tech:' + (R && R.key));
    T(3, R && R.acts.length === 2 && R.acts.map(a => a.day + '=' + a.v).join(',') === '2026-10-24=60,2026-10-31=75' && lis.length === 2 && lis.every(l => /برگهٔ سفیدِ هفتگی/.test(l.t) && /نظریهٔ اعداد/.test(l.t)) && /۶۰٪/.test(d.text) && /۷۵٪/.test(d.text), { R, lis });

    // 61 — T13 worksheet with rubric 2/2/1 ⇒ one dated session, labelled self-scored (not measured)
    await wipe(); await put({ id: 'tp_milk', type: 'topic', title: 'شیرِ گرم برای خواب' });
    await put({ id: 'ex_n13', type: 'ex', tid: 13, topic: 'tp_milk', status: 'done', data: {}, rubric: [2, 2, 1], created: await D(0), updated: await D(0) });
    w = await W(); d = await dom(); R = w.rows.find(x => x.key.startsWith('ex:13'));
    lis = d.lis.filter(x => x.list === 'tech:' + (R && R.key));
    T(4, R && R.acts.length === 1 && R.acts[0].day === '2026-10-17' && R.acts[0].v == null && R.nm === 0 && /خودسنجی/.test(R.acts[0].fa) && /اندازه نیست/.test(R.acts[0].fa) && !/اندازه‌گیری‌شده/.test(R.acts[0].fa) && lis.length === 1 && lis[0].ok === '', { R, lis });

    // 62 — T22 case «رد شد» on day 10 ⇒ s_epi moves; «از کجا؟» shows the case, the observation and 2026-10-27
    await wipe();
    const cs = { id: 'case_p22', type: 'case', title: 'قهوه حافظه را بهتر می‌کند', st: { st_final: { done: true, data: { final: [{ c: 'h1', p: 70 }] } } }, outcome: {}, created: await D(0) };
    await put(cs); let e0 = await p.evaluate(() => __dimsCal());
    cs.outcome = { h1: 'نادرست' }; cs.outcomeAt = await D(10); await put(cs);
    await prac('prc_p22', 22, { kind: 'case', id: 'case_p22' }, [{ at: await D(10), done: 'مشاهده: دو هفته بی‌قهوه، نمرهٔ حافظه همان ماند', outcome: 'رد شد' }]);
    let e1 = await p.evaluate(() => __dimsCal()); w = await W(); d = await dom(); R = w.rows.find(x => x.key === 'prac:prc_p22');
    lis = d.lis.filter(x => x.list === 'tech:prac:prc_p22');
    T(5, e0.s_epi.cal.length === 0 && e1.s_epi.cal.length === 1 && e1.s_epi.acts.some(a => /قهوه/.test(a.fa) && /2026-10-27/.test(a.at)) && R && R.dim === 's_epi' && R.acts.length === 1 && R.acts[0].day === '2026-10-27' &&
      /قهوه حافظه/.test(R.acts[0].fa) && /رد شد/.test(R.acts[0].fa) && /مشاهده/.test(R.acts[0].fa) && lis.length === 1 && lis[0].go === 'e_case|case_p22', { e0: e0.s_epi, e1: e1.s_epi, R, lis });

    // 63 — T28 «تثبیت شد» day 7, rewrite failed day 14 ⇒ decline on 10-31 with its reason, not only the earlier success
    await wipe(); await prac('prc_m28', 28, 'فصلِ ۳ اقتصاد', [{ at: await D(7), done: 'بازنویسی از حافظه', outcome: 'موفق', ok: true }, { at: await D(14), done: 'بازنویسی از حافظه', outcome: 'بازنویسی شکست خورد — مرحلهٔ دوم یادم نیامد' }], { state: 'open', history: [{ at: await D(7), state: 'stable' }] });
    w = await W(); d = await dom(); R = w.rows.find(x => x.key === 'prac:prc_m28');
    T(6, R && R.decline && String(R.decline.at).length && d.decl.length === 1 && d.decl[0].at === '2026-10-31' && /شکست/.test(d.decl[0].t) && /تثبیت شد/.test(d.text) && d.lis.some(l => l.at === '2026-10-31' && l.ok === '0'), { R: R && R.decline, decl: d.decl });

    // 64 — T33 pre/post 40% → 80% with a 70% quiz ⇒ fed once, source T33, date 10-17
    await wipe(); await prac('prc_s33', 33, 'فتوسنتز', [{ at: await D(0), done: 'پیش و پس از مطالعه', measured: { pre: 40, post: 80, quiz: 70 } }]);
    w = await W(); d = await dom();
    T(7, w.gaps.length === 1 && w.gaps[0].day === '2026-10-17' && w.gaps[0].gap === 10 && /T33/.test(w.gaps[0].fa) && /۴۰٪/.test(w.gaps[0].fa) && /۸۰٪/.test(w.gaps[0].fa) && /۷۰٪/.test(w.gaps[0].fa) && d.lis.filter(l => l.list === 'techgap').length === 1, { gaps: w.gaps });

    // 65 — T41 started through the assistant, 70% on day 1 ⇒ counts; «از کجا؟» «دستیار ← تمرین T41» and the date
    await wipe(); await prac('prc_h41', 41, 'جدولِ تناوبی', [{ at: await D(1), done: 'بازیابی', measured: 70 }], { by: 'assistant' });
    w = await W(); d = await dom(); lis = d.lis.filter(x => x.list === 'tech:prac:prc_h41');
    T(8, lis.length === 1 && /دستیار ← تمرینِ T41/.test(lis[0].t) && lis[0].at === '2026-10-18' && w.rows[0].nm === 1, { lis });

    // 66 — one T24 prediction that is also the fcast entry and has card confidence ⇒ counted ONCE in calibration
    await wipe();
    await put({ id: 'ex_a24x', type: 'ex', tid: 24, topic: '', status: 'done', data: { preds: [{ st: 'تا جمعه پروژه تحویل می‌شود', conf: '70', why: '', due: '2026-10-23', out: 'درست' }] }, rubric: [], created: await D(0), updated: await D(6) });
    await put({ id: 'fc_a24x', type: 'fcast', q: 'تا جمعه پروژه تحویل می‌شود', p: 70, due: '2026-10-23', dim: 's_decision', outcome: 'شد', outcomeAt: await D(6) });
    await put({ id: 'card_a24x', type: 'card', q: 'تا جمعه پروژه تحویل می‌شود؟', a: 'بله', src: 'ex_a24x', ef: 2.5, n: 1, iv: 1, due: '2026-10-18', hist: [{ d: '2026-10-17', g: 4, c: 70 }] });
    w = await W(); dc = await p.evaluate(() => __dimsCal()); d = await dom();
    let allCal = Object.values(dc).reduce((t, x) => t.concat(x.cal), []);
    T(9, w.cal.n === 0 && allCal.filter(id => /a24x/.test(id)).length === 1 && allCal.includes('fcast:fc_a24x') && /دفترِ 🎯/.test(d.text) && (w.rows[0] || {}).dim === 's_decision', { tech: w.cal.n, allCal });

    // 67 — a tour/test run creates a T41 case on the owner's account ⇒ nothing on the card or «از کجا؟»
    await wipe(); await prac('prc_tour', 41, 'تورِ آزمایشی', [{ at: await D(15), done: 'بازیابی', measured: 90 }], { test: true });
    await prac('prc_tour2', 41, 'تورِ آزمایشی ۲', [{ at: await D(15), done: 'بازیابی', measured: 95 }], { tour: true });
    await prac('prc_smp', 41, 'نمونه', [{ at: await D(15), done: 'بازیابی', measured: 95 }], { sample: true });
    await put({ id: 'ex_tour', type: 'ex', tid: 13, topic: '', status: 'done', data: {}, rubric: [2, 2, 2], sample: true, created: await D(15), updated: await D(15) });
    w = await W(); d = await dom();
    T(10, w.rows.length === 0 && w.cal.n === 0 && d.empty && !/تورِ آزمایشی|نمونه/.test(d.text), { rows: w.rows.length, t: d.text.slice(0, 120) });

    // 68 — three T41 retrievals on day 1 ⇒ one line for that day, not three
    await wipe(); await prac('prc_k3', 41, 'قضیهٔ چینی', [{ at: await D(1, 9), done: 'بازیابی', measured: 60 }, { at: await D(1, 13), done: 'بازیابی', measured: 70 }, { at: await D(1, 18), done: 'بازیابی', measured: 75 }]);
    w = await W(); d = await dom(); lis = d.lis.filter(x => x.list === 'tech:prac:prc_k3');
    T(11, w.rows[0].acts.length === 1 && w.rows[0].acts[0].rep === 3 && w.rows[0].acts[0].v === 75 && lis.length === 1 && lis[0].at === '2026-10-18', { acts: w.rows[0].acts, lis: lis.length });

    // 69 — five T24 predictions not yet due ⇒ not counted as hits or misses
    await wipe(); await put({ id: 'ex_a24p', type: 'ex', tid: 24, topic: '', status: 'done', data: { preds: t24rows(5, 0, true) }, rubric: [], created: await D(0), updated: await D(0) });
    w = await W(); d = await dom();
    T(12, w.cal.n === 0 && w.pending === 5 && w.rows[0].acts[0].ok === null && /در انتظارِ داوری/.test(w.rows[0].acts[0].fa) && !/درست/.test(w.rows[0].acts[0].fa.replace('شمرده نشد', '')) && d.cal === '0', { cal: w.cal.n, pending: w.pending, fa: w.rows[0].acts[0].fa });

    // 70 — a half-done T23 draft ⇒ does not reach the card (nor a draft practice session)
    await wipe(); await put({ id: 'ex_l23', type: 'ex', tid: 23, topic: '', status: 'draft', data: { x: 'نیمه' }, rubric: [1], created: await D(0), updated: await D(0) });
    await prac('prc_l23', 23, 'تصمیمِ شغلی', [{ at: await D(0), done: 'نیمه‌کاره', score: 1, draft: true }]);
    w = await W(); d = await dom();
    T(13, w.rows.length === 0 && d.empty, { rows: w.rows });

    // 71 — the AI critic gives Nima's T13 sheet 90 ⇒ never shown as Nima's own measured result
    await wipe(); await put({ id: 'ex_n13ai', type: 'ex', tid: 13, topic: '', status: 'done', data: {}, rubric: [1, 1, 1], ai: 'نمرهٔ منتقد: ۹۰ از ۱۰۰', created: await D(0), updated: await D(0) });
    await prac('prc_n13ai', 13, 'شیرِ گرم', [{ at: await D(0), done: 'برگهٔ ادعا', measured: { v: 90, by: 'ai' } }, { at: await D(2), done: 'برگهٔ ادعا', measured: 90, measuredBy: 'ai' }]);
    w = await W(); d = await dom();
    T(14, w.rows.every(x => x.nm === 0) && !/۹۰/.test(d.text) && !d.lis.some(l => /اندازه‌گیری‌شده/.test(l.t)), { rows: w.rows.map(x => [x.key, x.nm]), t: d.lis.map(l => l.t) });

    // 72 — Ali teaches his brother (T29), brother 3/5 ⇒ not Ali's own skill (may appear as teaching activity)
    await wipe(); await prac('prc_a29', 29, 'کسرها', [{ at: await D(0), done: 'یاد دادن', learner: 'برادرم', measured: { v: 3, of: 5 } }]);
    w = await W(); d = await dom(); R = w.rows[0];
    T(15, R && R.nm === 0 && R.acts.length === 1 && R.acts[0].kind === 'teach' && R.acts[0].v == null && R.acts[0].ok === null && /یاد دادن به «برادرم»/.test(R.acts[0].fa) && /مالِ خودِ اوست/.test(R.acts[0].fa) && !/اندازه‌گیری‌شده/.test(d.text) && w.cal.n === 0 && w.gaps.length === 0, { R });

    // 73 — T13 day 0, another T13 day 5 ⇒ every line dated and opens its source record (never «تمرین‌ها: ۲»)
    await wipe();
    await put({ id: 'ex_n13a', type: 'ex', tid: 13, topic: '', status: 'done', data: {}, rubric: [2, 1], created: await D(0), updated: await D(0) });
    await put({ id: 'ex_n13b', type: 'ex', tid: 13, topic: '', status: 'done', data: {}, rubric: [2, 2], created: await D(5), updated: await D(5) });
    d = await dom(); lis = d.lis.filter(l => /^tech:/.test(l.list));
    let go0 = lis.find(l => l.act === 'ex:ex_n13a');
    await p.evaluate(() => { const bt = document.querySelector('#main li[data-act="ex:ex_n13a"] .mind-act-go'); if (bt) bt.click(); }); await p.waitForTimeout(200);
    let st = await p.evaluate(() => ({ view: APP.state && APP.state.view, arg: APP.state && APP.state.arg, sub: APP.state && APP.state.sub }));
    T(16, lis.length === 2 && lis.every(l => /^2026-10-\d\d$/.test(l.at) && l.btn && l.go) && lis.map(l => l.at).sort().join(',') === '2026-10-17,2026-10-22' && go0 && go0.go === 'tech|13|ws:ex_n13a' &&
      st.view === 'tech' && !/تمرین‌ها: ۲/.test(d.text), { lis, st });
  });

  await b.close();
  console.log(JSON.stringify(info, null, 1));
  if (info.bank) console.log('bank LT4.mind: ' + info.bank.res.filter(x => x[1]).length + '/' + info.bank.res.length + (info.bank.res.some(x => !x[1]) ? ' — fail: ' + info.bank.res.filter(x => !x[1]).map(x => '#' + x[0]).join(',') : ''));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
