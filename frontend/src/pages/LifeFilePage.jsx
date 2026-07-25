import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

/**
 * پروندهٔ زندگی — the owner's documents.
 *
 * 2026-07-25 tidy-up (per the whole-app survey): this page used to render six
 * cards, FOUR of which (RTA/سالیک، اشتراک‌ها، نتلر، شیت‌های بانکی) were the
 * SAME endpoints already rendered by the «حساب‌های دیگر» tab of «مالی» — two
 * parallel renders of one truth. Money now lives in «مالی» only; this page is
 * the documents file, and it finally has manual entry forms — the documents
 * are deliberately NOT auto-read (passport OCR is too risky to trust), so
 * without a form this page could only ever stay empty.
 *
 * Nothing was removed from the backend: every endpoint and the FinanceHub
 * rendering are untouched (see docs/overhaul/REMOVAL_CANDIDATES.md).
 *
 * Every card fetches its own endpoint independently and fail-opens: a 4xx /
 * network error / empty list renders the «چیزی ثبت نشده» state — one broken
 * router can never blank the whole page.
 *
 * NOTE: خودرو (vehicle) has no GET endpoint — app/routes/vehicle.py only
 * exposes stateless POST /extract parsers — so there is no vehicle card yet.
 */

// --- date helpers --------------------------------------------------------

/** Parse "YYYY-MM-DD" (ISO) or "DD/MM/YYYY" (card print) → Date | null. */
export function parseCardDate(value) {
  if (!value) return null;
  const s = String(value).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t);
}

