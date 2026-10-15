// فنون حدس (تصمیمِ مالک ۲۰۲۶-۱۰-۱۵؛ ممیزیِ دورِ سوم: A224، B114، A232، A229، B172، B109، B118، B121، B175) — در Node، بی مرورگر:
//  ۱) سه سازندهٔ کدیِ تازه در a17_kpractice.js: «تفاضل‌های پیاپی» (diffs)، «حدس‌های رقیب» (rivals)، «حدس با قیاس» (analogy) —
//     پاسخ با پیادهٔ مستقل (نه کدِ خودِ سازنده) دوباره حساب می‌شود؛ یکتاییِ گزینهٔ درست؛ نسخهٔ بدلی؛ پیوند به حرکت‌ها و به کارتِ حدس.
//  ۲) ابزارهای خالصِ «ابزارهای حدس»: جدولِ تفاضل‌ها، فرمولِ n (بی eval)، جداکردنِ حدس‌های رقیب، و وارسیِ کدیِ کیت (A.kguessCheck).
// خطا ⇒ کدِ خروجِ غیرصفر.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const APPD = path.join(__dirname, '..', 'src', 'app');
const ctx = { APP: {}, window: {}, console, Math, Intl, setTimeout, clearTimeout };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(APPD, 'a17_kpractice.js'), 'utf8'), ctx, { filename: 'a17_kpractice.js' });
const A = ctx.APP, errors = [], info = { n: {} };
const fail = m => { if (errors.length < 80) errors.push(m); };
const strip = s => String(s).replace(/[⁦-⁩]/g, '');
const lat = s => strip(s).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));

// ---------- ثبت‌گاه و پیوندها ----------
const mvSrc = fs.readFileSync(path.join(APPD, 'a19_moves.js'), 'utf8'), svSrc = fs.readFileSync(path.join(APPD, 'a36_solve.js'), 'utf8');
const GEN = mvSrc.match(/GEN_FOR = \{[^}]*\}/)[0];
[['diffs', ['mv_special', 'mv_general']], ['rivals', ['mv_special']], ['analogy', ['mv_analogy']]].forEach(([k, mvs]) => {
  const G = A.KGEN[k]; if (!G) { fail('missing generator ' + k); return; }
  if (!G.fams.includes('F4')) fail(k + ': family F4');
  mvs.forEach(mv => { if (!(G.mv || []).includes(mv)) fail(k + ': mv link ' + mv); if (!new RegExp(mv + ': \\[[^\\]]*"' + k + '"').test(GEN)) fail(k + ': not offered on the ' + mv + ' page'); if (!mvSrc.includes('id: "' + mv + '"')) fail(mv + ' not a registry move'); });
  if (!new RegExp('\\["mv_[a-z]+", "' + k + '"\\]').test(svSrc)) fail(k + ': not offered from the guess / looking-back card (a36)');
});

