import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

// PersonalityProfilePage (audit task 14e65214, Step 6 AC34): shows the user's
// analyzed Big-Five profile and lets them (re)run the analysis. Reads
// GET /api/ai/personality/profile; the button POSTs /api/ai/personality/analyze.
const DIMENSIONS = [
  { key: 'openness', label: 'گشودگی به تجربه' },
  { key: 'conscientiousness', label: 'وظیفه‌شناسی' },
  { key: 'extraversion', label: 'برون‌گرایی' },
  { key: 'agreeableness', label: 'سازگاری' },
  { key: 'neuroticism', label: 'حساسیت هیجانی' },
];

function PersonalityProfilePage({ embedded = false }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    api
      .get('/ai/personality/profile')
      .then((res) => setProfile(res.data))
      .catch((e) => setError('خطا در دریافت پروفایل: ' + (e.message || '')));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const analyze = () => {
    setLoading(true);
    setError(null);
    api
      .post('/ai/personality/analyze', {})
      .then((res) => setProfile(res.data))
      .catch((e) => setError('خطا در تحلیل: ' + (e.message || '')))
      .finally(() => setLoading(false));
  };

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50 py-8'} data-testid="personality-profile-page">
      <div className="max-w-3xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">پروفایل شخصیت</h1>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <button
          data-testid="analyze-personality-btn"
          onClick={analyze}
          disabled={loading}
          className="mb-6 bg-blue-600 text-white text-sm rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'در حال تحلیل…' : 'تحلیل شخصیت من'}
        </button>

        {profile && profile.summary && (
          <p data-testid="personality-summary" className="text-gray-700 mb-4">
            {profile.summary}
          </p>
        )}

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          {DIMENSIONS.map(({ key, label }) => {
            const value = profile && typeof profile[key] === 'number' ? profile[key] : null;
            return (
              <div key={key} data-testid={`trait-${key}`}>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>{label}</span>
                  <span>{value !== null ? Math.round(value * 100) + '٪' : '—'}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded">
                  <div
                    className="h-2 bg-indigo-500 rounded"
                    style={{ width: value !== null ? `${value * 100}%` : '0%' }}
                  />
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

export default PersonalityProfilePage;
