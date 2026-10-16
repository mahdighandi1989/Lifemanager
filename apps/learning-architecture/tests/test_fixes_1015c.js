// بازبینیِ متقابلِ ۲۰۲۶-۱۰-۱۵ (یافته‌های تأییدشده): ایمنی فقط با انکارِ صریحِ خودِ کاربر خاموش می‌شود؛ داوریِ پرونده با خودِ کاربر؛
// عقب‌افتاده در صدرِ یادآور؛ دوباره‌سنجی با مقیاسِ فرم؛ معلمِ حل برای هر مسئله جدا؛ واژه‌نامهٔ ایمنیِ منفعل؛ «امروز» با safetyActive؛
// پدرِ «منبع‌ها»؛ واژه‌نامهٔ ایمیل؛ دروازهٔ پرسش‌های بدهکار (F9/F7). هر بخش یک جهشِ زندهٔ پیشین را هم می‌کشد (M7، M9، M12، M15).
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
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- ۱) ایمنی: مدل به‌تنهایی خاموش نمی‌کند؛ ایمیل ---------- */
  info.safe = await p.evaluate(async () => {
    const A = APP, S = A.S, AS = A.ASSIST, o = {};
    S.loaded = true; window.__q = []; window.__calls = [];
    A.HOST = { report: async () => ({ id: 'x', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ ok: true }) };
    A.callAI = async (sys, user, opts) => { __calls.push({ sys, user }); const t = __q.shift(); if (t === undefined) throw new Error('no answer'); const text = typeof t === 'string' ? t : JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
    const s0 = AS.newSession(); S.put(s0);
    // همان نوبتِ نشانه: مدل «رد شد» می‌گوید و کاربر هرگز انکار نکرده ⇒ هنوز فعال، لایه «باید پرسید»
    __q.push({ reply: 'متأسفم که این‌قدر سخت است.', status: 'related', actions: [
      { do: 'tour_plan', goal: 'قبولی در آمار', facets: [{ key: 'f1', kind: 'knot', title: 'ترس از امتحانِ آمار' }] },
      { do: 'tour_diag', layers: [{ id: 'safety', st: 'no', why: 'به نظر می‌رسد حالش خوب است' }] }] });
    await AS.send('سه بار آمار را افتادم و دیگه نمی‌خوام زنده باشم');
    const s = AS.cur(); const at0 = s.safetyAt;
    o.flag = !!at0; o.activeSameTurn = AS.safetyActive(s) === true; o.heldAsk = s.tour.diag.safety && s.tour.diag.safety.st === 'ask';
    o.heldNote = s.msgs.some(m => m.role === 'sys' && /ایمنی خاموش نشد/.test(m.text));
    o.hookOn = /# ایمنی \(فعال\)/.test(AS.prompt(s, 'سلام', AS.scan()));
    let rep = await A.REPORT.build(s, []);
    o.mailCrisis = /پیش از هر چیز/.test(rep.html); o.mailNoDistress = !/زنده باشم/.test(rep.html); o.mailNoTranscript = !/💬 گفت‌وگو \(فشرده\)/.test(rep.html);
    o.gloss = /<b>لایه<\/b> = /.test(rep.html) && /<b>سازه<\/b> = /.test(rep.html);
    // جملهٔ ساختگی (نقلی که کاربر نگفته) ⇒ هنوز فعال
    __q.push({ reply: 'خوشحالم.', status: 'related', actions: [{ do: 'tour_diag', layers: [{ id: 'safety', st: 'no', why: 'کاربر گفت «حالم خوب است»' }] }] });
    await AS.send('امروز کمی بهترم ولی هنوز می‌ترسم');
    o.fakeQuote = AS.safetyActive(s) === true;
    // انکارِ صریحِ خودش؛ همان انکار نشانه را تازه نمی‌کند؛ مدل «رد شد» با نقلِ عینی ⇒ خاموش
    __q.push({ reply: 'ممنون که گفتی.', status: 'related', actions: [{ do: 'tour_diag', layers: [{ id: 'safety', st: 'no', why: 'کاربر صریحاً گفت: «قصدِ خودکشی ندارم»' }] }] });
    await AS.send('نه، قصدِ خودکشی ندارم؛ فقط از امتحان می‌ترسم');
    o.notBumped = s.safetyAt === at0; o.cleared = AS.safetyActive(s) === false; o.hookOff = !/# ایمنی \(فعال\)/.test(AS.prompt(s, 'سلام', AS.scan()));
    rep = await A.REPORT.build(s, []);
    o.mailNoCrisisAfter = !/پیش از هر چیز/.test(rep.html);
    // «نه، …» که خودش نشانهٔ تازه دارد ⇒ نشانه تازه می‌شود و دوباره فعال
    __q.push({ reply: 'می‌شنوم.', status: 'related', actions: [] });
    await AS.send('نه، راستش دیگه نمی‌خوام زنده باشم');
    o.reFlag = s.safetyAt !== at0 && AS.safetyActive(s) === true;
    return o;
  });
  chk(Object.values(info.safe).every(Boolean), 'safety: the model alone never clears; only the user\'s own later explicit denial, quoted verbatim; e-mail crisis block/transcript follow it: ' + JSON.stringify(info.safe));

  /* ---------- ۱ب) جهشِ M7: هر حکمِ دیگرِ پسین (پیدا شد/باید پرسید) خاموش نمی‌کند؛ «امروز» با safetyActive (یافتهٔ ۹) ---------- */
  info.m7 = await p.evaluate(async () => {
    const A = APP, S = A.S, AS = A.ASSIST, o = {};
    const y = A.addDays(A.today(), -1);
    const s = { id: 'achat_m7', type: 'achat', title: 'آزمونِ ایمنی', msgs: [{ role: 'user', text: 'دیگه نمی‌خوام زنده باشم', at: y + 'T08:00:00.000Z', seq: 1 }, { role: 'user', text: 'نه، فکرِ آسیب ندارم', at: y + 'T09:00:00.000Z', seq: 2 }],
      seq: 2, safetyAt: y + 'T08:00:01.000Z', safetySeq: 1, tour: { goal: 'x', facets: [], diag: {} } };
    S.put(s);
    const set = st => { s.tour.diag.safety = { st, why: 'کاربر گفت: «نه، فکرِ آسیب ندارم»', at: y + 'T09:00:05.000Z', seq: 2 }; S.put(s); };
    const help = () => A.dueList().filter(x => /حالت امروز چطور است/.test(x.txt)).length;
    set('found'); o.found = AS.safetyActive(s) === true; const nFound = help();
    set('ask'); o.ask = AS.safetyActive(s) === true;
    set('out'); o.out = AS.safetyActive(s) === true;
    set('no'); o.no = AS.safetyActive(s) === false; const nNo = help();
    o.today = nFound === nNo + 1;
    // «رد شد» که فقط پیامِ نشانه را نقل می‌کند (نه انکار) ⇒ فعال
    s.tour.diag.safety = { st: 'no', why: '«دیگه نمی‌خوام زنده باشم» را شوخی گرفت', at: y + 'T09:00:05.000Z', seq: 2 }; o.quoteDistress = AS.safetyActive(s) === true;
    // حکمِ پیش از پیامِ انکار (seq کمتر) ⇒ فعال
    s.tour.diag.safety = { st: 'no', why: 'کاربر گفت: «نه، فکرِ آسیب ندارم»', at: y + 'T08:30:00.000Z', seq: 1 }; o.beforeDenial = AS.safetyActive(s) === true;
    S.del ? S.del('achat_m7') : (s.tour.diag.safety.st = 'found', S.put(s));
    return o;
  });
  chk(Object.values(info.m7).every(Boolean), 'safety: only a later "no" quoting the user\'s own denial clears it (found/ask/out never); Today asks only while active: ' + JSON.stringify(info.m7));

  /* ---------- ۸) واژه‌نامهٔ ایمنی: اندیشهٔ منفعل + آزمون‌های منفی + انکار ---------- */
  info.lex = await p.evaluate(() => {
    const A = APP, hit = t => A.knotSafetyHit(t);
    const pos = ['بهتره دیگه زنده نباشم', 'بهتره نباشم', 'بهتره‌ نباشم', 'بهتر است دیگر نباشم', 'همه بدون من راحت‌ترن', 'همه بدونِ من راحت تر هستن', 'خانواده‌ام بی من خوشبخت‌ترند',
      'به رگ زدن فکر می‌کنم', 'به رگ‌زدن فکر میکنم', 'زندگی ارزش ادامه دادن نداره', 'زندگی دیگه ارزشش رو نداره', 'دیگه نمی‌خوام ادامه بدم به زندگی', 'نمیخوام به زندگی ادامه بدم', 'نمی‌تونم زندگی رو ادامه بدم'];
    const neg = ['بهتره فردا سر کلاس نباشم', 'بهتره اونجا نباشم', 'پروژه بدون من بهتر پیش میره', 'همه بدون من رفتن سینما', 'این کار ارزش ادامه دادن نداره', 'دیگه نمی‌خوام این پروژه رو ادامه بدم',
      'زندگی ارزش‌های زیادی دارد', 'رگ‌های برگ را کشیدم', 'بزرگ زدن', 'بهتره زودتر بخوابم', 'می‌خوام به کارم ادامه بدم', 'زندگی‌ام را دوست دارم'];
    const deny = ['نه', 'نه، خوبم', 'قصدِ خودکشی ندارم', 'فکرِ آسیب ندارم', 'به خودم آسیب نمی‌زنم', 'در خطر نیستم', 'منظورم خودکشی نبود'];
    const notDeny = ['خیلی خسته‌ام', 'دیگه نمی‌خوام زنده باشم', 'امروز بد بود', 'نهایتاً قبول شدم'];
    return { pos: pos.filter(t => !hit(t)), neg: neg.filter(hit), deny: deny.filter(t => !A.knotSafetyDenial(t).length), notDeny: notDeny.filter(t => A.knotSafetyDenial(t).length),
      strip: !hit(A.knotSafetyStripDenial('قصدِ خودکشی ندارم')) && hit(A.knotSafetyStripDenial('نه، دیگه نمی‌خوام زنده باشم')) };
  });
  chk(!info.lex.pos.length && !info.lex.neg.length && !info.lex.deny.length && !info.lex.notDeny.length && info.lex.strip, 'safety lexicon (passive ideation / negatives / denial): ' + JSON.stringify(info.lex));

  /* ---------- ۲) داوریِ پرونده با خودِ کاربر ---------- */
  info.verdict = await p.evaluate(async () => {
    const A = APP, S = A.S, AS = A.ASSIST, o = {};
    const J = A.epiJudgment('st_final'); o.finalSet = ['final', 'conclusion', 'shift', 'act', 'verdict'].every(k => J.fields.indexOf(k) >= 0) && J.fields.indexOf('check') < 0 && J.fields.indexOf('revdate') < 0;
    o.intakeFree = A.epiJudgment('st_intake').fields.indexOf('verdict') < 0;
    const H = A.epiJudgment('st_hiss'); o.hiss = H.fields.indexOf('verdict') >= 0 && H.cols.indexOf('grades.p') >= 0 && H.cols.indexOf('grades.c') < 0;
    o.resp = A.epiJudgment('st_resp').fields.indexOf('status') >= 0;
    const c = A.newCase({ title: 'قهوه حافظه را بهتر می‌کند', input: 'دوستم گفت هر بار قهوه خورد امتحانش بهتر شد' });
    c.st.st_tasdiq = { data: { claims: [{ txt: 'قهوه حافظه را بهتر می‌کند' }] }, done: true, rubric: [] }; S.put(c);
    A.go('e_case', c.id, 'st_final'); await new Promise(r => setTimeout(r, 300));
    const sc = AS.scan(), F = re => sc.fields.filter(f => re.test(f.label))[0];
    const pct = F(/احتمال صدق نهایی/), stt = F(/^وضعیت/), concl = F(/حکم در یک بند/), verd = F(/حکم این ایستگاه/), check = F(/چه مشاهده/);
    o.found = !!(pct && stt && concl && verd && check);
    if (!o.found) return o;
    const res = await AS.run([{ do: 'fill', k: pct.k, value: '90' }, { do: 'fill', k: stt.k, value: 'ظن معتبر' }, { do: 'fill', k: concl.k, value: 'قهوه حافظه را بهتر می‌کند.' }, { do: 'fill', k: verd.k, value: 'پرونده بسته شد: حکم و اقدام روشن است' }, { do: 'fill', k: check.k, value: 'یک آزمونِ کور با دارونما' }]);
    o.notes = res.notes.filter(n => /داوری است و فقط با خودِ تو/.test(n)).length === 4;
    const d = S.get(c.id).st.st_final.data;
    o.untouched = !(d.final && d.final[0] && (d.final[0].p != null && d.final[0].p !== '' || d.final[0].st)) && !d.conclusion && !d.verdict;
    o.checkFilled = d.check === 'یک آزمونِ کور با دارونما';
    o.yellow = !!document.querySelector('#main .as-hl[data-as-why*="داوری با خودِ توست"]');
    // ردیفِ تازهٔ جدول هم محافظت می‌شود (MutationObserver)
    const fin = document.querySelector('#main .fld[data-k="final"]'); o.ownBox = fin && fin.getAttribute('data-own') === 'verdict';
    o.hook = /# داوری با کاربر/.test(AS.prompt(AS.cur() || AS.newSession(), 'درجه را بگذار', AS.scan()));
    return o;
  });
  chk(Object.values(info.verdict).every(Boolean), 'factory case: verdict/degree fields are owner-only (assistant fill refused with a clear note), follow-up fields still fillable: ' + JSON.stringify(info.verdict));

  /* ---------- ۳) یادآور: عقب‌افتاده در صدر، حتی وقتی فردا پوشیده است (جهشِ M9) ---------- */
  info.od = await p.evaluate(() => {
    const A = APP, S = A.S, AS = A.ASSIST, o = {}; window.__rem = [];
    A.HOST = Object.assign({}, A.HOST, { remind: async (pl) => { __rem.push(pl); return { ok: true }; }, unremind: async () => ({ ok: true }) });
    const tom = A.addDays(A.today(), 1);
    const st0 = S.settings(); st0.knots = st0.knots || {}; st0.knots.notify = { telegram: true, email: true }; st0.knots.rk = {}; S.saveSettings(st0);
    S.put({ id: 'kn_od', type: 'knot', name: 'کمال‌گرایی در نوشتن', fam: 'F7', status: 'practised', solvedAt: A.addDays(A.today(), -35) + 'T10:00:00Z', log: [] });
    S.put({ id: 'ki_od1', type: 'kitem', knot: 'kn_od', due: A.addDays(A.today(), -3), q: 'x' });
    S.put({ id: 'ki_od2', type: 'kitem', knot: 'kn_od', due: A.addDays(A.today(), 4), q: 'y' });
    const mk = id => { const s = { id, type: 'achat', title: 'پایان‌نامه', msgs: [], tour: { goal: 'نوشتن', facets: [{ key: 'f1', kind: 'knot', title: 'کمال‌گرایی', status: 'now', refs: [{ type: 'knot', id: 'kn_od' }] }], diag: {} } }; S.put(s); return s; };
    __rem.length = 0; AS.tourSyncReminder(mk('achat_od1')); const r1 = __rem[0] || {};
    o.lead1 = /^۲ تمرینِ عقب‌افتاده؛ کهنه‌ترین: «🔁 سنجشِ ماندگاری/.test(r1.body || '') && r1.due_date === tom;
    // فردا با یادآورِ ورزشِ گره پوشیده است ⇒ عقب‌افتاده باز هم می‌آید، روزِ بی‌یادآورِ بعدی
    // (کارزارِ sc4: با پوشیده‌بودنِ فردا یادآور به موعدِ تمرینِ آینده — ماه‌ها بعد — می‌رفت؛ باید پس‌فردا باشد)
    const st = S.settings(); st.knots.rk = { kn_od: tom + 'T09:00' }; S.saveSettings(st);
    __rem.length = 0; AS.tourSyncReminder(mk('achat_od2')); const r2 = __rem[0] || {};
    o.covered = __rem.length === 1 && r2.due_date === A.addDays(A.today(), 2) && /عقب‌افتاده/.test(r2.body || '') && /^۲ تمرینِ عقب‌افتاده/.test(r2.body || '');
    o.b1 = r1.body; o.b2 = r2.body;
    const st2 = S.settings(); st2.knots.rk = {}; S.saveSettings(st2);
    return o;
  });
  chk(info.od.lead1 && info.od.covered, 'overdue practice leads the tour reminder (oldest first) and survives a covered tomorrow: ' + JSON.stringify(info.od));

  /* ---------- ۴) دوباره‌سنجی با مقیاسِ فرم (جهشِ M12) ---------- */
  await p.evaluate(() => {
    const A = APP, S = A.S, AS = A.ASSIST;
    S.put({ id: 'kn_rm', type: 'knot', name: 'ترس از ارائه', fam: 'F7', status: 'practised', log: [] });
    S.put({ id: 'kc_rm', type: 'kcase', title: 'ارائهٔ کلاس', created: A.addDays(A.today(), -60) + 'T10:00:00Z', kinds: [], knots: ['kn_rm'], intake: { stmts: [], freq: 'often', emo: 7 }, status: 'done', step: 's4' });
    AS._turnSession = AS.cur() || AS.newSession();
    window.__rm = { empty: AS.DO.remeasure({ knot: 'kn_rm' }), emptyStr: AS.DO.remeasure({ knot: 'kn_rm', freq: '', intensity: '', note: '' }), big: AS.DO.remeasure({ knot: 'kn_rm', intensity: 11 }), neg: AS.DO.remeasure({ knot: 'kn_rm', intensity: -1 }),
      frac: AS.DO.remeasure({ knot: 'kn_rm', intensity: 3.5 }), freq: AS.DO.remeasure({ knot: 'kn_rm', freq: 'هفته‌ای سه بار' }), ok: AS.DO.remeasure({ knot: 'kn_rm', freq: 'گاهی', intensity: '۳' }) };
    APP.go('knot', 'kn_rm', 'cases');
  });
  await sleep(200);
  info.rm = await p.evaluate(() => {
    const r = window.__rm, k = APP.S.get('kn_rm'), txt = (document.querySelector('#main .kn-remeasure') || {}).textContent || '';
    return { empty: r.empty === 'دوباره‌سنجی خالی است' && r.emptyStr === 'دوباره‌سنجی خالی است', scale: [r.big, r.neg, r.frac].every(x => /۰ تا ۱۰/.test(x)), freq: /مقیاسِ فرم/.test(r.freq) && /یک‌بار، گاهی، مرتب/.test(r.freq),
      ok: r.ok === '' && (k.remeasures || []).length === 1 && k.remeasures[0].intensity === 3 && k.remeasures[0].freqId === 'some', shown: /ثبتِ نخست: مرتب · شدت ۷ از ۱۰ ← اکنون: گاهی · شدت ۳ از ۱۰/.test(txt), txt };
  });
  chk(info.rm.empty && info.rm.scale && info.rm.freq && info.rm.ok && info.rm.shown, 're-measure validated against the knot form scale and shown next to the original intake: ' + JSON.stringify(info.rm));

  /* ---------- ۵) معلمِ حل: شمارهٔ پرسش برای هر مسئله؛ نوبتِ خودکار مرحله را پس از «حل شد» عوض نمی‌کند ---------- */
  info.tutor = await p.evaluate(async () => {
    const A = APP, S = A.S, AS = A.ASSIST, o = {}, TQ = AS.tutorQuestions;
    const [P1, P2] = window.EPI_PROBLEMS; [P1, P2].forEach(P => S.put({ id: 'eprob_' + P.id, type: 'eprob', status: 'approved', p: P }));
    const s = AS.newSession(); S.put(s);
    const at = async pid => { A.simState = null; A.go('e_prob', pid, 'sim'); await new Promise(r => setTimeout(r, 150)); };
    const ask = (msg) => { const t = AS.prompt(s, msg, AS.scan()); const m = t.match(/پرسشِ پیشنهادیِ این نوبت: «([^»]+)»/); return { q: m ? m[1] : '', ph: (t.match(/مرحله: ([^\n]+)/) || [])[1] || '' }; };
    // D2 (تورِ پولیا دورِ ۳): پرسشِ بعد به پلهٔ کاربر در همین مسئله (پرسیده و پاسخ‌گرفته)، نه به شمارِ پیام
    const said = (role, text) => { s.msgs.push({ role, text, at: new Date(Date.now() + s.msgs.length).toISOString() }); };
    await at(P1.id); ask('الف'); const a2 = ask('ب'); o.noCount = a2.q === TQ.und.qs[0];
    // DECISIONS_R5 F1: «پاسخ‌گرفته» فقط از گزارشِ سنجیدهٔ مدل (coach_state)، نه از «پیامِ بعدی» — گزارشِ مدل پس از هر پاسخِ کاربر
    const rep = (id) => { AS._turnSession = s; AS.DO.coach_state({ ph: 'u', said: [], ans: [id], stuck: false, fail: false, role: 'self', nat: 'objective' }); };
    said('ai', TQ.und.qs[0]); said('user', 'الف'); rep('u1'); said('ai', TQ.und.qs[1]); said('user', 'ب'); rep('u2');
    const a3 = ask('ج'); o.p1 = a3.q === TQ.und.qs[2];
    await at(P2.id); const b1 = ask('مسئلهٔ دوم را شروع کنم'); o.p2fresh = b1.q === TQ.und.qs[0];
    await at(P1.id); const a4 = ask('حلش کردم!'); o.back = /بازنگری/.test(a4.ph);
    const a5 = ask('[سامانه: کارهایت انجام شد و صفحه دوباره خوانده شد — کارِ بعدی‌ای را که گفتی همین حالا انجام بده]'); o.autoKeeps = /بازنگری/.test(a5.ph) && a5.q === a4.q;
    const a6 = ask('در حالتِ n=1 وارسی کردم'); o.sticky = /بازنگری/.test(a6.ph);
    const a7 = ask('نه، اشتباه بود؛ حل نشد'); o.unstick = !/بازنگری/.test(a7.ph);
    return o;
  });
  chk(Object.values(info.tutor).every(Boolean), 'tutor: per-problem question index; auto-turns keep the look-back phase after «حل شد»: ' + JSON.stringify(info.tutor));

  /* ---------- جهشِ M15: دروازهٔ پیش از فرم F9/F7 را هم نگه می‌دارد، نه فقط ایمنی ---------- */
  info.gate = await p.evaluate(() => {
    const AS = APP.ASSIST, mk = d => ({ id: 'g', type: 'achat', msgs: [], tour: { facets: [], diag: d } });
    return { f9: AS.owedBeforeForms(mk({ F9: { st: 'ask' } })).map(L => L.id).join() === 'F9', f7: AS.owedBeforeForms(mk({ F7: { st: 'ask' } })).map(L => L.id).join() === 'F7',
      safety: AS.owedBeforeForms(mk({ safety: { st: 'ask' } })).map(L => L.id).join() === 'safety', notOthers: AS.owedBeforeForms(mk({ F3: { st: 'ask' }, recur: { st: 'ask' } })).length === 0 };
  });
  chk(Object.values(info.gate).every(Boolean), 'owed-before-forms gate holds safety, F9 and F7 (only): ' + JSON.stringify(info.gate));

  /* ---------- ۱۲) پدرِ «منبع‌ها» ---------- */
  info.sub = await p.evaluate(() => (APP.SUB_VIEWS || {}).sources);
  chk(info.sub === 'maps', '«📚 منبع‌ها و پوشش» opens only from «🗺 نقشه‌ها» ⇒ SUB_VIEWS.sources = maps: ' + info.sub);

  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
