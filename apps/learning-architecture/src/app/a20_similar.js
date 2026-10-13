/* ===== «مسئله‌های هم‌ساختار» — از مسئلهٔ خودِ مالک، مسئله‌های تازه با همان ساختار (a20_similar.js) =====
   خواستهٔ مالک (۲۰۲۶-۱۰-۱۳): «حل‌کنندهٔ آن مسئله و **موارد مشابهش** بشوم» ⇒ شبیه‌سازِ خودِ مسئله بس نیست؛ سیستم باید از روی همان
   مسئله (چه «مسئلهٔ بزرگ» ِ واردشده، چه «شبیه‌سازِ همین مسئله» ِ گره‌گشا) مسئله‌های تازه بسازد که با **همان حرکت‌های قاطعِ حل** حل
   می‌شوند ولی ظاهر، زمینه و رشته‌شان فرق دارد — به‌اضافهٔ «بدلی»: ظاهرِ شبیه ولی آن حرکت این‌جا کار نمی‌کند.
   • سازنده: هوش مصنوعی (کارِ learning_architecture)، پس از دروازهٔ اعلام و حذفِ نام (A.knotAIGate).
   • وارسی (خواستهٔ صریحِ مالک: «وگرنه ممکن است با جوابِ غلط تمرین کنم»): همان سه حلِ مستقلِ گره‌گشا (A.kverify) روی **هر** نمونه؛
     فقط اگر هر سه با پاسخِ سازنده یکی باشند، هیچ‌کدام دو پاسخ نبینند و داوریِ «همان ساختار هست/نیست» با بدلی‌بودن بخواند، «وارسی‌شده»
     است. وگرنه «وارسی‌نشده» و به‌طورِ پیش‌فرض پنهان (همان گزینهٔ «وارسی‌نشده‌ها را هم نشان بده» ِ گره‌گشا). نشتِ پاسخ در صورت و
     «تقریباً همان مسئلهٔ اصلی» اصلاً ذخیره نمی‌شوند.
   • تمرین: یکی‌یکی، اطمینان پیش از پاسخ، بعد پاسخِ درست + «ساختار کجا بود» + «تله کجا بود»؛ فاصله‌های ۱/۳/۷/۲۱/۶۰ روز (همان نردبانِ
     گره‌گشا)؛ موعدها در «امروز». هوش مصنوعی داور نیست: پاسخِ هر نمونه را سه حلِ مستقل پیش از رسیدن به تو سنجیده‌اند.
   رکورد: {id, type:"pbitem", pid, form, prompt, atype:"int"|"choice", choices?, answer, deep, trap, explain, moves[], level, decoy,
           gen:{by:"ai", at}, ver, bad, due, iv, hist[]} */
