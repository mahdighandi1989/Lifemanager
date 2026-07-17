import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
  ACTION_COLORS,
  ENTITY_FA,
  VERB_FA,
  actionLabel,
  activityLink,
  activityWhat,
  formatWhen,
} from '../lib/activityLog';

const PAGE_SIZE = 50;

// The global لاگ فعالیت‌ها page — the whole program's trail in one table.
// Every row deep-links (via activityLink) to the profile/section it belongs
// to; the same helpers power the per-section ActivityLogPanel so the two
// views stay consistent. Route: /activity-log.
function ActivityLogPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = useCallback(() => {
    const params = { page, page_size: PAGE_SIZE };
    if (action) params.action = action;
    if (entityType) params.entity_type = entityType;
    if (search.trim()) params.search = search.trim();
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    api
      .get('/activity-log', { params })
      .then((res) => {
        setData(res.data);
        setError(null);
      })
      .catch((e) => setError('خطا در دریافت لاگ: ' + (e.message || '')));
  }, [page, action, entityType, search, dateFrom, dateTo]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onFilter = (e) => {
    e.preventDefault();
    if (page === 1) load();
    else setPage(1);
  };

  const exportCsv = () => {
    const params = new URLSearchParams();
    if (action) params.set('action', action);
    if (entityType) params.set('entity_type', entityType);
    if (search.trim()) params.set('search', search.trim());
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
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
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="activity-log-page">
      <div className="max-w-5xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">لاگ فعالیت‌ها</h1>
        <p className="text-sm text-gray-500 mb-4">
          هر کاری که در برنامه انجام شده — ایجاد/ویرایش/حذف تسک‌ها، لیست‌ها، افراد،
          امور مالی، نوشته‌ها و … — این‌جا با زمان ثبت می‌شود. روی هر ردیف بزنید تا به
          همان بخش بروید.
        </p>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <form
          onSubmit={onFilter}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 flex flex-wrap items-center gap-2"
        >
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            data-testid="activity-filter-action"
            className="border border-gray-200 rounded-lg p-2 text-sm"
          >
            <option value="">همه عملیات</option>
            {Object.keys(VERB_FA).map((a) => (
              <option key={a} value={a}>
                {actionLabel(a)}
              </option>
            ))}
          </select>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            data-testid="activity-filter-entity"
            className="border border-gray-200 rounded-lg p-2 text-sm"
          >
            <option value="">همه بخش‌ها</option>
            {Object.entries(ENTITY_FA).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در عنوان / شرح…"
            data-testid="activity-filter-search"
            className="flex-1 min-w-[10rem] border border-gray-200 rounded-lg p-2 text-sm"
          />
          <label className="text-xs text-gray-500 flex items-center gap-1">
            از
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-200 rounded-lg p-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-gray-500 flex items-center gap-1">
            تا
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-200 rounded-lg p-1.5 text-sm"
            />
          </label>
          <button
            type="submit"
            className="bg-gray-800 text-white text-sm rounded-lg px-4 py-2 hover:bg-gray-700"
          >
            جستجو
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="bg-green-600 text-white text-sm rounded-lg px-4 py-2 hover:bg-green-700"
          >
            خروجی CSV
          </button>
        </form>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {!data || data.items.length === 0 ? (
            <p className="text-gray-400 text-sm p-6" data-testid="activity-log-empty">
              فعالیتی ثبت نشده است.
            </p>
          ) : (
            <table className="w-full text-sm" data-testid="activity-log-table">
              <thead>
                <tr className="text-right text-gray-500 border-b border-gray-100">
                  <th className="py-3 px-3 font-medium">زمان</th>
                  <th className="py-3 px-3 font-medium">عملیات</th>
                  <th className="py-3 px-3 font-medium">مورد</th>
                  <th className="py-3 px-3 font-medium">شرح</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((e) => {
                  const link = activityLink(e);
                  return (
                    <tr key={e.id} className="border-b border-gray-50 align-top">
                      <td className="py-2.5 px-3 text-gray-400 whitespace-nowrap text-xs">
                        {formatWhen(e.created_at)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                            ACTION_COLORS[e.action] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {actionLabel(e.action)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-700">
                        {link ? (
                          <button
                            type="button"
                            onClick={() => navigate(link)}
                            className="text-blue-600 hover:underline text-right"
                          >
                            {activityWhat(e)}
                            {e.entity_label ? ` — ${e.entity_label}` : ''}
                          </button>
                        ) : (
                          <span>
                            {activityWhat(e)}
                            {e.entity_label ? ` — ${e.entity_label}` : ''}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-gray-500">{e.detail || ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>
            {total} مورد · صفحه {page} از {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40"
            >
              قبلی
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40"
            >
              بعدی
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityLogPage;
