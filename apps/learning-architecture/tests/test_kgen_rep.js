// سه سازندهٔ برنامه‌وارِ «بازنمایی و وارسی» (a17_kpractice.js): نمادگذاری، ترجمهٔ شرط به رابطه (جدولِ دوستونی)، آزمونِ ابعاد —
// بازمحاسبهٔ مستقلِ پاسخ از params با پیادهٔ جدا (نه کدِ خودِ سازنده)، یکتاییِ پاسخ، نسخهٔ بدلی، و پیوند به ثبت‌گاهِ حرکت‌ها؛
// به‌اضافهٔ این‌که A.KLADDER دیگر رونویسی نمی‌شود (A.KSPACING). در Node، بی مرورگر. خطا ⇒ کدِ خروجِ غیرصفر.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const APPD = path.join(__dirname, '..', 'src', 'app');
const ctx = { APP: {}, window: {}, console, Math, Intl, setTimeout, clearTimeout };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(APPD, 'a17_kpractice.js'), 'utf8'), ctx, { filename: 'a17_kpractice.js' });
const A = ctx.APP, errors = [], info = {};
const fail = m => { if (errors.length < 60) errors.push(m); };
const strip = s => String(s).replace(/[⁦-⁩]/g, '');

// --- KLADDER: a17 دیگر نامِ نردبانِ راهنمایی (a16) را رونویسی نمی‌کند ---
if (A.KLADDER !== undefined) fail('a17 still assigns APP.KLADDER: ' + JSON.stringify(A.KLADDER));
if (JSON.stringify(A.KSPACING) !== '[1,3,7,21,60]') fail('KSPACING ' + JSON.stringify(A.KSPACING));
// knextIv پس از «if (!A.S) return» تعریف می‌شود (فقط در مرورگر) ⇒ آن را tests/test_moves_heur.js در صفحهٔ واقعی می‌سنجد
if (typeof A.knextIv === 'function' && (A.knextIv(0, true) !== 1 || A.knextIv(1, true) !== 3 || A.knextIv(21, true) !== 60 || A.knextIv(60, true) !== 60 || A.knextIv(21, false) !== 1)) fail('knextIv ladder');

// --- ثبت‌گاه ---
const KEYS = ['notation', 'eqtrans', 'dimtest'];
const mvSrc = fs.readFileSync(path.join(APPD, 'a19_moves.js'), 'utf8');
KEYS.forEach(k => {
  const G = A.KGEN[k];
  if (!G) { fail('missing generator ' + k); return; }
  if (!Array.isArray(G.mv) || !G.mv.length || G.mv.some(m => !mvSrc.includes('id: "' + m + '"'))) fail(k + ': mv link to the moves registry ' + JSON.stringify(G.mv));
  if (!new RegExp(k).test(mvSrc.match(/GEN_FOR = \{[^}]*\}/)[0])) fail(k + ': not offered on its move page (GEN_FOR)');
});
if (!A.kgenFor('F2').includes('notation') || !A.kgenFor('F2').includes('eqtrans') || !A.kgenFor('F4').includes('dimtest')) fail('family mapping');

// --- پیادهٔ مستقلِ قاعده‌ها ---
function notationValid(params, m) {        // m: [[kind, ent, text], ...]
  const texts = m.map(x => x[2]);
  if (new Set(texts).size !== texts.length) return false;                   // بی‌ابهام
  if (texts.some(t => t === 'π' || t === 'e')) return false;               // نمادِ ثابت
  if (params.related) {
    const o = params.objs;
    for (let i = 0; i < o.length; i++) for (let j = 0; j < o.length; j++) {
      if ((o[i].g === o[j].g) !== (m[i][0] === m[j][0])) return false;      // هم‌نوع ⇔ نشانِ نوعِ یکسان
      if ((o[i].i === o[j].i) !== (m[i][1] === m[j][1])) return false;      // هم‌موجود ⇔ نشانِ موجودِ یکسان
    }
  }
  return true;
}
const DIM = { abstract: { a: [1, 0], b: [1, 0], h: [1, 0] }, real: { v: [1, -1], t: [0, 1], g: [1, -2], d: [1, 0] } };
const homog = (form, ms, target) => ms.every(m => { let L = 0, T = 0; Object.entries(m.p).forEach(([s, e]) => { L += e * DIM[form][s][0]; T += e * DIM[form][s][1]; }); return L === target[0] && T === target[1]; });

