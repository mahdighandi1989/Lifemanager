/**
 * Self-Improvement (خودسازی) dashboard.
 *
 * Single-page view that drops the user into today's check-in for all
 * four خودسازی sub-lists:
 *   - محاسبه میان و پایان هفته  (main / weekly review)
 *   - تقویت اراده              (28 daily habits)
 *   - عشق به خدا               (12 daily habits)
 *   - ترس‌ها و شجاعت           (40 daily habits)
 *
 * Backend contract (mounted under app/routes/self_improvement.py):
 *   GET  /api/self-improvement/overview                  → grouped payload
 *   POST /api/self-improvement/daily-update              → tick one/many
 *
 * Each item shows:
 *   - a checkbox (done ↔ pending)
 *   - an "AI" badge when the row was auto-ticked by the nightly task
 *   - the AI's reason on hover (title attr) so the user can audit it.
 *
 * The "select multiple → bulk tick" UX maps the user's
 * "برخی کارها هم جوریه که ممکن تیک چند تارو بزنه" requirement.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../lib/api';

const STATUS_DONE = 'done';
const STATUS_PENDING = 'pending';
const STATUS_AUTO_DONE = 'auto_done';

function StatusBadge({ status, isAuto }) {
  if (status === STATUS_AUTO_DONE || (status === STATUS_DONE && isAuto)) {
    return (
      <span
        className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium"
        title="این آیتم توسط هوش مصنوعی به‌طور خودکار تیک خورده"
      >
        AI
      </span>
    );
  }
  return null;
}

function SectionHeader({ section }) {
  const pct = section.total
    ? Math.round((section.completed_today / section.total) * 100)
    : 0;
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold text-gray-900">{section.label_fa}</h2>
      <div className="text-xs text-gray-500">
        امروز: <span className="font-semibold text-blue-600">{section.completed_today}</span>
        {' / '}
        <span>{section.total}</span>
        {' ('}
        <span className="font-medium">{pct}%</span>
        {')'}
        <Link
          to={`/lists/${section.list_id}`}
          className="ms-2 text-blue-600 hover:underline"
          data-testid={`si-open-list-${section.category}`}
        >
          ویرایش لیست
        </Link>
      </div>
    </div>
  );
}

function ItemRow({ item, selected, onToggleSelect, onToggleStatus }) {
  const checked = item.status === STATUS_DONE || item.status === STATUS_AUTO_DONE;
  return (
    <li
      className={`flex items-start gap-3 px-3 py-2 rounded-md border ${
        selected ? 'border-blue-300 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'
      }`}
      data-testid={`si-item-${item.item_id}`}
    >
      <input
        type="checkbox"
        aria-label={`select-${item.item_id}`}
        checked={selected}
        onChange={() => onToggleSelect(item.item_id)}
        className="mt-1 accent-blue-500"
        data-testid={`si-select-${item.item_id}`}
      />
      <button
        type="button"
        onClick={() => onToggleStatus(item.item_id, checked)}
        className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border ${
          checked
            ? 'bg-green-500 border-green-600 text-white'
            : 'border-gray-300 bg-white text-transparent'
        }`}
        data-testid={`si-tick-${item.item_id}`}
        aria-pressed={checked}
        aria-label={checked ? 'unmark' : 'mark done'}
      >
        ✓
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm ${checked ? 'text-gray-400 line-through' : 'text-gray-800'}`}
          >
            {item.content}
          </span>
          <StatusBadge status={item.status} isAuto={item.is_auto} />
        </div>
        {item.ai_reason && (
          <p className="text-[11px] text-purple-600 mt-1" title={item.ai_reason}>
            دلیل AI: {item.ai_reason}
          </p>
        )}
      </div>
    </li>
  );
}

function CategorySection({ section, selectedIds, onToggleSelect, onToggleStatus }) {
  return (
    <section
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
      data-testid={`si-section-${section.category}`}
    >
      <SectionHeader section={section} />
      <ul className="space-y-1.5">
        {section.items.map((item) => (
          <ItemRow
            key={item.item_id}
            item={item}
            selected={selectedIds.has(item.item_id)}
            onToggleSelect={onToggleSelect}
            onToggleStatus={onToggleStatus}
          />
        ))}
        {section.items.length === 0 && (
          <li className="text-sm text-gray-400">آیتمی در این لیست وجود ندارد.</li>
        )}
      </ul>
    </section>
  );
}

function HeaderCard({ overview }) {
  const pct = overview.items_total
    ? Math.round((overview.completed_today_total / overview.items_total) * 100)
    : 0;
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">خودسازی</h1>
          <p className="text-sm text-gray-600 mt-1">
            بررسی روزانه ، تقویت اراده ، عشق به خدا و رویارویی با ترس ها.
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-700" data-testid="si-summary-total">
            {overview.completed_today_total} / {overview.items_total}
          </div>
          <div className="text-xs text-gray-500 mt-1">{pct}% تکمیل امروز</div>
        </div>
      </div>
      <div className="mt-3">
        <Link
          to="/self-improvement/profile"
          className="text-sm text-blue-600 hover:underline"
          data-testid="si-link-profile"
        >
          مشاهدهٔ نمودارها و تحلیل پروفایل ←
        </Link>
      </div>
    </div>
  );
}

export default function SelfImprovement() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [busy, setBusy] = useState(false);

  const loadOverview = useCallback(async () => {
    try {
      const res = await api.get('/self-improvement/overview');
      setOverview(res.data);
      setError(null);
    } catch (err) {
      setError('خطا در بارگذاری اطلاعات خودسازی');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const sections = overview?.sections ?? [];

  const onToggleSelect = useCallback((itemId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const applyUpdates = useCallback(async (updates) => {
    setBusy(true);
    try {
      await api.post('/self-improvement/daily-update', { updates });
      await loadOverview();
    } catch (err) {
      setError('خطا در ثبت وضعیت');
    } finally {
      setBusy(false);
    }
  }, [loadOverview]);

  const onToggleStatus = useCallback(async (itemId, currentlyDone) => {
    await applyUpdates([
      { item_id: itemId, status: currentlyDone ? STATUS_PENDING : STATUS_DONE },
    ]);
  }, [applyUpdates]);

  const bulkMark = useCallback(async (status) => {
    if (selectedIds.size === 0) return;
    const updates = Array.from(selectedIds).map((id) => ({ item_id: id, status }));
    await applyUpdates(updates);
    setSelectedIds(new Set());
  }, [selectedIds, applyUpdates]);

  const selectedCount = selectedIds.size;
  const headerOverview = useMemo(() => ({
    completed_today_total: overview?.completed_today_total ?? 0,
    items_total: overview?.items_total ?? 0,
  }), [overview]);

  if (loading) {
    return <div className="p-6 text-gray-500" data-testid="si-loading">در حال بارگذاری…</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600" data-testid="si-error">{error}</div>;
  }

  return (
    <div className="p-4 md:p-6" dir="rtl" data-testid="self-improvement-page">
      <HeaderCard overview={headerOverview} />

      {selectedCount > 0 && (
        <div
          className="sticky top-2 z-10 mb-4 flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2"
          data-testid="si-bulk-bar"
        >
          <span className="text-sm text-yellow-800">{selectedCount} مورد انتخاب شده</span>
          <button
            disabled={busy}
            onClick={() => bulkMark(STATUS_DONE)}
            className="text-xs bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 disabled:opacity-50"
            data-testid="si-bulk-done"
          >
            تیک همه
          </button>
          <button
            disabled={busy}
            onClick={() => bulkMark(STATUS_PENDING)}
            className="text-xs bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 disabled:opacity-50"
            data-testid="si-bulk-clear"
          >
            پاک کردن تیک‌ها
          </button>
        </div>
      )}

      <div className="space-y-5">
        {sections.map((section) => (
          <CategorySection
            key={section.category}
            section={section}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>
    </div>
  );
}
