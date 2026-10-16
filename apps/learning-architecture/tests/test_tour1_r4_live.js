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
  } catch (e) { errors.push('exception: ' + (e && e.stack || e)); }
  console.log(JSON.stringify(info));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
