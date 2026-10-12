// «گره‌گشا» — آزمونِ واحدِ سازنده‌های برنامه‌وار (a17_kpractice.js) در Node، بی مرورگر.
// برای هر سازنده، هر سطح، هر شکل، بدلی/غیربدلی و دانه‌های بسیار: پاسخِ ذخیره‌شده با check درست است، گزینه‌های دیگر نادرست‌اند،
// نشتی نیست، ساخت تکرارپذیر است، و پاسخ با روشی مستقل (نه کدِ خودِ سازنده) دوباره محاسبه می‌شود.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const SRC = path.join(__dirname, '..', 'src', 'app', 'a17_kpractice.js');
const code = fs.readFileSync(SRC, 'utf8');
const ctx = { APP: {}, window: {}, console, Math, Intl, setTimeout, clearTimeout };
vm.createContext(ctx);
vm.runInContext(code, ctx, { filename: 'a17_kpractice.js' });
const A = ctx.APP;
const errors = [];
const info = { items: 0, byKey: {} };
const fail = (m) => { if (errors.length < 60) errors.push(m); };
const lat = (s) => String(s).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));

// ---------- مستقل: کوزه‌ها ----------
function parseVec(t) { // "B − A − 2C" ⇒ [a,b,c]
  const v = { A: 0, B: 0, C: 0 }; const s = t.replace(/\s+/g, '').replace(/−/g, '-');
  const re = /([+-]?)(\d*)([ABC])/g; let m;
  while ((m = re.exec(s))) v[m[3]] += (m[1] === '-' ? -1 : 1) * (m[2] ? +m[2] : 1);
  return [v.A, v.B, v.C];
}
function minCostIndep(caps, T) { // جست‌وجوی سطح‌به‌سطح روی هزینه، ضریب‌ها تا ۴
  for (let cost = 1; cost <= 8; cost++) {
    const sols = [];
    for (let a = -4; a <= 4; a++) for (let b = -4; b <= 4; b++) for (let c = -4; c <= 4; c++)
      if (Math.abs(a) + Math.abs(b) + Math.abs(c) === cost && a * caps[0] + b * caps[1] + c * caps[2] === T) sols.push([a, b, c]);
    if (sols.length) return { cost, sols };
  }
  return { cost: Infinity, sols: [] };
}
// ---------- مستقل: ۲-۴-۶ ----------
const IR = {
  stepk: (x, k) => x[1] === x[0] + k && x[2] === x[1] + k, ap: (x) => x[1] > x[0] && x[2] - x[1] === x[1] - x[0], mul: (x) => x[1] === x[0] * 2 && x[2] === x[0] * 3,
  sum: (x) => x[0] + x[1] === x[2], inc: (x) => x[1] > x[0] && x[2] > x[1], even: (x) => x.every(n => Math.abs(n) % 2 === 0), endsUp: (x) => x[2] > x[0],
  distinct: (x) => new Set(x).size === 3, maxLast: (x) => x[2] > Math.max(x[0], x[1])
};
// ---------- مستقل: ۲۴ با اعشار ----------
function indep24(nums, T) {
  let anyInt = false, any = false;
  const eps = 1e-9;
  (function rec(list) {
    if (list.length === 1) { if (Math.abs(list[0].v - T) < eps) { any = true; if (!list[0].f) anyInt = true; } return; }
    for (let i = 0; i < list.length; i++) for (let j = 0; j < list.length; j++) {
      if (i === j) continue;
      const a = list[i], b = list[j], rest = list.filter((_, k) => k !== i && k !== j);
      const outs = [a.v + b.v, a.v - b.v, a.v * b.v]; if (Math.abs(b.v) > eps) outs.push(a.v / b.v);
      for (const v of outs) rec(rest.concat([{ v, f: a.f || b.f || Math.abs(v - Math.round(v)) > eps }]));
    }
  })(nums.map(n => ({ v: n, f: false })));
  return { any, anyInt };
}
function evalAscii(s) { if (!/^[0-9+\-*/() ]+$/.test(s)) throw new Error('bad expr'); return Function('return (' + s + ')')(); }

