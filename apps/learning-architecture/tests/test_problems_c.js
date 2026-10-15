// مسئله‌های کوتاهِ تمرینی (src/app/epi_problems_c.js): طرح‌واره، برچسبِ حرکت از ثبت‌گاه (a19)، درستیِ ریاضیِ پاسخ‌ها با محاسبهٔ مستقل،
// سوگیریِ طولِ گزینه و نشتِ ctx — در Node، بی مرورگر. خطا ⇒ کدِ خروجِ غیرصفر.
const fs = require('fs');
const path = require('path');
const APPD = path.join(__dirname, '..', 'src', 'app');
global.window = global;
const errors = [];
const E = (c, m) => { if (!c) errors.push(m); };
function load(f) { (0, eval)(fs.readFileSync(path.join(APPD, f), 'utf8')); }

load('epi_problems.js'); load('epi_problems_b.js');
const nOld = window.EPI_PROBLEMS.length, oldIds = new Set(window.EPI_PROBLEMS.map(p => p.id));
load('epi_problems_c.js');
const NEW = window.EPI_PROBLEMS.slice(nOld);
E(nOld === 13, 'older sets changed: ' + nOld);
const BOOK = NEW.filter(p => p.set === 'book4'), EXTRA = NEW.filter(p => p.set === 'practice');
E(BOOK.length === 20, 'expected 20 book-four practice problems, got ' + BOOK.length);
// R3 (۲۰۲۶-۱۰-۱۵): مسئله‌های کوتاهِ نوشتهٔ سازنده برای حرکت‌هایی که در آن بیست مسئله گامی نداشتند
E(EXTRA.length >= 6 && BOOK.length + EXTRA.length === NEW.length, 'practice set: ' + EXTRA.length + ' / ' + NEW.length);

