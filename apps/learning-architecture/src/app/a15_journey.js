/* ===== سفرِ گام‌به‌گام روی یک موضوع =====
   چرا (مالک ۲۰۲۶-۱۰-۱۱: «وسطِ اقیانوس، فقط متن، بی‌مسیر»): صفحهٔ موضوع مرجع است — مسیرِ ۱۱ گامی (C.PIPELINE) و «حالتِ کامل»
   همه را یک‌جا نشان می‌دهند، ولی نمی‌گویند «الان فقط همین یک کار را بکن». این نما همان ۱۱ گام را یکی‌یکی جلو می‌برد:
     📍 نوارِ ۱۱ گام (کجای مسیری) · این گام برای چیست (از دادهٔ خودِ گام: how و فاز) · «کارِ همین حالا»: یک کاربرگ که همین‌جا
     باز می‌شود (همان A.renderWS ِ صفحهٔ تکنیک/دوره) · فیلدهای ستاره‌دار «گامِ بعد» را باز می‌کنند · ابزارهای دیگرِ گام در کشوی کناری.
   صفحهٔ موضوع و «حالتِ کامل» دست‌نخورده می‌مانند؛ این یک راهِ دوم است، نه جایگزین.
   قاعدهٔ ذخیره (همان قاعدهٔ دوره): دیدنِ یک گام هیچ چیزی نمی‌نویسد؛ کاربرگ فقط با اولین ورودیِ واقعی ساخته می‌شود؛
   جای تو در سفر روی خودِ رکوردِ موضوع است — t.journey = { step, done: { S1: "YYYY-MM-DD", … }, started } — و فقط وقتی
   واقعاً عوض شد (گامِ بعد، پرش روی نوار، گذر) با یک نوشتن ذخیره می‌شود. */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, C = A.C, TM = A.TM, PM = A.PM;
  var PL = C.PIPELINE;
  var KIDX = {}; PL.forEach(function (s, i) { KIDX[s.k] = i; });

  /* «یک کارِ همین حالا» برای هر گام — از دادهٔ خودِ گام برداشته شده:
     گام‌هایی که how شان یک روال را نام می‌برد (۵ خط دلتا، بیان دیگر، برگه سفید، قرائت روز) همان روال؛ بقیه اولین تکنیکِ هستهٔ گام.
     «بیان دیگر» (P11) یک کاربرگِ بلند است که چهار گام از آن استفاده می‌کنند؛ هر گام فقط بخشِ خودش را (بینِ دو کلیدِ info) نشان
     می‌دهد، رویِ همان یک رکورد. اگر دادهٔ گام عوض شود و انتخاب دیگر در core/refs نباشد، خودکار به اولین تکنیکِ هسته برمی‌گردد. */
  var JOB = {
    S1: { kind: true, tech: 33 },
    S2: { tech: 37 },
    S3: { proto: "P1" },
    S4: { proto: "P11", to: "i3", part: "میوه، تلاشِ خام و فرود تا ریشه" },
    S5: { tech: 4, plant: true },
    S6: { tech: 13 },
    S7: { proto: "P11", from: "i5", part: "شاخه‌های دیگر، بذر و پیوند" },
    S8: { proto: "P11", from: "i4", to: "i5", part: "بازسازی رو به بالا، نام‌گذاری و مقایسه" },
    S9: { tech: 21 },
    S10: { proto: "P3", sched: true },
    S11: { proto: "P2" }
  };
  function job(s) {
    var j = JOB[s.k] || {};
    if (j.tech && (s.core.indexOf(j.tech) < 0 || !TM[j.tech])) j = { kind: j.kind, tech: s.core[0] };
    if (j.proto && (s.refs.indexOf(j.proto) < 0 || !PM[j.proto] || !(PM[j.proto].ws || []).length)) j = { kind: j.kind, tech: s.core[0] };
    return j;
  }
  A._journeyJob = function (k) { var i = KIDX[k]; return i == null ? null : job(PL[i]); };
  function fieldsOf(j) {
    if (j.tech) return TM[j.tech].ws || [];
    var ws = PM[j.proto].ws || [], keys = ws.map(function (f) { return f.k; });
    var a = j.from ? keys.indexOf(j.from) : 0, b = j.to ? keys.indexOf(j.to) : ws.length;
    if (a < 0) a = 0; if (b < 0) b = ws.length;
    return ws.slice(a, b);
  }

  /* ---------- رکوردها (تا اولین ورودی فقط در حافظه) ---------- */
  function newest(a, b) { return String(b.updated || b.created || "") < String(a.updated || a.created || "") ? -1 : 1; }
  function exHandle(t, tid) {
    var all = S.all("ex", function (e) { return e.topic === t.id && e.tid === tid && !e.sample; }).sort(newest);
    var ex = all.filter(function (e) { return e.status !== "done"; })[0] || all[0] || null, live = !!ex;
    if (!ex) ex = { id: A.uid("ex"), type: "ex", tid: tid, topic: t.id, status: "draft", data: {}, rubric: [] };
    ex.data = ex.data || {};
    return { rec: ex, live: function () { return live; }, put: function () { live = true; S.put(ex); } };
  }
  function prHandle(t, pid) {
    /* «بیان دیگر»: همان اولین اجرایی که صفحهٔ موضوع (A.pipelineStatus) می‌شناسد؛ روال‌های تکراری: آخرین پیش‌نویس، وگرنه آخرین اجرا */
    var all = S.all("pr", function (r) { return r.pid === pid && r.topic === t.id && !r.sample; });
    var r = pid === "P11" ? all[0] : (all.filter(function (x) { return x.status !== "done"; }).sort(newest)[0] || all.sort(newest)[0]);
    var live = !!r;
    if (!r) r = { id: A.uid("pr"), type: "pr", pid: pid, topic: t.id, sched: "", node: "", status: "draft", data: A.protoPreset ? A.protoPreset(pid, t) : {} };
    r.data = r.data || {};
    return { rec: r, live: function () { return live; }, put: function () { live = true; S.put(r); } };
  }
  function handle(t, j) { return j.tech ? exHandle(t, j.tech) : prHandle(t, j.proto); }

  /* ---------- وضعیت ---------- */
  function jst(t) { var j = t.journey || {}; return { step: j.step || "", done: j.done || {}, started: j.started || "" }; }
  function writeJ(t, j) { if (!j.started) j.started = A.today(); t.journey = j; S.put(t); }
  function firstOpen(t, j) {
    var ps = A.pipelineStatus(t);
    for (var i = 0; i < PL.length; i++) if (!j.done[PL[i].k] && !ps[PL[i].k]) return PL[i].k;
    return "end";
  }
  function nDone(t, j) { var ps = A.pipelineStatus(t); return PL.filter(function (s) { return j.done[s.k] || ps[s.k]; }).length; }

  /* ---------- دکمه‌ها برای صفحهٔ موضوع و فهرستِ موضوع‌ها ---------- */
  A.journeyButton = function (t, small) {
    var j = jst(t), at = j.step && KIDX[j.step] != null ? KIDX[j.step] : -1;
    var label = j.step === "end" ? "🧭 سفرِ گام‌به‌گام (تمام‌شده — مرور)" : at >= 0 ? "🧭 ادامهٔ سفرِ گام‌به‌گام · گامِ " + fa(at + 1) + " از " + fa(PL.length) : "🧭 سفرِ گام‌به‌گام روی این موضوع";
    var b = h("button", { class: small ? "btn sm ghost jr-tbtn" : "btn lg jr-go", onclick: function () { A.go("journey", t.id); } }, label);
    if (small) return b;
    return h("section", { class: "card jr-cta", dir: "rtl" }, h("div", { class: "row between wrap gap" },
      h("div", { class: "jr-ctat" }, h("b", {}, "نمی‌دانی از کجا شروع کنی؟"), h("div", { class: "small muted" }, "این صفحه مرجع است و همه‌چیز را یک‌جا نشان می‌دهد. سفرِ گام‌به‌گام همان مسیرِ " + fa(PL.length) + " گامی را یکی‌یکی جلو می‌برد: هر بار فقط یک کار، همین‌جا، و هر جا ماندی از همان‌جا ادامه می‌دهی.")),
      b));
  };

  /* ---------- نوارِ ۱۱ گام ---------- */
  function strip(t, j, cur) {
    var ps = A.pipelineStatus(t);
    return h("ol", { class: "jr-strip", "aria-label": "مسیرِ " + fa(PL.length) + " گامی" }, PL.map(function (s, i) {
      var mine = !!j.done[s.k], other = !mine && !!ps[s.k], here = s.k === cur;
      return h("li", { class: "jr-st" + (mine ? " done" : "") + (other ? " other" : "") + (here ? " here" : ""), style: { "--pc": "var(--p" + s.ph + ")" } },
        h("button", { class: "jr-stb", "aria-current": here ? "step" : null, title: "گامِ " + fa(i + 1) + ": " + s.fa + (mine ? " (تمام‌شده)" : other ? " (پیش‌تر از راهِ دیگری انجام شده)" : ""), onclick: function () {
          if (s.k === cur) return;
          if (j.started && j.step !== s.k) { j.step = s.k; writeJ(t, j); }
          A.go("journey", t.id, s.k);
        } }, here ? "📍" : mine ? "✓" : fa(i + 1)),
        h("span", { class: "jr-stl" }, s.fa));
    }));
  }

  /* ---------- نما ---------- */
  A.V.journey = function (id, sub) {
    var t = S.get(id);
    if (!t || t.type !== "topic") return A.empty("این موضوع پیدا نشد.", h("button", { class: "btn", onclick: function () { A.go("topics"); } }, "موضوع‌ها"));
    var j = jst(t);
    var cur = sub && (KIDX[sub] != null || sub === "end") ? sub : (j.step && (KIDX[j.step] != null || j.step === "end") ? j.step : firstOpen(t, j));
    var root = h("div", { class: "page jr", dir: "rtl" });
    var nd = nDone(t, j);
    root.appendChild(h("div", { class: "crs-top" },
      h("div", { class: "crs-bar" }, h("i", { style: { width: Math.round(100 * nd / PL.length) + "%" } })),
      h("div", { class: "row between wrap gap small" },
        h("span", {}, fa(nd) + " از " + fa(PL.length) + " گام انجام شده"),
        h("button", { class: "btn ghost sm jr-back", onclick: function () { A.go("topic", t.id); } }, "← صفحهٔ موضوع (مرجعِ کامل)"))));
    root.appendChild(strip(t, j, cur));
    if (cur === "end") return endView(root, t, j);
    var i = KIDX[cur], s = PL[i], jb = job(s), ph = C.PHASES[s.ph];
    root.appendChild(A.head("سفرِ گام‌به‌گام · " + t.title, "📍 گامِ " + fa(i + 1) + " از " + fa(PL.length) + ": " + s.fa, null));
    /* این گام برای چیست — فقط از دادهٔ خودِ گام */
    root.appendChild(h("section", { class: "card jr-why" }, h("div", { class: "row gap wrap" }, h("h2", {}, "این گام برای چیست"), A.phaseChip(s.ph)),
      h("p", {}, s.how), h("p", { class: "small muted" }, "هدفِ فازِ «" + ph.fa + "»: " + ph.goal)));
    var ps = A.pipelineStatus(t);
    if (ps[cur] && !j.done[cur]) root.appendChild(h("section", { class: "card soft jr-other" },
      h("p", {}, h("b", {}, "این گام را پیش‌تر از راهِ دیگری انجام داده‌ای"), " (صفحهٔ موضوع آن را تیک خورده می‌بیند). می‌توانی کارِ پایین را هم انجام بدهی، یا همین‌جا بگذری."),
      h("button", { class: "btn sm jr-skip", onclick: function () { j.done[cur] = A.today(); j.step = next(cur); writeJ(t, j); A.go("journey", t.id, j.step); } }, "گذر — این گام انجام‌شده حساب شود ←")));
    /* کارِ همین حالا */
    var flds = fieldsOf(jb), hd = handle(t, jb), rec = hd.rec;
    /* نوشتنِ تأخیری که «گامِ بعد» می‌تواند لغوش کند، تا پایانِ گام فقط یک نوشتن روی کاربرگ باشد */
    var pend = null;
    function savef() { if (pend) clearTimeout(pend); pend = setTimeout(function () { pend = null; hd.put(); }, 400); }
    hd.cancel = function () { var was = !!pend; if (pend) { clearTimeout(pend); pend = null; } return was; };
    var est = A.wsMinutes ? A.wsMinutes(flds) : null;
    var title = jb.tech ? "کاربرگِ «" + TM[jb.tech].fa + "» روی همین موضوع" : "کاربرگِ روالِ «" + PM[jb.proto].fa + "»" + (jb.part ? " — بخشِ " + jb.part : "");
    var now = h("section", { class: "card jr-now" }, h("div", { class: "eyebrow" }, "کارِ همین حالا · فقط همین"), h("h2", {}, title),
      h("p", { class: "small muted" }, "فیلدهای ستاره‌دار لازم‌اند تا «گامِ بعد» باز شود؛ هر چه بنویسی خودکار ذخیره می‌شود و همین کاربرگ در صفحهٔ " + (jb.tech ? "تکنیک" : "پروتکل") + " و صفحهٔ موضوع هم دیده می‌شود." + (est ? " زمانِ تقریبی: " + A.minutesText(est) + "." : "")),
      jb.tech ? h("div", { class: "row gap wrap" }, h("span", { class: "small" }, "این تکنیک چیست؟ "), A.peekChip(jb.tech)) : h("div", { class: "row gap wrap" }, h("span", { class: "small" }, "این روال چیست؟ "), h("button", { class: "tlink proto", onclick: function () { A.peekProto(jb.proto); } }, PM[jb.proto].fa)),
      jb.tech && TM[jb.tech].example ? h("details", {}, h("summary", { class: "small" }, "نمی‌دانی چه بنویسی؟ نمونه را ببین"), h("p", { class: "small" }, h("b", {}, TM[jb.tech].example.title + ": "), TM[jb.tech].example.text)) : null);
    var kindSel = null;
    if (jb.kind) {
      kindSel = h("select", { id: "jrKind", onchange: function (e) { t.kind = e.target.value; S.put(t); kindBox.classList.toggle("missing", !t.kind); } },
        h("option", { value: "" }, "— انتخاب کن —"), A.FTYPES.map(function (f) { return h("option", { value: f, selected: t.kind === f }, f.split(":")[0]); }));
      var kindBox = h("div", { class: "fld req jr-kind", "data-k": "kind" }, h("label", { class: "flabel", for: "jrKind" }, "این موضوع برای تو چیست؟", h("span", { class: "reqmark", title: "الزامی" }, " *")), kindSel,
        h("div", { class: "fhint" }, "میوه: دستاوردی که فلسفه‌اش را نمی‌فهمی · گره شخصی: برای علم حل‌شده، برای تو نه · گره مرزی: برای خودِ علم هم حل‌نشده"));
      now.appendChild(kindBox);
    }
    var ws = A.renderWS(flds, rec.data, function () { savef(); }, { prefix: "jr" });
    now.appendChild(h("div", { class: "wsform" }, ws));
    root.appendChild(now);
    /* کارهای جانبیِ همین گام */
    var extra = h("div", { class: "row gap wrap" });
    if (jb.plant) {
      var p11 = S.all("pr", function (r) { return r.pid === "P11" && r.topic === t.id; })[0];
      if (p11 && A.plantP11) extra.appendChild(h("button", { class: "btn ghost sm", onclick: function () { A.plantP11(p11); } }, p11.data.__planted ? "🌱 کاشتِ دوباره در مزرعه" : "🌱 کاشتِ زنجیرهٔ فرود در مزرعه"));
    }
    if (jb.sched) {
      var sc = S.all("sched", function (x) { return x.topic === t.id; });
      extra.appendChild(sc.length ? h("span", { class: "small muted" }, "چرخهٔ ۱-۳-۷ زمان‌بندی شده: " + sc.map(function (x) { return x.label + " · " + A.fdate(x.due) + (x.done ? " ✓" : ""); }).join("، "))
        : h("button", { class: "btn ghost sm jr-sched", onclick: function (e) { A.start137(t.id, t.title); e.target.replaceWith(h("span", { class: "small good" }, "زمان‌بندی شد؛ روز ۱، ۳ و ۷ در «امروز» ظاهر می‌شود.")); } }, "زمان‌بندیِ روز ۱، ۳ و ۷"));
    }
    var others = s.core.filter(function (x) { return x !== jb.tech; }), orefs = s.refs.filter(function (x) { return x !== jb.proto; });
    if (others.length || orefs.length || extra.children.length) root.appendChild(h("details", { class: "card jr-more" }, h("summary", {}, "ابزارهای دیگرِ این گام (اختیاری)"),
      extra.children.length ? extra : null,
      others.length ? h("div", { class: "row gap wrap mt" }, h("span", { class: "small muted" }, "تکنیک‌ها (نگاهِ کوتاه، همین‌جا):"), others.map(A.peekChip)) : null,
      orefs.length ? h("div", { class: "row gap wrap mt" }, h("span", { class: "small muted" }, "روال‌ها و صفحه‌ها:"), orefs.map(function (r) { return PM[r] ? h("button", { class: "tlink proto", onclick: function () { A.peekProto(r); } }, PM[r].fa) : A.refChip(r); })) : null,
      h("p", { class: "small muted" }, "این‌ها برای عمیق‌تر شدن‌اند؛ برای رفتن به گامِ بعد لازم نیستند.")));
    /* ناوبری */
    function validate() {
      var miss = ws._validate();
      if (jb.kind && !t.kind) { miss.unshift("نوعِ موضوع"); if (kindBox) kindBox.classList.add("missing"); }
      return miss;
    }
    root.appendChild(h("div", { class: "row between gap crs-nav jr-nav" },
      i > 0 ? h("button", { class: "btn ghost", onclick: function () { var pk = PL[i - 1].k; if (j.started && j.step !== pk) { j.step = pk; writeJ(t, j); } A.go("journey", t.id, pk); } }, "→ گامِ قبل") : h("span"),
      h("button", { class: "btn jr-next", onclick: function () {
        var miss = validate();
        if (miss.length) { A.toast("این‌ها هنوز خالی‌اند: " + miss.slice(0, 3).join("، ") + (miss.length > 3 ? "…" : ""), "bad"); var f = root.querySelector(".missing"); if (f && f.scrollIntoView) f.scrollIntoView({ block: "center" }); return; }
        finishUnit(jb, hd);
        j.done[cur] = A.today(); j.step = next(cur); writeJ(t, j);
        A.toast("گامِ " + fa(i + 1) + " تمام شد.");
        A.go("journey", t.id, j.step);
      } }, i === PL.length - 1 ? "✓ گامِ آخر تمام شد" : "✓ این گام تمام شد — گامِ بعد ←")));
    return root;
  };
  function next(k) { var i = KIDX[k]; return i < PL.length - 1 ? PL[i + 1].k : "end"; }
  /* کاربرگِ کامل‌شده همان‌طور ثبت می‌شود که در صفحهٔ تکنیک/پروتکل (وضعیتِ done + قلاب‌های مزرعه) — یک بار */
  function finishUnit(jb, hd) {
    var r = hd.rec, dirty = hd.cancel();
    if (r.status === "done") { if (dirty) hd.put(); return; }
    if (jb.tech) { r.status = "done"; hd.put(); try { A.onExDone(r); } catch (e) { console.error(e); } return; }
    var full = A.renderWS(PM[jb.proto].ws, r.data, function () {}, { prefix: "jrchk" })._validate();
    if (full.length) { if (dirty || !hd.live()) hd.put(); return; } // «بیان دیگر» هنوز بخش‌های گام‌های دیگر را لازم دارد
    r.status = "done"; hd.put(); try { A.onProtoDone(r); } catch (e) { console.error(e); }
    if (r.sched) { var sc = S.get(r.sched); if (sc && !sc.done) { sc.done = true; S.put(sc); } }
  }
  function endView(root, t, j) {
    root.appendChild(A.head("سفرِ گام‌به‌گام · " + t.title, "سفر روی این موضوع تمام شد", "هر " + fa(PL.length) + " گام را پشتِ سر گذاشته‌ای. از این‌جا به بعد کارِ روال‌هاست: چرخهٔ ۱-۳-۷ و قرائتِ روز خودشان در «امروز» ظاهر می‌شوند."));
    root.appendChild(h("div", { class: "row gap wrap" },
      h("button", { class: "btn", onclick: function () { A.go("topic", t.id); } }, "صفحهٔ موضوع"),
      h("button", { class: "btn ghost", onclick: function () { A.go("journey", t.id, PL[0].k); } }, "مرورِ گام‌ها از اول")));
    return root;
  }
})(APP);
