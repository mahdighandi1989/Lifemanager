// تورِ پولیا (دستهٔ ۱، دورِ ۳۰، سهمِ «surface») — آزمونِ واحد از جمله‌های خودِ دونده‌ها (C101 الف). بازپخشِ صفحه: test_tour1_r30_surface_replay.js.
//  F13 (A30-1): «صفحه» نهادِ کارِ صفحه ⇒ پرسش دربارهٔ سامانه — مثبت‌ها و نمونه‌های منفیِ C136 از رونوشت‌های ۲۹/۳۰.
//  C26-23/24: پرسش از نامِ مرحلهٔ روش و حدسِ معنای آن «پرسشِ روش» است (نه A038، نه ادعا).
//  C28-21: دکمهٔ برگشت گیومهٔ دوتایی نمی‌گیرد. B30·D23: C117 و C89 در ثبت‌گاهِ قاعده‌ها (بسته به تابعِ خودشان).
//  B26·D16: همان تاریخِ تولدِ ثبت‌شده دوباره ⇒ یک سطرِ «از پیش ثبت است». D26-36: «بپرس» ِ list_update فقط برای مدل است.
// LLA_FILE = ساختِ دیگر (برای قرمز بودن روی BASE30).
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
(async () => {
  const errors = [], chk = (c, m) => { if (!c) errors.push(m); };
  const b = await chromium.launch(); const p = await b.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav');
  const R = await p.evaluate(() => {
    const out = {}, sq = q => q.split(/(?<=[.!؟?])\s+/).filter(x => /[؟?]\s*$/.test(x)).some(x => APP.ASSIST.sysQ28(x));
    /* F13 — A30-1 و هم‌شکل‌های واقعی (C136) */
    out.pos = ['وقتی تو پرونده کنارِ کلِ جمله‌م ✓ میاد، از کجا بدونم کدوم تکه‌ش رو صفحه سنجیده؟', 'یه سؤال: تو صورتِ این معما «سه‌شنبه» هست. صفحه اینو یه قرار برای من حساب نمی‌کنه؟',
      'حسابِ من که درسته! این ✗ ها خطای صفحه‌ست یا من؟', 'اگه صفحه یه حسابِ درستم رو غلط بخونه، از کجا بفهمم تقصیرِ صفحه‌ست نه من؟', 'خطا از منه یا از صفحه؟', 'اگه صفحه چیزی رو اشتباه ثبت کرده، خودم از کجا برش گردونم؟'].map(q => [q, sq(q)]);
    out.neg = ['صفحه پرسید شرط کافی بود؟', 'یه صفحه ۱۰×۱۰ که دو گوشه‌ی مقابلش رو برداشتن. کجای کارم غلطه؟', 'یه کتاب ۴۸ صفحه داره. چند صفحه مونده؟',
      '«✅ حل شد» رو زدم و حالا صفحهٔ بازنگری باز شده. از کجا شروع کنم؟', 'صفحهٔ کتاب رو کجا علامت بزنم؟', 'دفترچه‌م صفحه به صفحه پر شده، از کجا شروع کنم؟'].map(q => [q, sq(q)]);
    /* C26-23/C26-24 */
    const mo = t => APP.ASSIST.coachMoments({}, t, {}).list.map(x => x.id)[0] || '';
    out.m = [['سلام. معلممون گفت «حالا بازنگری کن». بازنگری دقیقاً یعنی چی؟ چی کار باید بکنم؟', 'M30'], ['فکر کنم یعنی دوباره چک کنم که درسته؟ با n = 1، 2، 3 چک کردم: 1، 4، 9 درست درمیاد. بیا ثبتش کنیم.', 'M30'],
      ['طرح‌ریزی یعنی چی؟', 'M30'], ['طرح یعنی چی؟ نمی‌دونم کدوم طرحِ کاشی رو میگه', 'A038'], ['شریکِ جرم دقیقاً یعنی چی؟ نمی‌دونم کدوم معنیش', 'A038'], ['فکر کنم n² درسته؟', 'claim']].map(([t, w]) => [t, mo(t), w]);
    /* C28-21 */
    out.q = APP.qLab30 ? [APP.qLab30('«هشدارِ یخ‌زدگی …»'), APP.qLab30('از فهمیدن تا ماندن'), APP.qLab30('«الف» و «ب»')] : null;
    /* B30·D23 */
    out.rules = APP.ASSIST.ruleLines().map(l => (/\[([^\]]+)\]/.exec(l) || [])[1]);
    /* D26-36: سطرِ list_update برای او بی «بپرس» (قراردادِ D27-25: بندِ «— … (x)» فقط برای مدل) */
    out.forHer = APP.ASSIST.forHer27 ? APP.ASSIST.forHer27('✓ «ادعا» در «ادعاها»: حکم: نامعلوم · تاریخِ بررسیِ دوباره هنوز گفته نشده — از او بپرس (recheck)') : null;
    return out; });
  R.pos.forEach(([q, v]) => chk(v, 'F13 A30-1/C136 positive: a page-agent question is a system question :: ' + q));
  R.neg.forEach(([q, v]) => chk(!v, 'F13 C136 negative stays a problem sentence :: ' + q));
  R.m.forEach(([t, got, w]) => chk(got === w, 'C26-23/24 turn moment ' + w + ' :: got ' + got + ' :: ' + t));
  chk(R.q && R.q[0] === '«هشدارِ یخ‌زدگی …»' && R.q[1] === '«از فهمیدن تا ماندن»' && R.q[2] === '««الف» و «ب»»', 'C28-21 back label quotes once :: ' + JSON.stringify(R.q));
  chk(R.rules.includes('C117') && R.rules.includes('C89'), 'B30·D23 / oC1: C117 and C89 in the page-rule registry :: ' + JSON.stringify(R.rules));
  chk(R.forHer && !/بپرس/.test(R.forHer) && /هنوز گفته نشده/.test(R.forHer), 'D26-36: the «ask» clause is for the model only :: ' + R.forHer);
  /* B26·D16: همان تاریخ دوباره ⇒ «از پیش ثبت است» (یک بار برای همان پیام) */
  const bd = await p.evaluate(() => { const G = APP.AGE, s = { id: 'achat_t30', type: 'achat', msgs: [{ role: 'user', at: '2026-10-25T09:00:00.000Z', text: 'من ۳۰ اردیبهشت ۹۶ به دنیا اومدم' }] };
    APP.S.put(s); G.fromModel({ date: '۳۰ اردیبهشت ۹۶' }, s); s.msgs.push({ role: 'user', at: '2026-10-25T09:05:00.000Z', text: 'مامانم گفت اینم بگم: من ۳۰ اردیبهشت ۹۶ به دنیا اومدم.' });
    G.fromModel({ date: '۳۰ اردیبهشت ۹۶' }, s); G.fromModel({ date: '۳۰ اردیبهشت ۹۶' }, s);
    return s.msgs.filter(m => m.role === 'sys').map(m => m.text); });
  chk(bd.length === 2 && /ثبت شد/.test(bd[0]) && /از پیش ثبت است/.test(bd[1]), 'B26·D16: the stored birth date said again gets one «از پیش ثبت است» line :: ' + JSON.stringify(bd));
  if (pe.length) errors.push('page errors: ' + pe.slice(0, 3).join(' | '));
  await b.close();
  console.log(JSON.stringify({ pos: R.pos.filter(x => x[1]).length + '/' + R.pos.length, neg: R.neg.filter(x => !x[1]).length + '/' + R.neg.length, m: R.m.map(x => x[1]) }));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS');
})();
