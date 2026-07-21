import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { unescapeHtml } from '../lib/text';

// «ایمنی داده» panel (Settings → ایمنی داده tab, data-safety phase 0).
// Three cards, each with its own load/error state, all through the shared
// axios client (baseURL '/api'):
//   1. اقدامات مالک  → GET /api/settings/owner-actions (queue of one-time
//      owner actions: env vars / Google-console clicks; live-checked where
//      the app can verify, done=null when it cannot).
//   2. پشتیبان‌گیری  → GET /api/backup/status + POST /api/backup/run +
//      a plain <a href> to GET /api/backup/export (a navigation downloads,
//      an XHR would not).
//   3. سطل زباله     → GET /api/trash + restore/purge per row. Purge is the
//      only hard delete and sits behind a window.confirm.

const faDateTime = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('fa-IR');
  } catch {
    return iso;
  }
};

const faSize = (bytes) => {
  if (bytes == null) return null;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
};

function Card({ title, badge, testId, children }) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4"
      data-testid={testId}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {badge}
      </div>
      {children}
    </div>
  );
}

// --- کارت ۱: اقدامات مالک -------------------------------------------------

function OwnerActionsCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState({});

  useEffect(() => {
    api
      .get('/settings/owner-actions')
      .then((res) => setData(res.data || {}))
      .catch(() => setError('خطا در دریافت اقدامات مالک'))
      .finally(() => setLoading(false));
  }, []);

  const actions = data?.actions || [];
  const pending = data?.pending_count ?? 0;

  return (
    <Card
      title="اقدامات مالک"
      testId="owner-actions-card"
      badge={
        !loading && !error ? (
          <span
            data-testid="owner-actions-pending"
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              pending > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {pending > 0 ? `${pending} مورد در انتظار` : 'همه انجام شده'}
          </span>
        ) : null
      }
    >
      {loading && <div className="text-sm text-gray-400">در حال بارگذاری...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && actions.length === 0 && (
        <div className="text-sm text-gray-400">اقدامی ثبت نشده است</div>
      )}
      {!loading && !error && (
        <div>
          {actions.map((a) => (
            <div
              key={a.key}
              data-testid={`owner-action-row-${a.key}`}
              className="py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm" aria-hidden="true">
                  {a.done === true ? '✅' : a.done === false ? '⛔' : '➖'}
                </span>
                <span className="text-sm text-gray-800 flex-1">{a.title}</span>
                {a.done === null && (
                  <span className="text-xs text-gray-400">قابل بررسی از داخل اپ نیست</span>
                )}
                <button
                  type="button"
                  data-testid={`owner-action-how-${a.key}`}
                  onClick={() => setOpen((o) => ({ ...o, [a.key]: !o[a.key] }))}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  چطور؟
                </button>
              </div>
              {open[a.key] && (
                <div className="mt-1 mr-6 text-xs text-gray-500 leading-5" dir="rtl">
                  <div>{a.how}</div>
                  {a.detail && <div className="text-gray-400 mt-0.5">{a.detail}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// --- کارت ۲: پشتیبان‌گیری --------------------------------------------------

function BackupCard() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const loadStatus = useCallback(() => {
    setLoading(true);
    api
      .get('/backup/status')
      // the route nests the blob under `status`; tolerate a flat shape too
      .then((res) => setStatus(res.data?.status || res.data || {}))
      .catch(() => setError('خطا در دریافت وضعیت بکاپ'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const runNow = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await api.post('/backup/run');
      const data = res.data || {};
      setMsg({
        kind: data.ok === false ? 'error' : 'success',
        text: data.detail_fa || (data.ok === false ? 'پشتیبان‌گیری ناموفق بود' : 'پشتیبان‌گیری انجام شد'),
      });
      loadStatus();
    } catch (e) {
      const detail = e?.response?.data?.detail || e.message || '';
      setMsg({ kind: 'error', text: 'خطا در اجرای بکاپ: ' + detail });
    } finally {
      setBusy(false);
    }
  };

  const size = faSize(status?.last_size_bytes);

  return (
    <Card title="پشتیبان‌گیری" testId="backup-card">
      {loading && <div className="text-sm text-gray-400">در حال بارگذاری...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && status && (
        <>
          <div className="mb-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">آخرین بکاپ موفق</span>
              <span
                data-testid="backup-last-ok"
                className={`text-sm font-medium ${
                  status.is_stale ? 'text-amber-600' : 'text-green-600'
                }`}
              >
                {status.last_ok_at ? faDateTime(status.last_ok_at) : 'هنوز بکاپ موفقی ثبت نشده'}
                {status.is_stale && status.last_ok_at ? ' (قدیمی!)' : ''}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">گوگل درایو</span>
              <span
                className={`text-sm font-medium ${
                  status.drive_configured ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {status.drive_configured ? 'متصل است' : 'متصل نیست (ذخیرهٔ محلی)'}
              </span>
            </div>
            {status.last_file_name && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">آخرین فایل</span>
                <span className="text-sm text-gray-800" dir="ltr">
                  {status.last_file_name}
                  {size ? ` — ${size}` : ''}
                </span>
              </div>
            )}
            {status.last_error && (
              <div className="py-2 text-xs text-red-500" dir="rtl">
                آخرین خطا: <span dir="ltr">{status.last_error}</span>
              </div>
            )}
          </div>

          {status.is_stale && (
            <div className="mb-3 rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-700">
              بکاپ تازه‌ای ثبت نشده — بهتر است همین حالا یک «بکاپ فوری» بگیری.
            </div>
          )}

          {msg && (
            <div
              data-testid="backup-msg"
              className={`mb-3 rounded-xl p-3 text-sm ${
                msg.kind === 'success'
                  ? 'bg-green-50 border border-green-100 text-green-700'
                  : 'bg-red-50 border border-red-100 text-red-600'
              }`}
            >
              {msg.text}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="backup-run-btn"
              onClick={runNow}
              disabled={busy}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? 'در حال پشتیبان‌گیری...' : 'بکاپ فوری'}
            </button>
            {/* navigation (not XHR) so the browser saves the file */}
            <a
              data-testid="backup-export-link"
              href="/api/backup/export"
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"
            >
              <span dir="rtl">دانلود کامل داده‌ها (JSON)</span>
            </a>
          </div>
        </>
      )}
    </Card>
  );
}

// --- کارت ۳: سطل زباله ----------------------------------------------------

function TrashCard() {
  const [items, setItems] = useState([]);
  const [writings, setWritings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);

  const loadTrash = useCallback(() => {
    setLoading(true);
    api
      .get('/trash')
      .then((res) => {
        setItems(res.data?.items || []);
        setWritings(res.data?.writings || []);
      })
      .catch(() => setError('خطا در دریافت سطل زباله'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTrash();
  }, [loadTrash]);

  const act = async (key, fn, okText) => {
    setBusy(key);
    setMsg(null);
    try {
      await fn();
      setMsg({ kind: 'success', text: okText });
      loadTrash();
    } catch (e) {
      const detail = e?.response?.data?.detail || e.message || '';
      setMsg({ kind: 'error', text: 'خطا: ' + detail });
    } finally {
      setBusy('');
    }
  };

  const restoreItem = (it) =>
    act(`item-restore-${it.id}`, () => api.post(`/trash/todo-items/${it.id}/restore`), 'آیتم بازیابی شد ✅');

  const purgeItem = (it) => {
    if (
      !window.confirm(
        `«${unescapeHtml(it.content)}» برای همیشه حذف می‌شود و به هیچ روشی قابل بازگشت نیست. مطمئنی؟`,
      )
    )
      return;
    act(`item-purge-${it.id}`, () => api.delete(`/trash/todo-items/${it.id}`), 'آیتم برای همیشه حذف شد');
  };

  const restoreWriting = (w) =>
    act(`writing-restore-${w.id}`, () => api.post(`/trash/writings/${w.id}/restore`), 'نوشته بازیابی شد ✅');

  const purgeWriting = (w) => {
    if (
      !window.confirm(
        `نوشتهٔ «${unescapeHtml(w.title)}» برای همیشه حذف می‌شود و به هیچ روشی قابل بازگشت نیست. مطمئنی؟`,
      )
    )
      return;
    act(`writing-purge-${w.id}`, () => api.delete(`/trash/writings/${w.id}`), 'نوشته برای همیشه حذف شد');
  };

  const rowButtons = (restoreKey, purgeKey, onRestore, onPurge) => (
    <div className="flex gap-2 shrink-0">
      <button
        type="button"
        data-testid={restoreKey}
        onClick={onRestore}
        disabled={!!busy}
        className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50"
      >
        بازیابی
      </button>
      <button
        type="button"
        data-testid={purgeKey}
        onClick={onPurge}
        disabled={!!busy}
        className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 disabled:opacity-50"
      >
        حذف قطعی
      </button>
    </div>
  );

  const empty = !loading && !error && items.length === 0 && writings.length === 0;

  return (
    <Card
      title="سطل زباله"
      testId="trash-card"
      badge={
        !loading && !error && !empty ? (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {items.length + writings.length} مورد
          </span>
        ) : null
      }
    >
      {loading && <div className="text-sm text-gray-400">در حال بارگذاری...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {msg && (
        <div
          data-testid="trash-msg"
          className={`mb-3 rounded-xl p-3 text-sm ${
            msg.kind === 'success'
              ? 'bg-green-50 border border-green-100 text-green-700'
              : 'bg-red-50 border border-red-100 text-red-600'
          }`}
        >
          {msg.text}
        </div>
      )}

      {empty && (
        <div data-testid="trash-empty" className="text-sm text-gray-500">
          سطل زباله خالی است 🎉
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-1">آیتم‌های لیست</h4>
          {items.map((it) => (
            <div
              key={it.id}
              data-testid={`trash-item-${it.id}`}
              className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0"
            >
              <div className="min-w-0">
                <div className="text-sm text-gray-800 truncate">{unescapeHtml(it.content)}</div>
                <div className="text-xs text-gray-400">حذف‌شده در {faDateTime(it.deleted_at)}</div>
              </div>
              {rowButtons(
                `trash-restore-item-${it.id}`,
                `trash-purge-item-${it.id}`,
                () => restoreItem(it),
                () => purgeItem(it),
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !error && writings.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">نوشته‌ها</h4>
          {writings.map((w) => (
            <div
              key={w.id}
              data-testid={`trash-writing-${w.id}`}
              className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0"
            >
              <div className="min-w-0">
                <div className="text-sm text-gray-800 truncate">
                  {unescapeHtml(w.title)}
                  {w.category ? <span className="text-gray-400"> — {w.category}</span> : null}
                </div>
                <div className="text-xs text-gray-400">حذف‌شده در {faDateTime(w.deleted_at)}</div>
              </div>
              {rowButtons(
                `trash-restore-writing-${w.id}`,
                `trash-purge-writing-${w.id}`,
                () => restoreWriting(w),
                () => purgeWriting(w),
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// --- پنل اصلی ---------------------------------------------------------------

function DataSafetyPanel() {
  return (
    <div dir="rtl" data-testid="data-safety-panel">
      <h2 className="text-xl font-bold text-gray-900 mb-1">ایمنی داده</h2>
      <p className="text-gray-500 text-sm mb-5">
        وضعیت محافظت از دادهٔ زندگی: اقدامات یک‌بارهٔ مالک، بکاپ شبانه و بازیابی موارد حذف‌شده.
      </p>
      <OwnerActionsCard />
      <BackupCard />
      <TrashCard />
    </div>
  );
}

export default DataSafetyPanel;
