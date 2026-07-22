import React, { useEffect, useState } from 'react';
import api from '../lib/api';

// «خودنگاره» — the owner's self-model: interests + a willpower/diligence index
// with trend + history, inferred from writings/wishes/tasks over time.
const CAT_FA = {
  technology: 'فناوری', sport: 'ورزش', art: 'هنر', reading: 'مطالعه',
  cooking: 'آشپزی', travel: 'سفر', finance: 'مالی', general: 'عمومی',
};

const TREND_FA = {
  صعودی: { label: 'صعودی ↗', cls: 'text-green-700' },
  نزولی: { label: 'نزولی ↘', cls: 'text-red-600' },
  پایدار: { label: 'پایدار →', cls: 'text-gray-600' },
};

function scoreColor(s) {
  if (s >= 70) return 'text-green-600';
  if (s >= 40) return 'text-amber-600';
  return 'text-red-600';
}

function SelfPortrait() {
  const [data, setData] = useState(null); // null → loading
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const r = await api.get('/ai/self_model');
      setData(r.data || {});
    } catch {
      setData({});
    }
  };
  useEffect(() => { load(); }, []);

  const refresh = async () => {
    setBusy(true);
    try {
      await api.post('/ai/self_model/refresh');
      await load();
    } catch {
      /* best-effort */
    } finally {
      setBusy(false);
    }
  };

  const dil = data?.diligence || {};
  const interests = data?.interests || {};
  const history = data?.history || [];
  const trend = TREND_FA[dil.trend] || TREND_FA['پایدار'];
  const maxH = Math.max(1, ...history.map((h) => h.score || 0));

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">خودنگاره — علاقه‌ها و اراده</h1>
          <p className="text-sm text-gray-500 mt-1">
            از نوشته‌ها، آرزوها و پیگیریِ کارهایت به‌مرورِ زمان استخراج می‌شود.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={busy}
          data-testid="self-model-refresh"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? 'در حالِ محاسبه…' : '🔄 به‌روزرسانی'}
        </button>
      </div>

      {data === null && <p className="text-gray-400">در حال بارگذاری…</p>}

      {data !== null && (
        <>
          {/* Willpower / diligence */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" data-testid="diligence-card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">شاخصِ اراده و اهتمام</h2>
            {!dil.has_signal ? (
              <p className="text-sm text-gray-500">
                هنوز دادهٔ کافی نیست — چند کار/آرزو ثبت و پیگیری کن تا شاخص شکل بگیرد.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-8">
                <div className="text-center">
                  <div className={`text-6xl font-extrabold ${scoreColor(dil.score)}`} dir="ltr">
                    {dil.score}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">از ۱۰۰</div>
                  <div className={`text-sm font-medium mt-1 ${trend.cls}`}>{trend.label}</div>
                </div>
                <div className="flex-1 min-w-[14rem] space-y-2 text-sm">
                  <Rate label="پیگیریِ فرمان‌ها" value={dil.directive_rate} />
                  <Rate label="اتمامِ کارها" value={dil.task_rate} />
                  <Rate label="اتمامِ آیتم‌های لیست" value={dil.todo_rate} />
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                    <span>نهادینه‌شده: <b>{dil.graduated || 0}</b></span>
                    <span>بهترین زنجیره: <b dir="ltr">{dil.best_streak || 0}</b></span>
                    <span className={dil.overdue ? 'text-red-600' : ''}>
                      عقب‌افتاده: <b dir="ltr">{dil.overdue || 0}</b>
                    </span>
                  </div>
                </div>
                {history.length > 1 && (
                  <div className="flex items-end gap-1 h-20" data-testid="diligence-history">
                    {history.map((h, i) => (
                      <div
                        key={i}
                        className="w-2 rounded-t bg-blue-400"
                        style={{ height: `${((h.score || 0) / maxH) * 100}%` }}
                        title={`${h.score}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" data-testid="interests-card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">علاقه‌ها</h2>
            {(interests.categories || []).length === 0 ? (
              <p className="text-sm text-gray-500">
                هنوز الگویی پیدا نشد — هرچه بیشتر بنویسی و کار ثبت کنی، دقیق‌تر می‌شود.
              </p>
            ) : (
              <div className="space-y-3">
                {(interests.categories || []).map((c) => (
                  <div key={c.category} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-sm font-medium text-gray-800">
                      {CAT_FA[c.category] || c.category}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(c.terms || []).map((t) => (
                        <span key={t} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700" dir="auto">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Rate({ label, value }) {
  if (value == null) return null;
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span dir="ltr">{pct}%</span>
      </div>
      <div className="mt-0.5 h-2 w-full rounded-full bg-gray-100">
        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default SelfPortrait;
