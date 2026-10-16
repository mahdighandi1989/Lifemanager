// تورِ دستهٔ ۱ ِ پولیا — دورِ ۲ ِ اصلاح (G1): تونلِ «🔭 مسئلهٔ حل‌نشدهٔ خودم»، ابزارهای حدس و ثبت‌گاهِ پرسش‌ها — با کنترل‌های واقعیِ صفحه،
// پهنای ۳۹۰، ساعتِ ساختگی. بندها همان تصمیم‌های دورِ ۲ اند (DECISIONS_R2: R2 تکمنبعِ داور، R3 به‌کاررفتنِ صادقانه، R4 دروازه‌های محتوایی،
// R5 بستنِ صادقانه، پرسش‌های نوع‌دار، و ریزه‌های R8 در همین پرونده‌ها). خطا ⇒ کدِ خروجِ غیرصفر.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 390, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const W = (ms) => p.waitForTimeout(ms || 90);
  const T0 = '2026-11-02';
  const D = (n) => { const d = new Date(2026, 10, 2 + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const day = async (n) => { await p.evaluate(x => { window.__day = x; }, D(n)); };
  const go = async (v, a, s) => { await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await W(140); };
  const sel = async (s, v) => { await p.selectOption(s, v); await W(120); };
  const click = async (s) => { await p.click(s); await W(160); };
  const txt = (s) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent : ''; }, s);
  const has = (s) => p.locator(s).count();
  const S = (pid) => p.evaluate(pid => { const pg = APP.S.get('eprog_' + pid); return JSON.parse(JSON.stringify(pg && pg.solve || {})); }, pid);
  const R = (pid) => p.evaluate(pid => JSON.parse(JSON.stringify(APP.S.get('eprob_' + pid))), pid);
  const noOverflow = async (lab) => { const w = await p.evaluate(() => Math.max(document.scrollingElement.scrollWidth, document.body.scrollWidth)); if (w > 392) chk(false, lab + ': horizontal overflow at 390px (' + w + ')'); };
  const bidi = async (lab) => { const bad = await p.evaluate(() => [...document.querySelectorAll('#main .lp-page *')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && /[؀-ۿ]/.test(n.textContent) && /[A-Za-z0-9%]/.test(n.textContent)) && !e.closest('[dir=rtl]')).length); chk(bad === 0, lab + ': mixed Persian/Latin text without an rtl ancestor: ' + bad); };
  const unlabelled = async (scope, lab) => { const r = await p.evaluate(s => [...document.querySelectorAll(s + ' input, ' + s + ' textarea, ' + s + ' select')].filter(e => e.type !== 'radio' && e.type !== 'checkbox' ? !(e.labels && e.labels.length) && !e.getAttribute('aria-label') : !(e.labels && e.labels.length)).map(e => e.id), scope); chk(!r.length, lab + ': unlabelled fields ' + r.join(',')); };
  const hookText = (sess, msg) => p.evaluate(([sess, msg]) => APP.ASSIST.promptHooks.map(f => { try { return f(sess, msg) || ''; } catch (e) { return 'ERR ' + e.message; } }).join('\n'), [sess, msg]);
  const mk = async (o) => {
    await go('e_prob', null, 'live');
    if (o.title != null) await p.fill('#lpNewT', o.title);
    await p.fill('#lpNewS', o.st); await W(60);
    if (o.kind) await sel('#lpNewType', o.kind);
    if (o.nat) await sel('#lpNewNat', o.nat);
    await click('main .lp-create');
    return p.evaluate(() => APP.state.arg);
  };
  const whole = async (one, why) => { await p.fill('#lpOne', one); await p.fill('#lpWhy', why); await click('main .lp-onesave'); };
  // کارتِ فهمِ کامل (با کنترل‌های واقعی) ⇒ «ثبتِ فهم» و خودداوریِ ۲
  const understand = async (o) => {
    await whole(o.one, o.why || 'برایم مهم است و کنجکاوم');
    if (o.nat) await sel('#lpNat', o.nat);
    await p.fill('#lpUnk', o.unk);
    for (let i = 0; i < o.data.length; i++) { if (i >= 2) await click('main .lp-dadd'); await p.fill('#lpD_d' + (i + 1), o.data[i]); }
    await p.fill('#lpCond', o.cond);
    if (await has('#lpSat')) await sel('#lpSat', o.sat || 'yes');
    await sel('#lpSuff', o.suff || 'ناکافی است — چیزی کم است'); await p.fill('#lpSuffW', 'هنوز همه را نمی‌دانم');
    if (o.dep) { await sel('#lpDep', 'yes'); await p.fill('#lpDepW', o.dep); }
    if (o.spatial) { await p.check('#lpSpatial'); await W(160); await p.fill('#lpFigDone', 'شکل را ساخته‌شده فرض می‌کنم و مجهول را روی آن می‌بینم'); await sel('#lpFigGen', 'general'); await p.fill('#lpFigLab', 'a b c روی ضلع‌ها'); }
    if (o.prac) { for (let i = 0; i < o.data.length; i++) await sel('#lpDE_d' + (i + 1), 'big'); await p.fill('#lpPrVague', '«بس» یعنی همان چیزی که لازم است'); await p.fill('#lpPrLine', 'رنگ و برند را بیرون می‌گذارم چون اثری ندارند'); await p.fill('#lpPrApprox', 'دقتِ ده درصد بس است'); await p.fill('#lpPrPrior', 'پارسال همین کار را کردم'); await p.fill('#lpPrMeasure', o.measure || 'حجمِ لازم ≤ ۲۰۰ لیتر'); }
    await p.fill('#lpGuess', o.guess || 'درست است'); await sel('#lpConf', o.conf || '60'); await p.fill('#lpTest', o.test || 'با یک حالتِ خاص می‌آزمایم');
    await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
    await click('main .lp-usave');
    if (o.expectMiss) return txt('main .lp-umiss');
    await click('main .lp-u .sv-g2');
    return '';
  };
  const moveAndPlan = async (plan, extra) => {
    await sel('#lpMv', 'mv_special'); await p.fill('#lpMvWhy', 'اول یک حالتِ کوچک و مشخص را حل می‌کنم تا الگو را ببینم'); await click('main .lp-mvadd');
    await p.fill('#lpPlan', plan); await W(350);
    if (extra) await extra();
    for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'use'); await p.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); }
    await click('main .lp-plansave');
  };
  const objStep = async (text, proof, o) => {
    await p.fill('#lpStep', text); await sel('#lpClear', o && o.clear || 'بله'); if (proof != null && await has('#lpProof')) await p.fill('#lpProof', proof);
    await click('main .lp-stepsave');
  };
  try {
    await p.goto(FILE); await p.waitForSelector('.nav'); await W(300);
    await p.evaluate(T0 => { window.__day = T0; APP.today = () => window.__day; APP.S.loaded = true; window.__rem = []; APP.HOST = Object.assign({}, APP.HOST || {}, { remind: async (pl) => { window.__rem.push(pl); return { ok: true }; }, unremind: async () => ({ ok: true }) }); }, T0);

    /* ===================== R2 — تکمنبعِ داور و فضایی بودن ===================== */
    // پیشنهادِ کد در فرم پیش‌انتخاب و دیده می‌شود؛ دومینو با «ساعت» عملی نیست؛ رقمِ فارسی و عربی
    await go('e_prob', null, 'live');
    const typeAndRead = async (t) => { await p.fill('#lpNewS', t); await W(80); return p.evaluate(() => ({ v: document.getElementById('lpNewNat').value, hint: (document.querySelector('main .lp-newnathint') || {}).textContent || '' })); };
    info.pre = { dom: await typeAndRead('با ۱۸ دومینو در ۶ ساعت چه شکلی می‌شود ساخت؟ معما است.'), chess: await typeAndRead('در شطرنج اسب از گوشه به گوشهٔ دیگر چند حرکت لازم دارد؟'),
      fa: await typeAndRead('لولهٔ ۲۴۰ سانتی‌متری را در ون جا بدهم'), ar: await typeAndRead('مخزنِ ٣٠٠ لیتری برای باغ بخرم'), job: await typeAndRead('شرکتی در شیراز پیشنهادِ کار با حقوقِ ۴۰٪ بیشتر داده؛ بروم یا بمانم؟'), none: await typeAndRead('دربارهٔ معنای زندگی فکر می‌کنم') };
    chk(info.pre.dom.v === 'objective' && info.pre.chess.v === 'objective' && info.pre.fa.v === 'practical' && info.pre.ar.v === 'practical' && info.pre.job.v === 'life' && info.pre.none.v === '' && /پیش‌انتخابِ کد/.test(info.pre.dom.hint) && /خودت برگزین/.test(info.pre.none.hint),
      'R2: the code\'s suggestion is PRE-SELECTED in the form (puzzle/chess ⇒ objective even with «ساعت»; Persian and Arabic digits + unit ⇒ practical; job decision ⇒ life; none ⇒ must choose) ' + JSON.stringify(info.pre));
    await sel('#lpNewType', 'pod');
    chk(await p.evaluate(() => document.getElementById('lpNewNat').value) === 'objective', 'R2: «اثبات یا رد کن» ⇒ objective in the form');
    await sel('#lpNewType', 'find');
    // بی پیشنهاد ⇒ کارتِ فهم انتخابِ صریح می‌خواهد (نه پیش‌فرضِ بی‌صدای «life»)
    const P0 = await mk({ title: 'معنا', st: 'دربارهٔ معنای کارم فکر می‌کنم و به جایی نمی‌رسم.' });
    chk(!(await R(P0)).p.nat, 'R2: no suggestion and no choice ⇒ nothing stored (no silent default)');
    await whole('می‌خواهم بفهمم کارم چه معنایی دارد', 'آرامش');
    chk(await has('main .lp-natneed') === 1 && await p.evaluate(() => document.getElementById('lpNat').value) === '', 'R2: understanding card asks to choose the judge (no pre-filled «life»)');
    await p.fill('#lpUnk', 'معنای کارم'); await p.fill('#lpD_d1', 'هر روز هشت ساعت کار می‌کنم'); await p.fill('#lpCond', 'شغلم را از دست ندهم'); await sel('#lpSat', 'unknown'); await sel('#lpSuff', 'هنوز نمی‌دانم');
    await p.fill('#lpGuess', 'معنا در یاد دادن است'); await sel('#lpConf', '60'); await p.fill('#lpTest', 'یک هفته یاد بدهم');
    await click('main .lp-usave');
    chk(/داورِ این مسئله/.test(await txt('main .lp-umiss')), 'R2: «ثبتِ فهم» refuses without a judge ' + await txt('main .lp-umiss'));
    // مسئلهٔ کامل‌بیان‌شده از فرم: کارتِ فهم آن را پیش‌انتخاب دارد و پیش‌نویسِ کهنه با «life» آن را عوض نمی‌کند
    const P1 = await mk({ title: 'مربعِ پنج نقطه', st: 'پنج نقطه درونِ یک مربعِ واحد داریم (شاید روی مرز). ثابت کن دو نقطه هستند که فاصله‌شان حداکثر نیمِ قطر است.', kind: 'prove' });
    chk((await R(P1)).p.nat === 'objective' && await p.evaluate(pid => APP.liveKind(pid), P1) === 'objective', 'R2: prove ⇒ objective stored on the record');
    await p.evaluate(pid => { const pg = APP.S.get('eprog_' + pid); pg.solve.live.uDraft = { type: 'prove', nat: 'life', one: '', why: '', u: '', dl: [], c: '' }; APP.S.put(pg); }, P1);
    await go('lprob', P1, 'u');
    // دورِ ۳ (D1): پیش‌فرضِ «اثباتی» کامل‌بیان‌شده است ولی قفل نیست (فرضیهٔ زندگی می‌تواند «زندگی» باشد)
    chk(await p.evaluate(() => document.getElementById('lpNat').value) === 'objective' && !(await p.evaluate(() => document.getElementById('lpNat').disabled)) && await has('main .lp-natobj') === 1, 'R2/D1: a stale draft «life» never overrides the stored kind; proof ⇒ objective by default (select not locked)');
    // برچسب‌های «اثباتی» بی واژه‌های یافتنی (R8، s33)
    await whole('می‌خواهم نشان دهم دو نقطه به هم نزدیک‌اند', 'هندسه را دوست دارم');
    info.labels = await p.evaluate(() => ({ dl: document.querySelector('main .lp-dl legend').textContent, c: document.querySelector('label[for="lpCond"]').textContent, rel: document.querySelector('label[for="lpRel"]').textContent }));
    chk(/بخش‌های فرض/.test(info.labels.dl) && !/عدد، منبع/.test(info.labels.dl) && /حکم/.test(info.labels.c) && !/بخش‌های فرض/.test(info.labels.c) && /بخشِ حکم/.test(info.labels.rel), 'R8: proof card labels: hypothesis parts vs conclusion parts (no find words, no duplicate «بخش‌های فرض») ' + JSON.stringify(info.labels));
    // فضایی با انتخاب: «مربع» فقط پیشنهاد است
    chk(!(await p.evaluate(() => document.getElementById('lpSpatial').checked)) && await has('main .lp-spathint') === 1, 'R2: spatial by explicit choice — words only suggest');
    await p.fill('#lpUnk', 'دو نقطه با فاصلهٔ حداکثر نیمِ قطر وجود دارند');
    await p.fill('#lpD_d1', 'پنج نقطه داریم'); await p.fill('#lpD_d2', 'نقطه‌ها داخلِ مربعِ واحدند (شاید روی مرز)'); await click('main .lp-dadd'); await p.fill('#lpD_d3', 'ضلعِ مربع یک است');
    await p.fill('#lpCond', 'دو نقطه وجود دارند\nفاصله‌شان حداکثر نیمِ قطر است');
    await sel('#lpSuff', 'کافی است'); await p.fill('#lpSuffW', 'همهٔ فرض آمده است');
    if (await has('#lpSuffChal')) await p.fill('#lpSuffChal', 'پنج نقطه و چهار تکه همه چیز را معین می‌کنند');
    await p.check('#lpSpatial'); await W(160);
    await p.fill('#lpFigDone', 'مربع را به چهار مربعِ کوچک بخش کرده‌ام و نقطه‌ها درونشان‌اند'); await sel('#lpFigGen', 'general'); await p.fill('#lpFigLab', 'مربع ABCD، نقطه‌ها P1 تا P5');
    await p.fill('#lpGuess', 'درست است'); await sel('#lpConf', '100'); await p.fill('#lpTest', 'پنج نقطه را در گوشه‌ها و مرکز بگذارم'); await p.fill('#lpGChal', 'اگر چینشی بیابم که همهٔ فاصله‌ها بیش از نیمِ قطر باشد');
    // R5: «آزمون را نادیده می‌گیرم» ⇒ واکنشِ پولیا و دلیلِ لازم
    await sel('#lpIfRef', 'آزمون را نادیده می‌گیرم چون حدسم قوی است');
    chk(await has('main .lp-ifrefwarn') === 1 && /B111/.test(await txt('main .lp-ifrefwarn')), 'R5: ignoring the test gets Pólya\'s reaction (Jones, B111)');
    await click('main .lp-usave');
    chk(/چرا ردِ آزمون/.test(await txt('main .lp-umiss')), 'R5: «ignore the test» needs a reason (or the first option)');
    await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
    await click('main .lp-usave'); await click('main .lp-u .sv-g2');
    info.r1 = await R(P1);
    chk(info.r1.p.nat === 'objective' && info.r1.p.spatial === true && info.r1.p.natBy === 'type', 'R2: kind and spatial flag stored on the record at «ثبتِ فهم» ' + JSON.stringify({ nat: info.r1.p.nat, sp: info.r1.p.spatial }));
    await unlabelled('main .lp-page', 'R2 understanding/plan');

    /* ===================== R3 — «به کار رفته» صادقانه ===================== */
    // واژهٔ متمایز: «نقطه» و «مربع» در طرح، «مرز» نه ⇒ دادهٔ «… شاید روی مرز» هنوز به کار نرفته (s03)
    await p.fill('#lpPlan', 'نخست مربع را به چهار مربعِ کوچک بخش می‌کنم، سپس پنج نقطه را در آن‌ها می‌گذارم'); await W(400);
    info.un1 = await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')));
    chk(info.un1.includes('d2') && !info.un1.includes('d1'), 'R3: shared words («نقطه», «مربع») do not credit «… (شاید روی مرز)» — its distinctive word must appear ' + JSON.stringify(info.un1));
    // نام بردن برای کنار گذاشتن (NEG گسترده): «ضلع … بی‌فایده است»
    await p.fill('#lpPlan', 'نخست مربع را به چهار مربعِ کوچک بخش می‌کنم، سپس پنج نقطه را در آن‌ها می‌گذارم، حتی نقطه‌های روی مرز را؛ ضلعِ مربع اینجا بی‌فایده است'); await W(400);
    info.un2 = await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')));
    chk(!info.un2.includes('d2') && info.un2.includes('d3'), 'R3: «روی مرز» named ⇒ used; a datum named only to dismiss it («بی‌فایده است») is NOT used ' + JSON.stringify(info.un2));
    // گفت‌وگو با دستیار هرگز «به کار بردن» نیست
    await p.evaluate(pid => APP.S.put({ id: 'ach_r3', type: 'achat', lprob: pid, msgs: [{ role: 'user', text: 'ضلعِ مربع یک است و با آن قطر را حساب کردم' }] }), P1);
    chk(!(await p.evaluate(pid => APP.liveUsed(pid).d3, P1)), 'R3: a datum named in the linked chat is not credited');
    // بخش‌های شرط در طرح
    chk(await has('main .lp-plan .lp-cticks') === 1, 'R3: condition parts listed at the plan');
    await p.check('#lpPC_0'); await W(60);
    await sel('#lpMv', 'mv_decompose');
    // R4: دلیلِ حرکت فقط در برابرِ صورت رونوشت‌سنجی می‌شود (نه در برابرِ نامِ خودِ حرکت) — و ردّش بی‌صدا نیست
    await p.fill('#lpMvWhy', await p.evaluate(pid => APP.S.get('eprob_' + pid).p.statement, P1)); await click('main .lp-mvadd');
    chk((await S(P1)).live.moves.length === 0, 'R4: a move reason that copies the statement is refused');
    info.mvd = await p.evaluate(() => { const m = APP.MOVES.mv_decompose; return m.fa + ' ' + (m.d || ''); });
    await p.fill('#lpMvWhy', 'تقسیمِ مربع به چهار تکه همان ' + info.mvd.slice(0, 60)); await click('main .lp-mvadd');
    chk((await S(P1)).live.moves.length === 1 && (await p.evaluate(pid => APP.liveHeur(pid), P1)).includes('move'), 'R4: a reason that shares words with the move itself is accepted as a plan tool');
    await sel('#lpPU_a_d3', 'skip'); await p.fill('#lpPU_w_d3', 'اندازهٔ ضلع در شمارشِ لانه‌ها نقشی ندارد');
    await click('main .lp-plansave');
    let s1 = await S(P1);
    chk(s1.live.plan && s1.live.plan.cparts && s1.live.plan.cparts[0] === 0, 'R3: plan records which condition parts it uses ' + JSON.stringify(s1.live.plan && s1.live.plan.cparts));
    // اجرا: بخشِ شرطِ هر گام؛ «روشن می‌بینی؟ می‌توانی ثابت کنی؟»
    chk(await has('main .lp-stepf .lp-cticks') === 1 && await has('#lpProof') === 1 && await has('#lpPred') === 0, 'R3/kind: objective step asks which condition part it uses and for a proof (no prediction/date)');
    await p.fill('#lpStep', 'دو نقطه در یک مربعِ کوچک می‌افتند (لانهٔ کبوتر)'); await sel('#lpClear', 'مطمئن نیستم'); await p.check('#lpSC_0'); await W(40);
    await click('main .lp-stepsave');
    s1 = await S(P1);
    chk(s1.live.steps[0] && s1.live.steps[0].intuitive && s1.live.steps[0].cparts[0] === 0, 'R3: step saved with its condition part; «مطمئن نیستم» ⇒ intuitive');
    // R5: پس از برهان، حدس «۵۰٪ هرگز یقین» نیست
    info.gp = await txt('main .lp-guessproof');
    chk(/برهان در کار است/.test(info.gp) && !/هرگز یقین/.test(await txt('main .lp-guess')), 'R5: guess panel for an objective problem with proof steps — no «۵۰٪ never certain» ' + info.gp);
    // «دو جواب» در گامِ برهانی ⇒ پیوند به «کافی است؟» (R8)
    await objStep('اگر نقطه‌ها روی مرز باشند دو جواب ممکن است', 'هر نقطهٔ مرزی به دو مربعِ کوچک تعلق دارد');
    chk(await has('main .lp-multi .lp-multigo') === 1, 'R8: «دو جواب» inside an objective step ⇒ sufficiency link');
    await objStep('فاصلهٔ دو نقطه در مربعی با ضلعِ نیم حداکثر قطرِ آن است', 'قطرِ مربعِ کوچک نیمِ قطرِ مربعِ بزرگ است');
    chk((await S(P1)).live.steps.length === 3, 'R4: steps that follow the declared plan pieces need no plan-switch');
    await noOverflow('objective exec'); await bidi('objective exec');

    /* ===================== R5 — بستنِ صادقانه ===================== */
    // گامِ شهودی پیش از «حل شد» یادآوری می‌شود
    await click('main .lp-solved');
    chk(await has('main .lp-close .lp-closeintu') === 1 && !(await S(P1)).live.state, 'R5: «✅ حل شد» recalls the intuitive step («prove it later») before closing');
    await sel('#lpIS_ls1', 'prove'); await p.fill('#lpISP_ls1', 'چهار مربعِ کوچک و پنج نقطه: بنا بر اصلِ لانهٔ کبوتر دو نقطه در یکی‌اند');
    await click('main .lp-closego');
    s1 = await S(P1);
    chk(s1.live.state === 'solved' && s1.live.steps[0].intuitive === false && /لانهٔ کبوتر/.test(s1.live.steps[0].proof), 'R5: the intuitive step proved at closing; then solved');
    // بازنگریِ برهان: پاسکال، همهٔ فرض، نتیجه = حکم؛ بخشِ شرطِ به‌کارنرفته
    chk(await has('#lpBDef') === 1 && await has('#lpBHyp') === 1 && await has('#lpBConcl') === 1 && await has('#lpBLimit') === 1, 'kind: proof look-back asks Pascal\'s rule, all hypotheses, conclusion = claim; spatial ⇒ limiting case');
    // ایراد ⇒ نمی‌بندد
    await p.fill('#lpBChk', 'حالتِ نقطه‌های روی مرز را جدا وارسی کردم'); await sel('#lpBRes', 'نتیجه سالم ماند');
    await sel('#lpBHyp', 'notall');
    chk(await has('main .lp-bdefect') === 1, 'R5: «بخشی از فرض به کار نرفت» ⇒ defect card');
    await sel('#lpBConcl', 'same');
    await p.fill('#lpBDefW', 'فرضِ ضلعِ یک در برهان نیامد'); await sel('#lpBDefTo', 'c');
    await click('main .lp-lbsave');
    s1 = await S(P1);
    info.cl1 = await p.evaluate(pid => APP.liveClosure(pid), P1);
    chk(!(s1.b && s1.b[1]) && s1.live.state === 'open' && s1.live.defects.length === 1 && info.cl1.state === 'incomplete' && /ناتمام/.test(info.cl1.label) && await has('main .lp-defect') === 1, 'R5: a look-back reporting a defect cannot close as solved — «ناتمام — برگرد به …» ' + JSON.stringify(info.cl1));
    // دوباره: حالا همهٔ فرض به کار رفت ⇒ «اثبات شد»
    await objStep('ضلعِ یک یعنی قطرِ مربعِ کوچک نیمِ قطرِ مربعِ واحد است', 'قطرِ مربع با ضلعِ s برابرِ s√2 است و برای s = ½ نیمِ √2');
    await click('main .lp-solved');
    await p.fill('#lpBChk', 'هر پنج نقطه را در گوشه‌ها و مرکز گذاشتم و حکم برقرار ماند'); await sel('#lpBRes', 'نتیجه سالم ماند');
    await sel('#lpBHyp', 'all'); await sel('#lpBConcl', 'same');
    await p.fill('#lpBOther', 'با حسابِ فاصله‌ها در حالتِ بدترین چینش'); await p.fill('#lpBGlance', 'چهار لانه و پنج کبوتر');
    await p.fill('#lpBWorked', 'بخش کردنِ مربع به تکه‌های هم‌اندازه'); await p.fill('#lpBUse', 'وقتی چیزها بیش از جاها هستند، اصلِ لانهٔ کبوتر');
    await p.fill('#lpBSym', 'چهار مربعِ کوچک نقشِ یکسان دارند'); await p.fill('#lpBUnits', 'فاصله با فاصله، هر دو طول');
    await p.fill('#lpBLimit', 'اگر ضلع به صفر برسد همهٔ فاصله‌ها صفر می‌شوند و حکم بدیهی است');
    await p.fill('#lpBDef', 'تعریفِ فاصله و قطرِ مربع در گامِ سوم به کار رفت');
    await p.fill('#lpBNew', 'ده نقطه درونِ یک مثلثِ متساوی‌الاضلاع با ضلعِ سه');
    await sel('#lpBHit', 'درست بود'); await sel('#lpBWant', 'same');
    if (await has('#lpBBest')) await sel('#lpBBest', await p.evaluate(() => document.querySelector('#lpBBest option:nth-child(2)').value));
    await click('main .lp-lbsave');
    chk(!(await S(P1)).b || !(await S(P1)).b[1], 'R8: taste and «what is shared» with the new problem are required');
    await p.fill('#lpBTaste', 'بخش کردن را دوست داشتم، حسابِ قطر را کمتر');
    // R4: مسئلهٔ تازه با «همان روش» و بی هیچ واژهٔ مشترک پذیرفته است
    await p.fill('#lpBNew', 'ده جوراب از پنج رنگ در کشو: کمترین شمار برای یک جفت هم‌رنگ؟');
    await sel('#lpBNewS', 'method'); await p.fill('#lpBNewW', 'همان اصلِ لانهٔ کبوتر با رنگ‌ها به جای تکه‌ها');
    await click('main .lp-lbsave');
    s1 = await S(P1);
    chk(s1.b[1] && s1.b[1].done && s1.b[1].verdict === 'proved' && s1.b[1].taste && s1.b[1].newShare === 'method' && s1.g[1].proved, 'R5/R4/R8: complete proof ⇒ verdict «proved»; new problem sharing only the METHOD accepted; taste stored ' + JSON.stringify(s1.b[1] && { v: s1.b[1].verdict, sh: s1.b[1].newShare }));
    chk(/اثبات شد/.test(await txt('main .lp-lbsum')) && !/هرگز یقین/.test(await txt('main .lp-lbsum')), 'R5: after a full proof the page says «اثبات شد»');
    // ارث: مسئلهٔ تازه داور و فضایی بودن و نوع را از پدر می‌گیرد
    info.child = await p.evaluate(pid => { const r = APP.S.all('eprob', x => x.live && x.origin && x.origin.id === pid)[0]; return r && { nat: r.p.nat, by: r.p.natBy, sp: r.p.spatial, kind: r.p.kind, k: APP.liveKind(r.p.id) }; }, P1);
    chk(info.child && info.child.nat === 'objective' && info.child.sp === true && info.child.kind === 'prove' && info.child.k === 'objective', 'R2: the look-back child inherits kind, judge and spatial flag ' + JSON.stringify(info.child));
    info.chat = await p.evaluate(pid => { const r = APP.liveCreate('', 'یک مسئلهٔ تازهٔ ساختهٔ گفت‌وگو دربارهٔ لانه‌ها و کبوترها', '', { origin: { type: 'lprob', id: pid } }); return { nat: r.p.nat, sp: r.p.spatial, kind: r.p.kind }; }, P1);
    chk(info.chat.nat === 'objective' && info.chat.sp === true && info.chat.kind === 'prove', 'R2: a problem made in chat from a live problem (origin lprob) inherits too ' + JSON.stringify(info.chat));

    /* ===================== R5 — مسئلهٔ کمکی ≠ اصلی؛ ادعای ۱۰۰٪ ===================== */
    const P2 = await mk({ title: 'باغچه', st: 'برای باغچهٔ ۱۲ متری چند کیسه کود بخرم که بس باشد؟', nat: 'practical' });
    await understand({ one: 'می‌خواهم بدانم چقدر کود برای باغچه لازم است', unk: 'شمارِ کیسه‌ها', data: ['باغچه ۱۲ متر مربع است', 'هر کیسه ۵ کیلو است'], cond: 'خاک نسوزد', prac: true, measure: '۲۰۰ × ۱۲۰ × ۱۰۰ لیتر', dep: 'کودِ لازم با بزرگ‌تر شدنِ باغچه بیشتر می‌شود', expectMiss: true });
    chk(/واحد/.test(await txt('main .lp-umiss')) && /واحدها/.test(await txt('main .lp-measout')), 'R8: units check in «ریاضی‌کردن» (three bare numbers with «لیتر» only at the end) ' + await txt('main .lp-measout'));
    await p.fill('#lpPrMeasure', 'کیلوی لازم = ۱۲ متر مربع × ۰٫۵ کیلو بر متر مربع'); await W(100);
    await click('main .lp-usave'); await click('main .lp-u .sv-g2');
    chk((await S(P2)).u[1] && (await S(P2)).u[1].prac, 'R8: consistent units accepted');
    // ارثِ داور از پدرِ عملی — حتی وقتی صورتِ فرزند به‌تنهایی پیشنهادِ دیگری («… یا …» ⇐ زندگی) می‌دهد
    info.inh = await p.evaluate(pid => { const r = APP.liveCreate('', 'برای باغچهٔ همسایه هم بخرم یا نه؟', '', { origin: { type: 'lprob', id: pid } }); return { nat: r.p.nat, by: r.p.natBy, guess: APP.liveNatGuess(r.p.statement) }; }, P2);
    chk(info.inh.nat === 'practical' && info.inh.by === 'parent' && info.inh.guess === 'life', 'R2: a child inherits the parent\'s judge over its own word-guess ' + JSON.stringify(info.inh));
    // ادعای ۱۰۰٪ (ناخواسته) ⇒ اثبات یا رد کن
    await p.fill('#lpClaim', 'فکر می‌کنم کودِ بیشتر همیشه بهتر است'); await sel('#lpClaimWant', 'no'); await sel('#lpClaimConf', '100');
    chk(await has('main .lp-claimpod #lpClaimContra') === 1 && /صددرصد/.test(await txt('main .lp-claimpod')), 'R5: a 100% claim (not wanted) gets the prove-or-refute challenge');
    await go('lprob', P2, 'plan');
    chk(await has('main .lp-plandep') === 1, 'R8: a datum depending on the unknown is recalled at the plan');
    await sel('#lpAuxK', 'special'); await p.fill('#lpAuxT', 'یک متر مربع چقدر کود می‌خواهد'); await p.fill('#lpAuxB', 'ضربدر دوازده متر'); await click('main .lp-auxsave');
    await moveAndPlan('نخست یک متر مربع را حساب می‌کنم، سپس برای کلِ باغچه ضرب می‌کنم', async () => { await p.fill('#lpPlan2', 'اگر نشد از فروشنده می‌پرسم'); await p.fill('#lpPlanRot', 'هر هفته یک کیسه را به نوبت در یک گوشه می‌ریزم'); });
    chk((await S(P2)).live.plan && /گوشه/.test((await S(P2)).live.plan.rot), 'R4: declared rotation saved with the plan');
    // گامی از چرخشِ اعلام‌شده «عوض کردنِ طرح» نیست؛ گامی فقط از طرحِ دوم ⇒ «به طرحِ دوم رفتی؟»
    await p.fill('#lpStep', 'این هفته یک کیسه را در گوشهٔ شمالی بریزم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'خاک سیاه‌تر می‌شود'); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا');
    await click('main .lp-stepsave');
    chk((await S(P2)).live.steps.length === 1 && !(await S(P2)).live.switches, 'R4: a step from the declared rotation is not a plan switch');
    await day(1); await go('lprob', P2, 'exec');
    await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', 'خاک کمی سیاه‌تر شد'); await sel('#lpOMatch', 'yes'); await sel('#lpOProg', 'کمی'); await sel('#lpOWant', 'same'); await sel('#lpOGuess', 'none');
    await click('main .lp-outsave');
    await p.fill('#lpStep', 'از فروشندهٔ محله بپرسم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'می‌گوید سه کیسه'); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا');
    await click('main .lp-stepsave');
    chk(await p.evaluate(() => (document.querySelector('main .lp-switch') || {}).getAttribute && document.querySelector('main .lp-switch').getAttribute('data-tag')) === 'p2' && await p.evaluate(() => document.getElementById('lpSwitch').value) === 'plan2', 'R4: a step matching only the second plan ⇒ «به طرحِ دومت رفتی؟» (pre-selected), not «same» by word overlap');
    await p.fill('#lpSwitchW', 'حسابِ متر مربع سخت بود'); await click('main .lp-stepsave');
    chk(((await S(P2)).live.switches || [])[0] && (await S(P2)).live.switches[0].to === 'plan2', 'R4: plan-2 switch recorded with its reason');
    await day(2); await go('lprob', P2, 'exec');
    await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', 'گفت سه کیسه'); await sel('#lpOMatch', 'yes'); await sel('#lpOProg', 'بله، روشن'); await sel('#lpOWant', 'same'); await sel('#lpOGuess', 'none');
    await click('main .lp-outsave');
    await click('main .lp-solved');
    chk(await has('main .lp-close .lp-closeaux') === 1 && !(await S(P2)).live.state, 'R5: auxiliary problem solved ≠ main solved — the bridge back is asked before «حل شد»');
    await click('main .lp-closego');
    chk(!(await S(P2)).live.state, 'R5: the bridge choice is required');
    await sel('#lpXC_0', 'crossed'); await p.fill('#lpXCW_0', 'یک متر مربع نیم کیلو خواست و دوازده برابرش شش کیلو یعنی دو کیسه شد');
    await click('main .lp-closego');
    info.p2 = await S(P2);
    chk(info.p2.live.state === 'solved' && info.p2.live.aux[0].crossed && /دوازده/.test(info.p2.live.aux[0].crossed.t), 'R5: bridge recorded ⇒ solved');
    // قانونِ تجربی (عملی با رابطه): دامنه و حالتِ حدی در بازنگری
    chk(await has('#lpBLaw') === 1 && await has('#lpBMono') === 1, 'R8: practical look-back with a law/relation asks its domain and limiting case; a datum depending on the unknown ⇒ monotonicity (A151)');
    // پیش‌نویسِ بازنگری با بستنِ صفحه نمی‌رود
    await p.fill('#lpBChk', 'کیسه‌ها را ریختم و خاک خوب شد'); await p.fill('#lpBLaw', 'فقط برای باغچه‌های ده تا پانزده متری آزمودم'); await W(600);
    await p.reload(); await p.waitForSelector('.nav'); await W(300);
    await p.evaluate(x => { window.__day = x; APP.today = () => window.__day; APP.S.loaded = true; }, D(2));
    await go('lprob', P2, 'back');
    chk(await p.evaluate(() => document.getElementById('lpBChk').value) === 'کیسه‌ها را ریختم و خاک خوب شد' && /پانزده/.test(await p.evaluate(() => document.getElementById('lpBLaw').value)), 'R8: unsaved look-back fields survive an abrupt close (draft)');

    /* ===================== شرطِ متناقض ⇒ شل کردنِ بخشی از شرط؛ بن‌بست ⇒ هشدارِ نشانه‌های فریبنده ===================== */
    const P3 = await mk({ title: 'برنامهٔ مهمانی', st: 'هفت مهمان را دورِ میزِ گرد بنشانم که هیچ دو دوستی کنارِ هم نباشند و هر کس کنارِ همسرش باشد.', nat: 'objective' });
    await understand({ one: 'می‌خواهم ببینم چنین چینشی ممکن است', unk: 'یک چینش', data: ['هفت مهمان', 'سه زوج'], cond: 'هیچ دو دوستی کنارِ هم نباشند\nهر کس کنارِ همسرش باشد', suff: 'متناقض است' });
    chk(await has('main .lp-relax') === 1 && await p.evaluate(() => [...document.querySelectorAll('#lpRelax option')].map(o => o.value).includes('prove')), 'R8: contradictory condition ⇒ plan suggests relaxing a part of the condition (or proving impossibility)');
    await p.fill('#lpBkS', 'همه نشسته‌اند و هر دو شرط برقرار است'); await p.fill('#lpBk1', 'زوج‌ها کنارِ هم'); await click('main .lp-bkbranch'); await p.fill('#lpBk_1_0', 'دوست‌ها یک در میان'); await p.check('#lpBkDead_1'); await W(160);
    chk(await has('main .lp-bkmislead') === 1 && /C095/.test(await txt('main .lp-bkmislead')), 'R8: a dead-end branch ⇒ «signs can mislead» warning');
    await p.fill('#lpBkDeadW_1', 'دوست‌ها همسرِ هم‌اند و نمی‌توانند جدا بنشینند'); await click('main .lp-bksave');
    await moveAndPlan('نخست شرطِ دوستان را شل می‌کنم و فقط زوج‌ها را کنارِ هم می‌نشانم');
    chk(!(await S(P3)).live.plan, 'R8: plan cannot be saved before choosing which part to relax');
    await sel('#lpRelax', '0'); await p.fill('#lpRelaxW', 'دوستی با همسری تداخل دارد پس آن را شل می‌کنم'); await click('main .lp-plansave');
    chk((await S(P3)).live.plan && (await S(P3)).live.plan.relax.part === 0, 'R8: relaxed part recorded with the plan');

    /* ===================== استقرا: حالتِ پایه؛ تبدیل ⇒ هم‌ارزی؛ پرسش‌های نوع‌دار ===================== */
    const P4 = await mk({ title: 'استقرا', st: 'ثابت کن برای هر n ≥ ۴ داریم ۲ به توانِ n بزرگ‌تر از n² است.', kind: 'prove' });
    await understand({ one: 'می‌خواهم ثابت کنم توانِ دو از مربع جلو می‌زند', unk: '۲ⁿ > n² برای n ≥ ۴', data: ['n عددی طبیعی است', 'n دست‌کم چهار است'], cond: '۲ⁿ > n²', suff: 'کافی است' });
    info.qs = await p.evaluate(pid => ({ c: APP.livePhaseQs(pid, 'c'), b: APP.livePhaseQs(pid, 'b'), co: APP.liveCoach(pid) }), P4);
    chk(info.qs.c.some(q => /حالتِ پایه/.test(q)) && info.qs.b.some(q => /پاسکال/.test(q)) && info.qs.b.some(q => /هم‌ارز/.test(q)) && info.qs.co.kind === 'objective' && info.qs.co.ph === 'p' && info.qs.co.list.length > 3, 'kind: exec questions include base cases for «n ≥ k»; back questions include Pascal\'s rule and equivalence after transformation; A.liveCoach exported ' + JSON.stringify({ c: info.qs.c.length, b: info.qs.b.length, co: info.qs.co.ph }));
    await moveAndPlan('با استقرا ثابت می‌کنم: پایه و گامِ استقرا');
    await objStep('فرض کن برای n = k درست است؛ پس ۲ به توانِ k+1 = ۲·۲^k > ۲k² ≥ (k+1)² برای k ≥ ۴', 'فرضِ استقرا و ۲k² − (k+1)² = k² − 2k − 1 > 0');
    chk(await has('main .lp-base #lpBase') === 1 && !(await S(P4)).live.steps.length, 'kind: an induction step needs its base case (B184) — card shown, step refused');
    chk(!(await S(P4)).live.switches, 'R4: an induction step in a plan that declared induction is not a plan switch');
    await p.fill('#lpBase', 'برای n = ۴: ۱۶ > ۱۶ نیست؛ پس پایه را n = ۵ می‌گیرم: ۳۲ > ۲۵');
    await click('main .lp-stepsave');
    chk((await S(P4)).live.steps.length === 1 && /۳۲/.test((await S(P4)).live.steps[0].base), 'kind: base case recorded with the step');
    // دورِ ۳ (A9): برهان مجهول ندارد — کارتِ «معادله‌ها در برابرِ مجهول‌ها» برای «اثباتی» نمی‌آید (شمارش و «معادله کم است» در test_tour1_r3_live.js روی مسئلهٔ یافتنی)
    chk(await has('main .lp-eqs') === 0, 'A9: the equations-vs-unknowns card is hidden for proofs');
    await objStep('در گامِ استقرا دو طرف را به توانِ دو رساندم و مقایسه کردم', 'طرفین مثبت‌اند؛ اگر نبودند به تناقض می‌رسیدیم');
    chk((await S(P4)).live.steps.length === 2 && !(await S(P4)).live.switches, 'R4: a second induction step needs neither a new base nor a plan switch');
    await click('main .lp-solved');
    chk(await has('#lpBEquiv') === 1 && await has('#lpBDirect') === 1, 'kind: look-back after a transformation asks equivalence (B009); an indirect argument asks for the direct rewrite (C064)');
    await p.fill('#lpBChk', 'برای n = ۶ و ۷ حساب کردم'); await sel('#lpBRes', 'نتیجه سالم ماند'); await sel('#lpBHyp', 'all'); await sel('#lpBConcl', 'same');
    await sel('#lpBEquiv', 'no');
    chk(await has('main .lp-bdefect') === 1, 'R5: a non-equivalent transformation is a defect (cannot close)');
    await p.fill('#lpBDefW', 'به توان رساندن یک‌سویه بود'); await sel('#lpBDefTo', 'c'); await click('main .lp-lbsave');
    chk(await p.evaluate(pid => APP.liveClosure(pid).state, P4) === 'incomplete', 'R5: defect saved ⇒ incomplete');

    /* ===================== R4 — مسئلهٔ مرتبط: «چه چیزی مشترک است» و نگاشتِ هم‌ریختی ===================== */
    await p.evaluate(() => APP.S.put({ id: 'kc_r4', type: 'kcase', title: 'شمارشِ مسیرهای شبکه', intake: { what: 'مسیرهای شبکهٔ خیابان‌ها از گوشه به گوشه با حرکتِ راست و بالا', statement: 'مسیرهای شبکهٔ خیابان‌ها' } }));
    const P5 = await mk({ title: 'مسیرهای شبکه', st: 'در شبکهٔ خیابان‌های ۳ در ۳ از گوشه به گوشهٔ مقابل با حرکتِ راست و بالا چند مسیر هست؟', nat: 'objective' });
    await understand({ one: 'می‌خواهم مسیرهای شبکه را بشمارم', unk: 'شمارِ مسیرها', data: ['شبکه ۳ در ۳ است', 'فقط راست و بالا'], cond: 'از گوشه به گوشهٔ مقابل' });
    await go('lprob', P5, 'plan');
    await click('main .lp-relrow[data-id="kc_r4"] .lp-rellink');
    await sel('#lpRelS_0', 'form'); await p.fill('#lpRelC_0', 'همان ساختارِ مسیرها را دارد و شمارشش را می‌آورم');
    await click('main .lp-relcsave');
    chk(!(await S(P5)).live.related[0].carry, 'R4: «same structure» needs the user\'s own mapping');
    await p.fill('#lpRelM_0', 'خیابان‌ها ⇐ یال‌ها، تقاطع‌ها ⇐ رأس‌ها'); await click('main .lp-relcsave');
    info.rel = (await S(P5)).live.related[0];
    chk(info.rel.share === 'form' && /یال/.test(info.rel.map) && (await p.evaluate(pid => APP.liveHeur(pid), P5)).includes('rel'), 'R8: isomorphic problem via the user-declared mapping counts as a plan tool ' + JSON.stringify(info.rel));

    /* ===================== ابزارِ حدس: شمارش و رابطهٔ بازگشتی (R8، s24) ===================== */
    const P6 = await mk({ title: 'کاشی‌ها', st: 'به چند راه می‌توان نوارِ ۱ در n را با کاشیِ ۱ در ۱ و ۱ در ۲ پوشاند؟ برای n = ۶ می‌خواهم.', nat: 'objective' });
    await whole('می‌خواهم شمارِ پوشش‌ها را بیابم', 'شمارش را دوست دارم');
    await p.click('main .lp-u .sv-kit > summary'); await W(120);
    chk(await has('main .lp-u .sv-kit input[id$="_cnt"]') === 1, 'R8: counting problem ⇒ «did you count all?» in the guess-kit table');
    const kx = p.locator('main .lp-u .sv-kit .sv-kx'), ky = p.locator('main .lp-u .sv-kit .sv-ky');
    await click('main .lp-u .sv-kaddrow'); await click('main .lp-u .sv-kaddrow');
    for (const [i, x, y] of [[0, '1', '1'], [1, '2', '2'], [2, '3', '3'], [3, '4', '6'], [4, '5', '8']]) { await kx.nth(i).fill(x); await ky.nth(i).fill(y); }
    await p.fill('main .lp-u .sv-kit input[id$="_f"]', 'a(n) = a(n-1) + a(n-2)');
    await click('main .lp-u .sv-kchk');
    info.kit = await txt('main .lp-u .sv-kout');
    chk(/بازتولید نمی‌کند/.test(info.kit) && /x = ۴/.test(info.kit) && /شمارش/.test(info.kit) && !/وارسی شد/.test(info.kit), 'R8: the recurrence is checked against the user\'s own table (n = 4 miscount found); counting needs «how do you know you counted all» ' + info.kit);
    await kx.nth(3).fill('4'); await ky.nth(3).fill('5');
    await p.fill('main .lp-u .sv-kit input[id$="_cnt"]', 'برای هر n فهرستِ منظم نوشتم: با کاشیِ اول آغاز یا با کاشیِ دوم');
    await click('main .lp-u .sv-kchk');
    info.kit2 = await txt('main .lp-u .sv-kout');
    chk(/رابطهٔ بازگشتی با ۳ حالتِ جدولت می‌خواند/.test(info.kit2) && !/بازتولید نمی‌کند/.test(info.kit2), 'R8: a recurrence consistent with the table is «supported, not proved» ' + info.kit2);

    /* ===================== R8 — «کدام پرسش» فقط پرسش؛ مرورِ میانهٔ راه؛ پیوست؛ کارتِ فهمِ گیرکرده؛ عنصرِ کمکی ===================== */
    chk(await p.evaluate(() => APP.PLAN_QS.some(q => /^عنصرِ کمکی/.test(q.t)) && APP.SOLVE_TYPES.pod.plan.some(q => /عنصرِ کمکی/.test(q)) && APP.SOLVE_TYPES.find.plan.some(q => /عنصرِ کمکی/.test(q))), 'R8: «عنصرِ کمکی» unconditional in the find ladder and present in the pod ladder');
    info.cq = await p.evaluate(pid => { APP.S.put({ id: 'ach_q', type: 'achat', lprob: pid, msgs: [{ role: 'ai', text: 'آفرین، خیلی خوب؟' }, { role: 'ai', text: 'کدام داده را هنوز به کار نبردی؟' }] }); return APP.liveChatQs(pid); }, P2);
    chk(info.cq.length === 1 && /کدام داده/.test(info.cq[0]), 'R8: «which question helped» lists only real questions ' + JSON.stringify(info.cq));
    // مرورِ میانهٔ راه روی نردبانِ خودِ مسئله (روزِ ۳)
    const P7 = await mk({ title: 'تمرینِ ویولن', st: 'هر روز ویولن تمرین کنم یا یک روز در میان؟ نمی‌دانم کدام بهتر است.', nat: 'life' });
    await understand({ one: 'می‌خواهم بهترین بسامدِ تمرین را بیابم', unk: 'هر روز یا یک روز در میان', data: ['روزی نیم ساعت وقت دارم', 'سه ماه است می‌نوازم'], cond: 'خسته نشوم' });
    await day(6); await go('lprob', P7);
    chk(await has('main .lp-checkin') === 1 && (await p.evaluate(() => APP.dueList().map(x => x.txt))).some(t => /میانهٔ راهِ «تمرینِ ویولن»/.test(t)), 'R8: mid-course check-in from the problem\'s own ladder (day 3) — page card and «امروز»');
    await p.fill('#lpCkP', 'تمرینِ کوتاه‌تر ولی هر روز بهتر می‌ماند'); await p.fill('#lpCkS', 'وقتی خسته‌ام بهانه می‌آورم'); await sel('#lpCkW', 'more');
    await click('main .lp-ckgo');
    chk((await S(P7)).live.checkins.length === 1 && await has('main .lp-checkin') === 0, 'R8: check-in saved; next one on the next rung');
    // پیوستِ گفت‌وگو به همین مسئله
    chk(await p.evaluate(pid => APP.liveAttach(pid, { name: 'note.csv', id: 'f1', sess: 'ach_q' }) && APP.liveAttach(pid, { name: 'note.csv', id: 'f1' }) && APP.liveAttachments(pid).length === 1, P7), 'R8: chat attachments linked to the live problem (dedup)');
    await go('lprob', P7); chk(/note\.csv/.test(await txt('main .lp-attach')), 'R8: linked attachments listed on the problem page');
    // کارتِ فهمِ مسئلهٔ ساختهٔ خودت پس از بیدار شدن گیر نمی‌کند (s02)
    const P8 = await p.evaluate(() => APP.liveCreate('', 'کیکِ گرد را میانِ سه نفر برابر تقسیم کنم', 'find', { dormant: '2026-11-01', origin: { type: 'chat', id: 'x' }, nat: 'life' }).p.id);
    await go('lprob', P8); await click('main .lp-wakego');
    await whole('می‌خواهم ببینم آن پرسشِ کوچک دقیقاً چه می‌خواهد', 'کنجکاوم');
    chk(await has('#lpUnk') === 1, 'R8: the woken derived problem opens its parts after the whole sentence');
    await p.fill('#lpOne', 'کیکِ گرد را میانِ سه نفر برابر تقسیم کنم'); await click('main .lp-usave');
    chk(await has('main .lp-onesave') === 1 && await has('#lpUnk') === 0, 'R8: a whole sentence that became a near-copy after «ثبتِ کل» reopens the whole-first gate (no message about a hidden field)');
    chk(await has('main .lp-onemiss') === 0 || /رونوشت/.test(await txt('main .lp-onemiss')), 'R4: short statement — no «shorter than the statement» rule');

    /* ===================== R1/R2 در دستیار: سشنِ بسته همیشه بلوک؛ ساختنِ مسئلهٔ دوم سشنِ دیگر را جابه‌جا نمی‌کند ===================== */
    info.bind = await p.evaluate(([a, b]) => { const s = { id: 'ach_b', type: 'achat', msgs: [{ role: 'user', text: 'سلام' }] }; APP.S.put(s);
      const ok1 = APP.liveBindSession(a, s), no2 = APP.liveBindSession(b, s), keep = s.lprob === a, ok3 = APP.liveBindSession(b, s, { force: true }), sw = s.lprob === b, un = APP.liveUnbindSession(s), gone = !s.lprob;
      return { ok1, no2, keep, ok3, sw, un, gone }; }, [P7, P5]);
    chk(info.bind.ok1 && info.bind.no2 === false && info.bind.keep && info.bind.ok3 && info.bind.sw && info.bind.un && info.bind.gone, 'R1/R2: a session bound to an open problem is not rebound without an explicit switch; unbind exported ' + JSON.stringify(info.bind));
    await go('home');
    info.hk = await hookText({ id: 'ach_h', lprob: P7, msgs: [] }, 'فونتِ صفحه ریز است');
    chk(/# مسئلهٔ زندهٔ این سشن \(/.test(info.hk) && /وضع: /.test(info.hk) && /پرسش‌های همین مرحله/.test(info.hk) && !/live_new/.test(info.hk), 'R1: a bound session always gets its (compact) live block, kind-aware question list and closure state — and no «create» rules ' + info.hk.slice(0, 200));
    info.hk4 = await hookText({ id: 'ach_h4', lprob: P4, msgs: [] }, 'ادامه');
    chk(/ناتمام/.test(info.hk4) && /«حل شد» نگو/.test(info.hk4), 'R5: the hook tells the model the problem is incomplete after a defect ' + info.hk4.slice(0, 160));
    // live_new: همان مسئله دوباره ساخته نمی‌شود؛ سشنِ همین نوبت بسته می‌شود
    info.ln = await p.evaluate(() => { const AS = APP.ASSIST, s = { id: 'ach_ln', type: 'achat', msgs: [{ role: 'user', text: 'می‌خوام گوجه بکارم' }] }; APP.S.put(s); AS._turnSession = s;
      const n0 = APP.liveAll().length, a = AS.DO.live_new({ title: 'گوجه', statement: 'گوجه را در بالکنِ رو به شمال بکارم یا در گلدانِ داخلِ خانه؟' }), n1 = APP.liveAll().length, b2 = AS.DO.live_new({ title: 'گوجه', statement: 'گوجه را در بالکنِ رو به شمال بکارم یا در گلدانِ داخلِ خانه؟' }), n2 = APP.liveAll().length;
      AS._turnSession = null; return { a, b2, made: n1 - n0, again: n2 - n1, bound: !!(s.lprob && APP.liveRec(s.lprob)) }; });
    chk(info.ln.a === '' && info.ln.made === 1 && info.ln.again === 0 && info.ln.bound, 'R1: live_new binds the turn\'s session and never duplicates the same problem ' + JSON.stringify(info.ln));
    info.api = await p.evaluate(pid => ({ k: APP.liveKindInfo(pid), sp: APP.liveSpatial(pid), un: APP.liveUnused(pid), cl: APP.liveClosure(pid), sess: APP.liveSessionPid({ lprob: pid }) }), P7);
    chk(info.api.k && info.api.k.kind === 'life' && info.api.k.set && Array.isArray(info.api.un) && info.api.cl && info.api.cl.state === 'open' && info.api.sess === P7, 'G2 handoff APIs (kind info, spatial, unused, closure, session pid) ' + JSON.stringify(info.api.k));
    await go('lprob', P1); await noOverflow('closed proof'); await bidi('closed proof');
  } catch (e) { errors.push('exception: ' + (e && e.stack || e)); }
  console.log(JSON.stringify(info));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
