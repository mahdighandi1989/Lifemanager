import React, { useEffect, useState } from 'react';
import api from '../lib/api';

/**
 * پروندهٔ زندگی — read-only inventory of the "life routers" that had data
 * but no UI (audit #9): identity documents, UAE driving licence, RTA/Salik,
 * subscriptions, Neteller wallet and bank share-sheets.
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
function LifeCard({ title, testid, fetcher, isEmpty, children }) {
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
  }, []);

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
    </div>
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
  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="life-file-page">
      <div className="max-w-5xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">پروندهٔ زندگی</h1>
        <p className="text-sm text-gray-500 mb-6">
          همهٔ مدارک، اشتراک‌ها و حساب‌های زندگی در یک نگاه — با شمارش معکوس انقضا.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* مدارک هویتی — GET /api/documents/identity */}
          <LifeCard
            title="مدارک هویتی"
            testid="life-card-identity"
            fetcher={() => api.get('/documents/identity')}
            isEmpty={(d) => !Array.isArray(d) || d.length === 0}
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

          {/* RTA / سالیک — GET /api/rta/dashboard (404 when empty) */}
          <LifeCard
            title="RTA / سالیک"
            testid="life-card-rta"
            fetcher={() => api.get('/rta/dashboard')}
          >
            {(rta) => (
              <div>
                <Row
                  label="موجودی سالیک"
                  value={`${rta.salik_balance ?? 0} ${rta.currency_symbol || ''}`.trim()}
                />
                <Row
                  label="موجودی پارکینگ"
                  value={`${rta.parking_balance ?? 0} ${rta.currency_symbol || ''}`.trim()}
                />
                <Row
                  label="جریمه‌ها"
                  value={(rta.fines_payable ?? 0) + (rta.fines_non_payable ?? 0)}
                />
                <Row label="امتیاز منفی" value={rta.black_points ?? 0} />
              </div>
            )}
          </LifeCard>

          {/* اشتراک‌ها — GET /api/subscriptions */}
          <LifeCard
            title="اشتراک‌ها"
            testid="life-card-subscriptions"
            fetcher={() => api.get('/subscriptions')}
            isEmpty={(d) => !Array.isArray(d) || d.length === 0}
          >
            {(subs) => (
              <div className="space-y-3">
                {subs.map((s) => (
                  <div key={s.id} className="border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                    <span className="text-sm font-medium text-gray-800 block mb-0.5" dir="ltr">
                      {s.provider}
                    </span>
                    <Row label="پلن" value={s.plan} />
                    <Row label="پرداخت بعدی" value={s.next_payment_date} />
                  </div>
                ))}
              </div>
            )}
          </LifeCard>

          {/* نتلر — GET /api/neteller/wallet (404 when empty) */}
          <LifeCard
            title="کیف پول نتلر"
            testid="life-card-neteller"
            fetcher={() => api.get('/neteller/wallet')}
          >
            {(w) => (
              <div>
                <Row
                  label="آخرین موجودی"
                  value={`${w.balance ?? 0} ${w.currency || ''}`.trim()}
                />
                <Row label="امتیاز وفاداری" value={w.loyalty_points} />
                <Row label="دارنده" value={w.account_holder_name} />
              </div>
            )}
          </LifeCard>

          {/* شیت‌های بانکی — GET /api/bank-accounts/share-sheets */}
          <LifeCard
            title="شیت‌های بانکی"
            testid="life-card-bank-sheets"
            fetcher={() => api.get('/bank-accounts/share-sheets')}
            isEmpty={(d) => !Array.isArray(d) || d.length === 0}
          >
            {(sheets) => (
              <div className="space-y-3">
                {sheets.map((b) => (
                  <div key={b.id} className="border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                    <span className="text-sm font-medium text-gray-800 block mb-0.5">
                      {b.bank_name || b.account_holder || 'حساب بانکی'}
                    </span>
                    <Row
                      label="موجودی"
                      value={
                        b.available_balance == null
                          ? null
                          : `${b.available_balance} ${b.currency_symbol || ''}`.trim()
                      }
                    />
                    <Row label="نوع حساب" value={b.account_type} />
                  </div>
                ))}
              </div>
            )}
          </LifeCard>
        </div>
      </div>
    </div>
  );
}

export default LifeFilePage;
