# Audit of app/epi_st_a.js (stations st_intake…st_ctype, concepts, drills, dossiers) against ch01–ch09 and s38

How this was checked: I read ch01–ch09 and s38 (ch10) line by line, including the diagrams and footnotes. I then read the whole JS file and checked each claim attributed to the booklet against the text. I also checked every contested reference and every tech link.

Validation after the edits:
- `node -e "global.window={};require('./app/epi_st_a.js')…"` gives 7 stations and 7 drills.
- `python3 build.py && node test_epi.js` prints NO ERRORS.

## A. Misstatements, overstatements and missing qualifications (category 1)

| # | id / field | Original (quoted) | Problem | Change |
|---|---|---|---|---|
| 1 | st_intake.philo | «سنجش درجه اعتبار (از ظن و احتمال تا یقین) حیاتی است» | The text (s6) says «یقین مطلق» and «از حیاتی‌ترین مباحث». | Now quotes the text: «از ظن و احتمال تا یقین مطلق… از حیاتی‌ترین مباحث». |
| 2 | st_intake.philo | «شک‌ها لایه‌لایه‌اند: … لایه میانی (اعتبار اصول عقلی، علیت، ریاضی)» | This overstates the claim: s2 says challenges «اغلب» return to the foundations. The middle layer is also listed loosely. | Now reads «چالش‌های فکری اغلب…». The middle layer now has the diagram's exact contents: اصل علیت، قضایای ریاضی، استدلال عقلانی. |
| 3 | st_intake.ws `layer` options (keys unchanged) | «میانی: اعتبار یک ابزار یا اصل (عقل، علیت، ریاضی، استدلال، داده تجربی)…» | The first s2 diagram puts «عقل» in the foundational layer («اعتبار حس و عقل»). It does not place «داده تجربی» at all, and the second diagram puts «تجربه» in the root layer. As written, the option overlapped with the foundational option, so a user could defend two answers. | The middle option is now «اصول عقلی و منطقی (اصل علیت، اعتبار قضایای ریاضی، استدلال عقلانی)». The foundational option is now «امکان شناخت، اعتبار حس و عقل (و تجربه)، وجود جهان خارج یا خود». The help text explains where experience sits in each diagram. Method step 6 is aligned to match. |
| 4 | st_intake.examples (backtest) | «اگر پرسش … باشد، میانی است» | Asking whether experience is valid at all belongs to the root layer in the second s2 diagram. | Now says «زیربنایی» and cites the second s2 diagram. |
| 5 | st_truth.method[2] | «صداقت گوینده هیچ وزنی در داوری صدق معرفتی ندارد» | This overstates s38. s38 says truth is independent of the speaker's intention. The speaker's reliability can still affect our confidence, and that belongs to the testimony (naql) station. | Now: truth itself does not depend on the speaker's intention or belief. Reliability affects only our confidence and is assessed in the naql station. |
| 6 | st_core.examples (حسن بصری) out | «منشأیابی و تطبیق خطا» | The booklet says only that he «در تطبیق و استنباط معنای آن دچار لغزش شد». | Now matches the text. |
| 7 | st_tasdiq.examples (دایره) | in: «دایره شکلی است که همه نقاطش از مرکز به یک فاصله‌اند»; walk: «حکمی است… اما نقش تعریف دارد» | This definition is not the booklet's (the booklet builds «دایره» from خط، منحنی، مرکز), yet it was labelled «جزوه s28». It also left open whether the sentence is a تصدیق. | Rewritten as the booklet's own example. «دایره» is a تصور نظری built by تعریف (not استدلال) from خط/منحنی/مرکز, so it goes to the concepts table and not to the claims list. |
| 8 | c_tajrobegerayi.def / c_idealism.def | «در تعبیر جزوه، لغزشی… نمونه آن هیوم/کانت است» | s36 names «لغزش‌های تجربه‌گرایی و ایدئالیسم» and, in the same paragraph, the errors of Hume and Kant. It never explicitly maps Hume to empiricism or Kant to idealism. The Kant gloss «حکایت از خارج را از دست می‌دهد» is the system's own wording. | Both definitions now separate the booklet's statement from the system's mapping and gloss. |
| 9 | st_ctype.method[4] | «صرفاً قالب ذهنی و بی‌دلالت بر خارج… (خطای کانت به تعبیر جزوه)» | «بی‌دلالت بر خارج» is the system's wording, not the booklet's. | Now: «قالبی پیشینی در ذهن (راهی که به تعبیر جزوه کانت را به شکاکیت نوینی رساند)». |
| 10 | c_khoresh_dard.def | «اشتباه در نام‌گذاری یا دسته‌بندی… حصولی است» | The booklet lists itch/pain confusion without saying which part is the error. | The definition now flags this as the system applying the general rule of s19. |
| 11 | c_vaqeiyat.ex, c_nafsolamr.ex, c_tashkik.ex | Examples tagged «(s9)», «(s38)», «(s17)» | These examples (the elephant, the conditional about 4, attention while busy) are constructed and do not appear in the booklet. | Each is now labelled «مثال/نمونه ساخته سامانه بر پایه sNN». The c_nafsolamr example was also turned into a complete sentence. |
| 12 | st_tasdiq.philo | — | One point was missing: the diagram's claim that the نظری route leads back to بدیهی (تعریف leads to تصور بدیهی; استدلال builds on تصدیق بدیهی). | Added, citing the s28 diagram. |

