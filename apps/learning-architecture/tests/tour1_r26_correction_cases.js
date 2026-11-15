// تورِ پولیا (دورِ ۲۶) — خانوادهٔ Q2، نقص‌های دونده‌ها با نوبتِ خودشان (کتابخانه؛ آزمون نیست). هر مورد: fixture ِ بازپخش (tests/fixtures/r26_correction/<نام>.json) + سنجه.
//  «base» = آنچه دونده روی BASE26 دید (همان بازپخش روی BASE26 همین را داد — «Reproduce first»، FIX26)؛ سنجه‌ها روی BASE26 قرمزند و هر مثبت بدلِ منفیِ خودش را در همان مورد دارد.
const J = (x) => JSON.stringify(x);
/* عکسِ وضع پس از بازپخش */
const SNAP = () => { const s = APP.ASSIST.cur(), C = s.coach || {}, T = C.story || {}, probs = (APP.liveAll ? APP.liveAll() : []).map(r => { const pid = r.p.id, so = (APP.S.get('eprog_' + pid) || {}).solve || {}, L = so.live || {};
    return { pid, title: r.p.title, st: r.p.statement, state: L.state || '', stale: (APP.liveStale ? APP.liveStale(pid) : []).map(x => ({ k: x.k.replace(/achat_\w+:/, ''), v: x.v, re: x.re, raw: x.raw })), prior: L.prior ? L.prior.steps.map(x => ({ n: x.n, v: x.verdict, stale: !!x.stale, t: (x.fixed && x.fixed.t) || x.quote })) : null, resume: L.prior ? L.prior.resume : null,
      dl: ((so.u && so.u[1] || {}).dl || []).map(x => x.t), measure: ((so.u && so.u[1] || {}).prac || {}).measure || '', evlog: (L.evlog || []).map(e => e.title + ' :: ' + (e.lines || []).join(' | ')), strip: APP.liveCorrStale ? APP.liveCorrStale({ pid, sess: s.id }) : undefined }; });
  let pr = null; Object.keys(T).forEach(k => { if (T[k] && T[k].prior && ((T[k].prior.steps || []).length || !pr)) pr = T[k].prior; });   // دفترِ گفت‌وگو با گام (نه دفترِ تهیِ مسئلهٔ زنده)
  return { probs, sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text), ai: s.msgs.filter(m => m.role === 'ai').map(m => m.text).slice(-2), ch: (C.retNote || {}).ch || [], res: (C.retNote || {}).res || null, refused: (C.retNote || {}).refused || null,
    ev: (s.coachEv || []).filter(e => e.how === 'res' && !e.wd).map(e => ({ span: (e.src20 || {}).span, stale: e.stale ? (e.stale.ask ? 'ask' : 'yes') : '' })), asks: (s.copyAsk || []).map(q => ({ path: q.path, label: q.label, old: q.old, new: q.new, state: q.state })),
    story: Object.keys(T).reduce((a, k) => a.concat((T[k].items || []).map(it => it.k + ':' + it.t)), []), sevlog: (s.evlog || []).map(e => e.title + ' :: ' + (e.lines || []).join(' | ')), chatPrior: pr ? pr.steps.map(x => ({ n: x.n, v: x.verdict, stale: !!x.stale })) : null,
    sstale: (s.stale26 || []).map(e => e.items.map(x => x.v + '>' + (x.re == null ? '?' : x.re)).join(' ')), sstrip: APP.liveCorrStale ? APP.liveCorrStale({ pid: '', sess: s.id }) : undefined, retracts: (C.retracts || []).map(x => (x.ok ? 'OK ' : 'ERR ' + x.err + ' ') + (x.frag || (x.x || {}).msg || '') + ' ⇒ ' + (x.fix || (x.x || {}).fix || '')) }; };
