// تورِ دستهٔ ۱ ِ پولیا — دورِ ۴ ِ اصلاح («live»): تونلِ «🔭 مسئلهٔ حل‌نشدهٔ خودم» با کنترل‌های واقعیِ صفحه (پهنای ۳۹۰، ساعتِ ساختگی).
// بندها تصمیم‌های DECISIONS_R4 اند (E2، محتوای فهرست‌های E3، E4، E5، و بندهای کوچکِ «live» از E8). هر بند روی مسیرِ واقعیِ کاربر و رکوردِ واقعی آزموده می‌شود.
// خطا ⇒ کدِ خروجِ غیرصفر. LLA_FILE (اختیاری) = مسیرِ html ِ دیگری (برای دیدنِ خطِ قرمزِ پیش از اصلاح روی ساختِ پیشین).
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
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
  const toasts = () => p.evaluate(() => (document.getElementById('toasts') || { textContent: '' }).textContent);
  const hookText = (sess, msg) => p.evaluate(([sess, msg]) => APP.ASSIST.promptHooks.map(f => { try { return f(sess, msg) || ''; } catch (e) { return 'ERR ' + e.message; } }).join('\n'), [sess, msg]);
  // در ساختِ پیش از اصلاح (LLA_FILE) کنترلِ تازه نیست — بی‌آن، بندهای بعدیِ همان جریان هم باید خطِ قرمزِ خودشان را نشان دهند
  const fillIf = async (s, v) => { if (await has(s)) await p.fill(s, v); };
  const selIf = async (s, v) => { if (await has(s)) await sel(s, v); };
  const clickIf = async (s) => { if (await has(s)) await click(s); };
  const section = async (name, fn) => { try { await fn(); } catch (e) { const m = String(e && e.message || e); errors.push(name + ' — exception: ' + m.split('\n')[0] + ' ' + ((m.match(/locator\([^)]*\)/) || [''])[0])); } };
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
  const understand = async (o) => {
    await whole(o.one, o.why || 'برایم مهم است و کنجکاوم');
    if (o.nat) await sel('#lpNat', o.nat);
    await p.fill('#lpUnk', o.unk);
    for (let i = 0; i < o.data.length; i++) { if (i >= 2) await click('main .lp-dadd'); await p.fill('#lpD_d' + (i + 1), o.data[i]); }
    await p.fill('#lpCond', o.cond);
    if (await has('#lpSat')) await sel('#lpSat', o.sat || 'yes');
    await sel('#lpSuff', o.suff || 'ناکافی است — چیزی کم است'); await p.fill('#lpSuffW', o.suffW || 'هنوز همه را نمی‌دانم');
    if (await has('#lpSuffChal')) await p.fill('#lpSuffChal', 'همهٔ داده‌ها با هم آن را معین می‌کنند');
    if (o.dep) { await sel('#lpDep', 'yes'); await p.fill('#lpDepW', o.dep); } else if (o.depNo && await has('#lpDep')) await sel('#lpDep', 'no');
    if (o.prac) { for (let i = 0; i < o.data.length; i++) await sel('#lpDE_d' + (i + 1), 'big'); await p.fill('#lpPrVague', '«بس» یعنی همان چیزی که لازم است'); await p.fill('#lpPrLine', o.prLine || 'رنگ و برند را بیرون می‌گذارم چون اثری ندارند'); await p.fill('#lpPrApprox', o.prApprox || 'دقتِ ده درصد بس است'); await p.fill('#lpPrPrior', 'پارسال همین کار را کردم'); await p.fill('#lpPrMeasure', o.measure || 'حجمِ لازم ≤ ۲۰۰ لیتر'); await W(80); }
    await p.fill('#lpGuess', o.guess || 'درست است'); await sel('#lpConf', o.conf || '60'); await p.fill('#lpTest', o.test || 'با یک حالتِ خاص می‌آزمایم');
    await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
    await click('main .lp-usave');
    if (o.expectMiss) return txt('main .lp-umiss');
    await click('main .lp-u .sv-g2');
    return '';
  };
  const answerUnused = async () => { for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'use'); await p.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); } };
  const addMove = async (mv, why) => { await sel('#lpMv', mv); await p.fill('#lpMvWhy', why); await click('main .lp-mvadd'); };
  const savePlan = async (plan) => { await p.fill('#lpPlan', plan); await W(350); await answerUnused(); await click('main .lp-plansave'); };
  const objStep = async (text, proof) => { await p.fill('#lpStep', text); await sel('#lpClear', 'بله'); if (await has('#lpProof')) await p.fill('#lpProof', proof); await click('main .lp-stepsave'); };
  // بازنگری: هر فیلدی که هست با پاسخِ مشخص پر می‌شود (o: انتخاب‌های ویژهٔ هر بند)
  const fillBack = async (o) => {
    o = o || {};
    const f = async (id, v) => { if (await has(id)) await p.fill(id, v); };
    const s2 = async (id, v) => { if (await has(id)) await sel(id, v); };
    await s2('#lpBWant', 'same');
    await f('#lpBChk', o.chk || 'جواب را در همهٔ شرط جای‌گذاری کردم'); await s2('#lpBRes', o.res || 'نتیجه سالم ماند');
    if (o.pod) await s2('#lpBPod', o.pod);
    await s2('#lpBHyp', 'all'); await s2('#lpBConcl', 'same');
    await f('#lpBOther', 'با حسابِ جداگانهٔ هر حالت به همین می‌رسیدم'); await f('#lpBGlance', 'جای‌گذاری و حلِ دستگاهِ ساده');
    await f('#lpBWorked', 'نوشتنِ هر کمیت برحسبِ یک مجهول'); await f('#lpBUse', 'هر جا چند مجهولِ وابسته دارم، همه را برحسبِ یکی می‌نویسم');
    await f('#lpBTaste', 'نمادگذاری را دوست داشتم، حسابِ طولانی را نه'); await s2('#lpBMulti', 'one');
    await f('#lpBLimit', 'اگر محیط به صفر برسد همهٔ ضلع‌ها صفر می‌شوند و فرمول همین را می‌گوید');
    await f('#lpBCond', 'هر بخشِ شرط در گامِ جای‌گذاری آمد'); await s2('#lpBDep', 'no');
    await f('#lpBDef', 'تعریفِ اول بودن در گامِ مثالِ نقض به کار رفت');
    await f('#lpBSym', 'نقش‌های یکسان در نتیجه هم یکسان‌اند'); await f('#lpBUnits', 'طول با طول');
    await f('#lpBDirect', 'بخشِ مستقیمِ برهان جداست');
    if (await has('#lpBHit')) { await sel('#lpBHit', o.hit || 'درست بود'); if (await has('#lpBHitW')) await p.fill('#lpBHitW', o.hitWhy || 'فرضِ پنهانِ تقارن مرا فریب داد'); }
    if (await has('#lpBBest')) await sel('#lpBBest', await p.evaluate(() => document.querySelector('#lpBBest option:nth-child(2)').value));
    await f('#lpBNew', o.newProb || 'همین روش برای چهارضلعی با محیطِ ۴۰ و شرط‌های تازه');
    await s2('#lpBNewS', o.share || 'method'); await f('#lpBNewW', 'نوشتنِ همه برحسبِ یک مجهول و جای‌گذاری در محیط');
    if (o.map != null) await f('#lpBNewM', o.map);
  };
  try {
    await p.goto(FILE); await p.waitForSelector('.nav'); await W(300);
    await p.evaluate(T0 => { window.__day = T0; APP.today = () => window.__day; APP.S.loaded = true; window.__rem = []; APP.HOST = Object.assign({}, APP.HOST || {}, { remind: async (pl) => { window.__rem.push(pl); return { ok: true }; }, unremind: async () => ({ ok: true }) }); }, T0);

    /* ===================== E2 — پیشنهادِ داور: «عملی» فقط با سهمِ واقعیِ خودِ کاربر؛ نوع از صورت؛ فرزند نوعِ خودش ===================== */
    await section('E2', async () => {
      await go('e_prob', null, 'live');
      const typeAndRead = async (t) => { await p.fill('#lpNewS', t); await W(80); return p.evaluate(() => [document.getElementById('lpNewNat').value, document.getElementById('lpNewType').value]); };
      info.e2 = {
        brine: await typeAndRead('«۲۰ لیتر آب‌نمک ۱۰٪ داریم. چند لیتر آب‌نمک ۲۵٪ اضافه کنیم تا ۱۵٪ بشه؟» من از x بدم میاد، همیشه قاطی می‌کنم. می‌شه بدون x حلش کرد؟'),
        funnel: await typeAndRead('یه قیف مخروطی با شعاع دهانه ۱۰ سانت و ارتفاع ۳۰ سانت داریم. آب با نرخ ثابت ۵ سانتی‌متر مکعب در ثانیه خارج می‌شه. وقتی عمق آب ۱۲ سانته، سطح آب با چه سرعتی پایین میاد؟'),
        sheep: await typeAndRead('تو دفتر حساب نوشته «۳۶ رأس گوسفند: ؟۴۸۷؟ ریال» — رقم اول و آخر محو شده. می‌خوام بدونم قیمت هر گوسفند چقدر بوده. چطور پیدا کنم؟'),
        hw: await typeAndRead('ساعت ۱۱ شبه، فردا ۸ صبح باید تحویل بدم. «حجم چهاروجهی‌ای رو پیدا کنید که دو یال روبه‌روش طول a دارن و بر هم عمودن». فقط جواب رو بگو'),
        ethic: await typeAndRead('همکارم فاکتورهای ناهار رو هر بار ۵۰ هزار تومن بیشتر ثبت می‌کنه. اگه گزارش بدم اخراج می‌شه، اگه ندم خودم شریک جرمم. درستش چیه؟'),
        cake: await typeAndRead('می‌خوام ماهی ۲۰ میلیون سود کنم. هر کیک رو چند بفروشم؟'),
        house: await typeAndRead('سه ماهه دارم اکسل پر می‌کنم که خونه بخرم یا اجاره‌نشین بمونم. ۴۷ تا ستون: تورم، وام، اجاره. فقط بگو بخرم یا نه؟'),
        pod: await typeAndRead('سؤال مقاله‌ام: «آیا ماشین می‌تونه زبان رو بفهمه؟» هر کی یه چیزی میگه.'),
        prove: await typeAndRead('ثابت کنید که مجموعِ زاویه‌های هر مثلث ۱۸۰ درجه است.'),
        job: await typeAndRead('آیا این پیشنهادِ کار رو بپذیرم یا نه؟ حقوقش بیشتره ولی دوره.')
      };
      const E = info.e2;
      chk(E.brine[0] === 'objective' && E.funnel[0] === 'objective' && E.sheep[0] === 'objective' && E.hw[0] === 'objective', 'E2: textbook voice («داریم/اضافه کنیم/پیدا کنید»، صورتِ نقل‌شده) with complete data ⇒ objective, not practical ' + JSON.stringify(E));
      chk(E.ethic[0] === 'life' && E.cake[0] === 'practical' && E.house[0] === 'practical', 'E2: ethics dilemma ignores money words ⇒ life; the user\'s own stake (سود کنم/بفروشم، بخرم) ⇒ practical ' + JSON.stringify([E.ethic, E.cake, E.house]));
      chk(E.pod[1] === 'pod' && E.prove[1] === 'prove' && E.job[1] === 'find' && E.brine[1] === 'find', 'E2: «آیا…؟» ⇒ type pod; «ثابت کنید» ⇒ prove; a «… بپذیرم یا نه؟» decision stays find ' + JSON.stringify([E.pod, E.prove, E.job]));
      await p.fill('#lpNewS', '');
      // chat coach class from the same suggestion
      info.e2cls = await p.evaluate(() => [APP.ASSIST.coachClass('', '۲۰ لیتر آب‌نمک ۱۰٪ داریم. چند لیتر آب‌نمک ۲۵٪ اضافه کنیم تا ۱۵٪ بشه؟'), APP.ASSIST.coachClass('', 'می‌خوام ماهی ۲۰ میلیون سود کنم. هر کیک رو چند بفروشم؟')]);
      chk(info.e2cls[0] === 'obj' && info.e2cls[1] === 'pract', 'E2: the chat coach reads the textbook brine problem as objective, the own-profit one as practical ' + JSON.stringify(info.e2cls));
      // live_new بی kind ⇒ نوع از صورت؛ فرزندِ بازنگری نوعِ خودش
      info.e2new = await p.evaluate(() => { const sess = { id: 'ach_e2', msgs: [] }; APP.ASSIST._turnSession = sess; APP.ASSIST.DO.live_new({ title: 'مثلث', statement: 'ثابت کنید که در هر مثلث مجموعِ دو ضلع از ضلعِ سوم بیشتر است.' }); const pid = sess.lprob; APP.ASSIST._turnSession = null;
        const r = APP.S.get('eprob_' + pid); const ch = APP.liveCreate('', 'اگر ۴ نقطه باشد، حکم هنوز درست است؟', '', { origin: { type: 'lprob', id: pid } }); return { kind: r && r.p.kind, child: ch.p.kind, childNat: ch.p.nat }; });
      chk(info.e2new.kind === 'prove' && info.e2new.child === 'pod' && info.e2new.childNat === 'objective', 'E2: live_new carries the type («ثابت کنید» ⇒ prove); a look-back child gets its own type («… هنوز درست است؟» ⇒ pod) and inherits the judge ' + JSON.stringify(info.e2new));
    });

    /* ===================== E3 — فهرستِ هر داور = فهرستِ کاملِ پولیا بازنویسی‌شده، نه زیرمجموعه ===================== */
    await section('E3', async () => {
      const CORE_P = { unk: /به\s*(?:مجهول|حکم)\s*نگاه/, def: /تعریف/, rel: /نتیجه[\s\S]{0,40}روش[\s\S]{0,80}کمکی/, back: /به\s*عقب/, more: /داده[ٔ‌\s]*(?:ها|های|ی)?\s*دیگر/ };
      const CORE_C = { restate: /شکلِ?\s*دیگری\s*بیان/, more: /داده[ٔ‌\s]*(?:ها|های|ی)?\s*دیگر/ };
      const miss = (L, C) => Object.keys(C).filter(k => !L.some(q => C[k].test(q)));
      const PP = await mk({ title: 'بتن', st: 'برای کفِ حیاطِ خانه‌ام بتن بخرم؛ چقدر سفارش بدهم که کم نیاید؟', nat: 'practical' });
      const PLf = await mk({ title: 'شغل', st: 'این پیشنهادِ کار را بپذیرم یا بمانم؟', nat: 'life' });
      const PO = await mk({ title: 'باغچه', st: 'باغچه‌ای مستطیلی دورش ۲۴ متر است و طولش دو برابرِ عرضش؛ طول و عرض چقدر است؟', nat: 'objective' });
      const PV = await mk({ title: 'زوج', st: 'ثابت کنید مجموعِ دو عددِ فرد زوج است.', kind: 'prove' });
      info.e3 = await p.evaluate(ids => ids.map(pid => ({ p: APP.livePhaseQs(pid, 'p'), c: APP.livePhaseQs(pid, 'c') })), [PP, PLf, PO, PV]);
      ['practical', 'life', 'objective', 'prove'].forEach((k, i) => {
        chk(!miss(info.e3[i].p, CORE_P).length, 'E3: the ' + k + ' plan list keeps every core Pólya question (look at the unknown, definitions, related result/method + auxiliary element, backwards, other data) — missing ' + JSON.stringify(miss(info.e3[i].p, CORE_P)));
        chk(!miss(info.e3[i].c, CORE_C).length, 'E3: the ' + k + ' exec list keeps «restate after a failed step» and «other data needed?» — missing ' + JSON.stringify(miss(info.e3[i].c, CORE_C)));
      });
      chk(info.e3[0].p.some(q => /اثرِ محسوس/.test(q)) && !info.e3[1].p.concat(info.e3[1].c).some(q => /اثرِ محسوس|تقریب/.test(q)), 'E3: quantity-only questions stay in the practical list only');
      // مربیِ گفت‌وگو (مسئلهٔ فقط‌درگفت‌وگو) همان محتوا را می‌خواند
      info.e3chat = await p.evaluate(() => ({ pract: APP.ASSIST.coachQs('p', 'pract'), obj: APP.ASSIST.coachQs('p', 'obj'), objc: APP.ASSIST.coachQs('c', 'obj') }));
      chk(!miss(info.e3chat.pract, CORE_P).length && !miss(info.e3chat.obj, CORE_P).length && !miss(info.e3chat.objc, CORE_C).length, 'E3: the chat-only coach lists (pract/obj) carry the same full core ' + JSON.stringify({ a: miss(info.e3chat.pract, CORE_P), b: miss(info.e3chat.obj, CORE_P), c: miss(info.e3chat.objc, CORE_C) }));
      // «اثبات یا رد کن» ِ زندگی: نه «حکم تهی» نه «اثباتی»؛ کارتِ فهمِ pod با واژه‌های فرض/حکم
      const PZ = await mk({ title: 'بدگمانی', st: 'همکارم اطلاعات را عمداً از من پنهان می‌کند — اثبات یا رد کن.', kind: 'pod', nat: 'life' });
      await whole('می‌خواهم بدانم بدگمانی‌ام درست است یا نه', 'آرامشِ کار');
      info.e3pod = { sat: (await p.evaluate(() => { const l = document.querySelector('label[for="lpSat"]'); return l ? l.textContent : ''; })), add: await txt('main .lp-dadd'), intro: await txt('main .lp-u > p.small'),
        hook: await hookText({ id: 'ach_pz', lprob: PZ, msgs: [] }, 'ادامه') };
      chk(!/حکم تهی/.test(info.e3pod.sat) && /موقعیت/.test(info.e3pod.sat) && /فرض/.test(info.e3pod.add) && !/مجهول، هر داده/.test(info.e3pod.intro), 'E3: a life pod understanding card uses hypothesis words (no «حکم تهی», «+ فرضِ دیگر», no «مجهول، هر داده») ' + JSON.stringify({ s: info.e3pod.sat, a: info.e3pod.add }));
      chk(!/نوع: اثباتی|نوع: اثبات یا رد کن/.test(info.e3pod.hook) && /فرضیه/.test(info.e3pod.hook), 'E3: the hook header of a life pod says «فرضیه», not «اثباتی/اثبات یا رد کن» ' + (info.e3pod.hook.match(/# مسئلهٔ زندهٔ[^\n]*/) || [''])[0]);
      // فهرستِ قلاب بریده نمی‌شود (پرسشِ هشتم و پرسشِ بلندِ استقرا کامل)
      const PI = await mk({ title: 'استقرا', st: 'ثابت کنید برای هر n ≥ 1 مجموعِ n عددِ فردِ نخست برابرِ n² است.', kind: 'prove' });
      await understand({ one: 'می‌خواهم ثابت کنم جمعِ فردهای نخست مربع است', unk: 'برای هر n جمع برابرِ n² است', data: ['n ≥ 1 طبیعی است', 'عددهای فرد ۱، ۳، ۵، …'], cond: 'جمعِ n عددِ فردِ نخست = n²', guess: 'درست است' });
      info.e3hook = await hookText({ id: 'ach_pi', lprob: PI, msgs: [] }, 'ادامه');
      const line = (info.e3hook.match(/- پرسش‌های همین مرحله[^\n]*/) || [''])[0], Q = await p.evaluate(pid => APP.livePhaseQs(pid, 'p'), PI);
      chk(Q.length > 7 && Q.every(q => line.indexOf('«' + q + '»') >= 0), 'E3: the hook lists the WHOLE phase list, every question whole (no cut at 7, no clip) ' + Q.length + ' ' + line.slice(0, 120));
    });

    /* ===================== E4 — وارسی‌های واژه‌محور هشدار می‌دهند، سد نمی‌کنند؛ و مثبتِ کاذب‌ها ===================== */
    await section('E4', async () => {
      // واحدها: هر گزاره جدا (⇒ / پس)
      info.e4u = await p.evaluate(() => [APP.liveUnitsCheck('۰.۱۲ متر ⇒ ۲۰۰ مترمربع × ۰.۱۲ متر = ۲۴ مترمکعب'), APP.liveUnitsCheck('ضخامت ۱۲ سانتی‌متر است پس ۲۰۰ مترمربع × ۰.۱۲ متر = ۲۴ مترمکعب'), APP.liveUnitsCheck('۲۰۰ متر مربع × ۱۲ = ۲۴ متر مکعب')].map(x => x.ok));
      chk(info.e4u[0] && info.e4u[1] && !info.e4u[2], 'E4: the units checker splits on ⇒ / «پس» (a conversion before the product no longer glues to it); a bare factor is still asked ' + JSON.stringify(info.e4u));
      // دوری: «معلوم است» = داده شده؛ واژهٔ مجهول بی ادعای مقدار دوری نیست؛ «پس کارِ یکی از آن‌هاست» هنوز دوری است
      const circ = async (title, st, o) => { const pid = await mk({ title, st, nat: o.nat || 'objective' }); await understand(Object.assign({ expectMiss: true }, o)); const o2 = { pid, card: await has('main .lp-suffcirc'), miss: await txt('main .lp-umiss') }; if (!o2.miss) { await clickIf('main .lp-u .sv-g2'); } return o2; };
      info.e4c1 = await circ('پله‌ها', 'به چند راه می‌شود از ۳۰ پله بالا رفت اگر هر گام ۱، ۲ یا ۳ پله باشد؟', { one: 'می‌خواهم شمارِ راه‌ها را بیابم', unk: 'شمارِ راه‌های بالا رفتن', data: ['۳۰ پله', 'هر گام ۱، ۲ یا ۳ پله'], cond: 'هر گام ۱ یا ۲ یا ۳ پله', sat: 'yes', suff: 'کافی است', suffW: 'تعدادِ پله و گام‌های مجاز معلوم است' });
      info.e4c2 = await circ('دایره', 'دایره‌ای بیابید که بر سه خطِ داده‌شده مماس باشد.', { one: 'می‌خواهم دایرهٔ مماس بر سه خط را بیابم', unk: 'مرکز و شعاعِ دایره', data: ['سه خطِ داده‌شده', 'خط‌ها موازی نیستند'], cond: 'دایره بر هر سه خط مماس است', sat: 'yes', suff: 'کافی است', suffW: 'سه شرطِ مماس برای مرکز و شعاع' });
      chk(!info.e4c1.card && !/پیش‌فرض/.test(info.e4c1.miss) && !info.e4c2.card && !/پیش‌فرض/.test(info.e4c2.miss), 'E4: «… معلوم است» (given) and a reason that only names the unknown are not «circular» ' + JSON.stringify([info.e4c1.miss, info.e4c2.miss]));
      // تقریب با واژه و مجهولِ کیفی
      const PQ = await mk({ title: 'صندوق', st: 'پولِ صندوقِ مغازه‌ام ۲ میلیون تومن کم شده؛ می‌خواهم بفهمم چه کسی برداشته.', nat: 'practical' });
      const mq = await understand({ one: 'می‌خواهم بفهمم چه کسی پول را برداشته', unk: 'چه کسی پول را برداشته', data: ['۲ میلیون تومن کم است', 'سه نفر کلید دارند'], cond: 'بی‌گناهی را متهم نکنم', prac: true, prApprox: 'فقط اسمِ همان آدم را می‌خواهم', measure: 'کسری = ۲ میلیون تومن', expectMiss: true });
      chk(!/کدام تقریب بس است/.test(mq), 'E4: a qualitative unknown (who?) needs no numeric approximation ' + mq);
      const PH = await mk({ title: 'خانوارها', st: 'برای نظرسنجیِ محله‌ام چند خانوار را بپرسم که بس باشد؟ ۴۰۰ خانوار داریم.', nat: 'practical' });
      const mh = await understand({ one: 'می‌خواهم بدانم چند خانوار بپرسم', unk: 'شمارِ خانوارهای لازم', data: ['۴۰۰ خانوار', 'یک هفته وقت دارم'], cond: 'نتیجه نمایندهٔ محله باشد', prac: true, prApprox: 'نصف خانوارها بسه', measure: 'شمار ≤ ۴۰۰ خانوار', expectMiss: true });
      chk(!/کدام تقریب بس است/.test(mh), 'E4: a word quantity («نصف خانوارها بسه») is an approximation ' + mh);
      // هشدار، نه سد: «هیچی رو بیرون نمی‌ذارم» یک بار چالش + «ثبت با همین — دلیل»؛ با دلیل ثبت می‌شود و دلیل ذخیره
      const PS = await mk({ title: 'اسباب‌کشی', st: 'وسایلِ خانه‌ام را با یک وانت ۱۲ مترمکعبی ببرم؛ چند سرویس لازم است؟', nat: 'practical' });
      const ms = await understand({ one: 'می‌خواهم بدانم چند سرویس وانت لازم است', unk: 'شمارِ سرویس‌ها', data: ['وانت ۱۲ مترمکعب است', 'وسایل حدودِ ۳۰ مترمکعب است'], cond: 'هیچ وسیله‌ای جا نماند', prac: true, prLine: 'هیچی رو بیرون نمی‌ذارم', measure: 'سرویس‌ها × ۱۲ مترمکعب ≥ ۳۰ مترمکعب', expectMiss: true });
      chk(/کجا خط می‌کشی/.test(ms) && await has('#lpSoftWhy') === 1, 'E4: a wording heuristic shows its challenge once and offers «ثبت با همین — دلیل» ' + ms);
      await fillIf('#lpSoftWhy', 'همهٔ وسایل شکستنی‌اند و هیچ‌کدام را نمی‌شود جا گذاشت');
      await click('main .lp-usave'); await clickIf('main .lp-u .sv-g2');
      info.e4s = (await S(PS)).u[1];
      chk(info.e4s && info.e4s.done && info.e4s.soft && /شکستنی/.test(info.e4s.soft.why) && info.e4s.soft.keys.includes('line'), 'E4: «ثبت با همین — دلیل» saves the understanding and stores the reason ' + JSON.stringify(info.e4s && info.e4s.soft));
      // حالتِ حدی: نامِ خانه‌های شطرنج داده نیست؛ مسئلهٔ عددیِ کامل‌بیان‌شده هنوز می‌پرسد
      const PC = await mk({ title: 'مات', st: 'سفید در دو حرکت مات می‌کند؛ حرکتِ اول چیست؟', nat: 'objective' });
      await understand({ one: 'می‌خواهم حرکتِ اولِ مات را بیابم', unk: 'حرکتِ اولِ سفید', data: ['شاهِ سیاه روی h8', 'وزیرِ سفید روی d1 و رخ روی a1'], cond: 'مات در دو حرکت' });
      info.e4l = await p.evaluate(pid => APP.liveLookFlags(pid).limit, PC);
      chk(info.e4l === false && info.e4c1.pid && (await p.evaluate(pid => APP.liveLookFlags(pid).limit, info.e4c1.pid)) === true, 'E4: the limiting case is required for objective find problems with numeric data, not for chess square names');
    });

    /* ===================== E5 — بازنگری با تک‌تکِ بخش‌های شرط؛ پرسشِ اجرا پس از نتیجه؛ قیاس؛ نگاشت؛ داده‌های کنارگذاشته ===================== */
    await section('E5a', async () => {
      const PF = await mk({ title: 'ضلع‌ها', st: 'محیطِ مثلثی ۳۰ است؛ a دو برابرِ b و c دو واحد بیشتر از b است. ضلع‌ها چقدرند؟', nat: 'objective' });
      await understand({ one: 'می‌خواهم سه ضلعِ مثلث را بیابم', unk: 'طولِ ضلع‌های a و b و c', data: ['محیط ۳۰ است', 'a دو برابرِ b است', 'c دو واحد بیشتر از b است', 'مثلث روی کاغذِ آبی کشیده شده'], cond: 'a + b + c = 30\nهر سه ضلع مثبت‌اند', depNo: true, guess: 'هر سه ضلع برابرند' });
      // E3: «همهٔ داده‌ها؟» در آغازِ طرح نه — فقط پس از طرح یا وقتی کاربر گیر کرده
      info.e3b3 = { start: /داده‌هایی که هنوز در کارِ حل نیامده‌اند/.test(await hookText({ id: 'ach_b3a', lprob: PF, msgs: [] }, 'خب، حالا طرح')), stuck: /داده‌هایی که هنوز در کارِ حل نیامده‌اند/.test(await hookText({ id: 'ach_b3b', lprob: PF, msgs: [] }, 'گیر کردم، نمی‌دونم')) };
      chk(!info.e3b3.start && info.e3b3.stuck, 'E3: the unused-data line is not sent at the START of planning (every datum is unused then), only when stuck or after a plan ' + JSON.stringify(info.e3b3));
      await addMove('mv_equation', 'هر ضلع را با نماد می‌نویسم تا شرطِ محیط معادله شود');
      await p.fill('#lpPlan', 'نخست هر ضلع را برحسبِ b می‌نویسم سپس در محیط جای‌گذاری می‌کنم'); await W(350);
      for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) {
        const t = await p.evaluate(id => (document.querySelector('main .lp-plan .lp-un[data-d="' + id + '"]') || {}).textContent || '', id);
        if (/آبی/.test(t)) { await sel('#lpPU_a_' + id, 'skip'); await p.fill('#lpPU_w_' + id, 'رنگِ کاغذ تزئینی است و در طولِ ضلع‌ها اثری ندارد'); } else { await sel('#lpPU_a_' + id, 'use'); await p.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); }
      }
      await click('main .lp-plansave');
      chk((await S(PF)).live.plan, 'E5 setup: plan saved with the decorative datum set aside');
      // گیر ⇒ دادهٔ کنارگذاشته دوباره پیش کشیده می‌شود
      info.e5aside = await hookText({ id: 'ach_e5a', lprob: PF, msgs: [] }, 'گیر کردم، نمی‌دونم چی کار کنم');
      chk(/کنار گذاشته بود: «مثلث روی کاغذِ آبی/.test(info.e5aside), 'E5: a datum set aside («تزئینی») is raised again when the user is stuck ' + (info.e5aside.match(/- کاربر گیر کرده[^\n]*/) || ['—'])[0]);
      await objStep('هر ضلع برحسبِ b: a = 2b و c = b + 2', 'از داده‌های دوم و سوم');
      // معادله کم است ⇒ پرسشِ پیشنهادیِ مربی
      await fillIf('#lpEqUnk', '۳'); await clickIf('main .lp-eqsave');
      info.e5eq = await p.evaluate(pid => APP.liveCoach(pid).q, PF);
      chk(/کدام بخشِ شرط هنوز به معادله/.test(info.e5eq), 'E5: the equations verdict («معادله کم است») reaches the coach question ' + info.e5eq);
      await objStep('فرض کنیم b عددی نباشد که محیط را ۳۰ کند؛ آن‌گاه 2b + b + b + 2 = 30 تناقض می‌دهد، پس 4b + 2 = 30 و b = 7', 'از جای‌گذاری در محیط');
      chk((await p.evaluate(pid => APP.liveLookFlags(pid).indirect, PF)) === true, 'E5: indirect ⇒ direct is offered for a proof-shaped step of an objective FIND problem');
      await click('main .lp-solved');
      // هر بخشِ شرط جدا؛ وارسی‌ای که بخشی را نفی می‌کند ⇒ هشدار؛ «نه» ⇒ ناتمام
      chk(await has('#lpBCP_0') === 1 && await has('#lpBCP_1') === 1, 'E5: look-back asks each recorded condition part «نتیجه این بخش را برآورده می‌کند؟»');
      chk(await has('#lpBBest') === 1 && await p.evaluate(() => [...document.querySelectorAll('#lpBBest option')].some(o => /^مجهول \(یا حکمی که باید ثابت شود\) چیست؟$/.test(o.textContent))), 'E5: «کدام پرسش کمک کرد؟» is always present and lists page-answered questions whole');
      await p.fill('#lpBChk', 'a = 14 و b = 7 و c = 9؛ ولی a + b + c = 30 برقرار نیست چون جمع ۳۰ نشد و ۳۰ نیست'); await sel('#lpBRes', 'نتیجه سالم ماند');
      chk(await has('main .lp-bpneg[data-part="0"]') === 1, 'E5: a check text that negates a part is pointed out next to that part');
      await sel('#lpBCP_0', 'no'); await sel('#lpBCP_1', 'yes');
      chk(await has('main .lp-bdefect') === 1, 'E5: any «نه» on a condition part ⇒ the defect card («هنوز حل نشده»), never «سالم»');
      await p.fill('#lpBDefW', 'جمعِ ضلع‌ها ۳۰ نشد — گامِ جای‌گذاری را دوباره حساب می‌کنم'); await sel('#lpBDefTo', 'c'); await sel('#lpBWant', 'same');
      await click('main .lp-lbsave');
      info.e5cl = await p.evaluate(pid => APP.liveClosure(pid), PF);
      chk(info.e5cl.state === 'incomplete' && /ناتمام — برگرد به «اجرا»/.test(info.e5cl.label) && !(await S(PF)).b[1], 'E5: the problem stays «ناتمام — برگرد به …» ' + JSON.stringify({ st: info.e5cl.state, l: info.e5cl.label }));
      // دوباره «حل شد» ⇒ بازنگریِ کامل با «ساختار — هم‌ریخت» ⇒ نگاشت به فرزند و قلابش می‌رسد
      await go('lprob', PF, 'exec'); await click('main .lp-solved');
      await fillBack({ newProb: 'چهارضلعی‌ای با محیطِ ۴۰ که هر ضلعش برحسبِ یک ضلع داده شده', share: 'form', map: 'ضلع‌های مثلث ⇐ ضلع‌های چهارضلعی، محیطِ ۳۰ ⇐ محیطِ ۴۰' });
      await sel('#lpBCP_0', 'yes'); await sel('#lpBCP_1', 'yes'); await selIf('#lpBDefTo', 'c');
      await click('main .lp-lbsave');
      info.e5b = (await S(PF)).b[1];
      chk(info.e5b && info.e5b.done && info.e5b.parts && info.e5b.parts.every(x => x.ok === 'yes') && info.e5b.direct, 'E5: look-back saved with each condition part and the direct-proof answer ' + JSON.stringify(info.e5b && { parts: info.e5b.parts, d: !!info.e5b.direct }));
      const CH = info.e5b && info.e5b.newPid;
      if (CH) {
        await go('lprob', CH);
        info.e5map = { page: await txt('main .lp-childmap'), hook: await hookText({ id: 'ach_e5m', lprob: CH, msgs: [] }, 'شروع کنیم') };
        chk(/محیطِ ۳۰ ⇐ محیطِ ۴۰/.test(info.e5map.page) && /نگاشتِ هم‌ریختیِ خودِ کاربر/.test(info.e5map.hook) && /محیطِ ۳۰ ⇐ محیطِ ۴۰/.test(info.e5map.hook), 'E5: the isomorphism mapping is carried to the child page and its hook ' + JSON.stringify({ p: info.e5map.page.slice(0, 80) }));
      } else chk(false, 'E5: no child problem was made');
    });

    await section('E5b', async () => {
      const PP = await mk({ title: 'فرد و اول', st: 'اثبات یا رد کن: هر عددِ فردِ بزرگ‌تر از ۱ اول است.', kind: 'pod' });
      await understand({ one: 'می‌خواهم ببینم هر فردی اول است یا نه', unk: 'هر عددِ فردِ بزرگ‌تر از ۱ اول است', data: ['عدد فرد است', 'عدد بزرگ‌تر از ۱ است'], cond: 'عدد اول است', suff: 'کافی است', suffW: 'همهٔ فرض داده شده' });
      await addMove('mv_special', 'چند عددِ فردِ کوچک را یکی‌یکی می‌آزمایم تا مثالِ نقض پیدا شود');
      await savePlan('نخست چند عددِ فرد را می‌آزمایم سپس مثالِ نقض می‌یابم');
      await objStep('۳ و ۵ و ۷ اول‌اند؛ برای ۹ هنوز مطمئن نیستم', 'حسابِ مستقیم');
      await click('main .lp-solved');
      info.e5pod = await p.evaluate(() => [...document.querySelectorAll('#lpBPod option')].map(o => o.value));
      chk(info.e5pod.includes('gap'), 'E5: the pod look-back offers «هیچ‌کدام — استدلالم شکاف دارد» ' + JSON.stringify(info.e5pod));
      await selIf('#lpBPod', 'gap');
      chk(await has('main .lp-bdefect') === 1 && await has('#lpBHyp') === 0, 'E5: «استدلالم شکاف دارد» ⇒ the defect card directly (no «ثابت/رد کردم» needed)');
    });

    await section('E5c', async () => {
      const PT = await mk({ title: 'صندوق', st: 'پولِ صندوقِ مغازه کم شده؛ می‌خواهم بفهمم چه کسی برداشته.', nat: 'life' });
      await understand({ one: 'می‌خواهم بفهمم چه کسی پول را برداشته', unk: 'کسی که پول را برداشته', data: ['صبح صندوق را شمردم', 'عصر کمتر بود'], cond: 'بی‌گناهی را متهم نکنم', sat: 'yes', suff: 'کافی است', suffW: 'فقط سه نفر کلید داشتند پس کارِ یکی از آن‌هاست', expectMiss: true });
      await fillIf('#lpSuffCirc', 'هیچ داده‌ای نمی‌گوید؛ پیش‌فرض است که کسِ دیگری کلید نداشت');
      if (!(await has('main .lp-u .sv-g2'))) await click('main .lp-usave'); await clickIf('main .lp-u .sv-g2');
      chk((await S(PT)).u[1] && (await S(PT)).u[1].presup, 'E5 setup: presupposition saved');
      // گیر در طرح ⇒ «از خواسته به عقب» نخست
      info.e5stuck = await p.evaluate(pid => ({ a: APP.liveCoach(pid).q, b: APP.liveCoach(pid, { stuck: true }).q }), PT);
      chk(/به\s*عقب/.test(info.e5stuck.b) && !/به\s*عقب/.test(info.e5stuck.a), 'E5/E3: stuck going forward in plan ⇒ «از خواسته به عقب» is suggested first ' + JSON.stringify(info.e5stuck));
      await addMove('mv_special', 'اول فقط شیفتِ عصر را بررسی می‌کنم تا دامنه تنگ شود');
      await savePlan('نخست دوربینِ مغازه را نگاه می‌کنم سپس با هر سه نفر جدا حرف می‌زنم');
      await p.fill('#lpStep', 'فیلمِ دوربینِ عصر را نگاه کنم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'یکی از سه نفر را سرِ صندوق می‌بینم'); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا');
      await click('main .lp-stepsave');
      await day(1); await go('lprob', PT, 'exec');
      await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', 'نفرِ چهارمی که کلید نداشت سرِ صندوق رفت'); await sel('#lpOMatch', 'no'); await sel('#lpOProg', 'کمی'); await sel('#lpOWant', 'same'); await selIf('#lpOGuess', 'none');
      await click('main .lp-outsave');
      info.e5c = await p.evaluate(pid => { const a = APP.liveCoach(pid).q, b = APP.liveCoach(pid, { asked: [a] }).q, c = APP.liveCoach(pid, { asked: [a, b] }).q; return { a, b, c }; }, PT);
      chk(/پیش‌فرضی که نگه داشتی/.test(info.e5c.a) && /کسِ دیگری کلید نداشت/.test(info.e5c.a), 'E5: a step result that breaks the saved presupposition raises it again ' + info.e5c.a);
      chk(/فاصله/.test(info.e5c.b) && !/پیش از این گام/.test(info.e5c.b), 'E5: after an outcome the exec question moves to «فاصله با پیش‌بینی…» ' + info.e5c.b);
      chk(/شکلِ دیگری بیان/.test(info.e5c.c), 'E5/E3: after a failed step ⇒ «مسئله را به شکلِ دیگری بیان کن» ' + info.e5c.c);
      // قیاس: نسبتی که در گفت‌وگو به کمیتِ تازه برده شد ⇒ «کجا این شباهت می‌شکند؟»
      const q0 = await p.evaluate(pid => APP.livePhaseQs(pid, 'c'), PT);
      await p.evaluate(pid => { const se = APP.ASSIST.newSession(); APP.liveBindSession(pid, se, { force: true }); se.msgs.push({ role: 'user', text: 'مساحت ۲٫۸ برابر شد؛ پس زمانِ پختن هم ۲٫۸ برابر می‌شه؟', at: new Date().toISOString() }); APP.S.put(se); }, PT);
      const q1 = await p.evaluate(pid => APP.livePhaseQs(pid, 'c'), PT);
      chk(!q0.some(q => /شباهت می‌شکند/.test(q)) && q1.some(q => /شباهت می‌شکند/.test(q)), 'E5: a ratio carried to a new quantity in chat («زمان هم ۲٫۸ برابر؟») asks where the analogy breaks');
    });

    await section('E5d', async () => {
      // «کدام پرسش کمک کرد؟»: تکهٔ یک پرسشِ دستیار ⇒ همان پرسشِ کامل؛ پیش‌درآمدِ پیام بیرون
      const PB = await mk({ title: 'پنج نقطه', st: 'پنج نقطه در مربعِ واحد؛ ثابت کن دو تا فاصله‌ای کمتر از ۰٫۷۵ دارند.', kind: 'prove' });
      const full = await p.evaluate(pid => APP.livePhaseQs(pid, 'p').find(q => /عنصرِ کمکی لازم است/.test(q)) || '', PB);
      await p.evaluate(([pid, full]) => { const se = APP.ASSIST.newSession(); APP.liveBindSession(pid, se, { force: true }); const parts = full.split(/(?<=[؟?])\s+/); se.msgs.push({ role: 'ai', text: 'خوب شروع کردی. ' + full, at: new Date().toISOString() }); APP.S.put(se); }, [PB, full]);
      info.e5chat = await p.evaluate(pid => APP.liveChatQs(pid), PB);
      chk(full && info.e5chat.includes(full) && !info.e5chat.some(q => q !== full && /عنصرِ کمکی لازم است|^خوب شروع کردی/.test(q)), 'E5: chat questions are listed whole (no preamble, a fragment maps to the whole question) ' + JSON.stringify(info.e5chat));
    });

    /* ===================== E8 — بندهای کوچکِ «live» ===================== */
    await section('E8-life', async () => {
      await day(0);
      const PW = await mk({ title: 'ورزشِ صبح', st: 'صبح‌ها ورزش کنم یا شب‌ها؟ نمی‌دانم کدام برایم بهتر است.', nat: 'life' });
      await understand({ one: 'می‌خواهم بهترین وقتِ ورزش را بیابم', unk: 'صبح یا شب', data: ['صبح‌ها نیم ساعت وقت دارم', 'شب‌ها خسته‌ام'], cond: 'کار را عقب نیندازد', guess: 'صبح بهتر است' });
      await addMove('mv_special', 'یک هفته فقط صبح را می‌آزمایم تا ببینم چه می‌شود');
      // پیامِ ردِ کهنه از «پیام‌های اخیرِ صفحه» ِ دستیار هم می‌رود
      const rtA = await p.evaluate(() => APP.ASSIST.recentToasts());
      await p.fill('#lpPlan', ''); await click('main .lp-plansave');
      const rt0 = (await p.evaluate(() => APP.ASSIST.recentToasts())).filter(t => rtA.indexOf(t) < 0 && /^اول این‌ها|^هنوز نه/.test(t));
      await savePlan('نخست یک هفته صبح ورزش می‌کنم سپس یک هفته شب');
      await p.fill('#lpStep', 'فردا صبح نیم ساعت بدوم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'سرِ کار سرحال‌ترم'); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا');
      await click('main .lp-stepsave');
      const rt1 = await p.evaluate(() => APP.ASSIST.recentToasts());
      chk(rt0.length > 0 && !rt1.some(t => rt0.indexOf(t) >= 0), 'E8: a refused-save toast leaves «پیام‌های اخیرِ صفحه» once a later save succeeds ' + JSON.stringify({ rt0, rt1 }));
      // 🌱 پس از ثبت دوباره خالی نمی‌آید (روزِ صفحه = روزِ واقعیِ ثبت)
      const real = await p.evaluate(() => APP.localDay(new Date().toISOString()));
      await p.evaluate(x => { window.__day = x; }, real); await go('lprob', PW, 'exec');
      await p.evaluate(pid => { const pg = APP.S.get('eprog_' + pid); pg.solve.live.steps.forEach(st => { st.due = APP.today(); }); APP.S.put(pg); }, PW); await go('lprob', PW, 'exec');
      await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', 'همان‌قدر خسته بودم'); await sel('#lpOMatch', 'no'); await sel('#lpOProg', 'نه'); await sel('#lpOWant', 'same'); await selIf('#lpOGuess', 'none');
      await click('main .lp-outsave');
      const uid = await p.evaluate(() => { const s = document.querySelector('main .lp-after .sv-willf select'); return s ? s.id.replace(/des$/, '') : ''; });
      chk(!!uid, 'E8 setup: the 🌱 card appears after a step without progress');
      if (uid) {
        await sel('#' + uid + 'des', await p.evaluate(id => [...document.querySelectorAll('#' + id + 'des option')].map(o => o.value).filter(Boolean)[0], uid));
        await selIf('#' + uid + 'hope', await p.evaluate(id => ([...document.querySelectorAll('#' + id + 'hope option')].map(o => o.value).filter(Boolean)[0]) || '', uid));
        await p.fill('#' + uid + 'cur', 'این‌که بدنم با کدام بهتر کنار می‌آید'); await p.fill('#' + uid + 'step', 'امشب کفشِ ورزشی را کنارِ در بگذارم'); await p.fill('#' + uid + 'when', 'امشب ساعتِ ۱۰، پنج دقیقه');
        await selIf('#' + uid + 'bud', await p.evaluate(id => ([...document.querySelectorAll('#' + id + 'bud option')].map(o => o.value).filter(Boolean)[0]) || '', uid));
        await click('main .lp-after .sv-willsave');
        await go('lprob', PW, 'exec');
        info.e8will = { forms: await has('main .sv-willf'), chk: await has('main .sv-willchk'), done: await txt('main .lp-willdone') };
        chk(info.e8will.forms === 0 && info.e8will.chk === 0 && /کفشِ ورزشی/.test(info.e8will.done), 'E8: after saving the 🌱 step the card does not render again empty (nor ask «انجامش دادی؟» the same day) ' + JSON.stringify(info.e8will));
      }
      await day(0);
      // دوره‌ی کمون: «دیروز» فقط اگر دیروز بود
      await go('lprob', PW, 'exec');
      if (await has('main .lp-incub')) await click('main .lp-incub');
      chk((await S(PW)).live.incub, 'E8 setup: incubation started');
      await day(2); await go('lprob', PW, 'exec');
      info.e8inc = { card: await txt('main .lp-incubback h4'), today: await p.evaluate(() => (APP.dueList() || []).map(x => x.txt).filter(t => /😴/.test(t))) };
      chk(/۲ روز پیش/.test(info.e8inc.card) && !/دیروز/.test(info.e8inc.card) && info.e8inc.today.some(t => /۲ روز پیش/.test(t)), 'E8: the incubation card says the real day count («۲ روز پیش»), not «دیروز» ' + JSON.stringify(info.e8inc));
      await p.fill('#lpIncubT', 'شاید مسئله خستگی است نه ساعت'); await click('main .lp-incubgo');
      // مرورِ میانهٔ راه: پس از ثبتِ دیرهنگام همان روز دوباره نمی‌آید
      await day(14); await go('lprob', PW, 'exec');
      chk(await has('main .lp-checkin') === 1, 'E8 setup: mid-course check-in is due');
      await p.fill('#lpCkP', 'فهمیدم خستگی مهم‌تر از ساعت است'); await p.fill('#lpCkS', 'زود نتیجه می‌گیرم'); await sel('#lpCkW', 'same'); await click('main .lp-ckgo');
      info.e8ck = { card: await has('main .lp-checkin'), today: await p.evaluate(() => (APP.dueList() || []).some(x => /میانهٔ راهِ «ورزشِ صبح»/.test(x.txt || ''))) };
      chk(info.e8ck.card === 0 && !info.e8ck.today, 'E8: a saved mid-course check-in is not shown again empty the same day (card and «امروز») ' + JSON.stringify(info.e8ck));
      // ضرب‌المثلِ خودِ کاربر ⇒ سطرِ C150؛ سطرهای کتاب برای مرحله
      info.e8prov = await hookText({ id: 'ach_e8p', lprob: PW, msgs: [] }, 'آب که از سر گذشت چه یک وجب چه صد وجب؛ دیگه فایده نداره');
      chk(/ضرب‌المثلِ خودش را آورد \(«آب که از سر گذشت/.test(info.e8prov) && /ضدِ خود/.test(info.e8prov), 'E8: the user\'s own proverb gets a prompt line (C150: it has its opposite) ' + (info.e8prov.match(/- کاربر ضرب‌المثل[^\n]*/) || ['—'])[0]);
      chk(/ناتمام/.test((info.e8prov.match(/- از کتاب برای همین مرحله[^\n]*/) || [''])[0]), 'E8: the exec-phase hook carries «label heuristic reasoning incomplete» from the book');
    });

    await section('E8-obj', async () => {
      await day(0);
      const PB = await mk({ title: 'باغچه', st: 'باغچه‌ای مستطیلی دورش ۲۴ متر است و طولش دو برابرِ عرضش؛ طول و عرض چقدر است؟', nat: 'objective' });
      await understand({ one: 'می‌خواهم طول و عرضِ باغچه را بیابم', unk: 'طول و عرض', data: ['محیط ۲۴ متر است', 'طول دو برابرِ عرض است'], cond: 'محیط = ۲ × (طول + عرض)', depNo: true, guess: 'طول ۸ و عرض ۴', suff: 'کافی است', suffW: 'دو داده دو معادله می‌دهند' });
      info.e8plan = await hookText({ id: 'ach_e8b', lprob: PB, msgs: [] }, 'ادامه');
      chk(/پارادوکسِ مخترع/.test(info.e8plan) && /به تعریف‌ها برگرد/.test((info.e8plan.match(/- از کتاب برای همین مرحله[^\n]*/) || [''])[0]), 'E8: the plan-phase hook carries the inventor\'s paradox and «back to definitions» from the book');
      await addMove('mv_equation', 'طول و عرض را با نماد می‌نویسم تا محیط معادله شود');
      await savePlan('نخست عرض را x می‌گیرم سپس محیط را برحسبِ x می‌نویسم');
      info.e8toast = await toasts();
      chk(!/با پیش‌بینی/.test(info.e8toast) && /روشن می‌بینی/.test(info.e8toast), 'E8: an objective problem gets no «… با پیش‌بینی» life wording after the plan ' + info.e8toast);
      // «جای‌گذاری در شرط» وارسی است، نه عوض کردنِ طرح
      info.e8chk = await p.evaluate(pid => APP.liveStepFollowsTag(pid, 'هر دو جواب رو در شرط اصلی گذاشتم: ع=۳ ⇒ درست؛ ع=−۲ ⇒ نادرست'), PB);
      chk(info.e8chk === 'check', 'E8: «… در شرط اصلی گذاشتم» (substitution) is a checking step ' + info.e8chk);
      await objStep('عرض x و طول 2x؛ 2(2x + x) = 24 پس x = 4', 'از تعریفِ محیط');
      await click('main .lp-solved');
      info.e8dep = { l: await p.evaluate(() => (document.querySelector('label[for="lpBDep"]') || {}).textContent || ''), o: await p.evaluate(() => [...document.querySelectorAll('#lpBDep option')].map(o => o.value + ':' + o.textContent)) };
      chk(/داده‌ای هست که با مجهول عوض شود؟/.test(info.e8dep.l) && info.e8dep.o.some(x => /^yes:بله/.test(x)) && info.e8dep.o.some(x => /^no:نه/.test(x)), 'E8: lpBDep label and values agree («بله» = yes) ' + JSON.stringify(info.e8dep));
      await sel('#lpBMulti', 'many');
      chk(await has('#lpBMultiW') === 1, 'E8: «بیش از یکی» gets the follow-up (all found? restate the condition)');
      await p.fill('#lpBChk', 'جای‌گذاری کردم'); await sel('#lpBRes', 'ایرادی یافتم'); await selIf('#lpBCP_0', 'yes');
      await p.fill('#lpBDefW', 'شمارِ جواب‌ها را بد شمردم؛ طرح را عوض می‌کنم'); await sel('#lpBDefTo', 'p'); await sel('#lpBWant', 'same');
      await click('main .lp-lbsave');
      info.e8def = await p.evaluate(pid => ({ ph: APP.livePhase(pid), back: APP.liveClosure(pid).back, view: APP.state.sub }), PB);
      chk(info.e8def.ph === 'p' && info.e8def.back === 'p' && info.e8def.view === 'plan', 'E8: after a defect «back to plan», livePhase, closure.back and the view agree ' + JSON.stringify(info.e8def));
    });

    await section('E8-misc', async () => {
      // بیدی: ویرگول/پرسشِ فارسی پس از فرمول
      info.e8bidi = await p.evaluate(() => APP.ASSIST.bidiNodes('ابعاد: cm³/s ÷ cm² = cm/s، و وقتی y→0، dy/dt چه می‌شود؟').filter(x => x && x.tagName === 'BDI').map(x => x.textContent));
      chk(info.e8bidi.includes('cm³/s ÷ cm² = cm/s') && info.e8bidi.includes('y→0'), 'E8: «cm³/s ÷ cm² = cm/s،» and «y→0،» each stay whole in one isolate ' + JSON.stringify(info.e8bidi));
      // گزینه‌های «کافی است؟» با نوع؛ پاسکال در اجرای اثباتی
      const PV = await mk({ title: 'زوج', st: 'ثابت کنید مجموعِ دو عددِ فرد زوج است.', kind: 'prove' });
      await whole('می‌خواهم ثابت کنم جمعِ دو فرد زوج است', 'کنجکاوم');
      info.e8suff = await p.evaluate(() => [...document.querySelectorAll('#lpSuff option')].map(o => o.textContent).filter(Boolean));
      chk(info.e8suff.some(t => /فرض/.test(t)) && !info.e8suff.some(t => /مجهول/.test(t)), 'E8: the sufficiency options speak of hypothesis for a proof ' + JSON.stringify(info.e8suff));
      chk((await p.evaluate(pid => APP.livePhaseQs(pid, 'c'), PV)).some(q => /پاسکال/.test(q)), 'E8: Pascal\'s rule is in the prove execution questions');
      // «کیش نیست»
      const PC = await mk({ title: 'مات در دو', st: 'سفید در دو حرکت مات می‌کند؛ حرکتِ اول چیست؟', nat: 'objective' });
      await understand({ one: 'می‌خواهم حرکتِ اولِ مات را بیابم', unk: 'حرکتِ اولِ سفید', data: ['شاهِ سیاه در گوشه است', 'سفید وزیر و رخ دارد'], cond: 'مات در دو حرکت' });
      await addMove('mv_special', 'اول کیش‌های ممکنِ وزیر را یکی‌یکی می‌سنجم');
      await savePlan('نخست با وزیر کیشِ دیگری می‌دهم سپس با رخ مات می‌کنم');
      info.e8kish = await p.evaluate(pid => APP.liveStepFollowsTag(pid, 'حرکتِ اول: وزیر b7 (کیش نیست) و بعد رخ a8 مات'), PC);
      chk(info.e8kish === '', 'E8: a step that negates the plan\'s move does not follow it through other shared words («وزیر/مات») ' + JSON.stringify(info.e8kish));
      // «آزمون را نادیده می‌گیرم» دلیلی می‌خواهد که هزینه/خطرِ آزمون را بگوید
      const PG = await mk({ title: 'باشگاه', st: 'عضوِ باشگاهِ گران‌تر بشوم یا ارزان‌تر؟', nat: 'life' });
      await whole('می‌خواهم باشگاهِ مناسب را برگزینم', 'سلامتی');
      await p.fill('#lpUnk', 'کدام باشگاه'); await p.fill('#lpD_d1', 'باشگاهِ اول گران است'); await p.fill('#lpD_d2', 'باشگاهِ دوم دور است'); await p.fill('#lpCond', 'هفته‌ای سه بار بروم');
      await selIf('#lpSat', 'yes'); await sel('#lpSuff', 'ناکافی است — چیزی کم است'); await p.fill('#lpSuffW', 'هنوز همه را نمی‌دانم');
      await p.fill('#lpGuess', 'گران‌تر بهتر است'); await sel('#lpConf', '60'); await p.fill('#lpTest', 'یک ماه آزمایشی می‌روم');
      await sel('#lpIfRef', await p.evaluate(() => [...document.querySelectorAll('#lpIfRef option')].map(o => o.value).find(v => /نادیده/.test(v))));
      await p.fill('#lpIfRefW', 'حدسم خیلی قوی است و مطمئنم درست است');
      await click('main .lp-usave');
      info.e8ifref = await txt('main .lp-umiss');
      chk(/هزینه یا خطرِ خودِ آزمون/.test(info.e8ifref), 'E8: «آزمون را نادیده می‌گیرم» needs a reason that names a cost/risk of the test ' + info.e8ifref);
    });

    await section('E8-prac', async () => {
      await day(0);
      // شمارش: «به چند روش …؟» ابزارِ شمارش را در جعبهٔ حدس می‌آورد
      const PK = await mk({ title: 'پله', st: 'به چند روش می‌شود از ۱۰ پله بالا رفت اگر هر گام ۱ یا ۲ پله باشد؟', nat: 'objective' });
      await whole('می‌خواهم شمارِ روش‌های بالا رفتن را بیابم', 'کنجکاوم');
      chk(await p.evaluate(() => APP.kCountRe.test('به چند روش می‌شود بالا رفت؟')) && await has('main [id^="lpGK"][id$="_cnt"]') === 1, 'E8: «به چند روش» is a counting problem (kCountRe) — the guess kit asks «did you count every case once?»');
      // بازنگریِ مسئلهٔ عملی واحد و بُعد را می‌پرسد
      const PR = await mk({ title: 'رنگ', st: 'برای رنگ‌کردنِ دیوارهای اتاقم چند لیتر رنگ بخرم؟ هر لیتر ۱۰ مترمربع را می‌پوشاند.', nat: 'practical' });
      await understand({ one: 'می‌خواهم بدانم چند لیتر رنگ بخرم', unk: 'لیترهای رنگ', data: ['هر لیتر ۱۰ مترمربع می‌پوشاند', 'دیوارها حدودِ ۴۰ مترمربع است'], cond: 'کم نیاید', prac: true, measure: 'لیتر = ۴۰ مترمربع ÷ ۱۰ مترمربع × ۱ لیتر' });
      await addMove('mv_special', 'اول یک دیوار را حساب می‌کنم تا کل را ببینم');
      await p.fill('#lpPlan2', 'اگر نشد از فروشندهٔ رنگ می‌پرسم معمولاً چقدر لازم است');
      await savePlan('نخست مساحتِ دیوارها را اندازه می‌گیرم سپس بر پوششِ هر لیتر تقسیم می‌کنم');
      await p.fill('#lpStep', 'فردا دیوارها را با متر اندازه بگیرم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'حدودِ ۴۰ مترمربع می‌شود'); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا');
      await click('main .lp-stepsave');
      await day(1); await go('lprob', PR, 'exec');
      await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', '۴۲ مترمربع شد'); await sel('#lpOMatch', 'yes'); await sel('#lpOProg', 'بله، روشن'); await sel('#lpOWant', 'same'); await selIf('#lpOGuess', 'none');
      await click('main .lp-outsave');
      await click('main .lp-solved');
      chk(await has('#lpBUnits') === 1 && await has('#lpBApprox') === 1, 'E8: the practical look-back asks units/dimensions too (A152)');
      // E4: «±۱۰٪» پاسخِ کوتاه ولی درستِ «تقریبت بس بود؟» است
      await fillBack({ newProb: 'رنگِ سقف با همان روش: مساحت ÷ پوششِ هر لیتر' }); await fillIf('#lpBApprox', '±۱۰٪'); await fillIf('#lpBUnits', 'مترمربع ÷ مترمربع بر لیتر = لیتر'); await fillIf('#lpBLaw', 'برای اتاق‌های تا ۵۰ مترمربع آزموده شد؛ اگر مساحت صفر شود رنگ هم صفر می‌شود');
      for (const id of await p.evaluate(() => [...document.querySelectorAll('select[id^="lpBCP_"]')].map(x => x.id))) await sel('#' + id, 'yes');
      await click('main .lp-lbsave');
      info.e8pr = (await S(PR)).b[1];
      info.e8prT = await toasts();
      chk(info.e8pr && info.e8pr.done && info.e8pr.approx === '±۱۰٪' && info.e8pr.units, 'E4/E8: «±۱۰٪» is accepted as the approximation answer; units stored ' + JSON.stringify(info.e8pr && { a: info.e8pr.approx, u: info.e8pr.units }) + ' ' + info.e8prT.slice(-300));
      chk((await p.evaluate(() => { const r = APP.liveAll().find(x => x.p.title === 'باغچه'); return r ? APP.livePhaseQs(r.p.id, 'b') : []; })).some(q => /نقطه‌های حساس/.test(q)), 'E3: the objective find look-back list keeps «نقطه‌های حساس»');
    });
  } catch (e) { errors.push('exception: ' + (e && e.stack || e)); }
  console.log(JSON.stringify(info));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
