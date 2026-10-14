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
    if (o.kinds.includes('problem') && !info.stmtHint) info.stmtHint = await p.locator('main .kn-prob .fhint').first().innerText();
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

  /* ۰-ب) ممیزیِ ۲۰۲۶-۱۰-۱۲: ایمنی (یک نرمال‌ساز، یک فهرست برای a16 و a17)، حذفِ نامِ واژه‌کامل، پالایشِ حالِ درونیِ شخصِ سوم، رتبه */
  info.audit = await p.evaluate(() => {
    const HIT = ['دلم می‌خواد بمیرم', 'دیگر نمی‌خواهم زنده باشم', 'خودكشي', 'می‌خواهم خودم را از بین ببرم', 'کاش نبودم', 'میخوام تمومش کنم', 'به خودم صدمه می‌زنم',
      'خودمو از بین ببرم', 'صدمه بزنم به خودم', 'دیگه خسته‌ام، می‌خوام همه‌چی رو تموم کنم', 'بمیرم برات', 'I want to kill myself', 'thinking about suicide', 'I hurt myself', 'end my life', 'خودكُشي'];
    const MISS = ['می‌خواهم این عادت را از بین ببرم', 'می‌خوام این مسئله رو تمومش کنم', 'گزارش را امشب تمومش کنم', 'وضعیتِ فعلی', 'به خودم قول دادم', 'نمیرم سرِ کار', 'عقب میرم'];
    const a16 = HIT.filter(x => !APP.knotSafetyHit(x)), a17 = HIT.filter(x => !APP.kSafetyLocal(x).hit), fp = MISS.filter(x => APP.knotSafetyHit(x));
    const R = APP.kRedact, red = [R('وضعیتِ فعلی و علی', 'علی'), R('رضایتِ رضا', 'رضا'), R('علي آمد', 'علی'), R('علی‌رضا و علیِ ما', 'علی'), R('Ali and Alibaba', 'Ali'), R('سارا رضایی، سارا', 'سارا رضایی، سارا'), APP.kstripNames('رضایت رضا', ['رضا'])];
    const hyp = (x, people, names) => APP.knotHypOk(Object.assign({ fam: 'F8', rival: '', test: '' }, x), people || '', names || []);
    const H = {
      aliLikes: hyp({ fam: 'F10', text: 'علی چون مدیر را دوست دارد پیشنهادش پذیرفته شد', rival: '—', test: '—' }),
      envy: hyp({ text: 'همکار حسادت می‌کند و می‌خواهد تو را کنار بزند' }), adhd: hyp({ fam: 'F5', text: 'شاید بیش‌فعالی داری' }),
      frame: hyp({ text: 'پیامت از زاویهٔ هدفِ مدیر نبود', rival: 'مدیرها به سابقه نگاه می‌کنند', test: 'پیام را در یک جمله بگو' }),
      behav: hyp({ text: 'مدیر در جلسه سه بار حرفت را قطع کرد' }), byPeople: hyp({ text: 'سارا فکر می‌کند تو آماده نیستی' }, 'سارا'), byNames: hyp({ text: 'سارا علاقه‌ای به این طرح ندارد' }, '', ['سارا']),
      him: hyp({ text: 'او خوشش نمی‌آید' }), flani: hyp({ text: 'فلانی می‌داند که حق با توست' }), token: hyp({ text: '[شخص] حس می‌کند تهدید شده' }), rivalMind: hyp({ text: 'پیام بلند بود', rival: 'رئیس از تو دلخور است' })
    };
    const mk = (kinds, intake) => ({ kinds, intake: Object.assign({ stmts: [] }, intake), ev: [] });
    const order = (kc, n) => APP.knotRank(kc).slice(0, n).map(r => r.fam).join(',');
    const rank = {
      A1: order(mk(['problem'], { stmts: ['s_oneway'], pressure: 8, freq: 'some', claim: 'این نشان می‌دهد من در الگویابی ضعیفم' }), 5),
      A2: order(mk(['problem'], { stmts: ['s_rule'], freq: 'once', claim: 'من فیزیک بلد نیستم' }), 2),
      B: order(mk(['social'], { stmts: ['s_knowmore', 's_unheard'], others: 'yes', emo: 7, freq: 'often', claim: 'من از علی بیشتر می‌فهمم ولی مدیرها حرفِ او را قبول دارند' }), 4),
      C: order(mk(['behavior', 'inference'], { stmts: ['s_nothink', 's_popular'], freq: 'once', others: 'yes', claim: 'این نشان می‌دهد من همیشه راهِ سخت‌تر را انتخاب می‌کنم' }), 4),
      shared: (() => { const r = APP.knotRank(mk(['problem'], {})); const g = f => r.find(x => x.fam === f).score; return [g('F1'), g('F2'), g('F3')].join(','); })()
    };
    const f9 = ['من فیزیک بلد نیستم', 'نمی‌تونم ریاضی یاد بگیرم', 'نمی‌توانم ارائه بدهم', 'استعدادش رو ندارم', 'استعدادش را ندارم', 'هیچ‌وقت درست نمی‌شوم'].filter(c => !(APP.knotRank(mk(['problem'], { claim: c })).find(x => x.fam === 'F9').score > 0));
    const t31 = (APP.KF.find(F => F.id === 'F9').acts.find(a => a.tid === 31) || {}).note || '';
    return { a16, a17, fp, red, H, rank, f9, t31 };
  });

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
  info.f1Collapsed = await p.locator('main details.kn-more [data-probe="f12_zero"]').count(); // a family outside the top three is still reachable
  await p.evaluate(() => document.querySelectorAll('main details.kn-more').forEach(d => { d.open = true; }));
  await p.click('main [data-probe="f1_named"] .kn-opt:has-text("فقط با نامِ مفهوم")'); await p.waitForTimeout(250);
  info.ledgerRows = await p.locator('main .kn-evt tbody tr').count();
  await next(); info.s3 = await st();
  await p.click('main .kn-confirm'); await p.waitForTimeout(150);
  info.rootBlocked = (await st()).endsWith('s3') && await p.evaluate(() => APP.S.all('knot').length) === 0;
  // I1: a family with NO supporting evidence (F12) cannot be confirmed without a written reason; ≥1 «چرا» and a rival for the root are required
  await p.selectOption('#knRootFam', 'F12'); await p.waitForTimeout(300);
  await p.fill('#knConf', '70'); await p.waitForTimeout(100);
  info.supHint = await p.locator('main .kn-sup').innerText();
  await p.click('main .kn-confirm'); await p.waitForTimeout(200);
  info.rootReq = await p.evaluate(() => ['disagree', 'rival', 'why'].map(k => document.querySelectorAll(`main [data-k="${k}"].missing`).length).join(','));
  info.noSupportBlocked = (await st()).endsWith('s3') && await p.evaluate(() => APP.S.all('knot').length) === 0;
  await p.fill('#knRootRival', 'شاید فقط زمان کم بود و مفهوم را بلد بودم'); await p.waitForTimeout(80);
  await p.click('main button:has-text("یک «چرا»ی دیگر")'); await p.waitForTimeout(80);
  await p.fill('#knW_0', 'فاکتوریل را در کلاس فقط یک بار دیده بودم'); await p.fill('#knWe_0', 'در جزوه‌ام هیچ مثالی از آن نیست'); await p.selectOption('#knWt_0', 'out'); await p.waitForTimeout(150);
  await p.click('main .kn-confirm'); await p.waitForTimeout(200);
  info.noSupportStillBlocked = (await st()).endsWith('s3') && await p.evaluate(() => APP.S.all('knot').length) === 0 && await p.locator('main [data-k="disagree"].missing').count() === 1;
  await p.selectOption('#knRootFam', 'F1'); await p.waitForTimeout(300);   // F1 has a «له» contrast ⇒ no reason needed
  info.supF1 = await p.locator('main .kn-sup').innerText();
  info.disagreeOptional = await p.locator('#knDisagree').count();
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
  await p.click('main .kn-confirm'); await p.waitForTimeout(200);
  info.rootRivalBlocked = (await st()).endsWith('s3') && await p.locator('main [data-k="rival"].missing').count() === 1;
  await p.fill('#knRootRival', 'شاید تصمیم پیش از جلسه گرفته شده بود و ربطی به من نداشت'); await p.waitForTimeout(80);
  // I3: an auxiliary knot for a secondary family (F8) — created once, stored in kc.knots after the primary
  await p.check('#knEx_F8'); await p.waitForTimeout(150);
  info.auxRow = await p.locator('main .kn-exknot[data-fam="F8"] select').count();
  await p.selectOption('#knExK_F8', 'new'); await p.waitForTimeout(150);
  await p.fill('#knExN_F8', 'پیامِ فنی برای مخاطبِ غیرفنی'); await p.waitForTimeout(100);
  await p.click('main .kn-confirm'); await p.waitForTimeout(300);
  info.socKnot = await p.evaluate(id => { const kc = APP.S.get(id); const k = APP.S.get(kc.knots[0]); return k ? k.fam + '|' + kc.root.control : 'none'; }, socId);
  info.socKnots = await p.evaluate(id => { const kc = APP.S.get(id); return kc.knots.map(x => { const k = APP.S.get(x); return k.fam + ':' + (k.cases.indexOf(id) >= 0) + ':' + k.name; }).join('|'); }, socId);
  const nKnots = await p.evaluate(() => APP.S.all('knot').length);
  await p.evaluate(id => APP.go('kcase', id, 's3'), socId); await p.waitForTimeout(200);
  await p.click('main .kn-confirm'); await p.waitForTimeout(300);   // re-confirm must not create duplicates
  info.reconfirmNoDup = nKnots === await p.evaluate(() => APP.S.all('knot').length);
  await p.evaluate(() => APP.go('kmap')); await p.waitForTimeout(300);
  info.coEdges = await p.locator('main .km-e.co').count();
  await p.evaluate(id => APP.go('kcase', id, 's4'), socId); await p.waitForTimeout(200);
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
  // Minor3: no literal leak, but an independent solver derives «42» from the hints alone ⇒ rejected
  await p.evaluate(() => { window.__lad = []; APP.callAI = (sys, user) => { window.__lad.push({ sys, user }); return Promise.resolve(sys === APP.KSYS_LADCHK ? '{"answer":"۴۲"}' : '{"s4":"رقمِ دهگان دو برابرِ رقمِ یکان است","s5":"تجزیه به عوامل","s6":"رقمِ یکان دو است"}'); }; });
  await p.click('main .kn-ladder button:has-text("بساز با هوش مصنوعی")'); await p.waitForTimeout(150);
  info.ladMore = await p.locator('.kn-ai .kn-ai-more').count();
  await p.click('.kn-ai .btn:has-text("بفرست")'); await p.waitForTimeout(300);
  info.ladChk = await p.evaluate(() => ({ n: window.__lad.length, second: window.__lad[1] && window.__lad[1].sys === APP.KSYS_LADCHK, noStmt: !!window.__lad[1] && window.__lad[1].user.indexOf('حاصل‌ضربِ') < 0 && window.__lad[1].user.indexOf('42') < 0 }));
  info.ladChkRejected = (await p.inputValue('#knLad4')) === '';
  await p.evaluate(() => { APP.callAI = (sys) => Promise.resolve(sys === APP.KSYS_LADCHK ? '{"answer":null}' : '{"s4":"از رقمِ یکان شروع کن","s5":"تجزیه به عوامل","s6":"دو رقم را به شکلِ جفت‌های ضربیِ ۸ بنویس"}'); });
  await p.click('main .kn-ladder button:has-text("بساز با هوش مصنوعی")'); await p.waitForTimeout(150);
  await p.click('.kn-ai .btn:has-text("بفرست")'); await p.waitForTimeout(300);
  info.ladChkAccepted = (await p.inputValue('#knLad4')) !== '';
  await p.click('main .kn-ladder button:has-text("ذخیرهٔ پله‌ها")'); await p.waitForTimeout(250);
  await p.click('main .kn-lad-open'); await p.waitForTimeout(250);
  info.ladEv = await p.evaluate(id => APP.S.get(id).ev.map(e => e.fam + ':' + e.w + ':' + e.kind).join('|'), ladId);
  info.ladIso = await p.locator('main .kn-iso').count(); // opened by the ladder ⇒ contrast probes need an isomorph
  info.leaksFn = await p.evaluate(() => [APP.knotLeaks('42', ['جواب 42 است']).length, APP.knotLeaks('42', ['۴۲ را ببین']).length, APP.knotLeaks('42', ['ضربِ ۸']).length, APP.knotLeaks('x = 5', ['پس x=5']).length].join(','));

  /* ۱۰-ب) مسئلهٔ حل‌نشده (پاسخ را نمی‌داند — کارزارِ آزمونِ دوم c01): پاسخِ پنهانِ هوش + حلِ مستقلِ دوم ⇒ پله‌ها؛ ناهمخوانی ⇒ رد؛ پاسخ هرگز در خانه‌ها نیست */
  await intake({ kinds: ['problem'], what: 'یک معمای دنباله را حل نکردم', seen: 'no', statement: 'دنبالهٔ ۱، ۱۱، ۲۱، ۱۲۱۱، ۱۱۱۲۲۱، ؟', answer: '' });
  const hidId = await p.evaluate(() => APP.state.arg);
  await next(); await p.check('#knVerdict_2'); await p.waitForTimeout(80); await next(); await next();
  for (let i = 0; i < 4; i++) { await p.click('main .kn-lad-next'); await p.waitForTimeout(150); }
  await p.evaluate(() => { window.__hid = []; APP.callAI = (sys, user) => { window.__hid.push(sys.slice(0, 40)); return Promise.resolve(/پاسخش را نمی‌داند/.test(sys) ? '{"answer":"312211","s4":"هر جمله را بلند بخوان","s5":"توصیفِ جملهٔ قبل","s6":"جملهٔ دوم را با واژه بگو"}' : /^این مسئله را مستقل/.test(sys) ? '{"answer":"999"}' : '{"answer":null}'); }; });
  await p.click('main .kn-ladder button:has-text("بساز با هوش مصنوعی")'); await p.waitForTimeout(150);
  await p.click('.kn-ai .btn:has-text("بفرست")'); await p.waitForTimeout(400);
  info.hidMismatch = (await p.inputValue('#knLad4')) === '';
  await p.evaluate(() => { APP.callAI = (sys) => Promise.resolve(/پاسخش را نمی‌داند/.test(sys) ? '{"answer":"312211","s4":"هر جمله را بلند بخوان","s5":"توصیفِ جملهٔ قبل","s6":"جملهٔ دوم را با واژه بگو"}' : /^این مسئله را مستقل/.test(sys) ? '{"answer":"۳۱۲۲۱۱"}' : '{"answer":null}'); });
  await p.click('main .kn-ladder button:has-text("بساز با هوش مصنوعی")'); await p.waitForTimeout(150);
  await p.click('.kn-ai .btn:has-text("بفرست")'); await p.waitForTimeout(400);
  info.hidOk = (await p.inputValue('#knLad4')) !== '' && await p.evaluate(id => APP.S.get(id).intake.aiAnswer === '312211', hidId) && !(await p.evaluate(() => /312211|۳۱۲۲۱۱/.test(document.getElementById('main').innerText)));

  /* ۱۱) «امروز»: یک سطرِ ترکیبی برای ورزش‌های موعد (اگر a17 هست) */
  info.dueNo = await p.evaluate(() => APP.dueList().filter(d => /ورزشِ گره/.test(d.txt)).length);
  info.dueYes = await p.evaluate(() => { APP.kpracticeDue = () => [1, 2, 3]; const n = APP.dueList().filter(d => /ورزشِ گره/.test(d.txt)).length; delete APP.kpracticeDue; return n; });

  /* ۱۲) P9: گره‌های بازگشته؛ و پیوند به گرهِ ورزیده ⇒ «بازگشته» */
  // I2: the a16 «returned» path goes through the single status writer, which then syncs the follow-up reminder
  // (spy on the reminder sync itself — its HOST.remind behaviour is covered in test_kpractice.js)
  await p.evaluate(() => { window.__rem = []; const raw = APP.kremindSync; APP.kremindSync = function (k) { window.__rem.push({ key: 'knot:' + k.id, status: k.status }); return raw.apply(this, arguments); }; });
  await p.evaluate(k => { const x = APP.S.get(k); x.status = 'practised'; APP.S.put(x); }, knotId);
  await intake({ kinds: ['problem'], what: 'باز هم در یک مسئلهٔ شمارش گیر کردم', seen: 'yes', stmts: ['s_rule'] });
  const retId = await p.evaluate(() => APP.state.arg);
  await next(); await p.check('#knVerdict_2'); await p.waitForTimeout(80); await next(); await next();
  await p.click('main [data-probe="f1_def"] .kn-opt:has-text("نتوانستم")'); await p.waitForTimeout(200);
  await next(); await p.selectOption('#knRootFam', 'F1'); await p.waitForTimeout(250); await p.fill('#knConf', '60');
  info.similar = await p.locator(`#knPick_0`).count() && await p.evaluate(() => document.querySelector('#knPick_0').value);
  await p.check('#knPick_0'); await p.waitForTimeout(80);
  await p.fill('#knRootRival', 'شاید این بار فقط عجله داشتم'); await p.click('main button:has-text("یک «چرا»ی دیگر")'); await p.waitForTimeout(80);
  await p.fill('#knW_0', 'شمارشِ ترتیب را هنوز خودکار نمی‌شناسم'); await p.fill('#knWe_0', 'دوباره سراغِ جمع رفتم'); await p.selectOption('#knWt_0', 'out'); await p.waitForTimeout(120);
  await p.click('main .kn-confirm'); await p.waitForTimeout(300);
  info.returned = await p.evaluate(([k, id]) => APP.S.get(k).status + '|' + APP.S.get(k).cases.indexOf(id), [knotId, retId]);
  info.returnedRemind = await p.evaluate(k => window.__rem.filter(r => r.key === 'knot:' + k && r.status === 'returned').length + '|' + (APP.S.get(k).hist || []).map(h => h.status).join('>'), knotId);

  await p.evaluate(() => APP.go('proto', 'P9')); await p.waitForTimeout(200);
  info.p9 = await p.locator('main .kn-p9 li').count();

  /* ۱۴) پیوندهای معناییِ دقیق (مالک ۲۰۲۶-۱۰-۱۲): ایستگاه‌های کارخانه برای هر خانواده با «چرا»، درسِ دوره برای تکنیک، «مسئله‌های بزرگ» برای F3،
     دغدغه‌های c10/c7 — و هیچ پیوندِ تعارفی برای خانواده‌های بی‌ربط */
  const L = await p.evaluate(() => {
    const mk = (prim, extra, kinds, more) => {
      const kn = APP.newKnot({ name: 'گرهِ پیوند ' + prim, fam: prim, cases: [] });
      const kc = APP.S.put(Object.assign({ id: APP.uid('kc'), type: 'kcase', title: 'پیوند ' + prim, kinds: kinds || ['inference'], intake: { stmts: [], what: 'یک اتفاق', expected: 'الف', actual: 'ب', thoughts: 'پ', seen: 'na' },
        premise: { verdict: 'yes' }, ev: [{ fam: prim, dir: 1, w: 1, kind: 'fact', text: 'شاهد', src: 'manual' }], root: { primary: prim, extra: extra || [], why5: [], confirmed: true },
        knots: [kn.id], acts: [], hyps: [], pans: {}, ladder: {}, status: 'rooted', step: 's4' }, more || {}));
      kn.cases = [kc.id]; APP.S.put(kn); return kc.id;
    };
    return { F11: mk('F11'), F8: mk('F8', [], ['social']), F2: mk('F2', [], ['problem'], { intake: { stmts: [], what: 'یک سؤالِ شکل', expected: 'الف', actual: 'ب', thoughts: 'پ', seen: 'no', statement: 'صورت در عکسِ پیوست است', answer: '42' } }),
      F3: mk('F3', [], ['problem']), F6: mk('F6', [], ['behavior']), F9x: mk('F9', [{ fam: 'F11', sub: '' }]) };
  });
  info.epiL = {};
  for (const f of Object.keys(L)) {
    await p.evaluate(id => APP.go('kcase', id, 's4'), L[f]); await p.waitForTimeout(150); await bad('links ' + f);
    info.epiL[f] = (await p.locator('main .kn-epil li[data-st]').evaluateAll(els => els.map(e => e.getAttribute('data-st')))).join(',');
    if (f === 'F11') {
      info.epiWhy = await p.locator('main .kn-epil li').evaluateAll(els => els.every(e => /چرا: .{8,}/.test(e.innerText)));
      info.epiSec = await p.locator('main .kn-epilinks h3').innerText();
      info.crsLinks = await p.locator('main .kn-act .kn-crslink').count();
      info.crsLinkTids = await p.evaluate(() => Array.from(document.querySelectorAll('main .kn-act')).filter(li => li.querySelector('.kn-crslink')).map(li => li.getAttribute('data-act')).join(','));
      info.crsExpected = await p.evaluate(id => APP.knotActs(APP.S.get(id)).filter(x => x.a.tid && APP.COURSE_LESSONS.some(l => !l.pid && +l.tid === +x.a.tid)).map(x => x.key).join(','), L.F11);
      info.crsText = await p.locator('main .kn-crslink').first().innerText();
    }
    if (f === 'F6') info.epiSecF6 = await p.locator('main .kn-epilinks').count();
    if (f === 'F3') {
      info.probAct = await p.locator('main .kn-act[data-act="prob"]').count();
      info.probWhy = await p.locator('main .kn-act[data-act="prob"]').innerText();
      info.probNotOthers = await p.evaluate(id => APP.knotActs(APP.S.get(id)).some(x => x.key === 'prob'), L.F11);
    }
  }
  // کلیکِ ایستگاه ⇒ همان صفحهٔ ایستگاه با «↩ برگرد» به همین موقعیت
  await p.evaluate(id => APP.go('kcase', id, 's4'), L.F11); await p.waitForTimeout(150);
  await p.click('main .kn-epil li[data-st="st_istiqra"] button'); await p.waitForTimeout(200);
  info.epiGo = await st(); await bad('e_st');
  info.epiBack = await p.evaluate(() => (APP.trail || []).slice(-1).map(e => e.view + ':' + e.arg)[0] || '');
  await p.evaluate(id => APP.go('kcase', id, 's4'), L.F11); await p.waitForTimeout(150);
  await p.click('main .kn-crslink button'); await p.waitForTimeout(200);
  info.crsGo = await st();
  await p.evaluate(id => APP.go('kcase', id, 's4'), L.F3); await p.waitForTimeout(150);
  await p.click('main .kn-act[data-act="prob"] .btn.ghost'); await p.waitForTimeout(80);
  await p.click('main .kn-act[data-act="prob"] .kn-prob-go'); await p.waitForTimeout(200);
  info.probGo = await st(); await bad('e_prob');
  // دغدغه‌ها: فقط c10 و c7 پیوند می‌گیرند؛ فهرستِ موقعیت‌ها به دغدغهٔ ۱۰ برمی‌گردد
  await p.evaluate(() => APP.go('concerns')); await p.waitForTimeout(200);
  info.concernLinks = (await p.locator('main .kn-concern-link').evaluateAll(els => els.map(e => e.getAttribute('data-concern') + ':' + (e.closest('.concern') || {}).id))).join(',');
  info.concernWhy = await p.locator('main .kn-concern-link').evaluateAll(els => els.every(e => e.innerText.length > 30));
  await p.click('main .kn-concern-link[data-concern="c10"] button'); await p.waitForTimeout(200);
  info.concernGo = await st();
  info.kcConcern = await p.locator('main .kn-concern').innerText();
  await p.click('main .kn-concern button'); await p.waitForTimeout(200);
  info.kcConcernGo = await st();
  // نسخهٔ مستقل: درِ هوش مصنوعی هیچ بخشِ پیوست ندارد و درخواست بی fileIds می‌رود
  await p.evaluate(() => { window.__aiO = []; APP.callAI = (s, u, o) => { window.__aiO.push(o || null); return Promise.resolve('[]'); }; });
  await p.evaluate(id => APP.go('kcase', id, 's1'), L.F2); await p.waitForTimeout(150);
  await p.click('main button:has-text("پیشنهادِ هوش مصنوعی")'); await p.waitForTimeout(150);
  info.attStandalone = await p.locator('.kn-ai .kn-ai-att').count();
  await p.click('.kn-ai .btn:has-text("بفرست")'); await p.waitForTimeout(300);
  info.optsStandalone = await p.evaluate(() => JSON.stringify(window.__aiO));
  // میزبانِ ساختگی با پیوست: «مسئله» ⇒ پیش‌فرض روشن، fileIds فقط پیوستِ تصویری ≤ ۸ مگابایت؛ «برداشت» ⇒ پیش‌فرض خاموش
  await p.evaluate(() => {
    window.__aiH = [];
    window.__loaded0 = APP.S.loaded; APP.S.loaded = true;  // (میزبانِ واقعی پس از بارگذاری؛ این‌جا داده محلی است)
    APP.HOST = { files: () => Promise.resolve([{ id: 5, name: 'q.png', mime: 'image/png', size: 3000, link: '#' }, { id: 6, name: 'big.jpg', mime: 'image/jpeg', size: 9e6, link: '#' }, { id: 7, name: 'a.txt', mime: 'text/plain', size: 9, link: '#' }]) };
    APP.callAI = (s, u, o) => { window.__aiH.push({ chk: s === APP.KSYS_LADCHK, o: o || null, u }); return Promise.resolve(s === APP.KSYS_LADCHK ? '{"answer":null}' : /^تو سازندهٔ راهنمایی/.test(s) ? '{"s4":"از حالتِ خاص شروع کن","s5":"تقارن","s6":"دو بخشِ شکل را جدا بشمار"}' : '[]'); };
  });
  await p.evaluate(id => APP.go('kcase', id, 's1'), L.F2); await p.waitForTimeout(150);
  await p.click('main button:has-text("پیشنهادِ هوش مصنوعی")'); await p.waitForTimeout(250);
  info.attLabel = await p.locator('.kn-ai label[for="knAiAtt"]').innerText().catch(() => '');
  info.attOnProblem = await p.isChecked('#knAiAtt').catch(() => null);
  info.attWarn = await p.locator('.kn-ai .kn-ai-attw:not(.hidden)').innerText().catch(() => '');
  await p.click('.kn-ai .btn:has-text("بفرست")'); await p.waitForTimeout(300);
  info.hypOpts = await p.evaluate(() => JSON.stringify(window.__aiH.map(x => x.o)));
  // نردبان: سازنده تصویر را می‌گیرد، حل‌کنندهٔ مستقلِ نشت هرگز
  await p.evaluate(id => { const kc = APP.S.get(id); kc.ladder = { cur: 4 }; APP.S.put(kc); window.__aiH = []; APP.go('kcase', id, 's2'); }, L.F2); await p.waitForTimeout(200);
  await p.click('main .kn-ladder button:has-text("بساز با هوش مصنوعی")'); await p.waitForTimeout(250);
  info.ladMoreNoImg = /بی تصویرِ پیوست/.test(await p.locator('.kn-ai .kn-ai-more').innerText());
  await p.click('.kn-ai .btn:has-text("بفرست")'); await p.waitForTimeout(400);
  info.ladOpts = await p.evaluate(() => window.__aiH.map(x => (x.chk ? 'chk:' : 'gen:') + JSON.stringify(x.o)).join(' '));
  await p.evaluate(id => APP.go('kcase', id, 's1'), L.F11); await p.waitForTimeout(150);
  await p.click('main button:has-text("پیشنهادِ هوش مصنوعی")'); await p.waitForTimeout(250);
  info.attOffInference = await p.isChecked('#knAiAtt').catch(() => null);
  await p.click('.kn-ai .btn.ghost'); await p.waitForTimeout(100);
  await p.evaluate(() => { delete APP.HOST; APP.S.loaded = window.__loaded0; });

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
  // ---- ممیزیِ ۲۰۲۶-۱۰-۱۲ ----
  const AU = info.audit;
  E(!AU.a16.length && !AU.a17.length, 'C1/C2 safety misses: a16=' + AU.a16 + ' a17=' + AU.a17);
  E(!AU.fp.length, 'C2 safety false positives: ' + AU.fp);
  E(JSON.stringify(AU.red) === JSON.stringify(['وضعیتِ فعلی و [شخص]', 'رضایتِ [شخص]', '[شخص] آمد', 'علی‌رضا و [شخص]ِ ما', '[شخص] and Alibaba', '[شخص]، [شخص]', 'رضایت [شخص]']), 'C3 whole-word redaction: ' + JSON.stringify(AU.red));
  E(!AU.H.aliLikes && !AU.H.envy && !AU.H.adhd && AU.H.frame && AU.H.behav && !AU.H.byPeople && !AU.H.byNames && !AU.H.him && !AU.H.flani && !AU.H.token && !AU.H.rivalMind, 'C4 third-party mind filter: ' + JSON.stringify(AU.H));
  E(AU.rank.A1 === 'F3,F11,F5,F1,F2' && AU.rank.A2 === 'F1,F9' && AU.rank.B === 'F8,F7,F9,F10' && AU.rank.C === 'F11,F6,F9,F7', 'Minor1 scenario orders: ' + JSON.stringify(AU.rank));
  E(AU.rank.shared === '0.33,0.33,0.33', 'Minor1 shared kind signal must weigh the same for F1/F2/F3: ' + AU.rank.shared);
  E(!AU.f9.length, 'Minor2 F9 patterns missed: ' + AU.f9);
  E(/Sisk 2018/.test(AU.t31) && /Yeager 2019/.test(AU.t31), 'intervention 31 label: ' + AU.t31);
  E(/پیوست‌ها/.test(info.stmtHint || '') && !/ممکن نیست/.test(info.stmtHint || ''), 'photo hint: ' + info.stmtHint);
  E(info.rootReq === '1,1,1' && info.noSupportBlocked && info.noSupportStillBlocked && /هیچ شاهدِ «له»/.test(info.supHint), 'I1 root needs support/reason + rival + why: ' + info.rootReq + ' ' + info.noSupportBlocked + ' ' + info.noSupportStillBlocked);
  E(/شاهدِ له/.test(info.supF1) && info.disagreeOptional === 0, 'I1 supported family: ' + info.supF1 + ' ' + info.disagreeOptional);
  E(info.rootRivalBlocked, 'I1 root rival not required');
  E(info.auxRow === 1 && /^F10:true:.*\|F8:true:پیامِ فنی/.test(info.socKnots) && info.reconfirmNoDup && info.coEdges >= 1, 'I3 auxiliary knot / co-occurrence: ' + info.socKnots + ' dup-safe=' + info.reconfirmNoDup + ' edges=' + info.coEdges);
  E(info.ladMore === 1 && info.ladChk.n === 2 && info.ladChk.second && info.ladChk.noStmt && info.ladChkRejected && info.ladChkAccepted, 'Minor3 ladder independent check: ' + JSON.stringify(info.ladChk) + ' ' + info.ladChkRejected + ' ' + info.ladChkAccepted);
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
  // F1: kind «problem» 1÷3 + s_rule 3÷1 (its only specific signal) + contrast +3 = 6.33; F2: 1÷3 − 1 (fact) = −0.67
  E(info.rankAfter.same && info.rankAfter.f1 === 6.33 && info.rankAfter.f2 === -0.67, 'ranking math: ' + JSON.stringify(info.rankAfter));
  E(info.f1Reanswer === 0.33, 're-answer replaces evidence: ' + info.f1Reanswer);
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
  E(info.hidMismatch && info.hidOk, 'unsolved problem: hidden AI answer confirmed by an independent solve builds the ladder; a mismatch is rejected; the answer never shows: ' + JSON.stringify([info.hidMismatch, info.hidOk]));
  E(info.ladEv === 'F3:1:ladder' && info.ladIso === 1, 'ladder evidence: ' + info.ladEv);
  E(info.leaksFn === '1,1,0,1', 'leak fn: ' + info.leaksFn);
  E(info.dueNo === 0 && info.dueYes === 1, 'today row');
  E(info.similar === knotId, 'similar knot suggestion: ' + info.similar);
  E(/^returned\|1$/.test(info.returned) && info.p9 === 1, 'returned/P9: ' + info.returned + ' ' + info.p9);
  E(/^[1-9]\d*\|.*returned$/.test(info.returnedRemind), 'I2 a16 returned path ⇒ reminder + hist: ' + info.returnedRemind);
  E(!info.overflow.length, 'mobile overflow: ' + info.overflow.join(' '));
  // ---- پیوندهای معنایی و پیوستِ تصویری (۲۰۲۶-۱۰-۱۲) ----
  E(info.epiL.F11 === 'st_istiqra,st_tajrobe,st_grade' && info.epiL.F8 === 'st_expert,st_herm' && info.epiL.F2 === 'st_worlds,st_herm', 'factory links per family: ' + JSON.stringify(info.epiL));
  E(info.epiL.F9x === 'st_background,st_grade,st_resp,st_istiqra,st_tajrobe', 'factory links primary+extra, deduped: ' + info.epiL.F9x);
  E(info.epiL.F6 === '' && info.epiL.F3 === '' && info.epiSecF6 === 0, 'no courtesy factory links for F6/F3: ' + info.epiL.F6 + '/' + info.epiL.F3 + '/' + info.epiSecF6);
  E(info.epiWhy && /کارخانهٔ معرفت‌شناسی/.test(info.epiSec), 'factory link «why» lines: ' + info.epiWhy + ' ' + info.epiSec);
  E(info.epiGo === 'e_st:st_istiqra:null' && info.epiBack === 'kcase:' + L.F11, 'factory link navigation/back: ' + info.epiGo + ' ' + info.epiBack);
  E(info.crsLinks >= 1 && info.crsLinkTids === info.crsExpected && /درسِ دورهٔ گام‌به‌گام/.test(info.crsText), 'course-lesson link: ' + info.crsLinks + ' ' + info.crsLinkTids + ' vs ' + info.crsExpected);
  E(/^lesson:\d+:s1$/.test(info.crsGo), 'course link goes to the lesson: ' + info.crsGo);
  E(info.probAct === 1 && /چرا: تمرینِ انتخابِ حرکتِ بعدی/.test(info.probWhy) && !info.probNotOthers && /^e_prob:/.test(info.probGo), 'F3 «big problems» link: ' + info.probAct + ' ' + info.probGo);
  E(info.concernLinks === 'c7:cc_c7,c10:cc_c10' || info.concernLinks === 'c10:cc_c10,c7:cc_c7', 'concern links only under c7/c10: ' + info.concernLinks);
  E(info.concernWhy && /^kcases:/.test(info.concernGo), 'concern link why/navigation: ' + info.concernGo);
  E(/دغدغهٔ شمارهٔ ۱۰/.test(info.kcConcern) && info.kcConcernGo === 'concerns:c10:null', 'kcases ⇒ concern 10: ' + info.kcConcernGo);
  E(info.attStandalone === 0 && info.optsStandalone === '[null]', 'standalone AI door has no attachments: ' + info.attStandalone + ' ' + info.optsStandalone);
  E(/پیوست‌ها هم فرستاده و کامل خوانده شوند \(۳\)/.test(info.attLabel) && info.attOnProblem === true && /ارائه‌دهندهٔ بیرونی/.test(info.attWarn), 'attachment checkbox (problem ⇒ on): ' + info.attLabel + ' ' + info.attOnProblem);
  // since 2026-10-14 (WORKLOG 44) EVERY attachment goes and the server reads each one completely (was: only images/PDF ≤ 8 MB)
  E(info.hypOpts === '[{"fileIds":[5,6,7]}]', 'hypothesis request carries all the case files: ' + info.hypOpts);
  E(info.ladMoreNoImg && info.ladOpts === 'gen:{"fileIds":[5,6,7]} chk:null', 'ladder: generator gets the files, the leak solver never: ' + info.ladOpts);
  E(info.attOffInference === false, 'attachment default off for a non-problem case: ' + info.attOffInference);
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