const all = (x) => J([x.sys, x.ch, x.res]);
const lastCorr = (x) => x.sys.filter(t => /اصلاح شد|اصلاح انجام نشد|چیزی برای عوض کردن|رکوردی ساخته نشده/.test(t)).slice(-1)[0] || '';
const stV = (pr, v, re) => pr.stale.some(z => Math.abs(z.v - v) < 1e-9 && (re === undefined ? true : re === null ? z.re == null : z.re != null && Math.abs(z.re - re) < 1e-6));
const CASES = {
  /* ---------------- گروهِ B (U-table ِ داورِ کور) ---------------- */
  // U4 + U5 (B26·D19، B26x·D14) pwB1 p13: «گامِ ۷ کهنه شد» (کابلِ «۱۵ متری») و «نتیجهٔ «۱۸۰ ÷ ۱۲ = ۱۵ آمپر و کابل هم ۱۵ متر» دیگر برقرار نیست — بر «۱۵ متره» بنا بود»؛ گام‌های ۲ تا ۵ و ۱۰ تا ۱۲ دست‌نخورده
  B_pwB1: { name: 'U4/U5 pwB1 «ارتفاع ۱۸ متره نه ۱۵»: the ledger steps really built on the height (2, 3, 4, 10, 11, 12) go stale with exact values; the cable step 7 («… میشه ۱۵ متر») and «۱۸۰ ÷ ۱۲ = ۱۵ آمپر و کابل هم ۱۵ متر» never do',
    check: (x) => { const p = x.probs[0], L = lastCorr(x), st = (p.prior || []).filter(s => s.stale).map(s => s.n);
      return { ok: [2, 3, 4, 10, 11, 12].every(n => st.includes(n)) && ![1, 6, 7, 8, 9].some(n => st.includes(n)) && !/گامِ ۷ کهنه/.test(L) && !/کابل هم ۱۵ متر» دیگر برقرار نیست|«۱۸۰ ÷ ۱۲ = ۱۵ آمپر[^»]*»: از/.test(all(x)) && !x.asks.some(q => /کابل هم ۱۸ متر/.test(q.new))
        && stV(p, 294300, 353160) && stV(p, 0.082, 0.098) && stV(p, 245, 294) && stV(p, 102, 123) && stV(p, 0.43, 0.51) && !p.stale.some(z => z.v === 15 || z.v === 12 || z.v === 10) && /گام‌های ۲، ۳، ۴، ۱۰، ۱۱، ۱۲ کهنه/.test(L), got: { st, L: L.slice(-260), stale: p.stale.map(z => z.raw + '>' + z.re), asks: x.asks.map(q => q.new) } }; } },
  // U6 (B26·D4 / B26x·D5) s17 p7: «نتیجهٔ «۰.۷» دیگر برقرار نیست — بر «200 m^2» بنا بود»؛ ۲۴ / ۱۶.۸ / ۱۷ نام برده نشدند — و U38 (B25·D27): پس از «بله» «حجم = ۱۸۰ مترمربع × ۰٫۱۲ متر × ۰٫۸ = ۱۹ متر»
  B_s17: { name: 'U6/U38 s17 «بام ۱۸۰ مترمربعه نه ۲۰۰»: the RESULT «۲۴ × ۰.۷ = ۱۶.۸» is named stale (24 ⇒ 21.6, 16.8 ⇒ 15.12), never the coefficient «۰.۷»; the plan number 17 is asked; after «بله» the formula field is the exact recomputation (… = ۱۷), never «۱۸۰ … = ۱۹»', upto: 39,
    check: (x) => { const p = x.probs[0], L = x.sys.filter(t => /200 m\^2|۱۸۰ مترمربع/.test(t)).join(' ‖ ');
      return { ok: !/نتیجهٔ «۰[.٫]۷»/.test(all(x) + L) && /نتیجهٔ «حساب نهایی ۲۴ × ۰\.۷ = ۱۶\.۸ مترمکعب» دیگر برقرار نیست/.test(L) && /۲۴ ⇒ ۲۱٫۶/.test(L) && /۱۶٫۸ ⇒ ۱۵٫۱۲/.test(L) && /«[^»]*۱۷[^»]*»: از «200 m\^2» حساب شده بود؟/.test(L) && !/۰٫۷ ⇒|۰٫۱۲ ⇒|۱۲۰ ⇒/.test(L)
        && /= ۱۷ متر/.test(p.measure) && /۱۸۰ مترمربع/.test(p.measure) && !/= ۱۹/.test(p.measure), got: { L: L.slice(0, 700), measure: p.measure, ev: x.ev } }; } },
  // U7 s19 c81: «عددهای حساب‌شده از «۱۶ هفته»: «۰٫۵، ۳٫۵» … (۰٫۵ ⇒ ≈ ۰٫۴۴، ۳٫۵ ⇒ ≈ ۳٫۴۴۴)» — ۳٫۵ اندازهٔ سنجیده است
  B_s19: { name: 'U7 s19 «۱۸ هفته … نه ۱۶»: the derived rate «نیم کیلو» IS stale (8 ÷ 18), the measured «۳٫۵ کیلو کم کردم» never is (no «⇒ ≈ ۳٫۴۴۴»)',
    check: (x) => { const p = x.probs.filter(q => /۱۸ هفته/.test(q.st))[0] || x.probs[0], L = lastCorr(x);
      return { ok: !!p && p.stale.some(z => z.v === 0.5 && z.re != null && Math.abs(z.re - 8 / 18) < 1e-6) && !p.stale.some(z => z.v === 3.5) && !/۳٫۵|۳٫۴۴۴/.test(L) && /۰٫۵ ⇒ ≈ ۰٫۴۴/.test(L) && x.ev.filter(e => /۳٫۵ کیلو/.test(e.span)).every(e => !e.stale), got: { L: L.slice(0, 500), stale: p && p.stale.map(z => z.raw + '>' + z.re), ev: x.ev } }; } },
  // U31 (B26·D2) s16: پس از «۳۰ متره نه ۲۴» نوار همچنان «مانده: فقط بازنگریِ خودت — حل به نتیجه رسید»
  B_s16: { name: 'U31 s16 «حصار دورش ۳۰ متره نه ۲۴»: the strip no longer says a plain «حل به نتیجه رسید» for the result reached with 24', strip: true,
    check: (x) => ({ ok: !!x.sstrip && /نتیجه با عددِ پیشین به دست آمده بود/.test(x.stripText || '') && !/حل به نتیجه رسید/.test(x.stripText || ''), got: { sstrip: x.sstrip, strip: (x.stripText || '').slice(0, 300), sys: x.sys.slice(-1) } }) },
  // U33 + U34 (B26·D5، B26x·D1) s11: فهرستِ کهنه ۹۸ و ۴۹ را ندارد؛ پس از «بله» داده «صفحهٔ ۸×۸ (۱۰۰ خانه)»
  B_s11: { name: 'U33/U34 s11 «۸×۸ نه ۱۰×۱۰»: his own 98 and 49 are in the stale list (⇒ 62, 31); after «بله» the datum reads «۸×۸ (۶۴ خانه)», never «۸×۸ (۱۰۰ خانه)»', upto: 54,
    check: (x) => { const p = x.probs[0], L = x.sys.filter(t => /۱۰×۱۰/.test(t) && /کهنه/.test(t)).join(' ‖ ');
      return { ok: /۹۸ ⇒ ۶۲/.test(L) && /۴۹ ⇒ ۳۱/.test(L) && /۱۰۰ ⇒ ۶۴/.test(L) && /۵۰ ⇒ ۳۲/.test(L) && /۴۸ ⇒ ۳۰/.test(L) && !p.dl.some(t => /۸×۸ \(۱۰۰/.test(t)) && !x.asks.some(q => /۸×۸ \(۱۰۰/.test(q.new)) && (p.dl.some(t => /۸×۸ \(۶۴ خانه\)/.test(t)) || x.asks.some(q => /۸×۸ \(۶۴ خانه\)/.test(q.new))), got: { L: L.slice(0, 500), dl: p.dl, asks: x.asks.map(q => q.label + '|' + q.new + '|' + q.state) } }; } },
  // B26·D4 class (aB3 p12): «کسری ۵.۷ میلیون …» پس از «حقوقم ۱۹ میلیونه» بی نشان ماند
  B_aB3: { name: 'B26·D4 aB3 «حقوقم ماهی ۱۸ نیست، ۱۹ میلیونه»: «۱۸ ضربدر ۱.۲ = ۲۱.۶» (⇒ 22.8) and the deficit «۵.۷» built on it (⇒ 4.5) are stale; her expense «۲۷.۳» is not',
    check: (x) => { const p = x.probs[0], L = lastCorr(x); return { ok: /۲۱٫۶ ⇒ ۲۲٫۸/.test(L) && /۵٫۷ ⇒ ۴٫۵/.test(L) && !/۲۷٫۳ ⇒|۴٫۸ ⇒|۲۱ ⇒|۱٫۳ ⇒/.test(L), got: { L: L.slice(0, 900), stale: p && p.stale.map(z => z.k + ' ' + z.raw + '>' + z.re), ev: x.ev } }; } },
  // U16 (B26·D29) oB1 p4: «چیزی برای عوض کردن نبود» در حالی که مجهولِ ثبت‌شده «… دو روز …» مانده
  B_oB1: { name: 'U16 oB1 «دو روز ⇒ سه روز»: never «چیزی برای عوض کردن نبود» while a record still holds «دو روز»', upto: 5,
    check: (x) => { const hold = J([x.story, Object.values((x.unk || {}))]), L = x.sys.slice(-2).join(' ‖ ');
      return { ok: !(/چیزی برای عوض کردن نبود|ثبت نشده بود/.test(L) && /دو روز/.test(hold)) && (/سه روز/.test(hold + J(x.asks)) || !/دو روز/.test(hold)), got: { L, story: x.story, unk: x.unk, asks: x.asks, retracts: x.retracts } }; } },
  /* ---------------- گروه‌های A، C، D (بازتولید روی BASE26 پیش از اصلاح) ---------------- */
  // A26-15 s04 p13: «۱۱ میلیارد تقسیم بر ۴ نفر میشه ۲٫۷۵ میلیارد» پس از «۵ نفر وارثیم نه ۴» کهنه نشان داده نشد
  A_s04: { name: 'A26-15 s04 «۵ نفر وارثیم نه ۴ نفر»: «۲٫۷۵ میلیارد» (⇒ 2.2) and the instalment built on it are stale; the house price «۱۱ میلیارد» and «۱۰ قسط» are not — and A25-9 s04 p7: the list index «۲.» is never stale',
    check: (x) => { const L = lastCorr(x), A = x.sys.join(' ‖ '); return { ok: /۲٫۷۵ ⇒ ۲٫۲/.test(L) && !/۱۱ ⇒|۱۰ ⇒/.test(L) && !/«۲» — کهنه|۲ ⇒ ۲٫۷۵/.test(A), got: { L: L.slice(0, 700) } }; } },
  // A26-15 s07: تفاضل‌های «۵، ۴، ۳، ۱» پس از ✏️ ِ قدها (۹⇒۸، ۱۶⇒۱۵) کهنه نشان داده نشدند
  // نکرده (گزارش‌شده، FIX26 «never silently skipped»): fixture ِ s07 نوبتِ ✏️ ِ قدها را ندارد (کنترلِ دونده در round26A/s07 آن را ضبط نکرد) ⇒ بازپخش به اصلاح نمی‌رسد؛ سازوکار (تفاضلِ نام‌برده) با بانکِ R26 #47 سنجیده است
  A_s07: { notDone: 'fixture lacks the runner ✏️ turn (9⇒8, 16⇒15) — not reproducible by replay; mechanism covered by bank R26 #47', name: 'A26-15 s07 ✏️ «۹⇒۸، ۱۶⇒۱۵»: each difference that touches an edited height is stale with the exact value (5 ⇒ 4, 4 ⇒ 5, 3 ⇒ 2, 1 ⇒ 2); her raw data are not',
    check: (x) => { const A = x.sys.join(' ‖ '), p = x.probs[0]; return { ok: /۵ ⇒ ۴/.test(A) && /۴ ⇒ ۵/.test(A) && /۳ ⇒ ۲/.test(A) && /۱ ⇒ ۲/.test(A) && !/۱۳ ⇒|۱۷ ⇒|۱۰ ⇒|۶ ⇒/.test(A), got: { sys: x.sys.slice(-3), stale: p && p.stale.map(z => z.raw + '>' + z.re), sstale: x.sstale } }; } },
  // A26-34 tA1 p8→p11: «۱٫۶ لیتر شد، نه ۲ … حالا اون بخشِ ۶: … چطوری بفهمم …؟» ⇒ «این اصلاح انجام نشد: این پیام پرسش بود، نه اصلاح»
  A_tA1: { name: 'A26-34 tA1 «۱٫۶ لیتر شد، نه ۲ … ؟»: a message with a correction AND a question records the correction (never «پرسش بود»); «روزی ۱۳ دقیقه» built on the flow rate is reached (⇒ 17, her own number); the per-day «۲ لیتر» of each shrub is never touched',
    check: (x) => { const A = x.sys.join(' ‖ '); return { ok: !/پرسش بود، نه اصلاح|مقدارِ درست در همین پیام نیامده/.test(A) && /اصلاح شد/.test(A) && /۱٫۶/.test(all(x)) && (/۱۳/.test(lastCorr(x)) || x.ev.some(e => /۱۳ دقیقه/.test(e.span) && e.stale) || x.sstale.some(t => /13>/.test(t)) || x.probs.some(p => p.stale.some(z => z.v === 13)))
        /* بدلِ منفی (همان سناریو): «۲ لیتر» ِ روزانهٔ هر درختچه («هر روز: ۱۲ × ۲ = ۲۴ لیتر»، حدسِ «فکر کنم ۲ لیتر») کمیتِ دیگری است — نه کهنه، نه بازنویسی، نه پرسش */
        && !/۲۴ ⇒|۲۶٫۵ ⇒/.test(A) && !x.asks.some(q => /۱٫۶ لیتر/.test(q.new) && /روزی|درختچه|گلدون/.test(q.old + q.label)) && !x.asks.some(q => q.path === 'g.guess') && !/فکر کنم ۱٫۶ لیتر/.test(A), got: { sys: x.sys.slice(-3), retracts: x.retracts, sstale: x.sstale, ev: x.ev, asks: x.asks } }; } },
  // C26-35 / C26-36 / C26-37 / C25-15 s23
  C_s23: { name: 'C26-35/-37 s23: after «۲۵ در ۳۰» the guess copy is the exact recomputation («۳۰ تقسیم بر ۲۰، یعنی ۱.۵»), never «… ۳۰ تقسیم بر ۲۰ یعنی ۱٫۷۵»; after ✏️ «۳۵ ⇐ ۴۰ دقیقه» the withdrawn event is named and «یعنی ۱۰۰ دقیقه» is stale',
    check: (x) => { const A = x.sys.join(' ‖ '), q = x.asks.filter(a => /تقسیم بر ۲۰/.test(a.old));
      return { ok: !x.asks.some(a => /۳۰ تقسیم بر ۲۰[،,]? یعنی ۱[.٫]۷۵/.test(a.new)) && (q.some(a => /۳۰ تقسیم بر ۲۰[،,]? یعنی ۱[.٫]۵(?![0-9۰-۹])/.test(a.new)) || !q.length) && !/[۰-۹]+ رویدادِ کارنامه از همان بخش پس گرفته شد(?! \()/.test(A) && /۱۰۰/.test(x.sys.filter(t => /اصلاح شد/.test(t) && /کهنه|حساب شده بود|با مقدارِ درست دوباره/.test(t)).join(' ')),/* «یعنی ۱۰۰ دقیقه» (۳۵ × ۲٫۸) با نامِ خودش و نیازِ حسابِ دوباره گفته می‌شود (C20-4: حدسی که متنش اصلاح شد) */ got: { asks: x.asks.map(a => a.label + '|' + a.new), sys: x.sys.filter(t => /اصلاح شد/.test(t)).map(t => t.slice(0, 500)) } }; } },
  // C25-4 pwC1 p12: «عددهای حساب‌شده از «۲»: «۴، ۱۴۰۰» … (۴ ⇒ ۳٫۲، ۱۴۰۰ ⇒ ۱۱۲۰)» — و C25-15: گام‌های دفتر که از ۲ هکتار حساب شده بودند دست‌نخورده
  // upto 30: درست پس از نوبتِ اصلاح (نوبتِ ۳۱ خودش گامِ ۱ را با ۱۲۵ از نو حساب می‌کند و نشانِ کهنه به‌درستی برمی‌خیزد)
  C_pwC1: { name: 'C25-4/C25-15 pwC1 «۲ ⇒ ۲٫۵ هکتار»: no invented «۴ ⇒ ۳٫۲، ۱۴۰۰ ⇒ ۱۱۲۰»; the ledger step that used the area is marked (۱۰۰ ⇒ ۱۲۵ via ۲ هکتار = ۲۰۰۰۰ مترمربع); the statement line shows the changed words, not two identical heads', upto: 30,
    check: (x) => { const L = lastCorr(x), p = x.probs[0], st = ((p && p.prior && p.prior.length ? p.prior : null) || x.chatPrior || []).filter(s => s.stale).map(s => s.n); return { ok: !/۴ ⇒ ۳٫۲|۱۴۰۰ ⇒ ۱۱۲۰/.test(L) && st.includes(1) && !st.includes(3) && /۱۰۰ ⇒ ۱۲۵/.test(L) && /باغ ۲٫۵ هکتاره/.test(L) && !/«باغ پستهٔ خانوادگی‌مون[^»]*» \(اصلاح شد ⇐ «باغ پستهٔ/.test(L), got: { L: L.slice(-500), st, stale: p && p.stale.map(z => z.k + ' ' + z.raw + '>' + z.re) } }; } },
  // C25-15 pwC2 p22: «بیماری تو ۲٪ مردمه، نه ۱٪» ⇒ گام‌ها و نتیجه‌های دفتر نه کهنه شدند نه پرسیده
  // نکرده (گزارش‌شده): «۱۰ نفر» = ۱٪ × ۱۰۰۰ رابطهٔ نانوشته است و «۸۹٫۱» (۹٪ × ۹۹۰) به «۹۹۰» ِ بیرونِ دفتر وابسته است — نشان زدنِ ۱۰ و ۹ بی دیدنِ ۸۹٫۱ برای «۹۸٫۱» عددِ نادرستِ «دقیق» می‌سازد (C11)؛ مدلِ جمعیتِ چندگامی لازم است
  C_pwC2: { notDone: 'unwritten percent-of-population chain (10 = 1% × 1000; 89.1 = 9% × 990 with 990 outside the ledger): marking part of it would print a wrong exact value for 98.1 (C11) — needs a multi-hop population model', name: 'C25-15 pwC2 «۲٪ نه ۱٪»: the ledger steps built on the prevalence are marked (or asked) — not only the chat statement',
    check: (x) => { const L = lastCorr(x), p = x.probs[0], st = ((p && p.prior && p.prior.length ? p.prior : null) || x.chatPrior || []).filter(s => s.stale).map(s => s.n); return { ok: st.length >= 1 && /کارِ پیشینِ تو/.test(L + all(x)), got: { L: L.slice(-600), st, prior: (p && p.prior) || x.chatPrior } }; } },
  // D26-8 pwD1 p9⇒p10: به او «✓ … گامِ ۲ کهنه شد»، به مدل changed:[] + «چیزی عوض نشد»
  D_pwD1: { name: 'D26-8 pwD1 «۳۵ ثانیه نیست، ۴۵ ثانیه‌ست»: one voice — the result block the model reads names the ledger steps that went stale; only numbers really built on 35 s are listed (1330 ⇒ 1710, 22 ⇒ 29, 55 ⇒ 62), never 57, 247, 1976, 33',
    check: (x) => { const L = lastCorr(x), r = x.res || {}, p = x.probs[0], st = ((p && p.prior && p.prior.length ? p.prior : null) || x.chatPrior || []).filter(s => s.stale).map(s => s.n);
      return { ok: (r.changed || []).some(c => /کارِ پیشینِ تو/.test(c.rec)) && !/رکوردی ساخته نشده|چیزی عوض نشد|ثبت نشده بود/.test(String(r.note || '')) && /۱۳۳۰ ⇒ ۱۷۱۰/.test(L) && /۵۵ ⇒ ۶۲/.test(L) && !/۵۷ ⇒|۲۴۷ ⇒|۱۹۷۶ ⇒|۳۳ ⇒/.test(L) && st.includes(2) && st.includes(5) && !st.includes(3) && !st.includes(4), got: { L: L.slice(0, 700), note: r.note, st, rec: (r.changed || []).map(c => c.rec) } }; } },
  // D26-38 s34 p9: ✏️ «دو تا اسکیس زدم ⇒ یه اسکیس زدم و دومی رو نصفه ول کردم»: «از آن تکه هیچ رکوردی ساخته نشده بود» ولی «نتیجه (از گفت‌وگو): دو تا اسکیس زدم» ماند
  D_s34: { name: 'D26-38 s34 ✏️ «دو تا اسکیس زدم ⇒ یه اسکیس زدم و …»: the chat-recorded result is refreshed (history kept); never «هیچ رکوردی ساخته نشده بود» while it keeps the old words',
    check: (x) => { const recs = x.story.concat(x.sevlog).concat(x.probs.reduce((a, p) => a.concat(p.evlog), [])), res = recs.filter(t => /^res:|^نتیجه \(از گفت‌وگو\)/.test(t));
      return { ok: res.length > 0 && res.every(t => !/^(?:res:|نتیجه \(از گفت‌وگو\) :: )[^|]*دو تا اسکیس/.test(t)) && res.some(t => /یه اسکیس زدم و دومی رو نصفه ول کردم/.test(t)), got: { res, sys: x.sys.slice(-2) } }; } },
  D_s38: { name: 'D26-38 s38 ✏️ in a solved problem: «نتیجه (از گفت‌وگو): … = a²b/3» follows the edited message',
    check: (x) => { const recs = x.story.concat(x.sevlog).concat(x.probs.reduce((a, p) => a.concat(p.evlog), [])), res = recs.filter(t => /^res:|^نتیجه \(از گفت‌وگو\)/.test(t)); return { ok: true, info: true, got: { res: res.map(t => t.slice(0, 200)), sys: x.sys.slice(-3).map(t => t.slice(0, 300)), retracts: x.retracts } }; } },
  // D25-19 s36 p7: فهرستِ کهنه «۱۰، ۱، ۰٫۱» — ۰٫۱ مستقل است؛ ۲ و ۳ جا مانده
  D_s36: { name: 'D25-19 s36 «۳۰ لیتر بود، نه ۲۰»: the independent coefficient «۰٫۱» is never listed; the constants «۲» and «۳» of her equation are (asked — the page does not solve the algebra)',
    check: (x) => { const L = x.sys.filter(t => /۲۰ لیتر/.test(t) && /کهنه/.test(t)).join(' ‖ '), m = /عددهای حساب‌شده از «۲۰ لیتر»: «([^»]*)»/.exec(L) || ['', ''], N = m[1].split('، ');
      return { ok: !N.includes('۰٫۱') && N.includes('۲') && N.includes('۳') && N.includes('۱') && N.includes('۱۰') && !/۰٫۱ ⇒|۰٫۲۵ ⇒|۰٫۱۵ ⇒/.test(L), got: { N, L: L.slice(0, 600) } }; } },
  // D26-46 s37 p9: ✏️ «۴ ⇒ ۵» ⇒ پیشنهادِ «x+4+8+7+y» ⇐ «x+5+8+7+y» برای گامِ ۲ ِ فرم و فهرستِ کهنهٔ «۲، ۷۲، ۶»
  D_s37: { name: 'D26-46 s37 ✏️ «۴ ⇒ ۵» (a candidate first digit): no proposal «x+5+8+7+y» for the form step and no invented stale list «۲، ۷۲، ۶»',
    check: (x) => { const A = all(x) + J(x.asks) + x.sys.slice(-4).join(' '); return { ok: !/x\s*\+\s*5\s*\+\s*8|x\+5\+8\+7\+y/.test(A) && !/«۲، ۷۲، ۶»/.test(A), got: { asks: x.asks.map(q => q.label + '|' + q.new.slice(0, 80)), sys: x.sys.slice(-2).map(t => t.slice(0, 400)) } }; } }
};
module.exports = { CASES, SNAP, J };
