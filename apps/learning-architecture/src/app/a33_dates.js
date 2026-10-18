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
  function nowIso() { return A.nowISO(); }
  function clip(x, n) { x = String(x == null ? "" : x).replace(/\s+/g, " ").trim(); return x.length > n ? x.slice(0, n - 1) + "…" : x; }
  var RE_DATE = /^\d{4}-\d{2}-\d{2}$/;

  /* ساعتِ روز از حرفِ کاربر: «08:00»، «۸ صبح»، «ساعت ۱۶»، «۴ عصر» ⇒ "HH:MM" (تورِ پولیا s38: «فردا ۸ صبح» ⇒ یادآورِ ۹ صبح، پس از موعد) */
  function parseTime(t) {
    var x = String(t == null ? "" : t).replace(/[۰-۹]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); }).replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); });
    var m = /(\d{1,2})(?:\s*[:٫.]\s*(\d{2}))?/.exec(x); if (!m) return "";
    var hh = +m[1], mm = m[2] ? +m[2] : 0;
    if (/(عصر|بعد\s*از\s*ظهر|بعدازظهر|شب|pm)/i.test(x) && hh < 12) hh += 12;
    if (/(صبح|am)/i.test(x) && hh === 12) hh = 0;
    if (!(hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59)) return "";
    return (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
  }
  AS.parseTime = parseTime;
  /* {"do":"deadline","what":"…","date":"YYYY-MM-DD" (میلادی),"time":"HH:MM" (اگر کاربر ساعت گفت)} — فقط از حرفِ خودِ کاربر */
  /* دورِ ۲۱ (R6، N4، bank #138): دلیلِ ردِ موعد یک جا — برای مدل (پیش‌سنجیِ پاسخ در a38، بازنویسیِ یک‌باره) و برای او یک سطرِ ساده، بی «YYYY-MM-DD»/«HH:MM» */
  AS.deadlineRefusal = function (a) {
    var what = clip(a && a.what, 120), date = String((a && a.date) || "").trim();
    if (!what || !RE_DATE.test(date)) return "تاریخ یا کارِ یادآور روشن نبود";
    if (date < A.today()) return "تاریخِ " + A.fdate(date) + " گذشته است";
    if (a && a.time != null && String(a.time).trim() && !parseTime(a.time)) return "ساعتِ «" + clip(a.time, 20) + "» خوانا نیست";
    return "";
  };
  AS.DO.deadline = function (a) {
    var s = AS._turnSession, what = clip(a && a.what, 120), date = String((a && a.date) || "").trim();
    var why0 = AS.deadlineRefusal(a); if (why0) return "یادآور ثبت نشد: " + why0 + " — تاریخ (و اگر خواستی ساعتِ) درست را بگو تا ثبتش کنم.";
    var tm = a && a.time != null && String(a.time).trim() ? parseTime(a.time) : "";
    var same = S.all("deadline", function (x) { return !x.done && x.what === what; })[0];
    var r = same || { id: A.uid("dl"), type: "deadline", what: what, done: false };
    r.date = date; if (tm) r.time = tm; r.sess = r.sess || (s && s.id) || ""; S.put(r); sync(r);
    var left = A.daysBetween(A.today(), date);
    return "";   // پیامِ سامانه پایین‌تر (msgs) — بی کلید و بی شناسه
  };
  /* {"do":"deadline_done","what":"…"} — کاربر خودش گفت انجام شد (همان کارِ دکمهٔ «انجام شد» در «امروز»)؛ یادآورهایش برداشته می‌شود */
  AS.DO.deadline_done = function (a) {
    var w = String((a && (a.what || a.id)) || "").trim(); if (!w) return "«what» (همان عنوانِ موعد) لازم است";
    var open = S.all("deadline", function (x) { return !x.done; }), r = open.filter(function (x) { return x.id === w || x.what === w; })[0] || open.filter(function (x) { return x.what.indexOf(w) >= 0 || w.indexOf(x.what) >= 0; })[0];
    if (!r) return "موعدِ «" + clip(w, 40) + "» در موعدهای باز نیست";
    markDone(r); return "";
  };
  function markDone(r) { r.done = true; r.doneAt = nowIso(); S.put(r); unsync(r); }
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
  function tzOf() { var tz = "UTC"; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) { } return tz; }
  function unsync(r) { if (A.HOST && A.HOST.unremind) ["deadline:" + r.id, "deadline:" + r.id + ":t"].forEach(function (k) { try { Promise.resolve(A.HOST.unremind(k)).catch(function () { }); } catch (e) { } }); }
  /* یادآور: یک روز پیش از موعد (اگر هنوز فرصت هست) و خودِ روز. موعدِ ساعت‌دار (r.time): یادآورِ همان روز یک ساعت **پیش از** آن ساعت —
     «ساعتِ یادآورها» (remind_hour) آن را هرگز از خودِ موعد جلوتر نمی‌برد؛ یادآورِ روزِ پیش با ساعتِ یادآورها می‌ماند (تورِ پولیا s38) */
  function sync(r) {
    if (!(A.HOST && A.HOST.remind) || !r || r.done) return;
    var tz = tzOf(), pre = A.addDays(r.date, -1), hh = r.time ? +String(r.time).slice(0, 2) : null, when = A.fdate ? A.fdate(r.date) : r.date;
    try {
      if (hh == null) {
        var due = pre > A.today() ? pre : r.date;
        Promise.resolve(A.HOST.remind({ key: "deadline:" + r.id, due_date: due, tz: tz, hour: hour(), title: "معماری یادگیری — موعد",
          body: "«" + r.what + "» — " + when + (due === pre ? " (فردا)" : " (امروز)"), link: "" })).catch(function () { });
      } else {
        var h0 = Math.max(0, hh - 1);
        if (pre >= A.today()) Promise.resolve(A.HOST.remind({ key: "deadline:" + r.id, due_date: pre, tz: tz, hour: Math.min(hour(), 23), title: "معماری یادگیری — موعد", body: "«" + r.what + "» — فردا ساعتِ " + fa(r.time), link: "" })).catch(function () { });
        else if (A.HOST.unremind) Promise.resolve(A.HOST.unremind("deadline:" + r.id)).catch(function () { });
        Promise.resolve(A.HOST.remind({ key: "deadline:" + r.id + ":t", due_date: hh >= 1 ? r.date : pre, tz: tz, hour: hh >= 1 ? h0 : 23, title: "معماری یادگیری — موعد",
          body: "«" + r.what + "» — " + (hh >= 1 ? "امروز" : when) + " ساعتِ " + fa(r.time) + " (یادآور پیش از همان ساعت)", link: "" })).catch(function () { });
      }
    } catch (e) { }
  }
  AS.deadlineSync = sync;
  /* کارتِ مرور ⇒ یادآور (تورِ پولیا s38: کارت‌های مرور یادآور نداشتند). یک یادآور برای نزدیک‌ترین روزِ موعدِ کارت‌ها؛ اگر یکی از آن‌ها «بازسازی» است
     (درسِ بازنگریِ یک حل — tutor:back، chat:solved، درسِ مسئلهٔ زنده)، متن می‌گوید اول بی‌نگاه دوباره بسازد، بعد ببیند. */
  var cardsSig = "";
  function reconstruct(c) { return /^(tutor:back|chat:solved)/.test(String(c.src || "")) || !!c.pb || /بی‌نگاه|بازسازی/.test(String(c.q || "")); }
  AS.cardsPushSync = function (force) {
    if (!(A.HOST && A.HOST.remind)) return null;
    var t = A.today(), cs = S.all("card", function (c) { return !c.susp && c.due; });
    /* دورِ ۱۹c: آخرین کارتِ فعال بازنشسته شد ⇒ یادآورِ «cards:review» لغو (پیش‌تر کهنه می‌ماند) */
    if (!cs.length) { if (cardsSig && cardsSig !== "none" && A.HOST.unremind) { try { Promise.resolve(A.HOST.unremind("cards:review")).catch(function () { }); } catch (e) { } } if (cardsSig) cardsSig = "none"; return null; }
    var day = cs.map(function (c) { return c.due < t ? t : c.due; }).sort()[0], on = cs.filter(function (c) { return (c.due < t ? t : c.due) === day; }), rc = on.filter(reconstruct)[0];
    /* دورِ ۱۹c: کارتِ عقب‌افتاده موعدِ خودش را نگه می‌دارد (نه «امروز») — یک یادآور برای همان موعد؛ هر روزِ بازکردنِ صفحه یادآورِ تازه نمی‌سازد
       (میزبان فقط با تغییرِ due_date دوباره مسلح می‌کند) */
    var od = cs.map(function (c) { return c.due; }).sort()[0], late = od < t;
    if (late) day = od;
    var n0 = ((S.settings().knots || {}).notify) || {}, ch = { telegram: n0.telegram !== false, email: n0.email !== false };
    if (!ch.telegram && !ch.email) return null;
    var body = fa(on.length) + " کارتِ مرور " + (late ? "از " + (A.fdate ? A.fdate(day) : day) : day === t ? "امروز" : (A.fdate ? A.fdate(day) : day)) + " موعد است." + (rc ? " یکی بازسازی است: «" + clip(rc.q, 90) + "» — اول بی‌نگاه دوباره بسازش، بعد پاسخ را ببین." : "");
    var sig = day + "|" + on.length + "|" + (rc ? rc.id : ""); if (!force && sig === cardsSig) return null; cardsSig = sig;
    try { Promise.resolve(A.HOST.remind({ key: "cards:review", due_date: day, tz: tzOf(), hour: hour(), title: "معماری یادگیری — مرور", body: body, link: "?tab=review", channels: ch })).catch(function () { }); } catch (e) { }
    return { day: day, n: on.length, body: body };
  };
  if (A.newCard && !A.newCard._push) { var rawNC = A.newCard; A.newCard = function () { var c = rawNC.apply(this, arguments); try { AS.cardsPushSync(); } catch (e) { } return c; }; A.newCard._push = true; }
  /* دورِ ۱۹c (ممیزیِ طولی §۳.۲): یادآورِ مرور پس از نمره‌دادن هم تازه می‌شود — پیش‌تر فقط با کارتِ تازه، و تا آن وقت روزِ کهنه را می‌گفت.
     همین برای بازنشسته/بازگرداندنِ کارت. (srsGrade موعد را روی خودِ همان شیءِ ثبت‌شده عوض می‌کند، پس همگام‌سازی همان دم درست است) */
  if (A.srsGrade && !A.srsGrade._push) { var rawSG = A.srsGrade; A.srsGrade = function () { var c = rawSG.apply(this, arguments); try { AS.cardsPushSync(); } catch (e) { } return c; }; A.srsGrade._push = true; }
  if (A.cardSuspend && !A.cardSuspend._push) { var rawCS = A.cardSuspend; A.cardSuspend = function () { var c = rawCS.apply(this, arguments); try { AS.cardsPushSync(); } catch (e) { } return c; }; A.cardSuspend._push = true; }
  var lastCP = 0, rawRenderD = A.render;
  A.render = function () { rawRenderD.apply(this, arguments); try { if (A.S.loaded && A.nowMs() - lastCP > 600e3) { lastCP = A.nowMs(); AS.cardsPushSync(); } } catch (e) { } };
  /* «امروز»: موعدهای ۷ روزِ آینده */
  if (typeof A.dueList === "function" && !A.dueList._dl) {
    var raw = A.dueList;
    A.dueList = function () {
      var items = raw.apply(this, arguments) || [];
      S.all("deadline", function (x) { return !x.done && x.date >= A.today() && A.daysBetween(A.today(), x.date) <= 7; })
        .sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); }).forEach(function (r) {
          var left = A.daysBetween(A.today(), r.date);
          items.unshift({ k: left <= 1 ? "warn" : "p", txt: "⏰ " + clip(r.what, 60), sub: left === 0 ? "موعد: امروز" : left === 1 ? "موعد: فردا" : "موعد: " + fa(left) + " روز دیگر (" + (A.fdate ? A.fdate(r.date) : r.date) + ")",
            go: function () { markDone(r); A.toast("«" + clip(r.what, 40) + "» انجام‌شده علامت خورد."); A.render(); }, act: "انجام شد" });
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
    return (L.length ? "# موعدهای کاربر (هر برنامهٔ تمرین و مرور پیش از این‌ها تمام شود)\n" + L.map(function (r) { return "- " + r.date + (r.time ? " ساعتِ " + r.time : "") + " (" + (A.fdate ? A.fdate(r.date) : "") + ", " + fa(A.daysBetween(A.today(), r.date)) + " روز دیگر): " + r.what; }).join("\n") + "\n" : "") +
      "ساعتِ یادآورها: " + (hr == null ? "۹ (پیش‌فرض)" : fa(hr)) +
      "\n- اگر کاربر برای موعد ساعت هم گفت («فردا ۸ صبح»)، \"time\":\"08:00\" را هم در deadline بده — یادآورِ همان روز پیش از همان ساعت می‌آید و «ساعتِ یادآورها» جابه‌جایش نمی‌کند. اگر کاربر گفت کاری انجام شد: {\"do\":\"deadline_done\",\"what\":\"همان عنوانِ موعد\"}.";
  });
  AS.SYS += "\n" + [
    "# موعدها و ساعت",
    "- اگر کاربر تاریخ یا موعدی گفت (آزمون، تحویل، «تا جمعه»، «فردا»)، آن را با {\"do\":\"deadline\",\"what\":\"…\",\"date\":\"YYYY-MM-DD\"} (میلادی، از «# امروز» حساب کن) ثبت کن و برنامهٔ تمرین/مرور را طوری بچین که پیش از موعد تمام شود (چرخهٔ ۱-۳-۷ ای که بعد از موعد می‌افتد پیشنهاد نکن؛ برای موعدِ نزدیک مرورِ فشرده پیش از آن).",
    "- اگر کاربر گفت کی کار می‌کند یا کی پیام می‌خواهد (مثلاً «بعد از ۲۲»)، با {\"do\":\"remind_hour\",\"hour\":22} ساعتِ یادآورها را بگذار.",
    "- پاسخِ کاربر به دوباره‌سنجیِ موقعیتِ نخست (هنوز پیش می‌آید؟ چند بار؟ شدت با همان مقیاسِ فرم) را با {\"do\":\"remeasure\",\"knot\":\"<شناسهٔ گره>\",\"freq\":\"یک‌بار|گاهی|مرتب\",\"intensity\":۰ تا ۱۰,\"note\":\"…\"} ثبت کن، نه فقط در گفت‌وگو.",
    "- برنامهٔ چندهفته‌ای تا یک موعد را فقط در متنِ گفت‌وگو نگذار: هر گامِ تاریخ‌دارش یک deadline شود (حداکثر چند گامِ اصلی)."
  ].join("\n");
})(window.APP);