## B. Drills (category 2)

- **d_worlds, item 7.** Original: «کسی می‌گوید «احساس ترس دارم». اصلِ این حالت چه نوع ادراکی است؟». This was ambiguous: for the listener, knowing someone else's fear is حصولی (s11), so «حصولی» was also defensible. The question now asks about the speaker's own knowledge, and the explanation covers the listener case.
- **New drill d_intake (12 items; s1, s2, s4, s5, s6, s8).** st_intake had no drill, yet it applies s2's layers, s5's inspector role, s4's scope, s6's degrees of credibility and s8's general/special split. Without a drill the user could not check that he was assigning layers and scope correctly. Every answer key quotes the text. The two layer items use the corrected options from A3.
- All other items were checked: each key has a valid index, and no other item has a second defensible option. Item counts are now 12, 12, 13, 12, 14, 13, 13.

## C. Additions beyond the booklet now listed in `ext` (category 3)

- st_tasdiq: «ترکیب وصفی» appears beside the booklet's «ترکیب اضافی». It is now declared as an addition.
- st_core: the claim in the intensity step that weak, inattentive experiences pick up more interpretation is the system's inference. It is now declared.
- st_partial: s30 says only that the name of a whole is not predicated of its part. Extending this to properties of a collection (portfolio, team, basket) is the fallacy of division, which the system adds. The examples and mistakes using it are kept, but the extension is now declared.

## D. Contested entries (category 4)

All references were checked and are real: Steup (SEP) and Hetherington (IEP), both in the booklet's footnotes; Candlish & Wrisley on private language (SEP); Young on coherence (SEP); Capps on pragmatic truth (SEP); MacBride on truthmakers (SEP); the Asadi & Hosseini Shahroudi article (booklet bibliography no. 3); Schwitzgebel (Phil. Review 117(2), 2008, and the SEP «Introspection» entry); Sellars, «Empiricism and the Philosophy of Mind» (1956); Rodriguez-Pereyra on nominalism (SEP); Morris & Brown on Hume (SEP); De Pierris & Friedman (SEP); Stang (SEP, booklet bibliography no. 25).

- **Fixed: st_truth truthmakers `who`.** Original: «D. M. Armstrong، Bertrand Russell (واقعیت‌های سلبی)». Armstrong did not accept negative facts as such; he used totality states of affairs. It now reads: Russell (negative facts), Armstrong (totality facts instead of negative facts), and critics who limit truthmaker maximalism.
- No entry was removed.

## E. Tech links (category 5)

The links are 24 (st_intake), 2 (st_worlds), 2 (st_tasdiq), 32 and 15 (st_core), 17 (st_partial) and 5 (st_ctype). Each one is the same mechanism, so all were kept:
- 24: recording prior confidence is calibration.
- 2: decomposition into three realms and into single-judgement claims.
- 32: monitoring one's own cognition.
- 15: surfacing the hidden generalization behind an interpretation.
- 17: abstracting universals from particulars.
- 5: first versus second intelligibles as levels of abstraction.

st_truth has no link, which is acceptable.

## F. Coverage (category 6)

Every paragraph, diagram and footnote of ch1–9 and s38 appears in a basis, method, concept, dossier or drill. Two gaps were found and filled: the نظری-to-بدیهی route in the s28 diagram (A12), and the absence of any assessment for the s1–s9 content used in st_intake (B).

## G. Worksheet logic (category 7)

No field keys were renamed. The verdict, claims and grades conventions are intact. The verdict options of all seven stations match the booklet's divisions. The only defect was the overlapping intake layer options (A3).

## H. Persian quality (category 8)

There are no Arabic ي/ك characters and no garbled text. The internal key name «special» was exposed in the s8 basis text; it was replaced with «قلمرو معرفت‌شناسی».

## Deliberately left unchanged (with reason)

- **Applying the inspector role and the s2 layers to non-religious inputs.** This is already declared in st_intake.ext.
- **The st_worlds Wittgenstein entry.** It is a fair rival position, and its reference is correct.
- **The c_ilm_illat_maalul contrast «نه علیت طبیعی مانند آتش و گرما».** It follows directly from «هستی‌بخش» in s13.
- **The 14 items in d_core.** It is at the maximum, so s14 (permanent versus conditional knowledge) and the definition of مکاشفه in s22 are covered in the station and concepts rather than in the drill.
- **The «سگ/گربه» detail in the d_core sunset item.** It is a harmless concretization of the s19 example.
- **epi/cov_a.md.** It was not updated for the new d_intake drill, since d_intake adds assessment, not new section coverage.
