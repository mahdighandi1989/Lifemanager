// تورِ پولیا (دستهٔ ۱، ۲۰۲۶-۱۰-۱۵) — یافته‌های «دستیار، تور، غربال، ناوبری و ایده» (F2). هر بند یکی از یافته‌های اجراکننده‌هاست (runA–D)
// که حالا ماشینی، با رابطِ واقعی و مدلِ بدلی، آزموده می‌شود — هر کدام با نمونهٔ منفی:
//  1) وجهِ تور × مسئلهٔ زنده: نشانه‌های تونلِ زنده (نه حل‌شده)، برپا از داده، ایمیل با همان شمار
//  2) tour_done/tour_step ِ مدل هرگز ✓ نمی‌زند؛ وجهِ «گامِ دیگر» فقط با دکمهٔ خودِ کاربر
//  3) پروندهٔ بسته ⇒ وجهِ بسته (و بازگشایی ⇒ وجهِ باز)
//  4) یافته‌های غربال ⇒ شاهد در دفترِ شواهدِ موقعیتِ گره (رتبه جابه‌جا می‌شود؛ حذفِ کاربر محترم)
//  5) الگوی گستردهٔ «🔭» با نمونه‌های منفی؛ tour_diag ِ بی‌تور همان نوبت به مدل می‌رسد
//  6) قلابِ مسئلهٔ زنده: قابِ نوع‌دار، پرسشِ هم‌گام با صفحه، مربیِ پولیا (مکانیکی نه، شنا، معلمِ خیالی، پلهٔ استقلال، یک ایده، پایانِ نردبان)
//  7) نوبتِ خودکار پس از رفتن با فیلدهای data-own تناقض نمی‌گوید
//  8) نامِ نماهای lprob/idea/sources/psy_item («صفحهٔ قبلی» نه)
//  9/19) «دانسته‌های قلمرو» و «حوزه‌های هم‌خوان» فقط با ربطِ واقعی
// 10) «🌱» فقط پس از نشانهٔ واقعی
// 11) حلِ درونِ گفت‌وگو ⇒ مسئلهٔ زنده با بازنگری و کارت؛ مسئلهٔ ساختهٔ کاربر ⇒ برمی‌گردد؛ سشن ⇄ مسئله
// 12) ضرب‌المثلِ همان مرحله از ثبت‌گاه/منبع
// 13) ایده: شکلِ کارها، مثالِ نقض ⇒ فرض/نقد، پروندهٔ فرض
// 14) موعدِ ساعت‌دار، ساعتِ یادآورها، «انجام شد»، یادآورِ کارتِ مرور با بازسازی
// 15) وجهِ ایستاده ⇒ یادآور روی نردبانِ خودِ سامانه
// 16) next:true پس از سقفِ نوبت‌ها گم نمی‌شود
// 17) قدمِ ناموجود ⇒ صادقانه گفته می‌شود چه باز شد
// 18) فرمول در حبابِ گفت‌وگو جدا (bdi) می‌نشیند
// 20) پیوستِ CSV ⇒ نمودارِ A.MIND.csvBlock؛ 6b) مرحلهٔ ضعیف فقط به‌صورتِ احتمال؛ 12b) APP.HEUR_WISDOM
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  await p.goto(FILE); await p.waitForSelector('.nav');
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__rem = []; window.__unrem = []; window.__day = APP.today();
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async (pl) => { __rem.push(JSON.parse(JSON.stringify(pl))); return { ok: true }; }, unremind: async (k) => { __unrem.push(k); return { ok: true }; } };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); const r = __q.shift(); const t = typeof r === 'function' ? r(user) : r;
      if (t === undefined) throw new Error('no queued answer');
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
  });
  // پیام از راهِ خودِ پنجرهٔ دستیار (textarea + «بفرست»)
  const say = async (text) => {
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
  };
  // دورِ ۱۰ (J4): live_new ِ گفت‌وگو اکنون به صفحهٔ مسئله می‌رود — سشنِ تازهٔ آزمون از جایی شروع می‌شود که کاربرِ تازه است (نه صفحهٔ مسئلهٔ سشنِ پیشین)
  const newSess = () => p.evaluate(() => { if (APP.state.view === 'lprob') APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; return s.id; });

  // ---------- SYS زیرِ سقفِ سرور ----------
  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys < 20000, 'SYS stays under the 20000-char server cap: ' + info.sys);

  // ---------- 1) وجهِ تور × مسئلهٔ زنده ----------
  await newSess();
  info.live = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S, out = {};
    __q.push(R({ actions: [{ do: 'tour_plan', goal: 'خریدِ خانه', facets: [{ key: 'f1', kind: 'problem', title: 'اجاره یا خرید', why: 'مسئلهٔ باز' }, { key: 'f2', kind: 'other', title: 'گفت‌وگو با همسر', steps: ['قرار بگذارم', 'نتیجه را بنویسم'] }] },
      { do: 'live_new', title: 'اجاره یا خرید', statement: 'بین اجاره و خریدِ خانه با این پول‌ها انتخاب کنم؛ نمی‌دانم کدام.', kind: 'find' }] }));
    await AS.send('نمی‌دونم خونه بخرم یا اجاره کنم؛ بیا تور بچینیم');
    const s = AS.cur(), f = s.tour.facets[0], ms0 = AS.tourMilestones(f).map(m => m.t);
    out.linked = (f.refs || []).length === 1 && /^eprob_pb_l_/.test(f.refs[0].id); out.sessLp = !!s.lprob;
    out.liveMs = ms0.some(t => /فهمِ مسئله/.test(t)) && ms0.some(t => /ابزارِ طرح/.test(t)) && ms0.some(t => /گامِ واقعی/.test(t)) && ms0.some(t => /بازنگری/.test(t));
    out.noSolvedMs = !ms0.some(t => /تأییدِ مسئله|شبیه‌ساز|هم‌ساختار/.test(t));
    out.notDone0 = f.status === 'now';
    const pid = s.lprob, pg = S.get('eprog_' + pid), so = pg.solve;
    so.u = so.u || {}; so.u[1] = { done: true, one: 'انتخابِ اجاره یا خرید', u: 'کدام ارزان‌تر است در ۵ سال', dl: [{ id: 'd1', t: 'پس‌انداز ۲ میلیارد' }], c: 'تا عید', type: 'find' };
    S.put(pg); AS.tourAfterTurn(s); out.afterU = f.status;
    so.live.plan = { t: 'نخست هزینهٔ ۵ ساله را مقایسه می‌کنم', at: new Date().toISOString(), d: APP.today(), unused: {}, heur: ['move'] };
    so.live.steps = [{ id: 'ls1', at: new Date().toISOString(), d: APP.today(), text: 'از دو مشاور قیمت بگیرم', pred: 'خرید گران‌تر', conf: 70, due: APP.today(), closed: true, out: { done: 'yes', what: 'خرید ۳۰٪ گران‌تر', match: 'yes', prog: 'بله، روشن', want: 'same' } }];
    S.put(pg); AS.tourAfterTurn(s); S.put(s);
    const ms1 = AS.tourMilestones(f);
    out.done = f.status === 'done' && f.doneBy === 'evidence';
    out.okN = ms1.filter(m => m.ok).length; out.allN = ms1.length;
    const rep = await APP.REPORT.build(s, []);
    out.mail = /فهمِ مسئله/.test(rep.html) && !/تأییدِ مسئله پس از وارسی/.test(rep.html);
    out.practice = AS.tourPractice(f).length >= 0;
    return out;
  });
  chk(info.live.linked && info.live.sessLp && info.live.liveMs && info.live.noSolvedMs && info.live.notDone0, '1: a problem facet on a live problem uses the live milestones (not the solved-problem ones) ' + JSON.stringify(info.live));
  chk(info.live.afterU === 'now' && info.live.done && info.live.okN >= 5, '1: the facet completes from the live data only after understanding + plan with a heuristic + a real step ' + JSON.stringify(info.live));
  chk(info.live.mail, '1: the tour e-mail counts the live milestones ' + JSON.stringify(info.live));

  // ---------- 2) حرفِ مدل هرگز ✓ نمی‌زند (وجهِ «گامِ دیگر») ----------
  info.other = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S, s = AS.cur(), f = s.tour.facets[1], out = {};
    __calls.length = 0; __q.length = 0;
    __q.push(R({ reply: 'تمام شد!', actions: [{ do: 'tour_step', facet: 'f2', step: 1 }, { do: 'tour_step', facet: 'f2', step: 2 }, { do: 'tour_done', facet: 'f2', why: 'کاربر گفت انجام شد' }] }));
    await AS.send('[ادامهٔ تور]');
    out.st = f.status; out.claimed = f.steps.every(x => x.claimed && !(x.done && x.by === 'user'));
    out.noCeleb = !s.msgs.some(m => /🎉 پایهٔ همهٔ وجه‌ها/.test(m.text));
    out.denyNote = s.msgs.some(m => m.role === 'sys' && /تأییدِ خودِ کاربر/.test(m.text));
    out.ruleInPrompt = /tour_done و tour_step از تو فقط پیشنهاد است/.test(__calls[0].user);
    // دستیار دکمهٔ تأییدِ مالک را نمی‌بیند (در کشوی تور، بیرون از #main)
    out.notScanned = !AS.scan().buttons.some(b => /خودم انجام دادم/.test(b.label));
    AS.toggle(true); AS.paint();
    out.btns = document.querySelectorAll('.as-tour [data-facet="f2"] .as-own-step').length;
    out.own = !!document.querySelector('.as-tour [data-facet="f2"] [data-own] .as-own-step');
    return out;
  });
  chk(info.other.st !== 'done' && info.other.claimed && info.other.noCeleb && info.other.denyNote && info.other.ruleInPrompt, '2: tour_step/tour_done from the model never tick or close an "other" facet ' + JSON.stringify(info.other));
  chk(info.other.notScanned && info.other.btns === 2 && info.other.own, '2: the owner-only confirm buttons are in the drawer (data-own), out of the assistant\'s reach ' + JSON.stringify(info.other));
  await p.click('.as-tour [data-facet="f2"] .as-own-step[data-step="1"]');
  await p.click('.as-tour [data-facet="f2"] .as-own-step[data-step="1"]').catch(() => {});
  await p.waitForTimeout(100);
  info.other2 = await p.evaluate(() => { const s = APP.ASSIST.cur(), f = s.tour.facets[1]; return { st: f.status, s1: f.steps[0].by, s2: f.steps[1].by || '', left: document.querySelectorAll('.as-tour [data-facet="f2"] .as-own-step').length }; });
  chk(info.other2.s1 === 'user' && info.other2.st !== 'done' && info.other2.left === 1, '2: one confirmed step ticks only that step ' + JSON.stringify(info.other2));
  await p.click('.as-tour [data-facet="f2"] .as-own-step');
  await p.waitForTimeout(100);
  info.other3 = await p.evaluate(() => { const s = APP.ASSIST.cur(), f = s.tour.facets[1]; return { st: f.status, by: f.doneBy, celeb: s.msgs.some(m => /🎉 پایهٔ همهٔ وجه‌ها/.test(m.text)) }; });
  chk(info.other3.st === 'done' && info.other3.by === 'evidence' && info.other3.celeb, '2: the facet closes (and the tour celebrates) only after the user\'s own confirmation ' + JSON.stringify(info.other3));

  // ---------- 3) پروندهٔ بسته ⇒ وجهِ بسته ----------
  await newSess();
  info.closed = await p.evaluate(() => {
    const AS = APP.ASSIST, S = APP.S, s = AS.cur(); s.msgs.push({ role: 'user', text: 'x', at: new Date().toISOString() }); S.put(s); AS._turnSession = s;
    AS.DO.tour_plan({ goal: 'g', facets: [{ key: 'f1', kind: 'claim', title: 'تبلیغ علتِ رشد بود' }] });
    const cs = APP.newCase({ title: 'آیا تبلیغ علتِ رشد بود؟', input: 'فروش بالا رفت' }); AS.DO.tour_link({ facet: 'f1', id: cs.id });
    const f = s.tour.facets[0], out = {};
    cs.st = cs.st || {}; cs.st.st_final = { done: true, data: { verdict: 'پرونده بسته شد' } }; S.put(cs);
    AS.tourAfterTurn(s); out.openNotClosed = f.status;            // حکمِ نهایی بی «بسته» ⇒ هنوز نه
    cs.status = 'closed'; S.put(cs); AS.tourAfterTurn(s); out.afterClose = f.status; out.by = f.doneBy;
    out.msg = s.msgs.some(m => /بسته شد/.test(m.text) && /پرونده/.test(m.text));
    out.ms = AS.tourMilestones(f).find(m => /ایستگاه‌ها گذرانده شد/.test(m.t)) || {};
    cs.status = 'open'; S.put(cs); AS.tourAfterTurn(s); out.reopened = f.status;
    return { openNotClosed: out.openNotClosed, afterClose: out.afterClose, by: out.by, msg: out.msg, msOk: out.ms.ok, msT: out.ms.t, reopened: out.reopened };
  });
  chk(info.closed.openNotClosed === 'now' && info.closed.afterClose === 'done' && info.closed.msg && info.closed.msOk && /بستی/.test(info.closed.msT || '') && info.closed.reopened !== 'done', '3: closing the linked case closes the facet; reopening it reopens the facet ' + JSON.stringify(info.closed));

  // ---------- 4) غربال ⇒ شاهد در موقعیتِ گره ----------
  await newSess();
  info.sieve = await p.evaluate(() => {
    const AS = APP.ASSIST, S = APP.S, s = AS.cur(); s.msgs.push({ role: 'user', text: 'x', at: new Date().toISOString() }); S.put(s); AS._turnSession = s;
    AS.DO.tour_plan({ goal: 'آمار', facets: [{ key: 'f1', kind: 'knot', title: 'محاسبه پیش از فهم' }] });
    const kc = { id: 'kc_sv1', type: 'kcase', title: 'احتمالِ ۱٫۳', intake: { what: 'جواب ۱٫۳ شد' }, ev: [], knots: [], premise: {} }; S.put(kc);
    AS.DO.tour_link({ facet: 'f1', id: 'kc_sv1' });
    const rank0 = (APP.knotRank(S.get('kc_sv1')).find(r => r.fam === 'F2') || {}).state;
    AS.DO.tour_diag({ layers: [{ id: 'F2', st: 'found', why: 'گفت «میانگین رو جای یک بسته گذاشتم»' }, { id: 'F3', st: 'ask' }] });
    let k = S.get('kc_sv1'); const ev1 = (k.ev || []).filter(e => e.src === 'sieve:F2'), noAsk = !(k.ev || []).some(e => e.src === 'sieve:F3');
    const r1 = APP.knotRank(k).find(r => r.fam === 'F2');
    // حذف در دفترِ شواهد ⇒ برنمی‌گردد
    k.ev = k.ev.filter(e => e.src !== 'sieve:F2'); k.sieveOff = { F2: new Date().toISOString() }; S.put(k); AS.sieveToKnots(s);
    k = S.get('kc_sv1'); const back = (k.ev || []).some(e => e.src === 'sieve:F2'), rOff = APP.knotRank(k).find(r => r.fam === 'F2').state;
    // لایه «رد شد» ⇒ شاهدِ غربالیِ آن خانواده برداشته می‌شود
    delete k.sieveOff; S.put(k); AS.sieveToKnots(s); const again = (S.get('kc_sv1').ev || []).some(e => e.src === 'sieve:F2');
    AS.DO.tour_diag({ layers: [{ id: 'F2', st: 'no', why: 'در آزمونِ بعد درست خواند' }] }); const gone = !(S.get('kc_sv1').ev || []).some(e => e.src === 'sieve:F2');
    return { rank0, n: ev1.length, quote: ev1[0] && /میانگین رو جای یک بسته گذاشتم/.test(ev1[0].text), dir: ev1[0] && ev1[0].dir, noAsk, state: r1.state, ev: r1.n, back, rOff, again, gone };
  });
  chk(info.sieve.rank0 === 'open' && info.sieve.n === 1 && info.sieve.quote && info.sieve.dir === 1 && info.sieve.noAsk && info.sieve.state === 'ev' && info.sieve.ev === 1, '4: a found sieve family becomes one evidence entry (with the user\'s quote) in the linked knot case and moves its rank ' + JSON.stringify(info.sieve));
  chk(!info.sieve.back && info.sieve.rOff === 'open' && info.sieve.again && info.sieve.gone, '4: a sieve entry the user deleted stays deleted; a family later ruled out loses its sieve entry ' + JSON.stringify(info.sieve));

  // ---------- 5) الگوی گستردهٔ «🔭» + غربالِ بی‌تور ----------
  info.liveRe = await p.evaluate(() => {
    const re = APP.ASSIST.LIVE_RE2;
    const pos = ['این لپ‌تاپ رو بخرم یا نه؟', 'لوله تو ون جا میشه یا نه؟', 'هر کیک رو چند بفروشم؟', 'بزنم یا برم', 'اجاره کنم یا بخرم؟', 'کدوم بهتره، شغل اول یا دوم؟'];
    const neg = ['فونتِ صفحه ریز است', 'کارتِ مرور حل نشده', 'این ایستگاه «واقع، فهم، زبان» چی از من می‌خواد؟', 'جوابِ ۲ یا ۳ درسته؟', 'رابطهٔ x و y رو ثابت کن', 'سلام، امروز چه کنیم'];
    return { pos: pos.filter(t => !re.test(t)), neg: neg.filter(t => re.test(t)) };
  });
  chk(!info.liveRe.pos.length && !info.liveRe.neg.length, '5: the broadened live-problem pattern hits decision/fit/price/either-or and misses the negatives ' + JSON.stringify(info.liveRe));
  await newSess();
  await p.evaluate(() => { __q.push(R({ reply: 'دقیقاً چه می‌خواهی؟', actions: [] })); });
  await say('این لپ‌تاپ رو بخرم یا نه؟ پولش رو دارم ولی مطمئن نیستم');
  info.liveRule = await p.evaluate(() => ({ rule: /# مسئلهٔ واقعیِ حل‌نشده/.test(__calls[0].user) && /live_new/.test(__calls[0].user) }));
  await newSess();
  await p.evaluate(() => { __q.push(R({ reply: 'سلام', actions: [] })); });
  await say('فونتِ صفحه ریز است');
  info.liveRuleNeg = await p.evaluate(() => /# مسئلهٔ واقعیِ حل‌نشده/.test(__calls[0].user));
  chk(info.liveRule.rule && !info.liveRuleNeg, '5: the live-problem frame reaches the model for «بخرم یا نه؟» but not for a page complaint ' + JSON.stringify([info.liveRule, info.liveRuleNeg]));
  await newSess();
  info.diagNoTour = await p.evaluate(async () => {
    const AS = APP.ASSIST;
    __q.push(R({ reply: 'دقیقاً چه می‌خواهی؟', actions: [{ do: 'tour_diag', layers: [{ id: 'practical', st: 'found', why: 'گفت «هر کیک رو چند بفروشم»', parts: { unknown: 'قیمتِ هر کیک' } }] }] }));
    __q.push(R({ reply: 'داده‌ها؟' }));
    await AS.send('هر کیک رو چند بفروشم؟');
    await AS.send('هزینهٔ مواد ۱۲۰ هزار');
    const s = AS.cur();
    return { noTour: !s.tour, kept: !!(s.diag && s.diag.practical), reached: /# قابِ مسئلهٔ عملی/.test(__calls[1].user) && /قیمتِ هر کیک/.test(__calls[1].user) };
  });
  chk(info.diagNoTour.noTour && info.diagNoTour.kept && info.diagNoTour.reached, '5: tour_diag without a tour reaches the model on the next turn (practical frame) ' + JSON.stringify(info.diagNoTour));

  // ---------- 6) قلابِ مسئلهٔ زنده: قابِ نوع‌دار، پرسشِ هم‌گام، مربی ----------
  await newSess();
  info.hook = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S, out = {};
    const r = APP.liveCreate('هر عددِ اولِ بزرگ‌تر از ۲ فرد است', 'ثابت کن هر عددِ اولِ بزرگ‌تر از ۲ فرد است.', 'prove'), pid = r.p.id;
    const pg = S.get('eprog_' + pid); pg.solve.u = { 1: { done: true, one: 'اثباتِ فرد بودنِ اول‌ها', u: 'هر اولِ > ۲ فرد است', dl: [{ id: 'd1', t: 'اول یعنی دو مقسوم‌علیه' }], c: 'بزرگ‌تر از ۲', type: 'prove' } }; S.put(pg);
    APP.go('lprob', pid);
    __q.push(R({ reply: 'به حکم نگاه کن.' }));
    await AS.send('از کجا شروع کنم؟');
    const u = __calls[0].user;
    out.objFrame = /پاسخ وجود دارد ولی تو نمی‌دانی/.test(u) && /برهان و وارسیِ هر گام/.test(u);
    out.noOld = !/پاسخِ این مسئله را هیچ‌کس نمی‌داند/.test(u);
    out.coach = /# مربیِ حل/.test(u) && /مکانیکی نخوان/.test(u) && /مثلِ شنا/.test(u) && /معلمِ خیالی/.test(u) && /بلند فکر کند/.test(u) && /یک ایده/.test(u) && /پایانِ نردبانِ سرنخ/.test(u) && /فقط گامِ بعد را بگو/.test(u) && /کتاب را ببند و خودت دوباره حل کن/.test(u) && !/هرگز کلِ حل/.test(u) && /بازسازیِ خودش/.test(u);
    out.rung = /سطحِ استقلالِ کاربر/.test(u) && /پلهٔ ۰/.test(u);
    out.prov = /ضرب‌المثلِ همین مرحله/.test(u);
    // پرسشِ هم‌گام: پرسشی را که در صفحه پاسخ داده دوباره پیشنهاد نکن
    const Q = APP.solveAskList('p', 1, 'prove'), q0 = (AS.liveNextQ(pid) || {}).q;
    pg.tut = pg.tut || {}; pg.tut.qi = { lplan: Q.indexOf(q0) }; pg.tut.plan = [{ src: 'live', q: q0, qi: Q.indexOf(q0), text: 'قضیه‌ای با حکمِ فرد بودن', self: 2, at: new Date().toISOString() }]; S.put(pg);
    __calls.length = 0; __q.push(R({ reply: 'خوب.' }));
    await AS.send('جواب دادم');
    const u2 = __calls[0].user, m2 = /هم‌گام با صفحه[^«]*«([^»]+)»/.exec(u2);
    out.q0 = q0; out.q1 = m2 && m2[1]; out.synced = !!m2 && m2[1] !== q0 && Q.indexOf(m2[1]) >= 0;
    // زندگی (داوری با واقعیت) ⇒ قابِ «هیچ‌کس از پیش نمی‌داند»؛ پس از ثبتِ نتیجه، پرسشِ همان گام دیگر نمی‌آید
    const r2 = APP.liveCreate('شغلِ دوم', 'بین ماندن در این کار و رفتن به شرکتِ تازه انتخاب کنم.', 'find'); r2.p.objective = false; S.put(r2);
    const pg2 = S.get('eprog_' + r2.p.id); pg2.solve.u = { 1: { done: true, one: 'ماندن یا رفتن', u: 'کدام', dl: [], c: '' } };
    pg2.solve.live.plan = { t: 'نخست با دو همکار حرف می‌زنم', at: new Date().toISOString(), heur: ['move'] };
    pg2.solve.live.steps = [{ id: 'ls1', text: 'با مدیرِ شرکتِ تازه حرف بزنم', pred: 'پیشنهاد می‌دهد', conf: 60, due: APP.today(), closed: false }]; S.put(pg2);
    APP.go('lprob', r2.p.id);
    __calls.length = 0; __q.push(R({ reply: 'چه شد؟' })); await AS.send('امروز رفتم');
    const u3 = __calls[0].user; out.lifeFrame = /هیچ‌کس از پیش نمی‌داند/.test(u3) && !/پاسخ وجود دارد ولی تو نمی‌دانی/.test(u3); out.dueQ = /موعدِ گامِ «با مدیرِ شرکتِ تازه حرف بزنم» رسیده/.test(u3);
    pg2.solve.live.steps[0].closed = true; pg2.solve.live.steps[0].out = { done: 'yes', what: 'پیشنهاد داد', match: 'yes', prog: 'کمی', want: 'same' }; S.put(pg2);
    __calls.length = 0; __q.push(R({ reply: 'بعد؟' })); await AS.send('ثبتش کردم');
    const u4 = __calls[0].user; out.staleGone = !/موعدِ گامِ «با مدیرِ شرکتِ تازه حرف بزنم»/.test(u4) && /پیش از (?:گامِ واقعیِ بعد|این گام)/.test(u4);   // ادغامِ G1/G2: پرسشِ اجرای زندگی از A.liveCoach ِ بخشِ مسئله
    return out;
  });
  chk(info.hook.objFrame && info.hook.noOld, '6: an objective (proof) live problem gets «پاسخ وجود دارد ولی تو نمی‌دانی؛ داوری با برهان», not «هیچ‌کس نمی‌داند» ' + JSON.stringify(info.hook));
  chk(info.hook.coach && info.hook.rung && info.hook.prov, '6: the Pólya coach lines (mechanical, swimming, imaginary teacher/think-aloud, one idea, end-of-hint-ladder, rung) reach the model ' + JSON.stringify(info.hook));
  chk(info.hook.synced, '6: the suggested question follows the page and never repeats one already answered there ' + JSON.stringify([info.hook.q0, info.hook.q1]));
  chk(info.hook.lifeFrame && info.hook.dueQ && info.hook.staleGone, '6: a life problem keeps «داور واقعیت»; the due-step question is asked until the outcome is saved, then never again ' + JSON.stringify(info.hook));

  // ---------- 7) نوبتِ خودکار پس از رفتن ≠ «پر کن» روی data-own ----------
  await newSess();
  info.own = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S;
    const r = APP.liveCreate('جا شدنِ لوله', 'لولهٔ ۳ متری تو ونِ ۲٫۵ متری جا میشه یا نه؟', 'find'); APP.go('home');
    __q.push(R({ reply: 'می‌برمت.', actions: [{ do: 'go', view: 'lprob', arg: r.p.id }] }));
    __q.push(R({ reply: 'خودت بنویس.' }));
    await AS.send('برو سراغِ مسئلهٔ لوله');
    const u = (__calls[1] || {}).user || '';
    return { n: __calls.length, ownTold: /به قلمِ خودِ کاربر/.test(u), scanOwn: /به قلمِ خودِ کاربر — پر نکن/.test(u), noBlindFill: !/حالا از روی همین گفت‌وگو فیلدهای این صفحه را پر کن و باقیِ لازم‌ها/.test(u) || /فقط فیلدهایی که/.test(u),
      label: /«مسئلهٔ حل‌نشدهٔ خودم[^»]*» باز شد/.test(u) && !/«صفحهٔ قبلی»/.test(u) };
  });
  chk(info.own.n === 2 && info.own.ownTold && info.own.scanOwn && info.own.noBlindFill, '7: the auto-turn after go on a data-own page never says «fill the fields» blindly ' + JSON.stringify(info.own));

  // ---------- 8) نامِ نماها ----------
  info.names = await p.evaluate(() => ({ none: ['lprob', 'idea', 'sources', 'psy_item'].filter(v => APP.viewLabel(v) === 'صفحهٔ قبلی'), all: Object.keys(APP.V).filter(v => APP.viewLabel(v) === 'صفحهٔ قبلی'), lab: APP.ASSIST.labelOf('lprob') }));
  chk(!info.names.none.length && !info.names.all.length && info.own.label, '8: lprob/idea/sources/psy_item (and every view) have a real name, never «صفحهٔ قبلی» ' + JSON.stringify(info.names));

  // ---------- 9/19) ربطِ واقعی ----------
  await newSess();
  info.rel = await p.evaluate(async () => {
    const AS = APP.ASSIST, out = {};
    const sp = 'دخترم یه مسئله داره: «باغچه‌ای مستطیلی دورش ۲۴ متر حصار داره، طولش دو برابر عرضشه، طول و عرض چقدره؟» خودم بلدم، فقط بگو چطوری بهش بگم که زود تموم شه بریم بخوابیم.';
    out.spirit = APP.SYST.related(sp, 4).map(r => r.a.id);
    __q.push(R({ reply: 'اول خودش.' })); await AS.send(sp);
    const kb = (__calls[0].user.split('# دانسته‌های قلمرو')[1] || '').split('\n# ')[0];
    out.noWorked = !/pr_worked_examples/.test(kb);
    out.ethics = APP.SYST.related('همکارم فاکتورهای ناهار رو هر بار بیشتر ثبت می‌کنه. اگه گزارش بدم اخراج می‌شه. درستش چیه؟', 4).map(r => r.a.id);
    out.neg = APP.SYST.related('می‌خوام سرِ حقوقم مذاکره کنم و به توافق برسم؛ از بیکاری می‌ترسم', 4).map(r => r.a.id);
    out.ret = APP.SYST.related('بازیابی و یادآوری برای امتحان مرورِ فاصله‌دار و آزمونِ خود', 4).map(r => r.a.id);
    const s = AS.cur(); AS._turnSession = s; AS.DO.tour_plan({ goal: 'g', facets: [{ key: 'f1', kind: 'claim', title: 'سنجیدنِ ادعای «تبلیغ علتِ رشد بود»', why: 'از یافتهٔ «ادعای پنهان» و «راهِ دانستن: قبل/بعد»' }] });
    out.match = AS.tourMatchAreas(s.tour.facets[0]).map(r => r.a.id);
    return out;
  });
  chk(!info.rel.spirit.includes('pr_worked_examples') && info.rel.noWorked && !info.rel.ethics.length, '9: «دانسته‌های قلمرو» needs a real topical match — nothing for «just tell her» or the colleague case ' + JSON.stringify(info.rel));
  chk(info.rel.neg.includes('sc_negotiation') && info.rel.ret.includes('ln_retrieval'), '9: real matches (named area, two shared words) are still retrieved ' + JSON.stringify(info.rel));
  chk(!info.rel.match.includes('sf_introspection') && !info.rel.match.includes('ln_retrieval'), '19: "matching areas" for a facet use the same relevance rule ' + JSON.stringify(info.rel.match));

  // ---------- 10) «🌱» فقط پس از نشانهٔ واقعی ----------
  await newSess();
  info.will = await p.evaluate(async () => {
    const AS = APP.ASSIST;
    __q.push(R({ reply: 'قاعده نمی‌دهم؛ بیا ببینیم.' })); await AS.send('همکارم فاکتورها رو بیشتر ثبت می‌کنه؛ اگه گزارش بدم اخراج می‌شه. درستش چیه؟');
    const a = /# پس از شکست، نقد یا میلِ رها کردن/.test(__calls[0].user);
    __calls.length = 0; __q.push(R({ reply: 'کوچک‌ترین گام؟' })); await AS.send('باز شکست خوردم، ول می‌کنم');
    const b2 = /# پس از شکست، نقد یا میلِ رها کردن/.test(__calls[0].user);
    const past = !!AS.willSignal({ msgs: [] }, 'بعد از نقدِ مدیرم ایده را رها کردم'), neutral = !!AS.willSignal({ msgs: [] }, 'بعد از ناهار جدولِ ضرب را مرور کنیم');
    return { firstMsg: a, failMsg: b2, past, neutral };
  });
  chk(!info.will.firstMsg && info.will.failMsg && info.will.past && !info.will.neutral, '10: the 🌱 block comes only after a real failure/discouragement signal ' + JSON.stringify(info.will));

  // ---------- 11) حل/ساختنِ مسئله در گفت‌وگو ----------
  await newSess();
  info.chat = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S, out = {};
    __q.push(R({ reply: 'بازنگری‌ات ثبت شد.', actions: [{ do: 'chat_solved', title: 'بیشینهٔ حاصل‌ضرب', statement: 'بیشترین حاصل‌ضربِ اعدادِ مثبتی که جمعشان ۱۰ است.', kind: 'find', lesson: 'تعدادِ اجزا هم مجهول بود؛ همه را بخوان', check: 'با ۳ و ۵ جزء امتحان کردم', newProb: 'اگر جمع S باشد تعدادِ بهینهٔ اجزا چطور به S بستگی دارد؟' }] }));
    await AS.send('حلش کردم: ۴ تا ۲٫۵؛ درسش اینه که تعداد هم مجهول بود');
    // دورِ ۲ (R1): سشنی که به مسئلهٔ بازِ دیگری بسته است بی‌صدا جابه‌جا نمی‌شود — مسئلهٔ حل‌شده را از رکوردها پیدا کن
    const s = AS.cur(), pid = (APP.liveAll().filter(x => x.origin && x.origin.type === 'chat' && x.p.title === 'بیشینهٔ حاصل‌ضرب').pop() || { p: {} }).p.id, r = APP.liveRec(pid), pg = S.get('eprog_' + pid);
    out.rec = !!r && r.origin && r.origin.type === 'chat' && APP.livePhase(pid) === 'done';
    const card = S.all('card', c => c.src === 'chat:solved:' + pid)[0];
    out.card = !!card && card.due === APP.addDays(APP.today(), 1) && /بی‌نگاه/.test(card.q);
    const inv = APP.liveAll().filter(x => x.origin && x.origin.type === 'lprob' && x.origin.id === pid)[0];
    out.inv = !!inv && inv.dormant > APP.today() && (pg.solve.live.made || []).includes(inv.p.id);
    out.notToday = !APP.dueList().some(x => /مسئلهٔ تازه‌ای که خودت ساختی/.test(x.txt));
    window.__day = inv ? inv.dormant : window.__day;
    out.back = APP.dueList().some(x => /مسئلهٔ تازه‌ای که خودت ساختی/.test(x.txt));
    window.__day = APP.addDays(window.__day, -3);
    // بی درس ⇒ ثبت، ولی بازنگری از خودِ کاربر
    __calls.length = 0; __q.push(R({ reply: 'ثبت شد.', actions: [{ do: 'chat_solved', statement: 'کمترین مجموعِ اعدادِ صحیحی که حاصل‌ضربشان ۱۰۰ است.' }] }));
    await AS.send('این یکی هم حل شد');
    const pid2 = (APP.liveAll().filter(x => /حاصل‌ضربشان ۱۰۰/.test(x.p.statement)).pop() || { p: {} }).p.id; out.noLessonPhase = APP.livePhase(pid2); out.noLessonNote = AS.cur().msgs.some(m => m.role === 'sys' && /بازنگری هنوز نیست/.test(m.text));
    out.bad = AS.DO.chat_solved({ statement: 'کوتاه' }); out.badInv = AS.DO.chat_invent({ statement: '' });
    return out;
  });
  chk(info.chat.rec && info.chat.card && info.chat.inv && info.chat.notToday && info.chat.back, '11: a problem solved in chat becomes a live problem with its look-back, a next-day reconstruction card, and the invented problem returns on «امروز» ' + JSON.stringify(info.chat));
  chk(info.chat.noLessonPhase === 'b' && info.chat.noLessonNote && /statement/.test(info.chat.bad) && /statement/.test(info.chat.badInv), '11: without a lesson the page asks the look-back itself; empty statements are refused ' + JSON.stringify(info.chat));
  info.bind = await p.evaluate(() => {
    const AS = APP.ASSIST; localStorage.removeItem('lla.assist.cur'); const s = AS.newSession(); s.msgs.push({ role: 'user', text: 'سلام', at: new Date().toISOString() }); APP.S.put(s);
    const before = s.lprob;
    const r = APP.liveCreate('از فرم', 'این مسئله را از فرمِ «🔭» ساختم، نه از دستیار.', 'find'); APP.liveBindSession(r.p.id);
    // دورِ ۲ (R1): مسئلهٔ دومی که از فرم ساخته شد پیوندِ سشنِ بسته به مسئلهٔ باز را عوض نمی‌کند
    const r2 = APP.liveCreate('دومی از فرم', 'مسئلهٔ دومی که از فرم ساختم و نباید پیوند را عوض کند.', 'find'); APP.liveBindSession(r2.p.id);
    return { linked: AS.cur().lprob === r.p.id && before !== r.p.id, kept: AS.cur().lprob === r.p.id };
  });
  chk(info.bind.linked && info.bind.kept, '11: a live problem created while a session is open binds to it (session ↔ problem); a second one does not rebind it ' + JSON.stringify(info.bind));

  // ---------- 12) ضرب‌المثلِ همان مرحله ----------
  info.prov = await p.evaluate(() => {
    const AS = APP.ASSIST, pl = AS.polyaProverbsFor('p'), un = AS.polyaProverbsFor('u'), co = AS.coachLines({ ph: 'p', qs: [], seed: 0 });
    return { pl: pl.length, un: un.length, plQ: (pl[0] || {}).q, inLines: pl.length && co.indexOf(pl[0].q.slice(0, 20)) >= 0, differ: pl.length && un.length && pl[0].q !== un[0].q, limit: /قاعدهٔ خطاناپذیر نیستند/.test(co) };
  });
  chk(info.prov.pl && info.prov.un && info.prov.inLines && info.prov.differ && info.prov.limit, '12: the coach surfaces a Pólya proverb of the matching phase (registry/source), with its limit ' + JSON.stringify(info.prov));

  // ---------- 13) ایده ----------
  await newSess();
  info.idea = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S, out = {};
    __q.push(R({ reply: 'ثبت کردم.', actions: [{ do: 'idea_new', what: 'می‌خوام یه کانالِ آموزشِ آشپزی بزنم' }, { do: 'idea_add', part: 'assumption', t: 'همه وقتِ آشپزی دارند' }] }));
    await AS.send('یه ایده دارم: می‌خوام یه کانالِ آموزشِ آشپزی بزنم');
    out.shape = /"part":"strength\|assumption\|problem\|outside"/.test(__calls[0].user) && /"t":"متنِ بخش"/.test(__calls[0].user) && /"ev":/.test(__calls[0].user) && /idea_counter/.test(__calls[0].user);
    const s = AS.cur(), r = S.get(s.idea), i = r.parts.findIndex(x => x.k === 'assumption');
    __calls.length = 0;
    __q.push(R({ reply: 'فرض عوض شد.', actions: [{ do: 'idea_counter', i, t: 'خواهرم شاغل است و هیچ وقتی برای آشپزی ندارد', nt: 'فقط کسانی که عصرها خانه‌اند وقتِ آشپزی دارند' }, { do: 'idea_case', i }] }));
    await AS.send('ولی خواهرم شاغله و هیچ وقتی نداره؛ فقط کسانی که عصرها خانه‌اند وقتِ آشپزی دارند');
    const r2 = S.get(s.idea), x = r2.parts[i];
    out.revised = x.t === 'فقط کسانی که عصرها خانه‌اند وقتِ آشپزی دارند' && (x.hist || []).length === 1 && (r2.crits || []).length === 1 && r2.crits[0].revised;
    const cs = x.caseId && S.get(x.caseId); out.case = !!cs && cs.src && cs.src.type === 'idea' && cs.src.id === r2.id;
    // فرضِ تازه‌ای که در حرفِ کاربر نیست ⇒ فرض دست نمی‌خورد، نقد می‌ماند و از کاربر پرسیده می‌شود
    out.neg = AS.DO.idea_counter({ i, t: 'یک مثالِ دیگر', nt: 'بازار اشباع است و هیچ‌کس پول نمی‌دهد' });
    out.unchanged = S.get(s.idea).parts[i].t === 'فقط کسانی که عصرها خانه‌اند وقتِ آشپزی دارند';
    out.badI = AS.DO.idea_counter({ i: 99, t: 'x' });
    return out;
  });
  chk(info.idea.shape, '13: the idea prompt gives the action shapes (part, t, ev, idea_counter) ' + JSON.stringify(info.idea));
  chk(info.idea.revised && info.idea.case, '13: a counter-case revises the assumption in the user\'s own words (history kept) and the assumption gets a factory case ' + JSON.stringify(info.idea));
    // تورِ پولیا دورِ ۱۲ (L3): یادداشتِ گفت‌وگو برای خودِ کاربر نوشته می‌شود («بازنویسیِ فرض با واژه‌های خودت…») — دستورِ «از او بپرس» به مدل فقط در پرامپت
  chk(/واژه‌های خودت/.test(info.idea.neg) && !/بپرس/.test(info.idea.neg) && info.idea.unchanged && /assumption/.test(info.idea.badI), '13: a rewrite not in the user\'s words is not applied — the note tells the user the rewrite is his (no «بپرس» leak) ' + JSON.stringify(info.idea));

  // ---------- 14) موعدها ----------
  await newSess();
  info.dl = await p.evaluate(() => {
    const AS = APP.ASSIST, S = APP.S, s = AS.cur(); AS._turnSession = s; __rem.length = 0; __unrem.length = 0;
    const tom = APP.addDays(APP.today(), 1), out = {};
    out.bad = AS.DO.deadline({ what: 'امتحانِ آمار', date: tom, time: 'بی‌وقت' });
    AS.DO.deadline({ what: 'امتحانِ آمار', date: tom, time: '۸ صبح' });
    const r = S.all('deadline', x => x.what === 'امتحانِ آمار')[0];
    const t1 = __rem.filter(x => x.key === 'deadline:' + r.id + ':t').pop() || {}, pre = __rem.filter(x => x.key === 'deadline:' + r.id).pop() || {};
    out.time = r.time; out.dayOf = t1.due_date === tom && t1.hour === 7; out.pre = pre.due_date === APP.today();
    __rem.length = 0; AS.DO.remind_hour({ hour: 16 });
    const t2 = __rem.filter(x => x.key === 'deadline:' + r.id + ':t').pop() || {}; out.notMoved = t2.hour === 7;
    // بی ساعت ⇒ همان ساعتِ یادآورها
    AS.DO.deadline({ what: 'تحویلِ پروژه', date: APP.addDays(APP.today(), 5) }); const r2 = S.all('deadline', x => x.what === 'تحویلِ پروژه')[0];
    out.dateOnly = (__rem.filter(x => x.key === 'deadline:' + r2.id).pop() || {}).hour === 16 && !__rem.some(x => x.key === 'deadline:' + r2.id + ':t');
    out.hook = AS.prompt(s, 'x', AS.scan(), '').includes('deadline_done');
    out.done = AS.DO.deadline_done({ what: 'امتحانِ آمار' }) === '' && S.get(r.id).done && __unrem.includes('deadline:' + r.id) && __unrem.includes('deadline:' + r.id + ':t');
    out.doneBad = AS.DO.deadline_done({ what: 'چیزی که نیست' });
    // کارتِ مرور ⇒ یادآور؛ بازسازی گفته می‌شود
    __rem.length = 0; S.all('card').forEach(c => { c.susp = true; S.put(c); });
    APP.newCard('ساده: پایتختِ فرانسه؟', 'پاریس', { due: APP.addDays(APP.today(), 2) });
    const c1 = __rem.filter(x => x.key === 'cards:review').pop() || {}; out.plain = c1.due_date === APP.addDays(APP.today(), 2) && !/بازسازی/.test(c1.body);
    APP.newCard('بازنگری — «حجمِ چهاروجهی»: بی‌نگاه دوباره حلش کن', 'درس', { due: APP.addDays(APP.today(), 2), src: 'tutor:back:p1' });
    const c2 = __rem.filter(x => x.key === 'cards:review').pop() || {}; out.recon = /بازسازی/.test(c2.body) && /بی‌نگاه دوباره بسازش/.test(c2.body) && /۲ کارتِ مرور/.test(c2.body);
    return out;
  });
  chk(/خوانا نیست/.test(info.dl.bad) && info.dl.time === '08:00' && info.dl.dayOf && info.dl.pre && info.dl.notMoved && info.dl.dateOnly, '14: a time-of-day deadline reminds before the time; remind_hour never moves it past the time ' + JSON.stringify(info.dl));
  chk(info.dl.hook && info.dl.done && /نیست/.test(info.dl.doneBad), '14: the assistant can mark a deadline done (reminders removed) ' + JSON.stringify(info.dl));
  chk(info.dl.plain && info.dl.recon, '14: review cards get a push, and a reconstruction card asks to rebuild without looking ' + JSON.stringify(info.dl));

  // ---------- 15) وجهِ ایستاده ⇒ یادآور روی نردبانِ سامانه ----------
  await newSess();
  info.stall = await p.evaluate(() => {
    const AS = APP.ASSIST, S = APP.S, s = AS.cur(); s.msgs.push({ role: 'user', text: 'x', at: new Date().toISOString() }); S.put(s); AS._turnSession = s;
    AS.DO.tour_plan({ goal: 'g', facets: [{ key: 'f1', kind: 'knot', title: 'گیرِ آمار' }] });
    const f = s.tour.facets[0], d0 = APP.today(); f.startedAt = d0 + 'T08:00:00.000Z'; delete f.prog;
    __rem.length = 0; __unrem.length = 0;
    const w = AS.tourStallSync(s), keys = __rem.filter(x => /^tourstall:/.test(x.key)).map(x => x.due_date);
    const out = { first: keys.join(','), want: [APP.addDays(d0, 1), APP.addDays(d0, 3)].join(','), body: (__rem[0] || {}).body || '' };
    // ۹ روز بعد، هنوز بی پیشرفت ⇒ پلهٔ بعدِ نردبان (۲۱)، نه هر روز
    window.__day = APP.addDays(d0, 9); __rem.length = 0; AS.tourStallSync(s);
    out.later = __rem.filter(x => /^tourstall:/.test(x.key)).map(x => x.due_date).join(','); out.laterWant = [APP.addDays(d0, 21), APP.addDays(d0, 60)].join(',');
    out.unrem = __unrem.filter(k => /^tourstall:/.test(k)).length;
    // پیشرفت ⇒ از نو از امروز
    const kc = { id: 'kc_st1', type: 'kcase', title: 'افتادنِ آمار', knots: [], root: {}, premise: {}, created: new Date().toISOString() }; S.put(kc); AS.DO.tour_link({ facet: 'f1', id: 'kc_st1' });
    __rem.length = 0; AS.tourStallSync(s); out.reset = __rem.filter(x => /^tourstall:/.test(x.key)).map(x => x.due_date)[0] === APP.addDays(window.__day, 1);
    window.__day = d0;
    // تمرینِ خودِ وجه در همان روز ⇒ یادآورِ جدا نه
    const s2 = AS.newSession(); s2.msgs.push({ role: 'user', text: 'y', at: new Date().toISOString() }); S.put(s2); AS._turnSession = s2;
    AS.DO.tour_plan({ goal: 'g2', facets: [{ key: 'f1', kind: 'learn', title: 'احتمال' }] });
    const tp = { id: 'tp_st1', type: 'topic', title: 'احتمال', created: new Date().toISOString() }; S.put(tp); AS.DO.tour_link({ facet: 'f1', id: 'tp_st1' });
    S.put({ id: 'card_st1', type: 'card', topic: 'tp_st1', q: 'q', a: 'a', due: APP.addDays(d0, 1) });
    s2.tour.facets[0].startedAt = d0 + 'T08:00:00.000Z'; delete s2.tour.facets[0].prog;
    __rem.length = 0; AS.tourStallSync(s2); out.skipOwn = !__rem.some(x => /^tourstall:/.test(x.key) && x.due_date === APP.addDays(d0, 1));
    return out;
  });
  chk(info.stall.first === info.stall.want && /پیشرفتی نداشته/.test(info.stall.body), '15: a stalled facet gets reminders on the system\'s own ladder (1, 3 days) ' + JSON.stringify(info.stall));
  chk(info.stall.later === info.stall.laterWant && info.stall.unrem >= 1 && info.stall.reset && info.stall.skipOwn, '15: later rungs follow, progress resets the ladder, and a day with the facet\'s own practice gets no extra nudge ' + JSON.stringify(info.stall));

  // ---------- 16) next:true پس از سقفِ نوبت‌ها ----------
  await newSess();
  info.next = await p.evaluate(async () => {
    const AS = APP.ASSIST, views = ['home', 'review', 'topics', 'moves', 'kcases', 'e_cases', 'home', 'review', 'topics', 'moves'];
    for (let i = 0; i < 10; i++) __q.push(R({ reply: 'بعدی را باز می‌کنم.', next: true, actions: [{ do: 'go', view: views[i] }] }));
    await AS.send('همه را یکی‌یکی باز کن');
    const withNext = __calls.length, said = AS.cur().msgs.some(m => m.role === 'sys' && /بنویس «ادامه»/.test(m.text));
    localStorage.removeItem('lla.assist.cur'); AS.newSession(); __calls.length = 0; __q.length = 0;
    for (let i = 0; i < 10; i++) __q.push(R({ reply: 'باز شد.', next: false, actions: [{ do: 'go', view: views[i] }] }));
    await AS.send('برو');
    return { withNext, said, without: __calls.length };
  });
  chk(info.next.withNext === 8 && info.next.said && info.next.without === 5, '16: a next:true promise after the auto-turn cap still gets its turn (up to 3 more), then the user is told to say «ادامه» ' + JSON.stringify(info.next));

  // ---------- 17) قدمِ ناموجود ----------
  await newSess();
  info.sub = await p.evaluate(async () => {
    const AS = APP.ASSIST, cs = APP.newCase({ title: 'آیا تبلیغ مؤثر بود؟', input: 'فروش ۳۰٪ بالا رفت' });
    __q.push(R({ reply: 'می‌برمت.', actions: [{ do: 'go', view: 'e_case', arg: cs.id, sub: 'st_verdict' }] }));
    __q.push(R({ reply: 'این ایستگاه باز شد.' }));
    await AS.send('برو ایستگاهِ حکم');
    const u = (__calls[1] || {}).user || '', s = AS.cur();
    const out = { sub: APP.state.sub, told: /قدم\/برگهٔ «st_verdict» در «[^»]+» نیست؛ آنچه باز شد: «ایستگاهِ «/.test(u), notClaimed: !/\(قدم\/برگهٔ st_verdict\) باز شد/.test(u), sys: s.msgs.some(m => m.role === 'sys' && /st_verdict/.test(m.text) && /نیست/.test(m.text)) };
    __calls.length = 0; __q.push(R({ reply: 'گزارش.', actions: [{ do: 'go', view: 'e_case', arg: cs.id, sub: 'report' }] })); __q.push(R({ reply: 'باز شد.' }));
    await AS.send('گزارشش رو باز کن');
    out.valid = APP.state.sub === 'report' && !/⚠ قدم/.test((__calls[1] || {}).user || '');
    return out;
  });
  chk(info.sub.sub === null && info.sub.told && info.sub.notClaimed && info.sub.sys && info.sub.valid, '17: a non-existent station sub is reported honestly with what actually opened; a valid sub still opens ' + JSON.stringify(info.sub));

  // ---------- 18) فرمول در حبابِ گفت‌وگو ----------
  await newSess();
  await p.evaluate(() => { __q.push(R({ reply: 'درست است: dy/dt = −5/(16π) یعنی با سرعتِ ثابت پایین می‌آید.' })); });
  await say('dV/dt = (πy²/9)·dy/dt. با dV/dt = −5 و y = 12: dy/dt = …');
  info.bidi = await p.evaluate(() => {
    const msgs = Array.from(document.querySelectorAll('.as-panel .as-msg .as-tx'));
    const u = msgs.find(x => /πy²/.test(x.textContent)), a = msgs.find(x => /dy\/dt = −5\/\(16π\)/.test(x.textContent));
    const bd = u ? Array.from(u.querySelectorAll('bdi[dir="ltr"]')).map(x => x.textContent) : [];
    const plain = Array.from(document.querySelectorAll('.as-panel .as-msg .as-tx')).filter(x => !/[A-Za-z0-9]/.test(x.textContent)).every(x => !x.querySelector('bdi'));
    return { bd, rtl: u && u.getAttribute('dir') === 'rtl', ai: a ? a.querySelectorAll('bdi').length : 0, plain, same: u && u.textContent === 'dV/dt = (πy²/9)·dy/dt. با dV/dt = −5 و y = 12: dy/dt = …' };
  });
  chk(info.bidi.rtl && info.bidi.bd.includes('dV/dt = (πy²/9)·dy/dt') && info.bidi.bd.includes('dV/dt = −5') && info.bidi.bd.includes('y = 12') && info.bidi.ai >= 1 && info.bidi.plain && info.bidi.same, '18: LTR formula runs in chat bubbles are isolated in <bdi dir="ltr"> and the text is unchanged ' + JSON.stringify(info.bidi));

  // ---------- 20) پیوستِ CSV ⇒ نمودار در حباب (A.MIND.csvBlock)؛ منفی: پیوستِ غیرِ CSV و نبودِ A.MIND ----------
  await newSess();
  info.csv = await p.evaluate(async () => {
    const AS = APP.ASSIST, had = APP.MIND, calls = [];
    APP.MIND = Object.assign({}, had || {}, { csvBlock: (name, text) => { calls.push([name, text]); const d = document.createElement('div'); d.className = 'csv-plot'; d.setAttribute('data-file', name); return d; } });
    __q.push(R({ reply: 'دیدم.' }));
    await AS.send('این داده‌های فروشه', [new File(['ماه,فروش\nفروردین,10\nاردیبهشت,14\n'], 'sales.csv', { type: 'text/csv' }), new File(['hello'], 'note.txt', { type: 'text/plain' })]);
    AS.toggle(true); await new Promise(r => setTimeout(r, 50));
    const blocks = Array.from(document.querySelectorAll('.as-panel .as-msg .csv-plot')).map(x => x.getAttribute('data-file'));
    const out = { calls: calls.length, first: calls[0] && calls[0][0], text: calls[0] && /اردیبهشت,14/.test(calls[0][1]), blocks };
    APP.MIND = undefined; AS.toggle(false); AS.toggle(true); await new Promise(r => setTimeout(r, 50));
    out.noMind = document.querySelectorAll('.as-panel .as-msg .csv-plot').length;
    APP.MIND = had; return out;
  });
  chk(info.csv.calls >= 1 && info.csv.first === 'sales.csv' && info.csv.text && info.csv.blocks.length === 1 && info.csv.blocks[0] === 'sales.csv' && info.csv.noMind === 0, '20: a CSV attachment in chat is drawn with A.MIND.csvBlock (the .txt is not); without A.MIND nothing is drawn ' + JSON.stringify(info.csv));

  // ---------- 6b) مرحلهٔ ضعیف به‌صورتِ احتمال (A.MIND.phases)؛ منفی: بی‌داده هیچ ----------
  info.weak = await p.evaluate(() => {
    const AS = APP.ASSIST, had = APP.MIND;
    const rows = [['und', 'فهمِ مسئله', .1], ['plan', 'طرح‌ریزی', .6], ['exec', 'اجرای طرح', .2], ['back', 'بازنگری', .1]].map(x => ({ id: x[0], fa: x[1], pWeak: x[2], k: 1, n: 3 }));
    APP.MIND = Object.assign({}, had || {}, { phases: () => ({ n: 12, rows }) });
    const a = AS.coachLines({ ph: 'p', qs: [] });
    APP.MIND = Object.assign({}, had || {}, { phases: () => ({ n: 0, rows: rows.map(r => Object.assign({}, r, { pWeak: .25 })) }) });
    const b = AS.coachLines({ ph: 'p', qs: [] });
    APP.MIND = had;
    return { prob: /طرح‌ریزی — احتمالِ ضعیف‌ترین بودن ۶۰٪/.test(a), noLabel: /برچسب نزن/.test(a) && !/تو در [^ ]+ ضعیفی/.test(a), empty: !/احتمالِ ضعیف‌ترین بودن/.test(b) };
  });
  chk(info.weak.prob && info.weak.noLabel && info.weak.empty, '6b: the weakest solving phase reaches the coach as a probability from A.MIND.phases, never a label; no data ⇒ nothing ' + JSON.stringify(info.weak));

  // ---------- 12b) ثبت‌گاهِ APP.HEUR_WISDOM هم خوانده می‌شود ----------
  info.wis = await p.evaluate(() => {
    const AS = APP.ASSIST, hp = APP.POLYA_PROVERBS, hw = APP.HEUR_WISDOM;
    APP.POLYA_PROVERBS = undefined; APP.HEUR_WISDOM = [{ id: 'W1', ph: 'p2', t: 'دو کمان داشته باش', q: 'طرحِ دومت چیست؟' }, { id: 'W2', ph: 'b', t: 'با دو لنگر', q: 'از راهِ دیگر وارسی؟' }];
    const p = AS.polyaProverbsFor('p'), bb = AS.polyaProverbsFor('b');
    APP.POLYA_PROVERBS = hp; APP.HEUR_WISDOM = hw;
    return { p: p.map(x => x.q), pAsk: p[0] && p[0].ask, b: bb.map(x => x.q) };
  });
  chk(info.wis.p.length === 1 && info.wis.p[0] === 'دو کمان داشته باش' && info.wis.pAsk === 'طرحِ دومت چیست؟' && info.wis.b[0] === 'با دو لنگر', '12b: APP.HEUR_WISDOM is read at the matching phase (plan ≠ look-back) ' + JSON.stringify(info.wis));

  console.log(JSON.stringify(info, null, 1).slice(0, 6000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
