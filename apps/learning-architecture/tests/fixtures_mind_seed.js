// seeds realistic data for visual checks and tests; usable inside page.evaluate
window.__seedMind = function () {
  const S = APP.S, d = (n) => APP.addDays(APP.today(), -n) + 'T09:00:00Z';
  const fams = ['F7', 'F2', 'F9', 'F8', 'F4', 'F12'];
  fams.forEach((f, i) => {
    const kid = 'kn_s' + i, st = ['practised', 'working', 'returned', 'open', 'practised', 'working'][i];
    S.put({ id: kid, type: 'knot', fam: f, name: ['ترس از بیکاری', 'دو حالت = هم‌شانس', 'استعداد ندارم', 'سکوت در جلسه', 'وارسی نمی‌کنم', 'تصمیمِ عجولانه'][i], status: st, created: d(120 - i * 10), solvedAt: st === 'practised' ? d(60) : undefined, returnedAt: st === 'returned' ? d(5) : undefined, hist: st === 'practised' ? [{ at: d(60), status: 'practised', from: 'working' }] : st === 'returned' ? [{ at: d(40), status: 'practised' }, { at: d(5), status: 'returned' }] : [] });
    S.put({ id: 'kc_s' + i, type: 'kcase', title: 'موقعیتِ ' + (i + 1), knots: [kid], root: { confirmed: true }, premise: {}, created: d(121 - i * 10) });
    const hist = []; for (let j = 0; j < 14; j++) hist.push({ at: d(110 - j * 7), conf: 50 + (j * 7) % 50, ok: (j + i) % 3 !== 0 });
    S.put({ id: 'ki_s' + i, type: 'kitem', knot: kid, prompt: 'نمونه ' + i, hist, gen: { by: 'code:test' }, atype: 'int', due: APP.addDays(APP.today(), -3) });   // موعدِ ورزش گذشته ⇒ نقطهٔ سیاهِ «گیر کرده» از برنامهٔ خودِ گره (بازبینیِ ۲۰۲۶-۱۰-۱۵، M6)
  });
  S.put({ id: 'cs_s1', type: 'case', title: 'درون‌گراها مدیرِ بدی می‌شوند', created: d(50), st: { st_final: { done: true, data: { revdate: '1405-10-01', final: [{ c: '1', p: 30 }, { c: '2', p: 80 }] } } }, outcome: { 1: 'نادرست', 2: 'درست' }, outcomeAt: d(3) });
  S.put({ id: 'ep_s1', type: 'eprob', status: 'approved', p: { id: 'pb_s1', title: 'مونتی‌هال' }, created: d(30) });
  const ph = []; for (let j = 0; j < 8; j++) ph.push({ at: d(28 - j * 3), conf: 70, ok: j > 1 });
  S.put({ id: 'pbi_s1', type: 'pbitem', pid: 'pb_s1', hist: ph });
};
