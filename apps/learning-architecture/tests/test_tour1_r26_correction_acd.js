// تورِ پولیا (دورِ ۲۶) — خانوادهٔ Q2، بخشِ دوم: نقص‌های گروه‌های A، C و D با نوبتِ خودِ دونده‌ها (همان بازپخش؛ FIX26 «Reproduce first» — هر مورد روی BASE26 قرمز بود).
// موردها و سنجه‌ها: tests/tour1_r26_correction_cases.js ؛ اجراکننده همان tests/test_tour1_r26_correction.js با گروهِ دیگر است.
process.env.LLA_R26_GROUP = 'ACD';
require('./test_tour1_r26_correction.js');
