// «گره‌گشا» (a16_knots): ثبت، تونل‌های ۰ تا ۴، رتبه، آزمون‌ها، نردبان، ریشه، مداخله، کارتِ گره، ایمنی و هوش مصنوعی —
// روی نسخهٔ مستقلِ ساخته‌شده (dist/learning-architecture.html)
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
  const bad = async (lab) => { if (await p.locator('main .card.bad').count()) errors.push('render ' + lab + ': ' + await p.locator('main .card.bad').first().innerText()); };
  const st = () => p.evaluate(() => APP.state.view + ':' + APP.state.arg + ':' + APP.state.sub);
  const curCase = () => p.evaluate(() => APP.S.get(APP.state.arg));
  const next = async () => { await p.click('main .kn-next'); await p.waitForTimeout(250); };
  async function intake(o) {
    await p.evaluate(() => APP.goRoot('kcase', 'new', 'in')); await p.waitForTimeout(200);
    for (const k of o.kinds) await p.check(`#knKind_${['problem', 'behavior', 'social', 'emotion', 'repeat', 'inference'].indexOf(k)}`);
    await p.fill('#knWhat', o.what); await p.fill('#knExp', o.exp || 'انتظارِ دیگری داشتم'); await p.fill('#knAct', o.act || 'نتیجه چیزِ دیگری شد');
    await p.fill('#knThk', o.thk || 'همان لحظه کاری را کردم که به ذهنم رسید');
    await p.check(`#knSeen_${['yes', 'no', 'na'].indexOf(o.seen)}`);
    if (o.statement) await p.fill('#knStmt', o.statement);
    if (o.answer) await p.fill('#knAns', o.answer);
    if (o.claim) await p.fill('#knClaim', o.claim);
    if (o.freq) await p.selectOption('#knFreq', o.freq);
    if (o.others) await p.selectOption('#knOthers', o.others);
    if (o.lag) await p.selectOption('#knLag', o.lag);
    if (o.people) await p.fill('#knPeople', o.people);
    if (o.emoName) await p.fill('#knEmoName', o.emoName);
    for (const s of o.stmts || []) await p.check(`main input[data-st="${s}"]`);
    await p.waitForTimeout(700);
  }

  /* ۰) داده: ۱۲ خانواده، شناسه‌های تکنیک واقعی، آزمون‌ها با نوع، وزن‌های ۰ تا ۳ */
  info.data = await p.evaluate(() => {
    const out = { fams: APP.KF.length, ids: APP.KF.map(F => F.id).join(','), sig: 0, probes: 0, acts: 0, ext: 0, badTid: [], badW: [], badKind: [], noSrcExt: [], subs: 0 };
    APP.KF.forEach(F => {
      out.subs += F.subs.length;
      F.signals.forEach(s => { out.sig++; if (!(s.w >= 0 && s.w <= 3) || typeof s.test !== 'function') out.badW.push(s.id); });
      F.probes.forEach(q => { out.probes++; if (['contrast', 'fact', 'counterfactual'].indexOf(q.kind) < 0 || typeof q.scoreFrom !== 'function') out.badKind.push(q.id); });
      F.acts.forEach(a => { out.acts++; if (a.tid && !APP.TM[a.tid]) out.badTid.push(F.id + ':' + a.tid); if (a.pid && !APP.PM[a.pid]) out.badTid.push(F.id + ':' + a.pid); if (a.ext) { out.ext++; if (!a.how) out.noSrcExt.push(a.ext); } });
    });
    return out;
  });
  if (info.data.fams !== 12 || info.data.ids !== 'F1,F2,F3,F4,F5,F6,F7,F8,F9,F10,F11,F12') errors.push('families: ' + info.data.ids);
  if (info.data.badTid.length || info.data.badW.length || info.data.badKind.length || info.data.noSrcExt.length) errors.push('data: ' + JSON.stringify(info.data));

  /* ۱) منو، درِ شروع، دیدنِ فهرست و «تازه» چیزی نمی‌نویسد */
  info.nav = await p.locator('.nav[data-v="kcases"]').count();
  await p.evaluate(() => APP.goRoot('start')); await p.waitForTimeout(150);
  info.door = await p.locator('main .door:has-text("جایی گیر کردم")').count();
  info.putsView0 = await putsDuring(async () => {
    await p.evaluate(() => APP.goRoot('kcases')); await p.waitForTimeout(150);
    await p.click('main .kn-new'); await p.waitForTimeout(150);
    await p.evaluate(() => APP.render()); await p.waitForTimeout(100);
  });
  info.newView = await st();
  info.label = await p.locator('main').getAttribute('data-report-section-label');
  await bad('kcase new');

  /* ۲) مسئلهٔ ریاضی، پاسخ دیده شده ⇒ نردبان خاموش و مسیرِ هم‌ریخت */
  await intake({ kinds: ['problem'], what: 'در آزمونِ ریاضی یک مسئلهٔ ترکیبیات را حل نکردم', seen: 'yes', statement: 'به چند روش می‌توان ۵ مهره را در یک ردیف چید؟', answer: '120', stmts: ['s_rule'] });
  info.mathArg = await p.evaluate(() => APP.state.arg);
  info.mathRec = await p.evaluate(() => APP.S.all('kcase').length);
  const mathId = info.mathArg;
  await next(); info.s0 = await st();
  await p.check('#knVerdict_2'); await p.waitForTimeout(100);
  await next(); info.s1 = await st();
  info.famCards = await p.locator('main .kn-fam-card').count();
  info.openCards = await p.locator('main .kn-fam-card[open]').count();
  info.firstFam = await p.locator('main .kn-fam-card').first().getAttribute('data-fam');
  info.orderLabel = await p.locator('main .kn-order').innerText();
  info.whyF1 = await p.locator('main .kn-fam-card[data-fam="F1"] .kn-why li').count();
  await next(); info.s2 = await st();
  info.ladderOff = await p.locator('main .kn-ladoff').count();
  info.ladderBtns = await p.locator('main .kn-lad-open').count();
  info.isoBox = await p.locator('main .kn-iso').count();
  info.needIso = await p.locator('main [data-probe="f1_named"] .kn-neediso').count();
  info.rankBefore = await p.evaluate(id => JSON.stringify(APP.knotRank(APP.S.get(id)).map(r => r.fam + r.score)), mathId);
  await p.fill('#knIso', 'به چند روش می‌توان ۶ کتابِ متفاوت را در یک قفسه چید؟'); await p.waitForTimeout(700);
  await p.evaluate(() => APP.render()); await p.waitForTimeout(150);
  info.needIsoAfter = await p.locator('main [data-probe="f1_named"] .kn-neediso').count();
  await p.click('main [data-probe="f1_named"] .kn-opt:has-text("فقط با نامِ مفهوم")'); await p.waitForTimeout(250);
  await p.click('main [data-probe="f2_restate"] .kn-opt:has-text("کامل و درست بود")'); await p.waitForTimeout(250);
  info.ev = await p.evaluate(id => APP.S.get(id).ev.map(e => e.fam + ':' + e.dir + ':' + e.w + ':' + e.kind).join('|'), mathId);
  info.rankAfter = await p.evaluate(id => { const r1 = JSON.stringify(APP.knotRank(APP.S.get(id))); const r2 = JSON.stringify(APP.knotRank(APP.S.get(id))); const r = APP.knotRank(APP.S.get(id)); return { same: r1 === r2, f1: r.find(x => x.fam === 'F1').score, f2: r.find(x => x.fam === 'F2').score, top: r[0].fam }; }, mathId);
  // re-answering a probe replaces its evidence (no double counting)
  await p.click('main [data-probe="f1_named"] .kn-opt:has-text("بی‌نامِ مفهوم هم")'); await p.waitForTimeout(250);
  info.f1Reanswer = await p.evaluate(id => APP.knotRank(APP.S.get(id)).find(x => x.fam === 'F1').score, mathId);
  info.f1Collapsed = await p.locator('main details.kn-more [data-probe="f1_named"]').count(); // fell out of the top three, still reachable
  await p.evaluate(() => document.querySelectorAll('main details.kn-more').forEach(d => { d.open = true; }));
  await p.click('main [data-probe="f1_named"] .kn-opt:has-text("فقط با نامِ مفهوم")'); await p.waitForTimeout(250);
  info.ledgerRows = await p.locator('main .kn-evt tbody tr').count();
  await next(); info.s3 = await st();
  await p.click('main .kn-confirm'); await p.waitForTimeout(150);
  info.rootBlocked = (await st()).endsWith('s3') && await p.evaluate(() => APP.S.all('knot').length) === 0;
  await p.selectOption('#knRootFam', 'F1'); await p.waitForTimeout(300);
  await p.fill('#knConf', '70'); await p.waitForTimeout(100);
  await p.click('main .kn-confirm'); await p.waitForTimeout(300);
  info.s4 = await st();
  info.knot = await p.evaluate(id => { const kc = APP.S.get(id); const k = APP.S.get(kc.knots[0]); return k ? k.fam + '|' + k.status + '|' + k.cases.join(',') + '|' + kc.status : 'none'; }, mathId);
  const knotId = await p.evaluate(id => APP.S.get(id).knots[0], mathId);
  // ۴) مداخله: کاربرگِ واقعی و ex با kcase (فقط با اولین نوشته)
  info.acts = await p.locator('main .kn-act').count();
  info.actFirst = await p.locator('main .kn-act').first().getAttribute('data-act');
  await p.locator('main .kn-act').first().locator('button:has-text("باز کن")').click(); await p.waitForTimeout(200);
  info.wsInline = await p.locator('main .kn-act').first().locator('.wsform .fld').count();
  info.exBefore = await p.evaluate(() => APP.S.all('ex', e => !!e.kcase).length);
  const fld = p.locator('main .kn-act').first().locator('.wsform textarea, .wsform input[type=text]').first();
  await fld.fill('چیدنِ n شیءِ متمایز = n فاکتوریل؛ این را از حافظه نوشتم'); await p.waitForTimeout(900);
  info.ex = await p.evaluate(id => APP.S.all('ex', e => e.kcase === id).map(e => e.tid + '|' + e.kcase).join(','), mathId);
  info.actRec = await p.evaluate(id => JSON.stringify(APP.S.get(id).acts), mathId);
  // کارتِ گره: فیلدهای الزامی
  await p.click('main .kn-cardsave'); await p.waitForTimeout(150);
  info.cardMissing = await p.locator('main .kn-kcard .kn-f.missing').count();
  info.cardAtEmpty = await p.evaluate(k => APP.S.get(k).cardAt || null, knotId);
  await p.fill('#knC_name', 'نامِ مفهوم را نمی‌شناسم'); await p.fill('#knC_principle', 'شمارشِ ترتیب‌ها: هر جایگاه یک انتخابِ کمتر');
  await p.fill('#knC_signals', 'وقتی «به چند روش» و «ترتیب» دیدی'); await p.fill('#knC_counter', 'جایگاه‌ها را بشمار و ضرب کن');
  await p.fill('#knC_example', 'چیدنِ مهمان‌ها دورِ میز'); await p.waitForTimeout(600);
  await p.click('main .kn-cardsave'); await p.waitForTimeout(200);
  info.cardAt = await p.evaluate(k => !!APP.S.get(k).cardAt && APP.S.get(k).status, knotId);
  await p.click('main .kn-rcard'); await p.waitForTimeout(150);
  info.rcard = await p.evaluate(k => APP.S.all('card', c => c.knot === k).map(c => /^نشانه/.test(c.q) && /جایگاه/.test(c.a)).join(','), knotId);
  await p.locator('main .kn-kcard .kn-nursery').click(); await p.waitForTimeout(150);
  info.seed = await p.evaluate(k => APP.S.all('seedling', s => s.src && s.src.id === k).map(s => s.kind + '|' + s.scope + '|' + s.src.type).join(','), knotId);
  info.mathStatus = await p.evaluate(id => APP.S.get(id).status, mathId);

  /* ۵) دیدن ≠ نوشتن: همهٔ قدم‌ها، صفحهٔ گره، فهرست */
  info.putsView = await putsDuring(async () => {
    for (const s of ['in', 's0', 's1', 's2', 's3', 's4']) { await p.evaluate(([id, s]) => APP.go('kcase', id, s), [mathId, s]); await p.waitForTimeout(80); await bad('view ' + s); }
    for (const t of ['card', 'cases', 'links']) { await p.evaluate(([k, t]) => APP.go('knot', k, t), [knotId, t]); await p.waitForTimeout(80); await bad('knot ' + t); }
    await p.evaluate(() => APP.goRoot('kcases')); await p.waitForTimeout(80);
  });
  info.knotPage = await p.evaluate(k => { APP.go('knot', k, 'links'); return document.querySelectorAll('main .kn-p9, main ul.plain li').length; }, knotId);

  /* ۶) نمونهٔ اجتماعی (مدیر): ۸/۱۰/۹ با دلیل؛ آزمونِ «چه چیزی در کنترلِ من بود؟» الزامی */
  await intake({ kinds: ['social'], what: 'در جلسه پیشنهادِ من رد شد و پیشنهادِ همکارِ الف پذیرفته شد', seen: 'na', claim: 'من از او بیشتر می‌فهمم ولی مدیرها حرفِ او را قبول دارند', stmts: ['s_knowmore', 's_unheard'], others: 'yes', people: 'مدیرِ بخش، همکارِ الف', freq: 'some' });
  const socId = await p.evaluate(() => APP.state.arg);
  info.socRank = await p.evaluate(id => APP.knotRank(APP.S.get(id)).slice(0, 5).map(r => r.fam + ':' + r.score + ':' + r.why.length).join(' '), socId);
  await next(); await p.check('#knVerdict_1'); await p.waitForTimeout(100); await next(); await next();
  info.socContrastNA = await p.locator('main [data-probe="f2_given"].na').count();
  info.socF10Always = await p.locator('main .kn-always [data-probe="f10_swap"]').count() + ':' + await p.locator('main details.kn-more [data-probe="f10_swap"]').count();
  await p.click('main [data-probe="f8_diff"] .kn-opt:has-text("یک رفتارِ مشخص")'); await p.waitForTimeout(250);
  await p.click('main [data-probe="f8_elsewhere"] .kn-opt >> text=بله'); await p.waitForTimeout(250);
  info.socEv = await p.evaluate(id => APP.S.get(id).ev.map(e => e.fam + ':' + e.dir).join('|'), socId);
  await next(); info.socS3 = await st();
  await p.selectOption('#knRootFam', 'F10'); await p.waitForTimeout(300);
  info.ctlField = await p.locator('#knCtl').count();
  await p.fill('#knConf', '55'); await p.fill('#knLoop2', 'معیارِ من «درست بودن» است، معیارِ جلسه «قابلِ اجرا بودن»'); await p.waitForTimeout(100);
  await p.click('main .kn-confirm'); await p.waitForTimeout(200);
  info.ctlBlocked = (await st()).endsWith('s3') && !(await p.evaluate(id => APP.S.get(id).knots.length, socId));
  await p.fill('#knCtl', 'زمان‌بندی و قاب‌بندیِ پیشنهادم'); await p.waitForTimeout(100);
  // why-chain: an internal why without an external rival is refused
  await p.click('main button:has-text("یک «چرا»ی دیگر")'); await p.waitForTimeout(80);
  await p.fill('#knW_0', 'پیشنهاد را با اصطلاحاتِ فنی گفتم'); await p.fill('#knWe_0', 'دو نفر پرسیدند منظورم چیست'); await p.selectOption('#knWt_0', 'in'); await p.waitForTimeout(150);
  await p.click('main .kn-confirm'); await p.waitForTimeout(200);
  info.rivalBlocked = (await st()).endsWith('s3');
  await p.fill('#knWr_0', 'دستورِ جلسه از قبل به نفعِ پیشنهادِ دیگر بسته شده بود'); await p.waitForTimeout(100);
  await p.click('main .kn-confirm'); await p.waitForTimeout(300);
  info.socKnot = await p.evaluate(id => { const kc = APP.S.get(id); const k = APP.S.get(kc.knots[0]); return k ? k.fam + '|' + kc.root.control : 'none'; }, socId);
  info.socActs = await p.locator('main .kn-act').allTextContents().then(a => a.map(x => x.slice(0, 30)).join(' / '));
  info.extLabel = await p.locator('main .kn-act .kn-ext').count();

  /* ۷) هوش مصنوعی در قدمِ ۱: اعلامِ ارسال، حذفِ نام، بی‌فیلدِ خصوصی، پالایشِ تشخیص و حالِ درونیِ دیگران، بی‌اعمالِ خودکار */
  await p.evaluate(() => { window.__ai = []; APP.callAI = (sys, user) => { window.__ai.push(user); return Promise.resolve(JSON.stringify([
    { fam: 'F8', sub: 'قاب‌بندی', text: 'پیشنهاد از زاویهٔ هدفِ تصمیم‌گیرنده قاب نشده بود', rival: 'تصمیم پیش از جلسه گرفته شده بود', test: 'یک بار با قابِ هدفِ او بگو' },
    { fam: 'F5', sub: '', text: 'شاید ADHD داری', rival: '', test: '' },
    { fam: 'F10', sub: '', text: 'مدیر به تو حسادت می‌کند', rival: '', test: '' }])); }; });
  await p.evaluate(id => { const kc = APP.S.get(id); kc.intake.emoName = 'شرم'; kc.intake.what += ' — رضا هم بود'; APP.S.put(kc); APP.go('kcase', id, 's1'); }, socId); await p.waitForTimeout(200);
  const rankStable = await p.evaluate(id => JSON.stringify(APP.knotRank(APP.S.get(id)).map(r => r.fam + r.score)), socId);
  await p.click('main button:has-text("پیشنهادِ هوش مصنوعی")'); await p.waitForTimeout(150);
  info.aiNotice = await p.locator('.kn-ai .dialog').innerText().then(t => /ارائه‌دهندهٔ بیرونی/.test(t));
  info.aiCalledEarly = await p.evaluate(() => window.__ai.length);
  await p.fill('#knAiNames', 'رضا'); await p.waitForTimeout(80);
  await p.click('.kn-ai .btn:has-text("بفرست")'); await p.waitForTimeout(300);
  info.aiSent = await p.evaluate(() => { const u = window.__ai[0] || ''; return { noName: u.indexOf('رضا') < 0 && u.indexOf('[شخص]') >= 0, noPriv: u.indexOf('شرم') < 0 }; });
  info.aiShown = await p.locator('main .kn-hyp').count();
  info.aiDroppedNote = await p.locator('main .kn-aiout').innerText().then(t => /کنار گذاشته شد/.test(t) && /وارسی‌نشده/.test(t));
  info.hypsBefore = await p.evaluate(id => APP.S.get(id).hyps.length, socId);
  await p.click('main .kn-hyp .btn'); await p.waitForTimeout(150);
  info.hypsAfter = await p.evaluate(id => APP.S.get(id).hyps.length, socId);
  info.rankUnchanged = rankStable === await p.evaluate(id => JSON.stringify(APP.knotRank(APP.S.get(id)).map(r => r.fam + r.score)), socId);

  /* ۸) مثالِ دست: قدمِ ۰ کارخانه را پیشنهاد می‌کند + یادداشتِ ۶ و ۱۱؛ پیوندِ دوطرفه */
  await intake({ kinds: ['behavior', 'inference'], what: 'برای دیدنِ ناخن‌هایم کفِ دست را رو به خودم چرخاندم، نه انگشت‌ها را خم کردم', seen: 'na', claim: 'این نشان می‌دهد من همیشه راهِ سخت‌تر را می‌روم', stmts: ['s_nothink', 's_popular'], freq: 'once', lag: 'weeks' });
  const handId = await p.evaluate(() => APP.state.arg);
  info.handTop = await p.evaluate(id => APP.knotRank(APP.S.get(id)).slice(0, 2).map(r => r.fam).join(','), handId);
  await next();
  info.handSugg = await p.locator('main .kn-sugg .kn-epi').count();
  info.handNotes = await p.locator('main').innerText().then(t => /راحتیِ وضعیتِ پایانی/.test(t) && /خانوادهٔ ۱۱/.test(t));
  await p.click('main .kn-epi'); await p.waitForTimeout(300);
  info.handCase = await p.evaluate(id => { const kc = APP.S.get(id); const cs = APP.S.get(kc.premise.ecase); return cs ? cs.src.type + '|' + cs.src.id + '|' + APP.state.view : 'none'; }, handId);
  info.backLink = await p.locator('main .kn-back').count();
  await p.click('main .kn-back .btn'); await p.waitForTimeout(200);
  info.backTo = await st();
  await p.check('#knVerdict_1'); await p.waitForTimeout(100); await next();
  info.hindsight = await p.locator('main .kn-hind').count();

  /* ۹) ایمنی: کلیدواژه ⇒ کارتِ آرام با منابع؛ ادامه فقط با تأیید؛ پیش از هوش مصنوعی هم */
  await intake({ kinds: ['emotion'], what: 'بعد از آن شب فکر کردم می‌خواهم بمیرم', seen: 'na' });
  await p.waitForTimeout(900);
  info.safeCard = await p.locator('.kn-safe').count();
  info.safeText = info.safeCard ? await p.locator('.kn-safe').innerText().then(t => /999/.test(t) && /123/.test(t) && /1480/.test(t) && /وارسی کن/.test(t)) : false;
  await p.click('.kn-safe .btn.ghost'); await p.waitForTimeout(200);
  const safeId = await p.evaluate(() => APP.S.all('kcase').find(c => /بمیرم/.test(c.intake.what)).id);
  await p.evaluate(id => APP.go('kcase', id, 'in'), safeId); await p.waitForTimeout(150);
  await next();
  info.safeGate = (await st()).endsWith(':in') && await p.locator('.kn-safe').count() === 1;
  await p.click('.kn-safe .btn:has-text("خواندم")'); await p.waitForTimeout(300);
  info.safeAfterAck = await st();
  // before an AI call: the safety card comes first, the notice only after acknowledgement
  await p.evaluate(() => { window.__ai = []; });
  await p.check('#knVerdict_1'); await p.waitForTimeout(80); await next();
  await p.click('main button:has-text("پیشنهادِ هوش مصنوعی")'); await p.waitForTimeout(150);
  info.aiSafeFirst = (await p.locator('.kn-safe').count()) === 1 && (await p.locator('.kn-ai').count()) === 0;
  await p.click('.kn-safe .btn.ghost'); await p.waitForTimeout(100);
  info.aiNotCalled = await p.evaluate(() => window.__ai.length) === 0;

  /* ۱۰) نردبان (پاسخ ندیده): پله‌های ۴–۶ با کنترلِ نشت؛ بازشدن = شاهدِ ضعیف */
  await intake({ kinds: ['problem'], what: 'یک معمای عددی را حل نکردم', seen: 'no', statement: 'عددی دورقمی که حاصل‌ضربِ رقم‌هایش ۸ و جمعشان ۶ است', answer: '42' });
  const ladId = await p.evaluate(() => APP.state.arg);
  await next(); await p.check('#knVerdict_2'); await p.waitForTimeout(80); await next(); await next();
  for (let i = 0; i < 4; i++) { await p.click('main .kn-lad-next'); await p.waitForTimeout(150); }
  info.ladGen = await p.locator('#knLad4').count();
  await p.evaluate(() => { APP.callAI = () => Promise.resolve('{"s4":"از رقمِ یکان شروع کن","s5":"تجزیه به عوامل","s6":"رقم‌ها ۴ و ۲ هستند پس جواب 42"}'); });
  await p.click('main .kn-ladder button:has-text("بساز با هوش مصنوعی")'); await p.waitForTimeout(150);
  await p.click('.kn-ai .btn:has-text("بفرست")'); await p.waitForTimeout(300);
  info.leakRejected = (await p.inputValue('#knLad4')) === '' && !(await p.evaluate(id => (APP.S.get(id).ladder.steps || null), ladId));
  await p.evaluate(() => { APP.callAI = () => Promise.resolve('{"s4":"از رقمِ یکان شروع کن","s5":"تجزیه به عوامل","s6":"دو رقم را به شکلِ جفت‌های ضربیِ ۸ بنویس"}'); });
  await p.click('main .kn-ladder button:has-text("بساز با هوش مصنوعی")'); await p.waitForTimeout(150);
  await p.click('.kn-ai .btn:has-text("بفرست")'); await p.waitForTimeout(300);
  await p.click('main .kn-ladder button:has-text("ذخیرهٔ پله‌ها")'); await p.waitForTimeout(250);
  await p.click('main .kn-lad-open'); await p.waitForTimeout(250);
  info.ladEv = await p.evaluate(id => APP.S.get(id).ev.map(e => e.fam + ':' + e.w + ':' + e.kind).join('|'), ladId);
  info.ladIso = await p.locator('main .kn-iso').count(); // opened by the ladder ⇒ contrast probes need an isomorph
  info.leaksFn = await p.evaluate(() => [APP.knotLeaks('42', ['جواب 42 است']).length, APP.knotLeaks('42', ['۴۲ را ببین']).length, APP.knotLeaks('42', ['ضربِ ۸']).length, APP.knotLeaks('x = 5', ['پس x=5']).length].join(','));

  /* ۱۱) «امروز»: یک سطرِ ترکیبی برای ورزش‌های موعد (اگر a17 هست) */
  info.dueNo = await p.evaluate(() => APP.dueList().filter(d => /ورزشِ گره/.test(d.txt)).length);
  info.dueYes = await p.evaluate(() => { APP.kpracticeDue = () => [1, 2, 3]; const n = APP.dueList().filter(d => /ورزشِ گره/.test(d.txt)).length; delete APP.kpracticeDue; return n; });

  /* ۱۲) P9: گره‌های بازگشته؛ و پیوند به گرهِ ورزیده ⇒ «بازگشته» */
  await p.evaluate(k => { const x = APP.S.get(k); x.status = 'practised'; APP.S.put(x); }, knotId);
  await intake({ kinds: ['problem'], what: 'باز هم در یک مسئلهٔ شمارش گیر کردم', seen: 'yes', stmts: ['s_rule'] });
  const retId = await p.evaluate(() => APP.state.arg);
  await next(); await p.check('#knVerdict_2'); await p.waitForTimeout(80); await next(); await next();
  await p.click('main [data-probe="f1_def"] .kn-opt:has-text("نتوانستم")'); await p.waitForTimeout(200);
  await next(); await p.selectOption('#knRootFam', 'F1'); await p.waitForTimeout(250); await p.fill('#knConf', '60');
  info.similar = await p.locator(`#knPick_0`).count() && await p.evaluate(() => document.querySelector('#knPick_0').value);
  await p.check('#knPick_0'); await p.waitForTimeout(80);
  await p.click('main .kn-confirm'); await p.waitForTimeout(300);
  info.returned = await p.evaluate(([k, id]) => APP.S.get(k).status + '|' + APP.S.get(k).cases.indexOf(id), [knotId, retId]);
  await p.evaluate(() => APP.go('proto', 'P9')); await p.waitForTimeout(200);
  info.p9 = await p.locator('main .kn-p9 li').count();

  /* ۱۳) موبایل ۳۹۰: بی‌سرریزِ افقی */
  await p.setViewportSize({ width: 390, height: 844 });
  info.overflow = [];
  for (const [v, a, s] of [['kcases', null, null], ['kcase', mathId, 'in'], ['kcase', mathId, 's1'], ['kcase', mathId, 's2'], ['kcase', mathId, 's3'], ['kcase', mathId, 's4'], ['knot', knotId, 'card'], ['kcase', socId, 's4']]) {
    await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await p.waitForTimeout(150);
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    if (w > 392) info.overflow.push(v + ':' + s + ':' + w);
  }

  console.log(JSON.stringify(info, null, 1));
  const E = (c, m) => { if (!c) errors.push(m); };
  E(info.nav === 1, 'nav entry'); E(info.door === 1, 'start door');
  E(info.putsView0.length === 0, 'viewing list/new wrote: ' + info.putsView0);
  E(/kcase:new:in/.test(info.newView), 'new view: ' + info.newView); E(info.label === 'موقعیتِ گره‌گشا', 'section label: ' + info.label);
  E(info.mathRec === 1 && /^kc_/.test(info.mathArg), 'lazy create: ' + info.mathRec + ' ' + info.mathArg);
  E(/s0$/.test(info.s0) && /s1$/.test(info.s1) && /s2$/.test(info.s2), 'step flow');
  E(info.famCards === 12 && info.openCards === 3 && info.firstFam === 'F1', 'ranking cards: ' + info.famCards + '/' + info.openCards + '/' + info.firstFam);
  E(/ترتیبِ بررسی، نه احتمال/.test(info.orderLabel), 'order label'); E(info.whyF1 >= 2, 'why reasons');
  E(info.ladderOff === 1 && info.ladderBtns === 0, 'ladder not disabled when answer seen');
  E(info.isoBox === 1 && info.needIso === 1 && info.needIsoAfter === 0, 'isomorph path');
  E(info.ev === 'F1:1:3:contrast|F2:-1:1:fact', 'evidence: ' + info.ev);
  E(info.rankAfter.same && info.rankAfter.f1 === 5 && info.rankAfter.f2 === -0.67, 'ranking math: ' + JSON.stringify(info.rankAfter));
  E(info.f1Reanswer === -1, 're-answer replaces evidence: ' + info.f1Reanswer);
  E(info.ledgerRows === 2, 'ledger rows: ' + info.ledgerRows);
  E(info.rootBlocked, 'root confirmed without primary');
  E(/s4$/.test(info.s4) && /^F1\|open\|kc_/.test(info.knot) && /rooted$/.test(info.knot), 'knot: ' + info.knot);
  E(info.acts >= 4 && info.actFirst === 't41', 'acts: ' + info.acts + ' ' + info.actFirst);
  E(info.wsInline > 3 && info.exBefore === 0 && /^41\|kc_/.test(info.ex), 'inline worksheet/ex: ' + info.ex);
  E(/"exId":"ex_/.test(info.actRec), 'act record: ' + info.actRec);
  E(info.cardMissing === 5 && info.cardAtEmpty === null, 'card required: ' + info.cardMissing);
  E(info.cardAt === 'working', 'card saved: ' + info.cardAt);
  E(info.rcard === 'true', 'review card: ' + info.rcard); E(info.seed === 'knot|me|knot', 'nursery: ' + info.seed);
  E(info.mathStatus === 'done', 'case status: ' + info.mathStatus);
  E(info.putsView.length === 0, 'viewing wrote: ' + info.putsView.join(','));
  const sr = info.socRank.split(' ').map(x => x.split(':'));
  E(sr[0][0] === 'F8' && sr.slice(0, 4).some(x => x[0] === 'F9') && sr.slice(0, 4).some(x => x[0] === 'F10') && sr.slice(0, 4).every(x => +x[2] > 0), 'social ranking: ' + info.socRank);
  E(info.socContrastNA === 1, 'contrast probe shown for a social case');
  E(info.socF10Always === '1:0', 'F10 not always examined: ' + info.socF10Always);
  E(info.f1Collapsed === 1, 'family outside top three not reachable');
  E(info.socEv === 'F8:1|F10:1|F8:1', 'social evidence: ' + info.socEv);
  E(info.ctlField === 1 && info.ctlBlocked, 'F10 control not enforced');
  E(info.rivalBlocked, 'internal why without external rival accepted');
  E(/^F10\|زمان/.test(info.socKnot), 'social knot: ' + info.socKnot); E(info.extLabel >= 1, 'external label');
  E(info.aiNotice && info.aiCalledEarly === 0, 'AI notice before sending');
  E(info.aiSent.noName && info.aiSent.noPriv, 'AI payload: ' + JSON.stringify(info.aiSent));
  E(info.aiShown === 1 && info.aiDroppedNote, 'AI filtering: ' + info.aiShown);
  E(info.hypsBefore === 0 && info.hypsAfter === 1 && info.rankUnchanged, 'AI suggestion applied/rank changed');
  E(info.handTop === 'F11,F6', 'hand ranking: ' + info.handTop);
  E(info.handSugg === 1 && info.handNotes, 'hand premise suggestion/notes');
  E(/^kcase\|kc_.*\|e_case$/.test(info.handCase) && info.backLink === 1 && /kcase:kc_.*:s0/.test(info.backTo), 'factory link: ' + info.handCase + ' ' + info.backTo);
  E(info.hindsight === 1, 'hindsight warning');
  E(info.safeCard === 1 && info.safeText, 'safety card'); E(info.safeGate, 'safety gate'); E(/:s0$/.test(info.safeAfterAck), 'after ack: ' + info.safeAfterAck);
  E(info.aiSafeFirst && info.aiNotCalled, 'safety before AI');
  E(info.ladGen === 1 && info.leakRejected, 'ladder leak check');
  E(info.ladEv === 'F3:1:ladder' && info.ladIso === 1, 'ladder evidence: ' + info.ladEv);
  E(info.leaksFn === '1,1,0,1', 'leak fn: ' + info.leaksFn);
  E(info.dueNo === 0 && info.dueYes === 1, 'today row');
  E(info.similar === knotId, 'similar knot suggestion: ' + info.similar);
  E(/^returned\|1$/.test(info.returned) && info.p9 === 1, 'returned/P9: ' + info.returned + ' ' + info.p9);
  E(!info.overflow.length, 'mobile overflow: ' + info.overflow.join(' '));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