// ثبت‌گاهِ حرکت‌ها از خودِ a19 (بی DOM): فقط آرایهٔ MOVES و ASK را می‌خوانیم
const src19 = fs.readFileSync(path.join(APPD, 'a19_moves.js'), 'utf8');
const ids = [...src19.matchAll(/\{ id: "(mv_[a-z]+)", fa:/g)].map(m => m[1]);
const MV = new Set(ids);
E(ids.length === 27, 'moves registry: ' + ids.length);
const NEWMV = ['mv_unknown', 'mv_auxiliary', 'mv_partcond', 'mv_definition', 'mv_usedata', 'mv_auxproblem', 'mv_symmetry', 'mv_dimcheck', 'mv_recombine', 'mv_vary', 'mv_equation'];
NEWMV.forEach(m => E(MV.has(m), 'new move missing from registry: ' + m));

const STR = v => typeof v === 'string' && v.trim().length > 0;
const per = {}, info = {};
NEW.forEach(p => {
  const P = p.id + ': ';
  E(!oldIds.has(p.id), P + 'duplicate id');
  E((p.set === 'book4' || p.set === 'practice') && p.neutral === true, P + 'set/neutral flags');
  ['title', 'field', 'statement', 'answer', 'why_hard'].forEach(k => E(STR(p[k]), P + 'missing ' + k));
  E(p.udc && STR(p.udc.unknown) && STR(p.udc.data) && STR(p.udc.condition), P + 'udc {unknown, data, condition}');
  E(Array.isArray(p.src) && p.src.length && (p.set === 'book4' ? /Pólya/.test(p.src[0]) : /نوشتهٔ سازنده/.test(p.src[0])), P + 'src');
  E(Array.isArray(p.cases) && !p.cases.length, P + 'no backtest cases');
  E(Array.isArray(p.lessons) && p.lessons.length >= 3, P + 'lessons >= 3');
  E(Array.isArray(p.stages) && p.stages.length >= 3 && p.stages.length <= 6, P + 'stages 3..6');
  const sids = new Set();
  p.stages.forEach(s => {
    const S = P + s.id + ': ';
    E(STR(s.id) && !sids.has(s.id), S + 'id'); sids.add(s.id);
    ['ctx', 'q', 'move', 'idea', 'hint'].forEach(k => E(STR(s[k]), S + 'missing ' + k));
    E(['u', 'p', 'c', 'b'].includes(s.ph), S + 'ph');
    E(Array.isArray(s.mv) && s.mv.length >= 1 && s.mv.length <= 2 && s.mv.every(x => MV.has(x)), S + 'mv ' + JSON.stringify(s.mv));
    (s.mv || []).forEach(x => { per[x] = (per[x] || 0) + 1; });
    E(Number.isInteger(s.lvl) && s.lvl >= 1 && s.lvl <= 5, S + 'lvl');
    E(Array.isArray(s.opts) && s.opts.length === 3 && s.opts.filter(o => o.ok === true).length === 1, S + '3 opts, exactly one ok');
    s.opts.forEach((o, j) => E(STR(o.t) && STR(o.why) && typeof o.ok === 'boolean', S + 'opt ' + j));
    E(new Set(s.opts.map(o => o.t)).size === 3, S + 'duplicate options');
  });
  info[p.id] = p.stages.length;
});
// هر حرکتِ تازه دست‌کم در ۳ گام قاطع است (ت۵: «برچسب‌زدنِ دست‌کم سه گام برای هر کدام»)
NEWMV.forEach(m => E((per[m] || 0) >= 3, 'move ' + m + ' tagged on ' + (per[m] || 0) + ' stages (< 3)'));
// R3: هر حرکتی که در بیست مسئله گام نداشت، حالا دست‌کم یک گامِ تمرینی دارد (با گزینهٔ پیش‌فرضِ «مسئله‌های کوتاهِ تمرینی»)
['mv_backward', 'mv_contra', 'mv_invariant', 'mv_impossible', 'mv_extend', 'mv_assume', 'mv_control', 'mv_measure', 'mv_anomaly'].forEach(m => E((per[m] || 0) >= 1, 'move ' + m + ' has no practice stage'));
E(ids.every(m => (per[m] || 0) >= 1), 'every registry move has a practice stage: missing ' + ids.filter(m => !per[m]).join(','));
// گام‌های بازنگری: دست‌کم در نیمی از مسئله‌ها
E(NEW.filter(p => p.stages.some(s => s.ph === 'b')).length >= 10, 'looking-back stages in fewer than 10 problems');

// ---------- سوگیریِ گزینه‌ها و نشتِ ctx (همان سنجه‌های test_problems_b) ----------
const strip = s => String(s).replace(/[⁦-⁩]/g, '');
const norm = s => strip(s).replace(/[ً-ْٔ‌]/g, '').replace(/[«»()،؛:.,؟?!"'\[\]\/…\-—]/g, ' ');
const toks = s => norm(s).split(/\s+/).filter(Boolean);
const grams = (s, n) => { const t = toks(s), g = new Set(); for (let i = 0; i + n <= t.length; i++) g.add(t.slice(i, i + n).join(' ')); return g; };
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
let botRight = 0, botTotal = 0, longAll = 0, closeAll = 0, nAll = 0;
NEW.forEach(p => {
  let longS = 0;
  p.stages.forEach(s => {
    const L = s.opts.map(o => strip(o.t).length), k = s.opts.findIndex(o => o.ok), W = L.filter((_, i) => i !== k), mw = mean(W);
    if (L[k] >= Math.max(...W)) { longS++; longAll++; }
    if (Math.abs(L[k] - mw) <= 0.35 * mw) closeAll++;
    nAll++;
    const pick = L.indexOf(Math.max(...L)); botTotal++; if (s.opts[pick].ok) botRight++;
    const cg = grams(s.ctx, 4), shared = [...grams(s.opts[k].t, 4)].filter(g => cg.has(g));
    E(!shared.length, p.id + ':' + s.id + ' ctx gives away the correct option: ' + shared.join(' | '));
  });
  E(longS <= Math.max(1, Math.floor(0.5 * p.stages.length)), p.id + ': correct option longest in ' + longS + '/' + p.stages.length);
});
E(longAll <= 0.45 * nAll, 'correct option is the longest in ' + longAll + '/' + nAll + ' stages overall (max 45%)');
E(closeAll >= 0.6 * nAll, 'length-comparable stages ' + closeAll + '/' + nAll + ' (min 60%)');
E(botRight / botTotal < 0.55, 'longest-option bot ' + botRight + '/' + botTotal + ' (must stay < 55%)');

// ---------- درستیِ ریاضیِ پاسخ‌ها (محاسبهٔ مستقل) ----------
const near = (a, b) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
// ۳: کمینهٔ ده جیبِ نابرابر
E([...Array(10).keys()].reduce((a, b) => a + b, 0) === 45 && 45 > 44, 'p3');
// ۴: رقم‌های ۱..۱۰۲۴
{ let d = 0; for (let i = 1; i <= 1024; i++) d += String(i).length; E(d === 2989, 'p4 digits ' + d); let d2 = 0; for (let i = 1; i <= 999; i++) d2 += String(i).length; E(d2 === 2889, 'p4 999'); }
// ۵: یکتاییِ رقم‌ها
{ const sols = []; for (let a = 1; a <= 9; a++) for (let b = 0; b <= 9; b++) { const n = +(a + '679' + b); if (n % 72 === 0) sols.push(n); } E(sols.length === 1 && sols[0] === 36792 && 36792 / 72 === 511, 'p5 ' + sols); }
// ۷: کمانِ ۴۵ درجه — زاویهٔ دیدِ مربع از نقطه‌ای روی ربع‌دایرهٔ گوشه و روی کمانِ روبه‌روی ضلع
{ const sq = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const view = (P) => { const ang = sq.map(q => Math.atan2(q[1] - P[1], q[0] - P[0])); let best = 0; for (const a of ang) for (const b of ang) { let d = Math.abs(a - b); if (d > Math.PI) d = 2 * Math.PI - d; best = Math.max(best, d); } return best * 180 / Math.PI; };
  E(Math.abs(view([Math.cos(1.25 * Math.PI), Math.sin(1.25 * Math.PI)]) - 45) < 1e-6, 'p7 corner arc');
  const c = [0.5, -0.5], r = Math.SQRT1_2, th = 1.5 * Math.PI; E(Math.abs(view([c[0] + r * Math.cos(th), c[1] + r * Math.sin(th)]) - 45) < 1e-6, 'p7 side arc');
  E(Math.abs(view([0.5, -0.5]) - 90) < 1e-6, 'p7 semicircle'); }
// ۸: ۴ + ۶ + ۳
E(8 / 2 + 12 / 2 + 6 / 2 === 13, 'p8');
// ۹: حجم با دترمینان: یال‌ها روی x و y، فاصلهٔ b روی z
{ const a = 2.3, b = 1.7, P = [[-a / 2, 0, 0], [a / 2, 0, 0], [0, -a / 2, b], [0, a / 2, b]];
  const v = (u, w) => u.map((x, i) => x - w[i]); const [u1, u2, u3] = [v(P[1], P[0]), v(P[2], P[0]), v(P[3], P[0])];
  const det = u1[0] * (u2[1] * u3[2] - u2[2] * u3[1]) - u1[1] * (u2[0] * u3[2] - u2[2] * u3[0]) + u1[2] * (u2[0] * u3[1] - u2[1] * u3[0]);
  E(near(Math.abs(det) / 6, a * a * b / 6), 'p9 volume'); }
// ۱۱: دستگاه
{ const A = [[1, 2, 3, 4], [2, 1, 5, 3], [3, 5, 1, 2], [4, 3, 2, 1]], B = [-5, 2, -2, 5], X = [2, -1, 1, -2];
  A.forEach((row, i) => E(row.reduce((s, c, j) => s + c * X[j], 0) === B[i], 'p11 eq ' + i));
  // یکتایی: دترمینانِ ناصفر (بسطِ لاپلاس)
  const det = M => M.length === 1 ? M[0][0] : M[0].reduce((s, c, j) => s + (j % 2 ? -1 : 1) * c * det(M.slice(1).map(r => r.filter((_, k) => k !== j))), 0);
  E(det(A) !== 0, 'p11 singular'); }
// ۱۲: شبیه‌سازیِ یک دور با t₂ = ۱
{ for (const [c, p] of [[10, 3], [7, 2], [5, 1]]) {
    const t2 = 1, t1 = (c + p) / (c - p) * t2, t3 = t1, T = t1 + t2 + t3;
    const paul = c * t1 + p * (t2 + t3), peter = p * (t1 + t2) + c * t3, bobMeet = c * (t1 - t2), peterAtMeet = p * (t1 + t2);
    E(near(paul, peter) && near(bobMeet, peterAtMeet), 'p12 cycle ' + c + ',' + p);
    E(near(peter / T, c * (c + 3 * p) / (3 * c + p)), 'p12 speed'); E(near(t2 / T, (c - p) / (3 * c + p)), 'p12 fraction'); } }
// ۱۳
{ for (const [ap, gp] of [[[68, 42, 16], [17, 34, 68]], [[17, 42, 67], [68, 34, 17]]]) {
    E(ap[1] - ap[0] === ap[2] - ap[1] && gp[1] * gp[1] === gp[0] * gp[2], 'p13 progressions');
    E(ap[0] + gp[0] === 85 && ap[1] + gp[1] === 76 && ap[2] + gp[2] === 84 && ap[0] + ap[1] + ap[2] === 126, 'p13 sums'); } }
// ۱۴
{ for (const m of [6, -6 / 19]) {
    const s = 3 * m + 2, disc = s * s - 4 * m * m, y1 = (s + Math.sqrt(disc)) / 2, y2 = (s - Math.sqrt(disc)) / 2;   // y = x²
    // ریشه‌ها: ±√y1، ±√y2 (حقیقی یا موهومی) — تصاعد یعنی y1 = 9·y2 (یا برعکس)
    E(near(Math.max(Math.abs(y1), Math.abs(y2)), 9 * Math.min(Math.abs(y1), Math.abs(y2))), 'p14 m=' + m);
    E(near(19 * m * m - 108 * m - 36, 0), 'p14 quadratic ' + m); } }
// ۱۵
E(15 + 20 + 25 === 60 && 15 * 15 + 20 * 20 === 625 && 15 * 20 === 12 * 25, 'p15');
// ۱۶: هندسهٔ تصادفی ⇒ فرمول
{ for (let t = 0; t < 20; t++) {
    const x = 1 + t * 0.37, A = [-(2 + t % 5), 0.5 * t, 0], B = [3 + (t % 3), -1 - 0.2 * t, 0], Q = [0.4, 0.9, x];
    const d = (u, w) => Math.hypot(u[0] - w[0], u[1] - w[1], u[2] - w[2]);
    const a = d(A, Q), b = d(B, Q), c = d(A, B), sa = x / a, sb = x / b, cg = (a * a + b * b - c * c) / (2 * a * b);
    const x2 = c * c * sa * sa * sb * sb / (sa * sa + sb * sb - 2 * sa * sb * cg);
    E(near(x2, x * x), 'p16 formula ' + t); } }
// ۱۷
{ const f = n => n <= 1 ? 1 : n * f(n - 1); for (let n = 1; n <= 10; n++) { let s = 0; for (let k = 1; k <= n; k++) s += k / f(k + 1); E(near(s, 1 - 1 / f(n + 1)), 'p17 n=' + n); } }
// ۱۸
{ let odd = 1; for (let n = 1; n <= 12; n++) { const row = []; for (let k = 0; k < n; k++) { row.push(odd); odd += 2; } E(row.reduce((a, b) => a + b, 0) === n ** 3 && row[0] === n * n - n + 1 && row[n - 1] === n * n + n - 1, 'p18 n=' + n); } }
// ۱۹: شمارشِ مستقیم روی شبکهٔ مثلثی (مختصاتِ محوری)
{ for (let n = 1; n <= 6; n++) {
    const inside = (q, r) => Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r)) <= n;
    const V = []; for (let q = -n; q <= n; q++) for (let r = -n; r <= n; r++) if (inside(q, r)) V.push([q, r]);
    const key = (q, r) => q + ',' + r, S = new Set(V.map(v => key(...v)));
    let L = 0; V.forEach(([q, r]) => [[1, 0], [0, 1], [-1, 1]].forEach(([dq, dr]) => { if (S.has(key(q + dq, r + dr))) L++; }));
    let T = 0; V.forEach(([q, r]) => { if (S.has(key(q + 1, r)) && S.has(key(q, r + 1))) T++; if (S.has(key(q + 1, r)) && S.has(key(q + 1, r - 1))) T++; });
    E(V.length === 3 * n * n + 3 * n + 1 && L === 9 * n * n + 3 * n && T === 6 * n * n, 'p19 n=' + n + ' V' + V.length + ' L' + L + ' T' + T); } }
// ۲۰
{ let w = 0; for (let h = 0; h <= 2; h++) for (let q = 0; q <= 4; q++) for (let d = 0; d <= 10; d++) for (let n = 0; n <= 20; n++) { const rest = 100 - 50 * h - 25 * q - 10 * d - 5 * n; if (rest >= 0) w++; } E(w === 292, 'p20 ' + w);
  let w50 = 0; for (let h = 0; h <= 1; h++) for (let q = 0; q <= 2; q++) for (let d = 0; d <= 5; d++) for (let n = 0; n <= 10; n++) if (50 - 50 * h - 25 * q - 10 * d - 5 * n >= 0) w50++; E(w50 === 50, 'p20 E50 ' + w50); }

// ---------- R3: درستیِ شش مسئلهٔ «practice» (محاسبهٔ مستقل) ----------
// سکه‌ها: وضعِ باخت (برای نوبت‌دار) با برنامه‌ریزیِ پویا؛ مضرب‌های ۵ و نخستین حرکتِ ۳ از ۲۳
{ const lose = [true]; for (let n = 1; n <= 40; n++) lose[n] = ![1, 2, 3, 4].some(k => k <= n && lose[n - k]);
  E(lose.every((v, n) => v === (n % 5 === 0)), 'coins: losing positions are multiples of 5');
  const moves = [1, 2, 3, 4].filter(k => lose[23 - k]); E(moves.length === 1 && moves[0] === 3, 'coins: unique winning first move ' + moves); }
// ریشهٔ دو: هیچ a، b ≤ ۲۰۰۰ با a² = 2b²، و گامِ نزول: a² = 2b² ⇒ a زوج
{ let found = 0; for (let b = 1; b <= 2000; b++) { const a = Math.round(Math.SQRT2 * b); if (a * a === 2 * b * b) found++; } E(found === 0, 'sqrt2 has a rational square root?'); }
// شطرنجِ بریده: شمارِ رنگ‌ها پس از بریدنِ (۰،۰) و (۷،۷)
{ let bl = 0, wh = 0; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { if ((i === 0 && j === 0) || (i === 7 && j === 7)) continue; ((i + j) % 2 ? wh++ : bl++); } E(bl === 30 && wh === 32 && (0 + 0) % 2 === (7 + 7) % 2, 'board colours ' + bl + '/' + wh); }
// مزدوج‌ها: x_n = (2+√3)ⁿ + (2−√3)ⁿ با بازگشتِ x_{n+1} = 4x_n − x_{n−1} صحیح است و با عددِ اعشاری هم می‌خواند
{ let a = 2n, b = 4n; const xs = [2n, 4n]; for (let n = 2; n <= 12; n++) { const c = 4n * b - a; xs.push(c); a = b; b = c; }
  xs.forEach((x, n) => E(Math.abs(Number(x) - (Math.pow(2 + Math.sqrt(3), n) + Math.pow(2 - Math.sqrt(3), n))) < 1e-6 * Math.max(1, Number(x)), 'conj n=' + n));
  // a + b√3 ⇒ a − b√3: ضربِ نمادین
  let p = [1, 0], q = [1, 0]; for (let n = 1; n <= 8; n++) { p = [2 * p[0] + 3 * p[1], p[0] + 2 * p[1]]; q = [2 * q[0] - 3 * q[1], -q[0] + 2 * q[1]]; E(q[0] === p[0] && q[1] === -p[1] && 2 * p[0] === Number(xs[n]), 'conj conjugate n=' + n); } }
// نُه نقطه: مسیرِ چهارپاره که از هر نُه نقطه می‌گذرد (بیرون از قاب)
{ const route = [[0, 0], [0, 3], [3, 0], [0, 0], [2, 2]];   // پیوسته: هر پاره از پایانِ قبلی؛ نقطه‌ها شبکهٔ {0,1,2}²
  const pts = []; for (let x = 0; x <= 2; x++) for (let y = 0; y <= 2; y++) pts.push([x, y]);
  const on = (pt, A, B) => { const cr = (B[0] - A[0]) * (pt[1] - A[1]) - (B[1] - A[1]) * (pt[0] - A[0]); if (Math.abs(cr) > 1e-9) return false; const d = (pt[0] - A[0]) * (B[0] - A[0]) + (pt[1] - A[1]) * (B[1] - A[1]); return d >= -1e-9 && d <= (B[0] - A[0]) ** 2 + (B[1] - A[1]) ** 2 + 1e-9; };
  const nseg = route.length - 1, covered = pts.every(pt => route.slice(1).some((B, i) => on(pt, route[i], B)));
  const outside = route.some(([x, y]) => x < 0 || x > 2 || y < 0 || y > 2);
  E(nseg === 4 && covered && outside, 'nine dots: 4 connected segments cover all 9 points, leaving the frame'); }
// آونگ: تنها ترکیبِ توانیِ l، g، m با بُعدِ زمان، √(l/g) است (جرم بی‌اثر)
{ const H = [-2, -1, -0.5, 0, 0.5, 1, 2], sols = []; for (const el of H) for (const eg of H) for (const em of H) { const M = em, L = el + eg, T = -2 * eg; if (M === 0 && L === 0 && T === 1) sols.push([el, eg, em]); }
  E(sols.length === 1 && sols[0].join() === '0.5,-0.5,0', 'pendulum dimensional form ' + JSON.stringify(sols)); }

// build.py: فایل در btfiles پس از epi_problems_b.js
const build = fs.readFileSync(path.join(__dirname, '..', 'build.py'), 'utf8');
E(/"epi_problems_b\.js",\s*"epi_problems_c\.js"/.test(build), 'build.py btfiles must list epi_problems_c.js right after epi_problems_b.js');
// بی برچسبِ «پولیا» در متن‌های نمایشی (فقط در منبع/توضیحِ کد)
NEW.forEach(p => { const vis = JSON.stringify([p.title, p.field, p.statement, p.answer, p.why_hard, p.udc, p.lessons, p.stages]); E(!/پولیا/.test(vis), p.id + ': visible text names the source as a label'); });

console.log(JSON.stringify({ problems: NEW.length, stages: nAll, perMove: per, longestCorrect: longAll + '/' + nAll, comparable: closeAll + '/' + nAll, bot: botRight + '/' + botTotal }, null, 1));
if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
