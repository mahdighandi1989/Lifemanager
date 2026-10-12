// سفرِ گام‌به‌گام روی یک موضوع (a15_journey.js) — روی نسخهٔ مستقلِ ساخته‌شده (dist/learning-architecture.html)
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const spy = () => p.evaluate(() => { window.__puts = []; const o = APP.S.put; if (o.__spy) return; const f = function (r) { window.__puts.push(r.type + ':' + r.id); return o.apply(this, arguments); }; f.__spy = 1; APP.S.put = f; });
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(300); await spy();
  const putsDuring = async (fn) => { await p.evaluate(() => { window.__puts = []; }); await fn(); await p.waitForTimeout(700); return p.evaluate(() => window.__puts.slice()); };
  const bad = async (lab) => { if (await p.locator('main .card.bad').count()) errors.push('render ' + lab); };
  const fillWS = async (scope) => {
    const S = scope + ' .wsform';
    for (const el of await p.locator(S + ' textarea, ' + S + ' input[type=text]').all()) { if (await el.isVisible() && await el.isEditable()) await el.fill('پاسخِ آزمایشیِ سفر'); }
    for (const sel of await p.locator(S + ' select').all()) { if (!(await sel.isVisible())) continue; const opts = await sel.locator('option').allTextContents(); if (opts.length > 1) await sel.selectOption({ index: 1 }); }
    for (const cb of await p.locator(S + ' input[type=checkbox]').all()) { if (await cb.isVisible()) await cb.check(); }
    for (const nb of await p.locator(S + ' input[type=number]').all()) { if (await nb.isVisible()) await nb.fill('3'); }
    for (const rd of await p.locator(S + ' input[type=radio]').all()) { if (await rd.isVisible()) await rd.check(); }
    for (const add of await p.locator(S + ' button:has-text("افزودن")').all()) { if (await add.isVisible()) await add.click(); }
    for (const el of await p.locator(S + ' textarea, ' + S + ' input[type=text]').all()) { if (await el.isVisible() && await el.isEditable() && !(await el.inputValue())) await el.fill('پاسخِ آزمایشی'); }
  };

  // ۱) موضوعِ تازه از صفحهٔ «موضوع‌ها» ⇒ صفحهٔ موضوع: دکمهٔ سفر بالای صفحه، «حالتِ کامل» سرِ جایش
  await p.evaluate(() => APP.goRoot('topics')); await p.waitForTimeout(150);
  await p.fill('#ntTitle', 'آزمون: چرا حد ضرر متحرک زود فعال می‌شود'); await p.click('main .btn:has-text("ساخت و شروع")'); await p.waitForTimeout(200);
  const tid = await p.evaluate(() => APP.state.arg);
  info.topicView = await p.evaluate(() => APP.state.view);
  info.ctaBeforePipe = await p.evaluate(() => { const c = document.querySelector('main .jr-cta'), pp = document.querySelector('main .pipe'); return !!(c && pp && (c.compareDocumentPosition(pp) & Node.DOCUMENT_POSITION_FOLLOWING)); });
  info.fullMode = await p.locator('main h2:has-text("حالت کامل")').count();
  info.ctaLabel = await p.locator('main .jr-go').innerText();
  // فهرستِ موضوع‌ها: هر موضوع دکمهٔ سفر دارد
  await p.evaluate(() => APP.go('topics')); await p.waitForTimeout(100);
  info.listBtns = await p.locator('main .jr-tbtn').count(); info.listCards = await p.locator('main .tcard').count();
  await p.evaluate(() => APP.go('topic', APP.S.all('topic', t => /^آزمون: چرا/.test(t.title))[0].id)); await p.waitForTimeout(100);

  // ۲) شروعِ سفر: دیدن هیچ نمی‌نویسد
  info.puts_open = await putsDuring(() => p.click('main .jr-go'));
  info.view = await p.evaluate(() => APP.state.view + ':' + APP.state.arg);
  info.here1 = await p.evaluate(() => [...document.querySelectorAll('main .jr-st')].findIndex(li => li.classList.contains('here')));
  info.strip = await p.locator('main .jr-st').count();
  info.h1 = await p.locator('main h1').innerText();
  info.exOnView = await p.evaluate(() => APP.S.all('ex', e => e.tid === 33).length);
  info.puts_rerender = await putsDuring(() => p.evaluate(() => APP.render()));
  // ۳) دروازه: بی‌فیلدِ الزامی «گامِ بعد» جلو نمی‌رود
  await p.click('main .jr-next'); await p.waitForTimeout(150);
  info.blocked = await p.evaluate(() => [...document.querySelectorAll('main .jr-st')].findIndex(li => li.classList.contains('here'))) === 0;
  info.kindMissing = await p.locator('main .jr-kind.missing').count();
  // نوعِ موضوع: یک تغییر = یک نوشتن روی موضوع
  info.puts_kind = await putsDuring(() => p.selectOption('#jrKind', { index: 1 }));
  // کاربرگِ گام: با اولین ورودی فقط یک رکورد
  await fillWS('main .jr-now'); await p.waitForTimeout(700);
  info.exAfterInput = await p.evaluate(() => APP.S.all('ex', e => e.tid === 33).length);
  info.puts_next = await putsDuring(() => p.click('main .jr-next'));
  info.missing = await p.locator('.toast').allTextContents();
  info.afterNext = await p.evaluate(tid => { const t = APP.S.get(tid); return APP.state.sub + '|' + (t.journey || {}).step + '|' + !!((t.journey || {}).done || {}).S1; }, tid);
  info.exDone = await p.evaluate(() => (APP.S.all('ex', e => e.tid === 33)[0] || {}).status);
  // ۴) نوار: پرش به گامِ ۱ = یک نوشتن (جای تو)، بعد برگشت به گامِ ۲
  info.puts_jump = await putsDuring(() => p.locator('main .jr-st').nth(0).locator('.jr-stb').click());
  info.jumpSub = await p.evaluate(() => APP.state.sub);
  await p.locator('main .jr-st').nth(1).locator('.jr-stb').click(); await p.waitForTimeout(150);
  // گامِ ۲: یک فیلد بنویس تا پیش‌نویس ساخته شود
  const firstTA = p.locator('main .jr-now .wsform textarea, main .jr-now .wsform input[type=text]').first();
  if (await firstTA.count()) { await firstTA.fill('پیش‌نویسِ گامِ دوم'); await p.waitForTimeout(700); }
  // ۵) ادامه پس از بارگذاریِ دوباره
  await p.reload(); await p.waitForSelector('.nav'); await p.waitForTimeout(300); await spy();
  await p.evaluate(tid => APP.go('topic', tid), tid); await p.waitForTimeout(100);
  info.resumeLabel = await p.locator('main .jr-go').innerText();
  await p.click('main .jr-go'); await p.waitForTimeout(150);
  info.resumeHere = await p.evaluate(() => [...document.querySelectorAll('main .jr-st')].findIndex(li => li.classList.contains('here')));
  info.resumeDraft = await p.locator('main .jr-now .wsform textarea, main .jr-now .wsform input[type=text]').first().inputValue().catch(() => '');
  info.resumeDone = await p.locator('main .jr-st.done').count();
  // ۶) «بیان دیگر» فقط بخشِ خودِ هر گام را نشان می‌دهد
  await p.evaluate(tid => APP.go('journey', tid, 'S4'), tid); await p.waitForTimeout(100);
  info.s4 = await p.evaluate(() => ['descent', 'ascent', 'seed'].map(k => document.querySelectorAll('main .jr-now [data-k="' + k + '"]').length).join(','));
  await p.evaluate(tid => APP.go('journey', tid, 'S8'), tid); await p.waitForTimeout(100);
  info.s8 = await p.evaluate(() => ['descent', 'ascent', 'cmp'].map(k => document.querySelectorAll('main .jr-now [data-k="' + k + '"]').length).join(','));
  await p.evaluate(tid => APP.go('journey', tid, 'S7'), tid); await p.waitForTimeout(100);
  info.s7 = await p.evaluate(() => ['ascent', 'seed'].map(k => document.querySelectorAll('main .jr-now [data-k="' + k + '"]').length).join(','));
  // کشوی کناری: پرت نمی‌کند
  await p.locator('main .jr-now .tlink').first().click(); await p.waitForTimeout(80);
  info.peek = await p.locator('.crs-peek').count(); await p.click('.crs-peek .btn:has-text("بستن")'); info.viewAfterPeek = await p.evaluate(() => APP.state.view);
  // همهٔ گام‌ها بی‌خطا؛ و پایان
  for (const k of ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'end']) { await p.evaluate(x => APP.go('journey', x[0], x[1]), [tid, k]); await bad('journey ' + k); }
  info.jobs = await p.evaluate(() => APP.C.PIPELINE.map(s => { const j = APP._journeyJob(s.k); return s.k + '=' + (j.tech || j.proto); }).join(' '));
  // درسِ دوره (قدمِ ۳) سفر را معرفی می‌کند
  await p.evaluate(tid => { const c = APP.courseState() || { id: 'course', type: 'course', done: {} }; c.topic = tid; APP.S.put(c); APP.go('lesson', 37, 's3'); }, tid); await p.waitForTimeout(100);
  info.courseHint = await p.locator('main .crs-jhint').count();
  // موبایل
  await p.setViewportSize({ width: 390, height: 844 });
  for (const v of [['journey', tid, 'S1'], ['journey', tid, 'S4'], ['topic', tid], ['topics']]) { await p.evaluate(x => APP.go(...x), v); await p.waitForTimeout(120); const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (ov > 2) errors.push('mobile overflow ' + v.join('/') + ' ' + ov); }
  await p.evaluate(tid => APP.go('journey', tid, 'S3'), tid); await p.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_journey_mobile.png') });
  await p.setViewportSize({ width: 1280, height: 900 });
  await p.evaluate(tid => APP.go('journey', tid, 'S2'), tid); await p.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_journey.png'), fullPage: true });
  console.log(JSON.stringify(info, null, 1));

  if (info.topicView !== 'topic' || !info.ctaBeforePipe || info.fullMode !== 1 || !/سفرِ گام‌به‌گام/.test(info.ctaLabel)) errors.push('topic page button / full mode');
  if (info.listBtns !== info.listCards || !info.listBtns) errors.push('topics list buttons ' + info.listBtns + '/' + info.listCards);
  if (info.puts_open.length || info.puts_rerender.length) errors.push('viewing wrote: ' + JSON.stringify(info.puts_open.concat(info.puts_rerender)));
  if (!/^journey:/.test(info.view) || info.here1 !== 0 || info.strip !== 11 || !/گامِ ۱ از ۱۱/.test(info.h1)) errors.push('journey start: ' + info.view + ' ' + info.here1 + ' ' + info.h1);
  if (info.exOnView !== 0) errors.push('viewing created a draft ex');
  if (!info.blocked || info.kindMissing !== 1) errors.push('gate let empty step through');
  if (!(info.puts_kind.length === 1 && /^topic:/.test(info.puts_kind[0]))) errors.push('kind writes: ' + JSON.stringify(info.puts_kind));
  if (info.exAfterInput !== 1) errors.push('typing did not create exactly one ex: ' + info.exAfterInput);
  if (info.afterNext !== 'S2|S2|true') errors.push('next did not advance/save: ' + info.afterNext + ' ' + info.missing.join(' / '));
  if (info.exDone !== 'done') errors.push('step worksheet not marked done');
  const ex1 = info.puts_next.filter(x => /^ex:/.test(x)).length, tp1 = info.puts_next.filter(x => /^topic:/.test(x)).length;
  if (ex1 !== 1 || tp1 !== 1) errors.push('finish-step writes: ' + JSON.stringify(info.puts_next));
  if (!(info.puts_jump.length === 1 && /^topic:/.test(info.puts_jump[0])) || info.jumpSub !== 'S1') errors.push('strip jump writes: ' + JSON.stringify(info.puts_jump));
  if (info.resumeHere !== 1 || !/ادامهٔ سفر/.test(info.resumeLabel) || info.resumeDone < 1) errors.push('resume failed: ' + info.resumeHere + ' ' + info.resumeLabel);
  if (info.resumeDraft && info.resumeDraft !== 'پیش‌نویسِ گامِ دوم') errors.push('draft not reloaded: ' + info.resumeDraft);
  if (info.s4 !== '1,0,0' || info.s8 !== '0,1,1' || info.s7 !== '0,1') errors.push('P11 parts wrong: ' + info.s4 + ' / ' + info.s8 + ' / ' + info.s7);
  if (info.peek !== 1 || info.viewAfterPeek !== 'journey') errors.push('peek navigated away');
  if (info.courseHint !== 1) errors.push('course step 3 does not mention the journey');
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