const stats = {};
for (const key of KEYS) {
  const G = A.KGEN[key]; stats[key] = { n: 0, decoys: 0, answers: {} };
  for (let level = 1; level <= 3; level++) for (const decoy of [false, true]) for (const form of G.forms) for (let s = 1; s <= 60; s++) {
    const seed = (s * 2246822519 + level * 31 + (decoy ? 5 : 0)) >>> 0, tag = `${key} L${level} d${decoy} ${form} #${seed}`;
    let it; try { it = A.kgenMake(key, seed, level, decoy, form); } catch (e) { fail(tag + ': threw ' + e.message); continue; }
    stats[key].n++; if (decoy) stats[key].decoys++;
    if (A.kleak(it)) fail(tag + ': leak');
    if (key === 'notation') {
      const valid = Object.keys(it.params.cands).filter(id => notationValid(it.params, it.params.cands[id]));
      if (valid.length !== 1 || valid[0] !== it.answer) fail(tag + ': valid notations ' + valid + ' vs answer ' + it.answer);
      if (it.params.related === decoy) fail(tag + ': decoy must be the unrelated-objects version');
      if (!decoy) { // دامِ اصلی: نام‌گذاریِ عامِ بی‌ابهام که پیوند را گم می‌کند
        const generic = Object.keys(it.params.cands).filter(id => { const m = it.params.cands[id]; return new Set(m.map(x => x[2])).size === m.length && !m.some(x => x[2] === 'π' || x[2] === 'e') && id !== it.answer && new Set(m.map(x => x[0])).size === m.length; });
        if (!generic.length) fail(tag + ': generic (unambiguous but unrelated) notation missing');
      }
    }
    if (key === 'eqtrans') {
      const k = it.params.k;
      if (k < 2) fail(tag + ': k');
      if (it.atype === 'choice') {
        const sat = id => { const [p, q, c] = it.params.rels[id]; return [[k, 1], [2 * k, 2], [3 * k, 3]].every(([X, Y]) => p * X + q * Y === c); };   // موقعیت: به‌ازای Y ، kY
        const ok = Object.keys(it.params.rels).filter(sat);
        if (ok.length !== 1 || ok[0] !== it.answer) fail(tag + ': relation check ' + ok + ' vs ' + it.answer);
        const rev = Object.keys(it.params.rels).find(id => JSON.stringify(it.params.rels[id]) === JSON.stringify([-k, 1, 0]));
        if (!rev) fail(tag + ': reversed relation (word-order error) not among choices');
        const p = strip(it.prompt);
        if (decoy ? !/برابرِ/.test(p) : !/(به‌ازای هر|در هر|نسبتِ)/.test(p)) fail(tag + ': phrasing does not match decoy flag');
        if (!/⇐ ؟/.test(p)) fail(tag + ': two-column table row missing');
      } else {
        const y = +it.answer, N = it.params.N;
        if (y * (k + 1) !== N) fail(tag + ': int answer ' + y + ' k ' + k + ' N ' + N);
        if (level !== 3) fail(tag + ': int only at level 3');
      }
      stats[key].answers[it.atype] = (stats[key].answers[it.atype] || 0) + 1;
    }
    if (key === 'dimtest') {
      const F = it.params.forms, bad = Object.keys(F).filter(id => !homog(it.params.form, F[id], it.params.target));
      if (decoy) { if (bad.length || it.answer !== it.params.none) fail(tag + ': decoy must have all formulas homogeneous and answer «none»'); }
      else if (bad.length !== 1 || bad[0] !== it.answer) fail(tag + ': inhomogeneous ' + bad + ' vs answer ' + it.answer);
      Object.keys(F).forEach(id => { const tx = F[id].map(m => JSON.stringify(m.p)); if (new Set(tx).size !== tx.length) fail(tag + ': repeated term in a formula'); });
      if (F[it.answer] && F[it.answer].length !== level) fail(tag + ': terms per formula != level');
      if (!it.choices.some(c => c.id === it.params.none)) fail(tag + ': «none» choice missing');
    }
  }
}
info.stats = stats;
console.log(JSON.stringify(info, null, 1));
if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
