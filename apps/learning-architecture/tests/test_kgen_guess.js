// دو سازندهٔ برنامه‌وارِ تازه (a17_kpractice.js، R3 ۲۰۲۶-۱۰-۱۵): «حدس را بیازما» (guesstest — حالتِ خاص، مثالِ نقض، حالتِ حدی، با نسخهٔ بدلی
// که حدس درست است) و «شکلِ قانون از ابعاد» (dimform — تحلیلِ ابعادی برای حدسِ شکلِ قانون، با نسخهٔ بدلی با کمیتِ بی‌بُعد).
// بازمحاسبهٔ مستقلِ پاسخ از params با پیادهٔ جدا (نه کدِ خودِ سازنده)، یکتاییِ گزینهٔ درست، نسخهٔ بدلی، پیوند به ثبت‌گاهِ حرکت‌ها و
// به کارتِ حدس/بازنگریِ شبیه‌ساز. در Node، بی مرورگر. خطا ⇒ کدِ خروجِ غیرصفر.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const APPD = path.join(__dirname, '..', 'src', 'app');
const ctx = { APP: {}, window: {}, console, Math, Intl, setTimeout, clearTimeout };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(APPD, 'a17_kpractice.js'), 'utf8'), ctx, { filename: 'a17_kpractice.js' });
const A = ctx.APP, errors = [], info = { n: {}, tpl: {} };
const fail = m => { if (errors.length < 60) errors.push(m); };
const strip = s => String(s).replace(/[⁦-⁩]/g, '').replace(/[\u00a0\u202f\u2009]/g, ' ');
const lat = s => strip(s).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));

// --- ثبت‌گاه و پیوندها ---
const mvSrc = fs.readFileSync(path.join(APPD, 'a19_moves.js'), 'utf8'), svSrc = fs.readFileSync(path.join(APPD, 'a36_solve.js'), 'utf8');
[['guesstest', 'mv_special'], ['dimform', 'mv_dimcheck']].forEach(([k, mv]) => {
  const G = A.KGEN[k]; if (!G) { fail('missing generator ' + k); return; }
  if (!G.fams.includes('F4')) fail(k + ': family F4');
  if (!(G.mv || []).includes(mv)) fail(k + ': mv link ' + JSON.stringify(G.mv));
  if (!new RegExp(mv + ': \\[[^\\]]*"' + k + '"').test(mvSrc.match(/GEN_FOR = \{[^}]*\}/)[0])) fail(k + ': not offered on the ' + mv + ' page (GEN_FOR)');
});
if (!/moveGenDrill\("mv_special", "guesstest"\)/.test(svSrc)) fail('guess card / looking-back card do not link the guess-test generator');

