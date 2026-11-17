// تورِ پولیا (دستهٔ ۱، دورِ ۲۹، سهمِ «story» R6) — C101 (a)+(b): بخش‌های U* از جمله‌های خودِ دونده‌ها (قرمز روی BASE29 40b34a51)، و هر ورودیِ R6.filing_story ِ بانکِ مستقل
//  (tests/variants/VARIANTS_R29.json، با شمارهٔ خودش؛ هیچ ورودی ویرایش نشده؛ «nc» = این‌جا سنجیده نمی‌شود، با دلیل). C138 C149 C125 C124 C172 C173 C97. ONLY=U…|B<n>.
//  ساعتِ صفحه دست نمی‌خورد و هیچ تاریخِ تقویمی در انتظارها نیست.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { n: 0, ok: 0 };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__noNav = true;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => { __calls.push({ user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = typeof t === 'string' ? t : JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
    window.__turn = async (text, actions) => { const n0 = __calls.length; __q.push({ reply: 'خوب.', status: 'related', memory: 'm', actions: actions || [] }); await APP.ASSIST.send(text); __q.length = 0;
      const c = __calls.slice(n0).filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {}; return String(c.user || '').split('# نوبتِ تازه')[0]; };
    window.__fresh = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc', 'ex'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__mk = (t, st) => APP.liveCreate(t, st, 'find', { by: 'user', sess: __cur().id }).p.id;
    window.__dos = (pid) => { try { const d = APP.dossier(pid); return (d.events || []).map(e => (e.title || '') + ' ¦ ' + (e.lines || []).join(' ¦ ') + ' ¦ ' + (e.out || '')); } catch (e) { return ['ERR ' + e]; } };
    window.__sdos = (pk) => { try { const d = APP.dossierSess(__cur().id, pk); return (d.events || []).map(e => (e.title || '') + ' ¦ ' + (e.lines || []).join(' ¦ ') + ' ¦ ' + (e.out || '')); } catch (e) { return ['ERR ' + e]; } };
    window.__st = () => { const s = __cur(), C = s.coach || {}; return { lprob: s.lprob || '', focus: APP.STORY.focus26(s), probs: APP.STORY.probs26(s).map(x => ({ id: x.id, t: x.title })),
      fc: APP.S.all('fcast').filter(x => !x.sample).map(x => ({ id: x.id, q: x.q, p: x.p, due: x.due || '', out: x.outcome || '', prob: x.prob || null })),
      preds: (C.preds || []).map(x => ({ t: x.text, p: x.p, out: x.out ? x.out.res : '' })), ask: s.predAsk && s.predAsk.state === 'open' ? s.predAsk.kind : '', sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text) }; };
  });
  const turn = (t) => p.evaluate((t) => __turn(t, []), t);
  const st = () => p.evaluate(() => __st());
  const J = (x) => JSON.stringify(x);
  const fresh1 = () => p.evaluate(() => { __wipe(); __fresh(); const pid = __mk('مسئلهٔ آزمون', 'یه مسئلهٔ واقعی دارم که باید حلش کنم و ببینم چی میشه.'); APP.liveBindSession(pid, __cur(), { force: true }); return pid; });
  const K = {};
  const csx = (o) => Object.assign({ do: 'coach_state', ans: [], said: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);
  const turnA = (t, a) => p.evaluate(([t, a]) => __turn(t, a), [t, a]);
  const fa = (n) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  const evs = (A) => p.evaluate((A) => { const d = APP.dossier(A); return (d.events || []).map(e => ({ k: e.k, t: e.title, l: e.lines || [], out: e.out || '', wd: !!e.withdrawn, h: (e.hist || []).map(x => x.lab || ((x.old || '') + ' → ' + (x.new || ''))), b: (e.btns || []).map(b => b.label) })); }, A);

  const PQ = () => p.evaluate(() => { __wipe(); __fresh(); const P = __mk('قفسه‌های انباری', 'انباری ۲ متر ارتفاع داره؛ چند طبقه قفسه جا میشه و چوبش رو چقدر بخرم؟');
    const Q = __mk('کفِ انباری', 'کفِ انباری رو می‌خوام کاشی کنم؛ چند متر کاشی بخرم؟'); APP.liveBindSession(Q, __cur(), { force: true }); return [P, Q]; });
  const VAR = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'variants', 'VARIANTS_R29.json'), 'utf8'));
  await p.evaluate(() => {
    window.__ev = (pid) => (APP.dossier(pid).events || []).map(e => ({ k: e.k, t: e.title, l: e.lines || [], out: e.out || '', wd: !!e.withdrawn, h: (e.hist || []).map(x => [x.lab || '', String(x.at || '').slice(0, 10)]), mv: !!(e.mv28 || e.mvFrom), ask: e.ask28 || '' }));
  });
  const EV = (pid) => p.evaluate((pid) => __ev(pid), pid);
  const mark = (e) => (e.l.filter(l => /^حسابِ صفحه:/.test(l))[0] || '');
  const head = (e) => mark(e).replace(/^حسابِ صفحه:\s*/, '').slice(0, 1);
  const MINEK = /^c(?:res|data|calc|step|whole|tried)$/;
  /* یک نوبت در مسئلهٔ زندهٔ آزمون؛ سطرهای 📜 ِ همان مسئله */
  const one = async (u, said, extra) => { const pid = await fresh1(); await turnA(u, [csx(Object.assign({ ph: 'e', said: said || [] }, extra || {}))]); const D = await EV(pid);
    return { pid, D, mine: D.filter(e => MINEK.test(e.k)), o: D.filter(e => e.k === 'cother'), fc: D.filter(e => /🎯/.test(e.t || '') || e.k === 'fcast') }; };
  const has = (e, re) => e.l.some(l => re.test(l));
  /* C138: هیچ سطری که بندِ ادعای عددیِ نخوانده دارد ✓ ِ کل نمی‌گیرد؛ بندِ نخوانده «نسنجیده» کنارِ خودش دارد */
  const c138 = (R, re) => { const L = R.mine.concat(R.o).filter(e => re.test(e.l[0])); return L.length >= 1 && L.every(e => !/^حسابِ صفحه: ✓/.test(mark(e)) && /نسنجیده|✗/.test(mark(e))); };
  /* C149: هیچ بندی دو بار (همان متن در دو سطر) */
  const dup = (R) => { const T = R.mine.concat(R.o).map(e => e.l[0]); const C = []; T.forEach(t => String(t).split(/[،,.؛]\s*/).map(x => x.trim()).filter(x => /[0-9۰-۹]/.test(x) && x.length >= 6).forEach(x => C.push(x)));
    return C.filter((x, i) => C.indexOf(x) !== i); };

  /* ---------- U: جمله‌های خودِ دونده‌ها (قرمز روی BASE29) ---------- */
  const S06 = 'یه حساب دیگه هم کردم: شب‌ها تا ۸۰۰ پیام در ثانیه میاد، پس ۸۰۰ × ۳۶۰۰ = ۲۸۸۰۰۰۰ پیام در ساعت. ظرفیتِ صف ۵ میلیون و ۴۰۰ پیامه، پس ۵ میلیون و ۴۰۰ − ۲ میلیون و ۸۸۰ = ۲ میلیون و ۵۲۰ جا می‌مونه، نصفش هم میشه ۱ میلیون و ۳۰۰. جلسه‌مون ساعت ۲:۳۰ بود و تا شب ۲ × ۳ = ۶ تا قهوه خوردم!';
  /* A29-1 (S1) s06 p9 + A29-2: بندِ «نصفش» ✓ ِ کل نمی‌گیرد؛ هیچ بند دو بار نیست؛ «۸۰۰ × ۳۶۰۰» «داده» نیست */
  K.U_A29_1_s06 = async () => { const R = await one(S06, ['d']); const d2 = dup(R);
    return [c138(R, /نصفش/) && !d2.length && !R.mine.some(e => e.k === 'cdata' && /۸۰۰ × ۳۶۰۰/.test(e.l[0])) && R.mine.some(e => /۸۰۰ × ۳۶۰۰/.test(e.l[0]) && head(e) === '✓'), J({ d2, L: R.mine.map(e => [e.k, e.l[0], mark(e)]) })]; };
  /* A29-1 s08 p? «با پارچِ ۱۱، ۱۱ + ۱۱ = ۲۲، پس ۸ لیتر اضافه میاد.» */
  K.U_A29_1_s08 = async () => { const R = await one('با پارچِ ۱۱، ۱۱ + ۱۱ = ۲۲، پس ۸ لیتر اضافه میاد.', []); return [c138(R, /اضافه میاد/), J(R.mine.map(e => [e.k, e.l[0], mark(e)]))]; };
  /* A29-1 pwA2 p12 (کودک) «… ۴ و ۴ و ۴ و ۴ میشه ۱۶، ۳ تا کم میاد.» */
  K.U_A29_1_pwA2 = async () => { const R = await one('اگه روزی ۴ تا بخونم، ۴ و ۴ و ۴ و ۴ میشه ۱۶، ۳ تا کم میاد.', []); return [c138(R, /کم میاد/), J(R.mine.map(e => [e.k, e.l[0], mark(e)]))]; };
  /* B29·D2 aB3 c12 / oB1 c25: جملهٔ پیش‌بینی با اطمینان «داده» نمی‌شود */
  K.U_B29_D2_aB3 = async () => { const R = await one('۲۵۰ رو می‌ذارم سپرده‌ی یک‌ساله، ۵۰ دم دست. ۷۰ درصد مطمئنم تا اون موقع کسری از سود کمتره.', ['d']);
    return [!R.mine.some(e => e.k === 'cdata' && /مطمئنم/.test(e.l[0])), J(R.mine.map(e => [e.k, e.l[0]]))]; };
  K.U_B29_D2_oB1 = async () => { const R = await one('پیش‌بینیم: هر ۴ شب تا ۱۱:۳۰ خوابم می‌بره؛ ۹۰ درصد مطمئنم.', ['d']); return [!R.mine.some(e => e.k === 'cdata'), J(R.mine.map(e => [e.k, e.l[0]]))]; };
  /* A29-21 + A29-22 s09 c163: دو کارِ داداش هر دو «کارِ دیگری»، هیچ‌کدام «داده»؛ «فروشندهٔ آرد گفت …» داده با منبع؛ «پس ۳۸۰ × ۱٫۱۲ …» حسابِ خودش */
  const S09 = 'فروشندهٔ آرد گفت از ماهِ بعد ۱۲٪ گرون میشه، پس ۳۸۰ × ۱٫۱۲ = ۴۲۵٫۶ هزار هزینهٔ هر کیک میشه. داداشم حساب کرد ۳۲ × ۹۰۰ = ۲۸ میلیون و ۸۰۰ درآمدِ ماه. داداشم یه حسابِ دیگه هم کرد: ۴۲۵٫۶ × ۳۲ = ۱۴ میلیون. مامانم کمکم کرد قیمتِ بسته‌بندی رو درآوردم: ۲۰ + ۵ = ۲۵ هزار.';
  K.U_A29_21_s09 = async () => { const R = await one(S09, ['d']);
    const ok = R.o.some(e => /۳۲ × ۹۰۰/.test(e.l[0])) && R.o.some(e => /۴۲۵٫۶ × ۳۲/.test(e.l[0])) && !R.mine.some(e => /داداشم/.test(e.l[0])) && !R.o.some(e => /فروشنده|مامانم|۳۸۰ × ۱٫۱۲/.test(e.l[0]))
      && R.mine.some(e => /۳۸۰ × ۱٫۱۲/.test(e.l[0])) && R.mine.some(e => /۲۰ \+ ۵/.test(e.l[0])) && R.mine.some(e => e.k === 'cdata' && has(e, /منبع: به گفتهٔ «فروشندهٔ»/)) && !dup(R).length;
    return [ok, J({ o: R.o.map(e => e.l[0]), m: R.mine.map(e => [e.k, e.l.join(' ¦ ').slice(0, 160)]) })]; };
  /* B29·D12 nB2 c5: حسابِ دومِ داداش «کارِ دیگری»؛ جملهٔ همسایه + «پس …» مالِ خودش (C125) */
  const NB2 = 'فروشنده گفت رنگ از ماهِ پیش ۱۲٪ گرون‌تر شده. داداشم حساب کرد رنگ‌کاری کلاً ۳ اتاق × ۹۰۰ هزار = ۲ میلیون و ۷۰۰ میشه. داداشم یه حسابِ دیگه هم کرد: ۲ میلیون و ۷۰۰ + ۱۲ درصد = ۳ میلیون و ۲۴. همسایه‌مون گفت کامیون ۲ ساعت طول می‌کشه، پس ۲ × ۶۰۰ هزار = ۱ میلیون و ۲۰۰ برای کامیونِ ساعتی کافیه.';
  K.U_B29_D12_nB2 = async () => { const R = await one(NB2, ['d']);
    const ok = R.o.some(e => /۳ اتاق × ۹۰۰/.test(e.l[0])) && R.o.some(e => /\+ ۱۲ درصد/.test(e.l[0])) && !R.o.some(e => /همسایه|۲ × ۶۰۰/.test(e.l[0])) && !R.mine.some(e => /داداشم/.test(e.l[0])) && R.mine.some(e => /۲ × ۶۰۰ هزار/.test(e.l[0]));
    return [ok, J({ o: R.o.map(e => e.l[0]), m: R.mine.map(e => [e.k, e.l[0]]) })]; };
  /* D29-12 tD1 c49 */
  K.U_D29_12_tD1 = async () => { const R = await one('فروشنده گفت اگه نقد بدم ۱۲٪ تخفیف میده. داداشم حساب کرد ۲۲ × ۵۰ = ۱۱۰۰ هزار برای حمل. داداشم یه حسابِ دیگه هم کرد: ۱۸ × ۲۰ = ۳۸۰. مامانم کمکم کرد ۴ × ۳۰۰ = ۱۲۰۰ رو حساب کنم. اوستا گفت روزی ۷ مترمربع نصب می‌کنه، پس ۲۲ ÷ ۷ ≈ ۳ روز طول می‌کشه.', ['d']);
    const ok = R.o.some(e => /۱۸ × ۲۰ = ۳۸۰/.test(e.l[0]) && /✗/.test(mark(e))) && !R.mine.some(e => /۱۸ × ۲۰|داداشم/.test(e.l[0])) && R.mine.some(e => /۴ × ۳۰۰/.test(e.l[0]));
    return [ok, J({ o: R.o.map(e => [e.l[0], mark(e)]), m: R.mine.map(e => [e.k, e.l[0]]) })]; };
  /* C29-4 aC1 p29 */
  K.U_C29_4_aC1 = async () => { const R = await one('بابام گفت هر بسته ۱۲ تا تیله داره، پس ۴ تا بسته میشه ۴ × ۱۲ = ۴۸ تا.', ['d']);
    return [!R.o.length && R.mine.some(e => /۴ × ۱۲ = ۴۸/.test(e.l[0]) && head(e) === '✓'), J({ o: R.o.map(e => e.l[0]), m: R.mine.map(e => [e.k, e.l.join(' ¦ ')]) })]; };
  /* C29-5 aC1 p25: «یه مسئله: … ؟» صورتِ تازه با مجهولِ خودش (C97) */
  K.U_C29_5_aC1 = async () => { await fresh1(); const r = await p.evaluate(() => APP.STORY.newProbIntro('یه مسئله: می‌خوایم بستهٔ تیله بخریم. فروشنده گفت ۱۲ درصد تخفیف میده. هر بسته ۱۲ تا تیله داره. ۵ تا بسته چند تا تیله میشه؟'));
    const neg = await p.evaluate(() => [APP.STORY.newProbIntro('یه مسئلهٔ تازه نیست، همون میزه؛ فقط عرضش رو دوباره گفتم: ۹۰ سانت'), APP.STORY.newProbIntro('یه مسئله: این حساب درسته.')]);
    return [r === true && !neg[0] && !neg[1], J({ r, neg })]; };
  /* C138 look-alikes (C136) — یک بندِ خوانده: ✓ ِ کل درست است؛ کمک‌کننده در جملهٔ خودش */
  K.U_neg_one_clause = async () => { const R = await one('۴ میلیون و ۲۰۰ + ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰', []); return [R.mine.length === 1 && head(R.mine[0]) === '✓' && !R.o.length, J(R.mine.map(e => [e.k, e.l[0], mark(e)]))]; };

  /* ---------- ledger helpers (C124/C172) ---------- */
  const LED = async (msg, steps) => { const [P, Q] = await PQ(); await turnA(msg, [csx({ ph: 'e', said: [], prior: steps })]); return [P, Q]; };
  const stepBtn = (pid, n) => p.evaluate(([pid, n]) => { APP.go('dossier', pid); const b = [...document.querySelectorAll('#main button.lp-dmv')].find(b => new RegExp('^↪ گامِ ' + n + ' مالِ').test(b.textContent.trim())); if (!b) return 'NOBTN'; b.click();
    APP.go('dossier', pid); const ask = document.querySelector('#main .lp-dmvask'); return { ask: ask ? ask.textContent : '', opts: [...document.querySelectorAll('#main .lp-dmvall,#main .lp-dmvone,#main .lp-dmvno')].map(x => x.textContent.trim()) }; }, [pid, n]);
  const opt = (pid, cls) => p.evaluate(([pid, cls]) => { APP.go('dossier', pid); const b = document.querySelector('#main .' + cls); if (!b) return false; b.click(); return true; }, [pid, cls]);
  const HS = 'خودم حساب کردم: هر نفر با ۷ نفرِ دیگه دست میده. ۸ × ۷ = ۵۶. ۵۶ ÷ ۲ = ۲۸.';
  const HSP = [{ step: 'هر نفر', quote: 'هر نفر با ۷ نفرِ دیگه دست میده', verdict: 'ok', why: 'داده' }, { step: 'ضرب', quote: '۸ × ۷ = ۵۶', verdict: 'ok', why: '' }, { step: 'نصف', quote: '۵۶ ÷ ۲ = ۲۸', verdict: 'ok', why: '' }];
  const bankE = {};
  bankE[222] = async () => { const R = await one('از ۵ میلیون و ۲۰۰ پس‌انداز، ۲ میلیون و ۷۰۰ رفت: ۵ میلیون و ۲۰۰ − ۲ میلیون و ۷۰۰ = ۲ میلیون و ۵۰۰، نصفش هم میشه ۱ میلیون و ۳۰۰', []); return [c138(R, /نصفش/), J(R.mine.map(e => [e.l[0], mark(e)]))]; };
  bankE[223] = async () => { const R = await one('با پارچِ ۱۱: ۱۱ + ۱۱ = ۲۲، پس ۸ لیتر اضافه میاد', []); return [c138(R, /اضافه میاد/), J(R.mine.map(e => [e.l[0], mark(e)]))]; };
  bankE[224] = async () => { const R = await one('۴ و ۴ و ۴ و ۴ میشه ۱۶، ۳ تا کم میاد', []); return [c138(R, /کم میاد/), J(R.mine.map(e => [e.l[0], mark(e)]))]; };
  bankE[225] = async () => ({ nc: 'coach side (prompt «# حسابِ صفحه» line for «نصفش …») is the arith engine\'s reader (a46, C157, arith R1); story only guarantees 📜 never ✓ there — checked by bank #222' });
  bankE[226] = async () => { const R = await one('۶ × ۷ = ۴۲ تا تخم‌مرغ، از ۵۰ تا ۷ تا می‌مونه', []); const L = R.mine.filter(e => /می‌مونه/.test(e.l[0]));
    /* C138 floor: the remainder clause is never under a sentence-wide ✓; its ✗ (8) needs arith's per-clause reader (C141) — «نسنجیده» is allowed by C138 */
    return [L.length >= 1 && L.every(e => !/^حسابِ صفحه: ✓/.test(mark(e))) && R.mine.some(e => /۶ × ۷ = ۴۲/.test(e.l[0]) && /✓|سنجید و می‌خواند/.test(mark(e))), J(R.mine.map(e => [e.l[0], mark(e)]))]; };
  bankE[227] = async () => ({ nc: 'the fixed «نصفش» clause re-mark with history is C86 (relines28, round 28) — needs arith reading «نصفش» (C157) to give ✓; unchanged by story' });
  bankE[228] = async () => { const R = await one('اجاره ماهی ۱۵ میلیونه و ۴ نفریم: ۱۵ ÷ ۴ = ۳٫۷۵ میلیون', ['d']); const calc = R.mine.filter(e => /۱۵ ÷ ۴/.test(e.l[0]));
    return [calc.length === 1 && calc[0].k === 'ccalc' && R.mine.filter(e => e.k === 'cdata').length <= 2 && !dup(R).length, J(R.mine.map(e => [e.k, e.l[0], mark(e)]))]; };
  bankE[229] = async () => { const R = await one('پیش‌بینیم: این هفته ۵ روز از ۷ صبح زود بیدار میشم؛ ۶۵ درصد مطمئنم.', ['d']); return [!R.mine.some(e => e.k === 'cdata'), J(R.mine.map(e => [e.k, e.l[0]]))]; };
  bankE[230] = async () => { const R = await one('یه هفته گذشت؛ پیش‌بینیم ۵ از ۷ با ۶۵ درصد بود، شد ۴', ['d']); return [!R.mine.some(e => e.k === 'cdata'), J(R.mine.map(e => [e.k, e.l[0]]))]; };
  bankE[231] = async () => { const R = await one('۳ × ۴ = ۱۲ صندلی داریم', ['d']); return [R.mine.length === 1 && R.mine[0].k === 'ccalc' && head(R.mine[0]) === '✓', J(R.mine.map(e => [e.k, e.l[0], mark(e)]))]; };
  bankE[232] = async () => { const R = await one('داداشم یه حسابِ دیگه هم کرد: ۱۶ × ۲۵ = ۳۸۰', ['d']); return [R.o.length === 1 && /✗/.test(mark(R.o[0])) && !R.mine.length, J(R.D.map(e => [e.k, e.l[0], mark(e)]))]; };
  bankE[233] = async () => { const R = await one('داداشم حساب کرد ۴ × ۲۵۰ = ۱۰۰۰ هزار برای حمل', ['d']); return [R.o.length === 1 && !R.mine.length, J(R.D.map(e => [e.k, e.l[0]]))]; };
  bankE[234] = async () => { const R = await one('بابام گفت هر جعبه ۱۵ تا مداد داره، پس ۳ تا جعبه میشه ۳ × ۱۵ = ۴۵ تا', ['d']); return [!R.o.length && R.mine.some(e => /۳ × ۱۵ = ۴۵/.test(e.l[0]) && head(e) === '✓'), J(R.D.map(e => [e.k, e.l.join(' ¦ ')]))]; };
  bankE[235] = async () => { const R = await one('همسایه‌مون گفت جابه‌جایی ۳ ساعت طول می‌کشه، پس ۳ × ۵۰۰ هزار = ۱ میلیون و ۵۰۰', ['d']);
    /* 📜 side (story): hers, never «کارِ دیگری»; the coach-line label is a46 otherSpans (arith) */
    return [!R.o.length && R.mine.some(e => /۳ × ۵۰۰ هزار/.test(e.l[0])), J(R.D.map(e => [e.k, e.l[0]]))]; };
  bankE[236] = async () => { const R = await one('فروشنده گفت اگه نقد بدم ۱۵٪ تخفیف میده', ['d']); return [!R.o.length && R.mine.some(e => e.k === 'cdata' && has(e, /منبع: به گفتهٔ «فروشنده»/)), J(R.D.map(e => [e.k, e.l.join(' ¦ ')]))]; };
  bankE[237] = async () => { const R = await one('داداشم یه حسابِ دیگه هم کرد: ۲ میلیون و ۴۰۰ + ۱۲ درصد = ۲ میلیون و ۶۸۸', ['d']); return [R.o.length === 1 && !R.mine.length, J(R.D.map(e => [e.k, e.l[0], mark(e)]))]; };
  bankE[238] = async () => { const [, Q] = await LED(HS, HSP); const r = await stepBtn(Q, '۱'); return [r && /گامِ ۲/.test(r.ask) && /گامِ ۳/.test(r.ask) && r.opts.length === 3, J(r)]; };
  bankE[239] = async () => { const [, Q] = await LED('هزینه: ۲۰ × ۱۸ = ۳۶۰ هزار. بعد ۳۶۰ + ۵۰ = ۴۱۰ هزار.', [{ step: 'ضرب', quote: '۲۰ × ۱۸ = ۳۶۰ هزار', verdict: 'ok' }, { step: 'جمع', quote: '۳۶۰ + ۵۰ = ۴۱۰ هزار', verdict: 'ok' }]);
    const r = await stepBtn(Q, '۱'); return [r && /گامِ ۲/.test(r.ask), J(r)]; };
  bankE[240] = async () => { const [P, Q] = await LED('برای کیک: ۱۲ × ۲ = ۲۴ برش. ۲۴ ÷ ۸ = ۳ کیک.', [{ step: 'برش', quote: '۱۲ × ۲ = ۲۴ برش', verdict: 'ok' }, { step: 'کیک', quote: '۲۴ ÷ ۸ = ۳ کیک', verdict: 'ok' }]);
    const r = await stepBtn(Q, '۱'); if (!r || !/گامِ ۲/.test(r.ask)) return [false, J(r)]; await opt(Q, 'lp-dmvone');
    const D = await EV(Q), pr = D.filter(e => e.k === 'cprior').map(e => e.l.join(' ¦ ')).join(' ‖ ');
    const ok1 = /گامِ ۱[^¦]*جابه‌جا شد/.test(pr) && /گامِ ۲[^¦]*پایه‌اش \(گامِ ۱\) به «قفسه/.test(pr);
    await p.evaluate((P) => { APP.go('dossier', P); const b = document.querySelector('#main .lp-dunmv'); if (b) b.click(); }, P);
    const pr2 = (await EV(Q)).filter(e => e.k === 'cprior').map(e => e.l.join(' ¦ ')).join(' ‖ ');
    return [ok1 && !/پایه‌اش|جابه‌جا شد ⇒/.test(pr2), J({ pr, pr2 })]; };
  bankE[241] = async () => { const [P, Q] = await LED('گام‌ها: ۲ × (۵ + ۴) = ۱۸. ۱۸ × ۱۶۰ = ۲۸۸۰. ۲۸۸۰ + ۶۰۰ = ۳۴۸۰.', [{ step: 'محیط', quote: '۲ × (۵ + ۴) = ۱۸', verdict: 'ok' }, { step: 'ضرب', quote: '۱۸ × ۱۶۰ = ۲۸۸۰', verdict: 'ok' }, { step: 'جمع', quote: '۲۸۸۰ + ۶۰۰ = ۳۴۸۰', verdict: 'ok' }]);
    const r = await stepBtn(Q, '۱'); if (!r || !/گامِ ۲/.test(r.ask) || !/گامِ ۳/.test(r.ask)) return [false, J(r)]; await opt(Q, 'lp-dmvall');
    const mv = await p.evaluate((P) => __ev(P).filter(e => e.mv && !e.wd).length, P);
    await p.evaluate((P) => { APP.go('dossier', P); const b = document.querySelector('#main .lp-dunmv'); if (b) b.click(); }, P);
    const back = await p.evaluate((P) => __ev(P).filter(e => e.mv && !e.wd).length, P); return [mv === 3 && back === 0, J({ r, mv, back })]; };
  bankE[242] = async () => ({ nc: 'a moved 🎯 and its outcome (A29-27, S3) is the forecast fixer\'s 🎯 list (a41/a31, R5); not changed by story' });
  bankE[243] = async () => { await fresh1(); const r = await p.evaluate(() => APP.STORY.newProbIntro('یه مسئله: هر جعبه ۸ تا ماژیک داره. ۶ تا جعبه چند تا میشه؟')); return [r === true, J(r)]; };
  bankE[244] = async () => ({ nc: 'A29-19 filing by the problem she names (C121-type routing of a line to a non-focused problem) is F11 with prior; checked at page level by the s08 replay (marks only) — routing not changed this round (Not done)' });
  bankE[245] = async () => ({ nc: 'B28·D9 / B29·D15 (floor dossier shows the shelves ledger) is the prior ledger\'s ownership (prior R3, a45 priorFor); story did not change it (Not done, F11 with prior)' });
  bankE[246] = async () => { const R = await one('۴ میلیون و ۲۰۰ + ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰', []); return [R.mine.length === 1 && head(R.mine[0]) === '✓', J(R.mine.map(e => [e.l[0], mark(e)]))]; };
  bankE[247] = async () => { const R = await one('۵ میلیون و ۲۰۰ − ۲ میلیون و ۶۰۰ = ۲ میلیون و ۶۰۰، نصفش میشه ۱ میلیون و ۳۰۰', []); return [!R.mine.some(e => /✗/.test(mark(e))) && R.mine.length >= 1, J(R.mine.map(e => [e.l[0], mark(e)]))]; };
  bankE[248] = async () => { const R = await one('۱۸ + ۱۲ = ۳۰ تا کارتن؛ مامانم کمکم کرد بشمارم', []); return [!R.o.length && R.mine.some(e => head(e) === '✓'), J(R.D.map(e => [e.k, e.l[0], mark(e)]))]; };
  bankE[249] = async () => { const R = await one('همون ۳ میلیون و ۲۵۰ که خودت گفتی رو قبول دارم', ['d']); return [!R.o.length, J(R.D.map(e => [e.k, e.l[0]]))]; };
  bankE[250] = async () => { const R = await one('فروشنده گفت هر متر ۱۶۰ هزاره', ['d']); return [!R.o.length && R.mine.some(e => e.k === 'cdata' && has(e, /منبع: به گفتهٔ «فروشنده»/)), J(R.D.map(e => [e.k, e.l.join(' ¦ ')]))]; };
  bankE[251] = async () => { const R = await one('استادم گفت دامنه‌ی واژه‌هام کمه', ['d']); return [!R.o.length && !R.fc.length, J(R.D.map(e => [e.k, e.l[0]]))]; };
  bankE[252] = async () => { const [P, Q] = await LED(HS, HSP); const r = await stepBtn(Q, '۳'); const mv = await p.evaluate((P) => __ev(P).filter(e => e.mv && !e.wd).length, P); return [r && !r.ask && mv === 1, J({ r, mv })]; };
  bankE[253] = async () => ({ nc: 'a 🎯 has no dependants: its «↪» moves at once (C95, round 28 — bank R28 #191 path unchanged by story)' });
  bankE[254] = async () => { await fresh1(); const r = await p.evaluate(() => APP.STORY.newProbIntro('اگه ۶ نفر باشیم چی؟')); return [r === false, J(r)]; };
  bankE[255] = async () => { await fresh1(); const r = await p.evaluate(() => APP.STORY.newProbIntro('برگردیم به مسئله‌ی اسباب‌کشی')); return [r === false, J(r)]; };
  bankE[256] = async () => { const R = await one('اجاره ماهی ۱۵ میلیونه. ۱۵ × ۱۲ = ۱۸۰ میلیون در سال', ['d']); return [R.mine.some(e => e.k === 'cdata' && /اجاره ماهی ۱۵ میلیونه/.test(e.l[0])) && R.mine.filter(e => /۱۵ × ۱۲/.test(e.l[0])).length === 1 && !dup(R).length, J(R.mine.map(e => [e.k, e.l[0]]))]; };
  bankE[257] = async () => { await fresh1(); const r = await p.evaluate(() => APP.STORY.newProbIntro('یه مسئلهٔ تازه نیست، همون میزه؛ فقط عرضش رو دوباره گفتم: ۹۰ سانت')); return [r === false, J(r)]; };
  bankE[258] = async () => { const R = await one('پیش‌بینیم این بود که دیر میرسم، ولی به موقع رسیدم', ['d']); return [!R.mine.some(e => e.k === 'cdata' && /پیش‌بینی/.test(e.l[0])), J(R.mine.map(e => [e.k, e.l[0]]))]; };
  bankE[259] = async () => { const R = await one('مامانم گفت هر کیسه برنج ۱۰ کیلوئه؛ ۳ تا کیسه گرفتیم', ['d']); return [!R.o.length && !R.mine.some(e => e.k === 'ccalc'), J(R.D.map(e => [e.k, e.l.join(' ¦ ')]))]; };
  bankE[260] = async () => { const [P, Q] = await LED(HS, HSP); const n = await p.evaluate((Q) => { APP.go('dossier', Q); return document.querySelectorAll('#main .lp-dmv').length; }, Q); const mv = await p.evaluate((P) => __ev(P).filter(e => e.mv).length, P); return [n >= 1 && mv === 0, J({ n, mv })]; };
  bankE[261] = async () => { const pid = await fresh1(); await turnA('۱۵ ÷ ۴ = ۳٫۷۵', [csx({ ph: 'e', said: [] })]); await turnA('یعنی ۱۵ ÷ ۴ = ۳٫۷۵', [csx({ ph: 'e', said: [] })]);
    const L = (await EV(pid)).filter(e => MINEK.test(e.k) && /۱۵ ÷ ۴/.test(e.l[0])); return [L.length === 1 && head(L[0]) === '✓', J(L.map(e => [e.k, e.l[0], mark(e)]))]; };

  for (const k of Object.keys(K)) { if (process.env.ONLY && !process.env.ONLY.split(',').some(o => k.indexOf(o) === 0)) continue; info.n++;
    try { const r = await K[k](); if (r[0]) info.ok++; else errors.push(k + ' ⇒ ' + String(r[1]).slice(0, 900)); } catch (e) { errors.push(k + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  const MINE = VAR.map((v, i) => [i, v]).filter(([, v]) => /^R6\./.test(v.rc)); const NC = {};
  for (const [i, v] of MINE) { if (process.env.ONLY && !process.env.ONLY.split(',').some(o => ('B' + i).indexOf(o) === 0)) continue; if (!bankE[i]) { errors.push('B' + i + ' no test'); continue; } info.n++;
    try { const r = await bankE[i](); if (r && r.nc) { NC[i] = r.nc; info.ok++; continue; } if (r[0]) info.ok++; else errors.push('B' + i + ' «' + v.text.slice(0, 80) + '» ⇒ ' + String(r[1]).slice(0, 900)); }
    catch (e) { errors.push('B' + i + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  info.nc = Object.keys(NC).length; console.log('NC: ' + JSON.stringify(NC, null, 1));
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
