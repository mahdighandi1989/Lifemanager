import React, { useEffect, useState } from 'react';
import BudgetPage from './BudgetPage';
import AssetsPage from './AssetsPage';
import ActivityLogPanel from '../components/ActivityLogPanel';
import api from '../lib/api';

// «مالی» hub — groups Budget + Assets as tabs (safe consolidation: the page
// components are reused unchanged via their `embedded` prop; no data logic is
// touched). Standalone routes still resolve here with the right initial tab.
// Phase 3 additions: «گزارش ماهانه» (audit #19 — the ledger was write-only)
// and «حساب‌های دیگر» (audit #7 — imported snapshots had no read surface).

// 2026-07-25 tidy-up: «دارایی‌ها» (film/book/scanned media) is not money, and
// its scanner only reads a server-side folder that does not exist on the
// deployment — so the tab could never fill. Quarantined from the bar; the
// AssetsPage, the /assets route and ?tab=assets all still work (see
// docs/overhaul/REMOVAL_CANDIDATES.md). It comes back the day the scan is
// wired to Drive.
const TABS = [
  { id: 'budget', label: 'برنامه و بودجه', match: ['/budget', '/finance'] },
  { id: 'reports', label: 'گزارش ماهانه', match: [] },
  { id: 'others', label: 'حساب‌های دیگر', match: [] },
  { id: 'log', label: 'لاگ مالی', match: [] },
];

const QUARANTINED_TABS = [
  { id: 'assets', label: 'دارایی‌ها (رسانه‌ای)', match: ['/assets'] },
];
const ALL_TABS = [...TABS, ...QUARANTINED_TABS];

const faNum = (n) => Number(n || 0).toLocaleString('fa-IR');

