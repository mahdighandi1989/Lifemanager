// ممیزیِ نیمهٔ یادگیری (۲۰۲۶-۱۰-۱۳): پانزده خطای تأییدشده — هر بند یک بررسی. روی نسخهٔ مستقلِ ساخته‌شده (dist/learning-architecture.html)
const { chromium } = require('playwright');
const path = require('path');
const { installWriteSpy, settle, until } = require('./page_sync');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  async function page(opts = {}) {
    const ctx = await b.newContext({ viewport: opts.vp || { width: 1280, height: 900 }, timezoneId: opts.tz });
    const p = await ctx.newPage();
    if (opts.clock) await p.clock.install({ time: opts.clock });
    p.on('pageerror', e => errors.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(300); await installWriteSpy(p);
    return { p, ctx };
  }
  const startCourse = async (p, topic) => {
    await p.evaluate(() => APP.goRoot('start')); await p.locator('main .door.main .btn').click(); await p.waitForTimeout(150);
    await p.fill('#crsTopic', topic); await p.click('main .btn:has-text("شروعِ درسِ اول")'); await p.waitForTimeout(250);
  };
  // the text fields are addressed by their id, not by position: a positional nth() locator re-resolves to whatever element sits
  // at that index when the form redraws (a list «+ افزودن», a lock «باز کردن»), and can then wait on the wrong element
  const textFields = (T, emptyOnly) => T.p.$$eval(T.q, (els, emptyOnly) => els.map((e, i) => ({ id: e.id, i, show: !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length), ok: !e.disabled && !e.readOnly, empty: !e.value }))
    .filter(x => x.show && x.ok && (!emptyOnly || x.empty)), emptyOnly);
  const fillText = async (T, txt, emptyOnly) => {
    for (const f of await textFields(T, emptyOnly)) {
      const el = f.id ? T.p.locator('[id="' + f.id + '"]') : T.p.locator(T.q).nth(f.i);
      if (await el.isVisible() && await el.isEditable() && (!emptyOnly || !(await el.inputValue()))) await el.fill(txt);
    }
  };
  const fillWS = async (p, scope) => {
    const S = scope + ' .wsform';
    const T = { p, q: S + ' textarea, ' + S + ' input[type=text]' };
    await fillText(T, 'پاسخِ آزمایشی', false);
    for (const sel of await p.locator(S + ' select').all()) { if (!(await sel.isVisible())) continue; const o = await sel.locator('option').count(); if (o > 1) await sel.selectOption({ index: 1 }); }
    for (const cb of await p.locator(S + ' input[type=checkbox]').all()) { if (await cb.isVisible()) await cb.check(); }
    for (const nb of await p.locator(S + ' input[type=number]').all()) { if (await nb.isVisible()) await nb.fill('3'); }
    for (const add of await p.locator(S + ' button:has-text("افزودن")').all()) { if (await add.isVisible()) await add.click(); }
    for (let k = 0; k < 6; k++) { const ub = p.locator(S + ' button:has-text("باز کردن"):visible').first(); if (!(await ub.count())) break; await ub.click().catch(() => {});
      await fillText(T, 'پاسخ', true); }
    await fillText(T, 'پاسخ', true);
    await settle(p);   // the worksheet's debounced write (400 ms) has landed
  };

  // ۱) دکمهٔ «▶ ادامه» در ۳۹۰px تمام‌عرض و خوانا
  { const { p, ctx } = await page({ vp: { width: 390, height: 844 } });
    await startCourse(p, 'ریاضی'); await p.evaluate(() => APP.go('course')); await p.waitForTimeout(150);
    info.btn = await p.evaluate(() => { const r = document.querySelector('main .crs-now .btn.lg').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
    if (!(info.btn[0] >= 280 && info.btn[1] < 120)) errors.push('1 continue button crushed: ' + info.btn);
    // ۸) متن‌ها: ۵۶ درس و بازهٔ واقعی
    const span = await p.evaluate(() => APP.courseSpan().map(APP.fa));
    const nav = await p.evaluate(() => document.querySelector('.nav[data-v="course"] .nd').textContent);
    await p.evaluate(() => APP.goRoot('start')); const door = await p.locator('main .door.main').innerText();
    info.texts = { span, nav: nav.slice(0, 80) };
    for (const [lab, t] of [['nav', nav], ['door', door]]) if (!t.includes('۵۶') || !t.includes(span[0] + ' تا ' + span[1]) || /۴۵ درس/.test(t)) errors.push('8 stale course text in ' + lab + ': ' + t.slice(0, 120));
    await ctx.close(); }
  { const { p, ctx } = await page();
    await p.evaluate(() => APP.goRoot('home')); const home = await p.locator('main .crs-home').innerText();
    const span = await p.evaluate(() => APP.courseSpan().map(APP.fa));
    if (!home.includes(span[0] + ' تا ' + span[1]) || /۱۵ تا ۵۵/.test(home) && span.join() !== '۱۵,۵۵') errors.push('8 stale home course card: ' + home);

    // ۲ و ۳) سفر: پرش به گامِ ۱۱ ⇒ پایان راستگو؛ برچسبِ فهرست همان
    await p.evaluate(() => APP.goRoot('topics')); await p.fill('#ntTitle', 'موضوعِ پرش'); await p.click('main .btn:has-text("ساخت و شروع")'); await p.waitForTimeout(150);
    const t2 = await p.evaluate(() => APP.state.arg);
    await p.click('main .jr-go'); await p.waitForTimeout(100);
    await p.locator('main .jr-st').nth(10).locator('.jr-stb').click(); await p.waitForTimeout(100);
    await fillWS(p, 'main .jr-now'); await p.click('main .jr-next'); await p.waitForTimeout(200);
    info.jump = { sub: await p.evaluate(() => APP.state.sub), h1: await p.locator('main h1').innerText(), open: await p.locator('main .jr-open li').count() };
    if (info.jump.sub !== 'end' || /تمام شد/.test(info.jump.h1) || info.jump.open !== 10) errors.push('2 end page claims finished: ' + JSON.stringify(info.jump));
    await p.evaluate(() => APP.go('topics')); await p.waitForTimeout(80);
    const lbl = await p.evaluate(t => { const i = APP.S.all('topic').findIndex(x => x.id === t); return document.querySelectorAll('main .jr-tbtn')[i].textContent; }, t2);
    if (/تمام‌شده/.test(lbl) || !/۱۰ گامِ باز/.test(lbl)) errors.push('2 topic list label: ' + lbl);
    // agreement: journey progress = topic page
    const agree = await p.evaluate(t => { const tp = APP.S.get(t), ps = APP.pipelineStatus(tp); return [APP.journeyProgress(tp).done, APP.C.PIPELINE.filter(s => ps[s.k]).length]; }, t2);
    if (agree[0] !== agree[1]) errors.push('3 journey/topic disagree: ' + agree);
    // ۳) گامِ ۵: بی‌کاشت جلو نمی‌رود؛ کاشت همین‌جا ⇒ صفحهٔ موضوع هم تیک می‌زند
    await p.evaluate(t => APP.go('journey', t, 'S5'), t2); await fillWS(p, 'main .jr-now');
    await p.click('main .jr-next'); await p.waitForTimeout(150);
    info.s5blocked = await p.evaluate(() => APP.state.sub);
    if (info.s5blocked !== 'S5') errors.push('3 S5 ticked without planting');
    await p.click('main .jr-plantone'); await p.waitForSelector('.dialog #pdT');
    await p.click('.dialog .btn:has-text("کاشت")'); await p.waitForTimeout(200);
    info.s5ps = await p.evaluate(t => APP.pipelineStatus(APP.S.get(t)).S5, t2);
    await p.click('main .jr-next'); await p.waitForTimeout(200);
    info.s5after = await p.evaluate(() => APP.state.sub);
    if (!info.s5ps || info.s5after !== 'S6') errors.push('3 inline plant failed: ' + info.s5ps + ' ' + info.s5after);
    // ۳) گامِ ۱۰: چرخهٔ ۱-۳-۷ واقعاً زمان‌بندی می‌شود
    await p.evaluate(t => APP.go('journey', t, 'S10'), t2); await fillWS(p, 'main .jr-now');
    await p.click('main .jr-next'); await p.waitForTimeout(200);
    info.s10 = await p.evaluate(t => [APP.state.sub, APP.S.all('sched', s => s.topic === t).length, APP.pipelineStatus(APP.S.get(t)).S10], t2);
    if (info.s10[0] !== 'S11' || info.s10[1] !== 3 || !info.s10[2]) errors.push('3 S10 cycle not scheduled: ' + info.s10);

    // ۴) مرور: اطمینان پس از «نمایش پاسخ» قفل؛ همان اطمینانِ پیش از پاسخ ثبت می‌شود
    await p.evaluate(() => APP.goRoot('review')); await p.fill('#rvAtt', 'پاسخ من'); await p.locator('#rvConf').fill('90');
    await p.click('main .btn:has-text("نمایش پاسخ")');
    info.locked = await p.locator('#rvConf').isDisabled();
    await p.evaluate(() => { const s = document.getElementById('rvConf'); s.value = 10; s.dispatchEvent(new Event('input', { bubbles: true })); });
    const cid = await p.evaluate(() => { const q = document.querySelector('main .flash .q').textContent; return APP.S.all('card').find(c => c.q === q).id; });
    await p.click('main .grades .btn.g5'); await p.waitForTimeout(100);
    info.hc = await p.evaluate(id => APP.S.get(id).hist.slice(-1)[0].c, cid);
    if (!info.locked || info.hc !== 90) errors.push('4 confidence not locked: ' + info.locked + ' ' + info.hc);

    // ۱۰) «کارت تازه» بی‌درنگ در فهرست
    await p.evaluate(() => APP.go('review', null, 'cards')); const r0 = await p.locator('main table.dt tbody tr').count();
    await p.click('main .btn:has-text("کارت تازه")'); await p.fill('#cdq', 'چرا فاصله‌گذاری؟'); await p.fill('#cda', 'بازیابیِ دشوار'); await p.click('.dialog .btn:has-text("ساخت کارت")'); await p.waitForTimeout(150);
    const r1 = await p.locator('main table.dt tbody tr').count();
    if (r1 !== r0 + 1) errors.push('10 new card not listed: ' + r0 + '→' + r1);

    // ۱۲) «امروز»: زدنِ کارِ موعد رکوردی نمی‌سازد؛ اولین ورودی یکی؛ دوباره زدن همان را باز می‌کند
    await p.evaluate(() => APP.S.all("pr", r => r.pid === "P2").forEach(r => APP.S.del(r.id)));  // سفرِ بالا «قرائت روز» را امروز اجرا کرده
    const prs0 = await p.evaluate(() => APP.S.all('pr', r => r.pid === 'P2').length);
    await p.evaluate(() => APP.goRoot('home')); await p.locator('main .dueb:has-text("قرائت")').click(); await p.waitForTimeout(150);
    const prs1 = await p.evaluate(() => APP.S.all('pr', r => r.pid === 'P2').length);
    await p.locator('main .wsform textarea, main .wsform input[type=text]').first().fill('قرائتِ امروز'); await until(p, n => APP.S.all('pr', r => r.pid === 'P2').length > n, prs0); await settle(p);
    const prs2 = await p.evaluate(() => APP.S.all('pr', r => r.pid === 'P2').length), rid = await p.evaluate(() => APP.state.sub);
    await p.evaluate(() => APP.goRoot('home')); await p.locator('main .dueb:has-text("قرائت")').click(); await p.waitForTimeout(150);
    const prs3 = await p.evaluate(() => APP.S.all('pr', r => r.pid === 'P2').length), rid2 = await p.evaluate(() => APP.state.sub);
    info.today = [prs0, prs1, prs2, prs3, rid === rid2];
    if (prs1 !== prs0 || prs2 !== prs0 + 1 || prs3 !== prs2 || rid !== rid2) errors.push('12 due click drafts: ' + info.today);

    // ۱۴) ورودِ پشتیبان «updated» را نگه می‌دارد
    await p.evaluate(() => APP.goRoot('settings'));
    await p.fill('#imJ', JSON.stringify([{ id: 'ex_old', type: 'ex', tid: 32, topic: '', status: 'done', data: {}, rubric: [], created: '2026-08-01T10:00:00.000Z', updated: '2026-08-01T10:00:00.000Z' }]));
    await p.click('main .btn:has-text("ورود داده")'); await p.waitForTimeout(100);
    info.imp = await p.evaluate(() => APP.S.get('ex_old').updated);
    if (info.imp !== '2026-08-01T10:00:00.000Z') errors.push('14 import overwrote updated: ' + info.imp);

    // ۱۵) «↩ برگرد» پس از پرونده: نامِ فارسی، نه شناسهٔ خام
    await p.evaluate(() => { const cs = APP.newCase({ title: 'پروندهٔ آزمونِ برگشت' }); APP.goRoot('e_case', cs.id); });
    await p.waitForTimeout(100); await p.evaluate(() => APP.go('e_home')); await p.waitForTimeout(100);
    info.back = await p.locator('main .backbtn').innerText();
    if (/e_case|[a-z]_[a-z0-9]{5,}/.test(info.back) || !/پرونده/.test(info.back)) errors.push('15 back label: ' + info.back);
    const raw = await p.evaluate(() => Object.keys(APP.VIEW_FA).filter(v => /[a-z]/.test(APP.viewLabel(v, null))));
    if (raw.length) errors.push('15 raw view labels: ' + raw);
    await ctx.close(); }

  // ۵) عوض‌کردنِ موضوع: درسِ نیمه‌کاره روی موضوعِ تازه، کارِ قبلی با موضوعِ قبلی
  { const { p, ctx } = await page();
    await startCourse(p, 'موضوعِ الف');
    await p.evaluate(() => APP.go('lesson', 37, 's3')); await p.locator('main .wsform input[type=text], main .wsform textarea').first().fill('نوشته روی الف'); await until(p, () => APP.S.all('ex', e => e.tid === 37 && JSON.stringify(e.data).includes('نوشته روی الف')).length > 0); await settle(p);
    await p.evaluate(() => APP.go('course')); await p.click('main .linkish:has-text("(عوض کن)")');
    await p.fill('#crsTopic', 'موضوعِ ب'); await p.click('main .crs-start .btn'); await p.waitForTimeout(200);
    await p.evaluate(() => APP.go('lesson', 37, 's3')); await p.waitForTimeout(100);
    info.tc1 = await p.locator('main .wsform input[type=text], main .wsform textarea').first().inputValue();
    await p.locator('main .wsform input[type=text], main .wsform textarea').first().fill('نوشته روی ب'); await until(p, () => APP.S.all('ex', e => e.tid === 37 && JSON.stringify(e.data).includes('نوشته روی ب')).length > 0); await settle(p);
    info.tc2 = await p.evaluate(() => APP.S.all('ex', e => e.tid === 37 && e.course).map(e => APP.S.get(e.topic).title + '=' + (JSON.stringify(e.data).match(/نوشته روی [^"]+/) || [''])[0]).sort().join(' | '));
    if (info.tc1 !== '' || !/موضوعِ الف=نوشته روی الف/.test(info.tc2) || !/موضوعِ ب=نوشته روی ب/.test(info.tc2)) errors.push('5 topic change: ' + info.tc1 + ' / ' + info.tc2);

    // ۹) کارتِ قدمِ ۴ برای فردا؛ بستنِ درس بی‌نوشتن و بی‌کارت ممکن نیست
    await fillWS(p, 'main'); await p.click('main .crs-nav .btn:has-text("قدمِ بعد")'); await p.waitForTimeout(150);
    await p.click('main .btn.lg'); await p.waitForTimeout(150);
    info.noCard = await p.evaluate(() => [APP.state.sub, !!APP.courseState().done[37]]);
    await p.click('main .crs-mkcard'); await p.waitForTimeout(100);
    info.noRecall = await p.evaluate(() => APP.S.all('card', c => c.tid === 37).length);
    await p.fill('main .crs-body textarea', 'از حافظه'); await p.click('main .crs-mkcard'); await p.waitForTimeout(100);
    info.cardDue = await p.evaluate(() => { const c = APP.S.all('card', c => c.tid === 37)[0]; return c && c.due === APP.addDays(APP.today(), 1); });
    await p.click('main .btn.lg'); await p.waitForTimeout(200);
    info.closed = await p.evaluate(() => !!APP.courseState().done[37]);
    if (info.noCard[0] !== 's4' || info.noCard[1] || info.noRecall !== 0 || !info.cardDue || !info.closed) errors.push('9 step-4 gate/card: ' + JSON.stringify([info.noCard, info.noRecall, info.cardDue, info.closed]));

    // ۷) پنهان‌کردنِ مثال‌های ساختهٔ سامانه در درس؛ وقتی دیده می‌شوند برچسبِ «ساختهٔ سامانه» دارند
    // تکنیکِ ۲۸ مثالِ بازار دارد که پیش‌فرض پنهان است (۲۰۲۶-۱۰-۱۵)؛ برچسب را با تنظیمِ روشن می‌سنجیم
    await p.evaluate(() => { const st = APP.S.settings(); st.showMarketEx = true; APP.S.saveSettings(st); APP.go('lesson', 28, 's1'); });
    const shown = await p.locator('main details.gen summary').allInnerTexts();
    if (!shown.length || shown.some(s => /نمونهٔ واقعی/.test(s) || !/ساختهٔ سامانه/.test(s))) errors.push('7 example label: ' + shown);
    await p.evaluate(() => { const s = APP.S.settings(); s.hideGen = true; APP.S.saveSettings(s); });
    let gen = 0; for (const s of ['s1', 's3']) { await p.evaluate(x => APP.go('lesson', 28, x), s); gen += await p.locator('main details.gen').count(); }
    if (gen) errors.push('7 hideGen ignored in lesson: ' + gen);

    // ۱۱) حالتِ محلی: ذخیرهٔ کمتر از ۳۰۰ms پیش از بارگذاری گم نمی‌شود
    const n0 = await p.evaluate(() => { APP.newCard('Q-' + Date.now(), 'A', {}); return APP.S.all('card').length; });
    await p.reload(); await p.waitForSelector('.nav'); await p.waitForTimeout(200);
    const n1 = await p.evaluate(() => APP.S.all('card').length);
    if (n1 !== n0) errors.push('11 unflushed local save lost: ' + n0 + '→' + n1);
    await ctx.close(); }

  // ۶) پس از پایانِ دوره، گرم‌کردن‌های موعد در «امروز» و نقشه
  { const { p, ctx } = await page({ clock: new Date('2026-10-13T10:00:00') });
    await p.evaluate(() => { APP.S.put({ id: 'tp_x', type: 'topic', title: 'موضوع', course: true }); const c = { id: 'course', type: 'course', topic: 'tp_x', done: {}, warm: {}, ex: {}, cards: {}, step: {} }; APP.COURSE_LESSONS.forEach(l => c.done[l.tid] = '2026-10-13'); APP.S.put(c); });
    await p.waitForTimeout(500); await p.clock.setSystemTime(new Date('2026-10-20T10:00:00')); await p.reload(); await p.waitForSelector('.nav'); await p.waitForTimeout(200);
    await p.evaluate(() => APP.goRoot('home')); const hw = await p.locator('main .crs-home .crs-warmgo').count();
    await p.evaluate(() => APP.goRoot('course')); const cw = await p.locator('main .crs-now .crs-warmgo').count();
    if (cw) { await p.click('main .crs-now .crs-warmgo'); await p.waitForTimeout(100); }
    const wt = await p.locator('main .crs-body textarea').count();
    info.warm = [hw, cw, wt];
    if (!hw || !cw || !wt) errors.push('6 warm-ups after finish: ' + info.warm);
    await ctx.close(); }

  // ۱۳) مرزِ روز: تهران ساعتِ ۰۱:۰۰ — تاریخِ محلی، نه UTC
  { const { p, ctx } = await page({ tz: 'Asia/Tehran', clock: new Date('2026-10-14T01:00:00+03:30') });
    info.tz = await p.evaluate(() => {
      const e = APP.newEx(32, ''); e.status = 'done'; APP.S.put(e);
      APP.S.put({ id: 'pr_x', type: 'pr', pid: 'P2', status: 'done', data: {} });
      APP.S.put({ id: 'tp_t', type: 'topic', title: 't' }); APP.S.put({ id: 'course', type: 'course', topic: 'tp_t', done: {}, warm: {}, ex: {}, cards: {}, step: {} });
      APP.goRoot('home'); const p2 = [...document.querySelectorAll('main .dueb .dt')].some(x => /قرائت/.test(x.innerText));
      return [APP.today(), APP.courseState().done[32], p2];
    });
    if (info.tz[1] !== info.tz[0] || info.tz[2]) errors.push('13 UTC date used as local: ' + info.tz);
    await ctx.close(); }

  console.log(JSON.stringify(info, null, 1));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
})();
