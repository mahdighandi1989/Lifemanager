import React, { useState } from 'react';
import BudgetPage from './BudgetPage';
import AssetsPage from './AssetsPage';

// «مالی» hub — groups Budget + Assets as tabs (safe consolidation: the page
// components are reused unchanged via their `embedded` prop; no data logic is
// touched). Standalone routes still resolve here with the right initial tab.

const TABS = [
  { id: 'budget', label: 'برنامه و بودجه', match: ['/budget', '/finance'] },
  { id: 'assets', label: 'دارایی‌ها', match: ['/assets'] },
];

function initialTab() {
  try {
    const { pathname, search } = window.location;
    const q = new URLSearchParams(search).get('tab');
    if (q && TABS.some((t) => t.id === q)) return q;
    const hit = TABS.find((t) => t.match.some((p) => pathname.startsWith(p)));
    if (hit) return hit.id;
  } catch { /* no window */ }
  return 'budget';
}

function FinanceHub() {
  const [tab, setTab] = useState(initialTab());
  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="finance-hub">
      <div className="max-w-4xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">مالی</h1>
        <div className="flex gap-1 mb-6 border-b border-gray-200" data-testid="finance-tabs">
          {TABS.map((t) => (
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
        </div>
      </div>
    </div>
  );
}

export default FinanceHub;
