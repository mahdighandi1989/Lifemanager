// تورِ پولیا (دستهٔ ۱، دورِ ۱۶ ِ اصلاح، سهمِ «coach» — ۲۰۲۶-۱۰-۱۷) — DECISIONS_R16 (N1–N6) روی رابطِ واقعی (پنلِ دستیار با مدلِ ساختگی).
//  n1      N1 — بستنِ مسئله در گفت‌وگو بازنگری را کامل می‌کند: chat_solved «taste» و «bestQ» می‌گیرد؛ قاعدهٔ بستن هر دو را می‌خواهد (یک پرسش در هر نوبت)؛
//          نوبتِ پس از بستن «کدام پرسش بیشتر کمک کرد؟» پرسشِ نوبت است و بعد «این نوع مسئله برایت چطور بود؟»؛ chat_lookback پاسخ را روی همان بازنگری
//          (solve.b[1]) می‌گذارد (s08: هر دو معما در گفت‌وگو بسته شدند)؛ s31: سلیقهٔ هفتهٔ ۴ در سشنِ تازه («از مسئله‌های نابرابری خیلی بیشتر از هندسه لذت می‌برم»)
//  n1page  کارتِ کوچکِ «بازنگری: دو پرسشِ باقی‌مانده» روی صفحهٔ مسئله تا هر دو پاسخ بگیرند؛ ثبت از همان کارت؛ خلاصهٔ بازنگری «سلیقه‌ات» را نشان می‌دهد
//  n2      N2 — «🔭» به معنا: قاعدهٔ کوتاهِ «🔭 مسئلهٔ حل‌نشدهٔ خودم» همیشه در پرامپت (جز سشنِ بسته به مسئلهٔ باز)؛ خانوادهٔ «ماه‌هاست / فکرم کار نمی‌کنه /
//          گیر کردم روش / … یا نه» ِ پژوهشِ خودش قاعدهٔ کامل را می‌آورد (s20 مریم)؛ فقط پیشنهاد — هرگز ساختِ خودکار
//  n3      N3 — chat_invent ِ تکراری (sameProblem و هم‌خانوادهٔ بازگفته) سشن را به همان مسئله می‌بندد (lprobLog) و حدسِ کاربر حدسِ همان مسئله می‌شود (s11 روزِ ۱۰-۲۱)
//  n4      N4 — ضمیرِ گفت‌وگو: «شما» ِ کاربرِ ۶۷ساله ⇒ پرسشِ مرورِ بی‌نگاه «یادتان هست … راهتان …» و سطرِ «ضمیرِ گفت‌وگو (شما/تو) را عوض نکن» (s12)؛ کنترل: «تو» همان «تو»
//  n5      N5 — درخواستِ عقب‌افتاده («جزوه را رد نمی‌کنم، ولی اول …») قولی در سشن می‌شود و تا داده شدن یا ردِ کاربر سطرِ زمینه است (s14)
//  n6      N6 — برنامهٔ تاریخ‌دار/تکراریِ خودش («هر سه‌شنبه امتحان می‌کنم») ⇒ پیشنهادِ پیگیری با کنشِ موجودِ deadline؛ «امروز» نشانش می‌دهد (s15)؛ بی ساختِ خودکار
//  strict  کنترل: یک پرسشِ نوبت در هر بلوک — همان پویشِ سخت‌گیرانهٔ test_tour1_r11_coach.js روی همهٔ پرامپت‌های این آزمون
// LLA_FILE = ساختِ دیگر؛ ONLY=n1,n4 …
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));

