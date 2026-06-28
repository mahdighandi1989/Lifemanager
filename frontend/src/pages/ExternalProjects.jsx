import React, { useState, useEffect } from 'react';
import api from '../lib/api';

// External projects page (audit task d2146781, AC6): lists the third-party
// PM-tool projects the user mirrors. Reads GET /api/external-projects.

function ExternalProjects({ embedded = false }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [oversight, setOversight] = useState({ neglected: [], problems: [] });

  useEffect(() => {
    let active = true;
    api
      .get('/external-projects')
      .then((res) => active && setProjects(Array.isArray(res.data) ? res.data : []))
      .catch((e) => active && setError('خطا در دریافت پروژه‌ها: ' + (e.message || '')))
      .finally(() => active && setLoading(false));
    // Oversight summary — neglected projects + problems (the memo's
    // "مغفول مونده رو بگه ... فلان مشکل هست").
    api
      .get('/v1/oversight/neglected')
      .then((res) => active && setOversight(res.data || { neglected: [], problems: [] }))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50 py-8'} data-testid="external-projects-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {!embedded && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">پروژه‌های خارجی</h1>
            <p className="text-gray-500 mb-6">پروژه‌های متصل از ابزارهای مدیریت پروژهٔ شخص ثالث.</p>
          </>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>
        )}

        {/* Oversight: neglected projects + problems */}
        {(oversight.neglected?.length > 0 || oversight.problems?.length > 0) && (
          <div data-testid="oversight-summary" className="mb-6 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <h2 className="font-semibold text-amber-800 mb-2">رسیدگی و هشدارها</h2>
            {oversight.neglected?.length > 0 && (
              <p data-testid="oversight-neglected" className="text-sm text-amber-700">
                {oversight.neglected.length} پروژه مغفول مانده (مدتی همگام‌سازی نشده).
              </p>
            )}
            {oversight.problems?.length > 0 && (
              <p data-testid="oversight-problems" className="text-sm text-red-700">
                {oversight.problems.length} مورد مشکل‌دار (عقب‌افتاده).
              </p>
            )}
          </div>
        )}

        <div className="space-y-3" data-testid="external-projects-list">
          {loading ? (
            <div className="p-8 text-center text-gray-400">در حال بارگذاری...</div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
              هنوز پروژهٔ خارجی ثبت نشده است.
            </div>
          ) : (
            projects.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  {p.base_url && <p className="text-sm text-gray-500 mt-0.5">{p.base_url}</p>}
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                  {p.provider || '—'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ExternalProjects;