const SEEDS = { jars: 70, rule246: 50, wason: 70, bayes: 70, wmchain: 70, hidden24: 20 };
for (const key of Object.keys(A.KGEN)) {
  const G = A.KGEN[key]; info.byKey[key] = { n: 0, decoys: 0, forms: {} };
  if (!G.fams.length || !G.forms.length || typeof G.make !== 'function') fail(key + ': registry shape');
  for (let level = 1; level <= 3; level++) for (const decoy of [false, true]) for (const form of G.forms) for (let s = 1; s <= SEEDS[key]; s++) {
    const seed = (s * 2654435761 + level * 97 + (decoy ? 7 : 0)) >>> 0;
    let it;
    try { it = A.kgenMake(key, seed, level, decoy, form); } catch (e) { fail(`${key} L${level} d${decoy} ${form} seed ${seed}: make threw ${e.message}`); continue; }
    info.items++; info.byKey[key].n++; if (it.decoy) info.byKey[key].decoys++; info.byKey[key].forms[it.form] = 1;
    const tag = `${key} L${level} d${decoy} ${form} #${seed}`;
    // ساختار
    for (const f of ['prompt', 'answer', 'atype', 'explain', 'deep', 'trap', 'form', 'level']) if (it[f] == null || it[f] === '') fail(tag + ': missing ' + f);
    if (it.decoy !== decoy) fail(tag + ': decoy flag');
    if (it.form !== form) fail(tag + ': form ' + it.form + ' != ' + form);
    // درستیِ پاسخ
    if (it.check(it.answer) !== true) fail(tag + ': check(answer) false');
    if (A.kcheck(JSON.parse(JSON.stringify(it)), it.answer) !== true) fail(tag + ': kcheck on stored copy false');
    if (it.atype === 'choice') {
      if (!it.multi) it.choices.forEach(c => { if (c.id !== it.answer && it.check(c.id)) fail(tag + ': wrong choice accepted ' + c.id); });
      else if (it.check(it.choices.map(c => c.id).join(','))) fail(tag + ': all-cards accepted');
      const ids = it.choices.map(c => c.id), texts = it.choices.map(c => c.t);
      if (new Set(ids).size !== ids.length || new Set(texts).size !== texts.length) fail(tag + ': duplicate choices');
    }
    if (it.atype === 'int' && it.check(String(+it.answer + 1))) fail(tag + ': off-by-one accepted');
    // نشت
    const lk = A.kleak(it); if (lk) fail(tag + ': leak ' + lk);
    if (it.atype === 'int') { const toks = (lat([it.prompt].concat(it.steps || []).join(' ')).match(/\d+/g) || []).map(Number); if (toks.includes(Math.abs(+it.answer))) fail(tag + ': answer number in prompt'); }
    if (it.atype === 'text' && lat(it.prompt).replace(/\s/g, '').includes(it.answer)) fail(tag + ': expr answer in prompt');
    // تکرارپذیری
    const again = A.kgenMake(key, seed, level, decoy, form);
    const strip = (x) => JSON.stringify(x, (k, v) => typeof v === 'function' ? undefined : v);
    if (strip(again) !== strip(it)) fail(tag + ': not deterministic');

    // ---------- بازمحاسبهٔ مستقل ----------
    if (key === 'jars') {
      const { caps, T } = it.params, mc = minCostIndep(caps, T);
      if (!decoy && !(mc.cost === 2 && mc.sols.length === 1)) fail(tag + ': non-decoy should have unique 2-move path ' + JSON.stringify(mc));
      if (decoy && !(mc.cost === 4 && mc.sols.length === 1 && mc.sols[0].join() === '-1,1,-2')) fail(tag + ': decoy should have only B−A−2C ' + JSON.stringify(mc));
      if (caps[1] - caps[0] - 2 * caps[2] !== T) fail(tag + ': set formula must reach T');
      it.params.warm.forEach(w => { const m = minCostIndep(w.caps, w.T); if (!(m.cost === 4 && m.sols.length === 1)) fail(tag + ': warm-up not set-only'); });
      if (it.atype === 'int') { if (+it.answer !== mc.cost) fail(tag + ': int answer != min cost'); }
      else {
        const right = it.choices.find(c => c.id === it.answer), v = parseVec(right.t);
        if (v.join() !== mc.sols[0].join()) fail(tag + ': choice answer != independent min ' + right.t);
        it.choices.forEach(c => { if (c.id === it.answer) return; const w = parseVec(c.t), val = w[0] * caps[0] + w[1] * caps[1] + w[2] * caps[2];
          if (val === T && Math.abs(w[0]) + Math.abs(w[1]) + Math.abs(w[2]) <= mc.cost) fail(tag + ': another choice equally short'); });
        if (!decoy && !it.choices.some(c => parseVec(c.t).join() === '-1,1,-2')) fail(tag + ': set formula missing among choices');
        if (!decoy && it.paths[it.answer] !== 'short') fail(tag + ': path map');
      }
    }
    if (key === 'rule246') {
      const { rule, k, seed: sd, cands } = it.params;
      Object.keys(cands).forEach(id => { if (!IR[cands[id]](sd, k)) fail(tag + ': candidate does not fit seed ' + cands[id]); });
      if (cands[it.answer] !== rule) fail(tag + ': answer id != hidden rule');
      if (decoy !== (rule === 'stepk')) fail(tag + ': decoy must be exactly the salient rule');
      if (!Object.values(cands).includes('stepk')) fail(tag + ': salient rule not offered');
      // هر جفت قاعده با دست‌کم یک سه‌تایی جدا می‌شود (جست‌وجوی مستقل)
      const ids = Object.values(cands);
      for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) {
        let found = false;
        outer: for (let x = -2; x <= 30; x++) for (let y = -2; y <= 30; y++) for (let z = -2; z <= 30; z++) if (IR[ids[a]]([x, y, z], k) !== IR[ids[b]]([x, y, z], k)) { found = true; break outer; }
        if (!found) fail(tag + ': indistinguishable ' + ids[a] + '/' + ids[b]);
      }
      // probe ِ خودِ برنامه با پیادهٔ مستقل یکی است
      for (let t = 0; t < 60; t++) { const x = [((t * 7) % 23) - 3, ((t * 11) % 29) - 2, ((t * 13) % 31) - 1]; if (A.kprobe(it, x) !== IR[rule](x, k)) fail(tag + ': probe mismatch ' + x); }
      if (!(it.minProbes >= 2)) fail(tag + ': minProbes');
    }
    if (key === 'wason') {
      const pol = it.params.pol, na = pol === 'npq', nc = pol === 'pnq';
      // قاعدهٔ کتابِ درسی: کارتی که مقدّم را درست می‌کند + کارتی که تالی را نادرست می‌کند
      const want = it.params.cards.filter(c => c.side === 'a' ? (na ? c.v === 1 : c.v === 0) : (nc ? c.v === 0 : c.v === 1)).map(c => c.id).sort().join(',');
      if (want !== it.answer) fail(tag + ': wason answer ' + it.answer + ' != ' + want);
      const matching = it.params.cards.filter(c => c.v === 0).map(c => c.id).sort().join(',');
      if (decoy && matching !== it.answer) fail(tag + ': decoy should be the matching-bias-correct version');
      if (!decoy && matching === it.answer) fail(tag + ': non-decoy where matching is right');
    }
    if (key === 'bayes') {
      const p = it.params, post = decoy ? 100 * p.tp / (p.tp + p.fp) : 100 * (p.b * p.s) / (p.b * p.s + (100 - p.b) * p.f);
      if (Math.abs(100 * p.tp / (p.tp + p.fp) - 100 * (p.b * p.s) / (p.b * p.s + (100 - p.b) * p.f)) > 1e-9) fail(tag + ': frequencies inconsistent');
      if (it.atype === 'int') { if (Math.abs(post - +it.answer) > 1e-9) fail(tag + ': bayes int ' + it.answer + ' vs ' + post); }
      else {
        const num = (c) => +lat(c.t).replace(/[^\d]/g, '');
        const right = it.choices.find(c => c.id === it.answer);
        if (num(right) !== Math.round(post)) fail(tag + ': bayes choice ' + right.t + ' vs ' + post);
        it.choices.forEach(c => { if (c.id !== it.answer && Math.abs(num(c) - post) < 4) fail(tag + ': distractor too close'); });
      }
      if (!decoy && !(post <= p.s - 15)) fail(tag + ': trap not meaningful (post close to sensitivity)');
      if (it.form === 'verbal' && p.f !== 100 - p.s) fail(tag + ': witness not symmetric');
    }
    if (key === 'wmchain') {
      const p = it.params;
      if (it.form === 'visual') { let d = p.start; p.ops.forEach(t => { d = (d + t) % 4; }); const right = it.choices.find(c => c.id === it.answer).t; if (['شمال', 'شرق', 'جنوب', 'غرب'][d] !== right) fail(tag + ': direction'); }
      else { let v = p.start; p.ops.forEach(o => { v = o[0] === 'x2' ? v * 2 : o[0] === '+' ? v + o[1] : v - o[1]; }); if (v !== +it.answer) fail(tag + ': chain ' + v + ' vs ' + it.answer); }
      if (it.steps.length !== p.ops.length) fail(tag + ': steps/ops');
      if (decoy ? it.steps.length !== 2 : it.steps.length < 4) fail(tag + ': load level');
    }
    if (key === 'hidden24') {
      const { nums, target } = it.params, used = (it.answer.match(/\d+/g) || []).map(Number).sort((a, b) => a - b).join();
      if (used !== nums.slice().sort((a, b) => a - b).join()) fail(tag + ': numbers used');
      if (Math.abs(evalAscii(it.answer) - target) > 1e-9) fail(tag + ': eval ' + it.answer);
      const ind = indep24(nums, target);
      if (!ind.any) fail(tag + ': no solution (indep)');
      if (decoy && !ind.anyInt) fail(tag + ': decoy without integer path');
      if (!decoy && ind.anyInt) fail(tag + ': non-decoy has an integer-only path ' + nums + '→' + target);
    }
  }
}
// ---------- بررسیِ عبارت ----------
const X = (a, n, t) => A.kexprCheck(a, n, t).ok;
const exprCases = [
  [X('5*(5-1/5)', [1, 5, 5, 5], 24), true], [X('۵ × (۵ − ۱ ÷ ۵)', [1, 5, 5, 5], 24), true], [X('8/(3-8/3)', [3, 3, 8, 8], 24), true],
  [X('55-31', [1, 3, 5, 5], 24), false], [X('-5+29', [5, 29], 24), false], [X('5*5-1', [1, 5, 5, 5], 24), false], [X('5*(5-1/5', [1, 5, 5, 5], 24), false],
  [X('(1+5)*(5-5/5)', [1, 5, 5, 5], 24), false], [X('6/0+24', [6, 0, 24], 24), false], [X('2^3', [2, 3], 8), false]
];
exprCases.forEach((c, i) => { if (c[0] !== c[1]) fail('expr case ' + i); });
// ---------- کنترلِ نشت روی نمونه‌های ساختگی ----------
const L = (o) => A.kleak(Object.assign({ hints: [] }, o));
if (!L({ atype: 'int', prompt: 'حاصل ۱۷ است؛ چند؟', answer: '17' })) fail('leak: int not caught');
if (L({ atype: 'int', prompt: 'حاصلِ ۱۷۰ منهای ۳ چند است؟', answer: '17' })) fail('leak: false positive on 170');
if (!L({ atype: 'choice', prompt: 'پاسخ: شمال', choices: [{ id: 'a', t: 'شمال' }, { id: 'b', t: 'جنوب' }], answer: 'a' })) fail('leak: choice not caught');
if (L({ atype: 'choice', prompt: 'شمال یا جنوب؟', choices: [{ id: 'a', t: 'شمال' }, { id: 'b', t: 'جنوب' }], answer: 'a' })) fail('leak: both-mentioned false positive');
if (!L({ atype: 'int', prompt: 'چند؟', hints: ['راهنما: ۴۲'], answer: '42' })) fail('leak: hint not caught');
// ---------- RNG تکرارپذیر ----------
const r1 = A.krng(42), r2 = A.krng(42); for (let i = 0; i < 20; i++) if (r1() !== r2()) fail('rng not deterministic');
// ---------- ادعاهای ممنوع (§۱۲.۷) در منبع ----------
['دیگر برنمی‌گردد', 'مغزت قوی‌تر', 'ضریب هوشت', 'ضریبِ هوشت', 'IQت'].forEach(w => { if (code.includes(w)) fail('forbidden claim in source: ' + w); });
// ---------- نگاشتِ خانواده‌ها ----------
info.famMap = {}; ['F1', 'F2', 'F3', 'F4', 'F5', 'F11'].forEach(f => { info.famMap[f] = A.kgenFor(f); });
['F3', 'F4', 'F5', 'F11'].forEach(f => { const forms = new Set(); A.kgenFor(f).forEach(k => A.KGEN[k].forms.forEach(x => forms.add(x))); if (forms.size < 3) fail(f + ' has <3 code forms'); });
console.log(JSON.stringify(info, null, 1));
console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
