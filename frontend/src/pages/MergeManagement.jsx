import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import DeduplicationPanel from '../components/deduplication/DeduplicationPanel';

const KIND_FA = {
  task: 'کار',
  project: 'پروژه',
  list: 'لیست',
  todo: 'آیتم لیست',
  subscription: 'اشتراک',
};

// «آشغالِ تستی» — find rows that look like leftover test data (test/تست/…) and
// remove the selected ones reversibly (soft-delete markers). Owner: «چرا هنوز
// آشغالِ تستی توش می‌بینم».
function TestJunkSection() {
  const [items, setItems] = useState(null);
  const [checked, setChecked] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const scan = useCallback(async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await api.get('/cleanup/test-junk');
      const found = res.data?.items || [];
      setItems(found);
      // Pre-check the reversible ones (safe to remove); leave hard-deletes off.
      const init = {};
      found.forEach((it) => { init[`${it.kind}:${it.id}`] = !!it.reversible; });
      setChecked(init);
    } catch {
      setMsg({ ok: false, text: 'خطا در اسکن' });
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { scan(); }, [scan]);

  const toggle = (key) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  const removeSelected = async () => {
    const sel = (items || []).filter((it) => checked[`${it.kind}:${it.id}`]);
    if (!sel.length) return;
    setBusy(true);
    try {
      const res = await api.post('/cleanup/test-junk/remove', {
        items: sel.map((it) => ({ kind: it.kind, id: it.id })),
      });
      setMsg({ ok: true, text: `${res.data?.total || 0} مورد پاک شد (برگشت‌پذیر).` });
      await scan();
    } catch {
      setMsg({ ok: false, text: 'خطا در پاک‌سازی' });
    } finally {
      setBusy(false);
    }
  };

  const selectedCount = (items || []).filter((it) => checked[`${it.kind}:${it.id}`]).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6" dir="rtl" data-testid="test-junk-panel">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-gray-900">🧹 آشغالِ تستی</h2>
        <button
          type="button"
          onClick={scan}
          disabled={busy}
          className="text-xs text-blue-600 hover:underline disabled:opacity-50"
        >
          اسکنِ دوباره
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        ردیف‌هایی که نامشان مثلِ «test / تست / sample» است. حذف برگشت‌پذیر است (به سطلِ زباله/آرشیو می‌رود)؛
        فقط اشتراک‌ها حذفِ کامل می‌شوند (تیکشان پیش‌فرض خاموش است).
      </p>

      {msg && (
        <p className={`text-xs mb-2 ${msg.ok ? 'text-green-700' : 'text-red-600'}`}>{msg.text}</p>
      )}

      {items === null ? (
        <p className="text-sm text-gray-400">در حال اسکن…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">آشغالِ تستی‌ای پیدا نشد ✔</p>
      ) : (
        <>
          <div className="space-y-1.5 mb-3">
            {items.map((it) => {
              const key = `${it.kind}:${it.id}`;
              return (
                <label
                  key={key}
                  className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={!!checked[key]}
                    onChange={() => toggle(key)}
                    data-testid={`junk-${key}`}
                  />
                  <span className="shrink-0 rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-[11px]">
                    {KIND_FA[it.kind] || it.kind}
                  </span>
                  <span className="flex-1 truncate text-gray-800">{it.label}</span>
                  {!it.reversible && (
                    <span className="shrink-0 text-[11px] text-red-500">حذفِ کامل</span>
                  )}
                </label>
              );
            })}
          </div>
          <button
            type="button"
            onClick={removeSelected}
            disabled={busy || selectedCount === 0}
            data-testid="junk-remove-btn"
            className="rounded-lg bg-red-600 text-white text-sm px-4 py-2 hover:bg-red-700 disabled:opacity-50"
          >
            پاک‌کردنِ {selectedCount} موردِ انتخاب‌شده
          </button>
        </>
      )}
    </div>
  );
}

// Merge management page (audit task fbd9bd36, AC5 + AC7): shows duplicate-task
// suggestions from POST /api/merge/suggestions and a "تأیید ادغام" button per
// group that calls POST /api/merge/execute.

function MergeManagement({ embedded = false }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [merging, setMerging] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.post('/merge/suggestions', {});
      setSuggestions(res.data?.suggestions || []);
      setError(null);
    } catch (e) {
      setError('خطا در دریافت پیشنهادهای ادغام: ' + (e.message || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirmMerge = async (entityIds) => {
    setMerging(entityIds[0]);
    try {
      await api.post('/merge/execute', { merge_type: 'task', entity_ids: entityIds });
      await load();
    } catch (e) {
      setError('خطا در ادغام: ' + (e.message || ''));
    } finally {
      setMerging(null);
    }
  };

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50 py-8'} data-testid="merge-page">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">ادغام تسک‌های مشابه</h1>
        <p className="text-gray-500 mb-6">
          {suggestions.length > 0
            ? `${suggestions.length} گروه تسک مشابه پیدا شد.`
            : 'تسک‌های مشابه برای ادغام شناسایی می‌شوند.'}
        </p>

        {/* Test-junk finder — remove leftover «test» rows reversibly. */}
        <TestJunkSection />

        {/* Cross-entity deduplication (audit task fbd9bd36 AC4): scan + merge
            similar tasks / projects / lists. */}
        <div className="mb-6">
          <DeduplicationPanel />
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="p-8 text-center text-gray-400">در حال بارگذاری...</div>
        ) : suggestions.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
            تسک تکراری‌ای پیدا نشد.
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((s, i) => (
              <div
                key={i}
                data-testid="merge-suggestion"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
              >
                <ul className="mb-3 space-y-1">
                  {(s.tasks || []).map((t) => (
                    <li key={t.id} className="text-sm text-gray-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                      {t.title}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  data-testid="merge-confirm-btn"
                  disabled={merging === s.entity_ids?.[0]}
                  onClick={() => confirmMerge(s.entity_ids)}
                  className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {merging === s.entity_ids?.[0] ? 'در حال ادغام…' : 'تأیید ادغام'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MergeManagement;
