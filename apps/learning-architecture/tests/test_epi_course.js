// دورهٔ گام‌به‌گامِ کارخانهٔ معرفت‌شناسی (a13_epi_course.js) — روی نسخهٔ مستقلِ ساخته‌شده (dist/learning-architecture.html)
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
  await p.evaluate(() => { window.__puts = []; const o = APP.S.put; APP.S.put = function (r) { window.__puts.push(r.type + ':' + r.id); return o.apply(this, arguments); }; });
  const putsDuring = async (fn) => { await p.evaluate(() => { window.__puts = []; }); await fn(); await p.waitForTimeout(700); return p.evaluate(() => window.__puts.slice()); };
  const bad = async (lab) => { if (await p.locator('main .card.bad').count()) errors.push('render ' + lab); };
  const where = () => p.evaluate(() => APP.state.view + ':' + APP.state.arg + ':' + APP.state.sub);
  const cst = () => p.evaluate(() => APP.epiCourseState());
  const next = () => p.click('main .crs-nav .btn:has-text("قدمِ بعد")');
  async function fillReq() {
    const flds = p.locator('main .wsform .ws > .fld.req');
    const n = await flds.count();
    for (let i = 0; i < n; i++) {
      const f = flds.nth(i); const cls = await f.getAttribute('class'); const k = await f.getAttribute('data-k');
      if (/fld-sel/.test(cls)) await f.locator('select').selectOption({ index: 1 });
      else if (/fld-text/.test(cls)) { const el = f.locator('input'); if (!(await el.inputValue())) await el.fill('متن آزمایشی ' + k); }
      else if (/fld-area|fld-lock/.test(cls)) { const bb = f.locator('button:has-text("باز کردن")'); if (await bb.count()) { if (await bb.isEnabled()) await bb.click(); } const ta = f.locator('textarea'); if (await ta.count() && !(await ta.first().inputValue())) await ta.first().fill('متن آزمایشی ' + k); }
      else if (/fld-checks/.test(cls)) await f.locator('input[type=checkbox]').first().check();
      else if (/fld-list/.test(cls)) await f.locator('input').first().fill('مورد ' + k);
      else if (/fld-chain|fld-tree|fld-graph/.test(cls)) await f.locator('textarea').first().fill('الف -> ب');
      else if (/fld-scale/.test(cls)) await f.locator('input[type=range]').evaluate(e => { e.value = 3; e.dispatchEvent(new Event('input', { bubbles: true })); });
      else if (/fld-table/.test(cls)) {
        const row = f.locator('tbody tr').first(); const cells = row.locator('select, textarea, input'); const cc = await cells.count();
        for (let c = 0; c < cc; c++) { const el = cells.nth(c); const tag = await el.evaluate(e => e.tagName + ':' + (e.type || ''));
          if (tag.startsWith('SELECT')) { const o = await el.locator('option').count(); if (o > 1) await el.selectOption({ index: 1 }); }
          else if (tag === 'INPUT:number') await el.fill('70'); else if (tag !== 'INPUT:checkbox') await el.fill('سطر ' + k); }
      }
    }
  }

  // ۱) درِ اصلیِ کارخانه در صفحهٔ شروع ⇒ آغازِ دوره با یک ادعای واقعی
  await p.evaluate(() => APP.goRoot('start'));
  info.learnMainDoors = await p.locator('main .door.main').count();
  await p.locator('main .door.mainepi .btn').click(); await p.waitForTimeout(200);
  info.onboarding = await p.locator('main .crs-start').count();
  info.sysEpi = await p.evaluate(() => !document.querySelector('.navlist[data-sys="epi"]').hidden);
  info.putsOnboardView = await p.evaluate(() => window.__puts.filter(x => /epi_course|case/.test(x)).length);
  await p.click('main .btn:has-text("شروعِ درسِ اول")'); await p.waitForTimeout(100);
  info.emptyBlocked = (await where()).startsWith('epi_course');
  await p.fill('#ecrsClaim', 'کارشناس گفته ارزشِ ملکِ وثیقه ۱۲ میلیون درهم است و همکارم یادش هست سالِ پیش هم همین بوده.');
  await p.click('main .btn:has-text("شروعِ درسِ اول")'); await p.waitForTimeout(250);
  info.lesson1 = await where();
  info.navOn = await p.locator('.nav[data-v="epi_course"].on').count();
  info.halls = await p.locator('main .ecrs-halls .ecrs-hall').count();
  // کشوی کناری: متنِ جزوه، بی‌جابه‌جایی
  await p.locator('main details.ecrs-co summary').first().click();
  await p.locator('main details.ecrs-co .tlink.sec').first().click(); await p.waitForTimeout(100);
  info.peek = await p.locator('.ecrs-peek .epibook').count();
  await p.click('.ecrs-peek .btn:has-text("بستن")'); info.viewAfterPeek = await where();
  // قدمِ ۲ (درسِ پایه): «این ملاک مالِ کدام مفهوم است؟»
  info.puts_s1_s2 = await putsDuring(next);
  const items = p.locator('main .ditem'); info.matchItems = await items.count();
  for (let i = 0; i < info.matchItems; i++) await items.nth(i).locator('.dopt').first().click();
  info.matchFeedback = await p.locator('main .ditem .dfb .good, main .ditem .dfb .bad').count();
  // قدمِ ۳: فیلدهای الزامی جلوی رفتن را می‌گیرند
  info.puts_s2_s3 = await putsDuring(next);
  info.puts_rerender = await putsDuring(() => p.evaluate(() => APP.render()));
  await next(); await p.waitForTimeout(100);
  info.introBlocked = (await where()).endsWith(':s3');
  for (const ta of await p.locator('main .wsform textarea').all()) await ta.fill('ارزش ملک؛ وثیقه؛ ۱۲ میلیون درهم');
  await p.waitForTimeout(600); await next(); await p.waitForTimeout(150);
  info.introS4 = await where();
  await p.fill('main .crs-body textarea', 'تصور یعنی فهمِ بی‌حکم؛ تصدیق یعنی حکم');
  await p.click('main .btn:has-text("مقایسه کن")');
  await p.click('main .btn.lg'); await p.waitForTimeout(250);
  info.afterIntro = await where();
  info.introRecall = ((await cst()).recall.intro || {}).txt || '';

  // ۲) درسِ «پذیرش»: شبیه‌سازِ مسیر، تمرین با پاسخ‌نامه، کاربرگِ واقعیِ کارخانه
  info.curStation = await p.locator('main .ecrs-st.cur').count();
  await next(); await p.waitForTimeout(150);
  info.simIntake = await p.locator('main .crs-sim').count();
  const before = await p.locator('main .crs-sim .ecrs-route li').count();
  await p.selectOption('#ecrs_rs', { index: 1 }); await p.waitForTimeout(80);
  const after = await p.locator('main .crs-sim .ecrs-route li').count();
  info.routeSimGrows = after > before;
  info.casesAfterSim = await p.evaluate(() => APP.S.all('case').length);
  const di = p.locator('main .ecrs-drill .ditem'); info.drillItems = await di.count();
  for (let i = 0; i < info.drillItems; i++) await di.nth(i).locator('.dopt').first().click();
  info.drillFeedback = await p.locator('main .ecrs-drill .dfb .good, main .ecrs-drill .dfb .bad').count();
  info.edrill = await p.evaluate(() => APP.S.all('edrill', d => d.course && d.st === 'st_intake').length);
  info.puts_s2_s3b = await putsDuring(next);
  info.casesOnView = await p.evaluate(() => APP.S.all('case').length);
  await next(); await p.waitForTimeout(100);
  info.wsBlocked = (await where()).endsWith(':s3');
  await fillReq(); await p.waitForTimeout(800);
  info.casesAfterInput = await p.evaluate(() => APP.S.all('case').length);
  info.caseLinked = await p.evaluate(() => { const c = APP.epiCourseState(); const cs = APP.S.get(c.caseId); return !!cs && cs.src && cs.src.t === 'epi_course' && cs.st.st_intake.data.input.indexOf('۱۲ میلیون') >= 0; });
  await next(); await p.waitForTimeout(150);
  info.atCheck = await where();
  if (!info.atCheck.endsWith(':s4')) info.missing = await p.locator('.toast').allTextContents();
  for (const seg of await p.locator('main .rubric .seg').all()) await seg.locator('.sg').nth(2).click();
  await p.fill('main .crs-body textarea', 'پذیرش ورودی را دقیق ثبت می‌کند: چه هست، از کجا آمده، بهای خطا');
  await p.click('main .btn.lg'); await p.waitForTimeout(250);
  info.afterFinish = await where();
  info.caseStation = await p.evaluate(() => { const c = APP.epiCourseState(); const cs = APP.S.get(c.caseId); return { done: !!cs.st.st_intake.done, rubric: (cs.st.st_intake.rubric || []).filter(x => x === 2).length }; });
  info.doneN = Object.keys((await cst()).done).length;

  // ۳) ایستگاهِ شرطی: «شرط برقرار نیست» درس را بی‌کاربرگ می‌بندد؛ «برقرار است» آن را به مسیرِ پرونده اضافه می‌کند
  await p.evaluate(() => APP.go('epi_lesson', 'st_core', 's3')); await p.waitForTimeout(100);
  info.condCard = await p.locator('main h3:has-text("شرطی است")').count();
  await next(); await p.waitForTimeout(80); info.condBlocked = (await where()).endsWith(':s3');
  await p.click('main .btn:has-text("شرط در پرونده‌ام برقرار نیست")'); await p.waitForTimeout(80);
  await next(); await p.waitForTimeout(100); info.condNext = await where();
  await p.evaluate(() => APP.go('epi_lesson', 'st_partial', 's3')); await p.waitForTimeout(100);
  await p.click('main .btn:has-text("شرط برقرار است")'); await p.waitForTimeout(150);
  info.condAdded = await p.evaluate(() => { const c = APP.epiCourseState(); const cs = APP.S.get(c.caseId); return cs.inc.st_partial === true && APP.routeOf(cs).filter(x => x.s.id === 'st_partial')[0].inRoute; });
  info.condWs = await p.locator('main .wsform').count();

  // ۴) گرم‌کردن (فردا): «ادامه» از گرم‌کردنِ موعد نمی‌گذرد؛ ردکردنِ صریح؛ پاسخ با تاریخ ذخیره می‌شود
  await p.evaluate(() => { const c = APP.epiCourseState(); c.done.st_intake = APP.addDays(APP.today(), -2); c.step.st_worlds = 's2'; APP.S.put(c); APP.go('epi_lesson', 'st_worlds', 's2'); });
  info.gateSub = await p.evaluate(() => APP.state.sub);
  await p.click('main .crs-skipwarm'); await p.waitForTimeout(150);
  info.afterSkip = await p.evaluate(() => APP.state.sub + ':' + (APP.epiCourseState().warmSkip === APP.today()));
  await p.evaluate(() => { const c = APP.epiCourseState(); delete c.warmSkip; APP.S.put(c); APP.go('epi_course'); });
  await p.click('main .crs-now .btn.lg'); await p.waitForTimeout(150);
  info.continueSub = await p.evaluate(() => APP.state.sub);
  info.warmCards = await p.locator('main .crs-body textarea').count();
  await p.click('main .crs-body .btn:has-text("ادامه به")'); await p.waitForTimeout(100);
  info.blockedUngraded = await p.evaluate(() => APP.state.sub) === 's0';
  await p.locator('main .crs-body textarea').first().fill('پاسخِ گرم‌کردنِ آزمایشی');
  await p.locator('main .btn:has-text("پاسخ را نشان بده")').first().click();
  await p.locator('main .btn:has-text("یادم بود")').first().click(); await p.waitForTimeout(100);
  info.warm = await p.evaluate(() => { const w = APP.epiCourseState().warm.st_intake || {}; const l = (w.log || []).slice(-1)[0] || {}; return { due: w.due, txt: l.txt + '@' + l.d, q: !!l.q }; });
  await p.click('main .crs-body .btn:has-text("ادامه به")'); await p.waitForTimeout(150);
  info.afterWarm = await p.evaluate(() => APP.state.sub);

  // ۵) همهٔ درس‌ها: قدم‌های ۱ تا ۴ بی‌خطا؛ دیدن پرونده نمی‌سازد
  const ids = await p.evaluate(() => APP.EPI_COURSE_LESSONS.map(l => l.id)); info.lessons = ids.length;
  const nCase0 = await p.evaluate(() => APP.S.all('case').length);
  await p.evaluate(() => { const c = APP.epiCourseState(); c.warmDay = APP.today(); APP.S.put(c); });
  for (const id of ids) for (const s of ['s1', 's2', 's3', 's4']) { await p.evaluate(x => APP.go('epi_lesson', x[0], x[1]), [id, s]); await bad('lesson ' + id + ' ' + s); if (await p.evaluate(() => APP.state.view) !== 'epi_lesson') errors.push('lost lesson ' + id); }
  info.casesAfterBrowse = (await p.evaluate(() => APP.S.all('case').length)) - nCase0;
  info.sims = await p.evaluate(() => APP.EPI_COURSE_LESSONS.length);
  let simCount = 0, drillCount = 0;
  for (const id of ids) { await p.evaluate(x => APP.go('epi_lesson', x, 's2'), id); simCount += await p.locator('main .crs-sim').count(); drillCount += (await p.locator('main .ecrs-drill').count()) ? 1 : 0; }
  info.simCount = simCount; info.drillLessons = drillCount;

  // ۶) شبیه‌سازها: همان موتورِ قطعی
  await p.evaluate(() => APP.go('epi_lesson', 'st_grade', 's2'));
  await p.selectOption('main .crs-sim select[id^="ecrs_fe_way"]', 'نقل');
  await p.selectOption('main .crs-sim select[id^="ecrs_fe_narrator"]', 'غیرموثق'); await p.waitForTimeout(80);
  info.ceilShown = await p.locator('main .ecrs-ceilv').innerText();
  info.ceilEngine = await p.evaluate(() => EPIX.runClaim({ f: { way: 'نقل', narrator: 'غیرموثق' } }, EPIX.DEFAULT_CFG()).ceil);
  info.bind = await p.locator('main .ecrs-cap.bind').count();
  await p.evaluate(() => APP.go('epi_lesson', 'st_final', 's2'));
  await p.selectOption('main .crs-sim select[id^="ecrs_fe_way"]', 'نقل');
  await p.selectOption('main .crs-sim select[id^="ecrs_fe_narrator"]', 'غیرموثق');
  await p.fill('main .crs-sim input[id^="ecrs_fe_conf"]', '90'); await p.waitForTimeout(80);
  info.over = await p.locator('main .crs-sim .bad:has-text("بیش‌اطمینانی")').count();
  info.finalFallback = await p.locator('main .crs-spot textarea').count();
  await p.evaluate(() => APP.go('epi_lesson', 'st_route', 's2'));
  await p.selectOption('#ecrs_way_1', 'حس'); await p.selectOption('#ecrs_way_2', 'نقل'); await p.waitForTimeout(80);
  info.waySim = await p.locator('main .crs-sim .crs-spot.ok').count();
  info.simLabel = await p.locator('main .crs-sim .eyebrow:has-text("تصویرِ آموزشی")').count();

  // ۷) میزِ کار و نقشه
  await p.evaluate(() => APP.goRoot('e_home')); info.homeCard = await p.locator('main .ecrs-home').count();
  info.homeBtn = await p.locator('main .ecrs-home .btn').innerText();
  await p.evaluate(() => APP.go('epi_course')); info.mapDotsOn = await p.locator('main .crs-dot.on').count(); info.mapNow = await p.locator('main .crs-dot.now').count();
  info.caseLinkOnMap = await p.locator('main .crs-now .linkish').count();

  // ۸) موبایل
  await p.setViewportSize({ width: 390, height: 844 });
  for (const v of [['epi_course'], ['epi_lesson', 'intro', 's1'], ['epi_lesson', 'st_intake', 's2'], ['epi_lesson', 'st_grade', 's2'], ['epi_lesson', 'st_route', 's2'], ['epi_lesson', 'st_tasdiq', 's3'], ['epi_lesson', 'st_core', 's3'], ['epi_lesson', 'st_final', 's2'], ['e_home'], ['start']]) {
    await p.evaluate(x => APP.go(...x), v); await p.waitForTimeout(120);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (ov > 2) errors.push('mobile overflow ' + v.join('/') + ' ' + ov);
  }
  await p.evaluate(() => APP.go('epi_lesson', 'st_grade', 's2')); await p.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_epi_course_mobile.png'), fullPage: true });
  await p.setViewportSize({ width: 1280, height: 900 });
  await p.evaluate(() => APP.go('epi_course')); await p.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_epi_course_map.png'), fullPage: true });
  await p.evaluate(() => APP.go('epi_lesson', 'st_tasdiq', 's1')); await p.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_epi_course_s1.png'), fullPage: true });

  console.log(JSON.stringify(info, null, 1));
  const onlyCourse = a => a.length === 1 && a[0] === 'epi_course:epi_course';
  const chk = (ok, msg) => { if (!ok) errors.push(msg); };
  chk(info.learnMainDoors === 1, 'learning main door count changed');
  chk(info.onboarding === 1 && info.sysEpi, 'onboarding / factory sidebar');
  chk(info.putsOnboardView === 0, 'viewing onboarding wrote');
  chk(info.emptyBlocked, 'empty claim accepted');
  chk(info.lesson1 === 'epi_lesson:intro:s1', 'first lesson ' + info.lesson1);
  chk(info.navOn === 1, 'nav highlight');
  chk(info.halls >= 6, 'hall map');
  chk(info.peek === 1 && info.viewAfterPeek === 'epi_lesson:intro:s1', 'peek drawer');
  chk(onlyCourse(info.puts_s1_s2) && onlyCourse(info.puts_s2_s3), 'step writes ' + JSON.stringify([info.puts_s1_s2, info.puts_s2_s3]));
  chk(info.puts_rerender.length === 0, 're-render wrote ' + JSON.stringify(info.puts_rerender));
  chk(info.matchItems >= 4 && info.matchFeedback === info.matchItems, 'concept match feedback');
  chk(info.introBlocked && /:s4$/.test(info.introS4), 'intro gate');
  chk(info.afterIntro === 'epi_lesson:st_intake:s1' && /تصدیق/.test(info.introRecall), 'intro finish');
  chk(info.curStation === 1, 'station pin');
  chk(info.simIntake === 1 && info.routeSimGrows, 'route simulator');
  chk(info.casesAfterSim === 0, 'simulator created a case');
  chk(info.drillItems > 0 && info.drillFeedback === info.drillItems && info.edrill === 1, 'drill feedback/record');
  chk(onlyCourse(info.puts_s2_s3b), 'step s2->s3 (station) writes ' + JSON.stringify(info.puts_s2_s3b));
  chk(info.casesOnView === 0, 'viewing step 3 created a case');
  chk(info.wsBlocked, 'required fields did not gate');
  chk(info.casesAfterInput === 1 && info.caseLinked, 'first input did not create exactly one linked case');
  chk(/:s4$/.test(info.atCheck), 'filled station did not advance: ' + JSON.stringify(info.missing || ''));
  chk(info.afterFinish === 'epi_lesson:st_worlds:s1' && info.caseStation.done && info.caseStation.rubric > 0 && info.doneN === 2, 'finish lesson / case station');
  chk(info.condCard === 1 && info.condBlocked && /st_core:s4$/.test(info.condNext), 'conditional station N/A path');
  chk(info.condAdded && info.condWs === 1, 'conditional station add path');
  chk(info.gateSub === 's0' && info.continueSub === 's0', 'warm-up bypassed');
  chk(info.afterSkip === 's2:true', 'explicit skip');
  chk(info.blockedUngraded, 'ungraded warm-up let through');
  chk(info.warm.due > (new Date().toISOString().slice(0, 10)) && /^پاسخِ گرم‌کردنِ آزمایشی@\d{4}-/.test(info.warm.txt) && info.warm.q, 'warm answer not saved ' + JSON.stringify(info.warm));
  chk(info.afterWarm === 's2', 'after warm-up ' + info.afterWarm);
  chk(info.casesAfterBrowse === 0, 'browsing lessons created cases');
  chk(info.drillLessons >= 30 && info.simCount >= 3, 'drills/sims coverage ' + info.drillLessons + '/' + info.simCount);
  chk(info.ceilShown.indexOf(String(info.ceilEngine).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])) === 0 && info.bind === 1, 'ceiling sim mismatch ' + info.ceilShown + ' vs ' + info.ceilEngine);
  chk(info.over === 1, 'overconfidence not shown');
  chk(info.finalFallback >= 1, 'final station has no example fallback');
  chk(info.waySim >= 2 && info.simLabel === 1, 'way simulator');
  chk(info.homeCard === 1 && /ادامه/.test(info.homeBtn), 'factory home card');
  chk(info.mapDotsOn === 2 && info.mapNow === 1 && info.caseLinkOnMap >= 1, 'course map ' + info.mapDotsOn);
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
