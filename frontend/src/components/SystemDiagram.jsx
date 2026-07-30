/**
 * SystemDiagram — دیاگرام زندهٔ برنامه (نقشهٔ سیستم، تب اصلی).
 *
 * همهٔ اجزای برنامه — صفحه‌ها، روترها، سرویس‌ها، مدل‌ها، موتورهای
 * پس‌زمینه و کارهای زمان‌بندی‌شده — به شکل کارت، و روابط‌شان به شکل سیم.
 * داده از GET /api/system-map/graph می‌آید که با درون‌نگری از خودِ کد
 * ساخته می‌شود، پس با هر تغییر کد، نقشه خودبه‌خود عوض می‌شود.
 *
 * «نور در سیم‌ها» واقعی است، نه نمایشی: هر ۳ ثانیه /system-map/activity
 * پرس‌وجو می‌شود که از میان‌افزار نبض (ترافیک واقعی درخواست‌ها) تغذیه
 * می‌کند. فقط چیزی که واقعاً اندازه گرفته می‌شود روشن می‌شود:
 *   - کارت روترها: درخواست‌های واقعی چند ثانیهٔ اخیر (چشمک = جریان جاری)
 *   - سیم صفحه→روتر: عبور واقعی درخواست از آن صفحه (نقطهٔ نور متحرک)
 *   - موتورها: زنده/مردهٔ واقعی asyncio task در همین لحظه
 * سیم‌های ساختاری (import/FK) خاکستری می‌مانند چون عبور لحظه‌ای‌شان
 * اندازه‌گیری نمی‌شود — روشن‌کردن دروغین آن‌ها ممنوع است.
 *
 * کشیدن کارت‌ها و کشیدن سیم دستی بین دو کارت، از طریق
 * POST /system-map/layout و /system-map/wires در بک‌اند ذخیره و همگام
 * می‌شود (پرسش مالک: «آیا می‌شود اتصال را در بک‌اند هم همگام کرد؟» — بله؛
 * اتصال به‌عنوان رابطهٔ ذخیره‌شده در دیتابیس ثبت می‌شود).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { ROUTES } from '../lib/routesMeta';

const NODE_W = 172;
const NODE_H = 40;
const ROW_GAP = 50;
const COL_X = { model: 40, service: 360, router: 700, page: 1040 };
const HOT_SECONDS = 6; // «جریان جاری» — light + blink
const KIND_META = {
  page: { label: 'صفحه‌ها', fill: '#eff6ff', stroke: '#3b82f6', text: '#1d4ed8' },
  router: { label: 'روترها (API)', fill: '#ecfdf5', stroke: '#10b981', text: '#047857' },
  service: { label: 'سرویس‌ها', fill: '#fefce8', stroke: '#eab308', text: '#a16207' },
  model: { label: 'مدل‌ها (دیتابیس)', fill: '#faf5ff', stroke: '#a855f7', text: '#7e22ce' },
  engine: { label: 'موتورهای پس‌زمینه', fill: '#fff1f2', stroke: '#f43f5e', text: '#be123c' },
  job: { label: 'کارهای زمان‌بندی', fill: '#fff7ed', stroke: '#f97316', text: '#c2410c' },
};
const EDGE_KIND_META = {
  calls: { label: 'صفحه ← API', color: '#3b82f6', defaultOn: true },
  traffic: { label: 'سیم‌های یادگرفته از ترافیک', color: '#0ea5e9', defaultOn: true },
  imports: { label: 'وابستگی کد (import)', color: '#9ca3af', defaultOn: true },
  fk: { label: 'روابط دیتابیس (FK)', color: '#c084fc', defaultOn: false },
  runs: { label: 'موتور ← سرویس', color: '#fb7185', defaultOn: true },
  manual: { label: 'سیم‌های دست‌ساز', color: '#f59e0b', defaultOn: true },
};

// pattern → page-component lookup (e.g. '/lists/:listId' → 'ListDetail'),
// used to translate traffic pairs into diagram node ids.
const PATTERN_TO_PAGE = ROUTES.reduce((acc, r) => {
  acc[r.path] = r.page;
  return acc;
}, {});

function edgePath(a, b) {
  const x1 = a.x + NODE_W;
  const y1 = a.y + NODE_H / 2;
  const x2 = b.x;
  const y2 = b.y + NODE_H / 2;
  if (x2 >= x1) {
    const dx = Math.max(40, (x2 - x1) / 2);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  }
  // target is to the left — leave from our left edge, arrive at their right.
  const lx1 = a.x;
  const lx2 = b.x + NODE_W;
  const dx = Math.max(40, (lx1 - lx2) / 2);
  return `M ${lx1} ${y1} C ${lx1 - dx} ${y1}, ${lx2 + dx} ${y2}, ${lx2} ${y2}`;
}

function autoLayout(nodes) {
  const positions = {};
  const groupOrder = { public: 0, daily: 1, life: 2, life_pages: 3, tools: 4, system: 5 };
  const byCol = { page: [], router: [], service: [], model: [], actors: [] };
  nodes.forEach((n) => {
    if (n.kind === 'page') byCol.page.push(n);
    else if (n.kind === 'router') byCol.router.push(n);
    else if (n.kind === 'service') byCol.service.push(n);
    else if (n.kind === 'model') byCol.model.push(n);
    else byCol.actors.push(n); // engines + jobs share the pages column, below
  });
  byCol.page.sort((a, b) => {
    const ga = groupOrder[a.detail?.group] ?? 9;
    const gb = groupOrder[b.detail?.group] ?? 9;
    return ga !== gb ? ga - gb : (a.sub || '').localeCompare(b.sub || '');
  });
  ['router', 'service', 'model'].forEach((k) =>
    byCol[k].sort((a, b) => (a.sub || '').localeCompare(b.sub || '')),
  );
  byCol.actors.sort((a, b) =>
    a.kind === b.kind ? (a.sub || '').localeCompare(b.sub || '') : a.kind === 'engine' ? -1 : 1,
  );
  ['page', 'router', 'service', 'model'].forEach((k) => {
    byCol[k].forEach((n, i) => {
      positions[n.id] = { x: COL_X[k === 'page' ? 'page' : k], y: 24 + i * ROW_GAP };
    });
  });
  const actorsY0 = 24 + byCol.page.length * ROW_GAP + 60;
  byCol.actors.forEach((n, i) => {
    positions[n.id] = { x: COL_X.page, y: actorsY0 + i * ROW_GAP };
  });
  return positions;
}

function SystemDiagram({ currentPath }) {
  const [graph, setGraph] = useState(null);
  const [error, setError] = useState(false);
  const [activity, setActivity] = useState(null);
  const [positions, setPositions] = useState({});
  const [manualWires, setManualWires] = useState([]);
  const [hiddenKinds, setHiddenKinds] = useState([]);
  const [edgeKindsOn, setEdgeKindsOn] = useState(() => {
    const initial = {};
    Object.entries(EDGE_KIND_META).forEach(([k, v]) => {
      initial[k] = v.defaultOn;
    });
    return initial;
  });
  const [onlyActive, setOnlyActive] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [wireDraft, setWireDraft] = useState(null); // {source, x, y}
  const [view, setView] = useState({ x: 0, y: 0, k: 0.75 });
  const svgRef = useRef(null);
  const dragRef = useRef(null); // {mode:'node'|'pan', ...}
  const saveTimerRef = useRef(null);

  // ── data ────────────────────────────────────────────────────────────────
  const loadGraph = useCallback(() => {
    api
      .get('/system-map/graph')
      .then((res) => {
        const data = res.data || {};
        setGraph(data);
        setManualWires(data.manual_wires || []);
        const auto = autoLayout(data.nodes || []);
        const saved = data.layout?.positions || {};
        setPositions({ ...auto, ...saved });
        if (Array.isArray(data.layout?.hidden_kinds)) {
          setHiddenKinds(data.layout.hidden_kinds);
        }
        setError(false);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  useEffect(() => {
    let alive = true;
    const poll = () =>
      api
        .get('/system-map/activity', { params: { window: 60 } })
        .then((res) => {
          if (alive) setActivity(res.data);
        })
        .catch(() => {});
    poll();
    const id = setInterval(poll, 3000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // ── derived ─────────────────────────────────────────────────────────────
  const nodes = useMemo(() => graph?.nodes || [], [graph]);
  const nodeById = useMemo(() => {
    const map = {};
    nodes.forEach((n) => {
      map[n.id] = n;
    });
    return map;
  }, [nodes]);

  // activity keyed to node ids — ONLY measured signals light up.
  const pulse = useMemo(() => {
    const nodeAge = {}; // id → seconds since last real event
    const edgeAge = {}; // "source→target" → seconds
    (activity?.pairs || []).forEach((p) => {
      const page = PATTERN_TO_PAGE[p.page];
      const routerId = `router:${p.router_file}`;
      if (page) {
        const pageId = `page:${page}`;
        const key = `${pageId}→${routerId}`;
        edgeAge[key] = Math.min(edgeAge[key] ?? Infinity, p.last_ago);
        nodeAge[pageId] = Math.min(nodeAge[pageId] ?? Infinity, p.last_ago);
      }
    });
    Object.entries(activity?.routers || {}).forEach(([file, info]) => {
      if (info.last_ago != null) {
        const id = `router:${file}`;
        nodeAge[id] = Math.min(nodeAge[id] ?? Infinity, info.last_ago);
      }
    });
    const engineAlive = {};
    (activity?.engines || graph?.engines || []).forEach((e) => {
      engineAlive[`engine:${e.key}`] = !!e.alive;
    });
    return { nodeAge, edgeAge, engineAlive };
  }, [activity, graph]);

  const trafficEdges = useMemo(() => {
    const seen = new Set();
    const list = [];
    (graph?.learned_wires || []).forEach((w) => {
      const page = PATTERN_TO_PAGE[w.page];
      if (!page) return;
      const source = `page:${page}`;
      const target = `router:${w.router_file}`;
      const key = `${source}→${target}`;
      if (seen.has(key)) return;
      seen.add(key);
      list.push({ source, target, kind: 'traffic' });
    });
    return list;
  }, [graph]);

  const allEdges = useMemo(() => {
    const structural = graph?.edges || [];
    const structuralKeys = new Set(structural.map((e) => `${e.source}→${e.target}`));
    // traffic wires that duplicate a static call edge stay hidden — the
    // static wire simply lights up instead.
    const traffic = trafficEdges.filter((e) => !structuralKeys.has(`${e.source}→${e.target}`));
    const manual = (manualWires || []).map((w) => ({ ...w, kind: 'manual' }));
    return [...structural, ...traffic, ...manual];
  }, [graph, trafficEdges, manualWires]);

  const searchLower = search.trim().toLowerCase();
  const matchesSearch = useCallback(
    (n) =>
      !searchLower ||
      (n.label || '').toLowerCase().includes(searchLower) ||
      (n.sub || '').toLowerCase().includes(searchLower),
    [searchLower],
  );

  const isNodeActive = useCallback(
    (id) => {
      const age = pulse.nodeAge[id];
      if (age != null && age <= 60) return true;
      return !!pulse.engineAlive[id];
    },
    [pulse],
  );

  const visibleNodes = useMemo(
    () =>
      nodes.filter(
        (n) =>
          !hiddenKinds.includes(n.kind) &&
          positions[n.id] &&
          (!onlyActive || isNodeActive(n.id)),
      ),
    [nodes, hiddenKinds, positions, onlyActive, isNodeActive],
  );
  const visibleIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  const neighborIds = useMemo(() => {
    if (!selected) return null;
    const set = new Set([selected]);
    allEdges.forEach((e) => {
      if (e.source === selected) set.add(e.target);
      if (e.target === selected) set.add(e.source);
    });
    return set;
  }, [selected, allEdges]);

  const visibleEdges = useMemo(
    () =>
      allEdges.filter(
        (e) =>
          edgeKindsOn[e.kind] !== false &&
          visibleIds.has(e.source) &&
          visibleIds.has(e.target),
      ),
    [allEdges, edgeKindsOn, visibleIds],
  );

  // ── viewport helpers ────────────────────────────────────────────────────
  const clientToWorld = useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left - view.x) / view.k,
        y: (clientY - rect.top - view.y) / view.k,
      };
    },
    [view],
  );

  const fitView = useCallback(() => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || visibleNodes.length === 0) return;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    visibleNodes.forEach((n) => {
      const p = positions[n.id];
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x + NODE_W);
      maxY = Math.max(maxY, p.y + NODE_H);
    });
    const k = Math.min(
      2,
      Math.max(0.1, Math.min(rect.width / (maxX - minX + 80), rect.height / (maxY - minY + 80))),
    );
    setView({ x: -minX * k + 40, y: -minY * k + 40, k });
  }, [visibleNodes, positions]);

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      setView((v) => {
        const k = Math.min(2.5, Math.max(0.1, v.k * Math.exp(-e.deltaY * 0.0012)));
        const wx = (cx - v.x) / v.k;
        const wy = (cy - v.y) / v.k;
        return { k, x: cx - wx * k, y: cy - wy * k };
      });
    },
    [],
  );

  // react's synthetic onWheel is passive — attach natively to preventDefault.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ── persistence ─────────────────────────────────────────────────────────
  const scheduleSave = useCallback(
    (nextPositions, nextHidden) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        api
          .post('/system-map/layout', {
            positions: nextPositions,
            view: {},
            hidden_kinds: nextHidden,
          })
          .catch(() => {});
      }, 800);
    },
    [],
  );

  const addWire = useCallback(
    (source, target) => {
      api
        .post('/system-map/wires', { action: 'add', source, target, label: '' })
        .then((res) => setManualWires(res.data?.manual_wires || []))
        .catch(() => {});
    },
    [],
  );

  const removeWire = useCallback(
    (source, target) => {
      api
        .post('/system-map/wires', { action: 'remove', source, target })
        .then((res) => setManualWires(res.data?.manual_wires || []))
        .catch(() => {});
    },
    [],
  );

  // ── pointer interactions ────────────────────────────────────────────────
  const onNodePointerDown = useCallback(
    (e, id) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      const world = clientToWorld(e.clientX, e.clientY);
      const p = positions[id];
      dragRef.current = {
        mode: 'node',
        id,
        offsetX: world.x - p.x,
        offsetY: world.y - p.y,
        moved: false,
      };
    },
    [clientToWorld, positions],
  );

  const onPortPointerDown = useCallback(
    (e, id) => {
      e.stopPropagation();
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      const world = clientToWorld(e.clientX, e.clientY);
      dragRef.current = { mode: 'wire', source: id };
      setWireDraft({ source: id, x: world.x, y: world.y });
    },
    [clientToWorld],
  );

  const onBackgroundPointerDown = useCallback((e) => {
    dragRef.current = {
      mode: 'pan',
      startX: e.clientX,
      startY: e.clientY,
      viewX: view.x,
      viewY: view.y,
      moved: false,
    };
  }, [view]);

  const onPointerMove = useCallback(
    (e) => {
      const drag = dragRef.current;
      if (!drag) return;
      if (drag.mode === 'node') {
        const world = clientToWorld(e.clientX, e.clientY);
        drag.moved = true;
        setPositions((prev) => ({
          ...prev,
          [drag.id]: { x: world.x - drag.offsetX, y: world.y - drag.offsetY },
        }));
      } else if (drag.mode === 'pan') {
        drag.moved = true;
        setView((v) => ({
          ...v,
          x: drag.viewX + (e.clientX - drag.startX),
          y: drag.viewY + (e.clientY - drag.startY),
        }));
      } else if (drag.mode === 'wire') {
        const world = clientToWorld(e.clientX, e.clientY);
        setWireDraft((w) => (w ? { ...w, x: world.x, y: world.y } : w));
      }
    },
    [clientToWorld],
  );

  const onPointerUp = useCallback(
    (e) => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag) return;
      if (drag.mode === 'node') {
        if (!drag.moved) {
          setSelected((s) => (s === drag.id ? null : drag.id));
        } else {
          setPositions((prev) => {
            scheduleSave(prev, hiddenKinds);
            return prev;
          });
        }
      } else if (drag.mode === 'wire') {
        setWireDraft(null);
        // pointer capture keeps enter/leave from firing — resolve the drop
        // target from the actual element under the cursor instead.
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const targetId = el?.closest?.('[data-node-id]')?.getAttribute('data-node-id');
        if (targetId && targetId !== drag.source) addWire(drag.source, targetId);
      } else if (drag.mode === 'pan' && !drag.moved) {
        setSelected(null);
      }
    },
    [scheduleSave, hiddenKinds, addWire],
  );

  const toggleKind = useCallback(
    (kind) => {
      setHiddenKinds((prev) => {
        const next = prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind];
        scheduleSave(positions, next);
        return next;
      });
    },
    [positions, scheduleSave],
  );

  // ── render ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <p className="text-gray-400 text-sm" data-testid="system-diagram-error">
        دیاگرام زنده در دسترس نیست.
      </p>
    );
  }
  if (!graph) {
    return (
      <p className="text-gray-400 text-sm" data-testid="system-diagram-loading">
        در حال ساختن نقشه از روی خودِ کد…
      </p>
    );
  }

  const selectedNode = selected ? nodeById[selected] : null;
  const currentPage = PATTERN_TO_PAGE[currentPath] || null;
  const activeCount = visibleNodes.filter((n) => isNodeActive(n.id)).length;

  return (
    <div dir="rtl" data-testid="system-diagram">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
        <span
          className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1"
          data-testid="system-diagram-live"
        >
          <span className={`w-2 h-2 rounded-full ${activity ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
          نبض زنده
          <span className="text-gray-400" dir="ltr">{activeCount}</span>
          <span className="text-gray-400">جزء فعال</span>
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو در نقشه…"
          data-testid="system-diagram-search"
          className="border border-gray-200 rounded-full px-3 py-1 text-xs w-40 focus:outline-none focus:ring-1 focus:ring-blue-300"
        />
        {Object.entries(KIND_META).map(([kind, meta]) => (
          <button
            key={kind}
            type="button"
            onClick={() => toggleKind(kind)}
            data-testid={`system-diagram-kind-${kind}`}
            className={`rounded-full px-2.5 py-1 border transition-colors ${
              hiddenKinds.includes(kind)
                ? 'bg-gray-100 text-gray-400 border-gray-200 line-through'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
            style={hiddenKinds.includes(kind) ? {} : { borderColor: meta.stroke, color: meta.text }}
          >
            {meta.label}
            <span className="text-gray-400 mx-1" dir="ltr">
              {graph.stats?.by_kind?.[kind] ?? 0}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOnlyActive((v) => !v)}
          data-testid="system-diagram-only-active"
          className={`rounded-full px-2.5 py-1 border ${
            onlyActive ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-white border-gray-300 text-gray-600'
          }`}
        >
          فقط فعال‌ها
        </button>
        <button type="button" onClick={fitView} className="rounded-full px-2.5 py-1 border bg-white border-gray-300 text-gray-600">
          نمای کامل
        </button>
        <button type="button" onClick={loadGraph} className="rounded-full px-2.5 py-1 border bg-white border-gray-300 text-gray-600">
          بازخوانی نقشه
        </button>
      </div>

      {/* edge-kind legend / toggles */}
      <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px]">
        {Object.entries(EDGE_KIND_META).map(([kind, meta]) => (
          <button
            key={kind}
            type="button"
            onClick={() => setEdgeKindsOn((prev) => ({ ...prev, [kind]: !prev[kind] }))}
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 border ${
              edgeKindsOn[kind] ? 'bg-white border-gray-300 text-gray-600' : 'bg-gray-100 border-gray-200 text-gray-400'
            }`}
          >
            <span className="inline-block w-4 h-0.5 rounded" style={{ background: meta.color, opacity: edgeKindsOn[kind] ? 1 : 0.3 }} />
            {meta.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        {/* canvas */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative" style={{ height: '70vh' }}>
          <svg
            ref={svgRef}
            className="w-full h-full touch-none select-none"
            style={{ cursor: dragRef.current?.mode === 'pan' ? 'grabbing' : 'grab' }}
            onPointerDown={onBackgroundPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
              {/* wires */}
              {visibleEdges.map((edge) => {
                const a = positions[edge.source];
                const b = positions[edge.target];
                if (!a || !b) return null;
                const key = `${edge.source}→${edge.target}`;
                const age = pulse.edgeAge[key];
                const isHot = age != null && age <= HOT_SECONDS;
                const isWarm = age != null && age <= 60;
                const meta = EDGE_KIND_META[edge.kind] || EDGE_KIND_META.imports;
                const dimmed =
                  (neighborIds && !(neighborIds.has(edge.source) && neighborIds.has(edge.target))) ||
                  (searchLower && !(matchesSearch(nodeById[edge.source] || {}) || matchesSearch(nodeById[edge.target] || {})));
                const d = edgePath(a, b);
                return (
                  <g key={`${key}:${edge.kind}`} opacity={dimmed ? 0.08 : isWarm ? 1 : 0.45}>
                    <path
                      d={d}
                      fill="none"
                      stroke={isWarm ? '#0284c7' : meta.color}
                      strokeWidth={isHot ? 2.5 : isWarm ? 2 : 1.2}
                      strokeDasharray={edge.kind === 'manual' ? '6 4' : undefined}
                      style={{ cursor: edge.kind === 'manual' ? 'pointer' : undefined }}
                      onPointerDown={(e) => {
                        if (edge.kind !== 'manual') return;
                        e.stopPropagation();
                        // eslint-disable-next-line no-alert
                        if (window.confirm('این سیم دست‌ساز حذف شود؟')) {
                          removeWire(edge.source, edge.target);
                        }
                      }}
                    />
                    {isHot && (
                      // نور متحرک — only on wires with real traffic right now
                      <circle r="4" fill="#38bdf8">
                        <animateMotion dur="1.4s" repeatCount="indefinite" path={d} />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* wire being drawn */}
              {wireDraft && positions[wireDraft.source] && (
                <path
                  d={`M ${positions[wireDraft.source].x} ${positions[wireDraft.source].y + NODE_H / 2} L ${wireDraft.x} ${wireDraft.y}`}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              )}

              {/* cards */}
              {visibleNodes.map((node) => {
                const p = positions[node.id];
                const meta = KIND_META[node.kind] || KIND_META.service;
                const age = pulse.nodeAge[node.id];
                const isHot = (age != null && age <= HOT_SECONDS) || pulse.engineAlive[node.id];
                const isWarm = age != null && age <= 60;
                const dead = node.kind === 'engine' && pulse.engineAlive[node.id] === false;
                const dimmed =
                  (neighborIds && !neighborIds.has(node.id)) ||
                  (searchLower && !matchesSearch(node));
                const isHere = node.kind === 'page' && currentPage && node.id === `page:${currentPage}`;
                return (
                  <g
                    key={node.id}
                    data-node-id={node.id}
                    data-testid={`diagram-node-${node.id}`}
                    transform={`translate(${p.x},${p.y})`}
                    opacity={dimmed ? 0.15 : 1}
                    style={{ cursor: 'move' }}
                    onPointerDown={(e) => onNodePointerDown(e, node.id)}
                  >
                    <rect
                      width={NODE_W}
                      height={NODE_H}
                      rx="8"
                      fill={meta.fill}
                      stroke={selected === node.id ? '#111827' : isWarm || isHot ? '#0284c7' : meta.stroke}
                      strokeWidth={selected === node.id ? 2.5 : isHot ? 2.5 : 1.2}
                      className={isHot ? 'animate-pulse' : undefined}
                    />
                    {/* activity dot: real traffic/liveness only. The blink is
                        SMIL (animate r/opacity) — CSS animate-ping scales from
                        the SVG origin, not the circle center, and jumps. */}
                    <circle
                      cx={NODE_W - 10}
                      cy={9}
                      r={4}
                      fill={dead ? '#ef4444' : isHot ? '#10b981' : isWarm ? '#f59e0b' : '#d1d5db'}
                    >
                      {isHot && (
                        <>
                          <animate attributeName="r" values="4;7;4" dur="1.1s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0.4;1" dur="1.1s" repeatCount="indefinite" />
                        </>
                      )}
                    </circle>
                    <text
                      x={NODE_W / 2}
                      y={17}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill={meta.text}
                    >
                      {(node.label || '').slice(0, 24)}
                    </text>
                    <text
                      x={NODE_W / 2}
                      y={32}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#9ca3af"
                      direction="ltr"
                    >
                      {(node.sub || '').slice(0, 30)}
                    </text>
                    {isHere && (
                      <text x={NODE_W / 2} y={-6} textAnchor="middle" fontSize="10" fill="#1d4ed8" fontWeight="700">
                        ⬇ شما این‌جایید
                      </text>
                    )}
                    {/* connection port — drag from here to another card */}
                    <circle
                      cx={0}
                      cy={NODE_H / 2}
                      r={6}
                      fill="#fff"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      style={{ cursor: 'crosshair' }}
                      onPointerDown={(e) => onPortPointerDown(e, node.id)}
                    />
                  </g>
                );
              })}
            </g>
          </svg>
          <div className="absolute bottom-2 left-2 flex gap-1" dir="ltr">
            <button type="button" className="w-7 h-7 bg-white border border-gray-200 rounded text-gray-600" onClick={() => setView((v) => ({ ...v, k: Math.min(2.5, v.k * 1.2) }))}>+</button>
            <button type="button" className="w-7 h-7 bg-white border border-gray-200 rounded text-gray-600" onClick={() => setView((v) => ({ ...v, k: Math.max(0.1, v.k / 1.2) }))}>−</button>
          </div>
        </div>

        {/* side panel */}
        {selectedNode && (
          <div className="w-72 shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm" data-testid="system-diagram-panel">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-900">{selectedNode.label}</h3>
              <button type="button" className="text-gray-400 text-xs" onClick={() => setSelected(null)}>✕</button>
            </div>
            <p className="text-[11px] text-gray-400 mb-2">
              {KIND_META[selectedNode.kind]?.label}
              {selectedNode.sub ? <span className="mx-1" dir="ltr">{selectedNode.sub}</span> : null}
            </p>
            {pulse.nodeAge[selectedNode.id] != null && (
              <p className="text-xs text-emerald-600 mb-2">
                آخرین جریان واقعی: <span dir="ltr">{Math.round(pulse.nodeAge[selectedNode.id])}s</span> پیش
              </p>
            )}
            {selectedNode.kind === 'engine' && (
              <p className={`text-xs mb-2 ${pulse.engineAlive[selectedNode.id] ? 'text-emerald-600' : 'text-red-500'}`}>
                {pulse.engineAlive[selectedNode.id] ? 'در حال اجرا (زنده)' : 'خاموش'}
              </p>
            )}
            {selectedNode.kind === 'page' && (
              <div className="mb-2">
                {(selectedNode.detail?.paths || []).map((p) => (
                  <div key={p} className="text-xs text-gray-500" dir="ltr">{p}</div>
                ))}
                {!String(selectedNode.detail?.paths?.[0] || '').includes(':') && (
                  <Link to={selectedNode.detail.paths[0]} className="text-blue-600 text-xs hover:underline">
                    برو به این صفحه ←
                  </Link>
                )}
              </div>
            )}
            {selectedNode.kind === 'router' && (
              <div className="mb-2 max-h-48 overflow-y-auto border border-gray-100 rounded p-2" dir="ltr">
                {(selectedNode.detail?.endpoints || []).map((ep) => (
                  <div key={`${ep.methods.join(',')}:${ep.path}`} className="text-[10px] text-gray-500 font-mono">
                    {ep.methods.join(',')} {ep.path}
                  </div>
                ))}
              </div>
            )}
            {selectedNode.kind === 'model' && (
              <div className="mb-2 text-xs text-gray-500" dir="ltr">
                {(selectedNode.detail?.tables || []).map((t) => (
                  <div key={t} className="font-mono">⛁ {t}</div>
                ))}
                {(selectedNode.detail?.classes || []).map((c) => (
                  <div key={c} className="text-gray-400">{c}</div>
                ))}
              </div>
            )}
            {selectedNode.kind === 'job' && selectedNode.detail?.interval_minutes != null && (
              <p className="text-xs text-gray-500 mb-2">
                هر <span dir="ltr">{selectedNode.detail.interval_minutes}</span> دقیقه
              </p>
            )}
            {selectedNode.detail?.file && (
              <p className="text-[10px] text-gray-400 font-mono mb-2" dir="ltr">{selectedNode.detail.file}</p>
            )}
            {/* manual wires on this node */}
            {manualWires.some((w) => w.source === selectedNode.id || w.target === selectedNode.id) && (
              <div className="border-t border-gray-100 pt-2 mt-2">
                <p className="text-xs font-semibold text-gray-600 mb-1">سیم‌های دست‌ساز</p>
                {manualWires
                  .filter((w) => w.source === selectedNode.id || w.target === selectedNode.id)
                  .map((w) => {
                    const otherId = w.source === selectedNode.id ? w.target : w.source;
                    return (
                      <div key={`${w.source}→${w.target}`} className="flex items-center justify-between text-xs text-gray-500 py-0.5">
                        <span>{nodeById[otherId]?.label || otherId}</span>
                        <button
                          type="button"
                          className="text-red-400 hover:text-red-600"
                          onClick={() => removeWire(w.source, w.target)}
                        >
                          حذف
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
            <p className="text-[10px] text-gray-400 mt-3 leading-5">
              برای کشیدن سیم، از دایرهٔ لبهٔ کارت بگیر و روی کارت دیگری رها کن — اتصال در بک‌اند ذخیره می‌شود.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SystemDiagram;
