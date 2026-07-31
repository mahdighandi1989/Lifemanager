import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
  ACTION_COLORS,
  actionLabel,
  activityLink,
  activityWhat,
  formatWhen,
} from '../lib/activityLog';

/**
 * ActivityLogPanel — the per-section «لاگ» view (لاگ فعالیت‌های همین بخش).
 *
 * Two modes:
 *  - entityType + entityId → GET /api/activity-log/entity/{type}/{id}
 *    (one record's trail, including child events via the owning-context match)
 *  - entityType only (comma-separated ok) → GET /api/activity-log?entity_type=…
 *    (a whole section's trail, e.g. all task events on the Tasks page)
 *
 * Rows deep-link to their own section via activityLink — mirrors the global
 * /activity-log page so the two stay consistent.
 */
function ActivityLogPanel({ entityType, entityId = null, title = 'لاگ فعالیت‌ها', pageSize = 10 }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const load = useCallback(() => {
    const params = { page, page_size: pageSize };
    if (search.trim()) params.search = search.trim();
    const req = entityId
      ? api.get(`/activity-log/entity/${entityType}/${entityId}`, { params })
      : api.get('/activity-log', { params: { ...params, entity_type: entityType } });
    req.then((res) => setData(res.data)).catch(() => setData(null));
  }, [entityType, entityId, page, pageSize, search]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const onSearch = (e) => {
    e.preventDefault();
    if (page === 1) load();
    else setPage(1);
  };

  const exportCsv = () => {
    const params = new URLSearchParams();
    if (entityId) {
      params.set('context_type', entityType);
      params.set('context_id', entityId);
    } else if (entityType) {
      params.set('entity_type', entityType);
    }
    if (search.trim()) params.set('search', search.trim());
    api
      .get(`/activity-log/export.csv?${params.toString()}`, { responseType: 'blob' })
      .then((res) => {
        const url = URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'activity-log.csv';
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {});
  };

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section
      dir="rtl"
      data-testid="activity-log-panel"
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-4"
    >
      <button
        type="button"
        data-testid="activity-log-toggle"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-right"
      >
        <span className="font-semibold text-gray-900">
          📋 {title}
          {data ? ` (${total})` : ''}
        </span>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-3">
          <form onSubmit={onSearch} className="flex flex-wrap items-center gap-2 mb-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در شرح / عنوان…"
              data-testid="activity-log-search"
              className="flex-1 min-w-[10rem] border border-gray-200 rounded-lg p-2 text-sm"
            />
            <button
              type="submit"
              className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 hover:bg-gray-700"
            >
              جستجو
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="bg-green-600 text-white text-sm rounded-lg px-3 py-2 hover:bg-green-700"
            >
              خروجی CSV
            </button>
          </form>

          {!data || data.items.length === 0 ? (
            <p className="text-gray-400 text-sm" data-testid="activity-log-empty">
              فعالیتی ثبت نشده است.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-right text-gray-500 border-b border-gray-100">
                    <th className="py-2 pl-2 font-medium">زمان</th>
                    <th className="py-2 pl-2 font-medium">عملیات</th>
                    <th className="py-2 pl-2 font-medium">مورد</th>
                    <th className="py-2 font-medium">شرح</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((e) => {
                    const link = activityLink(e);
                    return (
                      <tr
                        key={e.id}
                        onClick={() => link && navigate(link)}
                        className={`border-b border-gray-50 align-top ${
                          link ? 'cursor-pointer hover:bg-gray-50' : ''
                        }`}
                      >
                        <td className="py-2 pl-2 text-gray-400 whitespace-nowrap text-xs">
                          {formatWhen(e.display_at || e.created_at)}
                        </td>
                        <td className="py-2 pl-2 whitespace-nowrap">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                              ACTION_COLORS[e.action] || 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {actionLabel(e.action)}
                          </span>
                        </td>
                        <td className="py-2 pl-2 text-gray-700">
                          {activityWhat(e)}
                          {e.entity_label ? (
                            <span className="text-gray-500"> — {e.entity_label}</span>
                          ) : null}
                        </td>
                        <td className="py-2 text-gray-500">{e.detail || ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {total > pageSize && (
            <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
              <span>
                {total} مورد · صفحه {page} از {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40"
                >
                  قبلی
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40"
                >
                  بعدی
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default ActivityLogPanel;
