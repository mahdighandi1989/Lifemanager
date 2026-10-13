// ممیزیِ کامل ۲۰۲۶-۱۰-۱۳ — آزمونِ بازگشت برای اصلاح‌های کارخانه و گره‌گشا (روی dist/learning-architecture.html)
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(300);
  const chk = (c, m) => { if (!c) errors.push(m); };
  const go = async (v, a, s) => { await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await p.waitForTimeout(150); };

  // ۱) آزمونِ ۱: مکان‌یابیِ کامل، پوششِ قاعده‌ها، اثرِ انگشت
  info.t1 = await p.evaluate(() => { const t = APP.runThree('A', false); return { full: t.a.fullScore, partial: t.a.partial.length, tested: t.a.coverage.tested.length, n: t.a.coverage.n, hash: !!t.a.rulesHash }; });
  // پس از داوریِ جزوه و انتقالِ قاعدهٔ مکاشفه (۲۰۲۶-۱۰-۱۳): هر ۵۱ مثال کامل؛ قاعده‌های بی‌مثال هنوز هستند
  chk(info.t1.n === 69 && info.t1.tested > 30 && info.t1.tested < 69 && info.t1.full === 1 && info.t1.partial === 0 && info.t1.hash, 'test1 honesty metrics ' + JSON.stringify(info.t1));
  const ebt0 = await p.evaluate(() => APP.S.all('ebt').length);
  await go('e_living'); await go('e_aut');
  chk(await p.evaluate(() => APP.S.all('ebt').length) === ebt0, 'viewing living/aut must not record a run');
  await go('e_bt');
  chk(await p.locator('main .t1-honest').count() === 1 && await p.locator('main .t1-approve').count() === 1, 'test1 honesty box + approve button');
  await p.click('main .t1-approve'); await p.waitForTimeout(150);
  chk(await p.evaluate(() => APP.rulesApproved() === APP.lastThree.a.rulesHash), 'rules approved');
  info.drift = await p.evaluate(() => { const r = window.EPI_RULES[0], old = r.fa; r.fa = old + ' (تغییر)'; const rep = APP.runCycle(); r.fa = old; return rep.rulesChanged; });
  chk(info.drift === true, 'weekly run flags rule drift');
  info.sigs = await p.evaluate(() => { APP.runCycle(); const s = APP.S.get('ecycle').sigs; return { n: s.length, uniq: new Set(s).size }; });
  chk(info.sigs.n === info.sigs.uniq, 'cycle signatures without duplicates ' + JSON.stringify(info.sigs));

  // ۲) پرونده: پیش‌پرکردن از کاربرگ، حذفِ تصدیقِ میانی، دفترِ پیش‌رو
  const cid = await p.evaluate(() => {
    const c = APP.newCase({ title: 'آزمونِ ممیزی', input: 'سه ادعا' });
    c.st.st_tasdiq = { data: { claims: [{ txt: 'الف' }, { txt: 'ب' }, { txt: 'ج' }] }, done: true, rubric: [] };
    c.st.st_route = { data: { ways: [{ c: '1', w: 'نقل' }, { c: '3', w: 'حس' }] }, done: true, rubric: [] };
    c.st.st_final = { data: { final: [{ c: '1', p: '۹۵' }] }, done: false, rubric: [] };
    c.st.st_intake = { data: { stakes: 5 }, done: true, rubric: [] };
    APP.S.put(c); return c.id; });
  await go('e_case', cid, 'engine');
  info.pre = await p.evaluate(id => APP.S.get(id).feat, cid);
  chk(info.pre[1].way === 'نقل' && info.pre[1].conf === 95 && info.pre[1].stakes === 'زیاد' && info.pre[3].way === 'حس', 'prefill from worksheets ' + JSON.stringify(info.pre));
  chk(await p.locator('main .feat-prefill').count() === 1, 'prefill note');
  chk(await p.locator('#fe_c1_way').count() === 1 && await p.locator('#fe_c2_way').count() === 1, 'unique encoder ids per claim');
  chk(await p.locator('#fe_c1_way option').first().textContent() === '— تعیین نشده —', 'blank option is «تعیین نشده»');
  // دفترِ پیش‌رو: نتیجه پیش از اولین رمزگذاری ⇒ رد
  const late = await p.evaluate(() => { const c = APP.newCase({ title: 'پس‌نگر', input: 'x' }); c.st.st_tasdiq = { data: { claims: [{ txt: 'الف' }] }, done: true, rubric: [] }; c.st.st_final = { data: { final: [{ c: '1', p: '50' }] }, done: true, rubric: [] }; c.outcome = { 1: 'نادرست' }; c.outcomeAt = new Date(Date.now() - 1000).toISOString(); APP.S.put(c); return c.id; });
  await go('e_case', late, 'engine');
  chk(await p.evaluate(id => APP.S.get(id).fwdLate === true, late), 'late encoding marked');
  await p.click('main button:has-text("افزودن به دفتر پیش‌رو")'); await p.waitForTimeout(150);
  chk(await p.evaluate(id => !APP.S.get('ecase_fw_' + id), late), 'late case refused by the forward ledger');

  // ۳) تاریخِ بازبینی: شمسی/ارقامِ فارسی/«/»
  info.dates = await p.evaluate(() => [APP.epiRevDate('۱۴۰۵-۰۸-۲۰'), APP.epiRevDate('2026/10/01'), APP.epiRevDate('فردا')]);
  chk(info.dates[0] === '2026-11-11' && info.dates[1] === '2026-10-01' && info.dates[2] === null, 'review dates ' + JSON.stringify(info.dates));
  chk(await p.evaluate(() => { const f = (window.EPI.FINAL || null); const st = APP.EST.st_final; return st.ws.filter(x => x.k === 'revdate')[0].qk === true; }), 'review date in the quick path');

  // ۴) پذیرش: «ورودی مبهم» جلو نمی‌رود
  const amb = await p.evaluate(() => { const c = APP.newCase({ title: 'مبهم', input: 'x' }); return c.id; });
  await go('e_case', amb, 'st_intake');
  await p.evaluate(id => { const c = APP.S.get(id); c.st.st_intake = c.st.st_intake || { data: {}, rubric: [] }; Object.assign(c.st.st_intake.data, { verdict: 'ورودی مبهم یا ناقص است — باید پیش از ادامه کامل شود' }); APP.S.put(c); }, amb);
  await go('e_case', amb, 'st_intake');
  info.ambDone = await p.evaluate(id => { const v = APP.S.get(id).st.st_intake; return !!(v && v.done); }, amb);

  // ۵) گره‌گشا: فیلترِ حالِ درونیِ دیگران، پوشاندنِ پاسخ در پیش‌نمایش، آزمایشِ موعد
  info.mind = await p.evaluate(() => [['مدیر فکر کرد پیشنهادت پرهزینه است', 'F8'], ['همکار احساسِ تهدید دارد', 'F10'], ['پیشنهاد از زاویهٔ هدفِ مدیر قاب نشده بود', 'F8']].map(([t, f]) => APP.knotHypOk({ fam: f, text: t }, '', [])));
  chk(info.mind[0] === false && info.mind[1] === false && info.mind[2] === true, 'third-party inner-state filter ' + JSON.stringify(info.mind));
  await p.evaluate(() => {
    const kc = APP.knotNewCase(); kc.id = 'kc_mask'; kc.kinds = ['problem']; Object.assign(kc.intake, { what: 'w', expected: 'e', actual: 'a', thoughts: 't', statement: 'دنبالهٔ ۲، ۶، ۱۲، ۲۰ ادامه‌اش؟', answer: 'سی', seen: 'no' }); kc.premise = { verdict: 'likely' }; APP.S.put(kc); APP.go('kcase', 'kc_mask', 's2');
    APP.callAI = () => new Promise(() => {}); const st = APP.S.settings(); st.ai = { key: 'x' }; APP.S.saveSettings(st); });
  await p.waitForTimeout(200);
  for (let i = 0; i < 4; i++) { const nb = p.locator('main .kn-lad-next'); if (await nb.count()) { await nb.first().click(); await p.waitForTimeout(120); } }
  await p.click('main .kn-ladder button:has-text("بساز با هوش مصنوعی")'); await p.waitForTimeout(200);
  info.pre2 = await p.inputValue('#knAiPre');
  chk(info.pre2.indexOf('سی') < 0 && /پنهان/.test(info.pre2), 'unseen answer masked in the preview: ' + info.pre2.slice(0, 160));
  await p.click('.kn-ai button:has-text("انصراف")');
  await p.evaluate(() => { APP.S.put({ id: 'knot_exp', type: 'knot', name: 'کفِ دست', fam: 'F6', principle: 'p', cases: [], status: 'open' }); APP.S.put({ id: 'kexp_1', type: 'kexp', knot: 'knot_exp', plan: 'دفعهٔ بعد مکث کنم', predict: 'p', due: '2026-10-01', status: 'planned' }); });
  chk(await p.evaluate(() => APP.dueList().some(x => /آزمایشِ واقعیِ گره موعد/.test(x.txt))), 'overdue experiment in Today');
  await go('kpractice');
  chk(await p.locator('main .kp-expdue').count() === 1, 'overdue experiment on the practice page');

  // ۶) دکمه‌های بزرگ (`.btn.lg`) نباید با کلاسِ خطِ راهنمای نمودار (`.lg`) له شوند؛ کلیدِ دو سامانه سرریز نکند
  info.lgBtn = await p.evaluate(() => [...document.querySelectorAll('main .btn.lg')].map(x => { const r = x.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }));
  chk(info.lgBtn.length > 0 && info.lgBtn.every(([w, h]) => w > 60 && h > 30), 'large buttons not crushed ' + JSON.stringify(info.lgBtn));
  chk(await p.evaluate(() => [...document.querySelectorAll('.sysb')].every(x => x.scrollWidth <= x.clientWidth + 1)), 'system switch labels fit');

  console.log(JSON.stringify(info, null, 1).slice(0, 1200));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
