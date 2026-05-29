import React, { useState, useEffect } from 'react';
import api from '../lib/api';

// Asset dashboard (audit task 217909d2, AC4): lists scanned assets grouped by
// type (movie / book / document / ...). Reads GET /api/assets.

const TYPE_LABELS = {
  movie: 'فیلم',
  book: 'کتاب',
  document: 'سند',
  file: 'فایل',
};

function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get('/assets')
      .then((res) => active && setAssets(Array.isArray(res.data) ? res.data : []))
      .catch((e) => active && setError('خطا در دریافت دارایی‌ها: ' + (e.message || '')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const groups = assets.reduce((acc, a) => {
    const t = a.asset_type || 'file';
    (acc[t] = acc[t] || []).push(a);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="assets-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">دارایی‌ها</h1>
        <p className="text-gray-500 mb-6">فایل‌ها و رسانه‌های اسکن‌شده، به تفکیک نوع.</p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="p-8 text-center text-gray-400">در حال بارگذاری...</div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
            هنوز دارایی‌ای اسکن نشده است.
          </div>
        ) : (
          <div className="space-y-6" data-testid="assets-by-type">
            {Object.entries(groups).map(([type, items]) => (
              <section key={type}>
                <h2 className="text-sm font-semibold text-gray-500 mb-2">
                  {TYPE_LABELS[type] || type} ({items.length})
                </h2>
                <div className="space-y-2">
                  {items.map((a) => (
                    <div
                      key={a.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-800">{a.name}</span>
                      {a.path && <span className="text-xs text-gray-400 truncate max-w-[40%]">{a.path}</span>}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssetsPage;