// ---------- پیادهٔ مستقل ----------
const P = (c, n) => c.reduce((s, a, i) => s + a * n ** i, 0);
const diffRows = ys => { const R = [ys.slice()]; while (R[R.length - 1].length > 1) { const r = R[R.length - 1]; R.push(r.slice(1).map((v, i) => v - r[i])); } return R; };
const lagrangeNext = ys => { const m = ys.length, x = m + 1; let s = 0; for (let i = 1; i <= m; i++) { let t = ys[i - 1]; for (let j = 1; j <= m; j++) if (j !== i) t *= (x - j) / (i - j); s += t; } return Math.round(s); };
const C = (n, k) => { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
const cubeV = d => d === 0 ? 1 : 2 * cubeV(d - 1), cubeE = d => d === 0 ? 0 : 2 * cubeE(d - 1) + cubeV(d - 1);   // ساختن: دو نسخه + پیوندِ رأس‌های متناظر
const maxProd = (S, k) => { let best = 0; const rec = (left, parts, prod) => { if (parts === 1) { best = Math.max(best, prod * left); return; } for (let a = 1; a <= left - parts + 1; a++) rec(left - a, parts - 1, prod * a); }; rec(S, k, 1); return best; };
const numIn = t => +lat(t).replace(/[^0-9\-]/g, '');

for (const key of ['diffs', 'rivals', 'analogy']) {
  const G = A.KGEN[key]; if (!G) continue; info.n[key] = 0;
  for (let level = 1; level <= 3; level++) for (const decoy of [false, true]) for (const form of G.forms) for (let s = 1; s <= 60; s++) {
    const seed = (s * 2246822519 + level * 131 + (decoy ? 17 : 0)) >>> 0, tag = `${key} L${level} d${decoy} ${form} #${seed}`;
    let it; try { it = A.kgenMake(key, seed, level, decoy, form); } catch (e) { fail(tag + ': ' + e.message); continue; }
    info.n[key]++;
    if (it.check(it.answer) !== true) fail(tag + ': answer rejected');
    if (it.choices.filter(c => it.check(c.id)).length !== 1) fail(tag + ': not exactly one accepted choice');
    if (new Set(it.choices.map(c => c.t)).size !== 4) fail(tag + ': duplicate choice texts');
    if (A.kleak(it)) fail(tag + ': leak ' + A.kleak(it));
    if (JSON.stringify(A.kgenMake(key, seed, level, decoy, form), (k, v) => typeof v === 'function' ? undefined : v) !== JSON.stringify(it, (k, v) => typeof v === 'function' ? undefined : v)) fail(tag + ': not deterministic');
    const right = it.choices.find(c => c.id === it.answer).t, pr = it.params, Pm = lat(it.prompt);
    if (key === 'diffs') {
      const m = pr.vals.length, shown = (Pm.split('\n')[0].split(':')[1] || '').split('،').map(x => +x.replace(/[^0-9\-]/g, '')).filter(x => !isNaN(x));
      if (shown.join() !== pr.vals.join()) fail(tag + ': prompt values ' + shown + ' vs ' + pr.vals);
      const want = decoy ? pr.b * pr.q ** (m + 1) : P(pr.c, m + 1);
      if (!decoy) { if (pr.vals.join() !== Array.from({ length: m }, (_, i) => P(pr.c, i + 1)).join()) fail(tag + ': values not from the polynomial');
        const R = diffRows(pr.vals), d = pr.c.length - 1; if (!R[d].every(v => v === R[d][0]) || R.slice(0, d).some(r => r.every(v => v === r[0]) && r.length > 1)) fail(tag + ': the constant row is not order ' + d); }
      else { const R = diffRows(pr.vals); if (R.some(r => r.length >= 2 && r.every(v => v === r[0]))) fail(tag + ': decoy differences become constant');
        if (!it.choices.some(c => numIn(c.t.split('=')[1]) === lagrangeNext(pr.vals))) fail(tag + ': the polynomial-extrapolation trap is not offered'); }
      if (numIn(right.split('=')[1]) !== want) fail(tag + ': right ' + right + ' vs ' + want);
      it.choices.forEach(c => { if (c.id !== it.answer && numIn(c.t.split('=')[1]) === want) fail(tag + ': a wrong choice equals the answer'); });
    }
    if (key === 'rivals') {
      const F = [pr.T, pr.R2, pr.R3], val = (f, n) => P(f.c, n) + (f.pow2 ? 2 ** n : 0), N = decoy ? 3 : 4;
      if (pr.table.join() !== Array.from({ length: N }, (_, i) => val(pr.T, i + 1)).join()) fail(tag + ': table not from T');
      const fit = F.map(f => pr.table.every((v, i) => val(f, i + 1) === v));
      if (decoy ? fit.join() !== 'true,true,false' : fit.join() !== 'true,false,false') fail(tag + ': which rivals survive ' + fit);
      if (val(pr.R2, 1) !== val(pr.T, 1) || val(pr.R2, 2) !== val(pr.T, 2) || val(pr.R2, 3) !== val(pr.T, 3) || val(pr.R2, 4) === val(pr.T, 4)) fail(tag + ': R2 must agree on 1..3 and split at 4');
      if (val(pr.R3, 2) !== val(pr.T, 2) || val(pr.R3, 3) === val(pr.T, 3)) fail(tag + ': R3 must split at 3');
      if (!right.includes(pr.lab[0])) fail(tag + ': right verdict does not name the true formula');
      if (decoy && !(lat(right).includes(String(val(pr.T, 4))) && lat(right).includes(String(val(pr.R2, 4))))) fail(tag + ': separating values at n=4 missing');
      if (!decoy && !/برهان/.test(right)) fail(tag + ': surviving guess is "supported, needs proof"');
      // فرمول‌های نمایش‌داده با همان مقدارها (A.kformula مستقل از سازنده خوانده می‌شود)
      const shownF = [...strip(it.prompt).split('\n')[0].matchAll(/«[^»]+»: ([^؛.]+)/g)].map(x => x[1].trim());
      if (shownF.length !== 3) fail(tag + ': three rival formulas in the prompt'); else shownF.forEach(t => { const f = A.kformula(t); if (!f) fail(tag + ': unreadable formula ' + t); else if (![1, 2].every(n => F.some(g => val(g, n) === f(n)))) fail(tag + ': shown formula ' + t + ' not one of the rivals'); });
    }
    if (key === 'analogy') {
      let want;
      if (form === 'geometric') { const d = pr.d; want = pr.obj === 'cube' ? (pr.f === 'v' ? cubeV(d) : pr.f === 'e' ? cubeE(d) : 2 * d) : (pr.f === 'e' ? C(d + 1, 2) : d + 1);
        if (decoy !== (pr.obj === 'simplex')) fail(tag + ': decoy must be the simplex (plain continuation is right)');
        [1, 2, 3].forEach(k => { const v = pr.obj === 'cube' ? (pr.f === 'v' ? cubeV(k) : pr.f === 'e' ? cubeE(k) : 2 * k) : k + 1; if (pr.v3[k - 1] !== v) fail(tag + ': shown count dim ' + k); }); }
      else want = pr.dims === 2 ? maxProd(2 * pr.k, 2) : pr.dims === 3 ? maxProd(3 * pr.k, 3) : maxProd(4 * pr.k, 4);
      if (numIn(right) !== want) fail(tag + ': right ' + right + ' vs ' + want);
      it.choices.forEach(c => { if (c.id !== it.answer && numIn(c.t) === want) fail(tag + ': a wrong choice equals the answer'); });
    }
  }
}

// ---------- ابزارهای خالص ----------
const D = A.kseqDiffs([1, 3, 6, 10, 15]); if (D.order !== 2 || D.next !== 21 || D.thin) fail('seqDiffs triangular ' + JSON.stringify(D));
const D2 = A.kseqDiffs([2, 4, 8, 16]); if (D2.order !== -1 || D2.next !== null) fail('seqDiffs exponential must not find a constant row');
const D3 = A.kseqDiffs([5, 5]); if (D3.order !== 0 || D3.next !== 5) fail('seqDiffs constant');
const F = (t, n) => { const f = A.kformula(t); return f ? f(n) : null; };
[['n(n+1)/2', 4, 10], ['2^n-1', 5, 31], ['۲n²+۳', 3, 21], ['3n - 2', 4, 10], ['(n-1)(n-2)', 5, 12], ['f(n) = n^2', 6, 36], ['-n^2', 3, -9], ['2^(n+1)', 2, 8], ['n ÷ 2', 6, 3], ['n × n', 7, 49]].forEach(([t, n, v]) => { const r = F(t, n); if (r !== v) fail('formula ' + t + ' at ' + n + ' = ' + r + ' (want ' + v + ')'); });
['alert(1)', 'n+', 'm*2', '2**', 'n)(', '', 'Math.pow(n,2)', 'constructor'].forEach(t => { if (A.kformula(t)) fail('formula must reject ' + JSON.stringify(t)); });
const sep = A.kseparate(A.kformula('n(n+1)/2'), A.kformula('2^n-1'), 20); if (!sep || sep.n !== 3 || sep.a !== 6 || sep.b !== 7) fail('separate ' + JSON.stringify(sep));
// کیت: جدول، فرمولِ ناجور، رقیب‌ها، «کدام شایستهٔ آزمودن است»
const K = A.kguessCheck({ rows: [{ x: '1', y: '1' }, { x: '2', y: '3' }, { x: '3', y: '6' }, { x: '4', y: '10' }], formula: 'n^2', rivals: [{ t: 'n(n+1)/2', test: 'n = 5' }, { t: '2^n - 1', test: 'n = 4' }], worth: '1', worthWhy: 'like' });
if (!K.table || K.table.order !== 2 || K.table.next !== 15) fail('kit table ' + JSON.stringify(K.table));
if (!K.formula || K.formula.fits !== false || K.formula.mism.length !== 3) fail('kit formula mismatch ' + JSON.stringify(K.formula));
// M6 (ممیزیِ ۲۰۲۶-۱۰-۱۵): جدول (۱..۴) خودش میانِ دو رقیب داوری کرده ⇒ حالتِ جداکنندهٔ درونِ جدول (n = 3) پیشنهاد نمی‌شود
if (!K.rivals || K.rivals.sep || K.rivals.decided !== '2' || JSON.stringify(K.rivals.fit) !== '[true,false]') fail('kit rivals ' + JSON.stringify(K.rivals));
if (K.ok || !K.issues.some(x => /دلبستگی/.test(x))) fail('liking a guess is not a reason to test it first ' + JSON.stringify(K.issues));
const K2 = A.kguessCheck({ rows: [], formula: '', rivals: [{ t: 'مشتری پول می‌دهد', test: 'از ده نفر پیش‌خرید بخواهم' }, { t: 'فقط تعریف می‌کنند', test: '' }], worth: '0', worthWhy: 'bold' });
if (K2.ok || !K2.issues.some(x => /آزمونی بنویس/.test(x))) fail('rival without a test accepted ' + JSON.stringify(K2));
const K3 = A.kguessCheck({ rivals: [{ t: 'الف', test: 'x' }, { t: 'الف', test: 'y' }] }); if (K3.ok || !K3.rivals.dup) fail('duplicate rivals accepted');
const K4 = A.kguessCheck({ rivals: [{ t: 'مشتری پول می‌دهد', test: 'پیش‌خرید' }, { t: 'فقط تعریف می‌کنند', test: 'پرسیدنِ مبلغ' }], worth: '0', worthWhy: 'cheap' }); if (!K4.ok) fail('valid verbal rivals rejected ' + JSON.stringify(K4.issues));
const K5 = A.kguessCheck({ rows: [{ x: '1', y: '2' }, { x: '3', y: '4' }, { x: '4', y: '5' }] }); if (!K5.issues.some(x => /گامِ ثابت/.test(x))) fail('uneven x not flagged');

console.log(JSON.stringify(info));
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
