import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import DeduplicationPanel from '../components/deduplication/DeduplicationPanel';

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
