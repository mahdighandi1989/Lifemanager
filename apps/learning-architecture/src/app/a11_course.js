/* ===== دورهٔ گام‌به‌گام: از صفر تا آخر =====
   چرا (مالک ۲۰۲۶-۱۰-۱۱): «وارد یه اقیانوس شدم، اون هم از وسطش» — کتابخانهٔ مرجع جای کلاسِ درس نیست. این دوره همان ۴۵ تکنیک
   را به ترتیبِ برنامهٔ ۸ هفته‌ای (C.CURRICULUM) یکی‌یکی و با یک الگوی ثابت جلو می‌برد، روی **یک موضوعِ واقعیِ خودت**:
     ۰ گرم‌کردن — بازیابیِ درس‌های قبلی با فاصلهٔ فزاینده (خودِ دوره تکنیک‌های ۴۱ و ۴۲ را روی تو اجرا می‌کند)
     ۱ ببین و بفهم — یک جمله تعریف، یک تصویر، جای تکنیک در چرخه
     ۲ امتحان کن — تمرینِ تعاملی (شبیه‌سازِ ویژه یا تمرین‌های ساخته‌شده از گام‌ها و اشتباه‌های رایجِ خودِ تکنیک)
     ۳ انجام بده — کاربرگِ همان تکنیک روی موضوعِ دوره
     ۴ بسنج و ببند — روبریک، یک کارتِ مرور، و «کارِ فردا»
   هیچ پیوندی در دوره تو را به جای دیگر پرت نمی‌کند: ارجاع‌ها در کشوی کناری باز می‌شوند.
   شبیه‌سازها «مدلِ ساده‌شده برای شهود»اند و همین را روی خودشان می‌نویسند؛ عددِ علمی جعل نمی‌شود. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, C = A.C, TM = A.TM;
  var WEEKS = C.CURRICULUM;
  var LESSONS = [];
  WEEKS.forEach(function (w) { w.ids.forEach(function (id, i) { LESSONS.push({ tid: id, w: w.w, wi: i, wn: w.ids.length }); }); });
  var LIDX = {}; LESSONS.forEach(function (l, i) { LIDX[l.tid] = i; });
  A.COURSE_LESSONS = LESSONS;

  /* ---------- وضعیت ---------- */
  function st() {
    var c = S.get("course");
    if (!c) c = { id: "course", type: "course", topic: "", done: {}, warm: {}, ex: {}, cards: {}, step: {}, cur: LESSONS[0].tid };
    c.done = c.done || {}; c.warm = c.warm || {}; c.ex = c.ex || {}; c.cards = c.cards || {}; c.step = c.step || {};
    return c;
  }
  function save(c) { S.put(c); }
  function nDone(c) { return Object.keys(c.done).length; }
  function nextLesson(c) { for (var i = 0; i < LESSONS.length; i++) if (!c.done[LESSONS[i].tid]) return LESSONS[i]; return null; }
  A.courseNext = function () { var c = S.get("course"); return c && c.topic ? nextLesson(st()) : null; };
  A.courseState = function () { return S.get("course") ? st() : null; };
  function weekOf(w) { return WEEKS[w - 1]; }
  function pct(c) { return Math.round(100 * nDone(c) / LESSONS.length); }

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
  function onboarding() {
    var c = st();
    var root = h("div", { class: "page crs" });
    root.appendChild(A.head("دورهٔ گام‌به‌گام", "از صفر، یک قدم در هر بار", "این دوره همهٔ ۴۵ تکنیک را در ۸ منزل و ۴۵ درسِ کوتاه (هر کدام ۱۵ تا ۲۰ دقیقه) جلو می‌برد. لازم نیست چیزی از قبل بدانی و لازم نیست جای دیگری بروی: هر درس خودش می‌گوید چه بکنی و بعدش کجا بروی."));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "هر درس همیشه همین پنج قدم است"), stepIcons(),
      h("p", { class: "small muted" }, "قدمِ «گرم‌کردن» خودش دو تکنیکِ دوره است (بازیابیِ فعال و تکرارِ فاصله‌دار): هر درسی که تمام کنی، چند روز بعد دوباره از حافظه پرسیده می‌شود.")));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "مسیر: ۸ منزل"), weekStrip(c, true)));
    var ti = h("input", { type: "text", id: "crsTopic", placeholder: "مثلاً: تحلیلِ وثیقه‌های ملکی، شبکه‌های عصبی، یا مدیریتِ ریسک در ترید" });
    var pick = c.topic || "";
    var hasTopics = S.all("topic", function (t) { return !t.sample; }).length > 0;
    root.appendChild(h("section", { class: "card crs-start" },
      h("h2", {}, "یک موضوعِ واقعی انتخاب کن"),
      h("p", {}, "همهٔ تمرین‌های دوره روی همین موضوع انجام می‌شوند؛ پس چیزی باشد که واقعاً می‌خواهی عمیق بفهمی یا الان درگیرش هستی. بعداً هم می‌شود عوضش کرد."),
      h("label", { for: "crsTopic" }, "موضوعِ تازه"), ti,
      hasTopics ? h("div", { class: "mt" }, h("label", { for: "crsTopicSel", class: "small" }, "یا یکی از موضوع‌هایی که قبلاً ساخته‌ای:"), A.topicSelect(pick, function (v) { pick = v; }, "crsTopicSel")) : null,
      h("div", { class: "row gap wrap mt" }, h("button", { class: "btn", onclick: function () {
        var tid = pick;
        if (ti.value.trim()) { var t = S.put({ id: A.uid("tp"), type: "topic", title: ti.value.trim(), dom: "", src: "", kind: "", course: true }); tid = t.id; }
        if (!tid) { A.toast("یک موضوع بنویس یا انتخاب کن.", "bad"); ti.focus(); return; }
        c.topic = tid; c.started = c.started || A.today(); save(c);
        A.go("lesson", LESSONS[0].tid, "s1");
      } }, "شروعِ درسِ اول ←"))));
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
            return h("button", { class: "crs-dot" + (on ? " on" : "") + (now ? " now" : ""), title: fa(id) + " · " + TM[id].fa + (on ? " (تمام‌شده)" : now ? " (درسِ بعدیِ تو)" : ""),
              onclick: function () { if (c.topic) A.go("lesson", id, c.step[id] || "s1"); } });
          })),
          compact ? null : h("div", { class: "small muted" }, fa(done) + " از " + fa(all) + " درس")));
    }));
  }
  A.V.course = function () {
    var c = st();
    if (!c.topic) return onboarding();
    var nl = nextLesson(c), tp = S.get(c.topic);
    var root = h("div", { class: "page crs" });
    root.appendChild(A.head("دورهٔ گام‌به‌گام", "نقشهٔ سفر", "کجای دوره‌ای، چقدر مانده، و قدمِ بعدی‌ات چیست."));
    root.appendChild(h("section", { class: "card crs-now" },
      h("div", { class: "crs-bar" }, h("i", { style: { width: pct(c) + "%" } })),
      h("div", { class: "row between wrap gap" },
        h("div", {}, h("div", { class: "small muted" }, fa(nDone(c)) + " از " + fa(LESSONS.length) + " درس · " + fa(pct(c)) + "٪ ِ دوره"),
          h("div", { class: "small" }, "موضوعِ دوره: ", h("b", {}, tp ? tp.title : "—"), " ", h("button", { class: "linkish small", onclick: function () { c.topic = ""; save(c); A.render(); } }, "(عوض کن)"))),
        nl ? h("button", { class: "btn lg", onclick: function () { A.go("lesson", nl.tid, c.step[nl.tid] || (hasWarm(c, nl.tid) ? "s0" : "s1")); } },
          "▶ ادامه: درسِ " + fa(LIDX[nl.tid] + 1) + " — " + TM[nl.tid].fa) : h("span", { class: "pill good" }, "دوره تمام شد 🎉"))));
    root.appendChild(h("section", { class: "card" }, h("h2", {}, "مسیر"), h("p", { class: "small muted" }, "هر خال یک درس است؛ پُر = تمام‌شده، 📍 = درسِ بعدیِ تو. روی هر خال بزنی همان درس باز می‌شود."), weekStrip(c, false)));
    var cw = nl ? weekOf(nl.w) : WEEKS[WEEKS.length - 1];
    root.appendChild(h("section", { class: "card" },
      h("h2", {}, "منزلِ " + fa(cw.w) + ": " + cw.fa),
      h("p", {}, cw.why),
      h("ol", { class: "crs-wlist" }, cw.ids.map(function (id) {
        return h("li", { class: c.done[id] ? "on" : "" }, h("button", { class: "linkish", onclick: function () { A.go("lesson", id, c.step[id] || "s1"); } }, (c.done[id] ? "✓ " : "") + fa(id) + " · " + TM[id].fa),
          h("span", { class: "small muted" }, " — " + (TM[id].when || "").slice(0, 90) + "…"));
      })),
      (cw.protos || []).length ? h("p", { class: "small muted" }, "روال‌های این منزل (بعد از درس‌ها، در «پروتکل‌ها»): " + cw.protos.map(function (p) { return A.pn ? A.pn(p) : p; }).join("، ")) : null));
    return root;
  };

  /* ---------- گرم‌کردن: بازیابی با فاصلهٔ فزاینده ---------- */
  var GAPS = [1, 3, 7, 21, 60];
  function dueWarm(c, exceptTid) {
    var t = A.today();
    return Object.keys(c.done).map(Number).filter(function (id) {
      if (id === exceptTid) return false;
      var w = c.warm[id] || { n: 0, due: A.addDays(c.done[id], 1) };
      return (w.due || "") <= t;
    }).sort(function (a, b) { return ((c.warm[a] || {}).due || c.done[a]) < ((c.warm[b] || {}).due || c.done[b]) ? -1 : 1; }).slice(0, 2);
  }
  function hasWarm(c, tid) { return dueWarm(c, tid).length > 0; }
  function warmStep(c, tid, next) {
    var ids = dueWarm(c, tid);
    var box = h("div", { class: "col gap" });
    box.appendChild(h("p", { class: "lead small" }, "پیش از درسِ تازه، دو دقیقه از حافظه: بدونِ نگاه‌کردن جواب بده، بعد پاسخ را ببین و صادقانه بگو چقدر یادت بود. همین تلاش (حتی اگر ناقص باشد) یادگیری را محکم می‌کند — این خودش تکنیکِ ۴۱ است، و فاصلهٔ پرسش‌ها تکنیکِ ۴۲."));
    if (!ids.length) { box.appendChild(A.empty("امروز چیزی برای گرم‌کردن موعد نیست.", h("button", { class: "btn", onclick: next }, "برو به قدمِ ۱ ←"))); return box; }
    ids.forEach(function (id) {
      var t = TM[id], ta = h("textarea", { rows: 3, placeholder: "از حافظه: «" + t.fa + "» چیست و کی به کارش می‌بری؟" });
      var ans = h("div", { class: "crs-reveal hidden" }, h("p", {}, h("b", {}, "تعریف: "), t.def), h("p", { class: "small" }, h("b", {}, "کی: "), t.when),
        h("div", { class: "row gap wrap" }, [["یادم بود", 2], ["تا حدی", 1], ["یادم نبود", 0]].map(function (g) {
          return h("button", { class: "btn sm" + (g[1] === 2 ? "" : " ghost"), onclick: function (e) {
            var w = c.warm[id] || { n: 0 };
            w.n = g[1] === 2 ? (w.n || 0) + 1 : g[1] === 1 ? Math.max(0, (w.n || 0)) : 0;
            w.due = A.addDays(A.today(), GAPS[Math.min(w.n, GAPS.length - 1)] * (g[1] === 1 ? 0.5 : 1) | 0 || 1);
            w.last = A.today(); w.g = g[1]; c.warm[id] = w; save(c);
            e.target.parentNode.replaceWith(h("p", { class: "small muted" }, "ثبت شد؛ دفعهٔ بعد: " + A.fdate(w.due)));
          } }, g[0]);
        })));
      box.appendChild(h("section", { class: "card" }, h("h3", {}, "«" + t.fa + "»"), ta,
        h("button", { class: "btn ghost sm mt", onclick: function (e) { ans.classList.remove("hidden"); e.target.remove(); } }, "پاسخ را نشان بده"), ans));
    });
    box.appendChild(h("div", { class: "row gap" }, h("button", { class: "btn", onclick: next }, "برو به قدمِ ۱ ←")));
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
  function orderGame(t) {
    var steps = t.steps.slice(0, 5);
    if (steps.length < 3) return null;
    var order = A.shuffle(steps.map(function (_, i) { return i; }));
    if (order.every(function (v, i) { return v === i; })) order.reverse();
    var want = 0, tries = 0;
    var out = h("p", { class: "small muted" }, "روی گامِ اول بزن، بعد دوم، …");
    var list = h("div", { class: "crs-order" }, order.map(function (i) {
      var b = h("button", { class: "crs-ocard", onclick: function () {
        if (b.classList.contains("ok")) return;
        tries++;
        if (i === want) { b.classList.add("ok"); b.insertBefore(h("span", { class: "n" }, fa(i + 1)), b.firstChild); want++;
          if (want === steps.length) { out.textContent = tries === steps.length ? "بی‌خطا! ترتیب را درست می‌دانی." : "تمام شد با " + fa(tries - steps.length) + " اشتباه. ترتیبِ درست حالا روی کارت‌هاست."; out.className = "small good"; markTry(t.id, "order"); }
          else out.textContent = "درست. حالا گامِ " + fa(want + 1) + "؟";
        } else { b.classList.add("bad"); setTimeout(function () { b.classList.remove("bad"); }, 600); out.textContent = "این گامِ " + fa(want + 1) + " نیست. دوباره نگاه کن: کدام باید قبل از بقیه بیاید؟"; }
      } }, h("span", {}, steps[i]));
      return b;
    }));
    return h("section", { class: "card" }, h("h3", {}, "ترتیب را بساز"), h("p", { class: "small" }, "این " + fa(steps.length) + " گامِ اولِ اجرای «" + t.fa + "» به‌هم‌ریخته‌اند. به ترتیبِ درست رویشان بزن."), list, out);
  }
  function spotGame(t) {
    if (!t.mistakes || t.mistakes.length < 2) return null;
    var items = A.shuffle(A.shuffle(t.steps.slice()).slice(0, 2).map(function (s) { return { s: s, ok: true }; })
      .concat(A.shuffle(t.mistakes.slice()).slice(0, 2).map(function (s) { return { s: s, ok: false }; })));
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
  function markTry(id, k) { var c = st(); c.tried = c.tried || {}; c.tried[id] = c.tried[id] || {}; c.tried[id][k] = 1; save(c); }
  function tryStep(t) {
    var box = h("div", { class: "col gap" });
    var sim = SIM[t.id];
    if (sim) box.appendChild(h("section", { class: "card crs-sim" }, h("div", { class: "eyebrow" }, "شبیه‌ساز"), h("h3", {}, sim.title), sim.draw(), h("p", { class: "small muted" }, sim.note)));
    var g1 = orderGame(t), g2 = spotGame(t);
    if (g1) box.appendChild(g1);
    if (g2) box.appendChild(g2);
    return box;
  }

  /* ---------- قدمِ ۳: روی موضوعِ خودت ---------- */
  function exFor(c, t) {
    var ex = c.ex[t.id] && S.get(c.ex[t.id]);
    if (!ex) { ex = A.newEx(t.id, c.topic); ex.course = true; S.put(ex); c.ex[t.id] = ex.id; save(c); }
    if (!ex.topic && c.topic) { ex.topic = c.topic; S.put(ex); }
    return ex;
  }
  function doStep(c, t, ctl) {
    var ex = exFor(c, t), tp = S.get(c.topic);
    var box = h("div", { class: "col gap" });
    box.appendChild(h("section", { class: "card soft" }, h("p", {}, "حالا «" + t.fa + "» را روی موضوعِ خودت اجرا کن: ", h("b", {}, tp ? tp.title : "—"), ". فیلدهای ستاره‌دار لازم‌اند؛ بقیه اختیاری. همه‌چیز خودکار ذخیره می‌شود."),
      t.example ? h("details", {}, h("summary", { class: "small" }, "نمی‌دانی چه بنویسی؟ نمونه را ببین"), h("p", { class: "small" }, h("b", {}, t.example.title + ": "), t.example.text)) : null));
    var savef = A.debounce(function () { S.put(ex); }, 400);
    var ws = A.renderWS(t.ws, ex.data, function () { savef(); }, { prefix: "crs" });
    ctl.validate = function () { return ws._validate(); };
    box.appendChild(h("section", { class: "card wsform" }, ws));
    return box;
  }

  /* ---------- قدمِ ۴: بسنج و ببند ---------- */
  function checkStep(c, t, finish) {
    var ex = exFor(c, t);
    var box = h("div", { class: "col gap" });
    ex.rubric = ex.rubric || [];
    var rub = h("div", { class: "rubric" }, t.rubric.map(function (q, i) {
      return h("div", { class: "rrow" }, h("div", { class: "rc" }, q), h("div", { class: "seg", role: "radiogroup", "aria-label": q }, [0, 1, 2].map(function (v) {
        return h("button", { type: "button", role: "radio", "aria-checked": ex.rubric[i] === v ? "true" : "false", class: "sg" + (ex.rubric[i] === v ? " on" : ""), onclick: function (e) {
          ex.rubric[i] = v; e.target.parentNode.querySelectorAll(".sg").forEach(function (b, j) { b.classList.toggle("on", j === v); b.setAttribute("aria-checked", j === v ? "true" : "false"); }); S.put(ex);
        } }, ["۰ نه", "۱ تاحدی", "۲ کامل"][v]);
      })));
    }));
    box.appendChild(h("section", { class: "card" }, h("h3", {}, "خودارزیابی: درست اجرا کردم؟"), h("p", { class: "small muted" }, "صادقانه؛ این فقط برای خودت است و «تسلط»ِ همین تکنیک را می‌سازد."), rub));
    var ta = h("textarea", { rows: 3, placeholder: "بدونِ نگاه: «" + t.fa + "» چیست و کی به کارش می‌بری؟" });
    var made = !!c.cards[t.id];
    var rec = h("section", { class: "card" }, h("h3", {}, "پیش از بستن، از حافظه"), h("p", { class: "small muted" }, "یک بار بی‌نگاه بنویس؛ بعد مقایسه کن. همین به یک کارتِ مرور تبدیل می‌شود که «مرور» در روزهای بعد می‌پرسد."), ta,
      made ? h("p", { class: "small good" }, "کارتِ مرورِ این درس قبلاً ساخته شده.") : h("button", { class: "btn ghost sm mt", onclick: function (e) {
        e.target.replaceWith(h("div", { class: "crs-reveal" }, h("p", {}, h("b", {}, "تعریف: "), t.def), h("p", { class: "small" }, h("b", {}, "کی: "), t.when)));
        if (!c.cards[t.id]) { var cd = A.newCard("«" + t.fa + "» چیست و کی به کارش می‌بری؟", t.def + "\nکی: " + t.when, { tid: t.id, topic: c.topic }); c.cards[t.id] = cd && cd.id || 1; save(c); A.toast("کارتِ مرور ساخته شد."); }
      } }, "مقایسه کن و کارت بساز"));
    box.appendChild(rec);
    box.appendChild(h("section", { class: "card soft" }, h("h3", {}, "از فردا"), h("p", {}, t.dose)));
    box.appendChild(h("div", { class: "row gap wrap" }, h("button", { class: "btn lg", onclick: finish }, c.done[t.id] ? "✓ تمام‌شده — برو به درسِ بعد" : "✓ این درس تمام شد — درسِ بعد ←")));
    return box;
  }

  /* ---------- درس ---------- */
  var STEPS = [["s0", "۰ گرم‌کردن"], ["s1", "۱ ببین و بفهم"], ["s2", "۲ امتحان کن"], ["s3", "۳ انجام بده"], ["s4", "۴ بسنج و ببند"]];
  A.V.lesson = function (tid, sub) {
    var c = st();
    if (!c.topic) return onboarding();
    tid = +tid; var t = TM[tid], L = LESSONS[LIDX[tid]];
    if (!t || !L) return A.empty("این درس پیدا نشد.", h("button", { class: "btn", onclick: function () { A.go("course"); } }, "نقشهٔ دوره"));
    var step = /^s[0-4]$/.test(sub || "") ? sub : "s1";
    if (c.step[tid] !== step) { c.step[tid] = step; save(c); }
    var w = weekOf(L.w), li = LIDX[tid];
    var root = h("div", { class: "page crs" });
    root.appendChild(h("div", { class: "crs-top" },
      h("div", { class: "crs-bar" }, h("i", { style: { width: pct(c) + "%" } })),
      h("div", { class: "row between wrap gap small" },
        h("span", {}, "منزلِ " + fa(L.w) + " از ۸ · " + w.fa + " · درسِ " + fa(L.wi + 1) + " از " + fa(L.wn), h("span", { class: "muted" }, " (کلِ دوره: " + fa(li + 1) + " از " + fa(LESSONS.length) + ")")),
        h("button", { class: "btn ghost sm", onclick: function () { A.go("course"); } }, "🗺️ نقشهٔ دوره"))));
    root.appendChild(A.head("درسِ " + fa(li + 1), fa(tid) + " · " + t.fa, "تا آخرِ این درس می‌توانی «" + t.fa + "» را روی موضوعِ خودت اجرا کنی. حدودِ ۱۵ تا ۲۰ دقیقه."));
    var order = STEPS.map(function (s) { return s[0]; });
    function goStep(s) { A.go("lesson", tid, s); }
    function nextStep() { var i = order.indexOf(step); if (i < order.length - 1) goStep(order[i + 1]); }
    root.appendChild(A.tabs(STEPS.map(function (s) { return [s[0], (c.done[tid] && s[0] === "s4" ? "✓ " : "") + s[1]]; }), step, goStep));
    var ctl = {};
    var body;
    if (step === "s0") body = warmStep(c, tid, function () { goStep("s1"); });
    else if (step === "s1") body = seeStep(t);
    else if (step === "s2") body = tryStep(t);
    else if (step === "s3") body = doStep(c, t, ctl);
    else body = checkStep(c, t, function () {
      var ex = exFor(c, t);
      var miss = A.renderWS(t.ws, ex.data, function () {}, { prefix: "chk" })._validate();
      if (miss.length) { A.toast("کاربرگِ قدمِ ۳ هنوز کامل نیست: " + miss.slice(0, 2).join("، ") + (miss.length > 2 ? "…" : ""), "bad"); goStep("s3"); return; }
      ex.status = "done"; S.put(ex); try { A.onExDone(ex); } catch (e) { console.error(e); }
      if (!c.done[tid]) c.done[tid] = A.today();
      save(c);
      var nl = nextLesson(c);
      A.toast("درسِ " + fa(li + 1) + " تمام شد.");
      if (nl) A.go("lesson", nl.tid, hasWarm(c, nl.tid) ? "s0" : "s1"); else A.go("course");
    });
    root.appendChild(h("div", { class: "crs-body" }, body));
    if (step !== "s4") {
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

  /* ۴۲ — منحنیِ فراموشی و اثرِ فاصله‌گذاری */
  SIM[42] = {
    title: "منحنیِ فراموشی: مرورِ فشرده در برابرِ مرورِ فاصله‌دار",
    note: "مدلِ ساده‌شده: پس از هر مرورِ موفق، فراموشی کندتر می‌شود (پایداری بزرگ‌تر)، و مرورِ پشت‌سرِهم در یک روز سودِ کمی اضافه می‌کند. منحنی مثلِ منحنی‌های واقعی در پایین صاف می‌شود (چیزی همیشه می‌ماند). شکلِ اثر از ابینگهاوس (۱۸۸۵) تا فراتحلیلِ Cepeda و همکاران (۲۰۰۶) تأیید شده؛ عددهای این نمودار نمادین‌اند.",
    draw: function () {
      var PRE = { cram: [0, 0, 0, 0], spaced: [0, 1, 3, 7, 15], none: [0] };
      var plan = PRE.spaced.slice();
      var W = 640, H = 230, L = 40, B = 30, T = 12, D = 30;
      var box = h("div", { class: "col gap" });
      var holder = h("div", { class: "crs-chart", dir: "ltr" });
      var info = h("p", { class: "small" });
      function retention(days) {
        var revs = days.slice().sort(function (a, b) { return a - b; }), S1 = 1.2, pts = [], last = 0, k = 0;
        for (var x = 0; x <= D; x += 0.25) {
          while (k < revs.length && revs[k] <= x) { var same = k > 0 && revs[k] === revs[k - 1]; S1 = k === 0 ? 1.2 : S1 * (same ? 1.15 : 2.3); last = revs[k]; k++; }
          pts.push([x, 0.15 + 0.85 * Math.exp(-(x - last) / S1)]);
        }
        return pts;
      }
      function draw() {
        holder.innerHTML = "";
        var s = svg("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", role: "img", "aria-label": "نمودارِ درصدِ یادماندن در ۳۰ روز" });
        var X = function (d) { return L + (W - L - 10) * d / D; }, Y = function (r) { return T + (H - T - B) * (1 - r); };
        [0, .25, .5, .75, 1].forEach(function (r) { s.appendChild(svg("line", { x1: L, x2: W - 10, y1: Y(r), y2: Y(r), stroke: "var(--line)", "stroke-width": 1 })); var tx = svg("text", { x: L - 6, y: Y(r) + 4, "text-anchor": "end", "font-size": 10, fill: "var(--ink-2)" }); tx.textContent = fa(Math.round(r * 100)) + "٪"; s.appendChild(tx); });
        [0, 5, 10, 15, 20, 25, 30].forEach(function (d) { var tx = svg("text", { x: X(d), y: H - 10, "text-anchor": "middle", "font-size": 10, fill: "var(--ink-2)" }); tx.textContent = "روز " + fa(d); s.appendChild(tx); });
        var pts = retention(plan);
        s.appendChild(svg("polyline", { points: pts.map(function (p) { return X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1); }).join(" "), fill: "none", stroke: "var(--accent)", "stroke-width": 2 }));
        plan.forEach(function (d) { s.appendChild(svg("circle", { cx: X(d), cy: Y(1), r: 4, fill: "var(--accent)" })); });
        holder.appendChild(s);
        var end = pts[pts.length - 1][1];
        info.textContent = "مرورها: " + (plan.length > 1 ? plan.map(function (d) { return "روز " + fa(d); }).join("، ") : "فقط یک بار، روزِ ۰") + " · یادماندن در روزِ ۳۰ (در این مدل): حدودِ " + fa(Math.round(end * 100)) + "٪";
      }
      var picks = h("div", { class: "row gap wrap" }, [["مرورِ فشرده (۴ بار در همان روز)", "cram"], ["فاصله‌دار (روز ۰، ۱، ۳، ۷، ۱۵)", "spaced"], ["بی‌مرور", "none"]].map(function (p) {
        return h("button", { class: "btn sm ghost", onclick: function () { plan = PRE[p[1]].slice(); draw(); } }, p[0]);
      }));
      var custom = h("div", { class: "row gap wrap small" }, h("span", {}, "یا خودت روز اضافه کن:"), [2, 4, 10, 20, 25].map(function (d) {
        return h("button", { class: "btn sm ghost", onclick: function () { if (plan.indexOf(d) < 0) plan.push(d); draw(); } }, "+ روز " + fa(d));
      }));
      box.appendChild(picks); box.appendChild(custom); box.appendChild(holder); box.appendChild(info);
      draw();
      return box;
    }
  };

  /* ۳۷ — بارِ شناختی: لیوانِ حافظهٔ کاری */
  SIM[37] = {
    title: "لیوانِ حافظهٔ کاری: چه چیزی جا را پر می‌کند؟",
    note: "مدلِ ساده‌شده از نظریهٔ بارِ شناختی (Sweller): حافظهٔ کاری ظرفیتِ کمی دارد؛ بارِ ذاتیِ خودِ مطلب لازم است، ولی بارِ اضافی (حواس‌پرتی، نگاه‌کردنِ هم‌زمان به چند جا، چیدمانِ شلوغ) جای ساختنِ فهم را می‌گیرد. اندازه‌ها نمادین‌اند.",
    draw: function () {
      var intrinsic = 40;
      var X = [["اعلانِ گوشی روشن", 18], ["موسیقیِ با کلام", 12], ["دو پنجره کنارِ هم (متن یک‌جا، شکل جای دیگر)", 15], ["خواندنِ بی‌هدف («فقط بخوانم»)", 10], ["چند منبعِ موازی برای یک موضوع", 14]];
      var on = X.map(function () { return true; });
      var fill = h("div", { class: "crs-cup" }), info = h("p", { class: "small" });
      function draw() {
        var extra = 0; on.forEach(function (v, i) { if (v) extra += X[i][1]; });
        var free = Math.max(0, 100 - intrinsic - extra), over = intrinsic + extra > 100;
        fill.innerHTML = "";
        fill.appendChild(h("div", { class: "seg intr", style: { height: Math.min(intrinsic, 100) + "%" } }, "ذاتی " + fa(intrinsic)));
        fill.appendChild(h("div", { class: "seg extr", style: { height: Math.min(extra, 100 - Math.min(intrinsic, 100)) + "%" } }, extra ? "اضافی " + fa(extra) : ""));
        fill.appendChild(h("div", { class: "seg free", style: { height: free + "%" } }, free ? "جای ساختنِ فهم " + fa(free) : ""));
        fill.classList.toggle("over", over);
        info.textContent = over ? "سرریز! لیوان پر شده؛ چیزی ساخته نمی‌شود، فقط «دیدن» است. چند حواس‌پرتی را خاموش کن." : free >= 35 ? "جای کافی برای فهمیدن هست. این همان حالتی است که تکنیک می‌خواهد بسازد." : "جا تنگ است؛ هنوز چیزهایی را می‌شود خاموش کرد.";
      }
      var box = h("div", { class: "crs-cupwrap" },
        h("div", { class: "col gap" }, rangeIn("سختیِ خودِ مطلب (بارِ ذاتی)", 10, 80, intrinsic, function (v) { intrinsic = v; draw(); }, 5),
          h("div", { class: "small muted" }, "روی هر کدام بزن تا خاموش/روشن شود:"),
          h("div", { class: "col gap" }, X.map(function (x, i) {
            var b = h("button", { class: "btn sm crs-tog on", onclick: function () { on[i] = !on[i]; b.classList.toggle("on", on[i]); b.textContent = (on[i] ? "🔴 " : "⚪ ") + x[0]; draw(); } }, "🔴 " + x[0]);
            return b;
          }))),
        h("div", { class: "col gap" }, fill, info));
      draw();
      return box;
    }
  };

  /* ۴۰ — ICAP: چهار پلهٔ درگیری */
  VIS[40] = {
    title: "چهار پلهٔ درگیری (Chi و Wylie، ۲۰۱۴)",
    draw: function () {
      var rungs = [["تعاملی", "با دیگری فکر را می‌سازید: هر کدام بر حرفِ دیگری چیزی می‌افزاید"], ["سازنده", "چیزی تازه تولید می‌کنی که در متن نبود: توضیحِ خود، پرسش، نقشه"], ["فعال", "کاری با متن می‌کنی ولی چیزی تازه نمی‌سازی: خط‌کشیدن، رونویسی"], ["منفعل", "فقط می‌خوانی یا گوش می‌دهی"]];
      return h("div", { class: "crs-ladder" }, rungs.map(function (r, i) { return h("div", { class: "rung r" + i }, h("b", {}, r[0]), h("span", { class: "small" }, r[1])); }));
    },
    note: "هر پله بالاتر، معمولاً یادگیریِ عمیق‌تر. نکته: «فعال» بودن کافی نیست؛ پرشِ اصلی از «فعال» به «سازنده» است."
  };
  SIM[40] = {
    title: "هر کار کدام پله است؟",
    note: "دسته‌بندی بر اساسِ تعریف‌های چارچوبِ ICAP (Chi و Wylie، ۲۰۱۴).",
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
            fb.textContent = (ok ? "✓ " : "✗ ") + "پله: " + L[it[1]];
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
    note: "هر جمله یا درست است یا نادرست، بر پایهٔ پژوهش‌های شناخته‌شده‌ی یادگیری. هدف «درست‌گفتن» نیست؛ هدف این است که ببینی اطمینانت با درستی‌ات چقدر جور است — همان کاری که «ناظرِ درونی» باید بکند.",
    draw: function () {
      var Q = [["بازخوانیِ چندبارهٔ متن، از امتحان‌گرفتن از خود مؤثرتر است.", false, "اثرِ آزمون: بازیابی از حافظه، از بازخوانی پایدارتر است (Roediger و Karpicke، ۲۰۰۶)."],
        ["مرورِ فشرده در یک شب، برای به‌خاطرسپاریِ بلندمدت بهتر از همان مقدار مرورِ پخش‌شده در چند روز است.", false, "اثرِ فاصله‌گذاری: مرورِ پخش‌شده برای نگه‌داریِ بلندمدت بهتر است (Cepeda و همکاران، ۲۰۰۶)."],
        ["تلاش برای جواب‌دادن پیش از دیدنِ پاسخ، حتی اگر جوابت غلط باشد، یادگیری را بهتر می‌کند.", true, "اثرِ تولید و پیش‌آزمون: تلاشِ پیش از پاسخ به یادگیری کمک می‌کند (Kornell و همکاران، ۲۰۰۹)."],
        ["اگر خواندنِ متن روان و راحت بود، یعنی آن را خوب یاد گرفته‌ای.", false, "توهمِ روانی: آشنایی و روانیِ خواندن، شاخصِ بدی برای یادگیری است (Bjork و همکاران، ۲۰۱۳)."],
        ["آموزش‌دادن مطابقِ «سبکِ یادگیریِ» هر فرد (دیداری/شنیداری) یادگیری را بهتر می‌کند.", false, "شواهدِ معتبری برای «تطبیق با سبکِ یادگیری» پیدا نشده (Pashler و همکاران، ۲۰۰۸)."],
        ["خوابِ پس از یادگیری به تثبیتِ آموخته‌ها کمک می‌کند.", true, "خواب در تثبیتِ حافظه نقش دارد (Diekelmann و Born، ۲۰۱۰)."]];
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
          h("p", {}, gap > 10 ? "بیش‌اطمینانی: " + fa(gap) + " واحد بیشتر از آنچه درست گفتی مطمئن بودی. ناظرِ درونی دقیقاً برای گرفتنِ همین فاصله است." : gap < -10 ? "کم‌اطمینانی: بیشتر از آنچه فکر می‌کردی می‌دانستی." : "اطمینانت با درستی‌ات جور بود. خوب است.")), res.firstChild);
        markTry(32, "calib");
      } }, "ببینم چطور بودم"));
      box.appendChild(res);
      return box;
    }
  };

  /* ۴۱ — بازیابیِ فعال: پنهان کن، بنویس، مقایسه کن */
  SIM[41] = {
    title: "یک بازیابیِ واقعی: بخوان، پنهان کن، از حافظه بنویس",
    note: "همین چند دقیقه یک تمرینِ واقعیِ بازیابی است: تلاشِ بیرون‌کشیدن از حافظه (حتی ناقص) ردِ حافظه را محکم‌تر از دوباره‌خواندن می‌کند (اثرِ آزمون).",
    draw: function () {
      var TXT = "بازیابیِ فعال یعنی به‌جای دوباره‌خواندن، اول بدونِ نگاه هر چه یادت هست بنویس یا بگو، بعد با منبع مقایسه کن و شکاف‌ها را علامت بزن. تلاشِ پیش از دیدنِ پاسخ مهم‌تر از درست‌بودنِ آن است. بازخوانی حسِ آشنایی می‌دهد ولی آشنایی با به‌یادآوردن یکی نیست. بهترین وقتش کمی بعد از یادگرفتن است، نه بلافاصله. شکاف‌هایی که پیدا می‌کنی، کارتِ مرورِ بعدی‌ات می‌شوند.";
      var KEYS = ["اول بدونِ نگاه بنویس/بگو، بعد مقایسه کن", "تلاشِ پیش از پاسخ، مهم‌تر از درست‌بودنِ آن", "آشنایی (بازخوانی) با به‌یادآوردن یکی نیست", "کمی بعد از یادگرفتن، نه بلافاصله", "شکاف‌ها ⇒ کارتِ مرور"];
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
          var cb = h("input", { type: "checkbox", onchange: function () { got += cb.checked ? 1 : -1; out.textContent = fa(got) + " از " + fa(KEYS.length) + " نکته. هر نکته‌ای که جا افتاد، دقیقاً همان چیزی است که باید کارتِ مرور شود."; } });
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
    note: "سناریوی آموزشیِ ساختگی. نکتهٔ تکنیک: هر «چرا» باید علتی قابلِ‌بررسی باشد (با شاهد)، نه برچسب یا تقصیر. ریشه جایی است که یک اقدامِ مشخص جلوی تکرار را می‌گیرد.",
    draw: function () {
      var P = "گزارشِ ارزیابیِ وثیقه دیر به کمیتهٔ اعتباری رسید.";
      var CH = [
        [["چون گزارشِ کارشناسِ ارزیابیِ ملک دیر آمد.", 1, "قابلِ‌بررسی: تاریخِ رسیدنِ گزارش در پرونده هست."], ["چون همکارم بی‌دقت است.", 0, "برچسب است نه علت؛ چیزی را که بشود بررسی و اصلاح کرد نشان نمی‌دهد."]],
        [["چون درخواستِ ارزیابی دو هفته بعد از تشکیلِ پرونده فرستاده شد.", 1, "شاهد: تاریخِ تشکیلِ پرونده و تاریخِ نامهٔ درخواست."], ["چون ارزیاب‌ها همیشه کندند.", 0, "تعمیمِ بی‌شاهد؛ این بار ارزیاب سرِ موعد جواب داده بود."]],
        [["چون در چک‌لیستِ شروعِ پرونده، گامِ «درخواستِ ارزیابی» وجود ندارد.", 1, "شاهد: خودِ چک‌لیست."], ["چون این ماه شانس نیاوردیم.", 0, "توضیح نمی‌دهد و اقدامی هم نمی‌سازد."]],
        [["چون چک‌لیست برای فرایندِ قدیمی نوشته شده و از وقتی ارزیابی بیرونی شد، کسی مسئولِ به‌روزکردنش نبوده.", 1, "ریشه: یک قاعده و یک مسئولیتِ گمشده — قابلِ اصلاح."], ["چون مدیر اهمیت نمی‌دهد.", 0, "تقصیرِ شخصی؛ نه شاهد دارد نه اقدامِ مشخص."]]];
      var box = h("div", { class: "col gap" }), chain = h("ol", { class: "crs-why" }), k = 0;
      chain.appendChild(h("li", { class: "prob" }, h("b", {}, "مسئله: "), P));
      var opts = h("div", { class: "col gap" });
      function ask() {
        opts.innerHTML = "";
        if (k >= CH.length) {
          opts.appendChild(h("div", { class: "card soft" }, h("b", {}, "به ریشه رسیدی. اقدام: "), "گامِ «درخواستِ ارزیابی» به چک‌لیست اضافه شود و یک نفر مسئولِ بازبینیِ چک‌لیست با هر تغییرِ فرایند باشد."));
          markTry(12, "why"); return;
        }
        opts.appendChild(h("p", { class: "small" }, "چرای " + fa(k + 1) + ": کدام علتِ واقعی‌تر است؟"));
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