// --- پیادهٔ مستقل ---
const isPrime = n => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
const C = (n, k) => { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
const regions = n => { // شمارشِ مستقل با فرمولِ اویلر روی گرافِ وترها: V = n + C(n,4)، E = n + 2·C(n,4) + C(n,2) ⇒ F درونی = E − V + 1
  const V = n + C(n, 4), E = n /* کمان‌ها */ + C(n, 2) + 2 * C(n, 4); return E - V + 1;
};
for (let n = 1; n <= 10; n++) if (regions(n) !== A.kCircleRegions(n)) fail('circle regions n=' + n + ': ' + regions(n) + ' vs ' + A.kCircleRegions(n));
const dims = { l: [0, 1, 0], h: [0, 1, 0], r: [0, 1, 0], g: [0, 1, -2], m: [1, 0, 0], v: [0, 1, -1], k: [1, 0, -2] };

for (const key of ['guesstest', 'dimform']) {
  const G = A.KGEN[key]; if (!G) continue; info.n[key] = 0;
  for (let level = 1; level <= 3; level++) for (const decoy of [false, true]) for (const form of G.forms) for (let s = 1; s <= 60; s++) {
    const seed = (s * 2246822519 + level * 131 + (decoy ? 17 : 0)) >>> 0, tag = `${key} L${level} d${decoy} ${form} #${seed}`;
    let it; try { it = A.kgenMake(key, seed, level, decoy, form); } catch (e) { fail(tag + ': ' + e.message); continue; }
    info.n[key]++;
    if (it.check(it.answer) !== true) fail(tag + ': answer rejected');
    if (it.choices.filter(c => it.check(c.id)).length !== 1) fail(tag + ': not exactly one accepted choice');
    if (new Set(it.choices.map(c => c.t)).size !== 4) fail(tag + ': duplicate choice texts');
    if (A.kleak(it)) fail(tag + ': leak ' + A.kleak(it));
    const right = lat(it.choices.find(c => c.id === it.answer).t), P = lat(it.prompt), pr = it.params;
    if (key === 'guesstest') {
      info.tpl[pr.tpl] = (info.tpl[pr.tpl] || 0) + 1;
      const refuted = /نادرست است/.test(right), supported = /برهان/.test(right) && /(نیست|پشتیبانی)/.test(right);
      if (decoy ? !supported || refuted : !refuted) fail(tag + ': verdict wording does not match decoy=' + decoy + ' :: ' + right);
      if (/ثابت شد/.test(right)) fail(tag + ': «proved by cases» marked correct');
      if (pr.tpl === 'poly') {
        const q = pr.q, n = pr.n, val = n * n + n + q;
        if (n !== q - 1 || val !== q * q) fail(tag + ': special case');
        for (let x = 0; x <= 3; x++) if (!isPrime(x * x + x + q)) fail(tag + ': small cases not all prime (decoy trap text false) q=' + q);
        if (!decoy) { if (isPrime(val)) fail(tag + ': poly counterexample is prime?'); if (!right.includes(String(val))) fail(tag + ': value not in correct option'); }
        else { for (let x = 0; x <= 200; x++) if ((x * x + x + q) % 2 === 0) fail(tag + ': odd claim false at ' + x); }
      } else if (pr.tpl === 'pow') {
        const k = pr.k, n0 = pr.n0, fails = []; for (let n = n0; n <= 60; n++) if (2 ** n <= n ** k) fails.push(n);
        if (decoy ? fails.length : !fails.length || fails[0] !== pr.n) fail(tag + ': pow verdict n0=' + n0 + ' k=' + k + ' fails=' + fails);
        if (!decoy && !right.includes(String(2 ** pr.n))) fail(tag + ': computed powers missing from the correct option');
      } else if (pr.tpl === 'circle') {
        const pow = n => 2 ** (n - 1);
        const eq = [1, 2, 3, 4, 5, 6, 7, 8].every(n => regions(n) === pow(n)), le = [...Array(30).keys()].map(i => i + 1).every(n => regions(n) <= pow(n));
        if (decoy ? !le : eq) fail(tag + ': circle claim truth');
        if (!right.includes(String(regions(6)))) fail(tag + ': n=6 count missing');
      } else if (pr.tpl === 'tri') {
        const [a, b, c] = pr.sides, Pm = a + b + c, L = Math.max(a, b, c);
        if (!(a + b > c && a + c > b && b + c > a)) fail(tag + ': not a triangle');
        if (decoy ? !(L < Pm / 2) : !(L > Pm / 3)) fail(tag + ': extreme case does not decide the claim');
      } else fail(tag + ': unknown template');
    } else {
      // شکلِ قانون: توان‌ها را مستقل از راهِ ابعاد حل می‌کنیم و با گزینهٔ درست می‌سنجیم
      const L = A.KLAWS[pr.law], H = [-2, -1, -0.5, 0, 0.5, 1, 2];
      let sols = [[]]; L.vars.forEach(() => { const nx = []; sols.forEach(e => H.forEach(x => nx.push(e.concat([x])))); sols = nx; });
      sols = sols.filter(ex => { const d = [0, 0, 0]; L.vars.forEach((v, i) => { for (let j = 0; j < 3; j++) d[j] += ex[i] * dims[v[0]][j]; }); return d.join() === L.tgt[2].join(); });
      if (sols.length !== 1) fail(tag + ': law not unique ' + JSON.stringify(sols));
      const want = A.klawTxt(L, sols[0], decoy ? '·f(θ)' : '');
      if (strip(it.choices.find(c => c.id === it.answer).t) !== want) fail(tag + ': answer ' + right + ' != ' + want);
      // هر گزینهٔ دیگر یا ناهم‌بُعد است یا (در بدلی) همان شکل بی f(θ) — ادعای بی‌پایه
      it.choices.filter(c => c.id !== it.answer).forEach(c => { const ex = pr.ex[c.id], d = [0, 0, 0]; L.vars.forEach((v, i) => { for (let j = 0; j < 3; j++) d[j] += ex[i] * dims[v[0]][j]; });
        const t = strip(c.t), homog = d.join() === L.tgt[2].join();
        if (homog && !(decoy && t === A.klawTxt(L, sols[0], ''))) fail(tag + ': another homogeneous choice ' + t); });
      if (decoy !== /θ/.test(P)) fail(tag + ': decoy flag vs dimensionless quantity');
    }
    const again = A.kgenMake(key, seed, level, decoy, form);
    if (JSON.stringify(again, (k, v) => typeof v === 'function' ? undefined : v) !== JSON.stringify(it, (k, v) => typeof v === 'function' ? undefined : v)) fail(tag + ': not deterministic');
  }
}
if (Object.keys(info.tpl).length !== 4) fail('guesstest templates not all exercised ' + JSON.stringify(info.tpl));
console.log(JSON.stringify(info, null, 1));
if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
