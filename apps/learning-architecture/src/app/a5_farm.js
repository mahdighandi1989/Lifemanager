/* ===== مزرعه، نهالستان، بیان دیگر (کاشت و راهنما)، مسیر یکپارچه ===== */
(function (A) {
  var h = A.h, fa = A.fa, S = A.S, C = A.C;
  var FT = ["میوه: دستاوردی که علم ساخته و من فلسفه‌اش را نمی‌فهمم", "گره شخصی: برای علم حل‌شده، برای من گره است", "گره مرزی: برای خود علم هم هنوز حل‌نشده است"];
  A.FTYPES = FT;
  function ftypeLayer(ft) { return ft === FT[0] ? { layer: "fruit", scope: "" } : ft === FT[2] ? { layer: "knot", scope: "science" } : ft === FT[1] ? { layer: "knot", scope: "me" } : { layer: "", scope: "" }; }

  /* ---------- داده‌های مزرعه ---------- */
  A.trees = function () { return S.all("tree").sort(function (a, b) { return (a.ord || 999) - (b.ord || 999) || a.created.localeCompare(b.created); }); };
  A.tnodes = function (tid, incFallen) { return S.all("fnode", function (n) { return n.tree === tid && (incFallen || n.status !== "fallen"); }); };
  A.newTree = function (name, kind, parents) {
    var ord = A.trees().length + 1;
    return S.put({ id: A.uid("tr"), type: "tree", name: name, kind: kind || "original", parents: parents || [], ord: ord, note: "" });
  };
  A.newNode = function (o) {
    var n = { id: A.uid("fn"), type: "fnode", tree: o.tree, parent: o.parent || "", layer: o.layer || "twig", title: o.title || "", text: o.text || "", need: o.need || "", scope: o.scope || "", status: o.status || (o.layer === "knot" ? "open" : "alive"), deps: o.deps || [], structs: o.structs || [], srcs: o.srcs || [], lesson: "" };
    return S.put(n);
  };
  A.addSrc = function (node, src) { if (!src || !src.id) return; node.srcs = node.srcs || []; if (!node.srcs.some(function (s) { return s.id === src.id; })) node.srcs.push(src); };
  A.toNursery = function (text, kind, src, scope) {
    text = (text || "").trim(); if (!text) return null;
    var dup = S.all("seedling", function (x) { return x.text === text.slice(0, 400) && x.src && src && x.src.id === src.id; });
    if (dup.length) return dup[0];
    return S.put({ id: A.uid("sd"), type: "seedling", text: text.slice(0, 400), kind: kind || "concept", scope: scope || "", src: src || null, status: "new" });
  };
  A.nurseryNew = function () { return S.all("seedling", function (x) { return x.status === "new"; }); };
  function toks(s) { return (s || "").replace(/[،,.؛;:!?؟()«»"\[\]{}\-–—]/g, " ").split(/\s+/).map(function (w) { return w.replace(/‌/g, ""); }).filter(function (w) { return w.length > 2 && ["برای", "این", "آن", "که", "چرا", "چه", "است", "های", "می‌شود", "یک", "را", "با", "از", "در", "به", "هم", "یا", "اگر"].indexOf(w) < 0; }); }
  A.suggest = function (text, treeId) {
    var a = toks(text); if (!a.length) return [];
    return S.all("fnode", function (n) { return n.status !== "fallen" && (!treeId || n.tree === treeId); }).map(function (n) {
      var b = toks(n.title + " " + n.text + " " + n.need); var inter = a.filter(function (w) { return b.indexOf(w) >= 0; }).length;
      return { n: n, s: inter / Math.max(1, Math.min(a.length, 12)) };
    }).filter(function (x) { return x.s > 0; }).sort(function (x, y) { return y.s - x.s; }).slice(0, 4);
  };
  function depthOf(n, map) { var d = 0, seen = {}; while (n && n.parent && map[n.parent] && !seen[n.id]) { seen[n.id] = 1; n = map[n.parent]; d++; } return d; }
  A.nodePath = function (n) {
    var map = {}; A.tnodes(n.tree, true).forEach(function (x) { map[x.id] = x; });
    var out = [], cur = n, seen = {};
    while (cur && !seen[cur.id]) { seen[cur.id] = 1; out.unshift(cur); cur = map[cur.parent]; }
    return out;
  };
  function nodeOptions(treeId, sel, blank) {
    var ns = A.tnodes(treeId), map = {}; ns.forEach(function (x) { map[x.id] = x; });
    ns.sort(function (a, b) { return depthOf(a, map) - depthOf(b, map) || C.FLAYER[a.layer].i - C.FLAYER[b.layer].i; });
    return [h("option", { value: "" }, blank || "— بدون والد (پایه درخت) —")].concat(ns.map(function (x) {
      return h("option", { value: x.id, selected: sel === x.id }, " ".repeat(depthOf(x, map) * 2) + "[" + C.FLAYER[x.layer].fa.split(" ")[0] + "] " + x.title.slice(0, 60));
    }));
  }

  /* ---------- دیالوگ جای‌گذاری ---------- */
  A.placeDialog = function (o, onDone) {
    o = o || {};
    var ov = h("div", { class: "overlay", role: "dialog", "aria-modal": "true", "aria-label": "جای‌گذاری در مزرعه" });
    var trees = A.trees();
    var st = { tree: o.tree || (trees[0] && trees[0].id) || "", mode: "new", target: "" };
    var ti = h("input", { id: "pdT", type: "text", value: o.text || "" });
    var tx = h("textarea", { id: "pdX", rows: 2, placeholder: "توضیح کوتاه (اختیاری)" }); tx.value = o.body || "";
    var nd = h("input", { id: "pdN", type: "text", value: o.need || "", placeholder: "چالش، نیاز یا دغدغه‌ای که این مفهوم را لازم کرد (اختیاری)" });
    var lay = h("select", { id: "pdL" }, C.FLAYERS.map(function (l) { return h("option", { value: l.k, selected: (o.layer || "twig") === l.k }, l.fa); }));
    var sc = h("select", { id: "pdS" }, h("option", { value: "me", selected: o.scope !== "science" }, "گره شخصی (برای علم حل‌شده)"), h("option", { value: "science", selected: o.scope === "science" }, "گره مرزی (برای علم هم حل‌نشده)"));
    var trSel = h("select", { id: "pdTr", onchange: function () { st.tree = trSel.value; drawParents(); } }, trees.map(function (t) { return h("option", { value: t.id, selected: st.tree === t.id }, t.name + (t.kind === "graft" ? " (پیوندی)" : "")); }));
    var newTr = h("input", { id: "pdNT", type: "text", placeholder: "یا نام درخت تازه" });
    var newKind = h("select", { id: "pdNK", "aria-label": "نوع درخت تازه" }, h("option", { value: "original" }, "اصیل"), h("option", { value: "graft" }, "پیوندی (علم ترکیبی)"));
    var par = h("select", { id: "pdP" });
    var mergeSel = h("select", { id: "pdM" });
    var dep = h("select", { id: "pdD" }, h("option", { value: "" }, "— وابستگی دوم (اختیاری) —"), S.all("fnode", function (n) { return n.status !== "fallen"; }).map(function (n) { var t = S.get(n.tree); return h("option", { value: n.id }, (t ? t.name : "") + " › " + n.title.slice(0, 50)); }));
    var stc = h("select", { id: "pdSt" }, h("option", { value: "" }, "— ساختار مادر در اطلس (اختیاری) —"), S.all("struct").map(function (s) { return h("option", { value: s.id }, s.fa); }));
    var sugBox = h("div", { class: "row gap wrap" });
    var aiOut = h("div", { class: "small muted" });
    var modeNew = h("input", { type: "radio", name: "pdmode", id: "pdm1", checked: true, onchange: function () { st.mode = "new"; vis(); } });
    var modeMerge = h("input", { type: "radio", name: "pdmode", id: "pdm2", onchange: function () { st.mode = "merge"; vis(); } });
    var newBox = h("div", { class: "col gap" }, h("label", { for: "pdL" }, "لایه"), lay, h("div", { class: "scbox" }, h("label", { for: "pdS" }, "نوع گره"), sc), h("label", { for: "pdP" }, "والد (روی کدام نقطه می‌روید؟)"), par,
      h("label", { for: "pdN" }, "چالش / نیاز / دغدغه"), nd, h("label", { for: "pdD" }, "وابستگی دوم (اگر به مفهومی دیگر هم وابسته است، حتی در درخت دیگر)"), dep, h("label", { for: "pdSt" }, "ساختار مادر مشترک"), stc);
    var mergeBox = h("div", { class: "col gap hidden" }, h("label", { for: "pdM" }, "این همان مفهوم موجود است:"), mergeSel, h("p", { class: "small muted" }, "متن و منبع این مورد به گره موجود افزوده می‌شود؛ درخت «کم‌کم کامل می‌شود»."));
    function vis() { newBox.classList.toggle("hidden", st.mode !== "new"); mergeBox.classList.toggle("hidden", st.mode !== "merge"); sc.parentNode.classList.toggle("hidden", lay.value !== "knot"); }
    lay.addEventListener("change", vis);
    function drawParents() {
      par.innerHTML = ""; nodeOptions(st.tree, o.parent).forEach(function (x) { par.appendChild(x); });
      mergeSel.innerHTML = ""; nodeOptions(st.tree, "", "— انتخاب گره —").forEach(function (x) { mergeSel.appendChild(x); });
      sugBox.innerHTML = "";
      var sg = A.suggest(ti.value + " " + tx.value, null);
      if (sg.length) { sugBox.appendChild(h("span", { class: "small muted" }, "شبیه‌ترین گره‌های موجود:")); sg.forEach(function (x) { var t = S.get(x.n.tree); sugBox.appendChild(h("button", { class: "btn ghost sm", type: "button", onclick: function () { st.tree = x.n.tree; trSel.value = x.n.tree; drawParents(); par.value = x.n.id; mergeSel.value = x.n.id; } }, (t ? t.name : "") + " › " + x.n.title.slice(0, 40))); }); }
    }
    ti.addEventListener("input", A.debounce(drawParents, 400));
    drawParents(); setTimeout(vis, 0);
    var aiBtn = h("button", { class: "btn ghost sm", type: "button", onclick: function () {
      aiBtn.disabled = true; aiOut.textContent = "در حال پیشنهاد…";
      var list = S.all("fnode", function (n) { return n.status !== "fallen"; }).slice(0, 300).map(function (n) { var t = S.get(n.tree); return n.id + " | " + (t ? t.name : "") + " | " + n.layer + " | " + n.title; }).join("\n");
      var sys = "تو دستیار جای‌گذاری مفاهیم در «مزرعه علم» هستی. هر علم یک درخت است با لایه‌های root (نیاز و روش بنیادین)، trunk (قواعد متقن)، branch (نظریه/زیررشته)، twig (مفهوم/مدل)، fruit (دستاورد/ابزار)، knot (مسئله)، bud (فرضیه). فقط JSON برگردان با کلیدهای: tree (نام درخت اصیل مناسب؛ اگر علم ترکیبی است نام درخت اصیلی که این مفهوم دقیقاً به آن برمی‌گردد)، new_tree (true اگر درخت موجود نیست)، parent_id (شناسه گره موجود یا null)، same_as (شناسه گره موجودی که دقیقاً همین مفهوم است یا null)، layer، reason (یک جمله فارسی). اگر مفهوم اصیل نیست (مثلاً یک یادداشت شخصی یا تاکتیک)، tree را null بگذار و دلیل بگو.";
      var user = "مورد: " + ti.value + "\nتوضیح: " + tx.value + "\nدرخت‌ها: " + A.trees().map(function (t) { return t.name + (t.kind === "graft" ? " (پیوندی)" : ""); }).join("، ") + "\nگره‌های موجود (شناسه | درخت | لایه | عنوان):\n" + list;
      A.callAI(sys, user).then(function (txt) {
        var m = (txt || "").match(/\{[\s\S]*\}/); if (!m) { aiOut.textContent = txt; return; }
        var j = JSON.parse(m[0]);
        aiOut.textContent = "پیشنهاد: " + (j.tree || "مفهوم اصیل نیست") + (j.layer ? " · " + (C.FLAYER[j.layer] ? C.FLAYER[j.layer].fa : j.layer) : "") + " — " + (j.reason || "");
        if (j.tree) {
          var tr = A.trees().filter(function (t) { return t.name === j.tree; })[0];
          if (tr) { st.tree = tr.id; trSel.value = tr.id; drawParents(); } else newTr.value = j.tree;
          if (j.layer && C.FLAYER[j.layer]) lay.value = j.layer;
          if (j.same_as && S.get(j.same_as)) { modeMerge.checked = true; st.mode = "merge"; mergeSel.value = j.same_as; }
          else if (j.parent_id && S.get(j.parent_id)) par.value = j.parent_id;
          vis();
        }
      }, function (e) { aiOut.textContent = (e && e.message) || "خطا"; }).then(function () { aiBtn.disabled = false; });
    } }, "پیشنهاد هوش مصنوعی");
    ov.appendChild(h("div", { class: "dialog wide" }, h("h3", {}, "جای‌گذاری در مزرعه"),
      h("p", { class: "small muted" }, "این مفهوم روی کدام درخت و کدام نقطه می‌روید؟ خودِ این تصمیم تمرین «کجای علم ایستاده‌ام» است."),
      h("label", { for: "pdT" }, "عنوان"), ti, tx, sugBox,
      h("div", { class: "row gap wrap" }, h("label", { for: "pdTr" }, "درخت"), trSel, newTr, newKind),
      h("div", { class: "row gap wrap" }, h("label", { class: "chk", for: "pdm1" }, modeNew, "گره تازه"), h("label", { class: "chk", for: "pdm2" }, modeMerge, "ادغام با مفهوم موجود")),
      newBox, mergeBox,
      h("div", { class: "row gap wrap" }, aiBtn, aiOut),
      h("div", { class: "row gap wrap mt" },
        h("button", { class: "btn", type: "button", onclick: function () {
          if (!ti.value.trim()) { A.toast("عنوان را بنویس.", "bad"); return; }
          var treeId = st.tree;
          if (newTr.value.trim()) { var ex = A.trees().filter(function (t) { return t.name === newTr.value.trim(); })[0]; treeId = ex ? ex.id : A.newTree(newTr.value.trim(), newKind.value).id; }
          if (!treeId) { A.toast("یک درخت انتخاب کن یا درخت تازه بساز.", "bad"); return; }
          var node;
          if (st.mode === "merge") {
            node = S.get(mergeSel.value); if (!node) { A.toast("گره موجود را انتخاب کن.", "bad"); return; }
            if (tx.value.trim() && node.text.indexOf(tx.value.trim()) < 0) node.text = (node.text ? node.text + "\n" : "") + tx.value.trim();
            if (ti.value.trim() !== node.title) node.text = (node.text ? node.text + "\n" : "") + "پرسش/بیان دیگر: " + ti.value.trim();
            A.addSrc(node, o.src); S.put(node);
          } else {
            node = A.newNode({ tree: treeId, parent: newTr.value.trim() ? "" : par.value, layer: lay.value, title: ti.value.trim(), text: tx.value.trim(), need: nd.value.trim(), scope: lay.value === "knot" ? sc.value : "", deps: dep.value ? [dep.value] : [], structs: stc.value ? [stc.value] : [], srcs: o.src ? [o.src] : [] });
          }
          ov.remove(); A.toast("در مزرعه کاشته شد."); onDone && onDone(node);
        } }, "کاشت"),
        o.seedling ? h("button", { class: "btn ghost", type: "button", onclick: function () { ov.remove(); onDone && onDone(null, "dismiss"); } }, "مفهوم اصیل نیست؛ کنار بگذار") : null,
        h("button", { class: "btn ghost", type: "button", onclick: function () { ov.remove(); } }, "انصراف"))));
    A.layer().appendChild(ov); ti.focus();
  };

  /* ---------- نمای مزرعه ---------- */
  A.V.farm = function (arg, sub) {
    var root = h("div", { class: "page" });
    root.appendChild(A.head("مزرعه", "درخت‌های علم تو", "هر مفهوم یا پرسشی که در بخش‌های دیگر می‌سازی، اول به «نهالستان» می‌آید؛ اینجا جایش را در درخت علم خودش تعیین می‌کنی تا درخت‌ها کم‌کم کامل شوند. درخت‌ها به ترتیب وابستگی کنار هم‌اند (مثلاً فیزیک کنار ریاضی)."));
    var nn = A.nurseryNew().length;
    var openK = S.all("fnode", function (n) { return n.layer === "knot" && n.status === "open"; }).length;
    var tab = sub || (arg ? "tree" : "trees");
    root.appendChild(A.tabs([["trees", "درخت‌ها"], ["nursery", "نهالستان (" + fa(nn) + ")"], ["knots", "گره‌های باز (" + fa(openK) + ")"], ["compost", "کود"], ["logic", "منطق مزرعه"]], tab === "tree" ? "trees" : tab, function (k) { A.go("farm", null, k); }));
    if (tab === "tree") root.appendChild(treeView(arg));
    else if (tab === "nursery") root.appendChild(nursery());
    else if (tab === "knots") root.appendChild(knots());
    else if (tab === "compost") root.appendChild(compost());
    else if (tab === "logic") root.appendChild(logic());
    else root.appendChild(overview());
    return root;
  };
  function layerCounts(tid) { var c = {}; A.tnodes(tid).forEach(function (n) { c[n.layer] = (c[n.layer] || 0) + 1; }); return c; }
  function overview() {
    var wrap = h("div", { class: "col gap" });
    var ni = h("input", { id: "ntrN", type: "text", "aria-label": "نام درخت تازه", placeholder: "نام درخت تازه (یک علم اصیل یا ترکیبی)" });
    var nk = h("select", { id: "ntrK", "aria-label": "نوع" }, h("option", { value: "original" }, "اصیل"), h("option", { value: "graft" }, "پیوندی (علم ترکیبی)"));
    wrap.appendChild(h("div", { class: "row gap wrap" }, ni, nk, h("button", { class: "btn", onclick: function () { if (!ni.value.trim()) return; var t = A.newTree(ni.value.trim(), nk.value); A.go("farm", t.id, "tree"); } }, "کاشت درخت")));
    wrap.appendChild(h("div", { class: "farm" }, A.trees().map(function (t) {
      var c = layerCounts(t.id), tot = A.tnodes(t.id).length;
      var gaps = treeGaps(t.id);
      return h("button", { class: "tcard ftree" + (t.kind === "graft" ? " graft" : ""), onclick: function () { A.go("farm", t.id, "tree"); } },
        h("div", { class: "tct" }, h("span", { class: "tfa" }, t.name), h("span", { class: "chip" }, t.kind === "graft" ? "پیوندی" : "اصیل")),
        t.kind === "graft" && t.parents && t.parents.length ? h("div", { class: "small muted" }, "والدها: " + t.parents.map(function (p) { var x = S.get(p); return x ? x.name : ""; }).join("، ")) : null,
        miniTree(c),
        h("div", { class: "small" }, tot ? fa(tot) + " گره" : "درخت خالی؛ با اولین مفهوم رشد می‌کند"),
        gaps.length ? h("div", { class: "small warnline" }, gaps[0]) : null);
    })));
    var cross = S.all("fnode", function (n) { return (n.deps || []).some(function (d) { var x = S.get(d); return x && x.tree !== n.tree; }); });
    if (cross.length) wrap.appendChild(h("div", { class: "card" }, h("h3", {}, "وابستگی‌های میان‌درختی"), h("ul", { class: "plain small" }, cross.map(function (n) {
      return h("li", {}, n.deps.map(function (d) { var x = S.get(d); if (!x) return null; var ta = S.get(n.tree), tb = S.get(x.tree); return h("div", {}, (ta ? ta.name : "") + " › " + n.title + " ← وابسته به ← " + (tb ? tb.name : "") + " › " + x.title); }));
    }))));
    return wrap;
  }
  function miniTree(c) {
    var order = ["fruit", "knot", "leaf", "twig", "branch", "trunk", "root"];
    return h("div", { class: "mini" }, order.map(function (k) { return h("div", { class: "mrow l-" + k }, h("span", {}, C.FLAYER[k].fa.split(" ")[0]), h("i", { style: { width: Math.min(100, (c[k] || 0) * 12) + "%" } }), h("b", {}, fa(c[k] || 0))); }));
  }
  function treeGaps(tid) {
    var ns = A.tnodes(tid), out = [], map = {}; ns.forEach(function (n) { map[n.id] = n; });
    if (!ns.length) return out;
    if (!ns.some(function (n) { return n.layer === "root"; })) out.push("ریشه ندارد: نیاز و روش بنیادین این علم هنوز ثبت نشده.");
    if (!ns.some(function (n) { return n.layer === "trunk"; })) out.push("تنه ندارد: قواعد متقن هنوز ثبت نشده.");
    var floating = ns.filter(function (n) { return !n.parent && n.layer !== "root" && n.layer !== "trunk"; });
    if (floating.length) out.push(fa(floating.length) + " گره بدون اتصال به تنه یا ریشه (معلق).");
    var noNeed = ns.filter(function (n) { return !n.need && ["branch", "twig", "trunk"].indexOf(n.layer) >= 0; });
    if (noNeed.length) out.push(fa(noNeed.length) + " شاخه یا مفهوم بدون «چالش/نیاز/دغدغه».");
    return out;
  }
  function treeView(tid) {
    var t = S.get(tid); if (!t) return A.empty("درخت پیدا نشد.");
    var wrap = h("div", { class: "col gap" });
    var sel = A.farmSel && S.get(A.farmSel) && S.get(A.farmSel).tree === tid ? S.get(A.farmSel) : null;
    wrap.appendChild(h("div", { class: "row between wrap" }, h("h2", {}, "درخت " + t.name + (t.kind === "graft" ? " (پیوندی)" : "")),
      h("div", { class: "row gap wrap" }, h("button", { class: "btn sm", onclick: function () { A.placeDialog({ tree: tid }, function () { A.render(); }); } }, "+ گره"),
        h("button", { class: "btn ghost sm", onclick: function () { A.startProto("P6", { preset: { sci: t.name } }); } }, "شناسنامه این علم"),
        A.confirmBtn("حذف درخت", function () { A.tnodes(tid, true).forEach(function (n) { S.del(n.id); }); S.del(tid); A.go("farm"); }))));
    if (t.kind === "graft") {
      var pSel = h("select", { id: "trPar", "aria-label": "افزودن والد" }, h("option", { value: "" }, "+ والد اصیل"), A.trees().filter(function (x) { return x.id !== tid; }).map(function (x) { return h("option", { value: x.id }, x.name); }));
      pSel.addEventListener("change", function () { if (!pSel.value) return; t.parents = (t.parents || []).concat([pSel.value]); S.put(t); A.render(); });
      var orig = { q: h("input", { type: "checkbox", id: "og1", checked: !!(t.orig && t.orig[0]), onchange: function (e) { t.orig = t.orig || []; t.orig[0] = e.target.checked; S.put(t); } }), m: h("input", { type: "checkbox", id: "og2", checked: !!(t.orig && t.orig[1]), onchange: function (e) { t.orig = t.orig || []; t.orig[1] = e.target.checked; S.put(t); } }), r: h("input", { type: "checkbox", id: "og3", checked: !!(t.orig && t.orig[2]), onchange: function (e) { t.orig = t.orig || []; t.orig[2] = e.target.checked; S.put(t); } }) };
      wrap.appendChild(h("div", { class: "card soft" }, h("div", { class: "row gap wrap" }, h("strong", {}, "والدها: "), (t.parents || []).map(function (p) { var x = S.get(p); return x ? h("button", { class: "tlink proto", onclick: function () { A.go("farm", p, "tree"); } }, x.name) : null; }), pSel),
        h("p", { class: "small" }, "آزمون اصالت (اگر هر سه بله، این پیوند «قلمه ریشه‌دار» است و می‌تواند درخت اصیل شود):"),
        h("label", { class: "chk", for: "og1" }, orig.q, "پرسش بنیادینی دارد که به پرسش‌های والدها تقلیل نمی‌یابد"),
        h("label", { class: "chk", for: "og2" }, orig.m, "روش سنجش مستقل خودش را دارد"),
        h("label", { class: "chk", for: "og3" }, orig.r, "قواعد تنه‌ای دارد که از والدها نتیجه نمی‌شوند"),
        h("button", { class: "btn ghost sm", onclick: function () { if (!(t.orig && t.orig[0] && t.orig[1] && t.orig[2])) { A.toast("هر سه شرط آزمون اصالت باید برقرار باشد.", "bad"); return; } t.kind = "original"; S.put(t); A.toast("پیوند ریشه دواند: درخت اصیل شد."); A.render(); } }, "تبدیل به درخت اصیل")));
    }
    var gaps = treeGaps(tid);
    if (gaps.length) wrap.appendChild(h("div", { class: "card soft" }, h("strong", {}, "جاهای خالی این درخت"), h("ul", { class: "small" }, gaps.map(function (g) { return h("li", {}, g); }))));
    var ns = A.tnodes(tid);
    if (!ns.length) { wrap.appendChild(A.empty("این درخت هنوز گرهی ندارد. از نهالستان یا «بیان دیگر» در آن بکار، یا مستقیم «+ گره» بزن.")); return wrap; }
    wrap.appendChild(h("div", { class: "scrollx treebox" }, drawTree(ns, sel)));
    wrap.appendChild(legend());
    if (sel) wrap.appendChild(nodePanel(sel));
    return wrap;
  }
  function legend() {
    return h("div", { class: "row gap wrap small muted" }, C.FLAYERS.map(function (l) { return h("span", { class: "lgd l-" + l.k, title: l.def }, h("i", {}), l.fa); }), h("span", {}, "ضخامت شاخه = «تردد»: تعداد زیرشاخه‌ها و ارجاع‌ها"));
  }
  function drawTree(ns, sel) {
    var map = {}, kids = {}; ns.forEach(function (n) { map[n.id] = n; kids[n.id] = []; });
    var tops = [];
    ns.forEach(function (n) { if (n.parent && map[n.parent]) kids[n.parent].push(n); else tops.push(n); });
    function lorder(a, b) { return C.FLAYER[a.layer].i - C.FLAYER[b.layer].i || a.created.localeCompare(b.created); }
    tops.sort(lorder); Object.keys(kids).forEach(function (k) { kids[k].sort(lorder); });
    var pos = {}, leaf = 0, maxD = 0, traffic = {};
    function tr(n) { var c = (n.srcs || []).length; kids[n.id].forEach(function (k) { c += 1 + tr(k); }); traffic[n.id] = c; return c; }
    tops.forEach(tr);
    function place(n, d) {
      maxD = Math.max(maxD, d);
      if (!kids[n.id].length) { pos[n.id] = { x: leaf++, d: d }; return pos[n.id].x; }
      var xs = kids[n.id].map(function (k) { return place(k, d + 1); });
      pos[n.id] = { x: (xs[0] + xs[xs.length - 1]) / 2, d: d }; return pos[n.id].x;
    }
    tops.forEach(function (n) { place(n, 0); leaf += 0.4; });
    var colW = 128, rowH = 86, W = Math.max(640, (leaf + 0.6) * colW), H = (maxD + 1) * rowH + 90;
    var s = A.svg, svg = s("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, class: "tsvg", role: "img", "aria-label": "درخت" });
    function X(n) { return W - 60 - pos[n.id].x * colW; } function Y(n) { return H - 50 - pos[n.id].d * rowH; }
    svg.appendChild(s("rect", { x: 0, y: H - 34, width: W, height: 34, class: "soil" }));
    svg.appendChild(s("text", { x: W - 10, y: H - 12, class: "soiltx", "text-anchor": "start" }, "خاک: شهودهای همگانی"));
    ns.forEach(function (n) {
      if (!n.parent || !map[n.parent]) return;
      var p = map[n.parent], x1 = X(p), y1 = Y(p), x2 = X(n), y2 = Y(n);
      var w = 1.4 + Math.log2(1 + traffic[n.id]) * 1.6;
      svg.appendChild(s("path", { d: "M" + x1 + "," + y1 + " C" + x1 + "," + (y1 - rowH * 0.5) + " " + x2 + "," + (y2 + rowH * 0.5) + " " + x2 + "," + y2, class: "tbranch", "stroke-width": w }));
    });
    ns.forEach(function (n) {
      var x = X(n), y = Y(n), g = s("g", { class: "tn l-" + n.layer + (sel && sel.id === n.id ? " sel" : "") + (n.layer === "knot" && n.status === "solved" ? " solved" : ""), tabindex: "0", role: "button", "aria-label": C.FLAYER[n.layer].fa + ": " + n.title });
      if (n.layer === "knot") g.appendChild(s("path", { d: "M" + x + "," + (y - 13) + " L" + (x + 13) + "," + y + " L" + x + "," + (y + 13) + " L" + (x - 13) + "," + y + " Z", class: "shape" }));
      else if (n.layer === "leaf") g.appendChild(s("ellipse", { cx: x, cy: y, rx: 10, ry: 6, class: "shape" }));
      else if (n.layer === "bud") g.appendChild(s("path", { d: "M" + x + "," + (y - 11) + " L" + (x + 9) + "," + (y + 8) + " L" + (x - 9) + "," + (y + 8) + " Z", class: "shape" }));
      else if (n.layer === "root" || n.layer === "trunk") g.appendChild(s("rect", { x: x - 16, y: y - 11, width: 32, height: 22, rx: n.layer === "root" ? 11 : 3, class: "shape" }));
      else g.appendChild(s("circle", { cx: x, cy: y, r: n.layer === "fruit" ? 12 : n.layer === "branch" ? 10 : 7.5, class: "shape" }));
      var lab = n.title.length > 20 ? n.title.slice(0, 19) + "…" : n.title;
      g.appendChild(s("text", { x: x, y: y + 27, class: "tlab", "text-anchor": "middle" }, lab));
      if ((n.deps || []).length) g.appendChild(s("circle", { cx: x - 14, cy: y - 12, r: 4, class: "depdot" }));
      function pick() { A.farmSel = n.id; A.render(); setTimeout(function () { var el = document.getElementById("npanel"); if (el) el.scrollIntoView({ block: "nearest" }); }, 30); }
      g.addEventListener("click", pick); g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
      svg.appendChild(g);
    });
    return svg;
  }
  function srcLink(sr) {
    var r = S.get(sr.id);
    if (sr.t === "eco") return h("button", { class: "linkish small", onclick: function () { A.go("e_concepts", sr.id); } }, sr.label || "مفهوم جزوه معرفت‌شناسی");
    var label = sr.label || (r ? (r.type === "topic" ? "موضوع: " + r.title : r.type === "ex" ? "تمرین تکنیک " + fa(r.tid) : r.type === "pr" ? (A.PM[r.pid] ? A.PM[r.pid].fa : "") : r.type === "case" ? "پرونده معرفتی: " + r.title : r.type === "knot" ? "گرهِ ذهنی: " + (r.name || "بی‌نام") : r.type) : "منبع حذف‌شده");
    return h("button", { class: "linkish small", onclick: function () { if (!r) return; if (r.type === "case") A.go("e_case", r.id); else if (r.type === "topic") A.go("topic", r.id); else if (r.type === "ex") A.go("tech", r.tid, "ws:" + r.id); else if (r.type === "pr") A.go("proto", r.pid, r.id); else if (r.type === "knot" && A.V.knot) A.go("knot", r.id); } }, label);
  }
  function nodePanel(n) {
    var t = S.get(n.tree), path = A.nodePath(n);
    var kids = A.tnodes(n.tree).filter(function (x) { return x.parent === n.id; });
    var sibs = n.parent ? A.tnodes(n.tree).filter(function (x) { return x.parent === n.parent && x.id !== n.id; }) : [];
    var title = h("input", { id: "npT", type: "text", value: n.title, onchange: function (e) { n.title = e.target.value; S.put(n); } });
    var text = h("textarea", { id: "npX", rows: 3, onchange: function (e) { n.text = e.target.value; S.put(n); } }); text.value = n.text || "";
    var need = h("input", { id: "npN", type: "text", value: n.need || "", placeholder: "چه چالش، نیاز یا دغدغه‌ای این را لازم کرد؟", onchange: function (e) { n.need = e.target.value; S.put(n); } });
    var lay = h("select", { id: "npL", onchange: function (e) { n.layer = e.target.value; if (n.layer === "knot" && !n.status) n.status = "open"; S.put(n); A.render(); } }, C.FLAYERS.map(function (l) { return h("option", { value: l.k, selected: n.layer === l.k }, l.fa); }));
    var par = h("select", { id: "npP", onchange: function (e) { if (e.target.value === n.id) return; n.parent = e.target.value; S.put(n); A.render(); } }, nodeOptions(n.tree, n.parent).filter(function (o) { return o.value !== n.id; }));
    var panel = h("div", { class: "card npanel", id: "npanel" },
      h("div", { class: "row between wrap" }, h("div", { class: "eyebrow" }, (t ? t.name : "") + " · " + C.FLAYER[n.layer].fa + (n.layer === "knot" ? (n.scope === "science" ? " · مرزی" : " · شخصی") + (n.status === "solved" ? " · باز شد" : " · باز") : "")),
        h("button", { class: "ib", "aria-label": "بستن", onclick: function () { A.farmSel = null; A.render(); } }, "×")),
      h("div", { class: "small muted" }, "مسیر از پایه: " + path.map(function (x) { return x.title; }).join(" ← ")),
      h("label", { for: "npT" }, "عنوان"), title, h("label", { for: "npX" }, "توضیح"), text, h("label", { for: "npN" }, "چالش / نیاز / دغدغه"), need,
      h("div", { class: "row gap wrap" }, h("label", { for: "npL" }, "لایه"), lay, h("label", { for: "npP" }, "والد"), par),
      h("p", { class: "small muted" }, C.FLAYER[n.layer].def),
      sibs.length ? h("div", { class: "small" }, h("strong", {}, "شاخه‌های هم‌جوار: "), sibs.map(function (x) { return x.title; }).join("، ")) : null,
      kids.length ? h("div", { class: "small" }, h("strong", {}, "روییده از این نقطه: "), kids.map(function (x) { return x.title; }).join("، ")) : null,
      (n.deps || []).length ? h("div", { class: "small" }, h("strong", {}, "وابستگی دوم: "), n.deps.map(function (d) { var x = S.get(d); var tt = x && S.get(x.tree); return x ? (tt ? tt.name + " › " : "") + x.title : ""; }).join("، ")) : null,
      (n.structs || []).length ? h("div", { class: "small" }, h("strong", {}, "ساختار مادر: "), n.structs.map(function (d) { var x = S.get(d); return x ? x.fa : ""; }).join("، ")) : null,
      (n.srcs || []).length ? h("div", { class: "small col" }, h("strong", {}, "از کجا آمده:"), n.srcs.map(srcLink)) : null,
      n.status === "fallen" ? h("div", { class: "small fixline" }, "کود · درس: " + (n.lesson || "")) : null,
      h("div", { class: "row gap wrap mt" },
        h("button", { class: "btn sm", onclick: function () { A.startProto("P11", { preset: { fruit: n.title, ftype: n.layer === "knot" ? (n.scope === "science" ? FT[2] : FT[1]) : FT[0], tree: t ? t.name : "" }, node: n.id }); } }, "بیان دیگر از این نقطه"),
        h("button", { class: "btn ghost sm", onclick: function () { A.placeDialog({ tree: n.tree, parent: n.id, layer: n.layer === "knot" ? "bud" : "twig" }, function () { A.render(); }); } }, n.layer === "knot" ? "+ جوانه (فرضیه)" : "+ روییدن از اینجا"),
        n.layer === "knot" && n.status !== "solved" ? h("button", { class: "btn ghost sm", onclick: function () { n.status = "solved"; if (n.scope === "me") n.layer = "fruit"; S.put(n); A.toast(n.scope === "me" ? "گره شخصی باز شد و به میوه تبدیل شد." : "گره مرزی حل‌شده علامت خورد."); A.render(); } }, "گره باز شد") : null,
        A.newCase ? h("button", { class: "btn ghost sm", title: "این گزاره را در کارخانه معرفت‌شناسی اعتبارسنجی کن", onclick: function () {
          var ex = S.all("case", function (c) { return c.src && c.src.id === n.id; })[0];
          if (ex) { A.go("e_case", ex.id); return; }
          var cs = A.newCase({ title: n.title, input: n.title + (n.text ? "\n" + n.text : ""), kind: "باور خودم", src: { t: "fnode", id: n.id } });
          A.addSrc(n, { t: "case", id: cs.id, label: "پرونده معرفتی: " + n.title }); S.put(n); A.go("e_case", cs.id);
        } }, S.all("case", function (c) { return c.src && c.src.id === n.id; }).length ? "پرونده معرفتی این گره" : "اعتبارسنجی در کارخانه") : null,
        n.layer === "knot" ? h("button", { class: "btn ghost sm", onclick: function () { A.cardDialog("چرا/چگونه: " + n.title, n.text || "", { src: n.id }); } }, "ساخت کارت") : null,
        fallBtn(n),
        A.confirmBtn("حذف", function () { A.tnodes(n.tree, true).forEach(function (x) { if (x.parent === n.id) { x.parent = n.parent || ""; S.put(x); } }); S.del(n.id); A.farmSel = null; A.render(); })));
    return panel;
  }
  function fallBtn(n) {
    if (n.status === "fallen") return h("button", { class: "btn ghost sm", onclick: function () { n.status = n.layer === "knot" ? "open" : "alive"; S.put(n); A.render(); } }, "بازگرداندن از کود");
    return h("button", { class: "btn ghost sm", onclick: function () {
      var ov = h("div", { class: "overlay", role: "dialog", "aria-modal": "true" }); var ta = h("textarea", { id: "lsn", rows: 3, placeholder: "چرا ابطال یا کنار گذاشته شد؟ چه درسی برای ریشه‌ها دارد؟ چه چیزی جایش را گرفت؟" });
      ov.appendChild(h("div", { class: "dialog" }, h("h3", {}, "انداختن به کود"), h("label", { for: "lsn" }, "درس"), ta, h("div", { class: "row gap" }, h("button", { class: "btn", onclick: function () { n.status = "fallen"; n.lesson = ta.value.trim(); S.put(n); ov.remove(); A.farmSel = null; A.render(); } }, "ثبت"), h("button", { class: "btn ghost", onclick: function () { ov.remove(); } }, "انصراف"))));
      A.layer().appendChild(ov); ta.focus();
    } }, "ابطال شد → کود");
  }
  function nursery() {
    var items = A.nurseryNew();
    var wrap = h("div", { class: "col gap" });
    wrap.appendChild(h("p", { class: "small" }, "هر چیزی که در بخش‌های دیگر ساختی و ممکن است مفهوم اصیلی باشد، اینجا منتظر است تا جایش را در یک درخت تعیین کنی: عنوان موضوع‌ها، پرسش عمیقِ «۵ خط دلتا»، شکاف‌های برگه سفید، علم‌های شناسنامه‌دار، و هر چیزی که از کارگاه‌ها «به مزرعه» فرستادی. اگر اصیل نیست کنارش بگذار؛ لازم نیست همه‌چیز به درختی وصل شود."));
    var add = h("input", { id: "nsA", type: "text", "aria-label": "نهال تازه", placeholder: "یک پرسش یا مفهوم تازه" });
    wrap.appendChild(h("div", { class: "row gap" }, add, h("button", { class: "btn", onclick: function () { if (!add.value.trim()) return; A.toNursery(add.value, "concept", null); A.render(); } }, "افزودن")));
    if (!items.length) { wrap.appendChild(A.empty("نهالستان خالی است. هر موضوع یا مفهومی که در بخش‌های دیگر بسازی، اینجا می‌آید.")); return wrap; }
    var kn = { concept: "مفهوم", knot: "گره", fruit: "میوه", science: "علم", leaf: "برگ (مشاهده)" };
    wrap.appendChild(h("ul", { class: "plain" }, items.map(function (it) {
      return h("li", { class: "card nrow" }, h("div", {}, h("div", { class: "row gap wrap" }, h("span", { class: "chip" }, kn[it.kind] || it.kind), it.scope ? h("span", { class: "chip" }, it.scope === "science" ? "مرزی" : "شخصی") : null, it.src ? srcLink(it.src) : null), h("div", {}, it.text)),
        h("div", { class: "row gap" }, h("button", { class: "btn sm", onclick: function () {
          A.placeDialog({ text: it.text, layer: it.kind === "knot" ? "knot" : it.kind === "fruit" ? "fruit" : it.kind === "leaf" ? "leaf" : "twig", scope: it.scope, src: it.src, seedling: true }, function (node, act) {
            it.status = act === "dismiss" ? "dismissed" : "placed"; if (node) it.node = node.id; S.put(it); A.render();
          });
        } }, "جای‌گذاری"), h("button", { class: "btn ghost sm", onclick: function () { it.status = "dismissed"; S.put(it); A.render(); } }, "اصیل نیست")));
    })));
    return wrap;
  }
  function knots() {
    var ks = S.all("fnode", function (n) { return n.layer === "knot" && n.status === "open"; });
    var wrap = h("div", { class: "col gap" });
    wrap.appendChild(h("p", { class: "small" }, "گره یعنی جایی که فهم گیر کرده است. گره شخصی (چیزی که تو هنوز نمی‌فهمی) با «بیان دیگر» باز می‌شود: فرود تا ریشه، بازسازی، مقایسه با منبع. گره مرزی (چیزی که علم هم هنوز نمی‌داند) یک فرضیه («جوانه») می‌گیرد و با آزمون رشد می‌کند یا به «کود» می‌افتد."));
    if (!ks.length) { wrap.appendChild(A.empty("گره بازی نیست.")); return wrap; }
    ["me", "science"].forEach(function (sc) {
      var arr = ks.filter(function (k) { return (k.scope || "me") === sc; });
      if (!arr.length) return;
      wrap.appendChild(h("h3", {}, sc === "me" ? "گره‌های شخصی" : "گره‌های مرزی"));
      wrap.appendChild(h("ul", { class: "plain" }, arr.map(function (k) { var t = S.get(k.tree); return h("li", { class: "row gap wrap" }, h("button", { class: "linkish", onclick: function () { A.farmSel = k.id; A.go("farm", k.tree, "tree"); } }, (t ? t.name + " › " : "") + k.title),
        h("button", { class: "btn ghost sm", onclick: function () { A.startProto("P11", { preset: { fruit: k.title, ftype: sc === "science" ? FT[2] : FT[1], tree: t ? t.name : "" }, node: k.id }); } }, "بیان دیگر")); })));
    });
    return wrap;
  }
  function compost() {
    var fs = S.all("fnode", function (n) { return n.status === "fallen"; });
    var wrap = h("div", { class: "col gap" });
    wrap.appendChild(h("p", { class: "small" }, "فرضیه‌ها، باورها و نظریه‌هایی که ابطال یا کنار گذاشته شدند. دور ریخته نمی‌شوند: درسشان خاکی می‌سازد که ریشه‌های تازه در آن محکم می‌شوند."));
    if (!fs.length) { wrap.appendChild(A.empty("هنوز چیزی به کود نیفتاده.")); return wrap; }
    wrap.appendChild(h("ul", { class: "plain" }, fs.map(function (n) { var t = S.get(n.tree); return h("li", { class: "card" }, h("strong", {}, (t ? t.name + " › " : "") + n.title), h("div", { class: "small" }, "درس: " + (n.lesson || "—")), fallBtn(n)); })));
    return wrap;
  }
  function logic() {
    var M = C.FARM_MODEL, wrap = h("div", { class: "col gap logic" });
    wrap.appendChild(h("div", { class: "card" }, h("h3", {}, "از کجا آمده و چه نتیجه‌ای گرفته شد"), h("p", {}, M.intro)));
    wrap.appendChild(h("div", { class: "card" }, h("h3", {}, "لایه‌های درخت در این سامانه"), h("div", { class: "col gap" }, C.FLAYERS.map(function (l) { return h("div", { class: "kv" }, h("span", {}, l.fa), h("span", {}, l.def, h("span", { class: "muted" }, " مثال: " + l.ex))); }))));
    wrap.appendChild(h("h2", {}, "جدول نگاشت: هر جزء درخت در علم چیست و کجا می‌شکند"));
    wrap.appendChild(h("div", { class: "scrollx" }, h("table", { class: "dt" }, h("thead", {}, h("tr", {}, ["جزء", "در این سامانه", "معادل در علم", "قوت تشبیه", "کجا می‌شکند"].map(function (x) { return h("th", {}, x); }))),
      h("tbody", {}, M.mapping.map(function (r) { return h("tr", {}, h("td", {}, h("strong", {}, r[0])), h("td", {}, r[1]), h("td", {}, r[2]), h("td", {}, h("span", { class: "pill " + (r[3] === "قوی" || r[3].indexOf("قوی") === 0 ? "good" : r[3] === "متوسط" ? "warn" : "bad") }, r[3])), h("td", {}, r[4])); })))));
    wrap.appendChild(h("h2", {}, "پاسخ پرسش‌های شما"));
    M.answers.forEach(function (x) { wrap.appendChild(h("div", { class: "card" }, h("h3", {}, x.q), x.a.map(function (p) { return h("p", {}, p); }))); });
    wrap.appendChild(h("h2", {}, "ارزیابی پنج نکته شما"));
    wrap.appendChild(h("div", { class: "scrollx" }, h("table", { class: "dt" }, h("thead", {}, h("tr", {}, h("th", {}, "نکته"), h("th", {}, "داوری"), h("th", {}, "دلیل و جای آن در سامانه"))),
      h("tbody", {}, M.userPoints.map(function (r) { return h("tr", {}, h("td", {}, r[0]), h("td", {}, h("span", { class: "pill " + (r[1].indexOf("درست") === 0 ? "good" : "warn") }, r[1])), h("td", {}, r[2])); })))));
    wrap.appendChild(h("h2", {}, "پاسخ‌های Gemini: چه درست بود، چه نه"));
    wrap.appendChild(h("ul", { class: "plain" }, M.gemini.map(function (r) { return h("li", { class: "card" }, h("span", { class: "pill " + (r[0] === "درست" ? "good" : r[0] === "نادرست" ? "bad" : "warn") }, r[0]), " ", r[1]); })));
    wrap.appendChild(h("h2", {}, "آنچه عمداً ربط داده نشد"));
    wrap.appendChild(h("ul", { class: "plain" }, M.excluded.map(function (r) { return h("li", { class: "card" }, h("strong", {}, r[0] + ": "), r[1]); })));
    return wrap;
  }

  /* ---------- بیان دیگر: کاشت زنجیره، راهنمای هوش مصنوعی ---------- */
  A.BAYAN_SYS = "تو «بیان دیگر» یک مفهوم را می‌نویسی برای یک یادگیرنده فارسی‌زبان که می‌خواهد مفهوم را مثل کسی بفهمد که آن را از ساده‌ترین حالت، در برخورد با چالش، نیاز و دغدغه، ساخته است. یادگیرنده پیش از تو خودش تلاش کرده؛ تلاشش را ببین و جاهایی که درست یا غلط رفته را مشخص کن.\n" +
    "قواعد سخت:\n۱) تاریخچه روایت نکن (نام و سال فقط اگر برای فهم لازم است) و از انگیزه مدرس حرف نزن. منطق بنویس، نه تاریخ.\n" +
    "۲) به صفر مطلق نپر. از «میوه» (همان چیزی که یادگیرنده با آن روبه‌رو شده) شروع کن و هر بار فقط یک پله پایین برو: زیرشاخه ← شاخه ← محل اتصال شاخه‌ها ← تنه ← ریشه.\n" +
    "۳) برای هر پله بنویس: این نقطه چیست؛ کدام چالش، نیاز یا دغدغه آن را لازم کرد؛ گام استدلالی که نشان می‌دهد چرا پله بالایی از این پله لازم می‌آید؛ شاخه‌های هم‌جوار که از اینجا دیده می‌شوند؛ و یک مثال بیرون از حوزه که همین پله را روشن‌تر کند.\n" +
    "۴) تجزیه (کل به جزء: میوه از چه اجزایی ساخته شده) را از فرود (جزئی به کلی: بر چه اصلی استوار است) جدا نگه دار.\n" +
    "۵) در ریشه به عناصری برس که برای هر کس فهمیدنی است (بدون اصطلاح). قواعد تنه و «شرط دوام و پویایی» علم را جدا بنویس.\n" +
    "۶) سپس «بازگشت» را بنویس: از ریشه تا میوه، به شکل استدلال‌هایی که یک انسان باهوش بی‌کتاب، غریزی و قدم‌به‌قدم طی می‌کرد. در هر قدم بگو کدام مانع او را مجبور به ساختن قدم بعد کرد.\n" +
    "۷) شاخه‌ها و میوه‌های دیگری که از همین تنه می‌رویند، و «بذر» (یک نیاز + یک روش + یک بینش) را بنویس.\n" +
    "۸) صادق باش: در بخشی به نام «جای تردید» بگو کجای این بازسازی منطقی با تاریخ واقعی فرق دارد یا قطعی نیست.\n" +
    "۹) فارسی روشن و دقیق، بدون تعارف و اغراق. ساختار با سرتیترهای: میوه، اجزای میوه، فرود پله‌به‌پله، عناصر ریشه‌ای، قواعد تنه، ریشه و شرط دوام، بازگشت از ریشه تا میوه، شاخه‌های دیگر، بذر، مقایسه با تلاش تو، جای تردید.";
  A.bayanAI = function (r, box, btn) {
    var d = r.data, explain = (d.mode || "").indexOf("توضیح سامانه") === 0;
    if (!A.filled(d.fruit) && !A.filled(d.lesson)) { A.toast("میوه یا متن درس را بنویس.", "bad"); return; }
    if (!explain && !(A.filled(d.naive) || (d.descent || []).some(function (x) { return x && x.what; }))) { A.toast("در حالت کارگاه اول خودت تلاش کن (تلاش خام یا یک پله فرود). اگر می‌خواهی اول توضیح بگیری، «حالت اجرا» را «توضیح سامانه» بگذار.", "bad"); return; }
    btn.disabled = true; btn.textContent = "در حال نوشتن بیان دیگر…";
    var p = A.PM.P11;
    var user = "حالت: " + (explain ? "توضیح سامانه (یادگیرنده هنوز تلاش نکرده یا کم تلاش کرده؛ توضیح کامل بده و در پایان سه پرسش بازسازی برای او بگذار)" : "کارگاه (یادگیرنده تلاش کرده؛ تلاشش را ارزیابی کن)") + "\nمیوه: " + (d.fruit || "(مشخص نشده؛ از متن درس میوه‌های اصلی را پیشنهاد بده و با مهم‌ترین شروع کن)") + "\nنوع: " + (d.ftype || "") + "\nحدس درخت: " + (d.tree || "") + (d.lesson ? "\n\n--- متن درس ---\n" + d.lesson : "") + "\n\n--- تلاش یادگیرنده ---\n" + A.serializeWS(p.ws.filter(function (f) { return ["parts", "naive", "descent", "knotSplit", "rootEls", "trunk", "rootCond"].indexOf(f.k) >= 0; }), d);
    A.callAI(A.BAYAN_SYS, user).then(function (txt) { d.__ai = txt; S.put(r); box.innerHTML = ""; box.appendChild(A.md(txt)); box.classList.remove("hidden"); },
      function (e) { A.toast((e && e.message) || "خطا", "bad"); }).then(function () { btn.disabled = false; btn.textContent = "دریافت بیان دیگر"; });
  };
  A.plantP11 = function (r) {
    var d = r.data, rows = (d.descent || []).filter(function (x) { return x && x.what; });
    if (!A.filled(d.fruit) || !rows.length) { A.toast("برای کاشت، میوه و دست‌کم یک پله فرود لازم است.", "bad"); return; }
    var trees = A.trees();
    var guess = trees.filter(function (t) { return d.tree && d.tree.indexOf(t.name) >= 0; })[0];
    var ov = h("div", { class: "overlay", role: "dialog", "aria-modal": "true", "aria-label": "کاشت زنجیره در مزرعه" });
    var trSel = h("select", { id: "plT" }, trees.map(function (t) { return h("option", { value: t.id, selected: guess && guess.id === t.id }, t.name); }));
    var newTr = h("input", { id: "plN", type: "text", placeholder: "یا درخت تازه" });
    var up = rows.slice().reverse();
    var maps = [];
    var list = h("div", { class: "col gap" });
    function drawRows() {
      list.innerHTML = ""; maps = [];
      up.forEach(function (row, i) {
        var sel = h("select", { "aria-label": "نگاشت " + row.what }, [h("option", { value: "" }, "گره تازه (" + (C.FLAYER[C.DESC_LAYER[row.lv] || "twig"].fa) + ")")].concat(newTr.value.trim() ? [] : nodeOptions(trSel.value, "", "—").slice(1)));
        var sg = A.suggest(row.what, trSel.value); if (sg.length && sg[0].s >= 0.5) sel.value = sg[0].n.id;
        maps.push(sel);
        list.appendChild(h("div", { class: "kv" }, h("span", {}, (row.lv || "پله") + ": " + row.what), sel));
      });
    }
    trSel.addEventListener("change", drawRows); newTr.addEventListener("input", A.debounce(drawRows, 300)); drawRows();
    ov.appendChild(h("div", { class: "dialog wide" }, h("h3", {}, "کاشت زنجیره «بیان دیگر» در مزرعه"),
      h("p", { class: "small muted" }, "پله‌ها از ریشه به بالا چیده شده‌اند. اگر پله‌ای همان گره موجود است، انتخابش کن تا درخت «کم‌کم کامل شود» و تکرار نشود؛ وگرنه گره تازه ساخته می‌شود. میوه در بالای زنجیره می‌نشیند."),
      h("div", { class: "row gap wrap" }, h("label", { for: "plT" }, "درخت"), trSel, newTr), list,
      h("div", { class: "kv" }, h("span", {}, "بالای زنجیره"), h("span", {}, (ftypeLayer(d.ftype).layer === "knot" ? "گره: " : "میوه: ") + d.fruit)),
      h("div", { class: "row gap mt" }, h("button", { class: "btn", onclick: function () {
        var treeId = trSel.value;
        if (newTr.value.trim()) { var ex = A.trees().filter(function (t) { return t.name === newTr.value.trim(); })[0]; treeId = ex ? ex.id : A.newTree(newTr.value.trim(), "original").id; }
        if (!treeId) { A.toast("درخت را مشخص کن.", "bad"); return; }
        var src = { t: "pr", id: r.id, label: "بیان دیگر: " + d.fruit }, prev = "";
        up.forEach(function (row, i) {
          var ex = maps[i] && maps[i].value && S.get(maps[i].value);
          if (ex) { A.addSrc(ex, src); if (!ex.need && row.need) ex.need = row.need; S.put(ex); prev = ex.id; return; }
          var n = A.newNode({ tree: treeId, parent: prev, layer: C.DESC_LAYER[row.lv] || "twig", title: row.what, need: row.need || "", text: (row.step ? "گام استدلالی: " + row.step : "") + (row.sib ? "\nهم‌جوار: " + row.sib : "") + (row.ex ? "\nمثال بیرونی: " + row.ex : ""), srcs: [src] });
          prev = n.id;
        });
        var fl = ftypeLayer(d.ftype);
        var top = r.node && S.get(r.node);
        if (top) { top.parent = top.parent || prev; A.addSrc(top, src); if (d.seed) top.text = (top.text ? top.text + "\n" : "") + "بذر: " + d.seed; S.put(top); }
        else top = A.newNode({ tree: treeId, parent: prev, layer: fl.layer || "fruit", scope: fl.scope, title: d.fruit, text: (d.seed ? "بذر: " + d.seed : "") + (d.myname ? "\nنام من: " + d.myname : ""), need: rows[0].need || "", srcs: [src] });
        if (r.topic) A.addSrc(top, { t: "topic", id: r.topic });
        if (top.layer === "knot") (d.knotSplit || []).filter(function (k) { return k && k.sub; }).forEach(function (k) {
          var sk = A.newNode({ tree: treeId, parent: top.id, layer: "knot", scope: top.scope || "me", title: k.sub, text: k.on ? "روی: " + k.on : "", srcs: [src], status: k.st === "تأیید شد" ? "solved" : "open" });
          if (k.hyp) { var b = A.newNode({ tree: treeId, parent: sk.id, layer: "bud", title: k.hyp, text: k.kill ? "معیار ابطال: " + k.kill : "", srcs: [src] }); if (k.st === "ابطال شد") { b.status = "fallen"; b.lesson = "ابطال شد با معیار: " + (k.kill || ""); S.put(b); } }
        });
        d.__planted = top.id; S.put(r);
        ov.remove(); A.toast("زنجیره کاشته شد."); A.farmSel = top.id; A.go("farm", treeId, "tree");
      } }, "کاشت"), h("button", { class: "btn ghost", onclick: function () { ov.remove(); } }, "انصراف"))));
    A.layer().appendChild(ov);
  };
  A.passportToTree = function (r) {
    var d = r.data; if (!d.sci) return;
    var t = A.trees().filter(function (x) { return x.name === d.sci.trim(); })[0] || A.newTree(d.sci.trim(), "original");
    t.passport = r.id; S.put(t);
    var src = { t: "pr", id: r.id, label: "شناسنامه " + d.sci };
    var mine = A.tnodes(t.id, true).filter(function (n) { return (n.srcs || []).some(function (s) { return s.id === r.id; }); });
    function upsert(layer, title, text, parent, scope) {
      var ex = mine.filter(function (n) { return n.layer === layer && n.title === title; })[0];
      if (ex) { ex.text = text || ex.text; S.put(ex); return ex; }
      return A.newNode({ tree: t.id, parent: parent || "", layer: layer, title: title, text: text || "", scope: scope || "", srcs: [src] });
    }
    var rootN = d.s2 || d.s1 ? upsert("root", (d.s2 || "نیاز بنیادین " + d.sci).slice(0, 120), "درد زایش: " + (d.s1 || "") + (d.s8 ? "\nمرز: " + d.s8 : "")) : null;
    var trunkN = d.s3 ? upsert("trunk", d.s3.slice(0, 120), d.s4 ? "عینک: " + d.s4 : "", rootN && rootN.id) : null;
    (d.s5 || "").split(/[\n،,]+/).map(function (x) { return x.trim(); }).filter(function (x) { return x.length > 1; }).slice(0, 8).forEach(function (b) { upsert("branch", b.slice(0, 80), "", (trunkN || rootN || {}).id); });
    (d.s9 || "").split(/[\n؛;]+/).map(function (x) { return x.trim(); }).filter(function (x) { return x.length > 3; }).slice(0, 5).forEach(function (k) { upsert("knot", k.slice(0, 120), "لبه باز امروز", (trunkN || rootN || {}).id, "science"); });
    A.toast("شناسنامه در درخت «" + t.name + "» کاشته شد.");
  };

  /* ---------- قلاب‌های تکمیل پروتکل (اتصال سامانه به مزرعه) ---------- */
  function toFarmFields(map, d, src) {
    (map || []).forEach(function (m) {
      var v = d[m[0]]; if (!A.filled(v)) return;
      (Array.isArray(v) ? v : [v]).filter(function (x) { return typeof x === "string" && x.trim(); }).forEach(function (x) { A.toNursery(x, m[1], src, m[1] === "knot" ? "me" : ""); });
    });
  }
  A.onExDone = function (ex) { toFarmFields((C.TOFARM.tech || {})[ex.tid], ex.data, { t: "ex", id: ex.id }); };
  A.onProtoDone = function (r) {
    var d = r.data, src = { t: "pr", id: r.id };
    toFarmFields((C.TOFARM.proto || {})[r.pid], d, src);
    if (r.pid === "P1" && d.q1 && d.q1.trim()) {
      A.addStructInstance(d.q1.trim(), (d.q2 || d.src || "") + (d.dom ? " (" + d.dom + ")" : ""), d.dom);
      if (d.qq) { var st = S.all("struct", function (s) { return s.fa === d.q1.trim(); })[0]; if (st) { st.q = (st.q ? st.q + " · " : "") + d.qq; S.put(st); } }
    }
    if (r.pid === "P1" && d.qq) A.toNursery(d.qq, "knot", src, "me");
    if ((r.pid === "P3" || r.pid === "P4") && d.gaps) (d.gaps || []).filter(Boolean).forEach(function (g) { A.toNursery(g, "knot", src, "me"); });
    if (r.pid === "P6") A.passportToTree(r);
    if (r.pid === "P11" && !d.__planted) A.toast("زنجیره را با «کاشت در مزرعه» در درخت بکار.");
  };

  /* ---------- «بیان دیگر» در حالتِ مسئله: وارسیِ قطعیِ زنجیرهٔ تحلیل و ترکیب (core3: pa_*) ----------
     بازخورد نمره نیست؛ فقط آنچه از خودِ جدول برمی‌آید: حلقهٔ بی‌پیشین، گسستِ زنجیره، حلقهٔ یک‌سویه (در ترکیب رو به جلو نمی‌گذرد ⇒
     جوابِ برآمده فقط «نامزد» است و باید در صورتِ مسئله وارسی شود)، حلقهٔ سنجیده‌نشده، و رسیدن به تناقض ⇒ برهانِ خلف. */
  function pnorm(x) { return String(x || "").replace(/[\s‌«»"'.,،:؛!?؟()\-]+/g, ""); }
  A.pappusRows = function (d) { return ((d && d.pa_chain) || []).filter(function (r) { return r && (String(r.now || "").trim() || String(r.prev || "").trim()); }); };
  A.pappusCheck = function (d, part, ch) {
    var rows = A.pappusRows(d), L = [], box = h("div", { class: "col gap pa-check", dir: "rtl" });
    function li(cls, t) { L.push(h("li", { class: cls }, t)); }
    if (part === "analysis") {
      if (!rows.length) return "";
      rows.forEach(function (r, i) {
        if (!String(r.prev || "").trim()) li("bad", "ردیفِ " + fa(i + 1) + ": پیشینِ «" + String(r.now || "").slice(0, 60) + "» هنوز نوشته نشده.");
        else if (!r.rev) li("warn", "ردیفِ " + fa(i + 1) + ": برگشت‌پذیریِ این حلقه را بسنج — از «" + String(r.prev).slice(0, 40) + "» رو به جلو هم به «" + String(r.now || "").slice(0, 40) + "» می‌رسی؟");
        var nx = rows[i + 1];
        if (nx && r.prev && nx.now) { var a = pnorm(r.prev), b = pnorm(nx.now); if (a && b && a.indexOf(b) < 0 && b.indexOf(a) < 0) li("warn", "میانِ ردیفِ " + fa(i + 1) + " و " + fa(i + 2) + " گسست است: پیشینِ یکی «این وضع» ِ بعدی نیست. اگر همان است، با همان واژه‌ها بنویس تا زنجیره پیوسته دیده شود."); }
      });
      var one = rows.filter(function (r) { return /^یک‌سویه/.test(r.rev || ""); }), unk = rows.filter(function (r) { return /^هنوز/.test(r.rev || ""); });
      if (one.length) li("warn", "حلقه‌های یک‌سویه (" + one.map(function (r) { return "ردیفِ " + fa(rows.indexOf(r) + 1); }).join("، ") + "): در ترکیب از این‌ها رو به جلو نمی‌شود گذشت. در مسئلهٔ یافتنی، آنچه از این راه به دست می‌آید فقط «نامزد» است و باید در خودِ صورتِ مسئله وارسی شود؛ در اثبات، شرطِ کافیِ دیگری بجو.");
      if (unk.length) li("warn", "حلقه‌های سنجیده‌نشده: " + unk.map(function (r) { return "ردیفِ " + fa(rows.indexOf(r) + 1); }).join("، ") + " — پیش از ترکیب بسنج.");
      if (/^به تناقض/.test(d.pa_end || "")) li("good", "زنجیره به تناقض رسید ⇒ فرضِ «حل شده» ناممکن است: این همان برهانِ خلف است — نقیضِ آن فرض ثابت شد (اگر همهٔ حلقه‌ها از آن فرض لازم می‌آمدند). در بازنگری بپرس: می‌شود همین را مستقیم هم ثابت کرد (همان حلقه‌ها، از دانسته رو به جلو)؟");
      else if (/^به چیزی دانسته/.test(d.pa_end || "") && !one.length && !unk.length && rows.every(function (r) { return String(r.prev || "").trim() && r.rev; })) li("good", "همهٔ حلقه‌ها برگشت‌پذیرند و زنجیره به دانسته رسید: ترکیب از «" + String(d.pa_known || "همان دانسته").slice(0, 60) + "» با برگرداندنِ حلقه‌ها به ترتیبِ عکس به خواسته می‌رسد.");
      else if (/^هنوز/.test(d.pa_end || "")) li("warn", "هنوز به دانسته نرسیدی: مسئلهٔ کمکی بساز — بخشی از شرط را نگه دار، یا به مجهول نگاه کن و مسئلهٔ آشنایی با همین مجهول بجو.");
      box.appendChild(h("ul", { class: "plain small" }, L));
      box.appendChild(h("div", { class: "row gap wrap" },
        A.MOVES && A.MOVES.mv_backward ? h("button", { class: "linkish small", type: "button", onclick: function () { A.go("move", "mv_backward"); } }, "🧗 حرکتِ «از هدف به عقب»") : null,
        /^به تناقض/.test(d.pa_end || "") && A.MOVES && A.MOVES.mv_contra ? h("button", { class: "linkish small pa-contra", type: "button", onclick: function () { A.go("move", "mv_contra"); } }, "🧗 حرکتِ «برهانِ خلف»") : null));
      return box;
    }
    var syn = (d.pa_synth || []).filter(function (x) { return String(x || "").trim(); });
    if (!syn.length) return "";
    var linked = rows.filter(function (r) { return String(r.prev || "").trim(); }).length;
    if (syn.length < linked) li("warn", "ترکیب " + fa(syn.length) + " حلقه دارد و تحلیل " + fa(linked) + " — حلقه‌ای جا مانده؟ هر حلقهٔ ترکیب برگشتِ یک حلقهٔ تحلیل است.");
    if (rows.some(function (r) { return /^یک‌سویه/.test(r.rev || ""); })) li("warn", "در تحلیل حلقهٔ یک‌سویه بود: اگر ترکیب از آن گذشت، جواب را در خودِ صورتِ مسئله وارسی کن (بازنگری).");
    if (!L.length) li("good", "ترکیب هم‌اندازهٔ تحلیل است. حالا بی‌نگاه بازنگری کن: نتیجه را در حالتی خاص بیازما؛ می‌توانی از راهِ دیگری هم به آن برسی؟");
    box.appendChild(h("ul", { class: "plain small" }, L));
    // تکرارِ فاصله‌دار: همین تحلیل یک کارتِ مرور می‌شود (فردا و روزهای بعد در «مرور» و «امروز»)
    if (d.pa_card && S.get(d.pa_card)) box.appendChild(h("p", { class: "small good" }, "کارتِ مرورِ این تحلیل ساخته شده؛ در «مرور» برمی‌گردد."));
    else box.appendChild(h("button", { class: "btn ghost sm pa-mkcard", type: "button", onclick: function () {
      var q = "بی‌نگاه: مسئلهٔ «" + String(d.fruit || d.pa_goal || "").slice(0, 120) + "» را از آخر تحلیل کن — فرض کن حل شده؛ زنجیره به کدام دانسته می‌رسد و کدام حلقه برگشت‌پذیر نیست؟";
      var a = rows.map(function (r, i) { return (i + 1) + ") " + (r.now || "") + " ⇐ " + (r.prev || "") + (r.rev ? " [" + r.rev.split(":")[0] + "]" : ""); }).join("\n") + (d.pa_known ? "\nدانسته: " + d.pa_known : "") + "\nترکیب: " + syn.join(" ⇒ ");
      var cd = A.newCard(q, a, { due: A.addDays(A.today(), 1), src: "P11:pappus" }); d.pa_card = cd && cd.id; if (ch) ch(); A.toast("کارتِ مرور ساخته شد؛ از فردا در «مرور».");
    } }, "کارتِ مرورِ همین تحلیل بساز"));
    return box;
  };

  /* ---------- مسیر یکپارچه (روی صفحه موضوع) ---------- */
  A.pipelineStatus = function (topic) {
    var id = topic.id;
    var exDone = function (ids) { return S.all("ex", function (e) { return e.topic === id && e.status === "done" && ids.indexOf(e.tid) >= 0; }).length > 0; };
    var phaseDone = function (ph) { return S.all("ex", function (e) { return e.topic === id && e.status === "done" && A.phaseOf(e.tid) === ph; }).length > 0; };
    var p11 = S.all("pr", function (r) { return r.pid === "P11" && r.topic === id; })[0];
    var d = p11 ? p11.data : {};
    var prDone = function (pid) { return S.all("pr", function (r) { return r.pid === pid && r.topic === id && r.status === "done"; }).length > 0; };
    var planted = !!d.__planted || S.all("fnode", function (n) { return (n.srcs || []).some(function (s) { return s.id === id; }); }).length > 0;
    return {
      S11: prDone("P2") || prDone("P5"),
      S1: !!topic.kind, S2: phaseDone(1) || prDone("P8"), S3: prDone("P1"),
      // حالتِ «مسئله» (تحلیل و ترکیب): یک حلقهٔ تحلیل = فرود؛ ترکیب = بازسازیِ رو به بالا
      S4: (d.descent || []).some(function (x) { return x && x.what; }) || A.pappusRows(d).some(function (x) { return String(x.prev || "").trim(); }),
      S5: planted, S6: phaseDone(4),
      S7: A.filled(d.seed) || phaseDone(5), S8: A.filled(d.ascent) || A.filled(d.pa_synth) || exDone([28, 26, 27]),
      S9: (d.cmp__open && A.filled(d.cmp)) || phaseDone(7), S10: prDone("P3"), p11: p11
    };
  };
  A.pipelineView = function (topic) {
    var st = A.pipelineStatus(topic);
    var done = C.PIPELINE.filter(function (s) { return st[s.k]; }).length;
    var wrap = h("section", { class: "card pipe" }, h("div", { class: "row between wrap" }, h("h2", {}, "مسیر یکپارچه یادگیری این مفهوم"), h("span", { class: "pill " + (done === C.PIPELINE.length ? "good" : "") }, fa(done) + " از " + fa(C.PIPELINE.length) + " گام")),
      h("p", { class: "small muted" }, fa(C.PIPELINE.length) + " گام که هر مفهوم را از گرفتن میوه تا تثبیت، از همه فازها، «بیان دیگر»، مزرعه و پروتکل‌ها عبور می‌دهد. تکنیک‌های هسته هر گام دکمه دارند؛ بقیه تکنیک‌های هر فاز در «حالت کامل» پایین صفحه‌اند. عبور از همه ۴۵ تکنیک برای هر مفهوم لازم نیست و خودش سرریز بار شناختی است؛ عبور از همه گام‌ها لازم است."));
    C.PIPELINE.forEach(function (s, i) {
      var ok = st[s.k];
      wrap.appendChild(h("div", { class: "pstep" + (ok ? " ok" : ""), style: { "--pc": "var(--p" + s.ph + ")" } },
        h("div", { class: "psn" }, ok ? "✓" : fa(i + 1)),
        h("div", { class: "psb" }, h("div", { class: "row gap wrap" }, h("strong", {}, s.fa), A.phaseChip(s.ph)), h("div", { class: "small" }, s.how),
          h("div", { class: "row gap wrap mt" },
            s.k === "S1" && !topic.kind ? kindPicker(topic) : null,
            s.core.map(function (tid) { var n = S.all("ex", function (e) { return e.topic === topic.id && e.tid === tid && e.status === "done"; }).length;
              return h("button", { class: "tlink" + (n ? " has" : ""), style: { "--pc": "var(--p" + A.phaseOf(tid) + ")" }, onclick: function () { var e = A.newEx(tid, topic.id); A.go("tech", tid, "ws:" + e.id); } }, h("b", {}, fa(tid)), " ", A.TM[tid].fa, n ? " ✓" : ""); }),
            s.refs.map(function (ref) { return refAction(ref, topic, st); })))));
    });
    return wrap;
  };
  function kindPicker(topic) {
    return h("select", { "aria-label": "نوع", onchange: function (e) { topic.kind = e.target.value; S.put(topic); A.render(); } }, h("option", { value: "" }, "نوع این مفهوم برای تو؟"), FT.map(function (f) { return h("option", { value: f }, f.split(":")[0]); }));
  }
  function refAction(ref, topic, st) {
    if (ref === "P11") return h("button", { class: "tlink proto", onclick: function () { if (st.p11) A.go("proto", "P11", st.p11.id); else A.startProto("P11", { topic: topic.id, preset: { fruit: topic.title, ftype: topic.kind || "" } }); } }, "بیان دیگر");
    if (ref === "P1") return h("button", { class: "tlink proto", onclick: function () { A.startProto("P1", { topic: topic.id, preset: { src: topic.src || "" } }); } }, "۵ خط دلتا");
    if (["P8", "P6", "P7", "P5", "P9", "P4", "P2"].indexOf(ref) >= 0) return h("button", { class: "tlink proto", onclick: function () { A.startProto(ref, { topic: topic.id, preset: ref === "P8" ? { course: topic.src || topic.title } : ref === "P7" ? { p: topic.title } : ref === "P5" ? { concept: topic.title } : {} }); } }, A.PM[ref].fa.split(":")[0]);
    if (ref === "P3") return h("button", { class: "tlink proto", onclick: function () { if (!S.all("sched", function (s) { return s.topic === topic.id; }).length) A.start137(topic.id, topic.title); A.startProto("P3", { topic: topic.id, preset: { topic: topic.title } }); } }, "برگه سفید ۱-۳-۷");
    return A.refChip(ref);
  }
})(APP);
