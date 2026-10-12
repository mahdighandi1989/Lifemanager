// دورهٔ گام‌به‌گام + راه‌یابی (برگرد) — روی نسخهٔ مستقلِ ساخته‌شده (dist/learning-architecture.html)
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
  // شمارشِ نوشتن‌ها (S.put) برای آزمونِ «دیدن ≠ ذخیره» و «یک تغییر = یک نوشتن»
  await p.evaluate(() => { window.__puts = []; const o = APP.S.put; APP.S.put = function (r) { window.__puts.push(r.type + ':' + r.id); return o.apply(this, arguments); }; });
  const putsDuring = async (fn) => { await p.evaluate(() => { window.__puts = []; }); await fn(); await p.waitForTimeout(700); return p.evaluate(() => window.__puts.slice()); };
  const bad = async (lab) => { if (await p.locator('main .card.bad').count()) errors.push('render ' + lab); };

  // ۱) راه‌یابی: از «دغدغه‌ها» روی یک تکنیک ⇒ «برگرد» همان‌جا
  await p.evaluate(() => APP.goRoot('concerns')); await p.waitForTimeout(200);
  await p.evaluate(() => window.scrollTo(0, 0));
  const chip = p.locator('main .tlink').nth(6); await chip.scrollIntoViewIfNeeded(); const y0 = await p.evaluate(() => window.scrollY);
  await chip.click(); await p.waitForTimeout(250);
  info.afterChip = await p.evaluate(() => APP.state.view);
  info.crumb = (await p.locator('main .crumbs .where').innerText()).replace(/\s+/g, ' ');
  info.backLabel = await p.locator('main .backbtn').innerText();
  info.fromCtx = await p.locator('main .fromctx').count() ? await p.locator('main .fromctx').innerText() : '';
  info.fab = await p.locator('main .backfab').count();
  await p.locator('main .backbtn').click(); await p.waitForTimeout(250);
  info.backView = await p.evaluate(() => APP.state.view); info.scrollRestored = Math.abs((await p.evaluate(() => window.scrollY)) - y0) < 40;
  info.trailAfterBack = await p.evaluate(() => APP.trail.length);
  // sidebar resets trail
  await p.evaluate(() => APP.go('tech', 5)); await p.locator('.nav[data-v="lib"]').click(); await p.waitForTimeout(150);
  info.trailAfterSidebar = await p.evaluate(() => APP.trail.length);

  // ۲) دوره: درِ اصلیِ صفحهٔ شروع ⇒ انتخابِ موضوع ⇒ درسِ اول
  await p.evaluate(() => APP.goRoot('start')); await p.locator('main .door.main .btn').click(); await p.waitForTimeout(200);
  info.onboarding = await p.locator('main .crs-start').count();
  await p.fill('#crsTopic', 'آزمون: تحلیلِ وثیقه‌های ملکی'); await p.click('main .btn:has-text("شروعِ درسِ اول")'); await p.waitForTimeout(250);
  info.lesson1 = await p.evaluate(() => APP.state.view + ':' + APP.state.arg + ':' + APP.state.sub);
  info.visual37 = await p.locator('main .crs-phases .crs-ph.on').count();
  // قدمِ ۲: شبیه‌ساز + ترتیب + درست/اشتباه
  info.puts_s1_s2 = await putsDuring(() => p.click('main .crs-nav .btn:has-text("قدمِ بعد")'));
  info.sim37 = await p.locator('main .crs-cup').count();
  await p.locator('main .crs-tog').first().click();
  info.order37 = await p.locator('main .crs-order').count(); // ۳۷ از بازیِ ترتیب کنار رفته
  for (let i = 0; i < 4; i++) { const btn = p.locator('main .crs-spot .btn:has-text("کارِ درست")').first(); if (await btn.count()) await btn.click(); }
  // قدمِ ۳: کاربرگ روی موضوع — دیدنِ قدم نباید کاربرگِ پیش‌نویس بسازد؛ یک تغییرِ قدم = یک نوشتن
  info.puts_s2_s3 = await putsDuring(() => p.click('main .crs-nav .btn:has-text("قدمِ بعد")'));
  info.exOnView = await p.evaluate(() => APP.S.all('ex', e => e.tid === 37).length);
  info.puts_rerender = await putsDuring(() => p.evaluate(() => APP.render()));
  info.wsFields = await p.locator('main .wsform input[type=text], main .wsform textarea').count();
  await p.click('main .crs-nav .btn:has-text("قدمِ بعد")'); await p.waitForTimeout(150);
  info.blockedEmpty = await p.evaluate(() => APP.state.sub) === 's3';
  for (const el of await p.locator('main .wsform textarea, main .wsform input[type=text]').all()) { if (await el.isVisible() && await el.isEditable()) await el.fill('پاسخِ آزمایشی برای همین موضوع'); }
  for (const sel of await p.locator('main .wsform select').all()) { const opts = await sel.locator('option').allTextContents(); if (opts.length > 1) await sel.selectOption({ index: 1 }); }
  for (const cb of await p.locator('main .wsform input[type=checkbox]').all()) { if (await cb.isVisible()) await cb.check(); }
  for (const nb of await p.locator('main .wsform input[type=number]').all()) { if (await nb.isVisible()) await nb.fill('3'); }
  for (const rd of await p.locator('main .wsform input[type=radio]').all()) { if (await rd.isVisible()) await rd.check(); }
  for (const add of await p.locator('main .wsform button:has-text("افزودن")').all()) { if (await add.isVisible()) { await add.click(); } }
  for (const el of await p.locator('main .wsform textarea, main .wsform input[type=text]').all()) { if (await el.isVisible() && await el.isEditable() && !(await el.inputValue())) await el.fill('پاسخِ آزمایشی'); }
  await p.waitForTimeout(700); info.exAfterInput = await p.evaluate(() => APP.S.all('ex', e => e.tid === 37).length);
  await p.click('main .crs-nav .btn:has-text("قدمِ بعد")'); await p.waitForTimeout(200);
  info.atCheck = await p.evaluate(() => APP.state.sub);
  if (info.atCheck !== 's4') info.missing = await p.locator('.toast').allTextContents();
  // قدمِ ۴
  for (const seg of await p.locator('main .rubric .seg').all()) await seg.locator('.sg').nth(2).click();
  await p.fill('main textarea', 'چیدنِ محیط تا حافظهٔ کاری برای فهم آزاد بماند');
  await p.click('main .btn:has-text("مقایسه کن و کارت بساز")');
  info.recallSaved = await p.evaluate(() => ((APP.courseState().recall || {})[37] || {}).txt || '');
  info.cardQ = await p.evaluate(() => (APP.S.all('card', c => c.tid === 37)[0] || {}).q || '');
  await p.click('main .btn.lg'); await p.waitForTimeout(300);
  info.afterFinish = await p.evaluate(() => APP.state.view + ':' + APP.state.arg + ':' + APP.state.sub);
  info.done = await p.evaluate(() => Object.keys(APP.courseState().done).length);
  info.cards = await p.evaluate(() => APP.S.all('card', c => c.tid === 37).length);
  // نقشه
  await p.click('main .btn:has-text("نقشهٔ دوره")'); await p.waitForTimeout(200);
  info.mapDotsOn = await p.locator('main .crs-dot.on').count(); info.mapNow = await p.locator('main .crs-dot.now').count();
  // گرم‌کردن: فردا موعد است ⇒ تاریخ را جلو ببر. «ادامه» نباید گرم‌کردنِ موعد را دور بزند.
  await p.evaluate(() => { const c = APP.courseState(); c.done[37] = APP.addDays(APP.today(), -2); c.step[32] = 's3'; APP.S.put(c); APP.go('lesson', 32, 's2'); });
  info.gateSub = await p.evaluate(() => APP.state.sub); // باید s0 باشد
  await p.click('main .crs-skipwarm'); await p.waitForTimeout(150);
  info.afterSkip = await p.evaluate(() => APP.state.sub + ':' + (APP.courseState().warmSkip === APP.today()));
  await p.evaluate(() => { const c = APP.courseState(); delete c.warmSkip; APP.S.put(c); APP.go('course'); });
  await p.click('main .crs-now .btn.lg'); await p.waitForTimeout(150);
  info.continueSub = await p.evaluate(() => APP.state.sub); // باید s0 باشد
  info.warmCards = await p.locator('main .crs-body textarea').count();
  await p.click('main .crs-body .btn:has-text("ادامه به")'); await p.waitForTimeout(100);
  info.blockedUngraded = await p.evaluate(() => APP.state.sub) === 's0';
  await p.fill('main .crs-body textarea', 'پاسخِ گرم‌کردنِ آزمایشی');
  await p.click('main .btn:has-text("پاسخ را نشان بده")'); await p.click('main .btn:has-text("یادم بود")'); await p.waitForTimeout(100);
  info.warmNext = await p.evaluate(() => (APP.courseState().warm[37] || {}).due);
  info.warmLog = await p.evaluate(() => { const l = (APP.courseState().warm[37] || {}).log || []; return l.length ? l[l.length - 1].txt + '@' + l[l.length - 1].d : ''; });
  await p.click('main .crs-body .btn:has-text("ادامه به")'); await p.waitForTimeout(150);
  info.afterWarm = await p.evaluate(() => APP.state.sub); // همان قدمی که می‌خواست (پس از «رد کن» روی s2 مانده بود)
  // تکنیکی که بیرون از دوره تمام شده ⇒ در دوره پذیرفته می‌شود
  await p.evaluate(() => { const e = APP.newEx(32, ''); e.status = 'done'; APP.S.put(e); APP.go('course'); });
  info.adopted = await p.evaluate(() => !!APP.courseState().elsewhere[32] && !!APP.courseState().done[32]);
  info.nextAfterAdopt = await p.evaluate(() => (APP.courseNext() || {}).tid);
  await p.evaluate(() => APP.go('lesson', 32, 's1')); info.elsewhereNote = await p.locator('main .crs-elsewhere').count();
  // بازیِ ترتیب: ۱۵ با جفتِ جابه‌جاپذیرِ (۲،۳) — ترتیبِ ۰،۱،۳،۲،۴ هم پذیرفته است
  await p.evaluate(() => APP.go('lesson', 15, 's2'));
  const st15 = await p.evaluate(() => APP.TM[15].steps.slice(0, 5));
  for (const i of [0, 1, 3, 2, 4]) await p.locator('main .crs-ocard', { hasText: st15[i].slice(0, 40) }).first().click();
  info.orderSwapOk = await p.locator('main .small.good:has-text("بی‌خطا")').count();
  info.orderSkipped = 0;
  for (const id of [5, 13, 36, 37, 10, 12, 21, 22, 25, 45]) { await p.evaluate(x => APP.go('lesson', x, 's2'), id); info.orderSkipped += await p.locator('main .crs-order').count(); }
  info.spotPool = await p.evaluate(() => [APP._courseSpotPool(44).m.some(x => /^عکس/.test(x)), APP._courseSpotPool(14).s.includes(APP.TM[14].steps[2]), APP._courseSpotPool(5).m.includes(APP.TM[5].mistakes[3])].some(Boolean));
  // همهٔ درس‌ها و قدم‌های ۱ و ۲ بی‌خطا
  const ids = await p.evaluate(() => APP.COURSE_LESSONS.map(l => l.tid));
  for (const id of ids) for (const s of ['s1', 's2', 's4']) { await p.evaluate(x => APP.go('lesson', x[0], x[1]), [id, s]); await bad('lesson ' + id + ' ' + s); }
  for (const id of [42, 40, 32, 41, 12]) { await p.evaluate(x => APP.go('lesson', x, 's2'), id); info['sim' + id] = await p.locator('main .crs-sim').count(); }
  // شبیه‌سازها: کمی تعامل
  await p.evaluate(() => APP.go('lesson', 42, 's2')); await p.click('main .btn:has-text("مرورِ فشرده")'); const cram = await p.locator('main .crs-sim p.small').first().innerText();
  await p.click('main .btn:has-text("فاصله‌دار (روز")'); const spaced = await p.locator('main .crs-sim p.small').first().innerText();
  info.curve = [cram.match(/حدودِ (\S+)/)?.[1], spaced.match(/حدودِ (\S+)/)?.[1]];
  await p.evaluate(() => APP.go('lesson', 12, 's2'));
  for (let i = 0; i < 12 && !(await p.locator('main :text("به ریشه رسیدی")').count()); i++) { await p.locator('main .crs-whyopt:not([disabled])').first().click(); await p.waitForTimeout(40); }
  info.whyRoot = await p.locator('main :text("به ریشه رسیدی")').count();
  await p.evaluate(() => APP.go('lesson', 32, 's2'));
  for (const sp of await p.locator('main .crs-sim .crs-spot').all()) await sp.locator('.btn:has-text("نادرست")').click();
  await p.click('main .btn:has-text("ببینم چطور بودم")'); info.calib = await p.locator('main .crs-calib').count();
  // peek: ارجاع در دوره پرت نمی‌کند
  await p.evaluate(() => APP.peekTech(12)); info.peek = await p.locator('.crs-peek').count(); await p.click('.crs-peek .btn:has-text("بستن")'); info.viewAfterPeek = await p.evaluate(() => APP.state.view);
  // موبایل
  await p.setViewportSize({ width: 390, height: 844 });
  for (const v of [['course'], ['lesson', 42, 's2'], ['lesson', 37, 's2'], ['lesson', 37, 's1'], ['start']]) { await p.evaluate(x => APP.go(...x), v); await p.waitForTimeout(120); const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (ov > 2) errors.push('mobile overflow ' + v.join('/') + ' ' + ov); }
  await p.evaluate(() => APP.go('lesson', 37, 's2')); await p.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_course_mobile.png') });
  await p.setViewportSize({ width: 1280, height: 900 });
  await p.evaluate(() => APP.go('course')); await p.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_course_map.png'), fullPage: true });
  await p.evaluate(() => APP.go('lesson', 42, 's2')); await p.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_course_sim.png'), fullPage: true });
  console.log(JSON.stringify(info, null, 1));
  const must = info.afterChip === 'tech' && info.backView === 'concerns' && info.trailAfterBack === 0 && info.trailAfterSidebar === 0 && info.onboarding === 1 &&
    /^lesson:37:s1$/.test(info.lesson1) && info.sim37 === 1 && info.order37 === 0 && info.blockedEmpty && info.atCheck === 's4' && info.done === 1 && info.cards === 1 &&
    info.mapDotsOn === 1 && info.mapNow === 1 && info.warmCards >= 1 && info.warmNext && info.whyRoot === 1 && info.calib === 1 && info.peek === 1 && info.viewAfterPeek === 'lesson';
  if (!must) errors.push('flow check failed');
  // ۱ و ۲: دیدن ≠ ذخیره؛ یک تغییرِ قدم = یک نوشتن
  const onlyCourse = a => a.length === 1 && a[0] === 'course:course';
  if (!onlyCourse(info.puts_s1_s2)) errors.push('step s1->s2 writes: ' + JSON.stringify(info.puts_s1_s2));
  if (!onlyCourse(info.puts_s2_s3)) errors.push('step s2->s3 writes: ' + JSON.stringify(info.puts_s2_s3));
  if (info.puts_rerender.length) errors.push('re-render wrote: ' + JSON.stringify(info.puts_rerender));
  if (info.exOnView !== 0) errors.push('viewing step 3 created a draft ex');
  if (info.exAfterInput !== 1) errors.push('typing did not create exactly one ex: ' + info.exAfterInput);
  // ۵: گرم‌کردن پیش از ادامه + ردکردنِ صریح
  if (info.gateSub !== 's0' || info.continueSub !== 's0') errors.push('continue skipped due warm-up: ' + info.gateSub + '/' + info.continueSub);
  if (info.afterSkip !== 's2:true') errors.push('explicit skip failed: ' + info.afterSkip);
  if (!info.blockedUngraded) errors.push('ungraded warm-up let through');
  if (info.afterWarm !== 's2') errors.push('after warm-up did not return to wanted step: ' + info.afterWarm);
  // ۶: پاسخ‌های بازیابی ذخیره می‌شوند
  if (!/^پاسخِ گرم‌کردنِ آزمایشی@\d{4}-/.test(info.warmLog)) errors.push('warm answer not saved: ' + info.warmLog);
  if (!/حافظهٔ کاری/.test(info.recallSaved)) errors.push('s4 recall not saved');
  if (/چیست/.test(info.cardQ)) errors.push('review card is definitional: ' + info.cardQ);
  // ۷: انجام‌شده بیرون از دوره
  if (!info.adopted || info.nextAfterAdopt === 32 || info.elsewhereNote !== 1) errors.push('outside completion not adopted');
  // ۱۳ و ۱۴: بازیِ ترتیب و تشخیص
  if (info.orderSwapOk !== 1) errors.push('swappable pair not accepted');
  if (info.orderSkipped !== 0) errors.push('order game shown for excluded technique');
  if (info.spotPool) errors.push('ambiguous spot item still in pool');
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
