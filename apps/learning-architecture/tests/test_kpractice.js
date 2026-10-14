// «گره‌گشا» — ورزیدگی و پیگیری (a17_kpractice.js) روی نسخهٔ مستقلِ ساخته‌شده (dist/learning-architecture.html)
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
  const bad = async (lab) => { if (await p.locator('main .card.bad:not(.kp-gate)').count()) errors.push('render ' + lab); };
  // ساعتِ ساختگی + میزبانِ یادآور (بی ذخیره‌سازیِ میزبان: S در حالتِ محلی می‌ماند)
  await p.evaluate(() => {
    window.__day = '2026-11-02'; APP.today = () => window.__day;
    window.__rem = []; window.__unrem = [];
    APP.HOST = { remind: (x) => { window.__rem.push(JSON.parse(JSON.stringify(x))); return Promise.resolve({ ok: true }); }, unremind: (k) => { window.__unrem.push(k); return Promise.resolve({ ok: true }); } };
    APP.S.loaded = true;
    window.__puts = []; const o = APP.S.put; APP.S.put = function (r) { window.__puts.push(r.type + ':' + r.id); return o.apply(this, arguments); };
    APP.S.put({ id: 'knot_t1', type: 'knot', name: 'آزمون: راهِ آشنا', fam: 'F3', principle: 'وقتی یک روش چند بار جواب داده، راهِ ساده‌تر را نمی‌بینم', signals: 'یک راه را تا آخر رفتم', counter: 'پیش از اجرا بپرس: راهِ کوتاه‌تری هست؟', example: 'علی و من در جلسه…', cases: [], status: 'open' });
  });
  const putsDuring = async (fn) => { await p.evaluate(() => { window.__puts = []; }); await fn(); await p.waitForTimeout(400); return p.evaluate(() => window.__puts.slice()); };
  const setDay = (d) => p.evaluate(x => { window.__day = x; }, d);

  // ۱) منو + صفحهٔ اصلی بی‌نوشتن
  info.nav = await p.locator('.nav[data-v="kpractice"]').count();
  info.putsHub = await putsDuring(() => p.evaluate(() => APP.go('kpractice')));
  await bad('hub'); info.hubKnots = await p.locator('main .kp-krow').count();
  info.putsKnotView = await putsDuring(() => p.evaluate(() => APP.go('kpractice', 'knot_t1')));
  info.transfer = await p.locator('main .kp-note').count();

  // ۲۰۲۶-۱۰-۱۳: سازنده‌های کد «نمونهٔ آمادهٔ سازنده»اند (مسئلهٔ مالک نیستند) ⇒ پیش‌فرض پنهان؛ بخشِ هوش مصنوعی «از روی مسئلهٔ خودت» اول است
  await p.evaluate(() => APP.go('kpractice', 'knot_t1', 'items'));
  info.hiddenGens = await p.locator('main [data-gen]').count();
  info.firstCard = (await p.locator('main section.card h2:has-text("ساخت"), main section.card h2:has-text("نمونه‌های تازه")').first().textContent() || '').trim();
  if (info.hiddenGens !== 0) errors.push('code generators should be hidden by default');
  if (!/مسئلهٔ خودت/.test(info.firstCard)) errors.push('AI-from-your-problem card should come first: ' + info.firstCard);
  await p.evaluate(() => { const st = APP.S.settings(); st.samples = true; APP.S.saveSettings(st); });
  // ۲) نمونه‌های کد برای F3: کوزه‌ها و قیدِ پنهان (با «نمونه‌های آمادهٔ سازنده»)
  await p.evaluate(() => APP.go('kpractice', 'knot_t1', 'items'));
  info.genBtns = await p.locator('main [data-gen]').count();
  await p.click('main [data-gen="jars"]'); await p.waitForTimeout(100);
  await p.click('main [data-gen="hidden24"]'); await p.waitForTimeout(1500);
  info.items = await p.evaluate(() => APP.kitemsOf('knot_t1').map(i => i.gen.by + '|' + i.form + '|' + (i.decoy ? 'D' : '') + '|' + i.due).join(' ; '));
  info.nItems = await p.evaluate(() => APP.kitemsOf('knot_t1').length);
  info.remAfterGen = await p.evaluate(() => window.__rem.filter(x => x.key === 'knot:knot_t1').slice(-1)[0] || null);

  // پاسخ‌دادنِ یک نمونه از راهِ رابط
  async function answerCurrent(want, conf) {
    const it = await p.evaluate(() => {
      const t = document.querySelector('main .kp-prompt p').textContent;
      const all = APP.S.all('kitem').filter(i => i.prompt.split('\n')[0] === t);
      return all[0];
    });
    if (!it) { errors.push('item not identified'); return null; }
    const before = await p.locator('main #kpAns, main .kp-choices').count();
    await p.evaluate(v => { const r = document.querySelector('#kpConf'); r.value = v; r.dispatchEvent(new Event('input', { bubbles: true })); }, conf);
    await p.click('main .kp-conf .btn');
    if (it.atype === 'choice') {
      let ids = it.multi ? it.answer.split(',') : [it.answer];
      if (!want) ids = [it.choices.find(c => !ids.includes(c.id)).id];
      for (const id of ids) await p.click(`main label[for="kpC_${id}"]`);
    } else if (it.atype === 'int') await p.fill('main #kpAns', want ? it.answer : String(+it.answer + 1));
    else await p.fill('main #kpAns', want ? it.answer : '1+1');
    await p.click(it.decoy && want ? 'main label[for="kpSaw0"]' : 'main label[for="kpSaw1"]');
    await p.click('main #kpSubmit');
    const verdict = await p.locator('main .kp-verdict').innerText();
    const revealed = { deep: await p.locator('main .kp-reveal :text("ساختارِ عمیق کجا بود")').count(), trap: await p.locator('main .kp-reveal :text("تله کجا بود")').count() };
    await p.fill('main #kpWhy', 'چون راهِ کوتاه‌تر را باید اول می‌سنجیدم');
    await p.click('main #kpNext');
    return { id: it.id, before, verdict, revealed, decoy: it.decoy };
  }
  async function runSession(scopeId, plan, conf) {
    await p.evaluate(s => APP.go('kpractice', s, 'run'), scopeId);
    const out = [];
    for (let i = 0; i < 20; i++) {
      if (await p.locator('main .kp-sum').count()) break;
      if (!(await p.locator('main .kp-prompt').count())) { errors.push('no prompt in session'); break; }
      out.push(await answerCurrent(plan(i), conf));
    }
    return out;
  }
  // ۳) جلسهٔ ۱ (روزِ ۰): اولی نادرست، بقیه درست
  const s1 = await runSession('knot_t1', i => i !== 0, 80);
  info.s1 = s1.length; info.s1first = s1[0] && s1[0].verdict; info.confGate = s1.every(x => x && x.before === 0);
  info.revealOk = s1.every(x => x && x.revealed.deep === 1 && x.revealed.trap === 1);
  info.wrongItem = await p.evaluate(id => { const it = APP.S.get(id); return it.due + '|' + it.iv + '|' + (it.hist[0].why || '').length; }, s1[0].id);
  info.status1 = await p.evaluate(() => APP.S.get('knot_t1').status);
  info.sumCard = await p.locator('main .kp-sum').count();
  await p.click('main .kp-sum .btn'); await p.waitForTimeout(1500);
  info.remAfterS1 = await p.evaluate(() => window.__rem.filter(x => x.key === 'knot:knot_t1').slice(-1)[0] || null);
  info.mast1 = await p.evaluate(() => APP.kmastery(APP.S.get('knot_t1')).crit);
  // ۴) روزِ ۲: هنوز فاصلهٔ ۳ روز نیست
  await setDay('2026-11-04');
  info.due2 = await p.evaluate(() => APP.kpracticeDue().length);
  // ۵) روزِ ۳: جلسهٔ ۲، همه درست ⇒ ورزیده‌شده
  await setDay('2026-11-05');
  const s2 = await runSession('knot_t1', () => true, 80);
  info.s2 = s2.length;
  info.status2 = await p.evaluate(() => APP.S.get('knot_t1').status);
  info.mast2 = await p.evaluate(() => APP.kmastery(APP.S.get('knot_t1')).crit);
  await p.waitForTimeout(1500);
  info.unremPractised = await p.evaluate(() => window.__unrem.includes('knot:knot_t1'));
  // I2: one status writer (A.knotSetStatus) ⇒ knot.hist; a17 no longer writes shist
  info.shist = await p.evaluate(() => (APP.S.get('knot_t1').hist || []).map(x => x.status).join('>') + (APP.S.get('knot_t1').shist ? '|SHIST' : ''));
  // Minor6: a wrong answer after «ورزیده‌شده» does not silently drop the status — it stays, with a visible note
  info.lapse = await p.evaluate(() => {
    const it = APP.kitemsOf('knot_t1').find(i => !i.decoy && APP.kcountable(i));
    APP.krecord(it, { ok: false, conf: 70, ans: 'x', saw: true, sess: 'lapse' });
    const k = APP.S.get('knot_t1'), m = APP.kmastery(k);
    return k.status + '|' + m.status + '|' + !!m.lapse + '|' + APP.knotStatus(k);
  });
  await p.evaluate(() => APP.go('kpractice', 'knot_t1')); await p.waitForTimeout(100);
  info.lapseShown = await p.locator('main .kp-lapse').innerText().catch(() => '');
  await p.evaluate(() => APP.go('knot', 'knot_t1')); await p.waitForTimeout(100);
  info.lapseShownKnot = await p.locator('main .kn-lapse').count();
  await p.waitForTimeout(1400);
  // ۶) بازگشت: موقعیتِ تازه پس از ورزیده‌شدن
  await p.waitForTimeout(20);
  await p.evaluate(() => { window.__rem = []; APP.S.put({ id: 'kc_new', type: 'kcase', title: 'دوباره پیش آمد', knots: ['knot_t1'] }); const k = APP.S.get('knot_t1'); k.cases = ['kc_new']; APP.S.put(k); APP.go('kpractice'); });
  info.status3 = await p.evaluate(() => APP.S.get('knot_t1').status + '|' + !!APP.S.get('knot_t1').returnedAt);
  await p.waitForTimeout(50);
  info.remAfterReturn = await p.evaluate(() => window.__rem.filter(x => x.key === 'knot:knot_t1').length);
  info.histAfterReturn = await p.evaluate(() => (APP.S.get('knot_t1').hist || []).map(x => x.status).join('>'));
  await p.evaluate(() => { APP.S.put({ id: 'knot_t3', type: 'knot', name: 'ب', fam: 'F4', status: 'practised', solvedAt: new Date().toISOString(), cases: [] }); });
  info.knotReturned = await p.evaluate(() => APP.knotReturned('knot_t3') + '|' + APP.S.get('knot_t3').status + '|' + APP.knotReturned('knot_t3'));
  // ۷) نمونهٔ معیوب ⇒ بیرون از معیار
  info.badExcluded = await p.evaluate(() => { const it = APP.kitemsOf('knot_t1')[0]; it.bad = true; APP.S.put(it); const r = !APP.kcountable(it) && !APP.kservable(it); it.bad = false; APP.S.put(it); return r; });

  // ۸) هوش مصنوعی: سازنده + سه حل؛ یکی ناسازگار ⇒ «وارسی‌نشده»؛ نشت ⇒ کنار؛ نام‌ها حذف
  await p.evaluate(() => {
    APP.S.put({ id: 'knot_t2', type: 'knot', name: 'آزمون: تأییدجویی', fam: 'F4', principle: 'فقط آزمون‌هایی می‌دهم که حدسم را تأیید کنند', signals: 'مطمئن بودم', counter: 'آزمونِ ابطالی', example: 'علی گفت گزارش درست است و من فقط موردهای جور را دیدم', cases: [], status: 'open' });
    window.__ai = [];
    const items = { items: [
      { form: 'verbal', decoy: false, level: 1, prompt: 'یک نمونهٔ آزمایشی: کدام آزمون می‌تواند حدس را رد کند؟', atype: 'choice', choices: [{ id: 'a', t: 'تکرارِ همان مورد' }, { id: 'b', t: 'موردی که حدس برایش «نه» می‌گوید' }, { id: 'c', t: 'پرسیدن از دوست' }], answer: 'b', deep: 'ابطال', trap: 'تأیید', explain: '...' },
      { form: 'numeric', decoy: false, level: 1, prompt: 'حاصلِ ۱۲ چند است؟', atype: 'int', answer: '12', deep: 'x', trap: 'y', explain: 'z' },
      { form: 'numeric', decoy: true, level: 2, prompt: 'سه به‌اضافهٔ چهار چند می‌شود؟', atype: 'int', answer: '7', deep: 'x', trap: 'y', explain: 'z' },
      { form: 'bogus', prompt: 'بی‌شکل', atype: 'int', answer: '3' }
    ] };
    APP.callAI = function (sys, user) {
      window.__ai.push({ sys: sys.slice(0, 40), user });
      if (sys === APP.KGEN_SYS) return Promise.resolve('```json\n' + JSON.stringify(items) + '\n```');
      const si = APP.KSOLVERS.findIndex(s => sys.indexOf(s) === 0);
      if (/کدام آزمون/.test(user)) return Promise.resolve(JSON.stringify({ answer: si === 2 ? 'c' : 'b', multi: false, deep: true, why: '.' }));
      if (/سه به‌اضافهٔ چهار/.test(user)) return Promise.resolve(JSON.stringify({ answer: '7', multi: false, deep: false, why: '.' }));
      return Promise.resolve('{}');
    };
    APP.HOST.ai = (s, u) => APP.callAI(s, u); // «در دسترس بودنِ هوش مصنوعی»؛ خودِ درخواست‌ها از APP.callAI ِ بالا می‌گذرند
    APP._kaiReset();
    APP.go('kpractice', 'knot_t2', 'items');
  });
  info.codeGensF4 = await p.locator('main [data-gen]').count();
  // Minor5: the SAME notice component as a16 (exact preview + whole-word name removal) before every AI request
  await p.click('main #kpAI'); await p.waitForTimeout(150);
  info.gate = await p.locator('.kn-ai').count();
  info.gatePreviewRaw = await p.inputValue('#knAiPre');
  info.aiCallsBeforeOk = await p.evaluate(() => window.__ai.length);
  await p.fill('#knAiNames', 'علی'); await p.waitForTimeout(80);
  info.gatePreview = await p.inputValue('#knAiPre');
  await p.click('.kn-ai .btn:has-text("بفرست")'); await p.waitForTimeout(800);
  info.ai = await p.evaluate(() => APP.kitemsOf('knot_t2').filter(i => i.gen.by === 'ai').map(i => i.answer + ':' + (i.ver.ok ? 'ok' : 'unv') + ':' + i.ver.agree + ':' + (i.ver.deepOk ? 'deep' : 'nodeep')).sort().join(' '));
  info.rejected = await p.evaluate(() => APP._klastRep.rejected.map(r => r.why.slice(0, 12)).join(' | '));
  info.solverCalls = await p.evaluate(() => window.__ai.filter(x => x.sys !== APP.KGEN_SYS.slice(0, 40)).length);
  info.namesStripped = await p.evaluate(() => window.__ai.every(x => !/(^|[^آ-ی])علی([^آ-ی]|$)/.test(x.user)) && /\[شخص\]/.test(window.__ai[0].user));
  info.previewExact = await p.evaluate(pv => window.__ai[0].user === pv, info.gatePreview);
  info.previewHadName = /علی/.test(info.gatePreviewRaw) && !/(^|[^آ-ی])علی([^آ-ی]|$)/.test(info.gatePreview);
  info.solverNoAnswer = await p.evaluate(() => window.__ai.filter(x => /کدام آزمون/.test(x.user)).every(x => !/"answer"\s*:\s*"b"/.test(x.user)));
  info.unvHidden = await p.evaluate(() => { const u = APP.kitemsOf('knot_t2').find(i => i.ver && !i.ver.ok); const a = APP.kservable(u); const st = APP.S.settings(); st.knots = st.knots || {}; st.knots.showUnverified = true; const b2 = APP.kservable(u); st.knots.showUnverified = false; return a + '|' + b2 + '|' + APP.kcountable(u); });
  info.unvLabel = await p.locator('main details summary:has-text("وارسی‌نشده")').count();
  // دومین درخواست در همین نشست: اعلام دوباره می‌آید (پیش از هر درخواست) و تا «بفرست» چیزی فرستاده نمی‌شود
  await p.evaluate(() => { window.__ai = []; APP.go('kpractice', 'knot_t2', 'items'); });
  await p.click('main #kpAI'); await p.waitForTimeout(400);
  info.gateAgain = await p.locator('.kn-ai').count(); info.aiCalls2 = await p.evaluate(() => window.__ai.length);
  await p.click('.kn-ai .btn.ghost'); await p.waitForTimeout(100);
  info.cancelNoCall = await p.evaluate(() => window.__ai.length) === 0 && await p.locator('main #kpAI').isEnabled();
  // ایمنی (C1): همان بررسیِ a16 — «دلم می‌خواد بمیرم» هم (که فهرستِ قدیمیِ a17 نمی‌دید) کارتِ کمک را پیش از هر درخواست می‌آورد
  await p.evaluate(() => { window.__ai = []; APP.S.put({ id: 'knot_t4', type: 'knot', name: 'ج', fam: 'F8', principle: 'نفرینِ دانش', example: 'دلم می‌خواد بمیرم وقتی جلسه این‌طور می‌شود', cases: [], status: 'open' }); APP.go('kpractice', 'knot_t4', 'items'); });
  await p.click('main #kpAI'); await p.waitForTimeout(150);
  info.safety = await p.locator('.kn-safe').count(); info.safetyText = /123/.test(await p.locator('.kn-safe').innerText()) && (await p.locator('.kn-ai').count()) === 0;
  await p.click('.kn-safe .btn.ghost'); await p.waitForTimeout(100);
  info.safetyNoCall = await p.evaluate(() => window.__ai.length);
  // بی هوش مصنوعی: قالبِ کاربر
  await p.evaluate(() => APP.go('kpractice', 'knot_t4', 'items'));
  await p.selectOption('main #kpUA', 'int'); await p.fill('main #kpUP', 'در جلسه سه نفر حرف زدند و دو نفر رفتند؛ چند نفر ماندند اگر اول پنج نفر بودند؟'); await p.fill('main #kpUAns', '3');
  await p.click('main .btn:has-text("ذخیرهٔ نمونه")'); await p.waitForTimeout(100);
  info.userLeakBlocked = await p.evaluate(() => APP.kitemsOf('knot_t4').filter(i => i.gen.by === 'user').length); // «سه» به حروف آمده؛ پاسخ ۳ عدد در صورت نیست ⇒ ذخیره
  await p.selectOption('main #kpUA', 'int'); await p.fill('main #kpUP', 'عددِ ۹ را بنویس'); await p.fill('main #kpUAns', '9');
  await p.click('main .btn:has-text("ذخیرهٔ نمونه")'); await p.waitForTimeout(100);
  info.userLeak2 = await p.evaluate(() => APP.kitemsOf('knot_t4').filter(i => i.gen.by === 'user').length);
  info.userCountable = await p.evaluate(() => APP.kcountable(APP.kitemsOf('knot_t4').find(i => i.gen.by === 'user')));

  // ۹) آزمایش‌های واقعی ⇒ ورزیده‌شده (گرهِ اجتماعی F8)
  await setDay('2026-11-01');
  for (const [i, d] of [[0, '2026-11-01'], [1, '2026-11-06'], [2, '2026-11-16']].entries()) {
    await setDay(d[1]);
    await p.evaluate(() => APP.go('kpractice', 'knot_t4', 'exp'));
    await p.fill('main #kpXPlan', 'در جلسهٔ بعد پیامم را در یک جمله می‌گویم'); await p.fill('main #kpXPred', 'مدیر سؤالِ پیگیری می‌پرسد');
    await p.click('main .btn:has-text("ثبتِ آزمایش")'); await p.waitForTimeout(80);
    const li = p.locator('main .kp-xdone').first();
    await li.locator('textarea').nth(0).fill('مدیر پرسید چه زمانی آماده است'); await li.locator('select').selectOption('same'); await li.locator('textarea').nth(1).fill('یک جمله‌ای گفتن کار کرد؛ دوباره می‌آزمایم');
    await li.locator('.btn').click(); await p.waitForTimeout(80);
    info['exp' + i] = await p.evaluate(() => APP.S.get('knot_t4').status);
  }
  // ۱۰) یادآور: پیش‌فرض خنثی؛ «جزئیات» فقط با روشن‌کردن؛ F7/F9 هرگز
  info.remNeutral = await p.evaluate(() => { const r = window.__rem.filter(x => x.key === 'knot:knot_t2').slice(-1)[0]; return r && r.body === APP.KREMIND_BODY && r.detail === null && !/تأییدجویی/.test(JSON.stringify(r)) && r.link === '?tab=kpractice&a=knot_t2' && /^\d{4}-\d\d-\d\d$/.test(r.due_date) && !!r.tz; });
  await p.evaluate(() => APP.go('settings')); await bad('settings');
  info.notifyCard = await p.locator('main #kpNotify').count();
  info.notifyDefaults = await p.evaluate(() => ['kpTg', 'kpEm', 'kpDet', 'kpUnv'].map(id => document.getElementById(id).checked ? 1 : 0).join(''));
  info.notifyStatus = await p.locator('main #kpRemStatus').innerText();
  await p.evaluate(() => { window.__rem = []; });
  await p.click('main label[for="kpDet"]'); await p.waitForTimeout(100);
  info.detailOn = await p.evaluate(() => { const r = window.__rem.find(x => x.key === 'knot:knot_t2'); const it = APP.kitemsOf('knot_t2').filter(i => APP.kservable(i)); return !!r && /تأییدجویی/.test(r.detail) && it.every(i => !(r.detail || '').includes('«' + i.answer + '»')); });
  info.settingSaved = await p.evaluate(() => APP.S.settings().knots.notify.detail);
  await p.evaluate(() => { APP.S.put({ id: 'knot_t5', type: 'knot', name: 'ترس از قضاوت', fam: 'F7', cases: [], status: 'open' }); APP.kmakeUser(APP.S.get('knot_t5'), { atype: 'rubric', prompt: 'در جلسه نظرت را بگو', rubric: ['یک جمله', 'زمانِ مناسب'], form: 'real' }); });
  info.f7NoDetail = await p.evaluate(() => APP.kremindPayload(APP.S.get('knot_t5')).detail === null);
  // I5: F7/F9 as a SECONDARY family of the knot, or in the root of a linked situation ⇒ still no detail
  info.privExtra = await p.evaluate(() => {
    const mk = (id, o) => { APP.S.put(Object.assign({ id, type: 'knot', name: 'گرهِ ' + id, cases: [], status: 'open' }, o)); APP.kmakeCode(id, 'jars', 1, 0, 1); return APP.kremindPayload(APP.S.get(id)); };
    APP.S.put({ id: 'kc_t7', type: 'kcase', title: 't7', root: { primary: 'F3', extra: [{ fam: 'F9' }] }, knots: ['knot_t7'] });
    const a = mk('knot_t6', { fam: 'F8', extra: [{ fam: 'F7' }] }), b = mk('knot_t7', { fam: 'F3', cases: ['kc_t7'] }), c = mk('knot_t8', { fam: 'F3' });
    return [a.detail === null, b.detail === null, !!c.detail].join(',');
  });
  // جزئیات برای هر کانال جدا (۲۰۲۶-۱۰-۱۳): پیش‌فرض هر دو؛ خاموش‌کردنِ ایمیل ⇒ فقط تلگرام؛ هر دو خاموش ⇒ بی جزئیات
  info.detCh = await p.evaluate(() => { const c = APP.kremindPayload(APP.S.get('knot_t8')); return c.detail_channels.join(','); });
  const chkDet = (await p.locator('#kpDetTg').isEnabled()) && (await p.locator('#kpDetEm').isEnabled());
  await p.click('main label[for="kpDetEm"]'); await p.waitForTimeout(80);
  info.detTgOnly = await p.evaluate(() => { const c = APP.kremindPayload(APP.S.get('knot_t8')); return c.detail_channels.join(',') + ':' + !!c.detail; });
  await p.click('main label[for="kpDetTg"]'); await p.waitForTimeout(80);
  info.detNone = await p.evaluate(() => { const c = APP.kremindPayload(APP.S.get('knot_t8')); return c.detail === null && !c.detail_channels; });
  await p.click('main label[for="kpDetTg"]'); await p.click('main label[for="kpDetEm"]'); await p.waitForTimeout(80);
  await p.click('main label[for="kpDet"]'); await p.waitForTimeout(50);
  info.detSubDisabled = chkDet && (await p.locator('#kpDetTg').isDisabled());
  await p.click('main label[for="kpDet"]'); await p.waitForTimeout(50);
  await p.click('main label[for="kpTg"]'); await p.click('main label[for="kpEm"]'); await p.waitForTimeout(100);
  info.bothOffUnremind = await p.evaluate(() => window.__unrem.includes('knot:knot_t2'));
  await p.click('main label[for="kpTg"]'); await p.click('main label[for="kpDet"]'); await p.waitForTimeout(50);
  // حذفِ گره ⇒ لغوِ یادآور در جاروی بعدی
  await p.evaluate(() => { window.__unrem = []; APP.kremindSync(APP.S.get('knot_t2')); APP.S.del('knot_t2'); APP.go('kpractice'); });
  info.sweep = await p.evaluate(() => window.__unrem.includes('knot:knot_t2'));
  // «امروز»: یک سطرِ ترکیبی
  await p.evaluate(() => { APP.kmakeCode('knot_t1', 'wason', 1, 0, 1); });
  info.dueRow = await p.evaluate(() => APP.dueList().filter(x => /ورزشِ گره/.test(x.txt)).length);
  await p.evaluate(() => APP.go('home')); await bad('home');
  // I4: F1 has no code generator ⇒ an honest notice; F2 now offers the hidden-constraint task in 3 forms + «بازخوانیِ صورت»
  await p.evaluate(() => { APP.S.put({ id: 'knot_f1', type: 'knot', name: 'مفهوم', fam: 'F1', principle: 'p', cases: [], status: 'open' }); APP.S.put({ id: 'knot_f2', type: 'knot', name: 'بازنمایی', fam: 'F2', principle: 'p', cases: [], status: 'open' }); APP.go('kpractice', 'knot_f1', 'items'); });
  info.f1Gap = await p.locator('main .kp-codegap').count() + ':' + await p.evaluate(() => APP.kcodeGap(APP.S.get('knot_t1')) === null);
  await p.evaluate(() => APP.go('knot', 'knot_f1')); await p.waitForTimeout(80);
  info.f1GapKnot = await p.locator('main .kn-codegap').count();
  await p.evaluate(() => APP.go('kpractice', 'knot_f2', 'items'));
  info.f2Gens = await p.evaluate(() => [...document.querySelectorAll('main [data-gen]')].map(b => b.dataset.gen).join(','));
  await p.click('main [data-gen="reread"]'); await p.waitForTimeout(80); await p.click('main [data-gen="hidden24"]'); await p.waitForTimeout(100);
  info.f2Forms = await p.evaluate(() => [...new Set(APP.kitemsOf('knot_f2').filter(i => !i.decoy).map(i => i.form))].sort().join(','));
  // جلسهٔ درهم‌تنیده: نامِ گره پیش از پاسخ پنهان
  await p.evaluate(() => { APP.kmakeCode('knot_t3', 'rule246', 1, 0, 1); APP.go('kpractice', null, 'run'); });
  info.interleavedHidesName = (await p.locator('main .kp-item .chip:has-text("گره:")').count()) === 0;
  info.interleavedN = await p.locator('main .kp-item .eyebrow').innerText();
  // آزمونِ ۲-۴-۶ در رابط: پیش از حدِّاقلِ آزمون، اطمینان و انتخاب نیست؛ پاسخِ «می‌خواند/نمی‌خواند» از قاعدهٔ پنهان
  await p.evaluate(() => APP.go('kpractice', 'knot_t3', 'run'));
  info.probeGate = await p.locator('main #kpConf').count();
  for (const t of [[1, 2, 3], [3, 2, 1]]) { const ins = p.locator('main .kp-probe input'); for (let j = 0; j < 3; j++) await ins.nth(j).fill(String(t[j])); await p.click('main .kp-probe .btn'); }
  info.probeAfter = await p.locator('main #kpConf').count();
  info.probeTruth = await p.evaluate(() => { const it = APP.kitemsOf('knot_t3').find(i => i.params && i.params.rule); const shown = [...document.querySelectorAll('main .kp-probes li')].map(li => li.classList.contains('ok')); return shown.join() === [APP.kprobe(it, [1, 2, 3]), APP.kprobe(it, [3, 2, 1])].join(); });
  // ۱۲) پیوستِ تصویری (میزبانِ ساختگی): سازندهٔ نمونه‌ها عکسِ تازه‌ترین موقعیتِ پیوست‌دارِ گره را می‌گیرد؛ سه حلِ وارسی هرگز
  await p.evaluate(() => {
    window.__ai3 = [];
    APP.S.put({ id: 'kc_img0', type: 'kcase', title: 'موقعیتِ قدیمیِ اجتماعی', kinds: ['social'], intake: { what: 'x' }, knots: ['knot_img'], created: '2026-10-01T10:00:00Z' });
    APP.S.put({ id: 'kc_img1', type: 'kcase', title: 'سؤالِ تصویریِ آزمونِ هوش', kinds: ['problem'], intake: { what: 'x' }, knots: ['knot_img'], created: '2026-11-01T10:00:00Z' });
    APP.S.put({ id: 'kc_img2', type: 'kcase', title: 'تازه‌ترین ولی بی‌پیوست', kinds: ['problem'], intake: { what: 'x' }, knots: ['knot_img'], created: '2026-11-02T10:00:00Z' });
    APP.S.put({ id: 'knot_img', type: 'knot', name: 'الگوی شکل‌ها', fam: 'F2', principle: 'شکل را جزءبه‌جزء نمی‌خوانم و قیدِ پنهان را نمی‌بینم', signals: 'یک شکلِ شلوغ', counter: 'اجزا را جدا بشمار', example: 'ماتریسِ شکل‌ها', cases: ['kc_img0', 'kc_img1', 'kc_img2'], status: 'open' });
    window.__filesAsked = [];
    APP.HOST.files = (rid) => { window.__filesAsked.push(rid); return Promise.resolve(rid === 'kc_img1' ? [{ id: 71, name: 'q.png', mime: 'image/png', size: 2000, link: '#' }, { id: 72, name: 'big.png', mime: 'image/png', size: 9e6, link: '#' }, { id: 73, name: 'n.txt', mime: 'text/plain', size: 5, link: '#' }] : rid === 'kc_img0' ? [{ id: 70, name: 'old.png', mime: 'image/png', size: 100, link: '#' }] : []); };
    APP.HOST.upload = () => Promise.resolve({});
    const items = { items: [{ form: 'numeric', decoy: false, level: 1, prompt: 'حاصلِ پنج به‌اضافهٔ شش؟', atype: 'int', answer: '11', deep: 'x', trap: 'y', explain: 'z' }] };
    APP.callAI = function (sys, user, opts) {
      window.__ai3.push({ gen: sys === APP.KGEN_SYS, fileIds: (opts && opts.fileIds && opts.fileIds.length) ? opts.fileIds : null, user });
      return Promise.resolve(sys === APP.KGEN_SYS ? JSON.stringify(items) : JSON.stringify({ answer: '11', multi: false, deep: true, why: '.' }));
    };
    APP.go('kpractice', 'knot_img', 'items');
  });
  await p.click('main #kpAI'); await p.waitForTimeout(300);
  info.imgLabel = await p.locator('.kn-ai label[for="knAiAtt"]').innerText().catch(() => '');
  info.imgOn = await p.isChecked('#knAiAtt').catch(() => null);
  info.imgFrom = await p.locator('.kn-ai .kn-ai-att').innerText().catch(() => '');
  info.imgWarn = await p.locator('.kn-ai .kn-ai-attw:not(.hidden)').count();
  info.imgAsked = await p.evaluate(() => window.__filesAsked.join(','));
  await p.click('.kn-ai .btn:has-text("بفرست")'); await p.waitForTimeout(900);
  info.imgCalls = await p.evaluate(() => window.__ai3.map(x => (x.gen ? 'gen' : 'solve') + ':' + JSON.stringify(x.fileIds)).join(' '));
  info.imgSolverText = await p.evaluate(() => window.__ai3.filter(x => !x.gen).every(x => /پنج به‌اضافهٔ شش/.test(x.user)));
  // بی‌تیک ⇒ هیچ fileIds
  await p.evaluate(() => { window.__ai3 = []; APP.go('kpractice', 'knot_img', 'items'); });
  await p.click('main #kpAI'); await p.waitForTimeout(300);
  await p.uncheck('#knAiAtt'); info.imgWarnOff = await p.locator('.kn-ai .kn-ai-attw:not(.hidden)').count();
  await p.click('.kn-ai .btn:has-text("بفرست")'); await p.waitForTimeout(900);
  info.imgOffCalls = await p.evaluate(() => window.__ai3.every(x => x.fileIds === null) && window.__ai3.length === 4);
  await p.evaluate(() => { delete APP.HOST.files; delete APP.HOST.upload; });
  // موبایل
  await p.setViewportSize({ width: 390, height: 844 });
  for (const v of [['kpractice'], ['kpractice', 'knot_t1'], ['kpractice', 'knot_t1', 'items'], ['kpractice', 'knot_t4', 'exp'], ['kpractice', 'knot_t1', 'run'], ['settings']]) {
    await p.evaluate(x => APP.go(...x), v); await p.waitForTimeout(120); await bad(v.join('/'));
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (ov > 2) errors.push('mobile overflow ' + v.join('/') + ' ' + ov);
  }
  await p.evaluate(() => APP.go('kpractice', 'knot_t1', 'run')); await p.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_kpractice_mobile.png'), fullPage: true });
  await p.setViewportSize({ width: 1280, height: 900 });
  await p.evaluate(() => APP.go('kpractice', 'knot_t1')); await p.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_kpractice_knot.png'), fullPage: true });
  console.log(JSON.stringify(info, null, 1));

  // ---------- داوری ----------
  const chk = (c, m) => { if (!c) errors.push(m); };
  chk(info.nav === 1, 'nav entry');
  chk(info.putsHub.length === 0 && info.putsKnotView.length === 0, 'viewing wrote: ' + JSON.stringify([info.putsHub, info.putsKnotView]));
  chk(info.transfer === 1, 'transfer note');
  chk(info.genBtns === 2, 'F3 should offer jars + hidden24: ' + info.genBtns);
  chk(info.nItems === 8, 'code items: ' + info.nItems);
  chk(info.remAfterGen && info.remAfterGen.body === 'یک ورزشِ گره موعد است' && info.remAfterGen.detail === null, 'remind after generation');
  chk(info.s1 === 8 && /نادرست/.test(info.s1first), 'session 1: ' + info.s1 + ' ' + info.s1first);
  chk(info.confGate, 'answer controls visible before confidence');
  chk(info.revealOk, 'reveal deep/trap');
  chk(/^2026-11-03\|1\|\d+$/.test(info.wrongItem) && +info.wrongItem.split('|')[2] > 5, 'wrong → due tomorrow + why saved: ' + info.wrongItem);
  chk(info.status1 === 'working', 'status after s1: ' + info.status1);
  chk(info.remAfterS1 && info.remAfterS1.due_date === '2026-11-03', 'remind due after s1: ' + JSON.stringify(info.remAfterS1));
  chk(info.mast1.sessions === 1 && info.mast1.decoys >= 1, 'mastery crit s1: ' + JSON.stringify(info.mast1));
  chk(info.due2 === 8, 'all due on day 2: ' + info.due2);
  chk(info.s2 === 8, 'session 2 items: ' + info.s2);
  chk(info.status2 === 'practised', 'not practised after s2: ' + info.status2 + ' ' + JSON.stringify(info.mast2));
  chk(info.unremPractised, 'practised knot reminder not cancelled');
  chk(info.shist === 'working>practised', 'status history (single writer, no shist): ' + info.shist);
  chk(info.lapse === 'practised|practised|true|practised' && /پس از ورزیدگی/.test(info.lapseShown) && info.lapseShownKnot === 1, 'Minor6 lapse: ' + info.lapse + ' ' + info.lapseShown + ' ' + info.lapseShownKnot);
  chk(info.status3 === 'returned|true', 'returned detection: ' + info.status3);
  chk(info.remAfterReturn >= 1 && info.histAfterReturn === 'working>practised>returned', 'I2 returned ⇒ follow-up reminder + hist: ' + info.remAfterReturn + ' ' + info.histAfterReturn);
  chk(info.knotReturned === 'true|returned|false', 'A.knotReturned: ' + info.knotReturned);
  chk(info.badExcluded, 'bad item not excluded');
  chk(info.codeGensF4 === 3, 'F4 code generators: ' + info.codeGensF4);
  chk(info.gate === 1 && info.aiCallsBeforeOk === 0, 'provider notice before AI call');
  chk(info.previewExact && info.previewHadName, 'Minor5 preview is exactly what is sent: ' + info.previewExact + ' ' + info.previewHadName);
  chk(info.ai === '7:ok:3:deep b:unv:2:deep', 'AI verify outcome: ' + info.ai);
  chk(/نشت/.test(info.rejected) && /ساختار/.test(info.rejected), 'rejections: ' + info.rejected);
  chk(info.solverCalls === 6, 'three independent solves per item: ' + info.solverCalls);
  chk(info.namesStripped, 'names not stripped');
  chk(info.solverNoAnswer, 'solver saw the answer');
  chk(info.unvHidden === 'false|true|false', 'unverified visibility/countable: ' + info.unvHidden);
  chk(info.unvLabel >= 1, 'unverified label');
  chk(info.gateAgain === 1 && info.aiCalls2 === 0 && info.cancelNoCall, 'Minor5 notice before EVERY request: ' + [info.gateAgain, info.aiCalls2, info.cancelNoCall]);
  chk(info.safety === 1 && info.safetyText && info.safetyNoCall === 0, 'safety gate');
  chk(info.userLeakBlocked === 1 && info.userLeak2 === 1 && info.userCountable === true, 'user template: ' + [info.userLeakBlocked, info.userLeak2, info.userCountable]);
  chk(info.exp0 === 'working' && info.exp1 === 'working' && info.exp2 === 'practised', 'experiments mastery: ' + [info.exp0, info.exp1, info.exp2]);
  chk(info.remNeutral, 'neutral reminder payload');
  chk(info.notifyCard === 1 && info.notifyDefaults === '1100', 'notify card defaults: ' + info.notifyDefaults);
  chk(/تنظیم‌نشده/.test(info.notifyStatus), 'honest status text');
  chk(info.detailOn && info.settingSaved === true, 'detail toggle');
  chk(info.f7NoDetail, 'F7 detail must be null');
  chk(info.privExtra === 'true,true,true', 'I5 F7/F9 in extras or linked roots: ' + info.privExtra);
  chk(info.f1Gap === '1:true' && info.f1GapKnot === 1, 'I4c F1 notice: ' + info.f1Gap + ' ' + info.f1GapKnot);
  chk(info.f2Gens === 'hidden24,reread' && info.f2Forms.split(',').length >= 3, 'I4b F2 code forms: ' + info.f2Gens + ' / ' + info.f2Forms);
  chk(info.bothOffUnremind, 'channels off ⇒ unremind');
  chk(info.detCh === 'telegram,email' && info.detTgOnly === 'telegram:true' && info.detNone === true && info.detSubDisabled === true, 'per-channel detail: ' + [info.detCh, info.detTgOnly, info.detNone, info.detSubDisabled].join(' | '));
  chk(info.sweep, 'deleted knot sweep');
  chk(info.dueRow === 1, 'today row');
  chk(info.interleavedHidesName, 'knot name visible before answer');
  chk(info.probeGate === 0 && info.probeAfter === 1 && info.probeTruth, 'probe gate ' + info.probeGate + '/' + info.probeAfter + '/' + info.probeTruth);
  chk(/پیوست‌ها هم فرستاده و کامل خوانده شوند \(۳\)/.test(info.imgLabel) && info.imgOn === true && info.imgWarn === 1 && /سؤالِ تصویریِ آزمونِ هوش/.test(info.imgFrom), 'knot image offer: ' + info.imgLabel + ' ' + info.imgOn + ' ' + info.imgFrom);
  chk(info.imgAsked === 'kc_img2,kc_img1', 'newest case with an image first: ' + info.imgAsked);
  // all three files go to the generator since 2026-10-14 (WORKLOG 44: every format read in full); the solvers still never see them
  chk(info.imgCalls === 'gen:[71,72,73] solve:null solve:null solve:null' && info.imgSolverText, 'generator gets the image, the three verifying solvers never: ' + info.imgCalls);
  chk(info.imgWarnOff === 0 && info.imgOffCalls, 'unticked => no fileIds: ' + info.imgOffCalls);
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
