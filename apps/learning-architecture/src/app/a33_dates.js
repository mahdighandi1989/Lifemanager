/* ===== «⏰ موعدها»: تاریخی که کاربر در گفت‌وگو می‌گوید (آزمون، تحویل، «تا جمعه»)، رکوردِ تاریخ‌دار می‌شود =====
   کارزارِ آزمونِ سوم (v01، v02، v06):
   - «فردا امتحان دارم» ⇒ چرخهٔ ۱-۳-۷ پس از امتحان می‌افتاد؛
   - «تا جمعه دوباره حل کن» ⇒ هیچ کارِ تاریخ‌دار یا یادآوری ساخته نشد؛
   - «بعد از ساعتِ ۲۲ درس می‌خوانم» ⇒ همهٔ یادآورها ساعتِ ۹ می‌آمدند؛
   - برنامهٔ ماه تا آزمون فقط متنِ گفت‌وگو بود.
   این بخش فقط چیزی را که خودِ کاربر گفته ثبت می‌کند:
   - رکوردِ «deadline» که در «امروز» و یادآور و تور دیده می‌شود؛
   - ساعتِ دلخواهِ یادآور (همان تنظیمِ یادآورهای گره‌گشا). */
(function (A) {
  var S = A.S, fa = A.fa, AS = A.ASSIST;
  if (!AS || !AS.DO) return;
  function nowIso() { return new Date().toISOString(); }
  function clip(x, n) { x = String(x == null ? "" : x).replace(/\s+/g, " ").trim(); return x.length > n ? x.slice(0, n - 1) + "…" : x; }
  var RE_DATE = /^\d{4}-\d{2}-\d{2}$/;

  /* {"do":"deadline","what":"…","date":"YYYY-MM-DD" (میلادی)} — فقط از حرفِ خودِ کاربر */
  AS.DO.deadline = function (a) {
    var s = AS._turnSession, what = clip(a && a.what, 120), date = String((a && a.date) || "").trim();
    if (!what || !RE_DATE.test(date)) return "موعد ثبت نشد: «what» و «date» (YYYY-MM-DD میلادی) لازم است";
    if (date < A.today()) return "موعد ثبت نشد: " + date + " گذشته است — از کاربر بپرس تاریخِ درست چیست";
    var same = S.all("deadline", function (x) { return !x.done && x.what === what; })[0];
    var r = same || { id: A.uid("dl"), type: "deadline", what: what, done: false };
    r.date = date; r.sess = r.sess || (s && s.id) || ""; S.put(r); sync(r);
    var left = A.daysBetween(A.today(), date);
    return "";   // پیامِ سامانه پایین‌تر (msgs) — بی کلید و بی شناسه
  };
  /* {"do":"remind_hour","hour":22} — ساعتِ یادآورها (۰ تا ۲۳)، وقتی کاربر خودش گفته کی کار می‌کند */
  AS.DO.remind_hour = function (a) {
    var hr = Math.round(+((a && a.hour) != null ? a.hour : NaN));
    if (!(hr >= 0 && hr <= 23)) return "ساعتِ یادآور باید عددی از ۰ تا ۲۳ باشد";
    var st = S.settings(); st.knots = st.knots || {}; st.knots.notify = st.knots.notify || {}; st.knots.notify.hour = hr; S.saveSettings(st);
    S.all("deadline", function (x) { return !x.done; }).forEach(sync);
    S.all("achat", function (x) { return x.tour; }).forEach(function (x) { x._rem = ""; });   // یادآورِ تورها با ساعتِ تازه دوباره نوشته می‌شود
    return "";
  };
  /* {"do":"remeasure","knot":"<id>","freq":"…","intensity":25,"note":"…"} — دوباره‌سنجیِ موقعیتِ نخست در سنجشِ ماندگاری، از حرفِ خودِ کاربر
     (کارزارِ v08: «دو شب در ماه، شدتِ ۲۵» فقط در گفت‌وگو ماند) — روی خودِ گره ثبت می‌شود و در کارنامه و خطِ زمانی می‌آید */
  AS.DO.remeasure = function (a) {
    var k = S.get((a && a.knot) || ""); if (!k || k.type !== "knot") return "دوباره‌سنجی ثبت نشد: شناسهٔ گره (knot) لازم است";
    /* بازبینیِ متقابلِ ۲۰۲۶-۱۰-۱۵: «همان مقیاسِ فرم» با کد — شدت عددِ درستِ ۰ تا ۱۰ (مثلِ «شدتِ احساس در لحظه»)، بسامد یکی از گزینه‌های
       «چند بار پیش آمده؟» (A.KFREQ)؛ بیرون از مقیاس ⇒ رد با پیام (نه ثبتِ «۲۵» کنارِ «۷ از ۱۰»). خالی ⇒ رد. */
    var FQ = A.KFREQ || [["once", "یک‌بار"], ["some", "گاهی"], ["often", "مرتب"]], MX = A.KEMO_MAX || 10, why = [];
    var fq = String(a.freq == null ? "" : a.freq).replace(/‌/g, "").replace(/\s+/g, "").trim(), fid = "";
    if (fq) { FQ.forEach(function (o) { if (fq === o[0] || fq === o[1].replace(/‌/g, "").replace(/\s+/g, "")) fid = o[0]; });
      if (!fid) why.push("بسامد «" + clip(a.freq, 40) + "» در مقیاسِ فرم نیست — یکی از: " + FQ.map(function (o) { return o[1]; }).join("، ")); }
    var it = a.intensity == null || String(a.intensity).trim() === "" ? null : String(a.intensity).replace(/[۰-۹]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); }).replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).trim();
    var iv = it == null ? null : +it;
    if (it != null && !(/^\d+$/.test(it) && iv >= 0 && iv <= MX)) why.push("شدت باید عددِ درستی از ۰ تا " + fa(MX) + " باشد (همان مقیاسِ «شدتِ احساس در لحظه»)، نه «" + clip(a.intensity, 12) + "» — از کاربر با همان مقیاس بپرس");
    if (why.length) return "دوباره‌سنجی ثبت نشد: " + why.join("؛ ");
    var r = { at: nowIso(), freq: fid ? (FQ.filter(function (o) { return o[0] === fid; })[0] || [])[1] : "", freqId: fid, intensity: iv, note: clip(a.note, 300) };
    if (!r.freqId && r.intensity == null && !r.note) return "دوباره‌سنجی خالی است";
    var base = A.knotIntake ? A.knotIntake(k) : null; if (base) r.base = { freq: base.freq, emo: base.emo };
    (k.remeasures = k.remeasures || []).push(r); S.put(k); return "";
  };
  function hour() { var n = ((S.settings().knots || {}).notify) || {}; return n.hour == null ? 9 : n.hour; }
  /* یادآور: یک روز پیش از موعد (اگر هنوز فرصت هست) و خودِ روز */
  function sync(r) {
    if (!(A.HOST && A.HOST.remind) || !r || r.done) return;
    var tz = "UTC"; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) { }
    var pre = A.addDays(r.date, -1), due = pre > A.today() ? pre : r.date;
    try { Promise.resolve(A.HOST.remind({ key: "deadline:" + r.id, due_date: due, tz: tz, hour: hour(), title: "معماری یادگیری — موعد",
      body: "«" + r.what + "» — " + (A.fdate ? A.fdate(r.date) : r.date) + (due === pre ? " (فردا)" : " (امروز)"), link: "" })).catch(function () { }); } catch (e) { }
  }
  /* «امروز»: موعدهای ۷ روزِ آینده */
  if (typeof A.dueList === "function" && !A.dueList._dl) {
    var raw = A.dueList;
    A.dueList = function () {
      var items = raw.apply(this, arguments) || [];
      S.all("deadline", function (x) { return !x.done && x.date >= A.today() && A.daysBetween(A.today(), x.date) <= 7; })
        .sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); }).forEach(function (r) {
          var left = A.daysBetween(A.today(), r.date);
          items.unshift({ k: left <= 1 ? "warn" : "p", txt: "⏰ " + clip(r.what, 60), sub: left === 0 ? "موعد: امروز" : left === 1 ? "موعد: فردا" : "موعد: " + fa(left) + " روز دیگر (" + (A.fdate ? A.fdate(r.date) : r.date) + ")",
            go: function () { r.done = true; r.doneAt = nowIso(); S.put(r); A.toast("«" + clip(r.what, 40) + "» انجام‌شده علامت خورد."); A.render(); }, act: "انجام شد" });
        });
      return items;
    };
    A.dueList._dl = true;
  }
  /* مدل موعدهای همین سشن را می‌بیند تا برنامهٔ تمرین را پیش از آن بچیند */
  AS.promptHooks = AS.promptHooks || [];
  AS.promptHooks.push(function (s) {
    var L = S.all("deadline", function (x) { return !x.done && x.date >= A.today(); }).sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); }).slice(0, 8);
    var hr = (((S.settings().knots || {}).notify) || {}).hour;
    return (L.length ? "# موعدهای کاربر (هر برنامهٔ تمرین و مرور پیش از این‌ها تمام شود)\n" + L.map(function (r) { return "- " + r.date + " (" + (A.fdate ? A.fdate(r.date) : "") + ", " + fa(A.daysBetween(A.today(), r.date)) + " روز دیگر): " + r.what; }).join("\n") + "\n" : "") +
      "ساعتِ یادآورها: " + (hr == null ? "۹ (پیش‌فرض)" : fa(hr));
  });
  AS.SYS += "\n" + [
    "# موعدها و ساعت",
    "- اگر کاربر تاریخ یا موعدی گفت (آزمون، تحویل، «تا جمعه»، «فردا»)، آن را با {\"do\":\"deadline\",\"what\":\"…\",\"date\":\"YYYY-MM-DD\"} (میلادی، از «# امروز» حساب کن) ثبت کن و برنامهٔ تمرین/مرور را طوری بچین که پیش از موعد تمام شود (چرخهٔ ۱-۳-۷ ای که بعد از موعد می‌افتد پیشنهاد نکن؛ برای موعدِ نزدیک مرورِ فشرده پیش از آن).",
    "- اگر کاربر گفت کی کار می‌کند یا کی پیام می‌خواهد (مثلاً «بعد از ۲۲»)، با {\"do\":\"remind_hour\",\"hour\":22} ساعتِ یادآورها را بگذار.",
    "- پاسخِ کاربر به دوباره‌سنجیِ موقعیتِ نخست (هنوز پیش می‌آید؟ چند بار؟ شدت با همان مقیاسِ فرم) را با {\"do\":\"remeasure\",\"knot\":\"<شناسهٔ گره>\",\"freq\":\"یک‌بار|گاهی|مرتب\",\"intensity\":۰ تا ۱۰,\"note\":\"…\"} ثبت کن، نه فقط در گفت‌وگو.",
    "- برنامهٔ چندهفته‌ای تا یک موعد را فقط در متنِ گفت‌وگو نگذار: هر گامِ تاریخ‌دارش یک deadline شود (حداکثر چند گامِ اصلی)."
  ].join("\n");
})(window.APP);