// ---------- همان پویشِ سخت‌گیرانهٔ K1 (test_tour1_r11_coach.js) ----------
const SKIP = /^# (?:سشن|گفت‌وگو تا این لحظه|نوبتِ تازه|صفحهٔ فعلی|امروز|نقشهٔ سامانه|برگه‌های بازِ|پیام‌های اخیرِ صفحه|متنِ فایل‌ها|کارنامهٔ ذهن|مسئلهٔ زندهٔ این سشن)/;
const isTurnLine = (l) => /\*\*پرسشِ این نوبت همین است:?\*\*/.test(l) || /^- پرسش‌های «/.test(l) || /^- در این نوبت فقط \*\*یک\*\* پرسش/.test(l);
const isCtxLine = (l) => /^- زمینه \(نه پرسشِ دوم\)/.test(l) || /^- \(زمینه، نه پرسشِ دوم/.test(l);
const ASK = /(?:^|[^آ-ی])بپرس(?![آ-ی])/;
const ENDQ = /[؟?][»"')\].\s*]*$/;
function strictScan(user) {
  const head = String(user || '').split('# نوبتِ تازه')[0], bad = [];
  for (const bl of head.split(/\n(?=# )/)) {
    const h = bl.split('\n')[0]; if (!/^# /.test(h) || SKIP.test(h)) continue;
    const blockCtx = /\n- \(زمینه، نه پرسشِ دوم/.test(bl);
    for (const l of bl.split('\n')) {
      if (isTurnLine(l)) continue;
      const nq = l.replace(/«[^»]*»/g, '«»');
      if (ASK.test(nq)) bad.push('ASK  [' + h.slice(0, 30) + '] ' + l.slice(0, 160));
      else if (ENDQ.test(l.trim()) && !isCtxLine(l) && !blockCtx) bad.push('ENDQ [' + h.slice(0, 30) + '] ' + l.slice(0, 160));
    }
  }
  return bad;
}

(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0] + ' ' + JSON.stringify(info[name] && info[name].stage || '')); } };
  const W = (ms) => p.waitForTimeout(ms || 90);
  const T0 = '2026-11-02';   // دوشنبه
  await p.goto(FILE); await p.waitForSelector('.nav'); await W(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__all = []; window.__q = []; window.__day = T0; window.__noNav = true;
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); __all.push(String(user || '')); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
  }, T0);
  const go = async (v, a, s) => { await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await W(140); };
  const say = async (text) => {
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
    await p.evaluate(() => APP.ASSIST.toggle(false)); await W(60);
  };
  const next = (reply, actions) => p.evaluate(([reply, actions]) => __q.push(R({ reply, actions: actions || [] })), [reply, actions || []]);
  const newSess = () => p.evaluate(() => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; return s.id; });
  const lastUser = () => p.evaluate(() => { const c = __calls.filter(x => !/^\[سامانه/.test(String(((x.user || '').split('# نوبتِ تازه\n')[1] || '')).trim())); return (c[c.length - 1] || __calls[__calls.length - 1] || {}).user || ''; });
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const block = (u, hd) => { const i = u.indexOf(hd); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  const turnLines = (u) => head(u).split('\n').filter(l => /\*\*پرسشِ این نوبت همین است:?\*\*/.test(l));
  const pidOf = (re) => p.evaluate(src => { const rx = new RegExp(src); const x = APP.liveAll().filter(x => rx.test(x.p.title)).pop(); return x ? x.p.id : null; }, re.source);
  const back = (pid) => p.evaluate(pid => { const pg = APP.S.get('eprog_' + pid) || {}; const so = pg.solve || {}; return JSON.parse(JSON.stringify((so.b && so.b[1]) || null)); }, pid);
  const strictAll = [];
  const strict = (name, u) => { const bad = strictScan(u); strictAll.push([name, bad]); };

  // ================= n1 — N1: بستن در گفت‌وگو بازنگری را کامل می‌کند (s31، s08) =================
  let P31 = null;
  await section('n1', async () => {
    const r = info.n1 = {}; r.stage = 'chat';
    await newSess();
    await next('گامِ اولِ حلت را بنویس — آنجا چه چیزی را فرض کردی که صورت نگفته بود؟');
    await say('عدد ۲۰ را به جمعِ چند عددِ طبیعی بنویس که حاصل‌ضربشان بیشینه شود. جوابم: ۱۰ و ۱۰، یعنی ۱۰۰. سؤالِ بعدی؟');
    // دورِ ۱۷ (RC5): پاسخِ بستن خودش «کدام پرسش…» را نمی‌پرسد — وگرنه آن پرسش «پرسیده» است و صفحه دوباره نمی‌خواهدش (A·D4)
    await next('درست ثبت شد و کارتِ بازسازی فردا می‌آید.', [{ do: 'chat_solved', title: 'بیشینهٔ حاصل‌ضربِ جمعِ ۲۰', statement: 'عدد ۲۰ را به جمعِ چند عددِ طبیعی بنویس که حاصل‌ضربشان بیشینه شود.', kind: 'find',
      lesson: 'فرض نکنم که صورت چیزی را گفته که نگفته؛ اول ببینم دقیقاً چه خواسته', check: 'با ۴+۴+۴+۴+۴ وارسی کردم که ۱۰۲۴ شد و کمتر است' }]);
    await say('فرض کردم دو تا عدده. با سه‌ها: ۳+۳+۳+۳+۳+۳+۲ که حاصل‌ضربش ۱۴۵۸ است. با ۴+۴+۴+۴+۴ وارسی کردم که ۱۰۲۴ شد و کمتر است. درسم: فرض نکنم که صورت چیزی را گفته که نگفته؛ اول ببینم دقیقاً چه خواسته.');
    const uClose = await lastUser();
    const rule = head(uClose).split('\n').filter(l => /chat_solved/.test(l))[0] || '';
    r.rule = /"taste"|\\"taste\\"/.test(rule) && /"bestQ"|\\"bestQ\\"/.test(rule) && /کدام پرسش بیشتر کمک کرد/.test(rule) && /برایت چطور بود/.test(rule);
    chk(r.rule, 'n1: the closure rule (chat_solved) asks for both look-back pieces — "bestQ" («کدام پرسش بیشتر کمک کرد؟») and "taste" («این نوع مسئله برایت چطور بود؟») (N1, s31/s08) ' + rule.slice(0, 400));
    strict('n1 closure', uClose);
    P31 = await pidOf(/بیشینهٔ حاصل‌ضرب/);
    chk(!!P31, 'n1 setup: chat_solved filed the problem ' + P31);
    // نوبتِ پس از بستن: پرسشِ نوبت «کدام پرسش بیشتر کمک کرد؟»
    r.stage = 'after';
    await next('خوب است — همین را نگه داشتم.', [{ do: 'chat_lookback', pid: P31, bestQ: 'گامِ اولِ حلت را بنویس — آنجا چه چیزی را فرض کردی که صورت نگفته بود؟' }]);
    await say('باشه، حالا سؤالِ بعدی رو بده.');
    const u1 = await lastUser(); const t1 = turnLines(u1);
    r.best = t1.some(l => /کدام پرسش بیشتر/.test(l) && /بیشینهٔ حاصل‌ضرب/.test(l));
    chk(r.best, 'n1: the turn after a chat closure asks «کدام پرسش بیشتر کمک کرد؟» as the one turn question, naming the problem (N1, s08: never asked) ' + JSON.stringify(t1).slice(0, 500));
    chk(t1.length <= 1, 'n1: one turn question per prompt after closure ' + JSON.stringify(t1).slice(0, 300));
    strict('n1 best', u1);
    const b1 = await back(P31);
    r.bestStored = !!b1 && /فرض کردی که صورت نگفته/.test(b1.bestQ || '') && b1.bestKind === 'chat';
    chk(r.bestStored, 'n1: chat_lookback stores bestQ on the same look-back record (solve.b[1].bestQ, bestKind chat) ' + JSON.stringify(b1 && { bestQ: b1.bestQ, k: b1.bestKind }));
    r.stage = 'taste';
    await next('باشه.');
    await say('خب بعدش چی؟');
    const u2 = await lastUser(); const t2 = turnLines(u2);
    r.taste = t2.some(l => /برایت چطور بود|دوست داشتی/.test(l)) && !t2.some(l => /کدام پرسش بیشتر/.test(l));
    chk(r.taste, 'n1: once bestQ is kept, the next turn question is the taste question (one per turn) ' + JSON.stringify(t2).slice(0, 500));
    strict('n1 taste', u2);
    // s31 هفتهٔ ۴: سلیقه در سشنِ تازه ⇒ سطرِ زمینه با شناسهٔ همان مسئله و chat_lookback
    r.stage = 'week4';
    await p.evaluate(() => { window.__day = '2026-11-23'; });
    await newSess();
    await next('این را جدی بگیر — از همین خط، حلِ نویسندگانِ خوب را بخوان.', [{ do: 'chat_lookback', pid: P31, taste: 'از مسئله‌های نابرابری خیلی بیشتر از هندسه لذت می‌برم' }]);
    await say('راستش از مسئله‌های نابرابری خیلی بیشتر از هندسه لذت می‌برم.');
    const u3 = await lastUser();
    r.tasteLine = head(u3).split('\n').some(l => l.indexOf(P31) >= 0 && /chat_lookback/.test(l) && /taste/.test(l));
    chk(r.tasteLine, 'n1 (s31 week 4): stating her taste in a new session brings a context line naming the chat-closed problem whose look-back lacks taste, with chat_lookback ' + head(u3).split('\n').filter(l => /سلیقه/.test(l)).join(' | ').slice(0, 500));
    strict('n1 week4', u3);
    const b3 = await back(P31);
    chk(!!b3 && /نابرابری/.test(b3.taste || ''), 'n1 (s31): her taste is recorded on the solved problem — solve.b[1].taste (round 16: undefined) ' + JSON.stringify(b3 && b3.taste));
    // s08: chat_solved با taste و bestQ ِ همان نوبت
    r.stage = 's08';
    await p.evaluate(() => { window.__day = '2026-11-02'; });
    await newSess();
    await next('فرض کن تخم‌مرغ همین حالا دقیقاً ۱۵ دقیقه پخته است — یک لحظه پیش از آن در ساعت‌ها چه دیده می‌شد؟');
    await say('دو تا ساعت شنی دارم، ۷ و ۱۱ دقیقه‌ای. می‌خوام دقیقاً ۱۵ دقیقه تخم‌مرغ بپزم. نصف روزه امتحان می‌کنم نمیشه.');
    await next('ثبت شد.', [{ do: 'chat_solved', title: 'ساعت‌های شنیِ ۷ و ۱۱', statement: 'دو تا ساعت شنی دارم، ۷ و ۱۱ دقیقه‌ای. می‌خوام دقیقاً ۱۵ دقیقه تخم‌مرغ بپزم.', kind: 'find',
      lesson: 'وقتی رو به جلو گیر کردم، از جواب شروع کنم و برگردم عقب', check: 'گام‌ها رو لحظه‌به‌لحظه شمردم', bestQ: 'فرض کن تخم‌مرغ همین حالا دقیقاً ۱۵ دقیقه پخته است — یک لحظه پیش از آن در ساعت‌ها چه دیده می‌شد؟', taste: 'برگشتن از آخر رو دوست داشتم، امتحانِ کورکورانه رو نه' }]);
    await say('پیدا کردم: ۱۵ = ۱۱ + ۴ و ۴ = ۱۱ − ۷. وقتی رو به جلو گیر کردم، از جواب شروع کنم و برگردم عقب. همون «فرض کن ۱۵ دقیقه پخته» کمکم کرد؛ برگشتن از آخر رو دوست داشتم، امتحانِ کورکورانه رو نه.');
    const P08 = await pidOf(/ساعت‌های شنی/); const b8 = await back(P08);
    chk(!!b8 && /۱۵ دقیقه پخته/.test(b8.bestQ || '') && /برگشتن از آخر/.test(b8.taste || ''), 'n1 (s08): chat_solved keeps bestQ and taste given in the closure turn ' + JSON.stringify(b8 && { bestQ: b8.bestQ, taste: b8.taste }));
  });

  // ================= n1page — کارتِ «بازنگری: دو پرسشِ باقی‌مانده» =================
  await section('n1page', async () => {
    const r = info.n1page = {}; r.stage = 'setup';
    await newSess();
    await next('خودت تا کجا رفتی؟');
    await say('معما: با یک ترازوی دوکفه و سه بار وزن کردن، از ۹ سکه سکهٔ سبک‌تر را پیدا کن.');
    await next('درست ثبت شد.', [{ do: 'chat_solved', title: 'سکهٔ سبک میانِ ۹ سکه', statement: 'با یک ترازوی دوکفه و سه بار وزن کردن، از ۹ سکه سکهٔ سبک‌تر را پیدا کن.', kind: 'find', lesson: 'سه‌تایی تقسیم کنم نه دوتایی', check: 'با هر ۹ جای ممکن شمردم' }]);
    await say('سه‌تا سه‌تا تقسیم کردم: دو بار بس است. با هر ۹ جای ممکن شمردم. درسم: سه‌تایی تقسیم کنم نه دوتایی.');
    const P = await pidOf(/سکهٔ سبک/); chk(!!P, 'n1page setup ' + P);
    await go('lprob', P);
    r.card = await p.evaluate(() => { const c = document.querySelector('#main .lp-lbrest'); return c ? { t: c.textContent, best: !!c.querySelector('#lpRBest'), taste: !!c.querySelector('#lpRTaste'), lab: !!document.querySelector('label[for="lpRTaste"]') } : null; });
    chk(!!r.card && /بازنگری: دو پرسشِ باقی‌مانده/.test(r.card.t) && r.card.best && r.card.taste && r.card.lab, 'n1page: a chat-closed problem shows the small card «بازنگری: دو پرسشِ باقی‌مانده» with a labelled best-question select and taste field ' + JSON.stringify(r.card));
    if (r.card) {
      r.stage = 'save';
      const opt = await p.evaluate(() => { const s = document.querySelector('#lpRBest'); const o = [...s.options].find(o => o.value && o.value !== 'none'); return o ? o.value : 'none'; });
      await p.selectOption('#lpRBest', opt); await W(60);
      await p.fill('#lpRTaste', 'تقسیمِ سه‌تایی را دوست داشتم، شمردنِ همهٔ حالت‌ها را نه'); await W(60);
      await p.click('#main .lp-lbrest .lp-lbrest-save'); await W(200);
      const bb = await back(P);
      r.after = await p.evaluate(() => ({ card: !!document.querySelector('#main .lp-lbrest'), sum: (document.querySelector('#main .lp-lbsum') || {}).textContent || '' }));
      chk(!!bb && /سه‌تایی/.test(bb.taste || '') && (bb.bestQ || bb.bestNone), 'n1page: saving from the card fills solve.b[1].taste and bestQ ' + JSON.stringify(bb && { taste: bb.taste, bestQ: bb.bestQ }));
      chk(!r.after.card && /سلیقه‌ات/.test(r.after.sum), 'n1page: the card goes away once both are answered and the look-back summary shows «سلیقه‌ات» ' + JSON.stringify(r.after).slice(0, 300));
    }
  });

  // ================= n2 — N2: «🔭» به معنا (s20) =================
  await section('n2', async () => {
    const r = info.n2 = {}; r.stage = 'maryam';
    await newSess();
    const n0 = await p.evaluate(() => APP.liveAll().length);
    await next('پیش از پارامترها، یک قدم عقب: کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی؟');
    await say('۸ ماهه می‌خوام نشون بدم یه شبکه‌ی خاص با ۳ نوع نورون (E، I، PV) نوسان گاما تولید می‌کنه یا نه. شبیه‌سازی‌ها گاهی آره گاهی نه. استادم میگه «یه ایده بده». دیگه فکرم کار نمی‌کنه. ببین، g_EE رو ۰.۸ گذاشتم، τ_I رو ۸ میلی‌ثانیه، τ_PV ۳ میلی‌ثانیه.');
    const u = await lastUser();
    r.compact = /^# 🔭 مسئلهٔ حل‌نشدهٔ خودم/m.test(head(u)) && /live_new/.test(block(u, '# 🔭 مسئلهٔ حل‌نشدهٔ خودم'));
    r.full = /^# مسئلهٔ واقعیِ حل‌نشده/m.test(head(u));
    chk(r.compact, 'n2 (s20): the compact «🔭 مسئلهٔ حل‌نشدهٔ خودم» rule (what it is, when to offer live_new) is in the prompt ' + block(u, '# 🔭').slice(0, 300));
    chk(r.full, 'n2 (s20): «۸ ماهه … یا نه … فکرم کار نمی‌کنه» about her own research brings the full «🔭» block (round 16: 0 occurrences)');
    strict('n2 maryam', u);
    const n1 = await p.evaluate(() => APP.liveAll().length);
    chk(n1 === n0, 'n2 control: offering only — no live problem is created without live_new ' + n0 + '→' + n1);
    // خانوادهٔ گیرِ طولانی
    r.fam = [];
    for (const t of ['ماه‌هاست روی پایان‌نامه‌ام گیر کردم و جلو نمی‌رم.', 'یه پروژه دارم که گیر کردم روش.', 'سه ساله دارم روی این ایده کار می‌کنم، دیگه فکرم کار نمی‌کنه.']) {
      await newSess(); await say(t); const uu = await lastUser(); r.fam.push([t.slice(0, 20), /^# مسئلهٔ واقعیِ حل‌نشده/m.test(head(uu))]); strict('n2 fam', uu);
    }
    chk(r.fam.every(x => x[1]), 'n2: the stuck-duration / "my mind does not work" family brings the full «🔭» block ' + JSON.stringify(r.fam));
    // کنترل: سلام ⇒ قاعدهٔ کامل نه (قاعدهٔ کوتاه آری)
    await newSess(); await say('سلام'); const u0 = await lastUser();
    chk(!/^# مسئلهٔ واقعیِ حل‌نشده/m.test(head(u0)) && /^# 🔭 مسئلهٔ حل‌نشدهٔ خودم/m.test(head(u0)), 'n2 control: a greeting gets only the compact line, not the full block');
    // کنترل: سشنِ بسته به مسئلهٔ باز ⇒ نه قاعدهٔ کوتاه، نه live_new
    r.stage = 'bound';
    await newSess();
    await next('ثبت شد.', [{ do: 'live_new', title: 'گوجه در بالکن یا گلدان', statement: 'گوجه را در بالکنِ رو به شمال بکارم یا در گلدانِ داخلِ خانه؟', nat: 'practical' }]);
    await say('گوجه را در بالکنِ رو به شمال بکارم یا در گلدانِ داخلِ خانه؟ می‌خوام حلش کنم.');
    await go('home');
    await say('فونتِ صفحه ریز است.');
    const ub = await lastUser();
    chk(!/^# 🔭 مسئلهٔ حل‌نشدهٔ خودم/m.test(head(ub)) && !/do\\?":\\?"live_new/.test(head(ub)), 'n2 control: a session bound to an open problem gets neither the compact line nor the live_new form');
  });

  // ================= n3 — N3: chat_invent ِ تکراری ⇒ پیوند و حدس (s11) =================
  await section('n3', async () => {
    const r = info.n3 = {}; r.stage = 'invent';
    await newSess();
    const ST = 'کدام دو خانه را از صفحهٔ ۱۰×۱۰ برداریم که بتوان باقی را با دومینو پوشاند؟';
    await next('نگهش داشتم؛ سه روز دیگر برمی‌گردد.', [{ do: 'chat_invent', statement: ST, title: 'کدام دو خانه را برداریم', kind: 'find', nat: 'objective' }]);
    await say('یه مسئله‌ی تازه ساختم: ' + ST + ' نگهش دار برای بعد.');   /* دورِ ۲۰ (MT1): chat_invent فقط به خواستِ خودش */
    const Q = await pidOf(/کدام دو خانه را برداریم/); chk(!!Q, 'n3 setup: invented problem ' + Q);
    r.stage = 'day10-21';
    await p.evaluate(() => { window.__day = '2026-11-04'; });
    const sid = await newSess();
    await next('حدست «هر دو خانهٔ ناهم‌رنگ کافی است» هنوز حدس است: چطور می‌آزمایی‌اش — کدام حالتِ خاص می‌تواند ردش کند؟', [{ do: 'chat_invent', statement: ST, kind: 'find' }, { do: 'coach_state', guess: { text: 'هر دو خونه‌ای که رنگشون فرق داره کافیه' } }]);   // دورِ ۱۷ (RC1): حدس را مدل گزارش می‌دهد
    await say('سلام دوباره. چند روز پیش مسئله‌ی دومینو رو با رنگ‌آمیزی حل کردم و یه مسئله‌ی تازه ساختم: کدوم دو خونه رو بردارم که بشه پوشوند؟ فکر کنم هر دو خونه‌ای که رنگشون فرق داره کافیه. درسته؟');
    r.sess = await p.evaluate(sid => { const s = APP.S.get(sid) || APP.ASSIST.cur(); return { lprob: s.lprob || '', log: (s.lprobLog || []).map(e => e.p) }; }, sid);
    chk(r.sess.lprob === Q && r.sess.log.indexOf(Q) >= 0, 'n3 (s11): the duplicate chat_invent links the session to the existing problem (sessLink + lprobLog), round 16: no lprob/lprobLog ' + JSON.stringify(r.sess) + ' Q=' + Q);
    r.g = await p.evaluate(Q => { const so = (APP.S.get('eprog_' + Q) || {}).solve || {}; return JSON.parse(JSON.stringify((so.g && so.g[1]) || null)); }, Q);
    chk(!!r.g && /رنگشون فرق داره|ناهم‌رنگ|رنگ/.test(r.g.guess || '') && r.g.from === 'chat', 'n3 (s11): his guess is stored as a GUESS on that problem (solve.g[1]), not only as a restatement ' + JSON.stringify(r.g));
    r.qs = await p.evaluate(Q => APP.liveChatQItems(Q).map(x => x.t), Q);
    chk(r.qs.some(t => /چطور می‌آزمایی‌اش/.test(t)), 'n3 (s11): the guess-test question asked in that session is now among the problem\'s «کدام پرسش کمک کرد؟» items ' + JSON.stringify(r.qs).slice(0, 300));
    // هم‌خانواده (بازگفتِ فرزندِ همان پدر) هم پیوند می‌دهد
    r.stage = 'twin';
    await newSess();
    await next('ثبت شد.', [{ do: 'live_new', title: 'انبار ۵ در ۴', statement: 'در انباری ۵ در ۴ متر چند جعبهٔ یک‌متری جا می‌شود اگر راهرو هم بخواهیم؟', nat: 'practical' }]);
    await say('در انباری ۵ در ۴ متر چند جعبهٔ یک‌متری جا می‌شود اگر راهرو هم بخواهیم؟ می‌خوام حلش کنم.');
    const PA = await pidOf(/انبار ۵ در ۴/);
    await p.evaluate(PA => { const s = APP.ASSIST.cur(); APP.ASSIST._turnSession = s; APP.ASSIST.DO.chat_invent({ statement: 'اگر راهرو دو متر پهنا داشته باشد در انبار چند جعبه جا می‌شود؟', title: 'راهروی دومتری در انبار', from: PA, kind: 'find' }); APP.ASSIST._turnSession = null; }, PA);
    const C = await pidOf(/راهروی دومتری/);
    const sid2 = await newSess();
    await next('همین را ادامه بدهیم.', [{ do: 'chat_invent', statement: 'اگه راهرو دو متری باشه، تو انبار چند تا جعبه جا میشه؟ فکر کنم ۱۲ تا.', title: 'راهروی دومتری در انبار', from: PA, kind: 'find' }]);
    await say('برگشتم سرِ اون مسئله‌ی راهروی دومتری در انبار. فکر کنم ۱۲ تا جعبه جا میشه.');
    r.twin = await p.evaluate(([sid2, C]) => { const s = APP.S.get(sid2) || APP.ASSIST.cur(); return { lprob: s.lprob || '', log: (s.lprobLog || []).map(e => e.p), C }; }, [sid2, C]);
    chk(!!C && r.twin.log.indexOf(C) >= 0, 'n3: the restated-twin path also links the session to the existing problem ' + JSON.stringify(r.twin));
  });

  // ================= n4 — N4: ضمیرِ گفت‌وگو (s12) =================
  const crossword = async (shoma) => {
    await newSess();
    const R7 = shoma ? 'درسِ خوبی است و به قلمِ خودتان ثبتش کردم. این نوع خانه‌ها کدام بخشش را بیشتر دوست داشتید؟' : 'درسِ خوبی است و به قلمِ خودت ثبتش کردم. این نوع خانه‌ها کدام بخشش را بیشتر دوست داشتی؟';
    const rep = shoma ? ['جواب را نمی‌گویم، ولی کنارتان هستم. این نیم ساعت خودتان تا کجا رفتید و کجا ماندید؟', 'شرط را خودتان خیلی خوب دو تکه کردید: معنا و املا. حالا: آیا پیش‌تر خانه‌ای با همین نوع شرط دیده‌اید؟', 'آفرین، خودتان حلش کردید. یک وارسیِ کوتاه: هر هشت حرف دقیقاً یک بار در واژه‌تان آمده‌اند؟']
      : ['جواب را نمی‌گویم، ولی کنارت هستم. این نیم ساعت خودت تا کجا رفتی و کجا ماندی؟', 'شرط را خودت خیلی خوب دو تکه کردی: معنا و املا. حالا: آیا پیش‌تر خانه‌ای با همین نوع شرط دیده‌ای؟', 'آفرین، خودت حلش کردی. یک وارسیِ کوتاه: هر هشت حرف دقیقاً یک بار در واژه‌ات آمده‌اند؟'];
    await next(rep[0]);
    await say('جدول امروز: «از جلو و عقب یکی است، در دریا راه می‌رود» — ۵ حرفی. و یه افقی دیگه: حروف «ر ا ت س م ن ه ب» رو مرتب کن، یه کلمه ۸ حرفی. نیم ساعته موندم.' + (shoma ? ' شما که ماشینی، بگو.' : ''));
    await next(rep[1]);
    await say('آهان، دو تا شرطه: یکی معنا — یه چیزی که تو دریا راه میره، یکی املا — کلمه‌ی پنج حرفی که برعکسش هم همونه. هنوز پیدا نکردم.');
    await next(rep[2]);
    await say('خونه سوم از عمودی «ه» است. با هشت تا خونه و «ه» سوم... آهان! پیدا شد، با حرف تقاطع هم می‌خونه. خودم حلش کردم.');
    await next(R7, [{ do: 'chat_solved', title: 'جدول: پالیندروم دریایی و آناگرامِ ۸ حرفی', statement: 'جدول امروز: «از جلو و عقب یکی است، در دریا راه می‌رود» — ۵ حرفی. و یه افقی دیگه: حروف «ر ا ت س م ن ه ب» رو مرتب کن، یه کلمه ۸ حرفی.', kind: 'find',
      lesson: 'اول بفهمم شرط چند تکه‌ست، رو یه تکه تمرکز کنم و نامزدها رو با تکه‌ی دیگه بسنجم؛ تو آناگرام هم خونه‌های خالی بکشم و حرف تقاطع رو بذارم.', check: 'هر هشت تا حرف یه بار به کار رفت؛ حرف تقاطع هم می‌خونه.' }]);
    await say('آره، هر هشت تا یه بار. درسی که گرفتم: اول بفهمم شرط چند تکه‌ست، رو یه تکه تمرکز کنم و نامزدها رو با تکه‌ی دیگه بسنجم؛ تو آناگرام هم خونه‌های خالی بکشم و حرف تقاطع رو بذارم.');
    await p.evaluate(() => { window.__day = '2026-11-03'; });
    await newSess();
    await say('صبح بخیر. جدول امروز: «پایتخت کشوری که رودخانه‌ی دانوب از آن می‌گذرد» شش حرفی. اول مجهول: یه اسم شهر شش حرفی. بعد بخش‌های شرط: پایتخته، دانوب ازش رد میشه، شش حرفه. حرف دومش از عمودی «و» است.');
    const u = await lastUser(); await p.evaluate(() => { window.__day = '2026-11-02'; });
    return u;
  };
  await section('n4', async () => {
    const r = info.n4 = {}; r.stage = 'shoma';
    const u = await crossword(true);
    const tl = turnLines(u).filter(l => /مجهول و راه/.test(l));
    r.tl = tl.map(l => l.slice(0, 260));
    chk(tl.length === 1, 'n4 setup: the blind-recall question is the turn question at the start of day 2 ' + JSON.stringify(r.tl));
    chk(tl.some(l => /یادتان هست مجهول و راهتان/.test(l)) && !tl.some(l => /یادت هست|راهت(?![آ-ی])/.test(l)), 'n4 (s12): the recall question in the turn line is in the conversation\'s «شما» register («یادتان هست مجهول و راهتان …») ' + JSON.stringify(r.tl));
    r.sug = (head(u).match(/پیشنهادِ این نوبت: «([^»]*)»/) || [])[1] || '';
    chk(!r.sug || !/یادت هست/.test(r.sug), 'n4 (s12): the coach list\'s «پیشنهادِ این نوبت» is in the same register ' + r.sug);
    r.rule = head(u).split('\n').filter(l => /ضمیرِ گفت‌وگو \(شما\/تو\) را عوض نکن/.test(l));
    chk(r.rule.length >= 1 && r.rule.some(l => /شما/.test(l)), 'n4 (s12): a rule line «ضمیرِ گفت‌وگو (شما/تو) را عوض نکن» naming «شما» ' + JSON.stringify(r.rule).slice(0, 300));
    strict('n4 shoma', u);
    r.stage = 'to';
    const u2 = await crossword(false);
    const tl2 = turnLines(u2).filter(l => /مجهول و راه/.test(l));
    chk(tl2.some(l => /یادت هست مجهول و راهت/.test(l)) && !tl2.some(l => /یادتان|راهتان/.test(l)), 'n4 control: a «تو» conversation keeps «یادت هست مجهول و راهت …» ' + JSON.stringify(tl2.map(l => l.slice(0, 200))));
    strict('n4 to', u2);
  });

  // ================= n5 — N5: درخواستِ عقب‌افتاده (s14) =================
  await section('n5', async () => {
    const r = info.n5 = {}; r.stage = 'ask';
    await newSess();
    // دورِ ۱۷ (RC1): درخواستِ عقب‌افتاده را مدل گزارش می‌دهد (coach_state.defer)؛ الگوی «رد نمی‌کنم، ولی اول» دیگر ذخیره نمی‌کند
    await next('جزوه را رد نمی‌کنم، ولی اول ببینیم گیر کجاست. سرِ جلسه، دقیقهٔ اولی که مسئله را می‌خوانی، اول از خودت می‌پرسی «مجهول چیست؟» — یا کارِ دیگری می‌کنی؟', [{ do: 'coach_state', defer: { what: 'یه جزوه‌ی خلاصه بده که فقط فرمول‌ها و «کی کدوم» توش باشه' } }]);
    await say('آمار رو دو بار افتادم. همه‌ی فرمول‌ها رو حفظم، ولی سر جلسه نمی‌دونم کدومو کجا بزنم. یه جزوه‌ی خلاصه بده که فقط فرمول‌ها و «کی کدوم» توش باشه.');
    await next('یک مسئله ببینیم: احتمالِ این‌که یک بستهٔ تصادفی کمتر از ۹۶۰ گرم باشد چقدر است؟');
    await say('دقیقه‌ی اول؟ عددها رو از صورت سؤال برمی‌دارم و دنبال فرمولی می‌گردم که اون عددها رو داشته باشه.');
    const u = await lastUser();
    const pl = head(u).split('\n').filter(l => /جزوه/.test(l) && /promise_done/.test(l));
    chk(pl.length === 1 && /^- زمینه \(نه پرسشِ دوم\)/.test(pl[0]), 'n5 (s14): the deferred cheat-sheet request is kept as a context line in later turns (with promise_done) ' + JSON.stringify(head(u).split('\n').filter(l => /جزوه/.test(l))).slice(0, 400));
    strict('n5 kept', u);
    r.stage = 'later';
    await next('باشه.');
    await say('خب: t = (960-988)/(20/√25) = -28/4 = -7. بعد احتمال تقریباً ۱.۳ شد.');
    const ul = await lastUser();
    chk(head(ul).split('\n').some(l => /جزوه/.test(l) && /promise_done/.test(l)), 'n5: the promise line stays while not honoured');
    r.stage = 'done';
    await p.evaluate(() => { const s = APP.ASSIST.cur(); const r0 = (s.promises || []).filter(x => !x.done); window.__pr = r0.map(x => x.id); });
    const prId = await p.evaluate(() => (window.__pr || [])[0] || '');
    await next('این هم جزوهٔ «کی کدوم»: …', [{ do: 'promise_done', id: prId }]);
    await say('حالا جزوه رو بده.');
    await next('باشه.');
    await say('ممنون، بریم سراغِ مسئلهٔ بعد: احتمال این‌که میانگین ۳۶ نفر بیشتر از ۱۵.۵ باشه.');
    const ud = await lastUser();
    chk(!!prId && !head(ud).split('\n').some(l => /promise_done/.test(l) && /جزوه/.test(l)), 'n5: once honoured (promise_done) the line goes away ' + prId);
    // ردِ کاربر
    r.stage = 'decline';
    await newSess();
    await next('جزوه را رد نمی‌کنم، ولی اول ببینیم گیر کجاست. دقیقهٔ اول چه می‌کنی؟', [{ do: 'coach_state', defer: { what: 'یه جزوه‌ی خلاصه‌ی فرمول‌ها بده' } }]);
    await say('یه جزوه‌ی خلاصه‌ی فرمول‌ها بده.');
    await next('باشه.');
    await say('نه، دیگه جزوه نمی‌خوام؛ خودم می‌نویسمش.');
    await next('باشه.');
    await say('خب مسئله رو بگو.');
    const ux = await lastUser();
    chk(!head(ux).split('\n').some(l => /promise_done/.test(l) && /جزوه/.test(l)), 'n5: declined by the user ⇒ the promise line goes away');
  });

  // ================= n6 — N6: پیگیریِ برنامهٔ خودش (s15) =================
  await section('n6', async () => {
    const r = info.n6 = {}; r.stage = 'plan';
    await newSess();
    const dl0 = await p.evaluate(() => APP.S.all('deadline').length);
    await next('خوب است — یک مسئله در هفته. کدام مسئلهٔ هفتهٔ بعد برای این کار مناسب‌تر است؟');
    await say('شاگردام سر مسئله‌ها ساکت می‌مونن. از این هفته هر سه‌شنبه سرِ کلاس با پرسشِ کلی «چی رو می‌خوایم پیدا کنیم؟» شروع می‌کنم و امتحان می‌کنم.');
    const u = await lastUser();
    const fl = head(u).split('\n').filter(l => /"deadline"|\\"deadline\\"/.test(l) && /2026-11-03/.test(l));
    chk(fl.length === 1 && /^- زمینه \(نه پرسشِ دوم\)/.test(fl[0]), 'n6 (s15): her own recurring plan brings a context line offering a follow-up with the existing deadline action on the next Tuesday (2026-11-03) ' + JSON.stringify(head(u).split('\n').filter(l => /پیگیری/.test(l))).slice(0, 400));
    strict('n6 plan', u);
    const dl1 = await p.evaluate(() => APP.S.all('deadline').length);
    chk(dl1 === dl0, 'n6 control: offer only — no follow-up is created without the action');
    r.stage = 'yes';
    await next('ثبت شد؛ سه‌شنبه در «امروز» می‌آید.', [{ do: 'deadline', what: 'پیگیری: آزمایشِ پرسشِ کلی سرِ کلاس', date: '2026-11-03' }]);
    await say('آره، یادم بنداز.');
    r.today = await p.evaluate(() => (APP.dueList() || []).map(x => x.txt + ' ' + (x.sub || '')));
    chk(r.today.some(t => /پیگیری: آزمایشِ پرسشِ کلی/.test(t)), 'n6: «امروز» shows the follow-up ' + JSON.stringify(r.today).slice(0, 300));
    // کنترل: گزارشِ گذشته، نه برنامه
    await newSess(); await say('آمار رو دو بار افتادم.'); const u0 = await lastUser();
    chk(!head(u0).split('\n').some(l => /پیگیریِ برنامهٔ خودش|"deadline"/.test(l) && /پیگیری/.test(l)), 'n6 control: no follow-up offer without a plan of her own');
  });

  // ================= strict — یک پرسش در هر بلوک، همهٔ پرامپت‌ها =================
  await section('strict', async () => {
    const all = await p.evaluate(() => __all.slice());
    let n = 0; all.forEach((u, i) => { if (!/# نوبتِ تازه/.test(u)) return; n++; const bad = strictScan(u); if (bad.length) strictAll.push(['all#' + i, bad]); });
    const badAll = strictAll.filter(x => x[1].length);
    if (process.env.DUMP) badAll.forEach(x => console.log('## ' + x[0] + '\n  ' + x[1].join('\n  ')));
    chk(!badAll.length, 'strict: no line outside the turn line carries «بپرس» or an unmarked «؟» ending (' + badAll.length + ' prompt(s)): ' + JSON.stringify(badAll.slice(0, 3)).slice(0, 700));
  });

  await b.close();
  if (process.env.DEBUG) console.log(JSON.stringify(info, null, 1).slice(0, 6000));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; }
  else console.log('test_tour1_r16_coach: NO ERRORS');
})();
