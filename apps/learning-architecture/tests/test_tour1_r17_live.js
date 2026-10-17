// تورِ پولیا (دستهٔ ۱، دورِ ۱۷ ِ اصلاح، ۲۰۲۶-۱۰-۱۷) — DECISIONS_R17 RC2 a–e (بخشِ «live»: منبع و سازندهٔ گزینه‌های «کدام پرسش کمک کرد؟»).
//  قاعدهٔ مالک: هیچ ایرادی «برای همان سناریو» اصلاح نمی‌شود — هر بخش هم جملهٔ عینیِ سناریو (round17X/<sid>) را دارد و هم **همهٔ** واریانت‌های RC2 ِ
//  بانکِ مستقل (tests/variants/VARIANTS_R17.json = tour1_polya/VARIANTS_R17.json، نوشتهٔ عاملی که کد را ندیده؛ LLA_VARIANTS = مسیرِ دیگر).
//  close  RC2a — پنجرهٔ مسئلهٔ بسته‌شده در گفت‌وگو در لحظهٔ chat_solved تمام می‌شود (B·D1 s14).
//  meta   RC2b — پرسشِ بازنگریِ خودِ گفت‌وگو (بهترین پرسش، سلیقه) هرگز گزینه نیست (A·D5 s08، B·D2 s14/s18، D·1 s31/s38) + بانک RC2.meta.
//  guess  RC2c — «(حدسِ تو: …)» فقط از حدسِ نقل‌شده در همان پیام یا نشانِ coach_state.guess ِ همان نوبت (A·D2 s01/s09، B·D1 s11d، C·V1 s21/s28) + بانک.
//  label  RC2d — سرِ بی‌فعل برچسب است (D·7، C·V3 s25) + بانک RC2.bare_label.
//  ana    RC2d — پیوندِ «حرف‌اضافهٔ مرکب + اشاره» (D·8 s36) + بانک RC2.anaphora.
//  rep    RC2e — یکی کردن روی شیءِ پرسش، نه قاب (A·D3 s01) + بانک RC2.repeat.
// مسئله و سشن مستقیم در انباره ساخته می‌شوند (همان شکلِ رکوردی که دستیار می‌سازد) و گزینه‌ها از APP.liveChatQItems خوانده می‌شوند — همان منبعِ #lpBBest/#lpRBest.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = process.env.LLA_VARIANTS || path.join(__dirname, 'variants', 'VARIANTS_R17.json');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0]); } };
  const J = (x) => JSON.stringify(x);
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => { APP.S.loaded = true; APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) }; });

  /* opts(spec): spec = { msgs: [{ text, guess? }], guesses?: {1: {guess, at}}, title? } ⇒ گزینه‌های 💬 ِ مسئلهٔ تازه */
  const opts = (spec) => p.evaluate((spec) => {
    const t0 = Date.parse('2026-10-17T08:00:00Z');
    const pid = APP.liveCreate(spec.title || ('مسئلهٔ آزمونِ دورِ ۱۷ ' + Math.random().toString(36).slice(2, 7)), 'صورتِ آزمونی برای گزینه‌های کدام پرسش کمک کرد', 'find', { by: 'user', nat: 'objective' });
    const id = typeof pid === 'string' ? pid : (pid && pid.p ? pid.p.id : pid.id);
    const r = APP.S.get('eprob_' + id); r.created = new Date(t0 - 3600e3).toISOString(); APP.S.put(r, { keepTime: true });
    if (spec.guesses) { const pg = APP.S.get('eprog_' + id) || { id: 'eprog_' + id, type: 'eprog' }; pg.solve = pg.solve || {}; pg.solve.g = {}; Object.keys(spec.guesses).forEach(k => { const g = spec.guesses[k]; pg.solve.g[k] = { guess: g.guess, at: g.at || new Date(t0 - 1800e3).toISOString(), from: 'live' }; }); APP.S.put(pg); }
    const msgs = []; let n = 0;
    (spec.msgs || []).forEach(m => { const a = { role: 'ai', text: m.text, at: new Date(t0 + (n++) * 60e3).toISOString(), actions: m.actions || [] }; if (m.guess) a.guess = m.guess; msgs.push(a); msgs.push({ role: 'user', text: m.reply || 'باشه، فکر می‌کنم.', at: new Date(t0 + (n++) * 60e3).toISOString() }); });
    const se = { id: APP.uid('achat'), type: 'achat', title: 't', msgs, steps: [], files: [], reports: [], lprob: id };
    APP.S.put(se);
    const out = APP.liveChatQItems(id).map(x => x.t);
    APP.S.del(se.id);
    return out;
  }, spec);
  const NOTE = /\(حدسِ تو: «(.*)»\)$/;
  const notes = (q) => q.map(t => { const m = NOTE.exec(t); return m ? m[1] : null; }).filter(x => x != null);

  /* ---------- بانکِ واریانت‌ها ---------- */
  const bank = JSON.parse(fs.readFileSync(BANK, 'utf8')).filter(e => /^RC2/.test(e.rc));
  info.bank = { file: BANK, rc2: bank.length };
  chk(bank.length >= 60, 'bank: the RC2 variant bank must be loaded (got ' + bank.length + ' entries from ' + BANK + ')');
  const firstQuote = (s) => { const i = s.indexOf('«'); if (i < 0) return null; let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === '«') d++; else if (s[j] === '»') { d--; if (!d) return s.slice(i + 1, j); } } return null; };
  const ctxGuesses = (ctx) => {
    const G = {}; if (!ctx) return null;
    let m = /recorded g(\d+): «([^»]+)»/.exec(ctx); if (m) G[m[1]] = { guess: m[2] };
    m = /recorded (?:\(refuted\) )?guess: «([^»]+)»/.exec(ctx); if (m) G[1] = { guess: m[1] };
    m = /guess «([^»]+)» recorded at t2/.exec(ctx); if (m) G[1] = { guess: m[1], at: '2026-10-17T09:30:00.000Z' };
    m = /guess recorded at t2/.exec(ctx); if (m && !G[1]) G[1] = { guess: 'حدسِ ثبت‌شدهٔ دیرتر', at: '2026-10-17T09:30:00.000Z' };
    return Object.keys(G).length ? G : null;
  };
  const failBank = [];
  const bankFail = (e, why, got) => { failBank.push(e.rc + '/' + e.kind + ' «' + e.text.slice(0, 60) + '» — ' + why + ' got ' + J(got)); };
  for (const e of bank) {
    const ex = e.expect;
    if (e.rc === 'RC2.repeat') {
      const parts = e.text.split(' ‖ ').map(s => { const m = /^A\d+(?: \(([^)]*)\))?:\s*(.*)$/.exec(s); return { lab: m ? m[1] || '' : '', t: m ? m[2] : s }; });
      if (/each problem/.test(ex)) {
        const L = []; for (const x of parts) L.push(await opts({ msgs: [{ text: x.t }] }));
        if (!L.every(q => q.length === 1)) bankFail(e, 'one option in each problem', L);
        continue;
      }
      const msgs = parts.map(x => { const g = /after (?:new )?guess «([^»]+)»/.exec(x.lab); return g ? { text: x.t, guess: { text: g[1] } } : { text: x.t }; });
      const q = await opts({ msgs });
      const want = /^one option/.test(ex) ? 1 : /^two options/.test(ex) ? 2 : null;
      if (want != null && q.length !== want) bankFail(e, want + ' option(s)', q);
      const fq = /^one option «/.test(ex) ? firstQuote(ex) : null; if (fq && !(q.length === 1 && q[0] === fq)) bankFail(e, 'the option «' + fq + '»', q);
      continue;
    }
    const G = ctxGuesses(e.context), pointer = /coach_state\.guess -> g(\d+)/.exec(e.context || '');
    const q = await opts({ msgs: [{ text: e.text, guess: pointer ? { g: +pointer[1] } : undefined }], guesses: G });
    if (/^no option/.test(ex)) { if (q.length) bankFail(e, 'no option', q); continue; }
    if (/^option kept/.test(ex)) { if (!(q.length === 1 && q[0] === e.text)) bankFail(e, 'the whole message as the one option', q); continue; }
    if (/^option «/.test(ex)) { const w = firstQuote(ex); if (/only/.test(ex) ? !(q.length === 1 && q[0] === w) : !q.includes(w)) bankFail(e, 'option «' + w + '»' + (/only/.test(ex) ? ' only' : ''), q); }
    if (/^note «/.test(ex)) {
      const w = firstQuote(ex), ns = notes(q);
      if (/or no note/.test(ex)) { if (!(ns.length === 0 || (ns.length === 1 && ns[0] === w))) bankFail(e, 'note «' + w + '» or none', q); }
      else if (!(ns.length === 1 && ns[0] === w)) bankFail(e, 'note «' + w + '»', q);
    }
    if (/never «([^»]+)»/.test(ex)) { const nv = /never «([^»]+)»/.exec(ex)[1]; if (notes(q).some(n => n.indexOf(nv) >= 0)) bankFail(e, 'never the note «' + nv + '»', q); }
    if (/never the recorded|never the recorded guess/.test(ex) && G && G[1] && notes(q).includes(G[1].guess)) bankFail(e, 'never the recorded guess', q);
    if (/^no guess note/.test(ex)) { if (notes(q).length) bankFail(e, 'no guess note', q); const w = /option «/.test(ex) ? firstQuote(ex.slice(ex.indexOf('option «'))) : null; if (w && !q.includes(w)) bankFail(e, 'option «' + w + '»', q); }
  }
  info.bankFailures = failBank.length;
  failBank.forEach(f => errors.push('bank: ' + f));

  // ================= close — RC2a =================
  await section('close', async () => {
    const r = info.close = {};
    r.q = await p.evaluate(() => {
      const t0 = Date.parse('2026-10-17T08:00:00Z'), T = (n) => new Date(t0 + n * 60e3).toISOString();
      const id = APP.liveCreate('میانگینِ ۳۶ دانشجو ِ هفدهم', 'میانگینِ نمرهٔ ۳۶ دانشجو ۱۴ است؛ انحرافِ معیارِ نمونه را با n−1 حساب کن.', 'find', { by: 'assistant', nat: 'objective' });
      const pid = typeof id === 'string' ? id : id.p.id;
      const se = { id: APP.uid('achat'), type: 'achat', title: 't', steps: [], files: [], reports: [], lprob: pid, msgs: [
        { role: 'ai', at: T(0), actions: [], text: 'سرِ جلسه اول از خودت می‌پرسی «مجهول چیست؟» — این‌جا مجهول دقیقاً کدام عدد است؟' },
        { role: 'user', at: T(1), text: 'انحراف معیار.' },
        { role: 'ai', at: T(2), actions: [], text: '«تموم» نه هنوز: اگر فقط یک نفر نمره‌اش عوض شود، کدام عدد عوض می‌شود؟' },
        { role: 'user', at: T(3), text: 'میانگین و انحراف معیار هر دو.' },
        { role: 'ai', at: T(4), actions: ['chat_solved'], text: 'آفرین، حل شد و ثبتش کردم. آخرِ کار: احتمال بین ۰ و ۱؟ جهتِ جواب درست است؟ از پرسش‌هایی که این دو روز پرسیدم، کدام بیشتر کمکت کرد؟' },
        { role: 'user', at: T(5), text: 'همون اولی.' },
        { role: 'ai', at: T(6), actions: [], text: 'خودت فکر می‌کنی چرا n−1 و نه n؟' },
        { role: 'user', at: T(7), text: 'نمی‌دونم.' }] };
      APP.S.put(se);
      const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog' }; pg.solve = pg.solve || {}; pg.solve.live = pg.solve.live || {};
      pg.solve.b = { 1: { done: true, from: 'chat', state: 'solved', use: 'درسِ خودم', at: T(4.5) } };
      Object.assign(pg.solve.live, { state: 'solved', stateAt: T(4.5), chat: { sess: se.id, at: T(4.5) } });
      APP.S.put(pg);
      const se2 = { id: APP.uid('achat'), type: 'achat', title: 't2', steps: [], files: [], reports: [], lprob: pid, msgs: [
        { role: 'ai', at: T(30), actions: [], text: 'فردا هم یک پرسش: انحرافِ معیارِ جامعه را چطور تخمین می‌زنی؟' }, { role: 'user', at: T(31), text: 'با n.' }] };
      APP.S.put(se2);
      const out = APP.liveChatQItems(pid).map(x => x.t); APP.S.del(se.id); APP.S.del(se2.id); return out;
    });
    chk(r.q.length === 2 && r.q.some(t => /مجهول دقیقاً کدام عدد/.test(t)) && r.q.some(t => /یک نفر نمره‌اش عوض شود/.test(t)), 'close B·D1 s14: a chat-closed problem lists only the questions before its chat_solved reply ' + J(r.q));
    chk(!r.q.some(t => /n−1|بین ۰ و ۱|کمکت کرد|تخمین/.test(t)), 'close B·D1/D2 s14: nothing from the closure reply or after it (same session or another) ' + J(r.q));
  });

  // ================= meta — RC2b (عینِ پیام‌های سناریو) =================
  await section('meta', async () => {
    const r = info.meta = {};
    r.q = await opts({ msgs: [
      { text: 'برای n=2 چه می‌شود؟' },
      { text: 'پیش از خواب فقط یک پرسشِ کوتاه: کدام پرسش بیشتر از همه کمکت کرد؟' },
      { text: 'خیلی خوب. از پرسش‌هایی که در این گفت‌وگو پرسیدم، کدام بیشتر کمکت کرد؟' },
      { text: 'یک پرسشِ دیگرِ بازنگری: این نوع مسئله برایت چطور بود — کدام بخشش را دوست داشتی و کدامش را نه؟' }] });
    chk(r.q.length === 1 && r.q[0] === 'برای n=2 چه می‌شود؟', 'meta A·D5 s08, B·D2 s14/s18, D·1 s38: the look-back meta questions (best question, taste) are never options ' + J(r.q));
  });

  // ================= guess — RC2c (عینِ پیام‌های سناریو) =================
  await section('guess', async () => {
    const r = info.guess = {};
    r.s09 = await opts({ guesses: { 1: { guess: 'حدود ۵۰۰ هزار تومن' } }, msgs: [{ text: 'هزینهٔ هر کیک را خودت پیدا کردی — یک دادهٔ واقعی. «۸۰۰ هزار» را درست یا نادرست نمی‌گویم؛ حدسی است که روی «همان ۴۰ تا، حتی با قیمتِ دو برابر» بنا شده. چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟' }] });
    chk(J(notes(r.s09)) === J(['۸۰۰ هزار']), 'guess A·D2 s09: the note is the guess the message quoted («۸۰۰ هزار»), never the recorded «حدود ۵۰۰ هزار تومن» ' + J(r.s09));
    r.s01 = await opts({ guesses: { 1: { guess: 'اجارهٔ بلندمدت با سقف افزایش سالانه هر دو شرط را برآورده می‌کند' } }, msgs: [{ text: 'خوب که کارتِ فهم را خودت ثبت کردی. «همهٔ ۴۷ ستون یه جوری ربط دارن» را درست یا غلط نمی‌خوانم؛ حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام ستون می‌تواند ردش کند — ستونی که روی هیچ‌کدام از دو شرطِ خودت (هفت سال ثبات، خرج زیرِ ۴۰٪) اثرِ محسوس ندارد؟' }] });
    chk(r.s01.length === 1 && !/اجارهٔ بلندمدت/.test(r.s01[0]) && /۴۷ ستون/.test(r.s01[0]), 'guess A·D2 s01: the option carries its own quoted guess; the recorded «اجارهٔ بلندمدت…» never appears ' + J(r.s01));
    r.s11d = await opts({ guesses: { 1: { guess: 'پوشش هست؛ فقط کدم کند است' } }, msgs: [{ text: '"اصلاً نمی‌شود" حدسِ تازهٔ توست، و ۲×۲ و ۴×۴ شاهدهای اولش. پیش از اثبات: چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟' }] });
    chk(J(r.s11d) === J(['چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟ (حدسِ تو: «اصلاً نمی‌شود»)']), 'guess B·D1 s11d: the note names the guess the message quoted, and the verbless head «پیش از اثبات:» goes ' + J(r.s11d));
    r.s21 = await opts({ guesses: { 1: { guess: 'حرکتِ اول یک کیشِ وزیر است که درست نزده‌ام', at: '2026-10-17T09:30:00.000Z' } }, msgs: [{ text: 'باشه، جواب را نمی‌گویم. «رخ بی‌فایده است» را درست یا غلط نمی‌گویم — فعلاً حدس است. تو را به «🔭 مسئلهٔ حل‌نشدهٔ خودم» می‌برم تا ثبتش کنیم. یک پرسش: این حدس را چطور می‌آزمایی — با کدام وارسی یا حالتِ خاص؟' }] });
    chk(J(notes(r.s21)) === J(['رخ بی‌فایده است']), 'guess C·V1 s21: «این حدس» names the guess quoted in the same message, not the later queen-check guess ' + J(r.s21));
    r.s28 = await opts({ guesses: { 1: { guess: '۱/۲' } }, msgs: [{ text: 'فهرستِ همهٔ حالت‌ها همان آزمونی بود که خودت نوشته بودی، و حدست را خودت با آن رد کردی — این کارِ درستِ کسی است که مسئله را حل می‌کند. «حل شد» را این‌جا تأیید نمی‌کنم؛ یک پرسش: از راهِ دیگری هم به ۱/۳ می‌رسی — مثلاً با حالتی خاص یا شمردنِ دیگری وارسی‌اش کنی؟ بعد در صفحه «✅ حل شد» و بازنگری.' }] });
    chk(r.s28.length === 1 && notes(r.s28).length === 0, 'guess C·V1 s28: «وارسی‌اش» refers to the new result ۱/۳ — no «(حدسِ تو: «۱/۲»)» ' + J(r.s28));
  });

  // ================= label / ana — RC2d (عینِ پیام‌های سناریو) =================
  await section('label', async () => {
    const r = info.label = {};
    const M = [
      ['و یک پرسشِ آخر، کوتاه: نتیجه را با عددِ واقعی جای‌گذاری کردی؟', 'نتیجه را با عددِ واقعی جای‌گذاری کردی؟'],
      ['یک قدم دقیق‌تر: کدام داده هنوز در طرحت نیامده؟', 'کدام داده هنوز در طرحت نیامده؟'],
      ['میانهٔ راه: تا این‌جا کدام شرط را به کار برده‌ای؟', 'تا این‌جا کدام شرط را به کار برده‌ای؟'],
      ['فقط یک چیز: واحدِ جوابت چیست؟', 'واحدِ جوابت چیست؟'],
      ['پیش از تحویل یک وارسیِ کوتاه: جمعِ سه سهم صد درصد می‌شود؟', 'جمعِ سه سهم صد درصد می‌شود؟'],
      ['هنوز گامی ننوشته‌ای که وارسی‌اش کنیم، پس پرسشِ دیگری از همین فهرست: برای استقرا، حالتِ پایه را وارسی کرده‌ای؟', 'برای استقرا، حالتِ پایه را وارسی کرده‌ای؟'],
      ['وقتی به جواب رسیدی، «حل شد» را بزن. پیش از آن: نتیجه را وارسی کن — با یک حالتِ خاص درست درمی‌آید؟', 'نتیجه را وارسی کن — با یک حالتِ خاص درست درمی‌آید؟'],
      ['در صفحه‌ات فقط یک شاخه بن‌بست شد. پیش از رها کردنِ کلِ راه: کدام حلقه دقیقاً شکست؟', 'پیش از رها کردنِ کلِ راه: کدام حلقه دقیقاً شکست؟'],
      ['پس همین را بگو: کجا خط می‌کشی — چه چیزی را عمداً بیرون می‌گذاری؟', null]
    ];
    r.q = []; for (const [t, w] of M) { const q = await opts({ msgs: [{ text: t }] }); r.q.push(q); if (w) chk(q.length === 1 && q[0] === w, 'label D·7/D·8/C·V3: «' + t.slice(0, 50) + '…» ⇒ «' + w + '» ' + J(q)); }
    chk(r.q[8].length === 1 && r.q[8][0].indexOf('پس همین را بگو: کجا خط می‌کشی') === 0, 'label control s01: a head with a verb and an anaphor («همین را بگو:») stays ' + J(r.q[8]));
  });

  // ================= rep — RC2e (عینِ پیام‌های سناریو) =================
  await section('rep', async () => {
    const r = info.rep = {};
    r.q = await opts({ msgs: [
      { text: 'کارِ درستی کردی: حدس زدی و حدست را با واقعیت آزمودی — «باید حدس بزنید، اما حدس خود را نیز بررسی کنید». حالا که حدسِ «خرید بهتر است» رد شد: داده‌ای که کنار گذاشته بودی (قیمت متری محله‌های نزدیک مهدکودک) هنوز بی‌ربط است، یا شاید همان عنصرِ غایب باشد؟' },
      { text: 'خوب است که ثبتش کردی. پیش از گامِ بعد، همان پرسش: حالا که حدسِ خرید رد شد، قیمتِ متریِ محله‌های نزدیک مهدکودک — که با دلیل کنار گذاشته بودی — هنوز بی‌ربط است؟' }] });
    chk(r.q.length === 1 && /^حالا که حدسِ خرید رد شد، قیمتِ متریِ/.test(r.q[0]), 'rep A·D3 s01: the message that says «همان پرسش» collapses with the earlier question — one option, the latest wording, without the frame ' + J(r.q));
  });

  console.log(JSON.stringify(info).slice(0, 12000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
