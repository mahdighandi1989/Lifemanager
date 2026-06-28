import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

// Budget page (audit task 4ae4b3ca). Lists the user's financial accounts with
// a summary, a budget-aware purchase check (AC 12), and an AI budget insight
// (AC 13). Reachable at both /budget and /finance.

const KIND_LABELS = {
  bank: 'بانک',
  broker: 'بروکر/فارکس',
  exchange: 'صرافی',
  broker_forex: 'بروکر/فارکس',
  exchange_iranian: 'صرافی ایرانی',
  exchange_foreign: 'صرافی خارجی',
  cash: 'نقد',
};

const PRIORITY_LABELS = {
  blocked: 'بیش از بودجه — متوقف',
  high: 'اولویت بالا (به‌راحتی در بودجه)',
  normal: 'اولویت متوسط',
  low: 'در بودجه ولی سنگین',
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

function BudgetPage({ embedded = false }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Purchase check (AC 12)
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [evalResult, setEvalResult] = useState(null);

  // AI insight (AC 13)
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);

  // Manual entry forms (the raw memo's first ask — "اینجا ثبت بکنم").
  const [acctForm, setAcctForm] = useState({ name: '', kind: 'bank', balance: '', currency: 'IRR' });
  const [incomeForm, setIncomeForm] = useState({ description: '', amount: '', currency: 'IRR' });

  const loadAccounts = useCallback(() => {
    setLoading(true);
    api
      .get('/finance/accounts')
      .then((res) => setAccounts(Array.isArray(res.data) ? res.data : []))
      .catch((e) => setError('خطا در دریافت حساب‌ها: ' + (e.message || '')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const addAccount = async (e) => {
    e.preventDefault();
    if (!acctForm.name.trim()) return;
    try {
      await api.post('/finance/accounts', {
        name: acctForm.name,
        kind: acctForm.kind,
        balance: Number(acctForm.balance) || 0,
        currency: acctForm.currency || null,
      });
      setAcctForm({ name: '', kind: 'bank', balance: '', currency: 'IRR' });
      loadAccounts();
    } catch (err) {
      setError('خطا در افزودن حساب: ' + (err.message || ''));
    }
  };

  const addIncome = async (e) => {
    e.preventDefault();
    if (!incomeForm.description.trim()) return;
    try {
      await api.post('/finance/incomes', {
        description: incomeForm.description,
        amount: Number(incomeForm.amount) || 0,
        currency: incomeForm.currency || null,
      });
      setIncomeForm({ description: '', amount: '', currency: 'IRR' });
    } catch (err) {
      setError('خطا در افزودن درآمد: ' + (err.message || ''));
    }
  };

  const total = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const checkPurchase = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/finance/budget/evaluate', {
        amount: Number(amount) || 0,
        label: label || null,
      });
      setEvalResult(res.data);
    } catch (err) {
      setEvalResult({ error: err.message });
    }
  };

  const fetchInsight = async () => {
    setInsightLoading(true);
    try {
      // Dedicated finance analysis endpoint (task 4ae4b3ca AC 13): wires the
      // user's accounts/budget/planned purchases into ai_service and returns
      // free-text advice plus a per-purchase affordability verdict.
      const res = await api.get('/finance/insights');
      const data = res.data || {};
      const lines = [];
      if (data.analysis) lines.push(data.analysis);
      (data.suggestions || []).forEach((s) => {
        lines.push(`• ${s.title}: ${s.recommendation} (${s.estimated_cost})`);
      });
      setInsight(lines.length ? lines.join('\n') : 'پاسخی دریافت نشد.');
    } catch (err) {
      // FEATURE_AI_ENABLED off -> 403; degrade gracefully.
      setInsight(
        err?.response?.status === 403
          ? 'تحلیل هوش مصنوعی غیرفعال است (FEATURE_AI_ENABLED).'
          : 'خطا در تحلیل: ' + (err.message || ''),
      );
    } finally {
      setInsightLoading(false);
    }
  };

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50 py-8'} data-testid="budget-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">برنامه و بودجه</h1>
        <p className="text-gray-500 mb-6">حساب‌های مالی شما و موجودی کل.</p>

        {/* Dashboard summary */}
        <div className="bg-gradient-to-l from-blue-600 to-blue-500 rounded-xl p-6 mb-6 text-white">
          <p className="text-blue-100 text-sm">موجودی کل ({accounts.length} حساب)</p>
          <p className="text-3xl font-bold mt-1" data-testid="budget-total">
            {total.toLocaleString('fa-IR')}
          </p>
        </div>

        {/* Manual entry — record accounts + incomes (raw memo: "اینجا ثبت بکنم") */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6" data-testid="add-account">
          <h2 className="font-semibold text-gray-900 mb-3">افزودن حساب</h2>
          <form onSubmit={addAccount} className="flex flex-wrap gap-2">
            <input
              data-testid="account-name-input"
              value={acctForm.name}
              onChange={(e) => setAcctForm({ ...acctForm, name: e.target.value })}
              placeholder="نام حساب (بانک/بروکر/صرافی)"
              className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
            />
            <select
              data-testid="account-kind-select"
              value={acctForm.kind}
              onChange={(e) => setAcctForm({ ...acctForm, kind: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="bank">بانک</option>
              <option value="broker">بروکر/فارکس</option>
              <option value="exchange">صرافی</option>
            </select>
            <input
              data-testid="account-balance-input"
              type="number"
              value={acctForm.balance}
              onChange={(e) => setAcctForm({ ...acctForm, balance: e.target.value })}
              placeholder="موجودی"
              className="border rounded-lg px-3 py-2 text-sm w-28"
            />
            <input
              data-testid="account-currency-input"
              value={acctForm.currency}
              onChange={(e) => setAcctForm({ ...acctForm, currency: e.target.value })}
              placeholder="ارز"
              className="border rounded-lg px-3 py-2 text-sm w-20"
            />
            <button type="submit" data-testid="add-account-btn" className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700">
              ثبت حساب
            </button>
          </form>

          <h2 className="font-semibold text-gray-900 mt-4 mb-3">افزودن درآمد</h2>
          <form onSubmit={addIncome} className="flex flex-wrap gap-2">
            <input
              data-testid="income-desc-input"
              value={incomeForm.description}
              onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
              placeholder="شرح درآمد"
              className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
            />
            <input
              data-testid="income-amount-input"
              type="number"
              value={incomeForm.amount}
              onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
              placeholder="مبلغ"
              className="border rounded-lg px-3 py-2 text-sm w-28"
            />
            <button type="submit" data-testid="add-income-btn" className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-green-700">
              ثبت درآمد
            </button>
          </form>
        </div>

        {/* Budget-aware purchase check (AC 12) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6" data-testid="purchase-check">
          <h2 className="font-semibold text-gray-900 mb-3">بررسی خرید بر اساس بودجه</h2>
          <form onSubmit={checkPurchase} className="flex flex-wrap gap-2">
            <input
              data-testid="purchase-amount-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="مبلغ خرید"
              className="border rounded-lg px-3 py-2 text-sm flex-1"
            />
            <input
              data-testid="purchase-label-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="عنوان (اختیاری)"
              className="border rounded-lg px-3 py-2 text-sm flex-1"
            />
            <button type="submit" data-testid="purchase-check-btn" className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700">
              بررسی
            </button>
          </form>
          {evalResult && !evalResult.error && (
            <div
              data-testid="purchase-result"
              className={`mt-3 text-sm rounded-lg p-3 ${
                evalResult.affordable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {evalResult.affordable ? 'در بودجه است. ' : 'فراتر از بودجه! '}
              اولویت: {PRIORITY_LABELS[evalResult.priority] || evalResult.priority}
              {' — '}بودجهٔ قابل‌دسترس: {Number(evalResult.available_budget).toLocaleString('fa-IR')}
            </div>
          )}
        </div>

        {/* AI budget insight (AC 13) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6" data-testid="ai-insight">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">تحلیل هوش مصنوعی بودجه</h2>
            <button data-testid="ai-insight-btn" onClick={fetchInsight} disabled={insightLoading} className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-indigo-700 disabled:opacity-50">
              {insightLoading ? 'در حال تحلیل...' : 'تحلیل کن'}
            </button>
          </div>
          {insight && (
            <p data-testid="ai-insight-text" className="text-sm text-gray-700 whitespace-pre-wrap">
              {insight}
            </p>
          )}
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
