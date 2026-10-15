// «📐 سنجشِ استاندارد» / «🧠 کارنامهٔ ذهن» — اصلاح‌های بازبینیِ بدبینانهٔ ۲۰۲۶-۱۰-۱۵ (هر بند با بازتولیدِ خودش):
// H2 رقم‌های فارسی در پاسخِ آزاد · H3 اطمینان به پاسخ ≠ احتمالِ رویداد · M1 ساعتِ معما ماندگار · M2 روزی یکی · M3 روزِ محلی ·
// M4 ماندگاری = نخستین پاسخِ پس از موعد · M5 بی شمارشِ دوباره · M6 بی برشِ قراردادی · M7 اسلایدرِ دست‌نخورده ≠ اطمینان ·
// M8 گوشیِ ۳۹۰px بی لغزشِ افقی · M9 درصدِ هم‌سن‌ها در گویهٔ توصیفی · LOW: شمارِ لنگرها، تاریخِ فارسی، «دیده‌ام»/پایانِ زمان، قاعدهٔ دستیار.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const chk = (c, m) => { if (!c) errors.push(m); };
  async function open(opts = {}) {
    const ctx = await b.newContext({ viewport: opts.viewport || { width: 1280, height: 900 }, timezoneId: 'Asia/Tehran', locale: 'fa-IR' });
    const p = await ctx.newPage();
    p.on('pageerror', e => errors.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
    await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/fonts.gstatic.com/**', r => r.abort());
    if (opts.time) await p.clock.install({ time: new Date(opts.time) });
    await p.goto(FILE); await p.waitForSelector('.nav');
    await p.evaluate(() => { APP.S.loaded = true; APP.ASSIST.DO.birth({ date: '1989-03-08' }); });
    return { ctx, p };
  }
  const submit = () => [...document.querySelectorAll('#main button')].find(x => /ثبتِ پاسخ/.test(x.textContent)).click();

  // ---------- H2: رقم‌های فارسی/عربی، جداکنندهٔ هزارگان، عدد با حروف ----------
  {
    const { ctx, p } = await open({ time: '2026-10-15T10:00:00+03:30' });
    info.h2 = await p.evaluate(async (submitSrc) => {
      const P = APP.PSY, out = {}, it = id => P.item(id);
      const yes = [['crt_bat', '۵'], ['crt_bat', '۵ هزار تومان'], ['crt_bat', '۵٬۰۰۰ تومان'], ['crt_bat', '5,000'], ['crt_bat', 'پنج'], ['crt_bat', 'پنج هزار تومان'], ['crt_bat', '٥'],
        ['crt_lily', '۴۷'], ['crt_lily', '۴۷ روز'], ['crt_widgets', '۵ دقیقه'], ['num_1in1000', '۰٫۱٪'], ['num_1in1000', '0.1'], ['num_10pct', '۱۰۰ نفر'], ['num_die', '۵۰۰'],
        ['crt2_dirt', 'هیچ‌خاکی'], ['crt2_sheep', 'هشت'], ['wason_abstract', 'A و ۷'], ['crt2_race', 'دوم']];
      const no = [['crt_bat', '۱۰'], ['crt_bat', '۱۰ هزار تومان'], ['crt_lily', '۲۴'], ['crt_widgets', '۱۰۰'], ['crt2_sheep', 'نه'], ['num_die', '۵,۰۰']];
      out.yesFail = yes.filter(([id, v]) => !P.check(it(id), v)).map(x => x.join(':'));
      out.noPass = no.filter(([id, v]) => P.check(it(id), v)).map(x => x.join(':'));
      // هر گویهٔ آزاد: کلیدش با رقمِ فارسی پذیرفته شود
      out.freeFa = P.norms().items.filter(i => !(i.options && i.options.length)).filter(i => !P.check(i, APP.fa(String(i.answer)))).map(i => i.id);
      out.nFree = P.norms().items.filter(i => !(i.options && i.options.length)).length;
      // بازتولید: «۵ هزار تومان» در خودِ نما
      APP.go('psy_item', 'crt_bat'); await new Promise(r => setTimeout(r, 200));
      const inp = document.querySelector('#main .psy-q input[type=text]'); inp.value = '۵ هزار تومان'; inp.dispatchEvent(new Event('input', { bubbles: true }));
      const c = document.querySelector('#main input[aria-label="درصدِ اطمینان"]'); c.value = '۸۰'; c.dispatchEvent(new Event('input', { bubbles: true }));
      let toast = ''; const ot = APP.toast; APP.toast = m => { toast = m; }; eval(submitSrc)(); APP.toast = ot;
      await new Promise(r => setTimeout(r, 150));
      const rec = APP.S.all('psyans').find(a => a.item === 'crt_bat'); out.rec = rec && rec.ok === true && rec.conf === 80;
      // M9: درصدِ گروهِ هم‌سن (۳۷ ساله ⇒ بازهٔ ۳۰ تا ۴۹ در منبع)
      const bp = P.bandP(it('crt_bat'), P.age()); out.bandP = bp && Math.abs(bp.p - it('crt_bat').p_band['30-49']) < 1e-9 && bp.lo === 30;
      out.toast = toast; out.toastBand = /^درست\. ۴۳٪ ِ .*۳۰ تا ۴۹.*هم‌سن‌هایت/.test(toast);
      return out;
    }, '(' + submit.toString() + ')');
    chk(!info.h2.yesFail.length && !info.h2.noPass.length, 'H2: Persian/Arabic digits, separators and 0–20 number words normalised; wrong answers stay wrong: ' + JSON.stringify(info.h2));
    chk(!info.h2.freeFa.length && info.h2.nFree >= 12, 'H2: every free-text item accepts its key in Persian digits: ' + JSON.stringify(info.h2.freeFa));
    chk(info.h2.rec, 'H2 repro: «۵ هزار تومان» is recorded as correct (conf «۸۰» ⇒ 80)');
    chk(info.h2.bandP && info.h2.toastBand, 'M9: descriptive item shows the per-age-band percentage of the owner\'s band: ' + info.h2.toast);
    // M8: گوشی
    await p.setViewportSize({ width: 390, height: 844 });
    await p.evaluate(() => { const S = APP.S; S.put({ id: 'kn_ph', type: 'knot', fam: 'F2', name: 'گوشی', status: 'open', created: new Date().toISOString() });
      S.put({ id: 'wc_ph', type: 'wchain', title: 'نگرانی', feel: 70, outcome: 'رخ نداد', outcomeAt: new Date().toISOString() }); APP.go('mind'); });
    await sleep(500);
    info.m8 = await p.evaluate(() => ({ W: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, svgs: [...document.querySelectorAll('#main .mind-svg')].map(s => Math.round(s.getBoundingClientRect().right)),
      sum: (document.querySelector('#main .psy-sec details summary') || {}).textContent || '' }));
    chk(info.m8.sw <= info.m8.W && info.m8.svgs.every(r => r <= info.m8.W + 1), 'M8: no horizontal scroll on the mind page at 390px: ' + JSON.stringify(info.m8));
    // LOW: شمارِ لنگرها از خودِ داده، تاریخ با رقمِ فارسی
    const nn = await p.evaluate(() => { const P = APP.PSY, its = P.norms().items; return { a: its.filter(P.isAnchor).length, d: its.length - its.filter(P.isAnchor).length }; });
    chk(info.m8.sum.includes(await p.evaluate(n => APP.fa(n.a) + ' معمای لنگردار و ' + APP.fa(n.d) + ' معمای توصیفی', nn)) && !/\d{4}-\d{2}-\d{2}/.test(info.m8.sum) && /۲۰۲۶/.test(info.m8.sum),
      'LOW: anchor count derived from the data (anchors vs descriptive) and the date in Persian digits: ' + info.m8.sum);
    await ctx.close();
  }

  // ---------- H3: اطمینان به پاسخ در برابرِ احتمالِ رویداد ----------
  {
    const { ctx, p } = await open({ time: '2026-10-15T10:00:00+03:30' });
    info.h3 = await p.evaluate(() => {
      const S = APP.S, out = {}, now = new Date().toISOString();
      for (let i = 0; i < 10; i++) S.put({ id: 'w' + i, type: 'wchain', title: 'نگرانیِ ' + i, feel: 10, outcome: 'رخ نداد', outcomeAt: now, created: now });
      let mm = APP.MIND.model(), meta = APP.PSY.model().find(c => c.id === 'META');
      out.calibrated = { black: mm.black.filter(b => /overconf/.test(b.k)).map(b => b.fa), metaCalN: meta.self.calN || 0, fc: meta.fc, aff: APP.PSY.model().find(c => c.id === 'AFF').self.k };
      // پیش‌بینی‌های تند و نادرست ⇒ بیش‌اطمینانی در پیش‌بینی
      for (let i = 0; i < 10; i++) S.put({ id: 'w' + i, type: 'wchain', title: 'نگرانیِ ' + i, feel: 90, outcome: 'رخ نداد', outcomeAt: now, created: now });
      mm = APP.MIND.model(); out.overFc = mm.black.filter(b => b.k === 'overconf_fc').map(b => b.fa);
      out.overAnsFromFc = mm.black.filter(b => b.k === 'overconf').length;
      // اطمینان به پاسخِ خودم: ۹۰٪ ولی ۳ از ۱۰ درست ⇒ بیش‌اطمینانی به پاسخ
      S.put({ id: 'kn_h3', type: 'knot', fam: 'F2', name: 'ب', status: 'working' });
      S.put({ id: 'ki_h3', type: 'kitem', knot: 'kn_h3', atype: 'int', gen: { by: 'user' }, hist: Array.from({ length: 10 }, (_, j) => ({ at: now, ok: j < 3, conf: 90 })) });
      mm = APP.MIND.model(); out.overAns = mm.black.filter(b => b.k === 'overconf').map(b => b.fa);
      meta = APP.PSY.model().find(c => c.id === 'META'); out.metaN = meta.self.calN; out.metaOver = meta.self.pOver; out.fcN = meta.fc.dirN;
      const row = mm.dims.find(d => d.id === 's_mind'); out.rowFc = row.est.fc.dirN;
      return out;
    });
    chk(!info.h3.calibrated.black.length && info.h3.calibrated.metaCalN === 0 && info.h3.calibrated.fc.dirN === 10 && info.h3.calibrated.fc.pOver < 0.5, 'H3 repro: 10 worries at 10% that did not happen ⇒ no overconfidence black point, not in META\'s answer-confidence: ' + JSON.stringify(info.h3.calibrated));
    chk(info.h3.overFc.length === 1 && info.h3.overAnsFromFc === 0, 'H3: forecasts that are too extreme ⇒ «بیش‌اطمینانی در پیش‌بینی‌ها», separate from answer overconfidence: ' + JSON.stringify(info.h3.overFc));
    chk(info.h3.overAns.length === 1 && /پاسخ‌های/.test(info.h3.overAns[0]) && info.h3.metaN === 10 && info.h3.metaOver > 0.5 && info.h3.fcN === 10 && info.h3.rowFc === 10, 'H3: answer confidence 90% with 3/10 right ⇒ answer overconfidence; META counts answers only: ' + JSON.stringify(info.h3));
    await ctx.close();
  }

  // ---------- M1 + M2: ساعتِ ماندگار، بی دیدن‌و‌رد؛ روزی یکی ----------
  {
    const { ctx, p } = await open({ time: '2026-10-15T10:00:00+03:30' });
    info.m1 = {};
    info.m1.first = await p.evaluate(async () => { APP.go('psy_item'); await new Promise(r => setTimeout(r, 200)); return { id: APP.PSY.openItems()[0], limit: (APP.PSY.item(APP.PSY.openItems()[0]) || {}).time_limit_s }; });
    await p.clock.runFor(10000);
    await p.evaluate(() => APP.go('home')); await sleep(100);
    info.m1.back = await p.evaluate(async () => { APP.go('psy_item'); await new Promise(r => setTimeout(r, 200)); return { open: APP.PSY.openItems()[0], timer: document.querySelector('.psy-timer').textContent, recs: APP.S.all('psyans').length }; });
    // دیدن و رد شدن به معمای دیگر با arg ⇒ همان معمای باز
    info.m1.skip = await p.evaluate(async () => { const other = APP.PSY.pending().find(i => i.id !== APP.PSY.openItems()[0]).id; APP.go('psy_item', other); await new Promise(r => setTimeout(r, 200));
      return { shown: !!document.querySelector('.psy-timer'), recs: APP.S.all('psyans').length, other }; });
    // رفتن، گذشتِ زمان، بارگذاریِ دوباره ⇒ «وقت تمام شد»
    await p.evaluate(() => { APP.go('home'); APP.S.flushNow(); }); await p.clock.runFor(25000);
    await p.reload(); await p.waitForSelector('.nav'); await p.evaluate(() => { APP.S.loaded = true; });
    info.m1.after = await p.evaluate(() => { APP.dueList(); const r = APP.S.all('psyans'); return { recs: r.map(a => ({ item: a.item, ok: a.ok, timeout: a.timeout, ms: a.ms })), open: APP.PSY.openItems().length }; });
    chk(info.m1.first.limit === 30 && /۲۰|۱۹|۲۱/.test(info.m1.back.timer) && info.m1.back.open === info.m1.first.id && info.m1.back.recs === 0, 'M1: reopening continues the same clock (not a fresh 30 s): ' + JSON.stringify(info.m1.back));
    chk(info.m1.skip.shown && info.m1.skip.recs === 0, 'M1: another item cannot be opened while one is open and unanswered');
    chk(info.m1.after.recs.length === 1 && info.m1.after.recs[0].item === info.m1.first.id && info.m1.after.recs[0].timeout === true && info.m1.after.recs[0].ok === false && info.m1.after.open === 0,
      'M1: time elapsed while away (reload) ⇒ recorded as a timeout (wrong): ' + JSON.stringify(info.m1.after));
    // M2: امروز یک معما شد ⇒ نه در «امروز»، نه دکمهٔ کارنامه، نه نمای مستقیم؛ فردا دوباره
    info.m2 = await p.evaluate(async () => {
      const out = {}; out.today = APP.dueList().some(x => /معمای امروز/.test(x.txt));
      APP.go('mind'); await new Promise(r => setTimeout(r, 300)); out.btn = !!document.querySelector('#main .psy-open'); out.note = !!document.querySelector('#main .psy-tomorrow');
      const nxt = APP.PSY.pending()[0].id; APP.go('psy_item', nxt); await new Promise(r => setTimeout(r, 200)); out.direct = !!document.querySelector('#main .psy-q'); out.recs = APP.S.all('psyans').length;
      return out;
    });
    chk(!info.m2.today && !info.m2.btn && info.m2.note && !info.m2.direct && info.m2.recs === 1, 'M2: one puzzle per day — Today, the mind-section button and the direct view all respect it: ' + JSON.stringify(info.m2));
    await p.evaluate(() => { APP.go('home'); APP.S.flushNow(); }); await p.clock.setSystemTime(new Date('2026-10-16T10:00:00+03:30'));
    info.m2b = await p.evaluate(async () => { APP.go('mind'); await new Promise(r => setTimeout(r, 300)); return { btn: !!document.querySelector('#main .psy-open'), today: APP.dueList().some(x => /معمای امروز/.test(x.txt)) }; });
    chk(info.m2b.btn && info.m2b.today, 'M2: the next day a new puzzle is offered again: ' + JSON.stringify(info.m2b));
    await ctx.close();
  }

  // ---------- M3: روزِ محلی (۰۰:۳۰ تهران) و ماه‌ها ----------
  {
    const { ctx, p } = await open({ time: '2026-10-16T00:30:00+03:30' });
    info.m3 = await p.evaluate(async (submitSrc) => {
      APP.go('psy_item'); await new Promise(r => setTimeout(r, 200));
      const it = APP.PSY.item(APP.PSY.openItems()[0]); document.querySelectorAll('#main input[type=radio]')[it.answer].click(); eval(submitSrc)();
      await new Promise(r => setTimeout(r, 150));
      const e = APP.PSY.selfEst([{ at: new Date('2026-10-31T23:30:00+03:30').toISOString(), ok: true }, { at: new Date('2026-11-01T01:00:00+03:30').toISOString(), ok: false }]);
      return { today: APP.today(), answeredToday: APP.PSY.answeredToday(), inToday: APP.dueList().some(x => /معمای امروز/.test(x.txt)), months: e.months.map(m => m.m).join(',') };
    }, '(' + submit.toString() + ')');
    chk(info.m3.today === '2026-10-16' && info.m3.answeredToday && !info.m3.inToday && info.m3.months === '2026-10,2026-11', 'M3: local date for «answered today» and month buckets: ' + JSON.stringify(info.m3));
    await ctx.close();
  }

  // ---------- M4 + M5 + M6 + M7: ماندگاری، بی شمارشِ دوباره، بی برش، اسلایدر ----------
  {
    const { ctx, p } = await open({ time: '2026-10-15T09:00:00+03:30' });
    // M7: مرورِ کارت با اسلایدرِ دست‌نخورده و دست‌خورده
    await p.evaluate(() => { APP.newCard('قضیهٔ بیز چیست؟', 'پاسخ'); APP.newCard('نرخِ پایه یعنی چه؟', 'پاسخ'); APP.go('review'); }); await sleep(400);
    for (const conf of [null, 90]) {
      await p.evaluate(async (conf) => {
        const sl = document.getElementById('rvConf'); if (conf != null) { sl.value = conf; sl.dispatchEvent(new Event('input', { bubbles: true })); }
        [...document.querySelectorAll('#main button')].find(x => x.textContent === 'نمایش پاسخ').click(); await new Promise(r => setTimeout(r, 50));
        [...document.querySelectorAll('#main .grades button')][5].click(); await new Promise(r => setTimeout(r, 80));
      }, conf);
    }
    info.m7 = await p.evaluate(() => APP.S.all('card').map(c => (c.hist || []).map(h => h.c)).flat());
    chk(info.m7.length === 2 && info.m7.includes(null) && info.m7.includes(90) && !info.m7.includes(60), 'M7: an untouched slider is saved as «not stated» (null), a moved one as its value: ' + JSON.stringify(info.m7));
    info.m4 = await p.evaluate(() => {
      const S = APP.S, out = {}, d = n => APP.addDays(APP.today(), n);
      // M6: کارت‌های خودسنجی در Glr/META/s_learn نمی‌آیند و جدا شمرده می‌شوند
      const glr = APP.PSY.model().find(c => c.id === 'Glr'); const own = S.all('card', c => !c.sample).map(c => (c.hist || []).length).reduce((a, x) => a + x, 0); out.cardsDbg = [glr.self.n, glr.cards.n, glr.cards.k, own, APP.PSY.model().find(c => c.id === 'META').self.calN || 0].join(',');
      out.cardsOut = glr.self.n === 0 && glr.cards.n === own && glr.cards.k === own && (APP.PSY.model().find(c => c.id === 'META').self.calN || 0) === 0;
      out.cardsLearn = APP.MIND.model().dims.find(x => x.id === 's_learn').ans.length === 0;
      // M4: ۳۰ روزه — نخستین پاسخِ پس از موعد نادرست، بعد درست ⇒ نادرست
      S.put({ id: 'kn_a', type: 'knot', fam: 'F2', name: 'الف', status: 'practised', solvedAt: d(-40) + 'T09:00:00', created: d(-50) + 'T09:00:00',
        log: [{ at: d(-40) + 'T09:00:00', d: d(-40), ok: true, el: true }, { at: d(-8) + 'T09:00:00', d: d(-8), ok: false, el: true }, { at: d(-8) + 'T09:05:00', d: d(-8), ok: true, el: true }] });
      // ۹۰ روزه: فقط پاسخِ «خودم سنجیدم» روی نمونهٔ وارسی‌نشده ⇒ سنجیده نشده
      S.put({ id: 'kn_b', type: 'knot', fam: 'F2', name: 'ب', status: 'practised', solvedAt: d(-95) + 'T09:00:00', created: d(-100) + 'T09:00:00',
        log: [{ at: d(-60) + 'T09:00:00', d: d(-60), ok: true, el: true }, { at: d(-2) + 'T09:00:00', d: d(-2), ok: true, el: false, self: 'خودم سنجیدم' }] });
      const H = APP.PSY.holds(); out.holds = H.map(x => x.knot + ':' + x.n + ':' + x.ok).join(' ');
      out.m4 = H.some(x => x.knot === 'kn_a' && x.n === 30 && x.ok === false) && !H.some(x => x.knot === 'kn_b' && x.n === 90) && H.some(x => x.knot === 'kn_b' && x.n === 30 && x.ok === true);
      // M5: پاسخ‌های همان گره در kitem (۳۰+ روز پس از نخستین درست) دوباره در ماندگاری شمرده نمی‌شوند
      S.put({ id: 'ki_a', type: 'kitem', knot: 'kn_a', atype: 'int', gen: { by: 'user' }, hist: [{ at: d(-40) + 'T09:00:00', ok: true }, { at: d(-8) + 'T09:00:00', ok: false }, { at: d(-8) + 'T09:05:00', ok: true }] });
      const m = APP.MIND.model(), sp = m.dims.find(x => x.id === 's_problem'), nh = APP.PSY.holds().length;
      out.ret = sp.ret.n + '/' + nh; out.m5 = sp.ret.n === nh && sp.ret.ok === APP.PSY.holds().filter(x => x.ok).length;
      // M6: گرهِ بازِ ۴۰ روزه بی ورزشِ موعدگذشته ⇒ بی نقطهٔ سیاهِ قراردادیِ «۳۰ روز»؛ با ورزشِ موعدگذشته ⇒ نقطهٔ سیاه از برنامهٔ خودش
      S.put({ id: 'kn_o', type: 'knot', fam: 'F1', name: 'باز', status: 'open', created: d(-40) + 'T09:00:00' });
      out.noStale = !APP.MIND.model().black.some(b => b.k === 'stale');
      S.put({ id: 'ki_o', type: 'kitem', knot: 'kn_o', atype: 'int', gen: { by: 'user' }, due: d(-2), hist: [] });
      const st = APP.MIND.model().black.filter(b => b.k === 'stale'); out.stale = st.length === 1 && /موعدِ خودش/.test(st[0].fa) && !/۳۰ روز/.test(st[0].fa);
      // M6: روندِ ماهانه بی کفِ «۳ پاسخ در ماه» (ماهِ تک‌پاسخی هم برآورد دارد)؛ کالیبراسیون بی رنگِ «کمتر از ۵»؛ گرهِ بُعد از احتمالِ A3+A4
      S.put({ id: 'ki_one', type: 'kitem', knot: 'kn_o', atype: 'int', gen: { by: 'user' }, hist: [{ at: '2026-05-10T09:00:00', ok: true, conf: 70 }] });
      const mm = APP.MIND.model(), d1 = mm.dims.find(x => x.id === 's_learn'), may = d1.months.find(x => x.m === '2026-05');
      out.month1 = !!may && may.n === 1 && Math.abs(may.next - 2 / 3) < 1e-9;
      const C = APP.MIND.charts(mm);
      out.trendPts = C.trend.querySelectorAll('circle').length >= 1;
      out.calNoGrey = ![...C.calib.querySelectorAll('circle')].some(c => /148,163,184/.test(c.getAttribute('fill')));
      out.nodeNext = [...C.neural.querySelectorAll('circle[data-next]')].some(c => c.getAttribute('data-next') !== '' && Math.abs(+c.getAttribute('data-next') - mm.dims.find(x => x.est && x.est.n).est.next) < 1e-3);
      return out;
    });
    chk(info.m4.cardsOut && info.m4.cardsLearn, 'M6: self-graded cards are excluded from Glr/META/s_learn and shown separately: ' + JSON.stringify(info.m4));
    chk(info.m4.m4, 'M4: retention pass needs the FIRST valid attempt after the due day; self-judged answers never count: ' + info.m4.holds);
    chk(info.m4.m5, 'M5: retention counted once on the mind card (holds only): ' + info.m4.ret);
    chk(info.m4.noStale && info.m4.stale, 'M6: no conventional «30 days open» black point; overdue-by-its-own-schedule instead');
    chk(info.m4.month1 && info.m4.trendPts && info.m4.calNoGrey && info.m4.nodeNext, 'M6: no n≥3 month cut-off, no min-5 bin colouring, node size from the A3+A4 probability: ' + JSON.stringify(info.m4));
    await ctx.close();
  }

  // ---------- LOW: «دیده‌ام»/پایانِ زمان در برآوردِ خودی؛ قاعدهٔ دستیار ----------
  {
    const { ctx, p } = await open({ time: '2026-10-15T10:00:00+03:30' });
    info.low = await p.evaluate(async () => {
      const S = APP.S, P = APP.PSY, out = {}, now = APP.addDays(APP.today(), -1) + 'T12:00:00', anc = P.norms().items.filter(P.isAnchor);
      S.put({ id: 'pa_f', type: 'psyans', item: anc[0].id, ok: true, familiar: true, conf: 90, at: now });
      S.put({ id: 'pa_t', type: 'psyans', item: anc[1].id, ok: false, timeout: true, conf: 70, at: now });
      const M = P.model(), gf = M.find(c => c.id === anc[0].construct);
      out.famOut = gf.self.n === 1 && gf.self.k === 0;          // فقط پاسخِ «وقت تمام شد» (نادرست) در سازه
      out.timeoutNoMeta = M.find(c => c.id === 'META').self.calN === 1;   // فقط اطمینانِ پاسخِ «دیده‌ام» (پاسخی بود)
      // قاعدهٔ «هرگز حل نکن»: معمای باز در هر نما، یا پیامی که تکه‌ای از متنِ معما دارد
      const hk = (msg) => APP.ASSIST.promptHooks.map(f => { try { return f({ msgs: [] }, msg) || ''; } catch (e) { return ''; } }).join('\n');
      APP.go('home'); await new Promise(r => setTimeout(r, 100));
      out.offAtHome = !/هرگز حل نکن/.test(hk('سلام'));
      const lily = P.item('crt_lily').text.split(' ').slice(2, 9).join(' ');
      out.pasted = /هرگز حل نکن/.test(hk('جواب این چیه: ' + lily));
      APP.go('psy_item', 'crt_widgets'); await new Promise(r => setTimeout(r, 150)); APP.go('home'); await new Promise(r => setTimeout(r, 100));
      out.openAnywhere = /هرگز حل نکن/.test(hk('سلام'));
      out.sysLen = APP.ASSIST.SYS.length; out.sysClean = !/هرگز حل نکن/.test(APP.ASSIST.SYS);
      return out;
    });
    chk(info.low.famOut && info.low.timeoutNoMeta, 'LOW: «seen before» stays out of self figures; a timeout stays out of META: ' + JSON.stringify(info.low));
    chk(info.low.offAtHome && info.low.pasted && info.low.openAnywhere, 'LOW: the never-solve rule loads when a puzzle is open (any view) or the message quotes a puzzle: ' + JSON.stringify(info.low));
    chk(info.low.sysLen <= 20000 && info.low.sysClean, 'assistant SYS stays ≤ 20000 chars and the rule stays a hook: ' + info.low.sysLen);
    await ctx.close();
  }

  console.log(JSON.stringify(info).slice(0, 4000));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exitCode = errors.length ? 1 : 0; process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
