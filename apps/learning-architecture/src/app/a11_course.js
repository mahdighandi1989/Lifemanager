/* ===== دورهٔ گام‌به‌گام: از صفر تا آخر =====
   چرا (مالک ۲۰۲۶-۱۰-۱۱): «وارد یه اقیانوس شدم، اون هم از وسطش» — کتابخانهٔ مرجع جای کلاسِ درس نیست. این دوره همان ۴۵ تکنیک
   را به ترتیبِ برنامهٔ ۸ هفته‌ای (C.CURRICULUM) یکی‌یکی و با یک الگوی ثابت جلو می‌برد، روی **یک موضوعِ واقعیِ خودت**:
     ۰ گرم‌کردن — بازیابیِ درس‌های قبلی با فاصلهٔ فزاینده (خودِ دوره تکنیک‌های ۴۱ و ۴۲ را روی تو اجرا می‌کند)
     ۱ ببین و بفهم — یک جمله تعریف، یک تصویر، جای تکنیک در چرخه
     ۲ امتحان کن — تمرینِ تعاملی (شبیه‌سازِ ویژه یا تمرین‌های ساخته‌شده از گام‌ها و اشتباه‌های رایجِ خودِ تکنیک)
     ۳ انجام بده — کاربرگِ همان تکنیک روی موضوعِ دوره
     ۴ بسنج و ببند — روبریک، یک کارتِ مرور، و «کارِ فردا»
   هیچ پیوندی در دوره تو را به جای دیگر پرت نمی‌کند: ارجاع‌ها در کشوی کناری باز می‌شوند.
   شبیه‌سازها «مدلِ ساده‌شده برای شهود»اند و همین را روی خودشان می‌نویسند؛ عددِ علمی جعل نمی‌شود.
   قاعدهٔ ذخیره (بازبینی ۲۰۲۶-۱۰-۱۲): دیدنِ یک قدم هیچ رکوردی نمی‌سازد؛ کاربرگ فقط با اولین ورودیِ واقعی ساخته می‌شود، و هر
   تغییرِ واقعی فقط یک نوشتن دارد. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, C = A.C, TM = A.TM;
  var WEEKS = C.CURRICULUM;
  var LESSONS = [];
  WEEKS.forEach(function (w) { w.ids.forEach(function (id, i) { LESSONS.push({ tid: id, w: w.w, wi: i, wn: w.ids.length }); }); });
  var LIDX = {}; LESSONS.forEach(function (l, i) { LIDX[l.tid] = i; });
  A.COURSE_LESSONS = LESSONS;

  /* ---------- زمانِ تقریبیِ هر درس (به‌جای یک ادعای یکسان برای همه) ----------
     برآورد از روی خودِ درس: خواندنِ قدمِ ۱، تمرینِ قدمِ ۲، فیلدهای کاربرگِ قدمِ ۳ (و زمان‌سنج‌هایش)، و قدمِ ۴.
     کف = فقط فیلدهای الزامی؛ سقف = همهٔ فیلدها. وزن‌ها تخمینِ دقیقه به ازای هر نوع فیلدند، نه اندازه‌گیری. */
  var FW = { text: 1.5, area: 2.5, list: 3, table: 4, chain: 4, tree: 5, graph: 4, draw: 5, scale: 0.5, sel: 0.5, checks: 1, lock: 2.5, calib: 3, jargon: 3, pareto: 4, info: 0.5 };
  function lessonMin(t) {
    var read = [t.def, t.when].concat(t.steps || []).join(" ").length / 1000;
    var fixed = 3 + read + (SIM[t.id] ? 6 : 3) + 4, lo = 0, hi = 0;
    (t.ws || []).forEach(function (f) { var m = f.t === "timer" ? (f.min || 5) : (FW[f.t] || 2); hi += m; if (f.req || f.t === "timer") lo += m; });
    function r5(x) { return Math.max(5, Math.round(x / 5) * 5); }
    return [r5(fixed + lo), r5(fixed + hi)];
  }
  function minText(t) { var m = lessonMin(t); return m[0] === m[1] ? "حدودِ " + fa(m[0]) + " دقیقه" : "حدودِ " + fa(m[0]) + " تا " + fa(m[1]) + " دقیقه"; }
  function courseSpan() {
    var lo = 1e9, hi = 0;
    LESSONS.forEach(function (l) { var m = lessonMin(TM[l.tid]); lo = Math.min(lo, m[0]); hi = Math.max(hi, m[1]); });
    return [lo, hi];
  }
  A.courseLessonMinutes = function (tid) { return TM[tid] ? lessonMin(TM[tid]) : null; };

  /* ---------- وضعیت ---------- */
  function st() {
    var c = S.get("course");
    if (!c) c = { id: "course", type: "course", topic: "", done: {}, warm: {}, ex: {}, cards: {}, step: {}, cur: LESSONS[0].tid };
    c.done = c.done || {}; c.warm = c.warm || {}; c.ex = c.ex || {}; c.cards = c.cards || {}; c.step = c.step || {};
    c.elsewhere = c.elsewhere || {}; c.recall = c.recall || {};
    adopt(c);
    return c;
  }
  /* تکنیکی که بیرون از دوره (کاربرگِ خودِ تکنیک) تمام شده، در دوره هم «انجام‌شده» حساب می‌شود؛ دوباره اجباری نیست.
     فقط در حافظه علامت می‌خورد و با اولین ذخیرهٔ واقعیِ دوره ماندگار می‌شود (دیدن ≠ نوشتن). */
  function adopt(c) {
    S.all("ex", function (e) { return e.status === "done" && !e.sample && !e.course && LIDX[e.tid] != null; }).forEach(function (e) {
      if (c.done[e.tid]) return;
      c.done[e.tid] = String(e.updated || e.created || A.today()).slice(0, 10);
      c.elsewhere[e.tid] = e.id;
    });
  }
  /* یک تغییرِ واقعی = یک نوشتن. saveSoon چند تغییرِ پشتِ‌سرِهم را در یک نوشتن جمع می‌کند. */
  var soonT = null;
  function save(c) { if (soonT) { clearTimeout(soonT); soonT = null; } S.put(c); }
  function saveSoon(c) { if (soonT) clearTimeout(soonT); soonT = setTimeout(function () { soonT = null; S.put(c); }, 400); }
  function nDone(c) { return Object.keys(c.done).filter(function (k) { return LIDX[k] != null; }).length; }
  function nextLesson(c) { for (var i = 0; i < LESSONS.length; i++) if (!c.done[LESSONS[i].tid]) return LESSONS[i]; return null; }
  function topicLost(c) { return !!(c.topic && !S.get(c.topic)); }
  A.courseNext = function () { var c = S.get("course"); return c && c.topic ? nextLesson(st()) : null; };
  A.courseState = function () { return S.get("course") ? st() : null; };
  function weekOf(w) { return WEEKS[w - 1]; }
  function pct(c) { return Math.round(100 * nDone(c) / LESSONS.length); }
  function progressText(c) { return h("span", { dir: "rtl" }, fa(nDone(c)) + " از " + fa(LESSONS.length) + " درس · " + fa(pct(c)) + "٪ از دوره"); }
  /* نامِ فارسیِ روال‌ها (FARM پروتکل نیست و در PNAME نیست) */
  function protoName(p) { return p === "FARM" ? "«مزرعه» (صفحهٔ مزرعه)" : "«" + (A.pn ? A.pn(p) : p) + "»"; }

  /* ---------- کشوی کناری (به‌جای پرت‌شدن) ---------- */
  A.peekTech = function (id) {
    var t = TM[id]; if (!t) return;
    var ov = h("div", { class: "overlay crs-peek", role: "dialog", "aria-modal": "true", "aria-label": t.fa, onclick: function (e) { if (e.target === ov) ov.remove(); } });
    ov.appendChild(h("div", { class: "dialog" },
      h("div", { class: "eyebrow" }, "نگاهِ کوتاه · تو همین‌جا می‌مانی"),
      h("h3", {}, fa(id) + " · " + t.fa),
      h("p", {}, t.def),
      h("p", { class: "small" }, h("strong", {}, "کی به کار می‌آید: "), t.when),
      LIDX[id] != null ? h("p", { class: "small muted" }, "در دوره: منزلِ " + fa(LESSONS[LIDX[id]].w) + "، درسِ " + fa(LIDX[id] + 1) + " از " + fa(LESSONS.length)) : null,
      h("div", { class: "row gap wrap" },
        h("button", { class: "btn", onclick: function () { ov.remove(); } }, "بستن و ادامه"),
        h("button", { class: "btn ghost", onclick: function () { ov.remove(); A.go("tech", id); } }, "صفحهٔ کاملِ تکنیک (با «↩ برگرد» برمی‌گردی)"))));
    A.layer().appendChild(ov);
  };
  function peekChip(id) { var t = TM[id]; return t ? h("button", { class: "tlink", onclick: function () { A.peekTech(id); } }, h("b", {}, fa(id)), " ", t.fa) : null; }

  /* ---------- نقشهٔ دوره ---------- */
  function stepIcons() {
    return h("div", { class: "crs-howgrid" }, [["۰", "گرم‌کردن", "چند پرسش از درس‌های قبل، از حافظه"], ["۱", "ببین و بفهم", "یک جمله، یک تصویر"], ["۲", "امتحان کن", "تمرین یا شبیه‌سازِ تعاملی"], ["۳", "انجام بده", "روی موضوعِ خودت"], ["۴", "بسنج و ببند", "خودارزیابی و یک کارتِ مرور"]].map(function (x) {
      return h("div", { class: "crs-howstep" }, h("span", { class: "n" }, x[0]), h("b", {}, x[1]), h("span", { class: "small muted" }, x[2]));
    }));
  }
  /* mode: new (اولین بار) · pick (پیشرفت هست، موضوع نه) · lost (موضوعِ دوره حذف شده) · change (کاربر خواست عوضش کند) */
  function onboarding(c, mode) {
    mode = mode || "new";
    var root = h("div", { class: "page crs" });
    var span = courseSpan();
    if (mode === "new") {
      root.appendChild(A.head("دورهٔ گام‌به‌گام", "از صفر، یک قدم در هر بار", "این دوره همهٔ ۴۵ تکنیک را در ۸ منزل و ۴۵ درس جلو می‌برد. هر درس بسته به کاربرگش " + fa(span[0]) + " تا " + fa(span[1]) + " دقیقه طول می‌کشد (زمانِ تقریبیِ هر درس سرِ خودش نوشته شده) و لازم نیست یک‌نفس تمامش کنی: همه‌چیز ذخیره می‌شود. لازم نیست چیزی از قبل بدانی و لازم نیست جای دیگری بروی: هر درس خودش می‌گوید چه بکنی و بعدش کجا بروی."));
      root.appendChild(h("section", { class: "card" }, h("h2", {}, "هر درس همیشه همین پنج قدم است"), stepIcons(),
        h("p", { class: "small muted" }, "قدمِ «گرم‌کردن» خودش دو تکنیکِ دوره است (بازیابیِ فعال و تکرارِ فاصله‌دار): هر درسی که تمام کنی، چند روز بعد دوباره از حافظه پرسیده می‌شود.")));
      root.appendChild(h("section", { class: "card" }, h("h2", {}, "مسیر: ۸ منزل"), weekStrip(c, true)));
    } else {
      root.appendChild(A.head("دورهٔ گام‌به‌گام", mode === "change" ? "عوض‌کردنِ موضوعِ دوره" : "موضوعِ دوره را انتخاب کن", null));
      if (mode === "lost") root.appendChild(h("section", { class: "card soft crs-lost" }, h("h2", {}, "موضوعِ دوره پیدا نشد"),
        h("p", {}, "موضوعی که دوره رویش جلو می‌رفت دیگر در فهرستِ موضوع‌ها نیست (احتمالاً حذف شده). پیشرفتت سرِ جایش است: ", progressText(c), ". فقط یک موضوعِ تازه بساز یا یکی از موضوع‌های موجود را انتخاب کن تا ادامه بدهی."),
        h("p", { class: "small muted" }, "کاربرگ‌هایی که قبلاً پر کرده‌ای پاک نشده‌اند؛ درس‌های بعدی روی موضوعِ تازه انجام می‌شوند.")));
      else if (mode === "pick") root.appendChild(h("section", { class: "card soft" }, h("p", {}, "دوره هنوز موضوعی ندارد. پیشرفتت: ", progressText(c), ". یک موضوع انتخاب کن تا ادامه بدهی.")));
      else root.appendChild(h("section", { class: "card soft" }, h("p", {}, "پیشرفتت سرِ جایش می‌ماند؛ فقط درس‌های بعدی روی موضوعِ تازه انجام می‌شوند.")));
    }
    var ti = h("input", { type: "text", id: "crsTopic", placeholder: "مثلاً: تحلیلِ وثیقه‌های ملکی، شبکه‌های عصبی، یا مدیریتِ ریسک در ترید" });
    var pick = mode === "lost" ? "" : (c.topic || "");
    var hasTopics = S.all("topic", function (t) { return !t.sample; }).length > 0;
    var going = nDone(c) > 0;
    root.appendChild(h("section", { class: "card crs-start" },
      h("h2", {}, mode === "new" ? "یک موضوعِ واقعی انتخاب کن" : "موضوع"),
      h("p", {}, "همهٔ تمرین‌های دوره روی همین موضوع انجام می‌شوند؛ پس چیزی باشد که واقعاً می‌خواهی عمیق بفهمی یا الان درگیرش هستی. بعداً هم می‌شود عوضش کرد."),
      h("label", { for: "crsTopic" }, "موضوعِ تازه"), ti,
      hasTopics ? h("div", { class: "mt" }, h("label", { for: "crsTopicSel", class: "small" }, "یا یکی از موضوع‌هایی که قبلاً ساخته‌ای:"), A.topicSelect(pick, function (v) { pick = v; }, "crsTopicSel")) : null,
      h("div", { class: "row gap wrap mt" }, h("button", { class: "btn", onclick: function () {
        var tid = pick;
        if (ti.value.trim()) { var t = S.put({ id: A.uid("tp"), type: "topic", title: ti.value.trim(), dom: "", src: "", kind: "", course: true }); tid = t.id; }
        if (!tid || !S.get(tid)) { A.toast("یک موضوع بنویس یا انتخاب کن.", "bad"); ti.focus(); return; }
        c.topic = tid; c.started = c.started || A.today(); A._crsChange = false; save(c);
        if (going) A.go("course"); else A.go("lesson", LESSONS[0].tid, "s1");
      } }, going ? "ادامهٔ دوره با این موضوع ←" : "شروعِ درسِ اول ←"),
        mode === "change" ? h("button", { class: "btn ghost", onclick: function () { A._crsChange = false; A.render(); } }, "انصراف — همان موضوعِ قبلی بماند") : null)));
    return root;
  }
  function weekStrip(c, compact, cur) {
    var nl = nextLesson(c);
    return h("ol", { class: "crs-road" + (compact ? " compact" : "") }, WEEKS.map(function (w) {
      var done = w.ids.filter(function (id) { return c.done[id]; }).length, all = w.ids.length;
      var here = nl && nl.w === w.w;
      return h("li", { class: "crs-stop" + (done === all ? " done" : "") + (here ? " here" : "") + (cur === w.w ? " cur" : "") },
        h("div", { class: "crs-stopn" }, done === all ? "✓" : fa(w.w)),
        h("div", { class: "crs-stopb" },
          h("div", { class: "crs-stopt" }, (here ? "📍 " : "") + "منزلِ " + fa(w.w) + " · " + w.fa),
          h("div", { class: "crs-dots", "aria-label": fa(done) + " از " + fa(all) + " درس" }, w.ids.map(function (id) {
            var on = !!c.done[id], now = nl && nl.tid === id;
            return h("button", { class: "crs-dot" + (on ? " on" : "") + (now ? " now" : ""), title: fa(id) + " · " + TM[id].fa + (on ? (c.elsewhere[id] ? " (بیرون از دوره انجام شده)" : " (تمام‌شده)") : now ? " (درسِ بعدیِ تو)" : ""),
              onclick: function () { if (c.topic) A.go("lesson", id, c.step[id] || "s1"); } });
          })),
          compact ? null : h("div", { class: "small muted" }, fa(done) + " از " + fa(all) + " درس")));
    }));
  }
  A.V.course = function () {
    var c = st();
    if (topicLost(c)) return onboarding(c, "lost");
    if (!c.topic) return onboarding(c, nDone(c) ? "pick" : "new");
    if (A._crsChange) return onboarding(c, "change");
    var nl = nextLesson(c), tp = S.get(c.topic);
    var warmDue = nl && gateOpen(c, nl.tid);
    var root = h("div", { class: "page crs" });
    root.appendChild(A.head("دورهٔ گام‌به‌گام", "نقشهٔ سفر", "کجای دوره‌ای، چقدر مانده، و قدمِ بعدی‌ات چیست."));
    root.appendChild(h("section", { class: "card crs-now" },
      h("div", { class: "crs-bar" }, h("i", { style: { width: pct(c) + "%" } })),
      h("div", { class: "row between wrap gap" },
        h("div", {}, h("div", { class: "small muted" }, progressText(c)),
          h("div", { class: "small" }, "موضوعِ دوره: ", h("b", {}, tp.title), " ", h("button", { class: "linkish small", onclick: function () { A._crsChange = true; A.render(); } }, "(عوض کن)"))),
        nl ? h("div", { class: "col" },
          h("button", { class: "btn lg", onclick: function () { A.go("lesson", nl.tid, c.step[nl.tid] || "s1"); /* گرم‌کردنِ موعد را خودِ درس پیش می‌اندازد */ } },
            warmDue ? "▶ ادامه: اول گرم‌کردنِ امروز، بعد درسِ " + fa(LIDX[nl.tid] + 1) : "▶ ادامه: درسِ " + fa(LIDX[nl.tid] + 1) + " — " + TM[nl.tid].fa),
          h("span", { class: "small muted" }, "زمانِ تقریبیِ این درس: " + minText(TM[nl.tid])))
          : h("span", { class: "pill good" }, "دوره تمام شد 🎉"))));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "مسیر"), h("p", { class: "small muted" }, "هر خال یک درس است؛ پُر = تمام‌شده (در دوره یا بیرون از آن)، 📍 = درسِ بعدیِ تو. روی هر خال بزنی همان درس باز می‌شود."), weekStrip(c, false)));
    var cw = nl ? weekOf(nl.w) : WEEKS[WEEKS.length - 1];
    root.appendChild(h("section", { class: "card" },
      h("h2", {}, "منزلِ " + fa(cw.w) + ": " + cw.fa),
      h("p", {}, cw.why),
      h("ol", { class: "crs-wlist" }, cw.ids.map(function (id) {
        return h("li", { class: c.done[id] ? "on" : "" }, h("button", { class: "linkish", onclick: function () { A.go("lesson", id, c.step[id] || "s1"); } }, (c.done[id] ? "✓ " : "") + fa(id) + " · " + TM[id].fa + (c.elsewhere[id] ? " (بیرون از دوره انجام شده)" : "")),
          h("span", { class: "small muted" }, " — " + (TM[id].when || "").slice(0, 90) + "…"));
      })),
      (cw.protos || []).length ? h("p", { class: "small muted" }, "روال‌های این منزل (بعد از درس‌ها؛ در بخشِ «پروتکل‌ها»، و مزرعه در صفحهٔ خودش): " + cw.protos.map(protoName).join("، ")) : null));
    return root;
  };

  /* ---------- پرسشِ مرور: کاربردی/چرایی، نه تعریفی (اشتباهِ ۰ ِ تکنیکِ ۴۲) ---------- */
  function sent1(s, n) {
    s = s || ""; var out = "", rest = s;
    for (var i = 0; i < (n || 1); i++) { var k = rest.search(/[.!؟?](\s|$)/); if (k < 0) { out += rest; break; } out += rest.slice(0, k + 1) + " "; rest = rest.slice(k + 2); }
    return out.trim();
  }
  function topicTitle(c) { var tp = c.topic && S.get(c.topic); return tp ? tp.title : "موضوعِ دوره"; }
  /* k: ۰ اجرا روی موضوع · ۱ چرا کار می‌کند · ۲ اشتباهِ رایج و پرهیز از آن */
  function reviewPrompt(t, c, k) {
    k = ((k || 0) % 3 + 3) % 3;
    if (k === 0) return { q: "بی‌نگاه: اگر فردا بخواهی «" + t.fa + "» را روی «" + topicTitle(c) + "» اجرا کنی، گام‌های اصلی‌اش را به ترتیب بنویس و بگو خروجی‌اش چه خواهد بود.",
      a: function () { return h("div", {}, h("p", { class: "small" }, h("b", {}, "گام‌ها:")), stepFlow(t)); } };
    if (k === 1) return { q: "بی‌نگاه: «" + t.fa + "» چرا کار می‌کند؟ سازوکارش را با کلماتِ خودت توضیح بده (نه تعریفش را) و یک مثال از کارِ خودت بزن.",
      a: function () { return h("p", {}, h("b", {}, "چرا: "), sent1(t.why, 2)); } };
    return { q: "بی‌نگاه: یک اشتباهِ رایج در اجرای «" + t.fa + "» را بگو، توضیح بده چرا تکنیک را بی‌اثر می‌کند، و در «" + topicTitle(c) + "» چطور از آن دوری می‌کنی؟",
      a: function () { return h("div", {}, h("p", { class: "small" }, h("b", {}, "اشتباه‌های رایج:")), h("ul", { class: "small" }, (t.mistakes || []).map(function (m) { return h("li", {}, m); }))); } };
  }

  /* ---------- گرم‌کردن: بازیابی با فاصلهٔ فزاینده ---------- */
  var GAPS = [1, 3, 7, 21, 60];
  function dueWarm(c, exceptTid) {
    var t = A.today();
    return Object.keys(c.done).map(Number).filter(function (id) {
      if (id === exceptTid || !TM[id] || LIDX[id] == null) return false;
      var w = c.warm[id] || { n: 0, due: A.addDays(c.done[id], 1) };
      return (w.due || "") <= t;
    }).sort(function (a, b) { return ((c.warm[a] || {}).due || c.done[a]) < ((c.warm[b] || {}).due || c.done[b]) ? -1 : 1; }).slice(0, 2);
  }
  function hasWarm(c, tid) { return dueWarm(c, tid).length > 0; }
  /* «ادامه» نباید گرم‌کردنِ موعد را بی‌صدا دور بزند: تا امروز یک دور انجام نشده یا آگاهانه رد نشده، اول گرم‌کردن. */
  function gateOpen(c, tid) { var d = A.today(); return hasWarm(c, tid) && c.warmDay !== d && c.warmSkip !== d; }
  function warmStep(c, tid, next, nextLabel, gated) {
    var ids = dueWarm(c, tid);
    var box = h("div", { class: "col gap" });
    if (gated) box.appendChild(h("section", { class: "card soft" }, h("b", {}, "پیش از ادامه: گرم‌کردنِ امروز موعد است. "), "چند دقیقه طول می‌کشد؛ بعدش مستقیم به همان قدمی می‌روی که می‌خواستی."));
    box.appendChild(h("p", { class: "lead small" }, "پیش از درسِ تازه، دو دقیقه از حافظه: بدونِ نگاه‌کردن جواب بده، بعد پاسخ را ببین و صادقانه بگو چقدر یادت بود. تلاش برای به‌یادآوردن — حتی ناقص — به شرطِ این‌که بعدش پاسخ را ببینی و مقایسه کنی، معمولاً از دوباره‌خواندن ماندگارتر است. این خودش تکنیکِ ۴۱ است، و فاصله‌گذاریِ پرسش‌ها تکنیکِ ۴۲."));
    if (!ids.length) { box.appendChild(A.empty("امروز چیزی برای گرم‌کردن موعد نیست.", h("button", { class: "btn", onclick: next }, nextLabel))); return box; }
    var graded = {};
    ids.forEach(function (id) {
      var t = TM[id], w0 = c.warm[id] || {}, P = reviewPrompt(t, c, w0.n || 0);
      var ta = h("textarea", { rows: 3, placeholder: P.q, "aria-label": P.q });
      if (w0.draft && w0.draft.d === A.today()) ta.value = w0.draft.txt || "";
      ta.addEventListener("input", function () { var w = c.warm[id] || (c.warm[id] = { n: 0, due: A.addDays(c.done[id], 1) }); w.draft = { d: A.today(), txt: ta.value }; saveSoon(c); });
      var log = (w0.log || []).slice(-1)[0];
      var ans = h("div", { class: "crs-reveal hidden" }, P.a(), h("p", { class: "small" }, h("b", {}, "کی به کار می‌آید: "), t.when),
        log && log.txt ? h("details", { class: "small" }, h("summary", {}, "پاسخِ قبلیِ خودت (" + A.fdate(log.d) + ")"), h("p", {}, log.txt)) : null,
        h("div", { class: "row gap wrap" }, [["یادم بود", 2], ["تا حدودی", 1], ["یادم نبود", 0]].map(function (g) {
          return h("button", { class: "btn sm" + (g[1] === 2 ? "" : " ghost"), onclick: function (e) {
            var w = c.warm[id] || { n: 0 };
            w.n = g[1] === 2 ? (w.n || 0) + 1 : g[1] === 1 ? Math.max(0, (w.n || 0)) : 0;
            w.due = A.addDays(A.today(), GAPS[Math.min(w.n, GAPS.length - 1)] * (g[1] === 1 ? 0.5 : 1) | 0 || 1);
            w.last = A.today(); w.g = g[1];
            (w.log = w.log || []).push({ d: A.today(), g: g[1], k: (w0.n || 0) % 3, txt: ta.value.trim() });
            if (w.log.length > 20) w.log = w.log.slice(-20);
            delete w.draft;
            c.warm[id] = w; graded[id] = 1;
            if (ids.every(function (x) { return graded[x]; })) c.warmDay = A.today();
            save(c);
            e.target.parentNode.replaceWith(h("p", { class: "small muted" }, "ثبت شد (پاسخت هم ذخیره شد)؛ دفعهٔ بعد: " + A.fdate(w.due)));
          } }, g[0]);
        })));
      box.appendChild(h("section", { class: "card" }, h("h3", {}, "«" + t.fa + "»"), h("p", { class: "small" }, P.q), ta,
        h("button", { class: "btn ghost sm mt", onclick: function (e) { ans.classList.remove("hidden"); e.target.remove(); } }, "پاسخ را نشان بده"), ans));
    });
    box.appendChild(h("div", { class: "row gap wrap" },
      h("button", { class: "btn", onclick: function () {
        var left = ids.filter(function (x) { return !graded[x]; }).length;
        if (left) { A.toast("هنوز به " + fa(left) + " پرسش نمره نداده‌ای: پاسخ را ببین و بگو چقدر یادت بود — یا «فعلاً رد کن» را بزن.", "bad"); return; }
        next();
      } }, nextLabel),
      h("button", { class: "btn ghost crs-skipwarm", onclick: function () { c.warmSkip = A.today(); save(c); next(); } }, "فعلاً رد کن (این پرسش‌ها موعد می‌مانند و دفعهٔ بعد دوباره می‌آیند)")));
    return box;
  }

  /* ---------- قدمِ ۱: ببین و بفهم ---------- */
  function phaseStrip(id) {
    var ph = A.phaseOf(id);
    return h("div", { class: "crs-phases", "aria-label": "جای این تکنیک در چرخهٔ ۹ فازی" }, C.PHASES.map(function (p, i) {
      return h("div", { class: "crs-ph" + (i === ph ? " on" : ""), style: { "--pc": "var(--p" + i + ")" }, title: p.fa }, h("span", { class: "n" }, fa(i)), h("span", { class: "t" }, p.short));
    }));
  }
  function stepFlow(t) {
    return h("ol", { class: "crs-flow" }, t.steps.map(function (s, i) {
      return h("li", {}, h("span", { class: "n" }, fa(i + 1)), h("span", {}, s));
    }));
  }
  function seeStep(t) {
    var box = h("div", { class: "col gap" });
    box.appendChild(h("section", { class: "card crs-def" }, h("div", { class: "eyebrow" }, "در یک جمله"), h("p", { class: "big" }, t.def)));
    var vis = VIS[t.id];
    if (vis) box.appendChild(h("section", { class: "card" }, h("h3", {}, vis.title), vis.draw(), vis.note ? h("p", { class: "small muted" }, vis.note) : null));
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "جای این تکنیک در چرخهٔ یادگیری"), phaseStrip(t.id),
      h("p", { class: "small muted" }, "هر موضوعی که یاد می‌گیری از این ۹ فاز می‌گذرد؛ این تکنیک ابزارِ فازِ «" + C.PHASES[A.phaseOf(t.id)].fa + "» است.")));
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "اجرایش، قدم‌به‌قدم"), stepFlow(t)));
    box.appendChild(h("section", { class: "card soft" }, h("h3", {}, "کی به کار می‌آید"), h("p", {}, t.when)));
    box.appendChild(h("details", { class: "card" }, h("summary", {}, "چرا کار می‌کند؟ (اختیاری)"), h("p", {}, t.why), t.ev ? h("p", { class: "small muted" }, "سطحِ شواهد " + t.ev.lvl + ": " + t.ev.note) : null));
    if (t.example) box.appendChild(h("details", { class: "card" }, h("summary", {}, "یک نمونهٔ واقعی ببین (اختیاری)"), h("h4", {}, t.example.title), h("p", { class: "small" }, t.example.text)));
    return box;
  }

  /* ---------- قدمِ ۲: امتحان کن ---------- */
  /* بازبینیِ ۲۰۲۶-۱۰-۱۲: ترتیبِ گام‌های این تکنیک‌ها یا واقعاً ترتیبی نیست یا مبهم/ضعیف است ⇒ بازیِ ترتیب ندارند. */
  var ORDER_SKIP = { 5: 1, 13: 1, 36: 1, 37: 1, 10: 1, 12: 1, 21: 1, 22: 1, 25: 1, 45: 1 };
  /* جفت‌گام‌های مجاور (اندیسِ ۰-مبنا) که به هر دو ترتیب درست‌اند */
  var ORDER_SWAP = { 15: [[2, 3]], 18: [[1, 2]], 28: [[0, 1]], 29: [[0, 1]], 34: [[1, 2]], 38: [[0, 1]], 23: [[1, 2]], 16: [[2, 3]] };
  A._courseOrderRules = { skip: ORDER_SKIP, swap: ORDER_SWAP };
  function orderGame(t) {
    if (ORDER_SKIP[t.id]) return null;
    var steps = t.steps.slice(0, 5);
    if (steps.length < 3) return null;
    var rank = steps.map(function (_, i) { return i; });
    (ORDER_SWAP[t.id] || []).forEach(function (p) { if (p[1] < steps.length) rank[p[1]] = p[0]; });
    var order = A.shuffle(steps.map(function (_, i) { return i; }));
    if (order.every(function (v, i) { return v === i; })) order.reverse();
    var picked = {}, n = 0, tries = 0;
    function canPick(i) { for (var j = 0; j < steps.length; j++) if (!picked[j] && rank[j] < rank[i]) return false; return true; }
    var out = h("p", { class: "small muted" }, "روی گامِ اول بزن، بعد دوم، …");
    var list = h("div", { class: "crs-order" }, order.map(function (i) {
      var b = h("button", { class: "crs-ocard", onclick: function () {
        if (b.classList.contains("ok")) return;
        tries++;
        if (canPick(i)) { picked[i] = 1; n++; b.classList.add("ok"); b.insertBefore(h("span", { class: "n" }, fa(n)), b.firstChild);
          if (n === steps.length) { out.textContent = tries === steps.length ? "بی‌خطا! ترتیب را درست می‌دانی." : "تمام شد با " + fa(tries - steps.length) + " اشتباه. ترتیبِ درست حالا روی کارت‌هاست."; out.className = "small good"; markTry(t.id, "order"); }
          else out.textContent = "درست. حالا گامِ " + fa(n + 1) + "؟";
        } else { b.classList.add("bad"); setTimeout(function () { b.classList.remove("bad"); }, 600); out.textContent = "این گامِ " + fa(n + 1) + " نیست. دوباره نگاه کن: کدام باید قبل از بقیه بیاید؟"; }
      } }, h("span", {}, steps[i]));
      return b;
    }));
    var sw = (ORDER_SWAP[t.id] || []).filter(function (p) { return p[1] < steps.length; });
    return h("section", { class: "card" }, h("h3", {}, "ترتیب را بساز"), h("p", { class: "small" }, "این " + fa(steps.length) + " گامِ اولِ اجرای «" + t.fa + "» به‌هم‌ریخته‌اند. به ترتیبِ درست رویشان بزن."),
      sw.length ? h("p", { class: "small muted" }, sw.map(function (p) { return "گام‌های " + fa(p[0] + 1) + " و " + fa(p[1] + 1); }).join("، ") + " را می‌شود به هر دو ترتیب انجام داد؛ هر دو ترتیب پذیرفته است.") : null,
      list, out);
  }
  /* جمله‌هایی که بیرون از متنِ خودشان مبهم‌اند (یا هم «درست» خوانده می‌شوند هم «اشتباه») از بازی کنار می‌روند. */
  var SPOT_SKIP = { 44: { m: [1] }, 5: { m: [3] }, 14: { s: [2] }, 36: { s: [0] }, 23: { s: [6] } };
  function spotPool(t) {
    var sk = SPOT_SKIP[t.id] || {};
    return {
      s: t.steps.filter(function (_, i) { return (sk.s || []).indexOf(i) < 0; }),
      m: (t.mistakes || []).filter(function (x, i) { return (sk.m || []).indexOf(i) < 0 && !/^\s*عکس/.test(x); })
    };
  }
  A._courseSpotPool = function (tid) { return TM[tid] ? spotPool(TM[tid]) : null; };
  function spotGame(t) {
    var pool = spotPool(t);
    if (pool.m.length < 2 || pool.s.length < 2) return null;
    var items = A.shuffle(A.shuffle(pool.s.slice()).slice(0, 2).map(function (s) { return { s: s, ok: true }; })
      .concat(A.shuffle(pool.m.slice()).slice(0, 2).map(function (s) { return { s: s, ok: false }; })));
    var left = items.length, right = 0;
    var out = h("p", { class: "small muted" }, "برای هر جمله بگو: کارِ درست است یا اشتباهِ رایج؟");
    return h("section", { class: "card" }, h("h3", {}, "درست یا اشتباهِ رایج؟"),
      h("div", { class: "col gap" }, items.map(function (it) {
        var fb = h("div", { class: "small" });
        var row = h("div", { class: "crs-spot" }, h("p", {}, it.s), h("div", { class: "row gap wrap" }, [["کارِ درست", true], ["اشتباهِ رایج", false]].map(function (o) {
          return h("button", { class: "btn sm ghost", onclick: function (e) {
            var good = o[1] === it.ok; left--; if (good) right++;
            row.classList.add(good ? "ok" : "bad");
            e.target.parentNode.replaceWith(fb);
            fb.textContent = (good ? "✓ درست تشخیص دادی — " : "✗ نه — ") + (it.ok ? "این یکی از گام‌های درستِ اجراست." : "این از اشتباه‌های رایجی است که تکنیک را بی‌اثر می‌کند.");
            if (!left) { out.textContent = fa(right) + " از " + fa(items.length) + " درست. " + (right === items.length ? "عالی." : "اشتباه‌ها را یک بار دیگر بخوان؛ همین‌ها را در قدمِ ۳ نکن."); out.className = "small " + (right === items.length ? "good" : "warn"); markTry(t.id, "spot"); }
          } }, o[0]);
        })), fb);
        return row;
      })), out);
  }
  function markTry(id, k) { var c = st(); c.tried = c.tried || {}; c.tried[id] = c.tried[id] || {}; if (c.tried[id][k]) return; c.tried[id][k] = 1; if (S.get("course")) save(c); }
  function tryStep(t) {
    var box = h("div", { class: "col gap" });
    var sim = SIM[t.id];
    if (sim) box.appendChild(h("section", { class: "card crs-sim" }, h("div", { class: "eyebrow" }, "شبیه‌ساز"), h("h3", {}, sim.title), sim.draw(), h("p", { class: "small muted" }, sim.note)));
    var g1 = orderGame(t), g2 = spotGame(t);
    if (g1) box.appendChild(g1);
    if (g2) box.appendChild(g2);
    if (!sim && !g1 && !g2) box.appendChild(A.empty("برای این تکنیک تمرینِ کوتاهِ جداگانه‌ای نیست؛ گام‌های قدمِ ۱ را یک بار دیگر بخوان و برو سراغِ قدمِ ۳."));
    return box;
  }

  /* ---------- قدمِ ۳: روی موضوعِ خودت ---------- */
  /* کاربرگ تا اولین ورودیِ واقعی فقط در حافظه است؛ hd.put() آن را می‌سازد/ذخیره می‌کند. */
  function exHandle(c, t) {
    var ex = c.ex[t.id] && S.get(c.ex[t.id]);
    if (!ex) ex = S.all("ex", function (e) { return e.tid === t.id && e.course && !e.sample && (!c.topic || !e.topic || e.topic === c.topic); })[0] || null;
    var live = !!ex;
    if (!ex) ex = { id: A.uid("ex"), type: "ex", tid: t.id, topic: c.topic || "", status: "draft", data: {}, rubric: [], course: true };
    if (!ex.topic && c.topic) ex.topic = c.topic;
    return { ex: ex, live: function () { return live; }, put: function () { if (!live) { live = true; c.ex[t.id] = ex.id; } S.put(ex); } };
  }
  function doStep(c, t, ctl) {
    var hd = exHandle(c, t), ex = hd.ex, tp = S.get(c.topic);
    var box = h("div", { class: "col gap" });
    box.appendChild(h("section", { class: "card soft" }, h("p", {}, "حالا «" + t.fa + "» را روی موضوعِ خودت اجرا کن: ", h("b", {}, tp ? tp.title : "—"), ". فیلدهای ستاره‌دار لازم‌اند؛ بقیه اختیاری. هر چه بنویسی خودکار ذخیره می‌شود."),
      t.example ? h("details", {}, h("summary", { class: "small" }, "نمی‌دانی چه بنویسی؟ نمونه را ببین"), h("p", { class: "small" }, h("b", {}, t.example.title + ": "), t.example.text)) : null));
    var savef = A.debounce(function () { hd.put(); }, 400);
    ex.data = ex.data || {};
    var ws = A.renderWS(t.ws, ex.data, function () { savef(); }, { prefix: "crs" });
    ctl.validate = function () { return ws._validate(); };
    box.appendChild(h("section", { class: "card wsform" }, ws));
    return box;
  }

  /* ---------- قدمِ ۴: بسنج و ببند ---------- */
  function cardQA(t, c) {
    var q = "روی «" + topicTitle(c) + "»: «" + t.fa + "» را چطور اجرا می‌کنی و چرا کار می‌کند؟ (گام‌های اصلی و سازوکار — نه تعریف)";
    var a = "گام‌ها: " + t.steps.slice(0, 5).map(function (s, i) { return (i + 1) + ") " + sent1(s); }).join(" ") + (t.steps.length > 5 ? " …" : "") +
      "\nچرا: " + sent1(t.why, 2) + ((t.mistakes || [])[0] ? "\nاشتباهِ رایج: " + t.mistakes[0] : "");
    return { q: q, a: a };
  }
  function checkStep(c, t, finish) {
    var hd = exHandle(c, t), ex = hd.ex;
    var box = h("div", { class: "col gap" });
    ex.rubric = ex.rubric || [];
    var rub = h("div", { class: "rubric" }, t.rubric.map(function (q, i) {
      return h("div", { class: "rrow" }, h("div", { class: "rc" }, q), h("div", { class: "seg", role: "radiogroup", "aria-label": q }, [0, 1, 2].map(function (v) {
        return h("button", { type: "button", role: "radio", "aria-checked": ex.rubric[i] === v ? "true" : "false", class: "sg" + (ex.rubric[i] === v ? " on" : ""), onclick: function (e) {
          if (ex.rubric[i] === v) return;
          ex.rubric[i] = v; e.target.parentNode.querySelectorAll(".sg").forEach(function (b, j) { b.classList.toggle("on", j === v); b.setAttribute("aria-checked", j === v ? "true" : "false"); }); hd.put();
        } }, ["۰ · نه", "۱ · تا حدودی", "۲ · کامل"][v]);
      })));
    }));
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "خودارزیابی: درست اجرا کردم؟"), h("p", { class: "small muted" }, "صادقانه؛ این فقط برای خودت است و «تسلط»ِ همین تکنیک را می‌سازد."), rub));
    var QA = cardQA(t, c);
    var ta = h("textarea", { rows: 3, placeholder: QA.q, "aria-label": QA.q });
    var prev = c.recall[t.id];
    if (prev && prev.txt) ta.value = prev.txt;
    ta.addEventListener("input", function () { c.recall[t.id] = { d: A.today(), txt: ta.value }; saveSoon(c); });
    var made = !!c.cards[t.id];
    var rec = h("section", { class: "card" }, h("h3", {}, "پیش از بستن، از حافظه"),
      h("p", { class: "small" }, QA.q),
      h("p", { class: "small muted" }, "یک بار بی‌نگاه بنویس؛ بعد مقایسه کن. همین پرسش به یک کارتِ مرور تبدیل می‌شود که «مرور» در روزهای بعد می‌پرسد. نوشته‌ات ذخیره می‌شود."), ta,
      made ? h("p", { class: "small good" }, "کارتِ مرورِ این درس قبلاً ساخته شده.") : h("button", { class: "btn ghost sm mt", onclick: function (e) {
        e.target.replaceWith(h("div", { class: "crs-reveal" }, h("p", { class: "small" }, h("b", {}, "گام‌ها:")), stepFlow(t), h("p", {}, h("b", {}, "چرا کار می‌کند: "), sent1(t.why, 2))));
        if (!c.cards[t.id]) {
          var cd = A.newCard(QA.q, QA.a, { tid: t.id, topic: c.topic });
          c.cards[t.id] = cd && cd.id || 1;
          if (ta.value.trim()) c.recall[t.id] = { d: A.today(), txt: ta.value };
          save(c); A.toast("کارتِ مرور ساخته شد.");
        }
      } }, "مقایسه کن و کارت بساز"));
    box.appendChild(rec);
    box.appendChild(h("section", { class: "card soft" }, h("h3", {}, "از فردا"), h("p", {}, t.dose)));
    box.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn lg", onclick: finish }, c.done[t.id] && !c.elsewhere[t.id] ? "✓ تمام‌شده — برو به درسِ بعد" : "✓ این درس تمام شد — درسِ بعد ←")));
    return box;
  }

  /* ---------- درس ---------- */
  var STEPS = [["s0", "۰ گرم‌کردن"], ["s1", "۱ ببین و بفهم"], ["s2", "۲ امتحان کن"], ["s3", "۳ انجام بده"], ["s4", "۴ بسنج و ببند"]];
  var STEPNAME = { s0: "گرم‌کردن", s1: "قدمِ ۱", s2: "قدمِ ۲", s3: "قدمِ ۳", s4: "قدمِ ۴" };
  function goNextLesson(c) { var nl = nextLesson(c); if (nl) A.go("lesson", nl.tid, "s1"); else A.go("course"); }
  A.V.lesson = function (tid, sub) {
    var c = st();
    A._crsChange = false;
    if (topicLost(c)) return onboarding(c, "lost");
    if (!c.topic) return onboarding(c, nDone(c) ? "pick" : "new");
    tid = +tid; var t = TM[tid], L = LESSONS[LIDX[tid]];
    if (!t || !L) return A.empty("این درس پیدا نشد.", h("button", { class: "btn", onclick: function () { A.go("course"); } }, "نقشهٔ دوره"));
    var want = /^s[0-4]$/.test(sub || "") ? sub : "s1";
    var step = want, gated = false;
    if (want !== "s0" && !c.done[tid] && gateOpen(c, tid)) { step = "s0"; gated = true; A.state.sub = "s0"; }
    /* جای کاربر در درس: فقط وقتی واقعاً عوض شد، و با یک نوشتن */
    if (step !== "s0" && c.step[tid] !== step) { c.step[tid] = step; saveSoon(c); }
    var w = weekOf(L.w), li = LIDX[tid];
    var root = h("div", { class: "page crs" });
    root.appendChild(h("div", { class: "crs-top" },
      h("div", { class: "crs-bar" }, h("i", { style: { width: pct(c) + "%" } })),
      h("div", { class: "row between wrap gap small" },
        h("span", {}, "منزلِ " + fa(L.w) + " از ۸ · " + w.fa + " · درسِ " + fa(L.wi + 1) + " از " + fa(L.wn), h("span", { class: "muted" }, " (کلِ دوره: " + fa(li + 1) + " از " + fa(LESSONS.length) + ")")),
        h("button", { class: "btn ghost sm", onclick: function () { A.go("course"); } }, "🗺️ نقشهٔ دوره"))));
    root.appendChild(A.head("درسِ " + fa(li + 1), fa(tid) + " · " + t.fa, "تا آخرِ این درس می‌توانی «" + t.fa + "» را روی موضوعِ خودت اجرا کنی. زمانِ تقریبی: " + minText(t) + " (برآورد از روی کاربرگ و تمرین‌های همین درس؛ لازم نیست یک‌نفس تمامش کنی — هر چه بنویسی ذخیره می‌شود)."));
    if (c.elsewhere[tid]) root.appendChild(h("section", { class: "card soft crs-elsewhere" },
      h("p", {}, h("b", {}, "این تکنیک را پیش‌تر بیرون از دوره تمام کرده‌ای"), " (" + A.fdate(c.done[tid]) + "، در کاربرگِ خودِ تکنیک). لازم نیست دوباره انجامش بدهی و در پیشرفتِ دوره حساب شده؛ اگر بخواهی می‌توانی مرورش کنی یا روی موضوعِ دوره هم اجرایش کنی."),
      h("div", { class: "row gap wrap" }, h("button", { class: "btn sm", onclick: function () { goNextLesson(c); } }, "برو به درسِ بعد ←"))));
    var order = STEPS.map(function (s) { return s[0]; });
    function goStep(s) { A.go("lesson", tid, s); }
    function nextStep() { var i = order.indexOf(step); if (i < order.length - 1) goStep(order[i + 1]); }
    root.appendChild(A.tabs(STEPS.map(function (s) { return [s[0], (c.done[tid] && s[0] === "s4" ? "✓ " : "") + s[1]]; }), step, goStep));
    var ctl = {};
    var body;
    if (step === "s0") {
      var to = gated ? want : "s1";
      body = warmStep(c, tid, function () { goStep(to); }, gated ? "ادامه به " + STEPNAME[to] + " ←" : "برو به قدمِ ۱ ←", gated);
    }
    else if (step === "s1") body = seeStep(t);
    else if (step === "s2") body = tryStep(t);
    else if (step === "s3") body = doStep(c, t, ctl);
    else body = checkStep(c, t, function () {
      var hd = exHandle(c, t), ex = hd.ex;
      var miss = A.renderWS(t.ws, ex.data || {}, function () {}, { prefix: "chk" })._validate();
      if (miss.length) { A.toast("کاربرگِ قدمِ ۳ هنوز کامل نیست: " + miss.slice(0, 2).join("، ") + (miss.length > 2 ? "…" : ""), "bad"); goStep("s3"); return; }
      ex.status = "done"; hd.put(); try { A.onExDone(ex); } catch (e) { console.error(e); }
      if (!c.done[tid] || c.elsewhere[tid]) { c.done[tid] = A.today(); delete c.elsewhere[tid]; }
      save(c);
      A.toast("درسِ " + fa(li + 1) + " تمام شد.");
      goNextLesson(c);
    });
    root.appendChild(h("div", { class: "crs-body" }, body));
    if (step !== "s4" && step !== "s0") {
      var i = order.indexOf(step);
      root.appendChild(h("div", { class: "row between gap crs-nav" },
        i > 0 ? h("button", { class: "btn ghost", onclick: function () { goStep(order[i - 1]); } }, "→ قدمِ قبل") : h("span"),
        h("button", { class: "btn", onclick: function () {
          if (step === "s3" && ctl.validate) { var miss = ctl.validate(); if (miss.length) { A.toast("این‌ها هنوز خالی‌اند: " + miss.slice(0, 3).join("، "), "bad"); return; } }
          nextStep();
        } }, "قدمِ بعد ←")));
    }
    return root;
  };

  /* ================= تصویرها و شبیه‌سازهای ویژه =================
     همه «مدلِ ساده‌شده برای شهود»اند؛ شکلِ اثر از پژوهش است، عددهای روی محورها نمادین‌اند. */
  var VIS = {}, SIM = {};
  var svg = A.svg;
  function rangeIn(label, min, max, val, oninput, step) {
    var out = h("output", {}, fa(val));
    var r = h("input", { type: "range", min: min, max: max, step: step || 1, value: val, "aria-label": label, oninput: function () { out.textContent = fa(r.value); oninput(+r.value); } });
    return h("label", { class: "crs-range" }, h("span", {}, label), r, out);
  }

  /* ۴۲ — منحنیِ فراموشی و اثرِ فاصله‌گذاری (مدلِ نمایشی که واقعاً به فاصله بستگی دارد) */
  SIM[42] = {
    title: "منحنیِ فراموشی: فاصلهٔ مرورها را خودت انتخاب کن",
    note: "مدلِ نمایشی/تقریبی، نه پیش‌بینیِ علمی. دو فرضِ سادهٔ آن: (۱) پس از هر مرورِ موفق، فراموشی کندتر می‌شود؛ (۲) سودِ یک مرور وقتی بیشتر است که کمی فراموش کرده باشی ولی هنوز بتوانی بازیابی کنی — پس مرورِ پشتِ‌سرِهم در همان روز تقریباً چیزی اضافه نمی‌کند، و فاصلهٔ خیلی بلند هم سودِ هر مرور را کم می‌کند. شکلِ کلیِ اثرِ فاصله‌گذاری از ابینگهاوس (۱۸۸۵) تا فراتحلیلِ Cepeda و همکاران (۲۰۰۶) تأیید شده؛ اما برتریِ فاصله‌های «فزاینده» بر فاصله‌های «برابر» ثابت نشده (Karpicke و Roediger، ۲۰۰۷). همهٔ عددهای این نمودار نمادین‌اند.",
    draw: function () {
      var D = 45, NREV = 4;
      var gap = 1, mode = "grow", none = false;
      var W = 640, H = 230, L = 40, B = 30, T = 12;
      var box = h("div", { class: "col gap" });
      var holder = h("div", { class: "crs-chart", dir: "ltr" });
      var info = h("p", { class: "small" }), info2 = h("div", { class: "small muted" });
      function plan() {
        if (none) return [];
        var out = [];
        for (var k = 1; k <= NREV; k++) { var d = mode === "grow" ? gap * (Math.pow(2, k) - 1) : gap * k; if (d <= 30) out.push(d); }
        return out;
      }
      function R(dt, s) { return 0.15 + 0.85 * Math.exp(-dt / s); }
      function retention(revs) {
        var s1 = 1.2, last = 0, k = 0, pts = [], at = [];
        for (var x = 0; x <= D + 1e-9; x += 0.25) {
          while (k < revs.length && revs[k] <= x) {
            var r = R(revs[k] - last, s1);
            s1 *= 1 + 3 * (1 - r) * Math.min(1, r / 0.4);
            at.push(r); last = revs[k]; k++;
          }
          pts.push([x, R(x - last, s1)]);
        }
        return { pts: pts, at: at };
      }
      function draw() {
        holder.innerHTML = "";
        var revs = plan();
        var s = svg("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", role: "img", "aria-label": "نمودارِ درصدِ به‌یادماندن در " + fa(D) + " روز (نمایشی)" });
        var X = function (d) { return L + (W - L - 10) * d / D; }, Y = function (r) { return T + (H - T - B) * (1 - r); };
        [0, .25, .5, .75, 1].forEach(function (r) { s.appendChild(svg("line", { x1: L, x2: W - 10, y1: Y(r), y2: Y(r), stroke: "var(--line)", "stroke-width": 1 })); var tx = svg("text", { x: L - 6, y: Y(r) + 4, "text-anchor": "end", "font-size": 10, fill: "var(--ink-2)" }); tx.textContent = fa(Math.round(r * 100)) + "٪"; s.appendChild(tx); });
        [0, 5, 10, 15, 20, 25, 30, 35, 40, 45].forEach(function (d) { var tx = svg("text", { x: X(d), y: H - 10, "text-anchor": "middle", "font-size": 10, fill: "var(--ink-2)" }); tx.textContent = "روز " + fa(d); s.appendChild(tx); });
        var res = retention(revs), pts = res.pts;
        s.appendChild(svg("polyline", { points: pts.map(function (p) { return X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1); }).join(" "), fill: "none", stroke: "var(--accent)", "stroke-width": 2 }));
        [0].concat(revs).forEach(function (d) { s.appendChild(svg("circle", { cx: X(d), cy: Y(1), r: 4, fill: "var(--accent)" })); });
        holder.appendChild(s);
        var end = pts[pts.length - 1][1];
        info.textContent = "مرورها: " + (revs.length ? revs.map(function (d) { return "روز " + fa(d); }).join("، ") : "هیچ (فقط خواندنِ روزِ ۰)") + " · به‌یادماندن در روزِ " + fa(D) + " (در این مدلِ نمایشی): حدودِ " + fa(Math.round(end * 100)) + "٪";
        info2.textContent = res.at.length ? "در لحظهٔ هر مرور چقدر هنوز یادت بود (همین مدل): " + res.at.map(function (r) { return fa(Math.round(r * 100)) + "٪"; }).join("، ") + " — مرور وقتی بیشترین سود را دارد که نه کاملاً تازه باشد نه کاملاً فراموش‌شده." : "";
        gapIn.querySelector("output").textContent = fa(gap);
        gapIn.querySelector("input").value = gap;
      }
      var gapIn = rangeIn("فاصلهٔ اولین مرور (روز؛ ۰ = همان روز)", 0, 10, gap, function (v) { gap = v; none = false; draw(); });
      var picks = h("div", { class: "row gap wrap" }, [["مرورِ فشرده (۴ بار در همان روز)", function () { gap = 0; none = false; }], ["فاصله‌دار (روز ۱، ۳، ۷، ۱۵)", function () { gap = 1; mode = "grow"; none = false; }], ["بی‌مرور", function () { none = true; }]].map(function (p) {
        return h("button", { class: "btn sm ghost", onclick: function () { p[1](); draw(); } }, p[0]);
      }));
      var modes = h("div", { class: "row gap wrap small" }, h("span", {}, "شکلِ فاصله‌ها:"), [["فزاینده (هر بار دو برابر)", "grow"], ["برابر", "equal"]].map(function (m) {
        return h("button", { class: "btn sm ghost", onclick: function () { mode = m[1]; none = false; draw(); } }, m[0]);
      }));
      box.appendChild(picks); box.appendChild(gapIn); box.appendChild(modes); box.appendChild(holder); box.appendChild(info); box.appendChild(info2);
      draw();
      return box;
    }
  };

  /* ۳۷ — بارِ شناختی: لیوانِ حافظهٔ کاری */
  SIM[37] = {
    title: "لیوانِ حافظهٔ کاری: بارِ بیرونی را کم کن، بارِ ذاتی را زمان‌بندی کن",
    note: "مدلِ ساده‌شده (نمایشی) از نظریهٔ بارِ شناختی (Sweller): ظرفیتِ حافظهٔ کاری محدود است. بارِ ذاتی از پیچیدگیِ خودِ مطلب (برای تو) می‌آید و پردازشِ آن همان یادگیری است — حذفش نمی‌کنی، زمان‌بندی‌اش می‌کنی. بارِ بیرونی از محیط و شکلِ ارائه می‌آید (اعلان، جابه‌جایی میانِ پنجره‌ها و منابع، تکرارِ هم‌زمانِ یک چیز در دو قالب) و فقط ظرفیت را هدر می‌دهد. دشواری‌های مطلوب (بازیابی، درهم‌تنیدگی) بارِ بیرونی نیستند. اندازه‌ها نمادین‌اند.",
    draw: function () {
      var intrinsic = 40;
      var X = [["اعلانِ گوشی روشن", 18], ["پیام‌رسانِ باز (حتی کوچک‌شده)", 12], ["دو پنجره کنارِ هم (متن یک‌جا، شکل جای دیگر)", 15], ["همان توضیح هم‌زمان هم روی صفحه هم با صدا (افزونگی)", 10], ["چند منبعِ موازیِ هم‌موضوع (سه ویدیو برای یک مفهوم)", 14]];
      var on = X.map(function () { return true; });
      var fill = h("div", { class: "crs-cup" }), info = h("p", { class: "small" });
      function draw() {
        var extra = 0; on.forEach(function (v, i) { if (v) extra += X[i][1]; });
        var free = Math.max(0, 100 - intrinsic - extra), over = intrinsic + extra > 100;
        fill.innerHTML = "";
        fill.appendChild(h("div", { class: "seg intr", style: { height: Math.min(intrinsic, 100) + "%" } }, "ذاتی " + fa(intrinsic)));
        fill.appendChild(h("div", { class: "seg extr", style: { height: Math.min(extra, 100 - Math.min(intrinsic, 100)) + "%" } }, extra ? "بیرونی " + fa(extra) : ""));
        fill.appendChild(h("div", { class: "seg free", style: { height: free + "%" } }, free ? "ظرفیتِ آزاد " + fa(free) : ""));
        fill.classList.toggle("over", over);
        info.textContent = over ? "سرریز: مجموعِ بار از ظرفیت بیشتر شده و بخشی از خودِ مطلب پردازش نمی‌شود. اول بارِ بیرونی را خاموش کن."
          : extra === 0 ? "بارِ بیرونی خاموش است. آنچه می‌ماند بارِ ذاتیِ خودِ مطلب است؛ آن را حذف نکن (همان یادگیری است). اگر سنگین است، زمان‌بندی‌اش کن: اول هر جزء جدا و با یک مثالِ حل‌شده، بعد تعاملِ اجزا."
          : free >= 35 ? "جا برای پردازشِ خودِ مطلب هست؛ هنوز " + fa(extra) + " واحد بارِ بیرونی روشن است و هر چه کمترش کنی بهتر."
          : "جا تنگ است: " + fa(extra) + " واحد بارِ بیرونی روشن است. چند تا را خاموش کن.";
      }
      var box = h("div", { class: "crs-cupwrap" },
        h("div", { class: "col gap" }, rangeIn("پیچیدگیِ خودِ مطلب برای تو (بارِ ذاتی)", 10, 80, intrinsic, function (v) { intrinsic = v; draw(); }, 5),
          h("div", { class: "small muted" }, "منابعِ بارِ بیرونی — روی هر کدام بزن تا خاموش/روشن شود:"),
          h("div", { class: "col gap" }, X.map(function (x, i) {
            var b = h("button", { class: "btn sm crs-tog on", onclick: function () { on[i] = !on[i]; b.classList.toggle("on", on[i]); b.textContent = (on[i] ? "🔴 " : "⚪ ") + x[0]; draw(); } }, "🔴 " + x[0]);
            return b;
          }))),
        h("div", { class: "col gap" }, fill, info));
      draw();
      return box;
    }
  };

  /* ۴۰ — ICAP: چهار حالتِ درگیری */
  VIS[40] = {
    title: "چارچوبِ ICAP: چهار حالتِ درگیری (Chi و Wylie، ۲۰۱۴)",
    draw: function () {
      var rungs = [["تعاملی (Interactive)", "دو نفر که هر دو سازنده‌اند و هر کدام بر حرفِ دیگری چیزی می‌افزاید یا آن را نقد می‌کند"], ["سازنده (Constructive)", "چیزی تازه تولید می‌کنی که در متن نبود: توضیحِ خود، پرسش، نقشه، مقایسه"], ["فعال (Active)", "کاری فیزیکی با متن می‌کنی ولی چیزی تازه نمی‌سازی: خط‌کشیدن، رونویسی، عقب‌زدنِ ویدئو"], ["منفعل (Passive)", "فقط می‌خوانی یا گوش می‌دهی"]];
      return h("div", { class: "crs-ladder" }, rungs.map(function (r, i) { return h("div", { class: "rung r" + i }, h("b", {}, r[0]), h("span", { class: "small" }, r[1])); }));
    },
    note: "فرضیهٔ ICAP: تعاملی > سازنده > فعال > منفعل — هر حالت معمولاً یادگیریِ بیشتری از حالتِ پایین‌ترش می‌دهد. «کاری کردن» با متن (فعال) کافی نیست؛ باید چیزی تازه ساخته شود. گفت‌وگو فقط وقتی «تعاملی» است که هر دو طرف سازنده باشند و بر حرفِ هم بنا کنند؛ اگر یکی فقط گوش بدهد، برای او منفعل است."
  };
  SIM[40] = {
    title: "هر کار کدام حالت است؟",
    note: "دسته‌بندی بر اساسِ تعریف‌های چارچوبِ ICAP (Chi و Wylie، ۲۰۱۴): تعاملی > سازنده > فعال > منفعل.",
    draw: function () {
      var L = ["منفعل", "فعال", "سازنده", "تعاملی"];
      var items = A.shuffle([["ویدئوی آموزشی را از اول تا آخر نگاه می‌کنی", 0], ["زیرِ جمله‌های مهمِ کتاب خط می‌کشی", 1], ["پاراگراف را کلمه‌به‌کلمه در دفتر رونویسی می‌کنی", 1], ["بی‌نگاه به کتاب، با کلماتِ خودت توضیح می‌دهی چرا این‌طور است", 2], ["از روی فصل یک نقشهٔ مفهومی با پیکان‌های علّی می‌کشی", 2], ["برای خودت سه پرسشِ «چرا» دربارهٔ متن می‌سازی", 2], ["با همکارت بحث می‌کنی و هر کدام استدلالِ دیگری را تکمیل یا نقد می‌کند", 3], ["پادکست را حینِ رانندگی گوش می‌دهی", 0]]);
      var right = 0, left = items.length, out = h("p", { class: "small muted" });
      return h("div", { class: "col gap" }, items.map(function (it) {
        var fb = h("span", { class: "small" });
        var row = h("div", { class: "crs-spot" }, h("p", {}, it[0]), h("div", { class: "row gap wrap" }, L.map(function (l, li) {
          return h("button", { class: "btn sm ghost", onclick: function (e) {
            var ok = li === it[1]; if (ok) right++; left--;
            row.classList.add(ok ? "ok" : "bad"); e.target.parentNode.replaceWith(fb);
            fb.textContent = (ok ? "✓ " : "✗ ") + "حالت: " + L[it[1]];
            if (!left) { out.textContent = fa(right) + " از " + fa(items.length) + " درست."; markTry(40, "icap"); }
          } }, l);
        })), fb);
        return row;
      }), out);
    }
  };

  /* ۳۲ — آگاهیِ فراشناختی: سنجشِ اطمینان */
  SIM[32] = {
    title: "چقدر به دانسته‌هایت مطمئنی؟ (سنجشِ اطمینان)",
    note: "هر جمله، با همان قیدی که در خودش آمده، بر پایهٔ پژوهش‌های شناخته‌شدهٔ یادگیری یا درست است یا نادرست. هدف «درست‌گفتن» نیست؛ هدف این است که ببینی اطمینانت با درستی‌ات چقدر جور است — همان کاری که «ناظرِ درونی» باید بکند. اطمینانِ ۵۰ یعنی حدسِ محض، ۱۰۰ یعنی کاملاً مطمئن.",
    draw: function () {
      var Q = [["برای به‌یادآوردن پس از یک هفته، بازخوانیِ چندبارهٔ متن معمولاً از امتحان‌گرفتن از خود مؤثرتر است.", false, "اثرِ آزمون: در آزمایشِ Roediger و Karpicke (۲۰۰۶)، پس از یک هفته گروهی که از خود امتحان گرفته بود بیشتر به یاد داشت؛ هرچند در آزمونِ پنج دقیقه بعد، بازخوانی کمی جلو بود. یعنی برای بلندمدت، نه در هر لحظه."],
        ["مرورِ فشرده در یک شب، برای به‌خاطرسپاریِ بلندمدت بهتر از همان مقدار مرورِ پخش‌شده در چند روز است.", false, "اثرِ فاصله‌گذاری: مرورِ پخش‌شده برای نگه‌داریِ بلندمدت بهتر است (Cepeda و همکاران، ۲۰۰۶)."],
        ["تلاش برای جواب‌دادن پیش از دیدنِ پاسخ — به شرطِ آن‌که بعدش پاسخِ درست را ببینی — حتی اگر جوابت غلط باشد، معمولاً یادگیری را بهتر می‌کند.", true, "Kornell، Hays و Bjork (۲۰۰۹): تلاشِ ناموفق، وقتی بازخورد بیاید، سودمند بود. بدونِ دیدنِ پاسخ، خطا ممکن است تثبیت شود — همان محدودیتی که در تکنیکِ ۴۱ آمده."],
        ["اگر خواندنِ متن روان و راحت بود، یعنی آن را خوب یاد گرفته‌ای.", false, "توهمِ روانی (Bjork و همکاران، ۲۰۱۳): روانی و آشنایی حسِ «بلدم» می‌سازند، ولی این حس نشانهٔ گمراه‌کننده‌ای است، چون آشنا بودنِ متن را وقتی جلوی چشمت است می‌سنجد، نه توانِ به‌یادآوردنش را وقتی نیست."],
        ["آموزش‌دادن مطابقِ «سبکِ یادگیریِ» هر فرد (دیداری/شنیداری) یادگیری را بهتر می‌کند.", false, "شواهدِ معتبری برای «تطبیق با سبکِ یادگیری» پیدا نشده (Pashler و همکاران، ۲۰۰۸)."],
        ["خوابِ پس از یادگیری به تثبیتِ آموخته‌ها کمک می‌کند.", true, "خواب در تثبیتِ حافظه نقش دارد (Diekelmann و Born، ۲۰۱۰) — البته فقط برای آنچه پیش از آن رمزگذاری یا بازیابی شده."]];
      var ans = [], box = h("div", { class: "col gap" }), res = h("div", {});
      Q.forEach(function (q, i) {
        ans[i] = { v: null, conf: 70 };
        var conf = rangeIn("اطمینان", 50, 100, 70, function (v) { ans[i].conf = v; }, 5);
        var pick = h("div", { class: "row gap" }, [["درست", true], ["نادرست", false]].map(function (o) {
          var b = h("button", { class: "btn sm ghost", onclick: function () { ans[i].v = o[1]; pick.querySelectorAll("button").forEach(function (x) { x.classList.add("ghost"); }); b.classList.remove("ghost"); } }, o[0]);
          return b;
        }));
        box.appendChild(h("div", { class: "crs-spot" }, h("p", {}, fa(i + 1) + ". " + q[0]), h("div", { class: "row gap wrap" }, pick, conf)));
      });
      box.appendChild(h("button", { class: "btn", onclick: function () {
        if (ans.some(function (a) { return a.v === null; })) { A.toast("به همه جواب بده.", "bad"); return; }
        var right = 0, conf = 0;
        res.innerHTML = "";
        Q.forEach(function (q, i) { var ok = ans[i].v === q[1]; if (ok) right++; conf += ans[i].conf;
          res.appendChild(h("p", { class: "small " + (ok ? "good" : "bad") }, (ok ? "✓ " : "✗ ") + fa(i + 1) + ". " + (q[1] ? "درست" : "نادرست") + " — " + q[2])); });
        var acc = Math.round(100 * right / Q.length), mc = Math.round(conf / Q.length), gap = mc - acc;
        res.insertBefore(h("div", { class: "crs-calib" },
          h("div", {}, h("div", { class: "small muted" }, "اطمینانِ میانگینِ تو"), h("div", { class: "crs-meter" }, h("i", { style: { width: mc + "%" } })), h("b", {}, fa(mc) + "٪")),
          h("div", {}, h("div", { class: "small muted" }, "درستیِ واقعیِ تو"), h("div", { class: "crs-meter acc" }, h("i", { style: { width: acc + "%" } })), h("b", {}, fa(acc) + "٪")),
          h("p", {}, gap > 10 ? "نشانهٔ بیش‌اطمینانی: میانگینِ اطمینانت " + fa(gap) + " واحد بالاتر از درستی‌ات بود. ناظرِ درونی دقیقاً برای گرفتنِ همین فاصله است." : gap < -10 ? "نشانهٔ کم‌اطمینانی: بیشتر از آنچه فکر می‌کردی می‌دانستی." : "اطمینانت تقریباً با درستی‌ات جور بود."),
          h("p", { class: "small muted" }, "با فقط ۶ جمله، هر جواب حدودِ ۱۷ واحد درستی را جابه‌جا می‌کند و آستانهٔ ۱۰ واحدیِ بالا قراردادی و فقط برای همین نمایش است؛ پس این نتیجه یک نشانه است، نه حکم. برای تصویرِ قابل‌اتکا، اطمینانت را در چند نوبت و با پرسش‌های بیشتر بسنج.")), res.firstChild);
        markTry(32, "calib");
      } }, "ببینم چطور بودم"));
      box.appendChild(res);
      return box;
    }
  };

  /* ۴۱ — بازیابیِ فعال: پنهان کن، بنویس، مقایسه کن */
  SIM[41] = {
    title: "تمرینِ کوچکِ بازیابی: بخوان، پنهان کن، از حافظه بنویس",
    note: "این یک تمرینِ کوچک روی متنی کوتاه است و فقط شکلِ کار را نشان می‌دهد، نه اثرش را. در پژوهش‌ها (مثلاً Roediger و Karpicke، ۲۰۰۶) بازیابی همراه با مقایسه با منبع، برای یادآوریِ چند روز بعد معمولاً از دوباره‌خواندن بهتر بوده؛ به شرطِ آن‌که مطلب پیش‌تر فهمیده شده باشد.",
    draw: function () {
      var TXT = "بازیابیِ فعال یعنی به‌جای دوباره‌خواندن، اول بدونِ نگاه هر چه یادت هست بنویس یا بگو، بعد با منبع مقایسه کن و شکاف‌ها را علامت بزن. تلاش برای بیرون‌کشیدن، حتی وقتی ناقص است، مفید است — به شرطِ این‌که بعدش پاسخ را ببینی؛ بی‌مقایسه، خطاها تثبیت می‌شوند. بازخوانی حسِ آشنایی می‌دهد ولی آشنایی با به‌یادآوردن یکی نیست. بازیابیِ بلافاصله بهتر از هیچ است، ولی بازیابی با کمی تأخیر اثرِ ماندگارتری دارد. شکاف‌هایی که پیدا می‌کنی، پرسش‌های مرورِ بعدی‌ات می‌شوند.";
      var KEYS = ["اول بی‌نگاه بنویس/بگو، بعد با منبع مقایسه کن", "تلاشِ ناقص هم مفید است، به شرطِ دیدنِ پاسخ؛ بی‌مقایسه خطا تثبیت می‌شود", "آشنایی (بازخوانی) با به‌یادآوردن یکی نیست", "بلافاصله بهتر از هیچ؛ با کمی تأخیر ماندگارتر", "شکاف‌ها ⇒ پرسش‌های مرورِ بعدی"];
      var box = h("div", { class: "col gap" }), stage = h("div", {});
      function s1() {
        stage.innerHTML = "";
        stage.appendChild(h("div", { class: "card soft" }, h("p", {}, TXT)));
        var b = h("button", { class: "btn", onclick: s2 }, "خواندم؛ پنهانش کن");
        stage.appendChild(b);
      }
      function s2() {
        stage.innerHTML = "";
        var ta = h("textarea", { rows: 5, placeholder: "هر چه از متن یادت هست، با کلماتِ خودت…" });
        stage.appendChild(h("p", { class: "small" }, "متن پنهان شد. حالا بدونِ نگاه، هر چه یادت هست بنویس:"));
        stage.appendChild(ta);
        stage.appendChild(h("button", { class: "btn mt", onclick: function () { if (ta.value.trim().length < 10) { A.toast("دست‌کم یک جمله بنویس — تلاش مهم است، نه کامل‌بودن.", "bad"); return; } s3(ta.value); } }, "تمام؛ مقایسه کن"));
      }
      function s3(mine) {
        stage.innerHTML = "";
        var got = 0;
        stage.appendChild(h("div", { class: "crs-cmp" }, h("div", {}, h("div", { class: "small muted" }, "نوشتهٔ تو"), h("p", { class: "small" }, mine)), h("div", {}, h("div", { class: "small muted" }, "متن"), h("p", { class: "small" }, TXT))));
        var out = h("p", { class: "small" });
        stage.appendChild(h("p", { class: "small" }, "کدام نکته‌ها را آوردی؟ صادقانه تیک بزن:"));
        stage.appendChild(h("div", { class: "col" }, KEYS.map(function (k) {
          var cb = h("input", { type: "checkbox", onchange: function () { got += cb.checked ? 1 : -1; out.textContent = fa(got) + " از " + fa(KEYS.length) + " نکته. هر نکته‌ای که جا افتاد، همان چیزی است که باید پرسشِ مرورِ بعدی شود."; } });
          return h("label", { class: "row gap" }, cb, h("span", {}, k));
        })));
        stage.appendChild(out); markTry(41, "recall");
        stage.appendChild(h("button", { class: "btn ghost sm", onclick: s1 }, "از اول"));
      }
      s1(); box.appendChild(stage);
      return box;
    }
  };

  /* ۱۲ — پنج چرا: زنجیرهٔ علّی با شاهد */
  SIM[12] = {
    title: "زنجیرهٔ «چرا» را بساز — هر حلقه باید شاهد داشته باشد",
    note: "سناریوی آموزشیِ ساختگی. نکته‌های تکنیک: مسئله یک واقعیتِ مشخص است نه قضاوت؛ هر «چرا» یک سازوکارِ قابلِ بررسی است (با شاهد)، نه برچسب، تکرارِ مسئله یا تقصیرِ یک آدم؛ عددِ پنج قراردادی است؛ و چون مشکل‌های واقعی اغلب چندعلتی‌اند، شاخه‌های دیگر هم باید جداگانه بررسی شوند.",
    draw: function () {
      var P = "در سه پروندهٔ اخیر، گزارشِ ارزیابیِ وثیقه بعد از جلسهٔ کمیتهٔ اعتباری رسید و تصمیم یک نوبت عقب افتاد.";
      var CH = [
        [["چون درخواستِ ارزیابی دیر به ارزیاب رسید: ارزیاب در مهلتِ قراردادیِ ۱۰ روزه جواب داده، ولی درخواست هر بار کمتر از ۱۰ روز پیش از جلسه فرستاده شده بود.", 1, "شاهد: تاریخِ نامهٔ درخواست و تاریخِ تحویلِ گزارش در هر سه پرونده — قابلِ بررسی است."],
          ["چون ارزیاب‌ها همیشه کندند.", 0, "تعمیمِ بی‌شاهد — و شاهدِ پرونده خلافش را می‌گوید: ارزیاب در مهلت جواب داده بود."],
          ["چون گزارش دیر رسید.", 0, "این تکرارِ خودِ مسئله با کلماتِ دیگر است، نه علت."]],
        [["چون در چک‌لیستِ شروعِ پرونده، گامِ «فرستادنِ درخواستِ ارزیابی» نیست و هر کارشناس هر وقت یادش بیاید آن را می‌فرستد.", 1, "شاهد: خودِ چک‌لیست، و این‌که فاصلهٔ تشکیلِ پرونده تا فرستادنِ درخواست در سه پرونده بسیار متفاوت بوده."],
          ["چون همکارم بی‌دقت است.", 0, "مقصر را یک آدم معرفی می‌کند و همان‌جا می‌ایستد؛ بپرس کدام فرایند این خطا را ممکن کرد."]],
        [["چون چک‌لیست برای وقتی نوشته شده که ارزیابی داخلی و هم‌زمان انجام می‌شد؛ از وقتی ارزیابی به بیرون سپرده شد، کسی مسئولِ به‌روزکردنِ چک‌لیست نبوده.", 1, "شاهد: تاریخِ آخرین ویرایشِ چک‌لیست پیش از تاریخِ تغییرِ فرایند است. ریشه: یک گامِ جاافتاده و یک مسئولیتِ تعریف‌نشده — هر دو قابلِ اصلاح."],
          ["چون مدیر اهمیت نمی‌دهد.", 0, "تقصیرِ شخصی؛ نه شاهد دارد، نه اقدامِ مشخصی می‌سازد."],
          ["چون این ماه شانس نیاوردیم.", 0, "توضیح نمی‌دهد و اقدامی هم نمی‌سازد."]]];
      var box = h("div", { class: "col gap" }), chain = h("ol", { class: "crs-why" }), k = 0;
      chain.appendChild(h("li", { class: "prob" }, h("b", {}, "مسئله (یک واقعیتِ مشخص): "), P));
      var opts = h("div", { class: "col gap" });
      function ask() {
        opts.innerHTML = "";
        if (k >= CH.length) {
          opts.appendChild(h("div", { class: "card soft" },
            h("p", {}, h("b", {}, "به ریشه رسیدی"), " — این‌جا با سه «چرا»؛ عددِ پنج قراردادی است. معیارِ توقف: به چیزی رسیدی که قابلِ اصلاح است."),
            h("p", {}, h("b", {}, "اقدام: "), "گامِ «فرستادنِ درخواستِ ارزیابی، دست‌کم ۱۵ روز پیش از جلسه» به چک‌لیست اضافه شود و یک نفر مسئولِ بازبینیِ چک‌لیست با هر تغییرِ فرایند باشد."),
            h("p", {}, h("b", {}, "از کجا بفهمی ریشه درست بود: "), "اگر در پرونده‌های بعدی گزارش پیش از جلسه رسید، ریشه درست بوده؛ اگر نه، زنجیره را دوباره باز کن."),
            h("p", { class: "small muted" }, "شاخهٔ دیگری که باید جداگانه بررسی شود: آیا تاریخِ جلسه‌های کمیته هم جلو افتاده بود؟ مشکل‌های واقعی اغلب بیش از یک علت دارند.")));
          markTry(12, "why"); return;
        }
        opts.appendChild(h("p", { class: "small" }, "چرای " + fa(k + 1) + ": کدام پاسخ یک علتِ واقعی و قابلِ بررسی است؟"));
        A.shuffle(CH[k].slice()).forEach(function (o) {
          opts.appendChild(h("button", { class: "btn ghost crs-whyopt", onclick: function (e) {
            if (o[1]) { chain.appendChild(h("li", {}, h("b", {}, "چرا؟ "), o[0], h("div", { class: "small muted" }, "✓ " + o[2]))); k++; ask(); }
            else { e.target.classList.add("bad"); e.target.disabled = true; e.target.appendChild(h("div", { class: "small" }, "✗ " + o[2])); }
          } }, o[0]));
        });
      }
      box.appendChild(chain); box.appendChild(opts); ask();
      return box;
    }
  };
})(APP);
