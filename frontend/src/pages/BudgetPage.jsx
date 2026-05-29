import React, { useState, useEffect } from 'react';
import api from '../lib/api';

// Budget page (audit task 4ae4b3ca, AC3 + AC6): lists the user's financial
// accounts (the AccountList) with a small Dashboard summary on top. Reads
// GET /api/finance/accounts via the shared axios client (JWT auto-attached).

const KIND_LABELS = {
  bank: 'بانک',
  broker_forex: 'بروکر/فارکس',
  exchange_iranian: 'صرافی ایرانی',
  exchange_foreign: 'صرافی خارجی',
  cash: 'نقد',
};

function AccountCard({ account }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-gray-900">{account.name}</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          {KIND_LABELS[account.kind] || account.kind || 'حساب'}
        </p>
      </div>
      <div className="text-left">
        <div className="text-lg font-bold text-gray-900">
          {(account.balance ?? 0).toLocaleString('fa-IR')}
        </div>
        <div className="text-xs text-gray-400">{account.currency || ''}</div>
      </div>
    </div>
  );
}

function BudgetPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get('/finance/accounts')
      .then((res) => {
        if (active) setAccounts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((e) => active && setError('خطا در دریافت حساب‌ها: ' + (e.message || '')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const total = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="budget-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">برنامه و بودجه</h1>
        <p className="text-gray-500 mb-6">حساب‌های مالی شما و موجودی کل.</p>

        {/* Dashboard summary */}
        <div className="bg-gradient-to-l from-blue-600 to-blue-500 rounded-xl p-6 mb-6 text-white">
          <p className="text-blue-100 text-sm">موجودی کل ({accounts.length} حساب)</p>
          <p className="text-3xl font-bold mt-1" data-testid="budget-total">
            {total.toLocaleString('fa-IR')}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-3" data-testid="account-list">
          {loading ? (
            <div className="p-8 text-center text-gray-400">در حال بارگذاری...</div>
          ) : accounts.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
              هنوز حسابی ثبت نشده است.
            </div>
          ) : (
            accounts.map((a) => <AccountCard key={a.id} account={a} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default BudgetPage;
