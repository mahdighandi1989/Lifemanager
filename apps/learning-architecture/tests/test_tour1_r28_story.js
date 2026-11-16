// تورِ پولیا (دستهٔ ۱، دورِ ۲۸، سهمِ «story»: R5 — C86، C95، C96، C97؛ F3، F9، F10، F11؛ A28-12، A28-13، A28-27) — قرمزِ نخست با جمله‌های خودِ دونده‌ها
//  (ctl/cN.json و ai/rN.txt ِ T/round28X)، هر مثبت با بدلِ منفیِ خودش. LLA_FILE = ساختِ دیگر (قرمزِ نخست: ساختِ BASE28)؛ ONLY=<پیشوندِ بخش‌ها با ویرگول>.
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

  /* ---------- F3 / C86 (S1 A28-5, s01 p17–p18): نشانِ ✓/✗ ِ 📜 از متنِ کنونیِ سطر؛ نشانِ پیشین به تاریخچه ---------- */
  const S01_17 = 'حسابِ ودیعه هم: ۲۰۰ میلیون تقسیم بر ۴۸ ماه = ۴٫۱۷ میلیون در ماه. سودِ بانکِ ودیعه هم ۲۰ درصدِ ۳۰۰ میلیون = ۶۰ میلیون در سال. اجارهٔ یک سال هم ۱۸ میلیون × ۱۲ = ۲۱۶ هزار.';
  const S01_17a = [csx({ ph: 'e', said: ['d', 'result'], result: '۱۸ میلیون × ۱۲ = ۲۱۶ هزار' })];
  const S01_18 = 'آهان، ۲۱۶ میلیون، هزار رو اشتباه نوشتم. راستی امضا رو جمعهٔ بعد بذار، این جمعه صاحبخونه نیست.';
  const S01_18a = [csx({ ph: 'e', said: ['d'], retract: { msg: '۲۱۶ هزار', key: 'datum:اجارهٔ یک سال', what: 'said', fix: '۲۱۶ میلیون', rests: [] } })];
  const rentProb = () => p.evaluate(() => { __wipe(); __fresh(); const pid = __mk('خرید یا اجاره', 'خونه بخرم یا اجاره کنم؟ ودیعه ۲۰۰ میلیون، اجاره ماهی ۱۸ میلیون.'); APP.liveBindSession(pid, __cur(), { force: true }); return pid; });
  const marks = (E) => E.filter(e => /^c(?:res|data)$/.test(e.k) && e.l.some(l => /۱۸ میلیون × ۱۲/.test(l))).map(e => ({ k: e.k, l: e.l }));
  K.C86_A28_5 = async () => { const A = await rentProb(); await turnA(S01_17, S01_17a); await turnA(S01_18, S01_18a); const M = marks(await evs(A));
    const ok = M.length >= 1 && M.every(e => /۲۱۶ میلیون/.test(e.l[0]) && e.l.some(l => /^حسابِ صفحه: ✓/.test(l)) && !e.l.some(l => /^حسابِ صفحه: ✗/.test(l)) && e.l.some(l => /^نشانِ پیشینِ صفحه.*✗/.test(l)));
    return [ok, J(M)]; };
  // بدلِ منفی: اصلاحی که هنوز غلط است ✗ ِ تازهٔ خودش را می‌گیرد (از متنِ تازه)، نه ✓
  K.C86_neg_stillwrong = async () => { const A = await rentProb(); await turnA(S01_17, S01_17a);
    await turnA('آهان، ۲۱۷ میلیون، هزار رو اشتباه نوشتم.', [csx({ ph: 'e', said: ['d'], retract: { msg: '۲۱۶ هزار', key: 'datum:اجارهٔ یک سال', what: 'said', fix: '۲۱۷ میلیون', rests: [] } })]); const M = marks(await evs(A));
    return [M.length >= 1 && M.every(e => /۲۱۷ میلیون/.test(e.l[0]) && e.l.some(l => /^حسابِ صفحه: ✗/.test(l)) && !e.l.some(l => /^حسابِ صفحه: ✓/.test(l))), J(M)]; };


  /*@@MORE@@*/
  for (const k of Object.keys(K)) { if (process.env.ONLY && !process.env.ONLY.split(',').some(o => k.indexOf(o) === 0)) continue; info.n++;
    try { const r = await K[k](); if (r[0]) info.ok++; else errors.push(k + ' ⇒ ' + String(r[1]).slice(0, 900)); } catch (e) { errors.push(k + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
