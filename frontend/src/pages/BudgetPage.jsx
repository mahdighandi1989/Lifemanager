import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import FinanceGuardsPanel from '../components/FinanceGuardsPanel';

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
  const fromEmail = account.source === 'email';
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-900 truncate">{account.name}</h3>
          {fromEmail && (
            <span
              className="shrink-0 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 text-[10px]"
              title="این کارت خودکار از ایمیل‌های تو شناسایی شده — می‌تونی درستش کنی یا حذفش کنی"
            >
              از ایمیل
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-0.5">
          {KIND_LABELS[account.kind] || account.kind || 'حساب'}
          {account.institution ? ` · ${account.institution}` : ''}
        </p>
        {(account.account_ref || account.iban) && (
          <p className="text-[11px] text-gray-400 mt-0.5" dir="ltr">
            {account.iban || account.account_ref}
          </p>
        )}
      </div>
      <div className="text-left shrink-0">
        <div className="text-lg font-bold text-gray-900" dir="ltr">
          {(account.balance ?? 0).toLocaleString('fa-IR')}
        </div>
        <div className="text-xs text-gray-400">{account.currency || ''}</div>
      </div>
    </div>
  );
}

// One movement line — shared by the card preview and the full ledger.
function MovementLine({ m }) {
  return (
    <p className="flex items-center justify-between gap-2 text-[11px] text-gray-600">
      <span className="truncate">
        {m.date ? m.date : '—'} · {m.description || (m.source === 'attachment' ? 'از فایل' : 'از ایمیل')}
      </span>
      <span className={m.type === 'expense' ? 'text-red-600' : 'text-green-700'} dir="ltr">
        {m.type === 'expense' ? '−' : '+'}{Number(m.amount || 0).toLocaleString('fa-IR')} {m.currency || ''}
      </span>
    </p>
  );
}

