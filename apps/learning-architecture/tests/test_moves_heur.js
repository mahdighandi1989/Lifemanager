// تونل‌های «حرکت‌ها، سرنخ، نردبان، فاصله‌گذاری» (۲۰۲۶-۱۰-۱۵) روی صفحهٔ واقعی (dist/learning-architecture.html):
// ت۴ پرسشِ هر حرکت + سرنخِ سه‌پله‌ای در شبیه‌ساز (سطحِ ۱ و ۲، با همان هزینهٔ سرنخِ سطحِ ۲)؛ ت۵ ۱۱ حرکتِ افزوده با نمونه و ورزش؛
// ت۳ فاصله‌گذاریِ حرکت‌ها و گام‌های شبیه‌ساز در «امروز»؛ ت۶ نردبانِ گره‌گشا (پلهٔ ۲، پرسش‌های طرح‌ریزیِ چرخان، بازنگری پس از «باز شد»،
// راهِ مستقیم از شبیه‌ساز، KLADDER)؛ ت۱۳ جدولِ ترجمه و سازنده‌های کد روی صفحهٔ حرکت؛ ت۱۲ مسئله‌های کوتاه در شبیه‌ساز؛ ت۱۶ قالبِ مسئلهٔ عملی.
// خطا ⇒ کدِ خروجِ غیرصفر.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const chk = (c, m) => { if (!c) errors.push(m); };
  try {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    p.on('pageerror', e => errors.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(300);
    const go = async (...a) => { await p.evaluate(x => APP.go(...x), a); await p.waitForTimeout(120); if (await p.locator('main .card.bad').count()) errors.push('render ' + a.join('/') + ': ' + await p.locator('main .card.bad').first().innerText()); };
    const NEWMV = ['mv_unknown', 'mv_auxiliary', 'mv_partcond', 'mv_definition', 'mv_usedata', 'mv_auxproblem', 'mv_symmetry', 'mv_dimcheck', 'mv_recombine', 'mv_vary', 'mv_equation'];

    /* ۱) ثبت‌گاه: ۲۷ حرکت، هر کدام مرحله و پرسش؛ ۱۱ حرکتِ تازه با نشانه، نمونه، ورزش و تکنیکِ واقعی */
    info.reg = await p.evaluate(NEWMV => {
      const L = APP.MOVE_LIST, bad = [];
      L.forEach(m => { if (!m.ask || !APP.SOLVE_PHASES[m.ph]) bad.push(m.id + ':ask/ph'); if (!m.tech.length || m.tech.some(t => !APP.TM[t[0]] || !t[1])) bad.push(m.id + ':tech'); });
      NEWMV.forEach(id => { const m = APP.MOVES[id]; if (!m) { bad.push(id + ':missing'); return; } if (m.sig.length < 3 || m.ex.length < 2 || m.drills.length < 2 || !m.lit) bad.push(id + ':content');
        m.drills.forEach((d, k) => { if (d.opts.length !== 4 || d.a < 0 || d.a > 3 || !d.why || new Set(d.opts).size !== 4) bad.push(id + ':drill' + k); }); });
      return { n: L.length, bad, plan: APP.PLAN_QS.length, planMv: APP.PLAN_QS.every(q => q.mv.every(x => APP.MOVES[x])), back: APP.BACK_QS.length, phases: Object.keys(APP.SOLVE_PHASES).join() };
    }, NEWMV);
    chk(info.reg.n === 27 && !info.reg.bad.length && info.reg.plan >= 8 && info.reg.planMv && info.reg.back >= 4 && info.reg.phases === 'u,p,c,b', 'registry ' + JSON.stringify(info.reg));

    /* ۲) KLADDER دیگر رونویسی نمی‌شود: همان نردبانِ راهنمایی ِ a16؛ فاصله‌ها در KSPACING */
    info.klad = await p.evaluate(() => ({ lad: Array.isArray(APP.KLADDER) && APP.KLADDER.length === 7 && APP.KLADDER.every(x => typeof x === 'object' && 'n' in x), sp: JSON.stringify(APP.KSPACING), r2: APP.KLADDER[2].fa, r4: APP.KLADDER[4].label, iv: [APP.knextIv(0, true), APP.knextIv(3, true), APP.knextIv(21, false)].join() }));
    chk(info.klad.lad && info.klad.sp === '[1,3,7,21,60]' && /مجهول/.test(info.klad.r2) && /همهٔ داده‌ها/.test(info.klad.r2) && /کلِ شرط/.test(info.klad.r2) && /طرح‌ریزی/.test(info.klad.r4) && info.klad.iv === '1,7,1', 'KLADDER/KSPACING ' + JSON.stringify(info.klad));

    /* ۳) صفحهٔ حرکت: پرسش، نمونه، ورزش (پاسخ ⇒ موعدِ همان حرکت با نردبانِ فاصله) */
    await go('move', 'mv_partcond');
    info.page = { ask: await p.locator('main .mv-askcard .mv-askq').innerText(), ex: await p.locator('main .mv-ex li').count(), drills: await p.locator('main .mv-drill').count() };
    chk(info.page.ask === (await p.evaluate(() => APP.MOVES.mv_partcond.ask)) && info.page.ex >= 2 && info.page.drills >= 2, 'move page ' + JSON.stringify(info.page));
    await p.locator('main .mv-drill').nth(0).locator('.mv-dopt[data-ok="1"]').click(); await p.waitForTimeout(60);
    info.sp1 = await p.evaluate(() => APP.S.get('moves_prog').by.mv_partcond);
    const today = await p.evaluate(() => APP.today());
    chk(info.sp1 && info.sp1.dn === 1 && info.sp1.dok === 1 && info.sp1.iv === 1 && info.sp1.due === await p.evaluate(t => APP.addDays(t, 1), today), 'drill right ⇒ spacing ' + JSON.stringify(info.sp1));
    await p.locator('main .mv-drill').nth(1).locator('.mv-dopt:not([data-ok])').first().click(); await p.waitForTimeout(60);
    info.sp2 = await p.evaluate(() => APP.S.get('moves_prog').by.mv_partcond);
    chk(info.sp2.dn === 2 && info.sp2.dok === 1 && info.sp2.iv === 1, 'drill wrong ⇒ back to 1 day ' + JSON.stringify(info.sp2));
    chk(await p.locator('main .mv-drill .mv-dnext').count() === 2, 'next-due line after drill');
    // نوبتِ رسیده ⇒ «امروز»
    await p.evaluate(() => { const r = APP.S.get('moves_prog'); r.by.mv_partcond.due = APP.today(); APP.S.put(r); });
    info.due = await p.evaluate(() => APP.dueList().map(x => x.txt));
    chk(info.due.some(t => /حرکتِ حلِ مسئله موعدِ تمرین است/.test(t)), 'moves due not in today: ' + JSON.stringify(info.due));
    await go('home'); chk(await p.locator('main .duel .dueb:has-text("حرکتِ حلِ مسئله موعدِ تمرین است")').count() === 1, 'today list row for moves');
    await p.click('main .duel .dueb:has-text("حرکتِ حلِ مسئله موعدِ تمرین است")'); await p.waitForTimeout(120);
    chk(await p.evaluate(() => APP.state.view + ':' + APP.state.arg) === 'move:mv_partcond', 'today row opens the move');

    /* ۴) ت۱۳: جدولِ ترجمه + نمونه‌های ساختهٔ کد روی صفحهٔ «نماد بگذار و …» و «آزمونِ ابعاد» */
    await go('move', 'mv_equation');
    chk(await p.locator('main .mv-eqtab table.mv-eqt tbody tr').count() === 3, 'translation table rows');
    await p.fill('#mvEqUnk', 'a، b، c'); await p.locator('main .mv-eqr').nth(0).fill('a + b + c = 60'); await p.locator('main .mv-eqr').nth(1).fill('a² + b² = c²');
    info.eqc = await p.locator('main .mv-eqcount').innerText();
    chk(/رابطه‌ها: ۲/.test(info.eqc) && /مجهول‌ها: ۳/.test(info.eqc) && /رابطه کم است/.test(info.eqc), 'equation count ' + info.eqc);
    for (const g of ['eqtrans', 'notation']) {
      // تا نمونهٔ گزینه‌ای بیاید (سطحِ ۳ ِ ترجمه عددی است؛ آن را هم پایین‌تر می‌سنجیم)
      for (let t = 0; t < 30; t++) { await p.click(`main .mv-genbtn[data-gen="${g}"]`); await p.waitForTimeout(30); if (await p.locator(`main .mv-gen[data-gen="${g}"] .mv-dopt`).count()) break; }
      chk(await p.locator(`main .mv-gen[data-gen="${g}"] .mv-dopt`).count() >= 2, 'generated drill ' + g);
      await p.locator(`main .mv-gen[data-gen="${g}"] .mv-dopt[data-ok="1"]`).click(); await p.waitForTimeout(40);
    }
    // نمونهٔ عددی: پاسخِ درست با وارسیِ کدی
    for (let t = 0; t < 60; t++) { await p.click('main .mv-genbtn[data-gen="eqtrans"]'); await p.waitForTimeout(20); if (await p.locator('main .mv-gen[data-gen="eqtrans"] .mv-genint').count()) break; }
    if (await p.locator('main .mv-gen[data-gen="eqtrans"] .mv-genint').count()) {
      const q = await p.locator('main .mv-gen[data-gen="eqtrans"] .mv-genq').innerText();
      const nums = (q.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).match(/\d+/g) || []).map(Number); const k = nums[0], N = Math.max(...nums);
      await p.fill('main .mv-gen[data-gen="eqtrans"] .mv-genint', String(N / (k + 1))); await p.click('main .mv-gen[data-gen="eqtrans"] .mv-genchk'); await p.waitForTimeout(40);
      chk(await p.locator('main .mv-gen[data-gen="eqtrans"] .dfb .good').count() === 1, 'numeric generated drill checked by code ' + q.slice(0, 120));
      await p.evaluate(() => { const r = APP.S.get('moves_prog'); r.by.mv_equation.dn -= 1; r.by.mv_equation.dok -= 1; r.by.mv_equation.iv = 3; APP.S.put(r); });   // شمارشِ پایین فقط دو نمونهٔ گزینه‌ای را می‌سنجد
    } else errors.push('no numeric eqtrans drill in 60 tries');
    info.eqProg = await p.evaluate(() => APP.S.get('moves_prog').by.mv_equation);
    chk(info.eqProg && info.eqProg.dn === 2 && info.eqProg.dok === 2 && info.eqProg.iv === 3, 'generated drills feed spacing ' + JSON.stringify(info.eqProg));
    await go('move', 'mv_dimcheck'); await p.click('main .mv-genbtn[data-gen="dimtest"]'); await p.waitForTimeout(60);
    chk(await p.locator('main .mv-gen[data-gen="dimtest"] .mv-dopt').count() === 4, 'dimtest on move page');

    /* ۵) نمونه‌ها روشن ⇒ ۲۰ مسئلهٔ کوتاه در شبیه‌ساز و هر حرکتِ تازه در ≥ ۳ گام */
    await p.evaluate(() => { const st = APP.S.settings(); st.samples = true; APP.S.saveSettings(st); });
    info.stages = await p.evaluate(NEWMV => { const o = {}; NEWMV.forEach(m => { o[m] = APP.moveStages(m).length; }); return { per: o, book: APP.probs().filter(x => x.set === 'book4').length, neutral: APP.probs().filter(APP.probNeutralSample).length }; }, NEWMV);
    chk(info.stages.book === 20 && info.stages.neutral === 26 && NEWMV   /* R3: + ۶ مسئلهٔ «practice» ِ خنثی */.every(m => info.stages.per[m] >= 3), 'practice problems / tags ' + JSON.stringify(info.stages));
    info.valid = await p.evaluate(() => APP.probs().filter(x => x.set === 'book4' || x.set === 'practice').map(x => { try { APP.probValid(JSON.parse(JSON.stringify(x))); return null; } catch (e) { return x.id + ': ' + e.message.slice(0, 120); } }).filter(Boolean));
    chk(!info.valid.length, 'validP rejects practice problems: ' + JSON.stringify(info.valid));
    // تمرینِ درهم: پس از پاسخ، پرسشِ همان حرکت
    await go('move', 'mv_symmetry'); await p.click('main .mv-start'); await p.waitForTimeout(80);
    await p.locator('main .mv-opt').first().click(); await p.waitForTimeout(60);
    chk(await p.locator('main .mv-askfb').count() === 1, 'interleaved practice shows the move question');
    chk((await p.evaluate(() => APP.S.get('moves_prog').by.mv_symmetry || {})).due != null || (await p.evaluate(() => { const S = APP.moveSession(); return S.items[0].mv.some(m => (APP.S.get('moves_prog').by[m] || {}).due); })), 'interleaved answer schedules the move');

    /* ۶) ت۴: سرنخِ سه‌پله‌ای در سطحِ ۱ و ۲ ِ شبیه‌ساز */
    const stg = await p.evaluate(() => { const P = APP.getProb('pb_p4_invoice'), s = P.stages[1]; return { ask: APP.MOVES[s.mv[0]].ask, hint: s.hint, phq: APP.SOLVE_PHASES[s.ph].q[0], sid: s.id, ph: s.ph }; });
    await p.evaluate(() => { APP.simState = { pid: 'pb_p4_invoice', lv: 1, order: 'hist', i: 1 }; APP.go('e_prob', 'pb_p4_invoice', 'sim'); }); await p.waitForTimeout(120);
    chk(await p.locator('.simcard .mv-hlbox').count() === 1, 'hint ladder at level 1');
    await p.click('.simcard .mv-hlbox summary'); await p.waitForTimeout(40);
    for (let k = 0; k < 3; k++) { await p.click('.simcard .mv-hl-next'); await p.waitForTimeout(30); }
    info.rungs = await p.locator('.simcard .mv-hl-r').allInnerTexts();
    chk(info.rungs.length === 3 && info.rungs[0].includes(stg.phq) && info.rungs[1].includes(stg.ask) && info.rungs[2].includes(stg.hint) && !(await p.locator('.simcard .mv-hl-next').count()), 'rungs order general⇒move⇒specific ' + JSON.stringify(info.rungs));
    await p.click('.simcard .mv-hlgen summary'); await p.waitForTimeout(30);
    chk(await p.locator('.simcard .mv-hlgen-list li').count() === 4 && (await p.locator('.simcard .mv-hlgen-list li').nth(2).textContent()).includes(await p.evaluate(() => APP.KLADDER[2].fa)), 'generic ladder rungs (A.KLADDER) reachable from the simulator');
    // گامِ «فهم» (ph = u): پلهٔ ۱ همان پلهٔ ۲ ِ نردبانِ گره‌گشاست
    info.rungU = await p.evaluate(() => { const P = APP.getProb('pb_p4_invoice'); return APP.moveHintRungs(P, P.stages[0])[0].t === APP.KLADDER[2].fa && P.stages[0].ph === 'u'; });
    chk(info.rungU, 'understanding-phase rung 1 comes from the knot ladder');
    info.rungLog = await p.evaluate(() => APP.S.get('moves_prog').log.filter(x => x.rung).length);
    chk(info.rungLog === 3, 'rung use logged ' + info.rungLog);
    // سطحِ ۲: پله‌های ۱ و ۲ رایگان؛ پلهٔ ۳ همان سرنخِ پولی ِ شبیه‌ساز (بار اول نادرست حساب می‌شود)
    await p.evaluate(() => { const pg = APP.S.get('eprog_pb_p4_invoice') || { id: 'eprog_pb_p4_invoice', type: 'eprog', lv: {} }; delete pg.lv[2]; APP.S.put(pg); APP.simState = { pid: 'pb_p4_invoice', lv: 2, order: 'hist', i: 1 }; APP.go('e_prob', 'pb_p4_invoice', 'sim'); }); await p.waitForTimeout(120);
    await p.click('.simcard .mv-hlbox summary'); await p.waitForTimeout(40); await p.click('.simcard .mv-hl-next'); await p.click('.simcard .mv-hl-next');
    chk(!(await p.locator('.simcard p.hint').count()), 'level 2: rungs 1-2 must not reveal the paid hint');
    await p.click('.simcard .mv-hl-next'); await p.waitForTimeout(40);
    chk(await p.locator('.simcard p.hint').count() === 1, 'level 2: rung 3 uses the simulator\'s own paid hint');
    const okT = await p.evaluate(() => APP.getProb('pb_p4_invoice').stages[1].opts.find(o => o.ok).t);
    await p.locator('.simcard .dopt', { hasText: okT.slice(0, 20) }).first().click(); await p.waitForTimeout(60);
    info.lv2 = await p.evaluate(sid => (APP.S.get('eprog_pb_p4_invoice').lv[2] || {})[sid], stg.sid);
    chk(info.lv2 && info.lv2.first === false, 'paid rung counted as hint use (first try not correct) ' + JSON.stringify(info.lv2));
    // سطحِ ۳: سرنخِ پله‌ای نیست (اول حرکتِ خودت)
    await p.evaluate(() => { APP.simState = { pid: 'pb_p4_invoice', lv: 3, order: 'hist', i: 1 }; APP.go('e_prob', 'pb_p4_invoice', 'sim'); }); await p.waitForTimeout(80);
    chk(!(await p.locator('.simcard .mv-hlbox').count()), 'no hint ladder at level 3');

    /* ۷) ت۳: گام‌های شبیه‌ساز با همان نردبانِ فاصله در «امروز» */
    info.simsp = await p.evaluate(sid => { APP.simSpaceSync(); return (APP.S.get('simsp_pb_p4_invoice') || { by: {} }).by[sid]; }, stg.sid);
    chk(info.simsp && info.simsp.ok === false && info.simsp.iv === 1, 'sim spacing from eprog ' + JSON.stringify(info.simsp));
    await p.evaluate(sid => { const r = APP.S.get('simsp_pb_p4_invoice'); r.by[sid].due = APP.today(); APP.S.put(r); }, stg.sid);
    info.due2 = await p.evaluate(() => APP.dueList().filter(x => /گامِ شبیه‌ساز/.test(x.txt)).length);
    chk(info.due2 === 1, 'sim step due in today');
    await go('home'); await p.click('main .duel .dueb:has-text("گامِ شبیه‌ساز")'); await p.waitForTimeout(150);
    chk(await p.evaluate(() => APP.state.view + ':' + APP.state.arg) === 'e_prob:pb_p4_invoice', 'today row opens the simulator step');
    // R3 (۲۰۲۶-۱۰-۱۵): پاسخِ درست از پلهٔ بعد از «فردا» آغاز می‌شود (گامِ درست فردا برنمی‌گردد)؛ نادرست ⇒ فردا
    info.rec = await p.evaluate(() => { const b = APP.simSpaceRecord('pb_p4_invoice', 'udc', true).iv; const c = APP.simSpaceRecord('pb_p4_invoice', 'udc', true).iv; const d = APP.simSpaceRecord('pb_p4_invoice', 'udc', false).iv; return [b, c, d]; });
    chk(info.rec.join() === '3,7,1', 'simSpaceRecord ladder ' + info.rec);

    /* ۸) ت۶: «گیر کردم» ِ شبیه‌ساز ⇐ موقعیت ⇐ نردبانِ گره‌گشا؛ پلهٔ ۴ با پرسش‌های طرح‌ریزیِ چرخان؛ بازنگری پس از «باز شد» */
    await p.evaluate(() => { APP.simState = { pid: 'pb_p4_roots', lv: 1, order: 'hist', i: 0 }; APP.go('e_prob', 'pb_p4_roots', 'sim'); }); await p.waitForTimeout(100);
    await p.click('.simcard .mv-stuck'); await p.waitForTimeout(200);
    info.kc = await p.evaluate(() => ({ v: APP.state.view + ':' + APP.state.sub, id: APP.state.arg }));
    // ثبت و قدمِ ۰ را مثلِ کاربر کامل کن (نردبان در قدمِ ۲ است و قفلِ قدم‌ها دست نمی‌خورد)
    await p.evaluate(id => { const kc = APP.S.get(id); Object.assign(kc.intake, { expected: 'حرکتِ بعدی را پیدا کنم', actual: 'پیدا نکردم', thoughts: 'چند حالت را امتحان کردم' }); kc.premise = Object.assign(kc.premise || {}, { verdict: 'yes' }); kc.safetyAck = new Date().toISOString(); APP.S.put(kc); APP.go('kcase', id, 's2'); }, info.kc.id); await p.waitForTimeout(200);
    info.kc.v2 = await p.evaluate(() => APP.state.view + ':' + APP.state.sub);
    chk(info.kc.v === 'kcase:in' && info.kc.v2 === 'kcase:s2' && await p.locator('main .kn-ladder').count() === 1, 'ladder reachable from the simulator via «stuck» ' + JSON.stringify(info.kc));
    for (let k = 0; k < 4; k++) { const nb = p.locator('main .kn-lad-next'); if (await nb.count()) { await nb.first().click(); await p.waitForTimeout(100); } }
    chk(/همهٔ داده‌ها/.test(await p.locator('main .kn-lad li').nth(2).innerText()), 'rung 2 asks about all the data');
    const q0 = await p.evaluate(() => APP.PLAN_QS[0].t), q1 = await p.evaluate(() => APP.PLAN_QS[1].t);
    chk((await p.locator('main .kn-planq-t').innerText()) === q0, 'rung 4 shows the first planning question');
    await p.click('main .kn-planq-next'); await p.waitForTimeout(100);
    chk((await p.locator('main .kn-planq-t').innerText()) === q1 && await p.evaluate(id => APP.S.get(id).ladder.pq, info.kc.id) === 1, 'planning questions rotate in order');
    await p.click('main .kn-lad-open'); await p.waitForTimeout(150);
    chk(await p.locator('main .kn-back').count() === 1, 'looking-back question after «solved»');
    const bq = await p.locator('main .kn-back-q').innerText();
    chk(await p.evaluate(q => APP.BACK_QS.includes(q), bq), 'back question from the registry');
    await p.fill('#knBack', 'با m = ۶ ریشه‌ها را حساب کردم'); await p.waitForTimeout(900);
    info.back = await p.evaluate(id => APP.S.get(id).ladder.back, info.kc.id);
    chk(info.back && info.back.q === bq && /m = ۶/.test(info.back.a), 'back answer saved ' + JSON.stringify(info.back));

    /* ۹) ت۱۶: قالبِ مسئلهٔ عملی در ثبتِ موقعیت (تصمیم/کار/رابطه) با پیوندِ «مسئولیتِ معرفتی» */
    const kid = await p.evaluate(() => { const kc = APP.knotNewCase(); kc.kinds = ['social']; APP.S.put(kc); APP.go('kcase', kc.id, 'in'); return kc.id; }); await p.waitForTimeout(150);
    chk(await p.locator('main .kn-prac:not(.hidden)').count() === 1 && await p.locator('main .kn-prac .tlink.epist').count() === 1, 'practical template visible for a social case');
    await p.fill('#knPWant', 'تصمیم بگیرم کدام پیشنهادِ کار را بپذیرم'); await p.fill('#knPIgnore', 'شایعه‌ها را کنار می‌گذارم'); await p.waitForTimeout(1200);
    info.prac = await p.evaluate(id => APP.S.get(id).intake.prac, kid);
    chk(info.prac && /پیشنهادِ کار/.test(info.prac.want) && /شایعه/.test(info.prac.ignore), 'practical answers saved ' + JSON.stringify(info.prac));
    await p.evaluate(() => { const kc = APP.knotNewCase(); kc.kinds = ['problem']; APP.S.put(kc); APP.go('kcase', kc.id, 'in'); }); await p.waitForTimeout(120);
    chk(await p.locator('main .kn-prac.hidden').count() === 1, 'practical template hidden for a pure problem');

    /* ۱۰) بی برچسب یا صفحه‌ای به نامِ «پولیا»: عنوان‌ها، دکمه‌ها، زبانه‌ها، برچسب‌ها و منو */
    for (const v of [['moves'], ['move', 'mv_unknown'], ['move', 'mv_equation'], ['e_prob', 'pb_p4_bear', 'sim'], ['settings']]) {
      await go(...v);
      const lab = await p.evaluate(() => Array.from(document.querySelectorAll('main h1, main h2, main h3, main button, main summary, main legend, main label, main .chip, nav, .nav')).map(x => x.textContent).join(' | '));
      chk(!/پولیا/.test(lab), 'a label names «پولیا» on ' + v.join('/'));
    }
    chk(!(await p.evaluate(() => (APP.NAV || []).concat(APP.EPI_NAV || []).some(n => /پولیا/.test(JSON.stringify(n))))), 'menu entry named «پولیا»');
  } catch (e) { errors.push('exception: ' + (e && e.stack || e)); }
  await b.close();
  console.log(JSON.stringify(info, null, 1));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
