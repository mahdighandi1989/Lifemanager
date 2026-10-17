RUNNER C (s21–s29): 8 PASS, 1 PARTIAL (s21). Evidence in runC/sNN (ai/, out/ sN.json+png).
Defects:
1 [S2](b) tour facet kind=problem pointing to a LIVE problem uses solved-problem milestones (تأییدِ مسئله، شبیه‌ساز، هم‌ساختار) ⇒ never completes; «تور ۰ از N», e-mails «۰/۹». a27_tour.js has no live handling.
2 [S2](b) s26 tour_done from the model accepted on an "other" facet while all milestones ○ ⇒ «پایهٔ همهٔ وجه‌ها برپا شد» from model's word.
3 [S2](b) live tunnel guess kit only ["ana","rivals"] (a38_live.js:240); case-table/differences/formula only in simulator.
4 [S2](b) guess card stores ifRef + 100% «هیچ چیز ردش نمی‌کند» but nothing uses them; no challenge after confident wrong guess (a38:239,266).
5 [S2](b) perfectly-stated vs practical problems (B093/B094/B098) absent; unused-data gate & sufficiency same for chess and life.
6 [S3] live block tells model «پاسخ را هیچ‌کس نمی‌داند… دربارهٔ درستیِ گام‌ها داوری نکن» even for well-posed math problems.
7 [S3] unused-data gate ignores the draft plan text.
8 [S3] live block keeps suggesting an already-answered plan question.
9 [S3] «دانسته‌های قلمرو» retrieval off-topic.
10 [S3] view-name fallback «صفحهٔ قبلی» (a10_nav.js:33) for lprob/idea/sources/psy_item.
11 [S3] «ثبت‌های تازه» shows new live problem with empty title «مسئله «»».
12 [S3] look-back «کدام پرسش بیشتر کمک کرد» lacks unused-data question & backward card as options.
13 [S3] «جدولِ ترجمهٔ شرط» scratch only, not saved, not in live tunnel (a19_moves.js:881).
14 [S3] understanding card never asks "can the condition be satisfied / is there an unknown at all?"; «کافی است» accepted despite user writing data not yet known.
15 [S3] no figure card in live tunnel («فرض کن ساخته شده»، general figure warning).
16 [S3] isomorphic problems detected only by the model; liveRelated = shared words.
17 [S3] sieve "why" texts shown in tour drawer & e-mail without anti-spoiler filter.