/** Whole days from today until `date` (negative = already past). */
export function daysUntil(date) {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

/** Expiry line: «N روز مانده» (red when < 30) or «منقضی شده». */
function ExpiryCountdown({ value }) {
  const days = daysUntil(parseCardDate(value));
  if (days === null) return null;
  const urgent = days < 30;
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        days < 0
          ? 'bg-red-100 text-red-700'
          : urgent
            ? 'bg-red-50 text-red-600'
            : 'bg-green-50 text-green-700'
      }`}
    >
      {days < 0 ? 'منقضی شده' : `${days} روز مانده`}
    </span>
  );
}

// --- generic card shell --------------------------------------------------

const EMPTY_TEXT = 'چیزی ثبت نشده';

/**
 * One independent card: runs `fetcher` once, then renders via `children`
 * (a render-prop receiving the payload). error/empty → «چیزی ثبت نشده».
 */
function LifeCard({ title, testid, fetcher, isEmpty, children, refreshKey = 0, action = null }) {
  const [state, setState] = useState({ loading: true, data: null, error: false });

  useEffect(() => {
    let alive = true;
    fetcher()
      .then((res) => {
        if (alive) setState({ loading: false, data: res.data, error: false });
      })
      .catch(() => {
        if (alive) setState({ loading: false, data: null, error: true });
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const empty =
    state.error || state.data == null || (isEmpty ? isEmpty(state.data) : false);

  return (
    <div
      data-testid={testid}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
    >
      <h2 className="text-sm font-semibold text-gray-900 mb-3">{title}</h2>
      {state.loading ? (
        <p className="text-gray-400 text-sm">در حال بارگذاری…</p>
      ) : empty ? (
        <p className="text-gray-400 text-sm" data-testid={`${testid}-empty`}>
          {EMPTY_TEXT}
        </p>
      ) : (
        children(state.data)
      )}
      {action}
    </div>
  );
}

/**
 * فرمِ ثبتِ دستی — a small collapsible form under a document card.
 *
 * `fields` = [{name, label, type?, required?}]. Submits the non-empty values
 * to `endpoint` and calls `onSaved` so the card refetches.
 */
function ManualEntry({ testid, endpoint, fields, label = '+ ثبت دستی', onSaved }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    const body = {};
    fields.forEach((f) => {
      const v = String(values[f.name] ?? '').trim();
      if (v) body[f.name] = v;
    });
    const missing = fields.find((f) => f.required && !body[f.name]);
    if (missing) {
      setMsg(`«${missing.label}» لازم است`);
      return;
    }
    setBusy(true);
    setMsg(null);
    api
      .post(endpoint, body)
      .then(() => {
        setValues({});
        setOpen(false);
        if (onSaved) onSaved();
      })
      .catch((err) => setMsg('ثبت نشد: ' + (err?.response?.data?.detail || err.message || '')))
      .finally(() => setBusy(false));
  };

  if (!open) {
    return (
      <button
        type="button"
        data-testid={`${testid}-open`}
        onClick={() => setOpen(true)}
        className="mt-3 text-xs text-blue-600 hover:underline"
      >
        {label}
      </button>
    );
  }
  return (
    <form onSubmit={submit} data-testid={testid} className="mt-3 space-y-2 border-t border-gray-100 pt-3">
      {fields.map((f) => (
        <label key={f.name} className="block text-xs text-gray-500">
          {f.label}
          {f.required ? ' *' : ''}
          <input
            data-testid={`${testid}-${f.name}`}
            type={f.type || 'text'}
            value={values[f.name] || ''}
            onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
            className="mt-1 block w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
            dir={f.type === 'date' || f.ltr ? 'ltr' : 'rtl'}
          />
        </label>
      ))}
      {msg && <p className="text-xs text-red-600" data-testid={`${testid}-msg`}>{msg}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          data-testid={`${testid}-submit`}
          disabled={busy}
          className="bg-blue-600 text-white text-xs rounded-lg px-3 py-1.5 hover:bg-blue-700 disabled:opacity-60"
        >
          {busy ? 'در حال ثبت…' : 'ثبت'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setMsg(null); }}
          className="text-xs text-gray-500 hover:text-gray-700 px-2"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}

const Row = ({ label, value }) =>
  value == null || value === '' ? null : (
    <div className="flex items-center justify-between gap-2 text-sm py-0.5">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-800 truncate" dir="ltr">
        {value}
      </span>
    </div>
  );

// --- the page ------------------------------------------------------------

function LifeFilePage() {
  // Adding a document must show up immediately — bump the key to refetch.
  const [refresh, setRefresh] = useState(0);
  const reload = () => setRefresh((n) => n + 1);

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="life-file-page">
      <div className="max-w-5xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">پروندهٔ زندگی</h1>
        <p className="text-sm text-gray-500 mb-6">
          مدارک و اسنادِ رسمی‌ات — با شمارش معکوس انقضا. این‌ها عمداً خودکار خوانده
          نمی‌شوند (خطای OCRِ پاسپورت گران تمام می‌شود)، پس خودت ثبتشان کن.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* مدارک هویتی — GET /api/documents/identity */}
          <LifeCard
            title="مدارک هویتی"
            testid="life-card-identity"
            fetcher={() => api.get('/documents/identity')}
            isEmpty={(d) => !Array.isArray(d) || d.length === 0}
            refreshKey={refresh}
            action={
              <ManualEntry
                testid="identity-manual"
                endpoint="/documents/identity"
                onSaved={reload}
                fields={[
                  { name: 'full_name', label: 'نام کامل', required: true },
                  { name: 'emirates_id_number', label: 'شمارهٔ اقامت', ltr: true },
                  { name: 'passport_number', label: 'شمارهٔ پاسپورت', ltr: true },
                  { name: 'expiry_date', label: 'تاریخ انقضا', type: 'date' },
                ]}
              />
            }
          >
            {(docs) => (
              <div className="space-y-3">
                {docs.map((doc) => (
                  <div key={doc.id} className="border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {doc.full_name || 'بدون نام'}
                      </span>
                      <ExpiryCountdown value={doc.expiry_date} />
                    </div>
                    <Row label="شمارهٔ اقامت" value={doc.emirates_id_number} />
                    <Row label="پاسپورت" value={doc.passport_number} />
                    <Row label="انقضا" value={doc.expiry_date} />
                  </div>
                ))}
              </div>
            )}
          </LifeCard>

          {/* گواهینامهٔ امارات — GET /api/documents/uae-license */}
          <LifeCard
            title="گواهینامهٔ امارات"
            testid="life-card-uae-license"
            fetcher={() => api.get('/documents/uae-license')}
            isEmpty={(d) => !Array.isArray(d) || d.length === 0}
            refreshKey={refresh}
            action={
              /* /extract validates a structured mapping directly, so the same
                 endpoint stores a hand-typed licence (idempotent on شماره). */
              <ManualEntry
                testid="license-manual"
                endpoint="/documents/uae-license/extract"
                onSaved={reload}
                fields={[
                  { name: 'license_no', label: 'شمارهٔ گواهینامه', required: true, ltr: true },
                  { name: 'name_en', label: 'نام (لاتین)', required: true, ltr: true },
                  { name: 'expiry_date', label: 'تاریخ انقضا', type: 'date' },
                  { name: 'place_of_issue', label: 'محل صدور', ltr: true },
                ]}
              />
            }
          >
            {(rows) => (
              <div className="space-y-3">
                {rows.map((lic) => (
                  <div key={lic.id} className="border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {lic.name_en || lic.name_ar || 'بدون نام'}
                      </span>
                      <ExpiryCountdown value={lic.expiry_date} />
                    </div>
                    <Row label="شمارهٔ گواهینامه" value={lic.license_no} />
                    <Row label="انقضا" value={lic.expiry_date} />
                    <Row label="محل صدور" value={lic.place_of_issue} />
                  </div>
                ))}
              </div>
            )}
          </LifeCard>

          {/* RTA/سالیک، اشتراک‌ها، نتلر و شیت‌های بانکی از این‌جا برداشته شدند —
              همان endpointها عیناً در تبِ «حساب‌های دیگر»ِ صفحهٔ مالی رندر
              می‌شوند. یک حقیقت، یک جا. */}
          <div
            data-testid="life-card-money-moved"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">پول و حساب‌ها</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                سالیک و جریمه‌ها، اشتراک‌ها، نتلر و شیت‌های بانکی همه در صفحهٔ «مالی»‌اند —
                همان‌جا که موجودی و گردش حساب‌ها هم هست.
              </p>
            </div>
            <Link
              to="/budget?tab=others"
              data-testid="life-file-to-finance"
              className="mt-3 inline-block text-xs text-blue-600 hover:underline"
            >
              رفتن به «مالی» ← حساب‌های دیگر
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LifeFilePage;
