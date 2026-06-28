import React, { useState } from 'react';
import api from '../lib/api';

// Smart suggestions surface (audit task 2165524b, AC5): posts the current
// ambient context to POST /api/v1/context/analyze and renders the engine's
// task suggestions. Optional signals (heart rate / ambient noise) let the
// user see how the context engine reacts.

const KIND_STYLES = {
  focus: 'border-green-200 bg-green-50',
  movement: 'border-amber-200 bg-amber-50',
  defer: 'border-red-200 bg-red-50',
  general: 'border-gray-200 bg-gray-50',
};

function SmartAssistant({ embedded = false }) {
  const [heartRate, setHeartRate] = useState('');
  const [noise, setNoise] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ran, setRan] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const body = {};
      if (heartRate) body.heart_rate = Number(heartRate);
      if (noise) body.noise_db = Number(noise);
      const res = await api.post('/v1/context/analyze', body);
      setSuggestions(res.data?.suggestions || []);
      setRan(true);
    } catch (e) {
      setError('خطا در تحلیل وضعیت: ' + (e.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50 py-8'} data-testid="smart-assistant-page">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">پیشنهادات هوشمند</h1>
        <p className="text-gray-500 mb-6">
          بر اساس وضعیت فعلی شما، موتور زمینه پیشنهادهای کار را تولید می‌کند.
        </p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            <label className="text-sm text-gray-600">
              ضربان قلب (اختیاری)
              <input
                type="number"
                data-testid="assistant-heart-rate"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="mt-1 block w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="مثلاً 65"
              />
            </label>
            <label className="text-sm text-gray-600">
              نویز محیط dB (اختیاری)
              <input
                type="number"
                data-testid="assistant-noise"
                value={noise}
                onChange={(e) => setNoise(e.target.value)}
                className="mt-1 block w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="مثلاً 40"
              />
            </label>
            <button
              type="button"
              data-testid="assistant-analyze-btn"
              onClick={analyze}
              disabled={loading}
              className="bg-blue-600 text-white rounded-lg px-5 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'در حال تحلیل…' : 'تحلیل وضعیت فعلی'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-3" data-testid="assistant-suggestions">
          {ran && suggestions.length === 0 && !error && (
            <div className="p-6 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
              پیشنهادی تولید نشد.
            </div>
          )}
          {suggestions.map((s, i) => (
            <div
              key={i}
              className={`rounded-xl border p-4 ${KIND_STYLES[s.kind] || KIND_STYLES.general}`}
            >
              <p className="text-sm font-medium text-gray-900">{s.text}</p>
              <p className="text-xs text-gray-400 mt-1">{s.kind}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SmartAssistant;