// Hand-rolled, dependency-free income/expense/net chart (CSP-safe — no chart
// library). One compact panel per currency (never mixes currencies): monthly
// income (green) vs expense (red) bars + the net (profit/loss) under each.
function MonthlyChart({ months }) {
  if (!months || months.length === 0) return null;
  const byCur = {};
  months.forEach((m) => {
    (m.currencies || []).forEach((c) => {
      if (!byCur[c.currency]) byCur[c.currency] = [];
      byCur[c.currency].push({
        month: m.month, income: c.income || 0, expense: c.expense || 0, net: c.net || 0,
      });
    });
  });
  const currencies = Object.keys(byCur);
  if (currencies.length === 0) return null;
  return (
    <div className="space-y-4" dir="rtl" data-testid="finance-charts">
      {currencies.map((cur) => {
        const series = byCur[cur];
        const max = Math.max(1, ...series.flatMap((s) => [s.income, s.expense]));
        return (
          <div
            key={cur}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            data-testid={`finance-chart-${cur}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                نمودارِ درآمد/هزینه — <span dir="ltr">{cur}</span>
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-green-500" />درآمد</span>
                <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-red-500" />هزینه</span>
              </div>
            </div>
            <div className="flex h-36 items-end justify-around gap-2">
              {series.map((s) => (
                <div key={s.month} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <div className="flex h-28 w-full items-end justify-center gap-1">
                    <div className="w-3 rounded-t bg-green-500" style={{ height: `${(s.income / max) * 100}%` }} title={`درآمد ${faNum(s.income)}`} />
                    <div className="w-3 rounded-t bg-red-500" style={{ height: `${(s.expense / max) * 100}%` }} title={`هزینه ${faNum(s.expense)}`} />
                  </div>
                  <span className="text-[10px] text-gray-500" dir="ltr">{s.month.slice(2)}</span>
                  <span className={`text-[10px] font-medium ${s.net < 0 ? 'text-red-600' : 'text-green-700'}`} dir="ltr">
                    {faNum(s.net)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── «گزارش ماهانه» — GET /api/finance/reports/monthly (audit #19) ──────────
function MonthlyReportsPanel() {
  const [months, setMonths] = useState(null); // null → loading
  const [txns, setTxns] = useState(null);
  const [open, setOpen] = useState({}); // `${month}|${currency}` → bool

  useEffect(() => {
    let active = true;
    api
      .get('/finance/reports/monthly?months=6')
      .then((r) => active && setMonths(Array.isArray(r.data?.months) ? r.data.months : []))
      .catch(() => active && setMonths([]));
    api
      .get('/finance/transactions')
      .then((r) => active && setTxns(Array.isArray(r.data) ? r.data : []))
      .catch(() => active && setTxns([]));
    return () => {
      active = false;
    };
  }, []);

  const latestTxns = (txns || [])
    .slice()
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 20);

  return (
    <div className="space-y-4" data-testid="monthly-reports-panel">
      {months === null && <p className="text-sm text-gray-400">در حال بارگذاری…</p>}
      {months !== null && months.length === 0 && (
        <p className="p-6 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
          هنوز گزارشی نیست — تراکنشی ثبت نشده.
        </p>
      )}
      {months !== null && months.length > 0 && <MonthlyChart months={months} />}
      {(months || [])
        .slice()
        .reverse()
        .map((m) => (
          <div key={m.month} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-2" dir="ltr">
              {m.month}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500">
                    <th className="py-1 text-right font-medium">ارز</th>
                    <th className="py-1 text-right font-medium">درآمد</th>
                    <th className="py-1 text-right font-medium">هزینه</th>
                    <th className="py-1 text-right font-medium">خالص</th>
                    <th className="py-1" />
                  </tr>
                </thead>
                <tbody>
                  {(m.currencies || []).map((c) => {
                    const key = `${m.month}|${c.currency}`;
                    const cats = c.by_category || [];
                    return (
                      <React.Fragment key={c.currency}>
                        <tr className="border-t border-gray-50">
                          <td className="py-1.5 font-medium text-gray-900">{c.currency}</td>
                          <td className="py-1.5 text-green-700" dir="ltr">{faNum(c.income)}</td>
                          <td className="py-1.5 text-red-600" dir="ltr">{faNum(c.expense)}</td>
                          <td
                            className={`py-1.5 font-semibold ${(c.net ?? 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}
                            dir="ltr"
                          >
                            {faNum(c.net)}
                          </td>
                          <td className="py-1.5 text-left">
                            {cats.length > 0 && (
                              <button
                                type="button"
                                data-testid={`report-cats-btn-${key}`}
                                onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {open[key] ? 'بستن ▲' : 'دسته‌ها ▼'}
                              </button>
                            )}
                          </td>
                        </tr>
                        {open[key] && cats.length > 0 && (
                          <tr>
                            <td colSpan={5} className="pb-2">
                              <ul
                                className="mt-1 space-y-0.5 rounded-lg bg-gray-50 p-2 text-xs text-gray-600"
                                data-testid={`report-cats-${key}`}
                              >
                                {cats.map((bc) => (
                                  <li key={bc.category} className="flex items-center justify-between gap-2">
                                    <span>{bc.category}</span>
                                    <span dir="ltr">{faNum(bc.amount)}</span>
                                  </li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      {/* Compact transactions list — the hub had no transactions surface, so
          the latest 20 rows (with the new category field) live here. */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4" data-testid="finance-transactions">
        <h3 className="font-semibold text-gray-900 mb-2">تراکنش‌ها (۲۰ مورد آخر)</h3>
        {txns === null ? (
          <p className="text-sm text-gray-400">در حال بارگذاری…</p>
        ) : latestTxns.length === 0 ? (
          <p className="text-sm text-gray-400">چیزی ثبت نشده</p>
        ) : (
          <ul className="divide-y divide-gray-50 text-sm">
            {latestTxns.map((t) => (
              <li key={t.id} className="py-1.5 flex items-center justify-between gap-2">
                <span className="truncate text-gray-800">
                  {t.description || (t.transaction_type === 'income' ? 'واریز' : 'برداشت')}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {t.category && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                      {t.category}
                    </span>
                  )}
                  {(t.timestamp || t.created_at) && (
                    <span className="text-[11px] text-gray-400" dir="ltr">
                      {String(t.timestamp || t.created_at).slice(0, 10)}
                    </span>
                  )}
                  <span
                    className={t.transaction_type === 'income' ? 'text-green-700' : 'text-red-600'}
                    dir="ltr"
                  >
                    {t.transaction_type === 'income' ? '+' : '−'}
                    {faNum(t.amount)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── «حساب‌های دیگر» — read-only snapshot cards (audit #7) ──────────────────
// Every card fails open: a missing/errored endpoint renders «چیزی ثبت نشده».
function SnapshotCard({ title, loaded, empty, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      {!loaded ? (
        <p className="text-sm text-gray-400">در حال بارگذاری…</p>
      ) : empty ? (
        <p className="text-sm text-gray-400">چیزی ثبت نشده</p>
      ) : (
        children
      )}
    </div>
  );
}

function OtherAccountsPanel() {
  const [loaded, setLoaded] = useState(false);
  const [subs, setSubs] = useState([]);
  const [neteller, setNeteller] = useState(null);
  const [rta, setRta] = useState(null);
  const [sheets, setSheets] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      api.get('/subscriptions'),
      api.get('/neteller/wallet'),
      api.get('/rta/dashboard'),
      api.get('/bank-accounts/share-sheets'),
    ]).then(([s, n, r, b]) => {
      if (!active) return;
      if (s.status === 'fulfilled' && Array.isArray(s.value.data)) setSubs(s.value.data);
      if (n.status === 'fulfilled' && n.value.data) setNeteller(n.value.data);
      if (r.status === 'fulfilled' && r.value.data) setRta(r.value.data);
      if (b.status === 'fulfilled' && Array.isArray(b.value.data)) setSheets(b.value.data);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="other-accounts-panel">
      <SnapshotCard title="📺 اشتراک‌ها" loaded={loaded} empty={subs.length === 0}>
        <ul className="space-y-1.5 text-sm" data-testid="other-subscriptions">
          {subs.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2">
              <span className="text-gray-800">
                {s.provider}
                {s.plan && <span className="text-xs text-gray-400"> — {s.plan}</span>}
              </span>
              {s.next_payment_date && (
                <span className="text-[11px] text-gray-500" dir="ltr">{s.next_payment_date}</span>
              )}
            </li>
          ))}
        </ul>
      </SnapshotCard>

      <SnapshotCard title="💳 نتلر" loaded={loaded} empty={!neteller}>
        {neteller && (
          <div className="text-sm text-gray-700 space-y-1" data-testid="other-neteller">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-500">موجودی</span>
              <span className="font-semibold" dir="ltr">
                {faNum(neteller.balance)} {neteller.currency || ''}
              </span>
            </div>
            {neteller.account_holder_name && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500">دارنده حساب</span>
                <span dir="ltr">{neteller.account_holder_name}</span>
              </div>
            )}
            {neteller.loyalty_points != null && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500">امتیاز وفاداری</span>
                <span dir="ltr">{faNum(neteller.loyalty_points)}</span>
              </div>
            )}
          </div>
        )}
      </SnapshotCard>

      <SnapshotCard title="🚗 RTA / سالیک" loaded={loaded} empty={!rta}>
        {rta && (
          <div className="text-sm text-gray-700 space-y-1" data-testid="other-rta">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-500">موجودی سالیک</span>
              <span className="font-semibold" dir="ltr">
                {faNum(rta.salik_balance)} {rta.currency_symbol || ''}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-500">موجودی پارکینگ</span>
              <span dir="ltr">{faNum(rta.parking_balance)} {rta.currency_symbol || ''}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-500">جریمه‌های قابل پرداخت</span>
              <span dir="ltr">{faNum(rta.fines_payable)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-500">نقاط سیاه</span>
              <span dir="ltr">{faNum(rta.black_points)}</span>
            </div>
          </div>
        )}
      </SnapshotCard>

      <SnapshotCard title="🏦 شیت‌های بانکی" loaded={loaded} empty={sheets.length === 0}>
        <ul className="space-y-2 text-sm" data-testid="other-share-sheets">
          {sheets.map((sh) => (
            <li key={sh.id} className="flex items-center justify-between gap-2">
              <span className="text-gray-800">
                {sh.bank_name || 'بانک'}
                {sh.account_holder && (
                  <span className="text-xs text-gray-400"> — {sh.account_holder}</span>
                )}
              </span>
              {sh.available_balance != null && (
                <span className="font-semibold" dir="ltr">
                  {faNum(sh.available_balance)} {sh.currency_symbol || ''}
                </span>
              )}
            </li>
          ))}
        </ul>
      </SnapshotCard>
    </div>
  );
}

function initialTab() {
  try {
    const { pathname, search } = window.location;
    const q = new URLSearchParams(search).get('tab');
    if (q && ALL_TABS.some((t) => t.id === q)) return q;
    const hit = ALL_TABS.find((t) => t.match.some((p) => pathname.startsWith(p)));
    if (hit) return hit.id;
  } catch { /* no window */ }
  return 'budget';
}

function FinanceHub() {
  const [tab, setTab] = useState(initialTab());
  // /assets (or ?tab=assets) still lands on its panel — and then its tab shows
  // in the bar so the user can see where they are.
  const visibleTabs = TABS.some((t) => t.id === tab)
    ? TABS
    : [...TABS, ...QUARANTINED_TABS.filter((t) => t.id === tab)];
  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="finance-hub">
      <div className="max-w-4xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">مالی</h1>
        <div className="flex gap-1 mb-6 border-b border-gray-200" data-testid="finance-tabs">
          {visibleTabs.map((t) => (
            <button
              key={t.id}
              data-testid={`finance-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
                tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div data-testid={`finance-panel-${tab}`}>
          {tab === 'budget' && <BudgetPage embedded />}
          {tab === 'assets' && <AssetsPage embedded />}
          {tab === 'reports' && <MonthlyReportsPanel />}
          {tab === 'others' && <OtherAccountsPanel />}
          {tab === 'log' && (
            <ActivityLogPanel
              entityType="income,asset,account,transaction"
              title="لاگ مالی"
              pageSize={25}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default FinanceHub;
