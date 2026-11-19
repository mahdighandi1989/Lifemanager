// تورِ پولیا (دستهٔ ۱، دورِ ۲۸، سهمِ «story») — بانکِ مستقلِ R5 (tests/variants/VARIANTS_R28.json، ورودی‌های R5.filing_story با شمارهٔ خودشان؛ هیچ ورودی ویرایش نشده).
//  ورودیِ «nc» یعنی این‌جا ساخته نمی‌شود، با دلیل (و کجا سنجیده می‌شود). ONLY=B<شماره>.
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

  const BIKE = 'سلام، برای تمرینِ دوچرخه خودم حساب کردم: هر دور ۱۵۰ ثانیه طول می‌کشه، ۱۲ دور. ۱۵۰ × ۱۲ = ۱۸۰۰ ثانیه = ۱۸ دقیقه. پس با ۱۸ دقیقه گرم‌کردن کلاً ۳۶ دقیقه. درسته؟';
  const BIKEP = [{ step: 'زمانِ دورها', quote: 'هر دور ۱۵۰ ثانیه طول می‌کشه، ۱۲ دور', verdict: 'ok', why: 'داده' }, { step: 'جمعِ دورها', quote: '۱۵۰ × ۱۲ = ۱۸۰۰ ثانیه = ۱۸ دقیقه', verdict: 'wrong', why: '۱۸۰۰ ثانیه ۳۰ دقیقه است' }, { step: 'کل', quote: 'با ۱۸ دقیقه گرم‌کردن کلاً ۳۶ دقیقه', verdict: 'incomplete', why: 'وابسته به گامِ ۲' }];
  /* ---------- بانکِ مستقلِ دورِ ۲۸ (T/VARIANTS_R28.json ⇒ tests/variants/VARIANTS_R28.json) — هر ورودیِ R5.filing_story با شماره‌اش؛ هیچ ورودی ویرایش نشده ---------- */
  const VAR = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'variants', 'VARIANTS_R28.json'), 'utf8'));
  await p.evaluate(() => {
    window.__edit = async (m, nt) => { const s = __cur(); __q.push({ reply: 'درست شد.', status: 'related', memory: 'm', actions: [] }); const r = APP.ASSIST.retractEdit(s, m, nt);
      for (let i = 0; i < 40 && APP.ASSIST.busy && APP.ASSIST.busy(); i++) await new Promise(z => setTimeout(z, 100)); await new Promise(z => setTimeout(z, 300)); __q.length = 0; return r && r.ok; };
    window.__U = (re) => (__cur().msgs || []).filter(m => m.role === 'user' && new RegExp(re).test(m.text)).pop();
    window.__ev = (pid) => (APP.dossier(pid).events || []).map(e => ({ k: e.k, t: e.title, l: e.lines || [], out: e.out || '', wd: !!e.withdrawn, h: (e.hist || []).map(x => [x.lab || ('OLD ' + (x.old || '') + ' → ' + (x.new || '')), String(x.at || '').slice(0, 10)]), mv: !!(e.mv28 || e.mvFrom) }));
  });
  const PQ = () => p.evaluate(() => { __wipe(); __fresh(); const P = __mk('قفسه‌های انباری', 'انباری ۲ متر ارتفاع داره؛ چند طبقه قفسه جا میشه و چوبش رو چقدر بخرم؟');
    const Q = __mk('کفِ انباری', 'کفِ انباری رو می‌خوام کاشی کنم؛ چند متر کاشی بخرم؟'); APP.liveBindSession(Q, __cur(), { force: true }); return [P, Q]; });
  const EV = (pid) => p.evaluate((pid) => __ev(pid), pid);
  const lineOf = (E, re) => E.filter(e => !e.wd && e.l.some(l => re.test(l)));
  const mark = (e) => (e.l.filter(l => /^حسابِ صفحه:/.test(l))[0] || '').replace(/^حسابِ صفحه:\s*/, '').slice(0, 1);
  const edit = (re, nt) => p.evaluate(async ([re, nt]) => __edit(__U(re), nt), [re, nt]);
  const E = {};
  const C86pos = (i, said, edits) => async () => { const [, Q] = await PQ(); const [u, a] = said; await turnA(u, [csx({ ph: 'e', said: a.said, result: a.result })]);
    for (const x of edits) { if (x.edit) await edit(x.re, x.edit); else await turnA(x.say, [csx({ ph: 'e', said: ['d'], retract: x.retract })]); }
    const L = lineOf(await EV(Q), /[0-9۰-۹]/).filter(e => /^c(?:res|data|calc|step)$/.test(e.k)); return L; };
  E[177] = async () => { const L = await C86pos(177, ['قسطِ ماهانه: ۲۵ میلیون × ۱۲ = ۳۰۰ هزار', { said: ['result'], result: '۲۵ میلیون × ۱۲ = ۳۰۰ هزار' }], [{ re: '۳۰۰ هزار', edit: 'قسطِ ماهانه: ۲۵ میلیون × ۱۲ = ۳۰۰ میلیون' }])();
    return [L.length >= 1 && L.every(e => /۳۰۰ میلیون/.test(e.l[0]) && mark(e) === '✓' && !e.l.some(l => /^حسابِ صفحه: ✗/.test(l)) && e.l.some(l => /^نشانِ پیشین.*✗/.test(l))), J(L)]; };
  E[178] = async () => { const L = await C86pos(178, ['کرایه‌ی ۱۸ ماه: ۱۵ میلیون × ۱۸ = ۲۷۰ هزار', { said: ['result'], result: '۱۵ میلیون × ۱۸ = ۲۷۰ هزار' }], [{ say: 'ببخشید، ۲۷۰ هزار نه، ۲۷۰ میلیون', retract: { msg: '۲۷۰ هزار', key: 'result', what: 'said', fix: '۲۷۰ میلیون', rests: [] } }])();
    return [L.length >= 1 && L.every(e => /۲۷۰ میلیون/.test(e.l[0]) && mark(e) === '✓' && e.l.some(l => /^نشانِ پیشین.*✗/.test(l))), J(L)]; };
  E[179] = async () => { const L = await C86pos(179, ['هر نفر: ۱۰۰ ÷ ۸ = ۱۳', { said: ['result'], result: '۱۰۰ ÷ ۸ = ۱۳' }], [{ re: '۱۰۰ ÷ ۸', edit: 'هر نفر: ۱۰۰ ÷ ۸ = ۱۲٫۵' }])();
    return [L.length >= 1 && L.every(e => /۱۲٫۵/.test(e.l[0]) && mark(e) === '✓' && e.l.some(l => /^نشانِ پیشین/.test(l))), J(L)]; };
  E[180] = async () => { const L = await C86pos(180, ['۶ × ۷ = ۴۲', { said: ['result'], result: '۶ × ۷ = ۴۲' }], [{ re: '۶ × ۷', edit: '۶ × ۷ = ۴۸' }])();
    return [L.length >= 1 && L.every(e => /۴۸/.test(e.l[0]) && mark(e) === '✗' && e.l.some(l => /^نشانِ پیشین.*✓/.test(l))), J(L)]; };
  E[181] = async () => { const [, Q] = await PQ(); await turnA('هزینه‌ی سالانه: ۴ میلیون × ۱۲ = ۴۸ هزار', [csx({ ph: 'e', said: ['result'], result: '۴ میلیون × ۱۲ = ۴۸ هزار' })]);
    await edit('۴۸ هزار', 'هزینه‌ی سالانه: ۴ میلیون × ۱۲ = ۴۸ میلیون'); const D = await EV(Q), s = await p.evaluate(() => APP.dossier(__cur().id).events.filter(e => /در کارنامه شمرده نشد/.test((e.lines || []).join(' ')) && /✗/.test(e.out || '')).length);
    const L = lineOf(D, /۴۸ میلیون/); return [L.length >= 1 && L.every(e => mark(e) === '✓') && s === 0, J({ L, s })]; };
  E[182] = async () => { const [, Q] = await PQ(); await turnA('کفِ انباری ۶ متر در ۴ متر = ۲۴ مترمربع', [csx({ ph: 'e', said: ['d'] })]);
    await edit('۶ متر در ۴ متر', 'کفِ انباری ۶ متر در ۵ متر = ۳۰ مترمربع'); const L = lineOf(await EV(Q), /۶ متر در ۵ متر/).filter(e => /^c(?:data|res|calc)$/.test(e.k));
    return [L.length >= 1 && L.every(e => mark(e) === '✓' && e.l.some(l => /^اصلاح شد ⇐/.test(l))), J(L)]; };
  const other = async (u, said) => { const [, Q] = await PQ(); await turnA(u, said ? [csx({ ph: 'e', said })] : []); const D = await EV(Q); return { D, o: D.filter(e => e.k === 'cother'), mine: D.filter(e => /^c(?:res|data|calc|step)$/.test(e.k)) }; };
  E[183] = async () => { const R = await other('داداشم حساب کرد: ۶ × ۲۵۰ = ۱۴۰۰', ['result']); return [R.o.length === 1 && mark(R.o[0]) === '✗' && !R.mine.length, J(R.D)]; };
  E[184] = async () => { const R = await other('داداشم یه حسابِ دیگه هم کرد: ۳ × ۱۵۰ = ۴۵۰', []); return [R.o.length === 1 && mark(R.o[0]) === '✓' && !R.mine.length, J(R.D)]; };
  E[185] = async () => { const R = await other('خاله‌م حساب کرد که ۱۲ × ۱۲ = ۱۴۴ ـه', ['result']); return [R.o.length === 1 && mark(R.o[0]) === '✓' && !R.mine.some(e => e.k === 'cres'), J(R.D)]; };
  E[186] = async () => { const R = await other('فروشنده گفت ۹ درصد تخفیف می‌ده', ['d']); return [!R.o.length && R.mine.some(e => e.k === 'cdata' && e.l.some(l => /منبع: به گفتهٔ «فروشنده»/.test(l))), J(R.D)]; };
  E[187] = async () => { const u = 'استادم میگه «یه طرح بده»… ببین، ضریب رو ۰٫۶ گذاشتم و زمان رو ۱۲ میلی‌ثانیه'; const R = await other(u, ['d']);
    return [!R.o.length && R.mine.length >= 1 && (await p.evaluate(() => __cur().msgs.filter(m => m.role === 'user').pop().text)) === u, J(R.D)]; };
  E[188] = async () => { const R = await other('بابام کمکم کرد جدول رو کشیدم. ۴ × ۹ = ۳۶', []); return [!R.o.length && R.mine.some(e => mark(e) === '✓'), J(R.D)]; };
  E[189] = async () => { const R = await other('داداشم حساب کرد: ۳ × ۴۰۰ = ۱۲۰۰ هزار', null); return [R.o.length === 1 && mark(R.o[0]) === '✓', J(R.D)]; };
  /* جابه‌جایی (C95/C123/C124) */
  /* سطرِ «کفِ انباری» (مالِ Q) وقتی گفت‌وگو هنوز به P بسته بود گفته شد ⇒ بدجا در 📜 ِ P */
  const misfiled = async () => { const [P, Q] = await PQ(); await p.evaluate((P) => APP.liveBindSession(P, __cur(), { force: true }), P);
    await turnA('قفسه‌ها: ۵ × ۸۰ = ۴۰۰ سانت', [csx({ ph: 'e', said: ['d'] })]); await turnA('کفِ انباری ۶ متر در ۵ متر = ۳۰ مترمربع', [csx({ ph: 'e', said: ['d'] })]); return [P, Q]; };
  const btns = (pid, re) => p.evaluate(([pid, re]) => { APP.go('dossier', pid); return [...document.querySelectorAll('#main li.lp-dev')].filter(li => new RegExp(re).test(li.innerText)).map(li => li.querySelectorAll('.lp-dmv').length); }, [pid, re]);
  const clickMv = (pid, re, to) => p.evaluate(([pid, re, to]) => { APP.go('dossier', pid); const li = [...document.querySelectorAll('#main li.lp-dev')].filter(li => new RegExp(re).test(li.innerText))[0]; const b = li && [...li.querySelectorAll('.lp-dmv')].filter(b => new RegExp(to).test(b.textContent))[0]; if (b) b.click(); return !!b; }, [pid, re, to]);
  E[190] = async () => { const [P, Q] = await misfiled(); const all = await p.evaluate((P) => { APP.go('dossier', P); return [...document.querySelectorAll('#main li.lp-dev')].map(li => [li.dataset.ev, li.querySelectorAll('.lp-dmv').length]); }, P);
    const ok = all.filter(x => /^c|^stmt$/.test(x[0])).every(x => x[1] >= 1) && all.length >= 2; return [ok, J(all)]; };
  E[191] = async () => { const [P, Q] = await PQ(); await turnA('فکر کنم کفِ انباری تا جمعه کاشی بشه، ۷۰ درصد مطمئنم.', []); const b = await btns(Q, '🎯'); const hit = await clickMv(Q, '🎯', 'قفسه');
    const R = await p.evaluate(([P, Q]) => ({ p: __ev(P).filter(e => e.mv && /🎯/.test(e.t)).length, q: __ev(Q).filter(e => /🎯/.test(e.t) && !e.wd).length }), [P, Q]);
    return [b.length >= 1 && b.every(n => n >= 1) && hit && R.p === 1 && R.q === 0, J({ b, R })]; };
  E[192] = async () => { const [P, Q] = await PQ(); await turnA(BIKE, [csx({ ph: 'e', said: [], prior: BIKEP })]); const b = await p.evaluate((Q) => { APP.go('dossier', Q); return [...document.querySelectorAll('#main .lp-dmv')].map(x => x.textContent).filter(t => /^↪ گامِ/.test(t)); }, Q);
    const hit = await clickMv(Q, 'کارِ پیشین', 'گامِ ۱ مالِ');
    /* دورِ ۲۹ (C124، a45 ST.stepDeps29): گامِ ۲ بر دادهٔ گامِ ۱ بناست ⇒ صفحه می‌پرسد؛ «فقط گامِ ۱» همان جابه‌جاییِ این ورودی است */
    await p.evaluate((Q) => { APP.go('dossier', Q); const b = document.querySelector('#main .lp-dmvone'); if (b) b.click(); }, Q); const R = await p.evaluate((P) => __ev(P).filter(e => e.mv).map(e => e.l[0]), P);
    return [b.some(t => /گامِ ۱/.test(t)) && b.some(t => /گامِ ۳/.test(t)) && hit && R.length === 1 && /^گامِ ۱/.test(R[0]), J({ b, R })]; };
  E[193] = async () => { const [P, Q] = await misfiled(); const hit = await clickMv(P, '۶ متر در ۵ متر', 'کفِ انباری');
    const R = await p.evaluate(([P, Q]) => ({ q: __ev(Q).filter(e => e.mv && e.l.some(l => /۶ متر در ۵ متر/.test(l))), pl: __ev(P).filter(e => e.l.some(l => /۶ متر در ۵ متر/.test(l))), today: APP.today(), unmv: (APP.go('dossier', Q), document.querySelectorAll('#main .lp-dunmv').length), fixTxt: (APP.go('dossier', P), /اصلاح شد ⇐ «—»/.test(document.getElementById('main').innerText)) }), [P, Q]);
    const q = R.q[0], pl = R.pl;
    return [hit && R.q.length === 1 && mark(q) === '✓' && R.unmv >= 1 && pl.length === 1 && pl[0].wd && pl[0].h.length === 1 && /^جابه‌جا شد/.test(pl[0].h[0][0]) && pl[0].h[0][1] === R.today && !R.fixTxt, J(R)]; };
  E[194] = async () => { const [P, Q] = await misfiled(); await clickMv(P, '۶ متر در ۵ متر', 'کفِ انباری'); await p.evaluate((Q) => { APP.go('dossier', Q); document.querySelector('#main .lp-dunmv').click(); }, Q);
    const R = await p.evaluate(([P, Q]) => ({ pl: __ev(P).filter(e => /^c/.test(e.k) && e.l.some(l => /۶ متر در ۵ متر/.test(l))), q: __ev(Q).filter(e => e.mv && !e.wd).length, today: APP.today() }), [P, Q]);
    return [R.pl.length === 1 && !R.pl[0].wd && R.pl[0].h.length === 2 && /^جابه‌جا شد/.test(R.pl[0].h[0][0]) && /^برگشت/.test(R.pl[0].h[1][0]) && R.pl[0].h.every(h => h[1] === R.today) && R.q === 0, J(R)]; };
  E[195] = async () => { const [P, Q] = await misfiled(); await clickMv(P, '۶ متر در ۵ متر', 'کفِ انباری'); const t = await p.evaluate((Q) => { APP.go('dossier', Q); return APP.state.arg + '|' + (APP.dossier(Q).title); }, Q);
    return [t === Q + '|کفِ انباری', t]; };
  E[196] = async () => { const [P, Q] = await PQ(); const st = 'یه مخزنِ ۲۴۰ لیتری با شیرِ دقیقه‌ای ۸ لیتر چقدر طول می‌کشه پر بشه؟';
    await turnA('یه مسئله‌ی جدا: ' + st, [{ do: 'chat_invent', statement: st, title: 'پر شدنِ مخزن', nat: 'objective', kind: 'find', from: Q }, csx({ ph: 'u', said: [] })]);
    const R = await p.evaluate(() => APP.S.all('eprob', r => r && r.live && r.p).map(r => r.p.title)); return [R.some(t => /مخزن/.test(t)) && R.length === 3, J(R)]; };
  E[197] = async () => { const [P, Q] = await PQ(); await p.evaluate((Q) => { const pg = APP.S.get('eprog_' + Q); pg.solve.live = pg.solve.live || {}; pg.solve.live.state = 'solved'; APP.S.put(pg); }, Q);
    const st = 'درِ انباری قفل نمیشه و باید یه قفلِ تازه بخرم که با کلیدِ قبلی جور باشه'; await turnA('به همین انباری ربط داره ولی جداست: ' + st, [{ do: 'chat_invent', statement: st, title: 'قفلِ درِ انباری', nat: 'life', kind: 'find', from: Q }, csx({ ph: 'u', said: [] })]);
    const R = await p.evaluate((Q) => ({ L: APP.S.all('eprob', r => r && r.live && r.p).map(r => r.p.title), N: ((((APP.S.get('eprog_' + Q).solve.b || {})[1] || {}).newProbs) || []).length, sys: __cur().msgs.filter(m => m.role === 'sys').map(m => m.text).join(' ') }), Q);
    return [R.L.some(t => /قفل/.test(t)) && R.N === 0 && !/مسئلهٔ زنده ساخته نشد/.test(R.sys), J(R)]; };
  E[198] = async () => { const [, Q] = await PQ(); await turnA('من حساب کردم: ۱۸ × ۱٫۲۵ = ۲۲٫۵ و بعدش ۲۲٫۵ ÷ ۳ = ۷٫۵', [csx({ ph: 'e', said: [] })]); const L = lineOf(await EV(Q), /۱۸ × ۱٫۲۵/);
    return [L.length === 1 && mark(L[0]) === '✓' && /۲۲٫۵ ÷ ۳ = ۷٫۵/.test(L[0].l[0]), J(L)]; };
  E[199] = async () => ({ nc: 'not run as written: the plan-correction filing is checked at page level through the runner\'s own s03 replay (test_tour1_r28_story_replay.js A_s03_A28_13) — the bank sentence «برنامه‌ی P رو عوض کنم: اول طبقه‌ها، بعد رنگ» is a restated plan, not a retract, and the page has no «side problem of P» shape to build it from without the model\'s chat_invent' });
  E[200] = async () => { const [P] = await PQ(); await p.evaluate((P) => { APP.liveBindSession(P, __cur(), { force: true }); const pg = APP.S.get('eprog_' + P); pg.solve.live.state = 'solved'; APP.S.put(pg); }, P);
    await turnA('خودم یه معما ساختم: ساعت‌های ۵ و ۹ دقیقه، چطوری ۱۳ دقیقه؟ ۹ − ۵ = ۴ و ۹ + ۴ = ۱۳', [{ do: 'chat_invent', statement: 'خودم یه معما ساختم: ساعت‌های ۵ و ۹ دقیقه، چطوری ۱۳ دقیقه؟', title: 'ساعت‌شنیِ ۵ و ۹ برای ۱۳ دقیقه', nat: 'objective', kind: 'find', from: P }, csx({ ph: 'b', said: ['result'] })]);
    const R = await p.evaluate((P) => __ev(P).filter(e => e.l.some(l => /۹ − ۵ = ۴/.test(l)) && !/مسئله‌های تازه/.test(e.t)).length, P); return [R === 0, J(R)]; };
  E[201] = async () => { const [, Q] = await PQ(); await turnA('هزینه‌ی جمع کردنِ موکتِ قدیمیِ انباری هم ۴۰۰ هزار تومنه', [csx({ ph: 'e', said: [] })]); const L = lineOf(await EV(Q), /موکت/);
    return [L.length >= 1, J(L)]; };
  E[202] = async () => { const [, Q] = await PQ(); await turnA('−۳۵/۵ = −۷ و بعد ۱ + ۰٫۳ = ۱٫۳', [csx({ ph: 'e', said: [] })]); const L = lineOf(await EV(Q), /۰٫۳/);
    return [L.length >= 1 && L.every(e => mark(e) === '✓'), J(L)]; };
  E[203] = async () => { const [, Q] = await PQ(); await turnA('۶ × ۸ = ۴۶', [csx({ ph: 'e', said: ['result'], result: '۶ × ۸ = ۴۶' })]); await turnA('۳ × ۳ = ۹', [csx({ ph: 'e', said: ['result'], result: '۳ × ۳ = ۹' })]);
    await edit('^۳ × ۳ = ۹$', '۳ × ۳ = ۹ تا'); const D = await EV(Q), a = lineOf(D, /۶ × ۸ = ۴۶/), b2 = lineOf(D, /۳ × ۳ = ۹/);
    return [a.length >= 1 && a.every(e => mark(e) === '✗' && !e.l.some(l => /^نشانِ پیشین/.test(l))) && b2.every(e => mark(e) === '✓'), J({ a, b2 })]; };
  E[204] = async () => { const [, Q] = await PQ(); await turnA('۲۵ میلیون × ۱۲ = ۳۰۰ میلیون', [csx({ ph: 'e', said: ['result'], result: '۲۵ میلیون × ۱۲ = ۳۰۰ میلیون' })]); await edit('۲۵ میلیون × ۱۲', '۲۵ میلیون ضربدر ۱۲ = ۳۰۰ میلیون');
    const L = lineOf(await EV(Q), /۳۰۰ میلیون/); return [L.length >= 1 && L.every(e => mark(e) === '✓'), J(L)]; };
  E[205] = async () => { const [, Q] = await PQ(); await turnA('۸ × ۱۵ = ۱۱۰', [csx({ ph: 'e', said: ['result'], result: '۸ × ۱۵ = ۱۱۰' })]); await turnA('نه، درسته، مطمئنم', [csx({ ph: 'e', said: [] })]);
    const L = lineOf(await EV(Q), /۸ × ۱۵ = ۱۱۰/); return [L.length >= 1 && L.every(e => mark(e) === '✗' && !e.l.some(l => /^نشانِ پیشین|^اصلاح شد/.test(l))), J(L)]; };
  E[206] = async () => { const R = await other('فروشنده حساب کرد: ۳ × ۴۵۰ = ۱۳۰۰', ['d']); return [R.o.length === 1 && mark(R.o[0]) === '✗' && !R.mine.some(e => e.k === 'cdata'), J(R.D)]; };
  E[207] = async () => { const R = await other('خودم حساب کردم، داداشم فقط نگاه کرد: ۸ × ۱۲ = ۹۶', ['result']); return [!R.o.length && R.mine.some(e => mark(e) === '✓'), J(R.D)]; };
  E[208] = async () => { const R = await other('آره همون ۴۸ که گفتی درسته', []); return [!R.o.length, J(R.D)]; };
  E[209] = async () => { const [, Q] = await PQ(); await turnA('مربی گفت ۷۰ درصد می‌بریم', [csx({ ph: 'e', said: ['d'] })]); const R = await p.evaluate((Q) => ({ fc: APP.S.all('fcast').filter(x => !x.sample).length, d: __ev(Q).filter(e => e.k === 'cdata').length, o: __ev(Q).filter(e => e.k === 'cother').length, ow: !!APP.STORY.otherWork27('مربی گفت ۷۰ درصد می‌بریم') }), Q);
    return [R.fc === 0 && R.d === 0 && R.ow, J(R)]; };
  E[210] = async () => { await PQ(); await turnA('یه مسئله‌ی دیگه هم مثلِ همین داشتم، ولی ولش کن', [csx({ ph: 'e', said: [] })]); const n = await p.evaluate(() => APP.S.all('eprob', r => r && r.live).length); return [n === 2, n]; };
  E[211] = async () => { const [, Q] = await PQ(); await turnA('این دکمه‌ی ↪ چیکار می‌کنه؟', [csx({ ph: 'e', said: [] })]); const R = await p.evaluate((Q) => ({ n: APP.S.all('eprob', r => r && r.live).length, l: __ev(Q).filter(e => /^c(?:res|data|calc|step|other|unk|whole)$/.test(e.k)).length }), Q); return [R.n === 2 && R.l === 0, J(R)]; };
  E[212] = async () => { const [, Q] = await PQ(); await turnA('صورتِ مسئله رو دوباره بگم: قفسه‌ها ۸۰ سانتی‌ان و ۵ تا طبقه دارن', [csx({ ph: 'u', said: ['d'] })]); const n = await p.evaluate(() => APP.S.all('eprob', r => r && r.live).length); return [n === 2, n]; };
  E[213] = async () => ({ nc: 'not mine: «امروز ۴۰ دقیقه پیاده رفتم» ⇒ practice dossier is the practice/a41 filing (D27-17 path, test_tour1_r27b_history #224/#244); the story layer adds no line for it (no calculation, no coach_state) — checked by A28_12_neg' });
  E[214] = async () => { const [P, Q] = await misfiled(); await clickMv(P, '۶ متر در ۵ متر', 'کفِ انباری'); const R = await p.evaluate((P) => __ev(P).filter(e => e.l.some(l => /۶ متر در ۵ متر/.test(l))).map(e => ({ wd: e.wd, out: e.out })), P);
    return [R.length === 1 && R[0].wd && /جابه‌جا شد (?:⇒|به) «کفِ انباری»/.test(R[0].out), J(R)]; };
  E[215] = async () => { const R = await other('با کمکِ معلمم فهمیدم چرا ضرب می‌کنیم', ['d']); return [!R.o.length, J(R.D)]; };
  E[216] = async () => { const R = await other('مامانم گفت برنج ۲ کیلوئه', ['d']); return [!R.o.length && R.mine.some(e => e.k === 'cdata' && e.l.some(l => /منبع: به گفتهٔ «مامانم»/.test(l))) && !R.mine.some(e => e.k === 'ccalc'), J(R.D)]; };
  E[217] = async () => { const [P, Q] = await PQ(); await p.evaluate((P) => APP.liveBindSession(P, __cur(), { force: true }), P); await turnA('قفسه‌ها: ۵ × ۸۰ = ۴۰۰ سانت', [csx({ ph: 'e', said: [] })]);
    const R = await p.evaluate(([P, Q]) => ({ p: __ev(P).filter(e => e.l.some(l => /۵ × ۸۰/.test(l))).length, q: __ev(Q).filter(e => e.l.some(l => /۵ × ۸۰/.test(l))).length }), [P, Q]); return [R.p >= 1 && R.q === 0, J(R)]; };
  const MINE = VAR.map((v, i) => [i, v]).filter(([, v]) => /^R5\./.test(v.rc));
  const NC = {}; let bank = 0;
  for (const [i, v] of MINE) { if (process.env.ONLY && !process.env.ONLY.split(',').some(o => ('B' + i).indexOf(o) === 0)) continue; if (!E[i]) { errors.push('B' + i + ' no test'); continue; } info.n++; bank++;
    try { const r = await E[i](); if (r && r.nc) { NC[i] = r.nc; info.ok++; continue; } if (r[0]) info.ok++; else errors.push('B' + i + ' [' + v.rc + '] «' + v.text.slice(0, 80) + '» ⇒ ' + String(r[1]).slice(0, 700)); }
    catch (e) { errors.push('B' + i + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  info.nc = Object.keys(NC).length; console.log('NC: ' + JSON.stringify(NC, null, 1));
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
// دورِ ۳۰ (surface، C30-6 / #294 — یک قراردادِ پیکان): جابه‌جایی حالا «جابه‌جا شد به «…»» نوشته می‌شود (بی ⇒)؛ انتظارهای «جابه‌جا شد ⇒» هر دو ریخت را می‌پذیرند.
