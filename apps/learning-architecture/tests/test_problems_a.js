/* آزمونِ ضدِّ سوگیریِ گزینه‌ها در «مسئله‌های حل‌شده» (src/app/epi_problems.js) — بی‌مرورگر: node tests/test_problems_a.js
   یافتهٔ ممیزی: در ۷۵ از ۷۸ گام، گزینهٔ درست بلندترین گزینه بود؛ رباتی که همیشه بلندترین را می‌زد از دروازهٔ ۸۰٪ می‌گذشت.
   این آزمون برای هر مسئله می‌سنجد:
   - هر گام ≥۳ گزینه و دقیقاً یک گزینهٔ درست؛ هر تمرین ۴ گزینه و `a` معتبر؛
   - گزینهٔ درست در ≤۳۵٪ گام‌ها/تمرین‌ها (اکیداً) بلندترین باشد؛
   - در ≥۸۰٪ گام‌ها/تمرین‌ها |طولِ درست − میانگینِ طولِ نادرست‌ها| ≤ ۰٫۳۵ × میانگینِ نادرست‌ها؛
   - «رباتِ بلندترین‌گزینه» (با شکستنِ تساوی به سودِ ربات) در گام‌های هر مسئله < ۸۰٪ بگیرد؛
   - `cases` (دادهٔ بک‌تست) و همهٔ فیلدهای محافظت‌شده بایت‌به‌بایت با نسخهٔ f6c4b66 یکی باشند
     (فقط opts و ctx ِ گام‌ها و opts/a/why ِ تمرین‌ها اجازهٔ تغییر داشتند). */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
global.window = global; window.EPI_PROBLEMS = [];
eval(fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'epi_problems.js'), 'utf8'));
const P = window.EPI_PROBLEMS, errors = [], rows = [];
const L = s => [...String(s)].length;
const sha = o => crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex');

/* هش‌ها از `git show f6c4b66:apps/learning-architecture/src/app/epi_problems.js` هنگامِ نوشتنِ آزمون */
const CASES_SHA = '93c0cc1b4c0725e35fb45225b62923f8bfffcda0036db98af7d9642844b6f149';
const PROTECTED_SHA = '0713635b48ad3b502ce2391aa2c271765e7e9adecb2ea3558dc02fe6056e6acb';
const IDS = 'pb_flt,pb_fourcolor,pb_poincare,pb_quintic,pb_greek,pb_parallel,pb_longitude,pb_semmelweis';

function protectedView(list) {
  return list.map(p => {
    const o = {}; for (const k in p) o[k] = p[k];
    o.stages = p.stages.map(s => { const x = {}; for (const k in s) if (k !== 'opts' && k !== 'ctx') x[k] = s[k]; return x; });
    o.drills = (p.drills || []).map(d => ({ lvl: d.lvl, q: d.q }));
    return o;
  });
}

if (P.map(p => p.id).join() !== IDS) errors.push('problem set changed: ' + P.map(p => p.id).join());
if (sha(P.map(p => p.cases)) !== CASES_SHA) errors.push('cases changed (backtest data must stay byte-identical)');
if (sha(protectedView(P)) !== PROTECTED_SHA) errors.push('protected fields changed (only stages[].opts/ctx and drills[].opts/a/why may change)');

function balance(correct, wrongs) {
  const lc = L(correct), mw = wrongs.reduce((a, w) => a + L(w), 0) / wrongs.length;
  return { longest: wrongs.every(w => L(w) < lc), ok: Math.abs(lc - mw) <= 0.35 * mw, botWins: wrongs.every(w => L(w) <= lc) };
}

for (const p of P) {
  let sLong = 0, sBal = 0, bot = 0, dLong = 0, dBal = 0;
  p.stages.forEach(s => {
    const okN = s.opts.filter(o => o.ok).length;
    if (s.opts.length < 3) errors.push(p.id + ':' + s.id + ' has ' + s.opts.length + ' options');
    if (okN !== 1) errors.push(p.id + ':' + s.id + ' has ' + okN + ' correct options');
    if (s.opts.some(o => !o.t || !o.why)) errors.push(p.id + ':' + s.id + ' option without text/why');
    const c = s.opts.find(o => o.ok); if (!c) return;
    if (s.ctx && s.ctx.indexOf(c.t) >= 0) errors.push(p.id + ':' + s.id + ' ctx contains the correct option');
    const b = balance(c.t, s.opts.filter(o => !o.ok).map(o => o.t));
    if (b.longest) sLong++; if (b.ok) sBal++; if (b.botWins) bot++;
  });
  (p.drills || []).forEach((d, i) => {
    if (!Array.isArray(d.opts) || d.opts.length !== 4) errors.push(p.id + ':d' + i + ' has ' + (d.opts || []).length + ' options');
    if (!(Number.isInteger(d.a) && d.a >= 0 && d.a < d.opts.length)) { errors.push(p.id + ':d' + i + ' invalid a'); return; }
    if (new Set(d.opts).size !== d.opts.length) errors.push(p.id + ':d' + i + ' duplicate options');
    const b = balance(d.opts[d.a], d.opts.filter((_, j) => j !== d.a));
    if (b.longest) dLong++; if (b.ok) dBal++;
  });
  const n = p.stages.length, m = (p.drills || []).length;
  const r = { id: p.id, stages: n, longest: sLong, balanced: sBal, botPct: Math.round(100 * bot / n), drills: m, dLongest: dLong, dBalanced: dBal };
  rows.push(r);
  if (sLong > 0.35 * n) errors.push(p.id + ': correct option is the longest in ' + sLong + '/' + n + ' stages');
  if (sBal < 0.8 * n) errors.push(p.id + ': only ' + sBal + '/' + n + ' stages length-balanced');
  if (bot >= 0.8 * n) errors.push(p.id + ': longest-option bot scores ' + r.botPct + '%');
  if (m && dLong > 0.35 * m) errors.push(p.id + ': correct drill option is the longest in ' + dLong + '/' + m);
  if (m && dBal < 0.8 * m) errors.push(p.id + ': only ' + dBal + '/' + m + ' drills length-balanced');
}

console.log(JSON.stringify(rows, null, 1));
if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
console.log('NO ERRORS');
