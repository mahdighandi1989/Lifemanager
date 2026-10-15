// دورِ چهارمِ پوششِ کتابِ حلِ مسئله — تصمیمِ مالک (۲۰۲۶-۱۰-۱۵، «موافقم»): مواردی که به زندگیِ مالک نزدیک‌ترند «عمیق» شوند، همه در
// تونل‌های موجود، روی dist/learning-architecture.html (صفحهٔ واقعی):
//  الف) اراده و خواستن (A099، B073، B074، C153، B067، C126، C127): پس از شکست یا نقد «🌱 کوچک‌ترین گامِ بعد» — خواستن/امید/کنجکاوی/ارزش
//       به‌صورتِ داده، گامِ مشخص و زمان‌دار با وارسیِ کدی، بازگشت در روزِ موعد (شبیه‌ساز، «امروز»)، گامِ کوچک‌تر پس از انجام‌نشدن، یک پله
//       دورتر پس از انجام‌شدن (همان نردبان)، رها کردنِ آگاهانه با وارسیِ دوباره؛ در شبیه‌ساز (حالِ دلسرد، «پیشرفت: نه»)، «💡 جایگاهِ ایده»
//       (نقد ⇐ فرض ⇐ گام) و گره‌گشا (خانوادهٔ F7)؛ قلابِ دستیار.
//  ب) مسئلهٔ عملی (B288، B289، C003، C010): «دانشِ پیشین/تجربیِ نادقیق» و «ریاضی‌کردن» در قابِ گره‌گشا و غربال، با وارسیِ کدیِ سنجیدنی‌بودن
//       و کارتِ مرورِ فاصله‌دار.
//  پ) فنون حدس (A224، B114، A232، A229، B172، B109، B118، B121، B175): «ابزارهای حدس» در کارتِ حدس (نخستین برخورد) و بازنگری، در ایده و
//       قابِ عملی — جدولِ حالت‌ها/تفاضل‌ها، فرمولِ دقیق، رقیب‌ها و حالتِ جداکننده با کد؛ سازنده‌های کدی از کارت و صفحهٔ حرکت، فاصله‌دار؛ مرورِ حدس.
//  ت) مسئله‌های کوتاهِ تمرینی پیش‌فرض روشن (نمونه‌های تاریخیِ سازنده هنوز پنهان)، با تیکِ تنظیمات و دکمهٔ «فهرست خالی است» هم‌خوان.
// خطا ⇒ کدِ خروجِ غیرصفر.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const W = (ms) => p.waitForTimeout(ms || 80);
  const ownCheck = (sel, lab) => p.evaluate(sel => { const els = [...document.querySelectorAll(sel + ' input, ' + sel + ' textarea, ' + sel + ' select')]; return { n: els.length, notOwn: els.filter(e => !e.closest('[data-own]')).length, noLabel: els.filter(e => !(e.labels && e.labels.length) && !e.getAttribute('aria-label')).map(e => e.id) }; }, sel)
    .then(r => { chk(r.n > 0, lab + ': no fields'); chk(r.notOwn === 0, lab + ': ' + r.notOwn + ' fields outside data-own'); chk(!r.noLabel.length, lab + ': unlabelled ' + r.noLabel.join(',')); return r; });
  const sel = async (s, v) => { await p.selectOption(s, v); await W(30); };
  try {
    await p.goto(FILE); await p.waitForSelector('.nav'); await W(300);
    await p.evaluate(() => { APP.S.loaded = true; });
    const T = await p.evaluate(() => ({ today: APP.today(), d1: APP.addDays(APP.today(), 1), d3: APP.addDays(APP.today(), 3) }));

    /* ===== ت) مسئله‌های کوتاهِ تمرینی: پیش‌فرض روشن ===== */
    info.def = await p.evaluate(async () => { const o = {}; o.on = APP.practiceOn(); o.n = APP.probs().length; o.pc = APP.practiceCount();
      o.neutral = APP.probs().every(x => x.neutral === true && (x.set === 'book4' || x.set === 'practice'));
      o.samplesHidden = !APP.showSamples() && !APP.probs().some(x => !x.set);
      APP.go('e_prob'); await new Promise(r => setTimeout(r, 150)); o.listed = document.querySelectorAll('#main .pb-practice .card').length; o.ctaProb = !!document.querySelector('#main .practice-cta');
      APP.go('moves'); await new Promise(r => setTimeout(r, 150)); o.mvEmpty = !!document.querySelector('#main .mv-empty'); o.ctaMoves = !!document.querySelector('#main .practice-cta'); o.stages = APP.moveStages('mv_special').length;
      return o; });
    chk(info.def.on && info.def.n === info.def.pc && info.def.pc >= 26 && info.def.neutral && info.def.samplesHidden && info.def.listed === info.def.pc && !info.def.ctaProb && !info.def.mvEmpty && !info.def.ctaMoves && info.def.stages > 0,
      'practice problems must be ON by default (historical samples still hidden), listed, no CTA ' + JSON.stringify(info.def));
    await p.evaluate(() => APP.go('settings')); await W(150);
    chk(await p.locator('#practiceProbs').isChecked(), 'settings toggle «… را نشان بده» checked by default');
    await p.uncheck('#practiceProbs'); await W(60);
    info.off = await p.evaluate(async () => { const o = { n: APP.probs().length, st: APP.S.settings().practiceProbs }; APP.go('e_prob'); await new Promise(r => setTimeout(r, 150)); o.cta = !!document.querySelector('#main .practice-cta'); o.listed = !!document.querySelector('#main .pb-practice');
      APP.go('moves'); await new Promise(r => setTimeout(r, 150)); o.ctaM = !!document.querySelector('#main .practice-cta'); return o; });
    chk(info.off.n === 0 && info.off.st === false && info.off.cta && !info.off.listed && info.off.ctaM, 'turned off in settings ⇒ hidden and the empty-list CTA comes back ' + JSON.stringify(info.off));
    await p.click('#main .practice-cta button'); await W(150);
    chk(await p.evaluate(() => APP.practiceOn() && APP.probs().length === APP.practiceCount() && !document.querySelector('#main .practice-cta')), 'CTA turns them back on');

    /* ===== پ) ابزارهای حدس در کارتِ حدس (نخستین برخورد) ===== */
    const PID = 'pb_u_r4';
    await p.evaluate(() => { const src = window.EPI_PROBLEMS.find(x => x.id === 'pb_p4_bear'), o = JSON.parse(JSON.stringify(src)); o.id = 'pb_u_r4'; o.title = 'مسئلهٔ خودم: دست‌دادن‌ها'; delete o.set; delete o.neutral;
      APP.S.put({ id: 'eprob_pb_u_r4', type: 'eprob', status: 'approved', by: 'me', p: o }); });
    const open = (pid, lv, i) => p.evaluate(([pid, lv, i]) => { APP.simState = { pid, lv, order: 'hist', i }; APP.go('e_prob', pid, 'sim'); }, [pid, lv, i]).then(() => W(150));
    await open(PID, 1, 0);
    chk(await p.locator('main .sv-u .sv-kit[open]').count() === 1, 'guess kit open in the first-encounter guess card');
    await ownCheck('main .sv-u .sv-kit', 'guess kit');
    const kitIds = await p.evaluate(() => [...document.querySelectorAll('main .sv-u .sv-kit input, main .sv-u .sv-kit select')].map(e => e.id));
    const K = pre => kitIds.find(id => new RegExp('^svGK1\\d+_' + pre + '$').test(id));
    await p.fill('#' + K('ana'), 'در مسئلهٔ «خط‌های میانِ n نقطه» هم هر جفت یک بار شمرده می‌شود');
    await p.fill('#' + K('anag'), 'پس جواب مثلِ تعدادِ جفت‌ها باید باشد؛ اگر کسی با خودش دست بدهد قیاس می‌شکند');
    await p.fill('#' + K('dim'), 'برای ۲، ۳، ۴ نفر: ۱، ۳، ۶ ⇒ n(n−1)/2');
    for (const [i, y] of [[0, '0'], [1, '1'], [2, '3']]) await p.fill('#' + K('y' + i), y);
    await p.click('main .sv-u .sv-kaddrow'); await W(40);
    const y3 = await p.evaluate(() => [...document.querySelectorAll('main .sv-u .sv-ky')].pop().id); await p.fill('#' + y3, '6');
    await p.fill('#' + K('f'), 'n^2');
    await p.fill('#' + K('r0'), 'n(n-1)/2'); await p.fill('#' + K('rt0'), 'n = ۵ را بشمار');
    await p.fill('#' + K('r1'), '2^(n-1) - 1'); await p.fill('#' + K('rt1'), 'n = ۴ را بشمار');
    await sel('#' + K('w'), '1'); await sel('#' + K('ww'), 'like');
    await p.click('main .sv-u .sv-kchk'); await W(60);
    info.kit1 = await p.locator('main .sv-u .sv-kout').innerText();
    chk(/مرتبهٔ ۲ ثابت/.test(info.kit1) && /نمی‌خواند/.test(info.kit1) && /n = (۴|4)/.test(info.kit1.replace(/[\u2066-\u2069]/g, '').replace(/\u00a0/g, ' ')) && /دلبستگی/.test(info.kit1), 'kit check by code: diffs order 2, formula mismatch, separating case, liking is no reason :: ' + info.kit1);
    await p.fill('#' + K('f'), 'n(n-1)/2'); await sel('#' + K('ww'), 'bold'); await p.click('main .sv-u .sv-kchk'); await W(60);
    info.kit2 = await p.locator('main .sv-u .sv-kout').innerText();
    chk(/با هر ۴ حالتِ جدول می‌خواند/.test(info.kit2) && /پشتیبانی شد، نه ثابت/.test(info.kit2) && !/دلبستگی/.test(info.kit2) && /حدسِ ۲ با جدول نمی‌خواند/.test(info.kit2), 'kit check after fixing :: ' + info.kit2);
    // سازنده‌های کدی از کارتِ حدس
    await p.evaluate(() => { const d = document.querySelector('main .sv-u .sv-gdrill'); d.open = true; d.dispatchEvent(new Event('toggle')); }); await W(60);
    info.gens = await p.evaluate(() => [...document.querySelectorAll('main .sv-u .sv-gdrill .mv-genbtn')].map(b => b.getAttribute('data-gen')));
    chk(['guesstest', 'diffs', 'rivals', 'analogy'].every(k => info.gens.includes(k)), 'guess card offers the code generators ' + info.gens);
    await p.click('main .sv-u .sv-gdrill .mv-genbtn[data-gen="diffs"]'); await W(40);
    chk(await p.locator('main .sv-u .sv-gdrill .mv-gen[data-gen="diffs"] .mv-dopt').count() === 4, 'diffs generator: 4 options');
    await p.locator('main .sv-u .sv-gdrill .mv-gen[data-gen="diffs"] .mv-dopt:not([data-ok])').first().click(); await W(40);
    await p.click('main .sv-u .sv-gdrill .mv-genbtn[data-gen="analogy"]'); await W(40);
    await p.locator('main .sv-u .sv-gdrill .mv-gen[data-gen="analogy"] .mv-dopt[data-ok]').click(); await W(40);
    info.gprog = await p.evaluate(() => { const by = (APP.S.get('moves_prog') || {}).by || {}; return { sp: by.mv_special, an: by.mv_analogy }; });
    chk(info.gprog.sp && info.gprog.sp.due === T.d1 && info.gprog.an && info.gprog.an.dok >= 1 && info.gprog.an.due > T.today, 'generated guess drills are spaced (wrong ⇒ tomorrow; right ⇒ later) ' + JSON.stringify(info.gprog));
    // ثبتِ کارتِ فهم با حدس ⇒ کیت با حدس ذخیره می‌شود
    await p.fill('#svU1', 'شمارِ دست‌دادن‌ها'); await p.fill('#svD1', 'n مهمان'); await p.fill('#svC1', 'هر دو نفر یک بار');
    await sel('#svSuff1', 'کافی است'); await p.fill('#svGuess1', 'n(n-1)/2'); await p.fill('#svTest1', 'برای ۳ نفر: ۳');
    await p.click('main .sv-usave'); await W(60); await p.click('main .sv-u .sv-g2'); await W(120);
    info.gk = await p.evaluate(pid => { const g = APP.S.get('eprog_' + pid).solve.g[1]; return g && g.kit ? { f: g.kit.formula, r: g.kit.rivals.map(x => x.t), chk: g.kit.chk } : null; }, PID);
    chk(info.gk && info.gk.f === 'n(n-1)/2' && info.gk.r.length === 2 && info.gk.chk && info.gk.chk.sep && info.gk.chk.sep.n === 4, 'guess kit saved with the guess ' + JSON.stringify(info.gk));
    // مرورِ حدس: رقیب‌ها بی‌نگاه
    await p.evaluate(pid => { const g = APP.S.get('eprog_' + pid); g.solve.rev.g.due = APP.today(); APP.S.put(g); }, PID); await open(PID, 1, 0);
    chk(await p.locator('#svRGR').count() === 1, 'guess review asks for the rival guesses and the separating case');
    await p.fill('#svRG', 'برای ۴ نفر ۶ شد'); await p.click('main .sv-rph[data-ph="g"] .sv-rshow'); await W(60);
    chk(/رقیب‌هایت/.test(await p.locator('main .sv-rph[data-ph="g"]').innerText()) && /حالتِ جداکننده: n = (۴|4)/.test((await p.locator('main .sv-rph[data-ph="g"]').innerText()).replace(/[\u2066-\u2069]/g, '').replace(/\u00a0/g, ' ')), 'guess review reveals the rivals and the separating case');
    // بازنگری: تعمیم با جدول ⇒ در درس و کارتِ مرور
    info.lb = await p.evaluate(async pid => {
      const P = APP.getProb(pid), pg = APP.S.get('eprog_' + pid), box = APP.solveLookBackCard(P, pg, 1); document.querySelector('main').appendChild(box);
      const kit = box.querySelector('.sv-kit'), set = (el, v) => { el.value = v; el.dispatchEvent(new Event('input')); el.dispatchEvent(new Event('change')); };
      kit.querySelector('.sv-kaddrow').click(); const ys = kit.querySelectorAll('.sv-ky'); ['0', '1', '3', '6'].forEach((v, i) => set(ys[i], v));
      set(kit.querySelector('input[id$="_f"]'), 'n(n-1)/2'); kit.querySelector('.sv-kchk').click();
      const o = { out: kit.querySelector('.sv-kout').textContent, own: !!kit.closest('[data-own]') };
      box.querySelector('#svLb_sp1').click(); box.querySelector('#svLb_sp1').dispatchEvent(new Event('change'));
      set(box.querySelector('#svLbRes1'), 'نتیجه سالم ماند'); set(box.querySelector('#svLbUse1'), 'شمارشِ جفت‌ها در هر گروه'); set(box.querySelector('#svLbNew1'), 'چند بازی در یک دورهٔ تک‌حذفی؟');
      const hit = box.querySelector('#svLbHit1'); if (hit) set(hit, 'درست بود');
      box.querySelector('.sv-lbsave').click(); await new Promise(r => setTimeout(r, 120));
      const b = APP.S.get('eprog_' + pid).solve.b[1], card = APP.S.all('card', c => /دست‌دادن‌ها/.test(c.q)).pop();
      o.kit = b && b.kit && b.kit.formula; o.card = card && /حکمِ کلیِ دقیق/.test(card.a) && card.due === APP.addDays(APP.today(), 1); return o; }, PID);
    chk(/مرتبهٔ ۲ ثابت/.test(info.lb.out) && info.lb.own && info.lb.kit === 'n(n-1)/2' && info.lb.card, 'looking-back generalisation table/formula checked by code and spaced on the lesson card ' + JSON.stringify(info.lb));
    // صفحهٔ حرکت‌ها
    info.mvgen = await p.evaluate(async () => { const o = {}; for (const [m, k] of [['mv_analogy', 'analogy'], ['mv_general', 'diffs'], ['mv_special', 'rivals']]) { APP.go('move', m); await new Promise(r => setTimeout(r, 120)); o[m] = !!document.querySelector('#main .mv-genbtn[data-gen="' + k + '"]'); } return o; });
    chk(Object.values(info.mvgen).every(Boolean), 'move pages offer the new generators ' + JSON.stringify(info.mvgen));

    /* ===== الف) اراده: شبیه‌ساز (گامِ نادرست + حالِ دلسرد) ===== */
    await p.evaluate(() => { const P = { id: 'pb_w_r4', title: 'تقسیمِ ارث', field: 'شخصی', statement: 'هفده شتر میانِ سه پسر', answer: '۹، ۶، ۲', why_hard: 'w', stages: [{ id: 'n1', q: 'نخستین حرکت؟', ctx: 'c', lvl: 1, opts: [{ t: 'قرض گرفتنِ یک شتر', ok: true }, { t: 'تقسیمِ مستقیم', ok: false }, { t: 'فروختنِ شترها', ok: false }] }, { id: 'n2', q: 'بعد؟', ctx: 'c', lvl: 1, opts: [{ t: 'پس دادنِ شتر', ok: true }, { t: 'نگه داشتن', ok: false }] }], dead: [], drills: [], lessons: [], src: [] };
      APP.S.put({ id: 'eprob_pb_w_r4', type: 'eprob', status: 'approved', by: 'me', p: P }); APP.S.put({ id: 'eprog_pb_w_r4', type: 'eprog', lv: { 1: { n2: { first: false, at: new Date().toISOString() } } } }); });
    await open('pb_w_r4', 1, 0);
    chk(await p.locator('main .sv-win').count() === 1, 'small-win card after the wrong step');
    chk(await p.locator('main .sv-win .sv-will').count() === 0, 'no will card before the learner says how they feel');
    await sel('#svWinMood_1', 'دلسردم');
    chk(await p.locator('main .sv-win .sv-winwill .sv-will').count() === 1, 'discouraged after a wrong step ⇒ «🌱 کوچک‌ترین گامِ بعد»');
    await ownCheck('main .sv-win .sv-winwill .sv-will', 'will card');
    const wid = await p.evaluate(() => [...document.querySelectorAll('main .sv-winwill select, main .sv-winwill input')].map(e => e.id));
    const Wd = pre => wid.find(id => new RegExp('^wl\\d+_' + pre + '$').test(id));
    await p.click('main .sv-winwill .sv-willsave'); await W(40);
    chk(/هنوز نه/.test(await p.locator('main .sv-winwill').innerText()), 'empty commitment rejected');
    await sel('#' + Wd('des'), 'want'); await sel('#' + Wd('hope'), 'unsure'); await p.fill('#' + Wd('cur'), 'این‌که یک شترِ قرضی همه‌چیز را حل می‌کند');
    await p.fill('#' + Wd('step'), 'بیشتر تلاش کنم'); await p.fill('#' + Wd('when'), 'فردا ساعتِ ۷، بیست دقیقه'); await sel('#' + Wd('bud'), 'one');
    await p.click('main .sv-winwill .sv-willsave'); await W(40);
    chk(/آرزوست/.test(await p.locator('main .sv-winwill').innerText()), 'vague step («بیشتر تلاش کنم») rejected by code');
    await p.fill('#' + Wd('step'), 'تقسیمِ ارث'); await p.click('main .sv-winwill .sv-willsave'); await W(40);
    chk(/خودِ هدف است/.test(await p.locator('main .sv-winwill').innerText()), 'the goal itself is not a next step');
    await p.fill('#' + Wd('step'), 'جمعِ ۱/۲ و ۱/۳ و ۱/۹ را روی کاغذ حساب کنم'); await p.click('main .sv-winwill .sv-willsave'); await W(60);
    info.w1 = await p.evaluate(() => { const w = APP.S.get('eprog_pb_w_r4').solve.will; return { n: w.steps.length, s: w.steps[0], log: w.log.length }; });
    chk(info.w1.n === 1 && info.w1.s.iv === 1 && info.w1.s.due === T.d1 && info.w1.s.desire === 'want' && info.w1.s.hope === 'unsure' && /این‌که/.test(info.w1.s.curious) && info.w1.s.budget === 'one' && info.w1.s.trig === 'mood:دلسردم' && info.w1.log === 1,
      'commitment stored with will/hope/curiosity/budget signals, check tomorrow ' + JSON.stringify(info.w1));
    // روزِ موعد: «امروز» و بالای شبیه‌ساز
    await p.evaluate(() => { const g = APP.S.get('eprog_pb_w_r4'); g.solve.will.steps[0].due = APP.today(); APP.S.put(g); });
    info.today = await p.evaluate(() => APP.dueList().filter(x => /گامِ کوچکی که قول دادی/.test(x.txt)).map(x => x.txt + ' | ' + x.sub));
    chk(info.today.length === 1 && /جمعِ/.test(info.today[0]) && /تقسیمِ ارث/.test(info.today[0]), 'due commitment in Today ' + JSON.stringify(info.today));
    await open('pb_w_r4', 1, 1);
    chk(await p.locator('main .sv-pre .sv-willchk').count() === 1, 'check card on top of the simulator on the due day');
    await ownCheck('main .sv-pre .sv-willchk', 'will check card');
    const cid = await p.evaluate(() => [...document.querySelectorAll('main .sv-willchk select, main .sv-willchk input')].map(e => e.id));
    const Cd = pre => cid.find(id => new RegExp('^wc\\d+_' + pre + '$').test(id));
    await sel('#' + Cd('done'), 'no'); await p.click('main .sv-willchkgo'); await W(40);
    chk(await p.evaluate(() => APP.S.get('eprog_pb_w_r4').solve.will.steps[0].checks.length) === 0, 'check without «what stopped you» rejected');
    await sel('#' + Cd('blk'), 'fear'); await sel('#' + Cd('imm'), 'none'); await sel('#' + Cd('prop'), 'less'); await sel('#' + Cd('des'), 'some'); await sel('#' + Cd('hope'), 'no');
    await p.click('main .sv-willchkgo'); await W(60);
    info.c1 = await p.evaluate(() => { const w = APP.S.get('eprog_pb_w_r4').solve.will, box = document.querySelector('main .sv-willchk'); return { c: w.steps[0].checks[0], closed: w.steps[0].closed, f7: !!box.querySelector('.sv-willf7'), next: !!box.querySelector('.sv-willf'), log: w.log.map(x => x.kind).join() }; });
    chk(info.c1.closed && info.c1.c.done === 'no' && info.c1.c.block === 'fear' && info.c1.c.hope === 'no' && info.c1.f7 && info.c1.next && info.c1.log === 'commit,check', 'not done ⇒ signals logged, F7 link, smaller next step offered ' + JSON.stringify(info.c1));
    const nid = await p.evaluate(() => [...document.querySelectorAll('main .sv-willchk .sv-willf select, main .sv-willchk .sv-willf input')].map(e => e.id));
    const Nd = pre => nid.find(id => new RegExp('^wl\\d+_' + pre + '$').test(id));
    await sel('#' + Nd('des'), 'want'); await sel('#' + Nd('hope'), 'unsure'); await p.fill('#' + Nd('step'), 'جمعِ ۱/۲ و ۱/۳ و ۱/۹ را روی کاغذ حساب کنم'); await p.fill('#' + Nd('when'), 'امشب، ده دقیقه');
    await p.click('main .sv-willchk .sv-willsave'); await W(40);
    chk(/همان گامِ انجام‌نشدهٔ قبلی/.test(await p.locator('main .sv-willchk').innerText()), 'same undone step again is rejected (make it smaller)');
    await p.fill('#' + Nd('step'), 'فقط ۱/۲ + ۱/۳ را حساب کنم'); await p.click('main .sv-willchk .sv-willsave'); await W(60);
    info.w2 = await p.evaluate(() => APP.S.get('eprog_pb_w_r4').solve.will.steps[1]);
    chk(info.w2 && info.w2.iv === 1 && info.w2.due === T.d1, 'after an undone step the smaller step is checked tomorrow ' + JSON.stringify(info.w2));
    // انجام شد ⇒ گامِ بعد یک پله دورتر
    await p.evaluate(() => { const g = APP.S.get('eprog_pb_w_r4'); g.solve.will.steps[1].due = APP.today(); APP.S.put(g); }); await open('pb_w_r4', 1, 1);
    const cid2 = await p.evaluate(() => [...document.querySelectorAll('main .sv-willchk select, main .sv-willchk input')].map(e => e.id));
    const C2 = pre => cid2.find(id => new RegExp('^wc\\d+_' + pre + '$').test(id));
    await sel('#' + C2('done'), 'yes'); await p.fill('#' + C2('what'), 'پنج‌ششم شد؛ یک‌نهم کم است'); await sel('#' + C2('imm'), 'deep'); await sel('#' + C2('prop'), 'fit');
    await p.click('main .sv-willchkgo'); await W(60);
    const nid2 = await p.evaluate(() => [...document.querySelectorAll('main .sv-willchk .sv-willf select, main .sv-willchk .sv-willf input')].map(e => e.id));
    const N2 = pre => nid2.find(id => new RegExp('^wl\\d+_' + pre + '$').test(id));
    await sel('#' + N2('des'), 'want'); await sel('#' + N2('hope'), 'yes'); await p.fill('#' + N2('step'), 'یک‌نهم را هم بیفزایم و ببینم چه کم می‌ماند'); await p.fill('#' + N2('when'), 'فردا صبح، ده دقیقه');
    await p.click('main .sv-willchk .sv-willsave'); await W(60);
    info.w3 = await p.evaluate(() => { const w = APP.S.get('eprog_pb_w_r4').solve.will; return { s: w.steps[2], log: w.log.length, logUI: !!document.querySelector('main .sv-willlog') }; });
    chk(info.w3.s && info.w3.s.iv === 3 && info.w3.s.due === T.d3 && info.w3.logUI, 'done ⇒ next step checked one rung later on the same ladder ' + JSON.stringify(info.w3));
    // ایستِ پیشرفت: «پیشرفت: نه» ⇒ همان کارت
    await open('pb_p4_invoice', 1, 1); await p.click('main .simcard .sv-cpbtn'); await W(60);
    await sel('#svCpP', 'نه');
    chk(await p.locator('main .sv-cp .sv-cpwill .sv-will').count() === 1, 'progress checkpoint «no progress» ⇒ smallest next step card');

    /* ===== الف) ایده: نقد ⇐ فرض ⇐ گام؛ رها کردنِ آگاهانه؛ حدس‌های رقیب ===== */
    const IID = await p.evaluate(() => { const r = { id: APP.uid('idea'), type: 'idea', what: 'اپلیکیشنی برای پس‌اندازِ گروهیِ همکارانِ بانک', title: 'پس‌اندازِ گروهی', parts: [{ k: 'assumption', t: 'همکاران حاضرند ماهانه پول بگذارند' }, { k: 'assumption', t: 'بانک مجوز می‌دهد' }], created: new Date().toISOString() }; APP.S.put(r); return r.id; });
    await p.evaluate(id => APP.go('idea', id), IID); await W(150);
    await ownCheck('main .idea-crit', 'idea criticism');
    await p.fill('#ideaCritT', 'مدیرم گفت کسی به این اعتماد نمی‌کند'); await p.click('main .idea-critsave'); await W(40);
    chk(await p.evaluate(id => !(APP.S.get(id).crits || []).length, IID), 'criticism without its target assumption rejected');
    await sel('#ideaCritA', '0'); await p.fill('#ideaCritC', 'باید با گروهِ کوچکِ آشنا شروع شود'); await p.click('main .idea-critsave'); await W(150);
    info.crit = await p.evaluate(id => ({ c: APP.S.get(id).crits, will: !!document.querySelector('main .sv-will[data-host="idea"]'), intro: (document.querySelector('main .sv-will[data-host="idea"] p') || {}).textContent }), IID);
    chk(info.crit.c.length === 1 && info.crit.c[0].target === '0' && info.crit.will && /نقد را شنیدی/.test(info.crit.intro), 'criticism stored with its assumption; will card asks for the step that tests it ' + JSON.stringify(info.crit));
    await ownCheck('main .sv-will[data-host="idea"]', 'idea will card');
    const iw = await p.evaluate(() => [...document.querySelectorAll('main .sv-will[data-host="idea"] select, main .sv-will[data-host="idea"] input')].map(e => e.id));
    const I = pre => iw.find(id => new RegExp('^wl\\d+_' + pre + '$').test(id));
    await sel('#' + I('des'), 'drop'); await p.click('main .sv-will[data-host="idea"] .sv-willsave'); await W(40);
    chk(/دلیلِ رها کردن/.test(await p.locator('main .sv-will[data-host="idea"]').innerText()), 'dropping needs a reason');
    await p.fill('#' + I('dw'), 'مدیرم گفت کسی اعتماد نمی‌کند'); await sel('#' + I('ds'), 'crit'); await p.click('main .sv-will[data-host="idea"] .sv-willsave'); await W(60);
    info.drop = await p.evaluate(id => ({ d: APP.S.get(id).will.drop, warn: /دلیلِ خودِ ایده نیست/.test(document.querySelector('main .sv-will[data-host="idea"]').textContent), f7: !!document.querySelector('main .sv-will[data-host="idea"] .sv-willf7') }), IID);
    chk(info.drop.d && info.drop.d.src === 'crit' && info.drop.d.due === T.d3 && info.drop.warn && info.drop.f7, 'dropping after criticism: recorded, challenged, re-asked one rung later ' + JSON.stringify(info.drop));
    await p.evaluate(id => { const r = APP.S.get(id); r.will.drop.due = APP.today(); APP.S.put(r); }, IID);
    chk(await p.evaluate(() => APP.dueList().some(x => /آگاهانه رها کردی/.test(x.txt))), 'drop re-check in Today');
    await p.evaluate(id => APP.go('idea', id), IID); await W(150);
    const dk = await p.evaluate(() => document.querySelector('main .sv-willdropchk select').id);
    await sel('#' + dk, 'back'); await p.click('main .sv-willdropgo'); await W(60);
    chk(await p.locator('main .sv-willdropchk .sv-willf').count() === 1 && await p.evaluate(id => APP.S.get(id).will.drop === null, IID), 'taking the idea back ⇒ the next-step form');
    // حدس‌های رقیب دربارهٔ ایده
    await ownCheck('main .page.idea > .sv-kit', 'idea rival guesses');
    info.ikit = await p.evaluate(async id => { const kit = document.querySelector('main .page.idea > .sv-kit'), set = (el, v) => { el.value = v; el.dispatchEvent(new Event('input')); el.dispatchEvent(new Event('change', { bubbles: true })); };
      const rs = kit.querySelectorAll('.sv-kriv input'); set(rs[0], 'همکاران پول می‌گذارند'); set(rs[1], 'پیش‌خرید از پنج همکار'); set(rs[2], 'فقط تعریف می‌کنند و پول نمی‌گذارند'); set(rs[3], 'پرسیدنِ مبلغِ مشخص');
      const ss = kit.querySelectorAll('select'); set(ss[0], '0'); set(ss[1], 'cheap'); kit.querySelector('.sv-kchk').click(); await new Promise(r => setTimeout(r, 60));
      const r = APP.S.get(id); return { saved: r.kit && r.kit.rivals[1].t, chk: r.kit && r.kit.chk && r.kit.chk.ok, out: kit.querySelector('.sv-kout').textContent }; }, IID);
    chk(info.ikit.saved === 'فقط تعریف می‌کنند و پول نمی‌گذارند' && info.ikit.chk && /وارسی شد/.test(info.ikit.out), 'idea rival guesses saved and checked ' + JSON.stringify(info.ikit));

    /* ===== الف) گره‌گشا: خانوادهٔ F7 ⇒ همان کارت ===== */
    info.f7 = await p.evaluate(async () => { const kn = APP.newKnot({ name: 'ترس از قضاوت', fam: 'F7', cases: [] });
      const kc = APP.S.put({ id: APP.uid('kc'), type: 'kcase', title: 'ترس از گفتنِ ایده در جلسه', kinds: ['behavior'], intake: { stmts: [], what: 'در جلسه ایده‌ام را نگفتم', expected: 'بگویم', actual: 'ساکت ماندم', thoughts: 'اگر مسخره کنند؟', seen: 'na' },
        premise: { verdict: 'yes' }, ev: [{ fam: 'F7', dir: 1, w: 1, kind: 'fact', text: 'شاهد', src: 'manual' }], root: { primary: 'F7', extra: [], why5: [], confirmed: true }, knots: [kn.id], acts: [], hyps: [], pans: {}, ladder: {}, status: 'rooted', step: 's4' });
      kn.cases = [kc.id]; APP.S.put(kn);
      APP.go('kcase', kc.id, 's4'); await new Promise(r => setTimeout(r, 200)); return { id: kc.id, card: !!document.querySelector('main .sv-will[data-host="knot"]'), step: APP.state.sub }; });
    chk(info.f7.card, 'F7 knot (emotion & motivation) ⇒ «🌱 کوچک‌ترین گامِ بعد» in the unpack step ' + JSON.stringify(info.f7));
    if (info.f7.card) {
      const kw = await p.evaluate(() => [...document.querySelectorAll('main .sv-will[data-host="knot"] select, main .sv-will[data-host="knot"] input')].map(e => e.id));
      const Q = pre => kw.find(id => new RegExp('^wl\\d+_' + pre + '$').test(id));
      await sel('#' + Q('des'), 'want'); await sel('#' + Q('hope'), 'unsure'); await p.fill('#' + Q('step'), 'در جلسهٔ دوشنبه یک جمله دربارهٔ ایده بگویم'); await p.fill('#' + Q('when'), 'دوشنبه، جلسهٔ ساعتِ ۱۰');
      await p.click('main .sv-will[data-host="knot"] .sv-willsave'); await W(400);
      info.f7s = await p.evaluate(id => { const kc = APP.S.get(id); return kc.will && kc.will.steps[0]; }, info.f7.id);
      chk(info.f7s && info.f7s.due === T.d1, 'knot commitment stored on the situation ' + JSON.stringify(info.f7s));
      await p.evaluate(id => { const kc = APP.S.get(id); kc.will.steps[0].due = APP.today(); APP.S.put(kc); }, info.f7.id);
      chk(await p.evaluate(() => APP.dueList().some(x => /در جلسهٔ دوشنبه/.test(x.txt))), 'knot commitment due in Today');
    }

    /* ===== ب) مسئلهٔ عملی: دانشِ پیشین و ریاضی‌کردن ===== */
    const kid = await p.evaluate(() => { const kc = APP.knotNewCase(); kc.kinds = ['behavior']; kc.title = 'تصمیمِ ماندن در بانک یا رفتن'; APP.S.put(kc); APP.go('kcase', kc.id, 'in'); return kc.id; }); await W(200);
    await ownCheck('main .kn-prac', 'practical frame (8 parts + rivals)');
    for (const [id, v] of [['knPWant', 'شغلی امن‌تر با درآمدِ کافی'], ['knPHave', 'دو پیشنهاد، پس‌اندازِ شش ماه'], ['knPCond', 'رفت‌وآمد کمتر از یک ساعت'], ['knPVague', '«امن» یعنی قراردادِ دست‌کم دوساله'], ['knPIgnore', 'شایعه‌ها؛ تا دو گفت‌وگو'], ['knPApprox', 'ده درصد کمتر هم قبول'],
      ['knPPrior', 'سه همکارِ قبلی که رفتند، دو نفر راضی‌اند؛ قاعدهٔ سرانگشتی: تا پیشنهادِ کتبی نیامده استعفا نده'], ['knPMeasure', 'درآمد زیاد باشد']]) await p.fill('#' + id, v);
    await W(300); await p.click('main .kn-pracchk'); await W(150);
    info.pm1 = await p.evaluate(id => ({ chk: APP.S.get(id).intake.prac.chk, out: document.querySelector('main .kn-pracout').textContent, cards: APP.S.all('card', c => c.src === 'knot:practical' && /ماندن در بانک/.test(c.q)).length }), kid);
    chk(info.pm1.chk && !info.pm1.chk.ok && /سنجیدنی نیست/.test(info.pm1.out) && info.pm1.cards === 0, 'unmeasurable «mathematised» part caught by code ' + JSON.stringify(info.pm1));
    await p.fill('#knPMeasure', 'x = درآمدِ ماهانه؛ موفقیت: x ≥ ۲۵ میلیون و رفت‌وآمد ≤ ۴۵ دقیقه'); await W(300); await p.click('main .kn-pracchk'); await W(150);
    info.pm2 = await p.evaluate(id => { const kc = APP.S.get(id), cs = APP.S.all('card', c => c.src === 'knot:practical' && /ماندن در بانک/.test(c.q)); return { ok: kc.intake.prac.chk.ok, n: cs.length, due: cs[0] && cs[0].due, a: cs[0] && cs[0].a, q: cs[0] && cs[0].q }; }, kid);
    chk(info.pm2.ok && info.pm2.n === 1 && info.pm2.due === T.d1 && /سرانگشتی/.test(info.pm2.a) && /≥ ۲۵/.test(info.pm2.a) && /دانشِ پیشین/.test(info.pm2.q), 'prior knowledge + measurable form in the spaced review card ' + JSON.stringify(info.pm2));
    info.meas = await p.evaluate(() => [APP.measurableCheck('درآمدِ بیشتر').ok, APP.measurableCheck('دست‌کم ۳ مشتریِ پرداخت‌کننده در ماه').ok, APP.measurableCheck('x = 5').ok, APP.measurableCheck('حداکثر ۴۵ دقیقه').ok, APP.measurableCheck('۲۵ میلیون').ok]);
    chk(info.meas.join() === 'false,true,true,true,false', 'measurable check: a number AND a relation ' + info.meas);
    // غربال (بی‌مدل): ۸ جزء؛ ریاضی‌کردنِ ناسنجیدنی ⇒ بی کارت
    info.sieve = await p.evaluate(() => {
      const AS = APP.ASSIST, s = AS.newSession(); AS._turnSession = s; AS.DO.tour_plan({ goal: 'تصمیمِ تغییرِ شغل', facets: [{ key: 'f1', kind: 'claim', title: 'تصمیم' }] });
      AS.DO.tour_diag({ layers: [{ id: 'practical', st: 'ask', why: '' }] }); APP.S.put(s);
      const dr = AS.tourDrawer(s), ins = [...dr.querySelectorAll('.as-practin')];
      const o = { inputs: ins.length, ids: ins.map(x => x.id).join() };
      [['unknown', 'کدام شغل'], ['data', 'دو پیشنهاد'], ['cond', 'بودجه'], ['vague', 'امن یعنی قرارداد'], ['ignore', 'شایعه'], ['approx', 'ده درصد'], ['prior', 'همکارانِ قبلی'], ['measure', 'خوب باشد']].forEach(([k, v]) => AS.sievePracticalSet(s, k, v));
      o.noCard = !s.tour.diag.practical.card;
      AS.sievePracticalSet(s, 'measure', 'درآمد ≥ ۲۵ میلیون'); o.card = !!s.tour.diag.practical.card; return o; });
    chk(info.sieve.inputs === 8 && /asPract_prior/.test(info.sieve.ids) && /asPract_measure/.test(info.sieve.ids) && info.sieve.noCard && info.sieve.card, 'sieve practical frame: prior + measurable parts checked by code ' + JSON.stringify(info.sieve));

    /* ===== دستیار: قلاب فقط وقتی حرف از شکست/نقد است؛ پرامپتِ سامانه دست نخورده ===== */
    info.hook = await p.evaluate(() => { const AS = APP.ASSIST, s = AS.newSession(); const a = AS.prompt(s, 'بعد از نقدِ مدیرم ایده را رها کردم', AS.scan(), ''), b = AS.prompt(s, 'جدولِ ضرب را مرور کنیم', AS.scan(), '');
      const H = /# پس از شکست، نقد یا میلِ رها کردن/; return { on: H.test(a) && /حدس‌های رقیب/.test(a), off: !H.test(b), sys: AS.SYS.length, sysClean: !H.test(AS.SYS) }; });
    chk(info.hook.on && info.hook.off && info.hook.sys < 20000 && info.hook.sysClean, 'assistant hook only on set-back talk; system prompt untouched ' + JSON.stringify(info.hook));
    /* ===== تلفن: کارت‌های تازه از عرضِ صفحه بیرون نمی‌زنند ===== */
    await p.setViewportSize({ width: 390, height: 844 });
    for (const v of [['e_prob', 'pb_fourcolor', 'sim'], ['e_prob', 'pb_w_r4', 'sim'], ['idea', IID], ['kcase', kid, 'in'], ['kcase', info.f7.id, 's4']]) {
      await p.evaluate(x => { if (x[0] === 'e_prob') APP.simState = { pid: x[1], lv: 1, order: 'hist', i: 0 }; APP.go(...x); }, v); await W(200);
      await p.evaluate(() => document.querySelectorAll('main details').forEach(d => { d.open = true; })); await W(60);
      const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); chk(ov <= 2, 'mobile overflow ' + v.join(':') + ' ' + ov);
    }
  } catch (e) { errors.push('exception: ' + (e && e.stack || e)); }
  console.log(JSON.stringify(info).slice(0, 4000));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
})();
