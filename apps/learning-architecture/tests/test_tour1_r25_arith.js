// تورِ پولیا (دستهٔ ۱، دورِ ۲۵، سهمِ «arith» — ۲۰۲۶-۱۱-۱۱) — DECISIONS_R25 P2 «حسابِ صفحه» (S1 D25-12؛ S2 C25-1، A25-8، B25·D5/D14، B_s D1) + روشن‌سازی‌های C8/C9/C10.
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۵: pwD2 p1/p7 (D25-12 «4/2 = 1/1 + 1/2 + 1/2»، «7/1460 = 1/210 + 1/30660»)، s25 p1 (C25-1 «با ۱/۲۰ میشه ۴/۵»)،
//           aA4 p6 (A25-8 «۲ و خرده‌ای، یعنی ۲٫۵۷»)، pwA2 p1 (A25-8-b «۲ و یه چیزی»)، pwB2 p1/p4/p7 (B25·D5 زنجیرهٔ «=»)، B_s pwB2 p1 («−۳ + ۴۲ = ۳۹»)،
//           pwB1 p1 و bp2 p4 (B25·D14 کیلوژول ⇒ کیلووات‌ساعت، «یه متر صد میلی‌متره»، ۰٫۵۹ از ۰٫۲۹۴)، bp3 p9 («درست» کنارِ ✗)، pwD1 (حساب‌های درستِ یک متنِ بلند)
//  bank     همهٔ ۵۸ ورودیِ P2 در بانکِ مستقلِ tests/variants/VARIANTS_R25.json (OK = بی «نادرست»؛ FLAG = همان حلقه؛ neg = اصلاً سنجیده نشود)
//  clock    روزِ صفحه منجمد است (APP.today)؛ هیچ انتظاری به تاریخِ تقویم بسته نیست
// LLA_FILE = ساختِ دیگر (برای «قرمزِ نخست»: ساختِ BASE25)؛ ONLY=runners,page,later,guards,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = JSON.parse(fs.readFileSync(process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R25.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R25.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)), 'utf8'));

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { bank: {}, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
  const T0 = '2026-11-11';   // روزِ منجمدِ صفحه (هیچ انتظاری به آن بسته نیست)
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0; window.__noNav = true;
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    window.__turn = async (text, reply, actions) => {
      const n0 = __calls.length; __q.push(R({ reply: reply || 'باشه.', actions: actions || [] }));
      await APP.ASSIST.send(text); __q.length = 0;
      const all = __calls.slice(n0), c = all.filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {};
      return { user: c.user || '', n: all.length };
    };
    window.__fresh = (view) => { APP.go(view || 'home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p.id; };
  }, T0);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const turn = (text, reply, actions) => p.evaluate(([t, r, a]) => __turn(t, r, a), [text, reply || '', actions || []]);
  const fresh = (v) => p.evaluate((v) => __fresh(v), v || 'home');
  const wipe = () => p.evaluate(() => __wipe());
  const nat = { role: 'self', nat: 'practical', stuck: false, fail: false };
  const csn = (o) => Object.assign({ do: 'coach_state' }, nat, o);
  const PR = (pid) => p.evaluate((pid) => { const s = __cur(); const pr = APP.STORY.priorFor(pid ? null : s, pid || ''); return pr ? JSON.parse(JSON.stringify(pr)) : null; }, pid || '');
  const PQ = (pid) => p.evaluate((pid) => APP.STORY.priorTurnQ(pid ? null : __cur(), pid || ''), pid || '');
  const ppr = (text, prior, o) => turn(text, (o && o.reply) || 'کارتان را دیدم.', [csn(Object.assign({ ph: 'e', said: [], prior }, (o && o.cs) || {}))]);
  const AC = (t, ctx) => p.evaluate(([t, ctx]) => APP.STORY.arithChk(t, ctx || undefined).map(c => ({ expr: c.expr, said: String(c.saidT || c.said), ok: c.ok, unit: c.unit || '', kind: c.kind || '', valT: c.valT || '', unread: !!c.unitUnread })), [t, ctx || '']);
  const sv = (pr) => pr && pr.steps.map(x => [x.n, x.verdict, x.chk, x.depWrong]);
  const FALSE_X = /نمی‌خواند/;

  // ================= runners — جمله‌های خودِ گزارش‌ها، از راهِ نوبتِ واقعی (گزارشِ مدل ⇒ سنجشِ صفحه) =================
  await section('runners', async () => {
    // --- D25-12 (S1) pwD2 p1: «4/2 = 1/1 + 1/2 + 1/2» — حکمِ ✓ ِ مربی می‌ماند؛ ازسرگیری روی گامِ ۴ ِ واقعاً نادرست
    await wipe(); await fresh();
    const D1 = 'سلام. دارم روی حدسِ اردوش–اشتراوس کار می‌کنم: برای هر عددِ طبیعیِ n ≥ 2، معادلهٔ 4/n = 1/x + 1/y + 1/z جوابِ طبیعی داره. می‌دونم مسئلهٔ بازه، ولی فکر کنم یه حمله پیدا کردم؛ می‌خوام گام‌به‌گام بسنجی.\nگامِ ۱: کافیه حکم رو برای nهای اول ثابت کنم، چون اگه n = ab و 4/a = 1/x + 1/y + 1/z، پس 4/n = 1/(bx) + 1/(by) + 1/(bz).\nگامِ ۲: برای n = 2: 4/2 = 1/1 + 1/2 + 1/2.\nگامِ ۳: برای nِ اول با n ≡ 3 (mod 4)، یعنی n = 4k+3: 4/n = 1/(k+1) + 1/((k+1)n)، و جملهٔ آخر رو نصف می‌کنم: 1/((k+1)n) = 1/(2(k+1)n) + 1/(2(k+1)n).\nگامِ ۴: برای n ≡ 1 (mod 4): x = (n+3)/4 می‌گیرم؛ پس 4/n − 1/x = 4/n − 4/(n+3) = 12/(n(n+3)) = 3/(n·(n+3)/4)، و هر کسری به شکلِ 3/m همیشه به صورتِ 1/y + 1/z درمیاد.\nگامِ ۵: پس حکم برای همهٔ nها ثابت شد.\nفقط مطمئن نیستم گامِ ۴ کامل باشه.';
    await ppr(D1, [
      { step: 'کاهش به اول‌ها', quote: 'کافیه حکم رو برای nهای اول ثابت کنم', verdict: 'ok' },
      { step: 'n = 2', quote: 'برای n = 2: 4/2 = 1/1 + 1/2 + 1/2', verdict: 'ok' },
      { step: 'n ≡ 3', quote: 'برای nِ اول با n ≡ 3 (mod 4)، یعنی n = 4k+3: 4/n = 1/(k+1) + 1/((k+1)n)', verdict: 'ok' },
      { step: 'n ≡ 1', quote: 'هر کسری به شکلِ 3/m همیشه به صورتِ 1/y + 1/z درمیاد', verdict: 'wrong', why: 'این ادعا ثابت نشده است' },
      { step: 'نتیجه', quote: 'پس حکم برای همهٔ nها ثابت شد', verdict: 'ok', dep: [4] }], { cs: { nat: 'objective' } });
    let pr = await PR(), q = await PQ();
    const ev = await p.evaluate(() => (__cur().coachEv || []).filter(e => e.src === 'prior').map(e => ({ ok: e.ok, prior: e.prior })));
    chk(pr && pr.steps.length === 5 && pr.steps[1].verdict === 'ok' && !FALSE_X.test(pr.steps[1].chk) && /درست/.test(pr.steps[1].chk) && pr.steps[2].verdict === 'ok' && pr.resume === 4 && /گامِ ۴/.test(q) && !/گامِ ۲/.test(q) &&
      ev.some(e => e.ok && e.prior === 2) && !ev.some(e => !e.ok && e.prior === 2),
      'D25-12 pwD2 p1: «4/2 = 1/1 + 1/2 + 1/2» is a correct sum — the coach\'s ✓ stays, resume on step 4, the mind card credits step 2 :: ' + JSON.stringify({ st: sv(pr), resume: pr && pr.resume, q, ev }));
    // --- D25-12 pwD2 p7 ⇒ p9: «4/73 − 1/20 = 7/1460 … 7/1460 = 1/210 + 1/30660»
    await wipe(); await fresh();
    const D7 = 'وارسی کردم: برای 73 با x = 20: 4/73 − 1/20 = 7/1460، و 1460 = 4·5·73؛ مقسوم‌علیه‌های 2 و 5 جمعشون 7 میشه، پس طبقِ همون شرط (این بار با ۷ به‌جای ۳) دو کسرِ واحد درمیاد: 7/1460 = 1/210 + 1/30660. پس خودِ حدس برای 73 درسته، فقط xِ من بد بود. حالا یه حدس به ذهنم رسید: شاید برای هر nِ اولِ ≡ 1 (mod 24) یکی از xهای (n+3)/4 تا (n+3)/4 + 3 همیشه کار کنه.';
    await ppr(D7, [{ step: 'تفاضل', quote: '4/73 − 1/20 = 7/1460، و 1460 = 4·5·73', verdict: 'ok' }, { step: 'دو کسرِ واحد', quote: '7/1460 = 1/210 + 1/30660', verdict: 'ok' }], { cs: { nat: 'objective' } });
    pr = await PR(); q = await PQ();
    chk(pr && pr.steps.length === 2 && pr.steps.every(x => x.verdict === 'ok' && /درست/.test(x.chk)) && pr.resume === 0 && !/جای درنگ/.test(q),
      'D25-12 pwD2 p9: «7/1460 = 1/210 + 1/30660» and «4/73 − 1/20 = 7/1460» hold exactly — never «گامِ ۱ جای درنگ است» :: ' + JSON.stringify({ st: sv(pr), q }));
    // --- C25-1 s25 p1: جمعِ پیاپی «با ۱/۲۰ میشه ۴/۵»
    await wipe(); await fresh();
    const C1 = 'امروز اتفاقی دیدم ۱/۲ + ۱/۶ + ۱/۱۲ = ۳/۴. با ۱/۲۰ میشه ۴/۵! فکر کنم کشف کردم که همیشه 1/(1·2) + 1/(2·3) + … + 1/(n(n+1)) = n/(n+1) میشه. ۱۰ تاشو چک کردم. درسته دیگه؟ ثابت شد.';
    await ppr(C1, [{ step: 'سه جمله', quote: '۱/۲ + ۱/۶ + ۱/۱۲ = ۳/۴', verdict: 'ok' }, { step: 'چهار جمله', quote: 'با ۱/۲۰ میشه ۴/۵', verdict: 'ok' },
      { step: 'تعمیم', quote: 'همیشه 1/(1·2) + 1/(2·3) + … + 1/(n(n+1)) = n/(n+1) میشه', verdict: 'incomplete', why: 'ده نمونه برهان نیست', dep: [2] }], { cs: { nat: 'objective' } });
    pr = await PR(); q = await PQ();
    chk(pr && pr.steps[0].verdict === 'ok' && pr.steps[1].verdict === 'ok' && /درست/.test(pr.steps[1].chk) && !pr.steps[2].depWrong.length && pr.resume === 3 && /گامِ ۳/.test(q),
      'C25-1 s25 p1: «با ۱/۲۰ میشه ۴/۵» is the running sum 3/4 + 1/20 — ✓, step 3 not «وابسته به گامِ ۲», resume on step 3 :: ' + JSON.stringify({ st: sv(pr), q }));
    // --- A25-8 aA4 p6: «۲ و خرده‌ای، یعنی ۲٫۵۷»
    await wipe(); await fresh();
    const A4 = 'بله کافی‌اند، چیزی کم نیست. حالا حساب: عرضِ لازم با چین ۱۸۰ ضربدر ۲ می‌شود ۳۶۰ سانت. ۳۶۰ تقسیم بر ۱۴۰ می‌شود ۲ و خرده‌ای، یعنی ۲٫۵۷ قواره. طولِ هر قواره ۱۵۰ + ۱۰ + ۲۰ + ۱۵ = ۱۹۵ سانت. پس ۲٫۵۷ ضربدر ۱٫۹۵ می‌شود حدودِ ۵ متر. ۵ متر می‌خرم.';
    await ppr(A4, [{ step: 'عرض', quote: '۱۸۰ ضربدر ۲ می‌شود ۳۶۰ سانت', verdict: 'ok' }, { step: 'قواره', quote: '۳۶۰ تقسیم بر ۱۴۰ می‌شود ۲ و خرده‌ای، یعنی ۲٫۵۷ قواره', verdict: 'incomplete', why: 'قواره کسری ندارد' },
      { step: 'طول', quote: 'طولِ هر قواره ۱۵۰ + ۱۰ + ۲۰ + ۱۵ = ۱۹۵ سانت', verdict: 'ok' }, { step: 'خرید', quote: '۲٫۵۷ ضربدر ۱٫۹۵ می‌شود حدودِ ۵ متر', verdict: 'wrong', why: 'با قوارهٔ کامل باید به بالا گرد شود', dep: [2] }], { cs: { nat: 'practical' } });
    pr = await PR();
    chk(pr && pr.steps[1].verdict === 'incomplete' && !FALSE_X.test(pr.steps[1].chk) && pr.steps[0].verdict === 'ok' && pr.steps[2].verdict === 'ok' && pr.steps[3].verdict === 'wrong' && !FALSE_X.test(pr.steps[3].chk) && !/درست/.test(pr.steps[3].chk) && pr.resume === 2,
      'A25-8 aA4 p6: «۲ و خرده‌ای، یعنی ۲٫۵۷» reads 2.57 (360/140 = 2.571…) — the coach\'s ⚠️ stays, never ✗ by the page; the ✗ step 4 carries no «درست» :: ' + JSON.stringify(sv(pr)));
    // --- A25-8-b pwA2 p1: «۲ و یه چیزی» کودک — خارج‌قسمت، نه «۲٫۸»
    await wipe(); await fresh();
    const A2 = 'سلام من آرمانم هشت سالمه. معلممون این سؤالو داده: یه کتاب ۴۸ صفحه داره. روز اول ۱۲ صفحه خوندم، روز دوم دو برابر روز اول خوندم. چند صفحه مونده؟ اگه از روز سوم روزی ۵ صفحه بخونم چند روز دیگه کتاب تموم میشه؟\nمن این جوری حل کردم:\nروز دوم: ۱۲ × ۲ = ۲۴\nدو روز با هم: ۱۲ + ۲۴ = ۳۴\nمونده: ۴۸ − ۳۴ = ۱۴\nروزی ۵ تا: ۱۴ تقسیم بر ۵ میشه ۲ و یه چیزی. پس ۲ روز.\nدرسته؟';
    await ppr(A2, [{ step: 'روز دوم', quote: '۱۲ × ۲ = ۲۴', verdict: 'ok' }, { step: 'دو روز', quote: '۱۲ + ۲۴ = ۳۴', verdict: 'ok' }, { step: 'مانده', quote: '۴۸ − ۳۴ = ۱۴', verdict: 'ok' },
      { step: 'روزها', quote: '۱۴ تقسیم بر ۵ میشه ۲ و یه چیزی. پس ۲ روز', verdict: 'wrong', why: 'آن «یه چیزی» هم یک روز می‌خواهد' }], { cs: { nat: 'objective' } });
    pr = await PR(); q = await PQ();
    chk(pr && pr.steps[0].verdict === 'ok' && pr.steps[1].verdict === 'wrong' && FALSE_X.test(pr.steps[1].chk) && !/۳۶/.test(pr.steps[1].chk) && !/۳۶/.test(q) && pr.steps[2].verdict === 'ok' && pr.steps[2].depWrong.indexOf(2) >= 0 &&
      pr.steps[3].verdict === 'wrong' && !FALSE_X.test(pr.steps[3].chk) && !/۲٫۸|۲\.۸|درست/.test(pr.steps[3].chk + pr.steps[3].chkM) && pr.resume === 2,
      'pwA2 p1: «۱۲ + ۲۴ = ۳۴» caught without leaking 36; «۱۴ تقسیم بر ۵ میشه ۲ و یه چیزی» is right as a quotient — no «۲٫۸» framing, the coach\'s ✗ keeps its own reason :: ' + JSON.stringify({ st: sv(pr), m: pr && pr.steps[3].chkM, q }));
    // --- B25·D5 pwB2 p1: زنجیرهٔ «a×b + … = ۳٫۶ + ۲٫۴ + … = ۸٫۷»
    await wipe(); await fresh();
    const B2 = 'سلام. یه تصمیمِ بزرگ دارم و خودم تا یه جایی جلو رفتم، می‌خوام ببینی درست رفتم یا نه.\nکاری که کردم:\n۱. معیارها رو نوشتم: حقوق، هزینه‌ی مسکن، مدرسه‌ی بچه‌ها، رفت‌وآمد.\n۲. وزن دادم: حقوق ۴۰٪، مسکن ۳۰٪، مدرسه ۲۵٪، رفت‌وآمد ۱۵٪.\n۳. به هر گزینه از ۱۰ نمره دادم: شیراز — حقوق ۹، مسکن ۸، مدرسه ۶، رفت‌وآمد ۸. تهران — حقوق ۶، مسکن ۴، مدرسه ۸، رفت‌وآمد ۳.\n۴. جمعِ وزنی: شیراز = ۰٫۴×۹ + ۰٫۳×۸ + ۰٫۲۵×۶ + ۰٫۱۵×۸ = ۳٫۶ + ۲٫۴ + ۱٫۵ + ۱٫۲ = ۸٫۷؛ تهران = ۲٫۴ + ۱٫۲ + ۲ + ۰٫۴۵ = ۶٫۰۵.\n۵. پس شیراز، با اختلافِ زیاد. تا آخرِ ماه باید جواب بدم. درسته؟';
    await ppr(B2, [{ step: 'معیارها', quote: 'معیارها رو نوشتم: حقوق، هزینه‌ی مسکن، مدرسه‌ی بچه‌ها، رفت‌وآمد', verdict: 'incomplete', why: 'معیاری که خودش گفته جا افتاده' },
      { step: 'جمعِ وزنی', quote: 'شیراز = ۰٫۴×۹ + ۰٫۳×۸ + ۰٫۲۵×۶ + ۰٫۱۵×۸ = ۳٫۶ + ۲٫۴ + ۱٫۵ + ۱٫۲ = ۸٫۷؛ تهران = ۲٫۴ + ۱٫۲ + ۲ + ۰٫۴۵ = ۶٫۰۵', verdict: 'ok', dep: [1] }], { cs: { nat: 'life' } });
    pr = await PR(); q = await PQ();
    chk(pr && pr.steps.length === 2 && pr.steps[1].verdict === 'ok' && !FALSE_X.test(pr.steps[1].chk) && /درست/.test(pr.steps[1].chk) && pr.resume === 1 && !FALSE_X.test(q),
      'B25·D5 pwB2 p1: the chained «= ۳٫۶ + ۲٫۴ + ۱٫۵ + ۱٫۲ = ۸٫۷» and «= ۶٫۰۵» are correct sums — never «نمی‌خواند», the coach\'s ✓ is not forced to ✗ :: ' + JSON.stringify({ st: sv(pr), q }));
    for (const t of ['شیراز = ۰٫۳×۹ + ۰٫۲×۸ + ۰٫۲×۶ + ۰٫۱×۸ + ۰٫۲×۲ = ۲٫۷ + ۱٫۶ + ۱٫۲ + ۰٫۸ + ۰٫۴ = ۶٫۷. تهران = ۱٫۸ + ۰٫۸ + ۱٫۶ + ۰٫۳ + ۱٫۸ = ۶٫۳.',
      'وارسی کردم: اگه وزنِ مادر رو حتی ۳۰ بگیرم و از حقوق کم کنم، شیراز = ۰٫۲×۹ + ۰٫۲×۸ + ۰٫۲×۶ + ۰٫۱×۸ + ۰٫۳×۷ = ۱٫۸ + ۱٫۶ + ۱٫۲ + ۰٫۸ + ۲٫۱ = ۷٫۵ و تهران = ۱٫۲ + ۰٫۸ + ۱٫۶ + ۰٫۳ + ۲٫۷ = ۶٫۶. باز شیراز.']) {
      const r = await AC(t); chk(r.length === 3 && r.every(c => c.ok), 'B25·D5 pwB2 p4/p7: three links, all hold :: ' + JSON.stringify(r)); }
    // --- B_s D1 pwB2 p1: «−۳ + ۴۲ = ۳۹» (منهای یونیکد)
    await wipe(); await fresh();
    await ppr('گام ۳: سهام رو قطعی گرفتم. گام ۴: جمعِ امتیازها: −۳ + ۴۲ = ۳۹. پس گزینهٔ دوم بهتره.', [{ step: 'جمع', quote: '−۳ + ۴۲ = ۳۹', verdict: 'ok' }], { cs: { nat: 'life' } });
    pr = await PR();
    chk(pr && pr.steps[0].verdict === 'ok' && !FALSE_X.test(pr.steps[0].chk) && !/لو نده/.test(pr.steps[0].chkM), 'B_s D1: «−۳ + ۴۲ = ۳۹» is read with its sign — never «حسابِ «۳ + ۴۲» با «۳۹» نمی‌خواند» :: ' + JSON.stringify(sv(pr)));
    // --- B25·D14 pwB1 p1: کیلوژول ⇒ کیلووات‌ساعت؛ ۰٫۵۹ از ۰٫۲۹ ِ گردشدهٔ خودش
    await wipe(); await fresh();
    const B1 = 'سلام. من نگارم، مهندس تأسیساتم. خودم حسابش رو کردم، می‌خوام ببینی درسته یا نه.\nگامِ ۱: جرمِ آب: ۲ متر مکعب = ۲۰۰۰ کیلوگرم.\nگامِ ۲: انرژی: E = mgh = 2000 × 9.81 × 15 = 294300 ژول = ۲۹۴٫۳ کیلوژول، یعنی حدودِ ۰٫۲۹ کیلووات‌ساعت.\nگامِ ۳: با بازده ۵۰٪، انرژیِ برقیِ روزانه = ۰٫۲۹ ÷ ۰٫۵ = ۰٫۵۹ کیلووات‌ساعت.\nگامِ ۴: توانِ پمپ برای ۲۰ دقیقه: P = 294300 ÷ 1200 = 245 وات هیدرولیکی؛ با بازده ۵۰٪ میشه ۴۹۰ وات برق.\nگامِ ۵: پنل: ۰٫۵۹ کیلووات‌ساعت ÷ ۴٫۵ ساعت = ۱۳۱ وات؛ پس یه پنلِ ۱۵۰ واتی کافیه.';
    await ppr(B1, [{ step: 'جرم', quote: '۲ متر مکعب = ۲۰۰۰ کیلوگرم', verdict: 'ok' },
      { step: 'انرژی', quote: 'E = mgh = 2000 × 9.81 × 15 = 294300 ژول = ۲۹۴٫۳ کیلوژول، یعنی حدودِ ۰٫۲۹ کیلووات‌ساعت', verdict: 'ok' },
      { step: 'برق', quote: 'انرژیِ برقیِ روزانه = ۰٫۲۹ ÷ ۰٫۵ = ۰٫۵۹ کیلووات‌ساعت', verdict: 'ok', dep: [2] },
      { step: 'توان', quote: 'P = 294300 ÷ 1200 = 245 وات هیدرولیکی', verdict: 'ok' }], { cs: { nat: 'practical' } });
    pr = await PR();
    chk(pr && pr.steps[0].verdict === 'ok' && !pr.steps[0].chk && pr.steps[1].verdict === 'wrong' && /واحد \(تبدیلِ کیلو ?ژول به کیلو ?وات ?ساعت\)/.test(pr.steps[1].chk) && !/۰٫۰۸|0\.08/.test(pr.steps[1].chk) && /۰٫۰۸۱۷۵/.test(pr.steps[1].chkM) &&
      pr.steps[2].verdict === 'ok' && !FALSE_X.test(pr.steps[2].chk) && pr.steps[2].depWrong.indexOf(2) >= 0 && pr.steps[3].verdict === 'ok' && !pr.steps[3].depWrong.length && pr.resume === 2,
      'B25·D14 pwB1 p1: the kJ ⇒ kWh slip is caught by the page (the correct number only in the coach line); «۰٫۲۹ ÷ ۰٫۵ = ۰٫۵۹» is not flagged (0.29 is her own rounding); step 4 is not dependent :: ' + JSON.stringify({ st: sv(pr), m: pr && pr.steps[1].chkM }));
    // --- B25·D14 bp2 p4: «یه متر صد میلی‌متره … ۱.۵ متر»
    await wipe(); await fresh();
    await ppr('یعنی ۱۵۰ میلی‌متر رو متر کنم؟ یه متر صد میلی‌متره دیگه، پس میشه ۱.۵ متر. ۵۰ × ۱.۵ = ۷۵ متر مکعب! عجب، پس کلی آب جمع میشه.',
      [{ step: 'تبدیل', quote: 'یه متر صد میلی‌متره دیگه، پس میشه ۱.۵ متر', verdict: 'ok' }, { step: 'حجم', quote: '۵۰ × ۱.۵ = ۷۵ متر مکعب', verdict: 'wrong', why: 'بر تبدیلِ نادرست تکیه دارد', dep: [1] }], { cs: { nat: 'practical' } });
    pr = await PR();
    chk(pr && pr.steps[0].verdict === 'wrong' && /واحد \(تبدیلِ متر به میلی ?متر\)/.test(pr.steps[0].chk) && !/۱۰۰۰|هزار/.test(pr.steps[0].chk) && pr.steps[1].verdict === 'wrong' && !/درست/.test(pr.steps[1].chk) && /می‌خواند/.test(pr.steps[1].chk) && pr.resume === 1,
      'B25·D14 bp2 p4: «یه متر صد میلی‌متره» is a wrong unit factor (caught, 1000 not leaked); beside the ✗ step 2 no «درست» :: ' + JSON.stringify(sv(pr)));
    // --- B25·D14 bp3 p9: «۳ × ۴ = ۱۲ متر مربع؟» ✗ ِ مربی — کنارش «درست» نمی‌آید
    await wipe(); await fresh();
    await ppr('۵ × ۵ = ۲۵، ۳ × ۳ = ۹. دیوار یکی از اون دو ضلعه، پس ۲۵ منهای ۹ = ۱۶، جذرش ۴. دیوار ۴ متره! همون جواب کتاب. حالا مساحت مثلث: ۳ × ۴ = ۱۲ متر مربع؟',
      [{ step: 'دیوار', quote: '۲۵ منهای ۹ = ۱۶، جذرش ۴', verdict: 'ok' }, { step: 'مساحت', quote: 'مساحت مثلث: ۳ × ۴ = ۱۲ متر مربع', verdict: 'wrong', why: 'مساحتِ مثلث نصفِ قاعده در ارتفاع است' }], { cs: { nat: 'objective' } });
    pr = await PR(); q = await PQ();
    chk(pr && pr.steps[0].verdict === 'ok' && /درست/.test(pr.steps[0].chk) && pr.steps[1].verdict === 'wrong' && !/درست/.test(pr.steps[1].chk) && !/درست/.test(pr.steps[1].chkM) && /«۳ × ۴ = ۱۲» را صفحه سنجید و می‌خواند/.test(pr.steps[1].chk) && !/از جای دیگری است/.test(pr.steps[1].chk) && !/درست/.test(q.replace(/درست است؟/g, '')),
      'B25·D14 bp3 p9: beside the ✗ step the line says which arithmetic the page read and that the fault is not there — never the word «درست» :: ' + JSON.stringify({ st: sv(pr), q }));
    // --- pwD1: حساب‌های درستِ یک متنِ بلند همه خوانده می‌شوند؛ تنها «۱۷۰۰ ثانیه یعنی ۱۷ دقیقه» نادرست
    const d1 = await AC('گامِ ۱: ۳۰۰۰ تقسیم بر ۹۰ میشه ۳۳٫۳، پس روزی ۳۴ واژهٔ تازه.\nگامِ ۲: برای یاد گرفتنِ هر کارتِ تازه حدودِ ۳۵ ثانیه وقت می‌ذارم؛ ۳۴ ضربدر ۳۵ میشه ۱۱۹۰ ثانیه، یعنی حدودِ ۲۰ دقیقه.\nگامِ ۳: هر کارت تا امتحان حدودِ ۵ بار مرور میشه، پس روزی ۳۴ ضربدر ۵ میشه ۱۷۰ مرور.\nگامِ ۴: هر مرور ۱۰ ثانیه طول می‌کشه؛ ۱۷۰ ضربدر ۱۰ میشه ۱۷۰۰ ثانیه یعنی ۱۷ دقیقه.\nگامِ ۵: پس کلِ کارِ هر روز ۲۰ به‌علاوهٔ ۱۷ میشه ۳۷ دقیقه، که توی ۴۰ دقیقهٔ مترو جا میشه.');
    chk(d1.length === 7 && d1.filter(c => !c.ok).length === 1 && d1.filter(c => !c.ok)[0].unit === 'تبدیلِ ثانیه به دقیقه', 'pwD1 p1: seven checks, one wrong (1700 s is not 17 min) :: ' + JSON.stringify(d1));
    const d2 = await AC('مرورها: ۳۸ ضربدر ۵ میشه ۱۹۰؛ فراموشی ۱۹۰ ضربدر ۰٫۱۵ میشه ۲۸٫۵، ضربدر ۲ میشه ۵۷؛ جمع ۱۹۰ به‌علاوهٔ ۵۷ میشه ۲۴۷ نمایش. ۲۴۷ ضربدر ۸ میشه ۱۹۷۶ ثانیه، یعنی حدودِ ۳۳ دقیقه.\nکل: ۲۲ به‌علاوهٔ ۳۳ میشه ۵۵ دقیقه');
    chk(d2.length === 7 && d2.every(c => c.ok) && d2.some(c => c.kind === 'run'), 'pwD1 p7: the running «، ضربدر ۲ میشه ۵۷» and «به‌علاوهٔ» are read; all hold :: ' + JSON.stringify(d2));
    const a4 = await AC('نه، بس نیست! پس باید به بالا گرد کنم: ۳ قواره. ۳ ضربدر ۱۹۵ می‌شود ۵۸۵ سانت، یعنی ۵ متر و ۸۵ سانت. با ۵ متر کم می‌آوردم!');
    chk(a4.length === 2 && a4.every(c => c.ok), 'aA4 p7: «۵۸۵ سانت، یعنی ۵ متر و ۸۵ سانت» is a compound quantity (5.85 m) :: ' + JSON.stringify(a4));
    // --- دقت: عددِ گویا، نه ممیزِ شناور (۰٫۱ + ۰٫۲ = ۰٫۳ دقیق است؛ ۰٫۱ + ۰٫۲ = ۰٫۳۰۰۰۰۰۰۰۰۰۰۰۰۰۰۰۴ نادرست)
    const ex = await AC('۰٫۱ + ۰٫۲ = ۰٫۳ و ۰٫۱ + ۰٫۲ = ۰٫۳۰۰۰۰۰۰۰۰۰۰۰۰۰۰۰۴ و 1/3 + 1/3 + 1/3 = 1 و 1/3 + 1/3 = 0.6666666666666666 + 0 و 123456789123456789 × 1000000007 = 123456789987654312864197523');
    chk(ex.length === 5 && ex[0].ok && !ex[1].ok && ex[2].ok && !ex[3].ok && ex[4].ok, 'exact rational arithmetic: no float tolerance accepts a wrong sum or rejects a right one :: ' + JSON.stringify(ex));
  });

  // ================= page — 🔭 «کارِ پیشینِ تو»: کنارِ ✗ هرگز «درست» (بانک #87)؛ کنارِ ✓ می‌تواند (#106) =================
  await section('page', async () => {
    await wipe(); await fresh();
    const pid = await p.evaluate(() => { const pid = __live('مساحتِ مثلث', 'مساحتِ مثلثی با قاعدهٔ ۳ و ارتفاعِ ۴ چقدر است؟'); APP.liveBindSession(pid, __cur()); return pid; });
    await ppr('حل کردم. ۲۵ منهای ۹ = ۱۶ پس دیوار ۴ متره. مساحت مثلث: ۳ × ۴ = ۱۲ متر مربع. درسته؟',
      [{ step: 'دیوار', quote: '۲۵ منهای ۹ = ۱۶', verdict: 'ok' }, { step: 'مساحت', quote: 'مساحت مثلث: ۳ × ۴ = ۱۲ متر مربع', verdict: 'wrong', why: 'مساحتِ مثلث نصفِ قاعده در ارتفاع است' }], { cs: { nat: 'objective' } });
    const rows = await p.evaluate((pid) => { APP.go('lprob', pid); return [...document.querySelectorAll('#main .lp-prior .lp-prior-step')].map(r => ({ v: r.getAttribute('data-v'), t: r.querySelector('span').textContent })); }, pid);
    const bad = rows.filter(r => r.v === 'wrong')[0], good = rows.filter(r => r.v === 'ok')[0];
    info.page = rows;
    chk(rows.length === 2 && bad && !/درست/.test(bad.t.replace(/✗ نادرست/g, '')) && /می‌خواند؛ ایرادِ این گام در خودِ این حساب نیست/.test(bad.t) && !/از جای دیگری/.test(bad.t), 'bank#87: no «درست» beside the ✗ on 🔭 :: ' + JSON.stringify(rows));
    chk(good && /حسابِ عددی‌اش را صفحه سنجید: درست/.test(good.t), 'bank#106: «درست» may stand beside a ✓ step :: ' + JSON.stringify(rows));
    info.bank[86] = !!(bad && !/درست/.test(bad.t.replace(/✗ نادرست/g, ''))); info.bank[105] = !!(good && /درست/.test(good.t));
    info.nc[86] = '🔭 line asserted here; 📜 (dossier) prints priorLines, which is the prior ledger (fixer «prior», B25·D6: the coach line must not reach 📜) — the text both use comes from A.STORY.arithNote, asserted «درست»-free for a ✗ step';
  });

  // ================= later — حسابِ پیام‌های بعدیِ همان مسئله (B_s؛ بانک #88، #89، #107) =================
  await section('later', async () => {
    await wipe(); await fresh();
    await ppr('می‌خوام دیوارِ حیاط رو بچینم و خودم حساب کردم. گام ۱: طولِ دیوار ۶ متره و هر ردیف ۲۵ تا آجر می‌خواد. گام ۲: ارتفاع ۱۸ ردیف میشه.',
      [{ step: 'ردیف', quote: 'هر ردیف ۲۵ تا آجر می‌خواد', verdict: 'ok' }, { step: 'ارتفاع', quote: 'ارتفاع ۱۸ ردیف میشه', verdict: 'ok' }], { cs: { nat: 'practical' } });
    await p.evaluate(() => { window.__day = '2026-11-12'; });
    let u = await turn('پس ۱۸ × ۲۵ = ۴۶۰ تا آجر لازم دارم', 'باشه.', [csn({ ph: 'e', said: [] })]);
    let H = head(u.user), L = H.split('\n').filter(l => /حسابِ صفحه|✗ «|✓ «|لو نده/.test(l));
    info.bank[87] = /# حسابِ صفحه روی همین پیام/.test(H) && /✗ «۱۸ × ۲۵» را «۴۶۰» نوشته — حسابِ صفحه: ۴۵۰/.test(H) && /عددِ درست را لو نده/.test(H);
    chk(info.bank[87], 'bank#88: the page\'s check also runs on a LATER chat message of a prior-work problem (18 × 25 = 450, not 460) :: ' + JSON.stringify(L));
    await wipe(); await fresh();
    await ppr('می‌خوام دیوارِ حیاط رو بچینم و خودم حساب کردم. گام ۱: طولِ دیوار ۶ متره و هر ردیف ۲۵ تا آجر می‌خواد. گام ۲: ارتفاع ۱۸ ردیف میشه.',
      [{ step: 'ردیف', quote: 'هر ردیف ۲۵ تا آجر می‌خواد', verdict: 'ok' }, { step: 'ارتفاع', quote: 'ارتفاع ۱۸ ردیف میشه', verdict: 'ok' }], { cs: { nat: 'practical' } });
    u = await turn('پس ۱۸ × ۲۵ = ۴۵۰ تا آجر لازم دارم', 'باشه.', [csn({ ph: 'e', said: [] })]); H = head(u.user);
    info.bank[88] = /✓ «۱۸ × ۲۵ = ۴۵۰» می‌خواند/.test(H) && !/✗ «/.test(H) && !/لو نده/.test((H.split('# حسابِ صفحه')[1] || '').split('\n#')[0]);
    chk(info.bank[88], 'bank#89: the correct later product is read as right — no ✗, nothing doubtful :: ' + JSON.stringify(H.split('\n').filter(l => /حسابِ صفحه|✗ «|✓ «/.test(l))));
    u = await turn('قبلاً نوشته بودم ۱۸ × ۲۵ = ۴۶۰ که غلط بود؛ درستش ۴۵۰ ـه', 'باشه.', [csn({ ph: 'e', said: [] })]); H = head(u.user);
    info.bank[106] = !/✗ «/.test(H);
    chk(info.bank[106], 'bank#107: her own quoted old wrong product («… که غلط بود») is not flagged again :: ' + JSON.stringify(H.split('\n').filter(l => /حسابِ صفحه|✗ «|✓ «/.test(l))));
    info.nc[106] = 'part 2 («her new value 450 fixes the step») is the prior ledger\'s merge of her own fix (P1, fixer «prior», C8) — here: the quoted old product is never a new ✗ (asserted); A.STORY.arithChk is the check C8 applies';
    // بی «کارِ پیشین» و بی کارِ خودش در پیام، حسابِ درست بلوکی نمی‌آورد؛ حسابِ نادرست می‌آورد
    await wipe(); await fresh();
    u = await turn('راستی ۷ × ۸ = ۵۶ بود دیگه؟', 'بله.', [csn({ ph: 'u', said: [] })]);
    chk(!/# حسابِ صفحه روی همین پیام/.test(head(u.user)), 'no block for a right sum outside prior work :: ' + head(u.user).slice(-300));
    u = await turn('پس ۷ × ۸ = ۵۴ میشه', 'باشه.', [csn({ ph: 'u', said: [] })]);
    chk(/✗ «۷ × ۸» را «۵۴» نوشته — حسابِ صفحه: ۵۶/.test(head(u.user)), 'a wrong sum in any message reaches the coach with the page\'s computation :: ' + head(u.user).slice(-400));
    const sysLen = await p.evaluate(() => (APP.ASSIST.SYS || '').length);
    chk(sysLen <= 20000, 'AS.SYS stays within the cap (nothing added to it) :: ' + sysLen);
  });

  // ================= guards — شبیه‌هایی که نباید «نادرست» شوند (و چند نادرستِ واقعی) — بیرون از بانک =================
  await section('guards', async () => {
    const G = [['۱۰۰ − ۲۰٪ = ۸۰', 'none'], ['۶ ÷ ۲(۱+۲) = ۹', 'none'], ['۱۰۰۰ گرم میشه ۱ کیلو و ۲۵۰۰ گرم میشه ۲ کیلو و ۵۰۰ گرم', 'ok'], ['جذرِ ۱۶ + ۹ = ۵', 'none'], ['نصفِ ۲۴ + ۶ = ۱۸', 'none'],
      ['sin 30 + 1 = 1.5', 'none'], ['۵ + ۵ میشه ۲ برابرِ ۵', 'none'], ['۷ تقسیم بر ۴ میشه ۱ و ۳/۴', 'ok'], ['۲۴ −۳ + ۴۲ = ۳۹', 'ok'], ['هر ساعت ۴۵ دقیقه درس می‌خونم', 'none'], ['۱/۲ + ۱/۳ = ۲/۵', 'none'],
      ['۱.۲ + ۳ = ۵', 'none'], ['x² + 3 = 12', 'none'], ['پس ۲۰ = ۴x و x = ۵', 'none'], ['۳ متر در ۴ متر = ۱۲ مترمربع', 'none'], ['۷ روز هفته × ۲۴ ساعت = ۱۶۸ ساعت', 'none'], ['نمره‌م از ۲۰ شد ۱۷', 'none'],
      ['۳² + ۴² = ۲۵', 'ok'], ['۳ + ۴ × ۲ = ۱۱', 'ok'], ['(۳ + ۴) × ۲ = ۱۴', 'ok'], ['۲/۳ = ۰٫۶۷', 'ok'], ['۲/۳ = ۰٫۶۶', 'ok'], ['۷۲ کیلومتر در ساعت = ۲۰ متر بر ثانیه', 'ok'], ['۲ × −۳ = −۶', 'ok'],
      ['۳² + ۴² = ۲۴', 'flag'], ['۳ + ۴ × ۲ = ۱۴', 'flag'], ['۲/۳ = ۰٫۶۵', 'flag'], ['۱۲ + ۲۴ = ۳۵', 'flag'], ['۱۲ + ۲۴ = ۳۷', 'flag'], ['۱۴٫۴ تقسیم بر ۱٫۴۴ میشه ۱۲ جعبه', 'flag'], ['۱.۸ متر + ۲۰ سانت = ۲۱.۸', 'flag']];
    for (const [t, e] of G) { const r = await AC(t), oks = r.map(c => c.ok);
      chk(e === 'ok' ? r.length > 0 && oks.every(Boolean) : e === 'none' ? r.length === 0 : oks.some(x => !x), 'guard [' + e + '] «' + t + '» :: ' + JSON.stringify(r.map(c => [c.expr, c.said, c.ok, c.unit]))); }
  });

  // ================= bank — P2 (۴۹…۱۰۶، صفرپایه) =================
  await section('bank', async () => {
    const E = BANK, P2 = E.map((e, i) => i).filter(i => /^P2\./.test(E[i].rc));
    chk(P2.length === 58 && P2[0] === 49 && P2[P2.length - 1] === 106, 'bank layout: 58 P2 entries at 49…106 :: ' + P2.length + ' ' + P2[0] + '…' + P2[P2.length - 1]);
    const parts = (i) => E[i].text.split('‖').map(x => x.trim().replace(/^U:\s*/, '').replace(/^…\s*/, ''));
    const T = (i, ok, x) => { info.bank[i] = !!ok; chk(ok, 'bank#' + (i + 1) + ' [' + E[i].kind + '] «' + E[i].text.slice(0, 80) + '» → ' + E[i].expect.slice(0, 120) + ' :: ' + String(JSON.stringify(x)).slice(0, 600)); };
    // هر جزء: 'ok' = خوانده شد و همه می‌خواند؛ 'quiet' = نادرستی نیست (خوانده یا ناخوانده)؛ 'none' = اصلاً سنجیده نشد؛ آرایه = ok ِ هر حلقه به ترتیب
    const X = {
      49: ['ok'], 50: ['ok'], 51: ['ok'], 52: ['ok'], 53: ['ok'], 54: ['ok'], 55: ['ok'], 56: ['ok'], 57: ['ok'], 58: [[false]], 59: [[false]],
      60: [[true, true]], 61: ['quiet'], 62: ['quiet'], 63: [[true, false]], 64: [[true, true]], 65: [[true, true, true]], 66: [[true, true]], 67: [[true, true, true]],
      68: [[true, false]], 69: [[false, true]], 70: ['ok'], 71: ['ok'], 72: ['ok'], 73: ['ok'], 74: ['ok'], 75: [[false]], 76: [[false]], 77: ['ok'], 78: [[false]], 79: ['ok', 'ok', 'ok'],
      80: [[false]], 81: [[true, true]], 82: [[false]], 83: ['ok', 'ok'], 84: [[false], 'ok', 'ok'], 85: [[false], 'ok', 'ok'], 89: ['ok', 'ok', 'ok', 'ok'],
      90: ['none'], 91: ['none'], 92: ['none'], 93: ['none', 'none'], 94: ['none', 'none', 'quiet', 'quiet'], 95: ['none', 'none', 'none'], 96: ['none'], 97: ['quiet'], 98: ['none'],
      99: ['none', 'none', 'none'], 100: ['none'], 101: ['none'], 102: ['none'], 103: ['none'], 104: ['none', 'none']
    };
    for (const i of Object.keys(X).map(Number)) {
      const ps = parts(i), res = [];
      let ok = ps.length === X[i].length;
      for (let k = 0; k < ps.length && ok; k++) {
        const r = await AC(ps[k]), e = X[i][k], oks = r.map(c => c.ok); res.push(r.map(c => [c.expr, c.said, c.ok, c.unit]));
        ok = e === 'ok' ? r.length > 0 && oks.every(Boolean) : e === 'quiet' ? oks.every(Boolean) : e === 'none' ? r.length === 0 : JSON.stringify(oks) === JSON.stringify(e);
      }
      T(i, ok, res);
    }
    // جزئیاتِ چند ورودی فراتر از «می‌خواند / نمی‌خواند»
    const one = async (t) => (await AC(t));
    let r = await one(parts(58)[0]); chk(r[0] && r[0].valT === '۷/۱۰' && !/۱\/۶|1\/6/.test(JSON.stringify(await p.evaluate((t) => APP.STORY.arithNote(APP.STORY.arithChk(t), 'ok').chk, parts(58)[0]))), 'bank#59: the person-facing line does not give the right decomposition :: ' + JSON.stringify(r));
    r = await one(parts(72)[0]); chk(r[0] && /باقی‌ماندهٔ ۲/.test(r[0].valT) && !/۳٫۴/.test(r[0].valT), 'bank#73: remainder frame (۳ با باقی‌ماندهٔ ۲), never 3.4 :: ' + JSON.stringify(r));
    r = await one(parts(76)[0]); chk(r[0] && r[0].said === '5.8', 'bank#77: the flag is on «۵٫۸», not on «۵ و خرده‌ای» :: ' + JSON.stringify(r));
    r = await one(parts(78)[0]); chk(r[0] && /−4 \+ 31|−۴ \+ ۳۱/.test(r[0].expr), 'bank#79: read with its minus («−۴ + ۳۱»), so the flag is real :: ' + JSON.stringify(r));
    r = await one(parts(80)[0]); chk(r[0] && r[0].kind === 'dim' && /بی تبدیل/.test(r[0].unit) && /۱۹٫۲/.test(r[0].valT), 'bank#81: a unit slip (mm ⇒ m), not a wrong product :: ' + JSON.stringify(r));
    info.nc[60] = 'the dependency mark of the next step is the prior ledger on these checks (both links read as right here — asserted)';
    info.nc[61] = 'C10/«no confident guess»: with words between the numbers («با پنیر که ۱۲۰ تومنه میشه ۱۶۵ … ۲۴۵ هزار تومن») the page does not read the running sum at all — OK means «no flag» (asserted: nothing flagged); reading it would have to guess which words are units (245 «هزار تومن» against 165 + 80)';
    info.nc[62] = 'same as #62: «۸ تا داشتم، با ۵ تا میشه ۱۳ تا» is not read (words between the numbers) — nothing flagged, no decimal framing (asserted); the simple wording to a child is the model\'s reply';
    info.nc[94] = 'parts 3 and 4 («تقریباً ۳٫۱۴»، «حدوداً ۳۰۰») carry no «=»/«میشه», so the page reads nothing — no flag (asserted)';
    info.nc[97] = '«من ۵۶ گرفتم» is not written as an expression, so the page has nothing to confirm; the quoted «۷×۸ = ۵۴ که غلطه» is never her ✗ (asserted)';
    const missing = P2.filter(i => info.bank[i] === undefined && process.env.ONLY === undefined);
    chk(!missing.length, 'bank: every P2 entry is tested :: ' + JSON.stringify(missing.map(i => i + 1)));
  });

  const nb = Object.keys(info.bank).length, nbOk = Object.values(info.bank).filter(Boolean).length;
  console.log('bank P2: ' + nbOk + '/' + nb + ' pass; nc: ' + Object.keys(info.nc).length + (Object.keys(info.nc).length ? ' ' + JSON.stringify(info.nc) : ''));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
