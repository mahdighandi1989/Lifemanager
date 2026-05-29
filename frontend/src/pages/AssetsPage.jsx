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
  const [scanPath, setScanPath] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (e) {
      setError('خطا در دریافت دارایی‌ها: ' + (e.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanPath.trim()) return;
    setScanning(true);
    setScanMsg(null);
    try {
      const res = await api.post('/assets/scan', { path: scanPath.trim() });
      setScanMsg(`اسکن کامل شد: ${res.data?.inserted ?? 0} مورد جدید از ${res.data?.scanned ?? 0} فایل.`);
      setScanPath('');
      await load();
    } catch (err) {
      setError('خطا در اسکن: ' + (err.message || ''));
    } finally {
      setScanning(false);
    }
  };

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

        {/* Scan trigger (AC5: add a path to scan) */}
        <form
          onSubmit={handleScan}
          data-testid="asset-scan-form"
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex gap-3"
        >
          <input
            type="text"
            data-testid="asset-scan-path"
            value={scanPath}
            onChange={(e) => setScanPath(e.target.value)}
            placeholder="مسیر پوشه برای اسکن (مثلاً /media)"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm"
          />
          <button
            type="submit"
            data-testid="asset-scan-btn"
            disabled={scanning || !scanPath.trim()}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {scanning ? 'در حال اسکن…' : 'اسکن'}
          </button>
        </form>
        {scanMsg && (
          <div className="mb-4 bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-green-700">{scanMsg}</div>
        )}

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