function AccountRow({ account, onDelete, onEdited }) {
  // «این عدد از کجا آمد» + اصلاح دستی — عددِ خودِ مالک همیشه برنده است.
  const fixBalance = async () => {
    // eslint-disable-next-line no-alert
    const raw = window.prompt(
      `موجودی درست «${account.name}» به ${account.currency || ''}؟`,
      String(account.balance ?? ''),
    );
    if (raw === null || raw.trim() === '') return;
    const value = Number(raw.replace(/[,٬\s]/g, ''));
    if (Number.isNaN(value) || value < 0) return;
    try {
      await api.put(`/finance/accounts/${account.id}`, { balance: value });
      if (onEdited) onEdited();
    } catch {
      // خطا در ذخیره — کارت دست‌نخورده می‌ماند
    }
  };
  const movements = account.movements || [];
  // ریزِ گردش (2026-07-25): the card previews the last few movements; the full
  // ledger is one click away and loads on demand — «از این حساب چه چیزی در
  // فلان تاریخ کم شده» finally has a complete answer.
  const [ledger, setLedger] = useState(null);
  const [open, setOpen] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const total = account.txn_count || 0;

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (ledger === null && !loadingLedger) {
      setLoadingLedger(true);
      api
        .get(`/finance/accounts/${account.id}/transactions`)
        .then((res) => setLedger(Array.isArray(res.data?.transactions) ? res.data.transactions : []))
        .catch(() => setLedger([]))
        .finally(() => setLoadingLedger(false));
    }
  };

  return (
    <div className="space-y-1">
      <AccountCard account={account} />
      {(movements.length > 0 || onDelete) && (
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 space-y-0.5" dir="rtl">
          {/* شفافیت: منبعِ دقیق عدد موجودی، تا «چرا این عدد؟» بی‌جواب نماند */}
          {(account.balance_evidence || account.owner_balance_at) && (
            <p className="text-[10px] text-gray-400" data-testid={`account-evidence-${account.id}`}>
              {account.owner_balance_at
                ? '✍️ موجودی را خودت تنظیم کرده‌ای — فقط سیگنالِ جدیدتر می‌تواند عوضش کند'
                : <>خوانده‌شده از: <span dir="ltr">«{account.balance_evidence}»</span></>}
            </p>
          )}
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium text-gray-500">
              {movements.length > 0 ? 'آخرین تغییرها:' : ''}
            </p>
            <button
              type="button"
              data-testid={`account-fix-balance-${account.id}`}
              onClick={fixBalance}
              className="text-[11px] text-blue-600 hover:underline"
              title="موجودی درست را خودت وارد کن — عدد تو همیشه بر حدس ماشین مقدم است"
            >
              ✍️ اصلاح موجودی
            </button>
            {onDelete && (
              <button
                type="button"
                data-testid={`account-delete-${account.id}`}
                onClick={() => onDelete(account)}
                className="text-[11px] text-gray-400 hover:text-red-600"
                title="این حساب من نیست — کارت و تغییرهایش را پاک کن"
              >
                ✖ این حساب من نیست
              </button>
            )}
            {total > movements.length && (
              <button
                type="button"
                data-testid={`account-ledger-toggle-${account.id}`}
                onClick={toggle}
                className="text-[11px] text-blue-600 hover:underline"
              >
                {open ? 'بستن' : `ریزِ گردش (${total.toLocaleString('fa-IR')})`}
              </button>
            )}
          </div>
          {!open && movements.map((m, i) => <MovementLine key={i} m={m} />)}
          {open && (
            <div data-testid={`account-ledger-${account.id}`} className="max-h-64 overflow-y-auto space-y-0.5">
              {loadingLedger && <p className="text-[11px] text-gray-400">در حال بارگذاری…</p>}
              {ledger && ledger.length === 0 && !loadingLedger && (
                <p className="text-[11px] text-gray-400">تراکنشی ثبت نشده</p>
              )}
              {(ledger || []).map((m) => <MovementLine key={m.id} m={m} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BudgetPage({ embedded = false }) {
  const [accounts, setAccounts] = useState([]);
  // Per-currency totals from the server (audit #20). null → endpoint not
  // available / shape mismatch → fall back to grouping client-side.
  const [currencyBalances, setCurrencyBalances] = useState(null);
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

  // مالیِ خودتغذیه — pull accounts/balances out of the synced Gmail.
  const [scanning, setScanning] = useState(false);
  // «برو از اول بیاور» — the history sweep + the archive grouping (2026-07-25).
  const [sweeping, setSweeping] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [scanMsg, setScanMsg] = useState(null);
  const [cleaning, setCleaning] = useState(false);

  const loadAccounts = useCallback(() => {
    setLoading(true);
    api
      .get('/finance/accounts')
      .then((res) => setAccounts(Array.isArray(res.data) ? res.data : []))
      .catch((e) => setError('خطا در دریافت حساب‌ها: ' + (e.message || '')))
      .finally(() => setLoading(false));
    // Per-currency truth (audit #20): the server never sums across currencies.
    api
      .get('/finance/balances-by-currency')
      .then((res) => {
        const b = res.data?.balances;
        setCurrencyBalances(Array.isArray(b) ? b : null);
      })
      .catch(() => setCurrencyBalances(null));
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

  const scanEmails = async () => {
    setScanning(true);
    setScanMsg(null);
    try {
      const res = await api.post('/finance/scan-emails');
      const d = res.data || {};
      setScanMsg(
        `از ${d.scanned ?? 0} ایمیل: ${d.created ?? 0} حسابِ جدید ساخته شد و ${d.updated ?? 0} حساب به‌روز شد.`
      );
      loadAccounts();
    } catch (err) {
      setScanMsg('اسکنِ ایمیل‌ها ناموفق بود — شاید گوگل هنوز وصل نیست.');
    } finally {
      setScanning(false);
    }
  };

  // «برو همهٔ صورت‌حساب‌ها را از اول بیاور»: the mailbox mirror only ever held
  // the last 2 days, so the extractors had almost nothing to read. This pulls
  // the history first, then extracts.
  const deepSweep = async () => {
    setSweeping(true);
    setScanMsg(null);
    try {
      const res = await api.post('/inbox/deep-sweep', { months: 24, max_messages: 800 });
      const d = res.data || {};
      if (d.ok === false) {
        setScanMsg('آوردنِ تاریخچه ناموفق بود — احتمالاً گوگل وصل نیست.');
      } else {
        setScanMsg(
          `${d.mirrored_new ?? 0} ایمیلِ تازه از ${d.months ?? 24} ماهِ گذشته آورده شد؛ ` +
          `${d.attachment_candidates ?? 0} پیوستِ تازه خوانده شد، ` +
          `${d.finance_rechecked ?? 0} فایلِ مالیِ قبلی دوباره اعمال شد، ` +
          `${d.locked_files ?? 0} فایلِ رمزدار منتظرِ رمز است، و ` +
          `${d.accounts_created ?? 0} حسابِ تازه از ایمیل‌ها ساخته شد.`,
        );
      }
      loadAccounts();
    } catch {
      setScanMsg('آوردنِ تاریخچه ناموفق بود.');
    } finally {
      setSweeping(false);
    }
  };

  // «این حساب من نیست» — a wrong machine-made card must be removable; cleanup
  // only ever caught the empty ones (2026-07-25).
  const deleteAccount = async (account) => {
    if (!window.confirm(`کارتِ «${account.name}» و همهٔ تغییرهای ثبت‌شده‌اش پاک شود؟`)) return;
    try {
      const res = await api.delete(`/finance/accounts/${account.id}`);
      const d = res.data || {};
      setScanMsg(`کارتِ «${d.name || account.name}» پاک شد (${d.transactions_removed ?? 0} تراکنش).`);
      loadAccounts();
    } catch {
      setScanMsg('حذفِ کارت ناموفق بود.');
    }
  };

  const cleanupCards = async () => {
    setCleaning(true);
    setScanMsg(null);
    try {
      const res = await api.post('/finance/cleanup-auto-cards');
      const d = res.data || {};
      setScanMsg(
        d.removed
          ? `${d.removed} کارتِ اشتباهِ خودکار پاک شد (بدونِ موجودی و بدونِ تغییر).`
          : 'کارتِ اشتباهی برای پاک‌کردن نبود.',
      );
      loadAccounts();
    } catch {
      setScanMsg('پاک‌سازی ناموفق بود.');
    } finally {
      setCleaning(false);
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

  // NEVER a cross-currency sum (audit #20): a IRR account + a USD account has
  // no meaningful single total. Prefer the server's grouping; otherwise group
  // the loaded accounts by currency client-side.
  const balanceRows =
    currencyBalances ??
    Object.values(
      accounts.reduce((acc, a) => {
        const cur = (a.currency || '?').toUpperCase();
        acc[cur] = acc[cur] || { currency: cur, total: 0, accounts: 0 };
        acc[cur].total += Number(a.balance) || 0;
        acc[cur].accounts += 1;
        return acc;
      }, {}),
    ).sort((x, y) => y.total - x.total);

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

  // Live accounts first; the imported archive (pre-system Excel history) is
  // filed separately below so a 0.00 card from 2024 never leads the page.
  const liveAccounts = accounts.filter((a) => !a.archived);
  const archivedAccounts = accounts.filter((a) => a.archived);

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50 py-8'} data-testid="budget-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">برنامه و بودجه</h1>
            <p className="text-gray-500">حساب‌های مالی شما و موجودی به تفکیک ارز.</p>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <button
              type="button"
              onClick={scanEmails}
              disabled={scanning}
              data-testid="finance-scan-emails"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              title="ایمیل‌های همگام‌شدهٔ گوگل را می‌خواند و برای هر حسابی که پیدا کند کارت می‌سازد و موجودی را به‌روز می‌کند"
            >
              {scanning ? 'در حال خواندن ایمیل‌ها…' : '🔄 به‌روزرسانی از ایمیل‌ها'}
            </button>
            <button
              type="button"
              onClick={deepSweep}
              disabled={sweeping}
              data-testid="finance-deep-sweep"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              title="تا ۲۴ ماه عقب می‌رود، صورت‌حساب‌ها و پیوست‌های قدیمی را از ایمیل می‌آورد و بعد استخراج می‌کند — دکمهٔ بالایی فقط چیزی را می‌خواند که قبلاً آمده باشد"
            >
              {sweeping ? 'در حال آوردنِ تاریخچه…' : '📜 آوردنِ تاریخچهٔ ۲۴ ماه'}
            </button>
            <button
              type="button"
              onClick={cleanupCards}
              disabled={cleaning}
              data-testid="finance-cleanup-cards"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
              title="کارت‌هایی که ماشین اشتباه ساخته (بدونِ موجودی و بدونِ هیچ تغییری) پاک می‌شوند — کارت‌های خودت دست نمی‌خورند"
            >
              {cleaning ? 'در حال پاک‌سازی…' : '🧹 پاک‌سازیِ کارت‌های اشتباه'}
            </button>
            <button
              type="button"
              data-testid="finance-rebuild-cards"
              onClick={async () => {
                // eslint-disable-next-line no-alert
                if (!window.confirm(
                  'همهٔ کارت‌های ماشینی پاک و با موتورِ دقیقِ جدید از نو ساخته می‌شوند. کارت‌هایی که خودت ساخته‌ای دست نمی‌خورند. ادامه؟',
                )) return;
                setScanMsg(null);
                try {
                  const res = await api.post('/finance/rebuild-auto-cards');
                  const d = res.data || {};
                  setScanMsg(
                    `♻️ ${d.removed ?? 0} کارت ماشینی پاک شد و ${d.created ?? 0} کارت با موتور جدید ساخته شد.` +
                    ' برای فایل‌ها/پیوست‌ها «بازخوانی عمیق» را هم بزن.',
                  );
                  loadAccounts();
                } catch {
                  setScanMsg('بازتولید ناموفق بود.');
                }
              }}
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
              title="موجودی‌های غلطِ ثبت‌شده با موتور قدیمی؟ همه را پاک کن و بگذار موتور جدید از نو و درست بسازد"
            >
              ♻️ بازتولید از نو (اصلاح موجودی‌های غلط)
            </button>
          </div>
        </div>
        {scanMsg && (
          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700" dir="rtl">
            {scanMsg}
          </div>
        )}

        {/* نگهبان دقت: «حساب‌های من» + کارت‌های حذف‌شده (tombstones) */}
        <FinanceGuardsPanel onChanged={loadAccounts} />

        {/* Dashboard summary — one row per currency, never a cross-currency sum */}
        <div className="bg-gradient-to-l from-blue-600 to-blue-500 rounded-xl p-6 mb-6 text-white">
          <p className="text-blue-100 text-sm">موجودی به تفکیک ارز ({accounts.length} حساب)</p>
          <div className="mt-2 space-y-1.5" data-testid="budget-total">
            {balanceRows.length === 0 ? (
              <p className="text-3xl font-bold">۰</p>
            ) : (
              balanceRows.map((b) => (
                <div
                  key={b.currency}
                  data-testid={`budget-currency-${b.currency}`}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-blue-100 text-sm">
                    {b.currency}{' '}
                    <span className="text-blue-200 text-xs">
                      ({(b.accounts ?? 0).toLocaleString('fa-IR')} حساب)
                    </span>
                  </span>
                  <span className="text-2xl font-bold" dir="ltr">
                    {Number(b.total || 0).toLocaleString('fa-IR')}
                  </span>
                </div>
              ))
            )}
          </div>
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
            liveAccounts.map((a) => (
              <AccountRow key={a.id} account={a} onDelete={deleteAccount} onEdited={loadAccounts} />
            ))
          )}
        </div>

        {/* آرشیو — imported history (the Excel sheet from before this system
            existed). Kept in full, but it is not a live account and must not
            sit above the real ones. */}
        {archivedAccounts.length > 0 && (
          <div className="mt-6" data-testid="archived-accounts">
            <button
              type="button"
              data-testid="archived-toggle"
              onClick={() => setShowArchived((v) => !v)}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm"
            >
              <span className="text-gray-500">
                آرشیوِ واردشده ({archivedAccounts.length.toLocaleString('fa-IR')}) — دادهٔ قدیمی، پیش از این سیستم
              </span>
              <span className="text-xs font-medium text-blue-600">
                {showArchived ? 'بستن ▲' : 'نمایش ▼'}
              </span>
            </button>
            {showArchived && (
              <div className="mt-3 space-y-3">
                {archivedAccounts.map((a) => <AccountRow key={a.id} account={a} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetPage;