(function (A) {
  if (!A.S || !A.V) return;
  var h = A.h, fa = A.fa, S = A.S;
  var FORMS = { numeric: "عددی", visual: "تصویری/فضایی", verbal: "کلامی", real: "موقعیتِ واقعیِ زندگی/کار", abstract: "انتزاعی/نمادین" };
  function nowISO() { return new Date().toISOString(); }
  function lat(s) { return String(s == null ? "" : s).replace(/[۰-۹]/g, function (d) { return String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)); }).replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x660); }); }
  function intOf(v) { var s = lat(v).replace(/[\s,٬]/g, "").replace(/[−–]/g, "-"); return /^-?\d+$/.test(s) ? parseInt(s, 10) : null; }

  A.pbItemsOf = function (pid) { return S.all("pbitem", function (r) { return r.pid === pid; }).sort(function (a, b) { return String(a.created || a.gen && a.gen.at || "").localeCompare(String(b.created || b.gen && b.gen.at || "")); }); };
  function showUnverified() { return !!(A.kset && A.kset().showUnverified); }
  A.pbServable = function (it) {
    if (!it || it.bad) return false;
    if (!(it.ver && it.ver.ok)) return showUnverified();
    return true;
  };
  A.pbDue = function () {
    var t = A.today(), ok = {};
    (A.probs ? A.probs() : []).forEach(function (p) { ok[p.id] = 1; });
    return S.all("pbitem", function (it) { return ok[it.pid] && A.pbServable(it) && (it.due || t) <= t; }).sort(function (a, b) { return String(a.due || "").localeCompare(String(b.due || "")); });
  };

  /* ---------- درخواست به سازنده ---------- */
  A.PB_SIM_SYS = "تو طراحِ «مسئله‌های هم‌ساختار» هستی. کاربر یک مسئلهٔ حل‌شده (با پاسخ و حرکت‌های قاطعِ حلش) داده و می‌خواهد حل‌کنندهٔ آن و مسئله‌های مشابهش بشود — نه اینکه راه‌حلِ همان را حفظ کند. قواعدِ سخت:\n" +
    "۱) خروجی فقط یک شیء JSON به شکلِ {\"items\":[…]}؛ هیچ متنی بیرون از JSON.\n" +
    "۲) هر قلم: {\"form\":\"numeric|visual|verbal|real|abstract\",\"decoy\":false,\"level\":1,\"prompt\":\"…\",\"atype\":\"int|choice\",\"choices\":[{\"id\":\"a\",\"t\":\"…\"}],\"answer\":\"…\",\"moves\":[\"mv_…\"],\"deep\":\"…\",\"trap\":\"…\",\"explain\":\"…\",\"hints\":[]}.\n" +
    "۳) هر مسئلهٔ غیرِ بدلی باید با **همان حرکت‌های قاطعِ** مسئلهٔ اصلی حل شود (moves = شناسهٔ همان حرکت‌ها از فهرستِ داده‌شده)، ولی ظاهر، زمینه و ترجیحاً رشته‌اش کاملاً تازه باشد؛ نسخهٔ کمی‌تغییریافتهٔ خودِ مسئلهٔ اصلی نساز و از مسئله‌های معروفِ کتاب‌ها به‌جای آن استفاده نکن.\n" +
    "۴) بدلی (decoy=true): ظاهرش شبیهِ مسئلهٔ اصلی است ولی آن حرکت‌ها این‌جا کار نمی‌کند یا لازم نیست؛ پاسخِ درستِ خودش را دارد و explain می‌گوید چرا آن حرکت این‌جا نیست.\n" +
    "۵) پاسخ فقط atype=int (answer یک عددِ صحیح با رقمِ لاتین) یا atype=choice (۳ تا ۵ گزینه با شناسه‌های a تا e؛ answer = شناسهٔ تنها گزینهٔ درست). هر قلم دقیقاً یک پاسخِ قابلِ‌دفاع داشته باشد؛ پاسخ یا متنِ گزینهٔ درست در prompt و hints نیاید.\n" +
    "۶) deep = ساختارِ مشترک با مسئلهٔ اصلی کجاست؛ trap = اشتباهِ وسوسه‌انگیز کجاست؛ explain = حلِ کوتاه. level از ۱ (آسان) تا ۳ (سخت)، متنوع.\n" +
    "۷) فارسیِ روشن با نیم‌فاصلهٔ درست؛ نامِ آدمِ واقعی نیاور؛ هیچ ادعای ساختگیِ تاریخی.";
  function movesOf(p) {
    var seen = {}, out = [];
    (p.stages || []).forEach(function (s) {
      var ms = A.stageMoves ? A.stageMoves(p, s) : (Array.isArray(s.mv) ? s.mv : []);
      ms.forEach(function (m) { if (!seen[m]) { seen[m] = 1; out.push(m); } });
    });
    return out;
  }
  A.pbMovesOf = movesOf;
  function principle(p) {
    var ms = movesOf(p).map(function (m) { return (A.MOVES && A.MOVES[m] ? A.MOVES[m].fa : m) + " (" + m + ")"; });
    var key = (p.stages || []).filter(function (s) { return s && (s.move || s.idea); }).slice(0, 8).map(function (s) { return "- " + (s.move || "") + (s.idea ? " — " + s.idea : ""); });
    return "حرکت‌های قاطعِ حل: " + (ms.length ? ms.join("، ") : "—") + (key.length ? "\nگام‌های کلیدی:\n" + key.join("\n") : "");
  }
  A.pbPrinciple = principle;
  A.pbAsk = function (p, n) {
    n = n || 4;
    var mvList = A.MOVES ? Object.keys(A.MOVES).map(function (m) { return m + " (" + A.MOVES[m].fa + ")"; }).join("، ") : "";
    return "مسئلهٔ اصلی: " + p.title + "\nرشته: " + (p.field || "") + "\nصورت: " + p.statement + "\nپاسخ: " + p.answer + "\n" + principle(p) +
      ((p.lessons || []).length ? "\nدرس‌ها: " + p.lessons.slice(0, 4).join("؛ ") : "") +
      "\n\nفهرستِ شناسه‌های حرکت: " + mvList +
      "\n\nخواسته: " + fa(n) + " مسئلهٔ تازهٔ هم‌ساختار در شکل‌های متفاوت (" + Object.keys(FORMS).map(function (f) { return f + "=" + FORMS[f]; }).join("، ") + ") + یک بدلی (decoy=true). سطحِ دشواری را از ۱ تا ۳ متنوع کن.";
  };
  function validItem(o) {
    if (!o || typeof o !== "object") return "شیء نیست";
    if (!o.prompt || typeof o.prompt !== "string") return "صورت ندارد";
    if (o.atype !== "int" && o.atype !== "choice") return "نوعِ پاسخِ نامجاز (" + o.atype + ")";
    if (o.atype === "int" && intOf(o.answer) == null) return "پاسخِ عددی صحیح نیست";
    if (o.atype === "choice") {
      if (!Array.isArray(o.choices) || o.choices.length < 2 || o.choices.length > 6) return "گزینه‌ها نامعتبرند";
      var ids = {}; for (var i = 0; i < o.choices.length; i++) { var c = o.choices[i]; if (!c || !c.id || !c.t || ids[c.id]) return "شناسهٔ گزینه تکراری یا خالی"; ids[c.id] = 1; }
      if (!ids[String(o.answer)]) return "پاسخ میانِ گزینه‌ها نیست";
    }
    return null;
  }
  A.pbValidItem = validItem;
  /* ساخت ⇒ ساختار ⇒ «همان مسئلهٔ اصلی؟» ⇒ نشت ⇒ سه حلِ مستقل ⇒ ذخیره (وارسی‌شده یا «وارسی‌نشده») */
  A.pbMake = function (p, opts) {
    opts = opts || {};
    var n = opts.n || 4, names = opts.names || [];
    var strip = names.length && A.kstripNames ? function (x) { return A.kstripNames(x, names); } : function (x) { return x; };
    var ask = opts.text || strip(A.pbAsk(p, n)), rep = { accepted: [], unverified: [], rejected: [] };
    var pk = { id: "pb:" + p.id, name: p.title, principle: principle(p) };
    return A.callAIJson(A.PB_SIM_SYS, ask, { maxTokens: 8192 }, function (t) { try { return A.parseJSONLoose(t); } catch (e) { throw new Error("پاسخِ سازنده JSON ِ معتبر نبود"); } }).then(function (o) {
      var arr = Array.isArray(o) ? o : (o && o.items) || [];
      if (!arr.length) throw new Error("سازنده مسئله‌ای نداد");
      var chain = Promise.resolve(), at = nowISO();
      arr.slice(0, n + 2).forEach(function (raw) {
        chain = chain.then(function () {
          var bad = validItem(raw); if (bad) { rep.rejected.push({ prompt: raw && raw.prompt, why: "ساختار: " + bad }); return; }
          if (A.kNearCopy && A.kNearCopy(raw.prompt, p.statement)) { rep.rejected.push({ prompt: raw.prompt, why: "تقریباً همان مسئلهٔ اصلی است، نه مسئله‌ای تازه" }); return; }
          var it = { id: A.uid("pbitem"), type: "pbitem", pid: p.id, form: FORMS[raw.form] ? raw.form : "verbal", prompt: String(raw.prompt), atype: raw.atype,
            choices: raw.atype === "choice" ? raw.choices.map(function (c) { return { id: String(c.id), t: String(c.t) }; }) : null, answer: String(raw.answer).trim(),
            moves: (Array.isArray(raw.moves) ? raw.moves : []).filter(function (m) { return A.MOVES && A.MOVES[m]; }).slice(0, 3),
            deep: String(raw.deep || ""), trap: String(raw.trap || ""), explain: String(raw.explain || ""), hints: Array.isArray(raw.hints) ? raw.hints.map(String).slice(0, 3) : [],
            level: Math.max(1, Math.min(3, +raw.level || 1)), decoy: !!raw.decoy, gen: { by: "ai", at: at, names: !!names.length }, ver: null, bad: false, due: A.today(), iv: 0, hist: [], created: at };
          var leak = A.kleak ? A.kleak(it) : null;
          if (leak) { rep.rejected.push({ prompt: it.prompt, why: "نشتِ پاسخ: " + leak }); return; }
          return A.kverify(pk, it, strip).then(function (ver) { it.ver = ver; S.put(it); (ver.ok ? rep.accepted : rep.unverified).push(it); });
        });
      });
      return chain.then(function () { return rep; });
    });
  };

  /* ---------- ثبتِ پاسخ ---------- */
  A.pbRecord = function (it, res) {
    var d = A.today();
    (it.hist = it.hist || []).push({ at: nowISO(), d: d, conf: res.conf, ok: res.ok, ans: res.ans });
    if (it.hist.length > 50) it.hist = it.hist.slice(-50);
    it.iv = A.knextIv ? A.knextIv(it.iv, res.ok) : (res.ok ? Math.max(1, (it.iv || 0) * 2 || 1) : 1);
    it.due = A.addDays(d, it.iv);
    S.put(it);
  };
  A.pbCheck = function (it, ans) {
    if (it.atype === "int") { var a = intOf(ans); return a != null && a === intOf(it.answer); }
    return String(ans) === String(it.answer);
  };

  /* ---------- نما: زبانهٔ «مسئله‌های هم‌ساختار» ِ هر مسئله ---------- */
  var SESS = {};
  function provChip(it) {
    if (it.ver && it.ver.ok) return h("span", { class: "chip good", title: "سه حلِ مستقل با پاسخِ سازنده یکی بودند" }, "وارسی‌شده ۳ از ۳");
    return h("span", { class: "chip bad", title: (it.ver && it.ver.why) || "" }, "وارسی‌نشده" + (it.ver && it.ver.why ? " — " + it.ver.why : ""));
  }
  function mvChips(it) { return (it.moves || []).length && A.moveLink ? h("div", { class: "row gap wrap" }, it.moves.map(function (m) { return A.moveLink(m); })) : null; }
  A.pbSimilarPanel = function (p) {
    var box = h("div", { class: "col gap pbs", dir: "rtl" });
    var items = A.pbItemsOf(p.id), serv = items.filter(A.pbServable), hidden = items.filter(function (x) { return !x.bad && !A.pbServable(x); }).length;
    var due = serv.filter(function (x) { return (x.due || A.today()) <= A.today(); });
    box.appendChild(h("section", { class: "card" }, h("h2", {}, "مسئله‌های هم‌ساختار — حل‌کنندهٔ «موارد مشابه» شدن"),
      h("p", { class: "small" }, "مسئله‌های تازه‌ای که با همان حرکت‌های قاطعِ این مسئله حل می‌شوند، در ظاهر و زمینهٔ دیگر (و یک «بدلی» که ظاهرش شبیه است ولی آن حرکت در آن کار نمی‌کند). هدف بازشناختنِ ساختار در لباسِ تازه است، نه حفظِ راه‌حلِ همین مسئله."),
      h("p", { class: "small muted" }, "حرکت‌های قاطعِ این مسئله: ", movesOf(p).length && A.moveLink ? movesOf(p).map(function (m) { return h("span", {}, A.moveLink(m), " "); }) : "هنوز هیچ گامی برچسبِ حرکت ندارد — سازنده از خودِ گام‌ها ساختار را می‌گیرد."),
      h("p", { class: "small" }, fa(serv.length) + " مسئلهٔ آمادهٔ تمرین · " + fa(due.length) + " موعدِ امروز" + (hidden ? " · " + fa(hidden) + " وارسی‌نشده (پنهان)" : ""))));

    /* ساخت */
    var gen = h("section", { class: "card" }, h("h3", {}, "ساختنِ مسئله‌های تازه با هوش مصنوعی (سه حلِ مستقل)"),
      h("p", { class: "small" }, "هر مسئلهٔ ساخته‌شده سه بار، با سه دستورِ متفاوت و بی دیدنِ پاسخ، حل می‌شود. فقط اگر هر سه با پاسخِ سازنده یکی باشند و هیچ‌کدام دو پاسخ نبینند «وارسی‌شده» است؛ وگرنه «وارسی‌نشده» و پنهان می‌ماند تا با جوابِ غلط تمرین نکنی. مسئله‌ای که پاسخش در صورت پیداست یا تقریباً همان مسئلهٔ اصلی است، کنار می‌رود."));
    var out = h("div", { "aria-live": "polite", class: "small" });
    if (!A.kaiAvailable || !A.kaiAvailable()) gen.appendChild(h("p", { class: "small muted" }, "هوش مصنوعی در دسترس نیست (کلید یا میزبان)."));
    else {
      var b = h("button", { class: "btn pbs-make", type: "button", onclick: function () {
        function run(text, names) {
          b.disabled = true; b.textContent = "در حالِ ساخت و سه حلِ مستقل…";
          A.pbMake(p, { n: 4, names: names, text: text }).then(function (rep) {
            A._pbLastRep = rep;
            A.toast("وارسی‌شده: " + fa(rep.accepted.length) + " · وارسی‌نشده: " + fa(rep.unverified.length) + " · کنار گذاشته: " + fa(rep.rejected.length));
            A.render();
          }, function (er) { b.disabled = false; b.textContent = "ساختِ ۴ مسئلهٔ هم‌ساختار + ۱ بدلی"; A.toast((er && er.message) || String(er), "bad"); });
        }
        if (A.knotAIGate) A.knotAIGate({ purpose: "ساختنِ مسئله‌های هم‌ساختار", noPriv: true, more: "پس از ساخت، هر مسئله سه بار جداگانه و بی پاسخ برای حل فرستاده می‌شود (ساختار و حرکت‌های مسئلهٔ اصلی + متنِ همان مسئله، با همین حذفِ نام).",
          build: function () { return A.pbAsk(p, 4); }, onSend: function (t, m) { run(t, (m && m.names) || []); } });
        else run(null, []);
      } }, "ساختِ ۴ مسئلهٔ هم‌ساختار + ۱ بدلی");
      gen.appendChild(b);
    }
    if (A._pbLastRep && A._pbLastRep.rejected.length) out.appendChild(h("details", {}, h("summary", {}, "کنار گذاشته‌شده‌های آخرین ساخت (" + fa(A._pbLastRep.rejected.length) + ")"),
      h("ul", {}, A._pbLastRep.rejected.map(function (x) { return h("li", {}, x.why + (x.prompt ? " — «" + String(x.prompt).slice(0, 80) + "…»" : "")); }))));
    gen.appendChild(out);
    box.appendChild(gen);

    /* تمرین */
    box.appendChild(session(p, serv, due));

    /* فهرست */
    if (items.length) box.appendChild(h("details", { class: "card soft" }, h("summary", {}, "همهٔ مسئله‌های ساخته‌شده (" + fa(items.length) + ")"),
      h("ul", { class: "small plain col gap" }, items.map(function (it) {
        var last = (it.hist || []).slice(-1)[0];
        return h("li", { class: "pbs-li" + (it.bad ? " muted" : "") }, h("div", { class: "row gap wrap" }, provChip(it), it.decoy ? h("span", { class: "chip" }, "بدلی") : null, h("span", { class: "chip" }, FORMS[it.form] || it.form), h("span", { class: "muted" }, "سطحِ " + fa(it.level) + (last ? " · آخرین: " + (last.ok ? "درست" : "نادرست") : "") + " · موعد " + (it.due ? A.fdate ? A.fdate(it.due) : it.due : "—"))),
          h("div", {}, String(it.prompt).slice(0, 160) + (String(it.prompt).length > 160 ? "…" : "")),
          it.bad ? h("span", { class: "muted" }, "معیوب — بیرون از تمرین") : h("button", { class: "btn ghost sm pbs-bad", type: "button", onclick: function () { it.bad = true; S.put(it); A.render(); } }, "این مسئله معیوب است"));
      }))));
    return box;
  };

  function session(p, serv, due) {
    var sec = h("section", { class: "card pbs-run", "aria-live": "polite" }, h("h3", {}, "تمرین"));
    var st = SESS[p.id];
    if (!st) {
      if (!serv.length) { sec.appendChild(h("p", { class: "small muted" }, "هنوز مسئلهٔ وارسی‌شده‌ای برای تمرین نیست؛ بالا بساز.")); return sec; }
      var pool = (due.length ? due : serv).slice();
      sec.appendChild(h("p", { class: "small" }, due.length ? fa(due.length) + " مسئله موعدِ امروز است." : "امروز چیزی موعد نیست؛ می‌توانی تمرینِ آزاد کنی (موعدها از روی همین پاسخ‌ها جابه‌جا می‌شوند)."));
      sec.appendChild(h("button", { class: "btn pbs-start", type: "button", onclick: function () { SESS[p.id] = { q: A.shuffle ? A.shuffle(pool) : pool, k: 0, ok: 0, phase: "ask" }; A.render(); } }, due.length ? "شروعِ تمرینِ امروز" : "تمرینِ آزاد"));
      return sec;
    }
    if (st.k >= st.q.length) {
      sec.appendChild(h("p", {}, "پایان: " + fa(st.ok) + " از " + fa(st.q.length) + " درست."));
      sec.appendChild(h("button", { class: "btn ghost", type: "button", onclick: function () { delete SESS[p.id]; A.render(); } }, "بستن"));
      return sec;
    }
    var it = S.get(st.q[st.k].id) || st.q[st.k];
    sec.appendChild(h("p", { class: "small muted" }, "مسئلهٔ " + fa(st.k + 1) + " از " + fa(st.q.length) + " · " + (FORMS[it.form] || "") + " · سطحِ " + fa(it.level)));
    sec.appendChild(h("div", { class: "pbs-prompt" }, String(it.prompt).split("\n").map(function (x) { return h("p", {}, x); })));
    var conf = h("select", { id: "pbsConf", "aria-label": "اطمینان" }, [50, 60, 70, 80, 90, 100].map(function (v) { return h("option", { value: v, selected: v === 70 }, fa(v) + "٪"); }));
    var fb = h("div", { class: "pbs-fb" });
    function reveal(ans) {
      var ok = A.pbCheck(it, ans);
      A.pbRecord(it, { conf: +conf.value, ok: ok, ans: String(ans) });
      if (ok) st.ok++;
      var right = it.atype === "choice" ? ((it.choices || []).filter(function (c) { return c.id === it.answer; })[0] || {}).t : fa(it.answer);
      fb.innerHTML = "";
      fb.appendChild(h("div", { class: "card soft " + (ok ? "okv" : "badv") },
        h("p", {}, h("strong", {}, ok ? "درست." : "نادرست."), " پاسخ: «" + right + "»"),
        it.decoy ? h("p", { class: "small" }, h("strong", {}, "بدلی بود: "), "ظاهرش شبیهِ مسئلهٔ اصلی است ولی حرکت‌های آن این‌جا کار نمی‌کند.") : null,
        it.deep ? h("p", { class: "small" }, h("strong", {}, "ساختارِ مشترک: "), it.deep) : null,
        it.trap ? h("p", { class: "small" }, h("strong", {}, "تله: "), it.trap) : null,
        it.explain ? h("p", { class: "small" }, h("strong", {}, "حل: "), it.explain) : null, mvChips(it),
        h("p", { class: "small muted" }, "نوبتِ بعدیِ این مسئله: " + (A.fdate ? A.fdate(it.due) : it.due)),
        h("button", { class: "btn pbs-next", type: "button", onclick: function () { st.k++; A.render(); } }, st.k + 1 < st.q.length ? "بعدی" : "پایان")));
      Array.prototype.forEach.call(sec.querySelectorAll("button.dopt, .pbs-ans button, .pbs-ans input"), function (x) { x.disabled = true; });
    }
    sec.appendChild(h("div", { class: "row gap wrap small" }, h("label", { for: "pbsConf" }, "پیش از پاسخ: چقدر مطمئنی؟"), conf));
    if (it.atype === "choice") sec.appendChild(h("div", { class: "dopts pb-opts pbs-ans" }, (it.choices || []).map(function (c) { return h("button", { class: "dopt", type: "button", onclick: function () { reveal(c.id); } }, c.t); })));
    else {
      var inp = h("input", { type: "text", inputmode: "numeric", id: "pbsAns", "aria-label": "پاسخِ عددی" });
      sec.appendChild(h("div", { class: "row gap wrap pbs-ans" }, inp, h("button", { class: "btn", type: "button", onclick: function () { if (intOf(inp.value) == null) { A.toast("یک عددِ صحیح بنویس.", "bad"); return; } reveal(inp.value); } }, "ثبتِ پاسخ")));
    }
    sec.appendChild(fb);
    return sec;
  }
})(APP);
